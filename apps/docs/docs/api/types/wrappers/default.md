# default

Type: `wrappers`

Signature: `default(value)`

## What It Is

This method page uses `default(value)` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `default` use cases. In practice, 1 h1 heading, 1 h2 section, and list content is validated and emitted as top-level keys `meta` using `document()`, `section()`, `fields()`, and `string()` under `default` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `default` node failed and why.

## When to Use

Choose `default(value)` for typed markdown parsing with deterministic contracts, especially when `default` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `default`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `string()` yields predictable `default` parsing, clearer errors, and easier runtime integration.

### `default(value)`

### Input Markdown

```md
## 1. META

- Alias: ALEX
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Alias: md.string().optional().default('UNKNOWN'),
    Region: md.string().optional().default('us-east-1'),
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
      "Alias": "ALEX",
      "Region": "us-east-1"
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



