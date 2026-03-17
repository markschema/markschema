# ordered strict order

Type: `document`

Signature: `md.document(shape, { ordered: true })`

## What It Is

`ordered: true` enables a structural precheck that evaluates anchored sections before regular parsing begins. The precheck reports `duplicate_section` when the same anchored heading appears more than once and `section_order_mismatch` when a later schema anchor appears earlier in markdown. After this guard, each section still runs its own schema validators as usual.

## When to Use

Use strict order when your template encodes workflow sequence and readers must trust that section progression is fixed. This is a strong fit for operational runbooks, audits, and governance artifacts where reordering headings changes interpretation. Avoid it for freeform drafting because valid content can fail solely due to heading placement.

### `md.document(shape, { ordered: true })`

### Input Markdown

```md
# RUNBOOK: Ordered Sections

## OPERATION

Operational details.

## META

- Service: Fraud API

## DETAILS

main details.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document(
  {
    title: md.heading(1).regex(/^RUNBOOK:\s.+/),
    operation: md.section('OPERATION').paragraphs([md.string().min(10)]),
    meta: md.section('META').fields({
      Service: md.string().min(3),
    }),
    details: md.section('DETAILS').paragraphs([md.string().min(5)]),
  },
  { ordered: true },
)
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Ordered Sections",
    "operation": [
      "Operational details."
    ],
    "meta": {
      "Service": "Fraud API"
    },
    "details": [
      "main details."
    ]
  }
}
```

#### Error

Failure trigger: move `## DETAILS` above `## META` and repeat `## DETAILS`; strict mode raises `section_order_mismatch` and `duplicate_section`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "duplicate_section",
        "path": [
          "details"
        ]
      },
      {
        "code": "section_order_mismatch",
        "path": [
          "details"
        ]
      }
    ]
  }
}
```
