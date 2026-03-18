# value

Type: `match`

Signature: `match.label(name).value(schema)`

## What It Is

`match.label(name).value(schema)` parses markdown with document-level structure checks, so this page defines a strict `value` contract instead of permissive text scraping. The schema combines operators such as `document()` and `heading()` to map 1 h1 heading into top-level keys `title` for this `value` behavior. If parsing fails, the result carries issue codes like `missing_heading`, giving the caller precise debugging context for `value` paths.

## When to Use

Use `match.label(name).value(schema)` when you need label-oriented parsing from inline markers in prose for `value` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for documents that lack stable labels or marker prefixes in `value` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()` and `heading()` to keep `value` extraction boundaries explicit while preserving typed output for downstream code.

### `match.label(name).value(schema)`

### Input Markdown

```md
## 3. EVENTS

### Detection

**STATUS:** ACTIVE
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
        status: md.match.label('STATUS').value(md.enum(['ACTIVE', 'PAUSED'])),
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
        "status": "ACTIVE"
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



