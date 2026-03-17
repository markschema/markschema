# Interaction: blockOrder options

This page compares all `blockOrder` options using concrete cases.

## Scenario 1: `mode: 'relative'` (default)

### Input Markdown

```md
## 9. RELEASE BLOCK

Release scope is stable.

Rollback path is documented.

![Plan](https://example.com/release-plan.png)
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const section = md.section('9. RELEASE BLOCK').blockOrder(['paragraph', 'image'])

const schema = md.document({
  release: md.object({
    paragraphs: section.paragraphs([md.string().min(10), md.string().min(10)]),
    images: section.images(md.object({ alt: md.string(), url: md.url() })).min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "release": {
      "paragraphs": [
        "Release scope is stable.",
        "Rollback path is documented."
      ],
      "images": [
        {
          "alt": "Plan",
          "url": "https://example.com/release-plan.png"
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
        "message": "Missing section \"9. RELEASE BLOCK\"",
        "path": [
          "release",
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
        "message": "Missing section \"9. RELEASE BLOCK\"",
        "path": [
          "release",
          "images"
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

## Scenario 2: `mode: 'sequence'`

### Input Markdown

```md
## 9. RUN ORDER

Context for the run.

![Pipeline](https://example.com/pipeline.png)

| Stage | Status |
| --- | --- |
| Intake | Ready |
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const section = md.section('9. RUN ORDER').blockOrder(['paragraph', 'image', 'table'], {
  mode: 'sequence',
})

const schema = md.document({
  run: md.object({
    paragraphs: section.paragraphs([md.string().min(5)]),
    images: section.images(md.object({ alt: md.string(), url: md.url() })).min(1),
    tables: section
      .tables(
        md.object({
          headers: md.list(md.string()).min(2),
          rows: md.list(md.list(md.string()).min(2)).min(1),
        }),
      )
      .min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "run": {
      "paragraphs": [
        "Context for the run."
      ],
      "images": [
        {
          "alt": "Pipeline",
          "url": "https://example.com/pipeline.png"
        }
      ],
      "tables": [
        {
          "headers": [
            "Stage",
            "Status"
          ],
          "rows": [
            [
              "Intake",
              "Ready"
            ]
          ]
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
        "message": "Missing section \"9. RUN ORDER\"",
        "path": [
          "run",
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
        "message": "Missing section \"9. RUN ORDER\"",
        "path": [
          "run",
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
        "message": "Missing section \"9. RUN ORDER\"",
        "path": [
          "run",
          "tables"
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

## Scenario 3: `allowRepeats: false`

### Input Markdown

```md
## 9. POLICY BLOCK

Primary policy statement.

Secondary policy statement.

![Policy Diagram](https://example.com/policy.png)
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const section = md.section('9. POLICY BLOCK').blockOrder(['paragraph', 'image'], {
  allowRepeats: false,
})

const schema = md.document({
  policy: md.object({
    paragraphs: section.paragraphs([md.string().min(5), md.string().min(5)]),
    images: section.images(md.object({ alt: md.string(), url: md.url() })).min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "policy": {
      "paragraphs": [
        "Primary policy statement.",
        "Secondary policy statement."
      ],
      "images": [
        {
          "alt": "Policy Diagram",
          "url": "https://example.com/policy.png"
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
        "code": "block_repeat_not_allowed",
        "path": [
          "policy",
          "paragraphs"
        ]
      }
    ]
  }
}
```

## Scenario 4: `allowUnlisted: false`

### Input Markdown

```md
## 9. HARDENED BLOCK

Deterministic ordering must be strict.

See [Policy](https://example.com/policy).

![Diagram](https://example.com/hardened.png)
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const section = md.section('9. HARDENED BLOCK').blockOrder(['paragraph', 'image'], {
  allowUnlisted: false,
})

const schema = md.document({
  hardened: md.object({
    paragraphs: section.paragraphs([md.string().min(5)]),
    images: section.images(md.object({ alt: md.string(), url: md.url() })).min(1),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "hardened": {
      "paragraphs": [
        "Deterministic ordering must be strict."
      ],
      "images": [
        {
          "alt": "Diagram",
          "url": "https://example.com/hardened.png"
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
        "code": "block_order_mismatch",
        "path": [
          "hardened",
          "paragraphs"
        ]
      }
    ]
  }
}
```



















