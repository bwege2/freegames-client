// A manual check in headless Chromium (not part of npm test): node games/astromenace/test/browser-debug.mjs <url> <outdir>
// opens the game, prints the console, clicks through the menu into mission 1 and saves screenshots.
import puppeteer from 'puppeteer-core';

const [url, out] = process.argv.slice(2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? '/usr/bin/chromium-browser',
  headless: true,
  protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
try {
  const page = await browser.newPage();
  page.on('console', async (m) => {
    console.log('console:', m.type(), m.text());
    for (const a of m.args()) {
      const st = await a.evaluate((e) => (e instanceof Error ? e.stack : '')).catch(() => '');
      if (st) console.log(st);
    }
  });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.setViewport({ width: 1024, height: 804 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.player-host canvas', { timeout: 120000 });
  const box = async () => (await page.$('.player-host canvas')).boundingBox();
  const click = async (x, y) => {
    const b = await box();
    const W = b.width / b.height > 1.4 ? 1228 : 1024;
    await page.mouse.click(b.x + ((x - 614 + W / 2) / W) * b.width, b.y + (y / 768) * b.height);
  };
  await wait(8000);
  await page.screenshot({ path: `${out}/1-menu.png` });
  await click(614, 197); // START GAME
  await wait(2500);
  await page.screenshot({ path: `${out}/2-profile.png` });
  await page.keyboard.press('Escape'); // tips dialog
  await wait(800);
  await page.keyboard.type('Pilot');
  await page.keyboard.press('Enter');
  await wait(800);
  await click(614 + 28 + 128, 697); // MISSION LIST
  await wait(2500);
  await page.screenshot({ path: `${out}/3-missions.png` });
  await click(614 + 28 + 128, 697); // NEXT
  await wait(2500);
  await page.screenshot({ path: `${out}/4-workshop.png` });
  await click(614 + 354 + 66, 697); // START
  await wait(1500);
  await page.screenshot({ path: `${out}/5-tips.png` });
  await click(898, 635); // the dialog's START
  await wait(9000);
  await page.mouse.down();
  await wait(4000);
  await page.screenshot({ path: `${out}/6-game.png` });
  await page.mouse.up();
  await wait(15000);
  await page.screenshot({ path: `${out}/7-game.png` });
} finally {
  await browser.close();
}
