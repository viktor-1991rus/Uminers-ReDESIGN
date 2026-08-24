<script setup>
/**
 * Decorative plus marks pinned to the corners of the nearest positioned
 * ancestor. Used sparingly — two or three sections per page, no more.
 */
defineProps({
  corners: { type: String, default: 'tl tr' }   // any of: tl tr bl br
})
</script>

<template>
  <div class="gmarks" aria-hidden="true">
    <i v-for="c in corners.split(' ')" :key="c" class="gmark" :class="`gmark--${c}`" />
  </div>
</template>
