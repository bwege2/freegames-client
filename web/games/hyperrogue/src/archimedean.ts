// archimedean.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { cgflags, qARCHI } from './classes.ts';
import type { cell } from './locations.ts';
import type { hrmap } from './cell.ts';

export function arcm_in(): boolean { return (cgflags() & qARCHI) !== 0n; } // STAGE1-STUB (real)
export function arcm_new_map(): hrmap { throw new NotPorted('arcm::new_map'); } // STAGE1-STUB
export function arcm_valence(): number { throw new NotPorted('arcm::valence'); } // STAGE1-STUB
export function arcm_get_cdata(): Map<string, unknown> { throw new NotPorted('arcm::get_cdata'); } // STAGE1-STUB
export function arcm_cdata_of(_c: cell): never { throw new NotPorted('arcm::bm (arcmCdata, pseudocoords)'); } // STAGE1-STUB

// added by P8 (system.ts): STAGE1-STUB
/** arcm::current_or_fake().compute_geometry(): computes the data of the current Archimedean tiling (start_game
 *  calls it in every geometry); used only by the Archimedean geometries (a later stage) */
export function arcm_current_or_fake_compute_geometry(): void { } // STAGE1-STUB (no effect on the standard game)

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function arcm_current_have_line(): boolean { throw new NotPorted('arcm::current.have_line'); } // STAGE1-STUB
export function arcm_linespattern(_c: cell): boolean { throw new NotPorted('arcm::linespattern'); } // STAGE1-STUB
export function arcm_support_dice(_n: number): boolean { throw new NotPorted('arcm::support_dice'); } // STAGE1-STUB

// added by P5 (complex.ts, mapeffects.ts): STAGE1-STUB until its owner ports it
/** arcm::current.faces */
export function arcm_current_faces(): number[] { throw new NotPorted('arcm::current.faces'); } // STAGE1-STUB
