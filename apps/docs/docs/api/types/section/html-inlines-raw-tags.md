# htmlInlines -> raw tags

Type: `section`

Signature: `section().htmlInlines(schema).min(...)`

## What It Is

`section().htmlInlines(schema)` collects inline HTML tokens exactly as they appear in markdown parsing, such as opening tags, closing tags, or self-closing tags. It does not combine tags into a full element object, so each token is validated independently. This makes the output low-level and predictable for tag-presence checks.

## When to Use

Use raw tags when your validation rules are about tag presence, not full element semantics, such as allowlist/blocklist checks or quick compliance gates. This mode also helps when you want to keep parser-native token boundaries for audits and debugging. If your integration depends on structured fields like `tag`, `attrs`, inner `text`, and `raw`, move to `htmlInline.elements`.

### `section().htmlInlines(schema).min(...)`

### Input Markdown

```md
## 9. ADVANCED BLOCK

This line has <span class="hl">inline HTML</span>.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  htmlInlines: md.section('9. ADVANCED BLOCK').htmlInlines(md.object({ text: md.string().min(1) })).min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "htmlInlines": [
      {
        "text": "<span class=\"hl\">"
      },
      {
        "text": "</span>"
      }
    ]
  }
}
```

#### Error

Failure trigger: section exists but contains no inline HTML tags, so `htmlInlines` fails with `missing_html_inline`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"9. ADVANCED BLOCK\"",
        "path": [
          "htmlInlines"
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



