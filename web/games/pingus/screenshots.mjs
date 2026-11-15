// Screenshots for the game page (node scripts/screenshots.mjs pingus): the main menu, Tutorial Island after the
// intro story, and the first tutorial level being played.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  const canvas = await page.$('.player-host canvas');
  const at = async (x, y) => {
    const b = await canvas.boundingBox();
    return [b.x + x * b.width / 800, b.y + y * b.height / 600];
  };
  const click = async (x, y) => {
    const [px, py] = await at(x, y);
    await page.mouse.move(px, py);
    await wait(150);
    await page.mouse.down();
    await wait(80);
    await page.mouse.up();
  };
  await wait(3000);
  await page.mouse.move(...(await at(275, 280))); // over "Story"
  await wait(800);
  await shot('menu.png');
  await click(275, 280); // Story: the intro story comes first
  await wait(2500);
  await page.keyboard.press('Escape'); // past the story, to the map
  await wait(2000);
  await page.mouse.move(...(await at(400, 300))); // over the first level's dot, where the pingu stands
  await wait(800);
  await shot('worldmap.png');
  await click(400, 300); // its start screen
  await wait(2000);
  await click(680, 480); // Play
  await wait(2500);
  await page.keyboard.down('Space'); // fast forward until a few pingus are out
  await wait(5000);
  await page.keyboard.up('Space');
  await page.mouse.move(...(await at(400, 450)));
  await wait(500);
  await shot('playing.png');
}
