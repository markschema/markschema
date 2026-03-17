# fields

Type: `section`

Signature: `section().fields(shape, options?)`

## What It Is

`section().fields(shape, options?)` is used here as a contract-first parser powered by document-level structure checks, explicit section targeting, and typed field extraction for `fields` scenarios. With `document()`, `section()`, `fields()`, and `string()` in the schema, 1 h1 heading, 1 h2 section, and list content is converted into top-level keys `owner` without manual `fields` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `fields` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `fields` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `fields`; the main cost is key-level strictness that improves typing but rejects ad-hoc variations. For best results, compose `section().fields(shape, options?)` with `document()`, `section()`, `fields()`, and `string()` so `fields` schema intent stays readable and output remains predictable.

### `section().fields(shape, options?)`

### Input Markdown

```md
## 1. OWNER

- Name: Alex Turner
- Email: alex@zayra.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Name: md.string().min(3),
    Email: md.email(),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "owner": {
      "Name": "Alex Turner",
      "Email": "alex@zayra.com"
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
        "code": "missing_section",
        "message": "Missing section \"1. OWNER\"",
        "path": [
          "owner"
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

## Case Sensitivity

`fields` is case-insensitive by default.

- Markdown key `Service` matches schema key `service`
- Markdown key `SERVICE` also matches schema key `service`

If you need strict matching, pass `{ caseInsensitive: false }`:

```ts
const schema = md.document({
  owner: md.section('1. OWNER').fields(
    {
      service: md.string(),
    },
    { caseInsensitive: false },
  ),
})
```

See also: [caseInsensitive](/api/aux/case-insensitive)



















