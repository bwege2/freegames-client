// heptagon.cpp of HyperRogue 13.1o: the heptagon automaton, buildHeptagon, createStep and
// hrmap_standard::create_step (the method is defined here as in C++; cell.ts's class calls it).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: the static buildHeptagon, addSpin, createStep are exported (other files reach createStep through
// hyper.h's declaration); hrmap_standard::create_step -> hrmap_standard_create_step(map, h, d).
import { G } from './globals.ts';
import { heptagon, heptspin, late, global_distance_limit, hsOrigin, hsA, hsB, hsError, hsA0, hsA1, hsB0, hsB1, hsC, type hstate } from './locations.ts';
import { among } from './hyper.ts';
import { hrand } from './rand.ts';
import {
  embedded_plane, sphere, S7, S3, S6, BITRUNCATED, GOLDBERG, IRREGULAR, a38, quotient, cryst, OINF,
} from './classes.ts';
import { bt_in } from './binary-tiling.ts';
import { arcm_in } from './archimedean.ts';
import { irr_link_next } from './irregular.ts';
import { geom3_in_flipped } from './embeddings.ts';
import { gp_dist_1, gp_dist_2, gp_dist_3, gp_solve_triangle, gp_param, gp_loc_mul } from './goldberg.ts';
import { emerald_heptagon, zebra_heptagon, fifty_38, firstfiftyval, nextfiftyval } from './patterns.ts';
import { fieldpattern_getcurrfp, fieldpattern_btspin } from './fieldpattern.ts';
import { newCell } from './cell.ts';
import type { hrmap } from './cell.ts';

// #define MIRR(x) x.mirrored

// int heptacount: locations.ts (never changed by the original)

/** the automaton is used to generate each heptagon in an unique way.
 *  See http://roguetemple.com/z/dev.php for more help.
 *  From the origin we can go further in any direction, and from other heptagons
 *  we can go in directions 3 and 4 (0 is back to origin, so 3 and 4 go forward),
 *  and sometimes in direction 5
 */
export function transition(s: hstate, dir: number): hstate {
  if (embedded_plane()) return geom3_in_flipped(() => transition(s, dir));
  if (sphere()) {
    if (S7() === 4) {
      if (s === hsOrigin) return dir === 0 ? hsB0 : hsB1;
    }
    if (S7() === 3 && S3() === 3) {
      if (s === hsOrigin) return hsB1;
    }
    if (S7() === 3 && S3() === 4) {
      if (s === hsOrigin) return dir === 0 ? hsA0 : hsA1;
      if (s === hsA0 && dir === 1) return hsB0;
      if (s === hsA1 && dir === 1) return hsB1;
      if (s === hsB0 && dir === 2) return hsC;
      return hsError;
    }
    if (s === hsOrigin) return dir === 0 ? hsA0 : hsA1;
    if (s === hsA0 && dir === 2) return hsB0;
    if (s === hsA1 && dir === 2) return hsB1;
    if (s === hsB0 && dir === S7() - 2) return hsC;
    return hsError;
  }
  else if (S6() === 8) {
    if (s === hsOrigin) return hsA;
    if (s === hsA && (dir >= 2 && dir < S7() - 1)) return hsA;
    if (s === hsA && (dir === S7() - 1)) return hsB;
    if (s === hsB && (dir >= 2 && dir < S7() - 2)) return hsA;
    if (s === hsB && (dir === S7() - 2)) return hsB;
  }
  else if (S3() >= OINF) {
    if (s === hsOrigin) return hsA;
    if (s === hsA && dir) return hsA;
  }
  else {
    if (s === hsOrigin) return hsA;
    if (s === hsA && dir >= 3 && dir <= S7() - 3) return hsA;
    if (s === hsA && dir === S7() - 2) return hsB;
    if (s === hsB && dir >= 3 && dir <= S7() - 4) return hsA;
    if (s === hsB && dir === S7() - 3) return hsB;
  }
  return hsError;
}

const COMPUTE = -1000000;

/** create a new heptagon */
export function buildHeptagon1(h: heptagon, parent: heptagon, d: number, s: hstate, pard = 0): heptagon {
  h.alt = null!;
  h.s = s;
  h.c.connect(pard, parent, d, false);
  h.cdata = null;
  return h;
}

/** tailored_alloc<heptagon>(type): every field 0 / NULL (the oracle zero-fills), then what init_heptagon sets */
export function init_heptagon(type: number): heptagon {
  const h = new heptagon(type);
  h.emeraldval = 0;
  h.zebraval = 0;
  h.fiftyval = 0;
  h.fieldval = 0;
  h.rval0 = h.rval1 = 0;
  h.cdata = null;
  h.alt = null!;
  h.c7 = null!;
  h.distance = 0;
  h.dm4 = 0;
  return h;
}

export function buildHeptagon(parent: heptagon, d: number, s: hstate, pard = 0, fixdistance = COMPUTE): heptagon {
  const h = buildHeptagon1(new heptagon(S7()), parent, d, s, pard);
  if (bt_in() || arcm_in()) return h;
  if (parent.c7) {
    if (IRREGULAR())
      irr_link_next(parent, d);
    else
      h.c7 = newCell(S7(), h);
    h.rval0 = h.rval1 = 0;
    h.emeraldval = emerald_heptagon(parent.emeraldval, d);
    h.zebraval = zebra_heptagon(parent.zebraval, d);
    // #if CAP_FIELD
    const currfp = fieldpattern_getcurrfp();
    if (currfp !== G.fieldpattern_fp_invalid)
      h.fieldval = currfp.connections[fieldpattern_btspin(parent.fieldval, d)];
    if (a38())
      h.fiftyval = fifty_38(parent.fiftyval, d);
    else if (parent.s === hsOrigin)
      h.fiftyval = firstfiftyval(d);
    else
      h.fiftyval = nextfiftyval(parent.fiftyval, parent.move(0).fiftyval, d);
  }
  else {
    h.c7 = null!;
    h.emeraldval = 0;
    h.fiftyval = 0;
    h.cdata = null;
  }
  //generateEmeraldval(parent);
  //generateEmeraldval(h);
  if (pard === 0) {
    h.dm4 = parent.dm4 + 1;
    if (fixdistance !== COMPUTE) h.distance = fixdistance;
    else if (S3() === 4 && BITRUNCATED()) {
      h.distance = parent.distance + 2;
      if (h.c.spin(0) === 2 || (h.c.spin(0) === 3 && S7() <= 5))
        h.distance = Math.min((h.distance << 16) >> 16, (h.move(0).cmove(0).distance + 3) << 16 >> 16); // min<short>
      if (h.c.spin(0) === 2 && h.move(0)) {
        const d = h.c.spin(0);
        const d1 = (d + S7() - 1) % S7();
        const h1 = h.move(0).cmove(d1);
        if (h1.distance <= h.move(0).distance)
          h.distance = h.move(0).distance + 1;
      }
      if ((h.s === hsB && h.move(0).s === hsB) || h.move(0).s === hsA) {
        const d = h.c.spin(0);
        const h1 = h.move(0).cmove((d + 1) % S7());
        if (h1.distance <= h.move(0).distance)
          h.distance = h.move(0).distance + 1;
      }
      if (h.c.spin(0) === S7() - 1 && (h.move(0).s !== hsOrigin) && BITRUNCATED()) {
        const missing = !h.move(S7() - 1);
        if (missing) {
          h.distance = parent.distance;
          if (
            parent.distance - h.move(0).move(0).distance === 1 &&
            h.c.spin(0) === S7() - 1 &&
            h.move(0).c.spin(0) === 2)
            h.distance++;
        }
        else {
          h.distance = Math.min(
            h.move(0).move(0).distance + 2,
            createStep(h, S7() - 1).distance + 1,
          );
        }
      }
    }
    else if (parent.s === hsOrigin) h.distance = parent.distance + gp_dist_2();
    // #if CAP_GP
    else if (S3() === 4 && GOLDBERG() && h.c.spin(0) === S7() - 2 && h.move(0).c.spin(0) >= S7() - 2 && h.move(0).move(0).s !== hsOrigin) {
      const hs = new heptspin(h, 0);
      hs.addStep();
      const d1 = hs.at.distance;
      hs.add(1); hs.addStep();
      const dm = hs.at.distance;
      hs.add(-1); hs.addStep();
      const d0 = hs.at.distance;
      h.distance = gp_solve_triangle(dm, d0, d1, gp_loc_mul(gp_param(), [-1, 1]));
    }
    else if (S3() === 4 && GOLDBERG() && h.c.spin(0) === S7() - 1 && among(h.move(0).c.spin(0), S7() - 2, S7() - 3) && h.move(0).move(0).s !== hsOrigin) {
      const hs = new heptspin(h, 0);
      hs.addStep();
      const d0 = hs.at.distance;
      hs.add(1); hs.addStep();
      const dm = hs.at.distance;
      hs.add(1); hs.addStep();
      const d1 = hs.at.distance;
      h.distance = gp_solve_triangle(dm, d0, d1, gp_loc_mul(gp_param(), [1, 1]));
    }
    else if (S3() === 4 && GOLDBERG() && h.c.spin(0) >= 2 && h.c.spin(0) <= S7() - 2) {
      h.distance = parent.distance + gp_dist_2();
    }
    // #endif
    else if (h.c.spin(0) === S7() - 2) {
      if (GOLDBERG()) {
        const d0 = parent.distance;
        const d1 = createStep(parent, S7() - 1).distance;
        const dm = createStep(parent, 0).distance;
        h.distance = gp_solve_triangle(dm, d0, d1, gp_loc_mul(gp_param(), [1, 1]));
      } else
        h.distance = parent.distance + gp_dist_1();
    }
    else if (h.c.spin(0) === S7() - 3 && h.move(0).s === hsB) {
      if (GOLDBERG()) {
        const d0 = parent.distance;
        const d1 = createStep(parent, S7() - 2).distance;
        const dm = createStep(parent, S7() - 1).distance;
        h.distance = gp_solve_triangle(dm, d0, d1, gp_loc_mul(gp_param(), [1, 1]));
      } else
        h.distance = createStep(h.move(0), (h.c.spin(0) + 2) % S7()).distance + gp_dist_3();
    }
    else if (h.c.spin(0) === S7() - 1 && S3() === 4 && GOLDBERG()) {
      h.distance = parent.distance + gp_dist_1();
    }
    else h.distance = parent.distance + gp_dist_2();
  }
  else {
    h.distance = parent.distance - gp_dist_2();
    if (S3() === 4 && S7() > 5 && BITRUNCATED()) {
      h.distance = parent.distance - 2;
    }
    if (S3() === 4 && S7() === 5) {
      if (h.s === hsOrigin) {
        // printf("had to cheat!\n");
        h.distance = parent.distance - 2;
      }
      else {
        h.distance = parent.distance - 1;
        buildHeptagon(h, 2, hsA, 0, h.distance + 2);
        buildHeptagon(h, 4, hsB, 0, h.distance);
      }
    }
    h.dm4 = parent.dm4 - 1;
  }
  return h;
}

export let recsteps = 0;

function addSpin(h: heptagon, d: number, from: heptagon, rot: number, spin: number): void {
  rot = h.c.fix(rot);
  const h1 = createStep(from, rot);
  const fr = h1.c.fix(from.c.spin(rot) + spin);
  h.c.connect(d, from.move(rot), fr, false);
}

/** create h->move(d) if not created yet */
export function createStep(h: heptagon, d: number): heptagon {
  d = h.c.fix(d);
  if (h.move(d)) return h.move(d);
  G.hooks_createStep.callhooks(h, d);
  return (G.currentmap as hrmap).create_step(h, d);
}

/** heptagon *hrmap_standard::create_step(heptagon *h, int d) */
export function hrmap_standard_create_step(_m: hrmap, h: heptagon, d: number): heptagon {
  if (!h.move(0) && h.s !== hsOrigin && !bt_in() && !cryst()) {
    // cheating:
    let pard = 0;
    if (S3() === 3)
      pard = 3 + hrand(2);
    else if (S3() === 4 && S7() === 5)
      pard = 3; // to do: randomize
    else if (S3() === 4)
      pard = 3;
    buildHeptagon(h, 0, h.distance < -global_distance_limit - 200 ? hsOrigin : hsA, pard);
  }
  if (h.move(d)) return h.move(d);
  if (h.s === hsOrigin) {
    buildHeptagon(h, d, hsA);
  }
  else if (S3() === 4) {
    if (d === 1) {
      let hs = new heptspin(h, 0, false);
      hs = hs.plusStep().add(-1).addStep().add(-1).addStep().add(-1);
      h.c.connectw(d, hs);
    }
    else if (h.s === hsB && d === S7() - 1) {
      let hs = new heptspin(h, 0, false);
      hs = hs.plusStep().add(1).addStep().add(1).addStep().add(1);
      h.c.connectw(d, hs);
    }
    else
      buildHeptagon(h, d, transition(h.s, d));
  }
  else if (S3() > 4 && quotient()) {
    /* this branch may be used for some >4-valent quotient spaces outside of standard HyperRogue */
    /* this is wrong, but we don't care in quotient */
    h.c.setMove(d, h);
    // buildHeptagon(h, d, transition(h->s, d));
  }
  else if (d === 1) {
    addSpin(h, d, h.move(0), h.c.spin(0) - 1, -1);
  }
  else if (d === S7() - 1) {
    addSpin(h, d, h.move(0), h.c.spin(0) + 1, +1);
  }
  else if (d === 2) {
    createStep(h.move(0), h.c.spin(0) - 1);
    addSpin(h, d, h.move(0).modmove(h.c.spin(0) - 1), S7() - 2 + h.move(0).c.modspin(h.c.spin(0) - 1), -1);
  }
  else if (d === S7() - 2 && h.s === hsB) {
    createStep(h.move(0), h.c.spin(0) + 1);
    addSpin(h, d, h.move(0).modmove(h.c.spin(0) + 1), 2 + h.move(0).c.modspin(h.c.spin(0) + 1), +1);
  }
  else
    buildHeptagon(h, d, (d === S7() - 2 || (h.s === hsB && d === S7() - 3)) ? hsB : hsA);
  return h.move(d);
}

// backtrace / hsshow: debug output (printf), left out

/** the static initialization of heptagon.cpp: createStep for locations.ts (heptagon::cmove) */
export function register_heptagon(): void {
  late.createStep = createStep;
}
