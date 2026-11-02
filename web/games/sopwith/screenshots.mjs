// Screenshots for the game page (node scripts/screenshots.mjs sopwith): the title menu and the
// original level in flight. The plane starts on the runway; pulling up at once clears the ox.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 20000 });
  await wait(2500);
  await shot('title.png');
  await page.keyboard.press('KeyS'); // single player
  await wait(200);
  await page.keyboard.press('KeyN'); // novice: no animals or enemy planes
  await wait(300);
  await page.keyboard.down('KeyX');
  await wait(500);
  await page.keyboard.down('Comma');
  await wait(500);
  await page.keyboard.up('Comma');
  await page.keyboard.up('KeyX');
  await wait(150);
  await shot('playing.png');
}
