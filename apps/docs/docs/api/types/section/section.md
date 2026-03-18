# section

Type: `section`

Signature: `md.section(name)`

## What It Is

`md.section(name)` parses markdown with document-level structure checks, explicit section targeting, and boundary constraints, so this page defines a strict `section` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `paragraphs()`, and `string()` to map 1 h1 heading and 1 h2 section into top-level keys `note` for this `section` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `section` paths.

## When to Use

Use `md.section(name)` when you need section-scoped extraction where headings anchor each data slice for `section` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for free-form notes with unstable section names in `section` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `paragraphs()`, and `string()` to keep `section` extraction boundaries explicit while preserving typed output for downstream code.

### `md.section(name)`

### Input Markdown

```md
## 2. NOTE

Fraud controls must be observable and auditable.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  note: md.section('2. NOTE').paragraphs([md.string().min(20)]),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "note": [
      "Fraud controls must be observable and auditable."
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
        "message": "Missing section \"2. NOTE\"",
        "path": [
          "note"
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



