// @ts-nocheck
// NetHack 3.6.7 do.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { next_to_u, reset_trapset } from './apply.ts';
import { artifact_has_invprop, finesse_ahriman } from './artifact.ts';
import { ballfall, ballrelease, drag_down, drop_ball, placebc, unplacebc } from './ball.ts';
import { check_gold_symbol } from './botl.ts';
import { reset_occupations, set_occupation, yn_function } from './cmd.ts';
import { is_lava, is_pool, is_pool_or_lava } from './dbridge.ts';
import { buried_ball_to_punishment, bury_objs, use_pick_axe2 } from './dig.ts';
import { docrt, flush_screen, map_background, map_object, newsym } from './display.ts';
import { Adjmonnam, Amonnam, Monnam, docall, hcolor, hliquid, mon_nam, rndmonnam, y_monnam } from './do_name.ts';
import { keepdogs, losedogs, update_mlstmv } from './dog.ts';
import { container_impact_dmg, impact_drop, obj_delivery, ship_object } from './dokick.ts';
import { hitfloor } from './dothrow.ts';
import { assign_graphics } from './drawing.ts';
import { Can_fall_thru, In_V_tower, In_W_tower, In_hell, In_quest, On_W_tower_level, assign_level, assign_rnd_level, at_dgn_entrance, builds_up, depth, dunlev, dunlevs_in_dungeon, get_annotation, goto_hell, ledger_no, maxledgerno, next_level, on_level, prev_level, recalc_mapseen, recbranch_mapseen, remdun_mapseen, u_on_dnstairs, u_on_newpos, u_on_rndspot, u_on_sstairs, u_on_upstairs } from './dungeon.ts';
import { done, panic } from './end.ts';
import { can_reach_floor, engr_at, make_grave, surface } from './engrave.ts';
import { create_levelfile, delete_levelfile, nhclose, open_levelfile } from './files.ts';
import { floating_above } from './fountain.ts';
import { check_special_room, losehp, near_capacity, pooleffects, u_rooted } from './hack.ts';
import { dist2, reseed_random, s_suffix, upstart } from './hacklib.ts';
import { delobj, freeinv, getobj, ggetobj, stackobj, useup, useupf } from './invent.ts';
import { maybe_reset_pick } from './lock.ts';
import { grow_up, reset_rndmonst } from './makemon.ts';
import { gulp_blnd_check } from './mhitu.ts';
import { gain_guardian_angel } from './minion.ts';
import { mklev } from './mklev.ts';
import { fumaroles, movebubbles, restore_waterlevel, save_waterlevel, waterbody_name } from './mkmaze.ts';
import { add_to_buried, costly_alteration, obj_meld, obj_nexto_xy, place_object, pudding_merge_message, set_bknown, splitobj, weight } from './mkobj.ts';
import { kill_genocided_monsters, m_into_limbo, mnexto, mondied, newcham, pm_to_cham, wake_nearto } from './mon.ts';
import { locomotion } from './mondata.ts';
import { create_mplayers } from './mplayer.ts';
import { oinit } from './o_init.ts';
import { Doname2, The, an, corpse_xname, doname, fruitname, makeplural, otense, the, vtense, xname, yname, yobjnam } from './objnam.ts';
import { reglyph_darkroom } from './options.ts';
import { add_valid_menu_class, allow_all, allow_category, encumber_msg, pickup, query_category, query_objlist } from './pickup.ts';
import { Norep, There, You, You_cant, You_feel, You_hear, You_see, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, mbodypart } from './polyself.ts';
import { make_blinded } from './potion.ts';
import { reset_hostility } from './priest.ts';
import { ok_to_quest, onquest } from './quest.ts';
import { com_pager, deliver_splev_message } from './questpgr.ts';
import { forget_map, forget_traps } from './read.ts';
import { in_out_region } from './region.ts';
import { getlev, minit } from './restore.ts';
import { d, rn2, rnd, rnz } from './rnd.ts';
import { bclose, bufon, savelev, savestateinlock, tricked_fileremoved } from './save.ts';
import { is_unpaid, obfree, sellobj, sellobj_state, stolen_value } from './shk.ts';
import { mpickobj } from './steal.ts';
import { dismount_steed, stucksteed } from './steed.ts';
import { enexto, rloc, safe_teleds } from './teleport.ts';
import { burn_away_slime, run_timers, start_timer } from './timeout.ts';
import { initrack } from './track.ts';
import { climb_pit, delfloortrap, deltrap, dotrap, fill_pit, float_down, lava_damage, minstapetrify, reset_utrap, seetrap, selftouch, t_at, uescaped_shaft, uteetering_at_seen_pit, water_damage } from './trap.ts';
import { hmon } from './uhitm.ts';
import { error } from './unixtty.ts';
import { vision_recalc, vision_reset } from './vision.ts';
import { dmgval } from './weapon.ts';
import { setuqwep, setuswapwep, setuwep, welded, weldmsg } from './wield.ts';
import { resurrect } from './wizard.ts';
import { worm_known } from './worm.ts';
import { bypass_objlist, nxt_unbypassed_obj } from './worn.ts';
import { get_container_location, get_obj_location, obj_resists, revive } from './zap.ts';
import { struct_d_level, struct_monst, struct_nhcoord, struct_obj, union_any } from './structs.ts';
import { $at2, $rd, $sadd, $sat, $ta, $wr, G, P, S, free, memset, rn2_on_display_rng, sprintf, strchr, strcmp, strcpy } from './rt/index.ts';
import { ALLOW_COUNT, ALL_CLASSES, ALL_FINISHED, ALL_MAP, ALL_TYPES, ALL_TYPES_SELECTED, ALTAR, AM_NONE, A_DEX, BLINDED, BOTH_SIDES, BOULDER, BUC_BLESSED, BUC_CURSED, BUC_UNCURSED, BUC_UNKNOWN, CHOOSE_ALL, COIN_CLASS, COLNO, CORPSE, COST_DEGRD, CXN_SINGULAR, DB_FLOOR, DB_UNDER, DEAF, DETECT_MONSTERS, DISMOUNT_FELL, DRAWBRIDGE_UP, ER_DESTROYED, ESCAPED, EXPL_MAX, FACE, FALSE, FIRE_RES, FLYING, FORGOTTEN, FOUNTAIN, FREE_SAVE, FUMBLING, GRAVE, HALF_PHDAM, HALLUC, HALLUC_RES, HAND, HMON_THROWN, HOLE, INFRAVISION, INVORDER_SORT, I_SPECIAL, KILLED_BY, LADDER, LEASH, LEG, LEVITATION, LFILE_EXISTS, LOADSTONE, M3_DISPLACES, MAGIC_PORTAL, MAXPCHARS, MEAT_RING, MENU_COMBINATION, MENU_FULL, MENU_TRADITIONAL, MZ_HUGE, NON_PM, NO_KILLER_PREFIX, NO_TRAP, OBJ_CONTAINED, OBJ_FLOOR, OBJ_FREE, OBJ_INVENT, OBJ_MINVENT, PASSES_WALLS, PICK_ANY, PIT, PM_CROESUS, PM_GREEN_SLIME, PM_NURSE, PM_WRAITH, PRIMARY, P_PICK_AXE, REVIVE_MON, RING_CLASS, ROGUESET, ROOM, ROT_CORPSE, ROWNO, SEE_INVIS, SELL_DELIBERATE, SELL_NORMAL, SINK, SLT_ENCUMBER, SPIKED_PIT, STAIRS, STOMACH, S_GOLEM, S_MIMIC, S_VORTEX, S_altar, S_dnladder, S_dnstair, S_fountain, S_grave, S_room, S_sink, S_throne, TELEPAT, THRONE, TIMEOUT, TIMER_OBJECT, TOOKPLUNGE, TOOL_CLASS, TRAPDOOR, TRUE, TT_BURIEDBALL, TT_PIT, T_LOOTED, UNENCUMBERED, UNPAID_TYPES, USE_INVLET, VISITED, WARN_OF_MON, WEAPON_CLASS, WORM_TOOTH, WOUNDED_LEGS, WRITE_SAVE, W_ACCESSORY, W_ARMOR, W_ART, W_ARTI, W_SADDLE } from './consts.ts';

let drop_types: any;
let at_ladder: number;
let dfr_pre_msg: Ptr | null;
let dfr_post_msg: Ptr | null;
let goto_level$fam_msgs: any;
let goto_level$halu_fam_msgs: any;
let dowipe$buf: any;

export async function dodrop(): Promise<number> {
  let result = 0;
  let i = G.invent ? 0 : (Math.trunc(4 / 1) | 0) - 1;
  if ($rd(P(G.u.ushops))) {
    sellobj_state(SELL_DELIBERATE);
  }
  result = await drop(await getobj(P(drop_types, i), S("drop")));
  if ($rd(P(G.u.ushops))) {
    sellobj_state(SELL_NORMAL);
  }
  if (result) {
    reset_occupations();
  }
  return result;
}

export async function boulder_hits_pool(otmp: struct_obj | null, rx: number, ry: number, pushing: number): Promise<number> {
  let $t1: any, $t2: any;
  if (!otmp || otmp.otyp !== BOULDER) {
    await impossible(S("Not a boulder?"));
  } else if (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && is_pool_or_lava(rx, ry)) {
    let lava = is_lava(rx, ry);
    let fills_up = 0;
    let what = waterbody_name(rx, ry);
    let ltyp = $at2(G.level.locations, rx, ry).typ;
    let chance = rn2(10);
    fills_up = (lava ? chance === 0 ? 1 : 0 : chance !== 0 ? 1 : 0) << 24 >> 24;
    if (fills_up) {
      let ttmp = t_at(rx, ry);
      if (ltyp === DRAWBRIDGE_UP) {
        ($t1 = $at2(G.level.locations, rx, ry), $t1.flags = ((($t1.flags | 0) & ~DB_UNDER) >>> 0) & 31);
        ($t2 = $at2(G.level.locations, rx, ry), $t2.flags = (($t2.flags | 0 | DB_FLOOR) >>> 0) & 31);
      } else {
        $at2(G.level.locations, rx, ry).typ = ROOM, $at2(G.level.locations, rx, ry).flags = 0;
      }
      if (ttmp) {
        await delfloortrap(ttmp);
      }
      await bury_objs(rx, ry);
      await newsym(rx, ry);
      if (pushing) {
        let whobuf = new Int8Array(256);
        strcpy(P(whobuf), S("you"));
        if (G.u.usteed) {
          strcpy(P(whobuf), await y_monnam(G.u.usteed));
        }
        await pline(S("%s %s %s into the %s."), upstart(P(whobuf)), vtense(P(whobuf), S("push")), await the(await xname(otmp)), what);
        if (G.flags.verbose && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("Now you can cross it!"));
        }
      }
    }
    if (!fills_up || !pushing) {
      if (!G.u.uinwater) {
        if (pushing ? !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0 : $rd(G.viz_array.a[G.viz_array.o + ry], rx) & 2) {
          await There(S("is a large splash as %s %s the %s."), await the(await xname(otmp)), fills_up ? S("fills") : S("falls into"), what);
        } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await You_hear(S("a%s splash."), lava ? S(" sizzling") : S(""));
        }
        wake_nearto(rx, ry, 40);
      }
      if (fills_up && G.u.uinwater | 0 && dist2(rx, ry, G.u.ux, G.u.uy) === 0) {
        G.u.uinwater = 0;
        await docrt();
        G.vision_full_recalc = 1;
        await You(S("find yourself on dry land again!"));
      } else if (lava && dist2(rx, ry, G.u.ux, G.u.uy) <= 2) {
        let dmg = 0;
        await You(S("are hit by molten %s%c"), hliquid(S("lava")), G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic ? 46 : 33);
        await burn_away_slime();
        dmg = d(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic ? 1 : 3, 6);
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("molten lava"), KILLED_BY);
      } else if (!fills_up && G.flags.verbose && (pushing ? !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0 : $rd(G.viz_array.a[G.viz_array.o + ry], rx) & 2)) {
        await pline(S("It sinks without a trace!"));
      }
    }
    if (pushing) {
      await delobj(otmp);
    } else {
      await obfree(otmp, null);
    }
    return TRUE;
  }
  return FALSE;
}

export async function flooreffects(obj$: struct_obj | null, x: number, y: number, verb: Ptr | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  let t = null;
  let mtmp = null;
  const otmp = [null];
  let tseen = 0;
  let ttyp = NO_TRAP;
  if (obj[0].where !== OBJ_FREE) {
    await panic(S("flooreffects: obj not free"));
  }
  obj[0].nobj = obj[0].v.v_nexthere = null;
  if (obj[0].otyp === BOULDER && await boulder_hits_pool(obj[0], x, y, FALSE)) {
    return TRUE;
  } else if (obj[0].otyp === BOULDER && !!(t = t_at(x, y)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT || ((t.ttyp | 0) === HOLE || (t.ttyp | 0) === TRAPDOOR))) {
    ttyp = t.ttyp | 0;
    tseen = (t.tseen | 0 ? TRUE : FALSE) << 24 >> 24;
    if ((mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && mtmp.mtrapped | 0 || G.u.utrap && G.u.ux === x && G.u.uy === y) {
      if (verb.a[verb.o] && ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 || dist2(x, y, G.u.ux, G.u.uy) === 0)) {
        await pline(S("%s boulder %s into the pit%s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("A") : S("The"), vtense(null, verb), mtmp ? S("") : S(" with you"));
      }
      if (mtmp) {
        if (!((mtmp.data.mflags1 & 8) >>> 0 !== 0) && !((mtmp.data.mflags2 & 134217728) >>> 0 !== 0)) {
          let damage = 0;
          let dieroll = 1;
          if (G.context.mon_moving) {
            damage = await dmgval(obj[0], mtmp);
            mtmp.mhp -= damage;
            if (mtmp.mhp < 1) {
              if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
                await pline(S("%s is %s!"), await Monnam(mtmp), (mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) ? S("destroyed") : S("killed"));
              }
              await mondied(mtmp);
            }
          } else {
            await hmon(mtmp, obj[0], HMON_THROWN, dieroll);
          }
          if (!(mtmp.mhp < 1) && !(mtmp.data.mlet === S_VORTEX || mtmp.data === $sat(G.mons, 151))) {
            return FALSE;
          }
        }
        mtmp.mtrapped = 0;
      } else {
        if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && !((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0)) {
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(15) + 1) / 2 | 0 : rnd(15), S("squished under a boulder"), NO_KILLER_PREFIX);
          return FALSE;
        } else {
          await reset_utrap(TRUE);
        }
      }
    }
    if (verb.a[verb.o]) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && x === G.u.ux && y === G.u.uy) {
        await You_hear(S("a CRASH! beneath you."));
      } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && $rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("boulder %s%s."), ttyp === TRAPDOOR && !tseen ? S("triggers and ") : S(""), ttyp === TRAPDOOR ? S("plugs a trap door") : ttyp === HOLE ? S("plugs a hole") : S("fills a pit"));
      } else {
        await You_hear(S("a boulder %s."), verb);
      }
    }
    if (!!(t = t_at(x, y))) {
      await deltrap(t);
    }
    await useupf(obj[0], 1);
    await bury_objs(x, y);
    await newsym(x, y);
    return TRUE;
  } else if (is_lava(x, y)) {
    return await lava_damage(obj[0], x, y);
  } else if (is_pool(x, y)) {
    if (((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && (x === G.u.ux && y === G.u.uy)) {
      if (!G.u.uinwater) {
        if (await weight(obj[0]) > 9) {
          await pline(S("Splash!"));
        } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
          await pline(S("Plop!"));
        }
      }
      await map_background(x, y, 0);
      await newsym(x, y);
    }
    return (await water_damage(obj[0], null, FALSE) === ER_DESTROYED ? 1 : 0) << 24 >> 24;
  } else if (G.u.ux === x && G.u.uy === y && !!(t = t_at(x, y)) && (uteetering_at_seen_pit(t) || uescaped_shaft(t))) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You_hear(S("%s tumble downwards."), await the(await xname(obj[0])));
    } else {
      await pline(S("%s %s into %s %s."), await The(await xname(obj[0])), otense(obj[0], S("tumble")), G.c_common_strings.c_the_your[t.madeby_u], (t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT ? S("pit") : S("hole"));
    }
  } else if (obj[0].globby) {
    while (obj[0] && !!(otmp[0] = await obj_nexto_xy(obj[0], x, y, TRUE))) {
      await pudding_merge_message(obj[0], otmp[0]);
      await obj_meld(P(obj, 0), P(otmp, 0));
    }
    return (!obj[0] ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export async function doaltarobj(obj: struct_obj | null): Promise<void> {
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    return;
  }
  if (obj.oclass !== COIN_CLASS) {
    ++G.u.uconduct.gnostic;
  } else {
    obj.blessed = (obj.cursed = 0) & 1;
  }
  if (obj.blessed | 0 || obj.cursed | 0) {
    await There(S("is %s flash as %s %s the altar."), await an(hcolor(obj.blessed | 0 ? G.c_color_names.c_amber : G.c_color_names.c_black)), await doname(obj), otense(obj, S("hit")));
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
      obj.bknown = 1;
    }
  } else {
    await pline(S("%s %s on the altar."), await Doname2(obj), otense(obj, S("land")));
    if (obj.oclass !== COIN_CLASS) {
      obj.bknown = 1;
    }
  }
}

async function trycall(obj: struct_obj | null): Promise<void> {
  if (!G.objects[obj.otyp].oc_name_known && !G.objects[obj.otyp].oc_uname) {
    await docall(obj);
  }
}

async function polymorph_sink(): Promise<void> {
  let $t1: any;
  let sym = S_sink;
  let sinklooted = 0;
  let algn = 0;
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ !== SINK) {
    return;
  }
  sinklooted = (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) !== 0 ? 1 : 0) << 24 >> 24;
  G.level.flags.nsinks = G.level.flags.nsinks - 1 & 0xff;
  $at2(G.level.locations, G.u.ux, G.u.uy).flags = 0;
  switch (rn2(4)) {
  default:
  case 0:
    sym = S_fountain;
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = FOUNTAIN;
    $at2(G.level.locations, G.u.ux, G.u.uy).horizontal = 0;
    if (sinklooted) {
      ($t1 = $at2(G.level.locations, G.u.ux, G.u.uy), $t1.flags = (($t1.flags | 0 | 1) >>> 0) & 31);
    }
    ;
    G.level.flags.nfountains = G.level.flags.nfountains + 1 & 0xff;
    break;
  case 1:
    sym = S_throne;
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = THRONE;
    if (sinklooted) {
      $at2(G.level.locations, G.u.ux, G.u.uy).flags = (T_LOOTED) & 31;
    }
    break;
  case 2:
    sym = S_altar;
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = ALTAR;
    algn = rn2(3) - 1;
    $at2(G.level.locations, G.u.ux, G.u.uy).flags = ((In_hell(G.u.uz) && rn2(3) ? AM_NONE : algn === -128 ? 0 : algn === 1 ? 4 : algn + 2) >>> 0) & 31;
    break;
  case 3:
    sym = S_room;
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = ROOM;
    await make_grave(G.u.ux, G.u.uy, null);
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === GRAVE) {
      sym = S_grave;
    }
    break;
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ !== ROOM) {
    await pline_The(S("sink transforms into %s!"), await an(G.defsyms[sym].explanation));
  } else {
    await pline_The(S("sink vanishes."));
  }
  await newsym(G.u.ux, G.u.uy);
}

async function teleport_sink(): Promise<number> {
  let cx = 0;
  let cy = 0;
  let cnt = 0;
  let trp = null;
  let eng = null;
  do {
    cx = rnd(COLNO - 1);
    cy = rn2(ROWNO);
    trp = t_at(cx, cy);
    eng = engr_at(cx, cy);
  } while (($at2(G.level.locations, cx, cy).typ !== ROOM || trp || eng || $rd(G.viz_array.a[G.viz_array.o + cy], cx) & 2) && cnt++ < 200);
  if ($at2(G.level.locations, cx, cy).typ === ROOM && !trp && !eng) {
    $at2(G.level.locations, cx, cy).typ = SINK;
    $at2(G.level.locations, cx, cy).flags = ($at2(G.level.locations, G.u.ux, G.u.uy).flags) & 31;
    await newsym(cx, cy);
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = ROOM;
    $at2(G.level.locations, G.u.ux, G.u.uy).flags = 0;
    await newsym(G.u.ux, G.u.uy);
    return TRUE;
  }
  return FALSE;
}

async function dosinkring(obj: struct_obj | null): Promise<void> {
  let $g = 0;
  let otmp = null;
  let otmp2 = null;
  let ideed = 0;
  let nosink = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      ideed = TRUE;
      nosink = FALSE;
      await You(S("drop %s down the drain."), await doname(obj));
      obj.in_use = (TRUE) & 1;
      switch (obj.otyp) {
      case 157: { $g = 3; continue $L; }
      case 170: { $g = 4; continue $L; }
      case 160: { $g = 5; continue $L; }
      case 165: { $g = 6; continue $L; }
      case 162: { $g = 7; continue $L; }
      case 168: { $g = 8; continue $L; }
      case 163: { $g = 9; continue $L; }
      case 159: { $g = 10; continue $L; }
      case 151: { $g = 11; continue $L; }
      case 152: { $g = 12; continue $L; }
      case 153: { $g = 13; continue $L; }
      case 154: { $g = 14; continue $L; }
      case 161: { $g = 15; continue $L; }
      case 245: { $g = 16; continue $L; }
      case 171: { $g = 17; continue $L; }
      case 173: { $g = 18; continue $L; }
      default: { $g = 19; continue $L; }
      }
    case 3:
      await You(S("thought %s got lost in the sink, but there it is!"), await yname(obj));
      { $g = 1; continue $L; }
    case 4:
      await pline_The(S("ring is regurgitated!"));
    case 1: // giveback
      obj.in_use = (FALSE) & 1;
      await dropx(obj);
      await trycall(obj);
      return;
    case 5:
      await pline_The(S("sink quivers upward for a moment."));
      { $g = 2; continue $L; };
    case 6:
      await You(S("smell rotten %s."), await makeplural(await fruitname(FALSE)));
      { $g = 2; continue $L; };
    case 7:
      await pline(S("Several %s buzz angrily around the sink."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await makeplural(await rndmonnam(null)) : S("flies"));
      { $g = 2; continue $L; };
    case 8:
      await pline(S("Static electricity surrounds the sink."));
      { $g = 2; continue $L; };
    case 9:
      await You_hear(S("loud noises coming from the drain."));
      { $g = 2; continue $L; };
    case 10:
      await pline_The(S("%s flow seems fixed."), hliquid(S("water")));
      { $g = 2; continue $L; };
    case 11:
      await pline_The(S("%s flow seems %ser now."), hliquid(S("water")), obj.spe < 0 ? S("weak") : S("strong"));
      { $g = 2; continue $L; };
    case 12:
      await pline_The(S("%s flow seems %ser now."), hliquid(S("water")), obj.spe < 0 ? S("less") : S("great"));
      { $g = 2; continue $L; };
    case 13:
      await pline_The(S("%s flow %s the drain."), hliquid(S("water")), obj.spe < 0 ? S("misses") : S("hits"));
      { $g = 2; continue $L; };
    case 14:
      await pline_The(S("water's force seems %ser now."), obj.spe < 0 ? S("small") : S("great"));
      { $g = 2; continue $L; };
    case 15:
      ideed = FALSE;
      for (otmp = G.level.objects[G.u.ux][G.u.uy]; otmp; otmp = otmp2) {
        otmp2 = otmp.v.v_nexthere;
        if (otmp !== G.uball && otmp !== G.uchain && !obj_resists(otmp, 1, 99)) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("Suddenly, %s %s from the sink!"), await doname(otmp), otense(otmp, S("vanish")));
            ideed = TRUE;
          }
          await delobj(otmp);
        }
      }
      { $g = 2; continue $L; };
    case 16:
      await pline(S("Several flies buzz around the sink."));
      { $g = 2; continue $L; };
    case 17:
      nosink = await teleport_sink();
      await pline_The(S("sink %svanishes."), nosink ? S("") : S("momentarily "));
      ideed = FALSE;
      { $g = 2; continue $L; };
    case 18:
      await polymorph_sink();
      nosink = TRUE;
      ideed = ($at2(G.level.locations, G.u.ux, G.u.uy).typ !== ROOM ? 1 : 0) << 24 >> 24;
      { $g = 2; continue $L; };
    case 19:
      ideed = FALSE;
      { $g = 2; continue $L; };
    case 2:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !ideed) {
        ideed = TRUE;
        switch (obj.otyp) {
        case 150:
          await pline_The(S("faucets flash brightly for a moment."));
          break;
        case 156:
          await pline_The(S("sink looks as good as new."));
          break;
        case 175:
          await You(S("don't see anything happen to the sink."));
          break;
        case 169:
          await You_see(S("the ring slide right down the drain!"));
          break;
        case 176:
          await You_see(S("some %s in the sink."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("oxygen molecules") : S("air"));
          break;
        case 158:
          await pline_The(S("sink seems to blend into the floor for a moment."));
          break;
        case 166:
          await pline_The(S("hot %s faucet flashes brightly for a moment."), hliquid(S("water")));
          break;
        case 167:
          await pline_The(S("cold %s faucet flashes brightly for a moment."), hliquid(S("water")));
          break;
        case 177:
          await pline_The(S("sink looks nothing like a fountain."));
          break;
        case 155:
          await pline_The(S("sink glows %s for a moment."), hcolor(obj.spe < 0 ? G.c_color_names.c_black : G.c_color_names.c_silver));
          break;
        case 164:
          await pline_The(S("sink glows %s for a moment."), hcolor(G.c_color_names.c_white));
          break;
        case 172:
          await pline_The(S("sink looks like it is being beamed aboard somewhere."));
          break;
        case 174:
          await pline_The(S("sink momentarily looks like a regularly erupting geyser."));
          break;
        default:
          break;
        }
      }
      if (ideed) {
        await trycall(obj);
      } else if (!nosink) {
        await You_hear(S("the ring bouncing down the drainpipe."));
      }
      if (!rn2(20) && !nosink) {
        await pline_The(S("sink backs up, leaving %s."), await doname(obj));
        obj.in_use = (FALSE) & 1;
        await dropx(obj);
      } else if (!rn2(5)) {
        await freeinv(obj);
        obj.in_use = (FALSE) & 1;
        obj.ox = G.u.ux;
        obj.oy = G.u.uy;
        await add_to_buried(obj);
      } else {
        await useup(obj);
      }
    }
    break;
  }
}

export async function canletgo(obj: struct_obj | null, word: Ptr | null): Promise<number> {
  if (obj.owornmask & (W_ARMOR | W_ACCESSORY)) {
    if (word.a[word.o]) {
      await Norep(S("You cannot %s %s you are wearing."), word, G.c_common_strings.c_something);
    }
    return FALSE;
  }
  if (obj.otyp === LOADSTONE && obj.cursed | 0) {
    if (word.a[word.o]) {
      if (!strcmp(word, S("throw")) && obj.quan > 1) {
        obj.corpsenm = 1;
      }
      await pline(S("For some reason, you cannot %s%s the stone%s!"), word, obj.corpsenm ? S(" any of") : S(""), obj.quan === 1 ? S("") : S("s"));
    }
    obj.corpsenm = 0;
    set_bknown(obj, 1);
    return FALSE;
  }
  if (obj.otyp === LEASH && obj.corpsenm !== 0) {
    if (word.a[word.o]) {
      await pline_The(S("leash is tied around your %s."), body_part(HAND));
    }
    return FALSE;
  }
  if (obj.owornmask & W_SADDLE) {
    if (word.a[word.o]) {
      await You(S("cannot %s %s you are sitting on."), word, G.c_common_strings.c_something);
    }
    return FALSE;
  }
  return TRUE;
}

async function drop(obj: struct_obj | null): Promise<number> {
  if (!obj) {
    return 0;
  }
  if (!await canletgo(obj, S("drop"))) {
    return 0;
  }
  if (obj === G.uwep) {
    if (welded(G.uwep)) {
      await weldmsg(obj);
      return 0;
    }
    await setuwep(null);
  }
  if (obj === G.uquiver) {
    await setuqwep(null);
  }
  if (obj === G.uswapwep) {
    await setuswapwep(null);
  }
  if (G.u.uswallow) {
    if (G.flags.verbose) {
      let onam_p = null;
      let monbuf = new Int8Array(256);
      strcpy(P(monbuf), s_suffix(await mon_nam(G.u.ustuck)));
      onam_p = is_unpaid(obj) ? await yobjnam(obj, null) : await doname(obj);
      await You(S("drop %s into %s %s."), onam_p, P(monbuf), mbodypart(G.u.ustuck, STOMACH));
    }
  } else {
    if ((obj.oclass === RING_CLASS || obj.otyp === MEAT_RING) && $at2(G.level.locations, G.u.ux, G.u.uy).typ === SINK) {
      await dosinkring(obj);
      return 1;
    }
    if (!can_reach_floor(TRUE)) {
      let levhack = finesse_ahriman(obj);
      if (levhack) {
        G.u.uprops[LEVITATION].extrinsic = W_ART;
      }
      if (G.flags.verbose) {
        await You(S("drop %s."), await doname(obj));
      }
      if (obj.oclass === COIN_CLASS) {
        G.context.botl = 1;
      }
      await freeinv(obj);
      await hitfloor(obj, TRUE);
      if (levhack) {
        await float_down(I_SPECIAL | TIMEOUT, W_ARTI | W_ART);
      }
      return 1;
    }
    if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) && G.flags.verbose) {
      await You(S("drop %s."), await doname(obj));
    }
  }
  await dropx(obj);
  return 1;
}

export async function dropx(obj: struct_obj | null): Promise<void> {
  if (obj.oclass === COIN_CLASS) {
    G.context.botl = 1;
  }
  await freeinv(obj);
  if (!G.u.uswallow) {
    if (await ship_object(obj, G.u.ux, G.u.uy, FALSE)) {
      return;
    }
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) {
      await doaltarobj(obj);
    }
  }
  await dropy(obj);
}

export async function dropy(obj: struct_obj | null): Promise<void> {
  await dropz(obj, FALSE);
}

export async function dropz(obj: struct_obj | null, with_impact: number): Promise<void> {
  if (obj === G.uwep) {
    await setuwep(null);
  }
  if (obj === G.uquiver) {
    await setuqwep(null);
  }
  if (obj === G.uswapwep) {
    await setuswapwep(null);
  }
  if (!G.u.uswallow && await flooreffects(obj, G.u.ux, G.u.uy, S("drop"))) {
    return;
  }
  if (G.u.uswallow) {
    let could_petrify = FALSE;
    let could_poly = FALSE;
    let could_slime = FALSE;
    let could_grow = FALSE;
    let could_heal = FALSE;
    if (obj !== G.uball) {
      if (obj.otyp === CORPSE) {
        could_petrify = ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9) ? 1 : 0) << 24 >> 24;
        could_poly = ((obj.otyp === 240 || obj.otyp === 241 || obj.otyp === 271) && pm_to_cham(obj.corpsenm) !== -1 ? 1 : 0) << 24 >> 24;
        could_slime = (obj.corpsenm === PM_GREEN_SLIME ? 1 : 0) << 24 >> 24;
        could_grow = (obj.corpsenm === PM_WRAITH ? 1 : 0) << 24 >> 24;
        could_heal = (obj.corpsenm === PM_NURSE ? 1 : 0) << 24 >> 24;
      }
      if (is_unpaid(obj)) {
        await stolen_value(obj, G.u.ux, G.u.uy, TRUE, FALSE);
      }
      await mpickobj(G.u.ustuck, obj);
      if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
        if (could_poly || could_slime) {
          await newcham(G.u.ustuck, could_poly ? null : $sat(G.mons, PM_GREEN_SLIME), FALSE, could_slime);
          await delobj(obj);
        } else if (could_petrify) {
          await minstapetrify(G.u.ustuck, TRUE);
          if (!G.u.uswallow) {
            await delobj(obj);
          }
        } else if (could_grow) {
          await grow_up(G.u.ustuck, null);
          await delobj(obj);
        } else if (could_heal) {
          G.u.ustuck.mhp = G.u.ustuck.mhpmax;
          await delobj(obj);
        }
      }
    }
  } else {
    await place_object(obj, G.u.ux, G.u.uy);
    if (with_impact) {
      await container_impact_dmg(obj, G.u.ux, G.u.uy);
    }
    if (obj === G.uball) {
      await drop_ball(G.u.ux, G.u.uy);
    } else if (G.level.flags.has_shop) {
      await sellobj(obj, G.u.ux, G.u.uy);
    }
    await stackobj(obj);
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
      await map_object(obj, 0);
    }
    await newsym(G.u.ux, G.u.uy);
  }
}

export async function obj_no_longer_held(obj: struct_obj | null): Promise<void> {
  if (!obj) {
    return;
  } else if (!!obj.cobj) {
    let contents = null;
    for (contents = obj.cobj; contents; contents = contents.nobj) {
      await obj_no_longer_held(contents);
    }
  }
  switch (obj.otyp) {
  case 26:
    if (!obj.oerodeproof || !rn2(10)) {
      if (!G.context.mon_moving && !G.program_state.gameover) {
        await costly_alteration(obj, COST_DEGRD);
      }
      obj.otyp = WORM_TOOTH;
      obj.oerodeproof = 0;
    }
    break;
  }
}

export async function doddrop(): Promise<number> {
  let result = 0;
  if (!G.invent) {
    await You(S("have nothing to drop."));
    return 0;
  }
  add_valid_menu_class(0);
  if ($rd(P(G.u.ushops))) {
    sellobj_state(SELL_DELIBERATE);
  }
  if (G.flags.menu_style !== MENU_TRADITIONAL || (result = await ggetobj(S("drop"), drop, 0, FALSE, null)) < -1) {
    result = await menu_drop(result);
  }
  if ($rd(P(G.u.ushops))) {
    sellobj_state(SELL_NORMAL);
  }
  if (result) {
    reset_occupations();
  }
  return result;
}

async function menu_drop(retry: number): Promise<number> {
  let $g = 0;
  let n = 0;
  let i = 0;
  let n_dropped = 0;
  let cnt = 0;
  let otmp = null;
  let otmp2 = null;
  let pick_list = [null];
  let all_categories = 0;
  let drop_everything = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      n_dropped = 0;
      all_categories = TRUE;
      drop_everything = FALSE;
      if (retry) {
        all_categories = (retry === -2 ? 1 : 0) << 24 >> 24;
      } else if (G.flags.menu_style === MENU_FULL) {
        all_categories = FALSE;
        n = await query_category(S("Drop what type of items?"), G.invent, UNPAID_TYPES | ALL_TYPES | CHOOSE_ALL | BUC_BLESSED | BUC_CURSED | BUC_UNCURSED | BUC_UNKNOWN, P(pick_list, 0), PICK_ANY);
        if (!n) {
          { $g = 1; continue $L; }
        }
        for (i = 0; i < n; ++i) {
          if ($sadd(pick_list[0], i).item.a_int === ALL_TYPES_SELECTED) {
            all_categories = TRUE;
          } else if ($sadd(pick_list[0], i).item.a_int === 65) {
            drop_everything = TRUE;
          } else {
            add_valid_menu_class($sadd(pick_list[0], i).item.a_int);
          }
        }
        free(pick_list[0]);
      } else if (G.flags.menu_style === MENU_COMBINATION) {
        const ggoresults = new Uint32Array(1);
        ggoresults[0] = 0;
        all_categories = FALSE;
        i = await ggetobj(S("drop"), drop, 0, TRUE, P(ggoresults, 0));
        if (i === -2) {
          all_categories = TRUE;
        }
        if ((ggoresults[0] & ALL_FINISHED) >>> 0) {
          n_dropped = i;
          { $g = 1; continue $L; }
        }
      }
      if (drop_everything) {
        bypass_objlist(G.invent, FALSE);
        while (!!(otmp = nxt_unbypassed_obj(G.invent))) {
          n_dropped += await drop(otmp);
        }
        bypass_objlist(G.invent, FALSE);
      } else {
        n = await query_objlist(S("What would you like to drop?"), P(G, "invent"), USE_INVLET | INVORDER_SORT, P(pick_list, 0), PICK_ANY, all_categories ? allow_all : allow_category);
        if (n > 0) {
          bypass_objlist(G.invent, TRUE);
          for (i = 0; i < n; ++i) {
            otmp = $sadd(pick_list[0], i).item.a_obj;
            for (otmp2 = G.invent; otmp2; otmp2 = otmp2.nobj) {
              if (otmp2 === otmp) {
                break;
              }
            }
            if (!otmp2 || !otmp2.bypass) {
              continue;
            }
            cnt = $sadd(pick_list[0], i).count;
            if (cnt < otmp.quan) {
              if (welded(otmp)) {
                ;
              } else if (otmp.otyp === LOADSTONE && otmp.cursed | 0) {
                otmp.corpsenm = cnt | 0;
              } else {
                otmp = await splitobj(otmp, cnt);
              }
            }
            n_dropped += await drop(otmp);
          }
          bypass_objlist(G.invent, FALSE);
          free(pick_list[0]);
        }
      }
    case 1: // drop_done
      return n_dropped;
    }
    break;
  }
}

export async function dodown(): Promise<number> {
  let trap = null;
  let stairs_down = (G.u.ux === G.dnstair.sx && G.u.uy === G.dnstair.sy || G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy && !G.sstairs.up ? 1 : 0) << 24 >> 24;
  let ladder_down = (G.u.ux === G.dnladder.sx && G.u.uy === G.dnladder.sy ? 1 : 0) << 24 >> 24;
  if (await u_rooted()) {
    return 1;
  }
  if (await stucksteed(TRUE)) {
    return 0;
  }
  if (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) {
    if (G.u.uprops[LEVITATION].intrinsic & I_SPECIAL || G.u.uprops[LEVITATION].extrinsic & W_ARTI) {
      if (G.u.uprops[LEVITATION].extrinsic & W_ARTI) {
        let obj = null;
        for (obj = G.invent; obj; obj = obj.nobj) {
          if (obj.oartifact && artifact_has_invprop(obj, LEVITATION)) {
            if (obj.age < G.monstermoves) {
              obj.age = G.monstermoves;
            }
            obj.age += rnz(100);
          }
        }
      }
      if (await float_down(I_SPECIAL | TIMEOUT, W_ARTI)) {
        return 1;
      } else if (!G.u.uprops[LEVITATION].intrinsic && !G.u.uprops[LEVITATION].extrinsic) {
        await Your(S("latent levitation ceases."));
        return 1;
      }
    }
    if (G.u.uprops[LEVITATION].blocked) {
      ;
    } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      if (stairs_down) {
        stairs_down = (($at2(G.level.locations, G.u.ux, G.u.uy).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, G.u.ux, G.u.uy).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? $at2(G.level.locations, G.u.ux, G.u.uy).glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_dnstair ? 1 : 0) << 24 >> 24;
      } else if (ladder_down) {
        ladder_down = (($at2(G.level.locations, G.u.ux, G.u.uy).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, G.u.ux, G.u.uy).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? $at2(G.level.locations, G.u.ux, G.u.uy).glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_dnladder ? 1 : 0) << 24 >> 24;
      }
    }
    if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
      await You(S("are floating in the %s."), surface(G.u.ux, G.u.uy));
    } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
      await You(S("are floating in %s."), is_pool(G.u.ux, G.u.uy) ? S("the water") : S("a bubble of air"));
    } else {
      await floating_above(stairs_down ? S("stairs") : ladder_down ? S("ladder") : surface(G.u.ux, G.u.uy));
    }
    return 0;
  }
  if (G.u.umonnum !== G.u.umonster && (($sat(G.mons, G.u.umonnum).mflags1 & 256) >>> 0 !== 0 && (($sat(G.mons, G.u.umonnum).mflags1 & 16) >>> 0 !== 0 && $sat(G.mons, G.u.umonnum).mlet !== S_MIMIC || ($sat(G.mons, G.u.umonnum).mflags1 & 1) >>> 0 !== 0)) && G.u.uundetected | 0) {
    G.u.uundetected = 0;
    if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await You(S("fly out of hiding."));
    } else {
      await You(S("drop to the %s."), surface(G.u.ux, G.u.uy));
      if (is_pool_or_lava(G.u.ux, G.u.uy)) {
        await pooleffects(FALSE);
      } else {
        await pickup(1);
        if (!!(trap = t_at(G.u.ux, G.u.uy))) {
          await dotrap(trap, TOOKPLUNGE);
        }
      }
    }
    return 1;
  }
  if (!stairs_down && !ladder_down) {
    trap = t_at(G.u.ux, G.u.uy);
    if (trap && (uteetering_at_seen_pit(trap) || uescaped_shaft(trap))) {
      await dotrap(trap, TOOKPLUNGE);
      return 1;
    } else if (!trap || !((trap.ttyp | 0) === HOLE || (trap.ttyp | 0) === TRAPDOOR) || !Can_fall_thru(G.u.uz) || !trap.tseen) {
      if (G.flags.autodig && !G.context.nopick && G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_PICK_AXE)) {
        return await use_pick_axe2(G.uwep);
      } else {
        await You_cant(S("go down here."));
        return 0;
      }
    }
  }
  if (G.u.ustuck) {
    await You(S("are %s, and cannot go down."), !G.u.uswallow ? S("being held") : (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("swallowed") : S("engulfed"));
    return 1;
  }
  if (on_level(G.dungeon_topology.d_valley_level, G.u.uz) && !G.u.uevent.gehennom_entered) {
    await You(S("are standing at the gate to Gehennom."));
    await pline(S("Unspeakable cruelty and harm lurk down there."));
    if (await yn_function(S("Are you sure you want to enter?"), P(G.ynchars), 110) !== 121) {
      return 0;
    } else {
      await pline(S("So be it."));
    }
    G.u.uevent.gehennom_entered = 1;
  }
  if (!await next_to_u()) {
    await You(S("are held back by your pet!"));
    return 0;
  }
  if (trap) {
    let down_or_thru = (trap.ttyp | 0) === HOLE ? S("down") : S("through");
    let actn = (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? S("fly") : locomotion(G.youmonst.data, S("jump"));
    if (G.youmonst.data.msize >= MZ_HUGE) {
      let qbuf = new Int8Array(128);
      await You(S("don't fit %s easily."), down_or_thru);
      sprintf(P(qbuf), S("Try to squeeze %s?"), down_or_thru);
      if (await yn_function(P(qbuf), P(G.ynchars), 110) === 121) {
        if (!rn2(3)) {
          actn = S("manage to squeeze");
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(4) + 1) / 2 | 0 : rnd(4), S("contusion from a small passage"), KILLED_BY);
        } else {
          await You(S("were unable to fit %s."), down_or_thru);
          return 0;
        }
      } else {
        return 0;
      }
    }
    await You(S("%s %s the %s."), actn, down_or_thru, (trap.ttyp | 0) === HOLE ? S("hole") : S("trap door"));
  }
  if (trap && ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level))) {
    await goto_hell(FALSE, TRUE);
  } else {
    at_ladder = ($at2(G.level.locations, G.u.ux, G.u.uy).typ === LADDER ? 1 : 0) << 24 >> 24;
    await next_level(!trap ? 1 : 0);
    at_ladder = FALSE;
  }
  return 1;
}

export async function doup(): Promise<number> {
  if (await u_rooted()) {
    return 1;
  }
  if (G.u.utrap && G.u.utraptype === TT_PIT) {
    await climb_pit();
    return 1;
  }
  if ((G.u.ux !== G.upstair.sx || G.u.uy !== G.upstair.sy) && (!G.upladder.sx || G.u.ux !== G.upladder.sx || G.u.uy !== G.upladder.sy) && (!G.sstairs.sx || G.u.ux !== G.sstairs.sx || G.u.uy !== G.sstairs.sy || !G.sstairs.up)) {
    await You_cant(S("go up here."));
    return 0;
  }
  if (await stucksteed(TRUE)) {
    return 0;
  }
  if (G.u.ustuck) {
    await You(S("are %s, and cannot go up."), !G.u.uswallow ? S("being held") : (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("swallowed") : S("engulfed"));
    return 1;
  }
  if (near_capacity() > SLT_ENCUMBER) {
    await Your(S("load is too heavy to climb the %s."), $at2(G.level.locations, G.u.ux, G.u.uy).typ === STAIRS ? S("stairs") : S("ladder"));
    return 1;
  }
  if (ledger_no(G.u.uz) === 1) {
    if (G.iflags.debug_fuzzer) {
      return 0;
    }
    if (await yn_function(S("Beware, there will be no return!  Still climb?"), P(G.ynchars), 110) !== 121) {
      return 0;
    }
  }
  if (!await next_to_u()) {
    await You(S("are held back by your pet!"));
    return 0;
  }
  at_ladder = ($at2(G.level.locations, G.u.ux, G.u.uy).typ === LADDER ? 1 : 0) << 24 >> 24;
  await prev_level(TRUE);
  at_ladder = FALSE;
  return 1;
}

async function currentlevel_rewrite(): Promise<number> {
  let fd = 0;
  let whynot = new Int8Array(256);
  G.windowprocs.win_mark_synch();
  fd = create_levelfile(ledger_no(G.u.uz), P(whynot));
  if (fd < 0) {
    await pline(S("%s"), P(whynot));
    return -1;
  }
  return fd;
}

export async function save_currentstate(): Promise<void> {
  let fd = 0;
  if (G.flags.ins_chkpt) {
    fd = await currentlevel_rewrite();
    if (fd < 0) {
      return;
    }
    await bufon(fd);
    await savelev(fd, ledger_no(G.u.uz), WRITE_SAVE);
    await bclose(fd);
  }
  await savestateinlock();
}

export async function u_collide_m(mtmp: struct_monst | null): Promise<void> {
  let cc = new struct_nhcoord();
  if (!mtmp || mtmp === G.u.usteed || mtmp !== (!!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null)) {
    await impossible(S("level arrival collision: %s?"), !mtmp ? S("no monster") : mtmp === G.u.usteed ? S("steed is on map") : S("monster not co-located"));
    return;
  }
  if (!rn2(2) && await enexto(cc, G.u.ux, G.u.uy, G.youmonst.data) && dist2(cc.x, cc.y, G.u.ux, G.u.uy) <= 2) {
    await u_on_newpos(cc.x, cc.y);
  } else {
    await mnexto(mtmp);
  }
  if (!!(mtmp = !!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null)) {
    if (G.flags.debug) {
      await pline(S("(monster in hero's way)"));
    }
    if (!await rloc(mtmp, TRUE) || !!(mtmp = !!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null)) {
      await m_into_limbo(mtmp);
    }
  }
}

export async function goto_level(newlevel: struct_d_level | null, at_stairs: number, falling: number, portal: number): Promise<void> {
  let $t1: any, $t2: any;
  let fd = 0;
  let l_idx = 0;
  let new_ledger = 0;
  let cant_go_back = 0;
  let great_effort = 0;
  let up = (depth(newlevel) < depth(G.u.uz) ? 1 : 0) << 24 >> 24;
  let newdungeon = (G.u.uz.dnum !== newlevel.dnum ? 1 : 0) << 24 >> 24;
  let was_in_W_tower = await In_W_tower(G.u.ux, G.u.uy, G.u.uz);
  let familiar = FALSE;
  let new_ = FALSE;
  let mtmp = null;
  let whynot = new Int8Array(256);
  let annotation = null;
  if (dunlev(newlevel) > dunlevs_in_dungeon(newlevel)) {
    newlevel.dlevel = dunlevs_in_dungeon(newlevel);
  }
  if (newdungeon && newlevel.dnum === G.dungeon_topology.d_astral_level.dnum) {
    if (!G.u.uhave.amulet) {
      return;
    }
    if (!G.flags.debug) {
      assign_level(newlevel, G.dungeon_topology.d_earth_level);
    }
  }
  new_ledger = ledger_no(newlevel);
  if (new_ledger <= 0) {
    await done(ESCAPED);
  }
  if (In_hell(G.u.uz) && up && G.u.uhave.amulet | 0 && !newdungeon && !portal && dunlev(G.u.uz) < dunlevs_in_dungeon(G.u.uz) - 3) {
    if (!rn2(4)) {
      let odds = 3 + G.u.ualign.type;
      let diff = odds <= 1 ? 0 : rn2(odds);
      if (diff !== 0) {
        assign_rnd_level(newlevel, G.u.uz, diff);
        if (was_in_W_tower && !On_W_tower_level(newlevel)) {
          diff = 0;
        }
      }
      if (diff === 0) {
        assign_level(newlevel, G.u.uz);
      }
      new_ledger = ledger_no(newlevel);
      await pline(S("A mysterious force momentarily surrounds you..."));
      if (on_level(newlevel, G.u.uz)) {
        await safe_teleds(FALSE);
        await next_to_u();
        return;
      } else {
        at_stairs = at_ladder = FALSE;
      }
    }
  }
  if (on_level(G.u.uz, G.dungeon_topology.d_qstart_level) && !newdungeon && !await ok_to_quest()) {
    await pline(S("A mysterious force prevents you from descending."));
    return;
  }
  if (on_level(newlevel, G.u.uz)) {
    return;
  }
  if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
    await buried_ball_to_punishment();
  }
  fd = await currentlevel_rewrite();
  if (fd < 0) {
    return;
  }
  maybe_reset_pick(null);
  reset_trapset();
  G.iflags.travelcc.x = G.iflags.travelcc.y = 0;
  G.context.polearm.hitmon = null;
  if (falling) {
    await impact_drop(null, G.u.ux, G.u.uy, newlevel.dlevel);
  }
  await check_special_room(TRUE);
  if (!!G.uball) {
    await unplacebc();
  }
  await reset_utrap(FALSE);
  await fill_pit(G.u.ux, G.u.uy);
  G.u.ustuck = null;
  G.u.uinwater = 0;
  G.u.uundetected = 0;
  await keepdogs(FALSE);
  if (G.u.uswallow) {
    G.u.uswldtim = G.u.uswallow = 0;
  }
  await recalc_mapseen();
  await vision_recalc(2);
  cant_go_back = (newdungeon && newlevel.dnum === G.dungeon_topology.d_astral_level.dnum ? 1 : 0) << 24 >> 24;
  if (!cant_go_back) {
    update_mlstmv();
    await bufon(fd);
  }
  await savelev(fd, ledger_no(G.u.uz), cant_go_back ? FREE_SAVE : WRITE_SAVE | FREE_SAVE);
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
    await save_waterlevel(-1, FREE_SAVE);
  }
  await bclose(fd);
  if (cant_go_back) {
    for (l_idx = maxledgerno(); l_idx > 0; --l_idx) {
      delete_levelfile(l_idx);
    }
    for (l_idx = 0; l_idx < G.n_dgns; ++l_idx) {
      remdun_mapseen(l_idx);
    }
  }
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(newlevel, G.dungeon_topology.d_rogue_level) || (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    assign_graphics((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(newlevel, G.dungeon_topology.d_rogue_level) ? ROGUESET : PRIMARY);
  }
  check_gold_symbol();
  if ((at_stairs || falling || portal) && G.u.uz.dnum !== newlevel.dnum) {
    await recbranch_mapseen(G.u.uz, newlevel);
  }
  assign_level(G.u.uz0, G.u.uz);
  assign_level(G.u.uz, newlevel);
  assign_level(G.u.utolev, newlevel);
  G.u.utotype = 0;
  if (!builds_up(G.u.uz)) {
    if (dunlev(G.u.uz) > G.dungeons[G.u.uz.dnum].dunlev_ureached) {
      G.dungeons[G.u.uz.dnum].dunlev_ureached = dunlev(G.u.uz);
    }
  } else {
    if (G.dungeons[G.u.uz.dnum].dunlev_ureached === 0 || dunlev(G.u.uz) < G.dungeons[G.u.uz.dnum].dunlev_ureached) {
      G.dungeons[G.u.uz.dnum].dunlev_ureached = dunlev(G.u.uz);
    }
  }
  reset_rndmonst(NON_PM);
  memset(G.updest, 0, 8);
  memset(G.dndest, 0, 8);
  if (!(G.level_info[new_ledger].flags & LFILE_EXISTS)) {
    if (G.level_info[new_ledger].flags & (FORGOTTEN | VISITED)) {
      await impossible(S("goto_level: returning to discarded level?"));
      ($t1 = G.level_info[new_ledger], $t1.flags = ($t1.flags & ~(FORGOTTEN | VISITED)) & 0xff);
    }
    await mklev();
    new_ = TRUE;
  } else {
    fd = open_levelfile(new_ledger, P(whynot));
    if (await tricked_fileremoved(fd, P(whynot))) {
      await error(S("Cannot continue this game."));
    }
    reseed_random(rn2);
    reseed_random(rn2_on_display_rng);
    minit();
    await getlev(fd, G.hackpid, new_ledger, FALSE);
    if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
      await restore_waterlevel(-1);
    }
    nhclose(fd);
    await oinit();
  }
  reglyph_darkroom();
  G.u.uinwater = 0;
  vision_reset();
  G.vision_full_recalc = 0;
  await flush_screen(-1);
  if (portal && !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum)) {
    let ttrap = null;
    for (ttrap = G.ftrap; ttrap; ttrap = ttrap.ntrap) {
      if ((ttrap.ttyp | 0) === MAGIC_PORTAL) {
        break;
      }
    }
    if (!ttrap) {
      await panic(S("goto_level: no corresponding portal!"));
    }
    await seetrap(ttrap);
    await u_on_newpos(ttrap.tx, ttrap.ty);
  } else if (at_stairs && !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum)) {
    if (up) {
      if (at_ladder) {
        await u_on_newpos(G.dnladder.sx, G.dnladder.sy);
      } else if (newdungeon) {
        await u_on_sstairs(1);
      } else {
        await u_on_dnstairs();
      }
      great_effort = (!!G.uball && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) ? 1 : 0) << 24 >> 24;
      if (G.flags.verbose || great_effort) {
        await pline(S("%s %s up%s the %s."), great_effort ? S("With great effort, you") : S("You"), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("float") : (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? S("fly") : S("climb"), (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked && at_ladder ? S(" along") : S(""), at_ladder ? S("ladder") : S("stairs"));
      }
    } else {
      if (at_ladder) {
        await u_on_newpos(G.upladder.sx, G.upladder.sy);
      } else if (newdungeon) {
        await u_on_sstairs(0);
      } else {
        await u_on_upstairs();
      }
      if (!G.u.dz) {
        ;
      } else if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
        if (G.flags.verbose) {
          await You(S("fly down %s."), at_ladder ? S("along the ladder") : S("the stairs"));
        }
      } else if (near_capacity() > UNENCUMBERED || !!G.uball || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic)) {
        await You(S("fall down the %s."), at_ladder ? S("ladder") : S("stairs"));
        if (!!G.uball) {
          await drag_down();
          await ballrelease(FALSE);
        }
        if (G.u.usteed) {
          await dismount_steed(DISMOUNT_FELL);
        } else {
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(3) + 1) / 2 | 0 : rnd(3), at_ladder ? S("falling off a ladder") : S("tumbling down a flight of stairs"), KILLED_BY);
        }
        await selftouch(S("Falling, you"));
      } else {
        if (G.flags.verbose) {
          await You(S("%s."), at_ladder ? S("climb down the ladder") : S("descend the stairs"));
        }
      }
    }
  } else {
    await u_on_rndspot((up ? 1 : 0) | (was_in_W_tower ? 2 : 0));
    if (falling) {
      if (!!G.uball) {
        await ballfall();
      }
      await selftouch(S("Falling, you"));
    }
  }
  if (!!G.uball) {
    await placebc();
  }
  await obj_delivery(FALSE);
  await losedogs();
  await kill_genocided_monsters();
  await run_timers();
  if (!!(mtmp = !!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null)) {
    await u_collide_m(mtmp);
  }
  initrack();
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
    await movebubbles();
  } else if ((G.dungeon_topology.d_fire_level.dlevel || G.dungeon_topology.d_fire_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_fire_level)) {
    await fumaroles();
  }
  if (G.level_info[new_ledger].flags & FORGOTTEN) {
    forget_map(ALL_MAP);
    forget_traps();
    familiar = TRUE;
    ($t2 = G.level_info[new_ledger], $t2.flags = ($t2.flags & ~FORGOTTEN) & 0xff);
  }
  vision_reset();
  await docrt();
  await flush_screen(-1);
  await deliver_splev_message();
  await check_special_room(FALSE);
  await obj_delivery(TRUE);
  if (!In_hell(G.u.uz0) && In_hell(G.u.uz)) {
    if ((G.dungeon_topology.d_valley_level.dlevel || G.dungeon_topology.d_valley_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_valley_level)) {
      await You(S("arrive at the Valley of the Dead..."));
      await pline_The(S("odor of burnt flesh and decay pervades the air."));
      await You_hear(S("groans and moans everywhere."));
    } else {
      await pline(S("It is hot here.  You smell smoke..."));
    }
    G.u.uachieve.enter_gehennom = 1;
  }
  if (In_hell(G.u.uz) && !((G.dungeon_topology.d_valley_level.dlevel || G.dungeon_topology.d_valley_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_valley_level))) {
    G.u.uevent.gehennom_entered = 1;
  }
  if (familiar) {
    let mesg = null;
    let buf = new Int8Array(256);
    let which = rn2(4);
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      mesg = goto_level$halu_fam_msgs[which];
    } else {
      mesg = goto_level$fam_msgs[which];
    }
    if (mesg && strchr(mesg, 37)) {
      sprintf(P(buf), mesg, !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("looks") : S("seems"));
      mesg = P(buf);
    }
    if (mesg) {
      await pline(S("%s"), mesg);
    }
  }
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    if (new_ && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) {
      await final_level();
    } else if (newdungeon && G.u.uhave.amulet | 0) {
      await resurrect();
    }
  } else if (In_quest(G.u.uz)) {
    await onquest();
  } else if (In_V_tower(G.u.uz)) {
    if (newdungeon && In_hell(G.u.uz0)) {
      await pline_The(S("heat and smoke are gone."));
    }
  } else if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
    if (new_ || !G.mvitals[PM_CROESUS].died) {
      await You(S("have penetrated a high security area!"));
      await pline(S("An alarm sounds!"));
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        mtmp.msleeping = 0;
      }
    }
  } else {
    if (new_ && ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
      await You(S("enter what seems to be an older, more primitive world."));
    }
    if (!In_quest(G.u.uz0) && await at_dgn_entrance(S("The Quest")) && !(G.u.uevent.qcompleted | 0 || G.u.uevent.qexpelled | 0 || G.quest_status.leader_is_dead | 0)) {
      if (!G.u.uevent.qcalled) {
        G.u.uevent.qcalled = 1;
        await com_pager(2);
      } else {
        await com_pager(G.urole.malenum === 338 ? 4 : 3);
      }
    }
  }
  assign_level(G.u.uz0, G.u.uz);
  await save_currentstate();
  if (!!(annotation = get_annotation(G.u.uz))) {
    await You(S("remember this level as %s."), annotation);
  }
  await in_out_region(G.u.ux, G.u.uy);
  await pickup(1);
}

async function final_level(): Promise<void> {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    await reset_hostility(mtmp);
  }
  await create_mplayers(rn2(4) + 3, TRUE);
  await gain_guardian_angel();
}

export async function schedule_goto(tolev: struct_d_level | null, at_stairs: number, falling: number, portal_flag: number, pre_msg: Ptr | null, post_msg: Ptr | null): Promise<void> {
  let typmask = 64;
  if (at_stairs) {
    typmask |= 1;
  }
  if (falling) {
    typmask |= 2;
  }
  if (portal_flag) {
    typmask |= 4;
  }
  if (portal_flag < 0) {
    typmask |= 128;
  }
  G.u.utotype = typmask & 0xff;
  assign_level(G.u.utolev, tolev);
  if (pre_msg) {
    dfr_pre_msg = await dupstr(pre_msg);
  }
  if (post_msg) {
    dfr_post_msg = await dupstr(post_msg);
  }
}

export async function deferred_goto(): Promise<void> {
  if (!on_level(G.u.uz, G.u.utolev)) {
    let dest = new struct_d_level();
    let typmask = G.u.utotype;
    assign_level(dest, G.u.utolev);
    if (dfr_pre_msg) {
      await pline(S("%s"), dfr_pre_msg);
    }
    await goto_level(dest, !!(typmask & 1) ? 1 : 0, !!(typmask & 2) ? 1 : 0, !!(typmask & 4) ? 1 : 0);
    if (typmask & 128) {
      let t = t_at(G.u.ux, G.u.uy);
      if (t) {
        await deltrap(t);
        await newsym(G.u.ux, G.u.uy);
      }
    }
    if (dfr_post_msg) {
      await pline(S("%s"), dfr_post_msg);
    }
  }
  G.u.utotype = 0;
  if (dfr_pre_msg) {
    free(dfr_pre_msg), dfr_pre_msg = null;
  }
  if (dfr_post_msg) {
    free(dfr_post_msg), dfr_post_msg = null;
  }
}

export async function revive_corpse(corpse: struct_obj | null): Promise<number> {
  let mtmp = null;
  let mcarry = null;
  let is_uwep = 0;
  let chewed = 0;
  let where = 0;
  let cname = new Int8Array(256);
  let container = null;
  const container_where = new Int32Array(1);
  container_where[0] = 0;
  where = corpse.where;
  is_uwep = (corpse === G.uwep ? 1 : 0) << 24 >> 24;
  chewed = (corpse.oeaten !== 0 ? 1 : 0) << 24 >> 24;
  strcpy(P(cname), await corpse_xname(corpse, chewed ? S("bite-covered") : null, CXN_SINGULAR));
  mcarry = where === OBJ_MINVENT ? corpse.v.v_ocarry : null;
  if (where === OBJ_CONTAINED) {
    let mtmp2 = null;
    container = corpse.v.v_ocontainer;
    mtmp2 = get_container_location(container, P(container_where, 0), null);
    if (container_where[0] === OBJ_MINVENT && mtmp2) {
      mcarry = mtmp2;
    }
  }
  mtmp = await revive(corpse, FALSE);
  if (mtmp) {
    switch (where) {
    case 3:
      if (is_uwep) {
        await pline_The(S("%s writhes out of your grasp!"), P(cname));
      } else {
        await You_feel(S("squirming in your backpack!"));
      }
      break;
    case 1:
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        await pline(S("%s rises from the dead!"), chewed ? await Adjmonnam(mtmp, S("bite-covered")) : await Monnam(mtmp));
      }
      break;
    case 4:
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        if ((mcarry.wormno | 0 ? worm_known(mcarry) : $rd(G.viz_array.a[G.viz_array.o + mcarry.my], mcarry.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mcarry && mcarry.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mcarry.my], mcarry.mx) & 1 ? 1 : 0) && ((!mcarry.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mcarry.mundetected)) {
          await pline(S("Startled, %s drops %s as it revives!"), await mon_nam(mcarry), await an(P(cname)));
        } else {
          await pline(S("%s suddenly appears!"), chewed ? await Adjmonnam(mtmp, S("bite-covered")) : await Monnam(mtmp));
        }
      }
      break;
    case 2:
      {
        let sackname = new Int8Array(256);
        if (container_where[0] === OBJ_MINVENT && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && mcarry && ((mcarry.wormno | 0 ? worm_known(mcarry) : $rd(G.viz_array.a[G.viz_array.o + mcarry.my], mcarry.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mcarry && mcarry.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mcarry.my], mcarry.mx) & 1 ? 1 : 0) && ((!mcarry.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mcarry.mundetected)) && container) {
          await pline(S("%s writhes out of %s!"), await Amonnam(mtmp), await yname(container));
        } else if (container_where[0] === OBJ_INVENT && container) {
          strcpy(P(sackname), await an(await xname(container)));
          await pline(S("%s %s out of %s in your pack!"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.c_common_strings.c_Something : await Amonnam(mtmp), locomotion(mtmp.data, S("writhes")), P(sackname));
        } else if (container_where[0] === OBJ_FLOOR && container && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
          strcpy(P(sackname), await an(await xname(container)));
          await pline(S("%s escapes from %s!"), await Amonnam(mtmp), P(sackname));
        }
        break;
      }
    default:
      await impossible(S("revive_corpse: lost corpse @ %d"), where);
      break;
    }
    return TRUE;
  }
  return FALSE;
}

export async function revive_mon(arg: union_any | null, timeout: number): Promise<void> {
  let body = arg.a_obj;
  let mptr = $sat(G.mons, body.corpsenm);
  let mtmp = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  if ((mptr.mflags3 & M3_DISPLACES) !== 0 && body.where === OBJ_FLOOR && get_obj_location(body, P(x, 0), P(y, 0), 0) && !!(mtmp = !!G.level.monsters[x[0]][y[0]] ? G.level.monsters[x[0]][y[0]] : null)) {
    let notice_it = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
    let monname = await Monnam(mtmp);
    if (await rloc(mtmp, TRUE)) {
      if (notice_it && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
        await pline(S("%s vanishes."), monname);
      } else if (!notice_it && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
        await pline(S("%s appears."), await Monnam(mtmp));
      } else if (notice_it && dist2(mtmp.mx, mtmp.my, x[0], y[0]) > 2) {
        await pline(S("%s teleports."), monname);
      }
    }
  }
  if (!await revive_corpse(body)) {
    let when = 0;
    let action = 0;
    if ((mptr === $sat(G.mons, 308) || mptr === $sat(G.mons, 310) || mptr === $sat(G.mons, 309)) && rn2(99)) {
      action = REVIVE_MON;
      for (when = 3; when < 67; ++when) {
        if (!rn2(3)) {
          break;
        }
      }
    } else {
      await You_feel(S("%sless hassled."), mptr === $sat(G.mons, 308) || mptr === $sat(G.mons, 310) || mptr === $sat(G.mons, 309) ? S("much ") : S(""));
      action = ROT_CORPSE;
      when = 250 - (G.monstermoves - body.age);
      if (when < 1) {
        when = 1;
      }
    }
    await start_timer(when, TIMER_OBJECT, action, arg);
  }
}

export function donull(): number {
  return 1;
}

async function wipeoff(): Promise<number> {
  let $t1: any;
  if (G.u.ucreamed < 4) {
    G.u.ucreamed = 0;
  } else {
    G.u.ucreamed = G.u.ucreamed - 4 >>> 0;
  }
  if (G.u.uprops[BLINDED].intrinsic < 4) {
    G.u.uprops[BLINDED].intrinsic = 0;
  } else {
    ($t1 = G.u.uprops[BLINDED], $t1.intrinsic = $t1.intrinsic - 4);
  }
  if (!G.u.uprops[BLINDED].intrinsic) {
    await pline(S("You've got the glop off."));
    G.u.ucreamed = 0;
    if (!await gulp_blnd_check()) {
      G.u.uprops[BLINDED].intrinsic = 1;
      await make_blinded(0, TRUE);
    }
    return 0;
  } else if (!G.u.ucreamed) {
    await Your(S("%s feels clean now."), body_part(FACE));
    return 0;
  }
  return 1;
}

export async function dowipe(): Promise<number> {
  if (G.u.ucreamed) {
    sprintf(P(dowipe$buf), S("wiping off your %s"), body_part(FACE));
    set_occupation(wipeoff, P(dowipe$buf), 0);
    return 1;
  }
  await Your(S("%s is already clean."), body_part(FACE));
  return 1;
}

export async function set_wounded_legs(side: number, timex: number): Promise<void> {
  if (!(G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic)) {
    --G.u.atemp.a[A_DEX];
    G.context.botl = 1;
  }
  if (!(G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) || G.u.uprops[WOUNDED_LEGS].intrinsic & TIMEOUT) {
    G.u.uprops[WOUNDED_LEGS].intrinsic = timex;
  }
  G.u.uprops[WOUNDED_LEGS].extrinsic = side;
  await encumber_msg();
}

export async function heal_legs(how: number): Promise<void> {
  if (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) {
    if (G.u.atemp.a[A_DEX] < 0) {
      ++G.u.atemp.a[A_DEX];
      G.context.botl = 1;
    }
    if (!G.u.usteed && how !== 2) {
      let legs = body_part(LEG);
      if ((G.u.uprops[WOUNDED_LEGS].extrinsic & BOTH_SIDES) === BOTH_SIDES) {
        legs = await makeplural(legs);
      }
      await Your(S("%s %s better."), legs, vtense(legs, S("feel")));
    }
    G.u.uprops[WOUNDED_LEGS].intrinsic = G.u.uprops[WOUNDED_LEGS].extrinsic = 0;
    if (how === 0) {
      await encumber_msg();
    }
  }
}

export function $init(): void {
  drop_types = $ta(Int8Array, 4, [ALLOW_COUNT, COIN_CLASS, ALL_CLASSES]);
  at_ladder = 0;
  G.save_dlevel = struct_d_level.$of();
  dfr_pre_msg = null;
  dfr_post_msg = null;
  goto_level$fam_msgs = [S("You have a sense of deja vu."),
S("You feel like you've been here before."),
S("This place %s familiar..."),
null];
  goto_level$halu_fam_msgs = [S("Whoa!  Everything %s different."),
S("You are surrounded by twisty little passages, all alike."),
S("Gee, this %s like uncle Conan's place..."),
null];
  dowipe$buf = new Int8Array(39);
}
