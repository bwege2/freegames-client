// One browser of an online game, without a browser: a worker thread (its own copy of the game's globals, as each
// browser has its own) that runs the port with src/net.ts and src/online.ts exactly as the page does, and talks to
// the test's stand-in for the server through messages. test/online.test.ts runs two to four of them.
// Commands (from the test): start {round}, msg {from, data}, play {rng} (the player chooses its decision with the
// controls: movepcto, targetRangedOrb), draw (a frame of the screen, drawn as the page draws it), local {moves} (a
// single-player game before the online one), tamper (a cell changed in this browser only), info.
import { parentPort, workerData } from 'node:worker_threads';
import { G } from '../src/globals.ts';
import { hyper_init } from '../src/hyper-main.ts';
import { movepcto } from '../src/pcmove.ts';
import { targetRangedOrb, roKeyboard } from '../src/orbs.ts';
import { Online } from '../src/net.ts';
import { online_install_input, online_as_local_player } from '../src/online.ts';
import { svg_render } from '../src/screenshot.ts';
import { drawscreen } from '../src/graph.ts';
import { compute_fsize, init_font } from '../src/basegraph.ts';
import { MD_DROP } from '../src/hyper.ts';
import { hrand, rand } from '../src/rand.ts';
import type { RoundStart, SendTo } from '../../../src/sdk/index.ts';

const port = parentPort!;
const name = (workerData as { name: string }).name;
const post = (m: unknown, transfer: ArrayBuffer[] = []): void => port.postMessage(m, transfer);

hyper_init(['hyperrogue', '-nogui']);

const online = new Online((data: Uint8Array, to: SendTo) => { post({ type: 'send', data, to }); });
let fontReady = false;

/** a small generator for the bot's choices (not the game's: those must not be touched) */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

port.on('message', (m: { type: string; id: number; [k: string]: unknown }) => {
  let value: unknown = null;
  switch (m.type) {
    case 'local': {
      // a single-player game first, as a page where the player played before going online
      const rnd = lcg(m.seed as number);
      for (let i = 0; i < (m.moves as number); i++) movepcto(Math.floor(rnd() * 7), 1);
      value = G.turncount;
      break;
    }
    case 'start': {
      const r = m.round as RoundStart & { seed: string };
      online.start({ ...r, seed: BigInt(r.seed) });
      online_install_input((d) => online.decide({ ...d, seat: online.you }), () => { /* leaving: not in these tests */ });
      online.pump();
      break;
    }
    case 'msg':
      online.message(m.from as number, m.data as Uint8Array);
      online.pump();
      break;
    case 'play': {
      // the player decides with the controls, as the page's keys and mouse do: a move in a direction (the key of
      // a neighbour), now and then a wait, a drop, or a ranged Orb aimed at a cell
      const rnd = lcg(m.seed as number);
      const p = online.playerOf(online.you);
      online_as_local_player(p, () => {
        if (!online.canDecide()) return;
        const r = rnd();
        if (r < 0.08) movepcto(-1, 1);
        else if (r < 0.1) movepcto(MD_DROP, 1);
        else if (r < 0.2 && G.dcal.length) targetRangedOrb(G.dcal[Math.floor(rnd() * Math.min(60, G.dcal.length))], roKeyboard);
        if (online.canDecide() && G.cwt.at) movepcto(Math.floor(rnd() * G.cwt.at.type), rnd() < 0.5 ? 1 : -1);
        if (online.canDecide()) movepcto(-1, 1);
      });
      value = online.canDecide();
      break;
    }
    case 'draw': {
      if (!fontReady) { init_font(); fontReady = true; }
      G.vid.xres = 480; G.vid.yres = 360;
      compute_fsize();
      G.ticks += 40;
      // a frame of the page: the main loop draws hrand and rand() outside drawscreen too (the whole frame runs on
      // the drawing's generators), then the screen
      online_as_local_player(online.playerOf(online.you), () => { hrand(7); rand(); svg_render(drawscreen); });
      break;
    }
    case 'tamper': {
      const c = G.dcal[5];
      c.wall = c.wall === 0 ? 1 : 0;
      break;
    }
    case 'info':
      break;
  }
  post({
    type: 'reply', id: m.id, value, name,
    info: {
      round: online.round, played: online.played, log: online.log.map((e) => e.hash), hash: online.log.at(-1)?.hash ?? 0,
      over: online.over, end: online.end, alive: online.playerOf(online.you) >= 0 && !!G.multi_player[online.playerOf(online.you)].at,
      waiting: online.waitingForHistory, players: G.multi_players, turn: G.turncount, isolated: G.online_isolated,
    },
  });
});
post({ type: 'ready' });
