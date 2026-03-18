# Error Handling

Use `safeParse` and `error.format(markdown)` to debug validation failures quickly.

## Input Markdown

```md
# RUNBOOK: Error Handling

## 1. OWNER

- Email: alex@zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  owner: md.section('1. OWNER').fields({
    Email: md.email(),
  }),
})

const result = schema.safeParse(markdown)

if (!result.success) {
  const formatted = result.error.format(markdown)
}
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Error Handling",
    "owner": {
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



