# Section API

## Key methods

- `fields({...})`
- `paragraph()`
- `paragraphs([schemaA, schemaB, ...])`
- `list(itemSchema)`
- `headingLevel(depth).each(schema)`
- `blockOrder(order, options)`
- advanced blocks: `tables`, `blockquotes`, `code`, `links`, `images`, `footnotes`, etc.

## Example

### Input Markdown

```md
## 3. LEARNING OBJECTIVES

By the end of this lesson, you will be able to:

- Compare architecture patterns
- Evaluate key trade-offs
- Define a migration strategy
- Communicate design decisions
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const objectivesSection = md
  .section('3. LEARNING OBJECTIVES')
  .blockOrder(['paragraph', 'list'], {
    mode: 'sequence',
    allowRepeats: true,
    allowUnlisted: true,
  })

const SectionSchema = md.document({
  objectives: md.object({
    description: objectivesSection.paragraphs([md.string().min(20)]),
    items: objectivesSection.list(md.string()).min(4),
  }),
})

const schema = SectionSchema
```

### Result

#### Success
```json
{
  "success": true,
  "data": {
    "objectives": {
      "description": [
        "By the end of this lesson, you will be able to:"
      ],
      "items": [
        "Compare architecture patterns",
        "Evaluate key trade-offs",
        "Define a migration strategy",
        "Communicate design decisions"
      ]
    }
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
        "message": "Missing section \"3. LEARNING OBJECTIVES\"",
        "path": [
          "objectives",
          "description"
        ],
        "line": 1,
        "position": {
          "start": {
            "line": 1,
            "column": 1
          }
        }
      },
      {
        "code": "missing_section",
        "message": "Missing section \"3. LEARNING OBJECTIVES\"",
        "path": [
          "objectives",
          "items"
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

## Right vs Wrong

- Right: use `fields(...)` for `Key: Value` sections.
- Wrong: use `list(...)` when you need key-level validation.











