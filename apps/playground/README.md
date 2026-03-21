# @markschema/playground

Interactive IDE for testing `@markschema/mdshape` schemas in real time in the browser.

## Features

- **Monaco Editor** — editor with IntelliSense and autocompleted mdshape types
- **Split panels** — Markdown | Schema | Preview | Result, with draggable dividers
- **Real-time validation** — result updates as you type
- **Rendered preview** — Markdown rendered with KaTeX and Mermaid support
- **Tree view** — tree visualization of the parsed result
- **URL state** — state persisted in the URL for sharing examples
- **Scroll sync** — scroll synchronization between panels

## Development

```bash
# Install dependencies (from the monorepo root)
npm install

# Dev server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

App URL: `http://localhost:3001`

The `predev` command automatically builds `@markschema/mdshape` and generates TypeScript types for the Monaco Editor.

## Generate Monaco types

```bash
npm run generate:monaco-types
```

This script reads the `.d.ts` declarations from mdshape and generates the `src/lib/monaco-mdshape-dts.ts` file so IntelliSense works in the browser editor.

## Stack

- **Next.js 16** with Turbopack — React framework
- **React 19** — UI
- **Monaco Editor** — code editor
- **Radix UI** — accessible components (tabs, tooltip, switch, scroll-area, etc.)
- **Tailwind CSS 4** — styling
- **react-resizable-panels** — resizable panel layout
- **react-markdown** + rehype-katex — Markdown rendering with math
- **Mermaid** — diagrams
- **Lucide React** — icons

## Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main page
│   └── playground/           # Playground routes
├── components/
│   ├── landing/              # Landing page components
│   ├── playground/           # Playground UI (toolbar, panes)
│   ├── ui/                   # Radix wrapper components
│   ├── playground-client.tsx # Main orchestrator
│   └── json-tree-view.tsx    # Result visualization
└── lib/
    ├── mdshape.ts            # Re-export from the package
    ├── playground-model.ts   # State and logic
    ├── schema-introspection.ts
    └── monaco-mdshape-dts.ts # Generated types for Monaco
```
