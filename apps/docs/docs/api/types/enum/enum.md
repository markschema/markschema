# enum

Type: `enum`

Signature: `md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])`

## What It Is

`md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `enum` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `enum()` to map 1 h2 section and list content into top-level keys `meta` for this `enum` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `enum` paths.

## When to Use

Use `md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])` when you need typed markdown parsing with deterministic contracts for `enum` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `enum` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `enum()` to keep `enum` extraction boundaries explicit while preserving typed output for downstream code.

## Additional Scenarios

### Enum in section fields

### Input Markdown

```md
## 1. META

- Tier: gold
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Tier: md.enum(['gold', 'silver', 'bronze']),
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
      "Tier": "gold"
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

### Enum + transform pipeline

### Input Markdown

```md
## 1. META

- Tier: GOLD
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Tier: md.string().transform((v) => v.toLowerCase()).pipeline(md.enum(['gold', 'silver', 'bronze'])),
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
      "Tier": "gold"
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




