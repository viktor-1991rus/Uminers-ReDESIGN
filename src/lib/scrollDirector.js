/**
 * One scroll pass for the whole page.
 *
 * Components register themselves and get called back; there is a single
 * scroll listener and a single layout read per frame. Deliberately not built
 * on IntersectionObserver: a position:fixed element can report
 * isIntersecting=false in some engines, and observer callbacks fire on their
 * own schedule, which made theme hand-off and the substance disagree.
 */
const sections = []   // { el, theme }
const zones = []      // { el }  — where the substance is allowed to show
const enters = []     // { el, fn, margin, done }

let root = null
let currentTheme = null
let onVenom = null
let ticking = false

function ensureRoot() {
  if (!root) root = document.documentElement
  return root
}

export function registerSection(el, theme) {
  const entry = { el, theme }
  sections.push(entry)
  request()
  return () => {
    const i = sections.indexOf(entry)
    if (i > -1) sections.splice(i, 1)
  }
}

export function registerVenomZone(el) {
  const entry = { el }
  zones.push(entry)
  request()
  return () => {
    const i = zones.indexOf(entry)
    if (i > -1) zones.splice(i, 1)
  }
}

/** fn() runs once, the first time el comes within `margin` of the viewport */
export function onEnter(el, fn, margin = 0.9) {
  const entry = { el, fn, margin, done: false }
  enters.push(entry)
  request()
  return () => {
    const i = enters.indexOf(entry)
    if (i > -1) enters.splice(i, 1)
  }
}

export function setVenomHandler(fn) {
  onVenom = fn
}

export function pass() {
  const vh = window.innerHeight || 800
  const mid = vh * 0.5
  const doc = ensureRoot()

  // theme: whichever section crosses the middle of the viewport owns the page
  for (let i = 0; i < sections.length; i++) {
    const r = sections[i].el.getBoundingClientRect()
    if (r.top <= mid && r.bottom >= mid) {
      const t = sections[i].theme
      if (t !== currentTheme) {
        currentTheme = t
        doc.setAttribute('data-theme', t)
      }
      break
    }
  }

  // the substance shows only over the zones that opted in
  if (onVenom) {
    let show = false
    for (let i = 0; i < zones.length; i++) {
      const r = zones[i].el.getBoundingClientRect()
      if (r.top < vh * 0.62 && r.bottom > vh * 0.22) { show = true; break }
    }
    onVenom(show)
  }

  // one-shot entries
  for (let i = enters.length - 1; i >= 0; i--) {
    const e = enters[i]
    if (e.done) { enters.splice(i, 1); continue }
    const r = e.el.getBoundingClientRect()
    if (r.top < vh * e.margin && r.bottom > 0) {
      e.done = true
      e.fn()
      enters.splice(i, 1)
    }
  }
}

/* Called straight from the scroll event. Browsers already align scroll events
   to frames and a handful of rect reads is cheap. A rAF latch was tried and is
   wrong here: if a frame is ever dropped the lock never releases and scroll
   handling dies for the rest of the session. */
function request() {
  if (ticking) return
  ticking = true
  Promise.resolve().then(() => { ticking = false; pass() })
}

let started = false
export function startDirector() {
  if (started) return
  started = true
  addEventListener('scroll', pass, { passive: true })
  addEventListener('resize', pass, { passive: true })
  pass()
  setTimeout(pass, 80)
  setTimeout(pass, 600)
}
