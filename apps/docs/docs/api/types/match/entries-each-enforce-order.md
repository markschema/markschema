# entries + each + enforceOrder

Type: `match`

Signature: `entries/each + enforceOrder(...)`

## What It Is

This method page uses `entries/each + enforceOrder(...)` to enforce document-level structure checks over markdown content in `entries each enforce order` use cases. In practice, 1 h1 heading is validated and emitted as top-level keys `title` using `document()` and `heading()` under `entries each enforce order` rules. When constraints are broken, issue codes like `missing_heading` identify exactly which `entries each enforce order` node failed and why.

## When to Use

Apply `entries/each + enforceOrder(...)` when your document flow requires label-oriented parsing from inline markers in prose for `entries each enforce order` and strict schema adherence over permissive parsing. It is less suitable for documents that lack stable labels or marker prefixes under `entries each enforce order`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()` and `heading()` around `entries/each + enforceOrder(...)` to keep `entries each enforce order` contracts transparent and reduce ambiguity in validation behavior.

### `entries/each + enforceOrder(...)`

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
        facts: md.match
          .labels(['STATUS', 'SEVERITY'])
          .entries({ nameKey: 'name', contentKey: 'value' })
          .each(
            md.object({
              name: md.enum(['STATUS', 'SEVERITY']),
              value: md.string().min(1),
            }),
          )
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
        "code": "label_order_mismatch",
        "message": "Label \"STATUS\" is out of expected order",
        "path": [
          "events",
          0,
          "facts",
          1
        ],
        "line": 7,
        "position": {
          "start": {
            "line": 7,
            "column": 1
          }
        }
      }
    ]
  }
}
```








