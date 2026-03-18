# int

## What It Is

This method page uses `int` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `int` use cases. In practice, a compact markdown payload is validated and emitted as top-level keys `meta` using `document()`, `section()`, `fields()`, and `number()` under `int` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `int` node failed and why.

## When to Use

Choose `int` for tightening scalar constraints without redefining the base shape, especially when `int` authoring rules must remain stable across teams. Skip it in very loose drafts where strict refinement would block iteration workflows for `int`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `number()` yields predictable `int` parsing, clearer errors, and easier runtime integration.

### Input Markdown

```md
## 1. META

- Score: 7
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: md.number().int(),
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
      "Score": 7
    }
  }
}
```

#### Error

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



