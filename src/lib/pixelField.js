/**
 * PIXEL FIELD — the screen the substance forms on.
 * ─────────────────────────────────────────────────────────────────────────
 * A sparse lattice of micro dots covering the light themes. On its own it only
 * breathes, just above the threshold of noticing. Two things drive it:
 *
 *   1. the substance — every frame the field samples the venom canvas at its
 *      own lattice resolution, and dots standing where the substance is coming
 *      together darken, quicken and gain contrast. The bull is not painted on
 *      top of the dots, it *resolves out of them*, the way an image resolves on
 *      a display: the same shape, but built from the page's own texture.
 *
 *   2. the cursor — a halo that raises contrast, plus a ring travelling out
 *      from the pointer and a kick from how fast it is moving, so the field
 *      answers the hand rather than just brightening near it.
 *
 * Sparse is what makes it read as *dots*. Shading every cell gives a continuous
 * haze — a texture, not points. Only every STEPth cell is written and the rest
 * stay white, so each dot keeps hard edges and empty space around it, and the
 * page average stays low even though one dot is dark enough to see.
 *
 * The canvas backing store is the lattice itself (one texel per cell) and CSS
 * scales it up with image-rendering: pixelated, so a dot lands on whole screen
 * pixels and never softens.
 *
 * Composited with mix-blend-mode: multiply, like the substance: a texel left at
 * white disappears into the page, and only the darkened ones register.
 */

/* Sine as a lookup table. A real Math.sin() per dot per frame is milliseconds;
   a 1024-step table is a couple of array reads. Coarse by design — the values
   land on 8-bit greys anyway. */
const LUT_N = 1024
const LUT_MASK = LUT_N - 1
const SIN = new Float32Array(LUT_N)
for (let i = 0; i < LUT_N; i++) SIN[i] = 0.5 + 0.5 * Math.sin((i / LUT_N) * Math.PI * 2)

const WHITE = 0xffffffff

export function createPixelField(canvas, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false })
  if (!ctx) return null

  const CELL = opts.cell ?? 2            // CSS px per texel
  const STEP = opts.step ?? 3            // texels between dots → 6px dot pitch

  /* The cursor raises contrast, never the average darkness. An earlier pass had
     the halo add darkening and it read as a grey smudge trailing the mouse; the
     field has to look like the paper waking up, so BASE sets a fixed tone and
     only the swing around it grows. Mean output is independent of the halo. */
  const BASE = opts.base ?? 16           // constant dot darkening, 8-bit steps
  const SWING = opts.swing ?? 13         // idle twinkle, ± around BASE
  const HOVER_SWING = opts.hoverSwing ?? 34   // extra swing under the cursor

  /* Substance coupling. VENOM_DEPTH is what makes the bull resolve out of the
     lattice; VENOM_SWING lets those dots flicker harder, so the shape looks
     like it is being written to the screen rather than laid over it. */
  const VENOM_DEPTH = opts.venomDepth ?? 24
  const VENOM_SWING = opts.venomSwing ?? 18
  const VENOM_RATE = opts.venomRate ?? 1.7    // dots quicken inside the shape

  const RADIUS = opts.radius ?? 320      // cursor halo reach, CSS px
  const RIPPLE = opts.ripple ?? 0.55     // travelling ring strength
  const RIPPLE_LEN = opts.rippleLen ?? 26     // texels per ring
  const TINT = opts.tint ?? 3.5          // per-channel lean — the "shimmer"
  const SPEED = opts.speed ?? 0.16       // idle drift
  const HOVER_SPEED = opts.hoverSpeed ?? 0.34  // dots hurry near the cursor

  /* Liquid glass. A lens does not tint what is behind it evenly — it throws
     colour at the rim and leaves the middle clean. So the channel split is
     driven by q(1−q), which peaks halfway out from the pointer and vanishes
     both under it and past the halo, and it is signed by which side of the
     pointer the dot is on, so red leads on one side and blue on the other.
     Movement feeds it too: a still hand leaves the paper almost neutral. */
  const GLASS = opts.glass ?? 62         // rim colour split, 8-bit steps
  const GLASS_LIFT = opts.glassLift ?? 9 // slight swell of the rim itself

  let gw = 1, gh = 1                     // grid size, in texels
  let dw = 1, dh = 1                     // dot lattice size
  let image = null, buf32 = null
  let phase = null, rate = null, clump = null, lean = null

  /* Per-dot constants. Rebuilt only on resize — nothing here is per-frame.

     `clump` is the important one: without it every dot twinkles independently
     and the field reads as television static. Summing a few long, mutually
     prime waves gathers the motion into soft drifting patches instead. */
  function build() {
    dw = Math.ceil(gw / STEP)
    dh = Math.ceil(gh / STEP)
    const n = dw * dh

    phase = new Uint16Array(n)
    rate = new Uint8Array(n)
    clump = new Float32Array(n)
    lean = new Int8Array(n)

    let seed = 0x9e3779b9
    const rand = () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
      return ((seed >>> 0) % 100000) / 100000
    }

    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const i = y * dw + x
        phase[i] = (rand() * LUT_N) | 0
        rate[i] = 1 + ((rand() * 3) | 0)
        const c =
          Math.sin(x * 0.070 + y * 0.041) * 0.5 +
          Math.sin(x * 0.021 - y * 0.083) * 0.3 +
          Math.sin((x + y) * 0.033) * 0.2
        clump[i] = 0.3 + 0.7 * (0.5 + 0.5 * c)
        lean[i] = ((rand() * 3) | 0) - 1
      }
    }

    image = ctx.createImageData(gw, gh)
    buf32 = new Uint32Array(image.data.buffer)
    sampleCv.width = dw
    sampleCv.height = dh
  }

  /* Substance sampler. The venom canvas is downscaled straight onto the dot
     lattice, so sample i lines up with dot i and the readback is only dw × dh
     pixels — a few tens of thousands, not the full viewport. */
  const sampleCv = document.createElement('canvas')
  const sampleCtx = sampleCv.getContext('2d', { willReadFrequently: true })
  let sample = null
  let venomEl = null
  let venomAlpha = 0
  let alphaClock = 0

  function readVenom(dt) {
    // the canvas fades in and out through CSS, and a dot screen still showing
    // a shape the substance has already left looks broken — so track the real
    // opacity, just not every frame
    alphaClock -= dt
    if (alphaClock <= 0) {
      alphaClock = 0.15
      venomEl = document.getElementById('venom')
      venomAlpha = venomEl ? (parseFloat(getComputedStyle(venomEl).opacity) || 0) : 0
    }
    if (!venomEl || venomAlpha <= 0.02 || !venomEl.width || !sampleCtx) {
      sample = null
      return
    }
    try {
      sampleCtx.drawImage(venomEl, 0, 0, dw, dh)
      sample = sampleCtx.getImageData(0, 0, dw, dh).data
    } catch {
      sample = null    // tainted or not yet renderable — fall back to plain dots
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect()
    gw = Math.max(1, Math.ceil(r.width / CELL))
    gh = Math.max(1, Math.ceil(r.height / CELL))
    canvas.width = gw
    canvas.height = gh
    build()
  }
  resize()

  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
  if (ro) ro.observe(canvas)
  else addEventListener('resize', resize, { passive: true })

  /* Cursor. Targets are set by the event, the rendered position eases toward
     them every frame — a raw pointer position makes the halo snap. `on` rises
     from 0 the first time the pointer is seen so the halo fades in, and `kick`
     carries how fast the hand is moving, which is most of what makes the field
     feel alive rather than merely lit. */
  const cur = {
    x: -9999, y: -9999, tx: -9999, ty: -9999,
    on: 0, seen: false, kick: 0, px: 0, py: 0
  }
  function onMove(e) {
    const r = canvas.getBoundingClientRect()
    const nx = (e.clientX - r.left) / CELL
    const ny = (e.clientY - r.top) / CELL
    if (cur.seen) {
      const mx = nx - cur.px, my = ny - cur.py
      const sp = Math.sqrt(mx * mx + my * my)
      cur.kick = Math.min(1, cur.kick + sp * 0.016)
    } else {
      cur.x = nx; cur.y = ny; cur.seen = true
    }
    cur.px = nx; cur.py = ny
    cur.tx = nx; cur.ty = ny
  }
  const onTouch = (e) => { if (e.touches?.[0]) onMove(e.touches[0]) }
  const onLeave = () => { cur.seen = false }
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('touchmove', onTouch, { passive: true })
  addEventListener('pointerleave', onLeave, { passive: true })

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const R = RADIUS / CELL
  const invR2 = 1 / (R * R)
  const invRad = 1 / R
  const ringK = LUT_N / RIPPLE_LEN

  let alive = true
  let last = performance.now() / 1000
  let tp = 0            // shared phase counter, in LUT steps
  let ring = 0          // ripple phase, runs outward from the cursor

  function visible() {
    // the field belongs to the light themes; on the dark ones CSS has already
    // faded it out, so spending frames on it is pure waste
    const t = document.documentElement.getAttribute('data-theme')
    return t !== 'dark' && t !== 'black' && !document.hidden
  }

  function frame() {
    if (!alive) return
    requestAnimationFrame(frame)

    const now = performance.now() / 1000
    let dt = now - last
    last = now
    if (dt > 0.05) dt = 0.05
    if (!visible()) return

    // ease the halo toward the pointer, its strength toward on/off, and let the
    // movement kick bleed away so a flick swells and settles
    const k = 1 - Math.pow(0.005, dt)
    if (cur.seen) {
      cur.x += (cur.tx - cur.x) * k
      cur.y += (cur.ty - cur.y) * k
    }
    cur.on += ((cur.seen ? 1 : 0) - cur.on) * (1 - Math.pow(0.02, dt))
    cur.kick *= Math.pow(0.06, dt)

    const live = cur.on * (0.55 + 0.45 * cur.kick)
    const drift = reduced ? 0 : SPEED + HOVER_SPEED * live
    tp = (tp + dt * drift * LUT_N) % LUT_N
    ring = (ring + dt * LUT_N * (reduced ? 0 : 0.75)) % LUT_N
    const tpi = tp | 0
    const ringP = ring | 0

    readVenom(dt)

    const cx = cur.x, cy = cur.y
    const rippleAmt = RIPPLE * live

    // everything not written stays white, which multiply leaves untouched
    buf32.fill(WHITE)

    for (let dy = 0; dy < dh; dy++) {
      const y = dy * STEP
      const oy = y - cy
      const oy2 = oy * oy
      const row = y * gw
      const drow = dy * dw
      for (let dx = 0; dx < dw; dx++) {
        const i = drow + dx
        const x = dx * STEP

        // how much substance stands on this dot — the venom canvas is white
        // where there is none and dark where it has gathered
        let vd = 0
        if (sample !== null) {
          const s = i << 2
          const lum = sample[s] * 0.299 + sample[s + 1] * 0.587 + sample[s + 2] * 0.114
          vd = (255 - lum) * (0.00392 * venomAlpha)
          if (vd < 0) vd = 0; else if (vd > 1) vd = 1
        }

        // cursor halo — quadratic falloff, clipped at the radius
        const ox = x - cx
        const dist2 = ox * ox + oy2
        let q = 1 - dist2 * invR2
        if (q < 0) q = 0
        else q = q * q * cur.on

        // 0..1 twinkle: own phase, own rate, quickened where the substance is
        const step = tpi * rate[i] + ((tpi * VENOM_RATE * vd) | 0)
        let v = SIN[(phase[i] + step) & LUT_MASK]

        // a ring running outward from the pointer, so the field answers the
        // hand instead of just being brighter near it
        if (rippleAmt > 0 && q > 0) {
          const r = SIN[(((Math.sqrt(dist2) * ringK) | 0) - ringP) & LUT_MASK]
          v += (r - 0.5) * rippleAmt * q
        }

        // v is centred so the twinkle swings both ways around BASE; the halo
        // and the substance widen that swing without shifting its centre
        const c = clump[i]
        const swing = (v - 0.5) * (SWING + HOVER_SWING * q + VENOM_SWING * vd) * c
        let d = (BASE + VENOM_DEPTH * vd) * c + swing
        if (d < 0) d = 0

        // the lean is what makes it iridescent rather than grey: one channel
        // darkens a touch more than the others, and which one varies per dot.
        // Keyed to |swing| so colour only shows where a dot is actually moving
        let l = lean[i] * TINT * (swing < 0 ? -swing : swing) * 0.1

        // liquid glass at the halo rim
        if (q > 0) {
          const rim = q * (1 - q) * 4          // 0 at the centre, 0 past the edge
          const side = ox * invRad             // which side of the pointer, −1..1
          l += rim * side * GLASS * (0.45 + 0.55 * cur.kick)
          d += rim * GLASS_LIFT * c
        }
        let r = 255 - d - l
        let g = 255 - d
        let b = 255 - d + l
        if (r < 0) r = 0; else if (r > 255) r = 255
        if (g < 0) g = 0; else if (g > 255) g = 255
        if (b < 0) b = 0; else if (b > 255) b = 255

        buf32[row + x] = 0xff000000 | (b << 16) | (g << 8) | r
      }
    }

    ctx.putImageData(image, 0, 0)
  }
  requestAnimationFrame(frame)

  return {
    destroy() {
      alive = false
      ro?.disconnect()
      removeEventListener('pointermove', onMove)
      removeEventListener('touchmove', onTouch)
      removeEventListener('pointerleave', onLeave)
    }
  }
}
