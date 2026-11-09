// arbitrile.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { G } from './globals.ts';
import { gArbitrary } from './classes.ts';
import type { hrmap } from './cell.ts';
import type { cell } from './locations.ts';

export function arb_in(): boolean { return G.geometry === gArbitrary; } // STAGE1-STUB (real)
export function arb_new_map(): hrmap { throw new NotPorted('arb::new_map'); } // STAGE1-STUB
/** arb::current (the fields stage 1 reads) */
export function arb_current(): { min_valence: number; range: number } { throw new NotPorted('arb::current'); } // STAGE1-STUB

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function arb_current_have_line(): boolean { throw new NotPorted('arb::current.have_line'); } // STAGE1-STUB
export function arb_linespattern(_c: cell): boolean { throw new NotPorted('arb::linespattern'); } // STAGE1-STUB
export function arb_support_dice(_n: number): boolean { throw new NotPorted('arb::support_dice'); } // STAGE1-STUB

// added by G1 (system.ts set_variation): arb::convert::deactivate() is a no-op unless arb::in() (STAGE3-STUB:
// base_geometry/base_variation belong to arbitrile.cpp's package)
export function arb_convert_deactivate(): void {
  if (arb_in()) throw new NotPorted('arb::convert::deactivate'); // STAGE3-STUB
}
