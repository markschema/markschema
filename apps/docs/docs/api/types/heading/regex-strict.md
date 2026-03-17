# regex strict

Type: `heading`

Signature: `md.heading(depth).regex(...) with strict runbook prefix`

## What It Is

On this page, `md.heading(depth).regex(...) with strict runbook prefix` centers on document-level structure checks to keep `regex strict` parsing deterministic and schema-driven. The example expects 1 h1 heading and returns top-level keys `title` directly from the declared `regex strict` extraction rules. Violations produce issue codes like `missing_heading`, which avoids brittle string checks and keeps `regex strict` failure handling explicit.

## When to Use

Choose `md.heading(depth).regex(...) with strict runbook prefix` for typed markdown parsing with deterministic contracts, especially when `regex strict` authoring rules must remain stable across teams. Skip it in exploratory drafts that intentionally avoid strict validation workflows for `regex strict`, since more explicit schema maintenance to keep output deterministic. Combining it with `document()` and `heading()` yields predictable `regex strict` parsing, clearer errors, and easier runtime integration.

### `md.heading(depth).regex(...) with strict runbook prefix`

### Input Markdown

```md
# RUNBOOK: Incident Timeline
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1).regex(/^RUNBOOK:\s[A-Z][\w\s-]{5,}$/),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Incident Timeline"
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
        "code": "heading_pattern_mismatch",
        "message": "Heading does not match required pattern /^RUNBOOK:\\s[A-Z][\\w\\s-]{5,}$/",
        "path": [
          "title"
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









