// pbar.c: the rate-of-change bars at the top right (population, tech, food, jobs, coal, goods, ore,
// steel, money).
import * as C from './consts.ts';
import { G, GR, scr, type Rect } from './g.ts';
import { snprintf, toInt, idiv, f32 } from './c.ts';
import { Fgl_fillbox, Fgl_putbox, Fgl_setfontcolors, Fgl_write } from './lcx11.ts';
import { draw_small_bezel } from './geometry.ts';
import { format_number5 } from './lclib.ts';
import { activate_help } from './lchelp.ts';

export interface Pbar { oldtot: number; tot: number; diff: number; data_size: number; data: Int32Array }
export const pbars: Pbar[] = Array.from({ length: C.NUM_PBARS }, () => ({
  oldtot: 0, tot: 0, diff: 0, data_size: 0, data: new Int32Array(C.PBAR_DATA_SIZE),
}));

export function init_pbars(): void {
  for (const p of pbars) {
    p.data_size = 0;
    p.oldtot = 0;
    p.tot = 0;
    p.diff = 0;
    p.data.fill(0);
  }
}

export function pbars_full_refresh(): void {
  const pba = scr.pbar_area;
  draw_small_bezel(pba.x + 4, pba.y + 4, pba.w - 8, pba.h - 8, C.yellow(0));
  init_pbar_text();
  draw_pbars();
}

function init_pbar_text(): void {
  for (const r of [scr.pbar_pop, scr.pbar_tech, scr.pbar_food, scr.pbar_jobs, scr.pbar_money, scr.pbar_coal,
    scr.pbar_goods, scr.pbar_ore, scr.pbar_steel]) clear_pbar_text(r);
}

export function draw_pbar(b: Rect, graphic: Uint8Array): void {
  Fgl_fillbox(b.x, b.y, b.w, b.h, 0);
  Fgl_putbox(b.x + idiv(b.w, 2) - 8, b.y, 16, 16, graphic);
}

function draw_pbars(): void {
  draw_pbar(scr.pbar_pop, GR.pop_pbar_graphic);
  draw_pbar(scr.pbar_tech, GR.tech_pbar_graphic);
  draw_pbar(scr.pbar_food, GR.food_pbar_graphic);
  draw_pbar(scr.pbar_jobs, GR.jobs_pbar_graphic);
  draw_pbar(scr.pbar_money, GR.money_pbar_graphic);
  draw_pbar(scr.pbar_coal, GR.coal_pbar_graphic);
  draw_pbar(scr.pbar_goods, GR.goods_pbar_graphic);
  draw_pbar(scr.pbar_ore, GR.ore_pbar_graphic);
  draw_pbar(scr.pbar_steel, GR.steel_pbar_graphic);
}

function clear_pbar_text(pbar: Rect): void {
  Fgl_fillbox(pbar.x + pbar.w + 1, pbar.y, C.PBAR_TEXT_W, pbar.h, 0);
}

function write_pbar_int(b: Rect, val: number): void {
  const p = pbars[val];
  // data[data_size - 1]: with data_size 0 this reads the int before data[], which is data_size (0)
  const v = p.data_size - 1 >= 0 ? p.data[p.data_size - 1] : p.data_size;
  const s = format_number5(v);
  Fgl_setfontcolors(0, 255);
  Fgl_write(b.x + b.w + 25, b.y + 4, s);
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

function write_pbar_text(b: Rect, s: string): void {
  Fgl_setfontcolors(0, 255);
  Fgl_write(b.x + b.w + 25, b.y + 4, s);
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

const adj2 = (d: number): number => (d > 0 ? idiv(d, 2) + 1 : d);

export function refresh_population_text(): void {
  update_pbar(C.PPOP, G.housed_population + G.people_pool, 0);
  write_pbar_int(scr.pbar_pop, C.PPOP);
}

export function refresh_pbars(): void {
  let b = scr.pbar_pop;
  draw_pbar_new(b, 2 * pbars[C.PPOP].diff);
  write_pbar_int(b, C.PPOP);
  b = scr.pbar_tech;
  const td = pbars[C.PTECH].diff;
  draw_pbar_new(b, td > 0 ? idiv(td, 4) + 1 : -idiv(-td + 1, 2));
  const tp = pbars[C.PTECH];
  const tv = tp.data_size - 1 >= 0 ? tp.data[tp.data_size - 1] : tp.data_size;
  // (float) data * 100.0 / MAX_TECH_LEVEL: the float is promoted to double
  write_pbar_text(b, snprintf(10, '%5.1f', f32(tv) * 100.0 / C.MAX_TECH_LEVEL));
  b = scr.pbar_food;
  draw_pbar_new(b, adj2(pbars[C.PFOOD].diff));
  write_pbar_int(b, C.PFOOD);
  b = scr.pbar_jobs;
  draw_pbar_new(b, adj2(pbars[C.PFOOD].diff));
  write_pbar_int(b, C.PJOBS);
  b = scr.pbar_coal;
  draw_pbar_new(b, adj2(pbars[C.PCOAL].diff));
  write_pbar_int(b, C.PCOAL);
  b = scr.pbar_goods;
  draw_pbar_new(b, adj2(pbars[C.PGOODS].diff));
  write_pbar_int(b, C.PGOODS);
  b = scr.pbar_ore;
  draw_pbar_new(b, adj2(pbars[C.PORE].diff));
  write_pbar_int(b, C.PORE);
  b = scr.pbar_steel;
  draw_pbar_new(b, adj2(pbars[C.PSTEEL].diff));
  write_pbar_int(b, C.PSTEEL);
  b = scr.pbar_money;
  const md = pbars[C.PMONEY].diff;
  draw_pbar_new(b, md > 0 ? idiv(md, 800) + 1 : idiv(md, 400));
  write_pbar_int(b, C.PMONEY);
}

export function update_pbar(pbar_num: number, value: number, month_flag: number): void {
  const pbar = pbars[pbar_num];
  if (month_flag) {
    pbar.oldtot = pbar.tot;
    if (pbar.data_size < C.PBAR_DATA_SIZE) {
      pbar.data_size++;
      month_flag = 0;
    }
  }
  pbar.tot = 0;
  let i;
  for (i = 0; i < pbar.data_size - 1; i++) {
    if (month_flag) pbar.tot = (pbar.tot + (pbar.data[i] = pbar.data[i + 1])) | 0;
    else pbar.tot = (pbar.tot + pbar.data[i]) | 0;
  }
  pbar.data[i] = value;
  pbar.tot = (pbar.tot + pbar.data[i]) | 0;
  pbar.diff = (pbar.tot - pbar.oldtot) | 0;
}

export function update_pbars_daily(): void {
  update_pbar(C.PPOP, G.housed_population + G.people_pool, 0);
  update_pbar(C.PTECH, G.tech_level, 0);
  update_pbar(C.PFOOD, idiv(G.food_in_markets, 1000), 0);
  update_pbar(C.PJOBS, idiv(G.jobs_in_markets, 1000), 0);
  update_pbar(C.PCOAL, idiv(G.coal_in_markets, 250), 0);
  update_pbar(C.PGOODS, idiv(G.goods_in_markets, 500), 0);
  update_pbar(C.PORE, idiv(G.ore_in_markets, 500), 0);
  update_pbar(C.PSTEEL, idiv(G.steel_in_markets, 25), 0);
  update_pbar(C.PMONEY, G.total_money, 0);
}

export function update_pbars_monthly(): void {
  const d = G.data_last_month;
  update_pbar(C.PPOP, G.housed_population + G.people_pool, 1);
  update_pbar(C.PTECH, G.tech_level, 1);
  update_pbar(C.PFOOD, idiv(G.tfood_in_markets, d), 1);
  update_pbar(C.PJOBS, idiv(G.tjobs_in_markets, d), 1);
  update_pbar(C.PCOAL, idiv(G.tcoal_in_markets, d), 1);
  update_pbar(C.PGOODS, idiv(G.tgoods_in_markets, d), 1);
  update_pbar(C.PORE, idiv(G.tore_in_markets, d), 1);
  update_pbar(C.PSTEEL, idiv(G.tsteel_in_markets, d), 1);
  update_pbar(C.PMONEY, G.total_money, 1);
}

function compute_pbar_offset(b: Rect, val: number): number {
  const val_abs = val > 0 ? val : -val;
  if (!val) return 0;
  let offset = toInt(Math.log(val_abs));
  if (offset > idiv(b.w, 2) - 8) offset = idiv(b.w, 2) - 8;
  return val > 0 ? offset : -offset;
}

function draw_pbar_new(b: Rect, val: number): void {
  const offset = compute_pbar_offset(b, val);
  Fgl_fillbox(b.x, b.y, idiv(b.w, 2) - 8, b.h, 0);
  Fgl_fillbox(b.x + idiv(b.w, 2) + 8, b.y, idiv(b.w, 2) - 8, b.h, 0);
  if (offset > 0) {
    const spike_start = b.x + idiv(b.w, 2) + 8;
    const spike_end = spike_start + offset;
    Fgl_fillbox(spike_start, b.y + 2, spike_end - spike_start, b.h - 4, C.green(12));
  } else if (offset < 0) {
    const spike_end = b.x + idiv(b.w, 2) - 8;
    const spike_start = spike_end + offset;
    Fgl_fillbox(spike_start, b.y + 2, spike_end - spike_start, b.h - 4, C.red(12));
  }
}

export function pbar_mouse(_rawx: number, _rawy: number, button: number): void {
  if (button !== C.LC_MOUSE_RIGHTBUTTON) return;
  activate_help('pbar.hlp');
}
