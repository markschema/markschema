# End-to-End Example: Compliance Audit Pack (Complex)

This example shows discriminated intent extraction, reference links, and custom error maps for audit-ready markdown.

## Input Markdown

```md
# AUDIT PACK: Checkout Risk Controls

## 0. META

audit: PCI-DSS
cycle: 2026-Q1

## 1. OWNERS

- Security: Priya N.
- Risk: Lucas M.

## 2. CONTROLS

### Evidence Collection

**TYPE:** POLICY
**TEXT:** Policy documents are versioned and immutable.

### Runtime Monitoring

**TYPE:** METRIC
**TEXT:** p95 scoring latency and citation coverage are monitored.

## 3. REFERENCES

Use [Policy Baseline][policy] and [Latency Dashboard](https://example.com/latency "Latency").

[policy]: https://example.com/policy-baseline "Policy Baseline"
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const controlSchema = md.object({
  title: md.headingText(),
  intent: md.match
    .labels(['TYPE', 'TEXT'])
    .entries({ nameKey: 'name', contentKey: 'value' })
    .each(
      md.discriminatedUnion('name', [
        md.object({ name: md.literal('TYPE'), value: md.enum(['POLICY', 'METRIC', 'PROCESS']) }),
        md.object({ name: md.literal('TEXT'), value: md.string().min(20) }),
      ]),
    )
    .min(2),
})

const schema = md
  .document({
    meta: md.section('0. META').fields({}).min(1),
      refs: md.section('3. REFERENCES').referenceLinks(md.object({ text: md.string().min(2), identifier: md.string(), url: md.url(), title: md.string().optional() })).min(1),
    }),
  })
  .errorMap((issue) => {
    if (issue.code === 'missing_section') return 'Required audit section missing'
    return issue.message
  })
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "AUDIT PACK: Checkout Risk Controls",
    "owners": {
      "Security": "Priya N.",
      "Risk": "Lucas M."
    },
    "controls": [
      {
        "title": "Evidence Collection"
      },
      {
        "title": "Runtime Monitoring"
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
        "message": "Required audit section missing",
        "path": [
          "references",
          "refs"
        ]
      },
      {
        "code": "invalid_enum_value",
        "path": [
          "controls",
          0,
          "intent",
          0,
          "value"
        ]
      }
    ]
  }
}
```




