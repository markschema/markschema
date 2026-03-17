# taskList

Type: `section`

Signature: `section().taskList(schema).min(...)`

## What It Is

This method page uses `section().taskList(schema).min(...)` to enforce document-level structure checks, explicit section targeting, and boundary constraints over markdown content in `task list` use cases. In practice, 1 h1 heading, 1 h2 section, and list content is validated and emitted as top-level keys `tasks` using `document()`, `section()`, `taskList()`, and `object()` under `task list` rules. When constraints are broken, issue codes like `missing_section` identify exactly which `task list` node failed and why.

## When to Use

Choose `section().taskList(schema).min(...)` for section-scoped extraction where headings anchor each data slice, especially when `task list` authoring rules must remain stable across teams. Skip it in free-form notes with unstable section names workflows for `task list`, since more explicit schema maintenance to keep output deterministic. Combining it with `document()`, `section()`, `taskList()`, and `object()` yields predictable `task list` parsing, clearer errors, and easier runtime integration.

### `section().taskList(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

- [x] Baseline complete
- [ ] Add reranker
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tasks: md.section('9. ADVANCED BLOCK').taskList(md.object({ text: md.string(), checked: md.boolean() })).min(2),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "text": "Baseline complete",
        "checked": true
      },
      {
        "text": "Add reranker",
        "checked": false
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
          "tasks"
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



















