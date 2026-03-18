# Guide: paragraph() vs paragraphs([...])

## Case 1: `paragraph()`

Use this when the entire section should become one aggregated text.

### Input Markdown

```md
## 4. DESCRIPTION

This is the first paragraph.

This is the second paragraph.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const AggregatedSchema = md.document({
  description: md.section('4. DESCRIPTION').paragraph().min(20),
})

const schema = AggregatedSchema
```

### Result

#### Success
```json
{
  "success": true,
  "data": {
    "description": "This is the first paragraph.\n\nThis is the second paragraph."
  }
}
```
```

#### Error
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"4. DESCRIPTION\"",
        "path": [
          "description"
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
```

## Case 2: `paragraphs([...])`

Use this when each paragraph has its own positional rule.

### Input Markdown

```md
## 9. ADVANCED BLOCK

First paragraph with enough context.

Second paragraph with longer details and constraints.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const PositionalSchema = md.document({
  advanced: md.section('9. ADVANCED BLOCK').paragraphs([
    md.string().min(20),
    md.string().min(30),
  ]),
})

const schema = PositionalSchema
```

### Result

#### Success
```json
{
  "success": true,
  "data": {
    "advanced": [
      "First paragraph with enough context.",
      "Second paragraph with longer details and constraints."
    ]
  }
}
```
```

#### Error
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "advanced"
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
```

## Common error

Expecting `paragraph()` to validate each paragraph independently.




