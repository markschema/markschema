# format

Type: `error-map`

Signature: `safeParse(input, { errorMap }) + error.format(markdown)`

## What It Is

`safeParse(input, { errorMap }) + error.format(markdown)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `format` scenarios. With `document()`, `section()`, `fields()`, and `number()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `meta` without manual `format` post-processing. Error cases report issue codes like `invalid_number`, making operational diagnostics for `format` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `format` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `format`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `safeParse(input, { errorMap }) + error.format(markdown)` with `document()`, `section()`, `fields()`, and `number()` so `format` schema intent stays readable and output remains predictable.

### `safeParse(input, { errorMap }) + error.format(markdown)`

### Input Markdown

```md
## 1. META

- Score: invalid
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: md.number(),
  }),
})

const result = schema.safeParse(markdown, {
  errorMap: (issue) => issue.code === 'invalid_number' ? 'Call map: invalid score' : undefined,
})

if (!result.success) {
  const formatted = result.error.format(markdown)
}
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
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
        "code": "invalid_number",
        "message": "Call map: invalid score"
      }
    ]
  }
}
```












