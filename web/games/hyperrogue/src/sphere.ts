// sphere.cpp of HyperRogue 13.1o: spherical spaces (stage 3, package G1). (C) Zeno Rogue, GPL-2.0-or-later;
// TypeScript port. The irregular variation (irr::link_start) is a later package: NotPorted.
import { NotPorted } from './hyper.ts';
import { G } from './globals.ts';
import { S7, S3, elliptic, IRREGULAR, GOLDBERG_INV } from './classes.ts';
import { hrmap_standard, newCell, clearHexes, verifycells, celldist, ctof, createMov, type hrmap } from './cell.ts';
import { init_heptagon } from './heptagon.ts';
import { heptspin, hsOrigin, type cell, type heptagon } from './locations.ts';
import { type transmatrix, type hyperpoint, Id, tmul, iso_inverse } from './hyperpoint.ts';
import { fixelliptic, relative_matrix_via_masters } from './geometry2.ts';
import { fake_in } from './fake.ts';
import { gp_get_code, gp_get_local_info } from './goldberg.ts';

// --- spherical geometry ---

export function spherecells(): number {
  if (S7() === 5) return (elliptic() ? 6 : 12);
  if (S7() === 4) return (elliptic() ? 3 : 6);
  if (S7() === 3 && S3() === 4) return (elliptic() ? 4 : 8);
  if (S7() === 3) return 4;
  if (S7() === 2) return (elliptic() ? 1 : 2);
  if (S7() === 1) return 1;
  return 12;
}

/** EX vector<int> siblings */
export const sphere_state = { siblings: [] as number[] };

/** hrmap_spherical is made on first use (its base class lives in cell.ts, which is not a leaf module) */
function make_hrmap_spherical() {
  class hrmap_spherical extends hrmap_standard {
    dodecahedron: heptagon[] = new Array(12).fill(null);

    constructor() {
      super();
      const dd = this.dodecahedron;
      for (let i = 0; i < spherecells(); i++) {
        const h = dd[i] = init_heptagon(S7());
        h.s = hsOrigin;
        h.emeraldval = i;
        h.zebraval = i;
        h.fiftyval = i;
        h.c.fullclear();
        h.fieldval = i;
        if (!IRREGULAR()) h.c7 = newCell(S7(), h);
      }
      if (S7() === 5)
        sphere_state.siblings = [1, 0, 10, 4, 3, 8, 9, 11, 5, 6, 2, 7];
      else
        sphere_state.siblings = [1, 0, 3, 2, 5, 4];

      const setmove = (h: heptagon, i: number, v: heptagon): void => { h.c.setMove(i, v); };
      if (S7() === 3 && S3() === 4) {
        for (let i = 0; i < 8; i++) {
          setmove(dd[i], 0, dd[i ^ 1]);
          dd[i].c.setspin(0, 0, false);
          setmove(dd[i], 1, dd[i ^ 2]);
          dd[i].c.setspin(1, 1, false);
          setmove(dd[i], 2, dd[i ^ 4]);
          dd[i].c.setspin(2, 2, false);
        }
        for (let i = 0; i < 8; i++) {
          const s = (i & 1) + ((i & 2) >> 1) + ((i & 4) >> 2);
          if ((s & 1) === 1) {
            const m1 = dd[i].move(1), m2 = dd[i].move(2);
            setmove(dd[i], 1, m2); setmove(dd[i], 2, m1);
            const a = dd[i].c.spin(1);
            const b = dd[i].c.spin(2);
            dd[i].c.setspin(1, b, false);
            dd[i].c.setspin(2, a, false);
            dd[i].move(1).c.setspin(b, 1, false);
            dd[i].move(2).c.setspin(a, 2, false);
          }
        }
        // for(...) if(...) println(hlog, "8");
      }

      else if (S7() === 4 && elliptic()) {
        for (let i = 0; i < 3; i++) {
          const i1 = (i + 1) % 3;
          const i2 = (i + 2) % 3;
          setmove(dd[i], 0, dd[i1]);
          dd[i].c.setspin(0, 1, false);
          setmove(dd[i], 1, dd[i2]);
          dd[i].c.setspin(1, 0, false);
          setmove(dd[i], 2, dd[i1]);
          dd[i].c.setspin(2, 3, true);
          setmove(dd[i], 3, dd[i2]);
          dd[i].c.setspin(3, 2, true);
        }
      }
      else for (let i = 0; i < S7(); i++) {
        setmove(dd[0], i, dd[i + 1]);
        dd[0].c.setspin(i, 0, false);
        setmove(dd[i + 1], 0, dd[0]);
        dd[i + 1].c.setspin(0, i, false);

        setmove(dd[i + 1], 1, dd[(i + S7() - 1) % S7() + 1]);
        dd[i + 1].c.setspin(1, S7() - 1, false);
        setmove(dd[i + 1], S7() - 1, dd[(i + 1) % S7() + 1]);
        dd[i + 1].c.setspin(S7() - 1, 1, false);

        if (S7() === 5 && elliptic()) {
          setmove(dd[i + 1], 2, dd[(i + 2) % S7() + 1]);
          dd[i + 1].c.setspin(2, 3, true);
          setmove(dd[i + 1], 3, dd[(i + 3) % S7() + 1]);
          dd[i + 1].c.setspin(3, 2, true);
        }

        else if (S7() === 5) {
          setmove(dd[6], i, dd[7 + i]);
          dd[6].c.setspin(i, 0, false);
          setmove(dd[7 + i], 0, dd[6]);
          dd[7 + i].c.setspin(0, i, false);

          setmove(dd[i + 7], 1, dd[(i + 4) % 5 + 7]);
          dd[i + 7].c.setspin(1, 4, false);
          setmove(dd[i + 7], 4, dd[(i + 1) % 5 + 7]);
          dd[i + 7].c.setspin(4, 1, false);

          setmove(dd[i + 1], 2, dd[7 + (10 - i) % 5]);
          dd[i + 1].c.setspin(2, 2, false);
          setmove(dd[7 + (10 - i) % 5], 2, dd[1 + i]);
          dd[7 + (10 - i) % 5].c.setspin(2, 2, false);

          setmove(dd[i + 1], 3, dd[7 + (9 - i) % 5]);
          dd[i + 1].c.setspin(3, 3, false);
          setmove(dd[7 + (9 - i) % 5], 3, dd[i + 1]);
          dd[7 + (9 - i) % 5].c.setspin(3, 3, false);
        }
        if (S7() === 4) {
          setmove(dd[5], 3 - i, dd[i + 1]);
          dd[5].c.setspin(3 - i, 2, false);
          setmove(dd[i + 1], 2, dd[5]);
          dd[i + 1].c.setspin(2, 3 - i, false);
        }
      }

      // CAP_IRR
      if (IRREGULAR()) {
        throw new NotPorted('hrmap_spherical: irr::link_start'); // STAGE3-STUB (irregular.cpp)
      }
    }

    override getOrigin(): heptagon { return this.dodecahedron[0]; }

    override destroy(): void {
      for (let i = 0; i < spherecells(); i++) clearHexes(this.dodecahedron[i]);
      // tailored_delete: the heptagons are garbage collected
    }

    override verify(): void {
      for (let i = 0; i < spherecells(); i++) for (let k = 0; k < S7(); k++) {
        const hs = new heptspin(this.dodecahedron[i], k, false);
        let hs2 = hs.plusStep().plus(S7() - 1).plusStep().plus(S7() - 1).plusStep().plus(S7() - 1);
        if (S3() === 4) hs2 = hs2.plusStep().plus(S7() - 1);
        // if(hs2.at != hs.at) printf("error %d,%d\n", i, k);
      }
      for (let i = 0; i < spherecells(); i++) verifycells(this.dodecahedron[i]);
    }

    /** map<cell*, transmatrix> where */
    where = new Map<cell, transmatrix>();

    get_where(c: cell): transmatrix {
      const w = this.where.get(c);
      if (w) return w;
      const d = celldist(c);
      if (d === 0) { this.where.set(c, Id); return Id; }
      else for (let i = 0; i < c.type; i++) {
        const c1 = createMov(c, i);
        if (celldist(c1) < d) {
          let T = this.get_where(c1);
          T = tmul(T, this.iadj(c, i));
          this.where.set(c, T);
          return T;
        }
      }
      return Id;
    }

    override reinit(): void {
      super.reinit();
      this.where.clear();
    }

    override on_dim_change(): void { this.reinit(); }

    protected override relative_matrixc(c2: cell, c1: cell, hint: hyperpoint): transmatrix {
      if (IRREGULAR()) return relative_matrix_via_masters(c2, c1, hint);
      let T = tmul(iso_inverse(this.get_where(c1)), this.get_where(c2));
      if (elliptic()) T = fixelliptic(T);
      return T;
    }

    override pattern_value(c: cell): number {
      // CAP_IRR
      if (IRREGULAR()) throw new NotPorted('hrmap_spherical::pattern_value: irr::cellindex'); // STAGE3-STUB
      // CAP_GP
      if (GOLDBERG_INV()) return ((gp_get_code(gp_get_local_info(c)) << 8) | c.master.fieldval) | 0;
      if (ctof(c)) return c.master.fieldval;
      return createMov(c, 0).master.fieldval + 256 * createMov(c, 2).master.fieldval + (1 << 16) * createMov(c, 4).master.fieldval;
    }
  }
  return hrmap_spherical;
}
let hrmap_spherical_class: ReturnType<typeof make_hrmap_spherical> | null = null;
function hrmap_spherical_cls(): ReturnType<typeof make_hrmap_spherical> { return hrmap_spherical_class ??= make_hrmap_spherical(); }
export type hrmap_spherical = InstanceType<ReturnType<typeof make_hrmap_spherical>>;

export function getDodecahedron(i: number): heptagon {
  if (fake_in()) throw new NotPorted('getDodecahedron: fake'); // FPIU(getDodecahedron(i)): fake.cpp
  const s = G.currentmap;
  if (!(s instanceof hrmap_spherical_cls())) return null!;
  return s.dodecahedron[i];
}

export function new_spherical_map(): hrmap { return new (hrmap_spherical_cls())(); }
