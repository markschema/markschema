# tuple

Type: `tuple`

Signature: `md.tuple([literal, number])`

## What It Is

`md.tuple([literal, number])` is used here as a contract-first parser powered by document-level structure checks, frontmatter extraction, and typed positional validation for `tuple` scenarios. With `document()`, `heading()`, `metadataObject()`, and `tuple()` in the schema, 1 h1 heading and frontmatter content are converted into top-level keys `title` and `frontmatter` without manual `tuple` post-processing. Error cases report issue codes like `invalid_type`, making operational diagnostics for `tuple` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `tuple` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `tuple`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.tuple([literal, number])` with `document()`, `heading()`, `metadataObject()`, and `tuple()` so `tuple` schema intent stays readable and output remains predictable.

### `md.tuple([literal, number])`

### Input Markdown

```md
# RUNBOOK: Tuple Window

## 2. WINDOW

- critical
- 5
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const tupleSchema = md.preprocess(
  (items) =>
    Array.isArray(items)
      ? items.map((item) => {
          const raw = String(item).trim()
          if (/^-?\d+$/.test(raw)) return Number(raw)
          if (raw === 'true') return true
          if (raw === 'false') return false
          return raw
        })
      : items,
  md.tuple([md.literal('critical'), md.number().int().min(1)]),
)

const schema = md.document({
  title: md.heading(1),
  window: md.section('2. WINDOW').list(md.string().min(1)).pipeline(tupleSchema),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Tuple Window",
    "window": [
      "critical",
      5
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



