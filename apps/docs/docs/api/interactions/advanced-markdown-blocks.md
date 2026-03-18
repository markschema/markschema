# Interaction: advanced markdown blocks

This interaction demonstrates how advanced block extractors behave together under explicit block ordering.

## Input Markdown

```md
## 9. ADVANCED BLOCK

Evidence summary for the weekly review.

[Design Spec](https://example.com/spec "Spec")

<https://example.com/status>

![Architecture](https://example.com/architecture.png "Pipeline")

| Metric | Target |
| --- | --- |
| Precision | >= 0.92 |

> Feature freshness sets the upper bound for decision quality.

~~~ts
const pipeline = ['ingestion', 'scoring', 'policy']
~~~
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const advanced = md
  .section('9. ADVANCED BLOCK')

const schema = md.document({
  advanced: md.object({
    links: advanced.links(md.object({ text: md.string().min(3), url: md.url(), title: md.string().optional() })).min(1),
    autolinks: advanced.autolinks(md.object({ text: md.string(), url: md.url() })).min(1),
    images: advanced.images(md.object({ alt: md.string(), url: md.url(), title: md.string().optional() })).min(1),
    tables: advanced.tables(md.object({ headers: md.list(md.string()).min(2), rows: md.list(md.list(md.string()).min(2)).min(1) })).min(1),
    quotes: advanced.blockquotes(md.object({ text: md.string().min(10) })).min(1),
    code: advanced.code(md.object({ language: md.string().optional(), code: md.string().min(10) })).min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "advanced": {
      "links": [
        {
          "text": "Design Spec",
          "url": "https://example.com/spec",
          "title": "Spec"
        },
        {
          "text": "https://example.com/status",
          "url": "https://example.com/status"
        }
      ],
      "autolinks": [
        {
          "text": "https://example.com/status",
          "url": "https://example.com/status"
        }
      ],
      "images": [
        {
          "alt": "Architecture",
          "url": "https://example.com/architecture.png",
          "title": "Pipeline"
        }
      ],
      "tables": [
        {
          "headers": [
            "Metric",
            "Target"
          ],
          "rows": [
            [
              "Precision",
              ">= 0.92"
            ]
          ]
        }
      ],
      "quotes": [
        {
          "text": "Feature freshness sets the upper bound for decision quality."
        }
      ],
      "code": [
        {
          "language": "ts",
          "code": "const pipeline = ['ingestion', 'scoring', 'policy']"
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
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "advanced",
          "links"
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
          "autolinks"
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
          "quotes"
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
          "code"
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



