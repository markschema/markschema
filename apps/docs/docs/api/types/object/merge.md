# merge

Type: `object`

Signature: `object.merge(otherObject)`

## What It Is

This method page uses `object.merge(otherObject)` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `merge` use cases. In practice, 1 h1 heading and 1 h2 section is validated and emitted as top-level keys `title` and `data` using `object()`, `string()`, `min()`, and `merge()` under `merge` rules. When constraints are broken, issue codes like `invalid_type` identify exactly which `merge` node failed and why.

## When to Use

Choose `object.merge(otherObject)` for composing reusable object contracts across related markdown schemas, especially when `merge` authoring rules must remain stable across teams. Skip it in one-off payloads where object composition adds no reuse value workflows for `merge`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `object()`, `string()`, `min()`, and `merge()` yields predictable `merge` parsing, clearer errors, and easier runtime integration.

### `object.merge(otherObject)`

### Input Markdown

```md
# RUNBOOK: Object Merge

## 0. META

service: fraud-api
region: us-east-1
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const left = md.object({ service: md.string().min(3) })
const right = md.object({ region: md.string().min(3) })

const merged = left.merge(right)

const schema = md.document({
  title: md.heading(1),
  data: md.section('0. META').fields(merged),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Merge",
    "data": {
      "service": "fraud-api",
      "region": "us-east-1"
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
        "code": "invalid_type",
        "path": [
          "data",
          "service"
        ]
      }
    ]
  }
}
```











