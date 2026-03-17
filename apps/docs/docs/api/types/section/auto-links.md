# autolinks

Type: `section`

Signature: `section().autolinks(schema).min(...)`

## What It Is

`section().autolinks(schema).min(...)` parses markdown with document-level structure checks, explicit section targeting, and boundary constraints, so this page defines a strict `auto links` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `autolinks()`, and `object()` to map 1 h1 heading and 1 h2 section into top-level keys `autolinks` for this `auto links` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `auto links` paths.

## When to Use

Use `section().autolinks(schema).min(...)` when you need section-scoped extraction where headings anchor each data slice for `auto links` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for free-form notes with unstable section names in `auto links` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `autolinks()`, and `object()` to keep `auto links` extraction boundaries explicit while preserving typed output for downstream code.

### `section().autolinks(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

<https://example.com/status>
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  autolinks: md.section('9. ADVANCED BLOCK').autolinks(md.object({ text: md.string(), url: md.url() })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "autolinks": [
      {
        "text": "https://example.com/status",
        "url": "https://example.com/status"
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
          "autolinks"
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



















