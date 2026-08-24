<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { createPixelField } from '@/lib/pixelField'

const el = ref(null)
let field = null

onMounted(() => {
  field = createPixelField(el.value)
})

onBeforeUnmount(() => {
  field?.destroy()
  field = null
})
</script>

<template>
  <canvas id="pixelfield" ref="el" aria-hidden="true" />
</template>
