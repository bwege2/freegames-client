// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The oracle's scenarios and state lines (re/bomberslop/oracle/harness.cpp), for the port: the same scenario file
// drives Game, and stateLine() writes the port's state the way the harness writes the original's.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  Bomb, BomberCorpse, Explosion, Extra, Game, MapEntry, MapTileArrow, ObjType, TileType, MAP_HEIGHT, MAP_WIDTH,
  type Config, type Keys,
} from '../src/sim.ts';

export const GAME_DIR = join(import.meta.dirname, '..');

export function loadMaps(): MapEntry[] {
  const dir = join(GAME_DIR, 'maps');
  return readdirSync(dir).filter((f) => f.endsWith('.map')).map((f) => new MapEntry(f.slice(0, -4), readFileSync(join(dir, f), 'latin1')));
}

export interface Scenario {
  seed: number;
  players: number;
  frames: number;
  dump: number;
  config: Partial<Config>;
  /** sorted by frame */
  keys: { frame: number; player: number; keys: Keys }[];
}

export function parseScenario(text: string): Scenario {
  const s: Scenario = { seed: 1, players: 2, frames: 0, dump: 64, config: {}, keys: [] };
  for (const line of text.split('\n')) {
    const w = line.trim().split(/\s+/);
    if (!w[0] || w[0].startsWith('#')) continue;
    switch (w[0]) {
      case 'seed': s.seed = Number(w[1]) >>> 0; break;
      case 'players': s.players = Number(w[1]); break;
      case 'frames': s.frames = Number(w[1]); break;
      case 'dump': s.dump = Number(w[1]); break;
      case 'start_map': s.config.start_map = Number(w[1]); break;
      case 'set': (s.config as Record<string, number>)[w[1]] = Number(w[2]); break;
      case 'at': {
        const k = w[3];
        s.keys.push({ frame: Number(w[1]), player: Number(w[2]), keys: {
          left: k.includes('L'), up: k.includes('U'), right: k.includes('R'), down: k.includes('D'), bomb: k.includes('B'),
        } });
        break;
      }
      default: throw new Error(`scenario: ${line}`);
    }
  }
  s.keys.sort((a, b) => a.frame - b.frame); // stable, like the harness's std::sort on distinct... (equal frames keep file order)
  return s;
}

const fb = new Float32Array(1);
const ub = new Uint32Array(fb.buffer);
/** a float's bits, as the harness prints them */
export function fbits(v: number): string {
  fb[0] = v;
  return ub[0].toString(16).padStart(8, '0');
}

const b01 = (v: boolean | number) => (v ? '1' : '0');

function tileChar(t: { type: TileType }): string {
  switch (t.type) {
    case TileType.NONE: return '-';
    case TileType.ARROW: return 'v<^>'[(t as MapTileArrow).dir];
    case TileType.ICE: return 'S';
    case TileType.GROUND: return ' ';
    case TileType.WALL: return '*';
    case TileType.BOX: return '+';
    case TileType.TRAP: return 'o';
  }
  return '?';
}

export function stateLine(g: Game): string {
  const o = g.observer;
  let s = `r${g.rand.calls} o${fbits(o.x)},${fbits(o.y)},${fbits(o.round_time)},${b01(o.flying)}`;
  for (const b of g.bomber_objects) {
    const c = b.controller;
    s += ` b${fbits(b.x)},${fbits(b.y)},${b.cur_dir},${b01(b.dead)}${b01(b.falling)}${b01(b.fallen_down)}${b01(b.flying)},`
      + `${b.points},${b.kills},${b.deaths},${b.cur_bombs}/${b.bombs},${b.power},${b.speed},${b.skateboards},${b.gloves},`
      + `${b01(b.can_kick)},${fbits(b.anim_count)},${b01(c.active)}${b01(c.reverse)}${c.bomb_mode === 'always' ? 1 : 0}`;
    if (b.disease) s += `,d${b.disease.type}:${fbits(b.disease.countdown)}`;
  }
  for (const x of g.objects) {
    s += ` ${x.type}:${fbits(x.x)},${fbits(x.y)},${b01(x.flying)}${b01(x.falling)}${b01(x.fallen_down)}${b01(x.delete_me)}`;
    if (x.type === ObjType.BOMB) {
      const b = x as Bomb;
      s += `,${fbits(b.detonation_countdown)},${b.cur_dir},${b01(b.exploding)},${b.power}`;
    } else if (x.type === ObjType.EXPLOSION) {
      const e = x as Explosion;
      s += `,${e.X},${e.Y},${e.l_left}${e.l_right}${e.l_up}${e.l_down},${fbits(e.detonation_period)}`;
    } else if (x.type === ObjType.EXTRA) {
      const e = x as Extra;
      s += `,${e.extra},${b01(e.destroyed)}`;
    } else if (x.type === ObjType.BOMBER_CORPSE) {
      const c = x as BomberCorpse;
      s += `,${c.splash_counter},${fbits(c.explode_delay)}`;
    }
  }
  s += ' m';
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const t = g.map.maptiles[x][y];
      s += tileChar(t);
      if (t.vanishing) s += 'v';
      if (t.destroyed) s += 'x';
    }
  }
  return s;
}

export function fnv1a(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h.toString(16).padStart(8, '0');
}

/** plays a scenario the way the harness does and writes its output lines */
export function runScenario(text: string, onLine?: (line: string) => void): string[] {
  const sc = parseScenario(text);
  const g = new Game(loadMaps(), sc.players, sc.seed, sc.config);
  const out: string[] = [];
  const emit = (l: string) => {
    out.push(l);
    onLine?.(l);
  };
  const held: Keys[] = Array.from({ length: sc.players }, () => ({ left: false, up: false, right: false, down: false, bomb: false }));
  let next = 0;
  for (let f = 0; f < sc.frames; f++) {
    while (next < sc.keys.length && sc.keys[next].frame <= f) {
      const k = sc.keys[next++];
      if (k.player >= 0 && k.player < sc.players) held[k.player] = k.keys;
    }
    g.frame(held);
    const st = stateLine(g);
    const round = g.events.some((e) => e.kind === 'round');
    if (f % 4 === 0) emit(`h ${f} ${fnv1a(st)}`);
    if (f % sc.dump === 0 || round || g.over) emit(`F ${f} ${st}`);
    // the original plays the hurry-up sound when it draws the clock, which the oracle does not do
    const sounds = g.sounds.filter((x) => x !== 'hurry_up');
    if (sounds.length) emit(`S ${f} ${sounds.join(',')}`);
    if (round) emit(`R ${f} round`);
    if (g.over) {
      emit(`E ${f} end`);
      break;
    }
  }
  return out;
}
