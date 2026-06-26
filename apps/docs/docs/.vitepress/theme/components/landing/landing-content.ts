/* ─── Centralized landing page copy ─── */

export const meta = {
  title: "mdshape — Turn Markdown into Typed JSON",
  description:
    "Parse, validate, and convert markdown into strongly-typed JSON. Built for RAG pipelines, PDF-to-MD validation, Skills authoring, and any workflow where markdown structure matters.",
};

export const hero = {
  releasePill: "Latest Release: mdshape Core v0.1",
  releasePillHref: "/getting-started",
  titleBefore: "Turn Markdown into",
  titleAfter: "with a Single Schema",
  rotatingPhrases: ["Typed JSON", "Validated Structure", "RAG-Ready Output"],
  subtitle:
    "Define a schema, parse any markdown, get strongly-typed JSON back. Built for RAG pipelines, PDF-to-MD validation, AI Skills, and structured content ingestion.",
  ctaPrimary: { label: "Open Playground", href: "https://playground.markschema.com" },
  ctaSecondary: { label: "View Getting Started", href: "/getting-started" },
  signals: ["document()", "section()", "match()", "block()"],
  orbitItems: ["Parse MD", "Validate", "Extract", "Typed JSON"],
};

export const problem = {
  eyebrow: "The Problem",
  title: "Markdown Is Everywhere, but Parsing It Is a Mess",
  description:
    "You get markdown from converters, authors, and imports. But turning it into usable, structured data always ends in fragile custom code.",
  costs: [
    {
      title: "PDF-to-MD output is unpredictable",
      description:
        "Converter tools produce markdown with inconsistent headings, broken tables, and missing structure. Without validation, bad output silently enters your pipeline.",
    },
    {
      title: "RAG ingestion breaks on unstructured markdown",
      description:
        "Chunking raw markdown for vector databases loses context. Without typed extraction, your retrieval quality degrades and you can't trust what's stored.",
    },
    {
      title: "Every team writes its own parser glue",
      description:
        "Remark plugins, regex extraction, Zod schemas stitched together — each project reinvents markdown parsing with a fragile, untested custom layer.",
    },
  ],
  ctaPrimary: { label: "See How mdshape Solves This", href: "/playground/" },
};

export const proof = {
  eyebrow: "Built and Documented",
  title: "Production-Grade, Not a Prototype",
  items: [
    { value: "27", label: "Type builders" },
    { value: "129", label: "API type pages" },
    { value: "102", label: "Mapped methods" },
    { value: "10", label: "Interaction guides" },
    { value: "6", label: "E2E examples" },
    { value: "9", label: "Runtime tests" },
  ],
};

export const features = {
  eyebrow: "Core Capabilities",
  title: "From Raw Markdown to Structured Data",
  description:
    "mdshape handles parsing, validation, and typed extraction in a single runtime — so you stop writing custom glue for every project.",
  cards: [
    {
      title: "Schema-Driven Extraction",
      description:
        "Define what you expect with document(), section(), match(), and block(). mdshape parses the markdown and returns typed JSON matching your schema.",
      signal: "MD → JSON",
      trust: "One schema, deterministic output every time.",
      kind: "dsl" as const,
    },
    {
      title: "Structure Validation",
      description:
        "Enforce heading order, section sequence, field presence, and block constraints. Catch converter errors and authoring drift before they reach your database.",
      signal: "Validation",
      trust: "Validate PDF-to-MD output, imports, and authored files.",
      kind: "order" as const,
    },
    {
      title: "Rich Block Support",
      description:
        "Extract and validate tables, code blocks, mermaid diagrams, math, footnotes, images, and links — all in the same schema, all typed.",
      signal: "Full Coverage",
      trust: "No separate extraction logic for advanced content.",
      kind: "blocks" as const,
    },
    {
      title: "Typed Diagnostics",
      description:
        "When validation fails, get the exact issue code, field path, line number, and position. No more guessing why your pipeline rejected a document.",
      signal: "Actionable Errors",
      trust: "Triage in seconds, not minutes.",
      kind: "issues" as const,
    },
    {
      title: "RAG-Ready Extraction",
      description:
        "Convert markdown into structured, typed JSON chunks with full context preserved — ready to store in your vector database without lossy text splitting.",
      signal: "RAG Pipeline",
      trust: "Structured chunks, not raw text fragments.",
      kind: "rag" as const,
    },
  ],
};

export const howItWorks = {
  eyebrow: "How It Works",
  title: "Markdown In, Typed JSON Out",
  description:
    "Three steps: your markdown, your schema, your structured data. Works with any source — PDF converters, authored docs, imported files.",
  steps: [
    {
      label: "Step 1",
      title: "Your Markdown",
      copy: "From a PDF converter, a content author, an import tool, or any other source.",
      code: `# RUNBOOK: Payment Risk Incident

## 1. OWNER
- Name: Alex Turner
- Email: alex@zayra.com

## 2. SEVERITY
- Level: P1
- Escalation: immediate
`,
    },
    {
      label: "Step 2",
      title: "Your Schema",
      copy: "Define the structure you expect. mdshape validates and extracts in one pass.",
      code: `const schema = md.document({
  title: md.heading(1),
  owner: md.section('1. OWNER').fields({
    Name: md.string(),
    Email: md.email(),
  }),
  severity: md.section('2. SEVERITY').fields({
    Level: md.string(),
    Escalation: md.string(),
  }),
})`,
    },
    {
      label: "Step 3",
      title: "Typed JSON",
      copy: "Get structured, strongly-typed output ready for your database, RAG pipeline, or API.",
      code: `{
  "success": true,
  "data": {
    "title": "RUNBOOK: Payment Risk Incident",
    "owner": {
      "Name": "Alex Turner",
      "Email": "alex@zayra.com"
    },
    "severity": {
      "Level": "P1",
      "Escalation": "immediate"
    }
  }
}`,
    },
  ],
  ctaPrimary: { label: "Try It Now", href: "/playground/" },
};

export const comparison = {
  eyebrow: "Comparison",
  title: "Why Not Just Use Remark + Zod?",
  description:
    "You can — but you'll write the glue yourself. Here's what you get out of the box with mdshape vs. assembling your own stack.",
  columns: [
    { key: "mdshape", label: "mdshape" },
    { key: "zodRemark", label: "Zod + remark" },
    { key: "markdoc", label: "Markdoc" },
    { key: "contentlayer", label: "Contentlayer" },
    { key: "valibot", label: "Valibot + custom" },
  ] as const,
  rows: [
    {
      capability: "Markdown → typed JSON in one call",
      mdshape: "Native" as const,
      zodRemark: "Custom required" as const,
      markdoc: "Custom required" as const,
      contentlayer: "Partial" as const,
      valibot: "Custom required" as const,
    },
    {
      capability:
        "Structure validation (heading order, section sequence, field presence)",
      mdshape: "Native" as const,
      zodRemark: "Custom required" as const,
      markdoc: "Custom required" as const,
      contentlayer: "Custom required" as const,
      valibot: "Custom required" as const,
    },
    {
      capability: "Rich block extraction (tables, mermaid, math, footnotes)",
      mdshape: "Native" as const,
      zodRemark: "Custom required" as const,
      markdoc: "Partial" as const,
      contentlayer: "Partial" as const,
      valibot: "Custom required" as const,
    },
    {
      capability: "Typed diagnostics with code, path, and line number",
      mdshape: "Native" as const,
      zodRemark: "Partial" as const,
      markdoc: "Partial" as const,
      contentlayer: "Partial" as const,
      valibot: "Partial" as const,
    },
    {
      capability: "Ready for production without custom integration layer",
      mdshape: "Native" as const,
      zodRemark: "Custom required" as const,
      markdoc: "Custom required" as const,
      contentlayer: "Partial" as const,
      valibot: "Custom required" as const,
    },
  ],
  legend: [
    {
      term: "Native",
      definition: "Works out of the box, no custom code needed.",
    },
    {
      term: "Partial",
      definition: "Possible but requires extra work or has gaps.",
    },
    { term: "Custom required", definition: "You need to build this yourself." },
  ],
  methodologyNote:
    "Based on documented default capabilities as of each tool's latest stable release.",
};

export const faq = {
  eyebrow: "Common Questions",
  title: "Before You Decide",
  items: [
    {
      question: "Can I use it to validate PDF-to-Markdown converter output?",
      answer:
        "Yes. Define a schema with the structure you expect, run safeParse on the converter output, and get typed diagnostics for every deviation — missing headings, wrong field order, broken tables.",
    },
    {
      question: "How does it help with RAG pipelines?",
      answer:
        "Instead of chunking raw markdown and losing context, mdshape extracts structured, typed JSON from your documents. Each field, section, and block becomes a typed entry you can store in your vector database with full context preserved.",
    },
    {
      question: "I write AI Skills with .md files. Does this help?",
      answer:
        "Exactly this use case. Define a schema for your skill format — required sections, field order, metadata — and validate every .md file before it enters your agent pipeline. Catch formatting issues at authoring time, not at runtime.",
    },
    {
      question: "I already use Zod + remark. Why would I switch?",
      answer:
        "You don't have to drop Zod. mdshape replaces the glue layer — the remark plugins, AST walkers, and custom extraction — with a single call. Zod validates values; mdshape validates and extracts markdown structure natively.",
    },
    {
      question: "How much code does it take to get started?",
      answer:
        "A basic schema is under 10 lines. The Playground lets you iterate without installing anything. Most teams go from zero to first validation in under 15 minutes.",
    },
    {
      question: "What exactly does mdshape do that a markdown parser doesn't?",
      answer:
        "A parser turns markdown into an AST. That's it — you still need to walk the tree, extract fields, validate structure, and shape the output yourself. mdshape does all of that in one call: you define a schema, it returns typed JSON or typed errors. No AST manipulation.",
    },
    {
      question: "What happens when the markdown doesn't match the schema?",
      answer:
        'You get a typed error object with every issue: which field is missing, which section is out of order, the exact line and column number. No generic "parse failed" — every failure is actionable.',
    },
    {
      question: "Does it modify my markdown?",
      answer:
        "No. mdshape is read-only. It parses and extracts — it never changes the source markdown. Your files stay portable and untouched.",
    },
    {
      question: "Is the documentation LLM-friendly?",
      answer:
        "Yes. We serve a llms.txt file at docs.markschema.com/llms.txt with the full documentation index — pages, API types, guides, and examples — so LLMs and AI agents can discover and reference our docs natively.",
    },
  ],
  ctaPrimary: { label: "Try It in the Playground", href: "/playground/" },
  ctaSecondary: { label: "Read Getting Started", href: "/getting-started" },
};

export const finalCta = {
  eyebrow: "Get Started",
  title: "Markdown In, Typed JSON Out",
  description:
    "Stop writing custom parsers. Define a schema, validate any markdown, get structured data ready for your database, RAG pipeline, or API.",
  ctaPrimary: { label: "Open Playground", href: "https://playground.markschema.com" },
  ctaSecondary: { label: "View Getting Started", href: "/getting-started" },
  ctaTertiary: { label: "Browse API", href: "/api/" },
};
