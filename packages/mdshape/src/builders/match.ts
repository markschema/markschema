import type { TypeMdSectionNode } from '../core/ast'
import { normalizeLabel } from '../core/ast'
import { addIssue, applyFallbackPosition, type ParseContext, BaseSchema } from '../core/schema'

type InferSchemaOutput<TSchema> = TSchema extends BaseSchema<any, infer TOutput> ? TOutput : never
type MatchEntry<TNameKey extends string, TContentKey extends string> = {
  [TKey in TNameKey | TContentKey]: string
}
type NormalizedEntry = {
  name: string
  value: string
  line?: number
  position?: TypeMdSectionNode['headingPosition']
}
type LabelOrder = string[]
type EnforceOrderOptions = {
  order?: LabelOrder
  allowRepeats?: boolean
}
type NormalizedEnforceOrderOptions = {
  order: LabelOrder
  allowRepeats: boolean
}

const collectEntries = (current: TypeMdSectionNode): typeof current.labelEntries => {
  const nested = current.children.flatMap((child) => collectEntries(child))
  return [...current.labelEntries, ...nested]
}

const collectNormalizedLabelEntries = (section: TypeMdSectionNode, labels: string[]): NormalizedEntry[] => {
  const normalizedMap = new Map(labels.map((label) => [normalizeLabel(label), label]))
  const orderedEntries = collectEntries(section)
  const result: NormalizedEntry[] = []
  let current: NormalizedEntry | undefined

  for (const entry of orderedEntries) {
    const canonicalName = normalizedMap.get(entry.normalizedLabel)

    if (canonicalName) {
      current = {
        name: canonicalName,
        value: entry.value,
        line: entry.line,
        position: entry.position,
      }
      result.push(current)
      continue
    }

    if (!current) {
      continue
    }

    if (entry.isStrong) {
      current = undefined
      continue
    }

    current.value = `${current.value}\n\n${entry.label}: ${entry.value}`
  }

  return result
}

const validateLabelOrder = (
  entries: NormalizedEntry[],
  expectedOrder: NormalizedEnforceOrderOptions | undefined,
  ctx: ParseContext,
  section: TypeMdSectionNode,
) => {
  if (!expectedOrder || expectedOrder.order.length <= 1) {
    return
  }

  const rankByLabel = new Map(expectedOrder.order.map((label, index) => [normalizeLabel(label), index]))
  let lastRank = -1
  const seenLabels = new Set<string>()

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    const normalizedName = normalizeLabel(entry.name)
    const currentRank = rankByLabel.get(normalizedName)
    if (currentRank === undefined) {
      continue
    }

    if (seenLabels.has(normalizedName)) {
      if (!expectedOrder.allowRepeats) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'label_order_mismatch',
            message: `Label "${entry.name}" cannot be repeated`,
            line: entry.line ?? section.headingLine,
            position: entry.position ?? section.headingPosition,
          },
        )
      }
      continue
    }

    seenLabels.add(normalizedName)

    if (currentRank < lastRank) {
      addIssue(
        {
          issues: ctx.issues,
          path: [...ctx.path, index],
        },
        {
          code: 'label_order_mismatch',
          message: `Label "${entry.name}" is out of expected order`,
          line: entry.line ?? section.headingLine,
          position: entry.position ?? section.headingPosition,
        },
      )
      continue
    }

    lastRank = currentRank
  }
}

class MatchLabelValueSchema<TOutput> extends BaseSchema<TypeMdSectionNode, TOutput> {
  private readonly allowMissing: boolean
  private readonly hasMissingDefault: boolean
  private readonly missingDefaultValue?: TOutput

  constructor(
    private readonly labelName: string,
    private readonly valueSchema: BaseSchema<unknown, TOutput>,
    options?: {
      allowMissing?: boolean
      hasMissingDefault?: boolean
      missingDefaultValue?: TOutput
    },
  ) {
    super()
    this.allowMissing = options?.allowMissing ?? false
    this.hasMissingDefault = options?.hasMissingDefault ?? false
    this.missingDefaultValue = options?.missingDefaultValue
  }

  override get acceptsUndefined(): boolean {
    return this.allowMissing || this.valueSchema.acceptsUndefined
  }

  override optional(): BaseSchema<TypeMdSectionNode, TOutput | undefined> {
    return new MatchLabelValueSchema<TOutput>(this.labelName, this.valueSchema, {
      allowMissing: true,
      hasMissingDefault: this.hasMissingDefault,
      missingDefaultValue: this.missingDefaultValue,
    }) as unknown as BaseSchema<TypeMdSectionNode, TOutput | undefined>
  }

  override default(
    value: Exclude<TOutput, undefined>,
  ): BaseSchema<TypeMdSectionNode, Exclude<TOutput, undefined>> {
    return new MatchLabelValueSchema<TOutput>(this.labelName, this.valueSchema, {
      allowMissing: true,
      hasMissingDefault: true,
      missingDefaultValue: value as TOutput,
    }) as unknown as BaseSchema<TypeMdSectionNode, Exclude<TOutput, undefined>>
  }

  protected _parse(section: TypeMdSectionNode, ctx: ParseContext): TOutput | undefined {
    const normalized = normalizeLabel(this.labelName)
    const value = section.labels[normalized]?.[0]

    if (value === undefined) {
      if (this.hasMissingDefault) {
        return this.missingDefaultValue as TOutput
      }

      if (this.allowMissing) {
        return undefined
      }

      if (this.valueSchema.acceptsUndefined) {
        const startIssueCount = ctx.issues.length
        const parsedMissing = this.valueSchema.run(undefined, ctx)
        applyFallbackPosition(ctx, startIssueCount, section.headingPosition, section.headingLine)
        return parsedMissing
      }

      addIssue(ctx, {
        code: 'missing_labeled_value',
        message: `Missing labeled value "${this.labelName}"`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    const startIssueCount = ctx.issues.length
    const parsed = this.valueSchema.run(value, ctx)
    applyFallbackPosition(ctx, startIssueCount, section.headingPosition, section.headingLine)
    return parsed
  }
}

class MatchLabelsValuesSchema<TOutput> extends BaseSchema<TypeMdSectionNode, TOutput[]> {
  private minItems?: number
  private enforcedOrder?: NormalizedEnforceOrderOptions

  constructor(
    private readonly labels: string[],
    private readonly valueSchema: BaseSchema<unknown, TOutput>,
  ) {
    super()
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  enforceOrder(orderOrOptions?: LabelOrder | EnforceOrderOptions): this {
    if (Array.isArray(orderOrOptions)) {
      this.enforcedOrder = {
        order: orderOrOptions,
        allowRepeats: true,
      }
      return this
    }

    this.enforcedOrder = {
      order: orderOrOptions?.order ?? [...this.labels],
      allowRepeats: orderOrOptions?.allowRepeats ?? true,
    }
    return this
  }

  protected _parse(section: TypeMdSectionNode, ctx: ParseContext): TOutput[] | undefined {
    const entries = collectNormalizedLabelEntries(section, this.labels)
    const rawValues = entries.map((entry) => entry.value)

    if (rawValues.length === 0) {
      addIssue(ctx, {
        code: 'missing_labeled_value',
        message: `Missing any labeled value for [${this.labels.join(', ')}]`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && rawValues.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    validateLabelOrder(entries, this.enforcedOrder, ctx, section)

    const result: TOutput[] = []
    for (let index = 0; index < rawValues.length; index += 1) {
      const startIssueCount = ctx.issues.length
      const value = this.valueSchema.run(rawValues[index], {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(ctx, startIssueCount, entries[index]?.position, entries[index]?.line)

      if (value === undefined) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'list_item_invalid',
            message: 'Invalid list item',
            line: entries[index]?.line ?? section.headingLine,
            position: entries[index]?.position ?? section.headingPosition,
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

class MatchLabelsEntriesSchema<TNameKey extends string, TContentKey extends string> extends BaseSchema<
  TypeMdSectionNode,
  MatchEntry<TNameKey, TContentKey>[]
> {
  private minItems?: number
  private enforcedOrder?: NormalizedEnforceOrderOptions

  constructor(
    private readonly labels: string[],
    private readonly nameKey: TNameKey,
    private readonly contentKey: TContentKey,
  ) {
    super()
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  enforceOrder(orderOrOptions?: LabelOrder | EnforceOrderOptions): this {
    if (Array.isArray(orderOrOptions)) {
      this.enforcedOrder = {
        order: orderOrOptions,
        allowRepeats: true,
      }
      return this
    }

    this.enforcedOrder = {
      order: orderOrOptions?.order ?? [...this.labels],
      allowRepeats: orderOrOptions?.allowRepeats ?? true,
    }
    return this
  }

  protected _parse(
    section: TypeMdSectionNode,
    ctx: ParseContext,
  ): MatchEntry<TNameKey, TContentKey>[] | undefined {
    const rawEntries = collectNormalizedLabelEntries(section, this.labels)

    if (rawEntries.length === 0) {
      addIssue(ctx, {
        code: 'missing_labeled_value',
        message: `Missing any labeled value for [${this.labels.join(', ')}]`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && rawEntries.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    validateLabelOrder(rawEntries, this.enforcedOrder, ctx, section)

    return rawEntries.map((entry) => {
      return {
        [this.nameKey]: entry.name,
        [this.contentKey]: entry.value,
      } as MatchEntry<TNameKey, TContentKey>
    })
  }

  each<TSchema extends BaseSchema<unknown, any>>(schema: TSchema): MatchLabelsValueSchema<InferSchemaOutput<TSchema>> {
    const eachSchema = new MatchLabelsEntriesEachSchema(this.labels, this.nameKey, this.contentKey, schema)
    if (this.minItems !== undefined) {
      eachSchema.min(this.minItems)
    }
    if (this.enforcedOrder) {
      eachSchema.enforceOrder(this.enforcedOrder)
    }
    return eachSchema
  }
}

class MatchLabelsEntriesEachSchema<
  TNameKey extends string,
  TContentKey extends string,
  TOutput,
> extends BaseSchema<TypeMdSectionNode, TOutput[]> {
  private minItems?: number
  private enforcedOrder?: NormalizedEnforceOrderOptions

  constructor(
    private readonly labels: string[],
    private readonly nameKey: TNameKey,
    private readonly contentKey: TContentKey,
    private readonly itemSchema: BaseSchema<unknown, TOutput>,
  ) {
    super()
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  enforceOrder(orderOrOptions?: LabelOrder | EnforceOrderOptions): this {
    if (Array.isArray(orderOrOptions)) {
      this.enforcedOrder = {
        order: orderOrOptions,
        allowRepeats: true,
      }
      return this
    }

    this.enforcedOrder = {
      order: orderOrOptions?.order ?? [...this.labels],
      allowRepeats: orderOrOptions?.allowRepeats ?? true,
    }
    return this
  }

  protected _parse(section: TypeMdSectionNode, ctx: ParseContext): TOutput[] | undefined {
    const rawEntries = collectNormalizedLabelEntries(section, this.labels)

    if (rawEntries.length === 0) {
      addIssue(ctx, {
        code: 'missing_labeled_value',
        message: `Missing any labeled value for [${this.labels.join(', ')}]`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && rawEntries.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    validateLabelOrder(rawEntries, this.enforcedOrder, ctx, section)

    const result: TOutput[] = []

    for (let index = 0; index < rawEntries.length; index += 1) {
      const rawEntry = rawEntries[index]
      const entry = {
        [this.nameKey]: rawEntry.name,
        [this.contentKey]: rawEntry.value,
      } as MatchEntry<TNameKey, TContentKey>

      const startIssueCount = ctx.issues.length
      const value = this.itemSchema.run(entry, {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(
        ctx,
        startIssueCount,
        rawEntry.position ?? section.headingPosition,
        rawEntry.line ?? section.headingLine,
      )

      if (value === undefined) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'list_item_invalid',
            message: 'Invalid list item',
            line: rawEntry.line ?? section.headingLine,
            position: rawEntry.position ?? section.headingPosition,
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

export type MatchLabelBuilder = {
  value: <TSchema extends BaseSchema<unknown, any>>(
    schema: TSchema,
  ) => BaseSchema<TypeMdSectionNode, InferSchemaOutput<TSchema>>
}

export type MatchLabelsValueSchema<TOutput> = BaseSchema<TypeMdSectionNode, TOutput[]> & {
  min: (size: number) => MatchLabelsValueSchema<TOutput>
  enforceOrder: (orderOrOptions?: LabelOrder | EnforceOrderOptions) => MatchLabelsValueSchema<TOutput>
}

export type MatchLabelsBuilder = {
  values: <TSchema extends BaseSchema<unknown, any>>(
    schema: TSchema,
  ) => MatchLabelsValueSchema<InferSchemaOutput<TSchema>>
  entries: <
    TNameKey extends string = 'name',
    TContentKey extends string = 'content',
  >(options?: {
    nameKey?: TNameKey
    contentKey?: TContentKey
  }) => BaseSchema<TypeMdSectionNode, MatchEntry<TNameKey, TContentKey>[]> & {
    min: (size: number) => any
    enforceOrder: (orderOrOptions?: LabelOrder | EnforceOrderOptions) => any
    each: <TSchema extends BaseSchema<unknown, any>>(
      schema: TSchema,
    ) => MatchLabelsValueSchema<InferSchemaOutput<TSchema>>
  }
}

const label = (name: string): MatchLabelBuilder => ({
  value: (schema) => new MatchLabelValueSchema(name, schema),
})

const labels = (names: string[]): MatchLabelsBuilder => ({
  values: (schema) => new MatchLabelsValuesSchema(names, schema),
  entries: (options) =>
    new MatchLabelsEntriesSchema(
      names,
      (options?.nameKey ?? 'name') as string,
      (options?.contentKey ?? 'content') as string,
    ) as BaseSchema<TypeMdSectionNode, MatchEntry<any, any>[]> & {
      min: (size: number) => any
      enforceOrder: (orderOrOptions?: LabelOrder | EnforceOrderOptions) => any
      each: <TSchema extends BaseSchema<unknown, any>>(
        schema: TSchema,
      ) => MatchLabelsValueSchema<InferSchemaOutput<TSchema>>
    },
})

export const match = {
  label,
  labels,
}
