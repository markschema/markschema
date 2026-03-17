# array

Type: `array`

Signature: `md.array(itemSchema)`

## What It Is

`md.array(itemSchema)` parses markdown with document-level structure checks, frontmatter extraction, and typed array validation, so this page defines a strict `array` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `array()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `array` behavior. If parsing fails, the result carries issue codes like `invalid_type`, giving the caller precise debugging context for `array` paths.

## When to Use

Use `md.array(itemSchema)` when you need typed markdown parsing with deterministic contracts for `array` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `array` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `metadataObject()`, and `array()` to keep `array` extraction boundaries explicit while preserving typed output for downstream code.

### `md.array(itemSchema)`

### Input Markdown

```md
---
scores:
  - 4
  - 7
---

# RUNBOOK: Array Base
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.metadataObject(
    md.object({
      scores: md.array(md.number().int().min(0)),
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
    "title": "RUNBOOK: Array Base",
    "frontmatter": {
      "scores": [
        4,
        7
      ]
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
        "code": "invalid_type"
      }
    ]
  }
}
```









