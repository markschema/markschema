# email

Type: `email`

Signature: `md.email()`

## What It Is

`md.email()` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `email` scenarios. With `document()`, `section()`, `fields()`, and `email()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `owner` without manual `email` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `email` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `email` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `email`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.email()` with `document()`, `section()`, `fields()`, and `email()` so `email` schema intent stays readable and output remains predictable.

### `md.email()`

### Input Markdown

```md
## 1. OWNER

- Email: alex@zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Email: md.email(),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "owner": {
      "Email": "alex@zayra.com"
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
        "message": "Missing section \"1. OWNER\"",
        "path": [
          "owner"
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



















