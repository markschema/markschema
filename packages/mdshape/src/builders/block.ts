import type { TypeMdSectionNode } from '../core/ast'
import { addIssue, applyFallbackPosition, type ParseContext, BaseSchema } from '../core/schema'

export class BlockListSchema<TItem> extends BaseSchema<TypeMdSectionNode, TItem[]> {
  private minItems?: number

  constructor(private readonly itemSchema: BaseSchema<unknown, TItem>) {
    super()
  }

  min(size: number): this {
    this.minItems = size
    return this
  }

  protected _parse(section: TypeMdSectionNode, ctx: ParseContext): TItem[] | undefined {
    if (section.listItems.length === 0) {
      addIssue(ctx, {
        code: 'missing_list',
        message: 'Current block must contain an unordered list',
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

export const block = {
  list: <TItem>(schema: BaseSchema<unknown, TItem>) => new BlockListSchema(schema),
}
