import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Users/viktorum/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', args: ['--enable-unsafe-swiftshader','--use-gl=angle'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', m => console.log(m.type().toUpperCase(), m.text().slice(0,900)))
page.on('pageerror', e => console.log('PAGEERR', e.message))
await page.goto('http://localhost:8900/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
console.log('venom?', await page.evaluate(() => !!window.__venom))
await browser.close()
