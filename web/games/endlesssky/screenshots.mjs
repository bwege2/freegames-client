// Screenshots for the game page: node scripts/screenshots.mjs endlesssky
// (the built site and server/target/freegames-server.jar).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('canvas.es-canvas', { timeout: 30000 });
  await page.waitForFunction(() => window.__es?.ready, { timeout: 30000 });
  // The real path: New Pilot on the menu, then buy the Star Barge at New Boston.
  const rect = await page.evaluate(() => {
    const r = document.querySelector('canvas.es-canvas').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  await page.mouse.click(rect.x + rect.w / 2, rect.y + (357 / 768) * rect.h);
  await page.waitForSelector('.es-setup', { timeout: 10000 });
  await page.click('.es-setup button');
  await wait(1800);
  await shot('planet.png');
  await page.evaluate(() => window.__es.show('shipyard'));
  await wait(400);
  await shot('shipyard.png');
  await page.evaluate(() => window.__es.show('outfitter'));
  await wait(400);
  await shot('outfitter.png');
  await page.evaluate(() => window.__es.show('trade'));
  await wait(500);
  await shot('trade.png');
  await page.evaluate(() => window.__es.depart());
  await wait(1200);
  await page.keyboard.down('ArrowUp');
  await wait(700);
  await page.keyboard.up('ArrowUp');
  await wait(300);
  await shot('flight.png');
  await page.evaluate(() => window.__es.show('map'));
  await page.evaluate(() => window.__es.courseTo('Sol'));
  await wait(600);
  await shot('map.png');
}
