// intra.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P1): what the stage-1 files use of it.
// Functions that test the current geometry are real (they give the standard geometry's answer there); the others
// throw NotPorted, as the standard geometry never reaches them. Each is marked STAGE1-STUB.
import { NotPorted } from './hyper.ts';

// bool intra::in: G.intra_in
export function intra_erase_all_maps(): void { throw new NotPorted('intra::erase_all_maps'); } // STAGE1-STUB
// added by D1 (hypgraph.ts optimizeview): STAGE2-STUB
/** intra::apply_scale(): `if(scale != 1) ...`; intra::scale is 1 outside portal spaces */
export function intra_apply_scale(): void { } // STAGE2-STUB (real outside portals)
/** walking::handle(): `if(playermoved || !on) return; ...`; walking::on is false outside portal spaces */
export function walking_handle(): void {
  if (G.playermoved || !G.walking_on) return;
  throw new NotPorted('walking::handle'); // STAGE2-STUB
}
import { G } from './globals.ts';
