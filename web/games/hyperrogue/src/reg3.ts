// reg3.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';
import { WDIM, euclid, nonisotropic, mhybrid } from './classes.ts';
import { bt_in } from './binary-tiling.ts';
import { kite_in } from './kite.ts';
import { fake_in } from './fake.ts';
import type { cell, heptagon } from './locations.ts';
import type { hrmap } from './cell.ts';

/** reg3::in(); the cube tiling's cubes_reg3 / FPIU branches throw (other geometries) */
export function reg3_in(): boolean { // STAGE1-STUB (real for the standard geometry)
  if (fake_in()) throw new NotPorted('reg3::in (fake)');
  return WDIM() === 3 && !euclid() && !bt_in() && !nonisotropic() && !mhybrid() && !kite_in();
}
/** in_hrmap_rule_or_subrule(): only in 3D rule maps */
export function reg3_in_hrmap_rule_or_subrule(): boolean { return false; } // STAGE1-STUB
/** exact_rules(): only in 3D rule maps */
export function reg3_exact_rules(): boolean { return false; } // STAGE1-STUB
export function reg3_new_map(): hrmap { throw new NotPorted('reg3::new_map'); } // STAGE1-STUB
export function reg3_new_alt_map(_o: heptagon): hrmap { throw new NotPorted('reg3::new_alt_map'); } // STAGE1-STUB
export function reg3_altdist(_h: heptagon): number { throw new NotPorted('reg3::altdist'); } // STAGE1-STUB
export function reg3_celldistance(_c1: cell, _c2: cell): number { throw new NotPorted('reg3::celldistance'); } // STAGE1-STUB
