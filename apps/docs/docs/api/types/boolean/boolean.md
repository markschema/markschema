# boolean

Type: `boolean`

Signature: `md.boolean()`

## What It Is

`md.boolean()` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `boolean` scenarios. With `document()`, `section()`, `fields()`, and `boolean()` in the schema, 1 h2 section and list content is converted into top-level keys `meta` without manual `boolean` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `boolean` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `boolean` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `boolean`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.boolean()` with `document()`, `section()`, `fields()`, and `boolean()` so `boolean` schema intent stays readable and output remains predictable.

### Input Markdown

```md
## 1. META

- Enabled: true
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Enabled: md.boolean(),
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
      "Enabled": true
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

## Additional Scenarios

### boolean with default wrapper

### Input Markdown

```md
## 1. META

- Enabled: true
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Enabled: md.boolean().optional().default(false),
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
      "Enabled": true
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




