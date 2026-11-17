// Screenshots for the game page (node scripts/screenshots.mjs astromenace): the main menu, then mission 1
// a few seconds in (a new pilot profile, the mission list, the workshop's START).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 120000 });
  const click = async (x, y) => {
    const b = await (await page.$('.player-host canvas')).boundingBox();
    const W = b.width / b.height > 1.4 ? 1228 : 1024;
    await page.mouse.click(b.x + ((x - 614 + W / 2) / W) * b.width, b.y + (y / 768) * b.height);
  };
  await wait(8000);
  await shot('menu.png');
  await click(614, 197); // START GAME
  await wait(2500);
  await page.keyboard.press('Escape'); // the tips
  await wait(800);
  await page.keyboard.type('Pilot');
  await page.keyboard.press('Enter');
  await wait(800);
  await click(614 + 28 + 128, 697); // MISSION LIST
  await wait(2500);
  await click(614 + 28 + 128, 697); // NEXT
  await wait(2500);
  await click(614 + 354 + 66, 697); // START
  await wait(1500);
  await click(898, 635); // the shortcut tips' START
  await wait(8000);
  await page.mouse.down();
  await wait(5000);
  await shot('playing.png');
  await page.mouse.up();
}
