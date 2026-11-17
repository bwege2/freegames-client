// Screenshots for the game page (node scripts/screenshots.mjs nogravity): the main menu, then the first
// mission of episode 1 a few seconds in, at its base.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = async (k, after = 600) => { await page.keyboard.press(k); await wait(after); };
  await page.waitForSelector('.player-host canvas', { timeout: 30000 });
  const box = await (await page.$('.player-host canvas')).boundingBox();
  await page.mouse.move(box.x + 2, box.y + 2); // the menus follow the pointer: keep it off the entries
  await wait(11000); // the realtech and Lithium pictures
  await shot('menu.png');
  await key('Enter', 1500); // new game: the pilots
  await key('Enter', 1000); // new pilot
  await page.keyboard.type('Ace', { delay: 120 });
  await key('Enter', 1500);
  await key('Enter', 1500); // the pilot
  await key('ArrowDown', 400); // episode 1
  await key('Enter', 3000); // the mission map
  await key('Enter', 3000); // the first mission: the briefing
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5); // fly straight on
  await key('Enter', 4200); // play: the start camera shows the ship from outside
  await shot('playing.png');
}
