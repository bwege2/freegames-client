// Screenshots for the game page (node scripts/screenshots.mjs ballerburg): the first game of a run is
// always the same (the original's rand() starts at seed 1), so the castles' parts are where they are.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  await wait(800);
  const box = await page.$eval('.player-host canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const at = (x, y) => [box.x + (x + 0.5) * box.w / 640, box.y + (y + 0.5) * box.h / 480];
  const click = async (x, y, ms = 250) => {
    await page.mouse.click(...at(x, y));
    await wait(ms);
  };
  // a dialog object's middle: the cannon dialog is 42x15 characters of 8x16 pixels, centred
  const cannonDlg = (x, y, w) => [(19 + x) * 8 + w * 4, (7 + y) * 16 + 8];
  await shot('castles.png');
  // the left castle's first cannon: aimed a little higher, with more powder
  await click(20, 274);
  for (let i = 0; i < 5; i++) await click(...cannonDlg(26, 3, 3)); // angle +1
  for (let i = 0; i < 4; i++) await click(...cannonDlg(26, 5, 3)); // powder +1
  await shot('cannon.png');
  await click(...cannonDlg(33, 11, 8), 6000); // OK: the shot flies
  // the right castle's treasury: the market
  await click(619, 297, 500);
  await shot('market.png');
}
