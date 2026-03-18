# ordered flexible order

Type: `document`

Signature: `md.document(shape, { ordered: false })`

## What It Is

`ordered: false` disables anchored section precheck and lets extraction proceed without sequence enforcement. In this mode, duplicated or reordered anchored headings do not automatically produce `section_order_mismatch` or `duplicate_section` at document level. The parser still validates matched section content using the rules declared in each section schema.

## When to Use

Use flexible order for collaborative authoring where sections move during drafting, localization, or automated generation. It is useful when consumers care about typed values but do not depend on canonical heading sequence as a business rule. If sequence must signal process state, migrate to strict order to fail fast on layout drift.

### `md.document(shape, { ordered: false })`

### Input Markdown

```md
# RUNBOOK: No Order Guard

## DETAILS

Operational details.

## META

- Service: Fraud API

## DETAILS

Duplicate details block.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document(
  {
    title: md.heading(1),
    meta: md.section('META').fields({
      Service: md.string().min(3),
    }),
    details: md.section('DETAILS').paragraphs([md.string().min(10)]),
  },
  { ordered: false },
)
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: No Order Guard",
    "meta": {
      "Service": "Fraud API"
    },
    "details": [
      "Operational details."
    ]
  }
}
```

#### Error

Failure trigger: remove the top h1 title; the parse fails with `missing_heading`, which is unrelated to section ordering mode.

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



