// engine.c: placing and bulldozing, the import/export of ports, pollution, fires, rivers.
import * as C from './consts.ts';
import { G, mappoint_array_x, mappoint_array_y } from './g.ts';
import { MT, MG, MI, MPOL, P, IX, POP, FLAGS, I1, I2, I3, I4, I5, I6, I7, oreReserve, setOreReserve } from './map.ts';
import { rand, toInt, idiv } from './c.ts';
import { main_groups, get_group_of_type } from './lintypes.ts';
import { set_mappoint } from './shrtypes.ts';
import { connect_transport } from './shrtypes.ts';
import { map_power_grid } from './power.ts';
import { add_a_market, remove_a_market } from './market.ts';
import { add_a_substation, remove_a_substation } from './modules.ts';
import { clear_mappoint } from './simulate.ts';
import { print_total_money, ok_dial_box } from './screen.ts';
import { mps_update } from './mps.ts';
import { update_pbar, refresh_pbars, refresh_population_text } from './pbar.ts';
import { dialog_box } from './dialbox.ts';
import { fire_area } from './mouse.ts';
import * as M from './modules.ts';

export function adjust_money(value: number): number {
  G.total_money = (G.total_money + value) | 0;
  print_total_money();
  mps_update();
  update_pbar(C.PMONEY, G.total_money, 0);
  refresh_pbars();
  return G.total_money;
}

export function no_credit_build(selected_group: number): number {
  if (G.total_money >= 0) return 0;
  if (selected_group === C.GROUP_UNIVERSITY) return 1;
  if (selected_group === C.GROUP_PARKLAND) return 1;
  if (selected_group === C.GROUP_RECYCLE) return 1;
  if (selected_group === C.GROUP_ROCKET) return 1;
  if (main_groups[selected_group].no_credit === C.TRUE) return 1;
  return 0;
}

export function place_item(x: number, y: number, type: number): number {
  const group = get_group_of_type(type);
  if (group < 0) return -1;
  const size = main_groups[group].size;
  if (no_credit_build(group) !== 0) return -1;
  switch (group) {
    case C.GROUP_SUBSTATION:
    case C.GROUP_WINDMILL:
      if (add_a_substation(x, y) === 0) return -3;
      break;
    case C.GROUP_PORT:
      if (is_real_river(x + 4, y) !== 1 || is_real_river(x + 4, y + 1) !== 1
        || is_real_river(x + 4, y + 2) !== 1 || is_real_river(x + 4, y + 3) !== 1) return -2;
      break;
    case C.GROUP_COMMUNE:
      G.numof_communes++;
      break;
    case C.GROUP_MARKET:
      if (add_a_market(x, y) === 0) return -3;
      MI[IX(x, y) + FLAGS] += (C.FLAG_MB_FOOD | C.FLAG_MB_JOBS | C.FLAG_MB_COAL | C.FLAG_MB_ORE | C.FLAG_MB_STEEL
        | C.FLAG_MB_GOODS | C.FLAG_MS_FOOD | C.FLAG_MS_JOBS | C.FLAG_MS_COAL | C.FLAG_MS_GOODS | C.FLAG_MS_ORE
        | C.FLAG_MS_STEEL);
      break;
    case C.GROUP_TIP: {
      let prev_tip = 0;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (oreReserve(x + i, y + j) > C.ORE_RESERVE) {
            prev_tip = 1;
            break;
          }
        }
      }
      if (prev_tip) {
        dialog_box(C.red(12), 3, 0, 0, "You can't build a tip here", 0, 0, 'This area was once a landfill', 2, 32, 'OK');
        return -4;
      }
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) setOreReserve(x + i, y + j, C.ORE_RESERVE * 2);
      break;
    }
    case C.GROUP_OREMINE: {
      let prev_tip = 0;
      let total_ore = 0;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          total_ore += oreReserve(x + i, y + j);
          if (oreReserve(x + i, y + j) > C.ORE_RESERVE) {
            prev_tip = 1;
            break;
          }
        }
      }
      if (prev_tip) {
        dialog_box(C.red(12), 3, 0, 0, "You can't build a mine here", 0, 0, 'This area was once a landfill', 2, 32, 'OK');
        return -4;
      }
      if (total_ore < C.MIN_ORE_RESERVE_FOR_MINE) {
        dialog_box(C.red(12), 3, 0, 0, "You can't build a mine here", 0, 0, 'There is no ore left at this site', 2, 32, 'OK');
        return -4;
      }
      break;
    }
  }
  G.last_built_x = x;
  G.last_built_y = y;
  if (group === C.GROUP_WINDMILL) {
    type = G.tech_level > C.MODERN_WINDMILL_TECH ? C.CST_WINDMILL_1_R : C.CST_WINDMILL_1_W;
  }
  const b = IX(x, y);
  if (group === C.GROUP_SOLAR_POWER || group === C.GROUP_WINDMILL) {
    MI[b + I2] = G.tech_level;
    G.let_one_through = 1;
  } else if (group === C.GROUP_RECYCLE || group === C.GROUP_COAL_POWER) MI[b + I4] = G.tech_level;
  else if (group === C.GROUP_ORGANIC_FARM) MI[b + I1] = G.tech_level;
  else if (group === C.GROUP_TRACK || group === C.GROUP_ROAD || group === C.GROUP_RAIL) MI[b + FLAGS] |= C.FLAG_IS_TRANSPORT;
  else if (group === C.GROUP_COALMINE || group === C.GROUP_OREMINE) G.let_one_through = 1;
  set_mappoint(x, y, type);
  update_tech_dep(x, y);
  if (group === C.GROUP_RIVER) connect_rivers();
  connect_transport(x - 2, y - 2, x + size + 1, y + size + 1);
  adjust_money(-G.selected_module_cost);
  map_power_grid();
  return 0;
}

export function bulldoze_item(x: number, y: number): number {
  if (MT[P(x, y)] === C.CST_USED) return -1;
  const size = main_groups[MG[P(x, y)]].size;
  const g = MG[P(x, y)];
  if (g === C.GROUP_BARE) return -1;
  else if (g === C.GROUP_SHANTY) {
    fire_area(x, y);
    adjust_money(-C.GROUP_SHANTY_BUL_COST);
  } else if (g === C.GROUP_FIRE) {
    if (MI[IX(x, y) + I2] >= C.FIRE_LENGTH) return -1;
    MI[IX(x, y) + I2] = C.FIRE_LENGTH + 1;
    MT[P(x, y)] = C.CST_FIRE_DONE1;
    MG[P(x, y)] = C.GROUP_BURNT;
    adjust_money(-C.GROUP_BURNT_BUL_COST);
  } else {
    adjust_money(-main_groups[g].bul_cost);
    do_bulldoze_area(C.CST_GREEN, x, y);
    if (g === C.GROUP_OREMINE) {
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          if (oreReserve(x + i, y + j) < C.ORE_RESERVE / 2) do_bulldoze_area(C.CST_WATER, x + i, y + j);
        }
      }
    }
  }
  return size;
}

export function init_mappoint_array(): void {
  for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
    mappoint_array_x[x] = x;
    mappoint_array_y[x] = x;
  }
}

export function shuffle_mappoint_array(): void {
  for (let i = 0; i < C.SHUFFLE_MAPPOINT_COUNT; i++) {
    let x = rand() % C.WORLD_SIDE_LEN;
    let a = mappoint_array_x[i];
    mappoint_array_x[i] = mappoint_array_x[x];
    mappoint_array_x[x] = a;
    x = rand() % C.WORLD_SIDE_LEN;
    a = mappoint_array_y[i];
    mappoint_array_y[i] = mappoint_array_y[x];
    mappoint_array_y[x] = a;
  }
}

/** buy_food .. buy_steel: fill the transport square half way to its maximum */
function buy(field: number, maxTrack: number, maxRoad: number, maxRail: number, rate: number, xt: number, yt: number): number {
  let i = 0;
  const b = IX(xt, yt);
  const g = MG[P(xt, yt)];
  if (g === C.GROUP_TRACK) { if (MI[b + field] < maxTrack) i = maxTrack - MI[b + field]; }
  else if (g === C.GROUP_ROAD) { if (MI[b + field] < maxRoad) i = maxRoad - MI[b + field]; }
  else if (g === C.GROUP_RAIL) { if (MI[b + field] < maxRail) i = maxRail - MI[b + field]; }
  i = idiv(Math.imul(i, C.PORT_IMPORT_RATE), 1000);
  MI[b + field] += i;
  return Math.imul(i, rate);
}
export const buy_food = (x: number, y: number): number => buy(I1, C.MAX_FOOD_ON_TRACK, C.MAX_FOOD_ON_ROAD, C.MAX_FOOD_ON_RAIL, C.PORT_FOOD_RATE, x, y);
export const buy_coal = (x: number, y: number): number => buy(I3, C.MAX_COAL_ON_TRACK, C.MAX_COAL_ON_ROAD, C.MAX_COAL_ON_RAIL, C.PORT_COAL_RATE, x, y);
export const buy_ore = (x: number, y: number): number => buy(I5, C.MAX_ORE_ON_TRACK, C.MAX_ORE_ON_ROAD, C.MAX_ORE_ON_RAIL, C.PORT_ORE_RATE, x, y);
export const buy_goods = (x: number, y: number): number => buy(I4, C.MAX_GOODS_ON_TRACK, C.MAX_GOODS_ON_ROAD, C.MAX_GOODS_ON_RAIL, C.PORT_GOODS_RATE, x, y);
export const buy_steel = (x: number, y: number): number => buy(I6, C.MAX_STEEL_ON_TRACK, C.MAX_STEEL_ON_ROAD, C.MAX_STEEL_ON_RAIL, C.PORT_STEEL_RATE, x, y);

function sell(field: number, rate: number, xt: number, yt: number): number {
  const b = IX(xt, yt);
  const i = idiv(Math.imul(MI[b + field], C.PORT_EXPORT_RATE), 1000);
  MI[b + field] -= i;
  return Math.imul(i, rate);
}
export const sell_food = (x: number, y: number): number => sell(I1, C.PORT_FOOD_RATE, x, y);
export const sell_coal = (x: number, y: number): number => sell(I3, C.PORT_COAL_RATE, x, y);
export const sell_ore = (x: number, y: number): number => sell(I5, C.PORT_ORE_RATE, x, y);
export const sell_goods = (x: number, y: number): number => sell(I4, C.PORT_GOODS_RATE, x, y);
export const sell_steel = (x: number, y: number): number => sell(I6, C.PORT_STEEL_RATE, x, y);

export function do_pollution(): void {
  const W = C.WORLD_SIDE_LEN;
  let pol = 0;
  // kill pollution from the top edge of the map (map.pollution[0][*])
  do {
    if (MPOL[pol] > 0) MPOL[pol] = idiv(MPOL[pol], C.POL_DIV);
  } while (++pol < W);
  let x = 1;
  do {
    // kill some pollution from the left edge
    if (MPOL[pol++] > 0) MPOL[pol - 1] = idiv(MPOL[pol - 1], C.POL_DIV);
    do {
      if (MPOL[pol] > 10) {
        const p = (MPOL[pol] / 16) | 0;
        MPOL[pol] -= p;
        switch (rand() % 11) {
          case 0: case 1: case 2: MPOL[pol - 1] += p; break;
          case 3: case 4: case 5: MPOL[pol + W] += p; break;
          case 6: case 7: MPOL[pol + 1] += p; break;
          case 8: case 9: MPOL[pol - W] += p; break;
          case 10: MPOL[pol] += p - 2; break;
        }
      }
    } while (++pol < x * W + (W - 1));
    // kill some pollution from the right edge
    if (MPOL[pol] > 0) MPOL[pol] = idiv(MPOL[pol], C.POL_DIV);
    ++x;
  } while (++pol < (W - 1) * W);
  // kill pollution from the bottom edge
  do {
    if (MPOL[pol] > 0) MPOL[pol] = idiv(MPOL[pol], C.POL_DIV);
  } while (++pol < W * W);
}

export function remove_people(num: number): void {
  G.housed_population = 1;
  while (G.housed_population && num > 0) {
    G.housed_population = 0;
    for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
      for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
        if (C.GROUP_IS_RESIDENCE(MG[P(x, y)]) && MI[IX(x, y) + POP] > 0) {
          MI[IX(x, y) + POP]--;
          G.housed_population += MI[IX(x, y) + POP];
          num--;
          G.total_evacuated++;
        }
      }
    }
  }
  while (num > 0 && G.people_pool > 0) {
    num--;
    G.total_evacuated++;
    G.people_pool--;
  }
  refresh_population_text();
  if (!G.housed_population && !G.people_pool) ok_dial_box('launch-gone.mes', C.GOOD, null);
}

export function clear_fire_health_and_cricket_cover(): void {
  const m = ~(C.FLAG_FIRE_COVER | C.FLAG_HEALTH_COVER | C.FLAG_CRICKET_COVER);
  for (let i = 0; i < 10000; i++) MI[i * 10 + FLAGS] &= m;
}

export function do_fire_health_and_cricket_cover(): void {
  for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
    for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
      if (MG[P(x, y)] === C.GROUP_FIRESTATION) M.do_fire_cover(x, y);
      else if (MT[P(x, y)] === C.CST_HEALTH) M.do_health_cover(x, y);
      else if (MG[P(x, y)] === C.GROUP_CRICKET) M.do_cricket_cover(x, y);
    }
  }
}

const FIRE_PLACES: [number, string][] = [
  [C.GROUP_POWER_LINE, "It's at a power line."],
  [C.GROUP_SOLAR_POWER, "It's at a solar power station."],
  [C.GROUP_SUBSTATION, "It's at a substation."],
  [-1, "It's at a residential area."],
  [C.GROUP_ORGANIC_FARM, "It's at a farm."],
  [C.GROUP_MARKET, "It's at a market."],
  [C.GROUP_TRACK, "It's at a track."],
  [C.GROUP_COALMINE, "It's at a coal mine."],
  [C.GROUP_RAIL, "It's at a railway."],
  [C.GROUP_COAL_POWER, "It's at a coal power station."],
  [C.GROUP_ROAD, "It's at a road."],
  [C.GROUP_INDUSTRY_L, "It's at light industry."],
  [C.GROUP_UNIVERSITY, "It's at a university."],
  [C.GROUP_COMMUNE, "It's at a commune."],
  [C.GROUP_TIP, "It's at a tip."],
  [C.GROUP_PORT, "It's at a port."],
  [C.GROUP_INDUSTRY_H, "It's at a steel works."],
  [C.GROUP_RECYCLE, "It's at a recycle centre."],
  [C.GROUP_HEALTH, "It's at a health centre."],
  [C.GROUP_ROCKET, "It's at a rocket site."],
  [C.GROUP_WINDMILL, "It's at a windmill."],
  [C.GROUP_SCHOOL, "It's at a school."],
  [C.GROUP_BLACKSMITH, "It's at a blacksmith."],
  [C.GROUP_MILL, "It's at a mill."],
  [C.GROUP_POTTERY, "It's at a pottery."],
  [C.GROUP_FIRESTATION, "It's at a fire station!!!."],
  [C.GROUP_CRICKET, "It's at a cricket pitch!!!."],
  [C.GROUP_SHANTY, "It's at a shanty town."],
];

export function do_random_fire(x: number, y: number, pwarning: number): void {
  if (x === -1 && y === -1) {
    x = rand() % C.WORLD_SIDE_LEN;
    y = rand() % C.WORLD_SIDE_LEN;
  } else if (x < 0 || x >= C.WORLD_SIDE_LEN || y < 0 || y >= C.WORLD_SIDE_LEN) return;
  if (MT[P(x, y)] === C.CST_USED) {
    const xx = MI[IX(x, y) + I1];
    const yy = MI[IX(x, y) + I2];
    x = xx;
    y = yy;
  }
  const r = rand() % 100;
  if (r >= main_groups[MG[P(x, y)]].fire_chance) return;
  if ((MI[IX(x, y) + FLAGS] & C.FLAG_FIRE_COVER) !== 0) return;
  if (pwarning) {
    const g = MG[P(x, y)];
    const hit = FIRE_PLACES.find(([grp]) => (grp === -1 ? C.GROUP_IS_RESIDENCE(g) : grp === g));
    ok_dial_box('fire.mes', C.BAD, hit ? hit[1] : 'UNKNOWN!');
  }
  fire_area(x, y);
}

/** spiral round from startx,starty until we hit something of group group: x + y * 100, or -1 */
export function spiral_find_group(startx: number, starty: number, group: number): number {
  let x = startx, y = starty;
  const W = C.WORLD_SIDE_LEN;
  const hit = (): boolean => x > 0 && x < W && y > 0 && y < W && MG[P(x, y)] === group;
  for (let i = 1; i < W + W; i++) {
    for (let j = 0; j < i; j++) { x--; if (hit()) return x + y * W; }
    for (let j = 0; j < i; j++) { y--; if (hit()) return x + y * W; }
    i++;
    for (let j = 0; j < i; j++) { x++; if (hit()) return x + y * W; }
    for (let j = 0; j < i; j++) { y++; if (hit()) return x + y * W; }
  }
  return -1;
}

/** spiral round from startx,starty until we hit a 2x2 space of green */
export function spiral_find_2x2(startx: number, starty: number): number {
  let x = startx, y = starty;
  const W = C.WORLD_SIDE_LEN;
  const hit = (): boolean => x > 1 && x < W - 2 && y > 1 && y < W - 2
    && MT[P(x, y)] === C.CST_GREEN && MT[P(x + 1, y)] === C.CST_GREEN
    && MT[P(x, y + 1)] === C.CST_GREEN && MT[P(x + 1, y + 1)] === C.CST_GREEN;
  for (let i = 1; i < W + W; i++) {
    for (let j = 0; j < i; j++) { x--; if (hit()) return x + y * W; }
    for (let j = 0; j < i; j++) { y--; if (hit()) return x + y * W; }
    i++;
    for (let j = 0; j < i; j++) { x++; if (hit()) return x + y * W; }
    for (let j = 0; j < i; j++) { y++; if (hit()) return x + y * W; }
  }
  return -1;
}

export function do_bulldoze_area(fill: number, xx: number, yy: number): void {
  let x: number, y: number;
  if (MT[P(xx, yy)] === C.CST_USED) {
    x = MI[IX(xx, yy) + I1];
    y = MI[IX(xx, yy) + I2];
  } else {
    x = xx;
    y = yy;
  }
  const size = main_groups[MG[P(x, y)]].size;
  const g = MG[P(x, y)];
  if (g === C.GROUP_SUBSTATION || g === C.GROUP_WINDMILL) remove_a_substation(x, y);
  else if (g === C.GROUP_MARKET) remove_a_market(x, y);
  else if (g === C.GROUP_SHANTY) G.numof_shanties--;
  else if (g === C.GROUP_COMMUNE) G.numof_communes--;
  G.people_pool = (G.people_pool + MI[IX(x, y) + POP]) | 0;
  clear_mappoint(fill, x, y);
  if (size > 1) {
    clear_mappoint(fill, x + 1, y);
    clear_mappoint(fill, x, y + 1);
    clear_mappoint(fill, x + 1, y + 1);
  }
  if (size > 2) {
    clear_mappoint(fill, x + 2, y);
    clear_mappoint(fill, x + 2, y + 1);
    clear_mappoint(fill, x + 2, y + 2);
    clear_mappoint(fill, x, y + 2);
    clear_mappoint(fill, x + 1, y + 2);
  }
  if (size > 3) {
    clear_mappoint(fill, x + 3, y);
    clear_mappoint(fill, x + 3, y + 1);
    clear_mappoint(fill, x + 3, y + 2);
    clear_mappoint(fill, x + 3, y + 3);
    clear_mappoint(fill, x, y + 3);
    clear_mappoint(fill, x + 1, y + 3);
    clear_mappoint(fill, x + 2, y + 3);
  }
}

export function update_tech_dep(x: number, y: number): void {
  const b = IX(x, y);
  switch (MG[P(x, y)]) {
    case C.GROUP_ORGANIC_FARM:
      MI[b + I7] = toInt((MI[b + I1] * C.ORGANIC_FARM_FOOD_OUTPUT) / C.MAX_TECH_LEVEL);
      break;
    case C.GROUP_WINDMILL:
      MI[b + I1] = toInt(C.WINDMILL_POWER + ((MI[b + I2] * C.WINDMILL_POWER) / C.MAX_TECH_LEVEL));
      break;
    case C.GROUP_COAL_POWER:
      MI[b + I1] = toInt(C.POWERS_COAL_OUTPUT + ((MI[b + I4] * C.POWERS_COAL_OUTPUT) / C.MAX_TECH_LEVEL));
      break;
    case C.GROUP_SOLAR_POWER:
      MI[b + I3] = toInt(C.POWERS_SOLAR_OUTPUT + ((MI[b + I2] * C.POWERS_SOLAR_OUTPUT) / C.MAX_TECH_LEVEL));
      break;
  }
}

export function connect_rivers(): void {
  let count = 1;
  while (count > 0) {
    count = 0;
    for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
      for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
        if (is_real_river(x, y) === 1) {
          if (is_real_river(x - 1, y) === -1) { MI[IX(x - 1, y) + FLAGS] |= C.FLAG_IS_RIVER; count++; }
          if (is_real_river(x, y - 1) === -1) { MI[IX(x, y - 1) + FLAGS] |= C.FLAG_IS_RIVER; count++; }
          if (is_real_river(x + 1, y) === -1) { MI[IX(x + 1, y) + FLAGS] |= C.FLAG_IS_RIVER; count++; }
          if (is_real_river(x, y + 1) === -1) { MI[IX(x, y + 1) + FLAGS] |= C.FLAG_IS_RIVER; count++; }
        }
      }
    }
  }
}

export function is_real_river(x: number, y: number): number {
  if (x < 0 || x >= C.WORLD_SIDE_LEN || y < 0 || y >= C.WORLD_SIDE_LEN) return 0;
  if (MG[P(x, y)] !== C.GROUP_WATER) return 0;
  if (MI[IX(x, y) + FLAGS] & C.FLAG_IS_RIVER) return 1;
  return -1;
}

export function do_coal_survey(): void {
  if (G.coal_survey_done === 0) {
    adjust_money(-1000000);
    G.coal_survey_done = 1;
  }
}
