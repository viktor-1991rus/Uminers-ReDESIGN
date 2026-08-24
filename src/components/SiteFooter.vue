<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { registerSection, registerVenomZone } from '@/lib/scrollDirector'
import ViewFinder from './ViewFinder.vue'

defineProps({
  links: { type: Array, default: () => [] }
})

const el = ref(null)
let offSection = null
let offZone = null

onMounted(() => {
  offSection = registerSection(el.value, 'light')
  offZone = registerVenomZone(el.value)
})
onBeforeUnmount(() => { offSection?.(); offZone?.() })
</script>

<template>
  <footer ref="el" class="footer" data-theme="light">
    <div class="wrapper">
      <ViewFinder />
      <h2 class="type-xxl footer__claim">Uminers.<br>This is where intelligence runs.</h2>
      <div class="footer__meta">
        <nav class="footer__links label">
          <a v-for="l in links" :key="l.label" :href="l.href">{{ l.label }}</a>
        </nav>
        <div class="footer__legal label">
          <p>Uminers · Since 2017</p>
          <p>© 2017–2026 Uminers. All rights reserved</p>
        </div>
      </div>
    </div>
  </footer>
</template>
