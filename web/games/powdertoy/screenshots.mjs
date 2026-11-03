// Screenshots for the game page (node scripts/screenshots.mjs powdertoy): the intro text, a scene drawn with
// the mouse (elements chosen through the element search, E), and the heat display (render mode 5).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas', { timeout: 20000 });
  await wait(1500);
  await shot('intro.png');
  const box = await page.$eval('.player-host canvas', (c) => {
    const r = c.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  // game pixel (629x424 window) -> page coordinates
  const at = (x, y) => [box.x + (x + 0.5) * box.w / 629, box.y + (y + 0.5) * box.h / 424];
  await page.mouse.move(...at(300, 200));
  await page.mouse.click(...at(300, 200)); // dismisses the intro text
  await wait(300);
  const pick = async (name) => {
    await page.keyboard.press('KeyE');
    await wait(300);
    await page.keyboard.type(name);
    await wait(200);
    await page.keyboard.press('Enter');
    await wait(300);
  };
  const stroke = async (pts) => {
    await page.mouse.move(...at(...pts[0]));
    await page.mouse.down();
    for (const p of pts.slice(1)) { await page.mouse.move(...at(...p), { steps: 12 }); }
    await page.mouse.up();
    await wait(100);
  };
  for (let i = 0; i < 3; i++) await page.keyboard.press('BracketRight'); // a bigger brush
  await pick('WOOD');
  await stroke([[120, 330], [480, 330]]);
  await stroke([[120, 300], [120, 330]]);
  await stroke([[480, 300], [480, 330]]);
  await pick('SAND');
  await stroke([[180, 60], [280, 70], [180, 90], [280, 100]]);
  await pick('WATR');
  await stroke([[330, 60], [440, 70], [330, 90], [440, 100]]);
  await pick('FIRE');
  await stroke([[140, 310], [190, 315]]);
  await wait(4000);
  await shot('playing.png');
  await page.keyboard.press('Digit5');
  await wait(1200);
  await shot('heat.png');
}
