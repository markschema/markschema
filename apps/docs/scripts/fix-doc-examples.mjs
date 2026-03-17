import path from 'node:path'
import {
  applyScenarioFixes,
  evaluateScenario,
  extractScenariosFromContent,
  healResultJsonFences,
  readUtf8,
  walkMarkdownFiles,
  writeUtf8,
} from './doc-examples-lib.mjs'

const docsRoot = path.resolve('docs')
const files = walkMarkdownFiles(docsRoot)

let filesChanged = 0
let scenariosUpdated = 0
const unresolved = []

for (const file of files) {
  const originalContent = readUtf8(file)
  const healedContent = healResultJsonFences(originalContent)
  const { scenarios } = extractScenariosFromContent(file, healedContent)
  if (scenarios.length === 0) continue

  const updates = scenarios.map((scenario, index) => {
    if (scenario.parseError) {
      unresolved.push(`${file}:${scenario.line}: scenario #${index + 1} parse error (${scenario.parseError})`)
      return null
    }

    const evaluation = evaluateScenario(scenario)
    if (!evaluation.ok) {
      unresolved.push(
        `${file}:${scenario.line}: scenario #${index + 1} runtime error (${evaluation.reason}): ${evaluation.detail}`,
      )
      return null
    }

    scenariosUpdated += 1
    return {
      validMarkdown: evaluation.validMarkdown,
      schemaCode: evaluation.normalizedSchema,
      successJson: evaluation.validResult,
      errorJson: evaluation.invalidResult,
      invalidMarkdown: evaluation.invalidMarkdown,
    }
  })

  const nextContent = applyScenarioFixes(healedContent, updates)
  if (nextContent !== originalContent) {
    writeUtf8(file, nextContent)
    filesChanged += 1
  }
}

console.log(`docs example fixer updated ${scenariosUpdated} scenario(s) across ${filesChanged} file(s)`)

if (unresolved.length > 0) {
  console.log(`unresolved scenarios: ${unresolved.length}`)
  for (const item of unresolved) {
    console.log(`- ${item}`)
  }
}
