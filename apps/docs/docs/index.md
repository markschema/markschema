---
layout: home

hero:
  name: "mdshape"
  text: "Type-safe Markdown validation"
  tagline: "Schema-first parsing for structured Markdown, with rich errors and composable builders."
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: API by Type
      link: /api/
    - theme: alt
      text: Playground Guide
      link: /playground/

features:
  - title: Schema-first API
    details: Build document contracts with md.document, sections, fields, labels, block rules, and typed coercions.
  - title: Rich diagnostics
    details: Every issue carries code, path, line, and position to support CI checks, editor highlights, and UX mapping.
  - title: Markdown-native coverage
    details: Validate headings, lists, tables, code blocks, mermaid, math, links, and ordering constraints in one pipeline.
---

# Quick Example

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  title: md.heading(1).regex(/^RUNBOOK:\s.+/),
  meta: md.section('1. META').fields({
    Service: md.string().min(3),
    Severity: md.enum(['low', 'medium', 'high']),
  }),
})

const result = schema.safeParse(markdown)
```

## Continue

- [Getting Started](/getting-started)
- [API Coverage Map](/api/)
- [Runbook Example](/examples/runbook-fraud)
