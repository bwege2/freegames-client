// Screenshots for the game page (npm run build && node scripts/screenshots.mjs brogue): the title screen,
// a seeded game's first level explored (Play > New Seeded Game, seed 1) in text mode and with the tiles,
// and the inventory with an item's description.
export default async function (page, shot) {
  const text = () => page.evaluate(() => window.__brogue?.text() ?? '');
  const idle = () => page.evaluate(() => window.__brogue?.idle() ?? false);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (what, ms = 30000) => {
    for (let i = 0; i < ms / 100; i++) {
      const t = await text();
      if ((typeof what === 'string' ? t.includes(what) : what.test(t)) && (await idle())) return t;
      await sleep(100);
    }
    throw new Error(`waited in vain for ${what}; the screen:\n${await text()}`);
  };
  const press = async (...keys) => {
    for (const k of keys) {
      if (k.length > 1) await page.keyboard.press(k);
      else await page.keyboard.type(k);
      await sleep(150);
    }
  };
  await until('New Game');
  await sleep(1500); // the flames rise
  await shot('title.png');

  // Play > New Seeded Game: seed 1
  await press('p');
  await sleep(500);
  await press('s');
  await until(/seed/i);
  for (let i = 0; i < 25; i++) await press('Backspace');
  await press('1', 'Enter');
  await until('Depth: 1');
  // explore until there is nothing left to explore (or a monster interrupts it often enough)
  for (let i = 0; i < 25; i++) {
    await press('x');
    await sleep(1500);
    await until('Depth', 60000);
    const t = await text();
    if (/Explored|explored this level|Not exploring/.test(t)) break;
    if (/--MORE--/i.test(t)) await press(' ');
  }
  await press('Escape');
  await sleep(500);
  await shot('depth1.png');
  await press('G');
  await sleep(1000);
  await shot('tiles.png');
  await press('G', 'G');
  await sleep(500);
  await press('i');
  await sleep(800);
  await press('a');
  await sleep(1000);
  await shot('inventory.png');
}
