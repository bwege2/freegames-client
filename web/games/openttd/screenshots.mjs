// Screenshot steps for web/scripts/screenshots.mjs. The tool opens the built
// site with ?debug, so window.__openttd is available for tile -> screen
// coordinates; all player actions still go through the real toolbar and panel.
export default async function (page, shot) {
  await page.waitForSelector('.ottd canvas');
  await page.waitForFunction(() => window.__openttd?.ready === true);
  await page.bringToFront();

  const g = () => page.evaluate(() => {
    const game = window.__openttd;
    const w = game.world.world;
    const z = [0.125, 0.25, 0.5, 1, 2][game.zoomIndex];
    const r = game.canvas.getBoundingClientRect();
    return { town: [game.scenario.town.x, game.scenario.town.y], mine: [game.scenario.industries[0].x, game.scenario.industries[0].y], power: [game.scenario.industries[1].x, game.scenario.industries[1].y], rect: { left: r.left, top: r.top }, z, offsetX: game.offsetX, offsetY: game.offsetY, height: w.height, sizeX: w.sizeX };
  });
  const point = async (x, y) => {
    const s = await g();
    const tile = y * s.sizeX + x;
    return [s.rect.left + (y - x) * 32 * s.z + s.offsetX, s.rect.top + (x + y) * 16 * s.z - s.height[tile] * 8 * s.z + s.offsetY + 16 * s.z];
  };
  const center = async (x, y) => {
    await page.evaluate(([x, y]) => {
      const game = window.__openttd;
      const z = [0.125, 0.25, 0.5, 1, 2][game.zoomIndex];
      game.offsetX = game.width / 2 - (y - x) * 32 * z;
      game.offsetY = game.height / 2 - (x + y) * 16 * z + 90;
    }, [x, y]);
    await new Promise((r) => setTimeout(r, 350));
  };
  const button = (label) => page.evaluate((label) => {
    const b = [...document.querySelectorAll('.toolbar button')].find((e) => e.textContent === label);
    if (!b) throw new Error(`no toolbar button ${label}`);
    b.click();
  }, label);
  const clickTile = async (x, y) => { const p = await point(x, y); await page.mouse.click(p[0], p[1]); await new Promise((r) => setTimeout(r, 180)); };
  const drag = async (ax, ay, bx, by) => {
    const a = await point(ax, ay), b = await point(bx, by);
    await page.mouse.move(a[0], a[1]); await page.mouse.down();
    await page.mouse.move(b[0], b[1], { steps: 5 }); await page.mouse.up();
    await new Promise((r) => setTimeout(r, 250));
  };

  const s = await g();
  await center(s.town[0] + 2, s.town[1] + 2);
  await shot('scenario-town.png');

  await center(126, 130);
  await button('Road');
  await drag(126, 129, 126, 132);
  await button('Truck stop');
  await clickTile(126, 128);
  await clickTile(125, 132);
  await shot('road-stops.png');

  await button('Truck stop'); // back to select mode
  const stopPoint = await point(126, 128);
  await page.evaluate(([x, y]) => window.__openttd.selectAt(x, y), stopPoint);
  await page.waitForFunction(() => document.querySelector('.panel')?.textContent.includes('Truck stop'));
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.panel button')].find((e) => e.textContent.includes('Buy'));
    if (!b) throw new Error('buy button missing');
    b.click();
  });
  await new Promise((r) => setTimeout(r, 250));
  const minePoint = await point(126, 128);
  const powerPoint = await point(125, 132);
  await page.evaluate(([x, y]) => window.__openttd.selectAt(x, y), minePoint);
  await page.evaluate(([x, y]) => window.__openttd.selectAt(x, y), powerPoint);
  await page.waitForFunction(() => (window.__openttd.fleet?.trucks[0]?.cargo ?? 0) > 0, { timeout: 15000 });
  await center(126, 130);
  await shot('truck-loaded.png');

  await page.waitForFunction(() => (window.__openttd.fleet?.trucks[0]?.trips ?? 0) > 0, { timeout: 20000 });
  await page.waitForFunction(() => (window.__openttd.fleet?.trucks[0]?.dwell ?? 0) > 0, { timeout: 5000 });
  await shot('finance.png');
}
