# paragraph

Type: `section`

Signature: `section().paragraph().min(...)`

## What It Is

On this page, `section().paragraph().min(...)` centers on document-level structure checks, explicit section targeting, and boundary constraints to keep `paragraph` parsing deterministic and schema-driven. The example expects 1 h1 heading and 1 h2 section and returns top-level keys `context` directly from the declared `paragraph` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `paragraph` failure handling explicit.

## When to Use

Apply `section().paragraph().min(...)` when your document flow requires section-scoped extraction where headings anchor each data slice for `paragraph` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `paragraph`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `paragraph()`, and `min()` around `section().paragraph().min(...)` to keep `paragraph` contracts transparent and reduce ambiguity in validation behavior.

### `section().paragraph().min(...)`

### Input Markdown

```md
## 2. CONTEXT

Realtime controls protect payment systems.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  context: md.section('2. CONTEXT').paragraph().min(20),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "context": "Realtime controls protect payment systems."
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
        "message": "Missing section \"2. CONTEXT\"",
        "path": [
          "context"
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



