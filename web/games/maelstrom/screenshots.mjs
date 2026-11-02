// Screenshots for the game page (node scripts/screenshots.mjs maelstrom): the
// original title/menu and the first wave.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 20000 });
  await wait(2500);
  await shot('title.png');
  await page.keyboard.press('KeyP');
  await wait(2500);
  await shot('playing.png');
  await page.keyboard.press('Escape');
  await wait(200);
  await page.keyboard.press('Escape');
  await wait(400);
  await page.keyboard.press('2');
  await wait(2000);
  await shot('multiplayer.png');
}
