# literal

Type: `literal`

Signature: `md.literal('Zayra')`

## What It Is

`md.literal('Zayra')` parses markdown with document-level structure checks, explicit section targeting, and typed field extraction, so this page defines a strict `literal` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `fields()`, and `literal()` to map 1 h2 section and list content into top-level keys `owner` for this `literal` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `literal` paths.

## When to Use

Use `md.literal('Zayra')` when you need typed markdown parsing with deterministic contracts for `literal` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for exploratory drafts that intentionally avoid strict validation in `literal` documents, because it introduces key-level strictness that improves typing but rejects ad-hoc variations. It pairs well with `document()`, `section()`, `fields()`, and `literal()` to keep `literal` extraction boundaries explicit while preserving typed output for downstream code.

## 1. OWNER

- Company: Zayra
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  owner: md.section('1. OWNER').fields({
    Company: md.literal('Zayra'),
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
      "Company": "Zayra"
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

## Additional Scenarios

### Numeric literal

### Input Markdown

```md
## 1. META

- Version: 1
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  meta: md.section('1. META').fields({
    Version: md.literal(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "Version": 1
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
        "code": "invalid_literal"
      }
    ]
  }
}
```

### literal as discriminant in unions

### Input Markdown

```md
### Step A

**NARRATION:** Validate signals.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const intent = md.discriminatedUnion('type', [
  md.object({ type: md.literal('NARRATION'), text: md.string().min(10) }),
  md.object({ type: md.literal('VISUAL'), text: md.string().min(5) }),
])

const schema = md.section('3. EVENTS').headingLevel(3).each(
  md.object({
    intents: md.match
      .labels(['NARRATION', 'VISUAL'])
      .entries({ nameKey: 'type', contentKey: 'text' })
      .each(intent),
  }),
)
```

### Result

#### Success

```json
{
  "success": true,
  "data": [
    {
      "intents": [
        {
          "type": "NARRATION",
          "text": "Validate signals."
        }
      ]
    }
  ]
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
        "code": "missing_child_heading",
        "message": "Section \"3. EVENTS\" has no child headings",
        "path": [],
        "line": 1,
        "position": {
          "start": {
            "line": 1,
            "column": 1,
            "offset": 0
          },
          "end": {
            "line": 1,
            "column": 13,
            "offset": 12
          }
        }
      }
    ]
  }
}
```




















