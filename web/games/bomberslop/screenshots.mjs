// Screenshots for the game page (node scripts/screenshots.mjs bomberslop): real play of the port, the computer
// players playing against one idle human: four blobs in the Canteen, the title, the Conveyor, the score
// board after a round.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const info = () => page.evaluate(() => window.__bomberslop.info());
  const until = (fn, arg, timeout = 90000) => page.waitForFunction(fn, { timeout, polling: 50 }, arg);
  const press = async (key, n = 1) => {
    for (let i = 0; i < n; i++) {
      await page.keyboard.press(key);
      await wait(80);
    }
  };
  await page.waitForSelector('.player-host canvas', { timeout: 20000 });
  await until(() => window.__bomberslop?.state() === 'title');
  await wait(1200);

  // a local match: one player (who stands aside) and three computer blobs, a 30 s round
  await press('Enter'); // Local game
  await press('ArrowDown', 3);
  await press('ArrowLeft', 4); // round time 90 -> 30
  await press('ArrowDown', 3);
  await press('Enter'); // Start!
  await until(() => window.__bomberslop.info().roundTime < 29);
  // a moment with bombs and a splash on screen
  await until(() => { const i = window.__bomberslop.info(); return i.explosions >= 1 && i.bombs >= 1 && i.extras >= 1 && i.players.filter((p) => !p.dead).length >= 3; }, undefined, 60000);
  await page.evaluate(() => window.__bomberslop.freeze(true));
  await shot('four-blobs.png');
  await page.evaluate(() => window.__bomberslop.freeze(false));
  // the score board after the round
  await until(() => window.__bomberslop.info().board > 0, undefined, 300000);
  await wait(300);
  await shot('board.png');
  await press('Escape');
  await until(() => window.__bomberslop.state() === 'title');
  await wait(800);
  await shot('title.png');

  // the Conveyor, its arrows carrying bombs
  await press('Enter');
  await press('ArrowDown', 5);
  await press('ArrowRight'); // first map: Conveyor
  await press('ArrowDown');
  await press('Enter');
  await until(() => window.__bomberslop.info().map === 'Conveyor' && window.__bomberslop.info().roundTime < 28);
  await until(() => window.__bomberslop.info().explosions >= 1 && window.__bomberslop.info().bombs >= 2, undefined, 120000);
  await page.evaluate(() => window.__bomberslop.freeze(true));
  await shot('conveyor.png');
  await page.evaluate(() => window.__bomberslop.freeze(false));
  await press('Escape');
}
