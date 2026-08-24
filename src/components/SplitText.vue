<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { onEnter } from '@/lib/scrollDirector'

/**
 * Word-by-word reveal. Walks its own text nodes after mount so inline markup
 * such as <strong> inside the slot survives untouched.
 *
 * Each word is a mask with the text sliding up inside it, rather than a fade:
 * a fade makes copy look uncertain, a mask makes it look set. Stagger is 20ms
 * a word — enough to read as a wave, short enough that a long heading still
 * lands together.
 *
 * `active` drives it from outside for the deck, which has no scroll for the
 * director to watch. Left null, it falls back to entering the viewport.
 */
const props = defineProps({
  tag: { type: String, default: 'p' },
  stagger: { type: Number, default: 0.02 },
  maxDelay: { type: Number, default: 0.9 },
  base: { type: Number, default: 0 },
  active: { type: Boolean, default: null }
})

const el = ref(null)
const isIn = ref(false)
let off = null

function splitWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)

  for (const node of nodes) {
    if (!node.nodeValue.trim()) continue
    const frag = document.createDocumentFragment()
    for (const part of node.nodeValue.split(/(\s+)/)) {
      if (!part) continue
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue }
      const span = document.createElement('span')
      span.className = 'word'
      const inner = document.createElement('span')
      inner.className = 'inner'
      inner.textContent = part
      span.appendChild(inner)
      frag.appendChild(span)
    }
    node.parentNode.replaceChild(frag, node)
  }

  root.querySelectorAll('.word > .inner').forEach((w, i) => {
    w.style.transitionDelay = (props.base + Math.min(i * props.stagger, props.maxDelay)) + 's'
  })
}

onMounted(() => {
  splitWords(el.value)
  if (props.active === null) off = onEnter(el.value, () => { isIn.value = true }, 0.9)
  else isIn.value = props.active
})
watch(() => props.active, (v) => { if (v !== null) isIn.value = v })
onBeforeUnmount(() => off?.())
</script>

<template>
  <component :is="tag" ref="el" class="split" :class="{ 'is-in': isIn }">
    <slot />
  </component>
</template>
