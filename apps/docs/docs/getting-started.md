# Getting Started

## Install

```bash
npm install @markschema/mdshape
```

If you are working inside this monorepo:

```bash
npm install
```

## Minimal Validation Flow

### Input Markdown

```md
# RUNBOOK: First Validation

## 1. OWNER

- Name: Alex Turner
- Email: alex@zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  owner: md.section('1. OWNER').fields({
    Name: md.string().min(3),
    Email: md.email(),
  }),
})

const result = schema.safeParse(markdown)
```

## Parse and handle issues

```ts
if (!result.success) {
  for (const issue of result.error.issues) {
    console.error(issue.code, issue.path, issue.line, issue.message)
  }
}
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: First Validation",
    "owner": {
      "Name": "Alex Turner",
      "Email": "alex@zayra.com"
    }
  }
}
```

#### Error

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

## Where to go next

- [Playground](/playground/) (editable markdown + editable schema)
- [API by Type](/api/)
- [Interactions](/api/interactions/section-composition)
- [Error Handling](/guides/error-handling)



