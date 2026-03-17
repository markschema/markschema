# blockquotes

Type: `section`

Signature: `section().blockquotes(schema).min(...)`

## What It Is

This method page uses `section().blockquotes(schema).min(...)` to enforce document-level structure checks, explicit section targeting, and boundary constraints over markdown content in `blockquotes` use cases. In practice, 1 h1 heading and 1 h2 section is validated and emitted as top-level keys `quotes` using `document()`, `section()`, `blockquotes()`, and `object()` under `blockquotes` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `blockquotes` node failed and why.

## When to Use

Apply `section().blockquotes(schema).min(...)` when your document flow requires section-scoped extraction where headings anchor each data slice for `blockquotes` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `blockquotes`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `blockquotes()`, and `object()` around `section().blockquotes(schema).min(...)` to keep `blockquotes` contracts transparent and reduce ambiguity in validation behavior.

### `section().blockquotes(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

> Retrieval quality sets answer quality.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  quotes: md.section('9. ADVANCED BLOCK').blockquotes(md.object({ text: md.string().min(10) })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "text": "Retrieval quality sets answer quality."
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
          "quotes"
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



















