# set/get errorMap

Type: `error-map`

Signature: `setErrorMap(...) + getErrorMap()`

## What It Is

`setErrorMap(...) + getErrorMap()` configures and reads the global error message mapper used by all schemas in the process. This method pair is for central error-message policy and not for field extraction logic. Error cases keep the same issue codes, but messages can be rewritten globally.

## When to Use

Use `setErrorMap(...) + getErrorMap()` when your app needs a single global error-message style across multiple schemas. Avoid it when you need per-schema message behavior only, because `schema.errorMap(...)` is more local and predictable. For best results, save the previous map with `getErrorMap()` and restore it after temporary overrides.

### `setErrorMap(...) + getErrorMap()`

### Input Markdown

```md
# RUNBOOK: Owner Check

## 1. OWNER

- Email: not-an-email
```

### Schema

```ts
import { md, setErrorMap, getErrorMap } from '@markschema/mdshape'

const markdown = `# RUNBOOK: Owner Check

## 1. OWNER

- Email: not-an-email
`

const previous = getErrorMap()
setErrorMap((issue) => {
  if (issue.code === 'invalid_email') return 'Global map: invalid email'
  return undefined
})

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Email: md.email(),
  }),
})

const result = schema.safeParse(markdown)

setErrorMap(previous)
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











