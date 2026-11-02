// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The computer players: our own, simpler than the original's Controller_AI. Each frame a Brain looks at the game and
// presses keys like a player: away from blasts that are coming, towards boxes, extras and the others, a bomb where it
// hits something and a way out remains. It draws from its own random numbers, never from the game's, so it does not
// change what the game's rand() gives (the oracle's scenarios are played by these brains, test/make-scenarios.ts).
import {
  Bomb, Bomber, Explosion, Extra, Game, MapTile, MAP_HEIGHT, MAP_WIDTH, NO_KEYS, ObjType, TileType, type Keys,
} from './sim.ts';

const INF = 1e9;
const W = MAP_WIDTH;
const H = MAP_HEIGHT;
const idx = (x: number, y: number) => y * W + x;

export class Brain {
  readonly player: number;
  private seed: number;
  private bombHeld = false;
  private wander = -1;
  private wanderUntil = 0;
  private patience = 0;

  constructor(player: number, seed: number) {
    this.player = player;
    this.seed = (seed >>> 0) || 1;
  }

  private rnd(n: number): number {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >>> 17;
    this.seed ^= this.seed << 5;
    return ((this.seed >>> 0) % n);
  }

  think(g: Game): Keys {
    const me = g.bomber_objects[this.player];
    if (!me || me.dead || me.flying || !me.controller.active) {
      this.bombHeld = false;
      return NO_KEYS;
    }
    if (this.bombHeld) {
      this.bombHeld = false; // let the key go up, so the next press counts
      return NO_KEYS;
    }
    const danger = dangerMap(g);
    const mx = ((me.get_x() + 20) / 40) | 0;
    const my = ((me.get_y() + 20) / 40) | 0;
    const here = idx(mx, my);
    const walk = walkable(g, me);

    // with the glove, standing on a bomb just laid: now and then throw it ahead (another press while standing still)
    const tile = g.map.get_maptile(mx, my);
    if (me.gloves && tile.bomb && tile.bomb.bomber === me && !tile.bomb.flying && tile.bomb.detonation_countdown > 2.2 && this.rnd(40) === 0) {
      this.bombHeld = true;
      return { ...NO_KEYS, bomb: true };
    }

    // in a blast's way: run to the nearest tile no blast reaches
    if (danger[here] < INF) {
      let path = bfs(walk, mx, my, (i) => danger[i] >= INF, danger);
      if (!path) path = bfs(walk, mx, my, (i) => danger[i] > danger[here] + 0.3, danger);
      return this.go(me, path, false);
    }

    // a bomb here hits a box or a player, and a way out remains: lay it
    if (me.cur_bombs > 0 && !g.map.get_maptile(mx, my).bomb && this.worth(g, me, mx, my)) {
      const after = withBomb(g, danger, mx, my, me.power);
      const out = bfs(walk, mx, my, (i) => after[i] >= INF, after);
      if (out && out.length <= 4) {
        this.bombHeld = true;
        return { ...NO_KEYS, bomb: true };
      }
    }

    // somewhere to go: an extra that is not a disease, a tile beside a box, the nearest other player
    const extras = new Set<number>();
    for (const o of g.objects) {
      if (o.type === ObjType.EXTRA && !o.flying && (o as Extra).extra > 0) extras.add(idx(((o.get_x() + 20) / 40) | 0, ((o.get_y() + 20) / 40) | 0));
    }
    const safeStep = (i: number) => danger[i] >= INF;
    let path = extras.size ? bfs(walk, mx, my, (i) => extras.has(i), danger, safeStep) : null;
    if (!path && me.cur_bombs > 0) path = bfs(walk, mx, my, (i) => i !== here && besideBox(g, i % W, (i / W) | 0), danger, safeStep);
    if (!path) {
      const others = new Set<number>();
      for (const b of g.bomber_objects) {
        if (b !== me && !b.dead) others.add(idx(((b.get_x() + 20) / 40) | 0, ((b.get_y() + 20) / 40) | 0));
      }
      path = bfs(walk, mx, my, (i) => others.has(i) && i !== here, danger, safeStep);
    }
    if (!path || this.patience > 0) {
      // nothing in reach: wander a little
      if (g.frame_count > this.wanderUntil || this.wander < 0) {
        this.wander = this.rnd(4);
        this.wanderUntil = g.frame_count + 20 + this.rnd(60);
      }
      if (this.patience > 0) this.patience--;
      const d = [[-1, 0], [0, -1], [1, 0], [0, 1]][this.wander];
      const nx = mx + d[0], ny = my + d[1];
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && walk[idx(nx, ny)] && danger[idx(nx, ny)] >= INF) return this.go(me, [idx(nx, ny)], true);
      this.wander = -1;
      return this.go(me, null, true);
    }
    if (path.length === 0 && this.rnd(200) === 0) this.patience = 30;
    return this.go(me, path, true);
  }

  /** keys that walk the first step of the path (tiles after the current one) */
  private go(me: Bomber, path: number[] | null, align: boolean): Keys {
    const x = me.get_x(), y = me.get_y();
    if (!path || path.length === 0) {
      // stand centred on the tile
      const cx = (((x + 20) / 40) | 0) * 40, cy = (((y + 20) / 40) | 0) * 40;
      if (!align) return NO_KEYS;
      if (Math.abs(cx - x) > 2) return { ...NO_KEYS, left: cx < x, right: cx > x };
      if (Math.abs(cy - y) > 2) return { ...NO_KEYS, up: cy < y, down: cy > y };
      return NO_KEYS;
    }
    const t = path[0];
    const tx = (t % W) * 40, ty = ((t / W) | 0) * 40;
    const dx = tx - x, dy = ty - y;
    if (Math.abs(dx) >= Math.abs(dy)) return { ...NO_KEYS, left: dx < 0, right: dx > 0 };
    return { ...NO_KEYS, up: dy < 0, down: dy > 0 };
  }

  /** would a bomb here hit a box or another player? */
  private worth(g: Game, me: Bomber, mx: number, my: number): boolean {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      for (let i = 1; i <= me.power; i++) {
        const t = g.map.get_maptile(mx + dx * i, my + dy * i);
        if (t.type === TileType.BOX && !t.destroyed) return true;
        if (t.blocking || t.has_extra()) break;
        for (const b of g.bomber_objects) {
          if (b !== me && !b.dead && (((b.get_x() + 20) / 40) | 0) === mx + dx * i && (((b.get_y() + 20) / 40) | 0) === my + dy * i) return true;
        }
      }
    }
    return false;
  }
}

/** tiles a bomber may walk onto: not blocking, no hole, no bomb (except the one it stands on) */
function walkable(g: Game, me: Bomber): boolean[] {
  const w: boolean[] = new Array(W * H).fill(false);
  const here = me.get_maptile();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t: MapTile = g.map.maptiles[x][y];
      w[idx(x, y)] = !t.blocking && t.type !== TileType.NONE && !t.vanishing && (!t.bomb || t === here);
    }
  }
  return w;
}

/** seconds until a blast reaches each tile (0: burning now) */
function dangerMap(g: Game): number[] {
  const d: number[] = new Array(W * H).fill(INF);
  const bombs: { x: number; y: number; t: number; power: number }[] = [];
  for (const o of g.objects) {
    if (o.type === ObjType.BOMB) {
      const b = o as Bomb;
      bombs.push({ x: ((b.get_x() + 20) / 40) | 0, y: ((b.get_y() + 20) / 40) | 0, t: b.flying ? 1.5 : Math.max(0, b.detonation_countdown), power: b.power });
    } else if (o.type === ObjType.EXPLOSION) {
      const e = o as Explosion;
      for (let x = e.X - e.l_left; x <= e.X + e.l_right; x++) if (x >= 0 && x < W) d[idx(x, e.Y)] = 0;
      for (let y = e.Y - e.l_up; y <= e.Y + e.l_down; y++) if (y >= 0 && y < H) d[idx(e.X, y)] = 0;
    }
  }
  // chains: a blast that reaches a bomb sets it off a tenth of a second later
  for (let pass = 0; pass < 3; pass++) {
    for (const a of bombs) {
      for (const b of bombs) {
        if (a !== b && reaches(g, a, b.x, b.y)) b.t = Math.min(b.t, a.t + 0.1);
      }
    }
  }
  for (const b of bombs) {
    const mark = (x: number, y: number) => {
      const i = idx(x, y);
      d[i] = Math.min(d[i], b.t);
    };
    mark(b.x, b.y);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      for (let i = 1; i <= b.power; i++) {
        const t = g.map.get_maptile(b.x + dx * i, b.y + dy * i);
        if (t.blocking || t.has_extra() || t === g.map.dummy) break;
        mark(b.x + dx * i, b.y + dy * i);
      }
    }
  }
  return d;
}

function reaches(g: Game, b: { x: number; y: number; power: number }, x: number, y: number): boolean {
  if (b.x === x && b.y === y) return true;
  if (b.x !== x && b.y !== y) return false;
  const dx = Math.sign(x - b.x), dy = Math.sign(y - b.y);
  const n = Math.abs(x - b.x) + Math.abs(y - b.y);
  if (n > b.power) return false;
  for (let i = 1; i < n; i++) {
    const t = g.map.get_maptile(b.x + dx * i, b.y + dy * i);
    if (t.blocking || t.has_extra()) return false;
  }
  return true;
}

/** the danger map with one more bomb */
function withBomb(g: Game, danger: number[], x: number, y: number, power: number): number[] {
  const d = danger.slice();
  const t = Math.min(2.5, d[idx(x, y)]);
  d[idx(x, y)] = Math.min(d[idx(x, y)], t);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    for (let i = 1; i <= power; i++) {
      const m = g.map.get_maptile(x + dx * i, y + dy * i);
      if (m.blocking || m.has_extra() || m === g.map.dummy) break;
      const k = idx(x + dx * i, y + dy * i);
      d[k] = Math.min(d[k], t);
    }
  }
  return d;
}

function besideBox(g: Game, x: number, y: number): boolean {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const t = g.map.get_maptile(x + dx, y + dy);
    if (t.type === TileType.BOX && !t.destroyed) return true;
  }
  return false;
}

/**
 * The shortest walk to a tile that `goal` accepts: the tiles after the start, [] if the start is one. A step onto a
 * tile is allowed when it can be walked on and is not burning when we get there (a tile is 0.45 s of walking).
 */
function bfs(walk: boolean[], sx: number, sy: number, goal: (i: number) => boolean, danger: number[],
  stepOk: (i: number) => boolean = () => true): number[] | null {
  const start = idx(sx, sy);
  if (goal(start)) return [];
  const prev = new Int32Array(W * H).fill(-1);
  const dist = new Int32Array(W * H).fill(-1);
  dist[start] = 0;
  const q = [start];
  for (let h = 0; h < q.length; h++) {
    const c = q[h];
    const cx = c % W, cy = (c / W) | 0;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const n = idx(nx, ny);
      if (dist[n] >= 0 || !walk[n]) continue;
      const when = (dist[c] + 1) * 0.45;
      if (danger[n] <= when + 0.5 && danger[n] < INF) continue;
      if (!stepOk(n) && !goal(n)) continue;
      dist[n] = dist[c] + 1;
      prev[n] = c;
      if (goal(n)) {
        const path: number[] = [];
        for (let k = n; k !== start; k = prev[k]) path.unshift(k);
        return path;
      }
      q.push(n);
    }
  }
  return null;
}
