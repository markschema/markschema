# htmlInlines -> elements

Type: `section`

Signature: `section().htmlInline.elements(schema).min(...)`

## What It Is

`section().htmlInline.elements(schema)` extracts structured inline HTML elements with `tag`, `attrs`, `text`, and `raw`. In this v1 behavior, it supports simple paired elements (`<span>...</span>`) and self-closing elements (`<br />`) inside section text. Malformed or unmatched tags are ignored by the collector and only valid extracted elements are validated against your schema.

## When to Use

Use `htmlInline.elements` when consumers need semantic element data instead of raw tokens, for example rendering, auditing attributes, or enforcing per-tag rules. This is the preferred mode when your integration depends on element-level contracts. If your goal is only to detect raw tags at parser level, keep `htmlInlines`.

### `section().htmlInline.elements(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

This line has <span class="hl">inline HTML</span> and <br />.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  elements: md.section('9. ADVANCED BLOCK').htmlInline.elements(
    md.object({
      tag: md.string(),
      attrs: md.record(md.string()),
      text: md.string(),
      raw: md.string().min(1),
    }),
  ).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "elements": [
      {
        "tag": "span",
        "attrs": {
          "class": "hl"
        },
        "text": "inline HTML",
        "raw": "<span class=\"hl\">inline HTML</span>"
      },
      {
        "tag": "br",
        "attrs": {},
        "text": "",
        "raw": "<br />"
      }
    ]
  }
}
```

#### Error

Failure trigger: section exists but has no extractable inline HTML elements, so `htmlInline.elements` fails with `missing_html_inline_element`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_html_inline_element",
        "message": "Section \"9. ADVANCED BLOCK\" must contain an inline HTML element",
        "path": [
          "elements"
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
