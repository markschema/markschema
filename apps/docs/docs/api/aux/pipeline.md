# pipeline

## What It Is

`pipeline` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `pipeline` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, a compact markdown payload is converted into top-level keys `meta` without manual `pipeline` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `pipeline` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening scalar constraints without redefining the base shape where deterministic `pipeline` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `pipeline`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `pipeline` with `document()`, `section()`, `fields()`, and `string()` so `pipeline` schema intent stays readable and output remains predictable.

### Input Markdown

```md
## 1. META

- Score: 7
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: md
      .string()
      .transform((value) => Number(value))
      .pipeline(md.number().int().min(0).max(10)),
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
      "Score": 7
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



