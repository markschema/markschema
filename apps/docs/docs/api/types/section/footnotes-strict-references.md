# footnotes strict references

Type: `section`

Signature: `section().footnotes(schema, { enforceReferences: true }).min(...)`

## What It Is

`footnotes(..., { enforceReferences: true })` parses footnote definitions and also validates inline references inside the same section. For each `[^id]` reference in paragraphs and inline content, mdshape expects a matching definition `[^id]: ...` and reports `missing_footnote_definition` when no match exists. This mode is strict about reference integrity while keeping the normal footnote item schema validation flow.

## When to Use

Use this mode when markdown correctness must guarantee that every cited footnote reference is resolvable by id. It is ideal for production documentation, policy runbooks, and publish pipelines where dangling references are considered invalid output. Avoid it in draft ingest flows where references may be authored before definitions and fixed later.

### `section().footnotes(schema, { enforceReferences: true }).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

Text with note[^a].

[^a]: Footnote content.
```

### Schema

```ts
import { md } from "@markschema/mdshape";

const schema = md.document({
  footnotes: md
    .section("9. ADVANCED BLOCK")
    .footnotes(md.object({ id: md.string(), text: md.string() }), {
      enforceReferences: true,
    })
    .min(1),
});
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

Failure trigger: if markdown contains `[^1]` but only defines `[^a]: ...`, `enforceReferences: true` fails with `missing_footnote_definition`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_footnote_definition",
        "message": "Missing footnote definition for reference \"[^1]\" in section \"9. ADVANCED BLOCK\"",
        "path": ["footnotes"]
      }
    ]
  }
}
```
