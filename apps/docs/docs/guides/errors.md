# Guide: Errors and Debugging

## Issue shape

`mdshape` returns issues with `code`, `path`, `line`, and `position`.

## Example

### Input Markdown

```md
# LESSON: Complete example

## 2. SUBTITLE

A long enough subtitle for validation.

## 3. OBJECTIVES

- Goal one
- Goal two
- Goal three
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const Schema = md.document({
  title: md.heading(1),
  subtitle: md.section('2. SUBTITLE').paragraphs([md.string().min(20)]),
  objectives: md.section('3. OBJECTIVES').list(md.string()).min(3),
})

const schema = Schema
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "LESSON: Complete example",
    "subtitle": [
      "A long enough subtitle for validation."
    ],
    "objectives": [
      "Goal one",
      "Goal two",
      "Goal three"
    ]
  }
}
```

#### Error

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_heading",
        "message": "Missing heading with depth 1",
        "path": [
          "title"
        ],
        "line": 1,
        "position": {
          "start": {
            "line": 1,
            "column": 1
          }
        }
      }
    ]
  }
}
```

## Right vs Wrong

- Right: inspect `code` + `path` first, then use `line`/`position`.
- Wrong: rely only on `message` and ignore `path` context.

## Common codes

- `missing_section`
- `missing_paragraph`
- `unexpected_paragraph`
- `missing_list`
- `block_order_mismatch`
- `invalid_union_discriminator`



