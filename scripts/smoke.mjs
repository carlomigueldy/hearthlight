import puppeteer from 'puppeteer'

const url = process.env.SMOKE_URL ?? 'http://localhost:5173'
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(url, { waitUntil: 'networkidle0' })
// click New Game
await page.waitForSelector('button')
await page.click('button')
await page.waitForSelector('canvas', { timeout: 10_000 })
await new Promise((r) => setTimeout(r, 1500)) // let physics settle

const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'))
const frameText = await page.evaluate(() => document.body.innerText)

await browser.close()

if (!hasCanvas) {
  console.error('FAIL: no <canvas> after New Game')
  process.exit(1)
}
if (errors.length) {
  console.error('FAIL: console errors:\n' + errors.join('\n'))
  process.exit(1)
}
if (!/frame\s+\d+/.test(frameText) || /frame\s+0(?!\d)/.test(frameText)) {
  console.error('FAIL: engine frame counter not incrementing')
  process.exit(1)
}
console.log('SMOKE OK')
