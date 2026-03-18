# Interaction: optional/nullable/default + transform/pipeline

This flow models a realistic ingestion path from markdown values into a strict numeric shape.

## Input Markdown

```md
## 1. META

- Alias: ALEX
- Score: 7
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Alias: md.string().trim().transform((value) => value.toLowerCase()).default('unknown'),
    Score: md
      .coerce.number()
      .pipeline(md.number().int().min(0).max(10))
      .optional()
      .nullable(),
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
      "Alias": "alex",
      "Score": 7
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



