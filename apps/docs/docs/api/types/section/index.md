# section

<a id="overview"></a>

## Overview

Use `md.section(name)` to anchor parsing to a specific heading and then compose block-level extractors (`fields`, `paragraphs`, `lists`, `tables`, `code`, links, and advanced blocks).
This is the primary mechanism for turning long markdown documents into predictable typed sections.
It does not parse unrelated sections automatically; each required section must be declared explicitly in your schema.

For full `blockOrder` behavior in real flows, see [blockOrder options](/api/interactions/block-order-options).

## Method Index

### Type-specific methods

- [section](/api/types/section/section)
- [fields](/api/types/section/fields)
- [sequence](/api/types/section/sequence)
- [paragraph](/api/types/section/paragraph)
- [paragraphs](/api/types/section/paragraphs)
- [list](/api/types/section/list)
- [tables](/api/types/section/tables)
- [blockquotes](/api/types/section/blockquotes)
- [code](/api/types/section/code)
- [links](/api/types/section/links)
- [images](/api/types/section/images)
- [footnotes -> strict references](/api/types/section/footnotes-strict-references)
- [footnotes -> loose references](/api/types/section/footnotes-loose-references)
- [taskList](/api/types/section/task-list)
- [orderedLists](/api/types/section/ordered-lists)
- [nestedLists -> flat output](/api/types/section/nested-lists-flat-output)
- [nestedLists -> tree output](/api/types/section/nested-lists-tree-output)
- [referenceLinks](/api/types/section/reference-links)
- [autolinks](/api/types/section/auto-links)
- [htmlBlocks](/api/types/section/html-blocks)
- [htmlInlines -> raw tags](/api/types/section/html-inlines-raw-tags)
- [htmlInlines -> elements](/api/types/section/html-inline-elements)
- [blockOrder](/api/types/section/block-order)
- [each](/api/types/section/each)
- [subsections](/api/types/section/subsections)

### Shared auxiliaries

- [each](/api/aux/each)
- [headers](/api/aux/headers)
- [min](/api/aux/min)
- [sequence](/api/aux/sequence)







