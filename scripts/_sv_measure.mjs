import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle']
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForFunction(() => !!window.__venom, null, { timeout: 15000 })
await page.waitForTimeout(2500)

await page.evaluate(() => {
  window.__lt = 0
  new PerformanceObserver(l => { window.__lt += l.getEntries().length })
    .observe({ entryTypes: ['longtask'] })
  window.__grab = () => {
    const c = document.querySelector('canvas')
    const cv = document.createElement('canvas')
    cv.width = 720; cv.height = 450
    const cx = cv.getContext('2d')
    cx.drawImage(c, 0, 0, 720, 450)
    return cx.getImageData(0, 0, 720, 450).data
  }
  window.__stat = () => {
    const d = window.__grab()
    let n = 0, lum = 0, rb = 0, sat = 0
    const L = new Float32Array(720 * 450)
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255
      L[p] = 0.299 * r + 0.587 * g + 0.114 * b
      if (L[p] < 0.93) {           // on the ink
        n++; lum += L[p]; rb += (r - b) * (r - b)
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
        sat += mx > 0 ? (mx - mn) / mx : 0
      }
    }
    // grain = high-frequency energy against a 3x3 mean, over the ink only
    let hf = 0, hn = 0
    for (let y = 1; y < 449; y++) for (let x = 1; x < 719; x++) {
      const p = y * 720 + x
      if (L[p] >= 0.93) continue
      let m = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m += L[p + dy * 720 + dx]
      hf += Math.abs(L[p] - m / 9); hn++
    }
    return {
      cover: n / (720 * 450), lum: lum / n,
      rmsRB: Math.sqrt(rb / n), sat: sat / n, grain: hf / hn
    }
  }
})

const marks = ['bull', 'gpuArt', 'containersArt', 'founderArt']
const rows = []
for (const m of marks) {
  await page.evaluate(async (name) => {
    const { MARKS } = await import('/src/lib/venomBus.js')
    const mk = MARKS[name]
    window.__venom.set('tighten', mk.tighten ?? 0)
    window.__venom.setMark(mk.url, mk)
  }, m)
  await page.waitForTimeout(4200)

  const st = await page.evaluate(() => window.__stat())

  // ── does a tap actually move this mark? ──
  const before = await page.evaluate(() => Array.from(window.__grab()))
  await page.mouse.click(720, 420)
  await page.waitForTimeout(280)
  const after = await page.evaluate(() => Array.from(window.__grab()))
  let diff = 0, dn = 0
  for (let i = 0; i < before.length; i += 4) {
    if (before[i + 1] < 237) { diff += Math.abs(before[i + 1] - after[i + 1]); dn++ }
  }
  await page.waitForTimeout(2600)

  // ── fps across a 2s window at rest ──
  const fps = await page.evaluate(() => new Promise(res => {
    const t = []; let last = performance.now()
    const tick = () => {
      const n = performance.now(); t.push(n - last); last = n
      if (n - t0 < 2000) requestAnimationFrame(tick)
      else {
        t.sort((a, b) => a - b)
        res({ fps: +(1000 / (t.reduce((a, b) => a + b, 0) / t.length)).toFixed(1),
               p95: +t[(t.length * 0.95) | 0].toFixed(1), n: t.length })
      }
    }
    const t0 = performance.now(); requestAnimationFrame(tick)
  }))
  rows.push({ mark: m, ...st, tapDelta: +(diff / dn).toFixed(2), ...fps })
}
const lt = await page.evaluate(() => window.__lt)
console.table(rows.map(r => ({
  mark: r.mark, cover: r.cover.toFixed(3), lum: r.lum.toFixed(3),
  rmsRB: r.rmsRB.toFixed(4), sat: r.sat.toFixed(4), grain: r.grain.toFixed(4),
  tapDelta: r.tapDelta, fps: r.fps, p95: r.p95
})))
console.log('long tasks total:', lt)
await browser.close()
