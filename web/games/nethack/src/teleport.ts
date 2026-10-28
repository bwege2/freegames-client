// @ts-nocheck
// NetHack 3.6.7 teleport.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { get_mleash, m_unleash, next_to_u } from './apply.ts';
import { acurr, exercise } from './attrib.ts';
import { drag_ball, move_bc, placebc, unplacebc } from './ball.ts';
import { isok, yn_function } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { buried_ball_to_punishment } from './dig.ts';
import { docrt, newsym, see_monsters, shieldeff } from './display.ts';
import { deferred_goto, flooreffects, revive_corpse, schedule_goto } from './do.ts';
import { Monnam, getpos, mon_nam } from './do_name.ts';
import { migrate_to_level } from './dog.ts';
import { In_W_tower, In_hell, In_quest, Is_botlevel, On_W_tower_level, assign_level, depth, dunlevs_in_dungeon, find_hell, get_level, ledger_no, lev_by_name, on_level, print_dungeon, u_on_newpos } from './dungeon.ts';
import { morehungry } from './eat.ts';
import { done } from './end.ts';
import { surface } from './engrave.ts';
import { debugcore } from './files.ts';
import { check_capacity, in_rooms, invocation_message, may_passwall, nomul, spoteffects, switch_terrain } from './hack.ts';
import { digit, dist2, distmin, eos } from './hacklib.ts';
import { addinv, prinv, sobj_at } from './invent.ts';
import { is_home_elemental } from './makemon.ts';
import { mksobj, obj_extract_self, place_object } from './mkobj.ts';
import { search_special, somexy } from './mkroom.ts';
import { hideunder, unstuck } from './mon.ts';
import { locomotion, set_mon_data } from './mondata.ts';
import { accessible, closed_door, onscary, set_apparxy } from './monmove.ts';
import { You, You_cant, You_feel, Your, impossible, pline, verbalize } from './pline.ts';
import { make_blinded } from './potion.ts';
import { inhistemple } from './priest.ts';
import { learnscroll } from './read.ts';
import { in_out_region, update_monster_region, update_player_regions } from './region.ts';
import { rn2, rnd, rnl } from './rnd.ts';
import { addtobill, costly_spot, inhishop, make_angry_shk, stolen_value, u_left_shop } from './shk.ts';
import { yelp } from './sounds.ts';
import { spelleffects, tport_spell } from './spell.ts';
import { place_monster } from './steed.ts';
import { initrack } from './track.ts';
import { deltrap, fill_pit, reset_utrap, seetrap, t_at, unconscious } from './trap.ts';
import { findgd, uleftvault, vault_occupied } from './vault.ts';
import { vision_recalc } from './vision.ts';
import { mon_has_amulet } from './wizard.ts';
import { place_worm_tail_randomly, remove_worm, worm_known } from './worm.ts';
import { struct_d_level, struct_monst, struct_nhcoord, struct_obj, struct_permonst, struct_tporttypes, struct_trap, union_any } from './structs.ts';
import { $at2, $rd, $sadd, $sarr, $sarrOf, $sat, $sdiff, $wr, G, P, S, atoi, free, memset, sprintf, strcat, strchr, strcmp, strcpy } from './rt/index.ts';
import { ADD_SPELL, AMULET_OF_YENDOR, ANTIMAGIC, ATR_NONE, A_STR, A_WIS, BLINDED, BOULDER, COLNO, CONFUSION, CORPSE, DIED, FALSE, FIRE_RES, FLYING, GP_ALLOW_XY, HIDE_SPELL, HOLE, INFRAVISION, I_SPECIAL, LEVEL_TELEP, LEVITATION, MAGICAL_BREATHING, MAGIC_PORTAL, MAXSPELL, MAX_GOOD, MENU_SELECTED, MENU_UNSELECTED, MIGR_PORTAL, MIGR_RANDOM, MM_IGNOREWATER, M_AP_NOTHING, NHW_MENU, NOOP_SPELL, NO_GLYPH, NO_KILLER_PREFIX, NO_MM_FLAGS, NO_TRAP, OBJ_FREE, PICK_ONE, PM_FLOATING_EYE, ROWNO, SEE_INVIS, SPE_TELEPORT_AWAY, STUNNED, SWIMMING, S_EEL, S_ELEMENTAL, S_EYE, S_LIGHT, S_MIMIC, TELEPORT, TELEPORT_CONTROL, TELEP_TRAP, TEMPLE, TRAPDOOR, TRUE, TT_BURIEDBALL, VAULT, VIASITTING, VIBRATING_SQUARE, WWALKING } from './consts.ts';

let telescroll: struct_obj | null;
let dotelecmd$tports: any;

export function goodpos(x: number, y: number, mtmp: struct_monst | null, gpflags: number): number {
  let mdat = null;
  let ignorewater = ((gpflags & MM_IGNOREWATER) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  if (!isok(x, y)) {
    return FALSE;
  }
  if (x === G.u.ux && y === G.u.uy && mtmp !== G.youmonst && (mtmp !== G.u.ustuck || !G.u.uswallow) && (!G.u.usteed || mtmp !== G.u.usteed)) {
    return FALSE;
  }
  if (mtmp) {
    let mtmp2 = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
    if (mtmp2 && (mtmp2 !== mtmp || mtmp.wormno | 0)) {
      return FALSE;
    }
    mdat = mtmp.data;
    if (is_pool(x, y) && !ignorewater) {
      if (mtmp === G.youmonst) {
        return (G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0 || (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0) || !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) ? 1 : 0) << 24 >> 24;
      } else {
        return ((mdat.mflags1 & 2) >>> 0 !== 0 || !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && (mdat.mlet === S_EYE || mdat.mlet === S_LIGHT || (mdat.mflags1 & 1) >>> 0 !== 0 || (mdat.mflags1 & 16) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
      }
    } else if (mdat.mlet === S_EEL && rn2(13) && !ignorewater) {
      return FALSE;
    } else if (is_lava(x, y)) {
      if (mdat === $sat(G.mons, PM_FLOATING_EYE)) {
        return FALSE;
      } else if (mtmp === G.youmonst) {
        return ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) && (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) && G.uarmf && G.uarmf.oerodeproof | 0 || G.u.umonnum !== G.u.umonster && (G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) ? 1 : 0) << 24 >> 24;
      } else {
        return (mdat.mlet === S_EYE || mdat.mlet === S_LIGHT || (mdat.mflags1 & 1) >>> 0 !== 0 || (mdat === $sat(G.mons, 152) || mdat === $sat(G.mons, 326)) ? 1 : 0) << 24 >> 24;
      }
    }
    if ((mdat.mflags1 & 8) >>> 0 !== 0 && may_passwall(x, y)) {
      return TRUE;
    }
    if ((mdat.mflags1 & 4) >>> 0 !== 0 && closed_door(x, y)) {
      return TRUE;
    }
  }
  if (!accessible(x, y)) {
    if (!(is_pool(x, y) && ignorewater)) {
      return FALSE;
    }
  }
  if (sobj_at(BOULDER, x, y) && (!mdat || !((mdat.mflags2 & 134217728) >>> 0 !== 0))) {
    return FALSE;
  }
  return TRUE;
}

export async function enexto(cc: struct_nhcoord | null, xx: number, yy: number, mdat: struct_permonst | null): Promise<number> {
  return await enexto_core(cc, xx, yy, mdat, NO_MM_FLAGS);
}

export async function enexto_core(cc: struct_nhcoord | null, xx: number, yy: number, mdat: struct_permonst | null, entflags: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let $g = 0;
  let good = $sarr(struct_nhcoord, 15);
  let good_ptr = null;
  let x = 0;
  let y = 0;
  let range = 0;
  let i = 0;
  let xmin = 0;
  let xmax = 0;
  let ymin = 0;
  let ymax = 0;
  let rangemax = 0;
  let fakemon = new struct_monst();
  let allow_xx_yy = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      good = $sarr(struct_nhcoord, 15);
      fakemon = new struct_monst();
      allow_xx_yy = ((entflags & GP_ALLOW_XY) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      entflags = (entflags & 4294934527) >>> 0;
      if (!mdat) {
        do {
          if (await debugcore(S("teleport.c"), 1)) {
            await pline(S("enexto() called with null mdat"));
          }
        } while (0);
        mdat = $sat(G.mons, G.u.umonster);
      }
      fakemon.$cp(G.zeromonst);
      await set_mon_data(fakemon, mdat);
      xmax = xx - 1 > 80 - 1 - xx ? xx - 1 : 80 - 1 - xx;
      ymax = yy - 0 > 21 - 1 - yy ? yy - 0 : 21 - 1 - yy;
      rangemax = xmax > ymax ? xmax : ymax;
      good_ptr = good[0];
      range = 1;
      do {
        xmin = 1 > xx - range ? 1 : xx - range;
        xmax = 80 - 1 < xx + range ? 80 - 1 : xx + range;
        ymin = 0 > yy - range ? 0 : yy - range;
        ymax = 21 - 1 < yy + range ? 21 - 1 : yy + range;
        for (x = xmin; x <= xmax; ++x) {
          if (goodpos(x, ymin, fakemon, entflags)) {
            good_ptr.x = x << 24 >> 24;
            good_ptr.y = ymin << 24 >> 24;
            if (($t1 = good_ptr, good_ptr = $sadd($t1, 1), $t1) === good[MAX_GOOD - 1]) {
              { $g = 1; continue $L; }
            }
          }
          if (goodpos(x, ymax, fakemon, entflags)) {
            good_ptr.x = x << 24 >> 24;
            good_ptr.y = ymax << 24 >> 24;
            if (($t2 = good_ptr, good_ptr = $sadd($t2, 1), $t2) === good[MAX_GOOD - 1]) {
              { $g = 1; continue $L; }
            }
          }
        }
        for (y = ymin; y < ymax; ++y) {
          if (goodpos(xmin, y, fakemon, entflags)) {
            good_ptr.x = xmin << 24 >> 24;
            good_ptr.y = y << 24 >> 24;
            if (($t3 = good_ptr, good_ptr = $sadd($t3, 1), $t3) === good[MAX_GOOD - 1]) {
              { $g = 1; continue $L; }
            }
          }
          if (goodpos(xmax, y, fakemon, entflags)) {
            good_ptr.x = xmax << 24 >> 24;
            good_ptr.y = y << 24 >> 24;
            if (($t4 = good_ptr, good_ptr = $sadd($t4, 1), $t4) === good[MAX_GOOD - 1]) {
              { $g = 1; continue $L; }
            }
          }
        }
      } while (++range <= rangemax && good_ptr === good[0]);
      if (good_ptr === good[0]) {
        cc.x = xx, cc.y = yy;
        if (allow_xx_yy && goodpos(xx, yy, fakemon, entflags)) {
          return TRUE;
        } else {
          do {
            if (await debugcore(S("teleport.c"), 1)) {
              await pline(S("enexto(\"%s\",%d,%d) failed"), mdat.mname, xx, yy);
            }
          } while (0);
          return FALSE;
        }
      }
    case 1: // full
      i = rn2($sdiff(good_ptr, good[0]) | 0);
      cc.x = good[i].x;
      cc.y = good[i].y;
      return TRUE;
    }
    break;
  }
}

function tele_jump_ok(x1: number, y1: number, x2: number, y2: number): number {
  if (!isok(x2, y2)) {
    return FALSE;
  }
  if (G.dndest.nlx > 0) {
    if (x1 >= G.dndest.nlx && x1 <= G.dndest.nhx && y1 >= G.dndest.nly && y1 <= G.dndest.nhy && !(x2 >= G.dndest.nlx && x2 <= G.dndest.nhx && y2 >= G.dndest.nly && y2 <= G.dndest.nhy)) {
      return FALSE;
    }
    if (!(x1 >= G.dndest.nlx && x1 <= G.dndest.nhx && y1 >= G.dndest.nly && y1 <= G.dndest.nhy) && (x2 >= G.dndest.nlx && x2 <= G.dndest.nhx && y2 >= G.dndest.nly && y2 <= G.dndest.nhy)) {
      return FALSE;
    }
  }
  if (G.updest.nlx > 0) {
    if (x1 >= G.updest.nlx && x1 <= G.updest.nhx && y1 >= G.updest.nly && y1 <= G.updest.nhy && !(x2 >= G.updest.nlx && x2 <= G.updest.nhx && y2 >= G.updest.nly && y2 <= G.updest.nhy)) {
      return FALSE;
    }
    if (!(x1 >= G.updest.nlx && x1 <= G.updest.nhx && y1 >= G.updest.nly && y1 <= G.updest.nhy) && (x2 >= G.updest.nlx && x2 <= G.updest.nhx && y2 >= G.updest.nly && y2 <= G.updest.nhy)) {
      return FALSE;
    }
  }
  return TRUE;
}

async function teleok(x: number, y: number, trapok: number): Promise<number> {
  if (!trapok) {
    let trap = t_at(x, y);
    if (trap && (trap.ttyp | 0) !== VIBRATING_SQUARE) {
      return FALSE;
    }
  }
  if (!goodpos(x, y, G.youmonst, 0)) {
    return FALSE;
  }
  if (!tele_jump_ok(G.u.ux, G.u.uy, x, y)) {
    return FALSE;
  }
  if (!await in_out_region(x, y)) {
    return FALSE;
  }
  return TRUE;
}

export async function teleds(nux: number, nuy: number, allow_drag: number): Promise<void> {
  let ball_active = 0;
  let ball_still_in_range = 0;
  let vault_guard = vault_occupied(P(G.u.urooms)) ? findgd() : null;
  if (G.u.utraptype === TT_BURIEDBALL) {
    await buried_ball_to_punishment();
  }
  ball_active = (!!G.uball && G.uball.where !== OBJ_FREE ? 1 : 0) << 24 >> 24;
  ball_still_in_range = FALSE;
  if (ball_active) {
    if (!(G.uball.where === 3) && distmin(nux, nuy, G.uball.ox, G.uball.oy) <= 2) {
      ball_still_in_range = TRUE;
    } else {
      if (!allow_drag || distmin(G.u.ux, G.u.uy, nux, nuy) > 1) {
        allow_drag = FALSE;
        await unplacebc();
      }
    }
  }
  await reset_utrap(FALSE);
  G.u.ustuck = null;
  G.u.ux0 = G.u.ux;
  G.u.uy0 = G.u.uy;
  if (!hideunder(G.youmonst) && G.youmonst.data.mlet === S_MIMIC) {
    G.youmonst.m_ap_type = M_AP_NOTHING;
  }
  if (G.u.uswallow) {
    G.u.uswldtim = G.u.uswallow = 0;
    if (!!G.uball && !ball_active) {
      ball_active = TRUE;
      allow_drag = FALSE;
    }
    await docrt();
  }
  if (ball_active) {
    if (ball_still_in_range || allow_drag) {
      const bc_control = new Int32Array(1);
      const ballx = new Int8Array(1);
      const bally = new Int8Array(1);
      const chainx = new Int8Array(1);
      const chainy = new Int8Array(1);
      const cause_delay = new Int8Array(1);
      if (await drag_ball(nux, nuy, P(bc_control, 0), P(ballx, 0), P(bally, 0), P(chainx, 0), P(chainy, 0), P(cause_delay, 0), allow_drag)) {
        await move_bc(0, bc_control[0], ballx[0], bally[0], chainx[0], chainy[0]);
      } else {
        allow_drag = FALSE;
        await unplacebc();
      }
    }
  }
  await u_on_newpos(nux, nuy);
  await fill_pit(G.u.ux0, G.u.uy0);
  if (ball_active) {
    if (!ball_still_in_range && !allow_drag) {
      await placebc();
    }
  }
  initrack();
  update_player_regions();
  await newsym(G.u.ux0, G.u.uy0);
  await see_monsters();
  G.vision_full_recalc = 1;
  nomul(0);
  await vision_recalc(0);
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ !== $at2(G.level.locations, G.u.ux0, G.u.uy0).typ) {
    await switch_terrain();
  }
  if (telescroll) {
    if (dist2(G.u.ux0, G.u.uy0, G.u.ux, G.u.uy) >= 16 || !($rd(G.viz_array.a[G.viz_array.o + G.u.uy0], G.u.ux0) & 1)) {
      await learnscroll(telescroll);
    } else {
      telescroll = null;
    }
  }
  if (vault_guard) {
    let save_urooms = new Int8Array(5);
    strcpy(P(save_urooms), P(G.u.urooms));
    strcpy(P(G.u.urooms), in_rooms(G.u.ux, G.u.uy, VAULT));
    if (!vault_occupied(P(G.u.urooms))) {
      await uleftvault(vault_guard);
    }
    strcpy(P(G.u.urooms), P(save_urooms));
  }
  await spoteffects(TRUE);
  await invocation_message();
}

export async function safe_teleds(allow_drag: number): Promise<number> {
  let nux = 0;
  let nuy = 0;
  let tcnt = 0;
  do {
    nux = rnd(COLNO - 1);
    nuy = rn2(ROWNO);
  } while (!await teleok(nux, nuy, (tcnt > 200 ? 1 : 0) << 24 >> 24) && ++tcnt <= 400);
  if (tcnt <= 400) {
    await teleds(nux, nuy, allow_drag);
    return TRUE;
  } else {
    return FALSE;
  }
}

async function vault_tele(): Promise<void> {
  let croom = search_special(VAULT);
  let c = new struct_nhcoord();
  if (croom && somexy(croom, c) && await teleok(c.x, c.y, FALSE)) {
    await teleds(c.x, c.y, FALSE);
    return;
  }
  await tele();
}

export async function teleport_pet(mtmp: struct_monst | null, force_it: number): Promise<number> {
  let $g = 0;
  let otmp = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (mtmp === G.u.usteed) {
        return FALSE;
      }
      if (!mtmp.mleashed) { $g = 2; continue $L; }
      otmp = get_mleash(mtmp);
      if (!otmp) {
        await impossible(S("%s is leashed, without a leash."), await Monnam(mtmp));
        { $g = 1; continue $L; }
      }
      if (!(otmp.cursed | 0 && !force_it)) { $g = 4; continue $L; }
      {
        await yelp(mtmp);
        return FALSE;
      }
      { $g = 3; continue $L; }
    case 4:
      await Your(S("leash goes slack."));
    case 1: // release_it
      await m_unleash(mtmp, FALSE);
      return TRUE;
    case 3:
    case 2:
      return TRUE;
    }
    break;
  }
}

export async function tele(): Promise<void> {
  await scrolltele(null);
}

export async function scrolltele(scroll: struct_obj | null): Promise<number> {
  let cc = new struct_nhcoord();
  let result = FALSE;
  if (G.level.flags.noteleport) {
    if (!G.flags.debug) {
      await pline(S("A mysterious force prevents you from teleporting!"));
      return TRUE;
    }
  }
  if (!G.u.uprops[BLINDED].intrinsic) {
    await make_blinded(0, FALSE);
  }
  if ((G.u.uhave.amulet | 0 || On_W_tower_level(G.u.uz)) && !rn2(3)) {
    await You_feel(S("disoriented for a moment."));
    if (!G.flags.debug || await yn_function(S("Override?"), P(G.ynchars), 110) !== 121) {
      return FALSE;
    }
  }
  if ((G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic) && !G.u.uprops[STUNNED].intrinsic || G.flags.debug) {
    if (unconscious()) {
      await pline(S("Being unconscious, you cannot control your teleport."));
    } else {
      let whobuf = new Int8Array(256);
      strcpy(P(whobuf), S("you"));
      if (G.u.usteed) {
        sprintf(eos(P(whobuf)), S(" and %s"), await mon_nam(G.u.usteed));
      }
      await pline(S("Where do %s want to be teleported?"), P(whobuf));
      cc.x = G.u.ux;
      cc.y = G.u.uy;
      if (await getpos(cc, TRUE, S("the desired position")) < 0) {
        return TRUE;
      }
      if (await teleok(cc.x, cc.y, FALSE)) {
        if (scroll) {
          await learnscroll(scroll);
        }
        await teleds(cc.x, cc.y, FALSE);
        return TRUE;
      }
      await pline(S("Sorry..."));
      result = TRUE;
    }
  } else if (scroll && scroll.blessed | 0) {
    if (await yn_function(S("Do you wish to teleport?"), P(G.ynchars), 110) === 110) {
      return TRUE;
    }
    result = TRUE;
  }
  telescroll = scroll;
  await safe_teleds(FALSE);
  if (telescroll) {
    result = TRUE;
  }
  telescroll = null;
  return result;
}

export async function dotelecmd(): Promise<number> {
  let $t1: any;
  let save_HTele = 0;
  let save_ETele = 0;
  let res = 0;
  let added = 0;
  let hidden = 0;
  let ignore_restrictions = FALSE;
  if (!G.flags.debug) {
    return await dotele(FALSE);
  }
  added = hidden = NOOP_SPELL;
  save_HTele = G.u.uprops[TELEPORT].intrinsic, save_ETele = G.u.uprops[TELEPORT].extrinsic;
  if (!G.iflags.menu_requested) {
    ignore_restrictions = TRUE;
  } else {
    const picks = [null];
    picks[0] = null;
    let any = new union_any();
    let win = 0;
    let i = 0;
    let tmode = 0;
    win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    await G.windowprocs.win_start_menu(win);
    any.$cp(G.zeroany);
    for (i = 0; i < (Math.trunc(64 / 16) | 0); ++i) {
      any.a_int = dotelecmd$tports[i].menulet;
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, any.a_int << 24 >> 24, 0, ATR_NONE, dotelecmd$tports[i].menudesc, dotelecmd$tports[i].menulet === 119 ? MENU_SELECTED : MENU_UNSELECTED);
    }
    await G.windowprocs.win_end_menu(win, S("Which way do you want to teleport?"));
    i = await G.windowprocs.win_select_menu(win, PICK_ONE, P(picks, 0));
    await G.windowprocs.win_destroy_nhwindow(win);
    if (i > 0) {
      tmode = picks[0].item.a_int;
      if (i > 1 && tmode === 119) {
        tmode = $sadd(picks[0], 1).item.a_int;
      }
      free(picks[0]);
    } else if (i === 0) {
      tmode = 119;
    } else {
      return 0;
    }
    switch (tmode) {
    case 110:
      ($t1 = G.u.uprops[TELEPORT], $t1.intrinsic = $t1.intrinsic | I_SPECIAL);
      hidden = await tport_spell(HIDE_SPELL);
      break;
    case 115:
      G.u.uprops[TELEPORT].intrinsic = G.u.uprops[TELEPORT].extrinsic = 0;
      added = await tport_spell(ADD_SPELL);
      break;
    case 116:
      G.u.uprops[TELEPORT].intrinsic = G.u.uprops[TELEPORT].extrinsic = 0;
      hidden = await tport_spell(HIDE_SPELL);
      break;
    case 119:
      ignore_restrictions = TRUE;
      break;
    }
  }
  res = await dotele(ignore_restrictions);
  G.u.uprops[TELEPORT].intrinsic = save_HTele;
  G.u.uprops[TELEPORT].extrinsic = save_ETele;
  if (added !== NOOP_SPELL || hidden !== NOOP_SPELL) {
    await tport_spell(added + hidden - NOOP_SPELL);
  }
  return res;
}

export async function dotele(break_the_rules: number): Promise<number> {
  let trap = null;
  let cantdoit = null;
  let trap_once = FALSE;
  trap = t_at(G.u.ux, G.u.uy);
  if (trap && (!trap.tseen || (trap.ttyp | 0) !== TELEP_TRAP)) {
    trap = null;
  }
  if (trap) {
    trap_once = trap.once << 24 >> 24;
    if (trap.once) {
      await pline(S("This is a vault teleport, usable once only."));
      if (await yn_function(S("Jump in?"), P(G.ynchars), 110) === 110) {
        trap = null;
      } else {
        await deltrap(trap);
        await newsym(G.u.ux, G.u.uy);
      }
    }
    if (trap) {
      await You(S("%s onto the teleportation trap."), locomotion(G.youmonst.data, S("jump")));
    }
  }
  if (!trap) {
    let castit = FALSE;
    let sp_no = 0;
    let energy = 0;
    if (!(G.u.uprops[TELEPORT].intrinsic || G.u.uprops[TELEPORT].extrinsic) || G.u.ulevel < (G.urole.malenum === 342 ? 8 : 12) && !((G.youmonst.data.mflags1 & 33554432) >>> 0 !== 0)) {
      for (sp_no = 0; sp_no < MAXSPELL; ++sp_no) {
        if (G.spl_book[sp_no].sp_id === SPE_TELEPORT_AWAY) {
          break;
        }
      }
      castit = (sp_no < MAXSPELL && !G.u.uprops[CONFUSION].intrinsic ? 1 : 0) << 24 >> 24;
      if (!castit && !break_the_rules) {
        await You(S("%s."), !(G.u.uprops[TELEPORT].intrinsic || G.u.uprops[TELEPORT].extrinsic) ? sp_no < MAXSPELL ? S("can't cast that spell") : S("don't know that spell") : S("are not able to teleport at will"));
        return 0;
      }
    }
    cantdoit = null;
    energy = 5 * G.objects[375].oc_oc2;
    if (break_the_rules) {
      if (!castit) {
        energy = 0;
      } else if (G.u.uen < energy) {
        G.u.uen = energy;
      }
    } else if (G.u.uhunger <= 10) {
      cantdoit = S("are too weak from hunger");
    } else if (acurr(A_STR) < 4) {
      cantdoit = S("lack the strength");
    } else if (energy > G.u.uen) {
      cantdoit = S("lack the energy");
    }
    if (cantdoit) {
      await You(S("%s %s."), cantdoit, castit ? S("for a teleport spell") : S("to teleport"));
      return 0;
    } else if (await check_capacity(S("Your concentration falters from carrying so much."))) {
      return 1;
    }
    if (castit) {
      await exercise(A_WIS, TRUE);
      if (await spelleffects(sp_no, TRUE)) {
        return 1;
      } else if (!break_the_rules) {
        return 0;
      }
    } else {
      G.u.uen -= energy;
      G.context.botl = 1;
    }
  }
  if (await next_to_u()) {
    if (trap && trap_once) {
      await vault_tele();
    } else {
      await tele();
    }
    await next_to_u();
  } else {
    await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
    return 0;
  }
  if (!trap) {
    await morehungry(100);
  }
  return 1;
}

export async function level_tele(): Promise<void> {
  let $g = 0;
  let newlev = 0;
  let newlevel = new struct_d_level();
  let escape_by_flying = null;
  let buf = new Int8Array(256);
  let force_dest = 0;
  let qbuf = new Int8Array(256);
  let trycnt = 0;
  let destlev = new Int8Array(1);
  let destdnum = new Int8Array(1);
  $L: for (;;) {
    switch ($g) {
    case 0:
      newlevel = new struct_d_level();
      escape_by_flying = null;
      buf = new Int8Array(256);
      force_dest = FALSE;
      if (G.iflags.debug_fuzzer) {
        { $g = 1; continue $L; }
      }
      if ((G.u.uhave.amulet | 0 || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum || G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum) && !G.flags.debug) {
        await You_feel(S("very disoriented for a moment."));
        return;
      }
      if (!((G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic) && !G.u.uprops[STUNNED].intrinsic || G.flags.debug)) { $g = 4; continue $L; }
      qbuf = new Int8Array(256);
      trycnt = 0;
      strcpy(P(qbuf), S("To what level do you want to teleport?"));
    case 5:
      if (G.iflags.menu_requested) {
        G.iflags.menu_requested = FALSE;
        if (G.flags.debug) {
          { $g = 2; continue $L; }
        }
      }
      if (++trycnt === 2) {
        if (G.flags.debug) {
          strcat(P(qbuf), S(" [type a number, name, or ? for a menu]"));
        } else {
          strcat(P(qbuf), S(" [type a number or name]"));
        }
      }
      $wr(P(buf), 0, 0);
      await G.windowprocs.win_getlin(P(qbuf), P(buf));
      if (!strcmp(P(buf), S("\x1b"))) {
        if (G.u.uprops[CONFUSION].intrinsic && rnl(5)) {
          await pline(S("Oops..."));
          { $g = 1; continue $L; }
        }
        return;
      } else if (!strcmp(P(buf), S("*"))) {
        { $g = 1; continue $L; }
      } else if (G.u.uprops[CONFUSION].intrinsic && rnl(5)) {
        await pline(S("Oops..."));
        { $g = 1; continue $L; }
      }
      if (!(G.flags.debug && !strcmp(P(buf), S("?")))) { $g = 9; continue $L; }
    case 2: // levTport_menu
      destlev[0] = 0;
      destdnum[0] = 0;
      newlev = await print_dungeon(TRUE, P(destlev, 0), P(destdnum, 0));
      if (!newlev) {
        return;
      }
      newlevel.dnum = destdnum[0];
      newlevel.dlevel = destlev[0];
      if (newlevel.dnum === G.dungeon_topology.d_astral_level.dnum && !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum)) {
        let amu = null;
        if (!G.u.uhave.amulet && !!(amu = await mksobj(AMULET_OF_YENDOR, TRUE, FALSE))) {
          amu = await addinv(amu);
          await prinv(S("Endgame prerequisite:"), amu, 0);
        }
      }
      force_dest = TRUE;
      { $g = 8; continue $L; }
    case 9:
      if ((newlev = await lev_by_name(P(buf))) === 0) {
        newlev = atoi(P(buf));
      }
    case 8:
    case 6:
      if (!newlev && !digit(buf[0]) && (buf[0] !== 45 || !digit(buf[1])) && trycnt < 10) { $g = 5; continue $L; }
    case 7:
      if (newlev === 0) {
        if (trycnt >= 10) {
          { $g = 1; continue $L; }
        }
        if (await yn_function(S("Go to Nowhere.  Are you sure?"), P(G.ynqchars), 113) !== 121) {
          return;
        }
        await You(S("%s in agony as your body begins to warp..."), G.youmonst.data.msound === 0 ? S("writhe") : S("scream"));
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
        await You(S("cease to exist."));
        if (G.invent) {
          await Your(S("possessions land on the %s with a thud."), surface(G.u.ux, G.u.uy));
        }
        G.killer.format = NO_KILLER_PREFIX;
        strcpy(P(G.killer.name), S("committed suicide"));
        await done(DIED);
        await pline(S("An energized cloud of dust begins to coalesce."));
        await Your(S("body rematerializes%s."), G.invent ? S(", and you gather up all your possessions") : S(""));
        return;
      }
      if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level) && newlev > 0 && !force_dest) {
        await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
        return;
      }
      if (In_quest(G.u.uz) && newlev > 0) {
        newlev = newlev + G.dungeons[G.u.uz.dnum].depth_start - 1;
      }
      { $g = 3; continue $L; }
    case 4:
    case 1: // random_levtport
      newlev = random_teleport_level();
      if (newlev === depth(G.u.uz)) {
        await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
        return;
      }
    case 3:
      if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
        await buried_ball_to_punishment();
      }
      if (!await next_to_u() && !force_dest) {
        await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
        return;
      }
      if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
        let llimit = dunlevs_in_dungeon(G.u.uz);
        if (newlev >= 0 || newlev <= -llimit) {
          await You_cant(S("get there from here."));
          return;
        }
        newlevel.dnum = G.u.uz.dnum;
        newlevel.dlevel = llimit + newlev << 24 >> 24;
        await schedule_goto(newlevel, FALSE, FALSE, 0, null, null);
        return;
      }
      G.killer.name[0] = 0;
      if (G.iflags.debug_fuzzer && newlev < 0) {
        { $g = 1; continue $L; }
      }
      if (newlev < 0 && !force_dest) {
        if ($rd(P(G.u.ushops0))) {
          G.in_mklev = TRUE;
          await u_left_shop(P(G.u.ushops0), TRUE);
          $wr(P(G.u.ushops0), 0, $wr(P(G.u.ushops), 0, 0));
          G.in_mklev = FALSE;
        }
        if (newlev <= -10) {
          await You(S("arrive in heaven."));
          await verbalize(S("Thou art early, but we'll admit thee."));
          G.killer.format = NO_KILLER_PREFIX;
          strcpy(P(G.killer.name), S("went to heaven prematurely"));
        } else if (newlev === -9) {
          await You_feel(S("deliriously happy."));
          await pline(S("(In fact, you're on Cloud 9!)"));
          await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
        } else {
          await You(S("are now high above the clouds..."));
        }
        if (G.killer.name[0]) {
          ;
        } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          escape_by_flying = S("float gently down to earth");
        } else if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
          escape_by_flying = S("fly down to the ground");
        } else {
          await pline(S("Unfortunately, you don't know how to fly."));
          await You(S("plummet a few thousand feet to your death."));
          sprintf(P(G.killer.name), S("teleported out of the dungeon and fell to %s death"), G.genders[G.flags.female ? 1 : 0].his);
          G.killer.format = NO_KILLER_PREFIX;
        }
      }
      if (G.killer.name[0]) {
        let lsav = new struct_d_level();
        lsav.$cp(G.u.uz);
        G.u.uz.dnum = 0;
        G.u.uz.dlevel = (newlev <= -10 ? -10 : 0) << 24 >> 24;
        await done(DIED);
        escape_by_flying = S("find yourself back on the surface");
        G.u.uz.$cp(lsav);
      }
      if (escape_by_flying) {
        await You(S("%s."), escape_by_flying);
        newlevel.dnum = 0;
        newlevel.dlevel = 0;
      } else if (G.u.uz.dnum === G.dungeon_topology.d_medusa_level.dnum && newlev >= G.dungeons[G.u.uz.dnum].depth_start + dunlevs_in_dungeon(G.u.uz)) {
        if (!(G.flags.debug && force_dest)) {
          find_hell(newlevel);
        }
      } else {
        if (!G.flags.debug && In_hell(G.u.uz) && !G.u.uevent.invoked && newlev >= G.dungeons[G.u.uz.dnum].depth_start + dunlevs_in_dungeon(G.u.uz) - 1) {
          newlev = G.dungeons[G.u.uz.dnum].depth_start + dunlevs_in_dungeon(G.u.uz) - 2;
          await pline(S("Sorry..."));
        }
        if (In_quest(G.u.uz) && newlev < depth(G.dungeon_topology.d_qstart_level)) {
          newlev = depth(G.dungeon_topology.d_qstart_level);
        }
        if (!(G.flags.debug && force_dest)) {
          await get_level(newlevel, newlev);
        }
      }
      await schedule_goto(newlevel, FALSE, FALSE, 0, null, null);
      if (G.u.utotype && !G.context.mon_moving) {
        await deferred_goto();
      }
    }
    break;
  }
}

export async function domagicportal(ttmp: struct_trap | null): Promise<void> {
  let target_level = new struct_d_level();
  if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
    await buried_ball_to_punishment();
  }
  if (!await next_to_u()) {
    await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
    return;
  }
  if (!on_level(G.u.uz, G.u.uz0)) {
    return;
  }
  await You(S("activated a magic portal!"));
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && !G.u.uhave.amulet) {
    await You_feel(S("dizzy for a moment, but nothing happens..."));
    return;
  }
  target_level.$cp(ttmp.dst);
  await schedule_goto(target_level, FALSE, FALSE, 1, S("You feel dizzy for a moment, but the sensation passes."), null);
}

export async function tele_trap(trap: struct_trap | null): Promise<void> {
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum || (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic)) {
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
    }
    await You_feel(S("a wrenching sensation."));
  } else if (!await next_to_u()) {
    await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
  } else if (trap.once) {
    await deltrap(trap);
    await newsym(G.u.ux, G.u.uy);
    await vault_tele();
  } else {
    await tele();
  }
}

export async function level_tele_trap(trap: struct_trap | null, trflags: number): Promise<void> {
  let verbbuf = new Int8Array(256);
  if ((trflags & VIASITTING) >>> 0 !== 0) {
    strcpy(P(verbbuf), S("trigger"));
  } else {
    sprintf(P(verbbuf), S("%s onto"), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("float") : locomotion(G.youmonst.data, S("step")));
  }
  await You(S("%s a level teleport trap!"), P(verbbuf));
  if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
    await shieldeff(G.u.ux, G.u.uy);
  }
  if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    await You_feel(S("a wrenching sensation."));
    return;
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await You(S("are momentarily blinded by a flash of light."));
  } else {
    await You(S("are momentarily disoriented."));
  }
  await deltrap(trap);
  await newsym(G.u.ux, G.u.uy);
  await level_tele();
}

function rloc_pos_ok(x: number, y: number, mtmp: struct_monst | null): number {
  let xx = 0;
  let yy = 0;
  if (!goodpos(x, y, mtmp, 0)) {
    return FALSE;
  }
  xx = mtmp.mx;
  yy = mtmp.my;
  if (!xx) {
    if (G.dndest.nlx && On_W_tower_level(G.u.uz)) {
      return (((yy & 2) !== 0 ? 1 : 0) ^ (!(x >= G.dndest.nlx && x <= G.dndest.nhx && y >= G.dndest.nly && y <= G.dndest.nhy) ? 1 : 0)) << 24 >> 24;
    }
    if (G.updest.lx && (yy & 1) !== 0) {
      return (x >= G.updest.lx && x <= G.updest.hx && y >= G.updest.ly && y <= G.updest.hy && (!G.updest.nlx || !(x >= G.updest.nlx && x <= G.updest.nhx && y >= G.updest.nly && y <= G.updest.nhy)) ? 1 : 0) << 24 >> 24;
    }
    if (G.dndest.lx && (yy & 1) === 0) {
      return (x >= G.dndest.lx && x <= G.dndest.hx && y >= G.dndest.ly && y <= G.dndest.hy && (!G.dndest.nlx || !(x >= G.dndest.nlx && x <= G.dndest.nhx && y >= G.dndest.nly && y <= G.dndest.nhy)) ? 1 : 0) << 24 >> 24;
    }
  } else {
    if (mtmp.isshk | 0 && inhishop(mtmp)) {
      if (($at2(G.level.locations, x, y).roomno | 0) !== mtmp.mextra.eshk.shoproom) {
        return FALSE;
      }
    } else if (mtmp.ispriest | 0 && inhistemple(mtmp)) {
      if (($at2(G.level.locations, x, y).roomno | 0) !== mtmp.mextra.epri.shroom) {
        return FALSE;
      }
    }
    if (!tele_jump_ok(xx, yy, x, y)) {
      return FALSE;
    }
  }
  return TRUE;
}

export async function rloc_to(mtmp: struct_monst | null, x: number, y: number): Promise<void> {
  let oldx = mtmp.mx;
  let oldy = mtmp.my;
  let resident_shk = (mtmp.isshk | 0 && inhishop(mtmp) ? 1 : 0) << 24 >> 24;
  if (x === mtmp.mx && y === mtmp.my && (!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) === mtmp) {
    return;
  }
  if (oldx) {
    if (mtmp.wormno) {
      await remove_worm(mtmp);
    } else {
      G.level.monsters[oldx][oldy] = null;
      await newsym(oldx, oldy);
    }
  }
  memset(mtmp.mtrack[0], 0, 8);
  await place_monster(mtmp, x, y);
  await update_monster_region(mtmp);
  if (mtmp.wormno) {
    await place_worm_tail_randomly(mtmp, x, y);
  }
  if (G.u.ustuck === mtmp) {
    if (G.u.uswallow) {
      await u_on_newpos(mtmp.mx, mtmp.my);
      await docrt();
    } else if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
      await unstuck(mtmp);
    }
  }
  await newsym(x, y);
  set_apparxy(mtmp);
  if (resident_shk && !inhishop(mtmp)) {
    await make_angry_shk(mtmp, oldx, oldy);
  }
}

export async function rloc(mtmp: struct_monst | null, suppress_impossible: number): Promise<number> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let trycount = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (mtmp === G.u.usteed) {
        await tele();
        return TRUE;
      }
      if (mtmp.iswiz | 0 && mtmp.mx) {
        if (!await In_W_tower(G.u.ux, G.u.uy, G.u.uz)) {
          x = G.upstair.sx, y = G.upstair.sy;
        } else if (!G.dnladder.sx) {
          x = G.upladder.sx, y = G.upladder.sy;
        } else {
          x = G.dnladder.sx, y = G.dnladder.sy;
        }
        if (goodpos(x, y, mtmp, 0)) {
          { $g = 1; continue $L; }
        }
      }
      trycount = 0;
      do {
        x = rn2(80 - 3) + 2;
        y = rn2(ROWNO);
        if (trycount < 500 ? rloc_pos_ok(x, y, mtmp) : goodpos(x, y, mtmp, 0)) {
          { $g = 1; continue $L; }
        }
      } while (++trycount < 1000);
      for (x = 2; x < COLNO - 1; ++x) {
        for (y = 0; y < ROWNO; ++y) {
          if (goodpos(x, y, mtmp, 0)) {
            { $g = 1; continue $L; }
          }
        }
      }
      if (!suppress_impossible) {
        await impossible(S("rloc(): couldn't relocate monster"));
      }
      return FALSE;
    case 1: // found_xy
      await rloc_to(mtmp, x, y);
      return TRUE;
    }
    break;
  }
}

async function mvault_tele(mtmp: struct_monst | null): Promise<void> {
  let croom = search_special(VAULT);
  let c = new struct_nhcoord();
  if (croom && somexy(croom, c) && goodpos(c.x, c.y, mtmp, 0)) {
    await rloc_to(mtmp, c.x, c.y);
    return;
  }
  await rloc(mtmp, TRUE);
}

export async function tele_restrict(mon: struct_monst | null): Promise<number> {
  if (G.level.flags.noteleport) {
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
      await pline(S("A mysterious force prevents %s from teleporting!"), await mon_nam(mon));
    }
    return TRUE;
  }
  return FALSE;
}

export async function mtele_trap(mtmp: struct_monst | null, trap: struct_trap | null, in_sight: number): Promise<void> {
  let monname = null;
  if (await tele_restrict(mtmp)) {
    return;
  }
  if (await teleport_pet(mtmp, FALSE)) {
    monname = await Monnam(mtmp);
    if (trap.once) {
      await mvault_tele(mtmp);
    } else {
      await rloc(mtmp, TRUE);
    }
    if (in_sight) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s seems disoriented."), monname);
      } else {
        await pline(S("%s suddenly disappears!"), monname);
      }
      await seetrap(trap);
    }
  }
}

export async function mlevel_tele_trap(mtmp: struct_monst | null, trap: struct_trap | null, force_it: number, in_sight: number): Promise<number> {
  let tt = trap ? trap.ttyp | 0 : NO_TRAP;
  if (mtmp === G.u.ustuck) {
    return 0;
  }
  if (await teleport_pet(mtmp, force_it)) {
    let tolevel = new struct_d_level();
    let migrate_typ = MIGR_RANDOM;
    if (tt === HOLE || tt === TRAPDOOR) {
      if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
        assign_level(tolevel, G.dungeon_topology.d_valley_level);
      } else if (Is_botlevel(G.u.uz)) {
        if (in_sight && trap.tseen | 0) {
          await pline(S("%s avoids the %s."), await Monnam(mtmp), tt === HOLE ? S("hole") : S("trap"));
        }
        return 0;
      } else {
        await get_level(tolevel, depth(G.u.uz) + 1);
      }
    } else if (tt === MAGIC_PORTAL) {
      if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && (mon_has_amulet(mtmp) || await is_home_elemental(mtmp.data) || rn2(7))) {
        if (in_sight && mtmp.data.mlet !== S_ELEMENTAL) {
          await pline(S("%s seems to shimmer for a moment."), await Monnam(mtmp));
          await seetrap(trap);
        }
        return 0;
      } else {
        assign_level(tolevel, trap.dst);
        migrate_typ = MIGR_PORTAL;
      }
    } else if (tt === LEVEL_TELEP || tt === NO_TRAP) {
      let nlev = 0;
      if (mon_has_amulet(mtmp) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum || tt === NO_TRAP && onscary(0, 0, mtmp)) {
        if (in_sight) {
          await pline(S("%s seems very disoriented for a moment."), await Monnam(mtmp));
        }
        return 0;
      }
      if (tt === NO_TRAP) {
        assign_level(tolevel, G.u.uz);
      } else {
        nlev = random_teleport_level();
        if (nlev === depth(G.u.uz)) {
          if (in_sight) {
            await pline(S("%s shudders for a moment."), await Monnam(mtmp));
          }
          return 0;
        }
        await get_level(tolevel, nlev);
      }
    } else {
      await impossible(S("mlevel_tele_trap: unexpected trap type (%d)"), tt);
      return 0;
    }
    if (in_sight) {
      await pline(S("Suddenly, %s disappears out of sight."), await mon_nam(mtmp));
      if (trap) {
        await seetrap(trap);
      }
    }
    await migrate_to_level(mtmp, ledger_no(tolevel), migrate_typ, null);
    return 3;
  }
  return 0;
}

export async function rloco(obj: struct_obj | null): Promise<number> {
  let tx = 0;
  let ty = 0;
  let otx = 0;
  let oty = 0;
  let restricted_fall = 0;
  let try_limit = 4000;
  if (obj.otyp === CORPSE && ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 309))) {
    if (await revive_corpse(obj)) {
      return FALSE;
    }
  }
  await obj_extract_self(obj);
  otx = obj.ox;
  oty = obj.oy;
  restricted_fall = (otx === 0 && G.dndest.lx ? 1 : 0) << 24 >> 24;
  do {
    tx = rn2(80 - 3) + 2 << 24 >> 24;
    ty = rn2(ROWNO) << 24 >> 24;
    if (!--try_limit) {
      break;
    }
  } while (!goodpos(tx, ty, null, 0) || restricted_fall && (!(tx >= G.dndest.lx && tx <= G.dndest.hx && ty >= G.dndest.ly && ty <= G.dndest.hy) || G.dndest.nlx && (tx >= G.dndest.nlx && tx <= G.dndest.nhx && ty >= G.dndest.nly && ty <= G.dndest.nhy)) || G.dndest.nlx && On_W_tower_level(G.u.uz) && (tx >= G.dndest.nlx && tx <= G.dndest.nhx && ty >= G.dndest.nly && ty <= G.dndest.nhy ? 1 : 0) !== (otx >= G.dndest.nlx && otx <= G.dndest.nhx && oty >= G.dndest.nly && oty <= G.dndest.nhy ? 1 : 0));
  if (await flooreffects(obj, tx, ty, S("fall"))) {
    await newsym(otx, oty);
    return FALSE;
  } else if (otx === 0 && oty === 0) {
    ;
  } else {
    if (await costly_spot(otx, oty) && (!await costly_spot(tx, ty) || !strchr(in_rooms(tx, ty, 0), $rd(in_rooms(otx, oty, 0))))) {
      if (await costly_spot(G.u.ux, G.u.uy) && strchr(P(G.u.urooms), $rd(in_rooms(otx, oty, 0)))) {
        await addtobill(obj, FALSE, FALSE, FALSE);
      } else {
        await stolen_value(obj, otx, oty, FALSE, FALSE);
      }
    }
    await newsym(otx, oty);
  }
  await place_object(obj, tx, ty);
  await newsym(tx, ty);
  return TRUE;
}

export function random_teleport_level(): number {
  let nlev = 0;
  let max_depth = 0;
  let min_depth = 0;
  let cur_depth = depth(G.u.uz);
  if (!rn2(5) || (G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    return cur_depth;
  }
  if (In_quest(G.u.uz)) {
    let bottom = dunlevs_in_dungeon(G.u.uz);
    let qlocate_depth = G.dungeon_topology.d_qlocate_level.dlevel;
    if (G.dungeons[G.u.uz.dnum].dunlev_ureached < qlocate_depth) {
      bottom = qlocate_depth;
    }
    min_depth = G.dungeons[G.u.uz.dnum].depth_start;
    max_depth = bottom + (G.dungeons[G.u.uz.dnum].depth_start - 1);
  } else {
    min_depth = 1;
    max_depth = dunlevs_in_dungeon(G.u.uz) + (G.dungeons[G.u.uz.dnum].depth_start - 1);
    if (In_hell(G.u.uz) && !G.u.uevent.invoked) {
      max_depth -= 1;
    }
  }
  nlev = rn2(cur_depth + 3 - min_depth) + min_depth;
  if (nlev >= cur_depth) {
    ++nlev;
  }
  if (nlev > max_depth) {
    nlev = max_depth;
    if (Is_botlevel(G.u.uz)) {
      nlev -= rnd(3);
    }
  }
  if (nlev < min_depth) {
    nlev = min_depth;
    if (nlev === cur_depth) {
      nlev += rnd(3);
      if (nlev > max_depth) {
        nlev = max_depth;
      }
    }
  }
  return nlev;
}

export async function u_teleport_mon(mtmp: struct_monst | null, give_feedback: number): Promise<number> {
  let cc = new struct_nhcoord();
  if (mtmp.ispriest | 0 && $rd(in_rooms(mtmp.mx, mtmp.my, TEMPLE))) {
    if (give_feedback) {
      await pline(S("%s resists your magic!"), await Monnam(mtmp));
    }
    return FALSE;
  } else if (G.level.flags.noteleport | 0 && G.u.uswallow | 0 && mtmp === G.u.ustuck) {
    if (give_feedback) {
      await You(S("are no longer inside %s!"), await mon_nam(mtmp));
    }
    await unstuck(mtmp);
    await rloc(mtmp, TRUE);
  } else if ((mtmp.data === $sat(G.mons, 308) || mtmp.data === $sat(G.mons, 310) || mtmp.data === $sat(G.mons, 309)) && rn2(13) && await enexto(cc, G.u.ux, G.u.uy, mtmp.data)) {
    await rloc_to(mtmp, cc.x, cc.y);
  } else {
    await rloc(mtmp, TRUE);
  }
  return TRUE;
}

export function $init(): void {
  telescroll = null;
  dotelecmd$tports = $sarrOf([struct_tporttypes.$of(110, S("normal ^T on demand; no spell, obey restrictions")),
struct_tporttypes.$of(115, S("via spellcast; no intrinsic teleport")),
struct_tporttypes.$of(116, S("try ^T without having it; no spell")),
struct_tporttypes.$of(119, S("debug mode; ignore restrictions"))]);
}
