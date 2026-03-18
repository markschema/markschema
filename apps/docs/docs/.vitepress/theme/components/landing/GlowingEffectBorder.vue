<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type GlowVariant = 'default' | 'white'

const props = withDefaults(
  defineProps<{
    blur?: number
    spread?: number
    proximity?: number
    variant?: GlowVariant
    glow?: boolean
    className?: string
    disabled?: boolean
    movementDuration?: number
    borderWidth?: number
  }>(),
  {
    blur: 0,
    spread: 20,
    proximity: 0,
    variant: 'default',
    glow: false,
    className: '',
    disabled: false,
    movementDuration: 2,
    borderWidth: 1,
  },
)

const rootEl = ref<HTMLElement | null>(null)
const isActive = ref(false)
const pointerX = ref(50)
const pointerY = ref(50)

const styleVars = computed(() => ({
  '--glow-blur': `${props.blur}px`,
  '--glow-spread': `${props.spread}deg`,
  '--glow-duration': `${props.movementDuration}s`,
  '--glow-border-width': `${props.borderWidth}px`,
  '--glow-x': `${pointerX.value}%`,
  '--glow-y': `${pointerY.value}%`,
}))

function handlePointerMove(event: PointerEvent): void {
  if (!rootEl.value || props.disabled) {
    return
  }

  const rect = rootEl.value.getBoundingClientRect()
  const insideX = event.clientX >= rect.left - props.proximity && event.clientX <= rect.right + props.proximity
  const insideY = event.clientY >= rect.top - props.proximity && event.clientY <= rect.bottom + props.proximity

  if (!insideX || !insideY) {
    isActive.value = false
    return
  }

  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  pointerX.value = Math.min(100, Math.max(0, x))
  pointerY.value = Math.min(100, Math.max(0, y))
  isActive.value = true
}

function handlePointerLeave(): void {
  if (props.disabled) {
    return
  }
  isActive.value = false
}

onMounted(() => {
  if (!rootEl.value || props.disabled) {
    return
  }

  rootEl.value.addEventListener('pointermove', handlePointerMove)
  rootEl.value.addEventListener('pointerleave', handlePointerLeave)
})

onBeforeUnmount(() => {
  if (!rootEl.value) {
    return
  }
  rootEl.value.removeEventListener('pointermove', handlePointerMove)
  rootEl.value.removeEventListener('pointerleave', handlePointerLeave)
})
</script>

<template>
  <div
    ref="rootEl"
    class="ms-glow-border"
    :class="[
      className,
      { 'is-active': isActive || glow, 'is-disabled': disabled, 'is-white': variant === 'white' },
    ]"
    :style="styleVars"
  >
    <div class="ms-glow-border__fx" aria-hidden="true" />
    <slot />
  </div>
</template>
