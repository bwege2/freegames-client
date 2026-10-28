// The scenarios of the golden test (golden.test.ts) and the recorder (record.ts): tables built from
// the parts library as the construction set builds them, balls given start states, buttons, paddles
// and keys driven by frame. Together they hit every part type, move the flippers while balls are on
// them, launch with the plunger, fire the wiring's AND gates, and use all eight values of each world
// setting (gravity, speed, kick, elasticity); four are whole games (RUN2.S) for 1 to 4 players.
import { IMAGE, SYM } from '../src/image.ts';
import { LIBRARY, OUTLINE, type InputEvent, type LibPart, type TableObject, type TableSpec, type Target } from './scenario.ts';

export interface Scenario {
  name: string;
  /** 'test': the construction set's test play (RUN.S PLAY); 'game': Play Game (RUN2.S) */
  mode: 'test' | 'game';
  spec: TableSpec;
  events: InputEvent[];
  /** test play: the frame Esc is pressed at; a game: the last frame recorded (0: until it ends) */
  frames: number;
  /** at frame 1 (after the parts' init routines): balls' start states */
  start?: { ball: number; bdx: number; bdy: number; bxacc?: number; byacc?: number }[];
}

/** a small deterministic generator (xorshift32) so the scenarios are the same everywhere */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

/** a library part's polygon, from the original's bytes */
function libPoly(part: LibPart): { x: number[]; y: number[] } {
  const at = (SYM.RUN as Record<string, number>)[part];
  const seg = IMAGE.RUN.find((s) => at >= s.org && at < s.org + s.hex.length / 2)!;
  const b = (i: number) => parseInt(seg.hex.slice((at - seg.org + i) * 2, (at - seg.org + i) * 2 + 2), 16);
  const n = b(2);
  return { x: Array.from({ length: n }, (_, i) => b(3 + i)), y: Array.from({ length: n }, (_, i) => b(3 + n + i)) };
}

function bbox(part: LibPart): { x0: number; y0: number; x1: number; y1: number } {
  const p = libPoly(part);
  return { x0: Math.min(...p.x), y0: Math.min(...p.y), x1: Math.max(...p.x), y1: Math.max(...p.y) };
}

/** a part placed with its polygon's top left corner at (x, y) */
export function at(part: LibPart, x: number, y: number): TableObject {
  const b = bbox(part);
  return { part, dx: x - b.x0, dy: y - b.y0 };
}

/**
 * Places parts in rows from (x0, y0) inside the playfield (left of the launch lane), with gaps, a
 * little jitter; returns the objects.
 */
function shelf(parts: LibPart[], r: () => number, x0 = 6, y0 = 34, x1 = 134, gap = 7): TableObject[] {
  const out: TableObject[] = [];
  let x = x0;
  let y = y0;
  let rowH = 0;
  for (const p of parts) {
    const b = bbox(p);
    const w = b.x1 - b.x0;
    const h = b.y1 - b.y0;
    if (x + w > x1) {
      x = x0;
      y += rowH + gap;
      rowH = 0;
    }
    const jx = Math.floor(r() * 4);
    const jy = Math.floor(r() * 4);
    out.push(at(p, x + jx, y + jy));
    x += w + gap + jx;
    rowH = Math.max(rowH, h + jy);
  }
  return out;
}

/** balls along the top, their start velocities from the generator */
function balls(n: number, r: () => number, first: number, y = 6, x0 = 8, x1 = 130): { objs: TableObject[]; start: NonNullable<Scenario['start']> } {
  const objs: TableObject[] = [];
  const start: NonNullable<Scenario['start']> = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.floor(((x1 - x0) * (i + 0.5)) / n);
    objs.push(at('BALL', x, y + Math.floor(r() * 6)));
    start.push({ ball: first + i, bdx: (Math.floor(r() * 64) - 32) & 0xff, bdy: (Math.floor(r() * 48) - 40) & 0xff, bxacc: Math.floor(r() * 32), byacc: Math.floor(r() * 32) });
  }
  return { objs, start };
}

/** a black polygon (the parts box's POLY) with random corners: walls at many slopes */
function randomPoly(r: () => number, cx: number, cy: number, rad: number, n: number, color: number): TableObject {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + r() * 0.5;
    const d = rad * (0.6 + r() * 0.4);
    xs.push(Math.round(cx + Math.cos(a) * d));
    ys.push(Math.round(cy + Math.sin(a) * d));
  }
  // as ALIGNPOLY leaves it: the first edge goes down
  for (let k = 0; k < n && !(ys[0] < ys[1]); k++) {
    xs.push(xs.shift()!);
    ys.push(ys.shift()!);
  }
  return { poly: { type: 1, color, x: xs, y: ys } };
}

/** flipper buttons pressed and let go in bursts */
function flips(r: () => number, from: number, to: number, rate = 40, maxLen = 25): InputEvent[] {
  const ev: InputEvent[] = [];
  for (let f = from; f < to; f += 5 + Math.floor(r() * rate)) {
    const which = r();
    const len = 3 + Math.floor(r() * maxLen);
    if (which < 0.45) ev.push({ frame: f, btn0: true }, { frame: f + len, btn0: false });
    else if (which < 0.9) ev.push({ frame: f, btn1: true }, { frame: f + len, btn1: false });
    else ev.push({ frame: f, btn0: true, btn1: true }, { frame: f + len, btn0: false, btn1: false });
  }
  return ev.sort((a, b) => a.frame! - b.frame!);
}

const ALL = LIBRARY.filter((p) => p !== 'BALL' && p !== 'POLY');

/**
 * Target practice: up to 9 parts in a 3 x 3 grid, each with its own balls: one falling onto it, one
 * coming from the left, one rising from below (so every side of every part is hit).
 */
function practice(name: string, parts: LibPart[], seed: number, wset: TableSpec['wset'], frames: number, logic?: (n: (p: LibPart, k?: number) => number) => number[]): Scenario {
  const r = rng(seed);
  const objs: TableObject[] = [];
  const ballAt: { x: number; y: number; bdx: number; bdy: number }[] = [];
  parts.forEach((p, i) => {
    const b = bbox(p);
    const w = b.x1 - b.x0;
    const h = b.y1 - b.y0;
    const cx = 8 + (i % 3) * 44;
    const cy = 22 + Math.floor(i / 3) * 54;
    const x = cx + Math.max(0, Math.floor((40 - w) / 2));
    const y = cy + 14 + Math.floor(r() * 4);
    objs.push(at(p, x, y));
    // a CATCH1 hole takes a ball only when it is three pixels in from the hole's left side
    const above = p === 'CATCH1' ? x + 3 : x + Math.floor(r() * Math.max(1, w - 3));
    ballAt.push({ x: above, y: y - 9, bdx: (Math.floor(r() * 9) - 4) & 0xff, bdy: (-Math.floor(r() * 20)) & 0xff });
    ballAt.push({ x: cx, y: y + Math.floor(h / 2) - 2, bdx: 16 + Math.floor(r() * 32), bdy: (Math.floor(r() * 9) - 4) & 0xff });
    ballAt.push({ x: x + Math.floor(r() * Math.max(1, w - 3)), y: Math.min(y + h + 6, cy + 50), bdx: (Math.floor(r() * 9) - 4) & 0xff, bdy: 24 + Math.floor(r() * 32) });
  });
  const first = 1 + objs.length;
  const start: NonNullable<Scenario['start']> = [];
  ballAt.forEach((b, i) => {
    objs.push(at('BALL', b.x, b.y));
    start.push({ ball: first + i, bdx: b.bdx, bdy: b.bdy, bxacc: Math.floor(r() * 32), byacc: Math.floor(r() * 32) });
  });
  const n = (p: LibPart, k = 0) => 1 + parts.indexOf(p, k);
  return {
    name, mode: 'test', frames,
    spec: { wset, logic: logic?.(n), objects: [{ poly: OUTLINE }, ...objs] },
    events: [], start,
  };
}

const practices: Scenario[] = [
  practice('bumpers', ['BMP1', 'BMP2', 'BMP3', 'BMP4', 'BMP5', 'BMP6', 'KICK1', 'KICK2', 'BMP1'], 11, [4, 6, 3, 2], 1500),
  practice('kickers-poly', ['LKICK', 'RKICK', 'POLY', 'POLY1', 'POLY2', 'POLY3', 'POLY4', 'KICK1', 'KICK2'], 13, [5, 5, 6, 4], 1500),
  practice('rollovers-targets', ['ROLL1', 'ROLL2', 'ROLL3', 'TARG1', 'TARG2', 'TARG3', 'TARG4', 'TARG5', 'TARG6'], 17, [3, 7, 2, 1], 2000,
    (n) => [n('ROLL1'), n('ROLL2'), n('ROLL3'), 0x8a, n('TARG1'), n('TARG2'), n('TARG3'), 0x3c, n('TARG4'), n('TARG5'), 0, 0xd5, n('TARG6'), 0, 0, 0x21, 0, 0, 0, 0, n('ROLL1'), n('TARG6'), 0, 0x7f]),
  practice('lanes-gates', ['LANE1', 'LANE2', 'LANE3', 'GATE1', 'GATE2', 'GATE3', 'GATE4', 'GATE2', 'GATE3'], 19, [6, 6, 4, 5], 1500),
  practice('drops-holes', ['DROP1', 'DROP2', 'CATCH1', 'CATCH2', 'SPIN1', 'MAG1', 'DROP1', 'CATCH1', 'SPIN1'], 23, [4, 7, 5, 3], 2000,
    (n) => [n('DROP1'), n('DROP2'), 0, 0x95, n('SPIN1'), n('CATCH2'), 0, 0xe4, n('DROP1', 1), n('MAG1'), n('SPIN1', 1), 0x0f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
];

function flippers(): Scenario {
  const r = rng(37);
  // a funnel of flippers: pairs at three heights, balls raining onto them, buttons in bursts
  const objs: TableObject[] = [
    at('LEFTFLIPPER', 30, 160), at('RIGHTFLIPPER', 78, 160),
    at('LFLIPPER2', 14, 110), at('RFLIPPER2', 104, 110),
    at('LEFTFLIPPER', 40, 70), at('RIGHTFLIPPER', 84, 70),
    at('LFLIPPER2', 60, 130), at('RFLIPPER2', 30, 40),
    at('BMP2', 64, 95), at('KICK2', 100, 150),
  ];
  const b = balls(8, r, 1 + objs.length, 4, 10, 128);
  return {
    name: 'flippers', mode: 'test', frames: 4000,
    spec: { wset: [3, 5, 4, 3], objects: [{ poly: OUTLINE }, ...objs, ...b.objs] },
    events: flips(r, 2, 3990), start: b.start,
  };
}

function launcher(): Scenario {
  // the plunger in the lane: pulled (paddle 1) to several strengths and let go (button 0)
  const objs: TableObject[] = [
    at('LAUNCHER', 143, 178), at('BALL', 144, 170),
    at('BMP1', 60, 30), at('BMP3', 100, 50), at('TARG4', 120, 70), at('LEFTFLIPPER', 34, 165), at('RIGHTFLIPPER', 80, 165),
  ];
  const ev: InputEvent[] = [];
  let f = 20;
  for (const p of [255, 200, 140, 90, 255, 60, 230, 170]) {
    ev.push({ frame: f, pdl1: p }, { frame: f + 70, btn0: true }, { frame: f + 74, btn0: false, pdl1: 0 });
    f += 420;
  }
  return {
    name: 'launcher', mode: 'test', frames: f + 100,
    spec: { wset: [6, 4, 5, 5], objects: [{ poly: OUTLINE }, ...objs] },
    events: ev,
  };
}

function walls(): Scenario {
  const r = rng(53);
  const objs: TableObject[] = [];
  for (let i = 0; i < 9; i++) objs.push(randomPoly(r, 20 + (i % 3) * 45, 50 + Math.floor(i / 3) * 42, 14, 4 + Math.floor(r() * 5), [0, 2, 4, 6, 10, 12][i % 6]));
  objs.push(at('POLY1', 70, 160), at('POLY2', 40, 150), at('POLY3', 90, 140), at('POLY4', 20, 120), at('POLY', 100, 165));
  const b = balls(8, r, 1 + objs.length, 4);
  return {
    name: 'walls', mode: 'test', frames: 3000,
    spec: { wset: [2, 3, 0, 6], objects: [{ poly: OUTLINE }, ...objs, ...b.objs] },
    events: [], start: b.start,
  };
}

/** every world setting value: one short run each, gravity/speed/kick/elasticity all = k */
function settings(k: number): Scenario {
  const r = rng(71 + k);
  const parts: LibPart[] = ['BMP1', 'BMP4', 'LKICK', 'RKICK', 'KICK1', 'KICK2', 'BMP6', 'TARG1'];
  const objs = shelf(parts, r, 8, 60, 130, 12);
  const b = balls(5, r, 1 + objs.length);
  return {
    name: `world-${k}`, mode: 'test', frames: 900,
    spec: { wset: [k, k, k, k], objects: [{ poly: OUTLINE }, ...objs, ...b.objs] },
    events: [], start: b.start,
  };
}

/** a whole game: players, five balls each, the flippers in bursts, Esc at the next players' count */
function game(name: string, players: number, wset: TableSpec['wset'], ballX: number, extra: TableObject[], seed: number, frames = 0): Scenario {
  const r = rng(seed);
  const ev: InputEvent[] = [];
  for (let i = 1; i < players; i++) ev.push({ frame: 14, poll: 4 * i, key: 0xa0 });
  ev.push({ frame: 14, poll: 40, btn0: true }, { frame: 14, poll: 80, btn0: false });
  // (a press lasts at most 10 jiffies: let go before the players' count after the last ball)
  for (const e of flips(r, 30, 30000, 60, 8)) ev.push(e);
  ev.push({ idle: 30000, key: 0x9b });
  return {
    name, mode: 'game', frames,
    spec: {
      wset,
      objects: [{ poly: OUTLINE }, at('BALL', ballX, 16), at('LEFTFLIPPER', 40, 162), at('RIGHTFLIPPER', 76, 162), ...extra],
    },
    events: ev,
  };
}

export const SCENARIOS: Scenario[] = [
  ...practices,
  flippers(),
  launcher(),
  walls(),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(settings),
  game('game-1-player', 1, [7, 6, 4, 2], 70, [at('BMP1', 60, 60), at('CATCH2', 20, 100)], 101),
  game('game-2-players', 2, [6, 7, 6, 4], 66, [at('BMP2', 50, 40), at('TARG4', 100, 90), at('DROP2', 20, 60)], 102),
  game('game-3-players-sleepers', 3, [7, 7, 3, 1], 69, [at('CATCH1', 63, 100), at('CATCH1', 100, 60), at('BMP3', 30, 50)], 103, 6000),
  game('game-4-players', 4, [7, 7, 7, 7], 72, [at('LKICK', 10, 120), at('RKICK', 110, 120), at('SPIN1', 70, 50)], 104),
];

/** frame 1: the balls' start states (BDX, BDY and accumulators of objects `ball`) */
export function applyStart(t: Target, sc: Scenario): void {
  const m = t.ram;
  for (const s of sc.start ?? []) {
    const lb = m[0x580 + s.ball] | (m[0x600 + s.ball] << 8);
    if (!lb) continue;
    m[lb + 19] = s.bdx;
    m[lb + 20] = s.bdy;
    if (s.bxacc !== undefined) m[lb + 21] = s.bxacc;
    if (s.byacc !== undefined) m[lb + 22] = s.byacc;
  }
}

export { ALL as PARTS };
