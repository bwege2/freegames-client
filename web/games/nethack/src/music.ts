// @ts-nocheck
// NetHack 3.6.7 music.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { acurr, exercise } from './attrib.ts';
import { getdir, isok, yn_function } from './cmd.ts';
import { close_drawbridge, find_drawbridge, is_drawbridge_wall, open_drawbridge } from './dbridge.ts';
import { fillholetyp, liquid_flow } from './dig.ts';
import { newsym } from './display.ts';
import { flooreffects } from './do.ts';
import { Amonnam, Monnam, a_monnam, mon_nam, x_monnam } from './do_name.ts';
import { tamedog } from './dog.ts';
import { In_V_tower, on_level } from './dungeon.ts';
import { in_rooms, losehp } from './hack.ts';
import { dist2, highc, mungspaces } from './hacklib.ts';
import { consume_obj_charge, sobj_at } from './invent.ts';
import { sleep_monst, slept_monst } from './mhitm.ts';
import { obj_extract_self } from './mkobj.ts';
import { wakeup, xkilled } from './mon.ts';
import { can_blow } from './mondata.ts';
import { monflee, onscary } from './monmove.ts';
import { discover_object } from './o_init.ts';
import { Tobjnam, Yname2, an, distant_name, the, xname, yname } from './objnam.ts';
import { Norep, You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The } from './pline.ts';
import { incr_itimeout } from './potion.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { add_damage } from './shk.ts';
import { maketrap, mselftouch, reset_utrap, selftouch, set_utrap, t_at } from './trap.ts';
import { unblock_point } from './vision.ts';
import { worm_known } from './worm.ts';
import { buzz, resist, zapyourself } from './zap.ts';
import { struct_monst, struct_obj } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, sprintf, strcmp, strcpy, strlen } from './rt/index.ts';
import { AD_COLD, AD_FIRE, ALTAR, ARTICLE_THE, A_DEX, A_WIS, BLINDED, BOULDER, BUGLE, COLNO, CONFUSION, CORR, DEAF, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, DRUM_OF_EARTHQUAKE, D_NODOOR, FALSE, FIRE_HORN, FLYING, FOUNTAIN, FROST_HORN, FUMBLING, GRAVE, HALF_PHDAM, HALLUC, HALLUC_RES, INFRAVISION, KILLED_BY, LEATHER_DRUM, LEVITATION, MAGIC_FLUTE, NOTELL, NO_KILLER_PREFIX, PIT, PLAY_CONFUSED, PLAY_HALLU, PLAY_NORMAL, PLAY_STUNNED, PM_GUARD, ROOM, ROWNO, SEE_INVIS, SHOPBASE, SINK, SPIKED_PIT, STRAT_WAITMASK, STUNNED, SUPPRESS_SADDLE, S_NYMPH, S_SNAKE, THRONE, TOOLED_HORN, TOOL_CLASS, TRUE, TT_BURIEDBALL, TT_PIT, WOODEN_FLUTE, XKILL_NOMSG } from './consts.ts';


async function awaken_monsters(distance: number): Promise<void> {
  let mtmp = null;
  let distm = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if ((distm = dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy)) < distance) {
      mtmp.msleeping = 0;
      mtmp.mcanmove = 1;
      mtmp.mfrozen = 0;
      if (!((mtmp.data.geno & 4096) !== 0) && (mtmp.mstrategy & STRAT_WAITMASK) >>> 0 !== 0) {
        mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      } else if (distm < (distance / 3 | 0) && !await resist(mtmp, TOOL_CLASS, 0, NOTELL) && onscary(0, 0, mtmp)) {
        await monflee(mtmp, 0, FALSE, TRUE);
      }
    }
  }
}

async function put_monsters_to_sleep(distance: number): Promise<void> {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) < distance && await sleep_monst(mtmp, d(10, 10), TOOL_CLASS)) {
      mtmp.msleeping = 1;
      await slept_monst(mtmp);
    }
  }
}

async function charm_snakes(distance: number): Promise<void> {
  let mtmp = null;
  let could_see_mon = 0;
  let was_peaceful = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.data.mlet === S_SNAKE && mtmp.mcanmove | 0 && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) < distance) {
      was_peaceful = mtmp.mpeaceful | 0;
      mtmp.mpeaceful = 1;
      mtmp.mavenge = 0;
      mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      could_see_mon = (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0;
      mtmp.mundetected = 0;
      await newsym(mtmp.mx, mtmp.my);
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        if (!could_see_mon) {
          await You(S("notice %s, swaying with the music."), await a_monnam(mtmp));
        } else {
          await pline(S("%s freezes, then sways with the music%s."), await Monnam(mtmp), was_peaceful ? S("") : S(", and now seems quieter"));
        }
      }
    }
  }
}

async function calm_nymphs(distance: number): Promise<void> {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.data.mlet === S_NYMPH && mtmp.mcanmove | 0 && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) < distance) {
      mtmp.msleeping = 0;
      mtmp.mpeaceful = 1;
      mtmp.mavenge = 0;
      mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s listens cheerfully to the music, then seems quieter."), await Monnam(mtmp));
      }
    }
  }
}

export async function awaken_soldiers(bugler: struct_monst | null): Promise<void> {
  let mtmp = null;
  let distance = 0;
  let distm = 0;
  distance = (bugler === G.youmonst ? G.u.ulevel : bugler.data.mlevel) * 30;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if ((mtmp.data.mflags2 & 512) >>> 0 !== 0 && mtmp.data !== $sat(G.mons, PM_GUARD)) {
      mtmp.mpeaceful = (mtmp.msleeping = (mtmp.mfrozen = 0) & 1) & 1;
      mtmp.mcanmove = 1;
      mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s is now ready for battle!"), await Monnam(mtmp));
      } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await Norep(S("%s the rattle of battle gear being readied."), S("You hear"));
      }
    } else if ((distm = bugler === G.youmonst ? dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) : dist2(bugler.mx, bugler.my, mtmp.mx, mtmp.my)) < distance) {
      mtmp.msleeping = 0;
      mtmp.mcanmove = 1;
      mtmp.mfrozen = 0;
      if (!((mtmp.data.geno & 4096) !== 0) && (mtmp.mstrategy & STRAT_WAITMASK) >>> 0 !== 0) {
        mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      } else if (distm < (distance / 3 | 0) && !await resist(mtmp, TOOL_CLASS, 0, NOTELL)) {
        await monflee(mtmp, 0, FALSE, TRUE);
      }
    }
  }
}

async function charm_monsters(distance: number): Promise<void> {
  let mtmp = null;
  let mtmp2 = null;
  if (G.u.uswallow) {
    if (!await resist(G.u.ustuck, TOOL_CLASS, 0, NOTELL)) {
      await tamedog(G.u.ustuck, null);
    }
  } else {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
      mtmp2 = mtmp.nmon;
      if (mtmp.mhp < 1) {
        continue;
      }
      if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= distance) {
        if (!await resist(mtmp, TOOL_CLASS, 0, NOTELL)) {
          await tamedog(mtmp, null);
        }
      }
    }
  }
}

async function do_earthquake(force: number): Promise<void> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let mtmp = null;
  let otmp = null;
  let chasm = null;
  let trap_at_u = null;
  let start_x = 0;
  let start_y = 0;
  let end_x = 0;
  let end_y = 0;
  let filltype = 0;
  let tu_pit = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      trap_at_u = t_at(G.u.ux, G.u.uy);
      tu_pit = 0;
      if (trap_at_u) {
        tu_pit = ((trap_at_u.ttyp | 0) === PIT || (trap_at_u.ttyp | 0) === SPIKED_PIT ? 1 : 0) >>> 0;
      }
      start_x = G.u.ux - force * 2;
      start_y = G.u.uy - force * 2;
      end_x = G.u.ux + force * 2;
      end_y = G.u.uy + force * 2;
      start_x = start_x > 1 ? start_x : 1;
      start_y = start_y > 0 ? start_y : 0;
      end_x = end_x < 80 - 1 ? end_x : 80 - 1;
      end_y = end_y < 21 - 1 ? end_y : 21 - 1;
      x = start_x;
    case 2:
      if (!(x <= end_x)) { $g = 4; continue $L; }
      y = start_y;
    case 5:
      if (!(y <= end_y)) { $g = 7; continue $L; }
      if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
        await wakeup(mtmp, TRUE);
        if (mtmp.mundetected | 0 && (mtmp.data.mflags1 & 256) >>> 0 !== 0) {
          mtmp.mundetected = 0;
          if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
            await pline(S("%s is shaken loose from the ceiling!"), await Amonnam(mtmp));
          } else {
            await You_hear(S("a thumping sound."));
          }
          if (x === G.u.ux && y === G.u.uy) {
            await You(S("easily dodge the falling %s."), await mon_nam(mtmp));
          }
          await newsym(x, y);
        }
      }
      if (!!rn2(14 - force)) { $g = 8; continue $L; }
      switch ($at2(G.level.locations, x, y).typ) {
      case FOUNTAIN: { $g = 10; continue $L; }
      case SINK: { $g = 11; continue $L; }
      case ALTAR: { $g = 12; continue $L; }
      case GRAVE: { $g = 13; continue $L; }
      case THRONE: { $g = 14; continue $L; }
      case ROOM: { $g = 15; continue $L; }
      case CORR: { $g = 16; continue $L; }
      case DOOR: { $g = 17; continue $L; }
      default: { $g = 9; continue $L; }
      }
    case 10:
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("fountain falls into a chasm."));
      }
      { $g = 1; continue $L; }
    case 11:
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("kitchen sink falls into a chasm."));
      }
      { $g = 1; continue $L; }
    case 12:
      if ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) {
        { $g = 9; continue $L; };
      }
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("altar falls into a chasm."));
      }
      { $g = 1; continue $L; }
    case 13:
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("headstone topples into a chasm."));
      }
      { $g = 1; continue $L; }
    case 14:
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("throne falls into a chasm."));
      }
    case 15:
    case 16:
    case 1: // do_pit
      chasm = await maketrap(x, y, PIT);
      if (!chasm) {
        { $g = 9; continue $L; };
      }
      chasm.tseen = 1;
      $at2(G.level.locations, x, y).flags = 0;
      filltype = fillholetyp(x, y, FALSE);
      if (filltype !== ROOM) {
        $at2(G.level.locations, x, y).typ = filltype;
        await liquid_flow(x, y, filltype, chasm, null);
      }
      mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
      if (!!(otmp = sobj_at(BOULDER, x, y))) {
        if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
          await pline(S("KADOOM!  The boulder falls into a chasm%s!"), x === G.u.ux && y === G.u.uy ? S(" below you") : S(""));
        }
        if (mtmp) {
          mtmp.mtrapped = 0;
        }
        await obj_extract_self(otmp);
        await flooreffects(otmp, x, y, S(""));
        { $g = 9; continue $L; };
      }
      if (mtmp) {
        if (!((mtmp.data.mflags1 & 1) >>> 0 !== 0) && !((mtmp.data.mflags1 & 16) >>> 0 !== 0)) {
          let m_already_trapped = mtmp.mtrapped << 24 >> 24;
          mtmp.mtrapped = 1;
          if (!m_already_trapped) {
            if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
              await pline(S("%s falls into a chasm!"), await Monnam(mtmp));
            } else if ((mtmp.data.mflags1 & 131072) >>> 0 !== 0) {
              await You_hear(S("a scream!"));
            }
          }
          await mselftouch(mtmp, S("Falling, "), TRUE);
          if (!(mtmp.mhp < 1)) {
            mtmp.mhp -= rnd(m_already_trapped ? 4 : 6);
            if (mtmp.mhp < 1) {
              if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
                await pline(S("It is destroyed!"));
              } else {
                await You(S("destroy %s!"), mtmp.mtame ? await x_monnam(mtmp, ARTICLE_THE, S("poor"), mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE : 0, FALSE) : await mon_nam(mtmp));
              }
              await xkilled(mtmp, XKILL_NOMSG);
            }
          }
        }
      } else if (x === G.u.ux && y === G.u.uy) {
        if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
          await Your(S("chain breaks!"));
          await reset_utrap(TRUE);
        }
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0) {
          if (!tu_pit) {
            await pline(S("A chasm opens up under you!"));
            await You(S("don't fall in!"));
          }
        } else if (!tu_pit || !G.u.utrap || G.u.utrap && G.u.utraptype !== TT_PIT) {
          await You(S("fall into a chasm!"));
          set_utrap(rn2(6) + 2 >>> 0, TT_PIT);
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(6) + 1) / 2 | 0 : rnd(6), S("fell into a chasm"), NO_KILLER_PREFIX);
          await selftouch(S("Falling, you"));
        } else if (G.u.utrap && G.u.utraptype === TT_PIT) {
          let keepfooting = ((G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) && !rn2(5) || !rnl(G.urole.malenum === 328 ? 3 : 9) || acurr(A_DEX) > 7 && rn2(5) ? 1 : 0) << 24 >> 24;
          await You(S("are jostled around violently!"));
          set_utrap(rn2(6) + 2 >>> 0, TT_PIT);
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(keepfooting ? 2 : 4) + 1) / 2 | 0 : rnd(keepfooting ? 2 : 4), S("hurt in a chasm"), NO_KILLER_PREFIX);
          if (keepfooting) {
            await exercise(A_DEX, TRUE);
          } else {
            await selftouch(G.u.umonnum !== G.u.umonster && ((G.youmonst.data.mflags1 & 524288) >>> 0 !== 0 || (G.youmonst.data.mflags1 & 24576) >>> 0 === 24576) ? S("Shaken, you") : S("Falling down, you"));
          }
        }
      } else {
        await newsym(x, y);
      }
      { $g = 9; continue $L; };
    case 17:
      if (($at2(G.level.locations, x, y).flags | 0) === D_NODOOR) {
        { $g = 1; continue $L; }
      }
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("door collapses."));
      }
      if ($rd(in_rooms(x, y, SHOPBASE))) {
        await add_damage(x, y, 0);
      }
      $at2(G.level.locations, x, y).flags = (D_NODOOR) & 31;
      unblock_point(x, y);
      await newsym(x, y);
      { $g = 9; continue $L; };
    case 9:
    case 8:
    case 6:
      ++y;
      { $g = 5; continue $L; }
    case 7:
    case 3:
      ++x;
      { $g = 2; continue $L; }
    case 4:
    }
    break;
  }
}

export function generic_lvl_desc(): Ptr | null {
  if ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) {
    return S("astral plane");
  } else if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    return S("plane");
  } else if ((G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) {
    return S("sanctum");
  } else if (G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum) {
    return S("puzzle");
  } else if (In_V_tower(G.u.uz)) {
    return S("tower");
  } else {
    return S("dungeon");
  }
}

async function do_improvisation(instr: struct_obj | null): Promise<number> {
  let damage = 0;
  let mode = 0;
  let do_spec = !(G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic) ? 1 : 0;
  let itmp = new struct_obj();
  let mundane = FALSE;
  itmp.$cp(instr);
  itmp.oextra = null;
  if (!do_spec || instr.spe <= 0) {
    while (G.objects[itmp.otyp].oc_magic) {
      itmp.otyp = itmp.otyp - 1 << 16 >> 16;
      mundane = TRUE;
    }
  }
  mode = PLAY_NORMAL;
  if (G.u.uprops[STUNNED].intrinsic) {
    mode |= PLAY_STUNNED;
  }
  if (G.u.uprops[CONFUSION].intrinsic) {
    mode |= PLAY_CONFUSED;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    mode |= PLAY_HALLU;
  }
  if (!rn2(2)) {
    if (mode === (PLAY_STUNNED | PLAY_CONFUSED)) {
      mode = !rn2(2) ? PLAY_STUNNED : PLAY_CONFUSED;
    }
    if (mode & PLAY_HALLU) {
      mode = PLAY_HALLU;
    }
  }
  switch (mode) {
  case 0:
    await You(S("start playing %s."), await yname(instr));
    break;
  case 1:
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You(S("radiate an obnoxious droning sound."));
    } else {
      await You_feel(S("a monotonous vibration."));
    }
    break;
  case 2:
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You(S("generate a raucous noise."));
    } else {
      await You_feel(S("a jarring vibration."));
    }
    break;
  case 4:
    await You(S("disseminate a kaleidoscopic display of floating butterflies."));
    break;
  case PLAY_STUNNED | PLAY_CONFUSED:
  case PLAY_STUNNED | PLAY_HALLU:
  case PLAY_CONFUSED | PLAY_HALLU:
  case PLAY_STUNNED | PLAY_CONFUSED | PLAY_HALLU:
  default:
    await pline(S("What you perform is quite far from music..."));
    break;
  }
  switch (itmp.otyp) {
  case 223:
    await consume_obj_charge(instr, TRUE);
    await You(S("%sproduce %s music."), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("") : S("seem to "), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("piped") : S("soft"));
    await put_monsters_to_sleep(G.u.ulevel * 5);
    await exercise(A_DEX, TRUE);
    break;
  case 222:
    do_spec &= rn2(acurr(A_DEX)) + G.u.ulevel > 25 ? 1 : 0;
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s."), await Tobjnam(instr, do_spec ? S("trill") : S("toot")));
    } else {
      await You_feel(S("%s %s."), await yname(instr), do_spec ? S("trill") : S("toot"));
    }
    if (do_spec) {
      await charm_snakes(G.u.ulevel * 3);
    }
    await exercise(A_DEX, TRUE);
    break;
  case 226:
  case 225:
    await consume_obj_charge(instr, TRUE);
    if (!await getdir(null)) {
      await pline(S("%s."), await Tobjnam(instr, S("vibrate")));
      break;
    } else if (!G.u.dx && !G.u.dy && !G.u.dz) {
      if ((damage = await zapyourself(instr, TRUE)) !== 0) {
        let buf = new Int8Array(256);
        sprintf(P(buf), S("using a magical horn on %sself"), G.genders[G.flags.female ? 1 : 0].him);
        await losehp(damage, P(buf), KILLED_BY);
      }
    } else {
      await buzz(instr.otyp === FROST_HORN ? AD_COLD - 1 : AD_FIRE - 1, rn2(6) + 6, G.u.ux, G.u.uy, G.u.dx, G.u.dy);
    }
    await discover_object(instr.otyp, 1, 1);
    break;
  case 224:
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You(S("produce a frightful, grave sound."));
    } else {
      await You(S("blow into the horn."));
    }
    await awaken_monsters(G.u.ulevel * 30);
    await exercise(A_WIS, FALSE);
    break;
  case 231:
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You(S("extract a loud noise from %s."), await yname(instr));
    } else {
      await You(S("blow into the bugle."));
    }
    await awaken_soldiers(G.youmonst);
    await exercise(A_WIS, FALSE);
    break;
  case 229:
    await consume_obj_charge(instr, TRUE);
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s very attractive music."), await Tobjnam(instr, S("produce")));
    } else {
      await You_feel(S("very soothing vibrations."));
    }
    await charm_monsters(((G.u.ulevel - 1) / 3 | 0) + 1);
    await exercise(A_DEX, TRUE);
    break;
  case 228:
    do_spec &= rn2(acurr(A_DEX)) + G.u.ulevel > 25 ? 1 : 0;
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s %s."), await Yname2(instr), do_spec ? S("produces a lilting melody") : S("twangs"));
    } else {
      await You_feel(S("soothing vibrations."));
    }
    if (do_spec) {
      await calm_nymphs(G.u.ulevel * 3);
    }
    await exercise(A_DEX, TRUE);
    break;
  case 233:
    await consume_obj_charge(instr, TRUE);
    await You(S("produce a heavy, thunderous rolling!"));
    await pline_The(S("entire %s is shaking around you!"), generic_lvl_desc());
    await do_earthquake(((G.u.ulevel - 1) / 3 | 0) + 1);
    await awaken_monsters(Math.imul(ROWNO, COLNO));
    await discover_object(233, 1, 1);
    break;
  case 232:
    if (!mundane) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await You(S("beat a deafening row!"));
        incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), rn2(20) + 30);
      } else {
        await You(S("pound on the drum."));
      }
      await exercise(A_WIS, FALSE);
    } else {
      await You(S("%s %s."), rn2(2) ? S("butcher") : rn2(2) ? S("manage") : S("pull off"), await an(G.beats[rn2(Math.trunc(64 / 8) | 0)]));
    }
    await awaken_monsters(Math.imul(G.u.ulevel, mundane ? 5 : 40));
    G.context.botl = TRUE;
    break;
  default:
    await impossible(S("What a weird instrument (%d)!"), instr.otyp);
    return 0;
  }
  return 2;
}

export async function do_play_instrument(instr: struct_obj | null): Promise<number> {
  let $g = 0;
  let buf = new Int8Array(256);
  let c = 0;
  let s = null;
  let x = new Int32Array(1);
  let y = new Int32Array(1);
  let ok = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      c = 121;
      if (G.u.uinwater) {
        await You_cant(S("play music underwater!"));
        return 0;
      } else if ((instr.otyp === WOODEN_FLUTE || instr.otyp === MAGIC_FLUTE || instr.otyp === TOOLED_HORN || instr.otyp === FROST_HORN || instr.otyp === FIRE_HORN || instr.otyp === BUGLE) && !can_blow(G.youmonst)) {
        await You(S("are incapable of playing %s."), await the(await distant_name(instr, xname)));
        return 0;
      }
      if (instr.otyp !== LEATHER_DRUM && instr.otyp !== DRUM_OF_EARTHQUAKE && !(G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
        c = await yn_function(S("Improvise?"), P(G.ynqchars), 113);
        if (c === 113) {
          { $g = 1; continue $L; }
        }
      }
      if (c === 110) {
        if ((G.u.uevent.uheard_tune | 0) === 2) {
          c = await yn_function(S("Play the passtune?"), P(G.ynqchars), 113);
        }
        if (c === 113) {
          { $g = 1; continue $L; }
        } else if (c === 121) {
          strcpy(P(buf), P(G.tune));
        } else {
          await G.windowprocs.win_getlin(S("What tune are you playing? [5 notes, A-G]"), P(buf));
          mungspaces(P(buf));
          if ($rd(P(buf)) === 27) {
            { $g = 1; continue $L; }
          }
          for (s = P(buf); s.a[s.o]; s = s.add(1)) {
            s.a[s.o] = highc(s.a[s.o]);
            if (s.a[s.o] === 72) {
              s.a[s.o] = 66;
            }
          }
        }
        await You(!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("extract a strange sound from %s!") : S("can feel %s emitting vibrations."), await the(await xname(instr)));
        if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
          await exercise(A_WIS, TRUE);
          if (!strcmp(P(buf), P(G.tune))) {
            for (y[0] = G.u.uy - 1; y[0] <= G.u.uy + 1; ++y[0]) {
              for (x[0] = G.u.ux - 1; x[0] <= G.u.ux + 1; ++x[0]) {
                if (isok(x[0], y[0])) {
                  if (find_drawbridge(P(x, 0), P(y, 0))) {
                    G.u.uevent.uheard_tune = 2;
                    if ($at2(G.level.locations, x[0], y[0]).typ === DRAWBRIDGE_DOWN) {
                      await close_drawbridge(x[0], y[0]);
                    } else {
                      await open_drawbridge(x[0], y[0]);
                    }
                    return 1;
                  }
                }
              }
            }
          } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            if ((G.u.uevent.uheard_tune | 0) < 1) {
              G.u.uevent.uheard_tune = 1;
            }
            ok = FALSE;
            for (y[0] = G.u.uy - 1; y[0] <= G.u.uy + 1 && !ok; ++y[0]) {
              for (x[0] = G.u.ux - 1; x[0] <= G.u.ux + 1 && !ok; ++x[0]) {
                if (isok(x[0], y[0])) {
                  if ($at2(G.level.locations, x[0], y[0]).typ === DRAWBRIDGE_UP || $at2(G.level.locations, x[0], y[0]).typ === DRAWBRIDGE_DOWN || is_drawbridge_wall(x[0], y[0]) >= 0) {
                    ok = TRUE;
                  }
                }
              }
            }
            if (ok) {
              let tumblers = 0;
              let gears = 0;
              let matched = new Int8Array(5);
              tumblers = gears = 0;
              for (x[0] = 0; x[0] < 5; ++x[0]) {
                matched[x[0]] = FALSE;
              }
              for (x[0] = 0; x[0] < (strlen(P(buf)) | 0); ++x[0]) {
                if (x[0] < 5) {
                  if (buf[x[0]] === G.tune[x[0]]) {
                    ++gears;
                    matched[x[0]] = TRUE;
                  } else {
                    for (y[0] = 0; y[0] < 5; ++y[0]) {
                      if (!matched[y[0]] && buf[x[0]] === G.tune[y[0]] && buf[y[0]] !== G.tune[y[0]]) {
                        ++tumblers;
                        matched[y[0]] = TRUE;
                        break;
                      }
                    }
                  }
                }
              }
              if (tumblers) {
                if (gears) {
                  await You_hear(S("%d tumbler%s click and %d gear%s turn."), tumblers, tumblers === 1 ? S("") : S("s"), gears, gears === 1 ? S("") : S("s"));
                } else {
                  await You_hear(S("%d tumbler%s click."), tumblers, tumblers === 1 ? S("") : S("s"));
                }
              } else if (gears) {
                await You_hear(S("%d gear%s turn."), gears, gears === 1 ? S("") : S("s"));
                if (gears === 5) {
                  G.u.uevent.uheard_tune = 2;
                }
              }
            }
          }
        }
        return 1;
      } else {
        return await do_improvisation(instr);
      }
    case 1: // nevermind
      await pline(S("%s"), G.c_common_strings.c_Never_mind);
      return 0;
    }
    break;
  }
}

export function $init(): void {
  G.beats = [S("stepper"),
S("one drop"),
S("slow two"),
S("triple stroke roll"),
S("double shuffle"),
S("half-time shuffle"),
S("second line"),
S("train")];
}
