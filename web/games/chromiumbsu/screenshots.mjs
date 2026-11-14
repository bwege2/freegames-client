// Screenshots for the game page (node scripts/screenshots.mjs chromiumbsu): the menu with the chrome
// title, then level 1 a few seconds in, firing and moving.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 30000 });
  await wait(6000);
  await shot('menu.png');
  await page.keyboard.press('Enter'); // new game
  await wait(500);
  await page.keyboard.down('Space');
  for (const [key, ms] of [['ArrowLeft', 60], ['ArrowRight', 120], ['ArrowLeft', 60], ['ArrowDown', 80]]) {
    await page.keyboard.down(key);
    await wait(ms);
    await page.keyboard.up(key);
    await wait(900);
  }
  await wait(3500);
  await shot('playing.png');
  await page.keyboard.up('Space');
}
