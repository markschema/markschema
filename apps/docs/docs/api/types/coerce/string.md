# string

Type: `coerce`

Signature: `md.coerce.string()`

## What It Is

`md.coerce.string()` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `string` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `meta` without manual `string` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `string` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `string` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `string`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.coerce.string()` with `document()`, `section()`, `fields()`, and `string()` so `string` schema intent stays readable and output remains predictable.

### `md.coerce.string()`

### Input Markdown

```md
## 1. META

- OwnerId: 42
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    OwnerId: md.coerce.string().pipeline(md.string().min(2)),
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
      "OwnerId": "42"
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



















