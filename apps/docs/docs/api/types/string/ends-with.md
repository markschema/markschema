# endsWith

Type: `string`

Signature: `md.string().endsWith(suffix)`

## What It Is

`md.string().endsWith(suffix)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `ends with` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `string()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `owner` for this `ends with` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `ends with` paths.

## When to Use

Use `md.string().endsWith(suffix)` when you need typed markdown parsing with deterministic contracts for `ends with` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `ends with` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `string()` to keep `ends with` extraction boundaries explicit while preserving typed output for downstream code.

### `md.string().endsWith(suffix)`

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
    Role: md.string().endsWith('Engineer'),
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



