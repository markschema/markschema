# object

Type: `object`

Signature: `md.object(shape)`

## What It Is

`md.object(shape)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `object` contract instead of permissive text scraping. The schema combines operators such as `object()`, `string()`, `min()`, and `email()` to map 1 h1 heading and 1 h2 section into top-level keys `title` and `config` for this `object` behavior. If parsing fails, the result carries issue codes like `invalid_email`, giving the caller precise debugging context for `object` paths.

## When to Use

Use `md.object(shape)` when you need composing reusable object contracts across related markdown schemas for `object` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for one-off payloads where object composition adds no reuse value in `object` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `object()`, `string()`, `min()`, and `email()` to keep `object` extraction boundaries explicit while preserving typed output for downstream code.

### `md.object(shape)`

### Input Markdown

```md
# RUNBOOK: Alert Routing

## 0. META

- service: fraud-api
- notificationEmail: alerts@zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const alertConfig = md.object({
  service: md.string().min(3),
  notificationEmail: md.email(),
})

const schema = md.document({
  title: md.heading(1),
  config: md.section('0. META').fields({
    service: md.string().min(3),
    notificationEmail: md.email(),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Alert Routing",
    "config": {
      "service": "fraud-api",
      "notificationEmail": "alerts@zayra.com"
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



