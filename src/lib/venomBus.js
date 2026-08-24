/**
 * Tiny bridge between the single VenomCanvas instance and the views.
 * A view says which mark the substance should hold and where it should sit;
 * the canvas morphs to it. Nothing else crosses this boundary.
 */
let engine = null
let visibility = null

export function bindVenom(e) {
  engine = e
  // dev only: lets a headless run drive a mark change at a known instant, which
  // is the only way to sample a 2.4s transition frame by frame
  if (import.meta.env.DEV) window.__venom = e
}

/* The director decides visibility while the page scrolls. The deck does not
   scroll, so it says so itself. */
export function bindVenomVisibility(fn) { visibility = fn }
export function venomVisible(on) { visibility?.(on) }

/** morph the substance into a new mark; safe to call before the canvas mounts */
export function venomMark(mark) {
  if (!mark) return
  // how hard the substance should hold this mark's geometry — detailed product
  // renders need it, the bull does not
  engine?.set('tighten', mark.tighten ?? 0)
  engine?.setMark(mark.url, mark)
}

/** reposition / retune the substance for the current page layout */
export function venomLayout({ fit, offsetX, offsetY, settleOverride, opacity, dolly } = {}) {
  if (!engine) return
  engine.set('fit', fit ?? 0.40)
  engine.set('offsetX', offsetX ?? 0)
  engine.set('offsetY', offsetY ?? -0.07)
  engine.set('settleOverride', settleOverride ?? null)
  engine.set('opacity', opacity ?? 1)
  // how far down the hall the camera stands; ignored by every mark but the
  // corridor, and never a zoom — see uDolly in venomParticles.js
  engine.set('dolly', dolly ?? 0)
}

/* Marks the substance morphs through — real product renders, so the shape is
   recognisable (per the RTX-5090 reference). boost/gamma stretch contrast for
   light-coloured renders; markScale is the width fraction of the texture. */
export const MARKS = {
  // density is alpha × (1 − luminance), so the mark must be a *dark* silhouette;
  // bull-solid.svg is white (it is the favicon) and rasterises to zero density
  bull: { url: '/assets/logo/bull-mark.svg', markScale: 0.60 },
  ai: {
    url: '/assets/catalog/ai/asus-esc8000a-e12.png',
    markScale: 0.72, boost: 1.5, gamma: 0.9
  },
  asic: {
    url: '/assets/catalog/asic/antminer-s21-pro.png',
    markScale: 0.50, boost: 1.7, gamma: 0.85
  },
  /* The photographic card render came back as an unreadable slab: the shroud
     is one dark mass, so density flattens the whole body and the substance had
     nothing to hold. This mark is drawn instead — the openings, the bracket
     ports, the heatsink slots, the PCIe contacts and the engraved model are
     each a hard black/white boundary, which is what survives the displacement.
     `fans` makes the two discs turn; see spin() in venom.js. */
  gpu: {
    url: '/assets/marks/gpu-card.svg',
    markScale: 0.86,
    feather: [[6, 0.28], [2, 0.60], [0, 1.0]],
    tighten: 1.0,
    fans: [
      [118 / 360, 112 / 190, 46 / 360, 0.5],
      [250 / 360, 112 / 190, 46 / 360, 0.5]
    ]
  },
  server: {
    url: '/assets/catalog/ai/asus-esc8000a-e12.png',
    markScale: 0.72, boost: 1.5, gamma: 0.9
  },
  container: {
    url: '/assets/catalog/container/hydrocore-240-3u.png',
    markScale: 0.74, boost: 2.1, gamma: 0.8
  },
  power: {
    url: '/assets/catalog/power/gascore-1000.png',
    markScale: 0.66, boost: 2.0, gamma: 0.8
  },

  /* ── the hall ──
     `corridor: true` is the whole switch. It routes the mark through buildHall()
     and the per-grain perspective in venomParticles.js, and `fieldGain: 0` takes
     the continuous field out of the section entirely — the field cannot move a
     grain, so the only thing it could ever do with a hall was zoom the whole
     picture, which is what came back as "the corridor moves as one frame".
     Nothing zooms here now: `fit` is a constant 0.31 for all four dolly stages
     and the only thing that changes is uDolly.

     The raster below is not read as a spawn map any more (buildHall generates
     the cloud), only as the texture the field crossfades toward while it drains
     on the way in. feather is off for the same reason it was: nothing wants it. */
  corridor: {
    url: '/assets/venom-shapes/corridor.png',
    markScale: 1.0, boost: 1.15, gamma: 0.92,
    feather: [[0, 1.0]],
    fieldGain: 0,
    corridor: true
  },

  /* Built by scripts/prep-venom-marks.py from Venom/*.

     ── polarity, fourth pass, measured not assumed ──
     All three sources are BLACK INK ON CLEAN WHITE, 1024². The 8×8 corner of
     each reads 250-255 and the prep run prints that number on every line, so
     the next revision does not have to rediscover it. Nothing inverts.

     ── what the shipped maps now are ──
     Not tonal coverage any more. Each map is BODY + LINE + TONE: a flood-filled
     occupancy mask at one constant density, the artwork's own line work at
     native resolution on top of it, and only a minority weight of photographic
     tone. See the header of prep-venom-marks.py for why — in short, a dot
     lattice whose density encodes luminance is a halftone print, and a print is
     what the client kept seeing. A body of substance with structure drawn on it
     is what the bull is, and it is now what these are.

     Each map also ships a faint HALO outside the object and is faded out at the
     frame edge, which is what `smoke` below has to dissolve into.

     boost/gamma are gone — the prep now delivers the curve it wants — and
     `feather` is dropped because on an opaque RGB source it never did anything:
     markTexture composites the layers, so the final unblurred pass at alpha 1.0
     overwrites every pixel inside the image rectangle and the blurred layers
     survive only as a fringe outside it, where the source is white and the
     density is zero either way. The soft edge is prep's halo now, honestly.

     markScale is a width fraction. The new auto-crop includes the halo and all
     three sources are diagonal or head-on compositions, so all three boxes came
     out near square (gpu 928×900, containers 1006×972, founder 1018×991) and
     the scales are re-derived to land each object at roughly the optical size
     it held before. */
  gpuArt: {
    url: '/assets/venom-shapes/gpu.png',
    markScale: 0.66,
    tighten: 0.82, fieldGain: 0.40, smoke: 0.90
  },
  containersArt: {
    url: '/assets/venom-shapes/containers.png',
    markScale: 0.60,
    tighten: 0.86, fieldGain: 0.40, smoke: 0.90
  },
  founderArt: {
    url: '/assets/venom-shapes/founder.png',
    markScale: 0.56,
    fieldGain: 0.40,
    // a face is the shape a viewer is most sensitive to distortion in: 8px of
    // drift across the eye line does not soften a portrait, it replaces it
    tighten: 0.88,
    /* Slightly under the other two. A jacket shoulder can boil away into the
       air and still be a shoulder; a jaw line cannot lose its outline and stay
       a jaw. 0.78 keeps the dissolve on the halo and the collar and off the
       face, because the density mask it runs on is already well above 0.55
       everywhere the head is. */
    smoke: 0.78
  }
}
