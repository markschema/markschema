import type {
  TypeMdAutolink,
  TypeMdBlock,
  TypeMdBlockquote,
  TypeMdCodeFence,
  TypeMdMermaidBlock,
  TypeMdMathBlock,
  TypeMdMathInline,
  TypeMdDocument,
  TypeMdFootnote,
  TypeMdFootnoteReference,
  TypeMdHtmlBlock,
  TypeMdHtmlInlineElement,
  TypeMdHtmlInline,
  TypeMdImage,
  TypeMdLink,
  TypeMdNestedList,
  TypeMdOrderedList,
  TypeMdReferenceLink,
  TypeMdSectionNode,
  TypeMdTable,
  TypeMdTaskItem,
} from '../core/ast'
import { findSectionByHeadingText } from '../core/ast'
import { addIssue, applyFallbackPosition, type ParseContext, BaseSchema } from '../core/schema'
import { StringSchema } from './primitives'

type InferSchemaOutput<TSchema> = TSchema extends BaseSchema<any, infer TOutput> ? TOutput : never
type InferSchemaOutputTuple<TSchemas extends readonly BaseSchema<any, any>[]> = {
  [TIndex in keyof TSchemas]: TSchemas[TIndex] extends BaseSchema<any, infer TOutput> ? TOutput : never
}

type FieldsShape = Record<string, BaseSchema<unknown, unknown>>
type SectionFieldsOptions = {
  caseInsensitive?: boolean
}

type SectionFootnotesOptions = {
  enforceReferences?: boolean
}
type SectionNestedListsOptions = {
  as?: 'flat' | 'tree'
}
type SectionCollectionItem = { line?: number; position?: TypeMdSectionNode['headingPosition'] }
type SectionSequenceHeading = string | RegExp
export type SectionBlockOrderType =
  | 'paragraph'
  | 'list'
  | 'table'
  | 'blockquote'
  | 'code'
  | 'mermaid'
  | 'math'
  | 'link'
  | 'image'
  | 'footnote'
  | 'taskItem'
  | 'orderedList'
  | 'nestedList'
  | 'referenceLink'
  | 'autolink'
  | 'htmlBlock'
  | 'htmlInline'
  | 'mathInline'

export type SectionBlockOrderOptions = {
  allowRepeats?: boolean
  allowUnlisted?: boolean
  mode?: 'relative' | 'sequence'
}

type SectionBlockOrderConfig = {
  order: SectionBlockOrderType[]
  allowRepeats: boolean
  allowUnlisted: boolean
  mode: 'relative' | 'sequence'
}

type BlockOccurrence = {
  type: SectionBlockOrderType
  line?: number
  position?: TypeMdSectionNode['headingPosition']
}

type TypeMdNestedTreeNode = {
  text: string
  children: TypeMdNestedTreeNode[]
}

type TypeMdNestedListTree = {
  items: TypeMdNestedTreeNode[]
  line?: number
  position?: TypeMdSectionNode['headingPosition']
}

const sectionOrderChecksByIssues = new WeakMap<object, Set<string>>()
const getSharedSectionOrderChecks = (ctx: ParseContext): Set<string> => {
  if (ctx.sectionOrderChecks) {
    return ctx.sectionOrderChecks
  }

  const issuesRef = ctx.issues as unknown as object
  let checks = sectionOrderChecksByIssues.get(issuesRef)
  if (!checks) {
    checks = new Set<string>()
    sectionOrderChecksByIssues.set(issuesRef, checks)
  }
  return checks
}

const normalizeHeader = (header: string): string => header.trim().toLowerCase()
const compareOccurrences = (left: BlockOccurrence, right: BlockOccurrence): number => {
  const leftOffset = left.position?.start.offset
  const rightOffset = right.position?.start.offset
  if (leftOffset !== undefined && rightOffset !== undefined && leftOffset !== rightOffset) {
    return leftOffset - rightOffset
  }

  const leftLine = left.line ?? left.position?.start.line ?? Number.MAX_SAFE_INTEGER
  const rightLine = right.line ?? right.position?.start.line ?? Number.MAX_SAFE_INTEGER
  if (leftLine !== rightLine) {
    return leftLine - rightLine
  }

  const leftColumn = left.position?.start.column ?? Number.MAX_SAFE_INTEGER
  const rightColumn = right.position?.start.column ?? Number.MAX_SAFE_INTEGER
  return leftColumn - rightColumn
}

const toNestedTreeItems = (items: TypeMdNestedList['items']): TypeMdNestedTreeNode[] => {
  const roots: TypeMdNestedTreeNode[] = []
  const stack: Array<{ depth: number; node: TypeMdNestedTreeNode }> = []

  for (const item of items) {
    const node: TypeMdNestedTreeNode = { text: item.text, children: [] }

    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    if (parent) {
      parent.node.children.push(node)
    } else {
      roots.push(node)
    }

    stack.push({ depth: item.depth, node })
  }

  return roots
}

const blockTypeFromNode = (block: TypeMdBlock): SectionBlockOrderType | undefined => {
  if (block.type === 'code') {
    const language = block.language?.trim().toLowerCase()
    return language === 'mermaid' ? 'mermaid' : 'code'
  }
  if (block.type === 'thematicBreak') {
    return undefined
  }
  return block.type
}

const collectBlockOccurrences = (section: TypeMdSectionNode): BlockOccurrence[] => {
  const occurrences: BlockOccurrence[] = []

  for (const block of section.blocks) {
    const mappedType = blockTypeFromNode(block)
    if (!mappedType) {
      continue
    }

    occurrences.push({
      type: mappedType,
      line: block.line,
      position: block.position,
    })
  }

  for (const link of section.links) {
    occurrences.push({ type: 'link', line: link.line, position: link.position })
  }
  for (const image of section.images) {
    occurrences.push({ type: 'image', line: image.line, position: image.position })
  }
  for (const referenceLink of section.referenceLinks) {
    occurrences.push({
      type: 'referenceLink',
      line: referenceLink.line,
      position: referenceLink.position,
    })
  }
  for (const autolink of section.autolinks) {
    occurrences.push({ type: 'autolink', line: autolink.line, position: autolink.position })
  }
  for (const htmlInline of section.htmlInlines) {
    occurrences.push({ type: 'htmlInline', line: htmlInline.line, position: htmlInline.position })
  }
  for (const mathInline of section.mathInlines) {
    occurrences.push({ type: 'mathInline', line: mathInline.line, position: mathInline.position })
  }
  for (const task of section.taskItems) {
    occurrences.push({ type: 'taskItem', line: task.line, position: task.position })
  }
  for (const orderedList of section.orderedLists) {
    occurrences.push({ type: 'orderedList', line: orderedList.line, position: orderedList.position })
  }
  for (const nestedList of section.nestedLists) {
    occurrences.push({ type: 'nestedList', line: nestedList.line, position: nestedList.position })
  }

  occurrences.sort(compareOccurrences)
  return occurrences
}

const doesHeadingMatch = (headingText: string, expected: SectionSequenceHeading): boolean => {
  if (typeof expected === 'string') {
    return headingText === expected
  }

  expected.lastIndex = 0
  return expected.test(headingText)
}
const describeExpectedHeading = (expected: SectionSequenceHeading): string =>
  typeof expected === 'string' ? expected : expected.toString()

export type InferFieldsOutput<TShape extends FieldsShape> = {
  [TKey in keyof TShape]: InferSchemaOutput<TShape[TKey]>
}

abstract class SectionSchema<TOutput> extends BaseSchema<TypeMdDocument, TOutput> {
  constructor(
    protected readonly sectionName: string,
    private readonly blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super()
  }

  override getSectionAnchors() {
    return [
      {
        sectionName: this.sectionName,
        path: [],
      },
    ]
  }

  protected getSection(document: TypeMdDocument, ctx: ParseContext) {
    const section = findSectionByHeadingText(document, this.sectionName)

    if (!section) {
      addIssue(ctx, {
        code: 'missing_section',
        message: `Missing section "${this.sectionName}"`,
      })
      return undefined
    }

    this.validateBlockOrder(section, ctx)
    return section
  }

  private validateBlockOrder(section: TypeMdSectionNode, ctx: ParseContext) {
    if (!this.blockOrderConfig || this.blockOrderConfig.order.length === 0) {
      return
    }

    const checkKey = `${this.sectionName}::${this.blockOrderConfig.order.join('|')}::${this.blockOrderConfig.allowRepeats}::${this.blockOrderConfig.allowUnlisted}::${this.blockOrderConfig.mode}`
    const checks = getSharedSectionOrderChecks(ctx)
    if (checks.has(checkKey)) {
      return
    }
    checks.add(checkKey)

    const occurrences = collectBlockOccurrences(section)
    if (this.blockOrderConfig.mode === 'sequence') {
      const expectedOrder = this.blockOrderConfig.order
      const knownTypes = new Set(expectedOrder)
      let cursor = 0

      for (const occurrence of occurrences) {
        const occurrenceType = occurrence.type
        if (!knownTypes.has(occurrenceType)) {
          if (!this.blockOrderConfig.allowUnlisted) {
            addIssue(ctx, {
              code: 'block_order_mismatch',
              message: `Block type "${occurrenceType}" is not allowed by blockOrder in section "${this.sectionName}"`,
              line: occurrence.line ?? section.headingLine,
              position: occurrence.position ?? section.headingPosition,
            })
          }
          continue
        }

        const expectedType = expectedOrder[cursor]
        if (expectedType === occurrenceType) {
          cursor += 1
          continue
        }

        const remainingIndex = expectedOrder.findIndex(
          (type, index) => index >= cursor && type === occurrenceType,
        )
        if (remainingIndex !== -1) {
          addIssue(ctx, {
            code: 'block_order_mismatch',
            message: `Block type "${occurrenceType}" is out of order in section "${this.sectionName}". Expected to appear after "${expectedType}"`,
            line: occurrence.line ?? section.headingLine,
            position: occurrence.position ?? section.headingPosition,
          })
          continue
        }

        if (!this.blockOrderConfig.allowRepeats) {
          addIssue(ctx, {
            code: 'block_repeat_not_allowed',
            message: `Block type "${occurrenceType}" repeats but allowRepeats is false in section "${this.sectionName}"`,
            line: occurrence.line ?? section.headingLine,
            position: occurrence.position ?? section.headingPosition,
          })
        }
      }

      return
    }

    const orderIndex = new Map<SectionBlockOrderType, number>()
    for (let index = 0; index < this.blockOrderConfig.order.length; index += 1) {
      const blockType = this.blockOrderConfig.order[index]
      if (!orderIndex.has(blockType)) {
        orderIndex.set(blockType, index)
      }
    }

    let currentMaxIndex = -1
    const seenTypes = new Set<SectionBlockOrderType>()

    for (const occurrence of occurrences) {
      const expectedIndex = orderIndex.get(occurrence.type)

      if (expectedIndex === undefined) {
        if (!this.blockOrderConfig.allowUnlisted) {
          addIssue(ctx, {
            code: 'block_order_mismatch',
            message: `Block type "${occurrence.type}" is not allowed by blockOrder in section "${this.sectionName}"`,
            line: occurrence.line ?? section.headingLine,
            position: occurrence.position ?? section.headingPosition,
          })
        }
        continue
      }

      if (!this.blockOrderConfig.allowRepeats && seenTypes.has(occurrence.type)) {
        addIssue(ctx, {
          code: 'block_repeat_not_allowed',
          message: `Block type "${occurrence.type}" repeats but allowRepeats is false in section "${this.sectionName}"`,
          line: occurrence.line ?? section.headingLine,
          position: occurrence.position ?? section.headingPosition,
        })
      }

      if (expectedIndex < currentMaxIndex) {
        const expectedType = this.blockOrderConfig.order[currentMaxIndex]
        addIssue(ctx, {
          code: 'block_order_mismatch',
          message: `Block type "${occurrence.type}" is out of order in section "${this.sectionName}". Expected to appear before "${expectedType}"`,
          line: occurrence.line ?? section.headingLine,
          position: occurrence.position ?? section.headingPosition,
        })
      } else {
        currentMaxIndex = expectedIndex
      }

      seenTypes.add(occurrence.type)
    }
  }
}

export class SectionFieldsSchema<TShape extends FieldsShape> extends SectionSchema<InferFieldsOutput<TShape>> {
  private expectedFieldOrder?: string[]
  private readonly caseInsensitive: boolean

  constructor(
    sectionName: string,
    private readonly shape: TShape,
    blockOrderConfig?: SectionBlockOrderConfig,
    options?: SectionFieldsOptions,
  ) {
    super(sectionName, blockOrderConfig)
    this.caseInsensitive = options?.caseInsensitive ?? true
  }

  sequence(fields: string[]): this {
    this.expectedFieldOrder = fields
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): InferFieldsOutput<TShape> | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    const normalizeFieldKey = (fieldName: string) =>
      this.caseInsensitive ? fieldName.trim().toLowerCase() : fieldName
    const fieldKeyLookup = new Map<string, string>()
    if (this.caseInsensitive) {
      for (const entry of section.fieldEntries) {
        const normalized = normalizeFieldKey(entry.key)
        if (!fieldKeyLookup.has(normalized)) {
          fieldKeyLookup.set(normalized, entry.key)
        }
      }
    }

    if (this.expectedFieldOrder && this.expectedFieldOrder.length > 0) {
      let lastMatchedIndex = -1
      for (const expectedField of this.expectedFieldOrder) {
        const normalizedExpectedField = normalizeFieldKey(expectedField)
        const nextIndex = section.fieldEntries.findIndex(
          (entry, index) => index > lastMatchedIndex && normalizeFieldKey(entry.key) === normalizedExpectedField,
        )

        if (nextIndex !== -1) {
          lastMatchedIndex = nextIndex
          continue
        }

        const existingIndex = section.fieldEntries.findIndex(
          (entry) => normalizeFieldKey(entry.key) === normalizedExpectedField,
        )
        if (existingIndex !== -1) {
          const outOfOrderField = section.fieldEntries[existingIndex]
          addIssue(ctx, {
            code: 'field_order_mismatch',
            message: `Field "${expectedField}" is out of order in section "${this.sectionName}"`,
            line: outOfOrderField.line ?? section.headingLine,
            position: outOfOrderField.position ?? section.headingPosition,
          })
          continue
        }

        addIssue(ctx, {
          code: 'missing_expected_field',
          message: `Missing expected field "${expectedField}" in section "${this.sectionName}"`,
          line: section.headingLine,
          position: section.headingPosition,
        })
      }
    }

    const result = {} as InferFieldsOutput<TShape>
    for (const [fieldName, schema] of Object.entries(this.shape)) {
      const resolvedFieldName =
        section.fields[fieldName] !== undefined ? fieldName : fieldKeyLookup.get(normalizeFieldKey(fieldName)) ?? fieldName
      const rawValue = section.fields[resolvedFieldName]
      const fieldCtx = {
        issues: ctx.issues,
        path: [...ctx.path, fieldName],
      }

      if (rawValue === undefined && !schema.acceptsUndefined) {
        addIssue(fieldCtx, {
          code: 'missing_field',
          message: `Missing field "${fieldName}" in section "${this.sectionName}"`,
          line: section.headingLine,
          position: section.headingPosition,
        })
        continue
      }

      const startIssueCount = ctx.issues.length
      const value = schema.run(rawValue, fieldCtx)
      applyFallbackPosition(
        ctx,
        startIssueCount,
        section.fieldPositions[resolvedFieldName] ?? section.headingPosition,
        section.fieldLines[resolvedFieldName] ?? section.headingLine,
      )
      if (value !== undefined) {
        ;(result as Record<string, unknown>)[fieldName] = value
      }
    }

    return result
  }
}

export class SectionParagraphSchema extends SectionSchema<string> {
  private readonly innerSchema = new StringSchema()
  constructor(sectionName: string, blockOrderConfig?: SectionBlockOrderConfig) {
    super(sectionName, blockOrderConfig)
  }

  min(length: number): this {
    this.innerSchema.min(length)
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): string | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    const paragraph = section.paragraphs.join('\n\n').trim()
    if (!paragraph) {
      addIssue(ctx, {
        code: 'missing_paragraph',
        message: `Section "${this.sectionName}" must contain paragraph content`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    const startIssueCount = ctx.issues.length
    const value = this.innerSchema.run(paragraph, ctx)
    applyFallbackPosition(
      ctx,
      startIssueCount,
      section.paragraphPositions[0] ?? section.headingPosition,
      section.paragraphLines[0] ?? section.headingLine,
    )
    return value
  }
}

export class SectionParagraphsSchema<
  TSchemas extends readonly BaseSchema<unknown, any>[],
> extends SectionSchema<InferSchemaOutputTuple<TSchemas>> {
  constructor(
    sectionName: string,
    private readonly schemas: TSchemas,
    blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super(sectionName, blockOrderConfig)
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): InferSchemaOutputTuple<TSchemas> | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    const paragraphCount = section.paragraphs.length
    const expectedCount = this.schemas.length

    if (paragraphCount < expectedCount) {
      for (let index = paragraphCount; index < expectedCount; index += 1) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'missing_paragraph',
            message: `Missing paragraph at index ${index} in section "${this.sectionName}"`,
            line: section.headingLine,
            position: section.headingPosition,
          },
        )
      }
    }

    if (paragraphCount > expectedCount) {
      for (let index = expectedCount; index < paragraphCount; index += 1) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'unexpected_paragraph',
            message: `Unexpected paragraph at index ${index} in section "${this.sectionName}"`,
            line: section.paragraphLines[index] ?? section.headingLine,
            position: section.paragraphPositions[index] ?? section.headingPosition,
          },
        )
      }
    }

    const result: unknown[] = []

    for (let index = 0; index < this.schemas.length; index += 1) {
      const paragraph = section.paragraphs[index]
      if (paragraph === undefined) {
        continue
      }

      const startIssueCount = ctx.issues.length
      const value = this.schemas[index].run(paragraph, {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(
        ctx,
        startIssueCount,
        section.paragraphPositions[index] ?? section.headingPosition,
        section.paragraphLines[index] ?? section.headingLine,
      )

      if (value !== undefined) {
        result[index] = value
      }
    }

    return result as InferSchemaOutputTuple<TSchemas>
  }
}

export class SectionListSchema<TItem> extends SectionSchema<TItem[]> {
  private minItems?: number

  constructor(
    sectionName: string,
    private readonly itemSchema: BaseSchema<unknown, TItem>,
    blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super(sectionName, blockOrderConfig)
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TItem[] | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    if (section.listItems.length === 0) {
      addIssue(ctx, {
        code: 'missing_list',
        message: `Section "${this.sectionName}" must contain an unordered list`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && section.listItems.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    const result: TItem[] = []
    for (let index = 0; index < section.listItems.length; index += 1) {
      const startIssueCount = ctx.issues.length
      const value = this.itemSchema.run(section.listItems[index], {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(
        ctx,
        startIssueCount,
        section.listItemPositions[index] ?? section.headingPosition,
        section.listItemLines[index] ?? section.headingLine,
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
            line: section.listItemLines[index] ?? section.headingLine,
            position: section.listItemPositions[index] ?? section.headingPosition,
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

class SectionCollectionSchema<TInput extends SectionCollectionItem, TOutput> extends SectionSchema<TOutput[]> {
  private minItems?: number

  constructor(
    sectionName: string,
    private readonly getItems: (section: TypeMdSectionNode) => TInput[],
    private readonly itemSchema: BaseSchema<unknown, TOutput>,
    private readonly missingCode:
      | 'missing_table'
      | 'missing_blockquote'
      | 'missing_code_fence'
      | 'missing_mermaid'
      | 'missing_math_block'
      | 'missing_link'
      | 'missing_image'
      | 'missing_footnote'
      | 'missing_task_list'
      | 'missing_ordered_list'
      | 'missing_nested_list'
      | 'missing_reference_link'
      | 'missing_autolink'
      | 'missing_html_block'
      | 'missing_html_inline'
      | 'missing_html_inline_element'
      | 'missing_math_inline',
    private readonly missingMessage: string,
    private readonly invalidCode:
      | 'invalid_table'
      | 'invalid_blockquote'
      | 'invalid_code_fence'
      | 'invalid_mermaid'
      | 'invalid_math_block'
      | 'invalid_link'
      | 'invalid_image'
      | 'invalid_footnote'
      | 'invalid_task_item'
      | 'invalid_ordered_list'
      | 'invalid_nested_list'
      | 'invalid_reference_link'
      | 'invalid_autolink'
      | 'invalid_html_block'
      | 'invalid_html_inline'
      | 'invalid_html_inline_element'
      | 'invalid_math_inline',
    private readonly invalidMessage: string,
    blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super(sectionName, blockOrderConfig)
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TOutput[] | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    const items = this.getItems(section)
    if (items.length === 0) {
      addIssue(ctx, {
        code: this.missingCode,
        message: this.missingMessage,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && items.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    const result: TOutput[] = []
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const startIssueCount = ctx.issues.length
      const value = this.itemSchema.run(item, {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(ctx, startIssueCount, item.position ?? section.headingPosition, item.line ?? section.headingLine)

      if (value === undefined) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: this.invalidCode,
            message: this.invalidMessage,
            line: item.line ?? section.headingLine,
            position: item.position ?? section.headingPosition,
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

class SectionFootnotesSchema<TOutput> extends SectionSchema<TOutput[]> {
  private minItems?: number

  constructor(
    sectionName: string,
    private readonly itemSchema: BaseSchema<unknown, TOutput>,
    private readonly options?: SectionFootnotesOptions,
    blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super(sectionName, blockOrderConfig)
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TOutput[] | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    const items = section.footnotes
    if (this.options?.enforceReferences) {
      const defined = new Set(items.map((item) => item.id))
      const reported = new Set<string>()

      for (const reference of section.footnoteReferences as TypeMdFootnoteReference[]) {
        if (defined.has(reference.id) || reported.has(reference.id)) {
          continue
        }

        reported.add(reference.id)
        addIssue(ctx, {
          code: 'missing_footnote_definition',
          message: `Missing footnote definition for reference "[^${reference.id}]" in section "${this.sectionName}"`,
          line: reference.line ?? section.headingLine,
          position: reference.position ?? section.headingPosition,
        })
      }
    }

    if (items.length === 0) {
      addIssue(ctx, {
        code: 'missing_footnote',
        message: `Section "${this.sectionName}" must contain a footnote`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && items.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    const result: TOutput[] = []
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const startIssueCount = ctx.issues.length
      const value = this.itemSchema.run(item, {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(ctx, startIssueCount, item.position ?? section.headingPosition, item.line ?? section.headingLine)

      if (value === undefined) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'invalid_footnote',
            message: 'Invalid footnote item',
            line: item.line ?? section.headingLine,
            position: item.position ?? section.headingPosition,
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

class SectionTableSchema<TOutput> extends SectionSchema<TOutput[]> {
  private minItems?: number
  private requiredHeaders?: string[]

  constructor(
    sectionName: string,
    private readonly itemSchema: BaseSchema<unknown, TOutput>,
    blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super(sectionName, blockOrderConfig)
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  headers(headers: string[]): this {
    this.requiredHeaders = headers
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TOutput[] | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    const items = section.tables
    if (items.length === 0) {
      addIssue(ctx, {
        code: 'missing_table',
        message: `Section "${this.sectionName}" must contain a table`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && items.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    const result: TOutput[] = []
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]

      if (this.requiredHeaders) {
        const presentHeaders = new Set(item.headers.map(normalizeHeader))
        const missingHeaders = this.requiredHeaders.filter(
          (requiredHeader) => !presentHeaders.has(normalizeHeader(requiredHeader)),
        )

        if (missingHeaders.length > 0) {
          addIssue(
            {
              issues: ctx.issues,
              path: [...ctx.path, index, 'headers'],
            },
            {
              code: 'invalid_table',
              message: `Table is missing required header(s): ${missingHeaders.join(', ')}`,
              line: item.line ?? section.headingLine,
              position: item.position ?? section.headingPosition,
            },
          )
          continue
        }
      }

      const startIssueCount = ctx.issues.length
      const value = this.itemSchema.run(item, {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })
      applyFallbackPosition(ctx, startIssueCount, item.position ?? section.headingPosition, item.line ?? section.headingLine)

      if (value === undefined) {
        addIssue(
          {
            issues: ctx.issues,
            path: [...ctx.path, index],
          },
          {
            code: 'invalid_table',
            message: 'Invalid table item',
            line: item.line ?? section.headingLine,
            position: item.position ?? section.headingPosition,
          },
        )
        continue
      }

      result.push(value)
    }

    return result
  }
}

class SectionChildrenEachSchema<TOutput> extends SectionSchema<TOutput[]> {
  private minItems?: number

  constructor(
    sectionName: string,
    private readonly childDepth: number,
    private readonly childSchema: BaseSchema<TypeMdSectionNode, TOutput>,
    private readonly expectedHeadings?: SectionSequenceHeading[],
    blockOrderConfig?: SectionBlockOrderConfig,
  ) {
    super(sectionName, blockOrderConfig)
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): TOutput[] | undefined {
    const section = this.getSection(document, ctx)
    if (!section) {
      return undefined
    }

    if (section.children.length === 0) {
      addIssue(ctx, {
        code: 'missing_child_heading',
        message: `Section "${this.sectionName}" has no child headings`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    const selected = section.children.filter((child) => child.depth === this.childDepth)
    if (selected.length === 0) {
      addIssue(ctx, {
        code: 'child_heading_depth_mismatch',
        message: `Section "${this.sectionName}" has no direct child headings with depth ${this.childDepth}`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.minItems !== undefined && selected.length < this.minItems) {
      addIssue(ctx, {
        code: 'list_too_small',
        message: `List must contain at least ${this.minItems} item(s)`,
        line: section.headingLine,
        position: section.headingPosition,
      })
    }

    if (this.expectedHeadings && this.expectedHeadings.length > 0) {
      let lastMatchedIndex = -1
      for (const expectedHeading of this.expectedHeadings) {
        const nextIndex = selected.findIndex(
          (child, index) => index > lastMatchedIndex && doesHeadingMatch(child.headingText, expectedHeading),
        )

        if (nextIndex !== -1) {
          lastMatchedIndex = nextIndex
          continue
        }

        const existingIndex = selected.findIndex((child) => doesHeadingMatch(child.headingText, expectedHeading))
        if (existingIndex !== -1) {
          const outOfOrderChild = selected[existingIndex]
          addIssue(ctx, {
            code: 'subsection_order_mismatch',
            message: `Subsection "${outOfOrderChild.headingText}" is out of order in section "${this.sectionName}"`,
            line: outOfOrderChild.headingLine,
            position: outOfOrderChild.headingPosition,
          })
          continue
        }

        addIssue(ctx, {
          code: 'missing_expected_subsection',
          message: `Missing expected subsection "${describeExpectedHeading(expectedHeading)}" in section "${this.sectionName}"`,
          line: section.headingLine,
          position: section.headingPosition,
        })
      }
    }

    const result: TOutput[] = []

    for (let index = 0; index < selected.length; index += 1) {
      const value = this.childSchema.run(selected[index], {
        issues: ctx.issues,
        path: [...ctx.path, index],
      })

      if (value !== undefined) {
        result.push(value)
      }
    }

    return result
  }
}

class SectionChildrenBuilder {
  constructor(
    private readonly sectionName: string,
    private readonly depth: number,
    private readonly expectedHeadings?: SectionSequenceHeading[],
    private readonly blockOrderConfig?: SectionBlockOrderConfig,
  ) {}

  sequence(expectedHeadings: SectionSequenceHeading[]) {
    return new SectionChildrenBuilder(this.sectionName, this.depth, expectedHeadings, this.blockOrderConfig)
  }

  each<TSchema extends BaseSchema<TypeMdSectionNode, any>>(schema: TSchema) {
    return new SectionChildrenEachSchema<InferSchemaOutput<TSchema>>(
      this.sectionName,
      this.depth,
      schema,
      this.expectedHeadings,
      this.blockOrderConfig,
    )
  }
}

export class SectionBuilder {
  constructor(
    private readonly name: string,
    private readonly blockOrderConfig?: SectionBlockOrderConfig,
  ) {}

  blockOrder(order: SectionBlockOrderType[], options?: SectionBlockOrderOptions) {
    const mode = options?.mode ?? 'relative'
    const normalizedOrder =
      mode === 'relative' ? Array.from(new Set(order)) : [...order]
    const config: SectionBlockOrderConfig = {
      order: normalizedOrder,
      allowRepeats: options?.allowRepeats ?? true,
      allowUnlisted: options?.allowUnlisted ?? true,
      mode,
    }
    return new SectionBuilder(this.name, config)
  }

  fields<TShape extends FieldsShape>(shape: TShape, options?: SectionFieldsOptions) {
    return new SectionFieldsSchema(this.name, shape, this.blockOrderConfig, options)
  }

  paragraph() {
    return new SectionParagraphSchema(this.name, this.blockOrderConfig)
  }

  paragraphs<TSchemas extends readonly BaseSchema<unknown, any>[]>(schemas: TSchemas) {
    return new SectionParagraphsSchema(this.name, schemas, this.blockOrderConfig)
  }

  list<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionListSchema(this.name, schema, this.blockOrderConfig)
  }

  tables<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionTableSchema<TItem>(
      this.name,
      schema,
      this.blockOrderConfig,
    )
  }

  blockquotes<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdBlockquote, TItem>(
      this.name,
      (section) => section.blockquotes,
      schema,
      'missing_blockquote',
      `Section "${this.name}" must contain a blockquote`,
      'invalid_blockquote',
      'Invalid blockquote item',
      this.blockOrderConfig,
    )
  }

  code<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdCodeFence, TItem>(
      this.name,
      (section) => section.code,
      schema,
      'missing_code_fence',
      `Section "${this.name}" must contain a code fence`,
      'invalid_code_fence',
      'Invalid code fence item',
      this.blockOrderConfig,
    )
  }

  mermaid<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdMermaidBlock, TItem>(
      this.name,
      (section) => section.mermaid,
      schema,
      'missing_mermaid',
      `Section "${this.name}" must contain a mermaid code fence`,
      'invalid_mermaid',
      'Invalid mermaid item',
      this.blockOrderConfig,
    )
  }

  math<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdMathBlock, TItem>(
      this.name,
      (section) => section.math,
      schema,
      'missing_math_block',
      `Section "${this.name}" must contain a math block`,
      'invalid_math_block',
      'Invalid math block item',
      this.blockOrderConfig,
    )
  }

  links<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdLink, TItem>(
      this.name,
      (section) => section.links,
      schema,
      'missing_link',
      `Section "${this.name}" must contain a link`,
      'invalid_link',
      'Invalid link item',
      this.blockOrderConfig,
    )
  }

  images<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdImage, TItem>(
      this.name,
      (section) => section.images,
      schema,
      'missing_image',
      `Section "${this.name}" must contain an image`,
      'invalid_image',
      'Invalid image item',
      this.blockOrderConfig,
    )
  }

  footnotes<TItem>(schema: BaseSchema<unknown, TItem>, options?: SectionFootnotesOptions) {
    return new SectionFootnotesSchema<TItem>(this.name, schema, options, this.blockOrderConfig)
  }

  taskList<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdTaskItem, TItem>(
      this.name,
      (section) => section.taskItems,
      schema,
      'missing_task_list',
      `Section "${this.name}" must contain a task list`,
      'invalid_task_item',
      'Invalid task item',
      this.blockOrderConfig,
    )
  }

  orderedLists<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdOrderedList, TItem>(
      this.name,
      (section) => section.orderedLists,
      schema,
      'missing_ordered_list',
      `Section "${this.name}" must contain an ordered list`,
      'invalid_ordered_list',
      'Invalid ordered list item',
      this.blockOrderConfig,
    )
  }

  nestedLists<TItem>(schema: BaseSchema<unknown, TItem>, options?: SectionNestedListsOptions) {
    return new SectionCollectionSchema<TypeMdNestedList | TypeMdNestedListTree, TItem>(
      this.name,
      (section) => {
        if (options?.as !== 'tree') {
          return section.nestedLists
        }

        return section.nestedLists.map((list) => ({
          items: toNestedTreeItems(list.items),
          line: list.line,
          position: list.position,
        }))
      },
      schema,
      'missing_nested_list',
      `Section "${this.name}" must contain a nested list`,
      'invalid_nested_list',
      'Invalid nested list item',
      this.blockOrderConfig,
    )
  }

  referenceLinks<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdReferenceLink, TItem>(
      this.name,
      (section) => section.referenceLinks,
      schema,
      'missing_reference_link',
      `Section "${this.name}" must contain a reference link`,
      'invalid_reference_link',
      'Invalid reference link item',
      this.blockOrderConfig,
    )
  }

  autolinks<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdAutolink, TItem>(
      this.name,
      (section) => section.autolinks,
      schema,
      'missing_autolink',
      `Section "${this.name}" must contain an autolink`,
      'invalid_autolink',
      'Invalid autolink item',
      this.blockOrderConfig,
    )
  }

  htmlBlocks<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdHtmlBlock, TItem>(
      this.name,
      (section) => section.htmlBlocks,
      schema,
      'missing_html_block',
      `Section "${this.name}" must contain an HTML block`,
      'invalid_html_block',
      'Invalid HTML block item',
      this.blockOrderConfig,
    )
  }

  htmlInlines<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdHtmlInline, TItem>(
      this.name,
      (section) => section.htmlInlines,
      schema,
      'missing_html_inline',
      `Section "${this.name}" must contain an inline HTML node`,
      'invalid_html_inline',
      'Invalid inline HTML item',
      this.blockOrderConfig,
    )
  }

  readonly htmlInline = {
    elements: <TItem>(schema: BaseSchema<unknown, TItem>) =>
      new SectionCollectionSchema<TypeMdHtmlInlineElement, TItem>(
        this.name,
        (section) => section.htmlInlineElements,
        schema,
        'missing_html_inline_element',
        `Section "${this.name}" must contain an inline HTML element`,
        'invalid_html_inline_element',
        'Invalid inline HTML element',
        this.blockOrderConfig,
      ),
  }

  mathInlines<TItem>(schema: BaseSchema<unknown, TItem>) {
    return new SectionCollectionSchema<TypeMdMathInline, TItem>(
      this.name,
      (section) => section.mathInlines,
      schema,
      'missing_math_inline',
      `Section "${this.name}" must contain an inline math node`,
      'invalid_math_inline',
      'Invalid inline math item',
      this.blockOrderConfig,
    )
  }

  subsections(depth: number) {
    return new SectionChildrenBuilder(this.name, depth, undefined, this.blockOrderConfig)
  }
}

export const section = (name: string) => new SectionBuilder(name)
