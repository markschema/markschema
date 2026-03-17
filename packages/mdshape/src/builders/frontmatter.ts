import type { TypeMdDocument } from '../core/ast'
import { addIssue, applyFallbackPosition, type ParseContext, BaseSchema } from '../core/schema'

type InferSchemaOutput<TSchema> = TSchema extends BaseSchema<any, infer TOutput> ? TOutput : never

class MetadataSchema<TOutput> extends BaseSchema<TypeMdDocument, TOutput> {
  constructor(private readonly schema: BaseSchema<unknown, TOutput>) {
    super()
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TOutput | undefined {
    if (document.metadata === undefined) {
      addIssue(ctx, {
        code: 'missing_frontmatter',
        message: 'Missing YAML frontmatter block',
        line: document.frontmatterLine ?? 1,
        position: document.frontmatterPosition,
      })
      return undefined
    }

    const startIssueCount = ctx.issues.length
    const value = this.schema.run(document.metadata, ctx)
    applyFallbackPosition(
      ctx,
      startIssueCount,
      document.frontmatterPosition,
      document.frontmatterLine ?? 1,
    )
    return value
  }
}

class MetadataObjectSchema<TOutput> extends BaseSchema<TypeMdDocument, TOutput> {
  constructor(private readonly schema: BaseSchema<unknown, TOutput>) {
    super()
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TOutput | undefined {
    if (document.metadata === undefined) {
      addIssue(ctx, {
        code: 'missing_frontmatter',
        message: 'Missing YAML frontmatter block',
        line: document.frontmatterLine ?? 1,
        position: document.frontmatterPosition,
      })
      return undefined
    }

    if (document.frontmatterError) {
      addIssue(ctx, {
        code: 'invalid_frontmatter',
        message: `Invalid YAML frontmatter: ${document.frontmatterError}`,
        line: document.frontmatterLine ?? 1,
        position: document.frontmatterPosition,
      })
      return undefined
    }

    const startIssueCount = ctx.issues.length
    const value = this.schema.run(document.metadataObject, ctx)
    applyFallbackPosition(
      ctx,
      startIssueCount,
      document.frontmatterPosition,
      document.frontmatterLine ?? 1,
    )
    return value
  }
}

export const metadata = <TSchema extends BaseSchema<unknown, any>>(
  schema: TSchema,
): BaseSchema<TypeMdDocument, InferSchemaOutput<TSchema>> => new MetadataSchema(schema)

export const metadataObject = <TSchema extends BaseSchema<unknown, any>>(
  schema: TSchema,
): BaseSchema<TypeMdDocument, InferSchemaOutput<TSchema>> => new MetadataObjectSchema(schema)
