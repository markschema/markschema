# tuple

Type: `tuple`

Signature: `md.tuple([literal, number])`

## What It Is

`md.tuple([literal, number])` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `tuple` scenarios. With `document()`, `heading()`, `section()`, and `fields()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `title` and `frontmatter` without manual `tuple` post-processing. Error cases report issue codes like `invalid_type`, making operational diagnostics for `tuple` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `tuple` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `tuple`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `md.tuple([literal, number])` with `document()`, `heading()`, `section()`, and `fields()` so `tuple` schema intent stays readable and output remains predictable.

## 0. META

window:
  - critical
  - 5
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      window: md.tuple([md.literal('critical'), md.number().int().min(1)]),
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
    "title": "RUNBOOK: Tuple Window",
    "frontmatter": {
      "window": [
        "critical",
        5
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
        "code": "invalid_type",
        "path": [
          "frontmatter",
          "window"
        ]
      }
    ]
  }
}
```

## Additional Scenarios

### Tuple with mixed primitives

### Input Markdown

```md
# RUNBOOK: Tuple Mixed

## 0. META

window:
  - critical
  - 5
  - true
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      window: md.tuple([md.literal('critical'), md.number().int().min(1), md.boolean()]),
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
    "title": "RUNBOOK: Tuple Mixed",
    "frontmatter": {
      "window": [
        "critical",
        5,
        true
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
        "code": "invalid_type"
      }
    ]
  }
}
```

### Tuple item constraints with pipeline

### Input Markdown

```md
# RUNBOOK: Tuple Pipe

## 0. META

window:
  - critical
  - "5"
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  frontmatter: md.section('0. META').fields(
    md.object({
      window: md.tuple([
        md.literal('critical'),
        md.coerce.number().pipeline(md.number().int().min(1).max(10)),
      ]),
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
    "title": "RUNBOOK: Tuple Pipe",
    "frontmatter": {
      "window": [
        "critical",
        5
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
        "code": "invalid_number"
      }
    ]
  }
}
```









