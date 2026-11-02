// Sopwith's game simulation: a direct port of the 10 Hz flight model, the
// 8.8 fixed-point movement, shots/bombs/missiles/starbursts, targets, birds,
// flocks, oxen, balloons, collisions, scoring/medals and the computer pilot.
// Formulas and constants come from src/swmove.c, swinit.c, swcollsn.c,
// swauto.c and swend.c; the world is the original 320x200 one.
import type { LevelObject } from './assets/level.ts';
import { type Sprites, type Sym, type SymSet, PIXEL } from './video.ts';
import type { Mission } from './mission.ts';

export const MAX_Y = 200;
export const MIN_SPEED = 4;
export const MAX_SPEED = 8;
export const MAX_THROTTLE = 4;
export const MAXCRCOUNT = 10;
export const FALLCOUNT = 10;
export const STALLCOUNT = 6;
export const TARGHITCOUNT = 10;
export const MAXROUNDS = 200;
export const MAXBOMBS = 5;
export const MAXMISSILES = 5;
export const MAXBURSTS = 5;
export const MAXFUEL = 9000;
export const MAXCRASH = 5;
export const MAX_PLANES = 16;
export const BULSPEED = 10;
export const BULLIFE = 10;
export const BOMBLIFE = 5;
export const MISSLIFE = 50;
export const BURSTLIFE = 20;
export const EXPLLIFE = 3;
export const SMOKELIFE = 10;
export const BIRDLIFE = 4;
export const FLOCKLIFE = 5;
export const NEAR = 150 * 150;
export const CLOSE = 32;
export const HOME = 16;
export const SAFERESET = 32;
export const QUIT = -5000;

export const K_ACCEL = 0x0001;
export const K_DEACC = 0x0002;
export const K_FLAPU = 0x0004;
export const K_FLAPD = 0x0008;
export const K_FLIP = 0x0010;
export const K_SHOT = 0x0020;
export const K_HARRYKEYS = 0x0040;
export const K_BOMB = 0x0100;
export const K_HOME = 0x0200;
export const K_SOUND = 0x0400;
export const K_BREAK = 0x0800;
export const K_MISSILE = 0x1000;
export const K_STARBURST = 0x2000;

export type Mode = 'novice' | 'expert' | 'computer' | 'local' | 'online';
export type ObjType = 'plane' | 'shot' | 'bomb' | 'target' | 'explosion' | 'smoke'
  | 'flock' | 'bird' | 'ox' | 'missile' | 'starburst' | 'balloon' | 'ground';
export type ObjState = 'waiting' | 'flying' | 'wounded' | 'crashed' | 'falling'
  | 'standing' | 'stalled' | 'woundstall' | 'finished';

export interface Obj {
  id: number;
  type: ObjType;
  state: ObjState;
  x: number;
  y: number;
  dx: number;
  dy: number;
  lx: number;
  ly: number;
  ldx: number;
  ldy: number;
  angle: number;
  orient: number;
  speed: number;
  accel: number;
  flaps: number;
  rounds: number;
  bombs: number;
  missiles: number;
  bursts: number;
  life: number;
  hitcount: number;
  bdelay: number;
  mdelay: number;
  bsdelay: number;
  faction: number;
  clr: number;
  owner: Obj | null;
  target: Obj | null;
  missileTarget: Obj | null;
  firing: Obj | null;
  mfiring: Obj | null;
  bombing: boolean;
  bfiring: boolean;
  plrnum: number;
  isComputer: boolean;
  athome: boolean;
  home: boolean;
  onmap: boolean;
  origX: number;
  origY: number;
  territoryL: number;
  territoryR: number;
  symbol: Sym | null;
  symset?: SymSet[];
  transform: number;
  typeName: string;
  orientType: number;
  score: number;
  crashcnt: number;
  medals: number[];
  ribbons: number[];
  planekills: number;
  killscore: number;
  valour: number;
  landings: number;
  combatwound: boolean;
  flightPlanekills: number;
  flightKillscore: number;
  flightValour: number;
  endstatus: 'playing' | 'winner' | 'loser';
  goingsun: boolean;
  endcount: number;
  dead: boolean;
}

export interface CarryStats {
  score: number;
  medals: number[];
  ribbons: number[];
  planekills: number;
  valour: number;
  landings: number;
}

export interface GameOptions {
  humanSeats?: number;
  seed?: number;
  gamenum?: number;
  carryScore?: number;
  carryStats?: CarryStats | null;
  wounded?: boolean;
  animals?: boolean;
  missiles?: boolean;
  bigExplosions?: boolean;
  harryKeys?: boolean;
}

const SINTAB = [0, 98, 181, 237, 256, 237, 181, 98, 0, -98, -181, -237, -256, -237, -181, -98];
const GRAVITY = [0, -1, -2, -3, -4, -3, -2, -1, 0, 1, 2, 3, 4, 3, 2, 1];
const COS = (a: number): number => SINTAB[(a + 4) & 15] ?? 0;
const SIN = (a: number): number => SINTAB[a & 15] ?? 0;

export function inRange(min: number, value: number, max: number): boolean {
  return value >= min && value <= max;
}
export function clampRange(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
export function range(x: number, y: number, ax: number, ay: number): number {
  let dy = Math.abs(y - ay);
  dy += dy >> 1;
  let dx = Math.abs(x - ax);
  if (dx < 125 && dy < 125) return dx * dx + dy * dy;
  if (dx < dy) { const t = dx; dx = dy; dy = t; }
  return -((7 * dx + (dy << 2)) >> 3);
}
export function isrange(x: number, y: number, ax: number, ay: number): number {
  let dy = Math.abs(y - ay);
  dy += dy >> 1;
  let dx = Math.abs(x - ax);
  if (dx > 100 || dy > 100) return -1;
  if (dx < dy) { const t = dx; dx = dy; dy = t; }
  return Math.trunc((7 * dx + 4 * dy) / 8);
}

const TARGET_NAMES = [
  'TARGET_HANGAR', 'TARGET_FACTORY', 'TARGET_OIL_TANK', 'TARGET_TANK', 'TARGET_TRUCK',
  'TARGET_TANKER_TRUCK', 'TARGET_FLAG', 'TARGET_TENT', 'TARGET_CUSTOM1', 'TARGET_CUSTOM2',
  'TARGET_CUSTOM3', 'TARGET_CUSTOM4', 'TARGET_CUSTOM5', 'TARGET_CUSTOM_PASSIVE1',
  'TARGET_CUSTOM_PASSIVE2', 'TARGET_CUSTOM_PASSIVE3', 'TARGET_CUSTOM_PASSIVE4',
  'TARGET_CUSTOM_PASSIVE5', 'TARGET_RADIO_TOWER', 'TARGET_WATER_TOWER',
];
const TARGET_AGGRESSION = [2, 2, 2, 2, 5, 5, 0, 0, 2, 2, 2, 5, 5, 0, 0, 0, 0, 0, 0, 0];
const CRTDEPTH = [1, 2, 2, 3, 3, 2, 2, 1];
const BIRD_X = [8, 3, 0, 6, 7, 14, 10, 12];
const BIRD_Y = [16, 1, 8, 3, 12, 10, 7, 14];
const BIRD_DX = [-2, 2, -3, 3, -1, 1, 0, 0];
const BIRD_DY = [-1, -2, -1, -2, -1, -2, -1, -2];
function transformIndex(name: string | null | undefined): number {
  const names = ['TRANSFORM_NONE', 'TRANSFORM_ROTATE90', 'TRANSFORM_ROTATE180',
    'TRANSFORM_ROTATE270', 'TRANSFORM_FLIP', 'TRANSFORM_FLIP_ROTATE90',
    'TRANSFORM_MIRROR', 'TRANSFORM_MIRROR_ROTATE90'];
  const i = names.indexOf(name ?? 'TRANSFORM_NONE');
  return i < 0 ? 0 : i;
}

function factionIndex(name: string): number {
  const names = ['FACTION_NONE', 'FACTION_PLAYER1', 'FACTION_PLAYER2', 'FACTION_PLAYER3',
    'FACTION_PLAYER4', 'FACTION_PLAYER5', 'FACTION_PLAYER6', 'FACTION_PLAYER7', 'FACTION_PLAYER8'];
  const i = names.indexOf(name);
  return i < 0 ? 0 : i;
}

let nextId = 1;

export class SopwithGame {
  readonly mode: Mode;
  readonly mission: Mission;
  readonly sprites: Sprites;
  readonly objects: Obj[] = [];
  readonly planes: Obj[] = [];
  readonly players: Obj[] = [];
  readonly numtarg = new Array<number>(9).fill(0);
  readonly ground: Int16Array;
  readonly baseGround: Int16Array;
  readonly humanSeats: number;
  readonly options: Required<Omit<GameOptions, 'carryScore' | 'carryStats' | 'seed' | 'humanSeats' | 'gamenum'>>;
  gamenum: number;
  countmove = 0;
  over: 'win' | 'lose' | null = null;
  winnerSeat = -1;
  message = '';
  messageTime = 0;
  successfulFlight = false;
  courseadj = 0;
  readonly splats: { x: number; y: number; clr: number; sym: Sym | null }[] = [];
  oxSplatted = false;
  private splatSeed = 74917777;
  private explseed: number;
  private lastGroundTime = 0;
  private readonly gmaxspeed: number;
  private readonly gminspeed: number;
  private readonly targrnge: number;

  constructor(mode: Mode, mission: Mission, options: GameOptions = {}) {
    this.mode = mode;
    this.mission = mission;
    this.sprites = mission.sprites;
    this.humanSeats = options.humanSeats ?? (mode === 'local' || mode === 'online' ? 2 : 1);
    this.gamenum = options.gamenum ?? 0;
    this.options = {
      wounded: options.wounded ?? false,
      animals: options.animals ?? true,
      missiles: options.missiles ?? false,
      bigExplosions: options.bigExplosions ?? true,
      harryKeys: options.harryKeys ?? false,
    };
    let seed = (options.seed ?? 0x4d595df4) >>> 0;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    this.explseed = seed & 0xffff;
    this.baseGround = Int16Array.from(mission.ground);
    this.ground = Int16Array.from(mission.ground);
    this.gmaxspeed = MAX_SPEED + this.gamenum;
    this.gminspeed = MIN_SPEED + this.gamenum;
    let tr = 150;
    if (this.gamenum < 6) tr -= 15 * (6 - this.gamenum);
    this.targrnge = tr * tr;
    this.spawnLevel(options.carryScore ?? 0);
    const p1 = this.players[0];
    if (p1 && options.carryStats) {
      p1.score = options.carryStats.score;
      p1.medals = [...options.carryStats.medals];
      p1.ribbons = [...options.carryStats.ribbons];
      p1.planekills = options.carryStats.planekills;
      p1.valour = options.carryStats.valour;
      p1.landings = options.carryStats.landings;
    }
  }

  // ---------------------------------------------------------------- setup

  private newObj(type: ObjType, state: ObjState, x: number, y: number,
    faction: number, symbol: Sym | null): Obj {
    return {
      id: nextId++, type, state, x, y, dx: 0, dy: 0, lx: 0, ly: 0, ldx: 0, ldy: 0,
      angle: 0, orient: 0, speed: 0, accel: 0, flaps: 0,
      rounds: MAXROUNDS, bombs: MAXBOMBS, missiles: MAXMISSILES, bursts: MAXBURSTS,
      life: MAXFUEL, hitcount: 0, bdelay: 0, mdelay: 0, bsdelay: 0,
      faction, clr: faction, owner: null, target: null, missileTarget: null,
      firing: null, mfiring: null, bombing: false, bfiring: false,
      plrnum: -1, isComputer: false, athome: false, home: false, onmap: false,
      origX: x, origY: y, territoryL: 0, territoryR: 0, symbol, transform: 0,
      typeName: '', orientType: 0, score: 0, crashcnt: 0, medals: [], ribbons: [],
      planekills: 0, killscore: 0, valour: 0, landings: 0, combatwound: false,
      flightPlanekills: 0, flightKillscore: 0, flightValour: 0,
      endstatus: 'playing', goingsun: false, endcount: 0, dead: false,
    };
  }

  private mapFaction(name: string): number {
    const f = factionIndex(name);
    if (f === 3) return this.mode === 'online' ? 1 : 2;
    if (f === 1 || f === 5 || f === 7) return 1;
    if (f === 2 || f === 4 || f === 6 || f === 8) return 2;
    return 0;
  }

  private spawnLevel(carryScore: number): void {
    const specs = this.mission.objects;
    const planeSpecs = specs.filter((o) => o.type === 'PLANE');
    const p1 = planeSpecs.find((o) => o.faction === 'FACTION_PLAYER1') ?? planeSpecs[0];
    if (!p1) throw new Error('mission has no plane');
    const p1obj = this.addPlane(p1, 1, 0, false);
    p1obj.score = carryScore;
    this.players.push(p1obj);

    const p2 = planeSpecs.find((o) => o.faction === 'FACTION_PLAYER2');
    if (this.humanSeats === 2) {
      const spec: LevelObject = p2 ?? {
        type: 'PLANE', x: p1.x + 60, orient: 1, territoryL: 0, territoryR: 0,
        faction: 'FACTION_PLAYER2', transform: 'TRANSFORM_NONE',
      };
      const p2obj = this.addPlane(spec, 2, 1, false);
      this.players.push(p2obj);
      if (this.mode === 'local') {
        // Local is a browser extra: the map's other planes defend their
        // territories as computer planes, as in the original versus mode.
        for (const o of planeSpecs) {
          if (o === p1 || o === p2) continue;
          this.addPlane(o, 2, 0, true);
        }
      }
    } else {
      // Single player/novice hides every other plane; versus computer uses
      // every map plane (including the P2 plane) as an enemy.
      if (this.mode === 'computer') {
        for (const o of planeSpecs) {
          if (o === p1) continue;
          this.addPlane(o, 2, 0, true);
        }
        if (this.planes.length === 1) {
          this.addPlane({
            type: 'PLANE', x: p1.x + 60, orient: 1, territoryL: 0, territoryR: 0,
            faction: 'FACTION_PLAYER2', transform: 'TRANSFORM_NONE',
          }, 2, 0, true);
        }
      } else {
        for (const o of planeSpecs) {
          if (o === p1) continue;
          const ai = this.addPlane(o, 2, 0, true);
          ai.state = 'finished';
          ai.onmap = false;
          ai.dead = true;
        }
      }
    }

    for (const o of specs) {
      if (o.type === 'TARGET') this.addTarget(o);
      else if (o.type === 'OX') this.addOx(o);
      else if (o.type === 'FLOCK') this.addFlock(o);
      else if (o.type === 'BALLOON') this.addBalloon(o);
    }
    // Targets count per faction; make the winner check work even for a map
    // with no targets of a given faction.
    this.planes.forEach((p) => { p.origY = p.y; });
  }

  private addPlane(o: LevelObject, faction: number, seat: number, computer: boolean): Obj {
    let height = 0;
    for (let x = o.x; x <= o.x + 20; x++) height = Math.max(height, this.ground[x] ?? 0);
    const startOrient = o.orient !== 0;
    const p = this.newObj('plane', 'flying', o.x, height + 13, faction,
      this.sprites.plane[0]?.sym[startOrient ? 4 : 0] ?? null);
    p.origY = height + 13;
    p.angle = startOrient ? 8 : 0;
    p.orient = startOrient ? 1 : 0;
    p.athome = true;
    p.onmap = true;
    p.plrnum = computer ? -1 : seat;
    p.isComputer = computer;
    p.transform = transformIndex(o.transform);
    p.orientType = o.orient;
    p.territoryL = o.territoryL;
    p.territoryR = o.territoryR;
    p.symset = this.sprites.plane;
    this.objects.push(p);
    this.planes.push(p);
    return p;
  }

  private addTarget(o: LevelObject): void {
    const frame = clampRange(0, o.orient, 19);
    const set = this.sprites.target[frame];
    const sym = set?.sym[0];
    if (!sym) return;
    let minh = 999, maxh = 0;
    for (let x = o.x; x < o.x + sym.w; x++) {
      minh = Math.min(minh, this.ground[x] ?? 999);
      maxh = Math.max(maxh, this.ground[x] ?? 0);
    }
    const aveh = Math.min(199 - sym.h, Math.trunc((minh + maxh) / 2));
    for (let x = o.x; x < o.x + sym.w; x++) this.ground[x] = aveh;
    const t = this.newObj('target', 'standing', o.x, aveh + sym.h,
      this.mapFaction(o.faction), sym);
    t.orientType = frame;
    t.typeName = TARGET_NAMES[frame] ?? 'TARGET_HANGAR';
    t.transform = transformIndex(o.transform);
    t.symbol = set.sym[t.transform] ?? sym;
    t.onmap = true;
    this.numtarg[t.faction]++;
    this.objects.push(t);
  }

  private addOx(o: LevelObject): void {
    if (this.mode === 'novice' || !this.options.animals) return;
    const ox = this.newObj('ox', 'standing', o.x, (this.ground[o.x] ?? 0) + 16, 0,
      this.sprites.ox[0]?.sym[0] ?? null);
    ox.transform = transformIndex(o.transform);
    ox.orientType = o.orient;
    ox.clr = 1;
    ox.symbol = this.sprites.ox[0]?.sym[ox.transform] ?? null;
    this.objects.push(ox);
  }

  private addFlock(o: LevelObject): void {
    if (this.mode === 'novice' || !this.options.animals) return;
    const f = this.newObj('flock', 'flying', o.x, MAX_Y - 1, 0,
      this.sprites.flock[0]?.sym[0] ?? null);
    f.dx = o.x < this.mission.ground.length / 2 ? 2 : -2;
    f.life = FLOCKLIFE;
    f.clr = 1;
    f.onmap = true;
    f.territoryL = o.territoryL;
    f.territoryR = o.territoryR;
    f.orientType = o.orient;
    this.objects.push(f);
    this.addBird(f, 1);
  }

  private addBird(owner: Obj, i: number): void {
    const b = this.newObj('bird', 'flying',
      owner.x + BIRD_X[i], owner.y - BIRD_Y[i], owner.faction,
      this.sprites.bird[0]?.sym[0] ?? null);
    b.dx = BIRD_DX[i];
    b.dy = BIRD_DY[i];
    b.life = BIRDLIFE;
    b.clr = owner.clr;
    this.objects.push(b);
  }

  private addBalloon(o: LevelObject): void {
    const b = this.newObj('balloon', 'flying', o.x, MAX_Y - 16 + Math.trunc(SIN(o.x) / 32),
      this.mapFaction(o.faction), this.sprites.balloon[0]?.sym[0] ?? null);
    b.life = 1;
    b.orientType = o.orient;
    b.transform = transformIndex(o.transform);
    b.symbol = this.sprites.balloon[0]?.sym[b.transform] ?? null;
    b.onmap = true;
    b.clr = b.faction;
    this.numtarg[b.faction]++;
    this.objects.push(b);
  }

  // ---------------------------------------------------------------- helpers

  get score(): number { return this.players[0]?.score ?? 0; }
  get gmax(): number { return this.gmaxspeed; }
  get gmin(): number { return this.gminspeed; }
  player(i: number): Obj | undefined { return this.players[i]; }
  targetCount(f: number): number { return this.numtarg[f] ?? 0; }

  private symW(o: Obj): number { return o.symbol?.w ?? 1; }
  private symH(o: Obj): number { return o.symbol?.h ?? 1; }
  private moveXY(o: Obj): { x: number; y: number } {
    let pos = (o.x + o.dx) * 65536 + o.lx + o.ldx;
    pos = clampRange(0, pos, (this.mission.ground.length - 10) * 65536);
    o.x = Math.floor(pos / 65536) & 0xffff;
    o.lx = pos & 0xffff;
    const x = o.x;
    pos = (o.y + o.dy) * 65536 + o.ly + o.ldy;
    o.y = Math.floor(pos / 65536) & 0xffff;
    o.ly = pos & 0xffff;
    return { x, y: o.y };
  }

  private setDxDy(o: Obj, dx: number, dy: number): void {
    o.dx = dx >> 8;
    o.lx = (dx << 8) & 0xffff;
    o.dy = dy >> 8;
    o.ly = (dy << 8) & 0xffff;
  }

  private copyObj(o: Obj): Obj {
    return { ...o, medals: o.medals.slice(), ribbons: o.ribbons.slice() };
  }

  private symAngle(o: Obj): number {
    if (o.dx === 0) return o.dy < 0 ? 6 : o.dy > 0 ? 2 : 6;
    if (o.dx > 0) return o.dy < 0 ? 7 : o.dy > 0 ? 1 : 0;
    return o.dy < 0 ? 5 : o.dy > 0 ? 3 : 4;
  }

  private planeIsKilled(s: ObjState): boolean {
    return !(s === 'flying' || s === 'stalled' || s === 'wounded' || s === 'woundstall');
  }
  private planeIsWounded(s: ObjState): boolean { return s === 'wounded' || s === 'woundstall'; }
  private planeIsStalled(s: ObjState): boolean { return s === 'stalled' || s === 'woundstall'; }
  private planeIsFlying(s: ObjState): boolean { return s === 'flying' || s === 'wounded'; }
  private isHuman(o: Obj): boolean { return o.type === 'plane' && o.plrnum >= 0 && o.plrnum < this.humanSeats; }

  private setUpdates(o: Obj): void {
    o.flaps = 0;
    o.bombing = false;
    o.bfiring = false;
    o.firing = null;
    o.mfiring = null;
  }

  // ---------------------------------------------------------------- main tick

  /** One 10 Hz tick. Inputs are the original 16-bit key masks for the human seats. */
  step(inputs: number[]): void {
    if (this.over) return;
    for (const o of this.objects.slice()) {
      if (o.dead) continue;
      switch (o.type) {
        case 'plane': if (this.isHuman(o)) this.movePlyr(o, inputs[o.plrnum] ?? 0); else this.moveComp(o); break;
        case 'shot': this.moveShot(o); break;
        case 'bomb': this.moveBomb(o); break;
        case 'missile': this.moveMissile(o); break;
        case 'starburst': this.moveBurst(o); break;
        case 'target': this.moveTarget(o); break;
        case 'explosion': this.moveExplosion(o); break;
        case 'smoke': this.moveSmoke(o); break;
        case 'flock': this.moveFlock(o); break;
        case 'bird': this.moveBird(o); break;
        case 'balloon': this.moveBalloon(o); break;
        case 'ox': this.moveOx(o); break;
        default: break;
      }
    }
    this.collisions();
    this.objects.splice(0, this.objects.length, ...this.objects.filter((o) => !o.dead));
    this.countmove++;
    if (this.players[0]?.athome) this.lastGroundTime = this.countmove;
    else if (this.countmove - this.lastGroundTime > 80) this.successfulFlight = true;
    if (this.messageTime > 0) this.messageTime--;
  }

  private movePlyr(p: Obj, keys: number): void {
    if (p.endstatus !== 'playing') {
      p.endcount--;
      if (p.endcount <= 0 && !this.over) {
        this.over = p.endstatus === 'winner' ? 'win' : 'lose';
        this.winnerSeat = p.endstatus === 'winner' ? p.plrnum : (this.humanSeats === 2 ? p.plrnum ^ 1 : -1);
      }
      // The winner still flies off; the loser's plane stays.
      if (p.endstatus === 'loser') return;
    }
    if (this.options.harryKeys && p.orient && (keys & (K_FLAPU | K_FLAPD))) {
      keys ^= K_FLAPU | K_FLAPD;
    }
    this.interpret(p, keys);
    if (p.state === 'crashed' && p.hitcount <= 0) {
      if (this.mode !== 'online') p.crashcnt++;
      if (p.endstatus !== 'winner'
        && (p.life <= QUIT || (this.mode !== 'online' && p.crashcnt >= MAXCRASH))) {
        if (p.endstatus === 'playing') this.loser(p);
      } else {
        this.initPlane(p);
        if (p.endstatus === 'winner') this.winner(p);
      }
    }
    this.movePlane(p);
  }

  private interpret(p: Obj, keys: number): void {
    this.setUpdates(p);
    const state = p.state;
    if (this.planeIsKilled(state) && state !== 'falling') return;
    if (state !== 'falling') {
      if (p.endstatus !== 'playing') {
        if (p.endstatus === 'loser' && this.isHuman(p)) this.goHome(p);
        return;
      }
      if (keys & K_BREAK) {
        p.life = QUIT;
        p.home = false;
        if (p.athome) { p.state = 'crashed'; p.hitcount = 0; }
        if (this.isHuman(p)) p.endstatus = 'loser';
      }
      if (keys & K_HOME) {
        if (state === 'flying' || state === 'wounded') p.home = true;
      }
    }
    if (!this.planeIsWounded(state) || (this.countmove & 1) !== 0) {
      if (keys & K_FLAPU) { p.flaps++; p.home = false; }
      if (keys & K_FLAPD) { p.flaps--; p.home = false; }
      if ((keys & K_FLIP) && !p.athome) { p.orient ^= 1; p.home = false; }
      if (keys & K_DEACC) { if (p.accel > 0) p.accel--; p.home = false; }
      if (keys & K_ACCEL) { if (p.accel < MAX_THROTTLE) p.accel++; p.home = false; }
    }
    if ((keys & K_SHOT) && state !== 'finished') p.firing = p;
    if ((keys & K_MISSILE) && state !== 'finished') p.mfiring = p;
    if ((keys & K_BOMB) && state !== 'finished') p.bombing = true;
    if ((keys & K_STARBURST) && state !== 'finished') p.bfiring = true;
    if (p.home) this.goHome(p);
  }

  private moveComp(p: Obj): void {
    this.setUpdates(p);
    if (!p.isComputer) p.isComputer = true;
    if (p.state === 'wounded' || p.state === 'woundstall') {
      if ((this.countmove & 1) === 0) {
        if (p.endstatus !== 'playing') this.goHome(p);
        else this.swauto(p);
      }
    } else if (p.state === 'flying' || p.state === 'stalled') {
      if (p.endstatus !== 'playing') this.goHome(p);
      else this.swauto(p);
    } else if (p.state === 'crashed') {
      p.firing = null;
      if (p.hitcount <= 0 && p.endstatus === 'playing') this.initPlane(p);
    } else {
      p.firing = null;
    }
    this.movePlane(p);
  }

  private stallPlane(p: Obj): void {
    p.ldx = 0; p.ldy = 0; p.orient = 0; p.dx = 0;
    p.angle = (7 * 16) / 8;
    p.speed = 0;
    p.dy = 0;
    p.hitcount = STALLCOUNT;
    p.state = p.state === 'wounded' ? 'woundstall' : 'stalled';
    p.athome = false;
  }

  private movePlane(p: Obj): void {
    let state = p.state;
    switch (state) {
      case 'finished':
      case 'waiting':
        return;
      case 'crashed':
        p.hitcount--;
        break;
      case 'falling':
        p.hitcount -= 2;
        if (p.dy < 0 && p.dx) {
          if ((p.orient !== 0) !== (p.dx < 0)) p.hitcount -= p.flaps;
          else p.hitcount += p.flaps;
        }
        if (p.hitcount <= 0) {
          if (p.dy < 0) {
            if (p.dx < 0) p.dx++;
            else if (p.dx > 0) p.dx--;
            else p.orient ^= 1;
          }
          if (p.dy > -10) p.dy--;
          p.hitcount = FALLCOUNT;
        }
        p.angle = this.symAngle(p) * 2;
        break;
      case 'stalled':
      case 'woundstall': {
        const newState: ObjState = state === 'stalled' ? 'flying' : 'wounded';
        const stalled = p.angle !== (3 * 16) / 4 || p.speed < this.gminspeed;
        if (!stalled) p.state = state = newState;
        if (this.flyControlled(p, stalled)) return;
        break;
      }
      case 'flying':
      case 'wounded': {
        let stalled = p.y >= MAX_Y;
        if (stalled) {
          if (this.mode === 'novice') {
            p.angle = (3 * 16) / 4;
            stalled = false;
          } else {
            this.stallPlane(p);
            state = p.state;
          }
        }
        if (p.goingsun) break;
        if (p.life <= 0 && !p.athome && !this.planeIsKilled(state)) {
          this.hitPlane(p);
          this.scorePlane(p, 'ground');
          this.movePlane(p);
          return;
        }
        if (this.flyControlled(p, stalled)) return;
        break;
      }
      default:
        break;
    }

    this.setPlaneSymbol(p);
    this.moveXY(p);
    if (!inRange(0, p.x, this.mission.ground.length - 16)) {
      p.x = clampRange(0, p.x, this.mission.ground.length - 16);
    }
    if (this.isHuman(p) && this.players[0]?.endstatus === 'playing' && !this.planeIsKilled(p.state)) {
      this.nearPlane(p);
    }
    if (p.bdelay) p.bdelay--;
    if (p.mdelay) p.mdelay--;
    if (p.bsdelay) p.bsdelay--;
    if (this.isHuman(p) && p.athome && p.state === 'flying') this.refuel(p);
    if (inRange(0, p.y, MAX_Y - 1)) {
      if (p.state === 'falling' || this.planeIsWounded(p.state)) this.initSmoke(p);
    }
  }

  private flyControlled(p: Obj, stalledIn: boolean): boolean {
    let stalled = stalledIn;
    if (p.firing) this.initShot(p, null);
    if (p.bombing) this.initBomb(p);
    if (p.mfiring) this.initMissile(p);
    if (p.bfiring) this.initBurst(p);
    let nangle = p.angle;
    let nspeed = p.speed;
    let update = p.flaps;
    if (update) {
      if (p.orient) nangle -= update;
      else nangle += update;
      nangle = (nangle + 16) % 16;
    }
    if ((this.countmove & 3) === 0) {
      if (!stalled && nspeed < this.gminspeed && this.mode !== 'novice') {
        nspeed--;
        update = 1;
      } else {
        const limit = this.gminspeed + p.accel + GRAVITY[nangle];
        if (nspeed < limit) { nspeed++; update = 1; }
        else if (nspeed > limit) { nspeed--; update = 1; }
      }
    }
    if (update) {
      if (p.athome) {
        nspeed = (p.accel || p.flaps) ? this.gminspeed : 0;
      } else if (nspeed <= 0 && !stalled) {
        if (this.mode === 'novice') nspeed = 1;
        else { this.stallPlane(p); this.movePlane(p); return true; }
      }
      p.speed = nspeed;
      p.angle = nangle;
      if (stalled) {
        p.dx = 0; p.ldx = 0; p.ldy = 0; p.dy = -nspeed;
      } else {
        this.setDxDy(p, nspeed * COS(nangle), nspeed * SIN(nangle));
      }
    }
    if (stalled) {
      p.hitcount--;
      if (p.hitcount <= 0) {
        p.orient ^= 1;
        p.angle = ((3 * 16) / 2 - p.angle) % 16;
        p.hitcount = STALLCOUNT;
      }
    }
    if (!p.isComputer) p.life -= p.speed;
    else if (p.life > 100) p.life -= p.speed;
    if (p.speed) p.athome = false;
    return false;
  }

  private setPlaneSymbol(p: Obj): void {
    if (p.endstatus === 'winner' && p.goingsun) {
      const i = Math.max(0, Math.min(this.sprites.planeWin.length - 1, Math.floor(p.endcount / 18)));
      p.symbol = this.sprites.planeWin[i]?.sym[0] ?? p.symbol;
    } else if (p.state === 'finished') {
      p.symbol = null;
    } else if (p.state === 'falling' && !p.dx && p.dy < 0) {
      p.symbol = this.sprites.planeHit[p.orient % 4]?.sym[0] ?? null;
    } else if (p.orient) {
      const a = (16 - p.angle) % 16;
      p.symbol = this.sprites.plane[a % 4]?.sym[4 + Math.floor(a / 4)] ?? null;
    } else {
      p.symbol = this.sprites.plane[p.angle % 4]?.sym[Math.floor(p.angle / 4)] ?? null;
    }
  }

  private nearPlane(ob: Obj): void {
    const obx = ob.x;
    for (const obt of this.planes) {
      if (obt.type !== 'plane' || obt.faction === ob.faction) continue;
      if (!obt.isComputer) continue;
      if (this.mode === 'computer' && !inRange(obt.territoryL, obx, obt.territoryR)) continue;
      const obc = obt.target;
      if (!obc || Math.abs(obx - obt.x) < Math.abs(obc.x - obt.x)) obt.target = ob;
    }
  }

  private goHome(p: Obj): void {
    if (p.athome) return;
    this.courseadj = ((this.countmove & 0x1f) < 16 ? 1 : 0) << 4;
    if (Math.abs(p.x - p.origX) < HOME && Math.abs(p.y - p.origY) < HOME) {
      this.initPlane(p);
      return;
    }
    if (p.state === 'wounded' && (this.countmove & 1)) return;
    this.aim(p, p.origX, p.origY, null, false);
  }

  private refuel(p: Obj): void {
    const top = (counter: number, max: number): number => {
      if (counter === max) return counter;
      if (max < 20) {
        if ((this.countmove % 20) === 0) counter++;
      } else {
        counter += Math.trunc(max / 100);
      }
      return Math.min(counter, max);
    };
    p.life = top(p.life, MAXFUEL);
    p.rounds = top(p.rounds, MAXROUNDS);
    p.bombs = top(p.bombs, MAXBOMBS);
    p.missiles = top(p.missiles, MAXMISSILES);
    p.bursts = top(p.bursts, MAXBURSTS);
  }

  private initPlane(p: Obj): void {
    const wasCrashed = p.state === 'crashed';
    const wasAway = !p.athome && !wasCrashed;
    if (wasAway) this.getAwards(p);
    p.flightPlanekills = 0; p.flightKillscore = 0; p.flightValour = 0; p.combatwound = false;
    p.type = 'plane';
    p.state = 'flying';
    p.x = p.origX;
    p.y = p.origY;
    p.lx = p.ly = p.ldx = p.ldy = 0;
    p.speed = p.flaps = p.accel = p.hitcount = 0;
    p.bdelay = p.mdelay = p.bsdelay = 0;
    p.dx = p.dy = 0;
    p.orient = p.orientType ? 1 : 0;
    p.angle = p.orient ? 8 : 0;
    p.target = null; p.missileTarget = null; p.firing = null; p.mfiring = null;
    p.bombing = false; p.bfiring = false; p.home = false;
    p.symbol = this.sprites.plane[0]?.sym[p.orient ? 4 : 0] ?? null;
    p.athome = true;
    p.onmap = true;
    if (wasCrashed) {
      p.rounds = MAXROUNDS; p.bombs = MAXBOMBS; p.missiles = MAXMISSILES; p.bursts = MAXBURSTS;
      p.life = MAXFUEL;
    }
    p.goingsun = false;
    p.dead = false;
  }

  private hitPlane(p: Obj): void {
    p.ldx = 0; p.ldy = 0;
    p.hitcount = FALLCOUNT;
    p.state = 'falling';
    p.athome = false;
  }

  private crashPlane(p: Obj): void {
    if (p.dx < 0) p.angle = (p.angle + 2) % 16;
    else p.angle = (p.angle + 16 - 2) % 16;
    p.state = 'crashed';
    p.athome = false;
    p.dx = p.dy = p.ldx = p.ldy = p.speed = 0;
    p.hitcount = (Math.abs(p.origX - p.x) < SAFERESET && Math.abs(p.origY - p.y) < SAFERESET)
      ? MAXCRCOUNT * 2 : MAXCRCOUNT;
  }

  // ---------------------------------------------------------------- weapons

  private initShot(owner: Obj, targ: Obj | null): void {
    if (!targ && !owner.isComputer && owner.rounds === 0) return;
    if (this.mode !== 'novice') owner.rounds--;
    const bspeed = BULSPEED + this.gamenum;
    const s = this.newObj('shot', 'flying', 0, 0, owner.faction, PIXEL);
    if (targ) {
      const x = targ.x + (targ.dx << 2);
      const y = targ.y + (targ.dy << 2);
      const dx = x - owner.x;
      const dy = y - owner.y;
      const r = isrange(x, y, owner.x, owner.y);
      if (r < 1) return;
      s.dx = Math.trunc((dx * bspeed) / r);
      s.dy = Math.trunc((dy * bspeed) / r);
    } else {
      const nspeed = owner.speed + bspeed;
      this.setDxDy(s, nspeed * COS(owner.angle), nspeed * SIN(owner.angle));
    }
    s.x = owner.x + Math.trunc(this.symW(owner) / 2);
    s.y = owner.y - Math.trunc(this.symH(owner) / 2);
    s.life = BULLIFE;
    s.owner = owner;
    s.clr = owner.clr;
    s.symbol = PIXEL;
    s.speed = 0;
    if (owner.type === 'balloon') s.y -= 4;
    this.adjustBullet(s, owner);
    this.objects.push(s);
  }

  private adjustBullet(bullet: Obj, src: Obj): void {
    for (let guard = 0; guard < 20; guard++) {
      const nb = this.copyObj(bullet);
      const ns = this.copyObj(src);
      this.moveXY(nb); this.moveXY(ns);
      if (!this.collisionTest(nb, ns)) return;
      if (bullet.dx < 0) bullet.x -= 2; else bullet.x += 2;
      if (bullet.dy < 0) bullet.y -= 2; else bullet.y += 2;
    }
  }

  private initBomb(owner: Obj): void {
    if ((!owner.isComputer && !owner.bombs) || owner.bdelay) return;
    if (this.mode !== 'novice') owner.bombs--;
    owner.bdelay = 10;
    const angle = (owner.angle + (owner.orient ? 4 : 12)) % 16;
    const b = this.newObj('bomb', 'falling',
      owner.x + ((COS(angle) * 10) >> 8) + 4,
      owner.y + ((SIN(angle) * 10) >> 8) - 4, owner.faction,
      this.sprites.bomb[0]?.sym[0] ?? null);
    b.dx = owner.dx;
    b.dy = owner.dy;
    b.life = BOMBLIFE;
    b.owner = owner;
    b.clr = owner.clr;
    this.objects.push(b);
  }

  private initMissile(owner: Obj): void {
    if (owner.mdelay || !owner.missiles || !this.options.missiles) return;
    if (this.mode !== 'novice') owner.missiles--;
    owner.mdelay = 5;
    const angle = owner.angle;
    const m = this.newObj('missile', 'flying',
      owner.x + (COS(angle) >> 4) + 4, owner.y + (SIN(angle) >> 4) - 4,
      owner.faction, this.sprites.missile[0]?.sym[0] ?? null);
    m.angle = angle;
    m.speed = this.gmaxspeed + (this.gmaxspeed >> 1);
    this.setDxDy(m, m.speed * COS(angle), m.speed * SIN(angle));
    m.life = MISSLIFE;
    m.owner = owner;
    m.clr = owner.clr;
    m.missileTarget = owner.mfiring;
    m.orient = 0;
    m.onmap = true;
    this.objects.push(m);
  }

  private initBurst(owner: Obj): void {
    if (owner.bsdelay || !owner.bursts || !this.options.missiles) return;
    owner.bsdelay = 5;
    if (this.mode !== 'novice') owner.bursts--;
    const angle = (owner.angle + (owner.orient ? 6 : 10)) % 16;
    const b = this.newObj('starburst', 'falling',
      owner.x + ((COS(angle) * 10) >> 10) + 4,
      owner.y + ((SIN(angle) * 10) >> 10) - 4, owner.faction,
      this.sprites.burst[0]?.sym[0] ?? null);
    this.setDxDy(b, this.gminspeed * COS(angle), this.gminspeed * SIN(angle));
    b.dx += owner.dx;
    b.dy += owner.dy;
    b.life = BURSTLIFE;
    b.owner = owner;
    b.clr = owner.clr;
    this.objects.push(b);
  }

  private adjustFall(o: Obj): void {
    o.life--;
    if (o.life <= 0) {
      if (o.dy < 0) {
        if (o.dx < 0) o.dx++;
        else if (o.dx > 0) o.dx--;
      }
      if (o.dy > -10) o.dy--;
      o.life = BOMBLIFE;
    }
  }

  private moveShot(o: Obj): void {
    o.life--;
    if (o.life <= 0) { o.dead = true; return; }
    const p = this.moveXY(o);
    const x = p.x;
    const y = p.y;
    if (!inRange(0, x, this.mission.ground.length - 1)
      || !inRange((this.ground[x] ?? 0) + 1, y, MAX_Y - 1)) {
      o.dead = true;
      return;
    }
    o.symbol = PIXEL;
  }

  private moveBomb(o: Obj): void {
    if (o.life < 0) { o.dead = true; return; }
    this.adjustFall(o);
    const p = this.moveXY(o);
    if (p.y < 0 || !inRange(0, p.x, this.mission.ground.length - 1)) { o.dead = true; return; }
    const a = this.symAngle(o);
    o.symbol = this.sprites.bomb[a % 2]?.sym[Math.trunc(a / 2)] ?? o.symbol;
  }

  private moveMissile(o: Obj): void {
    if (o.life < 0) { o.dead = true; return; }
    if (o.state === 'flying') {
      let target = o.missileTarget;
      if (target && target !== o.owner && (o.life & 1)) {
        if (target.missileTarget) target = target.missileTarget;
        this.aim(o, target.x, target.y, null, false);
        o.angle = (o.angle + o.flaps + 16) % 16;
        this.setDxDy(o, o.speed * COS(o.angle), o.speed * SIN(o.angle));
      }
      const p = this.moveXY(o);
      o.life--;
      if (o.life <= 0 || p.y >= (MAX_Y * 3) / 2) { o.state = 'falling'; o.life++; }
    } else {
      this.adjustFall(o);
      o.angle = (o.angle + 1) % 16;
      this.moveXY(o);
    }
    if (!inRange(0, o.x, this.mission.ground.length - 1)) { o.dead = true; return; }
    o.symbol = this.sprites.missile[o.angle % 4]?.sym[Math.trunc(o.angle / 4)] ?? o.symbol;
  }

  private moveBurst(o: Obj): void {
    if (o.life < 0) {
      if (o.owner) o.owner.missileTarget = null;
      o.dead = true;
      return;
    }
    this.adjustFall(o);
    const p = this.moveXY(o);
    if (!inRange(0, p.x, this.mission.ground.length - 1) || p.y <= (this.ground[p.x] ?? 0)) {
      if (o.owner) o.owner.missileTarget = null;
      o.dead = true;
      return;
    }
    if (o.owner) o.owner.missileTarget = o;
    o.symbol = this.sprites.burst[o.life & 1]?.sym[0] ?? o.symbol;
  }

  private moveSmoke(o: Obj): void {
    o.life--;
    const owner = o.owner;
    if (o.life <= 0 || !owner
      || (owner.state !== 'falling' && owner.state !== 'crashed' && !this.planeIsWounded(owner.state))) {
      o.dead = true;
      return;
    }
    o.symbol = PIXEL;
  }

  // ---------------------------------------------------------------- targets and scenery

  private moveTarget(t: Obj): void {
    const old = t.symbol;
    t.firing = null;
    const aggression = TARGET_AGGRESSION[t.orientType] ?? 0;
    if (t.state === 'standing' && this.gamenum > 0 && aggression > 0
      && (this.gamenum > 1 || (this.countmove % aggression) === aggression - 1)) {
      const plane = this.findEnemyPlane(t);
      if (plane) { this.initShot(t, plane); t.firing = plane; }
    }
    t.hitcount = Math.max(0, t.hitcount - 1);
    const set = t.state === 'standing' ? this.sprites.target[t.orientType] : this.sprites.targetHit[t.orientType];
    t.symbol = set?.sym[t.transform] ?? t.symbol;
    const ow = old?.w ?? 0, oh = old?.h ?? 0;
    t.x += Math.trunc((ow - this.symW(t)) / 2);
    t.y -= oh - this.symH(t);
  }

  private findEnemyPlane(t: Obj): Obj | null {
    for (const p of this.planes) {
      if (p.faction === t.faction) continue;
      if (this.mode !== 'online' && this.mode !== 'local' && p.faction !== 1) continue;
      if (this.planeIsKilled(p.state)) continue;
      const r = range(t.x, t.y, p.x, p.y);
      if (inRange(1, r, this.targrnge - 1)) return p;
    }
    return null;
  }

  private moveExplosion(o: Obj): void {
    const orient = o.orient;
    if (o.life < 0) { o.dead = true; return; }
    o.life--;
    if (o.life <= 0) {
      if (o.dy < 0) {
        if (o.dx < 0) o.dx++;
        else if (o.dx > 0) o.dx--;
      }
      if ((orient && o.dy > -10) || (!orient && o.dy > -this.gminspeed)) o.dy--;
      o.life = EXPLLIFE;
    }
    const p = this.moveXY(o);
    if (!inRange(0, p.x, this.mission.ground.length - 1) || p.y <= (this.ground[p.x] ?? 0)) {
      o.dead = true;
      return;
    }
    o.hitcount++;
    o.symbol = this.sprites.debris[orient]?.sym[0] ?? o.symbol;
  }

  private moveFlock(o: Obj): void {
    if (o.life === -1) { o.dead = true; return; }
    o.life--;
    if (o.life <= 0) { o.orient ^= 1; o.life = FLOCKLIFE; }
    if (o.x < o.territoryL) o.dx = Math.abs(o.dx);
    else if (o.x > o.territoryR) o.dx = -Math.abs(o.dx);
    this.moveXY(o);
    o.symbol = this.sprites.flock[o.orient]?.sym[0] ?? o.symbol;
  }

  private moveBalloon(o: Obj): void {
    if (o.life === -1) { o.dead = true; return; }
    if (o.state === 'flying' && this.gamenum > 0 && (this.countmove % 7) === 0) {
      const plane = this.findEnemyPlane(o);
      if (plane && plane.y < o.y) { this.initShot(o, plane); o.firing = plane; }
    }
    const step = this.countmove + o.origX;
    const dx = SIN(Math.trunc(step / 7)) * 128;
    const dy = SIN(Math.trunc(step / 3)) * 128;
    o.dx = dx >> 16;
    o.ldx = dx & 0xffff;
    o.dy = dy >> 16;
    o.ldy = dy & 0xffff;
    this.moveXY(o);
    const f = o.orientType * 3 + (dx >= 20000 ? 2 : dx <= -20000 ? 0 : 1);
    o.symbol = this.sprites.balloon[f]?.sym[o.transform] ?? o.symbol;
  }

  private moveBird(o: Obj): void {
    if (o.life === -1) { o.dead = true; return; }
    if (o.life === -2) {
      o.dy = -o.dy;
      o.dx = (this.countmove & 7) - 4;
      if (this.checkWall(o, o.dx)) o.dx = -o.dx;
      o.life = BIRDLIFE;
    } else {
      o.life--;
      if (o.life <= 0) { o.orient ^= 1; o.life = BIRDLIFE; }
    }
    const p = this.moveXY(o);
    o.symbol = this.sprites.bird[o.orient]?.sym[0] ?? o.symbol;
    if (!inRange(0, p.x, this.mission.ground.length - 1)
      || !inRange((this.ground[p.x] ?? 0) + 1, p.y, MAX_Y - 1)) {
      o.y -= o.dy;
      o.life = -2;
    }
  }

  private checkWall(o: Obj, direction: number): boolean {
    let x = o.x;
    for (let i = 0; i < 20; i++) {
      if (!inRange(0, x, this.mission.ground.length - 1)) return true;
      if ((this.ground[x] ?? 0) > o.y + 10) return true;
      x += direction < 0 ? -1 : 1;
    }
    return false;
  }

  private moveOx(o: Obj): void {
    o.symbol = this.sprites.ox[o.state !== 'standing' ? 1 : 0]?.sym[o.transform] ?? o.symbol;
  }

  // ---------------------------------------------------------------- collisions

  private collisionTest(a: Obj, b: Obj): boolean {
    if ((a.type === 'plane' && a.state === 'finished')
      || (b.type === 'plane' && b.state === 'finished')
      || (a.type === 'explosion' && b.type === 'explosion')) return false;
    let x1: number, x2: number, w: number;
    if (a.x < b.x) { x1 = b.x - a.x; x2 = 0; w = Math.min(this.symW(a) - x1, this.symW(b)); }
    else { x1 = 0; x2 = a.x - b.x; w = Math.min(this.symW(b) - x2, this.symW(a)); }
    if (w <= 0) return false;
    let y1: number, y2: number, h: number;
    if (a.y < b.y) { y1 = 0; y2 = b.y - a.y; h = Math.min(this.symH(b) - y2, this.symH(a)); }
    else { y1 = a.y - b.y; y2 = 0; h = Math.min(this.symH(a) - y1, this.symH(b)); }
    if (h <= 0) return false;
    const da = a.symbol?.data, db = b.symbol?.data;
    if (!da || !db) return false;
    for (let y = 0; y < h; y++) {
      const ra = (y1 + y) * this.symW(a) + x1;
      const rb = (y2 + y) * this.symW(b) + x2;
      for (let x = 0; x < w; x++) if (da[ra + x] && db[rb + x]) return true;
    }
    return false;
  }

  private collisions(): void {
    const killed: Obj[] = [];
    const killer: (Obj | null)[] = [];
    const sorted = this.objects.filter((o) => !o.dead).sort((a, b) => a.x - b.x);
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      const xmax = a.x + this.symW(a) - 1;
      const ymax = a.y;
      const ymin = ymax - this.symH(a) + 1;
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];
        if (b.x > xmax) break;
        if (b.y >= ymin && (b.y - this.symH(b) + 1) <= ymax && this.collisionTest(a, b)) {
          killed.push(a); killer.push(b);
          killed.push(b); killer.push(a);
          if (killed.length >= 199) break;
        }
      }
      if ((a.type === 'plane' && a.state !== 'finished' && a.state !== 'waiting'
          && a.y < (this.ground[a.x + 8] ?? 0) + 24)
        || ((a.type === 'bomb' || a.type === 'missile') && a.y < (this.ground[a.x + 4] ?? 0) + 12)) {
        this.testCrash(a, killed, killer);
      }
    }
    const colls: { o: Obj; dx: number; dy: number }[] = [];
    for (let i = 0; i < killed.length; i++) {
      this.swKill(killed[i], killer[i], colls);
    }
    for (const c of colls) { c.o.dx = c.dx; c.o.dy = c.dy; }
  }

  private testCrash(o: Obj, killed: Obj[], killer: (Obj | null)[]): void {
    const sym = o.symbol;
    if (!sym) return;
    for (let x = 0; x < sym.w; x++) {
      const y = o.y - (this.ground[x + o.x] ?? 199);
      if (y >= sym.h) continue;
      if (y < 0 || sym.data[y * sym.w + x]) {
        if (killed.length < 200) { killed.push(o); killer.push(null); }
        return;
      }
    }
  }

  private scoreObject(victim: Obj): { o: Obj; reverse: boolean } {
    if (this.humanSeats === 2 && this.players.length > 1) {
      return { o: this.players[victim.faction === 1 ? 1 : 0] ?? this.players[0], reverse: victim.faction === 0 };
    }
    return { o: this.players[0], reverse: victim.faction === 1 || victim.faction === 0 };
  }

  private scoreTarget(victim: Obj, amount: number): void {
    const { o, reverse } = this.scoreObject(victim);
    if (!o) return;
    if (reverse) o.score -= amount;
    else o.score += amount;
  }

  private computeValour(victim: Obj): number {
    const { o, reverse } = this.scoreObject(victim);
    if (!o || reverse) return 0;
    const distance = Math.abs(o.origX - o.x);
    let valour = distance < 500 ? 0 : Math.trunc((distance - 500) / 350);
    const fuelfraction = o.life > 0 ? Math.trunc(MAXFUEL / o.life) : 1000;
    if (fuelfraction > 9) valour++;
    if (this.planeIsWounded(o.state)) valour = (valour + 1) * 3;
    else valour *= 2;
    return valour;
  }

  private targetDestroyed(victim: Obj, type: ObjType): void {
    const { o, reverse } = this.scoreObject(victim);
    if (!reverse && (type === 'bomb' || type === 'shot' || type === 'missile' || type === 'plane')) {
      o.flightKillscore += 4;
      o.flightValour += 3 * this.computeValour(victim);
    }
    this.scoreTarget(victim, victim.orientType === 2 ? 200 : 100);
    if (this.numtarg[victim.faction] > 0) this.numtarg[victim.faction]--;
    const winner = this.checkWinner();
    if (winner > 0) this.endGame(winner);
  }

  private scorePenalty(type: ObjType, killer: Obj | null, amount: number): boolean {
    if (!killer) return false;
    if (type === 'shot' || type === 'bomb' || type === 'missile'
      || (type === 'plane' && (killer.state === 'flying' || killer.state === 'wounded'
        || (killer.state === 'falling' && killer.hitcount === FALLCOUNT)) && !killer.athome)) {
      this.scoreTarget(killer, amount);
      return true;
    }
    return false;
  }

  private swKill(victim: Obj, by: Obj | null, colls: { o: Obj; dx: number; dy: number }[]): void {
    if (victim.dead) return;
    const type: ObjType = by?.type ?? 'ground';
    if ((type === 'bird' || type === 'flock') && victim.type !== 'plane') return;
    switch (victim.type) {
      case 'bomb':
      case 'missile':
        this.initExplosion(victim, false);
        victim.dead = true;
        if (!by) this.crater(victim);
        return;
      case 'shot':
        if (!(by && by.type === 'plane' && victim.life >= BULLIFE - 1)) victim.life = 1;
        return;
      case 'starburst':
        if (type === 'missile' || type === 'bomb' || !by) victim.life = 1;
        return;
      case 'explosion':
        if (!by) victim.life = 1;
        return;
      case 'balloon':
        if (victim.state !== 'flying') return;
        if (type !== 'plane' && type !== 'shot' && type !== 'bomb') return;
        victim.state = 'finished'; victim.onmap = false; victim.life = -1;
        this.initExplosion(victim, false);
        this.targetDestroyed(victim, type);
        return;
      case 'target':
        if (victim.state !== 'standing') return;
        if (type === 'explosion' || type === 'starburst') return;
        if (type === 'shot') {
          victim.hitcount += TARGHITCOUNT;
          if (victim.hitcount <= TARGHITCOUNT * (this.gamenum + 1)) return;
        }
        victim.state = 'finished'; victim.onmap = false;
        this.initExplosion(victim, false);
        this.targetDestroyed(victim, type);
        return;
      case 'plane': {
        const state = victim.state;
        if (by && by.type === 'shot' && by.life >= BULLIFE - 1) return;
        if (this.isHuman(victim)) this.addHitSplat(type);
        if (state === 'crashed' || victim.endstatus === 'winner') return;
        if (type === 'starburst' || (type === 'bird' && victim.athome)) return;
        if (!by) {
          if (state === 'falling') {
            this.initExplosion(victim, true);
            this.crater(victim);
          } else if (!this.planeIsKilled(state)) {
            this.scorePlane(victim, type);
            this.initExplosion(victim, true);
            this.crater(victim);
          }
          this.crashPlane(victim);
          return;
        }
        if (state === 'finished') return;
        if (state === 'falling') return;
        if (type === 'shot' || type === 'bird' || type === 'ox' || type === 'flock') {
          if (this.options.wounded && !victim.athome) {
            if (type === 'shot') victim.combatwound = true;
            if (state === 'flying') { victim.state = 'wounded'; return; }
            if (state === 'stalled') { victim.state = 'woundstall'; return; }
          }
        } else {
          this.initExplosion(victim, true);
          if (type === 'plane' && by) {
            colls.push({
              o: victim,
              dx: Math.trunc((victim.dx + by.dx) / 2) + (this.countmove & 1 ? -2 : 2),
              dy: Math.trunc((victim.dy + by.dy) / 2) + (this.countmove & 1 ? -1 : 1),
            });
          }
        }
        this.hitPlane(victim);
        this.scorePlane(victim, type);
        return;
      }
      case 'bird':
        victim.life = this.scorePenalty(type, by, 25) ? -1 : -2;
        return;
      case 'flock':
        if (type !== 'flock' && type !== 'bird' && victim.state === 'flying') {
          for (let i = 0; i < 8; i++) this.addBird(victim, i);
          victim.life = -1;
          victim.state = 'finished';
        }
        return;
      case 'ox':
        if (victim.state !== 'standing') return;
        if (type === 'explosion' || type === 'starburst') return;
        this.scorePenalty(type, by, 200);
        victim.state = 'finished';
        return;
      default:
        return;
    }
  }

  private addHitSplat(type: ObjType): void {
    if (type === 'ox') { this.oxSplatted = true; return; }
    this.splatSeed = (Math.imul(this.splatSeed, this.countmove) + 7491) >>> 0;
    if (!this.splatSeed) this.splatSeed = 74917777;
    if (type === 'shot') {
      this.splats.push({ x: this.splatSeed % 304, y: this.splatSeed % 150 + 50, clr: 1,
        sym: this.sprites.shotWindow[0]?.sym[0] ?? null });
    } else if (type === 'bird' || type === 'flock') {
      this.splats.push({ x: this.splatSeed % 288, y: this.splatSeed % 140 + 60, clr: 2,
        sym: this.sprites.birdsplat[0]?.sym[0] ?? null });
    }
  }

  private scorePlane(victim: Obj, type: ObjType): void {
    const hadTakenOff = victim.life < MAXFUEL - MAXFUEL / 100;
    this.scoreTarget(victim, 50);
    if (type === 'bomb' || type === 'shot' || type === 'missile' || type === 'plane') {
      const { o, reverse } = this.scoreObject(victim);
      if (!reverse) {
        if (hadTakenOff) {
          if (type !== 'plane') o.flightPlanekills++;
          o.flightValour += 4 * (2 + this.computeValour(victim));
        }
        o.flightKillscore += 3;
      }
    }
  }

  private crater(o: Obj): void {
    const xmin = o.x + Math.trunc((this.symW(o) - 8) / 2);
    for (let i = 0, x = xmin; i < 8; i++, x++) {
      if (x < 0 || x >= this.mission.ground.length) continue;
      const ymax = this.ground[x] ?? 0;
      let ymin = ymax - CRTDEPTH[i] + 1;
      const y = Math.min(20, (this.baseGround[x] ?? 0) - 20);
      if (ymin <= y) ymin = y + 1;
      this.ground[x] = ymin - 1;
    }
  }

  private initExplosion(ob: Obj, small: boolean): void {
    const ox = ob.x + Math.trunc(this.symW(ob) / 2);
    const oy = ob.y + Math.trunc(this.symH(ob) / 2);
    const odx = ob.dx >> 2;
    const ody = ob.dy >> 2;
    let ic: number;
    let speed: number;
    if (ob.type === 'target' && (ob.orientType === 2 || ob.orientType === 5 || ob.orientType === 12 || ob.orientType === 17)) {
      ic = 1;
      speed = this.options.bigExplosions ? this.gminspeed + 4 : this.gminspeed;
    } else {
      speed = this.gminspeed >> ((this.explseed & 7) !== 7 ? 1 : 0);
      if (small) ic = 6;
      else if (ob.type === 'target') ic = Math.trunc(110 / this.targetExplosionSize(ob.orientType));
      else ic = 2;
    }
    let mansym = ob.type === 'plane' && (ob.state === 'flying' || ob.state === 'wounded');
    for (let i = 1; i <= 15; i += ic) {
      const e = this.newObj('explosion', 'waiting', 0, 0, 0, this.sprites.debris[0]?.sym[0] ?? null);
      this.setDxDy(e, COS(i) * speed, SIN(i) * speed);
      e.dx += odx;
      e.dy += ody;
      e.x = ox + e.dx;
      e.y = oy + e.dy;
      const rangex = Math.max(this.symW(ob), 16) - 16;
      const rangey = Math.max(this.symH(ob), 16) - 16;
      e.x += Math.trunc(COS(i) * rangex / (256 * 2));
      e.y += Math.trunc(SIN(i) * rangey / (256 * 2));
      e.y -= rangey;
      this.explseed = (Math.imul(this.explseed, e.x * e.y) + 7491) >>> 0;
      if (!this.explseed) this.explseed = 74917777;
      e.life = EXPLLIFE;
      e.orient = (this.explseed & 0x01c0) >> 6;
      if (mansym && (!e.orient || e.orient === 7)) {
        e.orient = 0;
        mansym = false;
        e.dx = odx;
        e.dy = -this.gminspeed;
      }
      e.hitcount = 0;
      e.owner = ob;
      e.clr = ob.clr;
      e.symbol = this.sprites.debris[0]?.sym[0] ?? null;
      this.objects.push(e);
    }
  }

  private targetExplosionSize(orient: number): number {
    const s = this.sprites.targetHit[orient]?.sym[0];
    if (!s) return 16;
    let n = 0;
    for (const v of s.data) if (v) n++;
    return clampRange(10, n, 64);
  }

  private initSmoke(owner: Obj): void {
    const s = this.newObj('smoke', 'waiting', owner.x + 8, owner.y - 8, 0, PIXEL);
    s.dx = owner.dx;
    s.dy = owner.dy;
    s.life = SMOKELIFE;
    s.owner = owner;
    s.clr = owner.clr;
    this.objects.push(s);
  }

  // ---------------------------------------------------------------- end of game / awards

  private checkWinner(): number {
    for (let i = 1; i <= 8; i++) {
      if (!this.planes.some((p) => p.faction === i && this.isHuman(p))) continue;
      let all = true;
      for (let j = 1; j <= 8; j++) if (i !== j && this.numtarg[j] > 0) { all = false; break; }
      if (all) return i;
    }
    return 0;
  }

  private endGame(winningFaction: number): void {
    for (const p of this.planes) {
      if (p.endstatus !== 'playing') continue;
      if (p.faction === winningFaction
        && (p.crashcnt < MAXCRASH - 1 || (p.crashcnt < MAXCRASH && !this.planeIsKilled(p.state)))) {
        this.winner(p);
      } else {
        this.loser(p);
      }
    }
  }

  private winner(p: Obj): void {
    p.endstatus = 'winner';
    p.goingsun = true;
    p.dx = p.dy = p.ldx = p.ldy = 0;
    p.state = 'flying';
    p.life = MAXFUEL;
    p.speed = MIN_SPEED;
    if (this.isHuman(p)) p.endcount = 72;
  }

  private loser(p: Obj): void {
    p.endstatus = 'loser';
    if (this.isHuman(p)) p.endcount = 20;
  }

  private getAwards(p: Obj): void {
    if (p.combatwound) this.giveMedal(p, 0);
    p.planekills += p.flightPlanekills;
    if (p.planekills >= 5) this.giveRibbon(p, 0);
    if (p.planekills >= 25) this.giveRibbon(p, 1);
    if (p.flightKillscore >= 5) p.landings++;
    if (p.landings >= 3) this.giveRibbon(p, 3);
    if (p.flightKillscore >= 25) {
      if (!p.medals.includes(1)) this.giveMedal(p, 1);
      else this.giveRibbon(p, 4);
    }
    p.valour += p.flightValour;
    if (p.valour >= 175) this.giveRibbon(p, 5);
    if (p.valour >= 250) this.giveMedal(p, 2);
  }

  private getEndLevel(p: Obj): void {
    this.getAwards(p);
    if (p.crashcnt === 0) this.giveRibbon(p, 2);
  }

  private giveMedal(p: Obj, id: number): void {
    if (!p.medals.includes(id) && p.medals.length < 3) p.medals.push(id);
  }
  private giveRibbon(p: Obj, id: number): void {
    if (!p.ribbons.includes(id) && p.ribbons.length < 6) p.ribbons.push(id);
  }

  /** Awards for a won mission (the port starts the next game itself). */
  awardWinner(): void {
    const p = this.players[0];
    if (p) this.getEndLevel(p);
  }

  /** The lives left after a win count 25 points each (swrestart). */
  awardRemainingLives(): number {
    const p = this.players[0];
    if (!p) return 0;
    let inc = 0;
    while (p.crashcnt < MAXCRASH) {
      p.crashcnt++;
      inc += 25;
      p.score += inc;
    }
    return inc;
  }

  // ---------------------------------------------------------------- computer pilot (swauto.c)

  private isWingman(plane: Obj, other: Obj): boolean {
    const mid = Math.trunc((other.territoryL + other.territoryR) / 2);
    return plane !== other && plane.faction === other.faction
      && inRange(plane.territoryL, mid, plane.territoryR);
  }

  private findWingmen(plane: Obj): { behind: Obj | null; ahead: Obj | null } {
    let ahead: Obj | null = null;
    let behind: Obj | null = null;
    const target = plane.target;
    if (!target) return { behind, ahead };
    const direction = target.x > plane.x ? 1 : -1;
    const aheadOf = (a: Obj, b: Obj): boolean => a.x * direction >= b.x * direction;
    for (const p of this.planes) {
      if (!this.isWingman(plane, p) || !this.planeIsFlying(p.state)) continue;
      if (aheadOf(p, plane) && (!ahead || aheadOf(ahead, p))) ahead = p;
      if (!aheadOf(p, plane) && (!behind || aheadOf(p, behind))) behind = p;
    }
    return { behind, ahead };
  }

  private tstcrash2(ob: Obj, x: number, y: number, alt: number, dy: number): boolean {
    if (alt > 50) return false;
    let lookahead = 3;
    if (ob.home && Math.abs(x - ob.origX) < HOME && Math.abs(y - ob.origY) < HOME) lookahead = 1;
    if (alt + Math.trunc(dy * lookahead / 256) < 8) return true;
    const xl = Math.max(x - 32, ob.x - 32 - this.gmaxspeed);
    const xr = Math.min(x + 32, ob.x + 32 + this.gmaxspeed);
    const targets = this.objects
      .filter((o) => !o.dead && (o.type === 'target' || o.type === 'ox'))
      .sort((a, b) => a.x - b.x);
    for (const t of targets) {
      if (t.x < xl) continue;
      if (t.x > xr) return false;
      const yt = t.y + (t.state === 'standing' ? 16 : 8);
      if (y <= yt) return true;
    }
    return false;
  }

  private shootCheck(obt: Obj, obs: Obj): number {
    const obsp = this.copyObj(obs);
    const obtsp = this.copyObj(obt);
    let nspeed = obsp.speed + BULSPEED;
    this.setDxDy(obsp, nspeed * COS(obsp.angle), nspeed * SIN(obsp.angle));
    obsp.x += 8;
    obsp.y -= 8;
    let nangle = obtsp.angle;
    nspeed = obtsp.speed;
    let rprev = NEAR;
    for (let i = 0; i < BULLIFE; i++) {
      const bp = this.moveXY(obsp);
      const obx = bp.x, oby = bp.y;
      if (obtsp.state === 'flying' || obtsp.state === 'wounded') {
        const r = obtsp.flaps;
        if (r) {
          if (obtsp.orient) nangle -= r;
          else nangle += r;
          nangle = (nangle + 16) % 16;
          this.setDxDy(obtsp, nspeed * COS(nangle), nspeed * SIN(nangle));
        }
      }
      const tp = this.moveXY(obtsp);
      const obtx = tp.x, obty = tp.y;
      const r = range(obx, oby, obtx, obty);
      if (!inRange(0, r, rprev)) return 0;
      if (inRange(obtx, obx, obtx + 15) && inRange(obty - 15, oby, obty)) {
        return 1 + (i > Math.trunc(BULLIFE / 3) ? 1 : 0);
      }
    }
    return 0;
  }

  private aim(ob: Obj, ax: number, ay: number, obt: Obj | null, longway: boolean): number {
    if (this.planeIsStalled(ob.state) && ob.angle !== (3 * 16) / 4) {
      ob.flaps = -1;
      ob.accel = MAX_THROTTLE;
      return 0;
    }
    let x = ob.x;
    let y = ob.y;
    let dx = x - ax;
    const { behind, ahead } = this.findWingmen(ob);
    if (ob.athome && ahead && Math.abs(ob.x - ahead.x) < 64) return 0;
    if (Math.abs(dx) <= 160) {
      if (!longway) ob.hitcount = 0;
    } else if (ahead && Math.abs(ob.x - ahead.x) < 80) {
      return this.aim(ob, ahead.x + 20, ahead.y - 20, null, false);
    } else {
      if (ob.dx && ((dx < 0) === (ob.dx < 0))) {
        if (!ob.hitcount) ob.hitcount = y > MAX_Y - 50 ? 2 : 1;
        return this.aim(ob, x, ob.hitcount === 1 ? y + 25 : y - 25, null, true);
      }
      ob.hitcount = 0;
      let height = Math.min(y + 100, MAX_Y - 50 - this.courseadj);
      if (behind) height = Math.min(height + 32, MAX_Y - 32);
      return this.aim(ob, x + (dx < 0 ? 150 : -150), height, null, true);
    }
    if (ob.speed) {
      const dy = y - ay;
      if (dy !== 0 && Math.abs(dy) < 6) {
        y += dy < 0 ? 1 : -1;
        ob.y = y;
      } else if (dx !== 0 && Math.abs(dx) < 6) {
        x += dx < 0 ? 1 : -1;
        ob.x = x;
      }
    }
    const obs = this.copyObj(ob);
    let nspeed = obs.speed + 1;
    if (nspeed > this.gmaxspeed && obs.type === 'plane') nspeed = this.gmaxspeed;
    else if (nspeed < this.gminspeed) nspeed = this.gminspeed;
    const cflaps = [0, -1, 1];
    const crange = [0, 0, 0];
    const calt = [0, 0, 0];
    const ccrash = [false, false, false];
    for (let i = 0; i < 3; i++) {
      const nangle = (obs.angle + (obs.orient ? -cflaps[i] : cflaps[i]) + 16) % 16;
      this.setDxDy(obs, nspeed * COS(nangle), nspeed * SIN(nangle));
      const p = this.moveXY(obs);
      const nx = p.x, ny = p.y;
      crange[i] = range(nx, ny, ax, ay);
      calt[i] = ny - (this.baseGround[nx + 8] ?? 0);
      ccrash[i] = this.tstcrash2(ob, nx, ny, calt[i], nspeed * SIN(nangle));
      Object.assign(obs, this.copyObj(ob));
    }
    if (obt) {
      const i = this.shootCheck(obt, obs);
      if (i) {
        if (ob.missiles && this.options.missiles && i === 2) {
          ob.mfiring = obt.athome ? ob : obt;
        } else {
          ob.firing = obt;
        }
      }
    }
    let rmin = 32767;
    let n = 0;
    for (let i = 0; i < 3; i++) {
      const r = crange[i];
      if (inRange(0, r, rmin - 1) && !ccrash[i]) { rmin = r; n = i; }
    }
    if (rmin === 32767) {
      rmin = -32767;
      for (let i = 0; i < 3; i++) {
        const r = crange[i];
        if (r < 0 && r > rmin && !ccrash[i]) { rmin = r; n = i; }
      }
    }
    if (ob.speed < this.gminspeed) ob.accel = MAX_THROTTLE;
    if (rmin === -32767) {
      if (ob.accel) ob.accel--;
      n = 0;
      let dy = calt[0];
      if (calt[1] > calt[0]) { dy = calt[1]; n = 1; }
      if (calt[2] > dy) n = 2;
    } else if (ob.accel < MAX_THROTTLE) {
      ob.accel++;
    }
    if (ahead && Math.abs(ahead.x - ob.x) < 24) {
      ob.accel = Math.max(1, ahead.accel - 2);
    } else if (behind && Math.abs(behind.x - ob.x) > 32 && ob.dy === 0) {
      ob.accel = Math.max(1, behind.accel - 2);
    }
    ob.flaps = cflaps[n];
    if (ob.type === 'plane' && !ob.flaps && ob.speed) ob.orient = ob.dx < 0 ? 1 : 0;
    return 0;
  }

  private swauto(ob: Obj): void {
    if (ob.target) this.attack(ob, ob.target);
    else if (!ob.athome) this.cruise(ob);
    ob.target = null;
  }

  private attack(p: Obj, t: Obj): void {
    this.courseadj = ((this.countmove & 0x1f) < 16 ? 1 : 0) << 4;
    if (t.speed) {
      this.aim(p, t.x - ((CLOSE * COS(t.angle)) >> 8), t.y - ((CLOSE * SIN(t.angle)) >> 8), t, false);
    } else {
      this.aim(p, t.x, t.y + 4, t, false);
    }
  }

  private cruise(p: Obj): void {
    this.courseadj = ((this.countmove & 0x1f) < 16 ? 1 : 0) << 4;
    const orgx = p.origX;
    const maxX = this.mission.ground.length;
    this.aim(p, this.courseadj + clampRange(Math.trunc(maxX / 3), orgx, 2 * Math.trunc(maxX / 3)),
      MAX_Y - 50 - (this.courseadj >> 1), null, false);
  }
}
