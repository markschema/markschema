<script setup lang="ts">
import { proof } from './landing-content'
import { trackLandingCtaClick } from './landing-analytics'
</script>

<template>
  <section class="rk-section rk-proof" aria-labelledby="rk-proof-heading">
    <header class="rk-section-head">
      <p class="rk-eyebrow">{{ proof.eyebrow }}</p>
      <h2 id="rk-proof-heading">{{ proof.title }}</h2>
    </header>

    <div class="rk-proof-grid">
      <div v-for="item in proof.items" :key="item.label" class="rk-proof-item">
        <span class="rk-proof-item__value">{{ item.value }}</span>
        <span class="rk-proof-item__label">{{ item.label }}</span>
      </div>
    </div>

    <div class="rk-section-actions">
      <a
        class="rk-btn rk-btn--outline"
        href="/playground/"
        @click="trackLandingCtaClick({ ctaId: 'proof-playground', placement: 'proof', href: '/playground/' })"
      >
        Open Playground
      </a>
    </div>
  </section>
</template>
