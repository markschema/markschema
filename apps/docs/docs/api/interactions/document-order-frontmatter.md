# Interaction: document ordered + body sections

## Input Markdown

```md
# RUNBOOK: Fraud Runbook

## 0. META

- Title: Fraud Runbook
- Version: 1

## 1. FIRST

first section

## 2. SECOND

second section
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  meta: md.section('0. META').fields({
    Title: md.string(),
    Version: md.coerce.number(),
  }),
  first: md.section('1. FIRST').paragraph(),
  second: md.section('2. SECOND').paragraph(),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Fraud Runbook",
    "meta": {
      "Title": "Fraud Runbook",
      "Version": 1
    },
    "first": "first section",
    "second": "second section"
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













