# End-to-End Example: Fraud Runbook (Advanced)

This scenario validates a real multi-section runbook with ordered scenes, mixed label extraction, and strict advanced block navigation.

## Why this schema is production-oriented

- `section(...).subsections(...).sequence(...).each(...)` guarantees timeline order and prevents silent section drift.
- `match.label/labels` keeps operational labels typed and auditable.
- `blockOrder(...)` protects advanced sections from structural regressions when writers change markdown layout.
- `pipeline(...)` converts raw text values into bounded numeric constraints before business logic uses them.

### Input Markdown

```md
# RUNBOOK: Fraud Detection Operations

## 0. META

- title: Fraud Detection Operations Runbook
- version: 1

## 1. OWNER

- Name: Alex Turner
- Email: alex@zayra.com
- Role: Lead Platform Engineer

## 5. EXECUTION TIMELINE

### [00:00-02:00] - Fraud Spike and Incident Intake

**Classification:** TIME_BOUND
**SCORE:** 9
**NARRATION:** Signal delay caused stale decisions in the highest-risk period.
**DASHBOARD:** Chargeback and approval trend by minute.

### [02:00-04:00] - Signal Ingestion and Feature Pipeline

**Classification:** TIMELESS
**NARRATION:** Feature freshness checks protect scoring quality.
**ANIMATION:** Event to score flow with lag checkpoints.

## 9. ADVANCED BLOCK

Refer to [Fraud Spec](https://example.com/fraud-spec "Spec").

![Fraud Architecture](https://example.com/fraud.png "Pipeline")

| Metric | Target |
| --- | --- |
| Precision | >= 0.92 |

~~~ts
const stack = ['ingestion', 'feature-store', 'scoring']
~~~

- [x] Baseline index built
- [ ] Adaptive thresholds enabled
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const sceneSchema = md.object({
  title: md.headingText(),
  classification: md.match.label('Classification').value(md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])),
  score: md.match
    .label('SCORE')
    .value(md.coerce.number().pipeline(md.number().min(0).max(10)))
    .optional(),
  intents: md.match
    .labels(['NARRATION', 'DASHBOARD', 'ANIMATION'])
    .entries({ nameKey: 'type', contentKey: 'text' })
    .each(
      md.discriminatedUnion('type', [
        md.object({ type: md.literal('NARRATION'), text: md.string().min(20) }),
        md.object({ type: md.literal('DASHBOARD'), text: md.string().min(10) }),
        md.object({ type: md.literal('ANIMATION'), text: md.string().min(10) }),
      ]),
    )
    .min(1),
})

const advanced = md
  .section('9. ADVANCED BLOCK')
  .blockOrder(['paragraph', 'link', 'image', 'table', 'code', 'taskList'], {
    mode: 'sequence',
    allowRepeats: true,
    allowUnlisted: false,
  })

const schema = md.document({
  title: md.heading(1).regex(/^RUNBOOK:\s.+/),
  meta: md.section('0. META').fields({
    title: md.string().min(5),
    version: md.coerce.number().pipeline(md.number().int().min(1)),
  }),
  owner: md.section('1. OWNER').fields({
    Name: md.string().min(3),
    Email: md.email(),
    Role: md.string().trim().startsWith('Lead').endsWith('Engineer'),
  }),
  timeline: md
    .section('5. EXECUTION TIMELINE')
    .subsections(3)
    .sequence([
      '[00:00-02:00] - Fraud Spike and Incident Intake',
      '[02:00-04:00] - Signal Ingestion and Feature Pipeline',
    ])
    .each(sceneSchema)
    .min(2),
  advanced: md.object({
    links: advanced.links(md.object({ text: md.string().min(2), url: md.url(), title: md.string().optional() })).min(1),
    images: advanced.images(md.object({ alt: md.string(), url: md.url(), title: md.string().optional() })).min(1),
    tables: advanced.tables(md.object({ headers: md.list(md.string()).min(2), rows: md.list(md.list(md.string()).min(2)).min(1) })).min(1),
    code: advanced.code(md.object({ language: md.string().optional(), code: md.string().min(10) })).min(1),
    tasks: advanced.taskList(md.object({ text: md.string().min(3), checked: md.boolean() })).min(2),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Fraud Detection Operations",
    "owner": {
      "Name": "Alex Turner",
      "Email": "alex@zayra.com",
      "Role": "Lead Platform Engineer"
    },
    "timeline": [
      {
        "title": "[00:00-02:00] - Fraud Spike and Incident Intake",
        "classification": "TIME_BOUND",
        "score": 9
      },
      {
        "title": "[02:00-04:00] - Signal Ingestion and Feature Pipeline",
        "classification": "TIMELESS"
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
        "code": "sequence_mismatch",
        "path": [
          "timeline"
        ]
      },
      {
        "code": "block_order_mismatch",
        "path": [
          "advanced"
        ]
      }
    ]
  }
}
```



