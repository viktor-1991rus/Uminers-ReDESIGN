#!/usr/bin/env python3
"""
Builds the venom marks from Venom/ into public/assets/venom-shapes/.

markTexture() in src/lib/venom.js reads density = alpha x (1 - luminance), so
everything here ships as BLACK INK ON WHITE and nothing else.

── polarity, measured, fourth time ──
All three current sources are BLACK INK ON A CLEAN WHITE GROUND. Measured on
the files dated 21 Aug 17:45-17:51: the 8x8 top-left corner of each reads
250-255, i.e. paper. Nothing here inverts anything, and the run prints the
corner reading so the next revision does not have to guess either.

── what changed, and why ──
The previous pipeline was coverage-first: blur the halftone into a continuous
local-coverage field, stretch its levels, ship that. It produced a *tonal
photograph* rendered in dots, and that is the whole defect. A dot lattice whose
density encodes luminance is the definition of a halftone print, so the mark
read as a printed picture laid over the substance while the bull - a flat
silhouette with no tone at all - read as a mass of the substance itself. Two
materials on one screen.

It also destroyed the sources. gpu.jpeg and containers.png are LINE drawings:
thin black contours with halftone fills in the shaded areas. Blurring them to
coverage at radius 1.8 and then lifting the blackpoint to 0.055 meant any
region carrying more than about 5% ink saturated to solid - so the graphics
card, whose interior is nothing but line work, arrived as a slab with two
round holes in it. Unrecognisable, and shipped.

So the pipeline is structure-first now. Every mark is built from three parts,
which is the same recipe the hand-drawn gpu-card.svg mark used and the only one
that has ever survived the displacement:

  BODY   the object's occupancy, flood-filled from its outer contour and held
         at ONE constant density. This is the part that makes the mark the same
         kind of thing as the bull: a mass of substance with a shape, not a
         picture with tones.
  LINE   the ink itself at native resolution, barely blurred. Contours, vents,
         fan blades, the eye line. This is what makes it recognisable, and it
         is carried by the particle layer, which sits exactly on its targets.
  TONE   the old coverage field, at a small weight. Enough that a face is still
         a face; not enough that the mark reads as a print.

  HALO   plus a wide, faint skirt of coverage outside the body - the smoke the
         object dissolves into. buildCloud() spawns grains in it at low density
         and the particle shader shimmers their alpha on the field's own noise,
         so the silhouette does not end anywhere in particular.

  EDGE   and the source frame is faded out over FADE px. The portrait's jacket
         and shoulder run off the bottom and the right of the crop, and a
         density map that stops at a bounding box puts a dead straight cut
         across the substance - the single most picture-like thing on screen.
         Faded, the mass thins into the halo and the halo into paper.

  python3 scripts/prep-venom-marks.py
"""
from PIL import Image, ImageFilter, ImageDraw, ImageOps
import numpy as np
from scipy import ndimage
import os, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/assets/venom-shapes')


def _blur(a, r):
    return ndimage.gaussian_filter(a, r, mode='constant', cval=0.0) if r > 0 else a


def _levels(a, lo, hi, gamma=1.0):
    d = np.clip((a - lo) / (hi - lo), 0.0, 1.0)
    return d ** gamma if gamma != 1.0 else d


def photo_mark(src, dst, *, body=0.30, line=0.85, tone=0.12,
               r_line=0.8, r_tone=3.0, tone_lo=0.06, tone_hi=0.85, tone_gamma=1.0, grow=3,
               close=9, body_gate=0.09, body_soft=2.0,
               halo=0.16, r_halo=26.0, fade=54, pad=26, inset=0, crop=None):
    """Line/halftone artwork -> a density map made of body + line + tone.

    `close` has to be wider than the halftone pitch or the flood fill leaks out
    through the gaps between dots. Measured on these sources by FFT of a
    mid-tone patch: Batyr runs a 5.1 px dot screen, the two drawings 11-20 px in
    their shaded fills. 9 px of closing bridges the portrait; the drawings are
    closed by their own outer contour, which is continuous.
    """
    im = Image.open(os.path.join(ROOT, src)).convert('L')
    if crop:
        im = im.crop(crop)
    elif inset:
        w, h = im.size
        im = im.crop((inset, inset, w - inset, h - inset))

    corner = np.asarray(im)[:8, :8].mean()
    g = np.asarray(im).astype(np.float32) / 255.0
    ink = 1.0 - g                                     # black ink = signal

    # ── TONE: local ink coverage, the old pipeline, now a minority shareholder
    cov = _levels(_blur(ink, r_tone), tone_lo, tone_hi, tone_gamma)

    # ── BODY: occupancy. Close across the halftone gaps, fill, then soften the
    # rim by a couple of px so the constant-density mass does not print a
    # vector-hard outline the grains would have to sit on in a single file.
    solid = ndimage.binary_closing(cov > body_gate,
                                   structure=np.ones((close, close)))
    solid = ndimage.binary_fill_holes(solid)
    # drop specks: registration marks, stray dots, JPEG dirt
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        keep = np.isin(lab, 1 + np.nonzero(sizes > 0.004 * solid.size)[0])
        solid = keep
    bodyf = _blur(solid.astype(np.float32), body_soft)

    # ── LINE: the artwork's own structure at native resolution.
    # `grow` dilates the ink first, and it is 1 - i.e. off - on all three marks.
    # It was tried at 3 px on the two drawings, on the reasoning that a 2-3 px
    # contour barely survives buildCloud's resample to a 384 grid. It does not
    # work, and the reason is that these drawings are not only contours: the fan
    # blades and the container flanks are HATCHED, with a dot screen at an 11-20
    # px pitch. Dilating by 3 closes that screen into solid ink - measured, the
    # fraction of the map clipped to black went from 14.0% to 36.4% on the card
    # and 15.1% to 32.9% on the containers - and both marks came back as the
    # slab this revision exists to delete. The resolution has to come from the
    # grid, which is why GRID moved to 384, and not from thicker ink.
    lin = ndimage.grey_dilation(ink, size=(grow, grow)) if grow > 1 else ink
    lin = np.clip(_blur(lin, r_line), 0.0, 1.0)

    dens = np.clip(body * bodyf + line * lin + tone * cov, 0.0, 1.0)

    # ── HALO: the smoke the object dissolves into. Only outside the body, so it
    # never adds density to the mark itself - the erode-everywhere mistake in
    # the shader's history was exactly that, and it webbed the whole window.
    sk = _blur(bodyf, r_halo)
    dens = np.clip(dens + halo * sk * (1.0 - bodyf), 0.0, 1.0)

    # ── EDGE: fade the source frame out, so nothing ends on a straight cut
    h, w = dens.shape
    fy = np.clip(np.minimum(np.arange(h), h - 1 - np.arange(h)) / float(fade), 0, 1)
    fx = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / float(fade), 0, 1)
    win = (fy[:, None] ** 2 * (3 - 2 * fy[:, None])) * (fx[None, :] ** 2 * (3 - 2 * fx[None, :]))
    dens *= win

    # trim to the ink, halo included, so markScale means the mark's own width
    box = Image.fromarray((dens > 0.02).astype(np.uint8) * 255).getbbox()
    if box:
        x0, y0, x1, y1 = box
        dens = dens[max(0, y0 - pad):min(h, y1 + pad),
                    max(0, x0 - pad):min(w, x1 + pad)]

    out = Image.fromarray(((1.0 - dens) * 255).astype(np.uint8), 'L')
    out.convert('RGB').save(os.path.join(OUT, dst), optimize=True)

    hh, ww = dens.shape
    s = dens[::3, ::3]
    print(f'{dst:16s} {ww}x{hh} ratio {ww/hh:.3f}  ground(corner) {corner:.0f}  '
          f'body {solid.mean():.1%}  med {np.median(s):.3f} p90 {np.percentile(s,90):.3f} '
          f'solid>0.95 {(s>0.95).mean():.1%} empty<0.02 {(s<0.02).mean():.1%}')


def corridor_mark(dst, S=1024, SS=3):
    """One-point perspective: two ranks of racks receding to a centre vanishing
    point. Drawn rather than sourced, because the mark has to satisfy one
    constraint no photograph does - the middle has to stay empty. The titles are
    read there, and density behind them would put charcoal under the type.

    ── square, and in uv ──
    This used to be drawn 1280x800 and mapped onto the 1024 texture at
    markScale 1.0, so one texture unit was 1024px across and 640px down. That is
    fine for a raster the shader samples, and fatal for a spawn map: the particle
    layer reads a grain's DEPTH from its distance to the vanishing point, and an
    anisotropic mapping makes that distance depend on which way round the hall
    the grain sits. A bay ring came out as an ellipse and the bay rhythm - the
    one thing that says "forward motion" rather than "expanding cloud" - was
    smeared across half a bay. Square, so a ring is a ring.

    Everything below is therefore in texture uv, radius from the centre, and the
    two numbers that matter are R_NEAR and R_FAR: they must be the same pair the
    vertex shader wraps between (S_MAX = log 0.620, S_MIN = log 0.055). If they
    drift apart the wrap lands mid-bay and the hall stutters once per pass.

    Depth is geometric - each bay is a fixed RATIO of the one in front, not a
    fixed distance - so a constant dolly rate reads as constant speed instead of
    as a camera slowing to a stop. Ink is CONSTANT with depth: aerial perspective
    is the particle layer's job now (vAlpha ramps 0.30 -> 1.00 across the span),
    and baking a falloff into the spawn map instead would empty the far half of
    the hall of grains, which is what left a bald vanishing point."""
    im = Image.new('L', (S * SS, S * SS), 255)
    d = ImageDraw.Draw(im)
    c = S * SS / 2
    # wall half-width in uv, near and far. R_NEAR is 0.50 and not a hair more:
    # the texture is 1024 square and the mark is drawn at markScale 1.0, so 0.50
    # is the edge of it. Anything past that is clipped away by the raster, and a
    # shader that then clamps its depth coordinate at a value no grain can reach
    # piles every clipped grain onto one radius - which is exactly what put a
    # hard-edged dense ring across the hall at the third dolly stage.
    R_NEAR, R_FAR = 0.500, 0.045   # must equal exp(S_MAX), exp(S_MIN) in the shader
    YW = 0.86                      # wall half-height, as a fraction of its half-width
    BAYS, GAP = 18, 0.26           # 18 bays over the span; 26% of each is open
    ROWS, ROW_GAP = 7, 0.34        # rack shelves per wall, and how open the seam is
    INK = 26

    def px(x, y):
        return (c + x * S * SS, c + y * S * SS)

    def ring(t):
        """wall half-width at t of the way down the hall, 0 = nearest"""
        return R_NEAR * math.pow(R_FAR / R_NEAR, t)

    def band(r0, r1, a, b, fill):
        """the quad cut out of one wall between radii r0..r1 and the two
        y/x slopes a..b - in one-point perspective a wall feature holds a
        constant slope at every depth, which is the whole reason the particle
        layer can preserve a grain's angle when it wraps"""
        for s in (-1, 1):
            d.polygon([px(s * r0, a * r0), px(s * r0, b * r0),
                       px(s * r1, b * r1), px(s * r1, a * r1)], fill=fill)

    # the two walls, solid, the full depth of the hall
    band(R_NEAR, R_FAR, -YW, YW, INK)

    # rack shelves - the horizontal beat is what says servers rather than walls.
    # Cut as slopes, not as lines of fixed pixel width: a fixed width closes the
    # far seams into solid ink and leaves the near ones as hairlines.
    for u in range(ROWS + 1):
        m = (u / ROWS * 2 - 1) * YW
        h = YW / ROWS * ROW_GAP
        band(R_NEAR, R_FAR, m - h, m + h, 255)

    # the lit gap between bays. Radial, so it is the one feature that DOES move
    # through the depth coordinate - which is exactly what the eye clocks the
    # forward motion on.
    for i in range(BAYS + 1):
        r0 = ring(min(1.0, (i + GAP) / BAYS))
        r1 = ring(i / BAYS)
        band(r1, r0, -YW, YW, 255)

    # No ceiling or floor plane. A solid return above and below turns the hall
    # into a filled box and the substance reads as a poured mass with a hole in
    # it. Only the two rack walls carry ink; the space between them stays open,
    # which is also what keeps the titles clear.

    im = im.resize((S, S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.7))
    im.save(os.path.join(OUT, dst), optimize=True)
    print(f'{dst:16s} {S}x{S}  bays {BAYS} over r {R_FAR}-{R_NEAR}')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)

    # ── the two drawings ──
    # Almost pure line work, so LINE carries them and TONE is nearly off. inset
    # 48 clears the registration marks printed at the edges of gpu.jpeg; the
    # speck filter in photo_mark() would drop them anyway, but not before they
    # dragged the bounding box out to the full frame.
    # body 0.26: the card and the containers are hollow outlines, and without a
    # fill they arrive as wireframes floating in nothing. A quarter-density fill
    # is a body of substance the contours are drawn on - the bull's relationship
    # between mass and edge, on an object that has an interior.
    photo_mark('Venom/gpu.jpeg', 'gpu.png',
               body=0.26, line=0.88, tone=0.10,
               r_line=0.8, r_tone=3.0, tone_lo=0.10, tone_hi=0.80, grow=1,
               close=7, body_gate=0.12, inset=48)
    photo_mark('Venom/containers.png', 'containers.png',
               body=0.26, line=0.88, tone=0.10,
               r_line=0.8, r_tone=3.0, tone_lo=0.10, tone_hi=0.80, grow=1,
               close=7, body_gate=0.12)

    # ── the portrait ──
    # The only genuine halftone of the three: a 5.1 px dot screen, measured. The
    # face is read by tone, so TONE is the largest weight it gets anywhere - but
    # still under half, and standing on a constant-density body, which is what
    # stops it reading as a printed photograph. LINE at 0.42 keeps the dot screen
    # itself in the map at the pitch buildCloud can still resolve.
    # No crop rectangle any more: the ground is clean white (corner 254) and the
    # frame fade handles the shoulder and the jacket running off the bottom.
    photo_mark('Venom/Batyr.png', 'founder.png',
               body=0.26, line=0.50, tone=0.50,
               r_line=1.0, r_tone=3.4, tone_lo=0.10, tone_hi=0.86, tone_gamma=0.95,
               grow=1,
               close=11, body_gate=0.12, fade=64)

    corridor_mark('corridor.png')
