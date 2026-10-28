// Screenshots for the game page (node scripts/screenshots.mjs passage): the title, then a walk east
// along the top passage and down into the maze. The world is new every game.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  await wait(500);
  await shot('title.png');
  await page.keyboard.press('Space');
  await page.keyboard.down('ArrowRight');
  await wait(4000);
  await page.keyboard.up('ArrowRight');
  await shot('walking.png');
  for (let i = 0; i < 6; i++) {
    await page.keyboard.down('ArrowDown');
    await wait(700);
    await page.keyboard.up('ArrowDown');
    await page.keyboard.down('ArrowRight');
    await wait(900);
    await page.keyboard.up('ArrowRight');
  }
  await shot('maze.png');
}
