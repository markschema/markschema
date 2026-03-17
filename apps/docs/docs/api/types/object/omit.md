# omit

Type: `object`

Signature: `object.omit(keys)`

## What It Is

`object.omit(keys)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `omit` scenarios. With `object()`, `string()`, `min()`, and `document()` in the schema, 1 h1 heading and 1 h2 section is converted into top-level keys `title` and `data` without manual `omit` post-processing. Error cases report issue codes like `missing_frontmatter`, making operational diagnostics for `omit` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for composing reusable object contracts across related markdown schemas where deterministic `omit` parsing matters more than free-form flexibility. Do not default to it for one-off payloads where object composition adds no reuse value around `omit`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `object.omit(keys)` with `object()`, `string()`, `min()`, and `document()` so `omit` schema intent stays readable and output remains predictable.

### `object.omit(keys)`

### Input Markdown

```md
# RUNBOOK: Object Omit

## 0. META

service: fraud-api
owner: risk-platform
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
  data: md.section('0. META').fields(base.omit(['owner'])),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Omit",
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











