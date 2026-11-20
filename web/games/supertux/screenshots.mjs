// Screenshot steps for web/scripts/screenshots.mjs supertux (built site, real server).
export default async function (page, shot) {
  await page.waitForSelector('canvas.st-canvas');
  await new Promise((r) => setTimeout(r, 2500));
  await shot('menu.png');
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 1200));
  await shot('worldmap.png');
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 2400));
  await page.keyboard.down('ArrowRight');
  await new Promise((r) => setTimeout(r, 1600));
  await page.keyboard.up('ArrowRight');
  await new Promise((r) => setTimeout(r, 400));
  await shot('journey.png');
}
