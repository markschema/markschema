<script setup lang="ts">
import { ref } from 'vue'
import { howItWorks } from './landing-content'
import { trackLandingCtaClick } from './landing-analytics'

const activeStep = ref(0)

const stepIcons = ['M↓', '{ }', '→J'] as const
const fileNames = ['runbook.md', 'schema.ts', 'output.json'] as const
</script>

<template>
  <section class="rk-section rk-how" aria-labelledby="rk-how-heading">
    <header class="rk-section-head">
      <p class="rk-eyebrow">{{ howItWorks.eyebrow }}</p>
      <h2 id="rk-how-heading">{{ howItWorks.title }}</h2>
      <p>{{ howItWorks.description }}</p>
    </header>

    <div class="rk-how-rail">
      <button
        v-for="(step, index) in howItWorks.steps"
        :key="step.label"
        type="button"
        class="rk-how-tab"
        :class="{ 'is-active': activeStep === index }"
        @click="activeStep = index"
      >
        <span class="rk-how-tab__icon">{{ stepIcons[index] }}</span>
        <span>{{ step.title }}</span>
      </button>
    </div>

    <div class="rk-how-panels">
      <!-- Step 1: Markdown -->
      <div class="rk-how-panel" :class="{ 'is-active': activeStep === 0 }">
        <div class="rk-how-panel__copy">
          <span class="rk-how-panel__badge">{{ howItWorks.steps[0].title }}</span>
          <p>{{ howItWorks.steps[0].copy }}</p>
        </div>
        <div class="rk-terminal">
          <div class="rk-terminal__header">
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__title">{{ fileNames[0] }}</span>
          </div>
          <pre class="rk-terminal__body"><code><span class="hl-md-h1"># RUNBOOK: Payment Risk Incident</span>

<span class="hl-md-h2">## 1. OWNER</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Name:</span> <span class="hl-md-val">Alex Turner</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Email:</span> <span class="hl-md-val">alex@zayra.com</span>

<span class="hl-md-h2">## 2. SEVERITY</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Level:</span> <span class="hl-md-val">P1</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Escalation:</span> <span class="hl-md-val">immediate</span></code></pre>
        </div>
      </div>

      <!-- Step 2: Schema -->
      <div class="rk-how-panel" :class="{ 'is-active': activeStep === 1 }">
        <div class="rk-how-panel__copy">
          <span class="rk-how-panel__badge">{{ howItWorks.steps[1].title }}</span>
          <p>{{ howItWorks.steps[1].copy }}</p>
        </div>
        <div class="rk-terminal">
          <div class="rk-terminal__header">
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__title">{{ fileNames[1] }}</span>
          </div>
          <pre class="rk-terminal__body"><code><span class="hl-ts-kw">const</span> <span class="hl-ts-var">schema</span> <span class="hl-ts-op">=</span> <span class="hl-ts-fn">md.document</span>({
  <span class="hl-ts-key">title</span>: <span class="hl-ts-fn">md.heading</span>(<span class="hl-ts-num">1</span>),
  <span class="hl-ts-key">owner</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'1. OWNER'</span>).<span class="hl-ts-fn">fields</span>({
    <span class="hl-ts-key">Name</span>: <span class="hl-ts-fn">md.string</span>(),
    <span class="hl-ts-key">Email</span>: <span class="hl-ts-fn">md.email</span>(),
  }),
  <span class="hl-ts-key">severity</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'2. SEVERITY'</span>).<span class="hl-ts-fn">fields</span>({
    <span class="hl-ts-key">Level</span>: <span class="hl-ts-fn">md.string</span>(),
    <span class="hl-ts-key">Escalation</span>: <span class="hl-ts-fn">md.string</span>(),
  }),
})</code></pre>
        </div>
      </div>

      <!-- Step 3: JSON Output -->
      <div class="rk-how-panel" :class="{ 'is-active': activeStep === 2 }">
        <div class="rk-how-panel__copy">
          <span class="rk-how-panel__badge">{{ howItWorks.steps[2].title }}</span>
          <p>{{ howItWorks.steps[2].copy }}</p>
        </div>
        <div class="rk-terminal">
          <div class="rk-terminal__header">
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__dot" />
            <span class="rk-terminal__title">{{ fileNames[2] }}</span>
          </div>
          <pre class="rk-terminal__body"><code>{
  <span class="hl-json-key">"success"</span>: <span class="hl-json-bool">true</span>,
  <span class="hl-json-key">"data"</span>: {
    <span class="hl-json-key">"title"</span>: <span class="hl-json-str">"RUNBOOK: Payment Risk Incident"</span>,
    <span class="hl-json-key">"owner"</span>: {
      <span class="hl-json-key">"Name"</span>: <span class="hl-json-str">"Alex Turner"</span>,
      <span class="hl-json-key">"Email"</span>: <span class="hl-json-str">"alex@zayra.com"</span>
    },
    <span class="hl-json-key">"severity"</span>: {
      <span class="hl-json-key">"Level"</span>: <span class="hl-json-str">"P1"</span>,
      <span class="hl-json-key">"Escalation"</span>: <span class="hl-json-str">"immediate"</span>
    }
  }
}</code></pre>
        </div>
      </div>
    </div>

    <div class="rk-section-actions">
      <a
        class="rk-btn rk-btn--primary"
        :href="howItWorks.ctaPrimary.href"
        @click="trackLandingCtaClick({ ctaId: 'how-playground', placement: 'how-it-works', href: howItWorks.ctaPrimary.href })"
      >
        {{ howItWorks.ctaPrimary.label }}
      </a>
    </div>
  </section>
</template>
