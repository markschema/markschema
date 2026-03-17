import type { TypeMdSectionNode } from '../core/ast'
import { addIssue, type ParseContext, BaseSchema } from '../core/schema'

export class HeadingTextSchema extends BaseSchema<TypeMdSectionNode, string> {
  private pattern?: RegExp
  private minLength?: number

  regex(pattern: RegExp): this {
    this.pattern = pattern
    return this
  }

  min(length: number): this {
    this.minLength = length
    return this
  }

  protected _parse(section: TypeMdSectionNode, ctx: ParseContext): string | undefined {
    const text = section.headingText

    if (this.minLength !== undefined && text.length < this.minLength) {
      addIssue(ctx, {
        code: 'string_too_short',
        message: `Heading text must contain at least ${this.minLength} characters`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    if (this.pattern && !this.pattern.test(text)) {
      addIssue(ctx, {
        code: 'heading_pattern_mismatch',
        message: `Heading does not match required pattern ${this.pattern.toString()}`,
        line: section.headingLine,
        position: section.headingPosition,
      })
      return undefined
    }

    return text
  }
}

export const headingText = () => new HeadingTextSchema()
