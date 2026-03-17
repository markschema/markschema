import { findFirstHeadingByDepth, type TypeMdDocument } from '../core/ast'
import { addIssue, type ParseContext, BaseSchema } from '../core/schema'

export class HeadingSchema extends BaseSchema<TypeMdDocument, string> {
  private pattern?: RegExp

  constructor(private readonly depth: number) {
    super()
  }

  regex(pattern: RegExp): this {
    this.pattern = pattern
    return this
  }

  protected _parse(document: TypeMdDocument, ctx: ParseContext): string | undefined {
    const heading = findFirstHeadingByDepth(document, this.depth)

    if (!heading) {
      addIssue(ctx, {
        code: 'missing_heading',
        message: `Missing heading with depth ${this.depth}`,
      })
      return undefined
    }

    if (this.pattern && !this.pattern.test(heading.headingText)) {
      addIssue(ctx, {
        code: 'heading_pattern_mismatch',
        message: `Heading does not match required pattern ${this.pattern.toString()}`,
        line: heading.headingLine,
        position: heading.headingPosition,
      })
      return undefined
    }

    return heading.headingText
  }
}

export const heading = (depth: number) => new HeadingSchema(depth)
