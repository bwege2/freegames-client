// Screenshots for the game page (node scripts/screenshots.mjs fishfillets): the map with the first level
// selected, then that level with the fish talking.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  await wait(4000);
  const at = async (x, y, w, h) => {
    const canvas = await page.$('.player-host canvas');
    const b = await canvas.boundingBox();
    return [b.x + (x * b.width) / w, b.y + (y * b.height) / h];
  };
  await page.mouse.move(...(await at(320, 121, 640, 480))); // the first level's dot
  await wait(1500);
  await shot('worldmap.png');
  await page.mouse.down();
  await wait(80);
  await page.mouse.up();
  await wait(9000);
  await shot('playing.png');
}
