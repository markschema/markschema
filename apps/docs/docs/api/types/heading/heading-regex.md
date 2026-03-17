# regex

Type: `heading`

Signature: `md.heading(depth).regex(pattern)`

## What It Is

`md.heading(depth).regex(pattern)` parses markdown with document-level structure checks, so this page defines a strict `heading regex` contract instead of permissive text scraping. The schema combines operators such as `document()` and `heading()` to map 1 h1 heading into top-level keys `title` for this `heading regex` behavior. If parsing fails, the result carries issue codes like `missing_heading`, giving the caller precise debugging context for `heading regex` paths.

## When to Use

Use `md.heading(depth).regex(pattern)` when you need typed markdown parsing with deterministic contracts for `heading regex` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `heading regex` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()` and `heading()` to keep `heading regex` extraction boundaries explicit while preserving typed output for downstream code.

### `md.heading(depth).regex(pattern)`

### Input Markdown

```md
# RUNBOOK: Fraud Routing
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1).regex(/^RUNBOOK:\s.+/),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Fraud Routing"
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
        "code": "heading_pattern_mismatch",
        "message": "Heading does not match required pattern /^RUNBOOK:\\s.+/",
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









