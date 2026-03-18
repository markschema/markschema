# code

Type: `section`

Signature: `section().code(schema).min(...)`

## What It Is

`section().code(schema).min(...)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and boundary constraints for `code` scenarios. With `document()`, `section()`, `code()`, and `object()` in the schema, 1 h1 heading, 1 h2 section, and code fences is converted into top-level keys `codes` without manual `code` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `code` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `code` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `code`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `section().code(schema).min(...)` with `document()`, `section()`, `code()`, and `object()` so `code` schema intent stays readable and output remains predictable.

### `section().code(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

~~~ts
const ready = true
~~~
```

```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  codes: md
    .section('9. ADVANCED BLOCK')
    .code(md.object({ language: md.literal('ts'), code: md.string().min(5) }))
    .min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "codes": [
      {
        "language": "ts",
        "code": "const ready = true"
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
          "codes"
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



