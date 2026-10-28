// @ts-nocheck
// COW 3.3.3 lagmeter.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { ns_get_lstat, ns_get_nfailures, ns_get_tstat } from './netstat.ts';
import { W_ClearWindow, W_FillArea, W_MakeLine, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, G, P, S, sprintf, strlen } from '../rt/index.ts';
import { L_IBORDER, L_LENGTHTEXT, L_NMARKS, L_TSP } from './consts.ts';


export function lMeterHeight(): number {
  return (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5;
}

export function lMeterWidth(): number {
  return G.W_Textwidth * 3 + 3 + Math.imul(3 * 3, G.W_Textwidth) + 3 * 3 + 2 * 5;
}

export function redrawLMeter(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  let buf = new Int8Array(8);
  W_ClearWindow(G.lMeter);
  for (i = 0; i < L_NMARKS; ++i) {
    sprintf(P(buf), S("%3d"), (L_NMARKS - (i + 1)) * 10);
    W_WriteText(G.lMeter, L_IBORDER, i + Math.imul(i, G.W_Textheight + L_TSP) + L_TSP + 2, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  }
  W_WriteText(G.lMeter, L_IBORDER + Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_TSP, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - L_IBORDER - (G.W_Textheight / 2 | 0) - 3, G.textColor, S("TOT"), 3, G.W_RegularFont);
  W_WriteText(G.lMeter, L_IBORDER + 2 * (Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_TSP), (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - L_IBORDER - (G.W_Textheight / 2 | 0) - 3, G.textColor, S("SLS"), 3, G.W_RegularFont);
  W_WriteText(G.lMeter, L_IBORDER + 3 * (Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_TSP), (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - L_IBORDER - (G.W_Textheight / 2 | 0) - 3, G.textColor, S("NF"), 3, G.W_RegularFont);
  lMeterBox(0, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + L_TSP, L_IBORDER, G.W_Textwidth * 3, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3, G.borderColor);
  lMeterBox(0, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + G.W_Textwidth * 3 + L_TSP + L_TSP, L_IBORDER, G.W_Textwidth * 3, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3, G.borderColor);
  lMeterBox(0, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + 2 * (G.W_Textwidth * 3 + L_TSP) + L_TSP, L_IBORDER, G.W_Textwidth * 3, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3, G.borderColor);
  updateLMeter();
}

export function updateLMeter(): void {
  let sd = 0;
  let sdl = 0;
  let nf = 0;
  let h = 0;
  let color = 0;
  sd = ns_get_tstat();
  sdl = ns_get_lstat();
  nf = ns_get_nfailures();
  lMeterBox(1, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + L_TSP + 1, L_IBORDER + 1, G.W_Textwidth * 3 - 2, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3 - 2, G.backColor);
  if (sd > 0) {
    if (sd > 99) {
      sd = 99;
    }
    color = G.gColor;
    if (sd > 25) {
      color = G.yColor;
    }
    if (sd > 45) {
      color = G.rColor;
    }
    h = Math.trunc(sd * ((G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3) / 100) | 0;
    lMeterBox(1, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + L_TSP + 1, L_IBORDER + ((G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3) - h, G.W_Textwidth * 3 - 2, h - 1, color);
  }
  lMeterBox(1, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + G.W_Textwidth * 3 + L_TSP + L_TSP + 1, L_IBORDER + 1, G.W_Textwidth * 3 - 2, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3 - 2, G.backColor);
  if (sdl > 0) {
    if (sdl > 99) {
      sdl = 99;
    }
    color = G.gColor;
    if (sdl > 25) {
      color = G.yColor;
    }
    if (sdl > 45) {
      color = G.rColor;
    }
    h = Math.trunc(sdl * ((G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3) / 100) | 0;
    lMeterBox(1, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + G.W_Textwidth * 3 + L_TSP + L_TSP + 1, L_IBORDER + ((G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3) - h, G.W_Textwidth * 3 - 2, h - 1, color);
  }
  lMeterBox(1, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + 2 * (G.W_Textwidth * 3 + L_TSP) + L_TSP + 1, L_IBORDER + 1, G.W_Textwidth * 3 - 2, (G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3 - 2, G.backColor);
  if (nf > 0) {
    if (nf > 99) {
      nf = Math.trunc(99) | 0;
    }
    h = Math.trunc(nf * ((G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3) / 100) | 0;
    lMeterBox(1, Math.imul(L_LENGTHTEXT, G.W_Textwidth) + L_IBORDER + 2 * (G.W_Textwidth * 3 + L_TSP) + L_TSP + 1, L_IBORDER + ((G.W_Textheight + 3) * 11 + G.W_Textheight + 3 + 2 * 5 - (G.W_Textheight + 3) - 2 * 5 + 3) - h, G.W_Textwidth * 3 - 1, h - 2, G.rColor);
  }
}

function lMeterBox(filled: number, x: number, y: number, w: number, h: number, color: number): void {
  if (filled) {
    W_FillArea(G.lMeter, x, y, w + 1, h + 1, color);
    return;
  }
  W_MakeLine(G.lMeter, x, y, x + w, y, color);
  W_MakeLine(G.lMeter, x + w, y, x + w, y + h, color);
  W_MakeLine(G.lMeter, x + w, y + h, x, y + h, color);
  W_MakeLine(G.lMeter, x, y + h, x, y, color);
}

export function $init(): void {
}
