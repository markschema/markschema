# length nonempty

Type: `array`

Signature: `array.length()/array.nonempty()`

## What It Is

`array.length()/array.nonempty()` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `length nonempty` scenarios. With `document()`, `heading()`, `section()`, and `fields()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `title` and `frontmatter` without manual `length nonempty` post-processing. Error cases report issue codes like `invalid_type`, making operational diagnostics for `length nonempty` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `length nonempty` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `length nonempty`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `array.length()/array.nonempty()` with `document()`, `heading()`, `section()`, and `fields()` so `length nonempty` schema intent stays readable and output remains predictable.

### `array.length()/array.nonempty()`

### Input Markdown

```md
# RUNBOOK: Array Exact

## 0. META

scores:
  - 4
  - 7
  - 9
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      scores: md.array(md.number()).nonempty().length(3),
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
    "title": "RUNBOOK: Array Exact",
    "frontmatter": {
      "scores": [
        4,
        7,
        9
      ]
    }
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
        "code": "invalid_type"
      }
    ]
  }
}
```











