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

export const SECTIONS = [
  /* Centred, because the copy is: .screen__body--centre puts the opening line
     on the vertical axis of the frame, and a figure standing at 64% behind a
     centred column reads as the column being off its own axis. At offsetX 0 the
     bull's own axis and the type's are the same line and the line runs down its
     chest, where the mass is continuous. */
  { key: 'intro',     label: 'Uminers',   theme: 'light', mark: 'bull',
    venom: aim(0.50, 0.58, -0.06) },
  /* `stages` turns one gesture inside the section into one stop on the dial;
     only a gesture past the last stop moves the deck (see step() below). The
     count is read from the data file so the two cannot drift apart — see
     src/data/journey.js. */
  { key: 'company',   label: 'Company',   theme: 'light', mark: 'bull',
    stages: JOURNEY_STAGES,
    /* The bull, larger and re-aimed right — a different frame of the same
       figure, not another mark. Here it is the GROUND the trophies stand on:
       the award assets are glass rendered on black with white engraving, so on
       the paper (#F2F0EA) the engraving lands on the paper value exactly and
       disappears. Rather than treat the asset (an earlier build inverted it,
       which the owner rejected), the substance moves under it.

       fit 0.42 against the deck's 0.58 is roughly a third more figure — up
       from 0.46 on the owner's note of 24 Aug 2026 that it should be bigger —
       and offsetX -0.4435 is that fit put back through
       -(0.83 - 0.5) x 2 x aspect x fit at 16:9, so the mark's centre stays on
       83% of the viewport width, the centre of .jw__slot (right: 2vw,
       width min(34vw, 460px)) in JourneyWheel.vue. offsetY -0.04, i.e.
       slightly DOWN (positive is up in this space): it drops the muzzle under
       the trophy's waist and leaves the horns rising either side of it, so the
       mark frames the object instead of standing behind its top third where
       the glass is clear and there is nothing to hold.

       Measured, not eyed. Sampling the engraved caption band on the 2022
       trophy (175x46 px at 1440x900, x 1089 y 473 — 29-69% across and
       59.8-67.6% down the asset's own box), glyph = the 94th percentile of
       linear luminance, ground = the 27th:

         fit 0.50 / oy -0.06     3.21:1
         fit 0.46 / oy -0.06     3.38:1   <- what this was
         fit 0.44 / oy -0.06     3.11:1
         fit 0.42 / oy -0.06     3.39:1
         fit 0.42 / oy -0.04     3.4:1    <- this, and a third more figure
         fit 0.42 / oy -0.14     3.19:1
         fit 0.40 / oy -0.06     3.40:1

       So the enlargement is free: within the noise of a dot field, 0.42 prints
       the same ground under the engraving that 0.46 did. It is not 4.5:1 and
       that is not claimed. The engraving is a photographed surface, not the
       section's text — the same words are set in ink in the figcaption
       directly under it, which is where the requirement is actually met. If
       the engraving itself has to clear 4.5:1, no value of these four numbers
       will do it: the substance is a dot field at roughly a third coverage and
       the trophy's own body is translucent, so it lightens whatever it stands
       on. That needs a solid ground, not a denser mark. */
    venom: aim(0.83, 0.42, -0.04, 1.0) },
  /* The last three are the same left-column layout and the figure stands right
     of the copy on all of them — but not on the same spot, and that is
     deliberate. Two sections that ask for an identical frame give the substance
     nothing to change, so the deck step between them would be the only one with
     no scatter in it: the figure would simply be standing there while the
     screens swapped. So it walks: 0.58 -> 0.545 -> 0.61 in fit, 64% -> 66% ->
     63% across, with the vertical alternating by 0.03. Every step is a real
     re-aim, none of it crosses the copy column (which ends at x=693 at 1440,
     and the mark's left flank starts at 640 at its widest), and the whole set
     reads as one figure breathing in depth rather than four positions. */
  { key: 'ai',        label: 'AI compute', theme: 'white', mark: 'bull',
    venom: aim(0.64, 0.580, -0.06) },
  { key: 'sites',     label: 'Sites',     theme: 'light', mark: 'bull',
    venom: aim(0.66, 0.545, -0.03) },
  { key: 'desk',      label: 'Sourcing desk', theme: 'light', mark: 'bull',
    venom: aim(0.63, 0.610, -0.08) }
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
  ready: false     // the intro gate has handed the screen over
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
