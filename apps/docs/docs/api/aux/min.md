# min

## What It Is

`min` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `min` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, a compact markdown payload is converted into top-level keys `meta` without manual `min` post-processing. Error cases report issue codes like `string_too_short`, making operational diagnostics for `min` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening scalar constraints without redefining the base shape where deterministic `min` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `min`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `min` with `document()`, `section()`, `fields()`, and `string()` so `min` schema intent stays readable and output remains predictable.

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
    Team: md.string().min(6),
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








