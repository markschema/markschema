<script setup lang="ts">
import { finalCta } from './landing-content'
import { trackLandingCtaClick } from './landing-analytics'
</script>

<template>
  <section class="rk-section rk-final" aria-labelledby="rk-final-heading">
    <div class="rk-final__inner">
      <p class="rk-eyebrow">{{ finalCta.eyebrow }}</p>
      <h2 id="rk-final-heading">{{ finalCta.title }}</h2>
      <p>{{ finalCta.description }}</p>

      <div class="rk-final__actions">
        <a
          class="rk-btn rk-btn--primary rk-btn--lg"
          :href="finalCta.ctaPrimary.href"
          @click="trackLandingCtaClick({ ctaId: 'final-playground', placement: 'final-cta', href: finalCta.ctaPrimary.href })"
        >{{ finalCta.ctaPrimary.label }}</a>
        <a
          class="rk-btn rk-btn--outline"
          :href="finalCta.ctaSecondary.href"
          @click="trackLandingCtaClick({ ctaId: 'final-getting-started', placement: 'final-cta', href: finalCta.ctaSecondary.href })"
        >{{ finalCta.ctaSecondary.label }}</a>
        <a
          class="rk-btn rk-btn--ghost"
          :href="finalCta.ctaTertiary.href"
          @click="trackLandingCtaClick({ ctaId: 'final-api', placement: 'final-cta', href: finalCta.ctaTertiary.href })"
        >{{ finalCta.ctaTertiary.label }}</a>
      </div>
    </div>
  </section>
</template>
