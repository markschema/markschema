# includes

Type: `url`

Signature: `md.url().includes(domain)`

## What It Is

`md.url().includes(domain)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `includes` scenarios. With `document()`, `section()`, `fields()`, and `url()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `endpoints` without manual `includes` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `includes` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `includes` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `includes`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.url().includes(domain)` with `document()`, `section()`, `fields()`, and `url()` so `includes` schema intent stays readable and output remains predictable.

### `md.url().includes(domain)`

### Input Markdown

```md
## 1. ENDPOINTS

- Dashboard: https://status.zayra.com/incidents
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  endpoints: md.section('1. ENDPOINTS').fields({
    Dashboard: md.url().includes('zayra.com'),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "endpoints": {
      "Dashboard": "https://status.zayra.com/incidents"
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
        "code": "missing_section",
        "message": "Missing section \"1. ENDPOINTS\"",
        "path": [
          "endpoints"
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



















