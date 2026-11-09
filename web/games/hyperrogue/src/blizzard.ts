// blizzard.cpp of HyperRogue 13.1o: special graphical effects, such as the Blizzard (the snowballs that follow the
// wind between the cells on screen) and arrow traps. Created by D3 (set_blizzard_frame, drawArrowTraps), the
// snowballs ported by D4. The map blizzardcells iterates in `_id` order (std::map orders by address; PORTING.md
// "Pointer order"); its order decides the order of the snowballs and of the rand() calls.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { isize } from './hyper.ts';
import { PPR } from './hyper.ts';
import type { cell } from './locations.ts';
import {
  type transmatrix, type shiftmatrix, inverse_shift_sp, rspintox, xpush, ypush, hdist0, hdist, smul, tC0_sm, cspin90,
  rgpushxto0,
} from './hyperpoint.ts';
import { GDIM } from './classes.ts';
import { traplimits } from './mapeffects.ts';
import { queueline, queuepoly, queuestr_V } from './drawing.ts';
import { fractick } from './animations.ts';
import { cgi } from './geometry.ts';
import { rand, randd } from './rand.ts';
import { randomPointIn, ddspin, cellgfxdist } from './geometry2.ts';
import { windmap_at, windmap_NOWINDBELOW, windmap_NOWINDFROM } from './complex.ts';
import { againstWind } from './passable.ts';
import { isPlayerOn } from './pcmove.ts';

/** struct snowball */
class snowball {
  T: transmatrix;
  global: shiftmatrix = null!;
  prev: snowball | null = null;
  next: snowball | null = null;
  phase: number;
  constructor(t: number) { this.T = rgpushxto0(randomPointIn(t)); this.phase = randd(); }
}

/** struct blizzardcell */
class blizzardcell {
  c: cell = null!;
  frame = 0;
  tmp = 0;
  gm: shiftmatrix = null!;
  wmap = 0;
  inward = 0; outward = 0; ward = 0;
  qty: number[] = [];
  inorder: snowball[] = []; outorder: snowball[] = [];
  inid = 0; outid = 0;
}

/** EX map<cell*, blizzardcell> blizzardcells */
export const blizzardcells = new Map<cell, blizzardcell>();

export function set_blizzard_frame(c: cell, frameid: number): void {
  let b = blizzardcells.get(c);
  if (!b) { b = new blizzardcell(); blizzardcells.set(c, b); }
  b.frame = frameid;
}

/** EX vector<blizzardcell*> bcells */
const bcells: blizzardcell[] = [];

let blizzard_N = 0;

function getbcell(c: cell): blizzardcell | null {
  const i = c.listindex;
  if (i < 0 || i >= blizzard_N) return null;
  if (bcells[i].c !== c) return null;
  return bcells[i];
}

export function drawBlizzards(): void {
  // CAP_SHAPES && CAP_FIELD
  G.poly_outline = 0x000000FF; // OUTLINE_NONE
  bcells.length = 0;
  const gmatrix = G.current_display.cellmatrices;
  for (const c of [...blizzardcells.keys()].sort((a, b) => a._id - b._id)) {
    const b = blizzardcells.get(c)!;
    if (b.frame !== G.frameid || !gmatrix.has(c))
      blizzardcells.delete(c);
    else {
      b.c = c;
      bcells.push(b);
    }
  }
  blizzard_N = isize(bcells);
  for (let i = 0; i < blizzard_N; i++) {
    const bc = bcells[i];
    bc.tmp = bc.c.listindex;
    bc.c.listindex = i;
    bc.gm = gmatrix.get(bc.c)!;
    bc.wmap = (windmap_at(bc.c) << 24) >> 24; // char
  }

  for (let i = 0; i < blizzard_N; i++) {
    const bc = bcells[i];
    const c = bc.c;
    bc.inward = bc.outward = 0;
    while (bc.qty.length < c.type) bc.qty.push(0);
    bc.qty.length = c.type;
    for (let i = 0; i < c.type; i++) {
      bc.qty[i] = 0;
      const c2 = c.move(i);
      if (!c2) continue;
      const bc2 = getbcell(c2);
      if (!bc2) continue;
      let z = (bc2.wmap - bc.wmap) & 255;
      if (z >= windmap_NOWINDBELOW && z < windmap_NOWINDFROM)
        bc.outward += bc.qty[i] = z >> 3;
      z = (-z) & 255;
      if (z >= windmap_NOWINDBELOW && z < windmap_NOWINDFROM) {
        bc.inward += z >> 3; bc.qty[i] = -(z >> 3);
      }
    }
    bc.ward = Math.max(bc.inward, bc.outward);
    while (isize(bc.inorder) < bc.ward) {
      const sb = new snowball(c.type);
      bc.inorder.push(sb);
      bc.outorder.push(sb);
    }
    for (const sb of bc.inorder) sb.prev = sb.next = null;
    bc.inid = 0;
  }

  const at = fractick(40);

  for (let i = 0; i < blizzard_N; i++) {
    const bc = bcells[i];
    for (const sb of bc.inorder)
      sb.global = smul(bc.gm, sb.T);
  }

  for (let i = 0; i < blizzard_N; i++) {
    const bc = bcells[i];
    const c = bc.c;

    bc.outid = 0;

    for (let d = 0; d < c.type; d++) for (let k = 0; k < bc.qty[d]; k++) {
      const bc2 = getbcell(c.move(d))!;
      const sball = bc.outorder[bc.outid++];
      const sball2 = bc2.inorder[bc2.inid++];
      sball.next = sball2;
      sball2.prev = sball;

      const t = inverse_shift_sp(sball.global, tC0_sm(sball2.global));
      let at0 = at + sball.phase;
      if (at0 > 1) at0 -= 1;
      const tpartial = smul(smul(sball.global, rspintox(t)), xpush(hdist0(t) * at0));

      if (G.wmascii || G.wmblack)
        queuestr_V(tpartial, .2, '.', 0xFFFFFF);
      else
        queuepoly(tpartial, cgi().shSnowball, 0xFFFFFF80);
    }
  }

  const hd = (a: shiftmatrix, b: shiftmatrix): number => hdist(tC0_sm(a).h, tC0_sm(b).h);

  for (let ii = 0; ii < blizzard_N; ii++) {
    const bc = bcells[ii];

    /* if(isNeighbor(bc.c, mouseover)) { ... } */

    for (let i = 0; i < bc.c.type; i++) {
      const c2 = bc.c.move(i); if (!c2) continue;
      if (bc.c === G.mouseover || c2 === G.mouseover) {
        let col = 0x00C00080;
        if (c2 === G.mouseover)
          col ^= 0xC0C00000;
        if (isPlayerOn(c2))
          col ^= 0x00000040;
        if (isPlayerOn(bc.c))
          col ^= 0x00000040;
        if (againstWind(bc.c, c2))
          queuepoly(smul(smul(bc.gm, ddspin(bc.c, i)), xpush(cellgfxdist(bc.c, i) / 2)), cgi().shWindArrow, col >>> 0);
      }
    }

    const B = isize(bc.outorder);
    if (B < 2) continue;
    const i = rand() % B;
    let j = rand() % (B - 1);
    if (i === j) j++;

    if (1) {
      const sb1 = bc.outorder[i];
      const sb2 = bc.outorder[j];

      let swapcost = 0;
      if (sb1.next) swapcost -= hd(sb1.global, sb1.next.global);
      if (sb2.next) swapcost -= hd(sb2.global, sb2.next.global);
      if (sb1.next) swapcost += hd(sb2.global, sb1.next.global);
      if (sb2.next) swapcost += hd(sb1.global, sb2.next.global);
      if (swapcost < 0) {
        bc.outorder[i] = sb2; bc.outorder[j] = sb1;
        const t = sb1.next; sb1.next = sb2.next; sb2.next = t;
        if (sb1.next) sb1.next.prev = sb1;
        if (sb2.next) sb2.next.prev = sb2;
      }
    }

    if (1) {
      const sb1 = bc.inorder[i];
      const sb2 = bc.inorder[j];

      let swapcost = 0;
      if (sb1.prev) swapcost -= hd(sb1.global, sb1.prev.global);
      if (sb2.prev) swapcost -= hd(sb2.global, sb2.prev.global);
      if (sb1.prev) swapcost += hd(sb2.global, sb1.prev.global);
      if (sb2.prev) swapcost += hd(sb1.global, sb2.prev.global);
      if (swapcost < 0) {
        bc.inorder[i] = sb2; bc.inorder[j] = sb1;
        const t = sb1.prev; sb1.prev = sb2.prev; sb2.prev = t;
        if (sb1.prev) sb1.prev.next = sb1;
        if (sb2.prev) sb2.prev.next = sb2;
      }
    }

    const sbp = bc.inorder[i];
    if (sbp.next && sbp.prev) {
      const p1 = sbp.next.phase;
      const p2 = sbp.prev.phase;
      let d = p2 - p1;
      if (d <= .5) d += 1;
      if (d >= .5) d -= 1;
      sbp.phase = p1 + d / 2;
      if (sbp.phase >= 1) sbp.phase -= 1;
      if (sbp.phase < 0) sbp.phase += 1;
    }
  }

  for (const bc of bcells)
    bc.c.listindex = bc.tmp;
}

// EX vector<cell*> arrowtraps: G.arrowtraps

export function drawArrowTraps(): void {
  const gmatrix = G.current_display.cellmatrices;
  for (const c of G.arrowtraps) {
    const r = traplimits(c);

    // gmatrix.at throws out_of_range for a cell not drawn: then nothing
    const t0 = gmatrix.get(r[0]), t1 = gmatrix.get(r[4]);
    if (!t0 || !t1) continue;

    // CAP_QUEUE
    queueline(tC0_sm(t0), tC0_sm(t1), 0xFF0000FF, 4 + G.vid.linequality, PPR.ITEM);
    // CAP_SHAPES
    if ((c.wparam & 7) === 3 && !G.shmup_on) {
      // queueline(t0 * randomPointIn(r[0]->type), t1 * randomPointIn(r[1]->type), 0xFFFFFFFF, 4, PPR::ITEM);
      const tt = Math.trunc(fractick(64) * 401);

      for (let u = 0; u < 2; u++) {
        const tu = u ? t0 : t1;
        const tv = u ? t1 : t0;
        const trel = inverse_shift_sp(tu, tC0_sm(tv));
        let tpartial = smul(smul(tu, rspintox(trel)), xpush(hdist0(trel) * tt / 401.0));
        tpartial = smul(tpartial, ypush(.05));
        if (GDIM() === 3) tpartial = smul(tpartial, cspin90(1, 2));
        queuepoly(tpartial, cgi().shTrapArrow, 0xFFFFFFFF);
      }
    }
  }
}

/** the hooks of blizzard.cpp (static initializers) */
export function register_blizzard(): void {
  G.hooks_clearmemory.add(0, () => {
    G.arrowtraps.length = 0;
    blizzardcells.clear();
    bcells.length = 0;
  });
  // hooks_gamedata: memory statistics only
  G.hooks_removecells.add(0, () => {
    // eliminate_if(arrowtraps, is_cell_removed)
    const a = G.arrowtraps;
    for (let i = 0; i < isize(a); i++)
      if (is_cell_removed(a[i])) { a[i] = a[a.length - 1]; a.pop(); i--; }
  });
}
import { is_cell_removed } from './savemem.ts';
