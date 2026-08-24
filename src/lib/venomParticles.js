/**
 * VENOM — the particle layer.
 * ─────────────────────────────────────────────────────────────────────────
 * The fragment shader in venom.js moves a *sampling window* over a continuous
 * density field. Whatever you do to it, the material travels as a sheet: it
 * shears, it tears, it never comes apart into grains, because there are no
 * grains to come apart into. That is the whole reason a mark change read as a
 * warp and not as an assembly.
 *
 * This is the missing half. The same density texture that feeds the shader is
 * also read as a *spawn map*: cells are sampled in proportion to their density,
 * so a particle exists where there is ink and nowhere else. Each particle keeps
 * three things — its target in texture space, a seed, and how much fine detail
 * its neighbourhood carries.
 *
 * Everything else is analytic. There is no integration, no state texture, no
 * ping-pong FBO: position is a closed-form function of one progress uniform, so
 * the whole cloud is a single draw of GL_POINTS with a static vertex buffer.
 * That is what keeps a 71k-particle assembly under a millisecond and lets the
 * transition be scrubbed, paused and replayed without drift.
 *
 * ── detail priority ──
 * `sharp` is the local high-pass energy of the density map: the difference
 * between the map at 256² and the same map blurred down to 64² and back. It is
 * high exactly where a mark is only recognisable by small features — the
 * glasses and the eye line of the portrait, the blade pitch of the card, the
 * rack rows of the containers — and near zero across flat mass.
 *
 * Three things answer to it, and together they are what stops the key zones
 * turning to porridge at peak turbulence:
 *   1. order   — detail arrives first and leaves last, so the structure of the
 *                shape is present for the longest possible part of the gesture;
 *   2. travel  — detail scatters 0.14 uv, flat mass 0.32, so the fine geometry
 *                never leaves its own neighbourhood;
 *   3. residual— the turbulence that survives near the target is 0.010 uv on
 *                detail against 0.038 on flat mass.
 *
 * None of that knows anything about faces. It is derived from the map, so it
 * generalises to any mark handed to it.
 */

/* The density map is resampled to this, and every cell is a possible spawn.

   ── 384, up from 256 ──
   256² is 65 536 cells and the cloud is 86 400 grains: more grains than cells,
   so the grid, not the artwork, was setting the resolution of every mark. One
   cell was 4 source px of the 1024² raster, which means no feature thinner than
   4 px could exist in a spawn map at all — and the two drawings among the marks
   are line art whose contours are 2-3 px at 1024. The card's fan blades, its
   bracket ports and the container rack rows were being averaged out of the map
   before a single particle was placed, and no amount of work in prep could put
   them back. That is why the graphics card kept arriving as a mass.

   384² is 147 456 cells at 2.67 px per cell, so a 3 px contour survives as a
   cell of its own. Cost is 2.25x of a pass that was measured at 1.9 ms, and it
   is paid inside a requestIdleCallback with a 400 ms budget, once per mark,
   cached by url afterwards — not on the frame the section changes. */
const GRID = 384
/* and to this, which is what "the shape without its detail" means here.
   Held at GRID/4, the ratio the high-pass was tuned on. */
const COARSE = 96
/* below this density a cell is ground, not substance */
const FLOOR = 0.055

const VERT = `
precision highp float;
attribute vec2  aTarget;   // where this grain belongs, in texture space
attribute vec2  aSeed;     // two decorrelated randoms
attribute vec2  aMeta;     // x = sharp 0..1, y = local density 0..1
/* the signed density slope along the field's own tap axis — see vTint */
attribute float aGrad;

uniform float uAspect;
uniform float uFit;
uniform vec2  uOffset;
uniform float uTime;
uniform float uPhase;      // 0..1 across this set's motion window
uniform float uMode;       // 1 assemble, 0 disperse
uniform float uAlpha;
uniform float uAmp;        // global scatter scale
uniform float uSize;
uniform float uCorridor;   // 0 the mark lies flat, 1 it is a hall seen down its axis
uniform float uDolly;      // forward travel, in cycles of the hall's depth span

/* ── the material, handed down from the field ──
   These three are not particle-layer settings. They are the field's own numbers,
   passed straight through, and they are what makes a mark drawn by grains the
   same substance as a mark drawn by the sheet.

   uInk is the field's uFloor. The field can never print darker than its floor —
   that is the whole reason overlaid text stays legible — and the grains used to
   ignore it and print at 0.175 against a floor of 0.34, so every mark the cloud
   carried was half again as dark as the bull. Alpha blending of a constant tone
   converges to that tone, so setting the grain to the floor makes a dense mass
   land exactly where the field's densest region lands and no darker.

   uChroma is the field's channel separation, in the same uv units the field
   states it in. What it drives here is NOT a displacement, and that distinction
   was measured rather than assumed: the first attempt drew the cloud three
   times, once per channel, each pass offset by the tap the field uses — the
   identical operation. On a continuous sheet three taps 45 px apart agree
   everywhere except within 45 px of an edge, so the sheet is grey in its
   interior and coloured only at its boundary. On a lattice of 2.5 px dots with
   gaps between them the three copies never land on each other at all, so every
   single grain came out pure red, pure green or pure blue. Measured: rms(R−B)
   0.474 on the hall against the bull's 0.059, saturation 0.52 against 0.041.
   A confetti field, and correct arithmetic. See vTint for what replaced it.

   uShimmer is the field's drift amplitude, verbatim. */
uniform float uChroma;
uniform float uInk;
uniform float uShimmer;

/* ── the substance's own displacement, handed down verbatim ──
   This is the fix for "the pictures are OUTSIDE the venom". Until now this
   layer received uAspect/uFit/uOffset/uTime and three material numbers, and not
   one of the terms that make the venom a living thing: no ripple, no wave, no
   tap, no stretch, no split, no pulse. Grep it in the old file and the count is
   zero. So a mark drawn 58% by grains was 58% a static print — the field around
   it rippled when the pointer moved and when the surface was tapped, and the
   grains sitting on top of it did not move at all. That is not a palette
   mismatch or a tone mismatch, both of which were already equalised and both of
   which the client rejected. It is two different materials sharing a frame.

   Every uniform below is the SAME NUMBER the fragment shader is running on this
   frame — not a second, parallel set of tuned values. hold (per-mark tighten)
   and quiet (per-phase) are already folded into them on the JS side, so a
   mark that protects its geometry protects it in both layers by the same
   factor, automatically. */
uniform float uWarp;          // 0 the grain sits on its target, 1 it rides the field
uniform vec2  uMouse;
uniform vec2  uOffsetCentre;
uniform float uWaveSpeed;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uRippleSpeed;
uniform float uRippleMix;
uniform float uComplexMix;
uniform float uStretch;
uniform float uSplit;
uniform float uPulse;
uniform vec3  uTap;           // xy where, z how long ago
uniform vec4  uFanA;
uniform vec4  uFanB;
uniform float uFanMix;
uniform float uSmoke;         // how hard the silhouette dissolves at its edge

varying float vAlpha;
varying vec3  vTint;

/* ── no noise fields here, on purpose ──
   This layer used to displace every grain along a curl-noise flow. A curl field
   is divergence-free in the continuous limit, but the map p -> p + k*curl(p) is
   not area-preserving for any finite k: it compresses grains onto the ridges of
   the field. With the old soft 8px sprites that compression was smeared into a
   smooth cloud and read as tendrils. With the hard 2px dots this layer draws
   now, it reads as exactly what it is — a caustic web of dark filaments over
   the mark, which is the artefact this revision exists to remove.

   Every term below is instead a closed form of aSeed, so no two neighbouring
   grains share a vector and no density structure can form in the cloud at all.
   It is also five snoise evaluations per vertex cheaper. */

const float TAU = 6.2831853;

/* The field's own hash and value noise, copied verbatim rather than
   approximated: the shimmer that drifts across the field's dense mass has to be
   the same drift, on the same clock and at the same spatial scale, or the two
   halves of the substance breathe out of step. */
float hash12(vec2 p){
  float h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

/* ── the field's displacement chain, transcribed ──
   Line for line the same as main() in venom.js: pulse ring, tap ring, stretch,
   split, fan spin, ripple, complex wave, applied in that order and with the
   same constants. If either copy is edited the other has to be edited with it;
   they are one function that has to live in two shaders because one runs per
   fragment and the other per vertex.

   ── what is deliberately NOT here: the hash grain ──
   The field also warps its sampling uv by (hash − 0.5) · c · uGrainIntensity,
   which at uCeil 1.10 and uGrainIntensity 0.068 is ±0.037 uv — 49 screen px at
   the reference fit 0.34. On a continuous sheet that is the grain: neighbouring
   fragments read the density a random 49 px away and the mass comes out
   textured. Applied to a grain it would not be texture, it would be the shape
   being scattered by a third of its own width. The cloud's equivalent of the
   hash is the 2.2 px dot lattice it is made of and the per-grain micro-jitter
   below, which is the same idea rendered by the right mechanism. */
vec2 spin(vec2 uv, vec4 fan){
  if (fan.z <= 0.0 || uFanMix <= 0.0) return uv;
  vec2 d = uv - fan.xy;
  float k = smoothstep(fan.z, fan.z * 0.90, length(d)) * uFanMix;
  if (k <= 0.0) return uv;
  float a = mod(uTime * fan.w * 6.2831853, 6.2831853) * k;
  float s = sin(a), c = cos(a);
  return fan.xy + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

vec2 fieldUv(vec2 uv){
  vec2 centre = vec2(0.5) + uOffsetCentre;

  if (uPulse > 0.0) {
    vec2 d = uv - centre;
    float r = length(d);
    float ring = sin(r * 22.0 - uTime * 3.4) * exp(-r * 4.2);
    uv += normalize(d + 1e-5) * ring * uPulse * 0.030;
  }
  if (uTap.z > 0.0 && uTap.z < 2.4) {
    vec2 d = uv - uTap.xy;
    float r = length(d);
    float front = r - uTap.z * 0.42;
    float wave = sin(front * 34.0) * exp(-abs(front) * 11.0);
    float life = exp(-uTap.z * 1.5);
    uv += normalize(d + 1e-5) * wave * life * 0.055;
  }
  if (uStretch > 0.0) {
    vec2 d = uv - centre;
    d.x /= (1.0 + uStretch * 1.30);
    d.y *= (1.0 + uStretch * 0.55);
    d += vec2(sin(d.y * 9.0 + uTime * 2.2), cos(d.x * 7.0 - uTime * 1.7))
         * uStretch * 0.035;
    uv = centre + d;
  }
  if (uSplit > 0.0) {
    vec2 d = uv - centre;
    float lane = smoothstep(0.0, 0.16, abs(d.x));
    d.x -= sign(d.x) * uSplit * 0.20 * lane;
    uv = centre + d;
  }
  uv = spin(uv, uFanA);
  uv = spin(uv, uFanB);

  vec2 rd = uv - uMouse;
  uv += normalize(rd + 1e-6)
        * (sin(length(rd) * 20.0 - uTime * uRippleSpeed) * uWaveAmplitude)
        * uRippleMix;

  float w1 = sin(uv.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveAmplitude;
  float w2 = sin(uv.y * uWaveFrequency * 0.7 + uTime * uWaveSpeed * 0.8) * uWaveAmplitude * 0.7;
  float w3 = sin((uv.x + uv.y) * uWaveFrequency * 0.5 + uTime * uWaveSpeed * 1.2) * uWaveAmplitude * 0.5;
  uv += vec2(w1 + w3, w2 + w3) * uComplexMix;

  return uv;
}

/* The field displaces the point it SAMPLES from; a grain IS the thing sampled.
   A fragment at s shows the density that lives at fieldUv(s), so a feature at
   texture position p is seen at the s where fieldUv(s) = p — which to first
   order is p − (fieldUv(p) − p). Get this sign wrong and every mark rides the
   ripple backwards against the bull, which is worse than not riding it. */
vec2 ride(vec2 p){
  return p - (fieldUv(p) - p) * uWarp;
}

void main(){
  /* aMeta.x is overloaded. For a mark it is sharp, the local high-pass energy
     of the density map. For the hall there is no density map — buildHall()
     generates the cloud in closed form — so the slot carries the grain's depth
     phase instead, and sharp is pinned mid-range. A set is always drawn with the
     uCorridor it was built for, so the two readings never mix. */
  float dens  = aMeta.y;
  float sharp = mix(aMeta.x, 0.30, uCorridor);

  /* Stagger. On assembly the order runs detail → mass, on dispersal mass →
     detail, so the shape is built from its structure outward and taken apart
     from its edges inward. 22% of the ordering is per-particle noise: a clean
     sort by sharpness reads as a wipe, and a wipe is a transition, not a swarm. */
  float order = mix(sharp, 1.0 - sharp, uMode);
  order = clamp(order * 0.78 + aSeed.x * 0.22, 0.0, 1.0);
  const float STAG = 0.38;
  float local = clamp((uPhase - order * STAG) / (1.0 - STAG), 0.0, 1.0);

  /* Asymmetric by construction. Arrival is cubic decay — all the speed at the
     start, the last 15% of the distance spent over a third of the window, which
     is the only way a grain reads as *settling* onto a target. Departure is the
     mirror image: nothing happens, then it is thrown. */
  float conv = mix(1.0 - pow(local, 1.90),                 // disperse
                   1.0 - pow(1.0 - local, 3.00),           // assemble
                   uMode);

  vec2 tgt = aTarget;

  /* ── the hall ──
     The corridor used to be the field shader sampling its own texture through a
     shrinking window: fit fell 0.310 → 0.153 across four wheel steps, which is
     a 2x zoom of one raster. Every pixel of the hall moved on the same matrix,
     so the whole thing travelled as one picture — the exact read the client
     named. It is gone; nothing zooms any more.

     What moves here is each grain, alone. The mark is drawn in one-point
     perspective, so a grain's distance from the vanishing point already encodes
     its depth: a wall point at depth z projects to radius r = k/z. Take the log
     of that radius and depth becomes a coordinate that forward motion simply
     adds to — which is also why the mark itself is drawn with a geometric bay
     spacing, z = near·(far/near)^t. Equal steps in log r are equal steps down
     the hall, so a constant uDolly rate reads as constant speed instead of as a
     camera slowing to a stop.

     fract() closes the coordinate into a loop: a grain that leaves the frame
     re-enters at the vanishing point and walks the hall again, so 86k grains
     render a hall of unbounded length.

     What survives the loop is the grain's ANGLE, and that is not a convenience —
     it is the geometry. A point on a corridor wall sits at a fixed world x, so
     it projects to (x·F/z, y·F/z) and the ratio y/x is x-independent of z: the
     angle a wall feature subtends is the same at every depth. So a grain that
     wraps to the vanishing point at its own angle lands exactly where that same
     wall feature would be seen from further back. The mark's ink lies on two
     walls and nowhere between them, which is also what keeps the centre band
     clear for the titles however far the camera has travelled.

     Depth is read from the radius, not drawn per grain. A per-grain random depth
     was tried and is wrong for one specific reason: it decorrelates a grain from
     the bay it stood in, and the bay gaps are the only feature in the hall whose
     motion the eye can actually clock. Randomised, the walls came out as two
     even dust wedges expanding — which is the same non-answer as zooming a
     picture, with more arithmetic. Read from the radius, the eighteen bays hold
     together and travel, and each grain still moves at its own screen rate
     (d(exp s)/dt = r, so the near wall runs 11x faster than the far end). That
     spread is what a shared matrix can never produce.

     What the radius read costs is a spawn bias, and it is paid in buildCloud
     rather than here: a depth shell's area goes as r², so density-proportional
     sampling put 127 grains at the near wall for every one at the vanishing
     point. See the depth reweight in buildCloud.

     Depth is |d.x| and not length(d), which is not a detail. The hall's ink is
     on two side walls, and a side wall's depth parameter IS its x: a point at
     world (±X, y, z) projects to (±X·F/z, y·F/z), so |x| on screen is a pure
     function of depth while |y| is not. Using the radius instead mixes the two —
     a grain high on the wall reads as nearer than one at mid-height at the same
     depth, the bay boundaries bow into arcs, and worse, grains at the corners of
     the near wall run past every radius the texture can hold and get clamped
     onto one shell. That shell was visible as a hard-edged dense ring crossing
     the hall at the third dolly stage. Scaling d by the ratio of the new |x| to
     the old one moves x and y together, which is what perspective does.

     S_MIN = log(0.045) and S_MAX = log(0.500) — the same pair the mark is drawn
     between (R_FAR, R_NEAR in prep-venom-marks.py), and 0.500 is the edge of a
     markScale-1.0 texture, so no grain is ever clamped. They must stay in step:
     if they drift the wrap lands mid-bay and the hall stutters once per pass. */
  float depth = 0.0;
  if (uCorridor > 0.0) {
    const float S_MIN = -3.1011;   // log 0.045, the vanishing point
    const float S_MAX = -0.6931;   // log 0.500, the edge of the frame
    depth = fract(aMeta.x + uDolly);
    vec2  d  = tgt - 0.5;
    float rx = max(abs(d.x), 1e-4);
    tgt = mix(tgt, 0.5 + d * (exp(mix(S_MIN, S_MAX, depth)) / rx), uCorridor);
  }

  /* How far this grain is allowed to be from home when the cloud is fully open.
     Measured, not guessed: at the intro's fit 0.34 on a 1440-wide window, 1.0 uv
     is 1323 screen px. The previous 0.320 threw flat mass 423 px — a third of
     the screen — which is not a mark coming apart into its grains, it is the
     mark being deformed. 0.135 is 179 px and 0.060 is 79 px: the structure
     loosens by roughly its own stroke width and regathers.

     ── and 0.135 is still too far ──
     Coverage is what carries the material. A grain lattice at 2.2 px prints the
     substance's tone only where enough grains overlap; spread the same 86 400
     grains over twice the area and every region of it blends halfway to paper,
     so the ink pales, and with it the grain and the colour, all three at once
     and none of them because anything about the material changed. Measured over
     bull → gpu at 0.135: the cloud's footprint went from 110 000 px to 224 000
     and mean luminance from 0.55 to 0.74 at 0.7 s. The venom went thin in the
     middle of every change and came back, which is what reads as the picture
     changing while it transforms.

     0.078 and 0.040 — 58% and 67% of what they were. At the reference fit 0.34
     that is 103 screen px of travel on flat mass and 53 px on fine detail, and
     the footprint now grows by about 40% rather than doubling. It is also the
     honest reading of what a change is supposed to be here: the substance
     re-forms into the next shape, it does not evacuate the frame and come back.
     Anything the eye could follow at 179 px it can follow at 103. */
  float reach = mix(0.078, 0.040, sharp) * uAmp;

  /* The dispersed state, entirely per-grain. Direction is the seed's own angle;
     radius is sqrt-distributed so the scatter fills a disc evenly instead of
     bunching at the rim, and it is 1.35:1 wider across than down, which is the
     same axis the field's own stretch works on. */
  float ang = aSeed.x * TAU;
  float rad = reach * sqrt(0.10 + 0.90 * aSeed.y);
  vec2 chaos = tgt + vec2(cos(ang) * 1.35, sin(ang)) * rad;

  vec2 pos = mix(chaos, tgt, conv);

  /* Micro-jitter. This is the term nearest the target, so it is the one read as
     "alive", and it must not deform the shape while doing it. Each grain runs
     its own ellipse on its own phase and its own rate — 0.55 to 1.75 Hz — so
     the motion is per-pixel tremble, never a shared wave. Amplitude is 0.0060 uv
     on flat mass (8 screen px) and 0.0022 on fine detail (3 px); a little of it
     survives at rest (the 0.78 factor leaves 22%) so a settled mark still
     breathes at ~1.8 px instead of freezing into a still image. */
  float ph = aSeed.y * TAU;
  // decorrelated from ang, which already spent aSeed.x: two grains that scatter
  // in the same direction must not also tremble on the same clock
  float rate = 3.46 + fract(aSeed.x * 7.31 + aSeed.y * 3.17) * 7.55;  // 0.55..1.75 Hz
  vec2 jit = vec2(sin(uTime * rate + ph),
                  cos(uTime * rate * 0.83 + ph * 1.7));
  pos += jit * (1.0 - conv * 0.78) * mix(0.0060, 0.0022, sharp);

  /* ── the grain joins the substance ──
     Evaluated at pos, not at aTarget, so a grain in flight rides the field
     too: the whole cloud is inside the same body of liquid at every instant of
     a change, not only once it has landed.

     The hall is excluded outright (uWarp is sent as 0 for it). Its geometry is
     already generated in perspective and a uv-space ripple laid over a
     projection is not a wobble, it is a broken projection. */
  pos = ride(pos);

  vec2 clip = ((pos - 0.5 - uOffset) / uFit) / vec2(uAspect, 1.0);
  gl_Position = vec4(clip, 0.0, 1.0);

  /* ── ink, conserved for real this time ──
     This read mix(0.62, 1.0, conv): a scattered grain is lighter than a gathered
     one, on the reasoning that a cloud covers more area than the shape it came
     from and would otherwise read darker. That was true when it was written and
     stopped being true when the field learned to drain to zero underneath it.
     Both things now happen at once — the sheet withdraws AND every grain dims —
     and the substance goes pale in the middle of every change.

     Measured across bull → gpu, sampling the canvas every 100 ms: mean luminance
     over the ink ran 0.55 at rest, 0.78 at 0.7 s, back to 0.64. The whole
     picture lightens by a fifth and comes back. That is the complaint — the
     venom changing during the transformation instead of only changing shape —
     and it is also why the colour measured as vanishing at the same instant:
     rms(R−B) 0.057 → 0.026, saturation 0.042 → 0.018. Nothing had changed the
     hue. There was simply half as much substance on screen to carry it.

     0.92 is what holds the mean flat: the cloud's footprint roughly doubles at
     full scatter, its grains still overlap enough at 2.2 px that the coverage
     does not, and 8% is all the compensation the spread actually needs.

     The assignment also used to sit BELOW the reading band, which meant the band
     multiplied an unwritten varying and was then overwritten wholesale — the
     corridor's titles have been standing over an unattenuated wall this whole
     time. Order matters here and there is nothing else in the block that reads
     vAlpha, so it moves up. */
  vAlpha = uAlpha * mix(0.92, 1.0, conv) * mix(0.55, 1.0, dens);

  /* ── the reading band ──
     The corridor's titles stand across the middle of the frame: up to four
     lines, 780 x 150 device px, which in clip units is 1.22 x 0.42. The hall's
     near bays run straight through that, and measured against the type they put
     grains at 55% coverage behind 40px letterforms.

     This is the one place the hall is allowed to be less than a hall, and it is
     the same concession the drawn mark used to make with a blurred ellipse at
     its centre — it just has to live here now, because the geometry is generated
     rather than rastered. A flat lens, 4.2:1, floored at 0.26 rather than cut to
     zero: the structure stays legible as structure behind the type instead of
     leaving a bald patch in the middle of the wall, and the falloff is wide
     enough (0.42 to 1.05 of the lens radius) that no edge of it is visible. */
  if (uCorridor > 0.0) {
    float lens = length(vec2(clip.x, clip.y * 4.2));
    vAlpha *= mix(1.0, mix(0.26, 1.0, smoothstep(0.42, 1.05, lens)), uCorridor);
  }

  /* Depth cueing, and the seam. A grain arriving at the vanishing point comes up
     out of nothing over the first 11% of the span and one leaving the frame is
     gone by 88%, so the wrap happens at alpha 0 and there is no pop. The ramps
     are also the aerial perspective: the far end of the hall is faint because it
     is far, which is the only thing that makes 86k coplanar dots read as depth. */
  if (uCorridor > 0.0) {
    /* The fade-in runs to 0.26 of the span, not to 0.11. It is doing two jobs:
       hiding the wrap, and clearing the middle of the screen for the titles. At
       fit 0.31 the band it covers is a disc of radius 0.055·e^(0.26·2.42) =
       0.103 uv = 150 screen px, and the corridor's title lines are 370 px wide,
       so the type stands over grains that are between 0 and 40% opacity. */
    /* The fade-out is short and late — 0.96 to 1.00 — because at depth 0.96 the
       wall is already at |x| 0.46 uv, which at fit 0.31 is 594 of the 640 px to
       the frame edge. A long fade there would end the hall inside the window,
       which is a picture of a corridor; a short one ends it off the screen. */
    float band = smoothstep(0.00, 0.26, depth) * (1.0 - smoothstep(0.96, 1.00, depth));
    vAlpha *= mix(1.0, band * mix(0.22, 1.0, depth), uCorridor);
  }

  /* ── the edge dissolves into the substance ──
     "по краям объектов должно быть размытие венома, с дымом, с переливанием
     прозрачности". A silhouette that ends where its raster ends is the tell
     that gives away a picture laid on a background, and it does not matter how
     soft that ending is: a feathered edge is still an edge that holds still.

     So the boundary is not drawn, it is BREATHED. Two octaves of the field's
     own value noise on the field's own clock decide, per grain per frame,
     whether that grain is currently part of the mark or part of the air. The
     mask runs on DENSITY, not on distance: in the mass (dens > 0.55) it is
     inert, and it takes over completely out in the halo prep leaves around the
     object, where density is 0.02-0.16. So the interior stays solid while the
     rim opens and closes, and what the eye reads at the boundary is smoke with
     the object condensing out of it.

     Coarse octave at 3.6 uv⁻¹ on a 0.40 clock: that is the field's shimmer,
     the same numbers, so the two halves of the substance breathe in step
     instead of at two different rates — which is the mistake that would put the
     seam straight back. The fine octave at 14.2 is what makes it read as smoke
     rather than as the whole edge pulsing as one.

     Range 0.10..1.12 rather than 0..1: grains that go over 1.0 clip in the
     blend and hold, so the rim gains a few bright specks per frame instead of
     only ever losing some, and the mean ink over the edge stays where it was. */
  if (uSmoke > 0.0) {
    vec2 sp = pos * 3.6;
    float st = uTime * 0.40;
    float n1 = vnoise(sp * 0.62 + vec2(-st * 0.47, st * 0.31));
    float n2 = vnoise(pos * 14.2 + vec2(st * 0.83, -st * 0.61) + 41.3);
    float n  = n1 * 0.45 + n2 * 0.55;
    /* The gate sits at 0.05..0.30 and not a step higher, and that was measured
       rather than picked: prep's halo runs 0.02-0.16 and its BODY fill starts
       at 0.26, so this band is exactly the halo and nothing else. The first
       attempt gated at 0.14..0.55, which reaches into the portrait's cheek
       (density 0.39 there) — the dissolve ate the eye line and the glasses and
       the face came back as a soft grey oval. The smoke is allowed to have the
       air around the object. It is not allowed to have the object. */
    float edge = 1.0 - smoothstep(0.05, 0.30, dens);
    vAlpha *= mix(1.0, clamp(0.10 + n * 1.02, 0.0, 1.12), edge * uSmoke);
  }

  /* ── the tone ──
     This used to read vec3(0.175) + vec3(0.046,-0.005,-0.038) * (aSeed.y-0.5):
     a fixed grey with a per-grain hue wobble of ±0.023. Two things were wrong
     with it and both were measured on screen. 0.175 is half the field's floor of
     0.34, so the corridor printed at luminance 0.17 against the bull's 0.31 —
     the hall was the heaviest ink on the site. And a per-grain RANDOM hue
     averages to nothing the moment grains overlap: the bull's channel split
     measures rms(R−B) 0.059 across its ink and the cloud's measured 0.018,
     which is why a photographic mark and the hall came out black-and-white next
     to a bull that is warm sand against cool lavender. The split is coherent
     over tens of pixels on the field because it follows the shape, not the
     dither — see the colour block below.

     What is left per grain is a small tone spread, ±0.030 around the floor. That
     is not colour, it is the same thing the field's hash warp does to its own
     ink: no two neighbouring bits of the substance print at exactly one value.

     The shimmer is the field's, verbatim: same vnoise, same 3.6 spatial scale,
     same 0.40 clock, masked to the dense end the same way. Without it the cloud
     was the only part of the substance that did not breathe. */
  float drift = vnoise(pos * 3.6 + vec2(uTime * 0.20, -uTime * 0.124)) - 0.5;
  float ink = uInk + (aSeed.y - 0.5) * 0.060 + drift * uShimmer;

  /* ── the colour, derived rather than displaced ──
     Work out what the field's three taps actually PRODUCE and reproduce that,
     instead of reproducing the mechanism on geometry it does not suit.

     One dimension is enough. Let D be density and d the tap spacing along the
     diagonal. The field prints 1 − D(x + k·d) into each channel, k = 0.500 for
     red and 1.575 for blue, so R − B = D(x + 1.575d) − D(x + 0.500d), which to
     first order is 1.075·d·dD/dx along the diagonal. In words: the venom is warm
     where its density RISES along the down-right diagonal and cool where it
     falls, in proportion to the slope, and flat grey wherever the density is
     flat — which is exactly what the bull shows on screen, a cool left edge and
     a warm right edge with a neutral mass between them.

     So the grain needs dD/dx along the diagonal, and it is handed one: aGrad,
     measured off the same 256² density map the cloud is drawn from with a tap
     baseline that matches the field's, and computed in closed form for the hall,
     which has no map. An earlier revision approximated it from the grain's
     direction out of the centre of the mark, and it was close enough to fool the
     numbers but not the eye: the whole left wall of the corridor came out warm
     and the whole right wall cool, because direction-out-of-centre cannot tell
     the near face of a rack from its far face. A real derivative can, and does.

     aGrad is stored as the raw density difference across the baseline the field
     uses at a nominal uChroma of 0.015, so it already IS R−B at that setting and
     the only scaling left is the ratio to the live uChroma (1/0.015 = 66.7) and
     the field's uSaturation 0.30, which desaturates after its taps — the cloud
     has no three separate samples to desaturate between. 66.7 × 0.30 = 20, trimmed to 10.8 against the measurement.
     Checked against the bull rather than argued: it puts the cloud's rms(R−B)
     and mean saturation on the field's, within a few percent. The green channel
     sits between the two taps and barely moves, which is why the split reads as
     sand against lavender and not as red against blue. */
  vTint = vec3(ink) + aGrad * uChroma * 10.8 * vec3(1.0, 0.06, -0.84);

  /* Grain size. The previous numbers reached 8.1 device px at the widest
     (uSize 3.6 x 1.55 x 1.45) and were drawn with a feather that ran from
     radius 0.5 all the way in to 0.10 — so a grain had almost no solid core and
     was, in practice, a soft blob. Thousands of those overlapping is a cloud of
     tar, which is exactly the read that came back as a complaint.

     This is a pixel now: 1.15..1.25 of uSize, so 1.8-3.0 device px across the
     working range, with the travel growth cut from 45% to 8%. Small enough that
     the edge treatment below lands as one clean dot rather than as a gradient. */
  gl_PointSize = uSize * mix(1.25, 0.92, sharp) * mix(1.08, 1.0, conv)
    /* a grain gets bigger as it comes at you, which is the second half of the
       depth read. It cannot follow the radius honestly — that would be 11:1 over
       the span and the near wall would be 24px blobs — so it runs 0.75 to 2.10,
       which is the largest ratio that still leaves the near grains reading as
       grains at the 2.2px base. */
    * mix(1.0, mix(0.55, 2.60, depth), uCorridor);
}`

const FRAG = `
precision mediump float;
varying float vAlpha;
varying vec3  vTint;
void main(){
  /* A hard dot with one pixel of anti-aliasing on it, not a feathered blob.
     The old smoothstep(0.5, 0.10, d) left only the inner fifth of the sprite at
     full weight and faded the rest, so every grain was a soft halo and the
     assembly read as smoke rather than as a structure made of particles. The
     ramp is 0.44-0.50 of the sprite instead — at the 2-3 px sizes this layer
     now draws, that is a sub-pixel edge: the grain is either there or it is
     not, which is what makes a field of them read as pixels. */
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.44, 0.50, d)) * vAlpha;
  if (a <= 0.004) discard;
  gl_FragColor = vec4(vTint, a);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('venom particles:', gl.getShaderInfoLog(s))
    return null
  }
  return s
}

/* ── spawn map ──
   Two GPU downscales instead of a per-pixel loop over the 1024² raster: the
   1.05M-pixel pass in markTexture() was already measured at an 85ms long task
   when it did real work per pixel, and this runs in the same frame. drawImage
   to 256² and to 64² is two blits and a 262k readback, ~1.2ms measured.

   Returned buffer is interleaved [tx, ty, seed.x, seed.y, sharp, density, grad],
   stride 7 floats. */
/* ── the hall, in closed form ──
   The corridor is the one mark that is not sampled from a raster, and the reason
   is resolution. A spawn map is a picture with a fixed number of pixels in it;
   the dolly magnifies the deep end of the hall by up to 11x on its way to the
   camera, so grains drawn from the far bays arrive as blobs the size of four
   source texels. Measured on the 1024 raster, the near half of the screen at
   dolly 0.5 was visibly mush against a crisp far half, with a hard step between
   them. No amount of tuning fixes that: it is the resolution of the source.

   Generated instead, the hall has no resolution. Its structure is three integers
   and two fractions, every grain sits exactly on a rack face, and the geometry
   is as sharp at 11x as at 1x — which is something zooming a picture can never
   be, and is the whole argument for doing the section this way.

   Two coordinates per grain:
     · a slope m = y/x along the wall, which in one-point perspective is
       depth-invariant — that is why the shader can move a grain through depth by
       scaling x and y together, and why the shelf pattern holds at every bay;
     · a depth phase s0, uniform on [0,1). Uniform is not a preference either:
       the shader wraps depth with fract(s0 + uDolly), so any non-uniform
       distribution would travel down the hall and reappear at the vanishing
       point as a moving band. Flat is the only distribution invariant under its
       own wrap.

   The bay gaps and the shelf seams are cut out of those two draws rather than
   masked afterwards, so every grain generated is a grain used. */
export function buildHall(count) {
  const YW = 0.86        // wall half-height, as a fraction of its half-width
  const BAYS = 18        // bays over the depth span, matching the drawn mark
  const GAP = 0.26       // fraction of a bay that is the lit gap between racks
  const ROWS = 7         // rack shelves per wall
  const SEAM = 0.34      // fraction of a shelf pitch that is the seam
  const X = 0.47         // canonical |x| — the shader renormalises by it anyway

  const out = new Float32Array(count * 7)
  for (let k = 0; k < count; k++) {
    const side = k & 1 ? 1 : -1
    // depth: pick a bay, then a position inside its solid face
    const bay = (Math.random() * BAYS) | 0
    const u = Math.random()
    const s0 = (bay + GAP + u * (1 - GAP)) / BAYS
    // slope: pick a shelf, then a position inside its solid face
    const row = (Math.random() * ROWS) | 0
    const v = Math.random()
    const m = (-1 + 2 * (row + SEAM * 0.5 + v * (1 - SEAM)) / ROWS) * YW

    const o = k * 7
    out[o] = 0.5 + side * X
    out[o + 1] = 0.5 + m * X
    out[o + 2] = Math.random()
    out[o + 3] = Math.random()
    out[o + 4] = s0            // read as the depth phase, not as sharpness
    // real edge proximity rather than the 0.72 + rand·0.28 that used to sit here
    // and carried no information at all; it is what weights a grain's ink
    out[o + 5] = 0.72 + 0.28 * (2 * Math.min(u, 1 - u, v, 1 - v))

    /* ── the hall's own density slope, in closed form ──
       The venom's colour is the density gradient along the down-right diagonal
       (see vTint). Every other mark gets that measured off its raster; the hall
       has no raster, so it is differentiated instead — which is cleaner, because
       the hall is an exact function of u and v and its derivative is too.

       D rises from a bay's leading seam to the middle of its face and falls to
       the trailing one, so dD/du goes as (1 − 2u), and likewise (1 − 2v) across
       a shelf. Those become screen derivatives through the projection: u runs
       outward along the wall, so du/dx is positive on the right wall and
       negative on the left, while v runs down the frame on both. The diagonal
       component is the mean of the two, and 0.52 is the depth of the seam
       contrast this structure actually cuts — a rack face against a lit gap, not
       against paper.

       This is what replaced reading the sign off the grain's direction from the
       centre of the frame: that could only ever colour one wall warm and the
       other cool, where the truth is that each rack has a warm leading face and
       a cool trailing one, eighteen times down the hall. */
    /* Cubed, not linear, and this is a spatial correction rather than a
       magnitude one — the rms was already on the bull's before it. A face's
       density is flat across its middle and falls only at its seams, so the
       derivative is a spike either side and near zero between. Linear ramped the
       colour across the whole face, and eighteen bays of that read as a wall of
       brown blocks next to a wall of blue ones: the right amount of colour in
       the wrong places. The cube concentrates it in the outer third of a face,
       which is where a boundary actually is, and 0.99 restores the level the
       narrower distribution loses. */
    const gu = (1 - 2 * u), gv = (1 - 2 * v)
    out[o + 6] = 0.99 * 0.5 * (side * gu * gu * gu + gv * gv * gv)
  }
  return { data: out, count }
}

export function buildCloud(srcCanvas, count) {
  const mk = (n) => {
    const cv = document.createElement('canvas')
    cv.width = n; cv.height = n
    const cx = cv.getContext('2d', { willReadFrequently: true })
    cx.imageSmoothingEnabled = true
    cx.imageSmoothingQuality = 'high'
    return [cv, cx]
  }
  const [fineCv, fineCx] = mk(GRID)
  const [lowCv, lowCx] = mk(COARSE)
  const [blurCv, blurCx] = mk(GRID)

  /* Chained, not two independent reductions off the 1024² source: the second
     1024→64 blit costs as much as the first and reads the same texels. */
  fineCx.drawImage(srcCanvas, 0, 0, GRID, GRID)
  lowCx.drawImage(fineCv, 0, 0, COARSE, COARSE)
  blurCx.drawImage(lowCv, 0, 0, GRID, GRID)   // bilinear back up = the shape minus its detail

  const fine = fineCx.getImageData(0, 0, GRID, GRID).data
  const blur = blurCx.getImageData(0, 0, GRID, GRID).data

  const N = GRID * GRID
  const dens = new Float32Array(N)
  const hp = new Float32Array(N)
  let hpMax = 1e-4
  for (let i = 0; i < N; i++) {
    const d = fine[i * 4] / 255
    dens[i] = d < FLOOR ? 0 : d
    // high-pass is only meaningful where there is material to detail
    const e = d > FLOOR ? Math.abs(d - blur[i * 4] / 255) : 0
    hp[i] = e
    if (e > hpMax) hpMax = e
  }
  /* Normalising on the maximum lets one speck of aliasing set the scale and
     everything else collapse to zero. The 88th percentile is the level the
     genuinely detailed regions sit at. */
  const hist = new Int32Array(64)
  let nz = 0
  for (let i = 0; i < N; i++) {
    if (dens[i] <= 0) continue
    nz++
    hist[Math.min(63, (hp[i] / hpMax * 63) | 0)]++
  }
  let acc = 0, p88 = hpMax * 0.35
  for (let b = 0; b < 64; b++) {
    acc += hist[b]
    if (acc >= nz * 0.88) { p88 = Math.max(1e-4, (b + 1) / 64 * hpMax); break }
  }

  // prefix sum over density = the CDF particles are drawn from
  const cdf = new Float32Array(N)
  let total = 0
  for (let i = 0; i < N; i++) { total += dens[i]; cdf[i] = total }
  if (total <= 0) return { data: new Float32Array(0), count: 0 }

  /* Stratified, not rejection-sampled and not binary-searched. Drawing the k-th
     particle at (k + rand)/count of the total mass gives a monotonically rising
     target, so the CDF is walked once with a single cursor: 71k + 65k steps
     instead of 71k × 16. Measured at 1.9ms against 11ms, on the one frame a
     section changes — the frame that must not stall. Stratification also stops
     the clumping plain uniform sampling leaves in low-density regions, which is
     exactly where the soft edge of the mark has to stay even. */
  /* ── the tap baseline, in cells ──
     The venom's colour is the density difference the field's red and blue taps
     see between them (vTint has the derivation). Those taps are 1.075 × the
     channel shift apart along the down-right diagonal, and at the nominal shift
     of 0.015 uv that is 0.0161 uv — 2.06 cells of this 256² grid, so the grain's
     slope is read at ±2 cells diagonally and needs no scaling afterwards: what
     comes out IS R−B at that shift, and the shader only has to rescale it to
     whatever the shift is on the frame being drawn.
     Grid y runs opposite to texture v (the raster is uploaded flipped), so the
     diagonal that is +x +v in the shader is +x −y here. */
  /* 0.0161 uv, and it has to be read in cells of whatever GRID currently is —
     it was a hard 2 when GRID was hard 256, and that pair has to stay tied. */
  const TAP = Math.max(1, Math.round(0.0161 * GRID))
  const at = (x, y) => (x < 0 || y < 0 || x >= GRID || y >= GRID)
    ? 0 : dens[y * GRID + x]

  const out = new Float32Array(count * 7)
  let cur = 0
  for (let k = 0; k < count; k++) {
    const r = (k + Math.random()) / count * total
    while (cur < N - 1 && cdf[cur] < r) cur++
    const cx = cur % GRID
    const cy = (cur / GRID) | 0
    const lo = cur
    const o = k * 7
    out[o]     = (cx + Math.random()) / GRID
    // markTexture uploads with UNPACK_FLIP_Y_WEBGL, so texture v runs up
    out[o + 1] = 1 - (cy + Math.random()) / GRID
    out[o + 2] = Math.random()
    out[o + 3] = Math.random()
    out[o + 4] = Math.min(1, hp[lo] / p88)
    out[o + 5] = dens[lo]
    out[o + 6] = at(cx + TAP, cy - TAP) - at(cx - TAP, cy + TAP)
  }
  return { data: out, count }
}

const ZERO4 = new Float32Array(4)

export function createParticleLayer(gl) {
  const prog = gl.createProgram()
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.bindAttribLocation(prog, 0, 'aTarget')
  gl.bindAttribLocation(prog, 1, 'aSeed')
  gl.bindAttribLocation(prog, 2, 'aMeta')
  gl.bindAttribLocation(prog, 3, 'aGrad')
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('venom particles link:', gl.getProgramInfoLog(prog))
    return null
  }

  const U = {}
  for (const n of ['uAspect', 'uFit', 'uOffset', 'uTime', 'uPhase', 'uMode',
    'uAlpha', 'uAmp', 'uSize', 'uCorridor', 'uDolly', 'uChroma', 'uInk', 'uShimmer',
    // the field's displacement, handed down — see fieldUv() above
    'uWarp', 'uMouse', 'uOffsetCentre', 'uWaveSpeed', 'uWaveAmplitude',
    'uWaveFrequency', 'uRippleSpeed', 'uRippleMix', 'uComplexMix',
    'uStretch', 'uSplit', 'uPulse', 'uTap', 'uFanA', 'uFanB', 'uFanMix', 'uSmoke'])
    U[n] = gl.getUniformLocation(prog, n)

  function upload(cloud) {
    if (!cloud || !cloud.count) return null
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, cloud.data, gl.STATIC_DRAW)
    return { buf, count: cloud.count }
  }

  function draw(set, s) {
    if (!set || s.alpha <= 0.003) return
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, set.buf)
    const STRIDE = 28
    gl.enableVertexAttribArray(0)
    gl.enableVertexAttribArray(1)
    gl.enableVertexAttribArray(2)
    gl.enableVertexAttribArray(3)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE, 0)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, 8)
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, STRIDE, 16)
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, STRIDE, 24)

    gl.uniform1f(U.uAspect, s.aspect)
    gl.uniform1f(U.uFit, s.fit)
    gl.uniform2f(U.uOffset, s.ox, s.oy)
    gl.uniform1f(U.uTime, s.time)
    gl.uniform1f(U.uPhase, s.phase)
    gl.uniform1f(U.uMode, s.mode)
    gl.uniform1f(U.uAlpha, s.alpha)
    gl.uniform1f(U.uAmp, s.amp)
    gl.uniform1f(U.uSize, s.size)
    gl.uniform1f(U.uCorridor, s.corridor ?? 0)
    gl.uniform1f(U.uDolly, s.dolly ?? 0)
    gl.uniform1f(U.uInk, s.ink ?? 0.34)
    gl.uniform1f(U.uShimmer, s.shimmer ?? 0)
    gl.uniform1f(U.uChroma, s.chroma ?? 0)

    /* ── the field's frame, verbatim ──
       s.warp is the only number invented here rather than read off the field:
       it is 0 for the hall and 1 everywhere else, and it exists because a
       uv-space ripple over a one-point projection is not a wobble, it is a
       broken projection. Everything else is the value the fragment shader was
       given on this same frame, including the per-mark `hold` and per-phase
       `quiet` already folded into the amplitudes. */
    const w = s.warp ?? 0
    gl.uniform1f(U.uWarp, w)
    gl.uniform1f(U.uSmoke, s.smoke ?? 0)
    gl.uniform2f(U.uMouse, s.mx ?? 0.5, s.my ?? 0.5)
    gl.uniform2f(U.uOffsetCentre, s.cx ?? 0, s.cy ?? 0)
    gl.uniform1f(U.uWaveSpeed, s.waveSpeed ?? 0)
    gl.uniform1f(U.uWaveAmplitude, w ? (s.waveAmp ?? 0) : 0)
    gl.uniform1f(U.uWaveFrequency, s.waveFreq ?? 0)
    gl.uniform1f(U.uRippleSpeed, s.rippleSpeed ?? 0)
    gl.uniform1f(U.uRippleMix, s.rippleMix ?? 0)
    gl.uniform1f(U.uComplexMix, s.complexMix ?? 0)
    gl.uniform1f(U.uStretch, w ? (s.stretch ?? 0) : 0)
    gl.uniform1f(U.uSplit, w ? (s.split ?? 0) : 0)
    gl.uniform1f(U.uPulse, w ? (s.pulse ?? 0) : 0)
    gl.uniform3f(U.uTap, s.tapX ?? 0, s.tapY ?? 0, w ? (s.tapT ?? -1) : -1)
    gl.uniform4fv(U.uFanA, s.fanA ?? ZERO4)
    gl.uniform4fv(U.uFanB, s.fanB ?? ZERO4)
    gl.uniform1f(U.uFanMix, w ? (s.fanMix ?? 0) : 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.POINTS, 0, set.count)
    gl.disable(gl.BLEND)
    gl.disableVertexAttribArray(1)
    gl.disableVertexAttribArray(2)
    gl.disableVertexAttribArray(3)
  }

  return {
    upload,
    draw,
    free(set) { if (set) gl.deleteBuffer(set.buf) }
  }
}
