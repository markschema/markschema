# date

Type: `coerce`

Signature: `md.coerce.date({ output: 'iso' })`

## What It Is

`md.coerce.date({ output: 'iso' })` coerces loose values into a strict ISO datetime parse and returns a normalized ISO string. The schema combines operators such as `document()`, `section()`, `fields()`, and `date()` to map 1 h2 section and list content into top-level keys `meta` for this `coerce date` behavior. When constraints are broken, issue codes like `missing_section` identify exactly which `date` node failed and why.

## When to Use

Choose `md.coerce.date({ output: 'iso' })` when source values may arrive loosely typed but the stored contract still needs a strict ISO string result. Skip it when consumers want a `Date` instance directly, because `md.coerce.date()` or `md.date()` is a better fit. Combining it with `document()`, `section()`, `fields()`, and `date()` yields predictable `date` parsing, clearer errors, and easier runtime integration.

### Input Markdown

```md
## 1. META

- StartAt: 2026-03-10T12:00:00.000Z
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    StartAt: md.coerce.date({ output: 'iso' }),
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
      "StartAt": "2026-03-10T12:00:00.000Z"
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

### coerce + pipeline hardening

### Input Markdown

```md
## 1. META

- Score: 8
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: md.coerce.number().pipeline(md.number().int().min(0).max(10)),
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
      "Score": 8
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




