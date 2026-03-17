# boolean

Type: `coerce`

Signature: `md.coerce.boolean()`

## What It Is

This method page uses `md.coerce.boolean()` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `boolean` use cases. In practice, 1 h1 heading, 1 h2 section, and list content is validated and emitted as top-level keys `meta` using `document()`, `section()`, `fields()`, and `boolean()` under `boolean` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `boolean` node failed and why.

## When to Use

Choose `md.coerce.boolean()` for typed markdown parsing with deterministic contracts, especially when `boolean` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `boolean`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `boolean()` yields predictable `boolean` parsing, clearer errors, and easier runtime integration.

### `md.coerce.boolean()`

### Input Markdown

```md
## 1. META

- Enabled: 1
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Enabled: md.coerce.boolean(),
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
      "Enabled": true
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



















