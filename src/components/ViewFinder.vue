<script setup>
defineProps({
  position: { type: String, default: '' }   // 'top' | 'bottom' | ''
})
</script>

<template>
  <div
    class="viewfinder"
    :class="position ? `viewfinder--${position}` : null"
    aria-hidden="true"
  >
    <svg viewBox="0 0 10 10"><path d="M5 0v10M0 5h10" /></svg>
    <svg viewBox="0 0 10 10"><path d="M5 0v10" /></svg>
    <svg viewBox="0 0 10 10"><path d="M5 0v10M0 5h10" /></svg>
  </div>
</template>
