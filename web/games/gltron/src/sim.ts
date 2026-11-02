// GLtron 0.70's game simulation, translated from src/game/engine.c, event.c, game.c and
// computer.c/computer_utilities.c: four lightcycles on a square grid, 20 ms physics steps, the
// original trail/segment collision tests, boosters/wall acceleration and the AI parameter tables.
// The renderer in render.ts reads this state; tests drive it headless.

export interface Settings {
  speed: number;
  gridSize: number;
  eraseCrashed: boolean;
  boosterOn: boolean;
  boosterMin: number;
  boosterMax: number;
  boosterUse: number;
  boosterDecrease: number;
  boosterRegenerate: number;
  wallAccelOn: boolean;
  wallAccelLimit: number;
  wallAccelUse: number;
  wallAccelDecrease: number;
  aiLevel: number;
  fastFinish: boolean;
  /** 0 human, 1 computer, 2 none, for the four seats */
  players: number[];
}

export const DEFAULT_SETTINGS: Settings = {
  speed: 8.5,
  gridSize: 720,
  eraseCrashed: true,
  boosterOn: true,
  boosterMin: 1.0,
  boosterMax: 6.5,
  boosterUse: 1.0,
  boosterDecrease: 0.8,
  boosterRegenerate: 0.4,
  wallAccelOn: false,
  wallAccelLimit: 20,
  wallAccelUse: 1,
  wallAccelDecrease: 0.8,
  aiLevel: 2,
  fastFinish: true,
  players: [0, 1, 1, 1],
};

export const PHYSICS_RATE = 20;
export const MAX_TRAIL = 1000;
export const TRAIL_HEIGHT = 3.5;
export const TURN_LENGTH = 200;
export const SPEED_CRASHED = -1;
export const SPEED_GONE = -2;
export const DIRS_X = [0, -1, 0, 1] as const;
export const DIRS_Y = [-1, 0, 1, 0] as const;

export interface Seg { x: number; y: number; dx: number; dy: number }
export interface Vec { x: number; y: number }

/** The original's deterministic trand() LCG (nebu/base/random.c), seeded with 42 at boot. */
export class Rng {
  private seed: number;
  constructor(seed = 42) { this.seed = seed % 2147483647; }
  next(): number {
    // the original's int arithmetic wraps at 32 bits; Math.imul reproduces the product
    let s = Math.imul(48271, this.seed % 44488) - 3399 * Math.trunc(this.seed / 44488);
    if (s < 0) s += 2147483647;
    this.seed = s;
    return this.seed;
  }
}

export interface PlayerData {
  dir: number;
  lastDir: number;
  score: number;
  speed: number;
  booster: number;
  boostEnabled: boolean;
  trailHeight: number;
  expRadius: number;
  turnTime: number;
  trails: Seg[];
  trailOffset: number;
}

export interface AIState {
  active: number;
  tdiff: number;
  lastTime: number;
}

export interface Player {
  data: PlayerData;
  ai: AIState;
  /** 0 human, 1 computer, 2 none */
  kind: number;
}

interface GameEvent {
  player: number;
  type: 'left' | 'right' | 'crash' | 'stop';
}

export interface AI_Parameters {
  minTurnTime: number[];
  maxSegLength: number[];
  critical: number[];
  spiral: number[];
  rlDelta: number[];
}

export const AI_PARAMS: AI_Parameters = {
  minTurnTime: [600, 400, 200, 100],
  maxSegLength: [0.6, 0.3, 0.3, 0.3],
  critical: [0.2, 0.08037, 0.08037, 0.08037],
  spiral: [10, 10, 10, 10],
  rlDelta: [0, 10, 20, 30],
};

export interface AI_Distances { front: number; left: number; right: number; backleft: number }

const FLT_MAX = 1e9;

/** segment2_Intersect() from nebu/base/vector.c. */
export function intersect(s1: Seg, s2: Seg): { p: Vec; t1: number; t2: number } | null {
  const parallel = Math.abs(s1.dx * -s2.dy + s1.dy * s2.dx) < 0.1;
  if (parallel) {
    // segment2_IntersectParallel: if s1's start lies on s2, t1 = 0; otherwise use s2's
    // endpoints on s1, and reject when the overlap is behind s1.
    const t2 = findT(s2, s1.x, s1.y);
    if (t2 !== null && t2 >= 0 && t2 <= 1) return { p: { x: s1.x, y: s1.y }, t1: 0, t2 };
    const t1a = findT(s1, s2.x, s2.y);
    if (t1a === null || t1a < 0) return null;
    const t1b = findT(s1, s2.x + s2.dx, s2.y + s2.dy);
    if (t1b === null) return null;
    const t1 = Math.min(t1a, t1b);
    if (t1 > 1 && Math.max(t1a, t1b) > 1) return null;
    const p = { x: s1.x + t1 * s1.dx, y: s1.y + t1 * s1.dy };
    return { p, t1, t2: t1a === t1 ? 0 : 1 };
  }
  const d = s1.dx * s2.dy - s1.dy * s2.dx;
  const ex = s2.x - s1.x, ey = s2.y - s1.y;
  const t1 = (ex * s2.dy - ey * s2.dx) / d;
  const t2 = (ex * s1.dy - ey * s1.dx) / d;
  return { p: { x: s1.x + t1 * s1.dx, y: s1.y + t1 * s1.dy }, t1, t2 };
}

function findT(s: Seg, x: number, y: number): number | null {
  // segment2_findT() also rejects points that are not on the line (epsilon 0.001)
  if (Math.abs(s.dx) > Math.abs(s.dy)) {
    if (s.dx === 0) return null;
    const t = (x - s.x) / s.dx;
    if (Math.abs(y - (s.y + t * s.dy)) > 0.001) return null;
    return t;
  }
  if (s.dy === 0) return null;
  const t = (y - s.y) / s.dy;
  if (Math.abs(x - (s.x + t * s.dx)) > 0.001) return null;
  return t;
}

function normalize(x: number, y: number): Vec {
  const l = Math.hypot(x, y);
  return l ? { x: x / l, y: y / l } : { x: 0, y: 0 };
}

export class GltronGame {
  settings: Settings;
  players: Player[];
  walls: Seg[] = [];
  time = 0;
  lastFrame = 0;
  running = 0;
  winner = -1;
  finished = false;
  paused = false;
  /** events from the last substep, still to be handled like the original's queue */
  private events: GameEvent[] = [];
  private rng: Rng;
  /** every input turn is queued, as the original's input handlers do */
  private queuedTurns: { player: number; type: 'left' | 'right' }[] = [];

  constructor(settings: Partial<Settings> = {}, rng: Rng = new Rng()) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings, players: settings.players ?? DEFAULT_SETTINGS.players.slice() };
    this.rng = rng;
    this.players = Array.from({ length: 4 }, () => ({
      kind: 2,
      ai: { active: 2, tdiff: 0, lastTime: 0 },
      data: this.emptyData(),
    }));
    this.resetRound();
  }

  private emptyData(): PlayerData {
    return {
      dir: 0, lastDir: 0, score: 0, speed: SPEED_GONE, booster: 0, boostEnabled: false,
      trailHeight: 0, expRadius: 0, turnTime: 0, trails: Array.from({ length: MAX_TRAIL }, () => ({ x: 0, y: 0, dx: 0, dy: 0 })), trailOffset: 0,
    };
  }

  /** resetPlayerData() and initWalls(): a new round at the current scores. */
  resetRound(): void {
    const start = [
      [0.5, 0.25], [0.75, 0.5], [0.5, 0.75], [0.25, 0.5],
    ];
    const perm = [0, 1, 2, 3];
    for (let i = 0; i < 3; i++) {
      const t = 3 - i;
      const s = this.rng.next() % (t + 1);
      [perm[t], perm[s]] = [perm[s], perm[t]];
    }
    let notPlaying = 0;
    for (let i = 0; i < 4; i++) {
      const p = this.players[i];
      const d = p.data;
      p.kind = this.settings.players[i] ?? 2;
      p.ai.active = p.kind;
      p.ai.tdiff = 0;
      d.dir = this.rng.next() & 3;
      d.lastDir = d.dir;
      d.trailOffset = 0;
      d.trails[0].x = start[perm[i]][0] * this.settings.gridSize;
      d.trails[0].y = start[perm[i]][1] * this.settings.gridSize;
      d.trails[0].dx = 0;
      d.trails[0].dy = 0;
      d.turnTime = 0;
      d.expRadius = 0;
      if (p.kind !== 2) {
        d.speed = this.settings.speed;
        d.booster = this.settings.boosterMax;
        d.boostEnabled = false;
        d.trailHeight = TRAIL_HEIGHT;
      } else {
        d.speed = SPEED_GONE;
        d.trailHeight = 0;
        notPlaying++;
      }
    }
    this.running = 4 - notPlaying;
    this.time = 0;
    this.winner = -1;
    this.finished = false;
    this.paused = false;
    this.events = [];
    this.walls = [
      { x: 0, y: 0, dx: this.settings.gridSize, dy: 0 },
      { x: this.settings.gridSize, y: 0, dx: 0, dy: this.settings.gridSize },
      { x: this.settings.gridSize, y: this.settings.gridSize, dx: -this.settings.gridSize, dy: 0 },
      { x: 0, y: this.settings.gridSize, dx: 0, dy: -this.settings.gridSize },
    ];
  }

  position(i: number): Vec {
    const d = this.players[i].data;
    const s = d.trails[d.trailOffset];
    return { x: s.x + s.dx, y: s.y + s.dy };
  }

  /** keyGame() creates turn events; they are handled on the next physics step. */
  turn(player: number, direction: 'left' | 'right'): void {
    if (this.players[player].data.speed > 0) this.queuedTurns.push({ player, type: direction });
  }

  boost(player: number, on: boolean): void {
    const d = this.players[player].data;
    if (!on) { d.boostEnabled = false; return; }
    if (d.booster > this.settings.boosterMin) d.boostEnabled = true;
  }

  /** Game_Idle(): dt is the frame time in ms; physics runs in PHYSICS_RATE chunks. */
  update(dt: number): void {
    if (this.paused || this.finished) return;
    this.time += dt;
    // Game_Idle's fast-finish factor: computer-only games run faster; a human or an
    // unfinished human explosion keeps the normal rate.
    let factor = 1;
    if (this.settings.fastFinish) {
      const thresholds = [0, 300, 600, 800], factors = [4, 6, 12, 25];
      for (let i = 0; i < 4; i++) if (this.settings.gridSize > thresholds[i]) factor = factors[i];
      for (let i = 0; i < 4; i++) if (this.players[i].ai.active !== 1 && this.players[i].data.expRadius < 30) factor = 1;
    }
    let remaining = dt * factor;
    let guard = 0;
    while (remaining > 0 && guard++ < 500) {
      const t = Math.min(remaining, PHYSICS_RATE);
      this.doAI();
      for (const q of this.queuedTurns) this.events.push({ player: q.player, type: q.type });
      this.queuedTurns = [];
      this.processEvents();
      if (this.finished) return;
      this.doMovement(t);
      remaining -= PHYSICS_RATE;
    }
  }

  private processEvents(): void {
    const events = this.events;
    this.events = [];
    for (const e of events) {
      if (e.type === 'left' || e.type === 'right') {
        const d = this.players[e.player].data;
        this.newTrail(d);
        d.lastDir = d.dir;
        d.dir = (d.dir + (e.type === 'left' ? 3 : 1)) % 4;
        d.turnTime = this.time;
      } else if (e.type === 'crash') {
        this.crashPlayer(e.player);
      } else {
        this.winner = e.player;
        this.finished = true;
      }
    }
  }

  private newTrail(d: PlayerData): void {
    const last = d.trails[d.trailOffset];
    const x = last.x + last.dx, y = last.y + last.dy;
    d.trailOffset++;
    if (d.trailOffset >= d.trails.length) d.trailOffset = d.trails.length - 1;
    const s = d.trails[d.trailOffset];
    s.x = x; s.y = y; s.dx = 0; s.dy = 0;
  }

  private crashPlayer(i: number): void {
    const d = this.players[i].data;
    d.speed = SPEED_CRASHED;
    for (let j = 0; j < 4; j++) if (j !== i && this.players[j].data.speed > 0) this.players[j].data.score++;
  }

  private doMovement(dt: number): void {
    for (let i = 0; i < 4; i++) {
      const d = this.players[i].data;
      if (d.speed > 0) {
        let deccel = 0;
        if (this.settings.wallAccelOn) {
          if (!this.applyWallAcceleration(i, dt)) deccel = this.settings.wallAccelDecrease;
          else deccel = -1;
        }
        if (this.settings.boosterOn) {
          if (!this.applyBooster(i, dt) && deccel !== -1) deccel = Math.max(this.settings.boosterDecrease, deccel);
          else deccel = -1;
        }
        if (deccel > 0) this.applyDeceleration(i, dt, deccel);

        const fs = 1 - 0.09 + 0.09 * Math.cos((i * Math.PI) / 4 + ((this.time % 1200) * 2 * Math.PI) / 1200);
        const t = (dt / 100) * d.speed * fs;
        const current = d.trails[d.trailOffset];
        const pos = this.position(i);
        const movement: Seg = { x: pos.x, y: pos.y, dx: t * DIRS_X[d.dir], dy: t * DIRS_Y[d.dir] };
        current.dx += t * DIRS_X[d.dir];
        current.dy += t * DIRS_Y[d.dir];
        // crashTestPlayers() always returns 0 in the original (a shadowed int); the wall test
        // therefore always runs, and both can queue a crash event in one substep.
        this.crashTestPlayers(i, movement);
        this.crashTestWalls(i);
      } else {
        if (this.settings.eraseCrashed && d.trailHeight > 0) d.trailHeight -= (dt * TRAIL_HEIGHT) / 1000;
        if (d.trailHeight < 0) d.trailHeight = 0;
        if (d.expRadius < 30) d.expRadius += dt * 0.01;
        else if (d.speed === SPEED_CRASHED) {
          d.speed = SPEED_GONE;
          this.running--;
          if (this.running <= 1) {
            let winner = -1, maxSpeed = SPEED_GONE;
            for (let k = 0; k < 4; k++) {
              if (this.players[k].data.speed >= maxSpeed) { winner = k; maxSpeed = this.players[k].data.speed; }
            }
            this.events.push({ player: winner, type: 'stop' });
          }
        }
      }
    }
  }

  private applyBooster(i: number, dt: number): boolean {
    const d = this.players[i].data;
    if (d.booster > 0 && d.boostEnabled) {
      let boost = (this.settings.boosterUse * dt) / 1000;
      if (boost > d.booster) { boost = d.booster; d.boostEnabled = false; }
      d.speed += boost;
      d.booster -= boost;
      return true;
    }
    const max = this.settings.boosterMax;
    if (d.booster < max) {
      d.booster = Math.min(max, d.booster + (this.settings.boosterRegenerate * dt) / 1000);
    }
    return false;
  }

  private applyDeceleration(i: number, dt: number, factor: number): void {
    const d = this.players[i].data;
    if (d.speed > this.settings.speed) {
      d.speed -= (factor * dt) / 1000;
      if (d.speed < this.settings.speed) d.speed = this.settings.speed;
    }
  }

  private applyWallAcceleration(i: number, dt: number): boolean {
    const d = this.players[i].data;
    const pos = this.position(i);
    const dirLeft = (d.dir + 3) % 4, dirRight = (d.dir + 1) % 4;
    const leftRay: Seg = { x: pos.x, y: pos.y, dx: DIRS_X[dirLeft], dy: DIRS_Y[dirLeft] };
    const rightRay: Seg = { x: pos.x, y: pos.y, dx: DIRS_X[dirRight], dy: DIRS_Y[dirRight] };
    let left = FLT_MAX, right = FLT_MAX;
    for (let j = 0; j < 4; j++) {
      if (j === i || this.players[j].data.trailHeight < TRAIL_HEIGHT) continue;
      for (let k = 0; k < this.players[j].data.trailOffset + 1; k++) {
        const wall = this.players[j].data.trails[k];
        const a = intersect(leftRay, wall), b = intersect(rightRay, wall);
        if (a && a.t1 > 0 && a.t1 < left && a.t2 >= 0 && a.t2 <= 1) left = a.t1;
        if (b && b.t1 > 0 && b.t1 < right && b.t2 >= 0 && b.t2 <= 1) right = b.t1;
      }
    }
    if (left < this.settings.wallAccelLimit || right < this.settings.wallAccelLimit) {
      d.speed += (this.settings.wallAccelUse * dt) / 1000;
      return true;
    }
    return false;
  }

  private crashTestPlayers(i: number, movement: Seg): boolean {
    const d = this.players[i].data;
    const current = d.trails[d.trailOffset];
    for (let j = 0; j < 4; j++) {
      if (this.players[j].data.trailHeight < TRAIL_HEIGHT) continue;
      for (let k = 0; k < this.players[j].data.trailOffset + 1; k++) {
        if (j === i && k >= d.trailOffset - 1) break;
        const hit = intersect(movement, this.players[j].data.trails[k]);
        if (hit && hit.t1 >= 0 && hit.t1 <= 1 && hit.t2 >= 0 && hit.t2 <= 1) {
          current.dx = hit.p.x - current.x;
          current.dy = hit.p.y - current.y;
          this.events.push({ player: i, type: 'crash' });
          return true;
        }
      }
    }
    return false;
  }

  private crashTestWalls(i: number): boolean {
    const d = this.players[i].data;
    const current = d.trails[d.trailOffset];
    for (const wall of this.walls) {
      const hit = intersect(current, wall);
      if (hit && hit.t1 >= 0 && hit.t1 < 1 && hit.t2 >= 0 && hit.t2 < 1) {
        current.dx = hit.p.x - current.x;
        current.dy = hit.p.y - current.y;
        this.events.push({ player: i, type: 'crash' });
        return true;
      }
    }
    return false;
  }

  // ---- AI: computer.c / computer_utilities.c ----

  private doAI(): void {
    for (let i = 0; i < 4; i++) {
      if (this.players[i].ai.active !== 1 || this.players[i].data.speed <= 0) continue;
      const distances = this.aiGetDistances(i);
      const { opponent, distance } = this.aiClosestOpponent(i);
      if (opponent === -1 || distance > 0.2 * this.settings.gridSize || distances.front < distance
        || this.players[opponent].ai.active === 1 || this.settings.aiLevel === 0) {
        this.doComputerSimple(i, distances);
      } else {
        this.doComputerActive(i, opponent, distances);
      }
    }
  }

  private aiClosestOpponent(player: number): { opponent: number; distance: number } {
    const p = this.position(player);
    let opponent = -1, distance = FLT_MAX;
    for (let i = 0; i < 4; i++) {
      if (i === player || this.players[i].data.speed <= 0) continue;
      const q = this.position(i);
      const d = Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
      if (d < distance) { opponent = i; distance = d; }
    }
    return { opponent, distance };
  }

  private rayDistances(player: number): AI_Distances {
    const data = this.players[player].data;
    const pos = this.position(player);
    const dl = (data.dir + 3) % 4, dr = (data.dir + 1) % 4;
    const back = normalize(DIRS_X[dl] - DIRS_X[data.dir], DIRS_Y[dl] - DIRS_Y[data.dir]);
    const rays: Seg[] = [
      { x: pos.x, y: pos.y, dx: DIRS_X[data.dir], dy: DIRS_Y[data.dir] },
      { x: pos.x, y: pos.y, dx: DIRS_X[dl], dy: DIRS_Y[dl] },
      { x: pos.x, y: pos.y, dx: DIRS_X[dr], dy: DIRS_Y[dr] },
      { x: pos.x, y: pos.y, dx: back.x, dy: back.y },
    ];
    const out = [FLT_MAX, FLT_MAX, FLT_MAX, FLT_MAX];
    const test = (wall: Seg) => {
      for (let r = 0; r < 4; r++) {
        const hit = intersect(rays[r], wall);
        if (hit && hit.t1 > 0 && hit.t1 < out[r] && hit.t2 >= 0 && hit.t2 <= 1) out[r] = hit.t1;
      }
    };
    for (let i = 0; i < 4; i++) {
      if (this.players[i].data.trailHeight < TRAIL_HEIGHT) continue;
      for (let j = 0; j < this.players[i].data.trailOffset + 1; j++) {
        if (i === player && j === this.players[i].data.trailOffset) break;
        test(this.players[i].data.trails[j]);
      }
    }
    for (const w of this.walls) test(w);
    return { front: out[0], left: out[1], right: out[2], backleft: out[3] };
  }

  private aiGetDistances(player: number): AI_Distances {
    return this.rayDistances(player);
  }

  private doComputerSimple(player: number, dist: AI_Distances): void {
    const data = this.players[player].data;
    const ai = this.players[player].ai;
    const level = this.settings.aiLevel;
    data.boostEnabled = false;
    if (this.time - ai.lastTime < AI_PARAMS.minTurnTime[level]) return;
    if (dist.front > AI_PARAMS.critical[level] * this.settings.gridSize
      && Math.hypot(data.trails[data.trailOffset].dx, data.trails[data.trailOffset].dy)
        < AI_PARAMS.maxSegLength[level] * this.settings.gridSize) return;
    if (dist.front > dist.right && dist.front > dist.left) return;
    else if (dist.left > AI_PARAMS.rlDelta[level] && Math.abs(dist.right - dist.left) < AI_PARAMS.rlDelta[level]
      && dist.backleft > dist.left && ai.tdiff < AI_PARAMS.spiral[level]) {
      this.events.push({ player, type: 'left' }); ai.tdiff++;
    } else if (dist.right > dist.left && ai.tdiff > -AI_PARAMS.spiral[level]) {
      this.events.push({ player, type: 'right' }); ai.tdiff--;
    } else if (dist.right < dist.left && ai.tdiff < AI_PARAMS.spiral[level]) {
      this.events.push({ player, type: 'left' }); ai.tdiff++;
    } else if (ai.tdiff > 0) {
      this.events.push({ player, type: 'right' }); ai.tdiff--;
    } else {
      this.events.push({ player, type: 'left' }); ai.tdiff++;
    }
    ai.lastTime = this.time;
  }

  private doComputerActive(player: number, target: number, dist: AI_Distances): void {
    const ai = this.players[player].ai;
    const data = this.players[player].data;
    if (this.time - ai.lastTime < 200) return;
    const config = this.aiConfig(player, target);
    if ([0, 7, 1, 6].includes(config.location)) {
      if (config.tPlayer < config.tOpponent) {
        if (config.tPlayer - config.tOpponent < 0.5) data.boostEnabled = true;
        if (data.speed - this.players[target].data.speed < 1.0) data.boostEnabled = true;
        this.aiAction(this.aggressiveAction, config.location, player, target, dist);
      } else if (config.tOpponent < 0.8) {
        this.aiAction(this.evasiveAction, config.location, player, target, dist);
      } else if (config.tOpponent - config.tPlayer < 0.5) {
        data.boostEnabled = true;
        this.aiAction(this.aggressiveAction, config.location, player, target, dist);
      } else {
        this.aiAction(this.evasiveAction, config.location, player, target, dist);
      }
    } else {
      this.doComputerSimple(player, dist);
    }
  }

  private readonly aggressiveAction = [
    [2, 0, 2, 2], [0, 1, 1, 2], [0, 1, 1, 2], [0, 1, 1, 2],
    [0, 2, 2, 1], [0, 2, 2, 1], [0, 2, 2, 1], [1, 1, 1, 0],
  ];
  private readonly evasiveAction = [
    [1, 1, 2, 2], [1, 1, 2, 0], [1, 1, 2, 0], [1, 1, 2, 0],
    [2, 0, 1, 1], [2, 0, 1, 1], [2, 0, 1, 1], [2, 2, 1, 1],
  ];

  private aiAction(table: number[][], location: number, player: number, target: number, dist: AI_Distances): void {
    const dirdiff = (4 + this.players[player].data.dir - this.players[target].data.dir) % 4;
    const action = table[location][dirdiff];
    if (action === 1) this.aiLeft(player, dist);
    else if (action === 2) this.aiRight(player, dist);
  }

  private aiLeft(player: number, dist: AI_Distances): void {
    const d = this.players[player].data;
    const level = this.settings.aiLevel;
    const save = (AI_PARAMS.minTurnTime[level] * d.speed) / 1000 + 20;
    if (dist.left > save) {
      this.events.push({ player, type: 'left' });
      this.players[player].ai.tdiff++;
      this.players[player].ai.lastTime = this.time;
    }
  }

  private aiRight(player: number, dist: AI_Distances): void {
    const d = this.players[player].data;
    const level = this.settings.aiLevel;
    const save = (AI_PARAMS.minTurnTime[level] * d.speed) / 1000 + 20;
    if (dist.right > save) {
      this.events.push({ player, type: 'right' });
      this.players[player].ai.tdiff--;
      this.players[player].ai.lastTime = this.time;
    }
  }

  private aiConfig(player: number, target: number): { location: number; tPlayer: number; tOpponent: number } {
    const p = this.position(player), q = this.position(target);
    const pd = this.players[player].data, qd = this.players[target].data;
    const pv = { x: DIRS_X[pd.dir] * pd.speed, y: DIRS_Y[pd.dir] * pd.speed };
    const qv = { x: DIRS_X[qd.dir] * qd.speed, y: DIRS_Y[qd.dir] * qd.speed };
    const diff = { x: p.x - q.x, y: p.y - q.y };
    const v1 = normalize(diff.x, diff.y);
    const v2 = normalize(qv.x, qv.y);
    const cross = v1.x * v2.y - v1.y * v2.x;
    const dot = Math.max(-1, Math.min(1, v1.x * v2.x + v1.y * v2.y));
    let phi = Math.acos(dot);
    if (cross > 0) phi = 2 * Math.PI - phi;
    let location = 0;
    for (let i = 0; i < 8; i++) {
      phi -= Math.PI / 4;
      if (phi < 0) { location = i; break; }
    }
    const seg1: Seg = { x: q.x, y: q.y, dx: qv.x, dy: qv.y };
    const ortho = normalize(qv.y, -qv.x);
    const pend = Math.hypot(pv.x, pv.y);
    const seg2: Seg = { x: p.x, y: p.y, dx: ortho.x * pend, dy: ortho.y * pend };
    const hit = intersect(seg1, seg2);
    let tPlayer = hit?.t2 ?? 0;
    const tOpponent = hit?.t1 ?? 0;
    if (tPlayer < 0) tPlayer *= -1;
    return { location, tPlayer, tOpponent };
  }
}
