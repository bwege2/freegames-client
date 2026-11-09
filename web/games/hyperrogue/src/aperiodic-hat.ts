// aperiodic-hat.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { cgflags, qHAT } from './classes.ts';
import type { hrmap } from './cell.ts';
import type { cell } from './locations.ts';

export function hat_in(): boolean { return (cgflags() & qHAT) !== 0n; } // STAGE1-STUB (real)
export function hat_new_map(): hrmap { throw new NotPorted('hat::new_map'); } // STAGE1-STUB

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function hat_get_hat_id(_c: cell): number { throw new NotPorted('hat::get_hat_id'); } // STAGE1-STUB
