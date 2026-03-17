import {
  TypeMdError,
  formatIssuesWithSource,
  getErrorMap,
  type TypeMdErrorMap,
  type TypeMdIssue,
  type TypeMdIssueCode,
} from './errors'
import { lineFromPosition, positionFromLine, type TypeMdPosition } from './position'
import type { SafeParseResult } from './result'

export type ParsePath = Array<string | number>
export type SectionAnchor = {
  sectionName: string
  path: ParsePath
}

export type ParseOptions = {
  errorMap?: TypeMdErrorMap
}

export type ParseContext = {
  issues: TypeMdIssue[]
  path: ParsePath
  sectionOrderChecks?: Set<string>
}

export const createContext = (): ParseContext => ({
  issues: [],
  path: [],
  sectionOrderChecks: new Set<string>(),
})

export const withPath = (ctx: ParseContext, segment: string | number): ParseContext => ({
  issues: ctx.issues,
  path: [...ctx.path, segment],
  sectionOrderChecks: ctx.sectionOrderChecks,
})

export const mergeSectionAnchors = (...collections: SectionAnchor[][]): SectionAnchor[] => {
  const seen = new Set<string>()
  const merged: SectionAnchor[] = []

  for (const collection of collections) {
    for (const anchor of collection) {
      const key = `${anchor.sectionName}::${anchor.path.join('.')}`
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      merged.push({
        sectionName: anchor.sectionName,
        path: [...anchor.path],
      })
    }
  }

  return merged
}

export const addIssue = (
  ctx: ParseContext,
  issue: {
    code: TypeMdIssueCode
    message: string
    path?: ParsePath
    line?: number
    position?: TypeMdPosition
    unionErrors?: TypeMdIssue['unionErrors']
    explicitMessage?: boolean
  },
) => {
  const position = issue.position ?? positionFromLine(issue.line ?? 1)

  ctx.issues.push({
    code: issue.code,
    message: issue.message,
    path: issue.path ?? ctx.path,
    line: issue.line ?? lineFromPosition(position),
    position,
    unionErrors: issue.unionErrors,
    _defaultMessage: issue.message,
    _messageIsExplicit: issue.explicitMessage === true,
  })
}

export const applyFallbackLine = (ctx: ParseContext, fromIndex: number, line?: number) => {
  applyFallbackPosition(ctx, fromIndex, positionFromLine(line), line)
}

export const applyFallbackPosition = (
  ctx: ParseContext,
  fromIndex: number,
  position?: TypeMdPosition,
  line?: number,
) => {
  if (line === undefined) {
    line = lineFromPosition(position)
  }

  if (line === undefined && position === undefined) {
    return
  }

  for (let index = fromIndex; index < ctx.issues.length; index += 1) {
    if (ctx.issues[index].position === undefined && position !== undefined) {
      ctx.issues[index].position = position
    }
    if (ctx.issues[index].line === undefined) {
      ctx.issues[index].line = line ?? lineFromPosition(ctx.issues[index].position)
    }
  }
}

const resolveMappedMessage = (
  issue: TypeMdIssue,
  callErrorMap?: TypeMdErrorMap,
  globalErrorMap?: TypeMdErrorMap,
): string => {
  const defaultMessage = issue._defaultMessage ?? issue.message

  if (issue._messageIsExplicit) {
    return issue.message
  }

  const issueForMap: TypeMdIssue = {
    ...issue,
    message: defaultMessage,
  }

  if (callErrorMap) {
    const mapped = callErrorMap(issueForMap)
    if (mapped !== undefined) {
      return mapped
    }
  }

  for (const schemaErrorMap of issue._schemaErrorMaps ?? []) {
    const mapped = schemaErrorMap(issueForMap)
    if (mapped !== undefined) {
      return mapped
    }
  }

  if (globalErrorMap) {
    const mapped = globalErrorMap(issueForMap)
    if (mapped !== undefined) {
      return mapped
    }
  }

  return defaultMessage
}

const finalizeIssueTree = (
  issues: TypeMdIssue[],
  callErrorMap?: TypeMdErrorMap,
  globalErrorMap?: TypeMdErrorMap,
) => {
  for (const issue of issues) {
    issue.message = resolveMappedMessage(issue, callErrorMap, globalErrorMap)

    if (issue.unionErrors) {
      for (const variant of issue.unionErrors) {
        finalizeIssueTree(variant.issues, callErrorMap, globalErrorMap)
      }
    }

    delete issue._defaultMessage
    delete issue._messageIsExplicit
    delete issue._schemaErrorMaps
  }
}

export abstract class BaseSchema<TInput, TOutput> {
  get acceptsUndefined(): boolean {
    return false
  }

  get acceptsNull(): boolean {
    return false
  }

  getSectionAnchors(): SectionAnchor[] {
    return []
  }

  unwrapOptional(): BaseSchema<any, any> {
    return this as BaseSchema<any, any>
  }

  protected abstract _parse(input: TInput, ctx: ParseContext): TOutput | undefined

  run(input: TInput, ctx: ParseContext): TOutput | undefined {
    return this._parse(input, ctx)
  }

  optional(): BaseSchema<TInput | undefined, TOutput | undefined> {
    return new OptionalSchema(this)
  }

  nullable(): BaseSchema<TInput | null, TOutput | null> {
    return new NullableSchema(this)
  }

  default(
    value: Exclude<TOutput, undefined>,
  ): BaseSchema<TInput | undefined, Exclude<TOutput, undefined>> {
    return new DefaultSchema(this, value)
  }

  transform<TNext>(
    fn: (value: TOutput) => TNext,
    options?: {
      code?: TypeMdIssueCode
      message?: string
    },
  ): BaseSchema<TInput, TNext> {
    return new TransformSchema(this, fn, options)
  }

  pipeline<TNext>(next: BaseSchema<TOutput, TNext>): BaseSchema<TInput, TNext> {
    return new PipelineSchema(this, next)
  }

  refine<TNarrow extends TOutput>(
    check: (value: TOutput) => value is TNarrow,
    options?: {
      code?: TypeMdIssueCode
      message?: string
      path?: ParsePath
    },
  ): BaseSchema<TInput, TNarrow>
  refine(
    check: (value: TOutput) => boolean,
    options?: {
      code?: TypeMdIssueCode
      message?: string
      path?: ParsePath
    },
  ): BaseSchema<TInput, TOutput>
  refine(
    check: ((value: TOutput) => boolean) | ((value: TOutput) => value is TOutput),
    options?: {
      code?: TypeMdIssueCode
      message?: string
      path?: ParsePath
    },
  ): BaseSchema<TInput, TOutput> {
    return new RefineSchema(this, check as (value: TOutput) => boolean, options)
  }

  errorMap(map: TypeMdErrorMap): BaseSchema<TInput, TOutput> {
    return new ErrorMapSchema(this, map)
  }

  parse(input: TInput, options?: ParseOptions): TOutput {
    const result = this.safeParse(input, options)
    if (!result.success) {
      throw new TypeMdError(result.error.issues)
    }
    return result.data
  }

  safeParse(input: TInput, options?: ParseOptions): SafeParseResult<TOutput> {
    const ctx = createContext()
    const data = this._parse(input, ctx)

    const failed = ctx.issues.length > 0 || (data === undefined && !this.acceptsUndefined)

    if (failed) {
      finalizeIssueTree(ctx.issues, options?.errorMap, getErrorMap())
      return {
        success: false,
        error: {
          issues: ctx.issues,
          format: (source, formatOptions) => formatIssuesWithSource(ctx.issues, source, formatOptions),
        },
      }
    }

    return {
      success: true,
      data: data as TOutput,
    }
  }

  validate(input: TInput, options?: ParseOptions): boolean {
    return this.safeParse(input, options).success
  }
}

class OptionalSchema<TInput, TOutput> extends BaseSchema<TInput | undefined, TOutput | undefined> {
  override get acceptsUndefined(): boolean {
    return true
  }

  constructor(private readonly inner: BaseSchema<TInput, TOutput>) {
    super()
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return this.inner.unwrapOptional()
  }

  protected _parse(input: TInput | undefined, ctx: ParseContext): TOutput | undefined {
    if (input === undefined) {
      return undefined
    }

    return this.inner.run(input, ctx)
  }
}

class NullableSchema<TInput, TOutput> extends BaseSchema<TInput | null, TOutput | null> {
  override get acceptsUndefined(): boolean {
    return this.inner.acceptsUndefined
  }

  override get acceptsNull(): boolean {
    return true
  }

  constructor(private readonly inner: BaseSchema<TInput, TOutput>) {
    super()
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new NullableSchema(this.inner.unwrapOptional() as BaseSchema<any, any>)
  }

  protected _parse(input: TInput | null, ctx: ParseContext): TOutput | null | undefined {
    if (input === null) {
      return null
    }

    return this.inner.run(input, ctx)
  }
}

class DefaultSchema<TInput, TOutput> extends BaseSchema<
  TInput | undefined,
  Exclude<TOutput, undefined>
> {
  override get acceptsUndefined(): boolean {
    return true
  }

  constructor(
    private readonly inner: BaseSchema<TInput, TOutput>,
    private readonly defaultValue: Exclude<TOutput, undefined>,
  ) {
    super()
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new DefaultSchema(this.inner.unwrapOptional() as BaseSchema<any, any>, this.defaultValue as any)
  }

  protected _parse(input: TInput | undefined, ctx: ParseContext): Exclude<TOutput, undefined> | undefined {
    if (input === undefined) {
      return this.defaultValue
    }

    return this.inner.run(input, ctx) as Exclude<TOutput, undefined> | undefined
  }
}

class TransformSchema<TInput, TMid, TOutput> extends BaseSchema<TInput, TOutput> {
  constructor(
    private readonly inner: BaseSchema<TInput, TMid>,
    private readonly transformFn: (value: TMid) => TOutput,
    private readonly options?: {
      code?: TypeMdIssueCode
      message?: string
    },
  ) {
    super()
  }

  override get acceptsUndefined(): boolean {
    return this.inner.acceptsUndefined
  }

  override get acceptsNull(): boolean {
    return this.inner.acceptsNull
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new TransformSchema(
      this.inner.unwrapOptional() as BaseSchema<any, any>,
      this.transformFn as (value: any) => any,
      this.options,
    )
  }

  protected _parse(input: TInput, ctx: ParseContext): TOutput | undefined {
    const startIssueCount = ctx.issues.length
    const parsed = this.inner.run(input, ctx)

    if (ctx.issues.length > startIssueCount) {
      return undefined
    }

    if (parsed === undefined) {
      return undefined
    }

    try {
      return this.transformFn(parsed)
    } catch (error) {
      addIssue(ctx, {
        code: this.options?.code ?? 'transform_failed',
        message:
          this.options?.message ??
          `Transform failed: ${error instanceof Error ? error.message : String(error)}`,
        explicitMessage: this.options?.message !== undefined,
      })
      return undefined
    }
  }
}

class PipelineSchema<TInput, TMid, TOutput> extends BaseSchema<TInput, TOutput> {
  constructor(
    private readonly left: BaseSchema<TInput, TMid>,
    private readonly right: BaseSchema<TMid, TOutput>,
  ) {
    super()
  }

  override get acceptsUndefined(): boolean {
    return this.right.acceptsUndefined
  }

  override get acceptsNull(): boolean {
    return this.right.acceptsNull
  }

  override getSectionAnchors(): SectionAnchor[] {
    return mergeSectionAnchors(this.left.getSectionAnchors(), this.right.getSectionAnchors())
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new PipelineSchema(this.left.unwrapOptional() as BaseSchema<any, any>, this.right as BaseSchema<any, any>)
  }

  protected _parse(input: TInput, ctx: ParseContext): TOutput | undefined {
    const startIssueCount = ctx.issues.length
    const leftValue = this.left.run(input, ctx)
    if (ctx.issues.length > startIssueCount) {
      return undefined
    }

    if (leftValue === undefined) {
      return undefined
    }

    return this.right.run(leftValue, ctx)
  }
}

class RefineSchema<TInput, TOutput, TNarrow extends TOutput = TOutput> extends BaseSchema<TInput, TNarrow> {
  constructor(
    private readonly inner: BaseSchema<TInput, TOutput>,
    private readonly check: (value: TOutput) => boolean,
    private readonly options?: {
      code?: TypeMdIssueCode
      message?: string
      path?: ParsePath
    },
  ) {
    super()
  }

  override get acceptsUndefined(): boolean {
    return this.inner.acceptsUndefined
  }

  override get acceptsNull(): boolean {
    return this.inner.acceptsNull
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new RefineSchema(
      this.inner.unwrapOptional() as BaseSchema<any, any>,
      this.check as (value: any) => boolean,
      this.options,
    )
  }

  protected _parse(input: TInput, ctx: ParseContext): TNarrow | undefined {
    const startIssueCount = ctx.issues.length
    const parsed = this.inner.run(input, ctx)

    if (ctx.issues.length > startIssueCount || parsed === undefined) {
      return undefined
    }

    try {
      const valid = this.check(parsed)
      if (valid) {
        return parsed as TNarrow
      }
    } catch (error) {
      addIssue(ctx, {
        code: this.options?.code ?? 'refine_failed',
        message:
          this.options?.message ??
          `Refinement failed: ${error instanceof Error ? error.message : String(error)}`,
        path: this.options?.path ? [...ctx.path, ...this.options.path] : undefined,
        explicitMessage: this.options?.message !== undefined,
      })
      return undefined
    }

    addIssue(ctx, {
      code: this.options?.code ?? 'refine_failed',
      message: this.options?.message ?? 'Refinement check failed',
      path: this.options?.path ? [...ctx.path, ...this.options.path] : undefined,
      explicitMessage: this.options?.message !== undefined,
    })
    return undefined
  }
}

class ErrorMapSchema<TInput, TOutput> extends BaseSchema<TInput, TOutput> {
  constructor(
    private readonly inner: BaseSchema<TInput, TOutput>,
    private readonly map: TypeMdErrorMap,
  ) {
    super()
  }

  override get acceptsUndefined(): boolean {
    return this.inner.acceptsUndefined
  }

  override get acceptsNull(): boolean {
    return this.inner.acceptsNull
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new ErrorMapSchema(this.inner.unwrapOptional() as BaseSchema<any, any>, this.map)
  }

  protected _parse(input: TInput, ctx: ParseContext): TOutput | undefined {
    const startIssueCount = ctx.issues.length
    const parsed = this.inner.run(input, ctx)

    for (let index = startIssueCount; index < ctx.issues.length; index += 1) {
      const issue = ctx.issues[index]
      issue._schemaErrorMaps = [...(issue._schemaErrorMaps ?? []), this.map]
    }

    return parsed
  }
}

class PreprocessSchema<TInput, TMid, TOutput> extends BaseSchema<TInput, TOutput> {
  constructor(
    private readonly preprocessFn: (value: TInput) => TMid,
    private readonly inner: BaseSchema<TMid, TOutput>,
    private readonly options?: {
      code?: TypeMdIssueCode
      message?: string
    },
  ) {
    super()
  }

  override get acceptsUndefined(): boolean {
    return this.inner.acceptsUndefined
  }

  override get acceptsNull(): boolean {
    return this.inner.acceptsNull
  }

  override getSectionAnchors(): SectionAnchor[] {
    return this.inner.getSectionAnchors()
  }

  override unwrapOptional(): BaseSchema<any, any> {
    return new PreprocessSchema(
      this.preprocessFn as (value: any) => any,
      this.inner.unwrapOptional() as BaseSchema<any, any>,
      this.options,
    )
  }

  protected _parse(input: TInput, ctx: ParseContext): TOutput | undefined {
    let processed: TMid

    try {
      processed = this.preprocessFn(input)
    } catch (error) {
      addIssue(ctx, {
        code: this.options?.code ?? 'transform_failed',
        message:
          this.options?.message ??
          `Preprocess failed: ${error instanceof Error ? error.message : String(error)}`,
        explicitMessage: this.options?.message !== undefined,
      })
      return undefined
    }

    return this.inner.run(processed, ctx)
  }
}

export const preprocess = <TInput, TMid, TOutput>(
  fn: (value: TInput) => TMid,
  schema: BaseSchema<TMid, TOutput>,
  options?: {
    code?: TypeMdIssueCode
    message?: string
  },
): BaseSchema<TInput, TOutput> => new PreprocessSchema(fn, schema, options)
