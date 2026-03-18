# caseInsensitive

## What It Is

`caseInsensitive` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `case insensitive` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `string()` to map a compact markdown payload into top-level keys `meta` for this `case insensitive` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `case insensitive` paths.

## When to Use

Use `caseInsensitive` when you need tightening scalar constraints without redefining the base shape for `case insensitive` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for very loose drafts where strict refinement would block iteration in `case insensitive` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `string()` to keep `case insensitive` extraction boundaries explicit while preserving typed output for downstream code.

### Input Markdown

```md
## 1. META

- Service: Fraud API
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
      service: md.string().min(3),
    }, { caseInsensitive: true }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "service": "Fraud API"
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

Failure trigger: same input with `{ caseInsensitive: false }` requires exact key casing and fails for `service` vs `Service`.



