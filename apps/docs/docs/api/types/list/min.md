# min

Type: `list`

Signature: `list(...).min(size)`

## What It Is

`list(...).min(size)` enforces a minimum list length while preserving typed list items. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `list()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `min` behavior. If parsing fails, the result carries issue codes like `list_too_small`, giving the caller precise debugging context for `min` paths.

## When to Use

Use `list(...).min(size)` when your list is required to contain at least N items and you want deterministic validation failures. Avoid it when empty lists are acceptable business-wise, because min constraints will always reject undersized input. It pairs well with `document()`, `heading()`, `metadataObject()`, and `list()` to keep extraction boundaries explicit while preserving typed output for downstream code.

### `list(...).min(size)`

### Input Markdown

```md
# RUNBOOK: List Min

## 2. LABELS

- urgent
- incident
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  labels: md
    .section('2. LABELS')
    .list(md.string().min(3))
    .pipeline(md.list(md.string().min(3)).min(2)),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: List Min",
    "labels": [
      "urgent",
      "incident"
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



