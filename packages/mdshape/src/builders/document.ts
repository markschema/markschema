import { parseMarkdownDocument, walkSections, type TypeMdDocument, type TypeMdSectionNode } from '../core/ast'
import { addIssue, type ParseContext, BaseSchema, type ParsePath, type SectionAnchor } from '../core/schema'

type DocumentShape = Record<string, BaseSchema<TypeMdDocument, unknown>>
type DocumentOptions = {
  ordered?: boolean
}

type InferSchemaOutput<TSchema> = TSchema extends BaseSchema<any, infer TOutput> ? TOutput : never

export type InferDocumentOutput<TShape extends DocumentShape> = {
  [TKey in keyof TShape]: InferSchemaOutput<TShape[TKey]>
}

type AnchoredSection = {
  sectionName: string
  path: ParsePath
}

const dedupeAnchorsBySectionName = (anchors: AnchoredSection[]): AnchoredSection[] => {
  const seen = new Set<string>()
  const result: AnchoredSection[] = []

  for (const anchor of anchors) {
    if (seen.has(anchor.sectionName)) {
      continue
    }

    seen.add(anchor.sectionName)
    result.push(anchor)
  }

  return result
}

const compareSectionPosition = (left: TypeMdSectionNode, right: TypeMdSectionNode): number => {
  const leftOffset = left.headingPosition?.start.offset
  const rightOffset = right.headingPosition?.start.offset

  if (leftOffset !== undefined && rightOffset !== undefined) {
    return leftOffset - rightOffset
  }

  const leftLine = left.headingPosition?.start.line ?? left.headingLine ?? 0
  const rightLine = right.headingPosition?.start.line ?? right.headingLine ?? 0
  if (leftLine !== rightLine) {
    return leftLine - rightLine
  }

  const leftColumn = left.headingPosition?.start.column ?? 0
  const rightColumn = right.headingPosition?.start.column ?? 0
  return leftColumn - rightColumn
}

export class DocumentSchema<TShape extends DocumentShape> extends BaseSchema<string, InferDocumentOutput<TShape>> {
  private readonly ordered: boolean

  constructor(
    private readonly shape: TShape,
    options?: DocumentOptions,
  ) {
    super()
    this.ordered = options?.ordered ?? false
  }

  private collectSectionAnchors(): AnchoredSection[] {
    const anchors: AnchoredSection[] = []

    for (const [key, schema] of Object.entries(this.shape)) {
      const schemaAnchors = schema.getSectionAnchors().map((anchor: SectionAnchor) => ({
        sectionName: anchor.sectionName,
        path: [key, ...anchor.path],
      }))
      anchors.push(...schemaAnchors)
    }

    return dedupeAnchorsBySectionName(anchors)
  }

  private precheckSectionOrder(document: TypeMdDocument, ctx: ParseContext) {
    if (!this.ordered) {
      return
    }

    const anchors = this.collectSectionAnchors()
    if (anchors.length === 0) {
      return
    }

    const sections = walkSections(document)
    const byHeading = new Map<string, TypeMdSectionNode[]>()

    for (const section of sections) {
      const bucket = byHeading.get(section.headingText)
      if (bucket) {
        bucket.push(section)
      } else {
        byHeading.set(section.headingText, [section])
      }
    }

    for (const anchor of anchors) {
      const occurrences = byHeading.get(anchor.sectionName) ?? []
      if (occurrences.length <= 1) {
        continue
      }

      for (let index = 1; index < occurrences.length; index += 1) {
        const duplicate = occurrences[index]
        addIssue(
          {
            issues: ctx.issues,
            path: anchor.path,
          },
          {
            code: 'duplicate_section',
            message: `Section "${anchor.sectionName}" appears multiple times`,
            line: duplicate.headingLine,
            position: duplicate.headingPosition,
          },
        )
      }
    }

    let lastResolved: { anchor: AnchoredSection; section: TypeMdSectionNode } | undefined
    for (const anchor of anchors) {
      const current = (byHeading.get(anchor.sectionName) ?? [])[0]
      if (!current) {
        continue
      }

      if (!lastResolved) {
        lastResolved = { anchor, section: current }
        continue
      }

      if (compareSectionPosition(current, lastResolved.section) < 0) {
        addIssue(
          {
            issues: ctx.issues,
            path: anchor.path,
          },
          {
            code: 'section_order_mismatch',
            message: `Section "${anchor.sectionName}" appears before "${lastResolved.anchor.sectionName}"`,
            line: current.headingLine,
            position: current.headingPosition,
          },
        )
        continue
      }

      lastResolved = { anchor, section: current }
    }
  }

  protected _parse(markdown: string, ctx: ParseContext): InferDocumentOutput<TShape> | undefined {
    if (typeof markdown !== 'string') {
      addIssue(ctx, {
        code: 'invalid_type',
        message: `Expected markdown as string, received ${typeof markdown}`,
      })
      return undefined
    }

    const document = parseMarkdownDocument(markdown)
    this.precheckSectionOrder(document, ctx)
    const result = {} as InferDocumentOutput<TShape>

    for (const [key, schema] of Object.entries(this.shape)) {
      const value = schema.run(document, {
        issues: ctx.issues,
        path: [...ctx.path, key],
      })

      if (value !== undefined) {
        ;(result as Record<string, unknown>)[key] = value
      }
    }

    return result
  }
}

export const document = <TShape extends DocumentShape>(shape: TShape, options?: DocumentOptions) =>
  new DocumentSchema(shape, options)
