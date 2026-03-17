# catchall

Type: `object`

Signature: `object.catchall(schema)`

## What It Is

On this page, `object.catchall(schema)` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `catchall` parsing deterministic and schema-driven. The example expects 1 h1 heading and 1 h2 section and returns top-level keys `title` and `data` directly from the declared `catchall` extraction rules. Violations produce issue codes like `invalid_union`, which avoids brittle string checks and keeps `catchall` failure handling explicit.

## When to Use

Apply `object.catchall(schema)` when your document flow requires composing reusable object contracts across related markdown schemas for `catchall` and strict schema adherence over permissive parsing. It is less suitable for one-off payloads where object composition adds no reuse value under `catchall`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `object()`, `string()`, `min()`, and `catchall()` around `object.catchall(schema)` to keep `catchall` contracts transparent and reduce ambiguity in validation behavior.

### `object.catchall(schema)`

### Input Markdown

```md
# RUNBOOK: Object Catchall

## 0. META

service: fraud-api
owner: risk-platform
priority: 3
retries: 2
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const withCatchall = md
  .object({ service: md.string().min(3) })
  .catchall(md.union([md.string().min(1), md.number().int().min(0)]))

const schema = md.document({
  title: md.heading(1),
  data: md.section('0. META').fields(withCatchall),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Catchall",
    "data": {
      "service": "fraud-api",
      "owner": "risk-platform",
      "priority": 3,
      "retries": 2
    }
  }
}
```

#### Error

Failure trigger: set `priority` to `true`; the catchall accepts only `string | number`, so validation fails.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_union",
        "path": [
          "data",
          "priority"
        ]
      }
    ]
  }
}
```










