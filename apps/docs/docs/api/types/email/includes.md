# includes

Type: `email`

Signature: `md.email().includes(fragment)`

## What It Is

On this page, `md.email().includes(fragment)` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `includes` parsing deterministic and schema-driven. The example expects 1 h1 heading, 1 h2 section, and list content and returns top-level keys `owner` directly from the declared `includes` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `includes` failure handling explicit.

## When to Use

Choose `md.email().includes(fragment)` for typed markdown parsing with deterministic contracts, especially when `includes` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `includes`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `email()` yields predictable `includes` parsing, clearer errors, and easier runtime integration.

### `md.email().includes(fragment)`

### Input Markdown

```md
## 1. OWNER

- Email: alerts@zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Email: md.email().includes('zayra.com'),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "owner": {
      "Email": "alerts@zayra.com"
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
        "message": "Missing section \"1. OWNER\"",
        "path": [
          "owner"
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



















