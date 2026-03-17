import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('section fields case sensitivity', () => {
  const markdown = `# RUNBOOK: Document Builder

## 1. META

- Service: Fraud API
`

  it('is case-insensitive by default', () => {
    const schema = md.document({
      title: md.heading(1),
      meta: md.section('1. META').fields({
        service: md.string().min(3),
      }),
    })

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.meta.service).toBe('Fraud API')
    }
  })

  it('supports strict matching with caseInsensitive: false', () => {
    const schema = md.document({
      title: md.heading(1),
      meta: md.section('1. META').fields(
        {
          service: md.string().min(3),
        },
        { caseInsensitive: false },
      ),
    })

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_field')).toBe(true)
    }
  })

  it('applies case-insensitive matching to sequence()', () => {
    const sequenceMarkdown = `# RUNBOOK: Document Builder

## 1. META

- SERVICE: Fraud API
- owner: Alice
`

    const schema = md.document({
      title: md.heading(1),
      meta: md
        .section('1. META')
        .fields({
          service: md.string().min(3),
          owner: md.string().min(3),
        })
        .sequence(['service', 'owner']),
    })

    const result = schema.safeParse(sequenceMarkdown)
    expect(result.success).toBe(true)
  })
})
