// lw/core.ts: the battle: src/mesh.c (the mesh of squares, grouped up to 16x16), src/area.c,
// src/army.c (placing the teams), src/fighter.c (moving and fighting, the C versions the x86_64 build
// uses: no assembly), src/grad.c (spreading the gradient), src/cursor.c, src/move.c (moving the
// cursors), src/autoplay.c (the computer players), src/decal.c (eliminating a team), src/checksum.c.

import { fixsqrt } from '../al/fixed.ts';
import { getpixel, putpixel } from '../al/bitmap.ts';
import { random } from '../glibc.ts';
import { lw_map_create_bicolor } from './map.ts';
import {
  AREA_START_GRADIENT, type Army, COMPUTER_PATH_MAX, CONFIG_CONTROL_TYPE_CPU, CONFIG_CONTROL_TYPE_HUMAN,
  CONFIG_CONTROL_TYPE_OFF, CONFIG_CPU_VS_HUMAN_ALWAYS, CONFIG_CPU_VS_HUMAN_NEVER, CURSOR_KEY_DOWN, CURSOR_KEY_LEFT,
  CURSOR_KEY_RIGHT, CURSOR_KEY_UP, DIR_ENE, DIR_ESE, DIR_NE, DIR_NNE, DIR_NNW, DIR_NW, DIR_SE, DIR_SSE, DIR_SSW,
  DIR_SW, DIR_WNW, DIR_WSW, G, MAX_FIGHTER_HEALTH, type Mesh, NAME_SIZE, NB_DIRS, NB_TEAMS, newCursor,
} from './state.ts';

export const MIN_MAP_RES_W = [0, 80, 120, 160, 200, 240, 320, 480, 640];
export const MIN_MAP_RES_H = [0, 60, 90, 120, 150, 180, 240, 360, 480];

const MESH_FG = 1;
const MESH_MAX_ELEM_SIZE = 16;

/** the 24-bit signed grad bitfield */
function g24(v: number): number {
  return (v << 8) >> 8;
}

// ---- mesh.c ----

export function create_mesh(): number {
  G.CURRENT_MESH = null;
  G.CURRENT_MESH_SIZE = 0;
  G.CURRENT_AREA_W = 0;
  G.CURRENT_AREA_H = 0;
  const zoom = { v: 1 };
  const map = lw_map_create_bicolor(G.CONFIG_LEVEL_MAP, MESH_FG, 2, G.LW_NETWORK_ON, G.LW_RANDOM_ON,
    MIN_MAP_RES_W[G.LW_CONFIG_CURRENT_RULES.min_map_res]!, MIN_MAP_RES_H[G.LW_CONFIG_CURRENT_RULES.min_map_res]!, zoom);
  if (!map) return -1;
  const w = map.w, h = map.h, size = w * h;
  // create_first_mesher
  const used = new Uint8Array(size);
  const msize = new Int16Array(size).fill(1);
  const link = new Int32Array(size * NB_DIRS).fill(-1);
  for (let y = 0; y < h; ++y) for (let x = 0; x < w; ++x) used[y * w + x] = getpixel(map, x, y) === MESH_FG ? 0 : 1;
  const L = (i: number, d: number): number => i * NB_DIRS + d;
  for (let y = 1; y < h - 1; ++y) {
    for (let x = 1; x < w - 1; ++x) {
      const i = y * w + x;
      if (used[i]) {
        if (used[i - w]) link[L(i, DIR_NNW)] = link[L(i, DIR_NNE)] = i - w;
        if (used[i - w + 1]) link[L(i, DIR_NE)] = i - w + 1;
        if (used[i + 1]) link[L(i, DIR_ENE)] = link[L(i, DIR_ESE)] = i + 1;
        if (used[i + w + 1]) link[L(i, DIR_SE)] = i + w + 1;
        if (used[i + w]) link[L(i, DIR_SSE)] = link[L(i, DIR_SSW)] = i + w;
        if (used[i + w - 1]) link[L(i, DIR_SW)] = i + w - 1;
        if (used[i - 1]) link[L(i, DIR_WSW)] = link[L(i, DIR_WNW)] = i - 1;
        if (used[i - w - 1]) link[L(i, DIR_NW)] = i - w - 1;
      }
    }
  }
  // group_mesher
  const group = (step: number): number => {
    let found = 0;
    for (let y = 0; y < h - step; y += step * 2) {
      for (let x = 0; x < w - step; x += step * 2) {
        const i = y * w + x;
        const ne = i + step, se = i + (w + 1) * step, sw = i + w * step, nw = i;
        if (used[ne] && msize[ne] === step && used[se] && msize[se] === step && used[sw] && msize[sw] === step &&
          used[nw] && msize[nw] === step &&
          link[L(ne, DIR_NNW)] === link[L(ne, DIR_NNE)] && link[L(ne, DIR_ENE)] === link[L(ne, DIR_ESE)] &&
          link[L(se, DIR_ENE)] === link[L(se, DIR_ESE)] && link[L(se, DIR_SSE)] === link[L(se, DIR_SSW)] &&
          link[L(sw, DIR_SSE)] === link[L(sw, DIR_SSW)] && link[L(sw, DIR_WSW)] === link[L(sw, DIR_WNW)] &&
          link[L(nw, DIR_WSW)] === link[L(nw, DIR_WNW)] && link[L(nw, DIR_NNW)] === link[L(nw, DIR_NNE)] &&
          link[L(ne, DIR_NE)] !== -1 && link[L(se, DIR_SE)] !== -1 && link[L(sw, DIR_SW)] !== -1 && link[L(nw, DIR_NW)] !== -1) {
          used[ne] = 0;
          used[se] = 0;
          used[sw] = 0;
          msize[nw] = step * 2;
          link[L(nw, DIR_NNE)] = link[L(ne, DIR_NNE)]!;
          link[L(nw, DIR_NE)] = link[L(ne, DIR_NE)]!;
          link[L(nw, DIR_ENE)] = link[L(ne, DIR_ENE)]!;
          link[L(nw, DIR_ESE)] = link[L(se, DIR_ESE)]!;
          link[L(nw, DIR_SE)] = link[L(se, DIR_SE)]!;
          link[L(nw, DIR_SSE)] = link[L(se, DIR_SSE)]!;
          link[L(nw, DIR_SSW)] = link[L(sw, DIR_SSW)]!;
          link[L(nw, DIR_SW)] = link[L(sw, DIR_SW)]!;
          link[L(nw, DIR_WSW)] = link[L(sw, DIR_WSW)]!;
          for (let j = 0; j < NB_DIRS; ++j) {
            for (let k = 0; k < NB_DIRS; ++k) {
              const lj = link[L(nw, j)]!;
              if (lj !== -1) {
                const test = link[L(lj, k)]!;
                if (test === ne || test === se || test === sw) link[L(lj, k)] = nw;
              }
            }
          }
          ++found;
        }
      }
    }
    return found;
  };
  let i = 1;
  while (i <= MESH_MAX_ELEM_SIZE / 2 && group(i)) i *= 2;
  // mesher_to_mesh
  let n = 0;
  for (let k = 0; k < size; ++k) if (used[k]) ++n;
  const corres = new Int32Array(size).fill(3);
  const mesh: Mesh = {
    size: n, x: new Int16Array(n), y: new Int16Array(n), side: new Int32Array(n), link: new Int32Array(n * NB_DIRS),
    grad: new Int32Array(n * NB_TEAMS), dir: new Int8Array(n * NB_TEAMS), update: new Int32Array(n * NB_TEAMS),
  };
  let j = 0;
  for (let k = 0; k < size; ++k) {
    if (used[k]) {
      mesh.x[j] = k % w;
      mesh.y[j] = Math.trunc(k / w);
      mesh.side[j] = msize[k]!;
      for (let d = 0; d < NB_DIRS; ++d) mesh.link[j * NB_DIRS + d] = link[k * NB_DIRS + d]!;
      corres[k] = j;
      j++;
    }
  }
  for (let m = 0; m < n * NB_DIRS; ++m) {
    const t = mesh.link[m]!;
    if (t !== -1) mesh.link[m] = corres[t]!;
  }
  G.CURRENT_MESH = mesh;
  G.CURRENT_MESH_SIZE = n;
  G.CURRENT_AREA_W = w;
  G.CURRENT_AREA_H = h;
  return 0;
}

export function reset_mesh(): void {
  const m = G.CURRENT_MESH!;
  for (let i = 0; i < G.CURRENT_MESH_SIZE; ++i) {
    for (let j = 0; j < NB_TEAMS; ++j) {
      m.dir[i * NB_TEAMS + j] = (i + j) % NB_DIRS;
      m.update[i * NB_TEAMS + j] = -1;
    }
  }
}

// ---- area.c ----

export function create_game_area(): number {
  const W = G.CURRENT_AREA_W, H = G.CURRENT_AREA_H;
  G.AREA_MESH = new Int32Array(W * H).fill(-1);
  G.AREA_FIGHTER = new Int32Array(W * H).fill(-1);
  const m = G.CURRENT_MESH!;
  for (let i = 0; i < G.CURRENT_MESH_SIZE; ++i) {
    const s = m.side[i]!;
    for (let y = 0; y < s; ++y) for (let x = 0; x < s; ++x) G.AREA_MESH[(m.y[i]! + y) * W + m.x[i]! + x] = i;
  }
  return 0;
}

export function reset_game_area(): void {
  G.CURRENT_MESH!.grad.fill(AREA_START_GRADIENT);
  G.AREA_FIGHTER.fill(-1);
}

// ---- army.c ----

function get_battle_room(): number {
  const m = G.CURRENT_MESH!;
  let n = 0;
  for (let i = 0; i < G.CURRENT_MESH_SIZE; ++i) n += m.side[i]! * m.side[i]!;
  return n;
}

function add_fighter(f: number, team: number, x: number, y: number, health: number): number {
  const a = G.CURRENT_ARMY!;
  const j = y * G.CURRENT_AREA_W + x;
  if (G.AREA_MESH[j] !== -1 && G.AREA_FIGHTER[j] === -1) {
    G.AREA_FIGHTER[j] = f;
    a.health[f] = health;
    a.team[f] = team;
    a.x[f] = x;
    a.y[f] = y;
    a.last_dir[f] = j % NB_DIRS;
    return 1;
  }
  return 0;
}

function place_team(part: number, team: number): void {
  const W = G.CURRENT_AREA_W, H = G.CURRENT_AREA_H;
  const fighters = Math.trunc(G.CURRENT_ARMY_SIZE / G.PLAYING_TEAMS);
  G.ACTIVE_FIGHTERS[team] = 0;
  const health = MAX_FIGHTER_HEALTH - 1;
  let x, y;
  switch (part) {
    case 0:
      x = Math.trunc(W / 6);
      y = Math.trunc(H / 4);
      break;
    case 1:
      x = Math.trunc(W / 2);
      y = Math.trunc(H / 4);
      break;
    case 2:
      x = Math.trunc((5 * W) / 6);
      y = Math.trunc(H / 4);
      break;
    case 3:
      x = Math.trunc(W / 6);
      y = Math.trunc((3 * H) / 4);
      break;
    case 4:
      x = Math.trunc(W / 2);
      y = Math.trunc((3 * H) / 4);
      break;
    default:
      x = Math.trunc((5 * W) / 6);
      y = Math.trunc((3 * H) / 4);
      break;
  }
  let x_min = x, x_max = x, y_min = y, y_max = y;
  const pos = team;
  const PT = G.PLAYING_TEAMS;
  let placed = 0;
  while (placed < fighters) {
    for (x = x_min; x <= x_max && placed < fighters; ++x) placed += add_fighter(pos + placed * PT, team, x, y_min, health);
    if (x_max < W - 2) ++x_max;
    for (y = y_min; y <= y_max && placed < fighters; ++y) placed += add_fighter(pos + placed * PT, team, x_max, y, health);
    if (y_max < H - 2) ++y_max;
    for (x = x_max; x >= x_min && placed < fighters; --x) placed += add_fighter(pos + placed * PT, team, x, y_max, health);
    if (x_min > 1) --x_min;
    for (y = y_max; y >= y_min && placed < fighters; --y) placed += add_fighter(pos + placed * PT, team, x_min, y, health);
    if (y_min > 1) --y_min;
  }
}

export function place_all_team(): void {
  for (let i = 0; i < NB_TEAMS; ++i) G.ACTIVE_FIGHTERS[i] = 0;
  let n = 0;
  if (G.LW_NETWORK_ON) {
    for (let j = 0; j < NB_TEAMS && n < NB_TEAMS; ++j) {
      for (let i = 0; i < NB_TEAMS && n < NB_TEAMS; ++i) {
        const ni = G.LW_NETWORK_INFO[i]!;
        if (ni.active && ni.part === j) {
          place_team(ni.part, ni.server_id);
          auto_cursor(i, ni.server_id, ni.name);
          n++;
        }
      }
    }
  } else {
    for (let i = 0; i < NB_TEAMS && n < NB_TEAMS; ++i) {
      if (G.CONFIG_CONTROL_TYPE[i] !== CONFIG_CONTROL_TYPE_OFF) {
        place_team(i, n);
        auto_cursor(i, n, G.CONFIG_PLAYER_NAME[i]!);
        n++;
      }
    }
  }
}

const FILL_TABLE = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 25, 27, 29, 31, 33, 36, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 99];

export function create_army(): number {
  let size = Math.trunc((get_battle_room() * FILL_TABLE[G.LW_CONFIG_CURRENT_RULES.fighter_number]!) / 100);
  size = Math.trunc(size / G.PLAYING_TEAMS);
  if (size < 1) size = 1;
  size *= G.PLAYING_TEAMS;
  G.CURRENT_ARMY_SIZE = size;
  const a: Army = {
    size, x: new Int16Array(size), y: new Int16Array(size), health: new Int16Array(size), team: new Int8Array(size).fill(-1),
    last_dir: new Int8Array(size),
  };
  G.CURRENT_ARMY = a;
  return 0;
}

// ---- cursor.c ----

export function reset_all_cursor(): void {
  for (let i = 0; i < NB_TEAMS; ++i) G.CURRENT_CURSOR[i] = newCursor();
}

function init_cursor(index: number, team: number, x: number, y: number, name: string): void {
  const c = G.CURRENT_CURSOR[index]!;
  c.active = 1;
  c.team = team;
  c.x = x;
  c.y = y;
  c.val = AREA_START_GRADIENT / 2;
  c.loose_time = -1;
  c.score_order = 0;
  c.color_entry = 128 + team * G.COLORS_PER_TEAM;
  c.name = name.slice(0, NAME_SIZE);
}

export function apply_all_cursor(): void {
  const m = G.CURRENT_MESH!;
  for (let i = 0; i < NB_TEAMS; ++i) {
    const c = G.CURRENT_CURSOR[i]!;
    if (c.active) {
      const t = G.AREA_MESH[c.y * G.CURRENT_AREA_W + c.x]!;
      if (t !== -1) m.grad[t * NB_TEAMS + c.team] = g24(c.val);
    }
  }
}

export function auto_cursor(index: number, team: number, name: string): void {
  const a = G.CURRENT_ARMY!;
  const W = G.CURRENT_AREA_W;
  let x = 0, y = 0, n = 0;
  for (let i = 0; i < G.CURRENT_ARMY_SIZE; ++i) {
    if (a.team[i] === team) {
      x += a.x[i]!;
      y += a.y[i]!;
      n++;
    }
  }
  x = Math.trunc(x / n);
  y = Math.trunc(y / n);
  let x0 = x, x_max = x, x_min = x;
  let y0 = y, y_max = y, y_min = y;
  let ok = 0;
  const at = (xx: number, yy: number): boolean => G.AREA_MESH[yy * W + xx] !== -1;
  while (!ok) {
    for (x = x_min; x <= x_max && !ok; ++x) {
      if (at(x, y)) {
        ok = 1;
        x0 = x;
        y0 = y;
      }
    }
    if (x_max < W - 1) ++x_max;
    for (y = y_min; y <= y_max && !ok; ++y) {
      if (at(x, y)) {
        ok = 1;
        x0 = x;
        y0 = y;
      }
    }
    if (y_max < G.CURRENT_AREA_H - 1) ++y_max;
    for (x = x_max; x >= x_min && !ok; --x) {
      if (at(x, y)) {
        ok = 1;
        x0 = x;
        y0 = y;
      }
    }
    if (x_min > 0) --x_min;
    for (y = y_max; y >= y_min && !ok; --y) {
      if (at(x, y)) {
        ok = 1;
        x0 = x;
        y0 = y;
      }
    }
    if (y_min > 0) --y_min;
  }
  init_cursor(index, team, x0, y0, name);
}

// ---- grad.c ----

export function spread_single_gradient(): void {
  const m = G.CURRENT_MESH!;
  const dir = (G.GLOBAL_CLOCK * 7) % NB_DIRS;
  const size = G.CURRENT_MESH_SIZE;
  const PT = G.PLAYING_TEAMS;
  const grad = m.grad, link = m.link, side = m.side;
  switch (dir) {
    case DIR_ENE:
    case DIR_ESE:
    case DIR_SE:
    case DIR_SSE:
    case DIR_SSW:
    case DIR_SW:
      for (let pos = 0; pos < size; pos++) {
        const temp = link[pos * NB_DIRS + dir]!;
        if (temp === -1) continue;
        for (let i = 0; i < PT; ++i) {
          const new_grad = grad[pos * NB_TEAMS + i]! + side[pos]!;
          if (grad[temp * NB_TEAMS + i]! > new_grad) grad[temp * NB_TEAMS + i] = g24(new_grad);
        }
      }
      break;
    default:
      for (let pos = size - 1; pos >= 0; pos--) {
        const temp = link[pos * NB_DIRS + dir]!;
        if (temp === -1) continue;
        for (let i = 0; i < PT; ++i) {
          const new_grad = grad[pos * NB_TEAMS + i]! + side[pos]!;
          if (grad[temp * NB_TEAMS + i]! > new_grad) grad[temp * NB_TEAMS + i] = g24(new_grad);
        }
      }
      break;
  }
}

// ---- fighter.c ----

const SIDE_ATTACK_FACTOR = 4;
/** for the tests' mutation check only: a rule changed on purpose */
export const mutation = { sideAttackFactor: SIDE_ATTACK_FACTOR };
const NB_TRY_MOVE = 5;
const LOCAL_DIR = new Int32Array(16 * 2);
const FIGHTER_MOVE_DIR = [
  [[DIR_NNE, DIR_NE, DIR_NW, DIR_ENE, DIR_WNW], [DIR_NE, DIR_ENE, DIR_NNE, DIR_SE, DIR_NW],
    [DIR_ENE, DIR_NE, DIR_SE, DIR_NNE, DIR_SSE], [DIR_ESE, DIR_SE, DIR_NE, DIR_SSE, DIR_NNE],
    [DIR_SE, DIR_SSE, DIR_ESE, DIR_SW, DIR_NE], [DIR_SSE, DIR_SE, DIR_SW, DIR_ESE, DIR_WSW],
    [DIR_SSW, DIR_SW, DIR_SE, DIR_WSW, DIR_ESE], [DIR_SW, DIR_WSW, DIR_SSW, DIR_NW, DIR_SE],
    [DIR_WSW, DIR_SW, DIR_NW, DIR_SSW, DIR_NNW], [DIR_WNW, DIR_NW, DIR_SW, DIR_NNW, DIR_SSE],
    [DIR_NW, DIR_NNW, DIR_WNW, DIR_NE, DIR_SW], [DIR_NNW, DIR_NW, DIR_NE, DIR_WNW, DIR_ENE]],
  [[DIR_NNE, DIR_NE, DIR_NW, DIR_ENE, DIR_WNW], [DIR_NE, DIR_NNE, DIR_ENE, DIR_NW, DIR_SE],
    [DIR_ENE, DIR_NE, DIR_SE, DIR_NNE, DIR_SSE], [DIR_ESE, DIR_SE, DIR_NE, DIR_SSE, DIR_NNE],
    [DIR_SE, DIR_ESE, DIR_SSE, DIR_NE, DIR_SW], [DIR_SSE, DIR_SE, DIR_SW, DIR_ESE, DIR_WSW],
    [DIR_SSW, DIR_SW, DIR_SE, DIR_WSW, DIR_ESE], [DIR_SW, DIR_SSW, DIR_WSW, DIR_SE, DIR_NW],
    [DIR_WSW, DIR_SW, DIR_NW, DIR_SSW, DIR_NNW], [DIR_WNW, DIR_NW, DIR_SW, DIR_NNW, DIR_SSE],
    [DIR_NW, DIR_WNW, DIR_NNW, DIR_SW, DIR_NE], [DIR_NNW, DIR_NW, DIR_NE, DIR_WNW, DIR_ENE]],
];
const FIGHTER_MOVE_X_REF = [0, 1, 1, 1, 1, 0, 0, -1, -1, -1, -1, 0];
const FIGHTER_MOVE_Y_REF = [-1, -1, 0, 0, 1, 1, 1, 1, 0, 0, -1, -1];
/** [table][dir][try] */
const FIGHTER_MOVE_OFFSET = new Int32Array(2 * NB_DIRS * NB_TRY_MOVE);
export const FIGHTER_MOVE_X = new Int32Array(2 * NB_DIRS * NB_TRY_MOVE);
export const FIGHTER_MOVE_Y = new Int32Array(2 * NB_DIRS * NB_TRY_MOVE);
export const MV = (k: number, i: number, j: number): number => (k * NB_DIRS + i) * NB_TRY_MOVE + j;

function erase_fighter(f: number): void {
  const a = G.CURRENT_ARMY!;
  putpixel(G.CURRENT_AREA_DISP!, a.x[f]!, a.y[f]!, getpixel(G.CURRENT_AREA_BACK!, a.x[f]!, a.y[f]!));
}

function disp_fighter(f: number): void {
  const a = G.CURRENT_ARMY!;
  putpixel(G.CURRENT_AREA_DISP!, a.x[f]!, a.y[f]!,
    G.COLOR_FIRST_ENTRY[a.team[f]!]! + Math.trunc((a.health[f]! * G.COLORS_PER_TEAM) / MAX_FIGHTER_HEALTH));
}

export function init_move_fighters(): void {
  for (let k = 0; k < 2; ++k) {
    for (let i = 0; i < NB_DIRS; ++i) {
      for (let j = 0; j < NB_TRY_MOVE; ++j) {
        const dir = FIGHTER_MOVE_DIR[k]![i]![j]!;
        const o = MV(k, i, j);
        FIGHTER_MOVE_X[o] = FIGHTER_MOVE_X_REF[dir]!;
        FIGHTER_MOVE_Y[o] = FIGHTER_MOVE_Y_REF[dir]!;
        let off = 0;
        if (FIGHTER_MOVE_X[o] === 1) ++off;
        if (FIGHTER_MOVE_X[o] === -1) --off;
        if (FIGHTER_MOVE_Y[o] === 1) off += G.CURRENT_AREA_W;
        if (FIGHTER_MOVE_Y[o] === -1) off -= G.CURRENT_AREA_W;
        FIGHTER_MOVE_OFFSET[o] = off;
      }
    }
  }
  for (let i = 0; i < G.CURRENT_ARMY_SIZE; ++i) disp_fighter(i);
  for (let i = 1; i <= 16; ++i) {
    for (let j = 0; j < 2; ++j) {
      let k = -1;
      switch (i) {
        case 1:
          k = j ? DIR_NNW : DIR_NNE;
          break;
        case 3:
          k = DIR_NE;
          break;
        case 2:
          k = j ? DIR_ENE : DIR_ESE;
          break;
        case 6:
          k = DIR_SE;
          break;
        case 4:
          k = j ? DIR_SSE : DIR_SSW;
          break;
        case 12:
          k = DIR_SW;
          break;
        case 8:
          k = j ? DIR_WSW : DIR_WNW;
          break;
        case 9:
          k = DIR_NW;
          break;
      }
      LOCAL_DIR[(i - 1) * 2 + j] = k;
    }
  }
}

export function get_main_dir(mesh: number, team: number, sens: number, start: number): number {
  const m = G.CURRENT_MESH!;
  let dist = AREA_START_GRADIENT;
  let dir = -1;
  let i = start;
  if (sens) {
    do {
      const mesh2 = m.link[mesh * NB_DIRS + i]!;
      if (mesh2 !== -1 && m.grad[mesh2 * NB_TEAMS + team]! < dist) {
        dir = i;
        dist = m.grad[mesh2 * NB_TEAMS + team]!;
      }
      i = i < NB_DIRS - 1 ? i + 1 : 0;
    } while (i !== start);
  } else {
    do {
      const mesh2 = m.link[mesh * NB_DIRS + i]!;
      if (mesh2 !== -1 && m.grad[mesh2 * NB_TEAMS + team]! < dist) {
        dir = i;
        dist = m.grad[mesh2 * NB_TEAMS + team]!;
      }
      i = i > 0 ? i - 1 : NB_DIRS - 1;
    } while (i !== start);
  }
  return dir >= 0 ? dir : G.GLOBAL_CLOCK % NB_TEAMS;
}

function get_close_dir(mesh: number, f: number, team: number, sens: number, start: number): number {
  const a = G.CURRENT_ARMY!;
  const u = G.CURRENT_MESH!.update[mesh * NB_TEAMS + team]!;
  const cursor_x = (u << 16) >> 16;
  const cursor_y = u >> 16;
  const fighter_x = a.x[f]!, fighter_y = a.y[f]!;
  let code_dir = 0;
  if (cursor_y < fighter_y) code_dir += 1;
  if (cursor_x > fighter_x) code_dir += 2;
  if (cursor_y > fighter_y) code_dir += 4;
  if (cursor_x < fighter_x) code_dir += 8;
  return code_dir ? LOCAL_DIR[(code_dir - 1) * 2 + (sens ? 1 : 0)]! : start;
}

export function move_fighters(): void {
  const attack = [0, 0, 0, 0, 0, 0], defense = [0, 0, 0, 0, 0, 0], new_health = [0, 0, 0, 0, 0, 0];
  const cpu_influence = [0, 0, 0, 0, 0, 0];
  const R = G.LW_CONFIG_CURRENT_RULES;
  let sens = 0;
  for (let i = 0; i < NB_TEAMS; ++i) {
    const c = G.CURRENT_CURSOR[i]!;
    if (c.control_type === CONFIG_CONTROL_TYPE_CPU && c.active) cpu_influence[c.team] = R.cpu_advantage;
  }
  for (let i = 0; i < G.PLAYING_TEAMS; ++i) {
    let coef = G.ACTIVE_FIGHTERS[i]! * G.PLAYING_TEAMS - G.CURRENT_ARMY_SIZE;
    coef *= 256;
    coef = Math.trunc(coef / G.CURRENT_ARMY_SIZE);
    if (coef > 256) coef = 256;
    coef *= (R.number_influence - 8) * (R.number_influence - 8);
    coef = Math.trunc(coef / 64);
    if (R.number_influence < 8) coef = -coef;
    if (coef < 0) coef = Math.trunc(coef / 2);
    coef += 256;
    attack[i] = Math.trunc((coef * fixsqrt(fixsqrt(1 << (R.fighter_attack + cpu_influence[i]!)))) / (256 * 8));
    if (attack[i]! >= MAX_FIGHTER_HEALTH) attack[i] = MAX_FIGHTER_HEALTH - 1;
    if (attack[i]! < 1) attack[i] = 1;
    defense[i] = Math.trunc((coef * fixsqrt(fixsqrt(1 << (R.fighter_defense + cpu_influence[i]!)))) / (256 * 256));
    if (defense[i]! >= MAX_FIGHTER_HEALTH) defense[i] = MAX_FIGHTER_HEALTH - 1;
    if (defense[i]! < 1) defense[i] = 1;
    new_health[i] = Math.trunc((coef * fixsqrt(fixsqrt(1 << (R.fighter_new_health + cpu_influence[i]!)))) / (256 * 4));
    if (new_health[i]! >= MAX_FIGHTER_HEALTH) new_health[i] = MAX_FIGHTER_HEALTH - 1;
    if (new_health[i]! < 1) new_health[i] = 1;
    G.ACTIVE_FIGHTERS[i] = 0;
  }
  let start = Math.trunc(G.GLOBAL_CLOCK / 6) % NB_DIRS;
  const table = Math.trunc(G.GLOBAL_CLOCK / 3) % 2;
  const a = G.CURRENT_ARMY!;
  const m = G.CURRENT_MESH!;
  const AM = G.AREA_MESH, AF = G.AREA_FIGHTER;
  const W = G.CURRENT_AREA_W;
  const hit = (q: number, team: number, amount: number): boolean => {
    const t = AF[q]!;
    if (AM[q] !== -1 && t !== -1 && a.team[t] !== team) {
      a.health[t] = a.health[t]! - amount;
      if (a.health[t]! < 0) {
        while (a.health[t]! < 0) a.health[t] = a.health[t]! + new_health[team]!;
        a.team[t] = team;
      }
      disp_fighter(t);
      return true;
    }
    return false;
  };
  for (let f = 0; f < G.CURRENT_ARMY_SIZE; ++f) {
    const team = a.team[f]!;
    G.ACTIVE_FIGHTERS[team]!++;
    start = start < NB_DIRS - 1 ? start + 1 : 0;
    const p = a.y[f]! * W + a.x[f]!;
    const pm = AM[p]!;
    const mi = pm * NB_TEAMS + team;
    if (m.update[mi]! >= 0) {
      m.dir[mi] = get_close_dir(pm, f, team, sens++ % 2, start);
    } else if (-m.update[mi]! < G.GLOBAL_CLOCK) {
      m.dir[mi] = get_main_dir(pm, team, sens++ % 2, start);
      m.update[mi] = -G.GLOBAL_CLOCK;
    }
    const dir = m.dir[mi]!;
    const base = MV(table, dir, 0);
    let moved = false;
    for (let t = 0; t < NB_TRY_MOVE; t++) {
      const q = p + FIGHTER_MOVE_OFFSET[base + t]!;
      if (AM[q] !== -1 && AF[q] === -1) {
        erase_fighter(f);
        AF[q] = f;
        AF[p] = -1;
        a.x[f] = a.x[f]! + FIGHTER_MOVE_X[base + t]!;
        a.y[f] = a.y[f]! + FIGHTER_MOVE_Y[base + t]!;
        disp_fighter(f);
        moved = true;
        break;
      }
    }
    if (!moved) {
      const p0 = p + FIGHTER_MOVE_OFFSET[base]!;
      const p1 = p + FIGHTER_MOVE_OFFSET[base + 1]!;
      const p2 = p + FIGHTER_MOVE_OFFSET[base + 2]!;
      if (!hit(p0, team, attack[team]!) && !hit(p1, team, attack[team]! >> mutation.sideAttackFactor) &&
        !hit(p2, team, attack[team]! >> mutation.sideAttackFactor)) {
        const t0 = AF[p0]!;
        if (AM[p0] !== -1 && t0 !== -1 && a.team[t0] === team) {
          a.health[t0] = a.health[t0]! + defense[team]!;
          if (a.health[t0]! >= MAX_FIGHTER_HEALTH) a.health[t0] = MAX_FIGHTER_HEALTH - 1;
          disp_fighter(t0);
        }
      }
    }
  }
}

// ---- move.c ----

const LW_MOVE_SIDE_LIMIT = 10;

function move_if_free(c: { x: number; y: number }, dir: number): number {
  const W = G.CURRENT_AREA_W;
  const A = G.AREA_MESH;
  while (dir > 8) dir -= 8;
  while (dir < 1) dir += 8;
  const x = c.x, y = c.y;
  switch (dir) {
    case 1:
      if (A[(y - 1) * W + x] !== -1) {
        c.y--;
        return 1;
      }
      break;
    case 2:
      if (A[(y - 1) * W + x + 1] !== -1) {
        c.y--;
        c.x++;
        return 1;
      }
      break;
    case 3:
      if (A[y * W + x + 1] !== -1) {
        c.x++;
        return 1;
      }
      break;
    case 4:
      if (A[(y + 1) * W + x + 1] !== -1) {
        c.x++;
        c.y++;
        return 1;
      }
      break;
    case 5:
      if (A[(y + 1) * W + x] !== -1) {
        c.y++;
        return 1;
      }
      break;
    case 6:
      if (A[(y + 1) * W + x - 1] !== -1) {
        c.y++;
        c.x--;
        return 1;
      }
      break;
    case 7:
      if (A[y * W + x - 1] !== -1) {
        c.x--;
        return 1;
      }
      break;
    case 8:
      if (A[(y - 1) * W + x - 1] !== -1) {
        c.x--;
        c.y--;
        return 1;
      }
      break;
  }
  return 0;
}

export function move_cursor(indice: number): void {
  const c = G.CURRENT_CURSOR[indice]!;
  const m = G.CURRENT_MESH!;
  const W = G.CURRENT_AREA_W;
  const team = c.team;
  let mesh = G.AREA_MESH[c.y * W + c.x]!;
  m.update[mesh * NB_TEAMS + team] = -1;
  const key_state = c.key_state;
  const up = key_state & CURSOR_KEY_UP, right = key_state & CURSOR_KEY_RIGHT, down = key_state & CURSOR_KEY_DOWN,
    left = key_state & CURSOR_KEY_LEFT;
  let horiz = 0, vert = 0, dir = 0, moved = 0;
  if (right && !left) horiz = 1;
  if (!right && left) horiz = -1;
  if (up && !down) vert = -1;
  if (!up && down) vert = 1;
  if (horiz === 0 && vert === 0) dir = 0;
  if (horiz === 0 && vert === -1) dir = 1;
  if (horiz === 1 && vert === -1) dir = 2;
  if (horiz === 1 && vert === 0) dir = 3;
  if (horiz === 1 && vert === 1) dir = 4;
  if (horiz === 0 && vert === 1) dir = 5;
  if (horiz === -1 && vert === 1) dir = 6;
  if (horiz === -1 && vert === 0) dir = 7;
  if (horiz === -1 && vert === -1) dir = 8;
  if (dir) {
    moved = move_if_free(c, dir);
    if (!moved) moved = move_if_free(c, dir - 1);
    if (!moved) moved = move_if_free(c, dir + 1);
    if (!moved) {
      const a1 = { x: c.x, y: c.y }, b1 = { x: c.x, y: c.y };
      let i = 0;
      while (!moved && i < LW_MOVE_SIDE_LIMIT) {
        if (move_if_free(a1, dir - 2)) {
          const a2 = { x: a1.x, y: a1.y };
          if (move_if_free(a2, dir - 1)) moved = move_if_free(c, dir - 2);
        }
        if (move_if_free(b1, dir + 2)) {
          const b2 = { x: b1.x, y: b1.y };
          if (move_if_free(b2, dir + 1)) moved = move_if_free(c, dir + 2);
        }
        i++;
      }
    }
  }
  if (moved || !(G.GLOBAL_CLOCK % (NB_DIRS + 1))) c.val--;
  mesh = G.AREA_MESH[c.y * W + c.x]!;
  m.update[mesh * NB_TEAMS + team] = ((c.y & 0xffff) << 16) | (c.x & 0xffff);
}

// ---- autoplay.c ----

const LW_AUTOPLAY_RANDOM_LIMIT = 10000;
const COMPUTER_PATH_KEYS = Array.from({ length: NB_TEAMS }, () => new Int8Array(COMPUTER_PATH_MAX));
const COMPUTER_PATH_SIZE = [0, 0, 0, 0, 0, 0];
const COMPUTER_PATH_WAIT = [0, 0, 0, 0, 0, 0];

function calculate_computer_path(dst_x: number, dst_y: number, cursor: number): void {
  const W = G.CURRENT_AREA_W;
  const table = G.GLOBAL_CLOCK % 2;
  const c = G.CURRENT_CURSOR[cursor]!;
  const team = c.team;
  const src_x = c.x, src_y = c.y;
  const src_mesh = G.AREA_MESH[src_y * W + src_x]!;
  let x = dst_x, y = dst_y;
  let path_mesh = G.AREA_MESH[y * W + x]!;
  let pos = 0, sens = 0, start = 0;
  const keys = COMPUTER_PATH_KEYS[cursor]!;
  while (pos < COMPUTER_PATH_MAX && path_mesh !== -1 && path_mesh !== src_mesh) {
    const dir = get_main_dir(path_mesh, team, sens, start);
    const dx = FIGHTER_MOVE_X[MV(table, dir, 0)]!;
    const dy = FIGHTER_MOVE_Y[MV(table, dir, 0)]!;
    x += dx;
    y += dy;
    path_mesh = G.AREA_MESH[y * W + x]!;
    if (path_mesh !== -1) {
      let k = 0;
      if (dy > 0) k += CURSOR_KEY_UP;
      if (dx < 0) k += CURSOR_KEY_RIGHT;
      if (dy < 0) k += CURSOR_KEY_DOWN;
      if (dx > 0) k += CURSOR_KEY_LEFT;
      keys[pos] = k;
      pos++;
    }
    start++;
    if (start === NB_DIRS) {
      start = 0;
      sens = sens ? 0 : 1;
    }
  }
  if (path_mesh === src_mesh) {
    while (pos < COMPUTER_PATH_MAX && (x !== src_x || y !== src_y)) {
      let k = 0;
      if (y < src_y) {
        y++;
        k += CURSOR_KEY_UP;
      }
      if (x > src_x) {
        x--;
        k += CURSOR_KEY_RIGHT;
      }
      if (y > src_y) {
        y--;
        k += CURSOR_KEY_DOWN;
      }
      if (x < src_x) {
        x++;
        k += CURSOR_KEY_LEFT;
      }
      keys[pos] = k;
      pos++;
    }
    COMPUTER_PATH_SIZE[cursor] = pos;
  } else COMPUTER_PATH_SIZE[cursor] = 0;
  COMPUTER_PATH_WAIT[cursor] = COMPUTER_PATH_SIZE[cursor]!;
}

export function reset_computer_path(): void {
  for (let i = 0; i < NB_TEAMS; ++i) {
    COMPUTER_PATH_SIZE[i] = 0;
    COMPUTER_PATH_WAIT[i] = 0;
  }
}

function random_free_xy_by_control_type(out: { x: number; y: number }, team: number, control_type: number): number {
  const a = G.CURRENT_ARMY!;
  const control_type_array = [0, 0, 0, 0, 0, 0].map(() => CONFIG_CONTROL_TYPE_OFF);
  let found = 0, foundable = 0;
  for (let i = 0; i < NB_TEAMS; ++i) {
    const c = G.CURRENT_CURSOR[i]!;
    if ((c.control_type === control_type || control_type === CONFIG_CONTROL_TYPE_OFF) && c.active) {
      control_type_array[c.team] = control_type;
    }
  }
  let i = 0;
  const ok = (k: number): boolean => a.team[k] !== team &&
    (control_type_array[a.team[k]!] === control_type || control_type === CONFIG_CONTROL_TYPE_OFF);
  for (i = 0; i < G.CURRENT_ARMY_SIZE && !foundable; ++i) foundable |= ok(i) ? 1 : 0;
  if (foundable) {
    let random_limit = 0;
    while (!found && random_limit < LW_AUTOPLAY_RANDOM_LIMIT) {
      i = random() % G.CURRENT_ARMY_SIZE;
      found = ok(i) ? 1 : 0;
      random_limit++;
    }
  }
  if (!found) i = random() % G.CURRENT_ARMY_SIZE;
  out.x = a.x[i]!;
  out.y = a.y[i]!;
  return found;
}

function random_free_xy_different_team(out: { x: number; y: number }, team: number): void {
  let control_type;
  switch (G.LW_CONFIG_CURRENT_RULES.cpu_vs_human) {
    case CONFIG_CPU_VS_HUMAN_ALWAYS:
      control_type = CONFIG_CONTROL_TYPE_HUMAN;
      break;
    case CONFIG_CPU_VS_HUMAN_NEVER:
      control_type = CONFIG_CONTROL_TYPE_CPU;
      break;
    default:
      control_type = CONFIG_CONTROL_TYPE_OFF;
  }
  if (!random_free_xy_by_control_type(out, team, control_type)) random_free_xy_by_control_type(out, team, CONFIG_CONTROL_TYPE_OFF);
}

export function get_computer_next_move(cursor: number): number {
  if (COMPUTER_PATH_SIZE[cursor]! > 0) return COMPUTER_PATH_KEYS[cursor]![--COMPUTER_PATH_SIZE[cursor]!]!;
  const c = G.CURRENT_CURSOR[cursor]!;
  const team = c.team;
  const f = G.AREA_FIGHTER[c.y * G.CURRENT_AREA_W + c.x]!;
  const meme_equipe = f !== -1 ? (G.CURRENT_ARMY!.team[f] === team ? 1 : 0) : 1;
  if (--COMPUTER_PATH_WAIT[cursor]! < 0 || meme_equipe) {
    const out = { x: 0, y: 0 };
    random_free_xy_different_team(out, team);
    calculate_computer_path(out.x, out.y, cursor);
  }
  return 0;
}

// ---- decal.c ----

export function get_cursor_from_team(team: number): number {
  let i, cursor = -1;
  for (i = 0; i < NB_TEAMS && cursor < 0; ++i) if (team === G.CURRENT_CURSOR[i]!.team) cursor = i;
  return i;
}

export function eliminate_team(team: number): number {
  if (G.PLAYING_TEAMS > 0) {
    G.PLAYING_TEAMS--;
    for (let i = 0; i < NB_TEAMS; ++i) {
      const c = G.CURRENT_CURSOR[i]!;
      if (c.team === team && c.active) {
        c.active = 0;
        c.loose_time = G.TIME_ELAPSED;
        c.score_order = G.PLAYING_TEAMS + 1;
      }
    }
    for (let i = 0; i < NB_TEAMS; ++i) if (G.CURRENT_CURSOR[i]!.team > team) G.CURRENT_CURSOR[i]!.team--;
    const a = G.CURRENT_ARMY!;
    for (let i = 0; i < G.CURRENT_ARMY_SIZE; ++i) if (a.team[i]! > team) a.team[i] = a.team[i]! - 1;
    const m = G.CURRENT_MESH!;
    for (let j = team; j < G.PLAYING_TEAMS; ++j) {
      G.ACTIVE_FIGHTERS[j] = G.ACTIVE_FIGHTERS[j + 1]!;
      G.COLOR_FIRST_ENTRY[j] = G.COLOR_FIRST_ENTRY[j + 1]!;
      for (let i = 0; i < G.CURRENT_MESH_SIZE; ++i) {
        m.grad[i * NB_TEAMS + j] = m.grad[i * NB_TEAMS + j + 1]!;
        m.dir[i * NB_TEAMS + j] = m.dir[i * NB_TEAMS + j + 1]!;
        m.update[i * NB_TEAMS + j] = m.update[i * NB_TEAMS + j + 1]!;
      }
    }
    return 0;
  }
  return 1;
}

// ---- checksum.c ----

export function lw_checksum_calc(): number {
  let checksum = 0;
  let rval = 55665;
  const cst1 = 52845, cst2 = 22719;
  const a = G.CURRENT_ARMY!;
  if (!(G.GLOBAL_CLOCK % 100)) {
    for (let i = 0; i < G.CURRENT_ARMY_SIZE; ++i) {
      const value = (a.x[i]! + a.y[i]! + a.health[i]! + a.team[i]! + a.last_dir[i]!) & 0xff;
      const cipher = (value ^ (rval >> 8)) & 0xff;
      rval = ((cipher + rval) * cst1 + cst2) & 0xffff;
      checksum = (checksum + cipher) >>> 0;
    }
  }
  return checksum | 0;
}
