# each

## What It Is

This method page uses `each` to enforce typed markdown validation primitives over markdown content in `each` use cases. In practice, a compact markdown payload is validated and emitted as typed output aligned to the declared schema using `document()` and related builders under `each` rules. When constraints are broken, structured issues with path-aware diagnostics identify exactly which `each` node failed and why.

## When to Use

Apply `each` when your document flow requires tightening scalar constraints without redefining the base shape for `each` and strict schema adherence over permissive parsing. It is less suitable for very loose drafts where strict refinement would block iteration under `each`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()` and related builders around `each` to keep `each` contracts transparent and reduce ambiguity in validation behavior.

