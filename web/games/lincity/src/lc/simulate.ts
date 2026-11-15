// simulate.c: one day of the city (do_time_step), the monthly and yearly updates, and a new city
// (the river, coal and ore, the random village).
import * as C from './consts.ts';
import { G, mappoint_array_x, mappoint_array_y, marketx, markety } from './g.ts';
import { MT, MG, MI, MPOL, P, IX, POP, FLAGS, I1, I2, I3, I4, I5, I6, I7, setCoalReserve, coalReserve,
  setOreReserve } from './map.ts';
import { rand, f32, toInt, idiv, abs } from './c.ts';
import { get_group_of_type } from './lintypes.ts';
import { set_mappoint_used, connect_transport } from './shrtypes.ts';
import { power_time_step, map_power_grid } from './power.ts';
import { init_daily, init_monthly, init_yearly, add_daily_to_monthly, init_inventory } from './stats.ts';
import { shuffle_mappoint_array, do_random_fire, clear_fire_health_and_cricket_cover,
  do_fire_health_and_cricket_cover, do_pollution } from './engine.ts';
import { do_market } from './market.ts';
import * as M from './modules.ts';
import { print_total_money } from './screen.ts';
import { init_pbars, update_pbar, refresh_pbars } from './pbar.ts';
import { update_avail_modules } from './module_buttons.ts';

export function do_time_step(): void {
  G.total_time++;
  init_daily();
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === 0) init_monthly();
  if (G.total_time % C.NUMOF_DAYS_IN_YEAR === 0) init_yearly();
  power_time_step();
  simulate_mappoints();
  do_periodic_events();
}

export function clear_mappoint(fill: number, x: number, y: number): void {
  MT[P(x, y)] = fill;
  MG[P(x, y)] = get_group_of_type(fill);
  if (MG[P(x, y)] < 0) MG[P(x, y)] = C.GROUP_BARE;
  const b = IX(x, y);
  MI[b + POP] = 0;
  MI[b + FLAGS] = 0;
  MI[b + I1] = 0; MI[b + I2] = 0; MI[b + I3] = 0; MI[b + I4] = 0; MI[b + I5] = 0; MI[b + I6] = 0; MI[b + I7] = 0;
}

function simulate_mappoints(): void {
  shuffle_mappoint_array();
  for (let yy = 0; yy < C.WORLD_SIDE_LEN; yy++) {
    const y = mappoint_array_y[yy];
    for (let xx = 0; xx < C.WORLD_SIDE_LEN; xx++) {
      const x = mappoint_array_x[xx];
      const grp = MG[P(x, y)];
      if (grp === C.GROUP_USED || grp === C.GROUP_BARE) continue;
      switch (grp) {
        case C.GROUP_TRACK: M.do_track(x, y); break;
        case C.GROUP_RAIL: M.do_rail(x, y); break;
        case C.GROUP_ROAD: M.do_road(x, y); break;
        case C.GROUP_ORGANIC_FARM: M.do_organic_farm(x, y); break;
        case C.GROUP_MARKET: do_market(x, y); break;
        case C.GROUP_RESIDENCE_LL: case C.GROUP_RESIDENCE_ML: case C.GROUP_RESIDENCE_HL:
        case C.GROUP_RESIDENCE_LH: case C.GROUP_RESIDENCE_MH: case C.GROUP_RESIDENCE_HH:
          M.do_residence(x, y); break;
        case C.GROUP_POWER_LINE: M.do_power_line(x, y); break;
        case C.GROUP_SOLAR_POWER: M.do_power_source(x, y); break;
        case C.GROUP_SUBSTATION: M.do_power_substation(x, y); break;
        case C.GROUP_COALMINE: M.do_coalmine(x, y); break;
        case C.GROUP_COAL_POWER: M.do_power_source_coal(x, y); break;
        case C.GROUP_INDUSTRY_L: M.do_industry_l(x, y); break;
        case C.GROUP_INDUSTRY_H: M.do_industry_h(x, y); break;
        case C.GROUP_COMMUNE: M.do_commune(x, y); break;
        case C.GROUP_OREMINE: M.do_oremine(x, y); break;
        case C.GROUP_PORT: M.do_port(x, y); break;
        case C.GROUP_TIP: M.do_tip(x, y); break;
        case C.GROUP_PARKLAND: M.do_parkland(x, y); break;
        case C.GROUP_UNIVERSITY: M.do_university(x, y); break;
        case C.GROUP_RECYCLE: M.do_recycle(x, y); break;
        case C.GROUP_HEALTH: M.do_health_centre(x, y); break;
        case C.GROUP_ROCKET: M.do_rocket_pad(x, y); break;
        case C.GROUP_WINDMILL: M.do_windmill(x, y); break;
        case C.GROUP_MONUMENT: M.do_monument(x, y); break;
        case C.GROUP_SCHOOL: M.do_school(x, y); break;
        case C.GROUP_BLACKSMITH: M.do_blacksmith(x, y); break;
        case C.GROUP_MILL: M.do_mill(x, y); break;
        case C.GROUP_POTTERY: M.do_pottery(x, y); break;
        case C.GROUP_FIRESTATION: M.do_firestation(x, y); break;
        case C.GROUP_CRICKET: M.do_cricket(x, y); break;
        case C.GROUP_FIRE: M.do_fire(x, y); break;
        case C.GROUP_SHANTY: M.do_shanty(x, y); break;
      }
    }
  }
}

function do_periodic_events(): void {
  add_daily_to_monthly();
  if (G.total_time % C.NUMOF_DAYS_IN_YEAR === 0) start_of_year_update();
  if (G.total_time % C.DAYS_BETWEEN_FIRES === 9 && G.tech_level > idiv(C.GROUP_FIRESTATION_TECH * C.MAX_TECH_LEVEL, 1000)) {
    do_random_fire(-1, -1, 1);
  }
  if (G.total_time % C.DAYS_BETWEEN_COVER === 75) {
    clear_fire_health_and_cricket_cover();
    do_fire_health_and_cricket_cover();
  }
  if (G.total_time % C.DAYS_BETWEEN_SHANTY === 85 && G.tech_level > idiv(C.GROUP_HEALTH_TECH * C.MAX_TECH_LEVEL, 1000)) {
    M.update_shanty();
  }
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === C.NUMOF_DAYS_IN_MONTH - 1) end_of_month_update();
  if (G.total_time % C.NUMOF_DAYS_IN_YEAR === C.NUMOF_DAYS_IN_YEAR - 1) end_of_year_update();
  if (G.total_time % C.DAYS_PER_POLLUTION === 3) do_pollution();
}

function end_of_month_update(): void {
  G.housed_population = idiv(G.tpopulation, C.NUMOF_DAYS_IN_MONTH);
  if (G.housed_population + G.people_pool > G.max_pop_ever) G.max_pop_ever = G.housed_population + G.people_pool;
  if (G.people_pool > 100) {
    if (rand() % 1000 < G.people_pool) G.people_pool -= 10;
  }
  if (G.people_pool < 0) G.people_pool = 0;
  if (G.tech_level > C.TECH_LEVEL_LOSS_START) {
    // tech_level -= tech_level * (1./TECH_LEVEL_LOSS) * (1 + (tpopulation * (1./NUMOF_DAYS_IN_MONTH/120/(TECH_LEVEL_LOSS-200))))
    G.tech_level = toInt(G.tech_level - G.tech_level * (1 / C.TECH_LEVEL_LOSS)
      * (1 + (G.tpopulation * (1 / C.NUMOF_DAYS_IN_MONTH / 120 / (C.TECH_LEVEL_LOSS - 200)))));
  } else G.tech_level += C.TECH_LEVEL_UNAIDED;
  if (G.tech_level > C.MAX_TECH_LEVEL) {
    G.tech_level = toInt(G.tech_level - (G.tech_level - C.MAX_TECH_LEVEL) * (1 / C.TECH_LEVEL_LOSS)
      * (1 + (G.tpopulation * (1 / C.NUMOF_DAYS_IN_MONTH / 120 / (C.TECH_LEVEL_LOSS - 100)))));
  }
  if (G.highest_tech_level < G.tech_level) G.highest_tech_level = G.tech_level;
  G.deaths_cost = (G.deaths_cost + Math.imul(G.unnat_deaths, C.UNNAT_DEATHS_COST)) | 0;
}

function start_of_year_update(): void {
  sustainability_test();
  // float -= float / 100.0: computed in double, stored as float
  G.pollution_deaths_history = f32(G.pollution_deaths_history - G.pollution_deaths_history / 100.0);
  G.starve_deaths_history = f32(G.starve_deaths_history - G.starve_deaths_history / 100.0);
  G.unemployed_history = f32(G.unemployed_history - G.unemployed_history / 100.0);
  const u = count_groups(C.GROUP_UNIVERSITY);
  if (u > 0) {
    G.university_intake_rate = idiv(count_groups(C.GROUP_SCHOOL) * 20, u);
    if (G.university_intake_rate > 100) G.university_intake_rate = 100;
  } else G.university_intake_rate = 50;
  map_power_grid();
}

function end_of_year_update(): void {
  G.income_tax = idiv(Math.imul(G.income_tax, G.income_tax_rate), 100);
  G.ly_income_tax = G.income_tax;
  G.total_money = (G.total_money + G.income_tax) | 0;
  G.coal_tax = idiv(Math.imul(G.coal_tax, G.coal_tax_rate), 100);
  G.ly_coal_tax = G.coal_tax;
  G.total_money = (G.total_money + G.coal_tax) | 0;
  G.goods_tax = idiv(Math.imul(G.goods_tax, G.goods_tax_rate), 100);
  // (int) ((float) (goods_tax * goods_tax_rate) * (float) tech_level / 2000000.0)
  G.goods_tax = (G.goods_tax + toInt(f32(f32(Math.imul(G.goods_tax, G.goods_tax_rate)) * f32(G.tech_level)) / 2000000.0)) | 0;
  G.ly_goods_tax = G.goods_tax;
  G.total_money = (G.total_money + G.goods_tax) | 0;
  if (G.export_tax > C.EX_DISCOUNT_TRIGGER_1) {
    let discount = 0;
    const dis = [C.EX_DISCOUNT_TRIGGER_1, C.EX_DISCOUNT_TRIGGER_2, C.EX_DISCOUNT_TRIGGER_3, C.EX_DISCOUNT_TRIGGER_4,
      C.EX_DISCOUNT_TRIGGER_5, C.EX_DISCOUNT_TRIGGER_6];
    for (let disi = 0; disi < C.NUMOF_DISCOUNT_TRIGGERS && G.export_tax > dis[disi]; disi++) {
      discount += idiv(G.export_tax - dis[disi], 10);
    }
    G.export_tax -= discount;
  }
  G.ly_export_tax = G.export_tax;
  G.total_money = (G.total_money + G.export_tax) | 0;
  G.ly_university_cost = G.university_cost;
  G.ly_recycle_cost = G.recycle_cost;
  G.ly_deaths_cost = G.deaths_cost;
  G.ly_health_cost = idiv(Math.imul(Math.imul(G.health_cost, idiv(G.tech_level, 10000)), C.HEALTH_RUNNING_COST_MUL),
    idiv(C.MAX_TECH_LEVEL, 10000));
  G.ly_rocket_pad_cost = G.rocket_pad_cost;
  G.ly_school_cost = G.school_cost;
  G.ly_windmill_cost = G.windmill_cost;
  G.ly_fire_cost = idiv(Math.imul(Math.imul(G.fire_cost, idiv(G.tech_level, 10000)), C.FIRESTATION_RUNNING_COST_MUL),
    idiv(C.MAX_TECH_LEVEL, 10000));
  G.ly_cricket_cost = G.cricket_cost;
  if (G.total_money < 0) {
    G.ly_interest = Math.imul(idiv(-G.total_money, 1000), C.INTEREST_RATE);
    if (G.ly_interest > 1000000) G.ly_interest = 1000000;
  } else G.ly_interest = 0;
  G.other_cost = (G.university_cost + G.recycle_cost + G.deaths_cost + G.ly_health_cost + G.rocket_pad_cost
    + G.school_cost + G.ly_interest + G.windmill_cost + G.ly_fire_cost + G.ly_cricket_cost) | 0;
  G.ly_other_cost = G.other_cost;
  G.total_money = (G.total_money - G.other_cost) | 0;
  G.unemployment_cost = idiv(Math.imul(G.unemployment_cost, G.dole_rate), 100);
  G.ly_unemployment_cost = G.unemployment_cost;
  G.total_money = (G.total_money - G.unemployment_cost) | 0;
  G.transport_cost = idiv(Math.imul(G.transport_cost, G.transport_cost_rate), 100);
  G.ly_transport_cost = G.transport_cost;
  G.total_money = (G.total_money - G.transport_cost) | 0;
  G.import_cost = idiv(Math.imul(G.import_cost, G.import_cost_rate), 100);
  G.ly_import_cost = G.import_cost;
  G.total_money = (G.total_money - G.import_cost) | 0;
  if (G.total_money > 2000000000) G.total_money = 2000000000;
  else if (G.total_money < -2000000000) G.total_money = -2000000000;
  print_total_money();
}

function clear_game(): void {
  for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
    for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
      clear_mappoint(C.CST_GREEN, x, y);
      MPOL[P(x, y)] = 0;
    }
  }
  G.total_time = 0;
  G.coal_survey_done = 0;
  G.numof_shanties = 0;
  G.numof_communes = 0;
  G.numof_substations = 0;
  G.numof_health_centres = 0;
  G.numof_markets = 0;
  G.max_pop_ever = 0;
  G.total_evacuated = 0;
  G.total_births = 0;
  G.total_money = 0;
  G.tech_level = 0;
  init_inventory();
  update_avail_modules(0);
}

/** returns the new origin */
export function new_city(random_village: number): [number, number] {
  let origin: [number, number];
  clear_game();
  coal_reserve_setup();
  setup_river();
  ore_reserve_setup();
  init_pbars();
  G.people_pool = 100;
  if (random_village !== 0) {
    origin = random_start();
    update_pbar(C.PPOP, 200, 1);
  } else {
    origin = [C.WORLD_SIDE_LEN / 2, C.WORLD_SIDE_LEN / 2];
    update_pbar(C.PPOP, 100, 1);
  }
  connect_transport(1, 1, C.WORLD_SIDE_LEN - 2, C.WORLD_SIDE_LEN - 2);
  refresh_pbars();
  return origin;
}

export function coal_reserve_setup(): void {
  for (let i = 0; i < idiv(C.NUMOF_COAL_RESERVES, 5); i++) {
    let x = (rand() % (C.WORLD_SIDE_LEN - 12)) + 6;
    let y = (rand() % (C.WORLD_SIDE_LEN - 10)) + 6;
    let xx: number, yy: number;
    do {
      xx = (rand() % 3) - 1;
      yy = (rand() % 3) - 1;
    } while (xx === 0 && yy === 0);
    for (let j = 0; j < 5; j++) {
      setCoalReserve(x, y, (coalReserve(x, y) + rand() % C.COAL_RESERVE_SIZE) & 0xffff);
      x += xx;
      y += yy;
    }
  }
}

export function ore_reserve_setup(): void {
  for (let y = 0; y < C.WORLD_SIDE_LEN; y++) for (let x = 0; x < C.WORLD_SIDE_LEN; x++) setOreReserve(x, y, C.ORE_RESERVE);
}

function river(x: number, y: number): void {
  MT[P(x, y)] = C.CST_WATER;
  MG[P(x, y)] = C.GROUP_WATER;
  MI[IX(x, y) + FLAGS] |= C.FLAG_IS_RIVER;
}

export function setup_river(): void {
  let x = C.WORLD_SIDE_LEN / 2;
  let y = C.WORLD_SIDE_LEN - 1;
  const i = (rand() % 12) + 6;
  for (let j = 0; j < i; j++) {
    x += (rand() % 3) - 1;
    river(x, y);
    river(x + 1, y);
    river(x - 1, y);
    y--;
  }
  river(x, y);
  river(x + 1, y);
  river(x - 1, y);
  setup_river2(x - 1, y, -1);
  setup_river2(x + 1, y, 1);
}

function setup_river2(x: number, y: number, d: number): void {
  const i = (rand() % 55) + 15;
  for (let j = 0; j < i; j++) {
    let r = (rand() % 3) - 1 + d * (rand() % 3);
    if (r < -1) r = -1;
    else if (r > 1) r = 1;
    x += r;
    if (MT[P(x + (d + d), y)] !== 0 || MT[P(x + (d + d + d), y)] !== 0) return;
    if (x > 5 && x < C.WORLD_SIDE_LEN - 5) {
      river(x, y);
      MT[P(x + d, y)] = C.CST_WATER;
      MG[P(x + d, y)] = C.GROUP_WATER;
      MI[IX(x + d, y) + FLAGS] |= C.FLAG_IS_RIVER;
    }
    if (--y < 10 || x < 5 || x > C.WORLD_SIDE_LEN - 5) break;
  }
  if (y > 20) {
    if (x > 5 && x < C.WORLD_SIDE_LEN - 5) setup_river2(x, y, -1);
    if (x > 5 && x < C.WORLD_SIDE_LEN - 5) setup_river2(x, y, 1);
  }
}

export function count_groups(g: number): number {
  let i = 0;
  for (let y = 0; y < C.WORLD_SIDE_LEN; y++) for (let x = 0; x < C.WORLD_SIDE_LEN; x++) if (MG[P(x, y)] === g) i++;
  return i;
}

export function count_all_groups(): Int32Array {
  const group_count = new Int32Array(C.NUM_OF_GROUPS);
  for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
    for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
      const t = MT[P(x, y)];
      if (t !== C.CST_USED && t !== C.CST_GREEN) group_count[get_group_of_type(t)]++;
    }
  }
  return group_count;
}

function random_start(): [number, number] {
  let xx = 0, yy = 0, flag: number;
  let watchdog = 90;
  do {
    do {
      xx = rand() % (C.WORLD_SIDE_LEN - 25);
      yy = rand() % (C.WORLD_SIDE_LEN - 25);
      flag = 0;
      search: for (let y = yy + 2; y < yy + 23; y++) {
        for (let x = xx + 2; x < xx + 23; x++) {
          if (MG[P(x, y)] === C.GROUP_WATER) {
            flag = 1;
            break search;
          }
        }
      }
    } while (flag === 0 || (--watchdog) < 1);
    search2: for (let y = yy + 4; y < yy + 22; y++) {
      for (let x = xx + 4; x < xx + 22; x++) {
        if (MG[P(x, y)] !== C.GROUP_BARE) {
          flag = 0;
          break search2;
        }
      }
    }
  } while (flag === 0 || (--watchdog) < 1);

  quick_start_add(xx + 5, yy + 5, C.CST_FARM_O0, 4);
  quick_start_add(xx + 9, yy + 6, C.CST_RESIDENCE_ML, 3);
  MI[IX(xx + 9, yy + 6) + POP] = 50;
  MI[IX(xx + 9, yy + 6) + FLAGS] |= C.FLAG_FED + C.FLAG_EMPLOYED;
  quick_start_add(xx + 7, yy + 9, C.CST_MARKET_EMPTY, 2);
  marketx[G.numof_markets] = xx + 7;
  markety[G.numof_markets] = yy + 9;
  G.numof_markets++;
  const allFlags = C.FLAG_MB_FOOD + C.FLAG_MS_FOOD + C.FLAG_MB_JOBS + C.FLAG_MS_JOBS + C.FLAG_MB_COAL + C.FLAG_MS_COAL
    + C.FLAG_MB_ORE + C.FLAG_MS_ORE + C.FLAG_MB_GOODS + C.FLAG_MS_GOODS + C.FLAG_MB_STEEL + C.FLAG_MS_STEEL;
  let b = IX(xx + 7, yy + 9);
  MI[b + I1] = 2000;
  MI[b + I2] = 10000;
  MI[b + I3] = 100;
  MI[b + I5] = 10000;
  MI[b + FLAGS] |= allFlags;
  quick_start_add(xx + 14, yy + 6, C.CST_RESIDENCE_ML, 3);
  MI[IX(xx + 14, yy + 6) + POP] = 50;
  MI[IX(xx + 14, yy + 6) + FLAGS] |= C.FLAG_FED + C.FLAG_EMPLOYED;
  quick_start_add(xx + 17, yy + 5, C.CST_FARM_O0, 4);
  quick_start_add(xx + 17, yy + 9, C.CST_MARKET_EMPTY, 2);
  marketx[G.numof_markets] = xx + 17;
  markety[G.numof_markets] = yy + 9;
  G.numof_markets++;
  b = IX(xx + 17, yy + 9);
  MI[b + I1] = 2000;
  MI[b + I2] = 8000;
  MI[b + FLAGS] |= allFlags;
  const track = (x: number, y: number): void => {
    quick_start_add(x, y, C.CST_TRACK_LR, 1);
    MI[IX(x, y) + FLAGS] |= C.FLAG_IS_TRANSPORT;
  };
  for (let x = 5; x < 19; x++) track(xx + x, yy + 11);
  for (let y = 12; y < 18; y++) track(xx + 5, yy + y);
  quick_start_add(xx + 6, yy + 12, C.CST_COMMUNE_1, 4);
  quick_start_add(xx + 6, yy + 17, C.CST_COMMUNE_1, 4);
  quick_start_add(xx + 11, yy + 12, C.CST_COMMUNE_1, 4);
  quick_start_add(xx + 11, yy + 17, C.CST_COMMUNE_1, 4);
  quick_start_add(xx + 16, yy + 12, C.CST_COMMUNE_1, 4);
  quick_start_add(xx + 16, yy + 17, C.CST_COMMUNE_1, 4);
  for (let x = 6; x < 17; x++) track(xx + x, yy + 16);
  for (let y = 12; y < 16; y++) {
    track(xx + 10, yy + y);
    track(xx + 15, yy + y);
  }
  track(xx + 10, yy + 17);
  track(xx + 15, yy + 17);
  quick_start_add(xx + 9, yy + 9, C.CST_POTTERY_0, 2);
  return [xx, yy];
}

function quick_start_add(x: number, y: number, type: number, size: number): void {
  if (size === 1) {
    MT[P(x, y)] = type;
    MG[P(x, y)] = get_group_of_type(type);
    return;
  }
  for (let yy = 0; yy < size; yy++) {
    for (let xx = 0; xx < size; xx++) {
      if (xx === 0 && yy === 0) continue;
      set_mappoint_used(x, y, x + xx, y + yy);
    }
  }
  MT[P(x, y)] = type;
  MG[P(x, y)] = get_group_of_type(type);
}

export function sustainability_test(): void {
  if (G.sust_dig_ore_coal_tip_flag === 0) {
    G.sust_dig_ore_coal_tip_flag = 1;
    G.sust_dig_ore_coal_count = 0;
  } else G.sust_dig_ore_coal_count++;
  if (G.sust_port_flag === 0) {
    G.sust_port_flag = 1;
    G.sust_port_count = 0;
  } else G.sust_port_count++;
  if (G.sust_old_money > G.total_money) G.sust_old_money_count = 0;
  else G.sust_old_money_count++;
  G.sust_old_money = G.total_money;
  let i = G.housed_population + G.people_pool - G.sust_old_population;
  if (abs(i) > idiv(G.sust_old_population, 40) || G.housed_population + G.people_pool < C.SUST_MIN_POPULATION) {
    G.sust_old_population = G.housed_population + G.people_pool;
    G.sust_old_population_count = 0;
  } else G.sust_old_population_count++;
  i = G.tech_level - G.sust_old_tech;
  if (i < 0 || G.tech_level < C.SUST_MIN_TECH_LEVEL) {
    i = -i;
    if (i > idiv(G.sust_old_tech, 100) || G.tech_level < C.SUST_MIN_TECH_LEVEL) {
      G.sust_old_tech_count = 0;
      G.sust_old_tech = G.tech_level;
    } else G.sust_old_tech_count++;
  } else {
    G.sust_old_tech_count++;
    G.sust_old_tech = G.tech_level;
  }
  if (G.total_time % (C.NUMOF_DAYS_IN_YEAR * 3) === 0) {
    if (sust_fire_cover() !== 0) G.sust_fire_count += 3;
    else G.sust_fire_count = 0;
  }
}

function sust_fire_cover(): number {
  for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
    for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
      const g = MG[P(x, y)];
      if (g === C.GROUP_BARE || MT[P(x, y)] === C.CST_USED || g === C.GROUP_WATER || g === C.GROUP_POWER_LINE
        || g === C.GROUP_OREMINE || g === C.GROUP_ROCKET || g === C.GROUP_MONUMENT || g === C.GROUP_BURNT) {
        // nothing
      } else if ((MI[IX(x, y) + FLAGS] & C.FLAG_FIRE_COVER) === 0) return 0;
    }
  }
  return 1;
}

export function initialize_tax_rates(): void {
  G.income_tax_rate = C.INCOME_TAX_RATE;
  G.coal_tax_rate = C.COAL_TAX_RATE;
  G.goods_tax_rate = C.GOODS_TAX_RATE;
  G.dole_rate = C.DOLE_RATE;
  G.transport_cost_rate = C.TRANSPORT_COST_RATE;
  G.import_cost_rate = C.IM_PORT_COST_RATE;
}
