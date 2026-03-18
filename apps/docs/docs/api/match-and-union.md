# Match and Union

## Example

### Input Markdown

```md
## 3. EVENTS

### [00:00-01:00] - Introduction

**NARRATION:**
Lesson overview and expected outcomes.

**VISUAL:**
Timeline showing all lesson segments.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const intentSchema = md.discriminatedUnion('type', [
  md.object({ type: md.literal('NARRATION'), text: md.string().min(10) }),
  md.object({ type: md.literal('VISUAL'), text: md.string().min(10) }),
])

const schema = md.document({
  intents: md
    .section('3. EVENTS')
    .subsections(3)
    .each(
      md.object({
        intents: md.match
          .labels(['NARRATION', 'VISUAL'])
          .entries({ nameKey: 'type', contentKey: 'text' })
          .each(intentSchema),
      }),
    ),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "intents": [
      {
        "intents": [
          {
            "type": "NARRATION",
            "text": "Lesson overview and expected outcomes."
          },
          {
            "type": "VISUAL",
            "text": "Timeline showing all lesson segments."
          }
        ]
      }
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
        "code": "missing_section",
        "message": "Missing section \"3. EVENTS\"",
        "path": [
          "intents"
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

- Right: use `md.literal(...)` in every discriminated variant.
- Wrong: use `md.string()` for the discriminator and lose deterministic variant routing.

Common error: mixing `labels([...]).values(...)` (simple values) with `entries(...).each(...)` (typed objects).



