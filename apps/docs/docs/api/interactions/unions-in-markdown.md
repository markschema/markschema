# Interaction: union + discriminatedUnion in markdown

## Input Markdown

```md
### Step A

**STATUS:** ACTIVE
**NARRATION:** Analyst handled escalation.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.section('3. EVENTS').subsections(3).each(
  md.object({
    status: md.match.label('STATUS').value(
      md.union([
        md.literal('ACTIVE'),
        md.string().transform((v) => Number(v)).pipeline(md.number().min(0).max(10)),
      ]),
    ),
    intents: md.match
      .labels(['NARRATION', 'VISUAL'])
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
      "status": "ACTIVE",
      "intents": [
        {
          "type": "NARRATION",
          "text": "Analyst handled escalation."
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
        "code": "invalid_union",
        "path": [
          0,
          "status"
        ]
      }
    ]
  }
}
```




