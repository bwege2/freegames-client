// Screenshots for the game page (node scripts/screenshots.mjs nethack, after npm run build): choosing a
// Valkyrie, her first level with her kitten, her inventory, and the level after some walking.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const text = (p) => p.evaluate(() => window.__nethack?.text() ?? '');

async function until(p, what, ms = 30000) {
  const t0 = Date.now();
  for (;;) {
    const t = await text(p);
    const ok = typeof what === 'string' ? t.includes(what) : what.test(t);
    if (ok && (await p.evaluate(() => window.__nethack?.waiting() ?? false))) return t;
    if (Date.now() - t0 > ms) throw new Error(`timeout waiting for ${what}; the screen:\n${t}`);
    await wait(50);
  }
}

async function press(p, keys) {
  for (const k of keys) {
    if (k === '\x1b') await p.keyboard.press('Escape');
    else if (k === '\r') await p.keyboard.press('Enter');
    else await p.keyboard.type(k);
    await wait(15);
  }
}

async function settle(p) {
  for (let i = 0; i < 40; i++) {
    const t = await until(p, /./);
    if (!/--More--|\(end\)/.test(t) && /Dlvl:/.test(t)) return t;
    await press(p, '\x1b');
  }
  throw new Error('the map never came');
}

export default async function (page, shot) {
  let t = await until(page, /Who are you\?|Shall I pick/);
  if (/Who are you/.test(t)) await press(page, 'Brynhild\r');
  await until(page, 'Shall I pick');
  await press(page, 'n');
  await until(page, 'Pick a role');
  await shot('character.png');
  await press(page, 'v');
  t = await until(page, /Pick a race|Is this ok/);
  if (/Pick a race/.test(t)) await press(page, 'h');
  t = await until(page, /Pick a gender|alignment or creed|Is this ok/);
  if (/Pick a gender/.test(t)) { await press(page, 'f'); t = await until(page, /alignment or creed|Is this ok/); }
  if (/alignment or creed/.test(t)) await press(page, 'n');
  await until(page, 'Is this ok');
  await press(page, 'y');
  await settle(page);
  await shot('start.png');
  await press(page, 'i');
  await until(page, '(end)');
  await shot('inventory.png');
  await press(page, '\x1b');
  await settle(page);
  // a walk around the room and out of it
  for (const k of 'llllllllhhhhhhhhhhhhhhhhjjjjjjkkkkkkkkkkkkllllllllllllll') {
    await press(page, k);
    await settle(page);
  }
  await shot('map.png');
}
