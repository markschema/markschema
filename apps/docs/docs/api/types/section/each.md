# each

Type: `section`

Signature: `section().subsections(depth).sequence([...]).each(...).min(...)`

## What It Is

`section().subsections(depth).sequence([...]).each(...).min(...)` is used here as a contract-first parser powered by document-level structure checks, label-based matching, and ordered section validation for `each` scenarios. With `object()`, `headingText()`, `label()`, and `value()` in the schema, 1 h1 heading, 1 h2 section, and 2 h3 subsections is converted into top-level keys `scenes` without manual `each` post-processing. Error cases report issue codes like `missing_section`, making operational diagnostics for `each` flows consistent across local runs and CI.

## When to Use

This method is a strong fit for section-scoped extraction where headings anchor each data slice where deterministic `each` parsing matters more than free-form flexibility. Do not default to it for free-form notes with unstable section names around `each`; the main cost is ordering constraints that reduce flexibility but improve consistency. For best results, compose `section().subsections(depth).sequence([...]).each(...).min(...)` with `object()`, `headingText()`, `label()`, and `value()` so `each` schema intent stays readable and output remains predictable.

### `section().subsections(depth).sequence([...]).each(...).min(...)`

### Input Markdown

```md
## 5. TIMELINE

### [00:00-02:00] - Intake

**NARRATION:** Validate input quality before escalation.

### [02:00-04:00] - Containment

**NARRATION:** Apply containment and verify rollback path.
```

### Schema

```ts
import { md } from '@markschema/mdshape'

const scene = md.object({
  title: md.headingText(),
  narration: md.match.label('NARRATION').value(md.string().min(20)),
})

const schema = md.document({
  scenes: md
    .section('5. TIMELINE')
    .subsections(3)
    .sequence(['[00:00-02:00] - Intake', '[02:00-04:00] - Containment'])
    .each(scene)
    .min(2),
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
        "title": "[00:00-02:00] - Intake",
        "narration": "Validate input quality before escalation."
      },
      {
        "title": "[02:00-04:00] - Containment",
        "narration": "Apply containment and verify rollback path."
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


















