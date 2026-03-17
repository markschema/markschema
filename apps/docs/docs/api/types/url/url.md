# url

Type: `url`

Signature: `md.url()`

## What It Is

`md.url()` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `url` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `url()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `endpoints` for this `url` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `url` paths.

## When to Use

Use `md.url()` when you need typed markdown parsing with deterministic contracts for `url` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `url` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `url()` to keep `url` extraction boundaries explicit while preserving typed output for downstream code.

### `md.url()`

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
    Dashboard: md.url(),
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



















