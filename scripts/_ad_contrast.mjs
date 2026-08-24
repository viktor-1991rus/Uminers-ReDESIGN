import { chromium } from 'playwright-core'
import fs from 'fs'
import { PNG } from 'pngjs'
const OUT = '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers-3/806c8a2d-68d7-49b2-a137-6fbcd07e356f/scratchpad'
const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.mouse.move(720, 450); await page.mouse.click(720, 700).catch(()=>{})
await page.waitForTimeout(2400)
await page.mouse.wheel(0, 400); await page.waitForTimeout(2600)
for (let i = 0; i < 9; i++) {
  if (await page.evaluate(() => !!document.querySelector('.jw__award.is-on img'))) break
  await page.mouse.wheel(0, 400); await page.waitForTimeout(1200)
}
const IMG = await page.evaluate(() => { const r = document.querySelector('.jw__award.is-on img').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
console.log('img box', JSON.stringify(IMG))
const lin = (c) => { c/=255; return c<=0.04045? c/12.92 : Math.pow((c+0.055)/1.055,2.4) }
async function band(clip) {
  const buf = await page.screenshot({ clip })
  const png = PNG.sync.read(buf)
  const L = []
  for (let i = 0; i < png.data.length; i += 4) {
    L.push(0.2126*lin(png.data[i]) + 0.7152*lin(png.data[i+1]) + 0.0722*lin(png.data[i+2]))
  }
  L.sort((a,b)=>a-b)
  const q = (p) => L[Math.min(L.length-1, Math.floor(p*L.length))]
  const glyph = q(0.94), ground = q(0.27)
  return { ratio: (glyph+0.05)/(ground+0.05), glyph, ground, mean: L.reduce((a,b)=>a+b,0)/L.length }
}
// the engraved caption band on the trophy, as a fraction of the asset's own box
const CLIP = { x: Math.round(IMG.x + IMG.w*0.29), y: Math.round(IMG.y + IMG.h*0.598),
               width: Math.round(IMG.w*0.40), height: Math.round(IMG.h*0.078) }
console.log('clip', JSON.stringify(CLIP))
const rows = []
for (const fit of [0.50, 0.46, 0.44, 0.42, 0.40]) {
  for (const oy of [-0.02, -0.06, -0.10, -0.14]) {
    const ox = -(0.83-0.5)*2*(1440/900)*fit
    await page.evaluate(([fit, ox, oy]) => { window.__venom.set('fit', fit); window.__venom.set('offsetX', ox); window.__venom.set('offsetY', oy) }, [fit, ox, oy])
    await page.waitForTimeout(1500)
    const m = await band(CLIP)
    rows.push([fit, oy, ox.toFixed(4), m.ratio.toFixed(2), m.ground.toFixed(3), m.mean.toFixed(3)])
    console.log(rows[rows.length-1].join('  '))
  }
}
await browser.close()
