# Interaction: section + fields/list/paragraphs/sequence/blockOrder

## Input Markdown

```md
## 3. OPERATIONAL GOALS

This runbook targets these outcomes.

- Reduce fraud loss
- Improve precision

## 9. ADVANCED BLOCK

Text block.

![Diagram](https://example.com/a.png)
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const goalsSection = md.section('3. OPERATIONAL GOALS').blockOrder(['paragraph', 'list'])
const advancedSection = md.section('9. ADVANCED BLOCK').blockOrder(['paragraph', 'image'])

const schema = md.document({
  goals: md.object({
    description: goalsSection.paragraphs([md.string().min(10)]),
    items: goalsSection.list(md.string()).min(2),
  }),
  advanced: md.object({
    paragraphs: advancedSection.paragraphs([md.string().min(5)]),
    images: advancedSection.images(md.object({ alt: md.string(), url: md.url() })).min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "goals": {
      "description": [
        "This runbook targets these outcomes."
      ],
      "items": [
        "Reduce fraud loss",
        "Improve precision"
      ]
    },
    "advanced": {
      "paragraphs": [
        "Text block."
      ],
      "images": [
        {
          "alt": "Diagram",
          "url": "https://example.com/a.png"
        }
      ]
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
        "message": "Missing section \"3. OPERATIONAL GOALS\"",
        "path": [
          "goals",
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
        "message": "Missing section \"3. OPERATIONAL GOALS\"",
        "path": [
          "goals",
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



