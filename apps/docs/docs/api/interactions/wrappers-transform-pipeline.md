# Interaction: optional/nullable/default + transform/pipeline

This flow models a realistic ingestion path:
- accept optional metadata (`optional`, `nullable`),
- normalize values (`transform`),
- and enforce final typed bounds (`pipeline`).

Use this composition when raw markdown carries loosely formatted values but your downstream system requires strict typed output.
Avoid this pattern when values are already strongly typed and direct schemas are sufficient.

## Input Markdown

```md
## 1. META

- Alias: ALEX
- Score: 7
```


