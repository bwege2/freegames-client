// @ts-nocheck
// NetHack 3.6.7 hack.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { check_leash, m_unleash } from './apply.ts';
import { acurr, acurrstr, adjalign, exercise } from './attrib.ts';
import { drag_ball, move_bc } from './ball.ts';
import { cmd_from_func, confdir, directionname, isok, reset_occupations, xytod } from './cmd.ts';
import { is_db_wall, is_ice, is_lava, is_pool, is_pool_or_lava } from './dbridge.ts';
import { buried_ball, buried_ball_to_punishment, bury_objs, dig_typ, use_pick_axe2, watch_dig } from './dig.ts';
import { curs_on_u, docrt, feel_location, glyph_at, map_invisible, map_object, newsym, tmp_at, unmap_invisible, unmap_object } from './display.ts';
import { boulder_hits_pool, flooreffects, revive_corpse } from './do.ts';
import { Amonnam, Monnam, a_monnam, hliquid, m_monnam, mon_nam, x_monnam, y_monnam } from './do_name.ts';
import { Boots_off, Boots_on, Ring_off, off_msg, stop_donning } from './do_wear.ts';
import { abuse_dog } from './dog.ts';
import { breaktest } from './dothrow.ts';
import { Invocation_lev, Is_special, On_stairs, assign_level, depth, get_level, on_level, room_discovered } from './dungeon.ts';
import { gethungry } from './eat.ts';
import { done } from './end.ts';
import { can_reach_floor, ceiling, engr_at, surface, wipe_engr_at } from './engrave.ts';
import { experience, more_experienced, newexplevel } from './exper.ts';
import { dist2, distmin, midnight, s_suffix, sgn, strncmpi, upstart } from './hacklib.ts';
import { carrying, delobj, freeinv, sobj_at, update_inventory } from './invent.ts';
import { doopen_indir } from './lock.ts';
import { mdamageu } from './mhitu.ts';
import { water_friction } from './mkmaze.ts';
import { add_to_migration, obj_extract_self, place_object, remove_object, splitobj } from './mkobj.ts';
import { inside_room, search_special } from './mkroom.ts';
import { curr_mon_load, hideunder, minliquid, mnexto, seemimic, wake_nearby } from './mon.ts';
import { attacktype, dmgtype, locomotion, monsndx, noattacks, passes_bars, sticks } from './mondata.ts';
import { accessible, can_fog, can_ooze, closed_door, dissolve_bars, onscary } from './monmove.ts';
import { hit_bars } from './mthrowu.ts';
import { find_skates } from './o_init.ts';
import { The, Tobjnam, an, ansimpleoname, doname, helm_simple_name, makeplural, otense, the, xname } from './objnam.ts';
import { autopick_testobj, loot_mon, pickup } from './pickup.ts';
import { Norep, There, You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, float_vs_flight, rehumanize } from './polyself.ts';
import { incr_itimeout } from './potion.ts';
import { intemple } from './priest.ts';
import { in_out_region } from './region.ts';
import { d, rn2, rnd } from './rnd.ts';
import { Hello } from './role.ts';
import { add_damage, block_door, block_entry, pay_for_damage, u_entered_shop, u_left_shop } from './shk.ts';
import { growl, yelp } from './sounds.ts';
import { dismount_steed, exercise_steed, place_monster, rider_cant_reach, stucksteed } from './steed.ts';
import { enexto, goodpos, random_teleport_level, rloc_to, rloco } from './teleport.ts';
import { fall_asleep, spot_time_left } from './timeout.ts';
import { b_trapped, blow_up_landmine, climb_pit, deltrap, dotrap, drown, fill_pit, float_down, float_up, lava_effects, mintrap, reset_utrap, seetrap, selftouch, sokoban_guilt, t_at, uescaped_shaft, uteetering_at_seen_pit } from './trap.ts';
import { attack, stumble_onto_mimic } from './uhitm.ts';
import { block_point, unblock_point, vision_recalc } from './vision.ts';
import { setuwep } from './wield.ts';
import { worm_cross, worm_known } from './worm.ts';
import { struct_d_level, struct_monst, struct_nhcoord, struct_obj, struct_permonst, struct_trap, union_any } from './structs.ts';
import { $arr, $at2, $cs, $peq, $rd, $sadd, $sat, $sdiff, $ta, $wr, G, P, S, memset, rn2_on_display_rng, sprintf, strchr, strcpy } from './rt/index.ts';
import { AD_CORR, AD_RUST, AIR, ALTAR, ANTHOLE, ARTICLE_A, ART_STING, AT_EXPL, A_CON, A_DEX, A_STR, BARRACKS, BEEHIVE, BLINDED, BOULDER, CANDELABRUM_OF_INVOCATION, CLOUD, COCKNEST, COIN_CLASS, COLD_RES, COLNO, CONFLICT, CONFUSION, CORPSE, CORR, COURT, DBWALL, DEAF, DELPHI, DETECT_MONSTERS, DIED, DISINT_RES, DISMOUNT_FELL, DISMOUNT_GENERIC, DISP_ALL, DISP_END, DOMOVE_RUSH, DOMOVE_WALK, DOOR, DO_MOVE, DWARVISH_MATTOCK, D_BROKEN, D_ISOPEN, D_NODOOR, D_TRAPPED, EXPL_MAX, EXT_ENCUMBER, FAILEDUNTRAP, FALSE, FAST, FIRE_RES, FLYING, FOOT, FOUNTAIN, FROMFORM, FROMOUTSIDE, FUMBLING, GOLD_SYM, GRAVE, HALF_PHDAM, HALLUC, HALLUC_RES, HEADSTONE, HOLE, HVY_ENCUMBER, INFRAVISION, INTRINSIC, INVIS, IN_SIGHT, IRON, IRONBARS, I_SPECIAL, LANDMINE, LEFT_SIDE, LEPREHALL, LEVEL_TELEP, LEVITATION, LEVITATION_BOOTS, MAGICAL_BREATHING, MAXPCHARS, MAX_CARR_CAP, MELT_ICE_AWAY, MIGR_RANDOM, MITHRIL, MOD_ENCUMBER, MORGUE, MZ_HUMAN, M_AP_FURNITURE, M_AP_NOTHING, M_AP_OBJECT, NO_KILLER_PREFIX, NO_TRAP, OROOM, OVERLOADED, PASSES_WALLS, PICK_AXE, PIT, PM_CAPTAIN, PM_LIEUTENANT, PM_ORACLE, PM_SERGEANT, PM_SOLDIER, PM_WIZARD_OF_YENDOR, POISON_RES, POOL, PROT_FROM_SHAPE_CHANGERS, P_BASIC, P_NONE, P_PICK_AXE, P_RIDING, RIGHT_SIDE, RIN_LEVITATION, ROOM, ROOMOFFSET, ROWNO, RUN_CRAWL, RUN_LEAP, RUN_TPORT, SDOOR, SEE_INVIS, SHOCK_RES, SHOPBASE, SHOP_DOOR_COST, SINK, SLEEP_RES, SLT_ENCUMBER, SPIKED_PIT, STAIRS, STATUE, STEALTH, STONE, STUNNED, SWAMP, SWIMMING, S_EEL, S_EYE, S_GHOST, S_LIGHT, S_MIMIC, S_NYMPH, S_PIERCER, S_VORTEX, S_arrow_trap, S_hcdoor, S_stone, S_vcdoor, TELEPAT, TELEPORT, TELEPORT_CONTROL, TELEP_TRAP, TEMPLE, TEST_MOVE, TEST_TRAP, TEST_TRAV, THRONE, TIMEOUT, TOOL_CLASS, TRAPDOOR, TRAPNUM, TRAVP_GUESS, TRAVP_TRAVEL, TRAVP_VALID, TREE, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, TT_WEB, UNCHANGING, UNENCUMBERED, WAN_DIGGING, WARNING, WARN_OF_MON, WATER, WEAPON_CLASS, WOUNDED_LEGS, WT_HUMAN, WWALKING, W_ARMF, W_ARTI, W_NONDIGGABLE, W_NONPASSWALL, ZOO } from './consts.ts';

let tmp_anything: union_any;
let fell_on_sink: any;
let wc: number;
let moverock$lastmovetime: number;
let findtravelpath$ordered: any;
let domove_core$skates: number;
let spoteffects$inspoteffects: number;
let spoteffects$spotloc: struct_nhcoord;
let spoteffects$spotterrain: number;
let spoteffects$spottrap: struct_trap | null;
let spoteffects$spottraptyp: number;
let spoteffects$icewarnings: any;
let in_rooms$buf: any;
let maybe_wail$powers: any;

export function uint_to_any(ui: number): union_any | null {
  tmp_anything.$cp(G.zeroany);
  tmp_anything.a_uint = ui;
  return tmp_anything;
}

export function long_to_any(lng: number): union_any | null {
  tmp_anything.$cp(G.zeroany);
  tmp_anything.a_long = lng;
  return tmp_anything;
}

export function monst_to_any(mtmp: struct_monst | null): union_any | null {
  tmp_anything.$cp(G.zeroany);
  tmp_anything.a_monst = mtmp;
  return tmp_anything;
}

export function obj_to_any(obj: struct_obj | null): union_any | null {
  tmp_anything.$cp(G.zeroany);
  tmp_anything.a_obj = obj;
  return tmp_anything;
}

export async function revive_nasty(x: number, y: number, msg: Ptr | null): Promise<number> {
  let otmp = null;
  let otmp2 = null;
  let mtmp = null;
  let cc = new struct_nhcoord();
  let revived = FALSE;
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp2) {
    otmp2 = otmp.v.v_nexthere;
    if (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 309) || otmp.corpsenm === PM_WIZARD_OF_YENDOR)) {
      if ((mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && await enexto(cc, x, y, mtmp.data)) {
        await rloc_to(mtmp, cc.x, cc.y);
      }
      if (msg) {
        await Norep(S("%s"), msg);
      }
      revived = await revive_corpse(otmp);
    }
  }
  if (revived) {
    mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
    if (mtmp && !goodpos(x, y, mtmp, 0) && await enexto(cc, x, y, mtmp.data)) {
      await rloc_to(mtmp, cc.x, cc.y);
    }
  }
  return revived;
}

async function moverock(): Promise<number> {
  let $t1: any, $t2: any, $t3: any;
  let $g = 0;
  let rx = 0;
  let ry = 0;
  let sx = 0;
  let sy = 0;
  let otmp = null;
  let ttmp = null;
  let mtmp = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      sx = G.u.ux + G.u.dx << 24 >> 24, sy = G.u.uy + G.u.dy << 24 >> 24;
    case 4:
      if (!!!(otmp = sobj_at(BOULDER, sx, sy))) { $g = 5; continue $L; }
      if (otmp !== G.level.objects[sx][sy]) {
        await movobj(otmp, sx, sy);
      }
      rx = G.u.ux + 2 * G.u.dx << 24 >> 24;
      ry = G.u.uy + 2 * G.u.dy << 24 >> 24;
      nomul(0);
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(sx, sy);
        }
        await You(S("don't have enough leverage to push %s."), await the(await xname(otmp)));
        return -1;
      }
      if (G.youmonst.data.msize < 1 && !G.u.usteed) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(sx, sy);
        }
        await pline(S("You're too small to push that %s."), await xname(otmp));
        { $g = 1; continue $L; }
      }
      if (!(isok(rx, ry) && !($at2(G.level.locations, rx, ry).typ < POOL) && $at2(G.level.locations, rx, ry).typ !== IRONBARS && (!($at2(G.level.locations, rx, ry).typ === DOOR) || !(G.u.dx && G.u.dy) || doorless_door(rx, ry)) && !sobj_at(BOULDER, rx, ry))) { $g = 7; continue $L; }
      ttmp = t_at(rx, ry);
      mtmp = !!G.level.monsters[rx][ry] ? G.level.monsters[rx][ry] : null;
      if (G.level.flags.sokoban_rules | 0 && G.u.dx && G.u.dy) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(sx, sy);
        }
        await pline(S("%s won't roll diagonally on this %s."), await The(await xname(otmp)), surface(sx, sy));
        { $g = 1; continue $L; }
      }
      if (await revive_nasty(rx, ry, S("You sense movement on the other side."))) {
        return -1;
      }
      if (mtmp && !(mtmp.data.mlet === S_GHOST) && (!mtmp.mtrapped || !(ttmp && ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT)))) {
        let deliver_part1 = FALSE;
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(sx, sy);
        }
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
          await pline(S("There's %s on the other side."), await a_monnam(mtmp));
          deliver_part1 = TRUE;
        } else {
          await You_hear(S("a monster behind %s."), await the(await xname(otmp)));
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            deliver_part1 = TRUE;
          }
          await map_invisible(rx, ry);
        }
        if (G.flags.verbose) {
          let you_or_steed = new Int8Array(256);
          strcpy(P(you_or_steed), G.u.usteed ? await y_monnam(G.u.usteed) : S("you"));
          await pline(S("%s%s cannot move %s."), deliver_part1 ? S("Perhaps that's why ") : S(""), deliver_part1 ? P(you_or_steed) : upstart(P(you_or_steed)), deliver_part1 ? S("it") : await the(await xname(otmp)));
        }
        { $g = 1; continue $L; }
      }
      if (ttmp) {
        switch (ttmp.ttyp | 0) {
        case LANDMINE:
          if (rn2(10)) {
            await obj_extract_self(otmp);
            await place_object(otmp, rx, ry);
            await newsym(sx, sy);
            await pline(S("KAABLAMM!!!  %s %s land mine."), await Tobjnam(otmp, S("trigger")), ttmp.madeby_u | 0 ? S("your") : S("a"));
            await blow_up_landmine(ttmp);
            await fill_pit(G.u.ux, G.u.uy);
            if ($rd(G.viz_array.a[G.viz_array.o + ry], rx) & 2) {
              await newsym(rx, ry);
            }
            return sobj_at(BOULDER, sx, sy) ? -1 : 0;
          }
          break;
        case SPIKED_PIT:
        case PIT:
          await obj_extract_self(otmp);
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            ($t1 = G.viz_array.a[G.viz_array.o + ry], $t2 = rx, $t1.a[$t1.o + $t2] = ($t1.a[$t1.o + $t2] | IN_SIGHT) << 24 >> 24);
          }
          if (!await flooreffects(otmp, rx, ry, S("fall"))) {
            await place_object(otmp, rx, ry);
          }
          if (mtmp && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await newsym(rx, ry);
          }
          return sobj_at(BOULDER, sx, sy) ? -1 : 0;
        case HOLE:
        case TRAPDOOR:
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await pline(S("Kerplunk!  You no longer feel %s."), await the(await xname(otmp)));
          } else {
            await pline(S("%s%s and %s a %s in the %s!"), await Tobjnam(otmp, (ttmp.ttyp | 0) === TRAPDOOR ? S("trigger") : S("fall")), (ttmp.ttyp | 0) === TRAPDOOR ? S("") : S(" into"), otense(otmp, S("plug")), (ttmp.ttyp | 0) === TRAPDOOR ? S("trap door") : S("hole"), surface(rx, ry));
          }
          await deltrap(ttmp);
          await delobj(otmp);
          await bury_objs(rx, ry);
          ($t3 = $at2(G.level.locations, rx, ry), $t3.flags = ((($t3.flags | 0) & ~W_NONDIGGABLE) >>> 0) & 31);
          $at2(G.level.locations, rx, ry).candig = 1;
          if ($rd(G.viz_array.a[G.viz_array.o + ry], rx) & 2) {
            await newsym(rx, ry);
          }
          return sobj_at(BOULDER, sx, sy) ? -1 : 0;
        case LEVEL_TELEP:
        case TELEP_TRAP:
          {
            let newlev = 0;
            let dest = new struct_d_level();
            if ((ttmp.ttyp | 0) === LEVEL_TELEP) {
              newlev = random_teleport_level();
              if (newlev === depth(G.u.uz) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
                { $g = 2; continue $L; }
              }
            }
            if (G.u.usteed) {
              await pline(S("%s pushes %s and suddenly it disappears!"), upstart(await y_monnam(G.u.usteed)), await the(await xname(otmp)));
            } else {
              await You(S("push %s and suddenly it disappears!"), await the(await xname(otmp)));
            }
            if ((ttmp.ttyp | 0) === TELEP_TRAP) {
              await rloco(otmp);
            } else {
              await obj_extract_self(otmp);
              await add_to_migration(otmp);
              await get_level(dest, newlev);
              otmp.ox = dest.dnum;
              otmp.oy = dest.dlevel;
              otmp.owornmask = MIGR_RANDOM;
            }
            await seetrap(ttmp);
            return sobj_at(BOULDER, sx, sy) ? -1 : 0;
          }
        default:
          break;
        }
      }
      if (closed_door(rx, ry)) {
        { $g = 3; continue $L; }
      }
      if (await boulder_hits_pool(otmp, rx, ry, TRUE)) {
        { $g = 4; continue $L; };
      }
      if (otmp !== G.level.objlist) {
        await remove_object(otmp);
        await place_object(otmp, otmp.ox, otmp.oy);
      }
    case 2: // dopush
      if (!G.u.usteed) {
        if (G.moves > moverock$lastmovetime + 2 || G.moves < moverock$lastmovetime) {
          await pline(S("With %s effort you move %s."), (G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0 ? S("little") : S("great"), await the(await xname(otmp)));
        }
        await exercise(A_STR, TRUE);
      } else {
        await pline(S("%s moves %s."), upstart(await y_monnam(G.u.usteed)), await the(await xname(otmp)));
      }
      moverock$lastmovetime = G.moves;
      if ($at2(G.level.locations, rx, ry).glyph === 382 + (382 + 0)) {
        await unmap_object(rx, ry);
      }
      await movobj(otmp, rx, ry);
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await feel_location(rx, ry);
        await feel_location(sx, sy);
      } else {
        await newsym(sx, sy);
      }
      { $g = 6; continue $L; }
    case 7:
    case 3: // nopushmsg
      if (G.u.usteed) {
        await pline(S("%s tries to move %s, but cannot."), upstart(await y_monnam(G.u.usteed)), await the(await xname(otmp)));
      } else {
        await You(S("try to move %s, but in vain."), await the(await xname(otmp)));
      }
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await feel_location(sx, sy);
      }
    case 1: // cannot_push
      if ((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0) {
        let canpickup = (!G.level.flags.sokoban_rules && (inv_cnt(FALSE) < 52 || !carrying(BOULDER)) ? 1 : 0) << 24 >> 24;
        let willpickup = (canpickup && await autopick_testobj(otmp, TRUE) ? 1 : 0) << 24 >> 24;
        if (G.u.usteed && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
          await You(S("aren't skilled enough to %s %s from %s."), willpickup ? S("pick up") : S("push aside"), await the(await xname(otmp)), await y_monnam(G.u.usteed));
        } else {
          await pline(S("However, you %seasily %s."), willpickup || !canpickup ? S("") : S("could "), willpickup || canpickup ? S("pick it up") : S("push it aside"));
          sokoban_guilt();
          { $g = 5; continue $L; };
        }
        { $g = 5; continue $L; };
      }
      if (!G.u.usteed && ((!G.invent || inv_weight() <= -850) && (!G.u.dx || !G.u.dy || $at2(G.level.locations, G.u.ux, sy).typ < POOL && $at2(G.level.locations, sx, G.u.uy).typ < POOL) || G.youmonst.data.msize < 1)) {
        await pline(S("However, you can squeeze yourself into a small opening."));
        sokoban_guilt();
        { $g = 5; continue $L; };
      } else {
        return -1;
      }
    case 6:
      { $g = 4; continue $L; }
    case 5:
      return 0;
    }
    break;
  }
}

async function still_chewing(x: number, y: number): Promise<number> {
  let lev = $sat(G.level.locations[x], y);
  let boulder = sobj_at(BOULDER, x, y);
  let digtxt = null;
  let dmgtxt = null;
  if (G.context.digging.down) {
    memset(G.context.digging, 0, 24);
  }
  if (!boulder && (lev.typ < POOL && !may_dig(x, y) || lev.typ === IRONBARS && (lev.flags | 0) & W_NONDIGGABLE)) {
    await You(S("hurt your teeth on the %s."), lev.typ === IRONBARS ? S("bars") : lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE ? S("tree") : S("hard stone"));
    nomul(0);
    return 1;
  } else if (G.context.digging.pos.x !== x || G.context.digging.pos.y !== y || !on_level(G.context.digging.level, G.u.uz)) {
    G.context.digging.down = FALSE;
    G.context.digging.chew = TRUE;
    G.context.digging.warned = FALSE;
    G.context.digging.pos.x = x;
    G.context.digging.pos.y = y;
    assign_level(G.context.digging.level, G.u.uz);
    G.context.digging.effort = (lev.typ < POOL && !(lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) ? 30 : 60) + G.u.udaminc;
    await You(S("start chewing %s %s."), boulder || (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) || lev.typ === IRONBARS ? S("on a") : S("a hole in the"), boulder ? S("boulder") : lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE ? S("tree") : lev.typ < POOL ? S("rock") : lev.typ === IRONBARS ? S("bar") : S("door"));
    await watch_dig(null, x, y, FALSE);
    return 1;
  } else if ((G.context.digging.effort += 30 + G.u.udaminc) <= 100) {
    if (G.flags.verbose) {
      await You(S("%s chewing on the %s."), G.context.digging.chew ? S("continue") : S("begin"), boulder ? S("boulder") : lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE ? S("tree") : lev.typ < POOL ? S("rock") : lev.typ === IRONBARS ? S("bars") : S("door"));
    }
    G.context.digging.chew = TRUE;
    await watch_dig(null, x, y, FALSE);
    return 1;
  }
  ++G.u.uconduct.food;
  G.u.uhunger += rnd(20);
  if (boulder) {
    await delobj(boulder);
    await You(S("eat the boulder."));
    if (lev.typ < POOL || closed_door(x, y) || sobj_at(BOULDER, x, y)) {
      block_point(x, y);
      memset(G.context.digging, 0, 24);
      return 1;
    }
  } else if (lev.typ && lev.typ <= DBWALL) {
    if ($rd(in_rooms(x, y, SHOPBASE))) {
      await add_damage(x, y, 10 * acurrstr());
      dmgtxt = S("damage");
    }
    digtxt = S("chew a hole in the wall.");
    if (G.level.flags.is_maze_lev) {
      lev.typ = ROOM;
    } else if (G.level.flags.is_cavernous_lev | 0 && !in_town(x, y)) {
      lev.typ = CORR;
    } else {
      lev.typ = DOOR;
      lev.flags = (D_NODOOR) & 31;
    }
  } else if (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) {
    digtxt = S("chew through the tree.");
    lev.typ = ROOM;
  } else if (lev.typ === IRONBARS) {
    digtxt = S("eat through the bars.");
    await dissolve_bars(x, y);
  } else if (lev.typ === SDOOR) {
    if ((lev.flags | 0) & D_TRAPPED) {
      lev.flags = (D_NODOOR) & 31;
      await b_trapped(S("secret door"), 0);
    } else {
      digtxt = S("chew through the secret door.");
      lev.flags = (D_BROKEN) & 31;
    }
    lev.typ = DOOR;
  } else if (lev.typ === DOOR) {
    if ($rd(in_rooms(x, y, SHOPBASE))) {
      await add_damage(x, y, SHOP_DOOR_COST);
      dmgtxt = S("break");
    }
    if ((lev.flags | 0) & D_TRAPPED) {
      lev.flags = (D_NODOOR) & 31;
      await b_trapped(S("door"), 0);
    } else {
      digtxt = S("chew through the door.");
      lev.flags = (D_BROKEN) & 31;
    }
  } else {
    digtxt = S("chew a passage through the rock.");
    lev.typ = CORR;
  }
  unblock_point(x, y);
  await newsym(x, y);
  if (digtxt) {
    await You(S("%s"), digtxt);
  }
  if (dmgtxt) {
    await pay_for_damage(dmgtxt, FALSE);
  }
  memset(G.context.digging, 0, 24);
  return 0;
}

export async function movobj(obj: struct_obj | null, ox: number, oy: number): Promise<void> {
  await remove_object(obj);
  await newsym(obj.ox, obj.oy);
  await place_object(obj, ox, oy);
  await newsym(ox, oy);
}

async function dosinkfall(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let obj = null;
  let dmg = 0;
  let lev_boots = (G.uarmf && G.uarmf.otyp === LEVITATION_BOOTS ? 1 : 0) << 24 >> 24;
  let innate_lev = ((G.u.uprops[LEVITATION].intrinsic & (FROMOUTSIDE | FROMFORM)) !== 0 ? 1 : 0) << 24 >> 24;
  let blockd_lev = (G.u.uprops[LEVITATION].blocked === I_SPECIAL ? 1 : 0) << 24 >> 24;
  let ufall = (!innate_lev && !blockd_lev && !(G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic) ? 1 : 0) << 24 >> 24;
  if (!ufall) {
    await You(innate_lev || blockd_lev ? S("wobble unsteadily for a moment.") : S("gain control of your flight."));
  } else {
    let save_ELev = G.u.uprops[LEVITATION].extrinsic;
    let save_HLev = G.u.uprops[LEVITATION].intrinsic;
    G.u.uprops[LEVITATION].extrinsic = G.u.uprops[LEVITATION].intrinsic = 0;
    await You(S("crash to the floor!"));
    dmg = rn2(8) + (25 - acurr(A_CON));
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, P(fell_on_sink), NO_KILLER_PREFIX);
    await exercise(A_DEX, FALSE);
    await selftouch(S("Falling, you"));
    for (obj = G.level.objects[G.u.ux][G.u.uy]; obj; obj = obj.v.v_nexthere) {
      if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE) {
        await You(S("fell on %s."), await doname(obj));
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(3) + 1) / 2 | 0 : rnd(3), P(fell_on_sink), NO_KILLER_PREFIX);
        await exercise(A_CON, FALSE);
      }
    }
    G.u.uprops[LEVITATION].extrinsic = save_ELev;
    G.u.uprops[LEVITATION].intrinsic = save_HLev;
  }
  if (ufall || lev_boots) {
    await stop_donning(lev_boots ? G.uarmf : null);
    lev_boots = (G.uarmf && G.uarmf.otyp === LEVITATION_BOOTS ? 1 : 0) << 24 >> 24;
  }
  ($t1 = G.u.uprops[LEVITATION], $t1.extrinsic = $t1.extrinsic & ~W_ARTI);
  ($t2 = G.u.uprops[LEVITATION], $t2.intrinsic = $t2.intrinsic & ~(I_SPECIAL | TIMEOUT));
  ($t3 = G.u.uprops[LEVITATION], $t3.intrinsic = $t3.intrinsic + 1);
  if (G.uleft && G.uleft.otyp === RIN_LEVITATION) {
    obj = G.uleft;
    await Ring_off(obj);
    await off_msg(obj);
  }
  if (G.uright && G.uright.otyp === RIN_LEVITATION) {
    obj = G.uright;
    await Ring_off(obj);
    await off_msg(obj);
  }
  if (lev_boots) {
    obj = G.uarmf;
    await Boots_off();
    await off_msg(obj);
  }
  ($t4 = G.u.uprops[LEVITATION], $t4.intrinsic = $t4.intrinsic - 1);
  float_vs_flight();
}

export function may_dig(x: number, y: number): number {
  let lev = $sat(G.level.locations[x], y);
  return (!((lev.typ <= DBWALL || (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE)) && (lev.flags | 0) & W_NONDIGGABLE) ? 1 : 0) << 24 >> 24;
}

export function may_passwall(x: number, y: number): number {
  return (!($at2(G.level.locations, x, y).typ <= DBWALL && ($at2(G.level.locations, x, y).flags | 0) & W_NONPASSWALL) ? 1 : 0) << 24 >> 24;
}

export function bad_rock(mdat: struct_permonst | null, x: number, y: number): number {
  return (G.level.flags.sokoban_rules | 0 && sobj_at(BOULDER, x, y) || $at2(G.level.locations, x, y).typ < POOL && (!((mdat.mflags1 & 32) >>> 0 !== 0) || (mdat.mflags1 & 64) >>> 0 !== 0 || !may_dig(x, y)) && !((mdat.mflags1 & 8) >>> 0 !== 0 && may_passwall(x, y)) ? 1 : 0) << 24 >> 24;
}

export function cant_squeeze_thru(mon: struct_monst | null): number {
  let amt = 0;
  let ptr = mon.data;
  if (ptr.msize >= 3 && !((ptr.mflags1 & 4) >>> 0 !== 0 || (ptr.mlet === S_VORTEX || ptr === $sat(G.mons, 151)) || ptr.mlet === S_GHOST || (ptr.mflags1 & 524288) >>> 0 !== 0 || can_fog(mon))) {
    return 1;
  }
  amt = mon === G.youmonst ? inv_weight() + weight_cap() : curr_mon_load(mon);
  if (amt > 600) {
    return 2;
  }
  if (mon === G.youmonst && G.level.flags.sokoban_rules | 0) {
    return 3;
  }
  return 0;
}

export function invocation_pos(x: number, y: number): number {
  return (Invocation_lev(G.u.uz) && x === G.inv_pos.x && y === G.inv_pos.y ? 1 : 0) << 24 >> 24;
}

export async function test_move(ux: number, uy: number, dx: number, dy: number, mode: number): Promise<number> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let tmpr = null;
  let ust = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      x = ux + dx;
      y = uy + dy;
      tmpr = $sat(G.level.locations[x], y);
      G.context.door_opened = FALSE;
      if (!(tmpr.typ < POOL || tmpr.typ === IRONBARS)) { $g = 3; continue $L; }
      {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && mode === DO_MOVE) {
          await feel_location(x, y);
        }
        if ((G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && may_passwall(x, y)) {
          ;
        } else if (G.u.uinwater) {
          if (mode === DO_MOVE) {
            await pline(S("There is an obstacle there."));
          }
          return FALSE;
        } else if (tmpr.typ === IRONBARS) {
          if ((dmgtype(G.youmonst.data, AD_RUST) || dmgtype(G.youmonst.data, AD_CORR)) && mode === DO_MOVE && await still_chewing(x, y)) {
            return FALSE;
          }
          if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic || passes_bars(G.youmonst.data))) {
            if (mode === DO_MOVE && G.iflags.mention_walls) {
              await You(S("cannot pass through the bars."));
            }
            return FALSE;
          }
        } else if ((G.youmonst.data.mflags1 & 32) >>> 0 !== 0 && !((G.youmonst.data.mflags1 & 64) >>> 0 !== 0)) {
          if (mode === DO_MOVE && await still_chewing(x, y)) {
            return FALSE;
          }
        } else if (G.flags.autodig && !G.context.run && !G.context.nopick && G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_PICK_AXE)) {
          if (mode === DO_MOVE) {
            await use_pick_axe2(G.uwep);
          }
          return FALSE;
        } else {
          if (mode === DO_MOVE) {
            if (is_db_wall(x, y)) {
              await pline(S("That drawbridge is up!"));
            } else if ((G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && !may_passwall(x, y) && G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum) {
              await pline_The(S("Sokoban walls resist your ability."));
            } else if (G.iflags.mention_walls) {
              await pline(S("It's %s."), tmpr.typ && tmpr.typ <= DBWALL || tmpr.typ === SDOOR ? S("a wall") : tmpr.typ === TREE || G.level.flags.arboreal | 0 && tmpr.typ === STONE ? S("a tree") : S("solid stone"));
            }
          }
          return FALSE;
        }
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(tmpr.typ === DOOR)) { $g = 4; continue $L; }
      if (!closed_door(x, y)) { $g = 6; continue $L; }
      {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && mode === DO_MOVE) {
          await feel_location(x, y);
        }
        if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
          ;
        } else if (can_ooze(G.youmonst)) {
          if (mode === DO_MOVE) {
            await You(S("ooze under the door."));
          }
        } else if (G.u.uinwater) {
          if (mode === DO_MOVE) {
            await pline(S("There is an obstacle there."));
          }
          return FALSE;
        } else if ((G.youmonst.data.mflags1 & 32) >>> 0 !== 0 && !((G.youmonst.data.mflags1 & 64) >>> 0 !== 0)) {
          if (mode === DO_MOVE && await still_chewing(x, y)) {
            return FALSE;
          }
        } else {
          if (mode === DO_MOVE) {
            if ((G.youmonst.data.mflags1 & 4) >>> 0 !== 0) {
              await You(S("try to ooze under the door, but can't squeeze your possessions through."));
            }
            if (G.flags.autoopen && !G.context.run && !G.u.uprops[CONFUSION].intrinsic && !G.u.uprops[STUNNED].intrinsic && !(G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic)) {
              G.context.door_opened = G.context.move = await doopen_indir(x, y) << 24 >> 24;
            } else if (x === ux || y === uy) {
              if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[STUNNED].intrinsic || acurr(A_DEX) < 10 || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic)) {
                if (G.u.usteed) {
                  await You_cant(S("lead %s through that closed door."), await y_monnam(G.u.usteed));
                } else {
                  await pline(S("Ouch!  You bump into a door."));
                  await exercise(A_DEX, FALSE);
                }
              } else {
                await pline(S("That door is closed."));
              }
            }
          } else if (mode === TEST_TRAV || mode === TEST_TRAP) {
            { $g = 1; continue $L; }
          }
          return FALSE;
        }
      }
      { $g = 5; continue $L; }
    case 6:
    case 1: // testdiag
      if (dx && dy && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && (!doorless_door(x, y) || await block_door(x, y))) {
        if (mode === DO_MOVE) {
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await feel_location(x, y);
          }
          if (G.u.uinwater | 0 || G.iflags.mention_walls) {
            await You_cant(S("move diagonally into an intact doorway."));
          }
        }
        return FALSE;
      }
    case 5:
    case 4:
    case 2:
      if (dx && dy && bad_rock(G.youmonst.data, ux, y) && bad_rock(G.youmonst.data, x, uy)) {
        switch (cant_squeeze_thru(G.youmonst)) {
        case 3:
          if (mode === DO_MOVE) {
            await You(S("cannot pass that way."));
          }
          return FALSE;
        case 2:
          if (mode === DO_MOVE) {
            await You(S("are carrying too much to get through."));
          }
          return FALSE;
        case 1:
          if (mode === DO_MOVE) {
            await Your(S("body is too large to fit through."));
          }
          return FALSE;
        default:
          break;
        }
      } else if (dx && dy && await worm_cross(ux, uy, x, y)) {
        if (mode === DO_MOVE) {
          await pline(S("%s is in your way."), await Monnam(!!G.level.monsters[ux][y] ? G.level.monsters[ux][y] : null));
        }
        return FALSE;
      }
      if (G.context.run === 8 && mode !== DO_MOVE && (x !== G.u.ux || y !== G.u.uy)) {
        let t = t_at(x, y);
        if (t && t.tseen | 0 || !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !((G.youmonst.data.mflags1 & 16) >>> 0 !== 0) && is_pool_or_lava(x, y) && $at2(G.level.locations, x, y).seenv) {
          return (mode === TEST_TRAP ? 1 : 0) << 24 >> 24;
        }
      }
      if (mode === TEST_TRAP) {
        return FALSE;
      }
      ust = $sat(G.level.locations[ux], uy);
      if (dx && dy && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && ust.typ === DOOR && (!doorless_door(ux, uy) || await block_entry(x, y))) {
        if (mode === DO_MOVE && G.iflags.mention_walls) {
          await You_cant(S("move diagonally out of an intact doorway."));
        }
        return FALSE;
      }
      if (sobj_at(BOULDER, x, y) && (G.level.flags.sokoban_rules | 0 || !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic))) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && G.context.run >= 2 && mode !== TEST_TRAV) {
          if (mode === DO_MOVE && G.iflags.mention_walls) {
            await pline(S("A boulder blocks your path."));
          }
          return FALSE;
        }
        if (mode === DO_MOVE) {
          if ((G.youmonst.data.mflags1 & 32) >>> 0 !== 0 && !((G.youmonst.data.mflags1 & 64) >>> 0 !== 0) && !G.level.flags.sokoban_rules) {
            if (await still_chewing(x, y)) {
              return FALSE;
            }
          } else if (await moverock() < 0) {
            return FALSE;
          }
        } else if (mode === TEST_TRAV) {
          let obj = null;
          if (G.level.flags.sokoban_rules) {
            return FALSE;
          }
          if (sobj_at(BOULDER, ux, uy) && !G.level.flags.sokoban_rules) {
            if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && !((G.youmonst.data.mflags1 & 32) >>> 0 !== 0 && !((G.youmonst.data.mflags1 & 64) >>> 0 !== 0)) && !carrying(PICK_AXE) && !carrying(DWARVISH_MATTOCK) && !((obj = carrying(WAN_DIGGING)) && !G.objects[obj.otyp].oc_name_known)) {
              return FALSE;
            }
          }
        }
      }
      return TRUE;
    }
    break;
  }
}

async function findtravelpath(mode: number): Promise<number> {
  let $g = 0;
  let travel = $arr(80, () => new Int8Array(21));
  let travelstepx = $arr(2, () => new Int8Array(1680));
  let travelstepy = $arr(2, () => new Int8Array(1680));
  let tx = 0;
  let ty = 0;
  let ux = 0;
  let uy = 0;
  let n = 0;
  let set_ = 0;
  let radius = 0;
  let i = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if ((mode === TRAVP_TRAVEL || mode === TRAVP_VALID) && G.context.travel1 && distmin(G.u.ux, G.u.uy, G.u.tx, G.u.ty) === 1 && !(G.u.ux !== G.u.tx && G.u.uy !== G.u.ty && G.u.umonnum === 115)) {
        G.context.run = 0;
        if (await test_move(G.u.ux, G.u.uy, G.u.tx - G.u.ux, G.u.ty - G.u.uy, TEST_MOVE)) {
          if (mode === TRAVP_TRAVEL) {
            G.u.dx = G.u.tx - G.u.ux << 24 >> 24;
            G.u.dy = G.u.ty - G.u.uy << 24 >> 24;
            nomul(0);
            G.iflags.travelcc.x = G.iflags.travelcc.y = 0;
          }
          return TRUE;
        }
        if (mode === TRAVP_TRAVEL) {
          G.context.run = 8;
        }
      }
      if (!(G.u.tx !== G.u.ux || G.u.ty !== G.u.uy)) { $g = 3; continue $L; }
      travel = $arr(80, () => new Int8Array(21));
      travelstepx = $arr(2, () => new Int8Array(1680));
      travelstepy = $arr(2, () => new Int8Array(1680));
      n = 1;
      set_ = 0;
      radius = 1;
      if (mode === TRAVP_GUESS || mode === TRAVP_VALID) {
        tx = G.u.ux;
        ty = G.u.uy;
        ux = G.u.tx;
        uy = G.u.ty;
      } else {
        tx = G.u.tx;
        ty = G.u.ty;
        ux = G.u.ux;
        uy = G.u.uy;
      }
    case 1: // noguess
      memset(P(travel), 0, 1680);
      travelstepx[0][0] = tx;
      travelstepy[0][0] = ty;
      while (n !== 0) {
        let nn = 0;
        for (i = 0; i < n; ++i) {
          let dir = 0;
          let x = travelstepx[set_][i];
          let y = travelstepy[set_][i];
          let dirmax = G.u.umonnum === 115 ? 4 : 8;
          let alreadyrepeated = FALSE;
          for (dir = 0; dir < dirmax; ++dir) {
            let nx = x + G.xdir[findtravelpath$ordered[dir]];
            let ny = y + G.ydir[findtravelpath$ordered[dir]];
            if (!isok(nx, ny) || mode === TRAVP_GUESS && !($rd(G.viz_array.a[G.viz_array.o + ny], nx) & 1)) {
              continue;
            }
            if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && !can_ooze(G.youmonst) && closed_door(x, y) || sobj_at(BOULDER, x, y) || await test_move(x, y, nx - x, ny - y, TEST_TRAP)) {
              if (travel[x][y] > radius - 3) {
                if (!alreadyrepeated) {
                  travelstepx[1 - set_][nn] = x << 24 >> 24;
                  travelstepy[1 - set_][nn] = y << 24 >> 24;
                  ++nn;
                  alreadyrepeated = TRUE;
                }
                continue;
              }
            }
            if (await test_move(x, y, nx - x, ny - y, TEST_TRAV) && ($at2(G.level.locations, nx, ny).seenv || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && $rd(G.viz_array.a[G.viz_array.o + ny], nx) & 1)) {
              if (nx === ux && ny === uy) {
                if (mode === TRAVP_TRAVEL || mode === TRAVP_VALID) {
                  G.u.dx = x - ux << 24 >> 24;
                  G.u.dy = y - uy << 24 >> 24;
                  if (mode === TRAVP_TRAVEL && x === G.u.tx && y === G.u.ty) {
                    nomul(0);
                    G.context.run = 8;
                    G.iflags.travelcc.x = G.iflags.travelcc.y = 0;
                  }
                  return TRUE;
                }
              } else if (!travel[nx][ny]) {
                travelstepx[1 - set_][nn] = nx << 24 >> 24;
                travelstepy[1 - set_][nn] = ny << 24 >> 24;
                travel[nx][ny] = radius << 24 >> 24;
                ++nn;
              }
            }
          }
        }
        if (G.iflags.trav_debug) {
          await tmp_at(DISP_ALL, 1 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
          for (i = 0; i < nn; ++i) {
            await tmp_at(travelstepx[1 - set_][i], travelstepy[1 - set_][i]);
          }
          await G.windowprocs.win_delay_output();
          if (G.flags.runmode === RUN_CRAWL) {
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
          }
          await tmp_at(DISP_END, 0);
        }
        n = nn;
        set_ = 1 - set_;
        ++radius;
      }
      if (mode === TRAVP_GUESS) {
        let px = tx;
        let py = ty;
        let dist = 0;
        let nxtdist = 0;
        let d2 = 0;
        let nd2 = 0;
        dist = distmin(ux, uy, tx, ty);
        d2 = dist2(ux, uy, tx, ty);
        for (tx = 1; tx < COLNO; tx = tx + 1 << 24 >> 24) {
          for (ty = 0; ty < ROWNO; ty = ty + 1 << 24 >> 24) {
            if (travel[tx][ty]) {
              nxtdist = distmin(ux, uy, tx, ty);
              if (nxtdist === dist && $rd(G.viz_array.a[G.viz_array.o + ty], tx) & 1) {
                nd2 = dist2(ux, uy, tx, ty);
                if (nd2 < d2) {
                  px = tx;
                  py = ty;
                  d2 = nd2;
                }
              } else if (nxtdist < dist && $rd(G.viz_array.a[G.viz_array.o + ty], tx) & 1) {
                px = tx;
                py = ty;
                dist = nxtdist;
                d2 = dist2(ux, uy, tx, ty);
              }
            }
          }
        }
        if (px === G.u.ux && py === G.u.uy) {
          G.u.dx = sgn(G.u.tx - G.u.ux) << 24 >> 24;
          G.u.dy = sgn(G.u.ty - G.u.uy) << 24 >> 24;
          if (await test_move(G.u.ux, G.u.uy, G.u.dx, G.u.dy, TEST_MOVE)) {
            return TRUE;
          }
          { $g = 2; continue $L; }
        }
        if (G.iflags.trav_debug) {
          await tmp_at(DISP_ALL, 2 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
          await tmp_at(px, py);
          await G.windowprocs.win_delay_output();
          if (G.flags.runmode === RUN_CRAWL) {
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
          }
          await tmp_at(DISP_END, 0);
        }
        tx = px << 24 >> 24;
        ty = py << 24 >> 24;
        ux = G.u.ux;
        uy = G.u.uy;
        set_ = 0;
        n = radius = 1;
        mode = TRAVP_TRAVEL;
        { $g = 1; continue $L; }
      }
      return FALSE;
    case 3:
    case 2: // found
      G.u.dx = 0;
      G.u.dy = 0;
      nomul(0);
      return FALSE;
    }
    break;
  }
}

export async function is_valid_travelpt(x: number, y: number): Promise<number> {
  let tx = G.u.tx;
  let ty = G.u.ty;
  let ret = 0;
  let g = glyph_at(x, y);
  if (x === G.u.ux && y === G.u.uy) {
    return TRUE;
  }
  if (isok(x, y) && (g >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && g < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS) && S_stone === (g >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && g < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? g - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) && !$at2(G.level.locations, x, y).seenv) {
    return FALSE;
  }
  G.u.tx = x << 24 >> 24;
  G.u.ty = y << 24 >> 24;
  ret = await findtravelpath(TRAVP_VALID);
  G.u.tx = tx << 24 >> 24;
  G.u.ty = ty << 24 >> 24;
  return ret;
}

async function trapmove(x: number, y: number, desttrap: struct_trap | null): Promise<number> {
  let $g = 0;
  let anchored = 0;
  let predicament = null;
  let culprit = null;
  let steedname = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      anchored = FALSE;
      steedname = !G.u.usteed ? null : await y_monnam(G.u.usteed);
      if (!G.u.utrap) {
        return TRUE;
      }
      switch (G.u.utraptype) {
      case TT_BEARTRAP: { $g = 3; continue $L; }
      case TT_PIT: { $g = 4; continue $L; }
      case TT_WEB: { $g = 5; continue $L; }
      case TT_LAVA: { $g = 6; continue $L; }
      case TT_INFLOOR: { $g = 7; continue $L; }
      case TT_BURIEDBALL: { $g = 8; continue $L; }
      default: { $g = 9; continue $L; }
      }
    case 3:
      if (G.flags.verbose) {
        predicament = S("caught in a bear trap");
        if (G.u.usteed) {
          await Norep(S("%s is %s."), upstart(steedname), predicament);
        } else {
          await Norep(S("You are %s."), predicament);
        }
      }
      if (G.u.dx && G.u.dy || !rn2(5)) {
        G.u.utrap = G.u.utrap - 1 >>> 0;
      }
      if (!G.u.utrap) {
        { $g = 1; continue $L; }
      }
      { $g = 2; continue $L; };
    case 4:
      if (desttrap && desttrap.tseen | 0 && ((desttrap.ttyp | 0) === PIT || (desttrap.ttyp | 0) === SPIKED_PIT)) {
        return TRUE;
      }
      await climb_pit();
      { $g = 2; continue $L; };
    case 5:
      if (G.uwep && G.uwep.oartifact === ART_STING) {
        G.u.utrap = 0;
        await pline(S("Sting cuts through the web!"));
        { $g = 2; continue $L; };
      }
      if (G.u.utrap = G.u.utrap - 1 >>> 0) {
        if (G.flags.verbose) {
          predicament = S("stuck to the web");
          if (G.u.usteed) {
            await Norep(S("%s is %s."), upstart(steedname), predicament);
          } else {
            await Norep(S("You are %s."), predicament);
          }
        }
      } else {
        if (G.u.usteed) {
          await pline(S("%s breaks out of the web."), upstart(steedname));
        } else {
          await You(S("disentangle yourself."));
        }
      }
      { $g = 2; continue $L; };
    case 6:
      if (G.flags.verbose) {
        predicament = S("stuck in the lava");
        if (G.u.usteed) {
          await Norep(S("%s is %s."), upstart(steedname), predicament);
        } else {
          await Norep(S("You are %s."), predicament);
        }
      }
      if (!is_lava(x, y)) {
        G.u.utrap = G.u.utrap - 1 >>> 0;
        if ((G.u.utrap & 255) >>> 0 === 0) {
          G.u.utrap = 0;
          if (G.u.usteed) {
            await You(S("lead %s to the edge of the %s."), steedname, hliquid(S("lava")));
          } else {
            await You(S("pull yourself to the edge of the %s."), hliquid(S("lava")));
          }
        }
      }
      G.u.umoved = TRUE;
      { $g = 2; continue $L; };
    case 7:
    case 8:
      anchored = (G.u.utraptype === TT_BURIEDBALL ? 1 : 0) << 24 >> 24;
      if (anchored) {
        let cc = new struct_nhcoord();
        cc.x = G.u.ux, cc.y = G.u.uy;
        if (buried_ball(cc) && dist2(x, y, cc.x, cc.y) <= 2) {
          if (G.flags.verbose) {
            await Norep(S("You move within the chain's reach."));
          }
          return TRUE;
        }
      }
      if (!(G.u.utrap = G.u.utrap - 1 >>> 0)) { $g = 11; continue $L; }
      {
        if (G.flags.verbose) {
          if (anchored) {
            predicament = S("chained to the");
            culprit = S("buried ball");
          } else {
            predicament = S("stuck in the");
            culprit = surface(G.u.ux, G.u.uy);
          }
          if (G.u.usteed) {
            if (anchored) {
              await Norep(S("You and %s are %s %s."), steedname, predicament, culprit);
            } else {
              await Norep(S("%s is %s %s."), upstart(steedname), predicament, culprit);
            }
          } else {
            await Norep(S("You are %s %s."), predicament, culprit);
          }
        }
      }
      { $g = 10; continue $L; }
    case 11:
    case 1: // wriggle_free
      if (G.u.usteed) {
        await pline(S("%s finally %s free."), upstart(steedname), !anchored ? S("lurches") : S("wrenches the ball"));
      } else {
        await You(S("finally %s free."), !anchored ? S("wriggle") : S("wrench the ball"));
      }
      if (anchored) {
        await buried_ball_to_punishment();
      }
    case 10:
      { $g = 2; continue $L; };
    case 9:
      await impossible(S("trapmove: stuck in unknown trap? (%d)"), G.u.utraptype | 0);
      { $g = 2; continue $L; };
    case 2:
      return FALSE;
    }
    break;
  }
}

export async function u_rooted(): Promise<number> {
  if (!G.youmonst.data.mmove) {
    await You(S("are rooted %s."), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? S("in place") : S("to the ground"));
    nomul(0);
    return TRUE;
  }
  return FALSE;
}

export async function domove(): Promise<void> {
  let ux1 = G.u.ux;
  let uy1 = G.u.uy;
  G.domove_succeeded = 0;
  await domove_core();
  if ((G.domove_succeeded & (DOMOVE_RUSH | DOMOVE_WALK)) !== 0) {
    await maybe_smudge_engr(ux1, uy1, G.u.ux, G.u.uy);
  }
  G.domove_attempting = 0;
}

async function domove_core(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let $g = 0;
  let mtmp = null;
  let tmpr = null;
  let x = 0;
  let y = 0;
  let trap = null;
  let wtcap = 0;
  let recharged = 0;
  let chainx = new Int8Array(1);
  let chainy = new Int8Array(1);
  let ballx = new Int8Array(1);
  let bally = new Int8Array(1);
  let bc_control = new Int32Array(1);
  let cause_delay = new Int8Array(1);
  let u_with_boulder = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      trap = null;
      chainx[0] = 0;
      chainy[0] = 0;
      ballx[0] = 0;
      bally[0] = 0;
      bc_control[0] = 0;
      cause_delay[0] = FALSE;
      u_with_boulder = (!!sobj_at(BOULDER, G.u.ux, G.u.uy) ? 1 : 0) << 24 >> 24;
      if (G.context.travel) {
        if (!await findtravelpath(FALSE)) {
          await findtravelpath(TRUE);
        }
        G.context.travel1 = 0;
      }
      if (((wtcap = near_capacity()) >= OVERLOADED || wtcap > SLT_ENCUMBER && (G.u.umonnum !== G.u.umonster ? G.u.mh < 5 && G.u.mh !== G.u.mhmax ? 1 : 0 : G.u.uhp < 10 && G.u.uhp !== G.u.uhpmax ? 1 : 0)) && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level))) {
        if (wtcap < OVERLOADED) {
          await You(S("don't have enough stamina to move."));
          await exercise(A_CON, FALSE);
        } else {
          await You(S("collapse under your load."));
        }
        nomul(0);
        return;
      }
      if (!G.u.uswallow) { $g = 3; continue $L; }
      {
        G.u.dx = G.u.dy = 0;
        G.u.ux = x = G.u.ustuck.mx;
        G.u.uy = y = G.u.ustuck.my;
        mtmp = G.u.ustuck;
      }
      { $g = 2; continue $L; }
    case 3:
      if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) && rn2(4) && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
        switch (rn2(3)) {
        case 0:
          await You(S("tumble in place."));
          await exercise(A_DEX, FALSE);
          break;
        case 1:
          await You_cant(S("control your movements very well."));
          break;
        case 2:
          await pline(S("It's hard to walk in thin air."));
          await exercise(A_DEX, TRUE);
          break;
        }
        return;
      }
      recharged = (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && is_ice(G.u.ux, G.u.uy) ? 1 : 0) << 24 >> 24;
      if (recharged) {
        if (!domove_core$skates) {
          domove_core$skates = await find_skates();
        }
        if (G.uarmf && G.uarmf.otyp === domove_core$skates || ((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 2) !== 0 || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.youmonst.data.mlet === S_EYE || G.youmonst.data.mlet === S_LIGHT) || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151))) {
          recharged = FALSE;
        } else if (!rn2(G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic ? 3 : 2)) {
          ($t1 = G.u.uprops[FUMBLING], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
          ($t2 = G.u.uprops[FUMBLING], $t2.intrinsic = $t2.intrinsic & ~TIMEOUT);
          ($t3 = G.u.uprops[FUMBLING], $t3.intrinsic = $t3.intrinsic + 1);
        }
      }
      if (!recharged && G.u.uprops[FUMBLING].intrinsic & FROMOUTSIDE) {
        ($t4 = G.u.uprops[FUMBLING], $t4.intrinsic = $t4.intrinsic & ~FROMOUTSIDE);
      }
      x = G.u.ux + G.u.dx << 24 >> 24;
      y = G.u.uy + G.u.dy << 24 >> 24;
      if (G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic && !rn2(5)) {
        let tries = 0;
        do {
          if (tries++ > 50) {
            nomul(0);
            return;
          }
          confdir();
          x = G.u.ux + G.u.dx << 24 >> 24;
          y = G.u.uy + G.u.dy << 24 >> 24;
        } while (!isok(x, y) || bad_rock(G.youmonst.data, x, y));
      }
      if (G.u.uinwater) {
        await water_friction();
        if (!G.u.dx && !G.u.dy) {
          nomul(0);
          return;
        }
        x = G.u.ux + G.u.dx << 24 >> 24;
        y = G.u.uy + G.u.dy << 24 >> 24;
        if (isok(x, y) && !is_pool(x, y) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && wtcap > (G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0 ? MOD_ENCUMBER : SLT_ENCUMBER)) {
          await You(S("are carrying too much to climb out of the water."));
          nomul(0);
          return;
        }
      }
      if (!isok(x, y)) {
        if (G.iflags.mention_walls) {
          let dx = G.u.dx;
          let dy = G.u.dy;
          if (dx && dy) {
            if (isok(x, G.u.uy)) {
              dx = 0;
            } else if (isok(G.u.ux, y)) {
              dy = 0;
            }
          }
          await You(S("have already gone as far %s as possible."), directionname(xytod(dx, dy)));
        }
        nomul(0);
        return;
      }
      if ((trap = t_at(x, y)) && trap.tseen | 0 || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !((G.youmonst.data.mflags1 & 16) >>> 0 !== 0) && is_pool_or_lava(x, y) && $at2(G.level.locations, x, y).seenv) {
        if (G.context.run >= 2) {
          if (G.iflags.mention_walls) {
            if (trap && trap.tseen | 0) {
              let tt = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : trap.ttyp | 0;
              await You(S("stop in front of %s."), await an(G.defsyms[S_arrow_trap + tt - 1].explanation));
            } else if (is_pool_or_lava(x, y) && $at2(G.level.locations, x, y).seenv) {
              await You(S("stop at the edge of the %s."), hliquid(is_pool(x, y) ? S("water") : S("lava")));
            }
          }
          nomul(0);
          G.context.move = 0;
          return;
        } else {
          nomul(0);
        }
      }
      if (!(G.u.ustuck && (x !== G.u.ustuck.mx || y !== G.u.ustuck.my))) { $g = 4; continue $L; }
      if (!(dist2(G.u.ustuck.mx, G.u.ustuck.my, G.u.ux, G.u.uy) > 2)) { $g = 6; continue $L; }
      {
        G.u.ustuck = null;
      }
      { $g = 5; continue $L; }
    case 6:
      if (!sticks(G.youmonst.data)) { $g = 8; continue $L; }
      {
        await You(S("release %s."), await mon_nam(G.u.ustuck));
        G.u.ustuck = null;
      }
      { $g = 7; continue $L; }
    case 8:
      switch (rn2(!G.u.ustuck.mcanmove ? 8 : 40)) {
      case 0: { $g = 10; continue $L; }
      case 1: { $g = 11; continue $L; }
      case 2: { $g = 12; continue $L; }
      case 3: { $g = 13; continue $L; }
      default: { $g = 14; continue $L; }
      }
    case 10:
    case 11:
    case 12:
    case 1: // pull_free
      await You(S("pull free from %s."), await mon_nam(G.u.ustuck));
      G.u.ustuck = null;
      { $g = 9; continue $L; };
    case 13:
      if (!G.u.ustuck.mcanmove) {
        G.u.ustuck.mfrozen = 1;
        G.u.ustuck.msleeping = 0;
      }
    case 14:
      if (G.u.ustuck.mtame && !(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !G.u.ustuck.mconf) {
        { $g = 1; continue $L; }
      }
      await You(S("cannot escape from %s!"), await mon_nam(G.u.ustuck));
      nomul(0);
      return;
    case 9:
    case 7:
    case 5:
    case 4:
      mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
      if (mtmp && !(mtmp && mtmp.mtame && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && G.flags.safe_dog && !G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !G.u.uprops[STUNNED].intrinsic)) {
        if (G.context.run && (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && ((mtmp.m_ap_type & 7) !== M_AP_FURNITURE && (mtmp.m_ap_type & 7) !== M_AP_OBJECT || (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
          nomul(0);
          G.context.move = 0;
          return;
        }
      }
    case 2:
      G.u.ux0 = G.u.ux;
      G.u.uy0 = G.u.uy;
      G.bhitpos.x = x;
      G.bhitpos.y = y;
      tmpr = $sat(G.level.locations[x], y);
      if (mtmp) {
        if (!(mtmp && mtmp.mtame && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && G.flags.safe_dog && !G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !G.u.uprops[STUNNED].intrinsic) || G.context.forcefight) {
          nomul(0);
        }
        if (G.context.nopick && !G.context.travel && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) || $at2(G.level.locations, x, y).glyph === 382 + (382 + 0))) {
          if (mtmp.m_ap_type & 7 && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
            await stumble_onto_mimic(mtmp);
          } else if (mtmp.mpeaceful | 0 && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
            await pline(S("Pardon me, %s."), await m_monnam(mtmp));
          } else {
            await You(S("move right into %s."), await mon_nam(mtmp));
          }
          return;
        }
        if (G.context.forcefight || !mtmp.mundetected || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) || ((mtmp.data.mflags1 & 128) >>> 0 !== 0 || mtmp.data.mlet === S_EEL) && !(mtmp && mtmp.mtame && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && G.flags.safe_dog && !G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !G.u.uprops[STUNNED].intrinsic)) {
          if (await attack(mtmp)) {
            return;
          }
        }
      }
      if (G.context.forcefight && $at2(G.level.locations, x, y).typ === IRONBARS && G.uwep) {
        const obj = [null];
        obj[0] = G.uwep;
        if (breaktest(obj[0])) {
          if (obj[0].quan > 1) {
            obj[0] = await splitobj(obj[0], 1);
          } else {
            await setuwep(null);
          }
          await freeinv(obj[0]);
        }
        await hit_bars(P(obj, 0), G.u.ux, G.u.uy, x, y, TRUE, TRUE);
        return;
      }
      if (G.context.forcefight || $at2(G.level.locations, x, y).glyph === 382 + (382 + 0) && !G.context.nopick) {
        let boulder = null;
        let explo = (G.u.umonnum !== G.u.umonster && attacktype(G.youmonst.data, AT_EXPL) ? 1 : 0) << 24 >> 24;
        let solid = (!accessible(x, y) ? 1 : 0) << 24 >> 24;
        let glyph = glyph_at(x, y);
        let buf = new Int8Array(256);
        if (!G.u.uinwater) {
          boulder = sobj_at(BOULDER, x, y);
          if (glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && (glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382)) {
            boulder = sobj_at(STATUE, x, y);
          }
          if (G.context.forcefight && G.uwep && dig_typ(G.uwep, x, y) && !(glyph === 382 + (382 + 0)) && !(glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382)) {
            await use_pick_axe2(G.uwep);
            return;
          }
        }
        await unmap_object(x, y);
        if (boulder) {
          await map_object(boulder, TRUE);
        }
        await newsym(x, y);
        glyph = glyph_at(x, y);
        if (boulder) {
          strcpy(P(buf), await ansimpleoname(boulder));
        } else if (G.u.uinwater | 0 && !is_pool(x, y)) {
          sprintf(P(buf), (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) && $at2(G.level.locations, x, y).typ === AIR ? S("an air bubble") : S("nothing"));
        } else if (solid) {
          strcpy(P(buf), $at2(G.level.locations, x, y).typ === STONE ? S("solid rock") : glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? await the(G.defsyms[glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))].explanation) : S("an unknown obstacle"));
        } else {
          strcpy(P(buf), S("thin air"));
        }
        await You(S("%s%s %s."), !(boulder || solid) ? S("") : !explo ? S("harmlessly ") : S("futilely "), explo ? S("explode at") : S("attack"), P(buf));
        nomul(0);
        if (explo) {
          wake_nearby();
          G.u.mh = -1;
          await rehumanize();
        }
        return;
      }
      await unmap_invisible(x, y);
      if ((G.u.dx || G.u.dy) && G.u.usteed && await stucksteed(FALSE)) {
        nomul(0);
        return;
      }
      if (await u_rooted()) {
        return;
      }
      if (G.u.utrap) {
        let moved = await trapmove(x, y, trap);
        if (!G.u.utrap) {
          await reset_utrap(TRUE);
        }
        if (!moved) {
          return;
        }
      }
      if (!await test_move(G.u.ux, G.u.uy, x - G.u.ux, y - G.u.uy, DO_MOVE)) {
        if (!G.context.door_opened) {
          G.context.move = 0;
          nomul(0);
        }
        return;
      }
      if (!!G.uball) {
        if (!await drag_ball(x, y, P(bc_control, 0), P(ballx, 0), P(bally, 0), P(chainx, 0), P(chainy, 0), P(cause_delay, 0), TRUE)) {
          return;
        }
      }
      if (!await in_out_region(x, y)) {
        return;
      }
      mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
      G.u.ux = G.u.ux + G.u.dx << 24 >> 24;
      G.u.uy = G.u.uy + G.u.dy << 24 >> 24;
      if (G.u.usteed) {
        G.u.usteed.mx = G.u.ux;
        G.u.usteed.my = G.u.uy;
        await exercise_steed();
      }
      if (mtmp && mtmp.mtame && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && G.flags.safe_dog && !G.u.uprops[CONFUSION].intrinsic && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !G.u.uprops[STUNNED].intrinsic && !((mtmp.data.mflags1 & 256) >>> 0 !== 0 && mtmp.mundetected | 0)) {
        if (mtmp.mtrapped) {
          if (!rn2(mtmp.mtame)) {
            mtmp.mtame = (mtmp.mpeaceful = (mtmp.msleeping = 0) & 1) << 24 >> 24;
            if (mtmp.mleashed) {
              await m_unleash(mtmp, TRUE);
            }
            await growl(mtmp);
          } else {
            await yelp(mtmp);
          }
        }
        G.u.ux = G.u.ux0, G.u.uy = G.u.uy0;
        mtmp.mundetected = 0;
        if (mtmp.m_ap_type & 7) {
          await seemimic(mtmp);
        } else if (!mtmp.mtame) {
          await newsym(mtmp.mx, mtmp.my);
        }
        G.u.ux = mtmp.mx, G.u.uy = mtmp.my;
        if (mtmp.mtrapped | 0 && !!(trap = t_at(mtmp.mx, mtmp.my)) && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT) && sobj_at(BOULDER, trap.tx, trap.ty)) {
          G.u.ux = G.u.ux0, G.u.uy = G.u.uy0;
          if (G.u.usteed) {
            G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
          }
        } else if (G.u.ux0 !== x && G.u.uy0 !== y && $sdiff(mtmp.data, G.mons[0]) === 115) {
          G.u.ux = G.u.ux0, G.u.uy = G.u.uy0;
          if (G.u.usteed) {
            G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
          }
          await You(S("stop.  %s can't move diagonally."), upstart(await y_monnam(mtmp)));
        } else if (u_with_boulder && !(mtmp.data.msize < 1 && (!mtmp.minvent || curr_mon_load(mtmp) <= 600))) {
          G.u.ux = G.u.ux0, G.u.uy = G.u.uy0;
          if (G.u.usteed) {
            G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
          }
          await You(S("stop.  %s won't fit into the same spot that you're at."), upstart(await y_monnam(mtmp)));
        } else if (G.u.ux0 !== x && G.u.uy0 !== y && bad_rock(mtmp.data, x, G.u.uy0) && bad_rock(mtmp.data, G.u.ux0, y) && (mtmp.data.msize >= 3 || curr_mon_load(mtmp) > 600)) {
          G.u.ux = G.u.ux0, G.u.uy = G.u.uy0;
          if (G.u.usteed) {
            G.u.usteed.mx = G.u.ux, G.u.usteed.my = G.u.uy;
          }
          await You(S("stop.  %s won't fit through."), upstart(await y_monnam(mtmp)));
        } else {
          let pnambuf = new Int8Array(256);
          strcpy(P(pnambuf), await y_monnam(mtmp));
          mtmp.mtrapped = 0;
          G.level.monsters[x][y] = null;
          await place_monster(mtmp, G.u.ux0, G.u.uy0);
          await newsym(x, y);
          await newsym(G.u.ux0, G.u.uy0);
          await You(S("%s %s."), mtmp.mtame ? S("swap places with") : S("frighten"), P(pnambuf));
          switch (await minliquid(mtmp) ? 2 : await mintrap(mtmp)) {
          case 0:
            break;
          case 1:
          case 3:
            await abuse_dog(mtmp);
            adjalign(-3);
            break;
          case 2:
            {
              let tmp = 0;
              let mndx = 0;
              ++G.u.uconduct.killer;
              mndx = await monsndx(mtmp.data);
              tmp = experience(mtmp, G.mvitals[mndx].died);
              await more_experienced(tmp, 0);
              await newexplevel();
            }
            if (rn2(4)) {
              await You_feel(S("guilty about losing your pet like this."));
              ++G.u.ugangr;
              adjalign(-15);
            }
            break;
          default:
            await pline(S("that's strange, unknown mintrap result!"));
            break;
          }
        }
      }
      reset_occupations();
      if (G.context.run) {
        if (G.context.run < 8) {
          if (tmpr.typ === DOOR || tmpr.typ < POOL || tmpr.typ >= STAIRS && tmpr.typ <= ALTAR) {
            nomul(0);
          }
        }
      }
      if ((G.youmonst.data.mflags1 & 128) >>> 0 !== 0 || G.youmonst.data.mlet === S_EEL || G.u.dx || G.u.dy) {
        hideunder(G.youmonst);
      }
      if ((G.u.dx || G.u.dy) && ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT || (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE)) {
        G.youmonst.m_ap_type = M_AP_NOTHING;
      }
      await check_leash(G.u.ux0, G.u.uy0);
      if (G.u.ux0 !== G.u.ux || G.u.uy0 !== G.u.uy) {
        G.domove_succeeded = G.domove_succeeded | G.domove_attempting & (DOMOVE_RUSH | DOMOVE_WALK);
        G.u.umoved = TRUE;
        await newsym(G.u.ux0, G.u.uy0);
        await vision_recalc(1);
        await invocation_message();
      }
      if (!!G.uball) {
        await move_bc(0, bc_control[0], ballx[0], bally[0], chainx[0], chainy[0]);
      }
      if (G.u.umoved) {
        await spoteffects(TRUE);
      }
      if (cause_delay[0]) {
        nomul(-2);
        G.multi_reason = S("dragging an iron ball");
        G.nomovemsg = S("");
      }
      if (G.context.run && G.flags.runmode !== RUN_TPORT) {
        if (G.flags.runmode !== RUN_LEAP || !(G.moves % 7)) {
          if (G.flags.time) {
            G.context.botl = 1;
          }
          await curs_on_u();
          await G.windowprocs.win_delay_output();
          if (G.flags.runmode === RUN_CRAWL) {
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
            await G.windowprocs.win_delay_output();
          }
        }
      }
    }
    break;
  }
}

async function maybe_smudge_engr(x1: number, y1: number, x2: number, y2: number): Promise<void> {
  let ep = null;
  if (can_reach_floor(TRUE)) {
    if ((ep = engr_at(x1, y1)) && ep.engr_type !== HEADSTONE) {
      await wipe_engr_at(x1, y1, rnd(5), FALSE);
    }
    if ((x2 !== x1 || y2 !== y1) && (ep = engr_at(x2, y2)) && ep.engr_type !== HEADSTONE) {
      await wipe_engr_at(x2, y2, rnd(5), FALSE);
    }
  }
}

export async function overexertion(): Promise<number> {
  await gethungry();
  if (G.moves % 3 !== 0 && near_capacity() >= HVY_ENCUMBER) {
    let hp = !(G.u.umonnum !== G.u.umonster) ? P(G.u, "uhp") : P(G.u, "mh");
    if (hp.a[hp.o] > 1) {
      hp.a[hp.o] -= 1;
    } else {
      await You(S("pass out from exertion!"));
      await exercise(A_CON, FALSE);
      await fall_asleep(-10, FALSE);
    }
  }
  return (G.multi < 0 ? 1 : 0) << 24 >> 24;
}

export async function invocation_message(): Promise<void> {
  if (invocation_pos(G.u.ux, G.u.uy) && !On_stairs(G.u.ux, G.u.uy)) {
    let buf = new Int8Array(256);
    let otmp = carrying(CANDELABRUM_OF_INVOCATION);
    nomul(0);
    if (G.u.usteed) {
      sprintf(P(buf), S("beneath %s"), await y_monnam(G.u.usteed));
    } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      strcpy(P(buf), S("beneath you"));
    } else {
      sprintf(P(buf), S("under your %s"), await makeplural(body_part(FOOT)));
    }
    await You_feel(S("a strange vibration %s."), P(buf));
    G.u.uevent.uvibrated = 1;
    if (otmp && otmp.spe === 7 && otmp.lamplit | 0) {
      await pline(S("%s %s!"), await The(await xname(otmp)), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("throbs palpably") : S("glows with a strange light"));
    }
  }
}

export async function switch_terrain(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let lev = $sat(G.level.locations[G.u.ux], G.u.uy);
  let blocklev = (lev.typ < POOL || closed_door(G.u.ux, G.u.uy) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) && lev.typ === WATER ? 1 : 0) << 24 >> 24;
  let was_levitating = (!!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) ? 1 : 0) << 24 >> 24;
  let was_flying = (!!((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) ? 1 : 0) << 24 >> 24;
  if (blocklev) {
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
      await You_cant(S("levitate in here."));
    }
    ($t1 = G.u.uprops[LEVITATION], $t1.blocked = $t1.blocked | FROMOUTSIDE);
  } else if (G.u.uprops[LEVITATION].blocked) {
    ($t2 = G.u.uprops[LEVITATION], $t2.blocked = $t2.blocked & ~FROMOUTSIDE);
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || G.u.uprops[LEVITATION].blocked) {
      await float_up();
    }
  }
  if (blocklev) {
    if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await You_cant(S("fly in here."));
    }
    ($t3 = G.u.uprops[FLYING], $t3.blocked = $t3.blocked | FROMOUTSIDE);
  } else if (G.u.uprops[FLYING].blocked) {
    ($t4 = G.u.uprops[FLYING], $t4.blocked = $t4.blocked & ~FROMOUTSIDE);
    float_vs_flight();
    if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await You(S("start flying."));
    }
  }
  if ((!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) ? 1 : 0) ^ was_levitating || (!((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) ? 1 : 0) ^ was_flying) {
    G.context.botl = TRUE;
  }
}

export async function pooleffects(newspot: number): Promise<number> {
  if (G.u.uinwater) {
    let still_inwater = FALSE;
    if (!is_pool(G.u.ux, G.u.uy)) {
      if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
        await You(S("pop into an air bubble."));
      } else if (is_lava(G.u.ux, G.u.uy)) {
        await You(S("leave the %s..."), hliquid(S("water")));
      } else {
        await You(S("are on solid %s again."), is_ice(G.u.ux, G.u.uy) ? S("ice") : S("land"));
      }
    } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
      still_inwater = TRUE;
    } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
      await You(S("pop out of the %s like a cork!"), hliquid(S("water")));
    } else if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await You(S("fly out of the %s."), hliquid(S("water")));
    } else if (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
      await You(S("slowly rise above the surface."));
    } else {
      still_inwater = TRUE;
    }
    if (!still_inwater) {
      let was_underwater = (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
      G.u.uinwater = 0;
      if (was_underwater) {
        await docrt();
        G.vision_full_recalc = 1;
      }
    }
  }
  if (!G.u.ustuck && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && is_pool_or_lava(G.u.ux, G.u.uy)) {
    if (G.u.usteed && ((G.u.usteed.data.mflags1 & 1) >>> 0 !== 0 || (G.u.usteed.data.mlet === S_EYE || G.u.usteed.data.mlet === S_LIGHT) || (G.u.usteed.data.mflags1 & 16) >>> 0 !== 0)) {
      return FALSE;
    } else if (G.u.usteed) {
      await dismount_steed(G.u.uinwater | 0 ? DISMOUNT_FELL : DISMOUNT_GENERIC);
      if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
        return FALSE;
      }
      if (newspot) {
        await check_special_room(FALSE);
      }
      return TRUE;
    }
    if (G.u.umonnum !== G.u.umonster && (($sat(G.mons, G.u.umonnum).mflags1 & 256) >>> 0 !== 0 && (($sat(G.mons, G.u.umonnum).mflags1 & 16) >>> 0 !== 0 && $sat(G.mons, G.u.umonnum).mlet !== S_MIMIC || ($sat(G.mons, G.u.umonnum).mflags1 & 1) >>> 0 !== 0)) && G.u.uundetected | 0) {
      return FALSE;
    }
    if (is_lava(G.u.ux, G.u.uy)) {
      if (await lava_effects()) {
        return TRUE;
      }
    } else if (!(G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) && (newspot || !G.u.uinwater || !(G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0 || (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0)))) {
      if (await drown()) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

export async function spoteffects(pick: number): Promise<void> {
  let $g = 0;
  let mtmp = null;
  let trap = null;
  let trapflag = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      trap = t_at(G.u.ux, G.u.uy);
      trapflag = G.iflags.failing_untrap ? FAILEDUNTRAP : 0;
      if (spoteffects$inspoteffects && G.u.ux === spoteffects$spotloc.x && G.u.uy === spoteffects$spotloc.y && spoteffects$spotterrain === $at2(G.level.locations, G.u.ux, G.u.uy).typ && (!spoteffects$spottrap || !trap || trap.ttyp === spoteffects$spottraptyp)) {
        return;
      }
      ++spoteffects$inspoteffects;
      spoteffects$spotterrain = $at2(G.level.locations, G.u.ux, G.u.uy).typ;
      spoteffects$spotloc.x = G.u.ux, spoteffects$spotloc.y = G.u.uy;
      if (spoteffects$spotterrain !== $at2(G.level.locations, G.u.ux0, G.u.uy0).typ || !on_level(G.u.uz, G.u.uz0)) {
        await switch_terrain();
      }
      if (await pooleffects(TRUE)) {
        { $g = 1; continue $L; }
      }
      await check_special_room(FALSE);
      if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === SINK && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
        await dosinkfall();
      }
      if (!G.in_steed_dismounting) {
        let pit = 0;
        if (trap && (G.u.uprops[LEVITATION].intrinsic & TIMEOUT) === 1 && !(G.u.uprops[LEVITATION].extrinsic || G.u.uprops[LEVITATION].intrinsic & ~(I_SPECIAL | TIMEOUT))) {
          if (rn2(2)) {
            incr_itimeout(P(G.u.uprops[LEVITATION], "intrinsic"), 1);
          } else {
            if (await float_down(I_SPECIAL | TIMEOUT, 0)) {
              trap = null;
              pick = FALSE;
            }
          }
        }
        pit = (trap && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT) ? 1 : 0) << 24 >> 24;
        if (pick && !pit) {
          await pickup(1);
        }
        if (trap) {
          if (!spoteffects$spottrap || spoteffects$spottraptyp !== trap.ttyp) {
            spoteffects$spottrap = trap;
            spoteffects$spottraptyp = trap.ttyp;
            await dotrap(trap, trapflag >>> 0);
            spoteffects$spottrap = null;
            spoteffects$spottraptyp = NO_TRAP;
          }
        }
        if (pick && pit) {
          await pickup(1);
        }
      }
      if ((G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) && is_ice(G.u.ux, G.u.uy)) {
        let time_left = spot_time_left(G.u.ux, G.u.uy, MELT_ICE_AWAY);
        if (time_left && time_left < 15) {
          await pline(S("%s"), spoteffects$icewarnings[time_left < 5 ? 2 : time_left < 10 ? 1 : 0]);
        }
      }
      if ((mtmp = !!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null) && !G.u.uswallow) {
        mtmp.mundetected = (mtmp.msleeping = 0) & 1;
        switch (mtmp.data.mlet) {
        case S_PIERCER:
          await pline(S("%s suddenly drops from the %s!"), await Amonnam(mtmp), ceiling(G.u.ux, G.u.uy));
          if (mtmp.mtame) {
            ;
          } else if (G.uarmh && ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL)) {
            await pline(S("Its blow glances off your %s."), helm_simple_name(G.uarmh));
          } else if (G.u.uac + 3 <= rnd(20)) {
            await You(S("are almost hit by %s!"), await x_monnam(mtmp, ARTICLE_A, S("falling"), 0, TRUE));
          } else {
            let dmg = 0;
            await You(S("are hit by %s!"), await x_monnam(mtmp, ARTICLE_A, S("falling"), 0, TRUE));
            dmg = d(4, 6);
            if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) {
              dmg = (dmg + 1) / 2 | 0;
            }
            await mdamageu(mtmp, dmg);
          }
          break;
        default:
          if (mtmp.mtame) {
            await pline(S("%s jumps near you from the %s."), await Amonnam(mtmp), ceiling(G.u.ux, G.u.uy));
          } else if (mtmp.mpeaceful) {
            await You(S("surprise %s!"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? G.c_common_strings.c_something : await a_monnam(mtmp));
            mtmp.mpeaceful = 0;
          } else {
            await pline(S("%s attacks you by surprise!"), await Amonnam(mtmp));
          }
          break;
        }
        await mnexto(mtmp);
      }
    case 1: // spotdone
      if (!--spoteffects$inspoteffects) {
        spoteffects$spotterrain = STONE;
        spoteffects$spotloc.x = spoteffects$spotloc.y = 0;
      }
      return;
    }
    break;
  }
}

function monstinroom(mdat: struct_permonst | null, roomno: number): struct_monst | null {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.data === mdat && strchr(in_rooms(mtmp.mx, mtmp.my, 0), roomno + 3)) {
      return mtmp;
    }
  }
  return null;
}

export function in_rooms(x: number, y: number, typewanted: number): Ptr | null {
  let rno = 0;
  let ptr = P(in_rooms$buf, 4);
  let typefound = 0;
  let min_x = 0;
  let min_y = 0;
  let max_x = 0;
  let max_y_offset = 0;
  let step = 0;
  let lev = null;
  switch (rno = $at2(G.level.locations, x, y).roomno << 24 >> 24) {
  case 0:
    return ptr;
  case 1:
    step = 2;
    break;
  case 2:
    step = 1;
    break;
  default:
    if (!typewanted || (typefound = G.rooms[rno - 3].rtype) === typewanted || typewanted === SHOPBASE && typefound > SHOPBASE) {
      $wr((ptr = ptr.add(-1)), 0, rno);
    }
    return ptr;
  }
  min_x = x - 1;
  max_x = x + 1;
  if (x < 1) {
    min_x += step;
  } else if (x >= COLNO) {
    max_x -= step;
  }
  min_y = y - 1;
  max_y_offset = 2;
  if (min_y < 0) {
    min_y += step;
    max_y_offset -= step;
  } else if (min_y + max_y_offset >= ROWNO) {
    max_y_offset -= step;
  }
  for (x = min_x << 24 >> 24; x <= max_x; x = x + step << 24 >> 24) {
    lev = $sat(G.level.locations[x], min_y);
    y = 0;
    if ((rno = $sadd(lev, y).roomno << 24 >> 24) >= ROOMOFFSET && !strchr(ptr, rno) && (!typewanted || (typefound = G.rooms[rno - 3].rtype) === typewanted || typewanted === SHOPBASE && typefound > SHOPBASE)) {
      $wr((ptr = ptr.add(-1)), 0, rno);
    }
    y = y + step << 24 >> 24;
    if (y > max_y_offset) {
      continue;
    }
    if ((rno = $sadd(lev, y).roomno << 24 >> 24) >= ROOMOFFSET && !strchr(ptr, rno) && (!typewanted || (typefound = G.rooms[rno - 3].rtype) === typewanted || typewanted === SHOPBASE && typefound > SHOPBASE)) {
      $wr((ptr = ptr.add(-1)), 0, rno);
    }
    y = y + step << 24 >> 24;
    if (y > max_y_offset) {
      continue;
    }
    if ((rno = $sadd(lev, y).roomno << 24 >> 24) >= ROOMOFFSET && !strchr(ptr, rno) && (!typewanted || (typefound = G.rooms[rno - 3].rtype) === typewanted || typewanted === SHOPBASE && typefound > SHOPBASE)) {
      $wr((ptr = ptr.add(-1)), 0, rno);
    }
  }
  return ptr;
}

export function in_town(x: number, y: number): number {
  let slev = Is_special(G.u.uz);
  let sroom = null;
  let has_subrooms = FALSE;
  if (!slev || !slev.flags.town) {
    return FALSE;
  }
  for (sroom = G.rooms[0]; sroom.hx > 0; sroom = $sadd(sroom, 1)) {
    if (sroom.nsubrooms > 0) {
      has_subrooms = TRUE;
      if (inside_room(sroom, x, y)) {
        return TRUE;
      }
    }
  }
  return (!has_subrooms ? 1 : 0) << 24 >> 24;
}

function move_update(newlev: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let ptr1 = null;
  let ptr2 = null;
  let ptr3 = null;
  let ptr4 = null;
  strcpy(P(G.u.urooms0), P(G.u.urooms));
  strcpy(P(G.u.ushops0), P(G.u.ushops));
  if (newlev) {
    G.u.urooms[0] = 0;
    G.u.uentered[0] = 0;
    G.u.ushops[0] = 0;
    G.u.ushops_entered[0] = 0;
    strcpy(P(G.u.ushops_left), P(G.u.ushops0));
    return;
  }
  strcpy(P(G.u.urooms), in_rooms(G.u.ux, G.u.uy, 0));
  for (ptr1 = P(G.u.urooms, 0), ptr2 = P(G.u.uentered, 0), ptr3 = P(G.u.ushops, 0), ptr4 = P(G.u.ushops_entered, 0); ptr1.a[ptr1.o]; ptr1 = ptr1.add(1)) {
    if (!strchr(P(G.u.urooms0), ptr1.a[ptr1.o])) {
      $wr(($t1 = ptr2, ptr2 = $t1.add(1), $t1), 0, ptr1.a[ptr1.o]);
    }
    if (G.rooms[ptr1.a[ptr1.o] - 3].rtype >= SHOPBASE) {
      $wr(($t2 = ptr3, ptr3 = $t2.add(1), $t2), 0, ptr1.a[ptr1.o]);
      if (!strchr(P(G.u.ushops0), ptr1.a[ptr1.o])) {
        $wr(($t3 = ptr4, ptr4 = $t3.add(1), $t3), 0, ptr1.a[ptr1.o]);
      }
    }
  }
  ptr2.a[ptr2.o] = 0;
  ptr3.a[ptr3.o] = 0;
  ptr4.a[ptr4.o] = 0;
  for (ptr1 = P(G.u.ushops0, 0), ptr2 = P(G.u.ushops_left, 0); ptr1.a[ptr1.o]; ptr1 = ptr1.add(1)) {
    if (!strchr(P(G.u.ushops), ptr1.a[ptr1.o])) {
      $wr(($t4 = ptr2, ptr2 = $t4.add(1), $t4), 0, ptr1.a[ptr1.o]);
    }
  }
  ptr2.a[ptr2.o] = 0;
}

export async function check_special_room(newlev: number): Promise<void> {
  let mtmp = null;
  let ptr = null;
  move_update(newlev);
  if ($rd(P(G.u.ushops0))) {
    await u_left_shop(P(G.u.ushops_left), newlev);
  }
  if (!$rd(P(G.u.uentered)) && !$rd(P(G.u.ushops_entered))) {
    return;
  }
  if ($rd(P(G.u.ushops_entered))) {
    await u_entered_shop(P(G.u.ushops_entered));
  }
  for (ptr = P(G.u.uentered, 0); ptr.a[ptr.o]; ptr = ptr.add(1)) {
    let roomno = ptr.a[ptr.o] - ROOMOFFSET;
    let rt = G.rooms[roomno].rtype;
    let msg_given = TRUE;
    switch (rt) {
    case ZOO:
      await pline(S("Welcome to David's treasure zoo!"));
      break;
    case SWAMP:
      await pline(S("It %s rather %s down here."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feels") : S("looks"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("humid") : S("muddy"));
      break;
    case COURT:
      await You(S("enter an opulent throne room!"));
      break;
    case LEPREHALL:
      await You(S("enter a leprechaun hall!"));
      break;
    case MORGUE:
      if (midnight()) {
        let run = locomotion(G.youmonst.data, S("Run"));
        await pline(S("%s away!  %s away!"), run, run);
      } else {
        await You(S("have an uncanny feeling..."));
      }
      break;
    case BEEHIVE:
      await You(S("enter a giant beehive!"));
      break;
    case COCKNEST:
      await You(S("enter a disgusting nest!"));
      break;
    case ANTHOLE:
      await You(S("enter an anthole!"));
      break;
    case BARRACKS:
      if (monstinroom($sat(G.mons, PM_SOLDIER), roomno) || monstinroom($sat(G.mons, PM_SERGEANT), roomno) || monstinroom($sat(G.mons, PM_LIEUTENANT), roomno) || monstinroom($sat(G.mons, PM_CAPTAIN), roomno)) {
        await You(S("enter a military barracks!"));
      } else {
        await You(S("enter an abandoned barracks."));
      }
      break;
    case DELPHI:
      {
        let oracle = monstinroom($sat(G.mons, PM_ORACLE), roomno);
        if (oracle) {
          if (!oracle.mpeaceful) {
            await verbalize(S("You're in Delphi, %s."), P(G.plname));
          } else {
            await verbalize(S("%s, %s, welcome to Delphi!"), Hello(null), P(G.plname));
          }
        } else {
          msg_given = FALSE;
        }
        break;
      }
    case TEMPLE:
      await intemple(roomno + ROOMOFFSET);
    default:
      msg_given = (rt === TEMPLE ? 1 : 0) << 24 >> 24;
      rt = 0;
      break;
    }
    if (msg_given) {
      room_discovered(roomno);
    }
    if (rt !== 0) {
      G.rooms[roomno].rtype = OROOM;
      if (!search_special(rt)) {
        switch (rt) {
        case COURT:
          G.level.flags.has_court = 0;
          break;
        case SWAMP:
          G.level.flags.has_swamp = 0;
          break;
        case MORGUE:
          G.level.flags.has_morgue = 0;
          break;
        case ZOO:
          G.level.flags.has_zoo = 0;
          break;
        case BARRACKS:
          G.level.flags.has_barracks = 0;
          break;
        case TEMPLE:
          G.level.flags.has_temple = 0;
          break;
        case BEEHIVE:
          G.level.flags.has_beehive = 0;
          break;
        }
      }
      if (rt === COURT || rt === SWAMP || rt === MORGUE || rt === ZOO) {
        for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
          if (mtmp.mhp < 1) {
            continue;
          }
          if (!((G.u.uprops[STEALTH].intrinsic || G.u.uprops[STEALTH].extrinsic) && !G.u.uprops[STEALTH].blocked) && !rn2(3)) {
            mtmp.msleeping = 0;
          }
        }
      }
    }
  }
  return;
}

export async function pickup_checks(): Promise<number> {
  if (G.u.uswallow) {
    if (!G.u.ustuck.minvent) {
      if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
        await You(S("pick up %s tongue."), s_suffix(await mon_nam(G.u.ustuck)));
        await pline(S("But it's kind of slimy, so you drop it."));
      } else {
        await You(S("don't %s anything in here to pick up."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see"));
      }
      return 1;
    } else {
      return -2;
    }
  }
  if (is_pool(G.u.ux, G.u.uy)) {
    if (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) || (G.youmonst.data.mlet === S_EYE || G.youmonst.data.mlet === S_LIGHT) || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked && !(G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0)) {
      await You(S("cannot dive into the %s to pick things up."), hliquid(S("water")));
      return 0;
    } else if (!G.u.uinwater) {
      await You_cant(S("even see the bottom, let alone pick up %s."), G.c_common_strings.c_something);
      return 0;
    }
  }
  if (is_lava(G.u.ux, G.u.uy)) {
    if (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) || (G.youmonst.data.mlet === S_EYE || G.youmonst.data.mlet === S_LIGHT) || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked && !(G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0)) {
      await You_cant(S("reach the bottom to pick things up."));
      return 0;
    } else if (!(G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326))) {
      await You(S("would burn to a crisp trying to pick things up."));
      return 0;
    }
  }
  if (!!!G.level.objects[G.u.ux][G.u.uy]) {
    let lev = $sat(G.level.locations[G.u.ux], G.u.uy);
    if (lev.typ === THRONE) {
      await pline(S("It must weigh%s a ton!"), lev.flags | 0 ? S(" almost") : S(""));
    } else if (lev.typ === SINK) {
      await pline_The(S("plumbing connects it to the floor."));
    } else if (lev.typ === GRAVE) {
      await You(S("don't need a gravestone.  Yet."));
    } else if (lev.typ === FOUNTAIN) {
      await You(S("could drink the %s..."), hliquid(S("water")));
    } else if (lev.typ === DOOR && (lev.flags | 0) & D_ISOPEN) {
      await pline(S("It won't come off the hinges."));
    } else if (lev.typ === ALTAR) {
      await pline(S("Moving the altar would be a very bad idea."));
    } else if (lev.typ === STAIRS) {
      await pline_The(S("stairs are solidly fixed to the %s."), surface(G.u.ux, G.u.uy));
    } else {
      await There(S("is nothing here to pick up."));
    }
    return 0;
  }
  if (!can_reach_floor(TRUE)) {
    let traphere = t_at(G.u.ux, G.u.uy);
    if (traphere && (uteetering_at_seen_pit(traphere) || uescaped_shaft(traphere))) {
      await You(S("cannot reach the bottom of the %s."), (traphere.ttyp | 0) === PIT || (traphere.ttyp | 0) === SPIKED_PIT ? S("pit") : S("abyss"));
    } else if (G.u.usteed && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
      await rider_cant_reach();
    } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !can_reach_floor(TRUE)) {
      await You(S("cannot reach anything here."));
    } else {
      await You(S("cannot reach the %s."), surface(G.u.ux, G.u.uy));
    }
    return 0;
  }
  return -1;
}

export async function dopickup(): Promise<number> {
  let count = 0;
  const tmpcount = new Int32Array(1);
  let ret = 0;
  count = G.multi || G.save_cm && G.save_cm.a[G.save_cm.o] === cmd_from_func(dopickup) ? G.multi + 1 : 0;
  G.multi = 0;
  if ((ret = await pickup_checks()) >= 0) {
    return ret;
  } else if (ret === -2) {
    tmpcount[0] = -count;
    return await loot_mon(G.u.ustuck, P(tmpcount, 0), null);
  }
  return await pickup(-count);
}

export async function lookaround(): Promise<void> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let i = 0;
  let x0 = 0;
  let y0 = 0;
  let m0 = 0;
  let i0 = 0;
  let corrct = 0;
  let noturn = 0;
  let mtmp = null;
  let trap = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      x0 = 0;
      y0 = 0;
      m0 = 1;
      i0 = 9;
      corrct = 0;
      noturn = 0;
      if (G.u.umonnum === 115 && G.u.dx && G.u.dy) {
        await You(S("cannot move diagonally."));
        nomul(0);
        return;
      }
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.context.run === 0) {
        return;
      }
      x = G.u.ux - 1;
    case 3:
      if (!(x <= G.u.ux + 1)) { $g = 5; continue $L; }
      y = G.u.uy - 1;
    case 6:
      if (!(y <= G.u.uy + 1)) { $g = 8; continue $L; }
      if (!isok(x, y) || x === G.u.ux && y === G.u.uy) {
        { $g = 7; continue $L; };
      }
      if (G.u.umonnum === 115 && x !== G.u.ux && y !== G.u.uy) {
        { $g = 7; continue $L; };
      }
      if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (mtmp.m_ap_type & 7) !== M_AP_FURNITURE && (mtmp.m_ap_type & 7) !== M_AP_OBJECT && (!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) {
        if (G.context.run !== 1 && !mtmp.mtame || x === G.u.ux + G.u.dx && y === G.u.uy + G.u.dy && !G.context.travel) {
          if (G.iflags.mention_walls) {
            await pline(S("%s blocks your path."), upstart(await a_monnam(mtmp)));
          }
          { $g = 1; continue $L; }
        }
      }
      if ($at2(G.level.locations, x, y).typ === STONE) {
        { $g = 7; continue $L; };
      }
      if (x === G.u.ux - G.u.dx && y === G.u.uy - G.u.dy) {
        { $g = 7; continue $L; };
      }
      if (!($at2(G.level.locations, x, y).typ < POOL || $at2(G.level.locations, x, y).typ === ROOM || ($at2(G.level.locations, x, y).typ === AIR || $at2(G.level.locations, x, y).typ === CLOUD))) { $g = 10; continue $L; }
      {
        { $g = 7; continue $L; };
      }
      { $g = 9; continue $L; }
    case 10:
      if (!(closed_door(x, y) || mtmp && ((mtmp.m_ap_type & 7) === M_AP_FURNITURE && (mtmp.mappearance === S_hcdoor || mtmp.mappearance === S_vcdoor)))) { $g = 12; continue $L; }
      {
        if (x !== G.u.ux && y !== G.u.uy) {
          { $g = 7; continue $L; };
        }
        if (G.context.run !== 1) {
          if (G.iflags.mention_walls) {
            await You(S("stop in front of the door."));
          }
          { $g = 1; continue $L; }
        }
        { $g = 2; continue $L; }
      }
      { $g = 11; continue $L; }
    case 12:
      if (!($at2(G.level.locations, x, y).typ === CORR)) { $g = 14; continue $L; }
    case 2: // bcorr
      if ($at2(G.level.locations, G.u.ux, G.u.uy).typ !== ROOM) {
        if (G.context.run === 1 || G.context.run === 3 || G.context.run === 8) {
          i = dist2(x, y, G.u.ux + G.u.dx, G.u.uy + G.u.dy);
          if (i > 2) {
            { $g = 7; continue $L; };
          }
          if (corrct === 1 && dist2(x, y, x0, y0) !== 1) {
            noturn = 1;
          }
          if (i < i0) {
            i0 = i;
            x0 = x;
            y0 = y;
            m0 = mtmp ? 1 : 0;
          }
        }
        ++corrct;
      }
      { $g = 7; continue $L; };
      { $g = 13; continue $L; }
    case 14:
      if ((trap = t_at(x, y)) && trap.tseen | 0) {
        if (G.context.run === 1) {
          { $g = 2; continue $L; }
        }
        if (x === G.u.ux + G.u.dx && y === G.u.uy + G.u.dy) {
          if (G.iflags.mention_walls) {
            let tt = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : trap.ttyp | 0;
            await You(S("stop in front of %s."), await an(G.defsyms[S_arrow_trap + tt - 1].explanation));
          }
          { $g = 1; continue $L; }
        }
        { $g = 7; continue $L; };
      } else if (is_pool_or_lava(x, y)) {
        if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !((G.youmonst.data.mflags1 & 16) >>> 0 !== 0) && x === G.u.ux + G.u.dx && y === G.u.uy + G.u.dy) {
          if (G.iflags.mention_walls) {
            await You(S("stop at the edge of the %s."), hliquid(is_pool(x, y) ? S("water") : S("lava")));
          }
          { $g = 1; continue $L; }
        }
        { $g = 7; continue $L; };
      } else {
        if (G.context.run === 1) {
          { $g = 2; continue $L; }
        }
        if (G.context.run === 8) {
          { $g = 7; continue $L; };
        }
        if (mtmp) {
          { $g = 7; continue $L; };
        }
        if (x === G.u.ux - G.u.dx && y !== G.u.uy + G.u.dy || y === G.u.uy - G.u.dy && x !== G.u.ux + G.u.dx) {
          { $g = 7; continue $L; };
        }
      }
    case 13:
    case 11:
    case 9:
    case 1: // stop
      nomul(0);
      return;
    case 7:
      ++y;
      { $g = 6; continue $L; }
    case 8:
    case 4:
      ++x;
      { $g = 3; continue $L; }
    case 5:
      if (corrct > 1 && G.context.run === 2) {
        if (G.iflags.mention_walls) {
          await pline_The(S("corridor widens here."));
        }
        { $g = 1; continue $L; }
      }
      if ((G.context.run === 1 || G.context.run === 3 || G.context.run === 8) && !noturn && !m0 && i0 && (corrct === 1 || corrct === 2 && i0 === 1)) {
        if (i0 === 2) {
          if (G.u.dx === y0 - G.u.uy && G.u.dy === G.u.ux - x0) {
            i = 2;
          } else {
            i = -2;
          }
        } else if (G.u.dx && G.u.dy) {
          if (G.u.dx === G.u.dy && y0 === G.u.uy || G.u.dx !== G.u.dy && y0 !== G.u.uy) {
            i = -1;
          } else {
            i = 1;
          }
        } else {
          if (x0 - G.u.ux === y0 - G.u.uy && !G.u.dy || x0 - G.u.ux !== y0 - G.u.uy && G.u.dy) {
            i = 1;
          } else {
            i = -1;
          }
        }
        i += G.u.last_str_turn;
        if (i <= 2 && i >= -2) {
          G.u.last_str_turn = i;
          G.u.dx = x0 - G.u.ux << 24 >> 24;
          G.u.dy = y0 - G.u.uy << 24 >> 24;
        }
      }
    }
    break;
  }
}

function doorless_door(x: number, y: number): number {
  let lev_p = $sat(G.level.locations[x], y);
  if (!(lev_p.typ === DOOR)) {
    return FALSE;
  }
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    return FALSE;
  }
  return (!((lev_p.flags | 0) & ~(D_NODOOR | D_BROKEN)) ? 1 : 0) << 24 >> 24;
}

export async function crawl_destination(x: number, y: number): Promise<number> {
  if (!goodpos(x, y, G.youmonst, 0)) {
    return FALSE;
  }
  if (x === G.u.ux || y === G.u.uy) {
    return TRUE;
  }
  if (G.u.umonnum === 115) {
    return FALSE;
  }
  if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
    return TRUE;
  }
  if ($at2(G.level.locations, x, y).typ === DOOR && (!doorless_door(x, y) || await block_door(x, y))) {
    return FALSE;
  }
  return (!(bad_rock(G.youmonst.data, G.u.ux, y) && bad_rock(G.youmonst.data, x, G.u.uy)) ? 1 : 0) << 24 >> 24;
}

export function monster_nearby(): number {
  let x = 0;
  let y = 0;
  let mtmp = null;
  for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
    for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
      if (!isok(x, y) || x === G.u.ux && y === G.u.uy) {
        continue;
      }
      if ((mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (mtmp.m_ap_type & 7) !== M_AP_FURNITURE && (mtmp.m_ap_type & 7) !== M_AP_OBJECT && (!mtmp.mpeaceful || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && (!((mtmp.data.mflags1 & 256) >>> 0 !== 0) || !mtmp.mundetected) && !noattacks(mtmp.data) && mtmp.mcanmove | 0 && !mtmp.msleeping && !onscary(G.u.ux, G.u.uy, mtmp) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        return 1;
      }
    }
  }
  return 0;
}

export function nomul(nval: number): void {
  if (G.multi < nval) {
    return;
  }
  G.u.uinvulnerable = (FALSE) & 1;
  G.u.usleep = 0;
  G.multi = nval;
  if (nval === 0) {
    G.multi_reason = null;
  }
  G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
}

export async function unmul(msg_override: Ptr | null): Promise<void> {
  G.multi = 0;
  if (msg_override) {
    G.nomovemsg = msg_override;
  } else if (!G.nomovemsg) {
    G.nomovemsg = G.c_common_strings.c_You_can_move_again;
  }
  if (G.nomovemsg.a[G.nomovemsg.o]) {
    await pline(S("%s"), G.nomovemsg);
    if (G.u.umonnum !== G.u.umonster && !strncmpi(G.nomovemsg, S("You survived that "), 18)) {
      await You(S("are %s."), await an(G.mons[G.u.umonnum].mname));
    }
  }
  G.nomovemsg = null;
  G.u.usleep = 0;
  G.multi_reason = null;
  if (G.afternmv) {
    let f = G.afternmv;
    G.afternmv = null;
    await f();
    update_inventory();
  }
}

async function maybe_wail(): Promise<void> {
  if (G.moves <= G.wailmsg + 50) {
    return;
  }
  G.wailmsg = G.moves;
  if (G.urole.malenum === 342 || G.urace.malenum === 260 || G.urole.malenum === 341) {
    let who = null;
    let i = 0;
    let powercnt = 0;
    who = G.urole.malenum === 342 || G.urole.malenum === 341 ? G.urole.name.m : S("Elf");
    if (G.u.uhp === 1) {
      await pline(S("%s is about to die."), who);
    } else {
      for (i = 0, powercnt = 0; i < (Math.trunc(24 / 2) | 0); ++i) {
        if (G.u.uprops[maybe_wail$powers[i]].intrinsic & INTRINSIC) {
          ++powercnt;
        }
      }
      await pline(powercnt >= 4 ? S("%s, all your powers will be lost...") : S("%s, your life force is running out."), who);
    }
  } else {
    await You_hear(G.u.uhp === 1 ? S("the wailing of the Banshee...") : S("the howling of the CwnAnnwn..."));
  }
}

export async function losehp(n: number, knam: Ptr | null, k_format: number): Promise<void> {
  if (G.u.umonnum !== G.u.umonster) {
    G.u.mh -= n;
    if (G.u.mhmax < G.u.mh) {
      G.u.mhmax = G.u.mh;
    }
    G.context.botl = 1;
    if (G.u.mh < 1) {
      await rehumanize();
    } else if (n > 0 && G.u.mh * 10 < G.u.mhmax && (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
      await maybe_wail();
    }
    return;
  }
  G.u.uhp -= n;
  if (G.u.uhp > G.u.uhpmax) {
    G.u.uhpmax = G.u.uhp;
  } else {
    G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
  }
  G.context.botl = 1;
  if (G.u.uhp < 1) {
    G.killer.format = k_format;
    if (!$peq(P(G.killer.name), knam)) {
      strcpy(P(G.killer.name), knam ? knam : S(""));
    }
    await You(S("die..."));
    await done(DIED);
  } else if (n > 0 && G.u.uhp * 10 < G.u.uhpmax) {
    await maybe_wail();
  }
}

export function weight_cap(): number {
  let $t1: any, $t2: any;
  let carrcap = 0;
  let save_ELev = G.u.uprops[LEVITATION].extrinsic;
  let save_BLev = G.u.uprops[LEVITATION].blocked;
  if (G.afternmv === Boots_on && (G.u.uprops[LEVITATION].extrinsic & W_ARMF) !== 0) {
    ($t1 = G.u.uprops[LEVITATION], $t1.extrinsic = $t1.extrinsic & ~W_ARMF);
    float_vs_flight();
  }
  ($t2 = G.u.uprops[LEVITATION], $t2.blocked = $t2.blocked & ~I_SPECIAL);
  carrcap = 25 * (acurrstr() + acurr(A_CON)) + 50;
  if (G.u.umonnum !== G.u.umonster) {
    if (G.youmonst.data.mlet === S_NYMPH) {
      carrcap = MAX_CARR_CAP;
    } else if (!G.youmonst.data.cwt) {
      carrcap = Math.trunc(carrcap * G.youmonst.data.msize / MZ_HUMAN);
    } else if (!((G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0) || (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 && G.youmonst.data.cwt > WT_HUMAN) {
      carrcap = Math.trunc(carrcap * G.youmonst.data.cwt / WT_HUMAN);
    }
  }
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || G.u.usteed && (G.u.usteed.data.mflags2 & 67108864) >>> 0 !== 0) {
    carrcap = MAX_CARR_CAP;
  } else {
    if (carrcap > MAX_CARR_CAP) {
      carrcap = MAX_CARR_CAP;
    }
    if (!((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
      if (G.u.uprops[WOUNDED_LEGS].extrinsic & LEFT_SIDE) {
        carrcap -= 100;
      }
      if (G.u.uprops[WOUNDED_LEGS].extrinsic & RIGHT_SIDE) {
        carrcap -= 100;
      }
    }
    if (carrcap < 0) {
      carrcap = 0;
    }
  }
  if (G.u.uprops[LEVITATION].extrinsic !== save_ELev || G.u.uprops[LEVITATION].blocked !== save_BLev) {
    G.u.uprops[LEVITATION].extrinsic = save_ELev;
    G.u.uprops[LEVITATION].blocked = save_BLev;
    float_vs_flight();
  }
  return carrcap | 0;
}

export function inv_weight(): number {
  let otmp = G.invent;
  let wt = 0;
  while (otmp) {
    if (otmp.oclass === COIN_CLASS) {
      wt += Math.trunc((otmp.quan + 50) / 100) | 0;
    } else if (otmp.otyp !== BOULDER || !((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0)) {
      wt += otmp.owt;
    }
    otmp = otmp.nobj;
  }
  wc = weight_cap();
  return wt - wc;
}

export function calc_capacity(xtra_wt: number): number {
  let cap = 0;
  let wt = inv_weight() + xtra_wt;
  if (wt <= 0) {
    return UNENCUMBERED;
  }
  if (wc <= 1) {
    return OVERLOADED;
  }
  cap = (wt * 2 / wc | 0) + 1;
  return cap < OVERLOADED ? cap : OVERLOADED;
}

export function near_capacity(): number {
  return calc_capacity(0);
}

export function max_capacity(): number {
  let wt = inv_weight();
  return wt - 2 * wc;
}

export async function check_capacity(str: Ptr | null): Promise<number> {
  if (near_capacity() >= EXT_ENCUMBER) {
    if (str) {
      await pline(S("%s"), str);
    } else {
      await You_cant(S("do that while carrying so much stuff."));
    }
    return 1;
  }
  return 0;
}

export function inv_cnt(incl_gold: number): number {
  let otmp = G.invent;
  let ct = 0;
  while (otmp) {
    if (incl_gold || otmp.invlet !== GOLD_SYM) {
      ++ct;
    }
    otmp = otmp.nobj;
  }
  return ct;
}

export function money_cnt(otmp: struct_obj | null): number {
  while (otmp) {
    if (otmp.oclass === COIN_CLASS) {
      return otmp.quan;
    }
    otmp = otmp.nobj;
  }
  return 0;
}

export function $init(): void {
  tmp_anything = new union_any();
  fell_on_sink = $cs("fell onto a sink", 17);
  wc = 0;
  moverock$lastmovetime = 0;
  findtravelpath$ordered = $ta(Int32Array, 8, [0, 2, 4, 6, 1, 3, 5, 7]);
  domove_core$skates = 0;
  spoteffects$inspoteffects = 0;
  spoteffects$spotloc = new struct_nhcoord();
  spoteffects$spotterrain = 0;
  spoteffects$spottrap = null;
  spoteffects$spottraptyp = NO_TRAP;
  spoteffects$icewarnings = [S("The ice seems very soft and slushy."), S("You feel the ice shift beneath you!"), S("The ice, is gonna BREAK!")];
  in_rooms$buf = new Int8Array(5);
  maybe_wail$powers = $ta(Int16Array, 12, [TELEPORT, SEE_INVIS, POISON_RES, COLD_RES, SHOCK_RES, FIRE_RES, SLEEP_RES, DISINT_RES, TELEPORT_CONTROL, STEALTH, FAST, INVIS]);
}
