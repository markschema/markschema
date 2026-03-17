# string

Type: `metadata`

Signature: `md.metadata(md.string())`

## What It Is

`md.metadata(md.string())` is used here as a contract-first parser powered by document-level structure checks for `string` scenarios. With `document()`, `heading()`, `metadata()`, and `string()` in the schema, 1 h1 heading is converted into top-level keys `title` and `rawFrontmatter` without manual `string` post-processing. Error cases report issue codes like `missing_heading`, making operational diagnostics for `string` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `string` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `string`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `md.metadata(md.string())` with `document()`, `heading()`, `metadata()`, and `string()` so `string` schema intent stays readable and output remains predictable.

## Additional Scenarios

### Raw text pattern constraints

### Input Markdown

```md
---
env: production
---

# RUNBOOK: Raw Pattern
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  rawFrontmatter: md.metadata(md.string().includes('env: production')),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Raw Pattern",
    "rawFrontmatter": "env: production"
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

### Raw text transform pipeline

### Input Markdown

```md
---
env: production
---

# RUNBOOK: Raw Transform
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  rawFrontmatter: md
    .metadata(md.string())
    .transform((value) => value.toUpperCase())
    .pipeline(md.string().includes('ENV: PRODUCTION')),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Raw Transform",
    "rawFrontmatter": "ENV: PRODUCTION"
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



























