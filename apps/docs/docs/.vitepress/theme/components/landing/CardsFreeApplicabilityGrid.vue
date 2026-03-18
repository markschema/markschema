<script setup lang="ts">
import GlowingEffectBorder from './GlowingEffectBorder.vue'

type ApplicabilityCard = {
  chip: string
  title: string
  description: string
}

const props = withDefaults(
  defineProps<{
    cards?: ApplicabilityCard[]
  }>(),
  {
    cards: () => [
      {
        chip: 'OPS',
        title: 'Runbooks & incident timelines',
        description:
          'Use section-aware schemas to keep operational markdown consistent during incident response and timeline reviews.',
      },
      {
        chip: 'GRC',
        title: 'Compliance and audit packs',
        description:
          'Validate mandatory evidence and references before publishing audit artifacts across compliance workflows.',
      },
      {
        chip: 'KB',
        title: 'Knowledge base ingestion',
        description:
          'Convert heterogeneous markdown into typed JSON for search, agents, analytics pipelines, and retrieval layers.',
      },
    ],
  },
)
</script>

<template>
  <div class="ms-app-grid">
    <GlowingEffectBorder
      v-for="card in cards"
      :key="card.title"
      class="ms-card ms-card--light ms-app-card"
      :blur="10"
      :proximity="100"
      :spread="24"
      :movement-duration="2.2"
      :border-width="1"
    >
      <div class="ms-app-signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <span class="ms-chip">{{ card.chip }}</span>
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
    </GlowingEffectBorder>
  </div>
</template>
