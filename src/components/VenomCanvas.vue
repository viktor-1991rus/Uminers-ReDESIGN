<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { createVenom } from '@/lib/venom'
import { setVenomHandler } from '@/lib/scrollDirector'
import { bindVenom, bindVenomVisibility } from '@/lib/venomBus'

const el = ref(null)
const on = ref(false)
let engine = null

onMounted(() => {
  const q = new URLSearchParams(location.search)

  engine = createVenom(el.value, {
    markUrl: '/assets/logo/bull-mark.svg',
    markScale: 0.60,
    fit: 0.40,
    offsetY: -0.07,
    // the channel separation is the whole colour story — warm sand against cool
    // lavender at the silhouette edge, no palette involved
    saturation: 0.30,
    // deliberate: cap the extrapolation and lift the black floor so the
    // densest regions read as charcoal and overlaid text stays legible
    ceil: 1.02,
    floor: 0.34,
    // capture hooks — headless renders too few frames to reach full density
    instant: q.has('instant'),
    fixedStep: q.has('instant'),
    settleOverride: q.has('settled') ? 1 : null
  })

  // views morph the mark through the bus (catalogue categories do this)
  bindVenom(engine)

  // the director decides which zones the substance belongs to while a page
  // scrolls; the deck sets it directly, since it has no scroll to read
  const show = (v) => { on.value = !!v }
  setVenomHandler(show)
  bindVenomVisibility(show)
})

onBeforeUnmount(() => {
  setVenomHandler(null)
  bindVenomVisibility(null)
  bindVenom(null)
  engine?.destroy()
})
</script>

<template>
  <canvas id="venom" ref="el" :class="{ 'is-on': on }" aria-hidden="true" />
</template>
