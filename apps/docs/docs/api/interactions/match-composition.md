# Interaction: match.label + labels.values + labels.entries.each

## Input Markdown

```md
### Step A

**Classification:** TIMELESS
**NARRATION:** Analyst reviewed risk signals.
**VISUAL:** Dashboard snapshot.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.section('3. EVENTS').headingLevel(3).each(
  md.object({
    classification: md.match.label('Classification').value(md.enum(['TIME_BOUND', 'TIMELESS', 'HYBRID'])),
    values: md.match.labels(['NARRATION', 'VISUAL']).values(md.string().min(10)),
    entries: md
      .match.labels(['NARRATION', 'VISUAL'])
      .entries({ nameKey: 'type', contentKey: 'text' })
      .each(
        md.discriminatedUnion('type', [
          md.object({ type: md.literal('NARRATION'), text: md.string().min(10) }),
          md.object({ type: md.literal('VISUAL'), text: md.string().min(10) }),
        ]),
      ),
  }),
)
```

### Result

#### Success

```json
{
  "success": true,
  "data": [
    {
      "classification": "TIMELESS",
      "values": [
        "Analyst reviewed risk signals.",
        "Dashboard snapshot."
      ],
      "entries": [
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
```

#### Error

Failure trigger: The input violates one or more constraints declared in the schema; use `issues[].path` and `issues[].code` to locate the exact failing node.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_labeled_value",
        "path": [
          0,
          "classification"
        ]
      }
    ]
  }
}
```





