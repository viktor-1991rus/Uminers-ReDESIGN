<script setup>
/**
 * The gate that holds the first screen.
 *
 * Nothing is shown until the substance has something to form: the field is
 * blank, a count runs up, and only when the page has actually loaded does the
 * gate lift. The bull then condenses out of the dispersed substance — that is
 * venom's own formation, not a separate animation — and the line resolves out
 * of the same paper the gate left behind.
 */
import { onMounted, ref } from 'vue'
import { openDeck } from '@/lib/deck'

const pct = ref(0)
const lifting = ref(false)
const gone = ref(false)

onMounted(() => {
  let loaded = false
  const finish = () => { loaded = true }
  if (document.readyState === 'complete') finish()
  else addEventListener('load', finish, { once: true })

  // the count is honest about waiting and impatient about finishing: it creeps
  // to 92 on its own and only closes the gap once the page is actually in
  const t = setInterval(() => {
    const ceiling = loaded ? 100 : 92
    pct.value = Math.min(ceiling, pct.value + (loaded ? 9 : 2.2))
    if (pct.value >= 100) {
      clearInterval(t)
      lifting.value = true
      setTimeout(() => { gone.value = true; openDeck() }, 900)
    }
  }, 60)
})
</script>

<template>
  <div v-if="!gone" class="gate" :class="{ 'is-lifting': lifting }">
    <div class="gate__inner">
      <span class="label">Uminers</span>
      <div class="gate__bar"><i :style="{ transform: `scaleX(${pct / 100})` }" /></div>
      <span class="label gate__count">{{ Math.round(pct) }}</span>
    </div>
  </div>
</template>

<style scoped>
.gate{
  position: fixed; inset: 0; z-index: 90;
  background: var(--background);
  color: var(--foreground);
  display: grid; place-items: center;
  transition: opacity .85s cubic-bezier(.2,.7,.2,1);
}
.gate.is-lifting{ opacity: 0; pointer-events: none }

.gate__inner{ display: flex; align-items: center; gap: var(--spacingS) }

.gate__bar{
  width: 168px; height: 1px;
  background: var(--hairline);
  overflow: hidden;
}
.gate__bar i{
  display: block; height: 100%;
  background: currentColor;
  transform-origin: 0 50%;
  transition: transform .25s linear;
}
.gate__count{
  color: var(--faded);
  min-width: 3ch; text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
