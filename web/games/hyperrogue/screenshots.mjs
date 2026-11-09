// Screenshots for the game page (node scripts/screenshots.mjs hyperrogue): the start menu, a walk in the
// Icy Land and the Crossroads, and the Esc screen (the quest status and how to unlock more lands).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 30000 });
  await wait(2500);
  await shot('start.png');
  await page.keyboard.press('Escape'); // leave the start menu: the game in the Icy Land
  await wait(1200);
  for (const k of ['h', 'j', 'b', 'h', 'y', 'j', 'n', 'h', 'b', 'j', 'h', 'y']) {
    await page.keyboard.press(k);
    await wait(350);
  }
  await wait(1500);
  await shot('playing.png');
  await page.keyboard.press('Escape');
  await wait(1200);
  await shot('quest.png');
}
