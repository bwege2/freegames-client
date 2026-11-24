// Browser side of test/online-e2e.test.ts: one browser of an online round against the real server. The page connects
// with the SDK (GameClient, Rooms), creates or joins a room of the openclonk module, and when the round starts it starts
// the round's scenario as the game page does (src/app.ts with src/net.ts in C4Network2's place, the original's control
// queue in network mode). Keys go in at given frames; the state is looked at at given frames (the same frames in every
// browser: the frame hook runs before each C4Game::Execute); one browser may alter its state at a frame (a synchronized
// thousand random numbers drawn where the others draw none) to see the module's desync.
import { GameClient, Rooms, type RoundStart } from '../../../../src/sdk/index.ts';
import { OriginalApp } from '../../src/app.ts';
import { RoomsNetwork, roundScenario } from '../../src/net.ts';
import { packOptions } from '../../src/online.ts';
import { Random$u32 } from '../../src/rt/random.ts';

interface Key { frame: number; code: string; key: string; down: boolean }
interface Run { width: number; height: number; keys: Key[]; snaps: number[]; alterAt?: number }

const st: {
  log: string[]; error: string; frame: number; rejoined: boolean; started: number;
  snaps: Record<number, string>; net: RoomsNetwork | null; activated: boolean; alteredAt?: number;
} = { log: [], error: '', frame: 0, rejoined: false, started: 0, snaps: {}, net: null, activated: true };

let client: GameClient;
let rooms: Rooms;
let groups: { name: string; data: Uint8Array }[] = [];
let name = '';
let run: Run | null = null;
let app: OriginalApp | null = null;
let pending: Key[] = [];

const cString = (p: any): string => {
  if (!p) return '';
  let s = '';
  for (let i = 0; p.a[p.o + i]; i++) s += String.fromCharCode(p.a[p.o + i] & 0xff);
  return s;
};

/** the players and their crews' positions: what the browsers of a round must agree on */
function snapshot(): string {
  const $ = app!.engine as any;
  const out: unknown[] = [$.Game.FrameCounter, $.Objects.ObjectCount()];
  for (let p = $.Players.First; p; p = p.Next) {
    const crew: number[] = [];
    const end = p.Crew.end();
    const it = p.Crew.begin();
    for (; it.op_ne(end); it.op_inc$v()) {
      const o = it.op_mul();
      crew.push($.fixtoi$C4Fixed$i32(o.fix_x, 100), $.fixtoi$C4Fixed$i32(o.fix_y, 100));
    }
    it.$dtor();
    end.$dtor();
    out.push([p.Number, cString(p.Name.getData()), p.AtClient, crew]);
  }
  return JSON.stringify(out);
}

function startGame(round: RoundStart): void {
  const r = run!;
  st.rejoined = round.rejoined;
  st.started++;
  const canvas = document.createElement('canvas');
  canvas.width = r.width;
  canvas.height = r.height;
  document.body.replaceChildren(canvas);
  app = new OriginalApp({ canvas, audio: null, groups, files: [], scenario: roundScenario(round), playerName: name, log: (l) => { st.log.push(l); if (st.log.length > 600) st.log.splice(0, 200); } });
  const a = app;
  a.prepare();
  const $ = a.engine as any;
  const net = new RoomsNetwork({
    rooms, round, rtt: () => client.rtt, log: (l) => st.log.push(l),
    frameHook: (frame) => {
      st.frame = frame;
      if (r.snaps.includes(frame) && !(frame in st.snaps)) st.snaps[frame] = snapshot();
      // synchronized random numbers that the other browsers do not draw (at the given frame, or the first frame the
      // hook sees after it: a page that catches up may not call the hook at every frame number)
      if (r.alterAt !== undefined && frame >= r.alterAt && !st.snaps[-1]) {
        st.snaps[-1] = 'altered';
        st.alteredAt = frame;
        // a thousand draws, not one: the simulation's own draws vary with what the random values decide (particles),
        // and the count can catch up by one within the 50 frames to the next check, which made a single draw a flaky
        // state change. A thousand cannot catch up, and the stream is different from then on.
        for (let i = 0; i < 1000; i++) Random$u32(1000);
      }
    },
  });
  st.net = net;
  a.setNetwork(net);
  if (!a.start()) throw new Error('C4Application::Init failed');
  // a network game (C4StartupScenSelDlg in network mode: Game.NetworkActive, always a lobby)
  $.Game.NetworkActive = true;
  $.Game.fLobby = true;
  pending = [...r.keys];
  const keys = pending;
  const step = () => {
    if (app !== a) return;
    try {
      a.frame();
      while (keys.length && st.frame >= keys[0].frame) {
        const k = keys.shift()!;
        a.key(new KeyboardEvent(k.down ? 'keydown' : 'keyup', { code: k.code, key: k.key }), k.down);
      }
      st.activated = !!$.Game.Clients?.getLocal()?.isActivated();
    } catch (e) {
      st.error = String((e as Error)?.stack ?? e).split('\n').slice(0, 12).join('\n');
      return;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

(globalThis as any).ocOnline = {
  /** connect, load the content */
  async open(o: { server: string; token: string; name: string; groups: string[] }) {
    name = o.name;
    client = new GameClient('openclonk', { url: o.server, token: o.token, transport: 'ws' });
    await client.connect();
    rooms = new Rooms(client);
    const fetchBytes = async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer());
    groups = await Promise.all(o.groups.map(async (g) => ({ name: g, data: await fetchBytes('/assets/' + g) })));
    rooms.on('started', (round) => { try { startGame(round); } catch (e) { st.error = String((e as Error)?.stack ?? e); } });
    return client.accountId;
  },
  prepare(r: Run) { run = r; },
  /** more keys, and more frames to look at the state at (the running round) */
  more(o: { keys: Key[]; snaps: number[] }) {
    run!.keys.push(...o.keys);
    run!.snaps.push(...o.snaps);
    pending.push(...o.keys);
    pending.sort((a, b) => a.frame - b.frame);
  },
  async host(o: { scenario: string; controlRate: number; seats: number }) {
    const room = await rooms.create({ name: 'e2e', maxSeats: o.seats, options: packOptions({ scenario: o.scenario, controlRate: o.controlRate }) });
    return room.id;
  },
  async join(id: number) {
    await rooms.join(id);
    rooms.ready(true);
  },
  /** a reloaded page: the running room it is still seated in */
  async rejoin() {
    const mine = (await rooms.list()).find((r) => rooms.isMine(r));
    if (!mine) throw new Error('no room of mine');
    await rooms.join(mine.id);
  },
  async start() { await rooms.start(); },
  status() {
    const net = st.net;
    return {
      error: st.error, frame: st.frame, rejoined: st.rejoined, started: st.started, activated: st.activated,
      alterAt: run?.alterAt, alteredAt: st.alteredAt, snaps: st.snaps, log: st.log.slice(-40),
      sent: net?.sent ?? -1,
      received: net?.state.received ?? 0, checks: net?.state.checks ?? 0, desync: net?.state.desync ? { frame: net.state.desync.frame, seat: net.state.desync.seat, other: net.state.desync.other } : null,
      finished: net?.state.finished ?? false, outcome: net?.state.outcome ? { reason: net.state.outcome.reason, frame: net.state.outcome.frame } : null,
      stopped: net?.state.stopped ?? '', packets: net?.state.packets ?? {}, dropped: net?.state.dropped ?? 0,
      loss: st.log.some((l) => /Synchronization loss/.test(l)),
    };
  },
};
