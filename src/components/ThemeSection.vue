<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { registerSection, registerVenomZone } from '@/lib/scrollDirector'

const props = defineProps({
  theme: { type: String, default: 'light' },
  venom: { type: Boolean, default: false },
  tag: { type: String, default: 'section' },
  flush: { type: Boolean, default: false }
})

const el = ref(null)
let offSection = null
let offZone = null

onMounted(() => {
  offSection = registerSection(el.value, props.theme)
  if (props.venom) offZone = registerVenomZone(el.value)
})
onBeforeUnmount(() => { offSection?.(); offZone?.() })
</script>

<template>
  <component
    :is="tag"
    ref="el"
    class="section"
    :class="{ 'section--flush': flush }"
    :data-theme="theme"
  >
    <slot />
  </component>
</template>
