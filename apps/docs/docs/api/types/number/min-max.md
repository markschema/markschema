# min + max

Type: `number`

Signature: `md.number().int().min(...).max(...)`

## What It Is

`md.number().int().min(...).max(...)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `min max` scenarios. With `document()`, `section()`, `fields()`, and `number()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `meta` without manual `min max` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `min max` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `min max` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `min max`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.number().int().min(...).max(...)` with `document()`, `section()`, `fields()`, and `number()` so `min max` schema intent stays readable and output remains predictable.

### `md.number().int().min(...).max(...)`

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
    Score: md.number().int().min(0).max(10),
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



