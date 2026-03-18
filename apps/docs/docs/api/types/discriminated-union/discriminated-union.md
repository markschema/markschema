# discriminatedUnion

Type: `discriminated-union`

Signature: `md.discriminatedUnion(discriminator, variants)`

## What It Is

`md.discriminatedUnion(discriminator, variants)` validates object-like values by first reading a discriminator key (for example `type`) and then selecting a single matching variant schema. It avoids trying all branches blindly, which keeps validation deterministic and error reporting focused on the selected variant. In markdown workflows, this is useful when labeled entries are converted to typed records and each label maps to a distinct variant contract.

## When to Use

Use `md.discriminatedUnion(...)` when each input item has a stable tag field and variant-specific constraints, such as `NARRATION` vs `VISUAL`. It is preferred over plain `union` when you want clearer branch selection and tighter diagnostics around invalid tags or missing discriminator values. Avoid it when no reliable discriminator exists, because plain `union` is better for untagged alternatives.

### `md.discriminatedUnion(discriminator, variants)`

### Input Markdown

```md
## 3. EVENTS

### Step A

**NARRATION:** Analyst reviewed risk signals.

**VISUAL:** Dashboard snapshot.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const intent = md.discriminatedUnion('type', [
  md.object({ type: md.literal('NARRATION'), text: md.string().min(10) }),
  md.object({ type: md.literal('VISUAL'), text: md.string().min(5) }),
])

const schema = md.document({
  events: md
    .section('3. EVENTS')
    .subsections(3)
    .each(
      md.object({
        title: md.headingText(),
        intents: md.match
          .labels(['NARRATION', 'VISUAL'])
          .entries({ nameKey: 'type', contentKey: 'text' })
          .each(intent)
          .min(1),
      }),
    )
    .min(1),
})
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "title": "Step A",
        "intents": [
          {
            "type": "NARRATION",
            "text": "Analyst reviewed risk signals."
          },
          {
            "type": "VISUAL",
            "text": "Dashboard snapshot."
          }
        ]
      }
    ]
  }
}
```

#### Error

Failure trigger: the discriminator key is missing or does not match any declared variant (for example using `entries({ nameKey: 'label', ... })` while discriminator is `type`).

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"3. EVENTS\"",
        "path": [
          "events"
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



