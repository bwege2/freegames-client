// Screenshots for the game page (node scripts/screenshots.mjs pinball): the construction set with a
// few parts put on the starting table, then its test play with the ball on the way down.
const W = 280;
const H = 192;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function (page, shot) {
  await page.waitForSelector('.player-host canvas');
  const box = await (await page.$('.player-host canvas')).boundingBox();
  const at = (x, y) => [box.x + ((x + 0.5) * box.width) / W, box.y + ((y + 0.5) * box.height) / H];
  // the cursor follows the mouse 12 pixels an update: go there, then wait for it
  const go = async (x, y) => {
    await page.mouse.move(...at(x, y), { steps: 4 });
    await sleep(600);
  };
  const drag = async (from, to) => {
    await go(...from);
    await page.mouse.down();
    await sleep(150);
    await go(...to);
    await page.mouse.up();
    await sleep(300);
  };
  // the title, then a key for the construction set
  await sleep(300);
  await page.keyboard.press('Enter');
  await sleep(800);
  // two flippers, two bumpers, a kicker, the ball
  await drag([174, 10], [44, 160]);
  await drag([188, 10], [84, 160]);
  await drag([174, 54], [50, 70]);
  await drag([191, 54], [95, 95]);
  await drag([201, 78], [110, 128]);
  await drag([247, 7], [70, 20]);
  await go(140, 100);
  await shot('editor.png');
  // the test play: the ball falls from where it was put
  await drag([262, 120], [262, 120]);
  await sleep(1500);
  await shot('play.png');
}
