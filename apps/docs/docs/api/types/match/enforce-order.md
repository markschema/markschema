# enforceOrder

Type: `match`

Signature: `labels(...).values(...).enforceOrder(...)`

## What It Is

`labels(...).values(...).enforceOrder(...)` is used here as a contract-first parser powered by document-level structure checks for `enforce order` scenarios. With `document()` and `heading()` in the schema, 1 h1 heading is converted into top-level keys `title` without manual `enforce order` post-processing. Error cases report issue codes like `missing_heading`, making operational diagnostics for `enforce order` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for label-oriented parsing from inline markers in prose where deterministic `enforce order` parsing matters more than free-form flexibility. Do not default to it for documents that lack stable labels or marker prefixes around `enforce order`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `labels(...).values(...).enforceOrder(...)` with `document()` and `heading()` so `enforce order` schema intent stays readable and output remains predictable.

### `labels(...).values(...).enforceOrder(...)`

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
        facts: md
          .match.labels(['STATUS', 'SEVERITY'])
          .values(md.string().min(1))
          .enforceOrder({ order: ['STATUS', 'SEVERITY'], allowRepeats: false }),
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
          "ACTIVE",
          "high"
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



