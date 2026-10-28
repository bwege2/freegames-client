// @ts-nocheck
// COW 3.3.3 senddist.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { Dist2Mesg, makedistress } from './distress.ts';
import { getaddr2, getgroup, pmessage } from './smessage.ts';
import { gettarget, gettarget2 } from './util.ts';
import { struct_distress, struct_event } from './structs.ts';
import { $sadd, $view8, G, P, S, free, printf, strchr, strncmp } from '../rt/index.ts';
import { MDISTR, MMACRO, MTEAM, NEWMULTIM, PFCLOAK, PFENG, PFWEP, TARG_ENEMY, TARG_FRIEND, TARG_PLANET, TARG_PLAYER, generic, take } from './consts.ts';


function loaddistress(i: number, data: struct_event | null): struct_distress | null {
  let dist = null;
  let target = null;
  dist = new struct_distress();
  dist.sender = G.me.p_no & 0xff;
  dist.dam = (100 * G.me.p_damage / G.me.p_ship.s_maxdamage | 0) & 0xff;
  dist.shld = (100 * G.me.p_shield / G.me.p_ship.s_maxshield | 0) & 0xff;
  dist.arms = G.me.p_armies & 0xff;
  dist.fuelp = (100 * G.me.p_fuel / G.me.p_ship.s_maxfuel | 0) & 0xff;
  dist.wtmp = (100 * G.me.p_wtemp / G.me.p_ship.s_maxwpntemp | 0) & 0xff;
  if (dist.wtmp > 127) {
    dist.wtmp = 127;
  }
  dist.etmp = (100 * G.me.p_etemp / G.me.p_ship.s_maxegntemp | 0) & 0xff;
  dist.sts = ((G.me.p_flags & 255) >>> 0 | 128) >>> 0 & 0xff;
  dist.wtmpflag = ((G.me.p_flags & PFWEP) >>> 0 > 0 ? 1 : 0) & 0xff;
  dist.etempflag = ((G.me.p_flags & PFENG) >>> 0 > 0 ? 1 : 0) & 0xff;
  dist.cloakflag = ((G.me.p_flags & PFCLOAK) >>> 0 > 0 ? 1 : 0) & 0xff;
  dist.distype = i & 0xff;
  if (dist.distype > generic || dist.distype < take) {
    dist.distype = generic;
  }
  target = gettarget2(G.me.p_x, G.me.p_y, TARG_PLANET);
  dist.close_pl = target.o_num & 0xff;
  target = gettarget(data.Window, data.x, data.y, TARG_PLANET);
  dist.tclose_pl = target.o_num & 0xff;
  target = gettarget2(G.me.p_x, G.me.p_y, TARG_ENEMY);
  dist.close_en = target.o_num & 0xff;
  target = gettarget(data.Window, data.x, data.y, TARG_ENEMY);
  dist.tclose_en = target.o_num & 0xff;
  target = gettarget2(G.me.p_x, G.me.p_y, TARG_FRIEND);
  dist.close_fr = target.o_num & 0xff;
  target = gettarget(data.Window, data.x, data.y, TARG_FRIEND);
  dist.tclose_fr = target.o_num & 0xff;
  target = gettarget2(G.me.p_x, G.me.p_y, TARG_PLAYER);
  dist.close_j = target.o_num & 0xff;
  target = gettarget(data.Window, data.x, data.y, TARG_PLAYER);
  dist.tclose_j = target.o_num & 0xff;
  dist.cclist[0] = 128;
  dist.preappend[0] = 0;
  dist.macroflag = 0;
  return dist;
}

export function emergency(i: number, data: struct_event | null): void {
  let ebuf = new Int8Array(200);
  let dist = null;
  let cry = new Int8Array(80);
  let info = null;
  let len = 0;
  let recip = 0;
  let group = 0;
  group = MTEAM;
  recip = G.me.p_team;
  dist = loaddistress(i, data);
  if (G.gen_distress) {
    Dist2Mesg(dist, P(ebuf));
    pmessage(P(ebuf), recip, group | MDISTR);
  } else {
    len = makedistress(dist, P(cry), $sadd(G.distmacro, dist.distype).macro);
    if (len > 0) {
      info = P(cry);
      if (strncmp(getaddr2(MTEAM, recip), P(cry), 8) === 0) {
        info = P(cry).add(9);
      }
      pmessage(info, recip, group);
    }
  }
  free(dist);
}

export function pmacro(mnum: number, who: number, data: struct_event | null): number {
  let addr = 0;
  let group = 0;
  let len = 0;
  const recip = new Int32Array(1);
  let cry = new Int8Array(80);
  let pm = null;
  let dist = null;
  if (!G.UseNewMacro) {
    return 0;
  }
  if (G.keys[0] !== 0) {
    if (pm = strchr($view8(P(G.keys), true), who)) {
      who = G.macroKeys[pm.o - $view8(P(G.keys), true).o].dest << 24 >> 24;
    }
  }
  if (who === 116 || who === 84) {
    addr = G.teamlet[G.me.p_team];
  } else {
    addr = who;
  }
  group = getgroup(addr, P(recip, 0));
  if (!group) {
    printf(S("Bad group! %c %d %d\n"), addr, recip[0], group);
    return 0;
  }
  pm = G.macro[mnum].string;
  dist = loaddistress(0, data);
  len = makedistress(dist, P(cry), pm);
  if (len > 0) {
    if (G.multiline_enabled && G.macro[mnum].type === NEWMULTIM) {
      pmessage(P(cry), recip[0], group | MMACRO);
    } else {
      pmessage(P(cry), recip[0], group);
    }
  }
  free(dist);
  return 1;
}

export function $init(): void {
}
