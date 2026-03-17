import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('mermaid support', () => {
  it('extracts mermaid code fences with section().mermaid()', () => {
    const markdown = `# RUNBOOK: Mermaid Demo

## 9. ADVANCED BLOCK

~~~mermaid
flowchart TD
  A[Ingestion] --> B[Scoring]
  B --> C[Decision]
~~~
`

    const advanced = md.section('9. ADVANCED BLOCK').blockOrder(['mermaid'], {
      mode: 'relative',
      allowRepeats: true,
      allowUnlisted: true,
    })

    const schema = md.document({
      title: md.heading(1).regex(/^RUNBOOK:\s.+/),
      advanced: md.object({
        diagrams: advanced
          .mermaid(
            md.object({
              language: md.literal('mermaid'),
              code: md.string().includes('flowchart TD'),
              meta: md.string().optional(),
            }),
          )
          .min(1),
      }),
    })

    const result = schema.safeParse(markdown)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.advanced.diagrams).toHaveLength(1)
      expect(result.data.advanced.diagrams[0].language).toBe('mermaid')
    }
  })

  it('returns missing_mermaid when required mermaid fence is absent', () => {
    const markdown = `# RUNBOOK: Mermaid Demo

## 9. ADVANCED BLOCK

~~~ts
const value = 1
~~~
`

    const schema = md.document({
      title: md.heading(1),
      advanced: md.object({
        diagrams: md
          .section('9. ADVANCED BLOCK')
          .mermaid(md.object({ language: md.literal('mermaid'), code: md.string().min(1) }))
          .min(1),
      }),
    })

    const result = schema.safeParse(markdown)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_mermaid')).toBe(true)
    }
  })

})
