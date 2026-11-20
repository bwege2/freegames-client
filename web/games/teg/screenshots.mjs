// Screenshots for the game page (node scripts/screenshots.mjs teg): the welcome, the setup and a
// two-player hot-seat board with the mission card. The map and the army circles are the port's.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const here = dirname(fileURLToPath(import.meta.url));
  const theme = JSON.parse(readFileSync(join(here, 'assets', 'theme', 'theme.json'), 'utf8'));
  const centers = [];
  for (const c of theme.continents) {
    for (const k of c.countries) centers.push({ x: c.x + k.x + (k.w + k.armyX) / 2, y: c.y + k.y + (k.h + k.armyY) / 2 });
  }
  await page.waitForSelector('.teg-welcome');
  await wait(700);
  await shot('welcome.png');
  await page.evaluate(() => { for (const b of document.querySelectorAll('.teg-welcome button')) if (b.textContent === 'New game') b.click(); });
  await wait(400);
  // make both seats human, so the current seat can show its mission in the screenshot
  await page.evaluate(() => {
    for (const s of document.querySelectorAll('.teg-setup-row select')) {
      if ([...s.options].some((o) => o.textContent === 'Robot')) {
        s.value = '1';
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await page.evaluate(() => { const b = [...document.querySelectorAll('.teg-setup-row input[type=checkbox]')][0]; if (b) b.click(); });
  await wait(200);
  await shot('new-game.png');
  await page.evaluate(() => { for (const b of document.querySelectorAll('.teg-dialog button')) if (b.textContent === 'Start') b.click(); });
  await wait(900);
  const box = await page.$eval('.player-host canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const at = (c) => [box.x + c.x / 640 * box.w, box.y + c.y / 382 * box.h];
  // put some armies on the first country of the player whose turn it is (the game starts with 5)
  const remaining = async () => (await page.$eval('#teg-remaining-tools', (e) => e.textContent)) || '';
  let country = null;
  const before = await remaining();
  for (const c of centers) {
    await page.mouse.click(...at(c));
    await wait(50);
    if ((await remaining()) !== before) { country = c; break; }
  }
  if (country) {
    for (let i = 1; i < 5; i++) { await page.mouse.click(...at(country)); await wait(40); }
  }
  await wait(300);
  await shot('placing.png');
  // the current player's mission
  await page.evaluate(() => { for (const b of document.querySelectorAll('.teg-menus button')) if (b.textContent === 'View') b.click(); });
  await wait(150);
  await page.evaluate(() => { for (const b of document.querySelectorAll('.teg-drop button')) if (b.textContent === 'Mission') b.click(); });
  await wait(350);
  await shot('mission.png');
}
