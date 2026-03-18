# transform

Type: `wrappers`

Signature: `transform(fn)`

## What It Is

`transform(fn)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `transform` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `string()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `meta` for this `transform` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `transform` paths.

## When to Use

Use `transform(fn)` when you need typed markdown parsing with deterministic contracts for `transform` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `transform` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `string()` to keep `transform` extraction boundaries explicit while preserving typed output for downstream code.

### `transform(fn)`

### Input Markdown

```md
## 1. META

- Alias: ALEX
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Alias: md.string().transform((value) => value.toLowerCase()),
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
      "Alias": "alex"
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



