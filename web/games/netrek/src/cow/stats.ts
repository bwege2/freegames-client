// @ts-nocheck
// COW 3.3.3 stats.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { troop_capacity } from './util.ts';
import { W_ClearWindow, W_FillArea, W_MakeLine, W_WriteText } from './x11window.ts';
import { struct_event, struct_slider__stats } from './structs.ts';
import { $cast, $sarrOf, $sat, $u64, G, P, S, strlen } from '../rt/index.ts';


let sliders: any;
let textWidth: number;
let initialized: number;

export function initStats(): void {
  let i = 0;
  if (initialized) {
    return;
  }
  initialized = 1;
  sliders[0].var = P(G.me, "p_shield");
  sliders[1].var = P(G.me, "p_damage");
  sliders[2].var = P(G.me, "p_fuel");
  sliders[3].var = P(G.me, "p_speed");
  sliders[4].var = P(G.me, "p_wtemp");
  sliders[5].var = P(G.me, "p_etemp");
  sliders[6].var = P(G.me, "p_armies");
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    sliders[i].label_length = strlen(sliders[i].label) | 0;
    textWidth = textWidth > sliders[i].label_length ? textWidth : sliders[i].label_length;
    sliders[i].diff = sliders[i].max - sliders[i].min;
    sliders[i].lastVal = 0;
  }
}

export function redrawStats(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  W_ClearWindow(G.statwin);
  initStats();
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    sliders[i].lastVal = 0;
  }
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    W_WriteText(G.statwin, Math.imul(textWidth - sliders[i].label_length, G.W_Textwidth) + 5, Math.imul(i, G.W_Textheight + 5) + 5, G.textColor, sliders[i].label, sliders[i].label_length, G.W_RegularFont);
    box(0, Math.imul(textWidth + 1, G.W_Textwidth) + 5 - 1, Math.imul(i, G.W_Textheight + 5) + 5 - 1, 160 - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth) + 2, G.W_Textheight + 2, G.borderColor);
    sliders[i].lastVal = 0;
  }
}

export function updateStats(): void {
  let i = 0;
  let value = 0;
  let diff = 0;
  let old_x = 0;
  let new_x = 0;
  let color = 0;
  let s = null;
  initStats();
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    s = $sat(sliders, i);
    value = s.var.a[s.var.o];
    if (value < s.min) {
      value = s.min;
    } else if (value > s.max) {
      value = s.max;
    }
    if (value === s.lastVal) {
      continue;
    }
    diff = value - s.lastVal;
    if (diff < 0) {
      old_x = Math.imul(s.lastVal, 160 - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      new_x = Math.imul(value, 160 - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5 + new_x, Math.imul(i, G.W_Textheight + 5) + 5, old_x - new_x, G.W_Textheight, G.backColor);
      if (s.lastVal >= s.low_red && value < s.low_red) {
        box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5, Math.imul(i, G.W_Textheight + 5) + 5, new_x, G.W_Textheight, G.warningColor);
      } else if (s.lastVal > s.high_red && value <= s.high_red) {
        box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5, Math.imul(i, G.W_Textheight + 5) + 5, new_x, G.W_Textheight, G.myColor);
      }
    } else {
      if (value < s.low_red) {
        color = G.warningColor;
      } else if (value > s.high_red) {
        color = G.warningColor;
        if (s.lastVal <= s.high_red) {
          s.lastVal = 0;
        }
      } else {
        color = G.myColor;
        if (s.lastVal < s.low_red) {
          s.lastVal = 0;
        }
      }
      old_x = Math.imul(s.lastVal, 160 - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      new_x = Math.imul(value, 160 - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5 + old_x, Math.imul(i, G.W_Textheight + 5) + 5, new_x - old_x, G.W_Textheight, color);
    }
    s.lastVal = value;
  }
}

function box(filled: number, x: number, y: number, wid: number, hei: number, color: number): void {
  if (wid === 0) {
    return;
  }
  if (filled) {
    W_FillArea(G.statwin, x, y, wid + 1, hei + 1, color);
    return;
  }
  W_MakeLine(G.statwin, x, y, x + wid, y, color);
  W_MakeLine(G.statwin, x + wid, y, x + wid, y + hei, color);
  W_MakeLine(G.statwin, x + wid, y + hei, x, y + hei, color);
  W_MakeLine(G.statwin, x, y + hei, x, y, color);
}

export function calibrate_stats(): void {
  let i = 0;
  sliders[0].max = G.me.p_ship.s_maxshield;
  sliders[0].low_red = Math.trunc(0.20000000000000001 * sliders[0].max) | 0;
  sliders[0].high_red = sliders[0].max;
  sliders[1].max = G.me.p_ship.s_maxdamage;
  sliders[2].max = G.me.p_ship.s_maxfuel;
  sliders[2].low_red = Math.trunc(0.20000000000000001 * sliders[2].max) | 0;
  sliders[2].high_red = sliders[2].max;
  sliders[3].max = G.me.p_ship.s_maxspeed;
  sliders[3].high_red = sliders[3].max;
  sliders[4].max = Math.trunc(1.2 * G.me.p_ship.s_maxwpntemp) | 0;
  sliders[4].high_red = Math.trunc(0.66700000000000004 * sliders[4].max) | 0;
  sliders[5].max = Math.trunc(1.2 * G.me.p_ship.s_maxegntemp) | 0;
  sliders[5].high_red = Math.trunc(0.66700000000000004 * sliders[5].max) | 0;
  sliders[6].max = troop_capacity();
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    sliders[i].diff = sliders[i].max - sliders[i].min;
  }
}

export function $init(): void {
  sliders = $sarrOf([struct_slider__stats.$of(S("Shields"), 0, 100, 20, 100),
struct_slider__stats.$of(S("Damage"), 0, 100),
struct_slider__stats.$of(S("Fuel"), 0, 10000, 2000, 10000),
struct_slider__stats.$of(S("Warp"), 0, 9, 0, 9),
struct_slider__stats.$of(S("Weapon Temp"), 0, 1200, 0, 800),
struct_slider__stats.$of(S("Engine Temp"), 0, 1200, 0, 800),
struct_slider__stats.$of(S("Armies"), 0, 10, 0, 10)]);
  textWidth = 0;
  initialized = 0;
}
