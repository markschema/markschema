# blockOrder

Type: `section`

Signature: `section().blockOrder(order, { mode, allowRepeats, allowUnlisted })`

## What It Is

This method page uses `section().blockOrder(order, { mode, allowRepeats, allowUnlisted })` to enforce document-level structure checks, explicit section targeting, and block order enforcement over markdown content in `block order` use cases. In practice, 1 h1 heading and 1 h2 section is validated and emitted as top-level keys `data` using `section()`, `blockOrder()`, `document()`, and `object()` under `block order` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `block order` node failed and why.

## When to Use

Apply `section().blockOrder(order, { mode, allowRepeats, allowUnlisted })` when your document flow requires section-scoped extraction where headings anchor each data slice for `block order` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `block order`, because teams must accept ordering constraints that reduce flexibility but improve consistency. Use `section()`, `blockOrder()`, `document()`, and `object()` around `section().blockOrder(order, { mode, allowRepeats, allowUnlisted })` to keep `block order` contracts transparent and reduce ambiguity in validation behavior.

### `section().blockOrder(order, { mode, allowRepeats, allowUnlisted })`

### Input Markdown

```md
## 9. ADVANCED BLOCK

Paragraph one.

![Diagram](https://example.com/diagram.png)
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const advanced = md.section('9. ADVANCED BLOCK').blockOrder(['paragraph', 'image'], {
  mode: 'sequence',
  allowRepeats: true,
  allowUnlisted: true,
})

const schema = md.document({
  data: md.object({
    paragraphs: advanced.paragraphs([md.string().min(5)]),
    images: advanced.images(md.object({ alt: md.string(), url: md.url() })).min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "data": {
      "paragraphs": [
        "Paragraph one."
      ],
      "images": [
        {
          "alt": "Diagram",
          "url": "https://example.com/diagram.png"
        }
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
        "code": "missing_section",
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "data",
          "paragraphs"
        ],
        "line": 1,
        "position": {
          "start": {
            "line": 1,
            "column": 1
          }
        }
      },
      {
        "code": "missing_section",
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "data",
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



















