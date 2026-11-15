// lw/distor.ts: src/distor.c: the wave effect: the battle is drawn through four moving wave shapes
// (fixed point, Allegro's fixsin/fixcos tables), the C version of the line drawer (no assembly on x86_64).

import { type Bitmap, blit, create_bitmap, putpixel } from '../al/bitmap.ts';
import { fixcos, fixsin, fixsqrt, itofix } from '../al/fixed.ts';
import { SCREEN_W } from '../al/screen.ts';
import { G } from './state.ts';
import { VP } from './viewport.ts';

const PI_1024 = 3217;
const DISTORSION_PRECISION = 4096;
const WAVE_SIZE_SCALE = 4;
const DISTORSION_MAX = 10;
const WAVE_MIN_LENGTH = 64;
const MAX_W_DISPLAY = 1100;
const MAX_H_DISPLAY = 900;

let DISTORSION_W = 0;
let DISTORSION_H = 0;
let DISTORSION_TARGET: Bitmap | null = null;
const WAVE_SHAPE_WX = new Int32Array(MAX_W_DISPLAY);
const WAVE_SHAPE_WY = Array.from({ length: DISTORSION_MAX + 2 }, () => new Int32Array(MAX_W_DISPLAY));
const WAVE_SHAPE_X_CORRES: Int32Array[] = new Array(MAX_W_DISPLAY);
const WAVE_SHAPE_HY = new Int32Array(MAX_H_DISPLAY);
const WAVE_SHAPE_HX = Array.from({ length: DISTORSION_MAX + 2 }, () => new Int32Array(MAX_H_DISPLAY));
const WAVE_SHAPE_Y_CORRES: Int32Array[] = new Array(MAX_H_DISPLAY);

function init_distorsion_target(): void {
  const ns = VP.NEXT_SCREEN!;
  if (!DISTORSION_TARGET || DISTORSION_TARGET.w !== ns.w || DISTORSION_TARGET.h !== ns.h) {
    DISTORSION_TARGET = create_bitmap(ns.w, ns.h);
  }
}

export function init_distorsion_displayer(): void {
  init_distorsion_target();
  const w = DISTORSION_TARGET!.w, h = DISTORSION_TARGET!.h;
  DISTORSION_W = Math.trunc((G.CONFIG_WAVE_AMPLI[0]! + G.CONFIG_WAVE_AMPLI[3]!) / WAVE_SIZE_SCALE) + 1;
  DISTORSION_H = Math.trunc((G.CONFIG_WAVE_AMPLI[1]! + G.CONFIG_WAVE_AMPLI[2]!) / WAVE_SIZE_SCALE) + 1;
  // WAVE_SHAPE_X_CORRES[x] points at the row WAVE_SHAPE_HX[k] (C arrays of pointers to arrays)
  for (let x = 0; x < DISTORSION_W + 1; ++x) WAVE_SHAPE_X_CORRES[x] = WAVE_SHAPE_HX[x]!;
  for (let x = DISTORSION_W; x < w - DISTORSION_W - 2; ++x) WAVE_SHAPE_X_CORRES[x] = WAVE_SHAPE_HX[DISTORSION_W + 1]!;
  for (let x = w - DISTORSION_W - 2; x < w - 1; ++x) WAVE_SHAPE_X_CORRES[x] = WAVE_SHAPE_HX[w - x - 2]!;
  WAVE_SHAPE_X_CORRES[w - 1] = WAVE_SHAPE_HX[0]!;
  for (let y = 0; y < DISTORSION_H + 1; ++y) WAVE_SHAPE_Y_CORRES[y] = WAVE_SHAPE_WY[y]!;
  for (let y = DISTORSION_H; y < h - DISTORSION_H - 2; ++y) WAVE_SHAPE_Y_CORRES[y] = WAVE_SHAPE_WY[DISTORSION_H + 1]!;
  for (let y = h - DISTORSION_H - 2; y < h - 1; ++y) WAVE_SHAPE_Y_CORRES[y] = WAVE_SHAPE_WY[h - y - 2]!;
  WAVE_SHAPE_Y_CORRES[h - 1] = WAVE_SHAPE_WY[0]!;
}

function create_wave_line(buffer: Int32Array, length: number, number: number, ampli: number, speed: number, sens: number): void {
  let period;
  length--;
  do {
    period = Math.trunc(length / (number + 1));
    number--;
  } while (number >= 0 && period < WAVE_MIN_LENGTH);
  let period2 = Math.trunc(period / 2);
  if (period2 <= 0) period2 = 1;
  period = period2 * 2;
  const real_length = period * (number + 1);
  const first_entry = Math.trunc((length - real_length) / 2);
  const last_entry = first_entry + real_length;
  const b2 = first_entry;
  const freq_coef = Math.trunc(16777216 / period);
  const ampli_cst = Math.trunc((ampli * DISTORSION_PRECISION) / period2);
  const ampli_cos = Math.trunc((ampli_cst * PI_1024) / 1024);
  let cycle_tmp = 65536;
  while (speed > 0) {
    cycle_tmp = Math.trunc(cycle_tmp / 2);
    speed--;
  }
  cycle_tmp = Math.trunc(fixsqrt(fixsqrt(cycle_tmp)) / 2);
  cycle_tmp = Math.trunc(cycle_tmp / SCREEN_W());
  cycle_tmp *= period;
  if (cycle_tmp <= 0) cycle_tmp = 1;
  const cycle_coef = Math.imul(sens * 256, Math.trunc(itofix(G.GLOBAL_TICKER % cycle_tmp) / cycle_tmp));
  const f0 = fixsin((cycle_coef + Math.imul(freq_coef, period2)) | 0);
  const fp0x0 = Math.trunc((PI_1024 * fixcos((cycle_coef + Math.imul(freq_coef, period2)) | 0)) / 1024);
  let alphax03 = Math.imul(Math.trunc(ampli_cst / 256), Math.trunc((fp0x0 - 2 * f0) / 256));
  let betax02 = Math.imul(Math.trunc(ampli_cst / 256), Math.trunc((-fp0x0 + 3 * f0) / 256));
  for (let i = 0; i < period2; ++i) {
    let temp = Math.trunc(Math.imul(3 * alphax03, i) / period2) + 2 * betax02;
    temp = Math.trunc(Math.imul(temp, i) / period2);
    buffer[b2 + i] = Math.trunc(temp / WAVE_SIZE_SCALE);
  }
  for (let i = period2; i < real_length - period2; ++i) {
    const temp = Math.imul(Math.trunc(ampli_cos / 256), Math.trunc(fixcos((cycle_coef + Math.imul(freq_coef, i)) | 0) / 256));
    buffer[b2 + i] = Math.trunc(temp / WAVE_SIZE_SCALE);
  }
  alphax03 = Math.imul(Math.trunc(ampli_cst / 256), Math.trunc((-fp0x0 - 2 * f0) / 256));
  betax02 = Math.imul(Math.trunc(ampli_cst / 256), Math.trunc((fp0x0 + 3 * f0) / 256));
  for (let i = 0; i < period2; ++i) {
    let temp = Math.trunc(Math.imul(3 * alphax03, i) / period2) + 2 * betax02;
    temp = Math.trunc(Math.imul(-temp, i) / period2);
    buffer[b2 + real_length - 1 - i] = Math.trunc(temp / WAVE_SIZE_SCALE);
  }
  for (let i = 0; i < first_entry; ++i) buffer[i] = 0;
  for (let i = last_entry; i < length; ++i) buffer[i] = 0;
  buffer[length] = 0;
}

function prepare_wave_shapes(): void {
  const w = DISTORSION_TARGET!.w, h = DISTORSION_TARGET!.h;
  const AW = G.CURRENT_AREA_W, AH = G.CURRENT_AREA_H;
  create_wave_line(WAVE_SHAPE_WX, w, G.CONFIG_WAVE_NUMBER[0]!, G.CONFIG_WAVE_AMPLI[0]! * AW, G.CONFIG_WAVE_SPEED[0]!, +1);
  create_wave_line(WAVE_SHAPE_HY, h, G.CONFIG_WAVE_NUMBER[1]!, G.CONFIG_WAVE_AMPLI[1]! * AH, G.CONFIG_WAVE_SPEED[1]!, +1);
  create_wave_line(WAVE_SHAPE_WY[DISTORSION_H + 1]!, w, G.CONFIG_WAVE_NUMBER[2]!, G.CONFIG_WAVE_AMPLI[2]! * AH, G.CONFIG_WAVE_SPEED[2]!, +1);
  create_wave_line(WAVE_SHAPE_HX[DISTORSION_W + 1]!, h, G.CONFIG_WAVE_NUMBER[3]!, G.CONFIG_WAVE_AMPLI[3]! * AW, G.CONFIG_WAVE_SPEED[3]!, +1);
  for (let x = 0; x < w; ++x) {
    WAVE_SHAPE_WX[x] = (WAVE_SHAPE_WX[x]! + AW * DISTORSION_PRECISION) | 0;
    WAVE_SHAPE_WY[0]![x] = 0;
    WAVE_SHAPE_WY[1]![x] = Math.trunc(WAVE_SHAPE_WY[DISTORSION_H + 1]![x]! / DISTORSION_H);
    for (let i = 1; i < DISTORSION_H; ++i) WAVE_SHAPE_WY[i + 1]![x] = WAVE_SHAPE_WY[i]![x]! + WAVE_SHAPE_WY[1]![x]!;
  }
  for (let y = 0; y < h; ++y) {
    WAVE_SHAPE_HY[y] = (WAVE_SHAPE_HY[y]! + AH * DISTORSION_PRECISION) | 0;
    WAVE_SHAPE_HX[0]![y] = 0;
    WAVE_SHAPE_HX[1]![y] = Math.trunc(WAVE_SHAPE_HX[DISTORSION_W + 1]![y]! / DISTORSION_W);
    for (let i = 1; i < DISTORSION_W; ++i) WAVE_SHAPE_HX[i + 1]![y] = WAVE_SHAPE_HX[i]![y]! + WAVE_SHAPE_HX[1]![y]!;
  }
}

export function disp_distorted_area(): void {
  const T = DISTORSION_TARGET!;
  const w = T.w, h = T.h;
  const AW = G.CURRENT_AREA_W, AH = G.CURRENT_AREA_H;
  const lim_w = DISTORSION_PRECISION * w;
  const lim_h = DISTORSION_PRECISION * h;
  const init_w = Math.trunc((AW * DISTORSION_PRECISION) / 2);
  const init_h = Math.trunc((AH * DISTORSION_PRECISION) / 2);
  prepare_wave_shapes();
  const fp_x0 = new Int32Array(w);
  let fp_y0 = init_h;
  let ip_y0 = 0;
  const disp = G.CURRENT_AREA_DISP!;
  const sd = disp.data;
  for (let y = 0; y < h; ++y) {
    let fp_y = fp_y0;
    let fp_x = init_w;
    let src = ip_y0 * AW;
    const y_corres = WAVE_SHAPE_Y_CORRES[y]!;
    for (let x = 0; x < w; ++x) {
      putpixel(T, x, y, (sd[src]! << 24) >> 24);
      const reste_x = (fp_x0[x] = fp_x0[x]! + WAVE_SHAPE_X_CORRES[x]![y]!);
      fp_x += WAVE_SHAPE_WX[x]!;
      while (reste_x < -fp_x) {
        fp_x += lim_w;
        src--;
      }
      while (reste_x + fp_x >= lim_w) {
        fp_x -= lim_w;
        src++;
      }
      fp_y += y_corres[x]!;
      while (fp_y < 0) {
        fp_y += lim_h;
        src -= AW;
      }
      while (fp_y >= lim_h) {
        fp_y -= lim_h;
        src += AW;
      }
    }
    fp_y0 += WAVE_SHAPE_HY[y]!;
    while (fp_y0 >= lim_h) {
      fp_y0 -= lim_h;
      ip_y0++;
    }
  }
  blit(T, VP.NEXT_SCREEN!, 0, 0, 0, 0, T.w, T.h);
  void MAX_H_DISPLAY;
}
