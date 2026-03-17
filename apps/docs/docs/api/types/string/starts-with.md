# startsWith

Type: `string`

Signature: `md.string().startsWith(prefix)`

## What It Is

On this page, `md.string().startsWith(prefix)` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `starts with` parsing deterministic and schema-driven. The example expects 1 h1 heading, 1 h2 section, and list content and returns top-level keys `owner` directly from the declared `starts with` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `starts with` failure handling explicit.

## When to Use

Choose `md.string().startsWith(prefix)` for typed markdown parsing with deterministic contracts, especially when `starts with` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `starts with`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `string()` yields predictable `starts with` parsing, clearer errors, and easier runtime integration.

### `md.string().startsWith(prefix)`

### Input Markdown

```md
## 1. OWNER

- Role: Lead Engineer
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Role: md.string().startsWith('Lead'),
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
      "Role": "Lead Engineer"
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



















