import { addIssue, preprocess, type ParseContext, BaseSchema } from '../core/schema'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export class StringSchema extends BaseSchema<unknown, string> {
  private minLength?: number
  private maxLength?: number
  private shouldTrim = false
  private startsWithValue?: string
  private endsWithValue?: string
  private includesValue?: string

  min(length: number): this {
    this.minLength = length
    return this
  }

  max(length: number): this {
    this.maxLength = length
    return this
  }

  trim(): this {
    this.shouldTrim = true
    return this
  }

  startsWith(value: string): this {
    this.startsWithValue = value
    return this
  }

  endsWith(value: string): this {
    this.endsWithValue = value
    return this
  }

  includes(value: string): this {
    this.includesValue = value
    return this
  }

  protected _parse(input: unknown, ctx: ParseContext): string | undefined {
    if (typeof input !== 'string') {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected string, received ${typeof input}`,
      })
      return undefined
    }

    const value = this.shouldTrim ? input.trim() : input

    if (this.minLength !== undefined && value.length < this.minLength) {
      addIssue(ctx, {
        code: 'string_too_short',
        message: `String must contain at least ${this.minLength} characters`,
      })
      return undefined
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      addIssue(ctx, {
        code: 'value_too_big',
        message: `String must contain at most ${this.maxLength} characters`,
      })
      return undefined
    }

    if (this.startsWithValue !== undefined && !value.startsWith(this.startsWithValue)) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `String must start with "${this.startsWithValue}"`,
      })
      return undefined
    }

    if (this.endsWithValue !== undefined && !value.endsWith(this.endsWithValue)) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `String must end with "${this.endsWithValue}"`,
      })
      return undefined
    }

    if (this.includesValue !== undefined && !value.includes(this.includesValue)) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `String must include "${this.includesValue}"`,
      })
      return undefined
    }

    return value
  }
}

export class EmailSchema extends StringSchema {
  protected _parse(input: unknown, ctx: ParseContext): string | undefined {
    const parsed = super._parse(input, ctx)

    if (parsed === undefined) {
      return undefined
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(parsed)) {
      addIssue(ctx, {
        code: 'invalid_email',
        message: 'Invalid email address',
      })
      return undefined
    }

    return parsed
  }
}

export class UrlSchema extends StringSchema {
  protected _parse(input: unknown, ctx: ParseContext): string | undefined {
    const parsed = super._parse(input, ctx)
    if (parsed === undefined) {
      return undefined
    }

    try {
      const url = new URL(parsed)
      return url.toString()
    } catch {
      addIssue(ctx, {
        code: 'invalid_url',
        message: 'Invalid URL',
      })
      return undefined
    }
  }
}

export class NumberSchema extends BaseSchema<unknown, number> {
  private minValue?: number
  private maxValue?: number
  private mustBeInt = false

  int(): this {
    this.mustBeInt = true
    return this
  }

  min(value: number): this {
    this.minValue = value
    return this
  }

  max(value: number): this {
    this.maxValue = value
    return this
  }

  protected _parse(input: unknown, ctx: ParseContext): number | undefined {
    const parsed =
      typeof input === 'number'
        ? input
        : typeof input === 'string' && input.trim() !== ''
          ? Number(input)
          : Number.NaN

    if (!Number.isFinite(parsed)) {
      addIssue(ctx, {
        code: 'invalid_number',
        message: 'Invalid number',
      })
      return undefined
    }

    if (this.mustBeInt && !Number.isInteger(parsed)) {
      addIssue(ctx, {
        code: 'invalid_number',
        message: 'Expected integer number',
      })
      return undefined
    }

    if (this.minValue !== undefined && parsed < this.minValue) {
      addIssue(ctx, {
        code: 'value_too_small',
        message: `Number must be greater than or equal to ${this.minValue}`,
      })
      return undefined
    }

    if (this.maxValue !== undefined && parsed > this.maxValue) {
      addIssue(ctx, {
        code: 'value_too_big',
        message: `Number must be less than or equal to ${this.maxValue}`,
      })
      return undefined
    }

    return parsed
  }
}

export class BooleanSchema extends BaseSchema<unknown, boolean> {
  protected _parse(input: unknown, ctx: ParseContext): boolean | undefined {
    if (typeof input === 'boolean') {
      return input
    }

    if (typeof input === 'string') {
      const normalized = input.trim().toLowerCase()
      if (normalized === 'true') {
        return true
      }

      if (normalized === 'false') {
        return false
      }
    }

    addIssue(ctx, {
      code: 'invalid_boolean',
      message: 'Invalid boolean',
    })
    return undefined
  }
}

type DateOutputMode = 'date' | 'string'

export class DateSchema<TMode extends DateOutputMode = 'date'> extends BaseSchema<
  unknown,
  TMode extends 'date' ? Date : string
> {
  private readonly mode: TMode

  constructor(mode: TMode) {
    super()
    this.mode = mode
  }

  protected _parse(input: unknown, ctx: ParseContext): (TMode extends 'date' ? Date : string) | undefined {
    const parsed = new Date(input as any)
    if (Number.isNaN(parsed.getTime())) {
      addIssue(ctx, {
        code: 'invalid_date',
        message: 'Invalid date',
      })
      return undefined
    }

    if (this.mode === 'string') {
      return parsed.toISOString() as TMode extends 'date' ? Date : string
    }

    return parsed as TMode extends 'date' ? Date : string
  }
}

export class LiteralSchema<TValue extends string | number | boolean> extends BaseSchema<unknown, TValue> {
  constructor(private readonly literalValue: TValue) {
    super()
  }

  protected _parse(input: unknown, ctx: ParseContext): TValue | undefined {
    if (input !== this.literalValue) {
      addIssue(ctx, {
        code: 'invalid_literal',
        message: `Expected literal ${JSON.stringify(this.literalValue)}`,
      })
      return undefined
    }

    return this.literalValue
  }

  getLiteralValue(): TValue {
    return this.literalValue
  }
}

export class EnumSchema<TValues extends readonly [string, ...string[]]> extends BaseSchema<unknown, TValues[number]> {
  constructor(private readonly values: TValues) {
    super()
  }

  protected _parse(input: unknown, ctx: ParseContext): TValues[number] | undefined {
    if (typeof input !== 'string') {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected string, received ${typeof input}`,
      })
      return undefined
    }

    if (!this.values.includes(input)) {
      addIssue(ctx, {
        code: 'invalid_enum_value',
        message: `Expected one of [${this.values.join(', ')}], received "${input}"`,
      })
      return undefined
    }

    return input
  }
}

export class ArraySchema<TItem> extends BaseSchema<unknown, TItem[]> {
  private minItems?: number
  private maxItems?: number
  private exactLength?: number

  constructor(private readonly itemSchema: BaseSchema<unknown, TItem>) {
    super()
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  max(size: number): this {
    this.maxItems = size
    return this
  }

  length(size: number): this {
    this.exactLength = size
    return this
  }

  nonempty(): this {
    return this.min(1)
  }

  protected _parse(input: unknown, ctx: ParseContext): TItem[] | undefined {
    if (!Array.isArray(input)) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected array, received ${typeof input}`,
      })
      return undefined
    }

    if (this.exactLength !== undefined && input.length !== this.exactLength) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected array with exactly ${this.exactLength} item(s)`,
      })
      return undefined
    }

    if (this.minItems !== undefined && input.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
      })
    }

    if (this.maxItems !== undefined && input.length > this.maxItems) {
      addIssue(ctx, {
        code: 'value_too_big',
        message: `List must contain at most ${this.maxItems} item(s)`,
      })
    }

    const result: TItem[] = []

    for (let index = 0; index < input.length; index += 1) {
      const value = this.itemSchema.run(input[index], {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })

      if (value === undefined) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'list_item_invalid',
            message: 'Invalid list item',
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

type TupleSchemas = readonly BaseSchema<unknown, any>[]
type InferTupleOutput<TSchemas extends TupleSchemas> = {
  [TIndex in keyof TSchemas]: TSchemas[TIndex] extends BaseSchema<any, infer TOutput> ? TOutput : never
}

export class TupleSchema<TSchemas extends TupleSchemas> extends BaseSchema<unknown, InferTupleOutput<TSchemas>> {
  constructor(private readonly schemas: TSchemas) {
    super()
  }

  protected _parse(input: unknown, ctx: ParseContext): InferTupleOutput<TSchemas> | undefined {
    if (!Array.isArray(input)) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected tuple (array), received ${typeof input}`,
      })
      return undefined
    }

    if (input.length !== this.schemas.length) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected tuple with exactly ${this.schemas.length} item(s)`,
      })
      return undefined
    }

    const result: unknown[] = []

    for (let index = 0; index < this.schemas.length; index += 1) {
      const schema = this.schemas[index]
      const value = schema.run(input[index], {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })

      if (value === undefined) {
        continue
      }

      result[index] = value
    }

    return result as InferTupleOutput<TSchemas>
  }
}

export class RecordSchema<TKey extends string, TValue> extends BaseSchema<unknown, Record<TKey, TValue>> {
  constructor(
    private readonly keySchema: BaseSchema<unknown, TKey> | undefined,
    private readonly valueSchema: BaseSchema<unknown, TValue>,
  ) {
    super()
  }

  protected _parse(input: unknown, ctx: ParseContext): Record<TKey, TValue> | undefined {
    if (!isPlainObject(input)) {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected object record, received ${typeof input}`,
      })
      return undefined
    }

    const result = {} as Record<TKey, TValue>

    for (const [rawKey, rawValue] of Object.entries(input)) {
      const parsedKey = this.keySchema
        ? this.keySchema.run(rawKey, {
            issues: ctx.issues,
            path: [...ctx.path, rawKey],
          })
        : (rawKey as TKey)

      if (parsedKey === undefined) {
        continue
      }

      const parsedValue = this.valueSchema.run(rawValue, {
        issues: ctx.issues,
        path: [...ctx.path, rawKey],
      })

      if (parsedValue === undefined) {
        continue
      }

      result[parsedKey] = parsedValue
    }

    return result
  }
}

export const string = () => new StringSchema()
export const email = () => new EmailSchema()
export const url = () => new UrlSchema()
export const number = () => new NumberSchema()
export const boolean = () => new BooleanSchema()
export const date = <TMode extends DateOutputMode = 'date'>(options?: { as?: TMode }) =>
  new DateSchema((options?.as ?? 'date') as TMode)
export const literal = <TValue extends string | number | boolean>(value: TValue) => new LiteralSchema(value)
export const enumeration = <TValues extends readonly [string, ...string[]]>(values: TValues) => new EnumSchema(values)

export const array = <TItem>(schema: BaseSchema<unknown, TItem>) => new ArraySchema(schema)
export const tuple = <TSchemas extends readonly [BaseSchema<unknown, any>, ...BaseSchema<unknown, any>[]]>(
  schemas: TSchemas,
) => new TupleSchema(schemas)

export function record<TValue>(valueSchema: BaseSchema<unknown, TValue>): RecordSchema<string, TValue>
export function record<TKey extends string, TValue>(
  keySchema: BaseSchema<unknown, TKey>,
  valueSchema: BaseSchema<unknown, TValue>,
): RecordSchema<TKey, TValue>
export function record<TKey extends string, TValue>(
  first: BaseSchema<unknown, TValue> | BaseSchema<unknown, TKey>,
  second?: BaseSchema<unknown, TValue>,
): RecordSchema<any, TValue> {
  if (second) {
    return new RecordSchema(first as BaseSchema<unknown, TKey>, second) as RecordSchema<any, TValue>
  }

  return new RecordSchema<string, TValue>(undefined, first as BaseSchema<unknown, TValue>) as RecordSchema<any, TValue>
}

export const list = <TItem>(schema: BaseSchema<unknown, TItem>) => array(schema)

export const coerce = {
  string: () => preprocess((value: unknown) => String(value), string()),
  number: () =>
    preprocess((value: unknown) => {
      if (typeof value === 'number') {
        return value
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed === '' ? Number.NaN : Number(trimmed)
      }
      if (typeof value === 'boolean') {
        return value ? 1 : 0
      }
      if (typeof value === 'bigint') {
        return Number(value)
      }

      return Number(value as any)
    }, number()),
  boolean: () =>
    preprocess((value: unknown) => {
      if (typeof value === 'boolean') {
        return value
      }
      if (typeof value === 'number') {
        if (value === 1) {
          return true
        }
        if (value === 0) {
          return false
        }
      }
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (normalized === '1') {
          return true
        }
        if (normalized === '0') {
          return false
        }
        if (normalized === 'true') {
          return true
        }
        if (normalized === 'false') {
          return false
        }
      }

      return value
    }, boolean()),
  date: <TMode extends DateOutputMode = 'date'>(options?: { as?: TMode }) =>
    preprocess((value: unknown) => {
      if (value instanceof Date) {
        return value
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return value
      }

      return value as any
    }, date(options)),
}
