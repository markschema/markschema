import path from 'node:path'
import {
  compareIssueShape,
  evaluateScenario,
  extractScenariosFromContent,
  parseJsonSafe,
  readUtf8,
  walkMarkdownFiles,
} from './doc-examples-lib.mjs'

const docsRoot = path.resolve('docs')
const files = walkMarkdownFiles(docsRoot)
const issues = []

function addIssue(file, line, message) {
  issues.push(`${file}:${line}: ${message}`)
}

for (const file of files) {
  const content = readUtf8(file)
  const { scenarios } = extractScenariosFromContent(file, content)

  scenarios.forEach((scenario, index) => {
    const scenarioLabel = `scenario #${index + 1}`

    if (scenario.parseError) {
      addIssue(file, scenario.line, `${scenarioLabel} has invalid structure (${scenario.parseError})`)
      return
    }

    const evaluation = evaluateScenario(scenario)
    if (!evaluation.ok) {
      addIssue(file, scenario.line, `${scenarioLabel} is non-executable (${evaluation.reason}): ${evaluation.detail}`)
      return
    }

    if (evaluation.normalizedSchema.trim() !== scenario.schemaCode.trim()) {
      addIssue(file, scenario.line, `${scenarioLabel} schema snippet is not normalized to current mdshape API`)
    }

    const docSuccess = parseJsonSafe(scenario.successJson)
    if (!docSuccess || docSuccess.success !== true) {
      addIssue(file, scenario.line, `${scenarioLabel} Success JSON is invalid or missing "success": true`)
      return
    }

    const docSuccessData = docSuccess.data
    if (docSuccessData === undefined) {
      addIssue(file, scenario.line, `${scenarioLabel} Success JSON must contain "data"`)
      return
    }

    const runtimeData = evaluation.validResult.data
    if (JSON.stringify(docSuccessData) !== JSON.stringify(runtimeData)) {
      addIssue(
        file,
        scenario.line,
        `${scenarioLabel} Success JSON data does not exactly match runtime data`,
      )
    }

    const runtimeInvalid = evaluation.invalidResult
    if (runtimeInvalid.success !== false || !Array.isArray(runtimeInvalid.error?.issues) || runtimeInvalid.error.issues.length === 0) {
      addIssue(file, scenario.line, `${scenarioLabel} runtime invalid input did not produce issues`)
      return
    }

    const docError = parseJsonSafe(scenario.errorJson)
    if (!docError || docError.success !== false) {
      addIssue(file, scenario.line, `${scenarioLabel} Error JSON is invalid or missing "success": false`)
      return
    }

    const docIssues = docError.error?.issues
    if (!Array.isArray(docIssues) || docIssues.length === 0) {
      addIssue(file, scenario.line, `${scenarioLabel} Error JSON must include at least one issue entry`)
      return
    }

    const runtimeIssues = runtimeInvalid.error.issues
    if (!compareIssueShape(docIssues, runtimeIssues)) {
      addIssue(file, scenario.line, `${scenarioLabel} Error JSON issues do not match runtime invalid issues`)
    }
  })
}

if (issues.length > 0) {
  console.error('Documentation example runtime check failed:')
  for (const issue of issues) {
    console.error(`- ${issue}`)
  }
  process.exit(1)
}

console.log('docs example runtime ok')
