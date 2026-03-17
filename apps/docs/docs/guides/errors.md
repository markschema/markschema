# Guide: Errors and Debugging

## Issue shape

`mdshape` returns issues with `code`, `path`, `line`, and `position`.

## Example

### Input Markdown

```md
# LESSON: Incomplete example

## 2. SUBTITLE

Short.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const Schema = md.document({
  title: md.heading(1),
  subtitle: md.section('2. SUBTITLE').paragraphs([md.string().min(20)]),
  objectives: md.section('3. OBJECTIVES').list(md.string()).min(3),
})
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
        "code": "string_too_short",
        "path": [
          "subtitle",
          0
        ],
        "line": 6,
        "position": {
          "start": {
            "line": 6,
            "column": 1
          }
        }
      },
      {
        "code": "missing_section",
        "path": [
          "objectives"
        ],
        "line": 1
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





