import { describe, expect, it } from 'vitest'
import { md } from './index'

describe('orderedLists vs nestedLists behavior', () => {
  const flatOrderedMarkdown = `## 9. ADVANCED BLOCK

1. Step one
2. Step two
`

  const nestedOrderedMarkdown = `## 9. ADVANCED BLOCK

1. Root
   - Child A
   - Child B
`

  it('orderedLists accepts flat ordered lists', () => {
    const schema = md.document({
      ordered: md
        .section('9. ADVANCED BLOCK')
        .orderedLists(
          md.object({
            items: md
              .array(
                md.object({
                  index: md.number(),
                  text: md.string(),
                  depth: md.number(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
    })

    const result = schema.safeParse(flatOrderedMarkdown)
    expect(result.success).toBe(true)
  })

  it('orderedLists ignores nested ordered trees and reports missing_ordered_list', () => {
    const schema = md.document({
      ordered: md
        .section('9. ADVANCED BLOCK')
        .orderedLists(
          md.object({
            items: md
              .array(
                md.object({
                  index: md.number(),
                  text: md.string(),
                  depth: md.number(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
    })

    const result = schema.safeParse(nestedOrderedMarkdown)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_ordered_list')).toBe(true)
    }
  })

  it('nestedLists accepts nested list trees', () => {
    const schema = md.document({
      nested: md
        .section('9. ADVANCED BLOCK')
        .nestedLists(
          md.object({
            items: md
              .array(
                md.object({
                  text: md.string(),
                  depth: md.number(),
                  ordered: md.boolean(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
    })

    const result = schema.safeParse(nestedOrderedMarkdown)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nested[0]?.items[0]).toEqual({
        text: 'Root',
        depth: 1,
        ordered: true,
      })
    }
  })

  it('nestedLists with as: tree outputs hierarchical items', () => {
    const schema = md.document({
      nested: md
        .section('9. ADVANCED BLOCK')
        .nestedLists(
          md.object({
            items: md
              .array(
                md.object({
                  text: md.string(),
                  children: md.array(
                    md.object({
                      text: md.string(),
                      children: md.array(md.object({ text: md.string() })),
                    }),
                  ),
                }),
              )
              .min(1),
          }),
          { as: 'tree' },
        )
        .min(1),
    })

    const result = schema.safeParse(nestedOrderedMarkdown)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nested[0]).toEqual({
        items: [
          {
            text: 'Root',
            children: [
              { text: 'Child A', children: [] },
              { text: 'Child B', children: [] },
            ],
          },
        ],
      })
    }
  })

  it('nestedLists rejects flat ordered lists with missing_nested_list', () => {
    const schema = md.document({
      nested: md
        .section('9. ADVANCED BLOCK')
        .nestedLists(
          md.object({
            items: md
              .array(
                md.object({
                  text: md.string(),
                  depth: md.number(),
                  ordered: md.boolean(),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
    })

    const result = schema.safeParse(flatOrderedMarkdown)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_nested_list')).toBe(true)
    }
  })

  it('nestedLists with as: tree still rejects flat ordered lists', () => {
    const schema = md.document({
      nested: md
        .section('9. ADVANCED BLOCK')
        .nestedLists(
          md.object({
            items: md
              .array(
                md.object({
                  text: md.string(),
                  children: md.array(md.object({ text: md.string() })),
                }),
              )
              .min(1),
          }),
          { as: 'tree' },
        )
        .min(1),
    })

    const result = schema.safeParse(flatOrderedMarkdown)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.code === 'missing_nested_list')).toBe(true)
    }
  })
})
