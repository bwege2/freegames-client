// crystal.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import type { cell } from './locations.ts';
import type { hrmap } from './cell.ts';

export function crystal_new_map(): hrmap { throw new NotPorted('crystal::new_map'); } // STAGE1-STUB
export function crystal_dist_alt(_c: cell): number { throw new NotPorted('crystal::dist_alt'); } // STAGE1-STUB
export function crystal_space_distance(_c1: cell, _c2: cell): number { throw new NotPorted('crystal::space_distance'); } // STAGE1-STUB
export function crystal_precise_distance(_c1: cell, _c2: cell): number { throw new NotPorted('crystal::precise_distance'); } // STAGE1-STUB
export function crystal_build_shortest_path(_c1: cell, _c2: cell): cell[] { throw new NotPorted('crystal::build_shortest_path'); } // STAGE1-STUB

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function crystal_set_land(_c: cell): void { throw new NotPorted('crystal::set_land'); } // STAGE1-STUB
export function crystal_may_place_compass(_c: cell): void { throw new NotPorted('crystal::may_place_compass'); } // STAGE1-STUB
// added by D1 (hypgraph.ts centerpc, only in crystal geometries): STAGE2-STUB
export function crystal_centerrug(_aspd: number): void { throw new NotPorted('crystal::centerrug'); } // STAGE2-STUB

// added by U2 (menus.ts mode_higlights): STAGE2-STUB (crystal geometries are stage 3)
export function crystal_set_crystal(_sides: number): void { throw new NotPorted('crystal::set_crystal'); } // STAGE2-STUB
export function crystal_crystal_knight_help(): void { throw new NotPorted('crystal::crystal_knight_help'); } // STAGE2-STUB
