import { nextJsConfig } from '@markschema/eslint-config/next-js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
