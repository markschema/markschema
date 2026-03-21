# @markschema/docs

Documentation site for `@markschema/mdshape`, built with [VitePress](https://vitepress.dev/).

## Structure

```
docs/
├── index.md                  # Landing page
├── getting-started.md        # Installation and first schema
├── api/
│   ├── types/                # Reference for each builder (27 types)
│   ├── aux/                  # Auxiliary utilities
│   └── interactions/         # Advanced composition guides (10 guides)
├── guides/
│   ├── error-handling.md     # Error system
│   ├── paragraph-vs-paragraphs.md
│   └── block-order.md
├── examples/                 # End-to-end schemas (6 examples)
│   ├── runbook-fraud.md
│   ├── incident-postmortem-pipeline.md
│   ├── compliance-audit-pack.md
│   ├── risk-control-matrix.md
│   ├── builder-showcase.md
│   └── lesson-schema.md
└── playground/               # Playground reference
```

## Development

```bash
# Install dependencies (from the monorepo root)
npm install

# Dev server with hot reload
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

The dev server uses VitePress and imports `@markschema/mdshape` as a workspace dependency.

## Quality checks

```bash
npm run check-links      # Check for broken internal links
npm run check-semantics  # Validate documentation semantics
npm run check-examples   # Test code blocks in examples
npm run fix-examples     # Auto-fix examples
npm run check-quality    # Run all checks above
```

## Stack

- **VitePress 1.6.4** — Vue-based static site generator
- **Local search** — VitePress native search provider
- **Custom components** — Landing page with Vue components
