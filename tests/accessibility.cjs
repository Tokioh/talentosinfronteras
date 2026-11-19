// Run with Playwright available: node tests/accessibility.cjs
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const preferences = ['contrast','large','spacing','links','font','align','width','focus','decorations','motion'];
const server = http.createServer((req, res) => {
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  if (!['index.html','styles.css','accessibility.css','app.js'].includes(file)) {
    res.writeHead(404).end(); return;
  }
  res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html');
  res.end(fs.readFileSync(path.join(root, file)));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('#access-button').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#access-button').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'close-access');
    assert.equal(await page.locator('#access-panel input[type=checkbox]').count(), 10);
    for (const id of preferences) await page.locator('#'+id).check();
    assert.equal(await page.evaluate(() => ['contrast','large','spaced','underlined','simple-font','left-aligned','short-lines','strong-focus','hide-decorations','reduce-motion'].every(c => document.body.classList.contains(c))), true);
    assert.equal(await page.locator('.hero-art').isHidden(), true);
    assert.match(await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily), /Arial/);
    await page.reload();
    await page.locator('#access-button').click();
    for (const id of preferences) assert.equal(await page.locator('#'+id).isChecked(), true);
    await page.locator('#spacing').focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#access-panel').isHidden(), true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'access-button');
    await page.locator('#access-button').click();
    // All preferences on, including increased size and spacing, must reflow.
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({width, height:900});
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `Horizontal overflow at ${width}px`);
    }
    await page.locator('#reset-access').click();
    for (const id of preferences) assert.equal(await page.locator('#'+id).isChecked(), false);
    assert.equal(await page.locator('.hero-art').isVisible(), true);
    // Animated opening, then switching reduction on cancels motion immediately.
    await page.locator('#close-access').click();
    await page.waitForFunction(() => document.querySelector('#access-panel').hidden);
    await page.locator('#access-button').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#access-panel').evaluate(el => el.getAnimations({subtree:true}).some(a => a.playState==='running')), true);
    await page.locator('#motion').check();
    assert.equal(await page.locator('#access-panel').evaluate(el => el.getAnimations({subtree:true}).length), 0);
    assert.equal(await page.locator('.access-option').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    await page.locator('#reset-access').click();
    // Close/open reversal must leave the disclosure in the requested state.
    await page.evaluate(() => {
      document.querySelector('#close-access').click();
      document.querySelector('#access-button').click();
    });
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#access-panel').isVisible(), true);
    assert.equal(await page.locator('#access-panel').evaluate(el => el.inert), false);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(() => document.querySelector('#motion').disabled);
    assert.equal(await page.locator('#motion').isChecked(), true);
    assert.equal(await page.locator('#motion').isDisabled(), true);
    await page.locator('#reset-access').click();
    assert.equal(await page.locator('#motion').isChecked(), true);
    // Blocked storage must not prevent preferences from working.
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => {
      Storage.prototype.setItem = () => {throw new Error('blocked')};
      Storage.prototype.getItem = () => {throw new Error('blocked')};
    });
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(`http://127.0.0.1:${server.address().port}`);
    await blockedPage.locator('#access-button').click();
    await blockedPage.locator('#contrast').check();
    assert.equal(await blockedPage.evaluate(() => document.body.classList.contains('contrast')), true);
    assert.match(await blockedPage.locator('#access-status').textContent(), /solo a esta sesión/);
    await blocked.close();
    assert.deepEqual(errors, []);
    console.log('PASS: 10 preferences, keyboard, persistence, reset, animations, rapid toggles, reduced motion, blocked storage and responsive reflow.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {console.error(error); server.close(); process.exitCode=1});
