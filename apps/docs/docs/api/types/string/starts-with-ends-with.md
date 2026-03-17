# startsWith + endsWith

Type: `string`

Signature: `Chained refinement: trim().startsWith(...).endsWith(...)`

## What It Is

On this page, `Chained refinement: trim().startsWith(...).endsWith(...)` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `starts with ends with` parsing deterministic and schema-driven. The example expects 1 h1 heading, 1 h2 section, and list content and returns top-level keys `owner` directly from the declared `starts with ends with` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `starts with ends with` failure handling explicit.

## When to Use

Apply `Chained refinement: trim().startsWith(...).endsWith(...)` when your document flow requires typed markdown parsing with deterministic contracts for `starts with ends with` and strict schema adherence over permissive parsing. It is less suitable for exploratory drafts that intentionally avoid strict validation under `starts with ends with`, because teams must accept key-level strictness that improves typing but rejects ad-hoc variations. Use `document()`, `section()`, `fields()`, and `string()` around `Chained refinement: trim().startsWith(...).endsWith(...)` to keep `starts with ends with` contracts transparent and reduce ambiguity in validation behavior.

### `Chained refinement: trim().startsWith(...).endsWith(...)`

### Input Markdown

```md
## 1. OWNER

- Role:   Lead Risk Engineer
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Role: md.string().trim().startsWith('Lead').endsWith('Engineer'),
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
      "Role": "Lead Risk Engineer"
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



















