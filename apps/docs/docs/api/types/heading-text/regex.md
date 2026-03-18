# regex

Type: `heading-text`

Signature: `md.headingText().regex(pattern)`

## What It Is

This method page uses `md.headingText().regex(pattern)` to enforce document-level structure checks over markdown content in `regex` use cases. In practice, 1 h1 heading, 1 h2 section, and 1 h3 subsection is validated and emitted as top-level keys `events` using `document()`, `section()`, `headingLevel()`, and `each()` under `regex` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `regex` node failed and why.

## When to Use

Apply `md.headingText().regex(pattern)` when your document flow requires typed markdown parsing with deterministic contracts for `regex` and strict schema adherence over permissive parsing. It is less suitable for exploratory drafts that intentionally avoid strict validation under `regex`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `headingLevel()`, and `each()` around `md.headingText().regex(pattern)` to keep `regex` contracts transparent and reduce ambiguity in validation behavior.

### `md.headingText().regex(pattern)`

### Input Markdown

```md
## 3. EVENTS

### [00:00-02:00] - Intake

**NARRATION:** Validate signals.
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
        title: md.headingText().regex(/^\[\d{2}:\d{2}-\d{2}:\d{2}\] - .+$/),
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
        "title": "[00:00-02:00] - Intake"
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



