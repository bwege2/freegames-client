// Screenshots for the game page (node scripts/screenshots.mjs 2048): a new game, then a played board.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host .game-root .tile');
  await wait(500);
  await shot('start.png');
  for (let i = 0; i < 48; i++) {
    await page.keyboard.press(['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'][i % 4]);
    await wait(130);
  }
  await wait(300);
  await shot('playing.png');
}
