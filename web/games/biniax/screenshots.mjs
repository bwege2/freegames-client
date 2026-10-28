// Screenshots for the game page (node scripts/screenshots.mjs biniax): the menu, then a game.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  await wait(600);
  await page.keyboard.press('ArrowDown');
  await wait(200);
  await shot('menu.png');
  await page.keyboard.press('Space'); // New
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press(['ArrowUp', 'ArrowLeft', 'ArrowUp', 'ArrowRight'][i % 4]);
    await wait(220);
  }
  await shot('playing.png');
}
