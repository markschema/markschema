# passthrough

Type: `object`

Signature: `object.passthrough()`

## What It Is

On this page, `object.passthrough()` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `passthrough` parsing deterministic and schema-driven. The example expects 1 h1 heading and 1 h2 section and returns top-level keys `title` and `data` directly from the declared `passthrough` extraction rules. Violations produce issue codes like `invalid_type`, which avoids brittle string checks and keeps `passthrough` failure handling explicit.

## When to Use

Choose `object.passthrough()` for composing reusable object contracts across related markdown schemas, especially when `passthrough` authoring rules must remain stable across teams. Skip it in one-off payloads where object composition adds no reuse value workflows for `passthrough`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `heading()`, `section()`, and `fields()` yields predictable `passthrough` parsing, clearer errors, and easier runtime integration.

### `object.passthrough()`

### Input Markdown

```md
# RUNBOOK: Object Passthrough

## 0. META

service: fraud-api
extra: kept
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  data: md.section('0. META').fields(md.object({ service: md.string().min(3) }).passthrough()),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Passthrough",
    "data": {
      "service": "fraud-api",
      "extra": "kept"
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











