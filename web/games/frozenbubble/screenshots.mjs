// Screenshots for the game page: node scripts/screenshots.mjs frozenbubble (after npm run build)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  await page.waitForFunction(() => window.__fb?.frames() > 20, { timeout: 30000 });
  await wait(3000);
  await page.focus('.player-host');
  const key = async (k, ms = 400) => { await page.keyboard.press(k); await wait(ms); };
  const hold = async (k, ms) => { await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k); };
  await shot('menu.png');

  // a 1-player game, a few shots into level 1
  await key('Enter', 1000);
  await key('Enter', 1000);
  await page.waitForFunction(() => /state=game level=1 /.test(window.__fb.state()), { timeout: 15000 });
  await wait(1500);
  for (const [turn, ms] of [['ArrowLeft', 300], ['ArrowRight', 500], ['ArrowLeft', 150], ['ArrowRight', 350]]) {
    await hold(turn, ms);
    await hold('ArrowUp', 60);
    await wait(900);
  }
  await hold('ArrowLeft', 200);
  await wait(300);
  await shot('one-player.png');

  // two players on one keyboard
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__fb?.frames() > 20, { timeout: 30000 });
  await wait(3000);
  await page.focus('.player-host');
  await key('ArrowDown');
  await key('Enter', 1500);
  await key('y', 1500);   // chain-reaction
  await page.waitForFunction(() => /state=game /.test(window.__fb.state()), { timeout: 15000 });
  await wait(1200);
  for (let i = 0; i < 6; i++) {
    await hold(i % 2 ? 'ArrowLeft' : 'ArrowRight', 120 + i * 60);
    await hold('ArrowUp', 60);
    await hold(i % 2 ? 'v' : 'x', 100 + i * 50);
    await hold('c', 60);
    await wait(700);
  }
  await shot('two-players.png');
};
