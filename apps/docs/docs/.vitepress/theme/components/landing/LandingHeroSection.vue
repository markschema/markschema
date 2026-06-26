<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { hero } from './landing-content'
import { trackLandingCtaClick } from './landing-analytics'

const activePhraseIndex = ref(0)
const reducedMotion = ref(false)

let intervalId: ReturnType<typeof setInterval> | null = null
let mq: MediaQueryList | null = null
let mqListener: ((e: MediaQueryListEvent) => void) | null = null

const activePhrase = computed(() => hero.rotatingPhrases[activePhraseIndex.value] ?? hero.rotatingPhrases[0])

function applyMotion(matches: boolean): void {
  reducedMotion.value = matches
  if (matches) {
    if (intervalId) { window.clearInterval(intervalId); intervalId = null }
    activePhraseIndex.value = 0
    return
  }
  if (!intervalId) {
    intervalId = window.setInterval(() => {
      activePhraseIndex.value = (activePhraseIndex.value + 1) % hero.rotatingPhrases.length
    }, 2400)
  }
}

onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  applyMotion(mq.matches)
  mqListener = (e: MediaQueryListEvent) => applyMotion(e.matches)
  mq.addEventListener('change', mqListener)
})

onBeforeUnmount(() => {
  if (intervalId) { window.clearInterval(intervalId); intervalId = null }
  if (mq && mqListener) mq.removeEventListener('change', mqListener)
})
</script>

<template>
  <section class="rk-section rk-hero" aria-labelledby="rk-hero-heading">
    <div class="rk-hero__inner">
      <p class="rk-hero__pill">
        <a :href="hero.releasePillHref">{{ hero.releasePill }} <span aria-hidden="true">&rarr;</span></a>
      </p>

      <h1 id="rk-hero-heading" class="rk-hero__title">
        {{ hero.titleBefore }}
        <span class="rk-hero__accent" :data-reduced="reducedMotion ? 'true' : 'false'">
          <span :key="activePhrase" class="rk-hero__accent-word">{{ activePhrase }}</span>
        </span>
        <br />{{ hero.titleAfter }}
      </h1>

      <p class="rk-hero__subtitle">{{ hero.subtitle }}</p>

      <div class="rk-hero__actions">
        <a
          class="rk-btn rk-btn--primary"
          :href="hero.ctaPrimary.href"
          :target="hero.ctaPrimary.href.startsWith('http') ? '_blank' : undefined"
          :rel="hero.ctaPrimary.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          @click="trackLandingCtaClick({ ctaId: 'hero-playground', placement: 'hero', href: hero.ctaPrimary.href })"
        >
          {{ hero.ctaPrimary.label }}
        </a>
        <a
          class="rk-btn rk-btn--outline"
          :href="hero.ctaSecondary.href"
          @click="trackLandingCtaClick({ ctaId: 'hero-getting-started', placement: 'hero', href: hero.ctaSecondary.href })"
        >
          {{ hero.ctaSecondary.label }}
        </a>
      </div>

      <div class="rk-hero__signals" aria-label="Core API surface">
        <code v-for="s in hero.signals" :key="s">{{ s }}</code>
      </div>
    </div>
  </section>
</template>
