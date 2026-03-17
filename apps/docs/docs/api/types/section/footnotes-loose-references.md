# footnotes loose references

Type: `section`

Signature: `section().footnotes(schema, { enforceReferences: false }).min(...)`

## What It Is

`footnotes(..., { enforceReferences: false })` extracts and validates only footnote definitions declared in the section. Inline references like `[^id]` are not matched against definitions in this mode, so unresolved citations do not produce structural footnote-reference errors. The method still validates each extracted footnote item with the provided schema.

## When to Use

Use this mode for ingestion and drafting workflows where you want to catalog footnote definitions even when references are incomplete. It is useful for migration pipelines, partial content generation, and internal note repositories that accept temporary mismatches. Switch to enforced mode when reference integrity must block parsing.

### `section().footnotes(schema, { enforceReferences: false }).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

Text with note[^1].

[^a]: Footnote content.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  footnotes: md
    .section('9. ADVANCED BLOCK')
    .footnotes(md.object({ id: md.string(), text: md.string() }), { enforceReferences: false })
    .min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "footnotes": [
      {
        "id": "a",
        "text": "Footnote content."
      }
    ]
  }
}
```

#### Error

Failure trigger: this example error is unrelated to references; it fails when section `9. ADVANCED BLOCK` is missing.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "footnotes"
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
