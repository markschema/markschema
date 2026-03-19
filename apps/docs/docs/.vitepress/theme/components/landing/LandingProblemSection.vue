<script setup lang="ts">
import { problem } from './landing-content'
</script>

<template>
  <section class="rk-section rk-problem" aria-labelledby="rk-problem-heading">
    <header class="rk-section-head">
      <p class="rk-eyebrow">{{ problem.eyebrow }}</p>
      <h2 id="rk-problem-heading">{{ problem.title }}</h2>
      <p>{{ problem.description }}</p>
    </header>

    <div class="rk-problem-grid">
      <article v-for="cost in problem.costs" :key="cost.title" class="rk-card">
        <h3>{{ cost.title }}</h3>
        <p>{{ cost.description }}</p>
      </article>
    </div>

  </section>
</template>
