import type { TypeMdIssue } from '@/lib/mdshape'

export type ThemeMode = 'dark' | 'light'
export type WorkspaceMode = 'edit' | 'split' | 'preview' | 'structure'
export type ResultTab = 'success' | 'error'

export type Severity = 'error' | 'warning' | 'info'

export type PlaygroundResult = {
  success: boolean
  data?: unknown
  error?: {
    issues: TypeMdIssue[]
    formatted?: unknown
  }
}

export type ExecutionOutput = {
  schema: unknown
  parseResult: unknown
}

export type ValidationIssueView = {
  id: string
  severity: Severity
  code: string
  message: string
  path: Array<string | number>
  line?: number
  expected?: string
  actual?: string
  fix?: string
}

export type HeadingNode = {
  id: string
  text: string
  depth: number
  line: number
  endLine: number
}

export type SchemaNodeMeta = {
  id: string
  label: string
  kind: string
  constraints: string[]
  children: SchemaNodeMeta[]
}

export type SchemaSectionMeta = {
  id: string
  key: string
  name: string
  fields: Array<{
    name: string
    type: string
    constraints: string[]
    wrappers: string[]
  }>
}

export type SchemaIntrospection = {
  tree: SchemaNodeMeta[]
  sections: SchemaSectionMeta[]
}

export type HeadingValidationState = {
  heading: HeadingNode
  issues: ValidationIssueView[]
}

const warningCodes = new Set<string>([
  'list_too_small',
  'value_too_big',
  'value_too_small',
  'unexpected_paragraph',
  'unrecognized_key',
  'section_order_mismatch',
  'subsection_order_mismatch',
  'field_order_mismatch',
  'label_order_mismatch',
  'block_order_mismatch',
  'block_repeat_not_allowed',
])

const infoCodes = new Set<string>(['transform_failed'])

export const toSeverity = (code: string): Severity => {
  if (warningCodes.has(code)) return 'warning'
  if (infoCodes.has(code)) return 'info'
  return 'error'
}

export const issueFixHint = (code: string): string | undefined => {
  switch (code) {
    case 'missing_section':
      return 'Insert the missing section heading and required content blocks.'
    case 'missing_field':
      return 'Add the missing field line in the expected key: value format.'
    case 'missing_labeled_value':
      return 'Add the missing labeled entry using **LABEL:** syntax.'
    case 'invalid_enum_value':
      return 'Use one of the allowed enum options from schema rules.'
    case 'string_too_short':
      return 'Increase the text length to satisfy minimum characters.'
    case 'list_too_small':
      return 'Add more items to satisfy minimum cardinality.'
    case 'missing_child_heading':
      return 'Add missing child headings at the required depth.'
    case 'missing_expected_subsection':
      return 'Insert the expected subsection heading in sequence.'
    case 'missing_footnote_definition':
      return 'Add a matching footnote definition like [^id]: ... for each inline [^id] reference.'
    case 'invalid_table':
      return 'Fix table structure or required headers to match schema.'
    case 'missing_mermaid':
      return 'Insert a mermaid fenced block (```mermaid ... ```).' 
    case 'invalid_mermaid':
      return 'Fix Mermaid syntax or expected diagram constraints.'
    case 'invalid_math_block':
      return 'Fix the math block content to satisfy schema constraints.'
    case 'invalid_math_inline':
      return 'Fix inline math expression constraints.'
    case 'missing_html_inline_element':
      return 'Add at least one inline HTML element like <span>text</span> or <br />.'
    case 'invalid_html_inline_element':
      return 'Adjust the element schema fields (tag/attrs/text/raw) to match extracted output.'
    case 'refine_failed':
      return 'Adjust conditional refine rules or provide required dependent fields.'
    default:
      return undefined
  }
}

export const buildValidationView = (issues: TypeMdIssue[]): ValidationIssueView[] =>
  issues.map((issue, index) => ({
    id: `${issue.code}:${issue.line ?? 'x'}:${index}`,
    severity: toSeverity(issue.code),
    code: issue.code,
    message: issue.message,
    path: issue.path,
    line: issue.line,
    expected: issue.code.startsWith('missing_') ? 'Required by schema' : undefined,
    actual: issue.code.startsWith('missing_') ? 'Not found in markdown' : undefined,
    fix: issueFixHint(issue.code),
  }))

export const groupBySeverity = (issues: ValidationIssueView[]) => {
  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')
  const info = issues.filter((issue) => issue.severity === 'info')
  return { errors, warnings, info }
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[`'"“”’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const parseHeadingNodes = (markdown: string): HeadingNode[] => {
  const lines = markdown.split(/\r?\n/)
  const headings: HeadingNode[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    const match = /^(#{1,6})\s+(.*)$/.exec(line)
    if (!match) continue
    const headingText = match[2] ?? ''
    const headingDepth = (match[1] ?? '').length

    headings.push({
      id: `${slugify(headingText || `section-${index + 1}`)}-${index + 1}`,
      text: headingText.trim(),
      depth: headingDepth,
      line: index + 1,
      endLine: lines.length,
    })
  }

  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index]
    if (!current) continue
    const next = headings[index + 1]
    current.endLine = next ? Math.max(current.line, next.line - 1) : lines.length
  }

  return headings
}

export const mapIssuesToHeadings = (
  headings: HeadingNode[],
  issues: ValidationIssueView[],
): HeadingValidationState[] =>
  headings.map((heading) => ({
    heading,
    issues: issues.filter((issue) => {
      if (!issue.line) return false
      return issue.line >= heading.line && issue.line <= heading.endLine
    }),
  }))

export const simpleHash = (value: string): string => {
  let hash = 5381
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }
  return (hash >>> 0).toString(36)
}

export const getDocumentStorageKey = (title: string) =>
  `mdshape:playground:v2:doc:${simpleHash(title || 'untitled')}`

export const getPrefsStorageKey = () => 'mdshape:playground:v2:prefs'
