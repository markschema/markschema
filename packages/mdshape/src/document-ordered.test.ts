import { describe, expect, it } from 'vitest'
import { md } from './index'

const markdownOutOfOrderWithDuplicate = `# RUNBOOK: Ordered Sections

## DETAILS

main details.

## META

- Service: Fraud API

## DETAILS

duplicate details block.
`

const buildSchema = (options?: { ordered?: boolean }) =>
  md.document(
    {
      title: md.heading(1).regex(/^RUNBOOK:\s.+/),
      meta: md.section('META').fields({
        Service: md.string().min(3),
      }),
      details: md.section('DETAILS').paragraphs([md.string().min(5)]),
    },
    options,
  )

describe('document ordered option', () => {
  it('defaults to ordered: false when omitted', () => {
    const schema = buildSchema()
    const result = schema.safeParse(markdownOutOfOrderWithDuplicate)

    expect(result.success).toBe(true)
  })

  it('raises section order and duplicate issues when ordered: true', () => {
    const schema = buildSchema({ ordered: true })
    const result = schema.safeParse(markdownOutOfOrderWithDuplicate)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'section_order_mismatch')).toBe(true)
      expect(result.error.issues.some((issue) => issue.code === 'duplicate_section')).toBe(true)
    }
  })

  it('skips anchored order precheck when ordered: false', () => {
    const schema = buildSchema({ ordered: false })
    const result = schema.safeParse(markdownOutOfOrderWithDuplicate)

    expect(result.success).toBe(true)
  })
})
