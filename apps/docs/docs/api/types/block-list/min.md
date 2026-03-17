# min

Type: `block-list`

Signature: `md.block.list(schema).min(size)`

## What It Is

`md.block.list(schema).min(size)` parses markdown with document-level structure checks and boundary constraints, so this page defines a strict `min` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `headingLevel()`, and `each()` to map 1 h1 heading, 1 h2 section, and 1 h3 subsection into top-level keys `tools` for this `min` behavior. If parsing fails, the result carries issue codes like `list_too_small`, giving the caller precise debugging context for `min` paths.

## When to Use

Use `md.block.list(schema).min(size)` when you need typed markdown parsing with deterministic contracts for `min` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `min` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `headingLevel()`, and `each()` to keep `min` extraction boundaries explicit while preserving typed output for downstream code.

### `md.block.list(schema).min(size)`

### Input Markdown

```md
## 6. TOOLS

### Operational Tools

- Kafka
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tools: md
    .section('6. TOOLS')
    .headingLevel(3)
    .each(
      md.object({
        title: md.headingText(),
        items: md.block.list(md.string().min(3)).min(2),
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
        "code": "list_too_small",
        "path": [
          "tools",
          0,
          "items"
        ]
      }
    ]
  }
}
```












