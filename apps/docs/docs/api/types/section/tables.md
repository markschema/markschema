# tables

Type: `section`

Signature: `section().tables(schema).headers([...]).min(...)`

## What It Is

`section().tables(schema).headers([...]).min(...)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and boundary constraints for `tables` scenarios. With `section()`, `document()`, `tables()`, and `object()` in the schema, 1 h1 heading, 1 h2 section, and tabular content is converted into top-level keys `tables` without manual `tables` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `tables` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `tables` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `tables`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `section().tables(schema).headers([...]).min(...)` with `section()`, `document()`, `tables()`, and `object()` so `tables` schema intent stays readable and output remains predictable.

### `section().tables(schema).headers([...]).min(...)`

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

Failure trigger: The input violates one or more constraints declared in the schema; use `issues[].path` and `issues[].code` to locate the exact failing node.

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



