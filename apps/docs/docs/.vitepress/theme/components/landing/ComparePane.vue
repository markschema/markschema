<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type CompareMode = 'hover' | 'drag'

const props = withDefaults(
  defineProps<{
    before: string
    after: string
    mode?: CompareMode
    initial?: number
    autoplay?: boolean
    duration?: number
    modelValue?: number
    showHandlebar?: boolean
    className?: string
  }>(),
  {
    mode: 'drag',
    initial: 50,
    autoplay: false,
    duration: 5000,
    modelValue: undefined,
    showHandlebar: true,
    className: '',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const paneEl = ref<HTMLElement | null>(null)
const hoverActive = ref(false)
const split = ref(clamp(props.modelValue ?? props.initial))

let rafId = 0
let startTs = 0
let prefersReducedMotion = false
let mediaQuery: MediaQueryList | null = null
let mediaQueryListener: ((event: MediaQueryListEvent) => void) | null = null

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 50))
}

function setSplit(value: number, emitChange = true): void {
  const next = clamp(value)
  if (Math.abs(next - split.value) < 0.1) {
    return
  }
  split.value = next
  if (emitChange) {
    emit('update:modelValue', next)
  }
}

function updateFromPointer(clientX: number): void {
  if (!paneEl.value) {
    return
  }
  const rect = paneEl.value.getBoundingClientRect()
  if (!rect.width) {
    return
  }
  setSplit(((clientX - rect.left) / rect.width) * 100)
}

function handleMouseMove(event: MouseEvent): void {
  if (props.mode !== 'hover') {
    return
  }
  hoverActive.value = true
  updateFromPointer(event.clientX)
}

function handleMouseLeave(): void {
  hoverActive.value = false
}

function handleTouchMove(event: TouchEvent): void {
  if (props.mode !== 'hover') {
    return
  }
  const touch = event.touches[0]
  if (!touch) {
    return
  }
  updateFromPointer(touch.clientX)
}

function animate(timestamp: number): void {
  if (startTs === 0) {
    startTs = timestamp
  }

  const elapsed = timestamp - startTs
  const cycle = (elapsed % props.duration) / props.duration
  const wave = 50 + Math.sin(cycle * Math.PI * 2) * 28

  setSplit(wave)
  rafId = window.requestAnimationFrame(animate)
}

function startAutoplay(): void {
  stopAutoplay()

  if (!props.autoplay || prefersReducedMotion || props.mode === 'hover') {
    return
  }

  startTs = 0
  rafId = window.requestAnimationFrame(animate)
}

function stopAutoplay(): void {
  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
}

watch(
  () => props.modelValue,
  (next) => {
    if (typeof next === 'number') {
      setSplit(next, false)
    }
  },
)

watch(
  () => [props.autoplay, props.duration, props.mode],
  () => {
    startAutoplay()
  },
)

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = mediaQuery.matches
  mediaQueryListener = (event: MediaQueryListEvent) => {
    prefersReducedMotion = event.matches
    startAutoplay()
  }
  mediaQuery.addEventListener('change', mediaQueryListener)

  startAutoplay()
})

onBeforeUnmount(() => {
  if (mediaQuery && mediaQueryListener) {
    mediaQuery.removeEventListener('change', mediaQueryListener)
  }
  stopAutoplay()
})

const shellStyle = computed(() => ({
  '--split': `${split.value}%`,
}))
</script>

<template>
  <div
    ref="paneEl"
    class="ms-compare"
    :class="[className, { 'is-hover-active': hoverActive, 'is-hover-mode': mode === 'hover' }]"
    :style="shellStyle"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @touchmove.passive="handleTouchMove"
  >
    <pre class="ms-compare__panel ms-compare__panel--after"><code>{{ after }}</code></pre>
    <pre class="ms-compare__panel ms-compare__panel--before"><code>{{ before }}</code></pre>

    <div v-if="showHandlebar" class="ms-compare__divider" aria-hidden="true">
      <span class="ms-compare__handle" />
    </div>

    <input
      v-if="mode === 'drag'"
      class="ms-compare__range"
      type="range"
      min="0"
      max="100"
      :value="split"
      aria-label="Compare slider"
      @input="setSplit(Number(($event.target as HTMLInputElement).value))"
    />
  </div>
</template>
