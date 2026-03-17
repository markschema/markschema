import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('math support', () => {
  it('parses and validates inline and block math', () => {
    const markdown = `# RUNBOOK: Math Demo

## 9. ADVANCED BLOCK

Quality follows $E = mc^2$ under constrained latency.

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`

    const advanced = md
      .section('9. ADVANCED BLOCK')
      .blockOrder(['paragraph', 'math'], {
        mode: 'relative',
        allowRepeats: true,
        allowUnlisted: true,
      })

    const schema = md.document({
      title: md.heading(1).regex(/^RUNBOOK:\s.+/),
      advanced: md.object({
        paragraphs: advanced.paragraphs([md.string().includes('mc^2')]),
        mathBlocks: advanced.math(md.object({ text: md.string().includes('\\int_0^\\infty') })).min(1),
        mathInlines: advanced.mathInlines(md.object({ text: md.string().includes('E = mc^2') })).min(1),
      }),
    })

    const result = schema.safeParse(markdown)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.advanced.mathBlocks).toHaveLength(1)
      expect(result.data.advanced.mathInlines).toHaveLength(1)
    }
  })

  it('returns missing_math_block when required math block is absent', () => {
    const markdown = `# RUNBOOK: Math Demo

## 9. ADVANCED BLOCK

Only inline math here: $E = mc^2$.
`

    const advanced = md.section('9. ADVANCED BLOCK')

    const schema = md.document({
      title: md.heading(1),
      advanced: md.object({
        mathBlocks: advanced.math(md.object({ text: md.string().min(1) })).min(1),
      }),
    })

    const result = schema.safeParse(markdown)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_math_block')).toBe(true)
    }
  })
})
