<script setup>
/**
 * COMPANY — the route from 2017, read off a dial.
 *
 * Rebuilt against a measured teardown of orionix.framer.website (the services
 * dial, ~scrollY 6300-9200 at 1440x900). What that page actually does, in
 * numbers, because almost none of it was what the previous build assumed:
 *
 *   circle centre      (-148.7, 360)   = -10.3vw, 40vh — off the left edge
 *   ring               800x800, border 1px rgba(0,0,0,.08), border-radius 1000px
 *   labels             r = 433 (33px OUTSIDE the ring), 32px, weight 350
 *   active label       parks at 0deg — the 3 o'clock apex, screen x = 284
 *   step               exactly 30deg between stops
 *   dot                10.4px, pure red, r = 400 (ON the ring), scale ~.125 when idle
 *   active vs idle     #141414 vs #A4A4A4. SAME size, SAME weight. Only tone.
 *   rotation           -0.0416667 deg per px of scroll, dead linear, 720px = 30deg
 *   transition         NONE. transition-duration is 0s on every node in it.
 *   right column       plain document flow. Slides are 720px apart and simply
 *                      scroll past; the dial is the only sticky thing.
 *
 * Three findings mattered more than the rest:
 *
 * 1. The labels are NOT counter-rotated. They are welded to their spoke and
 *    ride tangentially, so a stop reads upright exactly when it is the active
 *    one and tilts further the further it is from the apex. The tilt IS the
 *    state. The previous build counter-rotated every label upright and threw
 *    the whole idea away — and worse, it did it with
 *    `transform: rotate(calc((var(--rot) + var(--a)) * -1))` and no transition
 *    on transform. An unregistered custom property is not interpolable, so
 *    every label SNAPPED to its destination angle on frame 1 while the ring
 *    took 1s to get there. That is the "криво": for a full second the type was
 *    oriented for a wheel position the wheel had not reached.
 *
 * 2. There is exactly one moving node. Here too: `.jw__dial` carries the only
 *    animated rotation and nine spokes ride it as static children; the copy is
 *    one track that translates; the awards are one track that translates. Three
 *    composited transforms per step, no per-child animation, nothing on the
 *    main thread. The previous build ran the ring on a 1s spring, nine labels
 *    on an instant snap, every word on its own 0.7s keyframe at a 20ms stagger,
 *    and the trophy on a separate Vue <Transition> — five clocks, none of them
 *    agreeing. Five clocks is what "непонятно" means.
 *
 * 3. No backdrop-filter, and nothing here transitions anything but transform
 *    and opacity. The previous build had two frosted panels sitting directly
 *    over a live WebGL canvas that is itself under two full-screen
 *    mix-blend-mode:multiply layers. backdrop-filter over that stack is a
 *    readback plus a blur of the composited backdrop on every frame the wheel
 *    moves — free on Apple silicon, and the frame budget on an integrated
 *    Intel GPU. It also existed only to hide a substance that could simply be
 *    turned down, which is what deck.js now does.
 *
 * The awards, and the one thing about them that decides everything else. They
 * are glass RENDERED ON BLACK: measured across the whole set, the median
 * premultiplied luma is 32-72 of 255 at a median alpha of 38-83. The engraving
 * is white. Composited onto the paper (#F2F0EA) the trophy's mid-tone lands at
 * ~233 — nine levels below the ground it is standing on — and the engraving
 * lands ON the paper value exactly. That is not "hard to read"; it is a
 * white-on-white asset.
 *
 * The previous revision answered that with `filter: invert(1)` on the image.
 * It read, and it was rejected (owner, 24 Aug 2026) for the right reason: an
 * inverted trophy is not the trophy. These are photographs of physical objects
 * with engraved text on them, and repainting the object to suit the page is
 * the one move a photograph of an award is not allowed to make.
 *
 * So the ground moves instead of the asset. deck.js re-aims the bull on this
 * section — aim(0.83, 0.42, -0.04, 1.0), i.e. fit 0.42 and offsetX -0.4435 —
 * which parks the mark's densest mass at 83% of the viewport width, directly
 * behind .jw__slot, and
 * venom renders at mix-blend-mode: multiply. The trophy is then standing on
 * dark substance rather than on paper, and the white engraving reads against
 * it. Nothing is applied to the image itself: no filter, no plate, no card, no
 * backdrop-filter. The asset ships as it was shot.
 *
 * The slot is permanent. Five of the nine stops carry a trophy; the other four
 * leave the slot empty on purpose (owner's decision, 24 Aug 2026). Nothing
 * moves when a stop without one arrives: the copy column, the shelf rule and
 * the shelf rule are in the same place at every stage, so an empty slot reads
 * as a year without an award rather than as a failed image.
 */
import { JOURNEY } from '@/data/journey'
import MicroLabel from '@/components/MicroLabel.vue'

defineProps({
  stage: { type: Number, default: 0 },
  active: { type: Boolean, default: false }
})

/* 30deg, straight off the reference. At nine stops that is a 240deg sweep, and
   the window on the arc only ever shows the active stop plus one either side —
   which is the whole point of a radius this large. */
const STEP_DEG = 30
</script>

<template>
  <div class="jw" :class="{ 'is-active': active }" :style="{ '--stage': stage, '--rot': (-STEP_DEG * stage) + 'deg' }">


    <!-- ── the dial ────────────────────────────────────────────────────
         The mask is the one thing the reference does NOT do — its arc is a
         flat 8% hairline top to bottom and gets away with it on a bare white
         page. Ours crosses the header, the venom mark and the pixel field, so
         the ends are faded out instead of cut off by the viewport. The
         gradient never changes, so it costs one mask layer at composite time
         and nothing per frame. -->
    <div class="jw__dialclip" aria-hidden="true">
      <div class="jw__ring" />
      <div class="jw__dial">
        <div
          v-for="(s, i) in JOURNEY" :key="s.year + s.title"
          class="jw__spoke" :class="{ 'is-on': i === stage }"
          :style="{ '--a': i * STEP_DEG + 'deg' }"
        >
          <span class="jw__dot" />
          <span class="jw__tag">
            <span class="jw__year">{{ s.year }}</span>
            <span v-if="s.period" class="jw__period">{{ s.period }}</span>
          </span>
        </div>
      </div>
    </div>

    <MicroLabel class="jw__label" text="2017 — now" />

    <!-- ── the copy ────────────────────────────────────────────────────
         One track, one transform. Each slide is pinned at its own multiple of
         --step-y and the track slides by the same multiple, so the active
         stop is always on the same line as the dial's apex — the middle of
         the screen. Neighbours are at opacity 0 and cross under it. -->
    <div class="jw__stage">
      <div class="jw__track">
        <article
          v-for="(s, i) in JOURNEY" :key="s.year + s.title"
          class="jw__slide" :class="{ 'is-on': i === stage }"
          :style="{ '--i': i }"
          :aria-hidden="i !== stage"
        >
          <p class="label jw__when">
            {{ s.year }}<span v-if="s.period"> · {{ s.period }}</span>
          </p>
          <h2 class="jw__title">{{ s.title }}</h2>
          <p class="jw__text">{{ s.text }}</p>
        </article>
      </div>
    </div>

    <!-- ── the belt ────────────────────────────────────────────────────
         Three frames of the company, on the copy's own left rule, and the same
         three at every stop. Unbound is the only honest version: bound per
         stage, the aerial would sit next to "A hydro campus in Ethiopia" and
         become a caption claiming it IS that campus, which is exactly the sort
         of unsourced assertion the header of journey.js forbids. Nothing in
         the sources dates any of these three, so nothing here dates them
         either. Unbound they say "this is the company" — which the section
         already says — and claim nothing about any year. There is no
         <figcaption> for the same reason: a caption is where a fact would have
         to be invented.

         Each frame carries one claim the copy makes and cannot show:
           aerial    — the halls, i.e. the megawatts
           crew      — people working between the machine walls
           container — the hardware, crated, under a gantry crane
         Three, not four, because the column is ~490px wide and four frames in
         it were 116x78 each. All three sources are the company's own: the
         aerial is uminers.com/hosting, the container is @uminers_official. -->
    <div class="jw__strip" aria-hidden="true">
      <img src="/assets/img/site-campus-aerial.jpg" alt="" width="950" height="864" loading="lazy" decoding="async">
      <img src="/assets/img/site-crew-rows.jpg" alt="" width="700" height="493" loading="lazy" decoding="async">
      <img src="/assets/img/logistics-container-wrap.jpg" alt="" width="700" height="493" loading="lazy" decoding="async">
    </div>

    <!-- ── the award slot ──────────────────────────────────────────────
         Same construction, shorter travel: --slot-step is a third of the
         copy's --step-y, so the trophy lags the words the way a far object
         lags a near one. It is a depth cue that costs one number. -->
    <div class="jw__slot">
      <div class="jw__slottrack">
        <figure
          v-for="(s, i) in JOURNEY" :key="s.year + s.title"
          class="jw__award" :class="{ 'is-on': i === stage }"
          :style="{ '--i': i }"
          :aria-hidden="i !== stage"
        >
          <div class="jw__awardbox">
            <img v-if="s.award" :src="s.award.img"
                 :alt="s.award.forum + ' — ' + s.award.title"
                 loading="lazy" decoding="async">
          </div>
          <figcaption v-if="s.award">
            <span class="label">{{ s.award.forum }}</span>
            {{ s.award.title }}
          </figcaption>
        </figure>
      </div>
      <!-- the shelf. Always drawn, on every stage, award or not — it is what
           makes an empty slot read as an empty shelf instead of a hole -->
      <span class="jw__shelf" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
/* ── geometry ──────────────────────────────────────────────────────────
   Every number below is the reference's, converted to the viewport it was
   measured on (1440x900) and then expressed as a ratio so it holds at other
   sizes. The dial is the primary: the copy column and the award slot are
   placed off it, not off the wrapper, because the whole layout is one circle
   and what happens to the right of its apex.

     --cx   circle centre x   ref -148.7 = -10.33vw, floored at -160px
     --r    ring radius       ref 400 on an 800 box; ref labels at 433, ours
                              are four digits wide so they hang OFF the ring
                              rather than being centred on a radius of their own
     apex   = --cx + --r      ref 284 -> ours 284 at 1440x900. Identical. */
.jw{
  position: absolute; inset: 0;
  --cx: calc(-1 * min(10.33vw, 160px));
  --r: min(31vw, 48vh);
  --apex: calc(var(--cx) + var(--r));
  --textleft: calc(var(--apex) + 13vw);
  --textw: min(34vw, 34rem);
  --step-y: 13rem;        /* copy travel per stage */
  --slot-step: 5.0rem;    /* award travel per stage — the parallax lag */
  color: var(--foreground);
}


/* ── the arc ─────────────────────────────────────────────────────────── */
.jw__dialclip{
  position: absolute; inset: 0; pointer-events: none;
  -webkit-mask-image: linear-gradient(180deg,
    transparent 0%, #000 13%, #000 84%, transparent 100%);
  mask-image: linear-gradient(180deg,
    transparent 0%, #000 13%, #000 84%, transparent 100%);
}
.jw__ring{
  position: absolute; left: var(--cx); top: 50%;
  width: calc(var(--r) * 2); height: calc(var(--r) * 2);
  margin: calc(var(--r) * -1) 0 0 calc(var(--r) * -1);
  border: 1px solid color-mix(in srgb, var(--foreground) 15%, transparent);
  border-radius: 50%;
}
/* THE only animated transform in this component's left half. Nine spokes are
   static children of it and come along for free — no per-label transition, no
   counter-rotation, nothing to fall out of step with. */
.jw__dial{
  position: absolute; left: var(--cx); top: 50%;
  width: 0; height: 0;
  transform: rotate(var(--rot));
  transition: transform var(--stage-dur) var(--ease-turn);
  will-change: transform;
}
/* a bar of exactly the ring's radius, pinned at the hub. Height 0 so both
   children sit on the ring line whatever their own content height is — the
   previous build let the flex row size itself and every spoke then rotated
   around a slightly different point. */
.jw__spoke{
  position: absolute; left: 0; top: 0;
  width: var(--r); height: 0;
  transform-origin: 0 0;
  transform: rotate(var(--a));
}
/* on the ring, like the reference's — and unlike the reference's, visible when
   idle. Nine pips on the arc with one lit is the whole answer to "what is this
   and how many are there"; the reference can hide them because its progress is
   a scrollbar, and ours has none. */
.jw__dot{
  position: absolute; right: 0; top: 0;
  width: 9px; height: 9px; margin: -5px -5px 0 0;
  border-radius: 50%;
  background: var(--foreground); opacity: .24;
  transform: scale(.42);
  transition: transform var(--dur-l) var(--ease),
              opacity var(--dur-m) var(--ease-flat),
              background-color var(--dur-m) var(--ease-flat);
}
.jw__spoke.is-on .jw__dot{
  background: var(--accent); opacity: 1; transform: scale(1);
}
/* welded to the spoke: no counter-rotation, ever. Upright means active. */
.jw__tag{
  position: absolute; left: 100%; top: 0;
  margin-left: 16px;
  transform: translateY(-50%);
  display: flex; align-items: baseline; gap: 7px;
  white-space: nowrap;
}
.jw__year{
  font-size: var(--headingM); line-height: 1;
  letter-spacing: var(--letterSpacingTight);
  font-weight: var(--weightMid);
  /* opacity, not colour: the reference swings #A4A4A4 to #141414, which is the
     same move, but opacity composites and colour repaints. On the active stop
     this resolves to the full foreground ink. */
  opacity: .26;
  transition: opacity var(--dur-l) var(--ease-flat);
}
.jw__period{
  font-family: var(--fontMono); font-size: 10px; text-transform: uppercase;
  letter-spacing: .06em; font-weight: 400;
  opacity: .2;
  transition: opacity var(--dur-l) var(--ease-flat);
}
.jw__spoke.is-on .jw__year{ opacity: 1 }
.jw__spoke.is-on .jw__period{ opacity: .58 }

/* ── the micro label ─────────────────────────────────────────────────── */
.jw__label{
  /* on the same left rule as the copy, clear of the fixed header (padding +
     the 34px pill = ~62px at the widest) */
  position: absolute; top: 88px; left: var(--textleft);
  color: var(--faded);
}

/* ── the copy ────────────────────────────────────────────────────────── */
.jw__stage{
  position: absolute; top: 50%; left: var(--textleft);
  width: var(--textw);
}
.jw__track{
  position: relative;
  transform: translate3d(0, calc(var(--stage) * var(--step-y) * -1), 0);
  transition: transform var(--stage-dur) var(--ease-turn);
  will-change: transform;
}
.jw__slide{
  position: absolute; left: 0; right: 0;
  top: calc(var(--i) * var(--step-y));
  transform: translateY(-50%);
  display: grid; gap: var(--spacingS);
  opacity: 0;
  /* leaving is short and has no settle — it is gone before the incoming one
     starts, which is what stops the two reading as one doubled block mid-travel */
  transition: opacity var(--stage-out) var(--ease-in);
}
.jw__slide.is-on{
  opacity: 1;
  transition: opacity var(--stage-in) var(--ease) var(--stage-in-delay);
}
.jw__when{ color: var(--faded) }
.jw__title{
  margin: 0; font-size: var(--headingXL); font-weight: var(--weightMid);
  letter-spacing: var(--letterSpacingTight); line-height: var(--lineHeightXS);
  text-wrap: balance;
}
.jw__text{
  margin: var(--spacingXS) 0 0;
  font-size: var(--typeSizeNormal); line-height: var(--lineHeightM);
  letter-spacing: var(--letterSpacingNormal);
  max-width: 40ch; text-wrap: pretty;
  color: color-mix(in srgb, var(--foreground) 82%, transparent);
}

/* ── the belt ────────────────────────────────────────────────────────────
   Subordinate by position, not by degradation: it does not travel, it does not
   fade, and it sits BELOW the mid-line rather than inside the centred group.
   The centred group is the dial apex, the active year and the copy — three
   things on one horizontal rule — and putting a photo block inside it would
   move the copy off that rule to keep the group balanced. So the block hangs,
   and it is held to the copy column's own left rule and width, because to the
   right of that column sits .jw__slot: at 1440 the copy ends at x=1882 and the
   slot starts at x=1873, so there is no horizontal room to take. The size has
   to come out of height instead.

   The height is the whole point of this block. Four frames across a ~490px
   column rendered 116x78 each, and at that size a photograph is a smudge —
   which is what the greyscale and the opacity were really covering for. Both
   are gone. One lead frame spanning both rows plus two stacked beside it puts
   the lead at ~297x270 (8.8x the old area) and the pair at ~185x130 (2.7x),
   and 1.6fr/1fr is the widest the lead can be before the pair stops holding a
   readable subject.

   --jw-strip-h is capped in vh as well as rem so the block cannot run past the
   section floor on a short viewport: at 900px tall the section ends at y=918
   and the block starts at y=580, which is 338px of room for 270px of frames. */
.jw__strip{
  position: absolute; left: var(--textleft);
  top: calc(50% + 7rem);
  width: var(--textw);
  --jw-strip-h: min(19rem, 30vh);
  height: var(--jw-strip-h);
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--grid-gap);
}
.jw__strip img{
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: var(--radiusS);
}
/* the lead frame: crops to roughly 1.10:1, which is the ratio the file was cut
   to, so object-fit has almost nothing to throw away */
.jw__strip img:first-child{ grid-row: 1 / span 2 }
/* the crew stand across the full width of their frame and the horizon of the
   aerial sits high in its own — centre both and the crop takes the ground */
.jw__strip img:nth-child(2){ object-position: 50% 42% }
.jw__strip img:nth-child(3){ object-position: 50% 45% }

/* ── the award slot ──────────────────────────────────────────────────── */
/* Measured against orionix's own hero (1440x900, ref2-hero.png): the 3D object
   there spans the full width and y 170-745 — 64% of the frame height — and the
   72px headline is set INSIDE it, not beside it. The vitrine here was 380x580
   (64% of the height but only 26% of the width) and read as a thumbnail parked
   in the corner. 460x660 is 73% of the frame height and it is what the section
   is actually about: an object, at object scale, with the bull standing behind
   it. right: 2vw rather than 3vw pushes it to the same bleed the reference's
   object has. */
.jw__slot{
  position: absolute; top: 50%; right: 2vw;
  width: min(34vw, 460px); height: min(74vh, 660px);
  transform: translateY(-50%);
}
.jw__slottrack{
  position: absolute; inset: 0;
  transform: translate3d(0, calc(var(--stage) * var(--slot-step) * -1), 0);
  transition: transform var(--stage-dur) var(--ease-turn);
  will-change: transform;
}
.jw__award{
  position: absolute; left: 0; right: 0;
  top: calc(var(--i) * var(--slot-step));
  height: 100%;
  margin: 0;
  display: grid; grid-template-rows: 1fr auto; gap: var(--spacingM);
  justify-items: center;
  opacity: 0;
  transition: opacity var(--stage-out) var(--ease-in);
}
.jw__award.is-on{
  opacity: 1;
  transition: opacity var(--stage-in) var(--ease) var(--stage-in-delay);
}
.jw__awardbox{
  min-height: 0; width: 100%;
  display: flex; align-items: flex-end; justify-content: center;
}
/* No filter, no plate, no backdrop. The contrast under the engraving is the
   venom bull, re-aimed onto this slot in deck.js and multiplied under it — see
   the note at the head of this file. The image is shipped as it was shot.
   Size does the rest: the slot is 460x660 at 1440x900, which is 73% of the
   frame height, so "MINING DISTRIBUTOR OF THE YEAR" is a line of type rather
   than a texture. */
.jw__awardbox img{
  max-width: 100%; max-height: 100%;
  width: auto; height: auto; object-fit: contain;
}
.jw__award figcaption{
  display: grid; gap: 3px; text-align: center;
  font-size: var(--typeSizeSmall); line-height: 1.35;
  color: color-mix(in srgb, var(--foreground) 78%, transparent);
  padding-bottom: var(--spacingM);
  text-wrap: pretty;
}
.jw__award figcaption .label{ color: var(--faded) }
/* the shelf. Drawn on every stage, award or not — it is the one thing that
   makes an empty slot read as an empty shelf rather than as a failed image,
   and it is why nothing in the layout moves between a stop that has a trophy
   and a stop that does not. */
.jw__shelf{
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 1px; background: var(--hairline);
}

/* ── mid desktop ─────────────────────────────────────────────────────────
   The vitrine grew to 34vw / 460px for the frame it was measured in (1440 and
   up). Between 1100 and 1279 the copy column's own right edge — var(--textleft)
   + var(--textw), i.e. 744px at 1100 — is already past where a 34vw slot would
   start, so the two boxes overlap and the last photograph of the belt ends up
   under the trophy. Below 1280 the slot keeps its previous size; there is no
   room for the reference's proportion there and pretending otherwise costs a
   collision. */
@media (min-width: 1100px) and (max-width: 1279px){
  .jw__slot{ right: 3vw; width: min(28vw, 380px); height: min(66vh, 580px) }
}

/* ── narrow ──────────────────────────────────────────────────────────── */
/* Below this the dial has no room to be a dial — a ring whose visible chord is
   narrower than one label is a decoration, not a control. It switches off and
   the section goes back to what it is underneath: a label, one stop, a belt
   and a trophy, in that order, down one column. */
@media (max-width: 1099px){
  .jw{
    position: relative; inset: auto;
    display: grid; gap: var(--spacingL); justify-items: start;
  }
  .jw__dialclip{ display: none }
  .jw__label{ position: static; color: var(--faded) }
  /* `top`, `left` and `right` are not undone by switching to static/relative —
     a relative box still honours them and shifts by that much, which is how
     the slot ended up 27px left of its own column and 300px down the page.
     Every offset the desktop rules set has to be explicitly cleared. */
  .jw__stage{
    position: static; top: auto; left: auto;
    width: 100%; max-width: 34rem;
  }
  .jw__track{ transform: none; will-change: auto }
  .jw__slide{ position: static; top: auto; transform: none; display: none }
  .jw__slide.is-on{ display: grid }
  .jw__strip{
    position: static; top: auto; left: auto;
    width: 100%; max-width: 34rem;
    /* the column is the viewport now, so the frames can be taller than they are
       on desktop without running into anything. Equal columns here rather than
       1.6fr/1fr: the narrow column is only ~146px at 420 and at that width the
       pair crops the outermost figure out of the crew frame. */
    height: min(20rem, 40vh);
    grid-template-columns: 1fr 1fr;
  }
  .jw__slot{
    position: relative; top: auto; right: auto; transform: none;
    width: 100%; max-width: 34rem; height: 26vh; min-height: 11rem;
  }
  .jw__slottrack{ position: static; transform: none; height: 100%; will-change: auto }
  .jw__award{ position: static; height: 100%; display: none }
  .jw__award.is-on{ display: grid }
  .jw__award figcaption{ padding-bottom: 0 }
}

/* ── reduced motion ──────────────────────────────────────────────────── */
/* system.css §27 already zeroes every duration. All that is left to say here
   is that will-change should stop reserving layers nobody is going to move. */
@media (prefers-reduced-motion: reduce){
  .jw__dial, .jw__track, .jw__slottrack{ will-change: auto }
}
</style>
