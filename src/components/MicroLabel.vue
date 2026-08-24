<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { onEnter } from '@/lib/scrollDirector'

/**
 * Mono uppercase micro label with a scramble reveal.
 * The scrambled characters come from the label's own letters, so mid-animation
 * it reads as the same words taken apart rather than as random symbols.
 */
const props = defineProps({
  text: { type: String, required: true },
  block: { type: Boolean, default: false },
  faded: { type: Boolean, default: false }
})

const el = ref(null)
const shown = ref(props.text)
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
let busy = false
let off = null
let raf = null

function scramble() {
  if (reduced || busy) return
  const text = props.text
  const pool = text.replace(/\s/g, '')
  if (!pool.length) return
  busy = true
  const start = performance.now()

  const step = (now) => {
    const p = Math.min(1, (now - start) / 800)
    const settled = Math.floor(p * p * text.length)      // ease-in
    let out = ''
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      out += ch === ' ' ? ' '
        : (i < settled ? ch : pool[(Math.random() * pool.length) | 0])
    }
    shown.value = out
    if (p < 1) raf = requestAnimationFrame(step)
    else { shown.value = text; busy = false }
  }
  raf = requestAnimationFrame(step)
}

/* `shown` is seeded from the prop once and then owned by the animation, so a
   label whose text CHANGES in place — the catalogue's category heading — kept
   printing the category it was mounted with. A change of subject is exactly the
   moment the reveal is for, so it re-scrambles rather than swapping silently;
   a run already in flight is cut first, otherwise it would settle on the old
   text after the new one is set. */
watch(() => props.text, (text) => {
  if (raf) { cancelAnimationFrame(raf); raf = null }
  busy = false
  shown.value = text
  scramble()
})

onMounted(() => { off = onEnter(el.value, scramble, 0.95) })
onBeforeUnmount(() => { off?.(); if (raf) cancelAnimationFrame(raf) })
</script>

<template>
  <p
    ref="el"
    class="label"
    :class="{ 'label--block': block, 'label--faded': faded }"
    :style="busy ? 'pointer-events:none' : null"
    @mouseenter="scramble"
  >{{ shown }}</p>
</template>
