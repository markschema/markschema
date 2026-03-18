<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    className?: string
    gap?: number
    radius?: number
    color?: string
    glowColor?: string
    speedMin?: number
    speedMax?: number
    opacity?: number
  }>(),
  {
    className: '',
    gap: 14,
    radius: 1.1,
    color: 'rgba(15,23,42,0.28)',
    glowColor: 'rgba(99,102,241,0.48)',
    speedMin: 2.8,
    speedMax: 5.8,
    opacity: 0.72,
  },
)

const styleVars = computed(() => ({
  '--dg-gap': `${props.gap}px`,
  '--dg-radius': `${props.radius}px`,
  '--dg-color': props.color,
  '--dg-glow': props.glowColor,
  '--dg-speed-a': `${props.speedMin}s`,
  '--dg-speed-b': `${props.speedMax}s`,
  '--dg-opacity': `${props.opacity}`,
}))
</script>

<template>
  <div class="ms-dotglow" :class="className" :style="styleVars" aria-hidden="true">
    <div class="ms-dotglow__layer ms-dotglow__layer--a" />
    <div class="ms-dotglow__layer ms-dotglow__layer--b" />
  </div>
</template>
