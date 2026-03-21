# mdschema

A toolkit for validating and structuring Markdown documents. mdschema provides TypeScript libraries to transform unstructured Markdown into typed, validated, and predictable data.

## Tools

### `@markschema/mdshape` — available now

A Markdown validation library with a schema-first API. Define a schema for sections, fields, frontmatter, lists, and tables — mdshape parses and validates with full type inference.

```ts
import { md } from "@markschema/mdshape";

const schema = md.document({
  frontmatter: md.frontmatter({
    title: md.string(),
    date: md.date(),
  }),
  body: md.section({
    heading: md.heading(2),
    content: md.block(),
  }),
});

const result = schema.parse(markdownString);
// result is fully typed
```

**27 builders** for documents, frontmatter, primitives, collections, composition, and transforms. Supports GFM (tables, task lists), LaTeX math, and YAML frontmatter.

## Repository structure

```
markschema/
├── apps/
│   ├── playground/      # Interactive IDE for testing schemas (Next.js, port 3001)
│   └── docs/            # Documentation site (VitePress)
└── packages/
    ├── mdshape/         # Core library (@markschema/mdshape)
    ├── ui/              # Shared React components
    ├── tailwind-config/ # Shared Tailwind configuration
    ├── eslint-config/   # Shared ESLint configuration
    └── typescript-config/ # Shared TypeScript configuration
```

## Getting started

**Requirements:** Node >= 18, npm >= 10

```sh
# Install dependencies
npm install

# Run everything in dev mode
npm run dev

# Run only the playground
npm run dev --filter=@markschema/playground

# Run only the docs
npm run docs:dev
```

## Available scripts

| Script                | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Start all apps in development mode          |
| `npm run build`       | Build all apps and packages                 |
| `npm run lint`        | Run linting across the monorepo             |
| `npm run check-types` | TypeScript type checking                    |
| `npm run format`      | Format code with Prettier                   |
| `npm run docs:dev`    | Start docs in dev mode                      |
| `npm run docs:build`  | Build static docs                           |
| `npm run docs:check`  | Validate links, semantics, and doc examples |

## Apps

### Playground

Browser-based IDE with Monaco Editor, resizable panels (Markdown | Schema | Preview | Result), live validation, and URL state persistence for sharing examples.

### Docs

Full documentation with API reference, guides, 6 end-to-end schema examples (runbooks, postmortems, compliance audits, etc.), and playground integration.

## Tech stack

- **Turbo** — monorepo orchestration
- **TypeScript 5.9** — typed across all packages
- **Next.js 16 + React 19** — playground
- **VitePress** — documentation
- **Tailwind CSS 4** — styling
- **Vitest** — unit testing
- **tsup** — core package bundler

## Development

To run a specific package, use Turbo filters:

```sh
npx turbo dev --filter=@markschema/mdshape
npx turbo build --filter=@markschema/playground
npx turbo test --filter=@markschema/mdshape
```
