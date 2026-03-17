import type { HeadingNode } from '@/lib/playground-model'

export const stripFrontmatter = (source: string): string => {
  if (!source.startsWith('---\n')) return source
  const closing = source.indexOf('\n---\n', 4)
  if (closing === -1) return source
  return source.slice(closing + 5)
}

export const inferDocumentTitle = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/)
  for (const line of lines) {
    const heading = /^#\s+(.+)$/.exec(line)
    if (heading) return (heading[1] ?? '').trim()
  }
  return 'Untitled document'
}

export const findHeadingForLine = (line: number, headings: HeadingNode[]): HeadingNode | undefined => {
  return headings.find((heading) => line >= heading.line && line <= heading.endLine)
}

export const isLikelyUrl = (value: string) => /^https?:\/\//i.test(value.trim())
