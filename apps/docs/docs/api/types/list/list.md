# list

Type: `list`

Signature: `md.list(itemSchema)`

## What It Is

`md.list(itemSchema)` validates array-like values with item-level constraints and returns a typed list alias over `md.array(itemSchema)`. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `list()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `list` behavior. If parsing fails, the result carries issue codes like `invalid_type`, giving the caller precise debugging context for `list` paths.

## When to Use

Use `md.list(itemSchema)` when you need a semantic list alias but still want array constraints and type safety. Avoid it when the source value is scalar text from `section().fields(...)`, because list validation expects an actual array input. It pairs well with `document()`, `heading()`, `metadataObject()`, and `list()` to keep extraction boundaries explicit while preserving typed output for downstream code.

### `md.list(itemSchema)`

### Input Markdown

```md
---
labels:
  - urgent
  - incident
---

# RUNBOOK: List Alias
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.metadataObject(
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









