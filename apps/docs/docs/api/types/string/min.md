# min

Type: `string`

Signature: `md.string().min(length)`

## What It Is

This method page uses `md.string().min(length)` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `min` use cases. In practice, 1 h1 heading, 1 h2 section, and list content is validated and emitted as top-level keys `meta` using `document()`, `section()`, `fields()`, and `string()` under `min` rules. When constraints are broken, issue codes like `string_too_short` identify exactly which `min` node failed and why.

## When to Use

Choose `md.string().min(length)` for typed markdown parsing with deterministic contracts, especially when `min` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `min`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `string()` yields predictable `min` parsing, clearer errors, and easier runtime integration.

### `md.string().min(length)`

### Input Markdown

```md
## 1. META

- Team: Risk
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Team: md.string().min(6),
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
      "Team": "Risk Team"
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
        "code": "string_too_short",
        "path": [
          "meta",
          "Team"
        ]
      }
    ]
  }
}
```












