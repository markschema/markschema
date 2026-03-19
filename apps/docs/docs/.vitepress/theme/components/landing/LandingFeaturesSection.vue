<script setup lang="ts">
import { ref } from 'vue'
import { features } from './landing-content'

const activeFeature = ref(0)
const activeTab = ref(0)

function selectFeature(index: number): void {
  activeFeature.value = index
  activeTab.value = 0
}

const tabs = [
  { label: 'Preview', file: 'preview' },
  { label: '.md', file: 'doc.md' },
  { label: 'schema.ts', file: 'schema.ts' },
  { label: 'output.json', file: 'output.json' },
] as const
</script>

<template>
  <section class="rk-section rk-features" aria-labelledby="rk-features-heading">
    <header class="rk-section-head">
      <p class="rk-eyebrow">{{ features.eyebrow }}</p>
      <h2 id="rk-features-heading">{{ features.title }}</h2>
      <p>{{ features.description }}</p>
    </header>

    <div class="rk-features-split">
      <nav class="rk-features-nav" aria-label="Feature list">
        <button
          v-for="(card, index) in features.cards"
          :key="card.title"
          type="button"
          class="rk-features-nav__item"
          :class="{ 'is-active': activeFeature === index }"
          @click="selectFeature(index)"
        >
          <span class="rk-features-nav__dot" />
          <div>
            <strong>{{ card.title }}</strong>
            <span>{{ card.description }}</span>
          </div>
        </button>
      </nav>

      <div class="rk-features-ide">
        <div class="rk-ide">
          <div class="rk-ide__tabs" role="tablist">
            <button
              v-for="(tab, index) in tabs"
              :key="tab.label"
              type="button"
              role="tab"
              class="rk-ide__tab"
              :class="{ 'is-active': activeTab === index }"
              :aria-selected="activeTab === index"
              @click="activeTab = index"
            >
              <span class="rk-ide__tab-icon" :class="`is-${tab.file.split('.').pop()}`" />
              {{ tab.label }}
            </button>
          </div>

          <div class="rk-ide__body">

            <!-- ════ Feature 0: Schema-Driven Extraction ════ -->
            <template v-if="activeFeature === 0">
              <div v-show="activeTab === 0" class="rk-ide__panel rk-ide__preview">
                <div class="rk-preview">
                  <h1 class="rk-preview__h1">RUNBOOK: Payment Risk Incident</h1>
                  <h2 class="rk-preview__h2">1. OWNER</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">Name</td><td>Alex Turner</td></tr>
                    <tr><td class="rk-preview__key">Email</td><td>alex@zayra.com</td></tr>
                  </tbody></table>
                  <h2 class="rk-preview__h2">2. SEVERITY</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">Level</td><td><span class="rk-preview__badge rk-preview__badge--danger">P1</span></td></tr>
                    <tr><td class="rk-preview__key">Escalation</td><td>immediate</td></tr>
                  </tbody></table>
                </div>
              </div>
              <div v-show="activeTab === 1" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-md-h1"># RUNBOOK: Payment Risk Incident</span>

<span class="hl-md-h2">## 1. OWNER</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Name:</span> <span class="hl-md-val">Alex Turner</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Email:</span> <span class="hl-md-val">alex@zayra.com</span>

<span class="hl-md-h2">## 2. SEVERITY</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Level:</span> <span class="hl-md-val">P1</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Escalation:</span> <span class="hl-md-val">immediate</span></code></pre>
              </div>
              <div v-show="activeTab === 2" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-ts-kw">import</span> { <span class="hl-ts-var">md</span> } <span class="hl-ts-kw">from</span> <span class="hl-ts-str">'mdshape'</span>

<span class="hl-ts-kw">const</span> <span class="hl-ts-var">schema</span> <span class="hl-ts-op">=</span> <span class="hl-ts-fn">md.document</span>({
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
              <div v-show="activeTab === 3" class="rk-ide__panel">
                <pre class="rk-ide__code"><code>{
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
            </template>

            <!-- ════ Feature 1: Structure Validation ════ -->
            <template v-if="activeFeature === 1">
              <div v-show="activeTab === 0" class="rk-ide__panel rk-ide__preview">
                <div class="rk-preview">
                  <h1 class="rk-preview__h1">API: User Service</h1>
                  <h2 class="rk-preview__h2">ENDPOINTS</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">GET</td><td>/users/:id</td></tr>
                    <tr><td class="rk-preview__key">POST</td><td>/users</td></tr>
                  </tbody></table>
                  <h2 class="rk-preview__h2">AUTHENTICATION</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">Type</td><td>Bearer token</td></tr>
                    <tr><td class="rk-preview__key">Header</td><td>Authorization</td></tr>
                  </tbody></table>
                  <h2 class="rk-preview__h2">RATE LIMITS</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">Requests</td><td>1000/min</td></tr>
                  </tbody></table>
                </div>
              </div>
              <div v-show="activeTab === 1" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-md-h1"># API: User Service</span>

<span class="hl-md-h2">## ENDPOINTS</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">GET:</span> <span class="hl-md-val">/users/:id</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">POST:</span> <span class="hl-md-val">/users</span>

<span class="hl-md-h2">## AUTHENTICATION</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Type:</span> <span class="hl-md-val">Bearer token</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Header:</span> <span class="hl-md-val">Authorization</span>

<span class="hl-md-h2">## RATE LIMITS</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Requests:</span> <span class="hl-md-val">1000/min</span></code></pre>
              </div>
              <div v-show="activeTab === 2" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-ts-kw">import</span> { <span class="hl-ts-var">md</span> } <span class="hl-ts-kw">from</span> <span class="hl-ts-str">'mdshape'</span>

<span class="hl-ts-kw">const</span> <span class="hl-ts-var">schema</span> <span class="hl-ts-op">=</span> <span class="hl-ts-fn">md.document</span>({
  <span class="hl-ts-key">title</span>: <span class="hl-ts-fn">md.heading</span>(<span class="hl-ts-num">1</span>),
  <span class="hl-ts-key">endpoints</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'ENDPOINTS'</span>),
  <span class="hl-ts-key">auth</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'AUTHENTICATION'</span>),
  <span class="hl-ts-key">limits</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'RATE LIMITS'</span>),
}, {
  <span class="hl-ts-key">sectionOrder</span>: <span class="hl-ts-str">'strict'</span>,
  <span class="hl-ts-key">fieldOrder</span>: <span class="hl-ts-str">'strict'</span>,
})

<span class="hl-ts-cmt">// If RATE LIMITS appears before AUTHENTICATION</span>
<span class="hl-ts-cmt">// → validation error with line number</span></code></pre>
              </div>
              <div v-show="activeTab === 3" class="rk-ide__panel">
                <pre class="rk-ide__code"><code>{
  <span class="hl-json-key">"success"</span>: <span class="hl-json-bool">true</span>,
  <span class="hl-json-key">"data"</span>: {
    <span class="hl-json-key">"title"</span>: <span class="hl-json-str">"API: User Service"</span>,
    <span class="hl-json-key">"endpoints"</span>: {
      <span class="hl-json-key">"GET"</span>: <span class="hl-json-str">"/users/:id"</span>,
      <span class="hl-json-key">"POST"</span>: <span class="hl-json-str">"/users"</span>
    },
    <span class="hl-json-key">"auth"</span>: {
      <span class="hl-json-key">"Type"</span>: <span class="hl-json-str">"Bearer token"</span>,
      <span class="hl-json-key">"Header"</span>: <span class="hl-json-str">"Authorization"</span>
    },
    <span class="hl-json-key">"limits"</span>: {
      <span class="hl-json-key">"Requests"</span>: <span class="hl-json-str">"1000/min"</span>
    }
  }
}</code></pre>
              </div>
            </template>

            <!-- ════ Feature 2: Rich Block Support ════ -->
            <template v-if="activeFeature === 2">
              <div v-show="activeTab === 0" class="rk-ide__panel rk-ide__preview">
                <div class="rk-preview">
                  <h1 class="rk-preview__h1">Research: Q4 Analysis</h1>
                  <h2 class="rk-preview__h2">DATA</h2>
                  <table class="rk-preview__table rk-preview__table--data">
                    <thead><tr><th>Region</th><th>Revenue</th><th>Growth</th></tr></thead>
                    <tbody>
                      <tr><td>EMEA</td><td>$4.2M</td><td>+12%</td></tr>
                      <tr><td>APAC</td><td>$3.8M</td><td>+18%</td></tr>
                      <tr><td>AMER</td><td>$6.1M</td><td>+8%</td></tr>
                    </tbody>
                  </table>
                  <h2 class="rk-preview__h2">FORMULA</h2>
                  <p class="rk-preview__math">E = mc²</p>
                  <h2 class="rk-preview__h2">ASSETS</h2>
                  <div class="rk-preview__img-placeholder">dashboard.png <span>1200×600</span></div>
                </div>
              </div>
              <div v-show="activeTab === 1" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-md-h1"># Research: Q4 Analysis</span>

<span class="hl-md-h2">## DATA</span>

| Region | Revenue | Growth |
|--------|---------|--------|
| EMEA   | $4.2M   | +12%   |
| APAC   | $3.8M   | +18%   |
| AMER   | $6.1M   | +8%    |

<span class="hl-md-h2">## FORMULA</span>

$$E = mc^2$$

<span class="hl-md-h2">## ASSETS</span>

![Dashboard](dashboard.png)</code></pre>
              </div>
              <div v-show="activeTab === 2" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-ts-kw">import</span> { <span class="hl-ts-var">md</span> } <span class="hl-ts-kw">from</span> <span class="hl-ts-str">'mdshape'</span>

<span class="hl-ts-kw">const</span> <span class="hl-ts-var">schema</span> <span class="hl-ts-op">=</span> <span class="hl-ts-fn">md.document</span>({
  <span class="hl-ts-key">title</span>: <span class="hl-ts-fn">md.heading</span>(<span class="hl-ts-num">1</span>),
  <span class="hl-ts-key">data</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'DATA'</span>).<span class="hl-ts-fn">blocks</span>({
    <span class="hl-ts-key">table</span>: <span class="hl-ts-fn">md.block.table</span>(),
  }),
  <span class="hl-ts-key">formula</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'FORMULA'</span>).<span class="hl-ts-fn">blocks</span>({
    <span class="hl-ts-key">math</span>: <span class="hl-ts-fn">md.block.math</span>(),
  }),
  <span class="hl-ts-key">assets</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'ASSETS'</span>).<span class="hl-ts-fn">blocks</span>({
    <span class="hl-ts-key">image</span>: <span class="hl-ts-fn">md.block.image</span>(),
  }),
})</code></pre>
              </div>
              <div v-show="activeTab === 3" class="rk-ide__panel">
                <pre class="rk-ide__code"><code>{
  <span class="hl-json-key">"success"</span>: <span class="hl-json-bool">true</span>,
  <span class="hl-json-key">"data"</span>: {
    <span class="hl-json-key">"title"</span>: <span class="hl-json-str">"Research: Q4 Analysis"</span>,
    <span class="hl-json-key">"data"</span>: {
      <span class="hl-json-key">"table"</span>: {
        <span class="hl-json-key">"headers"</span>: [<span class="hl-json-str">"Region"</span>, <span class="hl-json-str">"Revenue"</span>, <span class="hl-json-str">"Growth"</span>],
        <span class="hl-json-key">"rows"</span>: [
          [<span class="hl-json-str">"EMEA"</span>, <span class="hl-json-str">"$4.2M"</span>, <span class="hl-json-str">"+12%"</span>],
          [<span class="hl-json-str">"APAC"</span>, <span class="hl-json-str">"$3.8M"</span>, <span class="hl-json-str">"+18%"</span>],
          [<span class="hl-json-str">"AMER"</span>, <span class="hl-json-str">"$6.1M"</span>, <span class="hl-json-str">"+8%"</span>]
        ]
      }
    },
    <span class="hl-json-key">"formula"</span>: { <span class="hl-json-key">"math"</span>: <span class="hl-json-str">"E = mc^2"</span> },
    <span class="hl-json-key">"assets"</span>: {
      <span class="hl-json-key">"image"</span>: {
        <span class="hl-json-key">"src"</span>: <span class="hl-json-str">"dashboard.png"</span>,
        <span class="hl-json-key">"alt"</span>: <span class="hl-json-str">"Dashboard"</span>
      }
    }
  }
}</code></pre>
              </div>
            </template>

            <!-- ════ Feature 3: Typed Diagnostics ════ -->
            <template v-if="activeFeature === 3">
              <div v-show="activeTab === 0" class="rk-ide__panel rk-ide__preview">
                <div class="rk-preview">
                  <h1 class="rk-preview__h1">SKILL: Summarize PDF</h1>
                  <h2 class="rk-preview__h2">INPUTS</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">File</td><td>report.pdf</td></tr>
                  </tbody></table>
                  <p class="rk-preview__error">Missing section: OUTPUTS (required)</p>
                  <p class="rk-preview__error">Missing field: MaxTokens in INPUTS</p>
                </div>
              </div>
              <div v-show="activeTab === 1" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-md-h1"># SKILL: Summarize PDF</span>

<span class="hl-md-h2">## INPUTS</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">File:</span> <span class="hl-md-val">report.pdf</span>

<span class="hl-ts-cmt">                     ← missing ## OUTPUTS section</span>
<span class="hl-ts-cmt">                     ← missing MaxTokens field</span></code></pre>
              </div>
              <div v-show="activeTab === 2" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-ts-kw">import</span> { <span class="hl-ts-var">md</span> } <span class="hl-ts-kw">from</span> <span class="hl-ts-str">'mdshape'</span>

<span class="hl-ts-kw">const</span> <span class="hl-ts-var">schema</span> <span class="hl-ts-op">=</span> <span class="hl-ts-fn">md.document</span>({
  <span class="hl-ts-key">title</span>: <span class="hl-ts-fn">md.heading</span>(<span class="hl-ts-num">1</span>),
  <span class="hl-ts-key">inputs</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'INPUTS'</span>).<span class="hl-ts-fn">fields</span>({
    <span class="hl-ts-key">File</span>: <span class="hl-ts-fn">md.string</span>(),
    <span class="hl-ts-key">MaxTokens</span>: <span class="hl-ts-fn">md.number</span>(),
  }),
  <span class="hl-ts-key">outputs</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'OUTPUTS'</span>).<span class="hl-ts-fn">fields</span>({
    <span class="hl-ts-key">Format</span>: <span class="hl-ts-fn">md.string</span>(),
  }),
})</code></pre>
              </div>
              <div v-show="activeTab === 3" class="rk-ide__panel">
                <pre class="rk-ide__code"><code>{
  <span class="hl-json-key">"success"</span>: <span class="hl-json-bool">false</span>,
  <span class="hl-json-key">"error"</span>: {
    <span class="hl-json-key">"issues"</span>: [
      {
        <span class="hl-json-key">"code"</span>: <span class="hl-json-str">"missing_section"</span>,
        <span class="hl-json-key">"path"</span>: [<span class="hl-json-str">"outputs"</span>],
        <span class="hl-json-key">"message"</span>: <span class="hl-json-str">"Expected section 'OUTPUTS'"</span>
      },
      {
        <span class="hl-json-key">"code"</span>: <span class="hl-json-str">"missing_field"</span>,
        <span class="hl-json-key">"path"</span>: [<span class="hl-json-str">"inputs"</span>, <span class="hl-json-str">"MaxTokens"</span>],
        <span class="hl-json-key">"line"</span>: <span class="hl-json-num">4</span>,
        <span class="hl-json-key">"column"</span>: <span class="hl-json-num">1</span>,
        <span class="hl-json-key">"message"</span>: <span class="hl-json-str">"Expected field 'MaxTokens' in section 'INPUTS'"</span>
      }
    ]
  }
}</code></pre>
              </div>
            </template>

            <!-- ════ Feature 4: RAG-Ready Extraction ════ -->
            <template v-if="activeFeature === 4">
              <div v-show="activeTab === 0" class="rk-ide__panel rk-ide__preview">
                <div class="rk-preview">
                  <h1 class="rk-preview__h1">Guide: Setting Up CI/CD</h1>
                  <h2 class="rk-preview__h2">OVERVIEW</h2>
                  <p class="rk-preview__text">This guide walks through configuring a CI/CD pipeline for Node.js services using GitHub Actions.</p>
                  <h2 class="rk-preview__h2">PREREQUISITES</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">Runtime</td><td>Node.js 20+</td></tr>
                    <tr><td class="rk-preview__key">Registry</td><td>npm or GitHub Packages</td></tr>
                  </tbody></table>
                  <h2 class="rk-preview__h2">STEPS</h2>
                  <table class="rk-preview__table"><tbody>
                    <tr><td class="rk-preview__key">1</td><td>Create .github/workflows/ci.yml</td></tr>
                    <tr><td class="rk-preview__key">2</td><td>Configure test and build jobs</td></tr>
                    <tr><td class="rk-preview__key">3</td><td>Add deployment trigger on main branch</td></tr>
                  </tbody></table>
                  <div class="rk-preview__rag-hint">Each section → structured chunk for vector DB</div>
                </div>
              </div>
              <div v-show="activeTab === 1" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-md-h1"># Guide: Setting Up CI/CD</span>

<span class="hl-md-h2">## OVERVIEW</span>
This guide walks through configuring a
CI/CD pipeline for Node.js services
using GitHub Actions.

<span class="hl-md-h2">## PREREQUISITES</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Runtime:</span> <span class="hl-md-val">Node.js 20+</span>
<span class="hl-md-li">-</span> <span class="hl-md-key">Registry:</span> <span class="hl-md-val">npm or GitHub Packages</span>

<span class="hl-md-h2">## STEPS</span>
<span class="hl-md-li">1.</span> <span class="hl-md-val">Create .github/workflows/ci.yml</span>
<span class="hl-md-li">2.</span> <span class="hl-md-val">Configure test and build jobs</span>
<span class="hl-md-li">3.</span> <span class="hl-md-val">Add deployment trigger on main branch</span></code></pre>
              </div>
              <div v-show="activeTab === 2" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-ts-kw">import</span> { <span class="hl-ts-var">md</span> } <span class="hl-ts-kw">from</span> <span class="hl-ts-str">'mdshape'</span>

<span class="hl-ts-cmt">// Each section becomes a structured chunk</span>
<span class="hl-ts-cmt">// ready for vector database storage</span>

<span class="hl-ts-kw">const</span> <span class="hl-ts-var">schema</span> <span class="hl-ts-op">=</span> <span class="hl-ts-fn">md.document</span>({
  <span class="hl-ts-key">title</span>: <span class="hl-ts-fn">md.heading</span>(<span class="hl-ts-num">1</span>),
  <span class="hl-ts-key">overview</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'OVERVIEW'</span>).<span class="hl-ts-fn">body</span>(),
  <span class="hl-ts-key">prerequisites</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'PREREQUISITES'</span>).<span class="hl-ts-fn">fields</span>({
    <span class="hl-ts-key">Runtime</span>: <span class="hl-ts-fn">md.string</span>(),
    <span class="hl-ts-key">Registry</span>: <span class="hl-ts-fn">md.string</span>(),
  }),
  <span class="hl-ts-key">steps</span>: <span class="hl-ts-fn">md.section</span>(<span class="hl-ts-str">'STEPS'</span>).<span class="hl-ts-fn">blocks</span>({
    <span class="hl-ts-key">list</span>: <span class="hl-ts-fn">md.block.list</span>(),
  }),
})

<span class="hl-ts-cmt">// Store each field in your vector DB</span>
<span class="hl-ts-cmt">// with full context: title, section, path</span></code></pre>
              </div>
              <div v-show="activeTab === 3" class="rk-ide__panel">
                <pre class="rk-ide__code"><code><span class="hl-ts-cmt">// Each key = one typed chunk for your vector DB</span>

{
  <span class="hl-json-key">"success"</span>: <span class="hl-json-bool">true</span>,
  <span class="hl-json-key">"data"</span>: {
    <span class="hl-json-key">"title"</span>: <span class="hl-json-str">"Guide: Setting Up CI/CD"</span>,
    <span class="hl-json-key">"overview"</span>: <span class="hl-json-str">"This guide walks through configuring a CI/CD pipeline for Node.js services using GitHub Actions."</span>,
    <span class="hl-json-key">"prerequisites"</span>: {
      <span class="hl-json-key">"Runtime"</span>: <span class="hl-json-str">"Node.js 20+"</span>,
      <span class="hl-json-key">"Registry"</span>: <span class="hl-json-str">"npm or GitHub Packages"</span>
    },
    <span class="hl-json-key">"steps"</span>: {
      <span class="hl-json-key">"list"</span>: [
        <span class="hl-json-str">"Create .github/workflows/ci.yml"</span>,
        <span class="hl-json-str">"Configure test and build jobs"</span>,
        <span class="hl-json-str">"Add deployment trigger on main branch"</span>
      ]
    }
  }
}</code></pre>
              </div>
            </template>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>
