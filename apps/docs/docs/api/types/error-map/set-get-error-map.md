# set/get errorMap

Type: `error-map`

Signature: `setErrorMap(...) + getErrorMap()`

## What It Is

`setErrorMap(...) + getErrorMap()` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `set get error map` scenarios. With `document()`, `section()`, `fields()`, and `email()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `owner` without manual `set get error map` post-processing. Error cases report issue codes like `invalid_email`, making operational diagnostics for `set get error map` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `set get error map` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `set get error map`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `setErrorMap(...) + getErrorMap()` with `document()`, `section()`, `fields()`, and `email()` so `set get error map` schema intent stays readable and output remains predictable.

### `setErrorMap(...) + getErrorMap()`

### Input Markdown

```md
## 1. OWNER

- Email: not-an-email
```

### Schema

```ts
import { md, setErrorMap, getErrorMap } from '@markschema/mdshape'

setErrorMap((issue) => {
  if (issue.code === 'invalid_email') return 'Global map: invalid email'
  return undefined
})

const current = getErrorMap()

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Email: md.email(),
  }),
})

const result = schema.safeParse(markdown)
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "owner": {
      "Email": "ops@zayra.com"
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
        "code": "invalid_email",
        "message": "Global map: invalid email"
      }
    ]
  }
}
```












