// @ts-nocheck
// NetHack 3.6.7 weapon.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { artifact_light, shade_glare, spec_abon, spec_dbon, touch_artifact, undiscovered_artifact } from './artifact.ts';
import { acurr } from './attrib.ts';
import { yn_function } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { newsym } from './display.ts';
import { flooreffects } from './do.ts';
import { Monnam, mon_nam } from './do_name.ts';
import { panic } from './end.ts';
import { dist2, eos, s_suffix } from './hacklib.ts';
import { stackobj } from './invent.ts';
import { arti_light_description } from './light.ts';
import { adj_lev } from './makemon.ts';
import { obj_extract_self, place_object } from './mkobj.ts';
import { attacktype, mon_hates_silver, pronoun_gender } from './mondata.ts';
import { m_carrying } from './mthrowu.ts';
import { The, Tobjnam, Yname2, Yobjnam2, distant_name, doname, makeplural, makesingular, otense, vtense, xname } from './objnam.ts';
import { You, You_feel, Your, impossible, pline } from './pline.ts';
import { mbodypart } from './polyself.ts';
import { d, rnd } from './rnd.ts';
import { spell_skilltype } from './spell.ts';
import { begin_burn, end_burn } from './timeout.ts';
import { mwelded } from './wield.ts';
import { worm_known } from './worm.ts';
import { bypass_obj, which_armor } from './worn.ts';
import { struct_def_skill, struct_monst, struct_obj, struct_skill_range, union_any } from './structs.ts';
import { $cs, $rd, $sadd, $sarrOf, $sat, $ta, $wr, G, P, S, free, sprintf, strchr, strcpy, strlen } from './rt/index.ts';
import { AKLYS, ARROW, ATHAME, ATR_NONE, AT_WEAP, AXE, A_DEX, A_STR, BALL_CLASS, BARDICHE, BATTLE_AXE, BEC_DE_CORBIN, BILL_GUISARME, BLINDED, BOOMERANG, BOULDER, BOW, BROADSWORD, BULLWHIP, CHAIN_CLASS, CLUB, CORPSE, CREAM_PIE, CROSSBOW, CROSSBOW_BOLT, CRYSKNIFE, DAGGER, DART, DWARVISH_MATTOCK, DWARVISH_SHORT_SWORD, DWARVISH_SPEAR, EGG, ELVEN_ARROW, ELVEN_BOW, ELVEN_BROADSWORD, ELVEN_DAGGER, ELVEN_SHORT_SWORD, ELVEN_SPEAR, FALSE, FAUCHARD, FLAIL, FLINT, GEM_CLASS, GLAIVE, GRAPPLING_HOOK, GUISARME, HALBERD, HAND, HEAVY_IRON_BALL, INFRAVISION, IRON_BALL_W_INCR, JAVELIN, KATANA, KNIFE, LANCE, LEATHER, LOADSTONE, LONG_SWORD, LUCERN_HAMMER, LUCKSTONE, MACE, MAXULEV, MENU_UNSELECTED, MORNING_STAR, NEED_AXE, NEED_HTH_WEAPON, NEED_PICK_AXE, NEED_PICK_OR_AXE, NEED_RANGED_WEAPON, NEED_WEAPON, NHW_MENU, NO_GLYPH, NO_WEAPON_WANTED, ORCISH_ARROW, ORCISH_BOW, ORCISH_DAGGER, ORCISH_SHORT_SWORD, ORCISH_SPEAR, PARTISAN, PICK_AXE, PICK_NONE, PICK_ONE, PM_PONY, PM_SHADE, PN_ATTACK_SPELL, PN_BARE_HANDED, PN_CLERIC_SPELL, PN_DIVINATION_SPELL, PN_ENCHANTMENT_SPELL, PN_ESCAPE_SPELL, PN_HAMMER, PN_HEALING_SPELL, PN_MATTER_SPELL, PN_POLEARMS, PN_RIDING, PN_SABER, PN_TWO_WEAPONS, PN_WHIP, P_ATTACK_SPELL, P_AXE, P_BARE_HANDED_COMBAT, P_BASIC, P_BOW, P_CLERIC_SPELL, P_CROSSBOW, P_DAGGER, P_ENCHANTMENT_SPELL, P_EXPERT, P_FLAIL, P_GRAND_MASTER, P_HEALING_SPELL, P_ISRESTRICTED, P_MASTER, P_MATTER_SPELL, P_NONE, P_NUM_SKILLS, P_PICK_AXE, P_RIDING, P_SKILLED, P_SKILL_LIMIT, P_SLING, P_SPEAR, P_TWO_WEAPON_COMBAT, P_UNICORN_HORN, P_UNSKILLED, QUARTERSTAFF, RANSEUR, ROCK, RUBBER_HOSE, RUNESWORD, SCALPEL, SCIMITAR, SEE_INVIS, SHORT_SWORD, SHURIKEN, SILVER, SILVER_ARROW, SILVER_DAGGER, SILVER_SABER, SILVER_SPEAR, SLING, SPEAR, SPETUM, STATUE, STRANGE_OBJECT, S_DRAGON, S_EEL, S_GIANT, S_JABBERWOCK, S_KOP, S_NAGA, S_SNAKE, S_XORN, TIN, TOOL_CLASS, TOWEL, TRIDENT, TRUE, TSURUGI, TWO_HANDED_SWORD, UNICORN_HORN, VOULGE, WAR_HAMMER, WEAPON_CLASS, WORM_TOOTH, W_ARM, W_ARMC, W_ARMG, W_ARMS, W_ARMU, W_RINGL, W_RINGR, W_WEP, YA, YUMI } from './consts.ts';

let skill_names_indices: any;
let odd_skill_names: any;
let barehands_or_martial: any;
let kebabable: any;
let rwep: any;
let pwep: any;
let propellor: struct_obj | null;
let hwep: any;
let skill_ranges: any;
let weapon_hit_bonus$bad_skill: any;

async function give_may_advance_msg(skill: number): Promise<void> {
  await You_feel(S("more confident in your %sskills."), skill === P_NONE ? S("") : skill <= P_UNICORN_HORN ? S("weapon ") : skill <= P_MATTER_SPELL ? S("spell casting ") : S("fighting "));
}

export async function weapon_descr(obj: struct_obj | null): Promise<Ptr | null> {
  let skill = weapon_type(obj);
  let descr = skill_names_indices[skill] > 0 ? G.obj_descr[G.objects[skill_names_indices[skill]].oc_name_idx].oc_name : skill === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[skill]];
  switch (skill) {
  case P_NONE:
    descr = obj.otyp === CORPSE || obj.otyp === TIN || obj.otyp === EGG || obj.otyp === STATUE || obj.otyp === BOULDER || obj.otyp === TOWEL ? G.obj_descr[G.objects[obj.otyp].oc_name_idx].oc_name : G.def_oc_syms[obj.oclass].name;
    break;
  case P_SLING:
    if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
      descr = obj.otyp === ROCK || (obj.otyp === 443 || obj.otyp === 444 || obj.otyp === 446 || obj.otyp === 445) ? S("stone") : obj.oclass === GEM_CLASS ? S("gem") : G.def_oc_syms[obj.oclass].name;
    }
    break;
  case P_BOW:
    if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
      descr = S("arrow");
    }
    break;
  case P_CROSSBOW:
    if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
      descr = S("bolt");
    }
    break;
  case P_FLAIL:
    if (obj.otyp === GRAPPLING_HOOK) {
      descr = S("hook");
    }
    break;
  case P_PICK_AXE:
    if (obj.otyp === DWARVISH_MATTOCK) {
      descr = S("mattock");
    }
    break;
  default:
    break;
  }
  return await makesingular(descr);
}

export async function hitval(otmp: struct_obj | null, mon: struct_monst | null): Promise<number> {
  let tmp = 0;
  let ptr = mon.data;
  let Is_weapon = (otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS && G.objects[otmp.otyp].oc_subtyp !== P_NONE ? 1 : 0) << 24 >> 24;
  if (Is_weapon) {
    tmp += otmp.spe;
  }
  tmp += G.objects[otmp.otyp].oc_oc1;
  if (Is_weapon && otmp.blessed | 0 && ((ptr.mflags2 & 256) >>> 0 !== 0 || (ptr.mflags2 & 2) >>> 0 !== 0 || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224))) {
    tmp += 2;
  }
  if (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp === P_SPEAR && strchr(P(kebabable), ptr.mlet)) {
    tmp += 2;
  }
  if (otmp.otyp === TRIDENT && (ptr.mflags1 & 2) >>> 0 !== 0) {
    if (is_pool(mon.mx, mon.my)) {
      tmp += 4;
    } else if (ptr.mlet === S_EEL || ptr.mlet === S_SNAKE) {
      tmp += 2;
    }
  }
  if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp === P_PICK_AXE && ((ptr.mflags1 & 8) >>> 0 !== 0 && (ptr.mflags1 & 2097152) >>> 0 !== 0)) {
    tmp += 2;
  }
  if (otmp.oartifact) {
    tmp += await spec_abon(otmp, mon);
  }
  return tmp;
}

export async function dmgval(otmp: struct_obj | null, mon: struct_monst | null): Promise<number> {
  let tmp = 0;
  let otyp = otmp.otyp;
  let ptr = mon.data;
  let Is_weapon = (otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS && G.objects[otmp.otyp].oc_subtyp !== P_NONE ? 1 : 0) << 24 >> 24;
  if (otyp === CREAM_PIE) {
    return 0;
  }
  if (ptr.msize >= 3) {
    if (G.objects[otyp].oc_wldam) {
      tmp = rnd(G.objects[otyp].oc_wldam);
    }
    switch (otyp) {
    case 451:
    case 6:
    case 57:
    case 42:
    case 41:
    case 36:
    case 35:
      ++tmp;
      break;
    case 63:
    case 43:
    case 49:
      tmp += rnd(4);
      break;
    case 453:
    case 47:
    case 44:
      tmp += rnd(6);
      break;
    case 28:
    case 48:
    case 16:
      tmp += d(2, 4);
      break;
    case 40:
    case 50:
    case 38:
      tmp += d(2, 6);
      break;
    }
  } else {
    if (G.objects[otyp].oc_wsdam) {
      tmp = rnd(G.objects[otyp].oc_wsdam);
    }
    switch (otyp) {
    case 451:
    case 6:
    case 56:
    case 58:
    case 63:
    case 44:
    case 16:
      ++tmp;
      break;
    case 28:
    case 48:
    case 53:
    case 52:
    case 54:
    case 57:
    case 43:
    case 35:
    case 36:
    case 41:
    case 49:
      tmp += rnd(4);
      break;
    case 453:
      tmp += rnd(6);
      break;
    }
  }
  if (Is_weapon) {
    tmp += otmp.spe;
    if (tmp < 0) {
      tmp = 0;
    }
  }
  if ((G.objects[otyp].oc_material | 0) <= LEATHER && (ptr.mflags1 & 2097152) >>> 0 !== 0) {
    tmp = 0;
  }
  if (ptr === $sat(G.mons, PM_SHADE) && !shade_glare(otmp)) {
    tmp = 0;
  }
  if (otyp === HEAVY_IRON_BALL && tmp > 0) {
    let wt = G.objects[HEAVY_IRON_BALL].oc_weight;
    if ((otmp.owt | 0) > wt) {
      wt = ((otmp.owt | 0) - wt) / IRON_BALL_W_INCR | 0;
      tmp += rnd(4 * wt);
      if (tmp > 25) {
        tmp = 25;
      }
    }
  }
  if (Is_weapon || otmp.oclass === GEM_CLASS || otmp.oclass === BALL_CLASS || otmp.oclass === CHAIN_CLASS) {
    let bonus = 0;
    if (otmp.blessed | 0 && ((ptr.mflags2 & 2) >>> 0 !== 0 || (ptr.mflags2 & 256) >>> 0 !== 0 || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224))) {
      bonus += rnd(4);
    }
    if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp === P_AXE && ptr === $sat(G.mons, 250)) {
      bonus += rnd(4);
    }
    if ((G.objects[otyp].oc_material | 0) === SILVER && mon_hates_silver(mon)) {
      bonus += rnd(20);
    }
    if (artifact_light(otmp) && otmp.lamplit | 0 && ptr === $sat(G.mons, 39)) {
      bonus += rnd(8);
    }
    if (bonus > 1 && otmp.oartifact && await spec_dbon(otmp, mon, 25) >= 25) {
      bonus = (bonus + 1) / 2 | 0;
    }
    tmp += bonus;
  }
  if (tmp > 0) {
    tmp -= (otmp.oeroded | 0) > (otmp.oeroded2 | 0) ? otmp.oeroded | 0 : otmp.oeroded2 | 0;
    if (tmp < 1) {
      tmp = 1;
    }
  }
  return tmp;
}

export async function special_dmgval(magr: struct_monst | null, mdef: struct_monst | null, armask: number, silverhit_p: Ptr | null): Promise<number> {
  let obj = null;
  let ptr = mdef.data;
  let left_ring = (armask & W_RINGL ? TRUE : FALSE) << 24 >> 24;
  let right_ring = (armask & W_RINGR ? TRUE : FALSE) << 24 >> 24;
  let silverhit = 0;
  let bonus = 0;
  obj = null;
  if (armask & (W_ARMC | W_ARM | W_ARMU)) {
    if ((armask & W_ARMC) !== 0 && !!(obj = await which_armor(magr, W_ARMC))) {
      armask = W_ARMC;
    } else if ((armask & W_ARM) !== 0 && !!(obj = await which_armor(magr, W_ARM))) {
      armask = W_ARM;
    } else if ((armask & W_ARMU) !== 0 && !!(obj = await which_armor(magr, W_ARMU))) {
      armask = W_ARMU;
    } else {
      armask = 0;
    }
  } else if (armask & (W_ARMG | W_RINGL | W_RINGR)) {
    armask = !!(obj = await which_armor(magr, W_ARMG)) ? W_ARMG : 0;
  } else {
    obj = await which_armor(magr, armask);
  }
  if (obj) {
    if (obj.blessed | 0 && ((ptr.mflags2 & 2) >>> 0 !== 0 || (ptr.mflags2 & 256) >>> 0 !== 0 || (mdef.cham === 222 || mdef.cham === 223 || mdef.cham === 224))) {
      bonus += rnd(4);
    }
    if ((G.objects[obj.otyp].oc_material | 0) === SILVER && mon_hates_silver(mdef)) {
      bonus += rnd(20);
      silverhit = silverhit | armask;
    }
  } else if ((left_ring || right_ring) && magr === G.youmonst) {
    if (left_ring && G.uleft) {
      if ((G.objects[G.uleft.otyp].oc_material | 0) === SILVER && mon_hates_silver(mdef)) {
        bonus += rnd(20);
        silverhit = silverhit | W_RINGL;
      }
    }
    if (right_ring && G.uright) {
      if ((G.objects[G.uright.otyp].oc_material | 0) === SILVER && mon_hates_silver(mdef)) {
        if (!(silverhit & W_RINGL)) {
          bonus += rnd(20);
        }
        silverhit = silverhit | W_RINGR;
      }
    }
  }
  if (silverhit_p) {
    silverhit_p.a[silverhit_p.o] = silverhit;
  }
  return bonus;
}

export async function silver_sears(magr: struct_monst | null, mdef: struct_monst | null, silverhit: number): Promise<void> {
  let rings = new Int8Array(20);
  let ltyp = G.uleft && (silverhit & W_RINGL) !== 0 ? G.uleft.otyp : STRANGE_OBJECT;
  let rtyp = G.uright && (silverhit & W_RINGR) !== 0 ? G.uright.otyp : STRANGE_OBJECT;
  let both = 0;
  let l_ag = ((G.objects[ltyp].oc_material | 0) === SILVER && G.uleft.dknown | 0 ? 1 : 0) << 24 >> 24;
  let r_ag = ((G.objects[rtyp].oc_material | 0) === SILVER && G.uright.dknown | 0 ? 1 : 0) << 24 >> 24;
  if ((silverhit & (W_RINGL | W_RINGR)) !== 0) {
    both = (ltyp === rtyp && (G.uleft.dknown | 0) === (G.uright.dknown | 0) || l_ag && r_ag ? 1 : 0) << 24 >> 24;
    sprintf(P(rings), S("ring%s"), both ? S("s") : S(""));
    await Your(S("%s%s %s %s!"), l_ag || r_ag ? S("silver ") : both ? S("") : (silverhit & W_RINGL) !== 0 ? S("left ") : S("right "), P(rings), vtense(P(rings), S("sear")), await mon_nam(mdef));
  }
}

async function oselect(mtmp: struct_monst | null, x: number): Promise<struct_obj | null> {
  let otmp = null;
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === x && !((x === CORPSE || x === EGG) && !($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9))) && (!otmp.oartifact || await touch_artifact(otmp, mtmp))) {
      return otmp;
    }
  }
  return null;
}

export async function select_rwep(mtmp: struct_monst | null): Promise<struct_obj | null> {
  let otmp = null;
  let mwep = null;
  let mweponly = 0;
  let i = 0;
  let mlet = mtmp.data.mlet;
  propellor = G.zeroobj;
  if (!!(otmp = await oselect(mtmp, 241))) {
    return otmp;
  }
  ;
  if (mlet === S_KOP) {
    if (!!(otmp = await oselect(mtmp, 262))) {
      return otmp;
    }
  }
  ;
  if ((mtmp.data.mflags2 & 134217728) >>> 0 !== 0) {
    if (!!(otmp = await oselect(mtmp, 448))) {
      return otmp;
    }
  }
  ;
  mwep = mtmp.mw;
  mweponly = (mwelded(mwep) && mtmp.weapon_check === NO_WEAPON_WANTED ? 1 : 0) << 24 >> 24;
  if (dist2(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) <= 13 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
    for (i = 0; i < (Math.trunc(52 / 4) | 0); ++i) {
      if (((mtmp.data.mflags2 & 67108864) >>> 0 !== 0 && (mtmp.misc_worn_check & W_ARMS) === 0 || !G.objects[pwep[i]].oc_big) && ((G.objects[pwep[i]].oc_material | 0) !== SILVER || !mon_hates_silver(mtmp))) {
        if (!!(otmp = await oselect(mtmp, pwep[i])) && (otmp === mwep || !mweponly)) {
          propellor = otmp;
          return otmp;
        }
      }
    }
  }
  for (i = 0; i < (Math.trunc(96 / 4) | 0); ++i) {
    let prop = 0;
    if (rwep[i] === DART && !((mtmp.data.mflags2 & 536870912) >>> 0 !== 0) && m_carrying(mtmp, SLING)) {
      for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
        if (otmp.oclass === GEM_CLASS && (otmp.otyp !== LOADSTONE || !otmp.cursed)) {
          propellor = m_carrying(mtmp, SLING);
          return otmp;
        }
      }
    }
    propellor = G.zeroobj;
    prop = G.objects[rwep[i]].oc_subtyp;
    if (prop < 0) {
      switch (-prop) {
      case P_BOW:
        propellor = await oselect(mtmp, YUMI);
        if (!propellor) {
          propellor = await oselect(mtmp, ELVEN_BOW);
        }
        if (!propellor) {
          propellor = await oselect(mtmp, BOW);
        }
        if (!propellor) {
          propellor = await oselect(mtmp, ORCISH_BOW);
        }
        break;
      case P_SLING:
        propellor = await oselect(mtmp, SLING);
        break;
      case P_CROSSBOW:
        propellor = await oselect(mtmp, CROSSBOW);
      }
      if ((otmp = mtmp.mw) && mwelded(otmp) && otmp !== propellor && mtmp.weapon_check === NO_WEAPON_WANTED) {
        propellor = null;
      }
    }
    if (!!propellor) {
      if (rwep[i] !== LOADSTONE) {
        if ((otmp = await oselect(mtmp, rwep[i])) && !otmp.oartifact && !(otmp === mtmp.mw && mwelded(otmp))) {
          return otmp;
        }
      } else {
        for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
          if (otmp.otyp === LOADSTONE && !otmp.cursed) {
            return otmp;
          }
        }
      }
    }
  }
  return null;
}

export function monmightthrowwep(obj: struct_obj | null): number {
  let idx = 0;
  for (idx = 0; idx < (Math.trunc(96 / 4) | 0); idx = idx + 1 << 16 >> 16) {
    if (obj.otyp === rwep[idx]) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function select_hwep(mtmp: struct_monst | null): Promise<struct_obj | null> {
  let otmp = null;
  let i = 0;
  let strong = ((mtmp.data.mflags2 & 67108864) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let wearing_shield = ((mtmp.misc_worn_check & W_ARMS) !== 0 ? 1 : 0) << 24 >> 24;
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === WEAPON_CLASS && otmp.oartifact && await touch_artifact(otmp, mtmp) && (strong && !wearing_shield || !G.objects[otmp.otyp].oc_big)) {
      return otmp;
    }
  }
  if ((mtmp.data.mflags2 & 8192) >>> 0 !== 0) {
    if (!!(otmp = await oselect(mtmp, 59))) {
      return otmp;
    }
  }
  ;
  for (i = 0; i < (Math.trunc(88 / 2) | 0); ++i) {
    if (hwep[i] === CORPSE && !(mtmp.misc_worn_check & W_ARMG) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0)) {
      continue;
    }
    if ((strong && !wearing_shield || !G.objects[hwep[i]].oc_big) && ((G.objects[hwep[i]].oc_material | 0) !== SILVER || !mon_hates_silver(mtmp))) {
      if (!!(otmp = await oselect(mtmp, hwep[i]))) {
        return otmp;
      }
    }
    ;
  }
  return null;
}

export async function possibly_unwield(mon: struct_monst | null, polyspot: number): Promise<void> {
  let obj = null;
  let mw_tmp = null;
  if (!(mw_tmp = mon.mw)) {
    return;
  }
  for (obj = mon.minvent; obj; obj = obj.nobj) {
    if (obj === mw_tmp) {
      break;
    }
  }
  if (!obj) {
    mon.mw = null;
    mon.weapon_check = NEED_WEAPON;
    return;
  }
  if (!attacktype(mon.data, AT_WEAP)) {
    await setmnotwielded(mon, mw_tmp);
    mon.weapon_check = NO_WEAPON_WANTED;
    await obj_extract_self(obj);
    if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
      await pline(S("%s drops %s."), await Monnam(mon), await distant_name(obj, doname));
      await newsym(mon.mx, mon.my);
    }
    if (!await flooreffects(obj, mon.mx, mon.my, S("drop"))) {
      if (polyspot) {
        bypass_obj(obj);
      }
      await place_object(obj, mon.mx, mon.my);
      await stackobj(obj);
    }
    return;
  }
  if (!(mwelded(mw_tmp) && mon.weapon_check === NO_WEAPON_WANTED)) {
    mon.weapon_check = NEED_WEAPON;
  }
  return;
}

export async function mon_wield_item(mon: struct_monst | null): Promise<number> {
  let obj = null;
  if (mon.weapon_check === NO_WEAPON_WANTED) {
    return 0;
  }
  switch (mon.weapon_check) {
  case NEED_HTH_WEAPON:
    obj = await select_hwep(mon);
    break;
  case NEED_RANGED_WEAPON:
    await select_rwep(mon);
    obj = propellor;
    break;
  case NEED_PICK_AXE:
    obj = m_carrying(mon, PICK_AXE);
    if (!obj && !await which_armor(mon, W_ARMS)) {
      obj = m_carrying(mon, DWARVISH_MATTOCK);
    }
    break;
  case NEED_AXE:
    obj = m_carrying(mon, BATTLE_AXE);
    if (!obj || await which_armor(mon, W_ARMS)) {
      obj = m_carrying(mon, AXE);
    }
    break;
  case NEED_PICK_OR_AXE:
    obj = m_carrying(mon, DWARVISH_MATTOCK);
    if (!obj) {
      obj = m_carrying(mon, BATTLE_AXE);
    }
    if (!obj || await which_armor(mon, W_ARMS)) {
      obj = m_carrying(mon, PICK_AXE);
      if (!obj) {
        obj = m_carrying(mon, AXE);
      }
    }
    break;
  default:
    await impossible(S("weapon_check %d for %s?"), mon.weapon_check, await mon_nam(mon));
    return 0;
  }
  if (obj && obj !== G.zeroobj) {
    let mw_tmp = mon.mw;
    if (mw_tmp && mw_tmp.otyp === obj.otyp) {
      mon.weapon_check = NEED_WEAPON;
      return 0;
    }
    if (mw_tmp && mwelded(mw_tmp)) {
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
        let welded_buf = new Int8Array(256);
        let mon_hand = mbodypart(mon, HAND);
        if ((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_big | 0) {
          mon_hand = await makeplural(mon_hand);
        }
        sprintf(P(welded_buf), S("%s welded to %s %s"), otense(mw_tmp, S("are")), G.genders[pronoun_gender(mon, 0)].his, mon_hand);
        if (obj.otyp === PICK_AXE) {
          await pline(S("Since %s weapon%s %s,"), s_suffix(await mon_nam(mon)), mw_tmp.quan === 1 ? S("") : S("s"), P(welded_buf));
          await pline(S("%s cannot wield that %s."), await mon_nam(mon), await xname(obj));
        } else {
          await pline(S("%s tries to wield %s."), await Monnam(mon), await doname(obj));
          await pline(S("%s %s!"), await Yname2(mw_tmp), P(welded_buf));
        }
        mw_tmp.bknown = 1;
      }
      mon.weapon_check = NO_WEAPON_WANTED;
      return 1;
    }
    mon.mw = obj;
    await setmnotwielded(mon, mw_tmp);
    mon.weapon_check = NEED_WEAPON;
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
      let newly_welded = 0;
      await pline(S("%s wields %s!"), await Monnam(mon), await doname(obj));
      obj.owornmask = obj.owornmask | W_WEP;
      newly_welded = mwelded(obj);
      obj.owornmask = obj.owornmask & ~W_WEP;
      if (newly_welded) {
        let mon_hand = mbodypart(mon, HAND);
        if ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0) {
          mon_hand = await makeplural(mon_hand);
        }
        await pline(S("%s %s to %s %s!"), await Tobjnam(obj, S("weld")), obj.quan !== 1 || obj.oartifact === 26 && !undiscovered_artifact(26) ? S("themselves") : S("itself"), s_suffix(await mon_nam(mon)), mon_hand);
        obj.bknown = 1;
      }
    }
    if (artifact_light(obj) && !obj.lamplit) {
      await begin_burn(obj, FALSE);
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
        await pline(S("%s %s in %s %s!"), await Tobjnam(obj, S("shine")), arti_light_description(obj), s_suffix(await mon_nam(mon)), mbodypart(mon, HAND));
      } else if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
        await pline(S("Light begins shining %s."), dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 5 * 5 ? S("nearby") : S("in the distance"));
      }
    }
    obj.owornmask = W_WEP;
    return 1;
  }
  mon.weapon_check = NEED_WEAPON;
  return 0;
}

export async function mwepgone(mon: struct_monst | null): Promise<void> {
  let mwep = mon.mw;
  if (mwep) {
    await setmnotwielded(mon, mwep);
    mon.weapon_check = NEED_WEAPON;
  }
}

export function abon(): number {
  let sbon = 0;
  let str = acurr(A_STR);
  let dex = acurr(A_DEX);
  if (G.u.umonnum !== G.u.umonster) {
    return adj_lev($sat(G.mons, G.u.umonnum)) - 3;
  }
  if (str < 6) {
    sbon = -2;
  } else if (str < 8) {
    sbon = -1;
  } else if (str < 17) {
    sbon = 0;
  } else if (str <= 18 + 50) {
    sbon = 1;
  } else if (str < 18 + 100) {
    sbon = 2;
  } else {
    sbon = 3;
  }
  sbon += G.u.ulevel < 3 ? 1 : 0;
  if (dex < 4) {
    return sbon - 3;
  } else if (dex < 6) {
    return sbon - 2;
  } else if (dex < 8) {
    return sbon - 1;
  } else if (dex < 14) {
    return sbon;
  } else {
    return sbon + dex - 14;
  }
}

export function dbon(): number {
  let str = acurr(A_STR);
  if (G.u.umonnum !== G.u.umonster) {
    return 0;
  }
  if (str < 6) {
    return -1;
  } else if (str < 16) {
    return 0;
  } else if (str < 18) {
    return 1;
  } else if (str === 18) {
    return 2;
  } else if (str <= 18 + 75) {
    return 3;
  } else if (str <= 18 + 90) {
    return 4;
  } else if (str < 18 + 100) {
    return 5;
  } else {
    return 6;
  }
}

export async function wet_a_towel(obj: struct_obj | null, amt: number, verbose: number): Promise<void> {
  let newspe = amt <= 0 ? obj.spe - amt : amt;
  if (newspe > obj.spe) {
    if (verbose) {
      let wetness = newspe < 3 ? !obj.spe ? S("damp") : S("damper") : !obj.spe ? S("wet") : S("wetter");
      if (obj.where === 3) {
        await pline(S("%s gets %s."), await Yobjnam2(obj, null), wetness);
      } else if (obj.where === 4 && ((obj.v.v_ocarry.wormno | 0 ? worm_known(obj.v.v_ocarry) : $rd(G.viz_array.a[G.viz_array.o + obj.v.v_ocarry.my], obj.v.v_ocarry.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && obj.v.v_ocarry && obj.v.v_ocarry.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + obj.v.v_ocarry.my], obj.v.v_ocarry.mx) & 1 ? 1 : 0) && ((!obj.v.v_ocarry.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !obj.v.v_ocarry.mundetected))) {
        await pline(S("%s %s gets %s."), s_suffix(await Monnam(obj.v.v_ocarry)), await xname(obj), wetness);
      }
    }
  }
  obj.spe = (newspe < 7 ? newspe : 7) << 24 >> 24;
  if (obj === G.uwep) {
    G.unweapon = (!(obj.otyp === 209 && obj.spe > 0) ? 1 : 0) << 24 >> 24;
  }
}

export async function dry_a_towel(obj: struct_obj | null, amt: number, verbose: number): Promise<void> {
  let newspe = amt <= 0 ? obj.spe + amt : amt;
  if (newspe < obj.spe) {
    if (verbose) {
      if (obj.where === 3) {
        await pline(S("%s dries%s."), await Yobjnam2(obj, null), !newspe ? S(" out") : S(""));
      } else if (obj.where === 4 && ((obj.v.v_ocarry.wormno | 0 ? worm_known(obj.v.v_ocarry) : $rd(G.viz_array.a[G.viz_array.o + obj.v.v_ocarry.my], obj.v.v_ocarry.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && obj.v.v_ocarry && obj.v.v_ocarry.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + obj.v.v_ocarry.my], obj.v.v_ocarry.mx) & 1 ? 1 : 0) && ((!obj.v.v_ocarry.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !obj.v.v_ocarry.mundetected))) {
        await pline(S("%s %s drie%s."), s_suffix(await Monnam(obj.v.v_ocarry)), await xname(obj), !newspe ? S(" out") : S(""));
      }
    }
  }
  newspe = newspe < 7 ? newspe : 7;
  obj.spe = (newspe > 0 ? newspe : 0) << 24 >> 24;
  if (obj === G.uwep) {
    G.unweapon = (!(obj.otyp === 209 && obj.spe > 0) ? 1 : 0) << 24 >> 24;
  }
}

export function skill_level_name(skill: number, buf: Ptr | null): Ptr | null {
  let ptr = null;
  switch (G.u.weapon_skills[skill].skill) {
  case P_UNSKILLED:
    ptr = S("Unskilled");
    break;
  case P_BASIC:
    ptr = S("Basic");
    break;
  case P_SKILLED:
    ptr = S("Skilled");
    break;
  case P_EXPERT:
    ptr = S("Expert");
    break;
  case P_MASTER:
    ptr = S("Master");
    break;
  case P_GRAND_MASTER:
    ptr = S("Grand Master");
    break;
  default:
    ptr = S("Unknown");
    break;
  }
  strcpy(buf, ptr);
  return buf;
}

export function skill_name(skill: number): Ptr | null {
  return skill_names_indices[skill] > 0 ? G.obj_descr[G.objects[skill_names_indices[skill]].oc_name_idx].oc_name : skill === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[skill]];
}

function slots_required(skill: number): number {
  let tmp = G.u.weapon_skills[skill].skill;
  if (skill <= P_UNICORN_HORN || skill === P_TWO_WEAPON_COMBAT) {
    return tmp;
  }
  return (tmp + 1) / 2 | 0;
}

export function can_advance(skill: number, speedy: number): number {
  if (G.u.weapon_skills[skill].skill === P_ISRESTRICTED || G.u.weapon_skills[skill].skill >= G.u.weapon_skills[skill].max_skill || G.u.skills_advanced >= P_SKILL_LIMIT) {
    return FALSE;
  }
  if (G.flags.debug && speedy) {
    return TRUE;
  }
  return (G.u.weapon_skills[skill].advance >= Math.imul(G.u.weapon_skills[skill].skill, G.u.weapon_skills[skill].skill) * 20 && G.u.weapon_slots >= slots_required(skill) ? 1 : 0) << 24 >> 24;
}

function could_advance(skill: number): number {
  if (G.u.weapon_skills[skill].skill === P_ISRESTRICTED || G.u.weapon_skills[skill].skill >= G.u.weapon_skills[skill].max_skill || G.u.skills_advanced >= P_SKILL_LIMIT) {
    return FALSE;
  }
  return (G.u.weapon_skills[skill].advance >= Math.imul(G.u.weapon_skills[skill].skill, G.u.weapon_skills[skill].skill) * 20 ? 1 : 0) << 24 >> 24;
}

function peaked_skill(skill: number): number {
  if (G.u.weapon_skills[skill].skill === P_ISRESTRICTED) {
    return FALSE;
  }
  return (G.u.weapon_skills[skill].skill >= G.u.weapon_skills[skill].max_skill && G.u.weapon_skills[skill].advance >= Math.imul(G.u.weapon_skills[skill].skill, G.u.weapon_skills[skill].skill) * 20 ? 1 : 0) << 24 >> 24;
}

async function skill_advance(skill: number): Promise<void> {
  let $t1: any;
  G.u.weapon_slots -= slots_required(skill);
  ($t1 = G.u.weapon_skills[skill], $t1.skill = $t1.skill + 1 << 24 >> 24);
  G.u.skill_record[G.u.skills_advanced++] = skill << 24 >> 24;
  await You(S("are now %s skilled in %s."), G.u.weapon_skills[skill].skill >= G.u.weapon_skills[skill].max_skill ? S("most") : S("more"), skill_names_indices[skill] > 0 ? G.obj_descr[G.objects[skill_names_indices[skill]].oc_name_idx].oc_name : skill === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[skill]]);
}

export async function enhance_weapon_skill(): Promise<number> {
  let pass = 0;
  let i = 0;
  let n = 0;
  let len = 0;
  let longest = 0;
  let to_advance = 0;
  let eventually_advance = 0;
  let maxxed_cnt = 0;
  let buf = new Int8Array(256);
  let sklnambuf = new Int8Array(256);
  let prefix = null;
  const selected = [null];
  let any = new union_any();
  let win = 0;
  let speedy = FALSE;
  if (G.flags.debug && await yn_function(S("Advance skills without practice?"), P(G.ynchars), 110) === 121) {
    speedy = TRUE;
  }
  do {
    to_advance = eventually_advance = maxxed_cnt = 0;
    for (longest = 0, i = 0; i < P_NUM_SKILLS; ++i) {
      if (G.u.weapon_skills[i].skill === P_ISRESTRICTED) {
        continue;
      }
      if ((len = strlen(skill_names_indices[i] > 0 ? G.obj_descr[G.objects[skill_names_indices[i]].oc_name_idx].oc_name : i === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[i]]) | 0) > longest) {
        longest = len;
      }
      if (can_advance(i, speedy)) {
        ++to_advance;
      } else if (could_advance(i)) {
        ++eventually_advance;
      } else if (peaked_skill(i)) {
        ++maxxed_cnt;
      }
    }
    win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    await G.windowprocs.win_start_menu(win);
    if (eventually_advance > 0 || maxxed_cnt > 0) {
      any.$cp(G.zeroany);
      if (eventually_advance > 0) {
        sprintf(P(buf), S("(Skill%s flagged by \"*\" may be enhanced %s.)"), eventually_advance === 1 ? S("") : S("s"), G.u.ulevel < MAXULEV ? S("when you're more experienced") : S("if skill slots become available"));
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
      }
      if (maxxed_cnt > 0) {
        sprintf(P(buf), S("(Skill%s flagged by \"#\" cannot be enhanced any further.)"), maxxed_cnt === 1 ? S("") : S("s"));
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
      }
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
    }
    for (pass = 0; pass < (Math.trunc(48 / 16) | 0); ++pass) {
      for (i = skill_ranges[pass].first; i <= skill_ranges[pass].last; ++i) {
        any.$cp(G.zeroany);
        if (i === skill_ranges[pass].first) {
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, skill_ranges[pass].name, MENU_UNSELECTED);
        }
        if (G.u.weapon_skills[i].skill === P_ISRESTRICTED) {
          continue;
        }
        if (can_advance(i, speedy)) {
          prefix = S("");
        } else if (could_advance(i)) {
          prefix = S("  * ");
        } else if (peaked_skill(i)) {
          prefix = S("  # ");
        } else {
          prefix = to_advance + eventually_advance + maxxed_cnt > 0 ? S("    ") : S("");
        }
        skill_level_name(i, P(sklnambuf));
        if (G.flags.debug) {
          if (!G.iflags.menu_tab_sep) {
            sprintf(P(buf), S(" %s%-*s %-12s %5d(%4d)"), prefix, longest, skill_names_indices[i] > 0 ? G.obj_descr[G.objects[skill_names_indices[i]].oc_name_idx].oc_name : i === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[i]], P(sklnambuf), G.u.weapon_skills[i].advance, Math.imul(G.u.weapon_skills[i].skill, G.u.weapon_skills[i].skill) * 20);
          } else {
            sprintf(P(buf), S(" %s%s\t%s\t%5d(%4d)"), prefix, skill_names_indices[i] > 0 ? G.obj_descr[G.objects[skill_names_indices[i]].oc_name_idx].oc_name : i === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[i]], P(sklnambuf), G.u.weapon_skills[i].advance, Math.imul(G.u.weapon_skills[i].skill, G.u.weapon_skills[i].skill) * 20);
          }
        } else {
          if (!G.iflags.menu_tab_sep) {
            sprintf(P(buf), S(" %s %-*s [%s]"), prefix, longest, skill_names_indices[i] > 0 ? G.obj_descr[G.objects[skill_names_indices[i]].oc_name_idx].oc_name : i === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[i]], P(sklnambuf));
          } else {
            sprintf(P(buf), S(" %s%s\t[%s]"), prefix, skill_names_indices[i] > 0 ? G.obj_descr[G.objects[skill_names_indices[i]].oc_name_idx].oc_name : i === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[i]], P(sklnambuf));
          }
        }
        any.a_int = can_advance(i, speedy) ? i + 1 : 0;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
      }
    }
    strcpy(P(buf), to_advance > 0 ? S("Pick a skill to advance:") : S("Current skills:"));
    if (G.flags.debug && !speedy) {
      sprintf(eos(P(buf)), S("  (%d slot%s available)"), G.u.weapon_slots, G.u.weapon_slots === 1 ? S("") : S("s"));
    }
    await G.windowprocs.win_end_menu(win, P(buf));
    n = await G.windowprocs.win_select_menu(win, to_advance ? PICK_ONE : PICK_NONE, P(selected, 0));
    await G.windowprocs.win_destroy_nhwindow(win);
    if (n > 0) {
      n = selected[0].item.a_int - 1;
      free(selected[0]);
      await skill_advance(n);
      for (n = i = 0; i < P_NUM_SKILLS; ++i) {
        if (can_advance(i, speedy)) {
          if (!speedy) {
            await You_feel(S("you could be more dangerous!"));
          }
          ++n;
          break;
        }
      }
    }
  } while (speedy && n > 0);
  return 0;
}

export function unrestrict_weapon_skill(skill: number): void {
  if (skill < P_NUM_SKILLS && G.u.weapon_skills[skill].skill === P_ISRESTRICTED) {
    G.u.weapon_skills[skill].skill = P_UNSKILLED;
    G.u.weapon_skills[skill].max_skill = P_BASIC;
    G.u.weapon_skills[skill].advance = 0;
  }
}

export async function use_skill(skill: number, degree: number): Promise<void> {
  let $t1: any;
  let advance_before = 0;
  if (skill !== P_NONE && !(G.u.weapon_skills[skill].skill === P_ISRESTRICTED)) {
    advance_before = can_advance(skill, FALSE);
    ($t1 = G.u.weapon_skills[skill], $t1.advance = $t1.advance + degree & 0xffff);
    if (!advance_before && can_advance(skill, FALSE)) {
      await give_may_advance_msg(skill);
    }
  }
}

export async function add_weapon_skill(n: number): Promise<void> {
  let i = 0;
  let before = 0;
  let after = 0;
  for (i = 0, before = 0; i < P_NUM_SKILLS; ++i) {
    if (can_advance(i, FALSE)) {
      ++before;
    }
  }
  G.u.weapon_slots += n;
  for (i = 0, after = 0; i < P_NUM_SKILLS; ++i) {
    if (can_advance(i, FALSE)) {
      ++after;
    }
  }
  if (before < after) {
    await give_may_advance_msg(P_NONE);
  }
}

export async function lose_weapon_skill(n: number): Promise<void> {
  let $t1: any;
  let skill = 0;
  while (--n >= 0) {
    if (G.u.weapon_slots) {
      --G.u.weapon_slots;
    } else if (G.u.skills_advanced) {
      skill = G.u.skill_record[--G.u.skills_advanced];
      if (G.u.weapon_skills[skill].skill <= P_UNSKILLED) {
        await panic(S("lose_weapon_skill (%d)"), skill);
      }
      ($t1 = G.u.weapon_skills[skill], $t1.skill = $t1.skill - 1 << 24 >> 24);
      G.u.weapon_slots = slots_required(skill) - 1;
    }
  }
}

export function weapon_type(obj: struct_obj | null): number {
  let type = 0;
  if (!obj) {
    return P_BARE_HANDED_COMBAT;
  }
  if (obj.oclass !== WEAPON_CLASS && obj.oclass !== TOOL_CLASS && obj.oclass !== GEM_CLASS) {
    return P_NONE;
  }
  type = G.objects[obj.otyp].oc_subtyp;
  return type < 0 ? -type : type;
}

export function uwep_skill_type(): number {
  if (G.u.twoweap) {
    return P_TWO_WEAPON_COMBAT;
  }
  return weapon_type(G.uwep);
}

export async function weapon_hit_bonus(weapon: struct_obj | null): Promise<number> {
  let type = 0;
  let wep_type = 0;
  let skill = 0;
  let bonus = 0;
  wep_type = weapon_type(weapon);
  type = G.u.twoweap && (weapon === G.uwep || weapon === G.uswapwep) ? P_TWO_WEAPON_COMBAT : wep_type;
  if (type === P_NONE) {
    bonus = 0;
  } else if (type <= P_UNICORN_HORN) {
    switch (G.u.weapon_skills[type].skill) {
    default:
      await impossible(P(weapon_hit_bonus$bad_skill), G.u.weapon_skills[type].skill);
    case P_ISRESTRICTED:
    case P_UNSKILLED:
      bonus = -4;
      break;
    case P_BASIC:
      bonus = 0;
      break;
    case P_SKILLED:
      bonus = 2;
      break;
    case P_EXPERT:
      bonus = 3;
      break;
    }
  } else if (type === P_TWO_WEAPON_COMBAT) {
    skill = G.u.weapon_skills[P_TWO_WEAPON_COMBAT].skill;
    if (G.u.weapon_skills[wep_type].skill < skill) {
      skill = G.u.weapon_skills[wep_type].skill;
    }
    switch (skill) {
    default:
      await impossible(P(weapon_hit_bonus$bad_skill), skill);
    case P_ISRESTRICTED:
    case P_UNSKILLED:
      bonus = -9;
      break;
    case P_BASIC:
      bonus = -7;
      break;
    case P_SKILLED:
      bonus = -5;
      break;
    case P_EXPERT:
      bonus = -3;
      break;
    }
  } else if (type === P_BARE_HANDED_COMBAT) {
    bonus = G.u.weapon_skills[type].skill;
    bonus = (bonus > P_UNSKILLED ? bonus : P_UNSKILLED) - 1;
    bonus = Math.imul(bonus + 2, G.urole.malenum === 339 || G.urole.malenum === 334 ? 2 : 1) / 2 | 0;
  }
  if (G.u.usteed) {
    switch (G.u.weapon_skills[P_RIDING].skill) {
    case P_ISRESTRICTED:
    case P_UNSKILLED:
      bonus -= 2;
      break;
    case P_BASIC:
      bonus -= 1;
      break;
    case P_SKILLED:
      break;
    case P_EXPERT:
      break;
    }
    if (G.u.twoweap) {
      bonus -= 2;
    }
  }
  return bonus;
}

export async function weapon_dam_bonus(weapon: struct_obj | null): Promise<number> {
  let type = 0;
  let wep_type = 0;
  let skill = 0;
  let bonus = 0;
  wep_type = weapon_type(weapon);
  type = G.u.twoweap && (weapon === G.uwep || weapon === G.uswapwep) ? P_TWO_WEAPON_COMBAT : wep_type;
  if (type === P_NONE) {
    bonus = 0;
  } else if (type <= P_UNICORN_HORN) {
    switch (G.u.weapon_skills[type].skill) {
    default:
      await impossible(S("weapon_dam_bonus: bad skill %d"), G.u.weapon_skills[type].skill);
    case P_ISRESTRICTED:
    case P_UNSKILLED:
      bonus = -2;
      break;
    case P_BASIC:
      bonus = 0;
      break;
    case P_SKILLED:
      bonus = 1;
      break;
    case P_EXPERT:
      bonus = 2;
      break;
    }
  } else if (type === P_TWO_WEAPON_COMBAT) {
    skill = G.u.weapon_skills[P_TWO_WEAPON_COMBAT].skill;
    if (G.u.weapon_skills[wep_type].skill < skill) {
      skill = G.u.weapon_skills[wep_type].skill;
    }
    switch (skill) {
    default:
    case P_ISRESTRICTED:
    case P_UNSKILLED:
      bonus = -3;
      break;
    case P_BASIC:
      bonus = -1;
      break;
    case P_SKILLED:
      bonus = 0;
      break;
    case P_EXPERT:
      bonus = 1;
      break;
    }
  } else if (type === P_BARE_HANDED_COMBAT) {
    bonus = G.u.weapon_skills[type].skill;
    bonus = (bonus > P_UNSKILLED ? bonus : P_UNSKILLED) - 1;
    bonus = Math.imul(bonus + 1, G.urole.malenum === 339 || G.urole.malenum === 334 ? 3 : 1) / 2 | 0;
  }
  if (G.u.usteed && type !== P_TWO_WEAPON_COMBAT) {
    switch (G.u.weapon_skills[P_RIDING].skill) {
    case P_ISRESTRICTED:
    case P_UNSKILLED:
      break;
    case P_BASIC:
      break;
    case P_SKILLED:
      bonus += 1;
      break;
    case P_EXPERT:
      bonus += 2;
      break;
    }
  }
  return bonus;
}

export async function skill_init(class_skill: struct_def_skill | null): Promise<void> {
  let obj = null;
  let skmax = 0;
  let skill = 0;
  for (skill = 0; skill < P_NUM_SKILLS; ++skill) {
    G.u.weapon_skills[skill].skill = P_ISRESTRICTED;
    G.u.weapon_skills[skill].max_skill = P_ISRESTRICTED;
    G.u.weapon_skills[skill].advance = 0;
  }
  for (obj = G.invent; obj; obj = obj.nobj) {
    if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
      continue;
    }
    skill = weapon_type(obj);
    if (skill !== P_NONE) {
      G.u.weapon_skills[skill].skill = P_BASIC;
    }
  }
  if (G.urole.malenum === 332 || G.urole.malenum === 334) {
    G.u.weapon_skills[P_HEALING_SPELL].skill = P_BASIC;
  } else if (G.urole.malenum === 335) {
    G.u.weapon_skills[P_CLERIC_SPELL].skill = P_BASIC;
  } else if (G.urole.malenum === 342) {
    G.u.weapon_skills[P_ATTACK_SPELL].skill = P_BASIC;
    G.u.weapon_skills[P_ENCHANTMENT_SPELL].skill = P_BASIC;
  }
  for (; class_skill.skill !== P_NONE; class_skill = $sadd(class_skill, 1)) {
    skmax = class_skill.skmax;
    skill = class_skill.skill;
    G.u.weapon_skills[skill].max_skill = skmax << 24 >> 24;
    if (G.u.weapon_skills[skill].skill === P_ISRESTRICTED) {
      G.u.weapon_skills[skill].skill = P_UNSKILLED;
    }
  }
  if (G.u.weapon_skills[P_BARE_HANDED_COMBAT].max_skill > P_EXPERT) {
    G.u.weapon_skills[P_BARE_HANDED_COMBAT].skill = P_BASIC;
  }
  if (G.urole.petnum === PM_PONY) {
    G.u.weapon_skills[P_RIDING].skill = P_BASIC;
  }
  for (skill = 0; skill < P_NUM_SKILLS; ++skill) {
    if (!(G.u.weapon_skills[skill].skill === P_ISRESTRICTED)) {
      if (G.u.weapon_skills[skill].max_skill < G.u.weapon_skills[skill].skill) {
        await impossible(S("skill_init: curr > max: %s"), skill_names_indices[skill] > 0 ? G.obj_descr[G.objects[skill_names_indices[skill]].oc_name_idx].oc_name : skill === P_BARE_HANDED_COMBAT ? barehands_or_martial[G.urole.malenum === 339 || G.urole.malenum === 334 ? 1 : 0] : odd_skill_names[-skill_names_indices[skill]]);
        G.u.weapon_skills[skill].max_skill = G.u.weapon_skills[skill].skill;
      }
      G.u.weapon_skills[skill].advance = Math.imul(G.u.weapon_skills[skill].skill - 1, G.u.weapon_skills[skill].skill - 1) * 20 & 0xffff;
    }
  }
  unrestrict_weapon_skill(spell_skilltype(G.urole.spelspec));
}

export async function setmnotwielded(mon: struct_monst | null, obj: struct_obj | null): Promise<void> {
  if (!obj) {
    return;
  }
  if (artifact_light(obj) && obj.lamplit | 0) {
    await end_burn(obj, FALSE);
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
      await pline(S("%s in %s %s %s shining."), await The(await xname(obj)), s_suffix(await mon_nam(mon)), mbodypart(mon, HAND), otense(obj, S("stop")));
    }
  }
  if (mon.mw === obj) {
    mon.mw = null;
  }
  obj.owornmask = obj.owornmask & ~W_WEP;
}

export function $init(): void {
  skill_names_indices = $ta(Int16Array, 39, [0, DAGGER, KNIFE, AXE, PICK_AXE, SHORT_SWORD, BROADSWORD, LONG_SWORD, TWO_HANDED_SWORD, SCIMITAR, PN_SABER, CLUB, MACE, MORNING_STAR, FLAIL, PN_HAMMER, QUARTERSTAFF, PN_POLEARMS, SPEAR, TRIDENT, LANCE, BOW, SLING, CROSSBOW, DART, SHURIKEN, BOOMERANG, PN_WHIP, UNICORN_HORN, PN_ATTACK_SPELL, PN_HEALING_SPELL, PN_DIVINATION_SPELL, PN_ENCHANTMENT_SPELL, PN_CLERIC_SPELL, PN_ESCAPE_SPELL, PN_MATTER_SPELL, PN_BARE_HANDED, PN_TWO_WEAPONS, PN_RIDING]);
  odd_skill_names = [S("no skill"),
S("bare hands"),
S("two weapon combat"),
S("riding"),
S("polearms"),
S("saber"),
S("hammer"),
S("whip"),
S("attack spells"),
S("healing spells"),
S("divination spells"),
S("enchantment spells"),
S("clerical spells"),
S("escape spells"),
S("matter spells")];
  barehands_or_martial = [S("bare handed combat"), S("martial arts")];
  kebabable = $ta(Int8Array, 6, [S_XORN, S_DRAGON, S_JABBERWOCK, S_NAGA, S_GIANT]);
  rwep = $ta(Int32Array, 24, [DWARVISH_SPEAR, SILVER_SPEAR, ELVEN_SPEAR, SPEAR, ORCISH_SPEAR, JAVELIN, SHURIKEN, YA, SILVER_ARROW, ELVEN_ARROW, ARROW, ORCISH_ARROW, CROSSBOW_BOLT, SILVER_DAGGER, ELVEN_DAGGER, DAGGER, ORCISH_DAGGER, KNIFE, FLINT, ROCK, LOADSTONE, LUCKSTONE, DART, CREAM_PIE]);
  pwep = $ta(Int32Array, 13, [HALBERD, BARDICHE, SPETUM, BILL_GUISARME, VOULGE, RANSEUR, GUISARME, GLAIVE, LUCERN_HAMMER, BEC_DE_CORBIN, FAUCHARD, PARTISAN, LANCE]);
  propellor = null;
  hwep = $ta(Int16Array, 44, [CORPSE, TSURUGI, RUNESWORD, DWARVISH_MATTOCK, TWO_HANDED_SWORD, BATTLE_AXE, KATANA, UNICORN_HORN, CRYSKNIFE, TRIDENT, LONG_SWORD, ELVEN_BROADSWORD, BROADSWORD, SCIMITAR, SILVER_SABER, MORNING_STAR, ELVEN_SHORT_SWORD, DWARVISH_SHORT_SWORD, SHORT_SWORD, ORCISH_SHORT_SWORD, MACE, AXE, DWARVISH_SPEAR, SILVER_SPEAR, ELVEN_SPEAR, SPEAR, ORCISH_SPEAR, FLAIL, BULLWHIP, QUARTERSTAFF, JAVELIN, AKLYS, CLUB, PICK_AXE, RUBBER_HOSE, WAR_HAMMER, SILVER_DAGGER, ELVEN_DAGGER, DAGGER, ORCISH_DAGGER, ATHAME, SCALPEL, KNIFE, WORM_TOOTH]);
  skill_ranges = $sarrOf([struct_skill_range.$of(P_BARE_HANDED_COMBAT, P_RIDING, S("Fighting Skills")), struct_skill_range.$of(P_DAGGER, P_UNICORN_HORN, S("Weapon Skills")), struct_skill_range.$of(P_ATTACK_SPELL, P_MATTER_SPELL, S("Spellcasting Skills"))]);
  weapon_hit_bonus$bad_skill = $cs("weapon_hit_bonus: bad skill %d", 31);
}
