import { chromium } from 'playwright-core'
import fs from 'fs'

const OUT = process.argv[2] || '/private/tmp/claude-501/-Users-viktorum-Desktop-Dev-Uminers/66cf8d6c-6fa8-4841-9643-4e62772ad36a/scratchpad/shots'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle']
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true })
page.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()) })
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForFunction(() => !!window.__venom, null, { timeout: 15000 })
await page.waitForTimeout(2500)

const marks = ['bull', 'gpuArt', 'containersArt', 'founderArt']
for (const m of marks) {
  await page.evaluate(async (name) => {
    const { MARKS } = await import('/src/lib/venomBus.js')
    const mk = MARKS[name]
    window.__venom.set('tighten', mk.tighten ?? 0)
    window.__venom.setMark(mk.url, mk)
  }, m)
  await page.waitForTimeout(4200)
  await page.locator('canvas').first().screenshot({ path: `${OUT}/${m}.png` })
  console.log('shot', m)
}
await browser.close()
