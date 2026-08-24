<script setup>
/**
 * The one piece of chrome that never moves. Sections come and go underneath
 * it; the menu only marks which one is on screen. Centred, because on a deck
 * there is no page start to anchor a left-aligned nav to.
 */
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SECTIONS, deck, go } from '@/lib/deck'

/* One menu for the whole site. On the deck a section name jumps between
   screens; anywhere else it has to get back to the deck first and land on the
   right screen, which is why this is a function rather than a plain button. */
const route = useRoute()
const router = useRouter()
const onDeck = computed(() => route.name === 'deck')

function open(i) {
  if (onDeck.value) { go(i); return }
  router.push({ path: '/', query: { s: SECTIONS[i].key } })
}

/* ── the plate arrives with the scroll, it is not switched on by the route ──
   The route still decides whether the plate can exist at all (the deck does not
   scroll, so nothing ever passes under the bar there and there is nothing to
   separate). Inside that gate the plate is a function of how far the document
   has moved: 0 at the top, 1 at 120px, which is roughly one line of the
   catalogue's grid — the bar is frosted by the time the first thing has
   actually reached it and not before.

   Only the fill's opacity is driven. The blur radius is a constant 10px, so the
   compositor is never asked to re-run a different filter per frame; fading an
   already-filtered layer is a composite, not a repaint. */
const glass = ref(0)
function onScroll() {
  glass.value = Math.min(1, Math.max(0, window.scrollY / 120))
}
watch(onDeck, (v) => { if (v) glass.value = 0; else onScroll() })
onMounted(() => {
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => removeEventListener('scroll', onScroll))
</script>

<template>
  <nav
    class="deckmenu"
    :class="{ 'is-open': deck.ready || !onDeck, 'is-glass': !onDeck }"
    :style="{ '--glass-progress': glass }"
    aria-label="Sections"
  >
    <i class="deckmenu__glass" aria-hidden="true" />

    <RouterLink class="deckmenu__mark" to="/" aria-label="Uminers">
      <img src="/assets/logo/bull-mark.svg" alt="" width="20" height="20" />
    </RouterLink>

    <ul class="deckmenu__list">
      <li v-for="(s, i) in SECTIONS" :key="s.key">
        <button
          class="label deckmenu__item"
          :class="{ 'is-current': onDeck && i === deck.index }"
          :aria-current="onDeck && i === deck.index ? 'true' : undefined"
          @click="open(i)"
        >{{ s.label }}</button>
      </li>
      <li>
        <RouterLink
          class="label deckmenu__item deckmenu__item--link"
          :class="{ 'is-current': route.name === 'catalogue' }"
          to="/catalogue"
        >Catalogue</RouterLink>
      </li>
      <li>
        <RouterLink
          class="label deckmenu__item deckmenu__item--link"
          :class="{ 'is-current': route.name === 'blog' }"
          to="/blog"
        >Blog</RouterLink>
      </li>
      <li>
        <RouterLink
          class="label deckmenu__item deckmenu__item--link"
          :class="{ 'is-current': route.name === 'academy' }"
          to="/academy"
        >Academy</RouterLink>
      </li>
    </ul>

    <span class="label deckmenu__count">
      {{ String(deck.index + 1).padStart(2, '0') }} / {{ String(SECTIONS.length).padStart(2, '0') }}
    </span>
  </nav>
</template>

<style scoped>
/* ── glass, and only where the page actually scrolls ──
   The fill and blur are measured off orionix/about's own nav: blur(10px) over a
   translucent layer of the page's OWN ground colour at 80% — not a neutral
   white, which is why it tracks --background through every theme this bar
   appears under.

   What changed (owner, 24 Aug 2026): it is no longer always on. A frosted bar
   exists to separate fixed chrome from type running underneath it, and on the
   deck nothing ever runs underneath it — the page does not scroll, screens
   exchange in place, and every composition on them is built full-bleed to the
   viewport. There the plate was a permanent grey band across the top of the
   frame, paid for with a per-frame backdrop-filter over a live WebGL canvas.
   On the catalogue, which is an ordinary scrolling document, the type genuinely
   passes under the bar and the glass is doing work.

   `is-glass` is bound to the route (!onDeck): which views scroll is known at
   author time. HOW MUCH glass is bound to the scroll — --glass-progress, 0 at
   the top of the document and 1 at 120px — because a bar that frosts over at
   the first pixel of a gesture announces itself before anything has arrived
   under it. The plate is its own layer so the fade is an opacity on a filtered
   element: blur(10px) is a constant and never re-evaluated at a new radius. */
.deckmenu__glass{
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity .18s linear;
}
.deckmenu.is-glass .deckmenu__glass{
  background: color-mix(in srgb, var(--background) 80%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: var(--glass-progress, 0);
}
.deckmenu{
  position: fixed; z-index: 40;
  top: 0; left: 0; right: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: var(--spacingS) var(--spacingM);
  font-size: 11px;
  color: var(--foreground);
  opacity: 0;
  transition: opacity .7s ease .2s, color .6s ease, background .5s ease;
  pointer-events: none;
}
.deckmenu.is-open{ opacity: 1; pointer-events: auto }

.deckmenu__mark{ display: block; width: 20px; line-height: 0 }
.deckmenu__mark img{ display: block; width: 100%; height: auto }

.deckmenu__list{
  display: flex; gap: var(--spacingM);
  list-style: none; margin: 0; padding: 0;
  justify-self: center;
}

.deckmenu__item{
  appearance: none; background: none; border: 0; padding: 3px 0;
  font-size: 11px;
  color: var(--faded); cursor: pointer;
  position: relative;
  transition: color .35s ease;
}
.deckmenu__item::after{
  content: ""; position: absolute; left: 0; right: 0; bottom: 0;
  height: 1px; background: currentColor;
  transform: scaleX(0); transform-origin: 0 50%;
  transition: transform .45s cubic-bezier(.2,.7,.2,1);
}
.deckmenu__item:hover{ color: var(--foreground) }
.deckmenu__item.is-current{ color: var(--foreground) }
.deckmenu__item.is-current::after{ transform: scaleX(1) }

.deckmenu__item--link{ text-decoration: none; display: inline-block }

.deckmenu__count{
  justify-self: end;
  color: var(--faded);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 860px){
  .deckmenu__list{ display: none }
}
</style>
