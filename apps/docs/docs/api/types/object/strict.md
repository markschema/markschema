# strict

Type: `object`

Signature: `object.strict()`

## What It Is

`object.strict()` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `strict` scenarios. With `document()`, `heading()`, `section()`, and `fields()` in the schema, 1 h1 heading and 1 h2 section is converted into top-level keys `title` and `data` without manual `strict` post-processing. Error cases report issue codes like `unrecognized_key`, making operational diagnostics for `strict` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for composing reusable object contracts across related markdown schemas where deterministic `strict` parsing matters more than free-form flexibility. Do not default to it for one-off payloads where object composition adds no reuse value around `strict`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `object.strict()` with `document()`, `heading()`, `section()`, and `fields()` so `strict` schema intent stays readable and output remains predictable.

### `object.strict()`

### Input Markdown

```md
# RUNBOOK: Object Strict

## 0. META

service: fraud-api
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  data: md.section('0. META').fields(md.object({ service: md.string().min(3) }).strict()),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Strict",
    "data": {
      "service": "fraud-api"
    }
  }
}
```

#### Error

Failure trigger: The input violates one or more constraints declared in the schema; use `issues[].path` and `issues[].code` to locate the exact failing node.

Error case input:

```md
# RUNBOOK: Object Strict

## 0. META

service: fraud-api
extra: not-allowed
```

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "unrecognized_key",
        "path": [
          "data",
          "extra"
        ]
      }
    ]
  }
}
```











