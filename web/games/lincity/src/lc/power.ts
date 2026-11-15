// power.c: the power grids (Corey Keasling's grid code of 1.12/1.13): mapping connected power lines and
// stations into grids, and handing out power from substations in range.
import * as C from './consts.ts';
import { G, substationx, substationy } from './g.ts';
import { MT, MG, MI, P, IX, I1, I2, I3, I5, I6, I7 } from './map.ts';
import { abs } from './c.ts';

export interface Grid { power_lines: number; total_power: number; avail_power: number; max_power: number; demand: number; powered: number }
export const MAX_GRIDS = 128;
export const grid: (Grid | null)[] = new Array(MAX_GRIDS).fill(null);

const POWER_LINE_LOSS = 1;
const POWER_MODULUS = 25;
const WEST = 1, NORTH = 2, EAST = 3, SOUTH = 4;

const XY_IS_GRID = (x: number, y: number): boolean => {
  const g = MG[P(x, y)];
  return g === C.GROUP_COAL_POWER || g === C.GROUP_WINDMILL || g === C.GROUP_POWER_LINE
    || g === C.GROUP_SOLAR_POWER || g === C.GROUP_SUBSTATION;
};
const XY_IS_TRANSPORT = (x: number, y: number): boolean => {
  const g = MG[P(x, y)];
  return g === C.GROUP_TRACK || g === C.GROUP_ROAD || g === C.GROUP_RAIL || g === C.GROUP_POWER_LINE;
};
const XY_IS_WATER = (x: number, y: number): boolean => MG[P(x, y)] === C.GROUP_WATER;
const IS_POWER_SOURCE = (x: number, y: number): boolean => {
  const g = MG[P(x, y)];
  return g === C.GROUP_COAL_POWER || g === C.GROUP_SOLAR_POWER || g === C.GROUP_WINDMILL;
};
const IS_POWER_LINE = (x: number, y: number): boolean => MG[P(x, y)] === C.GROUP_POWER_LINE;
const IS_OLD_WINDMILL = (x: number, y: number): boolean =>
  MG[P(x, y)] === C.GROUP_WINDMILL && MT[P(x, y)] !== C.CST_USED && MI[IX(x, y) + I2] < C.MODERN_WINDMILL_TECH;
const GRID_CURRENT = (x: number, y: number): boolean => MI[IX(x, y) + I7] === G.grid_inc;

export function power_time_step(): void {
  if (G.grid_num === 0) return;
  for (let gi = 1; gi <= G.grid_num; gi++) {
    const g = grid[gi]!;
    g.total_power = g.avail_power - g.power_lines * POWER_LINE_LOSS;
    const net = (g.total_power - g.demand) | 0;
    if (net < 0) g.powered = -1;
    else if (net < Math.trunc(g.avail_power / 4)) g.powered = 0;
    else g.powered = 1;
    g.avail_power = 0;
    g.demand = 0;
  }
  for (let gi = 0; gi < G.numof_substations; gi++) MI[IX(substationx[gi], substationy[gi]) + I5] = 0;
}

export function map_power_grid(): void {
  G.grid_num = 0;
  G.grid_inc++;
  for (let mapx = 0; mapx < C.WORLD_SIDE_LEN; mapx++) {
    for (let mapy = 0; mapy < C.WORLD_SIDE_LEN; mapy++) {
      if (XY_IS_GRID(mapx, mapy)) {
        if (MI[IX(mapx, mapy) + I7] !== G.grid_inc) {
          if (G.grid_num === MAX_GRIDS) {
            console.log('You have too many power grids.  Join some of them');
            return;
          }
          // lcalloc() is malloc(): avail_power and powered are not set here and start as whatever the
          // memory held (re/lincity/NOTES.md, "Uninitialised memory"); here, and in the oracle, zero
          grid[++G.grid_num] = { total_power: 0, power_lines: 0, demand: 0, max_power: 0, avail_power: 0, powered: 0 };
          recurse_power_grid(mapx, mapy, 0);
        }
      }
    }
  }
}

function check_grid(x: number, y: number, xi: number, yi: number): number {
  if (XY_IS_GRID(x, y) && !IS_OLD_WINDMILL(x, y)) {
    if (GRID_CURRENT(x, y)) {
      if (MI[IX(x, y) + I6] !== G.grid_num) console.log(`recurse_power_grid insane: ${x}, ${y} on a different grid!`);
    } else if (!IS_POWER_LINE(x, y)) {
      if (IS_POWER_SOURCE(x, y)) {
        project_power(x, y);
        grid[G.grid_num]!.total_power += MI[IX(x, y) + I1];
      }
      MI[IX(x, y) + I6] = G.grid_num;
      MI[IX(x, y) + I7] = G.grid_inc;
    } else return 1;
  } else if (XY_IS_TRANSPORT(x, y) || XY_IS_WATER(x, y)) {
    if (xi === 0 && yi === 0) return 0;
    if (x + xi >= 1 && x + xi < C.WORLD_SIDE_LEN && y + yi >= 1 && y + yi < C.WORLD_SIDE_LEN) {
      return check_grid(x + xi, y + yi, 0, 0) ? 2 : 0;
    }
    return 0;
  }
  return 0;
}

function recurse_power_grid(startx: number, starty: number, steps: number): void {
  let count = steps;
  let dir = -1;
  let mapx = startx, mapy = starty;
  let inc: number;
  if (count % POWER_MODULUS === 0) count = 0;
  if (IS_OLD_WINDMILL(mapx, mapy)) {
    MI[IX(mapx, mapy) + I6] = G.grid_num;
    MI[IX(mapx, mapy) + I7] = G.grid_inc;
    grid[G.grid_num]!.max_power += MI[IX(mapx, mapy) + I1];
    return;
  }
  while (dir !== 0) {
    if (IS_POWER_LINE(mapx, mapy)) {
      grid[G.grid_num]!.power_lines++;
      MI[IX(mapx, mapy) + I5] = count++ % POWER_MODULUS;
      const t = MT[P(mapx, mapy)];
      if (t >= 1 && t <= 11) MT[P(mapx, mapy)] = t + 11;
    }
    MI[IX(mapx, mapy) + I6] = G.grid_num;
    MI[IX(mapx, mapy) + I7] = G.grid_inc;
    if (mapx >= 1) {
      if ((inc = check_grid(mapx - 1, mapy, -1, 0))) {
        if (dir < 1) dir = WEST;
        else recurse_power_grid(mapx - inc, mapy, count + 1);
      }
    }
    if (mapy >= 1) {
      if ((inc = check_grid(mapx, mapy - 1, 0, -1))) {
        if (dir < 1) dir = NORTH;
        else recurse_power_grid(mapx, mapy - inc, count + 1);
      }
    }
    if (mapx < C.WORLD_SIDE_LEN) {
      if ((inc = check_grid(mapx + 1, mapy, 1, 0))) {
        if (dir < 1) dir = EAST;
        else recurse_power_grid(mapx + inc, mapy, count + 1);
      }
    }
    if (mapy < C.WORLD_SIDE_LEN) {
      if ((inc = check_grid(mapx, mapy + 1, 0, 1))) {
        if (dir < 1) dir = SOUTH;
        else recurse_power_grid(mapx, mapy + inc, count + 1);
      }
    }
    switch (dir) {
      case -1: dir = 0; break;
      case WEST:
        if (mapx >= 1) {
          if ((inc = check_grid(mapx - 1, mapy, -1, 0))) { mapx -= inc; dir = -1; } else dir = 0;
        }
        break;
      case NORTH:
        if (mapy >= 1) {
          if ((inc = check_grid(mapx, mapy - 1, 0, -1))) { mapy -= inc; dir = -1; } else dir = 0;
        }
        break;
      case EAST:
        if (mapx < C.WORLD_SIDE_LEN) {
          if ((inc = check_grid(mapx + 1, mapy, 1, 0))) { mapx += inc; dir = -1; } else dir = 0;
        }
        break;
      case SOUTH:
        if (mapy < C.WORLD_SIDE_LEN) {
          if ((inc = check_grid(mapx, mapy + 1, 0, 1))) { mapy += inc; dir = -1; } else dir = 0;
        }
        break;
    }
  }
}

function project_power(mapx: number, mapy: number): void {
  const g = grid[G.grid_num]!;
  switch (MG[P(mapx, mapy)]) {
    case C.GROUP_COAL_POWER: g.max_power += MI[IX(mapx, mapy) + I1]; break;
    case C.GROUP_SOLAR_POWER: g.max_power += MI[IX(mapx, mapy) + I3]; break;
    case C.GROUP_WINDMILL: g.max_power += MI[IX(mapx, mapy) + I1]; break;
    default: console.log(`default case in project_power\tMP_GROUP = ${MG[P(mapx, mapy)]}`); break;
  }
}

export function get_power(x: number, y: number, power: number, block_industry: number): number {
  if (G.numof_substations === 0) return 0;
  for (let i = 0; i < G.numof_substations; i++) {
    const xi = substationx[i];
    const yi = substationy[i];
    if (abs(xi - x) < C.SUBSTATION_RANGE && abs(yi - y) < C.SUBSTATION_RANGE) {
      if (block_industry !== 0 && MG[P(xi, yi)] === C.GROUP_WINDMILL) continue;
      const g = grid[MI[IX(xi, yi) + I6]]!;
      g.demand += power;
      if (g.total_power >= power) {
        g.total_power -= power;
        MI[IX(xi, yi) + I5] += power;
        return 1;
      }
    }
  }
  return 0;
}
