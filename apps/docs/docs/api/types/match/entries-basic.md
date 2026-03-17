# entries -> basic

Type: `match`

Signature: `labels(...).entries(options)`

## What It Is

This method page uses `labels(...).entries(options)` to enforce document-level structure checks over markdown content in `entries` use cases. In practice, 1 h1 heading is validated and emitted as top-level keys `title` using `document()` and `heading()` under `entries` rules. When constraints are broken, issue codes like `missing_heading` identify exactly which `entries` node failed and why.

## When to Use

Choose `labels(...).entries(options)` for label-oriented parsing from inline markers in prose, especially when `entries` authoring rules must remain stable across teams. Skip it in documents that lack stable labels or marker prefixes workflows for `entries`, since more explicit schema maintenance to keep output deterministic. Combining it with `document()` and `heading()` yields predictable `entries` parsing, clearer errors, and easier runtime integration.

### `labels(...).entries(options)`

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
    .headingLevel(3)
    .each(
      md.object({
        title: md.headingText(),
        facts: md.match.labels(['STATUS', 'SEVERITY']).entries({ nameKey: 'name', contentKey: 'value' }),
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
        "code": "missing_labeled_value",
        "message": "Missing any labeled value for [STATUS, SEVERITY]",
        "path": [
          "events",
          0,
          "facts"
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
