# startswith

## What It Is

On this page, `startswith` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `startswith` parsing deterministic and schema-driven. The example expects a compact markdown payload and returns top-level keys `owner` directly from the declared `startswith` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `startswith` failure handling explicit.

## When to Use

Apply `startswith` when your document flow requires tightening scalar constraints without redefining the base shape for `startswith` and strict schema adherence over permissive parsing. It is less suitable for very loose drafts where strict refinement would block iteration under `startswith`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `section()`, `fields()`, and `string()` around `startswith` to keep `startswith` contracts transparent and reduce ambiguity in validation behavior.

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



