# document

Type: `document`

Signature: `md.document(shape)`

## What It Is

`md.document(shape)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `document` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `section()`, and `fields()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `title` and `meta` for this `document` behavior. If parsing fails, the result carries issue codes like `missing_heading`, giving the caller precise debugging context for `document` paths.

## When to Use

Use `md.document(shape)` when you need typed markdown parsing with deterministic contracts for `document` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `document` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `section()`, and `fields()` to keep `document` extraction boundaries explicit while preserving typed output for downstream code.

### `md.document(shape)`

### Input Markdown

```md
# RUNBOOK: Document Builder

## 1. META

- Service: Fraud API
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  meta: md.section('1. META').fields({
    Service: md.string().min(3),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Document Builder",
    "meta": {
      "Service": "Fraud API"
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
        "code": "missing_heading",
        "message": "Missing heading with depth 1",
        "path": [
          "title"
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


















