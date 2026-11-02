// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The rules: a TypeScript port of ClanBomber 2.2.0's game logic (Copyright (C) 1999-2004, 2007 Andreas Hundt,
// Denis Oliver Kropp; 2008-2011, 2017 Rene Lopez; GPL-3.0-or-later). Each class is the original's class of the same
// name, method by method (src/GameObject.cpp, Bomber.cpp, Bomb.cpp, Explosion.cpp, Extra*.cpp, Disease*.cpp,
// MapTile*.cpp, Map.cpp, MapEntry.cpp, Bomber_Corpse.cpp, Corpse_Part.cpp, Observer.cpp, and the local game of
// ClanBomber.cpp: init_game, run_game, delete_some, act_all). What a local game of the original does in one frame,
// Game.frame() does, with frames of 1/64 s: the original measures each frame's time; 1/64 is exact in a float, so
// the float arithmetic below (Math.fround after every operation, as the original's floats round) gives the same
// numbers as the original compiled for the oracle (test/oracle.test.ts). No drawing here: render.ts draws the state.
// The names of things on screen are Bomberslop's (README.md); the code keeps the original's names.

import { CRand } from './rand.ts';

export const MAP_WIDTH = 17;
export const MAP_HEIGHT = 13;
const f32 = Math.fround;
/** the length of a frame (Timer::time_elapsed), seconds */
export const DT = f32(1 / 64);
export const FPS = 64;

/** C++'s (int) of a float: truncation; NaN and what does not fit give INT_MIN, as x86-64's cvttss2si does */
export function cint(v: number): number {
  if (!(v > -2147483649 && v < 2147483648)) return -2147483648;
  return Math.trunc(v) | 0;
}
/** C's abs(int), INT_MIN included */
function cabs(i: number): number {
  return i === -2147483648 ? i : Math.abs(i);
}
/** C's integer division */
function idiv(a: number, b: number): number {
  return (a / b) | 0;
}

export const Dir = { NONE: -1, DOWN: 0, LEFT: 1, UP: 2, RIGHT: 3 } as const;
export type Dir = typeof Dir[keyof typeof Dir];
export const ObjType = { BOMB: 0, BOMBER: 1, BOMBER_CORPSE: 2, EXPLOSION: 3, EXTRA: 4, OBSERVER: 5, CORPSE_PART: 6 } as const;
export type ObjType = typeof ObjType[keyof typeof ObjType];
export const TileType = { NONE: -3, ARROW: -2, ICE: -1, GROUND: 0, WALL: 1, BOX: 2, TRAP: 3 } as const;
export type TileType = typeof TileType[keyof typeof TileType];
export const ExtraType = { VIAGRA: -3, JOINT: -2, KOKS: -1, GLOVE: 1, KICK: 2, SKATEBOARD: 3, BOMB: 4, POWER: 5 } as const;
export type ExtraType = typeof ExtraType[keyof typeof ExtraType];
export const DiseaseType = { FROZEN: -4, PUTBOMB: -3, STONED: -2, FAST: -1 } as const;
export type DiseaseType = typeof DiseaseType[keyof typeof DiseaseType];

/** GameConfig: the original's settings, with its defaults (src/GameConfig.cpp) */
export interface Config {
  round_time: number; max_skateboards: number; max_power: number; max_bombs: number; start_skateboards: number;
  start_power: number; start_bombs: number; start_kick: number; start_glove: number; skateboards: number; power: number;
  bombs: number; kick: number; glove: number; joint: number; viagra: number; koks: number; random_map_order: number;
  kids_mode: number; random_positions: number; corpse_parts: number; bomb_countdown: number; bomb_delay: number;
  bomb_speed: number; points_to_win: number; start_map: number;
}

export const DEFAULT_CONFIG: Config = {
  round_time: 90, max_skateboards: 5, max_power: 12, max_bombs: 9, start_skateboards: 0, start_power: 1, start_bombs: 1,
  start_kick: 0, start_glove: 0, skateboards: 1, power: 1, bombs: 1, kick: 1, glove: 1, joint: 1, viagra: 1, koks: 1,
  random_map_order: 0, kids_mode: 0, random_positions: 1, corpse_parts: 10, bomb_countdown: 25, bomb_delay: 10,
  bomb_speed: 160, points_to_win: 5, start_map: 0,
};

/** a player's keys in one frame */
export interface Keys {
  left: boolean; up: boolean; right: boolean; down: boolean; bomb: boolean;
}
export const NO_KEYS: Keys = { left: false, up: false, right: false, down: false, bomb: false };

// ---------------------------------------------------------------- maps (MapEntry)

/** one map file: author, most players, 13 rows of 17 characters (the original's .map format) */
export class MapEntry {
  readonly name: string;
  author = '';
  max_players = 4;
  /** data[x][y] */
  readonly data: string[][] = [];
  bomber_pos: { x: number; y: number }[] = [];

  constructor(name: string, text: string) {
    this.name = name;
    // MapEntry::reload: the author line, the number, then 17x13 characters, newlines skipped
    const nl = text.indexOf('\n');
    this.author = text.slice(0, nl < 0 ? text.length : nl).replace(/\r$/, '');
    let at = nl + 1;
    const num = /^\s*(-?\d+)/.exec(text.slice(at));
    this.max_players = num ? Number(num[1]) : 0;
    at += num ? num[0].length : 0;
    for (let x = 0; x < MAP_WIDTH; x++) this.data.push([]);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        let ch: string;
        do {
          ch = at < text.length ? text[at++] : '￿';
        } while (ch === '\n');
        this.data[x][y] = ch;
      }
    }
    this.read_bomber_positions();
  }

  read_bomber_positions(): void {
    this.bomber_pos = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const c = this.data[x][y].charCodeAt(0);
        if (c >= 48 && c <= 55) this.bomber_pos[c - 48] = { x, y };
      }
    }
  }

  randomize_bomber_positions(rand: CRand): void {
    const taken = [false, false, false, false, false, false, false, false];
    const temp: { x: number; y: number }[] = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));
    for (let i = 0; i < this.max_players; i++) {
      let p: number;
      do {
        p = rand.rand() % this.max_players;
      } while (taken[p]);
      temp[p] = this.bomber_pos[i];
      taken[p] = true;
    }
    this.bomber_pos = temp;
  }
}

/** the original's map list order: by name, case-insensitive (Map::sort_maps, a bubble sort with strcasecmp) */
export function sortMaps(maps: MapEntry[]): MapEntry[] {
  const a = maps.slice();
  let found = true;
  while (found) {
    found = false;
    for (let i = 0; i < a.length - 1; i++) {
      if (strcasecmp(a[i].name, a[i + 1].name) > 0) {
        const t = a[i];
        a[i] = a[i + 1];
        a[i + 1] = t;
        found = true;
      }
    }
  }
  return a;
}

function strcasecmp(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = a.toLowerCase().charCodeAt(i) - b.toLowerCase().charCodeAt(i);
    if (d) return d;
  }
  return a.length - b.length;
}

// ---------------------------------------------------------------- game objects

export abstract class GameObject {
  readonly game: Game;
  x: number;
  y: number;
  orig_x: number;
  orig_y: number;
  remainder = 0;
  speed = 240;
  cur_dir: Dir = Dir.NONE;
  can_kick = false;
  can_pass_bomber = false;
  can_fly_over_walls = true;
  flying = false;
  falling = false;
  fallen_down = false;
  stopped = false;
  fly_progress = 0;
  fly_dist_x = 0;
  fly_dist_y = 0;
  fly_dest_x = 0;
  fly_dest_y = 0;
  fly_speed = 0;
  fall_countdown = 0;
  delete_me = false;
  /** the picture's opacity (the original's opacity_scaled), for drawing only */
  opacity = 255;

  constructor(game: Game, x: number, y: number) {
    this.game = game;
    this.x = this.orig_x = x;
    this.y = this.orig_y = y;
  }

  abstract get type(): ObjectTypeOf;

  get_x(): number {
    return cint(this.x);
  }

  get_y(): number {
    return cint(this.y);
  }

  get_maptile(): MapTile {
    return this.game.map.get_maptile_xy(cint(f32(this.x + 20)), cint(f32(this.y + 20)));
  }

  is_falling(): boolean {
    return this.falling && !this.fallen_down;
  }

  protected move_right(): boolean {
    const map = this.game.map;
    const right = map.get_maptile_xy(cint(f32(this.x + 40)), cint(f32(this.y + 20)));
    if (right.blocking) return false;
    if (right.bomb === null || (this.type === ObjType.BOMB && right.bomb === (this as unknown)) || this.get_x() % 40 > 19) {
      this.x = f32(this.x + 1);
      if (this.get_y() % 40 > 19) {
        if (map.get_maptile(idiv(this.get_x() + 40, 40), idiv(this.get_y() - 20, 40)).blocking) this.y = f32(this.y + 1);
      } else if (this.get_y() % 40 > 0) {
        if (map.get_maptile(idiv(this.get_x() + 40, 40), idiv(this.get_y() + 60, 40)).blocking) this.y = f32(this.y - 1);
      }
      if (!this.can_pass_bomber && right.has_bomber() && right !== this.get_maptile()) {
        this.x = f32(this.x - 1);
        return false;
      }
    } else {
      if (this.can_kick && right.bomb.cur_dir === Dir.NONE) right.bomb.kick(Dir.RIGHT);
      return false;
    }
    return true;
  }

  protected move_left(): boolean {
    const map = this.game.map;
    const left = map.get_maptile_xy(cint(f32(this.x - 1)), cint(f32(this.y + 20)));
    if (left.blocking) return false;
    if (left.bomb === null || (this.type === ObjType.BOMB && left.bomb === (this as unknown)) || this.get_x() % 40 < 20) {
      this.x = f32(this.x - 1);
      if (this.get_y() % 40 > 19) {
        if (map.get_maptile(idiv(this.get_x() - 1, 40), idiv(this.get_y() - 20, 40)).blocking) this.y = f32(this.y + 1);
      } else if (this.get_y() % 40 > 0) {
        if (map.get_maptile(idiv(this.get_x() - 1, 40), idiv(this.get_y() + 60, 40)).blocking) this.y = f32(this.y - 1);
      }
      if (!this.can_pass_bomber && left.has_bomber() && left !== this.get_maptile()) {
        this.x = f32(this.x + 1);
        return false;
      }
    } else {
      if (this.can_kick && left.bomb.cur_dir === Dir.NONE) left.bomb.kick(Dir.LEFT);
      return false;
    }
    return true;
  }

  protected move_up(): boolean {
    const map = this.game.map;
    const up = map.get_maptile_xy(cint(f32(this.x + 20)), cint(f32(this.y - 1)));
    if (up.blocking) return false;
    if (up.bomb === null || (this.type === ObjType.BOMB && up.bomb === (this as unknown)) || this.get_y() % 40 < 20) {
      this.y = f32(this.y - 1);
      if (this.get_x() % 40 > 19) {
        if (map.get_maptile(idiv(this.get_x() - 20, 40), idiv(this.get_y() - 1, 40)).blocking) this.x = f32(this.x + 1);
      } else if (this.get_x() % 40 > 0) {
        if (map.get_maptile(idiv(this.get_x() + 60, 40), idiv(this.get_y() - 1, 40)).blocking) this.x = f32(this.x - 1);
      }
      if (!this.can_pass_bomber && up.has_bomber() && up !== this.get_maptile()) {
        this.y = f32(this.y + 1);
        return false;
      }
    } else {
      if (this.can_kick && up.bomb.cur_dir === Dir.NONE) up.bomb.kick(Dir.UP);
      return false;
    }
    return true;
  }

  protected move_down(): boolean {
    const map = this.game.map;
    const down = map.get_maptile_xy(cint(f32(this.x + 20)), cint(f32(this.y + 40)));
    if (down.blocking) return false;
    if (down.bomb === null || (this.type === ObjType.BOMB && down.bomb === (this as unknown)) || this.get_y() % 40 > 19) {
      this.y = f32(this.y + 1);
      if (this.get_x() % 40 > 19) {
        if (map.get_maptile(idiv(this.get_x() - 20, 40), idiv(this.get_y() + 40, 40)).blocking) this.x = f32(this.x + 1);
      } else if (this.get_x() % 40 > 0) {
        if (map.get_maptile(idiv(this.get_x() + 60, 40), idiv(this.get_y() + 40, 40)).blocking) this.x = f32(this.x - 1);
      }
      if (!this.can_pass_bomber && down.has_bomber() && down !== this.get_maptile()) {
        this.y = f32(this.y - 1);
        return false;
      }
    } else {
      if (this.can_kick && down.bomb.cur_dir === Dir.NONE) down.bomb.kick(Dir.DOWN);
      return false;
    }
    return true;
  }

  /** GameObject::move(): this object's speed in its direction */
  protected move(): boolean {
    if (!this.flying) return this.step(this.speed, this.cur_dir);
    return true;
  }

  /** GameObject::move(int, Direction): the ice tile pushes this way */
  move_with(speed: number, dir: Dir): boolean {
    if (dir === Dir.NONE && this.cur_dir !== Dir.NONE) return this.move_with(speed, this.cur_dir);
    return this.step(speed, dir);
  }

  private step(speed: number, dir: Dir): boolean {
    const d = f32(DT * speed);
    let span = cint(d);
    this.remainder = f32(this.remainder + f32(d - cint(d)));
    span += cint(this.remainder);
    this.remainder = f32(this.remainder - cint(this.remainder));
    for (let i = 0; i < span; i++) {
      let ok = true;
      switch (dir) {
        case Dir.LEFT: ok = this.move_left(); break;
        case Dir.RIGHT: ok = this.move_right(); break;
        case Dir.UP: ok = this.move_up(); break;
        case Dir.DOWN: ok = this.move_down(); break;
        default: break;
      }
      if (!ok) {
        this.stop();
        return false;
      }
    }
    return true;
  }

  act(): void {
    this.stopped = false;
    if (this.flying) {
      this.continue_flying();
      return;
    }
    if (this.falling) this.continue_falling();
  }

  fly_to(x: number, y: number, speed = 0): void {
    if (this.flying || this.falling || this.fallen_down) return;
    this.flying = true;
    this.fly_dest_x = f32(x);
    this.fly_dest_y = f32(y);
    this.fly_progress = 0;
    this.fly_dist_x = f32(x - this.x);
    this.fly_dist_y = f32(y - this.y);
    this.fly_speed = f32(speed ? speed : this.speed);
    const len = f32(Math.sqrt(f32(f32(this.fly_dist_x * this.fly_dist_x) + f32(this.fly_dist_y * this.fly_dist_y))));
    this.fly_speed = f32(this.fly_speed / len);
  }

  fly_to_tile(tile: MapTile | null, speed = 0): void {
    if (tile) this.fly_to(tile.x, tile.y, speed);
  }

  protected continue_flying(): void {
    let time_step = DT;
    let steps = 1;
    const map = this.game.map;
    while (cabs(cint(f32(f32(time_step * this.fly_speed) * this.fly_dist_x))) > 5
      || cabs(cint(f32(f32(time_step * this.fly_speed) * this.fly_dist_y))) > 5) {
      time_step = f32(time_step / 2);
      steps *= 2;
    }
    while (steps--) {
      const dx = f32(f32(time_step * this.fly_speed) * this.fly_dist_x);
      const dy = f32(f32(time_step * this.fly_speed) * this.fly_dist_y);
      this.x = f32(this.x + dx);
      this.y = f32(this.y + dy);
      if (this.type === ObjType.CORPSE_PART) {
        if (!this.can_fly_over_walls && this.get_maptile().type === TileType.WALL) {
          this.x = f32(this.x - dx);
          this.y = f32(this.y - dy);
          this.fly_dest_x = this.x;
          this.fly_dest_y = this.y;
        }
      } else if (!this.can_fly_over_walls && (
        map.get_maptile_xy(cint(this.x), cint(this.y)).type === TileType.WALL
        || map.get_maptile_xy(cint(f32(this.x + 39)), cint(this.y)).type === TileType.WALL
        || map.get_maptile_xy(cint(this.x), cint(f32(this.y + 39))).type === TileType.WALL
        || map.get_maptile_xy(cint(f32(this.x + 39)), cint(f32(this.y + 39))).type === TileType.WALL)) {
        this.x = f32(this.x - dx);
        this.y = f32(this.y - dy);
        this.fly_dest_x = this.x;
        this.fly_dest_y = this.y;
      }
      this.fly_progress = f32(this.fly_progress + f32(time_step * this.fly_speed));
      if (this.fly_progress >= 1) {
        this.flying = false;
        this.fly_progress = 1;
        this.x = this.fly_dest_x;
        this.y = this.fly_dest_y;
      }
    }
  }

  fall(): void {
    if (this.falling) return;
    this.falling = true;
    this.fall_countdown = 1;
    if (this.type !== ObjType.CORPSE_PART && this.type !== ObjType.EXTRA) this.game.sound('deepfall');
  }

  protected continue_falling(): void {
    this.speed = cint(f32(this.fall_countdown * 60));
    this.fall_countdown = f32(this.fall_countdown - DT);
    if (this.fall_countdown < 0) {
      this.fallen_down = true;
      this.fall_countdown = 0;
    }
    this.opacity = cint(f32(this.fall_countdown * 255)) & 255;
  }

  stop(_by_arrow = false): void {
    this.stopped = true;
  }

  snap(): void {
    this.x = f32(idiv(this.get_x() + 20, 40) * 40);
    this.y = f32(idiv(this.get_y() + 20, 40) * 40);
  }

  /** the C++ destructor */
  destroy(): void {}
}

type ObjectTypeOf = ObjType;

// ---------------------------------------------------------------- controllers

/** Controller_Keyboard on keys given each frame (the oracle's Controller_Script is the same) */
export class Controller {
  keys: Keys = NO_KEYS;
  active = false;
  reverse = false;
  bomb_mode: 'normal' | 'always' = 'normal';
  put_bomb = false;
  bomb_key_state = false;

  reset(): void {
    this.put_bomb = false;
    this.bomb_key_state = false;
    this.reverse = false;
  }

  update(): void {
    this.put_bomb = this.keys.bomb && !this.bomb_key_state;
    this.bomb_key_state = this.keys.bomb;
  }

  is_left(): boolean { return (this.reverse ? this.keys.right : this.keys.left) && this.active; }
  is_right(): boolean { return (this.reverse ? this.keys.left : this.keys.right) && this.active; }
  is_up(): boolean { return (this.reverse ? this.keys.down : this.keys.up) && this.active; }
  is_down(): boolean { return (this.reverse ? this.keys.up : this.keys.down) && this.active; }

  is_bomb(): boolean {
    if (this.bomb_mode === 'always') return true;
    return this.put_bomb && this.active;
  }
}

// ---------------------------------------------------------------- diseases

export abstract class Disease {
  readonly bomber: Bomber;
  countdown = -1;

  constructor(bomber: Bomber) {
    this.bomber = bomber;
  }

  abstract get type(): DiseaseType;
  abstract start(): void;
  abstract stop(): void;
  abstract spawn(b: Bomber): Disease;
  abstract spawn_extra(x: number, y: number): Extra;

  act(): void {
    if (this.countdown !== -1) {
      this.countdown = f32(this.countdown - DT);
      if (this.countdown < 0) {
        this.stop();
        this.countdown = -1;
      }
    }
  }
}

/** Disease_Fast ("koks"): ten seconds of 600 more speed; in Bomberslop the Jitter Soda */
class DiseaseFast extends Disease {
  constructor(b: Bomber) { super(b); this.start(); }
  get type() { return DiseaseType.FAST; }
  start() { this.countdown = 10; this.bomber.speed += 600; }
  stop() { this.bomber.speed -= 600; }
  spawn(b: Bomber) { return new DiseaseFast(b); }
  spawn_extra(x: number, y: number) { return new Extra(this.bomber.game, x, y, ExtraType.KOKS); }
}

/** Disease_PutBomb ("viagra"): ten seconds of laying a bomb wherever possible; in Bomberslop the Hiccup Beans */
class DiseasePutBomb extends Disease {
  constructor(b: Bomber) { super(b); this.start(); }
  get type() { return DiseaseType.PUTBOMB; }
  start() { this.countdown = 10; this.bomber.controller.bomb_mode = 'always'; }
  stop() { this.bomber.controller.bomb_mode = 'normal'; }
  spawn(b: Bomber) { return new DiseasePutBomb(b); }
  spawn_extra(x: number, y: number) { return new Extra(this.bomber.game, x, y, ExtraType.VIAGRA); }
}

/** Disease_Stoned ("joint"): ten seconds of reversed controls; in Bomberslop the Swirl Mushroom */
class DiseaseStoned extends Disease {
  constructor(b: Bomber) { super(b); this.start(); }
  get type() { return DiseaseType.STONED; }
  start() { this.countdown = 10; this.bomber.controller.reverse = !this.bomber.controller.reverse; }
  stop() { this.bomber.controller.reverse = !this.bomber.controller.reverse; }
  spawn(b: Bomber) { return new DiseaseStoned(b); }
  spawn_extra(x: number, y: number) { return new Extra(this.bomber.game, x, y, ExtraType.JOINT); }
}

// ---------------------------------------------------------------- the bomber

export class Bomber extends GameObject {
  readonly number: number;
  readonly color: number;
  readonly controller: Controller;
  points = 0;
  kills = 0;
  deaths = 0;
  disease: Disease | null = null;
  dead = false;
  anim_count = 0;
  skateboards = 0;
  cur_bombs = 0;
  bombs = 0;
  power = 0;
  gloves = 0;
  extra_gloves = 0;
  extra_skateboards = 0;
  extra_power = 0;
  extra_kick = 0;
  extra_bombs = 0;
  /** for drawing: the frame's walk picture (the original's sprite_nr) */
  sprite_nr = 0;
  /** left the online game (from this frame on it is dead and stays out) */
  gone = false;

  constructor(game: Game, x: number, y: number, color: number, controller: Controller, number: number) {
    super(game, x, y);
    this.color = color;
    this.number = number;
    this.controller = controller;
    controller.reset();
    controller.active = false;
    this.reset();
    game.bomber_objects.push(this);
  }

  get type() { return ObjType.BOMBER; }

  reset(): void {
    this.opacity = 255;
    this.cur_dir = this.orig_x > 300 ? Dir.LEFT : Dir.RIGHT;
    this.sprite_nr = 0;
    this.can_pass_bomber = true;
    if (this.disease) {
      this.disease.stop();
      this.disease = null;
    }
    this.dead = false;
    this.falling = false;
    this.fallen_down = false;
    this.flying = false;
    this.extra_gloves = 0;
    this.extra_skateboards = 0;
    this.extra_power = 0;
    this.extra_kick = 0;
    this.extra_bombs = 0;
    const c = this.game.config;
    this.skateboards = c.start_skateboards;
    this.speed = 90 + this.skateboards * 40;
    this.can_kick = !!c.start_kick;
    this.cur_bombs = c.start_bombs;
    this.bombs = c.start_bombs;
    this.power = c.start_power;
    this.gloves = c.start_glove;
    this.x = f32(this.orig_x);
    this.y = f32(this.orig_y);
    this.anim_count = 0;
    if (this.gone) {
      this.dead = true;
      this.x = 0;
      this.y = 0;
    }
  }

  act(): void {
    if (this.dead) return;
    this.controller.update();
    if (this.disease) {
      this.infect_others();
      this.disease.act();
      if (this.disease.countdown === -1) this.disease = null;
    }
    super.act();
    let moved = false;
    if (this.fallen_down) {
      this.die();
      return;
    }
    const c = this.controller;
    if (c.is_left()) {
      moved = true;
      this.cur_dir = Dir.LEFT;
    } else if (c.is_up()) {
      moved = true;
      this.cur_dir = Dir.UP;
    } else if (c.is_right()) {
      moved = true;
      this.cur_dir = Dir.RIGHT;
    } else if (c.is_down()) {
      moved = true;
      this.cur_dir = Dir.DOWN;
    } else {
      this.anim_count = 0;
    }
    if (moved) {
      this.anim_count = f32(this.anim_count + f32(f32(DT * 20) * idiv(this.speed, 90)));
      this.move();
    }
    if (this.anim_count >= 9) this.anim_count = 1;
    this.sprite_nr = this.cur_dir * 10 + cint(this.anim_count);
    if (c.is_bomb()) {
      const tile = this.get_maptile();
      if (tile.bomb) {
        if (this.gloves && !moved) {
          tile.bomb.throww(this.cur_dir);
          this.anim_count = 2;
        }
      } else {
        this.put_bomb();
      }
    }
  }

  private infect_others(): void {
    for (const o of this.get_maptile().objects) {
      if (o.type === ObjType.BOMBER && !(o as Bomber).disease) (o as Bomber).infect(this.disease!.spawn(o as Bomber));
    }
  }

  put_bomb(): void {
    if (this.cur_bombs && !this.falling) {
      const bx = cint(f32(f32(this.x + 20) / 40));
      const by = cint(f32(f32(this.y + 20) / 40));
      if (this.game.map.add_bomb(bx, by, this.power, this)) this.game.sound('putbomb');
    }
  }

  gain_extra_skateboard(): void {
    if (this.game.config.max_skateboards > this.skateboards) {
      this.skateboards++;
      this.extra_skateboards++;
      this.speed += 40;
    }
  }

  gain_extra_bomb(): void {
    if (this.game.config.max_bombs > this.bombs) {
      this.bombs++;
      this.extra_bombs++;
      this.cur_bombs++;
    }
  }

  gain_extra_glove(): void {
    this.gloves++;
    this.extra_gloves++;
  }

  gain_extra_power(): void {
    if (this.game.config.max_power > this.power) {
      this.power++;
      this.extra_power++;
    }
  }

  gain_extra_kick(): void {
    this.can_kick = true;
    this.extra_kick++;
  }

  loose_all_extras(): void {
    const g = this.game;
    const fly = (t: ExtraType, n: number) => {
      for (let i = 0; i < n; i++) new Extra(g, cint(this.x), cint(this.y), t).fly_to_tile(g.map.get_passable());
    };
    fly(ExtraType.BOMB, this.extra_bombs);
    this.extra_bombs = 0;
    fly(ExtraType.POWER, this.extra_power);
    this.extra_power = 0;
    fly(ExtraType.SKATEBOARD, this.extra_skateboards);
    this.extra_skateboards = 0;
    fly(ExtraType.KICK, this.extra_kick);
    this.extra_kick = 0;
    fly(ExtraType.GLOVE, this.extra_gloves);
    this.extra_gloves = 0;
  }

  loose_disease(): void {
    if (this.disease) {
      this.disease.stop();
      const e = this.disease.spawn_extra(cint(this.x), cint(this.y));
      e.fly_to_tile(this.game.map.get_passable());
      this.disease = null;
    }
  }

  infect(d: Disease): void {
    if (this.disease) this.disease.stop();
    this.disease = d;
  }

  inc_cur_bombs(): void {
    this.cur_bombs++;
  }

  dec_cur_bombs(): void {
    if (this.cur_bombs) this.cur_bombs--;
  }

  die(): boolean {
    if (this.dead || this.is_falling()) return false;
    this.dead = true;
    this.deaths++;
    this.game.sound('die');
    if (!this.fallen_down) {
      this.loose_all_extras();
      if (!this.game.config.kids_mode) new BomberCorpse(this.game, cint(this.x), cint(this.y), this.color, this.cur_dir * 10 + 9);
    }
    this.game.event({ kind: 'die', bomber: this.number, x: this.x, y: this.y, fell: this.fallen_down });
    this.x = 0;
    this.y = 0;
    this.sprite_nr = this.cur_dir * 10 + 9;
    return true;
  }
}

// ---------------------------------------------------------------- bombs and explosions

export class Bomb extends GameObject {
  readonly bomber: Bomber;
  readonly power: number;
  detonation_countdown: number;
  cur_scale = 0;
  exploding = false;

  constructor(game: Game, x: number, y: number, power: number, bomber: Bomber) {
    super(game, x, y);
    this.detonation_countdown = f32(game.config.bomb_countdown / 10);
    this.cur_dir = Dir.NONE;
    this.speed = game.config.bomb_speed;
    this.can_kick = false;
    this.can_fly_over_walls = false;
    this.bomber = bomber;
    this.power = power;
    bomber.dec_cur_bombs();
    game.objects.push(this);
  }

  get type() { return ObjType.BOMB; }

  destroy(): void {
    this.bomber.inc_cur_bombs();
    this.get_maptile().bomb = null;
  }

  stop(by_arrow = false): void {
    super.stop(by_arrow);
    if (!this.flying) {
      this.cur_dir = Dir.NONE;
      this.snap();
    }
  }

  kick(dir: Dir): void {
    if (!this.flying) this.cur_dir = dir;
  }

  throww(dir: Dir, fields = 4): void {
    this.can_fly_over_walls = false;
    if (fields > 0 && !this.flying) {
      this.cur_dir = dir;
      switch (dir) {
        case Dir.UP: this.fly_to(this.get_x(), this.get_y() - fields * 40); break;
        case Dir.DOWN: this.fly_to(this.get_x(), this.get_y() + fields * 40); break;
        case Dir.LEFT: this.fly_to(this.get_x() - fields * 40, this.get_y()); break;
        case Dir.RIGHT: this.fly_to(this.get_x() + fields * 40, this.get_y()); break;
        default: break;
      }
    }
  }

  act(): void {
    super.act();
    if (this.fallen_down) {
      this.delete_me = true;
      return;
    }
    if (this.flying) return;
    if (this.fly_progress === 1) {
      this.fly_progress = 0;
      this.can_fly_over_walls = false;
      if (this.get_maptile().bomb) this.throww(this.cur_dir, 1);
      else this.cur_dir = Dir.NONE;
    } else {
      this.move();
      this.cur_scale = f32(this.cur_scale + f32(DT * 10));
      this.detonation_countdown = f32(this.detonation_countdown - DT);
      if (this.detonation_countdown <= 0) this.explode();
    }
  }

  explode(): void {
    if (!this.exploding && !this.falling) {
      this.snap();
      this.exploding = true;
      new Explosion(this.game, cint(this.x), cint(this.y), this.power, this.bomber);
      this.game.shake = cint(f32(f32(0.25) / DT));
      this.delete_me = true;
    }
  }

  explode_delayed(): void {
    const delay = f32(this.game.config.bomb_delay / 100);
    if (this.detonation_countdown > delay) {
      this.detonation_countdown = delay;
      if (this.detonation_countdown === 0) this.explode();
    }
  }
}

export class Explosion extends GameObject {
  readonly X: number;
  readonly Y: number;
  readonly power: number;
  readonly bomber: Bomber;
  detonation_period = 0.5;
  l_left = 0;
  l_right = 0;
  l_up = 0;
  l_down = 0;

  constructor(game: Game, x: number, y: number, power: number, bomber: Bomber) {
    super(game, x, y);
    this.X = idiv(x + 20, 40);
    this.Y = idiv(y + 20, 40);
    this.power = power;
    this.bomber = bomber;
    game.sound('explode');
    game.objects.push(this);
    this.find_lengths();
    this.do_destruction();
    this.splatter_corpses();
  }

  get type() { return ObjType.EXPLOSION; }

  private find_lengths(): void {
    const m = this.game.map;
    const len = (dx: number, dy: number) => {
      let i: number;
      for (i = 1; i <= this.power; i++) {
        const t = m.get_maptile(this.X + dx * i, this.Y + dy * i);
        if (t.blocking || t.has_extra()) break;
      }
      return i - 1;
    };
    this.l_left = len(-1, 0);
    this.l_right = len(1, 0);
    this.l_up = len(0, -1);
    this.l_down = len(0, 1);
  }

  /** a map position the blast covers */
  covers(bx: number, by: number): boolean {
    return (by === this.Y && bx >= this.X - this.l_left && bx <= this.X + this.l_right)
      || (bx === this.X && by >= this.Y - this.l_up && by <= this.Y + this.l_down);
  }

  private kill_bombers(): void {
    for (const b of this.game.bomber_objects) {
      if (this.covers(idiv(b.get_x() + 20, 40), idiv(b.get_y() + 20, 40))) {
        if (b.die() && b !== this.bomber) this.bomber.kills++;
      }
    }
  }

  private destroy_extras(): void {
    for (const o of this.game.objects) {
      if (o.type === ObjType.EXTRA && this.covers(idiv(o.get_x() + 20, 40), idiv(o.get_y() + 20, 40)) && !o.flying) {
        (o as Extra).destroy_extra();
      }
    }
  }

  private splatter_corpses(): void {
    for (const o of this.game.objects) {
      if (o.type === ObjType.BOMBER_CORPSE && this.covers(idiv(o.get_x() + 20, 40), idiv(o.get_y() + 20, 40))) {
        (o as BomberCorpse).explode();
      }
    }
  }

  act(): void {
    this.detonate_other_bombs();
    this.kill_bombers();
    this.destroy_extras();
    this.detonation_period = f32(this.detonation_period - DT);
    if (this.detonation_period < 0) this.delete_me = true;
  }

  private do_destruction(): void {
    const m = this.game.map;
    m.get_maptile(this.X, this.Y).destroy();
    if (this.l_left < this.power) m.get_maptile(this.X - this.l_left - 1, this.Y).destroy();
    if (this.l_right < this.power) m.get_maptile(this.X + this.l_right + 1, this.Y).destroy();
    if (this.l_up < this.power) m.get_maptile(this.X, this.Y - this.l_up - 1).destroy();
    if (this.l_down < this.power) m.get_maptile(this.X, this.Y + this.l_down + 1).destroy();
  }

  private detonate_other_bombs(): void {
    const m = this.game.map;
    for (let i = 0; i <= this.l_left; i++) {
      const b = m.get_maptile(this.X - i, this.Y).bomb;
      if (b) {
        b.explode_delayed();
        break;
      }
    }
    for (let i = 1; i <= this.l_right; i++) {
      const b = m.get_maptile(this.X + i, this.Y).bomb;
      if (b) {
        b.explode_delayed();
        break;
      }
    }
    for (let i = 1; i <= this.l_up; i++) {
      const b = m.get_maptile(this.X, this.Y - i).bomb;
      if (b) {
        b.explode_delayed();
        break;
      }
    }
    for (let i = 1; i <= this.l_down; i++) {
      const b = m.get_maptile(this.X, this.Y + i).bomb;
      if (b) {
        b.explode_delayed();
        break;
      }
    }
  }
}

// ---------------------------------------------------------------- extras

export class Extra extends GameObject {
  readonly extra: ExtraType;
  destroyed = false;
  destroyable = true;
  destroy_countdown = 0;

  constructor(game: Game, x: number, y: number, extra: ExtraType) {
    super(game, x, y);
    this.extra = extra;
    this.opacity = 0xbb;
    // the diseases cannot burn: Extra_Joint, Extra_Koks and Extra_Viagra set destroyable = false
    this.destroyable = extra !== ExtraType.JOINT && extra !== ExtraType.KOKS && extra !== ExtraType.VIAGRA;
    game.objects.push(this);
  }

  get type() { return ObjType.EXTRA; }

  act(): void {
    super.act();
    if (this.falling) return;
    if (this.fallen_down) {
      this.delete_me = true;
      return;
    }
    if (this.destroyed) {
      this.destroy_countdown = f32(this.destroy_countdown - DT);
      if (this.destroy_countdown <= 0) {
        this.delete_me = true;
        return;
      }
    }
    if (!this.flying) {
      for (const o of this.get_maptile().objects) {
        if (o.type === ObjType.BOMBER) {
          this.effect(o as Bomber);
          this.delete_me = true;
        }
      }
    }
  }

  /** Extra::destroy */
  destroy_extra(): void {
    if (this.destroyed) return;
    if (this.destroyable) {
      this.destroyed = true;
      this.destroy_countdown = 0.5;
    } else {
      this.fly_to_tile(this.game.map.get_passable());
    }
  }

  private effect(b: Bomber): void {
    b.loose_disease();
    switch (this.extra) {
      case ExtraType.BOMB: b.gain_extra_bomb(); this.game.sound('wow'); break;
      case ExtraType.GLOVE: b.gain_extra_glove(); this.game.sound('wow'); break;
      case ExtraType.KICK: b.gain_extra_kick(); this.game.sound('wow'); break;
      case ExtraType.POWER: b.gain_extra_power(); this.game.sound('wow'); break;
      case ExtraType.SKATEBOARD: b.gain_extra_skateboard(); this.game.sound('wow'); break;
      case ExtraType.JOINT: b.infect(new DiseaseStoned(b)); this.game.sound('joint'); break;
      case ExtraType.KOKS: b.infect(new DiseaseFast(b)); this.game.sound('schnief'); break;
      case ExtraType.VIAGRA: b.infect(new DiseasePutBomb(b)); this.game.sound('horny'); break;
    }
    this.game.event({ kind: 'extra', bomber: b.number, extra: this.extra, x: this.x, y: this.y });
  }
}

// ---------------------------------------------------------------- what is left of a bomber

/** Bomber_Corpse; in Bomberslop the puddle of slop a bomber leaves */
export class BomberCorpse extends GameObject {
  readonly color: number;
  readonly sprite_nr: number;
  splash_counter = 0;
  ready_to_splash = true;
  explode_delay = f32(0.8);

  constructor(game: Game, x: number, y: number, color: number, sprite_nr: number) {
    super(game, x, y);
    this.color = color;
    this.sprite_nr = sprite_nr;
    this.speed = 30;
    game.objects.push(this);
  }

  get type() { return ObjType.BOMBER_CORPSE; }

  act(): void {
    if (this.falling) {
      this.continue_falling();
      if (this.fallen_down) {
        this.delete_me = true;
        return;
      }
    }
    if (this.splash_counter !== -1) {
      this.cur_dir = (this.game.rand.rand() % 4) as Dir;
      this.move();
      for (const b of this.game.bomber_objects) {
        if (!b.dead && Math.abs(b.get_x() - this.get_x()) < 30 && Math.abs(b.get_y() - this.get_y()) < 30) {
          if (this.ready_to_splash) {
            this.game.sound(this.game.rand.rand() % 2 ? 'splash2a' : 'splash1a');
            this.splash_counter++;
            if (this.splash_counter === 5) this.splash_counter = -1;
          }
          this.ready_to_splash = false;
          return;
        }
      }
    }
    this.ready_to_splash = true;
    this.explode_delay = f32(this.explode_delay - DT);
  }

  explode(): void {
    if (this.explode_delay < 0) {
      const g = this.game;
      g.sound('corpse_explode');
      this.delete_me = true;
      for (let i = 0; i < g.config.corpse_parts; i++) {
        const cp = new CorpsePart(g, cint(this.x), cint(this.y), this.color);
        const xm = g.rand.rand() % 17;
        const ym = g.rand.rand() % 13;
        // the arguments of fly_to(x, y) as GCC evaluates them on x86-64: y first
        const ty = ym * 40 + g.rand.rand() % 20 - 10;
        const tx = xm * 40 + g.rand.rand() % 20 - 10;
        cp.fly_to(tx, ty);
      }
    }
  }
}

/** Corpse_Part; in Bomberslop a drop of slop */
export class CorpsePart extends GameObject {
  readonly sprite_nr: number;
  readonly color: number;
  countdown = 2;

  constructor(game: Game, x: number, y: number, color: number) {
    super(game, x, y);
    this.speed = 800;
    this.color = color;
    this.sprite_nr = game.rand.rand() % 4;
    this.can_fly_over_walls = false;
    game.objects.push(this);
  }

  get type() { return ObjType.CORPSE_PART; }

  act(): void {
    if (!this.flying) {
      this.countdown = f32(this.countdown - DT);
      if (this.countdown < 0) {
        this.countdown = 0;
        this.delete_me = true;
      }
      this.opacity = Math.min(255, cint(f32(255 * this.countdown)));
    }
    super.act();
  }
}

// ---------------------------------------------------------------- the map's tiles

export abstract class MapTile {
  readonly game: Game;
  readonly x: number;
  readonly y: number;
  vanishing = false;
  destroyed = false;
  bomb: Bomb | null = null;
  delete_me = false;
  passable = false;
  blocking = true;
  next: TileType = TileType.NONE;
  objects: GameObject[] = [];
  vanish_countdown = 0;
  destroy_countdown = 0;

  constructor(game: Game, x: number, y: number) {
    this.game = game;
    this.x = x;
    this.y = y;
  }

  abstract get type(): TileType;

  vanish(): void {
    if (this.vanishing) return;
    this.passable = false;
    this.vanishing = true;
    this.vanish_countdown = 1;
    for (const o of this.objects) if (o.type === ObjType.EXTRA) o.fly_to_tile(this.game.map.get_passable());
  }

  destroy(): void {
    for (const o of this.objects) if (o.type === ObjType.EXTRA) (o as Extra).destroy_extra();
  }

  act(): void {
    if (this.vanishing) {
      this.vanish_countdown = f32(this.vanish_countdown - DT);
      if (this.vanish_countdown <= 0) this.delete_me = true;
    }
    if (this.destroyed) {
      this.destroy_countdown = f32(this.destroy_countdown - DT);
      if (this.destroy_countdown <= 0) this.delete_me = true;
    }
  }

  has_extra(): boolean {
    return this.objects.some((o) => o.type === ObjType.EXTRA);
  }

  has_bomber(): boolean {
    return this.objects.some((o) => o.type === ObjType.BOMBER);
  }

  /** MapTile::spawn_extra: what a burnt box leaves (rand() % 8, as the original draws it) */
  spawn_extra(): void {
    const g = this.game;
    const c = g.config;
    const again = () => this.spawn_extra();
    switch (g.rand.rand() % 8) {
      case 0: if (c.power) new Extra(g, this.x, this.y, ExtraType.POWER); else again(); break;
      case 1: if (c.bombs) new Extra(g, this.x, this.y, ExtraType.BOMB); else again(); break;
      case 2: if (c.skateboards) new Extra(g, this.x, this.y, ExtraType.SKATEBOARD); else again(); break;
      case 3:
        switch (g.rand.rand() % 2) {
          case 0: if (!c.start_kick && c.kick) new Extra(g, this.x, this.y, ExtraType.KICK); else again(); break;
          case 1: if (!c.start_glove && c.glove) new Extra(g, this.x, this.y, ExtraType.GLOVE); else again(); break;
        }
        break;
      case 4:
        switch (g.rand.rand() % 16) {
          case 0: if (c.joint) new Extra(g, this.x, this.y, ExtraType.JOINT); else again(); break;
          case 1: if (c.viagra) new Extra(g, this.x, this.y, ExtraType.VIAGRA); else again(); break;
          case 2: if (c.koks) new Extra(g, this.x, this.y, ExtraType.KOKS); else again(); break;
        }
        break;
    }
  }

  /** the C++ destructor */
  destroy_tile(): void {}
}

class MapTileNone extends MapTile {
  constructor(g: Game, x: number, y: number) { super(g, x, y); this.passable = false; this.blocking = false; }
  get type() { return TileType.NONE; }
  act(): void {
    super.act();
    for (const o of this.objects) o.fall();
  }
  vanish(): void {}
}

class MapTileGround extends MapTile {
  constructor(g: Game, x: number, y: number) { super(g, x, y); this.passable = true; this.blocking = false; }
  get type(): TileType { return TileType.GROUND; }
}

class MapTileBox extends MapTile {
  constructor(g: Game, x: number, y: number) { super(g, x, y); this.next = TileType.GROUND; this.passable = false; this.blocking = true; }
  get type() { return TileType.BOX; }
  act(): void {
    super.act();
    if (this.destroyed && this.destroy_countdown <= 0) this.spawn_extra();
  }
  destroy(): void {
    if (!this.destroyed) {
      this.destroyed = true;
      this.destroy_countdown = 0.5;
    }
  }
  vanish(): void {
    this.destroy();
  }
}

class MapTileWall extends MapTile {
  constructor(g: Game, x: number, y: number) { super(g, x, y); this.passable = false; this.blocking = true; this.next = TileType.GROUND; }
  get type() { return TileType.WALL; }
  vanish(): void {
    this.delete_me = true;
  }
}

class MapTileIce extends MapTileGround {
  get type() { return TileType.ICE; }
  act(): void {
    super.act();
    for (const o of this.objects) o.move_with(80, Dir.NONE);
  }
}

export class MapTileArrow extends MapTileGround {
  readonly dir: Dir;
  private old_bomb: Bomb | null = null;
  private chill_countdown = 0;
  constructor(g: Game, x: number, y: number, dir: Dir) { super(g, x, y); this.dir = dir; }
  get type() { return TileType.ARROW; }
  act(): void {
    super.act();
    const bomb = this.bomb;
    if (bomb) {
      if (bomb.stopped) bomb.snap();
      if (bomb.cur_dir !== Dir.NONE && bomb.cur_dir !== this.dir && (bomb.cur_dir + this.dir) % 2 === 0 && !this.old_bomb) {
        bomb.snap();
        bomb.stop(true);
        this.chill_countdown = 0.5;
      }
      if (this.chill_countdown > 0) this.chill_countdown = f32(this.chill_countdown - DT);
      else bomb.kick(this.dir);
    } else {
      this.chill_countdown = 0;
    }
    this.old_bomb = bomb;
  }
}

class MapTileTrap extends MapTileGround {
  /** bombs it swallowed, each with the time until it shoots it out */
  bombs: { bomb: Bomb; countdown: number }[] = [];
  get type() { return TileType.TRAP; }
  act(): void {
    super.act();
    const g = this.game;
    for (const o of this.objects) {
      if (o.type === ObjType.BOMB) {
        const i = g.objects.indexOf(o);
        if (i >= 0) g.objects.splice(i, 1);
        this.bomb = null;
        this.bombs.push({ bomb: o as Bomb, countdown: 1 });
      }
    }
    // the original erases from its list as it goes (the element after an erased one waits a frame)
    let i = 0;
    while (i < this.bombs.length) {
      const e = this.bombs[i];
      if (e.countdown <= 0) {
        const tile = g.map.get_passable();
        if (tile) {
          g.objects.push(e.bomb);
          e.bomb.can_fly_over_walls = true;
          e.bomb.detonation_countdown = f32(0.01);
          e.bomb.speed = 200;
          e.bomb.fly_to_tile(tile);
        } else {
          e.bomb.destroy();
        }
        this.bombs.splice(i, 1);
        if (i >= this.bombs.length) i = 0;
        else i++;
      } else {
        e.countdown = f32(e.countdown - DT);
        i++;
      }
    }
  }
  destroy_tile(): void {
    for (const e of this.bombs) e.bomb.destroy();
  }
}

// ---------------------------------------------------------------- the map

export class GameMap {
  readonly game: Game;
  readonly list: MapEntry[];
  /** maptiles[x][y] */
  maptiles: MapTile[][] = [];
  readonly dummy: MapTile;
  maps = 0;
  current: MapEntry;

  constructor(game: Game, list: MapEntry[]) {
    this.game = game;
    this.list = sortMaps(list);
    this.dummy = new MapTileWall(game, 1000, 1000);
    this.current = this.list[0];
  }

  private valid(): boolean {
    return this.game.players <= this.current.max_players;
  }

  any_valid_map(): boolean {
    return this.list.some((m) => this.game.players <= m.max_players);
  }

  private spin_up(): void {
    this.maps++;
    if (this.maps === this.list.length) this.maps = 0;
    this.current = this.list[this.maps];
  }

  private spin_to(nr: number): void {
    this.maps = nr;
    this.current = this.list[nr];
  }

  load_random_valid(): void {
    do {
      this.spin_to(this.game.rand.rand() % this.list.length);
    } while (!this.valid());
    this.reload();
  }

  load_next_valid(nr = -1): void {
    if (nr !== -1) this.spin_to(nr);
    else this.spin_up();
    while (!this.valid()) this.spin_up();
    this.reload();
  }

  reload(): void {
    const g = this.game;
    this.current.read_bomber_positions();
    for (const col of this.maptiles) for (const t of col) t.destroy_tile();
    this.maptiles = [];
    for (let x = 0; x < MAP_WIDTH; x++) this.maptiles.push(new Array<MapTile>(MAP_HEIGHT));
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const c = this.current.data[x][y];
        let t: MapTile;
        switch (c) {
          case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case ' ':
            t = new MapTileGround(g, 40 * x, 40 * y);
            break;
          case '*': t = new MapTileWall(g, 40 * x, 40 * y); break;
          case '+': t = new MapTileBox(g, 40 * x, 40 * y); break;
          case 'R':
            t = g.rand.rand() % 3 ? new MapTileBox(g, 40 * x, 40 * y) : new MapTileGround(g, 40 * x, 40 * y);
            break;
          case 'S': t = new MapTileIce(g, 40 * x, 40 * y); break;
          case '<': t = new MapTileArrow(g, 40 * x, 40 * y, Dir.LEFT); break;
          case '>': t = new MapTileArrow(g, 40 * x, 40 * y, Dir.RIGHT); break;
          case '^': t = new MapTileArrow(g, 40 * x, 40 * y, Dir.UP); break;
          case 'v': t = new MapTileArrow(g, 40 * x, 40 * y, Dir.DOWN); break;
          case 'o': t = new MapTileTrap(g, 40 * x, 40 * y); break;
          default: t = new MapTileNone(g, 40 * x, 40 * y); break;
        }
        this.maptiles[x][y] = t;
      }
    }
  }

  private spawn(old: MapTile): MapTile {
    const g = this.game;
    switch (old.next) {
      case TileType.ARROW: return new MapTileArrow(g, old.x, old.y, Dir.NONE);
      case TileType.GROUND: return new MapTileGround(g, old.x, old.y);
      case TileType.BOX: return new MapTileBox(g, old.x, old.y);
      case TileType.WALL: return new MapTileWall(g, old.x, old.y);
      case TileType.ICE: return new MapTileIce(g, old.x, old.y);
      default: return new MapTileNone(g, old.x, old.y);
    }
  }

  private maptilize_objects(): void {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.maptiles[x][y].objects = [];
        this.maptiles[x][y].bomb = null;
      }
    }
    for (const b of this.game.bomber_objects) {
      if (!b.flying && !b.dead) b.get_maptile().objects.push(b);
    }
    for (const o of this.game.objects) {
      if (!o.flying) {
        const t = o.get_maptile();
        if (t === this.dummy) continue; // the original collects them on its stand-in tile, which nothing reads
        t.objects.push(o);
        if (o.type === ObjType.BOMB && !o.is_falling()) t.bomb = o as Bomb;
      }
    }
  }

  act(): void {
    this.maptilize_objects();
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const t = this.maptiles[x][y];
        t.act();
        if (t.delete_me) {
          const n = this.spawn(t);
          t.destroy_tile();
          this.maptiles[x][y] = n;
        }
      }
    }
  }

  add_bomb(bx: number, by: number, power: number, bomber: Bomber): boolean {
    if (bx < 0 || by < 0 || bx >= MAP_WIDTH || by >= MAP_HEIGHT) return false;
    const t = this.maptiles[bx][by];
    if (t.bomb === null) {
      t.bomb = new Bomb(this.game, bx * 40, by * 40, power, bomber);
      return true;
    }
    return false;
  }

  get_passable(): MapTile | null {
    for (let i = 0; i < 1000; i++) {
      const x = this.game.rand.rand() % 17;
      const y = this.game.rand.rand() % 13;
      const t = this.maptiles[x][y];
      if (t.passable && !t.vanishing) return t;
    }
    return null;
  }

  get_random(): MapTile | null {
    for (let i = 0; i < 1000; i++) {
      const x = this.game.rand.rand() % 17;
      const y = this.game.rand.rand() % 13;
      const t = this.maptiles[x][y];
      if (t.type !== TileType.NONE && !t.vanishing) return t;
    }
    return null;
  }

  get_maptile(x: number, y: number): MapTile {
    if (x < 0 || x > MAP_WIDTH - 1 || y < 0 || y > MAP_HEIGHT - 1) return this.dummy;
    return this.maptiles[x][y];
  }

  get_maptile_xy(x: number, y: number): MapTile {
    if (x < 0 || x >= MAP_WIDTH * 40 || y < 0 || y >= MAP_HEIGHT * 40) return this.dummy;
    return this.maptiles[idiv(x, 40)][idiv(y, 40)];
  }
}

// ---------------------------------------------------------------- the observer (the round's clock)

/**
 * Observer: starts the round when everyone has landed, counts the round time down and, when it is over, flies from
 * tile to tile and makes each one vanish; ends the round when fewer than two bombers live (and nothing is still
 * exploding, flying or falling): the living one gets a point, the next map is loaded. In Bomberslop it is the
 * Mop (README.md).
 */
export class Observer extends GameObject {
  round_time = 0;
  first_destruction = true;
  play_hurryup = true;
  end_of_game = false;

  constructor(game: Game) {
    super(game, 0, 0);
    this.speed = 300;
    this.reset_round_time();
  }

  get type() { return ObjType.OBSERVER; }

  fall(): void {}

  reset_round_time(): void {
    this.round_time = f32(this.game.config.round_time);
    this.play_hurryup = true;
    this.first_destruction = true;
    this.x = 0;
    this.y = 0;
    this.flying = false;
  }

  active_players(): number {
    let c = 0;
    for (const b of this.game.bomber_objects) if (!b.dead) c++;
    return c;
  }

  act(): void {
    super.act();
    const g = this.game;
    if (this.round_time === g.config.round_time) {
      if (g.bomber_objects.some((b) => b.flying)) return;
      for (const b of g.bomber_objects) b.controller.active = true;
    }
    this.round_time = f32(this.round_time - DT);
    // the hurry-up sound plays when the clock shows it (Observer::show, between 21 and 18 s)
    if (this.round_time < 21 && this.round_time > 18 && this.play_hurryup) {
      g.sound('hurry_up');
      this.play_hurryup = false;
    }
    if (this.round_time < 0 && !this.flying) {
      if (this.first_destruction) {
        g.sound('time_over');
        this.first_destruction = false;
      } else {
        this.get_maptile().vanish();
        g.sound('crunch');
      }
      const t = g.map.get_random();
      if (t) this.fly_to(t.x, t.y, 500);
    }
    if (this.active_players() < 2) {
      for (const o of g.objects) {
        if (o.type === ObjType.EXPLOSION) return;
        if (o.type === ObjType.EXTRA && o.flying) return;
      }
      for (const b of g.bomber_objects) if (!b.dead && b.is_falling()) return;
      const winners: number[] = [];
      for (const b of g.bomber_objects) {
        if (!b.dead) {
          b.points++;
          winners.push(b.number);
        }
      }
      const finished = g.map.current.name;
      if (g.config.random_map_order) g.map.load_random_valid();
      else g.map.load_next_valid();
      this.reset_round_time();
      // GameStatus::analyze_game
      this.end_of_game = g.bomber_objects.some((b) => b.points === g.config.points_to_win);
      g.event({ kind: 'round', winners, map: finished, over: this.end_of_game });
      for (const o of g.objects) o.destroy();
      g.objects = [];
      if (g.config.random_positions) g.map.current.randomize_bomber_positions(g.rand);
      let c = 0;
      for (const b of g.bomber_objects) {
        const pos = g.map.current.bomber_pos[c++];
        b.orig_x = pos.x * 40;
        b.orig_y = pos.y * 40;
        b.reset();
        if (b.gone) continue; // left the online game: stays out
        b.x = 350;
        b.y = 270;
        b.fly_to(pos.x * 40, pos.y * 40, 200);
        b.controller.active = false;
      }
    }
  }
}

// ---------------------------------------------------------------- the game

export type GameEvent =
  | { kind: 'die'; bomber: number; x: number; y: number; fell: boolean }
  | { kind: 'extra'; bomber: number; extra: ExtraType; x: number; y: number }
  | { kind: 'round'; winners: number[]; map: string; over: boolean };

/**
 * A local game of the original (ClanBomberApplication::init_game and run_game): `players` bombers on the maps
 * given, the first map by start_map (or at random), the positions shuffled unless random_positions is 0.
 */
export class Game {
  readonly config: Config;
  readonly players: number;
  readonly rand: CRand;
  readonly map: GameMap;
  objects: GameObject[] = [];
  bomber_objects: Bomber[] = [];
  readonly observer: Observer;
  frame_count = 0;
  /** the sounds of the last frame, by the original's names (src/wavs) */
  sounds: string[] = [];
  /** what happened in the last frame */
  events: GameEvent[] = [];
  /** frames the arena shakes after an explosion (Map::shake) */
  shake = 0;

  constructor(maps: MapEntry[], players: number, seed: number, config: Partial<Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.players = players;
    this.rand = new CRand(seed);
    this.map = new GameMap(this, maps);
    if (!this.map.any_valid_map()) throw new Error('no map for so many players');
    if (this.config.random_map_order) this.map.load_random_valid();
    else this.map.load_next_valid(Math.min(this.config.start_map, this.map.list.length - 1));
    if (this.config.random_positions) this.map.current.randomize_bomber_positions(this.rand);
    for (let i = 0; i < players; i++) {
      const pos = this.map.current.bomber_pos[i];
      const b = new Bomber(this, pos.x * 40, pos.y * 40, i, new Controller(), i);
      b.x = 350;
      b.y = 270;
      b.fly_to(pos.x * 40, pos.y * 40, 300);
      b.controller.active = false;
    }
    this.observer = new Observer(this);
  }

  sound(name: string): void {
    this.sounds.push(name);
  }

  event(e: GameEvent): void {
    this.events.push(e);
  }

  get over(): boolean {
    return this.observer.end_of_game;
  }

  /** one frame of run_game: the observer, delete_some(), act_all() */
  frame(keys: readonly Keys[]): void {
    this.sounds = [];
    this.events = [];
    if (this.shake > 0) this.shake--;
    for (let i = 0; i < this.bomber_objects.length; i++) this.bomber_objects[i].controller.keys = keys[i] ?? NO_KEYS;
    this.observer.act();
    this.frame_count++;
    if (this.observer.end_of_game) return;
    // delete_some(): erasing from a std::list in a for loop that steps on after the erase; at the end of the list
    // the step goes round to its start (libstdc++)
    const list = this.objects;
    let i = 0;
    while (i < list.length) {
      if (list[i].delete_me) {
        list[i].destroy();
        list.splice(i, 1);
        if (i >= list.length) i = 0;
        else i++;
      } else {
        i++;
      }
    }
    // act_all(): the map, the objects (new ones act in the frame they appear), the bombers
    this.map.act();
    for (let k = 0; k < this.objects.length; k++) this.objects[k].act();
    for (const b of this.bomber_objects) b.act();
  }

  /** a player left an online game: from now on its bomber is out (dead, no corpse, nothing dropped) */
  remove_player(n: number): void {
    const b = this.bomber_objects[n];
    if (!b || b.gone) return;
    b.gone = true;
    b.flying = false;
    b.falling = false;
    if (!b.dead) {
      b.dead = true;
      b.x = 0;
      b.y = 0;
    }
    b.controller.keys = NO_KEYS;
  }
}
