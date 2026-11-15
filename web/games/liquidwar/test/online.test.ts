// Online play against the real server (needs the server jar, skipped without it): two or three computers, each a
// worker thread running the port headless (online-worker.ts), pick "Net game" in the main menu, meet in a room
// and play the original's network game through the module (LiquidwarModule.java). Checked: every computer
// plays the same battle round by round (all fighters, the mesh, and every team's cursor and keys: the keys of
// the other computers' teams, human and computer players, arrive at the same exchange everywhere); the teams
// are numbered as the original's server numbers them; no checksum error; and a computer whose game is changed
// is caught by the original's checksum check.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { startServer, JAR, type RunningServer } from '../../../test/server.ts';

const WORKER = new URL('./online-worker.ts', import.meta.url);
let server: RunningServer | null = null;

before(async () => { server = await startServer(); });
after(async () => { await server?.stop(); });

function it(name: string, fn: () => Promise<void>): void {
  test(name, { timeout: 600000 }, async (t) => {
    if (!server) { t.skip(`no server jar at ${JAR}`); return; }
    await fn();
  });
}

interface Result { trace: string[]; rounds: string[]; info: string; log: string[] }

/** a settings file: the given teams (slot: control type 1 human, 2 computer), a 15 s battle */
function cfg(teams: Record<number, number>, bots: boolean): string {
  const lines = ['[MAIN]', 'DUMMY = 5003000', 'GAME_TIME = 0', `ALLOW_NETWORK_BOTS = ${bots ? 1 : 0}`, '[CONTROL_TYPE]'];
  for (let i = 0; i < 6; i++) lines.push(`${i} = ${teams[i] ?? 0}`);
  return lines.map((l) => `cfg ${l}`).join('\n');
}

/** Net game from the main menu (Tab to it, Enter), the keys of the battle, the scores left with Enter */
function session(teams: Record<number, number>, bots: boolean, keys: string): string {
  return `${cfg(teams, bots)}\ntap 1500 TAB\ntap 1800 ENTER\n${keys}\ntap 26000 ENTER\nend 28000\n`;
}

async function play(players: { name: string; session: string; tamperAt?: number }[]): Promise<Result[]> {
  const workers = players.map((p, i) => new Worker(WORKER, {
    workerData: { url: server!.url, name: p.name, host: i === 0, seats: players.length, session: p.session, tamperAt: p.tamperAt ?? -1 },
  }));
  const results = workers.map((w) => new Promise<Result>((resolve, reject) => {
    w.on('message', (m: { type: string; id?: number } & Result) => {
      if (m.type === 'room') for (const g of workers.slice(1)) g.postMessage({ id: m.id });
      else if (m.type === 'done') resolve(m);
    });
    w.on('error', reject);
    w.on('exit', (code) => reject(new Error(`worker exited with ${code}`)));
  }));
  try {
    return await Promise.all(results);
  } finally {
    await Promise.all(workers.map((w) => w.terminate()));
  }
}

/** the rounds of the battle: clock → fighters and mesh (from the trace's R lines) and the cursors by team */
function battle(r: Result): Map<number, string> {
  const m = new Map<number, string>();
  const rs = r.trace.filter((l) => l.startsWith('R '));
  assert.equal(rs.length, r.rounds.length);
  rs.forEach((l, i) => {
    const [, clock, army, mesh] = l.split(' ');
    m.set(Number(clock), `${army} ${mesh} | ${r.rounds[i]!.split(' ').slice(1).join(' ')}`);
  });
  return m;
}

function common(a: Map<number, string>, b: Map<number, string>): number[] {
  return [...a.keys()].filter((k) => b.has(k)).sort((x, y) => x - y);
}

it('three computers play the same battle, round by round, with the teams numbered as the original server does', async () => {
  const res = await play([
    { name: 'anna', session: session({ 0: 1 }, false, 'press 3500 RIGHT\npress 4200 DOWN\nrelease 6000 RIGHT\npress 6100 LEFT\nrelease 8000 DOWN\nrelease 9000 LEFT') },
    { name: 'bert', session: session({ 0: 1, 1: 2 }, true, 'press 3600 UP\npress 4000 LEFT\nrelease 7000 UP\nrelease 7500 LEFT\npress 8000 DOWN\nrelease 12000 DOWN') },
    { name: 'cara', session: session({ 3: 2 }, true, '') },
  ]);
  for (const r of res) {
    const g = r.trace.find((l) => l.startsWith('G '));
    assert.ok(g, 'a battle started');
    assert.equal(g!.split(' ')[6], '4', 'four teams: anna 1, bert 2 (one a computer player), cara 1');
    assert.match(r.info, /bad=0/, `no checksum error: ${r.info}`);
    assert.doesNotMatch(r.info, /error=/, r.info);
  }
  const [a, b, c] = res.map(battle) as [Map<number, string>, Map<number, string>, Map<number, string>];
  const ab = common(a, b), ac = common(a, c);
  assert.ok(ab.length > 500 && ac.length > 500, `rounds in common: ${ab.length}, ${ac.length}`);
  for (const k of ab) assert.equal(b.get(k), a.get(k), `anna and bert differ at round ${k}`);
  for (const k of ac) assert.equal(c.get(k), a.get(k), `anna and cara differ at round ${k}`);
  // the cursors of every team moved: humans with their keys, the computer players by themselves
  const first = a.get(ab[0]!)!.split(' | ')[1]!.split(' '), last = a.get(ab[ab.length - 1]!)!.split(' | ')[1]!.split(' ');
  assert.equal(first.length, 4);
  for (let t = 0; t < 4; t++) {
    const pos = (s: string): string => s.split(',').slice(0, 2).join(',');
    assert.notEqual(pos(last[t]!), pos(first[t]!), `team ${t}'s cursor moved`);
  }
  // anna's keys reach bert's game: her team (0) pressed RIGHT (2) and DOWN (4) at some round there
  assert.ok([...b.values()].some((v) => v.split(' | ')[1]!.split(' ')[0]!.split(',')[2] === '6'), 'anna\'s keys in bert\'s game');
});

it('a computer whose game differs is told by the checksum check, as the original server tells it', async () => {
  const res = await play([
    { name: 'dora', session: session({ 0: 1 }, false, 'press 3500 RIGHT\nrelease 6000 RIGHT') },
    { name: 'emil', session: session({ 0: 1 }, false, 'press 3500 LEFT\nrelease 6000 LEFT'), tamperAt: 150 },
  ]);
  for (const r of res) {
    assert.doesNotMatch(r.info, /bad=0/, `the checksum check caught it: ${r.info}`);
    assert.ok(r.log.includes('Error: incorrect checksum, the game is broken, or someone is cheating'));
  }
  const [a, b] = res.map(battle) as [Map<number, string>, Map<number, string>];
  assert.equal(b.get(149), a.get(149), 'equal up to the change');
  assert.notEqual(b.get(150), a.get(150));
});
