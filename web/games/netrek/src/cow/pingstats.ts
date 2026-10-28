// @ts-nocheck
// COW 3.3.3 pingstats.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_ClearWindow, W_FillArea, W_MakeLine, W_WriteText } from './x11window.ts';
import { struct_event, struct_slider__pingstats } from './structs.ts';
import { $cast, $sarrOf, $sat, $u64, G, P, S, snprintf, strlen } from '../rt/index.ts';


let sliders: any;
let textWidth: number;
let initialized: number;

export function pStatsHeight(): number {
  return Math.trunc(336 / 48) * $u64(G.W_Textheight + 5) + 5 | 0;
}

export function pStatsWidth(): number {
  return 260 + (5 * G.W_Textwidth + 2 * 2);
}

export function initPStats(): void {
  let i = 0;
  if (initialized) {
    return;
  }
  initialized = 1;
  sliders[0].var = P(G, "ping_lag");
  sliders[1].var = P(G, "ping_av");
  sliders[2].var = P(G, "ping_sd");
  sliders[3].var = P(G, "ping_iloss_sc");
  sliders[4].var = P(G, "ping_iloss_cs");
  sliders[5].var = P(G, "ping_tloss_sc");
  sliders[6].var = P(G, "ping_tloss_cs");
  if (G.ping_av > 0) {
    sliders[0].max = G.ping_av * 2 > 200 ? G.ping_av * 2 : 200;
    sliders[1].max = G.ping_av * 2 > 200 ? G.ping_av * 2 : 200;
  }
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    sliders[i].label_length = strlen(sliders[i].label) | 0;
    textWidth = textWidth > sliders[i].label_length ? textWidth : sliders[i].label_length;
    sliders[i].diff = sliders[i].max - sliders[i].min;
    sliders[i].lastVal = 0;
  }
}

export function redrawPStats(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  W_ClearWindow(G.pStats);
  initPStats();
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    sliders[i].lastVal = 0;
  }
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    W_WriteText(G.pStats, Math.imul(textWidth - sliders[i].label_length, G.W_Textwidth) + 5, Math.imul(i, G.W_Textheight + 5) + 5, G.textColor, sliders[i].label, sliders[i].label_length, G.W_RegularFont);
    box(0, Math.imul(textWidth + 1, G.W_Textwidth) + 5 - 1, Math.imul(i, G.W_Textheight + 5) + 5 - 1, 260 + (5 * G.W_Textwidth + 2 * 2) - (5 * G.W_Textwidth + 2 * 2) - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth) + 2, G.W_Textheight + 2, G.borderColor);
    sliders[i].lastVal = 0;
  }
}

export function updatePStats(): void {
  let i = 0;
  let value = 0;
  let diff = 0;
  let old_x = 0;
  let new_x = 0;
  let color = 0;
  let s = null;
  initPStats();
  for (i = 0; $u64(i) < Math.trunc(336 / 48); ++i) {
    s = $sat(sliders, i);
    value = s.var.a[s.var.o];
    text(s.var.a[s.var.o], Math.imul(i, G.W_Textheight + 5) + 5);
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
      old_x = Math.imul(s.lastVal, 260 + (5 * G.W_Textwidth + 2 * 2) - (5 * G.W_Textwidth + 2 * 2) - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      new_x = Math.imul(value, 260 + (5 * G.W_Textwidth + 2 * 2) - (5 * G.W_Textwidth + 2 * 2) - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5 + new_x, Math.imul(i, G.W_Textheight + 5) + 5, old_x - new_x, G.W_Textheight, G.backColor);
      if (s.lastVal > s.green && value <= s.green) {
        box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5, Math.imul(i, G.W_Textheight + 5) + 5, new_x, G.W_Textheight, G.gColor);
      } else if (s.lastVal > s.yellow && value <= s.yellow) {
        box(1, Math.imul(textWidth + 1, G.W_Textwidth) + 5, Math.imul(i, G.W_Textheight + 5) + 5, new_x, G.W_Textheight, G.yColor);
      }
    } else {
      if (s.lastVal <= s.yellow && value > s.yellow) {
        color = G.rColor;
        s.lastVal = 0;
      } else if (s.lastVal <= s.green && value > s.green) {
        color = G.yColor;
        s.lastVal = 0;
      } else if (value > s.yellow) {
        color = G.rColor;
      } else if (value > s.green) {
        color = G.yColor;
      } else {
        color = G.gColor;
      }
      old_x = Math.imul(s.lastVal, 260 + (5 * G.W_Textwidth + 2 * 2) - (5 * G.W_Textwidth + 2 * 2) - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
      new_x = Math.imul(value, 260 + (5 * G.W_Textwidth + 2 * 2) - (5 * G.W_Textwidth + 2 * 2) - 2 * 5 - Math.imul(textWidth + 1, G.W_Textwidth)) / s.diff | 0;
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
    W_FillArea(G.pStats, x, y, wid + 1, hei + 1, color);
    return;
  }
  W_MakeLine(G.pStats, x, y, x + wid, y, color);
  W_MakeLine(G.pStats, x + wid, y, x + wid, y + hei, color);
  W_MakeLine(G.pStats, x + wid, y + hei, x, y + hei, color);
  W_MakeLine(G.pStats, x, y + hei, x, y, color);
}

function text(value: number, y: number): void {
  let buf = new Int8Array(6);
  snprintf(P(buf), 6, S("(%3d)"), value);
  W_WriteText(G.pStats, 260 + (5 * G.W_Textwidth + 2 * 2) - (5 * G.W_Textwidth + 2 * 2), y, G.textColor, P(buf), 5, G.W_RegularFont);
}

export function $init(): void {
  sliders = $sarrOf([struct_slider__pingstats.$of(S("round trip time"), 0, 500, 100, 200),
struct_slider__pingstats.$of(S("average r.t. time"), 0, 500, 100, 200),
struct_slider__pingstats.$of(S("lag (st. dev.)"), 0, 100, 20, 50),
struct_slider__pingstats.$of(S("%pack in  loss"), 0, 50, 10, 20),
struct_slider__pingstats.$of(S("%pack out loss"), 0, 50, 10, 20),
struct_slider__pingstats.$of(S("tot %pack loss in"), 0, 50, 5, 10),
struct_slider__pingstats.$of(S("tot %pack loss out"), 0, 50, 5, 10)]);
  textWidth = 0;
  initialized = 0;
}
