// modules/*.c: what every kind of building does each day (do_*) and shows in the mps panel (mps_*).
import * as C from './consts.ts';
import { G, substationx, substationy } from './g.ts';
import { MT, MG, MI, MPOL, P, IX, POP, FLAGS, I1, I2, I3, I4, I5, I6, I7, coalReserve, setCoalReserve,
  oreReserve, setOreReserve } from './map.ts';
import { rand, idiv, f32, snprintf } from './c.ts';
import { general_transport } from './transport.ts';
import { get_jobs, put_jobs, get_food, put_food, get_goods, put_goods, get_waste, get_steel,
  put_steel, get_ore, put_ore, get_coal, put_coal } from './market.ts';
import { get_power, grid } from './power.ts';
import { do_bulldoze_area, do_random_fire, spiral_find_group, spiral_find_2x2, remove_people, connect_rivers, buy_food, buy_coal,
  buy_ore, buy_goods, buy_steel, sell_food, sell_coal, sell_ore, sell_goods, sell_steel } from './engine.ts';
import { set_mappoint } from './shrtypes.ts';
import { mps_store_title, mps_store_sd, mps_store_ss, mps_store_sfp, mps_snprintf, mps_store_sss, mps_store_f,
  mps_store_fp } from './mps.ts';
import { format_power, num_to_ansi } from './lclib.ts';
import { ask_launch_rocket_now, display_rocket_result_dialog, update_main_screen, refresh_main_screen } from './screen.ts';
import { fire_area } from './mouse.ts';

const b_ = IX;
const pol = P;

/* ---- track.c, road.c, rail.c ---- */
const wbTrack = { count: 0 }, wbRoad = { count: 0 }, wbRail = { count: 0 };

export function do_track(x: number, y: number): void {
  general_transport(b_(x, y), pol(x, y), C.MAX_WASTE_ON_TRACK, wbTrack);
}

export function do_road(x: number, y: number): void {
  const m = b_(x, y);
  ++G.transport_cost;
  if (G.total_time % C.DAYS_PER_ROAD_POLLUTION === 0) MPOL[pol(x, y)] += C.ROAD_POLLUTION;
  if ((G.total_time & C.ROAD_GOODS_USED_MASK) === 0 && MI[m + I4] > 0) {
    --MI[m + I4];
    ++MI[m + I7];
  }
  general_transport(m, pol(x, y), C.MAX_WASTE_ON_ROAD, wbRoad);
}

export function do_rail(x: number, y: number): void {
  const m = b_(x, y);
  G.transport_cost += 3;
  if (G.total_time % C.DAYS_PER_RAIL_POLLUTION === 0) MPOL[pol(x, y)] += C.RAIL_POLLUTION;
  if ((G.total_time & C.RAIL_GOODS_USED_MASK) === 0 && MI[m + I4] > 0) {
    --MI[m + I4];
    ++MI[m + I7];
  }
  if ((G.total_time & C.RAIL_STEEL_USED_MASK) === 0 && MI[m + I6] > 0) {
    --MI[m + I6];
    ++MI[m + I7];
  }
  general_transport(m, pol(x, y), C.MAX_WASTE_ON_RAIL, wbRail);
}

function mpsWay(title: string, x: number, y: number, max: number[]): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, title);
  i++;
  const names = ['Food', 'Jobs', 'Coal', 'Goods', 'Ore', 'Steel', 'Waste'];
  for (let k = 0; k < 7; k++) mps_store_sfp(i++, names[k], MI[m + I1 + k] * 100.0 / max[k]);
}
export const mps_track = (x: number, y: number): void => mpsWay('Track', x, y, [C.MAX_FOOD_ON_TRACK, C.MAX_JOBS_ON_TRACK,
  C.MAX_COAL_ON_TRACK, C.MAX_GOODS_ON_TRACK, C.MAX_ORE_ON_TRACK, C.MAX_STEEL_ON_TRACK, C.MAX_WASTE_ON_TRACK]);
export const mps_road = (x: number, y: number): void => mpsWay('Road', x, y, [C.MAX_FOOD_ON_ROAD, C.MAX_JOBS_ON_ROAD,
  C.MAX_COAL_ON_ROAD, C.MAX_GOODS_ON_ROAD, C.MAX_ORE_ON_ROAD, C.MAX_STEEL_ON_ROAD, C.MAX_WASTE_ON_ROAD]);
export const mps_rail = (x: number, y: number): void => mpsWay('Rail', x, y, [C.MAX_FOOD_ON_RAIL, C.MAX_JOBS_ON_RAIL,
  C.MAX_COAL_ON_RAIL, C.MAX_GOODS_ON_RAIL, C.MAX_ORE_ON_RAIL, C.MAX_STEEL_ON_RAIL, C.MAX_WASTE_ON_RAIL]);

/* ---- power_line.c ---- */
const POWER_MODULUS = 25;
export function do_power_line(x: number, y: number): void {
  const m = b_(x, y);
  if (grid[MI[m + I6]]!.powered === -1) return;
  const t = MT[pol(x, y)];
  switch (MI[m + I5]) {
    case 0: MI[m + I5] = POWER_MODULUS; break;
    case 1:
      if (!(t <= 11 && t >= 1)) break;
      MT[pol(x, y)] = t + 11;
      break;
    case 2:
      if (!(t >= 11 && t <= 22)) break;
      MT[pol(x, y)] = t - 11;
      break;
  }
  MI[m + I5]--;
}
export function mps_power_line(x: number, y: number): void {
  let i = 0;
  mps_store_title(i++, 'Power Line');
  i++;
  mps_store_sd(i++, 'Grid ID', MI[b_(x, y) + I6]);
}

/* ---- water.c ---- */
export function mps_water(x: number, y: number): void {
  let i = 0;
  mps_store_title(i++, 'Water');
  i++;
  mps_store_ss(i++, 'Navigable', (MI[b_(x, y) + FLAGS] & C.FLAG_IS_RIVER) ? 'Yes' : 'No');
}

/* ---- substation.c ---- */
export function do_power_substation(x: number, y: number): void {
  switch (grid[MI[b_(x, y) + I6]]!.powered) {
    case -1: MT[pol(x, y)] = C.CST_SUBSTATION_R; break;
    case 0: MT[pol(x, y)] = C.CST_SUBSTATION_RG; break;
    case 1: MT[pol(x, y)] = C.CST_SUBSTATION_G; break;
    default: console.log('Default case in do_power_substation'); break;
  }
}
export function add_a_substation(x: number, y: number): number {
  if (G.numof_substations >= C.MAX_NUMOF_SUBSTATIONS) return 0;
  substationx[G.numof_substations] = x;
  substationy[G.numof_substations] = y;
  G.numof_substations++;
  return 1;
}
export function remove_a_substation(x: number, y: number): void {
  let q;
  for (q = 0; q < G.numof_substations; q++) if (substationx[q] === x && substationy[q] === y) break;
  for (; q < G.numof_substations; q++) {
    // substationx[q + 1] past the array's end reads the next array (substationy[0]) in C
    substationx[q] = q + 1 < C.MAX_NUMOF_SUBSTATIONS ? substationx[q + 1] : substationy[0];
    substationy[q] = q + 1 < C.MAX_NUMOF_SUBSTATIONS ? substationy[q + 1] : 0;
  }
  G.numof_substations--;
}
const power = (v: number): string => format_power(12, v);
export function mps_substation(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Substation');
  i++;
  const s = power(MI[m + I5]);
  mps_store_title(i++, 'Local Demand');
  mps_store_title(i++, s);
  i++;
  mps_store_title(i++, 'Grid Status');
  const g = grid[MI[m + I6]]!;
  mps_store_ss(i++, 'T. Cap.', power(g.max_power));
  mps_store_ss(i++, 'A. Cap.', power(g.avail_power));
  mps_store_ss(i++, 'Demand', power(g.demand));
  i++;
  mps_store_sd(i++, 'Grid ID', MI[m + I6]);
}

/* ---- solar_power.c ---- */
const SOLAR_POWER_JOBS = 50;
export function do_power_source(x: number, y: number): void {
  const m = b_(x, y);
  if (get_jobs(x, y, SOLAR_POWER_JOBS)) {
    MI[m + I5] = MI[m + I3];
    grid[MI[m + I6]]!.avail_power += MI[m + I3];
  } else MI[m + I5] = 0;
}
export function mps_solar_power(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Solar');
  mps_store_title(i++, 'Power Station');
  i++;
  mps_store_title(i++, 'Max Output');
  mps_store_title(i++, power(MI[m + I3]));
  i++;
  mps_store_title(i++, 'Current Output');
  mps_store_title(i++, power(MI[m + I5]));
  i++;
  mps_store_sfp(i++, 'Tech', MI[m + I2] * 100.0 / C.MAX_TECH_LEVEL);
  mps_store_sd(i++, 'Grid ID', MI[m + I6]);
}

/* ---- coal_power.c ---- */
const isTransport = (x: number, y: number): boolean => {
  const g = MG[pol(x, y)];
  return g === C.GROUP_TRACK || g === C.GROUP_ROAD || g === C.GROUP_RAIL || g === C.GROUP_POWER_LINE;
};
export function do_power_source_coal(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I2] < C.MAX_COAL_AT_POWER_STATION) {
    if (isTransport(x - 1, y + 1) && MI[b_(x - 1, y + 1) + I3] > 0) {
      if (get_jobs(x, y, C.JOBS_LOAD_COAL) !== 0) {
        const t = b_(x - 1, y + 1);
        MI[m + I2] += idiv(MI[t + I3], 2) + (MI[t + I3] % 2);
        MI[t + I3] = idiv(MI[t + I3], 2);
        MPOL[pol(x, y)]++;
      }
    } else if (isTransport(x + 1, y - 1) && MI[b_(x + 1, y - 1) + I3] > 0) {
      const t = b_(x + 1, y - 1);
      if (get_jobs(x, y, C.JOBS_LOAD_COAL) !== 0) MI[m + I2] += idiv(MI[t + I3], 2) + (MI[t + I3] % 2);
      MI[t + I3] = idiv(MI[t + I3], 2);
      MPOL[pol(x, y)]++;
    }
  }
  if (MI[m + I3] + C.JOBS_COALPS_GENERATE + 10 < C.MAX_JOBS_AT_COALPS) {
    if (get_jobs(x, y, C.JOBS_COALPS_GENERATE + 10) !== 0) MI[m + I3] += C.JOBS_COALPS_GENERATE + 10;
  }
  if (MI[m + I2] > idiv(C.POWERS_COAL_OUTPUT, 500) && MI[m + I3] > C.JOBS_COALPS_GENERATE) {
    MI[m + I5] = MI[m + I1];
    MI[m + I3] -= C.JOBS_COALPS_GENERATE;
    MI[m + I2] -= idiv(C.POWERS_COAL_OUTPUT, 500);
    G.coal_used += idiv(C.POWERS_COAL_OUTPUT, 500);
    MPOL[pol(x, y)] += C.POWERS_COAL_POLLUTION;
    grid[MI[m + I6]]!.avail_power += MI[m + I1];
  }
  if (MI[m + I2] > C.MAX_COAL_AT_POWER_STATION - idiv(C.MAX_COAL_AT_POWER_STATION, 5)) MT[pol(x, y)] = C.CST_POWERS_COAL_FULL;
  else if (MI[m + I2] > idiv(C.MAX_COAL_AT_POWER_STATION, 2)) MT[pol(x, y)] = C.CST_POWERS_COAL_MED;
  else if (MI[m + I2] > idiv(C.MAX_COAL_AT_POWER_STATION, 10)) MT[pol(x, y)] = C.CST_POWERS_COAL_LOW;
  else MT[pol(x, y)] = C.CST_POWERS_COAL_EMPTY;
}
export function mps_coal_power(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Coal');
  mps_store_title(i++, 'Power Station');
  i++;
  mps_store_title(i++, 'Max Output');
  mps_store_title(i++, power(MI[m + I1]));
  i++;
  mps_store_title(i++, 'Current Output');
  mps_store_title(i++, power(MI[m + I5]));
  i++;
  mps_store_sfp(i++, 'Coal', MI[m + I2] * 100.0 / C.MAX_COAL_AT_POWER_STATION);
  mps_store_sfp(i++, 'Jobs', MI[m + I3] * 100.0 / C.MAX_JOBS_AT_COALPS);
  mps_store_sfp(i++, 'Tech', MI[m + I4] * 100.0 / C.MAX_TECH_LEVEL);
  mps_store_sd(i++, 'Grid ID', MI[m + I6]);
}

/* ---- windmill.c ---- */
export function do_windmill(x: number, y: number): void {
  const m = b_(x, y);
  if (get_jobs(x, y, C.WINDMILL_JOBS) !== 0) {
    MI[m + I5] = MI[m + I1];
    grid[MI[m + I6]]!.avail_power += MI[m + I1];
  } else {
    MI[m + I4] = G.real_time + C.MODERN_WINDMILL_ANIM_SPEED;
    return;
  }
  if (G.real_time > MI[m + I4]) {
    MI[m + I3]++;
    MI[m + I4] = G.real_time + (MI[m + I2] < C.MODERN_WINDMILL_TECH ? C.ANTIQUE_WINDMILL_ANIM_SPEED : C.MODERN_WINDMILL_ANIM_SPEED);
  }
  const anim_tile = MI[m + I3] % 3;
  if (MI[m + I2] < C.MODERN_WINDMILL_TECH) MT[pol(x, y)] = C.CST_WINDMILL_1_W + anim_tile;
  else {
    switch (grid[MI[m + I6]]!.powered) {
      case -1: MT[pol(x, y)] = C.CST_WINDMILL_1_R + anim_tile; break;
      case 0: MT[pol(x, y)] = C.CST_WINDMILL_1_RG + anim_tile; break;
      case 1: MT[pol(x, y)] = C.CST_WINDMILL_1_G + anim_tile; break;
      default: console.log('Default case in do_power_substation'); break;
    }
  }
}
export function mps_windmill(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Windmill');
  i++;
  if (MI[m + I2] < C.MODERN_WINDMILL_TECH) {
    mps_store_sfp(i++, 'Tech', MI[m + I2] * 100.0 / C.MAX_TECH_LEVEL);
  } else {
    mps_store_title(i++, 'Local Status');
    mps_store_ss(i++, 'Prod.', power(MI[m + I1]));
    mps_store_ss(i++, 'Demand', power(MI[m + I5]));
    mps_store_sfp(i++, 'Tech', MI[m + I2] * 100.0 / C.MAX_TECH_LEVEL);
    i++;
    mps_store_title(i++, 'Grid Status');
    const g = grid[MI[m + I6]]!;
    mps_store_ss(i++, 'T. Cap.', power(g.max_power));
    mps_store_ss(i++, 'A. Cap.', power(g.avail_power));
    mps_store_ss(i++, 'Demand', power(g.demand));
    i++;
    mps_store_sd(i++, 'Grid ID', MI[m + I6]);
  }
}

/* ---- residence.c ---- */
export function do_residence(x: number, y: number): void {
  const m = b_(x, y);
  let p = MI[m + POP];
  let bad = 35, good = 30;
  let r: number, swing: number;
  let hc = 0;
  let brm = 0, drm = 0;
  let cc = 0;
  if ((MI[m + FLAGS] & C.FLAG_HEALTH_COVER) !== 0) {
    brm += C.RESIDENCE_BRM_HEALTH;
    good += 15;
    hc = 1;
  }
  if ((MI[m + FLAGS] & C.FLAG_FIRE_COVER) === 0) bad += 5;
  else good += 15;
  if ((MI[m + FLAGS] & C.FLAG_CRICKET_COVER) !== 0) {
    good += 20;
    cc = C.CRICKET_JOB_SWING;
  }
  const po = idiv(MPOL[pol(x, y)], 50) + 1;
  if (C.RESIDENCE_BASE_DR - MI[m + I5] - po > 1) r = rand() % (C.RESIDENCE_BASE_DR - MI[m + I5] - po);
  else r = 2;
  if (p > 0 && r < po) {
    if (r === 0 || hc === 0) p--;
    else if (hc !== 0 && po > 10 && rand() % 4 === 0) {
      p--;
      G.unnat_deaths++;
      G.total_pollution_deaths++;
      G.pollution_deaths_history = f32(G.pollution_deaths_history + 1.0);
      bad += 100;
    }
    if (r > 0 && hc === 0) {
      G.unnat_deaths++;
      G.total_pollution_deaths++;
      G.pollution_deaths_history = f32(G.pollution_deaths_history + 1.0);
      bad += 100;
    }
  }
  if ((MI[m + FLAGS] & (C.FLAG_FED + C.FLAG_EMPLOYED)) === C.FLAG_FED + C.FLAG_EMPLOYED
    && rand() % (C.RESIDENCE_BASE_BR + MI[m + I4]) === 1 && p > 0) {
    p++;
    G.total_births++;
    good += 50;
  }
  if ((MI[m + FLAGS] & C.FLAG_FED) === 0 && p > 0) {
    if (rand() % C.DAYS_PER_STARVE === 1) {
      p--;
      G.unnat_deaths++;
      G.total_starve_deaths++;
      G.starve_deaths_history = f32(G.starve_deaths_history + 1.0);
    }
    G.starving_population += p;
    bad += 250;
    drm += 100;
    MI[m + I2] = G.total_time;
  }
  const t = MT[pol(x, y)];
  if (t === C.CST_RESIDENCE_LL) {
    brm += C.RESIDENCE1_BRM;
    drm += p * 8;
    if (p > 50) { p--; G.people_pool++; brm += 20; }
  } else if (t === C.CST_RESIDENCE_ML) {
    brm += C.RESIDENCE2_BRM;
    drm += p * 3;
    if (p > 100) { p--; G.people_pool++; brm += 10; }
  } else if (t === C.CST_RESIDENCE_HL) {
    brm += C.RESIDENCE3_BRM;
    drm += p;
    good += 40;
    if (p > 200) { p--; G.people_pool++; brm += 10; }
  } else if (t === C.CST_RESIDENCE_LH) {
    brm += C.RESIDENCE4_BRM;
    drm += p * 5;
    if (p > 100) { p--; G.people_pool++; brm += 20; }
  } else if (t === C.CST_RESIDENCE_MH) {
    brm += C.RESIDENCE5_BRM;
    drm += idiv(p, 2);
    if (p > 200) { p--; G.people_pool++; brm += 10; }
  } else if (t === C.CST_RESIDENCE_HH) {
    good += 100;
    brm += C.RESIDENCE6_BRM;
    drm += p;
    if (p > 400) { p--; G.people_pool++; brm += 10; }
  }
  G.population += p;
  if (get_power(x, y, C.POWER_RES_OVERHEAD + C.POWER_USE_PER_PERSON * p, 0) !== 0) {
    MI[m + FLAGS] |= C.FLAG_POWERED;
    MI[m + FLAGS] |= C.FLAG_HAD_POWER;
    good += 10;
  } else {
    MI[m + FLAGS] &= ~C.FLAG_POWERED;
    bad += 15;
    if ((MI[m + FLAGS] & C.FLAG_HAD_POWER) !== 0) bad += 50;
  }
  if (get_food(x, y, p) !== 0) {
    MI[m + FLAGS] |= C.FLAG_FED;
    good += 10;
  } else MI[m + FLAGS] &= ~C.FLAG_FED;
  if (MI[m + I1] > 0) swing = C.JOB_SWING + hc * C.HC_JOB_SWING + cc;
  else swing = -(C.JOB_SWING + hc * C.HC_JOB_SWING + cc);
  if (put_jobs(x, y, idiv(p * (C.WORKING_POP_PERCENT + swing), 100)) !== 0) {
    MI[m + FLAGS] |= C.FLAG_EMPLOYED;
    MI[m + I1]++;
    if (MI[m + I1] > 10) MI[m + I1] = 10;
    good += 20;
    if (get_goods(x, y, idiv(p, 4)) !== 0) {
      good += 10;
      if (get_power(x, y, idiv(p, 2), 0) !== 0) {
        good += 5;
        brm += 10;
        if (get_goods(x, y, idiv(p, 4)) !== 0) good += 5;
      } else bad += 5;
    }
  } else if (MI[m + I1] < 10) {
    MI[m + FLAGS] &= ~C.FLAG_EMPLOYED;
    MI[m + I1] -= 11;
    if (MI[m + I1] < -300) MI[m + I1] = -300;
    G.unemployed_population += p;
    G.total_unemployed_days += p;
    if (G.total_unemployed_days >= C.NUMOF_DAYS_IN_YEAR) {
      G.total_unemployed_years++;
      G.total_unemployed_days -= C.NUMOF_DAYS_IN_YEAR;
      G.unemployed_history = f32(G.unemployed_history + 1.0);
    }
    G.unemployment_cost += p;
    bad += 70;
  } else {
    MI[m + I1] -= 20;
    bad += 50;
  }
  drm += idiv(p, 4);
  bad += idiv(p, 2);
  bad += idiv(MPOL[pol(x, y)], 20);
  good += idiv(G.people_pool, 27);
  r = rand() % ((good + bad) * C.RESIDENCE_PPM);
  if (r < bad) {
    if (p > C.MIN_RES_POPULATION) {
      p--;
      G.people_pool++;
    }
  } else if (G.people_pool > 0 && r > (good + bad) * (C.RESIDENCE_PPM - 1) + bad) {
    p++;
    G.people_pool--;
  }
  MI[m + POP] = p;
  MI[m + I4] = brm;
  MI[m + I5] = drm;
}
export function mps_residence(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  const f = MI[m + FLAGS];
  mps_store_title(i++, 'Residence');
  i++;
  mps_store_sd(i++, 'People', MI[m + POP]);
  mps_store_ss(i++, 'Power', (f & C.FLAG_POWERED) !== 0 ? 'YES' : 'NO');
  mps_store_ss(i++, 'Fed', (f & C.FLAG_FED) !== 0 ? 'YES' : 'NO');
  mps_store_ss(i++, 'Employed', (f & C.FLAG_EMPLOYED) !== 0 ? 'YES' : 'NO');
  mps_store_ss(i++, 'Health Cvr', (f & C.FLAG_HEALTH_COVER) !== 0 ? 'YES' : 'NO');
  mps_store_ss(i++, 'Fire', (f & C.FLAG_FIRE_COVER) !== 0 ? 'YES' : 'NO');
  mps_store_ss(i++, 'Cricket', (f & C.FLAG_CRICKET_COVER) !== 0 ? 'YES' : 'NO');
  mps_store_sd(i++, 'Pollution', MPOL[pol(x, y)]);
  mps_store_ss(i++, 'Job', MI[m + I1] >= 10 ? 'good' : 'poor');
}

/* ---- organic_farm.c ---- */
export function do_organic_farm(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I5] === 0) {
    MI[m + I5] = (rand() % 4) + 1;
    MI[m + I6] = rand() % 300;
  }
  MI[m + FLAGS] &= ~C.FLAG_POWERED;
  const F = C.ORGANIC_FARM_FOOD_OUTPUT;
  if (get_jobs(x, y, 1) === 0) put_food(x, y, 30);
  else if (get_jobs(x, y, C.FARM_JOBS_USED) !== 0) {
    if (get_power(x, y, C.ORG_FARM_POWER_REC, 0) !== 0) {
      if (put_food(x, y, F + MI[m + I7]) === 0) put_jobs(x, y, C.FARM_JOBS_USED);
      else MI[m + I3]++;
      MI[m + FLAGS] |= C.FLAG_POWERED;
    } else {
      if (put_food(x, y, idiv(F, 4)) === 0) put_jobs(x, y, C.FARM_JOBS_USED);
      else MI[m + I3]++;
    }
  } else if (get_jobs(x, y, idiv(C.FARM_JOBS_USED, 4)) !== 0) {
    if (get_power(x, y, C.ORG_FARM_POWER_REC, 0) !== 0) {
      if (put_food(x, y, F + idiv(MI[m + I7], 4)) === 0) put_jobs(x, y, idiv(C.FARM_JOBS_USED, 4));
      else MI[m + I3]++;
      MI[m + FLAGS] |= C.FLAG_POWERED;
    } else {
      if (put_food(x, y, idiv(F, 4 * 4)) === 0) put_jobs(x, y, idiv(C.FARM_JOBS_USED, 4));
      else MI[m + I3]++;
    }
  } else {
    if (get_power(x, y, C.ORG_FARM_POWER_REC, 0) !== 0) {
      if (put_food(x, y, F + idiv(MI[m + I7], 8)) !== 0) MI[m + I3]++;
      MI[m + FLAGS] |= C.FLAG_POWERED;
    } else if (put_food(x, y, 30 + idiv(F, 4 * 8)) !== 0) MI[m + I3]++;
  }
  if ((G.total_time & 0x7f) === 0) {
    if ((MI[m + FLAGS] & C.FLAG_POWERED) !== 0) get_waste(x, y, 0x80 * C.ORG_FARM_WASTE_GET);
  }
  if (G.total_time % 1200 === 0) {
    MI[m + I4] = MI[m + I3];
    MI[m + I3] = 0;
  }
  let i = (G.total_time + MI[m + I5] * 1200 + MI[m + I6]) % 4800;
  if (i % 300 === 0) {
    i = idiv(i, 300);
    if (MI[m + I4] > C.MIN_FOOD_SOLD_FOR_ANIM) {
      if (i % 4 === 0) MI[m + I6] = rand() % 100;
      if (i >= 0 && i <= 3) MT[pol(x, y)] = C.CST_FARM_O3;
      else if (i >= 4 && i <= 7) MT[pol(x, y)] = C.CST_FARM_O7;
      else if (i >= 8 && i <= 11) MT[pol(x, y)] = C.CST_FARM_O11;
      else if (i >= 12 && i <= 15) MT[pol(x, y)] = C.CST_FARM_O15;
    } else MT[pol(x, y)] = C.CST_FARM_O0;
  }
}
export function mps_organic_farm(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_snprintf(i++, 'Organic Farm');
  i++;
  mps_snprintf(i++, '%s %s', 'Power', (MI[m + FLAGS] & C.FLAG_POWERED) !== 0 ? 'YES' : 'NO ');
  mps_snprintf(i++, '%s  %5.1f%%', 'Tech', MI[m + I1] * 100.0 / C.MAX_TECH_LEVEL);
  mps_snprintf(i++, '%s  %5.1f%%', 'Prod', MI[m + I4] * 100.0 / 1200.0);
}

/* ---- commune.c ---- */
export function do_commune(x: number, y: number): void {
  const m = b_(x, y);
  let trackflag = 0;
  if (put_coal(x, y, 2) !== 0) {
    trackflag = 1;
    MI[m + I3]++;
    MI[m + I6] |= 1;
  }
  if (put_ore(x, y, 6) !== 0) {
    trackflag = 1;
    MI[m + I3]++;
    MI[m + I6] |= 2;
  }
  if (get_waste(x, y, 20) !== 0) {
    trackflag = 1;
    MI[m + I3]++;
    MI[m + I6] |= 8;
  }
  if (G.total_time % 10 === 0) {
    MI[m + I2] = 1;
    if (put_steel(x, y, 2) !== 0) {
      MI[m + I3]++;
      MI[m + I6] |= 4;
    } else MI[m + I2] = 0;
    if (trackflag) MI[m + I2] = 0;
  }
  if (G.total_time % 100 === 48) {
    MI[m + I5] = MI[m + I6];
    MI[m + I6] = 0;
    if (MI[m + I2] === 0 || trackflag === 0) {
      if (MT[pol(x, y)] > C.CST_COMMUNE_7) MT[pol(x, y)] -= 7;
    } else if (MT[pol(x, y)] <= C.CST_COMMUNE_7) MT[pol(x, y)] += 7;
    if (MI[m + I3] > 0) {
      MI[m + I3] = 0;
      if (--MI[m + I4] < 0) MI[m + I4] = 0;
    } else {
      MI[m + I3] = 0;
      MI[m + I4]++;
      if (MI[m + I4] > 120) {
        do_bulldoze_area(C.CST_PARKLAND_PLANE, x, y);
        return;
      }
    }
  }
  if (G.real_time >= MI[m + I1]) {
    MI[m + I1] = G.real_time + C.COMMUNE_ANIM_SPEED;
    const next: Record<number, number> = {
      [C.CST_COMMUNE_1]: C.CST_COMMUNE_2, [C.CST_COMMUNE_2]: C.CST_COMMUNE_3, [C.CST_COMMUNE_3]: C.CST_COMMUNE_4,
      [C.CST_COMMUNE_4]: C.CST_COMMUNE_5, [C.CST_COMMUNE_5]: C.CST_COMMUNE_6, [C.CST_COMMUNE_6]: C.CST_COMMUNE_1,
      [C.CST_COMMUNE_8]: C.CST_COMMUNE_9, [C.CST_COMMUNE_9]: C.CST_COMMUNE_10, [C.CST_COMMUNE_10]: C.CST_COMMUNE_11,
      [C.CST_COMMUNE_11]: C.CST_COMMUNE_12, [C.CST_COMMUNE_12]: C.CST_COMMUNE_13, [C.CST_COMMUNE_13]: C.CST_COMMUNE_8,
    };
    const n = next[MT[pol(x, y)]];
    if (n !== undefined) MT[pol(x, y)] = n;
  }
}
export function mps_commune(x: number, y: number): void {
  let i = 0;
  const f = MI[b_(x, y) + I5];
  mps_store_title(i++, 'Commune');
  i++;
  i++;
  mps_store_title(i++, 'Activity');
  i++;
  mps_store_ss(i++, 'Coal', f & 1 ? 'Yes' : 'No');
  mps_store_ss(i++, 'Ore', f & 2 ? 'Yes' : 'No');
  mps_store_ss(i++, 'Steel', f & 4 ? 'Yes' : 'No');
  mps_store_ss(i++, 'Waste', f & 8 ? 'Yes' : 'No');
}

/* ---- blacksmith.c ---- */
export function do_blacksmith(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I3] < C.MAX_COAL_AT_BLACKSMITH) {
    if (get_coal(x, y, C.BLACKSMITH_GET_COAL) !== 0) MI[m + I3] += C.BLACKSMITH_GET_COAL;
  }
  if (MI[m + I1] < C.MAX_GOODS_AT_BLACKSMITH && MI[m + I3] >= C.BLACKSMITH_COAL_USED) {
    if (get_steel(x, y, C.BLACKSMITH_STEEL_USED) !== 0) {
      MI[m + I1] += C.GOODS_MADE_BY_BLACKSMITH;
      MI[m + I3] -= C.BLACKSMITH_COAL_USED;
    }
  }
  if (get_jobs(x, y, C.BLACKSMITH_JOBS) !== 0) {
    if (MI[m + I1] > C.GOODS_MADE_BY_BLACKSMITH) {
      if (put_goods(x, y, C.GOODS_MADE_BY_BLACKSMITH - 1) !== 0) {
        MI[m + I1] -= C.GOODS_MADE_BY_BLACKSMITH - 1;
        MI[m + I2] += C.GOODS_MADE_BY_BLACKSMITH - 1;
        MI[m + I5]++;
      } else put_jobs(x, y, C.BLACKSMITH_JOBS);
    } else put_jobs(x, y, C.BLACKSMITH_JOBS);
  } else MT[pol(x, y)] = C.CST_BLACKSMITH_0;
  if (MI[m + I2] > C.BLACKSMITH_BATCH && G.real_time >= MI[m + I4]) {
    MI[m + I4] = G.real_time + C.BLACKSMITH_ANIM_SPEED;
    const t = MT[pol(x, y)];
    if (t >= C.CST_BLACKSMITH_0 && t <= C.CST_BLACKSMITH_5) MT[pol(x, y)] = t + 1;
    else if (t === C.CST_BLACKSMITH_6) {
      MT[pol(x, y)] = C.CST_BLACKSMITH_1;
      MI[m + I2] = 0;
      MPOL[pol(x, y)]++;
    }
  }
  if (G.total_time % 100 === 0) {
    MI[m + I6] = MI[m + I5];
    MI[m + I5] = 0;
  }
}
export function mps_blacksmith(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Blacksmith');
  i++;
  mps_store_sfp(i++, 'Capacity', MI[m + I6]);
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Goods', MI[m + I1] * 100.0 / C.MAX_GOODS_AT_BLACKSMITH);
  mps_store_sfp(i++, 'Coal', MI[m + I3] * 100.0 / C.MAX_COAL_AT_BLACKSMITH);
}

/* ---- coalmine.c ---- */
export function do_coalmine(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.DIG_MORE_COAL_TRIGGER - 1000) {
    if (MI[m + I2] < 0) return;
    let xs = x - C.COAL_RESERVE_SEARCH_LEN;
    if (xs < 0) xs = 0;
    let ys = y - C.COAL_RESERVE_SEARCH_LEN;
    if (ys < 0) ys = 0;
    let xe = x + C.COAL_RESERVE_SEARCH_LEN;
    if (xe > C.WORLD_SIDE_LEN) xe = C.WORLD_SIDE_LEN;
    let ye = y + C.COAL_RESERVE_SEARCH_LEN;
    if (ye > C.WORLD_SIDE_LEN) ye = C.WORLD_SIDE_LEN;
    let cr = 0;
    for (let yy = ys; yy < ye; yy++) for (let xx = xs; xx < xe; xx++) cr += coalReserve(xx, yy);
    MI[m + I2] = cr;
    if (cr > 0) {
      if (get_jobs(x, y, C.JOBS_DIG_COAL - MI[m + I3]) !== 0) {
        MI[m + I3] = 0;
        dig: for (let yy = ys; yy < ye; yy++) {
          for (let xx = xs; xx < xe; xx++) {
            if (coalReserve(xx, yy) > 0) {
              setCoalReserve(xx, yy, coalReserve(xx, yy) - 1);
              MI[m + I1] += 1000;
              G.coal_made += 1000;
              G.coal_tax += 1000;
              G.sust_dig_ore_coal_tip_flag = 0;
              MPOL[pol(x, y)] += C.COALMINE_POLLUTION;
              break dig;
            }
          }
        }
      } else if (get_jobs(x, y, idiv(C.JOBS_DIG_COAL, 10)) !== 0) MI[m + I3] += idiv(C.JOBS_DIG_COAL, 10);
      else if (get_jobs(x, y, idiv(C.JOBS_DIG_COAL, 50)) !== 0) MI[m + I3] += idiv(C.JOBS_DIG_COAL, 50);
    } else {
      MI[m + I1] = 0;
      MI[m + I2] = -1;
    }
  }
  const load = (tx: number, ty: number, grp: number, max: number): void => {
    const t = b_(tx, ty);
    if (MG[pol(tx, ty)] === grp && MI[t + I3] < max && MI[m + I1] >= max - MI[t + I3]) {
      if (get_jobs(x, y, C.JOBS_LOAD_COAL) !== 0) {
        MI[m + I1] -= max - MI[t + I3];
        MI[t + I3] = max;
      }
    }
  };
  load(x - 1, y, C.GROUP_RAIL, C.MAX_COAL_ON_RAIL);
  load(x, y - 1, C.GROUP_RAIL, C.MAX_COAL_ON_RAIL);
  load(x - 1, y, C.GROUP_ROAD, C.MAX_COAL_ON_ROAD);
  load(x, y - 1, C.GROUP_ROAD, C.MAX_COAL_ON_ROAD);
  load(x - 1, y, C.GROUP_TRACK, C.MAX_COAL_ON_TRACK);
  load(x, y - 1, C.GROUP_TRACK, C.MAX_COAL_ON_TRACK);
  if (MI[m + I1] > C.MAX_COAL_AT_MINE - idiv(C.MAX_COAL_AT_MINE, 5)) MT[pol(x, y)] = C.CST_COALMINE_FULL;
  else if (MI[m + I1] > idiv(C.MAX_COAL_AT_MINE, 2)) MT[pol(x, y)] = C.CST_COALMINE_MED;
  else if (MI[m + I1] > 0) MT[pol(x, y)] = C.CST_COALMINE_LOW;
  else MT[pol(x, y)] = C.CST_COALMINE_EMPTY;
}
export function mps_coalmine(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Coal Mine');
  i++;
  mps_store_sfp(i++, 'Stock', idiv(Math.imul(MI[m + I1], 100), C.MAX_COAL_AT_MINE));
  if (MI[m + I2] > 0) mps_store_sd(i++, 'Reserve', MI[m + I2]);
  else mps_store_ss(i++, 'Reserve', 'EMPTY');
}

/* ---- cricket.c, firestation.c, health_centre.c ---- */
function cover(x: number, y: number, range: number, flag: number): void {
  let x1 = x - range;
  if (x1 < 0) x1 = 0;
  let x2 = x + range;
  if (x2 > C.WORLD_SIDE_LEN) x2 = C.WORLD_SIDE_LEN;
  let y1 = y - range;
  if (y1 < 0) y1 = 0;
  let y2 = y + range;
  if (y2 > C.WORLD_SIDE_LEN) y2 = C.WORLD_SIDE_LEN;
  for (; y1 < y2; y1++) for (let xx = x1; xx < x2; xx++) MI[b_(xx, y1) + FLAGS] |= flag;
}

export function do_cricket(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.MAX_JOBS_AT_CRICKET - C.CRICKET_GET_JOBS) {
    if (get_jobs(x, y, C.CRICKET_GET_JOBS) !== 0) MI[m + I1] += C.CRICKET_GET_JOBS;
  }
  if (MI[m + I2] < C.MAX_GOODS_AT_CRICKET - C.CRICKET_GET_GOODS) {
    if (get_goods(x, y, C.CRICKET_GET_GOODS) !== 0) MI[m + I2] += C.CRICKET_GET_GOODS;
  }
  if (MI[m + I3] && G.real_time > MI[m + I4]) {
    MI[m + I4] = G.real_time + C.CRICKET_ANIMATION_SPEED;
    const t = MT[pol(x, y)];
    if (t >= C.CST_CRICKET_1 && t <= C.CST_CRICKET_6) MT[pol(x, y)] = t + 1;
    else if (t === C.CST_CRICKET_7) {
      MT[pol(x, y)] = C.CST_CRICKET_1;
      MI[m + I3] = 0;
    }
  }
  G.cricket_cost += C.CRICKET_RUNNING_COST;
}
export function do_cricket_cover(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.CRICKET_JOBS * C.DAYS_BETWEEN_COVER || MI[m + I2] < C.CRICKET_GOODS * C.DAYS_BETWEEN_COVER) return;
  MI[m + I1] -= C.CRICKET_JOBS * C.DAYS_BETWEEN_COVER;
  MI[m + I2] -= C.CRICKET_GOODS * C.DAYS_BETWEEN_COVER;
  MI[m + I3] = 1;
  cover(x, y, C.CRICKET_RANGE, C.FLAG_CRICKET_COVER);
}
export function mps_cricket(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Cricket Pitch');
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I1] * 100.0 / C.MAX_JOBS_AT_CRICKET);
  mps_store_sfp(i++, 'Goods', MI[m + I2] * 100.0 / C.MAX_GOODS_AT_CRICKET);
}

export function do_fire(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I2] === 0) MI[m + I2] = rand() % idiv(C.FIRE_LENGTH, 5);
  if (MI[m + I2] > C.FIRE_LENGTH) {
    if (MI[m + I4] === 0) MI[m + I4] = rand() % idiv(C.AFTER_FIRE_LENGTH, 6);
    MI[m + I4]++;
    if (MI[m + I4] > C.AFTER_FIRE_LENGTH) do_bulldoze_area(C.CST_GREEN, x, y);
    else if (MI[m + I4] > idiv(3 * C.AFTER_FIRE_LENGTH, 4)) MT[pol(x, y)] = C.CST_FIRE_DONE4;
    else if (MI[m + I4] > idiv(2 * C.AFTER_FIRE_LENGTH, 4)) MT[pol(x, y)] = C.CST_FIRE_DONE3;
    else if (MI[m + I4] > idiv(C.AFTER_FIRE_LENGTH, 4)) MT[pol(x, y)] = C.CST_FIRE_DONE2;
    else MT[pol(x, y)] = C.CST_FIRE_DONE1;
    return;
  }
  MI[m + I2]++;
  if (G.real_time > MI[m + I1]) {
    MI[m + I1] = G.real_time + C.FIRE_ANIMATION_SPEED;
    const t = MT[pol(x, y)];
    if (t === C.CST_FIRE_1) MT[pol(x, y)] = C.CST_FIRE_2;
    else if (t === C.CST_FIRE_2) MT[pol(x, y)] = C.CST_FIRE_3;
    else if (t === C.CST_FIRE_3) MT[pol(x, y)] = C.CST_FIRE_4;
    else if (t === C.CST_FIRE_4) MT[pol(x, y)] = C.CST_FIRE_5;
    else if (t === C.CST_FIRE_5) MT[pol(x, y)] = C.CST_FIRE_1;
  }
  if (MI[m + I3] === -1) {
    if (rand() % C.FIRE_DAYS_PER_SPREAD === 1) {
      switch (rand() % 4) {
        case 0: do_random_fire(x - 1, y, 0); break;
        case 1: do_random_fire(x, y - 1, 0); break;
        case 2: do_random_fire(x + 1, y, 0); break;
        case 3: do_random_fire(x, y + 1, 0); break;
      }
    }
  } else if (MI[m + I3] === 0) MI[m + I3] = G.real_time + 15000;
  else if (G.real_time >= MI[m + I3]) MI[m + I3] = -1;
}

export function do_firestation(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.MAX_JOBS_AT_FIRESTATION - C.FIRESTATION_GET_JOBS) {
    if (get_jobs(x, y, C.FIRESTATION_GET_JOBS) !== 0) MI[m + I1] += C.FIRESTATION_GET_JOBS;
  }
  if (MI[m + I2] < C.MAX_GOODS_AT_FIRESTATION - C.FIRESTATION_GET_GOODS) {
    if (get_goods(x, y, C.FIRESTATION_GET_GOODS) !== 0) MI[m + I2] += C.FIRESTATION_GET_GOODS;
  }
  if (MI[m + I3] && G.real_time > MI[m + I4]) {
    MI[m + I4] = G.real_time + C.FIRESTATION_ANIMATION_SPEED;
    if (MI[m + I5] > 0) MI[m + I5]--;
    else {
      const t = MT[pol(x, y)];
      if (t === C.CST_FIRESTATION_6) {
        MT[pol(x, y)] = C.CST_FIRESTATION_7;
        MI[m + I5] = 10;
      } else if (t === C.CST_FIRESTATION_10) {
        MT[pol(x, y)] = C.CST_FIRESTATION_1;
        MI[m + I3] = 0;
      } else if (t >= C.CST_FIRESTATION_1 && t <= C.CST_FIRESTATION_9) MT[pol(x, y)] = t + 1;
    }
  }
  G.fire_cost += C.FIRESTATION_RUNNING_COST;
}
export function do_fire_cover(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.FIRESTATION_JOBS * C.DAYS_BETWEEN_COVER || MI[m + I2] < C.FIRESTATION_GOODS * C.DAYS_BETWEEN_COVER) return;
  MI[m + I1] -= C.FIRESTATION_JOBS * C.DAYS_BETWEEN_COVER;
  MI[m + I2] -= C.FIRESTATION_GOODS * C.DAYS_BETWEEN_COVER;
  MI[m + I3] = 1;
  cover(x, y, C.FIRESTATION_RANGE, C.FLAG_FIRE_COVER);
}
export function mps_firestation(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Fire Station');
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I1] * 100.0 / C.MAX_JOBS_AT_FIRESTATION);
  mps_store_sfp(i++, 'Goods', MI[m + I2] * 100.0 / C.MAX_GOODS_AT_FIRESTATION);
}

export function do_health_centre(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.MAX_JOBS_AT_HEALTH_CENTRE - C.HEALTH_CENTRE_GET_JOBS) {
    if (get_jobs(x, y, C.HEALTH_CENTRE_GET_JOBS) !== 0) MI[m + I1] += C.HEALTH_CENTRE_GET_JOBS;
  }
  if (MI[m + I2] < C.MAX_GOODS_AT_HEALTH_CENTRE - C.HEALTH_CENTRE_GET_GOODS) {
    if (get_goods(x, y, C.HEALTH_CENTRE_GET_GOODS) !== 0) MI[m + I2] += C.HEALTH_CENTRE_GET_GOODS;
  }
  G.health_cost += C.HEALTH_RUNNING_COST;
}
export function do_health_cover(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.HEALTH_CENTRE_JOBS * C.DAYS_BETWEEN_COVER || MI[m + I2] < C.HEALTH_CENTRE_GOODS * C.DAYS_BETWEEN_COVER) return;
  MI[m + I1] -= C.HEALTH_CENTRE_JOBS * C.DAYS_BETWEEN_COVER;
  MI[m + I2] -= C.HEALTH_CENTRE_GOODS * C.DAYS_BETWEEN_COVER;
  cover(x, y, C.HEALTH_CENTRE_RANGE, C.FLAG_HEALTH_COVER);
}
export function mps_health_centre(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Health Centre');
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I1] * 100.0 / C.MAX_JOBS_AT_HEALTH_CENTRE);
  mps_store_sfp(i++, 'Goods', MI[m + I2] * 100.0 / C.MAX_GOODS_AT_HEALTH_CENTRE);
}

/* ---- heavy_industry.c ---- */
export function do_industry_h(x: number, y: number): void {
  const m = b_(x, y);
  const l = b_(x - 1, y), u = b_(x, y - 1);
  let steel = 0;
  const T = (i: number): boolean => (MI[i + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0;
  const takeHalf = (to: number, from: number): void => {
    MI[m + to] += idiv(MI[from], 2) + (MI[from] % 2);
    MI[from] = idiv(MI[from], 2);
  };
  if (MI[m + I3] < C.MAX_ORE_AT_INDUSTRY_H && T(l) && MI[l + I5] > 0) {
    if (get_jobs(x, y, C.JOBS_LOAD_ORE) !== 0) takeHalf(I3, l + I5);
  }
  if (MI[m + I3] < C.MAX_ORE_AT_INDUSTRY_H && T(u) && MI[u + I5] > 0) {
    if (get_jobs(x, y, C.JOBS_LOAD_ORE) !== 0) takeHalf(I3, u + I5);
  }
  if (MI[m + I4] < C.MAX_COAL_AT_INDUSTRY_H && T(l) && MI[l + I3] > 0) {
    if (get_jobs(x, y, C.JOBS_LOAD_COAL) !== 0) takeHalf(I4, l + I3);
  }
  // (sic) MAX_ORE_AT_INDUSTRY_H for the coal from above
  if (MI[m + I4] < C.MAX_ORE_AT_INDUSTRY_H && T(u) && MI[u + I3] > 0) {
    if (get_jobs(x, y, C.JOBS_LOAD_COAL) !== 0) takeHalf(I4, u + I3);
  }
  let rawm = MI[m + I3];
  if (rawm > C.MAX_MADE_AT_INDUSTRY_H) rawm = C.MAX_MADE_AT_INDUSTRY_H;
  if (rawm > 0 && MI[m + I2] < C.MAX_STEEL_ON_RAIL * 10) {
    if (get_jobs(x, y, idiv(idiv(rawm, 2), C.JOBS_MAKE_STEEL) + 1) !== 0) {
      steel = idiv(rawm, C.ORE_MAKE_STEEL);
      MPOL[pol(x, y)] += idiv(C.INDUSTRY_H_POLLUTION, 2);
    } else if (get_jobs(x, y, idiv(idiv(rawm, 4), C.JOBS_MAKE_STEEL) + 1) !== 0) {
      steel = idiv(idiv(rawm, 2), C.ORE_MAKE_STEEL);
      MPOL[pol(x, y)] += idiv(C.INDUSTRY_H_POLLUTION, 4);
    } else if (get_jobs(x, y, idiv(idiv(rawm, 10), C.JOBS_MAKE_STEEL) + 1) !== 0) {
      steel = idiv(idiv(rawm, 5), C.ORE_MAKE_STEEL);
      MPOL[pol(x, y)] += idiv(C.INDUSTRY_H_POLLUTION, 10);
    }
  }
  MI[m + I3] -= steel * C.ORE_MAKE_STEEL;
  G.ore_used += steel * C.ORE_MAKE_STEEL;
  if (get_power(x, y, steel * C.POWER_MAKE_STEEL, 1) === 0) {
    if (MI[m + I4] < steel * 2) {
      MI[m + FLAGS] &= ~C.FLAG_POWERED;
      steel = idiv(steel, 5);
    } else {
      MI[m + I4] -= steel * 2;
      G.coal_used += steel * 2;
      MI[m + FLAGS] |= C.FLAG_POWERED;
      MI[m + I7] = 1;
    }
  } else {
    MI[m + FLAGS] |= C.FLAG_POWERED;
    MI[m + I7] = 0;
  }
  MI[m + I1] += steel;
  MI[m + I2] += steel;
  sellTo(x, y, m, x, y - 1, I6, C.MAX_STEEL_ON_ROAD, C.MAX_STEEL_ON_RAIL, C.MAX_STEEL_ON_TRACK);
  sellTo(x, y, m, x - 1, y, I6, C.MAX_STEEL_ON_ROAD, C.MAX_STEEL_ON_RAIL, C.MAX_STEEL_ON_TRACK);
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === C.NUMOF_DAYS_IN_MONTH - 1) {
    MI[m + I5] = idiv(MI[m + I1], idiv(C.MAX_MADE_AT_INDUSTRY_H, C.ORE_MAKE_STEEL));
    MI[m + I1] = 0;
    const t = MT[pol(x, y)];
    if (MI[m + I5] > 80) {
      if (!(t >= C.CST_INDUSTRY_H_H1 && t <= C.CST_INDUSTRY_H_H8)) MT[pol(x, y)] = C.CST_INDUSTRY_H_H1;
    } else if (MI[m + I5] > 30) {
      if (!(t >= C.CST_INDUSTRY_H_M1 && t <= C.CST_INDUSTRY_H_M8)) MT[pol(x, y)] = C.CST_INDUSTRY_H_M1;
    } else if (MI[m + I5] > 0) {
      if (!(t >= C.CST_INDUSTRY_H_L1 && t <= C.CST_INDUSTRY_H_L8)) MT[pol(x, y)] = C.CST_INDUSTRY_H_L1;
    } else MT[pol(x, y)] = C.CST_INDUSTRY_H_C;
  }
  if (G.real_time >= MI[m + I6]) {
    MI[m + I6] = G.real_time + C.INDUSTRY_H_ANIM_SPEED;
    const t = MT[pol(x, y)];
    if (t === C.CST_INDUSTRY_H_L8) MT[pol(x, y)] = C.CST_INDUSTRY_H_L1;
    else if (t === C.CST_INDUSTRY_H_M8) MT[pol(x, y)] = C.CST_INDUSTRY_H_M1;
    else if (t === C.CST_INDUSTRY_H_H8) MT[pol(x, y)] = C.CST_INDUSTRY_H_H1;
    else if (t >= C.CST_INDUSTRY_H_L1 && t < C.CST_INDUSTRY_H_H8) MT[pol(x, y)] = t + 1;
  }
}

/** heavy and light industry: sell (steel or goods) to the road, rail or track at tx,ty */
function sellTo(_x: number, _y: number, m: number, tx: number, ty: number, field: number,
  maxRoad: number, maxRail: number, maxTrack: number): void {
  const t = b_(tx, ty);
  const g = MG[pol(tx, ty)];
  if (g === C.GROUP_ROAD && maxRoad - MI[t + field] <= MI[m + I2]) {
    MI[m + I2] -= maxRoad - MI[t + field];
    MI[t + field] = maxRoad;
  } else if (g === C.GROUP_RAIL && maxRail - MI[t + field] <= MI[m + I2]) {
    MI[m + I2] -= maxRail - MI[t + field];
    MI[t + field] = maxRail;
  } else if (g === C.GROUP_TRACK && maxTrack - MI[t + field] <= MI[m + I2]) {
    MI[m + I2] -= maxTrack - MI[t + field];
    MI[t + field] = maxTrack;
  }
}

export function mps_heavy_industry(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Heavy');
  mps_store_title(i++, 'Industry');
  i++;
  let p: string;
  if ((MI[m + FLAGS] & C.FLAG_POWERED) !== 0) p = MI[m + I7] === 1 ? 'Coal' : 'Grid';
  else p = 'NO';
  mps_store_ss(i++, 'Power', p);
  mps_store_sd(i++, 'Output', MI[m + I1]);
  mps_store_sfp(i++, 'Store', MI[m + I2] * 100.0 / C.MAX_STEEL_AT_INDUSTRY_H);
  mps_store_sfp(i++, 'Ore', MI[m + I3] * 100.0 / C.MAX_ORE_AT_INDUSTRY_H);
  mps_store_sfp(i++, 'Coal', MI[m + I4] * 100.0 / C.MAX_COAL_AT_INDUSTRY_H);
  mps_store_sd(i++, 'Capacity', MI[m + I5]);
}

/* ---- light_industry.c ---- */
export function do_industry_l(x: number, y: number): void {
  const m = b_(x, y);
  let goods = 0;
  if (MI[m + I5] < C.MAX_JOBS_AT_INDUSTRY_L - C.INDUSTRY_L_GET_JOBS) {
    if (get_jobs(x, y, C.INDUSTRY_L_GET_JOBS) !== 0) MI[m + I5] += C.INDUSTRY_L_GET_JOBS;
    else if (get_jobs(x, y, idiv(C.INDUSTRY_L_GET_JOBS, 10)) !== 0) MI[m + I5] += idiv(C.INDUSTRY_L_GET_JOBS, 10);
  }
  if (MI[m + I5] < C.MIN_JOBS_AT_INDUSTRY_L) return;
  const fetch = (t: number, from: number, to: number, max: number, get: number, jobs: number): void => {
    if (MI[m + to] < max - get) {
      if ((MI[t + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0 && MI[t + from] > 0) {
        if (MI[t + from] >= get) {
          MI[m + to] += get;
          MI[t + from] -= get;
        } else {
          MI[m + to] += MI[t + from];
          MI[t + from] = 0;
        }
        MI[m + I5] -= jobs;
      }
    }
  };
  fetch(b_(x - 1, y), I5, I3, C.MAX_ORE_AT_INDUSTRY_L, C.INDUSTRY_L_GET_ORE, C.INDUSTRY_L_JOBS_LOAD_ORE);
  fetch(b_(x, y - 1), I5, I3, C.MAX_ORE_AT_INDUSTRY_L, C.INDUSTRY_L_GET_ORE, C.INDUSTRY_L_JOBS_LOAD_ORE);
  fetch(b_(x - 1, y), I6, I4, C.MAX_STEEL_AT_INDUSTRY_L, C.INDUSTRY_L_GET_STEEL, C.INDUSTRY_L_JOBS_LOAD_STEEL);
  fetch(b_(x, y - 1), I6, I4, C.MAX_STEEL_AT_INDUSTRY_L, C.INDUSTRY_L_GET_STEEL, C.INDUSTRY_L_JOBS_LOAD_STEEL);
  if (MI[m + I2] < C.MAX_GOODS_AT_INDUSTRY_L - C.INDUSTRY_L_MAKE_GOODS * 8 && MI[m + I3] >= C.INDUSTRY_L_ORE_USED) {
    goods += C.INDUSTRY_L_MAKE_GOODS;
    MI[m + I3] -= C.INDUSTRY_L_ORE_USED;
    G.ore_used += C.INDUSTRY_L_ORE_USED;
    MI[m + I5] -= C.INDUSTRY_L_JOBS_USED;
    MPOL[pol(x, y)] += C.INDUSTRY_L_POLLUTION;
    if (MI[m + I4] >= C.INDUSTRY_L_STEEL_USED) {
      MI[m + I4] -= C.INDUSTRY_L_STEEL_USED;
      goods += goods;
    }
    if (MI[m + I3] >= C.INDUSTRY_L_ORE_USED && get_power(x, y, goods * 10, 1) !== 0) {
      goods *= 4;
      MI[m + FLAGS] |= C.FLAG_POWERED;
      MI[m + I3] -= C.INDUSTRY_L_ORE_USED;
      G.ore_used += C.INDUSTRY_L_ORE_USED;
    } else MI[m + FLAGS] &= ~C.FLAG_POWERED;
  }
  MI[m + I1] += goods;
  MI[m + I2] += goods;
  G.goods_made += goods;
  sellTo(x, y, m, x, y - 1, I4, C.MAX_GOODS_ON_ROAD, C.MAX_GOODS_ON_RAIL, C.MAX_GOODS_ON_TRACK);
  sellTo(x, y, m, x - 1, y, I4, C.MAX_GOODS_ON_ROAD, C.MAX_GOODS_ON_RAIL, C.MAX_GOODS_ON_TRACK);
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === C.NUMOF_DAYS_IN_MONTH - 1) {
    MI[m + I6] = idiv(MI[m + I1], C.INDUSTRY_L_MAKE_GOODS * 8);
    MI[m + I1] = 0;
    const t = MT[pol(x, y)];
    if (MI[m + I6] > 80) {
      if (!(t >= C.CST_INDUSTRY_L_H1 && t <= C.CST_INDUSTRY_L_H4)) MT[pol(x, y)] = C.CST_INDUSTRY_L_H1;
    } else if (MI[m + I6] > 55) {
      if (!(t >= C.CST_INDUSTRY_L_M1 && t <= C.CST_INDUSTRY_L_M4)) MT[pol(x, y)] = C.CST_INDUSTRY_L_M1;
    } else if (MI[m + I6] > 25) {
      if (!(t >= C.CST_INDUSTRY_L_L1 && t <= C.CST_INDUSTRY_L_L4)) MT[pol(x, y)] = C.CST_INDUSTRY_L_L1;
    } else if (MI[m + I6] > 0) {
      if (!(t >= C.CST_INDUSTRY_L_Q1 && t <= C.CST_INDUSTRY_L_Q4)) MT[pol(x, y)] = C.CST_INDUSTRY_L_Q1;
    } else MT[pol(x, y)] = C.CST_INDUSTRY_L_C;
  }
  if (G.real_time >= MI[m + I7]) {
    MI[m + I7] = G.real_time + C.INDUSTRY_L_ANIM_SPEED;
    const t = MT[pol(x, y)];
    if (t === C.CST_INDUSTRY_L_Q4) MT[pol(x, y)] = C.CST_INDUSTRY_L_Q1;
    else if (t === C.CST_INDUSTRY_L_L4) MT[pol(x, y)] = C.CST_INDUSTRY_L_L1;
    else if (t === C.CST_INDUSTRY_L_M4) MT[pol(x, y)] = C.CST_INDUSTRY_L_M1;
    else if (t === C.CST_INDUSTRY_L_H4) MT[pol(x, y)] = C.CST_INDUSTRY_L_H1;
    else if (t >= C.CST_INDUSTRY_L_Q1 && t < C.CST_INDUSTRY_L_H4) MT[pol(x, y)] = t + 1;
  }
}
export function mps_light_industry(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Light');
  mps_store_title(i++, 'Industry');
  i++;
  mps_store_ss(i++, 'Power', (MI[m + FLAGS] & C.FLAG_POWERED) !== 0 ? 'YES' : 'NO');
  mps_store_sd(i++, 'Output', MI[m + I1]);
  mps_store_sfp(i++, 'Store', MI[m + I2] * 100.0 / C.MAX_GOODS_AT_INDUSTRY_L);
  mps_store_sfp(i++, 'Ore', MI[m + I3] * 100.0 / C.MAX_ORE_AT_INDUSTRY_L);
  mps_store_sfp(i++, 'Steel', MI[m + I4] * 100.0 / C.MAX_STEEL_AT_INDUSTRY_L);
  mps_store_sfp(i++, 'Capacity', MI[m + I6]);
}

/* ---- mill.c ---- */
export function do_mill(x: number, y: number): void {
  const m = b_(x, y);
  let block_anim = 0;
  if (MI[m + I2] < C.MAX_FOOD_AT_MILL) {
    if (get_food(x, y, C.MILL_GET_FOOD) !== 0) MI[m + I2] += C.MILL_GET_FOOD;
  }
  if (MI[m + I3] < C.MAX_COAL_AT_MILL) {
    if (get_coal(x, y, C.MILL_GET_COAL) !== 0) MI[m + I3] += C.MILL_GET_COAL;
    else if (get_power(x, y, C.MILL_GET_COAL * C.MILL_POWER_PER_COAL, 0) !== 0) MI[m + I3] += C.MILL_GET_COAL;
  }
  if (MI[m + I1] < C.MAX_GOODS_AT_MILL) {
    if (MI[m + I2] > C.FOOD_USED_BY_MILL && MI[m + I3] > C.COAL_USED_BY_MILL) {
      if (get_jobs(x, y, C.MILL_JOBS) !== 0) {
        MI[m + I2] -= C.FOOD_USED_BY_MILL;
        MI[m + I3] -= C.COAL_USED_BY_MILL;
        MI[m + I1] += C.GOODS_MADE_BY_MILL;
        MI[m + I5]++;
      } else {
        MT[pol(x, y)] = C.CST_MILL_0;
        block_anim = 1;
      }
    } else block_anim = 1;
  }
  if (MI[m + I1] > 0) {
    if (put_goods(x, y, MI[m + I1]) !== 0) MI[m + I1] = 0;
  }
  if (G.total_time % 100 === 0) {
    MI[m + I6] = MI[m + I5];
    MI[m + I5] = 0;
  }
  if (G.real_time >= MI[m + I4] && block_anim === 0) {
    MI[m + I4] = G.real_time + C.MILL_ANIM_SPEED;
    const t = MT[pol(x, y)];
    if (t >= C.CST_MILL_0 && t <= C.CST_MILL_5) MT[pol(x, y)] = t + 1;
    else if (t === C.CST_MILL_6) {
      MT[pol(x, y)] = C.CST_MILL_1;
      MPOL[pol(x, y)]++;
    }
  }
}
export function mps_mill(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Textile Mill');
  i++;
  mps_store_sfp(i++, 'Capacity', MI[m + I6]);
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Goods', MI[m + I1] * 100.0 / C.MAX_GOODS_AT_MILL);
  mps_store_sfp(i++, 'Food', MI[m + I2] * 100.0 / C.MAX_FOOD_AT_MILL);
  mps_store_sfp(i++, 'Coal', MI[m + I3] * 100.0 / C.MAX_COAL_AT_MILL);
}

/* ---- monument.c ---- */
export function do_monument(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.BUILD_MONUMENT_JOBS) {
    if (get_jobs(x, y, C.MONUMENT_GET_JOBS) !== 0) MI[m + I1] += C.MONUMENT_GET_JOBS;
  }
  if (MI[m + I1] >= C.BUILD_MONUMENT_JOBS) {
    MT[pol(x, y)] = C.CST_MONUMENT_5;
    if (G.tech_level < C.MONUMENT_TECH_EXPIRE * 1000 && G.total_time % C.MONUMENT_DAYS_PER_TECH === 1) {
      if (MI[m + I3]++ > idiv(G.tech_level, 10000) - 2) {
        G.tech_level++;
        MI[m + I2]++;
        MI[m + I3] = 0;
      }
    }
  } else if (MI[m + I1] >= idiv(C.BUILD_MONUMENT_JOBS * 4, 5)) MT[pol(x, y)] = C.CST_MONUMENT_4;
  else if (MI[m + I1] >= idiv(C.BUILD_MONUMENT_JOBS * 3, 5)) MT[pol(x, y)] = C.CST_MONUMENT_3;
  else if (MI[m + I1] >= idiv(C.BUILD_MONUMENT_JOBS * 2, 5)) MT[pol(x, y)] = C.CST_MONUMENT_2;
  else if (MI[m + I1] >= idiv(C.BUILD_MONUMENT_JOBS, 20)) MT[pol(x, y)] = C.CST_MONUMENT_1;
  else MT[pol(x, y)] = C.CST_MONUMENT_0;
}
export function mps_monument(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Monument');
  i++;
  i++;
  if (idiv(Math.imul(MI[m + I1], 100), C.BUILD_MONUMENT_JOBS) >= 100) {
    mps_store_title(i++, 'Wisdom Bestowed');
    i++;
    mps_store_f(i++, MI[m + I2] * 100.0 / C.MAX_TECH_LEVEL);
  } else {
    mps_store_title(i++, '% Complete');
    i++;
    mps_store_fp(i++, MI[m + I1] * 100.0 / C.BUILD_MONUMENT_JOBS);
  }
}

/* ---- oremine.c ---- */
export function do_oremine(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.DIG_MORE_ORE_TRIGGER - 5000) {
    const xs = x, ys = y, xe = x + 4, ye = y + 4;
    let cr = 0;
    for (let yy = ys; yy < ye; yy++) for (let xx = xs; xx < xe; xx++) cr += oreReserve(xx, yy);
    MI[m + I2] = cr;
    if (cr > 0) {
      if (get_jobs(x, y, C.JOBS_DIG_ORE) !== 0) {
        dig: for (let yy = ys; yy < ye; yy++) {
          for (let xx = xs; xx < xe; xx++) {
            if (oreReserve(xx, yy) > 0) {
              setOreReserve(xx, yy, oreReserve(xx, yy) - 1);
              MI[m + I1] += 5000;
              G.ore_made += 5000;
              G.sust_dig_ore_coal_tip_flag = 0;
              break dig;
            }
          }
        }
      }
    }
  }
  const load = (tx: number, ty: number): void => {
    const t = b_(tx, ty);
    if ((MI[t + FLAGS] & C.FLAG_IS_TRANSPORT) === 0) return;
    const g = MG[pol(tx, ty)];
    let max = -1;
    if (g === C.GROUP_RAIL && MI[t + I5] < C.MAX_ORE_ON_RAIL && MI[m + I1] >= C.MAX_ORE_ON_RAIL - MI[t + I5]) max = C.MAX_ORE_ON_RAIL;
    else if (g === C.GROUP_ROAD && MI[t + I5] < C.MAX_ORE_ON_ROAD && MI[m + I1] >= C.MAX_ORE_ON_ROAD - MI[t + I5]) max = C.MAX_ORE_ON_ROAD;
    else if (g === C.GROUP_TRACK && MI[t + I5] < C.MAX_ORE_ON_TRACK && MI[m + I1] >= C.MAX_ORE_ON_TRACK - MI[t + I5]) max = C.MAX_ORE_ON_TRACK;
    if (max >= 0 && get_jobs(x, y, C.JOBS_LOAD_ORE) !== 0) {
      MI[m + I1] -= max - MI[t + I5];
      MI[t + I5] = max;
    }
  };
  load(x - 1, y);
  load(x, y - 1);
  if ((G.total_time & 0x7f) === 0) {
    const xx = idiv(7 * (MI[m + I2] + idiv(3 * C.ORE_RESERVE, 2)), 16 * C.ORE_RESERVE);
    const types = [C.CST_OREMINE_8, C.CST_OREMINE_7, C.CST_OREMINE_6, C.CST_OREMINE_5, C.CST_OREMINE_4,
      C.CST_OREMINE_3, C.CST_OREMINE_2, C.CST_OREMINE_1];
    if (xx >= 0 && xx <= 7) MT[pol(x, y)] = types[xx];
    if (MI[m + I2] <= 0) {
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) do_bulldoze_area(C.CST_WATER, x + i, y + j);
      connect_rivers();
      refresh_main_screen();
    }
  }
}
export function mps_oremine(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Ore Mine');
  i++;
  mps_store_sfp(i++, 'Stock', MI[m + I1] * 100.0 / C.DIG_MORE_ORE_TRIGGER);
  i++;
  mps_store_sfp(i++, 'Reserve', MI[m + I2] * 100.0 / (C.ORE_RESERVE * 16));
}

/* ---- parkland.c ---- */
export function do_parkland(x: number, y: number): void {
  if (MPOL[pol(x, y)] > 10 && (G.total_time & 1) === 0) MPOL[pol(x, y)] -= 1;
}

/* ---- port.c ---- */
export function do_port(x: number, y: number): void {
  const m = b_(x, y);
  let et = 0, ic = 0;
  const flags = MI[m + FLAGS];
  const b1 = b_(x + 1, y), s1 = b_(x + 2, y);
  const trade = (tx: number, ty: number): void => {
    const deals: [number, number, (a: number, b: number) => number, number][] = [
      [C.FLAG_MB_FOOD, 0, buy_food, I3], [C.FLAG_MS_FOOD, 1, sell_food, I3],
      [C.FLAG_MB_COAL, 0, buy_coal, I4], [C.FLAG_MS_COAL, 1, sell_coal, I4],
      [C.FLAG_MB_ORE, 0, buy_ore, I5], [C.FLAG_MS_ORE, 1, sell_ore, I5],
      [C.FLAG_MB_GOODS, 0, buy_goods, I6], [C.FLAG_MS_GOODS, 1, sell_goods, I6],
      [C.FLAG_MB_STEEL, 0, buy_steel, I7], [C.FLAG_MS_STEEL, 1, sell_steel, I7],
    ];
    for (const [flag, sell, f, field] of deals) {
      if ((flags & flag) === 0) continue;
      const i = f(tx, ty);
      if (sell) {
        et = (et + i) | 0;
        MI[s1 + field] += i;
      } else {
        ic = (ic + i) | 0;
        MI[b1 + field] += i;
      }
    }
  };
  if (x > 0 && (MI[b_(x - 1, y) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0) trade(x - 1, y);
  if (y > 0 && (MI[b_(x, y - 1) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0) trade(x, y - 1);
  MI[m + I1] += et;
  MI[m + I4] += ic;
  if (G.total_time % 100 === 0) {
    MI[m + I2] = MI[m + I1];
    MI[m + I1] = 0;
    MI[m + I5] = MI[m + I4];
    MI[m + I4] = 0;
    const b2 = b_(x, y + 1), s2 = b_(x, y + 2);
    for (let i = 0; i < 5; i++) {
      MI[b2 + I3 + i] = MI[b1 + I3 + i];
      MI[s2 + I3 + i] = MI[s1 + I3 + i];
      MI[b1 + I3 + i] = 0;
      MI[s1 + I3 + i] = 0;
    }
  }
  if (et > 0) {
    G.sust_port_flag = 0;
    G.tech_level++;
  }
  if (ic > 0) {
    G.sust_port_flag = 0;
    G.tech_level++;
  }
  et = (et + MI[m + I3]) | 0;
  G.export_tax = (G.export_tax + idiv(et, 100)) | 0;
  MI[m + I3] = et % 100;
  G.import_cost = (G.import_cost + ic) | 0;
}
export function mps_port(x: number, y: number): void {
  let i = 0;
  const b1 = b_(x, y + 1), b2 = b_(x, y + 2), m = b_(x, y);
  const a = (v: number): string => num_to_ansi(12, idiv(v, 100));
  mps_store_title(i++, 'Port');
  i++;
  const names = ['Food', 'Coal', 'Ore', 'Goods', 'Steel'];
  for (let k = 0; k < 5; k++) mps_store_sss(i++, names[k], a(MI[b1 + I3 + k]), a(MI[b2 + I3 + k]));
  mps_store_sss(i++, 'Total', a(MI[m + I2]), a(MI[m + I5]));
}

/* ---- pottery.c ---- */
export function do_pottery(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I5] < 0) {
    MI[m + I5]++;
    return;
  }
  if (MI[m + I1] < C.MAX_GOODS_AT_POTTERY - C.POTTERY_MADE_GOODS) {
    if (MI[m + I2] < C.MAX_ORE_AT_POTTERY - C.POTTERY_GET_ORE) {
      if (get_ore(x, y, C.POTTERY_GET_ORE) !== 0) MI[m + I2] += C.POTTERY_GET_ORE;
    }
    if (MI[m + I3] < C.MAX_COAL_AT_POTTERY - C.POTTERY_GET_COAL) {
      if (get_coal(x, y, C.POTTERY_GET_COAL) !== 0) MI[m + I3] += C.POTTERY_GET_COAL;
    }
    if (MI[m + I7] < C.MAX_JOBS_AT_POTTERY - C.POTTERY_GET_JOBS) {
      if (get_jobs(x, y, C.POTTERY_GET_JOBS) !== 0) MI[m + I7] += C.POTTERY_GET_JOBS;
    }
    if (MI[m + I2] > C.POTTERY_ORE_MAKE_GOODS && MI[m + I3] > C.POTTERY_COAL_MAKE_GOODS && MI[m + I7] > C.POTTERY_JOBS) {
      MI[m + I1] += C.POTTERY_MADE_GOODS;
      MI[m + I2] -= C.POTTERY_ORE_MAKE_GOODS;
      MI[m + I3] -= C.POTTERY_COAL_MAKE_GOODS;
      MI[m + I7] -= C.POTTERY_JOBS;
      MI[m + I5]++;
    } else {
      MT[pol(x, y)] = C.CST_POTTERY_1;
      MI[m + I6] = 0;
      MI[m + I5] = -C.POTTERY_CLOSE_TIME;
      return;
    }
  }
  if (MI[m + I1] > 0) {
    if (put_goods(x, y, MI[m + I1]) !== 0) MI[m + I1] = 0;
  }
  if (G.total_time % 100 === 0) {
    MI[m + I6] = MI[m + I5];
    MI[m + I5] = 0;
  }
  if (G.real_time >= MI[m + I4]) {
    MI[m + I4] = G.real_time + C.POTTERY_ANIM_SPEED;
    const t = MT[pol(x, y)];
    if (t >= C.CST_POTTERY_0 && t <= C.CST_POTTERY_9) MT[pol(x, y)] = t + 1;
    else if (t === C.CST_POTTERY_10) {
      MT[pol(x, y)] = C.CST_POTTERY_1;
      MPOL[pol(x, y)]++;
    }
  }
}
export function mps_pottery(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Pottery');
  i++;
  mps_store_sfp(i++, 'Capacity', MI[m + I6] * 1.0);
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I7] * 100.0 / C.MAX_JOBS_AT_POTTERY);
  mps_store_sfp(i++, 'Goods', MI[m + I1] * 100.0 / C.MAX_GOODS_AT_POTTERY);
  mps_store_sfp(i++, 'Ore', MI[m + I2] * 100.0 / C.MAX_ORE_AT_POTTERY);
  mps_store_sfp(i++, 'Coal', MI[m + I3] * 100.0 / C.MAX_COAL_AT_POTTERY);
}

/* ---- recycle.c ---- */
export function do_recycle(x: number, y: number): void {
  const m = b_(x, y);
  G.recycle_cost += C.RECYCLE_RUNNING_COST;
  const take = (t: number): void => {
    let i = MI[t + I7];
    if (i > C.MAX_WASTE_AT_RECYCLE - MI[m + I2]) i = C.MAX_WASTE_AT_RECYCLE - MI[m + I2];
    MI[m + I2] += i;
    MI[t + I7] -= i;
  };
  if (x > 0 && (MI[b_(x - 1, y) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0) take(b_(x - 1, y));
  if (y > 0 && (MI[b_(x, y - 1) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0) take(b_(x, y - 1));
  if ((MI[m + FLAGS] & C.FLAG_POWERED) === 0) {
    if (get_power(x, y, C.GOODS_RECYCLED, 1) !== 0) MI[m + FLAGS] |= C.FLAG_POWERED;
  }
  if (MI[m + I1] < C.MAX_ORE_AT_RECYCLE && MI[m + I2] > C.GOODS_RECYCLED && (MI[m + FLAGS] & C.FLAG_POWERED) !== 0) {
    if (get_jobs(x, y, C.RECYCLE_GOODS_JOBS) !== 0) {
      if (get_power(x, y, idiv(C.GOODS_RECYCLED, 2), 1) === 0) MI[m + FLAGS] &= ~C.FLAG_POWERED;
      else MI[m + FLAGS] |= C.FLAG_POWERED;
      MI[m + I2] -= C.GOODS_RECYCLED;
      let i = idiv(C.GOODS_RECYCLED * (10 + idiv(50 * MI[m + I4], C.MAX_TECH_LEVEL)), 100);
      if (i > idiv(C.GOODS_RECYCLED * 8, 10)) i = idiv(C.GOODS_RECYCLED * 8, 10);
      MI[m + I1] += i;
      G.ore_made += i;
      MI[m + I5]++;
    }
  }
  if (G.total_time % 100 === 0) {
    MI[m + I6] = MI[m + I5];
    MI[m + I5] = 0;
  }
  const out = (tx: number, ty: number, grp: number, max: number): void => {
    const t = b_(tx, ty);
    if (MG[pol(tx, ty)] === grp && MI[t + I5] < max && MI[m + I1] >= max - MI[t + I5]) {
      if (get_jobs(x, y, C.JOBS_LOAD_ORE) !== 0) {
        MI[m + I1] -= max - MI[t + I5];
        MI[t + I5] = max;
      }
    }
  };
  if (x > 0) out(x - 1, y, C.GROUP_RAIL, C.MAX_ORE_ON_RAIL);
  if (y > 0) out(x, y - 1, C.GROUP_RAIL, C.MAX_ORE_ON_RAIL);
  if (x > 0) out(x - 1, y, C.GROUP_ROAD, C.MAX_ORE_ON_ROAD);
  if (y > 0) out(x, y - 1, C.GROUP_ROAD, C.MAX_ORE_ON_ROAD);
  if (x > 0) out(x - 1, y, C.GROUP_TRACK, C.MAX_ORE_ON_TRACK);
  if (y > 0) out(x, y - 1, C.GROUP_TRACK, C.MAX_ORE_ON_TRACK);
  if (MI[m + I1] > idiv(C.MAX_ORE_AT_RECYCLE * 9, 10) && MI[m + I2] > idiv(C.MAX_WASTE_AT_RECYCLE * 9, 10)) {
    MI[m + I2] -= C.BURN_WASTE_AT_RECYCLE;
  }
}
export function mps_recycle(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Recycling');
  mps_store_title(i++, 'Center');
  i++;
  mps_store_sfp(i++, 'Capacity', MI[m + I6]);
  mps_store_ss(i++, 'Power', (MI[m + FLAGS] & C.FLAG_POWERED) !== 0 ? 'YES' : 'NO');
  mps_store_sfp(i++, 'Tech', MI[m + I4] * 100.0 / C.MAX_TECH_LEVEL);
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Ore', MI[m + I1] * 100.0 / C.MAX_ORE_AT_RECYCLE);
  mps_store_sfp(i++, 'Waste', MI[m + I2] * 100.0 / C.MAX_WASTE_AT_RECYCLE);
}

/* ---- rocket_pad.c ---- */
export function do_rocket_pad(x: number, y: number): void {
  const m = b_(x, y);
  if (MT[pol(x, y)] === C.CST_ROCKET_FLOWN) return;
  if (MI[m + I1] < C.ROCKET_PAD_JOBS_STORE) {
    if (get_jobs(x, y, C.ROCKET_PAD_JOBS + 10) !== 0) MI[m + I1] += C.ROCKET_PAD_JOBS;
  }
  if (MI[m + I2] < C.ROCKET_PAD_GOODS_STORE) {
    if (get_goods(x, y, C.ROCKET_PAD_GOODS + 10) !== 0) MI[m + I2] += C.ROCKET_PAD_GOODS;
    else if (get_goods(x, y, idiv(C.ROCKET_PAD_GOODS, 10)) !== 0) MI[m + I2] += idiv(C.ROCKET_PAD_GOODS, 5);
    else if (get_goods(x, y, idiv(C.ROCKET_PAD_GOODS, 50)) !== 0) MI[m + I2] += idiv(C.ROCKET_PAD_GOODS, 20);
  }
  if (MI[m + I3] < C.ROCKET_PAD_STEEL_STORE) {
    if (get_steel(x, y, C.ROCKET_PAD_STEEL + 10) !== 0) MI[m + I3] += C.ROCKET_PAD_STEEL + 10;
    else if (get_steel(x, y, idiv(C.ROCKET_PAD_STEEL, 5)) !== 0) MI[m + I3] += idiv(C.ROCKET_PAD_STEEL, 5);
    else if (get_steel(x, y, idiv(C.ROCKET_PAD_STEEL, 20)) !== 0) MI[m + I3] += idiv(C.ROCKET_PAD_STEEL, 20);
  }
  if (MT[pol(x, y)] < C.CST_ROCKET_5 && MI[m + I1] >= C.ROCKET_PAD_JOBS_STORE
    && MI[m + I2] >= C.ROCKET_PAD_GOODS_STORE && MI[m + I3] >= C.ROCKET_PAD_STEEL_STORE) {
    MI[m + I1] -= C.ROCKET_PAD_JOBS_STORE;
    MI[m + I2] -= C.ROCKET_PAD_GOODS_STORE;
    MI[m + I3] -= C.ROCKET_PAD_STEEL_STORE;
    MI[m + I4]++;
    G.goods_used += C.ROCKET_PAD_GOODS_STORE;
  }
  G.rocket_pad_cost += C.ROCKET_PAD_RUNNING_COST;
  const L = C.ROCKET_PAD_LAUNCH;
  if (MT[pol(x, y)] >= C.CST_ROCKET_5 && MI[m + I4] >= idiv(100 * L, 100)) {
    if (G.real_time >= MI[m + I5]) {
      MI[m + I5] = G.real_time + C.ROCKET_ANIMATION_SPEED;
      const t = MT[pol(x, y)];
      if (t === C.CST_ROCKET_5) MT[pol(x, y)] = C.CST_ROCKET_6;
      else if (t === C.CST_ROCKET_6) MT[pol(x, y)] = C.CST_ROCKET_7;
      else if (t === C.CST_ROCKET_7) MT[pol(x, y)] = C.CST_ROCKET_5;
    }
    return;
  }
  if (MI[m + I4] < idiv(25 * L, 100)) MT[pol(x, y)] = C.CST_ROCKET_1;
  else if (MI[m + I4] < idiv(60 * L, 100)) MT[pol(x, y)] = C.CST_ROCKET_2;
  else if (MI[m + I4] < idiv(90 * L, 100)) MT[pol(x, y)] = C.CST_ROCKET_3;
  else if (MI[m + I4] < idiv(100 * L, 100)) MT[pol(x, y)] = C.CST_ROCKET_4;
  else if (MI[m + I4] >= idiv(100 * L, 100)) {
    MT[pol(x, y)] = C.CST_ROCKET_5;
    update_main_screen(0);
    if (ask_launch_rocket_now(x, y)) launch_rocket(x, y);
  }
}

export function launch_rocket(x: number, y: number): void {
  G.rockets_launched++;
  MT[pol(x, y)] = C.CST_ROCKET_FLOWN;
  update_main_screen(0);
  const r = rand() % C.MAX_TECH_LEVEL;
  if (r > G.tech_level || rand() % 100 > G.rockets_launched * 15 + 25) {
    display_rocket_result_dialog(C.ROCKET_LAUNCH_BAD);
    G.rockets_launched_success = 0;
    const xx = (rand() % 40) - 20 + x;
    const yy = (rand() % 40) - 20 + y;
    for (let i = 0; i < 20; i++) {
      const xxx = (rand() % 20) - 10 + xx;
      const yyy = (rand() % 20) - 10 + yy;
      if (xxx > 0 && xxx < C.WORLD_SIDE_LEN && yyy > 0 && yyy < C.WORLD_SIDE_LEN) {
        if (xxx >= x && xxx < x + 4 && yyy >= y && yyy < y + 4) continue;
        fire_area(xxx, yyy);
      }
    }
  } else {
    G.rockets_launched_success++;
    if (G.rockets_launched_success > 5) {
      remove_people(1000);
      if (G.people_pool || G.housed_population) display_rocket_result_dialog(C.ROCKET_LAUNCH_EVAC);
    } else display_rocket_result_dialog(C.ROCKET_LAUNCH_GOOD);
  }
}
export function mps_rocket(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Rocket Pad');
  i++;
  mps_store_title(i++, 'Completion');
  mps_store_fp(i++, MI[m + I4] * 100.0 / C.ROCKET_PAD_LAUNCH);
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I1] * 100.0 / C.ROCKET_PAD_JOBS_STORE);
  mps_store_sfp(i++, 'Goods', MI[m + I2] * 100.0 / C.ROCKET_PAD_GOODS_STORE);
  mps_store_sfp(i++, 'Steel', MI[m + I3] * 100.0 / C.ROCKET_PAD_STEEL_STORE);
}

/* ---- school.c ---- */
export function do_school(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.MAX_JOBS_AT_SCHOOL - C.SCHOOL_JOBS) {
    if (get_jobs(x, y, C.SCHOOL_JOBS) !== 0) MI[m + I1] += C.SCHOOL_JOBS;
  }
  if (MI[m + I2] < C.MAX_GOODS_AT_SCHOOL - C.SCHOOL_GOODS) {
    if (get_goods(x, y, C.SCHOOL_GOODS) !== 0) MI[m + I2] += C.SCHOOL_GOODS;
  }
  if (MI[m + I1] >= C.JOBS_MAKE_TECH_SCHOOL && MI[m + I2] >= C.GOODS_MAKE_TECH_SCHOOL) {
    MI[m + I1] -= C.JOBS_MAKE_TECH_SCHOOL;
    MI[m + I2] -= C.GOODS_MAKE_TECH_SCHOOL;
    MI[m + I3] += C.TECH_MADE_BY_SCHOOL;
    MI[m + I4]++;
    G.tech_level += C.TECH_MADE_BY_SCHOOL;
  }
  G.school_cost += C.SCHOOL_RUNNING_COST;
  if (G.total_time % 100 === 0) {
    MI[m + I5] = MI[m + I4];
    MI[m + I4] = 0;
  }
}
export function mps_school(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'School');
  i++;
  mps_store_title(i++, 'Lessons Learned');
  mps_store_f(i++, MI[m + I3] * 100.0 / C.MAX_TECH_LEVEL);
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I1] * 100.0 / C.MAX_JOBS_AT_SCHOOL);
  mps_store_sfp(i++, 'Goods', MI[m + I2] * 100.0 / C.MAX_GOODS_AT_SCHOOL);
  mps_store_sfp(i++, 'Capacity', MI[m + I5] * 4);
}

/* ---- shanty.c ---- */
function add_a_shanty(): void {
  let x = rand() % C.WORLD_SIDE_LEN;
  let y = rand() % C.WORLD_SIDE_LEN;
  let r: number;
  if (G.numof_shanties > 0 && rand() % 8 !== 0) {
    r = spiral_find_group(x, y, C.GROUP_SHANTY);
    if (r === -1) {
      console.log(`Looked for a shanty, without any! x=${x} y=${y}`);
      return;
    }
    y = idiv(r, C.WORLD_SIDE_LEN);
    x = r % C.WORLD_SIDE_LEN;
    r = spiral_find_2x2(x, y);
    if (r === -1) return;
    y = idiv(r, C.WORLD_SIDE_LEN);
    x = r % C.WORLD_SIDE_LEN;
  } else {
    r = spiral_find_group(x, y, C.GROUP_MARKET);
    if (r === -1) return;
    y = idiv(r, C.WORLD_SIDE_LEN);
    x = r % C.WORLD_SIDE_LEN;
    r = spiral_find_2x2(x, y);
    if (r === -1) return;
    y = idiv(r, C.WORLD_SIDE_LEN);
    x = r % C.WORLD_SIDE_LEN;
  }
  set_mappoint(x, y, C.CST_SHANTY);
  G.numof_shanties++;
}
function remove_a_shanty(): void {
  if (G.numof_shanties <= 0) return;
  let x = rand() % C.WORLD_SIDE_LEN;
  let y = rand() % C.WORLD_SIDE_LEN;
  const r = spiral_find_group(x, y, C.GROUP_SHANTY);
  if (r === -1) {
    console.log("Can't find a shanty to remove! ?");
    return;
  }
  y = idiv(r, C.WORLD_SIDE_LEN);
  x = r % C.WORLD_SIDE_LEN;
  fire_area(x, y);
  MI[b_(x, y) + I2] = C.FIRE_LENGTH + 1;
  MI[b_(x + 1, y) + I2] = C.FIRE_LENGTH + 1;
  MI[b_(x, y + 1) + I2] = C.FIRE_LENGTH + 1;
  MI[b_(x + 1, y + 1) + I2] = C.FIRE_LENGTH + 1;
}
export function update_shanty(): void {
  const pp = G.people_pool - C.COMMUNE_POP * G.numof_communes;
  const i = idiv(pp - C.SHANTY_MIN_PP, C.SHANTY_POP);
  if (i > G.numof_shanties) add_a_shanty();
  else if (G.numof_shanties > 0 && i < G.numof_shanties - 1) remove_a_shanty();
  else if (G.numof_shanties > 0 && rand() % 100 === 10) remove_a_shanty();
}
export function do_shanty(x: number, y: number): void {
  get_food(x, y, C.SHANTY_GET_FOOD);
  if (get_goods(x, y, C.SHANTY_GET_GOODS) !== 0) {
    if ((G.goods_tax -= C.SHANTY_GET_GOODS * 2) < 0) G.goods_tax = 0;
  }
  get_ore(x, y, C.SHANTY_GET_ORE);
  get_steel(x, y, C.SHANTY_GET_STEEL);
  if (get_jobs(x, y, C.SHANTY_GET_JOBS) !== 0) {
    if ((G.income_tax -= C.SHANTY_GET_JOBS * 2) < 0) G.income_tax = 0;
  }
  if (get_coal(x, y, C.SHANTY_GET_COAL) !== 0) {
    if ((G.coal_tax -= C.SHANTY_GET_COAL * 2) < 0) G.coal_tax = 0;
  }
  if ((G.total_time & 1) === 0) MPOL[pol(x, y)]++;
  else MPOL[pol(x + 1, y + 1)]++;
}

/* ---- tip.c ---- */
export function do_tip(x: number, y: number): void {
  const m = b_(x, y);
  if (MT[pol(x, y)] === C.CST_TIP_8) {
    MI[m + I4]++;
    if (MI[m + I4] >= C.TIP_DEGRADE_TIME) do_bulldoze_area(C.CST_GREEN, x, y);
    return;
  }
  const take = (t: number): void => {
    const i = idiv(MI[t + I7], 10);
    MI[m + I1] += i;
    MI[m + I2] += i;
    MI[t + I7] -= i * 10;
    G.sust_dig_ore_coal_tip_flag = 0;
  };
  if (x > 0 && (MI[b_(x - 1, y) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0) take(b_(x - 1, y));
  if (y > 0 && (MI[b_(x, y - 1) + FLAGS] & C.FLAG_IS_TRANSPORT) !== 0) take(b_(x, y - 1));
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === 0) {
    let i = idiv(Math.imul(MI[m + I1], 7), C.MAX_WASTE_AT_TIP);
    if (MI[m + I1] > 0) i++;
    const types = [C.CST_TIP_0, C.CST_TIP_1, C.CST_TIP_2, C.CST_TIP_3, C.CST_TIP_4, C.CST_TIP_5, C.CST_TIP_6, C.CST_TIP_7];
    if (i >= 0 && i <= 7) MT[pol(x, y)] = types[i];
    else if (i === 8) {
      MT[pol(x, y)] = C.CST_TIP_8;
      MI[m + I2] = 0;
      MI[m + I4] = 0;
    }
    MI[m + I3] = MI[m + I2];
    MI[m + I2] = 0;
  }
}
export function mps_tip(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'Landfill');
  i++;
  mps_store_title(i++, 'Last Month');
  mps_store_sd(i++, 'Tons', MI[m + I3]);
  mps_store_sfp(i++, 'Percent', MI[m + I3] * 100.0 / C.MAX_WASTE_AT_TIP);
  i++;
  mps_store_title(i++, '% Filled');
  mps_store_fp(i++, MI[m + I1] * 100.0 / C.MAX_WASTE_AT_TIP);
}

/* ---- university.c ---- */
export function do_university(x: number, y: number): void {
  const m = b_(x, y);
  if (MI[m + I1] < C.UNIVERSITY_JOBS_STORE) {
    if (get_jobs(x, y, C.UNIVERSITY_JOBS + 10) !== 0) MI[m + I1] += C.UNIVERSITY_JOBS + 10;
  }
  if (MI[m + I2] < C.UNIVERSITY_GOODS_STORE) {
    if (get_goods(x, y, C.UNIVERSITY_GOODS + 10) !== 0) MI[m + I2] += C.UNIVERSITY_GOODS + 10;
    else if (get_goods(x, y, idiv(C.UNIVERSITY_GOODS, 5)) !== 0) MI[m + I2] += idiv(C.UNIVERSITY_GOODS, 5);
    else if (get_goods(x, y, idiv(C.UNIVERSITY_GOODS, 20)) !== 0) MI[m + I2] += idiv(C.UNIVERSITY_GOODS, 20);
  }
  if (MI[m + I1] >= C.UNIVERSITY_JOBS && MI[m + I2] >= C.UNIVERSITY_GOODS) {
    MI[m + I1] -= C.UNIVERSITY_JOBS;
    MI[m + I2] -= C.UNIVERSITY_GOODS;
    G.goods_used += C.UNIVERSITY_GOODS;
    if (G.university_intake_rate >= G.total_time % 100) {
      MI[m + I3] += C.UNIVERSITY_TECH_MADE;
      G.tech_level += C.UNIVERSITY_TECH_MADE;
      MI[m + I4]++;
    }
  }
  if (G.total_time % 100 === 0) {
    MI[m + I5] = MI[m + I4];
    MI[m + I4] = 0;
  }
  G.university_cost += C.UNIVERSITY_RUNNING_COST;
}
export function mps_university(x: number, y: number): void {
  let i = 0;
  const m = b_(x, y);
  mps_store_title(i++, 'University');
  i++;
  mps_store_title(i++, 'Tech Produced');
  mps_store_title(i++, snprintf(12, '%6.1f', MI[m + I3] * 100.0 / C.MAX_TECH_LEVEL));
  i++;
  mps_store_title(i++, 'Inventory');
  mps_store_sfp(i++, 'Jobs', MI[m + I1] * 100.0 / C.UNIVERSITY_JOBS_STORE);
  mps_store_sfp(i++, 'Goods', MI[m + I2] * 100.0 / C.UNIVERSITY_GOODS_STORE);
  mps_store_sfp(i++, 'Capacity', MI[m + I4]);
}
