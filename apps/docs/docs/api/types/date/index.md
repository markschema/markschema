# date

<a id="overview"></a>

## Overview

Use `md.date()` for strict date parsing. `input` controls the accepted input format, `output` controls the returned shape, and when `output` is omitted it defaults to the natural shape of the chosen `input`.

## Quick Reference

```ts
import { md } from '@markschema/mdshape'

md.date({ input: 'iso', output: 'date' })
md.date({ input: 'iso', output: 'date-only' })
md.date({ input: 'date-only', output: 'date' })
md.date({ input: 'date-only' }) // returns YYYY-MM-DD string
md.date({ input: 'timestamp', output: 'date' }) // timestamp -> Date
md.date({ input: 'timestamp' }) // returns timestamp (ms)
md.date() // equivalent to { input: 'iso', output: 'date' }
md.date({ output: 'iso' }) // ISO input, ISO string output
```

If `output` is omitted, it follows the selected `input`:
- `input: 'iso'` -> output `date`
- `input: 'date-only'` -> output `date-only`
- `input: 'timestamp'` -> output `timestamp`

All `input` modes can be combined with all `output` modes.

## Method Index

### Type-specific methods

- [date](/api/types/date/date)

### Shared auxiliaries

- [transform](/api/aux/transform)






