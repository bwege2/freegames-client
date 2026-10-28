// Ballerburg end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/ballerburg/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A local game (a turn, the cannon dialog, a shot, the table, quitting back to the game page), then an
// online game in two browser contexts: the lobby, the same game on both screens, moves of both castles
// (Done, the market, shots) carried out on both, leaving with Esc, and Back stopping the game.
// Screenshots go to $E2E_SHOTS (default: dist-e2e/ballerburg/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'ballerburg');
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'bb-e2e-')) },
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
    await p.goto(`${base}#/ballerburg`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.player-host canvas');
    await p.waitForFunction(() => window.__ballerburg?.frames > 5);
    return p;
  };
  /** a click at a pixel of the game's 640x480 screen */
  const click = async (p, x, y, ms = 300) => {
    const b = await p.$eval('.player-host canvas', (c) => { const r = c.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
    await p.mouse.click(b[0] + (x + 0.5) * b[2] / 640, b[1] + (y + 0.5) * b[3] / 480);
    await wait(ms);
  };
  const state = (p) => p.evaluate(() => window.__ballerburg.state());
  const screenHash = (p) => p.$eval('.player-host canvas', (c) => c.toDataURL()).then((d) => createHash('sha256').update(d).digest('hex').slice(0, 16));
  const turn = (p, zug, ms = 20000) => p.waitForFunction((z) => window.__ballerburg.state().zug === z, { timeout: ms }, zug);
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  // the dialogs' objects (sdlgui: 8x16 characters, centred in 80x30)
  const dlg = (w, h) => (x, y, ow) => [((80 - w) >> 1) * 8 + x * 8 + ow * 4, ((30 - h) >> 1) * 16 + y * 16 + 8];
  const cannonDlg = dlg(42, 15), marketDlg = dlg(54, 18), alertDlg = dlg(52, 8);

  // ---- a local game
  const c = await open();
  let s = await state(c);
  check(!s.online && s.zug === 0 && s.n === 0, 'a local game starts with the left castle');
  const leftCannon = s.ka[0][0];
  await click(c, leftCannon[0] + 10, leftCannon[1] - 7);
  await c.screenshot({ path: join(shots, 'local-cannon.png') });
  await click(c, ...cannonDlg(33, 11, 8)); // OK
  await turn(c, 1);
  s = await state(c);
  check(s.zug === 1 && s.n === 1 && s.pu[0] < 180 && s.ku[0] === 11, `a shot: powder ${s.pu[0]}, cannonballs ${s.ku[0]}, the right castle's turn`);
  await c.keyboard.press('t');
  await wait(300);
  await c.screenshot({ path: join(shots, 'local-table.png') });
  await click(c, 320, 200);
  await c.keyboard.press('q');
  await wait(300);
  await click(c, ...alertDlg(14, 6, 5)); // Yes
  await c.waitForSelector('.page .play', { timeout: 5000 });
  check(await c.evaluate(() => window.__freegames.stats.running === 0), 'q, Yes: back on the game page, the game stopped');

  // ---- online: Anna (left castle, the host) and Bert
  const a = await open(), b = await open();
  for (const [p, name] of [[a, 'Anna'], [b, 'Bert']]) {
    await (await button(p, 'Play online')).click();
    await p.waitForSelector('.fg-lobby');
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, n) => { e.value = n; e.dispatchEvent(new Event('change')); }, name);
  }
  await a.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'castles'; });
  await (await button(a, 'Create room')).click();
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'castles');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('castles')), { timeout: 8000 });
  await (await button(b, 'Join')).click();
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'castles');
  await (await button(b, 'Ready')).click();
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await a.screenshot({ path: join(shots, 'online-room.png') });
  await (await button(a, 'Start')).click();
  for (const p of [a, b]) await p.waitForFunction(() => window.__ballerburg.state().online && !document.querySelector('.fg-lobby'), { timeout: 8000 });
  await wait(800);
  let sa = await state(a), sb = await state(b);
  check(JSON.stringify(sa) === JSON.stringify(sb), 'online: the same game on both (seed, wind, landscape, castles)');
  check(sa.names[0] === 'Anna' && sa.names[1] === 'Bert', `the castles carry the players' names (${sa.names})`);
  check(await screenHash(a) === await screenHash(b), 'online: the same picture on both screens');
  await a.screenshot({ path: join(shots, 'online-start-anna.png') });
  check(await b.$eval('.bb-ui span', (e) => e.textContent.includes("Anna's turn")), 'Bert sees whose turn it is');

  // Bert cannot move for the left castle: his clicks do nothing
  await click(b, 320, 472, 600);
  check((await state(a)).zug === 0 && (await state(b)).zug === 0, "Bert's Done on Anna's turn does nothing");

  // Anna: Done
  await click(a, 320, 472);
  await turn(a, 1);
  await turn(b, 1);
  check(true, "Anna's Done reached both games");

  // Bert: the market (powder), then a shot
  await click(b, 619, 297, 500);
  await b.screenshot({ path: join(shots, 'online-market-bert.png') });
  await click(b, ...marketDlg(47, 13, 5), 500); // Powder x30
  await click(b, ...marketDlg(21, 16, 12), 500); // Done
  sb = await state(b);
  const right = sb.ka[1][0];
  await click(b, right[0] + 10, right[1] - 7);
  await click(b, ...cannonDlg(17, 3, 3)); // angle -1
  await click(b, ...cannonDlg(33, 11, 8)); // OK
  await turn(b, 2);
  await turn(a, 2);
  await wait(300);
  sa = await state(a);
  sb = await state(b);
  check(JSON.stringify(sa) === JSON.stringify(sb), `Bert's market and shot: the same game on both (money ${sa.ge}, powder ${sa.pu})`);
  check(await screenHash(a) === await screenHash(b), 'and the same picture');

  // Bert's connection drops (a new one, as after a dropped one) while Anna moves: he gets the round's
  // moves from the server and replays them
  await b.evaluate(() => { void window.__ballerburg.reconnect('Bert B'); });
  await click(a, 320, 472);
  await turn(a, 3);
  await b.waitForFunction(() => window.__ballerburg.replays() === 1 && window.__ballerburg.state().zug === 3, { timeout: 15000 });
  await wait(300);
  sa = await state(a);
  sb = await state(b);
  check(JSON.stringify(sa) === JSON.stringify(sb), 'Bert came back (a new connection): the round replayed, the same game on both');
  check(await screenHash(a) === await screenHash(b), 'and the same picture');
  await a.screenshot({ path: join(shots, 'online-replay-anna.png') });
  await b.screenshot({ path: join(shots, 'online-replay-bert.png') });
  if (process.env.E2E_DIFF) {
    const url = await a.$eval('.player-host canvas', (c) => c.toDataURL());
    const d = await b.evaluate(async (u) => {
      const img = new Image();
      img.src = u;
      await img.decode();
      const o = document.createElement('canvas');
      o.width = 640; o.height = 480;
      const x = o.getContext('2d');
      x.drawImage(img, 0, 0);
      const pa = x.getImageData(0, 0, 640, 480).data;
      const pb = document.querySelector('.player-host canvas').getContext('2d').getImageData(0, 0, 640, 480).data;
      let n = 0, x0 = 640, y0 = 480, x1 = -1, y1 = -1;
      for (let i = 0; i < pa.length; i += 4) if (pa[i] !== pb[i] || pa[i + 1] !== pb[i + 1] || pa[i + 2] !== pb[i + 2]) {
        n++; const px = (i / 4) % 640, py = Math.floor(i / 4 / 640);
        x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
      }
      return { n, x0, y0, x1, y1 };
    }, url);
    console.log('diff', d);
    for (const [who, p] of [['anna', a], ['bert', b]]) for (let y = d.y0; y <= d.y1 && d.n; y++) {
      const w = d.x1 - d.x0 + 1;
      const [win, sur] = await p.evaluate((x, y, w) => window.__ballerburg.pixels(x, y, w), d.x0, y, w);
      const can = await p.$eval('.player-host canvas', (c, x, y, w) => { const px = c.getContext('2d').getImageData(x, y, w, 1).data; return Array.from({ length: w }, (_, i) => (px[i * 4] << 16 | px[i * 4 + 1] << 8 | px[i * 4 + 2]).toString(16)); }, d.x0, y, w);
      console.log(who, 'window', win.map((v) => v.toString(16)).join(' '));
      console.log(who, 'surf  ', sur.map((v) => v.toString(16)).join(' '));
      console.log(who, 'canvas', can.join(' '));
    }
  }
  // Bert: Done
  await click(b, 320, 472);
  await turn(a, 4);
  await turn(b, 4);

  // Anna: a shot
  sa = await state(a);
  await click(a, sa.ka[0][1][0] + 10, sa.ka[0][1][1] - 7);
  for (let i = 0; i < 3; i++) await click(a, ...cannonDlg(26, 5, 3), 150); // powder +1
  await click(a, ...cannonDlg(33, 11, 8));
  await turn(a, 5);
  await turn(b, 5);
  await wait(300);
  sa = await state(a);
  sb = await state(b);
  check(JSON.stringify(sa) === JSON.stringify(sb), 'Anna\'s shot: the same game on both');
  await b.screenshot({ path: join(shots, 'online-bert.png') });

  // Bert leaves with Esc: Anna's round ends, she is back in the room
  await b.keyboard.press('Escape');
  await wait(400);
  await click(b, ...alertDlg(14, 6, 5)); // Yes
  await b.waitForFunction(() => !window.__ballerburg.state().online, { timeout: 5000 });
  check(true, 'Esc, Yes: Bert left the online game and plays locally again');
  await a.waitForSelector('.fg-lobby', { timeout: 8000 });
  const note = await a.$eval('.bb-ui span', (e) => e.textContent);
  check(note.includes('Anna won'), `Anna's round is over: "${note}"`);
  await a.screenshot({ path: join(shots, 'online-after.png') });

  // ---- Back stops the game
  const f1 = await b.evaluate(() => window.__ballerburg.frames);
  await (await button(b, '← Back')).click();
  await b.waitForSelector('.page .play');
  await wait(300);
  const f2 = await b.evaluate(() => window.__ballerburg.frames);
  await wait(400);
  const f3 = await b.evaluate(() => window.__ballerburg.frames);
  check(f1 > 0 && f2 === f3 && await b.evaluate(() => window.__freegames.stats.running === 0), `Back stopped the game (frames ${f2}, still ${f3})`);
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'e2e FAILED' : 'e2e passed');
process.exit(failed ? 1 : 0);
