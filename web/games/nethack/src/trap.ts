// @ts-nocheck
// NetHack 3.6.7 trap.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { catch_lit, check_leash, next_to_u, number_leashed, snuff_lit, unleash_all } from './apply.ts';
import { defends_when_carried, has_magic_key, undiscovered_artifact } from './artifact.ts';
import { acurr, adjalign, adjattrib, change_luck, exercise, poisoned } from './attrib.ts';
import { ballfall, drag_ball, move_bc, placebc, unplacebc } from './ball.ts';
import { bot } from './botl.ts';
import { getdir, isok, yn_function } from './cmd.ts';
import { destroy_drawbridge, find_drawbridge, is_drawbridge_wall, is_ice, is_lava, is_pool, is_pool_or_lava } from './dbridge.ts';
import { buried_ball, bury_an_obj, unearth_objs } from './dig.ts';
import { curs_on_u, feel_newsym, map_invisible, map_trap, newsym, shieldeff, tmp_at, under_water } from './display.ts';
import { dropx, flooreffects, schedule_goto, set_wounded_legs } from './do.ts';
import { Monnam, a_monnam, christen_monst, free_oname, hcolor, hliquid, mon_nam, noit_Monnam, rndcolor, rndmonnam, x_monnam, y_monnam } from './do_name.ts';
import { Boots_off } from './do_wear.ts';
import { abuse_dog, tamedog, wary_dog } from './dog.ts';
import { down_gate, impact_drop, ship_object } from './dokick.ts';
import { Can_fall_thru, In_hell, In_quest, assign_level, at_dgn_entrance, depth, dunlev, dunlevs_in_dungeon, find_hell, get_level, level_difficulty, on_level } from './dungeon.ts';
import { is_fainted, reset_faint } from './eat.ts';
import { done, panic } from './end.ts';
import { can_reach_floor, ceiling, del_engr_at, surface } from './engrave.ts';
import { more_experienced, newexplevel } from './exper.ts';
import { scatter } from './explode.ts';
import { bad_rock, check_capacity, crawl_destination, in_rooms, inv_cnt, inv_weight, losehp, movobj, near_capacity, nomul, spoteffects, unmul, weight_cap } from './hack.ts';
import { dist2, distmin, eos, s_suffix, sgn, strncmpi, strsubst, upstart } from './hacklib.ts';
import { carrying, consume_obj_charge, currency, delobj, getobj, nxtobj, sobj_at, stackobj, update_inventory, useup, useupall } from './invent.ts';
import { stumble_on_door_mimic } from './lock.ts';
import { makemon, set_malign } from './makemon.ts';
import { sleep_monst } from './mhitm.ts';
import { waterbody_name } from './mkmaze.ts';
import { add_to_container, add_to_migration, costly_alteration, dealloc_obj, is_flammable, is_rottable, mkcorpstat, mksobj, obj_extract_self, place_object, rndmonnum, splitobj, weight } from './mkobj.ts';
import { killed, mon_to_stone, mondied, mongone, monkilled, monstone, newcham, seemimic, setmangry, vamp_stone, wake_nearby, wake_nearto, wakeup, xkilled } from './mon.ts';
import { attacktype, locomotion, monsndx, poly_when_stoned, resists_blnd, resists_magm, stagger, sticks } from './mondata.ts';
import { closed_door } from './monmove.ts';
import { hits_bars, m_carrying, ohitmon, thitu } from './mthrowu.ts';
import { discover_object } from './o_init.ts';
import { The, Tobjnam, Yname2, Yobjnam2, an, ansimpleoname, aobjnam, cloak_simple_name, corpse_xname, cxname, doname, erosion_matters, helm_simple_name, makeplural, otense, safe_qbuf, simpleonames, suit_simple_name, the, vtense, xname } from './objnam.ts';
import { encumber_msg, pickup } from './pickup.ts';
import { Norep, There, You, You_cant, You_feel, You_hear, You_see, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, float_vs_flight, mbodypart, polymon, polyself } from './polyself.ts';
import { incr_itimeout, make_blinded, make_hallucinated, make_stunned, split_mon } from './potion.ts';
import { is_quest_artifact, quest_info } from './questpgr.ts';
import { cant_revive, seffects, unpunish } from './read.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { add_damage, costly_spot, delete_contents, inside_shop, make_angry_shk, obfree, sellobj, shk_your, shop_keeper, shopdig, stolen_value } from './shk.ts';
import { mpickobj, remove_worn_item } from './steal.ts';
import { can_ride, can_saddle, dismount_steed, rider_cant_reach } from './steed.ts';
import { domagicportal, dotele, level_tele_trap, mlevel_tele_trap, mtele_trap, random_teleport_level, rloco, safe_teleds, tele_trap, teleds } from './teleport.ts';
import { burn_away_slime, fall_asleep } from './timeout.ts';
import { stumble_onto_mimic } from './uhitm.ts';
import { unblock_point, vision_recalc } from './vision.ts';
import { dmgval, dry_a_towel, mwepgone, wet_a_towel } from './weapon.ts';
import { uswapwepgone, uwepgone, welded } from './wield.ts';
import { count_wsegs, worm_known } from './worm.ts';
import { find_mac, m_dowear, mon_adjust_speed, setnotworn, which_armor } from './worn.ts';
import { burn_floor_objects, destroy_item, destroy_mitem, fracture_rock, get_obj_location, melt_ice, montraits, obj_resists, resist } from './zap.ts';
import { anon_trap_c_1709, struct_d_level, struct_h2o_ctx, struct_monst, struct_nhcoord, struct_obj, struct_trap, union_vlaunchinfo } from './structs.ts';
import { $at2, $cs, $peq, $rd, $sat, $ta, $wr, G, P, S, free, memset, rn2_on_display_rng, sprintf, strcat, strchr, strcmp, strcpy, strncmp } from './rt/index.ts';
import { AD_ELEC, AD_FIRE, AD_MAGM, AD_PHYS, AD_RBRE, ALL_CLASSES, ALTAR, ANIMATE_NORMAL, ANIMATE_SHATTER, ANIMATE_SPELL, ANTIMAGIC, ANTI_MAGIC, ARM, ARROW, ARROW_TRAP, ARTICLE_NONE, ARTICLE_THE, ARTICLE_YOUR, ART_MAGICBANE, AS_MON_IS_UNIQUE, AS_NO_MON, AS_OK, AT_BREA, AT_MAGC, A_CHA, A_CON, A_DEX, A_LAWFUL, A_STR, A_WIS, BEARTRAP, BEAR_TRAP, BLINDED, BOLT_LIM, BOULDER, BURNING, CAN_OF_GREASE, CONFUSION, COPPER, CORPSE, CORPSTAT_NONE, CORR, COST_BURN, COST_CORRODE, COST_ROT, COST_RUST, CXN_PFX_THE, DART, DART_TRAP, DBWALL, DEAF, DETECT_MONSTERS, DISMOUNT_FELL, DISMOUNT_GENERIC, DISMOUNT_POLY, DISP_END, DISP_FLASH, DISSOLVED, DOOR, DRAGON_HIDE, DRAWBRIDGE_DOWN, DROWNING, D_BROKEN, D_NODOOR, D_TRAPPED, EF_DESTROY, EF_GREASE, EF_NONE, EF_PAY, EF_VERBOSE, ERODE_BURN, ERODE_CORRODE, ERODE_RUST, ER_DAMAGED, ER_DESTROYED, ER_GREASED, ER_NOTHING, EXPL_MAX, FAILEDUNTRAP, FALSE, FINGER, FIRE_HORN, FIRE_RES, FIRE_TRAP, FLYING, FOOT, FORCEBUNGLE, FORCETRAP, FREE_ACTION, FUMBLING, GRAVE, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, HAND, HEAD, HOLE, HVY_ENCUMBER, INFRAVISION, IRON, IRONBARS, I_SPECIAL, KILLED_BY, KILLED_BY_AN, LANDMINE, LAND_MINE, LAUNCH_KNOWN, LAUNCH_UNSEEN, LEFT_SIDE, LEG, LEVEL_TELEP, LEVITATION, LIFESAVED, LOADSTONE, LOW_PM, MAGICAL_BREATHING, MAGIC_PORTAL, MAGIC_TRAP, MAXPCHARS, MAXULEV, MAX_ERODE, MAY_DESTROY, MAY_FRACTURE, MAY_HIT, MIGR_RANDOM, MITHRIL, MM_ADJACENTOK, MM_NOCOUNTBIRTH, MS_GUARDIAN, MZ_HUGE, MZ_SMALL, M_AP_FURNITURE, M_AP_OBJECT, NOTELL, NOWEBMSG, NO_KILLER_PREFIX, NO_MINVENT, NO_MM_FLAGS, OBJ_FLOOR, OILSKIN_SACK, PASSES_WALLS, PIT, PM_BUGBEAR, PM_DOPPELGANGER, PM_FLESH_GOLEM, PM_FOG_CLOUD, PM_GELATINOUS_CUBE, PM_GREMLIN, PM_IRON_GOLEM, PM_OWLBEAR, PM_PIT_FIEND, PM_PIT_VIPER, PM_STEAM_VORTEX, PM_STONE_GOLEM, PM_WATER_ELEMENTAL, PM_WUMPUS, POLY_TRAP, POOL, POTION_CLASS, POT_ACID, POT_OIL, POT_WATER, P_BASIC, P_RIDING, RECURSIVETRAP, RIGHT_SIDE, RING_CLASS, ROCK, ROCKTRAP, ROLL, ROLLING_BOULDER_TRAP, ROOM, RUST_TRAP, SADDLE, SCORR, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_FIRE, SCR_MAIL, SCR_REMOVE_CURSE, SDOOR, SEE_INVIS, SHOCK_RES, SHOPBASE, SHOP_HOLE_COST, SLEEP_RES, SLIMED, SLP_GAS_TRAP, SLT_ENCUMBER, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_FIREBALL, SPE_NOVEL, SPIKED_PIT, SPINE, SQKY_BOARD, STAIRS, STATUE, STATUE_FEMALE, STATUE_HISTORIC, STATUE_MALE, STATUE_TRAP, STONE, STONE_RES, STONING, STUNNED, SUPPRESS_SADDLE, SWIMMING, S_DRAGON, S_EYE, S_GIANT, S_GOLEM, S_HUMAN, S_LIGHT, S_MIMIC, S_UNICORN, S_VORTEX, S_arrow_trap, TELEPAT, TELEPORT, TELEPORT_CONTROL, TELEP_TRAP, TIMEOUT, TOOKPLUNGE, TOOL_CLASS, TOWEL, TRAPDOOR, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, TT_WEB, UNCHANGING, UNENCUMBERED, VIASITTING, VIBRATING_SQUARE, VIS_EFFECTS, WAND_CLASS, WAN_FIRE, WARN_OF_MON, WEAPON_CLASS, WEB, WOOD, WWALKING, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMS, W_ARMU, W_SADDLE, W_SWAPWEP, W_WEP, XKILL_NOMSG } from './consts.ts';

let force_mintrap: number;
let a_your: any;
let A_Your: any;
let tower_of_flame: any;
let A_gush_of_water_hits: Ptr | null;
let blindgas: any;
let launchplace: anon_trap_c_1709;
let acid_ctx: struct_h2o_ctx;
let oil: any;
let lava_killer: any;
let erode_obj$action: any;
let erode_obj$msg: any;
let erode_obj$bythe: any;
let grease_protect$txt: any;
let maketrap$zero_vl: union_vlaunchinfo;
let animate_statue$historic_statue_is_gone: any;
let dotrap$recursive_mine: number;
let trapnote$tnbuf: any;
let sink_into_lava$sink_deeper: any;

export async function burnarmor(victim: struct_monst | null): Promise<number> {
  let item = null;
  let buf = new Int8Array(256);
  let mat_idx = 0;
  let oldspe = 0;
  let hitting_u = 0;
  if (!victim) {
    return 0;
  }
  hitting_u = (victim === G.youmonst ? 1 : 0) << 24 >> 24;
  item = hitting_u ? carrying(TOWEL) : m_carrying(victim, TOWEL);
  while (item) {
    if (item.otyp === 209 && item.spe > 0) {
      oldspe = item.spe;
      await dry_a_towel(item, rn2(oldspe + 1), TRUE);
      if (item.spe !== oldspe) {
        break;
      }
    }
    item = item.nobj;
  }
  while (1) {
    switch (rn2(5)) {
    case 0:
      item = hitting_u ? G.uarmh : await which_armor(victim, W_ARMH);
      if (item) {
        mat_idx = G.objects[item.otyp].oc_material | 0;
        sprintf(P(buf), S("%s %s"), G.materialnm[mat_idx], helm_simple_name(item));
      }
      if (!await erode_obj(item, item ? P(buf) : S("helmet"), 0, 1)) {
        continue;
      }
      break;
    case 1:
      item = hitting_u ? G.uarmc : await which_armor(victim, W_ARMC);
      if (item) {
        await erode_obj(item, cloak_simple_name(item), 0, 1);
        return TRUE;
      }
      item = hitting_u ? G.uarm : await which_armor(victim, W_ARM);
      if (item) {
        await erode_obj(item, await xname(item), 0, 1);
        return TRUE;
      }
      item = hitting_u ? G.uarmu : await which_armor(victim, W_ARMU);
      if (item) {
        await erode_obj(item, S("shirt"), 0, 1);
      }
      return TRUE;
    case 2:
      item = hitting_u ? G.uarms : await which_armor(victim, W_ARMS);
      if (!await erode_obj(item, S("wooden shield"), 0, 1)) {
        continue;
      }
      break;
    case 3:
      item = hitting_u ? G.uarmg : await which_armor(victim, W_ARMG);
      if (!await erode_obj(item, S("gloves"), 0, 1)) {
        continue;
      }
      break;
    case 4:
      item = hitting_u ? G.uarmf : await which_armor(victim, W_ARMF);
      if (!await erode_obj(item, S("boots"), 0, 1)) {
        continue;
      }
      break;
    }
    break;
  }
  return FALSE;
}

export async function erode_obj(otmp: struct_obj | null, ostr: Ptr | null, type: number, ef_flags: number): Promise<number> {
  let vulnerable = FALSE;
  let is_primary = TRUE;
  let check_grease = (ef_flags & EF_GREASE ? TRUE : FALSE) << 24 >> 24;
  let print = (ef_flags & EF_VERBOSE ? TRUE : FALSE) << 24 >> 24;
  let uvictim = 0;
  let vismon = 0;
  let visobj = 0;
  let erosion = 0;
  let cost_type = 0;
  let victim = null;
  if (!otmp) {
    return ER_NOTHING;
  }
  victim = otmp.where === 3 ? G.youmonst : otmp.where === 4 ? otmp.v.v_ocarry : null;
  uvictim = (victim === G.youmonst ? 1 : 0) << 24 >> 24;
  vismon = (victim && victim !== G.youmonst && ((victim.wormno | 0 ? worm_known(victim) : $rd(G.viz_array.a[G.viz_array.o + victim.my], victim.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && victim && victim.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + victim.my], victim.mx) & 1 ? 1 : 0) && ((!victim.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !victim.mundetected)) ? 1 : 0) << 24 >> 24;
  visobj = (!victim && $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 ? 1 : 0) << 24 >> 24;
  switch (type) {
  case 0:
    vulnerable = is_flammable(otmp);
    check_grease = FALSE;
    cost_type = COST_BURN;
    break;
  case 1:
    vulnerable = ((G.objects[otmp.otyp].oc_material | 0) === IRON ? 1 : 0) << 24 >> 24;
    cost_type = COST_RUST;
    break;
  case 2:
    vulnerable = is_rottable(otmp);
    check_grease = FALSE;
    is_primary = FALSE;
    cost_type = COST_ROT;
    break;
  case 3:
    vulnerable = ((G.objects[otmp.otyp].oc_material | 0) === COPPER || (G.objects[otmp.otyp].oc_material | 0) === IRON ? 1 : 0) << 24 >> 24;
    is_primary = FALSE;
    cost_type = COST_CORRODE;
    break;
  default:
    await impossible(S("Invalid erosion type in erode_obj"));
    return ER_NOTHING;
  }
  erosion = is_primary ? otmp.oeroded | 0 : otmp.oeroded2 | 0;
  if (!ostr) {
    ostr = await cxname(otmp);
  }
  if (visobj && !(uvictim || vismon) && !strncmpi(ostr, S("the "), 4)) {
    ostr = ostr.add(4);
  }
  if (check_grease && otmp.greased | 0) {
    await grease_protect(otmp, ostr, victim);
    return ER_GREASED;
  } else if (!erosion_matters(otmp)) {
    return ER_NOTHING;
  } else if (!vulnerable || otmp.oerodeproof | 0 && otmp.rknown | 0) {
    if (G.flags.verbose && print && (uvictim || vismon)) {
      await pline(S("%s %s %s not affected by %s."), uvictim ? S("Your") : s_suffix(await Monnam(victim)), ostr, vtense(ostr, S("are")), erode_obj$bythe[type]);
    }
    return ER_NOTHING;
  } else if (otmp.oerodeproof | 0 || otmp.blessed | 0 && !rnl(4)) {
    if (G.flags.verbose && (print || otmp.oerodeproof | 0) && (uvictim || vismon || visobj)) {
      await pline(S("Somehow, %s %s %s not affected by the %s."), uvictim ? S("your") : !vismon ? S("the") : s_suffix(await mon_nam(victim)), ostr, vtense(ostr, S("are")), erode_obj$bythe[type]);
    }
    if (otmp.oerodeproof) {
      otmp.rknown = (TRUE) & 1;
      if (victim === G.youmonst) {
        update_inventory();
      }
    }
    return ER_NOTHING;
  } else if (erosion < MAX_ERODE) {
    let adverb = erosion + 1 === MAX_ERODE ? S(" completely") : erosion ? S(" further") : S("");
    if (uvictim || vismon || visobj) {
      await pline(S("%s %s %s%s!"), uvictim ? S("Your") : !vismon ? S("The") : s_suffix(await Monnam(victim)), ostr, vtense(ostr, erode_obj$action[type]), adverb);
    }
    if (ef_flags & EF_PAY) {
      await costly_alteration(otmp, cost_type);
    }
    if (is_primary) {
      otmp.oeroded = (otmp.oeroded + 1 >>> 0) & 3;
    } else {
      otmp.oeroded2 = (otmp.oeroded2 + 1 >>> 0) & 3;
    }
    if (victim === G.youmonst) {
      update_inventory();
    }
    return ER_DAMAGED;
  } else if (ef_flags & EF_DESTROY) {
    if (uvictim || vismon || visobj) {
      await pline(S("%s %s %s away!"), uvictim ? S("Your") : !vismon ? S("The") : s_suffix(await Monnam(victim)), ostr, vtense(ostr, erode_obj$action[type]));
    }
    if (ef_flags & EF_PAY) {
      await costly_alteration(otmp, cost_type);
    }
    await setnotworn(otmp);
    await delobj(otmp);
    return ER_DESTROYED;
  } else {
    if (G.flags.verbose && print) {
      if (uvictim) {
        await Your(S("%s %s completely %s."), ostr, vtense(ostr, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("look")), erode_obj$msg[type]);
      } else if (vismon || visobj) {
        await pline(S("%s %s %s completely %s."), !vismon ? S("The") : s_suffix(await Monnam(victim)), ostr, vtense(ostr, S("look")), erode_obj$msg[type]);
      }
    }
    return ER_NOTHING;
  }
}

export async function grease_protect(otmp: struct_obj | null, ostr: Ptr | null, victim: struct_monst | null): Promise<number> {
  let vismon = (victim && victim !== G.youmonst && ((victim.wormno | 0 ? worm_known(victim) : $rd(G.viz_array.a[G.viz_array.o + victim.my], victim.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && victim && victim.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + victim.my], victim.mx) & 1 ? 1 : 0) && ((!victim.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !victim.mundetected)) ? 1 : 0) << 24 >> 24;
  if (ostr) {
    if (victim === G.youmonst) {
      await Your(S("%s %s %s"), ostr, vtense(ostr, S("are")), P(grease_protect$txt));
    } else if (vismon) {
      await pline(S("%s's %s %s %s"), await Monnam(victim), ostr, vtense(ostr, S("are")), P(grease_protect$txt));
    }
  } else if (victim === G.youmonst || vismon) {
    await pline(S("%s %s"), await Yobjnam2(otmp, S("are")), P(grease_protect$txt));
  }
  if (!rn2(2)) {
    otmp.greased = 0;
    if (otmp.where === 3) {
      await pline_The(S("grease dissolves."));
      update_inventory();
    }
    return TRUE;
  }
  return FALSE;
}

export async function maketrap(x: number, y: number, typ: number): Promise<struct_trap | null> {
  let oldplace = 0;
  let ttmp = null;
  let lev = $sat(G.level.locations[x], y);
  if (!!(ttmp = t_at(x, y))) {
    if ((ttmp.ttyp | 0) === MAGIC_PORTAL || (ttmp.ttyp | 0) === VIBRATING_SQUARE) {
      return null;
    }
    oldplace = TRUE;
    if (G.u.utrap && x === G.u.ux && y === G.u.uy && (G.u.utraptype === TT_BEARTRAP && typ !== BEAR_TRAP || G.u.utraptype === TT_WEB && typ !== WEB || G.u.utraptype === TT_PIT && !(typ === PIT || typ === SPIKED_PIT))) {
      G.u.utrap = 0;
    }
  } else if (lev.typ >= STAIRS && lev.typ <= ALTAR && (!(lev.typ === GRAVE) || typ !== PIT && typ !== HOLE)) {
    return null;
  } else {
    oldplace = FALSE;
    ttmp = new struct_trap();
    memset(ttmp, 0, 24);
    ttmp.ntrap = null;
    ttmp.tx = x << 24 >> 24;
    ttmp.ty = y << 24 >> 24;
  }
  ttmp.vl.$cp(maketrap$zero_vl);
  ttmp.launch.x = ttmp.launch.y = -1;
  ttmp.dst.dnum = ttmp.dst.dlevel = -1;
  ttmp.madeby_u = 0;
  ttmp.once = 0;
  ttmp.tseen = ((typ === HOLE ? 1 : 0) >>> 0) & 1;
  ttmp.ttyp = (typ >>> 0) & 31;
  switch (typ) {
  case SQKY_BOARD:
    {
      let tavail = new Int32Array(12);
      let tpick = new Int32Array(12);
      let tcnt = 0;
      let k = 0;
      let t = null;
      for (k = 0; k < 12; ++k) {
        tavail[k] = tpick[k] = 0;
      }
      for (t = G.ftrap; t; t = t.ntrap) {
        if ((t.ttyp | 0) === SQKY_BOARD && t !== ttmp) {
          tavail[t.vl.v_tnote] = 1;
        }
      }
      for (k = 0; k < 12; ++k) {
        if (tavail[k] === 0) {
          tpick[tcnt++] = k;
        }
      }
      ttmp.vl.v_tnote = (tcnt > 0 ? tpick[rn2(tcnt)] : rn2(12)) << 16 >> 16;
      break;
    }
  case STATUE_TRAP:
    {
      let mtmp = null;
      let otmp = null;
      let statue = null;
      let mptr = null;
      let trycount = 10;
      do {
        mptr = $sat(G.mons, await rndmonnum());
      } while (--trycount > 0 && (mptr.mlet === S_UNICORN && (mptr.mflags2 & 536870912) >>> 0 !== 0) && sgn(G.u.ualign.type) === sgn(mptr.maligntyp));
      statue = await mkcorpstat(STATUE, null, mptr, x, y, CORPSTAT_NONE);
      mtmp = await makemon($sat(G.mons, statue.corpsenm), 0, 0, MM_NOCOUNTBIRTH);
      if (!mtmp) {
        break;
      }
      while (mtmp.minvent) {
        otmp = mtmp.minvent;
        otmp.owornmask = 0;
        await obj_extract_self(otmp);
        await add_to_container(statue, otmp);
      }
      statue.owt = await weight(statue) >>> 0;
      await mongone(mtmp);
      break;
    }
  case ROLLING_BOULDER_TRAP:
    await mkroll_launch(ttmp, x, y, BOULDER, 1);
    break;
  case PIT:
  case SPIKED_PIT:
    ttmp.vl.v_conjoined = 0;
  case HOLE:
  case TRAPDOOR:
    if ($rd(in_rooms(x, y, SHOPBASE)) && (typ === HOLE || typ === TRAPDOOR || lev.typ === DOOR || lev.typ && lev.typ <= DBWALL)) {
      await add_damage(x, y, (lev.typ === DOOR || lev.typ && lev.typ <= DBWALL) && !G.context.mon_moving ? SHOP_HOLE_COST : 0);
    }
    lev.flags = 0;
    if (lev.typ >= ROOM) {
      lev.typ = ROOM;
    } else if (lev.typ === STONE || lev.typ === SCORR) {
      lev.typ = CORR;
    } else if (lev.typ && lev.typ <= DBWALL || lev.typ === SDOOR) {
      lev.typ = (G.level.flags.is_maze_lev | 0 ? ROOM : G.level.flags.is_cavernous_lev | 0 ? CORR : DOOR) << 24 >> 24;
    }
    await unearth_objs(x, y);
    break;
  }
  if (!oldplace) {
    ttmp.ntrap = G.ftrap;
    G.ftrap = ttmp;
  } else {
    if (G.level.flags.sokoban_rules) {
      maybe_finish_sokoban();
    }
  }
  return ttmp;
}

export async function fall_through(td: number, ftflags: number): Promise<void> {
  let dtmp = new struct_d_level();
  let msgbuf = new Int8Array(256);
  let dont_fall = null;
  let newlevel = 0;
  let bottom = 0;
  let t = null;
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !G.level.flags.sokoban_rules) {
    return;
  }
  bottom = dunlevs_in_dungeon(G.u.uz);
  if (In_quest(G.u.uz)) {
    let qlocate_depth = G.dungeon_topology.d_qlocate_level.dlevel;
    if (G.dungeons[G.u.uz.dnum].dunlev_ureached < qlocate_depth) {
      bottom = qlocate_depth;
    }
  }
  newlevel = dunlev(G.u.uz);
  do {
    ++newlevel;
  } while (!rn2(4) && newlevel < bottom);
  if (td) {
    t = t_at(G.u.ux, G.u.uy);
    await feeltrap(t);
    if (!G.level.flags.sokoban_rules && !((ftflags & TOOKPLUNGE) >>> 0)) {
      if ((t.ttyp | 0) === TRAPDOOR) {
        await pline(S("A trap door opens up under you!"));
      } else {
        await pline(S("There's a gaping hole under you!"));
      }
    }
  } else {
    await pline_The(S("%s opens up under you!"), surface(G.u.ux, G.u.uy));
  }
  if (G.level.flags.sokoban_rules | 0 && Can_fall_thru(G.u.uz)) {
    ;
  } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || G.u.ustuck || !Can_fall_thru(G.u.uz) && !$at2(G.level.locations, G.u.ux, G.u.uy).candig || ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.youmonst.data.mflags1 & 256) >>> 0 !== 0 && ((G.youmonst.data.mflags1 & 16) >>> 0 !== 0 && G.youmonst.data.mlet !== S_MIMIC || (G.youmonst.data.mflags1 & 1) >>> 0 !== 0) && G.u.uundetected | 0) && !((ftflags & TOOKPLUNGE) >>> 0) || In_hell(G.u.uz) && !G.u.uevent.invoked && newlevel === bottom) {
    dont_fall = S("don't fall in.");
  } else if (G.youmonst.data.msize >= MZ_HUGE) {
    dont_fall = S("don't fit through.");
  } else if (!await next_to_u()) {
    dont_fall = S("are jerked back by your pet!");
  }
  if (dont_fall) {
    await You(S("%s"), dont_fall);
    await impact_drop(null, G.u.ux, G.u.uy, 0);
    if (!td) {
      await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      await pline_The(S("opening under you closes up."));
    }
    return;
  }
  if (((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0) && (ftflags & TOOKPLUNGE) >>> 0 && td && t) {
    await You(S("%s down %s!"), (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? S("swoop") : S("deliberately drop"), (t.ttyp | 0) === TRAPDOOR ? S("through the trap door") : S("into the gaping hole"));
  }
  if ($rd(P(G.u.ushops))) {
    await shopdig(1);
  }
  if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
    find_hell(dtmp);
  } else {
    let dist = newlevel - dunlev(G.u.uz);
    dtmp.dnum = G.u.uz.dnum;
    dtmp.dlevel = newlevel << 24 >> 24;
    if (dist > 1) {
      await You(S("fall down a %s%sshaft!"), dist > 3 ? S("very ") : S(""), dist > 2 ? S("deep ") : S(""));
    }
  }
  if (!td) {
    sprintf(P(msgbuf), S("The hole in the %s above you closes up."), ceiling(G.u.ux, G.u.uy));
  }
  await schedule_goto(dtmp, FALSE, TRUE, 0, null, !td ? P(msgbuf) : null);
}

export async function animate_statue(statue: struct_obj | null, x: number, y: number, cause: number, fail_reason: Ptr | null): Promise<struct_monst | null> {
  const mnum = new Int32Array(1);
  mnum[0] = statue.corpsenm;
  let mptr = $sat(G.mons, mnum[0]);
  let mon = null;
  let shkp = null;
  let item = null;
  let cc = new struct_nhcoord();
  let historic = (G.urole.malenum === 328 && (statue.spe & STATUE_HISTORIC) !== 0 ? 1 : 0) << 24 >> 24;
  let golem_xform = FALSE;
  let use_saved_traits = 0;
  let comes_to_life = null;
  let statuename = new Int8Array(256);
  let tmpbuf = new Int8Array(256);
  if (cant_revive(P(mnum, 0), TRUE, statue)) {
    if (mnum[0] !== PM_DOPPELGANGER) {
      mptr = $sat(G.mons, mnum[0]);
    }
    use_saved_traits = FALSE;
  } else if (mptr.mlet === S_GOLEM && cause === ANIMATE_SPELL) {
    golem_xform = (mptr !== $sat(G.mons, PM_FLESH_GOLEM) ? 1 : 0) << 24 >> 24;
    mnum[0] = PM_FLESH_GOLEM;
    mptr = $sat(G.mons, PM_FLESH_GOLEM);
    use_saved_traits = (statue.oextra && statue.oextra.omonst && !golem_xform ? 1 : 0) << 24 >> 24;
  } else {
    use_saved_traits = (statue.oextra && statue.oextra.omonst ? 1 : 0) << 24 >> 24;
  }
  if (use_saved_traits) {
    cc.x = x, cc.y = y;
    mon = await montraits(statue, cc, cause === ANIMATE_SPELL ? 1 : 0);
    if (mon && mon.mtame && !mon.isminion) {
      await wary_dog(mon, TRUE);
    }
  } else {
    if (mnum[0] === PM_DOPPELGANGER && mptr !== $sat(G.mons, PM_DOPPELGANGER) || mptr.msound === MS_GUARDIAN && await quest_info(MS_GUARDIAN) !== mnum[0]) {
      mon = await makemon($sat(G.mons, PM_DOPPELGANGER), x, y, NO_MINVENT | MM_NOCOUNTBIRTH | MM_ADJACENTOK);
      if (mon && mon.cham >= LOW_PM) {
        await newcham(mon, mptr, FALSE, FALSE);
      }
    } else {
      mon = await makemon(mptr, x, y, cause === ANIMATE_SPELL ? NO_MINVENT | MM_ADJACENTOK : NO_MINVENT);
    }
  }
  if (!mon) {
    if (fail_reason) {
      fail_reason.a[fail_reason.o] = ($sat(G.mons, statue.corpsenm).geno & 4096) !== 0 ? AS_MON_IS_UNIQUE : AS_NO_MON;
    }
    return null;
  }
  if (statue.spe & STATUE_MALE) {
    mon.female = (FALSE) & 1;
  } else if (statue.spe & STATUE_FEMALE) {
    mon.female = (TRUE) & 1;
  }
  if (statue.oextra && statue.oextra.oname && !((mon.data.geno & 4096) !== 0)) {
    mon = await christen_monst(mon, statue.oextra.oname);
  }
  if (mon.m_ap_type & 7) {
    await seemimic(mon);
  } else {
    mon.mundetected = (FALSE) & 1;
  }
  mon.msleeping = 0;
  if (cause === ANIMATE_NORMAL || cause === ANIMATE_SHATTER) {
    mon.mtame = 0;
    mon.mpeaceful = 0;
    set_malign(mon);
  }
  comes_to_life = !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) ? S("disappears") : golem_xform ? S("turns into flesh") : (mon.data.mflags2 & 2) >>> 0 !== 0 || mon.data === $sat(G.mons, 49) || (mon.data.mlet === S_GOLEM || mon.data.mlet === S_VORTEX) || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224) ? S("moves") : S("comes to life");
  if (x === G.u.ux && y === G.u.uy || cause === ANIMATE_SPELL) {
    shkp = await shop_keeper($rd(in_rooms(mon.mx, mon.my, SHOPBASE)));
    sprintf(P(statuename), S("%s%s"), await shk_your(P(tmpbuf), statue), cause === ANIMATE_SPELL && (mon !== shkp || statue.where === 3) ? await xname(statue) : S("statue"));
    await pline(S("%s %s!"), upstart(P(statuename)), comes_to_life);
  } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await pline_The(S("%s suddenly seems more animated."), await rndmonnam(null));
  } else if (cause === ANIMATE_SHATTER) {
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      sprintf(P(statuename), S("%s%s"), await shk_your(P(tmpbuf), statue), await xname(statue));
    } else {
      strcpy(P(statuename), S("a statue"));
    }
    await pline(S("Instead of shattering, %s suddenly %s!"), P(statuename), comes_to_life);
  } else {
    await You(S("find %s posing as a statue."), (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)) ? await a_monnam(mon) : G.c_common_strings.c_something);
    if (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await map_invisible(x, y);
    }
    await stop_occupation();
  }
  if (!G.context.mon_moving) {
    if (cause !== ANIMATE_NORMAL && await costly_spot(x, y) && (statue.where === 3 ? statue.unpaid | 0 : !statue.no_charge ? 1 : 0) && !!(shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)))) && mon !== shkp) {
      await stolen_value(statue, x, y, shkp.mpeaceful << 24 >> 24, FALSE);
    }
    if (historic) {
      await You_feel(S("guilty %s."), P(animate_statue$historic_statue_is_gone));
      adjalign(-1);
    }
  } else {
    if (historic && $rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      await You_feel(S("regret %s."), P(animate_statue$historic_statue_is_gone));
    }
  }
  while (!!(item = statue.cobj)) {
    await obj_extract_self(item);
    await mpickobj(mon, item);
  }
  await m_dowear(mon, TRUE);
  if (statue.owornmask) {
    await remove_worn_item(statue, TRUE);
  }
  await delobj(statue);
  if (x === G.u.ux && y === G.u.uy && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0 && !!!G.level.objects[x][y]) {
    G.u.uundetected = 0;
  }
  if (fail_reason) {
    fail_reason.a[fail_reason.o] = AS_OK;
  }
  return mon;
}

export async function activate_statue_trap(trap: struct_trap | null, x: number, y: number, shatter: number): Promise<struct_monst | null> {
  let mtmp = null;
  let otmp = sobj_at(STATUE, x, y);
  const fail_reason = new Int32Array(1);
  await deltrap(trap);
  while (otmp) {
    mtmp = await animate_statue(otmp, x, y, shatter ? ANIMATE_SHATTER : ANIMATE_NORMAL, P(fail_reason, 0));
    if (mtmp || fail_reason[0] !== AS_MON_IS_UNIQUE) {
      break;
    }
    otmp = nxtobj(otmp, STATUE, TRUE);
  }
  await feel_newsym(x, y);
  return mtmp;
}

async function keep_saddle_with_steedcorpse(steed_mid: number, objchn: struct_obj | null, saddle: struct_obj | null): Promise<number> {
  if (!saddle) {
    return FALSE;
  }
  while (objchn) {
    if (objchn.otyp === CORPSE && (objchn.oextra && objchn.oextra.omonst)) {
      let mtmp = objchn.oextra.omonst;
      if (mtmp.m_id === steed_mid) {
        const x = new Int8Array(1);
        const y = new Int8Array(1);
        if (get_obj_location(objchn, P(x, 0), P(y, 0), 0)) {
          await obj_extract_self(saddle);
          await place_object(saddle, x[0], y[0]);
          await stackobj(saddle);
        }
        return TRUE;
      }
    }
    if (!!objchn.cobj && await keep_saddle_with_steedcorpse(steed_mid, objchn.cobj, saddle)) {
      return TRUE;
    }
    objchn = objchn.nobj;
  }
  return FALSE;
}

export async function mu_maybe_destroy_web(mtmp: struct_monst | null, domsg: number, trap: struct_trap | null): Promise<number> {
  let isyou = (mtmp === G.youmonst ? 1 : 0) << 24 >> 24;
  let mptr = mtmp.data;
  if ((mptr.mflags1 & 4) >>> 0 !== 0 || (mptr.mlet === S_VORTEX || mptr === $sat(G.mons, 151)) || (mptr === $sat(G.mons, 110) || mptr === $sat(G.mons, 30) || mptr === $sat(G.mons, 152) || mptr === $sat(G.mons, 326)) || (mptr.mflags1 & 1048576) >>> 0 !== 0 || mptr === $sat(G.mons, PM_GELATINOUS_CUBE)) {
    let x = trap.tx;
    let y = trap.ty;
    if (mptr === $sat(G.mons, 110) || mptr === $sat(G.mons, 30) || mptr === $sat(G.mons, 152) || mptr === $sat(G.mons, 326) || (mptr.mflags1 & 134217728) >>> 0 !== 0) {
      if (domsg) {
        if (isyou) {
          await You(S("%s %s spider web!"), mptr === $sat(G.mons, 110) || mptr === $sat(G.mons, 30) || mptr === $sat(G.mons, 152) || mptr === $sat(G.mons, 326) ? S("burn") : S("dissolve"), a_your[trap.madeby_u]);
        } else {
          await pline(S("%s %s %s spider web!"), await Monnam(mtmp), mptr === $sat(G.mons, 110) || mptr === $sat(G.mons, 30) || mptr === $sat(G.mons, 152) || mptr === $sat(G.mons, 326) ? S("burns") : S("dissolves"), a_your[trap.madeby_u]);
        }
      }
      await deltrap(trap);
      await newsym(x, y);
      return TRUE;
    }
    if (domsg) {
      if (isyou) {
        await You(S("flow through %s spider web."), a_your[trap.madeby_u]);
      } else {
        await pline(S("%s flows through %s spider web."), await Monnam(mtmp), a_your[trap.madeby_u]);
        await seetrap(trap);
      }
    }
    return TRUE;
  }
  return FALSE;
}

async function t_missile(otyp: number, trap: struct_trap | null): Promise<struct_obj | null> {
  let otmp = await mksobj(otyp, TRUE, FALSE);
  otmp.quan = 1;
  otmp.owt = await weight(otmp) >>> 0;
  otmp.otrapped = 0;
  otmp.ox = trap.tx, otmp.oy = trap.ty;
  return otmp;
}

export function set_utrap(tim: number, typ: number): void {
  G.u.utrap = tim;
  G.u.utraptype = tim ? typ : 0;
  float_vs_flight();
}

export async function reset_utrap(msg: number): Promise<void> {
  let was_Lev = (((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? 1 : 0) !== 0 ? 1 : 0) << 24 >> 24;
  let was_Fly = (((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? 1 : 0) !== 0 ? 1 : 0) << 24 >> 24;
  set_utrap(0, 0);
  if (msg) {
    if (!was_Lev && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
      await float_up();
    }
    if (!was_Fly && ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
      await You(S("can fly."));
    }
  }
}

export async function dotrap(trap: struct_trap | null, trflags: number): Promise<void> {
  let $g = 0;
  let ttype = 0;
  let otmp = [null];
  let already_seen = 0;
  let forcetrap = 0;
  let webmsgok = 0;
  let forcebungle = 0;
  let plunged = 0;
  let viasitting = 0;
  let conj_pit = 0;
  let adj_pit = 0;
  let oldumort = 0;
  let steed_article = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      ttype = trap.ttyp | 0;
      already_seen = trap.tseen << 24 >> 24;
      forcetrap = ((trflags & FORCETRAP) >>> 0 !== 0 || (trflags & FAILEDUNTRAP) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      webmsgok = ((trflags & NOWEBMSG) >>> 0 === 0 ? 1 : 0) << 24 >> 24;
      forcebungle = ((trflags & FORCEBUNGLE) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      plunged = ((trflags & TOOKPLUNGE) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      viasitting = ((trflags & VIASITTING) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      conj_pit = conjoined_pits(trap, t_at(G.u.ux0, G.u.uy0), TRUE);
      adj_pit = adj_nonconjoined_pit(trap);
      steed_article = ARTICLE_THE;
      nomul(0);
      if (G.level.flags.sokoban_rules | 0 && (ttype === PIT || ttype === SPIKED_PIT || (ttype === HOLE || ttype === TRAPDOOR))) {
        await pline(S("Air currents pull you down into %s %s!"), a_your[trap.madeby_u], G.defsyms[S_arrow_trap + ttype - 1].explanation);
      } else if (already_seen && !forcetrap) {
        if (((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked && !plunged) && (ttype === PIT || ttype === SPIKED_PIT || ttype === HOLE || ttype === BEAR_TRAP)) {
          await You(S("%s over %s %s."), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("float") : S("fly"), a_your[trap.madeby_u], G.defsyms[S_arrow_trap + ttype - 1].explanation);
          return;
        }
        if (!(G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) && ttype !== MAGIC_PORTAL && ttype !== VIBRATING_SQUARE && ttype !== ANTI_MAGIC && !forcebungle && !plunged && !conj_pit && !adj_pit && (!rn2(5) || (ttype === PIT || ttype === SPIKED_PIT) && (G.youmonst.data.mflags1 & 16) >>> 0 !== 0)) {
          await You(S("escape %s %s."), ttype === ARROW_TRAP && !trap.madeby_u ? S("an") : a_your[trap.madeby_u], G.defsyms[S_arrow_trap + ttype - 1].explanation);
          return;
        }
      }
      if (G.u.usteed) {
        G.u.usteed.mtrapseen = G.u.usteed.mtrapseen | 1 << ttype - 1;
        if (G.u.usteed.mextra && G.u.usteed.mextra.mname && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          steed_article = ARTICLE_NONE;
        }
      }
      switch (ttype) {
      case ARROW_TRAP: { $g = 3; continue $L; }
      case DART_TRAP: { $g = 4; continue $L; }
      case ROCKTRAP: { $g = 5; continue $L; }
      case SQKY_BOARD: { $g = 6; continue $L; }
      case BEAR_TRAP: { $g = 7; continue $L; }
      case SLP_GAS_TRAP: { $g = 8; continue $L; }
      case RUST_TRAP: { $g = 9; continue $L; }
      case FIRE_TRAP: { $g = 10; continue $L; }
      case PIT: { $g = 11; continue $L; }
      case SPIKED_PIT: { $g = 12; continue $L; }
      case HOLE: { $g = 13; continue $L; }
      case TRAPDOOR: { $g = 14; continue $L; }
      case TELEP_TRAP: { $g = 15; continue $L; }
      case LEVEL_TELEP: { $g = 16; continue $L; }
      case WEB: { $g = 17; continue $L; }
      case STATUE_TRAP: { $g = 18; continue $L; }
      case MAGIC_TRAP: { $g = 19; continue $L; }
      case ANTI_MAGIC: { $g = 20; continue $L; }
      case POLY_TRAP: { $g = 21; continue $L; }
      case LANDMINE: { $g = 22; continue $L; }
      case ROLLING_BOULDER_TRAP: { $g = 23; continue $L; }
      case MAGIC_PORTAL: { $g = 24; continue $L; }
      case VIBRATING_SQUARE: { $g = 25; continue $L; }
      default: { $g = 26; continue $L; }
      }
    case 3:
      if (trap.once | 0 && trap.tseen | 0 && !rn2(15)) {
        await You_hear(S("a loud click!"));
        await deltrap(trap);
        await newsym(G.u.ux, G.u.uy);
        { $g = 2; continue $L; };
      }
      trap.once = 1;
      await seetrap(trap);
      await pline(S("An arrow shoots out at you!"));
      otmp[0] = await t_missile(ARROW, trap);
      if (G.u.usteed && !rn2(2) && await steedintrap(trap, otmp[0])) {
        ;
      } else if (await thitu(8, await dmgval(otmp[0], G.youmonst), P(otmp, 0), S("arrow"))) {
        if (otmp[0]) {
          await obfree(otmp[0], null);
        }
      } else {
        await place_object(otmp[0], G.u.ux, G.u.uy);
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          otmp[0].dknown = 1;
        }
        await stackobj(otmp[0]);
        await newsym(G.u.ux, G.u.uy);
      }
      { $g = 2; continue $L; };
    case 4:
      if (trap.once | 0 && trap.tseen | 0 && !rn2(15)) {
        await You_hear(S("a soft click."));
        await deltrap(trap);
        await newsym(G.u.ux, G.u.uy);
        { $g = 2; continue $L; };
      }
      trap.once = 1;
      await seetrap(trap);
      await pline(S("A little dart shoots out at you!"));
      otmp[0] = await t_missile(DART, trap);
      if (!rn2(6)) {
        otmp[0].otrapped = 1;
      }
      oldumort = G.u.umortality;
      if (G.u.usteed && !rn2(2) && await steedintrap(trap, otmp[0])) {
        ;
      } else if (await thitu(7, await dmgval(otmp[0], G.youmonst), P(otmp, 0), S("little dart"))) {
        if (otmp[0]) {
          if (otmp[0].otrapped) {
            await poisoned(S("dart"), A_CON, S("little dart"), G.u.umortality > oldumort ? 0 : 10, TRUE);
          }
          await obfree(otmp[0], null);
        }
      } else {
        await place_object(otmp[0], G.u.ux, G.u.uy);
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          otmp[0].dknown = 1;
        }
        await stackobj(otmp[0]);
        await newsym(G.u.ux, G.u.uy);
      }
      { $g = 2; continue $L; };
    case 5:
      if (trap.once | 0 && trap.tseen | 0 && !rn2(15)) {
        await pline(S("A trap door in %s opens, but nothing falls out!"), await the(ceiling(G.u.ux, G.u.uy)));
        await deltrap(trap);
        await newsym(G.u.ux, G.u.uy);
      } else {
        let dmg = d(2, 6);
        trap.once = 1;
        await feeltrap(trap);
        otmp[0] = await t_missile(ROCK, trap);
        await place_object(otmp[0], G.u.ux, G.u.uy);
        await pline(S("A trap door in %s opens and %s falls on your %s!"), await the(ceiling(G.u.ux, G.u.uy)), await an(await xname(otmp[0])), body_part(HEAD));
        if (G.uarmh) {
          if ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) {
            await pline(S("Fortunately, you are wearing a hard helmet."));
            dmg = 2;
          } else if (G.flags.verbose) {
            await pline(S("%s does not protect you."), await Yname2(G.uarmh));
          }
        }
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          otmp[0].dknown = 1;
        }
        await stackobj(otmp[0]);
        await newsym(G.u.ux, G.u.uy);
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("falling rock"), KILLED_BY_AN);
        await exercise(A_STR, FALSE);
      }
      { $g = 2; continue $L; };
    case 6:
      if (((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !forcetrap) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await seetrap(trap);
          if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
            await You(S("notice a crease in the linoleum."));
          } else {
            await You(S("notice a loose board below you."));
          }
        }
      } else {
        await seetrap(trap);
        await pline(S("A board beneath you %s%s%s."), G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("vibrates") : S("squeaks "), G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("") : trapnote(trap, 0), G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("") : S(" loudly"));
        wake_nearby();
      }
      { $g = 2; continue $L; };
    case 7:
      {
        let dmg = d(2, 4);
        if (((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !forcetrap) {
          { $g = 2; continue $L; };
        }
        await feeltrap(trap);
        if ((G.youmonst.data.mflags1 & 4) >>> 0 !== 0 || (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) || (G.youmonst.data.mflags1 & 1048576) >>> 0 !== 0) {
          await pline(S("%s bear trap closes harmlessly through you."), A_Your[trap.madeby_u]);
          { $g = 2; continue $L; };
        }
        if (!G.u.usteed && G.youmonst.data.msize <= MZ_SMALL) {
          await pline(S("%s bear trap closes harmlessly over you."), A_Your[trap.madeby_u]);
          { $g = 2; continue $L; };
        }
        set_utrap(rn2(4) + 4 >>> 0, TT_BEARTRAP);
        if (G.u.usteed) {
          await pline(S("%s bear trap closes on %s %s!"), A_Your[trap.madeby_u], s_suffix(await mon_nam(G.u.usteed)), mbodypart(G.u.usteed, FOOT));
          if (await thitm(0, G.u.usteed, null, dmg, FALSE)) {
            await reset_utrap(TRUE);
          }
        } else {
          await pline(S("%s bear trap closes on your %s!"), A_Your[trap.madeby_u], body_part(FOOT));
          await set_wounded_legs(rn2(2) ? RIGHT_SIDE : LEFT_SIDE, rn2(10) + 10);
          if (G.u.umonnum === PM_OWLBEAR || G.u.umonnum === PM_BUGBEAR) {
            await You(S("howl in anger!"));
          }
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("bear trap"), KILLED_BY_AN);
        }
        await exercise(A_DEX, FALSE);
        { $g = 2; continue $L; };
      }
    case 8:
      await seetrap(trap);
      if (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) {
        await You(S("are enveloped in a cloud of gas!"));
      } else {
        await pline(S("A cloud of gas puts you to sleep!"));
        await fall_asleep(-rnd(25), TRUE);
      }
      await steedintrap(trap, null);
      { $g = 2; continue $L; };
    case 9:
      await seetrap(trap);
      switch (rn2(5)) {
      case 0: { $g = 28; continue $L; }
      case 1: { $g = 29; continue $L; }
      case 2: { $g = 30; continue $L; }
      default: { $g = 31; continue $L; }
      }
    case 28:
      await pline(S("%s you on the %s!"), A_gush_of_water_hits, body_part(HEAD));
      await water_damage(G.uarmh, helm_simple_name(G.uarmh), TRUE);
      { $g = 27; continue $L; };
    case 29:
      await pline(S("%s your left %s!"), A_gush_of_water_hits, body_part(ARM));
      if (await water_damage(G.uarms, S("shield"), TRUE) !== ER_NOTHING) {
        { $g = 27; continue $L; };
      }
      if (G.u.twoweap || G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
        await water_damage(G.u.twoweap ? G.uswapwep : G.uwep, null, TRUE);
      }
    case 1: // glovecheck
      await water_damage(G.uarmg, S("gauntlets"), TRUE);
      { $g = 27; continue $L; };
    case 30:
      await pline(S("%s your right %s!"), A_gush_of_water_hits, body_part(ARM));
      await water_damage(G.uwep, null, TRUE);
      { $g = 1; continue $L; }
    case 31:
      await pline(S("%s you!"), A_gush_of_water_hits);
      for (otmp[0] = G.invent; otmp[0]; otmp[0] = otmp[0].nobj) {
        if (otmp[0].lamplit | 0 && otmp[0] !== G.uwep && (otmp[0] !== G.uswapwep || !G.u.twoweap)) {
          await snuff_lit(otmp[0]);
        }
      }
      if (G.uarmc) {
        await water_damage(G.uarmc, cloak_simple_name(G.uarmc), TRUE);
      } else if (G.uarm) {
        await water_damage(G.uarm, suit_simple_name(G.uarm), TRUE);
      } else if (G.uarmu) {
        await water_damage(G.uarmu, S("shirt"), TRUE);
      }
    case 27:
      update_inventory();
      if (G.u.umonnum === PM_IRON_GOLEM) {
        let dam = G.u.mhmax;
        await You(S("are covered with rust!"));
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dam + 1) / 2 | 0 : dam, S("rusting away"), KILLED_BY);
      } else if (G.u.umonnum === PM_GREMLIN && rn2(3)) {
        await split_mon(G.youmonst, null);
      }
      { $g = 2; continue $L; };
    case 10:
      await seetrap(trap);
      await dofiretrap(null);
      { $g = 2; continue $L; };
    case 11:
    case 12:
      if (!G.level.flags.sokoban_rules && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked && !plunged)) {
        { $g = 2; continue $L; };
      }
      await feeltrap(trap);
      if (!G.level.flags.sokoban_rules && (G.youmonst.data.mflags1 & 16) >>> 0 !== 0 && !plunged) {
        if (trap.tseen) {
          await You_see(S("%s %spit below you."), a_your[trap.madeby_u], ttype === SPIKED_PIT ? S("spiked ") : S(""));
        } else {
          await pline(S("%s pit %sopens up under you!"), A_Your[trap.madeby_u], ttype === SPIKED_PIT ? S("full of spikes ") : S(""));
          await You(S("don't fall in!"));
        }
        { $g = 2; continue $L; };
      }
      if (!G.level.flags.sokoban_rules) {
        let verbbuf = new Int8Array(256);
        $wr(P(verbbuf), 0, 0);
        if (G.u.usteed) {
          if ((trflags & RECURSIVETRAP) >>> 0 !== 0) {
            sprintf(P(verbbuf), S("and %s fall"), await x_monnam(G.u.usteed, steed_article, null, SUPPRESS_SADDLE, FALSE));
          } else {
            sprintf(P(verbbuf), S("lead %s"), await x_monnam(G.u.usteed, steed_article, S("poor"), SUPPRESS_SADDLE, FALSE));
          }
        } else if (conj_pit) {
          await You(S("move into an adjacent pit."));
        } else if (adj_pit) {
          await You(S("stumble over debris%s."), !rn2(5) ? S(" between the pits") : S(""));
        } else {
          strcpy(P(verbbuf), !plunged ? S("fall") : (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? S("dive") : S("plunge"));
        }
        if ($rd(P(verbbuf))) {
          await You(S("%s into %s pit!"), P(verbbuf), a_your[trap.madeby_u]);
        }
      }
      if (G.urole.malenum === 337 && !trap.madeby_u && !trap.once && In_quest(G.u.uz) && ((G.dungeon_topology.d_qlocate_level.dlevel || G.dungeon_topology.d_qlocate_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qlocate_level))) {
        await pline(S("Fortunately it has a bottom after all..."));
        trap.once = 1;
      } else if (G.u.umonnum === PM_PIT_VIPER || G.u.umonnum === PM_PIT_FIEND) {
        await pline(S("How pitiful.  Isn't that the pits?"));
      }
      if (ttype === SPIKED_PIT) {
        let predicament = S("on a set of sharp iron spikes");
        if (G.u.usteed) {
          await pline(S("%s %s %s!"), upstart(await x_monnam(G.u.usteed, steed_article, S("poor"), SUPPRESS_SADDLE, FALSE)), conj_pit ? S("steps") : S("lands"), predicament);
        } else {
          await You(S("%s %s!"), conj_pit ? S("step") : S("land"), predicament);
        }
      }
      set_utrap(rn2(6) + 2 >>> 0, TT_PIT);
      if (!await steedintrap(trap, null)) {
        if (ttype === SPIKED_PIT) {
          oldumort = G.u.umortality;
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(conj_pit ? 4 : adj_pit ? 6 : 10) + 1) / 2 | 0 : rnd(conj_pit ? 4 : adj_pit ? 6 : 10), plunged ? S("deliberately plunged into a pit of iron spikes") : conj_pit ? S("stepped into a pit of iron spikes") : adj_pit ? S("stumbled into a pit of iron spikes") : S("fell into a pit of iron spikes"), NO_KILLER_PREFIX);
          if (!rn2(6)) {
            await poisoned(S("spikes"), A_STR, conj_pit || adj_pit ? S("stepping on poison spikes") : S("fall onto poison spikes"), G.u.umortality > oldumort ? 0 : 8, FALSE);
          }
        } else {
          if (!conj_pit && !(plunged && ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0))) {
            await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(adj_pit ? 3 : 6) + 1) / 2 | 0 : rnd(adj_pit ? 3 : 6), plunged ? S("deliberately plunged into a pit") : S("fell into a pit"), NO_KILLER_PREFIX);
          }
        }
        if (!!G.uball && !(G.uball.where === 3)) {
          await unplacebc();
          await ballfall();
          await placebc();
        }
        if (!conj_pit) {
          await selftouch(S("Falling, you"));
        }
        G.vision_full_recalc = 1;
        await exercise(A_STR, FALSE);
        await exercise(A_DEX, FALSE);
      }
      { $g = 2; continue $L; };
    case 13:
    case 14:
      if (!Can_fall_thru(G.u.uz)) {
        await seetrap(trap);
        await impossible(S("dotrap: %ss cannot exist on this level."), G.defsyms[S_arrow_trap + ttype - 1].explanation);
        { $g = 2; continue $L; };
      }
      await fall_through(TRUE, (trflags & TOOKPLUNGE) >>> 0);
      { $g = 2; continue $L; };
    case 15:
      await seetrap(trap);
      await tele_trap(trap);
      { $g = 2; continue $L; };
    case 16:
      await seetrap(trap);
      await level_tele_trap(trap, trflags);
      { $g = 2; continue $L; };
    case 17:
      await feeltrap(trap);
      if (await mu_maybe_destroy_web(G.youmonst, webmsgok, trap)) {
        { $g = 2; continue $L; };
      }
      if (G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95)) {
        if (webmsgok) {
          await pline(trap.madeby_u | 0 ? S("You take a walk on your web.") : S("There is a spider web here."));
        }
        { $g = 2; continue $L; };
      }
      if (webmsgok) {
        let verbbuf = new Int8Array(256);
        if (forcetrap || viasitting) {
          strcpy(P(verbbuf), S("are caught by"));
        } else if (G.u.usteed) {
          sprintf(P(verbbuf), S("lead %s into"), await x_monnam(G.u.usteed, steed_article, S("poor"), SUPPRESS_SADDLE, FALSE));
        } else {
          sprintf(P(verbbuf), S("%s into"), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("float") : locomotion(G.youmonst.data, S("stumble")));
        }
        await You(S("%s %s spider web!"), P(verbbuf), a_your[trap.madeby_u]);
      }
      set_utrap(1, TT_WEB);
      {
        let tim = 0;
        let str = acurr(A_STR);
        if (G.u.usteed && webmsgok) {
          G.u.usteed.mx = G.u.ux;
          G.u.usteed.my = G.u.uy;
          if (await mintrap(G.u.usteed)) {
            G.u.usteed.mtrapped = 0;
            if ((G.u.usteed.data.mflags2 & 67108864) >>> 0 !== 0) {
              str = 17;
            }
          } else {
            await reset_utrap(FALSE);
            { $g = 2; continue $L; };
          }
          webmsgok = FALSE;
        }
        if (str <= 3) {
          tim = rn2(6) + 6;
        } else if (str < 6) {
          tim = rn2(6) + 4;
        } else if (str < 9) {
          tim = rn2(4) + 4;
        } else if (str < 12) {
          tim = rn2(4) + 2;
        } else if (str < 15) {
          tim = rn2(2) + 2;
        } else if (str < 18) {
          tim = rnd(2);
        } else if (str < 69) {
          tim = 1;
        } else {
          tim = 0;
          if (webmsgok) {
            await You(S("tear through %s web!"), a_your[trap.madeby_u]);
          }
          await deltrap(trap);
          await newsym(G.u.ux, G.u.uy);
        }
        set_utrap(tim >>> 0, TT_WEB);
      }
      { $g = 2; continue $L; };
    case 18:
      await activate_statue_trap(trap, G.u.ux, G.u.uy, FALSE);
      { $g = 2; continue $L; };
    case 19:
      await seetrap(trap);
      if (!rn2(30)) {
        await deltrap(trap);
        await newsym(G.u.ux, G.u.uy);
        await You(S("are caught in a magical explosion!"));
        await losehp(rnd(10), S("magical explosion"), KILLED_BY_AN);
        await Your(S("body absorbs some of the magical energy!"));
        G.u.uen = G.u.uenmax += 2;
        { $g = 2; continue $L; };
      } else {
        await domagictrap();
      }
      await steedintrap(trap, null);
      { $g = 2; continue $L; };
    case 20:
      await seetrap(trap);
      if (!(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic)) {
        await drain_en(rnd(G.u.ulevel) + 1);
      } else {
        let dmgval2 = rnd(4);
        let hp = G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp;
        if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic || (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic)) {
          dmgval2 += rnd(4);
        }
        if (G.uwep && G.uwep.oartifact === ART_MAGICBANE) {
          dmgval2 += rnd(4);
        }
        for (otmp[0] = G.invent; otmp[0]; otmp[0] = otmp[0].nobj) {
          if (otmp[0].oartifact && !is_quest_artifact(otmp[0]) && defends_when_carried(AD_MAGM, otmp[0])) {
            break;
          }
        }
        if (otmp[0]) {
          dmgval2 += rnd(4);
        }
        if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
          dmgval2 = (dmgval2 + 3) / 4 | 0;
        }
        await You_feel(dmgval2 >= hp ? S("unbearably torpid!") : dmgval2 >= (hp / 4 | 0) ? S("very lethargic.") : S("sluggish."));
        await losehp(dmgval2, S("anti-magic implosion"), KILLED_BY_AN);
      }
      { $g = 2; continue $L; };
    case 21:
      {
        let verbbuf = new Int8Array(256);
        await seetrap(trap);
        if (viasitting) {
          strcpy(P(verbbuf), S("trigger"));
        } else if (G.u.usteed) {
          sprintf(P(verbbuf), S("lead %s onto"), await x_monnam(G.u.usteed, steed_article, null, SUPPRESS_SADDLE, FALSE));
        } else {
          sprintf(P(verbbuf), S("%s onto"), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("float") : locomotion(G.youmonst.data, S("step")));
        }
        await You(S("%s a polymorph trap!"), P(verbbuf));
        if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic || (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
          await shieldeff(G.u.ux, G.u.uy);
          await You_feel(S("momentarily different."));
        } else {
          await steedintrap(trap, null);
          await deltrap(trap);
          await newsym(G.u.ux, G.u.uy);
          await You_feel(S("a change coming over you."));
          await polyself(0);
        }
        { $g = 2; continue $L; };
      }
    case 22:
      {
        let steed_mid = 0;
        let saddle = null;
        if (((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !forcetrap) {
          if (!already_seen && rn2(3)) {
            { $g = 2; continue $L; };
          }
          await feeltrap(trap);
          await pline(S("%s %s in a pile of soil below you."), already_seen ? S("There is") : S("You discover"), trap.madeby_u | 0 ? S("the trigger of your mine") : S("a trigger"));
          if (already_seen && rn2(3)) {
            { $g = 2; continue $L; };
          }
          await pline(S("KAABLAMM!!!  %s %s%s off!"), forcebungle ? S("Your inept attempt sets") : S("The air currents set"), already_seen ? a_your[trap.madeby_u] : S(""), already_seen ? S(" land mine") : S("it"));
        } else {
          if (dotrap$recursive_mine) {
            { $g = 2; continue $L; };
          }
          await feeltrap(trap);
          await pline(S("KAABLAMM!!!  You triggered %s land mine!"), a_your[trap.madeby_u]);
          if (G.u.usteed) {
            steed_mid = G.u.usteed.m_id;
          }
          dotrap$recursive_mine = TRUE;
          await steedintrap(trap, null);
          dotrap$recursive_mine = FALSE;
          saddle = sobj_at(SADDLE, G.u.ux, G.u.uy);
          await set_wounded_legs(LEFT_SIDE, rn2(35) + 41);
          await set_wounded_legs(RIGHT_SIDE, rn2(35) + 41);
          await exercise(A_DEX, FALSE);
        }
        await blow_up_landmine(trap);
        if (steed_mid && saddle && !G.u.usteed) {
          await keep_saddle_with_steedcorpse(steed_mid, G.level.objlist, saddle);
        }
        await newsym(G.u.ux, G.u.uy);
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(16) + 1) / 2 | 0 : rnd(16), S("land mine"), KILLED_BY_AN);
        if (!!(trap = t_at(G.u.ux, G.u.uy))) {
          await dotrap(trap, RECURSIVETRAP);
        }
        await fill_pit(G.u.ux, G.u.uy);
        { $g = 2; continue $L; };
      }
    case 23:
      {
        let style = ROLL | (trap.tseen | 0 ? LAUNCH_KNOWN : 0);
        await feeltrap(trap);
        await pline(S("Click!  You trigger a rolling boulder trap!"));
        if (!await launch_obj(BOULDER, trap.launch.x, trap.launch.y, trap.vl.v_launch2.x, trap.vl.v_launch2.y, style)) {
          await deltrap(trap);
          await newsym(G.u.ux, G.u.uy);
          await pline(S("Fortunately for you, no boulder was released."));
        }
        { $g = 2; continue $L; };
      }
    case 24:
      await feeltrap(trap);
      await domagicportal(trap);
      { $g = 2; continue $L; };
    case 25:
      await feeltrap(trap);
      { $g = 2; continue $L; };
    case 26:
      await feeltrap(trap);
      await impossible(S("You hit a trap of type %u"), trap.ttyp | 0);
    case 2:
    }
    break;
  }
}

function trapnote(trap: struct_trap | null, noprefix: number): Ptr | null {
  let tn = null;
  let tnnames = [S("C note"),
S("D flat"),
S("D note"),
S("E flat"),
S("E note"),
S("F note"),
S("F sharp"),
S("G note"),
S("G sharp"),
S("A note"),
S("B flat"),
S("B note")];
  trapnote$tnbuf[0] = 0;
  tn = tnnames[trap.vl.v_tnote];
  if (!noprefix) {
    sprintf(P(trapnote$tnbuf), S("%s "), tn.a[tn.o] === 65 || tn.a[tn.o] === 69 || tn.a[tn.o] === 70 ? S("an") : S("a"));
  }
  sprintf(eos(P(trapnote$tnbuf)), S("%s"), tn);
  return P(trapnote$tnbuf);
}

async function steedintrap(trap: struct_trap | null, otmp: struct_obj | null): Promise<number> {
  let steed = G.u.usteed;
  let tt = 0;
  let trapkilled = 0;
  let steedhit = 0;
  if (!steed || !trap) {
    return 0;
  }
  tt = trap.ttyp | 0;
  steed.mx = G.u.ux;
  steed.my = G.u.uy;
  trapkilled = steedhit = FALSE;
  switch (tt) {
  case ARROW_TRAP:
    if (!otmp) {
      await impossible(S("steed hit by non-existent arrow?"));
      return 0;
    }
    trapkilled = await thitm(8, steed, otmp, 0, FALSE);
    steedhit = TRUE;
    break;
  case DART_TRAP:
    if (!otmp) {
      await impossible(S("steed hit by non-existent dart?"));
      return 0;
    }
    trapkilled = await thitm(7, steed, otmp, 0, FALSE);
    steedhit = TRUE;
    break;
  case SLP_GAS_TRAP:
    if (!(((steed.data.mresists | steed.mextrinsics) & 4) !== 0) && !((steed.data.mflags1 & 1024) >>> 0 !== 0) && !steed.msleeping && steed.mcanmove | 0) {
      if (await sleep_monst(steed, rnd(25), -1)) {
        await pline(S("%s suddenly falls asleep!"), await Monnam(steed));
      }
    }
    steedhit = TRUE;
    break;
  case LANDMINE:
    trapkilled = await thitm(0, steed, null, rnd(16), FALSE);
    steedhit = TRUE;
    break;
  case PIT:
  case SPIKED_PIT:
    trapkilled = (steed.mhp < 1 || await thitm(0, steed, null, rnd(tt === PIT ? 6 : 10), FALSE) ? 1 : 0) << 24 >> 24;
    steedhit = TRUE;
    break;
  case POLY_TRAP:
    if (!resists_magm(steed) && !await resist(steed, WAND_CLASS, 0, NOTELL)) {
      let mdat = steed.data;
      await newcham(steed, null, FALSE, FALSE);
      if (!can_saddle(steed) || !can_ride(steed)) {
        await dismount_steed(DISMOUNT_POLY);
      } else {
        let buf = new Int8Array(256);
        strcpy(P(buf), await x_monnam(steed, ARTICLE_YOUR, null, SUPPRESS_SADDLE, FALSE));
        if (mdat !== steed.data) {
          strsubst(P(buf), S("your "), S("your new "));
        }
        await You(S("adjust yourself in the saddle on %s."), P(buf));
      }
    }
    steedhit = TRUE;
    break;
  default:
    break;
  }
  if (trapkilled) {
    await dismount_steed(DISMOUNT_POLY);
    return 2;
  }
  return steedhit ? 1 : 0;
}

export async function blow_up_landmine(trap: struct_trap | null): Promise<void> {
  let x = trap.tx;
  let y = trap.ty;
  const dbx = new Int32Array(1);
  const dby = new Int32Array(1);
  let lev = $sat(G.level.locations[x], y);
  await scatter(x, y, 4, MAY_DESTROY | MAY_HIT | MAY_FRACTURE | VIS_EFFECTS, null);
  await del_engr_at(x, y);
  wake_nearto(x, y, 400);
  if (lev.typ === DOOR) {
    lev.flags = (D_BROKEN) & 31;
  }
  if (lev.typ === DRAWBRIDGE_DOWN || is_drawbridge_wall(x, y) >= 0) {
    dbx[0] = x, dby[0] = y;
    if (find_drawbridge(P(dbx, 0), P(dby, 0))) {
      await destroy_drawbridge(dbx[0], dby[0]);
    }
    trap = t_at(x, y);
  }
  if (trap) {
    if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
      await deltrap(trap);
    } else {
      trap.ttyp = (PIT) & 31;
      trap.madeby_u = (FALSE) & 1;
      await seetrap(trap);
    }
  }
}

function launch_drop_spot(obj: struct_obj | null, x: number, y: number): void {
  if (!obj) {
    launchplace.obj = null;
    launchplace.x = 0;
    launchplace.y = 0;
  } else {
    launchplace.obj = obj;
    launchplace.x = x;
    launchplace.y = y;
  }
}

export function launch_in_progress(): number {
  if (launchplace.obj) {
    return TRUE;
  }
  return FALSE;
}

export async function force_launch_placement(): Promise<void> {
  if (launchplace.obj) {
    launchplace.obj.otrapped = 0;
    await place_object(launchplace.obj, launchplace.x, launchplace.y);
  }
}

export async function launch_obj(otyp: number, x1: number, y1: number, x2: number, y2: number, style: number): Promise<number> {
  let $g = 0;
  let mtmp = null;
  let otmp = null;
  let otmp2 = null;
  let dx = 0;
  let dy = 0;
  let singleobj = [null];
  let used_up = 0;
  let otherside = 0;
  let dist = 0;
  let tmp = 0;
  let delaycnt = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      used_up = FALSE;
      otherside = FALSE;
      delaycnt = 0;
      otmp = sobj_at(otyp, x1, y1);
      if (!otmp && otyp === BOULDER) {
        otherside = TRUE;
        otmp = sobj_at(otyp, x2, y2);
      }
      if (!otmp) {
        return 0;
      }
      if (otherside) {
        let tx = 0;
        let ty = 0;
        tx = x1;
        ty = y1;
        x1 = x2;
        y1 = y2;
        x2 = tx;
        y2 = ty;
      }
      if (otmp.quan === 1) {
        await obj_extract_self(otmp);
        singleobj[0] = otmp;
        otmp = null;
      } else {
        singleobj[0] = await splitobj(otmp, 1);
        await obj_extract_self(singleobj[0]);
      }
      await newsym(x1, y1);
      if ((otyp === BOULDER || otyp === STATUE) && singleobj[0].ox === G.context.digging.pos.x && singleobj[0].oy === G.context.digging.pos.y) {
        memset(G.context.digging, 0, 24);
      }
      dist = distmin(x1, y1, x2, y2);
      G.bhitpos.x = x1 << 24 >> 24;
      G.bhitpos.y = y1 << 24 >> 24;
      dx = sgn(x2 - x1);
      dy = sgn(y2 - y1);
      switch (style) {
      case ROLL | LAUNCH_UNSEEN: { $g = 3; continue $L; }
      case ROLL | LAUNCH_KNOWN: { $g = 4; continue $L; }
      case 1: { $g = 5; continue $L; }
      default: { $g = 6; continue $L; }
      }
    case 3:
      if (otyp === BOULDER) {
        await You_hear(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("someone bowling.") : S("rumbling in the distance."));
      }
      style &= ~LAUNCH_UNSEEN;
      { $g = 1; continue $L; }
    case 4:
      singleobj[0].otrapped = 1;
      style &= ~LAUNCH_KNOWN;
    case 1: // roll
    case 5:
      delaycnt = 2;
    case 6:
      if (!delaycnt) {
        delaycnt = 1;
      }
      if (!($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2)) {
        await curs_on_u();
      }
      await tmp_at(DISP_FLASH, singleobj[0].otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : singleobj[0].corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : singleobj[0].otyp === 240 ? singleobj[0].corpsenm + (382 + (1 + (382 + (382 + 0)))) : singleobj[0].otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
      await tmp_at(G.bhitpos.x, G.bhitpos.y);
    case 2:
      launch_drop_spot(singleobj[0], G.bhitpos.x, G.bhitpos.y);
      while (dist-- > 0 && !used_up) {
        let t = null;
        await tmp_at(G.bhitpos.x, G.bhitpos.y);
        tmp = delaycnt;
        if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
          while (tmp-- > 0) {
            await G.windowprocs.win_delay_output();
          }
        }
        G.bhitpos.x = G.bhitpos.x + dx << 24 >> 24;
        G.bhitpos.y = G.bhitpos.y + dy << 24 >> 24;
        if (!!(mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null)) {
          if (otyp === BOULDER && (mtmp.data.mflags2 & 134217728) >>> 0 !== 0) {
            if (rn2(3)) {
              if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
                await pline(S("%s snatches the boulder."), await Monnam(mtmp));
              }
              singleobj[0].otrapped = 0;
              await mpickobj(mtmp, singleobj[0]);
              used_up = TRUE;
              launch_drop_spot(null, 0, 0);
              break;
            }
          }
          if (await ohitmon(mtmp, singleobj[0], style === ROLL ? -1 : dist, FALSE)) {
            used_up = TRUE;
            launch_drop_spot(null, 0, 0);
            break;
          }
        } else if (G.bhitpos.x === G.u.ux && G.bhitpos.y === G.u.uy) {
          if (G.multi) {
            nomul(0);
          }
          if (await thitu(9 + singleobj[0].spe, await dmgval(singleobj[0], G.youmonst), P(singleobj, 0), null)) {
            await stop_occupation();
          }
        }
        if (style === ROLL) {
          if (await down_gate(G.bhitpos.x, G.bhitpos.y) !== -1) {
            if (await ship_object(singleobj[0], G.bhitpos.x, G.bhitpos.y, FALSE)) {
              used_up = TRUE;
              launch_drop_spot(null, 0, 0);
              break;
            }
          }
          if (!!(t = t_at(G.bhitpos.x, G.bhitpos.y)) && otyp === BOULDER) {
            switch (t.ttyp | 0) {
            case LANDMINE:
              if (rn2(10) > 2) {
                await pline(S("KAABLAMM!!!%s"), $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 ? S(" The rolling boulder triggers a land mine.") : S(""));
                await deltrap(t);
                await del_engr_at(G.bhitpos.x, G.bhitpos.y);
                await place_object(singleobj[0], G.bhitpos.x, G.bhitpos.y);
                singleobj[0].otrapped = 0;
                await fracture_rock(singleobj[0]);
                await scatter(G.bhitpos.x, G.bhitpos.y, 4, MAY_DESTROY | MAY_HIT | MAY_FRACTURE | VIS_EFFECTS, null);
                if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
                  await newsym(G.bhitpos.x, G.bhitpos.y);
                }
                used_up = TRUE;
                launch_drop_spot(null, 0, 0);
              }
              break;
            case LEVEL_TELEP:
            case TELEP_TRAP:
              if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
                await pline(S("Suddenly the rolling boulder disappears!"));
              } else {
                await You_hear(S("a rumbling stop abruptly."));
              }
              singleobj[0].otrapped = 0;
              if ((t.ttyp | 0) === TELEP_TRAP) {
                await rloco(singleobj[0]);
              } else {
                let newlev = random_teleport_level();
                let dest = new struct_d_level();
                if (newlev === depth(G.u.uz) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
                  continue;
                }
                await add_to_migration(singleobj[0]);
                await get_level(dest, newlev);
                singleobj[0].ox = dest.dnum;
                singleobj[0].oy = dest.dlevel;
                singleobj[0].owornmask = MIGR_RANDOM;
              }
              await seetrap(t);
              used_up = TRUE;
              launch_drop_spot(null, 0, 0);
              break;
            case PIT:
            case SPIKED_PIT:
            case HOLE:
            case TRAPDOOR:
              x2 = G.bhitpos.x, y2 = G.bhitpos.y;
              if (await flooreffects(singleobj[0], x2, y2, S("fall"))) {
                used_up = TRUE;
                launch_drop_spot(null, 0, 0);
              }
              dist = -1;
              break;
            }
            if (used_up || dist === -1) {
              break;
            }
          }
          if (await flooreffects(singleobj[0], G.bhitpos.x, G.bhitpos.y, S("fall"))) {
            used_up = TRUE;
            launch_drop_spot(null, 0, 0);
            break;
          }
          if (otyp === BOULDER && !!(otmp2 = sobj_at(BOULDER, G.bhitpos.x, G.bhitpos.y))) {
            let bmsg = S(" as one boulder sets another in motion");
            if (!isok(G.bhitpos.x + dx, G.bhitpos.y + dy) || !dist || $at2(G.level.locations, G.bhitpos.x + dx, G.bhitpos.y + dy).typ < POOL) {
              bmsg = S(" as one boulder hits another");
            }
            await You_hear(S("a loud crash%s!"), $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 ? bmsg : S(""));
            await obj_extract_self(otmp2);
            otmp2.otrapped = (singleobj[0].otrapped) & 1;
            singleobj[0].otrapped = 0;
            await place_object(singleobj[0], G.bhitpos.x, G.bhitpos.y);
            singleobj[0] = otmp2;
            otmp2 = null;
            wake_nearto(G.bhitpos.x, G.bhitpos.y, 10 * 10);
          }
        }
        if (otyp === BOULDER && closed_door(G.bhitpos.x, G.bhitpos.y)) {
          if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
            await pline_The(S("boulder crashes through a door."));
          }
          $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).flags = (D_BROKEN) & 31;
          if (dist) {
            unblock_point(G.bhitpos.x, G.bhitpos.y);
          }
        }
        if (dist > 0 && isok(G.bhitpos.x + dx, G.bhitpos.y + dy) && $at2(G.level.locations, G.bhitpos.x + dx, G.bhitpos.y + dy).typ === IRONBARS) {
          x2 = G.bhitpos.x, y2 = G.bhitpos.y;
          if (await hits_bars(P(singleobj, 0), x2, y2, x2 + dx, y2 + dy, !rn2(20) ? 1 : 0, 0)) {
            if (!singleobj[0]) {
              used_up = TRUE;
              launch_drop_spot(null, 0, 0);
            }
            break;
          }
        }
      }
      await tmp_at(DISP_END, 0);
      launch_drop_spot(null, 0, 0);
      if (!used_up) {
        singleobj[0].otrapped = 0;
        await place_object(singleobj[0], x2, y2);
        await newsym(x2, y2);
        return 1;
      } else {
        return 2;
      }
    }
    break;
  }
}

export async function seetrap(trap: struct_trap | null): Promise<void> {
  if (!trap.tseen) {
    trap.tseen = 1;
    await newsym(trap.tx, trap.ty);
  }
}

export async function feeltrap(trap: struct_trap | null): Promise<void> {
  trap.tseen = 1;
  await map_trap(trap, 1);
  await newsym(trap.tx, trap.ty);
}

async function mkroll_launch(ttmp: struct_trap | null, x: number, y: number, otyp: number, ocount: number): Promise<number> {
  let otmp = null;
  let tmp = 0;
  let dx = 0;
  let dy = 0;
  let distance = 0;
  let cc = new struct_nhcoord();
  let bcc = new struct_nhcoord();
  let trycount = 0;
  let success = FALSE;
  let mindist = 4;
  if ((ttmp.ttyp | 0) === ROLLING_BOULDER_TRAP) {
    mindist = 2;
  }
  distance = rn2(5) + 4;
  tmp = rn2(8);
  while (distance >= mindist) {
    dx = G.xdir[tmp];
    dy = G.ydir[tmp];
    cc.x = x;
    cc.y = y;
    if ((ttmp.ttyp | 0) === ROLLING_BOULDER_TRAP && is_pool_or_lava(x + Math.imul(distance, dx), y + Math.imul(distance, dy))) {
      success = FALSE;
    } else {
      success = isclearpath(cc, distance, dx, dy);
    }
    if ((ttmp.ttyp | 0) === ROLLING_BOULDER_TRAP) {
      let success_otherway = 0;
      bcc.x = x;
      bcc.y = y;
      success_otherway = isclearpath(bcc, distance, -dx, -dy);
      if (!success_otherway) {
        success = FALSE;
      }
    }
    if (success) {
      break;
    }
    if (++tmp > 7) {
      tmp = 0;
    }
    if (++trycount % 8 === 0) {
      --distance;
    }
  }
  if (!success) {
    cc.x = bcc.x = x;
    cc.y = bcc.y = y;
  } else {
    otmp = await mksobj(otyp, TRUE, FALSE);
    otmp.quan = ocount;
    otmp.owt = await weight(otmp) >>> 0;
    await place_object(otmp, cc.x, cc.y);
    await stackobj(otmp);
  }
  ttmp.launch.x = cc.x;
  ttmp.launch.y = cc.y;
  if ((ttmp.ttyp | 0) === ROLLING_BOULDER_TRAP) {
    ttmp.vl.v_launch2.x = bcc.x;
    ttmp.vl.v_launch2.y = bcc.y;
  } else {
    ttmp.vl.v_launch_otyp = otyp;
  }
  await newsym(ttmp.launch.x, ttmp.launch.y);
  return 1;
}

function isclearpath(cc: struct_nhcoord | null, distance: number, dx: number, dy: number): number {
  let typ = 0;
  let x = 0;
  let y = 0;
  x = cc.x;
  y = cc.y;
  while (distance-- > 0) {
    x = x + dx << 24 >> 24;
    y = y + dy << 24 >> 24;
    typ = $at2(G.level.locations, x, y).typ & 0xff;
    if (!isok(x, y) || !(typ >= POOL) || closed_door(x, y)) {
      return FALSE;
    }
  }
  cc.x = x;
  cc.y = y;
  return TRUE;
}

export async function mintrap(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let trap = null;
  let trapkilled = 0;
  let mptr = null;
  let otmp = null;
  let tt = 0;
  let in_sight = 0;
  let tear_web = 0;
  let see_it = 0;
  let inescapable = 0;
  let fallverb = null;
  let tx = 0;
  let ty = 0;
  let target = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      trap = t_at(mtmp.mx, mtmp.my);
      trapkilled = FALSE;
      mptr = mtmp.data;
      if (!!trap) { $g = 4; continue $L; }
      {
        mtmp.mtrapped = 0;
      }
      { $g = 3; continue $L; }
    case 4:
      if (!mtmp.mtrapped) { $g = 6; continue $L; }
      {
        if (!trap.tseen && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT || (trap.ttyp | 0) === BEAR_TRAP || (trap.ttyp | 0) === HOLE || (trap.ttyp | 0) === WEB)) {
          await seetrap(trap);
        }
        if (!rn2(40)) {
          if (sobj_at(BOULDER, mtmp.mx, mtmp.my) && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT)) {
            if (!rn2(2)) {
              mtmp.mtrapped = 0;
              if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
                await pline(S("%s pulls free..."), await Monnam(mtmp));
              }
              await fill_pit(mtmp.mx, mtmp.my);
            }
          } else {
            mtmp.mtrapped = 0;
          }
        } else if ((mptr.mflags1 & 2147483648) >>> 0 !== 0) {
          if ((trap.ttyp | 0) === BEAR_TRAP) {
            if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
              await pline(S("%s eats a bear trap!"), await Monnam(mtmp));
            }
            await deltrap(trap);
            mtmp.meating = 5;
            mtmp.mtrapped = 0;
          } else if ((trap.ttyp | 0) === SPIKED_PIT) {
            if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
              await pline(S("%s munches on some spikes!"), await Monnam(mtmp));
            }
            trap.ttyp = (PIT) & 31;
            mtmp.meating = 5;
          }
        }
      }
      { $g = 5; continue $L; }
    case 6:
      tt = trap.ttyp | 0;
      inescapable = (force_mintrap || (tt === HOLE || tt === PIT) && G.level.flags.sokoban_rules | 0 && !trap.madeby_u ? 1 : 0) << 24 >> 24;
      tx = trap.tx;
      ty = trap.ty;
      if (mtmp === G.u.usteed) {
        inescapable = TRUE;
      }
      if (!inescapable && ((mtmp.mtrapseen & 1 << tt - 1) !== 0 || tt === HOLE && !((mptr.mflags1 & 65536) >>> 0 !== 0))) {
        if (rn2(4)) {
          return 0;
        }
      } else {
        mtmp.mtrapseen = mtmp.mtrapseen | 1 << tt - 1;
      }
      if (trap.madeby_u | 0 && rnl(5)) {
        await setmangry(mtmp, TRUE);
      }
      in_sight = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
      see_it = ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) << 24 >> 24;
      if (mtmp === G.u.usteed) {
        in_sight = TRUE;
      }
      switch (tt) {
      case ARROW_TRAP: { $g = 8; continue $L; }
      case DART_TRAP: { $g = 9; continue $L; }
      case ROCKTRAP: { $g = 10; continue $L; }
      case SQKY_BOARD: { $g = 11; continue $L; }
      case BEAR_TRAP: { $g = 12; continue $L; }
      case SLP_GAS_TRAP: { $g = 13; continue $L; }
      case RUST_TRAP: { $g = 14; continue $L; }
      case FIRE_TRAP: { $g = 15; continue $L; }
      case PIT: { $g = 16; continue $L; }
      case SPIKED_PIT: { $g = 17; continue $L; }
      case HOLE: { $g = 18; continue $L; }
      case TRAPDOOR: { $g = 19; continue $L; }
      case LEVEL_TELEP: { $g = 20; continue $L; }
      case MAGIC_PORTAL: { $g = 21; continue $L; }
      case TELEP_TRAP: { $g = 22; continue $L; }
      case WEB: { $g = 23; continue $L; }
      case STATUE_TRAP: { $g = 24; continue $L; }
      case MAGIC_TRAP: { $g = 25; continue $L; }
      case ANTI_MAGIC: { $g = 26; continue $L; }
      case LANDMINE: { $g = 27; continue $L; }
      case POLY_TRAP: { $g = 28; continue $L; }
      case ROLLING_BOULDER_TRAP: { $g = 29; continue $L; }
      case VIBRATING_SQUARE: { $g = 30; continue $L; }
      default: { $g = 31; continue $L; }
      }
    case 8:
      if (trap.once | 0 && trap.tseen | 0 && !rn2(15)) {
        if (in_sight && see_it) {
          await pline(S("%s triggers a trap but nothing happens."), await Monnam(mtmp));
        }
        await deltrap(trap);
        await newsym(mtmp.mx, mtmp.my);
        { $g = 7; continue $L; };
      }
      trap.once = 1;
      otmp = await t_missile(ARROW, trap);
      if (in_sight) {
        await seetrap(trap);
      }
      if (await thitm(8, mtmp, otmp, 0, FALSE)) {
        trapkilled = TRUE;
      }
      { $g = 7; continue $L; };
    case 9:
      if (trap.once | 0 && trap.tseen | 0 && !rn2(15)) {
        if (in_sight && see_it) {
          await pline(S("%s triggers a trap but nothing happens."), await Monnam(mtmp));
        }
        await deltrap(trap);
        await newsym(mtmp.mx, mtmp.my);
        { $g = 7; continue $L; };
      }
      trap.once = 1;
      otmp = await t_missile(DART, trap);
      if (!rn2(6)) {
        otmp.otrapped = 1;
      }
      if (in_sight) {
        await seetrap(trap);
      }
      if (await thitm(7, mtmp, otmp, 0, FALSE)) {
        trapkilled = TRUE;
      }
      { $g = 7; continue $L; };
    case 10:
      if (trap.once | 0 && trap.tseen | 0 && !rn2(15)) {
        if (in_sight && see_it) {
          await pline(S("A trap door above %s opens, but nothing falls out!"), await mon_nam(mtmp));
        }
        await deltrap(trap);
        await newsym(mtmp.mx, mtmp.my);
        { $g = 7; continue $L; };
      }
      trap.once = 1;
      otmp = await t_missile(ROCK, trap);
      if (in_sight) {
        await seetrap(trap);
      }
      if (await thitm(0, mtmp, otmp, d(2, 6), FALSE)) {
        trapkilled = TRUE;
      }
      { $g = 7; continue $L; };
    case 11:
      if ((mptr.mflags1 & 1) >>> 0 !== 0) {
        { $g = 7; continue $L; };
      }
      if (in_sight) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await pline(S("A board beneath %s squeaks %s loudly."), await mon_nam(mtmp), trapnote(trap, 0));
          await seetrap(trap);
        } else {
          await pline(S("%s stops momentarily and appears to cringe."), await Monnam(mtmp));
        }
      } else {
        let range = $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? BOLT_LIM + 1 : BOLT_LIM - 3;
        await You_hear(S("a %s squeak %s."), trapnote(trap, 1), dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= Math.imul(range, range) ? S("nearby") : S("in the distance"));
      }
      wake_nearto(mtmp.mx, mtmp.my, 40);
      { $g = 7; continue $L; };
    case 12:
      if (mptr.msize > MZ_SMALL && !((mptr.mflags1 & 4) >>> 0 !== 0) && !((mptr.mflags1 & 1) >>> 0 !== 0) && !(mptr.mlet === S_VORTEX || mptr === $sat(G.mons, 151)) && !((mptr.mflags1 & 1048576) >>> 0 !== 0)) {
        mtmp.mtrapped = 1;
        if (in_sight) {
          await pline(S("%s is caught in %s bear trap!"), await Monnam(mtmp), a_your[trap.madeby_u]);
          await seetrap(trap);
        } else {
          if (mptr === $sat(G.mons, PM_OWLBEAR) || mptr === $sat(G.mons, PM_BUGBEAR)) {
            await You_hear(S("the roaring of an angry bear!"));
          }
        }
      } else if (force_mintrap) {
        if (in_sight) {
          await pline(S("%s evades %s bear trap!"), await Monnam(mtmp), a_your[trap.madeby_u]);
          await seetrap(trap);
        }
      }
      if (mtmp.mtrapped) {
        trapkilled = await thitm(0, mtmp, null, d(2, 4), FALSE);
      }
      { $g = 7; continue $L; };
    case 13:
      if (!(((mtmp.data.mresists | mtmp.mextrinsics) & 4) !== 0) && !((mptr.mflags1 & 1024) >>> 0 !== 0) && !mtmp.msleeping && mtmp.mcanmove | 0) {
        if (await sleep_monst(mtmp, rnd(25), -1) && in_sight) {
          await pline(S("%s suddenly falls asleep!"), await Monnam(mtmp));
          await seetrap(trap);
        }
      }
      { $g = 7; continue $L; };
    case 14:
      if (in_sight) {
        await seetrap(trap);
      }
      switch (rn2(5)) {
      case 0: { $g = 33; continue $L; }
      case 1: { $g = 34; continue $L; }
      case 2: { $g = 35; continue $L; }
      default: { $g = 36; continue $L; }
      }
    case 33:
      if (in_sight) {
        await pline(S("%s %s on the %s!"), A_gush_of_water_hits, await mon_nam(mtmp), mbodypart(mtmp, HEAD));
      }
      target = await which_armor(mtmp, W_ARMH);
      await water_damage(target, helm_simple_name(target), TRUE);
      { $g = 32; continue $L; };
    case 34:
      if (in_sight) {
        await pline(S("%s %s's left %s!"), A_gush_of_water_hits, await mon_nam(mtmp), mbodypart(mtmp, ARM));
      }
      target = await which_armor(mtmp, W_ARMS);
      if (await water_damage(target, S("shield"), TRUE) !== ER_NOTHING) {
        { $g = 32; continue $L; };
      }
      target = mtmp.mw;
      if (target && ((target.oclass === WEAPON_CLASS || target.oclass === TOOL_CLASS) && G.objects[target.otyp].oc_big | 0)) {
        await water_damage(target, null, TRUE);
      }
    case 1: // glovecheck
      target = await which_armor(mtmp, W_ARMG);
      await water_damage(target, S("gauntlets"), TRUE);
      { $g = 32; continue $L; };
    case 35:
      if (in_sight) {
        await pline(S("%s %s's right %s!"), A_gush_of_water_hits, await mon_nam(mtmp), mbodypart(mtmp, ARM));
      }
      await water_damage(mtmp.mw, null, TRUE);
      { $g = 1; continue $L; }
    case 36:
      if (in_sight) {
        await pline(S("%s %s!"), A_gush_of_water_hits, await mon_nam(mtmp));
      }
      for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
        if (otmp.lamplit | 0 && (otmp.owornmask & (W_WEP | W_SWAPWEP)) === 0) {
          await snuff_lit(otmp);
        }
      }
      if (!!(target = await which_armor(mtmp, W_ARMC))) {
        await water_damage(target, cloak_simple_name(target), TRUE);
      } else if (!!(target = await which_armor(mtmp, W_ARM))) {
        await water_damage(target, suit_simple_name(target), TRUE);
      } else if (!!(target = await which_armor(mtmp, W_ARMU))) {
        await water_damage(target, S("shirt"), TRUE);
      }
    case 32:
      if (mptr === $sat(G.mons, PM_IRON_GOLEM)) {
        if (in_sight) {
          await pline(S("%s falls to pieces!"), await Monnam(mtmp));
        } else if (mtmp.mtame) {
          await pline(S("May %s rust in peace."), await mon_nam(mtmp));
        }
        await mondied(mtmp);
        if (mtmp.mhp < 1) {
          trapkilled = TRUE;
        }
      } else if (mptr === $sat(G.mons, PM_GREMLIN) && rn2(3)) {
        await split_mon(mtmp, null);
      }
      { $g = 7; continue $L; };
    case 15:
    case 2: // mfiretrap
      if (in_sight) {
        await pline(S("A %s erupts from the %s under %s!"), P(tower_of_flame), surface(mtmp.mx, mtmp.my), await mon_nam(mtmp));
      } else if (see_it) {
        await You_see(S("a %s erupt from the %s!"), P(tower_of_flame), surface(mtmp.mx, mtmp.my));
      }
      if (((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0) {
        if (in_sight) {
          await shieldeff(mtmp.mx, mtmp.my);
          await pline(S("%s is uninjured."), await Monnam(mtmp));
        }
      } else {
        let num = d(2, 4);
        let alt = 0;
        let immolate = FALSE;
        switch (await monsndx(mptr)) {
        case 246:
          immolate = TRUE;
          alt = mtmp.mhpmax;
          break;
        case 245:
          alt = mtmp.mhpmax / 2 | 0;
          break;
        case 250:
          alt = mtmp.mhpmax / 4 | 0;
          break;
        case 249:
          alt = mtmp.mhpmax / 8 | 0;
          break;
        default:
          alt = 0;
          break;
        }
        if (alt > num) {
          num = alt;
        }
        if (await thitm(0, mtmp, null, num, immolate)) {
          trapkilled = TRUE;
        } else {
          mtmp.mhpmax -= rn2(num + 1);
        }
      }
      if (await burnarmor(mtmp) || rn2(3)) {
        await destroy_mitem(mtmp, SCROLL_CLASS, AD_FIRE);
        await destroy_mitem(mtmp, SPBOOK_CLASS, AD_FIRE);
        await destroy_mitem(mtmp, POTION_CLASS, AD_FIRE);
      }
      if (await burn_floor_objects(mtmp.mx, mtmp.my, see_it, FALSE) && !see_it && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 3 * 3) {
        await You(S("smell smoke."));
      }
      if (is_ice(mtmp.mx, mtmp.my)) {
        await melt_ice(mtmp.mx, mtmp.my, null);
      }
      if (see_it && t_at(mtmp.mx, mtmp.my)) {
        await seetrap(trap);
      }
      { $g = 7; continue $L; };
    case 16:
    case 17:
      fallverb = S("falls");
      if ((mptr.mflags1 & 1) >>> 0 !== 0 || (mptr.mlet === S_EYE || mptr.mlet === S_LIGHT) || mtmp.wormno | 0 && count_wsegs(mtmp) > 5 || (mptr.mflags1 & 16) >>> 0 !== 0) {
        if (force_mintrap && !G.level.flags.sokoban_rules) {
          if (in_sight) {
            await seetrap(trap);
            await pline(S("%s doesn't fall into the pit."), await Monnam(mtmp));
          }
          { $g = 7; continue $L; };
        }
        if (!inescapable) {
          { $g = 7; continue $L; };
        }
        fallverb = S("is dragged");
      }
      if (!((mptr.mflags1 & 8) >>> 0 !== 0)) {
        mtmp.mtrapped = 1;
      }
      if (in_sight) {
        await pline(S("%s %s into %s pit!"), await Monnam(mtmp), fallverb, a_your[trap.madeby_u]);
        if (mptr === $sat(G.mons, PM_PIT_VIPER) || mptr === $sat(G.mons, PM_PIT_FIEND)) {
          await pline(S("How pitiful.  Isn't that the pits?"));
        }
        await seetrap(trap);
      }
      await mselftouch(mtmp, S("Falling, "), FALSE);
      if (mtmp.mhp < 1 || await thitm(0, mtmp, null, rnd(tt === PIT ? 6 : 10), FALSE)) {
        trapkilled = TRUE;
      }
      { $g = 7; continue $L; };
    case 18:
    case 19:
      if (!Can_fall_thru(G.u.uz)) {
        await impossible(S("mintrap: %ss cannot exist on this level."), G.defsyms[S_arrow_trap + tt - 1].explanation);
        { $g = 7; continue $L; };
      }
      if ((mptr.mflags1 & 1) >>> 0 !== 0 || (mptr.mlet === S_EYE || mptr.mlet === S_LIGHT) || mptr === $sat(G.mons, PM_WUMPUS) || mtmp.wormno | 0 && count_wsegs(mtmp) > 5 || mptr.msize >= MZ_HUGE) {
        if (force_mintrap && !G.level.flags.sokoban_rules) {
          if (in_sight) {
            await seetrap(trap);
            if (tt === TRAPDOOR) {
              await pline(S("A trap door opens, but %s doesn't fall through."), await mon_nam(mtmp));
            } else {
              await pline(S("%s doesn't fall through the hole."), await Monnam(mtmp));
            }
          }
          { $g = 7; continue $L; };
        }
        if (inescapable) {
          if (in_sight) {
            await pline(S("%s seems to be yanked down!"), await Monnam(mtmp));
            in_sight = FALSE;
            await seetrap(trap);
          }
        } else {
          { $g = 7; continue $L; };
        }
      }
    case 20:
    case 21:
      {
        let mlev_res = 0;
        mlev_res = await mlevel_tele_trap(mtmp, trap, inescapable, in_sight);
        if (mlev_res) {
          return mlev_res;
        }
        { $g = 7; continue $L; };
      }
    case 22:
      await mtele_trap(mtmp, trap, in_sight);
      { $g = 7; continue $L; };
    case 23:
      if (mptr === $sat(G.mons, 93) || mptr === $sat(G.mons, 95)) {
        { $g = 7; continue $L; };
      }
      if (await mu_maybe_destroy_web(mtmp, in_sight, trap)) {
        { $g = 7; continue $L; };
      }
      tear_web = FALSE;
      switch (await monsndx(mptr)) {
      case 231:
      case 44:
        if (!in_sight) {
          await You_hear(S("the roaring of a confused bear!"));
          mtmp.mtrapped = 1;
          break;
        }
      default:
        if (mptr.mlet === S_GIANT || mptr.mlet === S_DRAGON && (mptr.mflags2 & 33554432) >>> 0 !== 0 || mtmp.wormno | 0 && count_wsegs(mtmp) > 5) {
          tear_web = TRUE;
        } else if (in_sight) {
          await pline(S("%s is caught in %s spider web."), await Monnam(mtmp), a_your[trap.madeby_u]);
          await seetrap(trap);
        }
        mtmp.mtrapped = ((tear_web ? 0 : 1) >>> 0) & 1;
        break;
      case 84:
      case 85:
      case 114:
      case 175:
      case 255:
      case 299:
      case 318:
      case 86:
      case 350:
      case 354:
      case 359:
      case 366:
        tear_web = TRUE;
        break;
      }
      if (tear_web) {
        if (in_sight) {
          await pline(S("%s tears through %s spider web!"), await Monnam(mtmp), a_your[trap.madeby_u]);
        }
        await deltrap(trap);
        await newsym(mtmp.mx, mtmp.my);
      } else if (force_mintrap && !mtmp.mtrapped) {
        if (in_sight) {
          await pline(S("%s avoids %s spider web!"), await Monnam(mtmp), a_your[trap.madeby_u]);
          await seetrap(trap);
        }
      }
      { $g = 7; continue $L; };
    case 24:
      { $g = 7; continue $L; };
    case 25:
      if (!rn2(21)) {
        { $g = 2; continue $L; }
      }
      { $g = 7; continue $L; };
    case 26:
      if (!resists_magm(mtmp)) {
        if (!mtmp.mcan && (attacktype(mptr, AT_MAGC) || attacktype(mptr, AT_BREA))) {
          mtmp.mspec_used += d(2, 2);
          if (in_sight) {
            await seetrap(trap);
            await pline(S("%s seems lethargic."), await Monnam(mtmp));
          }
        }
      } else {
        let dmgval2 = rnd(4);
        if (!!(otmp = mtmp.mw) && otmp.oartifact === ART_MAGICBANE) {
          dmgval2 += rnd(4);
        }
        for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
          if (otmp.oartifact && defends_when_carried(AD_MAGM, otmp)) {
            break;
          }
        }
        if (otmp) {
          dmgval2 += rnd(4);
        }
        if ((mptr.mflags1 & 8) >>> 0 !== 0) {
          dmgval2 = (dmgval2 + 3) / 4 | 0;
        }
        if (in_sight) {
          await seetrap(trap);
        }
        mtmp.mhp -= dmgval2;
        if (mtmp.mhp < 1) {
          await monkilled(mtmp, in_sight ? S("compression from an anti-magic field") : null, -AD_MAGM);
        }
        if (mtmp.mhp < 1) {
          trapkilled = TRUE;
        }
        if (see_it) {
          await newsym(trap.tx, trap.ty);
        }
      }
      { $g = 7; continue $L; };
    case 27:
      if (rn2(3)) {
        { $g = 7; continue $L; };
      }
      if ((mptr.mflags1 & 1) >>> 0 !== 0) {
        let already_seen = trap.tseen << 24 >> 24;
        if (in_sight && !already_seen) {
          await pline(S("A trigger appears in a pile of soil below %s."), await mon_nam(mtmp));
          await seetrap(trap);
        }
        if (rn2(3)) {
          { $g = 7; continue $L; };
        }
        if (in_sight) {
          await newsym(mtmp.mx, mtmp.my);
          await pline_The(S("air currents set %s off!"), already_seen ? S("a land mine") : S("it"));
        }
      } else if (in_sight) {
        await newsym(mtmp.mx, mtmp.my);
        await pline(S("%s%s triggers %s land mine!"), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("KAABLAMM!!!  ") : S(""), await Monnam(mtmp), a_your[trap.madeby_u]);
      }
      if (!in_sight && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await pline(S("Kaablamm!  %s an explosion in the distance!"), S("You hear"));
      }
      await blow_up_landmine(trap);
      if (mtmp.mhp < 1 || await thitm(0, mtmp, null, rnd(16), FALSE)) {
        trapkilled = TRUE;
      } else {
        if (await mintrap(mtmp) === 2) {
          trapkilled = TRUE;
        }
      }
      await fill_pit(tx, ty);
      if (mtmp.mhp < 1) {
        trapkilled = TRUE;
      }
      if (unconscious()) {
        G.multi = -1;
        G.nomovemsg = S("The explosion awakens you!");
      }
      { $g = 7; continue $L; };
    case 28:
      if (resists_magm(mtmp)) {
        await shieldeff(mtmp.mx, mtmp.my);
      } else if (!await resist(mtmp, WAND_CLASS, 0, NOTELL)) {
        if (await newcham(mtmp, null, FALSE, FALSE)) {
          mptr = mtmp.data;
        }
        if (in_sight) {
          await seetrap(trap);
        }
      }
      { $g = 7; continue $L; };
    case 29:
      if (!((mptr.mflags1 & 1) >>> 0 !== 0)) {
        let style = ROLL | (in_sight ? 0 : LAUNCH_UNSEEN);
        await newsym(mtmp.mx, mtmp.my);
        if (in_sight) {
          await pline(S("Click!  %s triggers %s."), await Monnam(mtmp), trap.tseen | 0 ? S("a rolling boulder trap") : G.c_common_strings.c_something);
        }
        if (await launch_obj(BOULDER, trap.launch.x, trap.launch.y, trap.vl.v_launch2.x, trap.vl.v_launch2.y, style)) {
          if (in_sight) {
            trap.tseen = (TRUE) & 1;
          }
          if (mtmp.mhp < 1) {
            trapkilled = TRUE;
          }
        } else {
          await deltrap(trap);
          await newsym(mtmp.mx, mtmp.my);
        }
      }
      { $g = 7; continue $L; };
    case 30:
      if (see_it && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await seetrap(trap);
        if (in_sight) {
          let buf = new Int8Array(256);
          let p = null;
          let monnm = await mon_nam(mtmp);
          if ((mtmp.data.mflags1 & 24576) >>> 0 === 24576 || (mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT) || (mtmp.data.mflags1 & 1) >>> 0 !== 0) {
            strcpy(P(buf), monnm);
          } else {
            strcpy(P(buf), s_suffix(monnm));
            p = eos(strcat(P(buf), S(" ")));
            strcpy(p, await makeplural(mbodypart(mtmp, FOOT)));
            strsubst(p, S("rear "), S(""));
          }
          await You_see(S("a strange vibration beneath %s."), P(buf));
        } else {
          await You_see(S("the ground vibrate %s."), dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 2 * 2 ? S("nearby") : S("in the distance"));
        }
      }
      { $g = 7; continue $L; };
    case 31:
      await impossible(S("Some monster encountered a strange trap of type %d."), tt);
    case 7:
    case 5:
    case 3:
      if (trapkilled) {
        return 2;
      }
      return mtmp.mtrapped | 0;
    }
    break;
  }
}

export async function instapetrify(str: Ptr | null): Promise<void> {
  if (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) {
    return;
  }
  if (poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM)) {
    return;
  }
  await You(S("turn to stone..."));
  G.killer.format = KILLED_BY;
  if (!$peq(str, P(G.killer.name))) {
    strcpy(P(G.killer.name), str ? str : S(""));
  }
  await done(STONING);
}

export async function minstapetrify(mon: struct_monst | null, byplayer: number): Promise<void> {
  if (((mon.data.mresists | mon.mextrinsics) & 128) !== 0) {
    return;
  }
  if (poly_when_stoned(mon.data)) {
    await mon_to_stone(mon);
    return;
  }
  if (!await vamp_stone(mon)) {
    return;
  }
  await mon_adjust_speed(mon, -3, null);
  if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
    await pline(S("%s turns to stone."), await Monnam(mon));
  }
  if (byplayer) {
    G.stoned = TRUE;
    await xkilled(mon, XKILL_NOMSG);
  } else {
    await monstone(mon);
  }
}

export async function selftouch(arg: Ptr | null): Promise<void> {
  let kbuf = new Int8Array(256);
  if (G.uwep && G.uwep.otyp === CORPSE && ($sat(G.mons, G.uwep.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, G.uwep.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    await pline(S("%s touch the %s corpse."), arg, G.mons[G.uwep.corpsenm].mname);
    sprintf(P(kbuf), S("%s corpse"), await an(G.mons[G.uwep.corpsenm].mname));
    await instapetrify(P(kbuf));
    if (!G.uarmg && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
      await uwepgone();
    }
  }
  if (G.u.twoweap && G.uswapwep && G.uswapwep.otyp === CORPSE && ($sat(G.mons, G.uswapwep.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, G.uswapwep.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    await pline(S("%s touch the %s corpse."), arg, G.mons[G.uswapwep.corpsenm].mname);
    sprintf(P(kbuf), S("%s corpse"), await an(G.mons[G.uswapwep.corpsenm].mname));
    await instapetrify(P(kbuf));
    if (!G.uarmg && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
      await uswapwepgone();
    }
  }
}

export async function mselftouch(mon: struct_monst | null, arg: Ptr | null, byplayer: number): Promise<void> {
  let mwep = mon.mw;
  if (mwep && mwep.otyp === CORPSE && ($sat(G.mons, mwep.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, mwep.corpsenm) === $sat(G.mons, 9)) && !(((mon.data.mresists | mon.mextrinsics) & 128) !== 0)) {
    if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
      await pline(S("%s%s touches %s."), arg ? arg : S(""), arg ? await mon_nam(mon) : await Monnam(mon), await corpse_xname(mwep, null, CXN_PFX_THE));
    }
    await minstapetrify(mon, byplayer);
    if (!(mon.mhp < 1) && !await which_armor(mon, W_ARMG) && !(((mon.data.mresists | mon.mextrinsics) & 128) !== 0)) {
      await mwepgone(mon);
    }
  }
}

export async function float_up(): Promise<void> {
  G.context.botl = TRUE;
  if (G.u.utrap) {
    if (G.u.utraptype === TT_PIT) {
      await reset_utrap(FALSE);
      await You(S("float up, out of the pit!"));
      G.vision_full_recalc = 1;
      await fill_pit(G.u.ux, G.u.uy);
    } else if (G.u.utraptype === TT_LAVA || G.u.utraptype === TT_INFLOOR) {
      await Your(S("body pulls upward, but your %s are still stuck."), await makeplural(body_part(LEG)));
    } else if (G.u.utraptype === TT_BURIEDBALL) {
      let cc = new struct_nhcoord();
      cc.x = G.u.ux, cc.y = G.u.uy;
      buried_ball(cc);
      await You(S("feel lighter, but your %s is still chained to the %s."), body_part(LEG), $at2(G.level.locations, cc.x, cc.y).typ >= ROOM ? S("floor") : S("ground"));
    } else if (G.u.utraptype === WEB) {
      await You(S("float up slightly, but you are still stuck in the web."));
    } else {
      await You(S("float up slightly, but your %s is still stuck."), body_part(LEG));
    }
  } else if (G.u.uinwater) {
    await spoteffects(TRUE);
  } else if (G.u.uswallow) {
    await You((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("float away from the %s.") : S("spiral up into %s."), (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? surface(G.u.ux, G.u.uy) : await mon_nam(G.u.ustuck));
  } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await pline(S("Up, up, and awaaaay!  You're walking on air!"));
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
    await You(S("gain control over your movements."));
  } else {
    await You(S("start to float in the air!"));
  }
  if (G.u.usteed && !(G.u.usteed.data.mlet === S_EYE || G.u.usteed.data.mlet === S_LIGHT) && !((G.u.usteed.data.mflags1 & 1) >>> 0 !== 0)) {
    if (((G.u.uprops[LEVITATION].intrinsic & 536870912) !== 0 || (G.u.uprops[LEVITATION].extrinsic & 8192) !== 0) && (G.u.uprops[LEVITATION].intrinsic & ~(536870912 | 16777215)) === 0 && (G.u.uprops[LEVITATION].extrinsic & ~8192) === 0) {
      await pline(S("%s magically floats up!"), await Monnam(G.u.usteed));
    } else {
      await You(S("cannot stay on %s."), await mon_nam(G.u.usteed));
      await dismount_steed(DISMOUNT_GENERIC);
    }
  }
  if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
    await You(S("are no longer able to control your flight."));
  }
  float_vs_flight();
  await encumber_msg();
  return;
}

export async function fill_pit(x: number, y: number): Promise<void> {
  let otmp = null;
  let t = null;
  if ((t = t_at(x, y)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT) && (otmp = sobj_at(BOULDER, x, y))) {
    await obj_extract_self(otmp);
    await flooreffects(otmp, x, y, S("settle"));
  }
}

export async function float_down(hmask: number, emask: number): Promise<number> {
  let $t1: any, $t2: any;
  let trap = null;
  let current_dungeon_level = new struct_d_level();
  let no_msg = FALSE;
  ($t1 = G.u.uprops[LEVITATION], $t1.intrinsic = $t1.intrinsic & ~hmask);
  ($t2 = G.u.uprops[LEVITATION], $t2.extrinsic = $t2.extrinsic & ~emask);
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    return 0;
  }
  if (G.u.uprops[LEVITATION].blocked) {
    let trapped = (G.u.uprops[LEVITATION].blocked === I_SPECIAL ? 1 : 0) << 24 >> 24;
    float_vs_flight();
    if (trapped && G.u.utrap) {
      await You(S("are no longer trying to float up from the %s."), G.u.utraptype === TT_BEARTRAP ? S("trap's jaws") : G.u.utraptype === TT_WEB ? S("web") : G.u.utraptype === TT_BURIEDBALL ? S("chain") : G.u.utraptype === TT_LAVA ? S("lava") : S("ground"));
    }
    await encumber_msg();
    return 0;
  }
  G.context.botl = TRUE;
  nomul(0);
  if (G.u.uprops[FLYING].blocked) {
    float_vs_flight();
    if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await You(S("have stopped levitating and are now flying."));
      await encumber_msg();
      return 1;
    }
  }
  if (G.u.uswallow) {
    await You(S("float down, but you are still %s."), (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("swallowed") : S("engulfed"));
    await encumber_msg();
    return 1;
  }
  if (!!G.uball && !(G.uball.where === 3) && (is_pool(G.uball.ox, G.uball.oy) || (trap = t_at(G.uball.ox, G.uball.oy)) && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT || ((trap.ttyp | 0) === HOLE || (trap.ttyp | 0) === TRAPDOOR)))) {
    G.u.ux0 = G.u.ux;
    G.u.uy0 = G.u.uy;
    G.u.ux = G.uball.ox;
    G.u.uy = G.uball.oy;
    await movobj(G.uchain, G.uball.ox, G.uball.oy);
    await newsym(G.u.ux0, G.u.uy0);
    G.vision_full_recalc = 1;
  }
  if (!((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
    if (!G.u.uswallow && G.u.ustuck) {
      if (sticks(G.youmonst.data)) {
        await You(S("aren't able to maintain your hold on %s."), await mon_nam(G.u.ustuck));
      } else {
        await pline(S("Startled, %s can no longer hold you!"), await mon_nam(G.u.ustuck));
      }
      G.u.ustuck = null;
    }
    if (is_pool(G.u.ux, G.u.uy) && !(G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) && !(G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) && !G.u.uinwater) {
      no_msg = await drown();
    }
    if (is_lava(G.u.ux, G.u.uy)) {
      await lava_effects();
      no_msg = TRUE;
    }
  }
  if (!trap) {
    trap = t_at(G.u.ux, G.u.uy);
    if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
      await You(S("begin to tumble in place."));
    } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) && !no_msg) {
      await You_feel(S("heavier."));
    } else if (!G.u.uinwater && !no_msg) {
      if (!(emask & W_SADDLE)) {
        if (G.level.flags.sokoban_rules | 0 && trap) {
          if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
            await pline(S("Bummer!  You've crashed."));
          } else {
            await You(S("fall over."));
          }
          await losehp(rnd(2), S("dangerous winds"), KILLED_BY);
          if (G.u.usteed) {
            await dismount_steed(DISMOUNT_FELL);
          }
          await selftouch(S("As you fall, you"));
        } else if (G.u.usteed && (G.u.usteed.data.mlet === S_EYE || G.u.usteed.data.mlet === S_LIGHT || (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0)) {
          await You(S("settle more firmly in the saddle."));
        } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          await pline(S("Bummer!  You've %s."), is_pool(G.u.ux, G.u.uy) ? S("splashed down") : S("hit the ground"));
        } else {
          await You(S("float gently to the %s."), surface(G.u.ux, G.u.uy));
        }
      }
    }
  }
  await encumber_msg();
  assign_level(current_dungeon_level, G.u.uz);
  if (trap) {
    switch (trap.ttyp | 0) {
    case STATUE_TRAP:
      break;
    case HOLE:
    case TRAPDOOR:
      if (!Can_fall_thru(G.u.uz) || G.u.ustuck) {
        break;
      }
    default:
      if (!G.u.utrap) {
        await dotrap(trap, 0);
      }
    }
  }
  if (!((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !G.u.uswallow && on_level(G.u.uz, current_dungeon_level)) {
    await pickup(1);
  }
  return 1;
}

export async function climb_pit(): Promise<void> {
  if (!G.u.utrap || G.u.utraptype !== TT_PIT) {
    return;
  }
  if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
    await You(S("ascend from the pit."));
    await reset_utrap(FALSE);
    await fill_pit(G.u.ux, G.u.uy);
    G.vision_full_recalc = 1;
  } else if (!rn2(2) && sobj_at(BOULDER, G.u.ux, G.u.uy)) {
    await Your(S("%s gets stuck in a crevice."), body_part(LEG));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    await You(S("free your %s."), body_part(LEG));
  } else if (((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0) && !G.level.flags.sokoban_rules) {
    await You(S("%s from the pit."), (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? S("fly") : S("climb"));
    await reset_utrap(FALSE);
    await fill_pit(G.u.ux, G.u.uy);
    G.vision_full_recalc = 1;
  } else if (!(G.u.utrap = G.u.utrap - 1 >>> 0)) {
    await reset_utrap(FALSE);
    await You(S("%s to the edge of the pit."), G.level.flags.sokoban_rules | 0 && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) ? S("struggle against the air currents and float") : G.u.usteed ? S("ride") : S("crawl"));
    await fill_pit(G.u.ux, G.u.uy);
    G.vision_full_recalc = 1;
  } else if (G.u.dz || G.flags.verbose) {
    if (G.u.usteed) {
      await Norep(S("%s is still in a pit."), upstart(await y_monnam(G.u.usteed)));
    } else {
      await Norep(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !rn2(5) ? S("You've fallen, and you can't get up.") : S("You are still in a pit."));
    }
  }
}

async function dofiretrap(box: struct_obj | null): Promise<void> {
  let see_it = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24;
  let num = 0;
  let alt = 0;
  if (box && !(box.where === 3) ? is_pool(box.ox, box.oy) : G.u.uinwater | 0) {
    await pline(S("A cascade of steamy bubbles erupts from %s!"), await the(box ? await xname(box) : surface(G.u.ux, G.u.uy)));
    if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
      await You(S("are uninjured."));
    } else {
      await losehp(rnd(3), S("boiling water"), KILLED_BY);
    }
    return;
  }
  await pline(S("A %s %s from %s!"), P(tower_of_flame), box ? S("bursts") : S("erupts"), await the(box ? await xname(box) : surface(G.u.ux, G.u.uy)));
  if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
    await shieldeff(G.u.ux, G.u.uy);
    num = rn2(2);
  } else if (G.u.umonnum !== G.u.umonster) {
    num = d(2, 4);
    switch (G.u.umonnum) {
    case 246:
      alt = G.u.mhmax;
      break;
    case 245:
      alt = G.u.mhmax / 2 | 0;
      break;
    case 250:
      alt = G.u.mhmax / 4 | 0;
      break;
    case 249:
      alt = G.u.mhmax / 8 | 0;
      break;
    default:
      alt = 0;
      break;
    }
    if (alt > num) {
      num = alt;
    }
    if (G.u.mhmax > G.mons[G.u.umonnum].mlevel) {
      G.u.mhmax -= rn2(G.u.mhmax < num + 1 ? G.u.mhmax : num + 1), G.context.botl = 1;
    }
  } else {
    num = d(2, 4);
    if (G.u.uhpmax > G.u.ulevel) {
      G.u.uhpmax -= rn2(G.u.uhpmax < num + 1 ? G.u.uhpmax : num + 1), G.context.botl = 1;
    }
  }
  if (!num) {
    await You(S("are uninjured."));
  } else {
    await losehp(num, P(tower_of_flame), KILLED_BY_AN);
  }
  await burn_away_slime();
  if (await burnarmor(G.youmonst) || rn2(3)) {
    await destroy_item(SCROLL_CLASS, AD_FIRE);
    await destroy_item(SPBOOK_CLASS, AD_FIRE);
    await destroy_item(POTION_CLASS, AD_FIRE);
  }
  if (!box && await burn_floor_objects(G.u.ux, G.u.uy, see_it, TRUE) && !see_it) {
    await You(S("smell paper burning."));
  }
  if (is_ice(G.u.ux, G.u.uy)) {
    await melt_ice(G.u.ux, G.u.uy, null);
  }
}

async function domagictrap(): Promise<void> {
  let fate = rnd(20);
  if (fate < 10) {
    let cnt = rnd(4);
    if (!resists_blnd(G.youmonst)) {
      await You(S("are momentarily blinded by a flash of light!"));
      await make_blinded(rn2(5) + 10, FALSE);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await Your(S("%s"), G.c_common_strings.c_vision_clears);
      }
    } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await You_see(S("a flash of light!"));
    }
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You_hear(S("a deafening roar!"));
      incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), rn2(20) + 30);
      G.context.botl = TRUE;
    } else {
      await You_feel(S("rankled."));
      incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), rn2(5) + 15);
      G.context.botl = TRUE;
    }
    while (cnt--) {
      await makemon(null, G.u.ux, G.u.uy, NO_MM_FLAGS);
    }
    wake_nearto(G.u.ux, G.u.uy, 7 * 7);
  } else {
    switch (fate) {
    case 10:
    case 11:
      break;
    case 12:
      await dofiretrap(null);
      break;
    case 13:
      await pline(S("A shiver runs up and down your %s!"), body_part(SPINE));
      break;
    case 14:
      await You_hear(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("the moon howling at you.") : S("distant howling."));
      break;
    case 15:
      if (on_level(G.u.uz, G.dungeon_topology.d_qstart_level)) {
        await You_feel(S("%slike the prodigal son."), G.flags.female || G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 262144) >>> 0 !== 0 ? S("oddly ") : S(""));
      } else {
        await You(S("suddenly yearn for %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Cleveland") : In_quest(G.u.uz) || await at_dgn_entrance(S("The Quest")) ? S("your nearby homeland") : S("your distant homeland"));
      }
      break;
    case 16:
      await Your(S("pack shakes violently!"));
      break;
    case 17:
      await You(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("smell hamburgers.") : S("smell charred flesh."));
      break;
    case 18:
      await You_feel(S("tired."));
      break;
    case 19:
      {
        let i = 0;
        let j = 0;
        let mtmp = null;
        await adjattrib(A_CHA, 1, FALSE);
        for (i = -1; i <= 1; ++i) {
          for (j = -1; j <= 1; ++j) {
            if (!isok(G.u.ux + i, G.u.uy + j)) {
              continue;
            }
            mtmp = !!G.level.monsters[G.u.ux + i][G.u.uy + j] ? G.level.monsters[G.u.ux + i][G.u.uy + j] : null;
            if (mtmp) {
              await tamedog(mtmp, null);
            }
          }
        }
        break;
      }
    case 20:
      {
        let pseudo = new struct_obj();
        let save_conf = G.u.uprops[CONFUSION].intrinsic;
        pseudo.$cp(G.zeroobj);
        pseudo.otyp = SCR_REMOVE_CURSE;
        G.u.uprops[CONFUSION].intrinsic = 0;
        await seffects(pseudo);
        G.u.uprops[CONFUSION].intrinsic = save_conf;
        break;
      }
    default:
      break;
    }
  }
}

export async function fire_damage(obj: struct_obj | null, force: number, x: number, y: number): Promise<number> {
  let chance = 0;
  let otmp = null;
  let ncobj = null;
  let in_sight = !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && $rd(G.viz_array.a[G.viz_array.o + y], x) & 1 ? 1 : 0;
  let dindx = 0;
  if (await catch_lit(obj)) {
    return FALSE;
  }
  if (obj.otyp >= 189 && obj.otyp <= 195) {
    switch (obj.otyp) {
    case 191:
      return FALSE;
    case 190:
      chance = 40;
      break;
    case 189:
      chance = 30;
      break;
    default:
      chance = 20;
      break;
    }
    if (!force && G.u.uluck + G.u.moreluck + 5 > rn2(chance) || is_flammable(obj) && obj.oerodeproof | 0) {
      return FALSE;
    }
    if (in_sight) {
      await pline(S("%s catches fire and burns."), await Yname2(obj));
    }
    if (!!obj.cobj) {
      if (in_sight) {
        await pline(S("Its contents fall out."));
      }
      for (otmp = obj.cobj; otmp; otmp = ncobj) {
        ncobj = otmp.nobj;
        await obj_extract_self(otmp);
        if (!await flooreffects(otmp, x, y, S(""))) {
          await place_object(otmp, x, y);
        }
      }
    }
    await setnotworn(obj);
    await delobj(obj);
    return TRUE;
  } else if (!force && G.u.uluck + G.u.moreluck + 5 > rn2(20)) {
    return FALSE;
  } else if (obj.oclass === SCROLL_CLASS || obj.oclass === SPBOOK_CLASS) {
    if (obj.otyp === SCR_FIRE || obj.otyp === SPE_FIREBALL) {
      return FALSE;
    }
    if (obj.otyp === SPE_BOOK_OF_THE_DEAD) {
      if (in_sight) {
        await pline(S("Smoke rises from %s."), await the(await xname(obj)));
      }
      return FALSE;
    }
    dindx = obj.oclass === SCROLL_CLASS ? 3 : 4;
    if (in_sight) {
      await pline(S("%s %s."), await Yname2(obj), G.destroy_strings[dindx][obj.quan > 1 ? 1 : 0]);
    }
    await setnotworn(obj);
    await delobj(obj);
    return TRUE;
  } else if (obj.oclass === POTION_CLASS) {
    dindx = obj.otyp !== POT_OIL ? 1 : 2;
    if (in_sight) {
      await pline(S("%s %s."), await Yname2(obj), G.destroy_strings[dindx][obj.quan > 1 ? 1 : 0]);
    }
    await setnotworn(obj);
    await delobj(obj);
    return TRUE;
  } else if (await erode_obj(obj, null, ERODE_BURN, EF_DESTROY) === ER_DESTROYED) {
    return TRUE;
  }
  return FALSE;
}

export async function fire_damage_chain(chain: struct_obj | null, force: number, here: number, x: number, y: number): Promise<number> {
  let obj = null;
  let nobj = null;
  let num = 0;
  for (obj = chain; obj; obj = nobj) {
    nobj = here ? obj.v.v_nexthere : obj.nobj;
    if (await fire_damage(obj, force, x, y)) {
      ++num;
    }
  }
  if (num && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !($rd(G.viz_array.a[G.viz_array.o + y], x) & 1))) {
    await You(S("smell smoke."));
  }
  return num;
}

export async function lava_damage(obj: struct_obj | null, x: number, y: number): Promise<number> {
  let otyp = obj.otyp;
  let ocls = obj.oclass;
  if (obj_resists(obj, 0, 0) && otyp !== SPE_BOOK_OF_THE_DEAD) {
    return FALSE;
  }
  if ((G.objects[otyp].oc_material | 0) < DRAGON_HIDE && ocls !== SCROLL_CLASS && ocls !== SPBOOK_CLASS && G.objects[otyp].oc_oprop !== FIRE_RES && otyp !== WAN_FIRE && otyp !== FIRE_HORN && !obj.oerodeproof && !!!obj.cobj) {
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      if (obj === G.thrownobj || obj === G.kickedobj) {
        await pline(S("%s %s up!"), obj.quan !== 1 || obj.oartifact === 26 && !undiscovered_artifact(26) ? S("They") : S("It"), otense(obj, S("burn")));
      } else {
        await You_see(S("%s hit lava and burn up!"), await doname(obj));
      }
    }
    if (obj.where === 3) {
      await remove_worn_item(obj, TRUE);
      await useupall(obj);
    } else {
      await delobj(obj);
    }
    return TRUE;
  }
  return await fire_damage(obj, TRUE, x, y);
}

export async function acid_damage(obj: struct_obj | null): Promise<void> {
  let victim = null;
  let vismon = 0;
  if (!obj) {
    return;
  }
  victim = obj.where === 3 ? G.youmonst : obj.where === 4 ? obj.v.v_ocarry : null;
  vismon = (victim && victim !== G.youmonst && ((victim.wormno | 0 ? worm_known(victim) : $rd(G.viz_array.a[G.viz_array.o + victim.my], victim.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && victim && victim.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + victim.my], victim.mx) & 1 ? 1 : 0) && ((!victim.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !victim.mundetected)) ? 1 : 0) << 24 >> 24;
  if (obj.greased) {
    await grease_protect(obj, null, victim);
  } else if (obj.oclass === SCROLL_CLASS && obj.otyp !== SCR_BLANK_PAPER) {
    if (obj.otyp !== SCR_BLANK_PAPER && obj.otyp !== SCR_MAIL) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        if (victim === G.youmonst) {
          await pline(S("Your %s."), await aobjnam(obj, S("fade")));
        } else if (vismon) {
          await pline(S("%s %s."), s_suffix(await Monnam(victim)), await aobjnam(obj, S("fade")));
        }
      }
    }
    obj.otyp = SCR_BLANK_PAPER;
    obj.spe = 0;
    obj.dknown = 0;
  } else {
    await erode_obj(obj, null, ERODE_CORRODE, EF_GREASE | EF_VERBOSE);
  }
}

export async function water_damage(obj: struct_obj | null, ostr: Ptr | null, force: number): Promise<number> {
  if (!obj) {
    return ER_NOTHING;
  }
  if (await snuff_lit(obj)) {
    return ER_DAMAGED;
  }
  if (!ostr) {
    ostr = await cxname(obj);
  }
  if (obj.otyp === CAN_OF_GREASE && obj.spe > 0) {
    return ER_NOTHING;
  } else if (obj.otyp === TOWEL && obj.spe < 7) {
    await wet_a_towel(obj, rnd(7), TRUE);
    return ER_NOTHING;
  } else if (obj.greased) {
    if (!rn2(2)) {
      obj.greased = 0;
    }
    if (obj.where === 3) {
      update_inventory();
    }
    return ER_GREASED;
  } else if (obj.otyp >= 189 && obj.otyp <= 195 && !(obj.otyp === 189 || obj.otyp === 190) && (obj.otyp !== OILSKIN_SACK || obj.cursed | 0 && !rn2(3))) {
    if (obj.where === 3) {
      await pline(S("Water gets into your %s!"), ostr);
    }
    await water_damage_chain(obj.cobj, FALSE);
    return ER_DAMAGED;
  } else if (obj.otyp === OILSKIN_SACK) {
    if (obj.where === 3) {
      await pline(S("Some water slides right off your %s."), ostr);
    }
    await discover_object(193, 1, 1);
    return ER_DAMAGED;
  } else if (!force && G.u.uluck + G.u.moreluck + 5 > rn2(20)) {
    return ER_NOTHING;
  } else if (obj.oclass === SCROLL_CLASS) {
    if (obj.otyp === SCR_BLANK_PAPER || obj.otyp === SCR_MAIL) {
      return 0;
    }
    if (obj.where === 3) {
      await pline(S("Your %s %s."), ostr, vtense(ostr, S("fade")));
    }
    obj.otyp = SCR_BLANK_PAPER;
    obj.dknown = 0;
    obj.spe = 0;
    if (obj.where === 3) {
      update_inventory();
    }
    return ER_DAMAGED;
  } else if (obj.oclass === SPBOOK_CLASS) {
    if (obj.otyp === SPE_BOOK_OF_THE_DEAD) {
      await pline(S("Steam rises from %s."), await the(await xname(obj)));
      return 0;
    } else if (obj.otyp === SPE_BLANK_PAPER) {
      return 0;
    }
    if (obj.where === 3) {
      await pline(S("Your %s %s."), ostr, vtense(ostr, S("fade")));
    }
    if (obj.otyp === SPE_NOVEL) {
      obj.corpsenm = 0;
      free_oname(obj);
    }
    obj.otyp = SPE_BLANK_PAPER;
    obj.dknown = 0;
    if (obj.where === 3) {
      update_inventory();
    }
    return ER_DAMAGED;
  } else if (obj.oclass === POTION_CLASS) {
    if (obj.otyp === POT_ACID) {
      let bufp = null;
      let one = (obj.quan === 1 ? 1 : 0) << 24 >> 24;
      let update = (obj.where === 3 ? 1 : 0) << 24 >> 24;
      let exploded = FALSE;
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(obj.where === 3)) {
        obj.dknown = 0;
      }
      if (acid_ctx.ctx_valid) {
        exploded = ((obj.dknown | 0 ? acid_ctx.dkn_boom : acid_ctx.unk_boom) > 0 ? 1 : 0) << 24 >> 24;
      }
      bufp = await simpleonames(obj);
      await pline(S("%s %s %s!"), !exploded ? one ? S("A") : S("Some") : one ? S("Another") : S("More"), bufp, vtense(bufp, S("explode")));
      if (acid_ctx.ctx_valid) {
        if (obj.dknown) {
          ++acid_ctx.dkn_boom;
        } else {
          ++acid_ctx.unk_boom;
        }
      }
      await setnotworn(obj);
      await delobj(obj);
      if (update) {
        update_inventory();
      }
      return ER_DESTROYED;
    } else if (obj.oeroded) {
      if (obj.where === 3) {
        await pline(S("Your %s %s further."), ostr, vtense(ostr, S("dilute")));
      }
      obj.otyp = POT_WATER;
      obj.dknown = 0;
      obj.blessed = (obj.cursed = 0) & 1;
      obj.oeroded = 0;
      if (obj.where === 3) {
        update_inventory();
      }
      return ER_DAMAGED;
    } else if (obj.otyp !== POT_WATER) {
      if (obj.where === 3) {
        await pline(S("Your %s %s."), ostr, vtense(ostr, S("dilute")));
      }
      obj.oeroded = (obj.oeroded + 1 >>> 0) & 3;
      if (obj.where === 3) {
        update_inventory();
      }
      return ER_DAMAGED;
    }
  } else {
    return await erode_obj(obj, ostr, ERODE_RUST, EF_NONE);
  }
  return ER_NOTHING;
}

export async function water_damage_chain(obj: struct_obj | null, here: number): Promise<void> {
  let otmp = null;
  acid_ctx.dkn_boom = acid_ctx.unk_boom = 0;
  acid_ctx.ctx_valid = TRUE;
  for (; obj; obj = otmp) {
    otmp = here ? obj.v.v_nexthere : obj.nobj;
    await water_damage(obj, null, FALSE);
  }
  acid_ctx.dkn_boom = acid_ctx.unk_boom = 0;
  acid_ctx.ctx_valid = FALSE;
}

async function emergency_disrobe(lostsome: Ptr | null): Promise<number> {
  let invc = inv_cnt(TRUE);
  while (near_capacity() > (!!G.uball ? UNENCUMBERED : SLT_ENCUMBER)) {
    let obj = null;
    let otmp = null;
    let i = 0;
    if (invc > 0) {
      i = rn2(invc);
      for (obj = G.invent; obj; obj = obj.nobj) {
        if (!(obj.otyp === LOADSTONE && obj.cursed | 0 || obj === G.uamul || obj === G.uleft || obj === G.uright || obj === G.ublindf || obj === G.uarm || obj === G.uarmc || obj === G.uarmg || obj === G.uarmf || obj === G.uarmu || obj.cursed | 0 && (obj === G.uarmh || obj === G.uarms) || welded(obj))) {
          otmp = obj;
        }
        if (--i < 0 && otmp) {
          break;
        }
      }
    }
    if (!otmp) {
      return FALSE;
    }
    if (otmp.owornmask) {
      await remove_worn_item(otmp, FALSE);
    }
    lostsome.a[lostsome.o] = TRUE;
    await dropx(otmp);
    --invc;
  }
  return TRUE;
}

export async function drown(): Promise<number> {
  let $g = 0;
  let pool_of_water = null;
  let inpool_ok = 0;
  let crawl_ok = 0;
  let i = 0;
  let x = 0;
  let y = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      inpool_ok = FALSE;
      await feel_newsym(G.u.ux, G.u.uy);
      if (G.u.uinwater | 0 && is_pool(G.u.ux - G.u.dx, G.u.uy - G.u.dy) && (G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0 || (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0))) {
        if (!rn2(5)) {
          inpool_ok = TRUE;
        } else {
          return FALSE;
        }
      }
      if (!G.u.uinwater) {
        await You(S("%s into the %s%c"), (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? S("plunge") : S("fall"), hliquid(S("water")), G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0 || (G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) ? 46 : 33);
        if (!(G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
          await You(S("sink like %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("the Titanic") : S("a rock"));
        }
      }
      await water_damage_chain(G.invent, FALSE);
      if (G.u.umonnum === PM_GREMLIN && rn2(3)) {
        await split_mon(G.youmonst, null);
      } else if (G.u.umonnum === PM_IRON_GOLEM) {
        await You(S("rust!"));
        i = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (d(2, 6) + 1) / 2 | 0 : d(2, 6);
        if (G.u.mhmax > i) {
          G.u.mhmax -= i;
        }
        await losehp(i, S("rusting away"), KILLED_BY);
      }
      if (inpool_ok) {
        return FALSE;
      }
      if ((i = number_leashed()) > 0) {
        await pline_The(S("leash%s slip%s loose."), i > 1 ? S("es") : S(""), i > 1 ? S("") : S("s"));
        unleash_all();
      }
      if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0 || (G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0)) {
        if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0) {
          if (G.flags.verbose) {
            await pline(S("But you aren't drowning."));
          }
          if (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
            if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
              await Your(S("keel hits the bottom."));
            } else {
              await You(S("touch bottom."));
            }
          }
        }
        if (!!G.uball) {
          await unplacebc();
          await placebc();
        }
        await vision_recalc(2);
        G.u.uinwater = 1;
        await under_water(1);
        G.vision_full_recalc = 1;
        return FALSE;
      }
      if ((G.u.uprops[TELEPORT].intrinsic || G.u.uprops[TELEPORT].extrinsic || (G.youmonst.data.mflags1 & 33554432) >>> 0 !== 0) && !(G.multi < 0 && (unconscious() || is_fainted())) && (G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic || rn2(3) < G.u.uluck + G.u.moreluck + 2)) {
        await You(S("attempt a teleport spell."));
        if (!G.level.flags.noteleport) {
          await dotele(FALSE);
          if (!is_pool(G.u.ux, G.u.uy)) {
            return TRUE;
          }
        } else {
          await pline_The(S("attempted teleport spell fails."));
        }
      }
      if (G.u.usteed) {
        await dismount_steed(DISMOUNT_GENERIC);
        if (!is_pool(G.u.ux, G.u.uy)) {
          return TRUE;
        }
      }
      crawl_ok = FALSE;
      x = y = 0;
      if (G.u.usleep) {
        await unmul(S("Suddenly you wake up!"));
      }
      if (is_fainted()) {
        await reset_faint();
      }
      if (G.multi < 0 || G.u.umonnum !== G.u.umonster && !G.youmonst.data.mmove) {
        { $g = 1; continue $L; }
      }
      for (i = 0; i < 100; ++i) {
        x = rn2(3) + (G.u.ux - 1);
        y = rn2(3) + (G.u.uy - 1);
        if (await crawl_destination(x, y)) {
          crawl_ok = TRUE;
          { $g = 1; continue $L; }
        }
      }
      for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
        for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
          if (await crawl_destination(x, y)) {
            crawl_ok = TRUE;
            { $g = 1; continue $L; }
          }
        }
      }
    case 1: // crawl
      if (crawl_ok) {
        const lost = new Int8Array(1);
        lost[0] = FALSE;
        let succ = ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? TRUE : await emergency_disrobe(P(lost, 0))) << 24 >> 24;
        await You(S("try to crawl out of the %s."), hliquid(S("water")));
        if (lost[0]) {
          await You(S("dump some of your gear to lose weight..."));
        }
        if (succ) {
          await pline(S("Pheew!  That was close."));
          await teleds(x, y, TRUE);
          return TRUE;
        }
        await pline(S("But in vain."));
      }
      G.u.uinwater = 1;
      await You(S("drown."));
      for (i = 0; i < 5; ++i) {
        pool_of_water = waterbody_name(G.u.ux, G.u.uy);
        G.killer.format = KILLED_BY_AN;
        if (!strcmp(pool_of_water, S("water"))) {
          pool_of_water = S("deep water"), G.killer.format = KILLED_BY;
        }
        strcpy(P(G.killer.name), pool_of_water);
        await done(DROWNING);
        if (await safe_teleds(TRUE)) {
          break;
        }
        await pline(S("You're still drowning."));
      }
      if (G.u.uinwater) {
        G.u.uinwater = 0;
        await You(S("find yourself back %s."), (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? S("in an air bubble") : S("on land"));
      }
      return TRUE;
    }
    break;
  }
}

export async function drain_en(n: number): Promise<void> {
  if (!G.u.uenmax) {
    await You_feel(S("momentarily lethargic."));
  } else {
    if (n > G.u.uenmax || n > G.u.ulevel) {
      n = rnd(n);
    }
    await You_feel(S("your magical energy drain away%c"), n > G.u.uen ? 33 : 46);
    G.u.uen -= n;
    if (G.u.uen < 0) {
      G.u.uenmax -= rnd(-G.u.uen);
      if (G.u.uenmax < 0) {
        G.u.uenmax = 0;
      }
      G.u.uen = 0;
    }
    G.context.botl = 1;
  }
}

export async function dountrap(): Promise<number> {
  if (near_capacity() >= HVY_ENCUMBER) {
    await pline(S("You're too strained to do that."));
    return 0;
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 && !(G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95)) || !G.youmonst.data.mmove) {
    await pline(S("And just how do you expect to do that?"));
    return 0;
  } else if (G.u.ustuck && sticks(G.youmonst.data)) {
    await pline(S("You'll have to let go of %s first."), await mon_nam(G.u.ustuck));
    return 0;
  }
  if (G.u.ustuck || welded(G.uwep) && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
    await Your(S("%s seem to be too busy for that."), await makeplural(body_part(HAND)));
    return 0;
  }
  return await untrap(FALSE);
}

function untrap_prob(ttmp: struct_trap | null): number {
  let chance = 3;
  if ((ttmp.ttyp | 0) === WEB && !(G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95))) {
    chance = 30;
  }
  if (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    ++chance;
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    ++chance;
  }
  if (G.u.uprops[STUNNED].intrinsic) {
    chance += 2;
  }
  if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) {
    chance = chance * 2;
  }
  if (ttmp && ttmp.madeby_u | 0) {
    --chance;
  }
  if (G.urole.malenum === 338) {
    if (rn2(2 * MAXULEV) < G.u.ulevel) {
      --chance;
    }
    if (G.u.uhave.questart | 0 && chance > 1) {
      --chance;
    }
  } else if (G.urole.malenum === 337 && chance > 1) {
    --chance;
  }
  return rn2(chance);
}

export async function cnv_trap_obj(otyp: number, cnt: number, ttmp: struct_trap | null, bury_it: number): Promise<void> {
  let otmp = await mksobj(otyp, TRUE, FALSE);
  otmp.quan = cnt;
  otmp.owt = await weight(otmp) >>> 0;
  if (otyp !== DART) {
    otmp.otrapped = 0;
  }
  await place_object(otmp, ttmp.tx, ttmp.ty);
  if (bury_it) {
    await bury_an_obj(otmp, null);
  } else {
    if (ttmp.madeby_u) {
      await sellobj(otmp, ttmp.tx, ttmp.ty);
    }
    await stackobj(otmp);
  }
  await newsym(ttmp.tx, ttmp.ty);
  if (G.u.utrap && ttmp.tx === G.u.ux && ttmp.ty === G.u.uy) {
    await reset_utrap(TRUE);
  }
  await deltrap(ttmp);
}

async function move_into_trap(ttmp: struct_trap | null): Promise<void> {
  const bc = new Int32Array(1);
  bc[0] = 0;
  let x = ttmp.tx;
  let y = ttmp.ty;
  const bx = new Int8Array(1);
  const by = new Int8Array(1);
  const cx = new Int8Array(1);
  const cy = new Int8Array(1);
  const unused = new Int8Array(1);
  bx[0] = by[0] = cx[0] = cy[0] = 0;
  if (!!!G.uball || await drag_ball(x, y, P(bc, 0), P(bx, 0), P(by, 0), P(cx, 0), P(cy, 0), P(unused, 0), TRUE)) {
    G.u.ux0 = G.u.ux, G.u.uy0 = G.u.uy;
    G.u.ux = x, G.u.uy = y;
    G.u.umoved = TRUE;
    await newsym(G.u.ux0, G.u.uy0);
    await vision_recalc(1);
    await check_leash(G.u.ux0, G.u.uy0);
    if (!!G.uball) {
      await move_bc(0, bc[0], bx[0], by[0], cx[0], cy[0]);
    }
    ttmp.tseen = 0;
    ++G.iflags.failing_untrap;
    await spoteffects(TRUE);
    --G.iflags.failing_untrap;
    if (!!(ttmp = t_at(G.u.ux, G.u.uy))) {
      ttmp.tseen = 1;
    }
    await exercise(A_WIS, FALSE);
  }
}

async function try_disarm(ttmp: struct_trap | null, force_failure: number): Promise<number> {
  let mtmp = !!G.level.monsters[ttmp.tx][ttmp.ty] ? G.level.monsters[ttmp.tx][ttmp.ty] : null;
  let ttype = ttmp.ttyp | 0;
  let under_u = (!G.u.dx && !G.u.dy ? 1 : 0) << 24 >> 24;
  let holdingtrap = (ttype === BEAR_TRAP || ttype === WEB ? 1 : 0) << 24 >> 24;
  if (mtmp && (!mtmp.mtrapped || !holdingtrap)) {
    await pline(S("%s is in the way."), await Monnam(mtmp));
    return 0;
  }
  if (sobj_at(BOULDER, ttmp.tx, ttmp.ty) && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && !under_u) {
    await There(S("is a boulder in your way."));
    return 0;
  }
  if (G.u.dx && G.u.dy && bad_rock(G.youmonst.data, G.u.ux, ttmp.ty) && bad_rock(G.youmonst.data, ttmp.tx, G.u.uy)) {
    if (G.invent && inv_weight() + weight_cap() > 600 || G.youmonst.data.msize >= 3) {
      await You(S("are unable to reach the %s!"), G.defsyms[S_arrow_trap + ttype - 1].explanation);
      return 0;
    }
  }
  if (!can_reach_floor(under_u)) {
    if (G.u.usteed && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
      await rider_cant_reach();
    } else {
      await You(S("are unable to reach the %s!"), G.defsyms[S_arrow_trap + ttype - 1].explanation);
    }
    return 0;
  }
  if (force_failure || untrap_prob(ttmp)) {
    if (rnl(5)) {
      await pline(S("Whoops..."));
      if (mtmp) {
        if (ttype === BEAR_TRAP) {
          if (mtmp.mtame) {
            await abuse_dog(mtmp);
          }
          mtmp.mhp -= rnd(4);
          if (mtmp.mhp < 1) {
            await killed(mtmp);
          }
        } else if (ttype === WEB) {
          if (!(G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95))) {
            let ttmp2 = await maketrap(G.u.ux, G.u.uy, WEB);
            if (ttmp2) {
              await pline_The(S("webbing sticks to you.  You're caught too!"));
              await dotrap(ttmp2, NOWEBMSG);
              if (G.u.usteed && G.u.utrap) {
                await dismount_steed(DISMOUNT_FELL);
              }
            }
          } else {
            await pline(S("%s remains entangled."), await Monnam(mtmp));
          }
        }
      } else if (under_u) {
        await dotrap(ttmp, FAILEDUNTRAP);
      } else {
        await move_into_trap(ttmp);
      }
    } else {
      await pline(S("%s %s is difficult to %s."), ttmp.madeby_u | 0 ? S("Your") : under_u ? S("This") : S("That"), G.defsyms[S_arrow_trap + ttype - 1].explanation, ttype === WEB ? S("remove") : S("disarm"));
    }
    return 1;
  }
  return 2;
}

async function reward_untrap(ttmp: struct_trap | null, mtmp: struct_monst | null): Promise<void> {
  if (!ttmp.madeby_u) {
    if (rnl(10) < 8 && !mtmp.mpeaceful && !mtmp.msleeping && !mtmp.mfrozen && !((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && mtmp.data.mlet !== S_HUMAN) {
      mtmp.mpeaceful = 1;
      set_malign(mtmp);
      await pline(S("%s is grateful."), await Monnam(mtmp));
    }
    if (!rn2(3) && !rnl(8) && G.u.ualign.type === A_LAWFUL) {
      adjalign(1);
      await You_feel(S("that you did the right thing."));
    }
  }
}

async function disarm_holdingtrap(ttmp: struct_trap | null): Promise<number> {
  let mtmp = null;
  let fails = await try_disarm(ttmp, FALSE);
  if (fails < 2) {
    return fails;
  }
  if (!!(mtmp = !!G.level.monsters[ttmp.tx][ttmp.ty] ? G.level.monsters[ttmp.tx][ttmp.ty] : null)) {
    mtmp.mtrapped = 0;
    await You(S("remove %s %s from %s."), G.c_common_strings.c_the_your[ttmp.madeby_u], (ttmp.ttyp | 0) === BEAR_TRAP ? S("bear trap") : S("webbing"), await mon_nam(mtmp));
    await reward_untrap(ttmp, mtmp);
  } else {
    if ((ttmp.ttyp | 0) === BEAR_TRAP) {
      await You(S("disarm %s bear trap."), G.c_common_strings.c_the_your[ttmp.madeby_u]);
      await cnv_trap_obj(BEARTRAP, 1, ttmp, FALSE);
    } else {
      await You(S("succeed in removing %s web."), G.c_common_strings.c_the_your[ttmp.madeby_u]);
      await deltrap(ttmp);
    }
  }
  await newsym(G.u.ux + G.u.dx, G.u.uy + G.u.dy);
  return 1;
}

async function disarm_landmine(ttmp: struct_trap | null): Promise<number> {
  let fails = await try_disarm(ttmp, FALSE);
  if (fails < 2) {
    return fails;
  }
  await You(S("disarm %s land mine."), G.c_common_strings.c_the_your[ttmp.madeby_u]);
  await cnv_trap_obj(LAND_MINE, 1, ttmp, FALSE);
  return 1;
}

async function disarm_squeaky_board(ttmp: struct_trap | null): Promise<number> {
  let obj = null;
  let bad_tool = 0;
  let fails = 0;
  obj = await getobj(P(oil), S("untrap with"));
  if (!obj) {
    return 0;
  }
  bad_tool = (obj.cursed | 0 || (obj.otyp !== POT_OIL || obj.lamplit | 0) && (obj.otyp !== CAN_OF_GREASE || !obj.spe) ? 1 : 0) << 24 >> 24;
  fails = await try_disarm(ttmp, bad_tool);
  if (fails < 2) {
    return fails;
  }
  if (obj.otyp === CAN_OF_GREASE) {
    await consume_obj_charge(obj, TRUE);
  } else {
    await useup(obj);
    await discover_object(296, 1, 1);
  }
  await You(S("repair the squeaky board."));
  await deltrap(ttmp);
  await newsym(G.u.ux + G.u.dx, G.u.uy + G.u.dy);
  await more_experienced(1, 5);
  await newexplevel();
  return 1;
}

async function disarm_shooting_trap(ttmp: struct_trap | null, otyp: number): Promise<number> {
  let fails = await try_disarm(ttmp, FALSE);
  if (fails < 2) {
    return fails;
  }
  await You(S("disarm %s trap."), G.c_common_strings.c_the_your[ttmp.madeby_u]);
  await cnv_trap_obj(otyp, 50 - rnl(50), ttmp, FALSE);
  return 1;
}

async function try_lift(mtmp: struct_monst | null, ttmp: struct_trap | null, wt: number, stuff: number): Promise<number> {
  let wc = weight_cap();
  if ((wt * 2 / wc | 0) >= HVY_ENCUMBER) {
    await pline(S("%s is %s for you to lift."), await Monnam(mtmp), stuff ? S("carrying too much") : S("too heavy"));
    if (!ttmp.madeby_u && !mtmp.mpeaceful && mtmp.mcanmove | 0 && !((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && mtmp.data.mlet !== S_HUMAN && rnl(10) < 3) {
      mtmp.mpeaceful = 1;
      set_malign(mtmp);
      await pline(S("%s thinks it was nice of you to try."), await Monnam(mtmp));
    }
    return 0;
  }
  return 1;
}

async function help_monster_out(mtmp: struct_monst | null, ttmp: struct_trap | null): Promise<number> {
  let wt = 0;
  let otmp = null;
  let uprob = 0;
  if (!mtmp.mtrapped) {
    await pline(S("%s isn't trapped."), await Monnam(mtmp));
    return 0;
  }
  if (await check_capacity(null)) {
    return 1;
  }
  if ((uprob = untrap_prob(ttmp) << 24 >> 24) && !mtmp.msleeping && mtmp.mcanmove | 0) {
    await You(S("try to reach out your %s, but %s backs away skeptically."), await makeplural(body_part(ARM)), await mon_nam(mtmp));
    return 1;
  }
  if ((mtmp.data === $sat(G.mons, 10) || mtmp.data === $sat(G.mons, 9)) && !G.uarmg && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    await You(S("grab the trapped %s using your bare %s."), mtmp.data.mname, await makeplural(body_part(HAND)));
    if (poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM)) {
      await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    } else {
      let kbuf = new Int8Array(256);
      sprintf(P(kbuf), S("trying to help %s out of a pit"), await an(mtmp.data.mname));
      await instapetrify(P(kbuf));
      return 1;
    }
  }
  if (uprob) {
    await You(S("try to grab %s, but cannot get a firm grasp."), await mon_nam(mtmp));
    if (mtmp.msleeping) {
      mtmp.msleeping = 0;
      await pline(S("%s awakens."), await Monnam(mtmp));
    }
    return 1;
  }
  await You(S("reach out your %s and grab %s."), await makeplural(body_part(ARM)), await mon_nam(mtmp));
  if (mtmp.msleeping) {
    mtmp.msleeping = 0;
    await pline(S("%s awakens."), await Monnam(mtmp));
  } else if (mtmp.mfrozen | 0 && !rn2(mtmp.mfrozen | 0)) {
    mtmp.mcanmove = 1;
    mtmp.mfrozen = 0;
    await pline(S("%s stirs."), await Monnam(mtmp));
  }
  wt = inv_weight() + mtmp.data.cwt;
  if (!await try_lift(mtmp, ttmp, wt, FALSE)) {
    return 1;
  }
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    wt += otmp.owt;
  }
  if (!await try_lift(mtmp, ttmp, wt, TRUE)) {
    return 1;
  }
  await You(S("pull %s out of the pit."), await mon_nam(mtmp));
  mtmp.mtrapped = 0;
  await reward_untrap(ttmp, mtmp);
  await fill_pit(mtmp.mx, mtmp.my);
  return 1;
}

export async function untrap(force: number): Promise<number> {
  let $t1: any;
  let otmp = null;
  let x = 0;
  let y = 0;
  let ch = 0;
  let ttmp = null;
  let mtmp = null;
  let trapdescr = null;
  let here = 0;
  let useplural = 0;
  let deal_with_floor_trap = 0;
  let confused = (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? 1 : 0) << 24 >> 24;
  let trap_skipped = FALSE;
  let boxcnt = 0;
  let the_trap = new Int8Array(256);
  let qbuf = new Int8Array(128);
  if (!await getdir(null)) {
    return 0;
  }
  x = G.u.ux + G.u.dx;
  y = G.u.uy + G.u.dy;
  if (!isok(x, y)) {
    await pline_The(S("perils lurking there are beyond your grasp."));
    return 0;
  }
  if (!force && has_magic_key(G.youmonst)) {
    force = TRUE;
  }
  ttmp = t_at(x, y);
  if (ttmp && !ttmp.tseen) {
    ttmp = null;
  }
  trapdescr = ttmp ? G.defsyms[S_arrow_trap + (ttmp.ttyp | 0) - 1].explanation : null;
  here = (x === G.u.ux && y === G.u.uy ? 1 : 0) << 24 >> 24;
  if (here) {
    for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
      if (otmp.otyp === 189 || otmp.otyp === 190) {
        if (++boxcnt > 1) {
          break;
        }
      }
    }
  }
  deal_with_floor_trap = can_reach_floor(FALSE);
  if (!deal_with_floor_trap) {
    $wr(P(the_trap), 0, 0);
    if (ttmp) {
      strcat(P(the_trap), await an(trapdescr));
    }
    if (ttmp && boxcnt) {
      strcat(P(the_trap), S(" and "));
    }
    if (boxcnt) {
      strcat(P(the_trap), boxcnt === 1 ? S("a container") : S("containers"));
    }
    useplural = (ttmp && boxcnt > 0 || boxcnt > 1 ? 1 : 0) << 24 >> 24;
    if (ttmp || boxcnt) {
      await There(S("%s %s %s but you can't reach %s%s."), useplural ? S("are") : S("is"), P(the_trap), here ? S("here") : S("there"), useplural ? S("them") : S("it"), G.u.usteed ? S(" while mounted") : S(""));
    }
    trap_skipped = (!!ttmp ? 1 : 0) << 24 >> 24;
  } else {
    if (ttmp) {
      strcpy(P(the_trap), await the(trapdescr));
      if (boxcnt) {
        if ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT) {
          await You_cant(S("do much about %s%s."), P(the_trap), G.u.utrap ? S(" that you're stuck in") : S(" while standing on the edge of it"));
          trap_skipped = TRUE;
          deal_with_floor_trap = FALSE;
        } else {
          sprintf(P(qbuf), S("There %s and %s here.  %s %s?"), boxcnt === 1 ? S("is a container") : S("are containers"), await an(trapdescr), (ttmp.ttyp | 0) === WEB ? S("Remove") : S("Disarm"), P(the_trap));
          switch (await yn_function(P(qbuf), P(G.ynqchars), 113)) {
          case 113:
            return 0;
          case 110:
            trap_skipped = TRUE;
            deal_with_floor_trap = FALSE;
            break;
          }
        }
      }
      if (deal_with_floor_trap) {
        if (G.u.utrap) {
          await You(S("cannot deal with %s while trapped%s!"), P(the_trap), x === G.u.ux && y === G.u.uy ? S(" in it") : S(""));
          return 1;
        }
        if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && ((mtmp.m_ap_type & 7) === M_AP_FURNITURE || (mtmp.m_ap_type & 7) === M_AP_OBJECT)) {
          await stumble_onto_mimic(mtmp);
          return 1;
        }
        switch (ttmp.ttyp | 0) {
        case BEAR_TRAP:
        case WEB:
          return await disarm_holdingtrap(ttmp);
        case LANDMINE:
          return await disarm_landmine(ttmp);
        case SQKY_BOARD:
          return await disarm_squeaky_board(ttmp);
        case DART_TRAP:
          return await disarm_shooting_trap(ttmp, DART);
        case ARROW_TRAP:
          return await disarm_shooting_trap(ttmp, ARROW);
        case PIT:
        case SPIKED_PIT:
          if (here) {
            await You(S("are already on the edge of the pit."));
            return 0;
          }
          if (!mtmp) {
            await pline(S("Try filling the pit instead."));
            return 0;
          }
          return await help_monster_out(mtmp, ttmp);
        default:
          await You(S("cannot disable %s trap."), !here ? S("that") : S("this"));
          return 0;
        }
      }
    }
    if (boxcnt) {
      for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
        if (otmp.otyp === 189 || otmp.otyp === 190) {
          await safe_qbuf(P(qbuf), S("There is "), S(" here.  Check it for traps?"), otmp, doname, ansimpleoname, S("a box"));
          switch (await yn_function(P(qbuf), P(G.ynqchars), 113)) {
          case 113:
            return 0;
          case 110:
            continue;
          }
          if (otmp.otrapped | 0 && (force || !confused && rn2(MAXULEV + 1 - G.u.ulevel) < 10) || !force && confused && !rn2(3)) {
            await You(S("find a trap on %s!"), await the(await xname(otmp)));
            if (!confused) {
              await exercise(A_WIS, TRUE);
            }
            switch (await yn_function(S("Disarm it?"), P(G.ynqchars), 113)) {
            case 113:
              return 1;
            case 110:
              trap_skipped = TRUE;
              continue;
            }
            if (otmp.otrapped) {
              await exercise(A_DEX, TRUE);
              ch = acurr(A_DEX) + G.u.ulevel;
              if (G.urole.malenum === 338) {
                ch = ch * 2;
              }
              if (!force && (confused || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || rnd(75 + (level_difficulty() / 2 | 0)) > ch)) {
                await chest_trap(otmp, FINGER, TRUE);
              } else {
                await You(S("disarm it!"));
                otmp.otrapped = 0;
              }
            } else {
              await pline(S("That %s was not trapped."), await xname(otmp));
            }
            return 1;
          } else {
            await You(S("find no traps on %s."), await the(await xname(otmp)));
            return 1;
          }
        }
      }
      await You(trap_skipped ? S("find no other traps here.") : S("know of no traps here."));
      return 0;
    }
    if (await stumble_on_door_mimic(x, y)) {
      return 1;
    }
  }
  if (!($at2(G.level.locations, x, y).typ === DOOR)) {
    if (!trap_skipped) {
      await You(S("know of no traps there."));
    }
    return 0;
  }
  switch ($at2(G.level.locations, x, y).flags | 0) {
  case 0:
    await You(S("%s no door there."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see"));
    return 0;
  case 2:
    await pline(S("This door is safely open."));
    return 0;
  case 1:
    await pline(S("This door is broken."));
    return 0;
  }
  if ((($at2(G.level.locations, x, y).flags | 0) & D_TRAPPED) !== 0 && (force || !confused && rn2(MAXULEV - G.u.ulevel + 11) < 10) || !force && confused && !rn2(3)) {
    await You(S("find a trap on the door!"));
    await exercise(A_WIS, TRUE);
    if (await yn_function(S("Disarm it?"), P(G.ynqchars), 113) !== 121) {
      return 1;
    }
    if (($at2(G.level.locations, x, y).flags | 0) & D_TRAPPED) {
      ch = 15 + (G.urole.malenum === 338 ? G.u.ulevel * 3 : G.u.ulevel);
      await exercise(A_DEX, TRUE);
      if (!force && (confused || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || rnd(75 + (level_difficulty() / 2 | 0)) > ch)) {
        await You(S("set it off!"));
        await b_trapped(S("door"), FINGER);
        $at2(G.level.locations, x, y).flags = (D_NODOOR) & 31;
        unblock_point(x, y);
        await newsym(x, y);
        if ($rd(in_rooms(x, y, SHOPBASE))) {
          await add_damage(x, y, 0);
        }
      } else {
        await You(S("disarm it!"));
        ($t1 = $at2(G.level.locations, x, y), $t1.flags = ((($t1.flags | 0) & ~D_TRAPPED) >>> 0) & 31);
      }
    } else {
      await pline(S("This door was not trapped."));
    }
    return 1;
  } else {
    await You(S("find no traps on the door."));
    return 1;
  }
}

export async function openholdingtrap(mon: struct_monst | null, noticed: Ptr | null): Promise<number> {
  let t = null;
  let buf = new Int8Array(256);
  let whichbuf = new Int8Array(20);
  let trapdescr = null;
  let which = null;
  let ishero = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  if (!mon) {
    return FALSE;
  }
  if (mon === G.u.usteed) {
    ishero = TRUE;
  }
  t = t_at(ishero ? G.u.ux : mon.mx, ishero ? G.u.uy : mon.my);
  if (ishero && G.u.utrap) {
    which = G.c_common_strings.c_the_your[!t || !t.tseen || !t.madeby_u ? 0 : 1];
    switch (G.u.utraptype) {
    case TT_LAVA:
      trapdescr = S("molten lava");
      break;
    case TT_INFLOOR:
      trapdescr = S("ground");
      break;
    case TT_BURIEDBALL:
      trapdescr = S("your anchor");
      which = S("");
      break;
    case TT_BEARTRAP:
    case TT_PIT:
    case TT_WEB:
      trapdescr = null;
      break;
    default:
      trapdescr = S("trap");
      break;
    }
  } else {
    if (!t || (t.ttyp | 0) !== BEAR_TRAP && (t.ttyp | 0) !== WEB) {
      return FALSE;
    }
  }
  if (!trapdescr) {
    trapdescr = G.defsyms[S_arrow_trap + (t.ttyp | 0) - 1].explanation;
  }
  if (!which) {
    which = t.tseen | 0 ? G.c_common_strings.c_the_your[t.madeby_u] : strchr(P(G.vowels), trapdescr.a[trapdescr.o]) ? S("an") : S("a");
  }
  if (which.a[which.o]) {
    which = strcat(strcpy(P(whichbuf), which), S(" "));
  }
  if (ishero) {
    if (!G.u.utrap) {
      return FALSE;
    }
    noticed.a[noticed.o] = TRUE;
    if (G.u.usteed) {
      sprintf(P(buf), S("%s is"), await noit_Monnam(G.u.usteed));
    } else {
      strcpy(P(buf), S("You are"));
    }
    await reset_utrap(TRUE);
    G.vision_full_recalc = 1;
    await pline(S("%s released from %s%s."), P(buf), which, trapdescr);
  } else {
    if (!mon.mtrapped) {
      return FALSE;
    }
    mon.mtrapped = 0;
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      noticed.a[noticed.o] = TRUE;
      await pline(S("%s is released from %s%s."), await Monnam(mon), which, trapdescr);
    } else if ($rd(G.viz_array.a[G.viz_array.o + t.ty], t.tx) & 2 && t.tseen | 0) {
      noticed.a[noticed.o] = TRUE;
      if ((t.ttyp | 0) === WEB) {
        await pline(S("%s is released from %s%s."), G.c_common_strings.c_Something, which, trapdescr);
      } else {
        await pline(S("%s%s opens."), upstart(strcpy(P(buf), which)), trapdescr);
      }
    }
    if (rn2(2) && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 2) {
      await reward_untrap(t, mon);
    }
  }
  return TRUE;
}

export async function closeholdingtrap(mon: struct_monst | null, noticed: Ptr | null): Promise<number> {
  let t = null;
  let dotrapflags = 0;
  let ishero = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  let result = 0;
  if (!mon) {
    return FALSE;
  }
  if (mon === G.u.usteed) {
    ishero = TRUE;
  }
  t = t_at(ishero ? G.u.ux : mon.mx, ishero ? G.u.uy : mon.my);
  if (!t || (t.ttyp | 0) !== BEAR_TRAP && (t.ttyp | 0) !== WEB) {
    return FALSE;
  }
  if (ishero) {
    if (G.u.utrap) {
      return FALSE;
    }
    noticed.a[noticed.o] = TRUE;
    dotrapflags = FORCETRAP;
    if (G.u.usteed) {
      dotrapflags = (dotrapflags | NOWEBMSG) >>> 0;
    }
    ++force_mintrap;
    await dotrap(t, dotrapflags);
    --force_mintrap;
    result = (G.u.utrap !== 0 ? 1 : 0) << 24 >> 24;
  } else {
    if (mon.mtrapped) {
      return FALSE;
    }
    noticed.a[noticed.o] = ($rd(G.viz_array.a[G.viz_array.o + t.ty], t.tx) & 2 || ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) ? 1 : 0) << 24 >> 24;
    ++force_mintrap;
    result = (await mintrap(mon) !== 0 ? 1 : 0) << 24 >> 24;
    --force_mintrap;
  }
  return result;
}

export async function openfallingtrap(mon: struct_monst | null, trapdoor_only: number, noticed: Ptr | null): Promise<number> {
  let t = null;
  let ishero = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
  let result = 0;
  if (!mon) {
    return FALSE;
  }
  if (mon === G.u.usteed) {
    ishero = TRUE;
  }
  t = t_at(ishero ? G.u.ux : mon.mx, ishero ? G.u.uy : mon.my);
  if (!t || (t.ttyp | 0) !== TRAPDOOR && (t.ttyp | 0) !== ROCKTRAP && (trapdoor_only || (t.ttyp | 0) !== HOLE && !((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT))) {
    return FALSE;
  }
  if (ishero) {
    if (G.u.utrap) {
      return FALSE;
    }
    noticed.a[noticed.o] = TRUE;
    await dotrap(t, FORCETRAP);
    result = (G.u.utrap !== 0 ? 1 : 0) << 24 >> 24;
  } else {
    if (mon.mtrapped) {
      return FALSE;
    }
    noticed.a[noticed.o] = ($rd(G.viz_array.a[G.viz_array.o + t.ty], t.tx) & 2 || ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) ? 1 : 0) << 24 >> 24;
    await wakeup(mon, TRUE);
    ++force_mintrap;
    result = (await mintrap(mon) !== 0 ? 1 : 0) << 24 >> 24;
    --force_mintrap;
  }
  return result;
}

export async function chest_trap(obj: struct_obj | null, bodypart: number, disarm: number): Promise<number> {
  let otmp = obj;
  let otmp2 = null;
  let buf = new Int8Array(80);
  let msg = null;
  let cc = new struct_nhcoord();
  if (get_obj_location(obj, P(cc, "x"), P(cc, "y"), 0)) {
    obj.ox = cc.x, obj.oy = cc.y;
  }
  otmp.otrapped = 0;
  await You(disarm ? S("set it off!") : S("trigger a trap!"));
  await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  if (G.u.uluck + G.u.moreluck > -13 && rn2(13 + (G.u.uluck + G.u.moreluck)) > 7) {
    switch (rn2(13)) {
    case 12:
    case 11:
      msg = S("explosive charge is a dud");
      break;
    case 10:
    case 9:
      msg = S("electric charge is grounded");
      break;
    case 8:
    case 7:
      msg = S("flame fizzles out");
      break;
    case 6:
    case 5:
    case 4:
      msg = S("poisoned needle misses");
      break;
    case 3:
    case 2:
    case 1:
    case 0:
      msg = S("gas cloud blows away");
      break;
    default:
      await impossible(S("chest disarm bug"));
      msg = null;
      break;
    }
    if (msg) {
      await pline(S("But luckily the %s!"), msg);
    }
  } else {
    switch (rn2(20) ? G.u.uluck + G.u.moreluck >= 13 ? 0 : rn2(13 - (G.u.uluck + G.u.moreluck)) : rn2(26)) {
    case 25:
    case 24:
    case 23:
    case 22:
    case 21:
      {
        let shkp = null;
        let loss = 0;
        let costly = 0;
        let insider = 0;
        let ox = obj.ox;
        let oy = obj.oy;
        costly = (await costly_spot(ox, oy) && !!(shkp = await shop_keeper($rd(in_rooms(ox, oy, SHOPBASE)))) ? 1 : 0) << 24 >> 24;
        insider = ($rd(P(G.u.ushops)) && inside_shop(G.u.ux, G.u.uy) && $rd(in_rooms(ox, oy, SHOPBASE)) === $rd(P(G.u.ushops)) ? 1 : 0) << 24 >> 24;
        await pline(S("%s!"), await Tobjnam(obj, S("explode")));
        sprintf(P(buf), S("exploding %s"), await xname(obj));
        if (costly) {
          loss += await stolen_value(obj, ox, oy, shkp.mpeaceful << 24 >> 24, TRUE);
        }
        await delete_contents(obj);
        if (!!G.uball && (G.uchain.ox === G.u.ux && G.uchain.oy === G.u.uy || G.uball.where === OBJ_FLOOR && G.uball.ox === G.u.ux && G.uball.oy === G.u.uy)) {
          await unpunish();
        }
        for (otmp = G.level.objects[G.u.ux][G.u.uy]; otmp; otmp = otmp2) {
          otmp2 = otmp.v.v_nexthere;
          if (costly) {
            loss += await stolen_value(otmp, otmp.ox, otmp.oy, shkp.mpeaceful << 24 >> 24, TRUE);
          }
          await delobj(otmp);
        }
        wake_nearby();
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (d(6, 6) + 1) / 2 | 0 : d(6, 6), P(buf), KILLED_BY_AN);
        await exercise(A_STR, FALSE);
        if (costly && loss) {
          if (insider) {
            await You(S("owe %ld %s for objects destroyed."), loss, await currency(loss));
          } else {
            await You(S("caused %ld %s worth of damage!"), loss, await currency(loss));
            await make_angry_shk(shkp, ox, oy);
          }
        }
        return TRUE;
      }
    case 20:
    case 19:
    case 18:
    case 17:
      await pline(S("A cloud of noxious gas billows from %s."), await the(await xname(obj)));
      await poisoned(S("gas cloud"), A_STR, S("cloud of poison gas"), 15, FALSE);
      await exercise(A_CON, FALSE);
      break;
    case 16:
    case 15:
    case 14:
    case 13:
      await You_feel(S("a needle prick your %s."), body_part(bodypart));
      await poisoned(S("needle"), A_CON, S("poisoned needle"), 10, FALSE);
      await exercise(A_CON, FALSE);
      break;
    case 12:
    case 11:
    case 10:
    case 9:
      await dofiretrap(obj);
      break;
    case 8:
    case 7:
    case 6:
      {
        let dmg = 0;
        await You(S("are jolted by a surge of electricity!"));
        if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
          await shieldeff(G.u.ux, G.u.uy);
          await You(S("don't seem to be affected."));
          dmg = 0;
        } else {
          dmg = d(4, 4);
        }
        await destroy_item(RING_CLASS, AD_ELEC);
        await destroy_item(WAND_CLASS, AD_ELEC);
        if (dmg) {
          await losehp(dmg, S("electric shock"), KILLED_BY_AN);
        }
        break;
      }
    case 5:
    case 4:
    case 3:
      if (!G.u.uprops[FREE_ACTION].extrinsic) {
        await pline(S("Suddenly you are frozen in place!"));
        nomul(-d(5, 6));
        G.multi_reason = S("frozen by a trap");
        await exercise(A_DEX, FALSE);
        G.nomovemsg = G.c_common_strings.c_You_can_move_again;
      } else {
        await You(S("momentarily stiffen."));
      }
      break;
    case 2:
    case 1:
    case 0:
      await pline(S("A cloud of %s gas billows from %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? blindgas[rn2(Math.trunc(48 / 8) | 0)] : rndcolor(), await the(await xname(obj)));
      if (!G.u.uprops[STUNNED].intrinsic) {
        if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          await pline(S("What a groovy feeling!"));
        } else {
          await You(S("%s%s..."), stagger(G.youmonst.data, S("stagger")), G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic ? S("") : (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S(" and get dizzy") : S(" and your vision blurs"));
        }
      }
      await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + (rn2(7) + 16), FALSE);
      await make_hallucinated((G.u.uprops[HALLUC].intrinsic & TIMEOUT) + (rn2(5) + 16), FALSE, 0);
      break;
    default:
      await impossible(S("bad chest trap"));
      break;
    }
    await bot();
  }
  return FALSE;
}

export function t_at(x: number, y: number): struct_trap | null {
  let trap = G.ftrap;
  while (trap) {
    if (trap.tx === x && trap.ty === y) {
      return trap;
    }
    trap = trap.ntrap;
  }
  return null;
}

export async function deltrap(trap: struct_trap | null): Promise<void> {
  let ttmp = null;
  clear_conjoined_pits(trap);
  if (trap === G.ftrap) {
    G.ftrap = G.ftrap.ntrap;
  } else {
    for (ttmp = G.ftrap; ttmp; ttmp = ttmp.ntrap) {
      if (ttmp.ntrap === trap) {
        break;
      }
    }
    if (!ttmp) {
      await panic(S("deltrap: no preceding trap!"));
    }
    ttmp.ntrap = trap.ntrap;
  }
  if (G.level.flags.sokoban_rules | 0 && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === HOLE)) {
    maybe_finish_sokoban();
  }
  free(trap);
}

export function conjoined_pits(trap2: struct_trap | null, trap1: struct_trap | null, u_entering_trap2: number): number {
  let dx = 0;
  let dy = 0;
  let diridx = 0;
  let adjidx = 0;
  if (!trap1 || !trap2) {
    return FALSE;
  }
  if (!isok(trap2.tx, trap2.ty) || !isok(trap1.tx, trap1.ty) || !((trap2.ttyp | 0) === PIT || (trap2.ttyp | 0) === SPIKED_PIT) || !((trap1.ttyp | 0) === PIT || (trap1.ttyp | 0) === SPIKED_PIT) || u_entering_trap2 && !(G.u.utrap && G.u.utraptype === TT_PIT)) {
    return FALSE;
  }
  dx = sgn(trap2.tx - trap1.tx);
  dy = sgn(trap2.ty - trap1.ty);
  for (diridx = 0; diridx < 8; ++diridx) {
    if (G.xdir[diridx] === dx && G.ydir[diridx] === dy) {
      break;
    }
  }
  if (diridx < 8) {
    adjidx = (diridx + 4) % 8;
    if (trap1.vl.v_conjoined & 1 << diridx && trap2.vl.v_conjoined & 1 << adjidx) {
      return TRUE;
    }
  }
  return FALSE;
}

function clear_conjoined_pits(trap: struct_trap | null): void {
  let diridx = 0;
  let adjidx = 0;
  let x = 0;
  let y = 0;
  let t = null;
  if (trap && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT)) {
    for (diridx = 0; diridx < 8; ++diridx) {
      if (trap.vl.v_conjoined & 1 << diridx) {
        x = trap.tx + G.xdir[diridx];
        y = trap.ty + G.ydir[diridx];
        if (isok(x, y) && !!(t = t_at(x, y)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT)) {
          adjidx = (diridx + 4) % 8;
          t.vl.v_conjoined = (t.vl.v_conjoined & ~(1 << adjidx)) & 0xff;
        }
        trap.vl.v_conjoined = (trap.vl.v_conjoined & ~(1 << diridx)) & 0xff;
      }
    }
  }
}

function adj_nonconjoined_pit(adjtrap: struct_trap | null): number {
  let trap_with_u = t_at(G.u.ux0, G.u.uy0);
  if (trap_with_u && adjtrap && G.u.utrap && G.u.utraptype === TT_PIT && ((trap_with_u.ttyp | 0) === PIT || (trap_with_u.ttyp | 0) === SPIKED_PIT) && ((adjtrap.ttyp | 0) === PIT || (adjtrap.ttyp | 0) === SPIKED_PIT)) {
    let idx = 0;
    for (idx = 0; idx < 8; ++idx) {
      if (G.xdir[idx] === G.u.dx && G.ydir[idx] === G.u.dy) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

export function uteetering_at_seen_pit(trap: struct_trap | null): number {
  return (trap && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT) && trap.tseen | 0 && trap.tx === G.u.ux && trap.ty === G.u.uy && !(G.u.utrap && G.u.utraptype === TT_PIT) ? 1 : 0) << 24 >> 24;
}

export function uescaped_shaft(trap: struct_trap | null): number {
  return (trap && ((trap.ttyp | 0) === HOLE || (trap.ttyp | 0) === TRAPDOOR) && trap.tseen | 0 && trap.tx === G.u.ux && trap.ty === G.u.uy ? 1 : 0) << 24 >> 24;
}

export async function delfloortrap(ttmp: struct_trap | null): Promise<number> {
  if (ttmp && ((ttmp.ttyp | 0) === SQKY_BOARD || (ttmp.ttyp | 0) === BEAR_TRAP || (ttmp.ttyp | 0) === LANDMINE || (ttmp.ttyp | 0) === FIRE_TRAP || ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT) || ((ttmp.ttyp | 0) === HOLE || (ttmp.ttyp | 0) === TRAPDOOR) || (ttmp.ttyp | 0) === TELEP_TRAP || (ttmp.ttyp | 0) === LEVEL_TELEP || (ttmp.ttyp | 0) === WEB || (ttmp.ttyp | 0) === MAGIC_TRAP || (ttmp.ttyp | 0) === ANTI_MAGIC)) {
    let mtmp = null;
    if (ttmp.tx === G.u.ux && ttmp.ty === G.u.uy) {
      if (G.u.utraptype !== TT_BURIEDBALL) {
        await reset_utrap(TRUE);
      }
    } else if (!!(mtmp = !!G.level.monsters[ttmp.tx][ttmp.ty] ? G.level.monsters[ttmp.tx][ttmp.ty] : null)) {
      mtmp.mtrapped = 0;
    }
    await deltrap(ttmp);
    return TRUE;
  }
  return FALSE;
}

export async function b_trapped(item: Ptr | null, bodypart: number): Promise<void> {
  let lvl = level_difficulty();
  let dmg = rnd(5 + (lvl < 5 ? lvl : 2 + (lvl / 2 | 0)));
  await pline(S("KABOOM!!  %s was booby-trapped!"), await The(item));
  wake_nearby();
  await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("explosion"), KILLED_BY_AN);
  await exercise(A_STR, FALSE);
  if (bodypart) {
    await exercise(A_CON, FALSE);
  }
  await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + dmg, TRUE);
}

async function thitm(tlev: number, mon: struct_monst | null, obj: struct_obj | null, d_override: number, nocorpse: number): Promise<number> {
  let strike = 0;
  let trapkilled = FALSE;
  if (d_override) {
    strike = 1;
  } else if (obj) {
    strike = find_mac(mon) + tlev + obj.spe <= rnd(20) ? 1 : 0;
  } else {
    strike = find_mac(mon) + tlev <= rnd(20) ? 1 : 0;
  }
  if (!strike) {
    if (obj && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
      await pline(S("%s is almost hit by %s!"), await Monnam(mon), await doname(obj));
    }
  } else {
    let dam = 1;
    if (obj && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
      await pline(S("%s is hit by %s!"), await Monnam(mon), await doname(obj));
    }
    if (d_override) {
      dam = d_override;
    } else if (obj) {
      dam = await dmgval(obj, mon);
      if (dam < 1) {
        dam = 1;
      }
    }
    mon.mhp -= dam;
    if (mon.mhp < 1) {
      let xx = mon.mx;
      let yy = mon.my;
      await monkilled(mon, S(""), nocorpse ? -AD_RBRE : AD_PHYS);
      if (mon.mhp < 1) {
        await newsym(xx, yy);
        trapkilled = TRUE;
      }
    }
  }
  if (obj && (!strike || d_override)) {
    await place_object(obj, mon.mx, mon.my);
    await stackobj(obj);
  } else if (obj) {
    await dealloc_obj(obj);
  }
  return trapkilled;
}

export function unconscious(): number {
  if (G.multi >= 0) {
    return FALSE;
  }
  return (G.u.usleep || G.nomovemsg && (!strncmp(G.nomovemsg, S("You awake"), 9) || !strncmp(G.nomovemsg, S("You regain con"), 14) || !strncmp(G.nomovemsg, S("You are consci"), 14)) ? 1 : 0) << 24 >> 24;
}

export async function lava_effects(): Promise<number> {
  let $g = 0;
  let obj = null;
  let obj2 = null;
  let dmg = 0;
  let usurvive = 0;
  let boil_away = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      dmg = d(6, 6);
      await feel_newsym(G.u.ux, G.u.uy);
      await burn_away_slime();
      if (G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) {
        return FALSE;
      }
      usurvive = (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic || G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && dmg < G.u.uhp ? 1 : 0) << 24 >> 24;
      if (!usurvive) {
        for (obj = G.invent; obj; obj = obj.nobj) {
          if (((G.objects[obj.otyp].oc_material | 0) <= WOOD || obj.oclass === POTION_CLASS) && !obj.oerodeproof && G.objects[obj.otyp].oc_oprop !== FIRE_RES && obj.otyp !== SCR_FIRE && obj.otyp !== SPE_FIREBALL && !obj_resists(obj, 0, 0)) {
            obj.in_use = 1;
          }
        }
      }
      if (G.uarmf && (G.objects[G.uarmf.otyp].oc_material | 0) <= WOOD && !G.uarmf.oerodeproof) {
        obj = G.uarmf;
        await pline(S("%s into flame!"), await Yobjnam2(obj, S("burst")));
        ++G.iflags.in_lava_effects;
        await Boots_off();
        await useup(obj);
        --G.iflags.in_lava_effects;
      }
      if (!(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic)) {
        if (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
          await pline_The(S("%s here burns you!"), hliquid(S("lava")));
          if (usurvive) {
            await losehp(dmg, P(lava_killer), KILLED_BY);
            { $g = 1; continue $L; }
          }
        } else {
          await You(S("fall into the %s!"), hliquid(S("lava")));
        }
        usurvive = (G.u.uprops[LIFESAVED].extrinsic || G.flags.explore ? 1 : 0) << 24 >> 24;
        if (G.flags.debug) {
          usurvive = TRUE;
        }
        ++G.iflags.in_lava_effects;
        for (obj = G.invent; obj; obj = obj2) {
          obj2 = obj.nobj;
          if (obj.otyp === SPE_BOOK_OF_THE_DEAD && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            if (usurvive) {
              await pline(S("%s glows a strange %s, but remains intact."), await The(await xname(obj)), hcolor(S("dark red")));
            }
          } else if (obj.in_use) {
            if (obj.owornmask) {
              if (usurvive) {
                await pline(S("%s into flame!"), await Yobjnam2(obj, S("burst")));
              }
              await remove_worn_item(obj, TRUE);
            }
            await useupall(obj);
          }
        }
        --G.iflags.in_lava_effects;
        boil_away = (G.u.umonnum === PM_WATER_ELEMENTAL || G.u.umonnum === PM_STEAM_VORTEX || G.u.umonnum === PM_FOG_CLOUD ? 1 : 0) << 24 >> 24;
        for (; ; ) {
          G.u.uhp = -1;
          G.killer.format = KILLED_BY;
          strcpy(P(G.killer.name), P(lava_killer));
          await You(S("%s..."), boil_away ? S("boil away") : S("burn to a crisp"));
          await done(BURNING);
          if (await safe_teleds(TRUE)) {
            break;
          }
          await pline(S("You're still burning."));
        }
        await You(S("find yourself back on solid %s."), surface(G.u.ux, G.u.uy));
        return TRUE;
      } else if (!(G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) && (!G.u.utrap || G.u.utraptype !== TT_LAVA)) {
        boil_away = (!(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) ? 1 : 0) << 24 >> 24;
        set_utrap(rn2(4) + 4 + ((boil_away ? 2 : rn2(4) + 12) << 8) >>> 0, TT_LAVA);
        await You(S("sink into the %s%s!"), hliquid(S("lava")), !boil_away ? S(", but it only burns slightly") : S(" and are about to be immolated"));
        if (G.u.uhp > 1) {
          await losehp(!boil_away ? 1 : G.u.uhp / 2 | 0, P(lava_killer), KILLED_BY);
        }
      }
    case 1: // burn_stuff
      await destroy_item(SCROLL_CLASS, AD_FIRE);
      await destroy_item(SPBOOK_CLASS, AD_FIRE);
      await destroy_item(POTION_CLASS, AD_FIRE);
      return FALSE;
    }
    break;
  }
}

export async function sink_into_lava(): Promise<void> {
  if (!G.u.utrap || G.u.utraptype !== TT_LAVA) {
    ;
  } else if (!is_lava(G.u.ux, G.u.uy)) {
    await reset_utrap(FALSE);
  } else if (!G.u.uinvulnerable) {
    if (!(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic)) {
      G.u.uhp = (G.u.uhp + 2) / 3 | 0;
    }
    G.u.utrap = G.u.utrap - (1 << 8) >>> 0;
    if (G.u.utrap < 1 << 8) {
      G.killer.format = KILLED_BY;
      strcpy(P(G.killer.name), S("molten lava"));
      await You(S("sink below the surface and die."));
      await burn_away_slime();
      await done(DISSOLVED);
      await reset_utrap(TRUE);
      if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
        await safe_teleds(TRUE);
      }
    } else if (!G.u.umoved) {
      if (G.u.uprops[SLIMED].intrinsic && rnd(10 - 1) >= (G.u.uprops[SLIMED].intrinsic & TIMEOUT | 0)) {
        await pline(P(sink_into_lava$sink_deeper));
        await burn_away_slime();
      } else {
        await Norep(P(sink_into_lava$sink_deeper));
      }
      G.u.utrap = G.u.utrap + (rnd(4) >>> 0) >>> 0;
    }
  }
}

export function sokoban_guilt(): void {
  if (G.level.flags.sokoban_rules) {
    change_luck(-1);
  }
}

function maybe_finish_sokoban(): void {
  let t = null;
  if (G.level.flags.sokoban_rules | 0 && !G.in_mklev) {
    for (t = G.ftrap; t; t = t.ntrap) {
      if (t.madeby_u) {
        continue;
      }
      if ((t.ttyp | 0) === PIT || (t.ttyp | 0) === HOLE) {
        break;
      }
    }
    if (!t) {
      G.level.flags.sokoban_rules = 0;
    }
  }
}

export function $init(): void {
  force_mintrap = 0;
  a_your = [S("a"), S("your")];
  A_Your = [S("A"), S("Your")];
  tower_of_flame = $cs("tower of flame", 15);
  A_gush_of_water_hits = S("A gush of water hits");
  blindgas = [S("humid"),
S("odorless"),
S("pungent"),
S("chilling"),
S("acrid"),
S("biting")];
  launchplace = new anon_trap_c_1709();
  acid_ctx = struct_h2o_ctx.$of();
  oil = $ta(Int8Array, 4, [ALL_CLASSES, TOOL_CLASS, POTION_CLASS]);
  lava_killer = $cs("molten lava", 12);
  erode_obj$action = [S("smoulder"),
S("rust"),
S("rot"),
S("corrode")];
  erode_obj$msg = [S("burnt"),
S("rusted"),
S("rotten"),
S("corroded")];
  erode_obj$bythe = [S("heat"),
S("oxidation"),
S("decay"),
S("corrosion")];
  grease_protect$txt = $cs("protected by the layer of grease!", 34);
  maketrap$zero_vl = new union_vlaunchinfo();
  animate_statue$historic_statue_is_gone = $cs("that the historic statue is now gone", 37);
  dotrap$recursive_mine = 0;
  trapnote$tnbuf = new Int8Array(12);
  sink_into_lava$sink_deeper = $cs("You sink deeper into the lava.", 31);
}
