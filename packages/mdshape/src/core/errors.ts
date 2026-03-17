import type { TypeMdPosition } from './position'

export type TypeMdIssueCode =
  | 'invalid_type'
  | 'missing_heading'
  | 'heading_pattern_mismatch'
  | 'missing_section'
  | 'missing_field'
  | 'invalid_email'
  | 'invalid_number'
  | 'invalid_boolean'
  | 'invalid_url'
  | 'invalid_date'
  | 'invalid_literal'
  | 'string_too_short'
  | 'list_too_small'
  | 'value_too_small'
  | 'value_too_big'
  | 'missing_paragraph'
  | 'unexpected_paragraph'
  | 'missing_child_heading'
  | 'child_heading_depth_mismatch'
  | 'missing_labeled_value'
  | 'invalid_enum_value'
  | 'missing_list'
  | 'list_item_invalid'
  | 'invalid_union'
  | 'missing_union_discriminator'
  | 'invalid_union_discriminator'
  | 'missing_table'
  | 'missing_blockquote'
  | 'missing_code_fence'
  | 'missing_mermaid'
  | 'missing_math_block'
  | 'missing_link'
  | 'missing_image'
  | 'missing_footnote'
  | 'missing_footnote_definition'
  | 'missing_task_list'
  | 'invalid_table'
  | 'invalid_blockquote'
  | 'invalid_code_fence'
  | 'invalid_mermaid'
  | 'invalid_math_block'
  | 'invalid_link'
  | 'invalid_image'
  | 'invalid_footnote'
  | 'invalid_task_item'
  | 'section_order_mismatch'
  | 'duplicate_section'
  | 'subsection_order_mismatch'
  | 'missing_expected_subsection'
  | 'label_order_mismatch'
  | 'field_order_mismatch'
  | 'missing_expected_field'
  | 'unrecognized_key'
  | 'missing_ordered_list'
  | 'invalid_ordered_list'
  | 'missing_nested_list'
  | 'invalid_nested_list'
  | 'missing_reference_link'
  | 'invalid_reference_link'
  | 'missing_autolink'
  | 'invalid_autolink'
  | 'missing_html_block'
  | 'invalid_html_block'
  | 'missing_html_inline'
  | 'missing_html_inline_element'
  | 'invalid_html_inline'
  | 'invalid_html_inline_element'
  | 'missing_math_inline'
  | 'invalid_math_inline'
  | 'missing_frontmatter'
  | 'invalid_frontmatter'
  | 'block_order_mismatch'
  | 'block_repeat_not_allowed'
  | 'refine_failed'
  | 'transform_failed'

export type TypeMdUnionVariantError = {
  variant: string
  issues: TypeMdIssue[]
}

export type TypeMdIssue = {
  code: TypeMdIssueCode
  message: string
  path: Array<string | number>
  line?: number
  position?: TypeMdPosition
  unionErrors?: TypeMdUnionVariantError[]
  _defaultMessage?: string
  _messageIsExplicit?: boolean
  _schemaErrorMaps?: TypeMdErrorMap[]
}

export type TypeMdErrorMap = (issue: TypeMdIssue) => string | undefined

export type FormatIssuesWithSourceOptions = {
  lineOffset?: number | 'auto'
  includeLineText?: boolean
}

export type TypeMdFormattedIssue = Omit<
  TypeMdIssue,
  'unionErrors' | '_defaultMessage' | '_messageIsExplicit' | '_schemaErrorMaps'
> & {
  lineText?: string
  unionErrors?: Array<{
    variant: string
    issues: TypeMdFormattedIssue[]
  }>
}

let globalErrorMap: TypeMdErrorMap | undefined

export const setErrorMap = (map?: TypeMdErrorMap) => {
  globalErrorMap = map
}

export const getErrorMap = (): TypeMdErrorMap | undefined => globalErrorMap

const clampLine = (line: number): number => Math.max(1, line)

const formatIssue = (
  issue: TypeMdIssue,
  lines: string[],
  lineOffset: number,
  includeLineText: boolean,
): TypeMdFormattedIssue => {
  const displayLine = issue.line !== undefined ? clampLine(issue.line - lineOffset) : undefined
  const displayPosition =
    issue.position === undefined
      ? undefined
      : {
          ...issue.position,
          start: {
            ...issue.position.start,
            line: clampLine(issue.position.start.line - lineOffset),
          },
          end:
            issue.position.end === undefined
              ? undefined
              : {
                  ...issue.position.end,
                  line: clampLine(issue.position.end.line - lineOffset),
                },
        }

  const lineForText = issue.line ?? issue.position?.start.line
  const lineText =
    includeLineText && lineForText !== undefined ? lines[Math.max(0, lineForText - 1)] : undefined

  const formattedUnionErrors = issue.unionErrors?.map((variant) => ({
    variant: variant.variant,
    issues: variant.issues.map((variantIssue) =>
      formatIssue(variantIssue, lines, lineOffset, includeLineText),
    ),
  }))

  return {
    code: issue.code,
    message: issue.message,
    path: issue.path,
    line: displayLine,
    position: displayPosition,
    unionErrors: formattedUnionErrors,
    lineText,
  }
}

export const formatIssuesWithSource = (
  issues: TypeMdIssue[],
  source: string,
  options?: FormatIssuesWithSourceOptions,
): TypeMdFormattedIssue[] => {
  const lines = source.split(/\r?\n/)
  const includeLineText = options?.includeLineText ?? true
  const lineOffset =
    options?.lineOffset === undefined || options.lineOffset === 'auto'
      ? source.startsWith('\n')
        ? 1
        : 0
      : options.lineOffset

  return issues.map((issue) => formatIssue(issue, lines, lineOffset, includeLineText))
}

export class TypeMdError extends Error {
  readonly issues: TypeMdIssue[]

  constructor(issues: TypeMdIssue[]) {
    super('Markdown validation failed')
    this.name = 'TypeMdError'
    this.issues = issues
  }

  format(source: string, options?: FormatIssuesWithSourceOptions): TypeMdFormattedIssue[] {
    return formatIssuesWithSource(this.issues, source, options)
  }
}
