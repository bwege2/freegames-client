// NetHack end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/nethack/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A new Valkyrie is made and saved (S): the program ends and the page goes back to the game page. After
// a reload, Play restores her (the save file from the account's storage); she quits (#quit): the end of
// the game, and the record shared on the server lists her. Then Back stops a running game.
// Screenshots go to $E2E_SHOTS (default: dist-e2e/nethack/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'nethack');
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'nethack-e2e-')) },
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

const text = (p) => p.evaluate(() => window.__nethack?.text() ?? '');
/** waits until the program waits for a key and the screen shows `what` (a string or RegExp) */
async function until(p, what, ms = 30000) {
  const t0 = Date.now();
  let last = '';
  for (;;) {
    const t = await text(p);
    if (process.env.E2E_DEBUG && t !== last) console.log(`--- screen\n${(last = t)}`);
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
async function play(p) {
  await p.goto(`${base}#/nethack`, { waitUntil: 'networkidle0' });
  await p.click('.page .play');
  await p.waitForFunction(() => !!window.__nethack);
}
/** answers --More-- until the screen shows `what` */
async function through(p, what) {
  for (let i = 0; i < 40; i++) {
    const t = await until(p, /./);
    if (typeof what === 'string' ? t.includes(what) : what.test(t)) return t;
    if (/--More--/.test(t)) await press(p, ' ');
    else await wait(50);
  }
  throw new Error(`never reached ${what}`);
}

/** answers --More-- and leaves texts until the map with the status lines is there, nothing pending */
async function settle(p) {
  for (let i = 0; i < 40; i++) {
    const t = await until(p, /./);
    if (!/--More--|\(end\)/.test(t) && /Dlvl:/.test(t)) return t;
    await press(p, '\x1b');
  }
  throw new Error('the map never came');
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

  // a new Valkyrie, saved
  await play(p);
  let t = await until(p, /Who are you\?|Shall I pick/);
  if (/Who are you/.test(t)) await press(p, 'Valka\r');
  await until(p, 'Shall I pick');
  await press(p, 'n');
  await until(p, 'Pick a role');
  await press(p, 'v');
  t = await until(p, /Pick a race|Is this ok/);
  if (/Pick a race/.test(t)) await press(p, 'h');
  t = await until(p, /Pick a gender|alignment or creed|Is this ok/);
  if (/Pick a gender/.test(t)) { await press(p, 'f'); t = await until(p, /alignment or creed|Is this ok/); }
  if (/alignment or creed/.test(t)) { await press(p, 'n'); }
  await until(p, 'Is this ok');
  await press(p, 'y');
  t = await settle(p);
  check(/Valka the Stripling/.test(t) && /Dlvl:1/.test(t), 'a new Valkyrie on the first level');
  await p.screenshot({ path: join(shots, 'start.png') });
  await press(p, 'S');
  await until(p, 'Really save?');
  await press(p, 'y');
  t = await until(p, /Be seeing you/);
  check(true, 'saved: "Be seeing you..." stays on the screen until a key');
  await press(p, ' ');
  await p.waitForSelector('.page .play', { timeout: 20000 });
  check(!(await p.evaluate(() => !!window.__nethack)), 'saved: the program ended, back on the game page');

  // reload: she comes back
  await p.reload({ waitUntil: 'networkidle0' });
  await play(p);
  t = await until(p, /Who are you\?|welcome back|--More--/);
  if (/Who are you/.test(t)) await press(p, 'Valka\r');
  t = await through(p, /welcome back/);
  check(/welcome back to NetHack/.test(t), 'after a reload the saved game is restored');
  t = await settle(p);
  check(/Valka the Stripling/.test(t), 'Valka is back');
  await p.screenshot({ path: join(shots, 'restored.png') });

  // quit: the end, and the record lists her
  await press(p, '#quit\r');
  await until(p, 'Really quit?');
  await press(p, 'y');
  // no to every "Do you want ...?" of the end (q would skip the rest, the score list too)
  for (let i = 0; i < 20; i++) {
    t = await until(p, /./);
    if (/Farvel Valka/.test(t)) break; // a Valkyrie's goodbye
    await press(p, /Do you want/.test(t) ? 'n' : ' ');
  }
  check(/Farvel Valka the Valkyrie/.test(t) && /You quit/.test(t), 'the end: "Farvel Valka the Valkyrie... You quit"');
  await press(p, ' ');
  t = await until(p, /Points\s+Name/);
  check(/Valka-Val-Hum-Fem-Neu quit/.test(t), 'the record lists her, and stays on the screen until a key');
  await p.screenshot({ path: join(shots, 'record.png') });
  for (let i = 0; i < 20 && (await p.evaluate(() => !!window.__nethack)); i++) {
    if (await p.evaluate(() => window.__nethack?.waiting() ?? false)) await press(p, ' ');
    await wait(200);
  }
  await p.waitForSelector('.page .play', { timeout: 15000 });

  // Back stops a running game
  await play(p);
  await until(p, /Who are you\?|Shall I pick/);
  await p.click('.player-bar .bar-button');
  await p.waitForSelector('.page .play');
  await wait(200);
  check(!(await p.evaluate(() => !!window.__nethack)), 'Back stops the game');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
