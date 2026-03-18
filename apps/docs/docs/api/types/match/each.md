# each

Type: `match`

Signature: `entries(...).each(schema)`

## What It Is

`entries(...).each(schema)` is used here as a contract-first parser powered by document-level structure checks for `each` scenarios. With `document()` and `heading()` in the schema, 1 h1 heading is converted into top-level keys `title` without manual `each` post-processing. Error cases report issue codes like `missing_heading`, making operational diagnostics for `each` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for label-oriented parsing from inline markers in prose where deterministic `each` parsing matters more than free-form flexibility. Do not default to it for documents that lack stable labels or marker prefixes around `each`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `entries(...).each(schema)` with `document()` and `heading()` so `each` schema intent stays readable and output remains predictable.

### `entries(...).each(schema)`

### Input Markdown

```md
## 3. EVENTS

### Detection

**STATUS:** ACTIVE

**SEVERITY:** high
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  events: md
    .section('3. EVENTS')
    .subsections(3)
    .each(
      md.object({
        title: md.headingText(),
        facts: md.match
          .labels(['STATUS', 'SEVERITY'])
          .entries({ nameKey: 'name', contentKey: 'value' })
          .each(
            md.object({
              name: md.enum(['STATUS', 'SEVERITY']),
              value: md.string().min(1),
            }),
          ),
      }),
    ),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "title": "Detection",
        "facts": [
          {
            "name": "STATUS",
            "value": "ACTIVE"
          },
          {
            "name": "SEVERITY",
            "value": "high"
          }
        ]
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
        "message": "Missing section \"3. EVENTS\"",
        "path": [
          "events"
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



