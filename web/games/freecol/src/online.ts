// Online play on the page (protocol/games/freecol.capnp, port/server/lockstep.ts): FreeCol's "Start
// multiplayer game" and "Join multiplayer game" open the site's lobby over the game; when the round starts,
// the page starts both workers again for the round's game. It carries what the server worker sends out
// (commands, reports, the end) to the server module and hands the server worker the round's entries.
import { packGame, unpackGame, bytes, setData, SERVER_SEAT, type RoundStart, type GameMessage } from '../../../src/sdk/index.ts';
import { Msg, Options, Results, Kind, Reason } from './proto/freecol.ts';
import type { Entry, OnlineInit, Out } from './port/server/lockstep.ts';
import type { Ctx, OnlineLaunch } from './index.ts';

/** What FreeCol's NewPanel asked for: open a room (with its rules and difficulty) or join one. */
export type OnlineRequest = { start: boolean; rules: string; difficulty: string };

/** the port FreeCol's server listens on in the server worker (FreeCol's default) */
const PORT = 3541;
const KINDS = ['line', 'open', 'close', 'drop', 'computer'] as const;
const RULES = new Set(['freecol', 'classic']);
const DIFFICULTIES = new Set(['veryEasy', 'easy', 'medium', 'hard', 'veryHard']);

function overlay(host: HTMLElement): HTMLDivElement {
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;inset:0;background:rgb(0 0 0 / .55);overflow:auto;z-index:10';
  host.append(d);
  return d;
}

/** The site's lobby over the game; the round, with what the module sent before the game listened, or null. */
export async function lobby(host: HTMLElement, ctx: Ctx, req: OnlineRequest): Promise<{ round: RoundStart; early: GameMessage[] } | null> {
  const over = overlay(host);
  const early: GameMessage[] = [];
  const off = ctx.rooms.on('message', (m) => early.push(m));
  try {
    const round = await ctx.lobby(over, {
      title: 'FreeCol online',
      seats: { min: 2, max: 8, default: 2 },
      options: () => packGame(Options, (o) => {
        o.rules = RULES.has(req.rules) ? req.rules : 'freecol';
        o.difficulty = DIFFICULTIES.has(req.difficulty) ? req.difficulty : 'medium';
      }),
    });
    return { round, early };
  } catch {
    return null;
  } finally {
    off();
    over.remove();
  }
}

/** Each seat's name in FreeCol (players' names must differ). */
export function playerNames(round: RoundStart): Map<number, string> {
  const names = new Map<number, string>();
  for (const s of round.seats) {
    const base = (s.name || 'Player').replace(/[<>&"]/g, '').slice(0, 24) || 'Player';
    const twice = round.seats.some((o) => o.seat !== s.seat && o.name === s.name);
    names.set(s.seat, twice ? `${base} ${s.seat + 1}` : base);
  }
  return names;
}

export function readEntry(e: { index: number; seat: number; salt: number; kind: number; line: { toUint8Array(): Uint8Array } }): Entry {
  return { index: e.index, seat: e.seat, salt: e.salt, kind: KINDS[e.kind] ?? 'line', line: bytes(e.line as any) };
}

/** A message from the server worker, for the module. */
export function packOut(m: Out): Uint8Array {
  return packGame(Msg, (msg) => {
    if (m.t === 'command') {
      const c = msg._initCommand();
      c.kind = m.kind === 'open' ? Kind.OPEN : m.kind === 'close' ? Kind.CLOSE : Kind.LINE;
      if (m.line) setData((n) => c._initLine(n), m.line);
    } else if (m.t === 'report') {
      const r = msg._initReport();
      r.index = m.index;
      r.turn = m.turn;
      r.current = m.current;
      r.hash = BigInt.asUintN(64, m.hash);
    } else {
      const o = msg._initOver();
      o.index = m.index;
      o.winner = m.winner;
    }
  });
}

/** The round's wiring: the workers' online parts, and the room's events to the server worker. */
export function onlineLaunch(host: HTMLElement, ctx: Ctx, round: RoundStart, early: GameMessage[], again: () => void): OnlineLaunch & { stop: () => void } {
  const o = unpackGame(Options, round.options);
  const server: OnlineInit = {
    seat: round.you, seed: String(BigInt.asIntN(64, round.seed)), rules: RULES.has(o.rules) ? o.rules : 'freecol',
    difficulty: DIFFICULTIES.has(o.difficulty) ? o.difficulty : 'medium', port: PORT,
  };
  let post: ((m: unknown) => void) | null = null;
  const queued: unknown[] = [];
  const toServer = (m: unknown) => (post ? post(m) : queued.push(m));
  let historySeen = false;
  // what came and went lately, for a look from the developer tools (and e2e.mjs when it fails)
  const stats = { entries: [] as string[], out: [] as string[] };
  (window as any).freecolOnline = stats;
  const note = (list: string[], s: string) => {
    list.push(s);
    if (list.length > 200) list.shift();
  };
  const onMessage = (msg: GameMessage) => {
    if (msg.from !== SERVER_SEAT) return;
    let m: Msg;
    try {
      m = unpackGame(Msg, msg.data);
    } catch {
      return;
    }
    if (m._isEntry) {
      const e = readEntry(m.entry);
      note(stats.entries, `${e.index}:${e.seat}:${e.kind}:${e.line ? new TextDecoder().decode(e.line).slice(0, 60) : ''}`);
      toServer({ t: 'entry', e });
    } else if (m._isHistory) {
      const h = m.history;
      // the entries before this seat came back were its earlier session's: they replay without its client
      if (!historySeen) toServer({ t: 'liveFrom', index: h.total });
      historySeen = true;
      for (let i = 0; i < h.entries.length; i++) toServer({ t: 'entry', e: readEntry(h.entries.get(i)) });
    } else if (m._isStopped) {
      notice(`The players' games differ from turn ${m.stopped.turn} on: the round was stopped.`);
    }
  };
  const offs = [
    ctx.rooms.on('message', onMessage),
    ctx.rooms.on('finished', (f) => {
      let text = 'The round ended.';
      if (f.stopped) text = 'The server stopped the round: ' + f.stopped;
      else {
        try {
          const r = unpackGame(Results, f.results);
          const names = playerNames(round);
          if (r.reason === Reason.WON) text = r.winner === SERVER_SEAT ? `The game ended in turn ${r.turn}.` : `${names.get(r.winner) ?? '?'} won in turn ${r.turn}.`;
          else if (r.reason === Reason.DISAGREED) text = `The game ended in turn ${r.turn}, but the players' games did not agree on how.`;
          else if (r.reason === Reason.DESYNC) text = `The players' games differ from turn ${r.turn} on: the round was stopped.`;
          else if (r.reason === Reason.LIMIT) text = 'The round reached the server\'s limit for one game.';
        } catch { /* the text above */ }
      }
      notice(text);
    }),
    // a seat that comes back after a lost connection: its game starts again and replays the round
    ctx.rooms.on('started', (r) => {
      if (r.rejoined && r.round === round.round) again();
    }),
    ctx.rooms.on('closed', () => notice('You are no longer in the room.')),
  ];
  let box: HTMLDivElement | null = null;
  function notice(text: string) {
    box?.remove();
    box = overlay(host);
    const p = document.createElement('div');
    p.style.cssText = 'max-width:30rem;margin:4rem auto;padding:1.25rem 1.5rem;background:#fff;color:#1d2125;border-radius:10px;font:15px/1.45 system-ui,sans-serif';
    const b = document.createElement('button');
    b.textContent = 'Back to the game';
    b.onclick = () => box?.remove();
    const q = document.createElement('button');
    q.textContent = 'Leave';
    q.style.marginLeft = '.5rem';
    q.onclick = () => {
      ctx.rooms.leave();
      ctx.exit();
    };
    p.append(text, document.createElement('br'), document.createElement('br'), b, q);
    box.append(p);
  }
  for (const m of early) onMessage(m);
  return {
    server,
    client: { port: PORT, name: playerNames(round).get(round.you) ?? 'Player' },
    out: (m) => {
      note(stats.out, m.t === 'command' ? m.kind + ':' + (m.line ? new TextDecoder().decode(m.line).slice(0, 60) : '') : m.t === 'report' ? `report ${m.index} ${m.turn} ${m.current} ${m.hash}` : 'over');
      ctx.rooms.send(packOut(m), 'server');
    },
    attach: (p) => {
      post = p;
      for (const m of queued.splice(0)) p(m);
    },
    exit: () => {
      ctx.rooms.leave();
      ctx.exit();
    },
    stop: () => {
      for (const off of offs) off();
      box?.remove();
    },
  };
}
