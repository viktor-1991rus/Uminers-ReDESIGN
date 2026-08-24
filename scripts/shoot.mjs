/* Dev tool: screenshot pages/sections of the running preview server.
   Usage: node scripts/shoot.mjs <url> <outPrefix> [selector,selector,...] */
import { chromium } from 'playwright-core'

const [, , url, prefix, selectorArg] = process.argv
const selectors = selectorArg ? selectorArg.split(',') : []

const browser = await chromium.launch({
  executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewportSize: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

if (selectors.length === 0) {
  await page.screenshot({ path: `${prefix}-full.png`, fullPage: true })
} else {
  for (const sel of selectors) {
    const el = page.locator(sel).first()
    try {
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1600)
      await page.screenshot({ path: `${prefix}-${sel.replace(/[^a-z0-9]/gi, '')}.png` })
    } catch (e) {
      console.error(`skip ${sel}: ${e.message}`)
    }
  }
}
await browser.close()
console.log('done')
