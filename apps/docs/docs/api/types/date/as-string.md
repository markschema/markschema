# as: 'string'

Type: `date`

Signature: `md.date({ as: 'string' })`

## What It Is

`md.date({ as: 'string' })` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `as string` scenarios. With `document()`, `section()`, `fields()`, and `date()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `meta` without manual `as string` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `as string` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `as string` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `as string`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.date({ as: 'string' })` with `document()`, `section()`, `fields()`, and `date()` so `as string` schema intent stays readable and output remains predictable.

### `md.date({ as: 'string' })`

### Input Markdown

```md
## 1. META

- StartAt: 2026-03-10T12:00:00.000Z
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    StartAt: md.date({ as: 'string' }),
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
      "StartAt": "2026-03-10T12:00:00.000Z"
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



















