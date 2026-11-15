// Screenshots for the game page: node scripts/screenshots.mjs cdogs (after npm run build).
// The menus are walked with keys; the missions start through the port's test hook (window.__cdogs.start),
// because the screens between them (briefing, equipment) take a minute of key presses.
export default async (page, shot) => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // the game polls its keys once per frame (70/s): hold a key long enough to be seen
  const key = async (k, ms = 700) => { await page.keyboard.down(k); await wait(110); await page.keyboard.up(k); await wait(ms); };
  const hold = async (k, ms) => { await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k); };
  await page.waitForSelector('.player-host canvas', { timeout: 30000 });
  await wait(4000);
  await page.mouse.move(2, 2);
  await page.focus('.player-host');
  await shot('main-menu.png');

  await key('Enter', 900);   // Start
  await key('ArrowDown', 250);
  await key('ArrowDown', 250);
  await key('ArrowDown', 350);
  await key('Enter', 900);   // Online
  await shot('online-menu.png');
  await wait(300);

  // a mission of the first campaign
  await page.evaluate(() => window.__cdogs.start('missions/cyberdogs.cdogscpn', 0, 0, 1));
  await page.waitForFunction(() => window.__cdogs?.stack().some((s) => String(s).endsWith(':game')), { timeout: 30000 });
  await wait(2500);
  await shot('mission.png');
  for (const k of ['ArrowRight', 'ArrowDown', 'ArrowRight', 'ArrowUp']) {
    await hold(k, 700);
    await wait(400);
  }
  await hold('x', 250);
  await wait(600);
  await shot('mission-2.png');

  // a dogfight, two players on one keyboard
  await page.evaluate(() => window.__cdogs.start('dogfights/cubicle.cdogscpn', 1, 0, 2));
  await page.waitForFunction(() => window.__cdogs?.stack().some((s) => String(s).endsWith(':game')), { timeout: 30000 });
  await wait(2500);
  await hold('ArrowLeft', 500);
  await wait(400);
  await hold('Digit8', 500);
  await shot('dogfight.png');
};
