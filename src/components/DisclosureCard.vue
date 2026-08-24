<script setup>
import { ref } from 'vue'

defineProps({
  title: { type: String, required: true },
  lede: { type: String, required: true }
})

const open = ref(false)
const panel = ref(null)

/* Opening: measure, then animate to that height. Closing runs faster and
   reverses the order — children leave first, then the box collapses. */
function onEnterEl(el) {
  el.style.height = '0px'
  el.style.opacity = '0'
  void el.offsetHeight
  el.style.transition = 'height .6s cubic-bezier(.22,1,.36,1), opacity .5s ease-out'
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
}
function onAfterEnter(el) {
  el.style.transition = ''
  el.style.height = 'auto'
}
function onLeaveEl(el) {
  el.style.height = el.scrollHeight + 'px'
  void el.offsetHeight
  el.style.transition = 'height .4s cubic-bezier(.64,0,.78,0), opacity .25s ease-in'
  el.style.height = '0px'
  el.style.opacity = '0'
}
</script>

<template>
  <article class="card">
    <h3>{{ title }}</h3>
    <p class="body card__lede">{{ lede }}</p>
    <slot name="summary" />

    <button class="disclose" :aria-expanded="String(open)" @click="open = !open">
      <span>{{ open ? 'Hide details' : 'See details' }}</span>
      <i class="disclose__chevron" aria-hidden="true">⌄</i>
    </button>

    <Transition
      @enter="onEnterEl"
      @after-enter="onAfterEnter"
      @leave="onLeaveEl"
    >
      <div v-show="open" ref="panel" class="card__more">
        <slot name="details" />
      </div>
    </Transition>
  </article>
</template>
