# End-to-End Example: Incident Postmortem Pipeline (Complex)

This scenario validates a postmortem document with ordered phases, advanced markdown blocks, and `error.format(markdown)` friendly output.

## Why this schema is production-oriented

- Ordered `phases.sequence(...)` prevents timeline inversion during incident write-ups.
- Mixed evidence extraction (`links`, `autolinks`, `quotes`, `tables`, `code`, `tasks`) ensures all forensic artifacts are machine-readable.
- `blockOrder(..., { mode: 'sequence' })` makes structural policy explicit for compliance and postmortem automation.

### Input Markdown

```md
# POSTMORTEM: Payment Risk Outage

## 1. SUMMARY

Realtime risk API returned stale decisions during ingestion lag.

## 2. PHASES

### Detection

**SEVERITY:** SEV2
**DURATION_MIN:** 18
**OWNER:** Risk Oncall

### Mitigation

**SEVERITY:** SEV2
**DURATION_MIN:** 42
**OWNER:** Platform Core

## 3. EVIDENCE

Refer to [Grafana Snapshot](https://example.com/grafana "Dashboard").
Also check <https://example.com/status/inc-204>.

> Delay in feature ingestion propagated stale scores.

| KPI | Value |
| --- | --- |
| Decision Latency p95 | 840ms |

~~~ts
const mitigation = ['rate-limit', 'cache-bypass', 'replay-queue']
~~~

- [x] Ingestion lag alert created
- [ ] Backfill replay automation deployed
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const phases = md
  .section('2. PHASES')
  .headingLevel(3)
  .sequence(['Detection', 'Mitigation'])
  .each(
    md.object({
      title: md.headingText(),
      severity: md.match.label('SEVERITY').value(md.enum(['SEV1', 'SEV2', 'SEV3'])),
      duration: md.match
        .label('DURATION_MIN')
        .value(md.coerce.number().pipeline(md.number().int().min(1))),
      owner: md.match.label('OWNER').value(md.string().min(3)),
    }),
  )
  .min(2)

const evidence = md
  .section('3. EVIDENCE')
  .blockOrder(['paragraph', 'link', 'autolink', 'blockquote', 'table', 'code', 'taskList'], {
    mode: 'sequence',
    allowRepeats: true,
    allowUnlisted: false,
  })

const schema = md.document({
  title: md.heading(1).regex(/^POSTMORTEM:\s.+/),
  summary: md.section('1. SUMMARY').paragraphs([md.string().min(20)]),
  phases,
  evidence: md.object({
    links: evidence.links(md.object({ text: md.string().min(3), url: md.url(), title: md.string().optional() })).min(1),
    autolinks: evidence.autolinks(md.object({ text: md.string(), url: md.url() })).min(1),
    quotes: evidence.blockquotes(md.object({ text: md.string().min(20) })).min(1),
    tables: evidence.tables(md.object({ headers: md.list(md.string()).min(2), rows: md.list(md.list(md.string()).min(2)).min(1) })).min(1),
    codes: evidence.code(md.object({ language: md.string().optional(), code: md.string().min(10) })).min(1),
    tasks: evidence.taskList(md.object({ text: md.string().min(3), checked: md.boolean() })).min(2),
  }),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "POSTMORTEM: Payment Risk Outage",
    "summary": [
      "Realtime risk API returned stale decisions during ingestion lag."
    ],
    "phases": [
      {
        "title": "Detection",
        "severity": "SEV2",
        "duration": 18,
        "owner": "Risk Oncall"
      },
      {
        "title": "Mitigation",
        "severity": "SEV2",
        "duration": 42,
        "owner": "Platform Core"
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
          "phases"
        ]
      },
      {
        "code": "block_order_mismatch",
        "path": [
          "evidence"
        ]
      }
    ]
  }
}
```




