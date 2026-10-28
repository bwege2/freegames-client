// Moria end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/moria/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A new character goes down to 50 feet and is saved (^X): the score list shows its "(saved)" entry, the
// program ends and the page goes back to the game page. After a reload, Play restores the character
// (game.sav from the account's storage) at 50 feet; it quits (^K): the tombstone, and the score list,
// where the quitting entry has replaced the "(saved)" one. Then Back stops a running game.
// Screenshots go to $E2E_SHOTS (default: dist-e2e/moria/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stepTo } from './screenshots.mjs';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'moria');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'moria-e2e-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed = true;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let browser;

const text = (p) => p.evaluate(() => window.__moria?.text() ?? '');
/** waits until the program waits for a key and the screen shows `what` (a string or RegExp) */
async function until(p, what, ms = 30000) {
  const t0 = Date.now();
  for (;;) {
    const t = await text(p);
    const ok = typeof what === 'string' ? t.includes(what) : what.test(t);
    if (ok && (await p.evaluate(() => window.__moria?.waiting() ?? false))) return t;
    if (Date.now() - t0 > ms) throw new Error(`timeout waiting for ${what}; the screen:\n${t}`);
    await wait(50);
  }
}
async function press(p, keys) {
  for (const k of keys) {
    if (k === '\x1b') await p.keyboard.press('Escape');
    else if (k === '\r') await p.keyboard.press('Enter');
    else if (k.charCodeAt(0) < 32) {
      await p.keyboard.down('Control');
      await p.keyboard.press(String.fromCharCode(k.charCodeAt(0) + 96));
      await p.keyboard.up('Control');
    } else await p.keyboard.type(k);
    await wait(20);
  }
}
async function walk(p, want) {
  for (let i = 0; i < 300; i++) {
    const t = await until(p, /./);
    if (/-more-/.test(t.split('\n')[0])) { await press(p, ' '); continue; }
    const d = stepTo(t, want);
    if (!d) return;
    await press(p, d);
  }
}
async function play(p) {
  await p.goto(`${base}#/moria`, { waitUntil: 'networkidle0' });
  await p.click('.page .play');
  await p.waitForFunction(() => !!window.__moria);
}

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const p = await (await browser.createBrowserContext()).newPage();
  await p.setViewport({ width: 1100, height: 760 });
  p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
  p.on('console', (m) => { if (m.type() === 'error' || process.env.E2E_CONSOLE) console.log(`console ${m.type()}: ${m.text()}`); });

  // a new character, down the stairs, saved
  await play(p);
  await until(p, 'press any key');
  await press(p, ' ');
  await until(p, 'Choose a race');
  await press(p, 'fm\x1bb'); // Dwarf, male, these stats, Priest
  await until(p, "Enter your player's name");
  await press(p, 'Durin\r');
  await until(p, 'or Q to exit');
  await press(p, ' ');
  let t = await until(p, /Town level|-more-/);
  if (/-more-/.test(t)) await press(p, ' '); // You can learn some new prayers now.
  t = await until(p, /Town level/);
  check(/Dwarf/.test(t) && /Priest/.test(t), 'a new Dwarf Priest in the town');
  await press(p, 'wcwcwc');
  await until(p, 'Town level');
  await walk(p, '>');
  await press(p, '>');
  t = await until(p, '50 feet');
  check(true, 'down the stairs: 50 feet');
  await p.screenshot({ path: join(shots, 'dungeon.png') });
  await press(p, '\x18'); // ^X
  t = await until(p, /Saving game|Rank  Points/);
  if (/-more-/.test(t)) {
    await press(p, ' ');
    t = await until(p, 'Rank  Points');
  }
  check(/Durin\s.*\(saved\)/.test(t), 'the score list shows the "(saved)" entry');
  await p.screenshot({ path: join(shots, 'saved-scores.png') });
  await press(p, ' ');
  await p.waitForSelector('.page .play', { timeout: 15000 });
  check(!(await p.evaluate(() => !!window.__moria)), 'the program ended: back on the game page');

  // reload: the character comes back
  await p.reload({ waitUntil: 'networkidle0' });
  await play(p);
  await until(p, 'press any key');
  await press(p, ' ');
  t = await until(p, '<c>hange character name'); // the restored character's sheet
  check(/Name\s+: Durin/.test(t), 'after a reload the saved character is restored');
  await press(p, '\x1b');
  t = await until(p, /MHP/);
  check(t.split('\n')[23].includes('50 feet') && /Dwarf/.test(t) && /Priest/.test(t), 'the Dwarf Priest is back at 50 feet');
  await p.screenshot({ path: join(shots, 'restored.png') });

  // quit: the tombstone, and the "(saved)" entry is replaced
  await press(p, '\x0b'); // ^K
  await until(p, 'really want to quit');
  await press(p, 'y');
  t = await until(p, 'Character record?');
  check(/RIP/.test(t) && /Durin/.test(t), 'the tombstone');
  await press(p, '\x1b');
  t = await until(p, 'Rank  Points');
  const rows = t.split('\n').filter((r) => /Durin/.test(r));
  check(rows.length === 1 && /Quitting/.test(rows[0]), `one entry for Durin, quitting: ${JSON.stringify(rows)}`);
  await p.screenshot({ path: join(shots, 'quit-scores.png') });
  await press(p, ' ');
  await p.waitForSelector('.page .play', { timeout: 15000 });

  // Back stops a running game
  await play(p);
  await until(p, 'press any key');
  await p.click('.player-bar .bar-button');
  await p.waitForSelector('.page .play');
  await wait(200);
  check(!(await p.evaluate(() => !!window.__moria)), 'Back stops the game');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
