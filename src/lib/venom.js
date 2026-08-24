/**
 * VENOM — the Uminers substance.
 * ─────────────────────────────────────────────────────────────────────────
 * One full-viewport quad, one fragment shader, no particles.
 *
 * The bull mark is rasterised into a feathered greyscale texture, then sampled
 * through three displacements stacked in UV space:
 *
 *   1. a concentric ripple field centred on the cursor  (uRippleMix)
 *   2. a slow multi-axis wave                           (uComplexMix)
 *   3. per-pixel hash noise                             (uGrainIntensity)
 *
 * R, G and B are then read at three *cumulative* diagonal offsets, so wherever
 * the silhouette edge falls between the taps one channel is inside the shape
 * while the others are out. That is where the warm sand and cool lavender come
 * from — there is no palette, only channel separation. The result is inverted
 * (light ground, dark substance), desaturated, floored, and composited with
 * mix-blend-mode: multiply so white vanishes into the page.
 *
 * uFloor stops the densest regions from crushing to
 * black, which is what made overlaid text unreadable. uShimmer then drifts
 * those same regions so the flattened mass keeps moving instead of reading
 * as a poured fill.
 *
 * Rendered at devicePixelRatio 1 on purpose — the hash must land on whole
 * screen pixels or the grain smooths out and the texture dies.
 */

import { buildCloud, buildHall, createParticleLayer } from './venomParticles.js'

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
uniform float uAspect;
uniform float uFit;
uniform vec2  uOffset;
void main(){
  vUv = (aPos * vec2(uAspect, 1.0)) * uFit + 0.5 + uOffset;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uMorph;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uTime;
uniform float uWaveSpeed;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uGrainIntensity;
uniform float uShiftIntensity;
uniform float uShiftSize;
uniform float uRippleSpeed;
uniform float uRippleMix;
uniform float uComplexMix;
uniform float uSaturation;
uniform float uCeil;
uniform float uFloor;
uniform float uShimmer;
uniform float uStretch;
uniform float uSplit;
uniform float uPulse;
uniform vec3  uTap;      // xy where, z how long ago
uniform vec2  uOffsetCentre;
uniform vec4  uFanA;
uniform vec4  uFanB;
uniform float uFanMix;
uniform float uFade;
uniform float uMarkGain;

float hash12(vec2 p){
  float h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

/* smoothed value noise — the per-pixel hash reads as grain, this reads as
   drifting cloud, which is what the dense regions need */
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float circle(vec2 uv, vec2 c, float r, float border){
  uv -= c;
  uv *= uResolution;
  return smoothstep(r + border, r - border, sqrt(dot(uv, uv)));
}

/* Local rotation, applied before any displacement: the fan discs turn while
   the shroud around them stays put. xy is the centre and z the radius, both in
   texture space; w is turns per second. The angle eases to zero across the
   outer tenth of the disc, so the rim shears into the housing instead of
   tearing against it. */
vec2 spin(vec2 uv, vec4 fan){
  if (fan.z <= 0.0 || uFanMix <= 0.0) return uv;
  vec2 d = uv - fan.xy;
  float k = smoothstep(fan.z, fan.z * 0.90, length(d)) * uFanMix;
  if (k <= 0.0) return uv;
  float a = mod(uTime * fan.w * 6.2831853, 6.2831853) * k;
  float s = sin(a), c = cos(a);
  return fan.xy + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

vec2 getRippleWave(vec2 uv){
  vec2 d = uv - uMouse;
  float ripple = sin(length(d) * 20.0 - uTime * uRippleSpeed) * uWaveAmplitude;
  return normalize(d + 1e-6) * ripple;
}

/* two marks live in the shader at once; uMorph crossfades them, and the JS
   side spikes the displacement mid-transition so the silhouette appears to
   dissolve and re-assemble rather than fade.

   Nothing is added to the density here. A previous revision layered a
   domain-warped noise field (smokeField) onto the sampling UVs and an erode
   term onto the density itself; the erode was unmasked, so at uSmoke 1 it put
   up to +0.30 density on every fragment of the window — including the empty
   ground the mark does not occupy. That is what read as a black web over the
   whole screen, and it is gone. The only thing that ever touches density is
   uMarkGain, which drains the field while the grains carry the change. */
vec4 sampleMark(vec2 uv){
  vec4 c = mix(texture2D(uTexture, uv), texture2D(uTexture2, uv), uMorph);
  /* uMarkGain is the handover to the particle layer. Mid-change the field is
     drained to a tenth of its density — what the viewer is reading at that
     moment is grains in flight, not a warped sheet — and it is refilled only
     once the incoming cloud has landed on its targets. Outside a change it is
     1.0 and this line does nothing. */
  return clamp(c * uMarkGain, 0.0, 1.0);
}

vec2 getComplexWave(vec2 uv){
  float w1 = sin(uv.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveAmplitude;
  float w2 = sin(uv.y * uWaveFrequency * 0.7 + uTime * uWaveSpeed * 0.8) * uWaveAmplitude * 0.7;
  float w3 = sin((uv.x + uv.y) * uWaveFrequency * 0.5 + uTime * uWaveSpeed * 1.2) * uWaveAmplitude * 0.5;
  return vec2(w1 + w3, w2 + w3);
}

void main(){
  vec2 uv = vUv;

  vec2 centre = vec2(0.5) + uOffsetCentre;

  /* A drop landing in still water. Rings run outward from the centre of the
     mark, falling off with distance so the substance looks like a body of
     liquid holding the shape rather than a picture of one. This never stops —
     it is the idle state of the whole thing — and a change makes it louder. */
  if (uPulse > 0.0) {
    vec2 d = uv - centre;
    float r = length(d);
    float ring = sin(r * 22.0 - uTime * 3.4) * exp(-r * 4.2);
    uv += normalize(d + 1e-5) * ring * uPulse * 0.030;
  }

  /* A tap lands like a stone: two or three rings leave the point of contact,
     travel outward at a fixed speed and die out with both distance and age.
     Read on the surface rather than on the mark, so it works anywhere the
     substance happens to be. */
  if (uTap.z > 0.0 && uTap.z < 2.4) {
    vec2 d = uv - uTap.xy;
    float r = length(d);
    float front = r - uTap.z * 0.42;                 // ring travels outward
    float wave = sin(front * 34.0) * exp(-abs(front) * 11.0);
    float life = exp(-uTap.z * 1.5);
    uv += normalize(d + 1e-5) * wave * life * 0.055;
  }

  /* Mid-change the substance is pulled off its own centre: the sampling window
     widens across and squeezes down, so the old mark smears apart before the
     new one gathers. Anisotropic on purpose — an even scale reads as a zoom,
     a stretch reads as something coming undone. */
  if (uStretch > 0.0) {
    vec2 d = uv - centre;
    d.x /= (1.0 + uStretch * 1.30);
    d.y *= (1.0 + uStretch * 0.55);
    d += vec2(sin(d.y * 9.0 + uTime * 2.2), cos(d.x * 7.0 - uTime * 1.7))
         * uStretch * 0.035;
    uv = centre + d;
  }

  /* The halves part. Sampling is pulled toward the centre, so what is drawn
     travels outward — left goes left, right goes right — and then closes again
     as uSplit falls. That is the gesture of moving between screens: the mark
     opens like a door rather than dissolving in place. */
  if (uSplit > 0.0) {
    vec2 d = uv - centre;
    float lane = smoothstep(0.0, 0.16, abs(d.x));   // hold the seam together
    d.x -= sign(d.x) * uSplit * 0.20 * lane;
    uv = centre + d;
  }

  uv = spin(uv, uFanA);
  uv = spin(uv, uFanB);
  uv += getRippleWave(uv)  * uRippleMix;
  uv += getComplexWave(uv) * uComplexMix;

  float hash = hash12(uv * 10.0);

  // uCeil caps the extrapolation. Unclamped it runs to 1.5, which drives the
  // shape to pure black; we stop short so the substance stays a deep charcoal.
  float c = min(circle(uv, vec2(0.5), 0.0, uShiftSize) * 10.0 * uWaveSpeed, uCeil);

  vec2 warpedUV = uv + vec2(hash - 0.5) * c * uGrainIntensity;

  vec4 originalColor = sampleMark(warpedUV);
  float r = sampleMark(warpedUV.xy += c * (uShiftIntensity * 0.500)).x;
  float g = sampleMark(warpedUV.xy += c * (uShiftIntensity * 0.525)).y;
  float b = sampleMark(warpedUV.xy += c * (uShiftIntensity * 0.550)).z;

  vec4 color = mix(originalColor, vec4(r, g, b, 1.0), c);

  color.rgb = 1.0 - color.rgb;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, uSaturation);

  // lift the black floor — keeps overlaid text legible
  color.rgb = uFloor + color.rgb * (1.0 - uFloor);

  /* The floor and the ceiling together flatten the densest regions to one
     tone, and a large mark then reads as a poured fill. A slow drift, masked
     to the dark end and phased differently per channel, keeps that mass
     moving and carries the same warm/cool separation as the edges. Small on
     purpose: enough to see the substance breathe, not enough to read as
     noise over the silhouette. */
  float dense = smoothstep(0.55, 0.05, gray);
  vec2  sp = uv * 3.6;
  float st = uTime * 0.40;
  vec3 drift = vec3(
    vnoise(sp + vec2( st,        -st * 0.62)),
    vnoise(sp + vec2(-st * 0.78,  st * 0.55) + 13.7),
    vnoise(sp + vec2( st * 0.66,  st * 0.91) + 27.3)
  ) - 0.5;
  // the three phases cancel in luminance, so they alone only shift the hue —
  // a wider common layer on top is what makes the mass visibly breathe
  float swell = vnoise(sp * 0.62 + vec2(-st * 0.47, st * 0.31)) - 0.5;
  color.rgb += (drift * 0.65 + swell) * (uShimmer * dense);

  // fade back toward white so the substance can dissolve out entirely
  color.rgb = mix(vec3(1.0), color.rgb, uFade);
  gl_FragColor = vec4(color.rgb, 1.0);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('venom shader:', gl.getShaderInfoLog(s))
    return null
  }
  return s
}

/* Rasterise the mark into a feathered greyscale density texture.

   Density comes from alpha × inverse luminance, so the same path serves both
   kinds of mark: a solid black SVG stays a pure silhouette (lum 0 → density =
   alpha, exactly the old behaviour), while a photographic product render keeps
   its interior detail — dark fans and vents come out dense, light metal faint,
   white or transparent background disappears. That is what makes the substance
   re-assemble into a *recognisable* product instead of an abstract blob.

   opts.boost / opts.gamma stretch the contrast for light-coloured renders. */
function markTexture(gl, opts, done) {
  let layoutRatio = 1
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]))

  const img = new Image()
  /* onload fires with the bitmap still undecoded, so the first drawImage pays
     for it — on the frame a section changes, which is the one frame that must
     not stall. decode() moves that cost off the main thread and the raster only
     starts once there is nothing left to decode. */
  img.decoding = 'async'
  const raster = () => {
    const S = 1024
    const cv = document.createElement('canvas')
    cv.width = S; cv.height = S
    const ctx = cv.getContext('2d', { willReadFrequently: true })

    const ratio = (img.width && img.height) ? img.width / img.height : 151.673 / 115.214
    layoutRatio = ratio
    const w = S * (opts.markScale ?? 0.60)
    const h = w / ratio
    const x = (S - w) / 2
    const y = (S - h) / 2

    // layered feather: wide diffuse halo first, sharp detail on top
    const layers = opts.feather ?? [[26, 0.5], [9, 0.8], [2, 1.0]]
    ctx.clearRect(0, 0, S, S)
    for (const [blur, alpha] of layers) {
      ctx.save()
      ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none'
      ctx.globalAlpha = alpha
      ctx.drawImage(img, x, y, w, h)
      ctx.restore()
    }

    const boost = opts.boost ?? 1
    const gamma = opts.gamma ?? 1

    /* 1024² is 1.05M pixels and this runs synchronously on the frame a section
       changes — the worst moment available. Math.pow per pixel was measured at
       an 85ms long task on an M-series laptop, which is five dropped frames
       landing exactly under the transition. The curve only depends on the
       density, so it is tabulated once at 1024 steps (finer than the 8-bit
       result can express) and the loop becomes two multiplies and a lookup. */
    const CURVE = new Uint8Array(1025)
    for (let i = 0; i <= 1024; i++) {
      const v = Math.min(1, (i / 1024) * boost)
      CURVE[i] = Math.min(255, Math.round((gamma !== 1 ? Math.pow(v, gamma) : v) * 255))
    }

    const d = ctx.getImageData(0, 0, S, S)
    const px = d.data
    for (let i = 0; i < px.length; i += 4) {
      const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
      // a × (1 − lum), both 0..255, scaled into the 0..1024 table index
      const q = CURVE[(px[i + 3] * (255 - lum) * 0.015748) | 0]
      px[i] = q; px[i + 1] = q; px[i + 2] = q; px[i + 3] = 255
    }
    ctx.putImageData(d, 0, 0)

    /* the same raster is the particle spawn map — see buildCloud(). It has to
       be read *after* putImageData, because that is when the density curve is
       in the canvas rather than the source artwork's own luminance. */
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    done?.(layoutRatio, cv)
  }
  img.onload = () => { (img.decode?.() ?? Promise.resolve()).then(raster, raster) }
  img.onerror = () => done?.(1, null)
  img.src = opts.markUrl
  return tex
}

export function createVenom(canvas, opts = {}) {
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: 'default',
    // the pixel field samples this canvas every frame to decide where the
    // substance is forming, and drawImage off a discarded buffer comes back
    // blank — the field is the screen the substance appears on, so it has to
    // be able to read it
    preserveDrawingBuffer: true
  })
  if (!gl) return null

  const prog = gl.createProgram()
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.bindAttribLocation(prog, 0, 'aPos')
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('venom link:', gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const U = {}
  for (const n of ['uTexture', 'uTexture2', 'uMorph', 'uResolution', 'uMouse',
    'uTime', 'uWaveSpeed', 'uWaveAmplitude', 'uWaveFrequency', 'uGrainIntensity',
    'uShiftIntensity', 'uShiftSize', 'uRippleSpeed', 'uRippleMix', 'uComplexMix',
    'uSaturation', 'uCeil', 'uFloor', 'uShimmer', 'uStretch', 'uSplit', 'uPulse',
    'uOffsetCentre', 'uTap',
    'uFanA', 'uFanB', 'uFanMix',
    'uAspect', 'uFit', 'uOffset', 'uFade', 'uMarkGain']) {
    U[n] = gl.getUniformLocation(prog, n)
  }

  let ready = false

  /* Spinning parts. A mark declares its fans in its own artwork space —
     [x, y, radius, turnsPerSecond], x/y as fractions of the render with y
     down, radius as a fraction of its width — and the engine converts that to
     texture space, since only the engine knows how the mark was laid into the
     atlas. fanMix eases the rotation in and out so a mark change does not
     start or stop the blades on a frame boundary. */
  /* Layout is eased, never set. A section change rewrites fit and offset, and
     applied outright the mark jumps across the screen in one frame — which
     reads as a cut, not as movement. These follow their targets instead. */
  const view = {
    fit: opts.fit ?? 0.40,
    ox: opts.offsetX ?? 0,
    oy: opts.offsetY ?? -0.07,
    opacity: opts.opacity ?? 1
  }
  // settleOverride is pinned by a screen (the intro rotation locks it to a
  // peak between mark changes), and applied outright it is a one-frame snap;
  // eased on the same clock as the rest of the view, it arrives instead
  let settleEased = 1

  /* the last tap, in texture space, and how long ago it landed */
  const tap = { x: 0.5, y: 0.5, t: 99 }
  function onTap(e) {
    const r = canvas.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = 1 - (e.clientY - r.top) / r.height
    // screen → the same uv space the vertex shader builds
    tap.x = (nx * 2 - 1) * (r.width / r.height) * view.fit + 0.5 + view.ox
    tap.y = (ny * 2 - 1) * view.fit + 0.5 + view.oy
    tap.t = 0
  }
  addEventListener('pointerdown', onTap, { passive: true })

  /* ── particle layer ──
     The field shader owns the *settled* state — every number in it was tuned
     against a static mark and none of that is touched. The particles own the
     *transition*: for the 2.4s a mark changes, the field is drained and what is
     on screen is two clouds of grains, one being thrown off its targets and one
     gathering onto the next set. At each end of the gesture the particle alpha
     is zero, so the states the viewer actually reads are exactly the ones that
     were already tuned. */
  const pl = createParticleLayer(gl)
  const sets = new Map()          // url → uploaded GL point set, kept for reuse
  let pCount = 0
  const P = { t: 99, kind: 'morph', out: null, in: null, settled: null }

  /* Timelines in seconds, not fractions — a grain's legibility is a function of
     how long it is on screen, and the morph duration is a constant here anyway.

     m0/m1 bound the motion, a0..a3 the fade in and out. The two tracks overlap
     by 250ms: the old cloud is still coming apart when the new one starts to
     gather, which is the one thing that separates a staged change from a pair
     of consecutive tweens. Departure runs 0.84s and arrival 1.55s — 1:1.85,
     because a thing is thrown faster than it settles.

     ── the incoming cloud's INK now leads its motion by 200ms ──
     a0 is 0.55 where m0 is still 0.75, and they are deliberately no longer the
     same instant. Between 0.75 and 1.00 the outgoing cloud is fully dispersed
     and dimming while the incoming one is only starting to fade up from zero,
     so for a quarter of a second there is measurably less substance on the page
     than at either end of the change: mean luminance over the ink peaked at
     0.74 against 0.55 and 0.64 at the two ends. Nothing about the material
     changed there — there was less of it — but thin substance prints less grain
     and less colour, and that is indistinguishable from the venom changing its
     nature, which is the complaint. Bringing the ink up first fills the gap
     with the new cloud in its dispersed state, which is the same material at
     the same tone, and only then does it start to gather. */
  const TL_MORPH = {
    out: { mode: 0, m0: 0.16, m1: 1.00, a0: 0.16, a1: 0.40, a2: 1.05, a3: 1.45 },
    in:  { mode: 1, m0: 0.75, m1: 2.30, a0: 0.55, a1: 0.85, a2: 2.08, a3: 2.38 }
  }
  /* First appearance has nothing to disperse, and it is the one gesture the
     viewer has time to watch: 2.6s of gathering against the morph's 1.55s. */
  const TL_FORM = {
    out: null,
    in:  { mode: 1, m0: 0.30, m1: 2.90, a0: 0.30, a1: 0.75, a2: 2.55, a3: 3.05 }
  }

  function seg(t, a, b) {
    return b <= a ? (t >= b ? 1 : 0) : Math.min(1, Math.max(0, (t - a) / (b - a)))
  }

  /* The build is 12–18ms and markTexture's own raster is already the longest
     task the page runs, on the one frame a section changes. Stacking them put a
     73ms hole exactly under the transition. The incoming cloud is not drawn
     until 0.75s into a 2.4s morph, so it does not have to exist on that frame —
     it is built in the first idle slot instead, with a 400ms ceiling so it is
     never later than it is needed. */
  const idle = window.requestIdleCallback
    ? (fn, timeout) => requestIdleCallback(fn, { timeout })
    : (fn) => setTimeout(fn, 0)

  function setForAsync(url, raster, timeout, apply, radial) {
    const cached = url ? sets.get(url) : null
    if (cached || !raster || !pl) { apply(cached ?? null); return }
    idle(() => { if (alive) apply(setFor(url, raster, radial)) }, timeout)
  }

  function setFor(url, raster, radial) {
    if (!url) return null
    let s = sets.get(url)
    if (!s && raster && pl) {
      /* Grain pitch, not particle count: one grain per 18 canvas px² keeps the
         assembled mark solid without stacking grains on top of each other,
         which is what would darken the settled state past its tuned floor.
         The pitch tightens from 18 to 15 canvas px² per grain because the grain
         is now a hard 2.2px dot rather than a soft 8px blob: the old sprite
         overlapped its neighbours several times over, this one does not, and at
         the old count the assembled mark came out visibly holed.
         1440×900 → 86 400 points, one draw call, static buffer. */
      if (!pCount) pCount = Math.max(22000, Math.min(105000, Math.round(W * H / 15)))
      /* The hall is generated, not sampled — see buildHall(). It still goes
         through markTexture() so the field has a texture to crossfade toward
         while it drains, but nothing reads that raster as a spawn map. */
      s = pl.upload(radial ? buildHall(pCount) : buildCloud(raster, pCount))
      if (s) sets.set(url, s)
    }
    return s ?? null
  }

  let markRatio = 1
  let markScale = opts.markScale ?? 0.60
  let fans = opts.fans ?? null
  let fanMix = fans ? 1 : 0

  let texA = markTexture(gl, {
    markUrl: opts.markUrl ?? '/assets/logo/bull-mark.svg',
    markScale: opts.markScale,
    feather: opts.feather
  }, (r, raster) => {
    ready = true
    markRatio = r
    P.out = null
    P.kind = 'form'
    P.t = 0
    P.in = null
    setForAsync(opts.markUrl ?? '/assets/logo/bull-mark.svg', raster, 260,
      (s) => { if (s) { P.in = s; P.settled = s } })
  })
  let texB = texA   // until the first morph both units read the same mark

  /* ── mark morphing ──
     setMark() rasterises the next silhouette into a fresh texture, then
     drives uMorph 0→1 while frame() spikes the displacement, so the
     substance visibly breaks apart and re-forms as the new shape. */
  const morph = {
    t: 0, dur: 2.4, running: false, loading: false,
    url: opts.markUrl ?? '/assets/logo/bull-mark.svg',
    pending: null, spike: 0
  }

  /* ── the hall ──
     corrIn is the geometry the *current* mark is drawn with, corrOut the one the
     mark on its way out was drawn with; see setMark. dollyStage follows the deck
     stage on a 0.75s exponential, dollyDrift is a permanent creep of 0.030
     cycles/s — one full pass of the hall every 33s — so the corridor is never a
     still image between wheel steps. fieldHold takes the continuous field out of
     the corridor entirely: it cannot do per-grain perspective, and a static
     raster behind grains that are moving is exactly the second layer the whole
     revision is about removing. */
  let corrIn = 0
  let corrOut = 0
  let dollyStage = 0
  let dollyDrift = 0
  let fieldHold = 1
  let restOut = 0

  /* ── geometry is a change, not a slide ──
     `view` (fit/ox/oy/opacity) used to ease toward its target every frame, so a
     section that re-aimed the SAME figure showed the figure travelling across
     the screen: one rigid picture on a tween, which is the picture move the
     particle layer exists to delete. geomOut is the frame the LEAVING cloud was
     drawn with, frozen for the whole exit — the same contract corrOut has —
     geomFrom is where the view stood when the change was called, and geomMoving
     says the view is being carried by the morph clock rather than by the ease.
     Nothing about the effect is retuned here: the clouds, the spike, the
     timeline and the material are the ones that were already there. */
  const geomOut = { fit: view.fit, ox: view.ox, oy: view.oy, opacity: view.opacity }
  const geomFrom = { fit: view.fit, ox: view.ox, oy: view.oy, opacity: view.opacity }
  let geomMoving = false

  function freezeGeometry() {
    geomOut.fit = geomFrom.fit = view.fit
    geomOut.ox = geomFrom.ox = view.ox
    geomOut.oy = geomFrom.oy = view.oy
    geomOut.opacity = geomFrom.opacity = view.opacity
    geomMoving = true
  }

  /* Has the section asked for a different frame of the figure it is already
     holding? 0.004uv is under a fifth of a grain pitch at any fit this runs at,
     so it fires on a real re-aim and never on the tail of an ease. */
  function geometryWants() {
    return Math.abs((opts.fit ?? 0.40) - view.fit) > 0.004
      || Math.abs((opts.offsetX ?? 0) - view.ox) > 0.004
      || Math.abs((opts.offsetY ?? -0.07) - view.oy) > 0.004
  }

  /* The second reason to run the scatter/gather, and the only new one: same
     silhouette, new frame. No raster is made and no texture is swapped — texA
     and texB already hold this figure, so uMorph crossfades it with itself and
     the field's image is untouched. What changes is that the cloud on screen is
     released from its targets (P.out) and a cloud gathers onto the same targets
     read through the NEW fit/offset (P.in). Both are the one set already
     uploaded for this url, drawn twice with different geometry. */
  function setGeometry() {
    const s = sets.get(morph.url)
    if (!s || !pl) return false
    P.out = P.settled ?? s
    P.in = s
    P.settled = s
    P.kind = 'morph'
    P.t = 0
    corrOut = corrIn
    restOut = 1 - fieldHold
    freezeGeometry()
    morph.running = true
    morph.t = 0
    return true
  }

  function setMark(url, mopts = {}) {
    if (!url) return
    if (url === morph.url) {
      if (!geometryWants()) return
      if (morph.running || morph.loading) { morph.pending = [url, mopts]; return }
      setGeometry()
      return
    }
    if (morph.running || morph.loading) { morph.pending = [url, mopts]; return }
    morph.loading = true
    const next = markTexture(gl, {
      markUrl: url,
      markScale: mopts.markScale ?? opts.markScale,
      feather: mopts.feather ?? opts.feather,
      boost: mopts.boost,
      gamma: mopts.gamma
    }, (r, raster) => {
      if (!alive) return
      markRatio = r
      /* The outgoing cloud is the one currently settled on screen, whatever it
         is — including a mark that was itself interrupted mid-arrival. */
      P.out = P.settled
      P.in = null           // nothing to gather until its spawn map exists
      P.kind = 'morph'
      P.t = 0
      setForAsync(url, raster, 400, (s) => { if (s) { P.in = s; P.settled = s } },
        mopts.corridor)
      /* The outgoing cloud keeps whatever geometry it was drawn with, frozen —
         a hall that flattens back into a picture on its way out is the picture
         move this revision exists to delete. The incoming one is switched
         outright rather than eased: it is gathering from a scatter anyway, so
         its targets can simply be the new ones from the first frame. */
      corrOut = corrIn
      corrIn = mopts.corridor ? 1 : 0
      /* Same contract as corrOut, one line down: the cloud that is leaving keeps
         the frame it was standing in, and the view is handed to the arriving one
         (see the geometry block in frame()). */
      freezeGeometry()
      /* Applied here and not in venomBus, for the same reason as corrIn. The bus
         runs the instant a section is picked; the raster is a load away, so a
         mark leaving the hall used to raise the field back to full while the
         field was still holding the CORRIDOR texture — a warped, rippling grid
         flashed for ~250ms at the head of every exit, which is precisely the
         second layer this revision exists to delete. */
      opts.fieldGain = mopts.fieldGain ?? 1
      // set here rather than in venomBus for the same reason as fieldGain: the
      // bus fires when the section is picked, the raster arrives a load later
      opts.smoke = mopts.smoke ?? 0
      /* What the outgoing cloud was standing at when it was told to leave. The
         outgoing track used to ramp from zero over its first 160ms, which was
         right when a settled mark was drawn entirely by the field and the cloud
         genuinely started from nothing. Now that an arrived cloud holds, a mark
         leaving the hall was at full and a photographic one at 0.58 — ramping
         them from zero blanked the screen for 160ms, and the field, refilling
         behind them, filled the hole with the OLD mark's raster. */
      restOut = 1 - fieldHold
      dollyStage = mopts.corridor ? (opts.dolly ?? 0) : 0
      markScale = mopts.markScale ?? opts.markScale ?? 0.60
      fans = mopts.fans ?? null
      if (texB !== texA) gl.deleteTexture(texB)
      texB = next
      morph.loading = false
      morph.running = true
      morph.t = 0
      morph.url = url
    })
  }

  function stepMorph(dt) {
    if (!morph.running) { morph.spike = 0; return 0 }
    morph.t += dt / morph.dur
    let m = Math.min(1, morph.t)
    m = m * m * (3 - 2 * m)                  // smoothstep
    morph.spike = Math.sin(Math.pow(m, 0.72) * Math.PI)   // quick apart, slow together
    if (morph.t >= 1) {
      // the new mark becomes the base; both units read it until the next morph
      if (texA !== texB) gl.deleteTexture(texA)
      texA = texB
      morph.running = false
      morph.spike = 0
      const p = morph.pending
      morph.pending = null
      if (p) setMark(p[0], p[1])
      return 0
    }
    return m
  }

  /* ── formation ──
     The substance arrives dispersed and condenses into the mark, so the first
     thing the page does is deform itself into the bull.

     `spread` drives the same displacement uniforms the morph spike uses — the
     intro and a mark change are deliberately the same gesture — and decays to
     zero as the silhouette gathers. `grip` then holds the mark fully settled
     for a beat so it reads clearly before the breathing envelope takes over,
     which is what stops the bull from loosening again the moment it lands. */
  const FORM_DUR = 3.0
  const GRIP_DUR = 2.4
  let formT = 0
  let gripT = 0

  function stepFormation(dt) {
    if (formT < 1) {
      formT = Math.min(1, formT + dt / FORM_DUR)
      const p = formT * formT * (3 - 2 * formT)
      return { spread: (1 - p) * (1 - p), grip: p }
    }
    if (gripT < 1) gripT = Math.min(1, gripT + dt / GRIP_DUR)
    const g = gripT * gripT * (3 - 2 * gripT)
    return { spread: 0, grip: 1 - g }
  }

  let W = 1, H = 1
  function resize() {
    const r = canvas.getBoundingClientRect()
    W = Math.max(1, Math.round(r.width))    // dpr 1 — deliberate
    H = Math.max(1, Math.round(r.height))
    canvas.width = W
    canvas.height = H
    gl.viewport(0, 0, W, H)
  }
  resize()
  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
  if (ro) ro.observe(canvas)
  else addEventListener('resize', resize, { passive: true })

  const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, moved: false }
  function onMove(e) {
    const r = canvas.getBoundingClientRect()
    mouse.tx = (e.clientX - r.left) / r.width
    mouse.ty = 1 - (e.clientY - r.top) / r.height
    mouse.moved = true
  }
  const onTouch = (e) => { if (e.touches?.[0]) onMove(e.touches[0]) }
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('touchmove', onTouch, { passive: true })

  /* `reduced` governs AMBIENT motion — the idle drift, the swell, the clock.
     It does not govern the substance's answer to the cursor and the tap.
     Reduced motion asks that nothing move on its own; it does not ask for a
     dead surface under the user's own hand, and pinning uMouse to 0.5 was
     reading as "the venom is broken" on every machine with the OS switch on.
     Direct response is a reply to an action the user just took, so it stays. */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let last = performance.now() / 1000
  let elapsed = 0
  let appear = 0
  let alive = true
  let tight = opts.tighten ?? 0    // eased per-mark hold, see frame()

  function onScreen() {
    const r = canvas.getBoundingClientRect()
    return r.bottom > 0 && r.top < (window.innerHeight || 800)
  }

  /* Breathing. Long, mutually prime periods so the substance never repeats,
     plus a slow settle window that lets the mark read clearly before it
     loosens again. Nothing snaps. */
  function envelope(t) {
    let s = 0.5 + 0.5 * Math.sin((t / 31.0) * Math.PI * 2 - Math.PI / 2)
    s = s * s * (3 - 2 * s)
    return {
      /* Floored, not 0→1. Fully loose drives uComplexMix past the point where
         the displacement is the size of the mark itself, and the bull stops
         being a bull — the substance has to keep deforming *toward* the logo,
         so the loose end of the breath still holds the silhouette. */
      settle: 0.45 + 0.55 * s,
      d1: Math.sin(t / 17.0 * Math.PI * 2),
      d2: Math.sin(t / 23.0 * Math.PI * 2),
      d3: Math.sin(t / 13.0 * Math.PI * 2)
    }
  }

  const fanBuf = [new Float32Array(4), new Float32Array(4)]
  function fanUniform(i) {
    const f = fans?.[i]
    const out = fanBuf[i]
    if (!f) { out[0] = out[1] = out[2] = out[3] = 0; return out }
    const h = markScale / markRatio        // the mark's height in texture space
    out[0] = 0.5 + (f[0] - 0.5) * markScale
    out[1] = 0.5 - (f[1] - 0.5) * h        // texture is uploaded flipped
    out[2] = f[2] * markScale
    out[3] = f[3]
    return out
  }

  function frame() {
    if (!alive) return
    requestAnimationFrame(frame)

    const now = performance.now() / 1000
    let dt = now - last
    last = now
    if (!onScreen()) return
    if (dt > 0.05) dt = 0.05
    if (opts.fixedStep) dt = 1 / 60
    elapsed += dt

    const k = 1 - Math.pow(0.01, dt)
    if (mouse.moved) {
      mouse.x += (mouse.tx - mouse.x) * k
      mouse.y += (mouse.ty - mouse.y) * k
    } else {
      mouse.x = 0.5 + 0.13 * Math.sin(elapsed * 0.11)
      mouse.y = 0.54 + 0.10 * Math.cos(elapsed * 0.083)
    }

    if (ready) appear += dt
    const fade = opts.instant ? (ready ? 1 : 0) : Math.min(1, appear / 1.1)

    // ease toward whatever the current view asks for, ~0.55s to settle —
    // shared by view.fit/ox/oy/opacity below and by settleEased above them
    const vk = 1 - Math.pow(0.004, dt)

    const e = envelope(elapsed)
    const m = stepMorph(dt)
    // formation only advances once the mark is rasterised, otherwise the
    // substance would condense around an empty texture and arrive already flat
    const form = stepFormation(ready ? dt : 0)

    let settle = reduced ? 1 : Math.max(e.settle, form.grip)
    if (opts.settleOverride != null) {
      settleEased += (opts.settleOverride - settleEased) * vk
      settle = settleEased
    } else {
      settleEased = settle   // stay synced so the next pin starts from here, not stale
    }

    /* ── one term for "a change is on screen", and it subtracts ──
       This used to be `spike`, and every distorting uniform below was multiplied
       UP by it: grain ×(1+0.9·spike), channel shift ×(1+0.8·spike), ripple
       +0.10·spike, stretch, split, pulse. So the loudest the field ever warped
       and the loudest it ever separated its channels was precisely mid-change —
       and the channel shift is a per-channel offset of the sampling UV, which
       means the mark visibly changes colour while it is changing shape. That is
       the complaint, in one line of arithmetic.

       The sign is reversed. `quiet` is 1 at rest, where every number below is
       exactly the value it was tuned at, and 0 at the peak of a change, where
       the field contributes nothing at all — no grain, no channel separation, no
       ripple, no stretch. What carries a change is the grains and only the
       grains. Formation counts 1.35× so the intro reaches full quiet too. */
    const change = Math.min(1, Math.max(morph.spike, form.spread * 1.35))
    const quiet = 1 - change

    /* Per-mark hold. The bull is a big simple silhouette and survives the full
       displacement — a product render does not. A GPU is only recognisable by
       its small features (the blower ring, the bracket ports, the PCIe
       fingers), and the ripple alone moves UVs by a sixth of the mark, which
       wipes every one of them out. `tighten` scales back the two terms that
       actually smear geometry and leaves the grain and channel shift alone, so
       the substance still looks like the substance.

       Eased rather than applied outright: setMark switches it the instant a
       category is picked, and a step change reads as the mark snapping. */
    tight += ((opts.tighten ?? 0) - tight) * (1 - Math.pow(0.02, dt))

    /* The dolly. One wheel step is +0.24 of the hall's depth span, eased at
       0.10^dt — time constant 0.43s, 90% of the way in 1.0s, which is what
       STAGE_LOCK_MS is set against.

       The numbers that matter are screen speeds, and they are a spread, not a
       value. Peak rate is 0.24·ln10 = 0.553 cycles/s, the span is 2.408 in log
       radius and fit is 0.31, so a grain's screen speed is 1716·|x| px/s at the
       instant the step fires: 858 px/s on the near wall as it leaves the frame,
       429 px/s at mid depth where the eye actually reads, and 77 px/s at the
       vanishing point. An 11:1 spread across one image is what parallax is, and
       it is what a zoom of a raster cannot do — a zoom moves every texel of one
       frame on one matrix, so the ratio between fastest and slowest is fixed by
       the geometry of the frame and nothing in it can ever have its own depth.

       The drift underneath never stops: 0.030 cycles/s, one full pass of the
       hall every 33s, so between wheel steps the structure is still walking
       rather than parked. */
    dollyStage += ((opts.dolly ?? 0) - dollyStage) * (1 - Math.pow(0.10, dt))
    dollyDrift += dt * 0.030 * corrIn
    /* How much of the continuous field this mark wants behind it. 1 for the
       marks the shader was tuned against, 0.42 for the photographic ones — their
       recognisability lives in features the rest ripple smears by about a stroke
       width, and the grains render them exactly — and 0 for the hall, which the
       field cannot draw at all. Eased over ~0.75s so a section change does not
       step it. */
    const fhWant = opts.fieldGain ?? 1
    /* Asymmetric on purpose: the field may leave at any moment, but it may not
       come back until the change is over. Gating the rise on `quiet` was not
       enough — quiet is 1 at m = 0, so on the frame a mark change started the
       field rose at full rate while its two texture units still held the OLD
       mark, and a warped, rippling copy of the corridor flashed for ~250ms at
       the head of every exit from the hall. morph.running is the honest gate. */
    fieldHold += (fhWant - fieldHold) * (1 - Math.pow(0.05, dt))
      * (fhWant > fieldHold ? (morph.running ? 0 : 1) : 1)

    gl.useProgram(prog)
    /* WebGL1 has no VAOs here: the particle pass rewrites attribute 0's buffer
       and pointer, so the fullscreen triangle has to reclaim them every frame
       rather than relying on the binding made at init. */
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texA)
    gl.uniform1i(U.uTexture, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, texB)
    gl.uniform1i(U.uTexture2, 1)
    gl.uniform1f(U.uMorph, m)

    gl.uniform2f(U.uResolution, 1.0, H / W)
    /* Under reduced motion the pointer still drives the field — only the idle
       drift that runs when nothing has touched the page is held at centre. */
    const mIdle = reduced && !mouse.moved
    gl.uniform2f(U.uMouse, mIdle ? 0.5 : mouse.x, mIdle ? 0.55 : mouse.y)
    /* ── reduced motion is a still frame, not a slower one ──
       It used to only skip the particle layer and force settle to 1, and left
       uTime, uMouse, uPulse and the tap running: the field kept rippling, the
       hash kept crawling and the channel shift kept separating, so a visitor who
       asked for no motion got the field's full distortion animating under a
       corridor the particle layer was no longer allowed to draw. Freezing the
       clock and the cursor makes every displacement below a constant, and the
       cloud is drawn settled instead of skipped, so the image is the same one
       everyone else ends on — it simply never moves. */
    gl.uniform1f(U.uTime, reduced ? 6.0 : elapsed * 0.5)
    gl.uniform1f(U.uAspect, W / H)
    /* ── the view travels inside the blackout, not across the screen ──
       While a change runs, the view is not eased: it is carried from geomFrom
       to the section's target on the morph's own clock, through a window that
       opens at m 0.15 and closes at m 0.60. That window is chosen against
       uMarkGain below, which is the field's own drain curve: at m 0.15 the
       field is printing 12% of its ink and at m 0.60 about 3%, so every pixel
       of the travel happens while the continuous layer is not on screen. What
       the viewer sees is the cloud coming off its targets in the old frame and
       gathering onto them in the new one — the figure never slides.
       Outside a change the original ease still runs, unchanged, so nothing that
       was tuned against it (opacity pins, the first layout after mount) moves
       differently than it did. */
    if (geomMoving && morph.running) {
      let g = Math.min(1, Math.max(0, (m - 0.15) / 0.45))
      g = g * g * (3 - 2 * g)
      view.fit = geomFrom.fit + ((opts.fit ?? 0.40) - geomFrom.fit) * g
      view.ox = geomFrom.ox + ((opts.offsetX ?? 0) - geomFrom.ox) * g
      view.oy = geomFrom.oy + ((opts.offsetY ?? -0.07) - geomFrom.oy) * g
      view.opacity = geomFrom.opacity + ((opts.opacity ?? 1) - geomFrom.opacity) * g
      if (g >= 1) geomMoving = false
    } else {
      geomMoving = false
      view.fit += ((opts.fit ?? 0.40) - view.fit) * vk
      view.ox += ((opts.offsetX ?? 0) - view.ox) * vk
      view.oy += ((opts.offsetY ?? -0.07) - view.oy) * vk
      view.opacity += ((opts.opacity ?? 1) - view.opacity) * vk
    }
    tap.t += dt

    gl.uniform1f(U.uFit, view.fit)
    gl.uniform2f(U.uOffset, view.ox, view.oy)
    // the tap ring is the answer to a click — it never runs unasked, so it
    // survives reduced motion intact
    gl.uniform3f(U.uTap, tap.x, tap.y, tap.t)
    gl.uniform1f(U.uShiftSize, 1.0)
    gl.uniform1f(U.uRippleSpeed, 1.0)
    gl.uniform1f(U.uWaveFrequency, 8.0)
    gl.uniform1f(U.uSaturation, opts.saturation ?? 0.30)
    gl.uniform1f(U.uCeil, opts.ceil ?? 1.10)
    gl.uniform1f(U.uFloor, opts.floor ?? 0.22)
    gl.uniform1f(U.uShimmer, opts.shimmer ?? 0.07)
    /* Both hard zero. uStretch scaled the sampling window anisotropically and
       uSplit slid its two halves apart — they operate on the window, so every
       texel of the mark moved on one shared matrix. That is the definition of a
       whole frame moving, and at 0.42 of split the mark travelled 0.084 uv, 111
       screen px at fit 0.31, as one piece. Nothing in a change moves as one
       piece any more. */
    gl.uniform1f(U.uStretch, 0)
    gl.uniform1f(U.uSplit, 0)
    /* The idle swell stays — it is what keeps a settled mark off the page as a
       still image — but its mid-change boost is gone with the rest, and it is
       damped by `quiet` so the last thing the field does before handing over is
       stop moving rather than move hardest. */
    const pulse = reduced ? 0 : (0.34 + 0.30 * Math.sin(elapsed * 0.42)) * fade * quiet
    gl.uniform1f(U.uPulse, pulse)
    gl.uniform2f(U.uOffsetCentre, view.ox, view.oy)

    fanMix += ((fans ? 1 : 0) - fanMix) * (1 - Math.pow(0.02, dt))
    gl.uniform1f(U.uFanMix, fanMix)
    gl.uniform4fv(U.uFanA, fanUniform(0))
    gl.uniform4fv(U.uFanB, fanUniform(1))

    /* Settled → the mark tightens; loose → the substance takes over.
       Ranges stay near the tuned values: push uComplexMix much past 0.06 and
       the displacement grows to the size of the mark itself, which shreds the
       silhouette instead of disturbing it. */
    /* the morph spike loosens the substance mid-transition, so the old
       silhouette shreds into noise and the new one condenses out of it */
    const hold = 1 - 0.85 * tight     // geometry-smearing terms only

    /* Every displacement below is written in texture space, but what the eye
       judges is screen pixels — and uv-per-pixel is view.fit. So the closer the
       view gets, the coarser the same numbers read: at fit 0.153 the ±0.014uv
       hash jitter lands as 33 screen px, three times the rack pitch it is meant
       to be disturbing, and the corridor arrived as flat grey. Scaling by fit
       holds the disturbance at a constant size on screen instead of a constant
       size in the texture. Clamped so the sections tuned at fit 0.32-0.40 move
       by at most a fifth, and the reference stays where it was set. */
    const zoom = Math.min(1.15, Math.max(0.34, view.fit / 0.40))

    /* ── material and geometry are now two different kinds of number ──
       They used to be tangled, and that is the whole of the complaint. `tighten`
       and `quiet` were applied to everything at once, so a mark that needed its
       geometry protected also lost its grain and most of its colour, and the
       peak of every change lost all three. Measured on screen: the bull prints
       rms(R−B) 0.059 across its ink, a photographic mark 0.021, the hall 0.018.
       Three different substances on one site.

       Below the line is the MATERIAL — what the substance is made of. Grain,
       channel separation, the floor, the saturation, the shimmer. Every one of
       them is now the same number on every mark, at rest and mid-change, and
       nothing is allowed to touch them. The venom does not change its colour,
       its grain or its nature when it changes shape; it only changes shape.

       Above the line is the GEOMETRY — how far the substance is allowed to move
       off the shape it is holding. That is what `hold` (per-mark) and `quiet`
       (per-phase) legitimately scale, because how much a thing wobbles is not
       what it is made of.

       What protects a photographic silhouette now, since it is no longer the
       grain and the colour being turned down: `hold`, which still cuts the
       ripple and the wave to 15% on a card, and `fieldGain`, which hands 58% of
       that mark's ink to the grain cloud — and a grain sits exactly on its
       target, so the rack rows and the eye line are rendered by something no
       displacement can smear. The field's share is a haze of the right material
       around a shape drawn by the grains, which is what "amount, not kind"
       means here. */
    /* ── the distortion comes down, and only the distortion ──
       Asked for directly: "сбавь искажение текущего венома". The three terms
       below are the geometry — how far the substance is allowed to travel off
       the shape it holds — and each is cut by about a fifth: wave 0.128 → 0.100
       (−22%), ripple 0.56 → 0.46 (−18%), complex 0.055 → 0.044 (−20%).

       Nothing else moves, and that is the other half of the same instruction:
       "НЕ МЕНЯЙ текущую структуру и оттенки у венома с быком". The structure is
       uGrainIntensity — the hash warp that makes the mass grainy — and the
       shades are uShiftIntensity, the channel separation the warm sand and cool
       lavender are made of. Both are untouched below the material line. The
       bull keeps its grain, its colour and its silhouette; it only wobbles a
       fifth less. Reducing grain or shift instead would have changed exactly
       the two things the client fenced off.

       There is a second reason the cut has to happen on this revision rather
       than any other: the grain cloud now rides these same three terms, so
       before this change the mark carried them once (on the sheet) and now it
       carries them on both layers at once. Left at the old numbers the marks
       would read as MORE disturbed than they were, not less. */
    const waveSpeed = 0.30 + 0.020 * e.d1
    const waveAmp = ((0.100 - 0.033 * settle) + 0.006 * e.d2) * hold * zoom * quiet
    const rippleMix = (0.46 - 0.115 * settle) * hold * quiet
    const complexMix = (0.044 - 0.038 * settle) * quiet
    gl.uniform1f(U.uWaveSpeed, waveSpeed)
    gl.uniform1f(U.uWaveAmplitude, waveAmp)
    gl.uniform1f(U.uRippleMix, rippleMix)
    gl.uniform1f(U.uComplexMix, complexMix)

    // ── material, invariant ──
    const grainAmp = ((0.068 - 0.014 * settle) + 0.005 * e.d3) * zoom
    /* The colour term: r, g and b are sampled at three cumulative diagonal
       offsets, so this uniform IS the RGB separation. At the reference fit 0.34
       it puts the red tap 20 screen px and the blue tap 64 px off the green —
       a displacement, not a dither, which is why the split reads as coherent
       warm and cool sides of a shape rather than as noise. */
    const shiftAmp = (0.024 - 0.007 * settle) * zoom
    gl.uniform1f(U.uGrainIntensity, grainAmp)
    gl.uniform1f(U.uShiftIntensity, shiftAmp)
    gl.uniform1f(U.uFade, fade * view.opacity)

    /* The handover, now complete rather than partial. The old law left 0.12 of
       the field's density standing at the peak and that residue was carrying the
       full mid-change grain and channel shift — a faint, warped, colour-split
       copy of the mark laid over the grains, which is the "second layer / frames
       laid over each other" read. It goes to a true zero.

       The reason it did not before was the pixel field: pixelField.js downscales
       this canvas every frame to decide where the substance stands, and a white
       frame there reads as the substance having left the page. It no longer sees
       white — the grains are drawn into this same canvas, 86 400 of them at
       2.2-4.5 device px, and measured at the peak of a change they hold the dot
       lattice at a mean ink well above its 0.02 gate. The presence signal is the
       grains now, which is also the honest answer: that is where the substance
       actually is.

       Exponent 0.55 rather than linear so the field is out of the way early: at
       change 0.30 it is already down to 0.49, at 0.60 to 0.25. The peak sits at
       m = 0.383 of the morph, 0.92s in. */
    const markGain = (reduced ? 1 : Math.max(0, 1 - Math.pow(change, 0.55))) * fieldHold
    gl.uniform1f(U.uMarkGain, markGain)

    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    /* ── the clouds ──
       Drawn over the field, never instead of it. Two draw calls at worst, both
       against static buffers: the physics is a closed form of uPhase, so there
       is nothing to step on the CPU and nothing to read back.

       ── the arrived cloud no longer leaves ──
       It used to: the incoming track faded to zero 2.38s in, the field came back
       to full, and the settled mark was a continuous sheet again. Sampled frame
       by frame through a bull→card change, the two frames where the grains were
       carrying the shape on their own were the sharpest in the whole gesture and
       the settled frames after them were the softest — the field's rest ripple
       and hash warp smear a mark by roughly a stroke width, which is exactly
       what "the picture looks distorted" means. Keeping the grains at REST_ALPHA
       puts a hard 2.2px structure over that smear permanently, and the 22% of
       micro-jitter that survives at rest means it is a structure that breathes
       at ~1.8px rather than a still overlay. It also makes the settled state and
       the transition the same material, which is the whole claim.

       The rest level is exactly the complement of the field: 1 − fieldHold. The
       two layers trade places on one number and their total ink is conserved, so
       nothing doubles and the tuned floor holds. It also means the marks tuned
       before this layer existed are untouched — they run fieldGain 1, so their
       cloud still fades to nothing and their settled frame is the field's, to
       the pixel. Only the marks that ask the field to step back get grains at
       rest: 0.58 on the three photographic ones, 1.00 on the hall. */
    const holdHall = corrIn > 0.002
    if (pl && (P.t < 3.2 || P.in)) {
      if (P.t < 3.2 && !reduced) P.t += dt
      const TL = P.kind === 'form' ? TL_FORM : TL_MORPH
      /* Grain size follows the view, but on a square root: a fixed screen grain
         leaves visible gaps between targets once the mark is magnified past
         fit 0.2, and a grain that scales linearly with the zoom reads as the
         whole substance changing resolution. */
      /* 1.75 base against the old 1.90, because the grain is a hard dot now and
         a hard dot at a given radius covers more than a feathered one of the
         same radius. At the default fit 0.40 this draws a 2.2 device px point.

         2.02 now, and the reason is coverage rather than size. Measured as
         per-pixel high-frequency energy against a 3x3 mean, the bull prints
         0.075 and a mark carried mostly by grains printed 0.102 — a third more
         texture, from the same substance, because 2.2px dots at this pitch do
         not quite touch and every gap between them is a step to paper. The
         bull's mass is continuous and the cloud's was perforated: same tone,
         same colour, different material at arm's length. 2.02 closes the gaps
         and the rest level below comes down to compensate, so the ink is
         unchanged and only its distribution is. */
      const grainSize = (f) => 2.02 * Math.min(1.90, Math.max(0.85, Math.sqrt(0.40 / f)))
      const base = {
        aspect: W / H, fit: view.fit, ox: view.ox, oy: view.oy,
        // a frozen clock stops the per-grain micro-jitter dead
        time: reduced ? 0 : elapsed, size: grainSize(view.fit), amp: 1,
        /* ── the material, handed straight down ──
           Not a second set of tuned numbers: the same three the field is running
           on this frame. `ink` is the field's floor, so a dense mass of grains
           converges to exactly the tone the field's densest region prints at and
           no darker. `chroma` is the field's channel tap, scaled by uCeil
           because that is what `c` saturates to over the mark, so the cloud
           fringes in register with the sheet rather than beside it. `shimmer` is
           the field's own drift amplitude. Whatever these are for the bull, they
           are for the hall. */
        ink: opts.floor ?? 0.22,
        /* The field's channel tap, scaled by uCeil because that is what `c`
           saturates to over the mark, so the cloud fringes in register with the
           sheet rather than beside it.

           Flat, and deliberately not compensated for the field's absence. That
           was tried: mid-gesture the field drains and takes its share of the
           channel separation with it, so the cloud's share was scaled up by
           (1 + 0.85·change) to hold the sum. It does not hold the sum, because
           the deficit and the compensation peak at different instants — the
           thin window is early, at 0.5s, where the outgoing cloud has not
           finished fading up, while `change` peaks at 0.9s where the cloud is
           already at full ink. Measured, it turned a dip to rms(R−B) 0.029 into
           a bulge to 0.107 against a rest of 0.052: twice the colour, in the
           middle of the change, which is the artefact this whole revision is
           about. The honest reading is that the substance is genuinely thinner
           for about 200ms while it is coming apart, and thinner substance is
           allowed to print less of everything as long as it prints the same
           ratios — which, flat, it does. */
        chroma: shiftAmp * (opts.ceil ?? 1.10),
        shimmer: opts.shimmer ?? 0.07,

        /* ── and the field's displacement, on the same frame ──
           This is the block that answers "картинки как будто ВНЕ самого
           венома". Every value here is the one the fragment shader was handed
           twenty lines above; none of them is retuned for the cloud. Grains and
           sheet are now moved by one function, so a tap deforms a photographic
           mark exactly as hard, exactly as fast and exactly in the same
           direction as it deforms the bull — which is the behaviour the client
           pointed at as the correct one.

           `hold` is already inside waveAmp and rippleMix, so a mark with
           tighten 0.86 hands its grains 30% of the ripple, the same 30% its
           sheet gets. The tap is deliberately outside `hold`, in both layers,
           for the same reason it always was: a tap is the viewer touching the
           substance and it is allowed to reach everything. */
        warp: 1,
        mx: mIdle ? 0.5 : mouse.x, my: mIdle ? 0.55 : mouse.y,
        cx: view.ox, cy: view.oy,
        waveSpeed, waveAmp, waveFreq: 8.0,
        rippleSpeed: 1.0, rippleMix, complexMix,
        stretch: 0, split: 0, pulse,
        tapX: tap.x, tapY: tap.y, tapT: tap.t,
        fanA: fanUniform(0), fanB: fanUniform(1), fanMix,
        /* The edge treatment is per mark, not global: it needs the faint halo
           prep leaves around an object to have something to dissolve INTO, and
           the bull's own raster has no halo — its silhouette is the mark. */
        smoke: reduced ? 0 : (opts.smoke ?? 0)
      }
      const smooth = (u) => u * u * (3 - 2 * u)
      /* The sixth column is the frame each cloud is drawn in. The one leaving
         holds geomOut for its whole exit; the one arriving is drawn in the
         view, which is already the new frame by the time it fades up. Same
         formula for the grain, read at each cloud's own fit, so neither of them
         changes size or pitch. */
      for (const [set, k, geom, rest, from, gv] of [
        // the outgoing cloud does go to zero — it is the mark that left
        [reduced ? null : P.out, TL.out, corrOut, 0, restOut, geomOut],
        /* The hall holds at full: it is a section, not a transition.
           1.35, not the strict complement of the field. The complement conserves
           ALPHA, and what has to be conserved is INK: the field covers every
           pixel it stands on, a cloud of 2.2px dots covers about three quarters
           of the area it stands on and blends the rest toward paper. Measured at
           the same view, a mark drawn 42% by the field printed its densest
           region at luminance 0.36 against the bull's 0.31 — the same colour and
           the same grain, but visibly thinner material. 1.35 is the coverage
           deficit, and it lands the two on 0.32. Clamped at 1, which is where
           the hall already was. */
        [P.in, TL.in, corrIn, Math.min(1, (1 - fieldHold) * 1.05), 0, view]
      ]) {
        if (!set || !k) continue
        base.fit = gv.fit
        base.ox = base.cx = gv.ox
        base.oy = base.cy = gv.oy
        base.size = grainSize(gv.fit)
        base.phase = reduced ? 1 : seg(P.t, k.m0, k.m1)
        base.mode = k.mode
        // arrival ramp, then a tail that lands on `rest` instead of on nothing
        // `from` is where this track starts (the level it was already holding at)
        // and `rest` where it lands; the ramp only covers the distance between.
        base.alpha = (reduced ? rest
          : (from + (1 - from) * smooth(seg(P.t, k.a0, k.a1)))
            * (1 - smooth(seg(P.t, k.a2, k.a3)) * (1 - rest)))
          * fade * gv.opacity
        base.corridor = geom
        // the hall is generated in perspective; a uv-space ripple laid over a
        // projection is a broken projection, not a wobble
        base.warp = 1 - geom
        base.smoke = (reduced ? 0 : (opts.smoke ?? 0)) * (1 - geom)
        base.dolly = dollyStage + dollyDrift
        pl.draw(set, base)
      }
    }
  }
  requestAnimationFrame(frame)

  return {
    destroy() {
      alive = false
      ro?.disconnect()
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onTap)
      removeEventListener('touchmove', onTouch)
      for (const s of sets.values()) pl?.free(s)
      sets.clear()
    },
    set(key, value) { opts[key] = value },
    setMark
  }
}
