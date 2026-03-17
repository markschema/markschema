import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('htmlInlines and htmlInline.elements', () => {
  const markdownWithInlineHtml = `## 9. ADVANCED BLOCK

This line has <span class="hl">inline HTML</span> and a break <br />.
`

  it('keeps htmlInlines backward-compatible with raw tag tokens', () => {
    const schema = md.document({
      htmlInlines: md
        .section('9. ADVANCED BLOCK')
        .htmlInlines(md.object({ text: md.string().min(1) }))
        .min(1),
    })

    const result = schema.safeParse(markdownWithInlineHtml)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.htmlInlines).toEqual(
        expect.arrayContaining([{ text: '<span class="hl">' }, { text: '</span>' }, { text: '<br />' }]),
      )
    }
  })

  it('extracts structured paired elements with attrs/text/raw', () => {
    const schema = md.document({
      elements: md
        .section('9. ADVANCED BLOCK')
        .htmlInline.elements(
          md.object({
            tag: md.string(),
            attrs: md.record(md.string()),
            text: md.string(),
            raw: md.string(),
          }),
        )
        .min(1),
    })

    const result = schema.safeParse(markdownWithInlineHtml)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.elements).toEqual(
        expect.arrayContaining([
          {
            tag: 'span',
            attrs: { class: 'hl' },
            text: 'inline HTML',
            raw: '<span class="hl">inline HTML</span>',
          },
        ]),
      )
    }
  })

  it('extracts self-closing elements with empty text', () => {
    const markdownWithSelfClosingOnly = `## 9. ADVANCED BLOCK

This line has a forced break <br />.
`

    const schema = md.document({
      elements: md
        .section('9. ADVANCED BLOCK')
        .htmlInline.elements(
          md.object({
            tag: md.literal('br'),
            attrs: md.record(md.string()),
            text: md.literal(''),
            raw: md.string(),
          }),
        )
        .min(1),
    })

    const result = schema.safeParse(markdownWithSelfClosingOnly)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.elements).toEqual(
        expect.arrayContaining([
          {
            tag: 'br',
            attrs: {},
            text: '',
            raw: '<br />',
          },
        ]),
      )
    }
  })

  it('returns missing_html_inline_element when no inline html element exists', () => {
    const schema = md.document({
      elements: md
        .section('9. ADVANCED BLOCK')
        .htmlInline.elements(md.object({ tag: md.string(), attrs: md.record(md.string()), text: md.string(), raw: md.string() }))
        .min(1),
    })

    const result = schema.safeParse(`## 9. ADVANCED BLOCK

Only plain text here.
`)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_html_inline_element')).toBe(true)
    }
  })
})
