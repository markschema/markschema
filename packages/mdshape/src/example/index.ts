import { md } from '../index'

const markdown = `---
title: Fraud Detection Operations Runbook
version: 1
---

# RUNBOOK: Fraud Detection Operations

## 1. OWNER

- Name: Alex Turner
- Email: alex@zayra.com
- Bio: Lead engineer focused on fraud detection reliability, decision quality, and realtime risk controls.
- Company: Zayra
- Role: Lead Platform Engineer
- Avatar: https://example.com/owners/alex-turner.png
- Site: https://zayra.com
- ExperienceYears: 12
- JoinDate: 2026-01-20
- NewsletterOptIn: true

---

## 2. EXECUTIVE BRIEF

This runbook defines how to detect, triage, and mitigate payment fraud with stable decision latency, measurable precision and recall, and clear escalation ownership.

---

## 3. OPERATIONAL GOALS

This runbook targets the following outcomes:

- Define fraud detection quality metrics for production traffic
- Build robust event ingestion and feature freshness monitoring
- Apply layered controls to reduce false approvals and false declines
- Connect offline model evaluation to online business impact

---

## 4. CONTEXT

In 2024 and 2025, digital merchants faced coordinated account takeover and card testing waves that moved faster than manual review processes. Fraud prevention failures were often caused by stale features, weak escalation paths, and unclear decision policies. This runbook focuses on production fraud operations: balancing approval rate, loss rate, and customer friction while maintaining clear incident response procedures.

---

## 5. EXECUTION TIMELINE

**Window:** 10:00

---

### [00:00-02:00] - Fraud Spike and Incident Intake

**Classification:** TIME_BOUND

**SCORE:** 9

**NARRATION:**  
A sudden spike in card-not-present transactions triggered chargeback alerts and support complaints. The immediate issue was delayed risk signal ingestion, which caused stale decisions during the highest-risk interval.

**VISUAL:**  
Timeline showing fraud spike, delayed signals, and escalation milestones.

---

### [02:00-04:00] - Signal Ingestion and Feature Pipeline

**Classification:** TIMELESS

**NARRATION:**  
A resilient fraud stack depends on event contracts, idempotent ingestion, and feature freshness SLOs. Device, behavioral, and payment signals must be normalized with strict schema checks before scoring.

**ANIMATION:**  
Flow animation from transaction event to feature store, model scoring, and decision output.

---

### [04:00-07:00] - Detection, Review, and Controls

**Classification:** HYBRID

**NARRATION:**  
Effective defense combines model scoring, rule safeguards, and analyst review queues. High-risk decisions should require stronger evidence while low-risk traffic flows through automated approval with continuous monitoring.

**CHART:**  
Chart comparing fraud loss rate before and after introducing feature freshness guards.

**DASHBOARD:**  
Live dashboard with precision, recall, approval rate, and p95 decision latency.

---

### [07:00-09:00] - Latency, Cost, and Approval Trade-offs

**Classification:** TIME_BOUND

**NARRATION:**  
Adding more checks can improve fraud catch rate but may increase latency and customer drop-off. Teams need policy tiers so expensive checks run only on medium and high-risk segments.

**DASHBOARD:**  
Cost and latency dashboard segmented by risk band and region.

---

### [09:00-10:00] - Rollout Plan and Next Controls

**Classification:** HYBRID

**NARRATION:**  
Roll out controls in stages: baseline scoring, freshness guardrails, analyst escalation routing, and weekly threshold recalibration. Each stage must have rollback criteria and accountable owners.

**RUNBOOK / TEMPLATE:**  
Fraud Response Matrix with columns for signal health, decision policy, escalation owner, and rollback trigger.

**ACTION ITEMS:**

- Score current fraud operations from 1 to 5 on precision, recall, and latency stability.
- Pick one bottleneck and define a two-week experiment with measurable targets.

**RISK NOTE:**  
If approval speed is optimized without signal quality controls, losses can scale faster than detection improvements.

**NEXT ACTION:**  
Add adaptive risk routing so low-risk traffic remains fast while suspicious flows receive deeper verification.

**CALL TO ACTION:**  
Run a 7-day replay on recent transaction logs and publish baseline precision, recall, and fraud loss rate.

---

## 6. TOOLS AND ARTIFACTS

### Operational Tools

- Kafka: realtime event ingestion for transaction and device signals
- Flink: stream processing for risk feature computation
- Redis: low-latency feature lookup for decision APIs
- Prometheus + Grafana: latency and reliability monitoring for fraud services

### Frameworks and Templates

- Fraud Response Matrix template [Spreadsheet]
- Decision Policy Taxonomy [Notion Template]
- Escalation Playbook for analyst queues [Markdown]
- Incident Review Checklist for fraud spikes [PDF]

### Reference Materials

- "Credit Card Fraud Detection: A Realistic Modeling and Evaluation Approach" - Dal Pozzolo et al.
- "The Impact of Class Imbalance in Fraud Detection" - research paper
- "Practical Lessons from Real-Time Fraud Systems" - engineering report
- "Monitoring ML in High-Risk Decision Systems" - technical survey

### Additional Resources

- Incident postmortem archive for payment fraud outages
- On-call runbook for degraded decision latency
- Evaluation dataset registry with ownership and SLA
- Benchmark hub for fraud model quality KPIs

---

## 7. TAGS

- Pillar: build
- Track: fraud-ops
- Topics: fraud-detection, risk-scoring, feature-freshness, incident-response, evaluation
- Level: intermediate
- Persona: risk-engineer, platform

---

## 8. REFERENCES

### Reports and Research

- "Global Digital Payment Fraud Trends" - industry report (2025)
- "Realtime Risk Decision Benchmarks" - technical whitepaper (2024)
- "ML Reliability in Financial Decisioning" - research report (2025)

### Benchmark Data

- Public fraud benchmark datasets - kaggle.com
- Internal replay benchmark snapshots - weekly exports
- Regional chargeback trend exports - monthly report

### Technical Papers

- "Learning from Imbalanced Data for Fraud Detection" - 2021
- "Realtime Feature Stores for Risk Systems" - 2023
- "Calibration and Thresholding in Cost-Sensitive Classification" - 2020

### Technical Documentation

- Kafka exactly-once semantics docs
- Flink state and checkpoint documentation
- Prometheus alerting rules documentation

### Case Studies

- Checkout fraud reduction with layered controls
- Account takeover mitigation with device signals
- Chargeback reduction via threshold recalibration

### Compliance and Governance

- Fraud investigation retention policy
- Audit trail requirements for automated decisions
- Incident reporting policy for payment anomalies

---

                                                                        ## 9. ADVANCED BLOCK

Refer to [Fraud System Design Spec](https://example.com/fraud-design "System Spec") for architecture details.

Also review [Quick Runbook Checklist][runbook-checklist] and <https://example.com/fraud-status>.

This paragraph highlights decision thresholds, feature freshness, and <span>escalation safeguards</span> for high-risk transactions.

![Fraud Architecture](https://example.com/fraud-architecture.png "Pipeline Diagram")

> Feature freshness sets the upper bound for fraud decision quality.
> Scoring quality cannot recover from missing upstream signals.

Expected decision quality follows $E = mc^2$ style scaling with signal freshness.

| Metric | Target |
| --- | --- |
| Precision | >= 0.92 |
| Fraud Loss Rate | <= 0.015 |

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

~~~mermaid
flowchart TD
  A[Signal Ingestion] --> B[Feature Store]
  B --> C[Risk Scoring]
  C --> D[Policy Decision]
~~~

~~~ts
const pipeline = ['ingestion', 'feature-store', 'scoring', 'policy', 'escalation']
~~~

1. Define fraud KPIs
2. Run offline replay evaluation
   - Compare model thresholds
   - Track false decline rate

- [x] Build baseline risk index
- [ ] Add adaptive thresholding in production

<div class="note">HTML block example for advanced parsing</div>

Use this note[^fraud-note] when validating escalation attribution.

[^fraud-note]: Footnote used to validate advanced markdown extraction.

[runbook-checklist]: https://example.com/fraud-checklist "Quick Runbook Checklist"
`

const planSceneSchema = md.object({
  title: md.headingText(),
  classification: md.match
    .label('Classification')
    .value(md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])),
  score: md.match
    .label('SCORE')
    .value(
      md
        .string()
        .transform((value) => Number(value))
        .pipeline(md.number().min(0).max(10))
    )
    .optional()
    .default(10),
  intents: md.match
    .labels([
      'NARRATION',
      'VISUAL',
      'ANIMATION',
      'DASHBOARD',
      'CHART',
      'CALL TO ACTION',
      'RUNBOOK / TEMPLATE',
      'ACTION ITEMS',
      'RISK NOTE',
      'NEXT ACTION',
    ])
    .entries({ nameKey: 'type', contentKey: 'text' })
    .each(
      md.discriminatedUnion('type', [
        md.object({
          type: md.literal('NARRATION'),
          text: md.string().min(20),
        }),
        md.object({
          type: md.literal('VISUAL'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('ANIMATION'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('DASHBOARD'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('CHART'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('CALL TO ACTION'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('RUNBOOK / TEMPLATE'),
          text: md.string().min(5),
        }),
        md.object({
          type: md.literal('ACTION ITEMS'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('RISK NOTE'),
          text: md.string().min(10),
        }),
        md.object({
          type: md.literal('NEXT ACTION'),
          text: md.string().min(10),
        }),
      ])
    )
    .min(1),
})

const advancedSection = md
  .section('9. ADVANCED BLOCK')
  .blockOrder(
    [
      'paragraph',
      'link',
      'image',
      'table',
      'math',
      'mermaid',
      'code',
      'orderedList',
      'nestedList',
      'htmlBlock',
    ],
    {
      mode: 'sequence',
      allowRepeats: true,
      allowUnlisted: true,
    }
  )

const goalsSection = md
  .section('3. OPERATIONAL GOALS')
  .blockOrder(['paragraph', 'list'], {
    mode: 'sequence',
    allowRepeats: true,
    allowUnlisted: true,
  })

const RunbookSchema = md.document(
  {
    frontmatter: md.metadataObject(
      md.object({
        title: md.string().min(5),
        version: md.coerce.number().pipeline(md.number().int().min(1)),
      })
    ),
    title: md.heading(1).regex(/^RUNBOOK:\s.+/),
    owner: md.section('1. OWNER').fields({
      Name: md.string().trim().min(3).max(80),
      Email: md.email(),
      Bio: md.string().trim().min(10).max(500).includes('fraud'),
      Company: md.literal('Zayra'),
      Role: md.string().trim().startsWith('Lead').endsWith('Engineer'),
      Avatar: md.url(),
      Site: md.url(),
      ExperienceYears: md.number().int().min(1).max(50),
      JoinDate: md
        .date({ output: 'iso' })
        .transform((value) => value.slice(0, 10)),
      NewsletterOptIn: md.boolean(),
      Active: md.boolean().optional().default(true),
      Alias: md
        .string()
        .optional()
        .default('ALEX')
        .transform((value) => value.toLowerCase()),
    }),
    executiveBrief: md
      .section('2. EXECUTIVE BRIEF')
      .paragraphs([md.string().min(20)]),
    goals: md.object({
      description: goalsSection.paragraphs([md.string().min(20)]),
      items: goalsSection.list(md.string()).min(4),
    }),
    context: md.section('4. CONTEXT').paragraphs([md.string().min(20)]),
    executionTimeline: md.object({
      overview: md
        .section('5. EXECUTION TIMELINE')
        .paragraphs([md.string().min(10)]),
      scenes: md
        .section('5. EXECUTION TIMELINE')
        .subsections(3)
        .sequence([
          '[00:00-02:00] - Fraud Spike and Incident Intake',
          '[02:00-04:00] - Signal Ingestion and Feature Pipeline',
          '[04:00-07:00] - Detection, Review, and Controls',
          '[07:00-09:00] - Latency, Cost, and Approval Trade-offs',
          '[09:00-10:00] - Rollout Plan and Next Controls',
        ])
        .each(planSceneSchema)
        .min(5),
    }),
    tools: md
      .section('6. TOOLS AND ARTIFACTS')
      .subsections(3)
      .sequence([
        'Operational Tools',
        'Frameworks and Templates',
        'Reference Materials',
        'Additional Resources',
      ])
      .each(
        md.object({
          title: md.headingText(),
          items: md.block.list(md.string()).min(1),
        })
      )
      .min(1),
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
    references: md
      .section('8. REFERENCES')
      .subsections(3)
      .sequence([
        'Reports and Research',
        'Benchmark Data',
        'Technical Papers',
        'Technical Documentation',
        'Case Studies',
        'Compliance and Governance',
      ])
      .each(
        md.object({
          title: md.headingText(),
          items: md.block.list(md.string()).min(1),
        })
      )
      .min(1),
    advanced: md.object({
      paragraphs: advancedSection.paragraphs([
        md.string().min(20),
        md.string().min(20),
        md.string().min(20),
        md.string().min(20),
        md.string().min(10),
      ]),
      tables: advancedSection
        .tables(
          md.object({
            headers: md.list(md.string()).min(2),
            rows: md.list(md.list(md.string()).min(2)).min(1),
          })
        )
        .headers(['Metric', 'Target'])
        .min(1),
      quotes: advancedSection
        .blockquotes(
          md.object({
            text: md.string().min(20),
          })
        )
        .min(1),
      codes: advancedSection
        .code(
          md.object({
            language: md.string().optional(),
            code: md.string().min(10),
            meta: md.string().optional(),
          })
        )
        .min(1),
      mathBlocks: advancedSection
        .math(
          md.object({
            text: md.string().min(5),
          })
        )
        .min(1),
      mathInlines: advancedSection
        .mathInlines(
          md.object({
            text: md.string().min(3),
          })
        )
        .min(1),
      mermaid: advancedSection
        .mermaid(
          md.object({
            language: md.literal('mermaid'),
            code: md.string().includes('flowchart TD'),
            meta: md.string().optional(),
          })
        )
        .min(1),
      links: advancedSection
        .links(
          md.object({
            text: md.string().min(2),
            url: md.url(),
            title: md.string().optional(),
          })
        )
        .min(1),
      images: advancedSection
        .images(
          md.object({
            alt: md.string(),
            url: md.url(),
            title: md.string().optional(),
          })
        )
        .min(1),
      footnotes: advancedSection
        .footnotes(
          md.object({
            id: md.string().min(1),
            text: md.string().min(5),
          })
        )
        .min(1),
      tasks: advancedSection
        .taskList(
          md.object({
            text: md.string().min(3),
            checked: md.boolean(),
          })
        )
        .min(2),
      orderedLists: advancedSection
        .orderedLists(
          md.object({
            items: md
              .array(
                md.object({
                  index: md.number().int().min(1),
                  text: md.string().min(3),
                  depth: md.number().int().min(1),
                })
              )
              .min(1),
          })
        )
        .min(1),
      nestedLists: advancedSection
        .nestedLists(
          md.object({
            items: md
              .array(
                md.object({
                  text: md.string().min(3),
                  depth: md.number().int().min(1),
                  ordered: md.boolean(),
                })
              )
              .min(1),
          })
        )
        .min(1),
      referenceLinks: advancedSection
        .referenceLinks(
          md.object({
            text: md.string().min(3),
            identifier: md.string().min(1),
            url: md.url(),
            title: md.string().optional(),
          })
        )
        .min(1),
      autolinks: advancedSection
        .autolinks(
          md.object({
            text: md.string().min(3),
            url: md.url(),
          })
        )
        .min(1),
      htmlBlocks: advancedSection
        .htmlBlocks(
          md.object({
            text: md.string().includes('HTML block example'),
          })
        )
        .min(1),
      htmlInlines: advancedSection
        .htmlInlines(
          md.object({
            text: md.string().min(1),
          })
        )
        .min(1),
    }),
  },
  { ordered: true }
)

const result = RunbookSchema.safeParse(markdown)

if (result.success) {
  console.log('Validation success')

  console.log(result.data)
} else {
  console.log('Validation failed')
  const formatted = result.error.format(markdown)
  console.log(JSON.stringify(formatted, null, 2))
}
