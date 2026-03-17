# list

Type: `list`

Signature: `md.list(itemSchema)`

## What It Is

`md.list(itemSchema)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `list` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `section()`, and `fields()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `title` and `frontmatter` for this `list` behavior. If parsing fails, the result carries issue codes like `invalid_type`, giving the caller precise debugging context for `list` paths.

## When to Use

Use `md.list(itemSchema)` when you need typed markdown parsing with deterministic contracts for `list` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `list` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `section()`, and `fields()` to keep `list` extraction boundaries explicit while preserving typed output for downstream code.

### `md.list(itemSchema)`

### Input Markdown

```md
# RUNBOOK: List Alias

## 0. META

labels:
  - urgent
  - incident
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      labels: md.list(md.string().min(3)),
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
    "title": "RUNBOOK: List Alias",
    "frontmatter": {
      "labels": [
        "urgent",
        "incident"
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











