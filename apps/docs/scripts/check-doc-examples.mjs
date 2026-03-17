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
const skipped = []

function addIssue(file, line, message) {
  issues.push(`${file}:${line}: ${message}`)
}

for (const file of files) {
  const content = readUtf8(file)
  const { scenarios } = extractScenariosFromContent(file, content)

  scenarios.forEach((scenario, index) => {
    const scenarioLabel = `scenario #${index + 1}`

    if (scenario.parseError) {
      skipped.push(`${file}:${scenario.line}: ${scenarioLabel} skipped (${scenario.parseError})`)
      return
    }

    const evaluation = evaluateScenario(scenario)
    if (!evaluation.ok) {
      skipped.push(
        `${file}:${scenario.line}: ${scenarioLabel} skipped (${evaluation.reason}): ${evaluation.detail}`,
      )
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
    const runtimeIsObject = runtimeData !== null && typeof runtimeData === 'object' && !Array.isArray(runtimeData)
    const docIsObject = docSuccessData !== null && typeof docSuccessData === 'object' && !Array.isArray(docSuccessData)

    if (runtimeIsObject && docIsObject) {
      const runtimeKeys = Object.keys(runtimeData)
      const docKeys = Object.keys(docSuccessData)
      const missingKeys = runtimeKeys.filter((key) => !docKeys.includes(key))
      if (missingKeys.length > 0) {
        addIssue(
          file,
          scenario.line,
          `${scenarioLabel} Success JSON missing runtime top-level keys: ${missingKeys.join(', ')}`,
        )
      }
    } else if (JSON.stringify(docSuccessData) !== JSON.stringify(runtimeData)) {
      addIssue(
        file,
        scenario.line,
        `${scenarioLabel} Success JSON data does not match runtime data for non-object payload`,
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

    // Without an explicit Invalid Input Markdown block, issue shape may vary by mutation strategy.
    if (!scenario.invalidHeading || !scenario.invalidFence) {
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
  if (skipped.length > 0) {
    console.error(`Skipped runtime scenarios: ${skipped.length}`)
  }
  process.exit(1)
}

if (skipped.length > 0) {
  console.log(`docs example runtime skipped ${skipped.length} scenario(s) that are currently non-executable`)
}
console.log('docs example runtime ok')
