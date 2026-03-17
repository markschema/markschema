import type { FormatIssuesWithSourceOptions, TypeMdFormattedIssue, TypeMdIssue } from './errors'

export type TypeMdParseError = {
  issues: TypeMdIssue[]
  format: (source: string, options?: FormatIssuesWithSourceOptions) => TypeMdFormattedIssue[]
}

export type SafeParseSuccess<T> = {
  success: true
  data: T
}

export type SafeParseFailure = {
  success: false
  error: TypeMdParseError
}

export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure
