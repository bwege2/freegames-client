// Screenshots for the game page (node scripts/screenshots.mjs kiki): the main menu over the first level, the
// first level, Electro (reached with the original's debug mode, F9, whose Escape menu has "next level"), and
// the level selection.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const press = async (key, ms = 400) => { await page.keyboard.press(key); await wait(ms); };
  await page.waitForSelector('.player-host canvas', { timeout: 30000 });
  await wait(3000);
  await shot('menu.png');
  await press('Enter', 1500); // new game
  await press('ArrowRight', 300); // the intro text goes, kiki turns
  await press('ArrowLeft', 300);
  await page.keyboard.down('ArrowUp');
  await wait(450);
  await page.keyboard.up('ArrowUp');
  await wait(1200);
  await shot('start.png');
  await press('F9', 200);
  for (let i = 0; i < 3; i++) {
    await press('Escape', 600);
    await press('Enter', 1500); // next level
    // the level's name goes away with the next key (the original freezes it when the level changes while it fades)
    await press('F10', 1200);
  }
  await press('F9', 1200);
  await shot('electro.png');
  await press('Escape', 700);
  await press('ArrowDown', 200);
  await press('ArrowDown', 200);
  await press('Enter', 2500); // load level
  await shot('levels.png');
}
