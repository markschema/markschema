import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('refine wrapper', () => {
  it('passes when refine predicate returns true', () => {
    const schema = md.document({
      title: md.heading(1),
      meta: md
        .section('0. META')
        .fields({
          service: md.string().min(3),
          priority: md.coerce.number().pipeline(md.number().int().min(0)).optional(),
          owner: md.string().min(3).optional(),
        })
        .refine((data) => (data.priority !== undefined ? data.owner !== undefined : true), {
          path: ['owner'],
          message: 'owner is required when priority is present',
        }),
    })

    const markdown = `# RUNBOOK: Refine

## 0. META

- service: fraud-api
- priority: 3
- owner: risk-platform
`

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(true)
  })

  it('fails with refine_failed and custom path when predicate returns false', () => {
    const schema = md.document({
      title: md.heading(1),
      meta: md
        .section('0. META')
        .fields({
          service: md.string().min(3),
          priority: md.coerce.number().pipeline(md.number().int().min(0)).optional(),
          owner: md.string().min(3).optional(),
        })
        .refine((data) => (data.priority !== undefined ? data.owner !== undefined : true), {
          path: ['owner'],
          message: 'owner is required when priority is present',
        }),
    })

    const markdown = `# RUNBOOK: Refine

## 0. META

- service: fraud-api
- priority: 3
`

    const result = schema.safeParse(markdown)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'refine_failed')).toBe(true)
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'meta.owner')).toBe(true)
    }
  })

  it('supports custom error code in refine options', () => {
    const schema = md.string().refine((value) => value.startsWith('ok-'), {
      code: 'invalid_type',
      message: 'must start with ok-',
    })

    const result = schema.safeParse('bad-value')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe('invalid_type')
      expect(result.error.issues[0]?.message).toBe('must start with ok-')
    }
  })

  it('maps thrown predicate errors to refine_failed', () => {
    const schema = md.string().refine(() => {
      throw new Error('boom')
    })

    const result = schema.safeParse('value')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe('refine_failed')
      expect(result.error.issues[0]?.message).toContain('boom')
    }
  })

  it('narrows output type with type guard overload', () => {
    const narrowed = md
      .union([md.string(), md.number()])
      .refine((value): value is string => typeof value === 'string')

    const result = narrowed.safeParse('ok')
    expect(result.success).toBe(true)
    if (result.success) {
      const value: string = result.data
      expect(value).toBe('ok')
    }
  })
})
