# basic usage

Type: `match`

Signature: `match.labels(names).values(schema)`

## What It Is

This method page uses `match.labels(names).values(schema)` to enforce document-level structure checks over markdown content in `values` use cases. In practice, 1 h1 heading is validated and emitted as top-level keys `title` using `document()` and `heading()` under `values` rules. When constraints are broken, issue codes like `missing_heading` identify exactly which `values` node failed and why.

## When to Use

Apply `match.labels(names).values(schema)` when your document flow requires label-oriented parsing from inline markers in prose for `values` and strict schema adherence over permissive parsing. It is less suitable for documents that lack stable labels or marker prefixes under `values`, because teams must accept more explicit schema maintenance to keep output deterministic. Use `document()` and `heading()` around `match.labels(names).values(schema)` to keep `values` contracts transparent and reduce ambiguity in validation behavior.

### `match.labels(names).values(schema)`

### Input Markdown

```md
## 3. EVENTS

### Detection

**STATUS:** ACTIVE

**SEVERITY:** high
```

### Schema

```ts
import { md } from "@markschema/mdshape";

const schema = md.document({
  events: md
    .section("3. EVENTS")
    .subsections(3)
    .each(
      md.object({
        title: md.headingText(),
        facts: md.match
          .labels(["STATUS", "SEVERITY"])
          .values(md.string().min(1)),
      }),
    ),
});
```

### Result

#### Success

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "title": "Detection",
        "facts": ["ACTIVE", "high"]
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
        "code": "missing_labeled_value",
        "message": "Missing labeled values [STATUS, SEVERITY] in section \"Detection\"",
        "path": ["events", 0, "facts"],
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
