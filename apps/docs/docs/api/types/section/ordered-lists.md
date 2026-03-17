# orderedLists

Type: `section`

Signature: `section().orderedLists(schema).min(...)`

## What It Is

`section().orderedLists(schema).min(...)` extracts numbered list blocks from a section and preserves each item index, text, and depth. It is focused on ordered-flow structure, so the output is optimized for step sequences such as procedures, checklists, or rollout plans. Unlike `nestedLists`, this method is primarily about ordered progression and is best read as a sequence collector.

## When to Use

Use `orderedLists` when the core requirement is to keep the sequence of numbered steps explicit and machine-readable. It works well when you care about execution order but do not need tree-level semantics for mixed child branches as the primary contract. If your document behavior depends on hierarchical structure first, prefer `nestedLists` and treat `orderedLists` as a simpler step-oriented extractor.

### `section().orderedLists(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

1. Step one
2. Step two
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  ordered: md.section('9. ADVANCED BLOCK').orderedLists(md.object({ items: md.array(md.object({ index: md.number(), text: md.string(), depth: md.number() })).min(1) })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "ordered": [
      {
        "items": [
          {
            "index": 1,
            "text": "Step one",
            "depth": 1
          },
          {
            "index": 2,
            "text": "Step two",
            "depth": 1
          }
        ]
      }
    ]
  }
}
```

#### Error

Failure trigger: if the list contains sublevels (for example `1. Root` with nested children), it is treated as nested and `orderedLists` fails with `missing_ordered_list`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_ordered_list",
        "message": "Section \"9. ADVANCED BLOCK\" must contain an ordered list",
        "path": [
          "ordered"
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













