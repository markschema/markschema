# strip

Type: `object`

Signature: `object.strip()`

## What It Is

This method page uses `object.strip()` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `strip` use cases. In practice, 1 h1 heading and 1 h2 section is validated and emitted as top-level keys `title` and `data` using `document()`, `heading()`, `section()`, and `fields()` under `strip` rules. When constraints are broken, issue codes like `missing_frontmatter` identify exactly which `strip` node failed and why.

## When to Use

Apply `object.strip()` when your document flow requires composing reusable object contracts across related markdown schemas for `strip` and strict schema adherence over permissive parsing. It is less suitable for one-off payloads where object composition adds no reuse value under `strip`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `heading()`, `section()`, and `fields()` around `object.strip()` to keep `strip` contracts transparent and reduce ambiguity in validation behavior.

### `object.strip()`

### Input Markdown

```md
# RUNBOOK: Object Strip

## 0. META

service: fraud-api
extra: ignored
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  data: md.section('0. META').fields(md.object({ service: md.string().min(3) }).strip()),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Strip",
    "data": {
      "service": "fraud-api"
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
        "code": "missing_frontmatter",
        "path": [
          "data"
        ]
      }
    ]
  }
}
```











