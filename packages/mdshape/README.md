# @markschema/mdshape

Type-safe Markdown validation with a schema-first API inspired by Zod.

## What it is

`mdshape` transforms unstructured Markdown into typed, validated data. You define a schema — sections, fields, frontmatter, lists — and `mdshape` parses the Markdown AST, extracts the values, and returns precise errors when the document doesn't match.

## Installation

```bash
npm install @markschema/mdshape
```

## Quick example

```typescript
import { md } from "@markschema/mdshape";

const schema = md.document({
  title: md.heading({ level: 1 }),
  summary: md.string(),
  status: md.enum(["open", "closed", "in-progress"]),
  steps: md.section({
    heading: md.heading({ level: 2 }),
    items: md.list(md.string()),
  }),
});

const result = schema.parse(markdownString);

if (result.success) {
  console.log(result.data);
  // { title: "...", summary: "...", status: "open", steps: [...] }
} else {
  console.error(result.errors);
}
```

## Main builders

| Builder                                             | Description                   |
| --------------------------------------------------- | ----------------------------- |
| `md.document()`                                     | Root document schema          |
| `md.section()`                                      | Groups content under headings |
| `md.heading()`                                      | Validates headings by level   |
| `md.headingText()`                                  | Extracts heading text         |
| `md.block()`                                        | Block-level elements          |
| `md.object()`                                       | Extracts structured fields    |
| `md.frontmatter()` / `md.metadata()`                | Validates YAML frontmatter    |
| `md.match()`                                        | Pattern matching with labels  |
| `md.string()` `md.number()` `md.boolean()`          | Typed primitives              |
| `md.email()` `md.url()` `md.date()`                 | Specialized primitives        |
| `md.enum()` `md.literal()`                          | Restricted values             |
| `md.array()` `md.tuple()` `md.list()` `md.record()` | Collections                   |
| `md.union()` `md.discriminatedUnion()`              | Composite types               |
| `md.preprocess()` `md.coerce()`                     | Input transforms              |

## Features

- **Type-safe** — full TypeScript type inference
- **GitHub Flavored Markdown** — tables, task lists, strikethrough
- **Math** — LaTeX notation via remark-math
- **Frontmatter** — YAML parsing and validation
- **Precise errors** — position in the original document, customizable messages
- **Composable** — schemas compose like Zod: `.optional()`, `.default()`, `.refine()`

## Stack

- [remark](https://github.com/remarkjs/remark) — Markdown to AST parsing
- [remark-gfm](https://github.com/remarkjs/remark-gfm) — GitHub Flavored Markdown
- [remark-math](https://github.com/remarkjs/remark-math) — math notation
- [yaml](https://github.com/eemeli/yaml) — frontmatter parsing

## Scripts

```bash
npm run build    # Build with tsup
npm run dev      # Watch mode
npm test         # Tests with vitest
npm run lint     # Lint
npm run check-types  # Type check
```
