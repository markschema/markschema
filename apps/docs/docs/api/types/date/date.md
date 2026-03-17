# date

Type: `date`

Signature: `md.date()`

## What It Is

`md.date()` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `date` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `date()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `meta` for this `date` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `date` paths.

## When to Use

Use `md.date()` when you need typed markdown parsing with deterministic contracts for `date` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `date` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `date()` to keep `date` extraction boundaries explicit while preserving typed output for downstream code.

### `md.date()`

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
    StartAt: md.date(),
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



















