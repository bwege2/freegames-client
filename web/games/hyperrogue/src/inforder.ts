// inforder.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import type { cell } from './locations.ts';
import type { hrmap } from './cell.ts';
import { cgflags, qINFMIXED } from './classes.ts';

export function inforder_new_map(): hrmap { throw new NotPorted('inforder::new_map'); } // STAGE1-STUB
export function inforder_celldistance(_c1: cell, _c2: cell): number { throw new NotPorted('inforder::celldistance'); } // STAGE1-STUB
/** inforder::mixed(): cgflags & qINFMIXED (added by stage 2 package D2: floorshapes.cpp's shvid) */
export function inforder_mixed(): boolean { return (cgflags() & qINFMIXED) !== 0n; }
