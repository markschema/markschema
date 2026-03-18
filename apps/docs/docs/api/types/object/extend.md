# extend

Type: `object`

Signature: `object.extend(shape)`

## What It Is

This method page uses `object.extend(shape)` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `extend` use cases. In practice, 1 h1 heading and 1 h2 section is validated and emitted as top-level keys `title` and `data` using `object()`, `string()`, `min()`, and `extend()` under `extend` rules. When constraints are broken, issue codes like `invalid_type` identify exactly which `extend` node failed and why.

## When to Use

Apply `object.extend(shape)` when your document flow requires composing reusable object contracts across related markdown schemas for `extend` and strict schema adherence over permissive parsing. It is less suitable for one-off payloads where object composition adds no reuse value under `extend`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `object()`, `string()`, `min()`, and `extend()` around `object.extend(shape)` to keep `extend` contracts transparent and reduce ambiguity in validation behavior.

### `object.extend(shape)`

### Input Markdown

```md
# RUNBOOK: Object Extend

## 0. META

- service: fraud-api
- owner: risk-platform
- region: us-east-1
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const base = md.object({
  service: md.string().min(3),
  owner: md.string().min(3),
})

const extended = base.extend({
  region: md.string().min(3),
})

const schema = md.document({
  title: md.heading(1),
  data: md
    .section('0. META')
    .fields({
      service: md.string().min(3),
      owner: md.string().min(3),
      region: md.string().min(3),
    })
    .pipeline(extended),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Extend",
    "data": {
      "service": "fraud-api",
      "owner": "risk-platform",
      "region": "us-east-1"
    }
  }
}
```

#### Error

Failure trigger: remove `region` from `0. META`; the field added by `extend()` is required and parsing fails.

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



