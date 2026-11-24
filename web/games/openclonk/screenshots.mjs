// node scripts/screenshots.mjs openclonk: the game page's screenshots, taken from the port. The page starts the original
// without a scenario: its start menu asks a new user for a player (the modal player dialog), then "Start Game" opens the
// scenario selection with the Tutorials folder first; Tutorial01 ("Wandering Wipf") starts with the guide's message and the
// player's controls off until the intro is clicked through (its Script.c), then D walks the clonk over the bridge.
// The start menu is driven with the keys the original gives it: Return on the focused button or list entry.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  const canvas = async () => page.$eval('.player-host canvas', (c) => { const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  // the content is loaded and the sounds decoded; the panel goes when the original runs
  await page.waitForFunction(() => document.querySelector('.player-host .oc-panel')?.hidden, { timeout: 600000 });
  await sleep(15000);
  // the new player's dialog over the main menu: a name, Return
  await page.keyboard.type('Clonk', { delay: 120 });
  await sleep(1500);
  await shot('startmenu-newplayer.png');
  await page.keyboard.press('Enter');
  await sleep(4000);
  await shot('startmenu.png');
  // "Start Game" has the focus: Return opens the scenario selection, Return the Tutorials folder, Return Tutorial01
  await page.keyboard.press('Enter');
  await sleep(8000);
  await page.keyboard.press('Enter');
  await sleep(5000);
  await shot('scenarios.png');
  await page.keyboard.press('Enter');
  await sleep(40000);
  await shot('tutorial01.png');
  // the guide's "Next message" button (its script GUI window at the dialog's right edge), three times
  const r = await canvas();
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(r.x + r.w * 745 / 1024, r.y + r.h * 165 / 768);
    await sleep(200);
    await page.mouse.down();
    await sleep(100);
    await page.mouse.up();
    await sleep(1500);
  }
  await page.keyboard.down('KeyD');
  await sleep(3000);
  await page.keyboard.up('KeyD');
  await sleep(1500);
  await shot('tutorial01-bridge.png');
};
