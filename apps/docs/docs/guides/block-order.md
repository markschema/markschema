# Guide: blockOrder

`blockOrder` validates block ordering inside a section.

## Example

### Input Markdown

```md
## 9. ADVANCED BLOCK

Block summary text.

![Diagram](https://example.com/diagram.png)

| Category | Value |
| --- | --- |
| Security | High |

~~~ts
const ready = true
~~~
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const advancedSection = md.section('9. ADVANCED BLOCK').blockOrder(
  ['paragraph', 'image', 'table', 'code'],
  { mode: 'sequence', allowRepeats: true, allowUnlisted: true },
)

const BlockOrderSchema = md.document({
  advanced: md.object({
    paragraphs: advancedSection.paragraphs([md.string().min(5)]),
    images: advancedSection.images(md.object({ alt: md.string(), url: md.url() })).min(1),
    tables: advancedSection
      .tables(
        md.object({
          headers: md.array(md.string()).min(2),
          rows: md.array(md.array(md.string()).min(2)).min(1),
        }),
      )
      .min(1),
    codes: advancedSection
      .code(md.object({ code: md.string().min(5), language: md.string().optional() }))
      .min(1),
  }),
})

const schema = BlockOrderSchema
```

### Result

#### Success
```json
{
  "success": true,
  "data": {
    "advanced": {
      "paragraphs": [
        "Block summary text."
      ],
      "images": [
        {
          "alt": "Diagram",
          "url": "https://example.com/diagram.png"
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
          "code": "const ready = true",
          "language": "ts"
        }
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "advanced",
          "paragraphs"
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "advanced",
          "images"
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "advanced",
          "tables"
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "advanced",
          "codes"
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

- Right: `allowUnlisted: true` when your markdown contains additional inline node types.
- Wrong: `allowUnlisted: false` without listing `link`, `referenceLink`, `autolink`, and `htmlInline`.

Common error: using `mode: 'sequence'` for content that changes frequently across documents.











