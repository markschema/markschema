# htmlBlocks

Type: `section`

Signature: `section().htmlBlocks(schema).min(...)`

## What It Is

On this page, `section().htmlBlocks(schema).min(...)` centers on document-level structure checks, explicit section targeting, and boundary constraints to keep `html blocks` parsing deterministic and schema-driven. The example expects 1 h1 heading and 1 h2 section and returns top-level keys `htmlBlocks` directly from the declared `html blocks` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `html blocks` failure handling explicit.

## When to Use

Choose `section().htmlBlocks(schema).min(...)` for section-scoped extraction where headings anchor each data slice, especially when `html blocks` authoring rules must remain stable across teams. Skip it in free-form notes with unstable section names workflows for `html blocks`, since more explicit schema maintenance to keep output deterministic. Combining it with `document()`, `section()`, `htmlBlocks()`, and `object()` yields predictable `html blocks` parsing, clearer errors, and easier runtime integration.

### `section().htmlBlocks(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

<div class="note">HTML block example</div>
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  htmlBlocks: md.section('9. ADVANCED BLOCK').htmlBlocks(md.object({ text: md.string().includes('HTML block') })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "htmlBlocks": [
      {
        "text": "<div class=\"note\">HTML block example</div>"
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
          "htmlBlocks"
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



