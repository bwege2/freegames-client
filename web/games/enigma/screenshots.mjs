// Screenshots for the game page (node scripts/screenshots.mjs enigma): the level menu of the tutorial pack, then
// the second tutorial level a few seconds into the game.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  await wait(1500);
  const box = await (await page.$('.player-host canvas')).boundingBox();
  const at = (x, y) => [box.x + x * box.width / 640, box.y + y * box.height / 480];
  const click = async (x, y) => { await page.mouse.click(...at(x, y)); await wait(400); };
  await click(180, 225); // Start Game
  await wait(5000); // the previews are drawn one per frame
  await shot('levels.png');
  await page.keyboard.press('ArrowRight'); // "Doors and Triggers"
  await wait(300);
  await page.keyboard.press('Enter');
  await wait(1500);
  await click(320, 240); // click to continue
  for (let i = 0; i < 60; i++) { await page.mouse.move(...at(320 + 2 * (i % 20), 240 + (i % 30))); await wait(30); }
  await wait(1500);
  await shot('playing.png');
}
