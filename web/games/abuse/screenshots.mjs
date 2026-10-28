// node scripts/screenshots.mjs abuse: the game page's screenshots, taken from the port
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  const click = async (x, y) => {
    const r = await page.$eval('.player-host canvas', (c) => { const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    await page.mouse.move(r.x + (x + 0.5) * r.w / 320, r.y + (y + 0.5) * r.h / 200);
    await sleep(150);
    await page.mouse.down();
    await sleep(150);
    await page.mouse.up();
    await sleep(150);
  };
  const hold = async (key, ms) => {
    await page.keyboard.down(key);
    await sleep(ms);
    await page.keyboard.up(key);
  };
  await page.waitForFunction(() => window.__abuse?.frames() > 1, { timeout: 30000 });
  await sleep(1500);
  for (let i = 0; i < 12; i++) await click(274, 114); // the gamma dialog's right arrow: a lighter darkest grey
  await click(52, 160); // its check mark
  await sleep(4000);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => / st=6/.test(window.__abuse.state()), { timeout: 30000 });
  await sleep(2500);
  await shot('menu.png');
  await click(303, 12); // start
  await page.waitForFunction(() => / tick=/.test(window.__abuse.state()), { timeout: 30000 });
  await sleep(1500);
  await hold('ArrowRight', 1300);
  await click(250, 95);
  await page.mouse.down();
  await sleep(500);
  await shot('level1.png');
  await page.mouse.up();
  await hold('ArrowRight', 2500);
  await hold('ArrowUp', 150);
  await page.mouse.move(600, 300);
  await page.mouse.down();
  await sleep(1500);
  await shot('level1-fight.png');
  await page.mouse.up();
};
