// Bomberslop end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/bomberslop/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A local game (the menu, one player against three computer blobs: walking, laying a bomb, its splash), then an
// online match in two browser contexts: the lobby, both playing, both games equal turn by turn (the hashes every
// 16th turn), a player who leaves (the other is told and wins), and Back stopping the game.
// Screenshots go to $E2E_SHOTS (default: dist-e2e/bomberslop/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'bomberslop');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const dataDir = mkdtempSync(join(tmpdir(), 'bomberslop-e2e-'));
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: dataDir },
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
  const context = async () => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1100, height: 800 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error') console.log(`console error: ${m.text()}`); });
    return p;
  };
  const info = (p) => p.evaluate(() => window.__bomberslop.info());
  const online = (p) => p.evaluate(() => window.__bomberslop.online());
  const until = (p, fn, arg, timeout = 30000) => p.waitForFunction(fn, { timeout, polling: 50 }, arg);
  const press = async (p, key, n = 1) => {
    for (let i = 0; i < n; i++) {
      await p.keyboard.press(key);
      await wait(80);
    }
  };
  const hold = async (p, key, ms) => {
    await p.keyboard.down(key);
    await wait(ms);
    await p.keyboard.up(key);
  };
  const play = async (p) => {
    await p.goto(`${base}#/bomberslop`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.player-host canvas');
    await until(p, () => window.__bomberslop?.state() === 'title');
  };
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);

  // ---- a local game: one player and three computer blobs
  const a = await context();
  await play(a);
  await a.screenshot({ path: join(shots, 'title.png') });
  await press(a, 'Enter'); // Local game
  check(await a.evaluate(() => window.__bomberslop.state()) === 'setup', 'Enter opens the local game setup');
  await press(a, 'ArrowDown', 6);
  await press(a, 'Enter'); // Start!
  await until(a, () => window.__bomberslop.info().roundTime < 89.5);
  const i0 = await info(a);
  check(i0.players.length === 4 && i0.map === 'Canteen', `four blobs on the first map (${i0.map}, ${i0.players.length})`);
  // walk: one of the four ways out of the corner is open
  let moved = false;
  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
    const before = (await info(a)).players[0];
    await hold(a, key, 350);
    const after = (await info(a)).players[0];
    if (after.x !== before.x || after.y !== before.y) {
      moved = true;
      console.log(`     ${key}: (${before.x}, ${before.y}) -> (${after.x}, ${after.y})`);
      break;
    }
  }
  check(moved, 'the arrow keys walk the player');
  // a bomb: Enter lays it, it splashes 2.5 s later
  const bombs0 = (await info(a)).players[0].bombs;
  await press(a, 'Enter');
  const bombs1 = (await info(a)).players[0].bombs;
  check(bombs1 === bombs0 - 1 || (await info(a)).players[0].dead, `Enter lays a jelly bomb (bombs in hand ${bombs0} -> ${bombs1})`);
  await until(a, () => window.__bomberslop.info().explosions > 0, undefined, 10000);
  await a.screenshot({ path: join(shots, 'local.png') });
  check(true, 'the bomb splashed');
  const f0 = (await info(a)).frames;
  await wait(1000);
  const f1 = (await info(a)).frames;
  check(f1 - f0 > 40 && f1 - f0 < 90, `the game runs at 64 frames a second (${f1 - f0} in a second)`);
  await press(a, 'KeyP');
  const p0 = (await info(a)).frames;
  await wait(500);
  check((await info(a)).frames === p0, 'P pauses');
  await press(a, 'KeyP');
  await press(a, 'Escape');
  await until(a, () => window.__bomberslop.state() === 'title');
  check(true, 'Esc quits the game to the title');

  // ---- online: Anna (seat 0) and Bert (seat 1)
  const b = await context();
  await play(b);
  const toLobby = async (p, name) => {
    await press(p, 'ArrowDown');
    await press(p, 'Enter'); // Online game
    await p.waitForSelector('.fg-lobby input[placeholder="Your name"]', { timeout: 10000 });
    await p.click('.fg-lobby input[placeholder="Your name"]', { clickCount: 3 });
    await p.keyboard.type(name);
    await p.keyboard.press('Tab');
  };
  await toLobby(a, 'Anna');
  await toLobby(b, 'Bert');
  await a.click('.fg-lobby input[placeholder="Room name"]', { clickCount: 3 });
  await a.keyboard.type('canteen');
  await (await button(a, 'Create room')).click();
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'canteen');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('canteen')), { timeout: 8000 });
  await (await button(b, 'Join')).click();
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'canteen');
  await (await button(b, 'Ready')).click();
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await a.screenshot({ path: join(shots, 'online-room.png') });
  await (await button(a, 'Start')).click();
  for (const p of [a, b]) await until(p, () => window.__bomberslop.state() === 'online' && window.__bomberslop.online()?.turn > 24, undefined, 30000);
  const oa = await online(a), ob = await online(b);
  check(oa.me === 0 && ob.me === 1 && oa.seats.length === 2, `both in the match (players ${oa.me}, ${ob.me})`);
  // each plays: walking out of their corners and laying bombs
  const walk = async (p, keys) => {
    for (const k of keys) {
      await hold(p, k, 300);
      await press(p, 'Enter');
      await hold(p, k === 'ArrowLeft' ? 'ArrowRight' : k === 'ArrowRight' ? 'ArrowLeft' : k === 'ArrowUp' ? 'ArrowDown' : 'ArrowUp', 300);
      await wait(200);
    }
  };
  await Promise.all([walk(a, ['ArrowRight', 'ArrowDown', 'ArrowLeft']), walk(b, ['ArrowLeft', 'ArrowUp', 'ArrowRight'])]);
  await wait(2500);
  await a.screenshot({ path: join(shots, 'online-anna.png') });
  await b.screenshot({ path: join(shots, 'online-bert.png') });
  const la = new Map((await online(a)).log.map((e) => [e.turn, e.hash]));
  const lb = new Map((await online(b)).log.map((e) => [e.turn, e.hash]));
  const common = [...la.keys()].filter((t) => lb.has(t));
  const differ = common.filter((t) => la.get(t) !== lb.get(t));
  check(common.length >= 5 && differ.length === 0, `both games are equal at ${common.length} common turns (${differ.length} differ)`);
  const ia = await info(a), ib = await info(b);
  console.log(`     anna at turn ${(await online(a)).turn}: ${JSON.stringify(ia.players.map((x) => [x.x, x.y, x.dead]))}`);
  console.log(`     bert at turn ${(await online(b)).turn}: ${JSON.stringify(ib.players.map((x) => [x.x, x.y, x.dead]))}`);
  check(ia.objects + ib.objects >= 0 && (ia.frames > 100), `the match runs (${ia.frames} frames)`);
  check((await online(a)).end === null, 'nobody stopped the round (no desync)');

  // ---- Bert leaves: Anna is told, and wins
  await press(b, 'Escape');
  await until(b, () => window.__bomberslop.state() === 'title');
  await until(a, () => window.__bomberslop.online()?.end !== null, undefined, 15000);
  const ea = await online(a);
  console.log(`     anna: ${JSON.stringify(ea.end)}, left: ${JSON.stringify(ea.left)}`);
  check(ea.end?.reason === 'left' && ea.end?.winner === 0 && ea.left.includes('Bert'), 'Bert left: Anna is told, the round ends with Anna the winner');
  await wait(300);
  await a.screenshot({ path: join(shots, 'online-left.png') });
  await press(a, 'Enter');
  await until(a, () => window.__bomberslop.state() === 'title');
  check(true, 'Enter goes back to the title');

  // ---- Back stops the game
  await (await button(a, '← Back')).click();
  await a.waitForSelector('.page .play');
  const stopped = await a.evaluate(() => !window.__bomberslop && window.__freegames.stats.running === 0);
  check(stopped, 'Back stopped the game');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  for (const [i, p] of (await browser?.pages() ?? []).entries()) {
    await p.screenshot({ path: join(shots, `failure-${i}.png`) }).catch(() => {});
    console.log(`page ${i}: ${JSON.stringify(await p.evaluate(() => [window.__bomberslop?.state(), window.__bomberslop?.online()]).catch(() => '?'))}`);
  }
  failed = true;
} finally {
  await browser?.close();
  server.kill();
  await new Promise((r) => server.once('exit', r));
  rmSync(dataDir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
