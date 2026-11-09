// irregular.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import type { cell, heptagon } from './locations.ts';
import { G } from './globals.ts';
import { eVariation } from './classes.ts';

export function irr_ctof(_c: cell): number { throw new NotPorted('irr::ctof'); } // STAGE1-STUB
export function irr_link_next(_parent: heptagon, _d: number): void { throw new NotPorted('irr::link_next'); } // STAGE1-STUB
export function irr_link_start(_h: heptagon): void { throw new NotPorted('irr::link_start'); } // STAGE1-STUB
export function irr_link_cell(_c: cell, _d: number): void { throw new NotPorted('irr::link_cell'); } // STAGE1-STUB
export function irr_clear_links(_h: heptagon): void { throw new NotPorted('irr::clear_links'); } // STAGE1-STUB
export function irr_celldist(_c: cell, _alts: boolean): number { throw new NotPorted('irr::celldist'); } // STAGE1-STUB
export function irr_compute_scale(): number { throw new NotPorted('irr::compute_scale'); } // STAGE1-STUB

// added by P8 (system.ts initAll): STAGE1-STUB
/** irr::base: the base map of the irregular variation (none in the standard game) */
export function irr_base(): unknown { return null; } // STAGE1-STUB (real: null outside irregular)
export function irr_auto_creator(): void { throw new NotPorted('irr::auto_creator'); } // STAGE1-STUB

// added by P1b (geometry.ts prepare_basics): STAGE1-STUB (real when not irregular)
export function irr_compute_geometry(): void { // STAGE1-STUB
  if (G.variation === eVariation.irregular) throw new NotPorted('irr::compute_geometry');
}

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function irr_bitruncations_performed(): number { throw new NotPorted('irr::bitruncations_performed'); } // STAGE1-STUB

// added by G1 (goldberg.ts gp::show): real
import { gEuclid, gEuclidSquare, ginf, qCLOSED, gNormal, gKleinQuartic, gOctagon, gBolza2, gFieldQuotient, gSphere, gSmallSphere, gTinySphere } from './classes.ts';
import { among } from './hyper.ts';
/** EX bool supports(eGeometry g) */
export function irr_supports(g: number): boolean {
  if (g === gEuclid || g === gEuclidSquare) return (ginf[g].flags & qCLOSED) !== 0n;
  return among(g, gNormal, gKleinQuartic, gOctagon, gBolza2, gFieldQuotient, gSphere, gSmallSphere, gTinySphere);
}
