# Interaction: object unknown-key policies

This interaction contrasts strict and passthrough unknown-key behavior on the same markdown section.
Parser limitation: `section().fields(...)` only outputs declared field keys, so this scenario uses a JSON `Payload` field to preserve unknown keys for `object().strict()`.

## Input Markdown

```md
# RUNBOOK: Object Policies

## 0. META

- Payload: {"service":"fraud-api","owner":"risk-platform"}
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const strictConfig = md.object({
  service: md.string().min(3),
  owner: md.string().min(3),
}).strict()

const schema = md.document({
  title: md.heading(1),
  config: md.section('0. META').fields({
    Payload: md.preprocess((value) => JSON.parse(String(value)), strictConfig),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Policies",
    "config": {
      "Payload": {
        "service": "fraud-api",
        "owner": "risk-platform"
      }
    }
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
        "code": "missing_heading",
        "message": "Missing heading with depth 1",
        "path": [
          "title"
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



