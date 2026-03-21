# Contributing

When it comes to open source, there are different ways you can contribute, all of which are valuable. Here are a few guidelines that should help you as you prepare your contribution.

## Initial steps

Before you start working on a contribution, create an issue describing what you want to build. It's possible someone else is already working on something similar, or perhaps there is a reason that feature isn't implemented. The maintainers will point you in the right direction.

## Development

The following steps will get you set up to contribute changes to this repo:

1. Fork this repo.
2. Clone your forked repo: `git clone git@github.com:{your_username}/markschema.git`
3. Run `npm install` to install dependencies.
4. Run `npm run build` to build all packages.
5. Start playing with the code!

### Project structure

This is a monorepo managed with [Turborepo](https://turbo.build/) and npm workspaces:

```
apps/
  docs/          # Documentation site (VitePress)
  playground/    # Interactive playground
packages/
  mdshape/       # Core library
  ui/            # Shared UI components
  eslint-config/ # Shared ESLint config
  tailwind-config/ # Shared Tailwind config
  typescript-config/ # Shared TypeScript config
```

### Running Docs locally

```bash
# Dev server
npm run docs:dev

# Production build
npm run docs:build

# Preview production build
npm run docs:preview
```

### Running the Playground locally

```bash
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages and apps |
| `npm run dev` | Start dev servers |
| `npm run lint` | Run linting across all packages |
| `npm run format` | Format code with Prettier |
| `npm run check-types` | Run TypeScript type checking |

## Tests

After implementing your contribution, write tests for it. Before submitting your PR, make sure there are no unintended breaking changes.

## Documentation

The documentation site lives in `apps/docs`. Be sure to document any API changes you implement.

## License

By contributing your code to the markschema GitHub repository, you agree to license your contribution under the [MIT license](./LICENSE).
