// nonisotropic.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of
// it. hybrid::will_link / hybrid::link do nothing without a hybrid map (hybrid::pmap is null outside product
// geometries), as in the original; sn::in is real; the rest throws NotPorted. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { G } from './globals.ts';
import { cgclass, gcSol, gcNIH, gcSolN, gproduct, mhybrid } from './classes.ts';
import type { cell, heptagon } from './locations.ts';
import type { hrmap } from './cell.ts';

/** hybrid::will_link(c): if(pmap && pmap->twisted) to_link.push_back(c) */
export function hybrid_will_link(_c: cell): void { // STAGE1-STUB
  if (G.hybrid_pmap) throw new NotPorted('hybrid::will_link');
}
/** hybrid::link(): returns at once without a hybrid map */
export function hybrid_link(): void { // STAGE1-STUB
  if (G.hybrid_pmap) throw new NotPorted('hybrid::link');
}
export function hybrid_celldistance(_c1: cell, _c2: cell): number { throw new NotPorted('hybrid::celldistance'); } // STAGE1-STUB
export function hybrid_get_where(_c: cell): [cell, number] { throw new NotPorted('hybrid::get_where'); } // STAGE1-STUB
/** #define PIU(x) hr::hybrid::in_underlying_geometry([&] { return (x); }) */
export function hybrid_in_underlying_geometry<T>(f: () => T): T { // STAGE1-STUB (real outside hybrid geometries; P3)
  if (!mhybrid() && !gproduct()) return f();
  throw new NotPorted('hybrid::in_underlying_geometry');
}
export function hybrid_altmap_height(_h: heptagon): number { throw new NotPorted('hybrid::altmap_heights'); } // STAGE1-STUB
export function hybrid_csteps(): number { throw new NotPorted('hybrid::csteps'); } // STAGE1-STUB
export function in_s2xe(): boolean { if (!gproduct()) return false; throw new NotPorted('in_s2xe'); } // STAGE1-STUB (real outside product geometries; P8)
export function nisot_new_map(): hrmap { throw new NotPorted('nisot::new_map'); } // STAGE1-STUB
export function sn_in(): boolean { const c = cgclass(); return c === gcSol || c === gcNIH || c === gcSolN; } // STAGE1-STUB (real)
export function sn_approx_distance(_h1: heptagon, _h2: heptagon): number { throw new NotPorted('sn::approx_distance'); } // STAGE1-STUB

// added by P8 (system.ts welcomeMessage): STAGE1-STUB
/** in_h2xe(): gproduct && hybrid::under_class() == gcHyperbolic */
export function in_h2xe(): boolean { // STAGE1-STUB (real outside product geometries)
  if (!gproduct()) return false;
  throw new NotPorted('in_h2xe');
}
/** hybrid::underlying (eGeometry) */
export function hybrid_underlying(): number { throw new NotPorted('hybrid::underlying'); } // STAGE1-STUB

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function hybrid_actual_geometry(): number { throw new NotPorted('hybrid::actual_geometry'); } // STAGE1-STUB
export function hybrid_underlying_cgip(): unknown { throw new NotPorted('hybrid::underlying_cgip'); } // STAGE1-STUB
