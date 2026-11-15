// lw/disp.ts: drawing the battle: src/disp.c (the map, stretched or through the waves), src/pion.c (the
// cursors: a ring of 68 points blinking through the team's colours), and the debug views of src/grad.c and
// src/mesh.c (the "gradn" codes).

import { type Bitmap, create_bitmap, getpixel, putpixel, rectfill, stretch_blit } from '../al/bitmap.ts';
import { random } from '../glibc.ts';
import { disp_distorted_area } from './distor.ts';
import { lw_maptex_create_map } from './maptex.ts';
import { MIN_MAP_RES_H, MIN_MAP_RES_W } from './core.ts';
import { AREA_START_GRADIENT, FG_TEXTURE_FIRST_COLOR, G, MENU_BG, NB_TEAMS } from './state.ts';
import { VP } from './viewport.ts';

function disp_stretch_area(): void {
  const ns = VP.NEXT_SCREEN!;
  stretch_blit(G.CURRENT_AREA_DISP!, ns, 0, 0, G.CURRENT_AREA_W, G.CURRENT_AREA_H, 0, 0, ns.w, ns.h);
}

export function display_area(): void {
  const A = G.CONFIG_WAVE_AMPLI;
  if ((A[0] || A[1] || A[2] || A[3]) && G.CONFIG_WAVE_ON) disp_distorted_area();
  else disp_stretch_area();
}

function create_gradient_bitmap(team: number): Bitmap {
  const W = G.CURRENT_AREA_W, H = G.CURRENT_AREA_H;
  const result = create_bitmap(W, H);
  const m = G.CURRENT_MESH!;
  let i = 0;
  for (let y = 0; y < H; ++y) {
    for (let x = 0; x < W; ++x) {
      const temp = G.AREA_MESH[i++]!;
      if (temp !== -1) {
        const color = (m.grad[temp * NB_TEAMS + team]! + AREA_START_GRADIENT) % G.COLORS_PER_TEAM;
        putpixel(result, x, y, color + G.COLOR_FIRST_ENTRY[team]!);
      } else putpixel(result, x, y, MENU_BG);
    }
  }
  return result;
}

export function display_gradient(i: number): void {
  const bmp = create_gradient_bitmap(i);
  const ns = VP.NEXT_SCREEN!;
  stretch_blit(bmp, ns, 0, 0, bmp.w, bmp.h, 0, 0, ns.w, ns.h);
}

function create_mesh_bitmap(mode: number): Bitmap | null {
  const result = lw_maptex_create_map(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, G.LW_NETWORK_ON, G.LW_RANDOM_ON,
    MIN_MAP_RES_W[G.LW_CONFIG_CURRENT_RULES.min_map_res]!, MIN_MAP_RES_H[G.LW_CONFIG_CURRENT_RULES.min_map_res]!,
    G.CONFIG_USE_DEFAULT_TEXTURE);
  if (result) {
    const m = G.CURRENT_MESH!;
    for (let i = 0; i < G.CURRENT_MESH_SIZE; ++i) {
      let color;
      if (mode === 0) {
        color = 0;
        let j = m.side[i]!;
        while (j > 1) {
          j = Math.trunc(j / 2);
          ++color;
        }
      } else color = i;
      rectfill(result, m.x[i]!, m.y[i]!, m.x[i]! + m.side[i]! - 1, m.y[i]! + m.side[i]! - 1, 96 + (color % 32));
    }
  }
  return result;
}

export function display_mesh(i: number): void {
  const bmp = create_mesh_bitmap(i);
  if (bmp) {
    const ns = VP.NEXT_SCREEN!;
    stretch_blit(bmp, ns, 0, 0, bmp.w, bmp.h, 0, 0, ns.w, ns.h);
  }
}

// ---- pion.c ----

const CURSOR_CYCLE = 256;
const CURSOR_LIGHTS = 2;
const CURSOR_COLOR_NUMBER = 32;
const CL_INSIDE = 0, CL_MIDDLE = 1, CL_MIDDLE2 = 2, CL_OUTSIDE = 3;
// prettier-ignore
const CURSOR_LAYOUT: [number, number, number, number][] = [
  [0, -3, 0, CL_INSIDE], [0, -4, 0, CL_MIDDLE2], [0, -5, 0, CL_OUTSIDE],
  [1, -4, 1, CL_MIDDLE], [1, -5, 1, CL_OUTSIDE],
  [1, -3, 2, CL_INSIDE], [2, -4, 2, CL_OUTSIDE],
  [2, -3, 3, CL_MIDDLE], [3, -4, 3, CL_OUTSIDE],
  [2, -2, 4, CL_INSIDE], [3, -3, 4, CL_MIDDLE2],
  [3, -2, 5, CL_MIDDLE], [4, -3, 5, CL_OUTSIDE],
  [3, -1, 6, CL_INSIDE], [4, -2, 6, CL_OUTSIDE],
  [4, -1, 7, CL_MIDDLE], [5, -1, 7, CL_OUTSIDE],
  [3, 0, 8, CL_INSIDE], [4, 0, 8, CL_MIDDLE2], [5, 0, 8, CL_OUTSIDE],
  [4, 1, 9, CL_MIDDLE], [5, 1, 9, CL_OUTSIDE],
  [3, 1, 10, CL_INSIDE], [4, 2, 10, CL_OUTSIDE],
  [3, 2, 11, CL_MIDDLE], [4, 3, 11, CL_OUTSIDE],
  [2, 2, 12, CL_INSIDE], [3, 3, 12, CL_MIDDLE2],
  [2, 3, 13, CL_MIDDLE], [3, 4, 13, CL_OUTSIDE],
  [1, 3, 14, CL_INSIDE], [2, 4, 14, CL_OUTSIDE],
  [1, 4, 15, CL_MIDDLE], [1, 5, 15, CL_OUTSIDE],
  [-0, 3, 16, CL_INSIDE], [-0, 4, 16, CL_MIDDLE2], [-0, 5, 16, CL_OUTSIDE],
  [-1, 4, 17, CL_MIDDLE], [-1, 5, 17, CL_OUTSIDE],
  [-1, 3, 18, CL_INSIDE], [-2, 4, 18, CL_OUTSIDE],
  [-2, 3, 19, CL_MIDDLE], [-3, 4, 19, CL_OUTSIDE],
  [-2, 2, 20, CL_INSIDE], [-3, 3, 20, CL_MIDDLE2],
  [-3, 2, 21, CL_MIDDLE], [-4, 3, 21, CL_OUTSIDE],
  [-3, 1, 22, CL_INSIDE], [-4, 2, 22, CL_OUTSIDE],
  [-4, 1, 23, CL_MIDDLE], [-5, 1, 23, CL_OUTSIDE],
  [-3, -0, 8, CL_INSIDE], [-4, -0, 24, CL_MIDDLE2], [-5, -0, 25, CL_OUTSIDE],
  [-4, -1, 25, CL_MIDDLE], [-5, -1, 26, CL_OUTSIDE],
  [-3, -1, 10, CL_INSIDE], [-4, -2, 27, CL_OUTSIDE],
  [-3, -2, 27, CL_MIDDLE], [-4, -3, 28, CL_OUTSIDE],
  [-2, -2, 12, CL_INSIDE], [-3, -3, 28, CL_MIDDLE2],
  [-2, -3, 29, CL_MIDDLE], [-3, -4, 29, CL_OUTSIDE],
  [-1, -3, 14, CL_INSIDE], [-2, -4, 30, CL_OUTSIDE],
  [-1, -4, 31, CL_MIDDLE], [-1, -5, 31, CL_OUTSIDE],
];
const CURSOR_POINT_NUMBER = 68;
const CURSOR_GRAPHIC_MEMORY = Array.from({ length: NB_TEAMS }, () => new Int8Array(CURSOR_POINT_NUMBER));
const CURSOR_COLOR_MAP = new Int8Array(CURSOR_COLOR_NUMBER);
const CURSOR_COLOR_BACK = new Int8Array(CURSOR_COLOR_NUMBER);

export function init_disp_cursor(): void {
  for (let i = 0; i < CURSOR_COLOR_NUMBER; ++i) {
    let color_back = 0;
    while (color_back < FG_TEXTURE_FIRST_COLOR || color_back >= FG_TEXTURE_FIRST_COLOR + 32) {
      const x = random() % G.CURRENT_AREA_W;
      const y = random() % G.CURRENT_AREA_H;
      color_back = getpixel(G.CURRENT_AREA_BACK!, x, y);
    }
    CURSOR_COLOR_BACK[i] = color_back;
  }
}

function disp_cursor(number: number): void {
  const c = G.CURRENT_CURSOR[number]!;
  const x0 = c.x, y0 = c.y;
  const color_offset = G.COLOR_FIRST_ENTRY[c.team]!;
  const D = G.CURRENT_AREA_DISP!;
  for (let i = 0; i < CURSOR_POINT_NUMBER; ++i) {
    const [lx, ly, lc, row] = CURSOR_LAYOUT[i]!;
    const x = x0 + lx, y = y0 + ly;
    CURSOR_GRAPHIC_MEMORY[number]![i] = getpixel(D, x, y);
    switch (row) {
      case CL_OUTSIDE:
      case CL_INSIDE:
      case CL_MIDDLE:
        putpixel(D, x, y, CURSOR_COLOR_MAP[lc]! + color_offset);
        break;
      case CL_MIDDLE2:
        putpixel(D, x, y, CURSOR_COLOR_BACK[lc]!);
        break;
    }
  }
}

function undisp_cursor(number: number): void {
  const c = G.CURRENT_CURSOR[number]!;
  const D = G.CURRENT_AREA_DISP!;
  for (let i = 0; i < CURSOR_POINT_NUMBER; ++i) {
    const [lx, ly] = CURSOR_LAYOUT[i]!;
    putpixel(D, c.x + lx, c.y + ly, CURSOR_GRAPHIC_MEMORY[number]![i]!);
  }
}

export function disp_all_cursors(): void {
  const CPT = G.COLORS_PER_TEAM;
  const degrad_size = CURSOR_COLOR_NUMBER / (2 * CURSOR_LIGHTS);
  let ip = Math.trunc((G.GLOBAL_TICKER * CPT) / CURSOR_CYCLE) % (CPT * 2);
  let fp = 0;
  for (let i = 0; i < CURSOR_COLOR_NUMBER; ++i) {
    CURSOR_COLOR_MAP[i] = ip < CPT ? ip : 2 * CPT - 1 - ip;
    fp += CPT;
    while (fp >= degrad_size) {
      fp -= degrad_size;
      ip++;
    }
    while (ip >= 2 * CPT) ip -= 2 * CPT;
  }
  for (let i = 0; i < NB_TEAMS; ++i) if (G.CURRENT_CURSOR[i]!.active) disp_cursor(i);
}

export function undisp_all_cursors(): void {
  for (let i = NB_TEAMS - 1; i >= 0; --i) if (G.CURRENT_CURSOR[i]!.active) undisp_cursor(i);
}
