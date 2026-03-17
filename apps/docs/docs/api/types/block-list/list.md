# list

Type: `block-list`

Signature: `md.block.list(schema)`

## What It Is

`md.block.list(schema)` parses markdown with document-level structure checks and boundary constraints, so this page defines a strict `list` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `headingLevel()`, and `each()` to map 1 h1 heading, 1 h2 section, and 1 h3 subsection into top-level keys `tools` for this `list` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `list` paths.

## When to Use

Use `md.block.list(schema)` when you need typed markdown parsing with deterministic contracts for `list` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `list` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `headingLevel()`, and `each()` to keep `list` extraction boundaries explicit while preserving typed output for downstream code.

### `md.block.list(schema)`

### Input Markdown

```md
## 6. TOOLS

### Operational Tools

- Kafka
- Flink
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tools: md
    .section('6. TOOLS')
    .subsections(3)
    .each(
      md.object({
        title: md.headingText(),
        items: md.block.list(md.string().min(3)),
      }),
    ),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "title": "Operational Tools",
        "items": [
          "Kafka",
          "Flink"
        ]
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
        "message": "Missing section \"6. TOOLS\"",
        "path": [
          "tools"
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


















