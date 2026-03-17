# End-to-End Example: Risk Control Matrix (Complex)

This example combines `section.fields.sequence`, `union`, `coerce`, and strict object policy to validate an operational risk matrix.

## Input Markdown

```md
# GUIDE: Risk Control Matrix

## 0. META

title: Risk Control Matrix
version: 3

## 1. GOVERNANCE

- Owner: Platform Risk
- Channel: fraud-critical
- SLA: 15

## 2. CONTROLS

### Velocity Guard

**STATUS:** ACTIVE
**THRESHOLD:** 0.85
**ACTION:** BLOCK

### Device Reputation Guard

**STATUS:** DRAFT
**THRESHOLD:** 0.70
**ACTION:** REVIEW
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const controlSchema = md.object({
  title: md.headingText(),
  status: md.match.label('STATUS').value(md.union([md.literal('ACTIVE'), md.literal('DRAFT')])),
  threshold: md.match.label('THRESHOLD').value(md.coerce.number().pipeline(md.number().min(0).max(1))),
  action: md.match.label('ACTION').value(md.enum(['BLOCK', 'REVIEW', 'ALLOW'])),
})

const schema = md.document({
  meta: md.section('0. META').fields({
    title: md.string().min(5),
    version: md.coerce.number().pipeline(md.number().int().min(1)),
  }),
  title: md.heading(1).regex(/^GUIDE:\s.+/),
  governance: md
    .section('1. GOVERNANCE')
    .fields({
      Owner: md.string().min(3),
      Channel: md.string().startsWith('fraud-'),
      SLA: md.coerce.number().pipeline(md.number().int().min(1)),
    })
    .sequence(['Owner', 'Channel', 'SLA']),
  controls: md.section('2. CONTROLS').subsections(3).each(controlSchema).min(2),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "GUIDE: Risk Control Matrix",
    "governance": {
      "Owner": "Platform Risk",
      "Channel": "fraud-critical",
      "SLA": 15
    },
    "controls": [
      {
        "title": "Velocity Guard",
        "status": "ACTIVE",
        "threshold": 0.85,
        "action": "BLOCK"
      },
      {
        "title": "Device Reputation Guard",
        "status": "DRAFT",
        "threshold": 0.7,
        "action": "REVIEW"
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
        "code": "field_order_mismatch",
        "path": [
          "governance"
        ]
      },
      {
        "code": "invalid_enum_value",
        "path": [
          "controls",
          1,
          "action"
        ]
      }
    ]
  }
}
```


