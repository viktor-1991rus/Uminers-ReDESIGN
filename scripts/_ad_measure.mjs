import fs from 'fs'
import { PNG } from 'pngjs'
const OUT = '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers-3/806c8a2d-68d7-49b2-a137-6fbcd07e356f/scratchpad'
const tags = process.argv.slice(2)
for (const tag of tags) {
  const files = fs.readdirSync(OUT).filter(f => f.startsWith(`ad3-${tag}-`) && f.endsWith('ms.png')).sort()
  console.log('\n== ' + tag + '  (frame, ink px, mean ink L, centroid x)')
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(`${OUT}/${f}`))
    let n = 0, sum = 0, sx = 0
    for (let y = 40; y < 860; y += 2) for (let x = 0; x < png.width; x += 2) {
      const i = (y * png.width + x) * 4
      const L = (png.data[i] * 0.2126 + png.data[i+1] * 0.7152 + png.data[i+2] * 0.0722) / 255
      if (L < 0.86) { n++; sum += L; sx += x }
    }
    console.log(f.split('-').pop().padStart(8), String(n).padStart(7), (sum/n).toFixed(3), (sx/n/png.width).toFixed(3))
  }
}
