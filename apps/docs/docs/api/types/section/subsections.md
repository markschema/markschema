# subsections

Type: `section`

Signature: `section().subsections(depth)`

## What It Is

`section().subsections(depth)` selects direct child headings inside a matched section, but it does not extract values by itself. It is a builder step that must be completed with `.each(...)` so each subsection can be parsed with a schema, and the example returns top-level keys `scenes` only after the selected subsections are mapped through the declared child schema. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `subsections` failure handling explicit.

## When to Use

Apply `section().subsections(depth)` when your document flow requires section-scoped extraction where headings anchor each data slice for `subsections` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `subsections`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `subsections()`, and `each()` together so the subsection selector is followed by the schema that actually extracts data from each matched child section.

### `section().subsections(depth)`

`subsections(depth)` alone only narrows the matched child sections. It becomes a usable schema when you add `.each(childSchema)`.

### Input Markdown

```md
## 5. TIMELINE

### Step A

**NARRATION:** Validate signals.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const schema = md.document({
  scenes: md
    .section('5. TIMELINE')
    .subsections(3)
    .each(
      md.object({
        title: md.headingText(),
        narration: md.match.label('NARRATION').value(md.string().min(10)),
      }),
    )
    .min(1),
})
```

### Why `.each(...)` is required

```ts
const builder = md.section('5. TIMELINE').subsections(3)
```

`builder` only points at the `###` subsections inside `## 5. TIMELINE`. It does not say what to read from each subsection, so it does not extract output on its own. The extraction starts here:

```ts
const scenes = md
  .section('5. TIMELINE')
  .subsections(3)
  .each(
    md.object({
      title: md.headingText(),
      narration: md.match.label('NARRATION').value(md.string()),
    }),
  )
```

In that form, each matched subsection is parsed with the object schema, producing one array item per subsection.

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "scenes": [
      {
        "title": "Step A",
        "narration": "Validate signals."
      }
    ]
  }
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
        "code": "missing_section",
        "message": "Missing section \"5. TIMELINE\"",
        "path": [
          "scenes"
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



