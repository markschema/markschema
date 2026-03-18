<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BackgroundRippleEffect from './landing/BackgroundRippleEffect.vue'
import CardsFreeApplicabilityGrid from './landing/CardsFreeApplicabilityGrid.vue'
import CodeBlockTabs from './landing/CodeBlockTabs.vue'
import ComparePane from './landing/ComparePane.vue'
import DottedGlowBackground from './landing/DottedGlowBackground.vue'
import GlowingEffectBorder from './landing/GlowingEffectBorder.vue'

type CompareProfile = {
  id: string
  label: string
  description: string
  slider: number
  markdownSchema: {
    before: string
    after: string
  }
  schemaResult: {
    before: string
    after: string
  }
  codeTabs: Array<{
    name: string
    code: string
    highlightLines?: number[]
  }>
}

const compareProfiles: CompareProfile[] = [
  {
    id: 'strict-contract',
    label: 'Strict Contract',
    description: 'Enforces section labels and typed metadata for high-confidence parse pipelines.',
    slider: 48,
    markdownSchema: {
      before: `# runbook title\n\n## detection stage ???\nstatus : active\nnarration : short\n\n- missing metadata.owner\n- STATUS not normalized`,
      after: `# RUNBOOK: Incident Timeline\n\n## Detection\n**STATUS:** ACTIVE\n**NARRATION:** Alert fired for payment anomaly.\n\n- Owner: platform`,
    },
    schemaResult: {
      before: `const schema = md.document({\n  metadata: md.object({ title: md.string() }),\n  detection: md.section('detection'),\n  status: md.string()\n})`,
      after: `const schema = md.document({\n  metadata: md.metadataObject(\n    md.object({\n      title: md.string().min(4),\n      owner: md.enum(['platform', 'security', 'risk']),\n    }),\n  ),\n  detection: md.section('Detection').fields({\n    STATUS: md.enum(['ACTIVE', 'MITIGATED']),\n    NARRATION: md.string().min(20),\n  }),\n})`,
    },
    codeTabs: [
      {
        name: 'markdown.md',
        highlightLines: [1, 3, 4, 5],
        code: `# RUNBOOK: Incident Timeline\n\n## Detection\n**STATUS:** ACTIVE\n**NARRATION:** Alert fired for payment anomaly.\n\n- Owner: platform`,
      },
      {
        name: 'schema.ts',
        highlightLines: [3, 4, 8, 9, 10],
        code: `import { md } from '@markschema/mdshape'\n\nconst schema = md.document({\n  metadata: md.metadataObject(\n    md.object({\n      title: md.string().min(4),\n      owner: md.enum(['platform', 'security', 'risk']),\n    }),\n  ),\n  detection: md.section('Detection').fields({\n    STATUS: md.enum(['ACTIVE', 'MITIGATED']),\n    NARRATION: md.string().min(20),\n  }),\n})`,
      },
      {
        name: 'result.json',
        highlightLines: [1, 2, 3, 6, 7],
        code: `{"success": true, "data": {\n  "metadata": {"title": "Incident Timeline", "owner": "platform"},\n  "detection": {\n    "STATUS": "ACTIVE",\n    "NARRATION": "Alert fired for payment anomaly."\n  }\n}}`,
      },
    ],
  },
  {
    id: 'ops-hardening',
    label: 'Ops Hardening',
    description: 'Optimized for incident and compliance docs with sequence constraints and stricter thresholds.',
    slider: 58,
    markdownSchema: {
      before: `# POSTMORTEM\n\n## PHASES\nMitigation came before detection.\n\n**SEVERITY:** sev2`,
      after: `# POSTMORTEM: Payment Risk Outage\n\n## 2. PHASES\n### Detection\n**SEVERITY:** SEV2\n\n### Mitigation\n**SEVERITY:** SEV2`,
    },
    schemaResult: {
      before: `const phases = md.section('PHASES').subsections(3)\n\nconst schema = md.document({\n  phases,\n})`,
      after: `const phases = md\n  .section('2. PHASES')\n  .subsections(3)\n  .sequence(['Detection', 'Mitigation'])\n  .each(\n    md.object({\n      title: md.headingText(),\n      severity: md.match.label('SEVERITY').value(md.enum(['SEV1', 'SEV2', 'SEV3'])),\n    }),\n  )`,
    },
    codeTabs: [
      {
        name: 'markdown.md',
        highlightLines: [3, 4, 7],
        code: `# POSTMORTEM: Payment Risk Outage\n\n## 2. PHASES\n### Detection\n**SEVERITY:** SEV2\n\n### Mitigation\n**SEVERITY:** SEV2`,
      },
      {
        name: 'schema.ts',
        highlightLines: [1, 2, 3, 4, 8],
        code: `const phases = md\n  .section('2. PHASES')\n  .subsections(3)\n  .sequence(['Detection', 'Mitigation'])\n  .each(\n    md.object({\n      title: md.headingText(),\n      severity: md.match.label('SEVERITY').value(md.enum(['SEV1', 'SEV2', 'SEV3'])),\n    }),\n  )`,
      },
      {
        name: 'result.json',
        highlightLines: [1, 4, 7],
        code: `{"success": true, "data": {\n  "phases": [\n    {"title": "Detection", "severity": "SEV2"},\n    {"title": "Mitigation", "severity": "SEV2"}\n  ]\n}}`,
      },
    ],
  },
  {
    id: 'multi-channel',
    label: 'Multi-channel Output',
    description: 'Balances authoring freedom and deterministic output for search, agents, and analytics consumers.',
    slider: 52,
    markdownSchema: {
      before: `# GUIDE\n\n## META\n- title: Risk Control Matrix\n- version: ???`,
      after: `# GUIDE: Risk Control Matrix\n\n## 0. META\n- title: Risk Control Matrix\n- version: 3`,
    },
    schemaResult: {
      before: `version: md.string()`,
      after: `version: md.coerce.number().pipeline(md.number().int().min(1))`,
    },
    codeTabs: [
      {
        name: 'markdown.md',
        highlightLines: [1, 3, 4],
        code: `# GUIDE: Risk Control Matrix\n\n## 0. META\n- title: Risk Control Matrix\n- version: 3`,
      },
      {
        name: 'schema.ts',
        highlightLines: [2, 3, 4],
        code: `const schema = md.document({\n  meta: md.section('0. META').fields({\n    title: md.string().min(5),\n    version: md.coerce.number().pipeline(md.number().int().min(1)),\n  }),\n})`,
      },
      {
        name: 'result.json',
        highlightLines: [3, 4],
        code: `{"success": true, "data": {\n  "meta": {\n    "title": "Risk Control Matrix",\n    "version": 3\n  }\n}}`,
      },
    ],
  },
]

const selectedProfileId = ref(compareProfiles[0].id)
const compareMode = ref<'drag' | 'hover'>('drag')
const sharedSplit = ref(compareProfiles[0].slider)

const selectedProfile = computed(
  () => compareProfiles.find((profile) => profile.id === selectedProfileId.value) ?? compareProfiles[0],
)

watch(selectedProfileId, (next) => {
  const target = compareProfiles.find((profile) => profile.id === next) ?? compareProfiles[0]
  sharedSplit.value = target.slider
})

const bentoCards = [
  {
    title: 'Your markdown, structurally refined.',
    description:
      'Normalize long-form markdown into predictable blocks without slowing authoring velocity or editorial iteration.',
    chip: 'MD',
    size: 'large',
  },
  {
    title: 'Schema logic, shaped for real docs.',
    description:
      'Compose mdshape builders into deterministic contracts that stay stable across large doc systems and CI pipelines.',
    chip: 'SCH',
    size: 'large',
  },
  {
    title: 'Custom dictionary rules',
    description: 'Lock operational labels and domain terminology into reusable validation policies.',
    chip: 'DICT',
    size: 'small',
  },
  {
    title: 'Multilingual parsing map',
    description: 'Preserve one schema strategy across language variants and regional documentation.',
    chip: 'I18N',
    size: 'small',
  },
  {
    title: 'Validated result snapshots',
    description: 'Emit typed JSON and actionable issue telemetry in a single runtime flow.',
    chip: 'JSON',
    size: 'small',
  },
] as const

const quadrantCards = [
  {
    eyebrow: 'Structured Parsing',
    lead: 'Servers made simple.',
    tail: 'Validate markdown payloads with deterministic block extraction and strict labels.',
  },
  {
    eyebrow: 'Global Delivery',
    lead: 'Deploy once, parse everywhere.',
    tail: 'Run schema-safe markdown workflows across docs, CMS entries, and automation layers.',
  },
  {
    eyebrow: 'Control Layer',
    lead: 'Total schema control.',
    tail: 'Chain transforms, refinements, and guardrails without brittle regex-only pipelines.',
  },
  {
    eyebrow: 'Observability',
    lead: 'Evaluate to greatness.',
    tail: 'Inspect issue code, path, line, and context before invalid content is shipped.',
  },
]
</script>

<template>
  <main class="msv2-page">
    <section class="msv2-hero">
      <DottedGlowBackground class-name="msv2-dots" :gap="12" :radius="1.2" />
      <BackgroundRippleEffect class-name="msv2-ripple" :rows="8" :cols="24" :cell-size="58" />

      <div class="msv2-hero-grid">
        <div>
          <p class="msv2-badge">Structured Markdown Runtime</p>
          <h1 class="msv2-title">Markdown in. Schema certainty out.</h1>
          <p class="msv2-subtitle">
            mdshape brings a premium schema layer to markdown workflows. Parse, validate, and transform
            content with production-grade diagnostics and composable builders.
          </p>

          <div class="msv2-actions">
            <a class="msv2-btn msv2-btn--primary" href="/getting-started">Get Started</a>
            <a class="msv2-btn msv2-btn--ghost" href="/playground/">Open Playground</a>
            <a class="msv2-btn msv2-btn--ghost" href="/api/">API by Type</a>
          </div>
        </div>

        <GlowingEffectBorder
          class="ms-card ms-card--dark msv2-hero-compare"
          :blur="14"
          :proximity="96"
          :spread="24"
          :movement-duration="1.6"
          :border-width="1"
        >
          <div class="msv2-card-head">
            <span>Live Compare</span>
            <span class="ms-chip">SYNC</span>
          </div>
          <ComparePane
            v-model="sharedSplit"
            :before="selectedProfile.markdownSchema.before"
            :after="selectedProfile.markdownSchema.after"
            :mode="compareMode"
            :autoplay="compareMode === 'drag'"
            :duration="4600"
            :initial="selectedProfile.slider"
            class-name="msv2-hero-compare-pane"
          />
        </GlowingEffectBorder>
      </div>
    </section>

    <section id="compare" class="msv2-panel">
      <header class="msv2-section-head">
        <p class="msv2-eyebrow">Compare Lab</p>
        <h2>Markdown / Schema / Result with chained synchronized compare</h2>
        <p>
          Two visible compares, one global selector for profile and interaction mode. State and content stay synced
          across both stages.
        </p>
      </header>

      <div class="msv2-compare-controls">
        <div class="msv2-control-group" role="tablist" aria-label="Validation profile">
          <button
            v-for="profile in compareProfiles"
            :key="profile.id"
            :class="{ 'is-active': selectedProfileId === profile.id }"
            @click="selectedProfileId = profile.id"
          >
            {{ profile.label }}
          </button>
        </div>

        <div class="msv2-control-group" role="tablist" aria-label="Compare interaction mode">
          <button :class="{ 'is-active': compareMode === 'drag' }" @click="compareMode = 'drag'">Drag</button>
          <button :class="{ 'is-active': compareMode === 'hover' }" @click="compareMode = 'hover'">Hover</button>
        </div>
      </div>

      <p class="msv2-profile-description">{{ selectedProfile.description }}</p>

      <div class="msv2-compare-grid">
        <GlowingEffectBorder class="ms-card ms-card--dark" :blur="12" :proximity="120" :spread="22">
          <p class="msv2-compare-chip">STAGE 1</p>
          <h3 class="msv2-compare-title">Markdown ↔ Schema</h3>
          <p class="msv2-compare-description">Raw authoring versus normalized structure ready for strict validation.</p>
          <ComparePane
            v-model="sharedSplit"
            :before="selectedProfile.markdownSchema.before"
            :after="selectedProfile.markdownSchema.after"
            :mode="compareMode"
            :autoplay="false"
            :duration="4800"
            :initial="selectedProfile.slider"
          />
        </GlowingEffectBorder>

        <GlowingEffectBorder class="ms-card ms-card--dark" :blur="12" :proximity="120" :spread="22">
          <p class="msv2-compare-chip">STAGE 2</p>
          <h3 class="msv2-compare-title">Schema ↔ Result</h3>
          <p class="msv2-compare-description">Loose contract versus typed output fidelity with explicit constraints.</p>
          <ComparePane
            v-model="sharedSplit"
            :before="selectedProfile.schemaResult.before"
            :after="selectedProfile.schemaResult.after"
            :mode="compareMode"
            :autoplay="false"
            :duration="4800"
            :initial="selectedProfile.slider"
          />
        </GlowingEffectBorder>
      </div>
    </section>

    <section class="msv2-panel">
      <header class="msv2-section-head">
        <p class="msv2-eyebrow">Feature Grid</p>
        <h2>A premium 2-over-3 capability system</h2>
        <p>
          Broad feature narratives on top, compact technical capabilities below. Rhythm, spacing, and icon chips stay
          consistent across the full grid.
        </p>
      </header>

      <div class="msv2-bento-grid">
        <GlowingEffectBorder
          v-for="card in bentoCards"
          :key="card.title"
          class="ms-card ms-card--light"
          :class="card.size === 'large' ? 'ms-card--large' : 'ms-card--small'"
          :blur="10"
          :proximity="96"
          :spread="22"
        >
          <div class="ms-card-top">
            <span class="ms-icon-dot" />
            <span class="ms-chip">{{ card.chip }}</span>
          </div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
          <div class="ms-mini-bars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </GlowingEffectBorder>
      </div>
    </section>

    <section class="msv2-panel">
      <header class="msv2-section-head">
        <p class="msv2-eyebrow">Infrastructure Quadrant</p>
        <h2>Unified 2×2 panel with editorial hierarchy</h2>
      </header>

      <div class="msv2-quadrant">
        <GlowingEffectBorder
          v-for="card in quadrantCards"
          :key="card.lead"
          class="msv2-quadrant-card"
          variant="white"
          :blur="8"
          :proximity="84"
          :spread="18"
        >
          <p class="msv2-quadrant-eyebrow">{{ card.eyebrow }}</p>
          <h3>
            <strong>{{ card.lead }}</strong>
            <span>{{ card.tail }}</span>
          </h3>
          <div class="msv2-quadrant-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </GlowingEffectBorder>
      </div>
    </section>

    <section class="msv2-panel">
      <header class="msv2-section-head">
        <p class="msv2-eyebrow">Linear Dataflow</p>
        <h2>Triptych narrative: ingest, process, deliver</h2>
      </header>

      <GlowingEffectBorder class="ms-card ms-card--light msv2-triptych" :blur="10" :proximity="120" :spread="22">
        <svg class="msv2-triptych-svg" viewBox="0 0 1200 260" aria-hidden="true">
          <defs>
            <linearGradient id="msv2-spectrum" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="38%" stop-color="#0ea5e9" />
              <stop offset="65%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#22c55e" />
            </linearGradient>
          </defs>
          <circle cx="98" cy="70" r="12" fill="#cbd5e1" />
          <circle cx="98" cy="130" r="12" fill="#cbd5e1" />
          <circle cx="98" cy="190" r="12" fill="#cbd5e1" />
          <path d="M110 70 C 260 70, 290 110, 450 130" stroke="#334155" stroke-width="2" fill="none" />
          <path d="M110 130 C 260 130, 290 130, 450 130" stroke="#334155" stroke-width="2" fill="none" />
          <path d="M110 190 C 260 190, 290 150, 450 130" stroke="#334155" stroke-width="2" fill="none" />
          <rect x="470" y="80" width="250" height="100" rx="16" fill="#0f172a" />
          <path d="M490 130 H700" stroke="url(#msv2-spectrum)" stroke-width="4" />
          <path d="M740 130 C 840 130, 870 88, 1040 88" stroke="url(#msv2-spectrum)" stroke-width="2" fill="none" />
          <path d="M740 130 C 840 130, 870 130, 1040 130" stroke="url(#msv2-spectrum)" stroke-width="2" fill="none" />
          <path d="M740 130 C 840 130, 870 172, 1040 172" stroke="url(#msv2-spectrum)" stroke-width="2" fill="none" />
          <circle cx="1060" cy="88" r="8" fill="#ec4899" />
          <circle cx="1060" cy="130" r="8" fill="#22d3ee" />
          <circle cx="1060" cy="172" r="8" fill="#4ade80" />
        </svg>

        <div class="msv2-triptych-copy">
          <article>
            <p>Pipeline Step</p>
            <h3>Data from anywhere.</h3>
            <p>Ingest markdown from docs, CMS, repos, and internal tooling through a single schema strategy.</p>
          </article>
          <article>
            <p>Pipeline Step</p>
            <h3>Intelligently cached.</h3>
            <p>Stabilize expensive parse paths with deterministic transform steps and reliable contract constraints.</p>
          </article>
          <article>
            <p>Pipeline Step</p>
            <h3>Optimized for every consumer.</h3>
            <p>Serve typed output to frontends, agents, analytics jobs, and compliance workflows in one pass.</p>
          </article>
        </div>
      </GlowingEffectBorder>
    </section>

    <section class="msv2-panel">
      <header class="msv2-section-head">
        <p class="msv2-eyebrow">Code Block</p>
        <h2>Implementation-level visibility for every transition stage</h2>
      </header>

      <GlowingEffectBorder class="ms-card ms-card--dark" :blur="12" :proximity="120" :spread="24">
        <CodeBlockTabs :tabs="selectedProfile.codeTabs" theme="dark" class-name="msv2-code-tabs-shell" />
      </GlowingEffectBorder>
    </section>

    <section class="msv2-panel msv2-panel--last">
      <header class="msv2-section-head">
        <p class="msv2-eyebrow">Applicability</p>
        <h2>cards-free inspired capability tiles with glowing interactions</h2>
      </header>
      <CardsFreeApplicabilityGrid />
    </section>
  </main>
</template>
