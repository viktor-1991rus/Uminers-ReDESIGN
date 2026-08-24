import { chromium } from 'playwright-core'
import fs from 'fs'
const OUT = '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers-3/806c8a2d-68d7-49b2-a137-6fbcd07e356f/scratchpad'
const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true })
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR', m.text()) })
page.on('pageerror', e => console.log('PAGEERR', e.message))
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
// open the deck (intro gate)
await page.mouse.move(720, 450)
await page.keyboard.press('Enter').catch(()=>{})
await page.waitForTimeout(400)
await page.mouse.click(720, 700).catch(()=>{})
await page.waitForTimeout(3500)
await page.screenshot({ path: `${OUT}/ad2-00-intro.png` })
console.log('deck', await page.evaluate(() => document.querySelector('.deckmenu__count')?.textContent))
async function step(tag, dir = 1) {
  await page.mouse.move(720, 450)
  await page.mouse.wheel(0, dir * 400)
  for (let i = 0; i <= 16; i++) {
    await page.screenshot({ path: `${OUT}/ad2-${tag}-${String(i*150).padStart(4,'0')}ms.png` })
    await page.waitForTimeout(150 - 40)
  }
}
await step('intro-company', 1)
await page.waitForTimeout(2500)
await page.screenshot({ path: `${OUT}/ad2-company-settled.png` })
// company has stages: wheel through them
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(1100) }
await page.waitForTimeout(600)
await step('company-ai', 1)
await page.waitForTimeout(2500)
await page.screenshot({ path: `${OUT}/ad2-ai-settled.png` })
await browser.close()
