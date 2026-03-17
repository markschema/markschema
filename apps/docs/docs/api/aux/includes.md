# includes

## What It Is

On this page, `includes` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `includes` parsing deterministic and schema-driven. The example expects a compact markdown payload and returns top-level keys `owner` directly from the declared `includes` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `includes` failure handling explicit.

## When to Use

Apply `includes` when your document flow requires tightening scalar constraints without redefining the base shape for `includes` and strict schema adherence over permissive parsing. It is less suitable for very loose drafts where strict refinement would block iteration under `includes`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `section()`, `fields()`, and `string()` around `includes` to keep `includes` contracts transparent and reduce ambiguity in validation behavior.

### Input Markdown

```md
## 1. OWNER

- Role: Lead Fraud Engineer
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Role: md.string().includes('Fraud'),
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
      "Role": "Lead Fraud Engineer"
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













