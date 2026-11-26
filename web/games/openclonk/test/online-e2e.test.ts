// Online play (milestone 4) end to end: the real server (server/target/freegames-server.jar with the openclonk module) and
// browsers in headless Chromium (test/browser/online-entry.ts), each a client of the round as the game page makes it: the
// original's control queue in network mode, the module as its host (src/net.ts). An Arena melee for two:
//   1. lockstep: both play with keys on both sides; their sync checks agree (the module ends no round), and the state
//      (frame, objects, players, crews' positions) is the same in both at the same frames; then the second browser's page
//      is reloaded, it rejoins the running round (the module's History), executes the ticks so far, catches up, is
//      activated again and plays on with keys, and the state is again the same in both;
//   2. desync: one browser draws a thousand synchronized random numbers the other does not; at the next sync check the module ends
//      the round with its desync, and the original's "Network: Synchronization loss!" is logged.
// Needs Chromium, the packed content and the server jar (mvn -B -f pom.xml -pl server -am -DskipTests package).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '../assets');
const jar = path.join(here, '../../../../server/target/freegames-server.jar');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java')
  : [path.join(os.homedir(), 'tools/jdk-21.0.12.1+1/bin/java')].find((p) => fs.existsSync(p)) ?? 'java';
const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd', 'Arena.ocf'];
const SCENARIO = process.env.OC_ONLINE_SCENARIO ?? 'Arena.ocf/FlintBrawl.ocs';
const skip = !chrome ? 'no Chromium (set CHROME)'
  : GROUPS.some((g) => !fs.existsSync(path.join(assets, g))) ? 'no packed content (re/openclonk/tools/pack.sh)'
    : !fs.existsSync(jar) ? 'no server jar (mvn -B -f pom.xml -pl server -am -DskipTests package)' : false;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const W = 480, H = 360;
const PROTOCOL_TIMEOUT = 300_000;

const freePort = () => new Promise<number>((resolve) => {
  const s = net.createServer().listen(0, '127.0.0.1', () => { const p = (s.address() as net.AddressInfo).port; s.close(() => resolve(p)); });
});

async function setup() {
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/online-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
  const web = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (u === '/') { res.setHeader('content-type', 'text/html'); res.end('<!doctype html><body style="margin:0"><script src="/b.js"></script>'); return; }
    if (u === '/b.js') { res.setHeader('content-type', 'text/javascript'); res.end(bundle.outputFiles[0].text); return; }
    const f = path.join(assets, path.normalize(u.replace(/^\/assets\//, '')));
    if (u.startsWith('/assets/') && f.startsWith(assets) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.end(fs.readFileSync(f)); return; }
    res.statusCode = 404;
    res.end();
  }).listen(0);
  const webPort = (web.address() as net.AddressInfo).port;
  const port = await freePort();
  const server: ChildProcess = spawn(java, ['-jar', jar], {
    env: { ...process.env, PORT: String(port), DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'oc-online-')), RECONNECT_S: '120' },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  for (let i = 0; ; i++) {
    try { if ((await fetch(`http://localhost:${port}/`)).status < 500) break; } catch { /* starting */ }
    if (i > 300) throw new Error('server did not start');
    await wait(100);
  }
  const puppeteer = (await import('puppeteer-core')).default;
  // a browser for each player: a page in the background gets no animation frames
  const browsers = new Map<string, Awaited<ReturnType<typeof puppeteer.launch>>>();
  const browserOf = async (name: string) => {
    let b = browsers.get(name);
    if (!b) {
      b = await puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: PROTOCOL_TIMEOUT,
        args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
      browsers.set(name, b);
    }
    return b;
  };
  const ws = `ws://localhost:${port}/ws`;
  const open = async (name: string, token: string, groups = GROUPS) => {
    const page = await (await browserOf(name)).newPage();
    page.on('pageerror', (e) => console.log(`${name} page error: ${(e as Error).message}`));
    await page.setViewport({ width: W, height: H });
    await page.goto(`http://localhost:${webPort}/`);
    await page.evaluate((o) => (globalThis as any).ocOnline.open(o), { server: ws, token, name, groups });
    return page;
  };
  const close = async () => {
    for (const b of browsers.values()) await b.close().catch(() => {});
    server.kill();
    web.close();
  };
  return { open, close };
}

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof setup>>['open']>>;
type Status = {
  error: string; frame: number; rejoined: boolean; started: number; activated: boolean; alterAt?: number; alteredAt?: number; snaps: Record<string, string>; log: string[];
  joined: boolean; catchingUp: boolean; players: string[]; historyTicks: number; historyTotal: number; joinFrame: number; joinPhase: string; joinRejected: string; scenarioLoaded: boolean;
  received: number; checks: number; desync: { frame: number; seat: number; other: number } | null; finished: boolean;
  outcome: { reason: string; frame: number } | null; stopped: string; packets: Record<string, number>; dropped: number; loss: boolean;
};
const status = (p: Page): Promise<Status> => p.evaluate(() => (globalThis as any).ocOnline.status());

/** waits until every page's status satisfies `ok`, failing on an engine error */
async function until(pages: Page[], ok: (s: Status[]) => boolean, ms: number, what: string): Promise<Status[]> {
  const end = Date.now() + ms;
  let s: Status[] = [];
  let told = Date.now();
  while (Date.now() < end) {
    s = await Promise.all(pages.map(status));
    const err = s.find((x) => x.error);
    if (err) assert.fail(`${what}: ${err.error}\n${err.log.slice(-20).join('\n')}`);
    if (ok(s)) return s;
    if (Date.now() - told > 30000) {
      told = Date.now();
      console.log(`${what}: ${s.map((x) => `frame ${x.frame} ticks ${x.received} checks ${x.checks}`).join(' | ')}`);
    }
    await wait(1000);
  }
  assert.fail(`${what}: not in ${ms / 1000} s: ${JSON.stringify(s.map((x) => ({ frame: x.frame, received: x.received, checks: x.checks, desync: x.desync, outcome: x.outcome, log: x.log.slice(-12), joined: x.joined, catchingUp: x.catchingUp, phase: x.joinPhase, refused: x.joinRejected, players: x.players, sent: (x as any).sent })), null, 1)}`);
}

/** keys for a browser: walk right, jump, walk left (the default control set, WASD) */
const walk = (from: number) => [
  { frame: from, code: 'KeyD', key: 'd', down: true }, { frame: from + 40, code: 'KeyD', key: 'd', down: false },
  { frame: from + 50, code: 'KeyW', key: 'w', down: true }, { frame: from + 54, code: 'KeyW', key: 'w', down: false },
  { frame: from + 70, code: 'KeyA', key: 'a', down: true }, { frame: from + 100, code: 'KeyA', key: 'a', down: false },
];

test('two browsers play an Arena melee in lockstep through the server; one reloads and rejoins', { skip, timeout: 3_600_000 }, async () => {
  const env = await setup();
  try {
    const a = await env.open('Alice', 'e2e-token-alice-0123456789');
    let b = await env.open('Bob', 'e2e-token-bob-0123456789abc');
    const snaps = [200, 400];
    await a.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: walk(150), snaps });
    await b.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: walk(250), snaps });
    const room = await a.evaluate((o) => (globalThis as any).ocOnline.host(o), { scenario: SCENARIO, controlRate: 3, seats: 2 });
    await b.evaluate((id) => (globalThis as any).ocOnline.join(id), room);
    await a.evaluate(() => (globalThis as any).ocOnline.start());
    let s = await until([a, b], (x) => x.every((y) => y.frame >= 420), 1_200_000, 'both browsers reach frame 420');
    console.log(JSON.stringify(s.map((x) => ({ frame: x.frame, received: x.received, checks: x.checks, packets: x.packets, dropped: x.dropped }))));
    assert.ok(s.every((x) => !x.desync && !x.finished), 'no desync, the round goes on');
    assert.ok(s.every((x) => x.checks >= 4), `sync checks sent (${s.map((x) => x.checks)})`);
    for (const f of [200, 400]) assert.equal(s[1].snaps[f], s[0].snaps[f], `the same state at frame ${f}`);
    const players = JSON.parse(s[0].snaps[400]).slice(2);
    assert.equal(players.length, 2, `both players joined: ${s[0].snaps[400]}`);
    assert.ok(Object.keys(s[0].packets).length === 2 && Object.values(s[0].packets).every((n) => n > 3), `control of both seats executed: ${JSON.stringify(s[0].packets)}`);
    assert.notEqual(s[0].snaps[200], s[0].snaps[400], 'the state changes');

    // the second browser's page is reloaded: it rejoins the running round and catches up with the ticks so far
    const packetsBefore = s[0].packets['1'] ?? 0;
    await b.close();
    b = await env.open('Bob', 'e2e-token-bob-0123456789abc');
    await b.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: [200, 400] });
    await b.evaluate(() => (globalThis as any).ocOnline.rejoin());
    s = await until([a, b], (x) => x[1].rejoined && x[1].activated && x[1].frame >= x[0].frame - 30, 1_200_000,
      'the rejoined browser executes the ticks so far, catches up and is activated again');
    console.log(JSON.stringify(s.map((x) => ({ frame: x.frame, received: x.received, checks: x.checks, packets: x.packets, activated: x.activated }))));
    assert.ok(s.every((x) => !x.desync && !x.finished), `no desync after the rejoin: ${JSON.stringify(s.map((x) => x.desync))}`);
    for (const f of [200, 400]) assert.equal(s[1].snaps[f], s[0].snaps[f], `the same state at frame ${f} (executed again by the rejoined browser)`);
    // both play on, the rejoined one with keys
    const at = Math.max(s[0].frame, s[1].frame);
    const later = [at + 300, at + 400];
    await a.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: [], snaps: later });
    await b.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: walk(at + 60), snaps: later });
    s = await until([a, b], (x) => x.every((y) => y.frame >= at + 420), 1_200_000, 'both play on');
    console.log(JSON.stringify(s.map((x) => ({ frame: x.frame, received: x.received, checks: x.checks, packets: x.packets, activated: x.activated }))));
    assert.ok(s.every((x) => !x.desync && !x.finished), `no desync: ${JSON.stringify(s.map((x) => x.desync))}`);
    for (const f of later) assert.equal(s[1].snaps[f], s[0].snaps[f], `the same state at frame ${f}`);
    assert.ok((s[0].packets['1'] ?? 0) > packetsBefore, `the rejoined player's control is executed (${packetsBefore} -> ${s[0].packets['1']})`);
  } finally {
    await env.close();
  }
});

test('a third browser joins a running round, catches up, plays and rejoins; a corrupt check is refused', { skip, timeout: 3_600_000 }, async () => {
  const env = await setup();
  try {
    const a = await env.open('Alice', 'e2e-token-alice-0123456789');
    const b = await env.open('Bob', 'e2e-token-bob-0123456789abc');
    const snaps = [300, 400];
    await a.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: walk(150), snaps, snapEvery: 10 });
    await b.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: walk(250), snaps, snapEvery: 10 });
    const room = await a.evaluate((o) => (globalThis as any).ocOnline.host(o), { scenario: SCENARIO, controlRate: 3, seats: 4 });
    await b.evaluate((id) => (globalThis as any).ocOnline.join(id), room);
    await a.evaluate(() => (globalThis as any).ocOnline.start());
    let s = await until([a, b], (x) => x.every((y) => y.frame >= 520), 1_200_000, 'the two starting browsers run past frame 520');
    assert.ok(s.every((x) => !x.desync && !x.finished), 'the round goes on');
    let at = Math.max(s[0].frame, s[1].frame);

    // carl was not in the room at the start: the lobby joins the running round, the module sends the history from
    // tick 0 and the frame check; the page loads the scenario and catches up before it sends a command
    const c = await env.open('Carl', 'e2e-token-carl-0123456789xyz', GROUPS.filter((g) => g !== 'Arena.ocf'));
    await c.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps, snapEvery: 10, missingScenario: true });
    await c.evaluate((id) => (globalThis as any).ocOnline.join(id, false), room);
    s = await until([a, b, c], (x) => x[2].joined && !x[2].catchingUp
      && x[2].frame >= Math.max(x[0].frame, x[1].frame) - 30 && x[2].players.length === 3, 1_200_000,
      'the newcomer replays the history, proves its state, is seated and catches up with its player');
    assert.ok(s[2].joinRejected === '', `the newcomer was seated, not refused: ${s[2].joinRejected}`);
    assert.ok(s[2].historyTicks >= s[2].historyTotal, `the newcomer got all history (${s[2].historyTicks}/${s[2].historyTotal})`);
    assert.ok(s[2].joinFrame >= 0, `the module named a check frame (${s[2].joinFrame})`);
    assert.ok(s[2].scenarioLoaded, 'the newcomer fetched the scenario its first content set lacked');
    assert.ok(s.every((x) => !x.desync && !x.finished), 'no desync after the late join');
    for (const f of snaps) assert.equal(s[2].snaps[f], s[0].snaps[f], `the newcomer's state at frame ${f} is the others'`);
    at = Math.max(s[0].frame, s[1].frame, s[2].frame);

    // the newcomer plays: its command is executed by the others and the state stays the same
    const later = [at + 300, at + 400];
    await a.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: [], snaps: later });
    await b.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: [], snaps: later });
    await c.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: walk(at + 60), snaps: later });
    s = await until([a, b, c], (x) => x.every((y) => y.frame >= at + 420), 1_200_000, 'the newcomer plays in lockstep');
    assert.ok(s.every((x) => !x.desync && !x.finished), `no desync while the newcomer plays: ${JSON.stringify(s.map((x) => x.desync))}`);
    const common = Object.keys(s[0].snaps).map(Number)
      .filter((f) => f >= later[0] && s.every((x) => x.snaps[f]) && JSON.parse(s[0].snaps[f]).slice(2).length === 3)
      .sort((x, y) => x - y)[0];
    assert.ok(common, `a frame both ran with all three players (${Object.keys(s[0].snaps).length} snapshots)`);
    assert.equal(s[2].snaps[common!], s[0].snaps[common!], `the newcomer's state at frame ${common} after playing`);
    assert.ok((s[0].packets['2'] ?? 0) > 0, `the newcomer's command reached the others (${JSON.stringify(s[0].packets)})`);
    const players = JSON.parse(s[0].snaps[common!]).slice(2);
    assert.equal(players.length, 3, `all three players are in the round (${players.length})`);

    // it survives a reload: the same seat comes back through the history and continues with the others
    const beforeReload = Math.max(s[0].frame, s[1].frame, s[2].frame);
    const after = [beforeReload + 300, beforeReload + 400];
    await c.close();
    const c2 = await env.open('Carl', 'e2e-token-carl-0123456789xyz');
    await c2.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: after, snapEvery: 10 });
    await c2.evaluate(() => (globalThis as any).ocOnline.rejoin());
    await a.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: [], snaps: after });
    await b.evaluate((o) => (globalThis as any).ocOnline.more(o), { keys: [], snaps: after });
    s = await until([a, b, c2], (x) => x[2].rejoined && x[2].activated && x[2].frame >= Math.max(x[0].frame, x[1].frame) - 30, 1_200_000,
      'the reloaded newcomer catches up again');
    assert.ok(s.every((x) => !x.desync && !x.finished), 'no desync after the newcomer reload');
    s = await until([a, b, c2], (x) => x.every((y) => y.frame >= after[1]), 1_200_000, 'the reloaded newcomer plays on');
    const commonAfter = Object.keys(s[0].snaps).map(Number)
      .filter((f) => f >= after[0] && s.every((x) => x.snaps[f]) && JSON.parse(s[0].snaps[f]).slice(2).length === 3)
      .sort((x, y) => x - y)[0];
    assert.ok(commonAfter, 'a frame both ran after the reload');
    assert.equal(s[2].snaps[commonAfter!], s[0].snaps[commonAfter!], `the reloaded newcomer's state at frame ${commonAfter}`);

    // a corrupt state proof is refused; the seat is not activated and no command is executed for it
    const d = await env.open('Dora', 'e2e-token-dora-0123456789abc');
    await d.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: [], badJoinCheck: true });
    await d.evaluate((id) => (globalThis as any).ocOnline.join(id, false), room);
    s = await until([d], (x) => x[0].joinRejected !== '', 600_000, 'the corrupt newcomer is refused');
    assert.match(s[0].joinRejected, /differs/);
    assert.ok(!s[0].joined, 'the corrupt newcomer never got a seat');
  } finally {
    await env.close();
  }
});

test('a full room refuses a newcomer before the module', { skip, timeout: 1_200_000 }, async () => {
  const env = await setup();
  try {
    const a = await env.open('Alice', 'e2e-token-alice-0123456789');
    const b = await env.open('Bob', 'e2e-token-bob-0123456789abc');
    await a.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: [] });
    await b.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: [] });
    const room = await a.evaluate((o) => (globalThis as any).ocOnline.host(o), { scenario: SCENARIO, controlRate: 3, seats: 2 });
    await b.evaluate((id) => (globalThis as any).ocOnline.join(id), room);
    await a.evaluate(() => (globalThis as any).ocOnline.start());
    const c = await env.open('Carl', 'e2e-token-carl-0123456789xyz');
    await c.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: [] });
    const error = await c.evaluate((id) => (globalThis as any).ocOnline.joinError(id), room);
    assert.match(String(error), /full/i);
  } finally {
    await env.close();
  }
});

test('a browser whose state differs: the module ends the round with its desync', { skip, timeout: 1_800_000 }, async () => {
  const env = await setup();
  try {
    const a = await env.open('Alice', 'e2e-token-alice-0123456789');
    const b = await env.open('Bob', 'e2e-token-bob-0123456789abc');
    await a.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: walk(120), snaps: [100] });
    await b.evaluate((r) => (globalThis as any).ocOnline.prepare(r), { width: W, height: H, keys: [], snaps: [100], alterAt: 150 });
    const room = await a.evaluate((o) => (globalThis as any).ocOnline.host(o), { scenario: SCENARIO, controlRate: 3, seats: 2 });
    await b.evaluate((id) => (globalThis as any).ocOnline.join(id), room);
    await a.evaluate(() => (globalThis as any).ocOnline.start());
    const s = await until([a, b], (x) => x.every((y) => y.finished), 1_200_000, 'the round ends');
    console.log(JSON.stringify(s.map((x) => ({ frame: x.frame, desync: x.desync, outcome: x.outcome, loss: x.loss }))));
    assert.equal(s[0].snaps[100], s[1].snaps[100], 'the same state before the change');
    // the change is drawn at frame 150 (or the first frame the page's hook sees after it, if it started late); the
    // module compares the sync checks of the frames divisible by 100, so the first check that includes it is the next one
    const altered = s[1].alteredAt;
    assert.ok(typeof altered === 'number' && altered >= 150, `the state changed at frame ${altered}`);
    const at = Math.ceil(altered! / 100) * 100;
    for (const x of s) {
      assert.deepEqual(x.outcome, { reason: 'desync', frame: at }, `the module ended the round at the sync check after the change (frame ${at})`);
      assert.equal(x.desync?.frame, at);
    }
    assert.ok(s.some((x) => x.loss), 'the original logs "Network: Synchronization loss!"');
  } finally {
    await env.close();
  }
});
