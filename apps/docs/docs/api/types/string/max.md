# max

Type: `string`

Signature: `md.string().max(length)`

## What It Is

On this page, `md.string().max(length)` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `max` parsing deterministic and schema-driven. The example expects 1 h1 heading, 1 h2 section, and list content and returns top-level keys `meta` directly from the declared `max` extraction rules. Violations produce issue codes like `value_too_big`, which avoids brittle string checks and keeps `max` failure handling explicit.

## When to Use

Apply `md.string().max(length)` when your document flow requires typed markdown parsing with deterministic contracts for `max` and strict schema adherence over permissive parsing. It is less suitable for exploratory drafts that intentionally avoid strict validation under `max`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `section()`, `fields()`, and `string()` around `md.string().max(length)` to keep `max` contracts transparent and reduce ambiguity in validation behavior.

### `md.string().max(length)`

### Input Markdown

```md
## 1. META

- Team: Risk Team
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Team: md.string().max(12),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "Team": "Risk Team"
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
        "message": "Missing section \"1. META\"",
        "path": [
          "meta"
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



