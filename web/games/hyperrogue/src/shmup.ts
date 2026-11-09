// shmup.cpp of HyperRogue 13.1o. STUB (a later stage; owned by package P8; created by P2): stage 1 has
// shmup::on == false (G.shmup_on), so these are never reached.
import { NotPorted } from './hyper.ts';
import type { cell } from './locations.ts';
import { G } from './globals.ts';

export function shmup_visibleFor(_t: number): void { throw new NotPorted('shmup::visibleFor'); } // STAGE1-STUB
export function shmup_boatAt(_c: cell): boolean { throw new NotPorted('shmup::boatAt'); } // STAGE1-STUB

// added by P8 (system.ts): STAGE1-STUB
export function shmup_init(): void { throw new NotPorted('shmup::init'); } // STAGE1-STUB

// added by P5 (complex.ts, mapeffects.ts): STAGE1-STUB until its owner ports it
export function shmup_destroyBoats(_c: cell): void { throw new NotPorted('shmup::destroyBoats'); } // STAGE1-STUB (shmup::on is false in stage 1)
export function shmup_activateArrow(_c: cell): void { throw new NotPorted('shmup::activateArrow'); } // STAGE1-STUB (shmup::on is false in stage 1)

// added by P6 (attack.ts, environment.ts): STAGE1-STUB (shmup::on is false in stage 1)
export function shmup_dragonbreath(_dragon: cell): boolean { throw new NotPorted('shmup::dragonbreath'); } // STAGE1-STUB
/** degradeDemons(): walks shmup's monster list (nonvirtual), which is empty outside shmup */
export function shmup_degradeDemons(): void { } // STAGE1-STUB (real for stage 1)
export function shmup_killThePlayer(_m: number): void { throw new NotPorted('shmup::killThePlayer'); } // STAGE1-STUB

// added by P7 (pcmove.ts, orbs.ts, game.ts): STAGE1-STUB (shmup::on is false in stage 1)
export function shmup_recall(): void { throw new NotPorted('shmup::recall'); } // STAGE1-STUB
export function shmup_teleported(): void { throw new NotPorted('shmup::teleported'); } // STAGE1-STUB
export function shmup_pushmonsters(): void { throw new NotPorted('shmup::pushmonsters'); } // STAGE1-STUB
export function shmup_popmonsters(): void { throw new NotPorted('shmup::popmonsters'); } // STAGE1-STUB
export function shmup_playerpos(_i: number): cell { throw new NotPorted('shmup::playerpos'); } // STAGE1-STUB
export function shmup_playerInBoat(_i: number): boolean { throw new NotPorted('shmup::playerInBoat'); } // STAGE1-STUB
/** verifyTeleport(): if(!on) return true; ... */
export function shmup_verifyTeleport(): boolean { if (!G.shmup_on) return true; throw new NotPorted('shmup::verifyTeleport'); } // STAGE1-STUB (real when !on)
/** eItem targetRangedOrb(orbAction a): if(!on) return itNone; ... */
export function shmup_targetRangedOrb(_a: number): number { if (!G.shmup_on) return 0; throw new NotPorted('shmup::targetRangedOrb'); } // STAGE1-STUB (real when !on)

// added by U3 (control.ts mainloopiter): shmup::turn returns at once while shmup::on is off (the mouse target of
// shmup: no shmup monsters); STAGE2-STUB
export function shmup_turn(_delta: number): void { if (G.shmup_on) throw new NotPorted('shmup::turn'); } // STAGE2-STUB

// added by U2 (help.ts describeMouseover): shmup::mousetarget is null without shmup, so nothing is added;
// STAGE2-STUB
/** void addShmupHelp(string& out) */
export function shmup_addShmupHelp(_out: { v: string }): void { if (G.shmup_on) throw new NotPorted('shmup::addShmupHelp'); } // STAGE2-STUB
/** void switch_shmup() (menus.cpp's special modes: shmup is stage 3) */
export function shmup_switch_shmup(): void { throw new NotPorted('shmup::switch_shmup (stage 3)'); } // STAGE2-STUB
