# min

Type: `heading-text`

Signature: `md.headingText().min(length)`

## What It Is

`md.headingText().min(length)` is used here as a contract-first parser powered by document-level structure checks and boundary constraints for `min` scenarios. With `document()`, `section()`, `headingLevel()`, and `each()` in the schema, 1 h1 heading, 1 h2 section, and 1 h3 subsection is converted into top-level keys `events` without manual `min` post-processing. Error cases report issue codes like `string_too_short`, making operational diagnostics for `min` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for typed markdown parsing with deterministic contracts where deterministic `min` parsing matters more than free-form flexibility. Do not default to it for exploratory drafts that intentionally avoid strict validation around `min`; the main cost is more explicit schema maintenance to keep output deterministic. For best results, compose `md.headingText().min(length)` with `document()`, `section()`, `headingLevel()`, and `each()` so `min` schema intent stays readable and output remains predictable.

### `md.headingText().min(length)`

### Input Markdown

```md
## 3. EVENTS

### ABC

**NARRATION:** Validate signals.
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
        title: md.headingText().min(3),
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
        "title": "ABC"
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
        "code": "string_too_short",
        "path": [
          "events",
          0,
          "title"
        ]
      }
    ]
  }
}
```











