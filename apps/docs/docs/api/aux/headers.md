# headers

## What It Is

`headers` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and boundary constraints for `headers` scenarios. With `section()`, `document()`, `tables()`, and `object()` in the schema, a compact markdown payload is converted into top-level keys `tables` without manual `headers` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `headers` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening scalar constraints without redefining the base shape where deterministic `headers` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `headers`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `headers` with `section()`, `document()`, `tables()`, and `object()` so `headers` schema intent stays readable and output remains predictable.

### Input Markdown

```md
## 9. ADVANCED BLOCK

| Metric | Target |
| --- | --- |
| Precision | >= 0.92 |
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const section = md.section('9. ADVANCED BLOCK')

const schema = md.document({
  tables: section
    .tables(
      md.object({
        headers: md.list(md.string()).min(2),
        rows: md.list(md.list(md.string()).min(2)).min(1),
      }),
    )
    .headers(['Metric', 'Target'])
    .min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "headers": [
          "Metric",
          "Target"
        ],
        "rows": [
          [
            "Precision",
            ">= 0.92"
          ]
        ]
      }
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "tables"
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













