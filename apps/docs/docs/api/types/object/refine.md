# refine

Type: `object`

Signature: `schema.refine(predicate, options?)`

## What It Is

`refine` adds a post-parse rule that runs after the base schema has already validated structure and primitive constraints. It receives the parsed value and can enforce cross-field conditions that normal field-level validators cannot express, such as dependencies between optional keys. When the predicate returns false, mdshape emits `refine_failed` (or a custom code) and can target a specific nested path through `options.path`.

## When to Use

Use `refine` when validity depends on relationships inside the parsed object instead of isolated constraints on each field. A common example is conditional requirements, like making `owner` mandatory only when `priority` is present, while keeping both fields optional in general parsing flows. Avoid using it for simple checks already handled by native validators, because that duplicates logic and reduces schema readability.

### `schema.refine(predicate, options?)`

### Input Markdown

```md
# RUNBOOK: Object Refine

## 0. META

- service: fraud-api
- priority: 3
- owner: risk-platform
```

### Schema

```ts
import { md } from "@markschema/mdshape";

const metaSchema = md
  .section("0. META")
  .fields({
    service: md.string().min(3),
    priority: md.coerce.number().pipeline(md.number().int().min(0)).optional(),
    owner: md.string().min(3).optional(),
  })
  .refine(
    (data) => (data.priority !== undefined ? data.owner !== undefined : true),
    {
      path: ["owner"],
      message: "owner is required when priority is present",
    },
  );

const schema = md.document({
  title: md.heading(1),
  data: metaSchema,
});
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "title": "RUNBOOK: Object Refine",
    "data": {
      "service": "fraud-api",
      "priority": 3,
      "owner": "risk-platform"
    }
  }
}
```

#### Error

Failure trigger: remove `owner` while keeping `priority`; the refine predicate fails and reports the issue at `data.owner`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_heading",
        "message": "Missing heading with depth 1",
        "path": [
          "title"
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



