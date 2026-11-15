// ldsvguts.c: saving and loading a city: the original's text format (one number per line, the map
// points as raw bytes), gzipped.
import * as C from './consts.ts';
import { G, scr, substationx, substationy, marketx, markety, MG_ARR, module_help_flag, sbut, PATHS } from './g.ts';
import { MT, MG, MI, MPOL, mapBytes, P, IX } from './map.ts';
import { sscanf, idiv } from './c.ts';
import { fopen, fopenReadGzipped, fileExists, gzipMove, remove as removeFile, type CFile } from './stdio.ts';
import { prog_box, ok_dial_box, print_time_for_year, print_total_money } from './screen.ts';
import { init_pbars, update_pbar, pbars } from './pbar.ts';
import { init_inventory, inventory } from './stats.ts';
import { get_group_of_type, set_map_groups } from './lintypes.ts';
import { count_groups } from './simulate.ts';
import { update_tech_dep } from './engine.ts';
import { unhighlight_module_button, highlight_module_button, set_selected_module } from './module_buttons.ts';
import { map_power_grid } from './power.ts';
import { do_error } from './main.ts';

export function remove_scene(cname: string): void {
  if (cname.length < 2) return;
  const path = `${PATHS.lc_save_dir}/${cname}`;
  if (fileExists(path)) removeFile(path);
}

function save_city_raw(cname: string): void {
  const ofile = fopen(cname, 'w');
  if (!ofile) {
    do_error("Can't open save file!");
    return;
  }
  ofile.fprintf('%d\n', C.VERSION_INT);
  prog_box('Saving scene', 0);
  for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
    for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
      const base = 80000 + IX(x, y) * 4;
      let s = '';
      // population, flags (4 bytes each), coal_reserve, ore_reserve (2 each), int_1..int_7 (4 each)
      for (let z = 0; z < 40; z++) s += `${mapBytes[base + z]}\n`;
      ofile.fputs(s);
      ofile.fprintf('%d\n', MPOL[P(x, y)]);
      ofile.fprintf('%d\n', MT[P(x, y)]);
    }
    prog_box('', idiv(90 * x, C.WORLD_SIDE_LEN));
  }
  ofile.fprintf('%d\n', G.main_screen_originx);
  ofile.fprintf('%d\n', G.main_screen_originy);
  ofile.fprintf('%d\n', G.total_time);
  for (let x = 0; x < C.MAX_NUMOF_SUBSTATIONS; x++) {
    ofile.fprintf('%d\n', substationx[x]);
    ofile.fprintf('%d\n', substationy[x]);
  }
  prog_box('', 92);
  ofile.fprintf('%d\n', G.numof_substations);
  for (let x = 0; x < C.MAX_NUMOF_MARKETS; x++) {
    ofile.fprintf('%d\n', marketx[x]);
    ofile.fprintf('%d\n', markety[x]);
  }
  prog_box('', 94);
  for (const v of [G.numof_markets, G.people_pool, G.total_money, G.income_tax_rate, G.coal_tax_rate, G.dole_rate,
    G.transport_cost_rate, G.goods_tax_rate, G.export_tax, G.export_tax_rate, G.import_cost, G.import_cost_rate,
    G.tech_level, G.tpopulation, G.tstarving_population, G.tunemployed_population, 0, G.power_made, G.power_used,
    G.coal_made, G.coal_used, G.goods_made, G.goods_used, G.ore_made, G.ore_used, 0]) ofile.fprintf('%d\n', v);
  prog_box('', 96);
  ofile.fprintf('%d\n', G.monthgraph_size);
  for (let x = 0; x < G.monthgraph_size; x++) {
    ofile.fprintf('%d\n', MG_ARR.monthgraph_pop[x]);
    ofile.fprintf('%d\n', MG_ARR.monthgraph_starve[x]);
    ofile.fprintf('%d\n', MG_ARR.monthgraph_nojobs[x]);
    ofile.fprintf('%d\n', MG_ARR.monthgraph_ppool[x]);
  }
  prog_box('', 98);
  ofile.fprintf('%d\n', G.rockets_launched);
  ofile.fprintf('%d\n', G.rockets_launched_success);
  ofile.fprintf('%d\n', G.coal_survey_done);
  for (let x = 0; x < C.PBAR_DATA_SIZE; x++) for (let p = 0; p < C.NUM_PBARS; p++) ofile.fprintf('%d\n', pbars[p].data[x]);
  prog_box('', 99);
  for (let p = 0; p < C.NUM_PBARS; p++) {
    ofile.fprintf('%d\n', pbars[p].oldtot);
    ofile.fprintf('%d\n', pbars[p].diff);
  }
  ofile.fprintf('%d\n', G.cheat_flag);
  ofile.fprintf('%d\n', G.total_pollution_deaths);
  ofile.fprintf('%f\n', G.pollution_deaths_history);
  ofile.fprintf('%d\n', G.total_starve_deaths);
  ofile.fprintf('%f\n', G.starve_deaths_history);
  ofile.fprintf('%d\n', G.total_unemployed_years);
  ofile.fprintf('%f\n', G.unemployed_history);
  ofile.fprintf('%d\n', G.max_pop_ever);
  ofile.fprintf('%d\n', G.total_evacuated);
  ofile.fprintf('%d\n', G.total_births);
  for (let x = 0; x < C.NUMOF_MODULES; x++) ofile.fprintf('%d\n', module_help_flag[x]);
  ofile.fprintf('%d\n', 0);
  ofile.fprintf('%d\n', 0);
  if (PATHS.given_scene.length > 1) ofile.fprintf('%s\n', PATHS.given_scene);
  else ofile.fprintf('dummy\n');
  ofile.fprintf('%d\n', G.highest_tech_level);
  ofile.fprintf('sust %d %d %d %d %d %d %d %d %d %d\n', G.sust_dig_ore_coal_count, G.sust_port_count,
    G.sust_old_money_count, G.sust_old_population_count, G.sust_old_tech_count, G.sust_fire_count,
    G.sust_old_money, G.sust_old_population, G.sust_old_tech, G.sustain_flag);
  for (let i = 4; i <= 10; i++) ofile.fprintf('dummy\n');
  ofile.fclose();
  prog_box('', 100);
}

export function save_city(cname: string): void {
  if (cname.length < 2) return;
  const s = `${PATHS.lc_save_dir}/${cname}`;
  const s2 = `${PATHS.lc_save_dir}/tmp-save`;
  save_city_raw(s2);
  // gzip -f tmp-save; mv tmp-save.gz <name>
  gzipMove(s2, s);
}


export function load_city(cname: string): void {
  const ofile = fopenReadGzipped(cname);
  const vv = ofile.fscanf1('%d');
  const ver = vv === null ? 0 : vv as number;
  if (ver < C.MIN_LOAD_VERSION) {
    ok_dial_box('too-old.mes', C.BAD, null);
    return;
  }
  init_pbars();
  init_inventory();
  print_time_for_year();
  prog_box('Loading scene', 0);
  // fscanf (ofile, "%d", &v): v keeps its value when the conversion fails
  const rd = (old: number): number => {
    const v = ofile.fscanf1('%d');
    return v === null ? old : v as number;
  };
  let n_ = 0;
  const num = (): number => (n_ = rd(n_));
  for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
    for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
      const base = 80000 + IX(x, y) * 4;
      for (let z = 0; z < 40; z++) mapBytes[base + z] = num();
      MPOL[P(x, y)] = num() & 0xffff; // (unsigned short) n
      MT[P(x, y)] = num();
      if (get_group_of_type(MT[P(x, y)]) === C.GROUP_MARKET) inventory(x, y);
    }
    if (idiv(93 * x, C.WORLD_SIDE_LEN) % 3 === 0) prog_box('', idiv(93 * x, C.WORLD_SIDE_LEN));
  }
  set_map_groups();
  G.main_screen_originx = rd(G.main_screen_originx);
  G.main_screen_originy = rd(G.main_screen_originy);
  if (G.main_screen_originx > C.WORLD_SIDE_LEN - idiv(scr.main_win.w, 16) - 1) {
    G.main_screen_originx = C.WORLD_SIDE_LEN - idiv(scr.main_win.w, 16) - 1;
  }
  if (G.main_screen_originy > C.WORLD_SIDE_LEN - idiv(scr.main_win.h, 16) - 1) {
    G.main_screen_originy = C.WORLD_SIDE_LEN - idiv(scr.main_win.h, 16) - 1;
  }
  G.total_time = rd(G.total_time);
  let n = ver <= C.MM_MS_C_VER ? C.OLD_MAX_NUMOF_SUBSTATIONS : C.MAX_NUMOF_SUBSTATIONS;
  for (let x = 0; x < n; x++) {
    substationx[x] = rd(substationx[x]);
    substationy[x] = rd(substationy[x]);
  }
  prog_box('', 92);
  G.numof_substations = rd(G.numof_substations);
  n = ver <= C.MM_MS_C_VER ? C.OLD_MAX_NUMOF_MARKETS : C.MAX_NUMOF_MARKETS;
  for (let x = 0; x < n; x++) {
    marketx[x] = rd(marketx[x]);
    markety[x] = rd(markety[x]);
  }
  prog_box('', 94);
  G.numof_markets = rd(G.numof_markets);
  G.people_pool = rd(G.people_pool);
  G.total_money = rd(G.total_money);
  G.income_tax_rate = rd(G.income_tax_rate);
  G.coal_tax_rate = rd(G.coal_tax_rate);
  G.dole_rate = rd(G.dole_rate);
  G.transport_cost_rate = rd(G.transport_cost_rate);
  G.goods_tax_rate = rd(G.goods_tax_rate);
  G.export_tax = rd(G.export_tax);
  G.export_tax_rate = rd(G.export_tax_rate);
  G.import_cost = rd(G.import_cost);
  G.import_cost_rate = rd(G.import_cost_rate);
  G.tech_level = rd(G.tech_level);
  if (G.tech_level > C.MODERN_WINDMILL_TECH) G.modern_windmill_flag = 1;
  G.tpopulation = rd(G.tpopulation);
  G.tstarving_population = rd(G.tstarving_population);
  G.tunemployed_population = rd(G.tunemployed_population);
  num(); // waste_goods
  G.power_made = rd(G.power_made);
  G.power_used = rd(G.power_used);
  G.coal_made = rd(G.coal_made);
  G.coal_used = rd(G.coal_used);
  G.goods_made = rd(G.goods_made);
  G.goods_used = rd(G.goods_used);
  G.ore_made = rd(G.ore_made);
  G.ore_used = rd(G.ore_used);
  num(); // diff_old_population
  G.housed_population = idiv(G.tpopulation, C.NUMOF_DAYS_IN_MONTH);
  prog_box('', 96);
  const i = ver <= C.MG_C_VER ? 120 : num();
  let x: number;
  for (x = 0; x < i; x++) {
    if (x >= G.monthgraph_size) {
      num(); num(); num(); num();
    } else {
      MG_ARR.monthgraph_pop[x] = rd(MG_ARR.monthgraph_pop[x]);
      MG_ARR.monthgraph_starve[x] = rd(MG_ARR.monthgraph_starve[x]);
      MG_ARR.monthgraph_nojobs[x] = rd(MG_ARR.monthgraph_nojobs[x]);
      MG_ARR.monthgraph_ppool[x] = rd(MG_ARR.monthgraph_ppool[x]);
    }
    if (ver <= C.MG_C_VER) { num(); num(); num(); num(); num(); }
  }
  while (x < G.monthgraph_size) {
    MG_ARR.monthgraph_pop[x] = 0;
    MG_ARR.monthgraph_starve[x] = 0;
    MG_ARR.monthgraph_nojobs[x] = 0;
    MG_ARR.monthgraph_ppool[x] = 0;
    x++;
  }
  prog_box('', 98);
  G.rockets_launched = rd(G.rockets_launched);
  G.rockets_launched_success = rd(G.rockets_launched_success);
  G.coal_survey_done = rd(G.coal_survey_done);
  for (let k = 0; k < C.PBAR_DATA_SIZE; k++) for (let p = 0; p < C.NUM_PBARS; p++) update_pbar(p, num(), 1);
  for (let p = 0; p < C.NUM_PBARS; p++) pbars[p].data_size = C.PBAR_DATA_SIZE;
  prog_box('', 99);
  for (let p = 0; p < C.NUM_PBARS; p++) {
    pbars[p].oldtot = rd(pbars[p].oldtot);
    pbars[p].diff = rd(pbars[p].diff);
  }
  G.cheat_flag = rd(G.cheat_flag);
  G.total_pollution_deaths = rd(G.total_pollution_deaths);
  G.pollution_deaths_history = flt(ofile, G.pollution_deaths_history);
  G.total_starve_deaths = rd(G.total_starve_deaths);
  G.starve_deaths_history = flt(ofile, G.starve_deaths_history);
  G.total_unemployed_years = rd(G.total_unemployed_years);
  G.unemployed_history = flt(ofile, G.unemployed_history);
  G.max_pop_ever = rd(G.max_pop_ever);
  G.total_evacuated = rd(G.total_evacuated);
  G.total_births = rd(G.total_births);
  for (let k = 0; k < C.NUMOF_MODULES; k++) module_help_flag[k] = rd(module_help_flag[k]);
  num();
  num();
  const gs = ofile.fscanf1('%128s');
  if (gs !== null) PATHS.given_scene = gs as string;
  if (PATHS.given_scene.startsWith('dummy') || PATHS.given_scene.length < 3) PATHS.given_scene = '';
  const s = ofile.fscanf1('%128s');
  if (!PATHS.given_scene.startsWith('dummy')) {
    const v = sscanf(s === null ? '' : s as string, '%d');
    if (v.length) G.highest_tech_level = v[0] as number;
  } else G.highest_tech_level = 0;
  ofile.fgets(80);
  const line = ofile.fgets(80) ?? '';
  const v = sscanf(line, 'sust %d %d %d %d %d %d %d %d %d %d');
  const sustNames = ['sust_dig_ore_coal_count', 'sust_port_count', 'sust_old_money_count', 'sust_old_population_count',
    'sust_old_tech_count', 'sust_fire_count', 'sust_old_money', 'sust_old_population', 'sust_old_tech', 'sustain_flag'] as const;
  for (let k = 0; k < v.length; k++) G[sustNames[k]] = v[k] as number;
  if (v.length === 10) {
    G.sust_dig_ore_coal_tip_flag = G.sust_port_flag = 1;
  } else {
    for (const k of sustNames) G[k] = 0;
  }
  G.numof_shanties = count_groups(C.GROUP_SHANTY);
  G.numof_communes = count_groups(C.GROUP_COMMUNE);
  prog_box('', 100);
  const u = count_groups(C.GROUP_UNIVERSITY);
  if (u > 0) {
    G.university_intake_rate = idiv(count_groups(C.GROUP_SCHOOL) * 20, u);
    if (G.university_intake_rate > 100) G.university_intake_rate = 100;
  } else G.university_intake_rate = 50;
  for (let xx = 0; xx < C.WORLD_SIDE_LEN; xx++) for (let yy = 0; yy < C.WORLD_SIDE_LEN; yy++) update_tech_dep(xx, yy);
  unhighlight_module_button(G.selected_module);
  G.selected_module = sbut[7];
  highlight_module_button(G.selected_module);
  set_selected_module(C.CST_TRACK_LR);
  print_total_money();
  reset_animation_times();
  map_power_grid();
}

/** fscanf ("%f", &float_var): keeps the value when it fails */
function flt(f: CFile, old: number): number {
  const v = f.fscanf1('%f');
  return v === null ? old : v as number;
}

export function load_saved_city(s: string): void {
  load_city(`${PATHS.lc_save_dir}/${s}`);
}

export function reset_animation_times(): void {
  for (let y = 0; y < C.WORLD_SIDE_LEN; y++) {
    for (let x = 0; x < C.WORLD_SIDE_LEN; x++) {
      const b = IX(x, y), g = mapGroup(x, y);
      if (C.GROUP_IS_RESIDENCE(g)) setI(b, 3, 0);
      else if (g === C.GROUP_WINDMILL || g === C.GROUP_BLACKSMITH || g === C.GROUP_MILL || g === C.GROUP_POTTERY
        || g === C.GROUP_CRICKET || g === C.GROUP_FIRESTATION) setI(b, 4, 0);
      else if (g === C.GROUP_FIRE) {
        setI(b, 1, 0);
        setI(b, 3, 0);
      } else if (g === C.GROUP_COMMUNE) setI(b, 1, 0);
      else if (g === C.GROUP_ROCKET) setI(b, 5, 0);
      else if (g === C.GROUP_INDUSTRY_H) setI(b, 6, 0);
      else if (g === C.GROUP_INDUSTRY_L) setI(b, 7, 0);
    }
  }
}
const mapGroup = (x: number, y: number): number => MG[P(x, y)];
const setI = (b: number, n: number, v: number): void => { MI[b + 2 + n] = v; };

/** returns 1 if the city is of this version */
export function verify_city(cname: string): number {
  if (cname.length === 0) return 0;
  const s = `${PATHS.lc_save_dir}/${cname}`;
  if (!fileExists(s)) return 0;
  const fp = fopenReadGzipped(s);
  const v = fp.fscanf1('%d');
  return v === C.VERSION_INT ? 1 : 0;
}
