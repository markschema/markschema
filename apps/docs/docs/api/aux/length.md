# length

## What It Is

`length` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `length` scenarios. With `document()`, `heading()`, `section()`, and `fields()` in the schema, a compact markdown payload is converted into top-level keys `title` and `frontmatter` without manual `length` post-processing. Error cases report issue codes like `invalid_type`, making operational diagnostics for `length` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening scalar constraints without redefining the base shape where deterministic `length` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `length`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `length` with `document()`, `heading()`, `section()`, and `fields()` so `length` schema intent stays readable and output remains predictable.

### Input Markdown

```md
## 0. META

- 4
- 7
- 9
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  scores: md.section('0. META').list(md.number()).pipeline(md.list(md.number()).length(3)),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "scores": [
      4,
      7,
      9
    ]
  }
}
```

#### Error

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"0. META\"",
        "path": [
          "scores"
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







