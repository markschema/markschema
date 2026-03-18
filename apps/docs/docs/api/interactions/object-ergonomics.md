# Interaction: object ergonomics

This interaction shows how object helpers can be composed after section field extraction.

## Input Markdown

```md
# RUNBOOK: Object Ergonomics

## 0. META

- service: fraud-api
- owner: risk-platform
- region: us-east-1
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const base = md.object({
  service: md.string().min(3),
  owner: md.string().min(3),
})

const ergonomic = base.extend({
  region: md.string().min(3),
})

const schema = md.document({
  title: md.heading(1),
  config: md
    .section('0. META')
    .fields({
      service: md.string().min(3),
      owner: md.string().min(3),
      region: md.string().min(3),
    })
    .pipeline(ergonomic),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Ergonomics",
    "config": {
      "service": "fraud-api",
      "owner": "risk-platform",
      "region": "us-east-1"
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



