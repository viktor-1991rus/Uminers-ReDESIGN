/**
 * DECK — the site as one screen.
 * ─────────────────────────────────────────────────────────────────────────
 * The page never scrolls. Sections are held side by side and one of them is
 * on screen at a time; wheel, drag, arrow keys and the menu all resolve to
 * the same thing — go(index). Direction is kept so the outgoing section
 * leaves the way the incoming one arrives.
 *
 * Every input is rate-limited by one lock rather than by each handler, so a
 * trackpad flick that fires forty wheel events still advances one section.
 */
import { reactive, readonly } from 'vue'
import { JOURNEY } from '@/data/journey'

const JOURNEY_STAGES = JOURNEY.length

/* ── one figure, and it stands in a different place on every screen ──
   The mark never changes: it is the bull on all five sections, and the product
   marks and the particle hall are gone. What changes is the frame it is drawn
   in — `fit` is the half-width of the sampling window in uv, so it reads
   inverted (a bigger fit is a WIDER window and a SMALLER figure on screen), and
   offsetX/offsetY are in that same uv space, where a positive offsetX moves the
   figure LEFT.

   The screen position of the figure's centre follows from those two:
     sx = 0.5 - offsetX / (2 · aspect · fit)
   so at 16:9 (aspect 1.6) a -0.26 at fit 0.58 parks it at 64% of the viewport
   width and a -0.465 at fit 0.44 parks it at 83%. Every offsetX below is that
   formula solved for the position the layout needs, not a number found by eye.

   Since 24 Aug 2026 these differences are not travelled: venom's per-frame ease
   is taken over by the morph clock, and the figure comes apart into grains on
   the old frame and gathers onto the new one — see setGeometry() and the
   geometry block in frame(), venom.js. So a section is free to put the mark
   where its own composition needs it; the change is a change, not a slide. */
/* aim(sx, fit, oy, opacity) — say WHERE on the screen the figure stands and how
   big it is, and let the offset follow. sx is the horizontal position of the
   figure's own centre as a fraction of the viewport; 1.6 is the reference
   aspect (1440x900), which is what the uv space is scaled by. Written this way
   because offsetX and fit are not independent — change the size and the mark
   walks sideways unless the offset is re-derived, which is exactly how the
   previous set of numbers drifted apart from the layout they were tuned to. */
const aim = (sx, fit, oy, opacity = 0.60) =>
  ({ fit, offsetX: -(sx - 0.5) * 2 * 1.6 * fit, offsetY: oy, opacity })

/* ── one fixed state ──
   Owner's call, 24 Aug 2026: the bull no longer re-aims between sections. It
   used to walk (centre on intro, out to 83% and larger on Company, then a
   0.58->0.545->0.61 breathing pattern on ai/sites/desk) — four different
   frames of the same figure, each a real re-aim with its own scatter/gather.
   That machinery is what the owner is rejecting here, not just the Company
   extreme: "мне не нравятся как сделаны переходы". One frame now, right of
   centre (sx 0.62, roughly the ai/sites/desk family's own resting point) —
   ONE_STATE below, used by every section including Company.

   This reopens the problem the old per-section re-aim solved: the award
   assets on Company are glass on black with white engraving, and at this fit
   the bull's dense mass does not reach .jw__slot's position (right: 2vw,
   ~93% of the viewport). Measured (24 Aug 2026, live Chrome): moving the SLOT
   instead of the figure cannot close the gap either — the paper right of the
   copy column and strip carries only ~9% of the viewport in free dark ground,
   the trophy needs ~32%, and the best fit without colliding the copy column
   tops out at 1.71:1 contrast at 13% of the trophy's own size, nowhere near
   the 3:1 the engraving would need. The substance there is also sparse
   pixelField grain at this opacity/fit, not a solid mass — the letters do not
   resolve even at full opacity.

   So the engraving is left as photographed, unread on its own, same as any
   photograph of a physical object catches a highlight — and the words it
   carries are already set in ink in .jw__award figcaption directly under it,
   which is where the requirement was always actually being met (see the
   contrast-sampling note that used to live here, before the re-aim it
   justified was removed). Nothing to fix: this is accepted, not pending. */
const ONE_STATE = aim(0.62, 0.56, -0.06)

export const SECTIONS = [
  { key: 'intro',     label: 'Uminers',   theme: 'light', mark: 'bull',
    venom: ONE_STATE },
  /* `stages` turns one gesture inside the section into one stop on the dial;
     only a gesture past the last stop moves the deck (see step() below). The
     count is read from the data file so the two cannot drift apart — see
     src/data/journey.js. */
  { key: 'company',   label: 'Company',   theme: 'light', mark: 'bull',
    stages: JOURNEY_STAGES,
    venom: ONE_STATE },
  { key: 'ai',        label: 'AI compute', theme: 'white', mark: 'bull',
    venom: ONE_STATE },
  { key: 'sites',     label: 'Sites',     theme: 'light', mark: 'bull',
    venom: ONE_STATE },
  { key: 'desk',      label: 'Sourcing desk', theme: 'light', mark: 'bull',
    venom: ONE_STATE }
]

const LOCK_MS = 1750         // one section per gesture, and the change is a
                             // three-phase event: leave, hold on the substance, arrive
/* A stage is not a section. Nothing leaves and nothing arrives — the dial turns
   one spoke and one title is exchanged for another — so the gate is the length
   of that turn, not of the three-phase section change. */
const STAGE_LOCK_MS = 900
const WHEEL_TRIGGER = 40     // ignore the tail of a trackpad glide
const DRAG_TRIGGER = 70      // px before a drag counts as a swipe

const state = reactive({
  index: 0,
  stage: 0,        // position inside a staged section; 0 for every other one
  dir: 1,          // +1 arriving from the right, -1 from the left
  locked: false,
  ready: false,    // the intro gate has handed the screen over
  /* Bumped whenever the stage changed because the SECTION changed rather than
     because the dial was turned. Measured on the step ai → company (arrow left,
     24 Aug 2026): entering a staged section backwards lands it on stage 8, and
     the wheel read that as a turn — 240deg of ring and 1664px of copy column in
     one 820ms transition, peaking at 4980 px/s between 100 and 300ms, on top of
     a section that was still arriving. Nine stacked slides smearing past at
     five thousand pixels a second is not a dial turning; it is the reason this
     section was reported as hanging. A section change is an ARRIVAL — the
     screen was not on the page a frame ago — so the dial simply arrives already
     on its stop. Consumers watch this counter and suppress their own transition
     for that one update; see JourneyWheel.vue. */
  jump: 0
})

export const deck = readonly(state)
export const current = () => SECTIONS[state.index]
const stagesOf = (i) => SECTIONS[i]?.stages ?? 1

const listeners = new Set()
const stageListeners = new Set()
export function onSection(fn) { listeners.add(fn); return () => listeners.delete(fn) }
export function onStage(fn) { stageListeners.add(fn); return () => stageListeners.delete(fn) }

function lock(ms) {
  state.locked = true
  setTimeout(() => { state.locked = false }, ms)
}

export function go(next, dir) {
  if (state.locked || !state.ready) return
  const target = Math.max(0, Math.min(SECTIONS.length - 1, next))
  if (target === state.index) return
  state.dir = dir ?? (target > state.index ? 1 : -1)
  state.index = target
  // entering a staged section backwards lands on its last stage, so reversing
  // into it walks back down the dial instead of jumping to its first stop
  state.stage = state.dir < 0 ? stagesOf(target) - 1 : 0
  state.jump++
  lock(LOCK_MS)
  for (const fn of listeners) fn(SECTIONS[target], state.dir)
  for (const fn of stageListeners) fn(SECTIONS[target], state.stage, state.dir)
}

/* One gesture, one step. Inside a staged section the step is a stage; at either
   end of it the same gesture spills over into the next section. */
function step(d) {
  if (state.locked || !state.ready) return
  const n = stagesOf(state.index)
  const nextStage = state.stage + d
  if (n > 1 && nextStage >= 0 && nextStage < n) {
    state.stage = nextStage
    state.dir = d
    lock(STAGE_LOCK_MS)
    for (const fn of stageListeners) fn(SECTIONS[state.index], nextStage, d)
    return
  }
  go(state.index + d, d)
}

export const nextSection = () => step(1)
export const prevSection = () => step(-1)
export function openDeck() { state.ready = true }

/* ── input ──
   Wheel: a horizontal deck still has to answer a vertical trackpad, since
   that is what a hand does first. Whichever axis is larger wins.
   Drag: pointer events cover mouse and touch at once. */
export function bindDeckInput(el) {
  const onWheel = (e) => {
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
    const d = horizontal ? e.deltaX : e.deltaY

    /* A section may hold its own scroller — the catalogue grid does. Vertical
       wheel belongs to it until it hits its own end, otherwise the deck would
       swallow the gesture that was meant to read the list. */
    const scroller = e.target.closest?.('[data-deck-scroll]')
    if (scroller && !horizontal) {
      const atTop = scroller.scrollTop <= 0
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1
      if (!((d > 0 && atEnd) || (d < 0 && atTop))) return
    }

    if (Math.abs(d) < WHEEL_TRIGGER) return
    e.preventDefault()
    d > 0 ? nextSection() : prevSection()
  }

  let downX = null, downY = null
  const onDown = (e) => { if (e.button === 0 || e.pointerType !== 'mouse') { downX = e.clientX; downY = e.clientY } }
  const onUp = (e) => {
    if (downX == null) return
    const dx = e.clientX - downX, dy = e.clientY - downY
    downX = null
    if (Math.abs(dx) < DRAG_TRIGGER || Math.abs(dx) < Math.abs(dy)) return
    dx < 0 ? nextSection() : prevSection()
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') nextSection()
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSection()
    else if (e.key === 'Home') go(0, -1)
    else if (e.key === 'End') go(SECTIONS.length - 1, 1)
  }

  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('pointerdown', onDown, { passive: true })
  el.addEventListener('pointerup', onUp, { passive: true })
  addEventListener('keydown', onKey)

  return () => {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointerup', onUp)
    removeEventListener('keydown', onKey)
  }
}
