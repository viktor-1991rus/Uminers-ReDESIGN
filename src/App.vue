<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import VenomCanvas from './components/VenomCanvas.vue'
import PixelField from './components/PixelField.vue'
import { startDirector, pass } from './lib/scrollDirector'

const route = useRoute()

/* The deck holds one screen at a time and never scrolls, so there is nothing
   for the director to read there; it owns the substance itself. */
const scrolls = () => route.name !== 'deck'

/* On a cold load the route is still resolving when App mounts, so route.name
   is undefined and a naive check starts the director on the deck as well —
   which then reports "no venom zones here" and hides the substance. Wait for
   a resolved name instead. */
watch(() => route.name, (name) => {
  if (!name || name === 'deck') return
  startDirector()
  requestAnimationFrame(() => { pass(); setTimeout(pass, 120) })
}, { immediate: true })
</script>

<template>
  <PixelField />
  <VenomCanvas />
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>
