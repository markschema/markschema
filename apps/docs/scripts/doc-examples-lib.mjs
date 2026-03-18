import fs from 'node:fs'
import path from 'node:path'
import { formatIssuesWithSource, getErrorMap, md, setErrorMap } from '@markschema/mdshape'

const HEADING_PATTERN = /^(#{1,6})\s+(.+?)\s*$/
const INPUT_HEADING_TEXT = 'Input Markdown'
const INVALID_INPUT_HEADING_TEXT = 'Invalid Input Markdown'
const SCHEMA_HEADING_TEXT = 'Schema'
const RESULT_HEADING_TEXT = 'Result'
const SUCCESS_HEADING_TEXT = 'Success'
const ERROR_HEADING_TEXT = 'Error'

const MARKDOWN_LANGS = new Set(['md', 'markdown'])

function normalizeLang(lang) {
  return (lang ?? '').trim().toLowerCase()
}

function splitLines(content) {
  return content.replace(/\r\n/g, '\n').split('\n')
}

function joinLines(lines) {
  return `${lines.join('\n')}\n`
}

function parseHeadings(lines) {
  const headings = []
  for (let index = 0; index < lines.length; index += 1) {
    const match = HEADING_PATTERN.exec(lines[index])
    if (!match) continue
    headings.push({
      line: index,
      level: match[1].length,
      text: match[2].trim(),
    })
  }
  return headings
}

function findHeadingBetween(headings, startLine, endLine, text) {
  return (
    headings.find((heading) => heading.line > startLine && heading.line < endLine && heading.text === text) ?? null
  )
}

function findNextInputLine(headings, currentLine, linesLength) {
  const nextInput = headings.find(
    (heading) => heading.line > currentLine && heading.text === INPUT_HEADING_TEXT,
  )
  return nextInput ? nextInput.line : linesLength
}

function isFenceOpen(line) {
  const match = /^(```|~~~)\s*([A-Za-z0-9_-]+)?\s*$/.exec(line.trim())
  if (!match) return null
  return {
    marker: match[1],
    lang: normalizeLang(match[2]),
  }
}

function isFenceClose(line, marker) {
  return new RegExp(`^${marker}\\s*$`).test(line.trim())
}

function findFenceInRange(lines, startLine, endLine, acceptedLangs = null) {
  for (let index = startLine + 1; index < endLine; index += 1) {
    const open = isFenceOpen(lines[index])
    if (!open) continue
    if (acceptedLangs && !acceptedLangs.has(open.lang)) continue

    let closeLine = -1
    for (let cursor = index + 1; cursor < endLine; cursor += 1) {
      if (isFenceClose(lines[cursor], open.marker)) {
        closeLine = cursor
        break
      }
    }

    if (closeLine === -1) {
      return null
    }

    return {
      openLine: index,
      closeLine,
      marker: open.marker,
      lang: open.lang,
    }
  }

  return null
}

function fenceText(lines, fence) {
  return lines.slice(fence.openLine + 1, fence.closeLine).join('\n')
}

function replaceFenceText(lines, fence, nextText) {
  const replacement = nextText.split('\n')
  lines.splice(fence.openLine + 1, fence.closeLine - fence.openLine - 1, ...replacement)
}

function insertLines(lines, lineIndex, newLines) {
  lines.splice(lineIndex, 0, ...newLines)
}

function parseJsonSafe(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function parseChainMethods(chainSource) {
  const methods = []
  const methodPattern = /\.\s*([A-Za-z_]\w*)\s*\(([^()]*)\)/g
  for (const match of chainSource.matchAll(methodPattern)) {
    methods.push({
      name: match[1],
      args: match[2],
      raw: match[0].replace(/\s+/g, ''),
    })
  }
  return methods
}

function findMatchingToken(source, openIndex, openToken = '(', closeToken = ')') {
  let depth = 0
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index]

    if (char === '"' || char === "'" || char === '`') {
      const quote = char
      index += 1
      for (; index < source.length; index += 1) {
        if (source[index] === '\\') {
          index += 1
          continue
        }
        if (source[index] === quote) break
      }
      continue
    }

    if (char === openToken) depth += 1
    if (char === closeToken) {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return -1
}

function splitTopLevelArguments(source) {
  const chunks = []
  let start = 0
  let paren = 0
  let brace = 0
  let bracket = 0

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (char === '"' || char === "'" || char === '`') {
      const quote = char
      index += 1
      for (; index < source.length; index += 1) {
        if (source[index] === '\\') {
          index += 1
          continue
        }
        if (source[index] === quote) break
      }
      continue
    }

    if (char === '(') paren += 1
    else if (char === ')') paren -= 1
    else if (char === '{') brace += 1
    else if (char === '}') brace -= 1
    else if (char === '[') bracket += 1
    else if (char === ']') bracket -= 1

    if (char === ',' && paren === 0 && brace === 0 && bracket === 0) {
      chunks.push(source.slice(start, index).trim())
      start = index + 1
    }
  }

  const tail = source.slice(start).trim()
  if (tail.length > 0) chunks.push(tail)
  return chunks
}

function extractObjectShapeAliases(code) {
  const aliases = new Map()
  const pattern = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.object\(/g

  for (const match of code.matchAll(pattern)) {
    const name = match[1]
    const openIndex = match.index + match[0].length - 1
    const closeIndex = findMatchingToken(code, openIndex, '(', ')')
    if (closeIndex === -1) continue
    const objectShape = code.slice(openIndex + 1, closeIndex).trim()
    if (objectShape.startsWith('{') && objectShape.endsWith('}')) {
      aliases.set(name, objectShape)
    }
  }

  return aliases
}

function unwrapMdObjectExpression(expression) {
  const trimmed = expression.trim()
  if (!trimmed.startsWith('md.object(')) return null

  const openIndex = trimmed.indexOf('(')
  const closeIndex = findMatchingToken(trimmed, openIndex, '(', ')')
  if (closeIndex === -1) return null

  const objectShape = trimmed.slice(openIndex + 1, closeIndex).trim()
  if (!(objectShape.startsWith('{') && objectShape.endsWith('}'))) return null

  const tail = trimmed.slice(closeIndex + 1).trim()
  if (tail.length > 0 && !/^(\.\s*[A-Za-z_]\w*\s*\([^()]*\)\s*)+$/.test(tail)) {
    return null
  }

  return objectShape
}

function normalizeSectionFieldsShapeArguments(code) {
  const aliases = extractObjectShapeAliases(code)
  let cursor = 0
  let next = ''

  while (cursor < code.length) {
    const fieldsIndex = code.indexOf('fields(', cursor)
    if (fieldsIndex === -1) {
      next += code.slice(cursor)
      break
    }

    next += code.slice(cursor, fieldsIndex)
    const openIndex = fieldsIndex + 'fields'.length
    const closeIndex = findMatchingToken(code, openIndex, '(', ')')
    if (closeIndex === -1) {
      next += code.slice(fieldsIndex)
      break
    }

    const body = code.slice(openIndex + 1, closeIndex)
    const args = splitTopLevelArguments(body)
    if (args.length > 0) {
      const first = args[0].trim()
      const fromAlias = aliases.get(first)
      const fromObjectWrapper = unwrapMdObjectExpression(first)
      if (fromAlias || fromObjectWrapper) {
        args[0] = fromAlias ?? fromObjectWrapper
      }
    }

    next += `fields(${args.join(', ')})`
    cursor = closeIndex + 1
  }

  return next
}

function normalizeCoerceNumberChains(code) {
  const pattern = /md\.coerce\.number\(\)((?:\s*\.\s*[A-Za-z_]\w*\s*\([^()]*\)\s*)+)/g
  return code.replace(pattern, (full, chain) => {
    const methods = parseChainMethods(chain)
    if (methods.length === 0) return full

    const allowed = new Set(['int', 'min', 'max'])
    const supported = methods.every((method) => allowed.has(method.name))
    if (!supported) return full

    const normalizedChain = methods.map((method) => method.raw).join('')
    return `md.coerce.number().pipeline(md.number()${normalizedChain})`
  })
}

function normalizeCoerceStringChains(code) {
  const pattern = /md\.coerce\.string\(\)((?:\s*\.\s*[A-Za-z_]\w*\s*\([^()]*\)\s*)+)/g
  return code.replace(pattern, (full, chain) => {
    const methods = parseChainMethods(chain)
    if (methods.length === 0) return full

    const allowed = new Set(['min', 'max', 'trim', 'startsWith', 'endsWith', 'includes'])
    const supported = methods.every((method) => allowed.has(method.name))
    if (!supported) return full

    const normalizedChain = methods.map((method) => method.raw).join('')
    return `md.coerce.string().pipeline(md.string()${normalizedChain})`
  })
}

function normalizeSchemaCode(schemaSource) {
  let normalized = schemaSource.trimEnd()
  normalized = normalizeCoerceNumberChains(normalized)
  normalized = normalizeCoerceStringChains(normalized)
  normalized = normalizeSectionFieldsShapeArguments(normalized)

  if (!/\bconst\s+schema\s*=/.test(normalized)) {
    const docCandidates = [...normalized.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.document\(/g)]
    const sectionCandidates = [...normalized.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.section\(/g)]
    const genericCandidates = [...normalized.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=/g)]

    const aliasFrom =
      docCandidates.at(-1)?.[1] ??
      sectionCandidates.at(-1)?.[1] ??
      genericCandidates.find((candidate) => candidate[1] !== 'md')?.[1]

    if (aliasFrom && aliasFrom !== 'schema') {
      normalized = `${normalized}\n\nconst schema = ${aliasFrom}`
    }
  }

  return normalized
}

function stripImportsAndExports(schemaSource) {
  return schemaSource
    .replace(/^\s*import[^\n]*\n/gm, '')
    .replace(/^\s*export\s+/gm, '')
    .replace(/^\s*(?:const\s+\w+\s*=\s*)?\w+\.safeParse\([\s\S]*?\)\s*;?\s*$/gm, '')
    .replace(/^\s*(?:const\s+\w+\s*=\s*)?\w+\.parse\([\s\S]*?\)\s*;?\s*$/gm, '')
    .replace(/^\s*if\s*\(!?\w+\.success\)\s*\{[\s\S]*?\}\s*$/gm, '')
    .trim()
}

function getCandidateKind(runtimeSource, candidateName) {
  if (!candidateName) return 'unknown'

  const escaped = candidateName.replace(/[$]/g, '\\$')
  if (new RegExp(`\\bconst\\s+${escaped}\\s*=\\s*md\\.document\\(`).test(runtimeSource)) return 'document'
  if (new RegExp(`\\bconst\\s+${escaped}\\s*=\\s*md\\.section\\(`).test(runtimeSource)) return 'section'
  if (new RegExp(`\\bconst\\s+${escaped}\\s*=\\s*md\\.match`).test(runtimeSource)) return 'match'
  if (new RegExp(`\\bconst\\s+${escaped}\\s*=\\s*md\\.object\\(`).test(runtimeSource)) return 'object'
  return 'unknown'
}

function extractAnchorFromSchema(runtimeSource) {
  const match = /\bmd\.section\(\s*['"]([^'"]+)['"]\s*\)/.exec(runtimeSource)
  return match ? match[1] : null
}

function ensureSectionAnchorInInput(inputMarkdown, anchor) {
  if (!anchor) return inputMarkdown
  const anchorLinePattern = new RegExp(`^##\\s+${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm')
  if (anchorLinePattern.test(inputMarkdown)) return inputMarkdown
  return `## ${anchor}\n\n${inputMarkdown}`
}

function cloneIssuesWithoutPrefix(issues, prefix) {
  return issues.map((issue) => {
    const nextPath = Array.isArray(issue.path) ? [...issue.path] : []
    if (nextPath[0] === prefix) nextPath.shift()
    return {
      ...issue,
      path: nextPath,
    }
  })
}

function evaluateSchemaBindings(runtimeSource) {
  const names = [...new Set([...runtimeSource.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]))]
  if (names.length === 0) return {}
  const projection = names.map((name) => `${name}: (typeof ${name} !== 'undefined' ? ${name} : undefined)`).join(', ')
  const evaluate = new Function(
    'md',
    'setErrorMap',
    'getErrorMap',
    'formatIssuesWithSource',
    `${runtimeSource}\nreturn { ${projection} }`,
  )
  return evaluate(md, setErrorMap, getErrorMap, formatIssuesWithSource)
}

function pickSchemaCandidate(bindings, runtimeSource) {
  if (bindings.schema && typeof bindings.schema.safeParse === 'function') {
    return { name: 'schema', schema: bindings.schema, kind: getCandidateKind(runtimeSource, 'schema') }
  }

  const rankedNames = [
    ...[...runtimeSource.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.document\(/g)].map((m) => m[1]),
    ...[...runtimeSource.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.section\(/g)].map((m) => m[1]),
    ...[...runtimeSource.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.match/g)].map((m) => m[1]),
    ...[...runtimeSource.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*md\.object\(/g)].map((m) => m[1]),
    ...[...runtimeSource.matchAll(/\b([A-Za-z_$][\w$]*)\.safeParse\(/g)].map((m) => m[1]),
    ...Object.keys(bindings),
  ]

  for (const name of rankedNames) {
    const candidate = bindings[name]
    if (!candidate || typeof candidate.safeParse !== 'function') continue
    return { name, schema: candidate, kind: getCandidateKind(runtimeSource, name) }
  }

  return null
}

function safeParseSchema(schema, input) {
  try {
    const result = schema.safeParse(input)
    if (!result || typeof result.success !== 'boolean') {
      return {
        ok: false,
        error: new Error('safeParse returned an invalid payload'),
      }
    }
    return {
      ok: true,
      result,
    }
  } catch (error) {
    return {
      ok: false,
      error,
    }
  }
}

function mutateMarkdownRemoveHeading(markdown) {
  const lines = splitLines(markdown)
  const headingIndex = lines.findIndex((line) => /^#\s+/.test(line.trim()))
  if (headingIndex === -1) return markdown
  lines.splice(headingIndex, 1)
  return lines.join('\n')
}

function mutateMarkdownSwapNumberedSections(markdown) {
  const lines = splitLines(markdown)
  const anchors = []
  for (let index = 0; index < lines.length; index += 1) {
    if (/^##\s+\d+\./.test(lines[index].trim())) {
      anchors.push(index)
    }
  }

  if (anchors.length < 2) return markdown

  const firstStart = anchors[0]
  const secondStart = anchors[1]
  const thirdStart = anchors[2] ?? lines.length

  const before = lines.slice(0, firstStart)
  const firstSection = lines.slice(firstStart, secondStart)
  const secondSection = lines.slice(secondStart, thirdStart)
  const after = lines.slice(thirdStart)

  return [...before, ...secondSection, ...firstSection, ...after].join('\n')
}

function mutateMarkdownRemoveSemanticLine(markdown) {
  const lines = splitLines(markdown)
  const lineIndex = lines.findIndex((line) => line.trim().length > 0)
  if (lineIndex === -1) return markdown
  lines.splice(lineIndex, 1)
  return lines.join('\n')
}

function normalizeFieldListMarkdown(markdown) {
  const lines = splitLines(markdown)
  const nextLines = lines.map((line) => {
    const trimmed = line.trim()
    if (!/^- [A-Za-z_][\w-]*:/.test(trimmed)) return line
    if (/^- \[[xX ]\]/.test(trimmed)) return line
    const indent = line.match(/^\s*/) ? line.match(/^\s*/)[0] : ''
    return `${indent}${trimmed.slice(2)}`
  })
  return nextLines.join('\n')
}

function mutateDataValue(value) {
  if (Array.isArray(value)) {
    if (value.length > 0) return value.slice(1)
    return []
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) return {}
    const [, ...rest] = entries
    return Object.fromEntries(rest)
  }

  if (typeof value === 'string') return ''
  if (typeof value === 'number') return null
  if (typeof value === 'boolean') return null
  return null
}

function compareIssueShape(leftIssues, rightIssues) {
  if (!Array.isArray(leftIssues) || !Array.isArray(rightIssues)) return false
  if (leftIssues.length !== rightIssues.length) return false

  for (let index = 0; index < leftIssues.length; index += 1) {
    const left = leftIssues[index]
    const right = rightIssues[index]
    const leftCode = left?.code
    const rightCode = right?.code
    const leftPath = Array.isArray(left?.path) ? left.path : []
    const rightPath = Array.isArray(right?.path) ? right.path : []
    if (leftCode !== rightCode) return false
    if (JSON.stringify(leftPath) !== JSON.stringify(rightPath)) return false
  }

  return true
}

function formatJson(obj) {
  return JSON.stringify(obj, null, 2)
}

function healResultJsonFences(content) {
  const lines = splitLines(content)
  const headings = parseHeadings(lines)
  const targetHeadings = headings.filter(
    (heading) => heading.text === SUCCESS_HEADING_TEXT || heading.text === ERROR_HEADING_TEXT,
  )

  const edits = []
  for (const heading of targetHeadings) {
    const nextHeadingLine =
      headings.find((item) => item.line > heading.line && item.level <= heading.level)?.line ?? lines.length
    let firstContentLine = heading.line + 1
    while (firstContentLine < nextHeadingLine && lines[firstContentLine].trim() === '') {
      firstContentLine += 1
    }
    if (firstContentLine >= nextHeadingLine) continue

    const openFence = isFenceOpen(lines[firstContentLine])
    if (openFence && openFence.lang === 'json') continue

    const startsLikeJson = /^[{\[]/.test(lines[firstContentLine].trim())
    if (!startsLikeJson) continue

    let lastContentLine = nextHeadingLine - 1
    while (lastContentLine > firstContentLine && lines[lastContentLine].trim() === '') {
      lastContentLine -= 1
    }

    edits.push({
      line: firstContentLine,
      value: '```json',
    })
    edits.push({
      line: lastContentLine + 1,
      value: '```',
    })
  }

  edits
    .sort((left, right) => right.line - left.line)
    .forEach((edit) => {
      lines.splice(edit.line, 0, edit.value)
    })

  return joinLines(lines)
}

function evaluateScenario(scenario) {
  const normalizedSchema = normalizeSchemaCode(scenario.schemaCode)
  const runtimeSource = stripImportsAndExports(normalizedSchema)

  let bindings
  try {
    bindings = evaluateSchemaBindings(runtimeSource)
  } catch (error) {
    return {
      ok: false,
      reason: 'schema_eval_failed',
      detail: String(error?.message ?? error),
      normalizedSchema,
    }
  }

  const candidate = pickSchemaCandidate(bindings, runtimeSource)
  if (!candidate) {
    return {
      ok: false,
      reason: 'schema_candidate_missing',
      detail: 'No schema-like symbol with safeParse found in snippet',
      normalizedSchema,
    }
  }

  const successFromDoc = parseJsonSafe(scenario.successJson)
  const successDocData = successFromDoc?.data

  const validInputCandidates = [scenario.inputMarkdown]
  const normalizedFieldInput = normalizeFieldListMarkdown(scenario.inputMarkdown)
  if (normalizedFieldInput !== scenario.inputMarkdown) {
    validInputCandidates.push(normalizedFieldInput)
  }

  let directAttempt = null
  let selectedValidInput = scenario.inputMarkdown
  let selected = null
  let mode = 'markdown'

  for (const inputCandidate of validInputCandidates) {
    directAttempt = safeParseSchema(candidate.schema, inputCandidate)
    if (directAttempt.ok && directAttempt.result.success) {
      selected = directAttempt.result
      selectedValidInput = inputCandidate
      break
    }
  }

  let wrappedSchema = null
  let anchor = null
  if (!selected && (candidate.kind === 'section' || candidate.kind === 'match' || candidate.kind === 'unknown')) {
    wrappedSchema = md.document({ __value: candidate.schema })
    anchor = extractAnchorFromSchema(runtimeSource)
    for (const inputCandidate of validInputCandidates) {
      const wrappedInput = ensureSectionAnchorInInput(inputCandidate, anchor)
      const wrappedAttempt = safeParseSchema(wrappedSchema, wrappedInput)
      if (wrappedAttempt.ok && wrappedAttempt.result.success) {
        selected = {
          success: true,
          data: wrappedAttempt.result.data.__value,
        }
        selectedValidInput = inputCandidate
        mode = 'wrapped-markdown'
        break
      }
    }
  }

  if (!selected && successDocData !== undefined) {
    const dataAttempt = safeParseSchema(candidate.schema, successDocData)
    if (dataAttempt.ok && dataAttempt.result.success) {
      selected = dataAttempt.result
      mode = 'data'
    }
  }

  if (!selected) {
    const detail =
      directAttempt.ok && directAttempt.result.success === false
        ? 'Valid input failed for selected schema'
        : directAttempt.ok
          ? 'Valid input did not produce success=true'
          : String(directAttempt.error?.message ?? directAttempt.error)

    return {
      ok: false,
      reason: 'valid_input_failed',
      detail,
      normalizedSchema,
      candidate: candidate.name,
      candidateKind: candidate.kind,
      validMarkdown: selectedValidInput,
    }
  }

  let invalidMarkdown = scenario.invalidMarkdown
  let invalidResult = null

  if (mode === 'data') {
    const invalidData = mutateDataValue(successDocData)
    const dataInvalidAttempt = safeParseSchema(candidate.schema, invalidData)
    if (dataInvalidAttempt.ok && dataInvalidAttempt.result.success === false) {
      invalidResult = dataInvalidAttempt.result
      if (!invalidMarkdown) {
        invalidMarkdown = mutateMarkdownRemoveHeading(scenario.inputMarkdown)
      }
    }
  } else {
    const evaluateMarkdown = (markdownValue) => {
      if (mode === 'wrapped-markdown') {
        const wrappedInput = ensureSectionAnchorInInput(markdownValue, anchor)
        const wrappedAttempt = safeParseSchema(wrappedSchema, wrappedInput)
        if (!wrappedAttempt.ok) return null
        if (wrappedAttempt.result.success) {
          return {
            success: true,
            data: wrappedAttempt.result.data.__value,
          }
        }
        return {
          success: false,
          error: {
            issues: cloneIssuesWithoutPrefix(wrappedAttempt.result.error.issues, '__value'),
          },
        }
      }

      const direct = safeParseSchema(candidate.schema, markdownValue)
      if (!direct.ok) return null
      return direct.result
    }

    const candidateInputs = []
    if (scenario.invalidMarkdown) {
      candidateInputs.push(scenario.invalidMarkdown)
    }

    candidateInputs.push(mutateMarkdownRemoveSemanticLine(selectedValidInput))
    candidateInputs.push(mutateMarkdownSwapNumberedSections(selectedValidInput))
    candidateInputs.push(mutateMarkdownRemoveHeading(selectedValidInput))
    candidateInputs.push('')

    for (const candidateInput of candidateInputs) {
      const attempt = evaluateMarkdown(candidateInput)
      if (!attempt) continue
      if (attempt.success === false && Array.isArray(attempt.error?.issues) && attempt.error.issues.length > 0) {
        invalidMarkdown = candidateInput
        invalidResult = attempt
        break
      }
    }
  }

  if (!invalidResult) {
    return {
      ok: false,
      reason: 'invalid_input_failed',
      detail: 'Could not generate Invalid Input Markdown that fails with issues',
      normalizedSchema,
      candidate: candidate.name,
      candidateKind: candidate.kind,
      mode,
    }
  }

  return {
    ok: true,
    normalizedSchema,
    validResult: selected,
    invalidResult,
    invalidMarkdown,
    validMarkdown: selectedValidInput,
    mode,
    candidate: candidate.name,
    candidateKind: candidate.kind,
  }
}

function extractScenariosFromContent(file, content) {
  const lines = splitLines(content)
  const headings = parseHeadings(lines)
  const scenarios = []

  for (const inputHeading of headings) {
    if (inputHeading.text !== INPUT_HEADING_TEXT) continue

    const nextInputLine = findNextInputLine(headings, inputHeading.line, lines.length)
    const schemaHeading = findHeadingBetween(headings, inputHeading.line, nextInputLine, SCHEMA_HEADING_TEXT)
    const resultHeading = schemaHeading
      ? findHeadingBetween(headings, schemaHeading.line, nextInputLine, RESULT_HEADING_TEXT)
      : null
    const successHeading = resultHeading
      ? findHeadingBetween(headings, resultHeading.line, nextInputLine, SUCCESS_HEADING_TEXT)
      : null
    const errorHeading = successHeading
      ? findHeadingBetween(headings, successHeading.line, nextInputLine, ERROR_HEADING_TEXT)
      : null
    const invalidHeading = schemaHeading
      ? findHeadingBetween(headings, inputHeading.line, schemaHeading.line, INVALID_INPUT_HEADING_TEXT)
      : null

    if (!schemaHeading || !resultHeading || !successHeading || !errorHeading) {
      scenarios.push({
        file,
        line: inputHeading.line + 1,
        parseError: 'missing_required_headings',
        inputHeading,
      })
      continue
    }

    const inputFence = findFenceInRange(lines, inputHeading.line, schemaHeading.line, MARKDOWN_LANGS)
    const schemaFence = findFenceInRange(lines, schemaHeading.line, resultHeading.line, new Set(['ts']))
    const successFence = findFenceInRange(lines, successHeading.line, errorHeading.line, new Set(['json']))
    const errorFence = findFenceInRange(lines, errorHeading.line, nextInputLine, new Set(['json']))
    const invalidFence = invalidHeading
      ? findFenceInRange(lines, invalidHeading.line, schemaHeading.line, MARKDOWN_LANGS)
      : null

    if (!inputFence || !schemaFence || !successFence || !errorFence) {
      scenarios.push({
        file,
        line: inputHeading.line + 1,
        parseError: 'missing_required_fences',
        inputHeading,
      })
      continue
    }

    scenarios.push({
      file,
      line: inputHeading.line + 1,
      parseError: null,
      inputHeading,
      invalidHeading,
      schemaHeading,
      resultHeading,
      successHeading,
      errorHeading,
      nextInputLine,
      inputFence,
      invalidFence,
      schemaFence,
      successFence,
      errorFence,
      inputMarkdown: fenceText(lines, inputFence),
      invalidMarkdown: invalidFence ? fenceText(lines, invalidFence) : null,
      schemaCode: fenceText(lines, schemaFence),
      successJson: fenceText(lines, successFence),
      errorJson: fenceText(lines, errorFence),
    })
  }

  return {
    lines,
    headings,
    scenarios,
  }
}

function applyScenarioFixes(content, updates) {
  let working = content
  for (let index = 0; index < updates.length; index += 1) {
    const parsed = extractScenariosFromContent('in-memory', working)
    const scenario = parsed.scenarios[index]
    if (!scenario || scenario.parseError) continue

    const next = updates[index]
    if (!next) continue

    const lines = parsed.lines

    const edits = []

    if (typeof next.validMarkdown === 'string' && next.validMarkdown.length > 0) {
      edits.push({
        start: scenario.inputFence.openLine + 1,
        end: scenario.inputFence.closeLine,
        replacement: next.validMarkdown.split('\n'),
      })
    }

    edits.push({
      start: scenario.schemaFence.openLine + 1,
      end: scenario.schemaFence.closeLine,
      replacement: next.schemaCode.split('\n'),
    })
    edits.push({
      start: scenario.successFence.openLine + 1,
      end: scenario.successFence.closeLine,
      replacement: formatJson(next.successJson).split('\n'),
    })
    edits.push({
      start: scenario.errorFence.openLine + 1,
      end: scenario.errorFence.closeLine,
      replacement: formatJson(next.errorJson).split('\n'),
    })

    if (scenario.invalidHeading && scenario.invalidFence) {
      edits.push({
        start: scenario.invalidFence.openLine + 1,
        end: scenario.invalidFence.closeLine,
        replacement: next.invalidMarkdown.split('\n'),
      })
    }

    edits
      .sort((left, right) => right.start - left.start)
      .forEach((edit) => {
        lines.splice(edit.start, edit.end - edit.start, ...edit.replacement)
      })

    working = joinLines(lines)
  }

  return working
}

function walkMarkdownFiles(rootDir) {
  const files = []
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath))
      continue
    }
    if (entry.isFile() && fullPath.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8')
}

export {
  INPUT_HEADING_TEXT,
  INVALID_INPUT_HEADING_TEXT,
  applyScenarioFixes,
  compareIssueShape,
  evaluateScenario,
  extractScenariosFromContent,
  formatJson,
  parseJsonSafe,
  readUtf8,
  healResultJsonFences,
  walkMarkdownFiles,
  writeUtf8,
}
