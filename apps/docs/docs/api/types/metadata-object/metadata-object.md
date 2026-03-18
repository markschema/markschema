# metadataObject

Type: `metadata-object`

Signature: `md.metadataObject(md.object(...))`

## What It Is

`md.metadataObject(schema)` parses YAML frontmatter into an object and validates it against the provided mdshape schema. It is evaluated inside `md.document(...)`, so you can combine frontmatter validation with body-section validation in one contract. When frontmatter is missing, malformed, or fails field constraints, mdshape returns frontmatter-specific issues instead of generic heading/section errors.

## When to Use

Use `md.metadataObject(...)` when document metadata is part of the API contract, such as versioning, service identifiers, or environment flags declared in frontmatter. It is ideal when you want strict typed metadata before processing markdown body sections. Skip it when your source has no frontmatter or when metadata should be inferred from body content instead.

### `md.metadataObject(md.object(...))`

### Input Markdown

```md
---
service: fraud-api
version: 1
---

# RUNBOOK: Alert Routing
```

### Schema

```ts
import { md } from "@markschema/mdshape";

const schema = md.document({
  frontmatter: md.metadataObject(
    md.object({
      service: md.string().min(3),
      version: md.number().int().min(1),
    }),
  ),
  title: md.heading(1),
});
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "frontmatter": {
      "service": "fraud-api",
      "version": 1
    },
    "title": "RUNBOOK: Alert Routing"
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
        "code": "missing_frontmatter",
        "message": "Missing YAML frontmatter block",
        "path": [
          "frontmatter"
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



