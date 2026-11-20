// Screenshots for the game page (node scripts/screenshots.mjs madness): the main menu, the first level of the
// campaign while fighting (after skipping the opening cutscene), then an incident.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 60000 });
  await wait(15000);
  const canvas = await page.$('.player-host canvas');
  const box = await canvas.boundingBox();
  const at = (x, y) => [box.x + (x / 1920) * box.width, box.y + (y / 1080) * box.height];
  const fight = async () => {
    for (let i = 0; i < 3; i++) {
      await page.mouse.down();
      await wait(100);
      await page.mouse.up();
      await wait(250);
    }
  };
  await page.mouse.move(...at(1500, 700));
  await shot('menu.png');
  await page.mouse.click(...at(150, 420)); // Campaigns
  await wait(600);
  await page.mouse.click(...at(200, 166)); // Employee of the Month
  await wait(600);
  await page.mouse.click(...at(850, 400)); // Play: the opening cutscene
  await wait(4000);
  await page.keyboard.down('Escape'); // held: skip it
  await wait(1600);
  await page.keyboard.up('Escape');
  await wait(9000);
  await page.mouse.move(...at(700, 560));
  await fight();
  await shot('playing.png');
  await page.keyboard.press('Escape');
  await wait(300);
  await page.mouse.click(...at(200, 600)); // Main menu
  await wait(800);
  await page.mouse.click(...at(200, 612)); // Incident mode
  await wait(600);
  await page.mouse.click(...at(140, 490)); // Play
  await wait(2500);
  await page.mouse.move(...at(1300, 560));
  await page.mouse.down();
  await wait(120);
  await page.mouse.up();
  await wait(200);
  await shot('incident.png');
}
