# record

Type: `record`

Signature: `md.record(valueSchema)`

## What It Is

`md.record(valueSchema)` parses markdown with document-level structure checks, frontmatter extraction, and typed key/value validation, so this page defines a strict `record` contract instead of permissive text scraping. The schema combines operators such as `document()`, `heading()`, `metadataObject()`, and `record()` to map 1 h1 heading and frontmatter content into top-level keys `title` and `frontmatter` for this `record` behavior. If parsing fails, the result carries issue codes like `invalid_number`, giving the caller precise debugging context for `record` paths.

## When to Use

Use `md.record(valueSchema)` when you need typed markdown parsing with deterministic contracts for `record` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `record` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `heading()`, `metadataObject()`, and `record()` to keep `record` extraction boundaries explicit while preserving typed output for downstream code.

### `md.record(valueSchema)`

### Input Markdown

```md
# RUNBOOK: Record Values

## 2. WEIGHTS

- email=3
- sms=4
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const pairList = md.section('2. WEIGHTS').list(md.string().min(3))

const recordSchema = md.preprocess(
  (entries) =>
    Object.fromEntries(
      (entries ?? []).map((entry) => {
        const [key, value] = String(entry).split('=')
        return [key, Number(value)]
      }),
    ),
  md.record(md.number().int().min(1)),
)

const schema = md.document({
  title: md.heading(1),
  weights: pairList.pipeline(recordSchema),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Record Values",
    "weights": {
      "email": 3,
      "sms": 4
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



