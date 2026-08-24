<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { DOT_FRAMES, DOT_POS, FRAME_MS } from '@/lib/dotFrames'
import { onEnter } from '@/lib/scrollDirector'

/**
 * 5×5 dot-matrix icon — Linear's mechanism.
 *
 * Only opacity changes, held per frame with no interpolation. One shared ticker
 * drives every icon on the page; each variant has a different frame count, so
 * their periods differ and they drift apart without any hand-set delays.
 *
 * Paused while off-screen. Reveals once with blur → sharp, which is the other
 * half of what makes Linear's icons read as expensive.
 */
const props = defineProps({
  variant: { type: String, default: 'pong' },
  size: { type: Number, default: 56 },
  index: { type: Number, default: 0 },
  dim: { type: Number, default: 0.20 }   // 0.3 black on white is too heavy
})

const frames = DOT_FRAMES[props.variant] ?? DOT_FRAMES.pong
const el = ref(null)
const frame = ref(0)
const revealed = ref(false)
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

/* one ticker for the whole page */
let ticker = null
let onScreen = true

const cells = computed(() => {
  const grid = frames[frame.value % frames.length]
  const out = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      out.push({ key: `${r}-${c}`, cx: DOT_POS[c], cy: DOT_POS[r], lit: grid[r][c] })
    }
  }
  return out
})

function visible() {
  const r = el.value?.getBoundingClientRect()
  if (!r) return false
  return r.bottom > -80 && r.top < (window.innerHeight || 800) + 80
}

let offEnter = null

onMounted(() => {
  offEnter = onEnter(el.value, () => { revealed.value = true }, 0.95)

  if (reduced) return
  const start = performance.now()
  ticker = setInterval(() => {
    onScreen = visible()
    if (!onScreen) return
    frame.value = Math.floor((performance.now() - start) / FRAME_MS)
  }, FRAME_MS)
})

onBeforeUnmount(() => {
  offEnter?.()
  if (ticker) clearInterval(ticker)
})
</script>

<template>
  <svg
    ref="el"
    class="dmi"
    :class="{ 'is-in': revealed }"
    :style="{ '--delay': (index * 80) + 'ms' }"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle
      v-for="d in cells"
      :key="d.key"
      :cx="d.cx"
      :cy="d.cy"
      r="1"
      fill="currentColor"
      :opacity="d.lit ? 1 : dim"
    />
  </svg>
</template>

<style scoped>
.dmi{
  display: block;
  opacity: 0;
  filter: blur(10px);
  transform: translateY(20%);
}
.dmi.is-in{
  animation: dmiEnter 1s cubic-bezier(.25,.1,.25,1) var(--delay, 0s) forwards;
}
@keyframes dmiEnter{
  from{ opacity: 0; filter: blur(10px); transform: translateY(20%) }
  to  { opacity: 1; filter: blur(0px);  transform: translateY(0) }
}
@media (prefers-reduced-motion: reduce){
  .dmi, .dmi.is-in{ animation: none; opacity: 1; filter: none; transform: none }
}
</style>
