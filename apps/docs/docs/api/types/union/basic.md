# union

Type: `union`

Signature: `md.union([schemaA, schemaB, ...])`

## What It Is

`md.union([...])` validates one input value against multiple schema branches and accepts the first branch that passes validation. It is commonly used when markdown content can represent the same field in different formats, such as a literal status string or a numeric score after coercion. If no branch matches, mdshape returns `invalid_union` with branch-level diagnostics so you can trace why each candidate failed.

## When to Use

Use `md.union([...])` when authors are allowed to express the same semantic field in more than one canonical format, but you still want strict validation. It is a good fit for migrations and mixed authoring states where documents are not yet normalized to a single representation. Avoid it when one format should be mandatory, because a single schema is easier to debug and enforces tighter contracts.

### `md.union([schemaA, schemaB, ...])`

### Input Markdown

```md
## 1. META

- Status: 7
```

### Schema

```ts
import { md } from "@markschema/mdshape";

const statusSchema = md.union([
  md.literal("ACTIVE"),
  md
    .string()
    .transform((value) => Number(value))
    .pipeline(md.number().int().min(0).max(10)),
]);

const schema = md.document({
  meta: md.section("1. META").fields({
    Status: statusSchema,
  }),
});
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "meta": {
      "Status": 7
    }
  }
}
```

#### Error

Failure trigger: the value does not match any union branch (for example `Status: UNKNOWN`) and mdshape returns `invalid_union`.

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "missing_section",
        "message": "Missing section \"1. META\"",
        "path": [
          "meta"
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



