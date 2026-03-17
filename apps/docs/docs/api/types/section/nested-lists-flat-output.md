# nestedLists -> flat output

Type: `section`

Signature: `section().nestedLists(schema, { as: 'flat' }).min(...)`

## What It Is

`section().nestedLists(schema, { as: 'flat' })` extracts only list blocks that actually contain nesting (`depth > 1`) and returns their items as a flat array. Each item includes structural metadata like `depth` and `ordered`, so you can reconstruct hierarchy later if needed. This is the default behavior, so `nestedLists(schema)` and `nestedLists(schema, { as: 'flat' })` are equivalent.

## When to Use

Use flat output when you want one pass over all nested-list items for filtering, scoring, or indexing without recursive traversal. It is the safest choice when you do not know the final hierarchy shape in advance, because `depth` keeps the extraction flexible. If consumers need direct parent-child nodes for rendering or tree operations and the expected structure is already known, prefer `as: 'tree'`.

### `section().nestedLists(schema, { as: 'flat' }).min(...)`

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

const schema = md.document({
  nested: md.section('9. ADVANCED BLOCK').nestedLists(md.object({ items: md.array(md.object({ text: md.string(), depth: md.number(), ordered: md.boolean() })).min(1) }), { as: 'flat' }).min(1),
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
            "depth": 1,
            "ordered": true
          },
          {
            "text": "Child A",
            "depth": 2,
            "ordered": true
          },
          {
            "text": "Subchild A1",
            "depth": 3,
            "ordered": true
          },
          {
            "text": "Child B",
            "depth": 2,
            "ordered": true
          }
        ]
      }
    ]
  }
}
```

#### Error

Failure trigger: if the section has only flat list items (`depth: 1` only), `nestedLists` fails with `missing_nested_list`.

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
