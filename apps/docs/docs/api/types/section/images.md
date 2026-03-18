# images

Type: `section`

Signature: `section().images(schema).min(...)`

## What It Is

This method page uses `section().images(schema).min(...)` to enforce document-level structure checks, explicit section targeting, and boundary constraints over markdown content in `images` use cases. In practice, 1 h1 heading and 1 h2 section is validated and emitted as top-level keys `images` using `document()`, `section()`, `images()`, and `object()` under `images` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `images` node failed and why.

## When to Use

Apply `section().images(schema).min(...)` when your document flow requires section-scoped extraction where headings anchor each data slice for `images` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `images`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `images()`, and `object()` around `section().images(schema).min(...)` to keep `images` contracts transparent and reduce ambiguity in validation behavior.

### `section().images(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

![Diagram](https://example.com/diagram.png)
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  images: md.section('9. ADVANCED BLOCK').images(md.object({ alt: md.string(), url: md.url() })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "images": [
      {
        "alt": "Diagram",
        "url": "https://example.com/diagram.png"
      }
    ]
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "images"
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



