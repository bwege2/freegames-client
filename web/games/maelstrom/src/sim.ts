// Maelstrom 4.0.2's arcade simulation: the 640x480 asteroid belt, the player
// ship, rocks, Shenobi fighters, prizes, multipliers, bonuses, gravity wells,
// homing mines, novas and the wave/bonus flow. Constants and formulas are from
// game/Maelstrom.h, object.*, player.cpp, objects.*, shenobi.h, make.cpp,
// game.cpp and fastrand.cpp.
import type { Blit } from './assets.ts';
import { VELOCITY_TABLE } from './assets/tables.ts';

export const GAME_W = 640;
export const GAME_H = 480;
export const STATUS_H = 14;
export const SCALE = 16;
export const PREC = 4;
export const VEL_MAX = 8 << PREC;
export const SHIP_FRAMES = 48;
export const MAX_SHOTS = 18;
export const SHOT_SIZE = 4;
export const PLAYER_HITS = 3;
export const ENEMY_HITS = 3;
export const HOMING_HITS = 9;
export const STEEL_SPECIAL = 10;
export const NEW_LIFE = 50000;
export const SMALL_ROID_PTS = 300;
export const MEDIUM_ROID_PTS = 100;
export const BIG_ROID_PTS = 50;
export const GRAVITY_PTS = 500;
export const HOMING_PTS = 700;
export const NOVA_PTS = 1000;
export const STEEL_PTS = 100;
export const ENEMY_PTS = 1000;
export const PLAYER_PTS = 1000;
export const INITIAL_BONUS = 2000;
export const NUM_PRIZES = 8;
export const MAX_SHIELD = (60 / 2) * 5;
export const INITIAL_SHIELD = (60 / 2) * 3;
export const SAFE_TIME = 120 / 2;
export const SHOT_DURATION = 1 * (60 / 2);
export const POINT_DURATION = 2 * (60 / 2);
export const PRIZE_DURATION = 10 * (60 / 2);
export const MULT_DURATION = 6 * (60 / 2);
export const BONUS_DURATION = 10 * (60 / 2);
export const DAMAGED_DURATION = 10 * (60 / 2);
export const DEAD_DELAY = 3 * (60 / 2);
export const ENEMY_SHOT_DELAY = 10 * (60 / 2);
export const FALL_DELAY = 30;
export const SOUND = {
  shot: 100, multiplier: 101, explosion: 102, shipHit: 103, boom1: 104, boom2: 105,
  multiplierGone: 106, multShot: 107, steelHit: 108, bonk: 109, riff: 110,
  prizeAppears: 111, gotPrize: 112, gameOver: 113, newLife: 114, bonusAppears: 115,
  bonusShot: 116, noBonus: 117, gravAppears: 118, homingAppears: 119, shieldOn: 120,
  noShield: 121, novaAppears: 122, novaBoom: 123, lucky: 124, damagedAppears: 125,
  savedShip: 126, funk: 127, enemyAppears: 128, prettyGood: 131, thruster: 132,
  enemyFire: 133, freeze: 134, idiot: 135, pause: 136,
} as const;

export interface GameAssets {
  playerShip: Blit;
  thrust1: Blit;
  thrust2: Blit;
  explosion: Blit;
  shipExplosion: Blit;
  shrapnel1: Blit;
  shrapnel2: Blit;
  largeR: Blit;
  largeL: Blit;
  mediumR: Blit;
  mediumL: Blit;
  smallR: Blit;
  smallL: Blit;
  steelR: Blit;
  steelL: Blit;
  enemy1: Blit;
  enemy2: Blit;
  nova: Blit;
  prize: Blit;
  mult: Blit[];
  bonus: Blit;
  point: Blit;
  vortex: Blit;
  mineR: Blit;
  mineL: Blit;
  shield: Blit;
  damaged: Blit;
  playerShot: Blit;
  enemyShot: Blit;
}

export interface InputState {
  thrust: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  shield: boolean;
  fire: boolean;
}

export interface SoundEvent { id: number; volume: number; pan: number }

export interface Star { x: number; y: number; color: string }
export interface Rect { left: number; top: number; right: number; bottom: number }

const STAR_COLORS = ['#ebebff', '#ececff', '#ededff', '#eeeeff', '#efefff', '#d9d9ff',
  '#dadadaff', '#dbdbff', '#dcdcff', '#ddddff', '#e4e4ff', '#e5e5ff', '#e6e6ff',
  '#e7e7ff', '#e8e8ff', '#f7f7ff', '#f8f8ff', '#f9f9ff', '#fafaff', '#fbfbff'];

/** FastRandom from fastrand.cpp, exact 32-bit arithmetic. */
export class FastRandom {
  private seed: number;
  constructor(seed: number) { this.seed = (seed >>> 0) || 0x12345678; }
  get state(): number { return this.seed; }
  next(range: number): number {
    if (range <= 0) return 0;
    let calc = this.seed >>> 0;
    let regD0 = 0x41a7;
    let regD2 = regD0;
    regD0 = Math.imul(regD0, calc & 0xffff) >>> 0;
    let regD1 = regD0 >>> 16;
    regD2 = Math.imul(regD2, calc >>> 16) >>> 0;
    regD2 = (regD2 + regD1) >>> 0;
    regD1 = (regD2 + regD2) >>> 0;
    regD1 >>>= 16;
    regD0 = (regD0 & 0xffff) >>> 0;
    regD0 = (regD0 - 0x7fffffff) >>> 0;
    regD2 = (regD2 & 0x7fff) >>> 0;
    regD2 = ((regD2 << 16) + (regD2 >>> 16)) >>> 0;
    regD2 = (regD2 + regD1) >>> 0;
    regD0 = (regD0 + regD2) >>> 0;
    this.seed = regD0;
    if ((regD0 & 0xffff) === 0x8000) regD0 = (regD0 & 0xffff0000) >>> 0;
    regD1 = Math.imul(range, regD0 & 0xffff) >>> 0;
    return (regD1 >>> 16) & 0xffff;
  }
}

export type Kind = 'object' | 'rockLarge' | 'rockMedium' | 'rockSmall' | 'steel'
  | 'prize' | 'multiplier' | 'bonus' | 'point' | 'nova' | 'gravity' | 'homing'
  | 'damaged' | 'shrapnel' | 'enemy' | 'enemySmall' | 'player';

export interface Bounds { left: number; top: number; right: number; bottom: number }

export function overlap(a: Rect, b: Rect): boolean {
  return !(a.top > b.bottom || a.bottom < b.top || a.left > b.right || a.right < b.left);
}

export class MObject {
  kind: Kind = 'object';
  x = 0;
  y = 0;
  xvec = 0;
  yvec = 0;
  blit: Blit;
  phase = 0;
  phasetime = -1;
  nextphase = 0;
  ttl = 0;
  hitPoints = 1;
  points = 0;
  solid = true;
  shootable = true;
  exploding = false;
  dead = false;
  readonly game: MaelstromGame;

  constructor(game: MaelstromGame, x: number, y: number, xvec: number, yvec: number, blit: Blit, phaseTime: number) {
    this.game = game;
    this.blit = blit;
    this.phasetime = phaseTime;
    this.phase = phaseTime === -1 ? 0 : game.rand.next(Math.max(1, blit.frames.length));
    this.setPos(x, y);
    this.xvec = xvec;
    this.yvec = yvec;
  }

  get alive(): boolean { return !this.dead; }

  setBlit(blit: Blit): void {
    this.blit = blit;
    if (this.phase >= blit.frames.length) this.phase = 0;
  }

  setTTL(ticks: number): void { this.ttl = ticks + 1; }

  setPos(x: number, y: number): void {
    const right = GAME_W << PREC, bottom = GAME_H << PREC;
    this.x = x > right ? (0 + (x - right)) : x < 0 ? (right - (0 - x)) : x;
    this.y = y > bottom ? (0 + (y - bottom)) : y < 0 ? (bottom - (0 - y)) : y;
  }

  frameBounds(): Bounds {
    const f = this.blit.frames[this.phase] ?? this.blit.frames[0];
    const sx = Math.floor(this.x / SCALE), sy = Math.floor(this.y / SCALE);
    return { left: sx + f.bbox.left, top: sy + f.bbox.top, right: sx + f.bbox.right, bottom: sy + f.bbox.bottom };
  }

  accelerate(dx: number, dy: number): void {
    if (this.exploding) return;
    this.xvec += dx;
    if (Math.abs(this.xvec) > VEL_MAX) this.xvec = this.xvec > 0 ? VEL_MAX : -VEL_MAX;
    this.yvec += dy;
    if (Math.abs(this.yvec) > VEL_MAX) this.yvec = this.yvec > 0 ? VEL_MAX : -VEL_MAX;
  }

  phaseStep(): void {
    if (this.phasetime !== -1) {
      if (this.nextphase++ >= this.phasetime) {
        this.nextphase = 0;
        if (++this.phase >= this.blit.frames.length) this.phase = 0;
      }
    }
  }

  move(frozen: boolean): number {
    if (!frozen) this.setPos(this.x + this.xvec, this.y + this.yvec);
    this.phaseStep();
    if (this.ttl && --this.ttl === 0) return this.beenTimedOut();
    return 0;
  }

  collide(other: MObject): boolean {
    if (!this.solid || !other.solid) return false;
    const a = this.frameBounds(), b = other.frameBounds();
    if (!overlap(a, b)) return false;
    const af = this.blit.frames[this.phase] ?? this.blit.frames[0];
    const bf = other.blit.frames[other.phase] ?? other.blit.frames[0];
    const left = Math.max(a.left, b.left), right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top), bottom = Math.min(a.bottom, b.bottom);
    const ax = Math.floor(this.x / SCALE), ay = Math.floor(this.y / SCALE);
    const bx = Math.floor(other.x / SCALE), by = Math.floor(other.y / SCALE);
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const mx = x - ax, my = y - ay;
        const nx = x - bx, ny = y - by;
        if (mx < 0 || my < 0 || mx >= af.w || my >= af.h || nx < 0 || ny < 0 || nx >= bf.w || ny >= bf.h) continue;
        if (af.mask[my * af.w + mx] && bf.mask[ny * bf.w + nx]) return true;
      }
    }
    return false;
  }

  hitBy(ship: Player): boolean {
    if (!this.alive) return false;
    if (this.shootable && ship.alive) {
      for (;;) {
        const shot = ship.shotHit(this.frameBounds());
        if (!shot) break;
        if (this.beenShot(ship, shot) > 0) return true;
      }
    }
    if (this.kind !== 'enemy' && this.kind !== 'enemySmall'
      && ship.alive && this.collide(ship) && this.beenRunOver(ship) > 0) return true;
    return false;
  }

  beenShot(ship: Player, shot: Shot): number {
    this.hitPoints -= shot.damage;
    if (this.hitPoints <= 0) {
      ship.addScore(this.points);
      return this.explode();
    }
    this.hitSound();
    this.accelerate(shot.xvel / 2, shot.yvel / 2);
    return 0;
  }

  beenRunOver(ship: Player): number {
    if (ship.alive) ship.beenDamaged(PLAYER_HITS);
    this.hitPoints--;
    if (this.hitPoints <= 0) {
      ship.addScore(this.points);
      return this.explode();
    }
    this.hitSound();
    ship.accelerate(this.xvec / 2, this.yvec / 2);
    return 0;
  }

  beenDamaged(damage: number): number {
    this.hitPoints -= damage;
    if (this.hitPoints <= 0) return this.explode();
    this.hitSound();
    return 0;
  }

  beenTimedOut(): number {
    if (this.kind === 'nova') {
      this.game.novaExplode(this);
      return -1;
    }
    if (this.kind === 'multiplier') this.game.sound(SOUND.multiplierGone, 4);
    return -1;
  }

  explode(): number {
    if (this.exploding) return 0;
    this.exploding = true;
    this.solid = false;
    this.shootable = false;
    this.phase = 0;
    this.nextphase = 0;
    this.phasetime = 2;
    this.xvec = this.yvec = 0;
    this.setBlit(this.game.assets.explosion);
    this.setTTL(this.blit.frames.length * this.phasetime);
    this.explodeSound();
    return 0;
  }

  hitSound(): void { this.game.sound(SOUND.steelHit, 3); }
  explodeSound(): void { this.game.sound(SOUND.explosion, 3); }

  shake(): void {
    const sx = this.game.rand.next(256), sy = this.game.rand.next(256);
    this.accelerate(this.xvec < 0 ? sx : -sx, this.yvec < 0 ? sy : -sy);
  }
}

export interface Shot {
  damage: number;
  x: number;
  y: number;
  xvel: number;
  yvel: number;
  ttl: number;
  rect: Rect;
}

export class Player extends MObject {
  override kind: Kind = 'player';
  index: number;
  lives = 3;
  score = 0;
  frags = 0;
  bonus = 0;
  bonusMult = 1;
  cutBonus = 0;
  shieldLevel = 0;
  shieldOn = false;
  autoShield = 0;
  wasShielded = 0;
  shieldPhase = 0;
  special = 0;
  playing = true;
  ghost = false;
  color = '#0000ff';
  deadTimer = 0;
  shots: Shot[] = [];
  shotsThisWave = 0;
  shotsMissedThisWave = 0;
  rotating = 0;
  thrusting = false;
  braking = false;
  shooting = false;
  wasShooting = false;
  wasThrust = false;
  noThrust = 0;
  thrustBlit: Blit;
  cameraX = 0;
  cameraY = 0;
  nextLife = NEW_LIFE;

  constructor(game: MaelstromGame, index: number) {
    super(game, 0, 0, 0, 0, game.assets.playerShip, -1);
    this.index = index;
    this.color = ['#0000ff', '#ff99ff', '#339900'][index] ?? '#ffffff';
    this.thrustBlit = game.assets.thrust1;
    this.x = 0; this.y = 0;
    this.setBlit(game.assets.playerShip);
  }

  get alive(): boolean { return this.deadTimer === 0 && !this.exploding && !this.ghost; }

  newGame(lives = 3, deathmatch = false): void {
    this.playing = true;
    this.ghost = false;
    this.lives = deathmatch ? 1 : lives;
    this.score = 0;
    this.frags = 0;
    this.special = 0;
    this.deadTimer = 0;
    this.exploding = false;
    this.nextLife = NEW_LIFE;
    this.newShip(true);
  }

  newWave(): void {
    if (this.exploding || (!this.alive && this.playing)) this.newShip(false);
    this.bonus = INITIAL_BONUS;
    this.bonusMult = 1;
    this.cutBonus = 30;
    this.shieldOn = false;
    this.autoShield = SAFE_TIME;
    this.wasShielded = 0;
    this.shieldPhase = 0;
    this.spawn();
    this.xvec = this.yvec = 0;
    this.thrusting = false;
    this.braking = false;
    this.noThrust = 0;
    this.thrustBlit = this.game.assets.thrust1;
    this.shooting = false;
    this.wasShooting = false;
    this.rotating = 0;
    this.phase = 0;
    this.shots = [];
    this.shotsThisWave = 0;
    this.shotsMissedThisWave = 0;
    this.updateCamera();
  }

  newShip(died = true): number {
    if (died && this.lives === 0) {
      if (this.game.mode === 'coop' && this.game.numPlayers > 1) this.ghost = true;
      else if (this.game.mode !== 'deathmatch') return -1;
    }
    this.solid = !this.ghost;
    this.shootable = !this.ghost;
    this.setBlit(this.game.assets.playerShip);
    this.points = PLAYER_PTS;
    this.hitPoints = PLAYER_HITS;
    this.shieldOn = false;
    if (died) this.shieldLevel = INITIAL_SHIELD;
    this.autoShield = SAFE_TIME;
    this.wasShielded = 1;
    this.shieldPhase = 0;
    this.xvec = this.yvec = 0;
    this.thrusting = false;
    this.thrustBlit = this.game.assets.thrust1;
    this.braking = false;
    this.wasThrust = false;
    this.shooting = false;
    this.wasShooting = false;
    this.rotating = 0;
    this.phase = 0;
    this.phasetime = -1;
    this.deadTimer = 0;
    this.exploding = false;
    this.setTTL(-1);
    if (died && this.game.mode !== 'deathmatch' && this.lives > 0) this.lives--;
    this.spawn();
    if (died) {
      if ((this.special & 0x80) && this.game.rand.next(3) === 0) this.special &= ~0x80;
      else this.special = 0;
    }
    return this.lives;
  }

  spawn(): void {
    this.setSpawnPosition();
  }

  private setSpawnPosition(): void {
    const n = this.game.numPlayers;
    const offset = n === 2 ? 32 : 0;
    const index = this.index;
    const x = (GAME_W / 2 - (Math.floor(n / 2) - index) * 64 + offset - 16) * SCALE;
    const y = (GAME_H / 2 - 16) * SCALE - 32;
    this.setPos(x, y);
  }

  updateCamera(): void {
    this.cameraX = this.x + (16 << PREC);
    this.cameraY = this.y + (16 << PREC);
  }

  handleInput(input: InputState): void {
    if (!this.alive || this.ghost) return;
    this.thrusting = input.thrust;
    this.braking = input.brake;
    this.shooting = input.fire;
    if (input.left) this.rotating |= 0x10;
    else this.rotating &= ~0x10;
    if (input.right) this.rotating |= 0x01;
    else this.rotating &= ~0x01;
    if (input.shield) this.shieldOn = true;
    else this.shieldOn = false;
  }

  override move(frozen: boolean): number {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      if (--s.ttl === 0) { this.shots.splice(i, 1); this.shotsMissedThisWave++; continue; }
      s.x += s.xvel;
      if (s.x > GAME_W * SCALE) s.x = s.x - GAME_W * SCALE;
      else if (s.x < 0) s.x = GAME_W * SCALE + s.x;
      s.y += s.yvel;
      if (s.y > GAME_H * SCALE) s.y = s.y - GAME_H * SCALE;
      else if (s.y < 0) s.y = GAME_H * SCALE + s.y;
      s.rect = { left: Math.floor(s.x / SCALE), top: Math.floor(s.y / SCALE), right: Math.floor(s.x / SCALE) + SHOT_SIZE, bottom: Math.floor(s.y / SCALE) + SHOT_SIZE };
    }
    if (this.bonus && this.cutBonus-- === 0) { this.bonus -= 10; this.cutBonus = 30; }
    if (this.noThrust) this.noThrust--;
    if (this.alive) {
      if (this.braking || (this.special & 0x02)) {
        if (this.yvec > 0) this.yvec--; else if (this.yvec < 0) this.yvec++;
        if (this.xvec > 0) this.xvec--; else if (this.xvec < 0) this.xvec++;
      }
      if (this.thrusting && !this.noThrust) {
        const v = VELOCITY_TABLE[this.phase % SHIP_FRAMES];
        this.accelerate(v.h, v.v);
      }
      if (this.thrusting || (this.special & 0x02)) {
        if (!this.wasThrust) { this.game.sound(SOUND.thruster, 1, 3); this.wasThrust = true; }
      } else this.wasThrust = false;
      if (this.shooting) {
        if (!this.wasShooting || (this.special & 0x01)) {
          this.wasShooting = true;
          this.makeShot(0);
          this.game.sound(SOUND.shot, 2);
          if (this.special & 0x04) { this.makeShot(1); this.makeShot(-1); }
        }
      } else this.wasShooting = false;
      if (this.rotating & 0x01) { if (++this.phase >= SHIP_FRAMES) this.phase = 0; }
      if (this.rotating & 0x10) { if (--this.phase < 0) this.phase = SHIP_FRAMES - 1; }
      if (this.autoShield) { this.wasShielded = 1; this.autoShield--; }
      else if (this.shieldOn) {
        if (this.shieldLevel > 0) { this.wasShielded = 1; this.shieldLevel--; }
        else if (this.shieldOn) this.game.sound(SOUND.noShield, 2);
      } else this.wasShielded = 0;
    }
    const result = super.move(frozen);
    this.updateCamera();
    if (this.deadTimer) {
      if (--this.deadTimer === 0) this.handleDeath();
    }
    return result;
  }

  handleDeath(): void {
    if (this.game.mode === 'coop' && this.game.numPlayers > 1 && this.lives === 0) {
      this.ghost = true;
      this.newShip(false);
      if (this.game.players.every((p) => !p.playing || p.ghost)) this.game.gameOver();
      return;
    }
    if (this.game.mode === 'deathmatch') {
      if (this.game.players.some((p) => p.frags >= this.game.fragTarget)) {
        for (const p of this.game.players) p.playing = false;
        this.game.gameOver();
        return;
      }
      this.newShip(false);
      return;
    }
    if (this.newShip() < 0) {
      this.deadTimer = DEAD_DELAY;
      this.playing = false;
      this.game.gameOver();
    }
  }

  override beenTimedOut(): number {
    this.exploding = false;
    this.spawn();
    return 0;
  }

  makeShot(offset: number): number {
    if (this.shots.length >= MAX_SHOTS) return -1;
    let shotphase = this.phase + offset;
    if (shotphase < 0) shotphase = SHIP_FRAMES - 1;
    else if (shotphase === SHIP_FRAMES) shotphase = 0;
    const v = VELOCITY_TABLE[shotphase];
    let x = this.x, y = this.y;
    x += (16 - 2) << PREC;
    y += (16 - 2) << PREC;
    const shot: Shot = {
      damage: PLAYER_HITS,
      x, y,
      xvel: (v.h << 4) + this.xvec,
      yvel: (v.v << 4) + this.yvec,
      ttl: this.special & 0x08 ? SHOT_DURATION * 2 : SHOT_DURATION,
      rect: { left: 0, top: 0, right: 0, bottom: 0 },
    };
    shot.x -= this.xvec; shot.y -= this.yvec;
    shot.rect = { left: Math.floor(shot.x / SCALE), top: Math.floor(shot.y / SCALE), right: Math.floor(shot.x / SCALE) + SHOT_SIZE, bottom: Math.floor(shot.y / SCALE) + SHOT_SIZE };
    this.shots.push(shot);
    this.shotsThisWave++;
    return this.shots.length;
  }

  shotHit(rect: Rect): Shot | null {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      if (overlap(this.shots[i].rect, rect)) {
        const s = this.shots[i];
        this.shots.splice(i, 1);
        return s;
      }
    }
    return null;
  }

  override beenShot(ship: MObject, shot: Shot): number {
    if (this.exploding || !this.alive) return 0;
    if (this.autoShield || (this.shieldOn && this.shieldLevel > 0)) return 0;
    if ((this.special & 0x80) && this.game.rand.next(3) === 0) { this.game.sound(SOUND.lucky, 4); return 0; }
    this.hitPoints -= shot.damage;
    if (this.hitPoints <= 0) {
      if (ship instanceof Player && this instanceof Player) {
        ship.frags++;
        ship.addScore(PLAYER_PTS);
      }
      this.explode();
      return 0;
    }
    this.game.sound(SOUND.steelHit, 3);
    this.accelerate(shot.xvel / 2, shot.yvel / 2);
    return 0;
  }

  override beenRunOver(ship: MObject): number {
    if (this.exploding || !this.alive) return 0;
    if (this.autoShield || (this.shieldOn && this.shieldLevel > 0)) return 0;
    if (ship.kind === 'player') return 0;
    if ((this.special & 0x80) && this.game.rand.next(3) === 0) { this.game.sound(SOUND.lucky, 4); return 0; }
    this.beenDamaged(PLAYER_HITS);
    return 0;
  }

  override beenDamaged(damage: number): number {
    if (this.exploding || !this.alive) return 0;
    if (this.autoShield || (this.shieldOn && this.shieldLevel > 0)) return 0;
    if ((this.special & 0x80) && this.game.rand.next(3) === 0) { this.game.sound(SOUND.lucky, 4); return 0; }
    this.hitPoints -= damage;
    if (this.hitPoints <= 0) { this.explode(); return 1; }
    this.game.sound(SOUND.steelHit, 3);
    return 0;
  }

  override explode(): number {
    if (this.exploding || !this.alive) return 0;
    const rx = 16;
    for (const which of [0, 1]) {
      let xv = 0, yv = 0;
      while (xv === 0) xv = this.game.rand.next(rx / 2) + 16;
      if (which === 1) xv = -xv;
      while (yv === 0) yv = this.game.rand.next(rx) - rx / 2;
      yv += yv > 0 ? 16 : -16;
      const blit = which === 0 ? this.game.assets.shrapnel1 : this.game.assets.shrapnel2;
      const shrapnel = new MObject(this.game, this.x, this.y, xv, yv, blit, 2);
      shrapnel.solid = false; shrapnel.shootable = false;
      this.game.objects.push(shrapnel);
    }
    this.exploding = true;
    this.thrusting = false;
    this.braking = false;
    this.shooting = false;
    this.shieldOn = false;
    this.solid = false;
    this.shootable = false;
    this.phase = 0;
    this.nextphase = 0;
    this.phasetime = 2;
    this.xvec = this.yvec = 0;
    this.setBlit(this.game.assets.shipExplosion);
    this.setTTL(this.blit.frames.length * this.phasetime);
    this.game.sound(SOUND.shipHit, 3);
    this.deadTimer = DEAD_DELAY;
    return 0;
  }

  addScore(score: number): void { this.score += score; }
  incrLives(n: number): void { if (this.game.mode === 'deathmatch' && n > 0) return; this.lives += n; }
  getSpecial(mask: number): boolean { return (this.special & mask) !== 0; }
  setSpecial(mask: number): void { this.special |= mask; }
}

// --------------------------------------------------------------- game objects

class Rock extends MObject {
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number, blit: Blit, phaseTime: number) {
    super(game, x, y, xv, yv, blit, phaseTime);
    game.rockCount++;
  }
  override explode(): number {
    const result = super.explode();
    this.game.rockCount--;
    this.game.boomDelay = Math.max(10, this.game.boomDelay - 1);
    return result;
  }
  override beenTimedOut(): number { return -1; }
}

export class SmallRock extends Rock {
  override kind: Kind = 'rockSmall';
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number, pf: number) {
    super(game, x, y, xv, yv, xv > 0 ? game.assets.smallR : game.assets.smallL, pf);
    this.points = SMALL_ROID_PTS;
  }
  override explode(): number {
    if (this.exploding) return 0;
    this.game.smallRocksDestroyed++;
    this.game.boomDelay = Math.max(10, this.game.boomDelay - 1);
    return super.explode();
  }
}

export class MediumRock extends Rock {
  override kind: Kind = 'rockMedium';
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number, pf: number) {
    super(game, x, y, xv, yv, xv > 0 ? game.assets.mediumR : game.assets.mediumL, pf);
    this.points = MEDIUM_ROID_PTS;
  }
  override explode(): number {
    if (this.exploding) return 0;
    const n = this.game.rand.next(3);
    for (let i = 0; i <= n; i++) this.game.makeSmallRock(this.x, this.y);
    this.game.boomDelay = Math.max(10, this.game.boomDelay - 1);
    return super.explode();
  }
}

export class LargeRock extends Rock {
  override kind: Kind = 'rockLarge';
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number, pf: number) {
    super(game, x, y, xv, yv, xv > 0 ? game.assets.largeR : game.assets.largeL, pf);
    this.points = BIG_ROID_PTS;
  }
  override explode(): number {
    if (this.exploding) return 0;
    const n = this.game.rand.next(3);
    for (let i = 0; i <= n; i++) this.game.makeMediumRock(this.x, this.y);
    this.game.boomDelay = Math.max(10, this.game.boomDelay - 1);
    return super.explode();
  }
}

export class SteelRoid extends MObject {
  override kind: Kind = 'steel';
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number) {
    super(game, x, y, xv, yv, xv > 0 ? game.assets.steelR : game.assets.steelL, 3);
    this.hitPoints = STEEL_SPECIAL;
    this.points = STEEL_PTS;
  }
  override beenShot(ship: Player, shot: Shot): number {
    if (this.hitPoints - shot.damage > 0) ship.addScore(this.points);
    return super.beenShot(ship, shot);
  }
  override beenRunOver(ship: Player): number {
    if (this.hitPoints - 1 > 0) ship.addScore(this.points);
    return super.beenRunOver(ship);
  }
  override explode(): number {
    if (this.exploding) return 0;
    this.hitPoints = STEEL_SPECIAL;
    const r = this.game.rand.next(10);
    if (r === 0) { this.game.makeLargeRockAt(this.x, this.y, this.xvec, this.yvec); return 1; }
    if (r === 1) return super.explode();
    if (r === 2) { this.game.makeHomingAt(this.x, this.y, this.xvec, this.yvec); return 1; }
    return 0;
  }
}

class Prize extends MObject {
  override kind: Kind = 'prize';
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number) {
    super(game, x, y, xv, yv, game.assets.prize, 2);
    this.setTTL(PRIZE_DURATION);
    game.sound(SOUND.prizeAppears, 4);
  }
  override beenRunOver(ship: Player): number {
    if (!ship.alive) return 0;
    this.game.prizeFor(ship);
    this.game.sound(SOUND.gotPrize, 4);
    return 1;
  }
  override beenTimedOut(): number { this.game.sound(SOUND.idiot, 4); return -1; }
}

class Multiplier extends MObject {
  override kind: Kind = 'multiplier';
  multiplier: number;
  constructor(game: MaelstromGame, x: number, y: number, mult: number) {
    super(game, x, y, 0, 0, game.assets.mult[Math.max(0, Math.min(3, mult - 2))], -1);
    this.multiplier = mult;
    this.setTTL(MULT_DURATION);
    this.solid = false;
    this.game.sound(SOUND.multiplier, 4);
  }
  override beenShot(ship: Player, _shot: Shot): number {
    ship.bonusMult = this.multiplier;
    this.game.sound(SOUND.multShot, 4);
    return 1;
  }
  override beenDamaged(): number { return 0; }
  override beenTimedOut(): number { this.game.sound(SOUND.multiplierGone, 4); return -1; }
}

class Bonus extends MObject {
  override kind: Kind = 'bonus';
  bonus: number;
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number, bonus: number) {
    super(game, x, y, xv, yv, game.assets.bonus, 2);
    this.bonus = bonus;
    this.setTTL(BONUS_DURATION);
    this.solid = false;
    this.game.sound(SOUND.bonusAppears, 4);
  }
  override beenShot(ship: Player, _shot: Shot): number {
    ship.bonus += this.bonus;
    this.game.sound(SOUND.bonusShot, 4);
    this.shootable = false;
    this.setBlit(this.game.assets.point);
    this.phasetime = -1;
    this.phase = Math.max(0, Math.min(this.blit.frames.length - 1, Math.floor(this.bonus / 1000)));
    this.setTTL(POINT_DURATION);
    this.xvec = this.yvec = 0;
    return 0;
  }
  override beenDamaged(): number { return 0; }
}

class Nova extends MObject {
  override kind: Kind = 'nova';
  constructor(game: MaelstromGame, x: number, y: number) {
    super(game, x, y, 0, 0, game.assets.nova, 4);
    this.points = NOVA_PTS;
    this.setTTL(this.blit.frames.length * 4);
    this.game.sound(SOUND.novaAppears, 4);
  }
  override beenTimedOut(): number { this.game.novaExplode(this); return -1; }
}

class Gravity extends MObject {
  override kind: Kind = 'gravity';
  constructor(game: MaelstromGame, x: number, y: number) {
    super(game, x, y, 0, 0, game.assets.vortex, 2);
    this.points = GRAVITY_PTS;
    this.game.sound(SOUND.gravAppears, 4);
  }
  override move(frozen: boolean): number {
    if (!this.exploding) {
      for (const p of this.game.players) {
        if (!p.alive) continue;
        const xAccel = (p.x >> PREC) + 16 <= (this.x >> PREC) + 16 ? 3 : -3;
        const yAccel = (p.y >> PREC) + 16 <= (this.y >> PREC) + 16 ? 3 : -3;
        p.accelerate(xAccel, yAccel);
      }
    }
    return super.move(frozen);
  }
}

class Homing extends MObject {
  override kind: Kind = 'homing';
  target = -1;
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number) {
    super(game, x, y, xv, yv, xv > 0 ? game.assets.mineR : game.assets.mineL, 2);
    this.hitPoints = HOMING_HITS;
    this.points = HOMING_PTS;
    this.target = this.acquireTarget();
    this.game.sound(SOUND.homingAppears, 4);
  }
  private acquireTarget(): number {
    const targets: number[] = [];
    this.game.players.forEach((p, i) => { if (p.alive) targets.push(i); });
    return targets.length ? targets[this.game.rand.next(targets.length)] : -1;
  }
  override move(frozen: boolean): number {
    if (!this.exploding) {
      let p = this.game.players[this.target];
      if (!p?.alive) {
        this.target = this.acquireTarget();
        p = this.game.players[this.target];
      }
      if (p?.alive) {
        const xAccel = (p.x >> PREC) + 16 <= (this.x >> PREC) + 16 ? -6 : 6;
        const yAccel = (p.y >> PREC) + 16 <= (this.y >> PREC) + 16 ? -6 : 6;
        this.accelerate(xAccel, yAccel);
      }
    }
    return super.move(frozen);
  }
}

class DamagedShip extends MObject {
  override kind: Kind = 'damaged';
  constructor(game: MaelstromGame, x: number, y: number, xv: number, yv: number) {
    super(game, x, y, xv, yv, game.assets.damaged, 1);
    this.setTTL(DAMAGED_DURATION * this.phasetime);
    this.game.sound(SOUND.damagedAppears, 4);
  }
  override beenRunOver(ship: Player): number {
    ship.incrLives(1);
    this.game.sound(SOUND.savedShip, 4);
    return 1;
  }
  override beenTimedOut(): number { return this.exploding ? -1 : this.explode(); }
}



export class Shenobi extends MObject {
  override kind: Kind = 'enemy';
  enemyShots: Shot[] = [];
  nextshot = 0;
  shotodds: number;
  target = -1;
  barrel: number;
  constructor(game: MaelstromGame, x: number, y: number, little: boolean) {
    super(game, x, y, 0, 0, little ? game.assets.enemy2 : game.assets.enemy1, 1);
    this.kind = little ? 'enemySmall' : 'enemy';
    this.hitPoints = ENEMY_HITS;
    this.points = ENEMY_PTS;
    this.shotodds = little ? 15 : 30;
    this.barrel = this.phase;
    this.target = this.acquireTarget();
    this.game.sound(SOUND.enemyAppears, 4);
  }
  private acquireTarget(): number {
    const targets: number[] = [];
    this.game.players.forEach((p, i) => { if (p.alive) targets.push(i); });
    return targets.length ? targets[this.game.rand.next(targets.length)] : -1;
  }
  override move(frozen: boolean): number {
    for (let i = this.enemyShots.length - 1; i >= 0; i--) {
      const s = this.enemyShots[i];
      if (--s.ttl === 0) { this.enemyShots.splice(i, 1); continue; }
      s.x += s.xvel;
      if (s.x > GAME_W * SCALE) s.x -= GAME_W * SCALE; else if (s.x < 0) s.x += GAME_W * SCALE;
      s.y += s.yvel;
      if (s.y > GAME_H * SCALE) s.y -= GAME_H * SCALE; else if (s.y < 0) s.y += GAME_H * SCALE;
      s.rect = { left: Math.floor(s.x / SCALE), top: Math.floor(s.y / SCALE), right: Math.floor(s.x / SCALE) + SHOT_SIZE, bottom: Math.floor(s.y / SCALE) + SHOT_SIZE };
    }
    if (!this.exploding) {
      let p = this.game.players[this.target];
      if (!p?.alive) {
        this.target = this.acquireTarget();
        p = this.game.players[this.target];
      }
      if (!p?.alive) { const alive = super.move(frozen); return ((this.x + 26) >> PREC) >= GAME_W ? -1 : alive; }
      const dx = p.x - this.x, dy = p.y - this.y;
      const slope = Math.abs(dx) - Math.abs(dy);
      let np: number;
      if (dy < 0) {
        if (dx < 0) { np = 6; if (slope < 0) np++; }
        else { np = 0; if (slope > 0) np++; }
      } else {
        if (dx < 0) { np = 4; if (slope > 0) np++; }
        else { np = 2; if (slope < 0) np++; }
      }
      np *= 6; np += this.game.rand.next(6);
      this.xvec = 30;
      const coin = this.game.rand.next(100);
      this.yvec = coin === 0 ? 30 : coin === 1 ? -30 : coin < 7 ? 0 : this.yvec;
      this.barrel = Math.floor((this.barrel + np) / 2);
      this.nextshot++;
      if (this.game.rand.next(this.shotodds) === 0 && this.nextshot >= ENEMY_SHOT_DELAY) {
        this.makeShot();
        this.game.sound(SOUND.enemyFire, 2);
      }
    }
    const alive = super.move(frozen);
    if (((this.x + 26) >> PREC) >= GAME_W) return -1;
    return alive;
  }
  makeShot(): void {
    if (this.enemyShots.length >= MAX_SHOTS) return;
    let phase = this.barrel;
    if (phase < 0) phase = this.blit.frames.length - 1;
    else if (phase === this.blit.frames.length) phase = 0;
    const v = VELOCITY_TABLE[phase % SHIP_FRAMES];
    let x = this.x, y = this.y;
    x += (16 - 2) << PREC;
    y += (16 - 2) << PREC;
    x += this.xvec;
    y += this.yvec;
    x -= this.xvec; y -= this.yvec;
    const shot: Shot = {
      damage: PLAYER_HITS, x, y, xvel: (v.h << 4) + this.xvec, yvel: (v.v << 4) + this.yvec,
      ttl: SHOT_DURATION, rect: { left: 0, top: 0, right: 0, bottom: 0 },
    };
    shot.rect = { left: Math.floor(x / SCALE), top: Math.floor(y / SCALE), right: Math.floor(x / SCALE) + SHOT_SIZE, bottom: Math.floor(y / SCALE) + SHOT_SIZE };
    this.enemyShots.push(shot);
  }
  shotHit(rect: Rect): Shot | null {
    if (this.exploding) return null;
    for (let i = this.enemyShots.length - 1; i >= 0; i--) {
      if (overlap(this.enemyShots[i].rect, rect)) {
        const s = this.enemyShots[i]; this.enemyShots.splice(i, 1); return s;
      }
    }
    return null;
  }
}

// --------------------------------------------------------------- the game

export class MaelstromGame {
  readonly assets: GameAssets;
  readonly rand: FastRandom;
  readonly player: Player;
  readonly players: Player[] = [];
  readonly numPlayers: number;
  readonly mode: 'coop' | 'deathmatch';
  readonly fragTarget: number;
  bonusTotals: number[] = [];
  readonly objects: MObject[] = [];
  readonly events: SoundEvent[] = [];
  readonly stars: Star[] = [];
  readonly borderStars: Star[] = [];
  wave = 0;
  state: 'playing' | 'bonus' | 'gameover' = 'playing';
  rockCount = 0;
  smallRocksDestroyed = 0;
  boomDelay = 30;
  nextBoom = 30;
  boomPhase = 0;
  multiplierShown = 0;
  prizeShown = 0;
  bonusShown = 0;
  whenGrav = 0;
  whenNova = 0;
  whenEnemy = 0;
  whenDamaged = 0;
  whenHoming = 0;
  lastStar = 30;
  whenDone = 0;
  freezeTime = 0;
  shakeTime = 0;
  bonusTimer = 0;
  bonusTotal = 0;

  constructor(assets: GameAssets, seed = 0x12345678, numPlayers = 1, mode: 'coop' | 'deathmatch' = 'coop', fragTarget = 10) {
    this.assets = assets;
    this.rand = new FastRandom(seed);
    this.numPlayers = Math.max(1, Math.min(3, numPlayers));
    this.mode = mode;
    this.fragTarget = Math.max(1, fragTarget);
    for (let i = 0; i < this.numPlayers; i++) this.players.push(new Player(this, i));
    this.player = this.players[0];
    this.makeStars();
  }

  sound(id: number, volume = 4, pan = 0): void { this.events.push({ id, volume, pan }); }

  clearEvents(): SoundEvent[] { return this.events.splice(0, this.events.length); }

  makeStars(): void {
    for (let i = 0; i < 30; i++) this.stars.push({ x: 0, y: 0, color: '#fff' });
    for (let i = 0; i < 150; i++) this.borderStars.push({ x: 0, y: 0, color: '#fff' });
    for (let i = 0; i < this.stars.length; i++) this.setStar(i);
    for (let i = 0; i < this.borderStars.length; i++) this.setBorderStar(i);
  }

  setStar(i: number): void {
    this.stars[i] = {
      x: this.rand.next(GAME_W - 64) + 32,
      y: this.rand.next(GAME_H - 64) + 32,
      color: STAR_COLORS[this.rand.next(20)],
    };
  }

  setBorderStar(i: number): void {
    let x = 0, y = 0;
    do {
      x = this.rand.next(GAME_W); y = this.rand.next(GAME_H);
    } while (x > 64 && x < GAME_W - 64 && y > 64 && y < GAME_H - 64);
    this.borderStars[i] = { x, y, color: STAR_COLORS[this.rand.next(20)] };
  }

  start(lives = 3): void {
    this.wave = 0;
    this.state = 'playing';
    this.objects.length = 0;
    this.rockCount = 0;
    for (const p of this.players) p.newGame(lives, this.mode === 'deathmatch');
    this.startNextWave();
  }

  startNextWave(): void {
    this.wave++;
    this.multiplierShown = this.rand.next(2) ? this.rand.next(30) * 30 : 0;
    this.prizeShown = this.rand.next(2) ? this.rand.next(30) * 30 : 0;
    this.bonusShown = this.rand.next(2) ? this.rand.next(30) * 30 : 0;
    this.whenGrav = this.rand.next(10 + this.wave) > 11 ? this.rand.next(30) * 30 : 0;
    this.whenNova = this.rand.next(10 + this.wave) > 13 ? this.rand.next(30) * 30 : 0;
    this.whenEnemy = this.rand.next(3) === 0 ? this.rand.next(30) * 30 : 0;
    this.whenDamaged = this.rand.next(10) === 0 ? this.rand.next(60) * 30 : 0;
    this.whenHoming = this.rand.next(10 + this.wave) > 12 ? this.rand.next(60) * 30 : 0;
    const temp = Math.max(1, Math.floor(this.wave / 4));
    const newRoids = this.rand.next(temp) + Math.floor(this.wave / 5) + 3;
    this.objects.length = 0;
    this.rockCount = 0;
    this.boomDelay = 30; this.nextBoom = 30; this.boomPhase = 0; this.whenDone = 0;
    for (const p of this.players) p.newWave();
    for (let i = 0; i < newRoids; i++) {
      const x = this.rand.next(GAME_W) * SCALE;
      const randval = this.mode === 'deathmatch'
        ? (i === 0 ? 1 : this.rand.next(2)) : this.rand.next(10);
      if (randval === 0) this.makeSteelRoid(x, 0);
      else if (this.mode === 'deathmatch') this.makeMediumRock(x, 0);
      else this.makeLargeRock(x, 0);
    }
    this.state = 'playing';
  }

  nextWave(): void {
    this.state = 'bonus';
    this.bonusTimer = 90;
    this.bonusTotals = this.players.map((p) => p.bonus * p.bonusMult);
    this.bonusTotal = this.bonusTotals[0] ?? 0;
    for (const p of this.players) p.bonus = 0;
    this.sound(SOUND.prettyGood, 4);
  }

  gameOver(): void {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    this.sound(SOUND.gameOver, 5);
  }

  makeLargeRock(x: number, y: number): void {
    const rx = (4 + Math.floor(this.wave / 6)) * 16;
    let xv = 0, yv = 0;
    while (xv === 0) xv = this.rand.next(rx) - rx / 2;
    xv += xv > 0 ? 16 : -16;
    while (yv === 0) yv = this.rand.next(rx) - rx / 2;
    yv += yv > 0 ? 16 : -16;
    this.objects.push(new LargeRock(this, x, y, xv, yv, this.rand.next(3) + 2));
  }

  makeLargeRockAt(x: number, y: number, xv: number, yv: number): void {
    this.objects.push(new LargeRock(this, x, y, xv, yv, 3));
  }

  makeMediumRock(x: number, y: number): void {
    const rx = (4 + Math.floor(this.wave / 6)) * 16;
    let xv = 0, yv = 0;
    while (xv === 0) xv = this.rand.next(rx) - rx / 2;
    xv += xv > 0 ? 32 : -32;
    while (yv === 0) yv = this.rand.next(rx) - rx / 2;
    yv += yv > 0 ? 32 : -32;
    this.objects.push(new MediumRock(this, x, y, xv, yv, this.rand.next(3) + 1));
  }

  makeSmallRock(x: number, y: number): void {
    const rx = (4 + Math.floor(this.wave / 6)) * 16;
    let xv = 0, yv = 0;
    while (xv === 0) xv = this.rand.next(rx) - rx / 2;
    xv += xv > 0 ? 32 : -32;
    while (yv === 0) yv = this.rand.next(rx) - rx / 2;
    yv += yv > 0 ? 32 : -32;
    this.objects.push(new SmallRock(this, x, y, xv, yv, this.rand.next(3) + 1));
  }

  makeSteelRoid(x: number, y: number): void {
    this.objects.push(new SteelRoid(this, x, y, this.rand.next(8) - 4, this.rand.next(8) - 4));
  }

  makePrize(): void {
    const cap = this.rand.next(50) === 0 ? (this.rand.next(4) + 2) * 2 : 1;
    for (let i = 0; i < cap; i++) {
      const x = (this.rand.next(GAME_W - 32) + 32) * SCALE, y = 0;
      const rx = (4 + Math.floor(this.wave / 6)) * 16;
      let xv = 0, yv = 0;
      while (xv === 0) xv = this.rand.next(rx) - rx / 2;
      xv += xv > 0 ? 16 : -16;
      while (yv === 0) yv = this.rand.next(rx) - rx / 2;
      yv += yv > 0 ? 16 : -16;
      this.objects.push(new Prize(this, x, y, xv, yv));
    }
  }

  makeMultiplier(): void {
    const x = (this.rand.next(GAME_W - 96) + 32) * SCALE;
    const y = (this.rand.next(GAME_H - 96) + 32) * SCALE;
    this.objects.push(new Multiplier(this, x, y, this.rand.next(4) + 2));
  }

  makeBonus(): void {
    const cap = this.rand.next(50) === 0 ? (this.rand.next(4) + 2) * 2 : 1;
    for (let i = 0; i < cap; i++) {
      const x = (this.rand.next(GAME_W - 32) + 32) * SCALE, y = 0;
      const which = this.rand.next(6);
      const bonus = which === 0 ? 500 : which * 1000;
      const rx = (4 + Math.floor(this.wave / 6)) * 16;
      let xv = 0;
      while (xv === 0) xv = this.rand.next(Math.max(1, rx / 2));
      xv += 48;
      this.objects.push(new Bonus(this, x, y, xv, xv, bonus));
    }
  }

  makeNova(): void {
    let guard = 0;
    let x = 0, y = 0;
    do {
      x = (this.rand.next(GAME_W - 96) + 32) * SCALE;
      y = (this.rand.next(GAME_H - 96) + 32) * SCALE;
      guard++;
    } while (guard < 100 && this.players.some((p) => p.alive
      && Math.abs(p.x - x) < 64 * SCALE && Math.abs(p.y - y) < 64 * SCALE));
    this.objects.push(new Nova(this, x, y));
  }

  makeDamagedShip(): void {
    const x = (this.rand.next(GAME_W - 32) + 32) * SCALE, y = 0;
    let xv = 0, yv = 0;
    while (xv === 0) xv = this.rand.next(64) - 32;
    while (yv === 0) yv = this.rand.next(64) - 32;
    this.objects.push(new DamagedShip(this, x, y, xv, yv + (yv > 0 ? 16 : -16)));
  }

  makeGravity(): void {
    const x = (this.rand.next(GAME_W - 96) + 32) * SCALE;
    const y = (this.rand.next(GAME_H - 96) + 32) * SCALE;
    this.objects.push(new Gravity(this, x, y));
  }

  makeHoming(): void {
    let x = 0, y = 0;
    for (let guard = 0; guard < 100; guard++) {
      x = (this.rand.next(GAME_W - 32) + 32) * SCALE;
      y = (this.rand.next(GAME_H - 32) + 32) * SCALE;
      if (this.players.every((p) => !p.alive
        || Math.abs(p.x - x) > 64 * SCALE || Math.abs(p.y - y) > 64 * SCALE)) break;
    }
    this.objects.push(new Homing(this, x, y, this.rand.next(8) - 4, this.rand.next(8) - 4));
  }

  makeHomingAt(x: number, y: number, xv: number, yv: number): void {
    this.objects.push(new Homing(this, x, y, xv, yv));
  }

  makeEnemy(): void {
    const y = (this.rand.next(GAME_H - 32) + 32) * SCALE;
    const little = this.rand.next(5 + this.wave) > 10;
    this.objects.push(new Shenobi(this, 0, y, little));
  }

  prizeFor(p: Player): void {
    switch (this.rand.next(NUM_PRIZES)) {
      case 0: p.setSpecial(0x01); break;
      case 1: p.setSpecial(0x02); break;
      case 2: p.setSpecial(0x80); break;
      case 3: p.setSpecial(0x04); break;
      case 4: p.setSpecial(0x08); break;
      case 5: p.shieldLevel = Math.min(MAX_SHIELD, p.shieldLevel + MAX_SHIELD / 5 + this.rand.next(MAX_SHIELD / 2)); break;
      case 6: this.freezeTime = 150; break;
      case 7: this.novaBoom(); break;
      default: break;
    }
  }

  novaExplode(nova: MObject): void {
    this.sound(SOUND.novaBoom, 5);
    this.novaBoom(nova);
    this.shakeTime = 150;
  }

  novaBoom(skip?: MObject): void {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      if (o === skip) continue;
      if (o.beenDamaged(1) < 0) this.objects.splice(i, 1);
    }
    for (const p of this.players) p.noThrust = 150;
    this.shakeTime = 150;
  }

  tick(inputs: InputState | InputState[]): void {
    const input = Array.isArray(inputs) ? inputs : [inputs];
    if (this.state === 'bonus') {
      if (--this.bonusTimer <= 0) {
        this.players.forEach((p, i) => p.addScore(this.bonusTotals[i] ?? 0));
        this.startNextWave();
      }
      return;
    }
    if (this.state === 'gameover') return;
    this.players.forEach((p, i) => p.handleInput(input[i] ?? input[0] ?? defaultInput()));
    if (--this.nextBoom === 0) {
      this.sound(this.boomPhase ? SOUND.boom1 : SOUND.boom2, 0);
      this.boomPhase ^= 1;
      this.nextBoom = this.boomDelay;
    }
    // Shots and collisions against objects
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      if (!o.alive) continue;
      let removed = false;
      for (const p of this.players) {
        if (p.alive && o.hitBy(p)) { removed = true; break; }
      }
      if (removed) { this.objects.splice(i, 1); continue; }
      if (o instanceof Shenobi) {
        for (const p of this.players) {
          if (!p.alive) continue;
          for (;;) {
            const shot = o.shotHit(p.frameBounds());
            if (!shot) break;
            p.beenShot(o, shot);
          }
          if (o.collide(p)) p.beenRunOver(o);
        }
      }
    }
    if (this.mode === 'deathmatch') {
      for (const shooter of this.players) {
        if (!shooter.alive) continue;
        for (const target of this.players) {
          if (target !== shooter && target.alive) target.hitBy(shooter);
        }
      }
    }
    if (this.shakeTime) {
      for (const p of this.players) if (p.alive) p.shake();
      for (const o of this.objects) o.shake();
      this.shakeTime--;
    }
    for (const p of this.players) p.move(this.freezeTime > 0);
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      if (o.move(this.freezeTime > 0) < 0) this.objects.splice(i, 1);
    }
    if (this.freezeTime) this.freezeTime--;
    this.housekeeping();
  }

  housekeeping(): void {
    if (this.multiplierShown && --this.multiplierShown === 0) this.makeMultiplier();
    if (this.prizeShown && --this.prizeShown === 0) this.makePrize();
    if (this.bonusShown && --this.bonusShown === 0) this.makeBonus();
    if (this.whenEnemy && --this.whenEnemy === 0) this.makeEnemy();
    if (this.whenGrav && --this.whenGrav === 0) this.makeGravity();
    if (this.whenDamaged && --this.whenDamaged === 0) this.makeDamagedShip();
    if (this.whenHoming && --this.whenHoming === 0) this.makeHoming();
    if (this.whenNova && --this.whenNova === 0) this.makeNova();
    if (--this.lastStar === 0) {
      this.lastStar = 30;
      this.setStar(this.rand.next(30));
      this.setBorderStar(this.rand.next(150));
    }
    if (this.rockCount === 0) {
      if (this.whenDone === 0) this.whenDone = DEAD_DELAY - 1;
      if (--this.whenDone === 0) this.nextWave();
    }
    if (this.mode !== 'deathmatch') {
      for (const p of this.players) {
        while (p.score >= p.nextLife) {
          p.nextLife += NEW_LIFE;
          p.incrLives(1);
          this.sound(SOUND.newLife, 5);
        }
      }
    }
    if (this.mode === 'deathmatch' && this.players.some((p) => p.frags >= this.fragTarget)) {
      for (const p of this.players) p.playing = false;
      this.gameOver();
    } else if (this.players.every((p) => !p.playing || p.ghost)) this.gameOver();
  }
}

export function defaultInput(): InputState {
  return { thrust: false, brake: false, left: false, right: false, shield: false, fire: false };
}
