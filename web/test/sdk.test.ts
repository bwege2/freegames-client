// The SDK against the real server (WebSocket from node): connect, rooms + relay + the example module,
// storage, score tables, errors. Needs the server jar (mvn -B -f ../pom.xml package); skipped without it.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { GameClient, ServerError } from '../src/sdk/net/client.ts';
import { Rooms, SERVER_SEAT, type GameMessage, type RoomState, type RoundStart, type SeatInfo } from '../src/sdk/rooms.ts';
import { joinableRooms } from '../src/sdk/lobby.ts';
import { Storage } from '../src/sdk/storage.ts';
import { Scores } from '../src/sdk/scores.ts';
import { packGame, unpackGame } from '../src/sdk/net/codec.ts';
import { Msg, Options, Results } from '../games/example/src/proto/example.ts';
import { startServer, JAR, type RunningServer } from './server.ts';

let server: RunningServer | null = null;
const clients: GameClient[] = [];

before(async () => { server = await startServer(); });
after(async () => {
  for (const c of clients) c.close();
  await server?.stop();
});

function client(name: string, game = 'example'): GameClient {
  const c = new GameClient(game, { url: server!.url, transport: 'ws', token: `sdk-test-token-${name}-0123456789` });
  clients.push(c);
  return c;
}

/** Resolves with the first event `k` that `pred` accepts. */
function next<T>(on: (h: (v: T) => void) => () => void, pred: (v: T) => boolean = () => true, ms = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { off(); reject(new Error('timeout')); }, ms);
    const off = on((v) => {
      if (!pred(v)) return;
      clearTimeout(timer);
      off();
      resolve(v);
    });
  });
}

/** a test that needs the running server (skipped when the jar is not built) */
function it(name: string, fn: () => Promise<void>): void {
  test(name, async (t) => {
    if (!server) { t.skip(`no server jar at ${JAR}`); return; }
    await fn();
  });
}

it('connects and is welcomed', async () => {
  const c = client('anna');
  await c.connect();
  assert.equal(c.status, 'online');
  assert.ok(c.accountId > 0);
  assert.equal(c.transport, 'ws');
});

it('an unknown game fails to connect with a ServerError', async () => {
  const c = client('anna', 'nosuchgame');
  await assert.rejects(c.connect(), (e: unknown) => e instanceof ServerError && e.codeName === 'unknownGame');
  assert.equal(c.status, 'offline');
});

it('storage: put, get, list, delete', async () => {
  const s = new Storage(client('bert'));
  assert.equal(await s.get('save'), null);
  const info = await s.put('save', new Uint8Array([1, 2, 3]));
  assert.equal(info.size, 3);
  assert.deepEqual(await s.get('save'), new Uint8Array([1, 2, 3]));
  await s.put('save-2', new Uint8Array([4]));
  assert.deepEqual((await s.list('save')).map((f) => f.name), ['save', 'save-2']);
  assert.equal(await s.delete('save-2'), true);
  assert.equal(await s.delete('save-2'), false);
  await assert.rejects(s.put('../evil', new Uint8Array([1])), (e: unknown) => e instanceof ServerError && e.codeName === 'invalid');
});

it('a race in a room: lobby flow, server rolls, the module ends the round, checked score', async () => {
  const a = client('carl'), b = client('dora');
  const ra = new Rooms(a), rb = new Rooms(b);
  const room = await ra.create({ name: 'race', maxSeats: 2, options: packGame(Options, (o) => { o.target = 8; }) });
  assert.equal(room.you, 0);
  assert.equal(room.host, 0);
  assert.ok((await rb.list()).some((r) => r.id === room.id));
  const joined = await rb.join(room.id);
  assert.equal(joined.you, 1);

  await assert.rejects(ra.start(), (e: unknown) => e instanceof ServerError && e.codeName === 'invalid', 'dora is not ready');
  const readySeen = next<{ seats: { ready: boolean }[] }>((h) => ra.on('update', h), (r) => r.seats.length === 2 && r.seats[1].ready);
  rb.ready(true);
  await readySeen;
  const bStarted = next<RoundStart>((h) => rb.on('started', h));
  const round = await ra.start();
  assert.equal((await bStarted).seed, round.seed, 'one seed for everyone');

  // chat to the others arrives; a client cannot fake a roll
  const chat = next<GameMessage>((h) => rb.on('message', h));
  ra.send(packGame(Msg, (m) => { m.chat = 'good luck'; }), 'others');
  assert.equal(unpackGame(Msg, (await chat).data).chat, 'good luck');

  const finished = next<{ results: Uint8Array }>((h) => rb.on('finished', h), () => true, 10000);
  let rolls = 0;
  const seen = (h: (v: GameMessage) => void) => rb.on('message', h);
  for (;;) {
    const got = next<GameMessage>(seen, (m) => m.from === SERVER_SEAT);
    ra.send(packGame(Msg, (m) => { m.roll = true; }), 'server');
    const r = unpackGame(Msg, (await got).data).rolled;
    rolls++;
    assert.equal(r.rolls, rolls);
    assert.ok(r.value >= 1 && r.value <= 6);
    if (r.total >= 8) break;
  }
  const res = unpackGame(Results, (await finished).results);
  assert.equal(res.winner, 0);
  assert.equal(res.rolls, rolls);

  const scores = new Scores(a);
  await assert.rejects(scores.submit('fewest-rolls', rolls + 1, 'CARL'), (e: unknown) => e instanceof ServerError && e.codeName === 'invalid');
  const t = await scores.submit('fewest-rolls', rolls, 'CARL');
  assert.equal(t.rank, 1);
  assert.equal((await new Scores(b).get('fewest-rolls'))[0].name, 'CARL');
});

it('a drop-in round seats players while it runs and hears them leave', async () => {
  const a = client('gina', 'dropin'), b = client('hans', 'dropin'), c = client('ida', 'dropin');
  const ra = new Rooms(a), rb = new Rooms(b), rc = new Rooms(c);
  const room = await ra.create({ name: 'live', maxSeats: 4 });
  const bStarted = next<RoundStart>((h) => rb.on('started', h));
  const joined = next<SeatInfo>((h) => ra.on('joined', h));
  const round = await ra.start();
  await rb.join(room.id);
  const sb = await bStarted;
  assert.equal(sb.seed, round.seed, 'the newcomer joins the running round');
  assert.equal(sb.you, 1);
  assert.equal((await joined).seat, 1, 'the players in the round hear the arrival');

  const listed = (await rc.list()).find((r) => r.id === room.id);
  assert.ok(listed?.started, 'the running room is listed');
  assert.equal(listed?.seats.length, 2, 'with its player count');

  const left = next<SeatInfo>((h) => ra.on('left', h));
  rb.leave();
  assert.equal((await left).seat, 1, 'and the departure');
});

test('the lobby offers running rooms only for drop-in games', () => {
  const room = (started: boolean, seats: number, maxSeats: number): RoomState => ({
    id: 1, name: 'r', host: 0, maxSeats, locked: false, started, round: 1, options: new Uint8Array(), you: -1,
    seats: Array.from({ length: seats }, (_, i) => ({ seat: i, accountId: i + 1, name: `p${i}`, ready: false, connected: true })),
  });
  assert.equal(joinableRooms([room(false, 1, 2)], false).length, 1, 'an open room');
  assert.equal(joinableRooms([room(true, 1, 2)], false).length, 0, 'not a running one');
  assert.equal(joinableRooms([room(true, 1, 2)], true).length, 1, 'a running drop-in room');
  assert.equal(joinableRooms([room(true, 2, 2)], true).length, 0, 'a full one');
  // your own running room (a reloaded page): offered first, running or full, drop-in or not
  const yours = { ...room(true, 2, 2), id: 7 };
  const open = room(false, 1, 2);
  assert.deepEqual(joinableRooms([open, yours], false, (r) => r.id === 7).map((r) => r.id), [7, 1], 'yours first');
});

it('a reloaded page finds its running round in the room list and rejoins it', async () => {
  const a = client('ivan'), b = client('jana');
  const ra = new Rooms(a), rb = new Rooms(b);
  const room = await ra.create({ name: 'reload', maxSeats: 2 });
  await rb.join(room.id);
  const ready = next<{ seats: { ready: boolean }[] }>((h) => ra.on('update', h), (r) => r.seats.length === 2 && r.seats[1].ready);
  rb.ready(true);
  await ready;
  const bStarted = next<RoundStart>((h) => rb.on('started', h));
  const round = await ra.start();
  await bStarted;
  // the page goes away (its connection with it) and loads again: a new client of the same account
  b.close();
  const b2 = client('jana'), rb2 = new Rooms(b2);
  const list = await rb2.list();
  const mine = list.filter((r) => rb2.isMine(r));
  assert.deepEqual(mine.map((r) => r.id), [room.id], 'the running room is offered as yours');
  assert.equal(rb2.isMine(list.find((r) => r.id === room.id)!), true);
  const again = next<RoundStart>((h) => rb2.on('started', h));
  await rb2.join(room.id);
  const r = await again;
  assert.equal(r.rejoined, true, 'the game knows it comes back');
  assert.equal(r.seed, round.seed);
  assert.equal(r.you, 1);
  const got = next<GameMessage>((h) => rb2.on('message', h));
  ra.send(packGame(Msg, (m) => { m.chat = 'welcome back'; }), 'others');
  assert.equal(unpackGame(Msg, (await got).data).chat, 'welcome back', 'and gets the game\'s messages again');
  const anna = new Rooms(client('kurt'));
  assert.equal((await anna.list()).filter((x) => anna.isMine(x)).length, 0, 'not for another account');
});

it('messages of the round that come before the game listens reach its first handler, in order', async () => {
  const a = client('mona'), b = client('nils');
  const ra = new Rooms(a), rb = new Rooms(b);
  const room = await ra.create({ name: 'early', maxSeats: 2 });
  await rb.join(room.id);
  const ready = next<{ seats: { ready: boolean }[] }>((h) => ra.on('update', h), (r) => r.seats.length === 2 && r.seats[1].ready);
  rb.ready(true);
  await ready;
  const bStarted = next<RoundStart>((h) => rb.on('started', h));
  await ra.start();
  await bStarted;
  // b's game is still busy (no message handler yet) while a sends two messages
  ra.send(packGame(Msg, (m) => { m.chat = 'one'; }), 'others');
  ra.send(packGame(Msg, (m) => { m.chat = 'two'; }), 'others');
  await new Promise((r) => setTimeout(r, 400));
  const got: string[] = [];
  const both = new Promise<void>((resolve) => rb.on('message', (m) => { got.push(unpackGame(Msg, m.data).chat); if (got.length === 2) resolve(); }));
  assert.deepEqual(got, [], 'not inside on() itself');
  await both;
  assert.deepEqual(got, ['one', 'two']);
  const third = next<GameMessage>((h) => rb.on('message', h));
  ra.send(packGame(Msg, (m) => { m.chat = 'three'; }), 'others');
  assert.equal(unpackGame(Msg, (await third).data).chat, 'three', 'later messages go to the handlers as before');
});

it('a second tab of the same account takes over; the first stops instead of pushing it out again', async () => {
  const first = client('lena');
  await first.connect();
  const replaced = next<string>((h) => first.on('status', h), (st) => st === 'replaced');
  const second = client('lena');
  await second.connect();
  assert.equal(await replaced, 'replaced');
  await new Promise((r) => setTimeout(r, 1500)); // longer than the first reconnect would wait
  assert.equal(first.status, 'replaced', 'the first tab stays out');
  assert.equal(second.status, 'online', 'the second keeps its connection');
});

it('a dropped connection comes back into its seat', async () => {
  const a = client('emil'), b = client('fred');
  const ra = new Rooms(a), rb = new Rooms(b);
  const room = await ra.create({ name: 'drop', maxSeats: 2 });
  await rb.join(room.id);
  const ready = next<{ seats: { ready: boolean }[] }>((h) => ra.on('update', h), (r) => r.seats.length === 2 && r.seats[1].ready);
  rb.ready(true);
  await ready;
  const bStarted = next<RoundStart>((h) => rb.on('started', h));
  const round = await ra.start();
  await bStarted;
  // simulate a lost connection: the client reconnects by itself and joins its room again
  const again = next<RoundStart>((h) => rb.on('started', h), () => true, 10000);
  (b as unknown as { link: { close(): void } }).link.close();
  const r = await again;
  assert.equal(r.rejoined, true);
  assert.equal(r.seed, round.seed);
  assert.equal(r.you, 1);
});
