# pick

Type: `object`

Signature: `object.pick(keys)`

## What It Is

`object.pick(keys)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `pick` scenarios. With `object()`, `string()`, `min()`, and `document()` in the schema, 1 h1 heading and 1 h2 section is converted into top-level keys `title` and `data` without manual `pick` post-processing. Error cases report issue codes like `string_too_short`, making operational diagnostics for `pick` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for composing reusable object contracts across related markdown schemas where deterministic `pick` parsing matters more than free-form flexibility. Do not default to it for one-off payloads where object composition adds no reuse value around `pick`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `object.pick(keys)` with `object()`, `string()`, `min()`, and `document()` so `pick` schema intent stays readable and output remains predictable.

### `object.pick(keys)`

### Input Markdown

```md
# RUNBOOK: Object Pick

## 0. META

- service: fraud-api
- owner: risk-platform
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
      owner: md.string().min(3),
    })
    .pipeline(base.pick(['service'])),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Pick",
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



