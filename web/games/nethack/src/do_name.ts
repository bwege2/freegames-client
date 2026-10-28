// @ts-nocheck
// NetHack 3.6.7 do_name.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr, fmt_ptr } from './alloc.ts';
import { beautiful } from './apply.ts';
import { artifact_exists, artifact_name, exist_artifact, restrict_name, set_artifact_intrinsic, undiscovered_artifact } from './artifact.ts';
import { rank_of } from './botl.ts';
import { directionname, isok, redraw_cmd, xytod } from './cmd.ts';
import { back_to_glyph, docrt, flush_screen, glyph_at } from './display.ts';
import { donamelevel, on_level } from './dungeon.ts';
import { wipeout_text } from './engrave.ts';
import { is_valid_travelpt } from './hack.ts';
import { dist2, eos, fuzzymatch, highc, lcase, lowc, mungspaces, s_suffix, sgn, strncmpi, strstri, upstart, visctrl } from './hacklib.ts';
import { getobj, update_inventory } from './invent.ts';
import { newmextra } from './makemon.ts';
import { dealloc_obj, newoextra } from './mkobj.ts';
import { monsndx, pronoun_gender } from './mondata.ts';
import { discover_object, rename_disco, undiscover_object } from './o_init.ts';
import { The, Ysimple_name2, an, safe_qbuf, simpleonames, xname } from './objnam.ts';
import { nh_getenv } from './options.ts';
import { do_screen_description, object_from_map } from './pager.ts';
import { You, custompline, pline, pline_The, verbalize } from './pline.ts';
import { body_part } from './polyself.ts';
import { priestname } from './priest.ts';
import { rn2 } from './rnd.ts';
import { get_rnd_text } from './rumors.ts';
import { alter_cost } from './shk.ts';
import { shkname } from './shknam.ts';
import { opvar_free_x, selection_floodfill, selection_getpoint, selection_opvar, set_selection_floodfillchk } from './sp_lev.ts';
import { untwoweapon } from './wield.ts';
import { worm_known } from './worm.ts';
import { anon_do_name_c_635, struct_monst, struct_nhcoord, struct_obj, struct_opvar, union_any } from './structs.ts';
import { $arr, $at2, $cs, $peq, $rd, $sadd, $sarr, $sarrOf, $sat, $sidx, $ta, $u64, $wr, G, P, S, free, memset, qsort, rn2_on_display_rng, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncmp, strncpy } from './rt/index.ts';
import { ALL_CLASSES, AMULET_CLASS, ARMOR_CLASS, ARTICLE_A, ARTICLE_NONE, ARTICLE_THE, ARTICLE_YOUR, ATR_NONE, BLINDED, BOGUSMONSIZE, BUFSZ, CLR_MAX, COLNO, DBWALL, DEAF, DETECT_MONSTERS, DOOR, EXACT_NAME, EXPL_MAX, FALSE, FIGURINE, FOOD_CLASS, GEM_CLASS, GFILTER_AREA, GFILTER_VIEW, GLOC_DOOR, GLOC_EXPLORE, GLOC_INTERESTING, GLOC_MONS, GLOC_OBJS, GLOC_VALID, GPCOORDS_COMFULL, GPCOORDS_NONE, G_NOGEN, G_UNIQ, HALLUC, HALLUC_RES, HAND, HEAVY_IRON_BALL, INFRAVISION, LOOK_ONCE, LOOK_QUICK, LOOK_TRADITIONAL, LOOK_VERBOSE, LOW_PM, MAXPCHARS, MENU_UNSELECTED, MS_ANIMAL, M_AP_FURNITURE, M_AP_OBJECT, NHKF_ESC, NHKF_GETPOS_AUTODESC, NHKF_GETPOS_DOOR_NEXT, NHKF_GETPOS_DOOR_PREV, NHKF_GETPOS_HELP, NHKF_GETPOS_INTERESTING_NEXT, NHKF_GETPOS_INTERESTING_PREV, NHKF_GETPOS_LIMITVIEW, NHKF_GETPOS_MENU, NHKF_GETPOS_MON_NEXT, NHKF_GETPOS_MON_PREV, NHKF_GETPOS_MOVESKIP, NHKF_GETPOS_OBJ_NEXT, NHKF_GETPOS_OBJ_PREV, NHKF_GETPOS_PICK, NHKF_GETPOS_PICK_O, NHKF_GETPOS_PICK_Q, NHKF_GETPOS_PICK_V, NHKF_GETPOS_SELF, NHKF_GETPOS_SHOWVALID, NHKF_GETPOS_UNEX_NEXT, NHKF_GETPOS_UNEX_PREV, NHKF_GETPOS_VALID_NEXT, NHKF_GETPOS_VALID_PREV, NHW_MENU, NON_PM, NO_COLOR, NO_GLYPH, NUMMBUF, NUMMONS, NUM_GFILTER, NUM_GLOCS, OBJ_FREE, PICK_ONE, PL_PSIZ, PM_ALIGNED_PRIEST, PM_GHOST, PM_HIGH_PRIEST, PM_JUIBLEX, PM_LONG_WORM, PM_LONG_WORM_TAIL, PM_SHOPKEEPER, PM_WIZARD_OF_YENDOR, POTION_CLASS, RING_CLASS, ROWNO, SCORR, SCROLL_CLASS, SDOOR, SEE_INVIS, SPBOOK_CLASS, SPECIAL_PM, SPE_NOVEL, STATUE, STRANGE_OBJECT, SUPPRESS_HALLUCINATION, SUPPRESS_HISTORY, SUPPRESS_INVISIBLE, SUPPRESS_IT, SUPPRESS_NAME, SUPPRESS_SADDLE, S_air, S_bars, S_cloud, S_corr, S_darkroom, S_fountain, S_hcdbridge, S_hcdoor, S_ice, S_lava, S_litcorr, S_ndoor, S_pool, S_room, S_stone, S_tree, S_trwall, S_upstair, S_vodbridge, S_vodoor, S_water, TELEPAT, TER_DETECT, TER_MAP, TER_MON, TER_OBJ, TIN, TOOL_CLASS, TOWEL, TRUE, WAND_CLASS, WARN_OF_MON, WEAPON_CLASS, W_SADDLE, W_WEP } from './consts.ts';

let getpos_hilitefunc: Function | null;
let getpos_getvalid: Function | null;
let gloc_descr: any;
let gloc_filtertxt: any;
let gloc_filter_map: struct_opvar | null;
let gloc_filter_floodfill_match_glyph: number;
let via_naming: number;
let callable: any;
let ghostnames: any;
let hcolors: any;
let hliquids: any;
let coynames: any;
let sir_Terry_novels: any;
let nextmbuf$bufs: any;
let nextmbuf$bufidx: number;
let getpos_help$fastmovemode: any;
let dxdy_to_dist_descr$buf: any;
let dxdy_to_dist_descr$dirnames: any;
let coord_desc$screen_fmt: any;
let getpos$pick_chars_def: any;
let getpos$mMoOdDxX_def: any;
let getpos$view_filters: any;
let bogusmon$bogon_codes: any;
let rndmonnam$buf: any;
let rndorcname$v: any;
let rndorcname$snd: any;

function nextmbuf(): Ptr | null {
  nextmbuf$bufidx = (nextmbuf$bufidx + 1) % NUMMBUF;
  return P(nextmbuf$bufs[nextmbuf$bufidx]);
}

export function getpos_sethilite(gp_hilitef: Function | null, gp_getvalidf: Function | null): void {
  getpos_hilitefunc = gp_hilitef;
  getpos_getvalid = gp_getvalidf;
}

export async function getpos_help_keyxhelp(tmpwin: number, k1: Ptr | null, k2: Ptr | null, gloc: number): Promise<void> {
  let sbuf = new Int8Array(256);
  sprintf(P(sbuf), S("Use '%s'/'%s' to %s%s%s."), k1, k2, G.iflags.getloc_usemenu ? S("get a menu of ") : S("move the cursor to "), gloc_descr[gloc][2 + G.iflags.getloc_usemenu], gloc_filtertxt[G.iflags.getloc_filter]);
  await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
}

async function getpos_help(force: number, goal: Ptr | null): Promise<void> {
  let sbuf = new Int8Array(256);
  let doing_what_is = 0;
  let tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  sprintf(P(sbuf), S("Use '%c', '%c', '%c', '%c' to move the cursor to %s."), G.Cmd.move_W, G.Cmd.move_S, G.Cmd.move_N, G.Cmd.move_E, goal);
  await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
  sprintf(P(sbuf), S("Use 'H', 'J', 'K', 'L' to fast-move the cursor, %s."), getpos_help$fastmovemode[G.iflags.getloc_moveskip]);
  await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
  await G.windowprocs.win_putstr(tmpwin, 0, S("Or enter a background symbol (ex. '<')."));
  sprintf(P(sbuf), S("Use '%s' to move the cursor on yourself."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_SELF]));
  await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
  if (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_MON) !== 0) {
    await getpos_help_keyxhelp(tmpwin, visctrl(G.Cmd.spkeys[NHKF_GETPOS_MON_NEXT]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_MON_PREV]), GLOC_MONS);
  }
  if (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_OBJ) !== 0) {
    await getpos_help_keyxhelp(tmpwin, visctrl(G.Cmd.spkeys[NHKF_GETPOS_OBJ_NEXT]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_OBJ_PREV]), GLOC_OBJS);
  }
  if (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_MAP) !== 0) {
    await getpos_help_keyxhelp(tmpwin, visctrl(G.Cmd.spkeys[NHKF_GETPOS_DOOR_NEXT]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_DOOR_PREV]), GLOC_DOOR);
    await getpos_help_keyxhelp(tmpwin, visctrl(G.Cmd.spkeys[NHKF_GETPOS_UNEX_NEXT]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_UNEX_PREV]), GLOC_EXPLORE);
    await getpos_help_keyxhelp(tmpwin, visctrl(G.Cmd.spkeys[NHKF_GETPOS_INTERESTING_NEXT]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_INTERESTING_PREV]), GLOC_INTERESTING);
  }
  sprintf(P(sbuf), S("Use '%s' to change fast-move mode to %s."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_MOVESKIP]), getpos_help$fastmovemode[!G.iflags.getloc_moveskip ? 1 : 0]);
  await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
  if (!G.iflags.terrainmode || (G.iflags.terrainmode & TER_DETECT) === 0) {
    sprintf(P(sbuf), S("Use '%s' to toggle menu listing for possible targets."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_MENU]));
    await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
    sprintf(P(sbuf), S("Use '%s' to change the mode of limiting possible targets."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_LIMITVIEW]));
    await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
  }
  if (!G.iflags.terrainmode) {
    let kbuf = new Int8Array(256);
    if (getpos_getvalid) {
      sprintf(P(sbuf), S("Use '%s' or '%s' to move to valid locations."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_VALID_NEXT]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_VALID_PREV]));
      await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
    }
    if (getpos_hilitefunc) {
      sprintf(P(sbuf), S("Use '%s' to display valid locations."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_SHOWVALID]));
      await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
    }
    sprintf(P(sbuf), S("Use '%s' to toggle automatic description."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_AUTODESC]));
    await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
    if (G.iflags.cmdassist) {
      sprintf(P(sbuf), G.iflags.getpos_coords === GPCOORDS_NONE ? S("(Set 'whatis_coord' option to include coordinates with '%s' text.)") : S("(Reset 'whatis_coord' option to omit coordinates from '%s' text.)"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_AUTODESC]));
    }
    doing_what_is = ($peq(goal, P(G.what_is_an_unknown_object)) ? 1 : 0) << 24 >> 24;
    if (doing_what_is) {
      sprintf(P(kbuf), S("'%s' or '%s' or '%s' or '%s'"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK_Q]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK_O]), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK_V]));
    } else {
      sprintf(P(kbuf), S("'%s'"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK]));
    }
    sprintf(P(sbuf), S("Type a %s when you are at the right place."), P(kbuf));
    await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
    if (doing_what_is) {
      sprintf(P(sbuf), S("  '%s' describe current spot, show 'more info', move to another spot."), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK_V]));
      await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
      sprintf(P(sbuf), S("  '%s' describe current spot,%s move to another spot;"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK]), G.flags.help ? S(" prompt if 'more info',") : S(""));
      await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
      sprintf(P(sbuf), S("  '%s' describe current spot, move to another spot;"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK_Q]));
      await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
      sprintf(P(sbuf), S("  '%s' describe current spot, stop looking at things;"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK_O]));
      await G.windowprocs.win_putstr(tmpwin, 0, P(sbuf));
    }
  }
  if (!force) {
    await G.windowprocs.win_putstr(tmpwin, 0, S("Type Space or Escape when you're done."));
  }
  await G.windowprocs.win_putstr(tmpwin, 0, S(""));
  await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
}

function cmp_coord_distu(a: any, b: any): number {
  let c1 = a;
  let c2 = b;
  let dx = 0;
  let dy = 0;
  let dist_1 = 0;
  let dist_2 = 0;
  dx = G.u.ux - c1.x;
  dy = G.u.uy - c1.y;
  dist_1 = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
  dx = G.u.ux - c2.x;
  dy = G.u.uy - c2.y;
  dist_2 = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
  if (dist_1 === dist_2) {
    return c1.y !== c2.y ? c1.y - c2.y : c1.x - c2.x;
  }
  return dist_1 - dist_2;
}

export function gloc_filter_classify_glyph(glyph: number): number {
  let c = 0;
  if (!(glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS)) {
    return 0;
  }
  c = glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
  if (c >= S_room && c <= S_darkroom || c >= S_upstair && c <= S_fountain) {
    return 1;
  } else if (c >= S_stone && c <= S_trwall || c === S_tree) {
    return 2;
  } else if (c >= S_corr && c <= S_litcorr) {
    return 3;
  } else if (c === S_pool || c === S_water) {
    return 4;
  } else if (c === S_lava) {
    return 5;
  }
  return 0;
}

async function gloc_filter_floodfill_matcharea(x: number, y: number): Promise<number> {
  let glyph = await back_to_glyph(x, y);
  if (!$at2(G.level.locations, x, y).seenv) {
    return FALSE;
  }
  if (glyph === gloc_filter_floodfill_match_glyph) {
    return TRUE;
  }
  if (gloc_filter_classify_glyph(glyph) === gloc_filter_classify_glyph(gloc_filter_floodfill_match_glyph)) {
    return TRUE;
  }
  return FALSE;
}

export async function gloc_filter_floodfill(x: number, y: number): Promise<void> {
  gloc_filter_floodfill_match_glyph = await back_to_glyph(x, y);
  set_selection_floodfillchk(gloc_filter_floodfill_matcharea);
  await selection_floodfill(gloc_filter_map, x, y, FALSE);
}

export async function gloc_filter_init(): Promise<void> {
  if (G.iflags.getloc_filter === GFILTER_AREA) {
    if (!gloc_filter_map) {
      gloc_filter_map = await selection_opvar(null);
    }
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === DOOR) {
      if (G.u.dx || G.u.dy) {
        await gloc_filter_floodfill(G.u.ux + G.u.dx, G.u.uy + G.u.dy);
      } else {
      }
    } else {
      await gloc_filter_floodfill(G.u.ux, G.u.uy);
    }
  }
}

export async function gloc_filter_done(): Promise<void> {
  if (gloc_filter_map) {
    await opvar_free_x(gloc_filter_map);
    gloc_filter_map = null;
  }
}

async function gather_locs_interesting(x: number, y: number, gloc: number): Promise<number> {
  let glyph = glyph_at(x, y);
  if (G.iflags.getloc_filter === GFILTER_VIEW && !($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
    return FALSE;
  }
  if (G.iflags.getloc_filter === GFILTER_AREA && !(isok(x, y) && selection_getpoint(x, y, gloc_filter_map)) && !(isok(x - 1, y) && selection_getpoint(x - 1, y, gloc_filter_map)) && !(isok(x, y - 1) && selection_getpoint(x, y - 1, gloc_filter_map)) && !(isok(x + 1, y) && selection_getpoint(x + 1, y, gloc_filter_map)) && !(isok(x, y + 1) && selection_getpoint(x, y + 1, gloc_filter_map))) {
    return FALSE;
  }
  switch (gloc) {
  default:
  case GLOC_MONS:
    return ((glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) && glyph !== 327 + 0 ? 1 : 0) << 24 >> 24;
  case GLOC_OBJS:
    return ((glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) && glyph !== 448 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph !== 447 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) ? 1 : 0) << 24 >> 24;
  case GLOC_DOOR:
    return (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && ((glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) >= S_vodoor && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) <= S_hcdoor || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) >= S_vodbridge && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) <= S_hcdbridge || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_ndoor) ? 1 : 0) << 24 >> 24;
  case GLOC_EXPLORE:
    return (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && ((glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) >= S_vodoor && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) <= S_hcdoor || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) >= S_vodbridge && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) <= S_hcdbridge || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_ndoor || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_room || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_darkroom || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_corr || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_litcorr) && (isok(x + 1, y) && ($at2(G.level.locations, x + 1, y).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x + 1, y).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS) && ($at2(G.level.locations, x + 1, y).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x + 1, y).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? $at2(G.level.locations, x + 1, y).glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_stone && !$at2(G.level.locations, x + 1, y).seenv || isok(x - 1, y) && ($at2(G.level.locations, x - 1, y).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x - 1, y).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS) && ($at2(G.level.locations, x - 1, y).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x - 1, y).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? $at2(G.level.locations, x - 1, y).glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_stone && !$at2(G.level.locations, x - 1, y).seenv || isok(x, y + 1) && ($at2(G.level.locations, x, y + 1).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x, y + 1).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS) && ($at2(G.level.locations, x, y + 1).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x, y + 1).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? $at2(G.level.locations, x, y + 1).glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_stone && !$at2(G.level.locations, x, y + 1).seenv || isok(x, y - 1) && ($at2(G.level.locations, x, y - 1).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x, y - 1).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS) && ($at2(G.level.locations, x, y - 1).glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && $at2(G.level.locations, x, y - 1).glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? $at2(G.level.locations, x, y - 1).glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_stone && !$at2(G.level.locations, x, y - 1).seenv) ? 1 : 0) << 24 >> 24;
  case GLOC_VALID:
    if (getpos_getvalid) {
      return await getpos_getvalid(x, y);
    }
  case GLOC_INTERESTING:
    return (await gather_locs_interesting(x, y, GLOC_DOOR) || !(glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && ((glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) >= S_stone && (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) <= S_trwall || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_tree || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_bars || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_ice || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_air || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_cloud || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_lava || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_water || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_pool || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_ndoor || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_room || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_darkroom || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_corr || (glyph >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && glyph < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? glyph - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_litcorr)) ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

async function gather_locs(arr_p: Ptr | null, cnt_p: Ptr | null, gloc: number): Promise<void> {
  let x = 0;
  let y = 0;
  let pass = 0;
  let idx = 0;
  await gloc_filter_init();
  cnt_p.a[cnt_p.o] = idx = 0;
  for (pass = 0; pass < 2; ++pass) {
    for (x = 1; x < COLNO; ++x) {
      for (y = 0; y < ROWNO; ++y) {
        if (x === G.u.ux && y === G.u.uy || await gather_locs_interesting(x, y, gloc)) {
          if (!pass) {
            ++cnt_p.a[cnt_p.o];
          } else {
            $sadd(arr_p.a[arr_p.o], idx).x = x << 24 >> 24;
            $sadd(arr_p.a[arr_p.o], idx).y = y << 24 >> 24;
            ++idx;
          }
        }
      }
    }
    if (!pass) {
      arr_p.a[arr_p.o] = $sarr(struct_nhcoord, ($u64(cnt_p.a[cnt_p.o]) * 2 >>> 0) / 2)[0];
    } else {
      await qsort(arr_p.a[arr_p.o], $u64(cnt_p.a[cnt_p.o]), 2, cmp_coord_distu);
    }
  }
  await gloc_filter_done();
}

export function dxdy_to_dist_descr(dx: number, dy: number, fulldir: number): Ptr | null {
  let dst = 0;
  if (!dx && !dy) {
    sprintf(P(dxdy_to_dist_descr$buf), S("here"));
  } else if ((dst = xytod(dx, dy)) !== -1) {
    sprintf(P(dxdy_to_dist_descr$buf), S("%s"), directionname(dst));
  } else {
    dxdy_to_dist_descr$buf[0] = 0;
    if (dy) {
      if (Math.abs(dy) > 9999) {
        dy = sgn(dy) * 9999;
      }
      sprintf(eos(P(dxdy_to_dist_descr$buf)), S("%d%s%s"), Math.abs(dy), dxdy_to_dist_descr$dirnames[dy > 0 ? 1 : 0][fulldir], dx ? S(",") : S(""));
    }
    if (dx) {
      if (Math.abs(dx) > 9999) {
        dx = sgn(dx) * 9999;
      }
      sprintf(eos(P(dxdy_to_dist_descr$buf)), S("%d%s"), Math.abs(dx), dxdy_to_dist_descr$dirnames[2 + (dx > 0 ? 1 : 0)][fulldir]);
    }
  }
  return P(dxdy_to_dist_descr$buf);
}

export function coord_desc(x: number, y: number, outbuf: Ptr | null, cmode: number): Ptr | null {
  let dx = 0;
  let dy = 0;
  outbuf.a[outbuf.o] = 0;
  switch (cmode) {
  default:
    break;
  case 102:
  case 99:
    dx = x - G.u.ux;
    dy = y - G.u.uy;
    sprintf(outbuf, S("(%s)"), dxdy_to_dist_descr(dx, dy, cmode === GPCOORDS_COMFULL ? 1 : 0));
    break;
  case 109:
    sprintf(outbuf, S("<%d,%d>"), x, y);
    break;
  case 115:
    if (!$rd(P(coord_desc$screen_fmt))) {
      sprintf(P(coord_desc$screen_fmt), S("[%%%sd,%%%sd]"), ROWNO - 1 + 2 < 100 ? S("02") : S("03"), COLNO - 1 < 100 ? S("02") : S("03"));
    }
    sprintf(outbuf, P(coord_desc$screen_fmt), y + 2, x);
    break;
  }
  return outbuf;
}

async function auto_describe(cx: number, cy: number): Promise<void> {
  let cc = new struct_nhcoord();
  let sym = 0;
  let tmpbuf = new Int8Array(256);
  const firstmatch = [null];
  firstmatch[0] = S("unknown");
  cc.x = cx << 24 >> 24;
  cc.y = cy << 24 >> 24;
  if (await do_screen_description(cc.$clone(), TRUE, sym, P(tmpbuf), P(firstmatch, 0), null)) {
    coord_desc(cx, cy, P(tmpbuf), G.iflags.getpos_coords);
    await custompline(SUPPRESS_HISTORY, S("%s%s%s%s%s"), firstmatch[0], $rd(P(tmpbuf)) ? S(" ") : S(""), P(tmpbuf), G.iflags.autodescribe && getpos_getvalid && !await getpos_getvalid(cx, cy) ? S(" (illegal)") : S(""), G.iflags.getloc_travelmode && !await is_valid_travelpt(cx, cy) ? S(" (no travel path)") : S(""));
    await G.windowprocs.win_curs(G.WIN_MAP, cx, cy);
    await flush_screen(0);
  }
}

export async function getpos_menu(ccp: struct_nhcoord | null, gloc: number): Promise<number> {
  const garr = [null];
  garr[0] = null;
  const gcount = new Int32Array(1);
  gcount[0] = 0;
  let tmpwin = 0;
  let any = new union_any();
  let i = 0;
  let pick_cnt = 0;
  const picks = [null];
  picks[0] = null;
  let tmpbuf = new Int8Array(256);
  await gather_locs(P(garr, 0), P(gcount, 0), gloc);
  if (gcount[0] < 2) {
    free(garr[0]);
    await You(S("cannot %s %s."), G.iflags.getloc_filter === GFILTER_VIEW ? S("see") : S("detect"), gloc_descr[gloc][0]);
    return FALSE;
  }
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 1; i < gcount[0]; ++i) {
    let fullbuf = new Int8Array(256);
    let tmpcc = new struct_nhcoord();
    const firstmatch = [null];
    firstmatch[0] = S("unknown");
    let sym = 0;
    any.a_int = i + 1;
    tmpcc.x = $sadd(garr[0], i).x;
    tmpcc.y = $sadd(garr[0], i).y;
    if (await do_screen_description(tmpcc.$clone(), TRUE, sym, P(tmpbuf), P(firstmatch, 0), null)) {
      coord_desc($sadd(garr[0], i).x, $sadd(garr[0], i).y, P(tmpbuf), G.iflags.getpos_coords);
      sprintf(P(fullbuf), S("%s%s%s"), firstmatch[0], $rd(P(tmpbuf)) ? S(" ") : S(""), P(tmpbuf));
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(fullbuf), MENU_UNSELECTED);
    }
  }
  sprintf(P(tmpbuf), S("Pick %s%s%s"), await an(gloc_descr[gloc][1]), gloc_filtertxt[G.iflags.getloc_filter], G.iflags.getloc_travelmode ? S(" for travel destination") : S(""));
  await G.windowprocs.win_end_menu(tmpwin, P(tmpbuf));
  pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (pick_cnt > 0) {
    ccp.x = $sadd(garr[0], (picks[0].item.a_int - 1)).x;
    ccp.y = $sadd(garr[0], (picks[0].item.a_int - 1)).y;
    free(picks[0]);
  }
  free(garr[0]);
  return (pick_cnt > 0 ? 1 : 0) << 24 >> 24;
}

export async function getpos(ccp: struct_nhcoord | null, force: number, goal: Ptr | null): Promise<number> {
  let $g = 0;
  let cp = null;
  let pick_chars = new Int8Array(6);
  let mMoOdDxX = new Int8Array(13);
  let result = 0;
  let cx = 0;
  let cy = 0;
  let i = 0;
  let c = 0;
  let sidx = new Int32Array(1);
  let tx = new Int32Array(1);
  let ty = new Int32Array(1);
  let msg_given = 0;
  let show_goal_msg = 0;
  let hilite_state = 0;
  let garr = new Array(6).fill(null);
  let gcount = new Int32Array(6);
  let gidx = new Int32Array(6);
  let matching = new Int8Array(96);
  let pass = 0;
  let lo_x = 0;
  let lo_y = 0;
  let hi_x = 0;
  let hi_y = 0;
  let k = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      pick_chars = new Int8Array(6);
      mMoOdDxX = new Int8Array(13);
      result = 0;
      msg_given = TRUE;
      show_goal_msg = FALSE;
      hilite_state = FALSE;
      garr = [null,
null,
null,
null,
null,
null];
      gcount = new Int32Array(6);
      gidx = new Int32Array(6);
      for (i = 0; i < (Math.trunc(32 / 8) | 0); ++i) {
        pick_chars[i] = G.Cmd.spkeys[getpos$pick_chars_def[i].nhkf];
      }
      pick_chars[Math.trunc(32 / 8) | 0] = 0;
      for (i = 0; i < (Math.trunc(48 / 4) | 0); ++i) {
        mMoOdDxX[i] = G.Cmd.spkeys[getpos$mMoOdDxX_def[i]];
      }
      mMoOdDxX[Math.trunc(48 / 4) | 0] = 0;
      if (!goal) {
        goal = S("desired location");
      }
      if (G.flags.verbose) {
        await pline(S("(For instructions type a '%s')"), visctrl(G.Cmd.spkeys[NHKF_GETPOS_HELP]));
        msg_given = TRUE;
      }
      cx = ccp.x;
      cy = ccp.y;
      await G.windowprocs.win_cliparound(cx, cy);
      await G.windowprocs.win_curs(G.WIN_MAP, cx, cy);
      await flush_screen(0);
    case 3:
      if (show_goal_msg) {
        await pline(S("Move cursor to %s:"), goal);
        await G.windowprocs.win_curs(G.WIN_MAP, cx, cy);
        await flush_screen(0);
        show_goal_msg = FALSE;
      } else if (G.iflags.autodescribe && !msg_given && !hilite_state) {
        await auto_describe(cx, cy);
      }
      c = await G.windowprocs.win_nh_poskey(P(tx, 0), P(ty, 0), P(sidx, 0));
      if (hilite_state) {
        await getpos_hilitefunc(2);
        hilite_state = FALSE;
        await G.windowprocs.win_curs(G.WIN_MAP, cx, cy);
        await flush_screen(0);
      }
      if (G.iflags.autodescribe) {
        msg_given = FALSE;
      }
      if (c === G.Cmd.spkeys[NHKF_ESC]) {
        cx = cy = -10;
        msg_given = TRUE;
        result = -1;
        { $g = 5; continue $L; };
      }
      if (c === 0) {
        if (!isok(tx[0], ty[0])) {
          { $g = 4; continue $L; };
        }
        cx = tx[0];
        cy = ty[0];
        { $g = 5; continue $L; };
      }
      if (!!(cp = strchr(P(pick_chars), c))) {
        result = getpos$pick_chars_def[cp.o - P(pick_chars).o | 0].ret;
        { $g = 5; continue $L; };
      }
      for (i = 0; i < 8; ++i) {
        let dx = 0;
        let dy = 0;
        if (G.Cmd.dirchars.a[G.Cmd.dirchars.o + i] === c) {
          dx = G.xdir[i];
          dy = G.ydir[i];
        } else if (G.Cmd.alphadirchars.a[G.Cmd.alphadirchars.o + i] === lowc(c << 24 >> 24) || G.Cmd.num_pad && G.Cmd.dirchars.a[G.Cmd.dirchars.o + i] === (c & 127)) {
          if (G.iflags.getloc_moveskip) {
            let glyph = glyph_at(cx, cy);
            dx = G.xdir[i];
            dy = G.ydir[i];
            while (isok(cx + dx, cy + dy) && glyph === glyph_at(cx + dx, cy + dy) && isok(cx + dx + G.xdir[i], cy + dy + G.ydir[i]) && glyph === glyph_at(cx + dx + G.xdir[i], cy + dy + G.ydir[i])) {
              dx += G.xdir[i];
              dy += G.ydir[i];
            }
          } else {
            dx = 8 * G.xdir[i];
            dy = 8 * G.ydir[i];
          }
        } else {
          continue;
        }
        if (cx + dx < 1) {
          dy -= Math.imul(sgn(dy), 1 - (cx + dx));
          dx = 1 - cx;
        } else if (cx + dx > COLNO - 1) {
          dy += Math.imul(sgn(dy), COLNO - 1 - (cx + dx));
          dx = COLNO - 1 - cx;
        }
        if (cy + dy < 0) {
          dx -= Math.imul(sgn(dx), 0 - (cy + dy));
          dy = 0 - cy;
        } else if (cy + dy > ROWNO - 1) {
          dx += Math.imul(sgn(dx), ROWNO - 1 - (cy + dy));
          dy = ROWNO - 1 - cy;
        }
        cx += dx;
        cy += dy;
        { $g = 1; continue $L; }
      }
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_HELP] || redraw_cmd(c))) { $g = 7; continue $L; }
      {
        if (c === G.Cmd.spkeys[NHKF_GETPOS_HELP]) {
          await getpos_help(force, goal);
        } else {
          await docrt();
        }
        show_goal_msg = TRUE;
        msg_given = TRUE;
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_SHOWVALID] && getpos_hilitefunc)) { $g = 9; continue $L; }
      {
        if (!hilite_state) {
          await getpos_hilitefunc(0);
          await getpos_hilitefunc(1);
          hilite_state = TRUE;
        }
        { $g = 1; continue $L; }
      }
      { $g = 8; continue $L; }
    case 9:
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_AUTODESC])) { $g = 11; continue $L; }
      {
        G.iflags.autodescribe = (!G.iflags.autodescribe ? 1 : 0) << 24 >> 24;
        await pline(S("Automatic description %sis %s."), G.flags.verbose ? S("of features under cursor ") : S(""), G.iflags.autodescribe ? S("on") : S("off"));
        if (!G.iflags.autodescribe) {
          show_goal_msg = TRUE;
        }
        msg_given = TRUE;
        { $g = 1; continue $L; }
      }
      { $g = 10; continue $L; }
    case 11:
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_LIMITVIEW])) { $g = 13; continue $L; }
      {
        G.iflags.getloc_filter = (G.iflags.getloc_filter + 1) % NUM_GFILTER;
        for (i = 0; i < NUM_GLOCS; ++i) {
          if (garr[i]) {
            free(garr[i]);
            garr[i] = null;
          }
          gidx[i] = gcount[i] = 0;
        }
        await pline(S("%s."), getpos$view_filters[G.iflags.getloc_filter]);
        msg_given = TRUE;
        { $g = 1; continue $L; }
      }
      { $g = 12; continue $L; }
    case 13:
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_MENU])) { $g = 15; continue $L; }
      {
        G.iflags.getloc_usemenu = (!G.iflags.getloc_usemenu ? 1 : 0) << 24 >> 24;
        await pline(S("%s a menu to show possible targets%s."), G.iflags.getloc_usemenu ? S("Using") : S("Not using"), G.iflags.getloc_usemenu ? S(" for 'm|M', 'o|O', 'd|D', and 'x|X'") : S(""));
        msg_given = TRUE;
        { $g = 1; continue $L; }
      }
      { $g = 14; continue $L; }
    case 15:
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_SELF])) { $g = 17; continue $L; }
      {
        for (i = 0; i < NUM_GLOCS; ++i) {
          gidx[i] = 0;
        }
        cx = G.u.ux;
        cy = G.u.uy;
        { $g = 1; continue $L; }
      }
      { $g = 16; continue $L; }
    case 17:
      if (!(c === G.Cmd.spkeys[NHKF_GETPOS_MOVESKIP])) { $g = 19; continue $L; }
      {
        G.iflags.getloc_moveskip = (!G.iflags.getloc_moveskip ? 1 : 0) << 24 >> 24;
        await pline(S("%skipping over similar terrain when fastmoving the cursor."), G.iflags.getloc_moveskip ? S("S") : S("Not s"));
      }
      { $g = 18; continue $L; }
    case 19:
      if (!!!(cp = strchr(P(mMoOdDxX), c))) { $g = 21; continue $L; }
      {
        let gtmp = cp.o - P(mMoOdDxX).o | 0;
        let gloc = gtmp >> 1;
        if (G.iflags.getloc_usemenu) {
          let tmpcrd = new struct_nhcoord();
          if (await getpos_menu(tmpcrd, gloc)) {
            cx = tmpcrd.x;
            cy = tmpcrd.y;
          }
          { $g = 1; continue $L; }
        }
        if (!garr[gloc]) {
          await gather_locs(P(garr, gloc), P(gcount, gloc), gloc);
          gidx[gloc] = 0;
        }
        if (!(gtmp & 1)) {
          gidx[gloc] = (gidx[gloc] + 1) % gcount[gloc];
        } else {
          if (--gidx[gloc] < 0) {
            gidx[gloc] = gcount[gloc] - 1;
          }
        }
        cx = $sadd(garr[gloc], gidx[gloc]).x;
        cy = $sadd(garr[gloc], gidx[gloc]).y;
        { $g = 1; continue $L; }
      }
      { $g = 20; continue $L; }
    case 21:
      if (!!strchr(P(G.quitchars), c)) { $g = 22; continue $L; }
      matching = new Int8Array(96);
      k = 0;
      memset(P(matching), 0, 96);
      for (sidx[0] = 1; sidx[0] < MAXPCHARS; ++sidx[0]) {
        if (sidx[0] === DOOR || sidx[0] && sidx[0] <= DBWALL || sidx[0] === SDOOR || sidx[0] === SCORR || (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_room || (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_darkroom || (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_corr || (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === S_litcorr) {
          continue;
        }
        if (c === G.defsyms[sidx[0]].sym || c === G.showsyms[sidx[0]]) {
          matching[sidx[0]] = ++k << 24 >> 24;
        }
      }
      if (!k) { $g = 24; continue $L; }
      pass = 0;
    case 25:
      if (!(pass <= 1)) { $g = 27; continue $L; }
      lo_y = pass === 0 ? cy : 0;
      hi_y = pass === 0 ? ROWNO - 1 : cy;
      ty[0] = lo_y;
    case 28:
      if (!(ty[0] <= hi_y)) { $g = 30; continue $L; }
      lo_x = pass === 0 && ty[0] === lo_y ? cx + 1 : 1;
      hi_x = pass === 1 && ty[0] === hi_y ? cx : COLNO - 1;
      tx[0] = lo_x;
    case 31:
      if (!(tx[0] <= hi_x)) { $g = 33; continue $L; }
      k = glyph_at(tx[0], ty[0]);
      if (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && matching[k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))]) {
        { $g = 2; continue $L; }
      }
      if (G.level.flags.hero_memory | 0 && !G.iflags.terrainmode) {
        k = $at2(G.level.locations, tx[0], ty[0]).glyph;
        if (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && matching[k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))]) {
          { $g = 2; continue $L; }
        }
      }
      if ($at2(G.level.locations, tx[0], ty[0]).seenv) {
        k = await back_to_glyph(tx[0], ty[0]);
        if (k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS && matching[k >= 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) && k < 454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) + MAXPCHARS ? k - (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))]) {
          { $g = 2; continue $L; }
        }
      }
      { $g = 32; continue $L; };
    case 2: // foundc
      cx = tx[0], cy = ty[0];
      if (msg_given) {
        await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
        msg_given = FALSE;
      }
      { $g = 1; continue $L; }
    case 32:
      ++tx[0];
      { $g = 31; continue $L; }
    case 33:
    case 29:
      ++ty[0];
      { $g = 28; continue $L; }
    case 30:
    case 26:
      ++pass;
      { $g = 25; continue $L; }
    case 27:
      await pline(S("Can't find dungeon feature '%c'."), c);
      msg_given = TRUE;
      { $g = 1; continue $L; }
      { $g = 23; continue $L; }
    case 24:
      {
        let note = new Int8Array(128);
        if (!force) {
          strcpy(P(note), S("aborted"));
        } else {
          sprintf(P(note), S("use '%c', '%c', '%c', '%c' or '%s'"), G.Cmd.move_W, G.Cmd.move_S, G.Cmd.move_N, G.Cmd.move_E, visctrl(G.Cmd.spkeys[NHKF_GETPOS_PICK]));
        }
        await pline(S("Unknown direction: '%s' (%s)."), visctrl(c << 24 >> 24), P(note));
        msg_given = TRUE;
      }
    case 23:
    case 22:
      if (force) {
        { $g = 1; continue $L; }
      }
      await pline(S("Done."));
      msg_given = FALSE;
      cx = -1;
      cy = 0;
      result = 0;
      { $g = 5; continue $L; };
    case 20:
    case 18:
    case 16:
    case 14:
    case 12:
    case 10:
    case 8:
    case 6:
    case 1: // nxtc
      ;
      await G.windowprocs.win_cliparound(cx, cy);
      await G.windowprocs.win_curs(G.WIN_MAP, cx, cy);
      await flush_screen(0);
    case 4:
      { $g = 3; continue $L; }
    case 5:
      if (msg_given) {
        await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
      }
      ccp.x = cx << 24 >> 24;
      ccp.y = cy << 24 >> 24;
      for (i = 0; i < NUM_GLOCS; ++i) {
        if (garr[i]) {
          free(garr[i]);
        }
      }
      getpos_hilitefunc = null;
      getpos_getvalid = null;
      return result;
    }
    break;
  }
}

export async function new_mname(mon: struct_monst | null, lth: number): Promise<void> {
  if (lth) {
    if (!mon.mextra) {
      mon.mextra = await newmextra();
    } else {
      free_mname(mon);
    }
    mon.mextra.mname = P(new Int8Array((lth >>> 0)));
  } else {
    if (mon.mextra && mon.mextra.mname) {
      free_mname(mon);
    }
  }
}

export function free_mname(mon: struct_monst | null): void {
  if (mon.mextra && mon.mextra.mname) {
    free(mon.mextra.mname);
    mon.mextra.mname = null;
  }
}

export async function new_oname(obj: struct_obj | null, lth: number): Promise<void> {
  if (lth) {
    if (!obj.oextra) {
      obj.oextra = await newoextra();
    } else {
      free_oname(obj);
    }
    obj.oextra.oname = P(new Int8Array((lth >>> 0)));
  } else {
    if (obj.oextra && obj.oextra.oname) {
      free_oname(obj);
    }
  }
}

export function free_oname(obj: struct_obj | null): void {
  if (obj.oextra && obj.oextra.oname) {
    free(obj.oextra.oname);
    obj.oextra.oname = null;
  }
}

export function safe_oname(obj: struct_obj | null): Ptr | null {
  if (obj.oextra && obj.oextra.oname) {
    return obj.oextra.oname;
  }
  return S("");
}

async function name_from_player(outbuf: Ptr | null, prompt: Ptr | null, defres: Ptr | null): Promise<Ptr | null> {
  outbuf.a[outbuf.o] = 0;
  ;
  await G.windowprocs.win_getlin(prompt, outbuf);
  if (!outbuf.a[outbuf.o] || outbuf.a[outbuf.o] === 27) {
    return null;
  }
  mungspaces(outbuf);
  if (strlen(outbuf) >= PL_PSIZ) {
    outbuf.a[outbuf.o + (PL_PSIZ - 1)] = 0;
  }
  return outbuf;
}

export async function christen_monst(mtmp: struct_monst | null, name: Ptr | null): Promise<struct_monst | null> {
  let lth = 0;
  let buf = new Int8Array(63);
  lth = name && name.a[name.o] ? (strlen(name) | 0) + 1 : 0;
  if (lth > PL_PSIZ) {
    lth = PL_PSIZ;
    name = strncpy(P(buf), name, PL_PSIZ - 1);
    buf[PL_PSIZ - 1] = 0;
  }
  await new_mname(mtmp, lth);
  if (lth) {
    strcpy(mtmp.mextra.mname, name);
  }
  return mtmp;
}

async function alreadynamed(mtmp: struct_monst | null, monnambuf: Ptr | null, usrbuf: Ptr | null): Promise<number> {
  let pronounbuf = new Int8Array(10);
  let p = null;
  if (fuzzymatch(usrbuf, monnambuf, S(" -_"), TRUE) || !strncmpi(monnambuf, S("the "), 4) && fuzzymatch(usrbuf, monnambuf.add(4), S(" -_"), TRUE) || !!(p = strstri(monnambuf, S("invisible "))) && fuzzymatch(usrbuf, p.add(10), S(" -_"), TRUE) || !!(p = strstri(monnambuf, S(" of "))) && fuzzymatch(usrbuf, p.add(4), S(" -_"), TRUE)) {
    await pline(S("%s is already called %s."), upstart(strcpy(P(pronounbuf), G.genders[pronoun_gender(mtmp, 0)].he)), monnambuf);
    return TRUE;
  } else if (mtmp.data === $sat(G.mons, PM_JUIBLEX) && strstri(monnambuf, S("Juiblex")) && !strncmpi(usrbuf, S("Jubilex"), -1)) {
    await pline(S("%s doesn't like being called %s."), upstart(monnambuf), usrbuf);
    return TRUE;
  }
  return FALSE;
}

async function do_mname(): Promise<void> {
  let buf = new Int8Array(256);
  let monnambuf = new Int8Array(256);
  let qbuf = new Int8Array(128);
  let cc = new struct_nhcoord();
  let cx = 0;
  let cy = 0;
  let mtmp = null;
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await You(S("would never recognize it anyway."));
    return;
  }
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  if (await getpos(cc, FALSE, S("the monster you want to name")) < 0 || !isok(cc.x, cc.y)) {
    return;
  }
  cx = cc.x, cy = cc.y;
  if (cx === G.u.ux && cy === G.u.uy) {
    if (G.u.usteed && ((G.u.usteed.wormno | 0 ? worm_known(G.u.usteed) : $rd(G.viz_array.a[G.viz_array.o + G.u.usteed.my], G.u.usteed.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && G.u.usteed && G.u.usteed.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + G.u.usteed.my], G.u.usteed.mx) & 1 ? 1 : 0) && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) || (!((G.u.usteed.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(G.u.usteed.mx, G.u.usteed.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & G.u.usteed.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & G.u.usteed.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === G.u.usteed.data)))) {
      mtmp = G.u.usteed;
    } else {
      await pline(S("This %s creature is called %s and cannot be renamed."), beautiful(), P(G.plname));
      return;
    }
  } else {
    mtmp = !!G.level.monsters[cx][cy] ? G.level.monsters[cx][cy] : null;
  }
  if (!mtmp || !(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) && (!($rd(G.viz_array.a[G.viz_array.o + cy], cx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) || mtmp.mundetected | 0 || (mtmp.m_ap_type & 7) === M_AP_FURNITURE || (mtmp.m_ap_type & 7) === M_AP_OBJECT || mtmp.minvis | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic))) {
    await pline(S("I see no monster there."));
    return;
  }
  sprintf(P(qbuf), S("What do you want to call %s?"), await distant_monnam(mtmp, ARTICLE_THE, P(monnambuf)));
  if (!await name_from_player(P(buf), P(qbuf), mtmp.mextra && mtmp.mextra.mname ? mtmp.mextra.mname : null)) {
    return;
  }
  if (mtmp.data.geno & G_UNIQ && !mtmp.ispriest) {
    if (!await alreadynamed(mtmp, P(monnambuf), P(buf))) {
      await pline(S("%s doesn't like being called names!"), upstart(P(monnambuf)));
    }
  } else if (mtmp.isshk | 0 && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic || mtmp.msleeping | 0 || !mtmp.mcanmove || mtmp.data.msound <= MS_ANIMAL)) {
    if (!await alreadynamed(mtmp, P(monnambuf), P(buf))) {
      await verbalize(S("I'm %s, not %s."), await shkname(mtmp), P(buf));
    }
  } else if (mtmp.ispriest | 0 || mtmp.isminion | 0 || mtmp.isshk | 0) {
    if (!await alreadynamed(mtmp, P(monnambuf), P(buf))) {
      await pline(S("%s will not accept the name %s."), upstart(P(monnambuf)), P(buf));
    }
  } else {
    await christen_monst(mtmp, P(buf));
  }
}

async function do_oname(obj: struct_obj | null): Promise<void> {
  let bufp = null;
  let buf = new Int8Array(256);
  let bufcpy = new Int8Array(256);
  let qbuf = new Int8Array(128);
  let aname = null;
  const objtyp = new Int16Array(1);
  if (obj.otyp === SPE_NOVEL) {
    await pline(S("%s already has a published name."), await Ysimple_name2(obj));
    return;
  }
  sprintf(P(qbuf), S("What do you want to name %s "), obj.quan !== 1 || obj.oartifact === 26 && !undiscovered_artifact(26) ? S("these") : S("this"));
  await safe_qbuf(P(qbuf), P(qbuf), S("?"), obj, xname, simpleonames, S("item"));
  if (!await name_from_player(P(buf), P(qbuf), safe_oname(obj))) {
    return;
  }
  if (!!(aname = artifact_name(P(buf), P(objtyp, 0))) && objtyp[0] === obj.otyp) {
    strcpy(P(buf), aname);
  }
  if (obj.oartifact) {
    await pline_The(S("artifact seems to resist the attempt."));
    return;
  } else if (restrict_name(obj, P(buf)) || exist_artifact(obj.otyp, P(buf))) {
    strcpy(P(bufcpy), P(buf));
    bufp = !strncmpi(P(bufcpy), S("the "), 4) ? P(buf).add(4) : P(buf);
    do {
      wipeout_text(bufp, rn2_on_display_rng(2), 0);
    } while (!strcmp(P(buf), P(bufcpy)));
    await pline(S("While engraving, your %s slips."), body_part(HAND));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    await You(S("engrave: \"%s\"."), P(buf));
    ++G.u.uconduct.literate;
  }
  ++via_naming;
  obj = await oname(obj, P(buf));
  --via_naming;
}

export async function oname(obj: struct_obj | null, name: Ptr | null): Promise<struct_obj | null> {
  let lth = 0;
  let buf = new Int8Array(63);
  lth = name.a[name.o] ? strlen(name) + 1 | 0 : 0;
  if (lth > PL_PSIZ) {
    lth = PL_PSIZ;
    name = strncpy(P(buf), name, PL_PSIZ - 1);
    buf[PL_PSIZ - 1] = 0;
  }
  if (obj.oartifact || lth && exist_artifact(obj.otyp, name)) {
    return obj;
  }
  await new_oname(obj, lth);
  if (lth) {
    strcpy(obj.oextra.oname, name);
  }
  if (lth) {
    artifact_exists(obj, name, TRUE);
  }
  if (obj.oartifact) {
    if (obj === G.uswapwep) {
      await untwoweapon();
    }
    if (obj === G.uwep) {
      await set_artifact_intrinsic(obj, TRUE, W_WEP);
    }
    if (obj.unpaid) {
      await alter_cost(obj, 0);
    }
    if (via_naming) {
      ++G.u.uconduct.literate;
    }
  }
  if (obj.where === 3) {
    update_inventory();
  }
  return obj;
}

export function objtyp_is_callable(i: number): number {
  return (G.objects[i].oc_uname || G.obj_descr[G.objects[i].oc_descr_idx].oc_descr && strchr(P(callable), G.objects[i].oc_class) ? 1 : 0) << 24 >> 24;
}

export async function docallcmd(): Promise<number> {
  let obj = null;
  let win = 0;
  let any = new union_any();
  const pick_list = [null];
  pick_list[0] = null;
  let ch = 0;
  let allowall = new Int8Array(2);
  let abc = G.flags.lootabc;
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  any.$cp(G.zeroany);
  any.a_char = 109;
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, abc ? 0 : any.a_char, 67, ATR_NONE, S("a monster"), MENU_UNSELECTED);
  if (G.invent) {
    any.a_char = 105;
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, abc ? 0 : any.a_char, 121, ATR_NONE, S("a particular object in inventory"), MENU_UNSELECTED);
    any.a_char = 111;
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, abc ? 0 : any.a_char, 110, ATR_NONE, S("the type of an object in inventory"), MENU_UNSELECTED);
  }
  any.a_char = 102;
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, abc ? 0 : any.a_char, 44, ATR_NONE, S("the type of an object upon the floor"), MENU_UNSELECTED);
  any.a_char = 100;
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, abc ? 0 : any.a_char, 92, ATR_NONE, S("the type of an object on discoveries list"), MENU_UNSELECTED);
  any.a_char = 97;
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, abc ? 0 : any.a_char, 108, ATR_NONE, S("record an annotation for the current level"), MENU_UNSELECTED);
  await G.windowprocs.win_end_menu(win, S("What do you want to name?"));
  if (await G.windowprocs.win_select_menu(win, PICK_ONE, P(pick_list, 0)) > 0) {
    ch = pick_list[0].item.a_char;
    free(pick_list[0]);
  } else {
    ch = 113;
  }
  await G.windowprocs.win_destroy_nhwindow(win);
  switch (ch) {
  default:
  case 113:
    break;
  case 109:
    await do_mname();
    break;
  case 105:
    allowall[0] = ALL_CLASSES;
    allowall[1] = 0;
    obj = await getobj(P(allowall), S("name"));
    if (obj) {
      await do_oname(obj);
    }
    break;
  case 111:
    obj = await getobj(P(callable), S("call"));
    if (obj) {
      await xname(obj);
      if (!obj.dknown) {
        await You(S("would never recognize another one."));
      } else {
        await docall(obj);
      }
    }
    break;
  case 102:
    await namefloorobj();
    break;
  case 100:
    await rename_disco();
    break;
  case 97:
    await donamelevel();
    break;
  }
  return 0;
}

async function docall_xname(obj: struct_obj | null): Promise<Ptr | null> {
  let otemp = new struct_obj();
  otemp.$cp(obj);
  otemp.oextra = null;
  otemp.quan = 1;
  otemp.blessed = (otemp.cursed = 0) & 1;
  if (otemp.oclass === WEAPON_CLASS) {
    otemp.otrapped = 0;
  } else if (otemp.oclass === POTION_CLASS) {
    otemp.oeroded = 0;
  } else if (otemp.otyp === TOWEL || otemp.otyp === STATUE) {
    otemp.spe = 0;
  } else if (otemp.otyp === TIN) {
    otemp.known = 0;
  } else if (otemp.otyp === FIGURINE) {
    otemp.corpsenm = NON_PM;
  } else if (otemp.otyp === HEAVY_IRON_BALL) {
    otemp.owt = G.objects[HEAVY_IRON_BALL].oc_weight;
  } else if (otemp.oclass === FOOD_CLASS && otemp.globby | 0) {
    otemp.owt = 120;
  }
  return await an(await xname(otemp));
}

export async function docall(obj: struct_obj | null): Promise<void> {
  let buf = new Int8Array(256);
  let qbuf = new Int8Array(128);
  let str1 = null;
  if (!obj.dknown) {
    return;
  }
  await flush_screen(1);
  if (obj.oclass === POTION_CLASS && obj.corpsenm) {
    sprintf(P(qbuf), S("Call a stream of %s fluid:"), G.obj_descr[G.objects[obj.otyp].oc_descr_idx].oc_descr);
  } else {
    await safe_qbuf(P(qbuf), S("Call "), S(":"), obj, docall_xname, simpleonames, S("thing"));
  }
  str1 = P(G.objects[obj.otyp], "oc_uname");
  if (!await name_from_player(P(buf), P(qbuf), str1.a[str1.o])) {
    return;
  }
  if (str1.a[str1.o]) {
    free(str1.a[str1.o]);
  }
  mungspaces(P(buf));
  if (!$rd(P(buf))) {
    if (str1.a[str1.o]) {
      str1.a[str1.o] = null;
      await undiscover_object(obj.otyp);
    }
  } else {
    str1.a[str1.o] = await dupstr(P(buf));
    await discover_object(obj.otyp, FALSE, TRUE);
  }
}

async function namefloorobj(): Promise<void> {
  let cc = new struct_nhcoord();
  let glyph = 0;
  let buf = new Int8Array(256);
  const obj = [null];
  obj[0] = null;
  let fakeobj = FALSE;
  let use_plural = 0;
  cc.x = G.u.ux, cc.y = G.u.uy;
  sprintf(P(buf), S("object on map (or '.' for one %s you)"), G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0 ? S("over") : S("under"));
  if (await getpos(cc, FALSE, P(buf)) < 0 || cc.x <= 0) {
    return;
  }
  if (cc.x === G.u.ux && cc.y === G.u.uy) {
    obj[0] = G.level.objects[G.u.ux][G.u.uy];
  } else {
    glyph = glyph_at(cc.x, cc.y);
    if (glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || glyph >= 382 + (1 + (382 + (382 + 0))) && glyph < 382 + (1 + (382 + (382 + 0))) + 382) {
      fakeobj = await object_from_map(glyph, cc.x, cc.y, P(obj, 0));
    }
  }
  if (!obj[0]) {
    await pline(S("There doesn't seem to be any object %s."), cc.x === G.u.ux && cc.y === G.u.uy ? S("under you") : S("there"));
    return;
  }
  strcpy(P(buf), obj[0].otyp !== STRANGE_OBJECT ? await simpleonames(obj[0]) : G.obj_descr[STRANGE_OBJECT].oc_name);
  use_plural = (obj[0].quan > 1 ? 1 : 0) << 24 >> 24;
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    let unames = new Array(6).fill(null);
    let tmpbuf = new Int8Array(256);
    unames[0] = (G.u.umonnum !== G.u.umonster ? G.u.mfemale | 0 : G.flags.female) && G.urole.name.f ? G.urole.name.f : G.urole.name.m;
    unames[1] = rank_of(rn2_on_display_rng(30) + 1, G.urole.malenum, G.flags.female);
    unames[2] = await bogusmon(P(tmpbuf), null);
    unames[3] = unames[2];
    unames[4] = roguename();
    unames[5] = S("Wibbly Wobbly");
    await pline(S("%s %s to call you \"%s.\""), await The(P(buf)), use_plural ? S("decide") : S("decides"), unames[rn2_on_display_rng(Math.trunc(48 / 8) | 0)]);
  } else if (!objtyp_is_callable(obj[0].otyp)) {
    await pline(S("%s %s can't be assigned a type name."), use_plural ? S("Those") : S("That"), P(buf));
  } else if (!obj[0].dknown) {
    await You(S("don't know %s %s well enough to name %s."), use_plural ? S("those") : S("that"), P(buf), use_plural ? S("them") : S("it"));
  } else {
    await docall(obj[0]);
  }
  if (fakeobj) {
    obj[0].where = OBJ_FREE;
    await dealloc_obj(obj[0]);
  }
}

export function rndghostname(): Ptr | null {
  return rn2(7) ? ghostnames[rn2(Math.trunc(264 / 8) | 0)] : P(G.plname);
}

export async function x_monnam(mtmp: struct_monst | null, article: number, adjective: Ptr | null, suppress: number, called: number): Promise<Ptr | null> {
  let buf = nextmbuf();
  let mdat = mtmp.data;
  let pm_name = mdat.mname;
  let do_hallu = 0;
  let do_invis = 0;
  let do_it = 0;
  let do_saddle = 0;
  let do_name = 0;
  let name_at_start = 0;
  let has_adjectives = 0;
  let bp = null;
  if (G.program_state.gameover) {
    suppress |= SUPPRESS_HALLUCINATION;
  }
  if (article === ARTICLE_YOUR && !mtmp.mtame) {
    article = ARTICLE_THE;
  }
  do_hallu = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !(suppress & SUPPRESS_HALLUCINATION) ? 1 : 0) << 24 >> 24;
  do_invis = (mtmp.minvis | 0 && !(suppress & SUPPRESS_INVISIBLE) ? 1 : 0) << 24 >> 24;
  do_it = (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && article !== ARTICLE_YOUR && !G.program_state.gameover && mtmp !== G.u.usteed && !(G.u.uswallow | 0 && mtmp === G.u.ustuck) && !(suppress & SUPPRESS_IT) ? 1 : 0) << 24 >> 24;
  do_saddle = (!(suppress & SUPPRESS_SADDLE) ? 1 : 0) << 24 >> 24;
  do_name = (!(suppress & SUPPRESS_NAME) || (mdat.mflags2 & 524288) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  buf.a[buf.o] = 0;
  if (do_it) {
    strcpy(buf, S("it"));
    return buf;
  }
  if (mtmp.ispriest | 0 || mtmp.isminion | 0) {
    let priestnambuf = new Int8Array(256);
    let name = null;
    let save_prop = G.u.uprops[HALLUC_RES].extrinsic;
    let save_invis = mtmp.minvis;
    if (!do_hallu) {
      G.u.uprops[HALLUC_RES].extrinsic = 1;
    }
    if (!do_invis) {
      mtmp.minvis = 0;
    }
    name = await priestname(mtmp, P(priestnambuf));
    G.u.uprops[HALLUC_RES].extrinsic = save_prop;
    mtmp.minvis = (save_invis) & 1;
    if (article === ARTICLE_NONE && !strncmp(name, S("the "), 4)) {
      name = name.add(4);
    }
    return strcpy(buf, name);
  }
  if (mdat === $sat(G.mons, PM_ALIGNED_PRIEST)) {
    pm_name = mtmp.female | 0 ? S("priestess") : S("priest");
  } else if (mdat === $sat(G.mons, PM_HIGH_PRIEST) && mtmp.female | 0) {
    pm_name = S("high priestess");
  }
  if (mtmp.isshk | 0 && !do_hallu) {
    if (adjective && article === ARTICLE_THE) {
      strcpy(buf, S("the "));
      strcat(strcat(buf, adjective), S(" "));
      strcat(buf, await shkname(mtmp));
      return buf;
    }
    strcat(buf, await shkname(mtmp));
    if (mdat === $sat(G.mons, PM_SHOPKEEPER) && !do_invis) {
      return buf;
    }
    strcat(buf, S(" the "));
    if (do_invis) {
      strcat(buf, S("invisible "));
    }
    strcat(buf, pm_name);
    return buf;
  }
  if (adjective) {
    strcat(strcat(buf, adjective), S(" "));
  }
  if (do_invis) {
    strcat(buf, S("invisible "));
  }
  if (do_saddle && mtmp.misc_worn_check & W_SADDLE && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    strcat(buf, S("saddled "));
  }
  has_adjectives = (buf.a[buf.o] !== 0 ? 1 : 0) << 24 >> 24;
  if (do_hallu) {
    const rnamecode = new Int8Array(1);
    let rname = await rndmonnam(P(rnamecode, 0));
    strcat(buf, rname);
    name_at_start = bogon_is_pname(rnamecode[0]);
  } else if (do_name && (mtmp.mextra && mtmp.mextra.mname)) {
    let name = mtmp.mextra.mname;
    if (mdat === $sat(G.mons, PM_GHOST)) {
      sprintf(eos(buf), S("%s ghost"), s_suffix(name));
      name_at_start = TRUE;
    } else if (called) {
      sprintf(eos(buf), S("%s called %s"), pm_name, name);
      name_at_start = ((mdat.mflags2 & 524288) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    } else if ($sidx(mdat) >= $sidx($sat(G.mons, 328)) && $sidx(mdat) <= $sidx($sat(G.mons, 342)) && !!(bp = strstri(name, S(" the ")))) {
      let pbuf = new Int8Array(256);
      strcpy(P(pbuf), name);
      pbuf[bp.o - name.o + 5] = 0;
      if (has_adjectives) {
        strcat(P(pbuf), buf);
      }
      strcat(P(pbuf), bp.add(5));
      strcpy(buf, P(pbuf));
      article = ARTICLE_NONE;
      name_at_start = TRUE;
    } else {
      strcat(buf, name);
      name_at_start = TRUE;
    }
  } else if ($sidx(mdat) >= $sidx($sat(G.mons, 328)) && $sidx(mdat) <= $sidx($sat(G.mons, 342)) && !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum)) {
    let pbuf = new Int8Array(256);
    strcpy(P(pbuf), rank_of(mtmp.m_lev, await monsndx(mdat), mtmp.female << 24 >> 24));
    strcat(buf, lcase(P(pbuf)));
    name_at_start = FALSE;
  } else {
    strcat(buf, pm_name);
    name_at_start = ((mdat.mflags2 & 524288) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if (name_at_start && (article === ARTICLE_YOUR || !has_adjectives)) {
    if (mdat === $sat(G.mons, PM_WIZARD_OF_YENDOR)) {
      article = ARTICLE_THE;
    } else {
      article = ARTICLE_NONE;
    }
  } else if (mdat.geno & G_UNIQ && article === ARTICLE_A) {
    article = ARTICLE_THE;
  }
  {
    let buf2 = new Int8Array(256);
    switch (article) {
    case 3:
      strcpy(P(buf2), S("your "));
      strcat(P(buf2), buf);
      strcpy(buf, P(buf2));
      return buf;
    case 1:
      strcpy(P(buf2), S("the "));
      strcat(P(buf2), buf);
      strcpy(buf, P(buf2));
      return buf;
    case 2:
      return await an(buf);
    case 0:
    default:
      return buf;
    }
  }
}

export async function l_monnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  return await x_monnam(mtmp, ARTICLE_NONE, null, mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE : 0, TRUE);
}

export async function mon_nam(mtmp: struct_monst | null): Promise<Ptr | null> {
  return await x_monnam(mtmp, ARTICLE_THE, null, mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE : 0, FALSE);
}

export async function noit_mon_nam(mtmp: struct_monst | null): Promise<Ptr | null> {
  return await x_monnam(mtmp, ARTICLE_THE, null, mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE | SUPPRESS_IT : SUPPRESS_IT, FALSE);
}

export async function Monnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  let bp = await mon_nam(mtmp);
  bp.a[bp.o] = highc(bp.a[bp.o]);
  return bp;
}

export async function noit_Monnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  let bp = await noit_mon_nam(mtmp);
  bp.a[bp.o] = highc(bp.a[bp.o]);
  return bp;
}

export async function noname_monnam(mtmp: struct_monst | null, article: number): Promise<Ptr | null> {
  return await x_monnam(mtmp, article, null, SUPPRESS_NAME, FALSE);
}

export async function m_monnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  return await x_monnam(mtmp, ARTICLE_NONE, null, EXACT_NAME, FALSE);
}

export async function y_monnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  let prefix = 0;
  let suppression_flag = 0;
  prefix = mtmp.mtame ? ARTICLE_YOUR : ARTICLE_THE;
  suppression_flag = mtmp.mextra && mtmp.mextra.mname || mtmp === G.u.usteed ? SUPPRESS_SADDLE : 0;
  return await x_monnam(mtmp, prefix, null, suppression_flag, FALSE);
}

export async function Adjmonnam(mtmp: struct_monst | null, adj: Ptr | null): Promise<Ptr | null> {
  let bp = await x_monnam(mtmp, ARTICLE_THE, adj, mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE : 0, FALSE);
  bp.a[bp.o] = highc(bp.a[bp.o]);
  return bp;
}

export async function a_monnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  return await x_monnam(mtmp, ARTICLE_A, null, mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE : 0, FALSE);
}

export async function Amonnam(mtmp: struct_monst | null): Promise<Ptr | null> {
  let bp = await a_monnam(mtmp);
  bp.a[bp.o] = highc(bp.a[bp.o]);
  return bp;
}

export async function distant_monnam(mon: struct_monst | null, article: number, outbuf: Ptr | null): Promise<Ptr | null> {
  if (mon.data === $sat(G.mons, PM_HIGH_PRIEST) && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > 2) {
    strcpy(outbuf, article === ARTICLE_THE ? S("the ") : S(""));
    strcat(outbuf, mon.female | 0 ? S("high priestess") : S("high priest"));
  } else {
    strcpy(outbuf, await x_monnam(mon, article, null, 0, TRUE));
  }
  return outbuf;
}

export async function mon_nam_too(mon: struct_monst | null, other_mon: struct_monst | null): Promise<Ptr | null> {
  let outbuf = null;
  if (mon !== other_mon) {
    outbuf = await mon_nam(mon);
  } else {
    outbuf = nextmbuf();
    switch (pronoun_gender(mon, FALSE)) {
    case 0:
      strcpy(outbuf, S("himself"));
      break;
    case 1:
      strcpy(outbuf, S("herself"));
      break;
    default:
      strcpy(outbuf, S("itself"));
      break;
    }
  }
  return outbuf;
}

export function minimal_monnam(mon: struct_monst | null, ckloc: number): Ptr | null {
  let ptr = null;
  let outbuf = nextmbuf();
  if (!mon) {
    strcpy(outbuf, S("[Null monster]"));
  } else if (!(ptr = mon.data)) {
    strcpy(outbuf, S("[Null mon->data]"));
  } else if ($sidx(ptr) < $sidx($sat(G.mons, 0))) {
    sprintf(outbuf, S("[Invalid mon->data %s < %s]"), fmt_ptr(mon.data), fmt_ptr($sat(G.mons, 0)));
  } else if ($sidx(ptr) >= $sidx($sat(G.mons, NUMMONS))) {
    sprintf(outbuf, S("[Invalid mon->data %s >= %s]"), fmt_ptr(mon.data), fmt_ptr($sat(G.mons, NUMMONS)));
  } else if (ckloc && ptr === $sat(G.mons, PM_LONG_WORM) && G.level.monsters[mon.mx][mon.my] !== mon) {
    sprintf(outbuf, S("%s <%d,%d>"), G.mons[PM_LONG_WORM_TAIL].mname, mon.mx, mon.my);
  } else {
    sprintf(outbuf, S("%s%s <%d,%d>"), mon.mtame ? S("tame ") : mon.mpeaceful | 0 ? S("peaceful ") : S(""), mon.data.mname, mon.mx, mon.my);
    if (mon.cham !== NON_PM) {
      sprintf(eos(outbuf), S("{%s}"), G.mons[mon.cham].mname);
    }
  }
  return outbuf;
}

async function bogusmon(buf: Ptr | null, code: Ptr | null): Promise<Ptr | null> {
  let mname = buf;
  if (code) {
    code.a[code.o] = 0;
  }
  await get_rnd_text(S("bogusmon"), buf, rn2_on_display_rng);
  if (!mname.a[mname.o]) {
    strcpy(buf, S("bogon"));
  } else if (strchr(P(bogusmon$bogon_codes), mname.a[mname.o])) {
    if (code) {
      code.a[code.o] = mname.a[mname.o];
    }
    mname = mname.add(1);
  }
  return mname;
}

export async function rndmonnam(code: Ptr | null): Promise<Ptr | null> {
  let mname = null;
  let name = 0;
  if (code) {
    code.a[code.o] = 0;
  }
  do {
    name = rn2_on_display_rng(SPECIAL_PM + BOGUSMONSIZE - LOW_PM) + LOW_PM;
  } while (name < SPECIAL_PM && (($sat(G.mons, name).mflags2 & 524288) >>> 0 !== 0 || G.mons[name].geno & G_NOGEN));
  if (name >= SPECIAL_PM) {
    mname = await bogusmon(P(rndmonnam$buf), code);
  } else {
    mname = strcpy(P(rndmonnam$buf), G.mons[name].mname);
  }
  return mname;
}

export function bogon_is_pname(code: number): number {
  if (!code) {
    return FALSE;
  }
  return (strchr(S("-+="), code) ? TRUE : FALSE) << 24 >> 24;
}

export function roguename(): Ptr | null {
  let i = null;
  let opts = null;
  if (!!(opts = nh_getenv(S("ROGUEOPTS")))) {
    for (i = opts; i.a[i.o]; i = i.add(1)) {
      if (!strncmp(S("name="), i, 5)) {
        let j = null;
        if (!!(j = strchr(i.add(5), 44))) {
          j.a[j.o] = 0;
        }
        return i.add(5);
      }
    }
  }
  return rn2(3) ? rn2(2) ? S("Michael Toy") : S("Kenneth Arnold") : S("Glenn Wichman");
}

export function hcolor(colorpref: Ptr | null): Ptr | null {
  return G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || !colorpref ? hcolors[rn2_on_display_rng(Math.trunc(272 / 8) | 0)] : colorpref;
}

export function rndcolor(): Ptr | null {
  let k = rn2(CLR_MAX);
  return G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? hcolor(null) : k === NO_COLOR ? S("colorless") : G.c_obj_colors[k];
}

export function hliquid(liquidpref: Ptr | null): Ptr | null {
  return G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || !liquidpref ? hliquids[rn2(Math.trunc(272 / 8) | 0)] : liquidpref;
}

export async function coyotename(mtmp: struct_monst | null, buf: Ptr | null): Promise<Ptr | null> {
  if (mtmp && buf) {
    sprintf(buf, S("%s - %s"), await x_monnam(mtmp, ARTICLE_NONE, null, 0, TRUE), mtmp.mcan | 0 ? coynames[(Math.trunc(176 / 8) | 0) - 1] : coynames[mtmp.m_id % ((Math.trunc(176 / 8) | 0) - 1 >>> 0)]);
  }
  return buf;
}

export function rndorcname(s: Ptr | null): Ptr | null {
  let i = 0;
  let iend = rn2(2) + 3;
  let vstart = rn2(2);
  if (s) {
    s.a[s.o] = 0;
    for (i = 0; i < iend; ++i) {
      vstart = 1 - vstart;
      sprintf(eos(s), S("%s%s"), i > 0 && !rn2(30) ? S("-") : S(""), vstart ? rndorcname$v[rn2(Math.trunc(32 / 8) | 0)] : rndorcname$snd[rn2(Math.trunc(88 / 8) | 0)]);
    }
  }
  return s;
}

export async function christen_orc(mtmp: struct_monst | null, gang: Ptr | null, other: Ptr | null): Promise<struct_monst | null> {
  let sz = 0;
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let orcname = null;
  orcname = rndorcname(P(buf2));
  sz = strlen(orcname) | 0;
  if (gang) {
    sz += strlen(gang) + 5 - 1 | 0;
  } else if (other) {
    sz += strlen(other) | 0;
  }
  if (sz < BUFSZ) {
    let gbuf = new Int8Array(256);
    let nameit = FALSE;
    if (gang && orcname) {
      sprintf(P(buf), S("%s of %s"), upstart(orcname), upstart(strcpy(P(gbuf), gang)));
      nameit = TRUE;
    } else if (other && orcname) {
      sprintf(P(buf), S("%s%s"), upstart(orcname), other);
      nameit = TRUE;
    }
    if (nameit) {
      mtmp = await christen_monst(mtmp, P(buf));
    }
  }
  return mtmp;
}

export function noveltitle(novidx: Ptr | null): Ptr | null {
  let j = 0;
  let k = Math.trunc(328 / 8) | 0;
  j = rn2(k);
  if (novidx) {
    if (novidx.a[novidx.o] === -1) {
      novidx.a[novidx.o] = j;
    } else if (novidx.a[novidx.o] >= 0 && novidx.a[novidx.o] < k) {
      j = novidx.a[novidx.o];
    }
  }
  return sir_Terry_novels[j];
}

export async function lookup_novel(lookname: Ptr | null, idx: Ptr | null): Promise<Ptr | null> {
  let k = 0;
  if (!strncmpi(await The(lookname), S("The Color of Magic"), -1)) {
    lookname = sir_Terry_novels[0];
  }
  for (k = 0; k < (Math.trunc(328 / 8) | 0); ++k) {
    if (!strncmpi(lookname, sir_Terry_novels[k], -1) || !strncmpi(await The(lookname), sir_Terry_novels[k], -1)) {
      if (idx) {
        idx.a[idx.o] = k;
      }
      return sir_Terry_novels[k];
    }
  }
  if (idx && idx.a[idx.o] >= 0 && idx.a[idx.o] < (Math.trunc(328 / 8) | 0)) {
    return sir_Terry_novels[idx.a[idx.o]];
  }
  return null;
}

export function $init(): void {
  getpos_hilitefunc = null;
  getpos_getvalid = null;
  gloc_descr = [[S("any monsters"),
S("monster"),
S("next/previous monster"),
S("monsters")],
[S("any items"),
S("item"),
S("next/previous object"),
S("objects")],
[S("any doors"),
S("door"),
S("next/previous door or doorway"),
S("doors or doorways")],
[S("any unexplored areas"),
S("unexplored area"),
S("unexplored location"),
S("unexplored locations")],
[S("anything interesting"),
S("interesting thing"),
S("anything interesting"),
S("anything interesting")],
[S("any valid locations"),
S("valid location"),
S("valid location"),
S("valid locations")]];
  gloc_filtertxt = [S(""), S(" in view"), S(" in this area")];
  gloc_filter_map = null;
  gloc_filter_floodfill_match_glyph = 0;
  via_naming = 0;
  callable = $ta(Int8Array, 10, [SCROLL_CLASS, POTION_CLASS, WAND_CLASS, RING_CLASS, AMULET_CLASS, GEM_CLASS, SPBOOK_CLASS, ARMOR_CLASS, TOOL_CLASS]);
  ghostnames = [S("Adri"),
S("Andries"),
S("Andreas"),
S("Bert"),
S("David"),
S("Dirk"),
S("Emile"),
S("Frans"),
S("Fred"),
S("Greg"),
S("Hether"),
S("Jay"),
S("John"),
S("Jon"),
S("Karnov"),
S("Kay"),
S("Kenny"),
S("Kevin"),
S("Maud"),
S("Michiel"),
S("Mike"),
S("Peter"),
S("Robert"),
S("Ron"),
S("Tom"),
S("Wilmar"),
S("Nick Danger"),
S("Phoenix"),
S("Jiro"),
S("Mizue"),
S("Stephan"),
S("Lance Braccus"),
S("Shadowhawk")];
  hcolors = [S("ultraviolet"),
S("infrared"),
S("bluish-orange"),
S("reddish-green"),
S("dark white"),
S("light black"),
S("sky blue-pink"),
S("salty"),
S("sweet"),
S("sour"),
S("bitter"),
S("striped"),
S("spiral"),
S("swirly"),
S("plaid"),
S("checkered"),
S("argyle"),
S("paisley"),
S("blotchy"),
S("guernsey-spotted"),
S("polka-dotted"),
S("square"),
S("round"),
S("triangular"),
S("cabernet"),
S("sangria"),
S("fuchsia"),
S("wisteria"),
S("lemon-lime"),
S("strawberry-banana"),
S("peppermint"),
S("romantic"),
S("incandescent"),
S("octarine")];
  hliquids = [S("yoghurt"),
S("oobleck"),
S("clotted blood"),
S("diluted water"),
S("purified water"),
S("instant coffee"),
S("tea"),
S("herbal infusion"),
S("liquid rainbow"),
S("creamy foam"),
S("mulled wine"),
S("bouillon"),
S("nectar"),
S("grog"),
S("flubber"),
S("ketchup"),
S("slow light"),
S("oil"),
S("vinaigrette"),
S("liquid crystal"),
S("honey"),
S("caramel sauce"),
S("ink"),
S("aqueous humour"),
S("milk substitute"),
S("fruit juice"),
S("glowing lava"),
S("gastric acid"),
S("mineral water"),
S("cough syrup"),
S("quicksilver"),
S("sweet vitriol"),
S("grey goo"),
S("pink slime")];
  coynames = [S("Carnivorous Vulgaris"),
S("Road-Runnerus Digestus"),
S("Eatibus Anythingus"),
S("Famishus-Famishus"),
S("Eatibus Almost Anythingus"),
S("Eatius Birdius"),
S("Famishius Fantasticus"),
S("Eternalii Famishiis"),
S("Famishus Vulgarus"),
S("Famishius Vulgaris Ingeniusi"),
S("Eatius-Slobbius"),
S("Hardheadipus Oedipus"),
S("Carnivorous Slobbius"),
S("Hard-Headipus Ravenus"),
S("Evereadii Eatibus"),
S("Apetitius Giganticus"),
S("Hungrii Flea-Bagius"),
S("Overconfidentii Vulgaris"),
S("Caninus Nervous Rex"),
S("Grotesques Appetitus"),
S("Nemesis Ridiculii"),
S("Canis latrans")];
  sir_Terry_novels = [S("The Colour of Magic"),
S("The Light Fantastic"),
S("Equal Rites"),
S("Mort"),
S("Sourcery"),
S("Wyrd Sisters"),
S("Pyramids"),
S("Guards! Guards!"),
S("Eric"),
S("Moving Pictures"),
S("Reaper Man"),
S("Witches Abroad"),
S("Small Gods"),
S("Lords and Ladies"),
S("Men at Arms"),
S("Soul Music"),
S("Interesting Times"),
S("Maskerade"),
S("Feet of Clay"),
S("Hogfather"),
S("Jingo"),
S("The Last Continent"),
S("Carpe Jugulum"),
S("The Fifth Elephant"),
S("The Truth"),
S("Thief of Time"),
S("The Last Hero"),
S("The Amazing Maurice and His Educated Rodents"),
S("Night Watch"),
S("The Wee Free Men"),
S("Monstrous Regiment"),
S("A Hat Full of Sky"),
S("Going Postal"),
S("Thud!"),
S("Wintersmith"),
S("Making Money"),
S("Unseen Academicals"),
S("I Shall Wear Midnight"),
S("Snuff"),
S("Raising Steam"),
S("The Shepherd's Crown")];
  nextmbuf$bufs = $arr(5, () => new Int8Array(256));
  nextmbuf$bufidx = 0;
  getpos_help$fastmovemode = [S("8 units at a time"), S("skipping same glyphs")];
  dxdy_to_dist_descr$buf = new Int8Array(30);
  dxdy_to_dist_descr$dirnames = [[S("n"), S("north")],
[S("s"), S("south")],
[S("w"), S("west")],
[S("e"), S("east")]];
  coord_desc$screen_fmt = new Int8Array(16);
  getpos$pick_chars_def = $sarrOf([anon_do_name_c_635.$of(NHKF_GETPOS_PICK, LOOK_TRADITIONAL),
anon_do_name_c_635.$of(NHKF_GETPOS_PICK_Q, LOOK_QUICK),
anon_do_name_c_635.$of(NHKF_GETPOS_PICK_O, LOOK_ONCE),
anon_do_name_c_635.$of(NHKF_GETPOS_PICK_V, LOOK_VERBOSE)]);
  getpos$mMoOdDxX_def = $ta(Int32Array, 12, [NHKF_GETPOS_MON_NEXT, NHKF_GETPOS_MON_PREV, NHKF_GETPOS_OBJ_NEXT, NHKF_GETPOS_OBJ_PREV, NHKF_GETPOS_DOOR_NEXT, NHKF_GETPOS_DOOR_PREV, NHKF_GETPOS_UNEX_NEXT, NHKF_GETPOS_UNEX_PREV, NHKF_GETPOS_INTERESTING_NEXT, NHKF_GETPOS_INTERESTING_PREV, NHKF_GETPOS_VALID_NEXT, NHKF_GETPOS_VALID_PREV]);
  getpos$view_filters = [S("Not limiting targets"), S("Limiting targets to those in sight"), S("Limiting targets to those in same area")];
  bogusmon$bogon_codes = $cs("-_+|=", 6);
  rndmonnam$buf = new Int8Array(256);
  rndorcname$v = [S("a"),
S("ai"),
S("og"),
S("u")];
  rndorcname$snd = [S("gor"),
S("gris"),
S("un"),
S("bane"),
S("ruk"),
S("oth"),
S("ul"),
S("z"),
S("thos"),
S("akh"),
S("hai")];
}
