// pixmap.c: the window's contents as 8-bit colour indices (the X11 version keeps this copy of
// everything it draws; the page shows it), and the icon "pixmaps" of the map's tiles.
import { G } from './g.ts';
import { display } from './g.ts';
import * as C from './consts.ts';
import { prog_box } from './screen.ts';
import { init_icon_pixmap } from './lcx11.ts';

/** the pixmap, and where its memory comes from (the page shares it with the worker) */
export const PX: { pixmap: Uint8Array; alloc: (n: number) => Uint8Array } = {
  pixmap: new Uint8Array(0),
  alloc: (n) => new Uint8Array(n),
};

export function initialize_pixmap(): void {
  G.pixmap_height = display.winH - 2 * G.borderx;
  G.pixmap_width = display.winW - 2 * G.bordery;
  PX.pixmap = PX.alloc(G.pixmap_height * G.pixmap_width);
}

export function resize_pixmap(new_width: number, new_height: number): void {
  if (new_width > G.pixmap_width || new_height > G.pixmap_height) {
    if (new_width < G.pixmap_width) new_width = G.pixmap_width;
    if (new_height < G.pixmap_height) new_height = G.pixmap_height;
    // the original mallocs the new pixmap without clearing it, then redraws everything
    PX.pixmap = PX.alloc(new_height * new_width);
    G.pixmap_width = new_width;
    G.pixmap_height = new_height;
  }
}

export const pixmap_index = (x: number, y: number): number => y * G.pixmap_width + x;

/** (int) of the char: signed, as in the original */
export function pixmap_getpixel(x: number, y: number): number {
  return (PX.pixmap[pixmap_index(x, y)] << 24) >> 24;
}
export function pixmap_setpixel(x: number, y: number, col: number): void {
  PX.pixmap[pixmap_index(x, y)] = col;
}
export function pixmap_hline(x1: number, y1: number, x2: number, col: number): void {
  const i = pixmap_index(x1, y1);
  for (let j = 0; j <= x2 - x1; j++) PX.pixmap[i + j] = col;
}
export function pixmap_vline(x1: number, y1: number, y2: number, col: number): void {
  const i = pixmap_index(x1, y1);
  for (let j = 0; j <= y2 - y1; j++) PX.pixmap[i + j * G.pixmap_width] = col;
}
export function pixmap_fillbox(x: number, y: number, w: number, h: number, col: number): void {
  let i = pixmap_index(x, y);
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) PX.pixmap[i++] = col;
    i += G.pixmap_width - w;
  }
}
/** src at offset srcOff is the box's first pixel (Fgl_putbox_low has moved the pointer) */
export function pixmap_putbox(src: Uint8Array, srcOff: number, src_x: number, src_y: number, src_w: number,
  dst_x: number, dst_y: number, w: number, h: number): void {
  let i = pixmap_index(dst_x, dst_y);
  let j = srcOff + src_x + src_y * src_w;
  for (let y = src_y; y < src_y + h; y++) {
    for (let x = src_x; x < src_x + w; x++) PX.pixmap[i++] = src[j++];
    i += G.pixmap_width - w;
    j += src_w - w;
  }
}
export function update_pixmap(x1: number, y1: number, sizex: number, sizey: number, dx: number, dy: number,
  real_size: number, g: Uint8Array): void {
  for (let y = 0; y < sizey; y++) {
    let i = pixmap_index(dx, dy + y);
    let j = (y1 + y) * real_size * 16 + x1;
    for (let x = 0; x < sizex; x++) PX.pixmap[i++] = g[j++];
  }
}

/** which types have an icon pixmap (init_pixmaps); the others are drawn with Fgl_putbox */
export const icon_pixmap = new Uint8Array(C.NUM_OF_TYPES);

export function init_pixmaps(): void {
  for (let i = 1; i < C.NUM_OF_TYPES; i++) icon_pixmap[i] = 0;
  const ip = init_icon_pixmap;
  ip(C.CST_GREEN);
  for (const t of [C.CST_POWERL_H_L, C.CST_POWERL_V_L, C.CST_POWERL_LD_L, C.CST_POWERL_RD_L, C.CST_POWERL_LU_L,
    C.CST_POWERL_RU_L, C.CST_POWERL_LDU_L, C.CST_POWERL_LDR_L, C.CST_POWERL_LUR_L, C.CST_POWERL_UDR_L,
    C.CST_POWERL_LUDR_L]) ip(t);
  prog_box('', 6);
  for (const t of [C.CST_POWERL_H_D, C.CST_POWERL_V_D, C.CST_POWERL_LD_D, C.CST_POWERL_RD_D, C.CST_POWERL_LU_D,
    C.CST_POWERL_RU_D, C.CST_POWERL_LDU_D, C.CST_POWERL_LDR_D, C.CST_POWERL_LUR_D, C.CST_POWERL_UDR_D,
    C.CST_POWERL_LUDR_D, C.CST_WINDMILL_1_G, C.CST_WINDMILL_2_G, C.CST_WINDMILL_3_G]) ip(t);
  prog_box('', 12);
  for (const t of [C.CST_WINDMILL_1_RG, C.CST_WINDMILL_2_RG, C.CST_WINDMILL_3_RG, C.CST_WINDMILL_1_R,
    C.CST_WINDMILL_2_R, C.CST_WINDMILL_3_R, C.CST_WINDMILL_1_W, C.CST_WINDMILL_2_W, C.CST_WINDMILL_3_W,
    C.CST_COMMUNE_1, C.CST_COMMUNE_2, C.CST_COMMUNE_3, C.CST_COMMUNE_4, C.CST_COMMUNE_5]) ip(t);
  prog_box('', 18);
  for (const t of [C.CST_COMMUNE_6, C.CST_COMMUNE_7, C.CST_COMMUNE_8, C.CST_COMMUNE_9, C.CST_COMMUNE_10,
    C.CST_COMMUNE_11, C.CST_COMMUNE_12, C.CST_COMMUNE_13, C.CST_COMMUNE_14, C.CST_FARM_O3, C.CST_FARM_O7,
    C.CST_FARM_O11, C.CST_FARM_O15]) ip(t);
  prog_box('', 24);
  for (const t of [C.CST_INDUSTRY_L_C, C.CST_INDUSTRY_L_Q1, C.CST_INDUSTRY_L_Q2, C.CST_INDUSTRY_L_Q3,
    C.CST_INDUSTRY_L_Q4, C.CST_INDUSTRY_L_L1, C.CST_INDUSTRY_L_L2, C.CST_INDUSTRY_L_L3, C.CST_INDUSTRY_L_L4,
    C.CST_INDUSTRY_L_M1, C.CST_INDUSTRY_L_M2, C.CST_INDUSTRY_L_M3, C.CST_INDUSTRY_L_M4, C.CST_INDUSTRY_L_H1,
    C.CST_INDUSTRY_L_H2]) ip(t);
  prog_box('', 30);
  for (const t of [C.CST_INDUSTRY_L_H3, C.CST_INDUSTRY_L_H4, C.CST_INDUSTRY_H_C, C.CST_INDUSTRY_H_L1,
    C.CST_INDUSTRY_H_L2, C.CST_INDUSTRY_H_L3, C.CST_INDUSTRY_H_L4, C.CST_INDUSTRY_H_L5, C.CST_INDUSTRY_H_L6,
    C.CST_INDUSTRY_H_L7, C.CST_INDUSTRY_H_L8, C.CST_INDUSTRY_H_M1, C.CST_INDUSTRY_H_M2, C.CST_INDUSTRY_H_M3,
    C.CST_INDUSTRY_H_M4]) ip(t);
  prog_box('', 36);
  for (const t of [C.CST_INDUSTRY_H_M5, C.CST_INDUSTRY_H_M6, C.CST_INDUSTRY_H_M7, C.CST_INDUSTRY_H_M8,
    C.CST_INDUSTRY_H_H1, C.CST_INDUSTRY_H_H2, C.CST_INDUSTRY_H_H3, C.CST_INDUSTRY_H_H4, C.CST_INDUSTRY_H_H5,
    C.CST_INDUSTRY_H_H6, C.CST_INDUSTRY_H_H7, C.CST_INDUSTRY_H_H8]) ip(t);
  prog_box('', 42);
  for (const t of [C.CST_WATER, C.CST_WATER_D, C.CST_WATER_R, C.CST_WATER_U, C.CST_WATER_L, C.CST_WATER_LR,
    C.CST_WATER_UD, C.CST_WATER_LD, C.CST_WATER_RD, C.CST_WATER_LU, C.CST_WATER_UR, C.CST_WATER_LUD,
    C.CST_WATER_LRD, C.CST_WATER_LUR, C.CST_WATER_URD, C.CST_WATER_LURD, C.CST_TRACK_LR]) ip(t);
  prog_box('', 48);
  for (const t of [C.CST_TRACK_LU, C.CST_TRACK_LD, C.CST_TRACK_UD, C.CST_TRACK_UR, C.CST_TRACK_DR,
    C.CST_TRACK_LUR, C.CST_TRACK_LDR, C.CST_TRACK_LUD, C.CST_TRACK_UDR, C.CST_TRACK_LUDR, C.CST_ROAD_LR,
    C.CST_ROAD_LU, C.CST_ROAD_LD, C.CST_ROAD_UD, C.CST_ROAD_UR, C.CST_ROAD_DR, C.CST_ROAD_LUR, C.CST_ROAD_LDR]) ip(t);
  prog_box('', 54);
  for (const t of [C.CST_ROAD_LUD, C.CST_ROAD_UDR, C.CST_ROAD_LUDR, C.CST_RAIL_LR, C.CST_RAIL_LU, C.CST_RAIL_LD,
    C.CST_RAIL_UD, C.CST_RAIL_UR, C.CST_RAIL_DR, C.CST_RAIL_LUR, C.CST_RAIL_LDR, C.CST_RAIL_LUD, C.CST_RAIL_UDR,
    C.CST_RAIL_LUDR]) ip(t);
  prog_box('', 60);
  for (const t of [C.CST_POTTERY_0, C.CST_POTTERY_1, C.CST_POTTERY_2, C.CST_POTTERY_3, C.CST_POTTERY_4,
    C.CST_POTTERY_5, C.CST_POTTERY_6, C.CST_POTTERY_7, C.CST_POTTERY_8, C.CST_POTTERY_9, C.CST_POTTERY_10,
    C.CST_MILL_0, C.CST_MILL_1, C.CST_MILL_2, C.CST_MILL_3, C.CST_MILL_4]) ip(t);
  prog_box('', 66);
  for (const t of [C.CST_MILL_5, C.CST_MILL_6, C.CST_BLACKSMITH_0, C.CST_BLACKSMITH_1, C.CST_BLACKSMITH_2,
    C.CST_BLACKSMITH_3, C.CST_BLACKSMITH_4, C.CST_BLACKSMITH_5, C.CST_BLACKSMITH_6, C.CST_RESIDENCE_LL,
    C.CST_RESIDENCE_ML, C.CST_RESIDENCE_HL, C.CST_RESIDENCE_LH, C.CST_RESIDENCE_MH, C.CST_RESIDENCE_HH,
    C.CST_POWERS_COAL_EMPTY, C.CST_POWERS_COAL_LOW]) ip(t);
  prog_box('', 72);
  for (const t of [C.CST_POWERS_COAL_MED, C.CST_POWERS_COAL_FULL, C.CST_SUBSTATION_R, C.CST_SUBSTATION_G,
    C.CST_SUBSTATION_RG, C.CST_MARKET_EMPTY, C.CST_MARKET_LOW, C.CST_MARKET_MED, C.CST_MARKET_FULL,
    C.CST_COALMINE_EMPTY, C.CST_COALMINE_LOW, C.CST_COALMINE_MED, C.CST_COALMINE_FULL]) ip(t);
  prog_box('', 78);
  for (const t of [C.CST_OREMINE_1, C.CST_OREMINE_2, C.CST_OREMINE_3, C.CST_OREMINE_4, C.CST_OREMINE_5,
    C.CST_OREMINE_6, C.CST_OREMINE_7, C.CST_OREMINE_8, C.CST_TIP_0, C.CST_TIP_1, C.CST_TIP_2, C.CST_TIP_3,
    C.CST_TIP_4, C.CST_TIP_5, C.CST_TIP_6, C.CST_TIP_7, C.CST_TIP_8]) ip(t);
  prog_box('', 84);
  for (const t of [C.CST_ROCKET_1, C.CST_ROCKET_2, C.CST_ROCKET_3, C.CST_ROCKET_4, C.CST_ROCKET_5,
    C.CST_ROCKET_6, C.CST_ROCKET_7, C.CST_ROCKET_FLOWN, C.CST_FIRESTATION_1, C.CST_FIRESTATION_2,
    C.CST_FIRESTATION_3, C.CST_FIRESTATION_4, C.CST_FIRESTATION_5, C.CST_FIRESTATION_6, C.CST_FIRESTATION_7,
    C.CST_FIRESTATION_8, C.CST_FIRESTATION_9, C.CST_FIRESTATION_10]) ip(t);
  prog_box('', 90);
  for (const t of [C.CST_CRICKET_1, C.CST_CRICKET_2, C.CST_CRICKET_3, C.CST_CRICKET_4, C.CST_CRICKET_5,
    C.CST_CRICKET_6, C.CST_CRICKET_7, C.CST_FIRE_1, C.CST_FIRE_2, C.CST_FIRE_3, C.CST_FIRE_4, C.CST_FIRE_5,
    C.CST_FIRE_DONE1, C.CST_FIRE_DONE2, C.CST_FIRE_DONE3, C.CST_FIRE_DONE4, C.CST_PARKLAND_PLANE, C.CST_RECYCLE,
    C.CST_HEALTH, C.CST_BURNT, C.CST_MONUMENT_5, C.CST_SCHOOL, C.CST_SHANTY]) ip(t);
  prog_box('', 96);
  for (const t of [C.CST_POWERS_SOLAR, C.CST_UNIVERSITY, C.CST_EX_PORT]) ip(t);
}
