# partial

Type: `object`

Signature: `object.partial()`

## What It Is

`object.partial()` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `partial` contract instead of permissive text scraping. The schema combines operators such as `object()`, `string()`, `min()`, and `document()` to map 1 h1 heading and 1 h2 section into top-level keys `title` and `data` for this `partial` behavior. If parsing fails, the result carries issue codes like `string_too_short`, giving the caller precise debugging context for `partial` paths.

## When to Use

Use `object.partial()` when you need composing reusable object contracts across related markdown schemas for `partial` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for one-off payloads where object composition adds no reuse value in `partial` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `object()`, `string()`, `min()`, and `document()` to keep `partial` extraction boundaries explicit while preserving typed output for downstream code.

### `object.partial()`

### Input Markdown

```md
# RUNBOOK: Object Partial

## 0. META

- service: fraud-api
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const base = md.object({
  service: md.string().min(3),
  owner: md.string().min(3),
})

const schema = md.document({
  title: md.heading(1),
  data: md
    .section('0. META')
    .fields({
      service: md.string().min(3),
      owner: md.string().min(3).optional(),
    })
    .pipeline(base.partial()),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Partial",
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



