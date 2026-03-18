import fs from 'node:fs'
import path from 'node:path'
import { extractScenariosFromContent } from './doc-examples-lib.mjs'

const docsRoot = path.resolve('docs')
const typesRoot = path.join(docsRoot, 'api', 'types')
const interactionsRoot = path.join(docsRoot, 'api', 'interactions')
const examplesRoot = path.join(docsRoot, 'examples')
const manifestPath = path.join(typesRoot, 'type-methods.json')

const issues = []

const REQUIRED_BLOCKS = [
  '## What It Is',
  '## When to Use',
  '### Input Markdown',
  '### Schema',
  '### Result',
  '#### Success',
  '#### Error',
]
const METADATA_TYPE_SLUGS = new Set(['metadata', 'metadata-object'])

const GENERIC_INTENT_PHRASES = [
  'Use this in production markdown parsing when you need the exact behavior described by the signature and strict typed output.',
  'Do not use it as a generic catch-all parser; prefer narrower schemas so failures remain explicit and diagnosable.',
  'Use this page for the common concept of',
]

const MIN_INTENT_WORDS = 45
const MAX_INTENT_WORDS = 100
const TARGET_INTENT_SENTENCES = 3
const INTENT_SIMILARITY_THRESHOLD = 0.82

function walkMarkdownFiles(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(full))
      continue
    }
    if (entry.isFile() && full.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

function addIssue(file, message) {
  issues.push(`${file}: ${message}`)
}

function extractH2Section(content, heading) {
  const lines = content.split(/\r?\n/)
  const headingLine = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (headingLine === -1) return null

  let endLine = lines.length
  let activeFenceMarker = null
  for (let index = headingLine + 1; index < lines.length; index += 1) {
    const currentLine = lines[index].trim()
    const fenceMatch = /^(```|~~~)/.exec(currentLine)
    if (fenceMatch) {
      if (activeFenceMarker === null) {
        activeFenceMarker = fenceMatch[1]
      } else if (activeFenceMarker === fenceMatch[1]) {
        activeFenceMarker = null
      }
      continue
    }

    if (activeFenceMarker !== null) {
      continue
    }

    if (/^#{1,6}\s+/.test(currentLine)) {
      endLine = index
      break
    }
  }

  const body = lines.slice(headingLine + 1, endLine).join('\n').trim()
  return {
    body,
    line: headingLine + 1,
  }
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function wordCount(text) {
  const normalized = normalizeText(text)
  if (!normalized) return 0
  return normalized.split(' ').length
}

function sentenceCount(text) {
  const normalized = normalizeText(text)
  if (!normalized) return 0
  const sentences = normalized.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean)
  return sentences.length
}

function similarityTokens(text) {
  const normalized = normalizeText(text).toLowerCase()
  return normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function trigramSet(tokens) {
  if (tokens.length < 3) {
    return new Set(tokens)
  }
  const set = new Set()
  for (let index = 0; index <= tokens.length - 3; index += 1) {
    set.add(`${tokens[index]} ${tokens[index + 1]} ${tokens[index + 2]}`)
  }
  return set
}

function jaccardSimilarity(left, right) {
  const leftTokens = trigramSet(similarityTokens(left))
  const rightTokens = trigramSet(similarityTokens(right))
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0

  let intersection = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1
  }

  const union = leftTokens.size + rightTokens.size - intersection
  return union === 0 ? 0 : intersection / union
}

function checkIntentEditorialQuality(file, content, whatRegistry, whenRegistry, whatEntries, whenEntries) {
  const what = extractH2Section(content, 'What It Is')
  const when = extractH2Section(content, 'When to Use')

  if (!what && !when) {
    return
  }

  if (!what) {
    addIssue(file, 'missing "## What It Is" while "## When to Use" exists')
    return
  }
  if (!when) {
    addIssue(file, 'missing "## When to Use" while "## What It Is" exists')
    return
  }

  const sections = [
    { name: 'What It Is', data: what, registry: whatRegistry },
    { name: 'When to Use', data: when, registry: whenRegistry },
  ]

  for (const section of sections) {
    const normalizedBody = normalizeText(section.data.body)
    if (!normalizedBody) {
      addIssue(file, `${section.name} has empty content`)
      continue
    }

    if (wordCount(normalizedBody) < MIN_INTENT_WORDS) {
      addIssue(
        file,
        `${section.name} is too short at line ${section.data.line}; expected at least ${MIN_INTENT_WORDS} words`,
      )
    }
    if (wordCount(normalizedBody) > MAX_INTENT_WORDS) {
      addIssue(
        file,
        `${section.name} is too long at line ${section.data.line}; expected at most ${MAX_INTENT_WORDS} words`,
      )
    }
    if (sentenceCount(normalizedBody) !== TARGET_INTENT_SENTENCES) {
      addIssue(
        file,
        `${section.name} must contain exactly ${TARGET_INTENT_SENTENCES} sentences at line ${section.data.line}`,
      )
    }

    for (const phrase of GENERIC_INTENT_PHRASES) {
      if (normalizedBody.includes(phrase)) {
        addIssue(
          file,
          `${section.name} contains banned generic phrase at line ${section.data.line}: "${phrase}"`,
        )
      }
    }

    if (!section.registry.has(normalizedBody)) {
      section.registry.set(normalizedBody, [])
    }
    section.registry.get(normalizedBody).push({
      file,
      line: section.data.line,
    })

    const entry = {
      file,
      line: section.data.line,
      body: normalizedBody,
    }
    if (section.name === 'What It Is') {
      whatEntries.push(entry)
    } else {
      whenEntries.push(entry)
    }
  }
}

function checkApproximateIntentDuplicates(entries, sectionName) {
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const similarity = jaccardSimilarity(entries[left].body, entries[right].body)
      if (similarity < INTENT_SIMILARITY_THRESHOLD) continue

      const score = similarity.toFixed(2)
      addIssue(
        entries[left].file,
        `${sectionName} is too similar to ${entries[right].file} (similarity ${score} >= ${INTENT_SIMILARITY_THRESHOLD})`,
      )
      addIssue(
        entries[right].file,
        `${sectionName} is too similar to ${entries[left].file} (similarity ${score} >= ${INTENT_SIMILARITY_THRESHOLD})`,
      )
    }
  }
}

function checkNoPlaceholderText(file, content) {
  if (content.includes('Use this builder/method when this specific extraction or validation behavior is needed')) {
    addIssue(file, 'contains placeholder "Use this builder/method..." text')
  }
}

function checkNoLegacyNaming(file, content) {
  const legacyPatterns = [
    /\b\.pipe\(/,
    /\bpipe\(/,
    /\bcodeFences\b/,
    /\bcodeFence\b/,
    /\/api\/types\/[^)\s]*-2\b/,
    /\/api\/types\/[^)\s]*-min\b/,
    /\/api\/aux\/pipe\b/,
    /\/api\/interactions\/wrappers-transform-pipe\b/,
  ]
  for (const pattern of legacyPatterns) {
    if (pattern.test(content)) {
      addIssue(file, `contains legacy naming matching ${pattern}`)
    }
  }
}

function checkHeadingHierarchy(file, content) {
  const lines = content.split(/\r?\n/)
  let inCodeFence = false
  let previousHeadingLevel
  let firstHeadingFound = false

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence
      continue
    }

    if (inCodeFence) {
      continue
    }

    const match = /^(#{1,6})\s+/.exec(line)
    if (!match) {
      continue
    }

    const currentLevel = match[1].length
    const lineNumber = index + 1

    if (!firstHeadingFound) {
      firstHeadingFound = true
      if (currentLevel !== 1) {
        addIssue(file, `first heading must be h1 (#), found h${currentLevel} at line ${lineNumber}`)
      }
      previousHeadingLevel = currentLevel
      continue
    }

    if (previousHeadingLevel !== undefined && currentLevel > previousHeadingLevel + 1) {
      addIssue(
        file,
        `heading level jump h${previousHeadingLevel} -> h${currentLevel} at line ${lineNumber}`,
      )
    }

    previousHeadingLevel = currentLevel
  }
}

function checkInputMarkdownOrder(file, content) {
  const lines = content.split(/\r?\n/)
  const inputHeadingPattern = /^#{2,4}\s+Input Markdown\s*$/
  const mdFencePattern = /^```(md|markdown)\s*$/
  const fencePattern = /^```/

  for (let index = 0; index < lines.length; index += 1) {
    if (!inputHeadingPattern.test(lines[index].trim())) {
      continue
    }

    let fenceStart = -1
    for (let scan = index + 1; scan < lines.length; scan += 1) {
      const line = lines[scan].trim()
      if (mdFencePattern.test(line)) {
        fenceStart = scan
        break
      }
      if (fencePattern.test(line)) {
        break
      }
    }

    if (fenceStart === -1) {
      continue
    }

    const blockLines = []
    let blockEnd = fenceStart + 1
    for (; blockEnd < lines.length; blockEnd += 1) {
      if (/^```\s*$/.test(lines[blockEnd].trim())) {
        break
      }
      blockLines.push(lines[blockEnd])
    }

    let firstH1Line
    let firstH2Line
    let previousNumericHeading

    for (let blockIndex = 0; blockIndex < blockLines.length; blockIndex += 1) {
      const currentLine = blockLines[blockIndex]
      const trimmedLine = currentLine.trim()
      const lineNumber = fenceStart + 2 + blockIndex

      if (firstH1Line === undefined && /^#\s+/.test(trimmedLine)) {
        firstH1Line = lineNumber
      }
      if (firstH2Line === undefined && /^##\s+/.test(trimmedLine)) {
        firstH2Line = lineNumber
      }

      const numericHeadingMatch = /^##\s+(\d+)\./.exec(trimmedLine)
      if (!numericHeadingMatch) {
        continue
      }

      const currentNumber = Number(numericHeadingMatch[1])
      if (previousNumericHeading && currentNumber < previousNumericHeading.number) {
        addIssue(
          file,
          `Input Markdown numeric heading regression at line ${lineNumber}: ${previousNumericHeading.number} -> ${currentNumber}`,
        )
      }

      previousNumericHeading = {
        number: currentNumber,
      }
    }

    if (firstH1Line !== undefined && firstH2Line !== undefined && firstH2Line < firstH1Line) {
      addIssue(
        file,
        `Input Markdown heading order invalid: h2 appears before h1 (h2 line ${firstH2Line}, h1 line ${firstH1Line})`,
      )
    }

    index = blockEnd
  }
}

function checkMethodTemplate(file, content) {
  for (const block of REQUIRED_BLOCKS) {
    if (!content.includes(block)) {
      addIssue(file, `missing required block: ${block}`)
    }
  }

  if (!content.includes('Failure trigger:')) {
    addIssue(file, 'missing "Failure trigger:" note near Error block')
  }

  const successMatch = content.match(/#### Success[\s\S]*?```json([\s\S]*?)```/)
  if (!successMatch || !/"success"\s*:\s*true/.test(successMatch[1])) {
    addIssue(file, 'Success block does not contain `"success": true`')
  }

  const errorMatch = content.match(/#### Error[\s\S]*?```json([\s\S]*?)```/)
  if (!errorMatch || !/"success"\s*:\s*false/.test(errorMatch[1])) {
    addIssue(file, 'Error block does not contain `"success": false`')
  }
}

function checkScenarioStructure(file, content) {
  const hasInputMarkdownHeading = /^#{2,4}\s+Input Markdown\s*$/m.test(content)
  if (!hasInputMarkdownHeading) {
    return
  }

  const { scenarios } = extractScenariosFromContent(file, content)
  if (scenarios.length === 0) {
    addIssue(file, 'contains "Input Markdown" heading but no parseable runtime scenario')
    return
  }

  scenarios.forEach((scenario, index) => {
    const label = `scenario #${index + 1}`
    if (scenario.parseError) {
      addIssue(file, `${label} has invalid structure (${scenario.parseError})`)
    }
  })
}

function checkNoFrontmatterOutsideMetadataTypes(file, content) {
  const relative = path.relative(typesRoot, file)
  if (relative.startsWith('..')) return

  const [typeSlug] = relative.split(path.sep)
  if (!typeSlug || METADATA_TYPE_SLUGS.has(typeSlug)) {
    return
  }

  if (/\bmd\.metadataObject\(/.test(content) || /\bmd\.metadata\(/.test(content)) {
    addIssue(file, 'uses metadata builders outside metadata/metadata-object type menus')
  }

  if (/```(?:md|markdown)\s*\n---\s*\n/m.test(content)) {
    addIssue(file, 'uses frontmatter in Input Markdown outside metadata/metadata-object type menus')
  }
}

function extractTypeSpecificMethodLinks(indexContent) {
  const start = indexContent.indexOf('### Type-specific methods')
  const end = indexContent.indexOf('### Shared auxiliaries')
  if (start === -1) {
    return []
  }
  const section = end === -1 || end <= start ? indexContent.slice(start) : indexContent.slice(start, end)
  const matches = [...section.matchAll(/\]\((\/api\/types\/[^)]+)\)/g)]
  return matches.map((m) => m[1])
}

const typeFiles = walkMarkdownFiles(typesRoot)
const whatSectionRegistry = new Map()
const whenSectionRegistry = new Map()
const whatSectionEntries = []
const whenSectionEntries = []
for (const file of typeFiles) {
  const content = fs.readFileSync(file, 'utf8')
  checkNoPlaceholderText(file, content)
  checkNoLegacyNaming(file, content)
  checkNoFrontmatterOutsideMetadataTypes(file, content)

  const isIndex = path.basename(file) === 'index.md'
  if (!isIndex && file !== manifestPath) {
    checkMethodTemplate(file, content)
  }
}

for (const file of walkMarkdownFiles(interactionsRoot)) {
  const content = fs.readFileSync(file, 'utf8')
  checkNoPlaceholderText(file, content)
  checkNoLegacyNaming(file, content)
}

for (const file of walkMarkdownFiles(examplesRoot)) {
  const content = fs.readFileSync(file, 'utf8')
  checkNoPlaceholderText(file, content)
  checkNoLegacyNaming(file, content)
}

for (const file of walkMarkdownFiles(docsRoot)) {
  const content = fs.readFileSync(file, 'utf8')
  checkHeadingHierarchy(file, content)
  checkInputMarkdownOrder(file, content)
  checkScenarioStructure(file, content)
  checkIntentEditorialQuality(
    file,
    content,
    whatSectionRegistry,
    whenSectionRegistry,
    whatSectionEntries,
    whenSectionEntries,
  )
}

for (const [text, occurrences] of whatSectionRegistry.entries()) {
  if (occurrences.length <= 1) continue
  for (const occurrence of occurrences) {
    addIssue(
      occurrence.file,
      `What It Is duplicates exact text used in ${occurrences.length} pages (line ${occurrence.line})`,
    )
  }
}

for (const [text, occurrences] of whenSectionRegistry.entries()) {
  if (occurrences.length <= 1) continue
  for (const occurrence of occurrences) {
    addIssue(
      occurrence.file,
      `When to Use duplicates exact text used in ${occurrences.length} pages (line ${occurrence.line})`,
    )
  }
}

checkApproximateIntentDuplicates(whatSectionEntries, 'What It Is')
checkApproximateIntentDuplicates(whenSectionEntries, 'When to Use')

if (!fs.existsSync(manifestPath)) {
  addIssue(manifestPath, 'type-methods.json not found')
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  for (const [typeSlug, entry] of Object.entries(manifest)) {
    const typeDir = path.join(typesRoot, typeSlug)
    const indexPath = path.join(typeDir, 'index.md')

    if (!fs.existsSync(indexPath)) {
      addIssue(indexPath, 'missing type index page')
      continue
    }

    const indexContent = fs.readFileSync(indexPath, 'utf8')
    const indexLinks = extractTypeSpecificMethodLinks(indexContent)
    const expectedLinks = (entry.methods ?? []).map((m) => `/api/types/${typeSlug}/${m.slug}`)

    for (const link of expectedLinks) {
      if (!indexLinks.includes(link)) {
        addIssue(indexPath, `missing type method link in index: ${link}`)
      }
    }

    for (const method of entry.methods ?? []) {
      const methodPath = path.join(typeDir, `${method.slug}.md`)
      if (!fs.existsSync(methodPath)) {
        addIssue(methodPath, `missing method page declared in manifest (${typeSlug}.${method.slug})`)
      }
    }

    const allowedFiles = new Set(['index.md', ...(entry.methods ?? []).map((m) => `${m.slug}.md`)])
    for (const file of fs.readdirSync(typeDir)) {
      if (!file.endsWith('.md')) continue
      if (!allowedFiles.has(file)) {
        addIssue(path.join(typeDir, file), 'orphan method page not declared in manifest')
      }
    }
  }
}

if (issues.length > 0) {
  console.error('Documentation semantics check failed:')
  for (const issue of issues) {
    console.error(`- ${issue}`)
  }
  process.exit(1)
}

console.log('docs semantics ok')
