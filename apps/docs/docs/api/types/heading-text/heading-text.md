# headingText

Type: `heading-text`

Signature: `md.headingText()`

## What It Is

`md.headingText()` parses markdown with document-level structure checks, so this page defines a strict `heading text` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `headingLevel()`, and `each()` to map 1 h1 heading, 1 h2 section, and 1 h3 subsection into top-level keys `events` for this `heading text` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `heading text` paths.

## When to Use

Use `md.headingText()` when you need typed markdown parsing with deterministic contracts for `heading text` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `heading text` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `headingLevel()`, and `each()` to keep `heading text` extraction boundaries explicit while preserving typed output for downstream code.

### `md.headingText()`

### Input Markdown

```md
## 3. EVENTS

### Step A

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
        title: md.headingText(),
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
        "title": "Step A"
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


















