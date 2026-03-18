# referenceLinks

Type: `section`

Signature: `section().referenceLinks(schema).min(...)`

## What It Is

`section().referenceLinks(schema).min(...)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and boundary constraints for `reference links` scenarios. With `document()`, `section()`, `referenceLinks()`, and `object()` in the schema, 1 h1 heading and 1 h2 section is converted into top-level keys `refs` without manual `reference links` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `reference links` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `reference links` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `reference links`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `section().referenceLinks(schema).min(...)` with `document()`, `section()`, `referenceLinks()`, and `object()` so `reference links` schema intent stays readable and output remains predictable.

### `section().referenceLinks(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

See [Checklist][c].

[c]: https://example.com/checklist "Checklist"
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  refs: md.section('9. ADVANCED BLOCK').referenceLinks(md.object({ text: md.string(), identifier: md.string(), url: md.url() })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "refs": [
      {
        "text": "Checklist",
        "identifier": "c",
        "url": "https://example.com/checklist"
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
          "refs"
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



