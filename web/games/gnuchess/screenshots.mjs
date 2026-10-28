// Screenshots for the game page (npm run build && node scripts/screenshots.mjs gnuchess). The engine
// searches to a fixed depth and does not ponder (easy), so the moves are the same every time.
export default async function (page, shot) {
  const text = () => page.evaluate(() => window.__gnuchess?.text() ?? '');
  const waiting = () => page.evaluate(() => window.__gnuchess?.waiting() ?? false);
  const until = async (what) => {
    for (let i = 0; i < 600; i++) {
      const t = await text();
      if (t.includes(what) && (await waiting())) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`waited in vain for ${what}; the screen ends with:\n${(await text()).slice(-600)}`);
  };
  const type = async (line, what) => {
    const n = (await text()).length;
    await page.keyboard.type(line);
    await page.keyboard.press('Enter');
    for (let i = 0; i < 600; i++) {
      const t = (await text()).slice(n);
      if (t.includes(what) && (await waiting())) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`waited in vain for ${what} after ${line}`);
  };
  await page.waitForFunction(() => !!window.__gnuchess);
  await until('White (1) : ');
  await type('easy', 'White (1) : ');
  await type('depth 5', 'Search to a depth of 5.');
  await type('e4', 'My move is : ');
  await type('Nf3', 'My move is : ');
  await shot('play.png');
  await type('coords', 'Coordinate display enabled.');
  await type('graphic', 'Graphic mode is enabled.');
  await type('d4', 'My move is : ');
  await shot('graphic.png');
  await type('nographic', 'Graphic mode is disabled.');
  await type('nocoords', 'Coordinate display disabled.');
  await type('post', 'White (');
  await type('Nc3', 'My move is : ');
  await type('show game', 'White   Black');
  await shot('thinking.png');
  await page.click('.player-bar .bar-button'); // ← Back
  await page.waitForSelector('.play');
  if (await page.evaluate(() => !!window.__gnuchess)) throw new Error('Back left the game running');
  console.log('Back: the game stopped');
}
