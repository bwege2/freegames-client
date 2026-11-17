// Screenshots for the game page (npm run build && node scripts/screenshots.mjs opencity): a new city, a
// town built with the game's own tools (mouse drags on the map) and grown for five minutes, and the tool
// circle. The game seeds a new city with the time, like the original; the page's clock is held at 1234 s
// so that the map is always the same (map 1234, which the oracle tests use too).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  page.on('pageerror', (e) => console.log('page error:', e.message));
  await page.evaluateOnNewDocument(() => {
    const real = Date.now.bind(Date);
    const t0 = real();
    Date.now = () => 1234000 + Math.floor((real() - t0) / 1000000);
  });
  await page.reload({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('.player-host canvas', { timeout: 30000 });
  await wait(6000);
  const host = await page.$('.player-host');
  const box = await host.boundingBox();
  // the centre of square (w, l) in the home view: renderer.ts's modelview and gluPerspective(50°)
  const cell = (w, l) => {
    const r = Math.PI / 180;
    const a = 1.2 * (w + 0.5 - 25), c = 1.2 * (l + 0.5 - 30) - 24;
    const y = -18 * Math.cos(35 * r) - c * Math.sin(35 * r);
    const z = -18 * Math.sin(35 * r) + c * Math.cos(35 * r);
    const f = 1 / Math.tan(25 * r), aspect = box.width / box.height;
    const nx = (f / aspect) * a / -z, ny = f * y / -z;
    return [box.x + (nx + 1) / 2 * box.width, box.y + (1 - ny) / 2 * box.height];
  };
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3);
  await shot('start.jpg');
  const tool = async (key, w1, l1, w2, l2) => {
    await page.keyboard.press(key);
    await page.mouse.move(...cell(w1, l1));
    await page.mouse.down();
    await wait(60);
    await page.mouse.move(...cell(w2, l2), { steps: 4 });
    await wait(60);
    await page.mouse.up();
    await wait(120);
  };
  // the forest goes, then roads, zones side by side (R, C, I need each other), a coal plant and a line
  await tool('x', 12, 25, 38, 31);
  await tool('x', 12, 32, 38, 40);
  await tool('p', 12, 33, 38, 33);
  await tool('p', 19, 29, 19, 37);
  await tool('p', 30, 29, 30, 37);
  await tool('r', 13, 30, 18, 32);
  await tool('r', 13, 34, 18, 36);
  await tool('c', 20, 30, 22, 32);
  await tool('c', 20, 34, 22, 36);
  await tool('i', 23, 30, 29, 32);
  await tool('i', 23, 34, 29, 36);
  await tool('r', 31, 30, 34, 32);
  await tool('c', 31, 34, 34, 36);
  await tool('i', 35, 30, 37, 36);
  // the coal plant from the power circle (right button, power, coal), then a line to the zones
  await page.mouse.click(...cell(25, 22), { button: 'right' });
  await wait(200);
  const circle = async (pos) => {
    // GUIBUTTON_POSITION_n inside the 140x140 circle opened at the mouse (x - 70, y + 70 from the bottom)
    const [cx, cy] = cell(25, 22);
    const P = [[19, 73], [19, 33], [55, 13], [91, 33], [91, 73], [55, 93]][pos - 1];
    await page.mouse.move(cx - 70 + P[0] + 15, cy + 70 - P[1] - 15);
    await wait(100);
    await page.mouse.down();
    await page.mouse.up();
    await wait(200);
  };
  await circle(2);      // power
  await circle(5);      // coal power plant
  await tool('?', 33, 26, 33, 26);
  await tool('l', 35, 29, 35, 29);
  await page.mouse.move(box.x + box.width / 2, box.y + 30);
  await wait(300000);
  await shot('town.jpg');
  await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.45, { button: 'right' });
  await wait(300);
  await page.mouse.move(box.x + box.width * 0.45 - 70 + 19 + 15, box.y + box.height * 0.45 + 70 - 73 - 15);
  await wait(300);
  await shot('tools.jpg');
}
