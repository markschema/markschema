# date

Type: `coerce`

Signature: `md.coerce.date({ as: 'string' })`

## What It Is

This method page uses `md.coerce.date({ as: 'string' })` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `date` use cases. In practice, 1 h2 section and list content is validated and emitted as top-level keys `meta` using `document()`, `section()`, `fields()`, and `date()` under `date` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `date` node failed and why.

## When to Use

Choose `md.coerce.date({ as: 'string' })` for typed markdown parsing with deterministic contracts, especially when `date` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `date`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `date()` yields predictable `date` parsing, clearer errors, and easier runtime integration.

## 1. META

- StartAt: 2026-03-10T12:00:00.000Z
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    StartAt: md.coerce.date({ as: 'string' }),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "StartAt": "2026-03-10T12:00:00.000Z"
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
        "code": "missing_section",
        "message": "Missing section \"1. META\"",
        "path": [
          "meta"
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

## Additional Scenarios

### coerce + pipeline hardening

### Input Markdown

```md
## 1. META

- Score: 8
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: md.coerce.number().pipeline(md.number().int().min(0).max(10)),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "Score": 8
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
        "code": "missing_section",
        "message": "Missing section \"1. META\"",
        "path": [
          "meta"
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




















