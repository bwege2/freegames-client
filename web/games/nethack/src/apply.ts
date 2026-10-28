// @ts-nocheck
// NetHack 3.6.7 apply.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { arti_speak, retouch_object } from './artifact.ts';
import { acurr, adjattrib, change_luck } from './attrib.ts';
import { bot } from './botl.ts';
import { confdir, get_adjacent_loc, getdir, isok, paranoid_query, set_occupation, yn_function } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { cvt_sdoor_to_door, findit, openit, use_crystal_ball } from './detect.ts';
import { buried_ball_to_freedom, dig_check, digactualhole, fillholetyp, liquid_flow, use_pick_axe, watch_dig } from './dig.ts';
import { feel_newsym, glyph_at, map_invisible, map_object, newsym, tmp_at, unmap_invisible } from './display.ts';
import { dropx, obj_no_longer_held, revive_corpse, set_wounded_legs } from './do.ts';
import { Monnam, a_monnam, getpos, getpos_sethilite, hcolor, hliquid, l_monnam, m_monnam, mon_nam, noit_mon_nam, x_monnam } from './do_name.ts';
import { Blindf_off, Blindf_on, cursed, fingers_or_gloves, inaccessible_equipment } from './do_wear.ts';
import { make_familiar } from './dog.ts';
import { hurtle, hurtle_jump, thitmonst, walk_path } from './dothrow.ts';
import { Can_dig_down, On_stairs, on_level } from './dungeon.ts';
import { floorfood, morehungry, set_tin_variety, use_tin_opener } from './eat.ts';
import { panic } from './end.ts';
import { can_reach_floor, cant_reach_floor, ceiling, freehand, surface, u_wipe_engr } from './engrave.ts';
import { explode } from './explode.ts';
import { debugcore } from './files.ts';
import { check_capacity, in_rooms, invocation_pos, losehp, may_passwall, near_capacity, nomul, obj_to_any, overexertion, spoteffects } from './hack.ts';
import { dist2, highc, isqrt, s_suffix, sgn, strstri, upstart } from './hacklib.ts';
import { addinv, carrying, consume_obj_charge, delobj, freeinv, getobj, hold_another_object, nxtobj, prinv, sobj_at, stackobj, update_inventory, useup, useupall, useupf } from './invent.ts';
import { obj_merge_light_sources } from './light.ts';
import { pick_lock } from './lock.ts';
import { bagotricks, makemon, mkclass } from './makemon.ts';
import { paralyze_monst } from './mhitm.ts';
import { gulp_blnd_check } from './mhitu.ts';
import { bill_dummy_object, costly_alteration, get_mtraits, hornoplenty, init_dummyobj, mksobj, obj_extract_self, place_object, set_bknown, splitobj, unbless, weight } from './mkobj.ts';
import { mkundead } from './mkroom.ts';
import { killed, mnexto, seemimic, wake_nearby, wake_nearto, wakeup, xkilled } from './mon.ts';
import { attacktype_fordmg, can_blnd, can_blow, locomotion, poly_when_stoned, pronoun_gender } from './mondata.ts';
import { closed_door, monflee } from './monmove.ts';
import { mon_reflects } from './muse.ts';
import { do_play_instrument } from './music.ts';
import { discover_object } from './o_init.ts';
import { The, Tobjnam, Yname2, Yobjnam2, an, cxname, doname, gloves_simple_name, makeplural, otense, safe_qbuf, simple_typename, simpleonames, singular, the, thesimpleoname, vtense, xname, yname, ysimple_name } from './objnam.ts';
import { pickup_object, use_container } from './pickup.ts';
import { There, You, You_cant, You_feel, You_hear, You_see, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart, poly_gender, polymon } from './polyself.ts';
import { djinni_from_bottle, make_blinded, make_confused, make_deaf, make_glib, make_hallucinated, make_sick, make_stunned, make_vomiting } from './potion.ts';
import { mstatusline, ustatusline } from './priest.ts';
import { litroom, unpunish } from './read.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { Shk_Your, add_damage, check_unpaid, check_unpaid_usage, costly_spot, obfree, pay_for_damage, shk_your } from './shk.ts';
import { growl, whimper, yelp } from './sounds.ts';
import { spelleffects } from './spell.ts';
import { mpickobj } from './steal.ts';
import { kick_steed, stucksteed, use_saddle } from './steed.ts';
import { enexto, rloc, rloc_to, tele_restrict, teleds } from './teleport.ts';
import { begin_burn, end_burn, obj_has_timer, start_timer, stop_timer } from './timeout.ts';
import { activate_statue_trap, deltrap, dotrap, feeltrap, fill_pit, instapetrify, maketrap, mintrap, reset_utrap, sokoban_guilt, t_at } from './trap.ts';
import { attack, attack_checks, check_caitiff, flash_hits_mon, stumble_onto_mimic } from './uhitm.ts';
import { vault_summon_gd } from './vault.ts';
import { howmonseen, unblock_point } from './vision.ts';
import { dbon, dry_a_towel, possibly_unwield, setmnotwielded, uwep_skill_type } from './weapon.ts';
import { mwelded, wield_tool } from './wield.ts';
import { mon_has_amulet } from './wizard.ts';
import { worm_known } from './worm.ts';
import { mon_adjust_speed, setnotworn } from './worn.ts';
import { dowrite } from './write.ts';
import { bhit, bhitm, bhito, bhitpile, get_obj_location, obj_resists, zappable, zapsetup, zapwrapup, zapyourself } from './zap.ts';
import { struct_monst, struct_nhcoord, struct_obj, struct_trapinfo, union_any } from './structs.ts';
import { $at2, $cs, $rd, $sat, $ta, $wr, G, P, S, free, sprintf, strcat, strcmp, strcpy } from './rt/index.ts';
import { AD_BLND, AIR, ALLOW_NONE, ALL_CLASSES, ALTAR, ARMOR_CLASS, ARM_BOOTS, ARM_GLOVES, ARTICLE_A, ATR_NONE, AT_ENGL, AT_WEAP, A_CHA, A_CON, A_DEX, A_MAX, A_STR, BEAR_TRAP, BELL_OF_OPENING, BLINDED, BLINDFOLD, BOTH_SIDES, BOULDER, BRASS_LANTERN, CANDELABRUM_OF_INVOCATION, CLOTH, CLOUD, COIN_CLASS, COLNO, CONFLICT, CONFUSION, CORPSE, CORR, COST_DSTROY, COST_SPLAT, CREAM_PIE, DBWALL, DEAF, DETECT_MONSTERS, DISP_BEAM, DISP_END, DOOR, D_ISOPEN, EUCALYPTUS_LEAF, EXPL_FIERY, EXPL_FROSTY, EXPL_MAGICAL, EXPL_MAX, FACE, FALSE, FIG_TRANSFORM, FIXED_ABIL, FLASHED_LIGHT, FOOD_CLASS, FOOT, FORCEBUNGLE, FREE_ACTION, FUMBLING, GEMSTONE, GEM_CLASS, GLASS, GLIB, GOLD, G_GONE, HALF_PHDAM, HALLUC, HALLUC_RES, HAND, HEAD, HOLE, HOMEMADE_TIN, INFRAVISION, INTRINSIC, INVIS, INVIS_BEAM, JUMPING, KILLED_BY, LANDMINE, LAND_MINE, LEASH, LEATHER, LEFT_SIDE, LEG, LENSES, LEVITATION, LIQUID, MAGIC_LAMP, MAXLEASHED, MAXPCHARS, MAXSPELL, MAXULEV, MENU_UNSELECTED, MINERAL, MONSEEN_INFRAVIS, MS_SILENT, MZ_TINY, M_AP_FURNITURE, M_AP_MONSTER, M_AP_NOTHING, M_AP_OBJECT, NHW_MENU, NON_PM, NOSE, NO_GLYPH, NO_KILLER_PREFIX, NO_MINVENT, NO_MM_FLAGS, NO_SPELL, OBJ_INVENT, OBJ_MINVENT, OIL_LAMP, PASSES_WALLS, PICK_ONE, PIT, PM_FLOATING_EYE, PM_HORSE, PM_INCUBUS, PM_LONG_WORM, PM_MEDUSA, PM_MOUNTAIN_NYMPH, PM_STONE_GOLEM, PM_SUCCUBUS, PM_UMBER_HULK, PM_WATER_NYMPH, PM_WOOD_NYMPH, POOL, POTION_CLASS, POT_OIL, PROT_FROM_SHAPE_CHANGERS, P_AXE, P_BASIC, P_LANCE, P_NONE, P_PICK_AXE, P_POLEARMS, P_RIDING, P_SKILLED, RANDOM_CLASS, REVIVE_MON, RIGHT_SIDE, RING_CLASS, ROOM, SCORR, SDOOR, SEENMON, SEE_INVIS, SHOPBASE, SICK, SICK_ALL, SICK_NONVOMITABLE, SILVER, SLIMED, SLIME_MOLD, SPE_JUMPING, STAIRS, STATUE, STATUE_TRAP, STOMACH, STONE, STONED, STONE_RES, STRANGLED, STUNNED, SUPPRESS_INVISIBLE, SUPPRESS_IT, S_EEL, S_GHOST, S_MIMIC, S_NYMPH, S_UNICORN, S_VAMPIRE, S_VORTEX, S_arrow_trap, S_goodpos, TELEPAT, TIMEOUT, TIMER_OBJECT, TIN, TOOL_CLASS, TOUCHSTONE, TOWEL, TRAPNUM, TREE, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, TT_WEB, UNENCUMBERED, VOMITING, WAND_CLASS, WAN_CREATE_MONSTER, WAN_DIGGING, WAN_LIGHT, WARN_OF_MON, WAX, WEAK, WEAPON_CLASS, WOOD, WOUNDED_LEGS, XKILL_NOMSG, jAny, jDiag, jHorz, jVert } from './consts.ts';

let no_elbow_room: any;
let hollow_str: any;
let whistle_str: any;
let alt_whistle_str: any;
let look_str: any;
let cuddly: any;
let jumping_is_magic: number;
let lubricables: any;
let trapinfo: struct_trapinfo;
let not_enough_room: any;
let where_to_hit: any;
let cant_see_spot: any;
let cant_reach: any;
let polearm_range_min: number;
let polearm_range_max: number;
let tools: any;
let use_tinning_kit$you_buy_it: any;
let use_stone$scritch: any;
let use_stone$allowall: any;
let use_stone$coins_gems: any;
let do_break_wand$nothing_else_happens: any;

async function use_camera(obj$: struct_obj | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  let mtmp = null;
  if (G.u.uinwater) {
    await pline(S("Using your camera underwater would void the warranty."));
    return 0;
  }
  if (!await getdir(null)) {
    return 0;
  }
  if (obj[0].spe <= 0) {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
    return 1;
  }
  await consume_obj_charge(obj[0], TRUE);
  if (obj[0].cursed | 0 && !rn2(2)) {
    await zapyourself(obj[0], TRUE);
  } else if (G.u.uswallow) {
    await You(S("take a picture of %s %s."), s_suffix(await mon_nam(G.u.ustuck)), mbodypart(G.u.ustuck, STOMACH));
  } else if (G.u.dz) {
    await You(S("take a picture of the %s."), G.u.dz > 0 ? surface(G.u.ux, G.u.uy) : ceiling(G.u.ux, G.u.uy));
  } else if (!G.u.dx && !G.u.dy) {
    await zapyourself(obj[0], TRUE);
  } else if (!!(mtmp = await bhit(G.u.dx, G.u.dy, COLNO, FLASHED_LIGHT, null, null, P(obj, 0)))) {
    obj[0].ox = G.u.ux, obj[0].oy = G.u.uy;
    await flash_hits_mon(mtmp, obj[0]);
  }
  return 1;
}

async function use_towel(obj: struct_obj | null): Promise<number> {
  let $t1: any;
  let drying_feedback = (obj === G.uwep ? 1 : 0) << 24 >> 24;
  if (!freehand()) {
    await You(S("have no free %s!"), body_part(HAND));
    return 0;
  } else if (obj === G.ublindf) {
    await You(S("cannot use it while you're wearing it!"));
    return 0;
  } else if (obj.cursed) {
    let old = 0;
    switch (rn2(3)) {
    case 2:
      old = G.u.uprops[GLIB].intrinsic & TIMEOUT;
      make_glib((old | 0) + (rn2(10) + 3));
      await Your(S("%s %s!"), await makeplural(body_part(HAND)), old ? S("are filthier than ever") : S("get slimy"));
      if (obj.otyp === 209 && obj.spe > 0) {
        await dry_a_towel(obj, -1, drying_feedback);
      }
      return 1;
    case 1:
      if (!G.ublindf) {
        old = G.u.ucreamed;
        G.u.ucreamed = G.u.ucreamed + (rn2(10) + 3 >>> 0) >>> 0;
        await pline(S("Yecch!  Your %s %s gunk on it!"), body_part(FACE), old ? S("has more") : S("now has"));
        await make_blinded(G.u.uprops[BLINDED].intrinsic + G.u.ucreamed - old, TRUE);
      } else {
        let what = null;
        what = G.ublindf.otyp === LENSES ? S("lenses") : obj.otyp === G.ublindf.otyp ? S("other towel") : S("blindfold");
        if (G.ublindf.cursed) {
          await You(S("push your %s %s."), what, rn2(2) ? S("cock-eyed") : S("crooked"));
        } else {
          let saved_ublindf = G.ublindf;
          await You(S("push your %s off."), what);
          await Blindf_off(G.ublindf);
          await dropx(saved_ublindf);
        }
      }
      if (obj.otyp === 209 && obj.spe > 0) {
        await dry_a_towel(obj, -1, drying_feedback);
      }
      return 1;
    case 0:
      break;
    }
  }
  if (G.u.uprops[GLIB].intrinsic) {
    make_glib(0);
    await You(S("wipe off your %s."), !G.uarmg ? await makeplural(body_part(HAND)) : gloves_simple_name(G.uarmg));
    if (obj.otyp === 209 && obj.spe > 0) {
      await dry_a_towel(obj, -1, drying_feedback);
    }
    return 1;
  } else if (G.u.ucreamed) {
    ($t1 = G.u.uprops[BLINDED], $t1.intrinsic = $t1.intrinsic - G.u.ucreamed);
    G.u.ucreamed = 0;
    if (!G.u.uprops[BLINDED].intrinsic) {
      await pline(S("You've got the glop off."));
      if (!await gulp_blnd_check()) {
        G.u.uprops[BLINDED].intrinsic = 1;
        await make_blinded(0, TRUE);
      }
    } else {
      await Your(S("%s feels clean now."), body_part(FACE));
    }
    if (obj.otyp === 209 && obj.spe > 0) {
      await dry_a_towel(obj, -1, drying_feedback);
    }
    return 1;
  }
  await Your(S("%s and %s are already clean."), body_part(FACE), await makeplural(body_part(HAND)));
  return 0;
}

async function its_dead(rx: number, ry: number, resp: Ptr | null): Promise<number> {
  let buf = new Int8Array(256);
  let more_corpses = 0;
  let mptr = null;
  let corpse = sobj_at(CORPSE, rx, ry);
  let statue = sobj_at(STATUE, rx, ry);
  if (!can_reach_floor(TRUE)) {
    corpse = null;
    while (statue && G.mons[statue.corpsenm].msize === MZ_TINY) {
      statue = nxtobj(statue, STATUE, TRUE);
    }
  }
  if (corpse && statue) {
    if (nxtobj(statue, CORPSE, TRUE) === corpse) {
      corpse = null;
    } else {
      statue = null;
    }
  }
  more_corpses = (corpse && nxtobj(corpse, CORPSE, TRUE) ? 1 : 0) << 24 >> 24;
  if (!corpse && !statue) {
    ;
  } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    if (!corpse) {
      strcpy(P(buf), S("You're both stoned"));
    } else if (corpse.quan === 1 && !more_corpses) {
      let gndr = 2;
      let mtmp = await get_mtraits(corpse, FALSE);
      if (mtmp) {
        mptr = mtmp.data = $sat(G.mons, mtmp.mnum);
        gndr = pronoun_gender(mtmp, TRUE);
      } else {
        mptr = $sat(G.mons, corpse.corpsenm);
        if ((mptr.mflags2 & 131072) >>> 0 !== 0) {
          gndr = 1;
        } else if ((mptr.mflags2 & 65536) >>> 0 !== 0) {
          gndr = 0;
        }
      }
      sprintf(P(buf), S("%s's dead"), G.genders[gndr].he);
      buf[0] = highc(buf[0]);
    } else {
      strcpy(P(buf), S("They're dead"));
    }
    await You_hear(S("a voice say, \"%s, Jim.\""), P(buf));
    resp.a[resp.o] = 1;
    return TRUE;
  } else if (corpse) {
    let here = (rx === G.u.ux && ry === G.u.uy ? 1 : 0) << 24 >> 24;
    let one = (corpse.quan === 1 && !more_corpses ? 1 : 0) << 24 >> 24;
    let reviver = FALSE;
    let visglyph = 0;
    let corpseglyph = 0;
    visglyph = glyph_at(rx, ry);
    corpseglyph = corpse.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(382) + 0 : corpse.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2(454 - 1) + 1) === 240 ? rn2(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : corpse.otyp === 240 ? corpse.corpsenm + (382 + (1 + (382 + (382 + 0)))) : corpse.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0))))));
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && visglyph !== corpseglyph) {
      await map_object(corpse, TRUE);
    }
    if (G.urole.malenum === 332) {
      do {
        if (obj_has_timer(corpse, REVIVE_MON)) {
          reviver = TRUE;
        } else {
          corpse = nxtobj(corpse, CORPSE, TRUE);
        }
      } while (corpse && !reviver);
    }
    await You(S("determine that %s unfortunate being%s %s%s dead."), one ? here ? S("this") : S("that") : here ? S("these") : S("those"), one ? S("") : S("s"), one ? S("is") : S("are"), reviver ? S(" mostly") : S(""));
    return TRUE;
  } else {
    let what = null;
    let how = null;
    mptr = $sat(G.mons, statue.corpsenm);
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      sprintf(P(buf), S("%s %s"), rx === G.u.ux && ry === G.u.uy ? S("This") : S("That"), (mptr.mflags1 & 131072) >>> 0 !== 0 ? S("person") : S("creature"));
      what = P(buf);
    } else {
      what = mptr.mname;
      if (!((mptr.mflags2 & 524288) >>> 0 !== 0)) {
        what = await The(what);
      }
    }
    how = S("fine");
    if (G.urole.malenum === 332) {
      let ttmp = t_at(rx, ry);
      if (ttmp && (ttmp.ttyp | 0) === STATUE_TRAP) {
        how = S("extraordinary");
      } else if (!!statue.cobj) {
        how = S("remarkable");
      }
    }
    await pline(S("%s is in %s health for a statue."), what, how);
    return TRUE;
  }
  return FALSE;
}

async function use_stethoscope(obj: struct_obj | null): Promise<number> {
  let mtmp = null;
  let lev = null;
  let rx = 0;
  let ry = 0;
  const res = new Int32Array(1);
  let interference = (G.u.uswallow | 0 && (G.u.ustuck.data.mlet === S_VORTEX || G.u.ustuck.data === $sat(G.mons, 151)) && !rn2(G.urole.malenum === 332 ? 10 : 3) ? 1 : 0) << 24 >> 24;
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You(S("have no hands!"));
    return 0;
  } else if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    await You_cant(S("hear anything!"));
    return 0;
  } else if (!freehand()) {
    await You(S("have no free %s."), body_part(HAND));
    return 0;
  }
  if (!await getdir(null)) {
    return 0;
  }
  res[0] = G.moves === G.context.stethoscope_move && G.youmonst.movement === G.context.stethoscope_movement ? 1 : 0;
  G.context.stethoscope_move = G.moves;
  G.context.stethoscope_movement = G.youmonst.movement;
  G.bhitpos.x = G.u.ux, G.bhitpos.y = G.u.uy;
  G.notonhead = G.u.uswallow << 24 >> 24;
  if (G.u.usteed && G.u.dz > 0) {
    if (interference) {
      await pline(S("%s interferes."), await Monnam(G.u.ustuck));
      await mstatusline(G.u.ustuck);
    } else {
      await mstatusline(G.u.usteed);
    }
    return res[0];
  } else if (G.u.uswallow | 0 && (G.u.dx || G.u.dy || G.u.dz)) {
    await mstatusline(G.u.ustuck);
    return res[0];
  } else if (G.u.uswallow | 0 && interference) {
    await pline(S("%s interferes."), await Monnam(G.u.ustuck));
    await mstatusline(G.u.ustuck);
    return res[0];
  } else if (G.u.dz) {
    if (G.u.uinwater) {
      await You_hear(S("faint splashing."));
    } else if (G.u.dz < 0 || !can_reach_floor(TRUE)) {
      await cant_reach_floor(G.u.ux, G.u.uy, G.u.dz < 0 ? 1 : 0, TRUE);
    } else if (await its_dead(G.u.ux, G.u.uy, P(res, 0))) {
      ;
    } else if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
      await You_hear(S("the crackling of hellfire."));
    } else {
      await pline_The(S("%s seems healthy enough."), surface(G.u.ux, G.u.uy));
    }
    return res[0];
  } else if (obj.cursed | 0 && !rn2(2)) {
    await You_hear(S("your heart beat."));
    return res[0];
  }
  if (G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic && !rn2(5)) {
    confdir();
  }
  if (!G.u.dx && !G.u.dy) {
    await ustatusline();
    return res[0];
  }
  rx = G.u.ux + G.u.dx;
  ry = G.u.uy + G.u.dy;
  if (!isok(rx, ry)) {
    await You_hear(S("a faint typing noise."));
    return 0;
  }
  if (!!(mtmp = !!G.level.monsters[rx][ry] ? G.level.monsters[rx][ry] : null)) {
    let mnm = await x_monnam(mtmp, ARTICLE_A, null, SUPPRESS_IT | SUPPRESS_INVISIBLE, FALSE);
    G.bhitpos.x = rx << 24 >> 24, G.bhitpos.y = ry << 24 >> 24;
    G.notonhead = (mtmp.mx !== rx || mtmp.my !== ry ? 1 : 0) << 24 >> 24;
    if (mtmp.mundetected) {
      if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        await There(S("is %s hidden there."), mnm);
      }
      mtmp.mundetected = 0;
      await newsym(mtmp.mx, mtmp.my);
    } else if (mtmp.mappearance) {
      let what = S("thing");
      let use_plural = FALSE;
      let dummyobj = new struct_obj();
      let odummy = null;
      switch (mtmp.m_ap_type & 7) {
      case M_AP_OBJECT:
        odummy = init_dummyobj(dummyobj, mtmp.mappearance | 0, 1);
        if (odummy.otyp === SLIME_MOLD && (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1) && mtmp.mextra.mcorpsenm !== NON_PM) {
          odummy.spe = mtmp.mextra.mcorpsenm << 24 >> 24;
          what = await simpleonames(odummy);
        } else {
          what = await simple_typename(odummy.otyp);
        }
        use_plural = (odummy.oclass === ARMOR_CLASS && G.objects[odummy.otyp].oc_subtyp === ARM_BOOTS || odummy.oclass === ARMOR_CLASS && G.objects[odummy.otyp].oc_subtyp === ARM_GLOVES || odummy.otyp === LENSES ? 1 : 0) << 24 >> 24;
        break;
      case M_AP_MONSTER:
        what = G.mons[mtmp.mappearance].mname;
        break;
      case M_AP_FURNITURE:
        what = G.defsyms[mtmp.mappearance].explanation;
        break;
      }
      await seemimic(mtmp);
      await pline(S("%s %s %s really %s."), use_plural ? S("Those") : S("That"), what, use_plural ? S("are") : S("is"), mnm);
    } else if (G.flags.verbose && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await There(S("is %s there."), mnm);
    }
    await mstatusline(mtmp);
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(rx, ry);
    }
    return res[0];
  }
  if (await unmap_invisible(rx, ry)) {
    await pline_The(S("invisible monster must have moved."));
  }
  lev = $sat(G.level.locations[rx], ry);
  switch (lev.typ) {
  case SDOOR:
    await You_hear(P(hollow_str), S("door"));
    cvt_sdoor_to_door(lev);
    await feel_newsym(rx, ry);
    return res[0];
  case SCORR:
    await You_hear(P(hollow_str), S("passage"));
    lev.typ = CORR, lev.flags = 0;
    unblock_point(rx, ry);
    await feel_newsym(rx, ry);
    return res[0];
  }
  if (!await its_dead(rx, ry, P(res, 0))) {
    await You(S("hear nothing special."));
  }
  return res[0];
}

async function use_whistle(obj: struct_obj | null): Promise<void> {
  if (!can_blow(G.youmonst)) {
    await You(S("are incapable of using the whistle."));
  } else if (G.u.uinwater) {
    await You(S("blow bubbles through %s."), await yname(obj));
  } else {
    if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
      await You_feel(S("rushing air tickle your %s."), body_part(NOSE));
    } else {
      await You(P(whistle_str), obj.cursed | 0 ? S("shrill") : S("high"));
    }
    wake_nearby();
    if (obj.cursed) {
      vault_summon_gd();
    }
  }
}

async function use_magic_whistle(obj: struct_obj | null): Promise<void> {
  let mtmp = null;
  let nextmon = null;
  if (!can_blow(G.youmonst)) {
    await You(S("are incapable of using the whistle."));
  } else if (obj.cursed | 0 && !rn2(2)) {
    await You(S("produce a %shigh-%s."), G.u.uinwater | 0 ? S("very ") : S(""), G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("frequency vibration") : S("pitched humming noise"));
    wake_nearby();
  } else {
    let pet_cnt = 0;
    let omx = 0;
    let omy = 0;
    await You(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? P(alt_whistle_str) : P(whistle_str), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : G.u.uinwater | 0 && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("strange, high-pitched") : S("strange"));
    for (mtmp = G.level.monlist; mtmp; mtmp = nextmon) {
      nextmon = mtmp.nmon;
      if (mtmp.mhp < 1) {
        continue;
      }
      if (mtmp === G.u.usteed) {
        continue;
      }
      if (mtmp.mtame) {
        if (mtmp.mtrapped) {
          mtmp.mtrapped = 0;
          await fill_pit(mtmp.mx, mtmp.my);
        }
        if (mtmp.m_ap_type & 7) {
          await seemimic(mtmp);
        }
        omx = mtmp.mx, omy = mtmp.my;
        await mnexto(mtmp);
        if (mtmp.mx !== omx || mtmp.my !== omy) {
          mtmp.mundetected = 0;
          if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
            ++pet_cnt;
          }
          if (await mintrap(mtmp) === 2) {
            change_luck(-1);
          }
        }
      }
    }
    if (pet_cnt > 0) {
      await discover_object(obj.otyp, 1, 1);
    }
  }
}

export function um_dist(x: number, y: number, n: number): number {
  return (Math.abs(G.u.ux - x) > n || Math.abs(G.u.uy - y) > n ? 1 : 0) << 24 >> 24;
}

export function number_leashed(): number {
  let i = 0;
  let obj = null;
  for (obj = G.invent; obj; obj = obj.nobj) {
    if (obj.otyp === LEASH && obj.corpsenm !== 0) {
      ++i;
    }
  }
  return i;
}

export function o_unleash(otmp: struct_obj | null): void {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.m_id === otmp.corpsenm >>> 0) {
      mtmp.mleashed = 0;
    }
  }
  otmp.corpsenm = 0;
}

export async function m_unleash(mtmp: struct_monst | null, feedback: number): Promise<void> {
  let otmp = null;
  if (feedback) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline(S("%s pulls free of %s leash!"), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his);
    } else {
      await Your(S("leash falls slack."));
    }
  }
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === LEASH && otmp.corpsenm === (mtmp.m_id | 0)) {
      otmp.corpsenm = 0;
      update_inventory();
    }
  }
  mtmp.mleashed = 0;
}

export function unleash_all(): void {
  let otmp = null;
  let mtmp = null;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === LEASH) {
      otmp.corpsenm = 0;
    }
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    mtmp.mleashed = 0;
  }
}

export function leashable(mtmp: struct_monst | null): number {
  return (mtmp.mnum !== PM_LONG_WORM && !((mtmp.data.mflags1 & 1048576) >>> 0 !== 0) && (!((mtmp.data.mflags1 & 24576) >>> 0 === 24576) || (mtmp.data.mflags1 & 32768) >>> 0 === 0) ? 1 : 0) << 24 >> 24;
}

async function use_leash(obj: struct_obj | null): Promise<number> {
  let $g = 0;
  let cc = new struct_nhcoord();
  let mtmp = null;
  let spotmon = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      cc = new struct_nhcoord();
      if (G.u.uswallow) {
        await You_cant(!obj.corpsenm ? S("leash %s from inside.") : obj.corpsenm === (G.u.ustuck.m_id | 0) ? S("unleash %s from inside.") : S("unleash anything from inside %s."), await noit_mon_nam(G.u.ustuck));
        return 0;
      }
      if (!obj.corpsenm && number_leashed() >= MAXLEASHED) {
        await You(S("cannot leash any more pets."));
        return 0;
      }
      if (!await get_adjacent_loc(null, null, G.u.ux, G.u.uy, cc)) {
        return 0;
      }
      if (cc.x === G.u.ux && cc.y === G.u.uy) {
        if (G.u.usteed && G.u.dz > 0) {
          mtmp = G.u.usteed;
          spotmon = 1;
          { $g = 1; continue $L; }
        }
        await pline(S("Leash yourself?  Very funny..."));
        return 0;
      }
      if (!(mtmp = !!G.level.monsters[cc.x][cc.y] ? G.level.monsters[cc.x][cc.y] : null)) {
        await There(S("is no creature there."));
        await unmap_invisible(cc.x, cc.y);
        return 1;
      }
      spotmon = (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? 1 : 0;
    case 1: // got_target
      if (!spotmon && !($at2(G.level.locations, cc.x, cc.y).glyph === 382 + (382 + 0))) {
        await You(S("fail to %sleash something."), obj.corpsenm ? S("un") : S(""));
        await map_invisible(cc.x, cc.y);
      } else if (!mtmp.mtame) {
        await pline(S("%s %s leashed!"), await Monnam(mtmp), !obj.corpsenm ? S("cannot be") : S("is not"));
      } else if (!obj.corpsenm) {
        if (mtmp.mleashed) {
          await pline(S("This %s is already leashed."), spotmon ? await l_monnam(mtmp) : S("creature"));
        } else if ((mtmp.data.mflags1 & 1048576) >>> 0 !== 0) {
          await pline(S("The leash would just fall off."));
        } else if ((mtmp.data.mflags1 & 24576) >>> 0 === 24576 && !((mtmp.data.mflags1 & 32768) >>> 0 === 0)) {
          await pline(S("%s has no extremities the leash would fit."), await Monnam(mtmp));
        } else if (!leashable(mtmp)) {
          await pline(S("The leash won't fit onto %s%s."), spotmon ? S("your ") : S(""), await l_monnam(mtmp));
        } else {
          await You(S("slip the leash around %s%s."), spotmon ? S("your ") : S(""), await l_monnam(mtmp));
          mtmp.mleashed = 1;
          obj.corpsenm = mtmp.m_id | 0;
          mtmp.msleeping = 0;
        }
      } else {
        if (obj.corpsenm !== (mtmp.m_id | 0)) {
          await pline(S("This leash is not attached to that creature."));
        } else if (obj.cursed) {
          await pline_The(S("leash would not come off!"));
          set_bknown(obj, 1);
        } else {
          mtmp.mleashed = 0;
          obj.corpsenm = 0;
          await You(S("remove the leash from %s%s."), spotmon ? S("your ") : S(""), await l_monnam(mtmp));
        }
      }
      return 1;
    }
    break;
  }
}

export function get_mleash(mtmp: struct_monst | null): struct_obj | null {
  let otmp = null;
  otmp = G.invent;
  while (otmp) {
    if (otmp.otyp === LEASH && otmp.corpsenm === (mtmp.m_id | 0)) {
      return otmp;
    }
    otmp = otmp.nobj;
  }
  return null;
}

export async function next_to_u(): Promise<number> {
  let mtmp = null;
  let otmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.mleashed) {
      if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
        await mnexto(mtmp);
      }
      if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
        for (otmp = G.invent; otmp; otmp = otmp.nobj) {
          if (otmp.otyp === LEASH && otmp.corpsenm === (mtmp.m_id | 0)) {
            if (otmp.cursed) {
              return FALSE;
            }
            await You_feel(S("%s leash go slack."), number_leashed() > 1 ? S("a") : S("the"));
            mtmp.mleashed = 0;
            otmp.corpsenm = 0;
          }
        }
      }
    }
  }
  if (G.u.usteed && mon_has_amulet(G.u.usteed)) {
    return FALSE;
  }
  return TRUE;
}

export async function check_leash(x: number, y: number): Promise<void> {
  let otmp = null;
  let mtmp = null;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp !== LEASH || otmp.corpsenm === 0) {
      continue;
    }
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if ((mtmp.m_id | 0) === otmp.corpsenm) {
        break;
      }
    }
    if (!mtmp) {
      await impossible(S("leash in use isn't attached to anything?"));
      otmp.corpsenm = 0;
      continue;
    }
    if (dist2(G.u.ux, G.u.uy, mtmp.mx, mtmp.my) > dist2(x, y, mtmp.mx, mtmp.my)) {
      if (!um_dist(mtmp.mx, mtmp.my, 3)) {
        ;
      } else if (otmp.cursed | 0 && !((mtmp.data.mflags1 & 1024) >>> 0 !== 0)) {
        if (um_dist(mtmp.mx, mtmp.my, 5) || (mtmp.mhp -= rnd(2)) <= 0) {
          let save_pacifism = G.u.uconduct.killer;
          await Your(S("leash chokes %s to death!"), await mon_nam(mtmp));
          await xkilled(mtmp, XKILL_NOMSG);
          if (!(mtmp.mhp < 1)) {
            G.u.uconduct.killer = save_pacifism;
          }
        } else {
          await pline(S("%s is choked by the leash!"), await Monnam(mtmp));
          if (mtmp.mtame && rn2(mtmp.mtame)) {
            mtmp.mtame = mtmp.mtame - 1 << 24 >> 24;
          }
        }
      } else {
        if (um_dist(mtmp.mx, mtmp.my, 5)) {
          await pline(S("%s leash snaps loose!"), s_suffix(await Monnam(mtmp)));
          await m_unleash(mtmp, FALSE);
        } else {
          await You(S("pull on the leash."));
          if (mtmp.data.msound !== MS_SILENT) {
            switch (rn2(3)) {
            case 0:
              await growl(mtmp);
              break;
            case 1:
              await yelp(mtmp);
              break;
            default:
              await whimper(mtmp);
              break;
            }
          }
        }
      }
    }
  }
}

export function beautiful(): Ptr | null {
  return acurr(A_CHA) > 14 ? poly_gender() === 1 ? S("beautiful") : S("handsome") : S("ugly");
}

async function use_mirror(obj$: struct_obj | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  let mirror = null;
  let uvisage = null;
  let mtmp = null;
  let how_seen = 0;
  let mlet = 0;
  let vis = 0;
  let invis_mirror = 0;
  let useeit = 0;
  let monable = 0;
  if (!await getdir(null)) {
    return 0;
  }
  invis_mirror = ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked ? 1 : 0) << 24 >> 24;
  useeit = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (!invis_mirror || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) ? 1 : 0) << 24 >> 24;
  uvisage = beautiful();
  mirror = await simpleonames(obj[0]);
  if (obj[0].cursed | 0 && !rn2(2)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline_The(S("%s fogs up and doesn't reflect!"), mirror);
    }
    return 1;
  }
  if (!G.u.dx && !G.u.dy && !G.u.dz) {
    if (!useeit) {
      await You_cant(S("see your %s %s."), uvisage, body_part(FACE));
    } else {
      if (G.u.umonnum === PM_FLOATING_EYE) {
        if (G.u.uprops[FREE_ACTION].extrinsic) {
          await You(S("stiffen momentarily under your gaze."));
        } else {
          if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
            await pline(S("Yow!  The %s stares back!"), mirror);
          } else {
            await pline(S("Yikes!  You've frozen yourself!"));
          }
          if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) || !rn2(4)) {
            nomul(-rnd(MAXULEV + 6 - G.u.ulevel));
            G.multi_reason = S("gazing into a mirror");
          }
          G.nomovemsg = null;
        }
      } else if (G.youmonst.data.mlet === S_VAMPIRE) {
        await You(S("don't have a reflection."));
      } else if (G.u.umonnum === PM_UMBER_HULK) {
        await pline(S("Huh?  That doesn't look like you!"));
        await make_confused(G.u.uprops[CONFUSION].intrinsic + d(3, 4), FALSE);
      } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await You(P(look_str), hcolor(null));
      } else if (G.u.uprops[SICK].intrinsic) {
        await You(P(look_str), S("peaked"));
      } else if (G.u.uhs >= WEAK) {
        await You(P(look_str), S("undernourished"));
      } else {
        await You(S("look as %s as ever."), uvisage);
      }
    }
    return 1;
  }
  if (G.u.uswallow) {
    if (useeit) {
      await You(S("reflect %s %s."), s_suffix(await mon_nam(G.u.ustuck)), mbodypart(G.u.ustuck, STOMACH));
    }
    return 1;
  }
  if (G.u.uinwater) {
    if (useeit) {
      await You(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("give the fish a chance to fix their makeup.") : S("reflect the murky water."));
    }
    return 1;
  }
  if (G.u.dz) {
    if (useeit) {
      await You(S("reflect the %s."), G.u.dz > 0 ? surface(G.u.ux, G.u.uy) : ceiling(G.u.ux, G.u.uy));
    }
    return 1;
  }
  mtmp = await bhit(G.u.dx, G.u.dy, COLNO, INVIS_BEAM, null, null, P(obj, 0));
  if (!mtmp || !((mtmp.data.mflags1 & 4096) >>> 0 === 0) || G.notonhead) {
    return 1;
  }
  vis = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
  how_seen = vis ? howmonseen(mtmp) : 0;
  monable = (!mtmp.mcan && (!mtmp.minvis || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
  mlet = mtmp.data.mlet;
  if (mtmp.msleeping) {
    if (vis) {
      await pline(S("%s is too tired to look at your %s."), await Monnam(mtmp), mirror);
    }
  } else if (!mtmp.mcansee) {
    if (vis) {
      await pline(S("%s can't see anything right now."), await Monnam(mtmp));
    }
  } else if (invis_mirror && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0)) {
    if (vis) {
      await pline(S("%s fails to notice your %s."), await Monnam(mtmp), mirror);
    }
  } else if ((how_seen & SEENMON) >>> 0 === MONSEEN_INFRAVIS) {
    if (vis) {
      await pline(S("%s is too far away to see %sself in the dark."), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].him);
    }
  } else if (mlet === S_VAMPIRE || mlet === S_GHOST || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) {
    if (vis) {
      await pline(S("%s doesn't have a reflection."), await Monnam(mtmp));
    }
  } else if (monable && mtmp.data === $sat(G.mons, PM_MEDUSA)) {
    if (await mon_reflects(mtmp, S("The gaze is reflected away by %s %s!"))) {
      return 1;
    }
    if (vis) {
      await pline(S("%s is turned to stone!"), await Monnam(mtmp));
    }
    G.stoned = TRUE;
    await killed(mtmp);
  } else if (monable && mtmp.data === $sat(G.mons, PM_FLOATING_EYE)) {
    let tmp = d(mtmp.m_lev, mtmp.data.mattk[0].damd);
    if (!rn2(4)) {
      tmp = 120;
    }
    if (vis) {
      await pline(S("%s is frozen by its reflection."), await Monnam(mtmp));
    } else {
      await You_hear(S("%s stop moving."), G.c_common_strings.c_something);
    }
    paralyze_monst(mtmp, (mtmp.mfrozen | 0) + tmp);
  } else if (monable && mtmp.data === $sat(G.mons, PM_UMBER_HULK)) {
    if (vis) {
      await pline(S("%s confuses itself!"), await Monnam(mtmp));
    }
    mtmp.mconf = 1;
  } else if (monable && (mlet === S_NYMPH || mtmp.data === $sat(G.mons, PM_SUCCUBUS) || mtmp.data === $sat(G.mons, PM_INCUBUS))) {
    if (vis) {
      let buf = new Int8Array(256);
      await pline(S("%s admires %sself in your %s."), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].him, mirror);
      await pline(S("%s takes it!"), upstart(strcpy(P(buf), G.genders[pronoun_gender(mtmp, 0)].he)));
    } else {
      await pline(S("It steals your %s!"), mirror);
    }
    await setnotworn(obj[0]);
    await freeinv(obj[0]);
    await mpickobj(mtmp, obj[0]);
    if (!await tele_restrict(mtmp)) {
      await rloc(mtmp, TRUE);
    }
  } else if (!(mtmp.data.mlet === S_UNICORN && (mtmp.data.mflags2 & 536870912) >>> 0 !== 0) && !((mtmp.data.mflags1 & 131072) >>> 0 !== 0) && (!mtmp.minvis || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && rn2(5)) {
    let do_react = TRUE;
    if (mtmp.mfrozen) {
      if (vis) {
        await You(S("discern no obvious reaction from %s."), await mon_nam(mtmp));
      } else {
        await You_feel(S("a bit silly gesturing the mirror in that direction."));
      }
      do_react = FALSE;
    }
    if (do_react) {
      if (vis) {
        await pline(S("%s is frightened by its reflection."), await Monnam(mtmp));
      }
      await monflee(mtmp, d(2, 4), FALSE, FALSE);
    }
  } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    if (mtmp.minvis | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
      ;
    } else if (mtmp.minvis | 0 && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0) || !((mtmp.data.mflags1 & 4096) >>> 0 === 0) || G.notonhead || !mtmp.mcansee) {
      await pline(S("%s doesn't seem to notice %s reflection."), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his);
    } else {
      await pline(S("%s ignores %s reflection."), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his);
    }
  }
  return 1;
}

async function use_bell(optr: Ptr | null): Promise<void> {
  let obj = optr.a[optr.o];
  let mtmp = null;
  let wakem = FALSE;
  let learno = FALSE;
  let ordinary = (obj.otyp !== BELL_OF_OPENING || !obj.spe ? 1 : 0) << 24 >> 24;
  let invoking = (obj.otyp === BELL_OF_OPENING && invocation_pos(G.u.ux, G.u.uy) && !On_stairs(G.u.ux, G.u.uy) ? 1 : 0) << 24 >> 24;
  await You(S("ring %s."), await the(await xname(obj)));
  if (G.u.uinwater | 0 || G.u.uswallow | 0 && ordinary) {
    await pline(S("But the sound is muffled."));
  } else if (invoking && ordinary) {
    await pline(S("But it makes no sound."));
    learno = TRUE;
  } else if (ordinary) {
    if (obj.cursed | 0 && !rn2(4) && !(G.mvitals[PM_WOOD_NYMPH].mvflags & G_GONE) && !(G.mvitals[PM_WATER_NYMPH].mvflags & G_GONE) && !(G.mvitals[PM_MOUNTAIN_NYMPH].mvflags & G_GONE) && !!(mtmp = await makemon(await mkclass(S_NYMPH, 0), G.u.ux, G.u.uy, NO_MINVENT))) {
      await You(S("summon %s!"), await a_monnam(mtmp));
      if (!obj_resists(obj, 93, 100)) {
        await pline(S("%s shattered!"), await Tobjnam(obj, S("have")));
        await useup(obj);
        optr.a[optr.o] = null;
      } else {
        switch (rn2(3)) {
        default:
          break;
        case 1:
          await mon_adjust_speed(mtmp, 2, null);
          break;
        case 2:
          G.nomovemsg = S("");
          G.multi_reason = null;
          nomul(-rnd(2));
          break;
        }
      }
    }
    wakem = TRUE;
  } else {
    await consume_obj_charge(obj, TRUE);
    if (G.u.uswallow) {
      if (!obj.cursed) {
        await openit();
      } else {
        await pline(S("%s"), G.c_common_strings.c_nothing_happens);
      }
    } else if (obj.cursed) {
      let mm = new struct_nhcoord();
      mm.x = G.u.ux;
      mm.y = G.u.uy;
      await mkundead(mm, FALSE, NO_MINVENT);
      wakem = TRUE;
    } else if (invoking) {
      await pline(S("%s an unsettling shrill sound..."), await Tobjnam(obj, S("issue")));
      obj.age = G.moves;
      learno = TRUE;
      wakem = TRUE;
    } else if (obj.blessed) {
      let res = 0;
      if (G.uchain) {
        await unpunish();
        res = 1;
      } else if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
        await buried_ball_to_freedom();
        res = 1;
      }
      res += await openit();
      switch (res) {
      case 0:
        await pline(S("%s"), G.c_common_strings.c_nothing_happens);
        break;
      case 1:
        await pline(S("%s opens..."), G.c_common_strings.c_Something);
        learno = TRUE;
        break;
      default:
        await pline(S("Things open around you..."));
        learno = TRUE;
        break;
      }
    } else {
      if (await findit() !== 0) {
        learno = TRUE;
      } else {
        await pline(S("%s"), G.c_common_strings.c_nothing_happens);
      }
    }
  }
  if (learno) {
    await discover_object(238, 1, 1);
    obj.known = 1;
  }
  if (wakem) {
    wake_nearby();
  }
}

async function use_candelabrum(obj: struct_obj | null): Promise<void> {
  let s = obj.spe !== 1 ? S("candles") : S("candle");
  if (obj.lamplit) {
    await You(S("snuff the %s."), s);
    await end_burn(obj, TRUE);
    return;
  }
  if (obj.spe <= 0) {
    await pline(S("This %s has no %s."), await xname(obj), s);
    return;
  }
  if (G.u.uinwater) {
    await You(S("cannot make fire under water."));
    return;
  }
  if (G.u.uswallow | 0 || obj.cursed | 0) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline_The(S("%s %s for a moment, then %s."), s, vtense(s, S("flicker")), vtense(s, S("die")));
    }
    return;
  }
  if (obj.spe < 7) {
    await There(S("%s only %d %s in %s."), vtense(s, S("are")), obj.spe, s, await the(await xname(obj)));
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s lit.  %s dimly."), obj.spe === 1 ? S("It is") : S("They are"), await Tobjnam(obj, S("shine")));
    }
  } else {
    await pline(S("%s's %s burn%s"), await The(await xname(obj)), s, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S(".") : S(" brightly!"));
  }
  if (!invocation_pos(G.u.ux, G.u.uy) || On_stairs(G.u.ux, G.u.uy)) {
    await pline_The(S("%s %s being rapidly consumed!"), s, vtense(s, S("are")));
    obj.age = Math.trunc((obj.age + 1) / 2);
  } else {
    if (obj.spe === 7) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await pline(S("%s a strange warmth!"), await Tobjnam(obj, S("radiate")));
      } else {
        await pline(S("%s with a strange light!"), await Tobjnam(obj, S("glow")));
      }
    }
    obj.known = 1;
  }
  await begin_burn(obj, FALSE);
}

async function use_candle(optr: Ptr | null): Promise<void> {
  let obj = optr.a[optr.o];
  let otmp = null;
  let s = obj.quan !== 1 ? S("candles") : S("candle");
  let qbuf = new Int8Array(128);
  let qsfx = new Int8Array(128);
  let q = null;
  if (G.u.uswallow) {
    await You(P(no_elbow_room));
    return;
  }
  otmp = carrying(CANDELABRUM_OF_INVOCATION);
  if (!otmp || otmp.spe === 7) {
    await use_lamp(obj);
    return;
  }
  sprintf(P(qsfx), S(" to\x1b%s?"), await thesimpleoname(otmp));
  await safe_qbuf(P(qbuf), S("Attach "), P(qsfx), obj, yname, thesimpleoname, s);
  if (!!(q = strstri(P(qbuf), S(" to\x1b")))) {
    strcpy(q, S(" to "));
  }
  if (await yn_function(await safe_qbuf(P(qbuf), P(qbuf), S("?"), otmp, yname, thesimpleoname, S("it")), P(G.ynchars), 110) === 110) {
    await use_lamp(obj);
    return;
  } else {
    if (otmp.spe + obj.quan > 7) {
      obj = await splitobj(obj, 7 - otmp.spe);
      s = obj.quan !== 1 ? S("candles") : S("candle");
    } else {
      optr.a[optr.o] = null;
    }
    await You(S("attach %ld%s %s to %s."), obj.quan, !otmp.spe ? S("") : S(" more"), s, await the(await xname(otmp)));
    if (!otmp.spe || otmp.age > obj.age) {
      otmp.age = obj.age;
    }
    otmp.spe = otmp.spe + (obj.quan | 0) << 24 >> 24;
    if (otmp.lamplit | 0 && !obj.lamplit) {
      await pline_The(S("new %s magically %s!"), s, vtense(s, S("ignite")));
    } else if (!otmp.lamplit && obj.lamplit | 0) {
      await pline(S("%s out."), obj.quan > 1 ? S("They go") : S("It goes"));
    }
    if (obj.unpaid) {
      await verbalize(S("You %s %s, you bought %s!"), otmp.lamplit | 0 ? S("burn") : S("use"), obj.quan > 1 ? S("them") : S("it"), obj.quan > 1 ? S("them") : S("it"));
    }
    if (obj.quan < 7 && otmp.spe === 7) {
      await pline(S("%s now has seven%s candles attached."), await The(await xname(otmp)), otmp.lamplit | 0 ? S(" lit") : S(""));
    }
    if (otmp.lamplit) {
      await obj_merge_light_sources(otmp, otmp);
    }
    if (obj.lamplit) {
      await end_burn(obj, TRUE);
    }
    await useupall(obj);
    otmp.owt = await weight(otmp) >>> 0;
    update_inventory();
  }
}

export async function snuff_candle(otmp: struct_obj | null): Promise<number> {
  let candle = (otmp.otyp === 199 || otmp.otyp === 200 ? 1 : 0) << 24 >> 24;
  if ((candle || otmp.otyp === CANDELABRUM_OF_INVOCATION) && otmp.lamplit | 0) {
    let buf = new Int8Array(256);
    const x = new Int8Array(1);
    const y = new Int8Array(1);
    let many = (candle ? otmp.quan > 1 ? 1 : 0 : otmp.spe > 1 ? 1 : 0) << 24 >> 24;
    get_obj_location(otmp, P(x, 0), P(y, 0), 0);
    if (otmp.where === OBJ_MINVENT ? $rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 : !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) {
      await pline(S("%s%scandle%s flame%s extinguished."), await Shk_Your(P(buf), otmp), candle ? S("") : S("candelabrum's "), many ? S("s'") : S("'s"), many ? S("s are") : S(" is"));
    }
    await end_burn(otmp, TRUE);
    return TRUE;
  }
  return FALSE;
}

export async function snuff_lit(obj: struct_obj | null): Promise<number> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  if (obj.lamplit) {
    if (obj.otyp === OIL_LAMP || obj.otyp === MAGIC_LAMP || obj.otyp === BRASS_LANTERN || obj.otyp === POT_OIL) {
      get_obj_location(obj, P(x, 0), P(y, 0), 0);
      if (obj.where === OBJ_MINVENT ? $rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 : !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) {
        await pline(S("%s %s out!"), await Yname2(obj), otense(obj, S("go")));
      }
      await end_burn(obj, TRUE);
      return TRUE;
    }
    if (await snuff_candle(obj)) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function catch_lit(obj: struct_obj | null): Promise<number> {
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  if (!obj.lamplit && (obj.otyp === MAGIC_LAMP || (obj.otyp === 201 || obj.otyp === 202 || obj.otyp === 237 || obj.otyp === 199 || obj.otyp === 200 || obj.otyp === 296))) {
    if ((obj.otyp === MAGIC_LAMP || obj.otyp === CANDELABRUM_OF_INVOCATION) && obj.spe === 0) {
      return FALSE;
    } else if (obj.otyp !== MAGIC_LAMP && obj.age === 0) {
      return FALSE;
    }
    if (!get_obj_location(obj, P(x, 0), P(y, 0), 0)) {
      return FALSE;
    }
    if (obj.otyp === CANDELABRUM_OF_INVOCATION && obj.cursed | 0) {
      return FALSE;
    }
    if ((obj.otyp === OIL_LAMP || obj.otyp === MAGIC_LAMP || obj.otyp === BRASS_LANTERN) && obj.cursed | 0 && !rn2(2)) {
      return FALSE;
    }
    if (obj.where === OBJ_MINVENT ? $rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 : !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) {
      await pline(S("%s %s light!"), await Yname2(obj), otense(obj, S("catch")));
    }
    if (obj.otyp === POT_OIL) {
      await discover_object(obj.otyp, 1, 1);
    }
    if (obj.where === 3 && obj.unpaid | 0 && await costly_spot(G.u.ux, G.u.uy)) {
      await check_unpaid(obj);
      await verbalize(S("That's in addition to the cost of %s %s, of course."), await yname(obj), obj.quan === 1 ? S("itself") : S("themselves"));
      await bill_dummy_object(obj);
    }
    await begin_burn(obj, FALSE);
    return TRUE;
  }
  return FALSE;
}

async function use_lamp(obj: struct_obj | null): Promise<void> {
  let buf = new Int8Array(256);
  if (obj.lamplit) {
    if (obj.otyp === OIL_LAMP || obj.otyp === MAGIC_LAMP || obj.otyp === BRASS_LANTERN) {
      await pline(S("%slamp is now off."), await Shk_Your(P(buf), obj));
    } else {
      await You(S("snuff out %s."), await yname(obj));
    }
    await end_burn(obj, TRUE);
    return;
  }
  if (G.u.uinwater) {
    await pline(!(obj.otyp === 199 || obj.otyp === 200) ? S("This is not a diving lamp") : S("Sorry, fire and water don't mix."));
    return;
  }
  if (!(obj.otyp === 199 || obj.otyp === 200) && obj.age === 0 || obj.otyp === MAGIC_LAMP && obj.spe === 0) {
    if (obj.otyp === BRASS_LANTERN) {
      await Your(S("lamp has run out of power."));
    } else {
      await pline(S("This %s has no oil."), await xname(obj));
    }
    return;
  }
  if (obj.cursed | 0 && !rn2(2)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s for a moment, then %s."), await Tobjnam(obj, S("flicker")), otense(obj, S("die")));
    }
  } else {
    if (obj.otyp === OIL_LAMP || obj.otyp === MAGIC_LAMP || obj.otyp === BRASS_LANTERN) {
      await check_unpaid(obj);
      await pline(S("%slamp is now on."), await Shk_Your(P(buf), obj));
    } else {
      await pline(S("%s flame%s %s%s"), s_suffix(await Yname2(obj)), obj.quan === 1 ? S("") : S("s"), otense(obj, S("burn")), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S(".") : S(" brightly!"));
      if (obj.unpaid | 0 && await costly_spot(G.u.ux, G.u.uy) && obj.age === 20 * G.objects[obj.otyp].oc_cost) {
        let ithem = obj.quan > 1 ? S("them") : S("it");
        await verbalize(S("You burn %s, you bought %s!"), ithem, ithem);
        await bill_dummy_object(obj);
      }
    }
    await begin_burn(obj, FALSE);
  }
}

async function light_cocktail(optr: Ptr | null): Promise<void> {
  let obj = optr.a[optr.o];
  let buf = new Int8Array(256);
  let split1off = 0;
  if (G.u.uswallow) {
    await You(P(no_elbow_room));
    return;
  }
  if (obj.lamplit) {
    await You(S("snuff the lit potion."));
    await end_burn(obj, TRUE);
    await freeinv(obj);
    optr.a[optr.o] = await addinv(obj);
    return;
  } else if (G.u.uinwater) {
    await There(S("is not enough oxygen to sustain a fire."));
    return;
  }
  split1off = (obj.quan > 1 ? 1 : 0) << 24 >> 24;
  if (split1off) {
    obj = await splitobj(obj, 1);
  }
  await You(S("light %spotion.%s"), await shk_your(P(buf), obj), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S("  It gives off a dim light."));
  if (obj.unpaid | 0 && await costly_spot(G.u.ux, G.u.uy)) {
    await check_unpaid(obj);
    await verbalize(S("That's in addition to the cost of the potion, of course."));
    await bill_dummy_object(obj);
  }
  await discover_object(obj.otyp, 1, 1);
  await begin_burn(obj, FALSE);
  if (split1off) {
    await obj_extract_self(obj);
    obj.nomerge = 1;
    obj = await hold_another_object(obj, S("You drop %s!"), await doname(obj), null);
    if (obj) {
      obj.nomerge = 0;
    }
  }
  optr.a[optr.o] = obj;
}

export async function dorub(): Promise<number> {
  let obj = await getobj(P(cuddly), S("rub"));
  if (obj && obj.oclass === GEM_CLASS) {
    if (obj.otyp === 443 || obj.otyp === 444 || obj.otyp === 446 || obj.otyp === 445) {
      await use_stone(obj);
      return 1;
    } else {
      await pline(S("Sorry, I don't know how to use that."));
      return 0;
    }
  }
  if (!obj || !await wield_tool(obj, S("rub"))) {
    return 0;
  }
  if (G.uwep.otyp === MAGIC_LAMP) {
    if (G.uwep.spe > 0 && !rn2(3)) {
      await check_unpaid_usage(G.uwep, TRUE);
      G.uwep.otyp = OIL_LAMP;
      G.uwep.spe = 0;
      G.uwep.age = rn2(500) + 1000;
      if (G.uwep.lamplit) {
        await begin_burn(G.uwep, TRUE);
      }
      await djinni_from_bottle(G.uwep);
      await discover_object(203, 1, 1);
      update_inventory();
    } else if (rn2(2)) {
      await You(S("%s smoke."), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("see a puff of") : S("smell"));
    } else {
      await pline(S("%s"), G.c_common_strings.c_nothing_happens);
    }
  } else if (obj.otyp === BRASS_LANTERN) {
    await pline(S("Rubbing the electric lamp is not particularly rewarding."));
    await pline(S("Anyway, nothing exciting happens."));
  } else {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
  }
  return 1;
}

export async function dojump(): Promise<number> {
  return await jump(0);
}

function check_jump(arg: any, x: number, y: number): number {
  let traj = arg.a[arg.o];
  let lev = $sat(G.level.locations[x], y);
  if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
    return TRUE;
  }
  if (lev.typ <= DBWALL) {
    return FALSE;
  }
  if (lev.typ === DOOR) {
    if (closed_door(x, y)) {
      return FALSE;
    }
    if (((lev.flags | 0) & D_ISOPEN) !== 0 && traj !== jAny && (traj === jDiag || ((traj & jHorz) !== 0 ? 1 : 0) === ((lev.horizontal | 0) !== 0 ? 1 : 0))) {
      return FALSE;
    }
  }
  if (sobj_at(BOULDER, x, y) && !((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0)) {
    return FALSE;
  }
  return TRUE;
}

async function is_valid_jump_pos(x: number, y: number, magic: number, showmsg: number): Promise<number> {
  if (!magic && !(G.u.uprops[JUMPING].intrinsic & ~INTRINSIC) && !G.u.uprops[JUMPING].extrinsic && dist2(x, y, G.u.ux, G.u.uy) !== 5) {
    if (showmsg) {
      await pline(S("Illegal move!"));
    }
    return FALSE;
  } else if (dist2(x, y, G.u.ux, G.u.uy) > (magic ? 6 + magic * 3 : 9)) {
    if (showmsg) {
      await pline(S("Too far!"));
    }
    return FALSE;
  } else if (!isok(x, y)) {
    if (showmsg) {
      await You(S("cannot jump there!"));
    }
    return FALSE;
  } else if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
    if (showmsg) {
      await You(S("cannot see where to land!"));
    }
    return FALSE;
  } else {
    let uc = new struct_nhcoord();
    let tc = new struct_nhcoord();
    let lev = $sat(G.level.locations[G.u.ux], G.u.uy);
    let diag = 0;
    const traj = new Int32Array(1);
    let dx = x - G.u.ux;
    let dy = y - G.u.uy;
    let ax = Math.abs(dx);
    let ay = Math.abs(dy);
    diag = magic || (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) || !dx && !dy ? jAny : !dy ? jHorz : !dx ? jVert : jDiag;
    if (ax >= 2 * ay) {
      ay = 0;
    } else if (ay >= 2 * ax) {
      ax = 0;
    }
    traj[0] = magic || (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) || !ax && !ay ? jAny : !ay ? jHorz : !ax ? jVert : jDiag;
    if (diag === jDiag && lev.typ === DOOR && ((lev.flags | 0) & D_ISOPEN) !== 0 && (traj[0] === jDiag || ((traj[0] & jHorz) !== 0 ? 1 : 0) === ((lev.horizontal | 0) !== 0 ? 1 : 0))) {
      if (showmsg) {
        await You_cant(S("jump diagonally out of a doorway."));
      }
      return FALSE;
    }
    uc.x = G.u.ux, uc.y = G.u.uy;
    tc.x = x << 24 >> 24, tc.y = y << 24 >> 24;
    if (!await walk_path(uc, tc, check_jump, P(traj, 0))) {
      if (showmsg) {
        await There(S("is an obstacle preventing that jump."));
      }
      return FALSE;
    }
  }
  return TRUE;
}

async function get_valid_jump_position(x: number, y: number): Promise<number> {
  return (isok(x, y) && ($at2(G.level.locations, x, y).typ >= DOOR || (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic)) && await is_valid_jump_pos(x, y, jumping_is_magic, FALSE) ? 1 : 0) << 24 >> 24;
}

async function display_jump_positions(state: number): Promise<void> {
  if (state === 0) {
    await tmp_at(DISP_BEAM, S_goodpos + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
  } else if (state === 1) {
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    for (dx = -4; dx <= 4; ++dx) {
      for (dy = -4; dy <= 4; ++dy) {
        x = dx + G.u.ux;
        y = dy + G.u.uy;
        if (await get_valid_jump_position(x, y)) {
          await tmp_at(x, y);
        }
      }
    }
  } else {
    await tmp_at(DISP_END, 0);
  }
}

export async function jump(magic: number): Promise<number> {
  let cc = new struct_nhcoord();
  if (!magic && !(G.u.uprops[JUMPING].intrinsic || G.u.uprops[JUMPING].extrinsic)) {
    let sp_no = 0;
    for (sp_no = 0; sp_no < MAXSPELL; ++sp_no) {
      if (G.spl_book[sp_no].sp_id === NO_SPELL) {
        break;
      } else if (G.spl_book[sp_no].sp_id === SPE_JUMPING) {
        return await spelleffects(sp_no, FALSE);
      }
    }
  }
  if (!magic && ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576 || (G.youmonst.data.mflags1 & 524288) >>> 0 !== 0)) {
    await You_cant(S("jump; you have no legs!"));
    return 0;
  } else if (!magic && !(G.u.uprops[JUMPING].intrinsic || G.u.uprops[JUMPING].extrinsic)) {
    await You_cant(S("jump very far."));
    return 0;
  } else if (!magic && G.u.usteed && await stucksteed(FALSE)) {
    return 0;
  } else if (G.u.uswallow) {
    if (magic) {
      await You(S("bounce around a little."));
      return 1;
    }
    await pline(S("You've got to be kidding!"));
    return 0;
  } else if (G.u.uinwater) {
    if (magic) {
      await You(S("swish around a little."));
      return 1;
    }
    await pline(S("This calls for swimming, not jumping!"));
    return 0;
  } else if (G.u.ustuck) {
    if (G.u.ustuck.mtame && !(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !G.u.ustuck.mconf) {
      await You(S("pull free from %s."), await mon_nam(G.u.ustuck));
      G.u.ustuck = null;
      return 1;
    }
    if (magic) {
      await You(S("writhe a little in the grasp of %s!"), await mon_nam(G.u.ustuck));
      return 1;
    }
    await You(S("cannot escape from %s!"), await mon_nam(G.u.ustuck));
    return 0;
  } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    if (magic) {
      await You(S("flail around a little."));
      return 1;
    }
    await You(S("don't have enough traction to jump."));
    return 0;
  } else if (!magic && near_capacity() > UNENCUMBERED) {
    await You(S("are carrying too much to jump!"));
    return 0;
  } else if (!magic && (G.u.uhunger <= 100 || acurr(A_STR) < 6)) {
    await You(S("lack the strength to jump!"));
    return 0;
  } else if (!magic && (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic)) {
    let wl = (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic ? 1 : 0) & BOTH_SIDES;
    let bp = body_part(LEG);
    if (wl === BOTH_SIDES) {
      bp = await makeplural(bp);
    }
    if (G.u.usteed) {
      await pline(S("%s is in no shape for jumping."), await Monnam(G.u.usteed));
    } else {
      await Your(S("%s%s %s in no shape for jumping."), wl === LEFT_SIDE ? S("left ") : wl === RIGHT_SIDE ? S("right ") : S(""), bp, wl === BOTH_SIDES ? S("are") : S("is"));
    }
    return 0;
  } else if (G.u.usteed && G.u.utrap) {
    await pline(S("%s is stuck in a trap."), await Monnam(G.u.usteed));
    return 0;
  }
  await pline(S("Where do you want to jump?"));
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  jumping_is_magic = magic;
  getpos_sethilite(display_jump_positions, get_valid_jump_position);
  if (await getpos(cc, TRUE, S("the desired position")) < 0) {
    return 0;
  }
  if (!await is_valid_jump_pos(cc.x, cc.y, magic, TRUE)) {
    return 0;
  } else {
    let uc = new struct_nhcoord();
    const range = new Int32Array(1);
    let temp = 0;
    if (G.u.utrap) {
      switch (G.u.utraptype) {
      case TT_BEARTRAP:
        {
          let side = rn2(3) ? LEFT_SIDE : RIGHT_SIDE;
          await You(S("rip yourself free of the bear trap!  Ouch!"));
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(10) + 1) / 2 | 0 : rnd(10), S("jumping out of a bear trap"), KILLED_BY);
          await set_wounded_legs(side, rn2(1000) + 500);
          break;
        }
      case TT_PIT:
        await You(S("leap from the pit!"));
        break;
      case TT_WEB:
        await You(S("tear the web apart as you pull yourself free!"));
        await deltrap(t_at(G.u.ux, G.u.uy));
        break;
      case TT_LAVA:
        await You(S("pull yourself above the %s!"), hliquid(S("lava")));
        await reset_utrap(TRUE);
        return 1;
      case TT_BURIEDBALL:
      case TT_INFLOOR:
        await You(S("strain your %s, but you're still %s."), await makeplural(body_part(LEG)), G.u.utraptype === TT_INFLOOR ? S("stuck in the floor") : S("attached to the buried ball"));
        await set_wounded_legs(LEFT_SIDE, rn2(10) + 11);
        await set_wounded_legs(RIGHT_SIDE, rn2(10) + 11);
        return 1;
      }
    }
    uc.x = G.u.ux;
    uc.y = G.u.uy;
    range[0] = cc.x - uc.x;
    if (range[0] < 0) {
      range[0] = -range[0];
    }
    temp = cc.y - uc.y;
    if (temp < 0) {
      temp = -temp;
    }
    if (range[0] < temp) {
      range[0] = temp;
    }
    await walk_path(uc, cc, hurtle_jump, P(range, 0));
    await teleds(cc.x, cc.y, FALSE);
    sokoban_guilt();
    nomul(-1);
    G.multi_reason = S("jumping around");
    G.nomovemsg = S("");
    await morehungry(rnd(25));
    return 1;
  }
}

export function tinnable(corpse: struct_obj | null): number {
  if (corpse.oeaten) {
    return 0;
  }
  if (!G.mons[corpse.corpsenm].cnutrit) {
    return 0;
  }
  return 1;
}

async function use_tinning_kit(obj: struct_obj | null): Promise<void> {
  let corpse = null;
  let can = null;
  if (obj.spe <= 0) {
    await You(S("seem to be out of tins."));
    return;
  }
  if (!(corpse = await floorfood(S("tin"), 2))) {
    return;
  }
  if (corpse.oeaten) {
    await You(S("cannot tin %s which is partly eaten."), G.c_common_strings.c_something);
    return;
  }
  if (($sat(G.mons, corpse.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, corpse.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !G.uarmg) {
    let kbuf = new Int8Array(256);
    if (poly_when_stoned(G.youmonst.data)) {
      await You(S("tin %s without wearing gloves."), await an(G.mons[corpse.corpsenm].mname));
    } else {
      await pline(S("Tinning %s without wearing gloves is a fatal mistake..."), await an(G.mons[corpse.corpsenm].mname));
      sprintf(P(kbuf), S("trying to tin %s without gloves"), await an(G.mons[corpse.corpsenm].mname));
    }
    await instapetrify(P(kbuf));
  }
  if ($sat(G.mons, corpse.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, corpse.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, corpse.corpsenm) === $sat(G.mons, 309)) {
    if (await revive_corpse(corpse)) {
      await verbalize(S("Yes...  But War does not preserve its enemies..."));
    } else {
      await pline_The(S("corpse evades your grasp."));
    }
    return;
  }
  if (G.mons[corpse.corpsenm].cnutrit === 0) {
    await pline(S("That's too insubstantial to tin."));
    return;
  }
  await consume_obj_charge(obj, TRUE);
  if (!!(can = await mksobj(TIN, FALSE, FALSE))) {
    can.corpsenm = corpse.corpsenm;
    can.cursed = (obj.cursed) & 1;
    can.blessed = (obj.blessed) & 1;
    can.owt = await weight(can) >>> 0;
    can.known = 1;
    set_tin_variety(can, HOMEMADE_TIN);
    if (corpse.where === 3) {
      if (corpse.unpaid) {
        await verbalize(P(use_tinning_kit$you_buy_it));
      }
      await useup(corpse);
    } else {
      if (await costly_spot(corpse.ox, corpse.oy) && !corpse.no_charge) {
        await verbalize(P(use_tinning_kit$you_buy_it));
      }
      await useupf(corpse, 1);
    }
    await hold_another_object(can, S("You make, but cannot pick up, %s."), await doname(can), null);
  } else {
    await impossible(S("Tinning failed."));
  }
}

export async function use_unicorn_horn(obj: struct_obj | null): Promise<void> {
  let idx = 0;
  let val = 0;
  let val_limit = 0;
  let trouble_count = 0;
  let unfixable_trbl = 0;
  let did_prop = 0;
  let did_attr = 0;
  let trouble_list = new Int32Array(25);
  if (obj && obj.cursed | 0) {
    let lcount = rn2(90) + 10;
    switch (rn2(13) / 2 | 0) {
    case 0:
      await make_sick(G.u.uprops[SICK].intrinsic & TIMEOUT ? Math.trunc((G.u.uprops[SICK].intrinsic & TIMEOUT) / 3) + 1 : rn2(acurr(A_CON)) + 20, await xname(obj), TRUE, SICK_NONVOMITABLE);
      break;
    case 1:
      await make_blinded((G.u.uprops[BLINDED].intrinsic & TIMEOUT) + lcount, TRUE);
      break;
    case 2:
      if (!G.u.uprops[CONFUSION].intrinsic) {
        await You(S("suddenly feel %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("trippy") : S("confused"));
      }
      await make_confused((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) + lcount, TRUE);
      break;
    case 3:
      await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + lcount, TRUE);
      break;
    case 4:
      await adjattrib(rn2(A_MAX), -1, FALSE);
      break;
    case 5:
      await make_hallucinated((G.u.uprops[HALLUC].intrinsic & TIMEOUT) + lcount, TRUE, 0);
      break;
    case 6:
      if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
        await pline(S("Nothing seems to happen."));
      }
      await make_deaf((G.u.uprops[DEAF].intrinsic & TIMEOUT) + lcount, TRUE);
      break;
    }
    return;
  }
  trouble_count = unfixable_trbl = did_prop = did_attr = 0;
  if (G.u.uprops[SICK].intrinsic && !(G.u.uprops[SICK].intrinsic & ~16777215) ? G.u.uprops[SICK].intrinsic & 16777215 : 0) {
    trouble_list[trouble_count++] = SICK + A_MAX;
  }
  if ((G.u.uprops[BLINDED].intrinsic && !(G.u.uprops[BLINDED].intrinsic & ~16777215) ? G.u.uprops[BLINDED].intrinsic & 16777215 : 0) > G.u.ucreamed && !(G.u.uswallow | 0 && attacktype_fordmg(G.u.ustuck.data, AT_ENGL, AD_BLND))) {
    trouble_list[trouble_count++] = BLINDED + A_MAX;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC].intrinsic & ~16777215) ? G.u.uprops[HALLUC].intrinsic & 16777215 : 0) {
    trouble_list[trouble_count++] = HALLUC + A_MAX;
  }
  if (G.u.uprops[VOMITING].intrinsic && !(G.u.uprops[VOMITING].intrinsic & ~16777215) ? G.u.uprops[VOMITING].intrinsic & 16777215 : 0) {
    trouble_list[trouble_count++] = VOMITING + A_MAX;
  }
  if (G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[CONFUSION].intrinsic & ~16777215) ? G.u.uprops[CONFUSION].intrinsic & 16777215 : 0) {
    trouble_list[trouble_count++] = CONFUSION + A_MAX;
  }
  if (G.u.uprops[STUNNED].intrinsic && !(G.u.uprops[STUNNED].intrinsic & ~16777215) ? G.u.uprops[STUNNED].intrinsic & 16777215 : 0) {
    trouble_list[trouble_count++] = STUNNED + A_MAX;
  }
  if (G.u.uprops[DEAF].intrinsic && !(G.u.uprops[DEAF].intrinsic & ~16777215) ? G.u.uprops[DEAF].intrinsic & 16777215 : 0) {
    trouble_list[trouble_count++] = DEAF + A_MAX;
  }
  unfixable_trbl = unfixable_trouble_count(TRUE);
  for (idx = 0; idx < A_MAX; ++idx) {
    if (G.u.acurr.a[idx] >= G.u.amax.a[idx]) {
      continue;
    }
    val_limit = G.u.amax.a[idx];
    if (G.u.uprops[FIXED_ABIL].extrinsic) {
      unfixable_trbl += val_limit - G.u.acurr.a[idx];
      continue;
    }
    if (val_limit > G.u.acurr.a[idx] + 3) {
      val_limit = G.u.acurr.a[idx] + 3;
    }
    for (val = G.u.acurr.a[idx]; val < val_limit; ++val) {
      trouble_list[trouble_count++] = idx;
    }
    unfixable_trbl += G.u.amax.a[idx] - val_limit;
  }
  if (trouble_count === 0) {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
    return;
  } else if (trouble_count > 1) {
    let i = 0;
    let j = 0;
    let k = 0;
    for (i = trouble_count - 1; i > 0; --i) {
      if ((j = rn2(i + 1)) !== i) {
        k = trouble_list[j];
        trouble_list[j] = trouble_list[i];
        trouble_list[i] = k;
      }
    }
  }
  val_limit = rn2(d(2, obj && obj.blessed | 0 ? 4 : 2));
  if (val_limit > trouble_count) {
    val_limit = trouble_count;
  }
  for (val = 0; val < val_limit; ++val) {
    idx = trouble_list[val];
    switch (idx) {
    case SICK + A_MAX:
      await make_sick(0, null, TRUE, SICK_ALL);
      ++did_prop;
      break;
    case BLINDED + A_MAX:
      await make_blinded(G.u.ucreamed, TRUE);
      ++did_prop;
      break;
    case HALLUC + A_MAX:
      await make_hallucinated(0, TRUE, 0);
      ++did_prop;
      break;
    case VOMITING + A_MAX:
      await make_vomiting(0, TRUE);
      ++did_prop;
      break;
    case CONFUSION + A_MAX:
      await make_confused(0, TRUE);
      ++did_prop;
      break;
    case STUNNED + A_MAX:
      await make_stunned(0, TRUE);
      ++did_prop;
      break;
    case DEAF + A_MAX:
      await make_deaf(0, TRUE);
      ++did_prop;
      break;
    default:
      if (idx >= 0 && idx < A_MAX) {
        G.u.acurr.a[idx] += 1;
        ++did_attr;
      } else {
        await panic(S("use_unicorn_horn: bad trouble? (%d)"), idx);
      }
      break;
    }
  }
  if (did_attr || did_prop) {
    G.context.botl = TRUE;
  }
  if (did_attr) {
    await pline(S("This makes you feel %s!"), did_prop + did_attr === trouble_count + unfixable_trbl ? S("great") : S("better"));
  } else if (!did_prop) {
    await pline(S("Nothing seems to happen."));
  }
}

export async function fig_transform(arg: union_any | null, timeout: number): Promise<void> {
  let figurine = arg.a_obj;
  let mtmp = null;
  let cc = new struct_nhcoord();
  let cansee_spot = 0;
  let silent = 0;
  let okay_spot = 0;
  let redraw = FALSE;
  let suppress_see = FALSE;
  let monnambuf = new Int8Array(256);
  let carriedby = new Int8Array(256);
  if (!figurine) {
    do {
      if (await debugcore(S("apply.c"), 1)) {
        await pline(S("null figurine in fig_transform()"));
      }
    } while (0);
    return;
  }
  silent = (timeout !== G.monstermoves ? 1 : 0) << 24 >> 24;
  okay_spot = get_obj_location(figurine, P(cc, "x"), P(cc, "y"), 0);
  if (figurine.where === OBJ_INVENT || figurine.where === OBJ_MINVENT) {
    okay_spot = await enexto(cc, cc.x, cc.y, $sat(G.mons, figurine.corpsenm));
  }
  if (!okay_spot || !await figurine_location_checks(figurine, cc, TRUE)) {
    await start_timer(rnd(5000), TIMER_OBJECT, FIG_TRANSFORM, obj_to_any(figurine));
    return;
  }
  cansee_spot = ($rd(G.viz_array.a[G.viz_array.o + cc.y], cc.x) & 2) << 24 >> 24;
  mtmp = await make_familiar(figurine, cc.x, cc.y, TRUE);
  if (mtmp) {
    let and_vanish = new Int8Array(256);
    let mshelter = G.level.objects[mtmp.mx][mtmp.my];
    sprintf(P(monnambuf), S("%s"), await an(await m_monnam(mtmp)));
    and_vanish[0] = 0;
    if (mtmp.minvis | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) || mtmp.data.mlet === S_MIMIC && (mtmp.m_ap_type & 7) !== M_AP_NOTHING) {
      suppress_see = TRUE;
    }
    if (mtmp.mundetected) {
      if ((mtmp.data.mflags1 & 128) >>> 0 !== 0 && mshelter) {
        sprintf(P(and_vanish), S(" and %s under %s"), locomotion(mtmp.data, S("crawl")), await doname(mshelter));
      } else if (mtmp.data.mlet === S_MIMIC || mtmp.data.mlet === S_EEL) {
        suppress_see = TRUE;
      } else {
        strcpy(P(and_vanish), S(" and vanish"));
      }
    }
    switch (figurine.where) {
    case 3:
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || suppress_see) {
        await You_feel(S("%s %s from your pack!"), G.c_common_strings.c_something, locomotion(mtmp.data, S("drop")));
      } else {
        await You_see(S("%s %s out of your pack%s!"), P(monnambuf), locomotion(mtmp.data, S("drop")), P(and_vanish));
      }
      break;
    case 1:
      if (cansee_spot && !silent) {
        if (suppress_see) {
          await pline(S("%s suddenly vanishes!"), await an(await xname(figurine)));
        } else {
          await You_see(S("a figurine transform into %s%s!"), P(monnambuf), P(and_vanish));
        }
        redraw = TRUE;
      }
      break;
    case 4:
      if (cansee_spot && !silent && !suppress_see) {
        let mon = null;
        mon = figurine.v.v_ocarry;
        if ((figurine.v.v_ocarry.wormno | 0 ? worm_known(figurine.v.v_ocarry) : $rd(G.viz_array.a[G.viz_array.o + figurine.v.v_ocarry.my], figurine.v.v_ocarry.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && figurine.v.v_ocarry && figurine.v.v_ocarry.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + figurine.v.v_ocarry.my], figurine.v.v_ocarry.mx) & 1 ? 1 : 0) && ((!figurine.v.v_ocarry.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !figurine.v.v_ocarry.mundetected) && (!mon.wormno || $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2)) {
          sprintf(P(carriedby), S("%s pack"), s_suffix(await a_monnam(mon)));
        } else if (is_pool(mon.mx, mon.my)) {
          strcpy(P(carriedby), S("empty water"));
        } else {
          strcpy(P(carriedby), S("thin air"));
        }
        await You_see(S("%s %s out of %s%s!"), P(monnambuf), locomotion(mtmp.data, S("drop")), P(carriedby), P(and_vanish));
      }
      break;
    default:
      await impossible(S("figurine came to life where? (%d)"), figurine.where);
      break;
    }
  }
  if (figurine.where === 3) {
    await useup(figurine);
  } else {
    await obj_extract_self(figurine);
    await obfree(figurine, null);
  }
  if (redraw) {
    await newsym(cc.x, cc.y);
  }
}

async function figurine_location_checks(obj: struct_obj | null, cc: struct_nhcoord | null, quietly: number): Promise<number> {
  let x = 0;
  let y = 0;
  if (obj.where === 3 && G.u.uswallow | 0) {
    if (!quietly) {
      await You(S("don't have enough room in here."));
    }
    return FALSE;
  }
  x = (cc ? cc.x : G.u.ux) << 24 >> 24;
  y = (cc ? cc.y : G.u.uy) << 24 >> 24;
  if (!isok(x, y)) {
    if (!quietly) {
      await You(S("cannot put the figurine there."));
    }
    return FALSE;
  }
  if ($at2(G.level.locations, x, y).typ < POOL && !(($sat(G.mons, obj.corpsenm).mflags1 & 8) >>> 0 !== 0 && may_passwall(x, y))) {
    if (!quietly) {
      await You(S("cannot place a figurine in %s!"), $at2(G.level.locations, x, y).typ === TREE || G.level.flags.arboreal | 0 && $at2(G.level.locations, x, y).typ === STONE ? S("a tree") : S("solid rock"));
    }
    return FALSE;
  }
  if (sobj_at(BOULDER, x, y) && !(($sat(G.mons, obj.corpsenm).mflags1 & 8) >>> 0 !== 0) && !(($sat(G.mons, obj.corpsenm).mflags2 & 134217728) >>> 0 !== 0)) {
    if (!quietly) {
      await You(S("cannot fit the figurine on the boulder."));
    }
    return FALSE;
  }
  return TRUE;
}

async function use_figurine(optr: Ptr | null): Promise<void> {
  let obj = optr.a[optr.o];
  let x = 0;
  let y = 0;
  let cc = new struct_nhcoord();
  if (G.u.uswallow) {
    if (!await figurine_location_checks(obj, null, FALSE)) {
      return;
    }
  }
  if (!await getdir(null)) {
    G.context.move = (G.multi = 0) << 24 >> 24;
    return;
  }
  x = G.u.ux + G.u.dx << 24 >> 24;
  y = G.u.uy + G.u.dy << 24 >> 24;
  cc.x = x;
  cc.y = y;
  if (!await figurine_location_checks(obj, cc, FALSE)) {
    return;
  }
  await You(S("%s and it %stransforms."), G.u.dx || G.u.dy ? S("set the figurine beside you") : (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || is_pool(cc.x, cc.y) ? S("release the figurine") : G.u.dz < 0 ? S("toss the figurine into the air") : S("set the figurine on the ground"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("supposedly ") : S(""));
  await make_familiar(obj, cc.x, cc.y, FALSE);
  await stop_timer(FIG_TRANSFORM, obj_to_any(obj));
  await useup(obj);
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    await map_invisible(cc.x, cc.y);
  }
  optr.a[optr.o] = null;
}

async function use_grease(obj: struct_obj | null): Promise<void> {
  let otmp = null;
  if (G.u.uprops[GLIB].intrinsic) {
    await pline(S("%s from your %s."), await Tobjnam(obj, S("slip")), await fingers_or_gloves(FALSE));
    await dropx(obj);
    return;
  }
  if (obj.spe > 0) {
    let oldglib = 0;
    if ((obj.cursed | 0 || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic)) && !rn2(2)) {
      await consume_obj_charge(obj, TRUE);
      await pline(S("%s from your %s."), await Tobjnam(obj, S("slip")), await fingers_or_gloves(FALSE));
      await dropx(obj);
      return;
    }
    otmp = await getobj(P(lubricables), S("grease"));
    if (!otmp) {
      return;
    }
    if (await inaccessible_equipment(otmp, S("grease"), FALSE)) {
      return;
    }
    await consume_obj_charge(obj, TRUE);
    oldglib = G.u.uprops[GLIB].intrinsic & TIMEOUT | 0;
    if (otmp !== G.zeroobj) {
      await You(S("cover %s with a thick layer of grease."), await yname(otmp));
      otmp.greased = 1;
      if (obj.cursed | 0 && !((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0)) {
        make_glib(oldglib + (rn2(6) + 10));
        await pline(S("Some of the grease gets all over your %s."), await fingers_or_gloves(TRUE));
      }
    } else {
      make_glib(oldglib + (rn2(11) + 5));
      await You(S("coat your %s with grease."), await fingers_or_gloves(TRUE));
    }
  } else {
    if (obj.known) {
      await pline(S("%s empty."), await Tobjnam(obj, S("are")));
    } else {
      await pline(S("%s to be empty."), await Tobjnam(obj, S("seem")));
    }
  }
  update_inventory();
}

async function use_stone(tstone: struct_obj | null): Promise<void> {
  let obj = null;
  let do_scratch = 0;
  let streak_color = null;
  let choices = null;
  let stonebuf = new Int8Array(128);
  let oclass = 0;
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    tstone.dknown = 1;
  }
  choices = tstone.otyp === TOUCHSTONE && tstone.dknown | 0 && G.objects[TOUCHSTONE].oc_name_known | 0 ? P(use_stone$coins_gems) : P(use_stone$allowall);
  sprintf(P(stonebuf), S("rub on the stone%s"), tstone.quan === 1 ? S("") : S("s"));
  if (!(obj = await getobj(choices, P(stonebuf)))) {
    return;
  }
  if (obj === tstone && obj.quan === 1) {
    await You_cant(S("rub %s on itself."), await the(await xname(obj)));
    return;
  }
  if (tstone.otyp === TOUCHSTONE && tstone.cursed | 0 && obj.oclass === GEM_CLASS && !(obj.otyp === 443 || obj.otyp === 444 || obj.otyp === 446 || obj.otyp === 445) && !obj_resists(obj, 80, 100)) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await pline(S("You feel something shatter."));
    } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await pline(S("Oh, wow, look at the pretty shards."));
    } else {
      await pline(S("A sharp crack shatters %s%s."), obj.quan > 1 ? S("one of ") : S(""), await the(await xname(obj)));
    }
    await useup(obj);
    return;
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    await pline(P(use_stone$scritch));
    return;
  } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await pline(S("Oh wow, man: Fractals!"));
    return;
  }
  do_scratch = FALSE;
  streak_color = null;
  oclass = obj.oclass;
  if (oclass === RING_CLASS && (G.objects[obj.otyp].oc_material | 0) !== GEMSTONE && (G.objects[obj.otyp].oc_material | 0) !== MINERAL) {
    oclass = RANDOM_CLASS;
  }
  switch (oclass) {
  case GEM_CLASS:
  case RING_CLASS:
    if (tstone.otyp !== TOUCHSTONE) {
      do_scratch = TRUE;
    } else if (obj.oclass === GEM_CLASS && (tstone.blessed | 0 || !tstone.cursed && (G.urole.malenum === 328 || G.urace.malenum === 162))) {
      await discover_object(445, 1, 1);
      await discover_object(obj.otyp, 1, 1);
      await prinv(null, obj, 0);
      return;
    } else {
      if ((G.objects[obj.otyp].oc_material | 0) === GLASS) {
        do_scratch = TRUE;
        break;
      }
    }
    streak_color = G.c_obj_colors[G.objects[obj.otyp].oc_color];
    break;
  default:
    switch (G.objects[obj.otyp].oc_material | 0) {
    case CLOTH:
      await pline(S("%s a little more polished now."), await Tobjnam(tstone, S("look")));
      return;
    case LIQUID:
      if (!obj.known) {
        await You(S("must think this is a wetstone, do you?"));
      } else {
        await pline(S("%s a little wetter now."), await Tobjnam(tstone, S("are")));
      }
      return;
    case WAX:
      streak_color = S("waxy");
      break;
    case WOOD:
      streak_color = S("wooden");
      break;
    case GOLD:
      do_scratch = TRUE;
      streak_color = S("golden");
      break;
    case SILVER:
      do_scratch = TRUE;
      streak_color = S("silvery");
      break;
    default:
      if ((G.objects[obj.otyp].oc_material | 0) <= LEATHER || obj.otyp === 60) {
        streak_color = G.c_obj_colors[G.objects[obj.otyp].oc_color];
      } else {
        do_scratch = (tstone.otyp !== TOUCHSTONE ? 1 : 0) << 24 >> 24;
      }
      break;
    }
    break;
  }
  sprintf(P(stonebuf), S("stone%s"), tstone.quan === 1 ? S("") : S("s"));
  if (do_scratch) {
    await You(S("make %s%sscratch marks on the %s."), streak_color ? streak_color : S(""), streak_color ? S(" ") : S(""), P(stonebuf));
  } else if (streak_color) {
    await You_see(S("%s streaks on the %s."), streak_color, P(stonebuf));
  } else {
    await pline(P(use_stone$scritch));
  }
  return;
}

export function reset_trapset(): void {
  trapinfo.tobj = null;
  trapinfo.force_bungle = 0;
}

async function use_trap(otmp: struct_obj | null): Promise<void> {
  let ttyp = 0;
  let tmp = 0;
  let what = null;
  let buf = new Int8Array(256);
  let levtyp = $at2(G.level.locations, G.u.ux, G.u.uy).typ;
  let occutext = S("setting the trap");
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    what = S("without hands");
  } else if (G.u.uprops[STUNNED].intrinsic) {
    what = S("while stunned");
  } else if (G.u.uswallow) {
    what = (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("while swallowed") : S("while engulfed");
  } else if (G.u.uinwater) {
    what = S("underwater");
  } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    what = S("while levitating");
  } else if (is_pool(G.u.ux, G.u.uy)) {
    what = S("in water");
  } else if (is_lava(G.u.ux, G.u.uy)) {
    what = S("in lava");
  } else if (On_stairs(G.u.ux, G.u.uy)) {
    what = G.u.ux === G.dnladder.sx || G.u.ux === G.upladder.sx ? S("on the ladder") : S("on the stairs");
  } else if (levtyp >= STAIRS && levtyp <= ALTAR || levtyp < POOL || closed_door(G.u.ux, G.u.uy) || t_at(G.u.ux, G.u.uy)) {
    what = S("here");
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    what = levtyp === AIR ? S("in midair") : levtyp === CLOUD ? S("in a cloud") : S("in this place");
  }
  if (what) {
    await You_cant(S("set a trap %s!"), what);
    reset_trapset();
    return;
  }
  ttyp = otmp.otyp === LAND_MINE ? LANDMINE : BEAR_TRAP;
  if (otmp === trapinfo.tobj && G.u.ux === trapinfo.tx && G.u.uy === trapinfo.ty) {
    await You(S("resume setting %s%s."), await shk_your(P(buf), otmp), G.defsyms[S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(TRAPNUM - 1) + 1 : ttyp) - 1].explanation);
    set_occupation(set_trap, occutext, 0);
    return;
  }
  trapinfo.tobj = otmp;
  trapinfo.tx = G.u.ux, trapinfo.ty = G.u.uy;
  tmp = acurr(A_DEX);
  trapinfo.time_needed = tmp > 17 ? 2 : tmp > 12 ? 3 : tmp > 7 ? 4 : 5;
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    trapinfo.time_needed = trapinfo.time_needed * 2;
  }
  tmp = acurr(A_STR);
  if (ttyp === BEAR_TRAP && tmp < 18) {
    trapinfo.time_needed += tmp > 12 ? 1 : tmp > 7 ? 2 : 4;
  }
  if (G.u.usteed && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
    let chance = 0;
    if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic || otmp.cursed | 0) {
      chance = (rnl(10) > 3 ? 1 : 0) << 24 >> 24;
    } else {
      chance = (rnl(10) > 5 ? 1 : 0) << 24 >> 24;
    }
    await You(S("aren't very skilled at reaching from %s."), await mon_nam(G.u.usteed));
    sprintf(P(buf), S("Continue your attempt to set %s?"), await the(G.defsyms[S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(TRAPNUM - 1) + 1 : ttyp) - 1].explanation));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 121) {
      if (chance) {
        switch (ttyp) {
        case LANDMINE:
          trapinfo.time_needed = 0;
          trapinfo.force_bungle = TRUE;
          break;
        case BEAR_TRAP:
          reset_trapset();
          await You(S("drop %s!"), await the(G.defsyms[S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(TRAPNUM - 1) + 1 : ttyp) - 1].explanation));
          await dropx(otmp);
          return;
        }
      }
    } else {
      reset_trapset();
      return;
    }
  }
  await You(S("begin setting %s%s."), await shk_your(P(buf), otmp), G.defsyms[S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(TRAPNUM - 1) + 1 : ttyp) - 1].explanation);
  set_occupation(set_trap, occutext, 0);
  return;
}

async function set_trap(): Promise<number> {
  let otmp = trapinfo.tobj;
  let ttmp = null;
  let ttyp = 0;
  if (!otmp || !(otmp.where === 3) || G.u.ux !== trapinfo.tx || G.u.uy !== trapinfo.ty) {
    reset_trapset();
    return 0;
  }
  if (--trapinfo.time_needed > 0) {
    return 1;
  }
  ttyp = otmp.otyp === LAND_MINE ? LANDMINE : BEAR_TRAP;
  ttmp = await maketrap(G.u.ux, G.u.uy, ttyp);
  if (ttmp) {
    ttmp.madeby_u = 1;
    await feeltrap(ttmp);
    if ($rd(in_rooms(G.u.ux, G.u.uy, SHOPBASE))) {
      await add_damage(G.u.ux, G.u.uy, 0);
    }
    if (!trapinfo.force_bungle) {
      await You(S("finish arming %s."), await the(G.defsyms[S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2(TRAPNUM - 1) + 1 : ttyp) - 1].explanation));
    }
    if ((otmp.cursed | 0 || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic)) && rnl(10) > 5 || trapinfo.force_bungle) {
      await dotrap(ttmp, (trapinfo.force_bungle ? FORCEBUNGLE : 0) >>> 0);
    }
  } else {
    await Your(S("trap setting attempt fails."));
  }
  await useup(otmp);
  reset_trapset();
  return 0;
}

async function use_whip(obj: struct_obj | null): Promise<number> {
  let buf = new Int8Array(256);
  let mtmp = null;
  let otmp = null;
  let rx = 0;
  let ry = 0;
  let proficient = 0;
  let res = 0;
  let msg_slipsfree = S("The bullwhip slips free.");
  let msg_snap = S("Snap!");
  if (obj !== G.uwep) {
    if (!await wield_tool(obj, S("lash"))) {
      return 0;
    } else {
      res = 1;
    }
  }
  if (!await getdir(null)) {
    return res;
  }
  if (G.u.uswallow) {
    mtmp = G.u.ustuck;
    rx = mtmp.mx;
    ry = mtmp.my;
  } else {
    if (G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic && !rn2(5)) {
      confdir();
    }
    rx = G.u.ux + G.u.dx;
    ry = G.u.uy + G.u.dy;
    if (!isok(rx, ry)) {
      await You(S("miss."));
      return res;
    }
    mtmp = !!G.level.monsters[rx][ry] ? G.level.monsters[rx][ry] : null;
  }
  proficient = 0;
  if (G.urole.malenum === 328) {
    ++proficient;
  }
  if (acurr(A_DEX) < 6) {
    --proficient;
  } else if (acurr(A_DEX) >= 14) {
    proficient += acurr(A_DEX) - 14;
  }
  if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) {
    --proficient;
  }
  if (proficient > 3) {
    proficient = 3;
  }
  if (proficient < 0) {
    proficient = 0;
  }
  if (G.u.uswallow | 0 && await attack(G.u.ustuck)) {
    await There(S("is not enough room to flick your bullwhip."));
  } else if (G.u.uinwater) {
    await There(S("is too much resistance to flick your bullwhip."));
  } else if (G.u.dz < 0) {
    await You(S("flick a bug off of the %s."), ceiling(G.u.ux, G.u.uy));
  } else if (!G.u.dx && !G.u.dy || G.u.dz > 0) {
    let dam = 0;
    if (G.u.usteed && !rn2(proficient + 2)) {
      await You(S("whip %s!"), await mon_nam(G.u.usteed));
      await kick_steed();
      return 1;
    }
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || G.u.usteed) {
      otmp = G.level.objects[G.u.ux][G.u.uy];
      if (otmp && otmp.otyp === CORPSE && otmp.corpsenm === PM_HORSE) {
        await pline(S("Why beat a dead horse?"));
        return 1;
      }
      if (otmp && proficient) {
        await You(S("wrap your bullwhip around %s on the %s."), await an(await singular(otmp, xname)), surface(G.u.ux, G.u.uy));
        if (rnl(6) || await pickup_object(otmp, 1, TRUE) < 1) {
          await pline(S("%s"), msg_slipsfree);
        }
        return 1;
      }
    }
    dam = rnd(2) + dbon() + obj.spe;
    if (dam <= 0) {
      dam = 1;
    }
    await You(S("hit your %s with your bullwhip."), body_part(FOOT));
    sprintf(P(buf), S("killed %sself with %s bullwhip"), G.genders[G.flags.female ? 1 : 0].him, G.genders[G.flags.female ? 1 : 0].his);
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dam + 1) / 2 | 0 : dam, P(buf), NO_KILLER_PREFIX);
    return 1;
  } else if ((G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic || G.u.uprops[GLIB].intrinsic) && !rn2(5)) {
    await pline_The(S("bullwhip slips out of your %s."), body_part(HAND));
    await dropx(obj);
  } else if (G.u.utrap && G.u.utraptype === TT_PIT) {
    let wrapped_what = null;
    if (mtmp) {
      if (mtmp.data.msize >= 3) {
        wrapped_what = strcpy(P(buf), await mon_nam(mtmp));
      } else if (proficient) {
        if (await attack(mtmp)) {
          return 1;
        } else {
          await pline(S("%s"), msg_snap);
        }
      }
    }
    if (!wrapped_what) {
      if ($at2(G.level.locations, rx, ry).typ >= STAIRS && $at2(G.level.locations, rx, ry).typ <= ALTAR) {
        wrapped_what = G.c_common_strings.c_something;
      } else if (sobj_at(BOULDER, rx, ry)) {
        wrapped_what = S("a boulder");
      }
    }
    if (wrapped_what) {
      let cc = new struct_nhcoord();
      cc.x = rx << 24 >> 24;
      cc.y = ry << 24 >> 24;
      await You(S("wrap your bullwhip around %s."), wrapped_what);
      if (proficient && rn2(proficient + 2)) {
        if (!mtmp || await enexto(cc, rx, ry, G.youmonst.data)) {
          await You(S("yank yourself out of the pit!"));
          await teleds(cc.x, cc.y, TRUE);
          await reset_utrap(TRUE);
          G.vision_full_recalc = 1;
        }
      } else {
        await pline(S("%s"), msg_slipsfree);
      }
      if (mtmp) {
        await wakeup(mtmp, TRUE);
      }
    } else {
      await pline(S("%s"), msg_snap);
    }
  } else if (mtmp) {
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && !($at2(G.level.locations, rx, ry).glyph === 382 + (382 + 0))) {
      await pline(S("A monster is there that you couldn't see."));
      await map_invisible(rx, ry);
    }
    otmp = mtmp.mw;
    if (otmp) {
      let onambuf = new Int8Array(256);
      let mon_hand = null;
      let gotit = (proficient && (!(G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || !rn2(10)) ? 1 : 0) << 24 >> 24;
      strcpy(P(onambuf), await cxname(otmp));
      if (gotit) {
        mon_hand = mbodypart(mtmp, HAND);
        if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_big | 0) {
          mon_hand = await makeplural(mon_hand);
        }
      } else {
        mon_hand = null;
      }
      await You(S("wrap your bullwhip around %s."), await yname(otmp));
      if (gotit && mwelded(otmp)) {
        await pline(S("%s welded to %s %s%c"), otmp.quan === 1 ? S("It is") : S("They are"), G.genders[pronoun_gender(mtmp, 0)].his, mon_hand, !otmp.bknown ? 33 : 46);
        set_bknown(otmp, 1);
        gotit = FALSE;
      }
      if (gotit) {
        await obj_extract_self(otmp);
        await possibly_unwield(mtmp, FALSE);
        await setmnotwielded(mtmp, otmp);
        switch (rn2(proficient + 1)) {
        case 2:
          await You(S("yank %s to the %s!"), await yname(otmp), surface(G.u.ux, G.u.uy));
          await place_object(otmp, G.u.ux, G.u.uy);
          await stackobj(otmp);
          break;
        case 3:
          await You(S("snatch %s!"), await yname(otmp));
          if (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) && !G.uarmg && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
            let kbuf = new Int8Array(256);
            sprintf(P(kbuf), S("%s corpse"), await an(G.mons[otmp.corpsenm].mname));
            await pline(S("Snatching %s is a fatal mistake."), P(kbuf));
            await instapetrify(P(kbuf));
          }
          await hold_another_object(otmp, S("You drop %s!"), await doname(otmp), null);
          break;
        default:
          await You(S("yank %s from %s %s!"), await the(P(onambuf)), s_suffix(await mon_nam(mtmp)), mon_hand);
          await obj_no_longer_held(otmp);
          await place_object(otmp, mtmp.mx, mtmp.my);
          await stackobj(otmp);
          break;
        }
      } else {
        await pline(S("%s"), msg_slipsfree);
      }
      await wakeup(mtmp, TRUE);
    } else {
      if (mtmp.m_ap_type & 7 && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await stumble_onto_mimic(mtmp);
      } else {
        await You(S("flick your bullwhip towards %s."), await mon_nam(mtmp));
      }
      if (proficient) {
        if (await attack(mtmp)) {
          return 1;
        } else {
          await pline(S("%s"), msg_snap);
        }
      }
    }
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    await You(S("snap your whip through thin air."));
  } else {
    await pline(S("%s"), msg_snap);
  }
  return 1;
}

function find_poleable_mon(pos: struct_nhcoord | null, min_range: number, max_range: number): number {
  let mtmp = null;
  let mpos = new struct_nhcoord();
  let impaired = 0;
  let x = 0;
  let y = 0;
  let lo_x = 0;
  let hi_x = 0;
  let lo_y = 0;
  let hi_y = 0;
  let rt = 0;
  let glyph = 0;
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    return FALSE;
  }
  impaired = (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[STUNNED].intrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? 1 : 0) << 24 >> 24;
  mpos.x = mpos.y = 0;
  rt = isqrt(max_range);
  lo_x = G.u.ux - rt > 1 ? G.u.ux - rt : 1, hi_x = G.u.ux + rt < 80 - 1 ? G.u.ux + rt : 80 - 1;
  lo_y = G.u.uy - rt > 0 ? G.u.uy - rt : 0, hi_y = G.u.uy + rt < 21 - 1 ? G.u.uy + rt : 21 - 1;
  for (x = lo_x; x <= hi_x; ++x) {
    for (y = lo_y; y <= hi_y; ++y) {
      if (dist2(x, y, G.u.ux, G.u.uy) < min_range || dist2(x, y, G.u.ux, G.u.uy) > max_range || !isok(x, y) || !($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
        continue;
      }
      glyph = glyph_at(x, y);
      if (!impaired && (glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) && !!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (mtmp.mtame || mtmp.mpeaceful | 0 && G.flags.confirm)) {
        continue;
      }
      if (glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382 || glyph >= (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) && glyph < (382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))) + 6 || glyph === 382 + (382 + 0) || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 && impaired) {
        if (mpos.x) {
          return FALSE;
        }
        mpos.x = x << 24 >> 24, mpos.y = y << 24 >> 24;
      }
    }
  }
  if (!mpos.x) {
    return FALSE;
  }
  pos.$cp(mpos);
  return TRUE;
}

function get_valid_polearm_position(x: number, y: number): number {
  return (isok(x, y) && $at2(G.level.locations, x, y).typ >= DOOR && dist2(x, y, G.u.ux, G.u.uy) >= polearm_range_min && dist2(x, y, G.u.ux, G.u.uy) <= polearm_range_max ? 1 : 0) << 24 >> 24;
}

async function display_polearm_positions(state: number): Promise<void> {
  if (state === 0) {
    await tmp_at(DISP_BEAM, S_goodpos + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
  } else if (state === 1) {
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    for (dx = -4; dx <= 4; ++dx) {
      for (dy = -4; dy <= 4; ++dy) {
        x = dx + G.u.ux;
        y = dy + G.u.uy;
        if (get_valid_polearm_position(x, y)) {
          await tmp_at(x, y);
        }
      }
    }
  } else {
    await tmp_at(DISP_END, 0);
  }
}

async function use_pole(obj: struct_obj | null): Promise<number> {
  let res = 0;
  let typ = 0;
  let max_range = 0;
  let min_range = 0;
  let glyph = 0;
  let cc = new struct_nhcoord();
  let mtmp = null;
  let hitm = G.context.polearm.hitmon;
  if (G.u.uswallow) {
    await pline(P(not_enough_room));
    return 0;
  }
  if (obj !== G.uwep) {
    if (!await wield_tool(obj, S("swing"))) {
      return 0;
    } else {
      res = 1;
    }
  }
  min_range = 4;
  typ = uwep_skill_type();
  if (typ === P_NONE || G.u.weapon_skills[typ].skill <= P_BASIC) {
    max_range = 4;
  } else if (G.u.weapon_skills[typ].skill === P_SKILLED) {
    max_range = 5;
  } else {
    max_range = 8;
  }
  polearm_range_min = min_range;
  polearm_range_max = max_range;
  await pline(P(where_to_hit));
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  if (!find_poleable_mon(cc, min_range, max_range) && hitm && !(hitm.mhp < 1) && $rd(G.viz_array.a[G.viz_array.o + hitm.my], hitm.mx) & 2 && dist2(hitm.mx, hitm.my, G.u.ux, G.u.uy) <= max_range && dist2(hitm.mx, hitm.my, G.u.ux, G.u.uy) >= min_range) {
    cc.x = hitm.mx;
    cc.y = hitm.my;
  }
  getpos_sethilite(display_polearm_positions, get_valid_polearm_position);
  if (await getpos(cc, TRUE, S("the spot to hit")) < 0) {
    return res;
  }
  glyph = glyph_at(cc.x, cc.y);
  if (dist2(cc.x, cc.y, G.u.ux, G.u.uy) > max_range) {
    await pline(S("Too far!"));
    return res;
  } else if (dist2(cc.x, cc.y, G.u.ux, G.u.uy) < min_range) {
    await pline(S("Too close!"));
    return res;
  } else if (!($rd(G.viz_array.a[G.viz_array.o + cc.y], cc.x) & 2) && !(glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) && !(glyph === 382 + (382 + 0)) && !(glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382)) {
    await You(P(cant_see_spot));
    return res;
  } else if (!($rd(G.viz_array.a[G.viz_array.o + cc.y], cc.x) & 1)) {
    await You(P(cant_reach));
    return res;
  }
  G.context.polearm.hitmon = null;
  G.bhitpos.$cp(cc);
  if (!!(mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null)) {
    if (await attack_checks(mtmp, G.uwep)) {
      return res;
    }
    if (await overexertion()) {
      return 1;
    }
    G.context.polearm.hitmon = mtmp;
    await check_caitiff(mtmp);
    G.notonhead = (G.bhitpos.x !== mtmp.mx || G.bhitpos.y !== mtmp.my ? 1 : 0) << 24 >> 24;
    await thitmonst(mtmp, G.uwep);
  } else if (glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 && sobj_at(STATUE, G.bhitpos.x, G.bhitpos.y)) {
    let t = t_at(G.bhitpos.x, G.bhitpos.y);
    if (t && (t.ttyp | 0) === STATUE_TRAP && await activate_statue_trap(t, t.tx, t.ty, FALSE)) {
      ;
    } else {
      await pline(S("Thump!  Your blow bounces harmlessly off the statue."));
      wake_nearto(G.bhitpos.x, G.bhitpos.y, 25);
    }
  } else {
    await unmap_invisible(G.bhitpos.x, G.bhitpos.y);
    await You(S("miss; there is no one there to hit."));
  }
  await u_wipe_engr(2);
  return 1;
}

async function use_cream_pie(obj: struct_obj | null): Promise<number> {
  let wasblind = ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? 1 : 0) << 24 >> 24;
  let wascreamed = G.u.ucreamed << 24 >> 24;
  let several = FALSE;
  if (obj.quan > 1) {
    several = TRUE;
    obj = await splitobj(obj, 1);
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await You(S("give yourself a facial."));
  } else {
    await pline(S("You immerse your %s in %s%s."), body_part(FACE), several ? S("one of ") : S(""), several ? await makeplural(await the(await xname(obj))) : await the(await xname(obj)));
  }
  if (can_blnd(null, G.youmonst, AT_WEAP, obj)) {
    let blindinc = rnd(25);
    G.u.ucreamed = G.u.ucreamed + (blindinc >>> 0) >>> 0;
    await make_blinded(G.u.uprops[BLINDED].intrinsic + blindinc, FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && wasblind) {
      await pline(S("There's %ssticky goop all over your %s."), wascreamed ? S("more ") : S(""), body_part(FACE));
    } else {
      await You_cant(S("see through all the sticky goop on your %s."), body_part(FACE));
    }
  }
  await setnotworn(obj);
  await costly_alteration(obj, COST_SPLAT);
  await obj_extract_self(obj);
  await delobj(obj);
  return 0;
}

async function use_grapple(obj: struct_obj | null): Promise<number> {
  let res = 0;
  let typ = 0;
  let max_range = 4;
  let tohit = 0;
  let save_confirm = 0;
  let cc = new struct_nhcoord();
  let mtmp = null;
  let otmp = null;
  if (G.u.uswallow) {
    await pline(P(not_enough_room));
    return 0;
  }
  if (obj !== G.uwep) {
    if (!await wield_tool(obj, S("cast"))) {
      return 0;
    } else {
      res = 1;
    }
  }
  await pline(P(where_to_hit));
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  if (await getpos(cc, TRUE, S("the spot to hit")) < 0) {
    return res;
  }
  typ = uwep_skill_type();
  if (typ === P_NONE || G.u.weapon_skills[typ].skill <= P_BASIC) {
    max_range = 4;
  } else if (G.u.weapon_skills[typ].skill === P_SKILLED) {
    max_range = 5;
  } else {
    max_range = 8;
  }
  if (dist2(cc.x, cc.y, G.u.ux, G.u.uy) > max_range) {
    await pline(S("Too far!"));
    return res;
  } else if (!($rd(G.viz_array.a[G.viz_array.o + cc.y], cc.x) & 2)) {
    await You(P(cant_see_spot));
    return res;
  } else if (!($rd(G.viz_array.a[G.viz_array.o + cc.y], cc.x) & 1)) {
    await You(P(cant_reach));
    return res;
  }
  tohit = rn2(5);
  if (typ !== P_NONE && G.u.weapon_skills[typ].skill >= P_SKILLED) {
    let tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    let any = new union_any();
    let buf = new Int8Array(256);
    const selected = [null];
    any.$cp(G.zeroany);
    any.a_int = 1;
    await G.windowprocs.win_start_menu(tmpwin);
    ++any.a_int;
    sprintf(P(buf), S("an object on the %s"), surface(cc.x, cc.y));
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    ++any.a_int;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S("a monster"), MENU_UNSELECTED);
    ++any.a_int;
    sprintf(P(buf), S("the %s"), surface(cc.x, cc.y));
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    await G.windowprocs.win_end_menu(tmpwin, S("Aim for what?"));
    tohit = rn2(4);
    if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(selected, 0)) > 0 && rn2(G.u.weapon_skills[typ].skill > P_SKILLED ? 20 : 2)) {
      tohit = selected[0].item.a_int - 1;
    }
    free(selected[0]);
    await G.windowprocs.win_destroy_nhwindow(tmpwin);
  }
  if (tohit === 2 || !rn2(2)) {
    await u_wipe_engr(rnd(2));
  }
  switch (tohit) {
  case 0:
    break;
  case 1:
    if (!!(otmp = G.level.objects[cc.x][cc.y])) {
      await You(S("snag an object from the %s!"), surface(cc.x, cc.y));
      await pickup_object(otmp, 1, FALSE);
      await newsym(cc.x, cc.y);
      return 1;
    }
    break;
  case 2:
    G.bhitpos.$cp(cc);
    if (!(mtmp = !!G.level.monsters[cc.x][cc.y] ? G.level.monsters[cc.x][cc.y] : null)) {
      break;
    }
    G.notonhead = (G.bhitpos.x !== mtmp.mx || G.bhitpos.y !== mtmp.my ? 1 : 0) << 24 >> 24;
    save_confirm = G.flags.confirm;
    if (mtmp.data.msize < 1 && !rn2(4) && await enexto(cc, G.u.ux, G.u.uy, null)) {
      G.flags.confirm = FALSE;
      await attack_checks(mtmp, G.uwep);
      G.flags.confirm = save_confirm;
      await check_caitiff(mtmp);
      await You(S("pull in %s!"), await mon_nam(mtmp));
      mtmp.mundetected = 0;
      await rloc_to(mtmp, cc.x, cc.y);
      return 1;
    } else if (!(mtmp.data.msize >= 3) && !((mtmp.data.mflags2 & 67108864) >>> 0 !== 0) || rn2(4)) {
      G.flags.confirm = FALSE;
      await attack_checks(mtmp, G.uwep);
      G.flags.confirm = save_confirm;
      await check_caitiff(mtmp);
      await thitmonst(mtmp, G.uwep);
      return 1;
    }
  case 3:
    if ($at2(G.level.locations, cc.x, cc.y).typ === AIR || $at2(G.level.locations, cc.x, cc.y).typ === CLOUD || is_pool(cc.x, cc.y)) {
      await pline_The(S("hook slices through the %s."), surface(cc.x, cc.y));
    } else {
      await You(S("are yanked toward the %s!"), surface(cc.x, cc.y));
      await hurtle(sgn(cc.x - G.u.ux), sgn(cc.y - G.u.uy), 1, FALSE);
      await spoteffects(TRUE);
    }
    return 1;
  default:
    if (G.u.weapon_skills[typ].skill <= P_BASIC) {
      await You(S("hook yourself!"));
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rn2(10) + 10 + 1) / 2 | 0 : rn2(10) + 10, S("a grappling hook"), KILLED_BY);
      return 1;
    }
    break;
  }
  await pline(S("%s"), G.c_common_strings.c_nothing_happens);
  return 1;
}

async function do_break_wand(obj: struct_obj | null): Promise<number> {
  let $g = 0;
  let i = 0;
  let x = 0;
  let y = 0;
  let mon = null;
  let dmg = 0;
  let damage = 0;
  let affects_objects = 0;
  let shop_damage = 0;
  let fillmsg = 0;
  let expltype = 0;
  let confirm = new Int8Array(128);
  let buf = new Int8Array(256);
  let is_fragile = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      shop_damage = FALSE;
      fillmsg = FALSE;
      expltype = EXPL_MAGICAL;
      confirm = new Int8Array(128);
      buf = new Int8Array(256);
      is_fragile = (!strcmp(G.obj_descr[G.objects[obj.otyp].oc_descr_idx].oc_descr, S("balsa")) ? 1 : 0) << 24 >> 24;
      if (!await paranoid_query((G.flags.paranoia_bits & 128) >>> 0 !== 0 ? 1 : 0, await safe_qbuf(P(confirm), S("Are you really sure you want to break "), S("?"), obj, yname, ysimple_name, S("the wand")))) {
        return 0;
      }
      if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
        await You_cant(S("break %s without hands!"), await yname(obj));
        return 0;
      } else if (acurr(A_STR) < (is_fragile ? 5 : 10)) {
        await You(S("don't have the strength to break %s!"), await yname(obj));
        return 0;
      }
      await pline(S("Raising %s high above your %s, you %s it in two!"), await yname(obj), body_part(HEAD), is_fragile ? S("snap") : S("break"));
      if (obj.unpaid) {
        await check_unpaid(obj);
        await costly_alteration(obj, COST_DSTROY);
      }
      G.current_wand = obj;
      await freeinv(obj);
      await setnotworn(obj);
      if (!await zappable(obj)) {
        await pline(P(do_break_wand$nothing_else_happens));
        { $g = 1; continue $L; }
      }
      obj.spe = obj.spe + 1 << 24 >> 24;
      if (!obj.spe) {
        obj.spe = rnd(3) << 24 >> 24;
      }
      obj.ox = G.u.ux;
      obj.oy = G.u.uy;
      dmg = obj.spe * 4;
      affects_objects = FALSE;
      switch (obj.otyp) {
      case 388: { $g = 4; continue $L; }
      case 389: { $g = 5; continue $L; }
      case 399: { $g = 6; continue $L; }
      case 400: { $g = 7; continue $L; }
      case 386: { $g = 8; continue $L; }
      case 398: { $g = 9; continue $L; }
      case 385: { $g = 10; continue $L; }
      case 406: { $g = 11; continue $L; }
      case 407: { $g = 12; continue $L; }
      case 403: { $g = 13; continue $L; }
      case 404: { $g = 14; continue $L; }
      case 402: { $g = 15; continue $L; }
      case 390: { $g = 16; continue $L; }
      case 396: { $g = 17; continue $L; }
      case 395: { $g = 18; continue $L; }
      case 397: { $g = 19; continue $L; }
      case 394: { $g = 20; continue $L; }
      default: { $g = 21; continue $L; }
      }
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      await pline(P(do_break_wand$nothing_else_happens));
      { $g = 1; continue $L; }
    case 11:
    case 12:
      dmg = dmg * 4;
      { $g = 2; continue $L; }
    case 13:
      expltype = EXPL_FIERY;
    case 14:
      if (expltype === EXPL_MAGICAL) {
        expltype = EXPL_FROSTY;
      }
      dmg = dmg * 2;
    case 15:
    case 2: // wanexpl
      await explode(G.u.ux, G.u.uy, -obj.otyp, dmg, WAND_CLASS, expltype);
      await discover_object(obj.otyp, 1, 1);
      { $g = 1; continue $L; }
    case 16:
      await pline(S("A wall of force smashes down around you!"));
      dmg = d(1 + obj.spe, 6);
    case 17:
    case 18:
    case 19:
    case 20:
      affects_objects = TRUE;
      { $g = 3; continue $L; };
    case 21:
      { $g = 3; continue $L; };
    case 3:
      await explode(obj.ox, obj.oy, -obj.otyp, rnd(dmg), WAND_CLASS, EXPL_MAGICAL);
      zapsetup();
      for (i = 0; i <= 8; ++i) {
        G.bhitpos.x = (x = obj.ox + G.xdir[i]) << 24 >> 24;
        G.bhitpos.y = (y = obj.oy + G.ydir[i]) << 24 >> 24;
        if (!isok(x, y)) {
          continue;
        }
        if (obj.otyp === WAN_DIGGING) {
          let typ = 0;
          if (await dig_check(null, FALSE, x, y)) {
            if ($at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL || $at2(G.level.locations, x, y).typ === DOOR) {
              await watch_dig(null, x, y, TRUE);
              if ($rd(in_rooms(x, y, SHOPBASE))) {
                shop_damage = TRUE;
              }
            }
            typ = fillholetyp(x, y, FALSE);
            if (typ !== ROOM) {
              $at2(G.level.locations, x, y).typ = typ, $at2(G.level.locations, x, y).flags = 0;
              await liquid_flow(x, y, typ, t_at(x, y), fillmsg ? null : S("Some holes are quickly filled with %s!"));
              fillmsg = TRUE;
            } else {
              await digactualhole(x, y, null, rn2(obj.spe) < 3 || !Can_dig_down(G.u.uz) && !$at2(G.level.locations, x, y).candig ? PIT : HOLE);
            }
          }
          continue;
        } else if (obj.otyp === WAN_CREATE_MONSTER) {
          await makemon(null, G.u.ux, G.u.uy, NO_MM_FLAGS);
          continue;
        } else if (x !== G.u.ux || y !== G.u.uy) {
          if (!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
            await bhitm(mon, obj);
          }
          if (affects_objects && G.level.objects[x][y]) {
            await bhitpile(obj, bhito, x, y, 0);
            if (G.context.botl) {
              await bot();
            }
          }
        } else {
          if (affects_objects && G.level.objects[x][y]) {
            await bhitpile(obj, bhito, x, y, 0);
            if (G.context.botl) {
              await bot();
            }
          }
          damage = await zapyourself(obj, FALSE);
          if (damage) {
            sprintf(P(buf), S("killed %sself by breaking a wand"), G.genders[G.flags.female ? 1 : 0].him);
            await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (damage + 1) / 2 | 0 : damage, P(buf), NO_KILLER_PREFIX);
          }
          if (G.context.botl) {
            await bot();
          }
        }
      }
      await zapwrapup();
      if (shop_damage) {
        await pay_for_damage(S("dig into"), FALSE);
      }
      if (obj.otyp === WAN_LIGHT) {
        await litroom(TRUE, obj);
      }
    case 1: // discard_broken_wand
      obj = G.current_wand;
      G.current_wand = null;
      if (obj) {
        await delobj(obj);
      }
      nomul(0);
      return 1;
    }
    break;
  }
}

function add_class(cl: Ptr | null, class_: number): void {
  let tmp = new Int8Array(2);
  tmp[0] = class_;
  tmp[1] = 0;
  strcat(cl, P(tmp));
}

function setapplyclasses(class_list: Ptr | null): void {
  let otmp = null;
  let otyp = 0;
  let knowoil = 0;
  let knowtouchstone = 0;
  let addpotions = 0;
  let addstones = 0;
  let addfood = 0;
  knowoil = G.objects[POT_OIL].oc_name_known << 24 >> 24;
  knowtouchstone = G.objects[TOUCHSTONE].oc_name_known << 24 >> 24;
  addpotions = addstones = addfood = FALSE;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    otyp = otmp.otyp;
    if (otyp === POT_OIL || otmp.oclass === POTION_CLASS && (!otmp.dknown || !knowoil && !G.objects[otyp].oc_name_known)) {
      addpotions = TRUE;
    }
    if (otyp === TOUCHSTONE || (otmp.otyp === 443 || otmp.otyp === 444 || otmp.otyp === 446 || otmp.otyp === 445) && (!otmp.dknown || !knowtouchstone && !G.objects[otyp].oc_name_known)) {
      addstones = TRUE;
    }
    if (otyp === CREAM_PIE || otyp === EUCALYPTUS_LEAF) {
      addfood = TRUE;
    }
  }
  class_list.a[class_list.o] = 0;
  if (addpotions || addstones) {
    add_class(class_list, ALL_CLASSES);
  }
  strcat(class_list, P(tools));
  if (addpotions) {
    add_class(class_list, POTION_CLASS);
  }
  if (addstones) {
    add_class(class_list, GEM_CLASS);
  }
  if (addfood) {
    add_class(class_list, FOOD_CLASS);
  }
}

export async function doapply(): Promise<number> {
  const obj = [null];
  let res = 1;
  let class_list = new Int8Array(20);
  if (await check_capacity(null)) {
    return 0;
  }
  setapplyclasses(P(class_list));
  obj[0] = await getobj(P(class_list), S("use or apply"));
  if (!obj[0]) {
    return 0;
  }
  if (!await retouch_object(P(obj, 0), FALSE)) {
    return 1;
  }
  if (obj[0].oclass === WAND_CLASS) {
    return await do_break_wand(obj[0]);
  }
  switch (obj[0].otyp) {
  case 208:
  case 207:
    if (obj[0] === G.ublindf) {
      if (!await cursed(obj[0])) {
        await Blindf_off(obj[0]);
      }
    } else if (!G.ublindf) {
      await Blindf_on(obj[0]);
    } else {
      await You(S("are already %s."), G.ublindf.otyp === TOWEL ? S("covered by a towel") : G.ublindf.otyp === BLINDFOLD ? S("wearing a blindfold") : S("wearing lenses"));
    }
    break;
  case 262:
    res = await use_cream_pie(obj[0]);
    break;
  case 64:
    res = await use_whip(obj[0]);
    break;
  case 235:
    res = await use_grapple(obj[0]);
    break;
  case 189:
  case 190:
  case 191:
  case 192:
  case 194:
  case 193:
    res = await use_container(P(obj, 0), 1, FALSE);
    break;
  case 195:
    await bagotricks(obj[0], FALSE, null);
    break;
  case 215:
    await use_grease(obj[0]);
    break;
  case 197:
  case 198:
  case 196:
    res = await pick_lock(obj[0]) !== 0 ? 1 : 0;
    break;
  case 234:
  case 50:
    res = await use_pick_axe(obj[0]);
    break;
  case 213:
    await use_tinning_kit(obj[0]);
    break;
  case 211:
    res = await use_leash(obj[0]);
    break;
  case 210:
    res = await use_saddle(obj[0]);
    break;
  case 221:
    await use_magic_whistle(obj[0]);
    break;
  case 220:
    await use_whistle(obj[0]);
    break;
  case 251:
    if (obj[0].blessed) {
      await use_magic_whistle(obj[0]);
      if (!rn2(49)) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s %s."), await Yobjnam2(obj[0], S("glow")), hcolor(S("brown")));
          set_bknown(obj[0], 1);
        }
        await unbless(obj[0]);
      }
    } else {
      await use_whistle(obj[0]);
    }
    break;
  case 212:
    res = await use_stethoscope(obj[0]);
    break;
  case 205:
    res = await use_mirror(obj[0]);
    break;
  case 230:
  case 238:
    await use_bell(P(obj, 0));
    break;
  case 237:
    await use_candelabrum(obj[0]);
    break;
  case 200:
  case 199:
    await use_candle(P(obj, 0));
    break;
  case 202:
  case 203:
  case 201:
    await use_lamp(obj[0]);
    break;
  case 296:
    await light_cocktail(P(obj, 0));
    break;
  case 204:
    res = await use_camera(obj[0]);
    break;
  case 209:
    res = await use_towel(obj[0]);
    break;
  case 206:
    await use_crystal_ball(P(obj, 0));
    break;
  case 217:
    res = await dowrite(obj[0]);
    break;
  case 214:
    res = await use_tin_opener(obj[0]);
    break;
  case 216:
    await use_figurine(P(obj, 0));
    break;
  case 236:
    await use_unicorn_horn(obj[0]);
    break;
  case 222:
  case 223:
  case 224:
  case 225:
  case 226:
  case 228:
  case 229:
  case 231:
  case 232:
  case 233:
    res = await do_play_instrument(obj[0]);
    break;
  case 227:
    await hornoplenty(obj[0], FALSE);
    break;
  case 218:
  case 219:
    await use_trap(obj[0]);
    break;
  case 446:
  case 443:
  case 444:
  case 445:
    await use_stone(obj[0]);
    break;
  default:
    if ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === TOOL_CLASS) && (G.objects[obj[0].otyp].oc_subtyp === P_POLEARMS || G.objects[obj[0].otyp].oc_subtyp === P_LANCE)) {
      res = await use_pole(obj[0]);
      break;
    } else if ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === TOOL_CLASS) && G.objects[obj[0].otyp].oc_subtyp === P_PICK_AXE || (obj[0].oclass === WEAPON_CLASS || obj[0].oclass === TOOL_CLASS) && G.objects[obj[0].otyp].oc_subtyp === P_AXE) {
      res = await use_pick_axe(obj[0]);
      break;
    }
    await pline(S("Sorry, I don't know how to use that."));
    nomul(0);
    return 0;
  }
  if (res && obj[0] && obj[0].oartifact) {
    await arti_speak(obj[0]);
  }
  nomul(0);
  return res;
}

export function unfixable_trouble_count(is_horn: number): number {
  let unfixable_trbl = 0;
  if (G.u.uprops[STONED].intrinsic) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    ++unfixable_trbl;
  }
  if ((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) && !G.u.usteed) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[SICK].intrinsic && (!is_horn || (G.u.uprops[SICK].intrinsic & ~TIMEOUT) !== 0)) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[STUNNED].intrinsic && (!is_horn || (G.u.uprops[STUNNED].intrinsic & ~TIMEOUT) !== 0)) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[CONFUSION].intrinsic && (!is_horn || (G.u.uprops[CONFUSION].intrinsic & ~TIMEOUT) !== 0)) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && (!is_horn || (G.u.uprops[HALLUC].intrinsic & ~TIMEOUT) !== 0)) {
    ++unfixable_trbl;
  }
  if (G.u.uprops[VOMITING].intrinsic && (!is_horn || (G.u.uprops[VOMITING].intrinsic & ~TIMEOUT) !== 0)) {
    ++unfixable_trbl;
  }
  if ((G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && (!is_horn || (G.u.uprops[DEAF].intrinsic & ~TIMEOUT) !== 0)) {
    ++unfixable_trbl;
  }
  return unfixable_trbl;
}

export function $init(): void {
  no_elbow_room = $cs("don't have enough elbow-room to maneuver.", 42);
  hollow_str = $cs("a hollow sound.  This must be a secret %s!", 43);
  whistle_str = $cs("produce a %s whistling sound.", 30);
  alt_whistle_str = $cs("produce a %s, sharp vibration.", 31);
  look_str = $cs("look %s.", 9);
  cuddly = $ta(Int8Array, 3, [TOOL_CLASS, GEM_CLASS]);
  jumping_is_magic = 0;
  lubricables = $ta(Int8Array, 3, [ALL_CLASSES, ALLOW_NONE]);
  trapinfo = new struct_trapinfo();
  not_enough_room = $cs("There's not enough room here to use that.", 42);
  where_to_hit = $cs("Where do you want to hit?", 26);
  cant_see_spot = $cs("won't hit anything if you can't see that spot.", 47);
  cant_reach = $cs("can't reach that spot from here.", 33);
  polearm_range_min = -1;
  polearm_range_max = -1;
  tools = $ta(Int8Array, 4, [TOOL_CLASS, WEAPON_CLASS, WAND_CLASS]);
  use_tinning_kit$you_buy_it = $cs("You tin it, you bought it!", 27);
  use_stone$scritch = $cs("\"scritch, scritch\"", 19);
  use_stone$allowall = $ta(Int8Array, 3, [COIN_CLASS, ALL_CLASSES]);
  use_stone$coins_gems = $ta(Int8Array, 3, [COIN_CLASS, GEM_CLASS]);
  do_break_wand$nothing_else_happens = $cs("But nothing else happens...", 28);
}
