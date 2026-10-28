// @ts-nocheck
// NetHack 3.6.7 options.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { sanitize_name } from './bones.ts';
import { check_gold_symbol, clear_status_hilites, count_status_hilites, parse_status_hl1, reset_status_hilites, status_hilite_menu, status_initialize } from './botl.ts';
import { bind_key, bind_specialkey, reset_commands, txt2key } from './cmd.ts';
import { doredraw } from './display.ts';
import { assign_graphics, clear_symsetentry, def_char_to_monclass, def_char_to_objclass, get_othersym, init_ov_primary_symbols, init_ov_rogue_symbols, init_primary_symbols, init_rogue_symbols, init_symbols, switch_symbols, update_ov_primary_symset, update_ov_rogue_symset } from './drawing.ts';
import { on_level } from './dungeon.ts';
import { nh_terminate } from './end.ts';
import { assure_syscf_file, config_error_done, config_error_init, read_config_file, read_sym_file } from './files.ts';
import { copynchars, digit, eos, fuzzymatch, init_random, letter, lowc, mungspaces, strNsubst, str_end_is, strkitten, strncmpi, strstri, trimspaces, visctrl } from './hacklib.ts';
import { reassign, update_inventory } from './invent.ts';
import { name_to_mon } from './mondata.ts';
import { fruit_from_name, makeplural, makesingular } from './objnam.ts';
import { You_cant, config_error_add, impossible, pline, pline_The, raw_printf } from './pline.ts';
import { regex_compile, regex_error_desc, regex_free, regex_init, regex_match } from './posixregex.ts';
import { rn2, rnd } from './rnd.ts';
import { setrolefilter, str2align, str2gend, str2race, str2role } from './role.ts';
import { authorize_wizard_mode } from './unixmain.ts';
import { get_current_feature_ver, get_feature_notice_ver } from './version.ts';
import { vision_recalc } from './vision.ts';
import { choose_windows } from './windows.ts';
import { anon_options_c_1349, anon_options_c_1382, anon_options_c_1589, struct_Bool_Opt, struct_Comp_Opt, struct_action, struct_autopickup_exception, struct_fruit, struct_menu_cmd_t, struct_menucoloring, struct_other_opts, struct_paranoia_opts, struct_plinemsg_type, struct_symparse, struct_wc_Opt, union_any } from './structs.ts';
import { $cs, $peq, $rd, $sadd, $sarrOf, $sat, $shr64, $ta, $u64, $wr, G, P, S, atoi, atol, free, getenv, isspace, memcpy, memset, rn2_on_display_rng, sprintf, sscanf, strcat, strchr, strcmp, strcpy, strlen, strncat, strncmp, strncpy, strrchr, strstr } from './rt/index.ts';
import { ALIGN_BOTTOM, ALIGN_LEFT, ALIGN_RIGHT, ALIGN_TOP, AMULET_CLASS, AMULET_OF_REFLECTION, ARMOR_CLASS, ATR_BLINK, ATR_BOLD, ATR_DIM, ATR_INVERSE, ATR_NONE, ATR_ULINE, BAG_OF_HOLDING, BALL_CLASS, BOULDER, BUFSZ, CHAIN_CLASS, CLR_BLACK, CLR_BLUE, CLR_BRIGHT_BLUE, CLR_BRIGHT_CYAN, CLR_BRIGHT_GREEN, CLR_BRIGHT_MAGENTA, CLR_BROWN, CLR_CYAN, CLR_GRAY, CLR_GREEN, CLR_MAGENTA, CLR_MAX, CLR_ORANGE, CLR_RED, CLR_WHITE, CLR_YELLOW, COIN_CLASS, COLNO, CONFIG_ERROR_SECURE, CONFIG_SLOT, DISCLOSE_NO_WITHOUT_PROMPT, DISCLOSE_PROMPT_DEFAULT_NO, DISCLOSE_PROMPT_DEFAULT_SPECIAL, DISCLOSE_PROMPT_DEFAULT_YES, DISCLOSE_SPECIAL_WITHOUT_PROMPT, DISCLOSE_YES_WITHOUT_PROMPT, DISP_IN_GAME, EXIT_FAILURE, EXT_ENCUMBER, FALSE, FOOD_CLASS, GEM_CLASS, GFILTER_AREA, GFILTER_NONE, GFILTER_VIEW, GPCOORDS_COMFULL, GPCOORDS_COMPASS, GPCOORDS_MAP, GPCOORDS_NONE, GPCOORDS_SCREEN, HL_BLINK, HL_BOLD, HL_DIM, HL_INVERSE, HL_NONE, HL_ULINE, HVY_ENCUMBER, H_MAC, LOW_PM, LUCKSTONE, MAP_MODE_ASCII10x18, MAP_MODE_ASCII12x16, MAP_MODE_ASCII16x12, MAP_MODE_ASCII16x8, MAP_MODE_ASCII4x6, MAP_MODE_ASCII6x8, MAP_MODE_ASCII7x12, MAP_MODE_ASCII8x12, MAP_MODE_ASCII8x8, MAP_MODE_ASCII_FIT_TO_SCREEN, MAP_MODE_TILES, MAP_MODE_TILES_FIT_TO_SCREEN, MAP_OPTION, MAXDCHARS, MAXECHARS, MAXMCLASSES, MAXOCLASSES, MAXTCHARS, MAX_MENU_MAPPED_CMDS, MENU_COMBINATION, MENU_FIRST_PAGE, MENU_FULL, MENU_INVERT_ALL, MENU_INVERT_PAGE, MENU_LAST_PAGE, MENU_NEXT_PAGE, MENU_OPTION, MENU_PARTIAL, MENU_PREVIOUS_PAGE, MENU_SEARCH, MENU_SELECTED, MENU_SELECT_ALL, MENU_SELECT_PAGE, MENU_TRADITIONAL, MENU_UNSELECTED, MENU_UNSELECT_ALL, MENU_UNSELECT_PAGE, MESSAGE_OPTION, MOD_ENCUMBER, MSGTYP_NOREP, MSGTYP_NORMAL, MSGTYP_NOSHOW, MSGTYP_STOP, NHW_MENU, NHW_TEXT, NO_COLOR, NO_GLYPH, NUM_DISCLOSURE_OPTIONS, NUM_GRAPHICS, OPT_OTHER_APEXC, OPT_OTHER_MENUCOLOR, OPT_OTHER_MSGTYPE, OPT_OTHER_STATHILITE, OVERLOADED, PARANOID_BONES, PARANOID_BREAKWAND, PARANOID_CONFIRM, PARANOID_DIE, PARANOID_EATING, PARANOID_HIT, PARANOID_PRAY, PARANOID_QUIT, PARANOID_REMOVE, PARANOID_WERECHANGE, PICK_ANY, PICK_NONE, PICK_ONE, PILE_LIMIT_DFLT, PL_CSIZ, PL_FSIZ, PL_NSIZ, PL_PSIZ, POTION_CLASS, PRIMARY, REASSESS_ONLY, RING_CLASS, ROCK_CLASS, ROGUESET, ROLE_NONE, ROOM, ROWNO, RUN_CRAWL, RUN_LEAP, RUN_STEP, RUN_TPORT, SCROLL_CLASS, SET_IN_FILE, SET_IN_GAME, SET_IN_SYS, SET_IN_WIZGAME, SLIME_MOLD, SLT_ENCUMBER, SPBOOK_CLASS, STATUS_OPTION, SYM_BOULDER, SYM_CONTROL, SYM_OFF_O, SYM_OFF_X, S_darkroom, S_room, S_stone, TEXT_OPTION, TOOL_CLASS, TRUE, UNENCUMBERED, VENOM_SYM, VIA_DIALOG, VIA_PROMPTS, WAND_CLASS, WARNCOUNT, WC2_DARKGRAY, WC2_FULLSCREEN, WC2_GUICOLOR, WC2_HILITE_STATUS, WC2_HITPOINTBAR, WC2_PETATTR, WC2_SOFTKEYBOARD, WC2_STATUSLINES, WC2_TERM_SIZE, WC2_WINDOWBORDERS, WC2_WRAPTEXT, WC_ALIGN_MESSAGE, WC_ALIGN_STATUS, WC_ASCII_MAP, WC_COLOR, WC_EIGHT_BIT_IN, WC_FONTSIZ_MAP, WC_FONTSIZ_MENU, WC_FONTSIZ_MESSAGE, WC_FONTSIZ_STATUS, WC_FONTSIZ_TEXT, WC_FONT_MAP, WC_FONT_MENU, WC_FONT_MESSAGE, WC_FONT_STATUS, WC_FONT_TEXT, WC_HILITE_PET, WC_INVERSE, WC_MAP_MODE, WC_MOUSE_SUPPORT, WC_PLAYER_SELECTION, WC_POPUP_DIALOG, WC_PRELOAD_TILES, WC_SCROLL_AMOUNT, WC_SCROLL_MARGIN, WC_SPLASH_SCREEN, WC_TILED_MAP, WC_TILE_FILE, WC_TILE_HEIGHT, WC_TILE_WIDTH, WC_VARY_MSGCOUNT, WC_WINDOWCOLORS, WEAPON_CLASS, WINTYPELEN } from './consts.ts';

let empty_optstr: any;
let boolopt: any;
let compopt: any;
let need_redraw: number;
let def_inv_order: any;
let default_menu_cmd_info: any;
let mapped_menu_op: any;
let n_menu_mapped: number;
let initial: number;
let from_file: number;
let paranoia: any;
let colornames: any;
let attrnames: any;
let msgtype_names: any;
let menutype: any;
let burdentype: any;
let runmodes: any;
let sortltype: any;
let fmtstr_doset: any;
let fmtstr_doset_tab: any;
let n_currently_set: any;
let othropt: any;
let opt_intro: any;
let opt_epilog: any;
let wc_options: any;
let wc2_options: any;
let escapes$oct: any;
let escapes$dec: any;
let escapes$hex: any;
let msgtype_add$re_error: Ptr | null;
let test_regex_pattern$re_error: any;
let add_menu_coloring_parsed$re_error: any;
let parseoptions$gpcoords: any;
let parseoptions$valid_settings: any;
let doset$made_fmtstr: number;
let handle_add_list_remove$action_titles: any;
let special_handling$disclosure_names: any;
let special_handling$npchoices: any;
let get_compopt_value$none: any;
let get_compopt_value$randomrole: any;
let get_compopt_value$to_be_done: any;
let get_compopt_value$defopt: any;
let get_compopt_value$defbrief: any;
let get_compopt_value$mousemodes: any;
let get_compopt_value$numpadmodes: any;
let add_autopickup_exception$APE_regex_error: any;
let add_autopickup_exception$APE_syntax_error: any;
let next_opt$buf: Ptr | null;
let wc_set_window_colors$wnames: any;
let wc_set_window_colors$shortnames: any;
let wc_set_window_colors$fgp: any;
let wc_set_window_colors$bgp: any;

export function reglyph_darkroom(): void {
  let x = 0;
  let y = 0;
  for (x = 0; x < COLNO; x = x + 1 << 24 >> 24) {
    for (y = 0; y < ROWNO; y = y + 1 << 24 >> 24) {
      let lev = $sat(G.level.locations[x], y);
      if (!G.flags.dark_room || !G.iflags.wc_color || (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
        if (lev.glyph === S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))) {
          lev.glyph = lev.waslit | 0 ? S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        }
      } else {
        if (lev.glyph === S_room + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.seenv && lev.waslit | 0 && !($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
          lev.glyph = S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        } else if (lev.glyph === S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) && lev.typ === ROOM && lev.seenv && !($rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
          lev.glyph = S_darkroom + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        }
      }
    }
  }
  if (G.flags.dark_room && G.iflags.wc_color) {
    G.showsyms[S_darkroom] = G.showsyms[S_room];
  } else {
    G.showsyms[S_darkroom] = G.showsyms[S_stone];
  }
}

export function match_optname(user_string: Ptr | null, opt_name: Ptr | null, min_length: number, val_allowed: number): number {
  let len = strlen(user_string) | 0;
  if (val_allowed) {
    let p = strchr(user_string, 58);
    let q = strchr(user_string, 61);
    if (!p || q && q.o < p.o) {
      p = q;
    }
    if (p) {
      while (p.o > user_string.o && isspace($rd(p.add(-1)) & 0xff)) {
        p = p.add(-1);
      }
      len = p.o - user_string.o | 0;
    }
  }
  return (len >= min_length && !strncmpi(opt_name, user_string, len) ? 1 : 0) << 24 >> 24;
}

export function nh_getenv(ev: Ptr | null): Ptr | null {
  let getev = getenv(ev);
  if (getev && strlen(getev) <= $u64(BUFSZ / 2 | 0)) {
    return getev;
  } else {
    return null;
  }
}

export async function initoptions(): Promise<void> {
  await initoptions_init();
  assure_syscf_file();
  await config_error_init(TRUE, S("sysconf"), FALSE);
  if (!await read_config_file(S("sysconf"), SET_IN_SYS)) {
    if (await config_error_done() && !G.iflags.initoptions_noterminate) {
      await nh_terminate(EXIT_FAILURE);
    }
  }
  await config_error_done();
  await initoptions_finish();
}

export async function initoptions_init(): Promise<void> {
  let opts = null;
  let i = 0;
  reset_commands(TRUE);
  init_random(rn2);
  init_random(rn2_on_display_rng);
  G.iflags.opt_booldup = G.iflags.opt_compdup = null;
  for (i = 0; boolopt[i].name; ++i) {
    if (boolopt[i].addr) {
      $wr(boolopt[i].addr, 0, boolopt[i].initvalue);
    }
  }
  G.flags.end_own = FALSE;
  G.flags.end_top = 3;
  G.flags.end_around = 2;
  G.flags.paranoia_bits = PARANOID_PRAY;
  G.flags.pile_limit = PILE_LIMIT_DFLT;
  G.flags.runmode = RUN_LEAP;
  G.iflags.msg_history = 20;
  G.iflags.prevmsg_window = 115;
  G.iflags.menu_headings = ATR_INVERSE;
  G.iflags.getpos_coords = GPCOORDS_NONE;
  G.flags.initrole = G.flags.initrace = G.flags.initgend = G.flags.initalign = ROLE_NONE;
  init_ov_primary_symbols();
  init_ov_rogue_symbols();
  init_symbols();
  for (i = 0; i < WARNCOUNT; ++i) {
    G.warnsyms[i] = G.def_warnsyms[i].sym;
  }
  G.iflags.mines_prize_type = LUCKSTONE;
  G.iflags.soko_prize_type1 = BAG_OF_HOLDING;
  G.iflags.soko_prize_type2 = AMULET_OF_REFLECTION;
  memcpy(P(G.flags.inv_order), P(def_inv_order), 18);
  G.flags.pickup_types[0] = 0;
  G.flags.pickup_burden = MOD_ENCUMBER;
  G.flags.sortloot = 108;
  for (i = 0; i < NUM_DISCLOSURE_OPTIONS; ++i) {
    G.flags.end_disclose[i] = DISCLOSE_PROMPT_DEFAULT_NO;
  }
  await switch_symbols(FALSE);
  init_rogue_symbols();
  if ((opts = nh_getenv(S("TERM"))) && !strncmp(opts, S("AT"), 2)) {
    if (!G.symset[PRIMARY].explicitly) {
      await load_symset(S("IBMGraphics"), PRIMARY);
    }
    if (!G.symset[ROGUESET].explicitly) {
      await load_symset(S("RogueIBM"), ROGUESET);
    }
    await switch_symbols(TRUE);
    G.iflags.wc_color = TRUE;
  }
  if ((opts = nh_getenv(S("TERM"))) && !strncmpi(opts, S("vt"), 2) && G.tc_gbl_data.tc_AS && G.tc_gbl_data.tc_AE && strchr(G.tc_gbl_data.tc_AS, 14) && strchr(G.tc_gbl_data.tc_AE, 15)) {
    if (!G.symset[PRIMARY].explicitly) {
      await load_symset(S("DECGraphics"), PRIMARY);
    }
    await switch_symbols(TRUE);
  }
  G.flags.menu_style = MENU_FULL;
  G.iflags.wc_align_message = ALIGN_TOP;
  G.iflags.wc_align_status = ALIGN_BOTTOM;
  G.iflags.wc2_statuslines = 2;
  G.iflags.wc2_windowborders = 2;
  G.objects[SLIME_MOLD].oc_name_idx = SLIME_MOLD;
  nmcpy(P(G.pl_fruit), G.obj_descr[G.objects[260].oc_name_idx].oc_name, PL_FSIZ);
}

export async function initoptions_finish(): Promise<void> {
  let sym = 0;
  let opts = getenv(S("NETHACKOPTIONS"));
  if (!opts) {
    opts = getenv(S("HACKOPTIONS"));
  }
  if (opts) {
    if (opts.a[opts.o] === 47 || opts.a[opts.o] === 92 || opts.a[opts.o] === 64) {
      if (opts.a[opts.o] === 64) {
        opts = opts.add(1);
      }
      if (strlen(opts) < $u64(BUFSZ / 2 | 0)) {
        await config_error_init(TRUE, opts, CONFIG_ERROR_SECURE);
        await read_config_file(opts, SET_IN_FILE);
        await config_error_done();
      }
    } else {
      await config_error_init(TRUE, null, FALSE);
      await read_config_file(null, SET_IN_FILE);
      await config_error_done();
      await config_error_init(FALSE, S("NETHACKOPTIONS"), FALSE);
      await parseoptions(opts, TRUE, FALSE);
      await config_error_done();
    }
  } else {
    await config_error_init(TRUE, null, FALSE);
    await read_config_file(null, SET_IN_FILE);
    await config_error_done();
  }
  await fruitadd(P(G.pl_fruit), null);
  G.obj_descr[SLIME_MOLD].oc_name = S("fruit");
  sym = get_othersym(SYM_BOULDER, (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? ROGUESET : PRIMARY);
  if (sym) {
    G.showsyms[SYM_BOULDER + SYM_OFF_X] = sym;
  }
  reglyph_darkroom();
  if (!(G.windowprocs.name && !strncmpi(S("safe-startup"), G.windowprocs.name, strlen(S("safe-startup")) | 0))) {
    if (G.iflags.hilite_delta && !wc2_supported(S("statushilites"))) {
      raw_printf(S("Status highlighting not supported for %s interface."), G.windowprocs.name);
      G.iflags.hilite_delta = 0;
    }
  }
  return;
}

function nmcpy(dest: Ptr | null, src: Ptr | null, maxlen: number): void {
  let $t1: any, $t2: any;
  let count = 0;
  for (count = 1; count < maxlen; ++count) {
    if (src.a[src.o] === 44 || src.a[src.o] === 0) {
      break;
    }
    $wr(($t1 = dest, dest = $t1.add(1), $t1), 0, $rd(($t2 = src, src = $t2.add(1), $t2)));
  }
  dest.a[dest.o] = 0;
}

function escapes(cp: Ptr | null, tp: Ptr | null): void {
  let $t1: any, $t2: any;
  let dp = null;
  let cval = 0;
  let meta = 0;
  let dcount = 0;
  while (cp.a[cp.o]) {
    meta = cp.a[cp.o] === 92 && (cp.a[cp.o + 1] === 109 || cp.a[cp.o + 1] === 77) && cp.a[cp.o + 2] ? 1 : 0;
    if (meta) {
      cp = cp.add(2);
    }
    cval = dcount = 0;
    if (cp.a[cp.o] !== 92 && cp.a[cp.o] !== 94 || !cp.a[cp.o + 1]) {
      cval = $rd(($t1 = cp, cp = $t1.add(1), $t1));
    } else if (cp.a[cp.o] === 94) {
      cval = $rd((cp = cp.add(1))) & 31;
      cp = cp.add(1);
    } else if (strchr(P(escapes$dec), cp.a[cp.o + 1])) {
      cp = cp.add(1);
      do {
        cval = cval * 10 + (cp.a[cp.o] - 48);
      } while ($rd((cp = cp.add(1))) && strchr(P(escapes$dec), cp.a[cp.o]) && ++dcount < 3);
    } else if ((cp.a[cp.o + 1] === 111 || cp.a[cp.o + 1] === 79) && cp.a[cp.o + 2] && strchr(P(escapes$oct), cp.a[cp.o + 2])) {
      cp = cp.add(2);
      do {
        cval = cval * 8 + (cp.a[cp.o] - 48);
      } while ($rd((cp = cp.add(1))) && strchr(P(escapes$oct), cp.a[cp.o]) && ++dcount < 3);
    } else if ((cp.a[cp.o + 1] === 120 || cp.a[cp.o + 1] === 88) && cp.a[cp.o + 2] && !!(dp = strchr(P(escapes$hex), cp.a[cp.o + 2]))) {
      cp = cp.add(2);
      do {
        cval = cval * 16 + ((dp.o - P(escapes$hex).o | 0) / 2 | 0);
      } while ($rd((cp = cp.add(1))) && !!(dp = strchr(P(escapes$hex), cp.a[cp.o])) && ++dcount < 2);
    } else {
      switch ($rd((cp = cp.add(1)))) {
      case 92:
        cval = 92;
        break;
      case 110:
        cval = 10;
        break;
      case 116:
        cval = 9;
        break;
      case 98:
        cval = 8;
        break;
      case 114:
        cval = 13;
        break;
      default:
        cval = cp.a[cp.o];
      }
      cp = cp.add(1);
    }
    if (meta) {
      cval |= 128;
    }
    $wr(($t2 = tp, tp = $t2.add(1), $t2), 0, cval << 24 >> 24);
  }
  tp.a[tp.o] = 0;
}

async function rejectoption(optname: Ptr | null): Promise<void> {
  await pline(S("%s can be set only from NETHACKOPTIONS or %s."), optname, P(G.configfile));
}

async function string_for_opt(opts: Ptr | null, val_optional: number): Promise<Ptr | null> {
  let colon = null;
  let equals = null;
  colon = strchr(opts, 58);
  equals = strchr(opts, 61);
  if (!colon || equals && equals.o < colon.o) {
    colon = equals;
  }
  if (!colon || !$rd((colon = colon.add(1)))) {
    if (!val_optional) {
      await config_error_add(S("Missing parameter for '%s'"), opts);
    }
    return P(empty_optstr);
  }
  return colon;
}

async function string_for_env_opt(optname: Ptr | null, opts: Ptr | null, val_optional: number): Promise<Ptr | null> {
  if (!initial) {
    await rejectoption(optname);
    return P(empty_optstr);
  }
  return await string_for_opt(opts, val_optional);
}

async function bad_negation(optname: Ptr | null, with_parameter: number): Promise<void> {
  await pline_The(S("%s option may not %sbe negated."), optname, with_parameter ? S("both have a value and ") : S(""));
}

async function change_inv_order(op: Ptr | null): Promise<number> {
  let oc_sym = 0;
  let num = 0;
  let sp = null;
  let buf = new Int8Array(128);
  let retval = 1;
  num = 0;
  if (!strchr(op, 36)) {
    buf[num++] = COIN_CLASS;
  }
  for (sp = op; sp.a[sp.o]; sp = sp.add(1)) {
    let fail = FALSE;
    oc_sym = def_char_to_objclass(sp.a[sp.o]);
    if (oc_sym === MAXOCLASSES) {
      await config_error_add(S("Not an object class '%c'"), sp.a[sp.o]);
      retval = 0;
      fail = TRUE;
    } else if (!strchr(P(G.flags.inv_order), oc_sym)) {
      await config_error_add(S("Object class '%c' not allowed"), sp.a[sp.o]);
      retval = 0;
      fail = TRUE;
    } else if (strchr(sp.add(1), sp.a[sp.o])) {
      await config_error_add(S("Duplicate object class '%c'"), sp.a[sp.o]);
      retval = 0;
      fail = TRUE;
    }
    if (!fail) {
      buf[num++] = oc_sym << 24 >> 24;
    }
  }
  buf[num] = 0;
  for (sp = P(G.flags.inv_order); sp.a[sp.o]; sp = sp.add(1)) {
    if (!strchr(P(buf), sp.a[sp.o])) {
      strkitten(P(buf, num++), sp.a[sp.o]);
    }
  }
  buf[MAXOCLASSES - 1] = 0;
  strcpy(P(G.flags.inv_order), P(buf));
  return retval;
}

async function warning_opts(opts: Ptr | null, optype: Ptr | null): Promise<number> {
  let translate = new Uint8Array(6);
  let length = 0;
  let i = 0;
  if ($peq(opts = await string_for_env_opt(optype, opts, FALSE), P(empty_optstr))) {
    return FALSE;
  }
  escapes(opts, opts);
  length = strlen(opts) | 0;
  for (i = 0; i < WARNCOUNT; ++i) {
    translate[i] = (i >= length ? 0 : opts.a[opts.o + i] ? opts.a[opts.o + i] & 0xff : G.def_warnsyms[i].sym) & 0xff;
  }
  assign_warnings(P(translate));
  return TRUE;
}

export function assign_warnings(graph_chars: Ptr | null): void {
  let i = 0;
  for (i = 0; i < WARNCOUNT; ++i) {
    if (graph_chars.a[graph_chars.o + i]) {
      G.warnsyms[i] = graph_chars.a[graph_chars.o + i];
    }
  }
}

async function feature_alert_opts(op: Ptr | null, optn: Ptr | null): Promise<number> {
  let buf = new Int8Array(256);
  let fnv = get_feature_notice_ver(op);
  if (fnv === 0) {
    return 0;
  }
  if (fnv > get_current_feature_ver()) {
    if (!initial) {
      await You_cant(S("disable new feature alerts for future versions."));
    } else {
      await config_error_add(S("%s=%s Invalid reference to a future version ignored"), optn, op);
    }
    return 0;
  }
  G.flags.suppress_alert = fnv;
  if (!initial) {
    sprintf(P(buf), S("%lu.%lu.%lu"), $shr64(G.flags.suppress_alert, 24), $shr64((16711680 & G.flags.suppress_alert) >>> 0, 16), $shr64((65280 & G.flags.suppress_alert) >>> 0, 8));
    await pline(S("Feature change alerts disabled for NetHack %s features and prior."), P(buf));
  }
  return 1;
}

export async function set_duplicate_opt_detection(on_or_off: number): Promise<void> {
  let $t1: any, $t2: any;
  let k = 0;
  let optptr = null;
  if (on_or_off !== 0) {
    if (G.iflags.opt_booldup) {
      await impossible(S("iflags.opt_booldup already on (memory leak)"));
    }
    G.iflags.opt_booldup = P(new Int32Array(($u64(Math.trunc(2088 / 24) | 0) * 4 >>> 0) / 4));
    optptr = G.iflags.opt_booldup;
    for (k = 0; k < (Math.trunc(2088 / 24) | 0); ++k) {
      $wr(($t1 = optptr, optptr = $t1.add(1), $t1), 0, 0);
    }
    if (G.iflags.opt_compdup) {
      await impossible(S("iflags.opt_compdup already on (memory leak)"));
    }
    G.iflags.opt_compdup = P(new Int32Array(($u64(Math.trunc(1920 / 24) | 0) * 4 >>> 0) / 4));
    optptr = G.iflags.opt_compdup;
    for (k = 0; k < (Math.trunc(1920 / 24) | 0); ++k) {
      $wr(($t2 = optptr, optptr = $t2.add(1), $t2), 0, 0);
    }
  } else {
    if (G.iflags.opt_booldup) {
      free(G.iflags.opt_booldup);
    }
    G.iflags.opt_booldup = null;
    if (G.iflags.opt_compdup) {
      free(G.iflags.opt_compdup);
    }
    G.iflags.opt_compdup = null;
  }
}

function duplicate_opt_detection(opts: Ptr | null, iscompound: number): number {
  let i = 0;
  let optptr = null;
  if (!iscompound && G.iflags.opt_booldup && initial && from_file) {
    for (i = 0; boolopt[i].name; ++i) {
      if (match_optname(opts, boolopt[i].name, 3, FALSE)) {
        optptr = G.iflags.opt_booldup.add(i);
        optptr.a[optptr.o] += 1;
        if (optptr.a[optptr.o] > 1) {
          return TRUE;
        } else {
          return FALSE;
        }
      }
    }
  } else if (iscompound && G.iflags.opt_compdup && initial && from_file) {
    for (i = 0; compopt[i].name; ++i) {
      if (match_optname(opts, compopt[i].name, strlen(compopt[i].name) | 0, TRUE)) {
        optptr = G.iflags.opt_compdup.add(i);
        optptr.a[optptr.o] += 1;
        if (optptr.a[optptr.o] > 1) {
          return TRUE;
        } else {
          return FALSE;
        }
      }
    }
  }
  return FALSE;
}

async function complain_about_duplicate(opts: Ptr | null, iscompound: number): Promise<void> {
  await config_error_add(S("%s option specified multiple times: %s"), iscompound ? S("compound") : S("boolean"), opts);
  return;
}

export function clr2colorname(clr: number): Ptr | null {
  let i = 0;
  for (i = 0; i < (Math.trunc(432 / 16) | 0); ++i) {
    if (colornames[i].name && colornames[i].color === clr) {
      return colornames[i].name;
    }
  }
  return null;
}

export async function match_str2clr(str: Ptr | null): Promise<number> {
  let i = 0;
  let c = CLR_MAX;
  for (i = 0; i < (Math.trunc(432 / 16) | 0); ++i) {
    if (colornames[i].name && fuzzymatch(str, colornames[i].name, S(" -_"), TRUE)) {
      c = colornames[i].color;
      break;
    }
  }
  if (i === (Math.trunc(432 / 16) | 0) && digit(str.a[str.o])) {
    c = atoi(str);
  }
  if (c < 0 || c >= CLR_MAX) {
    await config_error_add(S("Unknown color '%.60s'"), str);
    c = CLR_MAX;
  }
  return c;
}

function attr2attrname(attr: number): Ptr | null {
  let i = 0;
  for (i = 0; i < (Math.trunc(160 / 16) | 0); ++i) {
    if (attrnames[i].attr === attr) {
      return attrnames[i].name;
    }
  }
  return null;
}

export async function match_str2attr(str: Ptr | null, complain: number): Promise<number> {
  let i = 0;
  let a = -1;
  for (i = 0; i < (Math.trunc(160 / 16) | 0); ++i) {
    if (attrnames[i].name && fuzzymatch(str, attrnames[i].name, S(" -_"), TRUE)) {
      a = attrnames[i].attr;
      break;
    }
  }
  if (a === -1 && complain) {
    await config_error_add(S("Unknown text attribute '%.50s'"), str);
  }
  return a;
}

export async function query_color(prompt: Ptr | null): Promise<number> {
  let tmpwin = 0;
  let any = new union_any();
  let i = 0;
  let pick_cnt = 0;
  const picks = [null];
  picks[0] = null;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 0; i < (Math.trunc(432 / 16) | 0); ++i) {
    if (!colornames[i].name) {
      break;
    }
    any.a_int = i + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, colornames[i].name, colornames[i].color === NO_COLOR ? MENU_SELECTED : MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, prompt && prompt.a[prompt.o] ? prompt : S("Pick a color"));
  pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (pick_cnt > 0) {
    i = colornames[picks[0].item.a_int - 1].color;
    if (pick_cnt === 2 && i === NO_COLOR) {
      i = colornames[$sadd(picks[0], 1).item.a_int - 1].color;
    }
    free(picks[0]);
    return i;
  } else if (pick_cnt === 0) {
    return NO_COLOR;
  }
  return -1;
}

export async function query_attr(prompt: Ptr | null): Promise<number> {
  let tmpwin = 0;
  let any = new union_any();
  let i = 0;
  let pick_cnt = 0;
  const picks = [null];
  picks[0] = null;
  let allow_many = (prompt && !strncmpi(prompt, S("Choose"), 6) ? 1 : 0) << 24 >> 24;
  let default_attr = ATR_NONE;
  if (prompt && strstri(prompt, S("menu headings"))) {
    default_attr = G.iflags.menu_headings;
  }
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 0; i < (Math.trunc(160 / 16) | 0); ++i) {
    if (!attrnames[i].name) {
      break;
    }
    any.a_int = i + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, attrnames[i].attr, attrnames[i].name, attrnames[i].attr === default_attr ? MENU_SELECTED : MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, prompt && prompt.a[prompt.o] ? prompt : S("Pick an attribute"));
  pick_cnt = await G.windowprocs.win_select_menu(tmpwin, allow_many ? PICK_ANY : PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (pick_cnt > 0) {
    let j = 0;
    let k = 0;
    if (allow_many) {
      for (i = 0; i < pick_cnt; ++i) {
        j = $sadd(picks[0], i).item.a_int - 1;
        if (attrnames[j].attr !== ATR_NONE || pick_cnt === 1) {
          switch (attrnames[j].attr) {
          case 2:
            k |= HL_DIM;
            break;
          case 5:
            k |= HL_BLINK;
            break;
          case 4:
            k |= HL_ULINE;
            break;
          case 7:
            k |= HL_INVERSE;
            break;
          case 1:
            k |= HL_BOLD;
            break;
          case 0:
            k = HL_NONE;
            break;
          }
        }
      }
    } else {
      j = picks[0].item.a_int - 1;
      if (pick_cnt === 2 && attrnames[j].attr === default_attr) {
        j = $sadd(picks[0], 1).item.a_int - 1;
      }
      k = attrnames[j].attr;
    }
    free(picks[0]);
    return k;
  } else if (pick_cnt === 0 && !allow_many) {
    return default_attr;
  }
  return -1;
}

function msgtype2name(typ: number): Ptr | null {
  let i = 0;
  for (i = 0; i < (Math.trunc(144 / 24) | 0); ++i) {
    if (msgtype_names[i].descr && msgtype_names[i].msgtyp === typ) {
      return msgtype_names[i].name;
    }
  }
  return null;
}

async function query_msgtype(): Promise<number> {
  let tmpwin = 0;
  let any = new union_any();
  let i = 0;
  let pick_cnt = 0;
  const picks = [null];
  picks[0] = null;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 0; i < (Math.trunc(144 / 24) | 0); ++i) {
    if (msgtype_names[i].descr) {
      any.a_int = msgtype_names[i].msgtyp + 1;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, msgtype_names[i].descr, MENU_UNSELECTED);
    }
  }
  await G.windowprocs.win_end_menu(tmpwin, S("How to show the message"));
  pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (pick_cnt > 0) {
    i = picks[0].item.a_int - 1;
    free(picks[0]);
    return i;
  }
  return -1;
}

async function msgtype_add(typ: number, pattern: Ptr | null): Promise<number> {
  let tmp = new struct_plinemsg_type();
  tmp.msgtype = typ << 24 >> 24;
  tmp.regex = await regex_init();
  if (!regex_compile(pattern, tmp.regex)) {
    await config_error_add(S("%s: %s"), msgtype_add$re_error, regex_error_desc(tmp.regex));
    regex_free(tmp.regex);
    free(tmp);
    return FALSE;
  }
  tmp.pattern = await dupstr(pattern);
  tmp.next = G.plinemsg_types;
  G.plinemsg_types = tmp;
  return TRUE;
}

export function msgtype_free(): void {
  let tmp = null;
  let tmp2 = null;
  for (tmp = G.plinemsg_types; tmp; tmp = tmp2) {
    tmp2 = tmp.next;
    free(tmp.pattern);
    regex_free(tmp.regex);
    free(tmp);
  }
  G.plinemsg_types = null;
}

function free_one_msgtype(idx: number): void {
  let tmp = G.plinemsg_types;
  let prev = null;
  while (tmp) {
    if (idx === 0) {
      let next = tmp.next;
      regex_free(tmp.regex);
      free(tmp.pattern);
      free(tmp);
      if (prev) {
        prev.next = next;
      } else {
        G.plinemsg_types = next;
      }
      return;
    }
    --idx;
    prev = tmp;
    tmp = tmp.next;
  }
}

export function msgtype_type(msg: Ptr | null, norepeat: number): number {
  let tmp = G.plinemsg_types;
  while (tmp) {
    if (regex_match(msg, tmp.regex)) {
      return tmp.msgtype;
    }
    tmp = tmp.next;
  }
  return norepeat ? MSGTYP_NOREP : MSGTYP_NORMAL;
}

export function hide_unhide_msgtypes(hide: number, hide_mask: number): void {
  let tmp = null;
  let mt = 0;
  for (tmp = G.plinemsg_types; tmp; tmp = tmp.next) {
    mt = tmp.msgtype;
    if (!hide) {
      mt = -mt;
    }
    if (mt > 0 && 1 << mt & hide_mask) {
      tmp.msgtype = -tmp.msgtype << 24 >> 24;
    }
  }
}

function msgtype_count(): number {
  let c = 0;
  let tmp = G.plinemsg_types;
  while (tmp) {
    ++c;
    tmp = tmp.next;
  }
  return c;
}

export async function msgtype_parse_add(str: Ptr | null): Promise<number> {
  let pattern = new Int8Array(256);
  let msgtype = new Int8Array(11);
  if (sscanf(str, S("%10s \"%255[^\"]\""), P(msgtype), P(pattern)) === 2) {
    let typ = -1;
    let i = 0;
    for (i = 0; i < (Math.trunc(144 / 24) | 0); ++i) {
      if (!strncmpi(msgtype_names[i].name, P(msgtype), strlen(P(msgtype)) | 0)) {
        typ = msgtype_names[i].msgtyp;
        break;
      }
    }
    if (typ !== -1) {
      return await msgtype_add(typ, P(pattern));
    } else {
      await config_error_add(S("Unknown message type '%s'"), P(msgtype));
    }
  } else {
    await config_error_add(S("Malformed MSGTYPE"));
  }
  return FALSE;
}

async function test_regex_pattern(str: Ptr | null, errmsg: Ptr | null): Promise<number> {
  let match = null;
  let retval = TRUE;
  if (!str) {
    return FALSE;
  }
  match = await regex_init();
  if (!match) {
    await config_error_add(S("NHregex error"));
    return FALSE;
  }
  if (!regex_compile(str, match)) {
    await config_error_add(S("%s: %s"), errmsg ? errmsg : P(test_regex_pattern$re_error), regex_error_desc(match));
    retval = FALSE;
  }
  regex_free(match);
  return retval;
}

async function add_menu_coloring_parsed(str: Ptr | null, c: number, a: number): Promise<number> {
  let tmp = null;
  if (!str) {
    return FALSE;
  }
  tmp = new struct_menucoloring();
  tmp.match = await regex_init();
  if (!regex_compile(str, tmp.match)) {
    await config_error_add(S("%s: %s"), P(add_menu_coloring_parsed$re_error), regex_error_desc(tmp.match));
    regex_free(tmp.match);
    free(tmp);
    return FALSE;
  } else {
    tmp.next = G.menu_colorings;
    tmp.origstr = await dupstr(str);
    tmp.color = c;
    tmp.attr = a;
    G.menu_colorings = tmp;
    return TRUE;
  }
}

export async function add_menu_coloring(tmpstr: Ptr | null): Promise<number> {
  let c = NO_COLOR;
  let a = ATR_NONE;
  let tmps = null;
  let cs = null;
  let amp = null;
  let str = new Int8Array(256);
  strncpy(P(str), tmpstr, 256 - 1);
  str[256 - 1] = 0;
  if (!(cs = strchr(P(str), 61))) {
    await config_error_add(S("Malformed MENUCOLOR"));
    return FALSE;
  }
  tmps = cs.add(1);
  mungspaces(tmps);
  if (!!(amp = strchr(tmps, 38))) {
    amp.a[amp.o] = 0;
  }
  c = await match_str2clr(tmps);
  if (c >= CLR_MAX) {
    return FALSE;
  }
  if (amp) {
    tmps = amp.add(1);
    a = await match_str2attr(tmps, TRUE);
    if (a === -1) {
      return FALSE;
    }
  }
  cs.a[cs.o] = 0;
  tmps = P(str);
  if (tmps.a[tmps.o] === 34 || tmps.a[tmps.o] === 39) {
    cs = cs.add(-1);
    while (isspace(cs.a[cs.o] & 0xff)) {
      cs = cs.add(-1);
    }
    if (cs.a[cs.o] === tmps.a[tmps.o]) {
      cs.a[cs.o] = 0;
      tmps = tmps.add(1);
    }
  }
  return await add_menu_coloring_parsed(tmps, c, a);
}

export function get_menu_coloring(str: Ptr | null, color: Ptr | null, attr: Ptr | null): number {
  let tmpmc = null;
  if (G.iflags.use_menu_color) {
    for (tmpmc = G.menu_colorings; tmpmc; tmpmc = tmpmc.next) {
      if (regex_match(str, tmpmc.match)) {
        color.a[color.o] = tmpmc.color;
        attr.a[attr.o] = tmpmc.attr;
        return TRUE;
      }
    }
  }
  return FALSE;
}

export function free_menu_coloring(): void {
  let tmp = null;
  let tmp2 = null;
  for (tmp = G.menu_colorings; tmp; tmp = tmp2) {
    tmp2 = tmp.next;
    regex_free(tmp.match);
    free(tmp.origstr);
    free(tmp);
  }
}

function free_one_menu_coloring(idx: number): void {
  let tmp = G.menu_colorings;
  let prev = null;
  while (tmp) {
    if (idx === 0) {
      let next = tmp.next;
      regex_free(tmp.match);
      free(tmp.origstr);
      free(tmp);
      if (prev) {
        prev.next = next;
      } else {
        G.menu_colorings = next;
      }
      return;
    }
    --idx;
    prev = tmp;
    tmp = tmp.next;
  }
}

function count_menucolors(): number {
  let tmp = null;
  let count = 0;
  for (tmp = G.menu_colorings; tmp; tmp = tmp.next) {
    ++count;
  }
  return count;
}

async function parse_role_opts(negated: number, fullname: Ptr | null, opts: Ptr | null, opp: Ptr | null): Promise<number> {
  let op = opp.a[opp.o];
  if (negated) {
    await bad_negation(fullname, FALSE);
  } else if (!$peq(op = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
    let val_negated = FALSE;
    while (op.a[op.o] === 33 || !strncmpi(op, S("no"), 2)) {
      if (op.a[op.o] === 33) {
        op = op.add(1);
      } else {
        op = op.add(2);
      }
      val_negated = (!val_negated ? 1 : 0) << 24 >> 24;
    }
    if (val_negated) {
      if (!setrolefilter(op)) {
        await config_error_add(S("Unknown negated parameter '%s'"), op);
        return FALSE;
      }
    } else {
      if (duplicate_opt_detection(opts, 1)) {
        await complain_about_duplicate(opts, 1);
      }
      opp.a[opp.o] = op;
      return TRUE;
    }
  }
  return FALSE;
}

export async function illegal_menu_cmd_key(c: number): Promise<number> {
  if (c === 0 || c === 13 || c === 10 || c === 27 || c === 32 || digit(c) || letter(c) && c !== 64) {
    await config_error_add(S("Reserved menu command key '%s'"), visctrl(c));
    return TRUE;
  } else {
    let j = 0;
    for (j = 1; j < MAXOCLASSES; ++j) {
      if (c === G.def_oc_syms[j].sym) {
        await config_error_add(S("Menu command key '%s' is an object class"), visctrl(c));
        return TRUE;
      }
    }
  }
  return FALSE;
}

export async function parseoptions(opts: Ptr | null, tinitial: number, tfrom_file: number): Promise<number> {
  let $t1: any;
  let $g = 0;
  let op = [null];
  let num = 0;
  let negated = 0;
  let duplicate = 0;
  let i = 0;
  let fullname = null;
  let retval = 0;
  let forig = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      retval = TRUE;
      initial = tinitial;
      from_file = tfrom_file;
      if (!!(op[0] = strchr(opts, 44))) {
        $wr(($t1 = op[0], op[0] = $t1.add(1), $t1), 0, 0);
        if (!await parseoptions(op[0], initial, from_file)) {
          retval = FALSE;
        }
      }
      if (strlen(opts) > $u64(BUFSZ / 2 | 0)) {
        await config_error_add(S("Option too long, max length is %i characters"), BUFSZ / 2 | 0);
        return FALSE;
      }
      while (isspace(opts.a[opts.o] & 0xff)) {
        opts = opts.add(1);
      }
      op[0] = eos(opts);
      while ((op[0] = op[0].add(-1)).o >= opts.o && isspace(op[0].a[op[0].o] & 0xff)) {
        op[0].a[op[0].o] = 0;
      }
      if (!opts.a[opts.o]) {
        await config_error_add(S("Empty statement"));
        return FALSE;
      }
      negated = FALSE;
      while (opts.a[opts.o] === 33 || !strncmpi(opts, S("no"), 2)) {
        if (opts.a[opts.o] === 33) {
          opts = opts.add(1);
        } else {
          opts = opts.add(2);
        }
        negated = (!negated ? 1 : 0) << 24 >> 24;
      }
      if (match_optname(opts, S("colour"), 5, FALSE)) {
        strcpy(opts, S("color"));
      }
      if (match_optname(opts, S("female"), 3, FALSE)) {
        if (duplicate_opt_detection(opts, 0)) {
          await complain_about_duplicate(opts, 0);
        }
        if (!initial && G.flags.female === negated) {
          await config_error_add(S("That is not anatomically possible."));
          return FALSE;
        } else {
          G.flags.initgend = G.flags.female = (!negated ? 1 : 0) << 24 >> 24;
        }
        return retval;
      }
      if (match_optname(opts, S("male"), 4, FALSE)) {
        if (duplicate_opt_detection(opts, 0)) {
          await complain_about_duplicate(opts, 0);
        }
        if (!initial && G.flags.female !== negated) {
          await config_error_add(S("That is not anatomically possible."));
          return FALSE;
        } else {
          G.flags.initgend = G.flags.female = negated;
        }
        return retval;
      }
      fullname = S("align");
      if (match_optname(opts, fullname, 6 - 1, TRUE)) {
        if (await parse_role_opts(negated, fullname, opts, P(op, 0))) {
          if ((G.flags.initalign = str2align(op[0])) === ROLE_NONE) {
            await config_error_add(S("Unknown %s '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("role");
      if (match_optname(opts, fullname, 4, TRUE) || match_optname(opts, fullname = S("character"), 4, TRUE)) {
        if (await parse_role_opts(negated, fullname, opts, P(op, 0))) {
          if ((G.flags.initrole = str2role(op[0])) === ROLE_NONE) {
            await config_error_add(S("Unknown %s '%s'"), fullname, op[0]);
            return FALSE;
          } else {
            nmcpy(P(G.pl_character), op[0], PL_NSIZ);
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("race");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (await parse_role_opts(negated, fullname, opts, P(op, 0))) {
          if ((G.flags.initrace = str2race(op[0])) === ROLE_NONE) {
            await config_error_add(S("Unknown %s '%s'"), fullname, op[0]);
            return FALSE;
          } else {
            G.pl_race = op[0].a[op[0].o];
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("gender");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (await parse_role_opts(negated, fullname, opts, P(op, 0))) {
          if ((G.flags.initgend = str2gend(op[0])) === ROLE_NONE) {
            await config_error_add(S("Unknown %s '%s'"), fullname, op[0]);
            return FALSE;
          } else {
            G.flags.female = G.flags.initgend << 24 >> 24;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      duplicate = duplicate_opt_detection(opts, 1);
      fullname = S("pettype");
      if (match_optname(opts, fullname, 3, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (!$peq(op[0] = await string_for_env_opt(fullname, opts, negated), P(empty_optstr))) {
          if (negated) {
            await bad_negation(fullname, TRUE);
            return FALSE;
          } else {
            switch (lowc(op[0].a[op[0].o])) {
            case 100:
              G.preferred_pet = 100;
              break;
            case 99:
            case 102:
              G.preferred_pet = 99;
              break;
            case 104:
            case 113:
              G.preferred_pet = 104;
              break;
            case 110:
              G.preferred_pet = 110;
              break;
            case 42:
              G.preferred_pet = 0;
              break;
            default:
              await config_error_add(S("Unrecognized pet type '%s'."), op[0]);
              return FALSE;
              break;
            }
          }
        } else if (negated) {
          G.preferred_pet = 110;
        }
        return retval;
      }
      fullname = S("catname");
      if (match_optname(opts, fullname, 3, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          nmcpy(P(G.catname), op[0], PL_PSIZ);
        } else {
          return FALSE;
        }
        sanitize_name(P(G.catname));
        return retval;
      }
      fullname = S("dogname");
      if (match_optname(opts, fullname, 3, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          nmcpy(P(G.dogname), op[0], PL_PSIZ);
        } else {
          return FALSE;
        }
        sanitize_name(P(G.dogname));
        return retval;
      }
      fullname = S("horsename");
      if (match_optname(opts, fullname, 5, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          nmcpy(P(G.horsename), op[0], PL_PSIZ);
        } else {
          return FALSE;
        }
        sanitize_name(P(G.horsename));
        return retval;
      }
      fullname = S("mouse_support");
      if (match_optname(opts, fullname, 13, TRUE)) {
        let compat = (strlen(opts) <= 13 ? 1 : 0) << 24 >> 24;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, compat || !initial ? 1 : 0);
        if ($peq(op[0], P(empty_optstr))) {
          if (compat || negated || initial) {
            G.iflags.wc_mouse_support = !negated ? 1 : 0;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        } else {
          let mode = atoi(op[0]);
          if (mode < 0 || mode > 2 || mode === 0 && op[0].a[op[0].o] !== 48) {
            await config_error_add(S("Illegal %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          } else {
            G.iflags.wc_mouse_support = mode;
          }
        }
        return retval;
      }
      fullname = S("number_pad");
      if (match_optname(opts, fullname, 10, TRUE)) {
        let compat = (strlen(opts) <= 10 ? 1 : 0) << 24 >> 24;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, compat || !initial ? 1 : 0);
        if ($peq(op[0], P(empty_optstr))) {
          if (compat || negated || initial) {
            G.iflags.num_pad = (!negated ? 1 : 0) << 24 >> 24;
            G.iflags.num_pad_mode = 0;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        } else {
          let mode = atoi(op[0]);
          if (mode < -1 || mode > 4 || mode === 0 && op[0].a[op[0].o] !== 48) {
            await config_error_add(S("Illegal %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          } else if (mode <= 0) {
            G.iflags.num_pad = FALSE;
            G.iflags.num_pad_mode = (mode < 0 ? 1 : 0) & 0xff;
          } else {
            G.iflags.num_pad = TRUE;
            G.iflags.num_pad_mode = 0;
            if (mode === 2 || mode === 4) {
              G.iflags.num_pad_mode = (G.iflags.num_pad_mode | 1) & 0xff;
            }
            if (mode === 3 || mode === 4) {
              G.iflags.num_pad_mode = (G.iflags.num_pad_mode | 2) & 0xff;
            }
          }
        }
        reset_commands(FALSE);
        G.windowprocs.win_number_pad(G.iflags.num_pad ? 1 : 0);
        return retval;
      }
      fullname = S("roguesymset");
      if (match_optname(opts, fullname, 7, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          G.symset[ROGUESET].name = await dupstr(op[0]);
          if (!await read_sym_file(ROGUESET)) {
            clear_symsetentry(ROGUESET, TRUE);
            await config_error_add(S("Unable to load symbol set \"%s\" from \"%s\""), op[0], S("symbols"));
            return FALSE;
          } else {
            if (!initial && ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
              assign_graphics(ROGUESET);
            }
            need_redraw = TRUE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("symset");
      if (match_optname(opts, fullname, 6, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          G.symset[PRIMARY].name = await dupstr(op[0]);
          if (!await read_sym_file(PRIMARY)) {
            clear_symsetentry(PRIMARY, TRUE);
            await config_error_add(S("Unable to load symbol set \"%s\" from \"%s\""), op[0], S("symbols"));
            return FALSE;
          } else {
            await switch_symbols(!!G.symset[PRIMARY].name ? 1 : 0);
            need_redraw = TRUE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("runmode");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          G.flags.runmode = RUN_TPORT;
        } else if (!$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          if (!strncmpi(op[0], S("teleport"), strlen(op[0]) | 0)) {
            G.flags.runmode = RUN_TPORT;
          } else if (!strncmpi(op[0], S("run"), strlen(op[0]) | 0)) {
            G.flags.runmode = RUN_LEAP;
          } else if (!strncmpi(op[0], S("walk"), strlen(op[0]) | 0)) {
            G.flags.runmode = RUN_STEP;
          } else if (!strncmpi(op[0], S("crawl"), strlen(op[0]) | 0)) {
            G.flags.runmode = RUN_CRAWL;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("menucolor");
      if (match_optname(opts, fullname, 9, TRUE)) {
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          if (!await add_menu_coloring(op[0])) {
            return FALSE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("msghistory");
      if (match_optname(opts, fullname, 3, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_env_opt(fullname, opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.iflags.msg_history = (negated ? 0 : atoi(op[0])) >>> 0;
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("msg_window");
      if (match_optname(opts, fullname, 4, TRUE)) {
        let tmp = 0;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if ($peq(op[0] = await string_for_opt(opts, TRUE), P(empty_optstr))) {
          tmp = negated ? 115 : 102;
        } else {
          if (negated) {
            await bad_negation(fullname, TRUE);
            return FALSE;
          }
          tmp = lowc(op[0].a[op[0].o]);
        }
        switch (tmp) {
        case 115:
          G.iflags.prevmsg_window = 115;
          break;
        case 99:
          G.iflags.prevmsg_window = 99;
          break;
        case 102:
          G.iflags.prevmsg_window = 102;
          break;
        case 114:
          G.iflags.prevmsg_window = 114;
          break;
        default:
          await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
          retval = FALSE;
        }
        return retval;
      }
      fullname = S("font");
      if (!strncmpi(opts, fullname, 4)) {
        let opttype = -1;
        let fontopts = opts.add(4);
        if (!strncmpi(fontopts, S("map"), 3) || !strncmpi(fontopts, S("_map"), 4)) {
          opttype = MAP_OPTION;
        } else if (!strncmpi(fontopts, S("message"), 7) || !strncmpi(fontopts, S("_message"), 8)) {
          opttype = MESSAGE_OPTION;
        } else if (!strncmpi(fontopts, S("text"), 4) || !strncmpi(fontopts, S("_text"), 5)) {
          opttype = TEXT_OPTION;
        } else if (!strncmpi(fontopts, S("menu"), 4) || !strncmpi(fontopts, S("_menu"), 5)) {
          opttype = MENU_OPTION;
        } else if (!strncmpi(fontopts, S("status"), 6) || !strncmpi(fontopts, S("_status"), 7)) {
          opttype = STATUS_OPTION;
        } else if (!strncmpi(fontopts, S("_size"), 5)) {
          if (!strncmpi(fontopts, S("_size_map"), 8)) {
            opttype = MAP_OPTION;
          } else if (!strncmpi(fontopts, S("_size_message"), 12)) {
            opttype = MESSAGE_OPTION;
          } else if (!strncmpi(fontopts, S("_size_text"), 9)) {
            opttype = TEXT_OPTION;
          } else if (!strncmpi(fontopts, S("_size_menu"), 9)) {
            opttype = MENU_OPTION;
          } else if (!strncmpi(fontopts, S("_size_status"), 11)) {
            opttype = STATUS_OPTION;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, opts);
            return FALSE;
          }
          if (duplicate) {
            await complain_about_duplicate(opts, 1);
          }
          if (opttype > 0 && !negated && !$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
            switch (opttype) {
            case MAP_OPTION:
              G.iflags.wc_fontsiz_map = atoi(op[0]);
              break;
            case MESSAGE_OPTION:
              G.iflags.wc_fontsiz_message = atoi(op[0]);
              break;
            case TEXT_OPTION:
              G.iflags.wc_fontsiz_text = atoi(op[0]);
              break;
            case MENU_OPTION:
              G.iflags.wc_fontsiz_menu = atoi(op[0]);
              break;
            case STATUS_OPTION:
              G.iflags.wc_fontsiz_status = atoi(op[0]);
              break;
            }
          }
          return retval;
        } else {
          await config_error_add(S("Unknown %s parameter '%s'"), fullname, opts);
          return FALSE;
        }
        if (opttype > 0 && !$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          await wc_set_font_name(opttype, op[0]);
          return retval;
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      if (!match_optname(opts, S("fruit"), 2, TRUE)) { $g = 2; continue $L; }
      forig = null;
      if (duplicate) {
        await complain_about_duplicate(opts, 1);
      }
      op[0] = await string_for_opt(opts, negated || !initial ? 1 : 0);
      if (negated) {
        if (!$peq(op[0], P(empty_optstr))) {
          await bad_negation(S("fruit"), TRUE);
          return FALSE;
        }
        op[0] = P(empty_optstr);
        { $g = 1; continue $L; }
      }
      if ($peq(op[0], P(empty_optstr))) {
        return FALSE;
      }
      mungspaces(op[0]);
      if (!initial) {
        let f = null;
        const fnum = new Int32Array(1);
        fnum[0] = 0;
        f = await fruit_from_name(op[0], FALSE, P(fnum, 0));
        if (!f) {
          if (!G.flags.made_fruit) {
            forig = await fruit_from_name(P(G.pl_fruit), FALSE, null);
          }
          if (!forig && fnum[0] >= 100) {
            await config_error_add(S("Doing that so many times isn't very fruitful."));
            return retval;
          }
        }
      }
    case 1: // goodfruit
      nmcpy(P(G.pl_fruit), op[0], PL_FSIZ);
      sanitize_name(P(G.pl_fruit));
      if (!$rd(P(G.pl_fruit))) {
        nmcpy(P(G.pl_fruit), S("slime mold"), PL_FSIZ);
      }
      if (!initial) {
        await fruitadd(P(G.pl_fruit), forig);
        await pline(S("Fruit is now \"%s\"."), P(G.pl_fruit));
      }
      return retval;
    case 2:
      fullname = S("whatis_coord");
      if (match_optname(opts, fullname, 8, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          G.iflags.getpos_coords = GPCOORDS_NONE;
          return retval;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          let c = lowc(op[0].a[op[0].o]);
          if (c && strchr(P(parseoptions$gpcoords), c)) {
            G.iflags.getpos_coords = c;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("whatis_filter");
      if (match_optname(opts, fullname, 8, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          G.iflags.getloc_filter = GFILTER_NONE;
          return retval;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          let c = lowc(op[0].a[op[0].o]);
          switch (c) {
          case 110:
            G.iflags.getloc_filter = GFILTER_NONE;
            break;
          case 118:
            G.iflags.getloc_filter = GFILTER_VIEW;
            break;
          case 97:
            G.iflags.getloc_filter = GFILTER_AREA;
            break;
          default:
            {
              await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
              return FALSE;
            }
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("warnings");
      if (match_optname(opts, fullname, 5, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        }
        return await warning_opts(opts, fullname);
      }
      fullname = S("boulder");
      if (match_optname(opts, fullname, 7, TRUE)) {
        let clash = 0;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        }
        if ($peq(opts = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          return FALSE;
        }
        escapes(opts, opts);
        if (def_char_to_monclass(opts.a[opts.o]) !== MAXMCLASSES) {
          clash = opts.a[opts.o] ? 1 : 0;
        } else if (opts.a[opts.o] >= 49 && opts.a[opts.o] < WARNCOUNT + 48) {
          clash = 2;
        }
        if (clash) {
          await config_error_add(S("Badoption - boulder symbol '%s' would conflict with a %s symbol"), visctrl(opts.a[opts.o]), clash === 1 ? S("monster") : S("warning"));
        } else {
          G.ov_primary_syms[SYM_BOULDER + SYM_OFF_X] = opts.a[opts.o] & 0xff;
          G.ov_rogue_syms[SYM_BOULDER + SYM_OFF_X] = opts.a[opts.o] & 0xff;
          if (!initial) {
            let sym = get_othersym(SYM_BOULDER, (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? ROGUESET : PRIMARY);
            if (sym) {
              G.showsyms[SYM_BOULDER + SYM_OFF_X] = sym;
            }
            need_redraw = TRUE;
          }
        }
        return retval;
      }
      fullname = S("name");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          nmcpy(P(G.plname), op[0], PL_NSIZ);
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("altkeyhandler");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_opt(opts, negated), P(empty_optstr))) {
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("align_status");
      if (match_optname(opts, fullname, 13 - 1, TRUE)) {
        op[0] = await string_for_opt(opts, negated);
        if (!$peq(op[0], P(empty_optstr)) && !negated) {
          if (!strncmpi(op[0], S("left"), 5 - 1)) {
            G.iflags.wc_align_status = ALIGN_LEFT;
          } else if (!strncmpi(op[0], S("top"), 4 - 1)) {
            G.iflags.wc_align_status = ALIGN_TOP;
          } else if (!strncmpi(op[0], S("right"), 6 - 1)) {
            G.iflags.wc_align_status = ALIGN_RIGHT;
          } else if (!strncmpi(op[0], S("bottom"), 7 - 1)) {
            G.iflags.wc_align_status = ALIGN_BOTTOM;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("align_message");
      if (match_optname(opts, fullname, 14 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (!$peq(op[0], P(empty_optstr)) && !negated) {
          if (!strncmpi(op[0], S("left"), 5 - 1)) {
            G.iflags.wc_align_message = ALIGN_LEFT;
          } else if (!strncmpi(op[0], S("top"), 4 - 1)) {
            G.iflags.wc_align_message = ALIGN_TOP;
          } else if (!strncmpi(op[0], S("right"), 6 - 1)) {
            G.iflags.wc_align_message = ALIGN_RIGHT;
          } else if (!strncmpi(op[0], S("bottom"), 7 - 1)) {
            G.iflags.wc_align_message = ALIGN_BOTTOM;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("packorder");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if ($peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          return FALSE;
        }
        if (!await change_inv_order(op[0])) {
          return FALSE;
        }
        return retval;
      }
      fullname = S("paranoid_confirmation");
      if (match_optname(opts, fullname, 8, TRUE)) {
        G.flags.paranoia_bits = 0;
        if (negated) {
          G.flags.paranoia_bits = 0;
        } else if (!$peq(op[0] = await string_for_opt(opts, TRUE), P(empty_optstr))) {
          let pp = null;
          let buf = new Int8Array(256);
          strncpy(P(buf), op[0], 256 - 1);
          buf[256 - 1] = 0;
          op[0] = mungspaces(P(buf));
          for (; ; ) {
            pp = strchr(op[0], 32);
            if (pp) {
              pp.a[pp.o] = 0;
            }
            for (i = 0; i < (Math.trunc(576 / 48) | 0); ++i) {
              if (match_optname(op[0], paranoia[i].argname, paranoia[i].argMinLen, FALSE) || paranoia[i].synonym && match_optname(op[0], paranoia[i].synonym, paranoia[i].synMinLen, FALSE)) {
                if (paranoia[i].flagmask) {
                  G.flags.paranoia_bits = (G.flags.paranoia_bits | paranoia[i].flagmask >>> 0) >>> 0;
                } else {
                  G.flags.paranoia_bits = 0;
                }
                break;
              }
            }
            if (i === (Math.trunc(576 / 48) | 0)) {
              await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
              return FALSE;
            }
            if (pp) {
              op[0] = pp.add(1);
            } else {
              break;
            }
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("prayconfirm");
      if (match_optname(opts, fullname, 4, FALSE)) {
        if (negated) {
          G.flags.paranoia_bits = (G.flags.paranoia_bits & 4294967263) >>> 0;
        } else {
          G.flags.paranoia_bits = (G.flags.paranoia_bits | PARANOID_PRAY) >>> 0;
        }
        return retval;
      }
      fullname = S("pickup_burden");
      if (match_optname(opts, fullname, 8, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          switch (lowc(op[0].a[op[0].o])) {
          case 117:
            G.flags.pickup_burden = UNENCUMBERED;
            break;
          case 98:
            G.flags.pickup_burden = SLT_ENCUMBER;
            break;
          case 115:
            G.flags.pickup_burden = MOD_ENCUMBER;
            break;
          case 110:
            G.flags.pickup_burden = HVY_ENCUMBER;
            break;
          case 111:
          case 116:
            G.flags.pickup_burden = EXT_ENCUMBER;
            break;
          case 108:
            G.flags.pickup_burden = OVERLOADED;
            break;
          default:
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("pickup_types");
      if (match_optname(opts, fullname, 8, TRUE)) {
        let ocl = new Int8Array(19);
        let tbuf = new Int8Array(19);
        let qbuf = new Int8Array(128);
        let abuf = new Int8Array(256);
        let oc_sym = 0;
        let badopt = FALSE;
        let compat = (strlen(opts) <= 6 ? 1 : 0) << 24 >> 24;
        let use_menu = 0;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        await oc_to_str(P(G.flags.pickup_types), P(tbuf));
        G.flags.pickup_types[0] = 0;
        op[0] = await string_for_opt(opts, compat || !initial ? 1 : 0);
        if ($peq(op[0], P(empty_optstr))) {
          if (compat || negated || initial) {
            G.flags.pickup = (!negated ? 1 : 0) << 24 >> 24;
            return retval;
          }
          await oc_to_str(P(G.flags.inv_order), P(ocl));
          use_menu = TRUE;
          if (G.flags.menu_style === MENU_TRADITIONAL || G.flags.menu_style === MENU_COMBINATION) {
            let wasspace = 0;
            use_menu = FALSE;
            sprintf(P(qbuf), S("New %s: [%s am] (%s)"), fullname, P(ocl), $rd(P(tbuf)) ? P(tbuf) : S("all"));
            abuf[0] = 0;
            await G.windowprocs.win_getlin(P(qbuf), P(abuf));
            wasspace = (abuf[0] === 32 ? 1 : 0) << 24 >> 24;
            op[0] = mungspaces(P(abuf));
            if (wasspace && !abuf[0]) {
              ;
            } else if (!abuf[0] || abuf[0] === 27) {
              op[0] = P(tbuf);
            } else if (abuf[0] === 109) {
              use_menu = TRUE;
            }
          }
          if (use_menu) {
            if (G.flags.debug && !strchr(P(ocl), 46)) {
              strkitten(P(ocl), VENOM_SYM);
            }
            await choose_classes_menu(S("Autopickup what?"), 1, TRUE, P(ocl), P(tbuf));
            op[0] = P(tbuf);
          }
        }
        if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        while (op[0].a[op[0].o] === 32) {
          op[0] = op[0].add(1);
        }
        if (op[0].a[op[0].o] !== 97 && op[0].a[op[0].o] !== 65) {
          num = 0;
          while (op[0].a[op[0].o]) {
            oc_sym = def_char_to_objclass(op[0].a[op[0].o]);
            if (oc_sym !== MAXOCLASSES && !strchr(P(G.flags.pickup_types), oc_sym)) {
              G.flags.pickup_types[num] = oc_sym << 24 >> 24;
              G.flags.pickup_types[num = num + 1 >>> 0] = 0;
            } else {
              badopt = TRUE;
            }
            op[0] = op[0].add(1);
          }
          if (badopt) {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        }
        return retval;
      }
      fullname = S("pile_limit");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.flags.pile_limit = negated ? 0 : atoi(op[0]);
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        } else {
          G.flags.pile_limit = PILE_LIMIT_DFLT;
        }
        if (G.flags.pile_limit < 0) {
          G.flags.pile_limit = PILE_LIMIT_DFLT;
        }
        return retval;
      }
      fullname = S("playmode");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
        }
        if (duplicate || negated) {
          return FALSE;
        }
        op[0] = await string_for_opt(opts, FALSE);
        if ($peq(op[0], P(empty_optstr))) {
          return FALSE;
        }
        if (!strncmpi(op[0], S("normal"), 6) || !strncmpi(op[0], S("play"), -1)) {
          G.flags.debug = G.flags.explore = FALSE;
        } else if (!strncmpi(op[0], S("explore"), 6) || !strncmpi(op[0], S("discovery"), 6)) {
          G.flags.debug = FALSE, G.flags.explore = TRUE;
        } else if (!strncmpi(op[0], S("debug"), 5) || !strncmpi(op[0], S("wizard"), 6)) {
          G.flags.debug = TRUE, G.flags.explore = FALSE;
        } else {
          await config_error_add(S("Invalid value for \"%s\":%s"), fullname, op[0]);
          return FALSE;
        }
        return retval;
      }
      fullname = S("player_selection");
      if (match_optname(opts, fullname, 17 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (!$peq(op[0], P(empty_optstr)) && !negated) {
          if (!strncmpi(op[0], S("dialog"), 7 - 1)) {
            G.iflags.wc_player_selection = VIA_DIALOG;
          } else if (!strncmpi(op[0], S("prompt"), 7 - 1)) {
            G.iflags.wc_player_selection = VIA_PROMPTS;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("disclose");
      if (match_optname(opts, fullname, 7, TRUE)) {
        let idx = 0;
        let prefix_val = 0;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, TRUE);
        if (!$peq(op[0], P(empty_optstr)) && negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        if ($peq(op[0], P(empty_optstr)) || !strncmpi(op[0], S("all"), -1) || !strncmpi(op[0], S("none"), -1)) {
          if (!$peq(op[0], P(empty_optstr)) && !strncmpi(op[0], S("none"), -1)) {
            negated = TRUE;
          }
          for (num = 0; num < NUM_DISCLOSURE_OPTIONS; num = num + 1 >>> 0) {
            G.flags.end_disclose[num] = (negated ? DISCLOSE_NO_WITHOUT_PROMPT : DISCLOSE_PROMPT_DEFAULT_YES) << 24 >> 24;
          }
          return retval;
        }
        num = 0;
        prefix_val = -1;
        while (op[0].a[op[0].o] && num < 7 - 1) {
          let c = 0;
          let dop = null;
          c = lowc(op[0].a[op[0].o]);
          if (c === 107) {
            c = 118;
          }
          if (c === 100) {
            c = 111;
          }
          dop = strchr(P(G.disclosure_options), c);
          if (dop) {
            idx = dop.o - P(G.disclosure_options).o | 0;
            if (idx < 0 || idx > NUM_DISCLOSURE_OPTIONS - 1) {
              await impossible(S("bad disclosure index %d %c"), idx, c);
              continue;
            }
            if (prefix_val !== -1) {
              if (dop.a[dop.o] !== 118) {
                if (prefix_val === DISCLOSE_PROMPT_DEFAULT_SPECIAL) {
                  prefix_val = DISCLOSE_PROMPT_DEFAULT_YES;
                }
                if (prefix_val === DISCLOSE_SPECIAL_WITHOUT_PROMPT) {
                  prefix_val = DISCLOSE_YES_WITHOUT_PROMPT;
                }
              }
              G.flags.end_disclose[idx] = prefix_val << 24 >> 24;
              prefix_val = -1;
            } else {
              G.flags.end_disclose[idx] = DISCLOSE_YES_WITHOUT_PROMPT;
            }
          } else if (strchr(P(parseoptions$valid_settings), c)) {
            prefix_val = c;
          } else if (c === 32) {
            ;
          } else {
            await config_error_add(S("Unknown %s parameter '%c'"), fullname, op[0].a[op[0].o]);
            return FALSE;
          }
          op[0] = op[0].add(1);
        }
        return retval;
      }
      fullname = S("scores");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        }
        if ($peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          return FALSE;
        }
        while (op[0].a[op[0].o]) {
          let inum = 1;
          if (digit(op[0].a[op[0].o])) {
            inum = atoi(op[0]);
            while (digit(op[0].a[op[0].o])) {
              op[0] = op[0].add(1);
            }
          } else if (op[0].a[op[0].o] === 33) {
            negated = (!negated ? 1 : 0) << 24 >> 24;
            op[0] = op[0].add(1);
          }
          while (op[0].a[op[0].o] === 32) {
            op[0] = op[0].add(1);
          }
          switch (op[0].a[op[0].o]) {
          case 116:
          case 84:
            G.flags.end_top = inum;
            break;
          case 97:
          case 65:
            G.flags.end_around = inum;
            break;
          case 111:
          case 79:
            G.flags.end_own = (!negated ? 1 : 0) << 24 >> 24;
            break;
          default:
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
          while (letter(op[0].a[op[0].o])) {
            op[0] = op[0].add(1);
          }
          while (op[0].a[op[0].o] === 32) {
            op[0] = op[0].add(1);
          }
          if (op[0].a[op[0].o] === 47) {
            op[0] = op[0].add(1);
          }
        }
        return retval;
      }
      fullname = S("sortloot");
      if (match_optname(opts, fullname, 4, TRUE)) {
        op[0] = await string_for_env_opt(fullname, opts, FALSE);
        if (!$peq(op[0], P(empty_optstr))) {
          let c = lowc(op[0].a[op[0].o]);
          switch (c) {
          case 110:
          case 108:
          case 102:
            G.flags.sortloot = c;
            break;
          default:
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("suppress_alert");
      if (match_optname(opts, fullname, 4, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0], P(empty_optstr))) {
          await feature_alert_opts(op[0], fullname);
        }
        return retval;
      }
      fullname = S("map_mode");
      if (match_optname(opts, fullname, 9 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (!$peq(op[0], P(empty_optstr)) && !negated) {
          if (!strncmpi(op[0], S("tiles"), -1)) {
            G.iflags.wc_map_mode = MAP_MODE_TILES;
          } else if (!strncmpi(op[0], S("ascii4x6"), 9 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII4x6;
          } else if (!strncmpi(op[0], S("ascii6x8"), 9 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII6x8;
          } else if (!strncmpi(op[0], S("ascii8x8"), 9 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII8x8;
          } else if (!strncmpi(op[0], S("ascii16x8"), 10 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII16x8;
          } else if (!strncmpi(op[0], S("ascii7x12"), 10 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII7x12;
          } else if (!strncmpi(op[0], S("ascii8x12"), 10 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII8x12;
          } else if (!strncmpi(op[0], S("ascii16x12"), 11 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII16x12;
          } else if (!strncmpi(op[0], S("ascii12x16"), 11 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII12x16;
          } else if (!strncmpi(op[0], S("ascii10x18"), 11 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII10x18;
          } else if (!strncmpi(op[0], S("fit_to_screen"), 14 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII_FIT_TO_SCREEN;
          } else if (!strncmpi(op[0], S("ascii_fit_to_screen"), 20 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_ASCII_FIT_TO_SCREEN;
          } else if (!strncmpi(op[0], S("tiles_fit_to_screen"), 20 - 1)) {
            G.iflags.wc_map_mode = MAP_MODE_TILES_FIT_TO_SCREEN;
          } else {
            await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("scroll_amount");
      if (match_optname(opts, fullname, 14 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.iflags.wc_scroll_amount = negated ? 1 : atoi(op[0]);
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("scroll_margin");
      if (match_optname(opts, fullname, 14 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.iflags.wc_scroll_margin = negated ? 5 : atoi(op[0]);
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("subkeyvalue");
      if (match_optname(opts, fullname, 5, TRUE)) {
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("tile_width");
      if (match_optname(opts, fullname, 11 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.iflags.wc_tile_width = negated ? 0 : atoi(op[0]);
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("tile_file");
      if (match_optname(opts, fullname, 10 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (!$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          if (G.iflags.wc_tile_file) {
            free(G.iflags.wc_tile_file);
          }
          G.iflags.wc_tile_file = await dupstr(op[0]);
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("tile_height");
      if (match_optname(opts, fullname, 12 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.iflags.wc_tile_height = negated ? 0 : atoi(op[0]);
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("vary_msgcount");
      if (match_optname(opts, fullname, 14 - 1, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, negated);
        if (negated && $peq(op[0], P(empty_optstr)) || !negated && !$peq(op[0], P(empty_optstr))) {
          G.iflags.wc_vary_msgcount = negated ? 0 : atoi(op[0]);
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("windowtype");
      if (match_optname(opts, fullname, 3, TRUE)) {
        if (G.iflags.windowtype_locked) {
          return retval;
        }
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if (!$peq(op[0] = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          if (!G.iflags.windowtype_deferred) {
            let buf = new Int8Array(16);
            nmcpy(P(buf), op[0], WINTYPELEN);
            await choose_windows(P(buf));
          } else {
            nmcpy(P(G.chosen_windowtype), op[0], WINTYPELEN);
          }
        } else {
          return FALSE;
        }
        return retval;
      }
      fullname = S("windowcolors");
      if (match_optname(opts, fullname, 7, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (!$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
          if (!await wc_set_window_colors(op[0])) {
            await config_error_add(S("Could not set %s '%s'"), fullname, op[0]);
            return FALSE;
          }
        } else if (negated) {
          await bad_negation(fullname, TRUE);
          return FALSE;
        }
        return retval;
      }
      fullname = S("statuslines");
      if (match_optname(opts, fullname, 11, TRUE)) {
        let itmp = 0;
        op[0] = await string_for_opt(opts, negated);
        if (negated) {
          await bad_negation(fullname, TRUE);
          itmp = 2;
          retval = FALSE;
        } else if (!$peq(op[0], P(empty_optstr))) {
          itmp = atoi(op[0]);
        }
        if (itmp < 2 || itmp > 3) {
          await config_error_add(S("'%s' requires a value of 2 or 3"), fullname);
          retval = FALSE;
        } else {
          G.iflags.wc2_statuslines = itmp;
          if (!initial) {
            need_redraw = TRUE;
          }
        }
        return retval;
      }
      fullname = S("menustyle");
      if (match_optname(opts, fullname, 4, TRUE)) {
        let tmp = 0;
        let val_required = (strlen(opts) > 5 && !negated ? 1 : 0) << 24 >> 24;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if ($peq(op[0] = await string_for_opt(opts, !val_required ? 1 : 0), P(empty_optstr))) {
          if (val_required) {
            return FALSE;
          }
          tmp = negated ? 110 : 102;
        } else {
          tmp = lowc(op[0].a[op[0].o]);
        }
        switch (tmp) {
        case 110:
        case 116:
          G.flags.menu_style = MENU_TRADITIONAL;
          break;
        case 99:
          G.flags.menu_style = MENU_COMBINATION;
          break;
        case 102:
          G.flags.menu_style = MENU_FULL;
          break;
        case 112:
          G.flags.menu_style = MENU_PARTIAL;
          break;
        default:
          await config_error_add(S("Unknown %s parameter '%s'"), fullname, op[0]);
          return FALSE;
        }
        return retval;
      }
      fullname = S("menu_headings");
      if (match_optname(opts, fullname, 12, TRUE)) {
        let tmpattr = 0;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (negated) {
          await bad_negation(fullname, FALSE);
          return FALSE;
        } else if ($peq(opts = await string_for_env_opt(fullname, opts, FALSE), P(empty_optstr))) {
          return FALSE;
        }
        tmpattr = await match_str2attr(opts, TRUE);
        if (tmpattr === -1) {
          return FALSE;
        } else {
          G.iflags.menu_headings = tmpattr;
        }
        return retval;
      }
      for (i = 0; i < (Math.trunc(264 / 24) | 0); ++i) {
        fullname = default_menu_cmd_info[i].name;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (match_optname(opts, fullname, strlen(fullname) | 0, TRUE)) {
          if (negated) {
            await bad_negation(fullname, FALSE);
            return FALSE;
          } else if (!$peq(op[0] = await string_for_opt(opts, FALSE), P(empty_optstr))) {
            let c = 0;
            let op_buf = new Int8Array(256);
            escapes(op[0], P(op_buf));
            c = $rd(P(op_buf));
            if (await illegal_menu_cmd_key(c)) {
              return FALSE;
            }
            await add_menu_cmd_alias(c, default_menu_cmd_info[i].cmd);
          }
          return retval;
        }
      }
      fullname = S("hilite_status");
      if (match_optname(opts, fullname, 13, TRUE)) {
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        op[0] = await string_for_opt(opts, TRUE);
        if (!$peq(op[0], P(empty_optstr)) && negated) {
          clear_status_hilites();
          return retval;
        } else if ($peq(op[0], P(empty_optstr))) {
          await config_error_add(S("Value is mandatory for hilite_status"));
          return FALSE;
        }
        if (!await parse_status_hl1(op[0], tfrom_file)) {
          return FALSE;
        }
        return retval;
      }
      fullname = S("statushilites");
      if (match_optname(opts, fullname, 9, TRUE)) {
        if (negated) {
          G.iflags.hilite_delta = 0;
        } else {
          op[0] = await string_for_opt(opts, TRUE);
          G.iflags.hilite_delta = $peq(op[0], P(empty_optstr)) || !op[0].a[op[0].o] ? 3 : atol(op[0]);
          if (G.iflags.hilite_delta < 0) {
            G.iflags.hilite_delta = 1;
          }
        }
        if (!tfrom_file) {
          reset_status_hilites();
        }
        return retval;
      }
      fullname = S("DECgraphics");
      if (match_optname(opts, fullname, 3, TRUE)) {
        let badflag = FALSE;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (!negated) {
          if (G.symset[PRIMARY].name) {
            badflag = TRUE;
          } else {
            G.symset[PRIMARY].name = await dupstr(fullname);
            if (!await read_sym_file(PRIMARY)) {
              badflag = TRUE;
              clear_symsetentry(PRIMARY, TRUE);
            } else {
              await switch_symbols(TRUE);
            }
          }
          if (badflag) {
            await config_error_add(S("Failure to load symbol set %s."), fullname);
            return FALSE;
          }
        }
        return retval;
      }
      fullname = S("IBMgraphics");
      if (match_optname(opts, fullname, 3, TRUE)) {
        let sym_name = fullname;
        let badflag = FALSE;
        if (duplicate) {
          await complain_about_duplicate(opts, 1);
        }
        if (!negated) {
          for (i = 0; i < NUM_GRAPHICS; ++i) {
            if (G.symset[i].name) {
              badflag = TRUE;
            } else {
              if (i === ROGUESET) {
                sym_name = S("RogueIBM");
              }
              G.symset[i].name = await dupstr(sym_name);
              if (!await read_sym_file(i)) {
                badflag = TRUE;
                clear_symsetentry(i, TRUE);
                break;
              }
            }
          }
          if (badflag) {
            await config_error_add(S("Failure to load symbol set %s."), sym_name);
            return FALSE;
          } else {
            await switch_symbols(TRUE);
            if (!initial && ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
              assign_graphics(ROGUESET);
            }
          }
        }
        return retval;
      }
      fullname = S("MACgraphics");
      if (match_optname(opts, fullname, 3, TRUE)) {
        await config_error_add(S("'%s' %s; use 'symset:%s' instead"), fullname, S("is not supported"), fullname);
        return FALSE;
      }
      for (i = 0; boolopt[i].name; ++i) {
        if (match_optname(opts, boolopt[i].name, 3, TRUE)) {
          if (!boolopt[i].addr) {
            if (!initial && !negated) {
              await pline_The(S("\"%s\" option is not available."), boolopt[i].name);
            }
            return retval;
          }
          if (!initial && boolopt[i].optflags === SET_IN_FILE) {
            await rejectoption(boolopt[i].name);
            return retval;
          }
          op[0] = await string_for_opt(opts, TRUE);
          if (!$peq(op[0], P(empty_optstr))) {
            if (negated) {
              await config_error_add(S("Negated boolean '%s' should not have a parameter"), boolopt[i].name);
              return FALSE;
            }
            if (!strcmp(op[0], S("true")) || !strcmp(op[0], S("yes"))) {
              negated = FALSE;
            } else if (!strcmp(op[0], S("false")) || !strcmp(op[0], S("no"))) {
              negated = TRUE;
            } else {
              await config_error_add(S("Illegal parameter for a boolean"));
              return FALSE;
            }
          }
          if (G.iflags.debug_fuzzer && !initial) {
            if ($peq(boolopt[i].addr, P(G.flags, "silent"))) {
              return TRUE;
            }
          }
          $wr(boolopt[i].addr, 0, (!negated ? 1 : 0) << 24 >> 24);
          if (duplicate_opt_detection(boolopt[i].name, 0)) {
            await complain_about_duplicate(boolopt[i].name, 0);
          }
          if ($peq(boolopt[i].addr, P(G.iflags, "wc_ascii_map"))) {
            G.iflags.wc_tiled_map = negated;
          } else if ($peq(boolopt[i].addr, P(G.iflags, "wc_tiled_map"))) {
            G.iflags.wc_ascii_map = negated;
          }
          if (initial) {
            return retval;
          }
          if ($peq(boolopt[i].addr, P(G.flags, "time")) || $peq(boolopt[i].addr, P(G.flags, "showexp"))) {
            if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
              await status_initialize(REASSESS_ONLY);
            }
            G.context.botl = TRUE;
          } else if ($peq(boolopt[i].addr, P(G.flags, "invlet_constant")) || $peq(boolopt[i].addr, P(G.flags, "sortpack")) || $peq(boolopt[i].addr, P(G.iflags, "implicit_uncursed"))) {
            if (!G.flags.invlet_constant) {
              reassign();
            }
            update_inventory();
          } else if ($peq(boolopt[i].addr, P(G.flags, "lit_corridor")) || $peq(boolopt[i].addr, P(G.flags, "dark_room"))) {
            await vision_recalc(2);
            G.vision_full_recalc = 1;
            if (G.iflags.wc_color) {
              need_redraw = TRUE;
            }
          } else if ($peq(boolopt[i].addr, P(G.flags, "showrace")) || $peq(boolopt[i].addr, P(G.iflags, "wc_inverse")) || $peq(boolopt[i].addr, P(G.iflags, "hilite_pile")) || $peq(boolopt[i].addr, P(G.iflags, "perm_invent")) || $peq(boolopt[i].addr, P(G.iflags, "wc_ascii_map")) || $peq(boolopt[i].addr, P(G.iflags, "wc_tiled_map"))) {
            need_redraw = TRUE;
          } else if ($peq(boolopt[i].addr, P(G.iflags, "wc_hilite_pet"))) {
            need_redraw = TRUE;
          } else if ($peq(boolopt[i].addr, P(G.iflags, "wc2_hitpointbar"))) {
            if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
              await status_initialize(REASSESS_ONLY);
              need_redraw = TRUE;
            }
          } else if ($peq(boolopt[i].addr, P(G.iflags, "wc_color"))) {
            need_redraw = TRUE;
          } else if ($peq(boolopt[i].addr, P(G.iflags, "use_menu_color")) || $peq(boolopt[i].addr, P(G.iflags, "wc2_guicolor"))) {
            update_inventory();
          }
          return retval;
        }
      }
      if ($peq(strstr(opts, S("S_")), opts) && parsesymbols(opts, PRIMARY)) {
        await switch_symbols(TRUE);
        check_gold_symbol();
        return retval;
      }
      await config_error_add(S("Unknown option '%s'"), opts);
      return FALSE;
    }
    break;
  }
}

export async function parsebindings(bindings: Ptr | null): Promise<number> {
  let $t1: any, $t2: any;
  let bind = null;
  let key = 0;
  let i = 0;
  let ret = FALSE;
  if (!!(bind = strchr(bindings, 44))) {
    $wr(($t1 = bind, bind = $t1.add(1), $t1), 0, 0);
    ret = (ret | await parsebindings(bind)) << 24 >> 24;
  }
  if (!(bind = strchr(bindings, 58))) {
    return FALSE;
  }
  $wr(($t2 = bind, bind = $t2.add(1), $t2), 0, 0);
  key = txt2key(bindings);
  if (!key) {
    await config_error_add(S("Unknown key binding key '%s'"), bindings);
    return FALSE;
  }
  bind = trimspaces(bind);
  if (bind_specialkey(key, bind)) {
    return TRUE;
  }
  for (i = 0; i < (Math.trunc(264 / 24) | 0); ++i) {
    if (!strcmp(default_menu_cmd_info[i].name, bind)) {
      if (await illegal_menu_cmd_key(key)) {
        await config_error_add(S("Bad menu key %s:%s"), visctrl(key), bind);
        return FALSE;
      } else {
        await add_menu_cmd_alias(key, default_menu_cmd_info[i].cmd);
      }
      return TRUE;
    }
  }
  if (!bind_key(key, bind)) {
    await config_error_add(S("Unknown key binding command '%s'"), bind);
    return FALSE;
  }
  return TRUE;
}

export async function oc_to_str(src: Ptr | null, dest: Ptr | null): Promise<void> {
  let $t1: any, $t2: any;
  let i = 0;
  while ((i = $rd(($t1 = src, src = $t1.add(1), $t1))) !== 0) {
    if (i < 0 || i >= MAXOCLASSES) {
      await impossible(S("oc_to_str:  illegal object class %d"), i);
    } else {
      $wr(($t2 = dest, dest = $t2.add(1), $t2), 0, G.def_oc_syms[i].sym);
    }
  }
  dest.a[dest.o] = 0;
}

export async function add_menu_cmd_alias(from_ch: number, to_ch: number): Promise<void> {
  if (n_menu_mapped >= MAX_MENU_MAPPED_CMDS) {
    await pline(S("out of menu map space."));
  } else {
    G.mapped_menu_cmds[n_menu_mapped] = from_ch;
    mapped_menu_op[n_menu_mapped] = to_ch;
    n_menu_mapped = n_menu_mapped + 1 << 16 >> 16;
    G.mapped_menu_cmds[n_menu_mapped] = 0;
    mapped_menu_op[n_menu_mapped] = 0;
  }
}

export function get_menu_cmd_key(ch: number): number {
  let found = strchr(P(mapped_menu_op), ch);
  if (found) {
    let idx = found.o - P(mapped_menu_op).o | 0;
    ch = G.mapped_menu_cmds[idx];
  }
  return ch;
}

export function map_menu_cmd(ch: number): number {
  let found = strchr(P(G.mapped_menu_cmds), ch);
  if (found) {
    let idx = found.o - P(G.mapped_menu_cmds).o | 0;
    ch = mapped_menu_op[idx];
  }
  return ch;
}

export async function show_menu_controls(win: number, dolist: number): Promise<void> {
  let buf = new Int8Array(256);
  await G.windowprocs.win_putstr(win, 0, S("Menu control keys:"));
  if (dolist) {
    let i = 0;
    for (i = 0; i < (Math.trunc(264 / 24) | 0); ++i) {
      sprintf(P(buf), S("%-8s %s"), visctrl(get_menu_cmd_key(default_menu_cmd_info[i].cmd)), default_menu_cmd_info[i].desc);
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
  } else {
    let fmt3 = $cs(" %-12s       %-2s        %-2s  %s", 34);
    let fmt2 = $cs(" %-12s       %-2s        %-2s", 30);
    let fmt1 = $cs(" %10s  %-2s  %s", 16);
    let fmt0 = $cs(" %14s  %s", 10);
    await G.windowprocs.win_putstr(win, 0, S(""));
    await G.windowprocs.win_putstr(win, 0, S("Selection:       On page   Full menu"));
    sprintf(P(buf), P(fmt2), S("Select all"), visctrl(get_menu_cmd_key(MENU_SELECT_PAGE)), visctrl(get_menu_cmd_key(MENU_SELECT_ALL)));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt2), S("Deselect all"), visctrl(get_menu_cmd_key(MENU_UNSELECT_PAGE)), visctrl(get_menu_cmd_key(MENU_UNSELECT_ALL)));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt2), S("Invert all"), visctrl(get_menu_cmd_key(MENU_INVERT_PAGE)), visctrl(get_menu_cmd_key(MENU_INVERT_ALL)));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt3), S("Text match"), S(""), visctrl(get_menu_cmd_key(MENU_SEARCH)), S("Search and toggle matching entries"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S(""));
    await G.windowprocs.win_putstr(win, 0, S("Navigation:"));
    sprintf(P(buf), P(fmt1), S("Go to     "), visctrl(get_menu_cmd_key(MENU_NEXT_PAGE)), S("Next page"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt1), S(""), visctrl(get_menu_cmd_key(MENU_PREVIOUS_PAGE)), S("Previous page"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt1), S(""), visctrl(get_menu_cmd_key(MENU_FIRST_PAGE)), S("First page"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt1), S(""), visctrl(get_menu_cmd_key(MENU_LAST_PAGE)), S("Last page"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt0), S("SPACE"), S("Next page, if any, otherwise RETURN"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt0), S("RETURN/ENTER"), S("Finish menu with any selection(s) made"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
    sprintf(P(buf), P(fmt0), S("ESCAPE"), S("Cancel menu without selecting anything"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
}

async function doset_add_menu(win: number, option: Ptr | null, indexoffset: number): Promise<void> {
  let value = S("unknown");
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let any = new union_any();
  let i = 0;
  any.$cp(G.zeroany);
  if (indexoffset === 0) {
    any.a_int = 0;
    value = await get_compopt_value(option, P(buf2));
  } else {
    for (i = 0; compopt[i].name; ++i) {
      if (strcmp(option, compopt[i].name) === 0) {
        break;
      }
    }
    if (compopt[i].name) {
      any.a_int = i + 1 + indexoffset;
      value = await get_compopt_value(option, P(buf2));
    } else {
      any.a_int = 0;
    }
  }
  if (!G.iflags.menu_tab_sep) {
    sprintf(P(buf), P(fmtstr_doset), any.a_int ? S("") : S("    "), option, value);
  } else {
    sprintf(P(buf), P(fmtstr_doset_tab), option, value);
  }
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
}

async function opts_add_others(win: number, name: Ptr | null, id: number, bufx: Ptr | null, nset: number): Promise<void> {
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let any = G.zeroany.$clone();
  any.a_int = id;
  if (!bufx) {
    sprintf(P(buf2), P(n_currently_set), nset);
  } else {
    sprintf(P(buf2), S("%s"), bufx);
  }
  if (!G.iflags.menu_tab_sep) {
    sprintf(P(buf), P(fmtstr_doset), any.a_int ? S("") : S("    "), name, P(buf2));
  } else {
    sprintf(P(buf), P(fmtstr_doset_tab), name, P(buf2));
  }
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
}

export function count_apes(): number {
  let numapes = 0;
  let ape = G.apelist;
  while (ape) {
    ++numapes;
    ape = ape.next;
  }
  return numapes;
}

export async function doset(): Promise<number> {
  let buf = new Int8Array(256);
  let name = null;
  let i = 0;
  let pass = 0;
  let boolcount = 0;
  let pick_cnt = 0;
  let pick_idx = 0;
  let opt_indx = 0;
  let bool_p = null;
  let tmpwin = 0;
  let any = new union_any();
  const pick_list = [null];
  let indexoffset = 0;
  let startpass = 0;
  let endpass = 0;
  let optflags = 0;
  let setinitial = FALSE;
  let fromfile = FALSE;
  let longest_name_len = 0;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  startpass = DISP_IN_GAME;
  endpass = G.flags.debug ? SET_IN_WIZGAME : SET_IN_GAME;
  if (!doset$made_fmtstr && !G.iflags.menu_tab_sep) {
    longest_name_len = 0;
    for (pass = 0; pass <= 2; ++pass) {
      for (i = 0; !!(name = pass === 0 ? boolopt[i].name : pass === 1 ? compopt[i].name : othropt[i].name); ++i) {
        if (pass === 0 && !boolopt[i].addr) {
          continue;
        }
        optflags = pass === 0 ? boolopt[i].optflags : pass === 1 ? compopt[i].optflags : othropt[i].optflags;
        if (optflags < startpass || optflags > endpass) {
          continue;
        }
        if (is_wc_option(name) && !wc_supported(name) || is_wc2_option(name) && !wc2_supported(name)) {
          continue;
        }
        if (strlen(name) > longest_name_len) {
          longest_name_len = strlen(name) >>> 0;
        }
      }
    }
    sprintf(P(fmtstr_doset), S("%%s%%-%us [%%s]"), longest_name_len);
    doset$made_fmtstr = TRUE;
  }
  any.$cp(G.zeroany);
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, S("Booleans (selecting will toggle value):"), MENU_UNSELECTED);
  any.a_int = 0;
  for (pass = 0; pass <= 1; ++pass) {
    for (i = 0; !!(name = boolopt[i].name); ++i) {
      if (!!(bool_p = boolopt[i].addr) && (boolopt[i].optflags <= DISP_IN_GAME && pass === 0 || boolopt[i].optflags >= SET_IN_GAME && pass === 1)) {
        if ($peq(bool_p, P(G.flags, "female"))) {
          continue;
        }
        if (boolopt[i].optflags === SET_IN_WIZGAME && !G.flags.debug) {
          continue;
        }
        if (is_wc_option(name) && !wc_supported(name) || is_wc2_option(name) && !wc2_supported(name)) {
          continue;
        }
        any.a_int = pass === 0 ? 0 : i + 1;
        if (!G.iflags.menu_tab_sep) {
          sprintf(P(buf), P(fmtstr_doset), pass === 0 ? S("    ") : S(""), name, bool_p.a[bool_p.o] ? S("true") : S("false"));
        } else {
          sprintf(P(buf), P(fmtstr_doset_tab), name, bool_p.a[bool_p.o] ? S("true") : S("false"));
        }
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
      }
    }
  }
  boolcount = i;
  indexoffset = boolcount;
  any.$cp(G.zeroany);
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, S("Compounds (selecting will prompt for new value):"), MENU_UNSELECTED);
  await doset_add_menu(tmpwin, S("playmode"), 0);
  await doset_add_menu(tmpwin, S("name"), 0);
  await doset_add_menu(tmpwin, S("role"), 0);
  await doset_add_menu(tmpwin, S("race"), 0);
  await doset_add_menu(tmpwin, S("gender"), 0);
  await doset_add_menu(tmpwin, S("align"), 0);
  for (pass = startpass; pass <= endpass; ++pass) {
    for (i = 0; !!(name = compopt[i].name); ++i) {
      if (compopt[i].optflags === pass) {
        if (!strcmp(name, S("playmode")) || !strcmp(name, S("name")) || !strcmp(name, S("role")) || !strcmp(name, S("race")) || !strcmp(name, S("gender")) || !strcmp(name, S("align"))) {
          continue;
        }
        if (is_wc_option(name) && !wc_supported(name) || is_wc2_option(name) && !wc2_supported(name)) {
          continue;
        }
        await doset_add_menu(tmpwin, name, pass === DISP_IN_GAME ? 0 : indexoffset);
      }
    }
  }
  any.$cp(G.zeroany);
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, S("Other settings:"), MENU_UNSELECTED);
  for (i = 0; !!(name = othropt[i].name); ++i) {
    if (is_wc_option(name) && !wc_supported(name) || is_wc2_option(name) && !wc2_supported(name)) {
      continue;
    }
    await opts_add_others(tmpwin, name, othropt[i].code, null, await othropt[i].othr_count_func());
  }
  await G.windowprocs.win_end_menu(tmpwin, S("Set what options?"));
  need_redraw = FALSE;
  if ((pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ANY, P(pick_list, 0))) > 0) {
    for (pick_idx = 0; pick_idx < pick_cnt; ++pick_idx) {
      opt_indx = $sadd(pick_list[0], pick_idx).item.a_int - 1;
      if (opt_indx < -1) {
        ++opt_indx;
      }
      if (opt_indx === OPT_OTHER_APEXC) {
        await special_handling(S("autopickup_exception"), setinitial, fromfile);
      } else if (opt_indx === OPT_OTHER_STATHILITE) {
        if (!await status_hilite_menu()) {
          await pline(S("Bad status hilite(s) specified."));
        } else {
          if (wc2_supported(S("hilite_status"))) {
            await G.windowprocs.win_preference_update(S("hilite_status"));
          }
        }
      } else if (opt_indx === OPT_OTHER_MENUCOLOR) {
        await special_handling(S("menu_colors"), setinitial, fromfile);
      } else if (opt_indx === OPT_OTHER_MSGTYPE) {
        await special_handling(S("msgtype"), setinitial, fromfile);
      } else if (opt_indx < boolcount) {
        sprintf(P(buf), S("%s%s"), $rd(boolopt[opt_indx].addr) ? S("!") : S(""), boolopt[opt_indx].name);
        await parseoptions(P(buf), setinitial, fromfile);
        if (wc_supported(boolopt[opt_indx].name) || wc2_supported(boolopt[opt_indx].name)) {
          await G.windowprocs.win_preference_update(boolopt[opt_indx].name);
        }
      } else {
        opt_indx -= boolcount;
        if (!await special_handling(compopt[opt_indx].name, setinitial, fromfile)) {
          let abuf = new Int8Array(256);
          sprintf(P(buf), S("Set %s to what?"), compopt[opt_indx].name);
          abuf[0] = 0;
          await G.windowprocs.win_getlin(P(buf), P(abuf));
          if (abuf[0] === 27) {
            continue;
          }
          sprintf(P(buf), S("%s:"), compopt[opt_indx].name);
          strncat(eos(P(buf)), P(abuf), 256 - 1 - strlen(P(buf)));
          await parseoptions(P(buf), setinitial, fromfile);
        }
        if (wc_supported(compopt[opt_indx].name) || wc2_supported(compopt[opt_indx].name)) {
          await G.windowprocs.win_preference_update(compopt[opt_indx].name);
        }
      }
    }
    free(pick_list[0]), pick_list[0] = null;
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (need_redraw) {
    check_gold_symbol();
    reglyph_darkroom();
    await doredraw();
  }
  return 0;
}

async function handle_add_list_remove(optname: Ptr | null, numtotal: number): Promise<number> {
  let tmpwin = 0;
  let any = new union_any();
  let i = 0;
  let pick_cnt = 0;
  let opt_idx = 0;
  const pick_list = [null];
  pick_list[0] = null;
  opt_idx = 0;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 0; i < (Math.trunc(64 / 16) | 0); ++i) {
    let tmpbuf = new Int8Array(256);
    ++any.a_int;
    if (!numtotal && (i === 1 || i === 2)) {
      continue;
    }
    sprintf(P(tmpbuf), handle_add_list_remove$action_titles[i].desc, i === 1 ? await makeplural(optname) : optname);
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, handle_add_list_remove$action_titles[i].letr, 0, ATR_NONE, P(tmpbuf), i === 3 ? MENU_SELECTED : MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, S("Do what?"));
  if ((pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(pick_list, 0))) > 0) {
    opt_idx = pick_list[0].item.a_int - 1;
    if (pick_cnt > 1 && opt_idx === 3) {
      opt_idx = $sadd(pick_list[0], 1).item.a_int - 1;
    }
    free(pick_list[0]);
  } else {
    opt_idx = 3;
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  return opt_idx;
}

async function special_handling(optname: Ptr | null, setinitial: number, setfromfile: number): Promise<number> {
  let $g = 0;
  let tmpwin = 0;
  let any = new union_any();
  let i = 0;
  let n = 0;
  let buf = new Int8Array(256);
  let opt_idx$2 = 0;
  let nmt = 0;
  let mttyp = 0;
  let mtbuf = new Int8Array(256);
  let opt_idx$3 = 0;
  let nmc = 0;
  let mcclr = 0;
  let mcattr = 0;
  let mcbuf = new Int8Array(256);
  let opt_idx$4 = 0;
  let numapes = 0;
  let apebuf = new Int8Array(258);
  let ape = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      any = new union_any();
      buf = new Int8Array(256);
      if (!!strcmp(S("menustyle"), optname)) { $g = 6; continue $L; }
      {
        let style_name = null;
        const style_pick = [null];
        style_pick[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; i < (Math.trunc(32 / 8) | 0); ++i) {
          style_name = menutype[i];
          any.a_int = i + 1;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, style_name.a[style_name.o], 0, ATR_NONE, style_name, MENU_UNSELECTED);
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Select menustyle:"));
        if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(style_pick, 0)) > 0) {
          G.flags.menu_style = style_pick[0].item.a_int - 1 << 24 >> 24;
          free(style_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 5; continue $L; }
    case 6:
      if (!!strcmp(S("paranoid_confirmation"), optname)) { $g = 8; continue $L; }
      {
        const paranoia_picks = [null];
        paranoia_picks[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; paranoia[i].flagmask !== 0; ++i) {
          if (paranoia[i].flagmask === PARANOID_BONES && !G.flags.debug) {
            continue;
          }
          any.a_int = paranoia[i].flagmask;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, $rd(paranoia[i].argname), 0, ATR_NONE, paranoia[i].explain, (G.flags.paranoia_bits & paranoia[i].flagmask >>> 0) >>> 0 ? MENU_SELECTED : MENU_UNSELECTED);
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Actions requiring extra confirmation:"));
        i = await G.windowprocs.win_select_menu(tmpwin, PICK_ANY, P(paranoia_picks, 0));
        if (i >= 0) {
          G.flags.paranoia_bits = 0;
          if (i > 0) {
            while (--i >= 0) {
              G.flags.paranoia_bits = (G.flags.paranoia_bits | $sadd(paranoia_picks[0], i).item.a_int >>> 0) >>> 0;
            }
            free(paranoia_picks[0]);
          }
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 7; continue $L; }
    case 8:
      if (!!strcmp(S("pickup_burden"), optname)) { $g = 10; continue $L; }
      {
        let burden_name = null;
        let burden_letters = S("ubsntl");
        const burden_pick = [null];
        burden_pick[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; i < (Math.trunc(48 / 8) | 0); ++i) {
          burden_name = burdentype[i];
          any.a_int = i + 1;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, burden_letters.a[burden_letters.o + i], 0, ATR_NONE, burden_name, MENU_UNSELECTED);
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Select encumbrance level:"));
        if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(burden_pick, 0)) > 0) {
          G.flags.pickup_burden = burden_pick[0].item.a_int - 1;
          free(burden_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 9; continue $L; }
    case 10:
      if (!!strcmp(S("pickup_types"), optname)) { $g = 12; continue $L; }
      {
        await parseoptions(strcpy(P(buf), S("pickup_types")), setinitial, setfromfile);
      }
      { $g = 11; continue $L; }
    case 12:
      if (!!strcmp(S("disclose"), optname)) { $g = 14; continue $L; }
      {
        let disc_cat = new Int32Array(6);
        let pick_cnt = 0;
        let pick_idx = 0;
        let opt_idx = 0;
        let c = 0;
        const disclosure_pick = [null];
        disclosure_pick[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; i < NUM_DISCLOSURE_OPTIONS; ++i) {
          sprintf(P(buf), S("%-12s[%c%c]"), special_handling$disclosure_names[i], G.flags.end_disclose[i], G.disclosure_options[i]);
          any.a_int = i + 1;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, G.disclosure_options[i], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
          disc_cat[i] = 0;
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Change which disclosure options categories:"));
        pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ANY, P(disclosure_pick, 0));
        if (pick_cnt > 0) {
          for (pick_idx = 0; pick_idx < pick_cnt; ++pick_idx) {
            opt_idx = $sadd(disclosure_pick[0], pick_idx).item.a_int - 1;
            disc_cat[opt_idx] = 1;
          }
          free(disclosure_pick[0]);
          disclosure_pick[0] = null;
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
        for (i = 0; i < NUM_DISCLOSURE_OPTIONS; ++i) {
          if (disc_cat[i]) {
            c = G.flags.end_disclose[i];
            sprintf(P(buf), S("Disclosure options for %s:"), special_handling$disclosure_names[i]);
            tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
            await G.windowprocs.win_start_menu(tmpwin);
            any.$cp(G.zeroany);
            any.a_char = DISCLOSE_NO_WITHOUT_PROMPT;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, any.a_char, ATR_NONE, S("Never disclose, without prompting"), c === any.a_char ? MENU_SELECTED : MENU_UNSELECTED);
            any.a_char = DISCLOSE_YES_WITHOUT_PROMPT;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, any.a_char, ATR_NONE, S("Always disclose, without prompting"), c === any.a_char ? MENU_SELECTED : MENU_UNSELECTED);
            if ($rd(special_handling$disclosure_names[i]) === 118) {
              any.a_char = DISCLOSE_SPECIAL_WITHOUT_PROMPT;
              await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, any.a_char, ATR_NONE, S("Always disclose, pick sort order from menu"), c === any.a_char ? MENU_SELECTED : MENU_UNSELECTED);
            }
            any.a_char = DISCLOSE_PROMPT_DEFAULT_NO;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, any.a_char, ATR_NONE, S("Prompt, with default answer of \"No\""), c === any.a_char ? MENU_SELECTED : MENU_UNSELECTED);
            any.a_char = DISCLOSE_PROMPT_DEFAULT_YES;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, any.a_char, ATR_NONE, S("Prompt, with default answer of \"Yes\""), c === any.a_char ? MENU_SELECTED : MENU_UNSELECTED);
            if ($rd(special_handling$disclosure_names[i]) === 118) {
              any.a_char = DISCLOSE_PROMPT_DEFAULT_SPECIAL;
              await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, any.a_char, ATR_NONE, S("Prompt, with default answer of \"Ask\" to request sort menu"), c === any.a_char ? MENU_SELECTED : MENU_UNSELECTED);
            }
            await G.windowprocs.win_end_menu(tmpwin, P(buf));
            n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(disclosure_pick, 0));
            if (n > 0) {
              G.flags.end_disclose[i] = disclosure_pick[0].item.a_char;
              if (n > 1 && G.flags.end_disclose[i] === c) {
                G.flags.end_disclose[i] = $sadd(disclosure_pick[0], 1).item.a_char;
              }
              free(disclosure_pick[0]);
            }
            await G.windowprocs.win_destroy_nhwindow(tmpwin);
          }
        }
      }
      { $g = 13; continue $L; }
    case 14:
      if (!!strcmp(S("runmode"), optname)) { $g = 16; continue $L; }
      {
        let mode_name = null;
        const mode_pick = [null];
        mode_pick[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; i < (Math.trunc(32 / 8) | 0); ++i) {
          mode_name = runmodes[i];
          any.a_int = i + 1;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, mode_name.a[mode_name.o], 0, ATR_NONE, mode_name, MENU_UNSELECTED);
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Select run/travel display mode:"));
        if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(mode_pick, 0)) > 0) {
          G.flags.runmode = mode_pick[0].item.a_int - 1;
          free(mode_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 15; continue $L; }
    case 16:
      if (!!strcmp(S("whatis_coord"), optname)) { $g = 18; continue $L; }
      {
        const window_pick = [null];
        window_pick[0] = null;
        let pick_cnt = 0;
        let gp = G.iflags.getpos_coords << 24 >> 24;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        any.a_char = GPCOORDS_COMPASS;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, GPCOORDS_COMPASS, 0, ATR_NONE, S("compass ('east' or '3s' or '2n,4w')"), gp === GPCOORDS_COMPASS ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_char = GPCOORDS_COMFULL;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, GPCOORDS_COMFULL, 0, ATR_NONE, S("full compass ('east' or '3south' or '2north,4west')"), gp === GPCOORDS_COMFULL ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_char = GPCOORDS_MAP;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, GPCOORDS_MAP, 0, ATR_NONE, S("map <x,y>"), gp === GPCOORDS_MAP ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_char = GPCOORDS_SCREEN;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, GPCOORDS_SCREEN, 0, ATR_NONE, S("screen [row,column]"), gp === GPCOORDS_SCREEN ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_char = GPCOORDS_NONE;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, GPCOORDS_NONE, 0, ATR_NONE, S("none (no coordinates displayed)"), gp === GPCOORDS_NONE ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_long = 0;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
        sprintf(P(buf), S("map: upper-left: <%d,%d>, lower-right: <%d,%d>%s"), 1, 0, COLNO - 1, ROWNO - 1, G.flags.verbose ? S("; column 0 unused, off left edge") : S(""));
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
        if (strcmp(G.windowprocs.name, S("tty"))) {
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S("screen: row is offset to accommodate tty interface's use of top line"), MENU_UNSELECTED);
        }
        sprintf(P(buf), S("screen: upper-left: [%02d,%02d], lower-right: [%d,%d]%s"), 0 + 2, 1, ROWNO - 1 + 2, COLNO - 1, G.flags.verbose ? S("; column 80 is not used") : S(""));
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
        await G.windowprocs.win_end_menu(tmpwin, S("Select coordinate display when auto-describing a map position:"));
        if ((pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(window_pick, 0))) > 0) {
          G.iflags.getpos_coords = window_pick[0].item.a_char;
          if (pick_cnt > 1 && G.iflags.getpos_coords === gp) {
            G.iflags.getpos_coords = $sadd(window_pick[0], 1).item.a_char;
          }
          free(window_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 17; continue $L; }
    case 18:
      if (!!strcmp(S("whatis_filter"), optname)) { $g = 20; continue $L; }
      {
        const window_pick = [null];
        window_pick[0] = null;
        let pick_cnt = 0;
        let gf = G.iflags.getloc_filter << 24 >> 24;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        any.a_char = GFILTER_NONE + 1;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 110, 0, ATR_NONE, S("no filtering"), gf === GFILTER_NONE ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_char = GFILTER_VIEW + 1;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 118, 0, ATR_NONE, S("in view only"), gf === GFILTER_VIEW ? MENU_SELECTED : MENU_UNSELECTED);
        any.a_char = GFILTER_AREA + 1;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 97, 0, ATR_NONE, S("in same area"), gf === GFILTER_AREA ? MENU_SELECTED : MENU_UNSELECTED);
        await G.windowprocs.win_end_menu(tmpwin, S("Select location filtering when going for next/previous map position:"));
        if ((pick_cnt = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(window_pick, 0))) > 0) {
          G.iflags.getloc_filter = window_pick[0].item.a_char - 1;
          if (pick_cnt > 1 && G.iflags.getloc_filter === gf) {
            G.iflags.getloc_filter = $sadd(window_pick[0], 1).item.a_char - 1;
          }
          free(window_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 19; continue $L; }
    case 20:
      if (!!strcmp(S("msg_window"), optname)) { $g = 22; continue $L; }
      {
        if (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) || G.windowprocs.name && !strncmpi(S("curses"), G.windowprocs.name, strlen(S("curses")) | 0)) {
          const window_pick = [null];
          window_pick[0] = null;
          tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
          await G.windowprocs.win_start_menu(tmpwin);
          any.$cp(G.zeroany);
          if (!(G.windowprocs.name && !strncmpi(S("curses"), G.windowprocs.name, strlen(S("curses")) | 0))) {
            any.a_char = 115;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 115, 0, ATR_NONE, S("single"), MENU_UNSELECTED);
            any.a_char = 99;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 99, 0, ATR_NONE, S("combination"), MENU_UNSELECTED);
          }
          any.a_char = 102;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 102, 0, ATR_NONE, S("full"), MENU_UNSELECTED);
          any.a_char = 114;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 114, 0, ATR_NONE, S("reversed"), MENU_UNSELECTED);
          await G.windowprocs.win_end_menu(tmpwin, S("Select message history display type:"));
          if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(window_pick, 0)) > 0) {
            G.iflags.prevmsg_window = window_pick[0].item.a_char;
            free(window_pick[0]);
          }
          await G.windowprocs.win_destroy_nhwindow(tmpwin);
        } else {
          await pline(S("'%s' option is not supported for '%s'."), optname, G.windowprocs.name);
        }
      }
      { $g = 21; continue $L; }
    case 22:
      if (!!strcmp(S("sortloot"), optname)) { $g = 24; continue $L; }
      {
        let sortl_name = null;
        const sortl_pick = [null];
        sortl_pick[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; i < (Math.trunc(24 / 8) | 0); ++i) {
          sortl_name = sortltype[i];
          any.a_char = sortl_name.a[sortl_name.o];
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, sortl_name.a[sortl_name.o], 0, ATR_NONE, sortl_name, G.flags.sortloot === sortl_name.a[sortl_name.o] ? MENU_SELECTED : MENU_UNSELECTED);
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Select loot sorting type:"));
        n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(sortl_pick, 0));
        if (n > 0) {
          let c = sortl_pick[0].item.a_char;
          if (n > 1 && c === G.flags.sortloot) {
            c = $sadd(sortl_pick[0], 1).item.a_char;
          }
          G.flags.sortloot = c;
          free(sortl_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 23; continue $L; }
    case 24:
      if (!(!strcmp(S("align_message"), optname) || !strcmp(S("align_status"), optname))) { $g = 26; continue $L; }
      {
        const window_pick = [null];
        window_pick[0] = null;
        let abuf = new Int8Array(256);
        let msg = ($rd(optname.add(6)) === 109 ? 1 : 0) << 24 >> 24;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        any.a_int = ALIGN_TOP;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 116, 0, ATR_NONE, S("top"), MENU_UNSELECTED);
        any.a_int = ALIGN_BOTTOM;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 98, 0, ATR_NONE, S("bottom"), MENU_UNSELECTED);
        any.a_int = ALIGN_LEFT;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 108, 0, ATR_NONE, S("left"), MENU_UNSELECTED);
        any.a_int = ALIGN_RIGHT;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 114, 0, ATR_NONE, S("right"), MENU_UNSELECTED);
        sprintf(P(abuf), S("Select %s window placement relative to the map:"), msg ? S("message") : S("status"));
        await G.windowprocs.win_end_menu(tmpwin, P(abuf));
        if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(window_pick, 0)) > 0) {
          if (msg) {
            G.iflags.wc_align_message = window_pick[0].item.a_int;
          } else {
            G.iflags.wc_align_status = window_pick[0].item.a_int;
          }
          free(window_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 25; continue $L; }
    case 26:
      if (!!strcmp(S("number_pad"), optname)) { $g = 28; continue $L; }
      {
        const mode_pick = [null];
        mode_pick[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        for (i = 0; i < (Math.trunc(48 / 8) | 0); ++i) {
          any.a_int = i + 1;
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 97 + i, 0, ATR_NONE, special_handling$npchoices[i], MENU_UNSELECTED);
        }
        await G.windowprocs.win_end_menu(tmpwin, S("Select number_pad mode:"));
        if (await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(mode_pick, 0)) > 0) {
          switch (mode_pick[0].item.a_int - 1) {
          case 0:
            G.iflags.num_pad = FALSE;
            G.iflags.num_pad_mode = 0;
            break;
          case 1:
            G.iflags.num_pad = TRUE;
            G.iflags.num_pad_mode = 0;
            break;
          case 2:
            G.iflags.num_pad = TRUE;
            G.iflags.num_pad_mode = 1;
            break;
          case 3:
            G.iflags.num_pad = TRUE;
            G.iflags.num_pad_mode = 2;
            break;
          case 4:
            G.iflags.num_pad = TRUE;
            G.iflags.num_pad_mode = 3;
            break;
          case 5:
            G.iflags.num_pad = FALSE;
            G.iflags.num_pad_mode = 1;
            break;
          }
          reset_commands(FALSE);
          G.windowprocs.win_number_pad(G.iflags.num_pad ? 1 : 0);
          free(mode_pick[0]);
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      }
      { $g = 27; continue $L; }
    case 28:
      if (!!strcmp(S("menu_headings"), optname)) { $g = 30; continue $L; }
      {
        let mhattr = await query_attr(S("How to highlight menu headings:"));
        if (mhattr !== -1) {
          G.iflags.menu_headings = mhattr;
        }
      }
      { $g = 29; continue $L; }
    case 30:
      if (!!strcmp(S("msgtype"), optname)) { $g = 32; continue $L; }
      mtbuf = new Int8Array(256);
    case 1: // msgtypes_again
      nmt = msgtype_count();
      opt_idx$2 = await handle_add_list_remove(S("message type"), nmt);
      if (opt_idx$2 === 3) {
        return TRUE;
      } else if (opt_idx$2 === 0) {
        mtbuf[0] = 0;
        await G.windowprocs.win_getlin(S("What new message pattern?"), P(mtbuf));
        if ($rd(P(mtbuf)) === 27) {
          return TRUE;
        }
        if ($rd(P(mtbuf)) && await test_regex_pattern(P(mtbuf), null) && (mttyp = await query_msgtype()) !== -1 && !await msgtype_add(mttyp, P(mtbuf))) {
          await pline(S("Error adding the message type."));
          await G.windowprocs.win_wait_synch();
        }
        { $g = 1; continue $L; }
      } else {
        let pick_idx = 0;
        let pick_cnt = 0;
        let mt_idx = 0;
        let ln = 0;
        let mtype = null;
        const pick_list = [null];
        pick_list[0] = null;
        let tmp = G.plinemsg_types;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        mt_idx = 0;
        while (tmp) {
          mtype = msgtype2name(tmp.msgtype);
          any.a_int = ++mt_idx;
          sprintf(P(mtbuf), S("%-5s \""), mtype);
          ln = 256 - strlen(P(mtbuf)) - 2 >>> 0;
          if (strlen(tmp.pattern) > ln) {
            strcat(strncat(P(mtbuf), tmp.pattern, ln - 3 >>> 0), S("...\""));
          } else {
            strcat(strcat(P(mtbuf), tmp.pattern), S("\""));
          }
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(mtbuf), MENU_UNSELECTED);
          tmp = tmp.next;
        }
        sprintf(P(mtbuf), S("%s message types"), opt_idx$2 === 1 ? S("List of") : S("Remove which"));
        await G.windowprocs.win_end_menu(tmpwin, P(mtbuf));
        pick_cnt = await G.windowprocs.win_select_menu(tmpwin, opt_idx$2 === 1 ? PICK_NONE : PICK_ANY, P(pick_list, 0));
        if (pick_cnt > 0) {
          for (pick_idx = 0; pick_idx < pick_cnt; ++pick_idx) {
            free_one_msgtype($sadd(pick_list[0], pick_idx).item.a_int - 1 - pick_idx);
          }
          free(pick_list[0]), pick_list[0] = null;
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
        if (pick_cnt >= 0) {
          { $g = 1; continue $L; }
        }
      }
      { $g = 31; continue $L; }
    case 32:
      if (!!strcmp(S("menu_colors"), optname)) { $g = 34; continue $L; }
      mcbuf = new Int8Array(256);
    case 2: // menucolors_again
      nmc = count_menucolors();
      opt_idx$3 = await handle_add_list_remove(S("menucolor"), nmc);
      if (!(opt_idx$3 === 3)) { $g = 36; continue $L; }
    case 3: // menucolors_done
      if (G.iflags.use_menu_color) {
        update_inventory();
      } else if (nmc > 0) {
        await pline(S("To have menu colors become active, toggle 'menucolors' option to True."));
      }
      return TRUE;
      { $g = 35; continue $L; }
    case 36:
      if (opt_idx$3 === 0) {
        mcbuf[0] = 0;
        await G.windowprocs.win_getlin(S("What new menucolor pattern?"), P(mcbuf));
        if ($rd(P(mcbuf)) === 27) {
          { $g = 3; continue $L; }
        }
        if ($rd(P(mcbuf)) && await test_regex_pattern(P(mcbuf), null) && (mcclr = await query_color(null)) !== -1 && (mcattr = await query_attr(null)) !== -1 && !await add_menu_coloring_parsed(P(mcbuf), mcclr, mcattr)) {
          await pline(S("Error adding the menu color."));
          await G.windowprocs.win_wait_synch();
        }
        { $g = 2; continue $L; }
      } else {
        let pick_idx = 0;
        let pick_cnt = 0;
        let mc_idx = 0;
        let ln = 0;
        let sattr = null;
        let sclr = null;
        const pick_list = [null];
        pick_list[0] = null;
        let tmp = G.menu_colorings;
        let clrbuf = new Int8Array(128);
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        any.$cp(G.zeroany);
        mc_idx = 0;
        while (tmp) {
          sattr = attr2attrname(tmp.attr);
          sclr = strcpy(P(clrbuf), clr2colorname(tmp.color));
          strNsubst(P(clrbuf), S(" "), S("-"), 0);
          any.a_int = ++mc_idx;
          sprintf(P(buf), S("\"\"=%s%s%s"), sclr, tmp.attr !== ATR_NONE ? S("&") : S(""), tmp.attr !== ATR_NONE ? sattr : S(""));
          ln = 256 - strlen(P(buf)) - 1 >>> 0;
          strcpy(P(mcbuf), S("\""));
          if (strlen(tmp.origstr) > ln) {
            strcat(strncat(P(mcbuf), tmp.origstr, ln - 3 >>> 0), S("..."));
          } else {
            strcat(P(mcbuf), tmp.origstr);
          }
          strcat(P(mcbuf), P(buf, 1));
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(mcbuf), MENU_UNSELECTED);
          tmp = tmp.next;
        }
        sprintf(P(mcbuf), S("%s menu colors"), opt_idx$3 === 1 ? S("List of") : S("Remove which"));
        await G.windowprocs.win_end_menu(tmpwin, P(mcbuf));
        pick_cnt = await G.windowprocs.win_select_menu(tmpwin, opt_idx$3 === 1 ? PICK_NONE : PICK_ANY, P(pick_list, 0));
        if (pick_cnt > 0) {
          for (pick_idx = 0; pick_idx < pick_cnt; ++pick_idx) {
            free_one_menu_coloring($sadd(pick_list[0], pick_idx).item.a_int - 1 - pick_idx);
          }
          free(pick_list[0]), pick_list[0] = null;
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
        if (pick_cnt >= 0) {
          { $g = 2; continue $L; }
        }
      }
    case 35:
      { $g = 33; continue $L; }
    case 34:
      if (!!strcmp(S("autopickup_exception"), optname)) { $g = 38; continue $L; }
      numapes = 0;
      apebuf = new Int8Array(258);
    case 4: // ape_again
      numapes = count_apes();
      opt_idx$4 = await handle_add_list_remove(S("autopickup exception"), numapes);
      if (opt_idx$4 === 3) {
        return TRUE;
      } else if (opt_idx$4 === 0) {
        apebuf[0] = apebuf[1] = 0;
        await G.windowprocs.win_getlin(S("What new autopickup exception pattern?"), P(apebuf, 1));
        mungspaces(P(apebuf, 1));
        if (apebuf[1] === 27) {
          return TRUE;
        }
        if (apebuf[1]) {
          apebuf[0] = 34;
          apebuf[258 - 2] = 0;
          strcat(P(apebuf), S("\""));
          await add_autopickup_exception(P(apebuf));
        }
        { $g = 4; continue $L; }
      } else {
        let pick_idx = 0;
        let pick_cnt = 0;
        const pick_list = [null];
        pick_list[0] = null;
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(tmpwin);
        if (numapes) {
          ape = G.apelist;
          any.$cp(G.zeroany);
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, S("Always pickup '<'; never pickup '>'"), MENU_UNSELECTED);
          for (i = 0; i < numapes && ape; ++i) {
            any.a_void = opt_idx$4 === 1 ? null : ape;
            sprintf(P(apebuf), S("\"%c%s\""), ape.grab ? 60 : 62, ape.pattern);
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(apebuf), MENU_UNSELECTED);
            ape = ape.next;
          }
        }
        sprintf(P(apebuf), S("%s autopickup exceptions"), opt_idx$4 === 1 ? S("List of") : S("Remove which"));
        await G.windowprocs.win_end_menu(tmpwin, P(apebuf));
        pick_cnt = await G.windowprocs.win_select_menu(tmpwin, opt_idx$4 === 1 ? PICK_NONE : PICK_ANY, P(pick_list, 0));
        if (pick_cnt > 0) {
          for (pick_idx = 0; pick_idx < pick_cnt; ++pick_idx) {
            remove_autopickup_exception($sadd(pick_list[0], pick_idx).item.a_void);
          }
          free(pick_list[0]), pick_list[0] = null;
        }
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
        if (pick_cnt >= 0) {
          { $g = 4; continue $L; }
        }
      }
      { $g = 37; continue $L; }
    case 38:
      if (!strcmp(S("symset"), optname) || !strcmp(S("roguesymset"), optname)) {
        const symset_pick = [null];
        symset_pick[0] = null;
        let rogueflag = (optname.a[optname.o] === 114 ? 1 : 0) << 24 >> 24;
        let ready_to_switch = FALSE;
        let nothing_to_do = FALSE;
        let symset_name = null;
        let fmtstr = new Int8Array(20);
        let sl = null;
        let res = 0;
        let which_set = 0;
        let setcount = 0;
        let chosen = -2;
        let defindx = 0;
        which_set = rogueflag ? ROGUESET : PRIMARY;
        G.symset_list = null;
        symset_name = G.symset[which_set].name;
        G.symset[which_set].name = null;
        res = await read_sym_file(which_set);
        G.symset[which_set].name = symset_name;
        if (res && G.symset_list) {
          let thissize = 0;
          let biggest = 16 - 1;
          let big_desc = 0;
          for (sl = G.symset_list; sl; sl = sl.next) {
            if (rogueflag ? sl.primary | 0 : sl.rogue | 0) {
              continue;
            }
            if (sl.handling === H_MAC) {
              continue;
            }
            ++setcount;
            thissize = sl.name ? strlen(sl.name) | 0 : 0;
            if (thissize > biggest) {
              biggest = thissize;
            }
            thissize = sl.desc ? strlen(sl.desc) | 0 : 0;
            if (thissize > big_desc) {
              big_desc = thissize;
            }
          }
          if (!setcount) {
            await pline(S("There are no appropriate %s symbol sets available."), rogueflag ? S("rogue level") : S("primary"));
            return TRUE;
          }
          sprintf(P(fmtstr), S("%%-%ds %%s"), biggest + 2);
          tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
          await G.windowprocs.win_start_menu(tmpwin);
          any.$cp(G.zeroany);
          any.a_int = 1;
          if (!symset_name) {
            defindx = any.a_int;
          }
          await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S("Default Symbols"), any.a_int === defindx ? MENU_SELECTED : MENU_UNSELECTED);
          for (sl = G.symset_list; sl; sl = sl.next) {
            if (rogueflag ? sl.primary | 0 : sl.rogue | 0) {
              continue;
            }
            if (sl.handling === H_MAC) {
              continue;
            }
            if (sl.name) {
              any.a_int = sl.idx + 2;
              if (symset_name && !strncmpi(sl.name, symset_name, -1)) {
                defindx = any.a_int;
              }
              sprintf(P(buf), P(fmtstr), sl.name, sl.desc ? sl.desc : S(""));
              await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), any.a_int === defindx ? MENU_SELECTED : MENU_UNSELECTED);
            }
          }
          sprintf(P(buf), S("Select %ssymbol set:"), rogueflag ? S("rogue level ") : S(""));
          await G.windowprocs.win_end_menu(tmpwin, P(buf));
          n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(symset_pick, 0));
          if (n > 0) {
            chosen = symset_pick[0].item.a_int;
            if (n === 2 && chosen === defindx) {
              chosen = $sadd(symset_pick[0], 1).item.a_int;
            }
            chosen -= 2;
            free(symset_pick[0]);
          } else if (n === 0 && defindx > 0) {
            chosen = defindx - 2;
          }
          await G.windowprocs.win_destroy_nhwindow(tmpwin);
          if (chosen > -1) {
            for (sl = G.symset_list; sl; sl = sl.next) {
              if (sl.idx === chosen) {
                break;
              }
            }
            if (sl) {
              clear_symsetentry(which_set, TRUE);
              G.symset[which_set].name = await dupstr(sl.name);
              ready_to_switch = TRUE;
            }
          } else if (chosen === -1) {
            clear_symsetentry(which_set, TRUE);
          } else {
            nothing_to_do = TRUE;
          }
        } else if (!res) {
          await pline(S("Unable to access \"%s\" file."), S("symbols"));
          return TRUE;
        } else if (!G.symset_list) {
          await pline(S("There were no symbol sets found in \"%s\"."), S("symbols"));
          return TRUE;
        }
        while (!!(sl = G.symset_list)) {
          G.symset_list = sl.next;
          if (sl.name) {
            free(sl.name), sl.name = null;
          }
          if (sl.desc) {
            free(sl.desc), sl.desc = null;
          }
          free(sl);
        }
        if (nothing_to_do) {
          return TRUE;
        }
        if (rogueflag) {
          init_rogue_symbols();
        } else {
          init_primary_symbols();
        }
        if (G.symset[which_set].name) {
          if (await read_sym_file(which_set)) {
            ready_to_switch = TRUE;
          } else {
            clear_symsetentry(which_set, TRUE);
            return TRUE;
          }
        }
        if (ready_to_switch) {
          await switch_symbols(TRUE);
        }
        if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
          if (rogueflag) {
            assign_graphics(ROGUESET);
          }
        } else if (!rogueflag) {
          assign_graphics(PRIMARY);
        }
        await G.windowprocs.win_preference_update(S("symset"));
        need_redraw = TRUE;
      } else {
        return FALSE;
      }
    case 37:
    case 33:
    case 31:
    case 29:
    case 27:
    case 25:
    case 23:
    case 21:
    case 19:
    case 17:
    case 15:
    case 13:
    case 11:
    case 9:
    case 7:
    case 5:
      return TRUE;
    }
    break;
  }
}

async function get_compopt_value(optname: Ptr | null, buf: Ptr | null): Promise<Ptr | null> {
  let ocl = new Int8Array(19);
  let i = 0;
  buf.a[buf.o] = 0;
  if (!strcmp(optname, S("align_message")) || !strcmp(optname, S("align_status"))) {
    let which = !strcmp(optname, S("align_status")) ? G.iflags.wc_align_status : G.iflags.wc_align_message;
    sprintf(buf, S("%s"), which === ALIGN_TOP ? S("top") : which === ALIGN_LEFT ? S("left") : which === ALIGN_BOTTOM ? S("bottom") : which === ALIGN_RIGHT ? S("right") : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("align"))) {
    sprintf(buf, S("%s"), G.flags.initalign >= 0 ? G.aligns[G.flags.initalign].adj : G.flags.initalign === -2 ? P(get_compopt_value$randomrole) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("boulder"))) {
    sprintf(buf, S("%c"), G.ov_primary_syms[SYM_BOULDER + SYM_OFF_X] ? G.ov_primary_syms[SYM_BOULDER + SYM_OFF_X] : G.showsyms[G.objects[BOULDER].oc_class + SYM_OFF_O]);
  } else if (!strcmp(optname, S("catname"))) {
    sprintf(buf, S("%s"), G.catname[0] ? P(G.catname) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("disclose"))) {
    for (i = 0; i < NUM_DISCLOSURE_OPTIONS; ++i) {
      if (i) {
        strkitten(buf, 32);
      }
      strkitten(buf, G.flags.end_disclose[i]);
      strkitten(buf, G.disclosure_options[i]);
    }
  } else if (!strcmp(optname, S("dogname"))) {
    sprintf(buf, S("%s"), G.dogname[0] ? P(G.dogname) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("dungeon"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("effects"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("font_map"))) {
    sprintf(buf, S("%s"), G.iflags.wc_font_map ? G.iflags.wc_font_map : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("font_message"))) {
    sprintf(buf, S("%s"), G.iflags.wc_font_message ? G.iflags.wc_font_message : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("font_status"))) {
    sprintf(buf, S("%s"), G.iflags.wc_font_status ? G.iflags.wc_font_status : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("font_menu"))) {
    sprintf(buf, S("%s"), G.iflags.wc_font_menu ? G.iflags.wc_font_menu : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("font_text"))) {
    sprintf(buf, S("%s"), G.iflags.wc_font_text ? G.iflags.wc_font_text : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("font_size_map"))) {
    if (G.iflags.wc_fontsiz_map) {
      sprintf(buf, S("%d"), G.iflags.wc_fontsiz_map);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("font_size_message"))) {
    if (G.iflags.wc_fontsiz_message) {
      sprintf(buf, S("%d"), G.iflags.wc_fontsiz_message);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("font_size_status"))) {
    if (G.iflags.wc_fontsiz_status) {
      sprintf(buf, S("%d"), G.iflags.wc_fontsiz_status);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("font_size_menu"))) {
    if (G.iflags.wc_fontsiz_menu) {
      sprintf(buf, S("%d"), G.iflags.wc_fontsiz_menu);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("font_size_text"))) {
    if (G.iflags.wc_fontsiz_text) {
      sprintf(buf, S("%d"), G.iflags.wc_fontsiz_text);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("fruit"))) {
    sprintf(buf, S("%s"), P(G.pl_fruit));
  } else if (!strcmp(optname, S("gender"))) {
    sprintf(buf, S("%s"), G.flags.initgend >= 0 ? G.genders[G.flags.initgend].adj : G.flags.initgend === -2 ? P(get_compopt_value$randomrole) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("horsename"))) {
    sprintf(buf, S("%s"), G.horsename[0] ? P(G.horsename) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("map_mode"))) {
    i = G.iflags.wc_map_mode;
    sprintf(buf, S("%s"), i === MAP_MODE_TILES ? S("tiles") : i === MAP_MODE_ASCII4x6 ? S("ascii4x6") : i === MAP_MODE_ASCII6x8 ? S("ascii6x8") : i === MAP_MODE_ASCII8x8 ? S("ascii8x8") : i === MAP_MODE_ASCII16x8 ? S("ascii16x8") : i === MAP_MODE_ASCII7x12 ? S("ascii7x12") : i === MAP_MODE_ASCII8x12 ? S("ascii8x12") : i === MAP_MODE_ASCII16x12 ? S("ascii16x12") : i === MAP_MODE_ASCII12x16 ? S("ascii12x16") : i === MAP_MODE_ASCII10x18 ? S("ascii10x18") : i === MAP_MODE_ASCII_FIT_TO_SCREEN ? S("fit_to_screen") : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("menustyle"))) {
    sprintf(buf, S("%s"), menutype[G.flags.menu_style]);
  } else if (!strcmp(optname, S("menu_deselect_all"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_deselect_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_first_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_invert_all"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_headings"))) {
    sprintf(buf, S("%s"), attr2attrname(G.iflags.menu_headings));
  } else if (!strcmp(optname, S("menu_invert_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_last_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_next_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_previous_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_search"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_select_all"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("menu_select_page"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("monsters"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("msghistory"))) {
    sprintf(buf, S("%u"), G.iflags.msg_history);
  } else if (!strcmp(optname, S("msg_window"))) {
    sprintf(buf, S("%s"), G.iflags.prevmsg_window === 115 ? S("single") : G.iflags.prevmsg_window === 99 ? S("combination") : G.iflags.prevmsg_window === 102 ? S("full") : S("reversed"));
  } else if (!strcmp(optname, S("name"))) {
    sprintf(buf, S("%s"), P(G.plname));
  } else if (!strcmp(optname, S("mouse_support"))) {
    let ms = G.iflags.wc_mouse_support;
    if (ms >= 0 && ms <= 2) {
      sprintf(buf, S("%s%s"), get_compopt_value$mousemodes[ms][0], get_compopt_value$mousemodes[ms][1]);
    }
  } else if (!strcmp(optname, S("number_pad"))) {
    let indx = G.Cmd.num_pad ? G.Cmd.phone_layout ? G.Cmd.pcHack_compat ? 4 : 3 : G.Cmd.pcHack_compat ? 2 : 1 : G.Cmd.swap_yz ? 5 : 0;
    strcpy(buf, get_compopt_value$numpadmodes[indx]);
  } else if (!strcmp(optname, S("objects"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("packorder"))) {
    await oc_to_str(P(G.flags.inv_order), P(ocl));
    sprintf(buf, S("%s"), P(ocl));
  } else if (!strcmp(optname, S("paranoid_confirmation"))) {
    let tmpbuf = new Int8Array(128);
    tmpbuf[0] = 0;
    for (i = 0; paranoia[i].flagmask !== 0; ++i) {
      if ((G.flags.paranoia_bits & paranoia[i].flagmask >>> 0) >>> 0) {
        sprintf(eos(P(tmpbuf)), S(" %s"), paranoia[i].argname);
      }
    }
    strcpy(buf, tmpbuf[0] ? P(tmpbuf, 1) : S("none"));
  } else if (!strcmp(optname, S("petattr"))) {
    if (G.iflags.wc2_petattr !== 0) {
      sprintf(buf, S("0x%08x"), G.iflags.wc2_petattr);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("pettype"))) {
    sprintf(buf, S("%s"), G.preferred_pet === 99 ? S("cat") : G.preferred_pet === 100 ? S("dog") : G.preferred_pet === 104 ? S("horse") : G.preferred_pet === 110 ? S("none") : S("random"));
  } else if (!strcmp(optname, S("pickup_burden"))) {
    sprintf(buf, S("%s"), burdentype[G.flags.pickup_burden]);
  } else if (!strcmp(optname, S("pickup_types"))) {
    await oc_to_str(P(G.flags.pickup_types), P(ocl));
    sprintf(buf, S("%s"), ocl[0] ? P(ocl) : S("all"));
  } else if (!strcmp(optname, S("pile_limit"))) {
    sprintf(buf, S("%d"), G.flags.pile_limit);
  } else if (!strcmp(optname, S("playmode"))) {
    strcpy(buf, G.flags.debug ? S("debug") : G.flags.explore ? S("explore") : S("normal"));
  } else if (!strcmp(optname, S("race"))) {
    sprintf(buf, S("%s"), G.flags.initrace >= 0 ? G.races[G.flags.initrace].noun : G.flags.initrace === -2 ? P(get_compopt_value$randomrole) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("roguesymset"))) {
    sprintf(buf, S("%s"), G.symset[ROGUESET].name ? G.symset[ROGUESET].name : S("default"));
    if (G.currentgraphics === ROGUESET && G.symset[ROGUESET].name) {
      strcat(buf, S(", active"));
    }
  } else if (!strcmp(optname, S("role"))) {
    sprintf(buf, S("%s"), G.flags.initrole >= 0 ? G.roles[G.flags.initrole].name.m : G.flags.initrole === -2 ? P(get_compopt_value$randomrole) : P(get_compopt_value$none));
  } else if (!strcmp(optname, S("runmode"))) {
    sprintf(buf, S("%s"), runmodes[G.flags.runmode]);
  } else if (!strcmp(optname, S("whatis_coord"))) {
    sprintf(buf, S("%s"), G.iflags.getpos_coords === GPCOORDS_MAP ? S("map") : G.iflags.getpos_coords === GPCOORDS_COMPASS ? S("compass") : G.iflags.getpos_coords === GPCOORDS_COMFULL ? S("full compass") : G.iflags.getpos_coords === GPCOORDS_SCREEN ? S("screen") : S("none"));
  } else if (!strcmp(optname, S("whatis_filter"))) {
    sprintf(buf, S("%s"), G.iflags.getloc_filter === GFILTER_VIEW ? S("view") : G.iflags.getloc_filter === GFILTER_AREA ? S("area") : S("none"));
  } else if (!strcmp(optname, S("scores"))) {
    sprintf(buf, S("%d top/%d around%s"), G.flags.end_top, G.flags.end_around, G.flags.end_own ? S("/own") : S(""));
  } else if (!strcmp(optname, S("scroll_amount"))) {
    if (G.iflags.wc_scroll_amount) {
      sprintf(buf, S("%d"), G.iflags.wc_scroll_amount);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("scroll_margin"))) {
    if (G.iflags.wc_scroll_margin) {
      sprintf(buf, S("%d"), G.iflags.wc_scroll_margin);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("sortloot"))) {
    for (i = 0; i < (Math.trunc(24 / 8) | 0); ++i) {
      if (G.flags.sortloot === $rd(sortltype[i])) {
        strcpy(buf, sortltype[i]);
        break;
      }
    }
  } else if (!strcmp(optname, S("player_selection"))) {
    sprintf(buf, S("%s"), G.iflags.wc_player_selection ? S("prompts") : S("dialog"));
  } else if (!strcmp(S("statushilites"), optname)) {
    if (!G.iflags.hilite_delta) {
      strcpy(buf, S("0 (off: don't highlight status fields)"));
    } else {
      sprintf(buf, S("%ld (on: highlight status for %ld turns)"), G.iflags.hilite_delta, G.iflags.hilite_delta);
    }
  } else if (!strcmp(optname, S("statuslines"))) {
    if (wc2_supported(optname)) {
      strcpy(buf, G.iflags.wc2_statuslines < 3 ? S("2") : S("3"));
    }
  } else if (!strcmp(optname, S("suppress_alert"))) {
    if (G.flags.suppress_alert === 0) {
      strcpy(buf, P(get_compopt_value$none));
    } else {
      sprintf(buf, S("%lu.%lu.%lu"), $shr64(G.flags.suppress_alert, 24), $shr64((16711680 & G.flags.suppress_alert) >>> 0, 16), $shr64((65280 & G.flags.suppress_alert) >>> 0, 8));
    }
  } else if (!strcmp(optname, S("symset"))) {
    sprintf(buf, S("%s"), G.symset[PRIMARY].name ? G.symset[PRIMARY].name : S("default"));
    if (G.currentgraphics === PRIMARY && G.symset[PRIMARY].name) {
      strcat(buf, S(", active"));
    }
  } else if (!strcmp(optname, S("term_cols"))) {
    if (G.iflags.wc2_term_cols) {
      sprintf(buf, S("%d"), G.iflags.wc2_term_cols);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("term_rows"))) {
    if (G.iflags.wc2_term_rows) {
      sprintf(buf, S("%d"), G.iflags.wc2_term_rows);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("tile_file"))) {
    sprintf(buf, S("%s"), G.iflags.wc_tile_file ? G.iflags.wc_tile_file : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("tile_height"))) {
    if (G.iflags.wc_tile_height) {
      sprintf(buf, S("%d"), G.iflags.wc_tile_height);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("tile_width"))) {
    if (G.iflags.wc_tile_width) {
      sprintf(buf, S("%d"), G.iflags.wc_tile_width);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("traps"))) {
    sprintf(buf, S("%s"), P(get_compopt_value$to_be_done));
  } else if (!strcmp(optname, S("vary_msgcount"))) {
    if (G.iflags.wc_vary_msgcount) {
      sprintf(buf, S("%d"), G.iflags.wc_vary_msgcount);
    } else {
      strcpy(buf, P(get_compopt_value$defopt));
    }
  } else if (!strcmp(optname, S("windowborders"))) {
    sprintf(buf, S("%s"), G.iflags.wc2_windowborders === 0 ? S("0=off") : G.iflags.wc2_windowborders === 1 ? S("1=on") : G.iflags.wc2_windowborders === 2 ? S("2=auto") : P(get_compopt_value$defopt));
  } else if (!strcmp(optname, S("windowtype"))) {
    sprintf(buf, S("%s"), G.windowprocs.name);
  } else if (!strcmp(optname, S("windowcolors"))) {
    sprintf(buf, S("%s/%s %s/%s %s/%s %s/%s"), G.iflags.wc_foregrnd_menu ? G.iflags.wc_foregrnd_menu : P(get_compopt_value$defbrief), G.iflags.wc_backgrnd_menu ? G.iflags.wc_backgrnd_menu : P(get_compopt_value$defbrief), G.iflags.wc_foregrnd_message ? G.iflags.wc_foregrnd_message : P(get_compopt_value$defbrief), G.iflags.wc_backgrnd_message ? G.iflags.wc_backgrnd_message : P(get_compopt_value$defbrief), G.iflags.wc_foregrnd_status ? G.iflags.wc_foregrnd_status : P(get_compopt_value$defbrief), G.iflags.wc_backgrnd_status ? G.iflags.wc_backgrnd_status : P(get_compopt_value$defbrief), G.iflags.wc_foregrnd_text ? G.iflags.wc_foregrnd_text : P(get_compopt_value$defbrief), G.iflags.wc_backgrnd_text ? G.iflags.wc_backgrnd_text : P(get_compopt_value$defbrief));
  }
  if (!buf.a[buf.o]) {
    strcpy(buf, S("unknown"));
  }
  return buf;
}

export async function dotogglepickup(): Promise<number> {
  let buf = new Int8Array(256);
  let ocl = new Int8Array(19);
  G.flags.pickup = (!G.flags.pickup ? 1 : 0) << 24 >> 24;
  if (G.flags.pickup) {
    await oc_to_str(P(G.flags.pickup_types), P(ocl));
    sprintf(P(buf), S("ON, for %s objects%s"), ocl[0] ? P(ocl) : S("all"), G.apelist ? count_apes() === 1 ? S(", with one exception") : S(", with some exceptions") : S(""));
  } else {
    strcpy(P(buf), S("OFF"));
  }
  await pline(S("Autopickup: %s."), P(buf));
  return 0;
}

export async function add_autopickup_exception(mapping: Ptr | null): Promise<number> {
  let ape = null;
  let text = new Int8Array(256);
  const end = new Int8Array(1);
  let n = 0;
  let grab = FALSE;
  end[0] = 0;
  if ((n = sscanf(mapping, S("\"<%253[^\"]\" %c"), P(text), P(end, 0))) === 1 || n === 2 && end[0] === 35) {
    grab = TRUE;
  } else if ((n = sscanf(mapping, S("\">%253[^\"]\" %c"), P(text), P(end, 0))) === 1 || (n = sscanf(mapping, S("\"%253[^\"]\" %c"), P(text), P(end, 0))) === 1 || n === 2 && end[0] === 35) {
    grab = FALSE;
  } else {
    await config_error_add(S("%s"), P(add_autopickup_exception$APE_syntax_error));
    return 0;
  }
  ape = new struct_autopickup_exception();
  ape.regex = await regex_init();
  if (!regex_compile(P(text), ape.regex)) {
    await config_error_add(S("%s: %s"), P(add_autopickup_exception$APE_regex_error), regex_error_desc(ape.regex));
    regex_free(ape.regex);
    free(ape);
    return 0;
  }
  ape.pattern = await dupstr(P(text));
  ape.grab = grab;
  ape.next = G.apelist;
  G.apelist = ape;
  return 1;
}

function remove_autopickup_exception(whichape: struct_autopickup_exception | null): void {
  let ape = null;
  let freeape = null;
  let prev = null;
  for (ape = G.apelist; ape; ) {
    if (ape === whichape) {
      freeape = ape;
      ape = ape.next;
      if (prev) {
        prev.next = ape;
      } else {
        G.apelist = ape;
      }
      regex_free(freeape.regex);
      free(freeape.pattern);
      free(freeape);
    } else {
      prev = ape;
      ape = ape.next;
    }
  }
}

export function free_autopickup_exceptions(): void {
  let ape = G.apelist;
  while (!!(ape = G.apelist)) {
    regex_free(ape.regex);
    free(ape.pattern);
    G.apelist = ape.next;
    free(ape);
  }
}

export async function load_symset(s: Ptr | null, which_set: number): Promise<number> {
  clear_symsetentry(which_set, TRUE);
  if (G.symset[which_set].name) {
    free(G.symset[which_set].name);
  }
  G.symset[which_set].name = await dupstr(s);
  if (await read_sym_file(which_set)) {
    await switch_symbols(TRUE);
  } else {
    clear_symsetentry(which_set, TRUE);
    return 0;
  }
  return 1;
}

export function free_symsets(): void {
  clear_symsetentry(PRIMARY, TRUE);
  clear_symsetentry(ROGUESET, TRUE);
}

export function parsesymbols(opts: Ptr | null, which_set: number): number {
  let $t1: any, $t2: any;
  let val = 0;
  let op = null;
  let symname = null;
  let strval = null;
  let symp = null;
  if (!!(op = strchr(opts, 44))) {
    $wr(($t1 = op, op = $t1.add(1), $t1), 0, 0);
    if (!parsesymbols(op, which_set)) {
      return FALSE;
    }
  }
  symname = opts;
  strval = strchr(opts, 58);
  if (!strval) {
    strval = strchr(opts, 61);
  }
  if (!strval) {
    return FALSE;
  }
  $wr(($t2 = strval, strval = $t2.add(1), $t2), 0, 0);
  mungspaces(symname);
  mungspaces(strval);
  symp = match_sym(symname);
  if (!symp) {
    return FALSE;
  }
  if (symp.range && symp.range !== SYM_CONTROL) {
    val = sym_val(strval);
    if (which_set === ROGUESET) {
      update_ov_rogue_symset(symp, val);
    } else {
      update_ov_primary_symset(symp, val);
    }
  }
  return TRUE;
}

export function match_sym(buf: Ptr | null): struct_symparse | null {
  let len = strlen(buf);
  let p = strchr(buf, 58);
  let q = strchr(buf, 61);
  let sp = G.loadsyms[0];
  if (!p || q && q.o < p.o) {
    p = q;
  }
  if (p) {
    if (p.o > buf.o && p.a[p.o + -1] === 32) {
      p = p.add(-1);
    }
    len = $u64(p.o - buf.o | 0);
  }
  while (sp.range) {
    if (len >= strlen(sp.name) && !strncmpi(buf, sp.name, len | 0)) {
      return sp;
    }
    sp = $sadd(sp, 1);
  }
  return null;
}

export function sym_val(strval: Ptr | null): number {
  let buf = new Int8Array(128);
  let tmp = new Int8Array(128);
  buf[0] = 0;
  if (!strval.a[strval.o] || !strval.a[strval.o + 1]) {
    if (!isspace(strval.a[strval.o] & 0xff)) {
      buf[0] = strval.a[strval.o];
    }
  } else if (strval.a[strval.o] === 39) {
    if (strval.a[strval.o + 2] === 39 && !strval.a[strval.o + 3]) {
      buf[0] = strval.a[strval.o + 1];
    } else if (strval.a[strval.o + 1] === 92 && strval.a[strval.o + 2] && strval.a[strval.o + 3] === 39 && strchr(S("'\"\\"), strval.a[strval.o + 2]) && !strval.a[strval.o + 4]) {
      buf[0] = strval.a[strval.o + 2];
    } else {
      let p = null;
      strncpy(P(tmp), strval.add(1), 128 - 1);
      tmp[128 - 1] = 0;
      if (!!(p = strrchr(P(tmp), 39))) {
        p.a[p.o] = 0;
        escapes(P(tmp), P(buf));
      }
    }
  } else {
    strncpy(P(tmp), strval, 128 - 1);
    tmp[128 - 1] = 0;
    escapes(P(tmp), P(buf));
  }
  return $rd(P(buf));
}

export async function option_help(): Promise<void> {
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let i = 0;
  let datawin = 0;
  datawin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  sprintf(P(buf), S("Set options as OPTIONS=<options> in %s"), P(G.configfile));
  opt_intro[CONFIG_SLOT] = P(buf);
  for (i = 0; opt_intro[i]; ++i) {
    await G.windowprocs.win_putstr(datawin, 0, opt_intro[i]);
  }
  for (i = 0; boolopt[i].name; ++i) {
    if (boolopt[i].addr) {
      if ($peq(boolopt[i].addr, P(G.iflags, "sanity_check")) && !G.flags.debug) {
        continue;
      }
      if ($peq(boolopt[i].addr, P(G.iflags, "menu_tab_sep")) && !G.flags.debug) {
        continue;
      }
      await next_opt(datawin, boolopt[i].name);
    }
  }
  await next_opt(datawin, S(""));
  await G.windowprocs.win_putstr(datawin, 0, S("Compound options:"));
  for (i = 0; compopt[i].name; ++i) {
    sprintf(P(buf2), S("`%s'"), compopt[i].name);
    sprintf(P(buf), S("%-20s - %s%c"), P(buf2), compopt[i].descr, compopt[i + 1].name ? 44 : 46);
    await G.windowprocs.win_putstr(datawin, 0, P(buf));
  }
  for (i = 0; opt_epilog[i]; ++i) {
    await G.windowprocs.win_putstr(datawin, 0, opt_epilog[i]);
  }
  await G.windowprocs.win_display_nhwindow(datawin, FALSE);
  await G.windowprocs.win_destroy_nhwindow(datawin);
  return;
}

export async function next_opt(datawin: number, str: Ptr | null): Promise<void> {
  let i = 0;
  let s = null;
  if (!next_opt$buf) {
    $wr((next_opt$buf = P(new Int8Array(BUFSZ))), 0, 0);
  }
  if (!str.a[str.o]) {
    s = eos(next_opt$buf);
    if (s.o > next_opt$buf.add(1).o && s.a[s.o + -2] === 44) {
      strcpy(s.add(-2), S("."));
    }
    i = COLNO;
  } else {
    i = strlen(next_opt$buf) + strlen(str) + 2 | 0;
  }
  if (i > COLNO - 2) {
    await G.windowprocs.win_putstr(datawin, 0, next_opt$buf);
    next_opt$buf.a[next_opt$buf.o] = 0;
  }
  if (str.a[str.o]) {
    strcat(next_opt$buf, str);
    strcat(next_opt$buf, S(", "));
  } else {
    await G.windowprocs.win_putstr(datawin, 0, str);
    free(next_opt$buf), next_opt$buf = null;
  }
  return;
}

export async function fruitadd(str: Ptr | null, replace_fruit: struct_fruit | null): Promise<number> {
  let $g = 0;
  let i = 0;
  let f = null;
  let highest_fruit_id = new Int32Array(1);
  let globpfx = 0;
  let buf = new Int8Array(32);
  let altname = new Int8Array(32);
  let user_specified = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      highest_fruit_id[0] = 0;
      buf = new Int8Array(32);
      altname = new Int8Array(32);
      user_specified = ($peq(str, P(G.pl_fruit)) ? 1 : 0) << 24 >> 24;
      if (user_specified) {
        let found = FALSE;
        let numeric = FALSE;
        nmcpy(P(G.pl_fruit), await makesingular(str), PL_FSIZ);
        globpfx = !strncmp(P(G.pl_fruit), S("small "), 6) || !strncmp(P(G.pl_fruit), S("large "), 6) ? 6 : !strncmp(P(G.pl_fruit), S("very large "), 11) ? 11 : 0;
        for (i = G.bases[FOOD_CLASS]; G.objects[i].oc_class === FOOD_CLASS; ++i) {
          if (!strcmp(G.obj_descr[G.objects[i].oc_name_idx].oc_name, P(G.pl_fruit)) || globpfx > 0 && !strcmp(G.obj_descr[G.objects[i].oc_name_idx].oc_name, P(G.pl_fruit, globpfx))) {
            found = TRUE;
            break;
          }
        }
        if (!found) {
          let c = null;
          for (c = P(G.pl_fruit); c.a[c.o] >= 48 && c.a[c.o] <= 57; c = c.add(1)) {
            continue;
          }
          if (!c.a[c.o] || isspace(c.a[c.o] & 0xff)) {
            numeric = TRUE;
          }
        }
        if (found || numeric || !strncmp(P(G.pl_fruit), S("cursed "), 7) || !strncmp(P(G.pl_fruit), S("uncursed "), 9) || !strncmp(P(G.pl_fruit), S("blessed "), 8) || !strncmp(P(G.pl_fruit), S("partly eaten "), 13) || !strncmp(P(G.pl_fruit), S("tin of "), 7) && (!strcmp(P(G.pl_fruit).add(7), S("spinach")) || name_to_mon(P(G.pl_fruit).add(7)) >= LOW_PM) || !strcmp(P(G.pl_fruit), S("empty tin")) || (!strcmp(P(G.pl_fruit), S("glob")) || globpfx > 0 && !strcmp(S("glob"), P(G.pl_fruit, globpfx))) || (str_end_is(P(G.pl_fruit), S(" corpse")) || str_end_is(P(G.pl_fruit), S(" egg"))) && name_to_mon(P(G.pl_fruit)) >= LOW_PM) {
          strcpy(P(buf), P(G.pl_fruit));
          strcpy(P(G.pl_fruit), S("candied "));
          nmcpy(P(G.pl_fruit).add(8), P(buf), PL_FSIZ - 8);
        }
        $wr(P(altname), 0, 0);
        G.flags.made_fruit = FALSE;
        if (replace_fruit) {
          f = replace_fruit;
          copynchars(P(f.fname), P(G.pl_fruit), PL_FSIZ - 1);
          { $g = 1; continue $L; }
        }
      } else {
        copynchars(P(altname), str, PL_FSIZ - 1);
        sanitize_name(P(altname));
        G.flags.made_fruit = TRUE;
      }
      f = await fruit_from_name($rd(P(altname)) ? P(altname) : str, FALSE, P(highest_fruit_id, 0));
      if (f) {
        { $g = 1; continue $L; }
      }
      if (highest_fruit_id[0] >= 127) {
        return rnd(127);
      }
      f = new struct_fruit();
      memset(f, 0, 48);
      copynchars(P(f.fname), $rd(P(altname)) ? P(altname) : str, PL_FSIZ - 1);
      f.fid = ++highest_fruit_id[0];
      f.nextf = G.ffruit;
      G.ffruit = f;
    case 1: // nonew
      if (user_specified) {
        G.context.current_fruit = f.fid;
      }
      return f.fid;
    }
    break;
  }
}

export async function choose_classes_menu(prompt: Ptr | null, category: number, way: number, class_list: Ptr | null, class_select: Ptr | null): Promise<number> {
  let $t1: any;
  const pick_list = [null];
  pick_list[0] = null;
  let win = 0;
  let any = new union_any();
  let buf = new Int8Array(256);
  let i = 0;
  let n = 0;
  let ret = 0;
  let next_accelerator = 0;
  let accelerator = 0;
  if (!class_list || !class_select) {
    return 0;
  }
  accelerator = 0;
  next_accelerator = 97;
  any.$cp(G.zeroany);
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  while (class_list.a[class_list.o]) {
    let text = null;
    let selected = 0;
    text = null;
    selected = FALSE;
    switch (category) {
    case 0:
      text = G.def_monsyms[def_char_to_monclass(class_list.a[class_list.o])].explain;
      accelerator = class_list.a[class_list.o];
      sprintf(P(buf), S("%s"), text);
      break;
    case 1:
      text = G.def_oc_syms[def_char_to_objclass(class_list.a[class_list.o])].explain;
      accelerator = next_accelerator;
      sprintf(P(buf), S("%c  %s"), class_list.a[class_list.o], text);
      break;
    default:
      await impossible(S("choose_classes_menu: invalid category %d"), category);
    }
    if (way && class_select.a[class_select.o]) {
      if (strchr(class_select, class_list.a[class_list.o])) {
        selected = TRUE;
      }
    }
    any.a_int = class_list.a[class_list.o];
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, accelerator, category ? class_list.a[class_list.o] : 0, ATR_NONE, P(buf), selected);
    class_list = class_list.add(1);
    if (category > 0) {
      ++next_accelerator;
      if (next_accelerator === 122 + 1) {
        next_accelerator = 65;
      }
      if (next_accelerator === 90 + 1) {
        break;
      }
    }
  }
  if (category === 1 && next_accelerator <= 122) {
    any.$cp(G.zeroany);
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
    any.a_int = 32;
    sprintf(P(buf), S("%c  %s"), any.a_int << 24 >> 24, S("all classes of objects"));
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 65, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(win, prompt);
  n = await G.windowprocs.win_select_menu(win, way ? PICK_ANY : PICK_ONE, P(pick_list, 0));
  await G.windowprocs.win_destroy_nhwindow(win);
  if (n > 0) {
    if (category === 1) {
      for (i = 0; i < n; ++i) {
        if ($sadd(pick_list[0], i).item.a_int === 32) {
          pick_list[0].item.a_int = 32;
          n = 1;
        }
      }
    }
    for (i = 0; i < n; ++i) {
      $wr(($t1 = class_select, class_select = $t1.add(1), $t1), 0, $sadd(pick_list[0], i).item.a_int << 24 >> 24);
    }
    free(pick_list[0]);
    ret = n;
  } else if (n === -1) {
    class_select = eos(class_select);
    ret = -1;
  } else {
    ret = 0;
  }
  class_select.a[class_select.o] = 0;
  return ret;
}

export async function set_option_mod_status(optnam: Ptr | null, status: number): Promise<void> {
  let k = 0;
  if (status < 0 || status > 5) {
    await impossible(S("set_option_mod_status: status out of range %d."), status);
    return;
  }
  for (k = 0; boolopt[k].name; ++k) {
    if (!strncmpi(boolopt[k].name, optnam, strlen(optnam) | 0)) {
      boolopt[k].optflags = status;
      return;
    }
  }
  for (k = 0; compopt[k].name; ++k) {
    if (!strncmpi(compopt[k].name, optnam, strlen(optnam) | 0)) {
      compopt[k].optflags = status;
      return;
    }
  }
}

export async function set_wc_option_mod_status(optmask: number, status: number): Promise<void> {
  let k = 0;
  if (status < 0 || status > 5) {
    await impossible(S("set_wc_option_mod_status: status out of range %d."), status);
    return;
  }
  while (wc_options[k].wc_name) {
    if ((optmask & wc_options[k].wc_bit) >>> 0) {
      await set_option_mod_status(wc_options[k].wc_name, status);
    }
    ++k;
  }
}

function is_wc_option(optnam: Ptr | null): number {
  let k = 0;
  while (wc_options[k].wc_name) {
    if (strcmp(wc_options[k].wc_name, optnam) === 0) {
      return TRUE;
    }
    ++k;
  }
  return FALSE;
}

function wc_supported(optnam: Ptr | null): number {
  let k = 0;
  for (k = 0; wc_options[k].wc_name; ++k) {
    if (!strcmp(wc_options[k].wc_name, optnam)) {
      return ((G.windowprocs.wincap & wc_options[k].wc_bit) >>> 0 ? TRUE : FALSE) << 24 >> 24;
    }
  }
  return FALSE;
}

export async function set_wc2_option_mod_status(optmask: number, status: number): Promise<void> {
  let k = 0;
  if (status < 0 || status > 5) {
    await impossible(S("set_wc2_option_mod_status: status out of range %d."), status);
    return;
  }
  while (wc2_options[k].wc_name) {
    if ((optmask & wc2_options[k].wc_bit) >>> 0) {
      await set_option_mod_status(wc2_options[k].wc_name, status);
    }
    ++k;
  }
}

function is_wc2_option(optnam: Ptr | null): number {
  let k = 0;
  while (wc2_options[k].wc_name) {
    if (strcmp(wc2_options[k].wc_name, optnam) === 0) {
      return TRUE;
    }
    ++k;
  }
  return FALSE;
}

function wc2_supported(optnam: Ptr | null): number {
  let k = 0;
  for (k = 0; wc2_options[k].wc_name; ++k) {
    if (!strcmp(wc2_options[k].wc_name, optnam)) {
      return ((G.windowprocs.wincap2 & wc2_options[k].wc_bit) >>> 0 ? TRUE : FALSE) << 24 >> 24;
    }
  }
  return FALSE;
}

async function wc_set_font_name(opttype: number, fontname: Ptr | null): Promise<void> {
  let fn = null;
  if (!fontname) {
    return;
  }
  switch (opttype) {
  case MAP_OPTION:
    fn = P(G.iflags, "wc_font_map");
    break;
  case MESSAGE_OPTION:
    fn = P(G.iflags, "wc_font_message");
    break;
  case TEXT_OPTION:
    fn = P(G.iflags, "wc_font_text");
    break;
  case MENU_OPTION:
    fn = P(G.iflags, "wc_font_menu");
    break;
  case STATUS_OPTION:
    fn = P(G.iflags, "wc_font_status");
    break;
  default:
    return;
  }
  if (fn) {
    if (fn.a[fn.o]) {
      free(fn.a[fn.o]);
    }
    fn.a[fn.o] = await dupstr(fontname);
  }
  return;
}

async function wc_set_window_colors(op: Ptr | null): Promise<number> {
  let $t1: any;
  let j = 0;
  let buf = new Int8Array(256);
  let wn = null;
  let tfg = null;
  let tbg = null;
  let newop = null;
  strcpy(P(buf), op);
  newop = mungspaces(P(buf));
  while (newop && newop.a[newop.o]) {
    wn = tfg = tbg = null;
    if (newop.a[newop.o] === 32) {
      newop = newop.add(1);
    }
    if (newop.a[newop.o]) {
      wn = newop;
    } else {
      return 0;
    }
    while (newop.a[newop.o] && newop.a[newop.o] !== 32) {
      newop = newop.add(1);
    }
    if (newop.a[newop.o]) {
      newop.a[newop.o] = 0;
    } else {
      return 0;
    }
    newop = newop.add(1);
    if (newop.a[newop.o] === 32) {
      newop = newop.add(1);
    }
    if (newop.a[newop.o]) {
      tfg = newop;
    } else {
      return 0;
    }
    while (newop.a[newop.o] && newop.a[newop.o] !== 47) {
      newop = newop.add(1);
    }
    if (newop.a[newop.o]) {
      newop.a[newop.o] = 0;
    } else {
      return 0;
    }
    newop = newop.add(1);
    if (newop.a[newop.o] === 32) {
      newop = newop.add(1);
    }
    if (newop.a[newop.o]) {
      tbg = newop;
    } else {
      return 0;
    }
    while (newop.a[newop.o] && newop.a[newop.o] !== 32) {
      newop = newop.add(1);
    }
    if (newop.a[newop.o]) {
      $wr(($t1 = newop, newop = $t1.add(1), $t1), 0, 0);
    }
    for (j = 0; j < 4; ++j) {
      if (!strncmpi(wn, wc_set_window_colors$wnames[j], -1) || !strncmpi(wn, wc_set_window_colors$shortnames[j], -1)) {
        if (tfg && !strstri(tfg, S(" "))) {
          if ($rd(wc_set_window_colors$fgp[j])) {
            free($rd(wc_set_window_colors$fgp[j]));
          }
          $wr(wc_set_window_colors$fgp[j], 0, await dupstr(tfg));
        }
        if (tbg && !strstri(tbg, S(" "))) {
          if ($rd(wc_set_window_colors$bgp[j])) {
            free($rd(wc_set_window_colors$bgp[j]));
          }
          $wr(wc_set_window_colors$bgp[j], 0, await dupstr(tbg));
        }
        break;
      }
    }
  }
  return 1;
}

export function set_playmode(): void {
  if (G.flags.debug) {
    if (authorize_wizard_mode()) {
      strcpy(P(G.plname), S("wizard"));
    } else {
      G.flags.debug = FALSE;
    }
    G.flags.explore = (!G.flags.debug ? 1 : 0) << 24 >> 24;
    G.iflags.deferred_X = FALSE;
  }
}

export function $init(): void {
  empty_optstr = new Int8Array(1);
  boolopt = $sarrOf([struct_Bool_Opt.$of(S("acoustics"), P(G.flags, "acoustics"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("altmeta"), P(G.iflags, "altmeta"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("ascii_map"), P(G.iflags, "wc_ascii_map"), !0 ? 1 : 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("asksavedisk"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("autodescribe"), P(G.iflags, "autodescribe"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("autodig"), P(G.flags, "autodig"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("autoopen"), P(G.flags, "autoopen"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("autopickup"), P(G.flags, "pickup"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("autoquiver"), P(G.flags, "autoquiver"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("BIOS"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("blind"), P(G.u.uroleplay, "blind"), 0, DISP_IN_GAME),
struct_Bool_Opt.$of(S("bones"), P(G.flags, "bones"), 1, SET_IN_FILE),
struct_Bool_Opt.$of(S("checkpoint"), P(G.flags, "ins_chkpt"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("checkspace"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("clicklook"), P(G.iflags, "clicklook"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("cmdassist"), P(G.iflags, "cmdassist"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("color"), P(G.iflags, "wc_color"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("confirm"), P(G.flags, "confirm"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("dark_room"), P(G.flags, "dark_room"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("eight_bit_tty"), P(G.iflags, "wc_eight_bit_input"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("extmenu"), P(G.iflags, "extmenu"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("fast_map"), null, 1, SET_IN_FILE),
struct_Bool_Opt.$of(S("female"), P(G.flags, "female"), 0, DISP_IN_GAME),
struct_Bool_Opt.$of(S("fixinv"), P(G.flags, "invlet_constant"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("flush"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("force_invmenu"), P(G.iflags, "force_invmenu"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("fullscreen"), P(G.iflags, "wc2_fullscreen"), 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("goldX"), P(G.iflags, "goldX"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("guicolor"), P(G.iflags, "wc2_guicolor"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("help"), P(G.flags, "help"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("herecmd_menu"), P(G.iflags, "herecmd_menu"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("hilite_pet"), P(G.iflags, "wc_hilite_pet"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("hilite_pile"), P(G.iflags, "hilite_pile"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("hitpointbar"), P(G.iflags, "wc2_hitpointbar"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("ignintr"), P(G.flags, "ignintr"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("implicit_uncursed"), P(G.iflags, "implicit_uncursed"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("large_font"), P(G.iflags, "obsolete"), 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("legacy"), P(G.flags, "legacy"), 1, DISP_IN_GAME),
struct_Bool_Opt.$of(S("lit_corridor"), P(G.flags, "lit_corridor"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("lootabc"), P(G.flags, "lootabc"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("mail"), P(G.flags, "biff"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("mention_walls"), P(G.iflags, "mention_walls"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("menucolors"), P(G.iflags, "use_menu_color"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("menu_tab_sep"), P(G.iflags, "menu_tab_sep"), 0, SET_IN_WIZGAME),
struct_Bool_Opt.$of(S("menu_objsyms"), P(G.iflags, "menu_head_objsym"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("menu_overlay"), P(G.iflags, "menu_overlay"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("monpolycontrol"), P(G.iflags, "mon_polycontrol"), 0, SET_IN_WIZGAME),
struct_Bool_Opt.$of(S("news"), P(G.iflags, "news"), 1, DISP_IN_GAME),
struct_Bool_Opt.$of(S("nudist"), P(G.u.uroleplay, "nudist"), 0, DISP_IN_GAME),
struct_Bool_Opt.$of(S("null"), P(G.flags, "null"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("page_wait"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("perm_invent"), P(G.iflags, "perm_invent"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("pickup_thrown"), P(G.flags, "pickup_thrown"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("popup_dialog"), P(G.iflags, "wc_popup_dialog"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("preload_tiles"), P(G.iflags, "wc_preload_tiles"), 1, DISP_IN_GAME),
struct_Bool_Opt.$of(S("pushweapon"), P(G.flags, "pushweapon"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("rawio"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("rest_on_space"), P(G.flags, "rest_on_space"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("safe_pet"), P(G.flags, "safe_dog"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("sanity_check"), P(G.iflags, "sanity_check"), 0, SET_IN_WIZGAME),
struct_Bool_Opt.$of(S("selectsaved"), P(G.iflags, "wc2_selectsaved"), 1, DISP_IN_GAME),
struct_Bool_Opt.$of(S("showexp"), P(G.flags, "showexp"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("showrace"), P(G.flags, "showrace"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("showscore"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("silent"), P(G.flags, "silent"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("softkeyboard"), P(G.iflags, "wc2_softkeyboard"), 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("sortpack"), P(G.flags, "sortpack"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("sparkle"), P(G.flags, "sparkle"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("splash_screen"), P(G.iflags, "wc_splash_screen"), 1, DISP_IN_GAME),
struct_Bool_Opt.$of(S("standout"), P(G.flags, "standout"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("status_updates"), P(G.iflags, "status_updates"), 1, DISP_IN_GAME),
struct_Bool_Opt.$of(S("tiled_map"), P(G.iflags, "wc_tiled_map"), 0, DISP_IN_GAME),
struct_Bool_Opt.$of(S("time"), P(G.flags, "time"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("timed_delay"), P(G.flags, "nap"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("tombstone"), P(G.flags, "tombstone"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("toptenwin"), P(G.iflags, "toptenwin"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("travel"), P(G.flags, "travelcmd"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("travel_debug"), P(G.iflags, "trav_debug"), 0, SET_IN_WIZGAME),
struct_Bool_Opt.$of(S("use_darkgray"), P(G.iflags, "wc2_darkgray"), 1, SET_IN_FILE),
struct_Bool_Opt.$of(S("use_inverse"), P(G.iflags, "wc_inverse"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("verbose"), P(G.flags, "verbose"), 1, SET_IN_GAME),
struct_Bool_Opt.$of(S("vt_tiledata"), null, 0, SET_IN_FILE),
struct_Bool_Opt.$of(S("whatis_menu"), P(G.iflags, "getloc_usemenu"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("whatis_moveskip"), P(G.iflags, "getloc_moveskip"), 0, SET_IN_GAME),
struct_Bool_Opt.$of(S("wizweight"), P(G.iflags, "wizweight"), 0, SET_IN_WIZGAME),
struct_Bool_Opt.$of(S("wraptext"), P(G.iflags, "wc2_wraptext"), 0, SET_IN_GAME),
struct_Bool_Opt.$of()]);
  compopt = $sarrOf([struct_Comp_Opt.$of(S("align"), S("your starting alignment (lawful, neutral, or chaotic)"), 8, DISP_IN_GAME),
struct_Comp_Opt.$of(S("align_message"), S("message window alignment"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("align_status"), S("status window alignment"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("altkeyhandler"), S("alternate key handler"), 20, SET_IN_GAME),
struct_Comp_Opt.$of(S("boulder"), S("deprecated (use S_boulder in sym file instead)"), 1, SET_IN_GAME),
struct_Comp_Opt.$of(S("catname"), S("the name of your (first) cat (e.g., catname:Tabby)"), PL_PSIZ, DISP_IN_GAME),
struct_Comp_Opt.$of(S("disclose"), S("the kinds of information to disclose at end of game"), 7 * 2, SET_IN_GAME),
struct_Comp_Opt.$of(S("dogname"), S("the name of your (first) dog (e.g., dogname:Fang)"), PL_PSIZ, DISP_IN_GAME),
struct_Comp_Opt.$of(S("dungeon"), S("the symbols to use in drawing the dungeon map"), MAXDCHARS + 1, SET_IN_FILE),
struct_Comp_Opt.$of(S("effects"), S("the symbols to use in drawing special effects"), MAXECHARS + 1, SET_IN_FILE),
struct_Comp_Opt.$of(S("font_map"), S("the font to use in the map window"), 40, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_menu"), S("the font to use in menus"), 40, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_message"), S("the font to use in the message window"), 40, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_size_map"), S("the size of the map font"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_size_menu"), S("the size of the menu font"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_size_message"), S("the size of the message font"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_size_status"), S("the size of the status font"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_size_text"), S("the size of the text font"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_status"), S("the font to use in status window"), 40, DISP_IN_GAME),
struct_Comp_Opt.$of(S("font_text"), S("the font to use in text windows"), 40, DISP_IN_GAME),
struct_Comp_Opt.$of(S("fruit"), S("the name of a fruit you enjoy eating"), PL_FSIZ, SET_IN_GAME),
struct_Comp_Opt.$of(S("gender"), S("your starting gender (male or female)"), 8, DISP_IN_GAME),
struct_Comp_Opt.$of(S("horsename"), S("the name of your (first) horse (e.g., horsename:Silver)"), PL_PSIZ, DISP_IN_GAME),
struct_Comp_Opt.$of(S("map_mode"), S("map display mode under Windows"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("menustyle"), S("user interface for object selection"), 13, SET_IN_GAME),
struct_Comp_Opt.$of(S("menu_deselect_all"), S("deselect all items in a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_deselect_page"), S("deselect all items on this page of a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_first_page"), S("jump to the first page in a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_headings"), S("text attribute for menu headings"), 9, SET_IN_GAME),
struct_Comp_Opt.$of(S("menu_invert_all"), S("invert all items in a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_invert_page"), S("invert all items on this page of a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_last_page"), S("jump to the last page in a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_next_page"), S("goto the next menu page"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_previous_page"), S("goto the previous menu page"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_search"), S("search for a menu item"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_select_all"), S("select all items in a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("menu_select_page"), S("select all items on this page of a menu"), 4, SET_IN_FILE),
struct_Comp_Opt.$of(S("monsters"), S("the symbols to use for monsters"), MAXMCLASSES, SET_IN_FILE),
struct_Comp_Opt.$of(S("msghistory"), S("number of top line messages to save"), 5, DISP_IN_GAME),
struct_Comp_Opt.$of(S("msg_window"), S("the type of message window required"), 1, SET_IN_GAME),
struct_Comp_Opt.$of(S("name"), S("your character's name (e.g., name:Merlin-W)"), PL_NSIZ, DISP_IN_GAME),
struct_Comp_Opt.$of(S("mouse_support"), S("game receives click info from mouse"), 0, SET_IN_GAME),
struct_Comp_Opt.$of(S("number_pad"), S("use the number pad for movement"), 1, SET_IN_GAME),
struct_Comp_Opt.$of(S("objects"), S("the symbols to use for objects"), MAXOCLASSES, SET_IN_FILE),
struct_Comp_Opt.$of(S("packorder"), S("the inventory order of the items in your pack"), MAXOCLASSES, SET_IN_GAME),
struct_Comp_Opt.$of(S("paranoid_confirmation"), S("extra prompting in certain situations"), 28, SET_IN_GAME),
struct_Comp_Opt.$of(S("petattr"), S("attributes for highlighting pets"), 88, SET_IN_GAME),
struct_Comp_Opt.$of(S("pettype"), S("your preferred initial pet type"), 4, DISP_IN_GAME),
struct_Comp_Opt.$of(S("pickup_burden"), S("maximum burden picked up before prompt"), 20, SET_IN_GAME),
struct_Comp_Opt.$of(S("pickup_types"), S("types of objects to pick up automatically"), MAXOCLASSES, SET_IN_GAME),
struct_Comp_Opt.$of(S("pile_limit"), S("threshold for \"there are many objects here\""), 24, SET_IN_GAME),
struct_Comp_Opt.$of(S("playmode"), S("normal play, non-scoring explore mode, or debug mode"), 8, DISP_IN_GAME),
struct_Comp_Opt.$of(S("player_selection"), S("choose character via dialog or prompts"), 12, DISP_IN_GAME),
struct_Comp_Opt.$of(S("race"), S("your starting race (e.g., Human, Elf)"), PL_CSIZ, DISP_IN_GAME),
struct_Comp_Opt.$of(S("role"), S("your starting role (e.g., Barbarian, Valkyrie)"), PL_CSIZ, DISP_IN_GAME),
struct_Comp_Opt.$of(S("runmode"), S("display frequency when `running' or `travelling'"), 9, SET_IN_GAME),
struct_Comp_Opt.$of(S("scores"), S("the parts of the score list you wish to see"), 32, SET_IN_GAME),
struct_Comp_Opt.$of(S("scroll_amount"), S("amount to scroll map when scroll_margin is reached"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("scroll_margin"), S("scroll map when this far from the edge"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("sortloot"), S("sort object selection lists by description"), 4, SET_IN_GAME),
struct_Comp_Opt.$of(S("statushilites"), S("0=no status highlighting, N=show highlights for N turns"), 20, SET_IN_GAME),
struct_Comp_Opt.$of(S("statuslines"), S("2 or 3 lines for status display"), 20, SET_IN_FILE),
struct_Comp_Opt.$of(S("symset"), S("load a set of display symbols from the symbols file"), 70, SET_IN_GAME),
struct_Comp_Opt.$of(S("roguesymset"), S("load a set of rogue display symbols from the symbols file"), 70, SET_IN_GAME),
struct_Comp_Opt.$of(S("suppress_alert"), S("suppress alerts about version-specific features"), 8, SET_IN_GAME),
struct_Comp_Opt.$of(S("term_cols"), S("number of columns"), 6, SET_IN_FILE),
struct_Comp_Opt.$of(S("term_rows"), S("number of rows"), 6, SET_IN_FILE),
struct_Comp_Opt.$of(S("tile_width"), S("width of tiles"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("tile_height"), S("height of tiles"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("tile_file"), S("name of tile file"), 70, DISP_IN_GAME),
struct_Comp_Opt.$of(S("traps"), S("the symbols to use in drawing traps"), MAXTCHARS + 1, SET_IN_FILE),
struct_Comp_Opt.$of(S("vary_msgcount"), S("show more old messages at a time"), 20, DISP_IN_GAME),
struct_Comp_Opt.$of(S("whatis_coord"), S("show coordinates when auto-describing cursor position"), 1, SET_IN_GAME),
struct_Comp_Opt.$of(S("whatis_filter"), S("filter coordinate locations when targeting next or previous"), 1, SET_IN_GAME),
struct_Comp_Opt.$of(S("windowborders"), S("0 (off), 1 (on), 2 (auto)"), 9, SET_IN_GAME),
struct_Comp_Opt.$of(S("windowcolors"), S("the foreground/background colors of windows"), 80, DISP_IN_GAME),
struct_Comp_Opt.$of(S("windowtype"), S("windowing system to use"), WINTYPELEN, DISP_IN_GAME),
struct_Comp_Opt.$of(S("DECgraphics"), S("load DECGraphics display symbols"), 70, SET_IN_FILE),
struct_Comp_Opt.$of(S("IBMgraphics"), S("load IBMGraphics display symbols"), 70, SET_IN_FILE),
struct_Comp_Opt.$of()]);
  need_redraw = 0;
  def_inv_order = $ta(Int8Array, 18, [COIN_CLASS, AMULET_CLASS, WEAPON_CLASS, ARMOR_CLASS, FOOD_CLASS, SCROLL_CLASS, SPBOOK_CLASS, POTION_CLASS, RING_CLASS, WAND_CLASS, TOOL_CLASS, GEM_CLASS, ROCK_CLASS, BALL_CLASS, CHAIN_CLASS]);
  default_menu_cmd_info = $sarrOf([struct_menu_cmd_t.$of(S("menu_first_page"), MENU_FIRST_PAGE, S("Go to first page")),
struct_menu_cmd_t.$of(S("menu_last_page"), MENU_LAST_PAGE, S("Go to last page")),
struct_menu_cmd_t.$of(S("menu_next_page"), MENU_NEXT_PAGE, S("Go to next page")),
struct_menu_cmd_t.$of(S("menu_previous_page"), MENU_PREVIOUS_PAGE, S("Go to previous page")),
struct_menu_cmd_t.$of(S("menu_select_all"), MENU_SELECT_ALL, S("Select all items")),
struct_menu_cmd_t.$of(S("menu_deselect_all"), MENU_UNSELECT_ALL, S("Unselect all items")),
struct_menu_cmd_t.$of(S("menu_invert_all"), MENU_INVERT_ALL, S("Invert selection")),
struct_menu_cmd_t.$of(S("menu_select_page"), MENU_SELECT_PAGE, S("Select items in current page")),
struct_menu_cmd_t.$of(S("menu_deselect_page"), MENU_UNSELECT_PAGE, S("Unselect items in current page")),
struct_menu_cmd_t.$of(S("menu_invert_page"), MENU_INVERT_PAGE, S("Invert current page selection")),
struct_menu_cmd_t.$of(S("menu_search"), MENU_SEARCH, S("Search and toggle matching items"))]);
  G.mapped_menu_cmds = new Int8Array(33);
  mapped_menu_op = new Int8Array(33);
  n_menu_mapped = 0;
  initial = 0;
  from_file = 0;
  paranoia = $sarrOf([struct_paranoia_opts.$of(PARANOID_CONFIRM, S("Confirm"), 1, S("Paranoia"), 2, S("for \"yes\" confirmations, require \"no\" to reject")),
struct_paranoia_opts.$of(PARANOID_QUIT, S("quit"), 1, S("explore"), 2, S("yes vs y to quit or to enter explore mode")),
struct_paranoia_opts.$of(PARANOID_DIE, S("die"), 1, S("death"), 2, S("yes vs y to die (explore mode or debug mode)")),
struct_paranoia_opts.$of(PARANOID_BONES, S("bones"), 1, null, 0, S("yes vs y to save bones data when dying in debug mode")),
struct_paranoia_opts.$of(PARANOID_HIT, S("attack"), 1, S("hit"), 1, S("yes vs y to attack a peaceful monster")),
struct_paranoia_opts.$of(PARANOID_BREAKWAND, S("wand-break"), 2, S("break-wand"), 2, S("yes vs y to break a wand via (a)pply")),
struct_paranoia_opts.$of(PARANOID_EATING, S("eat"), 1, S("continue"), 4, S("yes vs y to continue eating after first bite when satiated")),
struct_paranoia_opts.$of(PARANOID_WERECHANGE, S("Were-change"), 2, null, 0, S("yes vs y to change form when lycanthropy is controllable")),
struct_paranoia_opts.$of(PARANOID_PRAY, S("pray"), 1, null, 0, S("y to pray (supersedes old \"prayconfirm\" option)")),
struct_paranoia_opts.$of(PARANOID_REMOVE, S("Remove"), 1, S("Takeoff"), 1, S("always pick from inventory for Remove and Takeoff")),
struct_paranoia_opts.$of(0, S("none"), 4),
struct_paranoia_opts.$of(~0, S("all"), 3)]);
  colornames = $sarrOf([anon_options_c_1349.$of(S("black"), CLR_BLACK),
anon_options_c_1349.$of(S("red"), CLR_RED),
anon_options_c_1349.$of(S("green"), CLR_GREEN),
anon_options_c_1349.$of(S("brown"), CLR_BROWN),
anon_options_c_1349.$of(S("blue"), CLR_BLUE),
anon_options_c_1349.$of(S("magenta"), CLR_MAGENTA),
anon_options_c_1349.$of(S("cyan"), CLR_CYAN),
anon_options_c_1349.$of(S("gray"), CLR_GRAY),
anon_options_c_1349.$of(S("orange"), CLR_ORANGE),
anon_options_c_1349.$of(S("light green"), CLR_BRIGHT_GREEN),
anon_options_c_1349.$of(S("yellow"), CLR_YELLOW),
anon_options_c_1349.$of(S("light blue"), CLR_BRIGHT_BLUE),
anon_options_c_1349.$of(S("light magenta"), CLR_BRIGHT_MAGENTA),
anon_options_c_1349.$of(S("light cyan"), CLR_BRIGHT_CYAN),
anon_options_c_1349.$of(S("white"), CLR_WHITE),
anon_options_c_1349.$of(S("no color"), NO_COLOR),
anon_options_c_1349.$of(null, CLR_BLACK),
anon_options_c_1349.$of(S("transparent"), NO_COLOR),
anon_options_c_1349.$of(S("purple"), CLR_MAGENTA),
anon_options_c_1349.$of(S("light purple"), CLR_BRIGHT_MAGENTA),
anon_options_c_1349.$of(S("bright purple"), CLR_BRIGHT_MAGENTA),
anon_options_c_1349.$of(S("grey"), CLR_GRAY),
anon_options_c_1349.$of(S("bright red"), CLR_ORANGE),
anon_options_c_1349.$of(S("bright green"), CLR_BRIGHT_GREEN),
anon_options_c_1349.$of(S("bright blue"), CLR_BRIGHT_BLUE),
anon_options_c_1349.$of(S("bright magenta"), CLR_BRIGHT_MAGENTA),
anon_options_c_1349.$of(S("bright cyan"), CLR_BRIGHT_CYAN)]);
  attrnames = $sarrOf([anon_options_c_1382.$of(S("none"), ATR_NONE),
anon_options_c_1382.$of(S("bold"), ATR_BOLD),
anon_options_c_1382.$of(S("dim"), ATR_DIM),
anon_options_c_1382.$of(S("underline"), ATR_ULINE),
anon_options_c_1382.$of(S("blink"), ATR_BLINK),
anon_options_c_1382.$of(S("inverse"), ATR_INVERSE),
anon_options_c_1382.$of(null, ATR_NONE),
anon_options_c_1382.$of(S("normal"), ATR_NONE),
anon_options_c_1382.$of(S("uline"), ATR_ULINE),
anon_options_c_1382.$of(S("reverse"), ATR_INVERSE)]);
  msgtype_names = $sarrOf([anon_options_c_1589.$of(S("show"), MSGTYP_NORMAL, S("Show message normally")),
anon_options_c_1589.$of(S("hide"), MSGTYP_NOSHOW, S("Hide message")),
anon_options_c_1589.$of(S("noshow"), MSGTYP_NOSHOW),
anon_options_c_1589.$of(S("stop"), MSGTYP_STOP, S("Prompt for more after the message")),
anon_options_c_1589.$of(S("more"), MSGTYP_STOP),
anon_options_c_1589.$of(S("norep"), MSGTYP_NOREP, S("Do not repeat the message"))]);
  menutype = [S("traditional"),
S("combination"),
S("full"),
S("partial")];
  burdentype = [S("unencumbered"),
S("burdened"),
S("stressed"),
S("strained"),
S("overtaxed"),
S("overloaded")];
  runmodes = [S("teleport"),
S("run"),
S("walk"),
S("crawl")];
  sortltype = [S("none"), S("loot"), S("full")];
  fmtstr_doset = $cs("%s%-15s [%s]   ", 16);
  fmtstr_doset_tab = $cs("%s\t[%s]", 8);
  n_currently_set = $cs("(%d currently set)", 19);
  othropt = $sarrOf([struct_other_opts.$of(S("autopickup exceptions"), SET_IN_GAME, OPT_OTHER_APEXC, count_apes),
struct_other_opts.$of(S("menu colors"), SET_IN_GAME, OPT_OTHER_MENUCOLOR, count_menucolors),
struct_other_opts.$of(S("message types"), SET_IN_GAME, OPT_OTHER_MSGTYPE, msgtype_count),
struct_other_opts.$of(S("status hilite rules"), SET_IN_GAME, OPT_OTHER_STATHILITE, count_status_hilites),
struct_other_opts.$of()]);
  G.symset_list = null;
  opt_intro = [S(""),
S("                 NetHack Options Help:"),
S(""),
null,
S("or use `NETHACKOPTIONS=\"<options>\"' in your environment"),
S("(<options> is a list of options separated by commas)"),
S("or press \"O\" while playing and use the menu."),
S(""),
S("Boolean options (which can be negated by prefixing them with '!' or \"no\"):"),
null];
  opt_epilog = [S(""),
S("Some of the options can be set only before the game is started; those"),
S("items will not be selectable in the 'O' command's menu."),
null];
  wc_options = $sarrOf([struct_wc_Opt.$of(S("ascii_map"), WC_ASCII_MAP),
struct_wc_Opt.$of(S("color"), WC_COLOR),
struct_wc_Opt.$of(S("eight_bit_tty"), WC_EIGHT_BIT_IN),
struct_wc_Opt.$of(S("hilite_pet"), WC_HILITE_PET),
struct_wc_Opt.$of(S("popup_dialog"), WC_POPUP_DIALOG),
struct_wc_Opt.$of(S("player_selection"), WC_PLAYER_SELECTION),
struct_wc_Opt.$of(S("preload_tiles"), WC_PRELOAD_TILES),
struct_wc_Opt.$of(S("tiled_map"), WC_TILED_MAP),
struct_wc_Opt.$of(S("tile_file"), WC_TILE_FILE),
struct_wc_Opt.$of(S("tile_width"), WC_TILE_WIDTH),
struct_wc_Opt.$of(S("tile_height"), WC_TILE_HEIGHT),
struct_wc_Opt.$of(S("use_inverse"), WC_INVERSE),
struct_wc_Opt.$of(S("align_message"), WC_ALIGN_MESSAGE),
struct_wc_Opt.$of(S("align_status"), WC_ALIGN_STATUS),
struct_wc_Opt.$of(S("font_map"), WC_FONT_MAP),
struct_wc_Opt.$of(S("font_menu"), WC_FONT_MENU),
struct_wc_Opt.$of(S("font_message"), WC_FONT_MESSAGE),
struct_wc_Opt.$of(S("font_size_map"), WC_FONTSIZ_MAP),
struct_wc_Opt.$of(S("font_size_menu"), WC_FONTSIZ_MENU),
struct_wc_Opt.$of(S("font_size_message"), WC_FONTSIZ_MESSAGE),
struct_wc_Opt.$of(S("font_size_status"), WC_FONTSIZ_STATUS),
struct_wc_Opt.$of(S("font_size_text"), WC_FONTSIZ_TEXT),
struct_wc_Opt.$of(S("font_status"), WC_FONT_STATUS),
struct_wc_Opt.$of(S("font_text"), WC_FONT_TEXT),
struct_wc_Opt.$of(S("map_mode"), WC_MAP_MODE),
struct_wc_Opt.$of(S("scroll_amount"), WC_SCROLL_AMOUNT),
struct_wc_Opt.$of(S("scroll_margin"), WC_SCROLL_MARGIN),
struct_wc_Opt.$of(S("splash_screen"), WC_SPLASH_SCREEN),
struct_wc_Opt.$of(S("vary_msgcount"), WC_VARY_MSGCOUNT),
struct_wc_Opt.$of(S("windowcolors"), WC_WINDOWCOLORS),
struct_wc_Opt.$of(S("mouse_support"), WC_MOUSE_SUPPORT),
struct_wc_Opt.$of()]);
  wc2_options = $sarrOf([struct_wc_Opt.$of(S("fullscreen"), WC2_FULLSCREEN),
struct_wc_Opt.$of(S("softkeyboard"), WC2_SOFTKEYBOARD),
struct_wc_Opt.$of(S("wraptext"), WC2_WRAPTEXT),
struct_wc_Opt.$of(S("use_darkgray"), WC2_DARKGRAY),
struct_wc_Opt.$of(S("hitpointbar"), WC2_HITPOINTBAR),
struct_wc_Opt.$of(S("hilite_status"), WC2_HILITE_STATUS),
struct_wc_Opt.$of(S("status hilite rules"), WC2_HILITE_STATUS),
struct_wc_Opt.$of(S("statushilites"), WC2_HILITE_STATUS),
struct_wc_Opt.$of(S("term_cols"), WC2_TERM_SIZE),
struct_wc_Opt.$of(S("term_rows"), WC2_TERM_SIZE),
struct_wc_Opt.$of(S("petattr"), WC2_PETATTR),
struct_wc_Opt.$of(S("guicolor"), WC2_GUICOLOR),
struct_wc_Opt.$of(S("statuslines"), WC2_STATUSLINES),
struct_wc_Opt.$of(S("windowborders"), WC2_WINDOWBORDERS),
struct_wc_Opt.$of()]);
  escapes$oct = $cs("01234567", 9);
  escapes$dec = $cs("0123456789", 11);
  escapes$hex = $cs("00112233445566778899aAbBcCdDeEfF", 33);
  msgtype_add$re_error = S("MSGTYPE regex error");
  test_regex_pattern$re_error = $cs("Regex error", 12);
  add_menu_coloring_parsed$re_error = $cs("Menucolor regex error", 22);
  parseoptions$gpcoords = $ta(Int8Array, 6, [GPCOORDS_NONE, GPCOORDS_COMPASS, GPCOORDS_COMFULL, GPCOORDS_MAP, GPCOORDS_SCREEN]);
  parseoptions$valid_settings = $ta(Int8Array, 7, [DISCLOSE_PROMPT_DEFAULT_YES, DISCLOSE_PROMPT_DEFAULT_NO, DISCLOSE_PROMPT_DEFAULT_SPECIAL, DISCLOSE_YES_WITHOUT_PROMPT, DISCLOSE_NO_WITHOUT_PROMPT, DISCLOSE_SPECIAL_WITHOUT_PROMPT]);
  doset$made_fmtstr = 0;
  handle_add_list_remove$action_titles = $sarrOf([struct_action.$of(97, S("add new %s")),
struct_action.$of(108, S("list %s")),
struct_action.$of(114, S("remove existing %s")),
struct_action.$of(120, S("exit this menu"))]);
  special_handling$disclosure_names = [S("inventory"),
S("attributes"),
S("vanquished"),
S("genocides"),
S("conduct"),
S("overview")];
  special_handling$npchoices = [S(" 0 (off)"),
S(" 1 (on)"),
S(" 2 (on, MSDOS compatible)"),
S(" 3 (on, phone-style digit layout)"),
S(" 4 (on, phone-style layout, MSDOS compatible)"),
S("-1 (off, 'z' to move upper-left, 'y' to zap wands)")];
  get_compopt_value$none = $cs("(none)", 7);
  get_compopt_value$randomrole = $cs("random", 7);
  get_compopt_value$to_be_done = $cs("(to be done)", 13);
  get_compopt_value$defopt = $cs("default", 8);
  get_compopt_value$defbrief = $cs("def", 4);
  get_compopt_value$mousemodes = [[S("0=off"), S("")], [S("1=on"), S(", O/S adjusted")], [S("2=on"), S(", O/S unchanged")]];
  get_compopt_value$numpadmodes = [S("0=off"),
S("1=on"),
S("2=on, MSDOS compatible"),
S("3=on, phone-style layout"),
S("4=on, phone layout, MSDOS compatible"),
S("-1=off, y & z swapped")];
  add_autopickup_exception$APE_regex_error = $cs("regex error in AUTOPICKUP_EXCEPTION", 36);
  add_autopickup_exception$APE_syntax_error = $cs("syntax error in AUTOPICKUP_EXCEPTION", 37);
  next_opt$buf = null;
  wc_set_window_colors$wnames = [S("menu"),
S("message"),
S("status"),
S("text")];
  wc_set_window_colors$shortnames = [S("mnu"),
S("msg"),
S("sts"),
S("txt")];
  wc_set_window_colors$fgp = [P(G.iflags, "wc_foregrnd_menu"),
P(G.iflags, "wc_foregrnd_message"),
P(G.iflags, "wc_foregrnd_status"),
P(G.iflags, "wc_foregrnd_text")];
  wc_set_window_colors$bgp = [P(G.iflags, "wc_backgrnd_menu"),
P(G.iflags, "wc_backgrnd_message"),
P(G.iflags, "wc_backgrnd_status"),
P(G.iflags, "wc_backgrnd_text")];
}
