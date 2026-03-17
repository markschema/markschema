# min

Type: `list`

Signature: `list(...).min(size)`

## What It Is

`list(...).min(size)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `min` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `section()`, and `fields()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `title` and `frontmatter` for this `min` behavior. If parsing fails, the result carries issue codes like `list_too_small`, giving the caller precise debugging context for `min` paths.

## When to Use

Use `list(...).min(size)` when you need typed markdown parsing with deterministic contracts for `min` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `min` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `section()`, and `fields()` to keep `min` extraction boundaries explicit while preserving typed output for downstream code.

## 0. META

labels:
  - urgent
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      labels: md.list(md.string().min(3)).min(2),
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
    "title": "RUNBOOK: List Min",
    "frontmatter": {
      "labels": [
        "urgent",
        "incident"
      ]
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
        "code": "list_too_small"
      }
    ]
  }
}
```

## Additional Scenarios

### list with nonempty semantics via array

### Input Markdown

```md
# RUNBOOK: List Nonempty

## 0. META

labels:
  - urgent
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      labels: md.array(md.string().min(3)).nonempty(),
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
    "title": "RUNBOOK: List Nonempty",
    "frontmatter": {
      "labels": [
        "urgent"
      ]
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
        "code": "list_too_small"
      }
    ]
  }
}
```









