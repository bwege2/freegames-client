// Screenshots for the game page (npm run build && node scripts/screenshots.mjs moria): a new Human
// Warrior, the town, the General Store, and the first dungeon level. The game seeds itself from the
// clock, so the character, the town and the level differ from run to run.
const DIRS = [[-1, -1, '7'], [-1, 0, '8'], [-1, 1, '9'], [0, -1, '4'], [0, 1, '6'], [1, -1, '1'], [1, 0, '2'], [1, 1, '3']];
const WALK = new Set(".'<>!?_-=\"$([])}{|/\\~&,0123456789");

/** The direction key of the first step from @ to the nearest `want` on the map (the screen's rows 1-22, columns 13-78). */
export function stepTo(text, want) {
  const rows = text.split('\n');
  const grid = [];
  for (let y = 1; y <= 22; y++) grid.push((rows[y] ?? '').padEnd(80).slice(13, 79));
  let me = null;
  grid.forEach((line, y) => { const x = line.indexOf('@'); if (x >= 0) me = [y, x]; });
  if (!me) return null;
  const prev = new Map([[me.join(), null]]);
  const queue = [me];
  while (queue.length) {
    const p = queue.shift();
    if (grid[p[0]][p[1]] === want) {
      let q = p;
      while (prev.get(q.join()).join() !== me.join()) q = prev.get(q.join());
      return DIRS.find(([dy, dx]) => dy === q[0] - me[0] && dx === q[1] - me[1])[2];
    }
    for (const [dy, dx] of DIRS) {
      const n = [p[0] + dy, p[1] + dx];
      const c = grid[n[0]]?.[n[1]];
      if (c === undefined || prev.has(n.join()) || !(WALK.has(c) || c === want)) continue;
      prev.set(n.join(), p);
      queue.push(n);
    }
  }
  return null;
}

export default async function (page, shot) {
  const text = () => page.evaluate(() => window.__moria?.text() ?? '');
  const waiting = () => page.evaluate(() => window.__moria?.waiting() ?? false);
  const until = async (what) => {
    for (let i = 0; i < 300; i++) {
      const t = await text();
      if ((typeof what === 'string' ? t.includes(what) : what.test(t)) && (await waiting())) return t;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`waited in vain for ${what}; the screen:\n${await text()}`);
  };
  const press = async (keys) => {
    for (const k of keys) {
      if (k === '\x1b') await page.keyboard.press('Escape');
      else if (k === '\r') await page.keyboard.press('Enter');
      else await page.keyboard.type(k);
      await new Promise((r) => setTimeout(r, 30));
    }
  };
  /** walks to the nearest `want` on the map */
  const walk = async (want) => {
    for (let i = 0; i < 200; i++) {
      const t = await until(/./);
      if (/-more-/.test(t.split('\n')[0])) { await press(' '); continue; }
      const d = stepTo(t, want);
      if (!d) return;
      await press(d);
    }
  };
  await page.waitForFunction(() => !!window.__moria);
  await until('press any key');
  await press(' ');
  await until('Choose a race');
  await press('am'); // Human, male
  await until('re-roll');
  await press('\x1ba'); // accept, Warrior
  await until("Enter your player's name");
  await press('Aragorn\r');
  await until('or Q to exit');
  await shot('character.png');
  await press(' ');
  await until('Town level');
  await press('wbwbwbwb'); // put on the starting kit
  await until('Town level');
  await shot('town.png');
  await walk('1');
  await until('General Store');
  await press('pa');
  await until('What do you offer?');
  await press('1\r');
  await until('-more-');
  await shot('store.png');
  await press(' \x1b\x1b\x1b');
  await until('Town level');
  await walk('>');
  await press('>');
  await until('50 feet');
  await shot('dungeon.png');
  await page.click('.player-bar .bar-button'); // ← Back
  await page.waitForSelector('.play');
  if (await page.evaluate(() => !!window.__moria)) throw new Error('Back left the game running');
  console.log('Back: the game stopped');
}
