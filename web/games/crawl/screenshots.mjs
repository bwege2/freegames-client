// Screenshots for the game page (npm run build && node web/scripts/screenshots.mjs crawl): the title screen,
// a Human Fighter's first Dungeon level, the inventory and the character sheet.
export default async function (page, shot) {
  const text = () => page.evaluate(() => window.__crawl?.text() ?? '');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (what, ms = 30000) => {
    for (let i = 0; i < ms / 100; i++) {
      const t = await text();
      if (typeof what === 'string' ? t.includes(what) : what.test(t)) return t;
      await sleep(100);
    }
    throw new Error(`waited in vain for ${what}; the screen:\n${await text()}`);
  };
  const press = async (...keys) => {
    for (const k of keys) {
      if (k === '\r') await page.keyboard.press('Enter');
      else if (k === '\x1b') await page.keyboard.press('Escape');
      else if (k.length > 1) await page.keyboard.press(k);
      else await page.keyboard.type(k);
      await sleep(120);
    }
  };
  await until('Dungeon Crawl Stone Soup');
  await shot('title.png');
  await press('a', 'a', 'l', 'a');
  await until('Enter your name');
  await press('T', 'e', 's', 't', '\r');
  await until('Dungeon:1');
  // explore a little, then stop at the first interruption
  for (let i = 0; i < 20; i++) {
    await press('o');
    await sleep(400);
    const t = await text();
    if (/-- press any key --|You cannot|There are no unexplored|You die/.test(t)) break;
    if (/Monster|monster/.test(t)) break;
  }
  await sleep(500);
  await shot('dungeon.png');
  await press('i');
  await sleep(500);
  await shot('inventory.png');
  await press('\x1b', 'C');
  await sleep(500);
  await shot('character.png');
}
