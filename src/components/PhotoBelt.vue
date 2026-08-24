<script setup>
/**
 * A belt of photographs, running off the right edge of the screen.
 *
 * Geometry is the reference's, measured rather than guessed: the belt starts
 * at 20vw — the same gutter the copy uses — and runs 80vw with no right
 * padding at all, so it stops exactly at the edge of the window. That missing
 * right margin is the whole trick; it reads as though the row continues past
 * the screen.
 *
 * The cascade is not staggered. Every frame moves for the same 1.6s on the
 * same curve, but each starts further right than the last (15/30/45/60% of its
 * own width), so they arrive together while appearing to chase each other in.
 * Inside each frame the image starts at scale 1.2 and settles to 1, which is
 * what keeps the photographs from looking pinned on.
 */
defineProps({
  items: { type: Array, default: () => [] },
  open: { type: Boolean, default: false }
})
</script>

<template>
  <div class="belt" :class="{ 'is-open': open }"
       :style="{ '--n': Math.min(items.length, 4) }">
    <figure v-for="(it, i) in items.slice(0, 4)" :key="it.src" class="belt__frame">
      <img :src="it.src" :alt="it.alt" loading="lazy">
      <figcaption v-if="it.caption" class="belt__caption">{{ it.caption }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.belt{
  display: flex;
  width: 80vw; margin-left: 20vw;   /* no right margin: it ends at the edge */
  font-size: 0;                      /* frames sit flush, no inline gaps */
}

.belt__frame{
  flex: 0 0 calc(100% / var(--n, 4));
  position: relative; margin: 0;
  aspect-ratio: 1.432 / 1;
  max-height: 20vh;              /* a band, never half the screen */
  overflow: hidden;
  opacity: 0;
  transform: translateX(var(--offset, 15%));
  transition: transform 1.6s cubic-bezier(0,0,0,1),
              opacity 1.6s cubic-bezier(0,0,0,1);
}
.belt__frame:nth-child(1){ --offset: 15% }
.belt__frame:nth-child(2){ --offset: 30% }
.belt__frame:nth-child(3){ --offset: 45% }
.belt__frame:nth-child(4){ --offset: 60% }

.belt.is-open .belt__frame{ opacity: 1; transform: translateX(0) }

.belt__frame img{
  width: 100%; height: 100%;
  object-fit: cover; object-position: 50% 50%;
  transform: scale(1.2);
  transition: transform 1.6s cubic-bezier(0,0,0,1);
}
.belt.is-open .belt__frame img{ transform: scale(1) }

.belt__caption{
  position: absolute; left: var(--spacingM); bottom: var(--spacingS);
  margin: 0; color: var(--white);
  font-family: var(--fontMono); font-size: 11px; line-height: 1;
  text-transform: uppercase; letter-spacing: .02em;
  text-shadow: 0 1px 4px rgba(0,0,0,.55), 0 0 1px rgba(0,0,0,.4);
}

@media (orientation: portrait), (max-width: 860px){
  .belt{ width: 100vw; margin-left: 0 }
  .belt__frame{ flex: 0 0 50% }
}
</style>
