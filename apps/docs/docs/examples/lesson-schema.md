# Full Example: Lesson Schema

This example follows the same style as `src/example/index.ts`, but uses shorter focused snippets.

## End-to-end example

### Input Markdown

```md
# LESSON: Principles of Web3 Decentralization

## 2. SUBTITLE

Decentralization in Web3: architecture, consensus, and trade-offs.

## 3. LEARNING OBJECTIVES

By the end of this lesson, you will be able to:

- Compare architecture models
- Explain consensus basics
- Evaluate trade-offs
- Apply a decision framework

## 9. ADVANCED BLOCK

Advanced block summary with enough context.

![Architecture](https://example.com/architecture.png)

| Category | Value |
| --- | --- |
| Security | High |

~~~ts
const trilemma = ['security', 'speed', 'decentralization']
~~~
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

const advancedSection = md
  .section('9. ADVANCED BLOCK')
  .blockOrder(['paragraph', 'image', 'table', 'code'], {
    mode: 'sequence',
    allowRepeats: true,
    allowUnlisted: true,
  })

const LessonSchema = md.document({
  title: md.heading(1).regex(/^LESSON:\s.+/),
  subtitle: md.section('2. SUBTITLE').paragraphs([md.string().min(20)]),
  objectives: md.object({
    description: objectivesSection.paragraphs([md.string().min(20)]),
    items: objectivesSection.list(md.string()).min(4),
  }),
  advanced: md.object({
    paragraphs: advancedSection.paragraphs([md.string().min(20)]),
    images: advancedSection
      .images(
        md.object({
          alt: md.string(),
          url: md.url(),
          title: md.string().optional(),
        }),
      )
      .min(1),
    tables: advancedSection
      .tables(
        md.object({
          headers: md.array(md.string()).min(2),
          rows: md.array(md.array(md.string()).min(2)).min(1),
        }),
      )
      .min(1),
    codes: advancedSection
      .code(
        md.object({
          code: md.string().min(10),
          language: md.string().optional(),
        }),
      )
      .min(1),
  }),
})

const schema = LessonSchema
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "LESSON: Principles of Web3 Decentralization",
    "subtitle": [
      "Decentralization in Web3: architecture, consensus, and trade-offs."
    ],
    "objectives": {
      "description": [
        "By the end of this lesson, you will be able to:"
      ],
      "items": [
        "Compare architecture models",
        "Explain consensus basics",
        "Evaluate trade-offs",
        "Apply a decision framework"
      ]
    },
    "advanced": {
      "paragraphs": [
        "Advanced block summary with enough context."
      ],
      "images": [
        {
          "alt": "Architecture",
          "url": "https://example.com/architecture.png"
        }
      ],
      "tables": [
        {
          "headers": [
            "Category",
            "Value"
          ],
          "rows": [
            [
              "Security",
              "High"
            ]
          ]
        }
      ],
      "codes": [
        {
          "code": "const trilemma = ['security', 'speed', 'decentralization']",
          "language": "ts"
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

## Right use case

- Use `blockOrder(...)` when the document structure is predictable.
- Use `paragraphs([...])` for positional paragraph validation.

## Wrong use case

- Enable `allowUnlisted: false` without listing inline types present in real text.


