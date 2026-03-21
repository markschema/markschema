<p align="center">
  <img src="src/assets/logo.png" width="200px" align="center" alt="mdshape logo" />
  <h1 align="center">mdshape</h1>
  <p align="center">
    Type-safe Markdown validation with a schema-first API
    <br/>
    by <a href="https://github.com/dkdaniz">@dkdaniz</a>
  </p>
</p>
<br/>

<p align="center">
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/markschema/markschema" alt="License"></a>
<a href="https://www.npmjs.com/package/@markschema/mdshape" rel="nofollow"><img src="https://img.shields.io/npm/dw/@markschema/mdshape.svg" alt="npm"></a>
<a href="https://github.com/markschema/markschema" rel="nofollow"><img src="https://img.shields.io/github/stars/markschema/markschema" alt="stars"></a>
</p>

<div align="center">
  <a href="https://docs.markschema.com">Docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/markschema/markschema">GitHub</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/dkdaniz">𝕏</a>
  <br />
</div>

<br/>
<br/>

### [Read the docs →](https://docs.markschema.com)

<br/>
<br/>

## What is mdshape?

mdshape transforms unstructured Markdown into typed, validated data. You define a schema — sections, fields, frontmatter, lists — and mdshape parses the Markdown AST, extracts the values, and returns precise errors when the document doesn't match.

<br/>

## Features

- **Schema-driven extraction** — define schemas with `document()`, `section()`, `match()`, and `block()`, get typed JSON back
- **Type-safe** — full TypeScript type inference from your schemas
- **Structure validation** — enforce heading order, section sequence, field presence, and block constraints
- **Rich block support** — tables, code blocks, Mermaid diagrams, math expressions, footnotes, images, and links — all typed in a single schema
- **GitHub Flavored Markdown** — tables, task lists, strikethrough out of the box
- **Math** — LaTeX notation via remark-math
- **Frontmatter** — YAML parsing and validation with `metadata()` and `metadataObject()`
- **Typed diagnostics** — issue code, field path, line number, column position, and actionable messages
- **RAG-ready** — convert Markdown to structured, typed JSON chunks ready for vector databases
- **Composable** — schemas compose like Zod: `.optional()`, `.default()`, `.refine()`, `.transform()`, `.pipeline()`
- **Zero config** — works out of the box with sensible defaults
- **Zero external runtime** — built on top of remark, no additional dependencies needed

<br/>

## Installation

```sh
npm install @markschema/mdshape
```

<br/>

## Basic usage

Say you have a Markdown file like this:

```md
---
title: mdshape
version: 1
---

# What is mdshape?

## Overview

- Name: mdshape
- Category: Schema Validation
- License: MIT

## Description

**mdshape** is a TypeScript library that lets you define schemas for Markdown
documents. Think of it as **Zod or Yup for Markdown** — it parses and validates
the structure of your `.md` files, extracting typed data you can trust.

## Use Cases

### RAG Pipelines

**SUMMARY:** Validate Markdown before feeding it into your retrieval-augmented
generation pipeline. Catch structural errors early and ensure consistent
document formats.

### PDF-to-Markdown

**SUMMARY:** After converting PDFs to Markdown, use mdshape to verify the output
matches your expected structure — headings, sections, metadata, and fields.

### Documentation Standards

**SUMMARY:** Enforce consistent structure across your docs: required sections,
valid metadata, and properly formatted content.
```

You define a schema that describes the expected structure:

```ts
import { md } from "@markschema/mdshape";

const useCaseSchema = md.object({
  title: md.headingText(),
  summary: md.match.label("SUMMARY").value(md.string().min(20)),
});

const schema = md.document({
  metadata: md.metadataObject(
    md.object({
      title: md.string().min(1),
      version: md.coerce.number().pipeline(md.number().int().min(1)),
    }),
  ),
  title: md.heading(1),
  overview: md.section("Overview").fields({
    Name: md.string().min(1),
    Category: md.string(),
    License: md.enum(["MIT", "Apache-2.0", "GPL-3.0"]),
  }),
  description: md.section("Description").paragraph(),
  useCases: md.section("Use Cases").subsections(3).each(useCaseSchema).min(2),
});
```

### Parsing data

Use `.safeParse` to validate the Markdown string against your schema. If it's valid, you get back strongly-typed, validated data.

```ts
const result = schema.safeParse(markdownString);

if (result.success) {
  console.log(result.data);
}
```

Output:

```json
{
  "metadata": {
    "title": "mdshape",
    "version": 1
  },
  "title": "What is mdshape?",
  "overview": {
    "Name": "mdshape",
    "Category": "Schema Validation",
    "License": "MIT"
  },
  "description": "mdshape is a TypeScript library that lets you define schemas for Markdown documents. Think of it as Zod or Yup for Markdown — it parses and validates the structure of your .md files, extracting typed data you can trust.",
  "useCases": [
    {
      "title": "RAG Pipelines",
      "summary": "Validate Markdown before feeding it into your retrieval-augmented generation pipeline. Catch structural errors early and ensure consistent document formats."
    },
    {
      "title": "PDF-to-Markdown",
      "summary": "After converting PDFs to Markdown, use mdshape to verify the output matches your expected structure — headings, sections, metadata, and fields."
    },
    {
      "title": "Documentation Standards",
      "summary": "Enforce consistent structure across your docs: required sections, valid metadata, and properly formatted content."
    }
  ]
}
```

You can also use `.parse()` which returns data directly or throws a `TypeMdError` on failure:

```ts
const data = schema.parse(markdownString);
```

### Handling errors

When validation fails, `.safeParse()` returns detailed errors with position information pointing to the exact location in the original Markdown.

```ts
const result = schema.safeParse(invalidMarkdown);

if (!result.success) {
  result.error.issues;
  /* [
    {
      code: 'invalid_type',
      path: ['metadata', 'title'],
      message: 'Expected string',
      position: { start: { line: 2, column: 1 } }
    }
  ] */
}
```

<br/>

## Main builders

| Builder                                             | Description                   |
| --------------------------------------------------- | ----------------------------- |
| `md.document()`                                     | Root document schema          |
| `md.section()`                                      | Groups content under headings |
| `md.heading()`                                      | Validates headings by level   |
| `md.headingText()`                                  | Extracts heading text         |
| `md.block()`                                        | Block-level elements          |
| `md.object()`                                       | Extracts structured fields    |
| `md.metadata()`                                     | Validates YAML frontmatter    |
| `md.match()`                                        | Pattern matching with labels  |
| `md.string()` `md.number()` `md.boolean()`          | Typed primitives              |
| `md.email()` `md.url()` `md.date()`                 | Specialized primitives        |
| `md.enum()` `md.literal()`                          | Restricted values             |
| `md.array()` `md.tuple()` `md.list()` `md.record()` | Collections                   |
| `md.union()` `md.discriminatedUnion()`              | Composite types               |
| `md.preprocess()` `md.coerce()`                     | Input transforms              |
