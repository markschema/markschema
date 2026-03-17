# regex

## What It Is

This method page uses `regex` to enforce typed markdown validation primitives over markdown content in `regex` use cases. In practice, a compact markdown payload is validated and emitted as typed output aligned to the declared schema using `document()` and related builders under `regex` rules. When constraints are broken, structured issues with path-aware diagnostics identify exactly which `regex` node failed and why.

## When to Use

Choose `regex` for tightening scalar constraints without redefining the base shape, especially when `regex` authoring rules must remain stable across teams. Skip it in very loose drafts where strict refinement would block iteration workflows for `regex`, since more explicit schema maintenance to keep output deterministic. Combining it with `document()` and related builders yields predictable `regex` parsing, clearer errors, and easier runtime integration.

