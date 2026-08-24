/**
 * Cut the black ground out of the press renders and re-seat every product on
 * one canvas.
 *
 * Two separate problems, and they are solved in this order because the second
 * depends on the first:
 *
 *   1. THE GROUND. A vendor render ships on flat black. The catalogue plate is
 *      paper and composites through mix-blend-mode: multiply, so black ground
 *      multiplies the whole plate to black — the tile becomes a filled
 *      rectangle. A luma threshold is the obvious fix and the wrong one: a
 *      GPU shroud is nearly as dark as its background, so a global threshold
 *      eats the product. This floods from the border instead, so only black
 *      REACHABLE FROM THE EDGE is removed and a dark shroud enclosed by bright
 *      contacts survives.
 *
 *   2. THE SCALE. Every vendor crops to its own convention: measured across the
 *      current assets, an ASIC fills ~92% of its frame and an H100 render ~55%,
 *      so on a fixed-size plate the two products differ by more than 2× for no
 *      reason a reader could name. No CSS value fixes that — max-height scales
 *      the FRAME, not the object. After the cut, the object's true bounding box
 *      is known, so it is trimmed to it and re-padded onto one 4:3 canvas with
 *      a constant margin. Every product then lands at the same optical size.
 *
 * Renders with a floor reflection cannot be cut: the reflection IS the
 * background and removing it takes the bottom of the object with it. Those are
 * listed in KEEP_DARK, and stay on a dark plate deliberately.
 *
 * Run: node scripts/cut-dark-assets.mjs
 */
import sharp from 'sharp'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const PUBLIC = path.resolve('public')

/* Scenes, not cut-outs: object standing on a reflective floor with a vignette.
   The bottom of the product and its reflection share the same pixels, so a
   flood from the border either stops at the reflection (leaving a black slab)
   or runs through it (taking the product's base with it). */
const KEEP_DARK = new Set([
  'nvidia-gb200-nvl72',
  'nvidia-dgx-b200',
  'nvidia-dgx-h100',
  /* Added after the derived target list reached it for the first time — the
     hand-written list had never included it, so it had never been tested. It
     cuts "successfully" (73% ground) and the result is still unusable: the
     board is photographed on a reflective floor, and the object itself is
     near-black, so what survives the flood is a black silhouette plus the smear
     of its own reflection. On paper that is worse than the dark plate. */
  'nvidia-hgx-b200'
])

/* How dark a pixel has to be to count as ground, 0-255 on luma.
   Measured, not guessed: at 34 the flood walked straight through the shroud of
   the H100 and H200 boards — a GPU heatsink photographs at luma 20-40 on a
   black set, which overlaps the ground — and what came back was the bright
   interior with the body eaten away. 12 keeps the fill on pixels that are very
   nearly pure black, which is what a studio backdrop actually is; the price is
   a thin dark fringe where the vignette lifts off zero, and a fringe is far
   cheaper than a missing product. */
const GROUND = 12
/* how much of the long side is empty margin on the output canvas */
const MARGIN = 0.09
const OUT_W = 1400
const OUT_H = Math.round(OUT_W * 3 / 4)

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

/** flood-fill the ground from every border pixel; returns the alpha channel */
function cutGround(data, w, h) {
  const alpha = new Uint8Array(w * h).fill(255)
  const seen = new Uint8Array(w * h)
  const stack = []

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const i = y * w + x
    if (seen[i]) return
    const p = i * 4
    if (luma(data[p], data[p + 1], data[p + 2]) > GROUND) return
    seen[i] = 1
    alpha[i] = 0
    stack.push(x, y)
  }

  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }

  while (stack.length) {
    const y = stack.pop(), x = stack.pop()
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
  }
  return alpha
}

/** one pass of averaging on the alpha edge, so the cut is not a staircase */
function feather(alpha, w, h) {
  const out = Uint8Array.from(alpha)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const a = alpha[i]
      // only touch pixels that sit on the boundary
      const n = alpha[i - 1] + alpha[i + 1] + alpha[i - w] + alpha[i + w]
      if ((a === 255 && n < 1020) || (a === 0 && n > 0)) {
        out[i] = Math.round((a * 2 + n / 2) / 4)
      }
    }
  }
  return out
}

async function process(rel) {
  const src = path.join(PUBLIC, rel)
  const slug = path.basename(rel, path.extname(rel))
  const dst = path.join(PUBLIC, path.dirname(rel), slug + '.png')

  const img = sharp(await readFile(src)).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  const cut = feather(cutGround(data, w, h), w, h)

  /* How much of the frame the flood claimed as ground. It was computed at the
     end as a sanity number to print; it is checked here instead, because it is
     the only reliable test of the script's own precondition — that the asset is
     a render on flat black. A JPEG shot on white returns ~0 here: nothing is cut
     and what gets written is the original photo, white ground and all, under a
     .png name. That is worse than doing nothing, because the card reads the
     extension as "cut out" (CatalogueView: p.image.endsWith('.png') → is-cut)
     and drops the multiply that was hiding the white. So a no-op cut is refused
     rather than saved. */
  let removed = 0
  for (let i = 0; i < w * h; i++) if (cut[i] < 128) removed++
  const ground = removed / (w * h)
  if (ground < 0.02) return { slug, skipped: 'not on flat black', ground }

  for (let i = 0; i < w * h; i++) data[i * 4 + 3] = cut[i]

  const cleared = sharp(data, { raw: { width: w, height: h, channels: 4 } })

  // trim to the object's real box, then re-pad — this is step 2 above
  const trimmed = await cleared.png().trim({ threshold: 1 }).toBuffer()
  const box = await sharp(trimmed).metadata()

  const inner = 1 - MARGIN * 2
  const scale = Math.min((OUT_W * inner) / box.width, (OUT_H * inner) / box.height)
  const tw = Math.max(1, Math.round(box.width * scale))
  const th = Math.max(1, Math.round(box.height * scale))

  const out = await sharp({
    create: {
      width: OUT_W, height: OUT_H, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: await sharp(trimmed).resize(tw, th).toBuffer(), gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  await writeFile(dst, out)

  return {
    slug,
    out: path.relative(PUBLIC, dst).replace(/\\/g, '/'),
    ground: (ground * 100).toFixed(1) + '%',
    box: `${box.width}×${box.height}`
  }
}

/* The target list used to be seven paths typed out by hand, which meant a newly
   downloaded asset was silently not processed until someone remembered to add a
   line here. It is derived now, on two rules that make a re-run idempotent:
     · only JPEGs are candidates — a .png in this tree is either already a
       cut-out or an alpha asset that was never on flat black;
     · a JPEG whose .png sibling exists has already been through this script, so
       it is skipped rather than re-cut from the same source.
   Deleting the .png is therefore how you ask for one to be redone. */
const CATALOG = path.join(PUBLIC, 'assets', 'catalog')

const TARGETS = (await readdir(CATALOG, { recursive: true, withFileTypes: true }))
  .filter(e => e.isFile() && /\.jpe?g$/i.test(e.name))
  .map(e => path.relative(PUBLIC, path.join(e.parentPath ?? e.path, e.name)).replace(/\\/g, '/'))
  .sort()

for (const rel of TARGETS) {
  const slug = path.basename(rel, path.extname(rel))
  if (KEEP_DARK.has(slug)) { console.log(`skip  ${slug}  (reflection scene)`); continue }
  if (existsSync(path.join(PUBLIC, path.dirname(rel), slug + '.png'))) {
    console.log(`have  ${slug}  (cut already exists)`); continue
  }
  try {
    const r = await process(rel)
    if (r.skipped) {
      console.log(`leave ${r.slug.padEnd(22)} ${r.skipped} (${(r.ground * 100).toFixed(1)}% ground) — stays ${path.extname(rel)}, card multiplies it`)
      continue
    }
    console.log(`cut   ${r.slug.padEnd(22)} ground ${r.ground.padStart(6)}  box ${r.box}  → /${r.out}`)
  } catch (e) {
    console.log(`FAIL  ${slug}  ${e.message}`)
  }
}
