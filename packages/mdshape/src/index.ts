import { block } from './builders/block'
import { document } from './builders/document'
import { metadataObject, metadata } from './builders/frontmatter'
import { heading } from './builders/heading'
import { headingText } from './builders/heading-text'
import { match } from './builders/match'
import { object } from './builders/object'
import { array, boolean, coerce, date, email, enumeration, list, literal, number, record, string, tuple, url } from './builders/primitives'
import { section } from './builders/section'
import { discriminatedUnion, union } from './builders/union'
import { preprocess } from './core/schema'
import { getErrorMap, setErrorMap } from './core/errors'

export {
  TypeMdError,
  formatIssuesWithSource,
  type FormatIssuesWithSourceOptions,
  type TypeMdFormattedIssue,
  type TypeMdIssue,
  type TypeMdIssueCode,
  type TypeMdErrorMap,
  getErrorMap,
  setErrorMap,
} from './core/errors'

export const md = {
  block,
  document,
  metadataObject,
  metadata,
  object,
  enum: enumeration,
  heading,
  headingText,
  section,
  match,
  string,
  email,
  number,
  boolean,
  url,
  date,
  literal,
  array,
  tuple,
  record,
  list,
  preprocess,
  coerce,
  union,
  discriminatedUnion,
  setErrorMap,
  getErrorMap,
}
