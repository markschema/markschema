# links

Type: `section`

Signature: `section().links(schema).min(...)`

## What It Is

`section().links(schema).min(...)` parses markdown with document-level structure checks, explicit section targeting, and boundary constraints, so this page defines a strict `links` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `links()`, and `object()` to map 1 h1 heading and 1 h2 section into top-level keys `links` for this `links` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `links` paths.

## When to Use

Use `section().links(schema).min(...)` when you need section-scoped extraction where headings anchor each data slice for `links` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for free-form notes with unstable section names in `links` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `links()`, and `object()` to keep `links` extraction boundaries explicit while preserving typed output for downstream code.

### `section().links(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

See [Spec](https://example.com/spec).
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  links: md.section('9. ADVANCED BLOCK').links(md.object({ text: md.string(), url: md.url() })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "links": [
      {
        "text": "Spec",
        "url": "https://example.com/spec"
      }
    ]
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "links"
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



















