// multigame.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8): the dual mode. Stage 1 has
// dual::state == 0 (G.dual_state); the functions that return at once in that state are real, the rest throws
// NotPorted. Each is marked STAGE1-STUB. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { NotPorted } from './hyper.ts';
import type { eLand } from './content.ts';

/** dual::split(reaction_t what): if(state != 1) return false; ... */
export function dual_split(_what: () => void): boolean { // STAGE1-STUB
  if (G.dual_state !== 1) return false;
  throw new NotPorted('dual::split');
}
export function dual_assign_landsides(): void { throw new NotPorted('dual::assign_landsides'); } // STAGE1-STUB
/** dual::enable(): if(dual::state) return; ... */
export function dual_enable(): void { // STAGE1-STUB
  if (G.dual_state) return;
  throw new NotPorted('dual::enable');
}
/** dual::disable(): if(!dual::state) return; ... */
export function dual_disable(): void { // STAGE1-STUB
  if (!G.dual_state) return;
  throw new NotPorted('dual::disable');
}

// added by P3 (landlock.ts, landgen.ts, monstergen.ts): STAGE1-STUB until its owner ports it
export function dual_check_side(_l: eLand): boolean { throw new NotPorted('dual::check_side'); } // STAGE1-STUB

// added by P7 (pcmove.ts): STAGE1-STUB
/** dual::movepc(int d, int subdir, bool checkonly): dual::state is 0 in stage 1 */
export function dual_movepc(_d: number, _subdir: number, _checkonly: boolean): boolean { throw new NotPorted('dual::movepc'); } // STAGE1-STUB

// added by U2 (menus.ts): STAGE2-STUB (the dual mode is stage 3; real while dual::state is 0)
/** void dual::may_split_or_do(reaction_t what) */
export function dual_may_split_or_do(what: () => void): void {
  if (G.dual_state === 1) throw new NotPorted('dual::may_split_or_do (dual mode)'); // STAGE2-STUB
  else what();
}
/** reaction_t dual::mayboth(reaction_t what) */
export function dual_mayboth(what: () => void): () => void { return () => { dual_may_split_or_do(what); }; }
/** bool gamestack::pushed() (nothing pushes a game in stage 2: the gd vector stays empty) */
export function gamestack_pushed(): boolean { return false; } // STAGE2-STUB (real: gd is empty)
/** void gamestack::pop(): if(!pushed()) return; */
export function gamestack_pop(): void { } // STAGE2-STUB (real: gd is empty)
