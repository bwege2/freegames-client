// @ts-nocheck
// NetHack 3.6.7 worn.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { set_artifact_intrinsic } from './artifact.ts';
import { newsym } from './display.ts';
import { Monnam, hcolor, mon_nam } from './do_name.ts';
import { cancel_doff } from './do_wear.ts';
import { surface } from './engrave.ts';
import { s_suffix } from './hacklib.ts';
import { update_inventory } from './invent.ts';
import { curse, obj_extract_self, place_object } from './mkobj.ts';
import { breakarm, num_horns, pronoun_gender, raceptr, sliparm } from './mondata.ts';
import { m_useup } from './mthrowu.ts';
import { discover_object } from './o_init.ts';
import { an, cloak_simple_name, distant_name, doname, otense, simpleonames } from './objnam.ts';
import { You, You_hear, impossible, pline } from './pline.ts';
import { rnl } from './rnd.ts';
import { can_ride, can_saddle, dismount_steed } from './steed.ts';
import { instapetrify } from './trap.ts';
import { see_wsegs, worm_known } from './worm.ts';
import { learnwand } from './zap.ts';
import { struct_monst, struct_obj, struct_sortloot_item, struct_worn } from './structs.ts';
import { $rd, $sadd, $sarrOf, $sat, $wr, G, P, S, sprintf, strcpy } from './rt/index.ts';
import { ACID_RES, AMULET_CLASS, AMULET_OF_LIFE_SAVING, AMULET_OF_REFLECTION, ANTIMAGIC, ARMOR_CLASS, ARM_BOOTS, ARM_CLOAK, ARM_GLOVES, ARM_HELM, ARM_SHIELD, ARM_SHIRT, ARM_SUIT, BALL_CLASS, BLINDED, BLINDFOLD, CHAIN_CLASS, CLAIRVOYANT, COLD_RES, DISINT_RES, DISMOUNT_FELL, DISPLACED, DUNCE_CAP, FALSE, FAST, FIRE_RES, FOOD_CLASS, FUMBLING, GEM_CLASS, HELM_OF_OPPOSITE_ALIGNMENT, INFRAVISION, INVIS, I_SPECIAL, JUMPING, LEATHER, LENSES, LEVITATION, MEAT_RING, MFAST, MSLOW, MZ_SMALL, NON_PM, PM_HOBBIT, PM_LONG_WORM, PM_SKELETON, POISON_RES, PROTECTION, P_NONE, RACE_EXCEPTION, REFLECTING, RING_CLASS, SADDLE, SEE_INVIS, SHOCK_RES, SLEEP_RES, SPEED_BOOTS, STEALTH, STONE_RES, S_CENTAUR, S_MUMMY, S_VORTEX, TELEPAT, TIN_OPENER, TOOL_CLASS, TOWEL, TRUE, WEAPON_CLASS, WWALKING, W_AMUL, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMOR, W_ARMS, W_ARMU, W_BALL, W_CHAIN, W_QUIVER, W_RINGL, W_RINGR, W_SADDLE, W_SWAPWEP, W_TOOL, W_WEP } from './consts.ts';


export async function setworn(obj: struct_obj | null, mask: number): Promise<void> {
  let $t1: any, $t2: any;
  let wp = null;
  let oobj = null;
  let p = 0;
  if ((mask & (W_ARM | I_SPECIAL)) === (W_ARM | I_SPECIAL)) {
    G.uskin = obj;
  } else {
    if (mask & W_ARMOR) {
      G.u.uroleplay.nudist = FALSE;
    }
    for (wp = G.worn[0]; wp.w_mask; wp = $sadd(wp, 1)) {
      if (wp.w_mask & mask) {
        oobj = wp.w_obj.a[wp.w_obj.o];
        if (oobj && !(oobj.owornmask & wp.w_mask)) {
          await impossible(S("Setworn: mask = %ld."), wp.w_mask);
        }
        if (oobj) {
          if (G.u.twoweap && oobj.owornmask & (W_WEP | W_SWAPWEP)) {
            G.u.twoweap = 0;
          }
          oobj.owornmask = oobj.owornmask & ~wp.w_mask;
          if (wp.w_mask & ~(W_SWAPWEP | W_QUIVER)) {
            p = G.objects[oobj.otyp].oc_oprop;
            G.u.uprops[p].extrinsic = G.u.uprops[p].extrinsic & ~wp.w_mask;
            if ((p = oobj.otyp === 117 && mask & 2 ? INVIS : oobj.otyp === 75 && mask & 4 && !(G.urole.malenum === 342) ? CLAIRVOYANT : 0) !== 0) {
              ($t1 = G.u.uprops[p], $t1.blocked = $t1.blocked & ~wp.w_mask);
            }
            if (oobj.oartifact) {
              await set_artifact_intrinsic(oobj, 0, mask);
            }
          }
          cancel_doff(oobj, wp.w_mask);
        }
        wp.w_obj.a[wp.w_obj.o] = obj;
        if (obj) {
          obj.owornmask = obj.owornmask | wp.w_mask;
          if (wp.w_mask & ~(W_SWAPWEP | W_QUIVER)) {
            if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || mask !== W_WEP) {
              p = G.objects[obj.otyp].oc_oprop;
              G.u.uprops[p].extrinsic = G.u.uprops[p].extrinsic | wp.w_mask;
              if ((p = obj.otyp === 117 && mask & 2 ? INVIS : obj.otyp === 75 && mask & 4 && !(G.urole.malenum === 342) ? CLAIRVOYANT : 0) !== 0) {
                ($t2 = G.u.uprops[p], $t2.blocked = $t2.blocked | wp.w_mask);
              }
            }
            if (obj.oartifact) {
              await set_artifact_intrinsic(obj, 1, mask);
            }
          }
        }
      }
    }
  }
  update_inventory();
}

export async function setnotworn(obj: struct_obj | null): Promise<void> {
  let $t1: any;
  let wp = null;
  let p = 0;
  if (!obj) {
    return;
  }
  if (obj === G.uwep || obj === G.uswapwep) {
    G.u.twoweap = 0;
  }
  for (wp = G.worn[0]; wp.w_mask; wp = $sadd(wp, 1)) {
    if (obj === wp.w_obj.a[wp.w_obj.o]) {
      cancel_doff(obj, wp.w_mask);
      wp.w_obj.a[wp.w_obj.o] = null;
      p = G.objects[obj.otyp].oc_oprop;
      G.u.uprops[p].extrinsic = G.u.uprops[p].extrinsic & ~wp.w_mask;
      obj.owornmask = obj.owornmask & ~wp.w_mask;
      if (obj.oartifact) {
        await set_artifact_intrinsic(obj, 0, wp.w_mask);
      }
      if ((p = obj.otyp === 117 && wp.w_mask & 2 ? INVIS : obj.otyp === 75 && wp.w_mask & 4 && !(G.urole.malenum === 342) ? CLAIRVOYANT : 0) !== 0) {
        ($t1 = G.u.uprops[p], $t1.blocked = $t1.blocked & ~wp.w_mask);
      }
    }
  }
  update_inventory();
}

export function wearmask_to_obj(wornmask: number): struct_obj | null {
  let wp = null;
  for (wp = G.worn[0]; wp.w_mask; wp = $sadd(wp, 1)) {
    if (wp.w_mask & wornmask) {
      return wp.w_obj.a[wp.w_obj.o];
    }
  }
  return null;
}

export function wearslot(obj: struct_obj | null): number {
  let otyp = obj.otyp;
  let res = 0;
  switch (obj.oclass) {
  case AMULET_CLASS:
    res = W_AMUL;
    break;
  case RING_CLASS:
    res = W_RINGL | W_RINGR;
    break;
  case ARMOR_CLASS:
    switch (G.objects[otyp].oc_subtyp) {
    case ARM_SUIT:
      res = W_ARM;
      break;
    case ARM_SHIELD:
      res = W_ARMS;
      break;
    case ARM_HELM:
      res = W_ARMH;
      break;
    case ARM_GLOVES:
      res = W_ARMG;
      break;
    case ARM_BOOTS:
      res = W_ARMF;
      break;
    case ARM_CLOAK:
      res = W_ARMC;
      break;
    case ARM_SHIRT:
      res = W_ARMU;
      break;
    }
    break;
  case WEAPON_CLASS:
    res = W_WEP | W_SWAPWEP;
    if (G.objects[otyp].oc_merge) {
      res = res | W_QUIVER;
    }
    break;
  case TOOL_CLASS:
    if (otyp === BLINDFOLD || otyp === TOWEL || otyp === LENSES) {
      res = W_TOOL;
    } else if (obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || otyp === TIN_OPENER) {
      res = W_WEP | W_SWAPWEP;
    } else if (otyp === SADDLE) {
      res = W_SADDLE;
    }
    break;
  case FOOD_CLASS:
    if (obj.otyp === MEAT_RING) {
      res = W_RINGL | W_RINGR;
    }
    break;
  case GEM_CLASS:
    res = W_QUIVER;
    break;
  case BALL_CLASS:
    res = W_BALL;
    break;
  case CHAIN_CLASS:
    res = W_CHAIN;
    break;
  default:
    break;
  }
  return res;
}

export async function mon_set_minvis(mon: struct_monst | null): Promise<void> {
  mon.perminvis = 1;
  if (!mon.invis_blkd) {
    mon.minvis = 1;
    await newsym(mon.mx, mon.my);
    if (mon.wormno) {
      await see_wsegs(mon);
    }
  }
}

export async function mon_adjust_speed(mon: struct_monst | null, adjust: number, obj: struct_obj | null): Promise<void> {
  let otmp = null;
  let give_msg = (!G.in_mklev ? 1 : 0) << 24 >> 24;
  let petrify = FALSE;
  let oldspeed = mon.mspeed;
  switch (adjust) {
  case 2:
    mon.permspeed = (MFAST) & 3;
    give_msg = FALSE;
    break;
  case 1:
    if ((mon.permspeed | 0) === MSLOW) {
      mon.permspeed = 0;
    } else {
      mon.permspeed = (MFAST) & 3;
    }
    break;
  case 0:
    break;
  case -1:
    if ((mon.permspeed | 0) === MFAST) {
      mon.permspeed = 0;
    } else {
      mon.permspeed = (MSLOW) & 3;
    }
    break;
  case -2:
    mon.permspeed = (MSLOW) & 3;
    give_msg = FALSE;
    break;
  case -3:
    if ((mon.permspeed | 0) === MFAST) {
      mon.permspeed = 0;
    }
    petrify = TRUE;
    break;
  case -4:
    if ((mon.permspeed | 0) === MFAST) {
      mon.permspeed = 0;
    }
    give_msg = FALSE;
    break;
  }
  for (otmp = mon.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.owornmask && G.objects[otmp.otyp].oc_oprop === FAST) {
      break;
    }
  }
  if (otmp) {
    mon.mspeed = (MFAST) & 3;
  } else {
    mon.mspeed = (mon.permspeed) & 3;
  }
  if (give_msg && (mon.mspeed !== oldspeed || petrify) && mon.data.mmove && !(mon.mfrozen | 0 || mon.msleeping | 0) && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected))) {
    let howmuch = mon.mspeed + oldspeed >>> 0 === MFAST + MSLOW ? S("much ") : S("");
    if (petrify) {
      if (G.flags.verbose) {
        await pline(S("%s is slowing down."), await Monnam(mon));
      }
    } else if (adjust > 0 || (mon.mspeed | 0) === MFAST) {
      await pline(S("%s is suddenly moving %sfaster."), await Monnam(mon), howmuch);
    } else {
      await pline(S("%s seems to be moving %sslower."), await Monnam(mon), howmuch);
    }
    if (!!obj) {
      await learnwand(obj);
    }
  }
}

export async function update_mon_intrinsics(mon: struct_monst | null, obj: struct_obj | null, on: number, silently: number): Promise<void> {
  let $g = 0;
  let unseen = 0;
  let mask = 0;
  let otmp = null;
  let which = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      which = G.objects[obj.otyp].oc_oprop;
      unseen = !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) ? 1 : 0;
      if (!which) {
        { $g = 1; continue $L; }
      }
      if (on) {
        switch (which) {
        case INVIS:
          mon.minvis = ((!mon.invis_blkd ? 1 : 0) >>> 0) & 1;
          break;
        case FAST:
          {
            let save_in_mklev = G.in_mklev;
            if (silently) {
              G.in_mklev = TRUE;
            }
            await mon_adjust_speed(mon, 0, obj);
            G.in_mklev = save_in_mklev;
            break;
          }
        case ANTIMAGIC:
        case REFLECTING:
          break;
        case CLAIRVOYANT:
        case STEALTH:
        case TELEPAT:
          break;
        case LEVITATION:
        case WWALKING:
          break;
        case DISPLACED:
        case FUMBLING:
        case JUMPING:
        case PROTECTION:
          break;
        default:
          if (which <= 8) {
            mask = 1 << which - 1 & 0xff;
            mon.mextrinsics = (mon.mextrinsics | mask) & 0xffff;
          }
          break;
        }
      } else {
        switch (which) {
        case INVIS:
          mon.minvis = (mon.perminvis) & 1;
          break;
        case FAST:
          {
            let save_in_mklev = G.in_mklev;
            if (silently) {
              G.in_mklev = TRUE;
            }
            await mon_adjust_speed(mon, 0, obj);
            G.in_mklev = save_in_mklev;
            break;
          }
        case FIRE_RES:
        case COLD_RES:
        case SLEEP_RES:
        case DISINT_RES:
        case SHOCK_RES:
        case POISON_RES:
        case ACID_RES:
        case STONE_RES:
          mask = 1 << which - 1 & 0xff;
          for (otmp = mon.minvent; otmp; otmp = otmp.nobj) {
            if (otmp !== obj && otmp.owornmask && G.objects[otmp.otyp].oc_oprop === which) {
              break;
            }
          }
          if (!otmp) {
            mon.mextrinsics = (mon.mextrinsics & ~mask) & 0xffff;
          }
          break;
        default:
          break;
        }
      }
    case 1: // maybe_blocks
      switch (obj.otyp === 117 && ~0 & 2 ? INVIS : obj.otyp === 75 && ~0 & 4 && !(G.urole.malenum === 342) ? CLAIRVOYANT : 0) {
      case INVIS:
        mon.invis_blkd = ((on ? 1 : 0) >>> 0) & 1;
        mon.minvis = ((on ? 0 : mon.perminvis | 0) >>> 0) & 1;
        break;
      default:
        break;
      }
      if (!on && mon === G.u.usteed && obj.otyp === SADDLE) {
        await dismount_steed(DISMOUNT_FELL);
      }
      if (!silently && unseen ^ (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) ? 1 : 0)) {
        await newsym(mon.mx, mon.my);
      }
    }
    break;
  }
}

export function find_mac(mon: struct_monst | null): number {
  let obj = null;
  let base = mon.data.ac;
  let mwflags = mon.misc_worn_check;
  for (obj = mon.minvent; obj; obj = obj.nobj) {
    if (obj.owornmask & mwflags) {
      base -= G.objects[obj.otyp].oc_oc1 + obj.spe - (((obj.oeroded | 0) > (obj.oeroded2 | 0) ? obj.oeroded | 0 : obj.oeroded2 | 0) < G.objects[obj.otyp].oc_oc1 ? (obj.oeroded | 0) > (obj.oeroded2 | 0) ? obj.oeroded | 0 : obj.oeroded2 | 0 : G.objects[obj.otyp].oc_oc1);
    }
  }
  return base;
}

export async function m_dowear(mon: struct_monst | null, creation: number): Promise<void> {
  if (mon.data.msize < 1 || (mon.data.mflags1 & 8192) >>> 0 !== 0 || (mon.data.mflags1 & 262144) >>> 0 !== 0) {
    return;
  }
  if ((mon.data.mflags1 & 65536) >>> 0 !== 0 && (!creation || mon.data.mlet !== S_MUMMY && mon.data !== $sat(G.mons, PM_SKELETON))) {
    return;
  }
  await m_dowear_type(mon, W_AMUL, creation, FALSE);
  if (!(breakarm(mon.data) || sliparm(mon.data)) && !(mon.misc_worn_check & W_ARM)) {
    await m_dowear_type(mon, W_ARMU, creation, FALSE);
  }
  if (!(breakarm(mon.data) || sliparm(mon.data)) || mon.data.msize === MZ_SMALL) {
    await m_dowear_type(mon, W_ARMC, creation, FALSE);
  }
  await m_dowear_type(mon, W_ARMH, creation, FALSE);
  if (!mon.mw || !((mon.mw.oclass === WEAPON_CLASS || mon.mw.oclass === TOOL_CLASS) && G.objects[mon.mw.otyp].oc_big | 0)) {
    await m_dowear_type(mon, W_ARMS, creation, FALSE);
  }
  await m_dowear_type(mon, W_ARMG, creation, FALSE);
  if (!((mon.data.mflags1 & 524288) >>> 0 !== 0) && mon.data.mlet !== S_CENTAUR) {
    await m_dowear_type(mon, W_ARMF, creation, FALSE);
  }
  if (!(breakarm(mon.data) || sliparm(mon.data))) {
    await m_dowear_type(mon, W_ARM, creation, FALSE);
  } else {
    await m_dowear_type(mon, W_ARM, creation, RACE_EXCEPTION);
  }
}

async function m_dowear_type(mon: struct_monst | null, flag: number, creation: number, racialexception: number): Promise<void> {
  let $g = 0;
  let old = null;
  let best = null;
  let obj = null;
  let m_delay = 0;
  let unseen = 0;
  let autocurse = 0;
  let nambuf = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      m_delay = 0;
      unseen = !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) ? 1 : 0;
      nambuf = new Int8Array(256);
      if (mon.mfrozen) {
        return;
      }
      strcpy(P(nambuf), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? await Monnam(mon) : await mon_nam(mon));
      old = await which_armor(mon, flag);
      if (old && old.cursed | 0) {
        return;
      }
      if (old && flag === W_AMUL) {
        return;
      }
      best = old;
      for (obj = mon.minvent; obj; obj = obj.nobj) {
        switch (flag) {
        case 65536:
          if (obj.oclass !== AMULET_CLASS || obj.otyp !== AMULET_OF_LIFE_SAVING && obj.otyp !== AMULET_OF_REFLECTION) {
            continue;
          }
          best = obj;
          { $g = 1; continue $L; }
        case 64:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIRT)) {
            continue;
          }
          break;
        case 2:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_CLOAK)) {
            continue;
          }
          break;
        case 4:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_HELM)) {
            continue;
          }
          if (obj.otyp === HELM_OF_OPPOSITE_ALIGNMENT && (mon.ispriest | 0 || mon.isminion | 0)) {
            continue;
          }
          if (await num_horns(mon.data) > 0 && !((G.objects[obj.otyp].oc_material | 0) <= LEATHER || obj.otyp === 60)) {
            continue;
          }
          break;
        case 8:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIELD)) {
            continue;
          }
          break;
        case 16:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_GLOVES)) {
            continue;
          }
          break;
        case 32:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_BOOTS)) {
            continue;
          }
          break;
        case 1:
          if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SUIT)) {
            continue;
          }
          if (racialexception && racial_exception(mon, obj) < 1) {
            continue;
          }
          break;
        }
        if (obj.owornmask) {
          continue;
        }
        if (best && G.objects[best.otyp].oc_oc1 + best.spe - (((best.oeroded | 0) > (best.oeroded2 | 0) ? best.oeroded | 0 : best.oeroded2 | 0) < G.objects[best.otyp].oc_oc1 ? (best.oeroded | 0) > (best.oeroded2 | 0) ? best.oeroded | 0 : best.oeroded2 | 0 : G.objects[best.otyp].oc_oc1) + extra_pref(mon, best) >= G.objects[obj.otyp].oc_oc1 + obj.spe - (((obj.oeroded | 0) > (obj.oeroded2 | 0) ? obj.oeroded | 0 : obj.oeroded2 | 0) < G.objects[obj.otyp].oc_oc1 ? (obj.oeroded | 0) > (obj.oeroded2 | 0) ? obj.oeroded | 0 : obj.oeroded2 | 0 : G.objects[obj.otyp].oc_oc1) + extra_pref(mon, obj)) {
          continue;
        }
        best = obj;
      }
    case 1: // outer_break
      if (!best || best === old) {
        return;
      }
      autocurse = ((best.otyp === HELM_OF_OPPOSITE_ALIGNMENT || best.otyp === DUNCE_CAP) && !best.cursed ? 1 : 0) << 24 >> 24;
      if ((flag === W_ARM || flag === W_ARMU) && mon.misc_worn_check & W_ARMC) {
        m_delay += 2;
      }
      if (old) {
        m_delay += G.objects[old.otyp].oc_delay;
      }
      if (old) {
        old.owornmask = 0;
      }
      if (!creation) {
        if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
          let buf = new Int8Array(256);
          if (old) {
            sprintf(P(buf), S(" removes %s and"), await distant_name(old, doname));
          } else {
            buf[0] = 0;
          }
          await pline(S("%s%s puts on %s."), await Monnam(mon), P(buf), await distant_name(best, doname));
          if (autocurse) {
            await pline(S("%s %s %s %s for a moment."), s_suffix(await Monnam(mon)), await simpleonames(best), otense(best, S("glow")), hcolor(G.c_color_names.c_black));
          }
        }
        m_delay += G.objects[best.otyp].oc_delay;
        mon.mfrozen = (m_delay >>> 0) & 127;
        if (mon.mfrozen) {
          mon.mcanmove = 0;
        }
      }
      if (old) {
        await update_mon_intrinsics(mon, old, FALSE, creation);
      }
      mon.misc_worn_check = mon.misc_worn_check | flag;
      best.owornmask = best.owornmask | flag;
      if (autocurse) {
        await curse(best);
      }
      await update_mon_intrinsics(mon, best, TRUE, creation);
      if (!creation && unseen ^ (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) ? 1 : 0)) {
        if (mon.minvis | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
          await pline(S("Suddenly you cannot see %s."), P(nambuf));
          await discover_object(best.otyp, 1, 1);
        }
      }
    }
    break;
  }
}

export async function which_armor(mon: struct_monst | null, flag: number): Promise<struct_obj | null> {
  if (mon === G.youmonst) {
    switch (flag) {
    case 1:
      return G.uarm;
    case 2:
      return G.uarmc;
    case 4:
      return G.uarmh;
    case 8:
      return G.uarms;
    case 16:
      return G.uarmg;
    case 32:
      return G.uarmf;
    case 64:
      return G.uarmu;
    default:
      await impossible(S("bad flag in which_armor"));
      return null;
    }
  } else {
    let obj = null;
    for (obj = mon.minvent; obj; obj = obj.nobj) {
      if (obj.owornmask & flag) {
        return obj;
      }
    }
    return null;
  }
}

async function m_lose_armor(mon: struct_monst | null, obj: struct_obj | null): Promise<void> {
  mon.misc_worn_check = mon.misc_worn_check & ~obj.owornmask;
  if (obj.owornmask) {
    await update_mon_intrinsics(mon, obj, FALSE, FALSE);
  }
  obj.owornmask = 0;
  await obj_extract_self(obj);
  await place_object(obj, mon.mx, mon.my);
  await newsym(mon.mx, mon.my);
}

export function clear_bypasses(): void {
  let otmp = null;
  let nobj = null;
  let mtmp = null;
  for (otmp = G.level.objlist; otmp; otmp = nobj) {
    nobj = otmp.nobj;
    if (otmp.bypass) {
      otmp.bypass = 0;
    }
  }
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    otmp.bypass = 0;
  }
  for (otmp = G.migrating_objs; otmp; otmp = otmp.nobj) {
    otmp.bypass = 0;
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
      otmp.bypass = 0;
    }
    if (mtmp.data === $sat(G.mons, PM_LONG_WORM) && (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1)) {
      mtmp.mextra.mcorpsenm = NON_PM;
    }
  }
  for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp.nmon) {
    for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
      otmp.bypass = 0;
    }
  }
  G.context.bypasses = FALSE;
}

export function bypass_obj(obj: struct_obj | null): void {
  obj.bypass = 1;
  G.context.bypasses = TRUE;
}

export function bypass_objlist(objchain: struct_obj | null, on: number): void {
  if (on && objchain) {
    G.context.bypasses = TRUE;
  }
  while (objchain) {
    objchain.bypass = ((on ? 1 : 0) >>> 0) & 1;
    objchain = objchain.nobj;
  }
}

export function nxt_unbypassed_obj(objchain: struct_obj | null): struct_obj | null {
  while (objchain) {
    if (!objchain.bypass) {
      bypass_obj(objchain);
      break;
    }
    objchain = objchain.nobj;
  }
  return objchain;
}

export function nxt_unbypassed_loot(lootarray: struct_sortloot_item | null, listhead: struct_obj | null): struct_obj | null {
  let o = null;
  let obj = null;
  while (!!(obj = lootarray.obj)) {
    for (o = listhead; o; o = o.nobj) {
      if (o === obj) {
        break;
      }
    }
    if (o && !obj.bypass) {
      bypass_obj(obj);
      break;
    }
    lootarray = $sadd(lootarray, 1);
  }
  return obj;
}

export async function mon_break_armor(mon: struct_monst | null, polyspot: number): Promise<void> {
  let $g = 0;
  let otmp = null;
  let mdat = null;
  let vis = 0;
  let handless_or_tiny = 0;
  let pronoun = null;
  let ppronoun = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mdat = mon.data;
      vis = ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) << 24 >> 24;
      handless_or_tiny = ((mdat.mflags1 & 8192) >>> 0 !== 0 || mdat.msize < 1 ? 1 : 0) << 24 >> 24;
      pronoun = G.genders[pronoun_gender(mon, 0)].him;
      ppronoun = G.genders[pronoun_gender(mon, 0)].his;
      if (breakarm(mdat)) {
        if (!!(otmp = await which_armor(mon, W_ARM))) {
          if (otmp.otyp >= 91 && otmp.otyp <= 99 && mdat === $sat(G.mons, 141 + otmp.otyp - 91) || otmp.otyp >= 82 && otmp.otyp <= 90 && mdat === $sat(G.mons, 141 + otmp.otyp - 82)) {
            ;
          } else if (vis) {
            await pline(S("%s breaks out of %s armor!"), await Monnam(mon), ppronoun);
          } else {
            await You_hear(S("a cracking sound."));
          }
          await m_useup(mon, otmp);
        }
        if (!!(otmp = await which_armor(mon, W_ARMC))) {
          if (otmp.oartifact) {
            if (vis) {
              await pline(S("%s %s falls off!"), s_suffix(await Monnam(mon)), cloak_simple_name(otmp));
            }
            if (polyspot) {
              bypass_obj(otmp);
            }
            await m_lose_armor(mon, otmp);
          } else {
            if (vis) {
              await pline(S("%s %s tears apart!"), s_suffix(await Monnam(mon)), cloak_simple_name(otmp));
            } else {
              await You_hear(S("a ripping sound."));
            }
            await m_useup(mon, otmp);
          }
        }
        if (!!(otmp = await which_armor(mon, W_ARMU))) {
          if (vis) {
            await pline(S("%s shirt rips to shreds!"), s_suffix(await Monnam(mon)));
          } else {
            await You_hear(S("a ripping sound."));
          }
          await m_useup(mon, otmp);
        }
      } else if (sliparm(mdat)) {
        if (!!(otmp = await which_armor(mon, W_ARM))) {
          if (vis) {
            await pline(S("%s armor falls around %s!"), s_suffix(await Monnam(mon)), pronoun);
          } else {
            await You_hear(S("a thud."));
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
        if (!!(otmp = await which_armor(mon, W_ARMC))) {
          if (vis) {
            if (mon.data.mlet === S_VORTEX || mon.data === $sat(G.mons, 151)) {
              await pline(S("%s %s falls, unsupported!"), s_suffix(await Monnam(mon)), cloak_simple_name(otmp));
            } else {
              await pline(S("%s shrinks out of %s %s!"), await Monnam(mon), ppronoun, cloak_simple_name(otmp));
            }
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
        if (!!(otmp = await which_armor(mon, W_ARMU))) {
          if (vis) {
            if (sliparm(mon.data)) {
              await pline(S("%s seeps right through %s shirt!"), await Monnam(mon), ppronoun);
            } else {
              await pline(S("%s becomes much too small for %s shirt!"), await Monnam(mon), ppronoun);
            }
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
      }
      if (handless_or_tiny) {
        if (!!(otmp = await which_armor(mon, W_ARMG))) {
          if (vis) {
            await pline(S("%s drops %s gloves%s!"), await Monnam(mon), ppronoun, mon.mw ? S(" and weapon") : S(""));
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
        if (!!(otmp = await which_armor(mon, W_ARMS))) {
          if (vis) {
            await pline(S("%s can no longer hold %s shield!"), await Monnam(mon), ppronoun);
          } else {
            await You_hear(S("a clank."));
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
      }
      if (handless_or_tiny || await num_horns(mdat) > 0) {
        if (!!(otmp = await which_armor(mon, W_ARMH)) && (handless_or_tiny || !((G.objects[otmp.otyp].oc_material | 0) <= LEATHER || otmp.otyp === 60))) {
          if (vis) {
            await pline(S("%s helmet falls to the %s!"), s_suffix(await Monnam(mon)), surface(mon.mx, mon.my));
          } else {
            await You_hear(S("a clank."));
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
      }
      if (handless_or_tiny || (mdat.mflags1 & 524288) >>> 0 !== 0 || mdat.mlet === S_CENTAUR) {
        if (!!(otmp = await which_armor(mon, W_ARMF))) {
          if (vis) {
            if (mon.data.mlet === S_VORTEX || mon.data === $sat(G.mons, 151)) {
              await pline(S("%s boots fall away!"), s_suffix(await Monnam(mon)));
            } else {
              await pline(S("%s boots %s off %s feet!"), s_suffix(await Monnam(mon)), mdat.msize < 1 ? S("slide") : S("are pushed"), ppronoun);
            }
          }
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
        }
      }
      if (!!can_saddle(mon)) { $g = 3; continue $L; }
      {
        if (!!(otmp = await which_armor(mon, W_SADDLE))) {
          if (polyspot) {
            bypass_obj(otmp);
          }
          await m_lose_armor(mon, otmp);
          if (vis) {
            await pline(S("%s saddle falls off."), s_suffix(await Monnam(mon)));
          }
        }
        if (mon === G.u.usteed) {
          { $g = 1; continue $L; }
        }
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(mon === G.u.usteed && !can_ride(mon))) { $g = 4; continue $L; }
    case 1: // noride
      await You(S("can no longer ride %s."), await mon_nam(mon));
      if ((G.u.usteed.data === $sat(G.mons, 10) || G.u.usteed.data === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && rnl(3)) {
        let buf = new Int8Array(256);
        await You(S("touch %s."), await mon_nam(G.u.usteed));
        sprintf(P(buf), S("falling off %s"), await an(G.u.usteed.data.mname));
        await instapetrify(P(buf));
      }
      await dismount_steed(DISMOUNT_FELL);
    case 4:
    case 2:
      return;
    }
    break;
  }
}

function extra_pref(mon: struct_monst | null, obj: struct_obj | null): number {
  if (obj) {
    if (obj.otyp === SPEED_BOOTS && (mon.permspeed | 0) !== MFAST) {
      return 20;
    }
  }
  return 0;
}

export function racial_exception(mon: struct_monst | null, obj: struct_obj | null): number {
  let ptr = raceptr(mon);
  if (ptr === $sat(G.mons, PM_HOBBIT) && (obj.otyp === 71 || obj.otyp === 106 || obj.otyp === 118 || obj.otyp === 130 || obj.otyp === 146)) {
    return 1;
  }
  return 0;
}

export function $init(): void {
  G.worn = $sarrOf([struct_worn.$of(W_ARM, P(G, "uarm")),
struct_worn.$of(W_ARMC, P(G, "uarmc")),
struct_worn.$of(W_ARMH, P(G, "uarmh")),
struct_worn.$of(W_ARMS, P(G, "uarms")),
struct_worn.$of(W_ARMG, P(G, "uarmg")),
struct_worn.$of(W_ARMF, P(G, "uarmf")),
struct_worn.$of(W_ARMU, P(G, "uarmu")),
struct_worn.$of(W_RINGL, P(G, "uleft")),
struct_worn.$of(W_RINGR, P(G, "uright")),
struct_worn.$of(W_WEP, P(G, "uwep")),
struct_worn.$of(W_SWAPWEP, P(G, "uswapwep")),
struct_worn.$of(W_QUIVER, P(G, "uquiver")),
struct_worn.$of(W_AMUL, P(G, "uamul")),
struct_worn.$of(W_TOOL, P(G, "ublindf")),
struct_worn.$of(W_BALL, P(G, "uball")),
struct_worn.$of(W_CHAIN, P(G, "uchain")),
struct_worn.$of()]);
}
