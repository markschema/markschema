# default

## What It Is

On this page, `default` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `default` parsing deterministic and schema-driven. The example expects a compact markdown payload and returns top-level keys `meta` directly from the declared `default` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `default` failure handling explicit.

## When to Use

Apply `default` when your document flow requires tightening scalar constraints without redefining the base shape for `default` and strict schema adherence over permissive parsing. It is less suitable for very loose drafts where strict refinement would block iteration under `default`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `section()`, `fields()`, and `string()` around `default` to keep `default` contracts transparent and reduce ambiguity in validation behavior.

### Input Markdown

```md
## 1. META

- Alias: ALEX
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Alias: md.string().optional().default('UNKNOWN'),
    Region: md.string().optional().default('us-east-1'),
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
      "Alias": "ALEX",
      "Region": "us-east-1"
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













