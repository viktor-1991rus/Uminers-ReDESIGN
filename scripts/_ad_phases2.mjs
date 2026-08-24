import { chromium } from 'playwright-core'
const OUT = '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers-3/806c8a2d-68d7-49b2-a137-6fbcd07e356f/scratchpad'
const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.mouse.move(720, 450); await page.mouse.click(720, 700).catch(()=>{})
await page.waitForTimeout(2600)
async function jump(i, tag, frames = 14, everyMs = 150) {
  await page.evaluate((i) => document.querySelectorAll('.deckmenu__list button')[i].click(), i)
  for (let f = 0; f < frames; f++) {
    await page.screenshot({ path: `${OUT}/ad3-${tag}-${String(f*everyMs).padStart(4,'0')}ms.png` })
    await page.waitForTimeout(everyMs - 45)
  }
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${OUT}/ad3-${tag}-settled.png` })
}
await jump(1, 'intro-company')
await jump(2, 'company-ai')
await jump(3, 'ai-sites')
await browser.close()
