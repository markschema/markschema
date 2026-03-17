# sequence

## What It Is

On this page, `sequence` centers on document-level structure checks, typed field extraction, and ordered section validation to keep `sequence` parsing deterministic and schema-driven. The example expects a compact markdown payload and returns top-level keys `tags` directly from the declared `sequence` extraction rules. Violations produce issue codes like `field_order_mismatch`, which avoids brittle string checks and keeps `sequence` failure handling explicit.

## When to Use

Choose `sequence` for tightening scalar constraints without redefining the base shape, especially when `sequence` authoring rules must remain stable across teams. Skip it in very loose drafts where strict refinement would block iteration workflows for `sequence`, since higher authoring discipline in exchange for predictable runtime behavior. Combining it with `document()`, `section()`, `fields()`, and `string()` yields predictable `sequence` parsing, clearer errors, and easier runtime integration.

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








