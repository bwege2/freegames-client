// rulegen.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import type { heptagon } from './locations.ts';
import type { hrmap } from './cell.ts';

/** rulegen::known(): no rules are loaded in stage 1 */
export function rulegen_known(): boolean { return false; } // STAGE1-STUB
export function rulegen_new_hrmap_rulegen(): hrmap { throw new NotPorted('rulegen::new_hrmap_rulegen'); } // STAGE1-STUB
export function rulegen_new_hrmap_rulegen_alt(_o: heptagon): hrmap { throw new NotPorted('rulegen::new_hrmap_rulegen_alt'); } // STAGE1-STUB
