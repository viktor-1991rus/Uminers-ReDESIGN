import { chromium } from 'playwright-core'
const OUT = '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers-3/806c8a2d-68d7-49b2-a137-6fbcd07e356f/scratchpad'
const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:8900/?s=company', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.mouse.move(720, 450); await page.mouse.click(720, 700).catch(()=>{})
await page.waitForTimeout(2500)
// jump to company
await page.mouse.wheel(0, 400); await page.waitForTimeout(2600)
// find a stage with an award: step until an img inside jw__award.is-on exists
for (let i = 0; i < 9; i++) {
  const has = await page.evaluate(() => !!document.querySelector('.jw__award.is-on img'))
  const box = await page.evaluate(() => {
    const el = document.querySelector('.jw__award.is-on img'); if (!el) return null
    const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  console.log('stage', i, has, JSON.stringify(box))
  if (has) { await page.screenshot({ path: `${OUT}/ad2-company-award-stage${i}.png` }); break }
  await page.mouse.wheel(0, 400); await page.waitForTimeout(1100)
}
// measure contrast for a few fit/offset pairs
async function measure(fit, ox) {
  await page.evaluate(([fit, ox]) => { window.__venom.set('fit', fit); window.__venom.set('offsetX', ox) }, [fit, ox])
  await page.waitForTimeout(1800)
  const buf = await page.screenshot({ clip: await page.evaluate(() => {
    const r = document.querySelector('.jw__award.is-on img').getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }
  }) })
  return buf
}
import fs from 'fs'
for (const [fit, ox, tag] of [[0.46,-0.49,'046'],[0.44,-0.465,'044'],[0.42,-0.4435,'042'],[0.40,-0.4224,'040']]) {
  const b = await measure(fit, ox)
  fs.writeFileSync(`${OUT}/ad2-award-crop-${tag}.png`, b)
  await page.screenshot({ path: `${OUT}/ad2-company-fit-${tag}.png` })
}
await browser.close()
