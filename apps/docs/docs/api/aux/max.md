# max

## What It Is

`max` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `max` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `string()` to map a compact markdown payload into top-level keys `meta` for this `max` behavior. If parsing fails, the result carries issue codes like `value_too_big`, giving the caller precise debugging context for `max` paths.

## When to Use

Use `max` when you need tightening scalar constraints without redefining the base shape for `max` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for very loose drafts where strict refinement would block iteration in `max` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `string()` to keep `max` extraction boundaries explicit while preserving typed output for downstream code.

### Input Markdown

```md
## 1. META

- Team: Risk Team
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Team: md.string().max(12),
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
      "Team": "Risk Team"
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








