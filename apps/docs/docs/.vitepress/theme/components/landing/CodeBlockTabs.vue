<script setup lang="ts">
import { computed, ref } from 'vue'

export type CodeTab = {
  name: string
  code: string
  language?: string
  highlightLines?: number[]
}

const props = withDefaults(
  defineProps<{
    tabs: CodeTab[]
    defaultTab?: number
    theme?: 'auto' | 'light' | 'dark'
    highlightLines?: number[]
    className?: string
  }>(),
  {
    defaultTab: 0,
    theme: 'auto',
    highlightLines: () => [],
    className: '',
  },
)

const activeIndex = ref(Math.max(0, props.defaultTab))

const activeTab = computed(() => props.tabs[activeIndex.value] ?? props.tabs[0])

const activeLineSet = computed(() => {
  const lines = activeTab.value?.highlightLines?.length
    ? activeTab.value.highlightLines
    : props.highlightLines
  return new Set(lines)
})

const renderedLines = computed(() => {
  const code = activeTab.value?.code ?? ''
  return code.split('\n')
})

function setActive(index: number): void {
  activeIndex.value = index
}
</script>

<template>
  <div class="ms-code-tabs" :class="[className, `is-${theme}`]">
    <div class="ms-code-tabs__head" role="tablist" aria-label="Code file tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.name"
        role="tab"
        :aria-selected="activeIndex === index"
        :class="{ 'is-active': activeIndex === index }"
        @click="setActive(index)"
      >
        {{ tab.name }}
      </button>
    </div>

    <pre class="ms-code-tabs__body"><code>
<span
  v-for="(line, index) in renderedLines"
  :key="`${activeTab?.name ?? 'tab'}-${index}`"
  class="ms-code-tabs__line"
  :class="{ 'is-highlight': activeLineSet.has(index + 1) }"
><span class="ms-code-tabs__line-no">{{ index + 1 }}</span><span class="ms-code-tabs__line-content">{{ line }}</span></span>
</code></pre>
  </div>
</template>
