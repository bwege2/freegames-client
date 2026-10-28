// @ts-nocheck
// NetHack 3.6.7 wizard.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { newsym } from './display.ts';
import { Monnam, hcolor } from './do_name.ts';
import { mon_arrive, mon_catchup_elapsed_time } from './dog.ts';
import { In_W_tower, In_hell, builds_up, on_level } from './dungeon.ts';
import { dist2, sgn } from './hacklib.ts';
import { makemon, set_malign } from './makemon.ts';
import { monster_census, msummon } from './minion.ts';
import { add_to_minv, mksobj, obj_extract_self } from './mkobj.ts';
import { mnearto, mnexto } from './mon.ts';
import { attacktype } from './mondata.ts';
import { Tobjnam, distant_name, doname } from './objnam.ts';
import { You, You_feel, pline, verbalize } from './pline.ts';
import { inhistemple, mon_aligntyp } from './priest.ts';
import { com_pager } from './questpgr.ts';
import { rn2, rnd } from './rnd.ts';
import { inhishop } from './shk.ts';
import { rndcurse } from './sit.ts';
import { mpickobj } from './steal.ts';
import { enexto, rloc, rloc_to } from './teleport.ts';
import { struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $rd, $sat, $shl64, $shr64, $ta, $u64, $wr, G, P, S } from './rt/index.ts';
import { AMULET_OF_YENDOR, AT_MAGC, BELL_OF_OPENING, BLINDED, BOLT_LIM, CANDELABRUM_OF_INVOCATION, DEAF, FAKE_AMULET_OF_YENDOR, FALSE, HALLUC, HALLUC_RES, LARGEST_INT, M3_WANTSAMUL, M3_WANTSARTI, M3_WANTSBELL, M3_WANTSBOOK, M3_WANTSCAND, MAGIC_PORTAL, MAXNASTIES, MM_NOWAIT, M_AP_MONSTER, NO_MM_FLAGS, PM_ALEAX, PM_ARCH_LICH, PM_BALUCHITHERIUM, PM_BARBED_DEVIL, PM_BLACK_DRAGON, PM_CAPTAIN, PM_CARNIVOROUS_APE, PM_COCKATRICE, PM_COUATL, PM_DISENCHANTER, PM_ELF_LORD, PM_ELVENKING, PM_ETTIN, PM_FIRE_ELEMENTAL, PM_FIRE_GIANT, PM_FLOATING_EYE, PM_GREEN_DRAGON, PM_GREEN_SLIME, PM_GREMLIN, PM_GUARDIAN_NAGA, PM_HORNED_DEVIL, PM_HUMAN, PM_IRON_GOLEM, PM_JABBERWOCK, PM_LEOCROTTA, PM_MASTER_MIND_FLAYER, PM_MINOTAUR, PM_OCHRE_JELLY, PM_OGRE_KING, PM_OLOG_HAI, PM_ORANGE_DRAGON, PM_OWLBEAR, PM_PURPLE_WORM, PM_RED_DRAGON, PM_SILVER_DRAGON, PM_STALKER, PM_STORM_GIANT, PM_TRAPPER, PM_TROLL, PM_UMBER_HULK, PM_VAMPIRE, PM_VAMPIRE_LORD, PM_WATER_DEMON, PM_WINGED_GARGOYLE, PM_WIZARD_OF_YENDOR, PM_XAN, PM_XORN, PM_YELLOW_DRAGON, PM_ZRUTY, QTN_ANGELIC, QTN_DEMONIC, QT_ANGELIC, QT_DEMONIC, SPE_BOOK_OF_THE_DEAD, STRAT_APPEARMSG, STRAT_GOAL, STRAT_GROUND, STRAT_HEAL, STRAT_NONE, STRAT_PLAYER, STRAT_STRATMASK, STRAT_WAITFORU, STRAT_WAITMASK, S_ANGEL, S_DEMON, TRUE } from './consts.ts';

let nasties: any;
let wizapp: any;

export async function amulet(): Promise<void> {
  let mtmp = null;
  let ttmp = null;
  let amu = null;
  if ((!!(amu = G.uamul) && amu.otyp === AMULET_OF_YENDOR || !!(amu = G.uwep) && amu.otyp === AMULET_OF_YENDOR) && !rn2(15)) {
    for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
      if ((ttmp.ttyp | 0) === MAGIC_PORTAL) {
        let du = dist2(ttmp.tx, ttmp.ty, G.u.ux, G.u.uy);
        if (du <= 9) {
          await pline(S("%s hot!"), await Tobjnam(amu, S("feel")));
        } else if (du <= 64) {
          await pline(S("%s very warm."), await Tobjnam(amu, S("feel")));
        } else if (du <= 144) {
          await pline(S("%s warm."), await Tobjnam(amu, S("feel")));
        }
        break;
      }
    }
  }
  if (!G.context.no_of_wizards) {
    return;
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.iswiz | 0 && mtmp.msleeping | 0 && !rn2(40)) {
      mtmp.msleeping = 0;
      if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
        await You(S("get the creepy feeling that somebody noticed your taking the Amulet."));
      }
      return;
    }
  }
}

export function mon_has_amulet(mtmp: struct_monst | null): number {
  let otmp = null;
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === AMULET_OF_YENDOR) {
      return 1;
    }
  }
  return 0;
}

export function mon_has_special(mtmp: struct_monst | null): number {
  let otmp = null;
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === AMULET_OF_YENDOR || otmp.oartifact >= 21 || otmp.otyp === BELL_OF_OPENING || otmp.otyp === CANDELABRUM_OF_INVOCATION || otmp.otyp === SPE_BOOK_OF_THE_DEAD) {
      return 1;
    }
  }
  return 0;
}

function which_arti(mask: number): number {
  switch (mask) {
  case 1:
    return AMULET_OF_YENDOR;
  case 2:
    return BELL_OF_OPENING;
  case 8:
    return CANDELABRUM_OF_INVOCATION;
  case 4:
    return SPE_BOOK_OF_THE_DEAD;
  default:
    break;
  }
  return 0;
}

function mon_has_arti(mtmp: struct_monst | null, otyp: number): number {
  let otmp = null;
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    if (otyp) {
      if (otmp.otyp === otyp) {
        return 1;
      }
    } else if (otmp.oartifact >= 21) {
      return 1;
    }
  }
  return 0;
}

function other_mon_has_arti(mtmp: struct_monst | null, otyp: number): struct_monst | null {
  let mtmp2 = null;
  for (mtmp2 = G.level.monlist; mtmp2; mtmp2 = mtmp2.nmon) {
    if (mtmp2 !== mtmp) {
      if (mon_has_arti(mtmp2, otyp)) {
        return mtmp2;
      }
    }
  }
  return null;
}

function on_ground(otyp: number): struct_obj | null {
  let otmp = null;
  for (otmp = G.level.objlist; otmp; otmp = otmp.nobj) {
    if (otyp) {
      if (otmp.otyp === otyp) {
        return otmp;
      }
    } else if (otmp.oartifact >= 21) {
      return otmp;
    }
  }
  return null;
}

function you_have(mask: number): number {
  switch (mask) {
  case 1:
    return G.u.uhave.amulet << 24 >> 24;
  case 2:
    return G.u.uhave.bell << 24 >> 24;
  case 8:
    return G.u.uhave.menorah << 24 >> 24;
  case 4:
    return G.u.uhave.book << 24 >> 24;
  case 16:
    return G.u.uhave.questart << 24 >> 24;
  default:
    break;
  }
  return 0;
}

function target_on(mask: number, mtmp: struct_monst | null): number {
  let otyp = 0;
  let otmp = null;
  let mtmp2 = null;
  if (!(mtmp.data.mflags3 & mask)) {
    return STRAT_NONE;
  }
  otyp = which_arti(mask);
  if (!mon_has_arti(mtmp, otyp)) {
    if (you_have(mask)) {
      return (((16777216 | $shl64($u64(G.u.ux), 16)) >>> 0 | $shl64($u64(G.u.uy), 8)) >>> 0 | $u64(mask)) >>> 0;
    } else if (otmp = on_ground(otyp)) {
      return (((67108864 | $shl64($u64(otmp.ox), 16)) >>> 0 | $shl64($u64(otmp.oy), 8)) >>> 0 | $u64(mask)) >>> 0;
    } else if (!!(mtmp2 = other_mon_has_arti(mtmp, otyp)) && (otyp !== AMULET_OF_YENDOR || !mtmp2.iswiz && !inhistemple(mtmp2))) {
      return (((33554432 | $shl64($u64(mtmp2.mx), 16)) >>> 0 | $shl64($u64(mtmp2.my), 8)) >>> 0 | $u64(mask)) >>> 0;
    }
  }
  return STRAT_NONE;
}

function strategy(mtmp: struct_monst | null): number {
  let strat = 0;
  let dstrat = 0;
  if (!(mtmp.data.mflags3 & 31) || mtmp.isshk | 0 && inhishop(mtmp) || mtmp.ispriest | 0 && inhistemple(mtmp)) {
    return STRAT_NONE;
  }
  switch (mtmp.mhp * 3 / mtmp.mhpmax | 0) {
  default:
  case 0:
    return STRAT_HEAL;
  case 1:
    if (mtmp.data !== $sat(G.mons, PM_WIZARD_OF_YENDOR)) {
      return STRAT_HEAL;
    }
  case 2:
    dstrat = STRAT_HEAL;
    break;
  case 3:
    dstrat = STRAT_NONE;
    break;
  }
  if (G.context.made_amulet) {
    if ((strat = target_on(M3_WANTSAMUL, mtmp)) !== STRAT_NONE) {
      return strat;
    }
  }
  if (G.u.uevent.invoked) {
    if ((strat = target_on(M3_WANTSARTI, mtmp)) !== STRAT_NONE) {
      return strat;
    }
    if ((strat = target_on(M3_WANTSBOOK, mtmp)) !== STRAT_NONE) {
      return strat;
    }
    if ((strat = target_on(M3_WANTSBELL, mtmp)) !== STRAT_NONE) {
      return strat;
    }
    if ((strat = target_on(M3_WANTSCAND, mtmp)) !== STRAT_NONE) {
      return strat;
    }
  } else {
    if ((strat = target_on(M3_WANTSBOOK, mtmp)) !== STRAT_NONE) {
      return strat;
    }
    if ((strat = target_on(M3_WANTSBELL, mtmp)) !== STRAT_NONE) {
      return strat;
    }
    if ((strat = target_on(M3_WANTSCAND, mtmp)) !== STRAT_NONE) {
      return strat;
    }
    if ((strat = target_on(M3_WANTSARTI, mtmp)) !== STRAT_NONE) {
      return strat;
    }
  }
  return dstrat;
}

export function choose_stairs(sx: Ptr | null, sy: Ptr | null): void {
  let x = 0;
  let y = 0;
  if (builds_up(G.u.uz)) {
    if (G.dnstair.sx) {
      x = G.dnstair.sx;
      y = G.dnstair.sy;
    } else if (G.dnladder.sx) {
      x = G.dnladder.sx;
      y = G.dnladder.sy;
    }
  } else {
    if (G.upstair.sx) {
      x = G.upstair.sx;
      y = G.upstair.sy;
    } else if (G.upladder.sx) {
      x = G.upladder.sx;
      y = G.upladder.sy;
    }
  }
  if (!x && G.sstairs.sx) {
    x = G.sstairs.sx;
    y = G.sstairs.sy;
  }
  if (x && y) {
    sx.a[sx.o] = x;
    sy.a[sy.o] = y;
  }
}

export async function tactics(mtmp: struct_monst | null): Promise<number> {
  let strat = strategy(mtmp);
  const sx = new Int8Array(1);
  sx[0] = 0;
  const sy = new Int8Array(1);
  sy[0] = 0;
  let mx = 0;
  let my = 0;
  mtmp.mstrategy = ((mtmp.mstrategy & (STRAT_WAITMASK | STRAT_APPEARMSG) >>> 0) >>> 0 | strat) >>> 0;
  switch (strat) {
  case 134217728:
    mx = mtmp.mx, my = mtmp.my;
    choose_stairs(P(sx, 0), P(sy, 0));
    mtmp.mavenge = 1;
    if (await In_W_tower(mx, my, G.u.uz) || mtmp.iswiz | 0 && !sx[0] && !mon_has_amulet(mtmp)) {
      if (!rn2(3 + (mtmp.mhp / 10 | 0))) {
        await rloc(mtmp, TRUE);
      }
    } else if (sx[0] && (mx !== sx[0] || my !== sy[0])) {
      if (!await mnearto(mtmp, sx[0], sy[0], TRUE)) {
        await rloc_to(mtmp, mx, my);
        return 0;
      }
      mx = mtmp.mx, my = mtmp.my;
    }
    if (dist2(mx, my, G.u.ux, G.u.uy) > Math.imul(BOLT_LIM, BOLT_LIM)) {
      if (mtmp.mhp <= mtmp.mhpmax - 8) {
        mtmp.mhp += rnd(8);
        return 1;
      }
    }
  case 0:
    if (!rn2(!mtmp.mflee ? 5 : 33)) {
      await mnexto(mtmp);
    }
    return 0;
  default:
    {
      let where = (strat & STRAT_STRATMASK) >>> 0;
      let tx = $shr64((strat & 16711680) >>> 0, 16) << 24 >> 24;
      let ty = $shr64((strat & 65280) >>> 0, 8) << 24 >> 24;
      let targ = (strat & STRAT_GOAL) >>> 0 | 0;
      let otmp = null;
      if (!targ) {
        return 0;
      }
      if (G.u.ux === tx && G.u.uy === ty || where === STRAT_PLAYER) {
        await mnexto(mtmp);
        return 0;
      }
      if (where === STRAT_GROUND) {
        if (!!!G.level.monsters[tx][ty] || mtmp.mx === tx && mtmp.my === ty) {
          await rloc_to(mtmp, tx, ty);
          if (!!(otmp = on_ground(which_arti(targ)))) {
            if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
              await pline(S("%s picks up %s."), await Monnam(mtmp), dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 5 ? await doname(otmp) : await distant_name(otmp, doname));
            }
            await obj_extract_self(otmp);
            await mpickobj(mtmp, otmp);
            return 1;
          } else {
            return 0;
          }
        } else {
          if (!rn2(5)) {
            await mnexto(mtmp);
          }
          return 0;
        }
      } else {
        mx = mtmp.mx, my = mtmp.my;
        if (!await mnearto(mtmp, tx, ty, FALSE)) {
          await rloc_to(mtmp, mx, my);
        }
        return 0;
      }
    }
  }
  return 0;
}

export async function has_aggravatables(mon: struct_monst | null): Promise<number> {
  let mtmp = null;
  let in_w_tower = await In_W_tower(mon.mx, mon.my, G.u.uz);
  if (in_w_tower !== await In_W_tower(G.u.ux, G.u.uy, G.u.uz)) {
    return FALSE;
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (in_w_tower !== await In_W_tower(mtmp.mx, mtmp.my, G.u.uz)) {
      continue;
    }
    if ((mtmp.mstrategy & STRAT_WAITFORU) >>> 0 !== 0 || mtmp.msleeping | 0 || !mtmp.mcanmove) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function aggravate(): Promise<void> {
  let mtmp = null;
  let in_w_tower = await In_W_tower(G.u.ux, G.u.uy, G.u.uz);
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (in_w_tower !== await In_W_tower(mtmp.mx, mtmp.my, G.u.uz)) {
      continue;
    }
    mtmp.mstrategy = (mtmp.mstrategy & ~((STRAT_WAITFORU | STRAT_APPEARMSG) >>> 0) >>> 0) >>> 0;
    mtmp.msleeping = 0;
    if (!mtmp.mcanmove && !rn2(5)) {
      mtmp.mfrozen = 0;
      mtmp.mcanmove = 1;
    }
  }
}

export async function clonewiz(): Promise<void> {
  let mtmp2 = null;
  if (!!(mtmp2 = await makemon($sat(G.mons, PM_WIZARD_OF_YENDOR), G.u.ux, G.u.uy, NO_MM_FLAGS))) {
    mtmp2.msleeping = ((mtmp2.mtame = (mtmp2.mpeaceful = 0) << 24 >> 24) >>> 0) & 1;
    if (!G.u.uhave.amulet && rn2(2)) {
      await add_to_minv(mtmp2, await mksobj(FAKE_AMULET_OF_YENDOR, TRUE, FALSE));
    }
    mtmp2.m_ap_type = M_AP_MONSTER;
    mtmp2.mappearance = wizapp[rn2(Math.trunc(48 / 4) | 0)];
    await newsym(mtmp2.mx, mtmp2.my);
  }
}

export function pick_nasty(): number {
  let res = nasties[rn2(Math.trunc(168 / 4) | 0)];
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) && !(65 <= G.mons[res].mlet && G.mons[res].mlet <= 90)) {
    res = nasties[rn2(Math.trunc(168 / 4) | 0)];
  }
  return res;
}

export async function nasty(summoner: struct_monst | null): Promise<number> {
  let mtmp = null;
  let i = 0;
  let j = 0;
  let castalign = summoner ? sgn(summoner.data.maligntyp) : 0;
  let bypos = new struct_nhcoord();
  let count = 0;
  let census = 0;
  let tmp = 0;
  let makeindex = 0;
  let s_cls = 0;
  let m_cls = 0;
  census = monster_census(FALSE);
  if (!rn2(10) && In_hell(G.u.uz)) {
    count = await msummon(null);
  } else {
    count = 0;
    s_cls = summoner ? summoner.data.mlet : 0;
    tmp = G.u.ulevel > 3 ? G.u.ulevel / 3 | 0 : 1;
    bypos.x = G.u.ux;
    bypos.y = G.u.uy;
    for (i = rnd(tmp); i > 0 && count < MAXNASTIES; --i) {
      for (j = 0; j < 20; ++j) {
        do {
          makeindex = pick_nasty();
          m_cls = G.mons[makeindex].mlet;
        } while (summoner && (attacktype($sat(G.mons, makeindex), AT_MAGC) && G.mons[makeindex].difficulty >= G.mons[summoner.mnum].difficulty || s_cls === S_DEMON && m_cls === S_ANGEL || s_cls === S_ANGEL && m_cls === S_DEMON));
        if (summoner && !await enexto(bypos, summoner.mux, summoner.muy, $sat(G.mons, makeindex))) {
          continue;
        }
        if (!!(mtmp = await makemon($sat(G.mons, makeindex), bypos.x, bypos.y, NO_MM_FLAGS))) {
          mtmp.msleeping = (mtmp.mpeaceful = ((mtmp.mtame = 0) >>> 0) & 1) & 1;
          set_malign(mtmp);
        } else {
          mtmp = await makemon(null, bypos.x, bypos.y, NO_MM_FLAGS);
        }
        if (mtmp) {
          mtmp.mspec_used = rnd(4);
          if (++count >= MAXNASTIES || mtmp.data.maligntyp === 0 || sgn(mtmp.data.maligntyp) === castalign) {
            break;
          }
        }
      }
    }
  }
  if (count) {
    count = monster_census(FALSE) - census;
  }
  return count;
}

export async function resurrect(): Promise<void> {
  let mtmp = null;
  let mmtmp = null;
  let elapsed = 0;
  let verb = null;
  if (!G.context.no_of_wizards) {
    verb = S("kill");
    mtmp = await makemon($sat(G.mons, PM_WIZARD_OF_YENDOR), G.u.ux, G.u.uy, MM_NOWAIT);
    if (mtmp) {
      mtmp.mrevived = 1;
    }
  } else {
    verb = S("elude");
    mmtmp = P(G, "migrating_mons");
    while (!!(mtmp = mmtmp.a[mmtmp.o])) {
      if (mtmp.iswiz | 0 && !mon_has_amulet(mtmp) && (elapsed = G.monstermoves - mtmp.mlstmv) > 0) {
        await mon_catchup_elapsed_time(mtmp, elapsed);
        if (elapsed >= LARGEST_INT) {
          elapsed = LARGEST_INT - 1;
        }
        elapsed = Math.trunc(elapsed / 50);
        if (mtmp.msleeping | 0 && rn2((elapsed | 0) + 1)) {
          mtmp.msleeping = 0;
        }
        if ((mtmp.mfrozen | 0) === 1) {
          mtmp.mfrozen = 0, mtmp.mcanmove = 1;
        }
        if (mtmp.mcanmove | 0 && !mtmp.msleeping) {
          mmtmp.a[mmtmp.o] = mtmp.nmon;
          await mon_arrive(mtmp, TRUE);
          break;
        }
      }
      mmtmp = P(mtmp, "nmon");
    }
  }
  if (mtmp) {
    mtmp.mtame = (mtmp.mpeaceful = 0) << 24 >> 24;
    set_malign(mtmp);
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("A voice booms out..."));
      await verbalize(S("So thou thought thou couldst %s me, fool."), verb);
    }
  }
}

export async function intervene(): Promise<void> {
  let which = (G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) ? rnd(4) : rn2(6);
  switch (which) {
  case 0:
  case 1:
    await You_feel(S("vaguely nervous."));
    break;
  case 2:
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await You(S("notice a %s glow surrounding you."), hcolor(G.c_color_names.c_black));
    }
    await rndcurse();
    break;
  case 3:
    await aggravate();
    break;
  case 4:
    await nasty(null);
    break;
  case 5:
    await resurrect();
    break;
  }
}

export function wizdead(): void {
  G.context.no_of_wizards = G.context.no_of_wizards - 1 >>> 0;
  if (!G.u.uevent.udemigod) {
    G.u.uevent.udemigod = (TRUE) & 1;
    G.u.udg_cnt = rn2(250) + 50 >>> 0;
  }
}

export async function cuss(mtmp: struct_monst | null): Promise<void> {
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    return;
  }
  if (mtmp.iswiz) {
    if (!rn2(5)) {
      await pline(S("%s laughs fiendishly."), await Monnam(mtmp));
    } else if (G.u.uhave.amulet | 0 && !rn2(Math.trunc(224 / 8) | 0)) {
      await verbalize(S("Relinquish the amulet, %s!"), G.random_insult[rn2(Math.trunc(224 / 8) | 0)]);
    } else if (G.u.uhp < 5 && !rn2(2)) {
      await verbalize(rn2(2) ? S("Even now thy life force ebbs, %s!") : S("Savor thy breath, %s, it be thy last!"), G.random_insult[rn2(Math.trunc(224 / 8) | 0)]);
    } else if (mtmp.mhp < 5 && !rn2(2)) {
      await verbalize(rn2(2) ? S("I shall return.") : S("I'll be back."));
    } else {
      await verbalize(S("%s %s!"), G.random_malediction[rn2(Math.trunc(88 / 8) | 0)], G.random_insult[rn2(Math.trunc(224 / 8) | 0)]);
    }
  } else if ((mtmp.data.mflags2 & 4096) >>> 0 !== 0 && mon_aligntyp(mtmp) === 1 && !(mtmp.isminion | 0 && mtmp.mextra.emin.renegade)) {
    await com_pager(rn2(QTN_ANGELIC - 1 + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? 1 : 0)) + QT_ANGELIC);
  } else {
    if (!rn2((mtmp.data.mflags2 & 4096) >>> 0 !== 0 ? 100 : 5)) {
      await pline(S("%s casts aspersions on your ancestry."), await Monnam(mtmp));
    } else {
      await com_pager(rn2(QTN_DEMONIC) + QT_DEMONIC);
    }
  }
}

export function $init(): void {
  nasties = $ta(Int32Array, 42, [PM_COCKATRICE, PM_ETTIN, PM_STALKER, PM_MINOTAUR, PM_OWLBEAR, PM_PURPLE_WORM, PM_XAN, PM_UMBER_HULK, PM_XORN, PM_ZRUTY, PM_LEOCROTTA, PM_BALUCHITHERIUM, PM_CARNIVOROUS_APE, PM_FIRE_ELEMENTAL, PM_JABBERWOCK, PM_IRON_GOLEM, PM_OCHRE_JELLY, PM_GREEN_SLIME, PM_BLACK_DRAGON, PM_RED_DRAGON, PM_ARCH_LICH, PM_VAMPIRE_LORD, PM_MASTER_MIND_FLAYER, PM_DISENCHANTER, PM_WINGED_GARGOYLE, PM_STORM_GIANT, PM_OLOG_HAI, PM_ELF_LORD, PM_ELVENKING, PM_OGRE_KING, PM_CAPTAIN, PM_GREMLIN, PM_SILVER_DRAGON, PM_ORANGE_DRAGON, PM_GREEN_DRAGON, PM_YELLOW_DRAGON, PM_GUARDIAN_NAGA, PM_FIRE_GIANT, PM_ALEAX, PM_COUATL, PM_HORNED_DEVIL, PM_BARBED_DEVIL]);
  wizapp = $ta(Uint32Array, 12, [PM_HUMAN, PM_WATER_DEMON, PM_VAMPIRE, PM_RED_DRAGON, PM_TROLL, PM_UMBER_HULK, PM_XORN, PM_XAN, PM_COCKATRICE, PM_FLOATING_EYE, PM_GUARDIAN_NAGA, PM_TRAPPER]);
  G.random_insult = [S("antic"),
S("blackguard"),
S("caitiff"),
S("chucklehead"),
S("coistrel"),
S("craven"),
S("cretin"),
S("cur"),
S("dastard"),
S("demon fodder"),
S("dimwit"),
S("dolt"),
S("fool"),
S("footpad"),
S("imbecile"),
S("knave"),
S("maledict"),
S("miscreant"),
S("niddering"),
S("poltroon"),
S("rattlepate"),
S("reprobate"),
S("scapegrace"),
S("varlet"),
S("villein"),
S("wittol"),
S("worm"),
S("wretch")];
  G.random_malediction = [S("Hell shall soon claim thy remains,"),
S("I chortle at thee, thou pathetic"),
S("Prepare to die, thou"),
S("Resistance is useless,"),
S("Surrender or die, thou"),
S("There shall be no mercy, thou"),
S("Thou shalt repent of thy cunning,"),
S("Thou art as a flea to me,"),
S("Thou art doomed,"),
S("Thy fate is sealed,"),
S("Verily, thou shalt be one dead")];
}
