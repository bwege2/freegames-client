// kite.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { cgflags, qKITE } from './classes.ts';
import type { hrmap } from './cell.ts';

export function kite_in(): boolean { return (cgflags() & qKITE) !== 0n; } // STAGE1-STUB (real)
export function kite_new_map(): hrmap { throw new NotPorted('kite::new_map'); } // STAGE1-STUB
