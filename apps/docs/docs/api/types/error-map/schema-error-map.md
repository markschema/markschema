# schema.errorMap

Type: `error-map`

Signature: `schema.errorMap(...)`

## What It Is

`schema.errorMap(...)` is used here as a contract-first parser powered by explicit section targeting, typed field extraction, and custom error mapping for `schema error map` scenarios. With `document()`, `section()`, `fields()`, and `number()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `meta` without manual `schema error map` post-processing. Error cases report issue codes like `invalid_number`, making operational diagnostics for `schema error map` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `schema error map` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `schema error map`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `schema.errorMap(...)` with `document()`, `section()`, `fields()`, and `number()` so `schema error map` schema intent stays readable and output remains predictable.

### `schema.errorMap(...)`

### Input Markdown

```md
## 1. META

- Score: 7
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md
  .document({
    meta: md.section('1. META').fields({
      Score: md.number(),
    }),
  })
  .errorMap((issue) => {
    if (issue.code === 'invalid_number') return 'Schema map: score must be numeric'
    return undefined
  })

const result = schema.safeParse(markdown)
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



