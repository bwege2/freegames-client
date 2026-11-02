// Screenshots for the game page (node scripts/screenshots.mjs tuxracer): the splash, the main menu,
// the practice race select and a race on Bunny Hill.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host .tr-splash img', { timeout: 20000 });
  await wait(400);
  await shot('splash.png');
  await page.keyboard.press('Enter');
  await wait(500);
  await shot('menu.png');
  await page.keyboard.press('p');
  await wait(600);
  await page.keyboard.press('ArrowDown');
  await wait(200);
  await page.keyboard.press('ArrowDown');
  await wait(400);
  await shot('select.png');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.tr-hud', { timeout: 30000 });
  await wait(5000);
  await page.keyboard.press('ArrowUp'); // skip the intro
  for (let i = 0; i < 8; i++) {
    await page.keyboard.down('ArrowLeft');
    await wait(250);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('ArrowRight');
    await wait(250);
    await page.keyboard.up('ArrowRight');
  }
  await wait(300);
  await shot('playing.png');
}
