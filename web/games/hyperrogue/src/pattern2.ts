// pattern2.cpp of HyperRogue 13.1o: the standings of individual cells with respect to the patterns (hexagon or
// heptagon, three-colorings, Chessboard, Emerald, Palace, Zebra, Field Pattern) as far as the game rules use them.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Stage 1 ports the pattern functions (lines 1-1512 of pattern2.cpp: ctof ... warptype, namespace patterns'
// getpatterninfo and its helpers, the fieldpattern:: fieldval functions), random_landscape,
// patterns::sevenval, is_master and ccolor::generateCanvas up to the coloring. Left out (a later stage): the
// canvas colorings of namespace ccolor (data, the color tables and functions), the map-coloring functions
// (nearer_map, furthest_map, compute_map_function), the pattern menus (showPattern, cpatterns, computeCgroup)
// and namespace linepatterns (drawing).
//
// Names (PORTING.md, "Overloads"): emeraldval(c) / emeraldval_h(h); fiftyval049(c) / fiftyval049_h(h);
// getHemisphere(c, which) / getHemisphere_h(h, which); patterns::val46 (patterninfo version) is patterns_val46;
// the int val46(cell*) declared before zebra40 (defined in no file of 13.1o) is val46_n.
// The int versions of cdist50/polara50/polarb50/land50 are in patterns.ts (cdist50_n, ...).
// struct patterninfo is a class (copy with clone()); out-parameters `patterninfo& si` are the object itself.
// Calls into other geometries (arcm::, arb::, hat::, kite::, bt::, reg3::, euc::, gp:: beyond get_masters, irr::,
// hybrid::) throw NotPorted inline where their stub modules lack the function.
import { G } from './globals.ts';
import { NotPorted, among } from './hyper.ts';
import type { cell, heptagon } from './locations.ts';
import { cellwalker } from './locations.ts';
import {
  IRREGULAR, PURE, BITRUNCATED, GOLDBERG, INVERSE, WARPED, UNRECTIFIED, UNTRUNCATED, NONSTDVAR, GOLDBERG_INV, DUAL,
  S7, S3, S6, WDIM, a4, a46, a38, a457, cgflags, qPORTALSPACE, mhybrid, mproduct, nil, sol, nih, quotient,
  stdhyperbolic, weirdhyperbolic, OINF, gBolza2, gField435,
} from './classes.ts';
import { laWildWest, laSnakeNest, laCanvas, itBuggy } from './content.ts';
import { bt_in } from './binary-tiling.ts';
import { irr_ctof } from './irregular.ts';
import { arcm_in } from './archimedean.ts';
import { arb_in } from './arbitrile.ts';
import { kite_in } from './kite.ts';
import { hat_in } from './aperiodic-hat.ts';
import { reg3_in } from './reg3.ts';
import { euc_in, euc2_coordinates } from './euclid.ts';
import { gp_get_masters, gp_pseudohept_val, gp_untruncated_shift, gp_get_local_info, gp_get_mapped, gp_in_underlying_geometry, gp_be_in_triangle, gp_loctoh_ort, gp_last_dir, gp_inverse_pseudohept } from './goldberg.ts';
import type { hrmap } from './cell.ts';
import { isize } from './hyper.ts';
import { itrunc } from './cpp.ts';
import { tmulh } from './hyperpoint.ts';
import { cgi } from './geometry.ts';
import { fake_in } from './fake.ts';
import { meuclid, msphere } from './embeddings.ts';
import { celldist, createMov, getCdata, getBits, standard_tiling, valence } from './cell.ts';
import { createStep } from './heptagon.ts';
import { parent_id, type cellfunction } from './expansion.ts';
import { coastvalEdge, isWarped } from './mapeffects.ts';
import { windmap_getId } from './complex.ts';
import { gmod, zgmod, szgmod } from './util.ts';
import { hrand } from './rand.ts';
import {
  emerald_hexagon, cdist50_n, land50_n, polara50_n, polarb50_n, zebratable6,
} from './patterns.ts';
import { fieldpattern_getcurrfp, fieldpattern_btspin } from './fieldpattern.ts';
import { lsSingle } from './landlock.ts';
import { towerval } from './bigstuff.ts';

const notp = (what: string): never => { throw new NotPorted(what); };

/** enum cpatterntype */
export const cpFootball = 0, cpThree = 1, cpChess = 2, cpSingle = 3, cpSingleSym = 4, cpOddEven = 5, cpLarge = 6,
  cpZebra = 7, cpUnknown = 8;

export function enable_canvas(): void {
  G.firstland = G.specialland = laCanvas;
  G.randomPatternsMode = false;
  G.land_structure = lsSingle;
}

export function ctof(c: cell): number {
  // #if CAP_IRR
  if (IRREGULAR()) return irr_ctof(c);
  if (PURE()) return 1;
  // if(meuclid) return 0;
  if (!c) return 1;
  if (bt_in()) return c.type === 7 ? 1 : 0;
  return ishept(c) ? 1 : 0;
  // c->type == 6 ? 0 : 1;
}

export function ctof012(c: cell): number {
  return ishept(c) ? 1 : ishex1(c) ? 0 : 2;
}

function gp_threecolor(): number {
  if ((cgflags() & qPORTALSPACE) !== 0n) return 0;
  if (!GOLDBERG()) return 0;
  // #if CAP_GP
  if (S3() === 3 && (G.gp_param[0] - G.gp_param[1]) % 3 === 0) return 2;
  return 1;
}

function eupattern(c: cell): number {
  if ((cgflags() & qPORTALSPACE) !== 0n) return 0;
  const co = euc2_coordinates(c);
  const x = co[0], y = co[1];
  if (a4())
    return ((x & 1) + 2 * (y & 1)) % 3;
  else
    return gmod(y - x, 3);
}

function eupattern4(c: cell): number {
  const co = euc2_coordinates(c);
  const x = co[0], y = co[1];
  return (x & 1) + ((y & 1)) * 2;
}

export function ishept(c: cell): boolean {
  if ((cgflags() & qPORTALSPACE) !== 0n) return false;
  // EUCLIDEAN
  if (euc_in() && PURE()) return eupattern(c) === 0;
  else if (mhybrid()) return notp('ishept: hybrid::get_where');
  else return c === c.master.c7;
}

export function ishex1(c: cell): boolean {
  if ((cgflags() & qPORTALSPACE) !== 0n) return false;
  // EUCLIDEAN
  if (euc_in() && PURE()) return eupattern(c) === 1;
  // #if CAP_GP
  else if (GOLDBERG()) return c.master.c7 !== c && !pseudohept(c.move(0));
  else return c.master.c7 !== c;
}

function ishex2(c: cell): boolean {
  if ((cgflags() & qPORTALSPACE) !== 0n) return false;
  // EUCLIDEAN
  if (euc_in() && PURE()) return eupattern(c) === 1;
  // #if CAP_GP
  else if (GOLDBERG()) return c.master.c7 !== c && gp_pseudohept_val(c) === 1;
  else return c.master.c7 !== c;
}

export function chessvalue(c: cell): number {
  if ((cgflags() & qPORTALSPACE) !== 0n) return 0;
  // #if CAP_ARCM
  if (arcm_in())
    return notp('chessvalue: arcm::chessvalue');
  // #if CAP_GP
  else if (WARPED())
    return gp_untruncated_shift(c) === 2 ? 1 : 0;
  else if (UNRECTIFIED() && a4()) {
    const li = gp_get_local_info(c);
    const odd_a = (G.gp_param[0] & 1) !== 0;
    const odd_b = (G.gp_param[1] & 1) !== 0;
    // odd-odd
    if (odd_a && odd_b)
      return (li.relative[1] & 1) ^ (li.last_dir & 1) ^ (c.master.dm4 & 1) ^ ((c.master.emeraldval & 1) ? 1 : 0);
    else if (odd_a || odd_b) {
      /* int swapped = 0; ... */
      if ((li.relative[0] ^ li.relative[1]) & 1)
        return (li.relative[0] & 1) ^ ((c.master.cmove(0).emeraldval & 4) ? 1 : 0);
      else
        return (li.relative[0] & 1) ^ ((c.master.emeraldval & 4) ? 1 : 0);
    }
    else
      return (li.relative[1] & 1) ^ (li.last_dir & 1) ^ ((c.master.emeraldval & 1) ? 1 : 0);
  }
  else
    return celldist(c) & 1;
}

export function emeraldval_h(h: heptagon): number { return h.emeraldval >> 3; }

export function emeraldval(c: cell): number {
  if (meuclid()) return eupattern(c);
  if (msphere()) return 0;
  if (ctof(c))
    return emeraldval_h(c.master);
  else {
    const ar = gp_get_masters(c);
    return emerald_hexagon(
      emeraldval_h(ar[0]),
      emeraldval_h(ar[1]),
      emeraldval_h(ar[2]),
    );
  }
}

// === FIFTYVALS ===

function bitmajority(a: number, b: number, c: number): number {
  return ((a & b) | ((a ^ b) & c)) >>> 0;
}

function eufifty(c: cell): number {
  const co = euc2_coordinates(c);
  const x = co[0], y = co[1];
  let ix = x + 99999 + y;
  let iy = y + 99999;
  if (c.land === laWildWest)
    return (ix + iy * 26 + 28) % 37;
  else {
    ix += Math.trunc(iy / 3) * 3;
    iy %= 3; ix %= 9;
    return iy * 9 + ix;
  }
}

function fiftyval(c: cell): number {
  if (meuclid()) return eufifty(c) * 32;
  if (msphere() || S7() > 7 || S6() > 6) return 0;
  if (ctof(c))
    return c.master.fiftyval;
  else {
    const ar = gp_get_masters(c);
    return bitmajority(
      ar[0].fiftyval,
      ar[1].fiftyval,
      ar[2].fiftyval) + 512;
  }
}

export function cdist50(c: cell): number {
  if (meuclid() && S3() === 4) {
    const co = euc2_coordinates(c);
    const x = co[0], y = co[1];
    return Math.abs(szgmod(x, 5)) + Math.abs(zgmod(y, 5));
  }
  if (msphere() || S7() > 7 || S6() > 6) return 0;
  if (meuclid()) {
    if (c.land === laWildWest)
      return '0123333332112332223322233211233333322'.charCodeAt(eufifty(c)) - 48;
    else return '012333321112322232222321123'.charCodeAt(eufifty(c)) - 48;
  }
  if (ctof(c)) return cdist50_n(c.master.fiftyval);
  const ar = gp_get_masters(c);
  const a0 = cdist50_n(ar[0].fiftyval);
  const a1 = cdist50_n(ar[1].fiftyval);
  const a2 = cdist50_n(ar[2].fiftyval);
  if (a0 === 0 || a1 === 0 || a2 === 0) return 1;
  return a0 + a1 + a2 - 5;
}

export function land50(c: cell): number {
  if (msphere() || meuclid()) return 0;
  else if (ctof(c)) return land50_n(fiftyval(c));
  else {
    const ar = gp_get_masters(c);
    for (let i = 0; i < 3; i++)
      if (cdist50_n(ar[i].fiftyval) < 3) return land50_n(ar[i].fiftyval);
    return 0;
  }
}

export function polara50(c: cell): boolean {
  if (msphere() || meuclid() || S7() > 7 || S6() > 6) return false;
  else if (NONSTDVAR()) return polara50_n(fiftyval(c.master.c7));
  else if (ctof(c)) return polara50_n(fiftyval(c));
  else {
    const ar = gp_get_masters(c);
    for (let i = 0; i < 3; i++)
      if (cdist50_n(ar[i].fiftyval) < 3) return polara50_n(ar[i].fiftyval);
    return false;
  }
}

export function polarb50(c: cell): boolean {
  if (meuclid()) return true;
  if (msphere() || meuclid() || S7() > 7 || S6() > 6) return true;
  else if (NONSTDVAR()) return polarb50_n(fiftyval(c.master.c7));
  else if (ctof(c)) return polarb50_n(fiftyval(c));
  else {
    const ar = gp_get_masters(c);
    for (let i = 0; i < 3; i++)
      if (cdist50_n(ar[i].fiftyval) < 3) return polarb50_n(ar[i].fiftyval);
    return false;
  }
}

// int elhextable[28][3] = { {0,1,2}, {1,2,9}, {1,9,-1}, {1,8,-1}, {1,-1,-1} }: unused

export function fiftyval049_h(h: heptagon): number {
  const i = Math.trunc(h.fiftyval / 32);
  if (i <= 7) return i;
  if (quotient()) return 0;
  const allcodes: number[] = [];
  for (let k = 0; k < 7; k++) {
    const h2 = createStep(h, k);
    if (polara50_n(h2.fiftyval) === polara50_n(h.fiftyval) && polarb50_n(h2.fiftyval) === polarb50_n(h.fiftyval))
      allcodes.push(fiftyval049_h(h2));
  }
  const d = allcodes[1] - allcodes[0];
  if (d === -1 || d === 6) { const t = allcodes[0]; allcodes[0] = allcodes[1]; allcodes[1] = t; }
  // printf("%d,%d: %d\n", allcodes[0], allcodes[1], allcodes[0] + 7);
  return allcodes[0] + 7;
}

export function fiftyval049(c: cell): number {
  if (meuclid()) return Math.trunc(fiftyval(c) / 32);
  else if (ctof(c)) return fiftyval049_h(c.master);
  else if (msphere()) return 0;
  else {
    const a = [0, 0, 0]; let qa = 0;
    const pa = polara50(c);
    const pb = polarb50(c);
    const ar = gp_get_masters(c);
    for (let i = 0; i < 3; i++)
      if (polara50_n(ar[i].fiftyval) === pa && polarb50_n(ar[i].fiftyval) === pb)
        a[qa++] = fiftyval049_h(ar[i]);
    // somehow sort(a, a+qa) produces a warning in gcc 12.1.0, so we sort manually
    if (qa === 1) return 43 + a[0] - 1;
    // sort the two elements
    if (a[0] > a[1]) { const t = a[0]; a[0] = a[1]; a[1] = t; }
    if (qa === 2 && a[1] === a[0] + 7) return 36 + a[0] - 1;
    if (qa === 2 && a[1] !== a[0] + 7) return 29 + a[0] - 1;
    // sort the three elements
    if (a[1] > a[2]) { const t = a[1]; a[1] = a[2]; a[2] = t; }
    if (a[0] > a[1]) { const t = a[0]; a[0] = a[1]; a[1] = t; }
    // 168:
    if (a[1] === 1 && a[2] === 7)
      return 15 + 6; // (polarb50(c) ? 0 : 6);
    if (a[2] >= 1 && a[2] <= 7) {
      return 15 + a[1] - 1; // (polarb50(c) ? a[1]%7 : a[1]-1);
    }
    if (a[0] === 1 && a[1] === 7 && a[2] === 8)
      return 22;
    if (a[0] === 1 && a[1] === 7 && a[2] === 14)
      return 22;
    if (a[1] <= 7 && a[2] >= 8)
      return 22 + a[1] - 1;
    return 0;
  }
}

export function fiftyval200(c: cell): number {
  let i = fiftyval049(c);
  i *= 4;
  if (polara50(c)) i |= 1;
  if (polarb50(c)) i |= 2;
  return i;
}

/*
{0,1,2} 15+0..15+6
{1,2,9},22+0..22+6
{1,9}   29+0..29+6
{1,8}   36+0..36+6
{1}     43+0..43+6
*/

// zebraval

function dir_bitrunc457(c: cell): number {
  if (GOLDBERG_INV()) return Math.trunc(c.master.zebraval / 10);
  let wset = 0;
  let has1 = 0;
  for (let i = 0; i < 4; i++) {
    const z = zebra40(createMov(c, i * 2));
    if (z & 1) has1 = 1;
    if (z & 2) wset |= (1 << i);
  }
  if (wset === 0) return -8 - has1;
  if (wset === 15) return -10 - has1;
  if (wset === 3) return 1;
  if (wset === 6) return 3;
  if (wset === 12) return 5;
  if (wset === 9) return 7;
  return 0;
}

/** int val46(cell *c): declared before zebra40, but defined in no file of 13.1o (zebra40 calls it for {4,6}) */
function val46_n(_c: cell): number { return notp('val46(cell*) (declared, never defined in 13.1o)'); }

export function zebra40(c: cell): number {
  if (meuclid()) return pattern_threecolor(c);
  else if (IRREGULAR()) return Math.trunc(c.master.zebraval / 10);
  else if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return gp_in_underlying_geometry(() => zebra40(c1));
  }
  else if (a46()) {
    const v = val46_n(c);
    if (v < 4) return v;
    else return 4 + ((v - 4) >> 1);
  }
  else if (ctof(c)) return Math.trunc(c.master.zebraval / 10);
  else if (a4()) {
    if (GOLDBERG()) return zebra40(c.master.c7);
    const ws = dir_bitrunc457(c);
    if (ws < 0) return -ws;
    let tot = 0;
    const zebras = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      zebras[i] = zebra40(createMov(c, i * 2));
      tot += zebras[i];
    }

    // break cycles
    let cod = 0;
    let mo = 0; for (let i = 0; i < 4; i++) if (zebras[i] < zebras[mo]) mo = i;
    for (let i = 0; i < 4; i++) for (let j = 1; j < i; j++)
      if (zebras[(mo + i) & 3] < zebras[(mo + j) & 3]) cod ^= 4;

    if (tot === 0 + 2 + 4 + 6) return 16 + cod;
    if (tot === 1 + 3 + 5 + 7) return 19 + cod;
    if (tot === 0 + 1 + 2 + 3) return 18 + cod;
    if (tot === 4 + 5 + 6 + 7) return 17 + cod;
    return 24;
  }
  else if (msphere()) return 0;
  else if (S3() === 4 && S7() === 6) {
    return 8 + ((Math.trunc(c.master.zebraval / 10) + c.c.spin(0)) % 2) * 2;
  }
  else if (reg3_in()) return 0;
  else {
    const ii = [0, 0, 0]; let z: number;
    const ar = gp_get_masters(c);
    ii[0] = Math.trunc(ar[0].zebraval / 10);
    ii[1] = Math.trunc(ar[1].zebraval / 10);
    ii[2] = Math.trunc(ar[2].zebraval / 10);
    for (let r = 0; r < 2; r++)
      if (ii[1] < ii[0] || ii[2] < ii[0]) {
        z = ii[0]; ii[0] = ii[1]; ii[1] = ii[2]; ii[2] = z;
      }
    for (let i = 0; i < 28; i++)
      if (zebratable6[i][0] === ii[0] && zebratable6[i][1] === ii[1] &&
        zebratable6[i][2] === ii[2]) {
        const ans = 16 + i;
        // if(ans >= 40) ans ^= 2;
        // if(ans >= 4  && ans < 16) ans ^= 2;
        return ans;
      }
    return 0;
  }
}

export function zebra3(c: cell): number {
  if (meuclid()) return 0;
  else if (ctof(c)) return Math.trunc(Math.trunc(c.master.zebraval / 10) / 4);
  else if (meuclid() || msphere() || S7() > 7 || S6() > 6) return 0;
  else {
    const ii = [0, 0, 0];
    const ar = gp_get_masters(c);
    ii[0] = Math.trunc(Math.trunc(ar[0].zebraval / 10) / 4);
    ii[1] = Math.trunc(Math.trunc(ar[1].zebraval / 10) / 4);
    ii[2] = Math.trunc(Math.trunc(ar[2].zebraval / 10) / 4);
    if (ii[0] === ii[1]) return ii[0];
    if (ii[1] === ii[2]) return ii[1];
    if (ii[2] === ii[0]) return ii[2];
    return 0;
  }
}

// #if CAP_FIELD
// EX namespace fieldpattern {

export function fieldpattern_fieldval(c: cell): [number, boolean] {
  if (WDIM() === 3) { const fp = fieldpattern_getcurrfp(); return [fp.inverses[c.master.fieldval * fp.local_group], false]; }
  else if (ctof(c)) return [c.master.fieldval, false];
  else return [fieldpattern_btspin(c.master.fieldval, c.c.spin(0)), true];
}

export function fieldpattern_fieldval_uniq(c: cell): number {
  return G.currentmap.pattern_value(c);
}

export function fieldpattern_fieldval_uniq_rand(c: cell, randval: number): number {
  if (mhybrid()) return notp('fieldval_uniq_rand: hybrid');
  if (msphere() || meuclid() || NONSTDVAR())
    // we do not care in these cases
    return fieldpattern_fieldval_uniq(c);
  if (ctof(c)) return Math.trunc(fieldpattern_getcurrfp().gmul(c.master.fieldval, randval) / 7);
  else {
    let z = 0;
    for (let u = 0; u < 6; u += 2)
      z = Math.max(z, fieldpattern_btspin(fieldpattern_getcurrfp().gmul(createMov(c, u).master.fieldval, randval), c.c.spin(u)));
    return -1 - z;
  }
}

/** pair<int, int> subval(cell *c, int _subpathid = subpathid, int _subpathorder = subpathorder) (file-local) */
function fieldpattern_subval(c: cell, _subpathid = G.fieldpattern_subpathid, _subpathorder = G.fieldpattern_subpathorder): [number, number] {
  const currfp = fieldpattern_getcurrfp();
  if (_subpathid === -1)
    _subpathid = currfp.code(currfp.strtomatrix('RRRPRRRRRPRRRP'));
  if (_subpathorder === -1)
    _subpathorder = currfp.order(currfp.matrices[G.fieldpattern_subpathid]);

  const less = (a: [number, number], b: [number, number]): boolean => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  if (!ctof(c)) {
    let m = fieldpattern_subval(createMov(c, 0));
    for (let u = 2; u < S6(); u += 2) {
      const m2 = fieldpattern_subval(createMov(c, u));
      if (less(m2, m)) m = m2;
    }
    return m;
  }
  else {
    const pcur: [number, number] = [c.master.fieldval, 0];
    let pbest: [number, number] = [pcur[0], pcur[1]];
    for (let i = 0; i < _subpathorder; i++) {
      pcur[0] = currfp.gmul(pcur[0], _subpathid);
      pcur[1]++;
      if (less(pcur, pbest)) pbest = [pcur[0], pcur[1]];
    }
    return pbest;
  }
}
void fieldpattern_subval;

// EX }

export function getHemisphere_h(h: heptagon, which: number): number {
  const id = h.fiftyval;
  if (S7() === 5) {
    const hemitable = [
      [6, 3, 3, 3, 3, 3, -6, -3, -3, -3, -3, -3],
      [6, 3, 6, 3, 0, 0, -6, -3, -6, -3, 0, 0],
      [-3, 0, 3, 0, -6, -6, 3, 0, -3, 0, 6, 6],
    ];
    return hemitable[which][id];
  }
  else if (S7() === 4 && which < 6) {
    const hemitable = [
      [2, 2, 2, -1, -1, -1],
      [2, -1, 2, 2, -1, -1],
      [2, -1, -1, 2, 2, -1],
    ];
    return hemitable[which][id];
  }
  else if (S7() === 3) {
    const hemitable = [
      [2, 2, -1, -1],
      [2, -1, 2, -1],
      [2, -1, -1, 2],
    ];
    return hemitable[which][id];
  }
  else return 0;
}

export function getHemisphere(c: cell, which: number): number {
  if (meuclid() && quotient()) return 0;
  if (mhybrid()) return notp('getHemisphere: hybrid');
  if (WDIM() === 3 && !mhybrid()) return notp('getHemisphere: 3D (calc_relative_matrix)');
  if (which === 0 && GOLDBERG() && has_nice_dual()) {
    const visited = new Set<cell>();
    const q: cell[] = [];
    const type: number[] = [];
    const visit = (c: cell, t: number): void => {
      if (visited.has(c)) return;
      visited.add(c);
      q.push(c);
      type.push(t);
    };

    let cw = new cellwalker((G.currentmap as hrmap).gamestart(), 0);
    let ct = 1;
    visit(cw.at, ct);
    do {
      cw = cw.plusStep();
      visit(cw.at, -ct);
      cw = cw.plus(2 * ct).addStep().add(ct);
      ct = -ct;
    }
    while (cw.at !== (G.currentmap as hrmap).gamestart());
    for (let i = 0; i < isize(q); i++)
      for (let j = 0; j < q[i].type; j++) {
        const c2 = createMov(q[i], j);
        if (pseudohept(q[i]) || pseudohept(c2))
          visit(c2, type[i]);
      }
    for (let i = 0; i < isize(q); i++) if (q[i] === c) return type[i];
    return 0;
  }
  if (ctof(c))
    return getHemisphere_h(c.master, which);
  else {
    let score = 0;
    // if(0) ;
    // #if CAP_GP
    if (GOLDBERG()) {
      const li = gp_get_local_info(c);
      gp_be_in_triangle(li);
      const corner = tmulh(cgi().gpdata!.corners, gp_loctoh_ort(li.relative));
      const scored =
        corner[0] * getHemisphere(c.master.c7, which)
        + corner[1] * getHemisphere(c.master.move(li.last_dir).c7, which)
        + corner[2] * getHemisphere(c.master.modmove(li.last_dir + 1).c7, which);
      let score = itrunc(scored + 10.5) - 10;
      const error = scored - score;
      if (score === 0 && error > .001) score++;
      if (score === 0 && error < -.001) score--;
      return score;
    }
    else if (INVERSE()) {
      return gp_in_underlying_geometry(() => getHemisphere(c, which));
    }
    // #if CAP_IRR
    else if (IRREGULAR()) return notp('getHemisphere: irr::get_masters');
    else {
      for (let i = 0; i < 6; i += 2)
        score += getHemisphere(c.move(i), which) * (c.c.mirror(i) ? -1 : 1);
      return Math.trunc(score / 3);
    }
  }
}

import { has_nice_dual } from './graph.ts';

// Various functions related to map patterns. (EX namespace patterns)

/** enum ePattern : char */
export const patterns_PAT_NONE = 0;
export const patterns_PAT_TYPES = 'T'.charCodeAt(0);
export const patterns_PAT_ZEBRA = 'z'.charCodeAt(0);
export const patterns_PAT_EMERALD = 'f'.charCodeAt(0);
export const patterns_PAT_PALACE = 'p'.charCodeAt(0);
export const patterns_PAT_FIELD = 'F'.charCodeAt(0);
export const patterns_PAT_DOWN = 'H'.charCodeAt(0);
export const patterns_PAT_COLORING = 'C'.charCodeAt(0);
export const patterns_PAT_SIBLING = 'S'.charCodeAt(0);
export const patterns_PAT_CHESS = 'c'.charCodeAt(0);
export const patterns_PAT_SINGLETYPE = 't'.charCodeAt(0);
export type patterns_ePattern = number;

export const patterns_SPF_ROT = 1;
export const patterns_SPF_SYM01 = 2;
export const patterns_SPF_SYM02 = 4;
export const patterns_SPF_SYM03 = 8;
export const patterns_SPF_CHANGEROT = 16;
export const patterns_SPF_TWOCOL = 32;
export const patterns_SPF_EXTRASYM = 64;
export const patterns_SPF_ALTERNATE = 128;
export const patterns_SPF_FOOTBALL = 256;
export const patterns_SPF_FULLSYM = 512;
export const patterns_SPF_DOCKS = 1024;
export const patterns_SPF_NO_SUBCODES = 2048;

export const patterns_SPF_SYM0123 = patterns_SPF_SYM01 | patterns_SPF_SYM02 | patterns_SPF_SYM03;

const SPF_ROT = patterns_SPF_ROT, SPF_SYM01 = patterns_SPF_SYM01, SPF_SYM02 = patterns_SPF_SYM02,
  SPF_SYM03 = patterns_SPF_SYM03, SPF_CHANGEROT = patterns_SPF_CHANGEROT, SPF_TWOCOL = patterns_SPF_TWOCOL,
  SPF_EXTRASYM = patterns_SPF_EXTRASYM, SPF_ALTERNATE = patterns_SPF_ALTERNATE, SPF_FOOTBALL = patterns_SPF_FOOTBALL,
  SPF_FULLSYM = patterns_SPF_FULLSYM, SPF_DOCKS = patterns_SPF_DOCKS, SPF_NO_SUBCODES = patterns_SPF_NO_SUBCODES;
const PAT_ZEBRA = patterns_PAT_ZEBRA, PAT_EMERALD = patterns_PAT_EMERALD, PAT_PALACE = patterns_PAT_PALACE,
  PAT_FIELD = patterns_PAT_FIELD, PAT_DOWN = patterns_PAT_DOWN, PAT_COLORING = patterns_PAT_COLORING,
  PAT_SIBLING = patterns_PAT_SIBLING, PAT_CHESS = patterns_PAT_CHESS, PAT_SINGLETYPE = patterns_PAT_SINGLETYPE;

/** struct patterninfo (the C++ leaves the fields uninitialized where getpatterninfo does not set them) */
export class patterns_patterninfo {
  id = 0;
  dir = 0;
  reflect = false;
  /** 1 if all symmetries, c->type if no symmetries */
  symmetries = 0;
  clone(): patterns_patterninfo {
    const r = new patterns_patterninfo();
    r.id = this.id; r.dir = this.dir; r.reflect = this.reflect; r.symmetries = this.symmetries;
    return r;
  }
}
type patterninfo = patterns_patterninfo;

function valSibling(c: cell, si: patterninfo, sub: number, pat: number): void {
  // siblings (sphere.cpp): the spherical geometries (S7 < 6), a later stage
  void c; void si; void sub; void pat;
  notp('patterns::valSibling (sphere.cpp siblings)');
}

export function patterns_downdir(c: cell, cf: cellfunction): number {
  return parent_id(c, 1, cf) + 1;
}

/** applySym0123(int& i, int sub): returns the new i */
function applySym0123(i: number, sub: number): number {
  const sym01 = (sub & SPF_SYM01) !== 0;
  const sym02 = (sub & SPF_SYM02) !== 0;
  const sym03 = (sub & SPF_SYM03) !== 0;
  if ((sym01 ? 1 : 0) + (sym02 ? 1 : 0) + (sym03 ? 1 : 0) >= 2) i &= ~3;
  if (sym01 && (i & 1)) i ^= 1;
  if (sym02 && (i & 2)) i ^= 2;
  if (sym03 && (i & 2)) i ^= 3;
  return i;
}

function applyAlt(si: patterninfo, sub: number, pat: number): void {
  if (sub & SPF_ALTERNATE) {
    si.id += 4;
    si.id %= 12;
  }
  if (pat === PAT_COLORING && (sub & SPF_FOOTBALL)) {
    if (si.id === 4) si.dir++;
    si.id = si.id ? 0 : 1;
    if (si.id && (sub & SPF_EXTRASYM))
      si.symmetries = si.id ? 1 : 2;
    return;
  }
}

/** patterns::val46(cell *c, patterninfo &si, int sub, int pat) */
export function patterns_val46(c: cell, si: patterninfo, sub: number, pat: number): void {
  if (ctof(c)) {
    si.id = c.master.emeraldval >> 1;
    si.id = applySym0123(si.id, sub);
    if (sub & SPF_CHANGEROT)
      si.dir = (c.master.emeraldval & 1);
    else
      si.dir = (c.master.emeraldval & 1) ^ (c.master.emeraldval >> 1);
    si.symmetries = 2;
    applyAlt(si, sub, pat);
    /* printf("[%3d] ", c->master->emeraldval);
    for(int i=0; i<6; i++) printf("%2d", val46(createMov(c, i)));
    printf("\n"); */
  }
  else {
    si.id = ((c.master.emeraldval & 1) ^ ((c.master.emeraldval & 2) >> 1) ^ (c.c.spin(0) & 1)) ? 8 : 4;
    si.dir = ((c.move(0).master.emeraldval + c.c.spin(0)) & 1) ? 2 : 0;
    if (createMov(c, si.dir).master.emeraldval & 4)
      si.dir += 4;

    if ((sub & SPF_TWOCOL) && (pat === PAT_COLORING)) si.id = 4;
    else if (pat === PAT_COLORING && si.id === 4) si.dir++;

    if (sub & SPF_SYM01) si.symmetries = 2;
    else if (sub & SPF_SYM03) si.symmetries = 2;
    else if (sub & SPF_SYM02) si.symmetries = 4;

    applyAlt(si, sub, pat);
  }
}

// if(a46) return patterndir46(c, w == PAT_ZEBRA ? 3 : w == PAT_PALACE ? 2 : 1);

function inr(a: number, b: number, c: number): boolean { return a >= b && a < c; }

function val457(c: cell, si: patterninfo, sub: number): void {
  si.id = zebra40(c);
  if (inr(si.id, 8, 12)) si.symmetries = 4;
  si.id = applySym0123(si.id, sub);
  if (sub & SPF_ROT) {
    if (si.id >= 4 && si.id < 7) si.id -= 4;
    if (si.id >= 20 && si.id < 23) si.id -= 4;
  }
  if (ctof(c)) {
    for (let i = 0; i < c.type; i++)
      if ((zebra40(createStep(c.master, i + (S7() >> 1)).c7) & 2) === (zebra40(createStep(c.master, i + 1 + (S7() >> 1)).c7) & 2))
        si.dir = i;
  }
  else {
    const d = dir_bitrunc457(c);
    if (d >= 0) si.dir = d;
    else si.dir = (zebra40(createMov(c, 0)) & 4) ? 2 : 0;
  }
}

export function patterns_val38(c: cell, si: patterninfo, sub: number, pat: number): void {
  const symRotation = (sub & SPF_ROT) !== 0;

  if (ctof(c)) {
    if (!symRotation)
      si.id = (c.master.fiftyval >> 1) & 3;
    else
      si.id = 0;
    if (!BITRUNCATED() && gp_threecolor() !== 2)
      si.id *= 4;
    else
      si.id += 4;
    si.dir = (pat === PAT_COLORING && BITRUNCATED() ? 1 : 0) + (c.master.fiftyval | (c.master.fiftyval & 8 ? 0 : 2));
    si.symmetries = 2;
    si.id += 8;
    si.id %= 12;
    applyAlt(si, sub, pat);
    if ((sub & SPF_DOCKS) && (c.master.fiftyval & 32)) {
      si.id += 16; si.symmetries = 4;
    }
  }
  else {
    let sp = c.c.spin(0);
    // #if CAP_GP
    if (GOLDBERG()) {
      sp = gp_last_dir(c);
      sp ^= ishex2(c) ? 1 : 0;
    }
    if (G.geometry === gBolza2 && (!GOLDBERG() || gp_threecolor() === 2)) {
      const si0 = new patterns_patterninfo();
      const si1 = new patterns_patterninfo();
      // #if CAP_GP
      if (GOLDBERG()) {
        const li = gp_get_local_info(c);
        patterns_val38(c.master.c7, si0, 0, PAT_COLORING);
        patterns_val38(c.master.move(li.last_dir).c7, si1, 0, PAT_COLORING);
      }
      else
      {
        patterns_val38(c.move(0), si0, 0, PAT_COLORING);
        patterns_val38(c.move(2), si1, 0, PAT_COLORING);
      }
      if ((si0.id + 1) % 3 === (si1.id) % 3)
        si.id = 8;
      else
        si.id = 0;
    }
    else
      si.id = 8 * ((c.master.fiftyval & 1) ^ (sp & 1));
    // #if CAP_GP
    if (GOLDBERG() && pseudohept(c)) si.id = 4;
    let dock = false;
    for (let i = 0; i < c.type; i += 2) {
      const fiv = createMov(c, i).master.fiftyval;
      const fv = (fiv >> 1) & 3;
      if (fv === 0) {
        si.dir = (si.id === 8 && pat === PAT_COLORING ? 1 : 0) + i;
        if (fiv & 32) dock = true;
      }
    }
    if (symRotation) si.symmetries = 2;
    si.id += 8;
    si.id %= 12;
    // #if CAP_GP
    if (GOLDBERG() && pat === PAT_COLORING)
      for (let i = 0; i < c.type; i++) {
        const c2 = createMov(c, i);
        let id2 = 4;
        if (!pseudohept(c2)) {
          let sp2 = c2.c.spin(0);
          if (GOLDBERG()) {
            sp2 = gp_last_dir(c2);
            sp2 ^= ishex2(c2) ? 1 : 0;
          }
          id2 = 8 * ((c2.master.fiftyval & 1) ^ (sp2 & 1));
        }
        //          printf("%p %2d : %d %d\n", c, si.id, i, id2);
        if ((id2 + 4) % 12 === si.id) si.dir = i;
      }
    applyAlt(si, sub, pat);
    if (dock && (sub & SPF_DOCKS)) si.id += 16;
  }
}

function valEuclid6(c: cell, si: patterninfo, sub: number): void {
  const symRotation = (sub & SPF_ROT) !== 0;
  si.id = ishept(c) ? 4 : ishex1(c) ? 8 : 0;
  if (sub & SPF_CHANGEROT) {
    si.dir = (zebra40(c) * 4) % 6;
  }
  if (symRotation) si.id = 1;
  if (euc_in(2, 6) && (sub & SPF_FULLSYM))
    si.symmetries = 1;
}

function valEuclid4(c: cell, si: patterninfo, sub: number): void {
  si.id = eupattern4(c);
  si.id = applySym0123(si.id, sub);
  if (sub & SPF_CHANGEROT) {
    const dirt = [0, 1, 3, 2];
    si.dir = dirt[si.id];
    if (c.type === 8) si.dir *= 2;
  }
  if (sub & SPF_SYM03) {
    si.id *= 4;
    applyAlt(si, sub, PAT_COLORING);
  }
  else
    si.symmetries = (sub & SPF_EXTRASYM) ? (c.type >> 2) : c.type;
}

function val_all(c: cell, si: patterninfo, sub: number, pat: number): void {
  if (IRREGULAR() || arcm_in() || bt_in() || arb_in() || WDIM() === 3 || G.currentmap.strict_tree_rules()) si.symmetries = c.type;
  else if (a46()) patterns_val46(c, si, sub, pat);
  else if (a38()) patterns_val38(c, si, sub, pat);
  else if (S7() < 6 && S3() === 3 && !INVERSE() && !aperiodic_()) valSibling(c, si, sub, pat);
  else if (euc_in(2, 4)) valEuclid4(c, si, sub);
  else if (euc_in(2, 6)) valEuclid6(c, si, sub);
  else if (a4()) val457(c, si, sub);
  else si.symmetries = ctof(c) ? 1 : 2;
}

function aperiodic_(): boolean { return kite_in() || hat_in(); } // classes.ts aperiodic() (qAPERIODIC)

function val_warped(c: cell, si: patterninfo): void {
  let u = ishept(c) ? 1 : 0;
  if (S3() !== 3 || S7() !== 7 || NONSTDVAR()) {
    si.id = u;
    si.dir = 1;
    return;
  }
  let qhex = 0;
  for (let v = 0; v < c.type; v++) if (c.move(v) && !isWarped(c.move(v))) {
    u += 2;
    if (!ishept(c.move(v))) qhex++;
  }
  if (u === 8 && qhex === 2) u = 12;
  else if (u === 2 && qhex === 1) u = 8;
  else if (u === 6 && qhex === 2) u = 10;
  si.id = u;

  if (u === 6) {
    for (let i = 1; i < c.type; i += 2) if (!isWarped(createMov(c, i)))
      si.dir = i;
  }

  else if (u === 2 || u === 3 || u === 8) {
    for (let i = 0; i < c.type; i++) if (!isWarped(createMov(c, i)))
      si.dir = i;
  }

  else if (u === 4 || u === 10) {
    for (let i = 0; i < c.type; i += 2) if (!isWarped(createMov(c, i)))
      si.dir = i;
    if (u === 4)
      si.reflect = !isWarped(createMov(c, (si.dir + 1) % S6()));
  }

  else if (u === 6) {
    for (let i = 1; i < c.type; i += 2) if (!isWarped(createMov(c, i)))
      si.dir = i;
  }

  else if (u === 5) {
    for (let i = 0; i < c.type; i++) if (!isWarped(createMov(c, (i + (S7() >> 1)) % S7())) && !isWarped(createMov(c, (i + ((S7() + 1) >> 1)) % S7())))
      si.dir = i;
  }

  else if (u === 9) {
    for (let i = 0; i < c.type; i++) if (!isWarped(createMov(c, (i + 2) % S7())) && !isWarped(createMov(c, (i + S7() - 2) % S7())))
      si.dir = i;
  }

  else if (u === 11) {
    for (let i = 0; i < c.type; i++) if (isWarped(createMov(c, (i) % S7())) && isWarped(createMov(c, (i + 1) % S7())))
      si.dir = i;
  }

  else if (u === 12) {
    for (let i = 0; i < c.type; i += 2) if (isWarped(createMov(c, i))) {
      si.dir = i;
      si.reflect = !isWarped(createMov(c, (i + 1) % S6()));
    }
  }

  else if (u === 7) {
    for (let i = 0; i < c.type; i++) if (!isWarped(createMov(c, (i + 1) % S7())) && !isWarped(createMov(c, (i + S7() - 1) % S7())))
      si.dir = i;
  }
}

function val_nopattern(c: cell, si: patterninfo, sub: number): void {
  // use val_all for nicer rotation
  val_all(c, si, 0, 0);

  // get id:
  if ((GOLDBERG() ? (S3() === 3) : !weirdhyperbolic()) && isWarped(c))
    val_warped(c, si);
  else {
    si.id = pseudohept(c) ? 1 : 0;
    if (euc_in()) {
      si.dir = ishex1(c) ? 0 : 3;
      if (ctof(c)) si.symmetries = 3;
      if (G.patterns_subpattern_flags & SPF_EXTRASYM)
        si.symmetries = Math.trunc(si.symmetries / 3);
      if (G.patterns_subpattern_flags & SPF_FULLSYM)
        si.symmetries = 1;
    }
    if (msphere() && BITRUNCATED() && !(S7() === 3))
      si.symmetries = ctof(c) ? 1 : 2;
    if (msphere() && (sub & SPF_EXTRASYM)) {
      si.symmetries = ctof(c) ? 1 : 2;
    }
    if (a38())
      si.symmetries = (ctof(c) && BITRUNCATED()) ? 1 : 2;
    if (a457()) {
      si.symmetries = ctof(c) ? 1 : 2;
      if (!ctof(c)) si.dir = 0;
    }
    if (a46()) {
      si.symmetries = ctof(c) ? 1 : 2;
    }
  }

  if (GOLDBERG() && has_nice_dual() && !ishept(c) && ishex1(c)) si.dir = gmod(si.dir + 3, S6());
}

// whichPattern, subpattern_flags: G

function val_threecolors(c: cell, si: patterninfo, sub: number): void {
  let pcol = pattern_threecolor(c);
  si.id = pcol * 4;
  pcol = (pcol + 1) % 3;
  si.dir = -1;
  for (let i = 0; i < c.type; i++)
    if (pattern_threecolor(createMov(c, i)) === pcol) {
      if (si.dir === -1) si.dir = i;
      else {
        si.symmetries = i - si.dir;
        break;
      }
    }
  if (euc_in(2, 6) && (sub & SPF_CHANGEROT)) {
    if (GOLDBERG()) {
      const li = gp_get_local_info(c);
      if (li.first_dir >= 0)
        si.dir = gmod(zebra40(c) * 4 - li.total_dir - li.last_dir, 6);
      else
        si.dir = gmod(zebra40(c) * 4, 6);
    }
    else if (c === c.master.c7)
      si.dir = (zebra40(c) * 4) % 6;
    else
      si.dir = (zebra40(c) * 4 + 9 - c.c.spin(0)) % 6;
  }
  if (sub & SPF_ROT) si.id = 1;
  if (euc_in(2, 6) && !(sub & SPF_EXTRASYM)) {
    si.symmetries = 6;
  }
  if (euc_in(2, 6) && (sub & SPF_FULLSYM))
    si.symmetries = 1;
  applyAlt(si, sub, PAT_COLORING);
}

export function patterns_getpatterninfo(c: cell, pat: patterns_ePattern, sub: number): patterns_patterninfo {
  if (fake_in()) return notp('getpatterninfo: fake (FPIU)');
  if (!(sub & SPF_NO_SUBCODES)) {
    const si = patterns_getpatterninfo(c, pat, sub | SPF_NO_SUBCODES);
    // if(1) ; else if(IRREGULAR) ... else if(arcm::in()) ... else if(GOLDBERG) ...: the branches after if(1) are dead
    return si;
  }
  const symRotation = (sub & SPF_ROT) !== 0;
  // bool sym0 = sub & (SPF_SYM01 | SPF_SYM02 | SPF_SYM03);

  const si = new patterns_patterninfo();
  si.dir = 0; si.reflect = false; si.id = ctof(c);
  si.symmetries = c.type;

  if (bt_in()) {
    if (pat === PAT_SINGLETYPE) si.id = 0;
    else si.id = c.type & 1;
    si.dir = 2;
    return si;
  }

  if (pat === PAT_SINGLETYPE) {
    si.id = 0; si.symmetries = 1;
    if (sub & SPF_TWOCOL) si.id = c.type & 1;
    if (sub & SPF_EXTRASYM) si.reflect = true;
    return si;
  }

  if (G.currentmap.strict_tree_rules()) return si;

  if (arb_in()) return notp('getpatterninfo: arb');

  // #if CAP_ARCM
  if (arcm_in() && pat === 0) return notp('getpatterninfo: arcm');

  if (pat === PAT_ZEBRA && stdhyperbolic()) {

    si.id = zebra40(c); // 4 to 43
    const t4 = si.id >> 2; let tcdir = 0;

    if (PURE()) tcdir = si.id ^ 1;

    else if (t4 === 10) tcdir = si.id - 20;
    else if (t4 >= 4 && t4 < 7) tcdir = 40 + (si.id & 3);
    else if (t4 >= 1 && t4 < 4) tcdir = si.id + 12;
    else if (t4 >= 7 && t4 < 10) tcdir = si.id - 24;

    for (let i = 0; i < c.type; i++) if (c.move(i) && zebra40(c.move(i)) === tcdir)
      si.dir = i;

    si.id = applySym0123(si.id, sub);

    if (symRotation) {
      if (si.id >= 8 && si.id < 12) si.id -= 4;
      if (si.id >= 12 && si.id < 16) si.id -= 8;
      if (si.id >= 20 && si.id < 24) si.id -= 4;
      if (si.id >= 24 && si.id < 28) si.id -= 8;
      if (si.id >= 32 && si.id < 36) si.id -= 4;
      if (si.id >= 36 && si.id < 40) si.id -= 8;
    }

    if (si.id >= 40 && si.id < 44 && symRotation)
      si.symmetries = 2;

    if (si.id >= 40 && si.id < 44 && (sub & (SPF_SYM02 | SPF_SYM03)))
      si.symmetries = 2;
  }

  else if (pat === PAT_EMERALD && (stdhyperbolic() || a38())) {
    si.id = emeraldval(c); // 44 to 99
    if (!meuclid()) {
      let tcdir = 0, tbest = (si.id & 3);
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (c2) {
          const t2 = emeraldval(c2);
          if ((si.id & 3) === (t2 & 3) && t2 > tbest) {
            tbest = t2; tcdir = i;
          }
        }
      }
      si.dir = tcdir;
    }
    si.id = applySym0123(si.id, sub);
    if (si.id >= 44 && si.id < 48)
      si.symmetries = 2;
  }

  else if (pat === PAT_PALACE && stdhyperbolic()) {
    si.id = fiftyval200(c);

    si.reflect = polara50(c);

    let look_for = -1;
    let shft = 0;
    if (inr(si.id, 0, 4)) {
      look_for = si.id + (PURE() ? 4 : 60);
      if (symRotation) si.symmetries = 1;
    }
    else if (inr(si.id, 4, 32)) look_for = si.id + (PURE() ? 28 : 168);
    else if (inr(si.id, 32, 60)) look_for = si.id + (PURE() ? -28 : 112);
    else if (inr(si.id, 60, 88)) { look_for = si.id - 56; shft = si.reflect ? 1 : 5; }
    else if (inr(si.id, 88, 116)) { look_for = si.id - 84; shft = 3; }
    else if (inr(si.id, 116, 144)) look_for = si.id + 56;
    else if (inr(si.id, 144, 172)) look_for = si.id + 28;
    else if (inr(si.id, 172, 200)) look_for = si.id - 28;

    si.dir = -1;
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      if (fiftyval200(c2) === look_for)
        si.dir = (i + shft) % c.type;
    }

    if (si.dir === -1) {
      si.dir = 0;
      // if(c->cpdist <= 1) printf("Not found for ID = %d (lf=%d)\n", si.id, look_for);
      c.item = itBuggy;
    }
    si.id = applySym0123(si.id, sub);

    if (symRotation && si.id >= 4)
      si.id -= ((Math.trunc(si.id / 4) - 1) % 7) * 4;
  }

  else if (pat === PAT_PALACE && meuclid()) {
    si.id = fiftyval049(c);
    si.symmetries = 6;
  }

  else if (pat === PAT_PALACE) {
    val_nopattern(c, si, sub);
    si.id = c.master.fiftyval;
  }

  else if (pat === PAT_DOWN) {
    si.id = towerval(c, coastvalEdge);
    si.dir = patterns_downdir(c, coastvalEdge);
  }

  // #if CAP_FIELD
  else if (pat === PAT_FIELD) {
    if (meuclid())
      // use the torus ID
      si.id = fieldpattern_fieldval_uniq(c);
    else if (PURE() && standard_tiling())
      // use the actual field codes
      si.id = fieldpattern_fieldval(c)[0];
    else
      // use the small numbers from windmap
      si.id = windmap_getId(c);
    // todo dir
  }

  else if (msphere() && pat === PAT_SIBLING) {
    val_all(c, si, sub, pat);
  }

  else if (a457() && pat === PAT_ZEBRA) {
    val_all(c, si, sub, pat);
  }

  else if (GOLDBERG()) {
    const football = (pat === PAT_COLORING && (sub & SPF_FOOTBALL)) || pat === 0;
    if (football) val_nopattern(c, si, sub);
    else val_threecolors(c, si, sub);
  }

  else if (pat === PAT_COLORING && (S7() === 4 || meuclid() || (a38() && gp_threecolor() === 1) || arcm_in())) {
    val_threecolors(c, si, sub);
  }

  else if (pat === PAT_COLORING && (a46() || a38())) {
    val_all(c, si, sub, pat);
  }

  else if (pat === PAT_CHESS) {
    val_nopattern(c, si, sub);
    si.id = chessvalue(c);
  }

  else
    val_nopattern(c, si, sub);

  return si;
}

/** inline patterninfo getpatterninfo0(cell *c) */
export function patterns_getpatterninfo0(c: cell): patterns_patterninfo {
  return patterns_getpatterninfo(c, G.patterns_whichPattern, G.patterns_subpattern_flags);
}

// EX }

export function geosupport_chessboard(): boolean {
  return (arcm_in() && PURE()) ? notp('geosupport_chessboard: arcm') :
    (arcm_in() && DUAL()) ? notp('geosupport_chessboard: arcm') :
      WARPED() ? true :
        INVERSE() ? false :
          (bt_in() || aperiodic_()) ? false :
            (S3() >= OINF) ? true :
              (valence() % 2 === 0);
}

export function geosupport_threecolor(): number {
  if (IRREGULAR()) return 0;
  if (aperiodic_() || bt_in()) return 0;
  // #if CAP_ARCM
  if (arcm_in() && PURE()) return notp('geosupport_threecolor: arcm');
  if (arcm_in() && BITRUNCATED()) return notp('geosupport_threecolor: arcm');
  if (arcm_in() && DUAL()) return 0; // it sometimes does support threecolor, but it can be obtained in other ways then
  if (euc_in(2, 4) && BITRUNCATED()) return 2;
  if (a46() && BITRUNCATED()) return 2;
  if (INVERSE()) return 0;
  if (BITRUNCATED() && S3() === 3) {
    if (S7() % 2) return 1;
    return 2;
  }
  if (S3() >= OINF) return 0;
  if ((S7() % 2 === 0) && (S3() === 3))
    return 2;
  if (a46() && PURE())
    return 1;
  return 0;
}

export function geosupport_football(): number {
  // always works in bitrunc geometries
  if (BITRUNCATED()) return 2;
  if (INVERSE()) return 0;
  if (bt_in() || aperiodic_()) return 0;

  // #if CAP_ARCM
  if (arcm_in() && DUAL()) return 0;
  // it sometimes does support football, but it can be obtained in other ways then

  if (arcm_in() /* PURE */) return notp('geosupport_football: arcm');

  if (arb_in()) return notp('geosupport_football: arb::current.have_ph');

  // #if CAP_IRR
  if (IRREGULAR()) return notp('geosupport_football: irr::bitruncations_performed');

  // always works in patterns supporting three-color
  const tc = Math.max(geosupport_threecolor(), gp_threecolor());
  if (tc) return tc;

  if (S3() === 3 && S7() === 7) return 1;
  // nice chessboard pattern, but not the actual Graveyard
  if (S3() === 4 && !(S7() & 1)) return 1;
  if (S3() === 4 && GOLDBERG()) return 1;
  return 0;
}

export function pattern_threecolor(c: cell): number {
  // #if CAP_ARCM
  if (arcm_in()) {
    if (PURE())
      return notp('pattern_threecolor: arcm::threecolor');
    else /* if(BITRUNCATED) */
      return c.master.rval1;
  }
  if (arb_in()) return notp('pattern_threecolor: arb::id_of');
  if (IRREGULAR() || bt_in()) return pseudohept(c) ? 0 : 1;
  // #if CAP_GP
  if (S3() === 3 && !(S7() & 1) && gp_threecolor() === 1 && c.master.c7 !== c) {
    const li = gp_get_local_info(c);
    const rel = gmod(li.relative[0] - li.relative[1], 3);
    const par = gmod(G.gp_param[0] - G.gp_param[1], 3);
    if (rel === 0)
      return pattern_threecolor(c.master.c7);
    else if (rel === par)
      return pattern_threecolor(c.master.cmove(li.last_dir).c7);
    else
      return pattern_threecolor(c.master.cmodmove(li.last_dir + 1).c7);
  }
  if (a38()) {
    // if(GOLDBERG && gp_threecolor() == 2 && gp::pseudohept_val(c) == 0) return 0;
    const si = new patterns_patterninfo();
    patterns_val38(c, si, !BITRUNCATED() ? 0 : SPF_ROT, PAT_COLORING);
    return si.id >> 2;
  }
  if (euc_in(2, 6) && gp_threecolor() === 2) {
    const li = gp_get_local_info(c);
    let rel = gmod(li.relative[0] - li.relative[1], 3);
    if (rel && (li.last_dir & 1)) rel = 3 - rel;
    return rel;
  }
  // #if CAP_GP
  if (a4() && GOLDBERG()) {
    const si = new patterns_patterninfo();
    const li = gp_get_local_info(c);
    if (S7() & 1) return (li.relative[0] & 1) + (li.relative[1] & 1) * 2;
    patterns_val46(c.master.c7, si, 0, PAT_COLORING);
    let i = si.id;
    if (i & 2) i ^= 1;
    patterns_val46(createStep(c.master, li.last_dir).c7, si, 0, PAT_COLORING);
    if (si.id & 2) si.id ^= 1;
    const i2 = i ^ si.id;
    const i3 = 3 - i2;
    if (G.gp_param[0] % 2 === 0 && G.gp_param[1] % 2 === 0) i = 0;
    if (li.relative[0] & 1) i ^= i3;
    if (li.relative[1] & 1) i ^= i2;
    return i;
  }
  if (a46() && BITRUNCATED()) {
    const si = new patterns_patterninfo();
    patterns_val46(c, si, 0, PAT_COLORING);
    const i = si.id;
    return i >> 2;
  }
  if (meuclid()) {
    if (a4() && PURE()) return eupattern4(c);
    if (a4() && BITRUNCATED()) return eupattern4(c) % 3;
    if (euc_in(2, 6) && !BITRUNCATED()) return eupattern(c) % 3;
    return c === c.master.c7 ? 0 : (c.c.spin(0) & 1) ? 1 : 2;
  }
  if (S3() >= OINF) return c.master.distance % 3;
  if (S7() === 4 && S3() === 3) {
    const codesN = [0, 1, 2, 1, 2, 0];
    // #if CAP_GP
    if (gp_threecolor() === 2) {
      const li = gp_get_local_info(c);
      let sp = gmod(li.relative[0] + 2 * li.relative[1], 3);
      if (sp !== 0) {
        if (li.last_dir & 1)
          sp = 3 - sp;
        if (among(c.master.fiftyval, 1, 3, 5))
          sp = 3 - sp;
      }
      return sp;
    }
    if (PURE())
      return codesN[c.master.fiftyval];
    if (ctof(c))
      return 0;
    else for (let i = 0; i < 3; i++) {
      const c2 = c.move(i);
      if (c2.master.fiftyval === 0)
        return 1 + (c.c.spin(i) & 1);
      if (c2.master.fiftyval === 5)
        return 2 - (c.c.spin(i) & 1);
    }
  }
  if (stdhyperbolic() && PURE()) {
    const z = zebra40(c);
    if (z === 5 || z === 8 || z === 15) return 0;
    if (c.land === laSnakeNest) {
      if (z === 10 || z === 12 || z === 7) return 2;
      if (z === 6 || z === 9) return 3;
      if (z === 14 || z === 11) return 4;
    }
    return 1;
  }
  if (a46() && !BITRUNCATED()) {
    const si = new patterns_patterninfo();
    patterns_val46(c, si, 0, PAT_COLORING);
    return si.id;
  }
  if (S7() === 5 && PURE() && S3() === 3) {
    const codes = [1, 2, 0, 3, 2, 0, 0, 1, 3, 1, 2, 3];
    return codes[c.master.fiftyval];
  }
  if (S7() === 3 && PURE())
    return c.master.fiftyval;
  // #if CAP_GP
  if (gp_threecolor() && (S7() & 1))
    return gp_pseudohept_val(c) > 0 ? 1 : 0;
  return ishept(c) ? 0 : 1;
}

/** returns ishept in the normal tiling;
 *  in the 'pure heptagonal' tiling, returns true for a set of cells
 *  which roughly corresponds to the heptagons in the normal tiling */
export function pseudohept(c: cell): boolean {
  // #if CAP_IRR
  if (IRREGULAR()) return notp('pseudohept: irr::pseudohept');
  if (mhybrid()) { void mproduct; return notp('pseudohept: hybrid::get_where'); }
  // #if CAP_BT
  if (nil()) return (c.master.zebraval & c.master.emeraldval & c.master.fieldval & 1) !== 0;
  if (sol()) return (c.master.emeraldval % 3 === 2) && (c.master.zebraval % 3 === 2) && (c.master.distance % 2 !== 0);
  if (nih()) return c.master.zebraval % 3 === 2 && c.master.emeraldval % 2 === 1 && (c.master.distance % 2 !== 0);
  if (kite_in()) return notp('pseudohept: kite::getshape');
  if (hat_in()) return notp('pseudohept: hat::pseudohept');
  if (bt_in()) return notp('pseudohept: bt::pseudohept');
  if (S3() >= OINF) return c.master.distance % 3 === 1;
  // #if MAXMDIM == 4
  if (WDIM() === 3) {
    if (G.geometry === gField435) return false;
    else if (euc_in()) return notp('pseudohept: euc::pseudohept');
    else return notp('pseudohept: reg3::pseudohept');
  }
  // #if CAP_ARCM
  if (arcm_in()) return notp('pseudohept: arcm::pseudohept');
  if (arb_in()) return notp('pseudohept: arb::pseudohept');
  // #if CAP_GP
  if (INVERSE()) return gp_inverse_pseudohept(c);
  if (GOLDBERG() && gp_threecolor() === 2)
    return gp_pseudohept_val(c) === 0;
  if (GOLDBERG() && gp_threecolor() === 1 && (S7() & 1) && (S3() === 3))
    return gp_pseudohept_val(c) === 0;
  return pattern_threecolor(c) === 0;
}

/** like pseudohept, but return randomly if no pseudohept is available */
export function pseudohept_r(c: cell): boolean {
  if (UNTRUNCATED() || UNRECTIFIED())
    return hrand(100) < 20;
  return pseudohept(c);
}

/** while Krakens movement is usually restricted to non-pseudohept cells,
 *  there is one special case when this does not work (because non-pseudohept cells have varying degrees) */
export function kraken_pseudohept(c: cell): boolean {
  // if(0);
  // #if CAP_GP
  if (!meuclid() && S3() === 4 && GOLDBERG() && (G.gp_param[0] % 2 || G.gp_param[1] % 2 || S7() % 2)) return ishept(c);
  // #if CAP_IRR
  else if (IRREGULAR())
    return c.type !== 6;
  // #if CAP_ARCM
  else if (arcm_in() && PURE())
    return notp('kraken_pseudohept: arcm::current.triangles');
  else if (arcm_in() && BITRUNCATED())
    return pseudohept(c);
  else if (arcm_in() && DUAL())
    return false;
  else if (!meuclid() && S3() === 3 && !(S7() & 1) && gp_threecolor() === 1)
    return ishept(c);
  else
    return pseudohept(c);
}

export function warptype(c: cell): boolean {
  if (geosupport_chessboard())
    return chessvalue(c) !== 0;
  else if (NONSTDVAR())
    return pseudohept(c);
  else
    return pattern_threecolor(c) === 0;
}

// EX namespace ccolor: the canvas colorings (a later stage). generateCanvas is what landgen.cpp calls for the
// Canvas land; the hooks run, the apeirogonal case and the coloring (*which)(c) are not ported.

// apeirogonal_color, rwalls, live_canvas, hooks_generate_canvas: G

export function ccolor_generateCanvas(c: cell): number {
  const i = G.ccolor_hooks_generate_canvas.callhandlers(-1, c);
  if (i !== -1) return i;
  // if(arb::apeirogon_consistent_coloring && arb::is_apeirogonal(c)): arbitrary tilings (a later stage)
  if (arb_in()) return notp('ccolor::generateCanvas: arb');
  return notp('ccolor::generateCanvas: (*which)(c) (the canvas colorings, a later stage)');
}

export function ccolor_always_available(): boolean { return true; }

export function random_landscape(c: cell, mul: number, div: number, _step: number, base: number): number {
  const col = [0, 0, 0, 0];
  for (let j = 0; j < 4; j++) {
    col[j] = getCdata(c, j);
    col[j] = Math.imul(col[j], mul);
    col[j] %= 240;
    if (col[j] > 120) col[j] = 240 - col[j];
    if (col[j] < -120) col[j] = -240 - col[j];
  }
  col[0] = Math.trunc(col[0] / div);
  col[1] = Math.trunc(col[1] / div);
  col[2] = Math.trunc(col[2] / div);
  // if(ISWEB) ...: not the desktop build
  let res = (base + col[0] + (col[1] << 8) + (col[2] << 16)) >>> 0;
  if (WDIM() === 3 && (getBits(c) & 1)) res = (res | 0x1000000) >>> 0;
  return res;
}

// EX namespace patterns (the display part)
// subcanvas, displaycodes, whichShape, innerwalls: G

export function patterns_sevenval(c: cell): number {
  if (!meuclid()) return 0;
  const p = euc2_coordinates(c);
  return gmod(p[0] - p[1] * 2, 7);
}

export function is_master(c: cell): boolean {
  if (euc_in(2)) return pseudohept(c);
  else return c.master.c7 === c;
}

// --- bigstuff.cpp (P4): towerval is defined there (bigstuff.ts); re-exported here, cell.ts imports it from this
// module. ---
export { towerval };

void among; void cellwalker; void ishex2;

// added by D3 (graph.ts): namespace linepatterns (drawing; package U4 ports the line patterns with their menu)
/** linepatterns::drawAll(): draws the enabled line patterns (none by default) */
export function linepatterns_drawAll(): void { } // STAGE2-STUB (real: no line pattern is enabled by default)
/** linepatterns::clearAll(): disables all line patterns */
export function linepatterns_clearAll(): void { } // STAGE2-STUB (real: none is enabled)

// added by U2 (menus.ts showCreative): STAGE2-STUB (the line pattern menu: package U4)
/** void linepatterns::showMenu() */
export function linepatterns_showMenu(): void { throw new NotPorted('linepatterns::showMenu'); } // STAGE2-STUB
