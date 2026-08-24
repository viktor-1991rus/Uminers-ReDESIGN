<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { onEnter } from '@/lib/scrollDirector'

const props = defineProps({
  cta: { type: Object, default: () => ({ label: 'Talk to Uminers', to: '#contact' }) },
  links: { type: Array, default: () => [] },
  /* The frosted bar, declared by the view rather than detected at runtime.
     It belongs to a page that scrolls under it — the catalogue — and to no
     other: on the deck the screens exchange in place and there is nothing for
     the bar to separate itself from. See .header--glass in system.css §9. */
  glass: { type: Boolean, default: false }
})

const open = ref(false)
const ctaVisible = ref(false)

function toggle() { open.value = !open.value }
function close() { open.value = false }

watch(open, (v) => { document.body.style.overflow = v ? 'hidden' : '' })

function onKey(e) { if (e.key === 'Escape') close() }

/* The nav CTA appears once the first screen is behind us; the frosted plate
   arrives much earlier and gradually — 0 at the top, full at 120px. Same
   listener, one read of scrollY, no rAF: both are a class/variable write. */
let raf = null
const glassAmount = ref(0)
function watchScroll() {
  const y = window.scrollY
  ctaVisible.value = y > window.innerHeight * 0.55
  glassAmount.value = Math.min(1, Math.max(0, y / 120))
}

onMounted(() => {
  addEventListener('keydown', onKey)
  addEventListener('scroll', watchScroll, { passive: true })
  watchScroll()
})
onBeforeUnmount(() => {
  removeEventListener('keydown', onKey)
  removeEventListener('scroll', watchScroll)
  document.body.style.overflow = ''
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="menu-overlay" :class="{ 'is-on': open }" aria-hidden="true" @click="close" />

  <header
    class="header"
    :class="{ 'header--glass': props.glass }"
    :style="{ '--glass-progress': glassAmount }"
    :data-open="String(open)"
  >
    <div class="header__row">
      <RouterLink class="header__logo plain" to="/" aria-label="Uminers home" />

      <button class="btn" :aria-expanded="String(open)" aria-controls="site-menu" @click="toggle">
        <span>{{ open ? 'Close' : 'Menu' }}</span>
        <i class="btn__plus" aria-hidden="true" />
      </button>

      <a
        class="btn btn--primary header__cta"
        :class="{ 'btn--hidden': !ctaVisible }"
        :href="cta.to"
      ><span>{{ cta.label }}</span></a>
    </div>

    <nav v-show="open" id="site-menu" class="menu">
      <component
        :is="link.route ? RouterLink : 'a'"
        v-for="link in links"
        :key="link.label"
        class="menu__item"
        :class="{ 'menu__item--half': link.half }"
        v-bind="link.route ? { to: link.route } : { href: link.href }"
        @click="close"
      >
        <span>{{ link.label }}</span>
        <i class="menu__arrow">↗</i>
      </component>
    </nav>
  </header>
</template>
