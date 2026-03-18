# sequence

Type: `section`

Signature: `section().fields(...).sequence([...])`

## What It Is

`section().fields(...).sequence([...])` is used here as a contract-first parser powered by document-level structure checks, typed field extraction, and ordered section validation for `sequence` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `tags` without manual `sequence` post-processing. Error cases report issue codes like `field_order_mismatch`, making operational diagnostics for `sequence` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `sequence` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `sequence`; the main cost is higher authoring discipline in exchange for predictable runtime behavior. For best results, compose `section().fields(...).sequence([...])` with `document()`, `section()`, `fields()`, and `string()` so `sequence` schema intent stays readable and output remains predictable.

### `section().fields(...).sequence([...])`

### Input Markdown

```md
## 7. TAGS

- Pillar: build
- Track: fraud-ops
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tags: md
    .section('7. TAGS')
    .fields({
      Pillar: md.string(),
      Track: md.string(),
    })
    .sequence(['Pillar', 'Track']),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "tags": {
      "Pillar": "build",
      "Track": "fraud-ops"
    }
  }
}
```

#### Error

Failure trigger: The input violates one or more constraints declared in the schema; use `issues[].path` and `issues[].code` to locate the exact failing node.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"7. TAGS\"",
        "path": [
          "tags"
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



