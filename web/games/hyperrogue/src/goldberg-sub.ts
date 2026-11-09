// goldberg-sub.cpp of HyperRogue 13.1o: how the Goldberg triangle is mapped onto the tiling (linear, equal-area,
// conformal, gnomonic, tangent adjustment: `gp::su`, the parameter "gp_sub", equal-area by default), through the
// hooks gp::hooks_cornmul / hooks_init_cornmul of goldberg.cpp. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port
// (stage 3, package G2). `gp::su` is G.gp_su (enum class subdivision: the numbers below).
// The debugging option -gbs-debug (a frame hook drawing the mapping) is not ported: NotPorted.
import { NotPorted, addHook, callhooks } from './hyper.ts';
import { G } from './globals.ts';
import type { Ref } from './cpp.ts';
import { S3, S7, hyperbolic } from './classes.ts';
import { laCanvas } from './content.ts';
import type { cell } from './locations.ts';
import {
  type hyperpoint, type transmatrix, C0, hsub, hadd, hmul, tmul, tmulh, hcross, hypot_d, normalize, kleinize,
  get_column, gpushxto0, iso_inverse, mid, tan_auto, atan_auto, compute_area, hnew, rspintox, xpush,
} from './hyperpoint.ts';
import type { hrmap } from './cell.ts';
import { gradient } from './colors.ts';
import { XLAT } from './language.ts';
import { fts } from './hprint.ts';
import { param_enum, P } from './config.ts';
import { dialog_addSelItem, dialog_add_action } from './dialogs.ts';
import { gp_dir_matrix } from './goldberg.ts';
import { arg_add3 } from './commandline.ts';
import { start_game } from './system.ts';
import { cgi } from './geometry.ts';
import { spin } from './embeddings.ts';



/** enum class subdivision { linear, equalarea, conformal, gnomonic_vertex, gnomonic_face, equaldist } */
export const subdivision = { linear: 0, equalarea: 1, conformal: 2, gnomonic_vertex: 3, gnomonic_face: 4, equaldist: 5 } as const;

// EX subdivision su = subdivision::conformal: G.gp_su

function compute_all_areas(recolor: boolean): [number, number] {
  const qty_of: number[] = [];
  const qty_of_standard: number[] = [];

  const areas = new Map<cell, number>();

  const gt = S3() === 3 ? 6 : 4;

  for (const c of (G.currentmap as hrmap).allcells()) {
    const hs: hyperpoint[] = [];
    const t = c.type;
    for (let i = 0; i < t; i++) hs.push((G.currentmap as hrmap).get_corner(c, i));
    hs.push(hs[0]);

    const area = Math.abs(compute_area(hs));

    qty_of.push(area);
    areas.set(c, area);
    if (t === gt) qty_of_standard.push(area);
  }

  const std = qty_of_standard.length ? qty_of_standard : qty_of;
  if (!qty_of.length) return [0, 0];

  const mina = Math.min(...qty_of);
  const maxa = Math.max(...qty_of);

  const mina1 = Math.min(...std);
  const maxa1 = Math.max(...std);

  if (recolor) for (const [c, a] of areas) if (c.land === laCanvas) c.landparam = gradient(0xFF0000, 0x0000FF, mina, a, maxa);

  return [maxa / mina, maxa1 / mina1];
}

const qval = 8;

/** array<ld, qval> vals */
const vals: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

function cornmul(corners: transmatrix, c: hyperpoint, h: Ref<hyperpoint>): boolean {

  const su = G.gp_su;
  if (su === subdivision.gnomonic_face) {
    const co1 = kleinize(get_column(corners, 1));
    const co2 = kleinize(get_column(corners, 2));
    h.v = hadd(hadd(hmul(C0(), c[0]), hmul(co1, c[1])), hmul(co2, c[2]));
    return true;
  }

  if (su === subdivision.gnomonic_vertex || su === subdivision.equaldist) {
    // to do: for gp_style = false */
    const sw = c[2] > c[1] ? -1 : 1;

    let x = 1 - c[1] - c[2];
    let y = 1 - (c[1] - c[2]) * sw;

    const co1 = get_column(corners, 1);
    const co2 = get_column(corners, 2);
    const co = sw === 1 ? co1 : co2;
    const T = gpushxto0(co);
    const dx = kleinize(tmulh(T, mid(co1, co2)));
    const dxy = kleinize(tmulh(T, get_column(corners, 0)));

    if (su === subdivision.equaldist) {
      const lx = hypot_d(2, dx), ly = hypot_d(2, hsub(dxy, dx));
      x = tan_auto(x * atan_auto(lx)) / lx;
      y = tan_auto(y * atan_auto(ly)) / ly;
    }

    const hres = hadd(hadd(C0(), hmul(hsub(dx, C0()), y)), hmul(hsub(dxy, dx), x));

    h.v = tmulh(iso_inverse(T), hres);
    return true;
  }

  const u = hnew();
  u[0] = c[0] * (vals[5] + vals[0] * (c[2] + c[1]) + vals[1] * c[1] * c[2]);
  u[1] = c[1] * (vals[6] + vals[2] * c[2] + vals[3] * c[0] + vals[4] * c[0] * c[2]);
  u[2] = c[2] * (vals[7] + vals[2] * c[1] + vals[3] * c[0] + vals[4] * c[0] * c[1]);
  u[3] = 0;

  h.v = tmulh(corners, u);
  return true;
}

function compute(c: hyperpoint, T: transmatrix): hyperpoint {
  const h: Ref<hyperpoint> = { v: hnew() };
  cornmul(T, c, h);
  return normalize(h.v);
}

function get_ratio(T: transmatrix): number {
  let min_area = 1e6, max_area = 0;
  for (let a = 0; a <= 10; a++)
    for (let b = 0; b <= 10 - a; b++) {
      const h = hnew();
      h[1] = a / 10.; h[2] = b / 10.; h[0] = 1 - h[1] - h[2];
      const eps = 1e-3;
      let r0 = compute(h, T);
      h[0] += eps; h[2] -= eps;
      let r1 = compute(h, T);
      h[0] -= eps; h[1] += eps;
      let r2 = compute(h, T);
      h[1] -= eps; h[2] += eps;
      if (hyperbolic()) { const T1 = gpushxto0(r0); r0 = C0(); r1 = tmulh(T1, r1); r2 = tmulh(T1, r2); }
      let area = hypot_d(3, hcross(hsub(r1, r0), hsub(r2, r0)));
      if (a === 0 && b === 0) area *= 1;
      if (area < min_area) min_area = area;
      if (area > max_area) max_area = area;
    }
  return max_area / min_area;
}

function get_conf_error(T: transmatrix): number {
  let err = 0;
  let tot = 0;
  for (let a = 0; a <= 10; a++)
    for (let b = 0; b <= 10 - a; b++) if (a + b) {
      const h = hnew();
      h[1] = a / 10.; h[2] = b / 10.; h[0] = 1 - h[1] - h[2];
      const eps = 1e-3;
      let r0 = compute(h, T);
      h[1] += eps; h[0] -= eps;
      let r1 = compute(h, T);
      h[1] -= eps; h[0] += eps;

      if (S3() === 4) { h[2] -= eps; h[0] += eps; }
      else { const v = 2 / Math.sqrt(3); h[2] += eps * v; h[1] -= eps * v / 2; h[0] -= eps * v / 2; }
      let r2 = compute(h, T);

      const T1 = gpushxto0(r0); r0 = C0(); r1 = hsub(tmulh(T1, r1), r0); r2 = hsub(tmulh(T1, r2), r0);

      const ax = r1[0], ay = r1[1];
      const bx = r2[0], by = r2[1];

      const alpha = Math.atan2(-(2 * ax * bx + 2 * ay * by), (-ax * ax - ay * ay + bx * bx + by * by)) / 2;

      const d1 = Math.hypot(ax * Math.cos(alpha) + bx * Math.sin(alpha), ay * Math.cos(alpha) + by * Math.sin(alpha));
      const d2 = Math.hypot(ax * Math.sin(alpha) - bx * Math.cos(alpha), ay * Math.sin(alpha) - by * Math.cos(alpha));

      tot++;

      err += (d1 / d2) + (d2 / d1) - 2; // exit(1);
    }
  return err / tot;
}

function zerofun(_T: transmatrix): number { return 0; }

function init_cornmul(T: transmatrix): void {

  for (let i = 0; i < qval; i++) vals[i] = 0;
  if (qval === 8) vals[5] = vals[6] = vals[7] = 1;
  else vals[0] = vals[1] = vals[2] = 1;

  let chk = zerofun;
  if (G.gp_su === subdivision.conformal) chk = get_conf_error;
  if (G.gp_su === subdivision.equalarea) chk = get_ratio;

  let cur = chk(T);

  for (let it = 0; it < 500; it++) {
    const gra: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    let sq = 0;
    for (let i = 0; i < qval; i++) {
      vals[i] += 1e-4;
      gra[i] = cur - chk(T);
      vals[i] -= 1e-4;
      sq += gra[i] * gra[i];
    }
    if (!sq) break;
    sq = 1e-6 / Math.sqrt(sq);

    while (true) {
      for (let i = 0; i < qval; i++) vals[i] += sq * gra[i];
      const cur1 = chk(T);
      if (cur1 < cur) { cur = cur1; sq *= 2; }
      else { for (let i = 0; i < qval; i++) vals[i] -= sq * gra[i]; break; }
    }
  }
}

function config_gpsubs(): void {
  addHook(G.gp_hooks_init_cornmul, 100, init_cornmul);
  addHook(G.gp_hooks_cornmul, 100, cornmul);

  param_enum(P('gp_su'), ['gp_sub', 'gp_sub'], subdivision.equalarea)
    .editable([['linear', 'straight lines remain straight'], ['equal-area', 'try to have tiles of equal area (tiles on corners will still be different)'], ['conformal', 'try to get regularly shaped tiles'], ['gnomonic (vertex)', 'regular in gnomonic projection (centered on pure vertex)'], ['gnomonic (face)', 'regular in gnomonic projection (centered on pure face)'], ['tangent adjustment', 'equal distances on the original edges']], 'Goldberg mapping', 'S'.charCodeAt(0))
    .add_extra(() => {
      const p = compute_all_areas(false);
      dialog_addSelItem(XLAT('cell area ratio (max/min)'), fts(p[0]), 'X'.charCodeAt(0));
      dialog_add_action(() => { compute_all_areas(true); });
      dialog_addSelItem(S3() === 3 ? XLAT('hex only') : XLAT('square only'), fts(p[1]), 'Y'.charCodeAt(0));
      dialog_add_action(() => { compute_all_areas(true); });
    })
    .reaction = () => { if (G.game_active) init_cornmul(gp_dir_matrix(0)); };
}

/** the static initializers of goldberg-sub.cpp: hookc = addHook(hooks_configfile, 100, config_gpsubs) and the
 *  options -gbs-debug, -gbs-ofc, -gbs-areas */
export function register_goldberg_sub(): void {
  addHook(G.hooks_configfile, 100, config_gpsubs);
  arg_add3('-gbs-debug', () => {
    // should have more configuration, but no need for it at the moment
    throw new NotPorted('-gbs-debug (a debugging frame hook)');
  });
  arg_add3('-gbs-ofc', () => {
    start_game();
    G.current_display.view_matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    rotate_view(xpush(-cgi().hcrossf));
    if (S3() === 4) rotate_view(spin(Math.PI / 4));
    G.playermoved = false;
  });
  arg_add3('-gbs-areas', () => { const a = compute_all_areas(true); void a; /* println(hlog, "areas = ", ...) */ });
}

import { rotate_view } from './hypgraph.ts';
void callhooks; void S7; void rspintox; void tmul;
