# pipeline

Type: `wrappers`

Signature: `pipeline(nextSchema)`

## What It Is

`pipeline(nextSchema)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `pipeline` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `meta` without manual `pipeline` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `pipeline` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `pipeline` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `pipeline`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `pipeline(nextSchema)` with `document()`, `section()`, `fields()`, and `string()` so `pipeline` schema intent stays readable and output remains predictable.

### `pipeline(nextSchema)`

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



