// One computer of an online game, without a browser: a worker thread (its own copy of the game's globals, as
// each browser has its own) that runs the port headless (harness.ts) on a session whose keys pick "Net game" in
// the main menu, joins the test's room on the real server through the SDK (GameClient, Rooms) and plays the
// network game as the page does (lw/netplay.ts, page/netplay.ts). test/online.test.ts runs two or three.
// workerData: { url, name, host, seats, session, tamperAt }; it posts { type: 'room', id } (the host) and
// { type: 'done', trace, rounds, info, log } at the end; the guests get { id } (the room to join).
import { parentPort, workerData } from 'node:worker_threads';
import { GameClient } from '../../../src/sdk/net/client.ts';
import { Rooms, type RoundStart } from '../../../src/sdk/rooms.ts';
import { LOG } from '../src/lw/log.ts';
import { menuHooks } from '../src/lw/menu.ts';
import { netplayState, network_game } from '../src/lw/netplay.ts';
import { G, NB_TEAMS } from '../src/lw/state.ts';
import { runPort } from './harness.ts';

const port = parentPort!;
const wd = workerData as { url: string; name: string; host: boolean; seats: number; session: string; tamperAt: number };
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const net = new GameClient('liquidwar', { url: wd.url, transport: 'ws', token: `liquidwar-test-token-${wd.name}-0123456789` });
const rooms = new Rooms(net);

/** the lobby's part: the host creates the room and starts it once everyone is in and ready, the guests join */
async function enter(): Promise<boolean> {
  const started = new Promise<RoundStart>((resolve) => {
    const off = rooms.on('started', (r) => {
      off();
      resolve(r);
    });
  });
  if (wd.host) {
    const room = await rooms.create({ name: `battle ${wd.name}`, maxSeats: wd.seats });
    port.postMessage({ type: 'room', id: room.id });
    for (;;) {
      const r = rooms.room!;
      if (r.seats.length === wd.seats && r.seats.filter((s) => s.ready).length >= wd.seats - 1) break;
      await sleep(20);
    }
    await rooms.start();
  } else {
    const id = await new Promise<number>((resolve) => port.once('message', (m: { id: number }) => resolve(m.id)));
    await rooms.join(id);
    rooms.ready(true);
  }
  await started;
  return true;
}

menuHooks.network_game = () => network_game(enter, rooms);

/** every round: the clock, and the cursors in team (server id) order, which is the same on every computer */
const rounds: string[] = [];
const r = await runPort(wd.session, {
  mutate: () => {
    if (G.GLOBAL_CLOCK === wd.tamperAt) G.CURRENT_ARMY!.health[0] = (G.CURRENT_ARMY!.health[0]! + 1) & 0x3fff;
    const cs: string[] = [];
    for (let t = 0; t < NB_TEAMS; t++) {
      for (let i = 0; i < NB_TEAMS; i++) {
        const c = G.CURRENT_CURSOR[i]!;
        if (c.active && c.team === t) cs.push(`${t}:${c.x},${c.y},${c.key_state},${G.ACTIVE_FIGHTERS[t]}`);
      }
    }
    rounds.push(`${G.GLOBAL_CLOCK} ${cs.join(' ')}`);
  },
});
port.postMessage({ type: 'done', trace: r.trace, rounds, info: netplayState.current?.info() ?? '', log: LOG.slice() });
net.close();
