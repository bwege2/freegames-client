// Worms? end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/worms/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A local game (the demonstration, the menu, a taught worm, saving it to the player's storage on the
// server and loading it into another worm), then online games in two browser contexts: the lobby,
// the same game on both screens with each player teaching their own worm, a dropped connection that
// comes back, a player who leaves, and Back stopping the game.
// Screenshots go to $E2E_SHOTS (default: dist-e2e/worms/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'worms');
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'worms-e2e-')) },
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

/** screen codes of a row as text (upper case letters, digits, double-width halves as lower case) */
const rowText = (screen, y) => screen.slice(y * 40, y * 40 + 40).map((c) => {
  if (c < 0x20) return String.fromCharCode(c + 0x40);
  if (c < 0x40) return String.fromCharCode(c);
  if (c < 0xc0) { const k = (c - 0x40) >> 1; return k < 0x20 ? String.fromCharCode(k + 0x60) : String.fromCharCode(k); }
  return '#';
}).join('');

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const open = async () => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1100, height: 760 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error') console.log(`console error: ${m.text()}`); });
    await p.goto(`${base}#/worms`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.player-host canvas');
    await p.waitForFunction(() => window.__worms?.frames() > 5);
    return p;
  };
  const screen = (p) => p.evaluate(() => window.__worms.screen());
  const worms = (p) => p.evaluate(() => window.__worms.worms());
  const online = (p) => p.evaluate(() => window.__worms.online());
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  const key = async (p, k, ms = 150) => { await p.keyboard.press(k); await wait(ms); };
  const menu = (p) => p.waitForFunction(() => window.__worms.screen()[20 * 40] === 0x06, { timeout: 30000 }); // "F7:START ..."
  const failedRun = (p) => p.evaluate(() => window.__worms.failed());
  /** waits until the prompt line (row 20) starts with `text` */
  const prompt = async (p, text) => {
    try {
      await p.waitForFunction((t) => {
        const r = window.__worms.screen().slice(800, 840).map((c) => String.fromCharCode(c < 0x20 ? c + 0x40 : c)).join('');
        return r.startsWith(t);
      }, { timeout: 15000 }, text);
    } catch (e) {
      console.log(`prompt line: "${rowText(await screen(p), 20)}", waiting for "${text}"`);
      throw e;
    }
  };
  /** a file command of the menu: the key, Return to confirm, the name, Return */
  const fileCommand = async (p, k, ask, name) => {
    await key(p, k);
    await prompt(p, ask);
    await key(p, 'Enter');
    await prompt(p, ' FILE NAME:');
    for (const ch of name) await key(p, ch, 120);
    await key(p, 'Enter');
  };

  // ---- a local game
  const c = await open();
  await c.waitForFunction(() => window.__worms.frames() > 900, { timeout: 60000 });
  let s = await screen(c);
  check(rowText(s, 22).startsWith('WORMS? COPYRIGHT 1983 BY DAVID S MAYNARD'), 'the title under the demonstration');
  check(s.slice(40, 800).some((x) => x >= 0xc1 && x !== 0xc8), 'the demonstration: worms on the grid');
  await c.screenshot({ path: join(shots, 'local-demo.png') });
  await key(c, 'F7');
  await menu(c);
  s = await screen(c);
  check(rowText(s, 22).includes('nneeww') && rowText(s, 22).includes('aauuttoo') && rowText(s, 22).includes('wwiilldd'), `the menu: ${rowText(s, 22).trim()}`);
  await key(c, '9');
  await key(c, 'F7', 1200);
  s = await screen(c);
  check(s.slice(23 * 40, 23 * 40 + 10).every((x) => x === 0xf7) && s[23 * 40 + 10] === 0x20, 'a game: the green worm asks (its bar)');
  let w = await worms(c);
  for (let i = 0; i < 12; i++) {
    for (let k = 0; k < i % 3; k++) await key(c, ' ', 100);
    await key(c, 'Enter', 400);
  }
  w = await worms(c);
  const taught = w[0].slice(0x0b, 0x4b).filter((m) => m < 6).length - 6;
  check(taught >= 5, `the player taught the green worm ${taught} moves`);
  await c.screenshot({ path: join(shots, 'local-game.png') });
  // F7 ends the game; S saves the green worm as "AB" (the player's storage on the server)
  await key(c, 'F7');
  await menu(c);
  await fileCommand(c, 's', ' SAVE? <RETURN>', 'ab');
  await c.waitForFunction(() => window.__worms.worms()[0][0x4b] === 4, { timeout: 8000 });
  w = await worms(c);
  check(w[0][0x4e] === 0x41 && w[0][0x4f] === 0x42, 'saved: the green worm is AB');
  // F5 selects the red worm, L loads AB into it
  await prompt(c, 'F7:START');
  // after a command the menu redraws (half a second on the C64) and then clears function keys pressed
  // meanwhile (?CLEAR), as the original does
  await wait(1200);
  await key(c, 'F5', 300);
  await fileCommand(c, 'l', ' LOAD? <RETURN>', 'ab');
  try {
    await c.waitForFunction(() => window.__worms.worms()[1][0x4b] === 4, { timeout: 8000 });
  } catch (e) {
    const sc = await screen(c);
    for (let y = 19; y < 25; y++) console.log(`row ${y}: "${rowText(sc, y)}"`);
    console.log('sel kinds', (await worms(c)).map((x) => x[0x4b]));
    throw e;
  }
  w = await worms(c);
  check(JSON.stringify(w[1].slice(0x0b, 0x4b)) === JSON.stringify(w[0].slice(0x0b, 0x4b)) && w[1][0x4e] === 0x41,
    'loaded: the red worm is AB, with what the green one learnt');
  s = await screen(c);
  check(rowText(s, 20).startsWith('F7:START'), `no disk error: ${rowText(s, 20).trim()}`);
  await c.screenshot({ path: join(shots, 'local-loaded.png') });
  check(await failedRun(c) === null, 'the program ran without an error');

  // ---- online: Anna (the green worm, host) and Bert (red); the others none
  const a = await open(), b = await open();
  const lobby = async (p, name) => {
    await (await button(p, 'Online game')).click();
    await p.waitForSelector('.wm-lobby select');
    await p.select('.wm-lobby select', '0');
    await (await button(p, 'Rooms')).click();
    await p.waitForSelector('.fg-lobby input[placeholder="Your name"]');
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, n) => { e.value = n; e.dispatchEvent(new Event('change')); }, name);
  };
  const playOnline = async (roomName) => {
    await lobby(a, 'Anna');
    await lobby(b, 'Bert');
    await a.$eval('.fg-lobby input[placeholder="Room name"]', (e, n) => { e.value = n; }, roomName);
    await (await button(a, 'Create room')).click();
    await a.waitForFunction((n) => document.querySelector('.fg-lobby h2')?.textContent === n, {}, roomName);
    await b.waitForFunction((n) => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes(n)), { timeout: 8000 }, roomName);
    await (await button(b, 'Join')).click();
    await b.waitForFunction((n) => document.querySelector('.fg-lobby h2')?.textContent === n, {}, roomName);
    await (await button(b, 'Ready')).click();
    await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
    await a.screenshot({ path: join(shots, 'online-room.png') });
    await (await button(a, 'Start')).click();
    for (const p of [a, b]) await p.waitForFunction(() => window.__worms.online().playing, { timeout: 10000 });
  };
  /** the step each page last answered */
  const answered = new Map();
  /** answers the questions of each player's own worm until `until` holds */
  const answer = async (until, seconds = 60) => {
    let n = 0;
    const end = Date.now() + seconds * 1000;
    while (Date.now() < end && !(await until())) {
      for (const p of [a, b]) {
        const o = await online(p);
        const last = answered.get(p);
        // a key the program flushed (it clears the keyboard when it starts to ask) is pressed again
        if (o.waiting?.local && (last?.step !== o.waiting.step || Date.now() - last.t > 3000)) {
          answered.set(p, { step: o.waiting.step, t: Date.now() });
          for (let k = 0; k < o.waiting.step % 3; k++) await key(p, ' ', 80);
          await key(p, 'Enter', 50);
          n++;
        }
      }
      await wait(120);
    }
    return n;
  };
  for (const p of [a, b]) await key(p, '9');
  await playOnline('grid');
  let oa = await online(a), ob = await online(b);
  check(oa.you === 0 && ob.you === 1 && JSON.stringify(oa.owners) === '[0,1,255,255]', `seats: Anna the green worm, Bert the red (${JSON.stringify(oa.owners)})`);
  for (const p of [a, b]) await key(p, '9');
  let decided = await answer(async () => (await online(a)).step >= 6);
  check(decided >= 4, `decisions of both players went through the server (${decided})`);
  await wait(500);
  // Bert's connection drops (a new one, as after a dropped one) while Anna plays on
  await b.evaluate(() => { void window.__worms.reconnect('Bert B'); });
  decided += await answer(async () => !(await online(a)).playing && !(await online(b)).playing, 600);
  ob = await online(b);
  check(ob.resyncs >= 1, 'Bert came back on a new connection and caught up');
  const [wa, wb] = [await worms(a), await worms(b)];
  check(JSON.stringify(wa) === JSON.stringify(wb), `the same game on both, to the end (${decided} decisions)`);
  const [sa, sb] = [await screen(a), await screen(b)];
  check(rowText(sa, 21) === rowText(sb, 21), `the same scores: ${rowText(sa, 21).trim()}`);
  const note = await a.$eval('.wm-ui span', (e) => e.textContent);
  check(note.startsWith('Online game over'), `Anna: "${note}"`);
  await a.screenshot({ path: join(shots, 'online-end-anna.png') });
  await b.screenshot({ path: join(shots, 'online-end-bert.png') });

  // a second round: Bert leaves after a few decisions, the computer plays his worm, Anna finishes
  await menu(a);
  await menu(b);
  await playOnline('grid2');
  await answer(async () => (await online(a)).step >= 4);
  await (await button(b, 'Leave online game')).click();
  await b.waitForFunction(() => !window.__worms.online().playing, { timeout: 15000 });
  check(true, 'Bert left the online game');
  await answer(async () => !(await online(a)).playing, 600);
  check(!(await online(a)).playing, 'Anna finished the game with the computer playing for Bert');
  check(await failedRun(a) === null && await failedRun(b) === null, 'the programs ran without an error');

  // ---- Back stops the game
  const f1 = await b.evaluate(() => window.__worms.frames());
  await (await button(b, '← Back')).click();
  await b.waitForSelector('.page .play');
  await wait(300);
  const f2 = await b.evaluate(() => window.__worms.frames());
  await wait(500);
  const f3 = await b.evaluate(() => window.__worms.frames());
  check(f1 > 0 && f2 === f3 && await b.evaluate(() => window.__freegames.stats.running === 0), `Back stopped the game (frames ${f2}, still ${f3})`);
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'e2e FAILED' : 'e2e passed');
process.exit(failed ? 1 : 0);
