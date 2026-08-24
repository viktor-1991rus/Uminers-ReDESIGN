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
const names = ['intro','company','ai','sites','desk']
for (let i = 1; i < 5; i++) {
  // company has stages; drive by menu instead
  await page.evaluate((i) => {
    const b = document.querySelectorAll('.deckmenu__list button')[i]; b.click()
  }, i)
  await page.waitForTimeout(3200)
  await page.screenshot({ path: `${OUT}/ad2-sec-${names[i]}.png` })
}
await browser.close()
