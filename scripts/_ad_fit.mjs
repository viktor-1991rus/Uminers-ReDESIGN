import { chromium } from 'playwright-core'
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
for (const [fit, oy, tag] of [[0.42,-0.04,'042-004'],[0.42,-0.02,'042-002'],[0.44,-0.04,'044-004']]) {
  const ox = -(0.83-0.5)*2*(1440/900)*fit
  await page.evaluate(([f,x,y]) => { window.__venom.set('fit',f); window.__venom.set('offsetX',x); window.__venom.set('offsetY',y) }, [fit, ox, oy])
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${OUT}/ad2-award-${tag}.png` })
}
await browser.close()
