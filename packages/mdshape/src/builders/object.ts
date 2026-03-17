import { addIssue, BaseSchema, mergeSectionAnchors, type ParseContext, type SectionAnchor } from '../core/schema'

export type ObjectShape = Record<string, BaseSchema<any, any>>

type UnknownKeysPolicy = 'strip' | 'strict' | 'passthrough'

type InferSchemaOutput<TSchema> = TSchema extends BaseSchema<any, infer TOutput> ? TOutput : never
type InferSchemaInput<TSchema> = TSchema extends BaseSchema<infer TInput, any> ? TInput : never

type OptionalizedShape<TShape extends ObjectShape, TKeys extends keyof TShape> = {
  [TKey in keyof TShape]: TKey extends TKeys ? ReturnType<TShape[TKey]['optional']> : TShape[TKey]
}

type RequiredizedShape<TShape extends ObjectShape, TKeys extends keyof TShape> = {
  [TKey in keyof TShape]: TKey extends TKeys
    ? TShape[TKey] extends BaseSchema<infer TInput, infer TOutput>
      ? BaseSchema<Exclude<TInput, undefined>, Exclude<TOutput, undefined>>
      : TShape[TKey]
    : TShape[TKey]
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isMarkdownContextObject = (value: Record<string, unknown>): boolean => {
  if ('root' in value && isPlainObject(value.root)) {
    return true
  }

  return 'headingText' in value && 'depth' in value && 'blocks' in value
}

export type InferObjectOutput<TShape extends ObjectShape> = {
  [TKey in keyof TShape]: InferSchemaOutput<TShape[TKey]>
}

type InferObjectInput<TShape extends ObjectShape> = InferSchemaInput<TShape[keyof TShape]>

export class ObjectSchema<TShape extends ObjectShape> extends BaseSchema<
  InferObjectInput<TShape>,
  InferObjectOutput<TShape>
> {
  constructor(
    private readonly shape: TShape,
    private readonly options: {
      unknownKeys: UnknownKeysPolicy
      catchall?: BaseSchema<unknown, unknown>
    } = {
      unknownKeys: 'strip',
    },
  ) {
    super()
  }

  private clone<TNextShape extends ObjectShape>(
    shape: TNextShape,
    overrides?: Partial<{
      unknownKeys: UnknownKeysPolicy
      catchall?: BaseSchema<unknown, unknown>
    }>,
  ): ObjectSchema<TNextShape> {
    return new ObjectSchema(shape, {
      unknownKeys: overrides?.unknownKeys ?? this.options.unknownKeys,
      catchall: overrides?.catchall ?? this.options.catchall,
    })
  }

  pick<TKey extends keyof TShape>(keys: readonly TKey[]): ObjectSchema<Pick<TShape, TKey>> {
    const selected = {} as Pick<TShape, TKey>
    for (const key of keys) {
      if (key in this.shape) {
        selected[key] = this.shape[key]
      }
    }

    return this.clone(selected)
  }

  omit<TKey extends keyof TShape>(keys: readonly TKey[]): ObjectSchema<Omit<TShape, TKey>> {
    const omitted = new Set<string>(keys as readonly string[])
    const next = {} as Omit<TShape, TKey>

    for (const [key, schema] of Object.entries(this.shape)) {
      if (omitted.has(key)) {
        continue
      }
      ;(next as Record<string, BaseSchema<any, any>>)[key] = schema
    }

    return this.clone(next)
  }

  partial(): ObjectSchema<OptionalizedShape<TShape, keyof TShape>>
  partial<TKey extends keyof TShape>(keys: readonly TKey[]): ObjectSchema<OptionalizedShape<TShape, TKey>>
  partial<TKey extends keyof TShape>(keys?: readonly TKey[]) {
    const targetKeys = new Set<string>(
      (keys ? Array.from(keys) : (Object.keys(this.shape) as string[])).map((key) => String(key)),
    )
    const next = {} as OptionalizedShape<TShape, TKey>

    for (const [key, schema] of Object.entries(this.shape)) {
      ;(next as Record<string, BaseSchema<any, any>>)[key] = targetKeys.has(key) ? schema.optional() : schema
    }

    return this.clone(next)
  }

  required(): ObjectSchema<RequiredizedShape<TShape, keyof TShape>>
  required<TKey extends keyof TShape>(keys: readonly TKey[]): ObjectSchema<RequiredizedShape<TShape, TKey>>
  required<TKey extends keyof TShape>(keys?: readonly TKey[]) {
    const targetKeys = new Set<string>(
      (keys ? Array.from(keys) : (Object.keys(this.shape) as string[])).map((key) => String(key)),
    )
    const next = {} as RequiredizedShape<TShape, TKey>

    for (const [key, schema] of Object.entries(this.shape)) {
      ;(next as Record<string, BaseSchema<any, any>>)[key] = targetKeys.has(key)
        ? (schema.unwrapOptional() as BaseSchema<any, any>)
        : schema
    }

    return this.clone(next)
  }

  extend<TShapeAdd extends ObjectShape>(shape: TShapeAdd): ObjectSchema<TShape & TShapeAdd> {
    return this.clone(
      {
        ...(this.shape as Record<string, BaseSchema<any, any>>),
        ...(shape as Record<string, BaseSchema<any, any>>),
      } as TShape & TShapeAdd,
    )
  }

  merge<TIncomingShape extends ObjectShape>(
    incoming: ObjectSchema<TIncomingShape>,
  ): ObjectSchema<Omit<TShape, keyof TIncomingShape> & TIncomingShape> {
    return this.clone(
      {
        ...(this.shape as Record<string, BaseSchema<any, any>>),
        ...(incoming.getShape() as Record<string, BaseSchema<any, any>>),
      } as Omit<TShape, keyof TIncomingShape> & TIncomingShape,
      {
        unknownKeys: incoming.getUnknownKeysPolicy(),
        catchall: incoming.getCatchallSchema() ?? this.options.catchall,
      },
    )
  }

  strip(): ObjectSchema<TShape> {
    return this.clone(this.shape, {
      unknownKeys: 'strip',
      catchall: undefined,
    })
  }

  strict(): ObjectSchema<TShape> {
    return this.clone(this.shape, {
      unknownKeys: 'strict',
      catchall: undefined,
    })
  }

  passthrough(): ObjectSchema<TShape> {
    return this.clone(this.shape, {
      unknownKeys: 'passthrough',
      catchall: undefined,
    })
  }

  catchall<TCatchall>(schema: BaseSchema<unknown, TCatchall>): ObjectSchema<TShape> {
    return this.clone(this.shape, {
      catchall: schema,
    })
  }

  protected _parse(
    input: InferObjectInput<TShape>,
    ctx: ParseContext,
  ): InferObjectOutput<TShape> | undefined {
    const result = {} as InferObjectOutput<TShape>
    const sourceObject = isPlainObject(input) ? input : undefined
    const isMarkdownContext = sourceObject ? isMarkdownContextObject(sourceObject) : false

    const knownKeys = new Set(Object.keys(this.shape))

    if (sourceObject && !isMarkdownContext) {
      for (const [key, value] of Object.entries(sourceObject)) {
        if (knownKeys.has(key)) {
          continue
        }

        if (this.options.catchall) {
          const parsed = this.options.catchall.run(value, {
            issues: ctx.issues,
            path: [...ctx.path, key],
          })

          if (parsed !== undefined) {
            ;(result as Record<string, unknown>)[key] = parsed
          }
          continue
        }

        if (this.options.unknownKeys === 'passthrough') {
          ;(result as Record<string, unknown>)[key] = value
          continue
        }

        if (this.options.unknownKeys === 'strict') {
          addIssue(ctx, {
            code: 'unrecognized_key',
            message: `Unrecognized key "${key}"`,
            path: [...ctx.path, key],
          })
        }
      }
    }

    for (const [key, schema] of Object.entries(this.shape)) {
      let fieldInput: unknown

      if (sourceObject && Object.prototype.hasOwnProperty.call(sourceObject, key)) {
        fieldInput = sourceObject[key]
      } else if (sourceObject && isMarkdownContext) {
        fieldInput = sourceObject
      } else {
        fieldInput = undefined
      }

      const value = schema.run(fieldInput as InferObjectInput<TShape>, {
        issues: ctx.issues,
        path: [...ctx.path, key],
      })

      if (value !== undefined) {
        ;(result as Record<string, unknown>)[key] = value
      }
    }

    return result
  }

  override getSectionAnchors(): SectionAnchor[] {
    const anchors: SectionAnchor[] = []

    for (const [key, schema] of Object.entries(this.shape)) {
      const nestedAnchors = schema.getSectionAnchors().map((anchor) => ({
        sectionName: anchor.sectionName,
        path: [key, ...anchor.path],
      }))
      anchors.push(...nestedAnchors)
    }

    return mergeSectionAnchors(anchors)
  }

  getShape(): TShape {
    return this.shape
  }

  getUnknownKeysPolicy(): UnknownKeysPolicy {
    return this.options.unknownKeys
  }

  getCatchallSchema(): BaseSchema<unknown, unknown> | undefined {
    return this.options.catchall
  }
}

export const object = <TShape extends ObjectShape>(shape: TShape) => new ObjectSchema(shape)
