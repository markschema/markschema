# trim

## What It Is

`trim` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `trim` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, a compact markdown payload is converted into top-level keys `meta` without manual `trim` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `trim` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening scalar constraints without redefining the base shape where deterministic `trim` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `trim`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `trim` with `document()`, `section()`, `fields()`, and `string()` so `trim` schema intent stays readable and output remains predictable.

### Input Markdown

```md
## 1. META

- Team:   Risk Platform
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Team: md.string().trim(),
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
      "Team": "Risk Platform"
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













