# subsections

Type: `section`

Signature: `section().subsections(depth) (alias of headingLevel(depth))`

## What It Is

On this page, `section().subsections(depth) (alias of headingLevel(depth))` centers on document-level structure checks, label-based matching, and boundary constraints to keep `subsections` parsing deterministic and schema-driven. The example expects 1 h1 heading, 1 h2 section, and 1 h3 subsection and returns top-level keys `scenes` directly from the declared `subsections` extraction rules. Violations produce issue codes like `missing_section`, which avoids brittle string checks and keeps `subsections` failure handling explicit.

## When to Use

Apply `section().subsections(depth) (alias of headingLevel(depth))` when your document flow requires section-scoped extraction where headings anchor each data slice for `subsections` and strict schema adherence over permissive parsing. It is less suitable for free-form notes with unstable section names under `subsections`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()`, `section()`, `subsections()`, and `each()` around `section().subsections(depth) (alias of headingLevel(depth))` to keep `subsections` contracts transparent and reduce ambiguity in validation behavior.

### `section().subsections(depth) (alias of headingLevel(depth))`

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



















