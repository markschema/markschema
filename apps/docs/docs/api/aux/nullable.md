# nullable

## What It Is

On this page, `nullable` centers on document-level structure checks, explicit section targeting, and typed field extraction to keep `nullable` parsing deterministic and schema-driven. The example expects a compact markdown payload and returns top-level keys `meta` directly from the declared `nullable` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `nullable` failure handling explicit.

## When to Use

Choose `nullable` for tightening scalar constraints without redefining the base shape, especially when `nullable` authoring rules must remain stable across teams. Skip it in very loose drafts where strict refinement would block iteration workflows for `nullable`, since key-level strictness that improves typing but rejects ad-hoc variations. Combining it with `document()`, `section()`, `fields()`, and `string()` yields predictable `nullable` parsing, clearer errors, and easier runtime integration.

### Input Markdown

```md
## 1. META

- Note: null
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Note: md.string().nullable(),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "Note": "null"
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
        "message": "Missing section \"1. META\"",
        "path": [
          "meta"
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



