## AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The project uses npm workspaces with Turborepo. Key commands:

- `npm run build` - Build all packages and apps via Turbo
- `npm run dev` - Start dev servers for all workspaces
- `npm run lint` - Run ESLint across all packages via Turbo
- `npm run format` - Format code with Prettier (`**/*.{ts,tsx,md}`)
- `npm run check-types` - Run TypeScript type checking across all packages
- `npm run docs:dev` - Start VitePress docs dev server
- `npm run docs:build` - Build docs for production
- `npm run docs:preview` - Preview docs production build
- `npm run docs:check` - Run docs quality checks

### Testing (in `packages/mdshape`)

- `npx vitest run` - Run all tests
- `npx vitest run <path>` - Run specific test file
- `npx vitest run <path> -t "<pattern>"` - Run specific test(s) within a file
- `npx vitest run --update` - Update test snapshots

## Project Structure

This is a monorepo with the following workspaces:

### Apps

- `apps/docs` - Documentation site (VitePress)
- `apps/playground` - Interactive playground IDE (Next.js, port 3001)

### Packages

- `packages/mdshape` - Core validation library (the main package)
- `packages/ui` - Shared React UI components (Radix UI, Tailwind)
- `packages/eslint-config` - Shared ESLint configuration
- `packages/tailwind-config` - Shared Tailwind CSS configuration
- `packages/typescript-config` - Shared TypeScript configuration

## Rules

- Node.js v18+ required; npm v10.9.2
- ES modules are used throughout (`"type": "module"`)
- TypeScript v5.9.2 — all code must be written in TypeScript
- Use Prettier for formatting and ESLint for linting
- Features without tests are incomplete — every new feature or bug fix needs test coverage
- Don't skip tests due to type issues — fix the types instead
- Test both success and failure cases with edge cases
- No log statements (`console.log`, `debugger`) in tests or production code
- Ask before generating new files
