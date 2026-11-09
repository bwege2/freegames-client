// asonov.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { cgflags, qCAT } from './classes.ts';
import type { heptagon } from './locations.ts';
import type { hrmap } from './cell.ts';

export function asonov_in(): boolean { return (cgflags() & qCAT) !== 0n; } // STAGE1-STUB (real)
export function asonov_new_map(): hrmap { throw new NotPorted('asonov::new_map'); } // STAGE1-STUB
export function asonov_get_at(_co: unknown): heptagon { throw new NotPorted('asonov::get_at'); } // STAGE1-STUB
export function asonov_get_coord(_h: heptagon): unknown { throw new NotPorted('asonov::get_coord'); } // STAGE1-STUB
