// mps.c: the "map point statistics" panel on the right: one module's figures, the environment of a
// square, or the city's finances and housing. mps_info is the original's char[14][16]: the store
// functions write it with snprintf exactly as C does (a long number runs on into the next line).
import * as C from './consts.ts';
import { G, scr } from './g.ts';
import { MG, MI, MPOL, P, IX, FLAGS } from './map.ts';
import { snprintfBuf, cstr, idiv } from './c.ts';
import { mouse_register } from './mouse.ts';
import { Fgl_fillbox, Fgl_setfontcolors, Fgl_write } from './lcx11.ts';
import { draw_small_bezel } from './geometry.ts';
import { num_to_ansi } from './lclib.ts';
import { main_groups } from './lintypes.ts';
import * as M from './modules.ts';
import { mps_market } from './market.ts';

const LINES = C.MAPPOINT_STATS_LINES;
const CH = C.MPS_INFO_CHARS;
/** char mps_info[MAPPOINT_STATS_LINES][MPS_INFO_CHARS], and what follows it in memory */
export const mps_info = new Uint8Array(LINES * CH + 64);

let mps_style = 0;
let mps_x = 0;
let mps_y = 0;

function mps_handler(_x: number, _y: number, button: number): void {
  if (button === C.LC_MOUSE_LEFTBUTTON) {
    if (mps_style === C.MPS_GLOBAL) mps_global_advance();
    else mps_set(0, 0, C.MPS_GLOBAL);
  }
}

export function mps_init(): void {
  mps_style = C.MPS_GLOBAL;
  G.mps_global_style = C.MPS_GLOBAL_FINANCE;
  mps_x = 0;
  mps_y = 0;
  mouse_register(scr.mappoint_stats, mps_handler);
}

/** note: called as mps_set(x, y, style) everywhere */
export function mps_set(x: number, y: number, style: number): number {
  let same_square = 0;
  mps_style = style;
  switch (style) {
    case C.MPS_MAP:
    case C.MPS_ENV:
      if (mps_x === x && mps_y === y) same_square = 1;
      mps_x = x;
      mps_y = y;
      break;
    default:
      mps_x = 0;
      mps_y = 0;
  }
  mps_update();
  mps_refresh();
  return same_square;
}

export function mps_redraw(): void {
  const mps = scr.mappoint_stats;
  draw_small_bezel(mps.x, mps.y, mps.w, mps.h, C.yellow(0));
  mps_refresh();
}

export function mps_refresh(): void {
  const mps = scr.mappoint_stats;
  Fgl_fillbox(mps.x, mps.y, mps.w + 1, mps.h + 1, 14);
  Fgl_setfontcolors(14, C.TEXT_FG_COLOUR);
  for (let i = 0; i < LINES; i++) Fgl_write(mps.x + 4, mps.y + i * 8 + 4, cstr(mps_info, i * CH));
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

export function mps_update(): void {
  for (let i = 0; i < LINES; i++) mps_info[i * CH] = 0;
  switch (mps_style) {
    case C.MPS_MAP: {
      const x = mps_x, y = mps_y;
      switch (MG[P(x, y)]) {
        case C.GROUP_BLACKSMITH: M.mps_blacksmith(x, y); break;
        case C.GROUP_COALMINE: M.mps_coalmine(x, y); break;
        case C.GROUP_COAL_POWER: M.mps_coal_power(x, y); break;
        case C.GROUP_COMMUNE: M.mps_commune(x, y); break;
        case C.GROUP_CRICKET: M.mps_cricket(x, y); break;
        case C.GROUP_FIRESTATION: M.mps_firestation(x, y); break;
        case C.GROUP_HEALTH: M.mps_health_centre(x, y); break;
        case C.GROUP_INDUSTRY_H: M.mps_heavy_industry(x, y); break;
        case C.GROUP_INDUSTRY_L: M.mps_light_industry(x, y); break;
        case C.GROUP_MILL: M.mps_mill(x, y); break;
        case C.GROUP_MONUMENT: M.mps_monument(x, y); break;
        case C.GROUP_OREMINE: M.mps_oremine(x, y); break;
        case C.GROUP_ORGANIC_FARM: M.mps_organic_farm(x, y); break;
        case C.GROUP_PORT: M.mps_port(x, y); break;
        case C.GROUP_POTTERY: M.mps_pottery(x, y); break;
        case C.GROUP_POWER_LINE: M.mps_power_line(x, y); break;
        case C.GROUP_RAIL: M.mps_rail(x, y); break;
        case C.GROUP_RECYCLE: M.mps_recycle(x, y); break;
        case C.GROUP_RESIDENCE_LL: case C.GROUP_RESIDENCE_ML: case C.GROUP_RESIDENCE_HL:
        case C.GROUP_RESIDENCE_LH: case C.GROUP_RESIDENCE_MH: case C.GROUP_RESIDENCE_HH:
          M.mps_residence(x, y); break;
        case C.GROUP_ROAD: M.mps_road(x, y); break;
        case C.GROUP_ROCKET: M.mps_rocket(x, y); break;
        case C.GROUP_SCHOOL: M.mps_school(x, y); break;
        case C.GROUP_SOLAR_POWER: M.mps_solar_power(x, y); break;
        case C.GROUP_SUBSTATION: M.mps_substation(x, y); break;
        case C.GROUP_TIP: M.mps_tip(x, y); break;
        case C.GROUP_TRACK: M.mps_track(x, y); break;
        case C.GROUP_MARKET: mps_market(x, y); break;
        case C.GROUP_UNIVERSITY: M.mps_university(x, y); break;
        case C.GROUP_WATER: M.mps_water(x, y); break;
        case C.GROUP_WINDMILL: M.mps_windmill(x, y); break;
        default: break; // "MPS unimplemented for that module"
      }
      break;
    }
    case C.MPS_ENV: mps_right(mps_x, mps_y); break;
    case C.MPS_GLOBAL:
      switch (G.mps_global_style) {
        case C.MPS_GLOBAL_FINANCE: mps_global_finance(); break;
        case C.MPS_GLOBAL_OTHER_COSTS: mps_global_other_costs(); break;
        case C.MPS_GLOBAL_HOUSING: mps_global_housing(); break;
      }
      break;
  }
  mps_refresh();
}

export function mps_global_advance(): void {
  G.mps_global_style++;
  G.mps_global_style %= C.MPS_GLOBAL_STYLES;
  if (mps_style === C.MPS_GLOBAL) mps_update();
}

/* ---- the store functions ---- */
const row = (i: number): number => i * CH;
const centred = (i: number, s: string): void => {
  const l = s.length;
  const c = idiv(CH - l, 2) + l;
  snprintfBuf(mps_info, row(i), CH, '%*s', c, s);
};
export function mps_store_title(i: number, t: string): void { centred(i, t); }
export function mps_store_fp(i: number, f: number): void {
  const s = new Uint8Array(12);
  snprintfBuf(s, 0, 12, '%.1f%%', f);
  centred(i, cstr(s, 0));
}
export function mps_store_f(i: number, f: number): void {
  const s = new Uint8Array(12);
  snprintfBuf(s, 0, 12, '%.1f', f);
  centred(i, cstr(s, 0));
}
export function mps_store_d(i: number, d: number): void {
  const s = new Uint8Array(12);
  snprintfBuf(s, 0, 12, '%d', d);
  centred(i, cstr(s, 0));
}
export function mps_store_ss(i: number, s1: string, s2: string): void {
  const l = snprintfBuf(mps_info, row(i), CH, '%s', s1);
  snprintfBuf(mps_info, row(i) + l, CH - l, '%*s', CH - l - 1, s2);
}
export function mps_store_sss(i: number, s1: string, s2: string, s3: string): void {
  const c = idiv(CH, 3);
  const m = CH % 3;
  if (i > LINES) return;
  let l = snprintfBuf(mps_info, row(i), c + m, '%s', s1);
  let e = l;
  l = snprintfBuf(mps_info, row(i) + e, c * 2 + m - e, '%*s', c * 2 + m - e - 1, s2);
  e += l;
  snprintfBuf(mps_info, row(i) + e, c * 3 + m - e, '%*s', c * 3 + m - e - 1, s3);
}
export function mps_store_sd(i: number, s: string, d: number): void {
  if (i > LINES) return;
  const l = snprintfBuf(mps_info, row(i), CH, '%s', s);
  snprintfBuf(mps_info, row(i) + l, CH, '%*d', CH - 1 - l, d);
}
export function mps_store_sfp(i: number, s: string, fl: number): void {
  const l = snprintfBuf(mps_info, row(i), CH, '%s', s);
  snprintfBuf(mps_info, row(i) + l, CH, '%*.1f%%', CH - 2 - l, fl);
}
/** organic_farm.c writes mps_info with its own snprintf calls */
export function mps_snprintf(i: number, fmt: string, ...args: (number | string)[]): void {
  snprintfBuf(mps_info, row(i), CH, fmt, ...args);
}

/* ---- the global displays ---- */
export function mps_right(x: number, y: number): void {
  let i = 0;
  const s = new Uint8Array(12);
  snprintfBuf(s, 0, 12, '%d,%d', x, y);
  mps_store_title(i++, cstr(s, 0));
  i++;
  mps_store_title(i++, 'Coverage');
  const flags = MI[IX(x, y) + FLAGS];
  mps_store_ss(i++, 'Fire', flags & C.FLAG_FIRE_COVER ? 'Yes' : 'No');
  mps_store_ss(i++, 'Health', flags & C.FLAG_HEALTH_COVER ? 'Yes' : 'No');
  mps_store_ss(i++, 'Cricket', flags & C.FLAG_CRICKET_COVER ? 'Yes' : 'No');
  i++;
  mps_store_title(i++, 'Pollution');
  const pol = MPOL[P(x, y)];
  let p: string;
  if (pol < 10) p = 'clear';
  else if (pol < 25) p = 'good';
  else if (pol < 70) p = 'fair';
  else if (pol < 190) p = 'smelly';
  else if (pol < 450) p = 'smokey';
  else if (pol < 1000) p = 'smoggy';
  else if (pol < 1700) p = 'bad';
  else if (pol < 3000) p = 'very bad';
  else p = 'death!';
  mps_store_sd(i++, p, pol);
  i++;
  mps_store_title(i++, 'Bulldoze Cost');
  let g = MG[P(x, y)];
  if (g === 0) mps_store_title(i++, 'N/A');
  else {
    if (g < 7) g--;
    mps_store_d(i++, main_groups[g].bul_cost);
  }
}

const ansi = (n: number): string => num_to_ansi(12, n);

export function mps_global_finance(): void {
  let i = 0;
  let cashflow = 0;
  mps_store_title(i++, 'Tax Income');
  cashflow += G.ly_income_tax;
  mps_store_ss(i++, 'Income', ansi(G.ly_income_tax));
  cashflow += G.ly_coal_tax;
  mps_store_ss(i++, 'Coal', ansi(G.ly_coal_tax));
  cashflow += G.ly_goods_tax;
  mps_store_ss(i++, 'Goods', ansi(G.ly_goods_tax));
  cashflow += G.ly_export_tax;
  mps_store_ss(i++, 'Export', ansi(G.ly_export_tax));
  i++;
  mps_store_title(i++, 'Expenses');
  cashflow -= G.ly_unemployment_cost;
  mps_store_ss(i++, 'Unemp.', ansi(G.ly_unemployment_cost));
  cashflow -= G.ly_transport_cost;
  mps_store_ss(i++, 'Transport', ansi(G.ly_transport_cost));
  cashflow -= G.ly_import_cost;
  mps_store_ss(i++, 'Imports', ansi(G.ly_import_cost));
  cashflow -= G.ly_other_cost;
  mps_store_ss(i++, 'Others', ansi(G.ly_other_cost));
  i++;
  mps_store_ss(i++, 'Net', ansi(cashflow | 0));
}

export function mps_global_other_costs(): void {
  let i = 0;
  mps_store_title(i++, 'Other Costs');
  const year = idiv(G.total_time, C.NUMOF_DAYS_IN_YEAR) - 1;
  if (year >= 0) mps_store_sd(i++, 'For year', year);
  i++;
  mps_store_ss(i++, 'Interest', ansi(G.ly_interest));
  mps_store_ss(i++, 'Schools', ansi(G.ly_school_cost));
  mps_store_ss(i++, 'Univers.', ansi(G.ly_university_cost));
  mps_store_ss(i++, 'Deaths', ansi(G.ly_deaths_cost));
  mps_store_ss(i++, 'Windmill', ansi(G.ly_windmill_cost));
  mps_store_ss(i++, 'Hospital', ansi(G.ly_health_cost));
  mps_store_ss(i++, 'Rockets', ansi(G.ly_rocket_pad_cost));
  mps_store_ss(i++, 'Fire Stn', ansi(G.ly_fire_cost));
  mps_store_ss(i++, 'Cricket', ansi(G.ly_cricket_cost));
  mps_store_ss(i++, 'Recycle', ansi(G.ly_recycle_cost));
}

export function mps_global_housing(): void {
  let i = 0;
  const tp = (G.housed_population + G.people_pool) | 0;
  mps_store_title(i++, 'Population');
  i++;
  mps_store_sd(i++, 'Total', tp);
  mps_store_sd(i++, 'Housed', G.housed_population);
  mps_store_sd(i++, 'Homeless', G.people_pool);
  mps_store_sd(i++, 'Shanties', G.numof_shanties);
  mps_store_sd(i++, 'Unn Dths', G.unnat_deaths);
  mps_store_title(i++, 'Unemployment');
  mps_store_sd(i++, 'Claims', G.tunemployed_population);
  mps_store_sfp(i++, 'Rate', (G.tunemployed_population * 100.0) / tp);
  mps_store_title(i++, 'Starvation');
  mps_store_sd(i++, 'Cases', G.tstarving_population);
  mps_store_sfp(i++, 'Rate', (G.tstarving_population * 100.0) / tp);
}
