# endswith

## What It Is

`endswith` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `endswith` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, a compact markdown payload is converted into top-level keys `owner` without manual `endswith` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `endswith` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for tightening scalar constraints without redefining the base shape where deterministic `endswith` parsing matters more than free-form flexibility. Do not default to it for very loose drafts where strict refinement would block iteration around `endswith`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `endswith` with `document()`, `section()`, `fields()`, and `string()` so `endswith` schema intent stays readable and output remains predictable.

### Input Markdown

```md
## 1. OWNER

- Role: Lead Engineer
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Role: md.string().endsWith('Engineer'),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "owner": {
      "Role": "Lead Engineer"
    }
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
        "message": "Missing section \"1. OWNER\"",
        "path": [
          "owner"
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



