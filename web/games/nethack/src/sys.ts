// @ts-nocheck
// NetHack 3.6.7 sys.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { panic } from './end.ts';
import { struct_sysopt } from './structs.ts';
import { G, S, free } from './rt/index.ts';
import { ENTRYMAX, PERSMAX, PERS_IS_UID, POINTSMIN } from './consts.ts';


export async function sys_early_init(): Promise<void> {
  G.sysopt.support = null;
  G.sysopt.recover = null;
  G.sysopt.wizards = null;
  G.sysopt.debugfiles = null;
  G.sysopt.dumplogfile = null;
  G.sysopt.env_dbgfl = 0;
  G.sysopt.shellers = null;
  G.sysopt.explorers = null;
  G.sysopt.genericusers = null;
  G.sysopt.maxplayers = 0;
  G.sysopt.bones_pools = 0;
  G.sysopt.persmax = PERSMAX;
  G.sysopt.entrymax = ENTRYMAX;
  G.sysopt.pointsmin = POINTSMIN;
  G.sysopt.pers_is_uid = PERS_IS_UID;
  G.sysopt.tt_oname_maxrank = 10;
  if (PERSMAX < 1) {
    G.sysopt.persmax = 1;
  }
  if (ENTRYMAX < 10) {
    G.sysopt.entrymax = 10;
  }
  if (POINTSMIN < 1) {
    G.sysopt.pointsmin = 1;
  }
  if (PERS_IS_UID !== 0 && PERS_IS_UID !== 1) {
    await panic(S("config error: PERS_IS_UID must be either 0 or 1"));
  }
  G.sysopt.check_save_uid = 1;
  G.sysopt.check_plname = 0;
  G.sysopt.seduce = 1;
  sysopt_seduce_set(G.sysopt.seduce);
  G.sysopt.accessibility = 0;
  return;
}

export function sysopt_release(): void {
  if (G.sysopt.support) {
    free(G.sysopt.support), G.sysopt.support = null;
  }
  if (G.sysopt.recover) {
    free(G.sysopt.recover), G.sysopt.recover = null;
  }
  if (G.sysopt.wizards) {
    free(G.sysopt.wizards), G.sysopt.wizards = null;
  }
  if (G.sysopt.explorers) {
    free(G.sysopt.explorers), G.sysopt.explorers = null;
  }
  if (G.sysopt.shellers) {
    free(G.sysopt.shellers), G.sysopt.shellers = null;
  }
  if (G.sysopt.debugfiles) {
    free(G.sysopt.debugfiles), G.sysopt.debugfiles = null;
  }
  if (G.sysopt.dumplogfile) {
    free(G.sysopt.dumplogfile), G.sysopt.dumplogfile = null;
  }
  if (G.sysopt.genericusers) {
    free(G.sysopt.genericusers), G.sysopt.genericusers = null;
  }
  if (G.sysopt.gdbpath) {
    free(G.sysopt.gdbpath), G.sysopt.gdbpath = null;
  }
  if (G.sysopt.greppath) {
    free(G.sysopt.greppath), G.sysopt.greppath = null;
  }
  if (G.sysopt.fmtd_wizard_list) {
    free(G.sysopt.fmtd_wizard_list), G.sysopt.fmtd_wizard_list = null;
  }
  return;
}

export function sysopt_seduce_set(val: number): void {
  ;
  return;
}

export function $init(): void {
  G.sysopt = new struct_sysopt();
}
