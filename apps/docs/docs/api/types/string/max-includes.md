# max + includes

Type: `string`

Signature: `Chained refinement: trim().min(...).max(...).includes(...)`

## What It Is

This method page uses `Chained refinement: trim().min(...).max(...).includes(...)` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `max includes` use cases. In practice, 1 h1 heading, 1 h2 section, and list content is validated and emitted as top-level keys `meta` using `document()`, `section()`, `fields()`, and `string()` under `max includes` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `max includes` node failed and why.

## When to Use

Choose `Chained refinement: trim().min(...).max(...).includes(...)` for typed markdown parsing with deterministic contracts, especially when `max includes` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `max includes`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `string()` yields predictable `max includes` parsing, clearer errors, and easier runtime integration.

### `Chained refinement: trim().min(...).max(...).includes(...)`

### Input Markdown

```md
## 1. META

- Team:   Risk Platform Core
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Team: md.string().trim().min(4).max(20).includes('Risk'),
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
      "Team": "Risk Platform Core"
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



















