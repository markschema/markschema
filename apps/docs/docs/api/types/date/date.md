# date

Type: `date`

Signature: `md.date()`

## What It Is

`md.date()` parses strict ISO datetime input and returns a `Date` object by default. The schema combines operators such as `document()`, `section()`, `fields()`, and `date()` to map 1 h1 heading, 1 h2 section, and list content into top-level keys `meta` for this `date` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `date` paths.

## When to Use

Use `md.date()` when your markdown field stores an ISO datetime and downstream code should receive a real `Date`. Avoid it when the source format is date-only text such as `2026-03-10`, because `md.date({ input: 'date-only' })` is a better fit for that contract. It pairs well with `document()`, `section()`, `fields()`, and `date()` to keep `date` extraction boundaries explicit while preserving typed output for downstream code.

### `md.date()`

### Input Markdown

```md
## 1. META

- StartAt: 2026-03-10T12:00:00.000Z
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    StartAt: md.date(),
  }),
})
```

### Output Behavior

`md.date()` is equivalent to `md.date({ input: 'iso', output: 'date' })`.

### Supported Combinations

```ts
md.date({ input: 'iso', output: 'date' })
md.date({ input: 'iso', output: 'date-only' })
md.date({ input: 'date-only', output: 'date' })
md.date({ input: 'date-only' }) // returns YYYY-MM-DD string
md.date({ input: 'timestamp', output: 'date' }) // timestamp -> Date
md.date({ input: 'timestamp' }) // returns timestamp (ms)
md.date() // equivalent to { input: 'iso', output: 'date' }
md.date({ output: 'iso' }) // ISO input, ISO string output
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "StartAt": "2026-03-10T12:00:00.000Z"
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















