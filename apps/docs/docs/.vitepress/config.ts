import { defineConfig } from "vitepress";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiTypePages = [
  { text: "document", slug: "document" },
  { text: "object", slug: "object" },
  { text: "section", slug: "section" },
  { text: "heading", slug: "heading" },
  { text: "headingText", slug: "heading-text" },
  { text: "match", slug: "match" },
  { text: "union", slug: "union" },
  { text: "discriminatedUnion", slug: "discriminated-union" },
  { text: "metadataObject", slug: "metadata-object" },
  { text: "metadata", slug: "metadata" },
  { text: "block", slug: "block-list" },
  { text: "string", slug: "string" },
  { text: "email", slug: "email" },
  { text: "number", slug: "number" },
  { text: "boolean", slug: "boolean" },
  { text: "url", slug: "url" },
  { text: "date", slug: "date" },
  { text: "literal", slug: "literal" },
  { text: "enum", slug: "enum" },
  { text: "array", slug: "array" },
  { text: "tuple", slug: "tuple" },
  { text: "record", slug: "record" },
  { text: "list", slug: "list" },
  { text: "preprocess", slug: "preprocess" },
  { text: "coerce", slug: "coerce" },
  { text: "wrappers", slug: "wrappers" },
  { text: "errorMap APIs", slug: "error-map" },
];

const docsDir = path.dirname(fileURLToPath(import.meta.url));
const typesDir = path.resolve(docsDir, "..", "api", "types");
const auxDir = path.resolve(docsDir, "..", "api", "aux");
const typeMethodsManifestPath = path.join(typesDir, "type-methods.json");
const typeMethodsManifest: Record<
  string,
  {
    methods: Array<{ text: string; slug: string }>;
    sharedAux: string[];
  }
> = fs.existsSync(typeMethodsManifestPath)
  ? JSON.parse(fs.readFileSync(typeMethodsManifestPath, "utf8"))
  : {};

const auxPages = fs.existsSync(auxDir)
  ? fs
      .readdirSync(auxDir)
      .filter((file) => file.endsWith(".md") && file !== "index.md")
      .map((file) => file.replace(/\.md$/, ""))
      .sort()
  : [];

function methodPageExists(typeSlug: string, methodSlug: string): boolean {
  return fs.existsSync(path.join(typesDir, typeSlug, `${methodSlug}.md`));
}

function typeIndexExists(typeSlug: string): boolean {
  return fs.existsSync(path.join(typesDir, typeSlug, "index.md"));
}

function auxPageExists(slug: string): boolean {
  return fs.existsSync(path.join(auxDir, `${slug}.md`));
}

const apiByTypeItems = apiTypePages.map(({ text, slug }) => ({
  text,
  collapsed: true,
  items: (() => {
    const methodEntries = (typeMethodsManifest[slug]?.methods ?? []).filter(
      (entry) => methodPageExists(slug, entry.slug),
    );

    type SidebarMethodItem = {
      text: string;
      link?: string;
      collapsed?: boolean;
      items?: SidebarMethodItem[];
    };

    const methodItems: SidebarMethodItem[] = [];

    const getOrCreateGroup = (
      container: SidebarMethodItem[],
      textLabel: string,
    ): SidebarMethodItem => {
      const existing = container.find(
        (item) => item.text === textLabel && Array.isArray(item.items),
      );
      if (existing) {
        return existing;
      }

      const created: SidebarMethodItem = {
        text: textLabel,
        collapsed: false,
        items: [],
      };
      container.push(created);
      return created;
    };

    for (const entry of methodEntries) {
      const segments = entry.text
        .split("->")
        .map((segment) => segment.trim())
        .filter(Boolean);

      if (segments.length === 0) {
        continue;
      }

      if (segments.length === 1) {
        methodItems.push({
          text: segments[0],
          link: `/api/types/${slug}/${entry.slug}`,
        });
        continue;
      }

      let currentContainer = methodItems;
      for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const isLeaf = index === segments.length - 1;

        if (isLeaf) {
          currentContainer.push({
            text: segment,
            link: `/api/types/${slug}/${entry.slug}`,
          });
          continue;
        }

        const group = getOrCreateGroup(currentContainer, segment);
        currentContainer = group.items ?? [];
        group.items = currentContainer;
      }
    }

    return [
      ...(typeIndexExists(slug)
        ? [{ text: "overview", link: `/api/types/${slug}/` }]
        : []),
      ...methodItems,
    ];
  })(),
}));

export default defineConfig({
  title: "@markschema/mdshape",
  description: "Type-safe Markdown validation with a Zod-like API.",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: "https://docs.markschema.com",
  },
  head: [
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "mdshape — Type-safe Markdown Validation" }],
    ["meta", { property: "og:description", content: "Parse, validate, and convert Markdown into strongly-typed JSON. Built for RAG pipelines, PDF-to-MD validation, and structured content ingestion." }],
    ["meta", { property: "og:url", content: "https://docs.markschema.com" }],
    ["meta", { property: "og:site_name", content: "markschema" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "mdshape — Type-safe Markdown Validation" }],
    ["meta", { name: "twitter:description", content: "Parse, validate, and convert Markdown into strongly-typed JSON. Built for RAG pipelines, PDF-to-MD validation, and structured content ingestion." }],
    ["meta", { property: "og:image", content: "https://docs.markschema.com/og.png" }],
    ["meta", { name: "twitter:image", content: "https://docs.markschema.com/og.png" }],
    ["link", { rel: "canonical", href: "https://docs.markschema.com" }],
    ["meta", { name: "theme-color", content: "#000000" }],
    ["meta", { name: "author", content: "Refiski" }],
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["script", { type: "application/ld+json" }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "mdshape",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "description": "Type-safe Markdown validation with a Zod-like API. Parse, validate, and convert Markdown into strongly-typed JSON.",
      "url": "https://docs.markschema.com",
      "author": {
        "@type": "Organization",
        "name": "Refiski",
        "url": "https://refiski.com"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "license": "https://opensource.org/licenses/MIT",
      "isAccessibleForFree": true,
      "codeRepository": "https://github.com/markschema/markschema"
    })],
  ],
  themeConfig: {
    nav: [
      { text: "Getting Started", link: "/getting-started" },
      { text: "Playground", link: "/playground/" },
      { text: "API by Type", link: "/api/" },
      { text: "Interactions", link: "/api/interactions/section-composition" },
      { text: "Error Handling", link: "/guides/error-handling" },
      { text: "Examples", link: "/examples/runbook-fraud" },
      { text: "llms.txt", link: "/llms.txt" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Overview", link: "/" },
          { text: "Getting Started", link: "/getting-started" },
          { text: "Playground", link: "/playground/" },
          { text: "API Coverage Map", link: "/api/" },
        ],
      },
      {
        text: "API by Type",
        items: apiByTypeItems,
      },
      {
        text: "Auxiliaries",
        items: [
          { text: "overview", link: "/api/aux/" },
          { text: "caseInsensitive", link: "/api/aux/case-insensitive" },
          ...auxPages
            .filter((aux) => aux !== "case-insensitive")
            .map((aux) => ({ text: aux, link: `/api/aux/${aux}` })),
        ],
      },
      {
        text: "Interactions",
        items: [
          {
            text: "section composition",
            link: "/api/interactions/section-composition",
          },
          {
            text: "blockOrder options",
            link: "/api/interactions/block-order-options",
          },
          {
            text: "sequence and each",
            link: "/api/interactions/sequence-and-each",
          },
          {
            text: "match composition",
            link: "/api/interactions/match-composition",
          },
          {
            text: "union in markdown",
            link: "/api/interactions/unions-in-markdown",
          },
          {
            text: "wrappers + transform + pipeline",
            link: "/api/interactions/wrappers-transform-pipeline",
          },
          {
            text: "object ergonomics",
            link: "/api/interactions/object-ergonomics",
          },
          {
            text: "object policies",
            link: "/api/interactions/object-policies",
          },
          {
            text: "advanced markdown blocks",
            link: "/api/interactions/advanced-markdown-blocks",
          },
          {
            text: "document order + frontmatter",
            link: "/api/interactions/document-order-frontmatter",
          },
        ],
      },
      {
        text: "Error Handling",
        items: [
          { text: "Errors and Formatting", link: "/guides/error-handling" },
        ],
      },
      {
        text: "End-to-End Examples",
        items: [
          { text: "Fraud Runbook (Advanced)", link: "/examples/runbook-fraud" },
          {
            text: "Incident Postmortem Pipeline",
            link: "/examples/incident-postmortem-pipeline",
          },
          {
            text: "Compliance Audit Pack",
            link: "/examples/compliance-audit-pack",
          },
          {
            text: "Risk Control Matrix",
            link: "/examples/risk-control-matrix",
          },
          { text: "Builder Showcase", link: "/examples/builder-showcase" },
          { text: "Lesson Schema", link: "/examples/lesson-schema" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/markschema/markschema" },
    ],
    search: {
      provider: "local",
    },
  },
});
