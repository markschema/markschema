# list

Type: `section`

Signature: `section().list(schema).min(...)`

## What It Is

On this page, `section().list(schema).min(...)` centers on document-level structure checks, explicit section targeting, and boundary constraints to keep `list` parsing deterministic and schema-driven. The example expects 1 h1 heading, 1 h2 section, and list content and returns top-level keys `goals` directly from the declared `list` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `list` failure handling explicit.

## When to Use

Apply `section().list(schema).min(...)` when your document flow requires section-scoped extraction where headings anchor each data slice for `list` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `list`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `list()`, and `string()` around `section().list(schema).min(...)` to keep `list` contracts transparent and reduce ambiguity in validation behavior.

### `section().list(schema).min(...)`

### Input Markdown

```md
## 3. GOALS

- Reduce fraud loss
- Improve precision
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  goals: md.section('3. GOALS').list(md.string().min(5)).min(2),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "goals": [
      "Reduce fraud loss",
      "Improve precision"
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
        "message": "Missing section \"3. GOALS\"",
        "path": [
          "goals"
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



















