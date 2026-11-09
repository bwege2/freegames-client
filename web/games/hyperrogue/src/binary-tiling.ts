// binary-tiling.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { cgflags, qBINARY, gBinary4, gTernary, gBinaryTiling, S7 } from './classes.ts';
import { G } from './globals.ts';
import { kite_in } from './kite.ts';
import type { heptagon, cell } from './locations.ts';
import type { hrmap } from './cell.ts';

/** note: nihsolv and kd3 tilings return bt::in() */
export function bt_in(): boolean { return (cgflags() & qBINARY) !== 0n; } // STAGE1-STUB (real)
export function bt_new_map(): hrmap { throw new NotPorted('bt::new_map'); } // STAGE1-STUB
export function bt_updir(): number { // STAGE1-STUB (real)
  if (G.geometry === gBinary4) return 3;
  if (G.geometry === gTernary) return 4;
  if (G.geometry === gBinaryTiling) return 5;
  if (kite_in()) return 0;
  if (!bt_in()) return 0;
  return S7() - 1;
}
export function bt_mapside(_h: heptagon): number { throw new NotPorted('bt::mapside'); } // STAGE1-STUB
export function bt_celldistance3(_c1: cell, _c2: cell): number { throw new NotPorted('bt::celldistance3'); } // STAGE1-STUB

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function bt_expansion(): number { throw new NotPorted('bt::expansion'); } // STAGE1-STUB
