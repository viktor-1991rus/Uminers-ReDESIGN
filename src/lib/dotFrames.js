/**
 * Frame tables for the 5×5 dot-matrix icons.
 *
 * This is Linear's actual mechanism, not a line-draw: a 5×5 grid of dots where
 * only opacity changes, held per frame with no interpolation. The discreteness
 * is the whole point — it reads as a machine display rather than as a designer
 * animation.
 *
 * '#' = lit, '.' = dim. Rows top to bottom, columns left to right.
 * Frame counts are deliberately co-prime-ish so six icons on one screen drift
 * apart on their own and never march in step.
 */

const parse = (frames) => frames.map(rows =>
  rows.map(r => r.split('').map(ch => ch === '#'))
)

/* pong — 8 frames, 1600ms. Recovered from Linear's own tables. */
const pong = parse([
  ['.....', '#...#', '##..#', '#...#', '.....'],
  ['.....', '#....', '#...#', '#.#.#', '....#'],
  ['.....', '#....', '#...#', '#...#', '...##'],
  ['.....', '#....', '#...#', '#.#.#', '....#'],
  ['#....', '#....', '##..#', '....#', '....#'],
  ['#....', '#.#.#', '#...#', '....#', '.....'],
  ['#..##', '#...#', '#...#', '.....', '.....'],
  ['....#', '#.#.#', '#...#', '#....', '.....']
])

/* stats — 9 frames, 1800ms. Bars grow, then drop. */
const stats = parse([
  ['.....', '.....', '.....', '.....', '#####'],
  ['.....', '.....', '.....', '#####', '#####'],
  ['.....', '.....', '#.#.#', '#####', '#####'],
  ['.....', '..#.#', '#.#.#', '#####', '#####'],
  ['....#', '..#.#', '#.#.#', '#####', '#####'],
  ['.....', '..#.#', '#.#.#', '#####', '#####'],
  ['.....', '.....', '#.#.#', '#####', '#####'],
  ['.....', '.....', '.....', '#####', '#####'],
  ['.....', '.....', '.....', '.....', '.....']
])

/* blowOut — 9 frames, 1800ms. A checkerboard shock wave out of the centre. */
const blowOut = parse([
  ['.....', '.....', '..#..', '.....', '.....'],
  ['.....', '..#..', '.#.#.', '..#..', '.....'],
  ['..#..', '.#.#.', '#.#.#', '.#.#.', '..#..'],
  ['.#.#.', '#.#.#', '.#.#.', '#.#.#', '.#.#.'],
  ['#.#.#', '.#.#.', '#.#.#', '.#.#.', '#.#.#'],
  ['.#.#.', '#.#.#', '.#.#.', '#.#.#', '.#.#.'],
  ['#.#.#', '.#.#.', '#...#', '.#.#.', '#.#.#'],
  ['.#.#.', '#...#', '.....', '#...#', '.#.#.'],
  ['#...#', '.....', '.....', '.....', '#...#']
])

/* scope — 12 frames, 2400ms. A crosshair crawls, then a 3×3 lock with blanks. */
const scope = parse([
  ['.....', '.....', '..#..', '.###.', '..#..'],
  ['.....', '.....', '.#...', '###..', '.#...'],
  ['.....', '.#...', '###..', '.#...', '.....'],
  ['.#...', '###..', '.#...', '.....', '.....'],
  ['###..', '#.#..', '###..', '.....', '.....'],
  ['.....', '.....', '.....', '.....', '.....'],
  ['###..', '#.#..', '###..', '.....', '.....'],
  ['.....', '.....', '.....', '.....', '.....'],
  ['..#..', '.###.', '..#..', '.....', '.....'],
  ['...#.', '..###', '...#.', '.....', '.....'],
  ['.....', '...#.', '..###', '...#.', '.....'],
  ['.....', '.....', '...#.', '..###', '...#.']
])

/* ── two of our own, in the same idiom ─────────────────────────────────── */

/* surge — 14 frames, 2800ms. A column sweeps across, flashes, sweeps back.
   Reads as current moving through a bus. */
const surge = (() => {
  const blank = () => Array.from({ length: 5 }, () => Array(5).fill(false))
  const col = (c) => { const g = blank(); for (let r = 0; r < 5; r++) g[r][c] = true; return g }
  const all = () => Array.from({ length: 5 }, () => Array(5).fill(true))
  const centre = () => { const g = blank(); g[2][2] = true; return g }
  return [
    col(0), col(1), col(2), col(3), col(4),
    all(),
    col(4), col(3), col(2), col(1), col(0),
    blank(), centre(), blank()
  ]
})()

/* orbit — 16 frames, 3200ms. The perimeter of a 5×5 grid is exactly 16 cells,
   so a dot with a one-cell trail closes the loop with no seam. */
const orbit = (() => {
  const ring = []
  for (let c = 0; c < 5; c++) ring.push([0, c])
  for (let r = 1; r < 5; r++) ring.push([r, 4])
  for (let c = 3; c >= 0; c--) ring.push([4, c])
  for (let r = 3; r >= 1; r--) ring.push([r, 0])
  return ring.map((_, i) => {
    const g = Array.from({ length: 5 }, () => Array(5).fill(false))
    const head = ring[i]
    const tail = ring[(i - 1 + ring.length) % ring.length]
    g[head[0]][head[1]] = true
    g[tail[0]][tail[1]] = true
    return g
  })
})()

export const DOT_FRAMES = { pong, stats, blowOut, scope, surge, orbit }

/* dot centres: 1 + index * 3.5 → 1, 4.5, 8, 11.5, 15 in a 16 viewBox */
export const DOT_POS = [1, 4.5, 8, 11.5, 15]
export const FRAME_MS = 200
