<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    rows?: number
    cols?: number
    cellSize?: number
    className?: string
    interactive?: boolean
  }>(),
  {
    rows: 8,
    cols: 27,
    cellSize: 56,
    className: '',
    interactive: true,
  },
)

const activeCells = ref<Set<number>>(new Set())
const timers = new Set<number>()

const cells = computed(() => {
  const list: Array<{ index: number; row: number; col: number }> = []
  for (let row = 0; row < props.rows; row += 1) {
    for (let col = 0; col < props.cols; col += 1) {
      list.push({
        index: row * props.cols + col,
        row,
        col,
      })
    }
  }
  return list
})

const styleVars = computed(() => ({
  '--rp-rows': `${props.rows}`,
  '--rp-cols': `${props.cols}`,
  '--rp-cell': `${props.cellSize}px`,
}))

function setCellActive(index: number, active: boolean): void {
  const next = new Set(activeCells.value)
  if (active) {
    next.add(index)
  } else {
    next.delete(index)
  }
  activeCells.value = next
}

function triggerRipple(originRow: number, originCol: number): void {
  const maxDistance = Math.max(props.rows, props.cols)

  for (const cell of cells.value) {
    const distance = Math.abs(cell.row - originRow) + Math.abs(cell.col - originCol)
    if (distance > Math.min(7, maxDistance)) {
      continue
    }

    const delay = distance * 22
    const activateTimer = window.setTimeout(() => {
      setCellActive(cell.index, true)

      const deactivateTimer = window.setTimeout(() => {
        setCellActive(cell.index, false)
        timers.delete(deactivateTimer)
      }, 460 + distance * 36)

      timers.add(deactivateTimer)
      timers.delete(activateTimer)
    }, delay)

    timers.add(activateTimer)
  }
}

function handleCellEnter(row: number, col: number): void {
  if (!props.interactive) {
    return
  }
  triggerRipple(row, col)
}

function handleCellClick(row: number, col: number): void {
  if (!props.interactive) {
    return
  }
  triggerRipple(row, col)
}

onBeforeUnmount(() => {
  for (const timer of timers) {
    window.clearTimeout(timer)
  }
  timers.clear()
})
</script>

<template>
  <div class="ms-ripple-grid" :class="className" :style="styleVars" aria-hidden="true">
    <button
      v-for="cell in cells"
      :key="cell.index"
      type="button"
      class="ms-ripple-grid__cell"
      :class="{ 'is-active': activeCells.has(cell.index) }"
      tabindex="-1"
      @mouseenter="handleCellEnter(cell.row, cell.col)"
      @click="handleCellClick(cell.row, cell.col)"
    />
  </div>
</template>
