// @ts-nocheck
// NetHack 3.6.7 mhitu.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { number_leashed, snuff_lit, um_dist, unleash_all } from './apply.ts';
import { artifact_hit, defends, protects, retouch_equipment } from './artifact.ts';
import { acurr, adjalign, adjattrib, exercise, poisoned } from './attrib.ts';
import { placebc, unplacebc } from './ball.ts';
import { bot } from './botl.ts';
import { reset_occupations, yn_function } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { flush_screen, map_invisible, newsym, shieldeff, swallowed } from './display.ts';
import { set_wounded_legs } from './do.ts';
import { Adjmonnam, Amonnam, Monnam, christen_monst, hliquid, m_monnam, mon_nam, noit_Monnam, noit_mon_nam } from './do_name.ts';
import { Ring_gone, Ring_on, some_armor, stop_donning } from './do_wear.ts';
import { initedog } from './dog.ts';
import { on_level } from './dungeon.ts';
import { eat_brains, is_fainted, morehungry } from './eat.ts';
import { delayed_killer, done, done_in_by } from './end.ts';
import { ceiling } from './engrave.ts';
import { losexp, pluslvl } from './exper.ts';
import { losehp, money_cnt, nomul, spoteffects, unmul } from './hack.ts';
import { dist2, midnight, night, s_suffix, upstart } from './hacklib.ts';
import { currency, freeinv, have_lizard, prinv, sobj_at, update_inventory } from './invent.ts';
import { makemon } from './makemon.ts';
import { buzzmu, castmu } from './mcastu.ts';
import { attk_protection, engulf_target, mattackm, paralyze_monst, rustm } from './mhitm.ts';
import { msummon } from './minion.ts';
import { golemeffects, killed, mnexto, mon_to_stone, mondead, mongone, monnear, unstuck, wake_nearto, xkilled } from './mon.ts';
import { attacktype_fordmg, can_blnd, dmgtype, gender, hates_silver, locomotion, monsndx, on_fire, poly_when_stoned, pronoun_gender, resists_blnd, resists_drli, stagger, sticks } from './mondata.ts';
import { monflee, set_apparxy } from './monmove.ts';
import { breamu, spitmu, thrwmu } from './mthrowu.ts';
import { find_offensive, mon_reflects, ureflects, use_offensive } from './muse.ts';
import { discover_object } from './o_init.ts';
import { Yobjnam2, an, cloak_simple_name, doname, helm_simple_name, makeplural, mimic_obj_name, safe_qbuf, simpleonames, suit_simple_name, the, vtense, xname, yname } from './objnam.ts';
import { You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, poly_gender, polymon, rehumanize, ugolemeffects } from './polyself.ts';
import { make_blinded, make_confused, make_hallucinated, make_sick, make_slimed, make_stoned, make_stunned, split_mon } from './potion.ts';
import { is_quest_artifact } from './questpgr.ts';
import { forget_levels, forget_objects } from './read.ts';
import { d, rn2, rnd } from './rnd.ts';
import { money2mon } from './shk.ts';
import { attrcurse } from './sit.ts';
import { growl_sound } from './sounds.ts';
import { mpickobj, remove_worn_item, steal, stealamulet, stealgold } from './steal.ts';
import { dismount_steed, place_monster } from './steed.ts';
import { enexto, rloc, tele, tele_restrict, teleds } from './teleport.ts';
import { burn_away_slime, fall_asleep } from './timeout.ts';
import { acid_damage, drain_en, minstapetrify, reset_utrap, t_at, unconscious } from './trap.ts';
import { erode_armor } from './uhitm.ts';
import { vision_recalc } from './vision.ts';
import { dmgval, hitval, mon_wield_item } from './weapon.ts';
import { new_were, set_ulycn, were_summon } from './were.ts';
import { welded } from './wield.ts';
import { worm_known, worm_move } from './worm.ts';
import { find_mac, setworn, which_armor } from './worn.ts';
import { destroy_item, drain_item } from './zap.ts';
import { struct_attack, struct_monst, struct_nhcoord, struct_obj, struct_permonst } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, sprintf, strcpy } from './rt/index.ts';
import { ACID_RES, AD_ACID, AD_ANY, AD_BLND, AD_COLD, AD_DGST, AD_DISE, AD_DREN, AD_DRIN, AD_DRLI, AD_ELEC, AD_FAMN, AD_FIRE, AD_PEST, AD_PHYS, AD_SEDU, AD_SITM, AD_SLOW, AD_SSEX, AD_STUN, AD_WERE, AD_WRAP, ANTIMAGIC, ART_STORMBRINGER, ART_VORPAL_BLADE, AT_BITE, AT_BOOM, AT_BUTT, AT_CLAW, AT_ENGL, AT_GAZE, AT_HUGS, AT_KICK, AT_MAGC, AT_NONE, AT_STNG, AT_TUCH, AT_WEAP, A_CHA, A_CHAOTIC, A_CON, A_DEX, A_INT, A_STR, A_WIS, BLINDED, BOLT_LIM, BOULDER, COLD_RES, CONFLICT, CONFUSION, CORPSE, DEAF, DETECT_MONSTERS, DIED, DISMOUNT_ENGULFED, DISPLACED, DRAIN_RES, DROWNING, DUNCE_CAP, EGG, ERODE_CORRODE, ERODE_ROT, ERODE_RUST, FALSE, FAST, FIRE_RES, FLYING, FREE_ACTION, GAUNTLETS_OF_POWER, GOLD_PIECE, G_EXTINCT, G_UNIQ, HAIR, HALF_PHDAM, HALLUC, HALLUC_RES, HAND, INFRAVISION, INVIS, IRON, IRON_SHOES, KILLED_BY, KILLED_BY_AN, LARGEST_INT, LEFT_RING, LEFT_SIDE, LEG, LEVITATION, LOW_BOOTS, MAGICAL_BREATHING, METAL, MITHRIL, MM_AGR_DIED, MM_DEF_DIED, MM_EDOG, MM_MISS, MZ_HUGE, M_AP_NOTHING, M_AP_OBJECT, NATTK, NEED_HTH_WEAPON, NEED_WEAPON, NEW_MOON, NON_PM, NO_MINVENT, OBJ_FREE, OILSKIN_CLOAK, PIERCE, PIT, PM_ALIGNED_PRIEST, PM_ARCHON, PM_BALROG, PM_BLACK_LIGHT, PM_BLACK_PUDDING, PM_BROWN_PUDDING, PM_CLAY_GOLEM, PM_FLOATING_EYE, PM_FOG_CLOUD, PM_GREEN_SLIME, PM_GREMLIN, PM_HIGH_PRIEST, PM_INCUBUS, PM_IRON_GOLEM, PM_LEATHER_GOLEM, PM_LEPRECHAUN, PM_MEDUSA, PM_ROPE_GOLEM, PM_STONE_GOLEM, PM_SUCCUBUS, PM_TRAPPER, PM_VIOLET_FUNGUS, PM_WOOD_GOLEM, POOL, POTION_CLASS, PROTECTION, PROT_FROM_SHAPE_CHANGERS, P_NONE, REFLECTING, RIGHT_RING, RIGHT_SIDE, RING_CLASS, RIN_ADORNMENT, SCROLL_CLASS, SEE_INVIS, SHOCK_RES, SICK, SICK_ALL, SICK_NONVOMITABLE, SICK_RES, SILVER, SLEEP_RES, SLIMED, SLOW_DIGESTION, SPBOOK_CLASS, SPIKED_PIT, STONED, STONE_RES, STONING, STUNNED, SWIMMING, S_EEL, S_GHOST, S_MIMIC, S_NYMPH, S_PIERCER, S_VORTEX, TELEPAT, TELEPORT_CONTROL, TIMEOUT, TOOL_CLASS, TRUE, TT_WEB, UNCHANGING, WAND_CLASS, WARN_OF_MON, WATER, WEAPON_CLASS, WORN_HELMET, W_ACCESSORY, W_ARMG, W_ARMOR, W_WEP, XKILL_NOMSG } from './consts.ts';

let mon_currwep: struct_obj | null;
let dieroll: number;
let gazemu$reactions: any;

async function hitmsg(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<void> {
  let compat = 0;
  let pfmt = null;
  let Monst_name = await Monnam(mtmp);
  if ((compat = could_seduce(mtmp, G.youmonst, mattk)) !== 0 && !mtmp.mcan && !mtmp.mspec_used) {
    await pline(S("%s %s you %s."), Monst_name, !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("smiles at") : !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("talks to") : S("touches"), compat === 2 ? S("engagingly") : S("seductively"));
  } else {
    switch (mattk.aatyp) {
    case 2:
      pfmt = S("%s bites!");
      break;
    case 3:
      await pline(S("%s kicks%c"), Monst_name, (G.youmonst.data.mflags1 & 2097152) >>> 0 !== 0 ? 46 : 33);
      break;
    case 6:
      pfmt = S("%s stings!");
      break;
    case 4:
      pfmt = S("%s butts!");
      break;
    case 5:
      pfmt = S("%s touches you!");
      break;
    case 16:
      pfmt = S("%s tentacles suck you!");
      Monst_name = s_suffix(Monst_name);
      break;
    case 13:
    case 14:
      pfmt = S("%s explodes!");
      break;
    default:
      pfmt = S("%s hits!");
    }
    if (pfmt) {
      await pline(pfmt, Monst_name);
    }
  }
}

async function missmu(mtmp: struct_monst | null, nearmiss: number, mattk: struct_attack | null): Promise<void> {
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    await map_invisible(mtmp.mx, mtmp.my);
  }
  if (could_seduce(mtmp, G.youmonst, mattk) && !mtmp.mcan) {
    await pline(S("%s pretends to be friendly."), await Monnam(mtmp));
  } else {
    await pline(S("%s %smisses!"), await Monnam(mtmp), nearmiss && G.flags.verbose ? S("just ") : S(""));
  }
  await stop_occupation();
}

async function mswings(mtmp: struct_monst | null, otemp: struct_obj | null): Promise<void> {
  if (G.flags.verbose && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
    await pline(S("%s %s %s%s %s."), await Monnam(mtmp), (G.objects[otemp.otyp].oc_dir | 0) & PIERCE ? S("thrusts") : S("swings"), otemp.quan > 1 ? S("one of ") : S(""), G.genders[pronoun_gender(mtmp, 0)].his, await xname(otemp));
  }
}

export function mpoisons_subj(mtmp: struct_monst | null, mattk: struct_attack | null): Ptr | null {
  if (mattk.aatyp === AT_WEAP) {
    let mwep = mtmp === G.youmonst ? G.uwep : mtmp.mw;
    return !mwep || !mwep.otrapped ? S("attack") : S("weapon");
  } else {
    return mattk.aatyp === AT_TUCH ? S("contact") : mattk.aatyp === AT_GAZE ? S("gaze") : mattk.aatyp === AT_BITE ? S("bite") : S("sting");
  }
}

export async function u_slow_down(): Promise<void> {
  G.u.uprops[FAST].intrinsic = 0;
  if (!(G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic)) {
    await You(S("slow down."));
  } else {
    await Your(S("quickness feels less natural."));
  }
  await exercise(A_DEX, FALSE);
}

async function wildmiss(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<void> {
  let compat = 0;
  let Monst_name = null;
  if (!G.flags.verbose) {
    return;
  }
  if (!($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2)) {
    return;
  }
  compat = mattk.adtyp === AD_SEDU || mattk.adtyp === AD_SSEX ? could_seduce(mtmp, G.youmonst, mattk) : 0;
  Monst_name = await Monnam(mtmp);
  if (!mtmp.mcansee || (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0)) {
    let swings = mattk.aatyp === AT_BITE ? S("snaps") : mattk.aatyp === AT_KICK ? S("kicks") : mattk.aatyp === AT_STNG || mattk.aatyp === AT_BUTT || (mtmp.data.mflags1 & 24576) >>> 0 === 24576 ? S("lunges") : S("swings");
    if (compat) {
      await pline(S("%s tries to touch you and misses!"), Monst_name);
    } else {
      switch (rn2(3)) {
      case 0:
        await pline(S("%s %s wildly and misses!"), Monst_name, swings);
        break;
      case 1:
        await pline(S("%s attacks a spot beside you."), Monst_name);
        break;
      case 2:
        await pline(S("%s strikes at %s!"), Monst_name, $at2(G.level.locations, mtmp.mux, mtmp.muy).typ === WATER ? S("empty water") : S("thin air"));
        break;
      default:
        await pline(S("%s %s wildly!"), Monst_name, swings);
        break;
      }
    }
  } else if (G.u.uprops[DISPLACED].extrinsic) {
    if (compat) {
      await pline(S("%s smiles %s at your %sdisplaced image..."), Monst_name, compat === 2 ? S("engagingly") : S("seductively"), (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked ? S("invisible ") : S(""));
    } else {
      await pline(S("%s strikes at your %sdisplaced image and misses you!"), Monst_name, (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked ? S("invisible ") : S(""));
    }
  } else if (G.u.uinwater) {
    if (compat) {
      await pline(S("%s reaches towards your distorted image."), Monst_name);
    } else {
      await pline(S("%s is fooled by water reflections and misses!"), Monst_name);
    }
  } else {
    await impossible(S("%s attacks you without knowing your location?"), Monst_name);
  }
}

export async function expels(mtmp: struct_monst | null, mdat: struct_permonst | null, message: number): Promise<void> {
  if (message) {
    if ((mdat.mflags1 & 262144) >>> 0 !== 0) {
      await You(S("get regurgitated!"));
    } else {
      let blast = new Int8Array(40);
      let attk = attacktype_fordmg(mdat, AT_ENGL, AD_ANY);
      blast[0] = 0;
      if (!attk) {
        await impossible(S("Swallower has no engulfing attack?"));
      } else {
        if (mdat.mlet === S_VORTEX || mdat === $sat(G.mons, 151)) {
          switch (attk.adtyp) {
          case 6:
            strcpy(P(blast), S(" in a shower of sparks"));
            break;
          case 3:
            strcpy(P(blast), S(" in a blast of frost"));
            break;
          }
        } else {
          strcpy(P(blast), S(" with a squelch"));
        }
        await You(S("get expelled from %s%s!"), await mon_nam(mtmp), P(blast));
      }
    }
  }
  await unstuck(mtmp);
  await mnexto(mtmp);
  await newsym(G.u.ux, G.u.uy);
  await spoteffects(TRUE);
  if (um_dist(mtmp.mx, mtmp.my, 1)) {
    await pline(S("Brrooaa...  You land hard at some distance."));
  }
}

export function getmattk(magr: struct_monst | null, mdef: struct_monst | null, indx: number, prev_result: Ptr | null, alt_attk_buf: struct_attack | null): struct_attack | null {
  let mptr = magr.data;
  let attk = $sat(mptr.mattk, indx);
  let weap = magr === G.youmonst ? G.uwep : magr.mw;
  if (!G.sysopt.seduce) {
    if (mptr.mattk[0].adtyp === AD_SSEX) {
      alt_attk_buf.$cp(G.sa_no[indx]);
      attk = alt_attk_buf;
    } else if (attk.adtyp === AD_SSEX) {
      alt_attk_buf.$cp(attk);
      attk = alt_attk_buf;
      attk.adtyp = AD_DRLI;
    }
  }
  if (indx > 0 && prev_result.a[prev_result.o + (indx - 1)] > 0 && (attk.adtyp === AD_DISE || attk.adtyp === AD_PEST || attk.adtyp === AD_FAMN) && attk.adtyp === mptr.mattk[indx - 1].adtyp) {
    alt_attk_buf.$cp(attk);
    attk = alt_attk_buf;
    attk.adtyp = AD_STUN;
  } else if (attk.adtyp === AD_DREN && mdef === G.youmonst) {
    let ulev = G.u.ulevel > 6 ? G.u.ulevel : 6;
    alt_attk_buf.$cp(attk);
    attk = alt_attk_buf;
    if (G.u.uen <= 5 * ulev && attk.damn > 1) {
      attk.damn = attk.damn - 1 & 0xff;
      if (G.u.uenmax <= 2 * ulev && attk.damd > 3) {
        attk.damd = attk.damd - 3 & 0xff;
      }
    } else if (G.u.uen > 12 * ulev) {
      attk.damn = attk.damn + 1 & 0xff;
      if (G.u.uenmax > 20 * ulev) {
        attk.damd = attk.damd + 3 & 0xff;
      }
    }
  } else if (attk.aatyp === AT_ENGL && magr.mspec_used) {
    alt_attk_buf.$cp(attk);
    attk = alt_attk_buf;
    if (attk.adtyp === AD_ACID || attk.adtyp === AD_ELEC || attk.adtyp === AD_COLD || attk.adtyp === AD_FIRE) {
      attk.aatyp = AT_TUCH;
    } else {
      attk.aatyp = AT_CLAW;
      attk.adtyp = AD_PHYS;
    }
    attk.damn = 1;
    attk.damd = 6;
  } else if (indx === 0 && magr !== G.youmonst && attk.aatyp === AT_WEAP && attk.adtyp !== AD_PHYS && !(mptr.mattk[1].aatyp === AT_WEAP && mptr.mattk[1].adtyp === AD_PHYS) && (magr.mcan | 0 || weap && (weap.otyp === CORPSE && ($sat(G.mons, weap.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, weap.corpsenm) === $sat(G.mons, 9)) || weap.oartifact === ART_STORMBRINGER || weap.oartifact === ART_VORPAL_BLADE))) {
    alt_attk_buf.$cp(attk);
    attk = alt_attk_buf;
    attk.adtyp = AD_PHYS;
  }
  return attk;
}

export async function mattacku(mtmp: struct_monst | null): Promise<number> {
  let mattk = null;
  let alt_attk = new struct_attack();
  let i = 0;
  let j = 0;
  let tmp = 0;
  let sum = new Int32Array(6);
  let mdat = mtmp.data;
  let ranged = (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 3 ? 1 : 0) << 24 >> 24;
  let range2 = (!monnear(mtmp, mtmp.mux, mtmp.muy) ? 1 : 0) << 24 >> 24;
  let foundyou = (mtmp.mux === G.u.ux && mtmp.muy === G.u.uy ? 1 : 0) << 24 >> 24;
  let youseeit = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
  let skipnonmagc = FALSE;
  if (!ranged) {
    nomul(0);
  }
  if (mtmp.mhp < 1 || G.u.uinwater | 0 && !((mtmp.data.mflags1 & 2) >>> 0 !== 0)) {
    return 0;
  }
  if (G.u.uswallow) {
    if (mtmp !== G.u.ustuck) {
      return 0;
    }
    G.u.ustuck.mux = G.u.ux;
    G.u.ustuck.muy = G.u.uy;
    range2 = 0;
    foundyou = 1;
    if (G.u.uinvulnerable) {
      return 0;
    }
  } else if (G.u.usteed) {
    if (mtmp === G.u.usteed) {
      return 0;
    }
    if (!rn2((mtmp.data.mflags2 & 128) >>> 0 !== 0 ? 2 : 4) && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 2) {
      i = await mattackm(mtmp, G.u.usteed);
      if (i & MM_AGR_DIED) {
        return 1;
      }
      if (i & MM_DEF_DIED || !G.u.usteed || dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
        return 0;
      }
      return !!(await mattackm(G.u.usteed, mtmp) & MM_DEF_DIED) ? 1 : 0;
    }
  }
  if (G.u.uundetected | 0 && !range2 && foundyou && !G.u.uswallow) {
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(mtmp.mx, mtmp.my);
    }
    G.u.uundetected = 0;
    if ((G.youmonst.data.mflags1 & 256) >>> 0 !== 0 && G.u.umonnum !== PM_TRAPPER) {
      let cc = new struct_nhcoord();
      let obj = null;
      await You(S("fall from the %s!"), ceiling(G.u.ux, G.u.uy));
      G.level.monsters[mtmp.mx][mtmp.my] = null;
      if (!await enexto(cc, G.u.ux, G.u.uy, G.youmonst.data) || mtmp.data.mlet === S_EEL && is_pool(mtmp.mx, mtmp.my) && !is_pool(G.u.ux, G.u.uy)) {
        await place_monster(mtmp, mtmp.mx, mtmp.my);
        await newsym(G.u.ux, G.u.uy);
        await pline(S("%s draws back as you drop!"), await Monnam(mtmp));
        return 0;
      }
      await newsym(mtmp.mx, mtmp.my);
      await place_monster(mtmp, G.u.ux, G.u.uy);
      if (mtmp.wormno) {
        await worm_move(mtmp);
        if (!!G.level.monsters[cc.x][cc.y] ? G.level.monsters[cc.x][cc.y] : null) {
          await enexto(cc, G.u.ux, G.u.uy, G.youmonst.data);
        }
      }
      await teleds(cc.x, cc.y, TRUE);
      set_apparxy(mtmp);
      await newsym(G.u.ux, G.u.uy);
      if (G.youmonst.data.mlet !== S_PIERCER) {
        return 0;
      }
      obj = await which_armor(mtmp, WORN_HELMET);
      if (obj && ((G.objects[obj.otyp].oc_material | 0) >= IRON && (G.objects[obj.otyp].oc_material | 0) <= MITHRIL)) {
        await Your(S("blow glances off %s %s."), s_suffix(await mon_nam(mtmp)), helm_simple_name(obj));
      } else {
        if (3 + find_mac(mtmp) <= rnd(20)) {
          await pline(S("%s is hit by a falling piercer (you)!"), await Monnam(mtmp));
          if ((mtmp.mhp -= d(3, 6)) < 1) {
            await killed(mtmp);
          }
        } else {
          await pline(S("%s is almost hit by a falling piercer (you)!"), await Monnam(mtmp));
        }
      }
    } else {
      if (!youseeit) {
        await pline(S("It tries to move where you are hiding."));
      } else {
        let obj = G.level.objects[G.u.ux][G.u.uy];
        if (obj || G.u.umonnum === PM_TRAPPER || G.youmonst.data.mlet === S_EEL && is_pool(G.u.ux, G.u.uy)) {
          let save_spe = 0;
          if (obj) {
            save_spe = obj.spe;
            if (obj.otyp === EGG) {
              obj.spe = 0;
            }
          }
          if (G.youmonst.data.mlet === S_EEL || G.u.umonnum === PM_TRAPPER) {
            await pline(S("Wait, %s!  There's a hidden %s named %s there!"), await m_monnam(mtmp), G.youmonst.data.mname, P(G.plname));
          } else {
            await pline(S("Wait, %s!  There's a %s named %s hiding under %s!"), await m_monnam(mtmp), G.youmonst.data.mname, P(G.plname), await doname(G.level.objects[G.u.ux][G.u.uy]));
          }
          if (obj) {
            obj.spe = save_spe << 24 >> 24;
          }
        } else {
          await impossible(S("hiding under nothing?"));
        }
      }
      await newsym(G.u.ux, G.u.uy);
    }
    return 0;
  }
  if (G.youmonst.data.mlet === S_MIMIC && G.youmonst.m_ap_type & 7 && !range2 && foundyou && !G.u.uswallow) {
    let sticky = sticks(G.youmonst.data);
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(mtmp.mx, mtmp.my);
    }
    if (sticky && !youseeit) {
      await pline(S("It gets stuck on you."));
    } else {
      await pline(S("Wait, %s!  That's a %s named %s!"), await m_monnam(mtmp), G.youmonst.data.mname, P(G.plname));
    }
    if (sticky) {
      G.u.ustuck = mtmp;
    }
    G.youmonst.m_ap_type = M_AP_NOTHING;
    G.youmonst.mappearance = 0;
    await newsym(G.u.ux, G.u.uy);
    return 0;
  }
  if ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT && !range2 && foundyou && !G.u.uswallow) {
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(mtmp.mx, mtmp.my);
    }
    if (!youseeit) {
      await pline(S("%s %s!"), G.c_common_strings.c_Something, (mtmp.data.mflags2 & 268435456) >>> 0 !== 0 && G.youmonst.mappearance === GOLD_PIECE ? S("tries to pick you up") : S("disturbs you"));
    } else {
      await pline(S("Wait, %s!  That %s is really %s named %s!"), await m_monnam(mtmp), await mimic_obj_name(G.youmonst), await an(G.mons[G.u.umonnum].mname), P(G.plname));
    }
    if (G.multi < 0) {
      let buf = new Int8Array(256);
      sprintf(P(buf), S("You appear to be %s again."), G.u.umonnum !== G.u.umonster ? await an(G.youmonst.data.mname) : S("yourself"));
      await unmul(P(buf));
    }
    return 0;
  }
  tmp = (G.u.uac >= 0 ? G.u.uac : -rnd(-G.u.uac)) + 10;
  tmp += mtmp.m_lev;
  if (G.multi < 0) {
    tmp += 4;
  }
  if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mdat.mflags1 & 16777216) >>> 0 !== 0) || !mtmp.mcansee) {
    tmp -= 2;
  }
  if (mtmp.mtrapped) {
    tmp -= 2;
  }
  if (tmp <= 0) {
    tmp = 1;
  }
  if (mdat.mlet === S_EEL && mtmp.minvis | 0 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
    mtmp.minvis = 0;
    await newsym(mtmp.mx, mtmp.my);
  }
  if (mtmp.cham === NON_PM && (mdat.mflags2 & 256) >>> 0 !== 0 && !range2 && mtmp.data !== $sat(G.mons, PM_BALROG) && mtmp.data !== $sat(G.mons, PM_SUCCUBUS) && mtmp.data !== $sat(G.mons, PM_INCUBUS)) {
    if (!mtmp.mcan && !rn2(13)) {
      await msummon(mtmp);
    }
  }
  if (mtmp.cham === NON_PM && (mdat.mflags2 & 4) >>> 0 !== 0 && !range2) {
    if ((mdat.mflags2 & 8) >>> 0 !== 0) {
      if (!rn2(5 - night() * 2) && !mtmp.mcan) {
        await new_were(mtmp);
      }
    } else if (!rn2(30) && !mtmp.mcan) {
      await new_were(mtmp);
    }
    mdat = mtmp.data;
    if (!rn2(10) && !mtmp.mcan) {
      const numseen = new Int32Array(1);
      let numhelp = 0;
      let buf = new Int8Array(256);
      let genericwere = new Int8Array(256);
      strcpy(P(genericwere), S("creature"));
      numhelp = await were_summon(mdat, FALSE, P(numseen, 0), P(genericwere));
      if (youseeit) {
        await pline(S("%s summons help!"), await Monnam(mtmp));
        if (numhelp > 0) {
          if (numseen[0] === 0) {
            await You_feel(S("hemmed in."));
          }
        } else {
          await pline(S("But none comes."));
        }
      } else {
        let from_nowhere = null;
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await pline(S("%s %s!"), G.c_common_strings.c_Something, await makeplural(growl_sound(mtmp)));
          from_nowhere = S("");
        } else {
          from_nowhere = S(" from nowhere");
        }
        if (numhelp > 0) {
          if (numseen[0] < 1) {
            await You_feel(S("hemmed in."));
          } else {
            if (numseen[0] === 1) {
              sprintf(P(buf), S("%s appears"), await an(P(genericwere)));
            } else {
              sprintf(P(buf), S("%s appear"), await makeplural(P(genericwere)));
            }
            await pline(S("%s%s!"), upstart(P(buf)), from_nowhere);
          }
        }
      }
    }
  }
  if (G.u.uinvulnerable) {
    if (mtmp === G.u.ustuck) {
      await pline(S("%s loosens its grip slightly."), await Monnam(mtmp));
    } else if (!range2) {
      if (youseeit || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(S("%s starts to attack you, but pulls back."), await Monnam(mtmp));
      } else {
        await You_feel(S("%s move nearby."), G.c_common_strings.c_something);
      }
    }
    return 0;
  }
  if (await find_offensive(mtmp)) {
    let foo = await use_offensive(mtmp);
    if (foo !== 0) {
      return foo === 1 ? 1 : 0;
    }
  }
  for (i = 0; i < NATTK; ++i) {
    sum[i] = 0;
    mon_currwep = null;
    mattk = getmattk(mtmp, G.youmonst, i, P(sum), alt_attk);
    if (G.u.uswallow | 0 && mattk.aatyp !== AT_ENGL || skipnonmagc && mattk.aatyp !== AT_MAGC) {
      continue;
    }
    switch (mattk.aatyp) {
    case 1:
    case 3:
    case 2:
    case 6:
    case 5:
    case 4:
    case 16:
      if (!range2 && (!mtmp.mw || mtmp.mconf | 0 || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) || !(G.youmonst.data === $sat(G.mons, 10) || G.youmonst.data === $sat(G.mons, 9)))) {
        if (foundyou) {
          if (tmp > (j = rnd(20 + i))) {
            if (mattk.aatyp !== AT_KICK || !((G.youmonst.data.mflags1 & 2097152) >>> 0 !== 0)) {
              sum[i] = await hitmu(mtmp, mattk);
            }
          } else {
            await missmu(mtmp, tmp === j ? 1 : 0, mattk);
          }
        } else {
          await wildmiss(mtmp, mattk);
          skipnonmagc = TRUE;
        }
      }
      break;
    case 7:
      if (!range2 && i >= 2 && sum[i - 1] && sum[i - 2] || mtmp === G.u.ustuck) {
        sum[i] = await hitmu(mtmp, mattk);
      }
      break;
    case 15:
      if (mdat !== $sat(G.mons, PM_MEDUSA)) {
        sum[i] = await gazemu(mtmp, mattk);
      }
      break;
    case 13:
      if (!range2) {
        sum[i] = await explmu(mtmp, mattk, foundyou);
      }
      break;
    case 11:
      if (!range2) {
        if (foundyou) {
          if (G.u.uswallow | 0 || !mtmp.mspec_used && tmp > (j = rnd(20 + i))) {
            await flush_screen(1);
            sum[i] = await gulpmu(mtmp, mattk);
          } else {
            await missmu(mtmp, tmp === j ? 1 : 0, mattk);
          }
        } else if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0) {
          await pline(S("%s gulps some air!"), await Monnam(mtmp));
        } else {
          if (youseeit) {
            await pline(S("%s lunges forward and recoils!"), await Monnam(mtmp));
          } else {
            await You_hear(S("a %s nearby."), mtmp.data.mlet === S_VORTEX || mtmp.data === $sat(G.mons, 151) ? S("rushing noise") : S("splat"));
          }
        }
      }
      break;
    case 12:
      if (range2) {
        sum[i] = await breamu(mtmp, mattk);
      }
      break;
    case 10:
      if (range2) {
        sum[i] = await spitmu(mtmp, mattk);
      }
      break;
    case 254:
      if (range2) {
        if (!((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
          await thrwmu(mtmp);
        }
      } else {
        let hittmp = 0;
        if (mtmp.weapon_check === NEED_WEAPON || !mtmp.mw) {
          mtmp.weapon_check = NEED_HTH_WEAPON;
          if (await mon_wield_item(mtmp) !== 0) {
            break;
          }
        }
        if (foundyou) {
          mon_currwep = mtmp.mw;
          if (mon_currwep) {
            hittmp = await hitval(mon_currwep, G.youmonst);
            tmp += hittmp;
            await mswings(mtmp, mon_currwep);
          }
          if (tmp > (j = dieroll = rnd(20 + i))) {
            sum[i] = await hitmu(mtmp, mattk);
          } else {
            await missmu(mtmp, tmp === j ? 1 : 0, mattk);
          }
          if (mon_currwep) {
            tmp -= hittmp;
          }
        } else {
          await wildmiss(mtmp, mattk);
          skipnonmagc = TRUE;
        }
      }
      break;
    case 255:
      if (range2) {
        sum[i] = await buzzmu(mtmp, mattk);
      } else {
        sum[i] = await castmu(mtmp, mattk, TRUE, foundyou);
      }
      break;
    default:
      break;
    }
    if (G.context.botl) {
      await bot();
    }
    if (sum[i] === 1) {
      if (G.u.usleep && G.u.usleep < G.monstermoves && !rn2(10)) {
        G.multi = -1;
        G.nomovemsg = S("The combat suddenly awakens you.");
      }
    }
    if (sum[i] === 2) {
      return 1;
    }
    if (sum[i] === 3) {
      break;
    }
  }
  return 0;
}

async function diseasemu(mdat: struct_permonst | null): Promise<number> {
  if (G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep)) {
    await You_feel(S("a slight illness."));
    return FALSE;
  } else {
    await make_sick(G.u.uprops[SICK].intrinsic ? Math.trunc(G.u.uprops[SICK].intrinsic / 3) + 1 : rn2(acurr(A_CON)) + 20, mdat.mname, TRUE, SICK_NONVOMITABLE);
    return TRUE;
  }
}

async function u_slip_free(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let obj = G.uarmc ? G.uarmc : G.uarm;
  if (!obj) {
    obj = G.uarmu;
  }
  if (mattk.adtyp === AD_DRIN) {
    obj = G.uarmh;
  }
  if (obj && (obj.greased | 0 || obj.otyp === OILSKIN_CLOAK) && (!obj.cursed || rn2(3))) {
    await pline(S("%s %s your %s %s!"), await Monnam(mtmp), mattk.adtyp === AD_WRAP ? S("slips off of") : S("grabs you, but cannot hold onto"), obj.greased | 0 ? S("greased") : S("slippery"), obj.greased | 0 || G.objects[obj.otyp].oc_name_known | 0 ? await xname(obj) : cloak_simple_name(obj));
    if (obj.greased | 0 && !rn2(2)) {
      await pline_The(S("grease wears off."));
      obj.greased = 0;
      update_inventory();
    }
    return TRUE;
  }
  return FALSE;
}

export function magic_negation(mon: struct_monst | null): number {
  let o = null;
  let wearmask = 0;
  let armpro = 0;
  let mc = 0;
  let is_you = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  let gotprot = (is_you ? G.u.uprops[PROTECTION].extrinsic !== 0 ? 1 : 0 : mon.data === $sat(G.mons, PM_HIGH_PRIEST) ? 1 : 0) << 24 >> 24;
  for (o = is_you ? G.invent : mon.minvent; o; o = o.nobj) {
    if ((o.owornmask & W_ARMOR) !== 0) {
      armpro = G.objects[o.otyp].oc_oc2;
      if (armpro > mc) {
        mc = armpro;
      }
    }
    if (is_you || gotprot) {
      continue;
    }
    wearmask = W_ARMOR | W_ACCESSORY;
    if (o.oclass === WEAPON_CLASS || o.oclass === TOOL_CLASS && G.objects[o.otyp].oc_subtyp !== P_NONE) {
      wearmask = wearmask | W_WEP;
    }
    if (protects(o, (o.owornmask & wearmask) !== 0 ? TRUE : FALSE)) {
      gotprot = TRUE;
    }
  }
  if (gotprot) {
    if (mc < 3) {
      mc += 1;
    }
  } else if (mc < 1) {
    if (is_you && (G.u.uprops[PROTECTION].intrinsic && G.u.ublessed > 0 || G.u.uspellprot) || (mon.data === $sat(G.mons, PM_ALIGNED_PRIEST) || (mon.data.mflags2 & 4096) >>> 0 !== 0)) {
      mc = 1;
    }
  }
  return mc;
}

async function hitmu(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let $g = 0;
  let mdat = null;
  let uncancelled = 0;
  let ptmp = 0;
  let dmg = new Int32Array(1);
  let armpro = 0;
  let permdmg = 0;
  let tmphp = 0;
  let buf = new Int8Array(256);
  let olduasmon = null;
  let res = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mdat = mtmp.data;
      buf = new Int8Array(256);
      olduasmon = G.youmonst.data;
      if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        await map_invisible(mtmp.mx, mtmp.my);
      }
      if (mtmp.mundetected | 0 && ((mdat.mflags1 & 128) >>> 0 !== 0 || mdat.mlet === S_EEL)) {
        mtmp.mundetected = 0;
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic ? 1 : 0 : G.u.uprops[TELEPAT].extrinsic)) {
          let obj = null;
          let what = null;
          if (!!(obj = G.level.objects[mtmp.mx][mtmp.my])) {
            if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !obj.dknown) {
              what = G.c_common_strings.c_something;
            } else if (is_pool(mtmp.mx, mtmp.my) && !G.u.uinwater) {
              what = S("the water");
            } else {
              what = await doname(obj);
            }
            await pline(S("%s was hidden under %s!"), await Amonnam(mtmp), what);
          }
          await newsym(mtmp.mx, mtmp.my);
        }
      }
      dmg[0] = d(mattk.damn, mattk.damd);
      if (((mdat.mflags2 & 2) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) && midnight()) {
        dmg[0] += d(mattk.damn, mattk.damd);
      }
      armpro = magic_negation(G.youmonst);
      uncancelled = !mtmp.mcan && rn2(10) >= 3 * armpro ? 1 : 0;
      permdmg = 0;
      switch (mattk.adtyp) {
      case 0: { $g = 4; continue $L; }
      case 33: { $g = 5; continue $L; }
      case 2: { $g = 6; continue $L; }
      case 3: { $g = 7; continue $L; }
      case 6: { $g = 8; continue $L; }
      case 4: { $g = 9; continue $L; }
      case 11: { $g = 10; continue $L; }
      case 7: { $g = 11; continue $L; }
      case 30: { $g = 12; continue $L; }
      case 31: { $g = 13; continue $L; }
      case 32: { $g = 14; continue $L; }
      case 14: { $g = 15; continue $L; }
      case 15: { $g = 16; continue $L; }
      case 17: { $g = 17; continue $L; }
      case 18: { $g = 18; continue $L; }
      case 19: { $g = 19; continue $L; }
      case 28: { $g = 20; continue $L; }
      case 29: { $g = 21; continue $L; }
      case 20: { $g = 22; continue $L; }
      case 35: { $g = 23; continue $L; }
      case 21: { $g = 24; continue $L; }
      case 22: { $g = 25; continue $L; }
      case 252: { $g = 26; continue $L; }
      case 23: { $g = 27; continue $L; }
      case 24: { $g = 28; continue $L; }
      case 42: { $g = 29; continue $L; }
      case 34: { $g = 30; continue $L; }
      case 27: { $g = 31; continue $L; }
      case 253: { $g = 32; continue $L; }
      case 12: { $g = 33; continue $L; }
      case 8: { $g = 34; continue $L; }
      case 13: { $g = 35; continue $L; }
      case 16: { $g = 36; continue $L; }
      case 25: { $g = 37; continue $L; }
      case 37: { $g = 38; continue $L; }
      case 38: { $g = 39; continue $L; }
      case 39: { $g = 40; continue $L; }
      case 40: { $g = 41; continue $L; }
      case 41: { $g = 42; continue $L; }
      default: { $g = 43; continue $L; }
      }
    case 4:
      if (mattk.aatyp === AT_HUGS && !sticks(G.youmonst.data)) {
        if (!G.u.ustuck && rn2(2)) {
          if (await u_slip_free(mtmp, mattk)) {
            dmg[0] = 0;
          } else {
            G.u.ustuck = mtmp;
            await pline(S("%s grabs you!"), await Monnam(mtmp));
          }
        } else if (G.u.ustuck === mtmp) {
          await exercise(A_STR, FALSE);
          await You(S("are being %s."), mtmp.data === $sat(G.mons, PM_ROPE_GOLEM) ? S("choked") : S("crushed"));
        }
      } else {
        let otmp = mon_currwep;
        if (mattk.aatyp === AT_WEAP && otmp) {
          let marmg = null;
          let tmp = 0;
          if (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9))) {
            dmg[0] = 1;
            await pline(S("%s hits you with the %s corpse."), await Monnam(mtmp), G.mons[otmp.corpsenm].mname);
            if (!G.u.uprops[STONED].intrinsic) {
              { $g = 1; continue $L; }
            }
          }
          dmg[0] += await dmgval(otmp, G.youmonst);
          if (!!(marmg = await which_armor(mtmp, W_ARMG)) && marmg.otyp === GAUNTLETS_OF_POWER) {
            dmg[0] += rn2(4) + 3;
          }
          if (dmg[0] <= 0) {
            dmg[0] = 1;
          }
          if (!(otmp.oartifact && await artifact_hit(mtmp, G.youmonst, otmp, P(dmg, 0), dieroll))) {
            await hitmsg(mtmp, mattk);
          }
          if (!dmg[0]) {
            { $g = 3; continue $L; };
          }
          if ((G.objects[otmp.otyp].oc_material | 0) === SILVER && (G.u.ulycn >= -1 + 1 || hates_silver(G.youmonst.data))) {
            await pline_The(S("silver sears your flesh!"));
            await exercise(A_CON, FALSE);
          }
          tmp = dmg[0];
          if (G.u.uac < 0) {
            tmp -= rnd(-G.u.uac);
          }
          if (tmp < 1) {
            tmp = 1;
          }
          if (G.u.mh - tmp > 1 && ((G.objects[otmp.otyp].oc_material | 0) === IRON || (G.objects[otmp.otyp].oc_material | 0) === METAL) && (G.u.umonnum === PM_BLACK_PUDDING || G.u.umonnum === PM_BROWN_PUDDING)) {
            if (tmp > 1) {
              await exercise(A_STR, FALSE);
            }
            G.u.mh -= tmp;
            G.context.botl = 1;
            dmg[0] = 0;
            if (await cloneu()) {
              await You(S("divide as %s hits you!"), await mon_nam(mtmp));
            }
          }
          await rustm(G.youmonst, otmp);
        } else if (mattk.aatyp !== AT_TUCH || dmg[0] !== 0 || mtmp !== G.u.ustuck) {
          await hitmsg(mtmp, mattk);
        }
      }
      { $g = 3; continue $L; };
    case 5:
      await hitmsg(mtmp, mattk);
      if (!await diseasemu(mdat)) {
        dmg[0] = 0;
      }
      { $g = 3; continue $L; };
    case 6:
      await hitmsg(mtmp, mattk);
      if (uncancelled) {
        await pline(S("You're %s!"), await on_fire(G.youmonst.data, mattk));
        if (G.youmonst.data === $sat(G.mons, 246) || G.youmonst.data === $sat(G.mons, 245)) {
          await You(S("go up in flames!"));
          await rehumanize();
          { $g = 3; continue $L; };
        } else if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
          await pline_The(S("fire doesn't feel hot!"));
          dmg[0] = 0;
        }
        if (mtmp.m_lev > rn2(20)) {
          await destroy_item(SCROLL_CLASS, AD_FIRE);
        }
        if (mtmp.m_lev > rn2(20)) {
          await destroy_item(POTION_CLASS, AD_FIRE);
        }
        if (mtmp.m_lev > rn2(25)) {
          await destroy_item(SPBOOK_CLASS, AD_FIRE);
        }
        await burn_away_slime();
      } else {
        dmg[0] = 0;
      }
      { $g = 3; continue $L; };
    case 7:
      await hitmsg(mtmp, mattk);
      if (uncancelled) {
        await pline(S("You're covered in frost!"));
        if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
          await pline_The(S("frost doesn't seem cold!"));
          dmg[0] = 0;
        }
        if (mtmp.m_lev > rn2(20)) {
          await destroy_item(POTION_CLASS, AD_COLD);
        }
      } else {
        dmg[0] = 0;
      }
      { $g = 3; continue $L; };
    case 8:
      await hitmsg(mtmp, mattk);
      if (uncancelled) {
        await You(S("get zapped!"));
        if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
          await pline_The(S("zap doesn't shock you!"));
          dmg[0] = 0;
        }
        if (mtmp.m_lev > rn2(20)) {
          await destroy_item(WAND_CLASS, AD_ELEC);
        }
        if (mtmp.m_lev > rn2(20)) {
          await destroy_item(RING_CLASS, AD_ELEC);
        }
      } else {
        dmg[0] = 0;
      }
      { $g = 3; continue $L; };
    case 9:
      await hitmsg(mtmp, mattk);
      if (uncancelled && G.multi >= 0 && !rn2(5)) {
        if (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic) {
          { $g = 3; continue $L; };
        }
        await fall_asleep(-rnd(10), TRUE);
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await You(S("are put to sleep!"));
        } else {
          await You(S("are put to sleep by %s!"), await mon_nam(mtmp));
        }
      }
      { $g = 3; continue $L; };
    case 10:
      if (can_blnd(mtmp, G.youmonst, mattk.aatyp, null)) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s blinds you!"), await Monnam(mtmp));
        }
        await make_blinded(G.u.uprops[BLINDED].intrinsic + dmg[0], FALSE);
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await Your(S("%s"), G.c_common_strings.c_vision_clears);
        }
      }
      dmg[0] = 0;
      { $g = 3; continue $L; };
    case 11:
      ptmp = A_STR;
      { $g = 2; continue $L; }
    case 12:
      ptmp = A_DEX;
      { $g = 2; continue $L; }
    case 13:
      ptmp = A_CON;
    case 2: // dopois
      await hitmsg(mtmp, mattk);
      if (uncancelled && !rn2(8)) {
        sprintf(P(buf), S("%s %s"), s_suffix(await Monnam(mtmp)), mpoisons_subj(mtmp, mattk));
        await poisoned(P(buf), ptmp, mdat.mname, 30, FALSE);
      }
      { $g = 3; continue $L; };
    case 14:
      await hitmsg(mtmp, mattk);
      if (defends(AD_DRIN, G.uwep) || !((G.youmonst.data.mflags1 & 32768) >>> 0 === 0)) {
        await You(S("don't seem harmed."));
        { $g = 3; continue $L; };
      }
      if (await u_slip_free(mtmp, mattk)) {
        { $g = 3; continue $L; };
      }
      if (G.uarmh && rn2(8)) {
        await Your(S("%s blocks the attack to your head."), helm_simple_name(G.uarmh));
        { $g = 3; continue $L; };
      }
      if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) {
        dmg[0] = (dmg[0] + 1) / 2 | 0;
      }
      await mdamageu(mtmp, dmg[0]);
      dmg[0] = 0;
      if (!G.uarmh || G.uarmh.otyp !== DUNCE_CAP) {
        if (await eat_brains(mtmp, G.youmonst, TRUE, null) === MM_MISS) {
          { $g = 3; continue $L; };
        }
      }
      await adjattrib(A_INT, -rnd(2), FALSE);
      await forget_levels(25);
      await forget_objects(25);
      { $g = 3; continue $L; };
    case 15:
      await hitmsg(mtmp, mattk);
      if (uncancelled && G.multi >= 0 && !rn2(3)) {
        if (G.u.uprops[FREE_ACTION].extrinsic) {
          await You(S("momentarily stiffen."));
        } else {
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await You(S("are frozen!"));
          } else {
            await You(S("are frozen by %s!"), await mon_nam(mtmp));
          }
          G.nomovemsg = G.c_common_strings.c_You_can_move_again;
          nomul(-rnd(10));
          G.multi_reason = S("paralyzed by a monster");
          await exercise(A_DEX, FALSE);
        }
      }
      { $g = 3; continue $L; };
    case 16:
      await hitmsg(mtmp, mattk);
      if (uncancelled && !rn2(3) && !(G.u.uprops[DRAIN_RES].intrinsic || G.u.uprops[DRAIN_RES].extrinsic)) {
        await losexp(S("life drainage"));
      }
      { $g = 3; continue $L; };
    case 17:
      {
        let side = rn2(2) ? RIGHT_SIDE : LEFT_SIDE;
        let sidestr = side === RIGHT_SIDE ? S("right") : S("left");
        let Monst_name = await Monnam(mtmp);
        let leg = body_part(LEG);
        if ((G.u.usteed || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !((mtmp.data.mflags1 & 1) >>> 0 !== 0)) {
          await pline(S("%s tries to reach your %s %s!"), Monst_name, sidestr, leg);
          dmg[0] = 0;
        } else if (mtmp.mcan) {
          await pline(S("%s nuzzles against your %s %s!"), await Monnam(mtmp), sidestr, leg);
          dmg[0] = 0;
        } else {
          if (G.uarmf) {
            if (rn2(2) && (G.uarmf.otyp === LOW_BOOTS || G.uarmf.otyp === IRON_SHOES)) {
              await pline(S("%s pricks the exposed part of your %s %s!"), Monst_name, sidestr, leg);
            } else if (!rn2(5)) {
              await pline(S("%s pricks through your %s boot!"), Monst_name, sidestr);
            } else {
              await pline(S("%s scratches your %s boot!"), Monst_name, sidestr);
              dmg[0] = 0;
              { $g = 3; continue $L; };
            }
          } else {
            await pline(S("%s pricks your %s %s!"), Monst_name, sidestr, leg);
          }
          await set_wounded_legs(side, rnd(60 - acurr(A_DEX)));
          await exercise(A_STR, FALSE);
          await exercise(A_DEX, FALSE);
        }
        { $g = 3; continue $L; };
      }
    case 18:
      await hitmsg(mtmp, mattk);
      if (!!rn2(3)) { $g = 44; continue $L; }
      if (!mtmp.mcan) { $g = 46; continue $L; }
      {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await You_hear(S("a cough from %s!"), await mon_nam(mtmp));
        }
      }
      { $g = 45; continue $L; }
    case 46:
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await You_hear(S("%s hissing!"), s_suffix(await mon_nam(mtmp)));
      }
      if (!(!rn2(10) || G.flags.moonphase === NEW_MOON && !have_lizard())) { $g = 47; continue $L; }
    case 1: // do_stone
      if (!G.u.uprops[STONED].intrinsic && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
        let kformat = KILLED_BY_AN;
        let kname = mtmp.data.mname;
        if (mtmp.data.geno & G_UNIQ) {
          if (!((mtmp.data.mflags2 & 524288) >>> 0 !== 0)) {
            kname = await the(kname);
          }
          kformat = KILLED_BY;
        }
        await make_stoned(5, null, kformat, kname);
        return 1;
      }
    case 47:
    case 45:
    case 44:
      { $g = 3; continue $L; };
    case 19:
      await hitmsg(mtmp, mattk);
      if (uncancelled && !G.u.ustuck && !sticks(G.youmonst.data)) {
        G.u.ustuck = mtmp;
      }
      { $g = 3; continue $L; };
    case 20:
      if ((!mtmp.mcan || G.u.ustuck === mtmp) && !sticks(G.youmonst.data)) {
        if (!G.u.ustuck && !rn2(10)) {
          if (await u_slip_free(mtmp, mattk)) {
            dmg[0] = 0;
          } else {
            await pline(S("%s swings itself around you!"), await Monnam(mtmp));
            G.u.ustuck = mtmp;
          }
        } else if (G.u.ustuck === mtmp) {
          if (is_pool(mtmp.mx, mtmp.my) && !(G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) && !(G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0)) {
            let moat = ($at2(G.level.locations, mtmp.mx, mtmp.my).typ !== POOL && $at2(G.level.locations, mtmp.mx, mtmp.my).typ !== WATER && !((G.dungeon_topology.d_medusa_level.dlevel || G.dungeon_topology.d_medusa_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_medusa_level)) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
            await pline(S("%s drowns you..."), await Monnam(mtmp));
            G.killer.format = KILLED_BY_AN;
            sprintf(P(G.killer.name), S("%s by %s"), moat ? S("moat") : S("pool of water"), await an(mtmp.data.mname));
            await done(DROWNING);
          } else if (mattk.aatyp === AT_HUGS) {
            await You(S("are being crushed."));
          }
        } else {
          dmg[0] = 0;
          if (G.flags.verbose) {
            await pline(S("%s brushes against your %s."), await Monnam(mtmp), body_part(LEG));
          }
        }
      } else {
        dmg[0] = 0;
      }
      { $g = 3; continue $L; };
    case 21:
      await hitmsg(mtmp, mattk);
      if (uncancelled && !rn2(4) && G.u.ulycn === NON_PM && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !defends(AD_WERE, G.uwep)) {
        await You_feel(S("feverish."));
        await exercise(A_CON, FALSE);
        await set_ulycn(await monsndx(mdat));
        await retouch_equipment(2);
      }
      { $g = 3; continue $L; };
    case 22:
      await hitmsg(mtmp, mattk);
      if (G.youmonst.data.mlet === mdat.mlet) {
        { $g = 3; continue $L; };
      }
      if (!mtmp.mcan) {
        await stealgold(mtmp);
      }
      { $g = 3; continue $L; };
    case 23:
      if (G.sysopt.seduce) {
        if (could_seduce(mtmp, G.youmonst, mattk) === 1 && !mtmp.mcan) {
          if (await doseduce(mtmp)) {
            return 3;
          }
        }
        { $g = 3; continue $L; };
      }
    case 24:
    case 25:
      if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0) {
        await hitmsg(mtmp, mattk);
        if (mtmp.mcan) {
          { $g = 3; continue $L; };
        }
      } else if (dmgtype(G.youmonst.data, AD_SEDU) || dmgtype(G.youmonst.data, AD_SSEX)) {
        await pline(S("%s %s."), await Monnam(mtmp), G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("says something but you can't hear it") : mtmp.minvent ? S("brags about the goods some dungeon explorer provided") : S("makes some remarks about how difficult theft is lately"));
        if (!await tele_restrict(mtmp)) {
          await rloc(mtmp, TRUE);
        }
        return 3;
      } else if (mtmp.mcan) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s tries to %s you, but you seem %s."), await Adjmonnam(mtmp, S("plain")), G.flags.female ? S("charm") : S("seduce"), G.flags.female ? S("unaffected") : S("uninterested"));
        }
        if (rn2(3)) {
          if (!await tele_restrict(mtmp)) {
            await rloc(mtmp, TRUE);
          }
          return 3;
        }
        { $g = 3; continue $L; };
      }
      buf[0] = 0;
      switch (await steal(mtmp, P(buf))) {
      case -1:
        return 2;
      case 0:
        break;
      default:
        if (!((mtmp.data.mflags1 & 262144) >>> 0 !== 0) && !await tele_restrict(mtmp)) {
          await rloc(mtmp, TRUE);
        }
        if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0 && $rd(P(buf))) {
          if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
            await pline(S("%s tries to %s away with %s."), await Monnam(mtmp), locomotion(mtmp.data, S("run")), P(buf));
          }
        }
        await monflee(mtmp, 0, FALSE, FALSE);
        return 3;
      }
      { $g = 3; continue $L; };
    case 26:
      await hitmsg(mtmp, mattk);
      if (!rn2(20)) {
        await stealamulet(mtmp);
      }
      { $g = 3; continue $L; };
    case 27:
      await hitmsg(mtmp, mattk);
      if (uncancelled) {
        if (G.flags.verbose) {
          await Your(S("position suddenly seems %suncertain!"), (G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic) && !G.u.uprops[STUNNED].intrinsic && !unconscious() ? S("") : S("very "));
        }
        await tele();
        if ((G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg[0] - 1) / 2 | 0 : dmg[0]) >= (tmphp = G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp)) {
          dmg[0] = tmphp - 1;
          if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) {
            dmg[0] = dmg[0] * 2;
          }
          if (dmg[0] < 1) {
            dmg[0] = 1;
            if (G.u.umonnum !== G.u.umonster && G.u.mh === 1) {
              ++G.u.mh;
            } else if (!(G.u.umonnum !== G.u.umonster) && G.u.uhp === 1) {
              ++G.u.uhp;
            }
          }
        }
      }
      { $g = 3; continue $L; };
    case 28:
      await hitmsg(mtmp, mattk);
      if (mtmp.mcan) {
        { $g = 3; continue $L; };
      }
      if (G.u.umonnum === PM_IRON_GOLEM) {
        await You(S("rust!"));
        await rehumanize();
        { $g = 3; continue $L; };
      }
      await erode_armor(G.youmonst, ERODE_RUST);
      { $g = 3; continue $L; };
    case 29:
      await hitmsg(mtmp, mattk);
      if (mtmp.mcan) {
        { $g = 3; continue $L; };
      }
      await erode_armor(G.youmonst, ERODE_CORRODE);
      { $g = 3; continue $L; };
    case 30:
      await hitmsg(mtmp, mattk);
      if (mtmp.mcan) {
        { $g = 3; continue $L; };
      }
      if (G.u.umonnum === PM_WOOD_GOLEM || G.u.umonnum === PM_LEATHER_GOLEM) {
        await You(S("rot!"));
        await rehumanize();
        { $g = 3; continue $L; };
      }
      await erode_armor(G.youmonst, ERODE_ROT);
      { $g = 3; continue $L; };
    case 31:
      if (mtmp.mcan | 0 || G.u.umonnum !== G.u.umonster && (G.youmonst.data === $sat(G.mons, 10) || G.youmonst.data === $sat(G.mons, 9))) {
        await hitmsg(mtmp, mattk);
        { $g = 3; continue $L; };
      }
      if (!G.uwep && !G.uarmu && !G.uarm && !G.uarmc && !G.uarms && !G.uarmg && !G.uarmf && !G.uarmh) {
        let goaway = FALSE;
        await pline(S("%s hits!  (I hope you don't mind.)"), await Monnam(mtmp));
        if (G.u.umonnum !== G.u.umonster) {
          G.u.mh += rnd(7);
          if (!rn2(7)) {
            ++G.u.mhmax;
            if (!rn2(13)) {
              goaway = TRUE;
            }
          }
          if (G.u.mh > G.u.mhmax) {
            G.u.mh = G.u.mhmax;
          }
        } else {
          G.u.uhp += rnd(7);
          if (!rn2(7)) {
            if (G.u.uhpmax < 5 * G.u.ulevel + d(2 * G.u.ulevel, 10)) {
              ++G.u.uhpmax;
            }
            if (!rn2(13)) {
              goaway = TRUE;
            }
          }
          if (G.u.uhp > G.u.uhpmax) {
            G.u.uhp = G.u.uhpmax;
          }
        }
        if (!rn2(3)) {
          await exercise(A_STR, TRUE);
        }
        if (!rn2(3)) {
          await exercise(A_CON, TRUE);
        }
        if (G.u.uprops[SICK].intrinsic) {
          await make_sick(0, null, FALSE, SICK_ALL);
        }
        G.context.botl = 1;
        if (goaway) {
          await mongone(mtmp);
          return 2;
        } else if (!rn2(33)) {
          if (!await tele_restrict(mtmp)) {
            await rloc(mtmp, TRUE);
          }
          await monflee(mtmp, d(3, 6), TRUE, FALSE);
          return 3;
        }
        dmg[0] = 0;
      } else {
        if (G.urole.malenum === 332) {
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(G.moves % 5)) {
            await verbalize(S("Doc, I can't help you unless you cooperate."));
          }
          dmg[0] = 0;
        } else {
          await hitmsg(mtmp, mattk);
        }
      }
      { $g = 3; continue $L; };
    case 32:
      await hitmsg(mtmp, mattk);
      if (!night() && mdat === $sat(G.mons, PM_GREMLIN)) {
        { $g = 3; continue $L; };
      }
      if (!mtmp.mcan && !rn2(10)) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await You_hear(S("laughter."));
          } else {
            await pline(S("%s chuckles."), await Monnam(mtmp));
          }
        }
        if (G.u.umonnum === PM_CLAY_GOLEM) {
          await pline(S("Some writing vanishes from your head!"));
          await rehumanize();
          { $g = 3; continue $L; };
        }
        await attrcurse();
      }
      { $g = 3; continue $L; };
    case 33:
      await hitmsg(mtmp, mattk);
      if (!mtmp.mcan && !rn2(4)) {
        await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + dmg[0], TRUE);
        dmg[0] = dmg[0] / 2 | 0;
      }
      { $g = 3; continue $L; };
    case 34:
      await hitmsg(mtmp, mattk);
      if (!mtmp.mcan && !rn2(3)) {
        if (G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic) {
          await pline(S("You're covered in %s, but it seems harmless."), hliquid(S("acid")));
          dmg[0] = 0;
        } else {
          await pline(S("You're covered in %s!  It burns!"), hliquid(S("acid")));
          await exercise(A_STR, FALSE);
        }
      } else {
        dmg[0] = 0;
      }
      { $g = 3; continue $L; };
    case 35:
      await hitmsg(mtmp, mattk);
      if (uncancelled && G.u.uprops[FAST].intrinsic && !defends(AD_SLOW, G.uwep) && !rn2(4)) {
        await u_slow_down();
      }
      { $g = 3; continue $L; };
    case 36:
      await hitmsg(mtmp, mattk);
      if (uncancelled && !rn2(4)) {
        await drain_en(dmg[0]);
      }
      dmg[0] = 0;
      { $g = 3; continue $L; };
    case 37:
      await hitmsg(mtmp, mattk);
      if (!mtmp.mcan && !rn2(4) && !mtmp.mspec_used) {
        mtmp.mspec_used = mtmp.mspec_used + (dmg[0] + rn2(6));
        if (G.u.uprops[CONFUSION].intrinsic) {
          await You(S("are getting even more confused."));
        } else {
          await You(S("are getting confused."));
        }
        await make_confused(G.u.uprops[CONFUSION].intrinsic + dmg[0], FALSE);
      }
      dmg[0] = 0;
      { $g = 3; continue $L; };
    case 38:
      await pline(S("%s reaches out with its deadly touch."), await Monnam(mtmp));
      if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0) {
        await pline(S("Was that the touch of death?"));
        { $g = 3; continue $L; };
      }
      switch (rn2(20)) {
      case 19:
      case 18:
      case 17:
        if (!(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic)) {
          G.killer.format = KILLED_BY_AN;
          strcpy(P(G.killer.name), S("touch of death"));
          await done(DIED);
          dmg[0] = 0;
          break;
        }
      default:
        await You_feel(S("your life force draining away..."));
        permdmg = 1;
        break;
      case 4:
      case 3:
      case 2:
      case 1:
      case 0:
        if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
          await shieldeff(G.u.ux, G.u.uy);
        }
        await pline(S("Lucky for you, it didn't work!"));
        dmg[0] = 0;
        break;
      }
      { $g = 3; continue $L; };
    case 39:
      await pline(S("%s reaches out, and you feel fever and chills."), await Monnam(mtmp));
      await diseasemu(mdat);
      { $g = 3; continue $L; };
    case 40:
      await pline(S("%s reaches out, and your body shrivels."), await Monnam(mtmp));
      await exercise(A_CON, FALSE);
      if (!is_fainted()) {
        await morehungry(rn2(40) + 40);
      }
      { $g = 3; continue $L; };
    case 41:
      await hitmsg(mtmp, mattk);
      if (!uncancelled) {
        { $g = 3; continue $L; };
      }
      if (G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) {
        await pline_The(S("slime burns away!"));
        dmg[0] = 0;
      } else if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic || G.youmonst.data.mlet === S_GHOST || G.youmonst.data === $sat(G.mons, PM_GREEN_SLIME)) {
        await You(S("are unaffected."));
        dmg[0] = 0;
      } else if (!G.u.uprops[SLIMED].intrinsic) {
        await You(S("don't feel very well."));
        await make_slimed(10, null);
        await delayed_killer(SLIMED, KILLED_BY_AN, mtmp.data.mname);
      } else {
        await pline(S("Yuck!"));
      }
      { $g = 3; continue $L; };
    case 42:
      await hitmsg(mtmp, mattk);
      if (uncancelled) {
        let obj = await some_armor(G.youmonst);
        if (!obj) {
          switch (rn2(5)) {
          case 0:
            break;
          case 1:
            obj = G.uright;
            break;
          case 2:
            obj = G.uleft;
            break;
          case 3:
            obj = G.uamul;
            break;
          case 4:
            obj = G.ublindf;
            break;
          }
        }
        if (await drain_item(obj, FALSE)) {
          await pline(S("%s less effective."), await Yobjnam2(obj, S("seem")));
        }
      }
      { $g = 3; continue $L; };
    case 43:
      dmg[0] = 0;
      { $g = 3; continue $L; };
    case 3:
      if ((G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) < 1) {
        await mdamageu(mtmp, 1);
        dmg[0] = 0;
      }
      if (dmg[0] && G.u.uac < 0) {
        dmg[0] -= rnd(-G.u.uac);
        if (dmg[0] < 1) {
          dmg[0] = 1;
        }
      }
      if (dmg[0]) {
        if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic || G.urole.malenum === 335 && G.uarmh && is_quest_artifact(G.uarmh) && ((mtmp.data.mflags2 & 2) >>> 0 !== 0 || (mtmp.data.mflags2 & 256) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224))) {
          dmg[0] = (dmg[0] + 1) / 2 | 0;
        }
        if (permdmg) {
          let lowerlimit = 0;
          let hpmax_p = null;
          permdmg = rn2((dmg[0] / 2 | 0) + 1);
          if (G.u.umonnum !== G.u.umonster || G.u.uhpmax > 25 * G.u.ulevel) {
            permdmg = dmg[0];
          } else if (G.u.uhpmax > 10 * G.u.ulevel) {
            permdmg += dmg[0] / 2 | 0;
          } else if (G.u.uhpmax > 5 * G.u.ulevel) {
            permdmg += dmg[0] / 4 | 0;
          }
          if (G.u.umonnum !== G.u.umonster) {
            hpmax_p = P(G.u, "mhmax");
            lowerlimit = G.youmonst.data.mlevel < G.u.ulevel ? G.youmonst.data.mlevel : G.u.ulevel;
          } else {
            hpmax_p = P(G.u, "uhpmax");
            lowerlimit = G.u.ulevel;
          }
          if (hpmax_p.a[hpmax_p.o] - permdmg > lowerlimit) {
            hpmax_p.a[hpmax_p.o] -= permdmg;
          } else if (hpmax_p.a[hpmax_p.o] > lowerlimit) {
            hpmax_p.a[hpmax_p.o] = lowerlimit;
          }
          G.context.botl = 1;
        }
        await mdamageu(mtmp, dmg[0]);
      }
      if (dmg[0]) {
        res = await passiveum(olduasmon, mtmp, mattk);
      } else {
        res = 1;
      }
      await stop_occupation();
      return res;
    }
    break;
  }
}

export async function gulp_blnd_check(): Promise<number> {
  let mattk = null;
  if (!G.u.uprops[BLINDED].intrinsic && G.u.uswallow | 0 && (mattk = attacktype_fordmg(G.u.ustuck.data, AT_ENGL, AD_BLND)) && can_blnd(G.u.ustuck, G.youmonst, mattk.aatyp, null)) {
    G.u.uswldtim = G.u.uswldtim + 1 >>> 0;
    await gulpmu(G.u.ustuck, mattk);
    return TRUE;
  }
  return FALSE;
}

async function gulpmu(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let t = t_at(G.u.ux, G.u.uy);
  let tmp = d(mattk.damn, mattk.damd);
  let tim_tmp = 0;
  let otmp2 = null;
  let i = 0;
  let physical_damage = FALSE;
  if (!G.u.uswallow) {
    let omx = mtmp.mx;
    let omy = mtmp.my;
    if (!engulf_target(mtmp, G.youmonst)) {
      return 0;
    }
    if (t && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT) && sobj_at(BOULDER, G.u.ux, G.u.uy)) {
      return 0;
    }
    if (!!G.uball) {
      await unplacebc();
    }
    G.level.monsters[omx][omy] = null;
    mtmp.mtrapped = 0;
    await place_monster(mtmp, G.u.ux, G.u.uy);
    G.u.ustuck = mtmp;
    await newsym(mtmp.mx, mtmp.my);
    if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0 && G.u.usteed) {
      let buf = new Int8Array(256);
      strcpy(P(buf), await mon_nam(G.u.usteed));
      await pline(S("%s lunges forward and plucks you off %s!"), await Monnam(mtmp), P(buf));
      await dismount_steed(DISMOUNT_ENGULFED);
    } else {
      await pline(S("%s engulfs you!"), await Monnam(mtmp));
    }
    await stop_occupation();
    reset_occupations();
    if (G.u.utrap) {
      await You(S("are released from the %s!"), G.u.utraptype === TT_WEB ? S("web") : S("trap"));
      await reset_utrap(FALSE);
    }
    i = number_leashed();
    if (i > 0) {
      let s = i > 1 ? S("leashes") : S("leash");
      await pline_The(S("%s %s loose."), s, vtense(s, S("snap")));
      unleash_all();
    }
    if ((G.youmonst.data === $sat(G.mons, 10) || G.youmonst.data === $sat(G.mons, 9)) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0)) {
      G.level.monsters[mtmp.mx][mtmp.my] = null;
      await place_monster(mtmp, omx, omy);
      await minstapetrify(mtmp, TRUE);
      if (!!G.uball) {
        await placebc();
      }
      G.u.ustuck = null;
      return !(mtmp.mhp < 1) ? 0 : 2;
    }
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    await vision_recalc(2);
    G.u.uswallow = 1;
    if (mattk.adtyp === AD_DGST) {
      tim_tmp = 25 - mtmp.m_lev;
      if (tim_tmp > 0) {
        tim_tmp = rnd(tim_tmp) / 2 | 0;
      } else if (tim_tmp < 0) {
        tim_tmp = -(rnd(-tim_tmp) / 2 | 0);
      }
      tim_tmp += -G.u.uac + 10 + ((acurr(A_CON) / 3 | 0) - 1);
    } else {
      tim_tmp = rnd(mtmp.m_lev + (10 / 2 | 0));
    }
    G.u.uswldtim = (tim_tmp < 2 ? 2 : tim_tmp) >>> 0;
    await swallowed(1);
    for (otmp2 = G.invent; otmp2; otmp2 = otmp2.nobj) {
      await snuff_lit(otmp2);
    }
  }
  if (mtmp !== G.u.ustuck) {
    return 0;
  }
  if (!!G.uball) {
    if (G.uchain.where === OBJ_FREE) {
      G.uchain.ox = mtmp.mx, G.uchain.oy = mtmp.my;
    }
    if (G.uball.where === OBJ_FREE) {
      G.uball.ox = mtmp.mx, G.uball.oy = mtmp.my;
    }
  }
  if (G.u.uswldtim > 0) {
    G.u.uswldtim = G.u.uswldtim - 1 >>> 0;
  }
  switch (mattk.adtyp) {
  case 26:
    physical_damage = TRUE;
    if (G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic) {
      G.u.uswldtim = 0;
      tmp = 0;
    } else if (G.u.uswldtim === 0) {
      await pline(S("%s totally digests you!"), await Monnam(mtmp));
      tmp = G.u.uhp;
      if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) {
        tmp = tmp * 2;
      }
    } else {
      await pline(S("%s%s digests you!"), await Monnam(mtmp), G.u.uswldtim === 2 ? S(" thoroughly") : G.u.uswldtim === 1 ? S(" utterly") : S(""));
      await exercise(A_STR, FALSE);
    }
    break;
  case 0:
    physical_damage = TRUE;
    if (mtmp.data === $sat(G.mons, PM_FOG_CLOUD)) {
      await You(S("are laden with moisture and %s"), G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326) ? S("are smoldering out!") : G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0 ? S("find it mildly uncomfortable.") : (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0 ? S("feel comforted.") : S("can barely breathe!"));
      if ((G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0) && !(G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326))) {
        tmp = 0;
      }
    } else {
      await You(S("are pummeled with debris!"));
      await exercise(A_STR, FALSE);
    }
    break;
  case 8:
    if (G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic) {
      await You(S("are covered with a seemingly harmless goo."));
      tmp = 0;
    } else {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("Ouch!  You've been slimed!"));
      } else {
        await You(S("are covered in slime!  It burns!"));
      }
      await exercise(A_STR, FALSE);
    }
    break;
  case 11:
    if (can_blnd(mtmp, G.youmonst, mattk.aatyp, null)) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        let was_blinded = G.u.uprops[BLINDED].intrinsic;
        if (!G.u.uprops[BLINDED].intrinsic) {
          await You_cant(S("see in here!"));
        }
        await make_blinded(tmp, FALSE);
        if (!was_blinded && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await Your(S("%s"), G.c_common_strings.c_vision_clears);
        }
      } else {
        await make_blinded(G.u.uprops[BLINDED].intrinsic + 1, FALSE);
      }
    }
    tmp = 0;
    break;
  case 6:
    if (!mtmp.mcan && rn2(2)) {
      await pline_The(S("air around you crackles with electricity."));
      if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
        await shieldeff(G.u.ux, G.u.uy);
        await You(S("seem unhurt."));
        await ugolemeffects(AD_ELEC, tmp);
        tmp = 0;
      }
    } else {
      tmp = 0;
    }
    break;
  case 3:
    if (!mtmp.mcan && rn2(2)) {
      if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
        await shieldeff(G.u.ux, G.u.uy);
        await You_feel(S("mildly chilly."));
        await ugolemeffects(AD_COLD, tmp);
        tmp = 0;
      } else {
        await You(S("are freezing to death!"));
      }
    } else {
      tmp = 0;
    }
    break;
  case 2:
    if (!mtmp.mcan && rn2(2)) {
      if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
        await shieldeff(G.u.ux, G.u.uy);
        await You_feel(S("mildly hot."));
        await ugolemeffects(AD_FIRE, tmp);
        tmp = 0;
      } else {
        await You(S("are burning to a crisp!"));
      }
      await burn_away_slime();
    } else {
      tmp = 0;
    }
    break;
  case 33:
    if (!await diseasemu(mtmp.data)) {
      tmp = 0;
    }
    break;
  case 16:
    if (!mtmp.mcan && rn2(4)) {
      await drain_en(tmp);
    }
    tmp = 0;
    break;
  default:
    physical_damage = TRUE;
    tmp = 0;
    break;
  }
  if (physical_damage) {
    tmp = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp;
  }
  await mdamageu(mtmp, tmp);
  if (tmp) {
    await stop_occupation();
  }
  if (!G.u.uswallow) {
    ;
  } else if ((G.youmonst.data === $sat(G.mons, 10) || G.youmonst.data === $sat(G.mons, 9)) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0)) {
    await pline(S("%s very hurriedly %s you!"), await Monnam(mtmp), (mtmp.data.mflags1 & 262144) >>> 0 !== 0 ? S("regurgitates") : S("expels"));
    await expels(mtmp, mtmp.data, FALSE);
  } else if (!G.u.uswldtim || G.youmonst.data.msize >= MZ_HUGE) {
    await You(S("get %s!"), (mtmp.data.mflags1 & 262144) >>> 0 !== 0 ? S("regurgitated") : S("expelled"));
    if (G.flags.verbose && ((mtmp.data.mflags1 & 262144) >>> 0 !== 0 || dmgtype(mtmp.data, AD_DGST) && (G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic))) {
      await pline(S("Obviously %s doesn't like your taste."), await mon_nam(mtmp));
    }
    await expels(mtmp, mtmp.data, FALSE);
  }
  return 1;
}

async function explmu(mtmp: struct_monst | null, mattk: struct_attack | null, ufound: number): Promise<number> {
  let $g = 0;
  let physical_damage = 0;
  let kill_agr = 0;
  let tmp = 0;
  let not_affected = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      physical_damage = TRUE;
      kill_agr = TRUE;
      if (mtmp.mcan) {
        return 0;
      }
      if (!!ufound) { $g = 3; continue $L; }
      {
        await pline(S("%s explodes at a spot in %s!"), (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? await Monnam(mtmp) : S("It"), $at2(G.level.locations, mtmp.mux, mtmp.muy).typ === WATER ? S("empty water") : S("thin air"));
      }
      { $g = 2; continue $L; }
    case 3:
      tmp = d(mattk.damn, mattk.damd);
      not_affected = defends(mattk.adtyp, G.uwep);
      await hitmsg(mtmp, mattk);
      switch (mattk.adtyp) {
      case 3: { $g = 5; continue $L; }
      case 2: { $g = 6; continue $L; }
      case 6: { $g = 7; continue $L; }
      case 0: { $g = 8; continue $L; }
      case 11: { $g = 9; continue $L; }
      case 36: { $g = 10; continue $L; }
      default: { $g = 11; continue $L; }
      }
    case 5:
      physical_damage = FALSE;
      not_affected = (not_affected | (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic ? 1 : 0)) << 24 >> 24;
      { $g = 1; continue $L; }
    case 6:
      physical_damage = FALSE;
      not_affected = (not_affected | (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic ? 1 : 0)) << 24 >> 24;
      { $g = 1; continue $L; }
    case 7:
      physical_damage = FALSE;
      not_affected = (not_affected | (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic ? 1 : 0)) << 24 >> 24;
      { $g = 1; continue $L; }
    case 8:
    case 1: // common
      if (!not_affected) {
        if (acurr(A_DEX) > rnd(20)) {
          await You(S("duck some of the blast."));
          tmp = (tmp + 1) / 2 | 0;
        } else {
          if (G.flags.verbose) {
            await You(S("get blasted!"));
          }
        }
        if (mattk.adtyp === AD_FIRE) {
          await burn_away_slime();
        }
        if (physical_damage) {
          tmp = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp;
        }
        await mdamageu(mtmp, tmp);
      }
      { $g = 4; continue $L; };
    case 9:
      not_affected = resists_blnd(G.youmonst);
      if (!not_affected) {
        if ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected || rnd(tmp = tmp / 2 | 0) > G.u.ulevel) {
          await You(S("are blinded by a blast of light!"));
          await make_blinded(tmp, FALSE);
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await Your(S("%s"), G.c_common_strings.c_vision_clears);
          }
        } else if (G.flags.verbose) {
          await You(S("get the impression it was not terribly bright."));
        }
      }
      { $g = 4; continue $L; };
    case 10:
      not_affected = (not_affected | ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || (G.u.umonnum === PM_BLACK_LIGHT || G.u.umonnum === PM_VIOLET_FUNGUS || dmgtype(G.youmonst.data, AD_STUN)) ? 1 : 0)) << 24 >> 24;
      if (!not_affected) {
        let chg = 0;
        if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await You(S("are caught in a blast of kaleidoscopic light!"));
        }
        await mondead(mtmp);
        kill_agr = FALSE;
        chg = await make_hallucinated(G.u.uprops[HALLUC].intrinsic + tmp, FALSE, 0);
        await You(S("%s."), chg ? S("are freaked out") : S("seem unaffected"));
      }
      { $g = 4; continue $L; };
    case 11:
      { $g = 4; continue $L; };
    case 4:
      if (not_affected) {
        await You(S("seem unaffected by it."));
        await ugolemeffects(mattk.adtyp, tmp);
      }
    case 2:
      if (kill_agr) {
        await mondead(mtmp);
      }
      wake_nearto(mtmp.mx, mtmp.my, 7 * 7);
      return !(mtmp.mhp < 1) ? 0 : 2;
    }
    break;
  }
}

export async function gazemu(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let react = -1;
  let cancelled = ((mtmp.mcan | 0) !== 0 ? 1 : 0) << 24 >> 24;
  let already = FALSE;
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && rn2(4)) {
    cancelled = TRUE;
  }
  switch (mattk.adtyp) {
  case 18:
    if (cancelled || !mtmp.mcansee) {
      if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
        break;
      }
      await pline(S("%s %s."), await Monnam(mtmp), mtmp.data === $sat(G.mons, PM_MEDUSA) && mtmp.mcan | 0 ? S("doesn't look all that ugly") : S("gazes ineffectually"));
      break;
    }
    if ((G.u.uprops[REFLECTING].intrinsic || G.u.uprops[REFLECTING].extrinsic) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.data === $sat(G.mons, PM_MEDUSA)) {
      let useeit = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
      if (useeit) {
        await ureflects(S("%s gaze is reflected by your %s."), s_suffix(await Monnam(mtmp)));
      }
      if (await mon_reflects(mtmp, !useeit ? null : S("The gaze is reflected away by %s %s!"))) {
        break;
      }
      if (!((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1)) {
        if (useeit) {
          await pline(S("%s doesn't seem to notice that %s gaze was reflected."), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his);
        }
        break;
      }
      if (useeit) {
        await pline(S("%s is turned to stone!"), await Monnam(mtmp));
      }
      G.stoned = TRUE;
      await killed(mtmp);
      if (!(mtmp.mhp < 1)) {
        break;
      }
      return 2;
    }
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
      await You(S("meet %s gaze."), s_suffix(await mon_nam(mtmp)));
      await stop_occupation();
      if (poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM)) {
        break;
      }
      await You(S("turn to stone..."));
      G.killer.format = KILLED_BY;
      strcpy(P(G.killer.name), mtmp.data.mname);
      await done(STONING);
    }
    break;
  case 25:
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.mcansee | 0 && !mtmp.mspec_used && rn2(5)) {
      if (cancelled) {
        react = 0;
        already = ((mtmp.mconf | 0) !== 0 ? 1 : 0) << 24 >> 24;
      } else {
        let conf = d(3, 4);
        mtmp.mspec_used = mtmp.mspec_used + (conf + rn2(6));
        if (!G.u.uprops[CONFUSION].intrinsic) {
          await pline(S("%s gaze confuses you!"), s_suffix(await Monnam(mtmp)));
        } else {
          await You(S("are getting more and more confused."));
        }
        await make_confused(G.u.uprops[CONFUSION].intrinsic + conf, FALSE);
        await stop_occupation();
      }
    }
    break;
  case 12:
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.mcansee | 0 && !mtmp.mspec_used && rn2(5)) {
      if (cancelled) {
        react = 1;
        already = ((mtmp.mstun | 0) !== 0 ? 1 : 0) << 24 >> 24;
      } else {
        let stun = d(2, 6);
        mtmp.mspec_used = mtmp.mspec_used + (stun + rn2(6));
        await pline(S("%s stares piercingly at you!"), await Monnam(mtmp));
        await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + stun, TRUE);
        await stop_occupation();
      }
    }
    break;
  case 11:
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && !resists_blnd(G.youmonst) && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= Math.imul(BOLT_LIM, BOLT_LIM)) {
      if (cancelled) {
        react = rn2(2) + 2;
        already = ((mtmp.mcansee | 0) === 0 ? 1 : 0) << 24 >> 24;
        if (mtmp.mcan | 0 && mtmp.data === $sat(G.mons, PM_ARCHON) && rn2(5)) {
          react = -1;
        }
      } else {
        let blnd = d(mattk.damn, mattk.damd);
        await You(S("are blinded by %s radiance!"), s_suffix(await mon_nam(mtmp)));
        await make_blinded(blnd, FALSE);
        await stop_occupation();
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await Your(S("%s"), G.c_common_strings.c_vision_clears);
        } else {
          let oldstun = G.u.uprops[STUNNED].intrinsic & TIMEOUT;
          let newstun = rnd(3);
          await make_stunned(oldstun > newstun ? oldstun : newstun, TRUE);
        }
      }
    }
    break;
  case 2:
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.mcansee | 0 && !mtmp.mspec_used && rn2(5)) {
      if (cancelled) {
        react = rn2(2) + 4;
      } else {
        let dmg = d(2, 6);
        let lev = mtmp.m_lev;
        await pline(S("%s attacks you with a fiery gaze!"), await Monnam(mtmp));
        await stop_occupation();
        if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
          await pline_The(S("fire doesn't feel hot!"));
          dmg = 0;
        }
        await burn_away_slime();
        if (lev > rn2(20)) {
          await destroy_item(SCROLL_CLASS, AD_FIRE);
        }
        if (lev > rn2(20)) {
          await destroy_item(POTION_CLASS, AD_FIRE);
        }
        if (lev > rn2(25)) {
          await destroy_item(SPBOOK_CLASS, AD_FIRE);
        }
        if (dmg) {
          await mdamageu(mtmp, dmg);
        }
      }
    }
    break;
  default:
    await impossible(S("Gaze attack %d?"), mattk.adtyp);
    break;
  }
  if (react >= 0) {
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && rn2(3)) {
      react = rn2(Math.trunc(64 / 8) | 0);
    }
    await pline(S("%s looks %s%s."), await Monnam(mtmp), !rn2(3) ? S("") : already ? S("quite ") : !rn2(2) ? S("a bit ") : S("somewhat "), gazemu$reactions[react]);
  }
  return 0;
}

export async function mdamageu(mtmp: struct_monst | null, n: number): Promise<void> {
  G.context.botl = 1;
  if (G.u.umonnum !== G.u.umonster) {
    G.u.mh -= n;
    if (G.u.mh < 1) {
      await rehumanize();
    }
  } else {
    G.u.uhp -= n;
    if (G.u.uhp < 1) {
      await done_in_by(mtmp, DIED);
    }
  }
}

export function could_seduce(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): number {
  let pagr = null;
  let agrinvis = 0;
  let defperc = 0;
  let genagr = 0;
  let gendef = 0;
  let adtyp = 0;
  if ((magr.data.mflags1 & 262144) >>> 0 !== 0) {
    return 0;
  }
  if (magr === G.youmonst) {
    pagr = G.youmonst.data;
    agrinvis = (((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked ? 1 : 0) !== 0 ? 1 : 0) << 24 >> 24;
    genagr = poly_gender() << 24 >> 24;
  } else {
    pagr = magr.data;
    agrinvis = magr.minvis << 24 >> 24;
    genagr = gender(magr) << 24 >> 24;
  }
  if (mdef === G.youmonst) {
    defperc = ((G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? 1 : 0) !== 0 ? 1 : 0) << 24 >> 24;
    gendef = poly_gender() << 24 >> 24;
  } else {
    defperc = ((mdef.data.mflags1 & 16777216) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    gendef = gender(mdef) << 24 >> 24;
  }
  adtyp = mattk ? mattk.adtyp : dmgtype(pagr, AD_SSEX) ? AD_SSEX : dmgtype(pagr, AD_SEDU) ? AD_SEDU : AD_PHYS;
  if (adtyp === AD_SSEX && !G.sysopt.seduce) {
    adtyp = AD_SEDU;
  }
  if (agrinvis && !defperc && adtyp === AD_SEDU) {
    return 0;
  }
  if (pagr.mlet !== S_NYMPH && pagr !== $sat(G.mons, PM_INCUBUS) && pagr !== $sat(G.mons, PM_SUCCUBUS) || adtyp !== AD_SEDU && adtyp !== AD_SSEX && adtyp !== AD_SITM) {
    return 0;
  }
  return genagr === 1 - gendef ? 1 : pagr.mlet === S_NYMPH ? 2 : 0;
}

export async function doseduce(mon: struct_monst | null): Promise<number> {
  let ring = null;
  let nring = null;
  let fem = (mon.data === $sat(G.mons, PM_SUCCUBUS) ? 1 : 0) << 24 >> 24;
  let seewho = 0;
  let naked = 0;
  let attr_tot = 0;
  let tried_gloves = 0;
  let qbuf = new Int8Array(128);
  let Who = new Int8Array(128);
  if (mon.mcan | 0 || mon.mspec_used) {
    await pline(S("%s acts as though %s has got a %sheadache."), await Monnam(mon), G.genders[pronoun_gender(mon, 0)].he, mon.mcan | 0 ? S("severe ") : S(""));
    return 0;
  }
  if (unconscious()) {
    await pline(S("%s seems dismayed at your lack of response."), await Monnam(mon));
    return 0;
  }
  seewho = ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0) << 24 >> 24;
  if (!seewho) {
    await pline(S("Someone caresses you..."));
  } else {
    await You_feel(S("very attracted to %s."), await mon_nam(mon));
  }
  strcpy(P(Who), !seewho ? fem ? S("She") : S("He") : await Monnam(mon));
  await stop_donning(null);
  if (welded(G.uwep)) {
    tried_gloves = 1;
  }
  for (ring = G.invent; ring; ring = nring) {
    nring = ring.nobj;
    if (ring.otyp !== RIN_ADORNMENT) {
      continue;
    }
    if (fem) {
      if (ring.owornmask && G.uarmg) {
        if (!tried_gloves++) {
          await mayberem(mon, P(Who), G.uarmg, S("gloves"));
        }
        if (G.uarmg) {
          continue;
        }
      }
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && rn2(20) < acurr(A_CHA)) {
        await safe_qbuf(P(qbuf), S("\"That "), S(" looks pretty.  May I have it?\""), ring, xname, simpleonames, S("ring"));
        await discover_object(150, 1, 1);
        if (await yn_function(P(qbuf), P(G.ynchars), 110) === 110) {
          continue;
        }
      } else {
        await pline(S("%s decides she'd like %s, and takes it."), P(Who), await yname(ring));
      }
      await discover_object(150, 1, 1);
      if (ring.owornmask) {
        await remove_worn_item(ring, FALSE);
      }
      await freeinv(ring);
      await mpickobj(mon, ring);
    } else {
      if (G.uleft && G.uright && G.uleft.otyp === RIN_ADORNMENT && G.uright.otyp === RIN_ADORNMENT) {
        break;
      }
      if (ring === G.uleft || ring === G.uright) {
        continue;
      }
      if (G.uarmg) {
        if (!tried_gloves++) {
          await mayberem(mon, P(Who), G.uarmg, S("gloves"));
        }
        if (G.uarmg) {
          break;
        }
      }
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && rn2(20) < acurr(A_CHA)) {
        await safe_qbuf(P(qbuf), S("\"That "), S(" looks pretty.  Would you wear it for me?\""), ring, xname, simpleonames, S("ring"));
        await discover_object(150, 1, 1);
        if (await yn_function(P(qbuf), P(G.ynchars), 110) === 110) {
          continue;
        }
      } else {
        await pline(S("%s decides you'd look prettier wearing %s,"), P(Who), await yname(ring));
        await pline(S("and puts it on your finger."));
      }
      await discover_object(150, 1, 1);
      if (!G.uright) {
        await pline(S("%s puts %s on your right %s."), P(Who), await the(await xname(ring)), body_part(HAND));
        await setworn(ring, RIGHT_RING);
      } else if (!G.uleft) {
        await pline(S("%s puts %s on your left %s."), P(Who), await the(await xname(ring)), body_part(HAND));
        await setworn(ring, LEFT_RING);
      } else if (G.uright && G.uright.otyp !== RIN_ADORNMENT) {
        await pline(S("%s replaces %s with %s."), P(Who), await yname(G.uright), await yname(ring));
        await Ring_gone(G.uright);
        if (G.u.utotype || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > 2) {
          return 1;
        }
        await setworn(ring, RIGHT_RING);
      } else if (G.uleft && G.uleft.otyp !== RIN_ADORNMENT) {
        await pline(S("%s replaces %s with %s."), P(Who), await yname(G.uleft), await yname(ring));
        await Ring_gone(G.uleft);
        if (G.u.utotype || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > 2) {
          return 1;
        }
        await setworn(ring, LEFT_RING);
      } else {
        await impossible(S("ring replacement"));
      }
      await Ring_on(ring);
      await prinv(null, ring, 0);
    }
  }
  naked = (!G.uarmc && !G.uarmf && !G.uarmg && !G.uarms && !G.uarmh && !G.uarmu ? 1 : 0) << 24 >> 24;
  await pline(S("%s %s%s."), P(Who), G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("seems to murmur into your ear") : naked ? S("murmurs sweet nothings into your ear") : S("murmurs in your ear"), naked ? S("") : S(", while helping you undress"));
  await mayberem(mon, P(Who), G.uarmc, cloak_simple_name(G.uarmc));
  if (!G.uarmc) {
    await mayberem(mon, P(Who), G.uarm, suit_simple_name(G.uarm));
  }
  await mayberem(mon, P(Who), G.uarmf, S("boots"));
  if (!tried_gloves) {
    await mayberem(mon, P(Who), G.uarmg, S("gloves"));
  }
  await mayberem(mon, P(Who), G.uarms, S("shield"));
  await mayberem(mon, P(Who), G.uarmh, helm_simple_name(G.uarmh));
  if (!G.uarmc && !G.uarm) {
    await mayberem(mon, P(Who), G.uarmu, S("shirt"));
  }
  if (G.u.utotype || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > 2) {
    return 1;
  }
  if (G.uarm || G.uarmc) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await verbalize(S("You're such a %s; I wish..."), G.flags.female ? S("sweet lady") : S("nice guy"));
    } else if (seewho) {
      await pline(S("%s appears to sigh."), await Monnam(mon));
    }
    if (!await tele_restrict(mon)) {
      await rloc(mon, TRUE);
    }
    return 1;
  }
  if (G.u.ualign.type === A_CHAOTIC) {
    adjalign(1);
  }
  await pline(S("Time stands still while you and %s lie in each other's arms..."), await noit_mon_nam(mon));
  attr_tot = acurr(A_CHA) + acurr(A_INT);
  if (rn2(35) > (attr_tot < 32 ? attr_tot : 32)) {
    await pline(S("%s seems to have enjoyed it more than you..."), await noit_Monnam(mon));
    switch (rn2(5)) {
    case 0:
      await You_feel(S("drained of energy."));
      G.u.uen = 0;
      G.u.uenmax -= rnd(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? 5 : 10);
      await exercise(A_CON, FALSE);
      if (G.u.uenmax < 0) {
        G.u.uenmax = 0;
      }
      break;
    case 1:
      await You(S("are down in the dumps."));
      await adjattrib(A_CON, -1, TRUE);
      await exercise(A_CON, FALSE);
      G.context.botl = 1;
      break;
    case 2:
      await Your(S("senses are dulled."));
      await adjattrib(A_WIS, -1, TRUE);
      await exercise(A_WIS, FALSE);
      G.context.botl = 1;
      break;
    case 3:
      if (!resists_drli(G.youmonst)) {
        await You_feel(S("out of shape."));
        await losexp(S("overexertion"));
      } else {
        await You(S("have a curious feeling..."));
      }
      await exercise(A_CON, FALSE);
      await exercise(A_DEX, FALSE);
      await exercise(A_WIS, FALSE);
      break;
    case 4:
      {
        let tmp = 0;
        await You_feel(S("exhausted."));
        await exercise(A_STR, FALSE);
        tmp = rn2(10) + 6;
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp, S("exhaustion"), KILLED_BY);
        break;
      }
    }
  } else {
    mon.mspec_used = rnd(100);
    await You(S("seem to have enjoyed it more than %s..."), await noit_mon_nam(mon));
    switch (rn2(5)) {
    case 0:
      await You_feel(S("raised to your full potential."));
      await exercise(A_CON, TRUE);
      G.u.uen = G.u.uenmax += rnd(5);
      break;
    case 1:
      await You_feel(S("good enough to do it again."));
      await adjattrib(A_CON, 1, TRUE);
      await exercise(A_CON, TRUE);
      G.context.botl = 1;
      break;
    case 2:
      await You(S("will always remember %s..."), await noit_mon_nam(mon));
      await adjattrib(A_WIS, 1, TRUE);
      await exercise(A_WIS, TRUE);
      G.context.botl = 1;
      break;
    case 3:
      await pline(S("That was a very educational experience."));
      await pluslvl(FALSE);
      await exercise(A_WIS, TRUE);
      break;
    case 4:
      await You_feel(S("restored to health!"));
      G.u.uhp = G.u.uhpmax;
      if (G.u.umonnum !== G.u.umonster) {
        G.u.mh = G.u.mhmax;
      }
      await exercise(A_STR, TRUE);
      G.context.botl = 1;
      break;
    }
  }
  if (mon.mtame) {
    ;
  } else if (rn2(20) < acurr(A_CHA)) {
    await pline(S("%s demands that you pay %s, but you refuse..."), await noit_Monnam(mon), G.genders[pronoun_gender(mon, 1)].him);
  } else if (G.u.umonnum === PM_LEPRECHAUN) {
    await pline(S("%s tries to take your money, but fails..."), await noit_Monnam(mon));
  } else {
    let cost = 0;
    let umoney = money_cnt(G.invent);
    if (umoney > LARGEST_INT - 10) {
      cost = rnd(LARGEST_INT) + 500;
    } else {
      cost = rnd((umoney | 0) + 10) + 500;
    }
    if (mon.mpeaceful) {
      cost = Math.trunc(cost / 5);
      if (!cost) {
        cost = 1;
      }
    }
    if (cost > umoney) {
      cost = umoney;
    }
    if (!cost) {
      await verbalize(S("It's on the house!"));
    } else {
      await pline(S("%s takes %ld %s for services rendered!"), await noit_Monnam(mon), cost, await currency(cost));
      await money2mon(mon, cost);
      G.context.botl = 1;
    }
  }
  if (!rn2(25)) {
    mon.mcan = 1;
  }
  if (!await tele_restrict(mon)) {
    await rloc(mon, TRUE);
  }
  return 1;
}

async function mayberem(mon: struct_monst | null, seducer: Ptr | null, obj: struct_obj | null, str: Ptr | null): Promise<void> {
  let qbuf = new Int8Array(128);
  if (!obj || !obj.owornmask) {
    return;
  }
  if (G.u.utotype || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > 2) {
    return;
  }
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    await pline(S("%s takes off your %s."), seducer, str);
  } else if (rn2(20) < acurr(A_CHA)) {
    sprintf(P(qbuf), S("\"Shall I remove your %s, %s?\""), str, !rn2(2) ? S("lover") : !rn2(2) ? S("dear") : S("sweetheart"));
    if (await yn_function(P(qbuf), P(G.ynchars), 110) === 110) {
      return;
    }
  } else {
    let hairbuf = new Int8Array(256);
    sprintf(P(hairbuf), S("let me run my fingers through your %s"), body_part(HAIR));
    await verbalize(S("Take off your %s; %s."), str, obj === G.uarm ? S("let's get a little closer") : obj === G.uarmc || obj === G.uarms ? S("it's in the way") : obj === G.uarmf ? S("let me rub your feet") : obj === G.uarmg ? S("they're too clumsy") : obj === G.uarmu ? S("let me massage you") : P(hairbuf));
  }
  await remove_worn_item(obj, TRUE);
}

async function passiveum(olduasmon: struct_permonst | null, mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let $g = 0;
  let i = 0;
  let tmp = 0;
  let oldu_mattk = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      oldu_mattk = null;
      for (i = 0; !oldu_mattk; ++i) {
        if (i >= NATTK) {
          return 1;
        }
        if (olduasmon.mattk[i].aatyp === AT_NONE || olduasmon.mattk[i].aatyp === AT_BOOM) {
          oldu_mattk = $sat(olduasmon.mattk, i);
        }
      }
      if (oldu_mattk.damn) {
        tmp = d(oldu_mattk.damn, oldu_mattk.damd);
      } else if (oldu_mattk.damd) {
        tmp = d(olduasmon.mlevel + 1, oldu_mattk.damd);
      } else {
        tmp = 0;
      }
      switch (oldu_mattk.adtyp) {
      case 8:
        if (!rn2(2)) {
          await pline(S("%s is splashed by %s%s!"), await Monnam(mtmp), !(G.u.umonnum !== G.u.umonster) ? S("") : S("your "), hliquid(S("acid")));
          if (((mtmp.data.mresists | mtmp.mextrinsics) & 64) !== 0) {
            await pline(S("%s is not affected."), await Monnam(mtmp));
            tmp = 0;
          }
        } else {
          tmp = 0;
        }
        if (!rn2(30)) {
          await erode_armor(mtmp, ERODE_CORRODE);
        }
        if (!rn2(6)) {
          await acid_damage(mtmp.mw);
        }
        { $g = 1; continue $L; }
      case 18:
        {
          let protector = attk_protection(mattk.aatyp);
          let wornitems = mtmp.misc_worn_check;
          if (!!mtmp.mw) {
            wornitems = wornitems | W_ARMG;
          }
          if (!(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0) && (protector === 0 || protector !== ~0 && (wornitems & protector) !== protector)) {
            if (poly_when_stoned(mtmp.data)) {
              await mon_to_stone(mtmp);
              return 1;
            }
            await pline(S("%s turns to stone!"), await Monnam(mtmp));
            G.stoned = 1;
            await xkilled(mtmp, XKILL_NOMSG);
            if (!(mtmp.mhp < 1)) {
              return 1;
            }
            return 2;
          }
          return 1;
        }
      case 41:
        if (mon_currwep) {
          await drain_item(mon_currwep, TRUE);
        }
        return 1;
      default:
        break;
      }
      if (!(G.u.umonnum !== G.u.umonster)) {
        return 1;
      }
      if (rn2(3)) {
        switch (oldu_mattk.adtyp) {
        case 0:
          if (oldu_mattk.aatyp === AT_BOOM) {
            await You(S("explode!"));
            await rehumanize();
            { $g = 1; continue $L; }
          }
          break;
        case 14:
          if (tmp > 127) {
            tmp = 127;
          }
          if (G.u.umonnum === PM_FLOATING_EYE) {
            if (!rn2(4)) {
              tmp = 127;
            }
            if (mtmp.mcansee | 0 && (mtmp.data.mflags1 & 4096) >>> 0 === 0 && rn2(3) && ((mtmp.data.mflags1 & 16777216) >>> 0 !== 0 || !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked))) {
              if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
                await pline(S("As a blind %s, you cannot defend yourself."), G.youmonst.data.mname);
              } else {
                if (await mon_reflects(mtmp, S("Your gaze is reflected by %s %s."))) {
                  return 1;
                }
                await pline(S("%s is frozen by your gaze!"), await Monnam(mtmp));
                paralyze_monst(mtmp, tmp);
                return 3;
              }
            }
          } else {
            await pline(S("%s is frozen by you."), await Monnam(mtmp));
            paralyze_monst(mtmp, tmp);
            return 3;
          }
          return 1;
        case 3:
          if (((mtmp.data.mresists | mtmp.mextrinsics) & 2) !== 0) {
            await shieldeff(mtmp.mx, mtmp.my);
            await pline(S("%s is mildly chilly."), await Monnam(mtmp));
            await golemeffects(mtmp, AD_COLD, tmp);
            tmp = 0;
            break;
          }
          await pline(S("%s is suddenly very cold!"), await Monnam(mtmp));
          G.u.mh += tmp / 2 | 0;
          if (G.u.mhmax < G.u.mh) {
            G.u.mhmax = G.u.mh;
          }
          if (G.u.mhmax > (G.youmonst.data.mlevel + 1) * 8) {
            await split_mon(G.youmonst, mtmp);
          }
          break;
        case 12:
          if (!mtmp.mstun) {
            mtmp.mstun = 1;
            await pline(S("%s %s."), await Monnam(mtmp), await makeplural(stagger(mtmp.data, S("stagger"))));
          }
          tmp = 0;
          break;
        case 2:
          if (((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0) {
            await shieldeff(mtmp.mx, mtmp.my);
            await pline(S("%s is mildly warm."), await Monnam(mtmp));
            await golemeffects(mtmp, AD_FIRE, tmp);
            tmp = 0;
            break;
          }
          await pline(S("%s is suddenly very hot!"), await Monnam(mtmp));
          break;
        case 6:
          if (((mtmp.data.mresists | mtmp.mextrinsics) & 16) !== 0) {
            await shieldeff(mtmp.mx, mtmp.my);
            await pline(S("%s is slightly tingled."), await Monnam(mtmp));
            await golemeffects(mtmp, AD_ELEC, tmp);
            tmp = 0;
            break;
          }
          await pline(S("%s is jolted with your electricity!"), await Monnam(mtmp));
          break;
        default:
          tmp = 0;
          break;
        }
      } else {
        tmp = 0;
      }
    case 1: // assess_dmg
      if ((mtmp.mhp -= tmp) <= 0) {
        await pline(S("%s dies!"), await Monnam(mtmp));
        await xkilled(mtmp, XKILL_NOMSG);
        if (!(mtmp.mhp < 1)) {
          return 1;
        }
        return 2;
      }
      return 1;
    }
    break;
  }
}

export async function cloneu(): Promise<struct_monst | null> {
  let mon = null;
  let mndx = await monsndx(G.youmonst.data);
  if (G.u.mh <= 1) {
    return null;
  }
  if (G.mvitals[mndx].mvflags & G_EXTINCT) {
    return null;
  }
  mon = await makemon(G.youmonst.data, G.u.ux, G.u.uy, NO_MINVENT | MM_EDOG);
  if (!mon) {
    return null;
  }
  mon.mcloned = 1;
  mon = await christen_monst(mon, P(G.plname));
  initedog(mon);
  mon.m_lev = G.youmonst.data.mlevel & 0xff;
  mon.mhpmax = G.u.mhmax;
  mon.mhp = G.u.mh / 2 | 0;
  G.u.mh -= mon.mhp;
  G.context.botl = 1;
  return mon;
}

export function $init(): void {
  mon_currwep = null;
  dieroll = 0;
  gazemu$reactions = [S("confused"),
S("stunned"),
S("puzzled"),
S("dazzled"),
S("irritated"),
S("inflamed"),
S("tired"),
S("dulled")];
}
