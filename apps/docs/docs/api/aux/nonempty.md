# nonempty

## What It Is

`nonempty` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `nonempty` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `section()`, and `fields()` to map a compact markdown payload into top-level keys `title` and `frontmatter` for this `nonempty` behavior. If parsing fails, the result carries issue codes like `invalid_type`, giving the caller precise debugging context for `nonempty` paths.

## When to Use

Use `nonempty` when you need tightening scalar constraints without redefining the base shape for `nonempty` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for very loose drafts where strict refinement would block iteration in `nonempty` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `section()`, and `fields()` to keep `nonempty` extraction boundaries explicit while preserving typed output for downstream code.

### Input Markdown

```md
## 0. META

- 4
- 7
- 9
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  scores: md.section('0. META').list(md.number()).pipeline(md.list(md.number()).nonempty()),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "scores": [
      4,
      7,
      9
    ]
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
        "message": "Missing section \"0. META\"",
        "path": [
          "scores"
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







