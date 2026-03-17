# record

Type: `record`

Signature: `md.record(valueSchema)`

## What It Is

`md.record(valueSchema)` parses markdown with document-level structure checks, frontmatter extraction, and typed key/value validation, so this page defines a strict `record` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `record()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `record` behavior. If parsing fails, the result carries issue codes like `invalid_number`, giving the caller precise debugging context for `record` paths.

## When to Use

Use `md.record(valueSchema)` when you need typed markdown parsing with deterministic contracts for `record` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `record` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `metadataObject()`, and `record()` to keep `record` extraction boundaries explicit while preserving typed output for downstream code.

### `md.record(valueSchema)`

### Input Markdown

```md
---
weights:
  email: 3
  sms: 4
---

# RUNBOOK: Record Values
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.metadataObject(
    md.object({
      weights: md.record(md.number().int().min(1)),
    }),
  ),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Record Values",
    "frontmatter": {
      "weights": {
        "email": 3,
        "sms": 4
      }
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
        "code": "invalid_number"
      }
    ]
  }
}
```









