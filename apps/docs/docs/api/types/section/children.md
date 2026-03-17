# children

Type: `section`

Signature: `section().children(depth) (alias of headingLevel(depth))`

## What It Is

`section().children(depth) (alias of headingLevel(depth))` parses markdown with document-level structure checks, label-based matching, and boundary constraints, so this page defines a strict `children` contract instead of permissive text scraping. The schema combines operators such as `document()`, `section()`, `children()`, and `each()` to map 1 h1 heading, 1 h2 section, and 1 h3 subsection into top-level keys `scenes` for this `children` behavior. If parsing fails, the result carries issue codes like `missing_section`, giving the caller precise debugging context for `children` paths.

## When to Use

Use `section().children(depth) (alias of headingLevel(depth))` when you need section-scoped extraction where headings anchor each data slice for `children` workflows and want parsing behavior that remains enforceable in review and CI. Avoid it for free-form notes with unstable section names in `children` documents, because it introduces more explicit schema maintenance to keep output deterministic. It pairs well with `document()`, `section()`, `children()`, and `each()` to keep `children` extraction boundaries explicit while preserving typed output for downstream code.

### `section().children(depth) (alias of headingLevel(depth))`

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
    .children(3)
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



















