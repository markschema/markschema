# Interaction: sequence and each

This page shows every `sequence` flow currently supported by section builders.

## Scenario 1: Timeline scenes (`headingLevel(...).sequence([...]).each(...)`)

### Input Markdown

```md
## 5. EXECUTION TIMELINE

### [00:00-02:00] - Intake

**Classification:** TIME_BOUND

**NARRATION:** Validate incident payload quality before escalation.

### [02:00-04:00] - Containment

**Classification:** TIMELESS

**NARRATION:** Isolate high-risk traffic and confirm rollback policy.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const sceneSchema = md.object({
  title: md.headingText(),
  classification: md.match.label('Classification').value(md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])),
  narration: md.match.label('NARRATION').value(md.string().min(20)),
})

const schema = md.document({
  scenes: md
    .section('5. EXECUTION TIMELINE')
    .headingLevel(3)
    .sequence(['[00:00-02:00] - Intake', '[02:00-04:00] - Containment'])
    .each(sceneSchema)
    .min(2),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "scenes": [
      {
        "title": "[00:00-02:00] - Intake",
        "classification": "TIME_BOUND",
        "narration": "Validate incident payload quality before escalation."
      },
      {
        "title": "[02:00-04:00] - Containment",
        "classification": "TIMELESS",
        "narration": "Isolate high-risk traffic and confirm rollback policy."
      }
    ]
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
        "message": "Missing section \"5. EXECUTION TIMELINE\"",
        "path": [
          "scenes"
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

## Scenario 2: Tools subsections (`headingLevel(...).sequence([...]).each(...)`)

### Input Markdown

```md
## 6. TOOLS AND ARTIFACTS

### Operational Tools

- Kafka
- Flink

### Frameworks and Templates

- Response matrix
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tools: md
    .section('6. TOOLS AND ARTIFACTS')
    .headingLevel(3)
    .sequence(['Operational Tools', 'Frameworks and Templates'])
    .each(
      md.object({
        title: md.headingText(),
        items: md.block.list(md.string()).min(1),
      }),
    )
    .min(2),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "title": "Operational Tools",
        "items": [
          "Kafka",
          "Flink"
        ]
      },
      {
        "title": "Frameworks and Templates",
        "items": [
          "Response matrix"
        ]
      }
    ]
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
        "message": "Missing section \"6. TOOLS AND ARTIFACTS\"",
        "path": [
          "tools"
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

## Scenario 3: Ordered fields (`fields(...).sequence([...])`)

### Input Markdown

```md
## 7. TAGS

- Pillar: operate
- Track: response
- Topics: escalation, monitoring
- Level: advanced
- Persona: sre
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  tags: md
    .section('7. TAGS')
    .fields({
      Pillar: md.string(),
      Track: md.string(),
      Topics: md.string(),
      Level: md.string(),
      Persona: md.string(),
    })
    .sequence(['Pillar', 'Track', 'Topics', 'Level', 'Persona']),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "tags": {
      "Pillar": "operate",
      "Track": "response",
      "Topics": "escalation, monitoring",
      "Level": "advanced",
      "Persona": "sre"
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
        "message": "Missing section \"7. TAGS\"",
        "path": [
          "tags"
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

## Scenario 4: Regex sequence (`headingLevel(...).sequence([RegExp]).each(...)`)

### Input Markdown

```md
## 5. DEPLOYMENT WINDOW

### [00:00-02:00] - Prepare

**NARRATION:** Freeze write traffic and verify preflight checks.

### [02:00-04:00] - Execute

**NARRATION:** Run deployment and monitor rollback triggers.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  steps: md
    .section('5. DEPLOYMENT WINDOW')
    .headingLevel(3)
    .sequence([/^\[\d{2}:\d{2}-\d{2}:\d{2}\] - .+$/, /^\[\d{2}:\d{2}-\d{2}:\d{2}\] - .+$/])
    .each(
      md.object({
        title: md.headingText(),
        narration: md.match.label('NARRATION').value(md.string().min(20)),
      }),
    )
    .min(2),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "steps": [
      {
        "title": "[00:00-02:00] - Prepare",
        "narration": "Freeze write traffic and verify preflight checks."
      },
      {
        "title": "[02:00-04:00] - Execute",
        "narration": "Run deployment and monitor rollback triggers."
      }
    ]
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
        "message": "Missing section \"5. DEPLOYMENT WINDOW\"",
        "path": [
          "steps"
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


































