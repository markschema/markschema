# int

Type: `number`

Signature: `md.number().int()`

## What It Is

`md.number().int()` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `int` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `number()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `meta` for this `int` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `int` paths.

## When to Use

Use `md.number().int()` when you need typed markdown parsing with deterministic contracts for `int` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `int` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `number()` to keep `int` extraction boundaries explicit while preserving typed output for downstream code.

### `md.number().int()`

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
    Score: md.number().int(),
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



















