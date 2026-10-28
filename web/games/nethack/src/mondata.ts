// @ts-nocheck
// NetHack 3.6.7 mondata.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { fmt_ptr } from './alloc.ts';
import { defends, defends_when_carried } from './artifact.ts';
import { title_to_mon } from './botl.ts';
import { def_char_to_monclass } from './drawing.ts';
import { is_fainted } from './eat.ts';
import { panic } from './end.ts';
import { dist2, highc, strncmpi, strstri } from './hacklib.ts';
import { makesingular } from './objnam.ts';
import { is_fshk } from './shk.ts';
import { unconscious } from './trap.ts';
import { mon_has_amulet } from './wizard.ts';
import { worm_known } from './worm.ts';
import { which_armor } from './worn.ts';
import { struct_alt_spl, struct_attack, struct_monst, struct_obj, struct_permonst } from './structs.ts';
import { $peq, $rd, $rows, $sadd, $sarrOf, $sat, $sdiff, $shl64, $sidx, $ta, $wr, G, P, S, strcmp, strcpy, strlen, strncmp } from './rt/index.ts';
import { AD_ACID, AD_ANY, AD_BLND, AD_COLD, AD_CORR, AD_DRLI, AD_ELEC, AD_FIRE, AD_MAGM, AD_PHYS, AD_RBRE, AD_RUST, AD_STCK, AD_WRAP, AMULET_OF_MAGICAL_BREATHING, ANTIMAGIC, ART_EXCALIBUR, AT_ANY, AT_BOOM, AT_BREA, AT_EXPL, AT_GAZE, AT_HUGS, AT_NONE, AT_SPIT, AT_WEAP, BLINDED, BLINDING_VENOM, CREAM_PIE, DEF_INVISIBLE, DETECT_MONSTERS, FALSE, G_GENOD, G_UNIQ, INFRAVISION, LOW_PM, M2_STALK, MAGICAL_BREATHING, MAXMCLASSES, MS_BURBLE, MS_BUZZ, MZ_SMALL, NATTK, NON_PM, NUMMONS, PM_ACOLYTE, PM_ALIGNED_PRIEST, PM_APPRENTICE, PM_ARCHEOLOGIST, PM_ARCH_LICH, PM_ATTENDANT, PM_BABY_BLACK_DRAGON, PM_BABY_BLUE_DRAGON, PM_BABY_CROCODILE, PM_BABY_GRAY_DRAGON, PM_BABY_GREEN_DRAGON, PM_BABY_LONG_WORM, PM_BABY_ORANGE_DRAGON, PM_BABY_PURPLE_WORM, PM_BABY_RED_DRAGON, PM_BABY_SILVER_DRAGON, PM_BABY_WHITE_DRAGON, PM_BABY_YELLOW_DRAGON, PM_BALUCHITHERIUM, PM_BAT, PM_BLACK_DRAGON, PM_BLACK_NAGA, PM_BLACK_NAGA_HATCHLING, PM_BLUE_DRAGON, PM_CAPTAIN, PM_CAVEMAN, PM_CAVEWOMAN, PM_CAVE_SPIDER, PM_CHICKATRICE, PM_COCKATRICE, PM_CROCODILE, PM_DEATH, PM_DEMILICH, PM_DJINNI, PM_DOG, PM_DWARF, PM_DWARF_KING, PM_DWARF_LORD, PM_ELF, PM_ELF_LORD, PM_ELVENKING, PM_ERINYS, PM_GARGOYLE, PM_GIANT_BAT, PM_GIANT_MIMIC, PM_GIANT_RAT, PM_GIANT_SPIDER, PM_GNOME, PM_GNOME_KING, PM_GNOME_LORD, PM_GOLDEN_NAGA, PM_GOLDEN_NAGA_HATCHLING, PM_GRAY_DRAGON, PM_GRAY_OOZE, PM_GRAY_UNICORN, PM_GREEN_DRAGON, PM_GREEN_ELF, PM_GREY_ELF, PM_GUARDIAN_NAGA, PM_GUARDIAN_NAGA_HATCHLING, PM_HEALER, PM_HELL_HOUND, PM_HELL_HOUND_PUP, PM_HIGH_PRIEST, PM_HILL_ORC, PM_HOBBIT, PM_HOMUNCULUS, PM_HORSE, PM_HOUSECAT, PM_INCUBUS, PM_KEYSTONE_KOP, PM_KILLER_BEE, PM_KITTEN, PM_KI_RIN, PM_KNIGHT, PM_KOBOLD, PM_KOBOLD_LORD, PM_KOBOLD_MUMMY, PM_KOBOLD_ZOMBIE, PM_KOP_KAPTAIN, PM_KOP_LIEUTENANT, PM_KOP_SERGEANT, PM_LARGE_CAT, PM_LARGE_DOG, PM_LARGE_KOBOLD, PM_LARGE_MIMIC, PM_LEMURE, PM_LICH, PM_LIEUTENANT, PM_LITTLE_DOG, PM_LONG_WORM, PM_LURKER_ABOVE, PM_MANES, PM_MARILITH, PM_MASTER_ASSASSIN, PM_MASTER_LICH, PM_MASTER_MIND_FLAYER, PM_MASTER_OF_THIEVES, PM_MIND_FLAYER, PM_MORDOR_ORC, PM_MUMAK, PM_OGRE, PM_OGRE_KING, PM_OGRE_LORD, PM_OLOG_HAI, PM_ORANGE_DRAGON, PM_ORC, PM_ORC_CAPTAIN, PM_PAGE, PM_PONY, PM_PRIEST, PM_PURPLE_WORM, PM_QUEEN_BEE, PM_RED_DRAGON, PM_RED_NAGA, PM_RED_NAGA_HATCHLING, PM_ROCK_MOLE, PM_SERGEANT, PM_SEWER_RAT, PM_SHADE, PM_SILVER_DRAGON, PM_SMALL_MIMIC, PM_SOLDIER, PM_STALKER, PM_STONE_GOLEM, PM_STUDENT, PM_SUCCUBUS, PM_TENGU, PM_URUK_HAI, PM_VAMPIRE, PM_VAMPIRE_LORD, PM_VIOLET_FUNGUS, PM_WARHORSE, PM_WATCHMAN, PM_WATCH_CAPTAIN, PM_WHITE_DRAGON, PM_WINGED_GARGOYLE, PM_WINTER_WOLF, PM_WINTER_WOLF_CUB, PM_WIZARD, PM_WOODCHUCK, PM_WOODLAND_ELF, PM_WOOD_NYMPH, PM_YELLOW_DRAGON, POT_BLINDNESS, P_NONE, SEE_INVIS, STRANGLED, S_BLOB, S_CENTAUR, S_DEMON, S_DRAGON, S_EEL, S_ELEMENTAL, S_EYE, S_FUNGUS, S_GHOST, S_GOLEM, S_IMP, S_JELLY, S_KOBOLD, S_LICH, S_LIGHT, S_MIMIC, S_MIMIC_DEF, S_MUMMY, S_NAGA, S_NYMPH, S_OGRE, S_PUDDING, S_RODENT, S_UNICORN, S_VAMPIRE, S_VORTEX, S_WORM, S_WORM_TAIL, S_WRAITH, S_XAN, S_ZOMBIE, S_invisible, TELEPAT, TOOL_CLASS, TRUE, WARN_OF_MON, WEAPON_CLASS, W_ACCESSORY, W_AMUL, W_ARMH, W_ARMOR, W_SWAPWEP, W_WEP } from './consts.ts';

let grownups: any;
let levitate: any;
let flys: any;
let flyl: any;
let slither: any;
let ooze: any;
let immobile: any;
let crawl: any;
let name_to_mon$names: any;
let name_to_monclass$falsematch: any;
let name_to_monclass$truematch: any;

export async function set_mon_data(mon: struct_monst | null, ptr: struct_permonst | null): Promise<void> {
  let new_speed = 0;
  let old_speed = mon.data ? mon.data.mmove : 0;
  mon.data = ptr;
  mon.mnum = await monsndx(ptr) << 16 >> 16;
  if (mon.movement) {
    new_speed = ptr.mmove;
    if (new_speed < old_speed) {
      mon.movement = Math.imul(mon.movement, new_speed) << 16 >> 16;
      if (old_speed > 0) {
        mon.movement = (mon.movement / old_speed | 0) << 16 >> 16;
      }
    }
  }
  return;
}

export function attacktype_fordmg(ptr: struct_permonst | null, atyp: number, dtyp: number): struct_attack | null {
  let a = null;
  for (a = ptr.mattk[0]; $sidx(a) < $sidx($sat(ptr.mattk, NATTK)); a = $sadd(a, 1)) {
    if (a.aatyp === atyp && (dtyp === AD_ANY || a.adtyp === dtyp)) {
      return a;
    }
  }
  return null;
}

export function attacktype(ptr: struct_permonst | null, atyp: number): number {
  return (attacktype_fordmg(ptr, atyp, AD_ANY) ? TRUE : FALSE) << 24 >> 24;
}

export function noattacks(ptr: struct_permonst | null): number {
  let i = 0;
  let mattk = ptr.mattk[0];
  for (i = 0; i < NATTK; ++i) {
    if ($sadd(mattk, i).aatyp === AT_BOOM) {
      continue;
    }
    if ($sadd(mattk, i).aatyp) {
      return FALSE;
    }
  }
  return TRUE;
}

export function poly_when_stoned(ptr: struct_permonst | null): number {
  return (ptr.mlet === S_GOLEM && ptr !== $sat(G.mons, PM_STONE_GOLEM) && !(G.mvitals[PM_STONE_GOLEM].mvflags & G_GENOD) ? 1 : 0) << 24 >> 24;
}

export function resists_drli(mon: struct_monst | null): number {
  let ptr = mon.data;
  let wep = null;
  if ((ptr.mflags2 & 2) >>> 0 !== 0 || (ptr.mflags2 & 256) >>> 0 !== 0 || (ptr.mflags2 & 4) >>> 0 !== 0 || mon === G.youmonst && G.u.ulycn >= LOW_PM || ptr === $sat(G.mons, PM_DEATH) || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
    return TRUE;
  }
  wep = mon === G.youmonst ? G.uwep : mon.mw;
  return (wep && wep.oartifact && defends(AD_DRLI, wep) ? 1 : 0) << 24 >> 24;
}

export function resists_magm(mon: struct_monst | null): number {
  let ptr = mon.data;
  let is_you = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  let slotmask = 0;
  let o = null;
  if (dmgtype(ptr, AD_MAGM) || ptr === $sat(G.mons, PM_BABY_GRAY_DRAGON) || dmgtype(ptr, AD_RBRE)) {
    return TRUE;
  }
  o = is_you ? G.uwep : mon.mw;
  if (o && o.oartifact && defends(AD_MAGM, o)) {
    return TRUE;
  }
  o = is_you ? G.invent : mon.minvent;
  slotmask = W_ARMOR | W_ACCESSORY;
  if (!is_you || G.uwep && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE)) {
    slotmask = slotmask | W_WEP;
  }
  if (is_you && G.u.twoweap) {
    slotmask = slotmask | W_SWAPWEP;
  }
  for (; o; o = o.nobj) {
    if ((o.owornmask & slotmask) !== 0 && G.objects[o.otyp].oc_oprop === ANTIMAGIC || o.oartifact && defends_when_carried(AD_MAGM, o)) {
      return TRUE;
    }
  }
  return FALSE;
}

export function resists_blnd(mon: struct_monst | null): number {
  let ptr = mon.data;
  let is_you = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  let slotmask = 0;
  let o = null;
  if (is_you ? (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.multi < 0 && (unconscious() || is_fainted()) ? 1 : 0 : mon.mblinded | 0 || !mon.mcansee || !((ptr.mflags1 & 4096) >>> 0 === 0) || mon.msleeping | 0 ? 1 : 0) {
    return TRUE;
  }
  if (dmgtype_fromattack(ptr, AD_BLND, AT_EXPL) || dmgtype_fromattack(ptr, AD_BLND, AT_GAZE)) {
    return TRUE;
  }
  o = is_you ? G.uwep : mon.mw;
  if (o && o.oartifact && defends(AD_BLND, o)) {
    return TRUE;
  }
  o = is_you ? G.invent : mon.minvent;
  slotmask = W_ARMOR | W_ACCESSORY;
  if (!is_you || G.uwep && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE)) {
    slotmask = slotmask | W_WEP;
  }
  if (is_you && G.u.twoweap) {
    slotmask = slotmask | W_SWAPWEP;
  }
  for (; o; o = o.nobj) {
    if ((o.owornmask & slotmask) !== 0 && G.objects[o.otyp].oc_oprop === BLINDED || o.oartifact && defends_when_carried(AD_BLND, o)) {
      return TRUE;
    }
  }
  return FALSE;
}

export function can_blnd(magr: struct_monst | null, mdef: struct_monst | null, aatyp: number, obj: struct_obj | null): number {
  let is_you = (mdef === G.youmonst ? 1 : 0) << 24 >> 24;
  let check_visor = FALSE;
  let o = null;
  let s = null;
  if (!((mdef.data.mflags1 & 4096) >>> 0 === 0)) {
    return FALSE;
  }
  switch (aatyp) {
  case 13:
  case 14:
  case 15:
  case 255:
  case 12:
    if (magr && magr.mcan | 0) {
      return FALSE;
    }
    return (!resists_blnd(mdef) ? 1 : 0) << 24 >> 24;
  case 254:
  case 10:
  case 0:
    if (obj && obj.otyp === CREAM_PIE) {
      if (is_you && (G.ublindf && G.ublindf.otyp !== 207)) {
        return FALSE;
      }
    } else if (obj && obj.otyp === BLINDING_VENOM) {
      if (is_you && (G.ublindf || G.u.ucreamed)) {
        return FALSE;
      }
      check_visor = TRUE;
    } else if (obj && obj.otyp === POT_BLINDNESS) {
      return TRUE;
    } else {
      return FALSE;
    }
    if (magr === G.youmonst && G.u.uswallow | 0) {
      return FALSE;
    }
    break;
  case 11:
    if (is_you && (G.ublindf && G.ublindf.otyp !== 207 || G.multi < 0 && (unconscious() || is_fainted()) || G.u.ucreamed)) {
      return FALSE;
    }
    if (!is_you && mdef.msleeping | 0) {
      return FALSE;
    }
    break;
  case 1:
    if (is_you && G.ublindf) {
      return FALSE;
    }
    if (magr === G.youmonst && G.u.uswallow | 0) {
      return FALSE;
    }
    check_visor = TRUE;
    break;
  case 5:
  case 6:
    if (magr && magr.mcan | 0) {
      return FALSE;
    }
    break;
  default:
    break;
  }
  if (check_visor) {
    o = mdef === G.youmonst ? G.invent : mdef.minvent;
    for (; o; o = o.nobj) {
      if (o.owornmask & W_ARMH && !!(s = G.obj_descr[G.objects[o.otyp].oc_descr_idx].oc_descr) && !strcmp(s, S("visored helmet"))) {
        return FALSE;
      }
    }
  }
  return TRUE;
}

export function ranged_attk(ptr: struct_permonst | null): number {
  let i = 0;
  let atyp = 0;
  let atk_mask = $shl64(1, AT_BREA) | $shl64(1, AT_SPIT) | $shl64(1, AT_GAZE);
  for (i = 0; i < NATTK; ++i) {
    atyp = ptr.mattk[i].aatyp;
    if (atyp >= AT_WEAP) {
      return TRUE;
    }
    if ((atk_mask & $shl64(1, atyp)) !== 0) {
      return TRUE;
    }
  }
  return FALSE;
}

export function mon_hates_silver(mon: struct_monst | null): number {
  return (mon.cham === 222 || mon.cham === 223 || mon.cham === 224 || hates_silver(mon.data) ? 1 : 0) << 24 >> 24;
}

export function hates_silver(ptr: struct_permonst | null): number {
  return ((ptr.mflags2 & 4) >>> 0 !== 0 || ptr.mlet === S_VAMPIRE || (ptr.mflags2 & 256) >>> 0 !== 0 || ptr === $sat(G.mons, PM_SHADE) || ptr.mlet === S_IMP && ptr !== $sat(G.mons, PM_TENGU) ? 1 : 0) << 24 >> 24;
}

export function mon_hates_light(mon: struct_monst | null): number {
  return (mon.data === $sat(G.mons, 39) ? 1 : 0) << 24 >> 24;
}

export function passes_bars(mptr: struct_permonst | null): number {
  return ((mptr.mflags1 & 8) >>> 0 !== 0 || (mptr.mflags1 & 4) >>> 0 !== 0 || (mptr.mflags1 & 1048576) >>> 0 !== 0 || (mptr.mlet === S_VORTEX || mptr === $sat(G.mons, 151)) || mptr.msize < 1 || dmgtype(mptr, AD_CORR) || dmgtype(mptr, AD_RUST) || (mptr.mflags1 & 524288) >>> 0 !== 0 && !(mptr.msize >= 3) ? 1 : 0) << 24 >> 24;
}

export function can_blow(mtmp: struct_monst | null): number {
  if ((mtmp.data.msound === 0 || mtmp.data.msound === MS_BUZZ) && ((mtmp.data.mflags1 & 1024) >>> 0 !== 0 || mtmp.data.msize < 1 || !((mtmp.data.mflags1 & 32768) >>> 0 === 0) || mtmp.data.mlet === S_EEL)) {
    return FALSE;
  }
  if (mtmp === G.youmonst && G.u.uprops[STRANGLED].intrinsic) {
    return FALSE;
  }
  return TRUE;
}

export function can_chant(mtmp: struct_monst | null): number {
  if (mtmp === G.youmonst && G.u.uprops[STRANGLED].intrinsic || mtmp.data.msound === 0 || !((mtmp.data.mflags1 & 32768) >>> 0 === 0) || mtmp.data.msound === MS_BUZZ || mtmp.data.msound === MS_BURBLE) {
    return FALSE;
  }
  return TRUE;
}

export async function can_be_strangled(mon: struct_monst | null): Promise<number> {
  let mamul = null;
  let nonbreathing = 0;
  let nobrainer = 0;
  if (!((mon.data.mflags1 & 32768) >>> 0 === 0)) {
    return FALSE;
  }
  if (mon === G.youmonst) {
    nobrainer = ((G.youmonst.data.mflags1 & 65536) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    nonbreathing = (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  } else {
    nobrainer = ((mon.data.mflags1 & 65536) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    nonbreathing = ((mon.data.mflags1 & 1024) >>> 0 !== 0 || !!(mamul = await which_armor(mon, W_AMUL)) && mamul.otyp === AMULET_OF_MAGICAL_BREATHING ? 1 : 0) << 24 >> 24;
  }
  return (!nobrainer || !nonbreathing ? 1 : 0) << 24 >> 24;
}

export function can_track(ptr: struct_permonst | null): number {
  if (G.uwep && G.uwep.oartifact === ART_EXCALIBUR) {
    return TRUE;
  } else {
    return ((ptr.mflags1 & 4096) >>> 0 === 0 ? 1 : 0) << 24 >> 24;
  }
}

export function sliparm(ptr: struct_permonst | null): number {
  return (ptr.mlet === S_VORTEX || ptr === $sat(G.mons, 151) || ptr.msize <= MZ_SMALL || ptr.mlet === S_GHOST ? 1 : 0) << 24 >> 24;
}

export function breakarm(ptr: struct_permonst | null): number {
  if (sliparm(ptr)) {
    return FALSE;
  }
  return (ptr.msize >= 3 || ptr.msize > MZ_SMALL && !((ptr.mflags1 & 131072) >>> 0 !== 0) || ptr === $sat(G.mons, PM_MARILITH) || ptr === $sat(G.mons, PM_WINGED_GARGOYLE) ? 1 : 0) << 24 >> 24;
}

export function sticks(ptr: struct_permonst | null): number {
  return (dmgtype(ptr, AD_STCK) || dmgtype(ptr, AD_WRAP) || attacktype(ptr, AT_HUGS) ? 1 : 0) << 24 >> 24;
}

export function cantvomit(ptr: struct_permonst | null): number {
  if (ptr.mlet === S_RODENT && ptr !== $sat(G.mons, PM_ROCK_MOLE) && ptr !== $sat(G.mons, PM_WOODCHUCK)) {
    return TRUE;
  }
  return FALSE;
}

export async function num_horns(ptr: struct_permonst | null): Promise<number> {
  switch (await monsndx(ptr)) {
  case 287:
  case 174:
  case 306:
  case 299:
    return 2;
  case 100:
  case 101:
  case 102:
  case 123:
    return 1;
  default:
    break;
  }
  return 0;
}

export function dmgtype_fromattack(ptr: struct_permonst | null, dtyp: number, atyp: number): struct_attack | null {
  let a = null;
  for (a = ptr.mattk[0]; $sidx(a) < $sidx($sat(ptr.mattk, NATTK)); a = $sadd(a, 1)) {
    if (a.adtyp === dtyp && (atyp === AT_ANY || a.aatyp === atyp)) {
      return a;
    }
  }
  return null;
}

export function dmgtype(ptr: struct_permonst | null, dtyp: number): number {
  return (dmgtype_fromattack(ptr, dtyp, AT_ANY) ? TRUE : FALSE) << 24 >> 24;
}

export function max_passive_dmg(mdef: struct_monst | null, magr: struct_monst | null): number {
  let i = 0;
  let dmg = 0;
  let multi2 = 0;
  let adtyp = 0;
  for (i = 0; i < NATTK; ++i) {
    switch (magr.data.mattk[i].aatyp) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 11:
    case 16:
    case 254:
      ++multi2;
      break;
    default:
      break;
    }
  }
  for (i = 0; i < NATTK; ++i) {
    if (mdef.data.mattk[i].aatyp === AT_NONE || mdef.data.mattk[i].aatyp === AT_BOOM) {
      adtyp = mdef.data.mattk[i].adtyp;
      if (adtyp === AD_ACID && !(((magr.data.mresists | magr.mextrinsics) & 64) !== 0) || adtyp === AD_COLD && !(((magr.data.mresists | magr.mextrinsics) & 2) !== 0) || adtyp === AD_FIRE && !(((magr.data.mresists | magr.mextrinsics) & 1) !== 0) || adtyp === AD_ELEC && !(((magr.data.mresists | magr.mextrinsics) & 16) !== 0) || adtyp === AD_PHYS) {
        dmg = mdef.data.mattk[i].damn;
        if (!dmg) {
          dmg = mdef.data.mlevel + 1;
        }
        dmg = Math.imul(dmg, mdef.data.mattk[i].damd);
      } else {
        dmg = 0;
      }
      return Math.imul(dmg, multi2);
    }
  }
  return 0;
}

export async function same_race(pm1: struct_permonst | null, pm2: struct_permonst | null): Promise<number> {
  let let1 = pm1.mlet;
  let let2 = pm2.mlet;
  if (pm1 === pm2) {
    return TRUE;
  }
  if ((pm1.mflags2 & 8) >>> 0 !== 0) {
    return ((pm2.mflags2 & 8) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 16) >>> 0 !== 0) {
    return ((pm2.mflags2 & 16) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 32) >>> 0 !== 0) {
    return ((pm2.mflags2 & 32) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 64) >>> 0 !== 0) {
    return ((pm2.mflags2 & 64) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 128) >>> 0 !== 0) {
    return ((pm2.mflags2 & 128) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 8192) >>> 0 !== 0) {
    return ((pm2.mflags2 & 8192) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if (pm1.mlet === S_GOLEM) {
    return (pm2.mlet === S_GOLEM ? 1 : 0) << 24 >> 24;
  }
  if (pm1 === $sat(G.mons, 47) || pm1 === $sat(G.mons, 48)) {
    return (pm2 === $sat(G.mons, 47) || pm2 === $sat(G.mons, 48) ? 1 : 0) << 24 >> 24;
  }
  if (let1 === S_KOBOLD || pm1 === $sat(G.mons, PM_KOBOLD_ZOMBIE) || pm1 === $sat(G.mons, PM_KOBOLD_MUMMY)) {
    return (let2 === S_KOBOLD || pm2 === $sat(G.mons, PM_KOBOLD_ZOMBIE) || pm2 === $sat(G.mons, PM_KOBOLD_MUMMY) ? 1 : 0) << 24 >> 24;
  }
  if (let1 === S_OGRE) {
    return (let2 === S_OGRE ? 1 : 0) << 24 >> 24;
  }
  if (let1 === S_NYMPH) {
    return (let2 === S_NYMPH ? 1 : 0) << 24 >> 24;
  }
  if (let1 === S_CENTAUR) {
    return (let2 === S_CENTAUR ? 1 : 0) << 24 >> 24;
  }
  if (pm1.mlet === S_UNICORN && (pm1.mflags2 & 536870912) >>> 0 !== 0) {
    return (pm2.mlet === S_UNICORN && (pm2.mflags2 & 536870912) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if (let1 === S_DRAGON) {
    return (let2 === S_DRAGON ? 1 : 0) << 24 >> 24;
  }
  if (let1 === S_NAGA) {
    return (let2 === S_NAGA ? 1 : 0) << 24 >> 24;
  }
  if (pm1 === $sat(G.mons, 308) || pm1 === $sat(G.mons, 310) || pm1 === $sat(G.mons, 309)) {
    return (pm2 === $sat(G.mons, 308) || pm2 === $sat(G.mons, 310) || pm2 === $sat(G.mons, 309) ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 4096) >>> 0 !== 0) {
    return ((pm2.mflags2 & 4096) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if (pm1 === $sat(G.mons, PM_TENGU) || pm2 === $sat(G.mons, PM_TENGU)) {
    return FALSE;
  }
  if (let1 === S_IMP) {
    return (let2 === S_IMP ? 1 : 0) << 24 >> 24;
  } else if (let2 === S_IMP) {
    return FALSE;
  }
  if ((pm1.mflags2 & 256) >>> 0 !== 0) {
    return ((pm2.mflags2 & 256) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if ((pm1.mflags2 & 2) >>> 0 !== 0) {
    if (let1 === S_ZOMBIE) {
      return (let2 === S_ZOMBIE ? 1 : 0) << 24 >> 24;
    }
    if (let1 === S_MUMMY) {
      return (let2 === S_MUMMY ? 1 : 0) << 24 >> 24;
    }
    if (let1 === S_VAMPIRE) {
      return (let2 === S_VAMPIRE ? 1 : 0) << 24 >> 24;
    }
    if (let1 === S_LICH) {
      return (let2 === S_LICH ? 1 : 0) << 24 >> 24;
    }
    if (let1 === S_WRAITH) {
      return (let2 === S_WRAITH ? 1 : 0) << 24 >> 24;
    }
    if (let1 === S_GHOST) {
      return (let2 === S_GHOST ? 1 : 0) << 24 >> 24;
    }
  } else if ((pm2.mflags2 & 2) >>> 0 !== 0) {
    return FALSE;
  }
  if (let1 === let2) {
    let m1 = await monsndx(pm1);
    let m2 = await monsndx(pm2);
    let prv = 0;
    let nxt = 0;
    for (prv = m1, nxt = big_to_little(m1); nxt !== prv; prv = nxt, nxt = big_to_little(nxt)) {
      if (nxt === m2) {
        return TRUE;
      }
    }
    for (prv = m1, nxt = little_to_big(m1); nxt !== prv; prv = nxt, nxt = little_to_big(nxt)) {
      if (nxt === m2) {
        return TRUE;
      }
    }
  }
  if (pm1 === $sat(G.mons, PM_GARGOYLE) || pm1 === $sat(G.mons, PM_WINGED_GARGOYLE)) {
    return (pm2 === $sat(G.mons, PM_GARGOYLE) || pm2 === $sat(G.mons, PM_WINGED_GARGOYLE) ? 1 : 0) << 24 >> 24;
  }
  if (pm1 === $sat(G.mons, PM_KILLER_BEE) || pm1 === $sat(G.mons, PM_QUEEN_BEE)) {
    return (pm2 === $sat(G.mons, PM_KILLER_BEE) || pm2 === $sat(G.mons, PM_QUEEN_BEE) ? 1 : 0) << 24 >> 24;
  }
  if (pm1 === $sat(G.mons, 111) || pm1 === $sat(G.mons, 113) || pm1 === $sat(G.mons, 327)) {
    return (pm2 === $sat(G.mons, 111) || pm2 === $sat(G.mons, 113) || pm2 === $sat(G.mons, 327) ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export async function monsndx(ptr: struct_permonst | null): Promise<number> {
  let i = 0;
  i = $sdiff(ptr, $sat(G.mons, 0)) | 0;
  if (i < LOW_PM || i >= NUMMONS) {
    await panic(S("monsndx - could not index monster (%s)"), fmt_ptr(ptr));
    return NON_PM;
  }
  return i;
}

export function name_to_mon(in_str: Ptr | null): number {
  let i = 0;
  let mntmp = NON_PM;
  let s = null;
  let str = null;
  let term = null;
  let buf = new Int8Array(256);
  let len = 0;
  let slen = 0;
  str = strcpy(P(buf), in_str);
  if (!strncmp(str, S("a "), 2)) {
    str = str.add(2);
  } else if (!strncmp(str, S("an "), 3)) {
    str = str.add(3);
  } else if (!strncmp(str, S("the "), 4)) {
    str = str.add(4);
  }
  slen = strlen(str) | 0;
  term = str.add(slen);
  if (!!(s = strstri(str, S("vortices")))) {
    strcpy(s.add(4), S("ex"));
  } else if (slen > 3 && !strncmpi(term.add(-3), S("ies"), -1) && (slen < 7 || strncmpi(term.add(-7), S("zombies"), -1))) {
    strcpy(term.add(-3), S("y"));
  } else if (slen > 3 && !strncmpi(term.add(-3), S("ves"), -1)) {
    strcpy(term.add(-3), S("f"));
  }
  slen = strlen(str) | 0;
  {
    let namep = null;
    for (namep = name_to_mon$names[0]; namep.name; namep = $sadd(namep, 1)) {
      if (!strncmpi(str, namep.name, strlen(namep.name) | 0)) {
        return namep.pm_val;
      }
    }
  }
  for (len = 0, i = LOW_PM; i < NUMMONS; ++i) {
    let m_i_len = strlen(G.mons[i].mname) | 0;
    if (m_i_len > len && !strncmpi(G.mons[i].mname, str, m_i_len)) {
      if (m_i_len === slen) {
        mntmp = i;
        break;
      } else if (slen > m_i_len && (str.a[str.o + m_i_len] === 32 || !strncmpi(str.add(m_i_len), S("s"), -1) || !strncmpi(str.add(m_i_len), S("s "), 2) || !strncmpi(str.add(m_i_len), S("'"), -1) || !strncmpi(str.add(m_i_len), S("' "), 2) || !strncmpi(str.add(m_i_len), S("'s"), -1) || !strncmpi(str.add(m_i_len), S("'s "), 3) || !strncmpi(str.add(m_i_len), S("es"), -1) || !strncmpi(str.add(m_i_len), S("es "), 3))) {
        mntmp = i;
        len = m_i_len;
      }
    }
  }
  if (mntmp === NON_PM) {
    mntmp = title_to_mon(str, null, null);
  }
  return mntmp;
}

export async function name_to_monclass(in_str: Ptr | null, mndx_p: Ptr | null): Promise<number> {
  let p = null;
  let x = null;
  let i = 0;
  let len = 0;
  if (mndx_p) {
    mndx_p.a[mndx_p.o] = NON_PM;
  }
  if (!in_str || !in_str.a[in_str.o]) {
    return 0;
  } else if (!in_str.a[in_str.o + 1]) {
    i = def_char_to_monclass(in_str.a[in_str.o]);
    if (i === S_MIMIC_DEF) {
      i = S_MIMIC;
    } else if (i === S_WORM_TAIL) {
      i = S_WORM;
      if (mndx_p) {
        mndx_p.a[mndx_p.o] = PM_LONG_WORM;
      }
    } else if (i === MAXMCLASSES) {
      i = in_str.a[in_str.o] === DEF_INVISIBLE ? S_invisible : 0;
    }
    return i;
  } else {
    if (!strncmpi(in_str, S("long"), -1)) {
      return 0;
    }
    in_str = await makesingular(in_str);
    for (i = 0; name_to_monclass$falsematch[i]; ++i) {
      if (!strncmpi(in_str, name_to_monclass$falsematch[i], -1)) {
        return 0;
      }
    }
    for (i = 0; name_to_monclass$truematch[i].name; ++i) {
      if (!strncmpi(in_str, name_to_monclass$truematch[i].name, -1)) {
        i = name_to_monclass$truematch[i].pm_val;
        if (i < 0) {
          return -i;
        }
        if (mndx_p) {
          mndx_p.a[mndx_p.o] = i;
        }
        return G.mons[i].mlet;
      }
    }
    len = strlen(in_str) | 0;
    for (i = 1; i < MAXMCLASSES; ++i) {
      x = G.def_monsyms[i].explain;
      if (!!(p = strstri(x, in_str)) && ($peq(p, x) || $rd(p.add(-1)) === 32) && ((strlen(p) | 0) >= len && (p.a[p.o + len] === 0 || p.a[p.o + len] === 32))) {
        return i;
      }
    }
    i = name_to_mon(in_str);
    if (i !== NON_PM) {
      if (mndx_p) {
        mndx_p.a[mndx_p.o] = i;
      }
      return G.mons[i].mlet;
    }
  }
  return 0;
}

export function gender(mtmp: struct_monst | null): number {
  if ((mtmp.data.mflags2 & 262144) >>> 0 !== 0) {
    return 2;
  }
  return mtmp.female | 0;
}

export function pronoun_gender(mtmp: struct_monst | null, override_vis: number): number {
  if (!override_vis && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    return 2;
  }
  if ((mtmp.data.mflags2 & 262144) >>> 0 !== 0) {
    return 2;
  }
  return (mtmp.data.mflags1 & 131072) >>> 0 !== 0 || mtmp.data.geno & G_UNIQ || (mtmp.data.mflags2 & 524288) >>> 0 !== 0 ? mtmp.female | 0 : 2;
}

export function levl_follower(mtmp: struct_monst | null): number {
  if (mtmp === G.u.usteed) {
    return TRUE;
  }
  if (mtmp.iswiz | 0 && mon_has_amulet(mtmp)) {
    return FALSE;
  }
  if (mtmp.mtame || mtmp.iswiz | 0 || is_fshk(mtmp)) {
    return TRUE;
  }
  return ((mtmp.data.mflags2 & M2_STALK) >>> 0 && (!mtmp.mflee || G.u.uhave.amulet | 0) ? 1 : 0) << 24 >> 24;
}

export function little_to_big(montype: number): number {
  let i = 0;
  for (i = 0; grownups[i][0] >= LOW_PM; ++i) {
    if (montype === grownups[i][0]) {
      montype = grownups[i][1];
      break;
    }
  }
  return montype;
}

export function big_to_little(montype: number): number {
  let i = 0;
  for (i = 0; grownups[i][0] >= LOW_PM; ++i) {
    if (montype === grownups[i][1]) {
      montype = grownups[i][0];
      break;
    }
  }
  return montype;
}

export function big_little_match(montyp1: number, montyp2: number): number {
  let l = 0;
  let b = 0;
  if (montyp1 === montyp2) {
    return TRUE;
  }
  if (G.mons[montyp1].mlet !== G.mons[montyp2].mlet) {
    return FALSE;
  }
  for (l = montyp1; (b = little_to_big(l)) !== l; l = b) {
    if (b === montyp2) {
      return TRUE;
    }
  }
  for (l = montyp2; (b = little_to_big(l)) !== l; l = b) {
    if (b === montyp1) {
      return TRUE;
    }
  }
  return FALSE;
}

export function raceptr(mtmp: struct_monst | null): struct_permonst | null {
  if (mtmp === G.youmonst && !(G.u.umonnum !== G.u.umonster)) {
    return $sat(G.mons, G.urace.malenum);
  } else {
    return mtmp.data;
  }
}

export function locomotion(ptr: struct_permonst | null, def: Ptr | null): Ptr | null {
  let capitalize = def.a[def.o] === highc(def.a[def.o]) ? 1 : 0;
  return ptr.mlet === S_EYE || ptr.mlet === S_LIGHT ? levitate[capitalize] : (ptr.mflags1 & 1) >>> 0 !== 0 && ptr.msize <= MZ_SMALL ? flys[capitalize] : (ptr.mflags1 & 1) >>> 0 !== 0 && ptr.msize > MZ_SMALL ? flyl[capitalize] : (ptr.mflags1 & 524288) >>> 0 !== 0 ? slither[capitalize] : (ptr.mflags1 & 4) >>> 0 !== 0 ? ooze[capitalize] : !ptr.mmove ? immobile[capitalize] : (ptr.mflags1 & 24576) >>> 0 === 24576 ? crawl[capitalize] : def;
}

export function stagger(ptr: struct_permonst | null, def: Ptr | null): Ptr | null {
  let capitalize = 2 + (def.a[def.o] === highc(def.a[def.o]) ? 1 : 0);
  return ptr.mlet === S_EYE || ptr.mlet === S_LIGHT ? levitate[capitalize] : (ptr.mflags1 & 1) >>> 0 !== 0 && ptr.msize <= MZ_SMALL ? flys[capitalize] : (ptr.mflags1 & 1) >>> 0 !== 0 && ptr.msize > MZ_SMALL ? flyl[capitalize] : (ptr.mflags1 & 524288) >>> 0 !== 0 ? slither[capitalize] : (ptr.mflags1 & 4) >>> 0 !== 0 ? ooze[capitalize] : !ptr.mmove ? immobile[capitalize] : (ptr.mflags1 & 24576) >>> 0 === 24576 ? crawl[capitalize] : def;
}

export async function on_fire(mptr: struct_permonst | null, mattk: struct_attack | null): Promise<Ptr | null> {
  let what = null;
  switch (await monsndx(mptr)) {
  case 30:
  case 110:
  case 152:
  case 326:
    what = S("already on fire");
    break;
  case 154:
  case 105:
  case 109:
    what = S("boiling");
    break;
  case 107:
  case 254:
    what = S("melting");
    break;
  case 253:
  case 252:
  case 248:
  case 151:
  case 153:
  case 106:
  case 108:
    what = S("heating up");
    break;
  default:
    what = mattk.aatyp === AT_HUGS ? S("being roasted") : S("on fire");
    break;
  }
  return what;
}

export function olfaction(mdat: struct_permonst | null): number {
  if (mdat.mlet === S_GOLEM || mdat.mlet === S_EYE || mdat.mlet === S_JELLY || mdat.mlet === S_PUDDING || mdat.mlet === S_BLOB || mdat.mlet === S_VORTEX || mdat.mlet === S_ELEMENTAL || mdat.mlet === S_FUNGUS || mdat.mlet === S_LIGHT) {
    return FALSE;
  }
  return TRUE;
}

export function $init(): void {
  grownups = $rows([$ta(Int16Array, 2, [PM_CHICKATRICE, PM_COCKATRICE]),
$ta(Int16Array, 2, [PM_LITTLE_DOG, PM_DOG]),
$ta(Int16Array, 2, [PM_DOG, PM_LARGE_DOG]),
$ta(Int16Array, 2, [PM_HELL_HOUND_PUP, PM_HELL_HOUND]),
$ta(Int16Array, 2, [PM_WINTER_WOLF_CUB, PM_WINTER_WOLF]),
$ta(Int16Array, 2, [PM_KITTEN, PM_HOUSECAT]),
$ta(Int16Array, 2, [PM_HOUSECAT, PM_LARGE_CAT]),
$ta(Int16Array, 2, [PM_PONY, PM_HORSE]),
$ta(Int16Array, 2, [PM_HORSE, PM_WARHORSE]),
$ta(Int16Array, 2, [PM_KOBOLD, PM_LARGE_KOBOLD]),
$ta(Int16Array, 2, [PM_LARGE_KOBOLD, PM_KOBOLD_LORD]),
$ta(Int16Array, 2, [PM_GNOME, PM_GNOME_LORD]),
$ta(Int16Array, 2, [PM_GNOME_LORD, PM_GNOME_KING]),
$ta(Int16Array, 2, [PM_DWARF, PM_DWARF_LORD]),
$ta(Int16Array, 2, [PM_DWARF_LORD, PM_DWARF_KING]),
$ta(Int16Array, 2, [PM_MIND_FLAYER, PM_MASTER_MIND_FLAYER]),
$ta(Int16Array, 2, [PM_ORC, PM_ORC_CAPTAIN]),
$ta(Int16Array, 2, [PM_HILL_ORC, PM_ORC_CAPTAIN]),
$ta(Int16Array, 2, [PM_MORDOR_ORC, PM_ORC_CAPTAIN]),
$ta(Int16Array, 2, [PM_URUK_HAI, PM_ORC_CAPTAIN]),
$ta(Int16Array, 2, [PM_SEWER_RAT, PM_GIANT_RAT]),
$ta(Int16Array, 2, [PM_CAVE_SPIDER, PM_GIANT_SPIDER]),
$ta(Int16Array, 2, [PM_OGRE, PM_OGRE_LORD]),
$ta(Int16Array, 2, [PM_OGRE_LORD, PM_OGRE_KING]),
$ta(Int16Array, 2, [PM_ELF, PM_ELF_LORD]),
$ta(Int16Array, 2, [PM_WOODLAND_ELF, PM_ELF_LORD]),
$ta(Int16Array, 2, [PM_GREEN_ELF, PM_ELF_LORD]),
$ta(Int16Array, 2, [PM_GREY_ELF, PM_ELF_LORD]),
$ta(Int16Array, 2, [PM_ELF_LORD, PM_ELVENKING]),
$ta(Int16Array, 2, [PM_LICH, PM_DEMILICH]),
$ta(Int16Array, 2, [PM_DEMILICH, PM_MASTER_LICH]),
$ta(Int16Array, 2, [PM_MASTER_LICH, PM_ARCH_LICH]),
$ta(Int16Array, 2, [PM_VAMPIRE, PM_VAMPIRE_LORD]),
$ta(Int16Array, 2, [PM_BAT, PM_GIANT_BAT]),
$ta(Int16Array, 2, [PM_BABY_GRAY_DRAGON, PM_GRAY_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_SILVER_DRAGON, PM_SILVER_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_RED_DRAGON, PM_RED_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_WHITE_DRAGON, PM_WHITE_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_ORANGE_DRAGON, PM_ORANGE_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_BLACK_DRAGON, PM_BLACK_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_BLUE_DRAGON, PM_BLUE_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_GREEN_DRAGON, PM_GREEN_DRAGON]),
$ta(Int16Array, 2, [PM_BABY_YELLOW_DRAGON, PM_YELLOW_DRAGON]),
$ta(Int16Array, 2, [PM_RED_NAGA_HATCHLING, PM_RED_NAGA]),
$ta(Int16Array, 2, [PM_BLACK_NAGA_HATCHLING, PM_BLACK_NAGA]),
$ta(Int16Array, 2, [PM_GOLDEN_NAGA_HATCHLING, PM_GOLDEN_NAGA]),
$ta(Int16Array, 2, [PM_GUARDIAN_NAGA_HATCHLING, PM_GUARDIAN_NAGA]),
$ta(Int16Array, 2, [PM_SMALL_MIMIC, PM_LARGE_MIMIC]),
$ta(Int16Array, 2, [PM_LARGE_MIMIC, PM_GIANT_MIMIC]),
$ta(Int16Array, 2, [PM_BABY_LONG_WORM, PM_LONG_WORM]),
$ta(Int16Array, 2, [PM_BABY_PURPLE_WORM, PM_PURPLE_WORM]),
$ta(Int16Array, 2, [PM_BABY_CROCODILE, PM_CROCODILE]),
$ta(Int16Array, 2, [PM_SOLDIER, PM_SERGEANT]),
$ta(Int16Array, 2, [PM_SERGEANT, PM_LIEUTENANT]),
$ta(Int16Array, 2, [PM_LIEUTENANT, PM_CAPTAIN]),
$ta(Int16Array, 2, [PM_WATCHMAN, PM_WATCH_CAPTAIN]),
$ta(Int16Array, 2, [PM_ALIGNED_PRIEST, PM_HIGH_PRIEST]),
$ta(Int16Array, 2, [PM_STUDENT, PM_ARCHEOLOGIST]),
$ta(Int16Array, 2, [PM_ATTENDANT, PM_HEALER]),
$ta(Int16Array, 2, [PM_PAGE, PM_KNIGHT]),
$ta(Int16Array, 2, [PM_ACOLYTE, PM_PRIEST]),
$ta(Int16Array, 2, [PM_APPRENTICE, PM_WIZARD]),
$ta(Int16Array, 2, [PM_MANES, PM_LEMURE]),
$ta(Int16Array, 2, [PM_KEYSTONE_KOP, PM_KOP_SERGEANT]),
$ta(Int16Array, 2, [PM_KOP_SERGEANT, PM_KOP_LIEUTENANT]),
$ta(Int16Array, 2, [PM_KOP_LIEUTENANT, PM_KOP_KAPTAIN]),
$ta(Int16Array, 2, [NON_PM, NON_PM])]);
  levitate = [S("float"),
S("Float"),
S("wobble"),
S("Wobble")];
  flys = [S("fly"),
S("Fly"),
S("flutter"),
S("Flutter")];
  flyl = [S("fly"),
S("Fly"),
S("stagger"),
S("Stagger")];
  slither = [S("slither"),
S("Slither"),
S("falter"),
S("Falter")];
  ooze = [S("ooze"),
S("Ooze"),
S("tremble"),
S("Tremble")];
  immobile = [S("wiggle"),
S("Wiggle"),
S("pulsate"),
S("Pulsate")];
  crawl = [S("crawl"),
S("Crawl"),
S("falter"),
S("Falter")];
  name_to_mon$names = $sarrOf([struct_alt_spl.$of(S("grey dragon"), PM_GRAY_DRAGON),
struct_alt_spl.$of(S("baby grey dragon"), PM_BABY_GRAY_DRAGON),
struct_alt_spl.$of(S("grey unicorn"), PM_GRAY_UNICORN),
struct_alt_spl.$of(S("grey ooze"), PM_GRAY_OOZE),
struct_alt_spl.$of(S("gray-elf"), PM_GREY_ELF),
struct_alt_spl.$of(S("mindflayer"), PM_MIND_FLAYER),
struct_alt_spl.$of(S("master mindflayer"), PM_MASTER_MIND_FLAYER),
struct_alt_spl.$of(S("aligned priestess"), PM_ALIGNED_PRIEST),
struct_alt_spl.$of(S("high priestess"), PM_HIGH_PRIEST),
struct_alt_spl.$of(S("master of thief"), PM_MASTER_OF_THIEVES),
struct_alt_spl.$of(S("master thief"), PM_MASTER_OF_THIEVES),
struct_alt_spl.$of(S("master of assassin"), PM_MASTER_ASSASSIN),
struct_alt_spl.$of(S("invisible stalker"), PM_STALKER),
struct_alt_spl.$of(S("high-elf"), PM_ELVENKING),
struct_alt_spl.$of(S("wood-elf"), PM_WOODLAND_ELF),
struct_alt_spl.$of(S("wood elf"), PM_WOODLAND_ELF),
struct_alt_spl.$of(S("woodland nymph"), PM_WOOD_NYMPH),
struct_alt_spl.$of(S("halfling"), PM_HOBBIT),
struct_alt_spl.$of(S("genie"), PM_DJINNI),
struct_alt_spl.$of(S("ki rin"), PM_KI_RIN),
struct_alt_spl.$of(S("uruk hai"), PM_URUK_HAI),
struct_alt_spl.$of(S("orc captain"), PM_ORC_CAPTAIN),
struct_alt_spl.$of(S("woodland elf"), PM_WOODLAND_ELF),
struct_alt_spl.$of(S("green elf"), PM_GREEN_ELF),
struct_alt_spl.$of(S("grey elf"), PM_GREY_ELF),
struct_alt_spl.$of(S("gray elf"), PM_GREY_ELF),
struct_alt_spl.$of(S("elf lord"), PM_ELF_LORD),
struct_alt_spl.$of(S("olog hai"), PM_OLOG_HAI),
struct_alt_spl.$of(S("arch lich"), PM_ARCH_LICH),
struct_alt_spl.$of(S("incubi"), PM_INCUBUS),
struct_alt_spl.$of(S("succubi"), PM_SUCCUBUS),
struct_alt_spl.$of(S("violet fungi"), PM_VIOLET_FUNGUS),
struct_alt_spl.$of(S("homunculi"), PM_HOMUNCULUS),
struct_alt_spl.$of(S("baluchitheria"), PM_BALUCHITHERIUM),
struct_alt_spl.$of(S("lurkers above"), PM_LURKER_ABOVE),
struct_alt_spl.$of(S("cavemen"), PM_CAVEMAN),
struct_alt_spl.$of(S("cavewomen"), PM_CAVEWOMAN),
struct_alt_spl.$of(S("watchmen"), PM_WATCHMAN),
struct_alt_spl.$of(S("djinn"), PM_DJINNI),
struct_alt_spl.$of(S("mumakil"), PM_MUMAK),
struct_alt_spl.$of(S("erinyes"), PM_ERINYS),
struct_alt_spl.$of(null, NON_PM)]);
  name_to_monclass$falsematch = [S("an"),
S("the"),
S("or"),
S("other"),
S("or other"),
null];
  name_to_monclass$truematch = $sarrOf([struct_alt_spl.$of(S("long worm"), PM_LONG_WORM),
struct_alt_spl.$of(S("demon"), -S_DEMON),
struct_alt_spl.$of(S("devil"), -S_DEMON),
struct_alt_spl.$of(S("bug"), -S_XAN),
struct_alt_spl.$of(S("fish"), -S_EEL),
struct_alt_spl.$of(null, NON_PM)]);
}
