// Screenshots for the Lugaru game page: the menu, the campaign map, the opening dialogue and
// third-person play in Turner's village. Driven with the same UI a player uses; no game state is
// injected. Run from web/ with the built site and server jar:
//   node scripts/screenshots.mjs lugaru

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function (page, shot) {
  await page.waitForSelector('.lugaru-menu', { timeout: 120000 });
  await wait(500);
  await shot('menu.png');

  await page.$$eval('.lugaru-menu button', (buttons) => {
    const start = buttons.find((b) => b.textContent === 'Start Game');
    if (start) start.click();
  });
  await page.waitForSelector('.lugaru-map', { timeout: 20000 });
  await wait(700);
  await shot('campaign.png');

  await page.$$eval('.lugaru-map .node', (nodes) => {
    const node = nodes.find((n) => !n.classList.contains('locked'));
    if (node) node.click();
  });
  await page.waitForSelector('.lugaru-dialogue', { timeout: 120000 });
  await wait(1200);
  await shot('dialogue.png');

  // advance the five opening scenes (clicking the game is the original's "continue")
  for (let i = 0; i < 22; i++) {
    await page.mouse.click(512, 420);
    await wait(220);
  }
  await wait(600);
  // walk a few steps so the character is moving in the village shot
  await page.keyboard.down('KeyW');
  await wait(900);
  await page.keyboard.up('KeyW');
  await wait(700);
  await shot('village.png');
}
