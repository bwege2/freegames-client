// fake.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { G } from './globals.ts';
import { gFake } from './classes.ts';
import type { hrmap } from './cell.ts';

export function fake_in(): boolean { return G.geometry === gFake; } // STAGE1-STUB (real)
export function fake_new_map(): hrmap { throw new NotPorted('fake::new_map'); } // STAGE1-STUB
/** #define FPIU(x) hr::fake::in_underlying_geometry([&] { return (x); }) */
export function fake_in_underlying_geometry<T>(_f: () => T): T { throw new NotPorted('fake::in_underlying_geometry'); } // STAGE1-STUB
