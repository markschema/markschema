import { addIssue, type ParseContext, BaseSchema } from '../core/schema'
import { ObjectSchema } from './object'
import { LiteralSchema } from './primitives'

type InferSchemaOutput<TSchema> = TSchema extends BaseSchema<any, infer TOutput> ? TOutput : never

type UnionVariantError = {
  variant: string
  issues: ParseContext['issues']
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const runVariant = <TOutput>(
  schema: BaseSchema<unknown, TOutput>,
  input: unknown,
  ctx: ParseContext,
): { success: true; value: TOutput | undefined } | { success: false; issues: ParseContext['issues'] } => {
  const variantCtx: ParseContext = {
    issues: [],
    path: [...ctx.path],
  }

  const parsed = schema.run(input, variantCtx)
  const isValid = variantCtx.issues.length === 0 && (parsed !== undefined || schema.acceptsUndefined)

  if (isValid) {
    return {
      success: true,
      value: parsed,
    }
  }

  return {
    success: false,
    issues: variantCtx.issues,
  }
}

export class UnionSchema<TSchemas extends readonly BaseSchema<unknown, any>[]> extends BaseSchema<
  unknown,
  InferSchemaOutput<TSchemas[number]>
> {
  constructor(private readonly schemas: TSchemas) {
    super()
  }

  protected _parse(input: unknown, ctx: ParseContext): InferSchemaOutput<TSchemas[number]> | undefined {
    const variantErrors: UnionVariantError[] = []

    for (let index = 0; index < this.schemas.length; index += 1) {
      const schema = this.schemas[index]
      const result = runVariant(schema, input, ctx)

      if (result.success) {
        return result.value as InferSchemaOutput<TSchemas[number]>
      }

      variantErrors.push({
        variant: `variant_${index + 1}`,
        issues: result.issues,
      })
    }

    addIssue(ctx, {
      code: 'invalid_union',
      message: 'Input does not match any union variant',
      unionErrors: variantErrors,
    })
    return undefined
  }
}

type DiscriminatedEntry = {
  literal: string | number | boolean
  schema: BaseSchema<unknown, any>
  variantName: string
}

export class DiscriminatedUnionSchema<
  TDiscriminator extends string,
  TSchemas extends readonly ObjectSchema<any>[],
> extends BaseSchema<unknown, InferSchemaOutput<TSchemas[number]>> {
  private readonly variantsByLiteral = new Map<string | number | boolean, DiscriminatedEntry>()

  constructor(
    private readonly discriminator: TDiscriminator,
    private readonly variants: TSchemas,
  ) {
    super()
    this.validateVariants()
  }

  private validateVariants() {
    for (let index = 0; index < this.variants.length; index += 1) {
      const variant = this.variants[index]
      const shape = variant.getShape()
      const discriminatorSchema = shape[this.discriminator]

      if (!discriminatorSchema) {
        throw new TypeError(
          `Invalid discriminatedUnion variant at index ${index}: missing discriminator "${this.discriminator}"`,
        )
      }

      if (!(discriminatorSchema instanceof LiteralSchema)) {
        throw new TypeError(
          `Invalid discriminatedUnion variant at index ${index}: discriminator "${this.discriminator}" must use md.literal(...)`,
        )
      }

      const literal = discriminatorSchema.getLiteralValue()
      if (this.variantsByLiteral.has(literal)) {
        throw new TypeError(
          `Invalid discriminatedUnion config: duplicated discriminator literal ${JSON.stringify(literal)}`,
        )
      }

      this.variantsByLiteral.set(literal, {
        literal,
        schema: variant as unknown as BaseSchema<unknown, InferSchemaOutput<TSchemas[number]>>,
        variantName: `${this.discriminator}=${JSON.stringify(literal)}`,
      })
    }
  }

  protected _parse(input: unknown, ctx: ParseContext): InferSchemaOutput<TSchemas[number]> | undefined {
    if (!isPlainObject(input)) {
      addIssue(ctx, {
        code: 'invalid_union_discriminator',
        message: `Expected object input for discriminated union "${this.discriminator}"`,
      })
      return undefined
    }

    const discriminatorValue = input[this.discriminator]
    if (discriminatorValue === undefined) {
      addIssue(ctx, {
        code: 'missing_union_discriminator',
        message: `Missing discriminator "${this.discriminator}"`,
      })
      return undefined
    }

    const matched = this.variantsByLiteral.get(discriminatorValue as string | number | boolean)
    if (!matched) {
      addIssue(ctx, {
        code: 'invalid_union_discriminator',
        message: `Invalid discriminator "${this.discriminator}" value "${String(discriminatorValue)}"`,
        unionErrors: [...this.variantsByLiteral.values()].map((entry) => ({
          variant: entry.variantName,
          issues: [],
        })),
      })
      return undefined
    }

    const result = runVariant(matched.schema, input, ctx)
    if (result.success) {
      return result.value as InferSchemaOutput<TSchemas[number]>
    }

    for (const issue of result.issues) {
      ctx.issues.push(issue)
    }

    return undefined
  }
}

export const union = <TSchemas extends readonly [BaseSchema<unknown, any>, ...BaseSchema<unknown, any>[]]>(
  schemas: TSchemas,
) => new UnionSchema(schemas)

export const discriminatedUnion = <
  TDiscriminator extends string,
  TSchemas extends readonly [ObjectSchema<any>, ...ObjectSchema<any>[]],
>(
  discriminator: TDiscriminator,
  schemas: TSchemas,
) => new DiscriminatedUnionSchema(discriminator, schemas)
