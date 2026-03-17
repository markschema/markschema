# key/value overload

Type: `record`

Signature: `md.record(keySchema, valueSchema) overload`

## What It Is

`md.record(keySchema, valueSchema) overload` parses markdown with document-level structure checks, frontmatter extraction, and typed key/value validation, so this page defines a strict `key value` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `record()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `key value` behavior. If parsing fails, the result carries issue codes like `string_too_short`, giving the caller precise debugging context for `key value` paths.

## When to Use

Use `md.record(keySchema, valueSchema) overload` when you need typed markdown parsing with deterministic contracts for `key value` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `key value` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `metadataObject()`, and `record()` to keep `key value` extraction boundaries explicit while preserving typed output for downstream code.

### Input Markdown

```md
---
weights:
  email: 3
  sms: 4
---

# RUNBOOK: Record Keys and Values
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.metadataObject(
    md.object({
      weights: md.record(md.string().min(3), md.number().int().min(1)),
    }),
  ),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Record Keys and Values",
    "frontmatter": {
      "weights": {
        "email": 3,
        "sms": 4
      }
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
        "code": "string_too_short"
      }
    ]
  }
}
```

## Additional Scenarios

### Record + wrappers + object policy

### Input Markdown

```md
---
weights:
  email: 3
  sms: 4
---

# RUNBOOK: Record Advanced
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.metadataObject(
    md.object({
      weights: md.record(md.string().min(3), md.number().int().min(1)).optional().default({}),
    }),
  ),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Record Advanced",
    "frontmatter": {
      "weights": {}
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





