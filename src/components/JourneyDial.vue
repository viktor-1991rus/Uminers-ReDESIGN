<script setup>
/**
 * The company's route as a dial: years ride an arc on the left, the stop's
 * words sit in the middle, its trophy stands on the right.
 *
 * The mechanics are lifted from a teardown of the orionix reference, measured
 * rather than eyeballed, and then corrected where the reference was wrong:
 *
 *   · TRANSFER FUNCTION. Scroll maps to rotation linearly, with no easing on
 *     the scrub — easing a scrubbed value makes the wheel feel like it is
 *     fighting the finger. The reference runs 0.0333 deg/px; this runs one stop
 *     per 620 px, which is 0.0484 deg/px at a 30 degree step. The reference
 *     spent 3600 px of scroll to move the arc 838 px, and holding the screen
 *     that long for that little travel is the one thing not worth copying.
 *
 *   · ONE ANIMATED NODE. Nine spokes, one rotating parent. The spokes carry
 *     static angles and never animate. Labels counter-rotate through a single
 *     custom property, so a frame costs one style write, not nine.
 *
 *   · THREE DURATIONS, ONE CAUSE. On a stop change the marker settles in
 *     400 ms, the words in 750 ms, the trophy in 1000 ms — small things arrive
 *     first, large things carry their own inertia. They start together and
 *     finish apart, which is what makes it read as one move rather than three.
 *
 *   · REDUCED MOTION IS HONOURED. The reference ignores it outright — measured,
 *     the wheel keeps spinning and the spring keeps playing. Here the dial
 *     stops rotating and every stop is simply listed, because a timeline whose
 *     content only exists mid-rotation is a timeline some people cannot read.
 *
 * The trophies are transparent glass photographed on white. They only exist as
 * an image on a dark ground, which is why this component assumes the black
 * theme and paints no plate of its own.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { JOURNEY } from '@/data/journey'

/* degrees between neighbouring stops, and the scroll it takes to cross one */
const STEP_DEG = 30
const PX_PER_STEP = 620

const last = JOURNEY.length - 1
const track = ref(null)
const rotation = ref(0)
const active = ref(0)
const reduced = ref(false)

const current = computed(() => JOURNEY[active.value])

/* the tall element the sticky stage scrolls through: one screen to read the
   first stop, plus the travel needed to reach the last */
const trackHeight = computed(() => `calc(100vh + ${last * PX_PER_STEP}px)`)

let ticking = false
function onScroll() {
  if (ticking || reduced.value) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    const el = track.value
    if (!el) return

    // progress across the travel, clamped at both ends so the dial parks
    // instead of overshooting when the page rubber-bands
    const travel = el.offsetHeight - window.innerHeight
    const p = travel > 0
      ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel))
      : 0

    rotation.value = -STEP_DEG * last * p
    // the stop changes at the midpoint between two spokes, not on arrival
    active.value = Math.round(p * last)
  })
}

let mq
onMounted(() => {
  mq = matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = mq.matches
  mq.addEventListener('change', e => { reduced.value = e.matches })

  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- reduced motion: the same content, listed, with no dial at all -->
  <ol v-if="reduced" class="dial-list">
    <li v-for="s in JOURNEY" :key="s.year + s.title">
      <p class="dial-list__year">{{ s.year }}<template v-if="s.period"> · {{ s.period }}</template></p>
      <h3 class="dial-list__title">{{ s.title }}</h3>
      <p class="body">{{ s.text }}</p>
      <figure v-if="s.award" class="dial-list__award">
        <img :src="s.award.img" :alt="s.award.forum + ' — ' + s.award.title" loading="lazy">
        <figcaption class="label">{{ s.award.forum }} · {{ s.award.title }}</figcaption>
      </figure>
    </li>
  </ol>

  <div v-else ref="track" class="dial" :style="{ height: trackHeight }">
    <div class="dial__stage">

      <!-- ── the arc, off-centre to the left ───────────────────────────── -->
      <div class="dial__wheel" :style="{ '--rot': rotation + 'deg' }" aria-hidden="true">
        <div class="dial__ring" />
        <div
          v-for="(s, i) in JOURNEY" :key="s.year + s.title"
          class="dial__spoke" :class="{ 'is-on': i === active }"
          :style="{ '--a': i * STEP_DEG + 'deg' }"
        >
          <span class="dial__mark" />
          <span class="dial__year">
            {{ s.year }}
            <!-- two stops can share a year — 2024 landed a site in April and a
                 second award in October, 2025 did Ledger in February and a
                 third award in October. The big number alone would print the
                 same label on two neighbouring spokes with nothing to tell
                 them apart, so a stop that shares its year with another one
                 carries the month underneath it; a stop with a year to itself
                 stays exactly as bare as the reference it came from. -->
            <small v-if="s.period" class="dial__period">{{ s.period }}</small>
          </span>
        </div>
      </div>

      <!-- ── the stop's words ──────────────────────────────────────────── -->
      <div class="dial__body">
        <p class="label dial__eyebrow">
          {{ current.year }}<template v-if="current.period"> · {{ current.period }}</template>
        </p>
        <!-- keyed so the swap animates per stop rather than retyping in place -->
        <h3 :key="'t' + active" class="dial__title">{{ current.title }}</h3>
        <p :key="'p' + active" class="body dial__text">{{ current.text }}</p>
      </div>

      <!-- ── the trophy, or nothing ────────────────────────────────────── -->
      <div class="dial__object">
        <figure v-if="current.award" :key="'a' + active" class="dial__award">
          <img :src="current.award.img"
               :alt="current.award.forum + ' — ' + current.award.title" loading="lazy">
          <figcaption>
            <span class="label">{{ current.award.forum }}</span>
            {{ current.award.title }}
          </figcaption>
        </figure>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dial{ position: relative }
/* Three columns, and the first one is empty on purpose: it is the band the arc
   is allowed to occupy. The arc used to be positioned independently of the text
   grid, and the two collided — the active year sat at the arc's rightmost point
   and the heading started 40px to its LEFT, so every award stop printed its
   year straight through its own title. Reserving the band and deriving the
   wheel's centre from it means the two cannot overlap at any width. */
.dial__stage{
  --r: 22rem;                 /* arc radius */
  --arc: 26rem;               /* band reserved for the arc and its labels */
  --label: 8rem;              /* room a year label needs past the arc */
  position: sticky; top: 0; height: 100vh;
  display: grid; align-items: center;
  grid-template-columns: var(--arc) minmax(0, 26rem) minmax(0, 22rem);
  justify-content: center; column-gap: var(--spacingXL);
  overflow: hidden;
}

/* ── the wheel ──────────────────────────────────────────────────────────
   The centre sits outside the viewport on the left, so only the right edge
   of the circle crosses the screen and the years arrive on a curve. */
.dial__wheel{
  /* centre derived, not chosen: place it so the arc's rightmost point plus a
     year label lands exactly at the right edge of the reserved band */
  position: absolute; top: 50%;
  left: calc(var(--arc) - var(--r) - var(--label));
  width: 0; height: 0;
  transform: translateY(-50%) rotate(var(--rot));
  /* no transition: this is scrubbed, and easing a scrubbed value fights the
     finger. The only smoothing is the browser's own scroll inertia. */
}
.dial__ring{
  position: absolute; left: calc(var(--r) * -1); top: calc(var(--r) * -1);
  width: calc(var(--r) * 2); height: calc(var(--r) * 2);
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  border-radius: 50%;
}
.dial__spoke{
  position: absolute; left: 0; top: 0;
  display: flex; align-items: center; gap: .75rem;
  transform: rotate(var(--a)) translateX(var(--r));
  white-space: nowrap;
}
/* the label rides the arc but stays upright — a tilted year is a year you
   have to decode before you can read it */
.dial__year{
  display: flex; align-items: baseline; gap: 6px;
  transform: rotate(calc((var(--rot) + var(--a)) * -1));
  font-size: var(--headingM); line-height: 1;
  letter-spacing: var(--letterSpacingTight);
  color: color-mix(in srgb, currentColor 38%, transparent);
  transition: color .4s ease, opacity .4s ease;
}
.dial__spoke.is-on .dial__year{ color: currentColor }
.dial__period{
  font-family: var(--fontMono); font-size: 10px; text-transform: uppercase;
  letter-spacing: .06em; font-weight: 400;
  color: color-mix(in srgb, currentColor 55%, transparent);
}

/* the marker: width swaps instantly and scale carries the growth, so a
   "growing" dot never triggers a reflow */
.dial__mark{
  width: 18px; height: 2px; flex: 0 0 auto;
  background: currentColor; opacity: .3;
  transform: scaleX(.11); transform-origin: 0 50%;
  transition:
    transform .4s cubic-bezier(0, 0, 0, 1),
    opacity .4s ease;
}
.dial__spoke.is-on .dial__mark{ transform: scaleX(1); opacity: 1 }

/* ── the words ─────────────────────────────────────────────────────────── */
.dial__body{ grid-column: 2; min-width: 0 }
/* The arc already prints the active year, in the largest type on the screen.
   Repeating it directly above the title says the same thing twice, so it is
   hidden here and brought back below 1100px, where the arc is not drawn and
   this becomes the only place the year appears. */
.dial__eyebrow{ display: none; color: var(--faded); margin: 0 0 var(--spacingS) }
.dial__title{
  margin: 0; font-size: var(--headingL, 2.5rem); font-weight: var(--weightMid);
  letter-spacing: var(--letterSpacingTight); line-height: 1.05;
}
.dial__text{ margin: var(--spacingS) 0 0; max-width: 34ch }

/* entry only — a stop that is leaving is replaced, not animated out */
.dial__title, .dial__text{ animation: rise .75s cubic-bezier(0, 0, 0, 1) both }
.dial__text{ animation-duration: .75s }

@keyframes rise{
  from{ opacity: 0; transform: translate3d(0, 14px, 0) }
  to  { opacity: 1; transform: none }
}

/* ── the trophy ────────────────────────────────────────────────────────── */
.dial__object{
  grid-column: 3; justify-self: center;
  display: flex; align-items: center; justify-content: center;
  height: min(62vh, 34rem);
}
.dial__award{
  margin: 0; display: grid; justify-items: center; gap: var(--spacingS);
  animation: lift 1s cubic-bezier(0, 0, 0, 1) both;
}
.dial__award img{
  max-height: min(52vh, 28rem); width: auto; object-fit: contain;
  /* the glass is photographed on white and cut to alpha; on the black plate it
     needs a little separation from the ground or it reads as a flat decal */
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, .55));
}
.dial__award figcaption{
  display: grid; justify-items: center; gap: 4px;
  text-align: center; font-size: 14px; line-height: 1.3;
  color: color-mix(in srgb, currentColor 72%, transparent);
}

@keyframes lift{
  from{ opacity: 0; transform: translate3d(0, 26px, 0) }
  to  { opacity: 1; transform: none }
}

/* ── narrow ────────────────────────────────────────────────────────────── */
@media (max-width: 1100px){
  .dial__stage{ grid-template-columns: minmax(0, 1fr); row-gap: var(--spacingL) }
  .dial__wheel{ display: none }          /* an off-screen circle needs width to exist */
  .dial__eyebrow{ display: block }       /* with no arc, this is the only year on screen */
  .dial__body, .dial__object{ grid-column: 1 }
  .dial__object{ height: auto; order: -1 }
  .dial__award img{ max-height: 34vh }
}

/* ── the listed fallback ───────────────────────────────────────────────── */
/* margin-top, because this branch sits directly under the section's own lede
   and without it the first year collides with the last line of that paragraph */
.dial-list{ list-style: none; margin: var(--spacingXL) 0 0; padding: 0;
            display: grid; gap: var(--spacingXL) }
.dial-list__year{ margin: 0; color: var(--faded); font-family: var(--fontMono);
                  font-size: 11px; letter-spacing: .07em; text-transform: uppercase }
.dial-list__title{ margin: var(--spacingXS) 0 var(--spacingS);
                   font-size: var(--headingM); font-weight: var(--weightMid);
                   letter-spacing: var(--letterSpacingTight) }
.dial-list__award{ margin: var(--spacingM) 0 0 }
.dial-list__award img{ max-height: 18rem; width: auto }
</style>
