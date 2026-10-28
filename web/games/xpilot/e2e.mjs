// XPilot online, end to end (FG-24): three browsers play one room with robots on the real server.
// Checks that every client sees the others where they are (a ship one client draws is, at the same
// server frame, exactly where its pilot's own client has it), that frames come at the room's rate, that
// a player can leave and drop back in, and that Back stops everything; reports the server's tick time
// (/stats) and the bytes per player per second. Needs `npm run build` and the server jar.
//   node games/xpilot/e2e.mjs            (E2E_SECONDS=60 by default; E2E_SHOTS=dir for screenshots)
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
const seconds = Number(process.env.E2E_SECONDS ?? 60);
const shots = process.env.E2E_SHOTS;
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
if (shots) mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-xpilot-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = false;
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed = true; };
const stats = async () => (await fetch(`${base}stats`)).json();
const outBytes = (s) => s.ws.outBytes + s.wtStream.outBytes + s.wtDatagram.outBytes;

let browser;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });

  /** a player in a browser of its own, on the game's welcome screen */
  async function player(name) {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1100, height: 800 });
    p.on('pageerror', (e) => { console.log(`${name}: page error: ${e.message}`); failed = true; });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await p.evaluate((n) => localStorage.setItem('freegames-name', n), name);
    await play(p);
    return { name, p };
  }
  async function play(p) {
    await p.goto(`${base}#/xpilot/play`, { waitUntil: 'networkidle0' });
    await p.waitForFunction(() => !!window.__xpilot, { timeout: 15000 });
    await wait(1200);
  }
  /** clicks at a point of the client's 1024x768 X screen */
  async function clickX(p, x, y) {
    const r = await p.evaluate(() => { const c = document.querySelector('.player-host canvas'); const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, cw: c.width, ch: c.height }; });
    await p.mouse.click(r.x + x * r.w / r.cw, r.y + y * r.h / r.ch);
    await wait(700);
  }
  const snap = (p) => p.evaluate(() => window.__xpilot?.snapshot() ?? null);
  const inGame = (p, ms = 20000) => p.waitForFunction(() => { const s = window.__xpilot?.snapshot(); return s && s.self && s.loops > 0; }, { timeout: ms });
  // the welcome screen (welcome.c's layout on a 1024x768 screen)
  const INTERNET = [58, 122], CREATE_ROOM = [180, 753], CIRCLE2 = [582, 102], MORE_ROBOTS = [367, 269], CREATE = [176, 303], FIRST_ROOM = [687, 60];
  async function joinFirstRoom(p) {
    await clickX(p, ...INTERNET);
    await wait(800);
    await clickX(p, ...FIRST_ROOM);
    await inGame(p);
  }

  // ---- Anna creates a room on circle2 with three robots; Bert and Cora drop in
  const a = await player('Anna');
  await clickX(a.p, ...INTERNET);
  await clickX(a.p, ...CREATE_ROOM);
  await clickX(a.p, ...CIRCLE2);
  for (let i = 0; i < 3; i++) await clickX(a.p, ...MORE_ROBOTS);
  if (shots) await (await a.p.$('.player-host')).screenshot({ path: join(shots, 'create-room.png') });
  await clickX(a.p, ...CREATE);
  await inGame(a.p);
  check(true, 'Anna created a room and plays');
  const b = await player('Bert');
  await joinFirstRoom(b.p);
  const c = await player('Cora');
  await joinFirstRoom(c.p);
  const all = [a, b, c];
  const now = await Promise.all(all.map(({ p }) => snap(p)));
  check(new Set(now.map((s) => s.self.id)).size === 3, `three pilots: ${now.map((s, i) => `${all[i].name} #${s.self.id}`).join(', ')}`);
  check(Math.max(...now.map((s) => s.loops)) - Math.min(...now.map((s) => s.loops)) < 100, `one world: frames ${now.map((s) => s.loops).join(', ')}`);
  await wait(4000);
  const players = (await snap(a.p)).players;
  check(players >= 6, `the three of them and the robots: ${players} players`);

  // ---- every client records what it sees, frame by frame
  for (const { p } of all) {
    await p.evaluate(() => {
      window.__samples = [];
      let last = -1;
      const tick = () => {
        const s = window.__xpilot?.snapshot();
        if (s && s.loops !== last) {
          last = s.loops;
          if (window.__samples.length < 20000) window.__samples.push({ l: s.loops, self: s.self, ships: s.ships });
        }
        if (window.__xpilot) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await p.focus('.player-host');
  }

  // ---- they fly, turn and fire; Cora leaves halfway and drops back in
  const s0 = await stats();
  const t0 = Date.now();
  const loops0 = await Promise.all(all.map(({ p }) => snap(p).then((s) => s.loops)));
  const fly = async ({ p }, k) => {
    const end = t0 + seconds * 1000;
    let i = 0;
    while (Date.now() < end && !p.isClosed()) {
      try {
        await p.keyboard.down('Shift');
        await p.keyboard.down(k % 2 ? 'a' : 's');
        await wait(250 + 50 * k);
        await p.keyboard.up(k % 2 ? 'a' : 's');
        if (i++ % 3 === 0) { await p.keyboard.press('Enter'); }
        await wait(150);
        await p.keyboard.up('Shift');
        await wait(200);
      } catch { /* the page is between screens */ }
    }
  };
  const flying = all.map((x, k) => fly(x, k));
  await wait((seconds / 2) * 1000);
  if (shots) for (const { name, p } of all) await (await p.$('.player-host')).screenshot({ path: join(shots, `play-${name}.png`) });
  const coraBefore = (await snap(c.p)).self.id;
  await c.p.click('.player-bar button');            // ← Back: leaves the room
  await c.p.waitForSelector('.page .play', { timeout: 10000 });
  check(await c.p.evaluate(() => window.__freegames.stats.running === 0 && !window.__xpilot), 'Cora left: the game stopped');
  await wait(1500);
  await play(c.p);
  await joinFirstRoom(c.p);
  const coraAgain = await snap(c.p);
  check(!!coraAgain.self, `Cora dropped back in (#${coraBefore} → #${coraAgain.self.id})`);
  await c.p.evaluate(() => {
    window.__samples = window.__samples ?? [];
    let last = -1;
    const tick = () => { const s = window.__xpilot?.snapshot(); if (s && s.loops !== last) { last = s.loops; window.__samples.push({ l: s.loops, self: s.self, ships: s.ships }); } if (window.__xpilot) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await c.p.focus('.player-host');
  await Promise.all(flying);
  const elapsed = (Date.now() - t0) / 1000;
  const s1 = await stats();

  // ---- what they saw
  const samples = await Promise.all(all.map(({ p }) => p.evaluate(() => window.__samples)));
  const loops1 = await Promise.all(all.map(({ p }) => snap(p).then((s) => s.loops)));
  const fps = [0, 1].map((i) => (loops1[i] - loops0[i]) / elapsed);
  check(fps.every((f) => f > 40 && f < 55), `frames at the room's rate (50/s): ${fps.map((f) => f.toFixed(1)).join(', ')} per second`);
  if (process.env.E2E_DEBUG) samples.forEach((ss, i) => {
    const ids = new Map();
    ss.forEach((s) => s.ships.forEach((sh) => ids.set(sh.id, (ids.get(sh.id) ?? 0) + 1)));
    const selves = new Set(ss.filter((s) => s.self).map((s) => `${s.self.id}${s.self.visible ? '' : '(hidden)'}`));
    console.log(`     debug ${all[i].name}: ${ss.length} samples, frames ${ss[0]?.l}..${ss.at(-1)?.l}, self ${[...selves].join('/')}, ships seen ${JSON.stringify([...ids])}`);
  });
  // a ship a client draws is where its pilot's own client has itself, at the same server frame
  const own = samples.map((ss) => new Map(ss.filter((s) => s.self && s.self.visible).map((s) => [s.l, s.self])));
  let same = 0, differ = 0;
  const examples = [];
  samples.forEach((ss, i) => ss.forEach((s) => s.ships.forEach((ship) => {
    samples.forEach((_, j) => {
      if (j === i) return;
      const o = own[j].get(s.l);
      if (!o || o.id !== ship.id) return;
      if (o.x === ship.x && o.y === ship.y) same++;
      else { differ++; if (examples.length < 5) examples.push(`${all[i].name} sees #${ship.id} at ${ship.x},${ship.y}, its pilot is at ${o.x},${o.y} (frame ${s.l})`); }
    });
  })));
  check(same >= 20 && differ === 0, `everyone sees the others where they are: ${same} sightings agree, ${differ} differ${examples.length ? ': ' + examples.join('; ') : ''}`);
  const room = (s1.rooms ?? []).find((r) => r.game === 'xpilot');
  check(!!room, `the server runs the world: ${room ? `tick ${room.tickMs} ms, last ${room.lastTickMs} ms, mean ${room.meanTickMs} ms, ${room.overBudget} over budget, ${room.seats} seats` : 'no xpilot room in /stats'}`);
  const perPlayer = (outBytes(s1) - outBytes(s0)) / elapsed / 3;
  console.log(`     bytes to each player: ${(perPlayer / 1024).toFixed(1)} KiB/s`);

  // ---- Back stops everything
  for (const { name, p } of all) {
    await p.click('.player-bar button');
    await p.waitForSelector('.page .play', { timeout: 10000 });
    check(await p.evaluate(() => window.__freegames.stats.running === 0 && !window.__xpilot), `${name}: Back stopped the game`);
  }
  await wait(1500);
  const s2 = await stats();
  check(!(s2.rooms ?? []).some((r) => r.game === 'xpilot'), 'the room closed when the last pilot left');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'xpilot e2e FAILED' : 'xpilot e2e passed');
process.exit(failed ? 1 : 0);
