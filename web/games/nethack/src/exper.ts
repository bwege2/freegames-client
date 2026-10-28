// @ts-nocheck
// NetHack 3.6.7 exper.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { acurr, adjabil, newhp } from './attrib.ts';
import { exp_percent_changing } from './botl.ts';
import { done } from './end.ts';
import { monhp_per_lvl, reset_rndmonst } from './makemon.ts';
import { resists_drli } from './mondata.ts';
import { You_feel, pline } from './pline.ts';
import { rehumanize } from './polyself.ts';
import { rn2, rnd } from './rnd.ts';
import { Goodbye } from './role.ts';
import { find_mac } from './worn.ts';
import { struct_monst } from './structs.ts';
import { $peq, $sat, $shl64, G, P, S, strcmp, strcpy } from './rt/index.ts';
import { AD_BLND, AD_DRLI, AD_PHYS, AD_SLIM, AD_STON, AD_WRAP, AT_BUTT, AT_MAGC, AT_WEAP, A_WIS, DIED, KILLED_BY, LARGEST_INT, LONG_MAX, MAGICAL_BREATHING, MAXULEV, NATTK, NON_PM, NORMAL_SPEED, PM_MAIL_DAEMON, S_EEL, TRUE } from './consts.ts';


export function newuexp(lev: number): number {
  if (lev < 1) {
    return 0;
  }
  if (lev < 10) {
    return 10 * $shl64(1, lev);
  }
  if (lev < 20) {
    return 10000 * $shl64(1, lev - 10);
  }
  return 10000000 * (lev - 19);
}

function enermod(en: number): number {
  switch (G.urole.malenum) {
  case 335:
  case 342:
    return 2 * en;
  case 332:
  case 333:
    return 3 * en / 2 | 0;
  case 329:
  case 341:
    return 3 * en / 4 | 0;
  default:
    return en;
  }
}

export function newpw(): number {
  let en = 0;
  let enrnd = 0;
  let enfix = 0;
  if (G.u.ulevel === 0) {
    en = G.urole.enadv.infix + G.urace.enadv.infix;
    if (G.urole.enadv.inrnd > 0) {
      en += rnd(G.urole.enadv.inrnd);
    }
    if (G.urace.enadv.inrnd > 0) {
      en += rnd(G.urace.enadv.inrnd);
    }
  } else {
    enrnd = acurr(A_WIS) / 2 | 0;
    if (G.u.ulevel < G.urole.xlev) {
      enrnd += G.urole.enadv.lornd + G.urace.enadv.lornd;
      enfix = G.urole.enadv.lofix + G.urace.enadv.lofix;
    } else {
      enrnd += G.urole.enadv.hirnd + G.urace.enadv.hirnd;
      enfix = G.urole.enadv.hifix + G.urace.enadv.hifix;
    }
    en = enermod(rn2(enrnd) + enfix);
  }
  if (en <= 0) {
    en = 1;
  }
  if (G.u.ulevel < MAXULEV) {
    G.u.ueninc[G.u.ulevel] = en << 24 >> 24;
  }
  return en;
}

export function experience(mtmp: struct_monst | null, nk: number): number {
  let ptr = mtmp.data;
  let i = 0;
  let tmp = 0;
  let tmp2 = 0;
  tmp = 1 + Math.imul(mtmp.m_lev, mtmp.m_lev);
  if ((i = find_mac(mtmp)) < 3) {
    tmp += Math.imul(7 - i, i < 0 ? 2 : 1);
  }
  if (ptr.mmove > NORMAL_SPEED) {
    tmp += ptr.mmove > (3 * NORMAL_SPEED / 2 | 0) ? 5 : 3;
  }
  for (i = 0; i < NATTK; ++i) {
    tmp2 = ptr.mattk[i].aatyp;
    if (tmp2 > AT_BUTT) {
      if (tmp2 === AT_WEAP) {
        tmp += 5;
      } else if (tmp2 === AT_MAGC) {
        tmp += 10;
      } else {
        tmp += 3;
      }
    }
  }
  for (i = 0; i < NATTK; ++i) {
    tmp2 = ptr.mattk[i].adtyp;
    if (tmp2 > AD_PHYS && tmp2 < AD_BLND) {
      tmp += 2 * mtmp.m_lev;
    } else if (tmp2 === AD_DRLI || tmp2 === AD_STON || tmp2 === AD_SLIM) {
      tmp += 50;
    } else if (tmp2 !== AD_PHYS) {
      tmp += mtmp.m_lev;
    }
    if (Math.imul(ptr.mattk[i].damd, ptr.mattk[i].damn) > 23) {
      tmp += mtmp.m_lev;
    }
    if (tmp2 === AD_WRAP && ptr.mlet === S_EEL && !(G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0)) {
      tmp += 1000;
    }
  }
  if ((ptr.mflags2 & 33554432) >>> 0 !== 0) {
    tmp += 7 * mtmp.m_lev;
  }
  if (mtmp.m_lev > 8) {
    tmp += 50;
  }
  if (mtmp.data === $sat(G.mons, PM_MAIL_DAEMON)) {
    tmp = 1;
  }
  if (mtmp.mrevived | 0 || mtmp.mcloned | 0) {
    for (i = 0, tmp2 = 20; nk > tmp2 && tmp > 1; ++i) {
      tmp = (tmp + 1) / 2 | 0;
      nk -= tmp2;
      if (i & 1) {
        tmp2 += 20;
      }
    }
  }
  return tmp;
}

export async function more_experienced(exper: number, rexp: number): Promise<void> {
  let oldexp = G.u.uexp;
  let oldrexp = G.u.urexp;
  let newexp = oldexp + exper;
  let rexpincr = 4 * exper + rexp;
  let newrexp = oldrexp + rexpincr;
  if (newexp < 0 && exper > 0) {
    newexp = LONG_MAX;
  }
  if (newrexp < 0 && rexpincr > 0) {
    newrexp = LONG_MAX;
  }
  if (newexp !== oldexp) {
    G.u.uexp = newexp;
    if (G.flags.showexp) {
      G.context.botl = TRUE;
    }
    if (!G.context.botl && await exp_percent_changing()) {
      G.context.botl = TRUE;
    }
  }
  if (newrexp !== oldrexp) {
    G.u.urexp = newrexp;
  }
  if (G.u.urexp >= (G.urole.malenum === 342 ? 1000 : 2000)) {
    G.flags.beginner = 0;
  }
}

export async function losexp(drainer: Ptr | null): Promise<void> {
  let num = 0;
  if (drainer && !strcmp(drainer, S("#levelchange"))) {
    drainer = null;
  } else if (resists_drli(G.youmonst)) {
    return;
  }
  if (G.u.ulevel > 1) {
    await pline(S("%s level %d."), Goodbye(), G.u.ulevel--);
    await adjabil(G.u.ulevel + 1, G.u.ulevel);
    reset_rndmonst(NON_PM);
  } else {
    if (drainer) {
      G.killer.format = KILLED_BY;
      if (!$peq(P(G.killer.name), drainer)) {
        strcpy(P(G.killer.name), drainer);
      }
      await done(DIED);
    }
    G.u.uexp = 0;
  }
  num = G.u.uhpinc[G.u.ulevel];
  G.u.uhpmax -= num;
  if (G.u.uhpmax < 1) {
    G.u.uhpmax = 1;
  }
  G.u.uhp -= num;
  if (G.u.uhp < 1) {
    G.u.uhp = 1;
  } else if (G.u.uhp > G.u.uhpmax) {
    G.u.uhp = G.u.uhpmax;
  }
  num = G.u.ueninc[G.u.ulevel];
  G.u.uenmax -= num;
  if (G.u.uenmax < 0) {
    G.u.uenmax = 0;
  }
  G.u.uen -= num;
  if (G.u.uen < 0) {
    G.u.uen = 0;
  } else if (G.u.uen > G.u.uenmax) {
    G.u.uen = G.u.uenmax;
  }
  if (G.u.uexp > 0) {
    G.u.uexp = newuexp(G.u.ulevel) - 1;
  }
  if (G.u.umonnum !== G.u.umonster) {
    num = await monhp_per_lvl(G.youmonst);
    G.u.mhmax -= num;
    G.u.mh -= num;
    if (G.u.mh <= 0) {
      await rehumanize();
    }
  }
  G.context.botl = TRUE;
}

export async function newexplevel(): Promise<void> {
  if (G.u.ulevel < MAXULEV && G.u.uexp >= newuexp(G.u.ulevel)) {
    await pluslvl(TRUE);
  }
}

export async function pluslvl(incr: number): Promise<void> {
  let hpinc = 0;
  let eninc = 0;
  if (!incr) {
    await You_feel(S("more experienced."));
  }
  if (G.u.umonnum !== G.u.umonster) {
    hpinc = await monhp_per_lvl(G.youmonst);
    G.u.mhmax += hpinc;
    G.u.mh += hpinc;
  }
  hpinc = newhp();
  G.u.uhpmax += hpinc;
  G.u.uhp += hpinc;
  eninc = newpw();
  G.u.uenmax += eninc;
  G.u.uen += eninc;
  if (G.u.ulevel < MAXULEV) {
    if (incr) {
      let tmp = newuexp(G.u.ulevel + 1);
      if (G.u.uexp >= tmp) {
        G.u.uexp = tmp - 1;
      }
    } else {
      G.u.uexp = newuexp(G.u.ulevel);
    }
    ++G.u.ulevel;
    await pline(S("Welcome %sto experience level %d."), G.u.ulevelmax < G.u.ulevel ? S("") : S("back "), G.u.ulevel);
    if (G.u.ulevelmax < G.u.ulevel) {
      G.u.ulevelmax = G.u.ulevel;
    }
    await adjabil(G.u.ulevel - 1, G.u.ulevel);
    reset_rndmonst(NON_PM);
  }
  G.context.botl = TRUE;
}

export function rndexp(gaining: number): number {
  let minexp = 0;
  let maxexp = 0;
  let diff = 0;
  let factor = 0;
  let result = 0;
  minexp = G.u.ulevel === 1 ? 0 : newuexp(G.u.ulevel - 1);
  maxexp = newuexp(G.u.ulevel);
  diff = maxexp - minexp, factor = 1;
  while (diff >= LARGEST_INT) {
    diff = Math.trunc(diff / 2), factor = factor * 2;
  }
  result = minexp + factor * rn2(diff | 0);
  if (G.u.ulevel === MAXULEV && gaining) {
    result += G.u.uexp - minexp;
    if (result < G.u.uexp) {
      result = G.u.uexp;
    }
  }
  return result;
}

export function $init(): void {
}
