// Netrek online, end to end: three browsers play one galaxy with a practice robot on the real server, in
// UDP mode (COW's default: it asks for UDP when it enters the game; the datagrams go as WebTransport
// datagrams). Checks that every client switched to UDP and that datagrams flow both ways (the clients'
// counts and the server's /stats), that every client sees the others where they are (the position one
// client has for a ship is, at the same moment, where that ship's own client has itself, within what it
// flies in a moment), that the server's updates come at the client's rate, that a player can leave and drop
// back in (and logs in again with the character's password), that Back stops everything and that the room
// closes when the last player leaves; reports the server's tick time and the bytes per player per second.
// Needs `npm run build` and the server jar.
//   node games/netrek/e2e.mjs            (E2E_SECONDS=60 by default; E2E_SHOTS=dir for screenshots)
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-netrek-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = false;
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed = true; };
const stats = async () => (await fetch(`${base}stats`)).json();
const outBytes = (s) => s.ws.outBytes + s.wtStream.outBytes + s.wtDatagram.outBytes;
const PALIVE = 2;

let browser;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });

  const button = async (p, text) => {
    for (const b of await p.$$('button')) if ((await b.evaluate((e) => e.textContent)) === text) return b;
    throw new Error(`no button "${text}"`);
  };
  const snap = (p) => p.evaluate(() => window.__netrek?.snapshot() ?? null);
  const self = (s) => s?.players.find((q) => q.no === s.me) ?? null;

  /** a player in a browser of its own */
  async function player(name) {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1280, height: 900 });
    p.on('pageerror', (e) => { console.log(`${name}: page error: ${e.message}`); failed = true; });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await p.evaluate((n) => localStorage.setItem('freegames-name', n), name);
    await open(p);
    return { name, p };
  }
  async function open(p) {
    await p.goto(`${base}#/netrek/play`, { waitUntil: 'networkidle0' });
    await p.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Create room'), { timeout: 15000 });
  }
  /** COW's login window (the name is the site's, from the rc file), then the default team in a cruiser */
  async function enter(p, name, fresh) {
    await p.waitForFunction(() => !!window.__netrek?.snapshot(), { timeout: 15000 });
    await wait(1500);
    await p.focus('.player-host');
    await p.keyboard.press('Enter');
    await wait(2500);
    for (let i = 0; i < (fresh ? 2 : 1); i++) {
      await p.keyboard.type('secret', { delay: 60 });
      await p.keyboard.press('Enter');
      await wait(2500);
    }
    await p.waitForFunction((n) => { const s = window.__netrek?.snapshot(); return s && s.players.some((q) => q.no === s.me && q.name === n); }, { timeout: 15000 }, name);
    await p.keyboard.press('Enter');                  // "press enter to join the default team"
    await p.waitForFunction(() => { const s = window.__netrek?.snapshot(); return s && s.players.some((q) => q.no === s.me && q.status === 2); }, { timeout: 20000 })
      .catch(async (e) => { if (shots) await p.screenshot({ path: join(shots, `enter-${name}.png`) }); throw e; });
  }
  /** a press of a mouse button at a point of the X screen (root coordinates) */
  async function clickX(p, x, y, button = 'left') {
    const r = await p.evaluate(() => { const c = document.querySelector('.player-host canvas'); const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, cw: c.width, ch: c.height }; });
    await p.mouse.click(r.x + (x + 0.5) * r.w / r.cw, r.y + (y + 0.5) * r.h / r.ch, { button });
  }
  async function joinRoom(p) {
    await p.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Join'), { timeout: 10000 });
    await (await button(p, 'Join')).click();
  }

  // ---- Anna opens a galaxy and calls the practice robot; Bert and Cara drop in
  const a = await player('Anna');
  await (await button(a.p, 'Create room')).click();
  await a.p.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Start'), { timeout: 10000 });
  await (await button(a.p, 'Start')).click();
  await enter(a.p, 'Anna', true);
  check(true, 'Anna opened a galaxy and flies');
  await a.p.keyboard.down('Shift');
  await a.p.keyboard.press('Digit8');                 // '*'
  await a.p.keyboard.up('Shift');
  await a.p.waitForFunction(() => window.__netrek.snapshot().players.length >= 2, { timeout: 10000 }).catch(() => {});
  const robots = (await snap(a.p)).players.filter((q) => q.name !== 'Anna').map((q) => q.name);
  check(robots.length >= 1, `the practice robot joined: ${robots.join(', ')}`);
  const b = await player('Bert');
  await joinRoom(b.p);
  await enter(b.p, 'Bert', true);
  const c = await player('Cara');
  await joinRoom(c.p);
  await enter(c.p, 'Cara', true);
  const all = [a, b, c];
  const now = await Promise.all(all.map(({ p }) => snap(p)));
  check(new Set(now.map((s) => s.me)).size === 3, `three ships: ${now.map((s, i) => `${all[i].name} #${s.me} team ${self(s).team}`).join(', ')}`);
  await wait(2000);
  const seen = await Promise.all(all.map(({ p }) => snap(p)));
  check(seen.every((s) => ['Anna', 'Bert', 'Cara'].every((n) => s.players.some((q) => q.name === n))),
    `everyone sees everyone: ${seen.map((s, i) => `${all[i].name}: ${s.players.map((q) => q.name).join('/')}`).join('; ')}`);
  const udpOn = await Promise.all(all.map(({ p }) => p.waitForFunction(() => window.__netrek?.snapshot()?.udp, { timeout: 15000 }).then(() => true, () => false)));
  check(udpOn.every((u) => u), `COW switched to UDP as it entered the game: ${udpOn.map((u, i) => `${all[i].name} ${u ? 'UDP' : 'TCP'}`).join(', ')}`);

  // ---- every client records what it sees, with the time
  const record = (p) => p.evaluate(() => {
    window.__samples = window.__samples ?? [];
    let last = -1;
    const tick = () => {
      const s = window.__netrek?.snapshot();
      if (s && s.received + s.datagramsIn !== last) {
        last = s.received + s.datagramsIn;
        if (window.__samples.length < 30000) window.__samples.push({ t: Date.now(), dg: s.datagramsIn, me: s.me, players: s.players.filter((q) => q.status === 2).map((q) => [q.no, q.name, q.x, q.y]) });
      }
      if (window.__netrek) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  for (const { p } of all) await record(p);

  // ---- they fly at warp 4, steer and fire; Cara leaves halfway and drops back in
  const s0 = await stats();
  const dg0 = await Promise.all(all.map(({ p }) => snap(p).then((s) => s.datagramsIn)));
  const t0 = Date.now();
  const away = new Set();
  const deaths = [0, 0, 0];
  const fly = async ({ p }, k) => {
    const end = t0 + seconds * 1000;
    let i = 0;
    while (Date.now() < end && !p.isClosed()) {
      try {
        const now = away.has(k) ? null : await snap(p);
        if (!now) { await wait(300); continue; }
        await p.focus('.player-host');
        if (self(now)?.status !== PALIVE) {
          // killed: back in with the default team ("press enter to join the default team")
          deaths[k]++;
          await p.keyboard.press('Enter');
          await wait(1500);
          continue;
        }
        await p.keyboard.press('4');
        const ang = (i * 0.9 + k * 2.1);
        await clickX(p, 250 + Math.round(150 * Math.cos(ang)), 250 + Math.round(150 * Math.sin(ang)), 'right');
        if (i % 3 === k % 3) await clickX(p, 250 + Math.round(100 * Math.sin(ang)), 250 - Math.round(100 * Math.cos(ang)), 'left');
        i++;
        await wait(700 + 100 * k);
      } catch { /* the page is between screens */ }
    }
  };
  const flying = all.map((x, k) => fly(x, k));
  await wait((seconds / 2) * 1000);
  if (shots) for (const { name, p } of all) await (await p.$('.player-host')).screenshot({ path: join(shots, `play-${name}.png`) });
  const caraBefore = (await snap(c.p)).me;
  const caraSamples = await c.p.evaluate(() => window.__samples);
  away.add(2);
  await c.p.click('.player-bar button');            // ← Back: leaves the room
  await c.p.waitForSelector('.page .play', { timeout: 10000 });
  check(await c.p.evaluate(() => window.__freegames.stats.running === 0 && !window.__netrek), 'Cara left: the game stopped');
  await wait(3000);
  const gone = await snap(a.p);
  check(!gone.players.some((q) => q.name === 'Cara' && q.status === PALIVE), 'the others saw Cara go');
  await open(c.p);
  await joinRoom(c.p);
  await enter(c.p, 'Cara', false);
  const caraAgain = await snap(c.p);
  check(caraAgain.me >= 0, `Cara dropped back in with her password (#${caraBefore} → #${caraAgain.me})`);
  // COW asks for UDP as it enters the game: a moment later it is in UDP mode
  const caraUdp = await c.p.waitForFunction(() => window.__netrek?.snapshot()?.udp, { timeout: 15000 }).then(() => true, () => false);
  check(caraUdp, 'Cara is in UDP mode again');
  await c.p.evaluate((ss) => { window.__samples = ss; }, caraSamples);
  await record(c.p);
  away.delete(2);
  await Promise.all(flying);
  const elapsed = (Date.now() - t0) / 1000;
  const s1 = await stats();
  const end = await Promise.all(all.map(({ p }) => snap(p)));

  // ---- what they saw
  const samples = await Promise.all(all.map(({ p }) => p.evaluate(() => window.__samples)));
  // while flying, the server's updates come at the rate the original gives COW (25 per second: COW asks
  // for 50, the server's sysdef default is 25; the oracle's cowduel has the same)
  const ups = samples.map((ss) => {
    let n = 0, dt = 0;
    for (let i = 1; i < ss.length; i++) {
      if (ss[i].t - ss[i - 1].t > 1000 || !ss[i].players.some((q) => q[0] === ss[i].me)) continue;
      n++;
      dt += ss[i].t - ss[i - 1].t;
    }
    return dt ? n / (dt / 1000) : 0;
  });
  check(ups.every((f) => f > 18 && f < 30), `updates at the original's rate while flying (25/s): ${ups.map((f) => f.toFixed(1)).join(', ')} per second; ships lost ${deaths.join(', ')}`);
  // UDP: every client in UDP mode, its updates as datagrams; the server's datagram channel carries them
  check(end.every((s) => s.udp), `every client in UDP mode: ${end.map((s, i) => `${all[i].name} ${s.udp ? 'UDP' : 'TCP'}`).join(', ')}`);
  // datagrams per second while a client flies (its updates; fewer while it waits for a new ship)
  const dgps = samples.map((ss) => {
    let n = 0, dt = 0;
    for (let i = 1; i < ss.length; i++) {
      if (ss[i].t - ss[i - 1].t > 1000 || ss[i].dg < ss[i - 1].dg || !ss[i].players.some((q) => q[0] === ss[i].me)) continue;
      n += ss[i].dg - ss[i - 1].dg;
      dt += ss[i].t - ss[i - 1].t;
    }
    return dt ? n / (dt / 1000) : 0;
  });
  const avg = [0, 1].map((i) => (end[i].datagramsIn - dg0[i]) / elapsed);
  check(dgps.every((f) => f > 18), `datagrams from the server while flying: ${dgps.map((f) => f.toFixed(1)).join(', ')} per second (over the whole run ${avg.map((f) => f.toFixed(1)).join(', ')}; Cara since she dropped back in: ${end[2].datagramsIn} in, ${end[2].datagramsOut} out)`);
  const dOut = (s1.wtDatagram.outMsgs - s0.wtDatagram.outMsgs) / elapsed, dIn = (s1.wtDatagram.inMsgs - s0.wtDatagram.inMsgs) / elapsed;
  check(dOut > 40 && dIn > 0.5, `/stats: WebTransport datagrams ${dOut.toFixed(1)} out, ${dIn.toFixed(1)} in per second (${((s1.wtDatagram.outBytes - s0.wtDatagram.outBytes) / elapsed / 1024).toFixed(1)} KiB/s out)`);
  // a ship a client shows is where its own client has itself at the same moment (±50 ms, 400 units)
  const own = samples.map((ss) => ss.map((s) => ({ t: s.t, self: s.players.find((q) => q[0] === s.me) })).filter((s) => s.self));
  let same = 0, differ = 0;
  const examples = [];
  samples.forEach((ss, i) => ss.forEach((s) => s.players.forEach((q) => {
    if (q[0] === s.me) return;
    own.forEach((os, j) => {
      if (j === i) return;
      let best = null;
      for (const o of os) if (o.self[1] === q[1] && (!best || Math.abs(o.t - s.t) < Math.abs(best.t - s.t))) best = o;
      if (!best || Math.abs(best.t - s.t) > 50) return;
      const d = Math.hypot(best.self[2] - q[2], best.self[3] - q[3]);
      if (d <= 400) same++;
      else { differ++; if (examples.length < 5) examples.push(`${all[i].name} sees ${q[1]} at ${q[2]},${q[3]}, its own client at ${best.self[2]},${best.self[3]}`); }
    });
  })));
  check(same >= 100 && differ <= same / 100, `everyone sees the others where they are: ${same} sightings agree, ${differ} differ${examples.length ? ': ' + examples.join('; ') : ''}`);
  const room = (s1.rooms ?? []).find((r) => r.game === 'netrek');
  check(!!room, `the server runs the galaxy: ${room ? `tick ${room.tickMs} ms, last ${room.lastTickMs} ms, mean ${room.meanTickMs} ms, ${room.overBudget} over budget, ${room.seats} seats` : 'no netrek room in /stats'}`);
  const perPlayer = (outBytes(s1) - outBytes(s0)) / elapsed / 3;
  console.log(`     bytes to each player: ${(perPlayer / 1024).toFixed(1)} KiB/s`);

  // ---- Back stops everything
  for (const { name, p } of all) {
    await p.click('.player-bar button');
    await p.waitForSelector('.page .play', { timeout: 10000 });
    check(await p.evaluate(() => window.__freegames.stats.running === 0 && !window.__netrek), `${name}: Back stopped the game`);
  }
  await wait(1500);
  const s2 = await stats();
  check(!(s2.rooms ?? []).some((r) => r.game === 'netrek'), 'the room closed when the last player left');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'netrek e2e FAILED' : 'netrek e2e passed');
process.exit(failed ? 1 : 0);
