// shrtypes.c: placing a type on the map, and connect_transport(), which picks the graphic of every
// power line, track, road, rail and water square from its neighbours.
import * as C from './consts.ts';
import { MT, MG, MI, P, IX, FLAGS, I1, I2 } from './map.ts';
import { main_groups, get_group_of_type } from './lintypes.ts';

export function set_mappoint_used(fromx: number, fromy: number, x: number, y: number): void {
  MT[P(x, y)] = C.CST_USED;
  MG[P(x, y)] = C.GROUP_USED;
  MI[IX(x, y) + I1] = fromx;
  MI[IX(x, y) + I2] = fromy;
}

export function set_mappoint(x: number, y: number, selected_type: number): void {
  const grp = get_group_of_type(selected_type);
  if (grp < 0) return;
  MT[P(x, y)] = selected_type;
  MG[P(x, y)] = grp;
  const size = main_groups[grp].size;
  if (size === 2) {
    set_mappoint_used(x, y, x + 1, y);
    set_mappoint_used(x, y, x, y + 1);
    set_mappoint_used(x, y, x + 1, y + 1);
  } else if (size === 3) {
    set_mappoint_used(x, y, x + 1, y);
    set_mappoint_used(x, y, x + 2, y);
    set_mappoint_used(x, y, x + 1, y + 1);
    set_mappoint_used(x, y, x + 2, y + 1);
    set_mappoint_used(x, y, x + 1, y + 2);
    set_mappoint_used(x, y, x + 2, y + 2);
    set_mappoint_used(x, y, x, y + 1);
    set_mappoint_used(x, y, x, y + 2);
  } else if (size === 4) {
    set_mappoint_used(x, y, x + 1, y);
    set_mappoint_used(x, y, x + 2, y);
    set_mappoint_used(x, y, x + 1, y + 1);
    set_mappoint_used(x, y, x + 2, y + 1);
    set_mappoint_used(x, y, x + 1, y + 2);
    set_mappoint_used(x, y, x + 2, y + 2);
    set_mappoint_used(x, y, x, y + 1);
    set_mappoint_used(x, y, x, y + 2);
    set_mappoint_used(x, y, x + 3, y);
    set_mappoint_used(x, y, x + 3, y + 1);
    set_mappoint_used(x, y, x + 3, y + 2);
    set_mappoint_used(x, y, x + 3, y + 3);
    set_mappoint_used(x, y, x, y + 3);
    set_mappoint_used(x, y, x + 1, y + 3);
    set_mappoint_used(x, y, x + 2, y + 3);
  }
}

const power_table = [
  C.CST_POWERL_H_D, C.CST_POWERL_V_D, C.CST_POWERL_H_D, C.CST_POWERL_RD_D,
  C.CST_POWERL_H_D, C.CST_POWERL_LD_D, C.CST_POWERL_H_D, C.CST_POWERL_LDR_D,
  C.CST_POWERL_V_D, C.CST_POWERL_V_D, C.CST_POWERL_RU_D, C.CST_POWERL_UDR_D,
  C.CST_POWERL_LU_D, C.CST_POWERL_LDU_D, C.CST_POWERL_LUR_D, C.CST_POWERL_LUDR_D,
];
const track_table = [
  C.CST_TRACK_LR, C.CST_TRACK_LR, C.CST_TRACK_UD, C.CST_TRACK_LU,
  C.CST_TRACK_LR, C.CST_TRACK_LR, C.CST_TRACK_UR, C.CST_TRACK_LUR,
  C.CST_TRACK_UD, C.CST_TRACK_LD, C.CST_TRACK_UD, C.CST_TRACK_LUD,
  C.CST_TRACK_DR, C.CST_TRACK_LDR, C.CST_TRACK_UDR, C.CST_TRACK_LUDR,
];
const road_table = [
  C.CST_ROAD_LR, C.CST_ROAD_LR, C.CST_ROAD_UD, C.CST_ROAD_LU,
  C.CST_ROAD_LR, C.CST_ROAD_LR, C.CST_ROAD_UR, C.CST_ROAD_LUR,
  C.CST_ROAD_UD, C.CST_ROAD_LD, C.CST_ROAD_UD, C.CST_ROAD_LUD,
  C.CST_ROAD_DR, C.CST_ROAD_LDR, C.CST_ROAD_UDR, C.CST_ROAD_LUDR,
];
const rail_table = [
  C.CST_RAIL_LR, C.CST_RAIL_LR, C.CST_RAIL_UD, C.CST_RAIL_LU,
  C.CST_RAIL_LR, C.CST_RAIL_LR, C.CST_RAIL_UR, C.CST_RAIL_LUR,
  C.CST_RAIL_UD, C.CST_RAIL_LD, C.CST_RAIL_UD, C.CST_RAIL_LUD,
  C.CST_RAIL_DR, C.CST_RAIL_LDR, C.CST_RAIL_UDR, C.CST_RAIL_LUDR,
];
const water_table = [
  C.CST_WATER, C.CST_WATER_D, C.CST_WATER_R, C.CST_WATER_RD,
  C.CST_WATER_L, C.CST_WATER_LD, C.CST_WATER_LR, C.CST_WATER_LRD,
  C.CST_WATER_U, C.CST_WATER_UD, C.CST_WATER_UR, C.CST_WATER_URD,
  C.CST_WATER_LU, C.CST_WATER_LUD, C.CST_WATER_LUR, C.CST_WATER_LURD,
];

const isPowerish = (g: number): boolean =>
  g === C.GROUP_POWER_LINE || g === C.GROUP_SOLAR_POWER || g === C.GROUP_SUBSTATION || g === C.GROUP_COAL_POWER;
const canDigUnder = (g: number): boolean =>
  g === C.GROUP_TRACK || g === C.GROUP_RAIL || g === C.GROUP_ROAD || g === C.GROUP_WATER;
const isTerminus = (g: number): boolean =>
  g === C.GROUP_COMMUNE || g === C.GROUP_COALMINE || g === C.GROUP_OREMINE || g === C.GROUP_INDUSTRY_L
  || g === C.GROUP_INDUSTRY_H || g === C.GROUP_RECYCLE || g === C.GROUP_TIP || g === C.GROUP_PORT;

/** track, road and rail: the same code with their own group and table */
function connectWay(x: number, y: number, grp: number, table: number[]): void {
  let mask = 0;
  if (MG[P(x, y - 1)] === grp) mask |= C.FLAG_UP;
  if (MG[P(x - 1, y)] === grp) mask |= C.FLAG_LEFT;
  let tflags = mask;
  const r = MG[P(x + 1, y)];
  if (r === grp) {
    tflags |= C.FLAG_RIGHT;
    mask |= C.FLAG_RIGHT;
  } else if (isTerminus(r)) mask |= C.FLAG_RIGHT;
  else if (MG[P(x + 1, y - 1)] === C.GROUP_COAL_POWER) mask |= C.FLAG_RIGHT;
  const d = MG[P(x, y + 1)];
  if (d === grp) {
    tflags |= C.FLAG_DOWN;
    mask |= C.FLAG_DOWN;
  } else if (isTerminus(d)) mask |= C.FLAG_DOWN;
  else if (MG[P(x - 1, y + 1)] === C.GROUP_COAL_POWER) mask |= C.FLAG_DOWN;
  const i = IX(x, y) + FLAGS;
  MI[i] &= ~(C.FLAG_UP | C.FLAG_DOWN | C.FLAG_LEFT | C.FLAG_RIGHT);
  MI[i] |= tflags;
  MT[P(x, y)] = table[mask];
}

export function connect_transport(originx: number, originy: number, w: number, h: number): void {
  if (originx <= 0) {
    w -= 1 - originx;
    originx = 1;
  }
  if (originy <= 0) {
    h -= 1 - originy;
    originy = 1;
  }
  if (originx + w >= C.WORLD_SIDE_LEN) w = C.WORLD_SIDE_LEN - originx;
  if (originy + h >= C.WORLD_SIDE_LEN) h = C.WORLD_SIDE_LEN - originy;

  for (let x = originx; x < originx + w; x++) {
    for (let y = originy; y < originy + h; y++) {
      switch (MG[P(x, y)]) {
        case C.GROUP_POWER_LINE: {
          let mask = 0;
          let group = MG[P(x, y - 1)];
          if (y > 1 && canDigUnder(group)) group = MG[P(x, y - 2)];
          if (isPowerish(group)) mask |= 8;
          group = MG[P(x - 1, y)];
          if (x > 1 && canDigUnder(group)) group = MG[P(x - 2, y)];
          if (isPowerish(group)) mask |= 4;
          group = MG[P(x + 1, y)];
          if (x < C.WORLD_SIDE_LEN - 2 && canDigUnder(group)) group = MG[P(x + 2, y)];
          // a windmill only counts when it is a modern one (the case falls through to the others)
          if ((group === C.GROUP_WINDMILL && !(MI[IX(x + 1, y) + I2] < C.MODERN_WINDMILL_TECH)) || isPowerish(group)) mask |= 2;
          group = MG[P(x, y + 1)];
          if (y < C.WORLD_SIDE_LEN - 2 && canDigUnder(group)) group = MG[P(x, y + 2)];
          if ((group === C.GROUP_WINDMILL && !(MI[IX(x, y + 1) + I2] < C.MODERN_WINDMILL_TECH)) || isPowerish(group)) ++mask;
          MT[P(x, y)] = power_table[mask];
          break;
        }
        case C.GROUP_TRACK: connectWay(x, y, C.GROUP_TRACK, track_table); break;
        case C.GROUP_ROAD: connectWay(x, y, C.GROUP_ROAD, road_table); break;
        case C.GROUP_RAIL: connectWay(x, y, C.GROUP_RAIL, rail_table); break;
        case C.GROUP_WATER: {
          let mask = 0;
          if (MG[P(x, y - 1)] === C.GROUP_WATER) mask |= 8;
          const type = MT[P(x - 1, y)];
          if ((type === C.CST_USED && MG[P(MI[IX(x - 1, y) + I1], MI[IX(x - 1, y) + I2])] === C.GROUP_PORT)
            || get_group_of_type(type) === C.GROUP_WATER) mask |= 4;
          if (MG[P(x + 1, y)] === C.GROUP_WATER) mask |= 2;
          if (MG[P(x, y + 1)] === C.GROUP_WATER) ++mask;
          MT[P(x, y)] = water_table[mask];
          break;
        }
      }
    }
  }
}
