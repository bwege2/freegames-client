// @ts-nocheck
// NetHack 3.6.7 display.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { Sting_effects } from './artifact.ts';
import { bot, timebot } from './botl.ts';
import { isok } from './cmd.ts';
import { is_ice, is_pool, is_pool_or_lava } from './dbridge.ts';
import { on_level } from './dungeon.ts';
import { panic } from './end.ts';
import { can_reach_floor } from './engrave.ts';
import { dist2, sgn } from './hacklib.ts';
import { sobj_at, update_inventory } from './invent.ts';
import { cmap_to_type } from './mkroom.ts';
import { monsndx } from './mondata.ts';
import { impossible } from './pline.ts';
import { show_region, visible_region_at } from './region.ts';
import { t_at } from './trap.ts';
import { block_point, unblock_point, vision_recalc } from './vision.ts';
import { see_wsegs } from './worm.ts';
import { struct_gbuf_entry, struct_monst, struct_obj, struct_rm, struct_tmp_glyph, struct_trap } from './structs.ts';
import { $arr, $at2, $cs, $rd, $rows, $sadd, $sarr, $sat, $ta, $wr, G, P, S, free, rn2_on_display_rng } from './rt/index.ts';
import { AIR, ALTAR, BACKTRACK, BC_BALL, BC_CHAIN, BEAR_TRAP, BLCORNER, BLINDED, BOULDER, BRCORNER, CLOUD, COLNO, CORR, CROSSWALL, C_bl, C_blcorn, C_br, C_brcorn, C_crwall, C_tl, C_tlwall, C_tr, C_trcorn, C_tuwall, DBWALL, DB_UNDER, DETECTED, DETECT_MONSTERS, DISP_ALL, DISP_ALWAYS, DISP_BEAM, DISP_TETHER, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_BROKEN, D_CLOSED, D_ISOPEN, D_LOCKED, EXPL_MAX, FALSE, FOUNTAIN, GLYPH_BODY_OFF, GLYPH_CMAP_OFF, GLYPH_DETECT_OFF, GLYPH_EXPLODE_OFF, GLYPH_INVISIBLE, GLYPH_INVIS_OFF, GLYPH_OBJ_OFF, GLYPH_PET_OFF, GLYPH_RIDDEN_OFF, GLYPH_STATUE_OFF, GLYPH_SWALLOW_OFF, GLYPH_WARNING_OFF, GLYPH_ZAP_OFF, GRAVE, HALLUC, HALLUC_RES, HWALL, ICE, INFRAVISION, INVIS, IRONBARS, LADDER, LAVAPOOL, LA_DOWN, MAXPCHARS, MAX_GLYPH, MOAT, M_AP_FURNITURE, M_AP_MONSTER, M_AP_NOTHING, M_AP_OBJECT, NO_GLYPH, NO_TRAP, NUM_ZAP, PHYSICALLY_SEEN, PIT, PM_TENGU, POOL, PROT_FROM_SHAPE_CHANGERS, ROOM, ROWNO, SCORR, SDOOR, SEE_INVIS, SHIELD_COUNT, SINK, SPIKED_PIT, STAIRS, STATUE, STONE, SV0, SV1, SV2, SV3, SV4, SV5, SV6, SV7, SVALL, S_air, S_altar, S_arrow_trap, S_bars, S_blcorn, S_brcorn, S_cloud, S_corr, S_crwall, S_darkroom, S_dnladder, S_dnstair, S_fountain, S_grave, S_hcdbridge, S_hcdoor, S_hodbridge, S_hodoor, S_hwall, S_ice, S_lava, S_litcorr, S_ndoor, S_poisoncloud, S_pool, S_room, S_sink, S_stone, S_sw_bc, S_sw_bl, S_sw_br, S_sw_ml, S_sw_mr, S_sw_tc, S_sw_tl, S_sw_tr, S_tdwall, S_throne, S_tlcorn, S_tlwall, S_trcorn, S_tree, S_trwall, S_tuwall, S_upladder, S_upstair, S_vcdbridge, S_vcdoor, S_vodbridge, S_vodoor, S_vwall, S_water, TDWALL, TELEPAT, THRONE, TLCORNER, TLWALL, TMP_AT_MAX_GLYPHS, TRAPNUM, TRCORNER, TREE, TRUE, TRWALL, TUWALL, T_d, T_hwall, T_l, T_r, T_stone, T_tdwall, T_tlcorn, T_trcorn, T_u, VWALL, WARNCOUNT, WARNING, WARN_OF_MON, WATER, WEB, WM_C_INNER, WM_C_OUTER, WM_MASK, WM_T_BL, WM_T_BR, WM_T_LONG, WM_W_BOTTOM, WM_W_LEFT, WM_W_RIGHT, WM_W_TOP, WM_X_BL, WM_X_BLTR, WM_X_BR, WM_X_TL, WM_X_TLBR, WM_X_TR } from './consts.ts';

let tgfirst: struct_tmp_glyph;
let gbuf: any;
let gbuf_start: any;
let gbuf_stop: any;
let nul_gbuf: struct_gbuf_entry;
let wall_matrix: any;
let cross_matrix: any;
let tmp_at$tglyph: struct_tmp_glyph | null;
let swallowed$lastx: number;
let swallowed$lasty: number;
let under_water$lastx: number;
let under_water$lasty: number;
let under_water$dela: number;
let under_ground$dela: number;
let cls$in_cls: number;
let flush_screen$flushing: number;
let flush_screen$delay_flushing: number;
let t_warn$warn_str: any;

export async function magic_map_background(x: number, y: number, show: number): Promise<void> {
  let glyph = await back_to_glyph(x, y);
  let lev = $sat(G.level.locations[x], y);
  if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) && !lev.waslit) {
    if (lev.typ === ROOM && glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
      glyph = (G.flags.dark_room && G.iflags.wc_color ? (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? S_stone : S_darkroom : S_stone) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
    } else if (lev.typ === CORR && glyph === S_litcorr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
      glyph = S_corr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
    }
  }
  if (G.level.flags.hero_memory) {
    lev.glyph = glyph;
  }
  if (show) {
    await show_glyph(x, y, glyph);
  }
  G.lastseentyp[x][y] = $at2(G.level.locations, x, y).typ;
}

export async function map_background(x: number, y: number, show: number): Promise<void> {
  let glyph = await back_to_glyph(x, y);
  if (G.level.flags.hero_memory) {
    $at2(G.level.locations, x, y).glyph = glyph;
  }
  if (show) {
    await show_glyph(x, y, glyph);
  }
}

export async function map_trap(trap: struct_trap | null, show: number): Promise<void> {
  let x = trap.tx;
  let y = trap.ty;
  let glyph = S_arrow_trap + (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(TRAPNUM - 1) + 1 : trap.ttyp | 0) - 1 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  if (G.level.flags.hero_memory) {
    $at2(G.level.locations, x, y).glyph = glyph;
  }
  if (show) {
    await show_glyph(x, y, glyph);
  }
}

export async function map_object(obj: struct_obj | null, show: number): Promise<void> {
  let x = obj.ox;
  let y = obj.oy;
  let glyph = obj.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : obj.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : obj.otyp === 240 ? obj.corpsenm + (382 + (1 + (382 + (382 + 0)))) : obj.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0))))));
  if (G.level.flags.hero_memory) {
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && obj.otyp === STATUE) {
      $at2(G.level.locations, x, y).glyph = (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0))))));
    } else {
      $at2(G.level.locations, x, y).glyph = glyph;
    }
  }
  if (show) {
    await show_glyph(x, y, glyph);
  }
}

export async function map_invisible(x: number, y: number): Promise<void> {
  if (x !== G.u.ux || y !== G.u.uy) {
    if (G.level.flags.hero_memory) {
      $at2(G.level.locations, x, y).glyph = GLYPH_INVISIBLE;
    }
    await show_glyph(x, y, GLYPH_INVISIBLE);
  }
}

export async function unmap_invisible(x: number, y: number): Promise<number> {
  if (isok(x, y) && $at2(G.level.locations, x, y).glyph === 382 + (382 + 0)) {
    await unmap_object(x, y);
    await newsym(x, y);
    return TRUE;
  }
  return FALSE;
}

export async function unmap_object(x: number, y: number): Promise<void> {
  let trap = null;
  if (!G.level.flags.hero_memory) {
    return;
  }
  if (!!(trap = t_at(x, y)) && trap.tseen | 0 && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
    await map_trap(trap, 0);
  } else if ($at2(G.level.locations, x, y).seenv) {
    let lev = $sat(G.level.locations[x], y);
    await map_background(x, y, 0);
    if (!lev.waslit && lev.glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.typ === ROOM) {
      lev.glyph = S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
    }
  } else {
    $at2(G.level.locations, x, y).glyph = S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  }
}

export async function map_location(x: number, y: number, show: number): Promise<void> {
  {
    let obj = null;
    let trap = null;
    if ((obj = G.level.objects[x][y]) && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
      await map_object(obj, show);
    } else if ((trap = t_at(x, y)) && trap.tseen | 0 && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
      await map_trap(trap, show);
    } else {
      await map_background(x, y, show);
    }
    G.lastseentyp[x][y] = $at2(G.level.locations, x, y).typ;
  }
  ;
}

async function show_mon_or_warn(x: number, y: number, monglyph: number): Promise<void> {
  let o = null;
  if ($at2(G.level.locations, x, y).glyph === 382 + (382 + 0)) {
    await unmap_object(x, y);
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 && !!(o = G.level.objects[x][y])) {
      await map_object(o, FALSE);
    }
  }
  await show_glyph(x, y, monglyph);
}

async function display_monster(x: number, y: number, mon: struct_monst | null, sightflags: number, worm_tail: number): Promise<void> {
  let mon_mimic = ((mon.m_ap_type & 7) !== M_AP_NOTHING ? 1 : 0) << 24 >> 24;
  let sensed = mon_mimic && (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) ? 1 : 0;
  if (mon_mimic && sightflags === PHYSICALLY_SEEN) {
    switch (mon.m_ap_type & 7) {
    default:
      await impossible(S("display_monster:  bad m_ap_type value [ = %d ]"), mon.m_ap_type);
    case M_AP_NOTHING:
      await show_glyph(x, y, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mon.data)) + 0);
      break;
    case M_AP_FURNITURE:
      {
        let sym = mon.mappearance | 0;
        let glyph = sym + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        $at2(G.level.locations, x, y).glyph = glyph;
        if (!sensed) {
          await show_glyph(x, y, glyph);
          G.lastseentyp[x][y] = cmap_to_type(sym) << 24 >> 24;
        }
        break;
      }
    case M_AP_OBJECT:
      {
        let obj = new struct_obj();
        obj.$cp(G.zeroobj);
        obj.ox = x;
        obj.oy = y;
        obj.otyp = mon.mappearance << 16 >> 16;
        obj.corpsenm = mon.mextra && mon.mextra.mcorpsenm !== -1 ? mon.mextra.mcorpsenm : PM_TENGU;
        await map_object(obj, !sensed ? 1 : 0);
        break;
      }
    case M_AP_MONSTER:
      await show_glyph(x, y, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : mon.mappearance | 0) + 0);
      break;
    }
  }
  if (!mon_mimic || sensed) {
    let num = 0;
    if (mon.mtame && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
      if (worm_tail) {
        num = 327 + (382 + 0);
      } else {
        num = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mon.data)) + (382 + 0);
      }
    } else if (sightflags === DETECTED) {
      if (worm_tail) {
        num = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : 327) + (1 + (382 + (382 + 0)));
      } else {
        num = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mon.data)) + (1 + (382 + (382 + 0)));
      }
    } else {
      if (worm_tail) {
        num = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : 327) + 0;
      } else {
        num = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mon.data)) + 0;
      }
    }
    await show_mon_or_warn(x, y, num);
  }
}

async function display_warning(mon: struct_monst | null): Promise<void> {
  let x = mon.mx;
  let y = mon.my;
  let glyph = 0;
  if ((G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) && !mon.mpeaceful && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) < 100 && (mon.m_lev / 4 | 0) >= G.context.warnlevel) {
    let wl = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(WARNCOUNT - 1) + 1 : warning_of(mon);
    glyph = wl + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))));
  } else if ((G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)) {
    glyph = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mon.data)) + 0;
  } else {
    await impossible(S("display_warning did not match warning type?"));
    return;
  }
  await show_mon_or_warn(x, y, glyph);
}

export function warning_of(mon: struct_monst | null): number {
  let wl = 0;
  let tmp = 0;
  if ((G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) && !mon.mpeaceful && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) < 100 && (mon.m_lev / 4 | 0) >= G.context.warnlevel) {
    tmp = mon.m_lev / 4 | 0;
    wl = tmp > WARNCOUNT - 1 ? WARNCOUNT - 1 : tmp;
  }
  return wl;
}

export async function feel_newsym(x: number, y: number): Promise<void> {
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    await feel_location(x, y);
  } else {
    await newsym(x, y);
  }
}

export async function feel_location(x: number, y: number): Promise<void> {
  let lev = null;
  let boulder = null;
  let mon = null;
  if (!isok(x, y)) {
    return;
  }
  lev = $sat(G.level.locations[x], y);
  if (lev.glyph === 382 + (382 + 0) && (!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    return;
  }
  if (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !is_pool_or_lava(x, y) && !is_ice(x, y)) {
    return;
  }
  set_seenv(lev, G.u.ux, G.u.uy, x, y);
  if (!can_reach_floor(FALSE)) {
    if (lev.typ < POOL || lev.typ === DOOR && (lev.flags | 0) & (D_LOCKED | D_CLOSED)) {
      await map_background(x, y, 1);
    } else if (!!(boulder = sobj_at(BOULDER, x, y))) {
      await map_object(boulder, 1);
    } else if (lev.typ === DOOR) {
      await map_background(x, y, 1);
    } else if (lev.typ >= ROOM || lev.typ >= POOL && lev.typ <= DRAWBRIDGE_UP) {
      let do_room_glyph = 0;
      do_room_glyph = FALSE;
      if (lev.glyph === 448 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) || lev.glyph === 382 + (382 + 0)) {
        if (lev.typ !== ROOM && lev.seenv) {
          await map_background(x, y, 1);
        } else {
          do_room_glyph = TRUE;
        }
      } else if (lev.glyph >= S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.glyph < S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
        do_room_glyph = TRUE;
      }
      if (do_room_glyph) {
        lev.glyph = G.flags.dark_room && G.iflags.wc_color && !((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) ? S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : lev.waslit | 0 ? S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        await show_glyph(x, y, lev.glyph);
      }
    } else {
      await map_background(x, y, 1);
      if (lev.typ === CORR && lev.glyph === S_litcorr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && !lev.waslit) {
        await show_glyph(x, y, lev.glyph = S_corr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
      } else if (lev.typ === ROOM && G.flags.dark_room && G.iflags.wc_color && lev.glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
        await show_glyph(x, y, lev.glyph = S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
      }
    }
  } else {
    {
      let obj = null;
      let trap = null;
      if ((obj = G.level.objects[x][y]) && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
        await map_object(obj, 1);
      } else if ((trap = t_at(x, y)) && trap.tseen | 0 && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
        await map_trap(trap, 1);
      } else {
        await map_background(x, y, 1);
      }
      G.lastseentyp[x][y] = $at2(G.level.locations, x, y).typ;
    }
    ;
    if (!!G.uball) {
      if (G.uchain.ox === x && G.uchain.oy === y) {
        if (G.level.objects[x][y] === G.uchain) {
          G.u.bc_felt |= BC_CHAIN;
        } else {
          G.u.bc_felt &= ~BC_CHAIN;
        }
      }
      if (!(G.uball.where === 3) && G.uball.ox === x && G.uball.oy === y) {
        if (G.level.objects[x][y] === G.uball) {
          G.u.bc_felt |= BC_BALL;
        } else {
          G.u.bc_felt &= ~BC_BALL;
        }
      }
    }
    if (lev.typ === ROOM && lev.glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && (!lev.waslit || G.flags.dark_room && G.iflags.wc_color)) {
      await show_glyph(x, y, lev.glyph = (G.flags.dark_room ? S_darkroom : S_stone) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
    } else if (lev.typ === CORR && lev.glyph === S_litcorr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && !lev.waslit) {
      await show_glyph(x, y, lev.glyph = S_corr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
    }
  }
  if ((x !== G.u.ux || y !== G.u.uy) && !!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
    await display_monster(x, y, mon, !((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data) ? PHYSICALLY_SEEN : DETECTED, mon && (x !== mon.mx || y !== mon.my) ? 1 : 0);
  }
}

export async function newsym(x: number, y: number): Promise<void> {
  let $g = 0;
  let mon = null;
  let lev = null;
  let see_it = 0;
  let worm_tail = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      lev = $sat(G.level.locations[x], y);
      if (G.in_mklev) {
        return;
      }
      if (G.program_state.done_hup) {
        return;
      }
      if (G.u.uswallow) {
        if (x === G.u.ux && y === G.u.uy) {
          await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
        }
        return;
      }
      if (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
        if (!(is_pool_or_lava(x, y) || is_ice(x, y)) || dist2(x, y, G.u.ux, G.u.uy) > 2) {
          return;
        }
      }
      if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) { $g = 3; continue $L; }
      {
        let reg = visible_region_at(x, y);
        lev.waslit = (((lev.lit | 0) !== 0 ? 1 : 0) >>> 0) & 1;
        mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
        worm_tail = (mon && (x !== mon.mx || y !== mon.my) ? 1 : 0) << 24 >> 24;
        if (reg && (lev.typ >= DOOR || reg.glyph === S_poisoncloud + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && is_pool_or_lava(x, y)) && (!mon || worm_tail || !(!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
          await show_region(reg, x, y);
          return;
        }
        if (x === G.u.ux && y === G.u.uy) {
          let see_self = (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uswallow | 0 || !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.uundetected || (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic)) ? 1 : 0;
          {
            let obj = null;
            let trap = null;
            if ((obj = G.level.objects[x][y]) && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
              await map_object(obj, !see_self ? 1 : 0);
            } else if ((trap = t_at(x, y)) && trap.tseen | 0 && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
              await map_trap(trap, !see_self ? 1 : 0);
            } else {
              await map_background(x, y, !see_self ? 1 : 0);
            }
            G.lastseentyp[x][y] = $at2(G.level.locations, x, y).typ;
          }
          ;
          if (see_self) {
            await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
          }
        } else {
          see_it = mon && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected || !worm_tail && (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) ? 1 : 0;
          if (mon && (see_it || !worm_tail && (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic))) {
            if (mon.mtrapped) {
              let trap = t_at(x, y);
              let tt = trap ? trap.ttyp | 0 : NO_TRAP;
              if (tt === BEAR_TRAP || (tt === PIT || tt === SPIKED_PIT) || tt === WEB) {
                trap.tseen = 1;
              }
            }
            {
              let obj = null;
              let trap = null;
              if ((obj = G.level.objects[x][y]) && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
                await map_object(obj, 0);
              } else if ((trap = t_at(x, y)) && trap.tseen | 0 && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
                await map_trap(trap, 0);
              } else {
                await map_background(x, y, 0);
              }
              G.lastseentyp[x][y] = $at2(G.level.locations, x, y).typ;
            }
            ;
            await display_monster(x, y, mon, see_it ? PHYSICALLY_SEEN : DETECTED, worm_tail);
          } else if (mon && ((G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) && !mon.mpeaceful && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) < 100 && (mon.m_lev / 4 | 0) >= G.context.warnlevel) && !(mon && (x !== mon.mx || y !== mon.my))) {
            await display_warning(mon);
          } else if (lev.glyph === 382 + (382 + 0)) {
            await map_invisible(x, y);
          } else {
            let obj = null;
            let trap = null;
            if ((obj = G.level.objects[x][y]) && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
              await map_object(obj, 1);
            } else if ((trap = t_at(x, y)) && trap.tseen | 0 && !(is_pool(x, y) && !G.u.uinwater || $at2(G.level.locations, x, y).typ === LAVAPOOL)) {
              await map_trap(trap, 1);
            } else {
              await map_background(x, y, 1);
            }
            G.lastseentyp[x][y] = $at2(G.level.locations, x, y).typ;
          }
          ;
        }
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(x === G.u.ux && y === G.u.uy)) { $g = 5; continue $L; }
      {
        await feel_location(G.u.ux, G.u.uy);
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uswallow | 0 || !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.uundetected || (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic))) {
          await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
        }
      }
      { $g = 4; continue $L; }
    case 5:
      if (!(!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && ((see_it = !((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data) || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0) !== 0 || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic)))) { $g = 7; continue $L; }
      {
        await display_monster(x, y, mon, see_it ? 0 : DETECTED, mon && (x !== mon.mx || y !== mon.my) ? TRUE : FALSE);
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(mon && ((G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) && !mon.mpeaceful && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) < 100 && (mon.m_lev / 4 | 0) >= G.context.warnlevel) && !(mon && (x !== mon.mx || y !== mon.my)))) { $g = 9; continue $L; }
      {
        await display_warning(mon);
      }
      { $g = 8; continue $L; }
    case 9:
      if (!((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) { $g = 11; continue $L; }
      {
        if (lev.glyph === S_litcorr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.typ === CORR) {
          await show_glyph(x, y, lev.glyph = S_corr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        } else if (lev.glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.typ === ROOM && !lev.waslit) {
          await show_glyph(x, y, lev.glyph = S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        } else {
          { $g = 1; continue $L; }
        }
      }
      { $g = 10; continue $L; }
    case 11:
      if (!(!lev.waslit || G.flags.dark_room && G.iflags.wc_color)) { $g = 13; continue $L; }
      {
        if (lev.glyph === S_litcorr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.typ === CORR) {
          await show_glyph(x, y, lev.glyph = S_corr + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        } else if (lev.glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.typ === ROOM) {
          await show_glyph(x, y, lev.glyph = ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? S_stone : S_darkroom) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        } else {
          { $g = 1; continue $L; }
        }
      }
      { $g = 12; continue $L; }
    case 13:
    case 1: // show_mem
      await show_glyph(x, y, lev.glyph);
    case 12:
    case 10:
    case 8:
    case 6:
    case 4:
    case 2:
    }
    break;
  }
}

export async function shieldeff(x: number, y: number): Promise<void> {
  let i = 0;
  if (!G.flags.sparkle) {
    return;
  }
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    for (i = 0; i < SHIELD_COUNT; ++i) {
      await show_glyph(x, y, G.shield_static[i] + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
      await flush_screen(1);
      await G.windowprocs.win_delay_output();
    }
    await newsym(x, y);
  }
}

async function tether_glyph(x: number, y: number): Promise<number> {
  let tdx = 0;
  let tdy = 0;
  tdx = G.u.ux - x;
  tdy = G.u.uy - y;
  return await zapdir_to_glyph(sgn(tdx), sgn(tdy), 2);
}

export async function tmp_at(x: number, y: number): Promise<void> {
  let tmp = null;
  switch (x) {
  case -1:
  case -2:
  case -3:
  case -4:
  case -5:
    if (!tmp_at$tglyph) {
      tmp = tgfirst;
    } else {
      tmp = new struct_tmp_glyph();
    }
    tmp.prev = tmp_at$tglyph;
    tmp_at$tglyph = tmp;
    tmp_at$tglyph.sidx = 0;
    tmp_at$tglyph.style = x;
    tmp_at$tglyph.glyph = y;
    await flush_screen(0);
    return;
  case -8:
    while (tmp_at$tglyph) {
      tmp = tmp_at$tglyph.prev;
      if (tmp_at$tglyph !== tgfirst) {
        free(tmp_at$tglyph);
      }
      tmp_at$tglyph = tmp;
    }
    return;
  default:
    break;
  }
  if (!tmp_at$tglyph) {
    await panic(S("tmp_at: tglyph not initialized"));
  }
  switch (x) {
  case -6:
    tmp_at$tglyph.glyph = y;
    break;
  case -7:
    if (tmp_at$tglyph.style === DISP_BEAM || tmp_at$tglyph.style === DISP_ALL) {
      let i = 0;
      for (i = 0; i < tmp_at$tglyph.sidx; ++i) {
        await newsym(tmp_at$tglyph.saved[i].x, tmp_at$tglyph.saved[i].y);
      }
    } else if (tmp_at$tglyph.style === DISP_TETHER) {
      let i = 0;
      if (y === BACKTRACK && tmp_at$tglyph.sidx > 1) {
        for (i = tmp_at$tglyph.sidx - 1; i > 0; --i) {
          await newsym(tmp_at$tglyph.saved[i].x, tmp_at$tglyph.saved[i].y);
          await show_glyph(tmp_at$tglyph.saved[i - 1].x, tmp_at$tglyph.saved[i - 1].y, tmp_at$tglyph.glyph);
          await flush_screen(0);
          await G.windowprocs.win_delay_output();
        }
        tmp_at$tglyph.sidx = 1;
      }
      for (i = 0; i < tmp_at$tglyph.sidx; ++i) {
        await newsym(tmp_at$tglyph.saved[i].x, tmp_at$tglyph.saved[i].y);
      }
    } else {
      if (tmp_at$tglyph.sidx) {
        await newsym(tmp_at$tglyph.saved[0].x, tmp_at$tglyph.saved[0].y);
      }
    }
    tmp = tmp_at$tglyph.prev;
    if (tmp_at$tglyph !== tgfirst) {
      free(tmp_at$tglyph);
    }
    tmp_at$tglyph = tmp;
    break;
  default:
    if (!isok(x, y)) {
      break;
    }
    if (tmp_at$tglyph.style === DISP_BEAM || tmp_at$tglyph.style === DISP_ALL) {
      if (tmp_at$tglyph.style !== DISP_ALL && !($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
        break;
      }
      if (tmp_at$tglyph.sidx >= TMP_AT_MAX_GLYPHS) {
        break;
      }
      tmp_at$tglyph.saved[tmp_at$tglyph.sidx].x = x << 24 >> 24;
      tmp_at$tglyph.saved[tmp_at$tglyph.sidx].y = y << 24 >> 24;
      tmp_at$tglyph.sidx += 1;
    } else if (tmp_at$tglyph.style === DISP_TETHER) {
      if (tmp_at$tglyph.sidx >= TMP_AT_MAX_GLYPHS) {
        break;
      }
      if (tmp_at$tglyph.sidx) {
        let px = 0;
        let py = 0;
        px = tmp_at$tglyph.saved[tmp_at$tglyph.sidx - 1].x;
        py = tmp_at$tglyph.saved[tmp_at$tglyph.sidx - 1].y;
        await show_glyph(px, py, await tether_glyph(px, py));
      }
      tmp_at$tglyph.saved[tmp_at$tglyph.sidx].x = x << 24 >> 24;
      tmp_at$tglyph.saved[tmp_at$tglyph.sidx].y = y << 24 >> 24;
      tmp_at$tglyph.sidx += 1;
    } else {
      if (tmp_at$tglyph.sidx) {
        await newsym(tmp_at$tglyph.saved[0].x, tmp_at$tglyph.saved[0].y);
        tmp_at$tglyph.sidx = 0;
      }
      if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) && tmp_at$tglyph.style !== DISP_ALWAYS) {
        break;
      }
      tmp_at$tglyph.saved[0].x = x << 24 >> 24;
      tmp_at$tglyph.saved[0].y = y << 24 >> 24;
      tmp_at$tglyph.sidx = 1;
    }
    await show_glyph(x, y, tmp_at$tglyph.glyph);
    await flush_screen(0);
    break;
  }
}

export async function flash_glyph_at(x: number, y: number, tg: number, rpt: number): Promise<void> {
  let i = 0;
  let glyph = new Int32Array(2);
  rpt = rpt * 2;
  glyph[0] = tg;
  glyph[1] = G.level.flags.hero_memory | 0 ? $at2(G.level.locations, x, y).glyph : await back_to_glyph(x, y);
  for (i = 0; i < rpt; ++i) {
    await show_glyph(x, y, glyph[i % 2]);
    await flush_screen(1);
    await G.windowprocs.win_delay_output();
  }
}

export async function swallowed(first: number): Promise<void> {
  let swallower = 0;
  let left_ok = 0;
  let rght_ok = 0;
  if (first) {
    await cls();
    await bot();
  } else {
    let x = 0;
    let y = 0;
    for (y = swallowed$lasty - 1; y <= swallowed$lasty + 1; ++y) {
      for (x = swallowed$lastx - 1; x <= swallowed$lastx + 1; ++x) {
        if (isok(x, y)) {
          await show_glyph(x, y, S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        }
      }
    }
  }
  swallower = await monsndx(G.u.ustuck.data);
  left_ok = isok(G.u.ux - 1, G.u.uy);
  rght_ok = isok(G.u.ux + 1, G.u.uy);
  if (isok(G.u.ux, G.u.uy - 1)) {
    if (left_ok) {
      await show_glyph(G.u.ux - 1, G.u.uy - 1, await swallow_to_glyph(swallower, S_sw_tl));
    }
    await show_glyph(G.u.ux, G.u.uy - 1, await swallow_to_glyph(swallower, S_sw_tc));
    if (rght_ok) {
      await show_glyph(G.u.ux + 1, G.u.uy - 1, await swallow_to_glyph(swallower, S_sw_tr));
    }
  }
  if (left_ok) {
    await show_glyph(G.u.ux - 1, G.u.uy, await swallow_to_glyph(swallower, S_sw_ml));
  }
  await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
  if (rght_ok) {
    await show_glyph(G.u.ux + 1, G.u.uy, await swallow_to_glyph(swallower, S_sw_mr));
  }
  if (isok(G.u.ux, G.u.uy + 1)) {
    if (left_ok) {
      await show_glyph(G.u.ux - 1, G.u.uy + 1, await swallow_to_glyph(swallower, S_sw_bl));
    }
    await show_glyph(G.u.ux, G.u.uy + 1, await swallow_to_glyph(swallower, S_sw_bc));
    if (rght_ok) {
      await show_glyph(G.u.ux + 1, G.u.uy + 1, await swallow_to_glyph(swallower, S_sw_br));
    }
  }
  swallowed$lastx = G.u.ux;
  swallowed$lasty = G.u.uy;
}

export async function under_water(mode: number): Promise<void> {
  let x = 0;
  let y = 0;
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || G.u.uswallow | 0) {
    return;
  }
  if (mode === 1 || under_water$dela) {
    await cls();
    under_water$dela = FALSE;
  } else if (mode === 2) {
    under_water$dela = TRUE;
    return;
  } else {
    for (y = under_water$lasty - 1; y <= under_water$lasty + 1; ++y) {
      for (x = under_water$lastx - 1; x <= under_water$lastx + 1; ++x) {
        if (isok(x, y)) {
          await show_glyph(x, y, S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        }
      }
    }
  }
  for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
    for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
      if (isok(x, y) && (is_pool_or_lava(x, y) || is_ice(x, y))) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(x === G.u.ux && y === G.u.uy)) {
          await show_glyph(x, y, S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
        } else {
          await newsym(x, y);
        }
      }
    }
  }
  under_water$lastx = G.u.ux;
  under_water$lasty = G.u.uy;
}

export async function under_ground(mode: number): Promise<void> {
  if (G.u.uswallow) {
    return;
  }
  if (mode === 1 || under_ground$dela) {
    await cls();
    under_ground$dela = FALSE;
  } else if (mode === 2) {
    under_ground$dela = TRUE;
    return;
  } else {
    await newsym(G.u.ux, G.u.uy);
  }
}

export async function see_monsters(): Promise<void> {
  let mon = null;
  let new_warn_obj_cnt = 0;
  if (G.defer_see_monsters) {
    return;
  }
  for (mon = G.level.monlist; mon; mon = mon.nmon) {
    if (mon.mhp < 1) {
      continue;
    }
    await newsym(mon.mx, mon.my);
    if (mon.wormno) {
      await see_wsegs(mon);
    }
    if ((G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj & mon.data.mflags2) >>> 0 !== 0) {
      ++new_warn_obj_cnt;
    }
  }
  if (new_warn_obj_cnt !== G.warn_obj_cnt) {
    await Sting_effects(new_warn_obj_cnt);
    G.warn_obj_cnt = new_warn_obj_cnt;
  }
  if (!G.u.usteed) {
    await newsym(G.u.ux, G.u.uy);
  }
}

export function set_mimic_blocking(): void {
  let mon = null;
  for (mon = G.level.monlist; mon; mon = mon.nmon) {
    if (mon.mhp < 1) {
      continue;
    }
    if (mon.minvis | 0 && ((mon.m_ap_type & 7) === M_AP_OBJECT && mon.mappearance === 448 || (mon.m_ap_type & 7) === M_AP_FURNITURE && (mon.mappearance === S_hcdoor || mon.mappearance === S_vcdoor || mon.mappearance < S_ndoor || mon.mappearance === S_tree))) {
      if (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) {
        block_point(mon.mx, mon.my);
      } else {
        unblock_point(mon.mx, mon.my);
      }
    }
  }
}

export async function see_objects(): Promise<void> {
  let obj = null;
  for (obj = G.level.objlist; obj; obj = obj.nobj) {
    if (G.level.objects[obj.ox][obj.oy] === obj) {
      await newsym(obj.ox, obj.oy);
    }
  }
}

export async function see_traps(): Promise<void> {
  let trap = null;
  let glyph = 0;
  for (trap = G.ftrap; trap; trap = trap.ntrap) {
    glyph = glyph_at(trap.tx, trap.ty);
    if (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + (S_arrow_trap + 1 - 1) + TRAPNUM) {
      await newsym(trap.tx, trap.ty);
    }
  }
}

export async function curs_on_u(): Promise<void> {
  await flush_screen(1);
}

export async function doredraw(): Promise<number> {
  await docrt();
  return 0;
}

export async function docrt(): Promise<void> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let lev = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (!G.u.ux) {
        return;
      }
      if (G.u.uswallow) {
        await swallowed(1);
        { $g = 1; continue $L; }
      }
      if (G.u.uinwater | 0 && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
        await under_water(1);
        { $g = 1; continue $L; }
      }
      if (G.u.uburied) {
        await under_ground(1);
        { $g = 1; continue $L; }
      }
      await vision_recalc(2);
      await cls();
      for (x = 1; x < COLNO; ++x) {
        lev = $at2(G.level.locations, x, 0);
        for (y = 0; y < ROWNO; ++y, lev = $sadd(lev, 1)) {
          if (lev.glyph !== S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
            await show_glyph(x, y, lev.glyph);
          }
        }
      }
      await vision_recalc(0);
      await see_monsters();
    case 1: // post_map
      update_inventory();
      G.context.botlx = 1;
    }
    break;
  }
}

export async function redraw_map(): Promise<void> {
  let x = 0;
  let y = 0;
  let glyph = 0;
  if (!G.u.ux || G.restoring || !on_level(G.u.uz0, G.u.uz)) {
    return;
  }
  for (y = 0; y < ROWNO; ++y) {
    for (x = 1; x < COLNO; ++x) {
      glyph = glyph_at(x, y);
      await G.windowprocs.win_print_glyph(G.WIN_MAP, x, y, glyph, get_bk_glyph(x, y));
    }
  }
  await flush_screen(1);
}

export async function newsym_force(x: number, y: number): Promise<void> {
  await newsym(x, y);
  $at2(gbuf, y, x).new = 1;
  if (gbuf_start[y] > x) {
    gbuf_start[y] = x << 24 >> 24;
  }
  if (gbuf_stop[y] < x) {
    gbuf_stop[y] = x << 24 >> 24;
  }
}

export async function show_glyph(x: number, y: number, glyph: number): Promise<void> {
  if (!isok(x, y)) {
    let text = null;
    let offset = 0;
    if (x === 0) {
      return;
    }
    if (glyph >= GLYPH_WARNING_OFF && glyph < GLYPH_STATUE_OFF) {
      text = S("warning");
      offset = glyph - GLYPH_WARNING_OFF;
    } else if (glyph >= GLYPH_SWALLOW_OFF) {
      text = S("swallow border");
      offset = glyph - GLYPH_SWALLOW_OFF;
    } else if (glyph >= GLYPH_ZAP_OFF) {
      text = S("zap beam");
      offset = glyph - GLYPH_ZAP_OFF;
    } else if (glyph >= GLYPH_EXPLODE_OFF) {
      text = S("explosion");
      offset = glyph - GLYPH_EXPLODE_OFF;
    } else if (glyph >= GLYPH_CMAP_OFF) {
      text = S("cmap_index");
      offset = glyph - GLYPH_CMAP_OFF;
    } else if (glyph >= GLYPH_OBJ_OFF) {
      text = S("object");
      offset = glyph - GLYPH_OBJ_OFF;
    } else if (glyph >= GLYPH_RIDDEN_OFF) {
      text = S("ridden mon");
      offset = glyph - GLYPH_RIDDEN_OFF;
    } else if (glyph >= GLYPH_BODY_OFF) {
      text = S("corpse");
      offset = glyph - GLYPH_BODY_OFF;
    } else if (glyph >= GLYPH_DETECT_OFF) {
      text = S("detected mon");
      offset = glyph - GLYPH_DETECT_OFF;
    } else if (glyph >= GLYPH_INVIS_OFF) {
      text = S("invisible mon");
      offset = glyph - GLYPH_INVIS_OFF;
    } else if (glyph >= GLYPH_PET_OFF) {
      text = S("pet");
      offset = glyph - GLYPH_PET_OFF;
    } else {
      text = S("monster");
      offset = glyph;
    }
    await impossible(S("show_glyph:  bad pos %d %d with glyph %d [%s %d]."), x, y, glyph, text, offset);
    return;
  }
  if (glyph >= MAX_GLYPH) {
    await impossible(S("show_glyph:  bad glyph %d [max %d] at (%d,%d)."), glyph, MAX_GLYPH, x, y);
    return;
  }
  if ($at2(gbuf, y, x).glyph !== glyph || G.iflags.use_background_glyph) {
    $at2(gbuf, y, x).glyph = glyph;
    $at2(gbuf, y, x).new = 1;
    if (gbuf_start[y] > x) {
      gbuf_start[y] = x << 24 >> 24;
    }
    if (gbuf_stop[y] < x) {
      gbuf_stop[y] = x << 24 >> 24;
    }
  }
}

export function clear_glyph_buffer(): void {
  let $t1: any;
  let x = 0;
  let y = 0;
  let gptr = null;
  for (y = 0; y < ROWNO; ++y) {
    gptr = $at2(gbuf, y, 0);
    for (x = COLNO; x; --x) {
      ($t1 = gptr, gptr = $sadd($t1, 1), $t1).$cp(nul_gbuf);
    }
  }
  {
    let i = 0;
    for (i = 0; i < 21; ++i) {
      gbuf_start[i] = 80 - 1;
      gbuf_stop[i] = 0;
    }
  }
  ;
}

export async function row_refresh(start: number, stop: number, y: number): Promise<void> {
  let x = 0;
  for (x = start; x <= stop; ++x) {
    if ($at2(gbuf, y, x).glyph !== S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
      await G.windowprocs.win_print_glyph(G.WIN_MAP, x, y, $at2(gbuf, y, x).glyph, get_bk_glyph(x, y));
    }
  }
}

export async function cls(): Promise<void> {
  if (cls$in_cls) {
    return;
  }
  cls$in_cls = TRUE;
  await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  G.context.botlx = 1;
  await G.windowprocs.win_clear_nhwindow(G.WIN_MAP);
  clear_glyph_buffer();
  cls$in_cls = FALSE;
}

export async function flush_screen(cursor_on_u: number): Promise<void> {
  let x = 0;
  let y = 0;
  if (cursor_on_u === -1) {
    flush_screen$delay_flushing = !flush_screen$delay_flushing ? 1 : 0;
  }
  if (flush_screen$delay_flushing) {
    return;
  }
  if (flush_screen$flushing) {
    return;
  }
  flush_screen$flushing = 1;
  if (G.program_state.done_hup) {
    return;
  }
  for (y = 0; y < ROWNO; ++y) {
    let gptr = $sat(gbuf[y], x = gbuf_start[y]);
    for (; x <= gbuf_stop[y]; gptr = $sadd(gptr, 1), ++x) {
      if (gptr.new) {
        await G.windowprocs.win_print_glyph(G.WIN_MAP, x, y, gptr.glyph, get_bk_glyph(x, y));
        gptr.new = 0;
      }
    }
  }
  if (cursor_on_u) {
    await G.windowprocs.win_curs(G.WIN_MAP, G.u.ux, G.u.uy);
  }
  await G.windowprocs.win_display_nhwindow(G.WIN_MAP, FALSE);
  {
    let i = 0;
    for (i = 0; i < 21; ++i) {
      gbuf_start[i] = 80 - 1;
      gbuf_stop[i] = 0;
    }
  }
  ;
  flush_screen$flushing = 0;
  if (G.context.botl || G.context.botlx) {
    await bot();
  } else if (G.iflags.time_botl) {
    await timebot();
  }
}

export async function back_to_glyph(x: number, y: number): Promise<number> {
  let idx = 0;
  let ptr = $sat(G.level.locations[x], y);
  switch (ptr.typ) {
  case SCORR:
  case STONE:
    idx = G.level.flags.arboreal | 0 ? S_tree : S_stone;
    break;
  case ROOM:
    idx = S_room;
    break;
  case CORR:
    idx = ptr.waslit | 0 || G.flags.lit_corridor ? S_litcorr : S_corr;
    break;
  case HWALL:
  case VWALL:
  case TLCORNER:
  case TRCORNER:
  case BLCORNER:
  case BRCORNER:
  case CROSSWALL:
  case TUWALL:
  case TDWALL:
  case TLWALL:
  case TRWALL:
  case SDOOR:
    idx = ptr.seenv ? await wall_angle(ptr) : S_stone;
    break;
  case DOOR:
    if (ptr.flags) {
      if ((ptr.flags | 0) & D_BROKEN) {
        idx = S_ndoor;
      } else if ((ptr.flags | 0) & D_ISOPEN) {
        idx = ptr.horizontal | 0 ? S_hodoor : S_vodoor;
      } else {
        idx = ptr.horizontal | 0 ? S_hcdoor : S_vcdoor;
      }
    } else {
      idx = S_ndoor;
    }
    break;
  case IRONBARS:
    idx = S_bars;
    break;
  case TREE:
    idx = S_tree;
    break;
  case POOL:
  case MOAT:
    idx = S_pool;
    break;
  case STAIRS:
    idx = (ptr.flags | 0) & LA_DOWN ? S_dnstair : S_upstair;
    break;
  case LADDER:
    idx = (ptr.flags | 0) & LA_DOWN ? S_dnladder : S_upladder;
    break;
  case FOUNTAIN:
    idx = S_fountain;
    break;
  case SINK:
    idx = S_sink;
    break;
  case ALTAR:
    idx = S_altar;
    break;
  case GRAVE:
    idx = S_grave;
    break;
  case THRONE:
    idx = S_throne;
    break;
  case LAVAPOOL:
    idx = S_lava;
    break;
  case ICE:
    idx = S_ice;
    break;
  case AIR:
    idx = S_air;
    break;
  case CLOUD:
    idx = S_cloud;
    break;
  case WATER:
    idx = S_water;
    break;
  case DBWALL:
    idx = ptr.horizontal | 0 ? S_hcdbridge : S_vcdbridge;
    break;
  case DRAWBRIDGE_UP:
    switch ((ptr.flags | 0) & DB_UNDER) {
    case 0:
      idx = S_pool;
      break;
    case 4:
      idx = S_lava;
      break;
    case 8:
      idx = S_ice;
      break;
    case 16:
      idx = S_room;
      break;
    default:
      await impossible(S("Strange db-under: %d"), (ptr.flags | 0) & DB_UNDER);
      idx = S_room;
      break;
    }
    break;
  case DRAWBRIDGE_DOWN:
    idx = ptr.horizontal | 0 ? S_hodbridge : S_vodbridge;
    break;
  default:
    await impossible(S("back_to_glyph:  unknown level type [ = %d ]"), ptr.typ);
    idx = S_room;
    break;
  }
  return idx + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
}

async function swallow_to_glyph(mnum: number, loc: number): Promise<number> {
  if (loc < S_sw_tl || S_sw_br < loc) {
    await impossible(S("swallow_to_glyph: bad swallow location"));
    loc = S_sw_br;
  }
  return ((G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : mnum) << 3 | loc - S_sw_tl) + GLYPH_SWALLOW_OFF;
}

export async function zapdir_to_glyph(dx: number, dy: number, beam_type: number): Promise<number> {
  if (beam_type >= NUM_ZAP) {
    await impossible(S("zapdir_to_glyph:  illegal beam type"));
    beam_type = 0;
  }
  dx = dx === dy ? 2 : dx && dy ? 3 : dx ? 1 : 0;
  return (beam_type << 2 | dx) + GLYPH_ZAP_OFF;
}

export function glyph_at(x: number, y: number): number {
  if (x < 0 || y < 0 || x >= COLNO || y >= ROWNO) {
    return S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  }
  return $at2(gbuf, y, x).glyph;
}

function get_bk_glyph(x: number, y: number): number {
  let idx = 0;
  let bkglyph = NO_GLYPH;
  let lev = $sat(G.level.locations[x], y);
  if (G.iflags.use_background_glyph && lev.seenv !== 0 && $at2(gbuf, y, x).glyph !== S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
    switch (lev.typ) {
    case SCORR:
    case STONE:
      idx = G.level.flags.arboreal | 0 ? S_tree : S_stone;
      break;
    case ROOM:
      idx = S_room;
      break;
    case CORR:
      idx = lev.waslit | 0 || G.flags.lit_corridor ? S_litcorr : S_corr;
      break;
    case ICE:
      idx = S_ice;
      break;
    case AIR:
      idx = S_air;
      break;
    case CLOUD:
      idx = S_cloud;
      break;
    case POOL:
    case MOAT:
      idx = S_pool;
      break;
    case WATER:
      idx = S_water;
      break;
    case LAVAPOOL:
      idx = S_lava;
      break;
    default:
      idx = S_room;
      break;
    }
    if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) && (!lev.waslit || G.flags.dark_room)) {
      if (lev.typ === CORR && idx === S_litcorr) {
        idx = S_corr;
      } else if (idx === S_room) {
        idx = G.flags.dark_room && G.iflags.wc_color ? (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? S_stone : S_darkroom : S_stone;
      }
    }
    if (idx !== S_room) {
      bkglyph = idx + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
    }
  }
  return bkglyph;
}

function check_pos(x: number, y: number, which: number): number {
  let type = 0;
  if (!isok(x, y)) {
    return which;
  }
  type = $at2(G.level.locations, x, y).typ;
  if (type < POOL || type === CORR || type === SCORR) {
    return which;
  }
  return 0;
}

function set_twall(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
  let wmode = 0;
  let is_1 = 0;
  let is_2 = 0;
  let is_3 = 0;
  ;
  ;
  is_1 = check_pos(x1, y1, WM_T_LONG);
  is_2 = check_pos(x2, y2, WM_T_BL);
  is_3 = check_pos(x3, y3, WM_T_BR);
  if (is_1 && is_2 | is_3 || is_2 && is_1 | is_3 || is_3 && is_1 | is_2) {
    wmode = 0;
  } else {
    wmode = is_1 + is_2 + is_3;
  }
  return wmode;
}

function set_wall(x: number, y: number, horiz: number): number {
  let wmode = 0;
  let is_1 = 0;
  let is_2 = 0;
  if (horiz) {
    is_1 = check_pos(x, y - 1, WM_W_TOP);
    is_2 = check_pos(x, y + 1, WM_W_BOTTOM);
  } else {
    is_1 = check_pos(x - 1, y, WM_W_LEFT);
    is_2 = check_pos(x + 1, y, WM_W_RIGHT);
  }
  if (is_1 && is_2 | 0 || is_2 && is_1 | 0 || 0 && is_1 | is_2) {
    wmode = 0;
  } else {
    wmode = is_1 + is_2;
  }
  return wmode;
}

function set_corn(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): number {
  let wmode = 0;
  let is_1 = 0;
  let is_2 = 0;
  let is_3 = 0;
  let is_4 = 0;
  is_1 = check_pos(x1, y1, 1);
  is_2 = check_pos(x2, y2, 1);
  is_3 = check_pos(x3, y3, 1);
  is_4 = check_pos(x4, y4, 1);
  if (is_4) {
    wmode = WM_C_INNER;
  } else if (is_1 && is_2 && is_3) {
    wmode = WM_C_OUTER;
  } else {
    wmode = 0;
  }
  return wmode;
}

function set_crosswall(x: number, y: number): number {
  let wmode = 0;
  let is_1 = 0;
  let is_2 = 0;
  let is_3 = 0;
  let is_4 = 0;
  is_1 = check_pos(x - 1, y - 1, 1);
  is_2 = check_pos(x + 1, y - 1, 1);
  is_3 = check_pos(x + 1, y + 1, 1);
  is_4 = check_pos(x - 1, y + 1, 1);
  wmode = is_1 + is_2 + is_3 + is_4;
  if (wmode > 1) {
    if (is_1 && is_3 && is_2 + is_4 === 0) {
      wmode = WM_X_TLBR;
    } else if (is_2 && is_4 && is_1 + is_3 === 0) {
      wmode = WM_X_BLTR;
    } else {
      wmode = 0;
    }
  } else if (is_1) {
    wmode = WM_X_TL;
  } else if (is_2) {
    wmode = WM_X_TR;
  } else if (is_3) {
    wmode = WM_X_BR;
  } else if (is_4) {
    wmode = WM_X_BL;
  }
  return wmode;
}

export function set_wall_state(): void {
  let x = 0;
  let y = 0;
  let wmode = 0;
  let lev = null;
  for (x = 0; x < COLNO; ++x) {
    for (lev = $at2(G.level.locations, x, 0), y = 0; y < ROWNO; ++y, lev = $sadd(lev, 1)) {
      switch (lev.typ) {
      case SDOOR:
        wmode = set_wall(x, y, lev.horizontal | 0);
        break;
      case VWALL:
        wmode = set_wall(x, y, 0);
        break;
      case HWALL:
        wmode = set_wall(x, y, 1);
        break;
      case TDWALL:
        wmode = set_twall(x, y, x, y - 1, x - 1, y + 1, x + 1, y + 1);
        break;
      case TUWALL:
        wmode = set_twall(x, y, x, y + 1, x + 1, y - 1, x - 1, y - 1);
        break;
      case TLWALL:
        wmode = set_twall(x, y, x + 1, y, x - 1, y - 1, x - 1, y + 1);
        break;
      case TRWALL:
        wmode = set_twall(x, y, x - 1, y, x + 1, y + 1, x + 1, y - 1);
        break;
      case TLCORNER:
        wmode = set_corn(x - 1, y - 1, x, y - 1, x - 1, y, x + 1, y + 1);
        break;
      case TRCORNER:
        wmode = set_corn(x, y - 1, x + 1, y - 1, x + 1, y, x - 1, y + 1);
        break;
      case BLCORNER:
        wmode = set_corn(x, y + 1, x - 1, y + 1, x - 1, y, x + 1, y - 1);
        break;
      case BRCORNER:
        wmode = set_corn(x + 1, y, x + 1, y + 1, x, y + 1, x - 1, y - 1);
        break;
      case CROSSWALL:
        wmode = set_crosswall(x, y);
        break;
      default:
        wmode = -1;
        break;
      }
      if (wmode >= 0) {
        lev.flags = (((lev.flags | 0) & ~WM_MASK | wmode) >>> 0) & 31;
      }
    }
  }
}

function set_seenv(lev: struct_rm | null, x0: number, y0: number, x: number, y: number): void {
  let dx = x - x0;
  let dy = y0 - y;
  lev.seenv = (lev.seenv | G.seenv_matrix[(dy < 0 ? -1 : dy > 0 ? 1 : 0) + 1][(dx < 0 ? -1 : dx > 0 ? 1 : 0) + 1]) & 0xff;
}

export function unset_seenv(lev: struct_rm | null, x0: number, y0: number, x1: number, y1: number): void {
  let dx = x1 - x0;
  let dy = y0 - y1;
  lev.seenv = (lev.seenv & ~G.seenv_matrix[dy + 1][dx + 1]) & 0xff;
}

async function t_warn(lev: struct_rm | null): Promise<void> {
  let wname = null;
  if (lev.typ === TUWALL) {
    wname = S("tuwall");
  } else if (lev.typ === TLWALL) {
    wname = S("tlwall");
  } else if (lev.typ === TRWALL) {
    wname = S("trwall");
  } else if (lev.typ === TDWALL) {
    wname = S("tdwall");
  } else {
    wname = S("unknown");
  }
  await impossible(P(t_warn$warn_str), wname, (lev.flags | 0) & WM_MASK, lev.seenv);
}

async function wall_angle(lev: struct_rm | null): Promise<number> {
  let $g = 0;
  let seenv = 0;
  let row = null;
  let col = 0;
  let idx = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      seenv = (lev.seenv & 255) >>> 0;
      switch (lev.typ) {
      case TUWALL: { $g = 5; continue $L; }
      case TLWALL: { $g = 6; continue $L; }
      case TRWALL: { $g = 7; continue $L; }
      case TDWALL: { $g = 8; continue $L; }
      case SDOOR: { $g = 9; continue $L; }
      case VWALL: { $g = 10; continue $L; }
      case HWALL: { $g = 11; continue $L; }
      case TLCORNER: { $g = 12; continue $L; }
      case TRCORNER: { $g = 13; continue $L; }
      case BLCORNER: { $g = 14; continue $L; }
      case BRCORNER: { $g = 15; continue $L; }
      case CROSSWALL: { $g = 16; continue $L; }
      default: { $g = 17; continue $L; }
      }
    case 5:
      row = P(wall_matrix[T_u]);
      seenv = ((seenv >>> 4 | seenv << 4 >>> 0) >>> 0 & 255) >>> 0;
      { $g = 1; continue $L; }
    case 6:
      row = P(wall_matrix[T_l]);
      seenv = ((seenv >>> 2 | seenv << 6 >>> 0) >>> 0 & 255) >>> 0;
      { $g = 1; continue $L; }
    case 7:
      row = P(wall_matrix[T_r]);
      seenv = ((seenv >>> 6 | seenv << 2 >>> 0) >>> 0 & 255) >>> 0;
      { $g = 1; continue $L; }
    case 8:
      row = P(wall_matrix[T_d]);
    case 1: // do_twall
      switch ((lev.flags | 0) & WM_MASK) {
      case 0:
        if (seenv === SV4) {
          col = T_tlcorn;
        } else if (seenv === SV6) {
          col = T_trcorn;
        } else if ((seenv & (SV3 | SV5 | SV7)) >>> 0 || (seenv & SV4) >>> 0 && (seenv & SV6) >>> 0) {
          col = T_tdwall;
        } else if ((seenv & (SV0 | SV1 | SV2)) >>> 0) {
          col = (seenv & (SV4 | SV6)) >>> 0 ? T_tdwall : T_hwall;
        } else {
          await t_warn(lev);
          col = T_stone;
        }
        break;
      case 1:
        if ((seenv & (SV3 | SV4)) >>> 0 && !((seenv & (SV5 | SV6 | SV7)) >>> 0)) {
          col = T_tlcorn;
        } else if ((seenv & (SV6 | SV7)) >>> 0 && !((seenv & (SV3 | SV4 | SV5)) >>> 0)) {
          col = T_trcorn;
        } else if ((seenv & SV5) >>> 0 || (seenv & (SV3 | SV4)) >>> 0 && (seenv & (SV6 | SV7)) >>> 0) {
          col = T_tdwall;
        } else {
          if (!((seenv & (1 | 2 | 4)) >>> 0 && !((seenv & 4294967288) >>> 0))) {
            await t_warn(lev);
          }
          col = T_stone;
        }
        break;
      case 2:
        if ((seenv & (16 | 32)) >>> 0 && !((seenv & 4294967247) >>> 0)) {
          col = T_tlcorn;
        } else if ((seenv & (SV0 | SV1 | SV2 | SV7)) >>> 0 && !((seenv & (SV3 | SV4 | SV5)) >>> 0)) {
          col = T_hwall;
        } else if ((seenv & 64) >>> 0 && !((seenv & 4294967231) >>> 0)) {
          col = T_stone;
        } else {
          col = T_tdwall;
        }
        break;
      case 3:
        if ((seenv & (32 | 64)) >>> 0 && !((seenv & 4294967199) >>> 0)) {
          col = T_trcorn;
        } else if ((seenv & (SV0 | SV1 | SV2 | SV3)) >>> 0 && !((seenv & (SV5 | SV6 | SV7)) >>> 0)) {
          col = T_hwall;
        } else if ((seenv & 16) >>> 0 && !((seenv & 4294967279) >>> 0)) {
          col = T_stone;
        } else {
          col = T_tdwall;
        }
        break;
      default:
        await impossible(S("wall_angle: unknown T wall mode %d"), (lev.flags | 0) & WM_MASK);
        col = T_stone;
        break;
      }
      idx = row.a[row.o + col];
      { $g = 4; continue $L; };
    case 9:
      if (lev.horizontal) {
        { $g = 2; continue $L; }
      }
    case 10:
      switch ((lev.flags | 0) & WM_MASK) {
      case 0:
        idx = seenv ? S_vwall : S_stone;
        break;
      case 1:
        idx = (seenv & (SV1 | SV2 | SV3 | SV4 | SV5)) >>> 0 ? S_vwall : S_stone;
        break;
      case 2:
        idx = (seenv & (SV0 | SV1 | SV5 | SV6 | SV7)) >>> 0 ? S_vwall : S_stone;
        break;
      default:
        await impossible(S("wall_angle: unknown vwall mode %d"), (lev.flags | 0) & WM_MASK);
        idx = S_stone;
        break;
      }
      { $g = 4; continue $L; };
    case 11:
    case 2: // horiz
      switch ((lev.flags | 0) & WM_MASK) {
      case 0:
        idx = seenv ? S_hwall : S_stone;
        break;
      case 1:
        idx = (seenv & (SV3 | SV4 | SV5 | SV6 | SV7)) >>> 0 ? S_hwall : S_stone;
        break;
      case 2:
        idx = (seenv & (SV0 | SV1 | SV2 | SV3 | SV7)) >>> 0 ? S_hwall : S_stone;
        break;
      default:
        await impossible(S("wall_angle: unknown hwall mode %d"), (lev.flags | 0) & WM_MASK);
        idx = S_stone;
        break;
      }
      { $g = 4; continue $L; };
    case 12:
      switch ((lev.flags | 0) & 7) {
      case 0:
        idx = S_tlcorn;
        break;
      case 1:
        idx = (seenv & (8 | 16 | 32)) >>> 0 ? S_tlcorn : S_stone;
        break;
      case 2:
        idx = (seenv & 4294967279) >>> 0 ? S_tlcorn : S_stone;
        break;
      default:
        await impossible(S("wall_angle: unknown %s mode %d"), S("tlcorn"), (lev.flags | 0) & 7);
        idx = S_stone;
        break;
      }
      ;
      { $g = 4; continue $L; };
    case 13:
      switch ((lev.flags | 0) & 7) {
      case 0:
        idx = S_trcorn;
        break;
      case 1:
        idx = (seenv & (32 | 64 | 128)) >>> 0 ? S_trcorn : S_stone;
        break;
      case 2:
        idx = (seenv & 4294967231) >>> 0 ? S_trcorn : S_stone;
        break;
      default:
        await impossible(S("wall_angle: unknown %s mode %d"), S("trcorn"), (lev.flags | 0) & 7);
        idx = S_stone;
        break;
      }
      ;
      { $g = 4; continue $L; };
    case 14:
      switch ((lev.flags | 0) & 7) {
      case 0:
        idx = S_blcorn;
        break;
      case 1:
        idx = (seenv & (2 | 4 | 8)) >>> 0 ? S_blcorn : S_stone;
        break;
      case 2:
        idx = (seenv & 4294967291) >>> 0 ? S_blcorn : S_stone;
        break;
      default:
        await impossible(S("wall_angle: unknown %s mode %d"), S("blcorn"), (lev.flags | 0) & 7);
        idx = S_stone;
        break;
      }
      ;
      { $g = 4; continue $L; };
    case 15:
      switch ((lev.flags | 0) & 7) {
      case 0:
        idx = S_brcorn;
        break;
      case 1:
        idx = (seenv & (128 | 1 | 2)) >>> 0 ? S_brcorn : S_stone;
        break;
      case 2:
        idx = (seenv & 4294967294) >>> 0 ? S_brcorn : S_stone;
        break;
      default:
        await impossible(S("wall_angle: unknown %s mode %d"), S("brcorn"), (lev.flags | 0) & 7);
        idx = S_stone;
        break;
      }
      ;
      { $g = 4; continue $L; };
    case 16:
      switch ((lev.flags | 0) & WM_MASK) {
      case 0: { $g = 19; continue $L; }
      case 1: { $g = 20; continue $L; }
      case 2: { $g = 21; continue $L; }
      case 3: { $g = 22; continue $L; }
      case 4: { $g = 23; continue $L; }
      case 5: { $g = 24; continue $L; }
      case 6: { $g = 25; continue $L; }
      default: { $g = 26; continue $L; }
      }
    case 19:
      if (seenv === SV0) {
        idx = S_brcorn;
      } else if (seenv === SV2) {
        idx = S_blcorn;
      } else if (seenv === SV4) {
        idx = S_tlcorn;
      } else if (seenv === SV6) {
        idx = S_trcorn;
      } else if (!((seenv & 4294967288) >>> 0) && ((seenv & SV1) >>> 0 || seenv === (SV0 | SV2))) {
        idx = S_tuwall;
      } else if (!((seenv & 4294967267) >>> 0) && ((seenv & SV3) >>> 0 || seenv === (SV2 | SV4))) {
        idx = S_trwall;
      } else if (!((seenv & 4294967183) >>> 0) && ((seenv & SV5) >>> 0 || seenv === (SV4 | SV6))) {
        idx = S_tdwall;
      } else if (!((seenv & 4294967102) >>> 0) && ((seenv & SV7) >>> 0 || seenv === (SV0 | SV6))) {
        idx = S_tlwall;
      } else {
        idx = S_crwall;
      }
      { $g = 18; continue $L; };
    case 20:
      row = P(cross_matrix[C_tl]);
      seenv = ((seenv >>> 4 | seenv << 4 >>> 0) >>> 0 & 255) >>> 0;
      { $g = 3; continue $L; }
    case 21:
      row = P(cross_matrix[C_tr]);
      seenv = ((seenv >>> 6 | seenv << 2 >>> 0) >>> 0 & 255) >>> 0;
      { $g = 3; continue $L; }
    case 22:
      row = P(cross_matrix[C_bl]);
      seenv = ((seenv >>> 2 | seenv << 6 >>> 0) >>> 0 & 255) >>> 0;
      { $g = 3; continue $L; }
    case 23:
      row = P(cross_matrix[C_br]);
    case 3: // do_crwall
      if (seenv === SV4) {
        idx = S_stone;
      } else {
        seenv = (seenv & 4294967279) >>> 0;
        if (seenv === SV0) {
          col = C_brcorn;
        } else if ((seenv & (SV2 | SV3)) >>> 0) {
          if ((seenv & (SV5 | SV6 | SV7)) >>> 0) {
            col = C_crwall;
          } else if ((seenv & (SV0 | SV1)) >>> 0) {
            col = C_tuwall;
          } else {
            col = C_blcorn;
          }
        } else if ((seenv & (SV5 | SV6)) >>> 0) {
          if ((seenv & (SV1 | SV2 | SV3)) >>> 0) {
            col = C_crwall;
          } else if ((seenv & (SV0 | SV7)) >>> 0) {
            col = C_tlwall;
          } else {
            col = C_trcorn;
          }
        } else if ((seenv & SV1) >>> 0) {
          col = (seenv & SV7) >>> 0 ? C_crwall : C_tuwall;
        } else if ((seenv & SV7) >>> 0) {
          col = (seenv & SV1) >>> 0 ? C_crwall : C_tlwall;
        } else {
          await impossible(S("wall_angle: bottom of crwall check"));
          col = C_crwall;
        }
        idx = row.a[row.o + col];
      }
      { $g = 18; continue $L; };
    case 24:
      if ((seenv & (2 | 4 | 8)) >>> 0 && !((seenv & 4294967281) >>> 0)) {
        idx = S_blcorn;
      } else if ((seenv & (32 | 64 | 128)) >>> 0 && !((seenv & 4294967071) >>> 0)) {
        idx = S_trcorn;
      } else if ((seenv & (1 | 16)) >>> 0 && !((seenv & 4294967278) >>> 0)) {
        idx = S_stone;
      } else {
        idx = S_crwall;
      }
      { $g = 18; continue $L; };
    case 25:
      if ((seenv & (1 | 2 | 128)) >>> 0 && !((seenv & 4294967164) >>> 0)) {
        idx = S_brcorn;
      } else if ((seenv & (8 | 16 | 32)) >>> 0 && !((seenv & 4294967239) >>> 0)) {
        idx = S_tlcorn;
      } else if ((seenv & (4 | 64)) >>> 0 && !((seenv & 4294967227) >>> 0)) {
        idx = S_stone;
      } else {
        idx = S_crwall;
      }
      { $g = 18; continue $L; };
    case 26:
      await impossible(S("wall_angle: unknown crosswall mode"));
      idx = S_stone;
      { $g = 18; continue $L; };
    case 18:
      { $g = 4; continue $L; };
    case 17:
      await impossible(S("wall_angle: unexpected wall type %d"), lev.typ);
      idx = S_stone;
    case 4:
      return idx;
    }
    break;
  }
}

export function $init(): void {
  tgfirst = new struct_tmp_glyph();
  gbuf = $arr(21, () => $sarr(struct_gbuf_entry, 80));
  gbuf_start = new Int8Array(21);
  gbuf_stop = new Int8Array(21);
  nul_gbuf = struct_gbuf_entry.$of(0, S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
  G.seenv_matrix = $rows([$ta(Uint8Array, 3, [SV2, SV1, SV0]), $ta(Uint8Array, 3, [SV3, SVALL, SV7]), $ta(Uint8Array, 3, [SV4, SV5, SV6])]);
  wall_matrix = $rows([$ta(Int32Array, 5, [S_stone, S_tlcorn, S_trcorn, S_hwall, S_tdwall]),
$ta(Int32Array, 5, [S_stone, S_trcorn, S_brcorn, S_vwall, S_tlwall]),
$ta(Int32Array, 5, [S_stone, S_brcorn, S_blcorn, S_hwall, S_tuwall]),
$ta(Int32Array, 5, [S_stone, S_blcorn, S_tlcorn, S_vwall, S_trwall])]);
  cross_matrix = $rows([$ta(Int32Array, 6, [S_brcorn, S_blcorn, S_tlcorn, S_tuwall, S_trwall, S_crwall]),
$ta(Int32Array, 6, [S_blcorn, S_tlcorn, S_trcorn, S_trwall, S_tdwall, S_crwall]),
$ta(Int32Array, 6, [S_tlcorn, S_trcorn, S_brcorn, S_tdwall, S_tlwall, S_crwall]),
$ta(Int32Array, 6, [S_trcorn, S_brcorn, S_blcorn, S_tlwall, S_tuwall, S_crwall])]);
  tmp_at$tglyph = null;
  swallowed$lastx = 0;
  swallowed$lasty = 0;
  under_water$lastx = 0;
  under_water$lasty = 0;
  under_water$dela = 0;
  under_ground$dela = 0;
  cls$in_cls = 0;
  flush_screen$flushing = 0;
  flush_screen$delay_flushing = 0;
  t_warn$warn_str = $cs("wall_angle: %s: case %d: seenv = 0x%x", 38);
}
