// module_buttons.c: the icon palette on the left (what to build), greyed out until the tech level allows it.
import * as C from './consts.ts';
import { G, scr, sbut, module_type, module_tflag, module_help_flag, module_help } from './g.ts';
import { idiv, snprintf } from './c.ts';
import { platform } from './platform.ts';
import { main_groups, get_group_of_type, get_type_cost } from './lintypes.ts';
import { Fgl_fillbox, Fgl_putbox, Fgl_setpixel, Fgl_write } from './lcx11.ts';
import { mouse_register, hide_mouse, redraw_mouse, choose_residence } from './mouse.ts';
import { draw_small_bezel } from './geometry.ts';
import { ok_dial_box, draw_main_window_box } from './screen.ts';
import { activate_help } from './lchelp.ts';
import { commify } from './lclib.ts';
import { load_graphic } from './fileutil.ts';
import { do_error } from './main.ts';

let module_rows = 0;
let module_cols = 0;
const mbw = scr.module_buttons;
const module_graphic: Uint8Array[] = new Array(C.NUMOF_MODULES).fill(new Uint8Array(0));

export function init_modules(): void {
  module_rows = idiv(mbw.h, C.SELECT_BUTTON_INTERVAL);
  module_cols = idiv(mbw.w, C.SELECT_BUTTON_INTERVAL);
  void module_cols;
  mouse_register(scr.module_buttons, module_buttons_handler);
  const order = [16, 13, 15, 14, 0, 1, 2, 19, 10, 28, 29, 25, 27, 11, 3, 4, 5, 9, 12, 6, 30, 20, 26, 31, 24, 17, 21, 22, 8, 18, 23, 7];
  for (let i = 0; i < C.NUMOF_MODULES; i++) sbut[i] = order[i];
  const def: [string, number, string][] = [
    ['buldoze-button.csi', C.CST_GREEN, 'bulldoze.hlp'],
    ['powerline-button.csi', C.CST_POWERL_H_L, 'powerline.hlp'],
    ['powerssolar-button.csi', C.CST_POWERS_SOLAR, 'powerssolar.hlp'],
    ['substation-button.csi', C.CST_SUBSTATION_R, 'substation.hlp'],
    ['residence-button.csi', C.CST_RESIDENCE_LL, 'residential.hlp'],
    ['organic-farm-button.csi', C.CST_FARM_O0, 'farm.hlp'],
    ['market-button.csi', C.CST_MARKET_EMPTY, 'market.hlp'],
    ['track-button.csi', C.CST_TRACK_LR, 'track.hlp'],
    ['coalmine-button.csi', C.CST_COALMINE_EMPTY, 'coalmine.hlp'],
    ['rail-button.csi', C.CST_RAIL_LR, 'rail.hlp'],
    ['powerscoal-button.csi', C.CST_POWERS_COAL_EMPTY, 'powerscoal.hlp'],
    ['road-button.csi', C.CST_ROAD_LR, 'road.hlp'],
    ['industryl-button.csi', C.CST_INDUSTRY_L_C, 'industryl.hlp'],
    ['university-button.csi', C.CST_UNIVERSITY, 'university.hlp'],
    ['commune-button.csi', C.CST_COMMUNE_1, 'commune.hlp'],
    ['oremine-button.csi', C.CST_OREMINE_1, 'oremine.hlp'],
    ['tip-button.csi', C.CST_TIP_0, 'tip.hlp'],
    ['port-button.csi', C.CST_EX_PORT, 'port.hlp'],
    ['industryh-button.csi', C.CST_INDUSTRY_H_C, 'industryh.hlp'],
    ['parkland-button.csi', C.CST_PARKLAND_PLANE, 'park.hlp'],
    ['recycle-button.csi', C.CST_RECYCLE, 'recycle.hlp'],
    ['water-button.csi', C.CST_WATER, 'river.hlp'],
    ['health-button.csi', C.CST_HEALTH, 'health.hlp'],
    ['rocket-button.csi', C.CST_ROCKET_1, 'rocket.hlp'],
    ['windmill-button.csi', C.CST_WINDMILL_1_R, 'windmill.hlp'],
    ['monument-button.csi', C.CST_MONUMENT_0, 'monument.hlp'],
    ['school-button.csi', C.CST_SCHOOL, 'school.hlp'],
    ['blacksmith-button.csi', C.CST_BLACKSMITH_0, 'blacksmith.hlp'],
    ['mill-button.csi', C.CST_MILL_0, 'mill.hlp'],
    ['pottery-button.csi', C.CST_POTTERY_0, 'pottery.hlp'],
    ['firestation-button.csi', C.CST_FIRESTATION_1, 'firestation.hlp'],
    ['cricket-button.csi', C.CST_CRICKET_1, 'cricket.hlp'],
  ];
  for (let i = 0; i < C.NUMOF_MODULES; i++) {
    if (i === 7) module_help_flag[sbut[7]] = 1; // no help for track
    module_graphic[sbut[i]] = load_graphic(def[i][0]);
    module_type[sbut[i]] = def[i][1];
    module_help[sbut[i]] = def[i][2];
  }
  for (let i = 0; i < C.NUMOF_MODULES; i++) module_tflag[i] = 0;
  G.selected_module = sbut[7];
}

export function update_avail_modules(popup: number): void {
  for (let i = 0; i < C.NUMOF_MODULES; i++) {
    const g = inv_sbut(i);
    let f = module_tflag[i];
    if (G.tech_level >= idiv(main_groups[g].tech * C.MAX_TECH_LEVEL, 1000)) {
      if (module_tflag[i] === 0) if (popup) activate_module(i);
      f = 1;
    } else if (module_tflag[i] !== 0
      && G.tech_level < idiv((main_groups[g].tech - idiv(main_groups[g].tech, 10)) * C.MAX_TECH_LEVEL, 1000)) f = 0;
    if (module_tflag[i] !== f) {
      module_tflag[i] = f;
      draw_module(i, module_graphic[i]);
    }
  }
  if (G.tech_level > C.MODERN_WINDMILL_TECH && G.modern_windmill_flag === 0) {
    ok_dial_box('mod_wind_up.mes', C.GOOD, null);
    G.modern_windmill_flag = 1;
  }
}

function activate_module(module: number): void {
  module = inv_sbut(module);
  const msg: Record<number, string> = {
    [C.GROUP_WINDMILL]: 'windmillup.mes', [C.GROUP_COAL_POWER]: 'coalpowerup.mes',
    [C.GROUP_SOLAR_POWER]: 'solarpowerup.mes', [C.GROUP_COALMINE]: 'coalmineup.mes', [C.GROUP_RAIL]: 'railwayup.mes',
    [C.GROUP_ROAD]: 'roadup.mes', [C.GROUP_INDUSTRY_L]: 'ltindustryup.mes', [C.GROUP_UNIVERSITY]: 'universityup.mes',
    [C.GROUP_PORT]: 'import-exportup.mes', [C.GROUP_INDUSTRY_H]: 'hvindustryup.mes', [C.GROUP_RECYCLE]: 'recycleup.mes',
    [C.GROUP_HEALTH]: 'healthup.mes', [C.GROUP_ROCKET]: 'rocketup.mes', [C.GROUP_FIRESTATION]: 'firestationup.mes',
    [C.GROUP_CRICKET]: 'cricketup.mes',
  };
  // the ones whose message depends on their tech being above 0
  const ifTech: Record<number, [number, string]> = {
    [C.GROUP_OREMINE]: [C.GROUP_OREMINE_TECH, 'oremineup.mes'], [C.GROUP_PARKLAND]: [C.GROUP_PARKLAND_TECH, 'parkup.mes'],
    [C.GROUP_RIVER]: [C.GROUP_WATER_TECH, 'riverup.mes'], [C.GROUP_SCHOOL]: [C.GROUP_SCHOOL_TECH, 'schoolup.mes'],
    [C.GROUP_BLACKSMITH]: [C.GROUP_BLACKSMITH_TECH, 'blacksmithup.mes'], [C.GROUP_MILL]: [C.GROUP_MILL_TECH, 'millup.mes'],
    [C.GROUP_POTTERY]: [C.GROUP_POTTERY_TECH, 'potteryup.mes'],
  };
  if (msg[module]) ok_dial_box(msg[module], C.GOOD, null);
  else if (ifTech[module]) {
    if (ifTech[module][0] > 0) ok_dial_box(ifTech[module][1], C.GOOD, null);
  }
}

function module_buttons_handler(x: number, y: number, mbutton: number): void {
  const row = idiv(y, C.SELECT_BUTTON_INTERVAL);
  if (y % C.SELECT_BUTTON_INTERVAL <= 8) return;
  const col = idiv(x, C.SELECT_BUTTON_INTERVAL);
  if (x % C.SELECT_BUTTON_INTERVAL <= 8) return;
  select_module(row + module_rows * col, mbutton);
}

function select_module(module: number, mbutton: number): void {
  if (module_tflag[module] === 0 && mbutton !== C.LC_MOUSE_RIGHTBUTTON) {
    ok_dial_box('not_enough_tech.mes', C.BAD, null);
    return;
  }
  if (mbutton === C.LC_MOUSE_RIGHTBUTTON || (module_help_flag[module] === 0 && !G.suppress_firsttime_module_help)) {
    activate_help(module_help[module]);
    if (mbutton !== C.LC_MOUSE_RIGHTBUTTON) module_help_flag[module] = 1;
    if (mbutton === C.LC_MOUSE_RIGHTBUTTON) return;
  }
  unhighlight_module_button(G.selected_module);
  highlight_module_button(module);
  G.selected_module = module;
  set_selected_module(module_type[module]);
}

function buttonXY(module: number): [number, number] {
  let row: number, col: number;
  if (module === 0) {
    row = 0;
    col = 0;
  } else {
    row = module % module_rows;
    col = idiv(module, module_rows);
  }
  return [8 + col * 24, 8 + row * 24];
}

export function highlight_module_button(module: number): void {
  const [x, y] = buttonXY(module);
  hide_mouse();
  draw_small_bezel(x + 1 + mbw.x, y + 1 + mbw.y, C.SELECT_BUTTON_WIDTH - 2, C.SELECT_BUTTON_WIDTH - 2, C.yellow(0));
  redraw_mouse();
}

export function unhighlight_module_button(module: number): void {
  const [x, y] = buttonXY(module);
  hide_mouse();
  draw_small_bezel(x + 1 + mbw.x, y + 1 + mbw.y, C.SELECT_BUTTON_WIDTH - 2, C.SELECT_BUTTON_WIDTH - 2, C.blue(0));
  redraw_mouse();
}

export function draw_selected_module_cost(): void {
  const b = scr.select_message;
  G.selected_module_cost = get_type_cost(G.selected_module_type);
  const [coststr] = commify(20, G.selected_module_cost);
  const [bldzstr] = commify(20, main_groups[G.selected_module_group].bul_cost);
  let s: string;
  if (G.selected_module_group === C.GROUP_BARE) s = snprintf(100, 'Bulldoze - cost varies');
  else s = snprintf(100, '%s %s  Bulldoze %s', main_groups[G.selected_module_group].name, coststr, bldzstr);
  Fgl_fillbox(b.x, b.y, 42 * 8, 8, C.TEXT_BG_COLOUR);
  Fgl_write(b.x, b.y, s);
}

export function draw_modules(): void {
  Fgl_fillbox(mbw.x, mbw.y, mbw.w, mbw.h, C.white(20));
  for (let i = 0; i < C.NUMOF_MODULES; i++) draw_module(sbut[i], module_graphic[sbut[i]]);
  highlight_module_button(G.selected_module);
}

function draw_module(module: number, graphic: Uint8Array): void {
  const [x, y] = buttonXY(module);
  hide_mouse();
  Fgl_putbox(x + mbw.x, y + mbw.y, 16, 16, graphic);
  unhighlight_module_button(module);
  if (module_tflag[module] === 0) {
    for (let yy = -3; yy < 19; yy++) {
      for (let xx = -3; xx < 19; xx += 2) Fgl_setpixel(x + xx + (yy % 2) + mbw.x, y + yy + mbw.y, C.white(15));
    }
  }
  redraw_mouse();
}

export function inv_sbut(button: number): number {
  for (let i = 0; i < 32; i++) if (sbut[i] === button) return i;
  do_error('An inv_sbut error has happened.');
  return -1;
}

export function set_selected_module(type: number): void {
  G.selected_module_type = type;
  G.selected_module_group = get_group_of_type(G.selected_module_type);
  if (G.selected_module_type === C.CST_RESIDENCE_LL) choose_residence();
  platform().setCursor(G.selected_module_group === C.GROUP_BARE);
  draw_selected_module_cost();
  if (G.selected_module_type === C.CST_GREEN) draw_main_window_box(C.red(8));
  else {
    draw_main_window_box(C.green(8));
    G.monument_bul_flag = 0;
    G.river_bul_flag = 0;
    G.shanty_bul_flag = 0;
  }
  G.selected_module_type = type;
  G.selected_module_group = get_group_of_type(G.selected_module_type);
  draw_selected_module_cost();
}
