import { chromium } from 'playwright-core'
const OUT = '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers-3/806c8a2d-68d7-49b2-a137-6fbcd07e356f/scratchpad'
const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 },
  recordVideo: { dir: `${OUT}/vid`, size: { width: 1440, height: 900 } } })
const page = await ctx.newPage()
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.mouse.move(720, 450); await page.mouse.click(720, 700).catch(()=>{})
await page.waitForTimeout(4000)
const t0 = Date.now()
await page.evaluate(() => document.querySelectorAll('.deckmenu__list button')[1].click())
console.log('company click at +', ((Date.now()-t0)/1000).toFixed(2))
await page.waitForTimeout(5000)
console.log('ai click at +', ((Date.now()-t0)/1000).toFixed(2))
await page.evaluate(() => document.querySelectorAll('.deckmenu__list button')[2].click())
await page.waitForTimeout(5000)
await ctx.close(); await browser.close()
