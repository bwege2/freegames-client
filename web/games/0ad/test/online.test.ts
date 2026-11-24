// 0 A.D. online 1v1 against the real server (WebSocket clients; needs the server jar, skipped without
// it): two clients build the same World from RoomStarted.seed and the room options, exchange turn
// packets through the module, stay equal turn by turn (the state hashes), a reloaded page catches up
// from Sync and continues equal, and both seats' reports of the forced end agree so the module ends the
// round with a winner.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { GameClient } from '../../../src/sdk/net/client.ts';
import { Rooms, type RoundStart } from '../../../src/sdk/rooms.ts';
import { packGame } from '../../../src/sdk/net/codec.ts';
import { startServer, JAR, type RunningServer } from '../../../test/server.ts';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parseScenario } from '../src/data/map.ts';
import { parsePmp } from '../src/data/pmp.ts';
import { World } from '../src/sim/world.ts';
import { OnlineMatch, type OnlineResults, type OnlineWorldOptions } from '../src/net/online.ts';
import { Options } from '../src/proto/0ad.ts';

const ROOT = join(import.meta.dirname, '..', 'assets');
const files = new Map<string, string>();
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
for (const path of walk(join(ROOT, 'templates'))) {
  if (path.endsWith('.xml')) files.set(relative(join(ROOT, 'templates'), path).replace(/\.xml$/, ''), readFileSync(path, 'utf8'));
}
const db = new TemplateDatabase(files);
const scenario = parseScenario(readFileSync(join(ROOT, 'maps/farmland_2p.xml'), 'utf8'));
const terrain = parsePmp(readFileSync(join(ROOT, 'maps/farmland_2p.pmp')).buffer.slice(0));
const worldOptions = {
  scenario, terrain,
  templates: { info: (n: string) => db.info(n), has: (n: string) => db.has(n) },
};

function makeWorld(o: OnlineWorldOptions): World {
  return new World({
    ...worldOptions,
    seed: o.seed,
    startingResources: o.resources,
    players: [
      { name: o.names[0], civ: o.civs[0], color: [21 / 255, 55 / 255, 149 / 255] },
      { name: o.names[1], civ: o.civs[1], color: [150 / 255, 20 / 255, 20 / 255] },
    ],
  });
}

let server: RunningServer | null = null;
const clients: GameClient[] = [];

before(async () => { server = await startServer(); });
after(async () => {
  for (const c of clients) c.close();
  await server?.stop();
});

function it(name: string, fn: () => Promise<void>): void {
  test(name, async (t) => {
    if (!server) { t.skip(`no server jar at ${JAR}`); return; }
    await fn();
  });
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

interface Side {
  name: string;
  token: string;
  net: GameClient;
  rooms: Rooms;
  match: OnlineMatch | null;
  round: RoundStart | null;
  results: OnlineResults | null;
  status: string[];
}

function side(name: string, token = `0ad-online-${name}-0123456789abcdef`): Side {
  const net = new GameClient('0ad', { url: server!.url, transport: 'ws', token });
  clients.push(net);
  return { name, token, net, rooms: new Rooms(net), match: null, round: null, results: null, status: [] };
}

const started = (s: Side): Promise<RoundStart> => new Promise((resolve) => {
  const off = s.rooms.on('started', (r) => { off(); resolve(r); });
});

function begin(s: Side, round: RoundStart): OnlineMatch {
  const match = new OnlineMatch(s.rooms, round, {
    makeWorld,
    onWorld: (world) => { s.match!.world = world; },
    onResults: (r) => { s.results = r; },
    onChat: () => {},
    onStatus: (text) => { s.status.push(text); },
    onClosed: (reason) => { s.status.push(`closed: ${reason}`); },
  });
  s.round = round;
  s.match = match;
  return match;
}

/** a room of two sides with the round started */
async function room(a: Side, b: Side): Promise<void> {
  const options = packGame(Options, (o) => {
    o.map = 'farmland_2p';
    o.startingResources = 300;
    o.civ0 = 'athen';
    o.civ1 = 'athen';
    o.commandDelay = 3;
  });
  const r = await a.rooms.create({ name: 'farmland test', maxSeats: 2, options });
  const bStarted = started(b);
  await b.rooms.join(r.id);
  b.rooms.ready(true);
  for (let i = 0; i < 100 && !b.rooms.room?.seats.find((s) => s.seat === 1)?.ready; i++) await sleep(20);
  const aRound = await a.rooms.start();
  begin(a, aRound);
  begin(b, await bStarted);
}

/** lets both clients run until `done`, giving each frame 100 ms of turn time every 20 ms */
async function play(a: Side, b: Side | null, ms: number, done: () => boolean = () => false): Promise<void> {
  const end = performance.now() + ms;
  while (performance.now() < end && !done()) {
    a.match!.pump(100);
    b?.match?.pump(100);
    await sleep(20);
  }
}

/** the two clients' state hashes at the latest turn both have reached */
function sameGame(a: Side, b: Side, least: number): number {
  const common = Math.min(a.match!.turn, b.match!.turn);
  assert.ok(common >= least, `turns played: ${a.match!.turn} and ${b.match!.turn} (want ${least})`);
  const ha = a.match!.hash(common), hb = b.match!.hash(common);
  assert.ok(ha !== undefined && hb !== undefined, `hashes at turn ${common}`);
  assert.equal(hb, ha, `the worlds differ at turn ${common}`);
  return common;
}

it('two clients play the same turns and agree on the end', async () => {
  const a = side('anna'), b = side('bert');
  await room(a, b);
  assert.equal(a.round!.you, 0);
  assert.equal(b.round!.you, 1);
  assert.equal(b.round!.seed, a.round!.seed, 'one seed for both');
  assert.equal(a.match!.me, 1);
  assert.equal(b.match!.me, 2);

  // each seat commands its own units: a move and a gather, scheduled three turns ahead
  a.match!.issue({ type: 'move', units: a.match!.world.entitiesOf(1).filter((e) => e.kind === 'unit').map((e) => e.id), x: 400, z: 400 });
  b.match!.issue({ type: 'move', units: b.match!.world.entitiesOf(2).filter((e) => e.kind === 'unit').map((e) => e.id), x: 600, z: 400 });
  await play(a, b, 4000, () => a.match!.turn >= 25 && b.match!.turn >= 25);
  const turn = sameGame(a, b, 20);
  assert.ok(a.match!.world.entitiesOf(1).some((e) => e.order?.type === 'move' || e.path.length > 0), 'seat 0 executes its command');
  assert.ok(b.match!.world.entitiesOf(2).some((e) => e.order?.type === 'move' || e.path.length > 0), 'seat 1 executes its command');

  // the victory path, forced on both identical worlds so the test does not walk 700 m: at the same
  // turn on both clients kill the red Civic Centre; the next turn each simulation sees the same
  // winner and reports it to the module
  const join = Date.now() + 4000;
  while (a.match!.turn !== b.match!.turn && Date.now() < join) {
    a.match!.pump(10);
    b.match!.pump(10);
    await sleep(5);
  }
  assert.equal(a.match!.turn, b.match!.turn, 'both at the same turn before the forced end');
  for (const m of [a.match!, b.match!]) {
    const red = m.world.entitiesOf(2).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
    red.alive = false;
    red.hp = 0;
  }
  const end = Date.now() + 8000;
  while (Date.now() < end && !(a.results && b.results)) {
    a.match!.pump(100);
    b.match!.pump(100);
    await sleep(10);
  }
  assert.ok(a.results && b.results, `results reached both: ${JSON.stringify([a.results, b.results])}`);
  for (const r of [a.results!, b.results!]) {
    assert.equal(r.winner, 0, 'the winning seat (Anna)');
    assert.equal(r.reason, 'agreed');
    assert.ok(r.turns >= turn);
  }
  a.rooms.leave();
  b.rooms.leave();
});

it('a reloaded client catches up from Sync and stays equal', async () => {
  const a = side('caesar'), b = side('brutus');
  await room(a, b);
  await play(a, b, 5000, () => a.match!.turn >= 30 && b.match!.turn >= 30);
  const caughtUpTo = sameGame(a, b, 25);
  const turnA = a.match!.turn;

  // the reloaded page: a new connection with the same account, the running room joined again
  b.net.close();
  const b2 = side('brutus', b.token);
  const all = await b2.rooms.list();
  const open = all.find((r) => r.id === a.rooms.room!.id);
  assert.ok(open && b2.rooms.isMine(open), 'the running room still holds the seat');
  const rejoined = new Promise<RoundStart>((resolve) => {
    const off = b2.rooms.on('started', (r) => { off(); resolve(r); });
  });
  await b2.rooms.join(open.id);
  const round = await rejoined;
  assert.equal(round.rejoined, true, 'the round comes back');
  const match = begin(b2, round);
  assert.equal(match.synced, false, 'waiting for Sync');
  // the first client stands still while the other catches up: the sync is a snapshot of the relayed
  // turns, and its world at that turn is exactly the world the first client has at that turn
  await play(b2, null, 8000, () => match.synced);
  assert.equal(match.synced, true);
  const replayed = match.turn;
  assert.ok(replayed >= caughtUpTo, `replayed to turn ${replayed} (the first client was at ${turnA})`);
  await play(a, null, 4000, () => a.match!.turn >= replayed);
  assert.ok(a.match!.turn >= replayed, `the first client reached turn ${replayed}`);
  assert.equal(match.hash(replayed), a.match!.hash(replayed),
    `the replayed world at turn ${replayed} is the world the other client has`);
  const after = replayed;
  assert.equal(match.hash(after), a.match!.hash(after), `continues equal at turn ${after}`);
  assert.ok(b2.status.some((s) => s.startsWith('Caught up')), b2.status.join('; '));

  // a new command from the first seat reaches the replayed client too
  a.match!.issue({ type: 'stop', units: a.match!.world.entitiesOf(1).filter((e) => e.kind === 'unit').map((e) => e.id) });
  await play(a, b2, 3000, () => a.match!.turn >= after + 8 && match.turn >= after + 8);
  const later = Math.min(a.match!.turn, match.turn);
  assert.ok(later >= after + 4, `both played on: ${later}`);
  assert.equal(match.hash(later), a.match!.hash(later), 'still the same world');
  a.rooms.leave();
  b2.rooms.leave();
});
