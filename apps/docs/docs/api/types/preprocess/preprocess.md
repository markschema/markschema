# preprocess

Type: `preprocess`

Signature: `md.preprocess(fn, schema)`

## What It Is

`md.preprocess(fn, schema)` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `preprocess` contract instead of permissive text scraping. The schema combines operators such as `preprocess()`, `boolean()`, `document()`, and `section()` to map 1 h2 section and list content into top-level keys `meta` for this `preprocess` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `preprocess` paths.

## When to Use

Use `md.preprocess(fn, schema)` when you need typed markdown parsing with deterministic contracts for `preprocess` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `preprocess` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `preprocess()`, `boolean()`, `document()`, and `section()` to keep `preprocess` extraction boundaries explicit while preserving typed output for downstream code.

### `md.preprocess(fn, schema)`

### Input Markdown

```md
## 1. META

- Enabled: 1
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const enabledSchema = md.preprocess(
  (value) => value === '1' ? true : value,
  md.boolean(),
)

const schema = md.document({
  meta: md.section('1. META').fields({
    Enabled: enabledSchema,
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
      "Enabled": true
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

## Additional Scenarios

### preprocess + typed output schema

### Input Markdown

```md
## 1. META

- Score: 7
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const scoreSchema = md.preprocess(
  (value) => Number(value),
  md.number().int().min(0).max(10),
)

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: scoreSchema,
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

### preprocess with custom error options

### Input Markdown

```md
## 1. META

- Score: 5
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const scoreSchema = md.preprocess(
  (value) => {
    if (value === 'x') throw new Error('unsupported score')
    return Number(value)
  },
  md.number(),
  {
    code: 'transform_failed',
    message: 'Preprocess: score conversion failed',
  },
)

const schema = md.document({
  meta: md.section('1. META').fields({
    Score: scoreSchema,
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
      "Score": 5
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





