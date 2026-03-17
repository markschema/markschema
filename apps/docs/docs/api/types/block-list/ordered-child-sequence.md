# ordered child sequence

Type: `block-list`

Signature: `block.list in ordered child sequence`

## What It Is

`block.list in ordered child sequence` parses markdown with document-level structure checks, ordered section validation, and boundary constraints, so this page defines a strict `ordered child sequence` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `headingLevel()`, and `sequence()` to map 1 h1 heading, 1 h2 section, and 2 h3 subsections into top-level keys `tools` for this `ordered child sequence` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `ordered child sequence` paths.

## When to Use

Use `block.list in ordered child sequence` when you need typed markdown parsing with deterministic contracts for `ordered child sequence` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `ordered child sequence` documents, because it introduces ordering constraints that reduce flexibility but improve consistency. It pairs well with `document()`, `section()`, `headingLevel()`, and `sequence()` to keep `ordered child sequence` extraction boundaries explicit while preserving typed output for downstream code.

### `block.list in ordered child sequence`

### Input Markdown

```md
## 6. TOOLS

### Operational Tools

- Kafka
- Flink

### Frameworks

- Matrix
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tools: md
    .section('6. TOOLS')
    .headingLevel(3)
    .sequence(['Operational Tools', 'Frameworks'])
    .each(
      md.object({
        title: md.headingText(),
        items: md.block.list(md.string().min(3)).min(1),
      }),
    )
    .min(2),
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
      },
      {
        "title": "Frameworks",
        "items": [
          "Matrix"
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



















