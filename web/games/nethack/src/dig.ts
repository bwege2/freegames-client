// @ts-nocheck
// NetHack 3.6.7 dig.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { next_to_u, o_unleash } from './apply.ts';
import { acurr, acurrstr, adjalign, exercise } from './attrib.ts';
import { confdir, dxdy_moveok, getdir, isok, movecmd, set_occupation } from './cmd.ts';
import { destroy_drawbridge, find_drawbridge, is_db_wall, is_drawbridge_wall, is_ice, is_lava, is_moat, is_pool, is_pool_or_lava } from './dbridge.ts';
import { cvt_sdoor_to_door } from './detect.ts';
import { feel_newsym, flush_screen, newsym, tmp_at } from './display.ts';
import { dropx, goto_level, set_wounded_legs } from './do.ts';
import { Monnam, hliquid, mon_nam } from './do_name.ts';
import { migrate_to_level } from './dog.ts';
import { impact_drop } from './dokick.ts';
import { Can_dig_down, Is_botlevel, On_stairs, assign_level, depth, get_level, ledger_no, on_level } from './dungeon.ts';
import { can_reach_floor, cant_reach_floor, ceiling, del_engr_at, surface, u_wipe_engr } from './engrave.ts';
import { debugcore } from './files.ts';
import { breaksink, dogushforth, dryup } from './fountain.ts';
import { in_rooms, in_town, losehp, may_dig, nomul, obj_to_any, spoteffects, switch_terrain } from './hack.ts';
import { dist2, s_suffix, sgn } from './hacklib.ts';
import { currency, delobj, sobj_at, stackobj, update_inventory } from './invent.ts';
import { makemon, mkclass } from './makemon.ts';
import { expels } from './mhitu.ts';
import { add_to_buried, mk_tt_object, mksobj_at, obj_extract_self, place_object, rnd_treefruit_at } from './mkobj.ts';
import { angry_guards, hideunder, wake_nearby } from './mon.ts';
import { closed_door, mb_trapped } from './monmove.ts';
import { Yobjnam2, corpse_xname, otense, the, xname, yname, yobjnam } from './objnam.ts';
import { pickup } from './pickup.ts';
import { There, You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart } from './polyself.ts';
import { altar_wrath } from './pray.ts';
import { angry_priest } from './priest.ts';
import { punish, unpunish } from './read.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { add_damage, costly_spot, make_angry_shk, obfree, pay_for_damage, shop_keeper, shopdig, stolen_value } from './shk.ts';
import { rloc, teleport_pet } from './teleport.ts';
import { end_burn, start_timer, stop_timer } from './timeout.ts';
import { b_trapped, cnv_trap_obj, conjoined_pits, delfloortrap, deltrap, dotrap, drown, feeltrap, lava_effects, maketrap, mintrap, reset_utrap, seetrap, set_utrap, t_at, uescaped_shaft, uteetering_at_seen_pit } from './trap.ts';
import { attack } from './uhitm.ts';
import { does_block, unblock_point } from './vision.ts';
import { abon, dbon, dmgval, setmnotwielded } from './weapon.ts';
import { uqwepgone, uswapwepgone, uwepgone, welded, wield_tool } from './wield.ts';
import { count_wsegs, worm_known } from './worm.ts';
import { break_statue, fracture_rock, obj_resists } from './zap.ts';
import { struct_d_level, struct_monst, struct_nhcoord, struct_obj, struct_trap, union_any } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, memset, sprintf, strcpy } from './rt/index.ts';
import { ALTAR, A_CHA, A_CON, A_DEX, A_INT, A_LAWFUL, A_STR, A_WIS, BEARTRAP, BEAR_TRAP, BLINDED, BOULDER, COIN_CLASS, COLNO, CONFUSION, CORPSE, CORR, COULD_SEE, CXN_NO_PFX, DBWALL, DB_LAVA, DB_MOAT, DB_UNDER, DEAF, DIGTYP_BOULDER, DIGTYP_DOOR, DIGTYP_ROCK, DIGTYP_STATUE, DIGTYP_TREE, DIGTYP_UNDIGGABLE, DISP_BEAM, DISP_END, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_BROKEN, D_NODOOR, D_TRAPPED, FALSE, FLYING, FOOT, FORCEBUNGLE, FORCETRAP, FOUNTAIN, FUMBLING, GRAVE, HALF_PHDAM, HALLUC, HALLUC_RES, HEAD, HEAVY_IRON_BALL, HOLE, INFRAVISION, INVIS, IN_SIGHT, IRON, IRONBARS, KILLED_BY, KILLED_BY_AN, LANDMINE, LAND_MINE, LAVAPOOL, LEASH, LEVITATION, MAGIC_PORTAL, MIGR_RANDOM, MITHRIL, MOAT, MZ_HUGE, NO_MM_FLAGS, OBJ_FLOOR, OBJ_INVENT, OBJ_MIGRATING, OBJ_MINVENT, PIT, PM_EARTH_ELEMENTAL, PM_WUMPUS, PM_XORN, POOL, POTION_CLASS, POT_OIL, P_AXE, P_PICK_AXE, RIGHT_SIDE, ROCK, ROOM, ROT_ORGANIC, SCORR, SDOOR, SEE_INVIS, SHOPBASE, SHOP_DOOR_COST, SHOP_WALL_COST, SINK, SPIKED_PIT, STATUE, STOMACH, STONE, STRIDENT, STUNNED, S_EYE, S_LIGHT, S_MUMMY, S_VORTEX, S_ZOMBIE, S_arrow_trap, S_digbeam, THRONE, TIMER_OBJECT, TOOL_CLASS, TRAPDOOR, TREE, TRUE, TT_BURIEDBALL, TT_INFLOOR, TT_PIT, TT_WEB, VIBRATING_SQUARE, WEAPON_CLASS, WEB, WOOD, WWALKING, W_NONDIGGABLE } from './consts.ts';

let did_dig_msg: number;
let dig$d_target: any;
let use_pick_axe2$d_action: any;
let draft_message$draft_reaction: any;

function rm_waslit(): number {
  let x = 0;
  let y = 0;
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ROOM && $at2(G.level.locations, G.u.ux, G.u.uy).waslit | 0) {
    return TRUE;
  }
  for (x = G.u.ux - 2 << 24 >> 24; x < G.u.ux + 3; x = x + 1 << 24 >> 24) {
    for (y = G.u.uy - 1 << 24 >> 24; y < G.u.uy + 2; y = y + 1 << 24 >> 24) {
      if (isok(x, y) && $at2(G.level.locations, x, y).waslit | 0) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

async function mkcavepos(x: number, y: number, dist: number, waslit: number, rockit: number): Promise<void> {
  let lev = null;
  if (!isok(x, y)) {
    return;
  }
  lev = $sat(G.level.locations[x], y);
  if (rockit) {
    let mtmp = null;
    if (lev.typ < POOL) {
      return;
    }
    if (t_at(x, y)) {
      return;
    }
    if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
      if (!((mtmp.data.mflags1 & 8) >>> 0 !== 0)) {
        await rloc(mtmp, TRUE);
      }
    }
  } else if (lev.typ === ROOM) {
    return;
  }
  unblock_point(x, y);
  lev.seenv = 0;
  lev.flags = 0;
  if (dist < 3) {
    lev.lit = ((rockit ? FALSE : TRUE) >>> 0) & 1;
  }
  if (waslit) {
    lev.waslit = ((rockit ? FALSE : TRUE) >>> 0) & 1;
  }
  lev.horizontal = (FALSE) & 1;
  $wr(G.viz_array.a[G.viz_array.o + y], x, (dist < 3 ? IN_SIGHT | COULD_SEE : COULD_SEE) << 24 >> 24);
  lev.typ = (rockit ? STONE : ROOM) << 24 >> 24;
  if (dist >= 3) {
    await impossible(S("mkcavepos called with dist %d"), dist);
  }
  await feel_newsym(x, y);
}

async function mkcavearea(rockit: number): Promise<void> {
  let dist = 0;
  let xmin = G.u.ux;
  let xmax = G.u.ux;
  let ymin = G.u.uy;
  let ymax = G.u.uy;
  let i = 0;
  let waslit = rm_waslit();
  if (rockit) {
    await pline(S("Crash!  The ceiling collapses around you!"));
  } else {
    await pline(S("A mysterious force %s cave around you!"), $at2(G.level.locations, G.u.ux, G.u.uy).typ === CORR ? S("creates a") : S("extends the"));
  }
  await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
  for (dist = 1; dist <= 2; ++dist) {
    xmin = xmin - 1 << 24 >> 24;
    xmax = xmax + 1 << 24 >> 24;
    if (dist < 2) {
      ymin = ymin - 1 << 24 >> 24;
      ymax = ymax + 1 << 24 >> 24;
      for (i = xmin + 1 << 24 >> 24; i < xmax; i = i + 1 << 24 >> 24) {
        await mkcavepos(i, ymin, dist, waslit, rockit);
        await mkcavepos(i, ymax, dist, waslit, rockit);
      }
    }
    for (i = ymin; i <= ymax; i = i + 1 << 24 >> 24) {
      await mkcavepos(xmin, i, dist, waslit, rockit);
      await mkcavepos(xmax, i, dist, waslit, rockit);
    }
    await flush_screen(1);
    await G.windowprocs.win_delay_output();
  }
  if (!rockit && $at2(G.level.locations, G.u.ux, G.u.uy).typ === CORR) {
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = ROOM;
    if (waslit) {
      $at2(G.level.locations, G.u.ux, G.u.uy).waslit = (TRUE) & 1;
    }
    await newsym(G.u.ux, G.u.uy);
  }
  G.vision_full_recalc = 1;
}

export function dig_typ(otmp: struct_obj | null, x: number, y: number): number {
  let ispick = 0;
  if (!otmp) {
    return DIGTYP_UNDIGGABLE;
  }
  ispick = ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp === P_PICK_AXE ? 1 : 0) << 24 >> 24;
  if (!ispick && !((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp === P_AXE)) {
    return DIGTYP_UNDIGGABLE;
  }
  return ispick && sobj_at(STATUE, x, y) ? DIGTYP_STATUE : ispick && sobj_at(BOULDER, x, y) ? DIGTYP_BOULDER : closed_door(x, y) ? DIGTYP_DOOR : $at2(G.level.locations, x, y).typ === TREE || G.level.flags.arboreal | 0 && $at2(G.level.locations, x, y).typ === STONE ? ispick ? DIGTYP_UNDIGGABLE : DIGTYP_TREE : ispick && $at2(G.level.locations, x, y).typ < POOL && (!G.level.flags.arboreal || $at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL) ? DIGTYP_ROCK : DIGTYP_UNDIGGABLE;
}

export function is_digging(): number {
  if (G.occupation === dig) {
    return TRUE;
  }
  return FALSE;
}

export async function dig_check(madeby: struct_monst | null, verbose: number, x: number, y: number): Promise<number> {
  let ttmp = t_at(x, y);
  let verb = madeby === G.youmonst && G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_AXE) ? S("chop") : S("dig in");
  if (On_stairs(x, y)) {
    if (x === G.dnladder.sx || x === G.upladder.sx) {
      if (verbose) {
        await pline_The(S("ladder resists your effort."));
      }
    } else if (verbose) {
      await pline_The(S("stairs are too hard to %s."), verb);
    }
    return FALSE;
  } else if ($at2(G.level.locations, x, y).typ === THRONE && !!madeby) {
    if (verbose) {
      await pline_The(S("throne is too hard to break apart."));
    }
    return FALSE;
  } else if ($at2(G.level.locations, x, y).typ === ALTAR && (!!madeby || (G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level))) {
    if (verbose) {
      await pline_The(S("altar is too hard to break apart."));
    }
    return FALSE;
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
    if (verbose) {
      await You(S("cannot %s thin air."), verb);
    }
    return FALSE;
  } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    if (verbose) {
      await pline_The(S("%s splashes and subsides."), hliquid(S("water")));
    }
    return FALSE;
  } else if ($at2(G.level.locations, x, y).typ < POOL && $at2(G.level.locations, x, y).typ !== SDOOR && (($at2(G.level.locations, x, y).flags | 0) & W_NONDIGGABLE) !== 0 || ttmp && ((ttmp.ttyp | 0) === MAGIC_PORTAL || (ttmp.ttyp | 0) === VIBRATING_SQUARE || !Can_dig_down(G.u.uz) && !$at2(G.level.locations, x, y).candig)) {
    if (verbose) {
      await pline_The(S("%s here is too hard to %s."), surface(x, y), verb);
    }
    return FALSE;
  } else if (sobj_at(BOULDER, x, y)) {
    if (verbose) {
      await There(S("isn't enough room to %s here."), verb);
    }
    return FALSE;
  } else if (!madeby && (ttmp || is_pool_or_lava(x, y))) {
    return FALSE;
  }
  return TRUE;
}

async function dig(): Promise<number> {
  let $g = 0;
  let lev = null;
  let dpx = 0;
  let dpy = 0;
  let ispick = 0;
  let verb = null;
  let digtxt = null;
  let dmgtxt = null;
  let obj = null;
  let shopedge = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      dpx = G.context.digging.pos.x;
      dpy = G.context.digging.pos.y;
      ispick = (G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_PICK_AXE) ? 1 : 0) << 24 >> 24;
      verb = !G.uwep || (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_PICK_AXE ? S("dig into") : S("chop through");
      lev = $sat(G.level.locations[dpx], dpy);
      if (G.u.uswallow | 0 || !G.uwep || !ispick && !((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_AXE) || !on_level(G.context.digging.level, G.u.uz) || (G.context.digging.down ? dpx !== G.u.ux || dpy !== G.u.uy ? 1 : 0 : dist2(dpx, dpy, G.u.ux, G.u.uy) > 2 ? 1 : 0)) {
        return 0;
      }
      if (G.context.digging.down) {
        if (!await dig_check(G.youmonst, TRUE, G.u.ux, G.u.uy)) {
          return 0;
        }
      } else {
        if ((lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) && !may_dig(dpx, dpy) && dig_typ(G.uwep, dpx, dpy) === DIGTYP_TREE) {
          await pline(S("This tree seems to be petrified."));
          return 0;
        }
        if (lev.typ < POOL && !may_dig(dpx, dpy) && dig_typ(G.uwep, dpx, dpy) === DIGTYP_ROCK) {
          await pline(S("This %s is too hard to %s."), is_db_wall(dpx, dpy) ? S("drawbridge") : S("wall"), verb);
          return 0;
        }
      }
      if ((G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) && !rn2(3)) {
        switch (rn2(3)) {
        case 0:
          if (!welded(G.uwep)) {
            await You(S("fumble and drop %s."), await yname(G.uwep));
            await dropx(G.uwep);
          } else {
            if (G.u.usteed) {
              await pline(S("%s and %s %s!"), await Yobjnam2(G.uwep, S("bounce")), otense(G.uwep, S("hit")), await mon_nam(G.u.usteed));
            } else {
              await pline(S("Ouch!  %s and %s you!"), await Yobjnam2(G.uwep, S("bounce")), otense(G.uwep, S("hit")));
            }
            await set_wounded_legs(RIGHT_SIDE, 5 + rnd(5));
          }
          break;
        case 1:
          await pline(S("Bang!  You hit with the broad side of %s!"), await the(await xname(G.uwep)));
          break;
        default:
          await Your(S("swing misses its mark."));
          break;
        }
        return 0;
      }
      G.context.digging.effort += 10 + rn2(5) + abon() + G.uwep.spe - ((G.uwep.oeroded | 0) > (G.uwep.oeroded2 | 0) ? G.uwep.oeroded | 0 : G.uwep.oeroded2 | 0) + G.u.udaminc;
      if (G.urace.malenum === 43) {
        G.context.digging.effort = G.context.digging.effort * 2;
      }
      if (G.context.digging.down) {
        let ttmp = t_at(dpx, dpy);
        if (G.context.digging.effort > 250 || ttmp && (ttmp.ttyp | 0) === HOLE) {
          await dighole(FALSE, FALSE, null);
          memset(G.context.digging, 0, 24);
          return 0;
        }
        if (G.context.digging.effort <= 50 || ttmp && ((ttmp.ttyp | 0) === TRAPDOOR || ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT))) {
          return 1;
        } else if (ttmp && ((ttmp.ttyp | 0) === LANDMINE || (ttmp.ttyp | 0) === BEAR_TRAP && !G.u.utrap)) {
          await dotrap(ttmp, FORCETRAP);
          memset(G.context.digging, 0, 24);
          return 0;
        } else if (ttmp && (ttmp.ttyp | 0) === BEAR_TRAP && G.u.utrap) {
          if (rnl(7) > (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic ? 1 : 4)) {
            let kbuf = new Int8Array(256);
            let dmg = await dmgval(G.uwep, G.youmonst) + dbon();
            if (dmg < 1) {
              dmg = 1;
            } else if (G.uarmf) {
              dmg = (dmg + 1) / 2 | 0;
            }
            await You(S("hit yourself in the %s."), body_part(FOOT));
            sprintf(P(kbuf), S("chopping off %s own %s"), G.genders[G.flags.female ? 1 : 0].his, body_part(FOOT));
            await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, P(kbuf), KILLED_BY);
          } else {
            await You(S("destroy the bear trap with %s."), await yobjnam(G.uwep, null));
            await deltrap(ttmp);
            await reset_utrap(TRUE);
          }
          G.context.digging.effort = 0;
          return 0;
        }
        if (lev.typ === ALTAR) {
          await altar_wrath(dpx, dpy);
          await angry_priest();
        }
        if (await dighole(TRUE, FALSE, null)) {
          G.context.digging.level.dnum = 0;
          G.context.digging.level.dlevel = -1;
        }
        return 0;
      }
      if (!(G.context.digging.effort > 100)) { $g = 3; continue $L; }
      dmgtxt = null;
      shopedge = $rd(in_rooms(dpx, dpy, SHOPBASE));
      if (!!(obj = sobj_at(STATUE, dpx, dpy))) {
        if (await break_statue(obj)) {
          digtxt = S("The statue shatters.");
        } else {
          digtxt = null;
        }
      } else if (!!(obj = sobj_at(BOULDER, dpx, dpy))) {
        let bobj = null;
        await fracture_rock(obj);
        if (!!(bobj = sobj_at(BOULDER, dpx, dpy))) {
          await obj_extract_self(bobj);
          await place_object(bobj, dpx, dpy);
        }
        digtxt = S("The boulder falls apart.");
      } else if (lev.typ === STONE || lev.typ === SCORR || (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE)) {
        if ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level)) {
          if (G.uwep.blessed | 0 && !rn2(3)) {
            await mkcavearea(FALSE);
            { $g = 1; continue $L; }
          } else if (G.uwep.cursed | 0 && !rn2(4) || !G.uwep.blessed && !rn2(6)) {
            await mkcavearea(TRUE);
            { $g = 1; continue $L; }
          }
        }
        if (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) {
          digtxt = S("You cut down the tree.");
          lev.typ = ROOM, lev.flags = 0;
          if (!rn2(5)) {
            await rnd_treefruit_at(dpx, dpy);
          }
        } else {
          digtxt = S("You succeed in cutting away some rock.");
          lev.typ = CORR, lev.flags = 0;
        }
      } else if (lev.typ && lev.typ <= DBWALL) {
        if (shopedge) {
          await add_damage(dpx, dpy, 10 * acurrstr());
          dmgtxt = S("damage");
        }
        if (G.level.flags.is_maze_lev) {
          lev.typ = ROOM, lev.flags = 0;
        } else if (G.level.flags.is_cavernous_lev | 0 && !in_town(dpx, dpy)) {
          lev.typ = CORR, lev.flags = 0;
        } else {
          lev.typ = DOOR, lev.flags = (D_NODOOR) & 31;
        }
        digtxt = S("You make an opening in the wall.");
      } else if (lev.typ === SDOOR) {
        cvt_sdoor_to_door(lev);
        digtxt = S("You break through a secret door!");
        if (!((lev.flags | 0) & D_TRAPPED)) {
          lev.flags = (D_BROKEN) & 31;
        }
      } else if (closed_door(dpx, dpy)) {
        digtxt = S("You break through the door.");
        if (shopedge) {
          await add_damage(dpx, dpy, SHOP_DOOR_COST);
          dmgtxt = S("break");
        }
        if (!((lev.flags | 0) & D_TRAPPED)) {
          lev.flags = (D_BROKEN) & 31;
        }
      } else {
        return 0;
      }
      if (!does_block(dpx, dpy, $sat(G.level.locations[dpx], dpy))) {
        unblock_point(dpx, dpy);
      }
      await feel_newsym(dpx, dpy);
      if (digtxt && !G.context.digging.quiet) {
        await pline(S("%s"), digtxt);
      }
      if (dmgtxt) {
        await pay_for_damage(dmgtxt, FALSE);
      }
      if ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level) && !rn2(3)) {
        let mtmp = null;
        switch (rn2(2)) {
        case 0:
          mtmp = await makemon($sat(G.mons, PM_EARTH_ELEMENTAL), dpx, dpy, NO_MM_FLAGS);
          break;
        default:
          mtmp = await makemon($sat(G.mons, PM_XORN), dpx, dpy, NO_MM_FLAGS);
          break;
        }
        if (mtmp) {
          await pline_The(S("debris from your digging comes to life!"));
        }
      }
      if (lev.typ === DOOR && (lev.flags | 0) & D_TRAPPED) {
        lev.flags = (D_NODOOR) & 31;
        await b_trapped(S("door"), 0);
        await newsym(dpx, dpy);
      }
    case 1: // cleanup
      G.context.digging.lastdigtime = G.moves;
      G.context.digging.quiet = FALSE;
      G.context.digging.level.dnum = 0;
      G.context.digging.level.dlevel = -1;
      return 0;
      { $g = 2; continue $L; }
    case 3:
      {
        let dig_target = dig_typ(G.uwep, dpx, dpy);
        if (lev.typ && lev.typ <= DBWALL || dig_target === DIGTYP_DOOR) {
          if ($rd(in_rooms(dpx, dpy, SHOPBASE))) {
            await pline(S("This %s seems too hard to %s."), lev.typ === DOOR ? S("door") : S("wall"), verb);
            return 0;
          }
        } else if (dig_target === DIGTYP_UNDIGGABLE || dig_target === DIGTYP_ROCK && !(lev.typ < POOL)) {
          return 0;
        }
        if (!did_dig_msg) {
          await You(S("hit the %s with all your might."), dig$d_target[dig_target]);
          did_dig_msg = TRUE;
        }
      }
    case 2:
      return 1;
    }
    break;
  }
}

export function holetime(): number {
  if (G.occupation !== dig || !$rd(P(G.u.ushops))) {
    return -1;
  }
  return (250 - G.context.digging.effort) / 20 | 0;
}

export function fillholetyp(x: number, y: number, fill_if_any: number): number {
  let x1 = 0;
  let y1 = 0;
  let lo_x = 1 > x - 1 ? 1 : x - 1;
  let hi_x = x + 1 < 80 - 1 ? x + 1 : 80 - 1;
  let lo_y = 0 > y - 1 ? 0 : y - 1;
  let hi_y = y + 1 < 21 - 1 ? y + 1 : 21 - 1;
  let pool_cnt = 0;
  let moat_cnt = 0;
  let lava_cnt = 0;
  for (x1 = lo_x; x1 <= hi_x; ++x1) {
    for (y1 = lo_y; y1 <= hi_y; ++y1) {
      if (is_moat(x1, y1)) {
        ++moat_cnt;
      } else if (is_pool(x1, y1)) {
        ++pool_cnt;
      } else if (is_lava(x1, y1)) {
        ++lava_cnt;
      }
    }
  }
  if (!fill_if_any) {
    pool_cnt = pool_cnt / 3 | 0;
  }
  if (lava_cnt > moat_cnt + pool_cnt && rn2(lava_cnt + 1) || lava_cnt && fill_if_any) {
    return LAVAPOOL;
  } else if (moat_cnt > 0 && rn2(moat_cnt + 1) || moat_cnt && fill_if_any) {
    return MOAT;
  } else if (pool_cnt > 0 && rn2(pool_cnt + 1) || pool_cnt && fill_if_any) {
    return POOL;
  } else {
    return ROOM;
  }
}

export async function digactualhole(x: number, y: number, madeby: struct_monst | null, ttyp: number): Promise<void> {
  let $t1: any;
  let oldobjs = null;
  let newobjs = null;
  let ttmp = null;
  let surface_type = new Int8Array(256);
  let lev = $sat(G.level.locations[x], y);
  let shopdoor = 0;
  let mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
  let madeby_u = (madeby === G.youmonst ? 1 : 0) << 24 >> 24;
  let madeby_obj = (!madeby ? 1 : 0) << 24 >> 24;
  let at_u = (x === G.u.ux && y === G.u.uy ? 1 : 0) << 24 >> 24;
  let wont_fall = ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? 1 : 0) << 24 >> 24;
  if (at_u && G.u.utrap) {
    if (G.u.utraptype === TT_BURIEDBALL) {
      await buried_ball_to_punishment();
    } else if (G.u.utraptype === TT_INFLOOR) {
      await reset_utrap(FALSE);
    }
  }
  if (lev.typ === FOUNTAIN) {
    await dogushforth(FALSE);
    ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | 2) >>> 0) & 31);
    ;
    await dryup(x, y, madeby_u);
    return;
  } else if (lev.typ === SINK) {
    await breaksink(x, y);
    return;
  } else if (lev.typ === DRAWBRIDGE_DOWN || is_drawbridge_wall(x, y) >= 0) {
    const bx = new Int32Array(1);
    bx[0] = x;
    const by = new Int32Array(1);
    by[0] = y;
    find_drawbridge(P(bx, 0), P(by, 0));
    await destroy_drawbridge(bx[0], by[0]);
    return;
  }
  if (ttyp !== PIT && (!Can_dig_down(G.u.uz) && !lev.candig)) {
    await impossible(S("digactualhole: can't dig %s on this level."), G.defsyms[S_arrow_trap + ttyp - 1].explanation);
    ttyp = PIT;
  }
  if (lev.typ === GRAVE) {
    strcpy(P(surface_type), S("grave"));
  } else {
    strcpy(P(surface_type), surface(x, y));
  }
  shopdoor = (lev.typ === DOOR && $rd(in_rooms(x, y, SHOPBASE)) ? 1 : 0) << 24 >> 24;
  oldobjs = G.level.objects[x][y];
  ttmp = await maketrap(x, y, ttyp);
  if (!ttmp) {
    return;
  }
  newobjs = G.level.objects[x][y];
  ttmp.madeby_u = (madeby_u >>> 0) & 1;
  ttmp.tseen = 0;
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    await seetrap(ttmp);
  } else if (madeby_u) {
    await feeltrap(ttmp);
  }
  if (ttyp === PIT) {
    if (madeby_u) {
      if (x !== G.u.ux || y !== G.u.uy) {
        await You(S("dig an adjacent pit."));
      } else {
        await You(S("dig a pit in the %s."), P(surface_type));
      }
      if (shopdoor) {
        await pay_for_damage(S("ruin"), FALSE);
      }
    } else if (!madeby_obj && ((madeby.wormno | 0 ? worm_known(madeby) : $rd(G.viz_array.a[G.viz_array.o + madeby.my], madeby.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && madeby && madeby.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + madeby.my], madeby.mx) & 1 ? 1 : 0) && ((!madeby.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !madeby.mundetected))) {
      await pline(S("%s digs a pit in the %s."), await Monnam(madeby), P(surface_type));
    } else if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 && G.flags.verbose) {
      await pline(S("A pit appears in the %s."), P(surface_type));
    }
    await switch_terrain();
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      wont_fall = TRUE;
    }
    if (at_u) {
      if (!wont_fall) {
        set_utrap(rn2(4) + 2 >>> 0, TT_PIT);
        G.vision_full_recalc = 1;
      } else {
        await reset_utrap(TRUE);
      }
      if (oldobjs !== newobjs) {
        await pickup(1);
      }
    } else if (mtmp) {
      if ((mtmp.data.mflags1 & 1) >>> 0 !== 0 || (mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s %s over the pit."), await Monnam(mtmp), (mtmp.data.mflags1 & 1) >>> 0 !== 0 ? S("flies") : S("floats"));
        }
      } else if (mtmp !== madeby) {
        await mintrap(mtmp);
      }
    }
  } else {
    if (madeby_u) {
      await You(S("dig a hole through the %s."), P(surface_type));
    } else if (!madeby_obj && ((madeby.wormno | 0 ? worm_known(madeby) : $rd(G.viz_array.a[G.viz_array.o + madeby.my], madeby.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && madeby && madeby.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + madeby.my], madeby.mx) & 1 ? 1 : 0) && ((!madeby.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !madeby.mundetected))) {
      await pline(S("%s digs a hole through the %s."), await Monnam(madeby), P(surface_type));
    } else if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 && G.flags.verbose) {
      await pline(S("A hole appears in the %s."), P(surface_type));
    }
    if (at_u) {
      await switch_terrain();
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
        wont_fall = TRUE;
      }
      if (!G.u.ustuck && !wont_fall && !await next_to_u()) {
        await You(S("are jerked back by your pet!"));
        wont_fall = TRUE;
      }
      if (G.u.ustuck || wont_fall) {
        if (newobjs) {
          await impact_drop(null, x, y, 0);
        }
        if (oldobjs !== newobjs) {
          await pickup(1);
        }
        if (shopdoor && madeby_u) {
          await pay_for_damage(S("ruin"), FALSE);
        }
      } else {
        let newlevel = new struct_d_level();
        if ($rd(P(G.u.ushops)) && madeby_u) {
          await shopdig(1);
        } else if (!madeby_u) {
          await pay_for_damage(S("dig into"), TRUE);
        }
        await You(S("fall through..."));
        newlevel.dnum = G.u.uz.dnum;
        newlevel.dlevel = G.u.uz.dlevel + 1 << 24 >> 24;
        await goto_level(newlevel, FALSE, TRUE, FALSE);
        await spoteffects(FALSE);
      }
    } else {
      if (shopdoor && madeby_u) {
        await pay_for_damage(S("ruin"), FALSE);
      }
      if (newobjs) {
        await impact_drop(null, x, y, 0);
      }
      if (mtmp) {
        if ((mtmp.data.mflags1 & 1) >>> 0 !== 0 || (mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT) || mtmp.data === $sat(G.mons, PM_WUMPUS) || mtmp.wormno | 0 && count_wsegs(mtmp) > 5 || mtmp.data.msize >= MZ_HUGE) {
          return;
        }
        if (mtmp === G.u.ustuck) {
          return;
        }
        if (await teleport_pet(mtmp, FALSE)) {
          let tolevel = new struct_d_level();
          if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
            assign_level(tolevel, G.dungeon_topology.d_valley_level);
          } else if (Is_botlevel(G.u.uz)) {
            if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
              await pline(S("%s avoids the trap."), await Monnam(mtmp));
            }
            return;
          } else {
            await get_level(tolevel, depth(G.u.uz) + 1);
          }
          if (mtmp.isshk) {
            await make_angry_shk(mtmp, 0, 0);
          }
          await migrate_to_level(mtmp, ledger_no(tolevel), MIGR_RANDOM, null);
        }
      }
    }
  }
}

export async function liquid_flow(x: number, y: number, typ: number, ttmp: struct_trap | null, fillmsg: Ptr | null): Promise<void> {
  let u_spot = (x === G.u.ux && y === G.u.uy ? 1 : 0) << 24 >> 24;
  if (ttmp) {
    await delfloortrap(ttmp);
  }
  await unearth_objs(x, y);
  if (fillmsg) {
    await pline(fillmsg, hliquid(typ === LAVAPOOL ? S("lava") : S("water")));
  }
  if (u_spot && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
    if (typ === LAVAPOOL) {
      await lava_effects();
    } else if (!(G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)))) {
      await drown();
    }
  }
}

export async function dighole(pit_only: number, by_magic: number, cc: struct_nhcoord | null): Promise<number> {
  let ttmp = null;
  let lev = null;
  let boulder_here = null;
  let typ = 0;
  let dig_x = 0;
  let dig_y = 0;
  let nohole = 0;
  if (!cc) {
    dig_x = G.u.ux;
    dig_y = G.u.uy;
  } else {
    dig_x = cc.x;
    dig_y = cc.y;
    if (!isok(dig_x, dig_y)) {
      return FALSE;
    }
  }
  ttmp = t_at(dig_x, dig_y);
  lev = $sat(G.level.locations[dig_x], dig_y);
  nohole = (!Can_dig_down(G.u.uz) && !lev.candig ? 1 : 0) << 24 >> 24;
  if (ttmp && ((ttmp.ttyp | 0) === MAGIC_PORTAL || (ttmp.ttyp | 0) === VIBRATING_SQUARE || nohole) || lev.typ < POOL && lev.typ !== SDOOR && ((lev.flags | 0) & W_NONDIGGABLE) !== 0) {
    await pline_The(S("%s %shere is too hard to dig in."), surface(dig_x, dig_y), dig_x !== G.u.ux || dig_y !== G.u.uy ? S("t") : S(""));
  } else if (is_pool_or_lava(dig_x, dig_y)) {
    await pline_The(S("%s sloshes furiously for a moment, then subsides."), hliquid(is_lava(dig_x, dig_y) ? S("lava") : S("water")));
    wake_nearby();
  } else if (lev.typ === DRAWBRIDGE_DOWN || is_drawbridge_wall(dig_x, dig_y) >= 0) {
    if (pit_only) {
      await pline_The(S("drawbridge seems too hard to dig through."));
      return FALSE;
    } else {
      const x = new Int32Array(1);
      x[0] = dig_x;
      const y = new Int32Array(1);
      y[0] = dig_y;
      find_drawbridge(P(x, 0), P(y, 0));
      await destroy_drawbridge(x[0], y[0]);
      return TRUE;
    }
  } else if (!!(boulder_here = sobj_at(BOULDER, dig_x, dig_y))) {
    if (ttmp && ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT) && rn2(2)) {
      await pline_The(S("boulder settles into the %spit."), dig_x !== G.u.ux || dig_y !== G.u.uy ? S("adjacent ") : S(""));
      ttmp.ttyp = (PIT) & 31;
    } else {
      await pline(S("KADOOM!  The boulder falls in!"));
      await delfloortrap(ttmp);
    }
    await delobj(boulder_here);
    return TRUE;
  } else if (lev.typ === GRAVE) {
    await digactualhole(dig_x, dig_y, G.youmonst, PIT);
    await dig_up_grave(cc);
    return TRUE;
  } else if (lev.typ === DRAWBRIDGE_UP) {
    typ = fillholetyp(dig_x, dig_y, FALSE);
    if (typ === ROOM) {
      await pline_The(S("%s %shere is too hard to dig in."), surface(dig_x, dig_y), dig_x !== G.u.ux || dig_y !== G.u.uy ? S("t") : S(""));
      return FALSE;
    }
    lev.flags = (((lev.flags | 0) & ~DB_UNDER) >>> 0) & 31;
    lev.flags = ((lev.flags | 0 | (typ === LAVAPOOL ? DB_LAVA : DB_MOAT)) >>> 0) & 31;
    await liquid_flow(dig_x, dig_y, typ, ttmp, S("As you dig, the hole fills with %s!"));
    return TRUE;
  } else if (lev.typ === THRONE) {
    await pline_The(S("throne is too hard to break apart."));
  } else if (lev.typ === ALTAR) {
    await pline_The(S("altar is too hard to break apart."));
  } else {
    typ = fillholetyp(dig_x, dig_y, FALSE);
    lev.flags = 0;
    if (typ !== ROOM) {
      lev.typ = typ;
      await liquid_flow(dig_x, dig_y, typ, ttmp, S("As you dig, the hole fills with %s!"));
      return TRUE;
    }
    if (by_magic && ttmp && ((ttmp.ttyp | 0) === LANDMINE || (ttmp.ttyp | 0) === BEAR_TRAP)) {
      let otyp = (ttmp.ttyp | 0) === LANDMINE ? LAND_MINE : BEARTRAP;
      await cnv_trap_obj(otyp, 1, ttmp, TRUE);
    }
    if (nohole || pit_only) {
      await digactualhole(dig_x, dig_y, G.youmonst, PIT);
    } else {
      await digactualhole(dig_x, dig_y, G.youmonst, HOLE);
    }
    return TRUE;
  }
  return FALSE;
}

async function dig_up_grave(cc: struct_nhcoord | null): Promise<void> {
  let otmp = null;
  let dig_x = 0;
  let dig_y = 0;
  if (!cc) {
    dig_x = G.u.ux;
    dig_y = G.u.uy;
  } else {
    dig_x = cc.x;
    dig_y = cc.y;
    if (!isok(dig_x, dig_y)) {
      return;
    }
  }
  await exercise(A_WIS, FALSE);
  if (G.urole.malenum === 328) {
    adjalign(-sgn(G.u.ualign.type) * 3);
    await You_feel(S("like a despicable grave-robber!"));
  } else if (G.urole.malenum === 339) {
    adjalign(-sgn(G.u.ualign.type));
    await You(S("disturb the honorable dead!"));
  } else if (G.u.ualign.type === A_LAWFUL && G.u.ualign.record > -10) {
    adjalign(-sgn(G.u.ualign.type));
    await You(S("have violated the sanctity of this grave!"));
  }
  switch (rn2(5)) {
  case 0:
  case 1:
    await You(S("unearth a corpse."));
    if (!!(otmp = await mk_tt_object(CORPSE, dig_x, dig_y))) {
      otmp.age -= 100;
    }
    break;
  case 2:
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Dude!  The living dead!") : S("The grave's owner is very upset!"));
    }
    await makemon(await mkclass(S_ZOMBIE, 0), dig_x, dig_y, NO_MM_FLAGS);
    break;
  case 3:
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("I want my mummy!") : S("You've disturbed a tomb!"));
    }
    await makemon(await mkclass(S_MUMMY, 0), dig_x, dig_y, NO_MM_FLAGS);
    break;
  default:
    await pline_The(S("grave seems unused.  Strange...."));
    break;
  }
  $at2(G.level.locations, dig_x, dig_y).typ = ROOM, $at2(G.level.locations, dig_x, dig_y).flags = 0;
  await del_engr_at(dig_x, dig_y);
  await newsym(dig_x, dig_y);
  return;
}

export async function use_pick_axe(obj: struct_obj | null): Promise<number> {
  let $t1: any;
  let sdp = null;
  let verb = null;
  let dsp = null;
  let dirsyms = new Int8Array(12);
  let qbuf = new Int8Array(256);
  let ispick = 0;
  let rx = 0;
  let ry = 0;
  let downok = 0;
  let res = 0;
  if (obj !== G.uwep) {
    if (!await wield_tool(obj, S("swing"))) {
      return 0;
    } else {
      res = 1;
    }
  }
  ispick = ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp === P_PICK_AXE ? 1 : 0) << 24 >> 24;
  verb = ispick ? S("dig") : S("chop");
  if (G.u.utrap && G.u.utraptype === TT_WEB) {
    await pline(S("%s you can't %s while entangled in a web."), !res ? S("Unfortunately,") : S("But"), verb);
    return res;
  }
  downok = !!can_reach_floor(FALSE) ? 1 : 0;
  dsp = P(dirsyms);
  for (sdp = G.Cmd.dirchars; sdp.a[sdp.o]; sdp = sdp.add(1)) {
    if (G.u.uswallow) {
      ;
    } else if (movecmd(sdp.a[sdp.o])) {
      if (!dxdy_moveok()) {
        continue;
      }
      rx = G.u.ux + G.u.dx;
      ry = G.u.uy + G.u.dy;
      if (!isok(rx, ry) || dig_typ(obj, rx, ry) === DIGTYP_UNDIGGABLE) {
        continue;
      }
    } else {
      if ((G.u.dz > 0 ? 1 : 0) ^ downok) {
        continue;
      }
    }
    $wr(($t1 = dsp, dsp = $t1.add(1), $t1), 0, sdp.a[sdp.o]);
  }
  dsp.a[dsp.o] = 0;
  sprintf(P(qbuf), S("In what direction do you want to %s? [%s]"), verb, P(dirsyms));
  if (!await getdir(P(qbuf))) {
    return res;
  }
  return await use_pick_axe2(obj);
}

export async function use_pick_axe2(obj: struct_obj | null): Promise<number> {
  let rx = 0;
  let ry = 0;
  let lev = null;
  let trap = null;
  let trap_with_u = null;
  let dig_target = 0;
  let ispick = ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp === P_PICK_AXE ? 1 : 0) << 24 >> 24;
  let verbing = ispick ? S("digging") : S("chopping");
  if (G.u.uswallow | 0 && await attack(G.u.ustuck)) {
    ;
  } else if (G.u.uinwater) {
    await pline(S("Turbulence torpedoes your %s attempts."), verbing);
  } else if (G.u.dz < 0) {
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
      await You(S("don't have enough leverage."));
    } else {
      await You_cant(S("reach the %s."), ceiling(G.u.ux, G.u.uy));
    }
  } else if (!G.u.dx && !G.u.dy && !G.u.dz) {
    let buf = new Int8Array(256);
    let dam = 0;
    dam = rnd(2) + dbon() + obj.spe;
    if (dam <= 0) {
      dam = 1;
    }
    await You(S("hit yourself with %s."), await yname(G.uwep));
    sprintf(P(buf), S("%s own %s"), G.genders[G.flags.female ? 1 : 0].his, G.obj_descr[G.objects[obj.otyp].oc_name_idx].oc_name);
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dam + 1) / 2 | 0 : dam, P(buf), KILLED_BY);
    G.context.botl = 1;
    return 1;
  } else if (G.u.dz === 0) {
    if (G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic && !rn2(5)) {
      confdir();
    }
    rx = G.u.ux + G.u.dx;
    ry = G.u.uy + G.u.dy;
    if (!isok(rx, ry)) {
      await pline(S("Clash!"));
      return 1;
    }
    lev = $sat(G.level.locations[rx], ry);
    if (!!G.level.monsters[rx][ry] && await attack(!!G.level.monsters[rx][ry] ? G.level.monsters[rx][ry] : null)) {
      return 1;
    }
    dig_target = dig_typ(obj, rx, ry);
    if (dig_target === DIGTYP_UNDIGGABLE) {
      trap = t_at(rx, ry);
      if (trap && (trap.ttyp | 0) === WEB) {
        if (!trap.tseen) {
          await seetrap(trap);
          await There(S("is a spider web there!"));
        }
        await pline(S("%s entangled in the web."), await Yobjnam2(obj, S("become")));
        nomul(-d(2, 2));
        G.multi_reason = S("stuck in a spider web");
        G.nomovemsg = S("You pull free.");
      } else if (lev.typ === IRONBARS) {
        await pline(S("Clang!"));
        wake_nearby();
      } else if (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) {
        await You(S("need an axe to cut down a tree."));
      } else if (lev.typ < POOL) {
        await You(S("need a pick to dig rock."));
      } else if (!ispick && (sobj_at(STATUE, rx, ry) || sobj_at(BOULDER, rx, ry))) {
        let vibrate = (!rn2(3) ? 1 : 0) << 24 >> 24;
        await pline(S("Sparks fly as you whack the %s.%s"), sobj_at(STATUE, rx, ry) ? S("statue") : S("boulder"), vibrate ? S(" The axe-handle vibrates violently!") : S(""));
        if (vibrate) {
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (2 + 1) / 2 | 0 : 2, S("axing a hard object"), KILLED_BY);
        }
      } else if (G.u.utrap && G.u.utraptype === TT_PIT && trap && (trap_with_u = t_at(G.u.ux, G.u.uy)) && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT) && !conjoined_pits(trap, trap_with_u, FALSE)) {
        let idx = 0;
        for (idx = 0; idx < 8; ++idx) {
          if (G.xdir[idx] === G.u.dx && G.ydir[idx] === G.u.dy) {
            break;
          }
        }
        if (idx < 8) {
          let adjidx = (idx + 4) % 8;
          trap_with_u.vl.v_conjoined = (trap_with_u.vl.v_conjoined | 1 << idx) & 0xff;
          trap.vl.v_conjoined = (trap.vl.v_conjoined | 1 << adjidx) & 0xff;
          await pline(S("You clear some debris from between the pits."));
        }
      } else if (G.u.utrap && G.u.utraptype === TT_PIT && !!(trap_with_u = t_at(G.u.ux, G.u.uy))) {
        await You(S("swing %s, but the rubble has no place to go."), await yobjnam(obj, null));
      } else {
        await You(S("swing %s through thin air."), await yobjnam(obj, null));
      }
    } else {
      did_dig_msg = FALSE;
      G.context.digging.quiet = FALSE;
      if (G.context.digging.pos.x !== rx || G.context.digging.pos.y !== ry || !on_level(G.context.digging.level, G.u.uz) || G.context.digging.down) {
        if (G.flags.autodig && dig_target === DIGTYP_ROCK && !G.context.digging.down && G.context.digging.pos.x === G.u.ux && G.context.digging.pos.y === G.u.uy && (G.moves <= G.context.digging.lastdigtime + 2 && G.moves >= G.context.digging.lastdigtime)) {
          did_dig_msg = TRUE;
          G.context.digging.quiet = TRUE;
        }
        G.context.digging.down = G.context.digging.chew = FALSE;
        G.context.digging.warned = FALSE;
        G.context.digging.pos.x = rx << 24 >> 24;
        G.context.digging.pos.y = ry << 24 >> 24;
        assign_level(G.context.digging.level, G.u.uz);
        G.context.digging.effort = 0;
        if (!G.context.digging.quiet) {
          await You(S("start %s."), use_pick_axe2$d_action[dig_target]);
        }
      } else {
        await You(S("%s %s."), G.context.digging.chew ? S("begin") : S("continue"), use_pick_axe2$d_action[dig_target]);
        G.context.digging.chew = FALSE;
      }
      set_occupation(dig, verbing, 0);
    }
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    await You(S("swing %s through thin air."), await yobjnam(obj, null));
  } else if (!can_reach_floor(FALSE)) {
    await cant_reach_floor(G.u.ux, G.u.uy, FALSE, FALSE);
  } else if (is_pool_or_lava(G.u.ux, G.u.uy)) {
    await You(S("cannot stay under%s long enough."), is_pool(G.u.ux, G.u.uy) ? S("water") : S(" the lava"));
  } else if (!!(trap = t_at(G.u.ux, G.u.uy)) && (uteetering_at_seen_pit(trap) || uescaped_shaft(trap))) {
    await dotrap(trap, FORCEBUNGLE);
    if (!G.u.utrap) {
      await cant_reach_floor(G.u.ux, G.u.uy, FALSE, TRUE);
    }
  } else if (!ispick && (!trap || (trap.ttyp | 0) !== LANDMINE && (trap.ttyp | 0) !== BEAR_TRAP)) {
    await pline(S("%s merely scratches the %s."), await Yobjnam2(obj, null), surface(G.u.ux, G.u.uy));
    await u_wipe_engr(3);
  } else {
    if (G.context.digging.pos.x !== G.u.ux || G.context.digging.pos.y !== G.u.uy || !on_level(G.context.digging.level, G.u.uz) || !G.context.digging.down) {
      G.context.digging.chew = FALSE;
      G.context.digging.down = TRUE;
      G.context.digging.warned = FALSE;
      G.context.digging.pos.x = G.u.ux;
      G.context.digging.pos.y = G.u.uy;
      assign_level(G.context.digging.level, G.u.uz);
      G.context.digging.effort = 0;
      await You(S("start %s downward."), verbing);
      if ($rd(P(G.u.ushops))) {
        await shopdig(0);
      }
    } else {
      await You(S("continue %s downward."), verbing);
    }
    did_dig_msg = FALSE;
    set_occupation(dig, verbing, 0);
  }
  return 1;
}

export async function watch_dig(mtmp: struct_monst | null, x: number, y: number, zap: number): Promise<void> {
  let lev = $sat(G.level.locations[x], y);
  if (in_town(x, y) && (closed_door(x, y) || lev.typ === SDOOR || lev.typ && lev.typ <= DBWALL || lev.typ === FOUNTAIN || (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE))) {
    if (!mtmp) {
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        if ((mtmp.data === $sat(G.mons, 278) || mtmp.data === $sat(G.mons, 279)) && mtmp.mcansee | 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.mpeaceful | 0) {
          break;
        }
      }
    }
    if (mtmp) {
      if (zap || G.context.digging.warned) {
        await verbalize(S("Halt, vandal!  You're under arrest!"));
        await angry_guards(!!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? 1 : 0);
      } else {
        let str = null;
        if (lev.typ === DOOR) {
          str = S("door");
        } else if (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) {
          str = S("tree");
        } else if (lev.typ < POOL) {
          str = S("wall");
        } else {
          str = S("fountain");
        }
        await verbalize(S("Hey, stop damaging that %s!"), str);
        G.context.digging.warned = TRUE;
      }
      if (is_digging()) {
        await stop_occupation();
      }
    }
  }
}

export async function mdig_tunnel(mtmp: struct_monst | null): Promise<number> {
  let here = null;
  let pile = rnd(12);
  here = $sat(G.level.locations[mtmp.mx], mtmp.my);
  if (here.typ === SDOOR) {
    cvt_sdoor_to_door(here);
  }
  if (closed_door(mtmp.mx, mtmp.my)) {
    if ($rd(in_rooms(mtmp.mx, mtmp.my, SHOPBASE))) {
      await add_damage(mtmp.mx, mtmp.my, 0);
    }
    unblock_point(mtmp.mx, mtmp.my);
    if ((here.flags | 0) & D_TRAPPED) {
      here.flags = (D_NODOOR) & 31;
      if (await mb_trapped(mtmp)) {
        await newsym(mtmp.mx, mtmp.my);
        return TRUE;
      }
    } else {
      if (!rn2(3) && G.flags.verbose) {
        await draft_message(TRUE);
      }
      here.flags = (D_BROKEN) & 31;
    }
    await newsym(mtmp.mx, mtmp.my);
    return FALSE;
  } else if (here.typ === SCORR) {
    here.typ = CORR, here.flags = 0;
    unblock_point(mtmp.mx, mtmp.my);
    await newsym(mtmp.mx, mtmp.my);
    await draft_message(FALSE);
    return FALSE;
  } else if (!(here.typ < POOL) && !(here.typ === TREE || G.level.flags.arboreal | 0 && here.typ === STONE)) {
    return FALSE;
  }
  if (((here.flags | 0) & W_NONDIGGABLE) !== 0) {
    await impossible(S("mdig_tunnel:  %s at (%d,%d) is undiggable"), here.typ && here.typ <= DBWALL ? S("wall") : here.typ === TREE || G.level.flags.arboreal | 0 && here.typ === STONE ? S("tree") : S("stone"), mtmp.mx, mtmp.my);
    return FALSE;
  }
  if (here.typ && here.typ <= DBWALL) {
    if (G.flags.verbose && !rn2(5)) {
      await You_hear(S("crashing rock."));
    }
    if ($rd(in_rooms(mtmp.mx, mtmp.my, SHOPBASE))) {
      await add_damage(mtmp.mx, mtmp.my, 0);
    }
    if (G.level.flags.is_maze_lev) {
      here.typ = ROOM, here.flags = 0;
    } else if (G.level.flags.is_cavernous_lev | 0 && !in_town(mtmp.mx, mtmp.my)) {
      here.typ = CORR, here.flags = 0;
    } else {
      here.typ = DOOR, here.flags = (D_NODOOR) & 31;
    }
  } else if (here.typ === TREE || G.level.flags.arboreal | 0 && here.typ === STONE) {
    here.typ = ROOM, here.flags = 0;
    if (pile && pile < 5) {
      await rnd_treefruit_at(mtmp.mx, mtmp.my);
    }
  } else {
    here.typ = CORR, here.flags = 0;
    if (pile && pile < 5) {
      await mksobj_at(pile === 1 ? BOULDER : ROCK, mtmp.mx, mtmp.my, TRUE, FALSE);
    }
  }
  await newsym(mtmp.mx, mtmp.my);
  if (!sobj_at(BOULDER, mtmp.mx, mtmp.my)) {
    unblock_point(mtmp.mx, mtmp.my);
  }
  return FALSE;
}

export async function draft_message(unexpected: number): Promise<void> {
  if (unexpected) {
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
      await You_feel(S("an unexpected draft."));
    } else {
      await You_feel(S("like you are %s."), acurr(A_STR) < 6 || acurr(A_DEX) < 6 || acurr(A_CON) < 6 || acurr(A_CHA) < 6 || acurr(A_INT) < 6 || acurr(A_WIS) < 6 ? S("4-F") : S("1-A"));
    }
  } else {
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
      await You_feel(S("a draft."));
    } else {
      let dridx = 0;
      dridx = rn2(2) + (1 - sgn(G.u.ualign.type));
      if (G.u.ualign.record < STRIDENT) {
        dridx += rn2(3) + (sgn(G.u.ualign.type) - 1);
      }
      await You_feel(S("like %s."), draft_message$draft_reaction[dridx]);
    }
  }
}

export async function zap_dig(): Promise<void> {
  let room = null;
  let mtmp = null;
  let otmp = null;
  let trap_with_u = null;
  let zx = 0;
  let zy = 0;
  let diridx = 8;
  let digdepth = 0;
  let flow_x = -1;
  let flow_y = -1;
  let shopdoor = 0;
  let shopwall = 0;
  let maze_dig = 0;
  let pitdig = FALSE;
  let pitflow = FALSE;
  if (G.u.uswallow) {
    mtmp = G.u.ustuck;
    if (!(mtmp.data.mlet === S_VORTEX || mtmp.data === $sat(G.mons, 151))) {
      if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0) {
        await You(S("pierce %s %s wall!"), s_suffix(await mon_nam(mtmp)), mbodypart(mtmp, STOMACH));
      }
      mtmp.mhp = 1;
      await expels(mtmp, mtmp.data, !((mtmp.data.mflags1 & 262144) >>> 0 !== 0) ? 1 : 0);
    }
    return;
  }
  if (G.u.dz) {
    if (!((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !G.u.uinwater) {
      if (G.u.dz < 0 || On_stairs(G.u.ux, G.u.uy)) {
        let dmg = 0;
        if (On_stairs(G.u.ux, G.u.uy)) {
          await pline_The(S("beam bounces off the %s and hits the %s."), G.u.ux === G.dnladder.sx || G.u.ux === G.upladder.sx ? S("ladder") : S("stairs"), ceiling(G.u.ux, G.u.uy));
        }
        await You(S("loosen a rock from the %s."), ceiling(G.u.ux, G.u.uy));
        await pline(S("It falls on your %s!"), body_part(HEAD));
        dmg = rnd(G.uarmh && ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) ? 2 : 6);
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("falling rock"), KILLED_BY_AN);
        otmp = await mksobj_at(ROCK, G.u.ux, G.u.uy, FALSE, FALSE);
        if (otmp) {
          await xname(otmp);
          await stackobj(otmp);
        }
        await newsym(G.u.ux, G.u.uy);
      } else {
        await watch_dig(null, G.u.ux, G.u.uy, TRUE);
        await dighole(FALSE, TRUE, null);
      }
    }
    return;
  }
  shopdoor = shopwall = FALSE;
  maze_dig = (G.level.flags.is_maze_lev | 0 && !((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level)) ? 1 : 0) << 24 >> 24;
  zx = G.u.ux + G.u.dx;
  zy = G.u.uy + G.u.dy;
  if (G.u.utrap && G.u.utraptype === TT_PIT && (trap_with_u = t_at(G.u.ux, G.u.uy))) {
    pitdig = TRUE;
    for (diridx = 0; diridx < 8; ++diridx) {
      if (G.xdir[diridx] === G.u.dx && G.ydir[diridx] === G.u.dy) {
        break;
      }
    }
  }
  digdepth = rn2(18) + 8;
  await tmp_at(DISP_BEAM, S_digbeam + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
  while (--digdepth >= 0) {
    if (!isok(zx, zy)) {
      break;
    }
    room = $sat(G.level.locations[zx], zy);
    await tmp_at(zx, zy);
    await G.windowprocs.win_delay_output();
    if (pitdig) {
      let cc = new struct_nhcoord();
      let adjpit = t_at(zx, zy);
      if (diridx < 8 && !conjoined_pits(adjpit, trap_with_u, FALSE)) {
        digdepth = 0;
        if (!(adjpit && ((adjpit.ttyp | 0) === PIT || (adjpit.ttyp | 0) === SPIKED_PIT))) {
          let buf = new Int8Array(256);
          cc.x = zx << 24 >> 24;
          cc.y = zy << 24 >> 24;
          if (!adj_pit_checks(cc, P(buf))) {
            if (buf[0]) {
              await pline(S("%s"), P(buf));
            }
          } else {
            await dighole(TRUE, TRUE, cc);
            adjpit = t_at(zx, zy);
          }
        }
        if (adjpit && ((adjpit.ttyp | 0) === PIT || (adjpit.ttyp | 0) === SPIKED_PIT)) {
          let adjidx = (diridx + 4) % 8;
          trap_with_u.vl.v_conjoined = (trap_with_u.vl.v_conjoined | 1 << diridx) & 0xff;
          adjpit.vl.v_conjoined = (adjpit.vl.v_conjoined | 1 << adjidx) & 0xff;
          flow_x = zx;
          flow_y = zy;
          pitflow = TRUE;
        }
        if (is_pool(zx, zy) || is_lava(zx, zy)) {
          flow_x = zx - G.u.dx;
          flow_y = zy - G.u.dy;
          pitflow = TRUE;
        }
        break;
      }
    } else if (closed_door(zx, zy) || room.typ === SDOOR) {
      if ($rd(in_rooms(zx, zy, SHOPBASE))) {
        await add_damage(zx, zy, SHOP_DOOR_COST);
        shopdoor = TRUE;
      }
      if (room.typ === SDOOR) {
        room.typ = DOOR;
      } else if ($rd(G.viz_array.a[G.viz_array.o + zy], zx) & 2) {
        await pline_The(S("door is razed!"));
      }
      await watch_dig(null, zx, zy, TRUE);
      room.flags = (D_NODOOR) & 31;
      unblock_point(zx, zy);
      digdepth -= 2;
      if (maze_dig) {
        break;
      }
    } else if (maze_dig) {
      if (room.typ && room.typ <= DBWALL) {
        if (!((room.flags | 0) & W_NONDIGGABLE)) {
          if ($rd(in_rooms(zx, zy, SHOPBASE))) {
            await add_damage(zx, zy, SHOP_WALL_COST);
            shopwall = TRUE;
          }
          room.typ = ROOM, room.flags = 0;
          unblock_point(zx, zy);
        } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("wall glows then fades."));
        }
        break;
      } else if (room.typ === TREE || G.level.flags.arboreal | 0 && room.typ === STONE) {
        if (!((room.flags | 0) & W_NONDIGGABLE)) {
          room.typ = ROOM, room.flags = 0;
          unblock_point(zx, zy);
        } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("tree shudders but is unharmed."));
        }
        break;
      } else if (room.typ === STONE || room.typ === SCORR) {
        if (!((room.flags | 0) & W_NONDIGGABLE)) {
          room.typ = CORR, room.flags = 0;
          unblock_point(zx, zy);
        } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("rock glows then fades."));
        }
        break;
      }
    } else if (room.typ < POOL) {
      if (!may_dig(zx, zy)) {
        break;
      }
      if (room.typ && room.typ <= DBWALL || room.typ === SDOOR) {
        if ($rd(in_rooms(zx, zy, SHOPBASE))) {
          await add_damage(zx, zy, SHOP_WALL_COST);
          shopwall = TRUE;
        }
        await watch_dig(null, zx, zy, TRUE);
        if (G.level.flags.is_cavernous_lev | 0 && !in_town(zx, zy)) {
          room.typ = CORR, room.flags = 0;
        } else {
          room.typ = DOOR, room.flags = (D_NODOOR) & 31;
        }
        digdepth -= 2;
      } else if (room.typ === TREE || G.level.flags.arboreal | 0 && room.typ === STONE) {
        room.typ = ROOM, room.flags = 0;
        digdepth -= 2;
      } else {
        room.typ = CORR, room.flags = 0;
        --digdepth;
      }
      unblock_point(zx, zy);
    }
    zx += G.u.dx;
    zy += G.u.dy;
  }
  await tmp_at(DISP_END, 0);
  if (pitflow && isok(flow_x, flow_y)) {
    let ttmp = t_at(flow_x, flow_y);
    if (ttmp && ((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT)) {
      let filltyp = fillholetyp(ttmp.tx, ttmp.ty, TRUE);
      if (filltyp !== ROOM) {
        await pit_flow(ttmp, filltyp);
      }
    }
  }
  if (shopdoor || shopwall) {
    await pay_for_damage(shopdoor ? S("destroy") : S("dig into"), FALSE);
  }
  return;
}

function adj_pit_checks(cc: struct_nhcoord | null, msg: Ptr | null): number {
  let ltyp = 0;
  let room = null;
  let foundation_msg = S("The foundation is too hard to dig through from this angle.");
  if (!cc) {
    return FALSE;
  }
  if (!isok(cc.x, cc.y)) {
    return FALSE;
  }
  msg.a[msg.o] = 0;
  room = $sat(G.level.locations[cc.x], cc.y);
  ltyp = room.typ, room.flags = 0;
  if (is_pool(cc.x, cc.y) || is_lava(cc.x, cc.y)) {
    return FALSE;
  } else if (closed_door(cc.x, cc.y) || room.typ === SDOOR) {
    strcpy(msg, foundation_msg);
    return FALSE;
  } else if (ltyp && ltyp <= DBWALL) {
    strcpy(msg, foundation_msg);
    return FALSE;
  } else if (ltyp === TREE || G.level.flags.arboreal | 0 && ltyp === STONE) {
    strcpy(msg, S("The tree's roots glow then fade."));
    return FALSE;
  } else if (ltyp === STONE || ltyp === SCORR) {
    if ((room.flags | 0) & W_NONDIGGABLE) {
      strcpy(msg, S("The rock glows then fades."));
      return FALSE;
    }
  } else if (ltyp === IRONBARS) {
    strcpy(msg, S("The bars go much deeper than your pit."));
  } else if (ltyp === SINK) {
    strcpy(msg, S("A tangled mass of plumbing remains below the sink."));
    return FALSE;
  } else if (cc.x === G.upladder.sx && cc.y === G.upladder.sy || cc.x === G.dnladder.sx && cc.y === G.dnladder.sy) {
    strcpy(msg, S("The ladder is unaffected."));
    return FALSE;
  } else {
    let supporting = null;
    if (ltyp === FOUNTAIN) {
      supporting = S("fountain");
    } else if (ltyp === THRONE) {
      supporting = S("throne");
    } else if (ltyp === ALTAR) {
      supporting = S("altar");
    } else if (cc.x === G.upstair.sx && cc.y === G.upstair.sy || cc.x === G.sstairs.sx && cc.y === G.sstairs.sy && G.sstairs.up) {
      supporting = S("stairs");
    } else if (cc.x === G.dnstair.sx && cc.y === G.dnstair.sy || cc.x === G.sstairs.sx && cc.y === G.sstairs.sy && !G.sstairs.up) {
      supporting = S("stairs");
    } else if (ltyp === DRAWBRIDGE_DOWN || ltyp === DBWALL) {
      supporting = S("drawbridge");
    }
    if (supporting) {
      sprintf(msg, S("The %s%ssupporting structures remain intact."), supporting ? s_suffix(supporting) : S(""), supporting ? S(" ") : S(""));
      return FALSE;
    }
  }
  return TRUE;
}

async function pit_flow(trap: struct_trap | null, filltyp: number): Promise<void> {
  if (trap && filltyp !== ROOM && ((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT)) {
    let t = new struct_trap();
    let idx = 0;
    t.$cp(trap);
    $at2(G.level.locations, t.tx, t.ty).typ = filltyp, $at2(G.level.locations, t.tx, t.ty).flags = 0;
    await liquid_flow(t.tx, t.ty, filltyp, trap, t.tx === G.u.ux && t.ty === G.u.uy ? S("Suddenly %s flows in from the adjacent pit!") : null);
    for (idx = 0; idx < 8; ++idx) {
      if (t.vl.v_conjoined & 1 << idx) {
        let x = 0;
        let y = 0;
        let t2 = null;
        x = t.tx + G.xdir[idx];
        y = t.ty + G.ydir[idx];
        t2 = t_at(x, y);
        await pit_flow(t2, filltyp);
      }
    }
  }
}

export function buried_ball(cc: struct_nhcoord | null): struct_obj | null {
  let odist = 0;
  let bdist = COLNO;
  let otmp = null;
  let ball = null;
  if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
    for (otmp = G.level.buriedobjlist; otmp; otmp = otmp.nobj) {
      if (otmp.otyp !== HEAVY_IRON_BALL) {
        continue;
      }
      if (otmp.ox === cc.x && otmp.oy === cc.y) {
        return otmp;
      }
      odist = dist2(otmp.ox, otmp.oy, cc.x, cc.y);
      if (odist <= 8 && (!ball || odist < bdist)) {
        ball = otmp;
        bdist = odist;
      }
    }
  }
  if (ball) {
    cc.x = ball.ox;
    cc.y = ball.oy;
  }
  return ball;
}

export async function buried_ball_to_punishment(): Promise<void> {
  let cc = new struct_nhcoord();
  let ball = null;
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  ball = buried_ball(cc);
  if (ball) {
    await obj_extract_self(ball);
    await punish(ball);
    await reset_utrap(FALSE);
    await del_engr_at(cc.x, cc.y);
    await newsym(cc.x, cc.y);
  }
}

export async function buried_ball_to_freedom(): Promise<void> {
  let cc = new struct_nhcoord();
  let ball = null;
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  ball = buried_ball(cc);
  if (ball) {
    await obj_extract_self(ball);
    await place_object(ball, cc.x, cc.y);
    await stackobj(ball);
    await reset_utrap(TRUE);
    await del_engr_at(cc.x, cc.y);
    await newsym(cc.x, cc.y);
  }
}

export async function bury_an_obj(otmp: struct_obj | null, dealloced: Ptr | null): Promise<struct_obj | null> {
  let otmp2 = null;
  let under_ice = 0;
  do {
    if (await debugcore(S("dig.c"), 1)) {
      await pline(S("bury_an_obj: %s"), await xname(otmp));
    }
  } while (0);
  if (dealloced) {
    dealloced.a[dealloced.o] = FALSE;
  }
  if (otmp === G.uball) {
    await unpunish();
    G.u.utrap = rn2(50) + 20 >>> 0;
    G.u.utraptype = TT_BURIEDBALL;
    await pline_The(S("iron ball gets buried!"));
  }
  otmp2 = otmp.v.v_nexthere;
  if (otmp === G.uchain || obj_resists(otmp, 0, 0)) {
    return otmp2;
  }
  if (otmp.otyp === LEASH && otmp.corpsenm !== 0) {
    o_unleash(otmp);
  }
  if (otmp.lamplit | 0 && otmp.otyp !== POT_OIL) {
    await end_burn(otmp, TRUE);
  }
  await obj_extract_self(otmp);
  under_ice = is_ice(otmp.ox, otmp.oy);
  if (otmp.otyp === ROCK && !under_ice) {
    if (dealloced) {
      dealloced.a[dealloced.o] = TRUE;
    }
    await obfree(otmp, null);
    return otmp2;
  }
  if (otmp.otyp === CORPSE) {
    ;
  } else if ((under_ice ? otmp.oclass === POTION_CLASS ? 1 : 0 : (G.objects[otmp.otyp].oc_material | 0) <= WOOD ? 1 : 0) && !obj_resists(otmp, 5, 95)) {
    await start_timer((under_ice ? 0 : 250) + rnd(250), TIMER_OBJECT, ROT_ORGANIC, obj_to_any(otmp));
  }
  await add_to_buried(otmp);
  return otmp2;
}

export async function bury_objs(x: number, y: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  let shkp = null;
  let loss = 0;
  let costly = 0;
  costly = ((shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)))) && await costly_spot(x, y) ? 1 : 0) << 24 >> 24;
  if (!!G.level.objects[x][y]) {
    do {
      if (await debugcore(S("dig.c"), 1)) {
        await pline(S("bury_objs: at <%d,%d>"), x, y);
      }
    } while (0);
  }
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp2) {
    if (costly) {
      loss += await stolen_value(otmp, x, y, shkp.mpeaceful << 24 >> 24, TRUE);
      if (otmp.oclass !== COIN_CLASS) {
        otmp.no_charge = 1;
      }
    }
    otmp2 = await bury_an_obj(otmp, null);
  }
  await del_engr_at(x, y);
  await newsym(x, y);
  if (costly && loss) {
    await You(S("owe %s %ld %s for burying merchandise."), await mon_nam(shkp), loss, await currency(loss));
  }
}

export async function unearth_objs(x: number, y: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  let bball = null;
  let cc = new struct_nhcoord();
  do {
    if (await debugcore(S("dig.c"), 1)) {
      await pline(S("unearth_objs: at <%d,%d>"), x, y);
    }
  } while (0);
  cc.x = x << 24 >> 24;
  cc.y = y << 24 >> 24;
  bball = buried_ball(cc);
  for (otmp = G.level.buriedobjlist; otmp; otmp = otmp2) {
    otmp2 = otmp.nobj;
    if (otmp.ox === x && otmp.oy === y) {
      if (bball && otmp === bball && G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
        await buried_ball_to_punishment();
      } else {
        await obj_extract_self(otmp);
        if (otmp.timed) {
          await stop_timer(ROT_ORGANIC, obj_to_any(otmp));
        }
        await place_object(otmp, x, y);
        await stackobj(otmp);
      }
    }
  }
  await del_engr_at(x, y);
  await newsym(x, y);
}

export async function rot_organic(arg: union_any | null, timeout: number): Promise<void> {
  let obj = arg.a_obj;
  while (!!obj.cobj) {
    obj.cobj.ox = obj.ox, obj.cobj.oy = obj.oy;
    await bury_an_obj(obj.cobj, null);
  }
  await obj_extract_self(obj);
  await obfree(obj, null);
}

export async function rot_corpse(arg: union_any | null, timeout: number): Promise<void> {
  let x = 0;
  let y = 0;
  let obj = arg.a_obj;
  let on_floor = (obj.where === OBJ_FLOOR ? 1 : 0) << 24 >> 24;
  let in_invent = (obj.where === OBJ_INVENT ? 1 : 0) << 24 >> 24;
  if (on_floor) {
    x = obj.ox;
    y = obj.oy;
  } else if (in_invent) {
    if (G.flags.verbose) {
      let cname = await corpse_xname(obj, null, CXN_NO_PFX);
      await Your(S("%s%s %s away%c"), obj === G.uwep ? S("wielded ") : S(""), cname, otense(obj, S("rot")), obj === G.uwep ? 33 : 46);
    }
    if (obj === G.uwep) {
      await uwepgone();
      await stop_occupation();
    } else if (obj === G.uswapwep) {
      await uswapwepgone();
      await stop_occupation();
    } else if (obj === G.uquiver) {
      await uqwepgone();
      await stop_occupation();
    }
  } else if (obj.where === OBJ_MINVENT && obj.owornmask) {
    if (obj === obj.v.v_ocarry.mw) {
      await setmnotwielded(obj.v.v_ocarry, obj);
    }
  } else if (obj.where === OBJ_MIGRATING) {
    obj.owornmask = 0;
  }
  await rot_organic(arg, timeout);
  if (on_floor) {
    let mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
    if (mtmp && !!!G.level.objects[x][y] && mtmp.mundetected | 0 && (mtmp.data.mflags1 & 128) >>> 0 !== 0) {
      mtmp.mundetected = 0;
    } else if (x === G.u.ux && y === G.u.uy && G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
      hideunder(G.youmonst);
    }
    await newsym(x, y);
  } else if (in_invent) {
    update_inventory();
  }
}

export async function wiz_debug_cmd_bury(): Promise<number> {
  let x = 0;
  let y = 0;
  for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
    for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
      if (isok(x, y)) {
        await bury_objs(x, y);
      }
    }
  }
  return 0;
}

export function $init(): void {
  did_dig_msg = 0;
  dig$d_target = [S(""),
S("rock"),
S("statue"),
S("boulder"),
S("door"),
S("tree")];
  use_pick_axe2$d_action = [S("swinging"),
S("digging"),
S("chipping the statue"),
S("hitting the boulder"),
S("chopping at the door"),
S("cutting the tree")];
  draft_message$draft_reaction = [S("enlisting"),
S("marching"),
S("protesting"),
S("fleeing")];
}
