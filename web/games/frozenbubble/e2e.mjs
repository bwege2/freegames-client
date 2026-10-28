// Frozen Bubble end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/frozenbubble/e2e.mjs     (needs ../server/target/freegames-server.jar)
// One browser plays a 1-player game (it shoots until level 1 is cleared or lost), then three browsers play one
// online game (victories limit 1) to its end: the same results on every client, and the room closes when
// they are back in the lobby. Back stops the game. Screenshots go to $E2E_SHOTS (default: dist-e2e/frozenbubble/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'frozenbubble');
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'frozenbubble-e2e-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed = true;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const stats = async () => (await fetch(`${base}stats`)).json();
let browser;

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const open = async (name) => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1100, height: 800 });
    p.on('pageerror', (e) => { console.log(`${name}: page error: ${e.message}`); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error') console.log(`${name}: console error: ${m.text()}`); });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await p.evaluate((n) => localStorage.setItem('freegames-name', n), name);
    await p.goto(`${base}#/frozenbubble`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.player-host canvas');
    await p.waitForFunction(() => window.__fb?.frames() > 20, { timeout: 30000 });
    await wait(2500); // the menu's logo
    await p.focus('.player-host');
    return p;
  };
  const state = (p) => p.evaluate(() => window.__fb.state());
  const online = (p) => p.evaluate(() => window.__fb.online());
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  const hasButton = (p, text) => p.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t), { timeout: 15000 }, text);
  const key = async (p, k, ms = 300) => { await p.keyboard.press(k); await wait(ms); };
  // a shot: the game reads its keys once a frame, and a press and release within one frame is no shot (as in the original)
  const fire = async (p) => { await p.keyboard.down('ArrowUp'); await wait(60); await p.keyboard.up('ArrowUp'); };

  // ---- one player: all levels from level 1, shooting this way and that until level 1 is cleared or lost
  const s = await open('Solo');
  await s.screenshot({ path: join(shots, 'menu.png') });
  await key(s, 'Enter', 1000);   // 1-player game
  await key(s, 'Enter', 1000);   // play all levels
  await s.waitForFunction(() => /state=game level=1 /.test(window.__fb.state()), { timeout: 15000 });
  check(true, `a 1-player game at level 1: ${await state(s)}`);
  await s.evaluate(() => {
    const w = window;
    w.__lost = '';
    const t = setInterval(() => { const x = w.__fb.state(); if (/state=(lost|won) p1/.test(x)) { w.__lost = x; clearInterval(t); } }, 5);
  });
  let st = '';
  for (let i = 0; i < 600 && !st; i++) {
    // the launcher a little to one side or the other, then a shot
    const turn = ['ArrowLeft', 'ArrowRight'][i % 2];
    await s.keyboard.down(turn);
    await wait(40 + (i * 37) % 160);
    await s.keyboard.up(turn);
    await fire(s);
    await wait(250);
    st = await s.evaluate(() => window.__lost);
    if (i % 40 === 0) console.log(`  ${await state(s)}`);
  }
  await s.screenshot({ path: join(shots, 'solo-end.png') });
  check(/state=(lost|won) p1/.test(st), `the game ended: level 1 cleared or lost (${st || await state(s)})`);
  // Back stops the game
  const f1 = await s.evaluate(() => window.__fb.frames());
  await (await button(s, '← Back')).click();
  await s.waitForSelector('.page .play');
  await wait(300);
  const f2 = await s.evaluate(() => window.__fb.frames());
  await wait(600);
  const f3 = await s.evaluate(() => window.__fb.frames());
  check(f1 > 0 && f2 === f3 && await s.evaluate(() => window.__freegames.stats.running === 0), `Back stopped the game (frames ${f2}, still ${f3})`);

  // ---- online: Anna (host), Bert and Cara; victories limit 1
  const names = ['Anna', 'Bert', 'Cara'];
  const ps = [];
  for (const n of names) ps.push(await open(n));
  for (const p of ps) {
    for (let i = 0; i < 3; i++) await key(p, 'ArrowDown');
    await key(p, 'Enter', 500);   // net game
    await p.waitForSelector('.fb-net');
  }
  const [a, ...others] = ps;
  await hasButton(a, 'Create room');
  await a.select('.fb-limit', '1');
  await (await button(a, 'Create room')).click();
  for (const p of others) {
    await hasButton(p, 'Join');
    await (await button(p, 'Join')).click();
    await hasButton(p, 'Ready');
    await (await button(p, 'Ready')).click();
  }
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].filter((li) => li.textContent.includes('ready ✓')).length >= 2, { timeout: 15000 });
  await a.screenshot({ path: join(shots, 'online-room.png') });
  await (await button(a, 'Start')).click();
  try {
    for (const p of ps) await p.waitForFunction(() => /state=game /.test(window.__fb.state()), { timeout: 30000 });
  } catch (e) {
    for (let i = 0; i < ps.length; i++) {
      console.log(`${names[i]}: ${await state(ps[i])} ${JSON.stringify(await online(ps[i]))}`);
      await ps[i].screenshot({ path: join(shots, `stuck-${names[i]}.png`) });
    }
    throw e;
  }
  const seats = await Promise.all(ps.map(online));
  check(seats.map((o) => o.you).join() === '0,1,2' && seats.every((o) => o.seats === 3), `three seats: ${JSON.stringify(seats)}`);
  check(true, `the online game runs: ${await state(a)}`);
  for (const p of ps) await p.focus('.player-host');
  // everyone shoots straight up; the last one with bubbles above the line wins
  const end = Date.now() + 300000;
  let shot = false;
  while (Date.now() < end) {
    const os = await Promise.all(ps.map(online));
    if (os.every((o) => o.rounds >= 1)) break;
    await Promise.all(ps.map(fire));
    if (!shot && Date.now() > end - 290000) { await a.screenshot({ path: join(shots, 'online-game.png') }); shot = true; }
    await wait(250);
  }
  const res = await Promise.all(ps.map(online));
  const scores = await Promise.all(ps.map((p) => p.evaluate(() => window.__fb.scores())));
  console.log(`results: ${res.map((o) => o.results).join(' | ')}; scores: ${scores.join(' | ')}`);
  check(res.every((o) => o.rounds === 1 && o.results === res[0].results) && /:1(,|\s).*victories$/.test(res[0].results),
    `the round ended at the victories limit with the same results on every client (${res[0].results})`);
  check(scores.every((x) => x === scores[0]) && scores[0].includes(':1'), `the same victories on every screen (${scores[0]})`);
  await a.screenshot({ path: join(shots, 'online-end.png') });
  // back in the lobby: the room is gone
  let open_ = [];
  for (let i = 0; i < 50; i++) {
    open_ = ((await stats()).rooms ?? []).filter((r) => r.game === 'frozenbubble');
    if (!open_.length) break;
    await wait(200);
  }
  check(!open_.length, `the room closed${open_.length ? `: ${JSON.stringify(open_)}` : ''}`);
  for (const p of ps) {
    await (await button(p, '← Back')).click();
    await p.waitForSelector('.page .play');
  }
  await wait(500);
  check(await a.evaluate(() => window.__freegames.stats.running === 0), 'Back stopped the online players');
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'e2e FAILED' : 'e2e passed');
process.exit(failed ? 1 : 0);
