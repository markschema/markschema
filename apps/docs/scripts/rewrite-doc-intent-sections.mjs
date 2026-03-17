import fs from 'node:fs'
import path from 'node:path'

const docsRoot = path.resolve('docs')
const HEADING_PATTERN = /^(#{1,6})\s+.+$/
const FENCE_PATTERN = /^(```|~~~)/

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

function splitLines(content) {
  return content.replace(/\r\n/g, '\n').split('\n')
}

function joinLines(lines) {
  return `${lines.join('\n')}\n`
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function wordCount(text) {
  const normalized = normalizeText(text)
  if (!normalized) return 0
  return normalized.split(' ').length
}

function truncateToWords(text, maxWords) {
  const words = normalizeText(text).split(' ')
  if (words.length <= maxWords) return normalizeText(text)
  return `${words.slice(0, maxWords).join(' ')}.`
}

function ensureSentencePunctuation(text) {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

function findH2Section(lines, headingText) {
  const headingLine = lines.findIndex((line) => line.trim() === `## ${headingText}`)
  if (headingLine === -1) return null

  let endLine = lines.length
  let activeFenceMarker = null

  for (let index = headingLine + 1; index < lines.length; index += 1) {
    const currentLine = lines[index].trim()
    const fenceMatch = FENCE_PATTERN.exec(currentLine)
    if (fenceMatch) {
      if (activeFenceMarker === null) {
        activeFenceMarker = fenceMatch[1]
      } else if (activeFenceMarker === fenceMatch[1]) {
        activeFenceMarker = null
      }
      continue
    }

    if (activeFenceMarker !== null) continue

    if (HEADING_PATTERN.test(currentLine)) {
      endLine = index
      break
    }
  }

  return {
    headingLine,
    contentStart: headingLine + 1,
    contentEnd: endLine,
  }
}

function replaceH2SectionBody(lines, section, nextBody) {
  const replacement = ['', ...nextBody.trim().split('\n'), '']
  lines.splice(section.contentStart, section.contentEnd - section.contentStart, ...replacement)
}

function matchGroup(content, regex, groupIndex = 1) {
  const match = content.match(regex)
  return match ? match[groupIndex].trim() : null
}

function parseJsonSafe(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}

function toNaturalList(values) {
  if (values.length === 0) return ''
  if (values.length === 1) return values[0]
  if (values.length === 2) return `${values[0]} and ${values[1]}`
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`
}

function limit(values, n) {
  return values.slice(0, n)
}

function hashString(input) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

function pickVariant(variants, seed) {
  return variants[seed % variants.length]
}

function familyFromSlug(slug) {
  if (slug.startsWith('api/types/section/')) return 'section'
  if (slug.startsWith('api/types/object/')) return 'object'
  if (slug.startsWith('api/types/match/')) return 'match'
  if (slug.startsWith('api/aux/')) return 'aux'
  if (slug.startsWith('api/interactions/')) return 'interactions'
  if (slug.startsWith('guides/')) return 'guides'
  if (slug.startsWith('examples/')) return 'examples'
  return 'general'
}

function inferCapabilityKeywords(schemaCode) {
  const capabilities = []
  if (/md\.document\(/.test(schemaCode)) capabilities.push('document-level structure checks')
  if (/md\.section\(/.test(schemaCode)) capabilities.push('explicit section targeting')
  if (/\.fields\(/.test(schemaCode)) capabilities.push('typed field extraction')
  if (/md\.match\./.test(schemaCode)) capabilities.push('label-based matching')
  if (/\.blockOrder\(/.test(schemaCode)) capabilities.push('block order enforcement')
  if (/\.sequence\(/.test(schemaCode)) capabilities.push('ordered section validation')
  if (/\.pipeline\(|\.transform\(/.test(schemaCode)) capabilities.push('value normalization')
  if (/errorMap|setErrorMap|getErrorMap/.test(schemaCode)) capabilities.push('custom error mapping')
  if (/\.min\(|\.max\(|\.length\(|\.nonempty\(|\.int\(/.test(schemaCode)) {
    capabilities.push('boundary constraints')
  }
  return unique(capabilities)
}

function inferInputSummary(inputMarkdown) {
  if (!inputMarkdown) return 'a compact markdown payload'

  const lines = splitLines(inputMarkdown)
  const h1Count = lines.filter((line) => /^#\s+/.test(line.trim())).length
  const h2Count = lines.filter((line) => /^##\s+/.test(line.trim())).length
  const h3Count = lines.filter((line) => /^###\s+/.test(line.trim())).length
  const hasTable = /\|.+\|/.test(inputMarkdown)
  const hasList = /^\s*[-*]\s+/m.test(inputMarkdown)
  const hasCode = /```|~~~/.test(inputMarkdown)

  const parts = []
  if (h1Count > 0) parts.push(`${h1Count} h1 heading${h1Count > 1 ? 's' : ''}`)
  if (h2Count > 0) parts.push(`${h2Count} h2 section${h2Count > 1 ? 's' : ''}`)
  if (h3Count > 0) parts.push(`${h3Count} h3 subsection${h3Count > 1 ? 's' : ''}`)
  if (hasList) parts.push('list content')
  if (hasTable) parts.push('tabular content')
  if (hasCode) parts.push('code fences')

  if (parts.length === 0) return 'a compact markdown payload'
  return toNaturalList(limit(parts, 3))
}

function extractOutputKeys(successJson) {
  const parsed = parseJsonSafe(successJson)
  if (!parsed || parsed.success !== true) return []

  const data = parsed.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.keys(data)
  }

  if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && !Array.isArray(data[0])) {
    return Object.keys(data[0])
  }

  return []
}

function outputShapeSummary(successJson) {
  const parsed = parseJsonSafe(successJson)
  if (!parsed || parsed.success !== true) {
    return 'typed output aligned to the declared schema'
  }

  const data = parsed.data
  const keys = extractOutputKeys(successJson)

  if (keys.length > 0) {
    return `top-level keys ${toNaturalList(limit(keys, 4).map((key) => `\`${key}\``))}`
  }

  if (Array.isArray(data)) return 'an array-based result set'
  if (data && typeof data === 'object') return 'an object result'
  return `a scalar result (${JSON.stringify(data)})`
}

function extractIssueCodes(errorJson) {
  const parsed = parseJsonSafe(errorJson)
  const issues = parsed?.error?.issues
  if (!Array.isArray(issues)) return []
  return unique(issues.map((issue) => issue?.code).filter(Boolean))
}

function issueSummary(errorJson) {
  const codes = extractIssueCodes(errorJson)
  if (codes.length === 0) return 'structured issues with path-aware diagnostics'
  return `issue codes like ${toNaturalList(limit(codes, 4).map((code) => `\`${code}\``))}`
}

function extractMethodNames(schemaCode) {
  return unique([...schemaCode.matchAll(/\.\s*([A-Za-z_]\w*)\s*\(/g)].map((match) => match[1]))
}

function operatorSummary(schemaCode) {
  const methods = extractMethodNames(schemaCode)
  if (methods.length === 0) return '`document()` and related builders'
  return toNaturalList(limit(methods, 4).map((name) => `\`${name}()\``))
}

function methodLabel(context) {
  if (context.signature) return `\`${context.signature}\``
  if (context.title) return `\`${context.title}\``
  if (context.type) return `\`${context.type}\``
  return '`mdshape` method'
}

function methodFocus(context) {
  const slugParts = context.slug.split('/').filter(Boolean)
  let tail = slugParts.at(-1) ?? 'method'
  if (tail === 'index') {
    tail = slugParts.at(-2) ?? tail
  }
  return `\`${tail.replace(/-/g, ' ')}\``
}

function familyGuidance(family) {
  const map = {
    section: {
      best: 'section-scoped extraction where headings anchor each data slice',
      avoid: 'free-form notes with unstable section names',
    },
    object: {
      best: 'composing reusable object contracts across related markdown schemas',
      avoid: 'one-off payloads where object composition adds no reuse value',
    },
    match: {
      best: 'label-oriented parsing from inline markers in prose',
      avoid: 'documents that lack stable labels or marker prefixes',
    },
    aux: {
      best: 'tightening scalar constraints without redefining the base shape',
      avoid: 'very loose drafts where strict refinement would block iteration',
    },
    interactions: {
      best: 'cross-builder patterns that coordinate multiple extraction primitives',
      avoid: 'single-rule validations where interaction layers are unnecessary',
    },
    guides: {
      best: 'teaching a precise parsing strategy with reproducible behavior',
      avoid: 'high-level overviews that do not require executable constraints',
    },
    examples: {
      best: 'end-to-end examples where readers need realistic schema behavior',
      avoid: 'minimal snippets where full scenario contracts feel too heavy',
    },
    general: {
      best: 'typed markdown parsing with deterministic contracts',
      avoid: 'exploratory drafts that intentionally avoid strict validation',
    },
  }
  return map[family] ?? map.general
}

function tradeoffSummary(capabilities) {
  const hasStrictOrder = capabilities.includes('ordered section validation') || capabilities.includes('block order enforcement')
  const hasFields = capabilities.includes('typed field extraction')

  if (hasStrictOrder && hasFields) return 'higher authoring discipline in exchange for predictable runtime behavior'
  if (hasStrictOrder) return 'ordering constraints that reduce flexibility but improve consistency'
  if (hasFields) return 'key-level strictness that improves typing but rejects ad-hoc variations'
  return 'more explicit schema maintenance to keep output deterministic'
}

function makeThreeSentences(sentences) {
  const normalized = sentences.map((sentence) => ensureSentencePunctuation(normalizeText(sentence)))
  return normalized.join(' ')
}

function enforceWordRange(text, minWords = 45, maxWords = 100) {
  let result = normalizeText(text)
  let words = wordCount(result)

  if (words > maxWords) {
    result = truncateToWords(result, maxWords)
    words = wordCount(result)
  }

  if (words < minWords) {
    const filler = 'This keeps implementation and validation behavior aligned across environments.'
    if (!result.includes(filler)) {
      const pieces = result.split(/(?<=[.!?])\s+/).filter(Boolean)
      if (pieces.length === 3) {
        pieces[2] = `${pieces[2].replace(/[.!?]$/, '')}, and ${filler.toLowerCase()}`
        result = ensureSentencePunctuation(pieces.join(' '))
      }
    }
  }

  return result
}

function extractContext(file, content) {
  const title = matchGroup(content, /^#\s+(.+)$/m)
  const type = matchGroup(content, /^Type:\s*`([^`]+)`$/m)
  const signature = matchGroup(content, /^Signature:\s*`([^`]+)`$/m)
  const inputMarkdown = matchGroup(content, /###\s+Input Markdown[\s\S]*?```(?:md|markdown)\n([\s\S]*?)```/m)
  const schemaCode = matchGroup(content, /###\s+Schema[\s\S]*?```ts\n([\s\S]*?)```/m)
  const successJson = matchGroup(content, /####\s+Success[\s\S]*?```json\n([\s\S]*?)```/m)
  const errorJson = matchGroup(content, /####\s+Error[\s\S]*?```json\n([\s\S]*?)```/m)
  const slug = path.relative(docsRoot, file).replace(/\\/g, '/').replace(/\.md$/, '')

  return {
    title,
    type,
    signature,
    inputMarkdown,
    schemaCode: schemaCode ?? '',
    successJson,
    errorJson,
    slug,
    family: familyFromSlug(slug),
  }
}

function buildWhatItIs(context) {
  const seed = hashString(context.slug)
  const method = methodLabel(context)
  const focus = methodFocus(context)
  const capabilities = inferCapabilityKeywords(context.schemaCode)
  const capabilityPhrase =
    capabilities.length > 0 ? toNaturalList(limit(capabilities, 3)) : 'typed markdown validation primitives'
  const inputSummary = inferInputSummary(context.inputMarkdown)
  const outputSummary = outputShapeSummary(context.successJson)
  const issues = issueSummary(context.errorJson)
  const operators = operatorSummary(context.schemaCode)

  const variants = [
    () =>
      makeThreeSentences([
        `${method} parses markdown with ${capabilityPhrase}, so this page defines a strict ${focus} contract instead of permissive text scraping`,
        `The schema combines operators such as ${operators} to map ${inputSummary} into ${outputSummary} for this ${focus} behavior`,
        `If parsing fails, the result carries ${issues}, giving the caller precise debugging context for ${focus} paths`,
      ]),
    () =>
      makeThreeSentences([
        `On this page, ${method} centers on ${capabilityPhrase} to keep ${focus} parsing deterministic and schema-driven`,
        `The example expects ${inputSummary} and returns ${outputSummary} directly from the declared ${focus} extraction rules`,
        `Violations produce ${issues}, which avoids brittle string checks and keeps ${focus} failure handling explicit`,
      ]),
    () =>
      makeThreeSentences([
        `${method} is used here as a contract-first parser powered by ${capabilityPhrase} for ${focus} scenarios`,
        `With ${operators} in the schema, ${inputSummary} is converted into ${outputSummary} without manual ${focus} post-processing`,
        `Error cases report ${issues}, making operational diagnostics for ${focus} flows consistent across local runs and CI`,
      ]),
    () =>
      makeThreeSentences([
        `This method page uses ${method} to enforce ${capabilityPhrase} over markdown content in ${focus} use cases`,
        `In practice, ${inputSummary} is validated and emitted as ${outputSummary} using ${operators} under ${focus} rules`,
        `When constraints are broken, ${issues} identify exactly which ${focus} node failed and why`,
      ]),
  ]

  return enforceWordRange(pickVariant(variants, seed)())
}

function buildWhenToUse(context) {
  const seed = hashString(`${context.slug}:when`)
  const method = methodLabel(context)
  const focus = methodFocus(context)
  const family = familyGuidance(context.family)
  const capabilities = inferCapabilityKeywords(context.schemaCode)
  const tradeoff = tradeoffSummary(capabilities)
  const operators = operatorSummary(context.schemaCode)

  const variants = [
    () =>
      makeThreeSentences([
        `Use ${method} when you need ${family.best} for ${focus} workflows and want parsing behavior that remains enforceable in review and CI`,
        `Avoid it for ${family.avoid} in ${focus} documents, because it introduces ${tradeoff}`,
        `It pairs well with ${operators} to keep ${focus} extraction boundaries explicit while preserving typed output for downstream code`,
      ]),
    () =>
      makeThreeSentences([
        `Choose ${method} for ${family.best}, especially when ${focus} authoring rules must remain stable across teams`,
        `Skip it in ${family.avoid} workflows for ${focus}, since ${tradeoff}`,
        `Combining it with ${operators} yields predictable ${focus} parsing, clearer errors, and easier runtime integration`,
      ]),
    () =>
      makeThreeSentences([
        `This method is a strong fit for ${family.best} where deterministic ${focus} parsing matters more than free-form flexibility`,
        `Do not default to it for ${family.avoid} around ${focus}; the main cost is ${tradeoff}`,
        `For best results, compose ${method} with ${operators} so ${focus} schema intent stays readable and output remains predictable`,
      ]),
    () =>
      makeThreeSentences([
        `Apply ${method} when your document flow requires ${family.best} for ${focus} and strict schema adherence over permissive parsing`,
        `It is less suitable for ${family.avoid} under ${focus}, because teams must accept ${tradeoff}`,
        `Use ${operators} around ${method} to keep ${focus} contracts transparent and reduce ambiguity in validation behavior`,
      ]),
  ]

  return enforceWordRange(pickVariant(variants, seed)())
}

let changedFiles = 0
let changedSections = 0

for (const file of walkMarkdownFiles(docsRoot)) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = splitLines(content)
  const what = findH2Section(lines, 'What It Is')
  const when = findH2Section(lines, 'When to Use')
  if (!what || !when) continue

  const context = extractContext(file, content)
  const whatBody = buildWhatItIs(context)
  const whenBody = buildWhenToUse(context)

  const sections = [what, when].sort((left, right) => right.headingLine - left.headingLine)
  for (const section of sections) {
    if (section === what) {
      replaceH2SectionBody(lines, section, whatBody)
      changedSections += 1
    } else {
      replaceH2SectionBody(lines, section, whenBody)
      changedSections += 1
    }
  }

  const nextContent = joinLines(lines)
  if (nextContent !== content) {
    fs.writeFileSync(file, nextContent, 'utf8')
    changedFiles += 1
  }
}

console.log(`rewrote intent sections in ${changedFiles} file(s), ${changedSections} section(s)`)
