# nestedLists -> tree output

Type: `section`

Signature: `section().nestedLists(schema, { as: 'tree' }).min(...)`

## What It Is

`section().nestedLists(schema, { as: 'tree' })` extracts nested list blocks and transforms each block into hierarchical nodes before schema validation. The output node shape is `text + children`, so consumers read explicit parent-child relationships without using `depth`. Conversion is deterministic and stable for mixed nesting levels in the same list.

## When to Use

Use tree output when downstream code renders expandable trees, traverses branches recursively, or applies rules per subtree. Choose this mode when you already know the hierarchy contract and want to validate that structure directly in the schema. If the structure is unknown or still evolving, start with `as: 'flat'` and map to tree later.

### `section().nestedLists(schema, { as: 'tree' }).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

1. Root
   - Child A
     1. Subchild A1
   - Child B
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const treeNode = md.object({
  text: md.string(),
  children: md.array(
    md.object({
      text: md.string(),
      children: md.array(md.object({ text: md.string() })),
    }),
  ),
})

const schema = md.document({
  nested: md.section('9. ADVANCED BLOCK').nestedLists(md.object({ items: md.array(treeNode).min(1) }), { as: 'tree' }).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "nested": [
      {
        "items": [
          {
            "text": "Root",
            "children": [
              {
                "text": "Child A",
                "children": [
                  {
                    "text": "Subchild A1"
                  }
                ]
              },
              {
                "text": "Child B",
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Error

Failure trigger: if the section has no nested levels (only flat list items), `nestedLists` fails with `missing_nested_list` before tree conversion.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_nested_list",
        "message": "Section \"9. ADVANCED BLOCK\" must contain a nested list",
        "path": [
          "nested"
        ],
        "line": 1,
        "position": {
          "start": {
            "line": 1,
            "column": 1
          }
        }
      }
    ]
  }
}
```
