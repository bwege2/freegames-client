// Screenshots for the game page: node scripts/screenshots.mjs freecol (after npm run build)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** The visible components of the client's tree with screen coordinates (as test/workers.ts parseTree). */
function parse(tree) {
  const out = [];
  const stack = [];
  for (const line of tree.split('\n')) {
    const m = /^( *)(\S+) (-?\d+),(-?\d+) (\d+)x(\d+)( hidden)?.*?(?: "(.*)")?$/.exec(line);
    if (!m) continue;
    const depth = m[1].length / 2;
    stack.length = depth;
    const p = depth > 0 ? stack[depth - 1] : null;
    const n = { cls: m[2], x: (p?.x ?? 0) + +m[3], y: (p?.y ?? 0) + +m[4], w: +m[5], h: +m[6], hidden: !!m[7] || !!p?.hidden, text: m[8] ?? null };
    stack[depth] = n;
    out.push(n);
  }
  return out.filter((n) => !n.hidden);
}

export default async (page, shot) => {
  await page.waitForSelector('.player-host canvas', { timeout: 120000 });
  const find = async (pred) => {
    for (let i = 0; i < 240; i++) {
      const tree = await page.evaluate(() => window.freecolTree?.() ?? '');
      const n = parse(tree).find(pred);
      if (n) return n;
      await wait(500);
    }
    throw new Error('not on the screen');
  };
  const click = async (n) => {
    const r = await page.evaluate(() => { const b = document.querySelector('.player-host canvas').getBoundingClientRect(); return { x: b.left, y: b.top }; });
    await page.mouse.click(r.x + n.x + (n.w >> 1), r.y + n.y + (n.h >> 1));
  };
  await find((n) => n.cls.endsWith('.MainPanel'));
  await wait(2000);
  await shot('main-menu.png');

  await click(await find((n) => n.text === 'New'));
  await click(await find((n) => n.text === 'OK' && n.cls.endsWith('FreeColButton')));
  await find((n) => n.cls.endsWith('.StartGamePanel'));
  await wait(1500);
  await shot('new-game.png');

  await click(await find((n) => n.text === 'Start Game'));
  await find((n) => n.cls.endsWith('.InformationPanel'));
  await wait(1500);
  await click(await find((n) => n.text === 'OK' && n.cls.endsWith('FreeColButton')));
  await wait(4000);
  await shot('new-world.png');
};
