// racing.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8): stage 1 has racing::on == false
// (G.racing_on), so these are never reached. Each is marked STAGE1-STUB.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { NotPorted } from './hyper.ts';
import type { eLand } from './content.ts';

export function racing_generate_track(): void { throw new NotPorted('racing::generate_track'); } // STAGE1-STUB
export function racing_restore_goals(): void { throw new NotPorted('racing::restore_goals'); } // STAGE1-STUB
export function racing_reset_race(): void { throw new NotPorted('racing::reset_race'); } // STAGE1-STUB

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function racing_race_lands(): eLand[] { throw new NotPorted('racing::race_lands'); } // STAGE1-STUB
// added by D1 (hypgraph.ts centerpc, only with racing::on): STAGE2-STUB
export function racing_set_view(): boolean { throw new NotPorted('racing::set_view'); } // STAGE2-STUB

// added by U2 (menus.ts): STAGE2-STUB (racing is stage 3)
export function racing_configure_race(): void { throw new NotPorted('racing::configure_race'); } // STAGE2-STUB
export function racing_start_thurston(): void { throw new NotPorted('racing::start_thurston'); } // STAGE2-STUB
