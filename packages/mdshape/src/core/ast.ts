import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import YAML from 'yaml'
import { lineFromPosition, positionFromLine, type TypeMdPosition } from './position'

type MdNode = {
  type: string
  depth?: number
  ordered?: boolean
  checked?: boolean | null
  lang?: string
  meta?: string
  url?: string
  title?: string | null
  alt?: string | null
  identifier?: string
  label?: string
  referenceType?: string
  value?: string
  children?: MdNode[]
  position?: TypeMdPosition
}

export type TypeMdBlock =
  | {
      type: 'paragraph'
      text: string
      labelHint?: {
        label: string
        normalizedLabel: string
        isStrong: boolean
        inlineValue?: string
      }
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'list'
      ordered: boolean
      items: Array<{ text: string; line?: number; checked?: boolean; depth: number; position?: TypeMdPosition }>
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'thematicBreak'
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'table'
      headers: string[]
      rows: string[][]
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'blockquote'
      text: string
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'code'
      language?: string
      code: string
      meta?: string
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'math'
      text: string
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'footnote'
      id: string
      text: string
      line?: number
      position?: TypeMdPosition
    }
  | {
      type: 'htmlBlock'
      text: string
      line?: number
      position?: TypeMdPosition
    }

export type TypeMdLabelEntry = {
  label: string
  normalizedLabel: string
  value: string
  isStrong: boolean
  line?: number
  position?: TypeMdPosition
}

type ParagraphLabelHint = {
  label: string
  normalizedLabel: string
  isStrong: boolean
  inlineValue?: string
}

export type TypeMdTable = {
  headers: string[]
  rows: string[][]
  line?: number
  position?: TypeMdPosition
}

export type TypeMdBlockquote = {
  text: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdCodeFence = {
  language?: string
  code: string
  meta?: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdMermaidBlock = {
  language: 'mermaid'
  code: string
  meta?: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdMathBlock = {
  text: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdMathInline = {
  text: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdLink = {
  text: string
  url: string
  title?: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdReferenceLink = {
  text: string
  identifier: string
  url?: string
  title?: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdAutolink = {
  text: string
  url: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdImage = {
  alt: string
  url: string
  title?: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdFootnote = {
  id: string
  text: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdFootnoteReference = {
  id: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdTaskItem = {
  text: string
  checked: boolean
  line?: number
  position?: TypeMdPosition
}

export type TypeMdFieldEntry = {
  key: string
  value: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdOrderedList = {
  items: Array<{
    index: number
    text: string
    depth: number
    checked?: boolean
    line?: number
    position?: TypeMdPosition
  }>
  line?: number
  position?: TypeMdPosition
}

export type TypeMdNestedList = {
  items: Array<{
    text: string
    depth: number
    ordered: boolean
    checked?: boolean
    line?: number
    position?: TypeMdPosition
  }>
  line?: number
  position?: TypeMdPosition
}

export type TypeMdHtmlBlock = {
  text: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdHtmlInline = {
  text: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdHtmlInlineElement = {
  tag: string
  attrs: Record<string, string>
  text: string
  raw: string
  line?: number
  position?: TypeMdPosition
}

export type TypeMdSectionNode = {
  depth: number
  headingText: string
  headingLine?: number
  headingPosition?: TypeMdPosition
  blocks: TypeMdBlock[]
  paragraphs: string[]
  paragraphLines: number[]
  paragraphPositions: Array<TypeMdPosition | undefined>
  listItems: string[]
  listItemLines: Array<number | undefined>
  listItemPositions: Array<TypeMdPosition | undefined>
  fields: Record<string, string>
  fieldEntries: TypeMdFieldEntry[]
  fieldLines: Record<string, number | undefined>
  fieldPositions: Record<string, TypeMdPosition | undefined>
  labels: Record<string, string[]>
  labelEntries: TypeMdLabelEntry[]
  tables: TypeMdTable[]
  blockquotes: TypeMdBlockquote[]
  code: TypeMdCodeFence[]
  mermaid: TypeMdMermaidBlock[]
  math: TypeMdMathBlock[]
  links: TypeMdLink[]
  referenceLinks: TypeMdReferenceLink[]
  autolinks: TypeMdAutolink[]
  images: TypeMdImage[]
  footnotes: TypeMdFootnote[]
  footnoteReferences: TypeMdFootnoteReference[]
  taskItems: TypeMdTaskItem[]
  orderedLists: TypeMdOrderedList[]
  nestedLists: TypeMdNestedList[]
  htmlBlocks: TypeMdHtmlBlock[]
  htmlInlines: TypeMdHtmlInline[]
  htmlInlineElements: TypeMdHtmlInlineElement[]
  mathInlines: TypeMdMathInline[]
  children: TypeMdSectionNode[]
}

export type TypeMdDocument = {
  root: TypeMdSectionNode
  metadata?: string
  metadataObject?: unknown
  frontmatterError?: string
  frontmatterLine?: number
  frontmatterPosition?: TypeMdPosition
}

type LinkDefinition = {
  url: string
  title?: string
}

const createNode = (
  depth: number,
  headingText: string,
  headingLine?: number,
  headingPosition?: TypeMdPosition,
): TypeMdSectionNode => ({
  depth,
  headingText,
  headingLine,
  headingPosition: headingPosition ?? positionFromLine(headingLine),
  blocks: [],
  paragraphs: [],
  paragraphLines: [],
  paragraphPositions: [],
  listItems: [],
  listItemLines: [],
  listItemPositions: [],
  fields: {},
  fieldEntries: [],
  fieldLines: {},
  fieldPositions: {},
  labels: {},
  labelEntries: [],
  tables: [],
  blockquotes: [],
  code: [],
  mermaid: [],
  math: [],
  links: [],
  referenceLinks: [],
  autolinks: [],
  images: [],
  footnotes: [],
  footnoteReferences: [],
  taskItems: [],
  orderedLists: [],
  nestedLists: [],
  htmlBlocks: [],
  htmlInlines: [],
  htmlInlineElements: [],
  mathInlines: [],
  children: [],
})

const extractText = (node: MdNode): string => {
  if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'html' || node.type === 'inlineMath') {
    return node.value ?? ''
  }

  if (node.type === 'math') {
    const value = node.value ?? ''
    return value ? `$$${value}$$` : ''
  }

  if (node.type === 'break') {
    return '\n'
  }

  if (!node.children || node.children.length === 0) {
    return ''
  }

  return node.children.map(extractText).join('')
}

export const normalizeLabel = (label: string): string => {
  return label
    .replace(/[\*_`]/g, '')
    .replace(/:+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const extractListItems = (
  node: MdNode,
  depth = 1,
): Array<{ text: string; line?: number; checked?: boolean; depth: number; position?: TypeMdPosition }> => {
  const items: Array<{ text: string; line?: number; checked?: boolean; depth: number; position?: TypeMdPosition }> = []

  for (const child of node.children ?? []) {
    const ownContent = (child.children ?? [])
      .filter((entry) => entry.type !== 'list')
      .map((entry) => extractText(entry).trim())
      .filter(Boolean)
      .join('\n\n')
      .trim()

    if (ownContent) {
      items.push({
        text: ownContent,
        line: lineFromPosition(child.position),
        checked:
          child.checked === undefined || child.checked === null ? undefined : child.checked === true,
        depth,
        position: child.position,
      })
    }

    for (const nested of child.children ?? []) {
      if (nested.type !== 'list') {
        continue
      }

      items.push(...extractListItems(nested, depth + 1))
    }
  }

  return items
}

const extractTable = (node: MdNode): TypeMdTable => {
  const rows = (node.children ?? []).map((row) => (row.children ?? []).map((cell) => extractText(cell).trim()))
  const headers = rows[0] ?? []
  const bodyRows = rows.slice(1)

  return {
    headers,
    rows: bodyRows,
    line: lineFromPosition(node.position),
    position: node.position,
  }
}

const collectDefinitions = (node: MdNode, definitions: Map<string, LinkDefinition>) => {
  if (node.type === 'definition' && node.identifier && node.url) {
    definitions.set(node.identifier.trim().toLowerCase(), {
      url: node.url,
      title: node.title ?? undefined,
    })
  }

  for (const child of node.children ?? []) {
    collectDefinitions(child, definitions)
  }
}

const collectInlineNodes = (
  node: MdNode,
  section: Pick<
    TypeMdSectionNode,
    'links' | 'images' | 'referenceLinks' | 'autolinks' | 'htmlInlines' | 'mathInlines' | 'footnoteReferences'
  >,
  definitions: Map<string, LinkDefinition>,
  parentType: string,
) => {
  if (node.type === 'link' && node.url) {
    const text = extractText(node).trim()
    section.links.push({
      text,
      url: node.url,
      title: node.title ?? undefined,
      line: lineFromPosition(node.position),
      position: node.position,
    })

    if (text === node.url) {
      section.autolinks.push({
        text,
        url: node.url,
        line: lineFromPosition(node.position),
        position: node.position,
      })
    }
  }

  if (node.type === 'linkReference' && node.identifier) {
    const identifier = node.identifier.trim()
    const definition = definitions.get(identifier.toLowerCase())

    section.referenceLinks.push({
      text: extractText(node).trim(),
      identifier,
      url: definition?.url,
      title: definition?.title,
      line: lineFromPosition(node.position),
      position: node.position,
    })
  }

  if (node.type === 'image' && node.url) {
    section.images.push({
      alt: node.alt ?? '',
      url: node.url,
      title: node.title ?? undefined,
      line: lineFromPosition(node.position),
      position: node.position,
    })
  }

  if (node.type === 'html' && parentType !== 'root') {
    const text = (node.value ?? '').trim()
    if (text) {
      section.htmlInlines.push({
        text,
        line: lineFromPosition(node.position),
        position: node.position,
      })
    }
  }

  if (node.type === 'inlineMath') {
    const text = (node.value ?? '').trim()
    if (text) {
      section.mathInlines.push({
        text,
        line: lineFromPosition(node.position),
        position: node.position,
      })
    }
  }

  if (node.type === 'footnoteReference') {
    const id = (node.identifier ?? node.label ?? '').trim()
    if (id) {
      section.footnoteReferences.push({
        id,
        line: lineFromPosition(node.position),
        position: node.position,
      })
    }
  }

  for (const child of node.children ?? []) {
    collectInlineNodes(child, section, definitions, node.type)
  }
}

const extractParagraphLabelHint = (paragraph: MdNode): ParagraphLabelHint | undefined => {
  const children = paragraph.children ?? []
  if (children.length > 0 && children[0].type === 'strong') {
    const firstStrongText = extractText(children[0]).trim()
    if (firstStrongText.endsWith(':')) {
      const label = firstStrongText.slice(0, -1).trim()
      const normalizedLabel = normalizeLabel(label)
      const inlineValue = children
        .slice(1)
        .map((child) => extractText(child))
        .join('')
        .trim()

      return {
        label,
        normalizedLabel,
        isStrong: true,
        inlineValue: inlineValue || undefined,
      }
    }
  }

  const text = extractText(paragraph).trim()
  const labelWithValue = text.match(/^([^:]{1,120}):\s*(.+)$/s)
  if (labelWithValue) {
    const label = labelWithValue[1].trim()
    const inlineValue = labelWithValue[2].trim()
    if (label && inlineValue) {
      return {
        label,
        normalizedLabel: normalizeLabel(label),
        isStrong: false,
        inlineValue,
      }
    }
  }

  const labelOnly = text.match(/^([^:]{1,120}):\s*$/s)
  if (labelOnly) {
    const label = labelOnly[1].trim()
    if (label) {
      return {
        label,
        normalizedLabel: normalizeLabel(label),
        isStrong: false,
      }
    }
  }

  return undefined
}

const parseLabelOnlyParagraph = (text: string): ParagraphLabelHint | undefined => {
  const match = text.match(/^([^:]{1,120}):\s*$/s)
  if (!match) {
    return undefined
  }

  const label = match[1].trim()
  if (!label) {
    return undefined
  }

  return {
    label,
    normalizedLabel: normalizeLabel(label),
    isStrong: false,
  }
}

const collectTextFootnoteReferences = (
  text: string,
  line: number | undefined,
  position: TypeMdPosition | undefined,
  section: Pick<TypeMdSectionNode, 'footnoteReferences'>,
) => {
  const matches = text.matchAll(/\[\^([^\]\s]+)\]/g)
  for (const match of matches) {
    const id = (match[1] ?? '').trim()
    if (!id) continue
    section.footnoteReferences.push({
      id,
      line,
      position,
    })
  }
}

const parseHtmlAttributes = (source: string | undefined): Record<string, string> => {
  if (!source) return {}

  const attrs: Record<string, string> = {}
  const attrPattern = /([:@A-Za-z_][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

  for (const match of source.matchAll(attrPattern)) {
    const key = (match[1] ?? '').trim()
    if (!key) continue
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    attrs[key] = value
  }

  return attrs
}

const collectHtmlInlineElementsFromText = (
  text: string,
  line: number | undefined,
  position: TypeMdPosition | undefined,
  section: Pick<TypeMdSectionNode, 'htmlInlineElements'>,
) => {
  if (!text) return

  const matches: Array<{
    index: number
    tag: string
    attrs: Record<string, string>
    text: string
    raw: string
  }> = []

  const pairedPattern = /<([A-Za-z][\w:-]*)(\s[^<>]*?)?>([^<>]*)<\/\1>/g
  for (const match of text.matchAll(pairedPattern)) {
    const raw = match[0] ?? ''
    const tag = (match[1] ?? '').trim()
    if (!raw || !tag) continue
    matches.push({
      index: match.index ?? 0,
      tag,
      attrs: parseHtmlAttributes(match[2]),
      text: (match[3] ?? '').trim(),
      raw,
    })
  }

  const selfClosingPattern = /<([A-Za-z][\w:-]*)(\s[^<>]*?)?\s*\/>/g
  for (const match of text.matchAll(selfClosingPattern)) {
    const raw = match[0] ?? ''
    const tag = (match[1] ?? '').trim()
    if (!raw || !tag) continue
    matches.push({
      index: match.index ?? 0,
      tag,
      attrs: parseHtmlAttributes(match[2]),
      text: '',
      raw,
    })
  }

  matches.sort((left, right) => left.index - right.index)

  for (const match of matches) {
    section.htmlInlineElements.push({
      tag: match.tag,
      attrs: match.attrs,
      text: match.text,
      raw: match.raw,
      line,
      position,
    })
  }
}

const finalizeNode = (node: TypeMdSectionNode) => {
  const paragraphs: string[] = []
  const paragraphLines: number[] = []
  const paragraphPositions: Array<TypeMdPosition | undefined> = []
  const listItems: string[] = []
  const listItemLines: Array<number | undefined> = []
  const listItemPositions: Array<TypeMdPosition | undefined> = []
  const fields: Record<string, string> = {}
  const fieldEntries: TypeMdFieldEntry[] = []
  const fieldLines: Record<string, number | undefined> = {}
  const fieldPositions: Record<string, TypeMdPosition | undefined> = {}
  const labels: Record<string, string[]> = {}
  const labelEntries: TypeMdLabelEntry[] = []
  const tables: TypeMdTable[] = []
  const blockquotes: TypeMdBlockquote[] = []
  const code: TypeMdCodeFence[] = []
  const mermaid: TypeMdMermaidBlock[] = []
  const math: TypeMdMathBlock[] = []
  const footnotes: TypeMdFootnote[] = []
  const taskItems: TypeMdTaskItem[] = []
  const orderedLists: TypeMdOrderedList[] = []
  const nestedLists: TypeMdNestedList[] = []
  const htmlBlocks: TypeMdHtmlBlock[] = []

  for (let blockIndex = 0; blockIndex < node.blocks.length; blockIndex += 1) {
    const block = node.blocks[blockIndex]

    if (block.type === 'paragraph') {
      const text = block.text.trim()
      if (text.length === 0) {
        continue
      }

      collectTextFootnoteReferences(text, block.line, block.position, node)
      collectHtmlInlineElementsFromText(text, block.line, block.position, node)

      paragraphs.push(text)
      paragraphLines.push(block.line ?? node.headingLine ?? 1)
      paragraphPositions.push(block.position)

      const hint = block.labelHint
      if (hint?.inlineValue) {
        labelEntries.push({
          label: hint.label,
          normalizedLabel: hint.normalizedLabel,
          value: hint.inlineValue,
          isStrong: hint.isStrong,
          line: block.line,
          position: block.position,
        })
        labels[hint.normalizedLabel] = [...(labels[hint.normalizedLabel] ?? []), hint.inlineValue]
        continue
      }

      const labelOnly = hint ?? parseLabelOnlyParagraph(text)
      if (labelOnly) {
        const collected: string[] = []
        let pointer = blockIndex + 1

        while (pointer < node.blocks.length) {
          const nextBlock = node.blocks[pointer]
          if (nextBlock.type !== 'paragraph') {
            break
          }

          const nextText = nextBlock.text.trim()
          if (!nextText) {
            break
          }

          if (nextBlock.type === 'paragraph' && nextBlock.labelHint) {
            if (labelOnly.isStrong && nextBlock.labelHint.isStrong) {
              break
            }
            if (!labelOnly.isStrong) {
              break
            }
          }

          collected.push(nextText)
          pointer += 1
        }

        const value = collected.join('\n\n').trim()
        if (value) {
          labelEntries.push({
            label: labelOnly.label,
            normalizedLabel: labelOnly.normalizedLabel,
            value,
            isStrong: labelOnly.isStrong,
            line: block.line,
            position: block.position,
          })
          labels[labelOnly.normalizedLabel] = [...(labels[labelOnly.normalizedLabel] ?? []), value]
        }
      }
      continue
    }

    if (block.type === 'list') {
      const hasNested = block.items.some((item) => item.depth > 1)

      // orderedLists is intentionally flat: only top-level ordered lists.
      if (block.ordered && !hasNested) {
        orderedLists.push({
          items: block.items.map((item, index) => ({
            index: index + 1,
            text: item.text,
            depth: item.depth,
            checked: item.checked,
            line: item.line,
            position: item.position,
          })),
          line: block.line,
          position: block.position,
        })
      }

      // nestedLists requires at least one nested item (depth > 1).
      if (hasNested) {
        nestedLists.push({
          items: block.items.map((item) => ({
            text: item.text,
            depth: item.depth,
            ordered: block.ordered,
            checked: item.checked,
            line: item.line,
            position: item.position,
          })),
          line: block.line,
          position: block.position,
        })
      }

      if (!block.ordered) {
        for (const item of block.items) {
          if (item.depth !== 1) {
            continue
          }

          listItems.push(item.text)
          collectTextFootnoteReferences(item.text, item.line, item.position, node)
          collectHtmlInlineElementsFromText(item.text, item.line, item.position, node)
          listItemLines.push(item.line)
          listItemPositions.push(item.position)

          if (item.checked !== undefined) {
            taskItems.push({
              checked: item.checked,
              text: item.text,
              line: item.line,
              position: item.position,
            })
          }

          const separatorIndex = item.text.indexOf(':')
          if (separatorIndex <= 0) {
            continue
          }

          const key = item.text.slice(0, separatorIndex).trim()
          const value = item.text.slice(separatorIndex + 1).trim()

          if (!key || !value) {
            continue
          }

          fields[key] = value
          fieldEntries.push({
            key,
            value,
            line: item.line,
            position: item.position,
          })
          fieldLines[key] = item.line
          fieldPositions[key] = item.position
        }
      }

      continue
    }

    if (block.type === 'table') {
      tables.push({
        headers: block.headers,
        rows: block.rows,
        line: block.line,
        position: block.position,
      })
      continue
    }

    if (block.type === 'blockquote') {
      collectTextFootnoteReferences(block.text, block.line, block.position, node)
      collectHtmlInlineElementsFromText(block.text, block.line, block.position, node)
      blockquotes.push({
        text: block.text,
        line: block.line,
        position: block.position,
      })
      continue
    }

    if (block.type === 'code') {
      const normalizedLanguage = block.language?.trim().toLowerCase()
      code.push({
        language: block.language,
        code: block.code,
        meta: block.meta,
        line: block.line,
        position: block.position,
      })

      if (normalizedLanguage === 'mermaid') {
        mermaid.push({
          language: 'mermaid',
          code: block.code,
          meta: block.meta,
          line: block.line,
          position: block.position,
        })
      }
      continue
    }

    if (block.type === 'math') {
      math.push({
        text: block.text,
        line: block.line,
        position: block.position,
      })
      continue
    }

    if (block.type === 'footnote') {
      footnotes.push({
        id: block.id,
        text: block.text,
        line: block.line,
        position: block.position,
      })
      continue
    }

    if (block.type === 'htmlBlock') {
      htmlBlocks.push({
        text: block.text,
        line: block.line,
        position: block.position,
      })
    }
  }

  node.paragraphs = paragraphs
  node.paragraphLines = paragraphLines
  node.paragraphPositions = paragraphPositions
  node.listItems = listItems
  node.listItemLines = listItemLines
  node.listItemPositions = listItemPositions
  node.fields = fields
  node.fieldEntries = fieldEntries
  node.fieldLines = fieldLines
  node.fieldPositions = fieldPositions
  node.labels = labels
  node.labelEntries = labelEntries
  node.tables = tables
  node.blockquotes = blockquotes
  node.code = code
  node.mermaid = mermaid
  node.math = math
  node.footnotes = footnotes
  node.taskItems = taskItems
  node.orderedLists = orderedLists
  node.nestedLists = nestedLists
  node.htmlBlocks = htmlBlocks
  for (const child of node.children) {
    finalizeNode(child)
  }
}

const extractFrontmatter = (markdown: string) => {
  const lines = markdown.split(/\r?\n/)

  if (lines.length === 0 || lines[0].trim() !== '---') {
    return {
      text: undefined as string | undefined,
      parsed: undefined as unknown,
      error: undefined as string | undefined,
      line: undefined as number | undefined,
      position: undefined as TypeMdPosition | undefined,
    }
  }

  let closingIndex = -1
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') {
      closingIndex = index
      break
    }
  }

  if (closingIndex === -1) {
    return {
      text: undefined,
      parsed: undefined,
      error: 'Frontmatter opening delimiter found without closing delimiter',
      line: 1,
      position: {
        start: { line: 1, column: 1 },
      },
    }
  }

  const text = lines.slice(1, closingIndex).join('\n')
  const position: TypeMdPosition = {
    start: { line: 1, column: 1 },
    end: { line: closingIndex + 1, column: lines[closingIndex].length + 1 },
  }

  try {
    const parsed = YAML.parse(text)
    return {
      text,
      parsed,
      error: undefined,
      line: 1,
      position,
    }
  } catch (error) {
    return {
      text,
      parsed: undefined,
      error: error instanceof Error ? error.message : String(error),
      line: 1,
      position,
    }
  }
}

export const parseMarkdownDocument = (markdown: string): TypeMdDocument => {
  const frontmatter = extractFrontmatter(markdown)
  const rootMd = remark().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown) as MdNode
  const definitions = new Map<string, LinkDefinition>()
  collectDefinitions(rootMd, definitions)

  const rootNode = createNode(0, '__root__')
  const stack: TypeMdSectionNode[] = [rootNode]

  for (const child of rootMd.children ?? []) {
    if (child.type === 'heading') {
      const depth = child.depth ?? 1
      const headingText = extractText(child).trim()
      const sectionNode = createNode(depth, headingText, lineFromPosition(child.position), child.position)

      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
        stack.pop()
      }

      stack[stack.length - 1].children.push(sectionNode)
      stack.push(sectionNode)
      continue
    }

    if (child.type === 'definition') {
      continue
    }

    const current = stack[stack.length - 1]
    collectInlineNodes(child, current, definitions, 'root')

    if (child.type === 'paragraph') {
      const children = (child as any).children as any[] | undefined
      const isHtmlOnly = children && children.length > 0 && children.every((c: any) => c.type === 'html')
      if (isHtmlOnly) {
        const text = children.map((c: any) => (c.value ?? '').trim()).join('')
        if (text) {
          current.blocks.push({
            type: 'htmlBlock',
            text,
            line: lineFromPosition(child.position),
            position: child.position,
          })
        }
        continue
      }
      const text = extractText(child).trim()
      if (text.length > 0) {
        const labelHint = extractParagraphLabelHint(child)
        current.blocks.push({
          type: 'paragraph',
          text,
          labelHint,
          line: lineFromPosition(child.position),
          position: child.position,
        })
      }
      continue
    }

    if (child.type === 'list') {
      current.blocks.push({
        type: 'list',
        ordered: child.ordered === true,
        items: extractListItems(child),
        line: lineFromPosition(child.position),
        position: child.position,
      })
      continue
    }

    if (child.type === 'table') {
      const table = extractTable(child)
      current.blocks.push({
        type: 'table',
        headers: table.headers,
        rows: table.rows,
        line: table.line,
        position: table.position,
      })
      continue
    }

    if (child.type === 'blockquote') {
      const text = extractText(child).trim()
      if (text) {
        current.blocks.push({
          type: 'blockquote',
          text,
          line: lineFromPosition(child.position),
          position: child.position,
        })
      }
      continue
    }

    if (child.type === 'code') {
      current.blocks.push({
        type: 'code',
        language: child.lang ?? undefined,
        code: child.value ?? '',
        meta: child.meta ?? undefined,
        line: lineFromPosition(child.position),
        position: child.position,
      })
      continue
    }

    if (child.type === 'math') {
      const text = (child.value ?? '').trim()
      if (text) {
        current.blocks.push({
          type: 'math',
          text,
          line: lineFromPosition(child.position),
          position: child.position,
        })
      }
      continue
    }

    if (child.type === 'footnoteDefinition') {
      const text = extractText(child).trim()
      if (text) {
        current.blocks.push({
          type: 'footnote',
          id: child.identifier ?? '',
          text,
          line: lineFromPosition(child.position),
          position: child.position,
        })
      }
      continue
    }

    if (child.type === 'html') {
      const text = (child.value ?? '').trim()
      if (text) {
        current.blocks.push({
          type: 'htmlBlock',
          text,
          line: lineFromPosition(child.position),
          position: child.position,
        })
      }
      continue
    }

    if (child.type === 'thematicBreak') {
      current.blocks.push({
        type: 'thematicBreak',
        line: lineFromPosition(child.position),
        position: child.position,
      })
    }
  }

  finalizeNode(rootNode)

  return {
    root: rootNode,
    metadata: frontmatter.text,
    metadataObject: frontmatter.parsed,
    frontmatterError: frontmatter.error,
    frontmatterLine: frontmatter.line,
    frontmatterPosition: frontmatter.position,
  }
}

export const walkSections = (document: TypeMdDocument): TypeMdSectionNode[] => {
  const result: TypeMdSectionNode[] = []

  const visit = (node: TypeMdSectionNode) => {
    if (node.depth > 0) {
      result.push(node)
    }

    for (const child of node.children) {
      visit(child)
    }
  }

  visit(document.root)
  return result
}

export const findFirstHeadingByDepth = (
  document: TypeMdDocument,
  depth: number,
): TypeMdSectionNode | undefined => {
  return walkSections(document).find((section) => section.depth === depth)
}

export const findSectionByHeadingText = (
  document: TypeMdDocument,
  headingText: string,
): TypeMdSectionNode | undefined => {
  return walkSections(document).find((section) => section.headingText === headingText)
}
