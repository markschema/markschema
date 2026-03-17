# Primitives

## Available

- `md.string()`
- `md.email()`
- `md.number()`
- `md.boolean()`
- `md.url()`
- `md.date({ input?: 'iso' | 'date-only', output?: 'date' | 'iso' | 'date-only' })`
- `md.literal(value)`
- `md.enum([...])`
- `md.array(schema)`
- `md.tuple([...])`
- `md.record(...)`

## Example

### Input Markdown

```md
## 7. TAGS

- Pillar: learn
- Track: blockchain-basics
- Level: 1
- Published: true
- Site: https://example.com
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const PrimitiveSchema = md.document({
  tags: md.section('7. TAGS').fields({
    Pillar: md.string().min(2),
    Track: md.string().min(3),
    Level: md.coerce.number().pipeline(md.number().int().min(1)),
    Published: md.coerce.boolean(),
    Site: md.url(),
  }),
})

const schema = PrimitiveSchema
```

### Result

#### Success
```json
{
  "success": true,
  "data": {
    "tags": {
      "Pillar": "learn",
      "Track": "blockchain-basics",
      "Level": 1,
      "Published": true,
      "Site": "https://example.com/"
    }
  }
}
```
```

#### Error
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"7. TAGS\"",
        "path": [
          "tags"
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
```

## Right vs Wrong

- Right: `md.number().optional().default(0)`
- Wrong: expecting `default()` to fix invalid values

Common error: `default()` only applies to `undefined`.










