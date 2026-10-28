// @ts-nocheck
// NetHack 3.6.7 uhitm.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { snuff_lit } from './apply.ts';
import { artifact_hit, artifact_light, defends, shade_glare } from './artifact.ts';
import { acurr, adjalign, change_luck, exercise } from './attrib.ts';
import { isok, paranoid_query } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { glyph_at, map_invisible, map_location, newsym, shieldeff, tmp_at, unmap_invisible } from './display.ts';
import { dropy } from './do.ts';
import { Adjmonnam, Monnam, a_monnam, hcolor, hliquid, l_monnam, mon_nam, y_monnam } from './do_name.ts';
import { abuse_dog, tamedog } from './dog.ts';
import { breaktest, mhurtle, release_camera_demon } from './dothrow.ts';
import { eat_brains, eating_conducts, newuhs } from './eat.ts';
import { done, done_in_by, panic } from './end.ts';
import { u_wipe_engr } from './engrave.ts';
import { check_capacity, in_rooms, inv_cnt, near_capacity, nomul, overexertion } from './hack.ts';
import { dist2, highc, ing_suffix, night, s_suffix, sgn, strNsubst, strstri } from './hacklib.ts';
import { addinv, freeinv, hold_another_object, merge_choice, update_inventory, useup, useupall } from './invent.ts';
import { clone_mon, makemon } from './makemon.ts';
import { attk_protection, engulf_target, paralyze_monst, sleep_monst, slept_monst, xdrainenergym } from './mhitm.ts';
import { could_seduce, getmattk, magic_negation, mdamageu, mpoisons_subj } from './mhitu.ts';
import { ndemon } from './minion.ts';
import { obj_extract_self, place_object, splitobj, weight } from './mkobj.ts';
import { angry_guards, corpse_chance, golemeffects, killed, mlifesaver, monkilled, monnear, newcham, seemimic, setmangry, wake_nearto, wakeup, xkilled } from './mon.ts';
import { can_be_strangled, can_blnd, dmgtype, gender, hates_silver, mon_hates_light, mon_hates_silver, monsndx, noattacks, on_fire, poly_when_stoned, pronoun_gender, resists_blnd, resists_drli, stagger, sticks } from './mondata.ts';
import { m_move, monflee } from './monmove.ts';
import { m_useup, m_useupall } from './mthrowu.ts';
import { munslime, munstone, ureflects } from './muse.ts';
import { An, The, Yname2, Yobjnam2, an, bare_artifactname, cloak_simple_name, corpse_xname, cxname, doname, helm_simple_name, makeplural, mshot_xname, singular, the, vtense, xname, yname, ysimple_name } from './objnam.ts';
import { You, You_feel, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, mbodypart, polymon, rehumanize, ugolemeffects, uunstick } from './polyself.ts';
import { make_slimed, make_stunned, potionhit, split_mon } from './potion.ts';
import { ghod_hitsu } from './priest.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { obfree, tended_shop } from './shk.ts';
import { findgold, mpickobj } from './steal.ts';
import { u_teleport_mon } from './teleport.ts';
import { obj_stop_timers } from './timeout.ts';
import { erode_obj, instapetrify, minstapetrify, mintrap, mselftouch } from './trap.ts';
import { abon, dbon, dmgval, dry_a_towel, hitval, possibly_unwield, setmnotwielded, silver_sears, special_dmgval, use_skill, uwep_skill_type, weapon_dam_bonus, weapon_hit_bonus, weapon_type } from './weapon.ts';
import { can_twoweapon, drop_uswapwep, setuwep, untwoweapon, uwepgone } from './wield.ts';
import { cutworm, worm_known } from './worm.ts';
import { find_mac, mon_adjust_speed, update_mon_intrinsics, which_armor } from './worn.ts';
import { destroy_mitem, drain_item, exclam, hit, obj_resists, resist } from './zap.ts';
import { struct_attack, struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $at2, $cs, $rd, $sat, $wr, G, P, S, rn2_on_display_rng, sprintf, strcat, strcmp, strcpy } from './rt/index.ts';
import { ACID_RES, AD_BLND, AD_COLD, AD_DGST, AD_DRIN, AD_ELEC, AD_ENCH, AD_FIRE, AD_PHYS, AD_SPEL, AD_STCK, AD_WRAP, ANTIMAGIC, ARMOR_CLASS, ARM_SHIELD, ART_CLEAVER, ART_STORMBRINGER, AT_BITE, AT_BUTT, AT_CLAW, AT_HUGS, AT_KICK, AT_MAGC, AT_NONE, AT_SPIT, AT_STNG, AT_TENT, AT_TUCH, AT_WEAP, A_CON, A_DEX, A_LAWFUL, A_STR, A_WIS, BLINDED, BLINDING_VENOM, BOOMERANG, BOULDER, CLOVE_OF_GARLIC, COIN_CLASS, COLD_RES, CONFUSION, CORPSE, CREAM_PIE, CXN_ARTICLE, CXN_PFX_THE, DEAF, DETECT_MONSTERS, DIED, DISP_ALWAYS, DISP_END, EF_GREASE, EF_NONE, EF_VERBOSE, ELVEN_ARROW, ELVEN_BOW, ERODE_BURN, ERODE_CORRODE, ERODE_ROT, ERODE_RUST, ER_NOTHING, EXPL_MAX, FACE, FALSE, FIRE_RES, FREE_ACTION, FUMBLING, GEM_CLASS, GOLD_PIECE, G_NOCORPSE, HALLUC, HALLUC_RES, HAND, HEAVY_IRON_BALL, HMON_APPLIED, HMON_KICKED, HMON_MELEE, HMON_THROWN, INFRAVISION, INVIS, IRON, IRON_CHAIN, I_SPECIAL, KATANA, LEATHER, LEG, LOW_PM, MAXPCHARS, METAL, MIRROR, MSLOW, M_AP_MONSTER, NATTK, NEED_WEAPON, NON_PM, NOTELL, NO_KILLER_PREFIX, NO_MM_FLAGS, OBJ_INVENT, OILSKIN_CLOAK, PM_BALROG, PM_BLACK_PUDDING, PM_BROWN_PUDDING, PM_CLAY_GOLEM, PM_FLOATING_EYE, PM_FOG_CLOUD, PM_GREEN_SLIME, PM_GREMLIN, PM_INCUBUS, PM_IRON_GOLEM, PM_LEATHER_GOLEM, PM_MEDUSA, PM_PAPER_GOLEM, PM_SHADE, PM_STEAM_VORTEX, PM_STONE_GOLEM, PM_STRAW_GOLEM, PM_SUCCUBUS, PM_WOOD_GOLEM, POOL, POTHIT_HERO_BASH, POTHIT_HERO_THROW, POTION_CLASS, PROT_FROM_SHAPE_CHANGERS, P_AXE, P_BARE_HANDED_COMBAT, P_BOOMERANG, P_BOW, P_CROSSBOW, P_DAGGER, P_DART, P_ISRESTRICTED, P_LANCE, P_NONE, P_POLEARMS, P_SABER, P_SHURIKEN, P_SKILLED, P_TWO_WEAPON_COMBAT, P_UNSKILLED, RING_CLASS, ROCK, ROOMOFFSET, SCROLL_CLASS, SEE_INVIS, SHOCK_RES, SHOPBASE, SICK, SICK_RES, SILVER, SLIMED, SLOW_DIGESTION, SPBOOK_CLASS, STOMACH, STONE_RES, STONING, STRAT_WAITFORU, STRAT_WAITMASK, STUNNED, S_EEL, S_GHOST, S_GNOME, S_GOLEM, S_KOBOLD, S_LEPRECHAUN, S_LICH, S_LIGHT, S_MUMMY, S_NYMPH, S_ORC, S_ZOMBIE, S_hcdoor, S_vcdoor, TELEPAT, TOOL_CLASS, TRUE, UNCHANGING, WAND_CLASS, WAN_LIGHT, WARN_OF_MON, WEAPON_CLASS, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMS, W_ARMU, W_RINGL, W_RINGR, W_WEP, XKILL_GIVEMSG, XKILL_NOCORPSE, XKILL_NOMSG, YA, YUMI } from './consts.ts';

let override_confirmation: number;
let hitum_cleave$clockwise: number;
let shade_miss$harmlessly_thru: any;
let gulpum$msgbuf: any;

export async function erode_armor(mdef: struct_monst | null, hurt: number): Promise<void> {
  let target = null;
  while (1) {
    switch (rn2(5)) {
    case 0:
      target = await which_armor(mdef, W_ARMH);
      if (!target || await erode_obj(target, await xname(target), hurt, EF_GREASE) === ER_NOTHING) {
        continue;
      }
      break;
    case 1:
      target = await which_armor(mdef, W_ARMC);
      if (target) {
        await erode_obj(target, await xname(target), hurt, EF_GREASE | EF_VERBOSE);
        break;
      }
      if (!!(target = await which_armor(mdef, W_ARM))) {
        await erode_obj(target, await xname(target), hurt, EF_GREASE | EF_VERBOSE);
      } else if (!!(target = await which_armor(mdef, W_ARMU))) {
        await erode_obj(target, await xname(target), hurt, EF_GREASE | EF_VERBOSE);
      }
      break;
    case 2:
      target = await which_armor(mdef, W_ARMS);
      if (!target || await erode_obj(target, await xname(target), hurt, EF_GREASE) === ER_NOTHING) {
        continue;
      }
      break;
    case 3:
      target = await which_armor(mdef, W_ARMG);
      if (!target || await erode_obj(target, await xname(target), hurt, EF_GREASE) === ER_NOTHING) {
        continue;
      }
      break;
    case 4:
      target = await which_armor(mdef, W_ARMF);
      if (!target || await erode_obj(target, await xname(target), hurt, EF_GREASE) === ER_NOTHING) {
        continue;
      }
      break;
    }
    break;
  }
}

export async function attack_checks(mtmp: struct_monst | null, wep: struct_obj | null): Promise<number> {
  let glyph = 0;
  mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
  if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
    return FALSE;
  }
  if (G.context.forcefight) {
    return FALSE;
  }
  glyph = glyph_at(G.bhitpos.x, G.bhitpos.y);
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && !(glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6) && !(glyph === 382 + (382 + 0)) && !(!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && mtmp.mundetected | 0 && (mtmp.data.mflags1 & 128) >>> 0 !== 0)) {
    await pline(S("Wait!  There's %s there you can't see!"), G.c_common_strings.c_something);
    await map_invisible(G.bhitpos.x, G.bhitpos.y);
    if (mtmp.m_ap_type & 7 && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 2) {
      if (!G.u.ustuck && !mtmp.mflee && dmgtype(mtmp.data, AD_STCK)) {
        G.u.ustuck = mtmp;
      }
    }
    await wakeup(mtmp, TRUE);
    return TRUE;
  }
  if (mtmp.m_ap_type & 7 && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) && !(glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6)) {
    if (glyph === 382 + (382 + 0)) {
      await seemimic(mtmp);
      return FALSE;
    }
    await stumble_onto_mimic(mtmp);
    return TRUE;
  }
  if (mtmp.mundetected | 0 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) && !(glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6) && ((mtmp.data.mflags1 & 128) >>> 0 !== 0 || mtmp.data.mlet === S_EEL)) {
    mtmp.mundetected = (mtmp.msleeping = 0) & 1;
    await newsym(mtmp.mx, mtmp.my);
    if (glyph === 382 + (382 + 0)) {
      await seemimic(mtmp);
      return FALSE;
    }
    if (!(((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic ? 1 : 0 : G.u.uprops[TELEPAT].extrinsic) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic))) {
      let obj = null;
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
        await pline(S("A %s %s appeared!"), mtmp.mtame ? S("tame") : S("wild"), await l_monnam(mtmp));
      } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || is_pool(mtmp.mx, mtmp.my) && !G.u.uinwater) {
        await pline(S("Wait!  There's a hidden monster there!"));
      } else if (!!(obj = G.level.objects[mtmp.mx][mtmp.my])) {
        await pline(S("Wait!  There's %s hiding under %s!"), await an(await l_monnam(mtmp)), await doname(obj));
      }
      return TRUE;
    }
  }
  if ((mtmp.mundetected | 0 || mtmp.m_ap_type & 7) && (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
    mtmp.mundetected = 0;
    await wakeup(mtmp, TRUE);
  }
  if (G.flags.confirm && mtmp.mpeaceful | 0 && !G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !G.u.uprops[STUNNED].intrinsic) {
    if (wep && wep.oartifact === ART_STORMBRINGER) {
      override_confirmation = TRUE;
      return FALSE;
    }
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
      let qbuf = new Int8Array(128);
      sprintf(P(qbuf), S("Really attack %s?"), await mon_nam(mtmp));
      if (!await paranoid_query((G.flags.paranoia_bits & 16) >>> 0 !== 0 ? 1 : 0, P(qbuf))) {
        G.context.move = 0;
        return TRUE;
      }
    }
  }
  return FALSE;
}

export async function check_caitiff(mtmp: struct_monst | null): Promise<void> {
  if (G.u.ualign.record <= -10) {
    return;
  }
  if (G.urole.malenum === 333 && G.u.ualign.type === A_LAWFUL && (!mtmp.mcanmove || mtmp.msleeping | 0 || mtmp.mflee | 0 && !mtmp.mavenge)) {
    await You(S("caitiff!"));
    adjalign(-1);
  } else if (G.urole.malenum === 339 && mtmp.mpeaceful | 0) {
    await You(S("dishonorably attack the innocent!"));
    adjalign(-1);
  }
}

export async function find_roll_to_hit(mtmp: struct_monst | null, aatyp: number, weapon: struct_obj | null, attk_count: Ptr | null, role_roll_penalty: Ptr | null): Promise<number> {
  let tmp = 0;
  let tmp2 = 0;
  role_roll_penalty.a[role_roll_penalty.o] = 0;
  tmp = 1 + (G.u.uluck + G.u.moreluck) + abon() + find_mac(mtmp) + G.u.uhitinc + (G.u.umonnum !== G.u.umonster ? G.youmonst.data.mlevel : G.u.ulevel);
  if (!attk_count.a[attk_count.o]++) {
    await check_caitiff(mtmp);
  }
  if (mtmp.mstun) {
    tmp += 2;
  }
  if (mtmp.mflee) {
    tmp += 2;
  }
  if (mtmp.msleeping) {
    mtmp.msleeping = 0;
    tmp += 2;
  }
  if (!mtmp.mcanmove) {
    tmp += 4;
    if (!rn2(10)) {
      mtmp.mcanmove = 1;
      mtmp.mfrozen = 0;
    }
  }
  if (G.urole.malenum === 334 && !(G.u.umonnum !== G.u.umonster)) {
    if (G.uarm) {
      tmp -= role_roll_penalty.a[role_roll_penalty.o] = G.urole.spelarmr;
    } else if (!G.uwep && !G.uarms) {
      tmp += (G.u.ulevel / 3 | 0) + 2;
    }
  }
  if ((mtmp.data.mflags2 & 128) >>> 0 !== 0 && (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 16) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 260 ? 1 : 0)) {
    ++tmp;
  }
  if ((tmp2 = near_capacity()) !== 0) {
    tmp -= tmp2 * 2 - 1;
  }
  if (G.u.utrap) {
    tmp -= 3;
  }
  if (aatyp === AT_WEAP || aatyp === AT_CLAW) {
    if (weapon) {
      tmp += await hitval(weapon, mtmp);
    }
    tmp += await weapon_hit_bonus(weapon);
  } else if (aatyp === AT_KICK && (G.urole.malenum === 339 || G.urole.malenum === 334)) {
    tmp += await weapon_hit_bonus(null);
  }
  return tmp;
}

export async function attack(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let mdat = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mdat = mtmp.data;
      if (mtmp && mtmp.mtame && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && G.flags.safe_dog && !G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !G.u.uprops[STUNNED].intrinsic && !G.context.forcefight) {
        if (!G.uwep || G.uwep.oartifact !== ART_STORMBRINGER) {
          let foo = (!!G.uball || !rn2(7) || (mtmp.data === $sat(G.mons, 111) || mtmp.data === $sat(G.mons, 113) || mtmp.data === $sat(G.mons, 327)) && mtmp.wormno | 0 ? 1 : 0) << 24 >> 24;
          let inshop = FALSE;
          let p = null;
          if (!foo) {
            for (p = in_rooms(mtmp.mx, mtmp.my, SHOPBASE); p.a[p.o]; p = p.add(1)) {
              if (tended_shop($sat(G.rooms, p.a[p.o] - ROOMOFFSET))) {
                inshop = TRUE;
                break;
              }
            }
          }
          if (inshop || foo || $at2(G.level.locations, G.u.ux, G.u.uy).typ < POOL && !((mtmp.data.mflags1 & 8) >>> 0 !== 0)) {
            let buf = new Int8Array(256);
            await monflee(mtmp, rnd(6), FALSE, FALSE);
            strcpy(P(buf), await y_monnam(mtmp));
            buf[0] = highc(buf[0]);
            await You(S("stop.  %s is in the way!"), P(buf));
            G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
            return TRUE;
          } else if ((mtmp.mfrozen | 0 || !mtmp.mcanmove || mtmp.data.mmove === 0) && rn2(6)) {
            await pline(S("%s doesn't seem to move!"), await Monnam(mtmp));
            G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
            return TRUE;
          } else {
            return FALSE;
          }
        }
      }
      override_confirmation = FALSE;
      G.bhitpos.x = G.u.ux + G.u.dx << 24 >> 24;
      G.bhitpos.y = G.u.uy + G.u.dy << 24 >> 24;
      G.notonhead = (G.bhitpos.x !== mtmp.mx || G.bhitpos.y !== mtmp.my ? 1 : 0) << 24 >> 24;
      if (await attack_checks(mtmp, G.uwep)) {
        return TRUE;
      }
      if (G.u.umonnum !== G.u.umonster && noattacks(G.youmonst.data)) {
        await You(S("have no way to attack monsters physically."));
        mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
        { $g = 1; continue $L; }
      }
      if (await check_capacity(S("You cannot fight while so heavily loaded.")) || await overexertion()) {
        { $g = 1; continue $L; }
      }
      if (G.u.twoweap && !await can_twoweapon()) {
        await untwoweapon();
      }
      if (G.unweapon) {
        G.unweapon = FALSE;
        if (G.flags.verbose) {
          if (G.uwep) {
            await You(S("begin bashing monsters with %s."), await yname(G.uwep));
          } else if (!((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1)) {
            await You(S("begin %s monsters with your %s %s."), ing_suffix(G.urole.malenum === 334 ? S("strike") : S("bash")), G.uarmg ? S("gloved") : S("bare"), await makeplural(body_part(HAND)));
          }
        }
      }
      await exercise(A_STR, TRUE);
      await u_wipe_engr(3);
      if (mdat.mlet === S_LEPRECHAUN && !mtmp.mfrozen && !mtmp.msleeping && !mtmp.mconf && mtmp.mcansee | 0 && !rn2(7) && (await m_move(mtmp, 0) === 2 || mtmp.mx !== G.u.ux + G.u.dx || mtmp.my !== G.u.uy + G.u.dy)) {
        await You(S("miss wildly and stumble forwards."));
        return FALSE;
      }
      if (G.u.umonnum !== G.u.umonster) {
        await hmonas(mtmp);
      } else {
        await hitum(mtmp, G.youmonst.data.mattk[0]);
      }
      mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
    case 1: // atk_done
      if (G.context.forcefight && !(mtmp.mhp < 1) && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && !($at2(G.level.locations, G.u.ux + G.u.dx, G.u.uy + G.u.dy).glyph === 382 + (382 + 0)) && !(G.u.uswallow | 0 && mtmp === G.u.ustuck)) {
        await map_invisible(G.u.ux + G.u.dx, G.u.uy + G.u.dy);
      }
      return TRUE;
    }
    break;
  }
}

async function known_hitum(mon: struct_monst | null, weapon: struct_obj | null, mhit: Ptr | null, rollneeded: number, armorpenalty: number, uattk: struct_attack | null, dieroll: number): Promise<number> {
  let malive = TRUE;
  let slice_or_chop = (weapon && (weapon.oclass === WEAPON_CLASS && G.objects[weapon.otyp].oc_subtyp >= P_DAGGER && G.objects[weapon.otyp].oc_subtyp <= P_SABER || (weapon.oclass === WEAPON_CLASS || weapon.oclass === TOOL_CLASS) && G.objects[weapon.otyp].oc_subtyp === P_AXE) ? 1 : 0) << 24 >> 24;
  if (override_confirmation) {
    if (G.flags.verbose) {
      await Your(S("bloodthirsty blade attacks!"));
    }
  }
  if (!mhit.a[mhit.o]) {
    await missum(mon, uattk, rollneeded + armorpenalty > dieroll ? 1 : 0);
  } else {
    let oldhp = mon.mhp;
    let oldweaphit = G.u.uconduct.weaphit;
    if (weapon && (weapon.oclass === WEAPON_CLASS || weapon.oclass === TOOL_CLASS && G.objects[weapon.otyp].oc_subtyp !== P_NONE)) {
      ++G.u.uconduct.weaphit;
    }
    G.notonhead = (mon.mx !== G.bhitpos.x || mon.my !== G.bhitpos.y ? 1 : 0) << 24 >> 24;
    malive = await hmon(mon, weapon, HMON_MELEE, dieroll);
    if (malive) {
      if (!rn2(25) && mon.mhp < (mon.mhpmax / 2 | 0) && !(G.u.uswallow | 0 && mon === G.u.ustuck)) {
        await monflee(mon, !rn2(3) ? rnd(100) : 0, FALSE, TRUE);
        if (G.u.ustuck === mon && !G.u.uswallow && !sticks(G.youmonst.data)) {
          G.u.ustuck = null;
        }
      }
      if (mon.mhp === oldhp) {
        mhit.a[mhit.o] = 0;
        G.u.uconduct.weaphit = oldweaphit;
      }
      if (mon.wormno | 0 && mhit.a[mhit.o]) {
        await cutworm(mon, G.bhitpos.x, G.bhitpos.y, slice_or_chop);
      }
    }
  }
  return malive;
}

async function hitum_cleave(target: struct_monst | null, uattk: struct_attack | null): Promise<number> {
  let i = 0;
  let save_bhitpos = new struct_nhcoord();
  let count = 0;
  let umort = 0;
  let x = G.u.ux;
  let y = G.u.uy;
  for (i = 0; i < 8; i = i + 1 >>> 0) {
    if (G.xdir[i] === G.u.dx && G.ydir[i] === G.u.dy) {
      break;
    }
  }
  if (i === 8) {
    await impossible(S("hitum_cleave: unknown target direction [%d,%d,%d]?"), G.u.dx, G.u.dy, G.u.dz);
    return TRUE;
  }
  i = (i + ((hitum_cleave$clockwise ? 6 : 2) >>> 0) >>> 0) % 8;
  umort = G.u.umortality;
  save_bhitpos.$cp(G.bhitpos);
  for (count = 3; count > 0; --count) {
    let mtmp = null;
    let tx = 0;
    let ty = 0;
    let tmp = 0;
    let dieroll = 0;
    const mhit = new Int32Array(1);
    const attknum = new Int32Array(1);
    const armorpenalty = new Int32Array(1);
    i = (i + ((hitum_cleave$clockwise ? 1 : 7) >>> 0) >>> 0) % 8;
    tx = x + G.xdir[i], ty = y + G.ydir[i];
    if (!isok(tx, ty)) {
      continue;
    }
    mtmp = !!G.level.monsters[tx][ty] ? G.level.monsters[tx][ty] : null;
    if (!mtmp) {
      if ($at2(G.level.locations, tx, ty).glyph === 382 + (382 + 0)) {
        await unmap_invisible(tx, ty);
      }
      continue;
    }
    tmp = await find_roll_to_hit(mtmp, uattk.aatyp, G.uwep, P(attknum, 0), P(armorpenalty, 0));
    dieroll = rnd(20);
    mhit[0] = tmp > dieroll ? 1 : 0;
    G.bhitpos.x = tx << 24 >> 24, G.bhitpos.y = ty << 24 >> 24;
    await known_hitum(mtmp, G.uwep, P(mhit, 0), tmp, armorpenalty[0], uattk, dieroll);
    await passive(mtmp, G.uwep, mhit[0], !(mtmp.mhp < 1) ? 1 : 0, AT_WEAP, !G.uwep ? 1 : 0);
    if (!G.uwep || G.u.umortality > umort) {
      break;
    }
  }
  hitum_cleave$clockwise = (!hitum_cleave$clockwise ? 1 : 0) << 24 >> 24;
  G.bhitpos.$cp(save_bhitpos);
  return (target && target.mhp < 1 ? FALSE : TRUE) << 24 >> 24;
}

async function hitum(mon: struct_monst | null, uattk: struct_attack | null): Promise<number> {
  let malive = 0;
  let wep_was_destroyed = FALSE;
  let wepbefore = G.uwep;
  const armorpenalty = new Int32Array(1);
  const attknum = new Int32Array(1);
  attknum[0] = 0;
  let x = G.u.ux + G.u.dx;
  let y = G.u.uy + G.u.dy;
  let tmp = await find_roll_to_hit(mon, uattk.aatyp, G.uwep, P(attknum, 0), P(armorpenalty, 0));
  let dieroll = rnd(20);
  const mhit = new Int32Array(1);
  mhit[0] = tmp > dieroll || G.u.uswallow | 0 ? 1 : 0;
  if (G.uwep && G.uwep.oartifact === ART_CLEAVER && !G.u.twoweap && !G.u.uswallow && !G.u.ustuck && !(G.u.umonnum === 115)) {
    return await hitum_cleave(mon, uattk);
  }
  if (tmp > dieroll) {
    await exercise(A_DEX, TRUE);
  }
  malive = await known_hitum(mon, G.uwep, P(mhit, 0), tmp, armorpenalty[0], uattk, dieroll);
  if (wepbefore && !G.uwep) {
    wep_was_destroyed = TRUE;
  }
  await passive(mon, G.uwep, mhit[0], malive, AT_WEAP, wep_was_destroyed);
  if (G.u.twoweap && !override_confirmation && malive && (!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) === mon) {
    tmp = await find_roll_to_hit(mon, uattk.aatyp, G.uswapwep, P(attknum, 0), P(armorpenalty, 0));
    dieroll = rnd(20);
    mhit[0] = tmp > dieroll || G.u.uswallow | 0 ? 1 : 0;
    malive = await known_hitum(mon, G.uswapwep, P(mhit, 0), tmp, armorpenalty[0], uattk, dieroll);
    if (mhit[0]) {
      await passive(mon, G.uswapwep, mhit[0], malive, AT_WEAP, !G.uswapwep ? 1 : 0);
    }
  }
  return malive;
}

export async function hmon(mon: struct_monst | null, obj: struct_obj | null, thrown: number, dieroll: number): Promise<number> {
  let result = 0;
  let anger_guards = 0;
  anger_guards = (mon.mpeaceful | 0 && (mon.ispriest | 0 || mon.isshk | 0 || (mon.data === $sat(G.mons, 278) || mon.data === $sat(G.mons, 279))) ? 1 : 0) << 24 >> 24;
  result = await hmon_hitmon(mon, obj, thrown, dieroll);
  if (mon.ispriest | 0 && !rn2(2)) {
    await ghod_hitsu(mon);
  }
  if (anger_guards) {
    await angry_guards(!!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? 1 : 0);
  }
  return result;
}

async function hmon_hitmon(mon: struct_monst | null, obj: struct_obj | null, thrown: number, dieroll: number): Promise<number> {
  const tmp = new Int32Array(1);
  let mdat = mon.data;
  let barehand_silver_rings = 0;
  let hittxt = FALSE;
  let destroyed = FALSE;
  let already_killed = FALSE;
  let get_dmg_bonus = TRUE;
  let ispoisoned = FALSE;
  let needpoismsg = FALSE;
  let poiskilled = FALSE;
  let unpoisonmsg = FALSE;
  let silvermsg = FALSE;
  let silverobj = FALSE;
  let lightobj = FALSE;
  let valid_weapon_attack = FALSE;
  let unarmed = (!G.uwep && !G.uarm && !G.uarms ? 1 : 0) << 24 >> 24;
  let hand_to_hand = (thrown === HMON_MELEE || thrown === HMON_APPLIED && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && (G.objects[G.uwep.otyp].oc_subtyp === P_POLEARMS || G.objects[G.uwep.otyp].oc_subtyp === P_LANCE)) ? 1 : 0) << 24 >> 24;
  let jousting = 0;
  const silverhit = new Float64Array(1);
  silverhit[0] = 0;
  let wtype = 0;
  let monwep = null;
  let saved_oname = new Int8Array(256);
  saved_oname[0] = 0;
  await wakeup(mon, TRUE);
  if (!obj) {
    if (mdat === $sat(G.mons, PM_SHADE)) {
      tmp[0] = 0;
    } else if (G.urole.malenum === 339 || G.urole.malenum === 334) {
      tmp[0] = rnd(4);
    } else {
      tmp[0] = rnd(2);
    }
    valid_weapon_attack = (tmp[0] > 1 ? 1 : 0) << 24 >> 24;
    tmp[0] += await special_dmgval(G.youmonst, mon, W_ARMG | W_RINGL | W_RINGR, P(silverhit, 0));
    barehand_silver_rings += (silverhit[0] & W_RINGL ? 1 : 0) + (silverhit[0] & W_RINGR ? 1 : 0);
    if (barehand_silver_rings > 0) {
      silvermsg = TRUE;
    }
  } else {
    if (!(artifact_light(obj) && obj.lamplit | 0)) {
      strcpy(P(saved_oname), await cxname(obj));
    } else {
      strcpy(P(saved_oname), await bare_artifactname(obj));
    }
    if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || obj.oclass === GEM_CLASS) {
      if (obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= P_BOW && G.objects[obj.otyp].oc_subtyp <= P_CROSSBOW || !thrown && ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART || (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) || !thrown && !G.u.usteed && ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && (G.objects[obj.otyp].oc_subtyp === P_POLEARMS || G.objects[obj.otyp].oc_subtyp === P_LANCE)) || (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (thrown !== HMON_THROWN || !((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp)))) {
        if (mdat === $sat(G.mons, PM_SHADE) && !shade_glare(obj)) {
          tmp[0] = 0;
        } else {
          tmp[0] = rnd(2);
        }
        if ((G.objects[obj.otyp].oc_material | 0) === SILVER && mon_hates_silver(mon)) {
          silvermsg = TRUE;
          silverobj = TRUE;
          tmp[0] += rnd(tmp[0] ? 20 : 10);
        }
        if (!thrown && obj === G.uwep && obj.otyp === BOOMERANG && rnl(4) === 4 - 1) {
          let more_than_1 = (obj.quan > 1 ? 1 : 0) << 24 >> 24;
          await pline(S("As you hit %s, %s%s breaks into splinters."), await mon_nam(mon), more_than_1 ? S("one of ") : S(""), await yname(obj));
          if (!more_than_1) {
            await uwepgone();
          }
          await useup(obj);
          if (!more_than_1) {
            obj = null;
          }
          hittxt = TRUE;
          if (mdat !== $sat(G.mons, PM_SHADE)) {
            ++tmp[0];
          }
        }
      } else {
        tmp[0] = await dmgval(obj, mon);
        valid_weapon_attack = (tmp[0] > 1 ? 1 : 0) << 24 >> 24;
        if (!valid_weapon_attack || mon === G.u.ustuck || G.u.twoweap || hand_to_hand && obj.oartifact === ART_CLEAVER) {
          ;
        } else if (mon.mflee | 0 && G.urole.malenum === 338 && !(G.u.umonnum !== G.u.umonster) && hand_to_hand) {
          await You(S("strike %s from behind!"), await mon_nam(mon));
          tmp[0] += rnd(G.u.ulevel);
          hittxt = TRUE;
        } else if (dieroll === 2 && obj === G.uwep && obj.oclass === WEAPON_CLASS && ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0 || G.urole.malenum === 339 && obj.otyp === KATANA && !G.uarms) && ((wtype = uwep_skill_type()) !== P_NONE && G.u.weapon_skills[wtype].skill >= P_SKILLED) && (!!(monwep = mon.mw) && !((G.objects[monwep.otyp].oc_material | 0) <= LEATHER || monwep.otyp === 60) && !obj_resists(monwep, 50 + 15 * (((obj.oeroded | 0) > (obj.oeroded2 | 0) ? obj.oeroded | 0 : obj.oeroded2 | 0) - ((monwep.oeroded | 0) > (monwep.oeroded2 | 0) ? monwep.oeroded | 0 : monwep.oeroded2 | 0)), 100))) {
          await setmnotwielded(mon, monwep);
          mon.weapon_check = NEED_WEAPON;
          await pline(S("%s from the force of your blow!"), await Yobjnam2(monwep, S("shatter")));
          await m_useupall(mon, monwep);
          if (rn2(4)) {
            await monflee(mon, d(2, 3), TRUE, TRUE);
          }
          hittxt = TRUE;
        }
        if (obj.oartifact && await artifact_hit(G.youmonst, mon, obj, P(tmp, 0), dieroll)) {
          if (mon.mhp < 1) {
            return FALSE;
          }
          if (tmp[0] === 0) {
            return TRUE;
          }
          hittxt = TRUE;
        }
        if ((G.objects[obj.otyp].oc_material | 0) === SILVER && mon_hates_silver(mon)) {
          silvermsg = TRUE;
          silverobj = TRUE;
        }
        if (artifact_light(obj) && obj.lamplit | 0 && mon_hates_light(mon)) {
          lightobj = TRUE;
        }
        if (G.u.usteed && !thrown && tmp[0] > 0 && weapon_type(obj) === P_LANCE && mon !== G.u.ustuck) {
          jousting = joust(mon, obj);
          if (jousting) {
            valid_weapon_attack = TRUE;
          }
        }
        if (thrown === HMON_THROWN && ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW || (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART)) {
          if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp)) {
            if (G.urole.malenum === 339 && obj.otyp === YA && G.uwep.otyp === YUMI) {
              ++tmp[0];
            } else if (G.urace.malenum === 260 && obj.otyp === ELVEN_ARROW && G.uwep.otyp === ELVEN_BOW) {
              ++tmp[0];
            }
          }
          if (obj.otrapped | 0 && (obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[obj.otyp].oc_subtyp <= -P_BOW)) {
            ispoisoned = TRUE;
          }
        }
      }
    } else if (obj.oclass === POTION_CLASS) {
      if (obj.quan > 1) {
        obj = await splitobj(obj, 1);
      } else {
        await setuwep(null);
      }
      await freeinv(obj);
      await potionhit(mon, obj, hand_to_hand ? POTHIT_HERO_BASH : POTHIT_HERO_THROW);
      if (mon.mhp < 1) {
        return FALSE;
      }
      hittxt = TRUE;
      mdat = mon.data;
      tmp[0] = mdat === $sat(G.mons, PM_SHADE) ? 0 : 1;
    } else {
      if (mdat === $sat(G.mons, PM_SHADE) && !shade_aware(obj)) {
        tmp[0] = 0;
      } else {
        switch (obj.otyp) {
        case 448:
        case 450:
        case 451:
          tmp[0] = await dmgval(obj, mon);
          break;
        case 205:
          if (breaktest(obj)) {
            await You(S("break %s.  That's bad luck!"), await ysimple_name(obj));
            change_luck(-2);
            await useup(obj);
            obj = null;
            unarmed = FALSE;
            get_dmg_bonus = FALSE;
            hittxt = TRUE;
          }
          tmp[0] = 1;
          break;
        case 204:
          await You(S("succeed in destroying %s.  Congratulations!"), await ysimple_name(obj));
          await release_camera_demon(obj, G.u.ux, G.u.uy);
          await useup(obj);
          return TRUE;
        case 240:
          if ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) {
            tmp[0] = 1;
            hittxt = TRUE;
            await You(S("hit %s with %s."), await mon_nam(mon), await corpse_xname(obj, null, (obj.dknown | 0 ? CXN_PFX_THE : CXN_ARTICLE) >>> 0));
            obj.dknown = 1;
            if (!await munstone(mon, TRUE)) {
              await minstapetrify(mon, TRUE);
            }
            if (((mon.data.mresists | mon.mextrinsics) & 128) !== 0) {
              break;
            }
            return (!(mon.mhp < 1) ? 1 : 0) << 24 >> 24;
          }
          tmp[0] = (obj.corpsenm >= LOW_PM ? G.mons[obj.corpsenm].msize : 0) + 1;
          break;
        case 241:
          {
            let cnt = obj.quan;
            tmp[0] = 1;
            get_dmg_bonus = FALSE;
            hittxt = TRUE;
            if (obj === G.uwep) {
              G.unweapon = TRUE;
            }
            if (obj.spe && obj.corpsenm >= LOW_PM) {
              if (obj.quan < 5) {
                change_luck(-obj.quan << 24 >> 24);
              } else {
                change_luck(-5);
              }
            }
            if ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) {
              await pline(S("Splat!  You hit %s with %s %s egg%s!"), await mon_nam(mon), obj.known | 0 ? S("the") : cnt > 1 ? S("some") : S("a"), obj.known | 0 ? G.mons[obj.corpsenm].mname : S("petrifying"), cnt === 1 ? S("") : S("s"));
              obj.known = 1;
              do {
                if (thrown) {
                  await obfree(obj, null);
                } else {
                  await useupall(obj);
                }
                obj = null;
              } while (0);
              if (!await munstone(mon, TRUE)) {
                await minstapetrify(mon, TRUE);
              }
              if (((mon.data.mresists | mon.mextrinsics) & 128) !== 0) {
                break;
              }
              return (!(mon.mhp < 1) ? 1 : 0) << 24 >> 24;
            } else {
              let eggp = obj.corpsenm !== NON_PM && obj.known | 0 ? await the(G.mons[obj.corpsenm].mname) : cnt > 1 ? S("some") : S("an");
              await You(S("hit %s with %s egg%s."), await mon_nam(mon), eggp, cnt === 1 ? S("") : S("s"));
              if ((mdat === $sat(G.mons, 10) || mdat === $sat(G.mons, 9)) && !(G.monstermoves - obj.age > 2 * 200)) {
                await pline_The(S("egg%s %s alive any more..."), cnt === 1 ? S("") : S("s"), cnt === 1 ? S("isn't") : S("aren't"));
                if (obj.timed) {
                  await obj_stop_timers(obj);
                }
                obj.otyp = ROCK;
                obj.oclass = GEM_CLASS;
                obj.oartifact = 0;
                obj.spe = 0;
                obj.known = (obj.dknown = (obj.bknown = 0) & 1) & 1;
                obj.owt = await weight(obj) >>> 0;
                if (thrown) {
                  await place_object(obj, mon.mx, mon.my);
                }
              } else {
                await pline(S("Splat!"));
                do {
                  if (thrown) {
                    await obfree(obj, null);
                  } else {
                    await useupall(obj);
                  }
                  obj = null;
                } while (0);
                await exercise(A_WIS, FALSE);
              }
            }
            break;
          }
        case 259:
          if ((mdat.mflags2 & 2) >>> 0 !== 0 || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
            await monflee(mon, d(2, 4), FALSE, TRUE);
          }
          tmp[0] = 1;
          break;
        case 262:
        case 452:
          mon.msleeping = 0;
          if (can_blnd(G.youmonst, mon, (obj.otyp === BLINDING_VENOM ? AT_SPIT : AT_WEAP) & 0xff, obj)) {
            if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
              await pline(obj.otyp === CREAM_PIE ? S("Splat!") : S("Splash!"));
            } else if (obj.otyp === BLINDING_VENOM) {
              await pline_The(S("venom blinds %s%s!"), await mon_nam(mon), mon.mcansee | 0 ? S("") : S(" further"));
            } else {
              let whom = await mon_nam(mon);
              let what = await The(await xname(obj));
              if (!thrown && obj.quan > 1) {
                what = await An(await singular(obj, xname));
              }
              if ((mdat.mflags1 & 4096) >>> 0 === 0 && mdat !== $sat(G.mons, PM_FLOATING_EYE)) {
                whom = strcat(strcat(s_suffix(whom), S(" ")), mbodypart(mon, FACE));
              }
              await pline(S("%s %s over %s!"), what, vtense(what, S("splash")), whom);
            }
            await setmangry(mon, TRUE);
            mon.mcansee = 0;
            tmp[0] = rn2(25) + 21;
            if ((mon.mblinded | 0) + tmp[0] > 127) {
              mon.mblinded = 127;
            } else {
              mon.mblinded = ((mon.mblinded | 0) + tmp[0] >>> 0) & 127;
            }
          } else {
            await pline(obj.otyp === CREAM_PIE ? S("Splat!") : S("Splash!"));
            await setmangry(mon, TRUE);
          }
          if (thrown) {
            await obfree(obj, null);
          } else {
            await useup(obj);
          }
          hittxt = TRUE;
          get_dmg_bonus = FALSE;
          tmp[0] = 0;
          break;
        case 453:
          if (((mon.data.mresists | mon.mextrinsics) & 64) !== 0) {
            await Your(S("venom hits %s harmlessly."), await mon_nam(mon));
            tmp[0] = 0;
          } else {
            await Your(S("venom burns %s!"), await mon_nam(mon));
            tmp[0] = await dmgval(obj, mon);
          }
          if (thrown) {
            await obfree(obj, null);
          } else {
            await useup(obj);
          }
          hittxt = TRUE;
          get_dmg_bonus = FALSE;
          break;
        default:
          tmp[0] = obj.owt / 100 >>> 0 | 0;
          if (obj.otyp === 209 && obj.spe > 0) {
            tmp[0] += obj.spe;
            if (rn2(obj.spe + 1)) {
              await dry_a_towel(obj, -1, TRUE);
            }
          }
          if (tmp[0] < 1) {
            tmp[0] = 1;
          } else {
            tmp[0] = rnd(tmp[0]);
          }
          if (tmp[0] > 6) {
            tmp[0] = 6;
          }
          if ((G.objects[obj.otyp].oc_material | 0) === SILVER && mon_hates_silver(mon)) {
            tmp[0] += rnd(20);
            silvermsg = TRUE;
            silverobj = TRUE;
          }
        }
      }
    }
  }
  if (get_dmg_bonus && tmp[0] > 0) {
    tmp[0] += G.u.udaminc;
    if (thrown !== HMON_THROWN || !obj || !G.uwep || !((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp))) {
      tmp[0] += dbon();
    }
  }
  if (valid_weapon_attack) {
    let wep = null;
    wep = obj && ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) ? G.uwep : obj;
    tmp[0] += await weapon_dam_bonus(wep);
    wtype = thrown ? weapon_type(wep) : uwep_skill_type();
    await use_skill(wtype, 1);
  }
  if (ispoisoned) {
    let nopoison = 10 - (obj.owt / 10 >>> 0) >>> 0 | 0;
    if (nopoison < 2) {
      nopoison = 2;
    }
    if (G.urole.malenum === 339) {
      await You(S("dishonorably use a poisoned weapon!"));
      adjalign(-sgn(G.u.ualign.type));
    } else if (G.u.ualign.type === A_LAWFUL && G.u.ualign.record > -10) {
      await You_feel(S("like an evil coward for using a poisoned weapon."));
      adjalign(-1);
    }
    if (obj && !rn2(nopoison)) {
      obj.otrapped = (FALSE) & 1;
      unpoisonmsg = TRUE;
    }
    if (((mon.data.mresists | mon.mextrinsics) & 32) !== 0) {
      needpoismsg = TRUE;
    } else if (rn2(10)) {
      tmp[0] += rnd(6);
    } else {
      poiskilled = TRUE;
    }
  }
  if (tmp[0] < 1) {
    let mon_is_shade = (mon.data === $sat(G.mons, PM_SHADE) ? 1 : 0) << 24 >> 24;
    tmp[0] = get_dmg_bonus && !mon_is_shade ? 1 : 0;
    if (mon_is_shade && !hittxt && thrown !== HMON_THROWN && thrown !== HMON_KICKED) {
      hittxt = await shade_miss(G.youmonst, mon, obj, FALSE, TRUE);
    }
  }
  if (jousting) {
    tmp[0] += d(2, obj === G.uwep ? 10 : 2);
    await You(S("joust %s%s"), await mon_nam(mon), (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? exclam(tmp[0]) : S("."));
    if (jousting < 0) {
      await pline(S("%s shatters on impact!"), await Yname2(obj));
      G.u.twoweap = FALSE;
      if (obj === G.uwep) {
        await uwepgone();
      }
      await useup(obj);
      obj = null;
    }
    if (mon.mhp > tmp[0]) {
      await mhurtle(mon, G.u.dx, G.u.dy, 1);
      mdat = mon.data;
      if (mon.mhp < 1) {
        already_killed = TRUE;
      }
    }
    hittxt = TRUE;
  } else if (unarmed && tmp[0] > 1 && !thrown && !obj && !(G.u.umonnum !== G.u.umonster)) {
    if (rnd(100) < G.u.weapon_skills[P_BARE_HANDED_COMBAT].skill && !(mdat.msize >= 3) && !((mdat.mflags1 & 2097152) >>> 0 !== 0)) {
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
        await pline(S("%s %s from your powerful strike!"), await Monnam(mon), await makeplural(stagger(mon.data, S("stagger"))));
      }
      if (mon.mhp > tmp[0]) {
        await mhurtle(mon, G.u.dx, G.u.dy, 1);
        mdat = mon.data;
        if (mon.mhp < 1) {
          already_killed = TRUE;
        }
      }
      hittxt = TRUE;
    }
  }
  if (!already_killed) {
    mon.mhp -= tmp[0];
  }
  if (mon.mhp > mon.mhpmax) {
    mon.mhp = mon.mhpmax;
  }
  if (mon.mhp < 1) {
    destroyed = TRUE;
  }
  if (mon.mtame && tmp[0] > 0) {
    await abuse_dog(mon);
    if (mon.mtame && !destroyed) {
      await monflee(mon, 10 * rnd(tmp[0]), FALSE, FALSE);
    }
  }
  if ((mdat === $sat(G.mons, PM_BLACK_PUDDING) || mdat === $sat(G.mons, PM_BROWN_PUDDING)) && mon.mhp > 1 && !mon.mcan && obj && (obj === G.uwep || G.u.twoweap && obj === G.uswapwep) && (((G.objects[obj.otyp].oc_material | 0) === IRON || (G.objects[obj.otyp].oc_material | 0) === METAL) && !((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW || (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART)) && hand_to_hand) {
    let mclone = null;
    if (!!(mclone = await clone_mon(mon, 0, 0))) {
      let withwhat = new Int8Array(256);
      withwhat[0] = 0;
      if (G.u.twoweap && G.flags.verbose) {
        sprintf(P(withwhat), S(" with %s"), await yname(obj));
      }
      await pline(S("%s divides as you hit it%s!"), await Monnam(mon), P(withwhat));
      hittxt = TRUE;
      await mintrap(mclone);
    }
  }
  if (!hittxt && (!destroyed || thrown && G.m_shot.n > 1 && G.m_shot.o === obj.otyp)) {
    if (thrown) {
      await hit(await mshot_xname(obj), mon, exclam(tmp[0]));
    } else if (!G.flags.verbose) {
      await You(S("hit it."));
    } else {
      await You(S("%s %s%s"), obj && (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIELD || obj.otyp === HEAVY_IRON_BALL) ? S("bash") : G.urole.malenum === 329 ? S("smite") : S("hit"), await mon_nam(mon), (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? exclam(tmp[0]) : S("."));
    }
  }
  if (silvermsg) {
    let fmt = null;
    let whom = await mon_nam(mon);
    let silverobjbuf = new Int8Array(256);
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      if (barehand_silver_rings === 1) {
        fmt = S("Your silver ring sears %s!");
      } else if (barehand_silver_rings === 2) {
        fmt = S("Your silver rings sear %s!");
      } else if (silverobj && saved_oname[0]) {
        sprintf(P(silverobjbuf), S("Your %s%s %s"), strstri(P(saved_oname), S("silver")) ? S("") : S("silver "), P(saved_oname), vtense(P(saved_oname), S("sear")));
        strNsubst(P(silverobjbuf), S("%"), S("%%"), 0);
        strcat(P(silverobjbuf), S(" %s!"));
        fmt = P(silverobjbuf);
      } else {
        fmt = S("The silver sears %s!");
      }
    } else {
      whom.a[whom.o] = highc(whom.a[whom.o]);
      fmt = S("%s is seared!");
    }
    if (!(mdat.mlet === S_GHOST) && !((mdat.mflags1 & 4) >>> 0 !== 0)) {
      whom = strcat(s_suffix(whom), S(" flesh"));
    }
    await pline(fmt, whom);
  }
  if (lightobj) {
    let fmt = null;
    let whom = await mon_nam(mon);
    let emitlightobjbuf = new Int8Array(256);
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      if (saved_oname[0]) {
        sprintf(P(emitlightobjbuf), S("%s radiance penetrates deep into"), s_suffix(P(saved_oname)));
        strcat(P(emitlightobjbuf), S(" %s!"));
        fmt = P(emitlightobjbuf);
      } else {
        fmt = S("The light sears %s!");
      }
    } else {
      whom.a[whom.o] = highc(whom.a[whom.o]);
      fmt = S("%s is seared!");
    }
    if (!(mdat.mlet === S_GHOST) && !((mdat.mflags1 & 4) >>> 0 !== 0)) {
      whom = strcat(s_suffix(whom), S(" flesh"));
    }
    await pline(fmt, whom);
  }
  if (unpoisonmsg) {
    strcpy(P(saved_oname), await cxname(obj));
  }
  if (needpoismsg) {
    await pline_The(S("poison doesn't seem to affect %s."), await mon_nam(mon));
  }
  if (poiskilled) {
    await pline_The(S("poison was deadly..."));
    if (!already_killed) {
      await xkilled(mon, XKILL_NOMSG);
    }
    destroyed = TRUE;
  } else if (destroyed) {
    if (!already_killed) {
      await killed(mon);
    }
  } else if (G.u.umconf && hand_to_hand) {
    await nohandglow(mon);
    if (!mon.mconf && !await resist(mon, SPBOOK_CLASS, 0, NOTELL)) {
      mon.mconf = 1;
      if (!mon.mstun && mon.mcanmove | 0 && !mon.msleeping && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected))) {
        await pline(S("%s appears confused."), await Monnam(mon));
      }
    }
  }
  if (unpoisonmsg) {
    await Your(S("%s %s no longer poisoned."), P(saved_oname), vtense(P(saved_oname), S("are")));
  }
  return (destroyed ? FALSE : TRUE) << 24 >> 24;
}

function shade_aware(obj: struct_obj | null): number {
  if (!obj) {
    return FALSE;
  }
  if (obj.otyp === BOULDER || obj.otyp === HEAVY_IRON_BALL || obj.otyp === IRON_CHAIN || obj.otyp === MIRROR || obj.otyp === CLOVE_OF_GARLIC || (G.objects[obj.otyp].oc_material | 0) === SILVER) {
    return TRUE;
  }
  return FALSE;
}

export async function shade_miss(magr: struct_monst | null, mdef: struct_monst | null, obj: struct_obj | null, thrown: number, verbose: number): Promise<number> {
  let what = null;
  let whose = null;
  let target = null;
  let youagr = (magr === G.youmonst ? 1 : 0) << 24 >> 24;
  let youdef = (mdef === G.youmonst ? 1 : 0) << 24 >> 24;
  if (mdef.data !== $sat(G.mons, PM_SHADE) || obj && await dmgval(obj, mdef)) {
    return FALSE;
  }
  if (verbose && (youdef || $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)) || magr === G.youmonst && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 2)) {
    what = !obj || shade_aware(obj) ? S("attack") : await cxname(obj);
    target = youdef ? S("you") : await mon_nam(mdef);
    if (!thrown) {
      whose = youagr ? S("Your") : s_suffix(await Monnam(magr));
      await pline(S("%s %s %s%s%s."), whose, what, vtense(what, S("pass")), P(shade_miss$harmlessly_thru), target);
    } else {
      await pline(S("%s %s%s%s."), await The(what), vtense(what, S("pass")), P(shade_miss$harmlessly_thru), target);
    }
    if (!youdef && !((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
      await map_invisible(mdef.mx, mdef.my);
    }
  }
  if (!youdef) {
    mdef.msleeping = 0;
  }
  return TRUE;
}

async function m_slips_free(mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let obj = null;
  if (mattk.adtyp === AD_DRIN) {
    obj = await which_armor(mdef, W_ARMH);
  } else {
    obj = await which_armor(mdef, W_ARMC);
    if (!obj) {
      obj = await which_armor(mdef, W_ARM);
    }
    if (!obj) {
      obj = await which_armor(mdef, W_ARMU);
    }
  }
  if (obj && (obj.greased | 0 || obj.otyp === OILSKIN_CLOAK) && (!obj.cursed || rn2(3))) {
    await You(S("%s %s %s %s!"), mattk.adtyp === AD_WRAP ? S("slip off of") : S("grab, but cannot hold onto"), s_suffix(await mon_nam(mdef)), obj.greased | 0 ? S("greased") : S("slippery"), obj.greased | 0 || G.objects[obj.otyp].oc_name_known | 0 ? await xname(obj) : cloak_simple_name(obj));
    if (obj.greased | 0 && !rn2(2)) {
      await pline_The(S("grease wears off."));
      obj.greased = 0;
    }
    return TRUE;
  }
  return FALSE;
}

function joust(mon: struct_monst | null, obj: struct_obj | null): number {
  let skill_rating = 0;
  let joust_dieroll = 0;
  if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic || G.u.uprops[STUNNED].intrinsic) {
    return 0;
  }
  if (obj !== G.uwep && (obj !== G.uswapwep || !G.u.twoweap)) {
    return 0;
  }
  skill_rating = G.u.weapon_skills[weapon_type(obj)].skill;
  if (G.u.twoweap && G.u.weapon_skills[P_TWO_WEAPON_COMBAT].skill < skill_rating) {
    skill_rating = G.u.weapon_skills[P_TWO_WEAPON_COMBAT].skill;
  }
  if (skill_rating === P_ISRESTRICTED) {
    skill_rating = P_UNSKILLED;
  }
  if ((joust_dieroll = rn2(5)) < skill_rating) {
    if (joust_dieroll === 0 && rnl(50) === 50 - 1 && !((mon.data.mflags1 & 1048576) >>> 0 !== 0) && !obj_resists(obj, 0, 100)) {
      return -1;
    }
    return 1;
  }
  return 0;
}

async function demonpet(): Promise<void> {
  let i = 0;
  let pm = null;
  let dtmp = null;
  await pline(S("Some hell-p has arrived!"));
  i = !rn2(6) ? await ndemon(G.u.ualign.type) : NON_PM;
  pm = i !== NON_PM ? $sat(G.mons, i) : G.youmonst.data;
  if (!!(dtmp = await makemon(pm, G.u.ux, G.u.uy, NO_MM_FLAGS))) {
    await tamedog(dtmp, null);
  }
  await exercise(A_WIS, TRUE);
}

async function theft_petrifies(otmp: struct_obj | null): Promise<number> {
  if (G.uarmg || otmp.otyp !== CORPSE || !($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) || (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    return FALSE;
  }
  await instapetrify(await corpse_xname(otmp, S("stolen"), CXN_ARTICLE));
  return TRUE;
}

async function steal_it(mdef: struct_monst | null, mattk: struct_attack | null): Promise<void> {
  let otmp = null;
  let gold = null;
  let stealoid = null;
  let minvent_ptr = null;
  let unwornmask = 0;
  otmp = mdef.minvent;
  if (!otmp || otmp.oclass === COIN_CLASS && !otmp.nobj) {
    return;
  }
  stealoid = null;
  if (could_seduce(G.youmonst, mdef, mattk)) {
    minvent_ptr = P(mdef, "minvent");
    while (!!(otmp = minvent_ptr.a[minvent_ptr.o])) {
      if (otmp.owornmask & W_ARM) {
        if (stealoid) {
          await panic(S("steal_it: multiple worn suits"));
        }
        minvent_ptr.a[minvent_ptr.o] = otmp.nobj;
        stealoid = otmp;
        stealoid.nobj = null;
      } else {
        minvent_ptr = P(otmp, "nobj");
      }
    }
    minvent_ptr.a[minvent_ptr.o] = stealoid;
  }
  gold = findgold(mdef.minvent);
  if (stealoid) {
    if (gender(mdef) === (G.u.mfemale | 0) && G.youmonst.data.mlet === S_NYMPH) {
      await You(S("charm %s.  She gladly hands over %sher possessions."), await mon_nam(mdef), !gold ? S("") : S("most of "));
    } else {
      await You(S("seduce %s and %s starts to take off %s clothes."), await mon_nam(mdef), G.genders[pronoun_gender(mdef, 0)].he, G.genders[pronoun_gender(mdef, 0)].his);
    }
  }
  if (gold) {
    await obj_extract_self(gold);
  }
  while (!!(otmp = mdef.minvent)) {
    if (gold) {
      await mpickobj(mdef, gold), gold = null;
    }
    if (!(G.u.umonnum !== G.u.umonster)) {
      break;
    }
    await obj_extract_self(otmp);
    if ((unwornmask = otmp.owornmask) !== 0) {
      mdef.misc_worn_check = mdef.misc_worn_check & ~unwornmask;
      if (otmp.owornmask & W_WEP) {
        await setmnotwielded(mdef, otmp);
      }
      otmp.owornmask = 0;
      await update_mon_intrinsics(mdef, otmp, FALSE, FALSE);
      mdef.misc_worn_check = mdef.misc_worn_check | I_SPECIAL;
      if (otmp === stealoid) {
        await pline(S("%s finishes taking off %s suit."), await Monnam(mdef), G.genders[pronoun_gender(mdef, 0)].his);
      }
    }
    otmp = await hold_another_object(otmp, S("You snatched but dropped %s."), await doname(otmp), S("You steal: "));
    if (!otmp || otmp.where !== OBJ_INVENT) {
      continue;
    }
    if (await theft_petrifies(otmp)) {
      break;
    }
    if (unwornmask & W_WEP) {
      await possibly_unwield(mdef, FALSE);
    } else if (unwornmask & W_ARMG) {
      await mselftouch(mdef, null, TRUE);
      if (mdef.mhp < 1) {
        break;
      }
    }
    if (!stealoid) {
      break;
    }
    if (!!(gold = findgold(mdef.minvent))) {
      await obj_extract_self(gold);
    }
  }
  if (gold) {
    await mpickobj(mdef, gold);
  }
}

export async function damageum(mdef: struct_monst | null, mattk: struct_attack | null, specialdmg: number): Promise<number> {
  let $g = 0;
  let pd = null;
  let armpro = 0;
  let tmp = new Int32Array(1);
  let negated = 0;
  let mongold = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      pd = mdef.data;
      tmp[0] = d(mattk.damn, mattk.damd);
      armpro = magic_negation(mdef);
      negated = (!(rn2(10) >= 3 * armpro) ? 1 : 0) << 24 >> 24;
      if ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0 && !rn2(13) && !G.uwep && G.u.umonnum !== PM_SUCCUBUS && G.u.umonnum !== PM_INCUBUS && G.u.umonnum !== PM_BALROG) {
        await demonpet();
        return 0;
      }
      switch (mattk.adtyp) {
      case 12: { $g = 3; continue $L; }
      case 17: { $g = 4; continue $L; }
      case 29: { $g = 5; continue $L; }
      case 27: { $g = 6; continue $L; }
      case 0: { $g = 7; continue $L; }
      case 2: { $g = 8; continue $L; }
      case 3: { $g = 9; continue $L; }
      case 6: { $g = 10; continue $L; }
      case 8: { $g = 11; continue $L; }
      case 18: { $g = 12; continue $L; }
      case 35: { $g = 13; continue $L; }
      case 22: { $g = 14; continue $L; }
      case 21: { $g = 15; continue $L; }
      case 20: { $g = 16; continue $L; }
      case 23: { $g = 17; continue $L; }
      case 11: { $g = 18; continue $L; }
      case 253: { $g = 19; continue $L; }
      case 15: { $g = 20; continue $L; }
      case 24: { $g = 21; continue $L; }
      case 42: { $g = 22; continue $L; }
      case 34: { $g = 23; continue $L; }
      case 16: { $g = 24; continue $L; }
      case 7: { $g = 25; continue $L; }
      case 30: { $g = 26; continue $L; }
      case 31: { $g = 27; continue $L; }
      case 32: { $g = 28; continue $L; }
      case 19: { $g = 29; continue $L; }
      case 28: { $g = 30; continue $L; }
      case 14: { $g = 31; continue $L; }
      case 4: { $g = 32; continue $L; }
      case 40: { $g = 33; continue $L; }
      case 41: { $g = 34; continue $L; }
      case 13: { $g = 35; continue $L; }
      case 25: { $g = 36; continue $L; }
      default: { $g = 37; continue $L; }
      }
    case 3:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s %s for a moment."), await Monnam(mdef), await makeplural(stagger(pd, S("stagger"))));
      }
      mdef.mstun = 1;
      { $g = 1; continue $L; }
    case 4:
      { $g = 1; continue $L; }
    case 5:
    case 6:
    case 7:
    case 1: // physical
      if (pd === $sat(G.mons, PM_SHADE)) {
        tmp[0] = 0;
        if (!specialdmg) {
          await impossible(S("bad shade attack function flow?"));
        }
      }
      tmp[0] += specialdmg;
      if (mattk.aatyp === AT_WEAP) {
        tmp[0] = 0;
      } else if (mattk.aatyp === AT_KICK || mattk.aatyp === AT_CLAW || mattk.aatyp === AT_TUCH || mattk.aatyp === AT_HUGS) {
        if ((pd.mflags1 & 2097152) >>> 0 !== 0) {
          tmp[0] = mattk.aatyp === AT_KICK ? 0 : (tmp[0] + 1) / 2 | 0;
        }
        if (G.u.udaminc > 0) {
          tmp[0] += G.u.udaminc;
        } else if (tmp[0] > 0) {
          tmp[0] += G.u.udaminc;
          if (tmp[0] < 1) {
            tmp[0] = 1;
          }
        }
      }
      { $g = 2; continue $L; };
    case 8:
      if (negated) {
        tmp[0] = 0;
        { $g = 2; continue $L; };
      }
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s is %s!"), await Monnam(mdef), await on_fire(pd, mattk));
      }
      if (pd === $sat(G.mons, 246) || pd === $sat(G.mons, 245)) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s burns completely!"), await Monnam(mdef));
        } else {
          await You(S("smell burning%s."), pd === $sat(G.mons, PM_PAPER_GOLEM) ? S(" paper") : pd === $sat(G.mons, PM_STRAW_GOLEM) ? S(" straw") : S(""));
        }
        await xkilled(mdef, XKILL_NOMSG | XKILL_NOCORPSE);
        tmp[0] = 0;
        { $g = 2; continue $L; };
      }
      tmp[0] += await destroy_mitem(mdef, SCROLL_CLASS, AD_FIRE);
      tmp[0] += await destroy_mitem(mdef, SPBOOK_CLASS, AD_FIRE);
      if (((mdef.data.mresists | mdef.mextrinsics) & 1) !== 0) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("fire doesn't heat %s!"), await mon_nam(mdef));
        }
        await golemeffects(mdef, AD_FIRE, tmp[0]);
        await shieldeff(mdef.mx, mdef.my);
        tmp[0] = 0;
      }
      tmp[0] += await destroy_mitem(mdef, POTION_CLASS, AD_FIRE);
      { $g = 2; continue $L; };
    case 9:
      if (negated) {
        tmp[0] = 0;
        { $g = 2; continue $L; };
      }
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s is covered in frost!"), await Monnam(mdef));
      }
      if (((mdef.data.mresists | mdef.mextrinsics) & 2) !== 0) {
        await shieldeff(mdef.mx, mdef.my);
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("frost doesn't chill %s!"), await mon_nam(mdef));
        }
        await golemeffects(mdef, AD_COLD, tmp[0]);
        tmp[0] = 0;
      }
      tmp[0] += await destroy_mitem(mdef, POTION_CLASS, AD_COLD);
      { $g = 2; continue $L; };
    case 10:
      if (negated) {
        tmp[0] = 0;
        { $g = 2; continue $L; };
      }
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s is zapped!"), await Monnam(mdef));
      }
      tmp[0] += await destroy_mitem(mdef, WAND_CLASS, AD_ELEC);
      if (((mdef.data.mresists | mdef.mextrinsics) & 16) !== 0) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("zap doesn't shock %s!"), await mon_nam(mdef));
        }
        await golemeffects(mdef, AD_ELEC, tmp[0]);
        await shieldeff(mdef.mx, mdef.my);
        tmp[0] = 0;
      }
      tmp[0] += await destroy_mitem(mdef, RING_CLASS, AD_ELEC);
      { $g = 2; continue $L; };
    case 11:
      if (((mdef.data.mresists | mdef.mextrinsics) & 64) !== 0) {
        tmp[0] = 0;
      }
      { $g = 2; continue $L; };
    case 12:
      if (!await munstone(mdef, TRUE)) {
        await minstapetrify(mdef, TRUE);
      }
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 13:
    case 14:
    case 15:
      await steal_it(mdef, mattk);
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 16:
      mongold = findgold(mdef.minvent);
      if (mongold) {
        await obj_extract_self(mongold);
        if (await merge_choice(G.invent, mongold) || inv_cnt(FALSE) < 52) {
          await addinv(mongold);
          await Your(S("purse feels heavier."));
        } else {
          await You(S("grab %s's gold, but find no room in your knapsack."), await mon_nam(mdef));
          await dropy(mongold);
        }
      }
      await exercise(A_DEX, TRUE);
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 17:
      if (tmp[0] <= 0) {
        tmp[0] = 1;
      }
      if (!negated) {
        let nambuf = new Int8Array(256);
        let u_saw_mon = ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || G.u.uswallow | 0 && G.u.ustuck === mdef ? 1 : 0) << 24 >> 24;
        strcpy(P(nambuf), await Monnam(mdef));
        if (await u_teleport_mon(mdef, FALSE) && u_saw_mon && !((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || G.u.uswallow | 0 && G.u.ustuck === mdef)) {
          await pline(S("%s suddenly disappears!"), P(nambuf));
        }
        if (tmp[0] >= mdef.mhp) {
          if (mdef.mhp === 1) {
            ++mdef.mhp;
          }
          tmp[0] = mdef.mhp - 1;
        }
      }
      { $g = 2; continue $L; };
    case 18:
      if (can_blnd(G.youmonst, mdef, mattk.aatyp, null)) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && mdef.mcansee | 0) {
          await pline(S("%s is blinded."), await Monnam(mdef));
        }
        mdef.mcansee = 0;
        tmp[0] += mdef.mblinded | 0;
        if (tmp[0] > 127) {
          tmp[0] = 127;
        }
        mdef.mblinded = (tmp[0] >>> 0) & 127;
      }
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 19:
      if (night() && !rn2(10) && !mdef.mcan) {
        if (pd === $sat(G.mons, PM_CLAY_GOLEM)) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("Some writing vanishes from %s head!"), s_suffix(await mon_nam(mdef)));
          }
          await xkilled(mdef, XKILL_NOMSG);
        } else {
          mdef.mcan = 1;
          await You(S("chuckle."));
        }
      }
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 20:
      if (!negated && !rn2(3) && !resists_drli(mdef)) {
        let xtmp = d(2, 6);
        await pline(S("%s suddenly seems weaker!"), await Monnam(mdef));
        mdef.mhpmax -= xtmp;
        mdef.mhp -= xtmp;
        if (mdef.mhp < 1 || !mdef.m_lev) {
          await pline(S("%s dies!"), await Monnam(mdef));
          await xkilled(mdef, XKILL_NOMSG);
        } else {
          mdef.m_lev = mdef.m_lev - 1 & 0xff;
        }
        tmp[0] = 0;
      }
      { $g = 2; continue $L; };
    case 21:
      if (pd === $sat(G.mons, PM_IRON_GOLEM)) {
        await pline(S("%s falls to pieces!"), await Monnam(mdef));
        await xkilled(mdef, XKILL_NOMSG);
      }
      await erode_armor(mdef, ERODE_RUST);
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 22:
      await erode_armor(mdef, ERODE_CORRODE);
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 23:
      if (pd === $sat(G.mons, PM_WOOD_GOLEM) || pd === $sat(G.mons, PM_LEATHER_GOLEM)) {
        await pline(S("%s falls to pieces!"), await Monnam(mdef));
        await xkilled(mdef, XKILL_NOMSG);
      }
      await erode_armor(mdef, ERODE_ROT);
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 24:
      if (!negated && !rn2(4)) {
        await xdrainenergym(mdef, TRUE);
      }
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 25:
    case 26:
    case 27:
      if (!negated && !rn2(8)) {
        await Your(S("%s was poisoned!"), mpoisons_subj(G.youmonst, mattk));
        if (((mdef.data.mresists | mdef.mextrinsics) & 32) !== 0) {
          await pline_The(S("poison doesn't seem to affect %s."), await mon_nam(mdef));
        } else {
          if (!rn2(10)) {
            await Your(S("poison was deadly..."));
            tmp[0] = mdef.mhp;
          } else {
            tmp[0] += rn2(10) + 6;
          }
        }
      }
      { $g = 2; continue $L; };
    case 28:
      {
        let helmet = null;
        if (G.notonhead || !((pd.mflags1 & 32768) >>> 0 === 0)) {
          await pline(S("%s doesn't seem harmed."), await Monnam(mdef));
          tmp[0] = 0;
          if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && pd === $sat(G.mons, PM_GREEN_SLIME)) {
            if (!G.u.uprops[SLIMED].intrinsic) {
              await You(S("suck in some slime and don't feel very well."));
              await make_slimed(10, null);
            }
          }
          { $g = 2; continue $L; };
        }
        if (await m_slips_free(mdef, mattk)) {
          { $g = 2; continue $L; };
        }
        if (!!(helmet = await which_armor(mdef, W_ARMH)) && rn2(8)) {
          await pline(S("%s %s blocks your attack to %s head."), s_suffix(await Monnam(mdef)), helm_simple_name(helmet), G.genders[pronoun_gender(mdef, 0)].his);
          { $g = 2; continue $L; };
        }
        await eat_brains(G.youmonst, mdef, TRUE, P(tmp, 0));
        { $g = 2; continue $L; };
      }
    case 29:
      if (!negated && !sticks(pd)) {
        G.u.ustuck = mdef;
      }
      { $g = 2; continue $L; };
    case 30:
      if (!sticks(pd)) {
        if (!G.u.ustuck && !rn2(10)) {
          if (await m_slips_free(mdef, mattk)) {
            tmp[0] = 0;
          } else {
            await You(S("swing yourself around %s!"), await mon_nam(mdef));
            G.u.ustuck = mdef;
          }
        } else if (G.u.ustuck === mdef) {
          if (is_pool(G.u.ux, G.u.uy) && !((pd.mflags1 & 2) >>> 0 !== 0) && !((pd.mflags1 & (512 | 1024)) >>> 0 !== 0)) {
            await You(S("drown %s..."), await mon_nam(mdef));
            tmp[0] = mdef.mhp;
          } else if (mattk.aatyp === AT_HUGS) {
            await pline(S("%s is being crushed."), await Monnam(mdef));
          }
        } else {
          tmp[0] = 0;
          if (G.flags.verbose) {
            await You(S("brush against %s %s."), s_suffix(await mon_nam(mdef)), mbodypart(mdef, LEG));
          }
        }
      } else {
        tmp[0] = 0;
      }
      { $g = 2; continue $L; };
    case 31:
      if (!negated && mdef.mcanmove | 0 && !rn2(3) && tmp[0] < mdef.mhp) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s is frozen by you!"), await Monnam(mdef));
        }
        paralyze_monst(mdef, rnd(10));
      }
      { $g = 2; continue $L; };
    case 32:
      if (!negated && !mdef.msleeping && await sleep_monst(mdef, rnd(10), -1)) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s is put to sleep by you!"), await Monnam(mdef));
        }
        await slept_monst(mdef);
      }
      { $g = 2; continue $L; };
    case 33:
      if (negated) {
        { $g = 2; continue $L; };
      }
      if (!rn2(4) && !(pd === $sat(G.mons, 205) || (pd === $sat(G.mons, 110) || pd === $sat(G.mons, 30) || pd === $sat(G.mons, 152) || pd === $sat(G.mons, 326)) || pd.mlet === S_GHOST)) {
        if (!await munslime(mdef, TRUE) && !(mdef.mhp < 1)) {
          await You(S("turn %s into slime."), await mon_nam(mdef));
          if (await newcham(mdef, $sat(G.mons, PM_GREEN_SLIME), FALSE, FALSE)) {
            pd = mdef.data;
          }
        }
        if (mdef.mhp < 1) {
          return 2;
        }
        tmp[0] = 0;
      }
      { $g = 2; continue $L; };
    case 34:
      { $g = 2; continue $L; };
    case 35:
      if (!negated && (mdef.mspeed | 0) !== MSLOW) {
        let oldspeed = mdef.mspeed;
        await mon_adjust_speed(mdef, -1, null);
        if (mdef.mspeed !== oldspeed && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s slows down."), await Monnam(mdef));
        }
      }
      { $g = 2; continue $L; };
    case 36:
      if (!mdef.mconf) {
        if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected)) {
          await pline(S("%s looks confused."), await Monnam(mdef));
        }
        mdef.mconf = 1;
      }
      { $g = 2; continue $L; };
    case 37:
      tmp[0] = 0;
      { $g = 2; continue $L; };
    case 2:
      mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      mdef.mhp -= tmp[0];
      if (mdef.mhp < 1) {
        if (mdef.mtame && !($rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2)) {
          await You_feel(S("embarrassed for a moment."));
          if (tmp[0]) {
            await xkilled(mdef, XKILL_NOMSG);
          }
        } else if (!G.flags.verbose) {
          await You(S("destroy it!"));
          if (tmp[0]) {
            await xkilled(mdef, XKILL_NOMSG);
          }
        } else if (tmp[0]) {
          await killed(mdef);
        }
        return 2;
      }
      return 1;
    }
    break;
  }
}

async function explum(mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let $g = 0;
  let resistance = 0;
  let tmp = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      tmp = d(mattk.damn, mattk.damd);
      await You(S("explode!"));
      switch (mattk.adtyp) {
      case 11: { $g = 3; continue $L; }
      case 36: { $g = 4; continue $L; }
      case 3: { $g = 5; continue $L; }
      case 2: { $g = 6; continue $L; }
      case 6: { $g = 7; continue $L; }
      default: { $g = 8; continue $L; }
      }
    case 3:
      if (!resists_blnd(mdef)) {
        await pline(S("%s is blinded by your flash of light!"), await Monnam(mdef));
        mdef.mblinded = (((mdef.mblinded | 0) + tmp < 127 ? (mdef.mblinded | 0) + tmp : 127) >>> 0) & 127;
        mdef.mcansee = 0;
      }
      { $g = 2; continue $L; };
    case 4:
      if ((mdef.data.mflags1 & 4096) >>> 0 === 0 && mdef.mcansee | 0) {
        await pline(S("%s is affected by your flash of light!"), await Monnam(mdef));
        mdef.mconf = 1;
      }
      { $g = 2; continue $L; };
    case 5:
      resistance = (((mdef.data.mresists | mdef.mextrinsics) & 2) !== 0 ? 1 : 0) << 24 >> 24;
      { $g = 1; continue $L; }
    case 6:
      resistance = (((mdef.data.mresists | mdef.mextrinsics) & 1) !== 0 ? 1 : 0) << 24 >> 24;
      { $g = 1; continue $L; }
    case 7:
      resistance = (((mdef.data.mresists | mdef.mextrinsics) & 16) !== 0 ? 1 : 0) << 24 >> 24;
    case 1: // common
      if (!resistance) {
        await pline(S("%s gets blasted!"), await Monnam(mdef));
        mdef.mhp -= tmp;
        if (mdef.mhp < 1) {
          await killed(mdef);
          return 2;
        }
      } else {
        await shieldeff(mdef.mx, mdef.my);
        if (mdef.data.mlet === S_GOLEM) {
          await golemeffects(mdef, mattk.adtyp, tmp);
        } else {
          await pline_The(S("blast doesn't seem to affect %s."), await mon_nam(mdef));
        }
      }
      { $g = 2; continue $L; };
    case 8:
      { $g = 2; continue $L; };
    case 2:
      return 1;
    }
    break;
  }
}

async function start_engulf(mdef: struct_monst | null): Promise<void> {
  if (!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic))) {
    await map_location(G.u.ux, G.u.uy, TRUE);
    await tmp_at(DISP_ALWAYS, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.youmonst.data)) + 0);
    await tmp_at(mdef.mx, mdef.my);
  }
  await You(S("engulf %s!"), await mon_nam(mdef));
  await G.windowprocs.win_delay_output();
  await G.windowprocs.win_delay_output();
}

async function end_engulf(): Promise<void> {
  if (!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic))) {
    await tmp_at(DISP_END, 0);
    await newsym(G.u.ux, G.u.uy);
  }
}

async function gulpum(mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let tmp = 0;
  let dam = d(mattk.damn, mattk.damd);
  let fatal_gulp = 0;
  let otmp = null;
  let pd = mdef.data;
  if (!engulf_target(G.youmonst, mdef)) {
    return 0;
  }
  if (G.u.uhunger < 1500 && !G.u.uswallow) {
    for (otmp = mdef.minvent; otmp; otmp = otmp.nobj) {
      await snuff_lit(otmp);
    }
    if ((mdef.cham === 222 || mdef.cham === 223 || mdef.cham === 224) && await newcham(mdef, $sat(G.mons, mdef.cham), FALSE, FALSE)) {
      await You(S("engulf it, then expel it."));
      if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) {
        await pline(S("It turns into %s."), await a_monnam(mdef));
      } else {
        await map_invisible(mdef.mx, mdef.my);
      }
      return 1;
    }
    fatal_gulp = ((pd === $sat(G.mons, 10) || pd === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) || mattk.adtyp === AD_DGST && (pd === $sat(G.mons, 308) || pd === $sat(G.mons, 310) || pd === $sat(G.mons, 309) || pd === $sat(G.mons, PM_MEDUSA) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) ? 1 : 0) << 24 >> 24;
    if (mattk.adtyp === AD_DGST && !(G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic) || fatal_gulp) {
      await eating_conducts(pd);
    }
    if (fatal_gulp && !(pd === $sat(G.mons, 308) || pd === $sat(G.mons, 310) || pd === $sat(G.mons, 309))) {
      let kbuf = new Int8Array(256);
      let mname = pd.mname;
      if (!((pd.mflags2 & 524288) >>> 0 !== 0)) {
        mname = await an(mname);
      }
      await You(S("englut %s."), await mon_nam(mdef));
      sprintf(P(kbuf), S("swallowing %s whole"), mname);
      await instapetrify(P(kbuf));
    } else {
      await start_engulf(mdef);
      switch (mattk.adtyp) {
      case 26:
        if (pd === $sat(G.mons, 308) || pd === $sat(G.mons, 310) || pd === $sat(G.mons, 309)) {
          await pline(S("Unfortunately, digesting any of it is fatal."));
          await end_engulf();
          sprintf(P(G.killer.name), S("unwisely tried to eat %s"), pd.mname);
          G.killer.format = NO_KILLER_PREFIX;
          await done(DIED);
          return 0;
        }
        if (G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic) {
          dam = 0;
          break;
        }
        if (!!(otmp = await mlifesaver(mdef))) {
          await m_useup(mdef, otmp);
        }
        await newuhs(FALSE);
        await xkilled(mdef, XKILL_GIVEMSG | XKILL_NOCORPSE);
        if (!(mdef.mhp < 1)) {
          await You(S("hurriedly regurgitate the sizzling in your %s."), body_part(STOMACH));
        } else {
          tmp = 1 + (pd.cwt >> 8);
          if (await corpse_chance(mdef, G.youmonst, TRUE) && !(G.mvitals[await monsndx(pd)].mvflags & G_NOCORPSE)) {
            G.u.uhunger += (pd.cnutrit + 1) / 2 | 0;
          } else {
            tmp = 0;
          }
          sprintf(P(gulpum$msgbuf), S("You totally digest %s."), await mon_nam(mdef));
          if (tmp !== 0) {
            await You(S("digest %s."), await mon_nam(mdef));
            if (G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic) {
              tmp = tmp * 2;
            }
            nomul(-tmp);
            G.multi_reason = S("digesting something");
            G.nomovemsg = P(gulpum$msgbuf);
          } else {
            await pline(S("%s"), P(gulpum$msgbuf));
          }
          if (pd === $sat(G.mons, PM_GREEN_SLIME)) {
            sprintf(P(gulpum$msgbuf), S("%s isn't sitting well with you."), await The(pd.mname));
            if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
              await make_slimed(5, null);
            }
          } else {
            await exercise(A_CON, TRUE);
          }
        }
        await end_engulf();
        return 2;
      case 0:
        if (G.youmonst.data === $sat(G.mons, PM_FOG_CLOUD)) {
          await pline(S("%s is laden with your moisture."), await Monnam(mdef));
          if ((pd.mflags1 & (512 | 1024)) >>> 0 !== 0 && !(pd === $sat(G.mons, 110) || pd === $sat(G.mons, 30) || pd === $sat(G.mons, 152) || pd === $sat(G.mons, 326))) {
            dam = 0;
            await pline(S("%s seems unharmed."), await Monnam(mdef));
          }
        } else {
          await pline(S("%s is pummeled with your debris!"), await Monnam(mdef));
        }
        break;
      case 8:
        await pline(S("%s is covered with your goo!"), await Monnam(mdef));
        if (((mdef.data.mresists | mdef.mextrinsics) & 64) !== 0) {
          await pline(S("It seems harmless to %s."), await mon_nam(mdef));
          dam = 0;
        }
        break;
      case 11:
        if (can_blnd(G.youmonst, mdef, mattk.aatyp, null)) {
          if (mdef.mcansee) {
            await pline(S("%s can't see in there!"), await Monnam(mdef));
          }
          mdef.mcansee = 0;
          dam += mdef.mblinded | 0;
          if (dam > 127) {
            dam = 127;
          }
          mdef.mblinded = (dam >>> 0) & 127;
        }
        dam = 0;
        break;
      case 6:
        if (rn2(2)) {
          await pline_The(S("air around %s crackles with electricity."), await mon_nam(mdef));
          if (((mdef.data.mresists | mdef.mextrinsics) & 16) !== 0) {
            await pline(S("%s seems unhurt."), await Monnam(mdef));
            dam = 0;
          }
          await golemeffects(mdef, mattk.adtyp, dam);
        } else {
          dam = 0;
        }
        break;
      case 3:
        if (rn2(2)) {
          if (((mdef.data.mresists | mdef.mextrinsics) & 2) !== 0) {
            await pline(S("%s seems mildly chilly."), await Monnam(mdef));
            dam = 0;
          } else {
            await pline(S("%s is freezing to death!"), await Monnam(mdef));
          }
          await golemeffects(mdef, mattk.adtyp, dam);
        } else {
          dam = 0;
        }
        break;
      case 2:
        if (rn2(2)) {
          if (((mdef.data.mresists | mdef.mextrinsics) & 1) !== 0) {
            await pline(S("%s seems mildly hot."), await Monnam(mdef));
            dam = 0;
          } else {
            await pline(S("%s is burning to a crisp!"), await Monnam(mdef));
          }
          await golemeffects(mdef, mattk.adtyp, dam);
        } else {
          dam = 0;
        }
        break;
      case 16:
        if (!rn2(4)) {
          await xdrainenergym(mdef, TRUE);
        }
        dam = 0;
        break;
      }
      await end_engulf();
      mdef.mhp -= dam;
      if (mdef.mhp < 1) {
        await killed(mdef);
        if (mdef.mhp < 1) {
          return 2;
        }
      }
      await You(S("%s %s!"), (G.youmonst.data.mflags1 & 262144) >>> 0 !== 0 ? S("regurgitate") : S("expel"), await mon_nam(mdef));
      if (G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic || (G.youmonst.data.mflags1 & 262144) >>> 0 !== 0) {
        await pline(S("Obviously, you didn't like %s taste."), s_suffix(await mon_nam(mdef)));
      }
    }
  }
  return 0;
}

export async function missum(mdef: struct_monst | null, mattk: struct_attack | null, wouldhavehit: number): Promise<void> {
  if (wouldhavehit) {
    await Your(S("armor is rather cumbersome..."));
  }
  if (could_seduce(G.youmonst, mdef, mattk)) {
    await You(S("pretend to be friendly to %s."), await mon_nam(mdef));
  } else if (((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) && G.flags.verbose) {
    await You(S("miss %s."), await mon_nam(mdef));
  } else {
    await You(S("miss it."));
  }
  if (!mdef.msleeping && mdef.mcanmove | 0) {
    await wakeup(mdef, TRUE);
  }
}

async function hmonas(mon: struct_monst | null): Promise<number> {
  let $g = 0;
  let mattk = null;
  let alt_attk = new struct_attack();
  let weapon = null;
  let originalweapon = null;
  let altwep = 0;
  let weapon_used = 0;
  let odd_claw = 0;
  let i = 0;
  let tmp = 0;
  let armorpenalty = new Int32Array(1);
  let sum = new Int32Array(6);
  let nsum = 0;
  let dhit = new Int32Array(1);
  let attknum = new Int32Array(1);
  let dieroll = 0;
  let multi_claw = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      alt_attk = new struct_attack();
      altwep = FALSE;
      weapon_used = FALSE;
      odd_claw = TRUE;
      sum = new Int32Array(6);
      nsum = 0;
      dhit[0] = 0;
      attknum[0] = 0;
      multi_claw = 0;
      for (i = 0; i < NATTK; ++i) {
        sum[i] = 0;
        mattk = getmattk(G.youmonst, mon, i, P(sum), alt_attk);
        if (mattk.aatyp === AT_WEAP || mattk.aatyp === AT_CLAW || mattk.aatyp === AT_TUCH) {
          ++multi_claw;
        }
      }
      multi_claw = multi_claw > 1 ? 1 : 0;
      i = 0;
    case 3:
      if (!(i < NATTK)) { $g = 5; continue $L; }
      mattk = getmattk(G.youmonst, mon, i, P(sum), alt_attk);
      weapon = null;
      switch (mattk.aatyp) {
      case 254: { $g = 7; continue $L; }
      case 1: { $g = 8; continue $L; }
      case 5: { $g = 9; continue $L; }
      case 3: { $g = 10; continue $L; }
      case 2: { $g = 11; continue $L; }
      case 6: { $g = 12; continue $L; }
      case 4: { $g = 13; continue $L; }
      case 16: { $g = 14; continue $L; }
      case 7: { $g = 15; continue $L; }
      case 13: { $g = 16; continue $L; }
      case 11: { $g = 17; continue $L; }
      case 255: { $g = 18; continue $L; }
      case 0: { $g = 19; continue $L; }
      case 14: { $g = 20; continue $L; }
      case 12: { $g = 21; continue $L; }
      case 10: { $g = 22; continue $L; }
      case 15: { $g = 23; continue $L; }
      default: { $g = 24; continue $L; }
      }
    case 7:
    case 1: // use_weapon
      odd_claw = (!odd_claw ? 1 : 0) << 24 >> 24;
      if (weapon_used && sum[i - 1] && G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
        { $g = 4; continue $L; };
      }
      weapon_used = TRUE;
      originalweapon = altwep && G.uswapwep ? P(G, "uswapwep") : P(G, "uwep");
      if (G.uswapwep && G.uwep && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE) && !((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) && !G.uarms && !G.uswapwep.oartifact && (G.uswapwep.oclass === WEAPON_CLASS || G.uswapwep.oclass === TOOL_CLASS && G.objects[G.uswapwep.otyp].oc_subtyp !== P_NONE) && !(G.uswapwep.oclass === WEAPON_CLASS && G.objects[G.uswapwep.otyp].oc_subtyp >= P_BOW && G.objects[G.uswapwep.otyp].oc_subtyp <= P_CROSSBOW || (G.uswapwep.oclass === WEAPON_CLASS || G.uswapwep.oclass === GEM_CLASS) && G.objects[G.uswapwep.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[G.uswapwep.otyp].oc_subtyp <= -P_BOW || (G.uswapwep.oclass === WEAPON_CLASS || G.uswapwep.oclass === TOOL_CLASS) && G.objects[G.uswapwep.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[G.uswapwep.otyp].oc_subtyp <= -P_DART) && !((G.uswapwep.oclass === WEAPON_CLASS || G.uswapwep.oclass === TOOL_CLASS) && G.objects[G.uswapwep.otyp].oc_big | 0) && !((G.objects[G.uswapwep.otyp].oc_material | 0) === SILVER && (G.u.ulycn >= -1 + 1 || hates_silver(G.youmonst.data)))) {
        altwep = (!altwep ? 1 : 0) << 24 >> 24;
      }
      weapon = originalweapon.a[originalweapon.o];
      if (!weapon) {
        originalweapon = P(G, "uarmg");
      }
      tmp = await find_roll_to_hit(mon, AT_WEAP, weapon, P(attknum, 0), P(armorpenalty, 0));
      dieroll = rnd(20);
      dhit[0] = tmp > dieroll || G.u.uswallow | 0 ? 1 : 0;
      if (!await known_hitum(mon, weapon, P(dhit, 0), tmp, armorpenalty[0], mattk, dieroll)) {
        sum[i] = 2;
        { $g = 6; continue $L; };
      } else {
        sum[i] = dhit[0];
      }
      weapon = originalweapon.a[originalweapon.o];
      if ((!!G.level.monsters[G.u.ux + G.u.dx][G.u.uy + G.u.dy] ? G.level.monsters[G.u.ux + G.u.dx][G.u.uy + G.u.dy] : null) !== mon) {
        i = NATTK;
        { $g = 2; continue $L; }
      }
      if (dhit[0] && mattk.adtyp !== AD_SPEL && mattk.adtyp !== AD_PHYS) {
        sum[i] = await damageum(mon, mattk, 0);
      }
      { $g = 6; continue $L; };
    case 8:
      if (G.uwep && !((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1) && !weapon_used) {
        { $g = 1; continue $L; }
      }
    case 9:
      if (G.uwep && G.youmonst.data.mlet === S_LICH && !weapon_used) {
        { $g = 1; continue $L; }
      }
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
      tmp = await find_roll_to_hit(mon, mattk.aatyp, null, P(attknum, 0), P(armorpenalty, 0));
      dieroll = rnd(20);
      dhit[0] = tmp > dieroll || G.u.uswallow | 0 ? 1 : 0;
      if (dhit[0]) {
        let compat = 0;
        let specialdmg = 0;
        const silverhit = new Float64Array(1);
        silverhit[0] = 0;
        let verb = null;
        if (!G.u.uswallow && (compat = could_seduce(G.youmonst, mon, mattk)) !== 0) {
          await You(S("%s %s %s."), mon.mcansee | 0 && (mon.data.mflags1 & 4096) >>> 0 === 0 ? S("smile at") : S("talk to"), await mon_nam(mon), compat === 2 ? S("engagingly") : S("seductively"));
          sum[i] = await damageum(mon, mattk, 0);
          { $g = 6; continue $L; };
        }
        await wakeup(mon, TRUE);
        specialdmg = 0;
        switch (mattk.aatyp) {
        case 1:
        case 5:
          verb = mattk.aatyp === AT_TUCH ? S("touch") : S("claws");
          odd_claw = (!odd_claw ? 1 : 0) << 24 >> 24;
          specialdmg = await special_dmgval(G.youmonst, mon, W_ARMG | (odd_claw || !multi_claw ? W_RINGL : 0) | (!odd_claw || !multi_claw ? W_RINGR : 0), P(silverhit, 0));
          break;
        case 16:
          verb = S("tentacles");
          break;
        case 3:
          verb = S("kick");
          specialdmg = await special_dmgval(G.youmonst, mon, W_ARMF, P(silverhit, 0));
          break;
        case 4:
          verb = S("head butt");
          specialdmg = await special_dmgval(G.youmonst, mon, W_ARMH, P(silverhit, 0));
          break;
        case 2:
          verb = S("bite");
          break;
        case 6:
          verb = S("sting");
          break;
        default:
          verb = S("hit");
          break;
        }
        if (mon.data === $sat(G.mons, PM_SHADE) && !specialdmg) {
          if (!strcmp(verb, S("hit")) || mattk.aatyp === AT_CLAW && (mon.data.mflags1 & 131072) >>> 0 !== 0) {
            verb = S("attack");
          }
          await Your(S("%s %s harmlessly through %s."), verb, vtense(verb, S("pass")), await mon_nam(mon));
        } else {
          if (mattk.aatyp === AT_TENT) {
            await Your(S("tentacles suck %s."), await mon_nam(mon));
          } else {
            if (mattk.aatyp === AT_CLAW) {
              verb = S("hit");
            }
            await You(S("%s %s."), verb, await mon_nam(mon));
            if (silverhit[0] && G.flags.verbose) {
              await silver_sears(G.youmonst, mon, silverhit[0]);
            }
          }
          sum[i] = await damageum(mon, mattk, specialdmg);
        }
      } else {
        await missum(mon, mattk, tmp + armorpenalty[0] > dieroll ? 1 : 0);
      }
      { $g = 6; continue $L; };
    case 15:
      {
        let specialdmg = 0;
        const silverhit = new Float64Array(1);
        silverhit[0] = 0;
        let byhand = ($sat(G.mons, G.u.umonnum) === $sat(G.mons, 247) ? 1 : 0) << 24 >> 24;
        let unconcerned = (byhand && !await can_be_strangled(mon) ? 1 : 0) << 24 >> 24;
        if (sticks(mon.data) || G.u.uswallow | 0 || G.notonhead || byhand && (G.uwep || !((mon.data.mflags1 & 32768) >>> 0 === 0))) {
          if (byhand && G.uwep && G.u.ustuck && !(sticks(G.u.ustuck.data) || G.u.uswallow | 0)) {
            await uunstick();
          }
          { $g = 4; continue $L; };
        }
        dhit[0] = 1;
        await wakeup(mon, TRUE);
        specialdmg = await special_dmgval(G.youmonst, mon, byhand ? W_ARMG | W_RINGL | W_RINGR : W_ARMC | W_ARM | W_ARMU, P(silverhit, 0));
        if (unconcerned) {
          if (mattk !== alt_attk) {
            alt_attk.$cp(mattk);
            mattk = alt_attk;
          }
          mattk.damn = mattk.damd = 1;
          if (specialdmg || (mon.data.mflags1 & 65536) >>> 0 !== 0 || mon.mhp <= 1 + (G.u.udaminc > 1 ? G.u.udaminc : 1)) {
            unconcerned = FALSE;
          }
        }
        if (mon.data === $sat(G.mons, PM_SHADE)) {
          let verb = byhand ? S("grasp") : S("hug");
          if (specialdmg) {
            await You(S("%s %s%s"), verb, await mon_nam(mon), exclam(specialdmg));
            if (silverhit[0] && G.flags.verbose) {
              await silver_sears(G.youmonst, mon, silverhit[0]);
            }
            sum[i] = await damageum(mon, mattk, specialdmg);
          } else {
            await Your(S("%s passes harmlessly through %s."), verb, await mon_nam(mon));
          }
          { $g = 6; continue $L; };
        }
        if (mon === G.u.ustuck) {
          await pline(S("%s is being %s%s."), await Monnam(mon), byhand ? S("throttled") : S("crushed"), unconcerned ? S(" but doesn't seem concerned") : S(""));
          if (silverhit[0] && G.flags.verbose) {
            await silver_sears(G.youmonst, mon, silverhit[0]);
          }
          sum[i] = await damageum(mon, mattk, specialdmg);
        } else if (i >= 2 && sum[i - 1] && sum[i - 2]) {
          if (G.u.ustuck && G.u.ustuck !== mon) {
            await uunstick();
          }
          await You(S("grab %s!"), await mon_nam(mon));
          G.u.ustuck = mon;
          if (silverhit[0] && G.flags.verbose) {
            await silver_sears(G.youmonst, mon, silverhit[0]);
          }
          sum[i] = await damageum(mon, mattk, specialdmg);
        }
        { $g = 6; continue $L; };
      }
    case 16:
      dhit[0] = -1;
      await wakeup(mon, TRUE);
      sum[i] = await explum(mon, mattk);
      { $g = 6; continue $L; };
    case 17:
      tmp = await find_roll_to_hit(mon, mattk.aatyp, null, P(attknum, 0), P(armorpenalty, 0));
      if (dhit[0] = tmp > rnd(20 + i) ? 1 : 0) {
        await wakeup(mon, TRUE);
        if (mon.data === $sat(G.mons, PM_SHADE)) {
          await Your(S("attempt to surround %s is harmless."), await mon_nam(mon));
        } else {
          sum[i] = await gulpum(mon, mattk);
          if (sum[i] === 2 && (mon.data.mlet === S_ZOMBIE || mon.data.mlet === S_MUMMY) && rn2(5) && !(G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep))) {
            await You_feel(S("%ssick."), G.u.uprops[SICK].intrinsic ? S("very ") : S(""));
            await mdamageu(mon, rnd(8));
          }
        }
      } else {
        await missum(mon, mattk, FALSE);
      }
      { $g = 6; continue $L; };
    case 18:
      if ((G.youmonst.data.mlet === S_KOBOLD || G.youmonst.data.mlet === S_ORC || G.youmonst.data.mlet === S_GNOME) && !weapon_used) {
        { $g = 1; continue $L; }
      }
    case 19:
    case 20:
      { $g = 4; continue $L; };
    case 21:
    case 22:
    case 23:
      dhit[0] = 0;
      { $g = 6; continue $L; };
    case 24:
      await impossible(S("strange attack of yours (%d)"), mattk.aatyp);
    case 6:
      if (dhit[0] === -1) {
        G.u.mh = -1;
        await rehumanize();
      }
      if (sum[i] === 2) {
        await passive(mon, weapon, 1, 0, mattk.aatyp, FALSE);
        nsum = 0;
      } else {
        await passive(mon, weapon, sum[i], 1, mattk.aatyp, FALSE);
        nsum |= sum[i];
      }
    case 2: // passivedone
      if (G.uswapwep && weapon === G.uswapwep && weapon.cursed | 0) {
        await drop_uswapwep();
        { $g = 5; continue $L; };
      }
      if (mon.mhp < 1) {
        { $g = 5; continue $L; };
      }
      if (!(G.u.umonnum !== G.u.umonster)) {
        { $g = 5; continue $L; };
      }
      if (G.multi < 0) {
        { $g = 5; continue $L; };
      }
    case 4:
      ++i;
      { $g = 3; continue $L; }
    case 5:
      return (!(mon.mhp < 1) ? 1 : 0) << 24 >> 24;
    }
    break;
  }
}

export async function passive(mon: struct_monst | null, weapon: struct_obj | null, mhit: number, malive: number, aatyp: number, wep_was_destroyed: number): Promise<number> {
  let ptr = mon.data;
  let i = 0;
  let tmp = 0;
  for (i = 0; ; ++i) {
    if (i >= NATTK) {
      return malive | mhit;
    }
    if (ptr.mattk[i].aatyp === AT_NONE) {
      break;
    }
  }
  if (ptr.mattk[i].damn) {
    tmp = d(ptr.mattk[i].damn, ptr.mattk[i].damd);
  } else if (ptr.mattk[i].damd) {
    tmp = d(mon.m_lev + 1, ptr.mattk[i].damd);
  } else {
    tmp = 0;
  }
  switch (ptr.mattk[i].adtyp) {
  case 2:
    if (mhit && !mon.mcan && weapon) {
      if (aatyp === AT_KICK) {
        if (G.uarmf && !rn2(6)) {
          await erode_obj(G.uarmf, await xname(G.uarmf), ERODE_BURN, EF_GREASE | EF_VERBOSE);
        }
      } else if (aatyp === AT_WEAP || aatyp === AT_CLAW || aatyp === AT_MAGC || aatyp === AT_TUCH) {
        await passive_obj(mon, weapon, $sat(ptr.mattk, i));
      }
    }
    break;
  case 8:
    if (mhit && rn2(2)) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || !G.flags.verbose) {
        await You(S("are splashed!"));
      } else {
        await You(S("are splashed by %s %s!"), s_suffix(await mon_nam(mon)), hliquid(S("acid")));
      }
      if (!(G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic)) {
        await mdamageu(mon, tmp);
      }
      if (!rn2(30)) {
        await erode_armor(G.youmonst, ERODE_CORRODE);
      }
    }
    if (mhit && weapon) {
      if (aatyp === AT_KICK) {
        if (G.uarmf && !rn2(6)) {
          await erode_obj(G.uarmf, await xname(G.uarmf), ERODE_CORRODE, EF_GREASE | EF_VERBOSE);
        }
      } else if (aatyp === AT_WEAP || aatyp === AT_CLAW || aatyp === AT_MAGC || aatyp === AT_TUCH) {
        await passive_obj(mon, weapon, $sat(ptr.mattk, i));
      }
    }
    await exercise(A_STR, FALSE);
    break;
  case 18:
    if (mhit) {
      let protector = attk_protection(aatyp);
      if (aatyp === AT_MAGC) {
        protector = W_ARMG;
      }
      if (protector === 0 || protector === W_ARMG && !G.uarmg && !G.uwep && !wep_was_destroyed || protector === W_ARMF && !G.uarmf || protector === W_ARMH && !G.uarmh || protector === (W_ARMC | W_ARMG) && (!G.uarmc || !G.uarmg)) {
        if (!(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
          await done_in_by(mon, STONING);
          return 2;
        }
      }
    }
    break;
  case 24:
    if (mhit && !mon.mcan && weapon) {
      if (aatyp === AT_KICK) {
        if (G.uarmf) {
          await erode_obj(G.uarmf, await xname(G.uarmf), ERODE_RUST, EF_GREASE | EF_VERBOSE);
        }
      } else if (aatyp === AT_WEAP || aatyp === AT_CLAW || aatyp === AT_MAGC || aatyp === AT_TUCH) {
        await passive_obj(mon, weapon, $sat(ptr.mattk, i));
      }
    }
    break;
  case 42:
    if (mhit && !mon.mcan && weapon) {
      if (aatyp === AT_KICK) {
        if (G.uarmf) {
          await erode_obj(G.uarmf, await xname(G.uarmf), ERODE_CORRODE, EF_GREASE | EF_VERBOSE);
        }
      } else if (aatyp === AT_WEAP || aatyp === AT_CLAW || aatyp === AT_MAGC || aatyp === AT_TUCH) {
        await passive_obj(mon, weapon, $sat(ptr.mattk, i));
      }
    }
    break;
  case 1:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline(S("A hail of magic missiles narrowly misses you!"));
    } else {
      await You(S("are hit by magic missiles appearing from thin air!"));
      await mdamageu(mon, tmp);
    }
    break;
  case 41:
    if (mhit) {
      if (aatyp === AT_KICK) {
        if (!weapon) {
          break;
        }
      } else if (aatyp === AT_BITE || aatyp === AT_BUTT || aatyp >= AT_STNG && aatyp < AT_WEAP) {
        break;
      }
      await passive_obj(mon, weapon, $sat(ptr.mattk, i));
    }
    break;
  default:
    break;
  }
  if (malive && !mon.mcan && rn2(3)) {
    switch (ptr.mattk[i].adtyp) {
    case 14:
      if (ptr === $sat(G.mons, PM_FLOATING_EYE)) {
        if (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected))) {
          break;
        }
        if (mon.mcansee) {
          if (await ureflects(S("%s gaze is reflected by your %s."), s_suffix(await Monnam(mon)))) {
            ;
          } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && rn2(4)) {
            await pline(S("%s looks %s%s."), await Monnam(mon), !rn2(2) ? S("") : S("rather "), !rn2(2) ? S("numb") : S("stupefied"));
          } else if (G.u.uprops[FREE_ACTION].extrinsic) {
            await You(S("momentarily stiffen under %s gaze!"), s_suffix(await mon_nam(mon)));
          } else {
            await You(S("are frozen by %s gaze!"), s_suffix(await mon_nam(mon)));
            nomul(acurr(A_WIS) > 12 || rn2(4) ? -tmp : -127);
            G.multi_reason = S("frozen by a monster's gaze");
            G.nomovemsg = null;
          }
        } else {
          await pline(S("%s cannot defend itself."), await Adjmonnam(mon, S("blind")));
          if (!rn2(500)) {
            change_luck(-1);
          }
        }
      } else if (G.u.uprops[FREE_ACTION].extrinsic) {
        await You(S("momentarily stiffen."));
      } else {
        await You(S("are frozen by %s!"), await mon_nam(mon));
        G.nomovemsg = G.c_common_strings.c_You_can_move_again;
        nomul(-tmp);
        G.multi_reason = S("frozen by a monster");
        await exercise(A_DEX, FALSE);
      }
      break;
    case 3:
      if (monnear(mon, G.u.ux, G.u.uy)) {
        if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
          await shieldeff(G.u.ux, G.u.uy);
          await You_feel(S("a mild chill."));
          await ugolemeffects(AD_COLD, tmp);
          break;
        }
        await You(S("are suddenly very cold!"));
        await mdamageu(mon, tmp);
        mon.mhp += tmp / 2 | 0;
        if (mon.mhpmax < mon.mhp) {
          mon.mhpmax = mon.mhp;
        }
        if (mon.mhpmax > (mon.m_lev + 1) * 8) {
          await split_mon(mon, G.youmonst);
        }
      }
      break;
    case 12:
      if (!G.u.uprops[STUNNED].intrinsic) {
        await make_stunned(tmp, TRUE);
      }
      break;
    case 2:
      if (monnear(mon, G.u.ux, G.u.uy)) {
        if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
          await shieldeff(G.u.ux, G.u.uy);
          await You_feel(S("mildly warm."));
          await ugolemeffects(AD_FIRE, tmp);
          break;
        }
        await You(S("are suddenly very hot!"));
        await mdamageu(mon, tmp);
      }
      break;
    case 6:
      if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
        await shieldeff(G.u.ux, G.u.uy);
        await You_feel(S("a mild tingle."));
        await ugolemeffects(AD_ELEC, tmp);
        break;
      }
      await You(S("are jolted with electricity!"));
      await mdamageu(mon, tmp);
      break;
    default:
      break;
    }
  }
  return malive | mhit;
}

export async function passive_obj(mon: struct_monst | null, obj: struct_obj | null, mattk: struct_attack | null): Promise<void> {
  let ptr = mon.data;
  let i = 0;
  if (!obj) {
    obj = G.u.twoweap && G.uswapwep && !rn2(2) ? G.uswapwep : G.uwep;
    if (!obj && mattk.adtyp === AD_ENCH) {
      obj = G.uarmg;
    }
    if (!obj) {
      return;
    }
  }
  if (!mattk) {
    for (i = 0; ; ++i) {
      if (i >= NATTK) {
        return;
      }
      if (ptr.mattk[i].aatyp === AT_NONE) {
        break;
      }
    }
    mattk = $sat(ptr.mattk, i);
  }
  switch (mattk.adtyp) {
  case 2:
    if (!rn2(6) && !mon.mcan && mon.data !== $sat(G.mons, PM_STEAM_VORTEX)) {
      await erode_obj(obj, null, ERODE_BURN, EF_NONE);
    }
    break;
  case 8:
    if (!rn2(6)) {
      await erode_obj(obj, null, ERODE_CORRODE, EF_GREASE);
    }
    break;
  case 24:
    if (!mon.mcan) {
      await erode_obj(obj, null, ERODE_RUST, EF_GREASE);
    }
    break;
  case 42:
    if (!mon.mcan) {
      await erode_obj(obj, null, ERODE_CORRODE, EF_GREASE);
    }
    break;
  case 41:
    if (!mon.mcan) {
      if (await drain_item(obj, TRUE) && obj.where === 3 && (obj.known | 0 || obj.oclass === ARMOR_CLASS)) {
        await pline(S("%s less effective."), await Yobjnam2(obj, S("seem")));
      }
      break;
    }
  default:
    break;
  }
  if (obj.where === 3) {
    update_inventory();
  }
}

export async function stumble_onto_mimic(mtmp: struct_monst | null): Promise<void> {
  let fmt = S("Wait!  That's %s!");
  let generic = S("a monster");
  let what = null;
  if (!G.u.ustuck && !mtmp.mflee && dmgtype(mtmp.data, AD_STCK)) {
    G.u.ustuck = mtmp;
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    if (!(G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic)) {
      what = generic;
    } else if ((mtmp.m_ap_type & 7) === M_AP_MONSTER) {
      what = await a_monnam(mtmp);
    }
  } else {
    let glyph = $at2(G.level.locations, G.u.ux + G.u.dx, G.u.uy + G.u.dy).glyph;
    if (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && ((glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_hcdoor || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_vcdoor)) {
      fmt = S("The door actually was %s!");
    } else if ((glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) && (glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382 ? 240 : glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? 449 : glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 ? glyph - (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === GOLD_PIECE) {
      fmt = S("That gold was %s!");
    }
    if (mtmp.minvis | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
      what = generic;
    } else {
      what = await a_monnam(mtmp);
    }
  }
  if (what) {
    await pline(fmt, what);
  }
  await wakeup(mtmp, FALSE);
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && !($at2(G.level.locations, mtmp.mx, mtmp.my).glyph === 382 + (382 + 0))) {
    await map_invisible(mtmp.mx, mtmp.my);
  }
}

async function nohandglow(mon: struct_monst | null): Promise<void> {
  let hands = await makeplural(body_part(HAND));
  if (!G.u.umconf || mon.mconf | 0) {
    return;
  }
  if (G.u.umconf === 1) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await Your(S("%s stop tingling."), hands);
    } else {
      await Your(S("%s stop glowing %s."), hands, hcolor(G.c_color_names.c_red));
    }
  } else {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await pline_The(S("tingling in your %s lessens."), hands);
    } else {
      await Your(S("%s no longer glow so brightly %s."), hands, hcolor(G.c_color_names.c_red));
    }
  }
  G.u.umconf = G.u.umconf - 1 >>> 0;
}

export async function flash_hits_mon(mtmp: struct_monst | null, otmp: struct_obj | null): Promise<number> {
  let tmp = 0;
  let amt = 0;
  let res = 0;
  let useeit = (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0;
  if (mtmp.msleeping) {
    mtmp.msleeping = 0;
    if (useeit) {
      await pline_The(S("flash awakens %s."), await mon_nam(mtmp));
      res = 1;
    }
  } else if (mtmp.data.mlet !== S_LIGHT) {
    if (!resists_blnd(mtmp)) {
      tmp = dist2(otmp.ox, otmp.oy, mtmp.mx, mtmp.my);
      if (useeit) {
        await pline(S("%s is blinded by the flash!"), await Monnam(mtmp));
        res = 1;
      }
      if (mtmp.data === $sat(G.mons, PM_GREMLIN)) {
        amt = otmp.otyp === WAN_LIGHT ? d(1 + otmp.spe, 4) : rn2(mtmp.mhp < 4 ? mtmp.mhp : 4);
        await light_hits_gremlin(mtmp, amt);
      }
      if (!(mtmp.mhp < 1)) {
        if (!G.context.mon_moving) {
          await setmangry(mtmp, TRUE);
        }
        if (tmp < 9 && !mtmp.isshk && rn2(4)) {
          await monflee(mtmp, rn2(4) ? rnd(100) : 0, FALSE, TRUE);
        }
        mtmp.mcansee = 0;
        mtmp.mblinded = ((tmp < 3 ? 0 : rnd(1 + (50 / tmp | 0))) >>> 0) & 127;
      }
    }
  }
  return res;
}

export async function light_hits_gremlin(mon: struct_monst | null, dmg: number): Promise<void> {
  await pline(S("%s %s!"), await Monnam(mon), dmg > (mon.mhp / 2 | 0) ? S("wails in agony") : S("cries out in pain"));
  mon.mhp -= dmg;
  wake_nearto(mon.mx, mon.my, 30);
  if (mon.mhp < 1) {
    if (G.context.mon_moving) {
      await monkilled(mon, null, AD_BLND);
    } else {
      await killed(mon);
    }
  } else if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 && !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
    await map_invisible(mon.mx, mon.my);
  }
}

export function $init(): void {
  override_confirmation = 0;
  hitum_cleave$clockwise = 0;
  shade_miss$harmlessly_thru = $cs(" harmlessly through ", 21);
  gulpum$msgbuf = new Int8Array(256);
}
