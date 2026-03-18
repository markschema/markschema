# paragraphs

Type: `section`

Signature: `section().paragraphs([...])`

## What It Is

`section().paragraphs([...])` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and boundary constraints for `paragraphs` scenarios. With `document()`, `section()`, `paragraphs()`, and `string()` in the schema, 1 h1 heading and 1 h2 section is converted into top-level keys `context` without manual `paragraphs` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `paragraphs` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `paragraphs` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `paragraphs`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `section().paragraphs([...])` with `document()`, `section()`, `paragraphs()`, and `string()` so `paragraphs` schema intent stays readable and output remains predictable.

### `section().paragraphs([...])`

### Input Markdown

```md
## 2. CONTEXT

First paragraph.

Second paragraph.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  context: md.section('2. CONTEXT').paragraphs([md.string().min(5), md.string().min(5)]),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "context": [
      "First paragraph.",
      "Second paragraph."
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
        "message": "Missing section \"2. CONTEXT\"",
        "path": [
          "context"
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



