# startsWith

Type: `url`

Signature: `md.url().startsWith('https://')`

## What It Is

This method page uses `md.url().startsWith('https://')` to enforce document-level structure checks, explicit section targeting, and typed field extraction over markdown content in `starts with` use cases. In practice, 1 h1 heading, 1 h2 section, and list content is validated and emitted as top-level keys `endpoints` using `document()`, `section()`, `fields()`, and `url()` under `starts with` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `starts with` node failed and why.

## When to Use

Apply `md.url().startsWith('https://')` when your document flow requires typed markdown parsing with deterministic contracts for `starts with` and strict schema adherence over permissive parsing. It is less suitable for exploratory drafts that intentionally avoid strict validation under `starts with`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `section()`, `fields()`, and `url()` around `md.url().startsWith('https://')` to keep `starts with` contracts transparent and reduce ambiguity in validation behavior.

### `md.url().startsWith('https://')`

### Input Markdown

```md
## 1. ENDPOINTS

- Dashboard: https://status.zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  endpoints: md.section('1. ENDPOINTS').fields({
    Dashboard: md.url().startsWith('https://'),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "endpoints": {
      "Dashboard": "https://status.zayra.com/"
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
        "message": "Missing section \"1. ENDPOINTS\"",
        "path": [
          "endpoints"
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



















