<script setup>
/**
 * The site, as a deck of single screens.
 *
 * Every section is mounted at once and laid on top of the others; only the
 * current one is visible and interactive. Moving between them moves the
 * screens, not the substance: venom holds one figure — the bull — at one
 * sampling window for the whole deck, so the thing behind the type is a
 * constant and the change is carried entirely by the screen that arrives.
 * Company is the single exception, and it is the same bull re-aimed to stand
 * behind the award slot rather than a different mark.
 */
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SECTIONS, deck, go, bindDeckInput, onSection, nextSection, openDeck } from '@/lib/deck'
import { venomMark, venomLayout, venomVisible, MARKS } from '@/lib/venomBus'
import { setVenomHandler } from '@/lib/scrollDirector'
import { PRODUCTS } from '@/data/products'
import DeckMenu from '@/components/DeckMenu.vue'
import IntroGate from '@/components/IntroGate.vue'
import SplitText from '@/components/SplitText.vue'
import MicroLabel from '@/components/MicroLabel.vue'
import LeadForm from '@/components/LeadForm.vue'
import JourneyWheel from '@/components/JourneyWheel.vue'
import PhotoBelt from '@/components/PhotoBelt.vue'

const root = ref(null)
let unbind = null
let offSection = null
let stopOpenWatch = null

/* the three tiles on the AI screen are the catalogue's own entries, so the
   trigger and the thing it opens are never out of step */
const teasers = computed(() =>
  ['nvidia-gb200-nvl72', 'nvidia-h200', 'asus-esc8000a-e12']
    .map(slug => PRODUCTS.find(p => p.slug === slug))
    .filter(Boolean)
    .slice(0, 3)
)

function applySection(s) {
  document.documentElement.dataset.theme = s.theme
  venomVisible(true)
  /* One figure, one window, on every section — see FIGURE in deck.js. The
     ease in venom.js still runs, it simply has nothing to travel between the
     four sections that share the number; company alone re-aims, and it re-aims
     the SAME bull rather than morphing into another mark. */
  venomLayout({ ...s.venom, settleOverride: 0.85 })
  venomMark(MARKS[s.mark])
}

/* The opening screen used to cycle the substance through four marks — bull,
   a card, a container, a portrait — on a 6.4s dwell. It is gone (owner's
   decision, 24 Aug 2026): the substance holds the bull, on every screen, for
   the whole deck. A slideshow behind a headline is a second thing asking to be
   read first, and the mark change was the only reason venom's settle had to be
   pinned and released on a timer at all. settleOverride is now one constant
   (0.85) applied on every section, so the substance is resolved wherever the
   visitor is. */

onMounted(() => {
  // the deck, not the director, decides whether the substance shows
  setVenomHandler(null)
  unbind = bindDeckInput(root.value)
  offSection = onSection(applySection)
  venomVisible(true)
  // arriving from the catalogue: open straight on the named screen
  const wanted = SECTIONS.findIndex(x => x.key === useRoute().query.s)
  if (wanted > 0) { openDeck(); go(wanted, 1) }
  else {
    document.documentElement.dataset.theme = SECTIONS[0].theme
    /* Nothing is applied at mount. venom's own formation is condensing the bull
       out of dispersed substance behind the gate; re-aiming it now would fight
       a formation nobody has seen finish. The layout lands the moment the gate
       lifts, and since intro carries FIGURE — the same window every other
       section carries — that landing is a one-off, not a transition. */
    stopOpenWatch = watch(() => deck.ready, (v) => { if (v) applySection(SECTIONS[0]) })
  }
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  unbind?.(); offSection?.(); stopOpenWatch?.()
  document.body.style.overflow = ''
})

/* Belts are hand-picked, not automatic: each frame has to prove something the
   screen is claiming, and the shots that carry other companies' branding are
   deliberately absent. */
const BELTS = {
  /* company's belt was four photos along the foot of the screen — removed
     when JourneyWheel grew to its current scale (see the company section
     markup below): a 576px ring plus a wheeled title/text column plus a
     20vh photo strip does not fit one fixed-viewport screen together, and
     between the two the wheel is what was actually asked for. The photos
     themselves (team-expo.jpg, company-frame-27-lg.webp,
     company-dsc01998.webp, team-crew.jpg) are unused now, not deleted —
     they may belong somewhere else in the deck rather than being lost. */
  sites: [
    { src: '/assets/img/site-aerial-dusk.jpg', alt: 'Uminers site at dusk', caption: 'Site 01 · running' },
    { src: '/assets/img/site-aerial-top.jpg', alt: 'Uminers site from above', caption: 'Room to grow' },
    { src: '/assets/img/ops-warehouse.jpg', alt: 'Machines staged in the warehouse', caption: 'Staged for shipping' }
  ]
}

/* -1 gone left, 0 here, 1 waiting on the right */
const place = (i) => (i === deck.index ? 0 : i < deck.index ? -1 : 1)
</script>

<template>
  <IntroGate />
  <DeckMenu />

  <div ref="root" class="deck" :class="{ 'is-open': deck.ready }">
    <section
      v-for="(s, i) in SECTIONS"
      :key="s.key"
      class="screen"
      :class="{ 'has-belt': BELTS[s.key] }"
      :data-place="place(i)"
      :aria-hidden="i !== deck.index ? 'true' : undefined"
      :inert="i !== deck.index ? true : undefined"
    >
      <!-- ═══ intro ═══════════════════════════════════════════════════ -->
      <div v-if="s.key === 'intro'" class="screen__body screen__body--centre">
        <MicroLabel text="Uminers · since 2018" block />
        <SplitText tag="h1" class="type-xxl" :active="i === deck.index">
          <span class="line">Every model you have ever used</span>
          <span class="line">runs in a room someone built.</span>
        </SplitText>
        <p class="body intro__lede">
          Uminers builds the room. Power contracted at the source, machines
          landed, halls kept cold.
        </p>

        <!-- not a button: a line that fills as you approach it, so the first
             move on the page is an invitation rather than a form control -->
        <button class="enter" @click="nextSection">
          <span class="enter__text">See where it runs</span>
          <span class="enter__rule" aria-hidden="true" />
        </button>
      </div>

      <!-- ═══ company ═════════════════════════════════════════════════ -->
      <!-- This section is `stages`-driven (see deck.js): the swipe or wheel
           gesture that would normally move the deck to the next section
           instead turns the wheel to the next stop, and only spills over into
           the next section once JourneyWheel's last stop is showing. There is
           no static headline here on purpose — the per-stop title IS the
           headline, wheeled rather than stated once. Carries
           `screen__body--journey` (54rem, wider than the house default —
           JourneyWheel's own ring grew past what 46rem could hold) and no
           photo belt: at this scale the wheel and a four-photo strip do not
           both fit one fixed viewport, and the wheel is what was asked for. -->
      <div v-else-if="s.key === 'company'" class="screen__body screen__body--journey">
        <JourneyWheel :stage="deck.stage" :active="i === deck.index" :jump="deck.jump" />
      </div>


      <!-- ═══ AI compute — the catalogue triggers live here ════════════ -->
      <div v-else-if="s.key === 'ai'" class="screen__body screen__body--wide">
        <MicroLabel text="AI compute" block />
        <SplitText tag="h2" class="type-xl" :active="i === deck.index">The halls are AI-ready.</SplitText>
        <p class="body">
          <strong>The sourcing desk is open.</strong>
          Accelerators, platforms and the power to run them are quoted as one line,
          from the same desk that has been shipping machines since 2018.
        </p>

        <div class="teasers">
          <button
            v-for="p in teasers"
            :key="p.slug"
            class="teaser"
            @click="go(SECTIONS.findIndex(x => x.key === 'catalogue'))"
          >
            <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy">
            <span class="label teaser__brand">{{ p.brand }}</span>
            <span class="teaser__name">{{ p.name }}</span>
            <span class="label teaser__line">{{ p.card?.[0] }}</span>
          </button>
        </div>
      </div>

      <!-- ═══ sites ═══════════════════════════════════════════════════ -->
      <div v-else-if="s.key === 'sites'" class="screen__body">
        <MicroLabel text="Find, contract, connect" block />
        <SplitText tag="h2" class="type-xl" :active="i === deck.index">Compute is limited by power, not by chips.</SplitText>
        <p class="body">
          <strong>Uminers starts where the electricity is.</strong>
          It contracts generation at the source and turns raw megawatts into capacity
          someone can book. Ordering accelerators is the easy part. Having somewhere to
          run them is the work.
        </p>
        <dl class="figures">
          <div><dt class="figures__n">90</dt><dd class="label">Days to a built container</dd></div>
          <div><dt class="figures__n">40 ft</dt><dd class="label">Standard hall module</dd></div>
          <div><dt class="figures__n">24/7</dt><dd class="label">Crew on site</dd></div>
        </dl>
      </div>


      <!-- ═══ sourcing desk ═══════════════════════════════════════════ -->
      <div v-else class="screen__body">
        <MicroLabel text="Start here" block />
        <SplitText tag="h2" class="type-xl" :active="i === deck.index">Tell Uminers where the power is.</SplitText>
        <p class="body">
          A first answer on siting, capacity and schedule comes back inside a week.
        </p>
        <LeadForm />
      </div>


      <!-- media sits outside the v-if chain above: a branch inserted into it
           re-parents every v-else-if that follows and two screens render at
           once -->
      <PhotoBelt
        v-if="BELTS[s.key]"
        class="screen__belt"
        :items="BELTS[s.key]"
        :open="i === deck.index"
      />
    </section>

    <!-- The deck's only fixed furniture. The opening screen holds no dot — it
         is the cover, not a stop to navigate back to — so the rail counts the
         four screens after it. -->
    <div class="deck__rail" :class="{ 'is-open': deck.ready && deck.index > 0 }">
      <button
        v-for="(s, i) in SECTIONS.slice(1)" :key="s.key"
        class="deck__dot" :class="{ 'is-current': i + 1 === deck.index }"
        :aria-label="s.label" @click="go(i + 1)"
      />
    </div>
    <p class="label deck__hint" :class="{ 'is-open': deck.ready }">Swipe to explore</p>
  </div>
</template>

<style scoped>
.deck{
  position: fixed; inset: 0;
  overflow: hidden;
  color: var(--foreground);
  transition: color .8s ease;
  touch-action: pan-y;
  /* no background: html carries the theme colour, and the substance sits
     between the two at z-index -1 */
}

.screen{
  position: absolute; inset: 0;
  display: grid; align-content: center;
  padding: calc(var(--spacingXXL) * 2.4) var(--spacingXL) var(--spacingXXL);
  opacity: 0;
  /* a whole-screen slide: the outgoing screen leaves the way the incoming one
     arrives, and only the content moves — the paper underneath never does */
  transform: translate3d(calc(var(--place, 1) * 64%), 0, 0);
  /* leaving is quick and linear-ish, arriving is slow and eases hard at the
     end — the asymmetry is what makes a change feel like travel rather than a
     toggle. Between the two the screen is empty and the substance has it. */
  transition: opacity .34s ease-in,
              transform .70s cubic-bezier(.4,0,1,1),
              visibility 0s linear .70s;
  visibility: hidden;
  pointer-events: none;
}
.screen[data-place="-1"]{ --place: -1 }
.screen[data-place="1"]{ --place: 1 }
.deck:not(.is-open) .screen{ opacity: 0 }

.screen[data-place="0"]{
  --place: 0;
  opacity: 1; visibility: visible; pointer-events: auto;
  transition: opacity .5s ease-out .55s,
              transform 1.2s cubic-bezier(0,0,0,1) .45s,
              visibility 0s linear 0s;
}

/* content settles line by line behind the slide, so the screen does not land
   as one flat card */
.screen__body > *,
.board__cover > *{
  opacity: 0;
  transform: translate3d(0, 18px, 0);
  transition: opacity .6s cubic-bezier(.2,.7,.2,1),
              transform .8s cubic-bezier(.16,.84,.24,1);
}
.screen[data-place="0"] .screen__body > *,
.screen[data-place="0"] .board__cover > *{
  opacity: 1;
  transform: none;
}
.screen[data-place="0"] .screen__body > :nth-child(1){ transition-delay: .92s }
.screen[data-place="0"] .screen__body > :nth-child(2){ transition-delay: 1.00s }
.screen[data-place="0"] .screen__body > :nth-child(3){ transition-delay: 1.08s }
.screen[data-place="0"] .screen__body > :nth-child(4){ transition-delay: 1.16s }
.screen[data-place="0"] .screen__body > :nth-child(5){ transition-delay: 1.24s }

.screen__body{
  width: min(100%, 46rem);
  margin-inline: 0;
  padding-left: max(var(--spacingXL), calc((100vw - var(--wrapper)) / 2));
  display: grid; gap: var(--spacingL); justify-items: start;
}
.screen__body--wide{ width: min(100%, 58rem) }
/* JourneyWheel's own reserved band grew to 27rem for its larger ring — needs
   more than the house 46rem to also leave the text column room to breathe,
   without reaching as far as the wider 58rem variant does (that would start
   overlapping the venom mark's own footprint on this specific screen). */
/* Two separate bugs stacked here, and both had to be found by measuring the
   real rendered box, not by reasoning about the CSS in the abstract.
   First: screen__body's own rule declares no grid-template-columns, so its
   one implicit column sizes to `auto` — the min/max-content of its children,
   not the container. A percentage width on a grid item (JourneyWheel's
   `.wheel{width:100%}`) cannot inform that auto-track's size per spec; the
   browser resolves the circular reference by shrinking the track toward the
   children's own min-content instead. A definite single-column track fixes
   that, for this section only.
   Second, and the one that survived the first fix: screen__body's
   padding-left is `max(spacingXL, (100vw - wrapper)/2)` — a formula built to
   centre a narrow reading column, which grows LARGER as the viewport widens
   past 1320px. On this component's actual 1920px monitor that resolves to
   300px of left padding alone, eating more than half of the 54rem budget
   from the inside — 864px requested, 564px left over once box-sizing:
   border-box (the site's global reset) subtracts that padding back out. The
   number changes at every viewport width, which is exactly wrong for a
   section built around a fixed-radius ring and a fixed-width glass card: it
   needs a stable content budget, not one that shrinks as the window grows.
   Overriding padding-left to the plain floor removes the centring term this
   section was never trying to use in the first place. */
.screen__body--journey{
  /* Full bleed, and it is the only body on the deck that is. This section is
     not a reading column with a graphic next to it — it is one circle whose
     centre is off the left edge of the VIEWPORT, a copy column placed off that
     circle's apex, and a vitrine bled off the right edge. All three are stated
     in viewport units inside JourneyWheel, so the wrapper's centring padding
     (which grows past 1320px and was eating half the budget here) has nothing
     to do any more. The entry stagger still applies: the wheel is this body's
     one child, so it arrives on the `:nth-child(1)` delay like every other
     section's first line. */
  position: absolute; inset: 0;
  width: auto; padding: 0;
  display: block;
}

/* Under 1100 the dial is switched off inside JourneyWheel and the section goes
   back to being a reading column, so the body has to go back to being one too —
   full-bleed absolute positioning has nothing left to position. */
@media (max-width: 1099px){
  .screen__body--journey{
    position: static; inset: auto;
    width: min(100%, 46rem);
    padding-left: max(var(--spacingXL), calc((100vw - var(--wrapper)) / 2));
    display: grid;
  }
}

/* the opening line stands in the middle of the substance, not next to it */
.screen__body--centre{
  width: min(100%, 62rem);
  margin-inline: auto; padding-left: 0;
  justify-items: center; text-align: center;
  gap: var(--spacingM);
}
.intro__lede{ max-width: 38ch }

.enter{
  appearance: none; background: none; border: 0; padding: 0;
  cursor: pointer; color: inherit;
  display: grid; gap: 6px; justify-items: center;
  margin-top: var(--spacingS);
}
.enter__text{
  font-family: var(--fontMono); font-size: var(--typeSizeSmall);
  text-transform: uppercase; letter-spacing: .04em;
  transition: color .35s ease;
}
.enter__rule{
  display: block; width: 132px; height: 1px;
  background: var(--hairline); position: relative; overflow: hidden;
}
.enter__rule::after{
  content: ""; position: absolute; inset: 0;
  background: var(--foreground);
  transform: scaleX(0); transform-origin: 0 50%;
  transition: transform .55s cubic-bezier(.16,.84,.24,1);
}
.enter:hover .enter__rule::after,
.enter:focus-visible .enter__rule::after{ transform: scaleX(1) }
.enter:focus-visible{ outline: 2px solid var(--accent); outline-offset: 6px }
.screen__body :deep(.line){ display: block }

.figures{
  display: grid; grid-auto-flow: column; grid-auto-columns: max-content;
  gap: var(--spacingXXL);
  margin: var(--spacingS) 0 0;
}
.figures div{ display: grid; gap: var(--spacingXS); align-content: start }
.figures dd{ line-height: var(--lineHeightM) }
.figures__n{
  font-size: var(--headingXXL); font-weight: var(--weightMid);
  letter-spacing: var(--letterSpacingTight); line-height: var(--lineHeightXS);
  margin-bottom: 2px;
}
.figures dd{ margin: 0; color: var(--faded) }

.teasers{
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--grid-gap); width: 100%; margin-top: var(--spacingS);
}
.teaser{
  appearance: none; text-align: left; cursor: pointer;
  background: var(--elevated); border: 1px solid var(--hairline);
  border-radius: var(--radiusM);
  padding: var(--spacingM);
  display: grid; gap: var(--spacingXS);
  color: inherit;
  transition: transform .4s cubic-bezier(.2,.7,.2,1), border-color .4s ease;
}
.teaser:hover{ transform: translateY(-3px); border-color: var(--foreground) }
.teaser img{
  width: 100%; height: 108px; object-fit: contain;
  margin-bottom: var(--spacingS);
}
.teaser__brand{ color: var(--faded) }
.teaser__name{ font-weight: var(--weightMid); letter-spacing: var(--letterSpacingNormal) }
.teaser__line{ color: var(--faded) }

/* ── photography ──
   One belt per screen, along the foot of the window. Single plates parked in
   the corner were competing with the substance for the same right-hand lane;
   a belt owns the bottom edge instead and leaves that lane alone. */
.deck__rail{
  position: fixed; left: var(--spacingL); top: 50%;
  transform: translateY(-50%);
  display: grid; gap: var(--spacingS);
  opacity: 0; transition: opacity .7s ease .3s;
}
.deck__rail.is-open{ opacity: 1 }
.deck__dot{
  appearance: none; border: 0; padding: 0; cursor: pointer;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--foreground); opacity: .28;
  transition: opacity .4s ease, transform .4s ease;
}
.deck__dot.is-current{ opacity: 1; transform: scale(1.5) }

.deck__hint{
  position: fixed; right: var(--spacingL); bottom: var(--spacingL);
  color: var(--faded); margin: 0;
  opacity: 0; transition: opacity .7s ease .4s;
}
.deck__hint.is-open{ opacity: 1 }

@media (max-width: 860px){
  .screen{ padding: calc(var(--spacingXXL) * 2) var(--spacingM) var(--spacingXXL) }
  .screen__body{ padding-left: 0 }
  .teasers{ grid-template-columns: 1fr }
  .deck__rail{ display: none }
}
</style>
