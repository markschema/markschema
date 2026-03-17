# coercion + pipeline

Type: `metadata-object`

Signature: `Frontmatter coercion and pipeline`

## What It Is

This scenario shows `md.metadataObject(...)` combined with coercion and pipeline validation to normalize frontmatter values before applying numeric constraints. It allows YAML strings like `"7"` to become typed numbers while still enforcing bounds and integer checks. The pattern is useful for frontmatter that comes from human-edited sources with mixed scalar formats.

## When to Use

Use this pattern when frontmatter values may be authored as strings but your runtime requires strict numeric types after parsing. It is especially useful in migration phases where documents are not yet fully normalized but validation still must stay strict. Avoid it when implicit conversion is undesirable and only exact input types should be accepted.
### Frontmatter coercion + pipeline

### Input Markdown

```md
---
priority: "7"
---

# RUNBOOK: Coercion
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  frontmatter: md.metadataObject(
    md.object({
      priority: md.coerce.number().pipeline(md.number().int().min(0).max(10)),
    }),
  ),
  title: md.heading(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "frontmatter": {
      "priority": 7
    },
    "title": "RUNBOOK: Coercion"
  }
}
```

#### Error

Failure trigger: the coerced value fails pipeline constraints (for example `priority: "99"`), producing a numeric bound issue.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "value_too_big",
        "path": [
          "frontmatter",
          "priority"
        ]
      }
    ]
  }
}
```











