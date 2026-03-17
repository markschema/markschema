# match

<a id="overview"></a>

## Overview

`md.match` validates labeled content in markdown sections and is built for documents where meaning is encoded in labels rather than free prose.
Use `label` when you need a single typed value from one label, and use `labels` when multiple labels must be collected from the same subsection.
Within `labels`, choose `values` for plain ordered value lists and `entries` for structured `{ name, value }` records, then apply `min`, `each`, or `enforceOrder` only when those constraints are part of your contract.

## Method Index

### Type-specific methods

#### label

- [value](/api/types/match/value)

#### labels - values

- [basic](/api/types/match/values-basic)
- [min](/api/types/match/values-with-threshold)
- [enforceOrder](/api/types/match/enforce-order)

#### labels - entries

- [basic](/api/types/match/entries-basic)
- [each](/api/types/match/each)
- [enforceOrder](/api/types/match/entries-each-enforce-order)

### Shared auxiliaries

- [each](/api/aux/each)
- [min](/api/aux/min)




