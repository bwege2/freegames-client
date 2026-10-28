// @ts-nocheck
// NetHack 3.6.7 were.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { paranoid_query } from './cmd.ts';
import { newsym } from './display.ts';
import { Monnam } from './do_name.ts';
import { tamedog } from './dog.ts';
import { is_fainted } from './eat.ts';
import { night } from './hacklib.ts';
import { makemon } from './makemon.ts';
import { monsndx, set_mon_data } from './mondata.ts';
import { an } from './objnam.ts';
import { You_feel, You_hear, impossible, pline } from './pline.ts';
import { polymon, rehumanize, set_uasmon } from './polyself.ts';
import { rn2, rnd } from './rnd.ts';
import { unconscious } from './trap.ts';
import { possibly_unwield } from './weapon.ts';
import { worm_known } from './worm.ts';
import { mon_break_armor } from './worn.ts';
import { struct_monst, struct_permonst } from './structs.ts';
import { $rd, $sat, $wr, G, P, S, sprintf, strcpy } from './rt/index.ts';
import { BLINDED, DEAF, FALSE, FULL_MOON, HALLUC, HALLUC_RES, INFRAVISION, LOW_PM, NON_PM, NO_MM_FLAGS, PM_COYOTE, PM_FOX, PM_GIANT_RAT, PM_HUMAN_WEREJACKAL, PM_HUMAN_WERERAT, PM_HUMAN_WEREWOLF, PM_JACKAL, PM_RABID_RAT, PM_SEWER_RAT, PM_WARG, PM_WEREJACKAL, PM_WERERAT, PM_WEREWOLF, PM_WINTER_WOLF, PM_WOLF, POLYMORPH_CONTROL, PROT_FROM_SHAPE_CHANGERS, SEE_INVIS, STUNNED, UNCHANGING } from './consts.ts';


export async function were_change(mon: struct_monst | null): Promise<void> {
  if (!((mon.data.mflags2 & 4) >>> 0 !== 0)) {
    return;
  }
  if ((mon.data.mflags2 & 8) >>> 0 !== 0) {
    if (!(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !rn2(night() ? G.flags.moonphase === FULL_MOON ? 3 : 30 : G.flags.moonphase === FULL_MOON ? 10 : 50)) {
      await new_were(mon);
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected))) {
        let howler = null;
        switch (await monsndx(mon.data)) {
        case 21:
          howler = S("wolf");
          break;
        case 15:
          howler = S("jackal");
          break;
        default:
          howler = null;
          break;
        }
        if (howler) {
          await You_hear(S("a %s howling at the moon."), howler);
        }
      }
    }
  } else if (!rn2(30) || (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
    await new_were(mon);
  }
  await set_uasmon();
}

export function counter_were(pm: number): number {
  switch (pm) {
  case 21:
    return PM_HUMAN_WEREWOLF;
  case 259:
    return PM_WEREWOLF;
  case 15:
    return PM_HUMAN_WEREJACKAL;
  case 258:
    return PM_WEREJACKAL;
  case 90:
    return PM_HUMAN_WERERAT;
  case 257:
    return PM_WERERAT;
  default:
    return NON_PM;
  }
}

export function were_beastie(pm: number): number {
  switch (pm) {
  case 90:
  case 87:
  case 88:
  case 89:
    return PM_WERERAT;
  case 15:
  case 12:
  case 13:
  case 14:
    return PM_WEREJACKAL;
  case 21:
  case 20:
  case 23:
  case 24:
    return PM_WEREWOLF;
  default:
    break;
  }
  return NON_PM;
}

export async function new_were(mon: struct_monst | null): Promise<void> {
  let pm = 0;
  pm = counter_were(await monsndx(mon.data));
  if (pm < LOW_PM) {
    await impossible(S("unknown lycanthrope %s."), mon.data.mname);
    return;
  }
  if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    await pline(S("%s changes into a %s."), await Monnam(mon), ($sat(G.mons, pm).mflags2 & 8) >>> 0 !== 0 ? S("human") : G.mons[pm].mname.add(4));
  }
  await set_mon_data(mon, $sat(G.mons, pm));
  if (mon.msleeping | 0 || !mon.mcanmove) {
    mon.msleeping = 0;
    mon.mfrozen = 0;
    mon.mcanmove = 1;
  }
  mon.mhp += (mon.mhpmax - mon.mhp) / 4 | 0;
  await newsym(mon.mx, mon.my);
  await mon_break_armor(mon, FALSE);
  await possibly_unwield(mon, FALSE);
}

export async function were_summon(ptr: struct_permonst | null, yours: number, visible: Ptr | null, genbuf: Ptr | null): Promise<number> {
  let i = 0;
  let typ = 0;
  let pm = await monsndx(ptr);
  let mtmp = null;
  let total = 0;
  visible.a[visible.o] = 0;
  if ((G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !yours) {
    return 0;
  }
  for (i = rnd(5); i > 0; --i) {
    switch (pm) {
    case 90:
    case 257:
      typ = rn2(3) ? PM_SEWER_RAT : rn2(3) ? PM_GIANT_RAT : PM_RABID_RAT;
      if (genbuf) {
        strcpy(genbuf, S("rat"));
      }
      break;
    case 15:
    case 258:
      typ = rn2(7) ? PM_JACKAL : rn2(3) ? PM_COYOTE : PM_FOX;
      if (genbuf) {
        strcpy(genbuf, S("jackal"));
      }
      break;
    case 21:
    case 259:
      typ = rn2(5) ? PM_WOLF : rn2(2) ? PM_WARG : PM_WINTER_WOLF;
      if (genbuf) {
        strcpy(genbuf, S("wolf"));
      }
      break;
    default:
      continue;
    }
    mtmp = await makemon($sat(G.mons, typ), G.u.ux, G.u.uy, NO_MM_FLAGS);
    if (mtmp) {
      ++total;
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        visible.a[visible.o] += 1;
      }
    }
    if (yours && mtmp) {
      await tamedog(mtmp, null);
    }
  }
  return total;
}

export async function you_were(): Promise<void> {
  let qbuf = new Int8Array(128);
  let controllable_poly = ((G.u.uprops[POLYMORPH_CONTROL].intrinsic || G.u.uprops[POLYMORPH_CONTROL].extrinsic) && !(G.u.uprops[STUNNED].intrinsic || G.multi < 0 && (unconscious() || is_fainted())) ? 1 : 0) << 24 >> 24;
  if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic || G.u.umonnum === G.u.ulycn) {
    return;
  }
  if (controllable_poly) {
    sprintf(P(qbuf), S("Do you want to change into %s?"), await an(G.mons[G.u.ulycn].mname.add(4)));
    if (!await paranoid_query((G.flags.paranoia_bits & 256) >>> 0 !== 0 ? 1 : 0, P(qbuf))) {
      return;
    }
  }
  await polymon(G.u.ulycn);
}

export async function you_unwere(purify: number): Promise<void> {
  let controllable_poly = ((G.u.uprops[POLYMORPH_CONTROL].intrinsic || G.u.uprops[POLYMORPH_CONTROL].extrinsic) && !(G.u.uprops[STUNNED].intrinsic || G.multi < 0 && (unconscious() || is_fainted())) ? 1 : 0) << 24 >> 24;
  if (purify) {
    await You_feel(S("purified."));
    await set_ulycn(NON_PM);
  }
  if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && (G.youmonst.data.mflags2 & 4) >>> 0 !== 0 && (!controllable_poly || !await paranoid_query((G.flags.paranoia_bits & 256) >>> 0 !== 0 ? 1 : 0, S("Remain in beast form?")))) {
    await rehumanize();
  } else if ((G.youmonst.data.mflags2 & 4) >>> 0 !== 0 && !G.u.mtimedone) {
    G.u.mtimedone = rn2(200) + 200;
  }
}

export async function set_ulycn(which: number): Promise<void> {
  G.u.ulycn = which;
  await set_uasmon();
}

export function $init(): void {
}
