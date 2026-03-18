# min max

Type: `array`

Signature: `array.min()/array.max()`

## What It Is

`array.min()/array.max()` parses markdown with document-level structure checks, frontmatter extraction, and typed array validation, so this page defines a strict `min max` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `array()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `min max` behavior. If parsing fails, the result carries issue codes like `list_too_small`, giving the caller precise debugging context for `min max` paths.

## When to Use

Use `array.min()/array.max()` when you need typed markdown parsing with deterministic contracts for `min max` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `min max` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `metadataObject()`, and `array()` to keep `min max` extraction boundaries explicit while preserving typed output for downstream code.

### `array.min()/array.max()`

### Input Markdown

```md
# RUNBOOK: Array Range

## 2. SCORES

- 4
- 7
- 9
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  scores: md
    .section('2. SCORES')
    .list(md.coerce.number().pipeline(md.number().int().min(0)))
    .pipeline(md.array(md.number().int().min(0)).min(2).max(4)),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Array Range",
    "scores": [
      4,
      7,
      9
    ]
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



