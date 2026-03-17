import fs from 'node:fs'
import path from 'node:path'

const typesRoot = path.resolve('docs/api/types')

function walkMarkdownFiles(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(full))
      continue
    }
    if (entry.isFile() && full.endsWith('.md') && entry.name !== 'index.md') {
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

function findLine(lines, exact) {
  return lines.findIndex((line) => line.trim() === exact)
}

function findFirstLikelyInputStart(lines, fromLine, toLine) {
  for (let index = fromLine; index < toLine; index += 1) {
    const trimmed = lines[index].trim()
    if (!trimmed) continue
    if (
      /^#{1,3}\s+/.test(trimmed) ||
      /^[-*]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed) ||
      /^\*\*[^*]+:\*\*/.test(trimmed) ||
      /^\|.+\|/.test(trimmed) ||
      /^```|^~~~/.test(trimmed)
    ) {
      return index
    }
  }
  return toLine
}

function trimTrailingFence(lines) {
  const next = [...lines]
  while (next.length > 0 && next[next.length - 1].trim() === '') {
    next.pop()
  }
  const last = next[next.length - 1]?.trim()
  if (last === '```' || last === '~~~') {
    next.pop()
  }
  while (next.length > 0 && next[next.length - 1].trim() === '') {
    next.pop()
  }
  return next
}

function ensureTitleInInput(inputLines, fallbackTitle) {
  const hasH1 = inputLines.some((line) => /^#\s+/.test(line.trim()))
  if (hasH1) return inputLines
  return [`# ${fallbackTitle}`, '', ...inputLines]
}

function buildInvalidFromInput(inputLines) {
  const next = [...inputLines]
  const h1Index = next.findIndex((line) => /^#\s+/.test(line.trim()))
  if (h1Index >= 0) {
    next.splice(h1Index, 1)
  } else if (next.length > 0) {
    next.shift()
  }
  return next.join('\n').trim()
}

function parseSuccessTitle(content) {
  const successMatch = content.match(/####\s+Success[\s\S]*?```json\n([\s\S]*?)```/m)
  if (!successMatch) return null
  try {
    const parsed = JSON.parse(successMatch[1])
    const title = parsed?.data?.title
    return typeof title === 'string' ? title : null
  } catch {
    return null
  }
}

function createFallbackTemplate(fileTitle, signature) {
  const heading = fileTitle || 'Example'
  const signatureHeading = signature ? `### \`${signature}\`` : '### Signature'
  return [
    signatureHeading,
    '',
    '### Input Markdown',
    '',
    '```md',
    `# ${heading}`,
    '```',
    '',
    '### Invalid Input Markdown',
    '',
    '```md',
    '',
    '```',
    '',
    '### Schema',
    '',
    '```ts',
    "import { md } from '@markschema/mdshape'",
    '',
    'const schema = md.document({',
    '  title: md.heading(1),',
    '})',
    '```',
    '',
    '### Result',
    '',
    '#### Success',
    '',
    '```json',
    JSON.stringify({ success: true, data: { title: heading } }, null, 2),
    '```',
    '',
    '#### Error',
    '',
    'Failure trigger: The input violates one or more constraints declared in the schema; use `issues[].path` and `issues[].code` to locate the exact failing node.',
    '',
    '```json',
    JSON.stringify(
      {
        success: false,
        error: {
          issues: [{ code: 'missing_heading' }],
        },
      },
      null,
      2,
    ),
    '```',
    '',
  ]
}

let touched = 0

for (const file of walkMarkdownFiles(typesRoot)) {
  const original = fs.readFileSync(file, 'utf8')
  const lines = splitLines(original)
  const hasInput = original.includes('### Input Markdown')
  const hasSchema = original.includes('### Schema')
  const hasResult = original.includes('### Result')
  const hasSuccess = original.includes('#### Success')
  const hasError = original.includes('#### Error')

  const title = (original.match(/^#\s+(.+)$/m) ?? [null, 'Example'])[1]
  const signature = (original.match(/^Signature:\s*`([^`]+)`$/m) ?? [null, null])[1]

  if (!hasSchema || !hasResult || !hasSuccess || !hasError) {
    const whenLine = findLine(lines, '## When to Use')
    if (whenLine >= 0) {
      const start = whenLine + 4
      const replacement = createFallbackTemplate(title, signature)
      lines.splice(start, lines.length - start, ...replacement)
      const nextContent = joinLines(lines)
      if (nextContent !== original) {
        fs.writeFileSync(file, nextContent, 'utf8')
        touched += 1
      }
    }
    continue
  }

  if (hasInput) continue

  const whenLine = findLine(lines, '## When to Use')
  const schemaLine = findLine(lines, '### Schema')
  if (whenLine === -1 || schemaLine === -1 || schemaLine <= whenLine) continue

  const startProbe = whenLine + 1
  const inputStart = findFirstLikelyInputStart(lines, startProbe, schemaLine)
  let inputLines = lines.slice(inputStart, schemaLine)
  inputLines = trimTrailingFence(inputLines)
  if (inputLines.length === 0) {
    inputLines = [`# ${title}`]
  }

  const fallbackTitle = parseSuccessTitle(original) ?? title
  inputLines = ensureTitleInInput(inputLines, fallbackTitle)
  const invalidMarkdown = buildInvalidFromInput(inputLines)

  const block = []
  if (signature) {
    block.push(`### \`${signature}\``, '')
  }
  block.push('### Input Markdown', '', '```md', ...inputLines, '```', '')
  block.push('### Invalid Input Markdown', '', '```md', invalidMarkdown, '```', '')

  lines.splice(inputStart, schemaLine - inputStart, ...block)
  const nextContent = joinLines(lines)
  if (nextContent !== original) {
    fs.writeFileSync(file, nextContent, 'utf8')
    touched += 1
  }
}

console.log(`repaired truncated sections in ${touched} file(s)`)
