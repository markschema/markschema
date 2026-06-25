<script setup lang="ts">
import { comparison } from './landing-content'
import { trackLandingCtaClick } from './landing-analytics'

function statusClass(value: string): string {
  if (value === 'Native') return 'is-native'
  if (value === 'Partial') return 'is-partial'
  return 'is-custom'
}
</script>

<template>
  <section class="rk-section rk-compare" aria-labelledby="rk-compare-heading">
    <header class="rk-section-head">
      <p class="rk-eyebrow">{{ comparison.eyebrow }}</p>
      <h2 id="rk-compare-heading">{{ comparison.title }}</h2>
      <p>{{ comparison.description }}</p>
    </header>

    <div class="rk-compare-table-wrap">
      <table class="rk-compare-table">
        <thead>
          <tr>
            <th>Capability</th>
            <th v-for="col in comparison.columns" :key="col.key" :class="{ 'is-highlight': col.key === 'mdshape' }">
{{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in comparison.rows" :key="row.capability">
            <th>{{ row.capability }}</th>
            <td v-for="col in comparison.columns" :key="col.key" :class="{ 'is-highlight': col.key === 'mdshape' }">
              <span class="rk-badge" :class="statusClass(row[col.key])">{{ row[col.key] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="rk-compare-cards" role="list">
      <article v-for="row in comparison.rows" :key="`card-${row.capability}`" class="rk-card" role="listitem">
        <h3>{{ row.capability }}</h3>
        <dl>
          <div v-for="col in comparison.columns" :key="col.key" :class="{ 'is-highlight': col.key === 'mdshape' }">
            <dt>{{ col.label }}</dt>
            <dd><span class="rk-badge" :class="statusClass(row[col.key])">{{ row[col.key] }}</span></dd>
          </div>
        </dl>
      </article>
    </div>

    <ul class="rk-legend">
      <li v-for="item in comparison.legend" :key="item.term">
        <strong>{{ item.term }}:</strong> {{ item.definition }}
      </li>
    </ul>
    <p class="rk-compare__note">{{ comparison.methodologyNote }}</p>

    <div class="rk-section-actions">
      <a
        class="rk-btn rk-btn--primary"
        href="https://playground.markschema.com"
        target="_blank"
        rel="noopener noreferrer"
        @click="trackLandingCtaClick({ ctaId: 'comparison-playground', placement: 'comparison', href: 'https://playground.markschema.com' })"
      >
        Open Playground
      </a>
    </div>
  </section>
</template>
