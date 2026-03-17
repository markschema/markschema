# End-to-End Example: Builder Showcase

This page covers all major builders in one compact document.

## Input Markdown

```md
# RUNBOOK: Builder Showcase

## 1. META

- Service: Fraud API

## 3. EVENTS

### Step A

**Classification:** TIMELESS
**STATUS:** ACTIVE
**ENTRY:** Initial signal check passed.

**NARRATION:** Analyst reviewed risk signals.
**VISUAL:** Dashboard snapshot.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1),
  meta: md.section('1. META').fields({ Service: md.string() }),
  events: md
    .section('3. EVENTS')
    .headingLevel(3)
    .each(
      md.object({
        title: md.headingText(),
        classification: md.match.label('Classification').value(md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])),
        status: md.match.label('STATUS').value(md.union([md.literal('ACTIVE'), md.number()])),
      }),
    )
    .min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Builder Showcase",
    "meta": {
      "Service": "Fraud API"
    },
    "events": [
      {
        "title": "Step A",
        "classification": "TIMELESS",
        "status": "ACTIVE"
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
        "code": "missing_labeled_value",
        "path": [
          "events",
          0,
          "status"
        ]
      }
    ]
  }
}
```





