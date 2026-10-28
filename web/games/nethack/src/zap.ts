// @ts-nocheck
// NetHack 3.6.7 zap.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { defends, defends_when_carried } from './artifact.ts';
import { acurr, adjalign, exercise, poisoned } from './attrib.ts';
import { bot } from './botl.ts';
import { enlightenment, getdir, isok } from './cmd.ts';
import { close_drawbridge, destroy_drawbridge, find_drawbridge, is_db_wall, is_drawbridge_wall, is_ice, is_lava, is_moat, is_pool, open_drawbridge } from './dbridge.ts';
import { cvt_sdoor_to_door, findit } from './detect.ts';
import { bury_objs, draft_message, unearth_objs, zap_dig } from './dig.ts';
import { docrt, map_invisible, newsym, newsym_force, shieldeff, tmp_at, unmap_invisible, unmap_object, zapdir_to_glyph } from './display.ts';
import { boulder_hits_pool } from './do.ts';
import { Amonnam, Monnam, a_monnam, christen_monst, hcolor, hliquid, mon_nam, noit_Monnam, noname_monnam, rndmonnam } from './do_name.ts';
import { Ring_gone, destroy_arm, find_ac, set_wear } from './do_wear.ts';
import { tamedog, wary_dog } from './dog.ts';
import { ship_object } from './dokick.ts';
import { breakobj, breaks, endmultishot, hero_breaks } from './dothrow.ts';
import { In_mines, on_level } from './dungeon.ts';
import { eaten_stat, fix_petrification } from './eat.ts';
import { done, panic } from './end.ts';
import { ceiling, del_engr, engr_at, make_engr_at, random_engraving, rloc_engr, surface, wipe_engr_at } from './engrave.ts';
import { losexp, more_experienced } from './exper.ts';
import { explode } from './explode.ts';
import { debugcore } from './files.ts';
import { dryup } from './fountain.ts';
import { check_capacity, in_rooms, long_to_any, losehp, nomul, spoteffects, test_move } from './hack.ts';
import { dist2, eos, mungspaces, s_suffix, sgn, strncmpi, upstart } from './hacklib.ts';
import { addinv_core1, addinv_core2, delobj, display_binventory, display_cinventory, display_minventory, freeinv_core, getobj, hold_another_object, merged, sobj_at, stackobj, update_inventory, useup, useupf } from './invent.ts';
import { find_mid, show_transient_light, transient_light_cleanup } from './light.ts';
import { boxlock, doorlock, picking_at, reset_pick } from './lock.ts';
import { create_critters, makemon, monhp_per_lvl, newmcorpsenm, set_mimic_sym } from './makemon.ts';
import { sleep_monst, slept_monst } from './mhitm.ts';
import { expels, u_slow_down } from './mhitu.ts';
import { waterbody_name } from './mkmaze.ts';
import { add_to_minv, corpse_revive_type, costly_alteration, dealloc_oextra, free_omid, free_omonst, get_mtraits, is_flammable, is_rottable, mkobj, mksobj, mksobj_at, obj_extract_self, obj_ice_effects, place_object, replace_object, set_corpsenm, splitobj, unbless, uncurse, weight } from './mkobj.ts';
import { can_be_hatched, dead_species, dealloc_monst, hideunder, killed, m_respond, mimic_hit_msg, minliquid, mlifesaver, mongone, monkilled, newcham, replmon, restore_cham, seemimic, setmangry, wakeup, xkilled } from './mon.ts';
import { dmgtype, monsndx, resists_blnd, resists_drli, resists_magm } from './mondata.ts';
import { closed_door, monflee } from './monmove.ts';
import { hits_bars, m_useup, thitu } from './mthrowu.ts';
import { mcureblindness, mon_reflects, ureflects } from './muse.ts';
import { discover_object } from './o_init.ts';
import { An, The, Tobjnam, Yname2, an, ansimpleoname, aobjnam, corpse_xname, cxname_singular, distant_name, erosion_matters, makeplural, otense, readobjnam, rnd_class, the, vtense, xname, yname } from './objnam.ts';
import { Norep, You, You_feel, You_hear, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, polymon, polyself, rehumanize, ugolemeffects } from './polyself.ts';
import { healup, incr_itimeout, make_blinded, make_stunned, potionbreathe, self_invis_message } from './potion.ts';
import { ghod_hitsu, mstatusline, ustatusline } from './priest.ts';
import { ok_to_quest } from './quest.ts';
import { is_quest_artifact } from './questpgr.ts';
import { cant_revive, litroom, unpunish } from './read.ts';
import { create_gas_cloud } from './region.ts';
import { d, rn2, rnd } from './rnd.ts';
import { Shk_Your, add_damage, addtobill, billable, check_unpaid, contained_cost, costly_spot, delete_contents, hot_pursuit, inhishop, inside_shop, make_angry_shk, obfree, pay_for_damage, shk_your, shkcatch, shop_keeper, stolen_value } from './shk.ts';
import { neweshk, shkname } from './shknam.ts';
import { spell_skilltype } from './spell.ts';
import { mdrop_obj, remove_worn_item } from './steal.ts';
import { enexto, rloco, tele, u_teleport_mon } from './teleport.ts';
import { attach_egg_hatch_timeout, burn_away_slime, fall_asleep, kill_egg, obj_stop_timers, spot_stop_timers, spot_time_left, start_timer } from './timeout.ts';
import { acid_damage, activate_statue_trap, animate_statue, burnarmor, closeholdingtrap, delfloortrap, dotrap, maketrap, openfallingtrap, openholdingtrap, reset_utrap, set_utrap, sokoban_guilt, t_at } from './trap.ts';
import { erode_armor, flash_hits_mon, shade_miss } from './uhitm.ts';
import { block_point, does_block, unblock_point, vision_recalc } from './vision.ts';
import { dmgval, setmnotwielded } from './weapon.ts';
import { were_change } from './were.ts';
import { setuqwep, setuswapwep, setuwep } from './wield.ts';
import { worm_known } from './worm.ts';
import { bypass_obj, bypass_objlist, find_mac, m_dowear, mon_adjust_speed, mon_set_minvis, nxt_unbypassed_obj, setnotworn, setworn, update_mon_intrinsics, wearmask_to_obj, wearslot, which_armor } from './worn.ts';
import { struct_attack, struct_monst, struct_nhcoord, struct_obj, union_any } from './structs.ts';
import { $at2, $cs, $rd, $sat, $shl64, $shr64, $sidx, $ta, $wr, G, P, S, memcpy, memset, rn2_on_display_rng, sprintf, strcat, strchr, strcpy } from './rt/index.ts';
import { ACID_RES, AD_COLD, AD_DRLI, AD_ELEC, AD_FIRE, AD_RBRE, AD_SEDU, AD_SPEL, AD_SSEX, AMULET_OF_YENDOR, ANIMATE_SPELL, ANTIMAGIC, ARM, ARMOR_CLASS, ARTICLE_THE, ART_TROLLSBANE, A_CHA, A_CON, A_DEX, A_INT, A_STR, A_WIS, BAG_OF_HOLDING, BELL_OF_OPENING, BLINDED, BONE, BOULDER, BURIED_TOO, CANDELABRUM_OF_INVOCATION, CLOTH, COIN_CLASS, COLD_RES, CONTAINED_TOO, COPPER, CORPSE, COST_CANCEL, COST_DRAIN, COST_UNBLSS, COST_UNCURS, CXN_NO_PFX, CXN_PFX_THE, CXN_SINGULAR, DBWALL, DB_FLOOR, DB_ICE, DB_UNDER, DEAF, DETECT_MONSTERS, DIED, DISINT_RES, DISP_BEAM, DISP_CHANGE, DISP_END, DISP_FLASH, DISP_TETHER, DOOR, DRAIN_RES, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_BROKEN, D_NODOOR, EGG, ENGRAVE, ENL_GAMEINPROGRESS, ERODE_CORRODE, EXPL_FIERY, EXPL_MAX, EYE, FACE, FALSE, FAST, FIGURINE, FIRE_RES, FLASHED_LIGHT, FLESH, FLYING, FM_FMON, FOOD_CLASS, FOOT, FOUNTAIN, FROMOUTSIDE, FUMBLING, GEMSTONE, GEM_CLASS, GLASS, GLOB_OF_GREEN_SLIME, GOLD, G_GENOD, G_NOCORPSE, G_UNIQ, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, HEAD, HEADSTONE, HEAVY_IRON_BALL, HOLE, HUGE_CHUNK_OF_MEAT, ICE, ICED_MOAT, ICED_POOL, IMMEDIATE, INFRAVISION, INTRINSIC, INVIS, INVIS_BEAM, IRON, IRONBARS, KICKED_WEAPON, KILLED_BY, KILLED_BY_AN, LARGEST_INT, LEATHER, LEVITATION, LOW_BOOTS, LOW_PM, MAGICENLIGHTENMENT, MAGIC_COOKIE, MAGIC_LAMP, MAGIC_MARKER, MAXPCHARS, MAXWISHTRY, MAX_ICE_TIME, MAX_SPELL_STUDY, MEATBALL, MEAT_RING, MEAT_STICK, MELT_ICE_AWAY, METAL, MINERAL, MINV_ALL, MINV_NOLET, MIN_ICE_TIME, MITHRIL, MM_ADJACENTOK, MM_NOCOUNTBIRTH, MM_NOWAIT, MOAT, MUMMY_WRAPPING, M_AP_NOTHING, M_AP_OBJECT, NHW_TEXT, NODIR, NON_PM, NOTELL, NO_KILLER_PREFIX, NO_MINVENT, NO_MM_FLAGS, OBJ_CONTAINED, OBJ_FLOOR, OBJ_FREE, OBJ_INVENT, OBJ_MINVENT, OIL_LAMP, PAPER, PASSES_WALLS, PICK_NONE, PIT, PLATINUM, PM_CLAY_GOLEM, PM_CROCODILE, PM_DEATH, PM_DOPPELGANGER, PM_FLESH_GOLEM, PM_GHOST, PM_GLASS_GOLEM, PM_GOLD_GOLEM, PM_GREMLIN, PM_IRON_GOLEM, PM_LEATHER_GOLEM, PM_LONG_WORM, PM_PAPER_GOLEM, PM_PESTILENCE, PM_ROPE_GOLEM, PM_SKELETON, PM_STONE_GOLEM, PM_STRAW_GOLEM, PM_WOOD_GOLEM, POOL, POTION_CLASS, POT_ACID, POT_FRUIT_JUICE, POT_GAIN_ABILITY, POT_OIL, POT_POLYMORPH, POT_SEE_INVISIBLE, POT_SICKNESS, POT_WATER, P_BASIC, P_BOW, P_EXPERT, P_ISRESTRICTED, P_NONE, P_PICK_AXE, P_SHURIKEN, P_SKILLED, P_UNSKILLED, REFLECTING, RING_CLASS, RIN_SHOCK_RESISTANCE, ROCK, ROCK_CLASS, ROOM, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_FIRE, SCR_MAIL, SDOOR, SEE_INVIS, SHOCK_RES, SHOPBASE, SHOP_BARS_COST, SHOP_DOOR_COST, SILVER, SINK, SLEEP_RES, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_CANCELLATION, SPE_DIG, SPE_DRAIN_LIFE, SPE_EXTRA_HEALING, SPE_FINGER_OF_DEATH, SPE_FIREBALL, SPE_FORCE_BOLT, SPE_KNOCK, SPE_MAGIC_MISSILE, SPE_NOVEL, SPE_POLYMORPH, SPE_STONE_TO_FLESH, SPE_TURN_UNDEAD, SPIKED_PIT, STATUE, STATUE_HISTORIC, STATUE_TRAP, STONE, STONED, STRANGE_OBJECT, STRAT_WAITMASK, STUNNED, S_BLOB, S_EEL, S_ELEMENTAL, S_FUNGUS, S_GHOST, S_GOLEM, S_JELLY, S_LIGHT, S_MIMIC, S_PUDDING, S_TROLL, S_VORTEX, S_ZOMBIE, S_bars, S_boomleft, S_boomright, S_flashbeam, TELEPAT, TELEPORT_CONTROL, TELL, TEMPLE, TEST_MOVE, THROWN_TETHERED_WEAPON, THROWN_WEAPON, TIMEOUT, TIMER_LEVEL, TOOL_CLASS, TRAPDOOR, TRUE, TT_INFLOOR, TT_LAVA, UNCHANGING, UNICORN_HORN, WAND_BACKFIRE_CHANCE, WAND_CLASS, WAN_CANCELLATION, WAN_DEATH, WAN_DIGGING, WAN_LIGHT, WAN_LIGHTNING, WAN_MAGIC_MISSILE, WAN_OPENING, WAN_POLYMORPH, WAN_PROBING, WAN_STRIKING, WAN_WISHING, WARN_OF_MON, WATER, WEAPON_CLASS, WEB, WOOD, W_ARM, W_ARMC, W_ARMG, W_ARMH, W_ARMS, W_ARMU, W_ART, W_ARTI, W_NONDIGGABLE, W_QUIVER, W_RING, W_SADDLE, W_SWAPWEP, W_WEP, XKILL_GIVEMSG, XKILL_NOCORPSE, XKILL_NOMSG, ZAPPED_WAND, ZT_ACID, ZT_COLD, ZT_DEATH, ZT_FIRE, ZT_LIGHTNING } from './consts.ts';

let obj_zapped: number;
let poly_zapped: number;
let are_blinded_by_the_flash: any;
let charged_objs: any;
let zap_syms: any;
let cancel_monst$writing_vanishes: any;
let cancel_monst$your: any;
let wishcmdassist$wishinfo: any;
let wishcmdassist$preserve_wishless: any;
let wishcmdassist$retry_info: any;
let wishcmdassist$retry_too: any;
let wishcmdassist$suppress_cmdassist: any;
let wishcmdassist$cardinals: any;
let wishcmdassist$too_many: any;

export async function learnwand(obj: struct_obj | null): Promise<void> {
  if (obj.oclass !== SPBOOK_CLASS) {
    if (G.objects[obj.otyp].oc_name_known) {
      obj.dknown = 1;
    } else {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        obj.dknown = 1;
      }
      if (obj.dknown) {
        await discover_object(obj.otyp, 1, 1);
      }
    }
    update_inventory();
  }
}

export async function bhitm(mtmp: struct_monst | null, otmp: struct_obj | null): Promise<number> {
  let wake = TRUE;
  let reveal_invis = FALSE;
  const learn_it = new Int8Array(1);
  learn_it[0] = FALSE;
  let dbldam = (G.urole.malenum === 333 && G.u.uhave.questart | 0 ? 1 : 0) << 24 >> 24;
  let skilled_spell = 0;
  let helpful_gesture = FALSE;
  let dmg = 0;
  let otyp = otmp.otyp;
  let zap_type_text = S("spell");
  let obj = null;
  let disguised_mimic = (mtmp.data.mlet === S_MIMIC && (mtmp.m_ap_type & 7) !== M_AP_NOTHING ? 1 : 0) << 24 >> 24;
  if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
    reveal_invis = FALSE;
  }
  G.notonhead = (mtmp.mx !== G.bhitpos.x || mtmp.my !== G.bhitpos.y ? 1 : 0) << 24 >> 24;
  skilled_spell = (otmp && otmp.oclass === SPBOOK_CLASS && otmp.blessed | 0 ? 1 : 0) << 24 >> 24;
  switch (otyp) {
  case 390:
    zap_type_text = S("wand");
  case 351:
    reveal_invis = TRUE;
    if (disguised_mimic) {
      await seemimic(mtmp);
    }
    if (resists_magm(mtmp)) {
      await shieldeff(mtmp.mx, mtmp.my);
      await pline(S("Boing!"));
      break;
    } else if (G.u.uswallow | 0 || rnd(20) < 10 + find_mac(mtmp)) {
      dmg = d(2, 12);
      if (dbldam) {
        dmg = dmg * 2;
      }
      if (otyp === SPE_FORCE_BOLT) {
        dmg = spell_damage_bonus(dmg);
      }
      await hit(zap_type_text, mtmp, exclam(dmg));
      await resist(mtmp, otmp.oclass, dmg, TELL);
    } else {
      await miss(zap_type_text, mtmp);
    }
    learn_it[0] = TRUE;
    break;
  case 392:
  case 355:
    if (!await resist(mtmp, otmp.oclass, 0, NOTELL)) {
      if (disguised_mimic) {
        await seemimic(mtmp);
      }
      await mon_adjust_speed(mtmp, -1, otmp);
      await m_dowear(mtmp, FALSE);
      if (G.u.uswallow | 0 && mtmp === G.u.ustuck && (mtmp.data.mlet === S_VORTEX || mtmp.data === $sat(G.mons, 151))) {
        await You(S("disrupt %s!"), await mon_nam(mtmp));
        await pline(S("A huge hole opens up..."));
        await expels(mtmp, mtmp.data, TRUE);
      }
    }
    break;
  case 393:
    if (!await resist(mtmp, otmp.oclass, 0, NOTELL)) {
      if (disguised_mimic) {
        await seemimic(mtmp);
      }
      await mon_adjust_speed(mtmp, 1, otmp);
      await m_dowear(mtmp, FALSE);
    }
    if (mtmp.mtame) {
      helpful_gesture = TRUE;
    }
    break;
  case 394:
  case 373:
    wake = FALSE;
    if (await unturn_dead(mtmp)) {
      wake = TRUE;
    }
    if ((mtmp.data.mflags2 & 2) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) {
      reveal_invis = TRUE;
      wake = TRUE;
      dmg = rnd(8);
      if (dbldam) {
        dmg = dmg * 2;
      }
      if (otyp === SPE_TURN_UNDEAD) {
        dmg = spell_damage_bonus(dmg);
      }
      G.context.bypasses = TRUE;
      if (!await resist(mtmp, otmp.oclass, dmg, NOTELL)) {
        if (!(mtmp.mhp < 1)) {
          await monflee(mtmp, 0, FALSE, TRUE);
        }
      }
    }
    break;
  case 395:
  case 374:
  case 291:
    if (mtmp.data === $sat(G.mons, PM_LONG_WORM) && (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1)) {
      ;
    } else if (resists_magm(mtmp)) {
      await shieldeff(mtmp.mx, mtmp.my);
    } else if (!await resist(mtmp, otmp.oclass, 0, NOTELL)) {
      let polyspot = (otyp !== POT_POLYMORPH ? 1 : 0) << 24 >> 24;
      let give_msg = (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || G.u.uswallow | 0 && mtmp === G.u.ustuck) ? 1 : 0) << 24 >> 24;
      if (polyspot) {
        for (obj = mtmp.minvent; obj; obj = obj.nobj) {
          bypass_obj(obj);
        }
      }
      if (mtmp.cham === NON_PM && !rn2(25)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s shudders!"), await Monnam(mtmp));
          learn_it[0] = TRUE;
        }
        await xkilled(mtmp, XKILL_GIVEMSG | XKILL_NOCORPSE);
      } else if (await newcham(mtmp, null, polyspot, give_msg) !== 0 || mtmp.cham >= LOW_PM && await newcham(mtmp, $sat(G.mons, mtmp.cham), polyspot, give_msg) !== 0) {
        if (give_msg && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) || G.u.uswallow | 0 && mtmp === G.u.ustuck)) {
          learn_it[0] = TRUE;
        }
      }
      if (!(mtmp.mhp < 1) && mtmp.data === $sat(G.mons, PM_LONG_WORM)) {
        if (!(mtmp.mextra && mtmp.mextra.mcorpsenm !== -1)) {
          await newmcorpsenm(mtmp);
        }
        mtmp.mextra.mcorpsenm = PM_LONG_WORM;
        G.context.bypasses = TRUE;
      }
    }
    break;
  case 396:
  case 377:
    if (disguised_mimic) {
      await seemimic(mtmp);
    }
    await cancel_monst(mtmp, otmp, TRUE, TRUE, FALSE);
    break;
  case 397:
  case 375:
    if (disguised_mimic) {
      await seemimic(mtmp);
    }
    reveal_invis = (!await u_teleport_mon(mtmp, TRUE) ? 1 : 0) << 24 >> 24;
    break;
  case 391:
    {
      let oldinvis = mtmp.minvis | 0;
      let nambuf = new Int8Array(256);
      if (disguised_mimic) {
        await seemimic(mtmp);
      }
      strcpy(P(nambuf), await Monnam(mtmp));
      await mon_set_minvis(mtmp);
      if (!oldinvis && (mtmp.minvis | 0 && ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic)) || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && G.u.uprops[TELEPAT].intrinsic & ~(67108864 | 33554432 | 16777216) && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8))) {
        await pline(S("%s turns transparent!"), P(nambuf));
        reveal_invis = TRUE;
        learn_it[0] = TRUE;
      }
      break;
    }
  case 399:
  case 356:
    wake = await closeholdingtrap(mtmp, P(learn_it, 0));
    break;
  case 400:
    wake = FALSE;
    reveal_invis = TRUE;
    await probe_monster(mtmp);
    learn_it[0] = TRUE;
    break;
  case 398:
  case 350:
    wake = FALSE;
    if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
      if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await You_feel(S("a sudden rush of air!"));
        } else {
          await pline(S("%s opens its mouth!"), await Monnam(mtmp));
        }
      }
      await expels(mtmp, mtmp.data, TRUE);
    } else if (await openholdingtrap(mtmp, P(learn_it, 0))) {
      break;
    } else if (await openfallingtrap(mtmp, TRUE, P(learn_it, 0))) {
      break;
    } else if (!!(obj = await which_armor(mtmp, W_SADDLE))) {
      let buf = new Int8Array(256);
      sprintf(P(buf), S("%s %s"), s_suffix(await Monnam(mtmp)), await distant_name(obj, xname));
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
          strcpy(P(buf), await An(await distant_name(obj, xname)));
        }
        await pline(S("%s falls to the %s."), P(buf), surface(mtmp.mx, mtmp.my));
      } else if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(S("%s falls off."), P(buf));
      }
      await obj_extract_self(obj);
      await mdrop_obj(mtmp, obj, FALSE);
    }
    break;
  case 349:
  case 366:
    reveal_invis = TRUE;
    if (mtmp.data !== $sat(G.mons, PM_PESTILENCE)) {
      wake = FALSE;
      mtmp.mhp += d(6, otyp === SPE_EXTRA_HEALING ? 8 : 4);
      if (mtmp.mhp > mtmp.mhpmax) {
        mtmp.mhp = mtmp.mhpmax;
      }
      if (skilled_spell || otyp === SPE_EXTRA_HEALING) {
        await mcureblindness(mtmp, (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0);
      }
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        if (disguised_mimic) {
          if ((mtmp.m_ap_type & 7) === M_AP_OBJECT && mtmp.mappearance === 0) {
            await set_mimic_sym(mtmp);
            await newsym(mtmp.mx, mtmp.my);
          } else {
            await mimic_hit_msg(mtmp, otyp);
          }
        } else {
          await pline(S("%s looks%s better."), await Monnam(mtmp), otyp === SPE_EXTRA_HEALING ? S(" much") : S(""));
        }
      }
      if (mtmp.mtame || mtmp.mpeaceful | 0) {
        adjalign(G.urole.malenum === 332 ? 1 : sgn(G.u.ualign.type));
      }
    } else {
      await resist(mtmp, otmp.oclass, d(3, otyp === SPE_EXTRA_HEALING ? 8 : 4), TELL);
    }
    break;
  case 384:
    if (await flash_hits_mon(mtmp, otmp)) {
      learn_it[0] = TRUE;
      reveal_invis = TRUE;
    }
    break;
  case 405:
    reveal_invis = TRUE;
    if (await sleep_monst(mtmp, d(1 + otmp.spe, 12), WAND_CLASS)) {
      await slept_monst(mtmp);
    }
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      learn_it[0] = TRUE;
    }
    break;
  case 380:
    if (await monsndx(mtmp.data) === PM_STONE_GOLEM) {
      let name = await Monnam(mtmp);
      if (await newcham(mtmp, $sat(G.mons, PM_FLESH_GOLEM), FALSE, FALSE)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s turns to flesh!"), name);
        }
      } else {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s looks rather fleshy for a moment."), name);
        }
      }
    } else {
      wake = FALSE;
    }
    break;
  case 354:
    if (disguised_mimic) {
      await seemimic(mtmp);
    }
    dmg = await monhp_per_lvl(mtmp);
    if (dbldam) {
      dmg = dmg * 2;
    }
    if (otyp === SPE_DRAIN_LIFE) {
      dmg = spell_damage_bonus(dmg);
    }
    if (resists_drli(mtmp)) {
      await shieldeff(mtmp.mx, mtmp.my);
    } else if (!await resist(mtmp, otmp.oclass, dmg, NOTELL) && !(mtmp.mhp < 1)) {
      mtmp.mhp -= dmg;
      mtmp.mhpmax -= dmg;
      if (mtmp.mhp < 1 || mtmp.mhpmax <= 0 || mtmp.m_lev < 1) {
        await killed(mtmp);
      } else {
        mtmp.m_lev = mtmp.m_lev - 1 & 0xff;
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s suddenly seems weaker!"), await Monnam(mtmp));
        }
      }
    }
    break;
  case 389:
    wake = FALSE;
    break;
  default:
    await impossible(S("What an interesting effect (%d)"), otyp);
    break;
  }
  if (wake) {
    if (!(mtmp.mhp < 1)) {
      await wakeup(mtmp, helpful_gesture ? FALSE : TRUE);
      await m_respond(mtmp);
      if (mtmp.isshk | 0 && !$rd(P(G.u.ushops))) {
        hot_pursuit(mtmp);
      }
    } else if (mtmp.m_ap_type & 7) {
      await seemimic(mtmp);
    }
  }
  if (reveal_invis) {
    if (!(mtmp.mhp < 1) && $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(G.bhitpos.x, G.bhitpos.y);
    }
  }
  if (learn_it[0]) {
    await learnwand(otmp);
  }
  return 0;
}

export async function probe_monster(mtmp: struct_monst | null): Promise<void> {
  let otmp = null;
  await mstatusline(mtmp);
  if (G.notonhead) {
    return;
  }
  if (mtmp.minvent) {
    for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
      otmp.dknown = 1;
      if (otmp.otyp >= 189 && otmp.otyp <= 195 || otmp.otyp === STATUE) {
        otmp.lknown = 1;
        if (!(otmp.otyp === 189 && otmp.spe === 1)) {
          otmp.cknown = 1;
        }
      }
    }
    await display_minventory(mtmp, MINV_ALL | MINV_NOLET | PICK_NONE, null);
  } else {
    await pline(S("%s is not carrying anything%s."), await noit_Monnam(mtmp), G.u.uswallow | 0 && mtmp === G.u.ustuck ? S(" besides you") : S(""));
  }
}

export function get_obj_location(obj: struct_obj | null, xp: Ptr | null, yp: Ptr | null, locflags: number): number {
  switch (obj.where) {
  case 3:
    xp.a[xp.o] = G.u.ux;
    yp.a[yp.o] = G.u.uy;
    return TRUE;
  case 1:
    xp.a[xp.o] = obj.ox;
    yp.a[yp.o] = obj.oy;
    return TRUE;
  case 4:
    if (obj.v.v_ocarry.mx) {
      xp.a[xp.o] = obj.v.v_ocarry.mx;
      yp.a[yp.o] = obj.v.v_ocarry.my;
      return TRUE;
    }
    break;
  case 6:
    if (locflags & BURIED_TOO) {
      xp.a[xp.o] = obj.ox;
      yp.a[yp.o] = obj.oy;
      return TRUE;
    }
    break;
  case 2:
    if (locflags & CONTAINED_TOO) {
      return get_obj_location(obj.v.v_ocontainer, xp, yp, locflags);
    }
    break;
  }
  xp.a[xp.o] = yp.a[yp.o] = 0;
  return FALSE;
}

export function get_mon_location(mon: struct_monst | null, xp: Ptr | null, yp: Ptr | null, locflags: number): number {
  if (mon === G.youmonst) {
    xp.a[xp.o] = G.u.ux;
    yp.a[yp.o] = G.u.uy;
    return TRUE;
  } else if (mon.mx > 0 && (!mon.mburied || locflags)) {
    xp.a[xp.o] = mon.mx;
    yp.a[yp.o] = mon.my;
    return TRUE;
  } else {
    xp.a[xp.o] = yp.a[yp.o] = 0;
    return FALSE;
  }
}

export async function montraits(obj: struct_obj | null, cc: struct_nhcoord | null, adjacentok: number): Promise<struct_monst | null> {
  let mtmp = null;
  let mtmp2 = obj.oextra && obj.oextra.omonst ? await get_mtraits(obj, TRUE) : null;
  if (mtmp2) {
    mtmp2.data = $sat(G.mons, mtmp2.mnum);
    if (mtmp2.mhpmax <= 0 && !(mtmp2.data === $sat(G.mons, 308) || mtmp2.data === $sat(G.mons, 310) || mtmp2.data === $sat(G.mons, 309))) {
      return null;
    }
    mtmp = await makemon(mtmp2.data, cc.x, cc.y, NO_MINVENT | MM_NOWAIT | MM_NOCOUNTBIRTH | (adjacentok ? MM_ADJACENTOK : 0));
    if (!mtmp) {
      await dealloc_monst(mtmp2);
      return null;
    }
    if (mtmp.mhpmax > mtmp2.mhpmax && (mtmp2.data === $sat(G.mons, 308) || mtmp2.data === $sat(G.mons, 310) || mtmp2.data === $sat(G.mons, 309))) {
      mtmp2.mhpmax = mtmp.mhpmax;
    }
    mtmp2.mhp = mtmp2.mhpmax;
    mtmp2.minvent = mtmp.minvent;
    if (mtmp.m_id) {
      mtmp2.m_id = mtmp.m_id;
      if (G.quest_status.leader_is_dead | 0 && mtmp2.m_id === G.quest_status.leader_m_id) {
        G.quest_status.leader_is_dead = (FALSE) & 1;
      }
    }
    mtmp2.mx = mtmp.mx;
    mtmp2.my = mtmp.my;
    mtmp2.mux = mtmp.mux;
    mtmp2.muy = mtmp.muy;
    mtmp2.mw = mtmp.mw;
    mtmp2.wormno = (mtmp.wormno) & 31;
    mtmp2.misc_worn_check = mtmp.misc_worn_check;
    mtmp2.weapon_check = mtmp.weapon_check;
    mtmp2.mtrapseen = mtmp.mtrapseen;
    mtmp2.mflee = (mtmp.mflee) & 1;
    mtmp2.mburied = (mtmp.mburied) & 1;
    mtmp2.mundetected = (mtmp.mundetected) & 1;
    mtmp2.mfleetim = (mtmp.mfleetim) & 127;
    mtmp2.mlstmv = mtmp.mlstmv;
    mtmp2.m_ap_type = mtmp.m_ap_type;
    mtmp2.mrevived = 1;
    mtmp2.mavenge = 0;
    mtmp2.meating = 0;
    mtmp2.mleashed = 0;
    mtmp2.mtrapped = 0;
    mtmp2.msleeping = 0;
    mtmp2.mfrozen = 0;
    mtmp2.mcanmove = 1;
    if (!dmgtype(mtmp2.data, AD_SEDU) && (!G.sysopt.seduce || !dmgtype(mtmp2.data, AD_SSEX))) {
      mtmp2.mcan = 0;
    }
    mtmp2.mcansee = 1;
    mtmp2.mblinded = 0;
    mtmp2.mstun = 0;
    mtmp2.mconf = 0;
    if (mtmp2.isshk) {
      await neweshk(mtmp);
      mtmp.mextra.eshk.$cp(mtmp2.mextra.eshk);
      if (!!mtmp2.mextra.eshk.bill_p && mtmp2.mextra.eshk.bill_p !== -1000) {
        mtmp.mextra.eshk.bill_p = mtmp.mextra.eshk.bill[0];
      }
      mtmp.isshk = 1;
    }
    await replmon(mtmp, mtmp2);
    await newsym(mtmp2.mx, mtmp2.my);
    await restore_cham(mtmp2);
  }
  return mtmp2;
}

export function get_container_location(obj: struct_obj | null, loc: Ptr | null, container_nesting: Ptr | null): struct_monst | null {
  if (!obj || !loc) {
    return null;
  }
  if (container_nesting) {
    container_nesting.a[container_nesting.o] = 0;
  }
  while (obj && obj.where === OBJ_CONTAINED) {
    if (container_nesting) {
      container_nesting.a[container_nesting.o] += 1;
    }
    obj = obj.v.v_ocontainer;
  }
  if (obj) {
    loc.a[loc.o] = obj.where;
    if (obj.where === OBJ_MINVENT) {
      return obj.v.v_ocarry;
    }
  }
  return null;
}

export async function revive(corpse: struct_obj | null, by_hero: number): Promise<struct_monst | null> {
  let mtmp = null;
  let mptr = null;
  let container = null;
  let xy = new struct_nhcoord();
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let one_of = 0;
  const montype = new Int32Array(1);
  const container_nesting = new Int32Array(1);
  container_nesting[0] = 0;
  if (corpse.otyp !== CORPSE) {
    await impossible(S("Attempting to revive %s?"), await xname(corpse));
    return null;
  }
  x[0] = y[0] = 0;
  if (corpse.where !== OBJ_CONTAINED) {
    container = null;
    get_obj_location(corpse, P(x, 0), P(y, 0), 0);
  } else {
    let carrier = null;
    const holder = new Int32Array(1);
    holder[0] = OBJ_FREE;
    container = corpse.v.v_ocontainer;
    carrier = get_container_location(container, P(holder, 0), P(container_nesting, 0));
    switch (holder[0]) {
    case 4:
      x[0] = carrier.mx, y[0] = carrier.my;
      break;
    case 3:
      x[0] = G.u.ux, y[0] = G.u.uy;
      break;
    case 1:
      get_obj_location(corpse, P(x, 0), P(y, 0), CONTAINED_TOO);
      break;
    default:
      break;
    }
  }
  if (!x[0] || !y[0] || container && (container.olocked | 0 || container_nesting[0] > 2 || container.otyp === STATUE || container.otyp === BAG_OF_HOLDING && rn2(40))) {
    return null;
  }
  corpse.ox = x[0], corpse.oy = y[0];
  montype[0] = corpse.corpsenm;
  mptr = $sat(G.mons, montype[0]);
  if (!!G.level.monsters[x[0]][y[0]]) {
    if (await enexto(xy, x[0], y[0], mptr)) {
      x[0] = xy.x, y[0] = xy.y;
    }
  }
  if (G.mons[montype[0]].mlet === S_EEL && !($at2(G.level.locations, x[0], y[0]).typ >= POOL && $at2(G.level.locations, x[0], y[0]).typ <= DRAWBRIDGE_UP) || G.mons[montype[0]].mlet === S_TROLL && G.uwep && G.uwep.oartifact === ART_TROLLSBANE) {
    if (by_hero && $rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2) {
      await pline(S("%s twitches feebly."), upstart(await corpse_xname(corpse, null, CXN_PFX_THE)));
    }
    return null;
  }
  if (cant_revive(P(montype, 0), TRUE, corpse)) {
    mtmp = await makemon($sat(G.mons, montype[0]), x[0], y[0], NO_MINVENT | MM_NOWAIT);
    if (mtmp) {
      if (corpse.oextra && corpse.oextra.omid) {
        free_omid(corpse);
      }
      if (corpse.oextra && corpse.oextra.omonst) {
        free_omonst(corpse);
      }
      if (mtmp.cham === PM_DOPPELGANGER) {
        await newcham(mtmp, mptr, FALSE, FALSE);
      } else if (mtmp.data.mlet === S_ZOMBIE) {
        mtmp.mhp = mtmp.mhpmax = 100;
        await mon_adjust_speed(mtmp, 2, null);
      }
    }
  } else if (corpse.oextra && corpse.oextra.omonst) {
    xy.x = x[0], xy.y = y[0];
    mtmp = await montraits(corpse, xy, FALSE);
    if (mtmp && mtmp.mtame && !mtmp.isminion) {
      await wary_dog(mtmp, TRUE);
    }
  } else {
    mtmp = await makemon(mptr, x[0], y[0], NO_MINVENT | MM_NOWAIT | MM_NOCOUNTBIRTH);
  }
  if (!mtmp) {
    return null;
  }
  if (mtmp.mundetected) {
    mtmp.mundetected = 0;
    await newsym(mtmp.mx, mtmp.my);
  }
  if (mtmp.m_ap_type & 7) {
    await seemimic(mtmp);
  }
  one_of = (corpse.quan > 1 ? 1 : 0) << 24 >> 24;
  if (one_of) {
    corpse = await splitobj(corpse, 1);
  }
  if (by_hero) {
    let shkp = null;
    x[0] = corpse.ox, y[0] = corpse.oy;
    if (await costly_spot(x[0], y[0]) && (corpse.where === 3 ? corpse.unpaid | 0 : !corpse.no_charge ? 1 : 0)) {
      shkp = await shop_keeper($rd(in_rooms(x[0], y[0], SHOPBASE)));
    }
    if ($rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2) {
      let buf = new Int8Array(256);
      strcpy(P(buf), one_of ? S("one of ") : S(""));
      await shk_your(eos(P(buf)), corpse);
      if (one_of) {
        ++corpse.quan;
      }
      strcat(P(buf), await corpse_xname(corpse, null, CXN_NO_PFX));
      if (one_of) {
        --corpse.quan;
      }
      await pline(S("%s glows iridescently."), upstart(P(buf)));
    } else if (shkp) {
      await pline(S("A corpse is resuscitated."));
    }
    if (shkp && mtmp !== shkp) {
      await stolen_value(corpse, x[0], y[0], shkp.mpeaceful << 24 >> 24, FALSE);
    }
  }
  if (corpse.oextra && corpse.oextra.omid) {
    const m_id = new Uint32Array(1);
    let ghost = null;
    let otmp = null;
    memcpy(P(m_id, 0), corpse.oextra.omid, 4);
    ghost = find_mid(m_id[0], FM_FMON);
    if (ghost && ghost.data === $sat(G.mons, PM_GHOST)) {
      if ((ghost.wormno | 0 ? worm_known(ghost) : $rd(G.viz_array.a[G.viz_array.o + ghost.my], ghost.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && ghost && ghost.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + ghost.my], ghost.mx) & 1 ? 1 : 0) && ((!ghost.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !ghost.mundetected)) {
        await pline(S("%s is suddenly drawn into its former body!"), await Monnam(ghost));
      }
      while (!!(otmp = ghost.minvent)) {
        await obj_extract_self(otmp);
        await add_to_minv(mtmp, otmp);
      }
      if (ghost.mtame && !mtmp.mtame) {
        if (await tamedog(mtmp, null)) {
          mtmp.mtame = ghost.mtame;
        }
      }
      mtmp.mconf = 1;
      await mongone(ghost);
    }
    free_omid(corpse);
  }
  if (corpse.oextra && corpse.oextra.oname && !((mtmp.data.geno & 4096) !== 0)) {
    mtmp = await christen_monst(mtmp, corpse.oextra.oname);
  }
  if (corpse.oeaten) {
    mtmp.mhp = await eaten_stat(mtmp.mhp, corpse);
  }
  mtmp.mrevived = 1;
  switch (corpse.where) {
  case 3:
    await useup(corpse);
    break;
  case 1:
    x[0] = corpse.ox, y[0] = corpse.oy;
    if (corpse.quan > 1) {
      corpse = await splitobj(corpse, 1);
    }
    await delobj(corpse);
    await newsym(x[0], y[0]);
    break;
  case 4:
    await m_useup(corpse.v.v_ocarry, corpse);
    break;
  case 2:
    await obj_extract_self(corpse);
    await obfree(corpse, null);
    break;
  default:
    await panic(S("revive"));
  }
  return mtmp;
}

async function revive_egg(obj: struct_obj | null): Promise<void> {
  if (obj.otyp !== EGG) {
    return;
  }
  if (obj.corpsenm !== NON_PM && !dead_species(obj.corpsenm, TRUE)) {
    await attach_egg_hatch_timeout(obj, 0);
  }
}

export async function unturn_dead(mon: struct_monst | null): Promise<number> {
  let otmp = null;
  let otmp2 = null;
  let mtmp2 = null;
  let owner = new Int8Array(256);
  let corpse = new Int8Array(256);
  let youseeit = 0;
  let res = 0;
  youseeit = (mon === G.youmonst ? TRUE : (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0) << 24 >> 24;
  otmp2 = mon === G.youmonst ? G.invent : mon.minvent;
  owner[0] = corpse[0] = 0;
  while (!!(otmp = otmp2)) {
    otmp2 = otmp.nobj;
    if (otmp.otyp === EGG) {
      await revive_egg(otmp);
    }
    if (otmp.otyp !== CORPSE) {
      continue;
    }
    if (youseeit) {
      strcpy(P(corpse), await corpse_xname(otmp, null, CXN_SINGULAR));
      await Shk_Your(P(owner), otmp);
    }
    if (!!(mtmp2 = await revive(otmp, !G.context.mon_moving ? 1 : 0))) {
      ++res;
      if (youseeit) {
        await pline(S("%s%s suddenly comes alive!"), P(owner), P(corpse));
      } else if ((mtmp2.wormno | 0 ? worm_known(mtmp2) : $rd(G.viz_array.a[G.viz_array.o + mtmp2.my], mtmp2.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp2 && mtmp2.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp2.my], mtmp2.mx) & 1 ? 1 : 0) && ((!mtmp2.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp2.mundetected)) {
        await pline(S("%s suddenly appears!"), await Amonnam(mtmp2));
      }
    }
  }
  return res;
}

export async function cancel_item(obj: struct_obj | null): Promise<void> {
  let u_ring = (obj === G.uleft || obj === G.uright ? 1 : 0) << 24 >> 24;
  let otyp = obj.otyp;
  switch (otyp) {
  case 151:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.abon.a[A_STR] -= obj.spe;
      G.context.botl = 1;
    }
    break;
  case 152:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.abon.a[A_CON] -= obj.spe;
      G.context.botl = 1;
    }
    break;
  case 150:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.abon.a[A_CHA] -= obj.spe;
      G.context.botl = 1;
    }
    break;
  case 153:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.uhitinc = G.u.uhitinc - obj.spe << 24 >> 24;
    }
    break;
  case 154:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.udaminc = G.u.udaminc - obj.spe << 24 >> 24;
    }
    break;
  case 139:
    if (obj.owornmask & W_ARMG && obj === G.uarmg) {
      G.u.abon.a[A_DEX] -= obj.spe;
      G.context.botl = 1;
    }
    break;
  case 79:
    if (obj.owornmask & W_ARMH && obj === G.uarmh) {
      G.u.abon.a[A_INT] -= obj.spe;
      G.u.abon.a[A_WIS] -= obj.spe;
      G.context.botl = 1;
    }
    break;
  }
  if (G.objects[otyp].oc_magic | 0 || obj.spe && (obj.oclass === ARMOR_CLASS || obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE) || otyp === POT_ACID || otyp === POT_SICKNESS || otyp === POT_WATER && (obj.blessed | 0 || obj.cursed | 0)) {
    if (obj.spe !== (obj.oclass === WAND_CLASS ? -1 : 0) && otyp !== WAN_CANCELLATION && otyp !== MAGIC_LAMP && otyp !== CANDELABRUM_OF_INVOCATION) {
      await costly_alteration(obj, COST_CANCEL);
      obj.spe = (obj.oclass === WAND_CLASS ? -1 : 0) << 24 >> 24;
    }
    switch (obj.oclass) {
    case SCROLL_CLASS:
      await costly_alteration(obj, COST_CANCEL);
      obj.otyp = SCR_BLANK_PAPER;
      obj.spe = 0;
      break;
    case SPBOOK_CLASS:
      if (otyp !== SPE_CANCELLATION && otyp !== SPE_NOVEL && otyp !== SPE_BOOK_OF_THE_DEAD) {
        await costly_alteration(obj, COST_CANCEL);
        obj.otyp = SPE_BLANK_PAPER;
      }
      break;
    case POTION_CLASS:
      await costly_alteration(obj, otyp !== POT_WATER ? COST_CANCEL : obj.cursed | 0 ? COST_UNCURS : COST_UNBLSS);
      if (otyp === POT_SICKNESS || otyp === POT_SEE_INVISIBLE) {
        obj.otyp = POT_FRUIT_JUICE;
      } else {
        obj.otyp = POT_WATER;
        obj.oeroded = 0;
      }
      break;
    }
  }
  await unbless(obj);
  await uncurse(obj);
  return;
}

export async function drain_item(obj: struct_obj | null, by_you: number): Promise<number> {
  let u_ring = 0;
  if (!obj || !G.objects[obj.otyp].oc_charged && obj.oclass !== WEAPON_CLASS && obj.oclass !== ARMOR_CLASS && !(obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE) || obj.spe <= 0) {
    return FALSE;
  }
  if (defends(AD_DRLI, obj) || defends_when_carried(AD_DRLI, obj) || obj_resists(obj, 10, 90)) {
    return FALSE;
  }
  if (by_you) {
    await costly_alteration(obj, COST_DRAIN);
  }
  obj.spe = obj.spe - 1 << 24 >> 24;
  u_ring = (obj === G.uleft || obj === G.uright ? 1 : 0) << 24 >> 24;
  switch (obj.otyp) {
  case 151:
    if (obj.owornmask & W_RING && u_ring) {
      --G.u.abon.a[A_STR];
      G.context.botl = 1;
    }
    break;
  case 152:
    if (obj.owornmask & W_RING && u_ring) {
      --G.u.abon.a[A_CON];
      G.context.botl = 1;
    }
    break;
  case 150:
    if (obj.owornmask & W_RING && u_ring) {
      --G.u.abon.a[A_CHA];
      G.context.botl = 1;
    }
    break;
  case 153:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.uhitinc = G.u.uhitinc - 1 << 24 >> 24;
    }
    break;
  case 154:
    if (obj.owornmask & W_RING && u_ring) {
      G.u.udaminc = G.u.udaminc - 1 << 24 >> 24;
    }
    break;
  case 155:
    if (u_ring) {
      G.context.botl = 1;
    }
    break;
  case 79:
    if (obj.owornmask & W_ARMH && obj === G.uarmh) {
      --G.u.abon.a[A_INT];
      --G.u.abon.a[A_WIS];
      G.context.botl = 1;
    }
    break;
  case 139:
    if (obj.owornmask & W_ARMG && obj === G.uarmg) {
      --G.u.abon.a[A_DEX];
      G.context.botl = 1;
    }
    break;
  default:
    break;
  }
  if (G.context.botl) {
    await bot();
  }
  if (obj.where === 3) {
    update_inventory();
  }
  return TRUE;
}

export function obj_resists(obj: struct_obj | null, ochance: number, achance: number): number {
  if (obj.otyp === AMULET_OF_YENDOR || obj.otyp === SPE_BOOK_OF_THE_DEAD || obj.otyp === CANDELABRUM_OF_INVOCATION || obj.otyp === BELL_OF_OPENING || obj.otyp === CORPSE && ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 309))) {
    return TRUE;
  } else {
    let chance = rn2(100);
    return (chance < (obj.oartifact ? achance : ochance) ? 1 : 0) << 24 >> 24;
  }
}

export function obj_shudders(obj: struct_obj | null): number {
  let zap_odds = 0;
  if (G.context.bypasses && obj.bypass | 0) {
    return FALSE;
  }
  if (obj.oclass === WAND_CLASS) {
    zap_odds = 3;
  } else if (obj.cursed) {
    zap_odds = 3;
  } else if (obj.blessed) {
    zap_odds = 12;
  } else {
    zap_odds = 8;
  }
  if (obj.quan > 4) {
    zap_odds = zap_odds / 2 | 0;
  }
  return (!rn2(zap_odds) ? 1 : 0) << 24 >> 24;
}

async function polyuse(objhdr: struct_obj | null, mat: number, minwt: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  for (otmp = objhdr; minwt > 0 && otmp; otmp = otmp2) {
    otmp2 = otmp.v.v_nexthere;
    if (G.context.bypasses && otmp.bypass | 0) {
      continue;
    }
    if (otmp === G.uball || otmp === G.uchain) {
      continue;
    }
    if (obj_resists(otmp, 0, 0)) {
      continue;
    }
    if (otmp.otyp === SCR_MAIL) {
      continue;
    }
    if (((G.objects[otmp.otyp].oc_material | 0) === mat ? 1 : 0) === (rn2(minwt + 1) !== 0 ? 1 : 0)) {
      if (await costly_spot(otmp.ox, otmp.oy)) {
        if ($rd(P(G.u.ushops))) {
          await addtobill(otmp, FALSE, FALSE, FALSE);
        } else {
          await stolen_value(otmp, otmp.ox, otmp.oy, FALSE, FALSE);
        }
      }
      if (otmp.quan < LARGEST_INT) {
        minwt -= otmp.quan | 0;
      } else {
        minwt = 0;
      }
      await delobj(otmp);
    }
  }
}

async function create_polymon(obj: struct_obj | null, okind: number): Promise<void> {
  let mdat = null;
  let mtmp = null;
  let material = null;
  let pm_index = 0;
  if (G.context.bypasses) {
    while (obj && obj.bypass | 0) {
      obj = obj.v.v_nexthere;
    }
  }
  if (!obj || !obj.v.v_nexthere && obj.quan === 1) {
    return;
  }
  switch (okind) {
  case IRON:
  case METAL:
  case MITHRIL:
    pm_index = PM_IRON_GOLEM;
    material = S("metal ");
    break;
  case COPPER:
  case SILVER:
  case PLATINUM:
  case GEMSTONE:
  case MINERAL:
    pm_index = rn2(2) ? PM_STONE_GOLEM : PM_CLAY_GOLEM;
    material = S("lithic ");
    break;
  case 0:
  case FLESH:
    pm_index = PM_FLESH_GOLEM;
    material = S("organic ");
    break;
  case WOOD:
    pm_index = PM_WOOD_GOLEM;
    material = S("wood ");
    break;
  case LEATHER:
    pm_index = PM_LEATHER_GOLEM;
    material = S("leather ");
    break;
  case CLOTH:
    pm_index = PM_ROPE_GOLEM;
    material = S("cloth ");
    break;
  case BONE:
    pm_index = PM_SKELETON;
    material = S("bony ");
    break;
  case GOLD:
    pm_index = PM_GOLD_GOLEM;
    material = S("gold ");
    break;
  case GLASS:
    pm_index = PM_GLASS_GOLEM;
    material = S("glassy ");
    break;
  case PAPER:
    pm_index = PM_PAPER_GOLEM;
    material = S("paper ");
    break;
  default:
    pm_index = PM_STRAW_GOLEM;
    material = S("");
    break;
  }
  if (!(G.mvitals[pm_index].mvflags & G_GENOD)) {
    mdat = $sat(G.mons, pm_index);
  }
  mtmp = await makemon(mdat, obj.ox, obj.oy, NO_MM_FLAGS);
  await polyuse(obj, okind, G.mons[pm_index].cwt);
  if (mtmp && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
    await pline(S("Some %sobjects meld, and %s arises from the pile!"), material, await a_monnam(mtmp));
  }
}

export async function do_osshock(obj: struct_obj | null): Promise<void> {
  let i = 0;
  if (obj.otyp === SCR_MAIL) {
    return;
  }
  obj_zapped = TRUE;
  if (poly_zapped < 0) {
    for (i = obj.quan; i; --i) {
      if (!rn2(G.u.uluck + G.u.moreluck + 45)) {
        poly_zapped = G.objects[obj.otyp].oc_material | 0;
        break;
      }
    }
  }
  if (obj.quan > 1) {
    if (obj.quan > LARGEST_INT) {
      obj = await splitobj(obj, rnd(30000));
    } else {
      obj = await splitobj(obj, rnd((obj.quan | 0) - 1));
    }
  }
  if (await costly_spot(obj.ox, obj.oy)) {
    if ($rd(P(G.u.ushops))) {
      await addtobill(obj, FALSE, FALSE, FALSE);
    } else {
      await stolen_value(obj, obj.ox, obj.oy, FALSE, FALSE);
    }
  }
  await delobj(obj);
}

export async function poly_obj(obj: struct_obj | null, id: number): Promise<struct_obj | null> {
  let otmp = null;
  const ox = new Int8Array(1);
  ox[0] = 0;
  const oy = new Int8Array(1);
  oy[0] = 0;
  let old_wornmask = 0;
  let new_wornmask = 0;
  let can_merge = (id === STRANGE_OBJECT ? 1 : 0) << 24 >> 24;
  let obj_location = obj.where;
  if (obj.otyp === BOULDER) {
    sokoban_guilt();
  }
  if (id === STRANGE_OBJECT) {
    let try_limit = 3;
    let magic_obj = G.objects[obj.otyp].oc_magic;
    if (obj.otyp === UNICORN_HORN && obj.obroken | 0) {
      magic_obj = 0;
    }
    otmp = null;
    do {
      if (otmp) {
        await delobj(otmp);
      }
      otmp = await mkobj(obj.oclass, FALSE);
    } while (--try_limit > 0 && G.objects[otmp.otyp].oc_magic !== magic_obj);
  } else {
    otmp = await mksobj(id, FALSE, FALSE);
    if ((obj.otyp === 240 || obj.otyp === 449 || obj.otyp === 216) && (id === 240 || id === 449 || id === 216)) {
      await set_corpsenm(otmp, obj.corpsenm);
    }
  }
  otmp.quan = obj.quan;
  otmp.no_charge = (obj.no_charge) & 1;
  if (obj_location === OBJ_INVENT) {
    otmp.invlet = obj.invlet;
  }
  if (obj.otyp === SCR_MAIL) {
    otmp.otyp = SCR_MAIL;
    otmp.spe = 1;
  }
  if (obj.otyp === EGG && obj.spe) {
    let mnum = 0;
    let tryct = 100;
    if (otmp.otyp === EGG) {
      await kill_egg(otmp);
    } else {
      otmp.otyp = EGG;
      otmp.owt = await weight(otmp) >>> 0;
    }
    otmp.corpsenm = NON_PM;
    otmp.spe = 0;
    while (tryct--) {
      mnum = can_be_hatched(rn2(382));
      if (mnum !== NON_PM && !dead_species(mnum, TRUE)) {
        otmp.spe = 1;
        await set_corpsenm(otmp, mnum);
        break;
      }
    }
  }
  if (strchr(P(charged_objs), otmp.oclass)) {
    otmp.spe = obj.spe;
  }
  otmp.recharged = (obj.recharged) & 7;
  otmp.cursed = (obj.cursed) & 1;
  otmp.blessed = (obj.blessed) & 1;
  if (erosion_matters(otmp)) {
    if (is_flammable(otmp) || (G.objects[otmp.otyp].oc_material | 0) === IRON) {
      otmp.oeroded = (obj.oeroded) & 3;
    }
    if ((G.objects[otmp.otyp].oc_material | 0) === COPPER || (G.objects[otmp.otyp].oc_material | 0) === IRON || is_rottable(otmp)) {
      otmp.oeroded2 = (obj.oeroded2) & 3;
    }
    if ((G.objects[otmp.otyp].oc_material | 0) === IRON || is_flammable(otmp) || is_rottable(otmp) || ((G.objects[otmp.otyp].oc_material | 0) === COPPER || (G.objects[otmp.otyp].oc_material | 0) === IRON)) {
      otmp.oerodeproof = (obj.oerodeproof) & 1;
    }
  }
  if (obj.otrapped | 0 && (otmp.otyp === 189 || otmp.otyp === 190)) {
    otmp.otrapped = (TRUE) & 1;
  }
  if (obj.otrapped | 0 && (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[otmp.otyp].oc_subtyp <= -P_BOW)) {
    otmp.otrapped = (TRUE) & 1;
  }
  if (id === STRANGE_OBJECT && obj.otyp === CORPSE) {
    if (obj.corpsenm === PM_CROCODILE) {
      otmp.otyp = LOW_BOOTS;
      otmp.oclass = ARMOR_CLASS;
      otmp.spe = 0;
      otmp.oeroded = 0;
      otmp.oerodeproof = (TRUE) & 1;
      otmp.quan = 1;
      otmp.cursed = (FALSE) & 1;
    }
  }
  if (!!otmp.cobj) {
    await delete_contents(otmp);
  }
  if (otmp.quan > 1 && (!G.objects[otmp.otyp].oc_merge || can_merge && otmp.quan > rn2(1000))) {
    otmp.quan = 1;
  }
  switch (otmp.oclass) {
  case TOOL_CLASS:
    if (otmp.otyp === MAGIC_LAMP) {
      otmp.otyp = OIL_LAMP;
      otmp.age = 1500;
    } else if (otmp.otyp === MAGIC_MARKER) {
      otmp.recharged = 1;
    }
    break;
  case WAND_CLASS:
    while (otmp.otyp === WAN_WISHING || otmp.otyp === WAN_POLYMORPH) {
      otmp.otyp = rnd_class(WAN_LIGHT, WAN_LIGHTNING) << 16 >> 16;
    }
    if ((otmp.recharged | 0) < rn2(7)) {
      otmp.recharged = (otmp.recharged + 1 >>> 0) & 7;
    }
    break;
  case POTION_CLASS:
    while (otmp.otyp === POT_POLYMORPH) {
      otmp.otyp = rnd_class(POT_GAIN_ABILITY, POT_WATER) << 16 >> 16;
    }
    break;
  case SPBOOK_CLASS:
    while (otmp.otyp === SPE_POLYMORPH) {
      otmp.otyp = rnd_class(SPE_DIG, SPE_BLANK_PAPER) << 16 >> 16;
    }
    if (otmp.otyp !== SPE_BLANK_PAPER) {
      otmp.usecount = obj.usecount + 1;
      if (otmp.usecount > MAX_SPELL_STUDY) {
        otmp.otyp = SPE_BLANK_PAPER;
        otmp.usecount = rn2(otmp.usecount);
      }
    }
    break;
  case GEM_CLASS:
    if (otmp.quan > rnd(4) && (G.objects[obj.otyp].oc_material | 0) === MINERAL && (G.objects[otmp.otyp].oc_material | 0) !== MINERAL) {
      otmp.otyp = ROCK;
      otmp.quan = Math.trunc(otmp.quan / 2);
    }
    break;
  }
  otmp.owt = await weight(otmp) >>> 0;
  get_obj_location(obj, P(ox, 0), P(oy, 0), BURIED_TOO | CONTAINED_TOO);
  old_wornmask = obj.owornmask & ~(W_ART | W_ARTI);
  await replace_object(obj, otmp);
  if (obj_location === OBJ_INVENT) {
    await freeinv_core(obj);
    await addinv_core1(otmp);
    addinv_core2(otmp);
    if (old_wornmask) {
      let was_twohanded = ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0 ? 1 : 0) << 24 >> 24;
      let was_twoweap = G.u.twoweap;
      new_wornmask = wearslot(otmp) & old_wornmask;
      await remove_worn_item(obj, TRUE);
      if ((new_wornmask & W_WEP) !== 0) {
        if (was_twohanded || !((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_big | 0) || !G.uarms) {
          await setuwep(otmp);
        }
        if (was_twoweap && G.uwep && !((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
          G.u.twoweap = TRUE;
        }
      } else if ((new_wornmask & W_SWAPWEP) !== 0) {
        if (was_twohanded || !((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_big | 0)) {
          await setuswapwep(otmp);
        }
        if (was_twoweap && G.uswapwep) {
          G.u.twoweap = TRUE;
        }
      } else if ((new_wornmask & W_QUIVER) !== 0) {
        await setuqwep(otmp);
      } else if (new_wornmask) {
        await setworn(otmp, new_wornmask);
        await set_wear(otmp);
        otmp = wearmask_to_obj(new_wornmask);
      }
    }
  } else if (obj_location === OBJ_FLOOR) {
    if (obj.otyp === BOULDER && otmp.otyp !== BOULDER && !does_block(ox[0], oy[0], $sat(G.level.locations[ox[0]], oy[0]))) {
      unblock_point(ox[0], oy[0]);
    } else if (obj.otyp !== BOULDER && otmp.otyp === BOULDER) {
      block_point(ox[0], oy[0]);
    }
  }
  if ((otmp && !(otmp.where === 3) || obj.unpaid | 0) && await costly_spot(ox[0], oy[0])) {
    let shkp = await shop_keeper($rd(in_rooms(ox[0], oy[0], SHOPBASE)));
    if ((!obj.no_charge || !!obj.cobj && await contained_cost(obj, shkp, 0, FALSE, FALSE) !== 0) && inhishop(shkp)) {
      if (shkp.mpeaceful) {
        if ($rd(P(G.u.ushops)) && $rd(in_rooms(G.u.ux, G.u.uy, 0)) === $rd(in_rooms(shkp.mx, shkp.my, 0)) && !await costly_spot(G.u.ux, G.u.uy)) {
          await make_angry_shk(shkp, ox[0], oy[0]);
        } else {
          await pline(S("%s gets angry!"), await Monnam(shkp));
          hot_pursuit(shkp);
        }
      } else {
        await Norep(S("%s is furious!"), await Monnam(shkp));
      }
    }
  }
  await delobj(obj);
  return otmp;
}

async function stone_to_flesh_obj(obj: struct_obj | null): Promise<number> {
  let res = 1;
  let ptr = null;
  let mon = null;
  let shkp = null;
  let item = null;
  const oox = new Int8Array(1);
  const ooy = new Int8Array(1);
  let smell = FALSE;
  let golem_xform = FALSE;
  if ((G.objects[obj.otyp].oc_material | 0) !== MINERAL && (G.objects[obj.otyp].oc_material | 0) !== GEMSTONE) {
    return 0;
  }
  if (obj_resists(obj, 2, 98)) {
    return 0;
  }
  get_obj_location(obj, P(oox, 0), P(ooy, 0), 0);
  switch (G.objects[obj.otyp].oc_class) {
  case ROCK_CLASS:
  case TOOL_CLASS:
    if (obj.otyp === BOULDER) {
      obj = await poly_obj(obj, HUGE_CHUNK_OF_MEAT);
      smell = TRUE;
    } else if (obj.otyp === STATUE || obj.otyp === FIGURINE) {
      ptr = $sat(G.mons, obj.corpsenm);
      if (ptr.mlet === S_GOLEM) {
        golem_xform = (ptr !== $sat(G.mons, PM_FLESH_GOLEM) ? 1 : 0) << 24 >> 24;
      } else if (ptr.mlet === S_BLOB || ptr.mlet === S_JELLY || ptr.mlet === S_FUNGUS || ptr.mlet === S_VORTEX || ptr.mlet === S_LIGHT || ptr.mlet === S_ELEMENTAL && ptr !== $sat(G.mons, 150) || ptr.mlet === S_GOLEM && ptr !== $sat(G.mons, 251) && ptr !== $sat(G.mons, 249) || ptr.mlet === S_GHOST || ptr.mlet === S_PUDDING && ptr !== $sat(G.mons, 206)) {
        obj = await poly_obj(obj, MEATBALL);
        smell = TRUE;
        break;
      }
      if (obj.otyp === STATUE) {
        mon = await animate_statue(obj, oox[0], ooy[0], ANIMATE_SPELL, null);
      } else {
        if (golem_xform) {
          ptr = $sat(G.mons, PM_FLESH_GOLEM);
        }
        mon = await makemon(ptr, oox[0], ooy[0], NO_MINVENT);
        if (mon) {
          if (await costly_spot(oox[0], ooy[0]) && (obj.where === 3 ? obj.unpaid | 0 : !obj.no_charge ? 1 : 0)) {
            shkp = await shop_keeper($rd(in_rooms(oox[0], ooy[0], SHOPBASE)));
            await stolen_value(obj, oox[0], ooy[0], shkp && shkp.mpeaceful | 0 ? 1 : 0, FALSE);
          }
          if (obj.timed) {
            await obj_stop_timers(obj);
          }
          if (obj.where === 3) {
            await useup(obj);
          } else {
            await delobj(obj);
          }
          if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
            await pline_The(S("figurine %sanimates!"), golem_xform ? S("turns to flesh and ") : S(""));
          }
        }
      }
      if (mon) {
        ptr = mon.data;
        if (ptr.mlet === S_GOLEM && ptr !== $sat(G.mons, PM_FLESH_GOLEM)) {
          await newcham(mon, $sat(G.mons, PM_FLESH_GOLEM), TRUE, FALSE);
        }
      } else if ((ptr.geno & (G_NOCORPSE | G_UNIQ)) !== 0) {
        res = 0;
      } else {
        while (!!(item = obj.cobj)) {
          bypass_obj(item);
          await obj_extract_self(item);
          await place_object(item, oox[0], ooy[0]);
        }
        obj = await poly_obj(obj, CORPSE);
      }
    } else {
      res = 0;
    }
    break;
  case RING_CLASS:
    obj = await poly_obj(obj, MEAT_RING);
    smell = TRUE;
    break;
  case WAND_CLASS:
    obj = await poly_obj(obj, MEAT_STICK);
    smell = TRUE;
    break;
  case GEM_CLASS:
    obj = await poly_obj(obj, MEATBALL);
    smell = TRUE;
    break;
  case WEAPON_CLASS:
  default:
    res = 0;
    break;
  }
  if (smell) {
    if (G.urole.malenum === 334 || !G.u.uconduct.unvegetarian || !((G.youmonst.data.mflags1 & 536870912) >>> 0 !== 0)) {
      await Norep(S("You smell the odor of meat."));
    } else {
      await Norep(S("You smell a delicious smell."));
    }
  }
  await newsym(oox[0], ooy[0]);
  return res;
}

export async function bhito(obj: struct_obj | null, otmp: struct_obj | null): Promise<number> {
  let res = 1;
  let learn_it = FALSE;
  let maybelearnit = 0;
  if (obj === otmp) {
    return 0;
  }
  if (obj.bypass) {
    if (G.context.bypasses) {
      return 0;
    } else {
      do {
        if (await debugcore(S("zap.c"), 1)) {
          await pline(S("%s for a moment."), await Tobjnam(obj, S("pulsate")));
        }
      } while (0);
      obj.bypass = 0;
    }
  }
  if (!(obj.where === OBJ_FLOOR || otmp.otyp === SPE_STONE_TO_FLESH)) {
    await impossible(S("bhito: obj is not floor or Stone To Flesh spell"));
  }
  if (obj === G.uball) {
    res = 0;
  } else if (obj === G.uchain) {
    if (otmp.otyp === WAN_OPENING || otmp.otyp === SPE_KNOCK) {
      learn_it = TRUE;
      await unpunish();
    } else {
      res = 0;
    }
  } else {
    switch (otmp.otyp) {
    case 395:
    case 374:
      if (obj.otyp === WAN_POLYMORPH || obj.otyp === SPE_POLYMORPH || obj.otyp === POT_POLYMORPH || obj_resists(obj, 5, 95)) {
        res = 0;
        break;
      }
      ++G.u.uconduct.polypiles;
      if (obj.otyp === 189 || obj.otyp === 190) {
        await boxlock(obj, otmp);
      }
      if (obj_shudders(obj)) {
        let cover = (obj === G.level.objects[G.u.ux][G.u.uy] && G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
        if ($rd(G.viz_array.a[G.viz_array.o + obj.oy], obj.ox) & 2) {
          learn_it = TRUE;
        }
        await do_osshock(obj);
        if (cover) {
          hideunder(G.youmonst);
        }
        break;
      }
      obj = await poly_obj(obj, STRANGE_OBJECT);
      await newsym(obj.ox, obj.oy);
      break;
    case 400:
      res = !obj.dknown ? 1 : 0;
      obj.dknown = 1;
      if (obj.otyp >= 189 && obj.otyp <= 195 || obj.otyp === STATUE) {
        obj.cknown = (obj.lknown = 1) & 1;
        if (!obj.cobj) {
          await pline(S("%s empty."), await Tobjnam(obj, S("are")));
        } else if (obj.otyp === 189 && obj.spe === 1) {
          await You(S("aren't sure whether %s has %s or its corpse inside."), await the(await xname(obj)), await an(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await rndmonnam(null) : S("cat")));
          obj.cknown = 0;
        } else {
          let o = null;
          for (o = obj.cobj; o; o = o.nobj) {
            o.dknown = 1;
          }
          await display_cinventory(obj);
        }
        res = 1;
      }
      if (res) {
        learn_it = TRUE;
      }
      break;
    case 390:
    case 351:
      maybelearnit = ($rd(G.viz_array.a[G.viz_array.o + obj.oy], obj.ox) & 2 || !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? 1 : 0) << 24 >> 24;
      if (obj.otyp === BOULDER) {
        if ($rd(G.viz_array.a[G.viz_array.o + obj.oy], obj.ox) & 2) {
          await pline_The(S("boulder falls apart."));
        } else {
          await You_hear(S("a crumbling sound."));
        }
        await fracture_rock(obj);
      } else if (obj.otyp === STATUE) {
        if (await break_statue(obj)) {
          if ($rd(G.viz_array.a[G.viz_array.o + obj.oy], obj.ox) & 2) {
            if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
              await pline_The(S("%s shatters."), await rndmonnam(null));
            } else {
              await pline_The(S("statue shatters."));
            }
          } else {
            await You_hear(S("a crumbling sound."));
          }
        }
      } else {
        let oox = obj.ox;
        let ooy = obj.oy;
        if (G.context.mon_moving ? !await breaks(obj, obj.ox, obj.oy) ? 1 : 0 : !await hero_breaks(obj, obj.ox, obj.oy, FALSE) ? 1 : 0) {
          maybelearnit = FALSE;
        } else {
          await newsym_force(oox, ooy);
        }
        res = 0;
      }
      if (maybelearnit) {
        learn_it = TRUE;
      }
      break;
    case 396:
    case 377:
      await cancel_item(obj);
      await newsym(obj.ox, obj.oy);
      break;
    case 354:
      await drain_item(obj, TRUE);
      break;
    case 397:
    case 375:
      await rloco(obj);
      break;
    case 391:
      break;
    case 394:
    case 373:
      if (obj.otyp === EGG) {
        await revive_egg(obj);
      } else if (obj.otyp === CORPSE) {
        let mtmp = null;
        const ox = new Int8Array(1);
        const oy = new Int8Array(1);
        let corpsenm = await corpse_revive_type(obj);
        let corpsname = await cxname_singular(obj);
        if (!get_obj_location(obj, P(ox, 0), P(oy, 0), 0)) {
          ox[0] = obj.ox, oy[0] = obj.oy;
        }
        mtmp = await revive(obj, TRUE);
        if (!mtmp) {
          res = 0;
        } else {
          if ($rd(G.viz_array.a[G.viz_array.o + oy[0]], ox[0]) & 2) {
            if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
              await pline(S("%s is resurrected!"), upstart(await noname_monnam(mtmp, ARTICLE_THE)));
              learn_it = TRUE;
            } else {
              if (!(($sat(G.mons, corpsenm).mflags2 & 524288) >>> 0 !== 0)) {
                corpsname = await The(corpsname);
              }
              await pline(S("%s disappears."), corpsname);
            }
          } else {
            if (G.urole.malenum === 332 && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(($sat(G.mons, corpsenm).mflags2 & 2) >>> 0 !== 0 || $sat(G.mons, corpsenm) === $sat(G.mons, 49) || ($sat(G.mons, corpsenm).mlet === S_GOLEM || $sat(G.mons, corpsenm).mlet === S_VORTEX))) {
              if (!(($sat(G.mons, corpsenm).mflags2 & 524288) >>> 0 !== 0)) {
                corpsname = await an(corpsname);
              }
              if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
                await You_hear(S("%s reviving."), corpsname);
              } else {
                await You_hear(S("a defibrillator."));
              }
              learn_it = TRUE;
            }
            if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
              await pline(S("%s appears."), await Monnam(mtmp));
            }
          }
          if (learn_it) {
            await exercise(A_WIS, TRUE);
          }
        }
      }
      break;
    case 398:
    case 350:
    case 399:
    case 356:
      if (obj.otyp === 189 || obj.otyp === 190) {
        res = await boxlock(obj, otmp);
      } else {
        res = 0;
      }
      if (res) {
        learn_it = TRUE;
      }
      break;
    case 392:
    case 355:
    case 393:
    case 389:
    case 349:
    case 366:
      res = 0;
      break;
    case 380:
      res = await stone_to_flesh_obj(obj);
      break;
    default:
      await impossible(S("What an interesting effect (%d)"), otmp.otyp);
      break;
    }
  }
  if (learn_it) {
    await learnwand(otmp);
  }
  return res;
}

export async function bhitpile(obj: struct_obj | null, fhito: Function | null, tx: number, ty: number, zz: number): Promise<number> {
  let hitanything = 0;
  let otmp = null;
  let next_obj = null;
  if (obj.otyp === SPE_FORCE_BOLT || obj.otyp === WAN_STRIKING) {
    let t = t_at(tx, ty);
    if (t && (t.ttyp | 0) === STATUE_TRAP && await activate_statue_trap(t, tx, ty, TRUE)) {
      await learnwand(obj);
    }
  }
  poly_zapped = -1;
  for (otmp = G.level.objects[tx][ty]; otmp; otmp = next_obj) {
    next_obj = otmp.v.v_nexthere;
    if (zz > 0 && G.u.uundetected | 0 && otmp === G.level.objects[G.u.ux][G.u.uy] && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
      continue;
    }
    hitanything += await fhito(otmp, obj);
  }
  if (poly_zapped >= 0) {
    await create_polymon(G.level.objects[tx][ty], poly_zapped);
  }
  return hitanything;
}

export async function zappable(wand: struct_obj | null): Promise<number> {
  if (wand.spe < 0 || wand.spe === 0 && rn2(121)) {
    return 0;
  }
  if (wand.spe === 0) {
    await You(S("wrest one last charge from the worn-out wand."));
  }
  wand.spe = wand.spe - 1 << 24 >> 24;
  return 1;
}

export async function zapnodir(obj: struct_obj | null): Promise<void> {
  let known = FALSE;
  switch (obj.otyp) {
  case 384:
  case 347:
    await litroom(TRUE, obj);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      known = TRUE;
    }
    if (await lightdamage(obj, TRUE, 5)) {
      known = TRUE;
    }
    break;
  case 385:
  case 364:
    if (!await findit()) {
      return;
    }
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      known = TRUE;
    }
    break;
  case 387:
    known = await create_critters(rn2(23) ? 1 : rn2(7) + 2, null, FALSE);
    break;
  case 388:
    known = TRUE;
    if (G.u.uluck + G.u.moreluck + rn2(5) < 0) {
      await pline(S("Unfortunately, nothing happens."));
      break;
    }
    await makewish();
    break;
  case 386:
    known = TRUE;
    await You_feel(S("self-knowledgeable..."));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    await enlightenment(MAGICENLIGHTENMENT, ENL_GAMEINPROGRESS);
    await pline_The(S("feeling subsides."));
    await exercise(A_WIS, TRUE);
    break;
  }
  if (known) {
    if (!G.objects[obj.otyp].oc_name_known) {
      await more_experienced(0, 10);
    }
    await learnwand(obj);
  }
}

async function backfire(otmp: struct_obj | null): Promise<void> {
  let dmg = 0;
  otmp.in_use = (TRUE) & 1;
  await pline(S("%s suddenly explodes!"), await The(await xname(otmp)));
  dmg = d(otmp.spe + 2, 6);
  await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("exploding wand"), KILLED_BY_AN);
  await useup(otmp);
}

export async function dozap(): Promise<number> {
  let obj = null;
  let damage = 0;
  if (await check_capacity(null)) {
    return 0;
  }
  obj = await getobj(P(zap_syms), S("zap"));
  if (!obj) {
    return 0;
  }
  await check_unpaid(obj);
  if (!await zappable(obj)) {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
  } else if (obj.cursed | 0 && !rn2(WAND_BACKFIRE_CHANCE)) {
    await backfire(obj);
    await exercise(A_STR, FALSE);
    return 1;
  } else if (!((G.objects[obj.otyp].oc_dir | 0) === NODIR) && !await getdir(null)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s glows and fades."), await The(await xname(obj)));
    }
  } else if (!G.u.dx && !G.u.dy && !G.u.dz && !((G.objects[obj.otyp].oc_dir | 0) === NODIR)) {
    if ((damage = await zapyourself(obj, TRUE)) !== 0) {
      let buf = new Int8Array(256);
      sprintf(P(buf), S("zapped %sself with a wand"), G.genders[G.flags.female ? 1 : 0].him);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (damage + 1) / 2 | 0 : damage, P(buf), NO_KILLER_PREFIX);
    }
  } else {
    G.current_wand = obj;
    await weffects(obj);
    obj = G.current_wand;
    G.current_wand = null;
  }
  if (obj && obj.spe < 0) {
    await pline(S("%s to dust."), await Tobjnam(obj, S("turn")));
    await useup(obj);
  }
  update_inventory();
  return 1;
}

export async function zapyourself(obj: struct_obj | null, ordinary: number): Promise<number> {
  let $t1: any, $t2: any;
  const learn_it = new Int8Array(1);
  learn_it[0] = FALSE;
  let damage = 0;
  switch (obj.otyp) {
  case 390:
  case 351:
    learn_it[0] = TRUE;
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline(S("Boing!"));
    } else {
      if (ordinary) {
        await You(S("bash yourself!"));
        damage = d(2, 12);
      } else {
        damage = d(1 + obj.spe, 6);
      }
      await exercise(A_STR, FALSE);
    }
    break;
  case 407:
    learn_it[0] = TRUE;
    if (!(G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic)) {
      await You(S("shock yourself!"));
      damage = d(12, 6);
      await exercise(A_CON, FALSE);
    } else {
      await shieldeff(G.u.ux, G.u.uy);
      await You(S("zap yourself, but seem unharmed."));
      await ugolemeffects(AD_ELEC, d(12, 6));
    }
    await destroy_item(WAND_CLASS, AD_ELEC);
    await destroy_item(RING_CLASS, AD_ELEC);
    await flashburn(rnd(100));
    break;
  case 343:
    await You(S("explode a fireball on top of yourself!"));
    await explode(G.u.ux, G.u.uy, 11, d(6, 6), WAND_CLASS, EXPL_FIERY);
    break;
  case 403:
  case 226:
    learn_it[0] = TRUE;
    if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await You_feel(S("rather warm."));
      await ugolemeffects(AD_FIRE, d(12, 6));
    } else {
      await pline(S("You've set yourself afire!"));
      damage = d(12, 6);
    }
    await burn_away_slime();
    await burnarmor(G.youmonst);
    await destroy_item(SCROLL_CLASS, AD_FIRE);
    await destroy_item(POTION_CLASS, AD_FIRE);
    await destroy_item(SPBOOK_CLASS, AD_FIRE);
    await destroy_item(FOOD_CLASS, AD_FIRE);
    break;
  case 404:
  case 344:
  case 225:
    learn_it[0] = TRUE;
    if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await You_feel(S("a little chill."));
      await ugolemeffects(AD_COLD, d(12, 6));
    } else {
      await You(S("imitate a popsicle!"));
      damage = d(12, 6);
    }
    await destroy_item(POTION_CLASS, AD_COLD);
    break;
  case 402:
  case 342:
    learn_it[0] = TRUE;
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline_The(S("missiles bounce!"));
    } else {
      damage = d(4, 6);
      await pline(S("Idiot!  You've shot yourself!"));
    }
    break;
  case 395:
  case 374:
    if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
      learn_it[0] = TRUE;
      await polyself(0);
    }
    break;
  case 396:
  case 377:
    await cancel_monst(G.youmonst, obj, TRUE, TRUE, TRUE);
    break;
  case 354:
    if (!(G.u.uprops[DRAIN_RES].intrinsic || G.u.uprops[DRAIN_RES].extrinsic)) {
      learn_it[0] = TRUE;
      await losexp(S("life drainage"));
    }
    damage = 0;
    break;
  case 391:
    {
      let msg = !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !G.u.uprops[INVIS].blocked ? 1 : 0;
      if (G.u.uprops[INVIS].blocked && G.uarmc.otyp === MUMMY_WRAPPING) {
        await You_feel(S("rather itchy under %s."), await yname(G.uarmc));
        break;
      }
      if (ordinary || !rn2(10)) {
        ($t1 = G.u.uprops[INVIS], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
      } else {
        incr_itimeout(P(G.u.uprops[INVIS], "intrinsic"), d(obj.spe, 250));
      }
      if (msg) {
        learn_it[0] = TRUE;
        await newsym(G.u.ux, G.u.uy);
        await self_invis_message();
      }
      break;
    }
  case 393:
    if (!(G.u.uprops[FAST].intrinsic & INTRINSIC)) {
      learn_it[0] = TRUE;
      if (!(G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic)) {
        await You(S("speed up."));
      } else {
        await Your(S("quickness feels more natural."));
      }
      await exercise(A_DEX, TRUE);
    }
    ($t2 = G.u.uprops[FAST], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
    break;
  case 405:
  case 345:
    learn_it[0] = TRUE;
    if (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await You(S("don't feel sleepy!"));
    } else {
      await pline_The(S("sleep ray hits you!"));
      await fall_asleep(-rnd(50), TRUE);
    }
    break;
  case 392:
  case 355:
    if (G.u.uprops[FAST].intrinsic & (TIMEOUT | INTRINSIC)) {
      learn_it[0] = TRUE;
      await u_slow_down();
    }
    break;
  case 397:
  case 375:
    await tele();
    if ((G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic) && !G.u.uprops[STUNNED].intrinsic || !($rd(G.viz_array.a[G.viz_array.o + G.u.uy0], G.u.ux0) & 1) || dist2(G.u.ux0, G.u.uy0, G.u.ux, G.u.uy) >= 16) {
      learn_it[0] = TRUE;
    }
    break;
  case 406:
  case 346:
    if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX) || (G.youmonst.data.mflags2 & 256) >>> 0 !== 0) {
      await pline(obj.otyp === WAN_DEATH ? S("The wand shoots an apparently harmless beam at you.") : S("You seem no deader than before."));
      break;
    }
    learn_it[0] = TRUE;
    sprintf(P(G.killer.name), S("shot %sself with a death ray"), G.genders[G.flags.female ? 1 : 0].him);
    G.killer.format = NO_KILLER_PREFIX;
    await You(S("irradiate yourself with pure energy!"));
    await You(S("die."));
    await done(DIED);
    break;
  case 394:
  case 373:
    learn_it[0] = TRUE;
    await unturn_dead(G.youmonst);
    if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0) {
      await You_feel(S("frightened and %sstunned."), G.u.uprops[STUNNED].intrinsic ? S("even more ") : S(""));
      await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + rnd(30), FALSE);
    } else {
      await You(S("shudder in dread."));
    }
    break;
  case 349:
  case 366:
    learn_it[0] = TRUE;
    await healup(d(6, obj.otyp === SPE_EXTRA_HEALING ? 8 : 4), 0, FALSE, obj.blessed | 0 || obj.otyp === SPE_EXTRA_HEALING ? 1 : 0);
    await You_feel(S("%sbetter."), obj.otyp === SPE_EXTRA_HEALING ? S("much ") : S(""));
    break;
  case 384:
    damage = d(obj.spe, 25);
  case 204:
    if (!damage) {
      damage = 5;
    }
    damage = await lightdamage(obj, ordinary, damage);
    damage += rnd(25);
    if (await flashburn(damage)) {
      learn_it[0] = TRUE;
    }
    damage = 0;
    break;
  case 398:
  case 350:
    if (!!G.uball) {
      learn_it[0] = TRUE;
      await unpunish();
    }
    if (!G.u.utrap || !await openholdingtrap(G.youmonst, P(learn_it, 0))) {
      let otmp = null;
      let boxing = FALSE;
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if (otmp.otyp === 189 || otmp.otyp === 190) {
          await boxlock(otmp, obj);
          boxing = TRUE;
        }
      }
      if (boxing) {
        update_inventory();
      }
      await openfallingtrap(G.youmonst, TRUE, P(learn_it, 0));
    }
    break;
  case 399:
  case 356:
    if (G.u.utrap || !await closeholdingtrap(G.youmonst, P(learn_it, 0))) {
      let otmp = null;
      let boxing = FALSE;
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if (otmp.otyp === 189 || otmp.otyp === 190) {
          await boxlock(otmp, obj);
          boxing = TRUE;
        }
      }
      if (boxing) {
        update_inventory();
      }
    }
    break;
  case 401:
  case 341:
  case 364:
  case 389:
    break;
  case 400:
    {
      let otmp = null;
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        otmp.dknown = 1;
        if (otmp.otyp >= 189 && otmp.otyp <= 195 || otmp.otyp === STATUE) {
          otmp.lknown = 1;
          if (!(otmp.otyp === 189 && otmp.spe === 1)) {
            otmp.cknown = 1;
          }
        }
      }
      update_inventory();
      learn_it[0] = TRUE;
      await ustatusline();
      break;
    }
  case 380:
    {
      const otmp = [null];
      const onxt = [null];
      let didmerge = 0;
      if (G.u.umonnum === PM_STONE_GOLEM) {
        learn_it[0] = TRUE;
        await polymon(PM_FLESH_GOLEM);
      }
      if (G.u.uprops[STONED].intrinsic) {
        learn_it[0] = TRUE;
        await fix_petrification();
      }
      for (otmp[0] = G.invent; otmp[0]; otmp[0] = onxt[0]) {
        onxt[0] = otmp[0].nobj;
        if (await bhito(otmp[0], obj)) {
          learn_it[0] = TRUE;
        }
      }
      do {
        didmerge = FALSE;
        for (otmp[0] = G.invent; !didmerge && otmp[0]; otmp[0] = otmp[0].nobj) {
          for (onxt[0] = otmp[0].nobj; onxt[0]; onxt[0] = onxt[0].nobj) {
            if (await merged(P(otmp, 0), P(onxt, 0))) {
              didmerge = TRUE;
              break;
            }
          }
        }
      } while (didmerge);
      break;
    }
  default:
    await impossible(S("zapyourself: object %d used?"), obj.otyp);
    break;
  }
  if (learn_it[0]) {
    await learnwand(obj);
  }
  return damage;
}

export async function ubreatheu(mattk: struct_attack | null): Promise<void> {
  let dtyp = 20 + mattk.adtyp - 1;
  let fltxt = G.flash_types[dtyp];
  await zhitu(dtyp, mattk.damn, fltxt, G.u.ux, G.u.uy);
}

export async function lightdamage(obj: struct_obj | null, ordinary: number, amt: number): Promise<number> {
  let buf = new Int8Array(256);
  let how = null;
  let dmg = amt;
  if (dmg && G.youmonst.data === $sat(G.mons, PM_GREMLIN)) {
    dmg = rnd(dmg);
    if (dmg > 10) {
      dmg = 10 + rnd(dmg - 10);
    }
    if (dmg > 20) {
      dmg = 20;
    }
    await pline(S("Ow, that light hurts%c"), dmg > 2 || G.u.mh <= 5 ? 33 : 46);
    if (obj.oclass === SCROLL_CLASS || obj.oclass === SPBOOK_CLASS) {
      ordinary = FALSE;
    }
    how = obj.oclass !== SPBOOK_CLASS ? await ansimpleoname(obj) : S("spell of light");
    sprintf(P(buf), S("%s %sself with %s"), ordinary ? S("zapped") : S("blasted"), G.genders[G.flags.female ? 1 : 0].him, how);
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, P(buf), NO_KILLER_PREFIX);
  }
  return dmg;
}

export async function flashburn(duration: number): Promise<number> {
  if (!resists_blnd(G.youmonst)) {
    await You(P(are_blinded_by_the_flash));
    await make_blinded(duration, FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await Your(S("%s"), G.c_common_strings.c_vision_clears);
    }
    return TRUE;
  }
  return FALSE;
}

async function zap_steed(obj: struct_obj | null): Promise<number> {
  let steedhit = FALSE;
  G.bhitpos.x = G.u.usteed.mx, G.bhitpos.y = G.u.usteed.my;
  G.notonhead = FALSE;
  switch (obj.otyp) {
  case 400:
    await probe_monster(G.u.usteed);
    await learnwand(obj);
    steedhit = TRUE;
    break;
  case 397:
  case 375:
    await tele();
    if ((G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic) && !G.u.uprops[STUNNED].intrinsic || !($rd(G.viz_array.a[G.viz_array.o + G.u.uy0], G.u.ux0) & 1) || dist2(G.u.ux0, G.u.uy0, G.u.ux, G.u.uy) >= 16) {
      await learnwand(obj);
    }
    steedhit = TRUE;
    break;
  case 361:
  case 391:
  case 396:
  case 377:
  case 395:
  case 374:
  case 390:
  case 351:
  case 392:
  case 355:
  case 393:
  case 349:
  case 366:
  case 354:
  case 398:
  case 350:
    await bhitm(G.u.usteed, obj);
    steedhit = TRUE;
    break;
  default:
    steedhit = FALSE;
    break;
  }
  return steedhit << 24 >> 24;
}

export async function cancel_monst(mdef: struct_monst | null, obj: struct_obj | null, youattack: number, allow_cancel_kill: number, self_cancel: number): Promise<number> {
  let youdefend = (mdef === G.youmonst ? 1 : 0) << 24 >> 24;
  if (youdefend ? !youattack && (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) ? 1 : 0 : await resist(mdef, obj.oclass, 0, NOTELL)) {
    return FALSE;
  }
  if (self_cancel) {
    let otmp = null;
    for (otmp = youdefend ? G.invent : mdef.minvent; otmp; otmp = otmp.nobj) {
      await cancel_item(otmp);
    }
    if (youdefend) {
      G.context.botl = 1;
      find_ac();
    }
  }
  if (youdefend) {
    if (G.u.umonnum !== G.u.umonster) {
      if (G.u.umonnum === PM_CLAY_GOLEM) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(P(cancel_monst$writing_vanishes), P(cancel_monst$your));
        } else {
          await You_feel(S("%s headed."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("dark") : S("light"));
        }
        G.u.mh = 0;
      }
      if ((G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && G.u.mh > 0) {
        await Your(S("amulet grows hot for a moment, then cools."));
      } else {
        await rehumanize();
      }
    }
  } else {
    mdef.mcan = 1;
    if ((mdef.m_ap_type & 7) !== M_AP_NOTHING) {
      await seemimic(mdef);
    }
    if (mdef.cham >= LOW_PM) {
      await newcham(mdef, $sat(G.mons, mdef.cham), FALSE, FALSE);
      mdef.cham = NON_PM;
    }
    if ((mdef.data.mflags2 & 4) >>> 0 !== 0 && !((mdef.data.mflags2 & 8) >>> 0 !== 0)) {
      await were_change(mdef);
    }
    if (mdef.data === $sat(G.mons, PM_CLAY_GOLEM)) {
      if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected)) {
        await pline(P(cancel_monst$writing_vanishes), s_suffix(await mon_nam(mdef)));
      }
      if (allow_cancel_kill) {
        if (youattack) {
          await killed(mdef);
        } else {
          await monkilled(mdef, S(""), AD_SPEL);
        }
      }
    }
  }
  return TRUE;
}

async function zap_updown(obj: struct_obj | null): Promise<number> {
  let striking = FALSE;
  const disclose = new Int8Array(1);
  disclose[0] = FALSE;
  let x = 0;
  let y = 0;
  const xx = new Int32Array(1);
  const yy = new Int32Array(1);
  let ptmp = 0;
  let otmp = null;
  let e = null;
  let ttmp = null;
  let buf = new Int8Array(256);
  x = xx[0] = G.u.ux;
  y = yy[0] = G.u.uy;
  ttmp = t_at(x, y);
  switch (obj.otyp) {
  case 400:
    ptmp = 0;
    if (G.u.dz < 0) {
      await You(S("probe towards the %s."), ceiling(x, y));
    } else {
      ptmp += await bhitpile(obj, bhito, x, y, G.u.dz);
      await You(S("probe beneath the %s."), surface(x, y));
      ptmp += await display_binventory(x, y, TRUE);
    }
    if (!ptmp) {
      await Your(S("probe reveals nothing."));
    }
    return TRUE;
  case 398:
  case 350:
    if (is_db_wall(x, y) && find_drawbridge(P(xx, 0), P(yy, 0))) {
      await open_drawbridge(xx[0], yy[0]);
      disclose[0] = TRUE;
    } else if (G.u.dz > 0 && (x === G.dnstair.sx && y === G.dnstair.sy) && on_level(G.u.uz, G.dungeon_topology.d_qstart_level) && !await ok_to_quest()) {
      await pline_The(S("stairs seem to ripple momentarily."));
      disclose[0] = TRUE;
    }
    if (G.u.dz > 0 && G.u.utrap) {
      await openholdingtrap(G.youmonst, P(disclose, 0));
    } else if (G.u.dz > 0 && !G.u.utrap) {
      await openfallingtrap(G.youmonst, FALSE, P(disclose, 0));
    }
    break;
  case 390:
  case 351:
    striking = TRUE;
  case 399:
  case 356:
    if (($at2(G.level.locations, x, y).typ === DRAWBRIDGE_DOWN ? G.u.dz > 0 ? 1 : 0 : is_drawbridge_wall(x, y) >= 0 && !is_db_wall(x, y) ? 1 : 0) && find_drawbridge(P(xx, 0), P(yy, 0))) {
      if (!striking) {
        await close_drawbridge(xx[0], yy[0]);
      } else {
        await destroy_drawbridge(xx[0], yy[0]);
      }
      disclose[0] = TRUE;
    } else if (striking && G.u.dz < 0 && rn2(3) && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !G.u.uinwater && !((G.dungeon_topology.d_qstart_level.dlevel || G.dungeon_topology.d_qstart_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qstart_level))) {
      let dmg = 0;
      await pline(S("A rock is dislodged from the %s and falls on your %s."), ceiling(x, y), body_part(HEAD));
      dmg = rnd(G.uarmh && ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) ? 2 : 6);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("falling rock"), KILLED_BY_AN);
      if (!!(otmp = await mksobj_at(ROCK, x, y, FALSE, FALSE))) {
        await xname(otmp);
        await stackobj(otmp);
      }
      await newsym(x, y);
    } else if (G.u.dz > 0 && ttmp) {
      if (!striking && await closeholdingtrap(G.youmonst, P(disclose, 0))) {
        ;
      } else if (striking && (ttmp.ttyp | 0) === TRAPDOOR) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !ttmp.tseen) {
          await pline(S("%s beneath you shatters."), G.c_common_strings.c_Something);
        } else if (!ttmp.tseen) {
          await pline(S("There's a trapdoor beneath you; it shatters."));
        } else {
          await pline(S("The trapdoor beneath you shatters."));
          disclose[0] = TRUE;
        }
        ttmp.ttyp = (HOLE) & 31;
        ttmp.tseen = 1;
        await newsym(x, y);
        await dotrap(ttmp, 0);
      } else if (!striking && (ttmp.ttyp | 0) === HOLE) {
        ttmp.ttyp = (TRAPDOOR) & 31;
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || !ttmp.tseen) {
          await pline(S("Some %s swirls beneath you."), is_ice(x, y) ? S("frost") : S("dust"));
        } else {
          ttmp.tseen = 1;
          await newsym(x, y);
          await pline(S("A trapdoor appears beneath you."));
          disclose[0] = TRUE;
        }
      }
    }
    break;
  case 380:
    if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || G.u.uinwater | 0 || (G.dungeon_topology.d_qstart_level.dlevel || G.dungeon_topology.d_qstart_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qstart_level) && G.u.dz < 0) {
      await pline(S("%s"), G.c_common_strings.c_nothing_happens);
    } else if (G.u.dz < 0) {
      await pline(S("Blood drips on your %s."), body_part(FACE));
    } else if (G.u.dz > 0 && !!!G.level.objects[G.u.ux][G.u.uy]) {
      e = engr_at(G.u.ux, G.u.uy);
      if (!(e && e.engr_type === ENGRAVE)) {
        if (is_pool(G.u.ux, G.u.uy) || is_ice(G.u.ux, G.u.uy)) {
          await pline(S("%s"), G.c_common_strings.c_nothing_happens);
        } else {
          await pline(S("Blood %ss %s your %s."), is_lava(G.u.ux, G.u.uy) ? S("boil") : S("pool"), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("beneath") : S("at"), await makeplural(body_part(FOOT)));
        }
      }
    }
    break;
  default:
    break;
  }
  if (G.u.dz > 0) {
    await bhitpile(obj, bhito, x, y, G.u.dz);
    if (!!(e = engr_at(x, y)) && e.engr_type !== HEADSTONE) {
      switch (obj.otyp) {
      case 395:
      case 374:
        await del_engr(e);
        await make_engr_at(x, y, await random_engraving(P(buf)), G.moves, 0);
        break;
      case 396:
      case 377:
      case 391:
        await del_engr(e);
        break;
      case 397:
      case 375:
        rloc_engr(e);
        break;
      case 380:
        if (e.engr_type === ENGRAVE) {
          await pline_The(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("floor runs like butter!") : S("edges on the floor get smoother."));
          await wipe_engr_at(x, y, d(2, 4), TRUE);
        }
        break;
      case 390:
      case 351:
        await wipe_engr_at(x, y, d(2, 4), TRUE);
        break;
      default:
        break;
      }
    }
  } else if (G.u.dz < 0) {
    if (G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
      let hitit = 0;
      otmp = G.level.objects[G.u.ux][G.u.uy];
      if (otmp) {
        hitit = await bhito(otmp, obj);
      }
      if (hitit) {
        hideunder(G.youmonst);
        disclose[0] = TRUE;
      }
    }
  }
  return disclose[0];
}

export function zapsetup(): void {
  obj_zapped = FALSE;
}

export async function zapwrapup(): Promise<void> {
  if (obj_zapped) {
    await You_feel(S("shuddering vibrations."));
  }
  obj_zapped = FALSE;
}

export async function weffects(obj$: struct_obj | null): Promise<void> {
  const obj = [null];
  obj[0] = obj$;
  let otyp = obj[0].otyp;
  let disclose = FALSE;
  let was_unkn = (!G.objects[otyp].oc_name_known ? 1 : 0) << 24 >> 24;
  await exercise(A_WIS, TRUE);
  if (G.u.usteed && (G.objects[otyp].oc_dir | 0) !== NODIR && !G.u.dx && !G.u.dy && G.u.dz > 0 && await zap_steed(obj[0])) {
    disclose = TRUE;
  } else if ((G.objects[otyp].oc_dir | 0) === IMMEDIATE) {
    zapsetup();
    if (G.u.uswallow) {
      await bhitm(G.u.ustuck, obj[0]);
    } else if (G.u.dz) {
      disclose = await zap_updown(obj[0]);
    } else {
      await bhit(G.u.dx, G.u.dy, rn2(8) + 6, ZAPPED_WAND, bhitm, bhito, P(obj, 0));
    }
    await zapwrapup();
  } else if ((G.objects[otyp].oc_dir | 0) === NODIR) {
    await zapnodir(obj[0]);
  } else {
    if (otyp === WAN_DIGGING || otyp === SPE_DIG) {
      await zap_dig();
    } else if (otyp >= SPE_MAGIC_MISSILE && otyp <= SPE_FINGER_OF_DEATH) {
      await buzz(otyp - SPE_MAGIC_MISSILE + 10, (G.u.ulevel / 2 | 0) + 1, G.u.ux, G.u.uy, G.u.dx, G.u.dy);
    } else if (otyp >= WAN_MAGIC_MISSILE && otyp <= WAN_LIGHTNING) {
      await buzz(otyp - WAN_MAGIC_MISSILE, otyp === WAN_MAGIC_MISSILE ? 2 : 6, G.u.ux, G.u.uy, G.u.dx, G.u.dy);
    } else {
      await impossible(S("weffects: unexpected spell or wand"));
    }
    disclose = TRUE;
  }
  if (disclose) {
    await learnwand(obj[0]);
    if (was_unkn) {
      await more_experienced(0, 10);
    }
  }
  return;
}

export function spell_damage_bonus(dmg: number): number {
  let intell = acurr(A_INT);
  if (intell <= 9) {
    if (dmg > 1) {
      dmg = dmg <= 3 ? 1 : dmg - 3;
    }
  } else if (intell <= 13 || G.u.ulevel < 5) {
    ;
  } else if (intell <= 18) {
    dmg += 1;
  } else if (intell <= 24 || G.u.ulevel < 14) {
    dmg += 2;
  } else {
    dmg += 3;
  }
  return dmg;
}

function spell_hit_bonus(skill: number): number {
  let hit_bon = 0;
  let dex = acurr(A_DEX);
  switch (G.u.weapon_skills[spell_skilltype(skill)].skill) {
  case P_ISRESTRICTED:
  case P_UNSKILLED:
    hit_bon = -4;
    break;
  case P_BASIC:
    hit_bon = 0;
    break;
  case P_SKILLED:
    hit_bon = 2;
    break;
  case P_EXPERT:
    hit_bon = 3;
    break;
  }
  if (dex < 4) {
    hit_bon -= 3;
  } else if (dex < 6) {
    hit_bon -= 2;
  } else if (dex < 8) {
    hit_bon -= 1;
  } else if (dex < 14) {
    hit_bon -= 0;
  } else {
    hit_bon += dex - 14;
  }
  return hit_bon;
}

export function exclam(force: number): Ptr | null {
  return force < 0 ? S("?") : force <= 4 ? S(".") : S("!");
}

export async function hit(str: Ptr | null, mtmp: struct_monst | null, force: Ptr | null): Promise<void> {
  if (!($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && !(G.u.uswallow | 0 && mtmp === G.u.ustuck) || !G.flags.verbose) {
    await pline(S("%s %s it."), await The(str), vtense(str, S("hit")));
  } else {
    await pline(S("%s %s %s%s"), await The(str), vtense(str, S("hit")), await mon_nam(mtmp), force);
  }
}

export async function miss(str: Ptr | null, mtmp: struct_monst | null): Promise<void> {
  await pline(S("%s %s %s."), await The(str), vtense(str, S("miss")), ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 || ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) && G.flags.verbose ? await mon_nam(mtmp) : S("it"));
}

function skiprange(range: number, skipstart: Ptr | null, skipend: Ptr | null): void {
  let tr = range / 4 | 0;
  let tmp = range - (tr > 0 ? rnd(tr) : 0);
  skipstart.a[skipstart.o] = tmp;
  skipend.a[skipend.o] = tmp - Math.imul(tmp / 4 | 0, rnd(3));
  if (skipend.a[skipend.o] >= tmp) {
    skipend.a[skipend.o] = tmp - 1;
  }
}

export async function bhit(ddx: number, ddy: number, range: number, weapon: number, fhitm: Function | null, fhito: Function | null, pobj: Ptr | null): Promise<struct_monst | null> {
  let $g = 0;
  let mtmp = null;
  let result = null;
  let obj = null;
  let typ = 0;
  let shopdoor = 0;
  let point_blank = 0;
  let in_skip = 0;
  let allow_skip = 0;
  let tethered_weapon = 0;
  let skiprange_start = new Int32Array(1);
  let skiprange_end = new Int32Array(1);
  let skipcount = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      result = null;
      obj = pobj.a[pobj.o];
      shopdoor = FALSE;
      point_blank = TRUE;
      in_skip = FALSE;
      allow_skip = FALSE;
      tethered_weapon = FALSE;
      skiprange_start[0] = 0;
      skiprange_end[0] = 0;
      skipcount = 0;
      if (weapon >>> 0 === KICKED_WEAPON) {
        G.bhitpos.x = G.u.ux + ddx << 24 >> 24;
        G.bhitpos.y = G.u.uy + ddy << 24 >> 24;
        --range;
      } else {
        G.bhitpos.x = G.u.ux;
        G.bhitpos.y = G.u.uy;
      }
      if (weapon >>> 0 === THROWN_WEAPON && obj && obj.otyp === ROCK) {
        skiprange(range, P(skiprange_start, 0), P(skiprange_end, 0));
        allow_skip = (!rn2(3) ? 1 : 0) << 24 >> 24;
      }
      if (weapon >>> 0 === FLASHED_LIGHT) {
        await tmp_at(DISP_BEAM, S_flashbeam + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
      } else if (weapon >>> 0 === THROWN_TETHERED_WEAPON && obj) {
        tethered_weapon = TRUE;
        weapon = THROWN_WEAPON;
        await tmp_at(DISP_TETHER, obj.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : obj.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : obj.otyp === 240 ? obj.corpsenm + (382 + (1 + (382 + (382 + 0)))) : obj.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
      } else if (weapon >>> 0 !== ZAPPED_WAND && weapon >>> 0 !== INVIS_BEAM) {
        await tmp_at(DISP_FLASH, obj.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : obj.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : obj.otyp === 240 ? obj.corpsenm + (382 + (1 + (382 + (382 + 0)))) : obj.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
      }
      while (range-- > 0) {
        const x = new Int32Array(1);
        const y = new Int32Array(1);
        G.bhitpos.x = G.bhitpos.x + ddx << 24 >> 24;
        G.bhitpos.y = G.bhitpos.y + ddy << 24 >> 24;
        x[0] = G.bhitpos.x;
        y[0] = G.bhitpos.y;
        if (!isok(x[0], y[0])) {
          G.bhitpos.x = G.bhitpos.x - ddx << 24 >> 24;
          G.bhitpos.y = G.bhitpos.y - ddy << 24 >> 24;
          break;
        }
        if ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp === P_PICK_AXE && inside_shop(x[0], y[0]) && !!(mtmp = await shkcatch(obj, x[0], y[0]))) {
          await tmp_at(DISP_END, 0);
          result = mtmp;
          { $g = 1; continue $L; }
        }
        typ = $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ & 0xff;
        if (weapon >>> 0 === THROWN_WEAPON || weapon >>> 0 === KICKED_WEAPON) {
          if (typ === IRONBARS && await hits_bars(pobj, x[0] - ddx, y[0] - ddy, G.bhitpos.x, G.bhitpos.y, point_blank ? 0 : !rn2(5) ? 1 : 0, 1)) {
            obj = pobj.a[pobj.o];
            G.bhitpos.x = G.bhitpos.x - ddx << 24 >> 24;
            G.bhitpos.y = G.bhitpos.y - ddy << 24 >> 24;
            break;
          } else if (obj.lamplit | 0 && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await show_transient_light(obj, G.bhitpos.x, G.bhitpos.y);
          }
        }
        if (weapon >>> 0 === ZAPPED_WAND && find_drawbridge(P(x, 0), P(y, 0))) {
          let learn_it = FALSE;
          switch (obj.otyp) {
          case 398:
          case 350:
            if (is_db_wall(G.bhitpos.x, G.bhitpos.y)) {
              if ($rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 || $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
                learn_it = TRUE;
              }
              await open_drawbridge(x[0], y[0]);
            }
            break;
          case 399:
          case 356:
            if (($rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 || $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) && $at2(G.level.locations, x[0], y[0]).typ === DRAWBRIDGE_DOWN) {
              learn_it = TRUE;
            }
            await close_drawbridge(x[0], y[0]);
            break;
          case 390:
          case 351:
            if (typ !== DRAWBRIDGE_UP) {
              await destroy_drawbridge(x[0], y[0]);
            }
            learn_it = TRUE;
            break;
          }
          if (learn_it) {
            await learnwand(obj);
          }
        }
        mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null;
        if (skiprange_start[0] && range === skiprange_start[0] && allow_skip) {
          if (is_pool(G.bhitpos.x, G.bhitpos.y) && !mtmp) {
            in_skip = TRUE;
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              await pline(S("%s %s%s."), await Yname2(obj), otense(obj, S("skip")), skipcount ? S(" again") : S(""));
            } else {
              await You_hear(S("%s skip."), await yname(obj));
            }
            ++skipcount;
          } else if (skiprange_start[0] > skiprange_end[0] + 1) {
            --skiprange_start[0];
          }
        }
        if (in_skip) {
          if (range <= skiprange_end[0]) {
            in_skip = FALSE;
            if (range > 3) {
              skiprange(range, P(skiprange_start, 0), P(skiprange_end, 0));
            }
          } else if (mtmp && (mtmp.data.mlet === S_EEL || (mtmp.data.mflags1 & (512 | 1024)) >>> 0 !== 0 || (mtmp.data.mflags1 & 2) >>> 0 !== 0)) {
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
              await pline(S("%s %s over %s."), await Yname2(obj), otense(obj, S("pass")), await mon_nam(mtmp));
            }
            mtmp = null;
          }
        }
        if (mtmp && (weapon >>> 0 === THROWN_WEAPON || weapon >>> 0 === KICKED_WEAPON) && await shade_miss(G.youmonst, mtmp, obj, TRUE, TRUE)) {
          mtmp = null;
        }
        if (mtmp) {
          G.notonhead = (G.bhitpos.x !== mtmp.mx || G.bhitpos.y !== mtmp.my ? 1 : 0) << 24 >> 24;
          if (weapon >>> 0 === FLASHED_LIGHT) {
            if (mtmp.minvis) {
              obj.ox = G.u.ux, obj.oy = G.u.uy;
              await flash_hits_mon(mtmp, obj);
            } else {
              await tmp_at(DISP_END, 0);
              result = mtmp;
              { $g = 1; continue $L; }
            }
          } else if (weapon >>> 0 === INVIS_BEAM) {
            if (!mtmp.minvis || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) {
              result = mtmp;
              { $g = 1; continue $L; }
            }
          } else if (weapon >>> 0 !== ZAPPED_WAND) {
            if (!tethered_weapon) {
              await tmp_at(DISP_END, 0);
            }
            if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
              await map_invisible(G.bhitpos.x, G.bhitpos.y);
            }
            result = mtmp;
            { $g = 1; continue $L; }
          } else {
            await fhitm(mtmp, obj);
            range -= 3;
          }
        } else {
          if (weapon >>> 0 === ZAPPED_WAND && obj.otyp === WAN_PROBING && $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).glyph === 382 + (382 + 0)) {
            await unmap_object(G.bhitpos.x, G.bhitpos.y);
            await newsym(x[0], y[0]);
          }
        }
        if (fhito) {
          if (await bhitpile(obj, fhito, G.bhitpos.x, G.bhitpos.y, 0)) {
            --range;
          }
        } else {
          if (weapon >>> 0 === KICKED_WEAPON && (obj.oclass === COIN_CLASS && !!G.level.objects[G.bhitpos.x][G.bhitpos.y] || await ship_object(obj, G.bhitpos.x, G.bhitpos.y, await costly_spot(G.bhitpos.x, G.bhitpos.y)))) {
            await tmp_at(DISP_END, 0);
            { $g = 1; continue $L; }
          }
        }
        if (weapon >>> 0 === ZAPPED_WAND && (typ === DOOR || typ === SDOOR)) {
          switch (obj.otyp) {
          case 398:
          case 399:
          case 390:
          case 350:
          case 356:
          case 351:
            if (await doorlock(obj, G.bhitpos.x, G.bhitpos.y)) {
              if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 || obj.otyp === WAN_STRIKING && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
                await learnwand(obj);
              }
              if (($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).flags | 0) === D_BROKEN && $rd(in_rooms(G.bhitpos.x, G.bhitpos.y, SHOPBASE))) {
                shopdoor = TRUE;
                await add_damage(G.bhitpos.x, G.bhitpos.y, SHOP_DOOR_COST);
              }
            }
            break;
          }
        }
        if (!(typ >= POOL) || closed_door(G.bhitpos.x, G.bhitpos.y)) {
          G.bhitpos.x = G.bhitpos.x - ddx << 24 >> 24;
          G.bhitpos.y = G.bhitpos.y - ddy << 24 >> 24;
          break;
        }
        if (weapon >>> 0 !== ZAPPED_WAND && weapon >>> 0 !== INVIS_BEAM) {
          if ($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).glyph === 382 + (382 + 0) && $rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2) {
            await unmap_object(G.bhitpos.x, G.bhitpos.y);
            await newsym(x[0], y[0]);
          }
          await tmp_at(G.bhitpos.x, G.bhitpos.y);
          await G.windowprocs.win_delay_output();
          if (weapon >>> 0 === KICKED_WEAPON && (is_pool(G.bhitpos.x, G.bhitpos.y) || is_lava(G.bhitpos.x, G.bhitpos.y))) {
            break;
          }
          if (typ === SINK && weapon >>> 0 !== FLASHED_LIGHT) {
            break;
          }
        }
        if (weapon >>> 0 === THROWN_WEAPON && range > 0 && obj.otyp === HEAVY_IRON_BALL) {
          let bobj = null;
          let t = null;
          if (!!(bobj = sobj_at(BOULDER, x[0], y[0]))) {
            if ($rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2) {
              await pline(S("%s hits %s."), await The(await distant_name(obj, xname)), await an(await xname(bobj)));
            }
            range = 0;
          } else if (obj === G.uball) {
            if (!await test_move(x[0] - ddx, y[0] - ddy, ddx, ddy, TEST_MOVE)) {
              if ($rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2) {
                await pline(S("%s jerks to an abrupt halt."), await The(await distant_name(obj, xname)));
              }
              range = 0;
            } else if (G.level.flags.sokoban_rules | 0 && !!(t = t_at(x[0], y[0])) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT || ((t.ttyp | 0) === HOLE || (t.ttyp | 0) === TRAPDOOR))) {
              range = 0;
            }
          }
        }
        point_blank = FALSE;
      }
      if (weapon >>> 0 !== ZAPPED_WAND && weapon >>> 0 !== INVIS_BEAM && !tethered_weapon) {
        await tmp_at(DISP_END, 0);
      }
      if (shopdoor) {
        await pay_for_damage(S("destroy"), FALSE);
      }
    case 1: // bhit_done
      if (weapon >>> 0 === THROWN_WEAPON || weapon >>> 0 === KICKED_WEAPON) {
        await transient_light_cleanup();
      }
      return result;
    }
    break;
  }
}

export async function boomhit(obj$: struct_obj | null, dx: number, dy: number): Promise<struct_monst | null> {
  const obj = [null];
  obj[0] = obj$;
  let i = 0;
  let ct = 0;
  let boom = 0;
  let mtmp = null;
  let counterclockwise = TRUE;
  G.bhitpos.x = G.u.ux;
  G.bhitpos.y = G.u.uy;
  boom = counterclockwise ? S_boomleft : S_boomright;
  for (i = 0; i < 8; ++i) {
    if (G.xdir[i] === dx && G.ydir[i] === dy) {
      break;
    }
  }
  await tmp_at(DISP_FLASH, boom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
  for (ct = 0; ct < 10; ++ct) {
    i = (i + 8) % 8;
    boom = S_boomleft + S_boomright - boom;
    await tmp_at(DISP_CHANGE, boom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
    dx = G.xdir[i];
    dy = G.ydir[i];
    G.bhitpos.x = G.bhitpos.x + dx << 24 >> 24;
    G.bhitpos.y = G.bhitpos.y + dy << 24 >> 24;
    if (!!(mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null)) {
      await m_respond(mtmp);
      await tmp_at(DISP_END, 0);
      return mtmp;
    }
    if (!($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ >= POOL) || closed_door(G.bhitpos.x, G.bhitpos.y)) {
      G.bhitpos.x = G.bhitpos.x - dx << 24 >> 24;
      G.bhitpos.y = G.bhitpos.y - dy << 24 >> 24;
      break;
    }
    if (G.bhitpos.x === G.u.ux && G.bhitpos.y === G.u.uy) {
      if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic || rn2(20) >= acurr(A_DEX)) {
        await thitu(10 + obj[0].spe, await dmgval(obj[0], G.youmonst), P(obj, 0), S("boomerang"));
        await endmultishot(TRUE);
        break;
      } else {
        await tmp_at(DISP_END, 0);
        await You(S("skillfully catch the boomerang."));
        return G.youmonst;
      }
    }
    await tmp_at(G.bhitpos.x, G.bhitpos.y);
    await G.windowprocs.win_delay_output();
    if ($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === SINK) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await pline(S("Klonk!"));
      }
      break;
    }
    if (ct % 5 !== 0) {
      i += counterclockwise ? -1 : 1;
    }
  }
  await tmp_at(DISP_END, 0);
  return null;
}

export async function zhitm(mon: struct_monst | null, type: number, nd: number, ootmp: Ptr | null): Promise<number> {
  let tmp = 0;
  let abstype = Math.abs(type) % 10;
  let sho_shieldeff = FALSE;
  let spellcaster = (type >= 10 && type < 20 ? 1 : 0) << 24 >> 24;
  ootmp.a[ootmp.o] = null;
  switch (abstype) {
  case 1 - 1:
    if (resists_magm(mon)) {
      sho_shieldeff = TRUE;
      break;
    }
    tmp = d(nd, 6);
    if (spellcaster) {
      tmp = spell_damage_bonus(tmp);
    }
    break;
  case 2 - 1:
    if (((mon.data.mresists | mon.mextrinsics) & 1) !== 0) {
      sho_shieldeff = TRUE;
      break;
    }
    tmp = d(nd, 6);
    if (((mon.data.mresists | mon.mextrinsics) & 2) !== 0) {
      tmp += 7;
    }
    if (spellcaster) {
      tmp = spell_damage_bonus(tmp);
    }
    if (await burnarmor(mon)) {
      if (!rn2(3)) {
        await destroy_mitem(mon, POTION_CLASS, AD_FIRE);
      }
      if (!rn2(3)) {
        await destroy_mitem(mon, SCROLL_CLASS, AD_FIRE);
      }
      if (!rn2(5)) {
        await destroy_mitem(mon, SPBOOK_CLASS, AD_FIRE);
      }
      await destroy_mitem(mon, FOOD_CLASS, AD_FIRE);
    }
    break;
  case 3 - 1:
    if (((mon.data.mresists | mon.mextrinsics) & 2) !== 0) {
      sho_shieldeff = TRUE;
      break;
    }
    tmp = d(nd, 6);
    if (((mon.data.mresists | mon.mextrinsics) & 1) !== 0) {
      tmp += d(nd, 3);
    }
    if (spellcaster) {
      tmp = spell_damage_bonus(tmp);
    }
    if (!rn2(3)) {
      await destroy_mitem(mon, POTION_CLASS, AD_COLD);
    }
    break;
  case 4 - 1:
    tmp = 0;
    await sleep_monst(mon, d(nd, 25), type === 4 - 1 ? WAND_CLASS : 0);
    break;
  case 5 - 1:
    if (Math.abs(type) !== 20 + (5 - 1)) {
      if (mon.data === $sat(G.mons, PM_DEATH)) {
        mon.mhpmax += mon.mhpmax / 2 | 0;
        if (mon.mhpmax >= MAGIC_COOKIE) {
          mon.mhpmax = MAGIC_COOKIE - 1;
        }
        mon.mhp = mon.mhpmax;
        tmp = 0;
        break;
      }
      if ((mon.data.mflags2 & 2) >>> 0 !== 0 || mon.data === $sat(G.mons, 49) || (mon.data.mlet === S_GOLEM || mon.data.mlet === S_VORTEX) || (mon.data.mflags2 & 256) >>> 0 !== 0 || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224) || resists_magm(mon)) {
        sho_shieldeff = TRUE;
        break;
      }
      type = -1;
    } else {
      let otmp2 = null;
      if (((mon.data.mresists | mon.mextrinsics) & 8) !== 0) {
        sho_shieldeff = TRUE;
      } else if (mon.misc_worn_check & W_ARMS) {
        ootmp.a[ootmp.o] = await which_armor(mon, W_ARMS);
      } else if (mon.misc_worn_check & W_ARM) {
        ootmp.a[ootmp.o] = await which_armor(mon, W_ARM);
        if (!!(otmp2 = await which_armor(mon, W_ARMC))) {
          await m_useup(mon, otmp2);
        }
      } else {
        tmp = MAGIC_COOKIE;
        if (!!(otmp2 = await which_armor(mon, W_ARMC))) {
          await m_useup(mon, otmp2);
        }
        if (!!(otmp2 = await which_armor(mon, W_ARMU))) {
          await m_useup(mon, otmp2);
        }
      }
      type = -1;
      break;
    }
    tmp = mon.mhp + 1;
    break;
  case 6 - 1:
    if (((mon.data.mresists | mon.mextrinsics) & 16) !== 0) {
      sho_shieldeff = TRUE;
      tmp = 0;
    } else {
      tmp = d(nd, 6);
    }
    if (spellcaster) {
      tmp = spell_damage_bonus(tmp);
    }
    if (!resists_blnd(mon) && !(type > 0 && G.u.uswallow | 0 && mon === G.u.ustuck)) {
      let rnd_tmp = rnd(50) >>> 0;
      mon.mcansee = 0;
      if (mon.mblinded + rnd_tmp >>> 0 > 127) {
        mon.mblinded = 127;
      } else {
        mon.mblinded = (mon.mblinded + rnd_tmp >>> 0) & 127;
      }
    }
    if (!rn2(3)) {
      await destroy_mitem(mon, WAND_CLASS, AD_ELEC);
    }
    if (!rn2(3)) {
      await destroy_mitem(mon, RING_CLASS, AD_ELEC);
    }
    break;
  case 7 - 1:
    if (((mon.data.mresists | mon.mextrinsics) & 32) !== 0) {
      sho_shieldeff = TRUE;
      break;
    }
    tmp = d(nd, 6);
    break;
  case 8 - 1:
    if (((mon.data.mresists | mon.mextrinsics) & 64) !== 0) {
      sho_shieldeff = TRUE;
      break;
    }
    tmp = d(nd, 6);
    if (!rn2(6)) {
      await acid_damage(mon.mw);
    }
    if (!rn2(6)) {
      await erode_armor(mon, ERODE_CORRODE);
    }
    break;
  }
  if (sho_shieldeff) {
    await shieldeff(mon.mx, mon.my);
  }
  if (type >= 10 && type < 20 && (G.urole.malenum === 333 && G.u.uhave.questart | 0)) {
    tmp = tmp * 2;
  }
  if (tmp > 0 && type >= 0 && await resist(mon, type < 10 + 0 ? WAND_CLASS : 0, 0, NOTELL)) {
    tmp = tmp / 2 | 0;
  }
  if (tmp < 0) {
    tmp = 0;
  }
  do {
    if (await debugcore(S("zap.c"), 1)) {
      await pline(S("zapped monster hp = %d (= %d - %d)"), mon.mhp - tmp, mon.mhp, tmp);
    }
  } while (0);
  mon.mhp -= tmp;
  return tmp;
}

async function zhitu(type: number, nd: number, fltxt: Ptr | null, sx: number, sy: number): Promise<void> {
  let dam = 0;
  let abstyp = Math.abs(type);
  switch (abstyp % 10) {
  case 1 - 1:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(sx, sy);
      await pline_The(S("missiles bounce off!"));
    } else {
      dam = d(nd, 6);
      await exercise(A_STR, FALSE);
    }
    break;
  case 2 - 1:
    if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
      await shieldeff(sx, sy);
      await You(S("don't feel hot!"));
      await ugolemeffects(AD_FIRE, d(nd, 6));
    } else {
      dam = d(nd, 6);
    }
    await burn_away_slime();
    if (await burnarmor(G.youmonst)) {
      if (!rn2(3)) {
        await destroy_item(POTION_CLASS, AD_FIRE);
      }
      if (!rn2(3)) {
        await destroy_item(SCROLL_CLASS, AD_FIRE);
      }
      if (!rn2(5)) {
        await destroy_item(SPBOOK_CLASS, AD_FIRE);
      }
      await destroy_item(FOOD_CLASS, AD_FIRE);
    }
    break;
  case 3 - 1:
    if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
      await shieldeff(sx, sy);
      await You(S("don't feel cold."));
      await ugolemeffects(AD_COLD, d(nd, 6));
    } else {
      dam = d(nd, 6);
    }
    if (!rn2(3)) {
      await destroy_item(POTION_CLASS, AD_COLD);
    }
    break;
  case 4 - 1:
    if (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await You(S("don't feel sleepy."));
    } else {
      await fall_asleep(-d(nd, 25), TRUE);
    }
    break;
  case 5 - 1:
    if (abstyp === 20 + (5 - 1)) {
      if (G.u.uprops[DISINT_RES].intrinsic || G.u.uprops[DISINT_RES].extrinsic) {
        await You(S("are not disintegrated."));
        break;
      } else if (G.uarms) {
        await destroy_arm(G.uarms);
        break;
      } else if (G.uarm) {
        if (G.uarmc) {
          await destroy_arm(G.uarmc);
        }
        await destroy_arm(G.uarm);
        break;
      }
      if (G.uarmc) {
        await destroy_arm(G.uarmc);
      }
      if (G.uarmu) {
        await destroy_arm(G.uarmu);
      }
    } else if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX) || (G.youmonst.data.mflags2 & 256) >>> 0 !== 0) {
      await shieldeff(sx, sy);
      await You(S("seem unaffected."));
      break;
    } else if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(sx, sy);
      await You(S("aren't affected."));
      break;
    }
    G.killer.format = KILLED_BY_AN;
    strcpy(P(G.killer.name), fltxt ? fltxt : S(""));
    G.u.ugrave_arise = type === -(20 + (5 - 1)) ? -3 : NON_PM;
    await done(DIED);
    return;
  case 6 - 1:
    if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
      await shieldeff(sx, sy);
      await You(S("aren't affected."));
      await ugolemeffects(AD_ELEC, d(nd, 6));
    } else {
      dam = d(nd, 6);
      await exercise(A_CON, FALSE);
    }
    if (!rn2(3)) {
      await destroy_item(WAND_CLASS, AD_ELEC);
    }
    if (!rn2(3)) {
      await destroy_item(RING_CLASS, AD_ELEC);
    }
    break;
  case 7 - 1:
    await poisoned(S("blast"), A_DEX, S("poisoned blast"), 15, FALSE);
    break;
  case 8 - 1:
    if (G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic) {
      await pline_The(S("%s doesn't hurt."), hliquid(S("acid")));
      dam = 0;
    } else {
      await pline_The(S("%s burns!"), hliquid(S("acid")));
      dam = d(nd, 6);
      await exercise(A_STR, FALSE);
    }
    if (!rn2(G.u.twoweap ? 3 : 6)) {
      await acid_damage(G.uwep);
    }
    if (G.u.twoweap && !rn2(3)) {
      await acid_damage(G.uswapwep);
    }
    if (!rn2(6)) {
      await erode_armor(G.youmonst, ERODE_CORRODE);
    }
    break;
  }
  if (dam && (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) && !(abstyp >= 20 && abstyp <= 29)) {
    dam = (dam + 1) / 2 | 0;
  }
  await losehp(dam, fltxt, KILLED_BY_AN);
  return;
}

export async function burn_floor_objects(x: number, y: number, give_feedback: number, u_caused: number): Promise<number> {
  let obj = null;
  let obj2 = null;
  let i = 0;
  let scrquan = 0;
  let delquan = 0;
  let buf1 = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let cnt = 0;
  for (obj = G.level.objects[x][y]; obj; obj = obj2) {
    obj2 = obj.v.v_nexthere;
    if (obj.oclass === SCROLL_CLASS || obj.oclass === SPBOOK_CLASS || obj.oclass === FOOD_CLASS && obj.otyp === GLOB_OF_GREEN_SLIME) {
      if (obj.otyp === SCR_FIRE || obj.otyp === SPE_FIREBALL || obj_resists(obj, 2, 100)) {
        continue;
      }
      scrquan = obj.quan;
      delquan = 0;
      for (i = scrquan; i > 0; --i) {
        if (!rn2(3)) {
          ++delquan;
        }
      }
      if (delquan) {
        if (give_feedback) {
          obj.quan = 1;
          strcpy(P(buf1), x === G.u.ux && y === G.u.uy ? await xname(obj) : await distant_name(obj, xname));
          obj.quan = 2;
          strcpy(P(buf2), x === G.u.ux && y === G.u.uy ? await xname(obj) : await distant_name(obj, xname));
          obj.quan = scrquan;
        }
        if (u_caused) {
          await useupf(obj, delquan);
        } else if (delquan < scrquan) {
          obj.quan -= delquan;
        } else {
          await delobj(obj);
        }
        cnt += delquan;
        if (give_feedback) {
          if (delquan > 1) {
            await pline(S("%ld %s burn."), delquan, P(buf2));
          } else {
            await pline(S("%s burns."), await An(P(buf1)));
          }
        }
      }
    }
  }
  return cnt;
}

function zap_hit(ac: number, type: number): number {
  let chance = rn2(20);
  let spell_bonus = type ? spell_hit_bonus(type) : 0;
  if (!chance) {
    return rnd(10) < ac + spell_bonus ? 1 : 0;
  }
  ac = ac >= 0 ? ac : -rnd(-ac);
  return 3 - chance < ac + spell_bonus ? 1 : 0;
}

async function disintegrate_mon(mon: struct_monst | null, type: number, fltxt: Ptr | null): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  let m_amulet = await mlifesaver(mon);
  if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
    if (!m_amulet) {
      await pline(S("%s is disintegrated!"), await Monnam(mon));
    } else {
      await hit(fltxt, mon, S("!"));
    }
  }
  for (otmp = mon.minvent; otmp; otmp = otmp2) {
    otmp2 = otmp.nobj;
    if (!(G.objects[otmp.otyp].oc_oprop === DISINT_RES || obj_resists(otmp, 5, 50) || is_quest_artifact(otmp) || otmp === m_amulet)) {
      if (otmp.owornmask) {
        mon.misc_worn_check = mon.misc_worn_check & ~otmp.owornmask;
        if (otmp.owornmask & W_WEP) {
          await setmnotwielded(mon, otmp);
        }
        await update_mon_intrinsics(mon, otmp, FALSE, TRUE);
        otmp.owornmask = 0;
      }
      await obj_extract_self(otmp);
      await obfree(otmp, null);
    }
  }
  if (type < 0) {
    await monkilled(mon, null, -AD_RBRE);
  } else {
    await xkilled(mon, XKILL_NOMSG | XKILL_NOCORPSE);
  }
}

export async function buzz(type: number, nd: number, sx: number, sy: number, dx: number, dy: number): Promise<void> {
  await dobuzz(type, nd, sx, sy, dx, dy, TRUE);
}

export async function dobuzz(type: number, nd: number, sx: number, sy: number, dx: number, dy: number, say: number): Promise<void> {
  let $g = 0;
  let range = 0;
  let abstype = 0;
  let lsx = 0;
  let lsy = 0;
  let mon = null;
  let save_bhitpos = new struct_nhcoord();
  let shopdamage = new Int8Array(1);
  let fltxt = null;
  let otmp = [null];
  let spell_type = 0;
  let bounce = 0;
  let bchance = 0;
  let rmn = 0;
  let fireball = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      abstype = Math.abs(type) % 10;
      save_bhitpos = new struct_nhcoord();
      shopdamage[0] = FALSE;
      spell_type = type >= 10 && type < 20 ? SPE_MAGIC_MISSILE + abstype : 0;
      fltxt = G.flash_types[type <= -30 ? abstype : Math.abs(type)];
      if (G.u.uswallow) {
        let tmp = 0;
        if (type < 0) {
          return;
        }
        tmp = await zhitm(G.u.ustuck, type, nd, P(otmp, 0));
        if (!G.u.ustuck) {
          G.u.uswallow = 0;
        } else {
          await pline(S("%s rips into %s%s"), await The(fltxt), await mon_nam(G.u.ustuck), exclam(tmp));
        }
        if (tmp === MAGIC_COOKIE) {
          G.u.ustuck.mhp = 0;
        }
        if (G.u.ustuck.mhp < 1) {
          await killed(G.u.ustuck);
        }
        return;
      }
      if (type < 0) {
        await newsym(G.u.ux, G.u.uy);
      }
      range = rn2(7) + 7;
      if (dx === 0 && dy === 0) {
        range = 1;
      }
      save_bhitpos.$cp(G.bhitpos);
      await tmp_at(DISP_BEAM, await zapdir_to_glyph(dx, dy, abstype));
    case 3:
      if (!(range-- > 0)) { $g = 4; continue $L; }
      lsx = sx;
      sx = sx + dx << 24 >> 24;
      lsy = sy;
      sy = sy + dy << 24 >> 24;
      if (!isok(sx, sy) || $at2(G.level.locations, sx, sy).typ === STONE) {
        { $g = 1; continue $L; }
      }
      mon = !!G.level.monsters[sx][sy] ? G.level.monsters[sx][sy] : null;
      if ($rd(G.viz_array.a[G.viz_array.o + sy], sx) & 2) {
        if (mon && !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
          await map_invisible(sx, sy);
        } else if (!mon) {
          await unmap_invisible(sx, sy);
        }
        if ($at2(G.level.locations, sx, sy).typ >= POOL || isok(lsx, lsy) && $rd(G.viz_array.a[G.viz_array.o + lsy], lsx) & 2) {
          await tmp_at(sx, sy);
        }
        await G.windowprocs.win_delay_output();
      }
      G.bhitpos.x = sx, G.bhitpos.y = sy;
      if (type !== 10 + (2 - 1)) {
        range += await zap_over_floor(sx, sy, type, P(shopdamage, 0), 0);
        mon = !!G.level.monsters[sx][sy] ? G.level.monsters[sx][sy] : null;
      }
      if (!mon) { $g = 6; continue $L; }
      if (type === 10 + (2 - 1)) {
        { $g = 4; continue $L; };
      }
      if (type >= 0) {
        mon.mstrategy = (mon.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      }
    case 2: // buzzmonst
      G.notonhead = (mon.mx !== G.bhitpos.x || mon.my !== G.bhitpos.y ? 1 : 0) << 24 >> 24;
      if (zap_hit(find_mac(mon), spell_type)) {
        if (await mon_reflects(mon, null)) {
          if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
            await hit(fltxt, mon, exclam(0));
            await shieldeff(mon.mx, mon.my);
            await mon_reflects(mon, S("But it reflects from %s %s!"));
          }
          dx = -dx;
          dy = -dy;
        } else {
          let mon_could_move = mon.mcanmove << 24 >> 24;
          let tmp = await zhitm(mon, type, nd, P(otmp, 0));
          if ((mon.data === $sat(G.mons, 308) || mon.data === $sat(G.mons, 310) || mon.data === $sat(G.mons, 309)) && Math.abs(type) === 20 + (5 - 1)) {
            if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
              await hit(fltxt, mon, S("."));
              await pline(S("%s disintegrates."), await Monnam(mon));
              await pline(S("%s body reintegrates before your %s!"), s_suffix(await Monnam(mon)), (!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) === 1 ? body_part(EYE) : await makeplural(body_part(EYE)));
              await pline(S("%s resurrects!"), await Monnam(mon));
            }
            mon.mhp = mon.mhpmax;
            { $g = 4; continue $L; };
          }
          if (mon.data === $sat(G.mons, PM_DEATH) && abstype === ZT_DEATH) {
            if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
              await hit(fltxt, mon, S("."));
              await pline(S("%s absorbs the deadly %s!"), await Monnam(mon), type === 20 + (5 - 1) ? S("blast") : S("ray"));
              await pline(S("It seems even stronger than before."));
            }
            { $g = 4; continue $L; };
          }
          if (tmp === MAGIC_COOKIE) {
            await disintegrate_mon(mon, type, fltxt);
          } else if (mon.mhp < 1) {
            if (type < 0) {
              await monkilled(mon, fltxt, AD_RBRE);
            } else {
              let xkflags = XKILL_GIVEMSG;
              if (type % 10 === ZT_FIRE && (mon.data === $sat(G.mons, 246) || mon.data === $sat(G.mons, 245))) {
                xkflags |= XKILL_NOCORPSE;
              }
              await xkilled(mon, xkflags);
            }
          } else {
            if (!otmp[0]) {
              if (say || (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
                await hit(fltxt, mon, exclam(tmp));
              }
            } else {
              if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
                await pline(S("%s %s is disintegrated!"), s_suffix(await Monnam(mon)), await distant_name(otmp[0], xname));
              }
              await m_useup(mon, otmp[0]);
            }
            if (mon_could_move && !mon.mcanmove) {
              await slept_monst(mon);
            }
          }
        }
        range -= 2;
      } else {
        if (say || (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
          await miss(fltxt, mon);
        }
      }
      { $g = 5; continue $L; }
    case 6:
      if (sx === G.u.ux && sy === G.u.uy && range >= 0) {
        nomul(0);
        if (G.u.usteed && !rn2(3) && !await mon_reflects(G.u.usteed, null)) {
          mon = G.u.usteed;
          { $g = 2; continue $L; }
        } else if (zap_hit(G.u.uac, 0)) {
          range -= 2;
          await pline(S("%s hits you!"), await The(fltxt));
          if (G.u.uprops[REFLECTING].intrinsic || G.u.uprops[REFLECTING].extrinsic) {
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              await ureflects(S("But %s reflects from your %s!"), S("it"));
            } else {
              await pline(S("For some reason you are not affected."));
            }
            dx = -dx;
            dy = -dy;
            await shieldeff(sx, sy);
          } else {
            await zhitu(type, nd, fltxt, sx, sy);
          }
        } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s whizzes by you!"), await The(fltxt));
        } else if (abstype === ZT_LIGHTNING) {
          await Your(S("%s tingles."), body_part(ARM));
        }
        if (abstype === ZT_LIGHTNING) {
          await flashburn(d(nd, 50));
        }
        await stop_occupation();
        nomul(0);
      }
    case 5:
      if (!(!($at2(G.level.locations, sx, sy).typ >= POOL) || closed_door(sx, sy) && range >= 0)) { $g = 7; continue $L; }
    case 1: // make_bounce
      bchance = $at2(G.level.locations, sx, sy).typ === STONE ? 10 : In_mines(G.u.uz) && ($at2(G.level.locations, sx, sy).typ && $at2(G.level.locations, sx, sy).typ <= DBWALL) ? 20 : 75;
      bounce = 0;
      fireball = (type === 10 + (2 - 1) ? 1 : 0) << 24 >> 24;
      if (--range > 0 && isok(lsx, lsy) && $rd(G.viz_array.a[G.viz_array.o + lsy], lsx) & 2 || fireball) {
        if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
          await pline_The(S("%s vanishes into the aether!"), fltxt);
          if (fireball) {
            type = 2 - 1;
          }
          { $g = 4; continue $L; };
        } else if (fireball) {
          sx = lsx;
          sy = lsy;
          { $g = 4; continue $L; };
        } else {
          await pline_The(S("%s bounces!"), fltxt);
        }
      }
      if (!dx || !dy || !rn2(bchance)) {
        dx = -dx;
        dy = -dy;
      } else {
        if (isok(sx, lsy) && (rmn = $at2(G.level.locations, sx, lsy).typ & 0xff) >= POOL && !closed_door(sx, lsy) && (rmn >= ROOM || isok(sx + dx, lsy) && $at2(G.level.locations, sx + dx, lsy).typ >= POOL)) {
          bounce = 1;
        }
        if (isok(lsx, sy) && (rmn = $at2(G.level.locations, lsx, sy).typ & 0xff) >= POOL && !closed_door(lsx, sy) && (rmn >= ROOM || isok(lsx, sy + dy) && $at2(G.level.locations, lsx, sy + dy).typ >= POOL)) {
          if (!bounce || rn2(2)) {
            bounce = 2;
          }
        }
        switch (bounce) {
        case 0:
          dx = -dx;
        case 1:
          dy = -dy;
          break;
        case 2:
          dx = -dx;
          break;
        }
        await tmp_at(DISP_CHANGE, await zapdir_to_glyph(dx, dy, abstype));
      }
    case 7:
      { $g = 3; continue $L; }
    case 4:
      await tmp_at(DISP_END, 0);
      if (type === 10 + (2 - 1)) {
        await explode(sx, sy, type, d(12, 6), 0, EXPL_FIERY);
      }
      if (shopdamage[0]) {
        await pay_for_damage(abstype === ZT_FIRE ? S("burn away") : abstype === ZT_COLD ? S("shatter") : abstype === ZT_ACID ? S("damage") : abstype === ZT_DEATH ? S("disintegrate") : S("destroy"), FALSE);
      }
      G.bhitpos.$cp(save_bhitpos);
    }
    break;
  }
}

export async function melt_ice(x: number, y: number, msg: Ptr | null): Promise<void> {
  let lev = $sat(G.level.locations[x], y);
  let otmp = null;
  let mtmp = null;
  if (!msg) {
    msg = S("The ice crackles and melts.");
  }
  if (lev.typ === DRAWBRIDGE_UP || lev.typ === DRAWBRIDGE_DOWN) {
    lev.flags = (((lev.flags | 0) & ~DB_ICE) >>> 0) & 31;
  } else {
    lev.typ = ((lev.flags | 0) === ICED_POOL ? POOL : MOAT) << 24 >> 24;
    lev.flags = 0;
  }
  await spot_stop_timers(x, y, MELT_ICE_AWAY);
  await obj_ice_effects(x, y, FALSE);
  await unearth_objs(x, y);
  if (G.u.uinwater) {
    await vision_recalc(1);
  }
  await newsym(x, y);
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    await Norep(S("%s"), msg);
  }
  if (!!(otmp = sobj_at(BOULDER, x, y))) {
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      await pline(S("%s settles..."), await An(await xname(otmp)));
    }
    do {
      await obj_extract_self(otmp);
      if (!await boulder_hits_pool(otmp, x, y, FALSE)) {
        await impossible(S("melt_ice: no pool?"));
      }
    } while (is_pool(x, y) && !!(otmp = sobj_at(BOULDER, x, y)));
    await newsym(x, y);
  }
  if (x === G.u.ux && y === G.u.uy) {
    await spoteffects(TRUE);
  } else if (is_pool(x, y) && !!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    await minliquid(mtmp);
  }
}

export async function start_melt_ice_timeout(x: number, y: number, min_time: number): Promise<void> {
  let when = 0;
  let where = 0;
  when = min_time | 0;
  if (when < MIN_ICE_TIME - 1) {
    when = MIN_ICE_TIME - 1;
  }
  while (++when <= MAX_ICE_TIME) {
    if (!rn2(MAX_ICE_TIME - when + MIN_ICE_TIME)) {
      break;
    }
  }
  if (when <= MAX_ICE_TIME) {
    where = $shl64(x, 16) | y;
    await start_timer(when, TIMER_LEVEL, MELT_ICE_AWAY, long_to_any(where));
  }
}

export async function melt_ice_away(arg: union_any | null, timeout: number): Promise<void> {
  let x = 0;
  let y = 0;
  let where = arg.a_long;
  let save_mon_moving = G.context.mon_moving;
  G.context.mon_moving = TRUE;
  y = (where & 65535) << 24 >> 24;
  x = ($shr64(where, 16) & 65535) << 24 >> 24;
  await melt_ice(x, y, S("Some ice melts away."));
  G.context.mon_moving = save_mon_moving;
}

export async function zap_over_floor(x: number, y: number, type: number, shopdamage: Ptr | null, exploding_wand_typ: number): Promise<number> {
  let $g = 0;
  let zapverb = null;
  let mon = null;
  let t = null;
  let lev = null;
  let see_it = 0;
  let yourzap = 0;
  let rangemod = 0;
  let abstype = 0;
  let new_doormask = 0;
  let see_txt = null;
  let sense_txt = null;
  let hear_txt = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      lev = $sat(G.level.locations[x], y);
      see_it = ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) << 24 >> 24;
      rangemod = 0;
      abstype = Math.abs(type) % 10;
      switch (abstype) {
      case 2 - 1:
        t = t_at(x, y);
        if (t && (t.ttyp | 0) === WEB) {
          if (see_it) {
            await Norep(S("A web bursts into flames!"));
          }
          await delfloortrap(t);
          if (see_it) {
            await newsym(x, y);
          }
        }
        if (is_ice(x, y)) {
          await melt_ice(x, y, null);
        } else if (is_pool(x, y)) {
          let msgtxt = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("You hear hissing gas.") : type >= 0 ? S("That seemed remarkably uneventful.") : null;
          if (lev.typ !== POOL) {
            if (see_it) {
              msgtxt = S("Some water evaporates.");
            }
          } else {
            rangemod -= 3;
            lev.typ = ROOM, lev.flags = 0;
            t = await maketrap(x, y, PIT);
            if (t) {
              t.tseen = 1;
            }
            if (see_it) {
              msgtxt = S("The water evaporates.");
            }
          }
          if (msgtxt) {
            await Norep(S("%s"), msgtxt);
          }
          if (lev.typ === ROOM) {
            await newsym(x, y);
          }
        } else if (lev.typ === FOUNTAIN) {
          if (see_it) {
            await pline(S("Steam billows from the fountain."));
          }
          rangemod -= 1;
          await dryup(x, y, type > 0 ? 1 : 0);
        }
        break;
      case 3 - 1:
        if (is_pool(x, y) || is_lava(x, y)) {
          let lava = is_lava(x, y);
          let moat = is_moat(x, y);
          if (lev.typ === WATER) {
            if (see_it) {
              await pline_The(S("%s freezes for a moment."), hliquid(S("water")));
            } else {
              await You_hear(S("a soft crackling."));
            }
            rangemod -= 1000;
          } else {
            let buf = new Int8Array(256);
            strcpy(P(buf), waterbody_name(x, y));
            rangemod -= 3;
            if (lev.typ === DRAWBRIDGE_UP) {
              lev.flags = (((lev.flags | 0) & ~DB_UNDER) >>> 0) & 31;
              lev.flags = ((lev.flags | 0 | (lava ? DB_FLOOR : DB_ICE)) >>> 0) & 31;
            } else {
              lev.flags = ((lava ? 0 : lev.typ === POOL ? ICED_POOL : ICED_MOAT) >>> 0) & 31;
              lev.typ = (lava ? ROOM : ICE) << 24 >> 24;
            }
            await bury_objs(x, y);
            if (see_it) {
              if (lava) {
                await Norep(S("The %s cools and solidifies."), hliquid(S("lava")));
              } else if (moat) {
                await Norep(S("The %s is bridged with ice!"), P(buf));
              } else {
                await Norep(S("The %s freezes."), hliquid(S("water")));
              }
              await newsym(x, y);
            } else if (!lava) {
              await You_hear(S("a crackling sound."));
            }
            if (x === G.u.ux && y === G.u.uy) {
              if (G.u.uinwater) {
                G.u.uinwater = 0;
                G.u.uundetected = 0;
                await docrt();
                G.vision_full_recalc = 1;
              } else if (G.u.utrap && G.u.utraptype === TT_LAVA) {
                if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
                  await You(S("pass through the now-solid rock."));
                  await reset_utrap(TRUE);
                } else {
                  set_utrap(rn2(50) + 20 >>> 0, TT_INFLOOR);
                  await You(S("are firmly stuck in the cooling rock."));
                }
              }
            } else if (!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
              if ((mon.data.mflags1 & 2) >>> 0 !== 0 && mon.mundetected | 0) {
                mon.mundetected = 0;
                await newsym(x, y);
              }
            }
            if (!lava) {
              await start_melt_ice_timeout(x, y, 0);
              await obj_ice_effects(x, y, TRUE);
            }
          }
        } else if (is_ice(x, y)) {
          let melt_time = 0;
          if ((melt_time = spot_time_left(x, y, MELT_ICE_AWAY)) !== 0) {
            await spot_stop_timers(x, y, MELT_ICE_AWAY);
            await start_melt_ice_timeout(x, y, melt_time);
          }
        }
        break;
      case 7 - 1:
        await create_gas_cloud(x, y, 1, 8);
        break;
      case 8 - 1:
        if (lev.typ === IRONBARS) {
          if (((lev.flags | 0) & W_NONDIGGABLE) !== 0) {
            if (see_it) {
              await Norep(S("The %s corrode somewhat but remain intact."), G.defsyms[S_bars].explanation);
            }
          } else {
            rangemod -= 3;
            if (see_it) {
              await Norep(S("The %s melt."), G.defsyms[S_bars].explanation);
            }
            if ($rd(in_rooms(x, y, SHOPBASE))) {
              lev.typ = ROOM, lev.flags = 0;
              if (see_it) {
                await newsym(x, y);
              }
              await add_damage(x, y, type >= 0 ? SHOP_BARS_COST : 0);
              if (type >= 0) {
                shopdamage.a[shopdamage.o] = TRUE;
              }
            } else {
              lev.typ = DOOR, lev.flags = (D_NODOOR) & 31;
              if (see_it) {
                await newsym(x, y);
              }
            }
          }
        }
        break;
      default:
        break;
      }
      yourzap = (type >= 0 && !exploding_wand_typ ? 1 : 0) << 24 >> 24;
      zapverb = S("blast");
      if (!exploding_wand_typ) {
        if (Math.abs(type) < 10 + 0) {
          zapverb = S("bolt");
        } else if (Math.abs(type) < 20 + 0) {
          zapverb = S("spell");
        }
      }
      if ($at2(G.level.locations, x, y).typ === SDOOR) {
        cvt_sdoor_to_door($sat(G.level.locations[x], y));
        await newsym(x, y);
        if (see_it) {
          await pline(S("%s %s reveals a secret door."), yourzap ? S("Your") : S("The"), zapverb);
        } else if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
          await draft_message(FALSE);
        }
      }
      if (!closed_door(x, y)) { $g = 2; continue $L; }
      new_doormask = -1;
      see_txt = null;
      sense_txt = null;
      hear_txt = null;
      rangemod = -1000;
      switch (abstype) {
      case 2 - 1: { $g = 4; continue $L; }
      case 3 - 1: { $g = 5; continue $L; }
      case 5 - 1: { $g = 6; continue $L; }
      case 6 - 1: { $g = 7; continue $L; }
      default: { $g = 8; continue $L; }
      }
    case 4:
      new_doormask = D_NODOOR;
      see_txt = S("The door is consumed in flames!");
      sense_txt = S("smell smoke.");
      { $g = 3; continue $L; };
    case 5:
      new_doormask = D_NODOOR;
      see_txt = S("The door freezes and shatters!");
      sense_txt = S("feel cold.");
      { $g = 3; continue $L; };
    case 6:
      if (Math.abs(type) !== 20 + (5 - 1)) {
        { $g = 1; continue $L; }
      }
      new_doormask = D_NODOOR;
      see_txt = S("The door disintegrates!");
      hear_txt = S("crashing wood.");
      { $g = 3; continue $L; };
    case 7:
      new_doormask = D_BROKEN;
      see_txt = S("The door splinters!");
      hear_txt = S("crackling.");
      { $g = 3; continue $L; };
    case 8:
    case 1: // def_case
      if (exploding_wand_typ > 0) {
        if (exploding_wand_typ === WAN_STRIKING) {
          new_doormask = D_BROKEN;
          see_txt = S("The door crashes open!");
          sense_txt = S("feel a burst of cool air.");
          { $g = 3; continue $L; };
        }
      }
      if (see_it) {
        if (exploding_wand_typ) {
          await pline_The(S("door remains intact."));
        } else {
          await pline_The(S("door absorbs %s %s!"), yourzap ? S("your") : S("the"), zapverb);
        }
      } else {
        await You_feel(S("vibrations."));
      }
      { $g = 3; continue $L; };
    case 3:
      if (new_doormask >= 0) {
        if ($rd(in_rooms(x, y, SHOPBASE))) {
          if (type >= 0) {
            await add_damage(x, y, SHOP_DOOR_COST);
            shopdamage.a[shopdamage.o] = TRUE;
          } else {
            await add_damage(x, y, 0);
          }
        }
        lev.flags = (new_doormask >>> 0) & 31;
        unblock_point(x, y);
        if (see_it) {
          await pline(S("%s"), see_txt);
          await newsym(x, y);
        } else if (sense_txt) {
          await You(S("%s"), sense_txt);
        } else if (hear_txt) {
          await You_hear(S("%s"), hear_txt);
        }
        if (picking_at(x, y)) {
          await stop_occupation();
          reset_pick();
        }
      }
    case 2:
      if (!!G.level.objects[x][y] && abstype === ZT_FIRE) {
        if (await burn_floor_objects(x, y, FALSE, type > 0 ? 1 : 0) && $rd(G.viz_array.a[G.viz_array.o + y], x) & 1) {
          await newsym(x, y);
          await You(S("%s of smoke."), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("see a puff") : S("smell a whiff"));
        }
      }
      if (!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
        await wakeup(mon, FALSE);
        if (type >= 0) {
          await setmangry(mon, TRUE);
          if (mon.ispriest | 0 && $rd(in_rooms(mon.mx, mon.my, TEMPLE))) {
            await ghod_hitsu(mon);
          }
          if (mon.isshk | 0 && !$rd(P(G.u.ushops))) {
            hot_pursuit(mon);
          }
        }
      }
      return rangemod;
    }
    break;
  }
}

export async function fracture_rock(obj: struct_obj | null): Promise<void> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let by_you = (!G.context.mon_moving ? 1 : 0) << 24 >> 24;
  if (by_you && get_obj_location(obj, P(x, 0), P(y, 0), 0) && await costly_spot(x[0], y[0])) {
    const shkp = [null];
    shkp[0] = null;
    let objroom = $rd(in_rooms(x[0], y[0], SHOPBASE));
    if (await billable(P(shkp, 0), obj, objroom, FALSE)) {
      await You(S("fracture %s %s."), s_suffix(await shkname(shkp[0])), await xname(obj));
      await breakobj(obj, x[0], y[0], TRUE, FALSE);
    }
  }
  if (by_you && obj.otyp === BOULDER) {
    sokoban_guilt();
  }
  obj.otyp = ROCK;
  obj.oclass = GEM_CLASS;
  obj.quan = rn2(60) + 7;
  obj.owt = await weight(obj) >>> 0;
  obj.dknown = (obj.bknown = (obj.rknown = 0) & 1) & 1;
  obj.known = ((G.objects[obj.otyp].oc_uses_known | 0 ? 0 : 1) >>> 0) & 1;
  dealloc_oextra(obj);
  if (obj.where === OBJ_FLOOR) {
    await obj_extract_self(obj);
    await place_object(obj, obj.ox, obj.oy);
    if (!does_block(obj.ox, obj.oy, $sat(G.level.locations[obj.ox], obj.oy))) {
      unblock_point(obj.ox, obj.oy);
    }
    if ($rd(G.viz_array.a[G.viz_array.o + obj.oy], obj.ox) & 2) {
      await newsym(obj.ox, obj.oy);
    }
  }
}

export async function break_statue(obj: struct_obj | null): Promise<number> {
  let trap = t_at(obj.ox, obj.oy);
  let item = null;
  let by_you = (!G.context.mon_moving ? 1 : 0) << 24 >> 24;
  if (trap && (trap.ttyp | 0) === STATUE_TRAP && await activate_statue_trap(trap, obj.ox, obj.oy, TRUE)) {
    return FALSE;
  }
  while (!!(item = obj.cobj)) {
    await obj_extract_self(item);
    await place_object(item, obj.ox, obj.oy);
  }
  if (by_you && G.urole.malenum === 328 && obj.spe & STATUE_HISTORIC) {
    await You_feel(S("guilty about damaging such a historic statue."));
    adjalign(-1);
  }
  obj.spe = 0;
  await fracture_rock(obj);
  return TRUE;
}

async function destroy_one_item(obj: struct_obj | null, osym: number, dmgtyp: number): Promise<void> {
  let i = 0;
  let cnt = 0;
  let quan = 0;
  let dmg = 0;
  let xresist = 0;
  let skip = 0;
  let dindx = 0;
  let mult = null;
  let physical_damage = 0;
  physical_damage = FALSE;
  xresist = skip = 0;
  dmg = dindx = 0;
  quan = 0;
  switch (dmgtyp) {
  case 3:
    if (osym === POTION_CLASS && obj.otyp !== POT_OIL) {
      quan = obj.quan;
      dindx = 0;
      dmg = rnd(4);
    } else {
      ++skip;
    }
    break;
  case 2:
    xresist = (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) && obj.oclass !== POTION_CLASS && obj.otyp !== GLOB_OF_GREEN_SLIME ? 1 : 0;
    if (obj.otyp === SCR_FIRE || obj.otyp === SPE_FIREBALL) {
      ++skip;
    }
    if (obj.otyp === SPE_BOOK_OF_THE_DEAD) {
      ++skip;
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s glows a strange %s, but remains intact."), await The(await xname(obj)), hcolor(S("dark red")));
      }
    }
    quan = obj.quan;
    switch (osym) {
    case POTION_CLASS:
      dindx = obj.otyp !== POT_OIL ? 1 : 2;
      dmg = rnd(6);
      break;
    case SCROLL_CLASS:
      dindx = 3;
      dmg = 1;
      break;
    case SPBOOK_CLASS:
      dindx = 4;
      dmg = 1;
      break;
    case FOOD_CLASS:
      if (obj.otyp === GLOB_OF_GREEN_SLIME) {
        dindx = 1;
        dmg = (obj.owt + 19 >>> 0) / 20 >>> 0 | 0;
      } else {
        ++skip;
      }
      break;
    default:
      ++skip;
      break;
    }
    break;
  case 6:
    xresist = (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) && obj.oclass !== RING_CLASS ? 1 : 0;
    quan = obj.quan;
    switch (osym) {
    case RING_CLASS:
      if (obj.otyp === RIN_SHOCK_RESISTANCE) {
        ++skip;
        break;
      }
      dindx = 5;
      dmg = 0;
      break;
    case WAND_CLASS:
      if (obj.otyp === WAN_LIGHTNING) {
        ++skip;
        break;
      }
      dindx = 6;
      dmg = rnd(10);
      break;
    default:
      ++skip;
      break;
    }
    break;
  default:
    ++skip;
    break;
  }
  if (!skip) {
    if (obj.in_use) {
      --quan;
    }
    for (i = cnt = 0; i < quan; ++i) {
      if (!rn2(3)) {
        ++cnt;
      }
    }
    if (!cnt) {
      return;
    }
    mult = cnt === 1 ? quan === 1 ? S("Your") : S("One of your") : cnt < quan ? S("Some of your") : quan === 2 ? S("Both of your") : S("All of your");
    await pline(S("%s %s %s!"), mult, await xname(obj), G.destroy_strings[dindx][cnt > 1 ? 1 : 0]);
    if (osym === POTION_CLASS && dmgtyp !== AD_COLD) {
      if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) || (G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
        await potionbreathe(obj);
      }
    }
    if (obj.owornmask) {
      if (obj.owornmask & W_RING) {
        await Ring_gone(obj);
      } else {
        await setnotworn(obj);
      }
    }
    if (obj === G.current_wand) {
      G.current_wand = null;
    }
    for (i = 0; i < cnt; ++i) {
      await useup(obj);
    }
    if (dmg) {
      if (xresist) {
        await You(S("aren't hurt!"));
      } else {
        let how = G.destroy_strings[dindx][2];
        let one = (cnt === 1 ? 1 : 0) << 24 >> 24;
        if (dmgtyp === AD_FIRE && osym === FOOD_CLASS) {
          how = S("exploding glob of slime");
        }
        if (physical_damage) {
          dmg = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg;
        }
        await losehp(dmg, one ? how : await makeplural(how), one ? KILLED_BY_AN : KILLED_BY);
        await exercise(A_STR, FALSE);
      }
    }
  }
}

export async function destroy_item(osym: number, dmgtyp: number): Promise<void> {
  let obj = null;
  let i = 0;
  let deferral_indx = 0;
  let deferrals = new Uint16Array(54);
  memset(P(deferrals), 0, 108);
  bypass_objlist(G.invent, FALSE);
  while (!!(obj = nxt_unbypassed_obj(G.invent))) {
    if (obj.oclass !== osym) {
      continue;
    }
    if (obj.oartifact) {
      continue;
    }
    if (obj.in_use | 0 && obj.quan === 1) {
      continue;
    }
    if (deferral_indx < (Math.trunc(108 / 2) | 0) && (obj.owornmask !== 0 && (G.objects[obj.otyp].oc_oprop === LEVITATION || G.objects[obj.otyp].oc_oprop === FLYING) || obj.otyp === POT_WATER && G.u.ulycn >= LOW_PM && (G.u.umonnum !== G.u.umonster ? obj.blessed | 0 : obj.cursed | 0))) {
      deferrals[deferral_indx++] = obj.o_id & 0xffff;
      continue;
    }
    await destroy_one_item(obj, osym, dmgtyp);
  }
  for (i = 0; i < deferral_indx; ++i) {
    for (obj = G.invent; obj; obj = obj.nobj) {
      if (obj.o_id === deferrals[i]) {
        await destroy_one_item(obj, osym, dmgtyp);
        break;
      }
    }
  }
  return;
}

export async function destroy_mitem(mtmp: struct_monst | null, osym: number, dmgtyp: number): Promise<number> {
  let obj = null;
  let skip = 0;
  let tmp = 0;
  let i = 0;
  let cnt = 0;
  let quan = 0;
  let dindx = 0;
  let vis = 0;
  if (mtmp === G.youmonst) {
    await destroy_item(osym, dmgtyp);
    return 0;
  }
  vis = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
  bypass_objlist(mtmp.minvent, FALSE);
  while (!!(obj = nxt_unbypassed_obj(mtmp.minvent))) {
    if (obj.oclass !== osym) {
      continue;
    }
    skip = 0;
    quan = 0;
    dindx = 0;
    switch (dmgtyp) {
    case 3:
      if (osym === POTION_CLASS && obj.otyp !== POT_OIL) {
        quan = obj.quan;
        dindx = 0;
        ++tmp;
      } else {
        ++skip;
      }
      break;
    case 2:
      if (obj.otyp === SCR_FIRE || obj.otyp === SPE_FIREBALL) {
        ++skip;
      }
      if (obj.otyp === SPE_BOOK_OF_THE_DEAD) {
        ++skip;
        if (vis) {
          await pline(S("%s glows a strange %s, but remains intact."), await The(await distant_name(obj, xname)), hcolor(S("dark red")));
        }
      }
      quan = obj.quan;
      switch (osym) {
      case POTION_CLASS:
        dindx = obj.otyp !== POT_OIL ? 1 : 2;
        ++tmp;
        break;
      case SCROLL_CLASS:
        dindx = 3;
        ++tmp;
        break;
      case SPBOOK_CLASS:
        dindx = 4;
        ++tmp;
        break;
      case FOOD_CLASS:
        if (obj.otyp === GLOB_OF_GREEN_SLIME) {
          dindx = 1;
          tmp += (obj.owt + 19 >>> 0) / 20 >>> 0;
        } else {
          ++skip;
        }
        break;
      default:
        ++skip;
        break;
      }
      break;
    case 6:
      quan = obj.quan;
      switch (osym) {
      case RING_CLASS:
        if (obj.otyp === RIN_SHOCK_RESISTANCE) {
          ++skip;
          break;
        }
        dindx = 5;
        break;
      case WAND_CLASS:
        if (obj.otyp === WAN_LIGHTNING) {
          ++skip;
          break;
        }
        dindx = 6;
        ++tmp;
        break;
      default:
        ++skip;
        break;
      }
      break;
    default:
      ++skip;
      break;
    }
    if (!skip) {
      for (i = cnt = 0; i < quan; ++i) {
        if (!rn2(3)) {
          ++cnt;
        }
      }
      if (!cnt) {
        continue;
      }
      if (vis) {
        await pline(S("%s%s %s!"), cnt === obj.quan ? S("") : cnt > 1 ? S("Some of ") : S("One of "), cnt === obj.quan ? await Yname2(obj) : await yname(obj), G.destroy_strings[dindx][cnt > 1 ? 1 : 0]);
      }
      for (i = 0; i < cnt; ++i) {
        await m_useup(mtmp, obj);
      }
    }
  }
  return tmp;
}

export async function resist(mtmp: struct_monst | null, oclass: number, damage: number, tell: number): Promise<number> {
  let resisted = 0;
  let alev = 0;
  let dlev = 0;
  if (oclass === RING_CLASS && !damage && !tell && ($sidx(mtmp.data) >= $sidx($sat(G.mons, 328)) && $sidx(mtmp.data) <= $sidx($sat(G.mons, 342)))) {
    return 1;
  }
  switch (oclass) {
  case WAND_CLASS:
    alev = 12;
    break;
  case TOOL_CLASS:
    alev = 10;
    break;
  case WEAPON_CLASS:
    alev = 10;
    break;
  case SCROLL_CLASS:
    alev = 9;
    break;
  case POTION_CLASS:
    alev = 6;
    break;
  case RING_CLASS:
    alev = 5;
    break;
  default:
    alev = G.u.ulevel;
    break;
  }
  dlev = mtmp.m_lev;
  if (dlev > 50) {
    dlev = 50;
  } else if (dlev < 1) {
    dlev = $sidx(mtmp.data) >= $sidx($sat(G.mons, 328)) && $sidx(mtmp.data) <= $sidx($sat(G.mons, 342)) ? G.u.ulevel : 1;
  }
  resisted = rn2(100 + alev - dlev) < mtmp.data.mr ? 1 : 0;
  if (resisted) {
    if (tell) {
      await shieldeff(mtmp.mx, mtmp.my);
      await pline(S("%s resists!"), await Monnam(mtmp));
    }
    damage = (damage + 1) / 2 | 0;
  }
  if (damage) {
    mtmp.mhp -= damage;
    if (mtmp.mhp < 1) {
      if (G.m_using) {
        await monkilled(mtmp, S(""), AD_RBRE);
      } else {
        await killed(mtmp);
      }
    }
  }
  return resisted;
}

async function wishcmdassist(triesleft: number): Promise<void> {
  let i = 0;
  let win = 0;
  let buf = new Int8Array(256);
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  if (!win) {
    return;
  }
  for (i = 0; i < (Math.trunc(128 / 8) | 0) - 1; ++i) {
    await G.windowprocs.win_putstr(win, 0, wishcmdassist$wishinfo[i]);
  }
  if (!G.u.uconduct.wishes) {
    await G.windowprocs.win_putstr(win, 0, P(wishcmdassist$preserve_wishless));
  }
  await G.windowprocs.win_putstr(win, 0, S(""));
  sprintf(P(buf), P(wishcmdassist$retry_info), triesleft >= 0 && triesleft < (Math.trunc(48 / 8) | 0) ? wishcmdassist$cardinals[triesleft] : P(wishcmdassist$too_many), triesleft < MAXWISHTRY ? S(" more") : S(""), triesleft === 1 ? S("") : S("s"));
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await G.windowprocs.win_putstr(win, 0, P(wishcmdassist$retry_too));
  await G.windowprocs.win_putstr(win, 0, S(""));
  if (G.iflags.cmdassist) {
    await G.windowprocs.win_putstr(win, 0, P(wishcmdassist$suppress_cmdassist));
  }
  await G.windowprocs.win_display_nhwindow(win, FALSE);
  await G.windowprocs.win_destroy_nhwindow(win);
}

export async function makewish(): Promise<void> {
  let $g = 0;
  let buf = new Int8Array(256);
  let promptbuf = new Int8Array(256);
  let otmp = null;
  let nothing = new struct_obj();
  let tries = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      promptbuf = new Int8Array(256);
      nothing = new struct_obj();
      tries = 0;
      promptbuf[0] = 0;
      nothing.$cp(G.zeroobj);
      if (G.flags.verbose) {
        await You(S("may wish for an object."));
      }
    case 1: // retry
      strcpy(P(promptbuf), S("For what do you wish"));
      if (G.iflags.cmdassist && tries > 0) {
        strcat(P(promptbuf), S(" (enter 'help' for assistance)"));
      }
      strcat(P(promptbuf), S("?"));
      await G.windowprocs.win_getlin(P(promptbuf), P(buf));
      mungspaces(P(buf));
      if (buf[0] === 27) {
        buf[0] = 0;
      } else if (!strncmpi(P(buf), S("help"), -1)) {
        await wishcmdassist(MAXWISHTRY - tries);
        buf[0] = 0;
        { $g = 1; continue $L; }
      }
      otmp = await readobjnam(P(buf), nothing);
      if (!otmp) {
        await pline(S("Nothing fitting that description exists in the game."));
        if (++tries < MAXWISHTRY) {
          { $g = 1; continue $L; }
        }
        await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
        otmp = await readobjnam(null, null);
        if (!otmp) {
          return;
        }
      } else if (otmp === nothing) {
        return;
      }
      ++G.u.uconduct.wishes;
      if (otmp !== G.zeroobj) {
        let verb = (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || G.u.uinwater | 0 ? S("slip") : S("drop");
        let oops_msg = G.u.uswallow | 0 ? S("Oops!  %s out of your reach!") : (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || $at2(G.level.locations, G.u.ux, G.u.uy).typ < IRONBARS || $at2(G.level.locations, G.u.ux, G.u.uy).typ >= ICE ? S("Oops!  %s away from you!") : S("Oops!  %s to the floor!");
        await hold_another_object(otmp, oops_msg, await The(await aobjnam(otmp, verb)), null);
        G.u.ublesscnt += rn2(100) + 50;
      }
    }
    break;
  }
}

export function $init(): void {
  obj_zapped = 0;
  poly_zapped = 0;
  are_blinded_by_the_flash = $cs("are blinded by the flash!", 26);
  G.flash_types = [S("magic missile"),
S("bolt of fire"),
S("bolt of cold"),
S("sleep ray"),
S("death ray"),
S("bolt of lightning"),
S(""),
S(""),
S(""),
S(""),
S("magic missile"),
S("fireball"),
S("cone of cold"),
S("sleep ray"),
S("finger of death"),
S("bolt of lightning"),
S(""),
S(""),
S(""),
S(""),
S("blast of missiles"),
S("blast of fire"),
S("blast of frost"),
S("blast of sleep gas"),
S("blast of disintegration"),
S("blast of lightning"),
S("blast of poison gas"),
S("blast of acid"),
S(""),
S("")];
  charged_objs = $ta(Int8Array, 4, [WAND_CLASS, WEAPON_CLASS, ARMOR_CLASS]);
  zap_syms = $ta(Int8Array, 2, [WAND_CLASS]);
  G.destroy_strings = [[S("freezes and shatters"), S("freeze and shatter"), S("shattered potion")],
[S("boils and explodes"), S("boil and explode"), S("boiling potion")],
[S("ignites and explodes"), S("ignite and explode"), S("exploding potion")],
[S("catches fire and burns"), S("catch fire and burn"), S("burning scroll")],
[S("catches fire and burns"), S(""), S("burning book")],
[S("turns to dust and vanishes"), S(""), S("")],
[S("breaks apart and explodes"), S(""), S("exploding wand")]];
  cancel_monst$writing_vanishes = $cs("Some writing vanishes from %s head!", 36);
  cancel_monst$your = $cs("your", 5);
  wishcmdassist$wishinfo = [S("Wish details:"),
S(""),
S("Enter the name of an object, such as \"potion of monster detection\","),
S("\"scroll labeled README\", \"elven mithril-coat\", or \"Grimtooth\""),
S("(without the quotes)."),
S(""),
S("For object types which come in stacks, you may specify a plural name"),
S("such as \"potions of healing\", or specify a count, such as \"1000 gold"),
S("pieces\", although that aspect of your wish might not be granted."),
S(""),
S("You may also specify various prefix values which might be used to"),
S("modify the item, such as \"uncursed\" or \"rustproof\" or \"+1\"."),
S("Most modifiers shown when viewing your inventory can be specified."),
S(""),
S("You may specify 'nothing' to explicitly decline this wish."),
null];
  wishcmdassist$preserve_wishless = $cs("Doing so will preserve 'wishless' conduct.", 43);
  wishcmdassist$retry_info = $cs("If you specify an unrecognized object name %s%s time%s,", 56);
  wishcmdassist$retry_too = $cs("a randomly chosen item will be granted.", 40);
  wishcmdassist$suppress_cmdassist = $cs("(Suppress this assistance with !cmdassist in your config file.)", 64);
  wishcmdassist$cardinals = [S("zero"),
S("one"),
S("two"),
S("three"),
S("four"),
S("five")];
  wishcmdassist$too_many = $cs("too many", 9);
}
