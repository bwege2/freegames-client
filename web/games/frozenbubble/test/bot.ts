// A development tool that writes session scripts: it plays the port headless (harness.ts) and records
// the keys it pressed as a session file, which the oracle and the port then both run (oracle.test.ts).
// The bot aims for each shot: it tries every angle the launcher can reach in whole frames (steps of
// LAUNCHER_SPEED, as update_game turns it), follows the bubble as update_game moves it, and picks the
// shot that destroys most (or sticks to its colour, or stays highest).
//   node games/frozenbubble/test/bot.ts <prefix session> <out session> [--shots N] [--until ms] [--player p1|p2]
// The prefix session's lines are copied (menu navigation); the bot plays from its `end` on.
import { readFileSync, writeFileSync } from 'node:fs';
import { runPort, parseSession } from './harness.ts';
import type { FrozenBubble, Bubble } from '../src/fb/game.ts';
import { cos, sin } from '../src/fb/libm.ts';
import { PI, LAUNCHER_SPEED } from '../src/fb/data.ts';
import { oddn } from '../src/fb/perl.ts';

interface Shot { steps: number; score: number }

/** the cell a bubble shot at `dir` sticks to, following update_game */
function simulate(g: FrozenBubble, p: string, dir: number): [number, number] | null {
  const P = g.POSp[p];
  const pd = g.pdata[p];
  const t = g.tobe_launched[p]!;
  const b = { x: t.x, y: t.y } as Bubble;
  for (let i = 0; i < 400; i++) {
    const xo = b.x, yo = b.y;
    b.x += g.BUBBLE_SPEED * cos(dir);
    b.y -= g.BUBBLE_SPEED * sin(dir);
    if (b.x < P.left_limit) { b.x = 2 * P.left_limit - b.x; dir -= 2 * (dir - PI / 2); }
    if (b.x > P.right_limit - g.BUBBLE_SIZE) { b.x = 2 * (P.right_limit - g.BUBBLE_SIZE) - b.x; dir += 2 * (PI / 2 - dir); }
    if (b.y <= P.top_limit + pd.newrootlevel * g.ROW_SIZE) return g.get_array_closest_pos(b.x, b.y, p);
    for (const s of g.sticked_bubbles[p]) {
      if (g.is_collision(b, s.x, s.y)) return g.get_array_closest_pos((xo + b.x) / 2, (yo + b.y) / 2, p);
    }
  }
  return null;
}

function evaluate(g: FrozenBubble, p: string, cell: [number, number]): number {
  const [cx, cy] = cell;
  const os = g.pdata[p].oddswap;
  const st = g.sticked_bubbles[p];
  if (cx < 0 || cx + oddn(cy + os) > 7 || cy > 11) return -1000;
  if (st.some((b) => b.cx === cx && b.cy === cy)) return -1000;
  const color = g.tobe_launched[p]!.img;
  const next = (x1: number, y1: number, x2: number, y2: number): boolean =>
    (x1 + oddn(y1 + os) * 0.5 - (x2 + oddn(y2 + os) * 0.5)) ** 2 + (y1 - y2) ** 2 < 3 && !(x1 === x2 && y1 === y2);
  const group = new Set<Bubble>();
  let frontier = st.filter((b) => b.img === color && next(b.cx, b.cy, cx, cy));
  while (frontier.length) {
    const nf: Bubble[] = [];
    for (const b of frontier) if (!group.has(b)) { group.add(b); nf.push(...st.filter((c) => c.img === color && !group.has(c) && next(c.cx, c.cy, b.cx, b.cy))); }
    frontier = nf;
  }
  if (group.size >= 2) {
    // destroyed; count what falls
    const left = st.filter((b) => !group.has(b));
    const rootLevel = g.pdata[p].newrootlevel;
    const attached = new Set<Bubble>(left.filter((b) => b.cy === rootLevel));
    let grew = true;
    while (grew) {
      grew = false;
      for (const b of left) if (!attached.has(b) && [...attached].some((a) => next(a.cx, a.cy, b.cx, b.cy))) { attached.add(b); grew = true; }
    }
    return 100 + group.size * 10 + (left.length - attached.size) * 15;
  }
  return (group.size ? 20 : 0) - cy * 2;
}

function plan(g: FrozenBubble, p: string): Shot {
  let best: Shot = { steps: 0, score: -Infinity };
  for (const sign of [1, -1]) {
    let a = g.angle[p];
    for (let k = 0; k <= 50; k++) {
      if (k > 0) {
        a += sign * LAUNCHER_SPEED;
        if (a < 0.1) a = 0.1;
        if (a > PI - 0.1) a = PI - 0.1;
      }
      const cell = simulate(g, p, a);
      if (!cell) continue;
      const score = evaluate(g, p, cell) - k * 0.01;
      if (score > best.score) best = { steps: sign * k, score };
    }
  }
  return best;
}

const args = process.argv.slice(2);
const [prefix, out] = args;
const opt = (n: string, d: string): string => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const maxShots = Number(opt('--shots', '40'));
const until = Number(opt('--until', '600000'));
const players = opt('--player', 'p1').split(',');
/** a player's moves are worse by this much (0: the best shot); a weak bot loses */
const weak = Number(opt('--weak', '0'));
/** after a game: the key that starts the next one (none: stop there) */
const again = opt('--again', 'return');
const KEYS: Record<string, { left: string; right: string; fire: string }> = {
  p1: { left: 'left', right: 'right', fire: 'up' }, p2: { left: 'x', right: 'v', fire: 'c' },
};

const pre = parseSession(prefix);
const startAt = pre.end;
const lines = readFileSync(prefix, 'utf8').split('\n').filter((l) => !/^\d+ end\b/.test(l.trim()) && l.trim() !== '');
const extra: string[] = [];
let shots = 0;
const busy: Record<string, number> = {};
let lastT = 0;
let restartAt = 0;
let rnd = 7;

await runPort(prefix, {
  endAt: until,
  bot: (g: FrozenBubble, vt: number, add: (line: string) => void) => {
    const emit = (l: string): void => { add(l); extra.push(l); lastT = Math.max(lastT, Number(l.split(' ')[0])); };
    if (vt < startAt || shots >= maxShots) return;
    if (g.gstate !== 'game') {
      if (/^(won|lost)/.test(g.gstate) && vt > restartAt && again !== 'none') { emit(`${vt + 2500} tap ${again}`); restartAt = vt + 3500; }
      return;
    }
    for (const p of players) {
      if ((busy[p] ?? 0) > vt) continue;
      if (g.pdata[p].state !== 'ingame' || g.launched_bubble[p] || !g.tobe_launched[p]) continue;
      if (g.falling_bubble[p].some((b) => b.chaindestx !== undefined)) continue;
      let s = plan(g, p);
      if (weak && p === players[players.length - 1]) { rnd = (rnd * 1103515245 + 12345) % 2147483648; s = { steps: (rnd % 61) - 30, score: 0 }; }
      const k = Math.abs(s.steps);
      const K = KEYS[p];
      if (k > 0) { emit(`${vt} key down ${s.steps > 0 ? K.left : K.right}`); emit(`${vt + 20 * k} key up ${s.steps > 0 ? K.left : K.right}`); }
      emit(`${vt + 20 * k + 20} tap ${K.fire}`);
      busy[p] = vt + 20 * k + 200;
      shots++;
    }
  },
});
writeFileSync(out, `${lines.join('\n')}\n${extra.join('\n')}\n${Math.min(until, lastT + 3000)} end\n`);
console.log(`${shots} shots written to ${out}`);
