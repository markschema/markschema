# required

Type: `object`

Signature: `object.required(keys?)`

## What It Is

`object.required(keys?)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `required` contract instead of permissive text scraping. The schema combines operators such as `object()`, `string()`, `min()`, and `optional()` to map 1 h1 heading and 1 h2 section into top-level keys `title` and `data` for this `required` behavior. If parsing fails, the result carries issue codes like `invalid_type`, giving the caller precise debugging context for `required` paths.

## When to Use

Use `object.required(keys?)` when you need composing reusable object contracts across related markdown schemas for `required` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for one-off payloads where object composition adds no reuse value in `required` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `object()`, `string()`, `min()`, and `optional()` to keep `required` extraction boundaries explicit while preserving typed output for downstream code.

### `object.required(keys?)`

### Input Markdown

```md
# RUNBOOK: Object Required

## 0. META

- service: fraud-api
- owner: risk-platform
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const base = md.object({
  service: md.string().min(3),
  owner: md.string().optional(),
})

const schema = md.document({
  title: md.heading(1),
  data: md
    .section('0. META')
    .fields({
      service: md.string().min(3),
      owner: md.string().optional(),
    })
    .pipeline(base.required(['owner'])),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Required",
    "data": {
      "service": "fraud-api",
      "owner": "risk-platform"
    }
  }
}
```

#### Error

Failure trigger: remove `owner` from `0. META`; `base.required(['owner'])` fails because the field becomes mandatory.

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



