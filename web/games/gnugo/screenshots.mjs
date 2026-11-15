// Screenshots for the game page (npm run build && node scripts/screenshots.mjs gnugo). The seed is fixed
// (-r 1) and the level low, so the game is the same every time.
export default async function (page, shot) {
  const text = () => page.evaluate(() => window.__gnugo?.text() ?? '');
  const atPrompt = (t) => /(black|white)\(\d+\): $/.test(t.trimEnd() + ' ');
  const waitFor = async (pred, what) => {
    for (let i = 0; i < 1200; i++) {
      if (pred(await text())) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`waited in vain for ${what}; the screen ends with:\n${(await text()).slice(-600)}`);
  };
  const type = async (line, what) => {
    const n = (await text()).length;
    await page.keyboard.type(line);
    await page.keyboard.press('Enter');
    await waitFor((t) => (what ? t.slice(n).includes(what) : t.length > n + line.length + 1 && atPrompt(t)), what ?? 'the prompt');
  };
  const games = (t) => t.split('Beginning ASCII mode game').length - 1;
  await page.waitForFunction(() => !!window.__gnugo);
  await waitFor(atPrompt, 'the first prompt');
  // the command line in the bar: a fixed seed and a quick level
  await page.$eval('.gg-args', (e) => { e.value = '--boardsize 9 --komi 6.5 -r 1 --level 3'; });
  await page.click('.gg-bar button');
  await waitFor((t) => games(t) === 2 && atPrompt(t), 'the restart');
  for (const m of ['e5', 'c4', 'g4', 'd6', 'f6']) await type(m);
  await shot('play.png');
  for (const m of ['c6', 'f3', 'g6', 'd3', 'c3']) await type(m);
  await type('force pass;force pass', '"game" to play again');
  await type('count', 'to toggle its state or "done".');
  await shot('count.png');
  await page.click('.player-bar .bar-button'); // ← Back
  await page.waitForSelector('.play');
  if (await page.evaluate(() => !!window.__gnugo)) throw new Error('Back left the game running');
  console.log('Back: the game stopped');
}
