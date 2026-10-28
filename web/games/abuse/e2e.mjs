// Abuse end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/abuse/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A local game (the gamma dialog of the first start, the title, the menu, running and shooting, the
// gamma setting kept in the player's storage on the server), then an online deathmatch in two browser
// contexts: the lobby from the menu's networking icon, both games equal tick by tick while each player
// plays, a player who leaves (the other goes on alone), and Back stopping the game.
// Screenshots go to $E2E_SHOTS (default: dist-e2e/abuse/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'abuse');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const dataDir = mkdtempSync(join(tmpdir(), 'abuse-e2e-'));
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

/** the player's numbers from the reported state: p<n> -> [x, y, hp, state, frame, xvel, yvel, weapon] */
const players = (state) => Object.fromEntries([...state.matchAll(/ p(\d+)=([-\d,]+)/g)].map((m) => [m[1], m[2].split(',').map(Number)]));
const tickOf = (state) => +(/ tick=(\d+)/.exec(state)?.[1] ?? -1);

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const context = async () => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1100, height: 760 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error') console.log(`console error: ${m.text()}`); });
    return p;
  };
  const play = async (p) => {
    await p.goto(`${base}#/abuse`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.player-host canvas');
    await p.waitForFunction(() => window.__abuse?.frames() > 1, { timeout: 30000 });
  };
  const frames = (p) => p.evaluate(() => window.__abuse.frames());
  const state = (p) => p.evaluate(() => window.__abuse.state());
  const online = (p) => p.evaluate(() => window.__abuse.online());
  /** a click at x,y of the game's 320x200 screen */
  const click = async (p, x, y, button = 'left') => {
    const r = await p.$eval('.player-host canvas', (c) => { const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
    await p.mouse.move(r.x + (x + 0.5) * r.w / 320, r.y + (y + 0.5) * r.h / 200);
    await wait(120);
    await p.mouse.down({ button });
    await wait(150);
    await p.mouse.up({ button });
    await wait(150);
  };
  const hold = async (p, key, ms) => {
    await p.keyboard.down(key);
    await wait(ms);
    await p.keyboard.up(key);
  };
  const until = (p, fn, arg, timeout = 30000) => p.waitForFunction(fn, { timeout, polling: 100 }, arg);
  /** the first start: the gamma dialog's check mark, then the title skipped, then the menu */
  const toMenu = async (p, gamma) => {
    if (gamma) {
      await wait(1500);
      await click(p, 52, 160);
    }
    await wait(2500);
    await p.keyboard.press('Space');
    await until(p, () => / st=6/.test(window.__abuse.state()) || window.__abuse.state() === 'menu');
    await wait(1500);
  };
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);

  // ---- a local game
  const a = await context();
  await play(a);
  const f0 = await frames(a);
  await wait(1500);
  check(await frames(a) - f0 < 10, 'the first start waits in the gamma dialog');
  await a.screenshot({ path: join(shots, 'gamma.png') });
  await toMenu(a, true);
  check(/ st=6/.test(await state(a)), `the main menu (${(await state(a)).trim()})`);
  await a.screenshot({ path: join(shots, 'menu.png') });
  await click(a, 303, 12); // the start icon
  await until(a, () => / tick=\d+/.test(window.__abuse.state()) && / st=0/.test(window.__abuse.state()));
  await wait(1500);
  const before = players(await state(a))['0'];
  await hold(a, 'ArrowRight', 1500);
  await wait(700);
  const after = players(await state(a))['0'];
  check(after && before && after[0] > before[0] + 30, `Right runs (x ${before?.[0]} -> ${after?.[0]})`);
  await click(a, 260, 90);
  await a.mouse.down();
  await wait(1200);
  await a.mouse.up();
  await a.screenshot({ path: join(shots, 'local-game.png') });
  check(tickOf(await state(a)) > 0, `the level runs (${(await state(a)).trim()})`);
  // the gamma setting went to the player's storage: a new start shows no gamma dialog
  await (await button(a, '← Back')).click();
  await a.waitForSelector('.page .play');
  await a.click('.page .play');
  await a.waitForSelector('.player-host canvas');
  await until(a, () => window.__abuse?.frames() > 60, undefined, 20000).catch(() => {});
  check(await frames(a) > 60, `the second start goes straight to the title (gamma.lsp kept on the server; ${await frames(a)} frames)`);
  await (await button(a, '← Back')).click();
  await a.waitForSelector('.page .play');

  // ---- online: Anna (seat 0) and Bert (seat 1)
  const b = await context();
  await play(a);
  await play(b);
  await toMenu(a, false);
  await toMenu(b, true);
  const lobby = async (p, name) => {
    await click(p, 303, 112); // the networking icon
    await p.waitForSelector('.fg-lobby input[placeholder="Your name"]', { timeout: 10000 });
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, n) => { e.value = n; e.dispatchEvent(new Event('change')); }, name);
  };
  await lobby(a, 'Anna');
  await lobby(b, 'Bert');
  await a.select('.abuse-size', '2');
  await a.$eval('.abuse-kills', (e) => { e.value = '5'; });
  await a.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'cistern'; });
  await (await button(a, 'Create room')).click();
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'cistern');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('cistern')), { timeout: 8000 });
  await (await button(b, 'Join')).click();
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'cistern');
  await (await button(b, 'Ready')).click();
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await a.screenshot({ path: join(shots, 'online-room.png') });
  await (await button(a, 'Start')).click();
  for (const p of [a, b]) await until(p, () => / p0=.* p1=/.test(window.__abuse.state()), undefined, 30000);
  const oa = await online(a), ob = await online(b);
  check(oa?.seat === 0 && ob?.seat === 1 && oa.players === 2, `both in the round (seats ${oa?.seat}, ${ob?.seat})`);
  // each plays: Anna runs right and shoots, Bert runs left and jumps
  await Promise.all([
    (async () => { await hold(a, 'ArrowRight', 1200); await click(a, 250, 80); await hold(a, 'Space', 800); })(),
    (async () => { await hold(b, 'ArrowLeft', 1000); await hold(b, 'ArrowUp', 200); await hold(b, 'ArrowRight', 800); })(),
  ]);
  await wait(1500);
  await a.screenshot({ path: join(shots, 'online-anna.png') });
  await b.screenshot({ path: join(shots, 'online-bert.png') });
  const sa = new Map((await online(a)).syncs), sb = new Map((await online(b)).syncs);
  const common = [...sa.keys()].filter((t) => sb.has(t));
  const differ = common.filter((t) => sa.get(t) !== sb.get(t));
  check(common.length >= 5 && differ.length === 0, `both games are equal at ${common.length} common ticks (${differ.length} differ)`);
  const pa = players(await state(a)), pb = players(await state(b));
  console.log(`     anna sees ${JSON.stringify(pa)}, bert sees ${JSON.stringify(pb)}`);
  check(Object.keys(pa).length === 2, 'two players in the level');

  // Bert's connection drops (a new one, as after a dropped one): he gets the ticks he missed and both play on
  await b.evaluate(() => { void window.__abuse.reconnect('Bert B'); });
  await wait(1500);
  await Promise.all([hold(a, 'ArrowLeft', 1500), hold(b, 'ArrowRight', 1500)]);
  await wait(1000);
  const ta = tickOf(await state(a)), tb = tickOf(await state(b));
  const ra = new Map((await online(a)).syncs), rb = new Map((await online(b)).syncs);
  const later = [...ra.keys()].filter((t) => rb.has(t) && t > Math.max(...common));
  check(later.length >= 2 && later.every((t) => ra.get(t) === rb.get(t)) && Math.abs(ta - tb) < 5,
    `after the reconnection both games go on equal (${later.length} ticks compared, ticks ${ta} / ${tb})`);

  // ---- Bert leaves: Anna's game goes on without him
  await (await button(b, '← Back')).click();
  await b.waitForSelector('.page .play');
  await until(a, () => !/ p1=/.test(window.__abuse.state()), undefined, 15000).catch(() => {});
  const fa = await frames(a);
  await wait(1500);
  check(!/ p1=/.test(await state(a)) && await frames(a) > fa + 10, `Bert left: his player is gone and Anna plays on (${(await state(a)).trim()})`);

  // ---- Back stops the game
  await (await button(a, '← Back')).click();
  await a.waitForSelector('.page .play');
  const f1 = await a.evaluate(() => window.__abuse.frames());
  await wait(600);
  const f2 = await a.evaluate(() => window.__abuse.frames());
  check(f1 === f2 && await a.evaluate(() => window.__freegames.stats.running === 0), `Back stopped the game (frames ${f1}, still ${f2})`);
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  for (const [i, p] of (await browser?.pages() ?? []).entries()) {
    await p.screenshot({ path: join(shots, `failure-${i}.png`) }).catch(() => {});
    console.log(`page ${i}: ${await p.evaluate(() => window.__abuse?.state()).catch(() => '?')}`);
  }
  failed = true;
} finally {
  await browser?.close();
  server.kill();
  await new Promise((r) => server.once('exit', r));
  rmSync(dataDir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
