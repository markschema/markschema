<script setup lang="ts">
import { ref } from 'vue'
import { faq } from './landing-content'
import { trackLandingCtaClick } from './landing-analytics'

const openIndex = ref<number | null>(null)

function toggle(index: number): void {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section class="rk-section rk-faq" aria-labelledby="rk-faq-heading">
    <header class="rk-section-head">
      <p class="rk-eyebrow">{{ faq.eyebrow }}</p>
      <h2 id="rk-faq-heading">{{ faq.title }}</h2>
    </header>

    <div class="rk-faq-list">
      <div
        v-for="(item, index) in faq.items"
        :key="index"
        class="rk-faq-item"
        :class="{ 'is-open': openIndex === index }"
      >
        <button
          type="button"
          class="rk-faq-item__trigger"
          :aria-expanded="openIndex === index"
          :aria-controls="`rk-faq-answer-${index}`"
          @click="toggle(index)"
        >
          <span>{{ item.question }}</span>
          <span class="rk-faq-item__icon" aria-hidden="true">{{ openIndex === index ? '−' : '+' }}</span>
        </button>
        <div :id="`rk-faq-answer-${index}`" class="rk-faq-item__answer" role="region">
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>

  </section>
</template>
