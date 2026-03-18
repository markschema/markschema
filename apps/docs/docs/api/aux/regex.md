# regex

## What It Is

`regex` is used here as a contract-first parser powered by document-level structure checks and typed heading extraction for `regex` scenarios. With `document()` and `heading()` in the schema, a compact markdown payload is converted into top-level keys `title` without manual `regex` post-processing. Error cases report issue codes like `missing_heading`, making operational diagnostics for `regex` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening text constraints without redefining the base heading extraction shape where deterministic `regex` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `regex`; the main cost is schema strictness that improves typing but rejects ad-hoc variations. For best results, compose `regex` with `document()` and `heading()` so `regex` schema intent stays readable and output remains predictable.

### Input Markdown

```md
# RUNBOOK: Fraud Routing
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1).regex(/^RUNBOOK:\s.+/),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Fraud Routing"
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
