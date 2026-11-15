// Screenshots for the game page: node scripts/screenshots.mjs lincity (after npm run build)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  // the window is drawn once the worker has the data: then the splash scrolls
  await page.waitForFunction(() => {
    const c = document.querySelector('.player-host canvas');
    return c && !document.querySelector('.player-host').textContent.includes('Loading');
  }, { timeout: 30000 });
  await wait(2000);
  await page.focus('.player-host');
  const click = async (x, y, ms = 800, button = 'left') => {
    const b = await (await page.$('.player-host canvas')).boundingBox();
    await page.mouse.click(b.x + x * b.width / 640, b.y + y * b.height / 480, { button });
    await wait(ms);
  };
  const key = async (k, ms = 400) => { await page.keyboard.press(k); await wait(ms); };

  await key('Space', 1500);
  await shot('opening.png');

  // the built-in scene "Good Times": a city 600 years on, on fast
  await click(281, 293);      // Load - built in or saved scene
  await click(281, 60, 2000); // Good Times
  await click(70, 470, 6000); // FAST
  await click(380, 200, 800, 'right'); // a square's coverage and pollution in the panel on the right
  await shot('good-times.png');

  await click(518, 288, 400); // the mini map: pollution
  await click(518, 288, 400); // unemployment
  await click(518, 288, 400); // starvation
  await click(518, 288, 400); // ports
  await click(518, 288, 1500); // power
  await click(28, 60, 1000);  // Stats
  await shot('statistics.png');
};
