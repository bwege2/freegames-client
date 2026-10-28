// @ts-nocheck
// NetHack 3.6.7 artifact.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { next_to_u } from './apply.ts';
import { exercise } from './attrib.ts';
import { enlightenment, isok } from './cmd.ts';
import { use_crystal_ball } from './detect.ts';
import { glyph_at, map_invisible, newsym, see_monsters, shieldeff } from './display.ts';
import { dropx, goto_level } from './do.ts';
import { Monnam, hcolor, mon_nam, oname } from './do_name.ts';
import { hitfloor } from './dothrow.ts';
import { depth } from './dungeon.ts';
import { surface } from './engrave.ts';
import { losexp } from './exper.ts';
import { losehp, nomul, spoteffects } from './hack.ts';
import { dist2, s_suffix, sgn, strncmpi, upstart } from './hacklib.ts';
import { freeinv, getobj, hold_another_object, nxtobj, update_inventory } from './invent.ts';
import { monhp_per_lvl } from './makemon.ts';
import { bcsign, mksobj, uncurse, weight } from './mkobj.ts';
import { wake_nearto } from './mon.ts';
import { attacktype, hates_silver, resists_drli, sticks } from './mondata.ts';
import { monflee } from './monmove.ts';
import { obj_shuffle_range } from './o_init.ts';
import { The, Tobjnam, aobjnam, bare_artifactname, distant_name, killer_xname, otense, simple_typename, the, vtense, xname, yname } from './objnam.ts';
import { clr2colorname } from './options.ts';
import { You, You_cant, You_feel, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart } from './polyself.ts';
import { healup, make_blinded, make_confused, make_hallucinated, make_sick, make_slimed, make_stunned } from './potion.ts';
import { align_str, mon_aligntyp } from './priest.ts';
import { recharge, seffects } from './read.ts';
import { mread } from './restore.ts';
import { d, rn2, rnd, rnz } from './rnd.ts';
import { getrumor } from './rumors.ts';
import { bwrite } from './save.ts';
import { remove_worn_item } from './steal.ts';
import { dismount_steed } from './steed.ts';
import { level_tele } from './teleport.ts';
import { burn_away_slime } from './timeout.ts';
import { float_down, float_up, selftouch, t_at, untrap } from './trap.ts';
import { worm_known } from './worm.ts';
import { bypass_obj, clear_bypasses, nxt_unbypassed_obj, which_armor } from './worn.ts';
import { cancel_monst, destroy_mitem, probe_monster, resist } from './zap.ts';
import { struct_abil2adtyp_tag, struct_abil2spfx_tag, struct_artifact, struct_attack, struct_d_level, struct_monst, struct_obj, struct_prop, union_any } from './structs.ts';
import { $at2, $cs, $peq, $rd, $sadd, $sarrOf, $sat, $sdiff, $sidx, $ta, $u64, $wr, G, P, S, free, memset, sprintf, strcat, strcmp, strcpy } from './rt/index.ts';
import { AD_COLD, AD_DISN, AD_DRLI, AD_DRST, AD_ELEC, AD_FIRE, AD_MAGM, AD_PHYS, AD_STUN, ALLOW_COUNT, ALL_CLASSES, ALTAR, ANTIMAGIC, ARROW, ART_EXCALIBUR, ART_GRIMTOOTH, ART_MASTER_KEY_OF_THIEVERY, ART_ORCRIST, ART_STING, ART_STORMBRINGER, ART_SUNSWORD, ART_TSURUGI_OF_MURAMASA, ART_VORPAL_BLADE, ATR_NONE, AT_MAGC, A_CON, A_NONE, A_WIS, BLINDED, CHARGE_OBJ, COLD_RES, CONFLICT, CONFUSION, CREATE_AMMO, CREATE_PORTAL, CRYSTAL_BALL, DETECT_MONSTERS, DISINT_RES, DISMOUNT_THROWN, DOOR, DRAIN_RES, D_TRAPPED, ENERGY_BOOST, ENERGY_REGENERATION, ENLIGHTENING, ENL_GAMEINPROGRESS, FALSE, FATAL_DAMAGE_MODIFIER, FIRE_RES, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, HEALING, INFRAVISION, INVIS, I_SPECIAL, KILLED_BY, LAST_PROP, LEASH, LEVITATION, LEV_TELE, LOW_PM, LUCKSTONE, M2_UNDEAD, M2_WERE, MAGICENLIGHTENMENT, MB_INDEX_CANCEL, MB_INDEX_PROBE, MB_INDEX_SCARE, MB_INDEX_STUN, MB_MAX_DIEROLL, MENU_UNSELECTED, NECK, NHW_MENU, NON_PM, NOTELL, NO_GLYPH, NROFARTIFACTS, NUM_OBJECTS, PICK_ONE, PM_CLAY_GOLEM, PM_JABBERWOCK, PM_ROGUE, PM_WATER_ELEMENTAL, POISON_RES, POTION_CLASS, PROTECTION, REFLECTING, REGENERATION, RING_CLASS, RIN_INCREASE_DAMAGE, SCROLL_CLASS, SCR_TAMING, SEARCHING, SEE_INVIS, SHOCK_RES, SICK, SICK_ALL, SILVER, SLIMED, SPBOOK_CLASS, SPFX_ATTK, SPFX_BEHEAD, SPFX_DALIGN, SPFX_DBONUS, SPFX_DCLAS, SPFX_DFLAG1, SPFX_DFLAG2, SPFX_DMONS, SPFX_DRLI, SPFX_EREGEN, SPFX_ESP, SPFX_HALRES, SPFX_HPHDAM, SPFX_HSPDAM, SPFX_INTEL, SPFX_LUCK, SPFX_NOGEN, SPFX_PROTECT, SPFX_REFLECT, SPFX_REGEN, SPFX_RESTR, SPFX_SEARCH, SPFX_SPEAK, SPFX_STLTH, SPFX_TCTRL, SPFX_WARN, SPFX_XRAY, STEALTH, STONE_RES, STUNNED, S_DRAGON, S_GHOST, S_GOLEM, S_OGRE, S_TROLL, S_VORTEX, S_arrow_trap, TAMING, TELEPAT, TELEPORT_CONTROL, TIMEOUT, TOOL_CLASS, TRAPNUM, TRUE, UNTRAP, WAND_CLASS, WARNING, WARN_OF_MON, WEAPON_CLASS, WIN_ERR, W_AMUL, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMS, W_ARMU, W_ART, W_ARTI, W_BALL, W_QUIVER, W_RINGL, W_RINGR, W_SADDLE, W_SWAPWEP, W_TOOL, W_WEP } from './consts.ts';

let artilist: any;
let spec_dbon_applies: number;
let artiexist: any;
let artidisco: any;
let touch_blasted: number;
let mb_verb: any;
let recharge_type: any;
let invoke_types: any;
let glow_verbs: any;
let mkot_trap_warn_count: number;
let artifact_hit$you: any;
let artifact_hit$behead_msg: any;
let abil_to_spfx$abil2spfx: any;
let glow_verb$resbuf: any;
let retouch_equipment$nesting: number;
let mkot_trap_warn$heat: any;

function hack_artifacts(): void {
  let art = null;
  let alignmnt = G.aligns[G.flags.initalign].value;
  for (art = $sadd(artilist[0], 1); art.otyp; art = $sadd(art, 1)) {
    if (art.role === G.urole.malenum && art.alignment !== A_NONE) {
      art.alignment = alignmnt << 24 >> 24;
    }
  }
  if (!(G.urole.malenum === 333)) {
    artilist[ART_EXCALIBUR].role = NON_PM;
  }
  if (G.urole.questarti) {
    artilist[G.urole.questarti].alignment = alignmnt << 24 >> 24;
    artilist[G.urole.questarti].role = G.urole.malenum;
  }
  return;
}

export function init_artifacts(): void {
  memset(P(artiexist), 0, 35);
  memset(P(artidisco), 0, 33);
  hack_artifacts();
}

export async function save_artifacts(fd: number): Promise<void> {
  await bwrite(fd, P(artiexist), 35);
  await bwrite(fd, P(artidisco), 33);
}

export async function restore_artifacts(fd: number): Promise<void> {
  await mread(fd, P(artiexist), 35);
  await mread(fd, P(artidisco), 33);
  hack_artifacts();
}

export function artiname(artinum: number): Ptr | null {
  if (artinum <= 0 || artinum > NROFARTIFACTS) {
    return S("");
  }
  return artilist[artinum].name;
}

export async function mk_artifact(otmp: struct_obj | null, alignment: number): Promise<struct_obj | null> {
  let a = null;
  let m = 0;
  let n = 0;
  let altn = 0;
  let by_align = (alignment !== A_NONE ? 1 : 0) << 24 >> 24;
  let o_typ = (by_align || !otmp ? 0 : otmp.otyp) << 16 >> 16;
  let unique = (!by_align && otmp && G.objects[o_typ].oc_unique | 0 ? 1 : 0) << 24 >> 24;
  let eligible = new Int16Array(33);
  n = altn = 0;
  eligible[0] = 0;
  for (m = 1, a = $sat(artilist, m); a.otyp; a = $sadd(a, 1), ++m) {
    if (artiexist[m]) {
      continue;
    }
    if ((a.spfx & SPFX_NOGEN) >>> 0 || unique) {
      continue;
    }
    if (!by_align) {
      if (a.otyp === o_typ) {
        eligible[n++] = m << 16 >> 16;
      }
      continue;
    }
    if ((a.alignment === alignment || a.alignment === A_NONE) && (a.race === NON_PM || !(($sat(G.mons, a.race).mflags2 & $u64(G.urace.hatemask)) >>> 0 !== 0))) {
      if (G.urole.malenum === a.role) {
        eligible[0] = m << 16 >> 16;
        n = 1;
        break;
      }
      if (a.alignment !== A_NONE || G.u.ugifts > 0) {
        eligible[n++] = m << 16 >> 16;
      } else {
        if (!n) {
          eligible[altn++] = m << 16 >> 16;
        }
      }
    }
  }
  if (!n) {
    n = altn;
  }
  if (n) {
    m = eligible[rn2(n)];
    a = $sat(artilist, m);
    if (by_align) {
      otmp = await mksobj(a.otyp, TRUE, FALSE);
    }
    if (otmp) {
      otmp = await oname(otmp, a.name);
      otmp.oartifact = m << 24 >> 24;
      artiexist[m] = TRUE;
    }
  } else {
    if (by_align) {
      otmp = null;
    }
  }
  return otmp;
}

export function artifact_name(name: Ptr | null, otyp: Ptr | null): Ptr | null {
  let a = null;
  let aname = null;
  if (!strncmpi(name, S("the "), 4)) {
    name = name.add(4);
  }
  for (a = $sadd(artilist[0], 1); a.otyp; a = $sadd(a, 1)) {
    aname = a.name;
    if (!strncmpi(aname, S("the "), 4)) {
      aname = aname.add(4);
    }
    if (!strncmpi(name, aname, -1)) {
      otyp.a[otyp.o] = a.otyp;
      return a.name;
    }
  }
  return null;
}

export function exist_artifact(otyp: number, name: Ptr | null): number {
  let a = null;
  let arex = null;
  if (otyp && name.a[name.o]) {
    for (a = $sadd(artilist[0], 1), arex = P(artiexist).add(1); a.otyp; a = $sadd(a, 1), arex = arex.add(1)) {
      if (a.otyp === otyp && !strcmp(a.name, name)) {
        return arex.a[arex.o];
      }
    }
  }
  return FALSE;
}

export function artifact_exists(otmp: struct_obj | null, name: Ptr | null, mod: number): void {
  let a = null;
  if (otmp && name.a[name.o]) {
    for (a = $sadd(artilist[0], 1); a.otyp; a = $sadd(a, 1)) {
      if (a.otyp === otmp.otyp && !strcmp(a.name, name)) {
        let m = $sdiff(a, artilist[0]) | 0;
        otmp.oartifact = (mod ? m : 0) << 24 >> 24;
        otmp.age = 0;
        if (otmp.otyp === RIN_INCREASE_DAMAGE) {
          otmp.spe = 0;
        }
        artiexist[m] = mod;
        break;
      }
    }
  }
  return;
}

export function nartifact_exist(): number {
  let a = 0;
  let n = Math.trunc(35 / 1) | 0;
  while (n > 1) {
    if (artiexist[--n]) {
      ++a;
    }
  }
  return a;
}

export function spec_ability(otmp: struct_obj | null, abil: number): number {
  let arti = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  return (arti && (arti.spfx & abil) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
}

export function confers_luck(obj: struct_obj | null): number {
  if (obj.otyp === LUCKSTONE) {
    return TRUE;
  }
  return (obj.oartifact && spec_ability(obj, SPFX_LUCK) ? 1 : 0) << 24 >> 24;
}

export function arti_reflects(obj: struct_obj | null): number {
  let arti = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
  if (arti) {
    if (obj.owornmask & ~W_ART && (arti.spfx & SPFX_REFLECT) >>> 0) {
      return TRUE;
    }
    if ((arti.cspfx & SPFX_REFLECT) >>> 0) {
      return TRUE;
    }
  }
  return FALSE;
}

export function shade_glare(obj: struct_obj | null): number {
  let arti = null;
  if ((G.objects[obj.otyp].oc_material | 0) === SILVER) {
    return TRUE;
  }
  arti = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
  if (arti && (arti.spfx & SPFX_DFLAG2) >>> 0 && arti.mtype === M2_UNDEAD) {
    return TRUE;
  }
  return FALSE;
}

export function restrict_name(otmp: struct_obj | null, name: Ptr | null): number {
  let a = null;
  let aname = null;
  let odesc = null;
  let other = null;
  let sametype = new Int8Array(454);
  let i = 0;
  const lo = new Int32Array(1);
  const hi = new Int32Array(1);
  let otyp = otmp.otyp;
  let ocls = G.objects[otyp].oc_class;
  if (!name.a[name.o]) {
    return FALSE;
  }
  if (!strncmpi(name, S("the "), 4)) {
    name = name.add(4);
  }
  memset(P(sametype), 0, 454);
  sametype[otyp] = TRUE;
  if (!G.objects[otyp].oc_name_known && !!(odesc = G.obj_descr[G.objects[otyp].oc_descr_idx].oc_descr)) {
    obj_shuffle_range(otyp, P(lo, 0), P(hi, 0));
    for (i = G.bases[ocls]; i < NUM_OBJECTS; ++i) {
      if (G.objects[i].oc_class !== ocls) {
        break;
      }
      if (!G.objects[i].oc_name_known && !!(other = G.obj_descr[G.objects[i].oc_descr_idx].oc_descr) && (!strcmp(odesc, other) || i >= lo[0] && i <= hi[0])) {
        sametype[i] = TRUE;
      }
    }
  }
  for (a = $sadd(artilist[0], 1); a.otyp; a = $sadd(a, 1)) {
    if (!sametype[a.otyp]) {
      continue;
    }
    aname = a.name;
    if (!strncmpi(aname, S("the "), 4)) {
      aname = aname.add(4);
    }
    if (!strcmp(aname, name)) {
      return ((a.spfx & (SPFX_NOGEN | SPFX_RESTR)) >>> 0 !== 0 || otmp.quan > 1 ? 1 : 0) << 24 >> 24;
    }
  }
  return FALSE;
}

function attacks(adtyp: number, otmp: struct_obj | null): number {
  let weap = null;
  if (!!(weap = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null)) {
    return (weap.attk.adtyp === adtyp ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export function defends(adtyp: number, otmp: struct_obj | null): number {
  let weap = null;
  if (!!(weap = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null)) {
    return (weap.defn.adtyp === adtyp ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export function defends_when_carried(adtyp: number, otmp: struct_obj | null): number {
  let weap = null;
  if (!!(weap = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null)) {
    return (weap.cary.adtyp === adtyp ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export function protects(otmp: struct_obj | null, being_worn: number): number {
  let arti = null;
  if (being_worn && G.objects[otmp.otyp].oc_oprop === PROTECTION) {
    return TRUE;
  }
  arti = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  if (!arti) {
    return FALSE;
  }
  return ((arti.cspfx & SPFX_PROTECT) >>> 0 !== 0 || being_worn && (arti.spfx & SPFX_PROTECT) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
}

export async function set_artifact_intrinsic(otmp: struct_obj | null, on: number, wp_mask: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any, $t15: any, $t16: any, $t17: any, $t18: any, $t19: any, $t20: any, $t21: any, $t22: any, $t23: any, $t24: any;
  let mask = null;
  let art = null;
  let oart = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  let obj = null;
  let dtyp = 0;
  let spfx = 0;
  if (!oart) {
    return;
  }
  dtyp = (wp_mask !== W_ART ? oart.defn.adtyp : oart.cary.adtyp) & 0xff;
  if (dtyp === AD_FIRE) {
    mask = P(G.u.uprops[FIRE_RES], "extrinsic");
  } else if (dtyp === AD_COLD) {
    mask = P(G.u.uprops[COLD_RES], "extrinsic");
  } else if (dtyp === AD_ELEC) {
    mask = P(G.u.uprops[SHOCK_RES], "extrinsic");
  } else if (dtyp === AD_MAGM) {
    mask = P(G.u.uprops[ANTIMAGIC], "extrinsic");
  } else if (dtyp === AD_DISN) {
    mask = P(G.u.uprops[DISINT_RES], "extrinsic");
  } else if (dtyp === AD_DRST) {
    mask = P(G.u.uprops[POISON_RES], "extrinsic");
  } else if (dtyp === AD_DRLI) {
    mask = P(G.u.uprops[DRAIN_RES], "extrinsic");
  }
  if (mask && wp_mask === W_ART && !on) {
    for (obj = G.invent; obj; obj = obj.nobj) {
      if (obj !== otmp && obj.oartifact) {
        art = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
        if (art && art.cary.adtyp === dtyp) {
          mask = null;
          break;
        }
      }
    }
  }
  if (mask) {
    if (on) {
      mask.a[mask.o] = mask.a[mask.o] | wp_mask;
    } else {
      mask.a[mask.o] = mask.a[mask.o] & ~wp_mask;
    }
  }
  spfx = wp_mask !== W_ART ? oart.spfx : oart.cspfx;
  if (spfx && wp_mask === W_ART && !on) {
    for (obj = G.invent; obj; obj = obj.nobj) {
      if (obj !== otmp && obj.oartifact) {
        art = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
        if (art) {
          spfx = ($u64(spfx) & ~art.cspfx >>> 0) >>> 0;
        }
      }
    }
  }
  if (spfx & SPFX_SEARCH) {
    if (on) {
      ($t1 = G.u.uprops[SEARCHING], $t1.extrinsic = $t1.extrinsic | wp_mask);
    } else {
      ($t2 = G.u.uprops[SEARCHING], $t2.extrinsic = $t2.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_HALRES) {
    await make_hallucinated(!on ? 1 : 0, G.restoring ? FALSE : TRUE, wp_mask);
  }
  if (spfx & SPFX_ESP) {
    if (on) {
      ($t3 = G.u.uprops[TELEPAT], $t3.extrinsic = $t3.extrinsic | wp_mask);
    } else {
      ($t4 = G.u.uprops[TELEPAT], $t4.extrinsic = $t4.extrinsic & ~wp_mask);
    }
    await see_monsters();
  }
  if (spfx & SPFX_STLTH) {
    if (on) {
      ($t5 = G.u.uprops[STEALTH], $t5.extrinsic = $t5.extrinsic | wp_mask);
    } else {
      ($t6 = G.u.uprops[STEALTH], $t6.extrinsic = $t6.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_REGEN) {
    if (on) {
      ($t7 = G.u.uprops[REGENERATION], $t7.extrinsic = $t7.extrinsic | wp_mask);
    } else {
      ($t8 = G.u.uprops[REGENERATION], $t8.extrinsic = $t8.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_TCTRL) {
    if (on) {
      ($t9 = G.u.uprops[TELEPORT_CONTROL], $t9.extrinsic = $t9.extrinsic | wp_mask);
    } else {
      ($t10 = G.u.uprops[TELEPORT_CONTROL], $t10.extrinsic = $t10.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_WARN) {
    if (spec_m2(otmp)) {
      if (on) {
        ($t11 = G.u.uprops[WARN_OF_MON], $t11.extrinsic = $t11.extrinsic | wp_mask);
        G.context.warntype.obj = (G.context.warntype.obj | $u64(spec_m2(otmp))) >>> 0;
      } else {
        ($t12 = G.u.uprops[WARN_OF_MON], $t12.extrinsic = $t12.extrinsic & ~wp_mask);
        G.context.warntype.obj = (G.context.warntype.obj & $u64(~spec_m2(otmp))) >>> 0;
      }
      await see_monsters();
    } else {
      if (on) {
        ($t13 = G.u.uprops[WARNING], $t13.extrinsic = $t13.extrinsic | wp_mask);
      } else {
        ($t14 = G.u.uprops[WARNING], $t14.extrinsic = $t14.extrinsic & ~wp_mask);
      }
    }
  }
  if (spfx & SPFX_EREGEN) {
    if (on) {
      ($t15 = G.u.uprops[ENERGY_REGENERATION], $t15.extrinsic = $t15.extrinsic | wp_mask);
    } else {
      ($t16 = G.u.uprops[ENERGY_REGENERATION], $t16.extrinsic = $t16.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_HSPDAM) {
    if (on) {
      ($t17 = G.u.uprops[HALF_SPDAM], $t17.extrinsic = $t17.extrinsic | wp_mask);
    } else {
      ($t18 = G.u.uprops[HALF_SPDAM], $t18.extrinsic = $t18.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_HPHDAM) {
    if (on) {
      ($t19 = G.u.uprops[HALF_PHDAM], $t19.extrinsic = $t19.extrinsic | wp_mask);
    } else {
      ($t20 = G.u.uprops[HALF_PHDAM], $t20.extrinsic = $t20.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_XRAY) {
    if (on) {
      G.u.xray_range = 3;
    } else {
      G.u.xray_range = -1;
    }
    G.vision_full_recalc = 1;
  }
  if (spfx & SPFX_REFLECT && wp_mask & W_WEP) {
    if (on) {
      ($t21 = G.u.uprops[REFLECTING], $t21.extrinsic = $t21.extrinsic | wp_mask);
    } else {
      ($t22 = G.u.uprops[REFLECTING], $t22.extrinsic = $t22.extrinsic & ~wp_mask);
    }
  }
  if (spfx & SPFX_PROTECT) {
    if (on) {
      ($t23 = G.u.uprops[PROTECTION], $t23.extrinsic = $t23.extrinsic | wp_mask);
    } else {
      ($t24 = G.u.uprops[PROTECTION], $t24.extrinsic = $t24.extrinsic & ~wp_mask);
    }
  }
  if (wp_mask === W_ART && !on && oart.inv_prop) {
    if (oart.inv_prop <= LAST_PROP && G.u.uprops[oart.inv_prop].extrinsic & W_ARTI) {
      await arti_invoke(otmp);
    }
  }
}

export async function touch_artifact(obj: struct_obj | null, mon: struct_monst | null): Promise<number> {
  let oart = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
  let badclass = 0;
  let badalign = 0;
  let self_willed = 0;
  let yours = 0;
  touch_blasted = FALSE;
  if (!oart) {
    return 1;
  }
  yours = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  self_willed = ((oart.spfx & SPFX_INTEL) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  if (yours) {
    badclass = (self_willed && (oart.role !== NON_PM && !(G.urole.malenum === oart.role) || oart.race !== NON_PM && !(G.urace.malenum === oart.race)) ? 1 : 0) << 24 >> 24;
    badalign = ((oart.spfx & SPFX_RESTR) >>> 0 !== 0 && oart.alignment !== A_NONE && (oart.alignment !== G.u.ualign.type || G.u.ualign.record < 0) ? 1 : 0) << 24 >> 24;
  } else if (!(mon.data.mflags3 & 31) && !($sidx(mon.data) >= $sidx($sat(G.mons, 328)) && $sidx(mon.data) <= $sidx($sat(G.mons, 342)))) {
    badclass = (self_willed && oart.role !== NON_PM && oart !== artilist[ART_EXCALIBUR] ? 1 : 0) << 24 >> 24;
    badalign = ((oart.spfx & SPFX_RESTR) >>> 0 && oart.alignment !== A_NONE && oart.alignment !== mon_aligntyp(mon) ? 1 : 0) << 24 >> 24;
  } else {
    badclass = badalign = FALSE;
  }
  if (!badalign) {
    badalign = await bane_applies(oart, mon);
  }
  if ((badclass || badalign) && self_willed || badalign && (!yours || !rn2(4))) {
    let dmg = 0;
    let tmp = 0;
    let buf = new Int8Array(256);
    if (!yours) {
      return 0;
    }
    await You(S("are blasted by %s power!"), s_suffix(await the(await xname(obj))));
    touch_blasted = TRUE;
    dmg = d(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic ? 2 : 4, self_willed ? 10 : 4);
    if ((G.objects[obj.otyp].oc_material | 0) === SILVER && (G.u.ulycn >= -1 + 1 || hates_silver(G.youmonst.data))) {
      tmp = rnd(10), dmg += G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp;
    }
    sprintf(P(buf), S("touching %s"), oart.name);
    await losehp(dmg, P(buf), KILLED_BY);
    await exercise(A_WIS, FALSE);
  }
  if (badclass && badalign && self_willed) {
    if (yours) {
      if (!(obj.where === 3)) {
        await pline(S("%s your grasp!"), await Tobjnam(obj, S("evade")));
      } else {
        await pline(S("%s beyond your control!"), await Tobjnam(obj, S("are")));
      }
    }
    return 0;
  }
  return 1;
}

export function arti_immune(obj: struct_obj | null, dtyp: number): number {
  let weap = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
  if (!weap) {
    return FALSE;
  }
  if (dtyp === AD_PHYS) {
    return FALSE;
  }
  return (weap.attk.adtyp === dtyp || weap.defn.adtyp === dtyp || weap.cary.adtyp === dtyp ? 1 : 0) << 24 >> 24;
}

async function bane_applies(oart: struct_artifact | null, mon: struct_monst | null): Promise<number> {
  let atmp = new struct_artifact();
  if (oart && (oart.spfx & SPFX_DBONUS) >>> 0 !== 0) {
    atmp.$cp(oart);
    atmp.spfx = (atmp.spfx & SPFX_DBONUS) >>> 0;
    if (await spec_applies(atmp, mon)) {
      return TRUE;
    }
  }
  return FALSE;
}

async function spec_applies(weap: struct_artifact | null, mtmp: struct_monst | null): Promise<number> {
  let ptr = null;
  let yours = 0;
  if (!((weap.spfx & (SPFX_DBONUS | SPFX_ATTK)) >>> 0)) {
    return weap.attk.adtyp === AD_PHYS ? 1 : 0;
  }
  yours = (mtmp === G.youmonst ? 1 : 0) << 24 >> 24;
  ptr = mtmp.data;
  if ((weap.spfx & SPFX_DMONS) >>> 0) {
    return ptr === $sat(G.mons, weap.mtype | 0) ? 1 : 0;
  } else if ((weap.spfx & SPFX_DCLAS) >>> 0) {
    return weap.mtype === $u64(ptr.mlet) ? 1 : 0;
  } else if ((weap.spfx & SPFX_DFLAG1) >>> 0) {
    return (ptr.mflags1 & weap.mtype) >>> 0 !== 0 ? 1 : 0;
  } else if ((weap.spfx & SPFX_DFLAG2) >>> 0) {
    return (ptr.mflags2 & weap.mtype) >>> 0 || yours && (!(G.u.umonnum !== G.u.umonster) && ($u64(G.urace.selfmask) & weap.mtype) >>> 0 || (weap.mtype & M2_WERE) >>> 0 && G.u.ulycn >= LOW_PM) ? 1 : 0;
  } else if ((weap.spfx & SPFX_DALIGN) >>> 0) {
    return yours ? G.u.ualign.type !== weap.alignment ? 1 : 0 : ptr.maligntyp === A_NONE || sgn(ptr.maligntyp) !== weap.alignment ? 1 : 0;
  } else if ((weap.spfx & SPFX_ATTK) >>> 0) {
    let defending_weapon = yours ? G.uwep : mtmp.mw;
    if (defending_weapon && defending_weapon.oartifact && defends(weap.attk.adtyp, defending_weapon)) {
      return FALSE;
    }
    switch (weap.attk.adtyp) {
    case 2:
      return !(yours ? G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0 ? 1 : 0) ? 1 : 0;
    case 3:
      return !(yours ? G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 2) !== 0 ? 1 : 0) ? 1 : 0;
    case 6:
      return !(yours ? G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 16) !== 0 ? 1 : 0) ? 1 : 0;
    case 1:
    case 12:
      return !(yours ? G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic ? 1 : 0 : rn2(100) < ptr.mr ? 1 : 0) ? 1 : 0;
    case 7:
      return !(yours ? G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 32) !== 0 ? 1 : 0) ? 1 : 0;
    case 15:
      return !(yours ? G.u.uprops[DRAIN_RES].intrinsic || G.u.uprops[DRAIN_RES].extrinsic ? 1 : 0 : resists_drli(mtmp)) ? 1 : 0;
    case 18:
      return !(yours ? G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0 ? 1 : 0) ? 1 : 0;
    default:
      await impossible(S("Weird weapon special attack."));
    }
  }
  return 0;
}

export function spec_m2(otmp: struct_obj | null): number {
  let artifact = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  if (artifact) {
    return artifact.mtype;
  }
  return 0;
}

export async function spec_abon(otmp: struct_obj | null, mon: struct_monst | null): Promise<number> {
  let weap = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  if (weap && weap.attk.damn && await spec_applies(weap, mon)) {
    return rnd(weap.attk.damn);
  }
  return 0;
}

export async function spec_dbon(otmp: struct_obj | null, mon: struct_monst | null, tmp: number): Promise<number> {
  let weap = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  if (!weap || weap.attk.adtyp === AD_PHYS && weap.attk.damn === 0 && weap.attk.damd === 0) {
    spec_dbon_applies = FALSE;
  } else if (otmp.oartifact === ART_GRIMTOOTH) {
    spec_dbon_applies = TRUE;
  } else {
    spec_dbon_applies = await spec_applies(weap, mon);
  }
  if (spec_dbon_applies) {
    return weap.attk.damd ? rnd(weap.attk.damd) : tmp > 1 ? tmp : 1;
  }
  return 0;
}

export async function discover_artifact(m: number): Promise<void> {
  let i = 0;
  for (i = 0; i < NROFARTIFACTS; ++i) {
    if (artidisco[i] === 0 || artidisco[i] === m) {
      artidisco[i] = m;
      return;
    }
  }
  await impossible(S("couldn't discover artifact (%d)"), m);
}

export function undiscovered_artifact(m: number): number {
  let i = 0;
  for (i = 0; i < NROFARTIFACTS; ++i) {
    if (artidisco[i] === m) {
      return FALSE;
    } else if (artidisco[i] === 0) {
      break;
    }
  }
  return TRUE;
}

export async function disp_artifact_discoveries(tmpwin: number): Promise<number> {
  let i = 0;
  let m = 0;
  let otyp = 0;
  let buf = new Int8Array(256);
  for (i = 0; i < NROFARTIFACTS; ++i) {
    if (artidisco[i] === 0) {
      break;
    }
    if (tmpwin === WIN_ERR) {
      continue;
    }
    if (i === 0) {
      await G.windowprocs.win_putstr(tmpwin, G.iflags.menu_headings, S("Artifacts"));
    }
    m = artidisco[i];
    otyp = artilist[m].otyp;
    sprintf(P(buf), S("  %s [%s %s]"), artiname(m), align_str(artilist[m].alignment), await simple_typename(otyp));
    await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
  }
  return i;
}

async function Mb_hit(magr: struct_monst | null, mdef: struct_monst | null, mb: struct_obj | null, dmgptr: Ptr | null, dieroll: number, vis: number, hittee: Ptr | null): Promise<number> {
  let old_uasmon = null;
  let verb = null;
  let youattack = (magr === G.youmonst ? 1 : 0) << 24 >> 24;
  let youdefend = (mdef === G.youmonst ? 1 : 0) << 24 >> 24;
  let resisted = FALSE;
  let do_stun = 0;
  let do_confuse = 0;
  let result = 0;
  let attack_indx = 0;
  let fakeidx = 0;
  let scare_dieroll = MB_MAX_DIEROLL / 2 | 0;
  result = FALSE;
  if (mb.spe >= 3) {
    scare_dieroll = scare_dieroll / (1 << (mb.spe / 3 | 0)) | 0;
  }
  if (!spec_dbon_applies) {
    dieroll += 1;
  }
  do_stun = ((mb.spe > 0 ? mb.spe : 0) < rn2(spec_dbon_applies ? 11 : 7) ? 1 : 0) << 24 >> 24;
  attack_indx = MB_INDEX_PROBE;
  dmgptr.a[dmgptr.o] += rnd(4);
  if (do_stun) {
    attack_indx = MB_INDEX_STUN;
    dmgptr.a[dmgptr.o] += rnd(4);
  }
  if (dieroll <= scare_dieroll) {
    attack_indx = MB_INDEX_SCARE;
    dmgptr.a[dmgptr.o] += rnd(4);
  }
  if (dieroll <= (scare_dieroll / 2 | 0)) {
    attack_indx = MB_INDEX_CANCEL;
    dmgptr.a[dmgptr.o] += rnd(4);
  }
  verb = mb_verb[!!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0][attack_indx];
  if (youattack || youdefend || vis) {
    result = TRUE;
    await pline_The(S("magic-absorbing blade %s %s!"), vtense(null, verb), hittee);
    if (attack_indx === MB_INDEX_PROBE && !((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
      await map_invisible(mdef.mx, mdef.my);
    }
  }
  switch (attack_indx) {
  case MB_INDEX_CANCEL:
    old_uasmon = G.youmonst.data;
    if (!await cancel_monst(mdef, mb, youattack, FALSE, FALSE)) {
      resisted = TRUE;
    } else {
      do_stun = FALSE;
      if (youdefend) {
        if (G.youmonst.data !== old_uasmon) {
          dmgptr.a[dmgptr.o] = 0;
        }
        if (G.u.uenmax > 0) {
          --G.u.uenmax;
          if (G.u.uen > 0) {
            --G.u.uen;
          }
          G.context.botl = TRUE;
          await You(S("lose magical energy!"));
        }
      } else {
        if (mdef.data === $sat(G.mons, PM_CLAY_GOLEM)) {
          mdef.mhp = 1;
        }
        if (youattack && attacktype(mdef.data, AT_MAGC)) {
          ++G.u.uenmax;
          ++G.u.uen;
          G.context.botl = TRUE;
          await You(S("absorb magical energy!"));
        }
      }
    }
    break;
  case MB_INDEX_SCARE:
    if (youdefend) {
      if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
        resisted = TRUE;
      } else {
        nomul(-3);
        G.multi_reason = S("being scared stiff");
        G.nomovemsg = S("");
        if (magr && magr === G.u.ustuck && sticks(G.youmonst.data)) {
          G.u.ustuck = null;
          await You(S("release %s!"), await mon_nam(magr));
        }
      }
    } else {
      if (rn2(2) && await resist(mdef, WEAPON_CLASS, 0, NOTELL)) {
        resisted = TRUE;
      } else {
        await monflee(mdef, 3, FALSE, mdef.mhp > dmgptr.a[dmgptr.o] ? 1 : 0);
      }
    }
    if (!resisted) {
      do_stun = FALSE;
    }
    break;
  case MB_INDEX_STUN:
    do_stun = TRUE;
    break;
  case MB_INDEX_PROBE:
    if (youattack && (mb.spe === 0 || !rn2(3 * Math.abs(mb.spe)))) {
      await pline_The(S("%s is insightful."), verb);
      await probe_monster(mdef);
    }
    break;
  }
  if (do_stun) {
    if (youdefend) {
      await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + 3, FALSE);
    } else {
      mdef.mstun = 1;
    }
    if (attack_indx === MB_INDEX_STUN) {
      do_stun = FALSE;
    }
  }
  do_confuse = (!rn2(12) ? 1 : 0) << 24 >> 24;
  if (do_confuse) {
    if (youdefend) {
      await make_confused((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) + 4, FALSE);
    } else {
      mdef.mconf = 1;
    }
  }
  fakeidx = youdefend ? 1 : 0;
  if (youattack || youdefend || vis) {
    upstart(hittee);
    if (resisted) {
      await pline(S("%s %s!"), hittee, vtense(G.c_common_strings.c_fakename[fakeidx], S("resist")));
      await shieldeff(youdefend ? G.u.ux : mdef.mx, youdefend ? G.u.uy : mdef.my);
    }
    if ((do_stun || do_confuse) && G.flags.verbose) {
      let buf = new Int8Array(256);
      buf[0] = 0;
      if (do_stun) {
        strcat(P(buf), S("stunned"));
      }
      if (do_stun && do_confuse) {
        strcat(P(buf), S(" and "));
      }
      if (do_confuse) {
        strcat(P(buf), S("confused"));
      }
      await pline(S("%s %s %s%c"), hittee, vtense(G.c_common_strings.c_fakename[fakeidx], S("are")), P(buf), do_stun && do_confuse ? 33 : 46);
    }
  }
  return result;
}

export async function artifact_hit(magr: struct_monst | null, mdef: struct_monst | null, otmp: struct_obj | null, dmgptr: Ptr | null, dieroll: number): Promise<number> {
  let youattack = (magr === G.youmonst ? 1 : 0) << 24 >> 24;
  let youdefend = (mdef === G.youmonst ? 1 : 0) << 24 >> 24;
  let vis = (!youattack && magr && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !youdefend && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || youattack && G.u.uswallow | 0 && mdef === G.u.ustuck && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24;
  let realizes_damage = 0;
  let wepdesc = null;
  let hittee = new Int8Array(256);
  strcpy(P(hittee), youdefend ? P(artifact_hit$you) : await mon_nam(mdef));
  dmgptr.a[dmgptr.o] += await spec_dbon(otmp, mdef, dmgptr.a[dmgptr.o]);
  if (youattack && youdefend) {
    await impossible(S("attacking yourself with weapon?"));
    return FALSE;
  }
  realizes_damage = (youdefend || vis || youattack && mdef === G.u.ustuck ? 1 : 0) << 24 >> 24;
  if (attacks(AD_FIRE, otmp)) {
    if (realizes_damage) {
      await pline_The(S("fiery blade %s %s%c"), !spec_dbon_applies ? S("hits") : mdef.data === $sat(G.mons, PM_WATER_ELEMENTAL) ? S("vaporizes part of") : S("burns"), P(hittee), !spec_dbon_applies ? 46 : 33);
    }
    if (!rn2(4)) {
      await destroy_mitem(mdef, POTION_CLASS, AD_FIRE);
    }
    if (!rn2(4)) {
      await destroy_mitem(mdef, SCROLL_CLASS, AD_FIRE);
    }
    if (!rn2(7)) {
      await destroy_mitem(mdef, SPBOOK_CLASS, AD_FIRE);
    }
    if (youdefend && G.u.uprops[SLIMED].intrinsic) {
      await burn_away_slime();
    }
    return realizes_damage;
  }
  if (attacks(AD_COLD, otmp)) {
    if (realizes_damage) {
      await pline_The(S("ice-cold blade %s %s%c"), !spec_dbon_applies ? S("hits") : S("freezes"), P(hittee), !spec_dbon_applies ? 46 : 33);
    }
    if (!rn2(4)) {
      await destroy_mitem(mdef, POTION_CLASS, AD_COLD);
    }
    return realizes_damage;
  }
  if (attacks(AD_ELEC, otmp)) {
    if (realizes_damage) {
      await pline_The(S("massive hammer hits%s %s%c"), !spec_dbon_applies ? S("") : S("!  Lightning strikes"), P(hittee), !spec_dbon_applies ? 46 : 33);
    }
    if (spec_dbon_applies) {
      wake_nearto(mdef.mx, mdef.my, 4 * 4);
    }
    if (!rn2(5)) {
      await destroy_mitem(mdef, RING_CLASS, AD_ELEC);
    }
    if (!rn2(5)) {
      await destroy_mitem(mdef, WAND_CLASS, AD_ELEC);
    }
    return realizes_damage;
  }
  if (attacks(AD_MAGM, otmp)) {
    if (realizes_damage) {
      await pline_The(S("imaginary widget hits%s %s%c"), !spec_dbon_applies ? S("") : S("!  A hail of magic missiles strikes"), P(hittee), !spec_dbon_applies ? 46 : 33);
    }
    return realizes_damage;
  }
  if (attacks(AD_STUN, otmp) && dieroll <= MB_MAX_DIEROLL) {
    return await Mb_hit(magr, mdef, otmp, dmgptr, dieroll, vis, P(hittee));
  }
  if (!spec_dbon_applies) {
    return FALSE;
  }
  if (spec_ability(otmp, SPFX_BEHEAD)) {
    if (otmp.oartifact === ART_TSURUGI_OF_MURAMASA && dieroll === 1) {
      wepdesc = S("The razor-sharp blade");
      if (youattack && G.u.uswallow | 0 && mdef === G.u.ustuck) {
        await You(S("slice %s wide open!"), await mon_nam(mdef));
        dmgptr.a[dmgptr.o] = 2 * mdef.mhp + FATAL_DAMAGE_MODIFIER;
        return TRUE;
      }
      if (!youdefend) {
        if (G.notonhead) {
          return FALSE;
        }
        if (mdef.data.msize >= 3) {
          if (youattack) {
            await You(S("slice deeply into %s!"), await mon_nam(mdef));
          } else if (vis) {
            await pline(S("%s cuts deeply into %s!"), await Monnam(magr), P(hittee));
          }
          dmgptr.a[dmgptr.o] = dmgptr.a[dmgptr.o] * 2;
          return TRUE;
        }
        dmgptr.a[dmgptr.o] = 2 * mdef.mhp + FATAL_DAMAGE_MODIFIER;
        await pline(S("%s cuts %s in half!"), wepdesc, await mon_nam(mdef));
        otmp.dknown = (TRUE) & 1;
        return TRUE;
      } else {
        if (G.youmonst.data.msize >= 3) {
          await pline(S("%s cuts deeply into you!"), magr ? await Monnam(magr) : wepdesc);
          dmgptr.a[dmgptr.o] = dmgptr.a[dmgptr.o] * 2;
          return TRUE;
        }
        dmgptr.a[dmgptr.o] = 2 * (G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) + FATAL_DAMAGE_MODIFIER;
        await pline(S("%s cuts you in half!"), wepdesc);
        otmp.dknown = (TRUE) & 1;
        return TRUE;
      }
    } else if (otmp.oartifact === ART_VORPAL_BLADE && (dieroll === 1 || mdef.data === $sat(G.mons, PM_JABBERWOCK))) {
      if (youattack && G.u.uswallow | 0 && mdef === G.u.ustuck) {
        return FALSE;
      }
      wepdesc = artilist[ART_VORPAL_BLADE].name;
      if (!youdefend) {
        if (!((mdef.data.mflags1 & 32768) >>> 0 === 0) || G.notonhead || G.u.uswallow | 0) {
          if (youattack) {
            await pline(S("Somehow, you miss %s wildly."), await mon_nam(mdef));
          } else if (vis) {
            await pline(S("Somehow, %s misses wildly."), await mon_nam(magr));
          }
          dmgptr.a[dmgptr.o] = 0;
          return (youattack || vis ? 1 : 0) << 24 >> 24;
        }
        if (mdef.data.mlet === S_GHOST || (mdef.data.mflags1 & 4) >>> 0 !== 0) {
          await pline(S("%s slices through %s %s."), wepdesc, s_suffix(await mon_nam(mdef)), mbodypart(mdef, NECK));
          return TRUE;
        }
        dmgptr.a[dmgptr.o] = 2 * mdef.mhp + FATAL_DAMAGE_MODIFIER;
        await pline(artifact_hit$behead_msg[rn2(Math.trunc(16 / 8) | 0)], wepdesc, await mon_nam(mdef));
        if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !G.flags.female) {
          await pline(S("Good job Henry, but that wasn't Anne."));
        }
        otmp.dknown = (TRUE) & 1;
        return TRUE;
      } else {
        if (!((G.youmonst.data.mflags1 & 32768) >>> 0 === 0)) {
          await pline(S("Somehow, %s misses you wildly."), magr ? await mon_nam(magr) : wepdesc);
          dmgptr.a[dmgptr.o] = 0;
          return TRUE;
        }
        if (G.youmonst.data.mlet === S_GHOST || (G.youmonst.data.mflags1 & 4) >>> 0 !== 0) {
          await pline(S("%s slices through your %s."), wepdesc, body_part(NECK));
          return TRUE;
        }
        dmgptr.a[dmgptr.o] = 2 * (G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) + FATAL_DAMAGE_MODIFIER;
        await pline(artifact_hit$behead_msg[rn2(Math.trunc(16 / 8) | 0)], wepdesc, S("you"));
        otmp.dknown = (TRUE) & 1;
        return TRUE;
      }
    }
  }
  if (spec_ability(otmp, SPFX_DRLI)) {
    let life = (mdef.data.mflags2 & 2) >>> 0 !== 0 || mdef.data === $sat(G.mons, 49) || (mdef.data.mlet === S_GOLEM || mdef.data.mlet === S_VORTEX) ? S("animating force") : S("life");
    if (!youdefend) {
      if (vis) {
        if (otmp.oartifact === ART_STORMBRINGER) {
          await pline_The(S("%s blade draws the %s from %s!"), hcolor(G.c_color_names.c_black), life, await mon_nam(mdef));
        } else {
          await pline(S("%s draws the %s from %s!"), await The(await distant_name(otmp, xname)), life, await mon_nam(mdef));
        }
      }
      if (mdef.m_lev === 0) {
        dmgptr.a[dmgptr.o] = 2 * mdef.mhp + FATAL_DAMAGE_MODIFIER;
      } else {
        let drain = await monhp_per_lvl(mdef);
        dmgptr.a[dmgptr.o] += drain;
        mdef.mhpmax -= drain;
        mdef.m_lev = mdef.m_lev - 1 & 0xff;
        drain = drain / 2 | 0;
        if (drain) {
          await healup(drain, 0, FALSE, FALSE);
        }
      }
      return vis;
    } else {
      let oldhpmax = G.u.uhpmax;
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await You_feel(S("an %s drain your %s!"), otmp.oartifact === ART_STORMBRINGER ? S("unholy blade") : S("object"), life);
      } else if (otmp.oartifact === ART_STORMBRINGER) {
        await pline_The(S("%s blade drains your %s!"), hcolor(G.c_color_names.c_black), life);
      } else {
        await pline(S("%s drains your %s!"), await The(await distant_name(otmp, xname)), life);
      }
      await losexp(S("life drainage"));
      if (magr && magr.mhp < magr.mhpmax) {
        magr.mhp += (oldhpmax - G.u.uhpmax) / 2 | 0;
        if (magr.mhp > magr.mhpmax) {
          magr.mhp = magr.mhpmax;
        }
      }
      return TRUE;
    }
  }
  return FALSE;
}

export async function doinvoke(): Promise<number> {
  const obj = [null];
  obj[0] = await getobj(P(invoke_types), S("invoke"));
  if (!obj[0]) {
    return 0;
  }
  if (!await retouch_object(P(obj, 0), FALSE)) {
    return 1;
  }
  return await arti_invoke(obj[0]);
}

async function arti_invoke(obj$: struct_obj | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  let $t1: any, $t2: any;
  let $g = 0;
  let oart = null;
  let eprop = 0;
  let iprop = 0;
  let on = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      oart = obj[0] && obj[0].oartifact ? $sat(artilist, obj[0].oartifact) : null;
      if (!obj[0]) {
        await impossible(S("arti_invoke without obj"));
        return 0;
      }
      if (!oart || !oart.inv_prop) {
        if (obj[0].otyp === CRYSTAL_BALL) {
          await use_crystal_ball(P(obj, 0));
        } else {
          await pline(S("%s"), G.c_common_strings.c_nothing_happens);
        }
        return 1;
      }
      if (!(oart.inv_prop > LAST_PROP)) { $g = 3; continue $L; }
      {
        if (obj[0].age > G.monstermoves) {
          await You_feel(S("that %s %s ignoring you."), await the(await xname(obj[0])), otense(obj[0], S("are")));
          obj[0].age += d(3, 10);
          return 1;
        }
        obj[0].age = G.monstermoves + rnz(100);
        switch (oart.inv_prop) {
        case TAMING:
          {
            let pseudo = new struct_obj();
            pseudo.$cp(G.zeroobj);
            pseudo.otyp = SCR_TAMING;
            await seffects(pseudo);
            break;
          }
        case HEALING:
          {
            let healamt = (G.u.uhpmax + 1 - G.u.uhp) / 2 | 0;
            let creamed = G.u.ucreamed;
            if (G.u.umonnum !== G.u.umonster) {
              healamt = (G.u.mhmax + 1 - G.u.mh) / 2 | 0;
            }
            if (healamt || G.u.uprops[SICK].intrinsic || G.u.uprops[SLIMED].intrinsic || G.u.uprops[BLINDED].intrinsic > creamed) {
              await You_feel(S("better."));
            } else {
              { $g = 1; continue $L; }
            }
            if (healamt > 0) {
              if (G.u.umonnum !== G.u.umonster) {
                G.u.mh += healamt;
              } else {
                G.u.uhp += healamt;
              }
            }
            if (G.u.uprops[SICK].intrinsic) {
              await make_sick(0, null, FALSE, SICK_ALL);
            }
            if (G.u.uprops[SLIMED].intrinsic) {
              await make_slimed(0, null);
            }
            if (G.u.uprops[BLINDED].intrinsic > creamed) {
              await make_blinded(creamed, FALSE);
            }
            G.context.botl = TRUE;
            break;
          }
        case ENERGY_BOOST:
          {
            let epboost = (G.u.uenmax + 1 - G.u.uen) / 2 | 0;
            if (epboost > 120) {
              epboost = 120;
            } else if (epboost < 12) {
              epboost = G.u.uenmax - G.u.uen;
            }
            if (epboost) {
              G.u.uen += epboost;
              G.context.botl = TRUE;
              await You_feel(S("re-energized."));
            } else {
              { $g = 1; continue $L; }
            }
            break;
          }
        case UNTRAP:
          {
            if (!await untrap(TRUE)) {
              obj[0].age = 0;
              return 0;
            }
            break;
          }
        case CHARGE_OBJ:
          {
            let otmp = await getobj(P(recharge_type), S("charge"));
            let b_effect = 0;
            if (!otmp) {
              obj[0].age = 0;
              return 0;
            }
            b_effect = (obj[0].blessed | 0 && (oart.role === G.urole.malenum || oart.role === NON_PM) ? 1 : 0) << 24 >> 24;
            await recharge(otmp, b_effect ? 1 : obj[0].cursed | 0 ? -1 : 0);
            update_inventory();
            break;
          }
        case LEV_TELE:
          await level_tele();
          break;
        case CREATE_PORTAL:
          {
            let i = 0;
            let num_ok_dungeons = 0;
            let last_ok_dungeon = 0;
            let newlev = new struct_d_level();
            let tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
            let any = new union_any();
            any.$cp(G.zeroany);
            await G.windowprocs.win_start_menu(tmpwin);
            for (i = num_ok_dungeons = 0; i < G.n_dgns; ++i) {
              if (!G.dungeons[i].dunlev_ureached) {
                continue;
              }
              any.a_int = i + 1;
              await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(G.dungeons[i].dname), MENU_UNSELECTED);
              ++num_ok_dungeons;
              last_ok_dungeon = i;
            }
            await G.windowprocs.win_end_menu(tmpwin, S("Open a portal to which dungeon?"));
            if (num_ok_dungeons > 1) {
              const selected = [null];
              let n = 0;
              n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(selected, 0));
              if (n <= 0) {
                await G.windowprocs.win_destroy_nhwindow(tmpwin);
                { $g = 1; continue $L; }
              }
              i = selected[0].item.a_int - 1;
              free(selected[0]);
            } else {
              i = last_ok_dungeon;
            }
            await G.windowprocs.win_destroy_nhwindow(tmpwin);
            newlev.dnum = i << 24 >> 24;
            if (G.dungeons[i].depth_start >= depth(G.u.uz)) {
              newlev.dlevel = G.dungeons[i].entry_lev;
            } else {
              newlev.dlevel = G.dungeons[i].dunlev_ureached;
            }
            if (G.u.uhave.amulet | 0 || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum || newlev.dnum === G.dungeon_topology.d_astral_level.dnum || newlev.dnum === G.u.uz.dnum || !await next_to_u()) {
              await You_feel(S("very disoriented for a moment."));
            } else {
              if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
                await You(S("are surrounded by a shimmering sphere!"));
              } else {
                await You_feel(S("weightless for a moment."));
              }
              await goto_level(newlev, FALSE, FALSE, FALSE);
            }
            break;
          }
        case ENLIGHTENING:
          await enlightenment(MAGICENLIGHTENMENT, ENL_GAMEINPROGRESS);
          break;
        case CREATE_AMMO:
          {
            let otmp = await mksobj(ARROW, TRUE, FALSE);
            if (!otmp) {
              { $g = 1; continue $L; }
            }
            otmp.blessed = (obj[0].blessed) & 1;
            otmp.cursed = (obj[0].cursed) & 1;
            otmp.bknown = (obj[0].bknown) & 1;
            if (obj[0].blessed) {
              if (otmp.spe < 0) {
                otmp.spe = 0;
              }
              otmp.quan += rnd(10);
            } else if (obj[0].cursed) {
              if (otmp.spe > 0) {
                otmp.spe = 0;
              }
            } else {
              otmp.quan += rnd(5);
            }
            otmp.owt = await weight(otmp) >>> 0;
            otmp = await hold_another_object(otmp, S("Suddenly %s out."), await aobjnam(otmp, S("fall")), null);
            ;
            break;
          }
        }
      }
      { $g = 2; continue $L; }
    case 3:
      eprop = ($t1 = G.u.uprops[oart.inv_prop], $t1.extrinsic = $t1.extrinsic ^ W_ARTI);
      iprop = G.u.uprops[oart.inv_prop].intrinsic;
      on = ((eprop & W_ARTI) !== 0 ? 1 : 0) << 24 >> 24;
      if (on && obj[0].age > G.monstermoves) {
        ($t2 = G.u.uprops[oart.inv_prop], $t2.extrinsic = $t2.extrinsic ^ W_ARTI);
        await You_feel(S("that %s %s ignoring you."), await the(await xname(obj[0])), otense(obj[0], S("are")));
        obj[0].age += d(3, 10);
        return 1;
      } else if (!on) {
        obj[0].age = G.monstermoves + rnz(100);
      }
      if (!(eprop & ~W_ARTI || iprop)) { $g = 4; continue $L; }
    case 1: // nothing_special
      if (obj[0].where === 3) {
        await You_feel(S("a surge of power, but nothing seems to happen."));
      }
      return 1;
    case 4:
      switch (oart.inv_prop) {
      case CONFLICT:
        if (on) {
          await You_feel(S("like a rabble-rouser."));
        } else {
          await You_feel(S("the tension decrease around you."));
        }
        break;
      case LEVITATION:
        if (on) {
          await float_up();
          await spoteffects(FALSE);
        } else {
          await float_down(I_SPECIAL | TIMEOUT, W_ARTI);
        }
        break;
      case INVIS:
        if (G.u.uprops[INVIS].blocked || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          { $g = 1; continue $L; }
        }
        await newsym(G.u.ux, G.u.uy);
        if (on) {
          await Your(S("body takes on a %s transparency..."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
        } else {
          await Your(S("body seems to unfade..."));
        }
        break;
      }
    case 2:
      return 1;
    }
    break;
  }
}

export function finesse_ahriman(obj: struct_obj | null): number {
  let $t1: any, $t2: any;
  let oart = null;
  let save_Lev = new struct_prop();
  let result = 0;
  if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) || !(oart = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null) || oart.inv_prop !== LEVITATION || !(G.u.uprops[LEVITATION].extrinsic & W_ARTI)) {
    return FALSE;
  }
  save_Lev.$cp(G.u.uprops[LEVITATION]);
  ($t1 = G.u.uprops[LEVITATION], $t1.intrinsic = $t1.intrinsic & ~(I_SPECIAL | TIMEOUT));
  ($t2 = G.u.uprops[LEVITATION], $t2.extrinsic = $t2.extrinsic & ~W_ARTI);
  result = (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) ? 1 : 0) << 24 >> 24;
  G.u.uprops[LEVITATION].$cp(save_Lev);
  return result;
}

export function artifact_light(obj: struct_obj | null): number {
  return ((obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null) && obj.oartifact === ART_SUNSWORD ? 1 : 0) << 24 >> 24;
}

export async function arti_speak(obj: struct_obj | null): Promise<void> {
  let oart = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
  let line = null;
  let buf = new Int8Array(256);
  if (!oart || !((oart.spfx & SPFX_SPEAK) >>> 0)) {
    return;
  }
  line = await getrumor(bcsign(obj), P(buf), TRUE);
  if (!line.a[line.o]) {
    line = S("NetHack rumors file closed for renovation.");
  }
  await pline(S("%s:"), await Tobjnam(obj, S("whisper")));
  await verbalize(S("%s"), line);
  return;
}

export function artifact_has_invprop(otmp: struct_obj | null, inv_prop: number): number {
  let arti = otmp && otmp.oartifact ? $sat(artilist, otmp.oartifact) : null;
  return (arti && arti.inv_prop === inv_prop ? 1 : 0) << 24 >> 24;
}

export function arti_cost(otmp: struct_obj | null): number {
  if (!otmp.oartifact) {
    return G.objects[otmp.otyp].oc_cost;
  } else if (artilist[otmp.oartifact].cost) {
    return artilist[otmp.oartifact].cost;
  } else {
    return 100 * G.objects[otmp.otyp].oc_cost;
  }
}

function abil_to_adtyp(abil: Ptr | null): number {
  let abil2adtyp = $sarrOf([struct_abil2adtyp_tag.$of(P(G.u.uprops[FIRE_RES], "extrinsic"), AD_FIRE),
struct_abil2adtyp_tag.$of(P(G.u.uprops[COLD_RES], "extrinsic"), AD_COLD),
struct_abil2adtyp_tag.$of(P(G.u.uprops[SHOCK_RES], "extrinsic"), AD_ELEC),
struct_abil2adtyp_tag.$of(P(G.u.uprops[ANTIMAGIC], "extrinsic"), AD_MAGM),
struct_abil2adtyp_tag.$of(P(G.u.uprops[DISINT_RES], "extrinsic"), AD_DISN),
struct_abil2adtyp_tag.$of(P(G.u.uprops[POISON_RES], "extrinsic"), AD_DRST),
struct_abil2adtyp_tag.$of(P(G.u.uprops[DRAIN_RES], "extrinsic"), AD_DRLI)]);
  let k = 0;
  for (k = 0; k < (Math.trunc(112 / 16) | 0); ++k) {
    if ($peq(abil2adtyp[k].abil, abil)) {
      return abil2adtyp[k].adtyp;
    }
  }
  return 0;
}

function abil_to_spfx(abil: Ptr | null): number {
  let k = 0;
  for (k = 0; k < (Math.trunc(192 / 16) | 0); ++k) {
    if ($peq(abil_to_spfx$abil2spfx[k].abil, abil)) {
      return abil_to_spfx$abil2spfx[k].spfx;
    }
  }
  return 0;
}

export function what_gives(abil: Ptr | null): struct_obj | null {
  let obj = null;
  let dtyp = 0;
  let spfx = 0;
  let wornbits = 0;
  let wornmask = W_ARM | W_ARMC | W_ARMH | W_ARMS | W_ARMG | W_ARMF | W_ARMU | W_AMUL | W_RINGL | W_RINGR | W_TOOL | W_ART | W_ARTI;
  if (G.u.twoweap) {
    wornmask = wornmask | W_SWAPWEP;
  }
  dtyp = abil_to_adtyp(abil);
  spfx = abil_to_spfx(abil);
  wornbits = wornmask & abil.a[abil.o];
  for (obj = G.invent; obj; obj = obj.nobj) {
    if (obj.oartifact && (!$peq(abil, P(G.u.uprops[WARN_OF_MON], "extrinsic")) || G.context.warntype.obj)) {
      let art = obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null;
      if (art) {
        if (dtyp) {
          if (art.cary.adtyp === dtyp || art.defn.adtyp === dtyp && obj.owornmask & ~(W_ART | W_ARTI)) {
            return obj;
          }
        }
        if (spfx) {
          if ((art.cspfx & spfx) >>> 0 === spfx) {
            return obj;
          }
          if ((art.spfx & spfx) >>> 0 === spfx && obj.owornmask) {
            return obj;
          }
        }
      }
    } else {
      if (wornbits && wornbits === (wornmask & obj.owornmask)) {
        return obj;
      }
    }
  }
  return null;
}

export function glow_color(arti_indx: number): Ptr | null {
  let colornum = artilist[arti_indx].acolor;
  let colorstr = clr2colorname(colornum);
  return hcolor(colorstr);
}

function glow_strength(count: number): number {
  return count > 12 ? 3 : count > 4 ? 2 : count > 0 ? 1 : 0;
}

export function glow_verb(count: number, ingsfx: number): Ptr | null {
  strcpy(P(glow_verb$resbuf), glow_verbs[glow_strength(count)]);
  if (ingsfx) {
    strcat(P(glow_verb$resbuf), S("ing"));
  }
  return P(glow_verb$resbuf);
}

export async function Sting_effects(orc_count: number): Promise<void> {
  if (G.uwep && (G.uwep.oartifact === ART_STING || G.uwep.oartifact === ART_ORCRIST || G.uwep.oartifact === ART_GRIMTOOTH)) {
    let oldstr = glow_strength(G.warn_obj_cnt);
    let newstr = glow_strength(orc_count);
    if (orc_count === -1 && G.warn_obj_cnt > 0) {
      await pline(S("%s is %s."), await bare_artifactname(G.uwep), glow_verb((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? 0 : G.warn_obj_cnt, TRUE));
    } else if (newstr > 0 && newstr !== oldstr) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s %s %s%c"), await bare_artifactname(G.uwep), otense(G.uwep, glow_verb(orc_count, FALSE)), glow_color(G.uwep.oartifact), newstr > oldstr ? 33 : 46);
      } else if (oldstr === 0) {
        await pline(S("%s %s slightly."), await bare_artifactname(G.uwep), otense(G.uwep, glow_verb(0, FALSE)));
      }
    } else if (orc_count === 0 && G.warn_obj_cnt > 0) {
      await pline(S("%s stops %s."), await bare_artifactname(G.uwep), glow_verb((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? 0 : G.warn_obj_cnt, TRUE));
    }
  }
}

export async function retouch_object(objp: Ptr | null, loseit: number): Promise<number> {
  let obj = objp.a[objp.o];
  if (await touch_artifact(obj, G.youmonst)) {
    let buf = new Int8Array(256);
    let dmg = 0;
    let tmp = 0;
    let ag = ((G.objects[obj.otyp].oc_material | 0) === SILVER && (G.u.ulycn >= -1 + 1 || hates_silver(G.youmonst.data)) ? 1 : 0) << 24 >> 24;
    let bane = await bane_applies(obj && obj.oartifact ? $sat(artilist, obj.oartifact) : null, G.youmonst);
    if (!ag && !bane) {
      return 1;
    }
    await You_cant(S("handle %s%s!"), await yname(obj), obj.owornmask ? S(" anymore") : S(""));
    if (!touch_blasted) {
      if (ag) {
        tmp = rnd(10), dmg += G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp;
      }
      if (bane) {
        dmg += rnd(10);
      }
      sprintf(P(buf), S("handling %s"), await killer_xname(obj));
      await losehp(dmg, P(buf), KILLED_BY);
      await exercise(A_CON, FALSE);
    }
  }
  if (obj.owornmask) {
    let otmp = null;
    await remove_worn_item(obj, FALSE);
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (otmp === obj) {
        break;
      }
    }
    if (!otmp) {
      objp.a[objp.o] = obj = null;
    }
  }
  if (loseit && obj) {
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
      await freeinv(obj);
      await hitfloor(obj, TRUE);
    } else {
      if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR)) {
        await pline(S("%s to the %s."), await Tobjnam(obj, S("fall")), surface(G.u.ux, G.u.uy));
      }
      await dropx(obj);
    }
    objp.a[objp.o] = obj = null;
  }
  return 0;
}

async function untouchable(obj$: struct_obj | null, drop_untouchable: number): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  let art = null;
  let beingworn = 0;
  let carryeffect = 0;
  let invoked = 0;
  let wearmask = ~(W_QUIVER | (G.u.twoweap ? 0 : W_SWAPWEP) | W_BALL);
  beingworn = ((obj[0].owornmask & wearmask) !== 0 || obj[0].oclass === TOOL_CLASS && (obj[0].lamplit | 0 || obj[0].otyp === LEASH && obj[0].corpsenm || obj[0].otyp >= 189 && obj[0].otyp <= 195 && !!obj[0].cobj) ? 1 : 0) << 24 >> 24;
  if (!!(art = obj[0] && obj[0].oartifact ? $sat(artilist, obj[0].oartifact) : null)) {
    carryeffect = (art.cary.adtyp || art.cspfx ? 1 : 0) << 24 >> 24;
    invoked = (art.inv_prop > 0 && art.inv_prop <= LAST_PROP && (G.u.uprops[art.inv_prop].extrinsic & W_ARTI) !== 0 ? 1 : 0) << 24 >> 24;
  } else {
    carryeffect = invoked = FALSE;
  }
  if (beingworn || carryeffect || invoked) {
    if (!await retouch_object(P(obj, 0), drop_untouchable)) {
      if (invoked && obj[0]) {
        await arti_invoke(obj[0]);
      }
      return TRUE;
    }
  }
  return FALSE;
}

export async function retouch_equipment(dropflag: number): Promise<void> {
  let obj = null;
  let dropit = 0;
  let had_gloves = (!!G.uarmg ? 1 : 0) << 24 >> 24;
  let had_rings = (!!G.uleft ? 1 : 0) + (!!G.uright ? 1 : 0);
  if (!retouch_equipment$nesting++) {
    clear_bypasses();
  }
  dropit = (dropflag > 0 ? 1 : 0) << 24 >> 24;
  if (G.u.twoweap) {
    bypass_obj(G.uswapwep);
    await untouchable(G.uswapwep, dropit);
  }
  if (G.uwep) {
    bypass_obj(G.uwep);
    await untouchable(G.uwep, dropit);
  }
  if (G.u.usteed && !!(obj = await which_armor(G.u.usteed, W_SADDLE))) {
    if (await untouchable(obj, FALSE)) {
      await dismount_steed(DISMOUNT_THROWN);
    }
  }
  dropit = (dropflag === 1 ? 1 : 0) << 24 >> 24;
  while (!!(obj = nxt_unbypassed_obj(G.invent))) {
    await untouchable(obj, dropit);
  }
  if (had_rings !== (!!G.uleft ? 1 : 0) + (!!G.uright ? 1 : 0) && G.uarmg && G.uarmg.cursed | 0) {
    await uncurse(G.uarmg);
  }
  if (had_gloves && !G.uarmg) {
    await selftouch(S("After losing your gloves, you"));
  }
  if (!--retouch_equipment$nesting) {
    clear_bypasses();
  }
}

function count_surround_traps(x: number, y: number): number {
  let levp = null;
  let otmp = null;
  let ttmp = null;
  let dx = 0;
  let dy = 0;
  let glyph = 0;
  let ret = 0;
  for (dx = x - 1; dx < x + 2; ++dx) {
    for (dy = y - 1; dy < y + 2; ++dy) {
      if (!isok(dx, dy)) {
        continue;
      }
      glyph = glyph_at(dx, dy);
      if (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM) {
        continue;
      }
      if (!!(ttmp = t_at(dx, dy))) {
        ++ret;
        continue;
      }
      levp = $sat(G.level.locations[dx], dy);
      if (levp.typ === DOOR && ((levp.flags | 0) & D_TRAPPED) !== 0) {
        ++ret;
        continue;
      }
      for (otmp = G.level.objects[dx][dy]; otmp; otmp = otmp.v.v_nexthere) {
        if (otmp.otyp >= 189 && otmp.otyp <= 195 && otmp.otrapped | 0) {
          ++ret;
          break;
        }
      }
    }
  }
  return ret;
}

export async function mkot_trap_warn(): Promise<void> {
  if (!G.uarmg && G.uwep && G.uwep.oartifact === ART_MASTER_KEY_OF_THIEVERY) {
    let idx = 0;
    let ntraps = count_surround_traps(G.u.ux, G.u.uy);
    if (ntraps !== mkot_trap_warn_count) {
      idx = ntraps < (Math.trunc(56 / 8) | 0) - 1 ? ntraps : (Math.trunc(56 / 8) | 0) - 1;
      await pline_The(S("Key feels %s%c"), mkot_trap_warn$heat[idx], ntraps > 3 ? 33 : 46);
    }
    mkot_trap_warn_count = ntraps;
  } else {
    mkot_trap_warn_count = 0;
  }
}

export function is_magic_key(mon: struct_monst | null, obj: struct_obj | null): number {
  if (obj && obj.oartifact === ART_MASTER_KEY_OF_THIEVERY && (mon === G.youmonst ? G.urole.malenum === 338 ? 1 : 0 : mon && mon.data === $sat(G.mons, PM_ROGUE) ? 1 : 0) ? !obj.cursed ? 1 : 0 : obj.blessed | 0) {
    return TRUE;
  }
  return FALSE;
}

export function has_magic_key(mon: struct_monst | null): struct_obj | null {
  let o = null;
  let key = artilist[ART_MASTER_KEY_OF_THIEVERY].otyp;
  if (!mon) {
    mon = G.youmonst;
  }
  for (o = mon === G.youmonst ? G.invent : mon.minvent; o; o = nxtobj(o, key, FALSE)) {
    if (is_magic_key(mon, o)) {
      return o;
    }
  }
  return null;
}

export function $init(): void {
  artilist = $sarrOf([struct_artifact.$of(0, S(""), 0, 0, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(), 0, -128, -1, -1, 0, 8),
struct_artifact.$of(37, S("Excalibur"), 1 | 2 | 16 | 128 | 4 | 512, 0, 0, struct_attack.$of(0, 0, 5, 10), struct_attack.$of(0, 15), struct_attack.$of(), 0, 1, 333, -1, 4000, 8),
struct_artifact.$of(41, S("Stormbringer"), 2 | 64 | 128 | 4 | 256, 0, 0, struct_attack.$of(0, 15, 5, 2), struct_attack.$of(0, 15), struct_attack.$of(), 0, -1, -1, -1, 8000, 8),
struct_artifact.$of(58, S("Mjollnir"), 2 | 64, 0, 0, struct_attack.$of(0, 6, 5, 24), struct_attack.$of(), struct_attack.$of(), 0, 0, 341, -1, 4000, 8),
struct_artifact.$of(28, S("Cleaver"), 2, 0, 0, struct_attack.$of(0, 0, 3, 6), struct_attack.$of(), struct_attack.$of(), 0, 0, 329, -1, 1500, 8),
struct_artifact.$of(19, S("Grimtooth"), 2 | 32 | 8388608, 0, 16, struct_attack.$of(0, 0, 2, 6), struct_attack.$of(), struct_attack.$of(), 0, -1, -1, 71, 300, 1),
struct_artifact.$of(36, S("Orcrist"), 32 | 8388608, 0, 128, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, -1, -1, 260, 2000, 12),
struct_artifact.$of(18, S("Sting"), 32 | 8388608, 0, 128, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, -1, -1, 260, 800, 12),
struct_artifact.$of(21, S("Magicbane"), 2 | 64 | 128, 0, 0, struct_attack.$of(0, 12, 3, 4), struct_attack.$of(0, 1), struct_attack.$of(), 0, 0, 342, -1, 3500, 8),
struct_artifact.$of(37, S("Frost Brand"), 2 | 64 | 128, 0, 0, struct_attack.$of(0, 3, 5), struct_attack.$of(0, 3), struct_attack.$of(), 0, -128, -1, -1, 3000, 8),
struct_artifact.$of(37, S("Fire Brand"), 2 | 64 | 128, 0, 0, struct_attack.$of(0, 2, 5), struct_attack.$of(0, 2), struct_attack.$of(), 0, -128, -1, -1, 3000, 8),
struct_artifact.$of(35, S("Dragonbane"), 2 | 2097152 | 67108864, 0, S_DRAGON, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, -128, -1, -1, 500, 8),
struct_artifact.$of(37, S("Demonbane"), 2 | 8388608, 0, 256, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, 1, -1, -1, 2500, 8),
struct_artifact.$of(34, S("Werebane"), 2 | 8388608, 0, 4, struct_attack.$of(0, 0, 5), struct_attack.$of(0, 29), struct_attack.$of(), 0, -128, -1, -1, 1500, 8),
struct_artifact.$of(34, S("Grayswandir"), 2 | 2048, 0, 0, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, 1, -1, -1, 8000, 8),
struct_artifact.$of(37, S("Giantslayer"), 2 | 8388608, 0, 8192, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, 0, -1, -1, 200, 8),
struct_artifact.$of(58, S("Ogresmasher"), 2 | 2097152, 0, S_OGRE, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, -128, -1, -1, 200, 8),
struct_artifact.$of(57, S("Trollsbane"), 2 | 2097152, 0, S_TROLL, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), 0, -128, -1, -1, 200, 8),
struct_artifact.$of(37, S("Vorpal Blade"), 2 | 1024, 0, 0, struct_attack.$of(0, 0, 5, 1), struct_attack.$of(), struct_attack.$of(), 0, 0, -1, -1, 4000, 8),
struct_artifact.$of(39, S("Snickersnee"), 2, 0, 0, struct_attack.$of(0, 0, 0, 8), struct_attack.$of(), struct_attack.$of(), 0, 1, 339, -1, 1200, 8),
struct_artifact.$of(37, S("Sunsword"), 2 | 8388608, 0, 2, struct_attack.$of(0, 0, 5), struct_attack.$of(0, 11), struct_attack.$of(), 0, 1, -1, -1, 1500, 8),
struct_artifact.$of(206, S("The Orb of Detection"), 1 | 2 | 4, 4096 | 65536, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(0, 1), INVIS, 1, 328, -1, 2500, 8),
struct_artifact.$of(443, S("The Heart of Ahriman"), 1 | 2 | 4, 8192, 0, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), LEVITATION, 0, 329, -1, 2500, 8),
struct_artifact.$of(56, S("The Sceptre of Might"), 1 | 2 | 4 | 16777216, 0, 0, struct_attack.$of(0, 0, 5), struct_attack.$of(0, 1), struct_attack.$of(), CONFLICT, 1, 330, -1, 2500, 8),
struct_artifact.$of(61, S("The Staff of Aesculapius"), 1 | 2 | 64 | 4 | 256 | 16384, 0, 0, struct_attack.$of(0, 15), struct_attack.$of(0, 15), struct_attack.$of(), HEALING, 0, 332, -1, 5000, 8),
struct_artifact.$of(205, S("The Magic Mirror of Merlin"), 1 | 2 | 4 | 8, 4096, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(0, 1), 0, 1, 333, -1, 1500, 8),
struct_artifact.$of(207, S("The Eyes of the Overworld"), 1 | 2 | 4 | 33554432, 0, 0, struct_attack.$of(), struct_attack.$of(0, 1), struct_attack.$of(), ENLIGHTENING, 0, 334, -1, 2500, 8),
struct_artifact.$of(79, S("The Mitre of Holiness"), 1 | 2 | 8388608 | 4 | 134217728, 0, 2, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(0, 2), ENERGY_BOOST, 1, 335, -1, 2000, 8),
struct_artifact.$of(65, S("The Longbow of Diana"), 1 | 2 | 4 | 67108864, 4096, 0, struct_attack.$of(0, 0, 5), struct_attack.$of(), struct_attack.$of(), CREATE_AMMO, -1, 337, -1, 4000, 8),
struct_artifact.$of(196, S("The Master Key of Thievery"), 1 | 2 | 4 | 8, 32 | 262144 | 131072, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(), UNTRAP, -1, 338, -1, 3500, 8),
struct_artifact.$of(40, S("The Tsurugi of Muramasa"), 1 | 2 | 4 | 1024 | 524288 | 134217728, 0, 0, struct_attack.$of(0, 0, 0, 8), struct_attack.$of(), struct_attack.$of(), 0, 1, 339, -1, 4500, 8),
struct_artifact.$of(198, S("The Platinum Yendorian Express Card"), 1 | 2 | 4 | 128, 4096 | 65536, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(0, 1), CHARGE_OBJ, 0, 340, -1, 7000, 8),
struct_artifact.$of(206, S("The Orb of Fate"), 1 | 2 | 4 | 524288, 32 | 65536 | 131072, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(), LEV_TELE, 0, 341, -1, 3500, 8),
struct_artifact.$of(178, S("The Eye of the Aethiopica"), 1 | 2 | 4, 32768 | 65536, 0, struct_attack.$of(), struct_attack.$of(0, 1), struct_attack.$of(), CREATE_PORTAL, 0, 342, -1, 4000, 8),
struct_artifact.$of(0, null, 0, 0, 0, struct_attack.$of(), struct_attack.$of(), struct_attack.$of(), 0, -128, -1, -1)]);
  spec_dbon_applies = 0;
  artiexist = new Int8Array(35);
  artidisco = new Int8Array(33);
  touch_blasted = 0;
  mb_verb = [[S("probe"),
S("stun"),
S("scare"),
S("cancel")], [S("prod"),
S("amaze"),
S("tickle"),
S("purge")]];
  recharge_type = $ta(Int8Array, 3, [ALLOW_COUNT, ALL_CLASSES]);
  invoke_types = $ta(Int8Array, 2, [ALL_CLASSES]);
  glow_verbs = [S("quiver"),
S("flicker"),
S("glimmer"),
S("gleam")];
  mkot_trap_warn_count = 0;
  artifact_hit$you = $cs("you", 4);
  artifact_hit$behead_msg = [S("%s beheads %s!"), S("%s decapitates %s!")];
  abil_to_spfx$abil2spfx = $sarrOf([struct_abil2spfx_tag.$of(P(G.u.uprops[SEARCHING], "extrinsic"), SPFX_SEARCH),
struct_abil2spfx_tag.$of(P(G.u.uprops[HALLUC_RES], "extrinsic"), SPFX_HALRES),
struct_abil2spfx_tag.$of(P(G.u.uprops[TELEPAT], "extrinsic"), SPFX_ESP),
struct_abil2spfx_tag.$of(P(G.u.uprops[STEALTH], "extrinsic"), SPFX_STLTH),
struct_abil2spfx_tag.$of(P(G.u.uprops[REGENERATION], "extrinsic"), SPFX_REGEN),
struct_abil2spfx_tag.$of(P(G.u.uprops[TELEPORT_CONTROL], "extrinsic"), SPFX_TCTRL),
struct_abil2spfx_tag.$of(P(G.u.uprops[WARN_OF_MON], "extrinsic"), SPFX_WARN),
struct_abil2spfx_tag.$of(P(G.u.uprops[WARNING], "extrinsic"), SPFX_WARN),
struct_abil2spfx_tag.$of(P(G.u.uprops[ENERGY_REGENERATION], "extrinsic"), SPFX_EREGEN),
struct_abil2spfx_tag.$of(P(G.u.uprops[HALF_SPDAM], "extrinsic"), SPFX_HSPDAM),
struct_abil2spfx_tag.$of(P(G.u.uprops[HALF_PHDAM], "extrinsic"), SPFX_HPHDAM),
struct_abil2spfx_tag.$of(P(G.u.uprops[REFLECTING], "extrinsic"), SPFX_REFLECT)]);
  glow_verb$resbuf = new Int8Array(20);
  retouch_equipment$nesting = 0;
  mkot_trap_warn$heat = [S("cool"),
S("slightly warm"),
S("warm"),
S("very warm"),
S("hot"),
S("very hot"),
S("like fire")];
}
