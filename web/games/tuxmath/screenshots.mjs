// Screenshots for the game page (node scripts/screenshots.mjs tuxmath): the main menu and the
// Space Cadet arcade game with its falling comets.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 20000 });
  await wait(5000); // the images and sounds load, then the standby logo and the main menu
  await page.keyboard.press('x'); // leave the standby screen if it is still there
  await wait(500);
  await shot('menu.png');
  await page.keyboard.press('Enter'); // Play Alone
  await wait(300);
  await page.keyboard.press('ArrowDown');
  await wait(150);
  await page.keyboard.press('ArrowDown');
  await wait(150);
  await page.keyboard.press('Enter'); // Play Arcade Game
  await wait(300);
  await page.keyboard.press('Enter'); // Space Cadet
  await wait(18000); // let the first comets carry their problems into view
  await shot('playing.png');
}
