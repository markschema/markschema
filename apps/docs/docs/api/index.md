# API Coverage Map

This map tracks the full public API exported by `md` and links to dedicated type pages and method pages.

Navigation model:

- Type overview pages: `/api/types/<type>/`
- Type method pages: `/api/types/<type>/<method>`
- Shared auxiliaries: `/api/aux/<method>`

Note: legacy method routes with historical suffixes (for example `*-2` and `*-min`) were discontinued from the documentation navigation.

## Core Builders

- [document](/api/types/document/)
- [object](/api/types/object/)
- [section](/api/types/section/)
  section aliases covered in page:
  `subsections(depth)`
- [heading](/api/types/heading/)
- [headingText](/api/types/heading-text/)
- [match](/api/types/match/)
- [union](/api/types/union/)
- [discriminatedUnion](/api/types/discriminated-union/)
- [metadataObject](/api/types/metadata-object/)
- [metadata](/api/types/metadata/)
- [block.list](/api/types/block-list/)

## Primitives and Collections

- [string](/api/types/string/)
- [email](/api/types/email/)
- [number](/api/types/number/)
- [boolean](/api/types/boolean/)
- [url](/api/types/url/)
- [date](/api/types/date/)
- [literal](/api/types/literal/)
- [enum](/api/types/enum/)
- [array](/api/types/array/)
- [tuple](/api/types/tuple/)
- [record](/api/types/record/)
- [list](/api/types/list/)

## Transform and Coercion

- [preprocess](/api/types/preprocess/)
- [coerce](/api/types/coerce/)
- [wrappers (`optional`, `nullable`, `default`, `transform`, `pipeline`)](/api/types/wrappers/)

## Error APIs

- [errorMap APIs](/api/types/error-map/)

## Shared Auxiliaries

- [Auxiliaries index](/api/aux/)
- `min`, `max`, `optional`, `nullable`, `default`, `transform`, `pipeline`, `sequence`, `each`, `regex`, and others

## Interaction Guides

- [section composition](/api/interactions/section-composition)
- [blockOrder options](/api/interactions/block-order-options)
- [sequence and each](/api/interactions/sequence-and-each)
- [match composition](/api/interactions/match-composition)
- [union in markdown](/api/interactions/unions-in-markdown)
- [wrappers + transform + pipeline](/api/interactions/wrappers-transform-pipeline)
- [object ergonomics](/api/interactions/object-ergonomics)
- [object policies](/api/interactions/object-policies)
- [advanced markdown blocks](/api/interactions/advanced-markdown-blocks)
- [document order + frontmatter](/api/interactions/document-order-frontmatter)

## Template Requirement

Every page follows this fixed template:

- `Input Markdown`
- `Schema`
- `Result`
- `Success`
- `Error`
