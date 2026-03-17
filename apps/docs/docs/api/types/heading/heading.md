# heading

Type: `heading`

Signature: `md.heading(depth)`

## What It Is

`md.heading(depth)` is used here as a contract-first parser powered by document-level structure checks for `heading` scenarios. With `document()` and `heading()` in the schema, 1 h1 heading is converted into top-level keys `title` without manual `heading` post-processing. Error cases report issue codes like `missing_heading`, making operational diagnostics for `heading` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `heading` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `heading`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `md.heading(depth)` with `document()` and `heading()` so `heading` schema intent stays readable and output remains predictable.

### `md.heading(depth)`

### Input Markdown

```md
# RUNBOOK: Basic Heading
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Basic Heading"
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
        "code": "missing_heading",
        "message": "Missing heading with depth 1",
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









