// Screenshots for the game page: node scripts/screenshots.mjs liquidwar (after npm run build)
export default async (page, shot) => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForFunction(() => window.__lw?.frames() > 20, { timeout: 60000 });
  await wait(2500);
  const box = await (await page.$('.player-host canvas')).boundingBox();
  const game = (x, y) => ({ x: box.x + x * box.width / 640, y: box.y + y * box.height / 480 });
  // the game polls its mouse once a round of its loop: press long enough to be seen
  const click = async (x, y, ms = 1500) => {
    const p = game(x, y);
    await page.mouse.move(p.x, p.y);
    await wait(150);
    await page.mouse.down();
    await wait(180);
    await page.mouse.up();
    await wait(ms);
  };
  // the page draws the game's cursor once it has seen the pointer: put it over Play for the title shot
  await page.mouse.move(game(315, 158).x, game(315, 158).y);
  await wait(400);
  await shot('title.png');

  // Play: the default teams and map, then the battle; the cursor leads the army
  await click(315, 158, 3000);
  await shot('battle.png');
  for (const [x, y] of [[400, 240], [430, 300], [380, 330]]) {
    await page.mouse.move(game(x, y).x, game(x, y).y);
    await wait(900);
  }
  await wait(1200);
  await shot('battle-2.png');
  // Esc: the game's menu over the battle
  await page.keyboard.press('Escape');
  await wait(1500);
  await shot('menu.png');
};
