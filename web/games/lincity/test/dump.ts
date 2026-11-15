// The port's state dump, in the layout of the oracle's (re/lincity/oracle/dump.c): the screen (pixmap),
// the map, the globals, the power grids, the client state and the palette.
import { G, MG_ARR, mappoint_array_x, mappoint_array_y, substationx, substationy, marketx, markety,
  module_help_flag } from '../src/lc/g.ts';
import { PX } from '../src/lc/pixmap.ts';
import { mapBytes } from '../src/lc/map.ts';
import { pbars } from '../src/lc/pbar.ts';
import { grid } from '../src/lc/power.ts';
import { palette } from '../src/lc/lcx11.ts';
import * as C from '../src/lc/consts.ts';

export function dumpState(): Uint8Array {
  const parts: number[] = [];
  const bytes: Uint8Array[] = [];
  let ints: number[] = [];
  const flushInts = (): void => {
    if (!ints.length) return;
    const b = new Uint8Array(ints.length * 4);
    const dv = new DataView(b.buffer);
    ints.forEach((v, i) => dv.setInt32(i * 4, v, true));
    bytes.push(b);
    ints = [];
  };
  const raw = (b: Uint8Array): void => { flushInts(); bytes.push(b); };
  const w = (v: number): void => { ints.push(v | 0); };
  const wf = (f: number): void => {
    const b = new DataView(new ArrayBuffer(4));
    b.setFloat32(0, f, true);
    ints.push(b.getInt32(0, true));
  };
  const warr = (a: ArrayLike<number>, n: number): void => { for (let i = 0; i < n; i++) w(a[i]); };
  void parts;
  raw(new TextEncoder().encode('LCD1'));
  w(G.pixmap_width); w(G.pixmap_height);
  raw(PX.pixmap.slice(0, G.pixmap_width * G.pixmap_height));
  raw(mapBytes.slice());
  w(G.total_time); w(G.total_money); w(G.people_pool); w(G.housed_population);
  w(G.population); w(G.starving_population); w(G.unemployed_population);
  w(G.tech_level); w(G.highest_tech_level); w(G.unnat_deaths);
  w(G.numof_shanties); w(G.numof_communes); w(G.numof_substations); w(G.numof_markets);
  w(G.numof_health_centres); w(G.max_pop_ever); w(G.total_evacuated); w(G.total_births);
  w(G.income_tax_rate); w(G.coal_tax_rate); w(G.dole_rate); w(G.transport_cost_rate);
  w(G.goods_tax_rate); w(G.export_tax_rate); w(G.import_cost_rate);
  w(G.total_pollution_deaths); w(G.total_starve_deaths); w(G.total_unemployed_days);
  w(G.total_unemployed_years);
  wf(G.pollution_deaths_history); wf(G.starve_deaths_history); wf(G.unemployed_history);
  w(G.university_intake_rate); w(G.power_made); w(G.power_used); w(G.coal_made); w(G.coal_used);
  w(G.goods_made); w(G.goods_used); w(G.ore_made); w(G.ore_used);
  w(G.rockets_launched); w(G.rockets_launched_success); w(G.coal_survey_done);
  w(G.last_built_x); w(G.last_built_y);
  w(G.sust_dig_ore_coal_tip_flag); w(G.sust_port_flag); w(G.sustain_flag);
  w(G.sust_dig_ore_coal_count); w(G.sust_port_count); w(G.sust_old_money);
  w(G.sust_old_money_count); w(G.sust_old_population); w(G.sust_old_population_count);
  w(G.sust_old_tech); w(G.sust_old_tech_count); w(G.sust_fire_count);
  warr(substationx, C.MAX_NUMOF_SUBSTATIONS); warr(substationy, C.MAX_NUMOF_SUBSTATIONS);
  warr(marketx, C.MAX_NUMOF_MARKETS); warr(markety, C.MAX_NUMOF_MARKETS);
  warr(mappoint_array_x, C.WORLD_SIDE_LEN); warr(mappoint_array_y, C.WORLD_SIDE_LEN);
  w(G.tpopulation); w(G.tstarving_population); w(G.tunemployed_population);
  w(G.income_tax); w(G.coal_tax); w(G.goods_tax); w(G.export_tax); w(G.import_cost);
  w(G.unemployment_cost); w(G.transport_cost); w(G.windmill_cost); w(G.university_cost);
  w(G.recycle_cost); w(G.deaths_cost); w(G.health_cost); w(G.rocket_pad_cost);
  w(G.school_cost); w(G.fire_cost); w(G.cricket_cost); w(G.other_cost);
  w(G.ly_income_tax); w(G.ly_coal_tax); w(G.ly_goods_tax); w(G.ly_export_tax);
  w(G.ly_import_cost); w(G.ly_other_cost); w(G.ly_unemployment_cost); w(G.ly_transport_cost);
  w(G.ly_fire_cost); w(G.ly_university_cost); w(G.ly_recycle_cost); w(G.ly_school_cost);
  w(G.ly_deaths_cost); w(G.ly_health_cost); w(G.ly_rocket_pad_cost); w(G.ly_interest);
  w(G.ly_windmill_cost); w(G.ly_cricket_cost);
  w(G.food_in_markets); w(G.jobs_in_markets); w(G.coal_in_markets); w(G.goods_in_markets);
  w(G.ore_in_markets); w(G.steel_in_markets); w(G.waste_in_markets);
  w(G.tfood_in_markets); w(G.tjobs_in_markets); w(G.tcoal_in_markets); w(G.tgoods_in_markets);
  w(G.tore_in_markets); w(G.tsteel_in_markets); w(G.twaste_in_markets);
  for (const p of pbars) {
    w(p.oldtot); w(p.tot); w(p.diff); w(p.data_size);
    warr(p.data, C.PBAR_DATA_SIZE);
  }
  w(G.monthgraph_size);
  warr(MG_ARR.monthgraph_pop, G.monthgraph_size); warr(MG_ARR.monthgraph_starve, G.monthgraph_size);
  warr(MG_ARR.monthgraph_nojobs, G.monthgraph_size); warr(MG_ARR.monthgraph_ppool, G.monthgraph_size);
  w(G.grid_num); w(G.grid_inc);
  for (let i = 1; i <= G.grid_num; i++) {
    const g = grid[i]!;
    w(g.power_lines); w(g.total_power); w(g.avail_power); w(g.max_power); w(g.demand); w(g.powered);
  }
  w(G.real_time); w(G.main_screen_originx); w(G.main_screen_originy);
  w(G.selected_module); w(G.selected_module_type); w(G.selected_module_group); w(G.selected_module_cost);
  w(G.cs_mouse_x); w(G.cs_mouse_y); w(G.mouse_type); w(G.mouse_hide_count);
  w(G.help_flag); w(G.prefs_flag); w(G.market_cb_flag); w(G.port_cb_flag); w(G.db_flag); w(G.db_okflag);
  w(G.pause_flag); w(G.slow_flag); w(G.med_flag); w(G.fast_flag); w(G.cheat_flag);
  w(G.mini_screen_flags); w(G.main_screen_flag); w(G.mps_global_style); w(G.monthgraph_style);
  w(G.overwrite_transport_flag); w(G.suppress_popups); w(G.time_multiplex_stats); w(G.confine_flag);
  warr(module_help_flag, C.NUMOF_MODULES);
  raw(palette.slice());
  raw(new TextEncoder().encode('END!'));
  const n = bytes.reduce((s, b) => s + b.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const b of bytes) { out.set(b, o); o += b.length; }
  return out;
}

/** names of the int fields after the map, in the order dumpState writes them (for messages) */
export const GLOBAL_NAMES = ['total_time', 'total_money', 'people_pool', 'housed_population', 'population',
  'starving_population', 'unemployed_population', 'tech_level', 'highest_tech_level', 'unnat_deaths',
  'numof_shanties', 'numof_communes', 'numof_substations', 'numof_markets', 'numof_health_centres', 'max_pop_ever',
  'total_evacuated', 'total_births'];
