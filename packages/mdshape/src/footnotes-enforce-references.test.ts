import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('section footnotes enforceReferences', () => {
  it('keeps backward-compatible behavior when enforceReferences is false', () => {
    const schema = md.document({
      footnotes: md
        .section('9. ADVANCED BLOCK')
        .footnotes(md.object({ id: md.string(), text: md.string() }), { enforceReferences: false })
        .min(1),
    })

    const markdown = `## 9. ADVANCED BLOCK

Text with note[^1].

[^a]: Footnote content.
`

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.footnotes[0]?.id).toBe('a')
    }
  })

  it('fails when enforceReferences is true and reference has no definition', () => {
    const schema = md.document({
      footnotes: md
        .section('9. ADVANCED BLOCK')
        .footnotes(md.object({ id: md.string(), text: md.string() }), { enforceReferences: true })
        .min(1),
    })

    const markdown = `## 9. ADVANCED BLOCK

Text with note[^1].

[^a]: Footnote content.
`

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_footnote_definition')).toBe(true)
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'footnotes')).toBe(true)
    }
  })

  it('passes when enforceReferences is true and ids match', () => {
    const schema = md.document({
      footnotes: md
        .section('9. ADVANCED BLOCK')
        .footnotes(md.object({ id: md.string(), text: md.string() }), { enforceReferences: true })
        .min(1),
    })

    const markdown = `## 9. ADVANCED BLOCK

Text with note[^a].

[^a]: Footnote content.
`

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(true)
  })
})
