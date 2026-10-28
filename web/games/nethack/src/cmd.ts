// @ts-nocheck
// NetHack 3.6.7 cmd.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { doapply, dojump, dorub, reset_trapset, use_unicorn_horn } from './apply.ts';
import { defends, doinvoke } from './artifact.ts';
import { acurr, from_what, stone_luck } from './attrib.ts';
import { ballrelease, bc_sanity_check, placebc, unplacebc } from './ball.ts';
import { rank_of } from './botl.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { do_mapping, dosearch, findit, reveal_terrain } from './detect.ts';
import { wiz_debug_cmd_bury } from './dig.ts';
import { cls, docrt, doredraw, flush_screen, glyph_at, map_trap } from './display.ts';
import { doddrop, dodown, dodrop, donull, doup, dowipe, save_currentstate, u_collide_m } from './do.ts';
import { a_monnam, docallcmd, getpos, getpos_menu, mon_nam, x_monnam } from './do_name.ts';
import { doddoremarm, doputon, doremring, dotakeoff, dowear, fingers_or_gloves, reset_remarm, stuck_ring } from './do_wear.ts';
import { keepdogs, losedogs } from './dog.ts';
import { dokick } from './dokick.ts';
import { dofire, dothrow } from './dothrow.ts';
import { In_W_tower, In_quest, Invocation_lev, Is_special, On_W_tower_level, depth, donamelevel, dooverview, dunlev, endgamelevelname, ledger_no, on_level, overview_stats, print_dungeon, rm_mapseen, u_on_rndspot } from './dungeon.ts';
import { doeat } from './eat.ts';
import { done2, dovanquished, nh_terminate, num_genocides, panic } from './end.ts';
import { ceiling, doengrave, engr_stats, surface } from './engrave.ts';
import { losexp, newuexp, pluslvl } from './exper.ts';
import { clearlocks, debugcore, paniclog } from './files.ts';
import { dryup } from './fountain.ts';
import { check_special_room, domove, dopickup, may_dig, money_cnt, near_capacity, test_move } from './hack.ts';
import { copynchars, digit, dist2, eos, highc, lcase, letter, lowc, midnight, mungspaces, night, ordin, pmatchi, s_suffix, sgn, strncmpi, strstri, trimspaces, upstart, visctrl } from './hacklib.ts';
import { carrying, currency, ddoinv, display_inventory, dolook, doorganize, dopramulet, doprarm, doprgold, doprinuse, doprring, doprtool, doprwep, dotypeinv } from './invent.ts';
import { dosuspend } from './ioctl.ts';
import { light_sources_sanity_check, light_stats, wiz_light_sources } from './light.ts';
import { doclose, doforce, doopen, maybe_reset_pick, reset_pick } from './lock.ts';
import { magic_negation } from './mhitu.ts';
import { mklev } from './mklev.ts';
import { waterbody_name } from './mkmaze.ts';
import { obj_sanity_check } from './mkobj.ts';
import { dmonsfree, kill_genocided_monsters, mon_sanity_check, mongone, usmellmon } from './mon.ts';
import { attacktype, hates_silver, olfaction, sticks } from './mondata.ts';
import { doclassdisco, dodiscovered } from './o_init.ts';
import { an, ansimpleoname, doname, makeplural, reorder_fruit, simple_typename, simpleonames, the } from './objnam.ts';
import { doset, dotogglepickup, oc_to_str, show_menu_controls } from './options.ts';
import { do_look, dohelp, dohistory, doidtrap, doquickwhatis, dowhatdoes, dowhatdoes_core, dowhatis } from './pager.ts';
import { doloot, dotip, encumber_msg } from './pickup.ts';
import { Norep, There, You, You_cant, custompline, dumplogmsg, impossible, pline, raw_printf } from './pline.ts';
import { body_part, dobreathe, dogaze, dohide, domindblast, dopoly, doremove, dospinweb, dospit, dosummon, float_vs_flight, polyself, udeadinside, ugenocided } from './polyself.ts';
import { dodip, dodrink, incr_itimeout, make_blinded, make_deaf, make_glib, make_hallucinated, make_sick, make_slimed, make_stoned, make_stunned, make_vomiting, split_mon } from './potion.ts';
import { align_gname, can_pray, dopray, dosacrifice, doturn, u_gname } from './pray.ts';
import { align_str, piousness } from './priest.ts';
import { deliver_splev_message } from './questpgr.ts';
import { create_particular, doread } from './read.ts';
import { region_stats } from './region.ts';
import { rn2, rnd } from './rnd.ts';
import { rumor_check } from './rumors.ts';
import { dosave, dosave0, savelev } from './save.ts';
import { dopay, setpaid } from './shk.ts';
import { dosit } from './sit.ts';
import { dotalk } from './sounds.ts';
import { docast, dovspell } from './spell.ts';
import { can_saddle, doride } from './steed.ts';
import { dotelecmd, level_tele } from './teleport.ts';
import { timer_sanity_check, timer_stats, wiz_timeout_queue } from './timeout.ts';
import { observable_depth } from './topten.ts';
import { initrack } from './track.ts';
import { dountrap, reset_utrap, t_at } from './trap.ts';
import { check_user_string } from './unixmain.ts';
import { dosh } from './unixunix.ts';
import { doextversion, doversion } from './version.ts';
import { vision_reset } from './vision.ts';
import { can_advance, enhance_weapon_skill, skill_level_name, skill_name, uwep_skill_type, weapon_descr } from './weapon.ts';
import { doswapweapon, dotwoweapon, dowield, dowieldquiver } from './wield.ts';
import { nhwindows_hangup } from './windows.ts';
import { aggravate } from './wizard.ts';
import { size_wseg, worm_known } from './worm.ts';
import { which_armor } from './worn.ts';
import { dozap, makewish } from './zap.ts';
import { anon_cmd_c_3733, anon_cmd_c_4285, struct_cmd, struct_ext_func_tab, struct_monst, struct_movcmd, struct_nhcoord, struct_obj, union_any } from './structs.ts';
import { $at2, $cs, $rd, $sadd, $sarrOf, $sat, $sdiff, $ta, $u64, $wr, G, P, R, S, clearerr, free, memset, sprintf, sscanf, strcat, strchr, strcmp, strcpy, strlen, strncmp, strncpy } from './rt/index.ts';
import { ACID_RES, ADORNED, AGGRAVATE_MONSTER, AMULET_SYM, ANTIMAGIC, ARMOR_SYM, ARTICLE_THE, ARTICLE_YOUR, ART_OGRESMASHER, ATR_NONE, AT_GAZE, AT_SPIT, AUTOCOMPLETE, A_CHA, A_CHAOTIC, A_CON, A_CURRENT, A_DEX, A_INT, A_LAWFUL, A_NEUTRAL, A_ORIGINAL, A_STR, A_WIS, BASICENLIGHTENMENT, BLINDED, BSIZE, BUFSZ, CLAIRVOYANT, CLICK_1, CLICK_2, CMD_CLICKLOOK, CMD_NOT_AVAILABLE, CMD_TRAVEL, COLD_RES, COLNO, CONFLICT, CONFUSION, CORR, COULD_SEE, CREDIT_CARD, DBWALL, DEAF, DETECT_MONSTERS, DISINT_RES, DISPLACED, DOAGAIN, DOMOVE_RUSH, DOMOVE_WALK, DOOR, DRAIN_RES, DUNCE_CAP, D_CLOSED, D_ISOPEN, D_LOCKED, ENL_GAMEINPROGRESS, ENL_GAMEOVERALIVE, ENL_GAMEOVERDEAD, EOF, EXIT_SUCCESS, EXPL_MAX, EXT_ENCUMBER, FALSE, FAST, FIRE_RES, FIXED_ABIL, FLYING, FOOD_CLASS, FOUNTAIN, FREE_ACTION, FREE_SAVE, FROMOUTSIDE, FULL_MOON, FUMBLING, GAUNTLETS_OF_POWER, GENERALCMD, GFILTER_VIEW, GLIB, GLOC_INTERESTING, GOLD_SYM, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, HUNGER, HVY_ENCUMBER, IFBURIED, INFRAVISION, INTRINSIC, INVIS, INVULNERABLE, IN_SIGHT, I_SPECIAL, JUMPING, KILLED_BY, LARGEST_INT, LEG, LEVITATION, LIFESAVED, LOCK_PICK, LOW_PM, LUCKSTONE, M2_DEMON, M2_ELF, M2_HUMAN, M2_ORC, MAGICAL_BREATHING, MAGICENLIGHTENMENT, MAXPCHARS, MAXULEV, MAX_EXT_CMD, MENU_SELECTED, MENU_UNSELECTED, MOD_ENCUMBER, MS_SHRIEK, M_AP_FURNITURE, M_AP_MONSTER, M_AP_NOTHING, M_AP_OBJECT, NEW_MOON, NHKF_CLICKLOOK, NHKF_COUNT, NHKF_DOAGAIN, NHKF_DOINV, NHKF_ESC, NHKF_FIGHT, NHKF_FIGHT2, NHKF_GETDIR_HELP, NHKF_GETDIR_SELF, NHKF_GETDIR_SELF2, NHKF_GETPOS_AUTODESC, NHKF_GETPOS_DOOR_NEXT, NHKF_GETPOS_DOOR_PREV, NHKF_GETPOS_HELP, NHKF_GETPOS_INTERESTING_NEXT, NHKF_GETPOS_INTERESTING_PREV, NHKF_GETPOS_LIMITVIEW, NHKF_GETPOS_MENU, NHKF_GETPOS_MON_NEXT, NHKF_GETPOS_MON_PREV, NHKF_GETPOS_MOVESKIP, NHKF_GETPOS_OBJ_NEXT, NHKF_GETPOS_OBJ_PREV, NHKF_GETPOS_PICK, NHKF_GETPOS_PICK_O, NHKF_GETPOS_PICK_Q, NHKF_GETPOS_PICK_V, NHKF_GETPOS_SELF, NHKF_GETPOS_SHOWVALID, NHKF_GETPOS_UNEX_NEXT, NHKF_GETPOS_UNEX_PREV, NHKF_GETPOS_VALID_NEXT, NHKF_GETPOS_VALID_PREV, NHKF_NOPICKUP, NHKF_REDRAW, NHKF_REDRAW2, NHKF_REQMENU, NHKF_RUN, NHKF_RUN2, NHKF_RUN_NOPICKUP, NHKF_RUSH, NHKF_TRAVEL, NHW_MENU, NHW_TEXT, NO_GLYPH, NR_OF_EOFS, NUM_OBJECTS, OVERLOADED, PASSES_WALLS, PICK_ANY, PICK_NONE, PICK_ONE, PLNMSG_UNKNOWN, PM_GREEN_SLIME, PM_GREMLIN, PM_GRID_BUG, POISON_RES, POLYMORPH, POLYMORPH_CONTROL, PROTECTION, PROT_FROM_SHAPE_CHANGERS, P_ISRESTRICTED, P_NONE, P_SKILLED, P_UNSKILLED, QBUFSZ, REFLECTING, REGENERATION, RING_SYM, RIN_ADORNMENT, RIN_PROTECTION, RIN_SUSTAIN_ABILITY, ROLE_FEMALE, ROLE_GENDMASK, ROLE_MALE, ROOM, ROWNO, SADDLE, SCORR, SDOOR, SEARCHING, SEE_INVIS, SHOCK_RES, SICK, SICK_NONVOMITABLE, SICK_RES, SICK_VOMITABLE, SINK, SKELETON_KEY, SLEEPY, SLEEP_RES, SLIMED, SLOW_DIGESTION, SLT_ENCUMBER, SPBOOK_SYM, SPIKED_PIT, STANDBY_erase_char, STEALTH, STONE, STONED, STONE_RES, STRANGLED, STUNNED, SUPPRESS_HALLUCINATION, SUPPRESS_HISTORY, SUPPRESS_SADDLE, SWIMMING, S_EEL, S_NYMPH, S_UNICORN, S_VAMPIRE, S_arrow_trap, S_fountain, S_sink, TELEPAT, TELEPORT, TELEPORT_CONTROL, TEMP_LIT, TER_MAP, TER_OBJ, TER_TRP, TEST_MOVE, THRONE, TIMEOUT, TOOL_SYM, TRUE, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, UNCHANGING, UNENCUMBERED, VIBRATING_SQUARE, VOMITING, WARNING, WARN_OF_MON, WARN_UNDEAD, WEAPON_SYM, WIN_ERR, WIZMODECMD, WM_MASK, WOUNDED_LEGS, WWALKING, W_AMUL, W_ARMOR, W_RING, W_SADDLE, W_TOOL } from './consts.ts';

let alt_esc: number;
let timed_occ_fn: Function | null;
let readchar_queue: Ptr | null;
let clicklook_cc: struct_nhcoord;
let unavailcmd: any;
let cmdnotavail: any;
let pushq: any;
let saveq: any;
let phead: number;
let ptail: number;
let shead: number;
let stail: number;
let levltyp: any;
let en_win: number;
let en_via_menu: number;
let You_: any;
let are: any;
let were: any;
let have: any;
let had: any;
let can: any;
let could: any;
let have_been: any;
let have_never: any;
let never: any;
let movtab: any;
let template: any;
let stats_hdr: any;
let stats_sep: any;
let last_multi: number;
let doextlist$headings: any;
let wiz_intrinsic$wizintrinsic: any;
let wiz_intrinsic$fmt: any;
let basics_enlightenment$Power: any;
let basics_enlightenment$Your_wallet: any;
let attributes_enlightenment$if_surroundings_permitted: any;
let attributes_enlightenment$hofe_titles: any;
let attributes_enlightenment$mc_types: any;
let key2extcmddesc$key2cmdbuf: any;
let dokeylist$run_desc: any;
let dokeylist$forcefight_desc: any;
let dokeylist$misc_keys: any;
let reset_commands$sdir: any;
let reset_commands$sdir_swap_yz: any;
let reset_commands$ndir: any;
let reset_commands$ndir_phone_layout: any;
let reset_commands$ylist: any;
let reset_commands$back_dir_cmd: any;
let reset_commands$backed_dir_cmd: number;
let randomkey$i: number;
let help_dir$wiz_only_list: any;
let directionname$dirnames: any;
let click_to_cmd$cmd: any;
let parse$in_line: any;
let dotravel$cmd: any;

async function doprev_message(): Promise<number> {
  return await G.windowprocs.win_doprev_message();
}

async function timed_occupation(): Promise<number> {
  await timed_occ_fn();
  if (G.multi > 0) {
    --G.multi;
  }
  return G.multi > 0 ? 1 : 0;
}

export function reset_occupations(): void {
  reset_remarm();
  reset_pick();
  reset_trapset();
}

export function set_occupation(fn: Function | null, txt: Ptr | null, xtime: number): void {
  if (xtime) {
    G.occupation = timed_occupation;
    timed_occ_fn = fn;
  } else {
    G.occupation = fn;
  }
  G.occtxt = txt;
  G.occtime = 0;
  return;
}

function popch(): number {
  if (G.occupation) {
    return 0;
  }
  if (G.in_doagain) {
    return (shead !== stail ? saveq[stail++] : 0) << 24 >> 24;
  } else {
    return (phead !== ptail ? pushq[ptail++] : 0) << 24 >> 24;
  }
}

export async function pgetchar(): Promise<number> {
  let ch = 0;
  if (G.iflags.debug_fuzzer) {
    return randomkey();
  }
  if (!(ch = popch())) {
    ch = await G.windowprocs.win_nhgetch();
  }
  return ch << 24 >> 24;
}

export function pushch(ch: number): void {
  if (!ch) {
    phead = ptail = 0;
  }
  if (phead < BSIZE) {
    pushq[phead++] = ch;
  }
  return;
}

export function savech(ch: number): void {
  if (!G.in_doagain) {
    if (!ch) {
      phead = ptail = shead = stail = 0;
    } else if (shead < BSIZE) {
      saveq[shead++] = ch;
    }
  }
  return;
}

async function doextcmd(): Promise<number> {
  let idx = 0;
  let retval = 0;
  let func = null;
  do {
    idx = await G.windowprocs.win_get_ext_cmd();
    if (idx < 0) {
      return 0;
    }
    func = G.extcmdlist[idx].ef_funct;
    if (!G.flags.debug && G.extcmdlist[idx].flags & WIZMODECMD) {
      await You(S("can't do that."));
      return 0;
    }
    if (G.iflags.menu_requested && !accept_menu_prefix(func)) {
      await pline(S("'%s' prefix has no effect for the %s command."), visctrl(G.Cmd.spkeys[NHKF_REQMENU]), G.extcmdlist[idx].ef_txt);
      G.iflags.menu_requested = FALSE;
    }
    retval = await func();
  } while (func === doextlist);
  return retval;
}

export async function doextlist(): Promise<number> {
  let efp = null;
  let buf = new Int8Array(256);
  let searchbuf = new Int8Array(256);
  let promptbuf = new Int8Array(128);
  let menuwin = 0;
  let any = new union_any();
  const selected = [null];
  let n = 0;
  let pass = 0;
  let menumode = 0;
  let menushown = new Int32Array(2);
  let onelist = 0;
  let redisplay = TRUE;
  let search = FALSE;
  searchbuf[0] = 0;
  menuwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  while (redisplay) {
    redisplay = FALSE;
    any.$cp(G.zeroany);
    await G.windowprocs.win_start_menu(menuwin);
    await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, ATR_NONE, S("Extended Commands List"), MENU_UNSELECTED);
    await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
    strcpy(P(buf), menumode ? S("Show") : S("Hide"));
    strcat(P(buf), S(" commands that don't autocomplete"));
    if (!menumode) {
      strcat(P(buf), S(" (those not marked with [A])"));
    }
    any.a_int = 1;
    await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 97, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    if (!$rd(P(searchbuf))) {
      any.a_int = 2;
      await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 58, 115, ATR_NONE, S("Search extended commands"), MENU_UNSELECTED);
    } else {
      strcpy(P(buf), S("Show all, clear search"));
      if (strlen(P(buf)) + strlen(P(searchbuf)) + strlen(S(" (\"\")")) < QBUFSZ) {
        sprintf(eos(P(buf)), S(" (\"%s\")"), P(searchbuf));
      }
      any.a_int = 3;
      await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 115, 58, ATR_NONE, P(buf), MENU_UNSELECTED);
    }
    if (G.flags.debug) {
      any.a_int = 4;
      await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 122, 0, ATR_NONE, onelist ? S("Show debugging commands in separate section") : S("Show all alphabetically, including debugging commands"), MENU_UNSELECTED);
    }
    any.$cp(G.zeroany);
    await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
    menushown[0] = menushown[1] = 0;
    n = 0;
    for (pass = 0; pass <= 1; ++pass) {
      if (pass === 1 && (onelist || !G.flags.debug)) {
        break;
      }
      for (efp = G.extcmdlist[0]; efp.ef_txt; efp = $sadd(efp, 1)) {
        let wizc = 0;
        if ((efp.flags & CMD_NOT_AVAILABLE) !== 0) {
          continue;
        }
        if (menumode === 1 && (efp.flags & AUTOCOMPLETE) === 0) {
          continue;
        }
        if ($rd(P(searchbuf)) && !strstri(efp.ef_txt, P(searchbuf)) && !strstri(efp.ef_desc, P(searchbuf)) && !pmatchi(P(searchbuf), efp.ef_txt) && !pmatchi(P(searchbuf), efp.ef_desc)) {
          continue;
        }
        wizc = (efp.flags & WIZMODECMD) !== 0 ? 1 : 0;
        if (wizc && !G.flags.debug) {
          continue;
        }
        if (!onelist && pass !== wizc) {
          continue;
        }
        if (!menushown[pass]) {
          strcpy(P(buf), doextlist$headings[pass]);
          await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, P(buf), MENU_UNSELECTED);
          menushown[pass] = 1;
        }
        sprintf(P(buf), S(" %-14s %-3s %s"), efp.ef_txt, efp.flags & AUTOCOMPLETE ? S("[A]") : S(" "), efp.ef_desc);
        await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
        ++n;
      }
      if (n) {
        await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
      }
    }
    if ($rd(P(searchbuf)) && !n) {
      await G.windowprocs.win_add_menu(menuwin, NO_GLYPH, any, 0, 0, ATR_NONE, S("no matches"), MENU_UNSELECTED);
    }
    await G.windowprocs.win_end_menu(menuwin, null);
    n = await G.windowprocs.win_select_menu(menuwin, PICK_ONE, P(selected, 0));
    if (n > 0) {
      switch (selected[0].item.a_int) {
      case 1:
        menumode = 1 - menumode;
        redisplay = TRUE;
        break;
      case 2:
        search = TRUE;
        break;
      case 3:
        search = FALSE;
        searchbuf[0] = 0;
        redisplay = TRUE;
        break;
      case 4:
        search = FALSE;
        searchbuf[0] = 0;
        onelist = 1 - onelist;
        redisplay = TRUE;
        break;
      }
      free(selected[0]);
    } else {
      search = FALSE;
      searchbuf[0] = 0;
    }
    if (search) {
      strcpy(P(promptbuf), S("Extended command list search phrase"));
      strcat(P(promptbuf), S("?"));
      await G.windowprocs.win_getlin(P(promptbuf), P(searchbuf));
      mungspaces(P(searchbuf));
      if (searchbuf[0] === 27) {
        searchbuf[0] = 0;
      }
      if ($rd(P(searchbuf))) {
        redisplay = TRUE;
      }
      search = FALSE;
    }
  }
  await G.windowprocs.win_destroy_nhwindow(menuwin);
  return 0;
}

export async function extcmd_via_menu(): Promise<number> {
  let efp = null;
  const pick_list = [null];
  pick_list[0] = null;
  let win = 0;
  let any = new union_any();
  let choices = new Array(201).fill(null);
  let buf = new Int8Array(256);
  let cbuf = new Int8Array(128);
  let prompt = new Int8Array(128);
  let fmtstr = new Int8Array(20);
  let i = 0;
  let n = 0;
  let nchoices = 0;
  let acount = 0;
  let ret = 0;
  let len = 0;
  let biggest = 0;
  let accelerator = 0;
  let prevaccelerator = 0;
  let matchlevel = 0;
  let wastoolong = 0;
  let one_per_line = 0;
  ret = 0;
  cbuf[0] = 0;
  biggest = 0;
  while (!ret) {
    i = n = 0;
    any.$cp(G.zeroany);
    for (efp = G.extcmdlist[0]; efp.ef_txt; efp = $sadd(efp, 1)) {
      if (efp.flags & CMD_NOT_AVAILABLE || !(efp.flags & AUTOCOMPLETE) || !G.flags.debug && efp.flags & WIZMODECMD) {
        continue;
      }
      if (!matchlevel || !strncmp(efp.ef_txt, P(cbuf), $u64(matchlevel))) {
        choices[i] = efp;
        if ((len = strlen(efp.ef_desc) | 0) > biggest) {
          biggest = len;
        }
        if (++i > MAX_EXT_CMD) {
          G.iflags.extmenu = 0;
          return -1;
        }
      }
    }
    choices[i] = null;
    nchoices = i;
    if (nchoices <= 1) {
      ret = nchoices === 1 ? $sdiff(choices[0], G.extcmdlist[0]) | 0 : -1;
      break;
    }
    win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    await G.windowprocs.win_start_menu(win);
    sprintf(P(fmtstr), S("%%-%ds"), biggest + 15);
    prompt[0] = 0;
    wastoolong = FALSE;
    one_per_line = (nchoices < ROWNO - 3 ? 1 : 0) << 24 >> 24;
    accelerator = prevaccelerator = 0;
    acount = 0;
    for (i = 0; choices[i]; ++i) {
      accelerator = $rd(choices[i].ef_txt, matchlevel);
      if (accelerator !== prevaccelerator || one_per_line) {
        wastoolong = FALSE;
      }
      if (accelerator !== prevaccelerator || one_per_line || acount >= 2 && strlen(P(prompt)) + 4 + strlen(choices[i].ef_txt) >= (128 < 80 - 6 ? 128 : 80 - 6)) {
        if (acount) {
          sprintf(P(buf), P(fmtstr), P(prompt));
          any.a_char = prevaccelerator << 24 >> 24;
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, any.a_char, 0, ATR_NONE, P(buf), FALSE);
          acount = 0;
          if (!(accelerator !== prevaccelerator || one_per_line)) {
            wastoolong = TRUE;
          }
        }
      }
      prevaccelerator = accelerator;
      if (!acount || one_per_line) {
        sprintf(P(prompt), S("%s%s [%s]"), wastoolong ? S("or ") : S(""), choices[i].ef_txt, choices[i].ef_desc);
      } else if (acount === 1) {
        sprintf(P(prompt), S("%s%s or %s"), wastoolong ? S("or ") : S(""), choices[i - 1].ef_txt, choices[i].ef_txt);
      } else {
        strcat(P(prompt), S(" or "));
        strcat(P(prompt), choices[i].ef_txt);
      }
      ++acount;
    }
    if (acount) {
      sprintf(P(buf), P(fmtstr), P(prompt));
      any.a_char = prevaccelerator << 24 >> 24;
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, any.a_char, 0, ATR_NONE, P(buf), FALSE);
    }
    sprintf(P(prompt), S("Extended Command: %s"), P(cbuf));
    await G.windowprocs.win_end_menu(win, P(prompt));
    n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(pick_list, 0));
    await G.windowprocs.win_destroy_nhwindow(win);
    if (n === 1) {
      if (matchlevel > QBUFSZ - 2) {
        free(pick_list[0]);
        ret = -1;
      } else {
        cbuf[matchlevel++] = pick_list[0].item.a_char;
        cbuf[matchlevel] = 0;
        free(pick_list[0]);
      }
    } else {
      if (matchlevel) {
        ret = 0;
        matchlevel = 0;
      } else {
        ret = -1;
      }
    }
  }
  return ret;
}

export async function domonability(): Promise<number> {
  if (attacktype(G.youmonst.data, 12)) {
    return await dobreathe();
  } else if (attacktype(G.youmonst.data, AT_SPIT)) {
    return await dospit();
  } else if (G.youmonst.data.mlet === S_NYMPH) {
    return await doremove();
  } else if (attacktype(G.youmonst.data, AT_GAZE)) {
    return await dogaze();
  } else if ((G.youmonst.data.mflags2 & 4) >>> 0 !== 0) {
    return await dosummon();
  } else if (G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95)) {
    return await dospinweb();
  } else if ((G.youmonst.data.mflags1 & 256) >>> 0 !== 0) {
    return await dohide();
  } else if (G.youmonst.data === $sat(G.mons, 47) || G.youmonst.data === $sat(G.mons, 48)) {
    return await domindblast();
  } else if (G.u.umonnum === PM_GREMLIN) {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === FOUNTAIN) {
      if (await split_mon(G.youmonst, null)) {
        await dryup(G.u.ux, G.u.uy, TRUE);
      }
    } else {
      await There(S("is no fountain here."));
    }
  } else if (G.youmonst.data.mlet === S_UNICORN && (G.youmonst.data.mflags2 & 536870912) >>> 0 !== 0) {
    await use_unicorn_horn(null);
    return 1;
  } else if (G.youmonst.data.msound === MS_SHRIEK) {
    await You(S("shriek."));
    if (G.u.uburied) {
      await pline(S("Unfortunately sound does not carry well through rock."));
    } else {
      await aggravate();
    }
  } else if (G.youmonst.data.mlet === S_VAMPIRE) {
    return await dopoly();
  } else if (G.u.umonnum !== G.u.umonster) {
    await pline(S("Any special ability you may have is purely reflexive."));
  } else {
    await You(S("don't have a special ability in your normal form!"));
  }
  return 0;
}

export async function enter_explore_mode(): Promise<number> {
  if (G.flags.debug) {
    await You(S("are in debug mode."));
  } else if (G.flags.explore) {
    await You(S("are already in explore mode."));
  } else {
    if (!G.sysopt.explorers || !G.sysopt.explorers.a[G.sysopt.explorers.o] || !check_user_string(G.sysopt.explorers)) {
      await You(S("cannot access explore mode."));
      return 0;
    }
    await pline(S("Beware!  From explore mode there will be no return to normal game."));
    if (await paranoid_query((G.flags.paranoia_bits & 2) >>> 0 !== 0 ? 1 : 0, S("Do you want to enter explore mode?"))) {
      await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
      await You(S("are now in non-scoring explore mode."));
      G.flags.explore = TRUE;
    } else {
      await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
      await pline(S("Resuming normal game."));
    }
  }
  return 0;
}

async function wiz_wish(): Promise<number> {
  if (G.flags.debug) {
    let save_verbose = G.flags.verbose;
    G.flags.verbose = FALSE;
    await makewish();
    G.flags.verbose = save_verbose;
    await encumber_msg();
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_wish)));
  }
  return 0;
}

async function wiz_identify(): Promise<number> {
  if (G.flags.debug) {
    G.iflags.override_ID = cmd_from_func(wiz_identify);
    if (!G.iflags.override_ID) {
      G.iflags.override_ID = 31 & 73;
    }
    await display_inventory(null, FALSE);
    G.iflags.override_ID = 0;
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_identify)));
  }
  return 0;
}

async function wiz_makemap(): Promise<number> {
  if (G.flags.debug) {
    let mtmp = null;
    let was_in_W_tower = await In_W_tower(G.u.ux, G.u.uy, G.u.uz);
    rm_mapseen(ledger_no(G.u.uz));
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.isgd) {
        mtmp.isgd = 0;
        await mongone(mtmp);
      }
      if (mtmp.mhp < 1) {
        continue;
      }
      if (mtmp.isshk) {
        await setpaid(mtmp);
      }
    }
    if (!!G.uball) {
      await ballrelease(FALSE);
      await unplacebc();
    }
    maybe_reset_pick(null);
    if (on_level(G.context.digging.level, G.u.uz)) {
      memset(G.context.digging, 0, 24);
    }
    G.iflags.travelcc.x = G.iflags.travelcc.y = 0;
    G.context.polearm.hitmon = null;
    await reset_utrap(FALSE);
    await check_special_room(TRUE);
    G.u.ustuck = null;
    G.u.uswallow = 0;
    G.u.uinwater = 0;
    G.u.uundetected = 0;
    await dmonsfree();
    await keepdogs(TRUE);
    await savelev(-1, ledger_no(G.u.uz), FREE_SAVE);
    await mklev();
    vision_reset();
    G.vision_full_recalc = 1;
    await cls();
    await u_on_rndspot((G.u.uhave.amulet | 0 ? 1 : 0) | (was_in_W_tower ? 2 : 0));
    await losedogs();
    await kill_genocided_monsters();
    if (!!(mtmp = !!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null)) {
      await u_collide_m(mtmp);
    }
    initrack();
    if (!!G.uball) {
      await unplacebc();
      await placebc();
    }
    await docrt();
    await flush_screen(1);
    await deliver_splev_message();
    await check_special_room(FALSE);
    await save_currentstate();
  } else {
    await pline(P(unavailcmd), S("#wizmakemap"));
  }
  return 0;
}

async function wiz_map(): Promise<number> {
  if (G.flags.debug) {
    let t = null;
    let save_Hconf = G.u.uprops[CONFUSION].intrinsic;
    let save_Hhallu = G.u.uprops[HALLUC].intrinsic;
    G.u.uprops[CONFUSION].intrinsic = G.u.uprops[HALLUC].intrinsic = 0;
    for (t = G.ftrap; !!t; t = t.ntrap) {
      t.tseen = 1;
      await map_trap(t, TRUE);
    }
    await do_mapping();
    G.u.uprops[CONFUSION].intrinsic = save_Hconf;
    G.u.uprops[HALLUC].intrinsic = save_Hhallu;
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_map)));
  }
  return 0;
}

async function wiz_genesis(): Promise<number> {
  if (G.flags.debug) {
    await create_particular();
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_genesis)));
  }
  return 0;
}

async function wiz_where(): Promise<number> {
  if (G.flags.debug) {
    await print_dungeon(FALSE, null, null);
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_where)));
  }
  return 0;
}

async function wiz_detect(): Promise<number> {
  if (G.flags.debug) {
    await findit();
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_detect)));
  }
  return 0;
}

async function wiz_level_tele(): Promise<number> {
  if (G.flags.debug) {
    await level_tele();
  } else {
    await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_level_tele)));
  }
  return 0;
}

async function wiz_level_change(): Promise<number> {
  let buf = new Int8Array(256);
  const newlevel = new Int32Array(1);
  newlevel[0] = 0;
  let ret = 0;
  await G.windowprocs.win_getlin(S("To what experience level do you want to be set?"), P(buf));
  mungspaces(P(buf));
  if (buf[0] === 27 || buf[0] === 0) {
    ret = 0;
  } else {
    ret = sscanf(P(buf), S("%d"), P(newlevel, 0));
  }
  if (ret !== 1) {
    await pline(S("%s"), G.c_common_strings.c_Never_mind);
    return 0;
  }
  if (newlevel[0] === G.u.ulevel) {
    await You(S("are already that experienced."));
  } else if (newlevel[0] < G.u.ulevel) {
    if (G.u.ulevel === 1) {
      await You(S("are already as inexperienced as you can get."));
      return 0;
    }
    if (newlevel[0] < 1) {
      newlevel[0] = 1;
    }
    while (G.u.ulevel > newlevel[0]) {
      await losexp(S("#levelchange"));
    }
  } else {
    if (G.u.ulevel >= MAXULEV) {
      await You(S("are already as experienced as you can get."));
      return 0;
    }
    if (newlevel[0] > MAXULEV) {
      newlevel[0] = MAXULEV;
    }
    while (G.u.ulevel < newlevel[0]) {
      await pluslvl(FALSE);
    }
  }
  G.u.ulevelmax = G.u.ulevel;
  return 0;
}

async function wiz_panic(): Promise<number> {
  if (G.iflags.debug_fuzzer) {
    G.u.uhp = G.u.uhpmax = 1000;
    G.u.uen = G.u.uenmax = 1000;
    return 0;
  }
  if (await paranoid_query((G.flags.paranoia_bits & 2) >>> 0 !== 0 ? 1 : 0, S("Do you want to call panic() and end your game?"))) {
    await panic(S("Crash test."));
  }
  return 0;
}

async function wiz_polyself(): Promise<number> {
  await polyself(1);
  return 0;
}

async function wiz_show_seenv(): Promise<number> {
  let win = 0;
  let x = 0;
  let y = 0;
  let v = 0;
  let startx = 0;
  let stopx = 0;
  let curx = 0;
  let row = new Int8Array(81);
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  startx = 1 > G.u.ux - (80 / 4 | 0) ? 1 : G.u.ux - (80 / 4 | 0);
  stopx = startx + (80 / 2 | 0) < 80 ? startx + (80 / 2 | 0) : 80;
  if (stopx - startx === (COLNO / 2 | 0)) {
    ++startx;
  }
  for (y = 0; y < ROWNO; ++y) {
    for (x = startx, curx = 0; x < stopx; ++x, curx += 2) {
      if (x === G.u.ux && y === G.u.uy) {
        row[curx] = row[curx + 1] = 64;
      } else {
        v = $at2(G.level.locations, x, y).seenv & 255;
        if (v === 0) {
          row[curx] = row[curx + 1] = 32;
        } else {
          sprintf(P(row, curx), S("%02x"), v);
        }
      }
    }
    for (x = curx - 1; x >= 0; --x) {
      if (row[x] !== 32) {
        break;
      }
    }
    row[x + 1] = 0;
    await G.windowprocs.win_putstr(win, 0, P(row));
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

async function wiz_show_vision(): Promise<number> {
  let win = 0;
  let x = 0;
  let y = 0;
  let v = 0;
  let row = new Int8Array(81);
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  sprintf(P(row), S("Flags: 0x%x could see, 0x%x in sight, 0x%x temp lit"), COULD_SEE, IN_SIGHT, TEMP_LIT);
  await G.windowprocs.win_putstr(win, 0, P(row));
  await G.windowprocs.win_putstr(win, 0, S(""));
  for (y = 0; y < ROWNO; ++y) {
    for (x = 1; x < COLNO; ++x) {
      if (x === G.u.ux && y === G.u.uy) {
        row[x] = 64;
      } else {
        v = $rd(G.viz_array.a[G.viz_array.o + y], x);
        if (v === 0) {
          row[x] = 32;
        } else {
          row[x] = 48 + $rd(G.viz_array.a[G.viz_array.o + y], x) << 24 >> 24;
        }
      }
    }
    for (x = COLNO - 1; x >= 1; --x) {
      if (row[x] !== 32) {
        break;
      }
    }
    row[x + 1] = 0;
    await G.windowprocs.win_putstr(win, 0, P(row, 1));
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

async function wiz_show_wmodes(): Promise<number> {
  let win = 0;
  let x = 0;
  let y = 0;
  let row = new Int8Array(81);
  let lev = null;
  let istty = (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) ? 1 : 0) << 24 >> 24;
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  if (istty) {
    await G.windowprocs.win_putstr(win, 0, S(""));
  }
  for (y = 0; y < ROWNO; ++y) {
    for (x = 0; x < COLNO; ++x) {
      lev = $sat(G.level.locations[x], y);
      if (x === G.u.ux && y === G.u.uy) {
        row[x] = 64;
      } else if (lev.typ && lev.typ <= DBWALL || lev.typ === SDOOR) {
        row[x] = 48 + ((lev.flags | 0) & WM_MASK) << 24 >> 24;
      } else if (lev.typ === CORR) {
        row[x] = 35;
      } else if (lev.typ >= ROOM || lev.typ === DOOR) {
        row[x] = 46;
      } else {
        row[x] = 120;
      }
    }
    row[COLNO] = 0;
    await G.windowprocs.win_putstr(win, 0, P(row, 1));
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

async function wiz_map_levltyp(): Promise<void> {
  let win = 0;
  let x = 0;
  let y = 0;
  let terrain = 0;
  let row = new Int8Array(81);
  let istty = (!strcmp(G.windowprocs.name, S("tty")) ? 1 : 0) << 24 >> 24;
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  if (istty) {
    await G.windowprocs.win_putstr(win, 0, S(""));
  }
  for (y = 0; y < ROWNO; ++y) {
    for (x = 1; x < COLNO; ++x) {
      terrain = $at2(G.level.locations, x, y).typ;
      row[x - 1] = (terrain === STONE && !may_dig(x, y) ? 42 : terrain < 10 ? 48 + terrain : terrain < 36 ? 97 + terrain - 10 : 65 + terrain - 36) << 24 >> 24;
    }
    --x;
    if ($at2(G.level.locations, 0, y).typ !== STONE || may_dig(0, y)) {
      row[x++] = 33;
    }
    row[x] = 0;
    await G.windowprocs.win_putstr(win, 0, P(row));
  }
  {
    let dsc = new Int8Array(256);
    let slev = Is_special(G.u.uz);
    sprintf(P(dsc), S("D:%d,L:%d"), G.u.uz.dnum, G.u.uz.dlevel);
    if (slev) {
      sprintf(eos(P(dsc)), S(" \"%s\""), P(slev.proto));
      if (slev.flags.maze_like) {
        strcat(P(dsc), S(" mazelike"));
      }
      if (slev.flags.hellish) {
        strcat(P(dsc), S(" hellish"));
      }
      if (slev.flags.town) {
        strcat(P(dsc), S(" town"));
      }
      if (slev.flags.rogue_like) {
        strcat(P(dsc), S(" roguelike"));
      }
    }
    if (G.level.flags.nfountains) {
      sprintf(eos(P(dsc)), S(" %c:%d"), G.defsyms[S_fountain].sym, G.level.flags.nfountains);
    }
    if (G.level.flags.nsinks) {
      sprintf(eos(P(dsc)), S(" %c:%d"), G.defsyms[S_sink].sym, G.level.flags.nsinks);
    }
    if (G.level.flags.has_vault) {
      strcat(P(dsc), S(" vault"));
    }
    if (G.level.flags.has_shop) {
      strcat(P(dsc), S(" shop"));
    }
    if (G.level.flags.has_temple) {
      strcat(P(dsc), S(" temple"));
    }
    if (G.level.flags.has_court) {
      strcat(P(dsc), S(" throne"));
    }
    if (G.level.flags.has_zoo) {
      strcat(P(dsc), S(" zoo"));
    }
    if (G.level.flags.has_morgue) {
      strcat(P(dsc), S(" morgue"));
    }
    if (G.level.flags.has_barracks) {
      strcat(P(dsc), S(" barracks"));
    }
    if (G.level.flags.has_beehive) {
      strcat(P(dsc), S(" hive"));
    }
    if (G.level.flags.has_swamp) {
      strcat(P(dsc), S(" swamp"));
    }
    if (G.level.flags.noteleport) {
      strcat(P(dsc), S(" noTport"));
    }
    if (G.level.flags.hardfloor) {
      strcat(P(dsc), S(" noDig"));
    }
    if (G.level.flags.nommap) {
      strcat(P(dsc), S(" noMMap"));
    }
    if (!G.level.flags.hero_memory) {
      strcat(P(dsc), S(" noMem"));
    }
    if (G.level.flags.shortsighted) {
      strcat(P(dsc), S(" shortsight"));
    }
    if (G.level.flags.graveyard) {
      strcat(P(dsc), S(" graveyard"));
    }
    if (G.level.flags.is_maze_lev) {
      strcat(P(dsc), S(" maze"));
    }
    if (G.level.flags.is_cavernous_lev) {
      strcat(P(dsc), S(" cave"));
    }
    if (G.level.flags.arboreal) {
      strcat(P(dsc), S(" tree"));
    }
    if (G.level.flags.sokoban_rules) {
      strcat(P(dsc), S(" sokoban-rules"));
    }
    if (Invocation_lev(G.u.uz)) {
      strcat(P(dsc), S(" invoke"));
    }
    if (On_W_tower_level(G.u.uz)) {
      strcat(P(dsc), S(" tower"));
    }
    if (G.u.uz.dnum === 0) {
      strcat(P(dsc), S(" dungeon"));
    } else if (G.u.uz.dnum === G.dungeon_topology.d_mines_dnum) {
      strcat(P(dsc), S(" mines"));
    } else if (G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum) {
      strcat(P(dsc), S(" sokoban"));
    } else if (G.u.uz.dnum === G.dungeon_topology.d_quest_dnum) {
      strcat(P(dsc), S(" quest"));
    } else if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
      strcat(P(dsc), S(" ludios"));
    } else if (G.u.uz.dnum === 1) {
      strcat(P(dsc), S(" gehennom"));
    } else if (G.u.uz.dnum === G.dungeon_topology.d_tower_dnum) {
      strcat(P(dsc), S(" vlad"));
    } else if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
      strcat(P(dsc), S(" endgame"));
    } else {
      let brname = P(G.dungeons[G.u.uz.dnum].dname);
      if (!brname || !brname.a[brname.o]) {
        brname = S("unknown");
      }
      if (!strncmpi(brname, S("the "), 4)) {
        brname = brname.add(4);
      }
      sprintf(eos(P(dsc)), S(" %s"), brname);
    }
    if (strlen(P(dsc)) >= COLNO) {
      dsc[COLNO - 1] = 0;
    }
    await G.windowprocs.win_putstr(win, 0, P(dsc));
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return;
}

async function wiz_levltyp_legend(): Promise<void> {
  let win = 0;
  let i = 0;
  let j = 0;
  let last = 0;
  let c = 0;
  let dsc = null;
  let fmt = null;
  let buf = new Int8Array(256);
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  await G.windowprocs.win_putstr(win, 0, S("#terrain encodings:"));
  await G.windowprocs.win_putstr(win, 0, S(""));
  fmt = S(" %c - %-28s");
  $wr(P(buf), 0, 0);
  last = (Math.trunc(304 / 8) | 0) & ~1;
  for (i = 0; i < (last / 2 | 0); ++i) {
    for (j = i; j < last; j += last / 2 | 0) {
      dsc = levltyp[j];
      c = !dsc.a[dsc.o] ? 32 : !strncmp(dsc, S("unreachable"), 11) ? 42 : j < 10 ? 48 + j : j < 36 ? 97 + j - 10 : 65 + j - 36;
      sprintf(eos(P(buf)), fmt, c, dsc);
      if (j > i) {
        await G.windowprocs.win_putstr(win, 0, P(buf));
        $wr(P(buf), 0, 0);
      }
    }
  }
  await G.windowprocs.win_display_nhwindow(win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return;
}

async function wiz_smell(): Promise<number> {
  let ans = 0;
  let mndx = 0;
  let cc = new struct_nhcoord();
  let glyph = 0;
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  mndx = 0;
  if (!olfaction(G.youmonst.data)) {
    await You(S("are incapable of detecting odors in your present form."));
    return 0;
  }
  await pline(S("You can move the cursor to a monster that you want to smell."));
  do {
    await pline(S("Pick a monster to smell."));
    ans = await getpos(cc, TRUE, S("a monster"));
    if (ans < 0 || cc.x < 0) {
      return 0;
    }
    glyph = glyph_at(cc.x, cc.y);
    if (glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) {
      mndx = glyph >= 0 && glyph < 0 + 382 ? glyph - 0 : glyph >= 382 + 0 && glyph < 382 + 0 + 382 ? glyph - (382 + 0) : glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382 ? glyph - (1 + (382 + (382 + 0))) : glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 ? glyph - (382 + (382 + (1 + (382 + (382 + 0))))) : glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? glyph - (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))));
    } else {
      mndx = 0;
    }
    if (mndx) {
      if (!await usmellmon($sat(G.mons, mndx))) {
        await pline(S("That monster seems to give off no smell."));
      }
    } else {
      await pline(S("That is not a monster."));
    }
  } while (1);
  return 0;
}

async function wiz_intrinsic(): Promise<number> {
  let $g = 0;
  let win = 0;
  let any = new union_any();
  let buf = new Int8Array(256);
  let i = 0;
  let j = 0;
  let n = 0;
  let p = 0;
  let amt = 0;
  let typ = 0;
  let oldtimeout = 0;
  let newtimeout = 0;
  let propname = null;
  let pick_list = [null];
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (!G.flags.debug) { $g = 3; continue $L; }
      any = new union_any();
      buf = new Int8Array(256);
      pick_list[0] = null;
      any.$cp(G.zeroany);
      win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_start_menu(win);
      for (i = 0; !!(propname = G.propertynames[i].prop_name); ++i) {
        p = G.propertynames[i].prop_num;
        if (p === HALLUC_RES) {
          continue;
        }
        if (p === FIRE_RES) {
          any.a_int = 0;
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S("--"), FALSE);
        }
        any.a_int = i + 1;
        oldtimeout = G.u.uprops[p].intrinsic & TIMEOUT;
        if (oldtimeout) {
          sprintf(P(buf), S("%-27s [%li]"), propname, oldtimeout);
        } else {
          sprintf(P(buf), S("%s"), propname);
        }
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), FALSE);
      }
      await G.windowprocs.win_end_menu(win, S("Which intrinsics?"));
      n = await G.windowprocs.win_select_menu(win, PICK_ANY, P(pick_list, 0));
      await G.windowprocs.win_destroy_nhwindow(win);
      amt = 30;
      j = 0;
    case 4:
      if (!(j < n)) { $g = 6; continue $L; }
      i = $sadd(pick_list[0], j).item.a_int - 1;
      p = G.propertynames[i].prop_num;
      oldtimeout = G.u.uprops[p].intrinsic & TIMEOUT;
      newtimeout = oldtimeout + amt;
      switch (p) {
      case SICK:
      case SLIMED:
      case STONED:
        if (oldtimeout > 0 && newtimeout > oldtimeout) {
          newtimeout = oldtimeout;
        }
        break;
      }
      switch (p) {
      case BLINDED: { $g = 8; continue $L; }
      case DEAF: { $g = 9; continue $L; }
      case HALLUC: { $g = 10; continue $L; }
      case SICK: { $g = 11; continue $L; }
      case SLIMED: { $g = 12; continue $L; }
      case STONED: { $g = 13; continue $L; }
      case STUNNED: { $g = 14; continue $L; }
      case VOMITING: { $g = 15; continue $L; }
      case WARN_OF_MON: { $g = 16; continue $L; }
      case GLIB: { $g = 17; continue $L; }
      case LEVITATION: { $g = 18; continue $L; }
      case FLYING: { $g = 19; continue $L; }
      default: { $g = 20; continue $L; }
      }
    case 8:
      await make_blinded(newtimeout, TRUE);
      { $g = 7; continue $L; };
    case 9:
      await make_deaf(newtimeout, TRUE);
      { $g = 7; continue $L; };
    case 10:
      await make_hallucinated(newtimeout, TRUE, 0);
      { $g = 7; continue $L; };
    case 11:
      typ = !rn2(2) ? SICK_VOMITABLE : SICK_NONVOMITABLE;
      await make_sick(newtimeout, P(wiz_intrinsic$wizintrinsic), TRUE, typ);
      { $g = 7; continue $L; };
    case 12:
      sprintf(P(buf), P(wiz_intrinsic$fmt), !G.u.uprops[SLIMED].intrinsic ? S("") : S(" still"), S("turning into slime"));
      await make_slimed(newtimeout, P(buf));
      { $g = 7; continue $L; };
    case 13:
      sprintf(P(buf), P(wiz_intrinsic$fmt), !G.u.uprops[STONED].intrinsic ? S("") : S(" still"), S("turning into stone"));
      await make_stoned(newtimeout, P(buf), KILLED_BY, P(wiz_intrinsic$wizintrinsic));
      { $g = 7; continue $L; };
    case 14:
      await make_stunned(newtimeout, TRUE);
      { $g = 7; continue $L; };
    case 15:
      sprintf(P(buf), P(wiz_intrinsic$fmt), !G.u.uprops[VOMITING].intrinsic ? S("") : S(" still"), S("vomiting"));
      await make_vomiting(newtimeout, FALSE);
      await pline(S("%s"), P(buf));
      { $g = 7; continue $L; };
    case 16:
      if (!(G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic)) {
        G.context.warntype.speciesidx = PM_GRID_BUG;
        G.context.warntype.species = $sat(G.mons, G.context.warntype.speciesidx);
      }
      { $g = 1; continue $L; }
    case 17:
      make_glib(newtimeout | 0);
      { $g = 1; continue $L; }
    case 18:
    case 19:
      float_vs_flight();
    case 20:
    case 1: // def_feedback
      await pline(S("Timeout for %s %s %d."), G.propertynames[i].prop_name, oldtimeout ? S("increased by") : S("set to"), amt);
      if (p !== GLIB) {
        incr_itimeout(P(G.u.uprops[p], "intrinsic"), amt);
      }
      { $g = 7; continue $L; };
    case 7:
      G.context.botl = 1;
    case 5:
      ++j;
      { $g = 4; continue $L; }
    case 6:
      if (n >= 1) {
        free(pick_list[0]);
      }
      await doredraw();
      { $g = 2; continue $L; }
    case 3:
      await pline(P(unavailcmd), visctrl(cmd_from_func(wiz_intrinsic)));
    case 2:
      return 0;
    }
    break;
  }
}

async function wiz_rumor_check(): Promise<number> {
  await rumor_check();
  return 0;
}

async function doterrain(): Promise<number> {
  let men = 0;
  const sel = [null];
  let any = new union_any();
  let n = 0;
  let which = 0;
  men = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(men);
  any.$cp(G.zeroany);
  any.a_int = 1;
  await G.windowprocs.win_add_menu(men, NO_GLYPH, any, 0, 0, ATR_NONE, S("known map without monsters, objects, and traps"), MENU_SELECTED);
  any.a_int = 2;
  await G.windowprocs.win_add_menu(men, NO_GLYPH, any, 0, 0, ATR_NONE, S("known map without monsters and objects"), MENU_UNSELECTED);
  any.a_int = 3;
  await G.windowprocs.win_add_menu(men, NO_GLYPH, any, 0, 0, ATR_NONE, S("known map without monsters"), MENU_UNSELECTED);
  if (G.flags.explore || G.flags.debug) {
    any.a_int = 4;
    await G.windowprocs.win_add_menu(men, NO_GLYPH, any, 0, 0, ATR_NONE, S("full map without monsters, objects, and traps"), MENU_UNSELECTED);
    if (G.flags.debug) {
      any.a_int = 5;
      await G.windowprocs.win_add_menu(men, NO_GLYPH, any, 0, 0, ATR_NONE, S("internal levl[][].typ codes in base-36"), MENU_UNSELECTED);
      any.a_int = 6;
      await G.windowprocs.win_add_menu(men, NO_GLYPH, any, 0, 0, ATR_NONE, S("legend of base-36 levl[][].typ codes"), MENU_UNSELECTED);
    }
  }
  await G.windowprocs.win_end_menu(men, S("View which?"));
  n = await G.windowprocs.win_select_menu(men, PICK_ONE, P(sel, 0));
  await G.windowprocs.win_destroy_nhwindow(men);
  which = n < 0 ? -1 : n === 0 ? 1 : sel[0].item.a_int;
  if (n > 1 && which === 1) {
    which = $sadd(sel[0], 1).item.a_int;
  }
  if (n > 0) {
    free(sel[0]);
  }
  switch (which) {
  case 1:
    await reveal_terrain(0, TER_MAP);
    break;
  case 2:
    await reveal_terrain(0, TER_MAP | TER_TRP);
    break;
  case 3:
    await reveal_terrain(0, TER_MAP | TER_TRP | TER_OBJ);
    break;
  case 4:
    await reveal_terrain(1, TER_MAP);
    break;
  case 5:
    await wiz_map_levltyp();
    break;
  case 6:
    await wiz_levltyp_legend();
    break;
  default:
    break;
  }
  return 0;
}

async function enlght_out(buf: Ptr | null): Promise<void> {
  if (en_via_menu) {
    let any = new union_any();
    any.$cp(G.zeroany);
    await G.windowprocs.win_add_menu(en_win, NO_GLYPH, any, 0, 0, ATR_NONE, buf, FALSE);
  } else {
    await G.windowprocs.win_putstr(en_win, 0, buf);
  }
}

async function enlght_line(start: Ptr | null, middle: Ptr | null, end: Ptr | null, ps: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  sprintf(P(buf), S(" %s%s%s%s."), start, middle, end, ps);
  await enlght_out(P(buf));
}

async function enlght_combatinc(inctyp: Ptr | null, incamt: number, final: number, outbuf: Ptr | null): Promise<Ptr | null> {
  let modif = null;
  let bonus = null;
  let invrt = 0;
  let absamt = 0;
  absamt = Math.abs(incamt);
  if (!strcmp(inctyp, S("defense"))) {
    absamt = absamt * 2 / 3 | 0;
  }
  if (absamt <= 3) {
    modif = S("small");
  } else if (absamt <= 6) {
    modif = S("moderate");
  } else if (absamt <= 12) {
    modif = S("large");
  } else {
    modif = S("huge");
  }
  modif = !incamt ? S("no") : await an(modif);
  bonus = incamt >= 0 ? S("bonus") : S("penalty");
  invrt = (strcmp(inctyp, S("to hit")) ? TRUE : FALSE) << 24 >> 24;
  sprintf(outbuf, S("%s %s %s"), modif, invrt ? inctyp : bonus, invrt ? bonus : inctyp);
  if (final || G.flags.debug) {
    sprintf(eos(outbuf), S(" (%s%d)"), incamt > 0 ? S("+") : S(""), incamt);
  }
  return outbuf;
}

async function enlght_halfdmg(category: number, final: number): Promise<void> {
  let category_name = null;
  let buf = new Int8Array(256);
  switch (category) {
  case HALF_PHDAM:
    category_name = S("physical");
    break;
  case HALF_SPDAM:
    category_name = S("spell");
    break;
  default:
    category_name = S("unknown");
    break;
  }
  sprintf(P(buf), S(" %s %s damage"), final || G.flags.debug ? S("half") : S("reduced"), category_name);
  await enlght_line(P(You_), final ? S("took") : S("take"), P(buf), await from_what(category));
}

function walking_on_water(): number {
  if (G.u.uinwater | 0 || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
    return FALSE;
  }
  return (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && (is_pool(G.u.ux, G.u.uy) || is_lava(G.u.ux, G.u.uy)) ? 1 : 0) << 24 >> 24;
}

function cause_known(propindx: number): number {
  let o = null;
  let mask = W_ARMOR | W_AMUL | W_RING | W_TOOL;
  for (o = G.invent; o; o = o.nobj) {
    if (!(o.owornmask & mask)) {
      continue;
    }
    if (G.objects[o.otyp].oc_oprop === propindx && G.objects[o.otyp].oc_name_known | 0 && o.dknown | 0) {
      return TRUE;
    }
  }
  return FALSE;
}

function attrval(attrindx: number, attrvalue: number, resultbuf: Ptr | null): Ptr | null {
  if (attrindx !== A_STR || attrvalue <= 18) {
    sprintf(resultbuf, S("%d"), attrvalue);
  } else if (attrvalue > 18 + 100) {
    sprintf(resultbuf, S("%d"), attrvalue - 100);
  } else {
    sprintf(resultbuf, S("18/%02d"), attrvalue - 18);
  }
  return resultbuf;
}

export async function enlightenment(mode: number, final: number): Promise<void> {
  let buf = new Int8Array(256);
  let tmpbuf = new Int8Array(256);
  en_win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  en_via_menu = (!final ? 1 : 0) << 24 >> 24;
  if (en_via_menu) {
    await G.windowprocs.win_start_menu(en_win);
  }
  strcpy(P(tmpbuf), P(G.plname));
  $wr(P(tmpbuf), 0, highc($rd(P(tmpbuf))));
  sprintf(P(buf), S("%s the %s's attributes:"), P(tmpbuf), (G.u.umonnum !== G.u.umonster ? G.u.mfemale | 0 : G.flags.female) && G.urole.name.f ? G.urole.name.f : G.urole.name.m);
  await enlght_out(P(buf));
  if (mode & BASICENLIGHTENMENT) {
    await background_enlightenment(mode, final);
    await basics_enlightenment(mode, final);
    await characteristics_enlightenment(mode, final);
  }
  await status_enlightenment(mode, final);
  if (mode & MAGICENLIGHTENMENT) {
    await attributes_enlightenment(mode, final);
  }
  if (!en_via_menu) {
    await G.windowprocs.win_display_nhwindow(en_win, TRUE);
  } else {
    const selected = [null];
    selected[0] = null;
    await G.windowprocs.win_end_menu(en_win, null);
    if (await G.windowprocs.win_select_menu(en_win, PICK_NONE, P(selected, 0)) > 0) {
      free(selected[0]);
    }
    en_via_menu = FALSE;
  }
  await G.windowprocs.win_destroy_nhwindow(en_win);
  en_win = WIN_ERR;
}

async function background_enlightenment(unused_mode: number, final: number): Promise<void> {
  let role_titl = null;
  let rank_titl = null;
  let innategend = 0;
  let difgend = 0;
  let difalgn = 0;
  let buf = new Int8Array(256);
  let tmpbuf = new Int8Array(256);
  innategend = (G.u.umonnum !== G.u.umonster ? G.u.mfemale | 0 : G.flags.female) ? 1 : 0;
  role_titl = innategend && G.urole.name.f ? G.urole.name.f : G.urole.name.m;
  rank_titl = rank_of(G.u.ulevel, G.urole.malenum, innategend);
  await enlght_out(S(""));
  await enlght_out(S("Background:"));
  if (G.u.umonnum !== G.u.umonster) {
    let uasmon = G.youmonst.data;
    tmpbuf[0] = 0;
    if (!((uasmon.mflags2 & 65536) >>> 0 !== 0) && !((uasmon.mflags2 & 131072) >>> 0 !== 0) && !((uasmon.mflags2 & 262144) >>> 0 !== 0)) {
      sprintf(P(tmpbuf), S("%s "), G.genders[G.flags.female ? 1 : 0].adj);
    }
    sprintf(P(buf), S("%sin %s%s form"), !final ? S("currently ") : S(""), P(tmpbuf), uasmon.mname);
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  tmpbuf[0] = 0;
  if (!G.urole.name.f && ((G.urole.allow & ROLE_GENDMASK) === (ROLE_MALE | ROLE_FEMALE) || innategend !== G.flags.initgend)) {
    sprintf(P(tmpbuf), S("%s "), G.genders[innategend].adj);
  }
  buf[0] = 0;
  if (G.u.umonnum !== G.u.umonster) {
    strcpy(P(buf), S("actually "));
  }
  if (!strncmpi(rank_titl, role_titl, -1)) {
    sprintf(eos(P(buf)), S("%s, level %d %s%s"), await an(rank_titl), G.u.ulevel, P(tmpbuf), G.urace.noun);
  } else {
    sprintf(eos(P(buf)), S("%s, a level %d %s%s %s"), await an(rank_titl), G.u.ulevel, P(tmpbuf), G.urace.adj, role_titl);
  }
  await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  sprintf(P(buf), S(" %s%s%s, %son a mission for %s"), P(You_), !final ? P(are) : P(were), align_str(G.u.ualign.type), G.u.ualign.type !== G.u.ualignbase[A_CURRENT] ? !final ? S("currently ") : S("temporarily ") : G.u.ualign.type !== G.u.ualignbase[A_ORIGINAL] ? !final ? S("now ") : S("belatedly ") : !G.u.uconduct.gnostic && G.moves > 1000 ? S("nominally ") : S(""), await u_gname());
  await enlght_out(P(buf));
  sprintf(P(buf), S(" who %s opposed by"), !final ? S("is") : S("was"));
  if (G.u.ualign.type !== A_LAWFUL) {
    sprintf(eos(P(buf)), S(" %s (%s) and"), await align_gname(A_LAWFUL), align_str(A_LAWFUL));
  }
  if (G.u.ualign.type !== A_NEUTRAL) {
    sprintf(eos(P(buf)), S(" %s (%s)%s"), await align_gname(A_NEUTRAL), align_str(A_NEUTRAL), G.u.ualign.type !== A_CHAOTIC ? S(" and") : S(""));
  }
  if (G.u.ualign.type !== A_CHAOTIC) {
    sprintf(eos(P(buf)), S(" %s (%s)"), await align_gname(A_CHAOTIC), align_str(A_CHAOTIC));
  }
  strcat(P(buf), S("."));
  await enlght_out(P(buf));
  difgend = innategend !== G.flags.initgend ? 1 : 0;
  difalgn = (G.u.ualign.type !== G.u.ualignbase[A_CURRENT] ? 1 : 0) + (G.u.ualignbase[A_CURRENT] !== G.u.ualignbase[A_ORIGINAL] ? 2 : 0);
  if (difalgn & 1) {
    sprintf(P(buf), S("actually %s"), align_str(G.u.ualignbase[A_CURRENT]));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
    difalgn &= ~1;
  }
  if (difgend || difalgn) {
    sprintf(P(buf), S(" You started out %s%s%s."), difgend ? G.genders[G.flags.initgend].adj : S(""), difgend && difalgn ? S(" and ") : S(""), difalgn ? align_str(G.u.ualignbase[A_ORIGINAL]) : S(""));
    await enlght_out(P(buf));
  }
  $wr(P(buf), 0, $wr(P(tmpbuf), 0, 0));
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    let egdepth = observable_depth(G.u.uz);
    endgamelevelname(P(tmpbuf), egdepth);
    sprintf(P(buf), S("in the endgame, on the %s%s"), !strncmp(P(tmpbuf), S("Plane"), 5) ? S("Elemental ") : S(""), P(tmpbuf));
  } else if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
    sprintf(P(buf), S("on the %s level"), P(G.dungeons[G.u.uz.dnum].dname));
  } else {
    let dgnbuf = new Int8Array(128);
    strcpy(P(dgnbuf), P(G.dungeons[G.u.uz.dnum].dname));
    if (!strncmpi(P(dgnbuf), S("The "), 4)) {
      $wr(P(dgnbuf), 0, lowc($rd(P(dgnbuf))));
    }
    sprintf(P(tmpbuf), S("level %d"), In_quest(G.u.uz) ? dunlev(G.u.uz) : depth(G.u.uz));
    if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
      strcat(P(tmpbuf), S(", a primitive area"));
    } else if ((G.dungeon_topology.d_bigroom_level.dlevel || G.dungeon_topology.d_bigroom_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_bigroom_level) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      strcat(P(tmpbuf), S(", a very big room"));
    }
    sprintf(P(buf), S("in %s, on %s"), P(dgnbuf), P(tmpbuf));
  }
  await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  if (G.moves === 1) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("just started your adventure"), S(""));
  } else {
    sprintf(P(buf), S("the dungeon %ld turn%s ago"), G.moves, G.moves === 1 ? S("") : S("s"));
    await enlght_line(P(You_), S("entered "), P(buf), S(""));
  }
  if (final ? G.iflags.at_midnight : midnight()) {
    await enlght_line(S("It "), final ? S("was ") : S("is "), S("the midnight hour"), S(""));
  } else if (final ? G.iflags.at_night : night()) {
    await enlght_line(S("It "), final ? S("was ") : S("is "), S("nighttime"), S(""));
  }
  if (G.flags.moonphase === FULL_MOON || G.flags.moonphase === NEW_MOON) {
    sprintf(P(buf), S("a %s moon in effect%s"), G.flags.moonphase === FULL_MOON ? S("full") : G.flags.moonphase === NEW_MOON ? S("new") : G.flags.moonphase < FULL_MOON ? S("first quarter") : S("last quarter"), final ? S(" when your adventure ended") : S(""));
    await enlght_line(S("There "), final ? S("was ") : S("is "), P(buf), S(""));
  }
  if (G.flags.friday13) {
    sprintf(P(buf), S(" Bad things %s on Friday the 13th."), !final ? S("can happen") : final === ENL_GAMEOVERALIVE ? S("could have happened") : S("happened"));
    await enlght_out(P(buf));
  }
  if (!(G.u.umonnum !== G.u.umonster)) {
    let ulvl = G.u.ulevel;
    sprintf(P(buf), S("%-1ld experience point%s"), G.u.uexp, G.u.uexp === 1 ? S("") : S("s"));
    if (ulvl < 30 && (final || G.flags.debug)) {
      let nxtlvl = newuexp(ulvl);
      let delta = nxtlvl - G.u.uexp;
      sprintf(eos(P(buf)), S(", %ld %s%sneeded %s level %d"), delta, G.u.uexp > 0 ? S("more ") : S(""), !final ? S("") : delta === 1 ? S("was ") : S("were "), ulvl < 18 ? S("to attain") : S("for"), ulvl + 1);
    }
    await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
  }
}

async function basics_enlightenment(mode: number, final: number): Promise<void> {
  let buf = new Int8Array(256);
  let pw = G.u.uen;
  let hp = G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp;
  let pwmax = G.u.uenmax;
  let hpmax = G.u.umonnum !== G.u.umonster ? G.u.mhmax : G.u.uhpmax;
  await enlght_out(S(""));
  await enlght_out(S("Basics:"));
  if (hp < 0) {
    hp = 0;
  }
  if (hp === hpmax && hpmax > 1) {
    sprintf(P(buf), S("all %d hit points"), hpmax);
  } else {
    sprintf(P(buf), S("%d out of %d hit point%s"), hp, hpmax, hpmax === 1 ? S("") : S("s"));
  }
  await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
  if (pwmax === 0 || pw === pwmax && pwmax === 2) {
    sprintf(P(buf), S("%s %s"), !pwmax ? S("no") : S("both"), P(basics_enlightenment$Power));
  } else if (pw === pwmax && pwmax > 2) {
    sprintf(P(buf), S("all %d %s"), pwmax, P(basics_enlightenment$Power));
  } else {
    sprintf(P(buf), S("%d out of %d %s"), pw, pwmax, P(basics_enlightenment$Power));
  }
  await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
  if (G.u.umonnum !== G.u.umonster) {
    switch (G.mons[G.u.umonnum].mlevel) {
    case 0:
      strcpy(P(buf), S("0 hit dice (actually 1/2)"));
      break;
    case 1:
      strcpy(P(buf), S("1 hit die"));
      break;
    default:
      sprintf(P(buf), S("%d hit dice"), G.mons[G.u.umonnum].mlevel);
      break;
    }
    await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
  }
  sprintf(P(buf), S("%d"), G.u.uac);
  await enlght_line(S("Your armor class "), final ? S("was ") : S("is "), P(buf), S(""));
  {
    let umoney = money_cnt(G.invent);
    if (!umoney) {
      await enlght_line(P(basics_enlightenment$Your_wallet), final ? S("was ") : S("is "), S("empty"), S(""));
    } else {
      sprintf(P(buf), S("%ld %s"), umoney, await currency(umoney));
      await enlght_line(P(basics_enlightenment$Your_wallet), final ? S("contained ") : S("contains "), P(buf), S(""));
    }
  }
  if (G.flags.pickup) {
    let ocl = new Int8Array(19);
    strcpy(P(buf), S("on"));
    await oc_to_str(P(G.flags.pickup_types), P(ocl));
    sprintf(eos(P(buf)), S(" for %s%s%s"), $rd(P(ocl)) ? S("'") : S(""), $rd(P(ocl)) ? P(ocl) : S("all types"), $rd(P(ocl)) ? S("'") : S(""));
    if (G.flags.pickup_thrown && $rd(P(ocl))) {
      strcat(P(buf), S(" plus thrown"));
    }
    if (G.apelist) {
      strcat(P(buf), S(", with exceptions"));
    }
  } else {
    strcpy(P(buf), S("off"));
  }
  await enlght_line(S("Autopickup "), final ? S("was ") : S("is "), P(buf), S(""));
}

async function characteristics_enlightenment(mode: number, final: number): Promise<void> {
  let buf = new Int8Array(256);
  await enlght_out(S(""));
  sprintf(P(buf), S("%s Characteristics:"), !final ? S("Current") : S("Final"));
  await enlght_out(P(buf));
  await one_characteristic(mode, final, A_STR);
  await one_characteristic(mode, final, A_DEX);
  await one_characteristic(mode, final, A_CON);
  await one_characteristic(mode, final, A_INT);
  await one_characteristic(mode, final, A_WIS);
  await one_characteristic(mode, final, A_CHA);
}

async function one_characteristic(mode: number, final: number, attrindx: number): Promise<void> {
  let hide_innate_value = FALSE;
  let interesting_alimit = 0;
  let acurrent = 0;
  let abase = 0;
  let apeak = 0;
  let alimit = 0;
  let paren_pfx = null;
  let subjbuf = new Int8Array(256);
  let valubuf = new Int8Array(256);
  let valstring = new Int8Array(32);
  if (G.u.umonnum !== G.u.umonster) {
    hide_innate_value = TRUE;
  } else if (G.u.uprops[FIXED_ABIL].extrinsic) {
    if (await stuck_ring(G.uleft, RIN_SUSTAIN_ABILITY) || await stuck_ring(G.uright, RIN_SUSTAIN_ABILITY)) {
      hide_innate_value = TRUE;
    }
  }
  switch (attrindx) {
  case A_STR:
    if (G.uarmg && G.uarmg.otyp === GAUNTLETS_OF_POWER && G.uarmg.cursed | 0) {
      hide_innate_value = TRUE;
    }
    break;
  case A_DEX:
    break;
  case A_CON:
    if (G.uwep && G.uwep.oartifact === ART_OGRESMASHER && G.uwep.cursed | 0) {
      hide_innate_value = TRUE;
    }
    break;
  case A_INT:
    if (G.uarmh && G.uarmh.otyp === DUNCE_CAP && G.uarmh.cursed | 0) {
      hide_innate_value = TRUE;
    }
    break;
  case A_WIS:
    if (G.uarmh && G.uarmh.otyp === DUNCE_CAP && G.uarmh.cursed | 0) {
      hide_innate_value = TRUE;
    }
    break;
  case A_CHA:
    break;
  default:
    return;
  }
  ;
  if (mode & MAGICENLIGHTENMENT && !(G.u.umonnum !== G.u.umonster)) {
    hide_innate_value = FALSE;
  }
  acurrent = acurr(attrindx);
  attrval(attrindx, acurrent, P(valubuf));
  sprintf(P(subjbuf), S("Your %s "), G.attrname[attrindx]);
  if (!hide_innate_value) {
    abase = G.u.acurr.a[attrindx];
    apeak = G.u.amax.a[attrindx];
    alimit = attrindx === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[attrindx];
    interesting_alimit = (final ? TRUE : alimit !== (attrindx !== A_STR ? 18 : 18 + 100) ? 1 : 0) << 24 >> 24;
    paren_pfx = final ? S(" (") : S(" (current; ");
    if (acurrent !== abase) {
      sprintf(eos(P(valubuf)), S("%sbase:%s"), paren_pfx, attrval(attrindx, abase, P(valstring)));
      paren_pfx = S(", ");
    }
    if (abase !== apeak) {
      sprintf(eos(P(valubuf)), S("%speak:%s"), paren_pfx, attrval(attrindx, apeak, P(valstring)));
      paren_pfx = S(", ");
    }
    if (interesting_alimit) {
      sprintf(eos(P(valubuf)), S("%s%slimit:%s"), paren_pfx, acurrent > alimit ? S("innate ") : S(""), attrval(attrindx, alimit, P(valstring)));
    }
    if (acurrent !== abase || abase !== apeak || interesting_alimit) {
      strcat(P(valubuf), S(")"));
    }
  }
  await enlght_line(P(subjbuf), final ? S("was ") : S("is "), P(valubuf), S(""));
}

async function status_enlightenment(mode: number, final: number): Promise<void> {
  let magic = (mode & MAGICENLIGHTENMENT ? TRUE : FALSE) << 24 >> 24;
  let cap = 0;
  let wtype = 0;
  let buf = new Int8Array(256);
  let youtoo = new Int8Array(256);
  let Riding = (G.u.usteed && !(final === ENL_GAMEOVERDEAD && !strcmp(P(G.killer.name), S("riding accident"))) ? 1 : 0) << 24 >> 24;
  let steedname = !Riding ? null : await x_monnam(G.u.usteed, G.u.usteed.mtame ? ARTICLE_YOUR : ARTICLE_THE, null, SUPPRESS_SADDLE | SUPPRESS_HALLUCINATION, FALSE);
  await enlght_out(S(""));
  await enlght_out(final ? S("Final Status:") : S("Current Status:"));
  strcpy(P(youtoo), P(You_));
  if (G.u.umonnum !== G.u.umonster) {
    strcpy(P(buf), S("transformed"));
    if (ugenocided()) {
      sprintf(eos(P(buf)), S(" and %s %s inside"), final ? S("felt") : S("feel"), udeadinside());
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if (Riding) {
    sprintf(P(buf), S("riding %s"), steedname);
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
    sprintf(eos(P(youtoo)), S("and %s "), steedname);
  }
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    if (((G.u.uprops[LEVITATION].intrinsic & 536870912) !== 0 || (G.u.uprops[LEVITATION].extrinsic & 8192) !== 0) && (G.u.uprops[LEVITATION].intrinsic & ~(536870912 | 16777215)) === 0 && (G.u.uprops[LEVITATION].extrinsic & ~8192) === 0 && magic) {
      await enlght_line(P(You_), final ? P(were) : P(are), S("levitating, at will"), S(""));
    } else {
      await enlght_line(P(youtoo), final ? P(were) : P(are), S("levitating"), await from_what(LEVITATION));
    }
  } else if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
    await enlght_line(P(youtoo), final ? P(were) : P(are), S("flying"), await from_what(FLYING));
  }
  if (G.u.uinwater) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("underwater"), S(""));
  } else if (G.u.uinwater) {
    await enlght_line(P(You_), final ? P(were) : P(are), G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0 ? S("swimming") : S("in water"), await from_what(SWIMMING));
  } else if (walking_on_water()) {
    sprintf(P(buf), S("walking on %s"), is_pool(G.u.ux, G.u.uy) ? S("water") : is_lava(G.u.ux, G.u.uy) ? S("lava") : surface(G.u.ux, G.u.uy));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), await from_what(WWALKING));
  }
  if (G.u.umonnum !== G.u.umonster && (G.u.uundetected | 0 || (G.youmonst.m_ap_type & 7) !== M_AP_NOTHING)) {
    await youhiding(TRUE, final);
  }
  if (G.u.uprops[STONED].intrinsic) {
    if (final && G.u.uprops[STONED].intrinsic & I_SPECIAL) {
      await enlght_out(S(" You turned into stone."));
    } else {
      await enlght_line(P(You_), final ? P(were) : P(are), S("turning to stone"), S(""));
    }
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    if (final && G.u.uprops[SLIMED].intrinsic & I_SPECIAL) {
      await enlght_out(S(" You turned into slime."));
    } else {
      await enlght_line(P(You_), final ? P(were) : P(are), S("turning into slime"), S(""));
    }
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    if (G.u.uburied) {
      await enlght_line(P(You_), final ? P(were) : P(are), S("buried"), S(""));
    } else {
      if (final && G.u.uprops[STRANGLED].intrinsic & I_SPECIAL) {
        await enlght_out(S(" You died from strangulation."));
      } else {
        strcpy(P(buf), S("being strangled"));
        if (G.flags.debug) {
          sprintf(eos(P(buf)), S(" (%ld)"), G.u.uprops[STRANGLED].intrinsic & TIMEOUT);
        }
        await enlght_line(P(You_), final ? P(were) : P(are), P(buf), await from_what(STRANGLED));
      }
    }
  }
  if (G.u.uprops[SICK].intrinsic) {
    if (final && G.u.uprops[SICK].intrinsic & I_SPECIAL) {
      sprintf(P(buf), S(" %sdied from %s."), P(You_), (G.u.usick_type | 0) & SICK_NONVOMITABLE ? S("terminal illness") : S("food poisoning"));
      await enlght_out(P(buf));
    } else {
      if ((G.u.usick_type | 0) & SICK_NONVOMITABLE) {
        await enlght_line(P(You_), final ? P(were) : P(are), S("terminally sick from illness"), S(""));
      }
      if ((G.u.usick_type | 0) & SICK_VOMITABLE) {
        await enlght_line(P(You_), final ? P(were) : P(are), S("terminally sick from food poisoning"), S(""));
      }
    }
  }
  if (G.u.uprops[VOMITING].intrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("nauseated"), S(""));
  }
  if (G.u.uprops[STUNNED].intrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("stunned"), S(""));
  }
  if (G.u.uprops[CONFUSION].intrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("confused"), S(""));
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("hallucinating"), S(""));
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    sprintf(P(buf), S("%s blind"), !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? S("innately") : G.u.uroleplay.blind ? S("permanently") : G.ublindf && G.ublindf.otyp !== 207 && G.ublindf.oartifact !== 26 && !G.u.uroleplay.blind && !G.u.uprops[BLINDED].intrinsic && (G.youmonst.data.mflags1 & 4096) >>> 0 === 0 ? S("deliberately") : S("temporarily"));
    if (G.flags.debug && (G.u.uprops[BLINDED].intrinsic & TIMEOUT) !== 0 && !G.u.uroleplay.blind && (G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
      sprintf(eos(P(buf)), S(" (%ld)"), G.u.uprops[BLINDED].intrinsic & TIMEOUT);
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? S("") : await from_what(BLINDED));
  }
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("deaf"), await from_what(DEAF));
  }
  if (!!G.uball) {
    if (G.uball) {
      sprintf(P(buf), S("chained to %s"), await ansimpleoname(G.uball));
    } else {
      await impossible(S("Punished without uball?"));
      strcpy(P(buf), S("punished"));
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if (G.u.utrap) {
    let predicament = new Int8Array(256);
    let t = null;
    let anchored = (G.u.utraptype === TT_BURIEDBALL ? 1 : 0) << 24 >> 24;
    if (anchored) {
      strcpy(P(predicament), S("tethered to something buried"));
    } else if (G.u.utraptype === TT_INFLOOR || G.u.utraptype === TT_LAVA) {
      sprintf(P(predicament), S("stuck in %s"), await the(surface(G.u.ux, G.u.uy)));
    } else {
      strcpy(P(predicament), S("trapped"));
      if (!!(t = t_at(G.u.ux, G.u.uy))) {
        sprintf(eos(P(predicament)), S(" in %s"), await an(G.defsyms[S_arrow_trap + (t.ttyp | 0) - 1].explanation));
      }
    }
    if (G.u.usteed) {
      sprintf(P(buf), S("%s%s "), anchored ? S("you and ") : S(""), steedname);
      $wr(P(buf), 0, highc($rd(P(buf))));
      await enlght_line(P(buf), final ? anchored ? S("were ") : S("was ") : anchored ? S("are ") : S("is "), P(predicament), S(""));
    } else {
      await enlght_line(P(You_), final ? P(were) : P(are), P(predicament), S(""));
    }
  }
  if (G.u.uswallow) {
    sprintf(P(buf), S("swallowed by %s"), await a_monnam(G.u.ustuck));
    if (G.flags.debug) {
      sprintf(eos(P(buf)), S(" (%u)"), G.u.uswldtim);
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  } else if (G.u.ustuck) {
    sprintf(P(buf), S("%s %s"), G.u.umonnum !== G.u.umonster && sticks(G.youmonst.data) ? S("holding") : S("held by"), await a_monnam(G.u.ustuck));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if (Riding) {
    let saddle = await which_armor(G.u.usteed, W_SADDLE);
    if (saddle && saddle.cursed | 0) {
      sprintf(P(buf), S("stuck to %s %s"), s_suffix(steedname), await simpleonames(saddle));
      await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
    }
  }
  if (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) {
    if (G.u.usteed) {
      if (G.flags.debug && steedname) {
        strcpy(P(buf), steedname);
        $wr(P(buf), 0, highc($rd(P(buf))));
        await enlght_line(P(buf), final ? S(" had") : S(" has"), S(" wounded legs"), S(""));
      }
    } else {
      sprintf(P(buf), S("wounded %s"), await makeplural(body_part(LEG)));
      await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
    }
  }
  if (G.u.uprops[GLIB].intrinsic) {
    sprintf(P(buf), S("slippery %s"), await fingers_or_gloves(TRUE));
    if (G.flags.debug) {
      sprintf(eos(P(buf)), S(" (%ld)"), G.u.uprops[GLIB].intrinsic & TIMEOUT);
    }
    await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
  }
  if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) {
    if (magic || cause_known(FUMBLING)) {
      await enlght_line(P(You_), final ? S("fumbled") : S("fumble"), S(""), await from_what(FUMBLING));
    }
  }
  if (G.u.uprops[SLEEPY].intrinsic || G.u.uprops[SLEEPY].extrinsic) {
    if (magic || cause_known(SLEEPY)) {
      strcpy(P(buf), await from_what(SLEEPY));
      if (G.flags.debug) {
        sprintf(eos(P(buf)), S(" (%ld)"), G.u.uprops[SLEEPY].intrinsic & TIMEOUT);
      }
      await enlght_line(S("You "), final ? S("fell") : S("fall"), S(" asleep uncontrollably"), P(buf));
    }
  }
  if (G.u.uprops[HUNGER].intrinsic || G.u.uprops[HUNGER].extrinsic) {
    if (magic || cause_known(HUNGER)) {
      await enlght_line(P(You_), final ? S("hungered") : S("hunger"), S(" rapidly"), await from_what(HUNGER));
    }
  }
  strcpy(P(buf), G.hu_stat[G.u.uhs]);
  mungspaces(P(buf));
  if ($rd(P(buf))) {
    $wr(P(buf), 0, lowc($rd(P(buf))));
    if (!strcmp(P(buf), S("weak"))) {
      strcat(P(buf), S(" from severe hunger"));
    } else if (!strncmp(P(buf), S("faint"), 5)) {
      strcat(P(buf), S(" due to starvation"));
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if ((cap = near_capacity()) > UNENCUMBERED) {
    let adj = S("?_?");
    strcpy(P(buf), G.enc_stat[cap]);
    $wr(P(buf), 0, lowc($rd(P(buf))));
    switch (cap) {
    case SLT_ENCUMBER:
      adj = S("slightly");
      break;
    case MOD_ENCUMBER:
      adj = S("moderately");
      break;
    case HVY_ENCUMBER:
      adj = S("very");
      break;
    case EXT_ENCUMBER:
      adj = S("extremely");
      break;
    case OVERLOADED:
      adj = S("not possible");
      break;
    }
    sprintf(eos(P(buf)), S("; movement %s %s%s"), !final ? S("is") : S("was"), adj, cap < OVERLOADED ? S(" slowed") : S(""));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  } else {
    await enlght_line(P(You_), final ? P(were) : P(are), S("unencumbered"), S(""));
  }
  if (!G.uwep) {
    await enlght_line(P(You_), final ? P(were) : P(are), G.uarmg ? S("empty handed") : (G.youmonst.data.mflags1 & 131072) >>> 0 !== 0 ? S("bare handed") : S("not wielding anything"), S(""));
  } else if (G.u.twoweap) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("wielding two weapons at once"), S(""));
  } else {
    let what = await weapon_descr(G.uwep);
    if (!strncmpi(what, S("armor"), -1) || !strncmpi(what, S("food"), -1) || !strncmpi(what, S("venom"), -1)) {
      sprintf(P(buf), S("wielding some %s"), what);
    } else {
      sprintf(P(buf), S("wielding %s"), G.uwep.quan === 1 ? await an(what) : await makeplural(what));
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if ((wtype = uwep_skill_type()) !== P_NONE) {
    let sklvlbuf = new Int8Array(20);
    let sklvl = G.u.weapon_skills[wtype].skill;
    let hav = (sklvl !== P_UNSKILLED && sklvl !== P_SKILLED ? 1 : 0) << 24 >> 24;
    if (sklvl === P_ISRESTRICTED) {
      strcpy(P(sklvlbuf), S("no"));
    } else {
      lcase(skill_level_name(wtype, P(sklvlbuf)));
    }
    sprintf(P(buf), S("%s %s %s"), P(sklvlbuf), hav ? S("skill with") : S("in"), skill_name(wtype));
    if (can_advance(wtype, FALSE)) {
      sprintf(eos(P(buf)), S(" and %s that"), !final ? S("can enhance") : S("could have enhanced"));
    }
    if (hav) {
      await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
    } else {
      await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
    }
  }
  if (!G.uarm && !G.uarmu && !G.uarmc && !G.uarms && !G.uarmg && !G.uarmf && !G.uarmh) {
    if (G.u.uroleplay.nudist) {
      await enlght_line(P(You_), final ? S("did") : S("do"), S(" not wear any armor"), S(""));
    } else {
      await enlght_line(P(You_), final ? P(were) : P(are), S("not wearing any armor"), S(""));
    }
  }
}

async function attributes_enlightenment(unused_mode: number, final: number): Promise<void> {
  let ltmp = 0;
  let armpro = 0;
  let buf = new Int8Array(256);
  await enlght_out(S(""));
  await enlght_out(final ? S("Final Attributes:") : S("Current Attributes:"));
  if (G.u.uevent.uhand_of_elbereth) {
    await enlght_line(P(You_), final ? P(were) : P(are), attributes_enlightenment$hofe_titles[(G.u.uevent.uhand_of_elbereth | 0) - 1], S(""));
  }
  sprintf(P(buf), S("%s"), piousness(TRUE, S("aligned")));
  if (G.u.ualign.record >= 0) {
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  } else {
    await enlght_line(P(You_), final ? P(had) : P(have), P(buf), S(""));
  }
  if (G.flags.debug) {
    sprintf(P(buf), S(" %d"), G.u.ualign.record);
    await enlght_line(S("Your alignment "), final ? S("was") : S("is"), P(buf), S(""));
  }
  if (G.u.uprops[INVULNERABLE].intrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("invulnerable"), await from_what(INVULNERABLE));
  }
  if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("magic-protected"), await from_what(ANTIMAGIC));
  }
  if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("fire resistant"), await from_what(FIRE_RES));
  }
  if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("cold resistant"), await from_what(COLD_RES));
  }
  if (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("sleep resistant"), await from_what(SLEEP_RES));
  }
  if (G.u.uprops[DISINT_RES].intrinsic || G.u.uprops[DISINT_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("disintegration-resistant"), await from_what(DISINT_RES));
  }
  if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("shock resistant"), await from_what(SHOCK_RES));
  }
  if (G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("poison resistant"), await from_what(POISON_RES));
  }
  if (G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("acid resistant"), await from_what(ACID_RES));
  }
  if (G.u.uprops[DRAIN_RES].intrinsic || G.u.uprops[DRAIN_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("level-drain resistant"), await from_what(DRAIN_RES));
  }
  if (G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep)) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("immune to sickness"), await from_what(SICK_RES));
  }
  if (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("petrification resistant"), await from_what(STONE_RES));
  }
  if (G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) {
    await enlght_line(P(You_), final ? S("resisted") : S("resist"), S(" hallucinations"), await from_what(HALLUC_RES));
  }
  if (G.u.uedibility) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("recognize detrimental food"), S(""));
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[BLINDED].intrinsic || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0))) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("see"), await from_what(-BLINDED));
  }
  if (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await enlght_line(P(You_), final ? S("saw") : S("see"), S(" invisible"), await from_what(SEE_INVIS));
    } else {
      await enlght_line(P(You_), final ? S("would have seen") : S("will see"), S(" invisible when not blind"), await from_what(SEE_INVIS));
    }
  }
  if (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("telepathic"), await from_what(TELEPAT));
  }
  if (G.u.uprops[WARNING].intrinsic || G.u.uprops[WARNING].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("warned"), await from_what(WARNING));
  }
  if ((G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && G.context.warntype.obj) {
    sprintf(P(buf), S("aware of the presence of %s"), (G.context.warntype.obj & M2_ORC) >>> 0 ? S("orcs") : (G.context.warntype.obj & M2_ELF) >>> 0 ? S("elves") : (G.context.warntype.obj & M2_DEMON) >>> 0 ? S("demons") : G.c_common_strings.c_something);
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), await from_what(WARN_OF_MON));
  }
  if ((G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && G.context.warntype.polyd) {
    sprintf(P(buf), S("aware of the presence of %s"), (G.context.warntype.polyd & (M2_HUMAN | M2_ELF)) >>> 0 === (M2_HUMAN | M2_ELF) ? S("humans and elves") : (G.context.warntype.polyd & M2_HUMAN) >>> 0 ? S("humans") : (G.context.warntype.polyd & M2_ELF) >>> 0 ? S("elves") : (G.context.warntype.polyd & M2_ORC) >>> 0 ? S("orcs") : (G.context.warntype.polyd & M2_DEMON) >>> 0 ? S("demons") : S("certain monsters"));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if ((G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && G.context.warntype.speciesidx >= LOW_PM) {
    sprintf(P(buf), S("aware of the presence of %s"), await makeplural(G.mons[G.context.warntype.speciesidx].mname));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), await from_what(WARN_OF_MON));
  }
  if (G.u.uprops[WARN_UNDEAD].intrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("warned of undead"), await from_what(WARN_UNDEAD));
  }
  if (G.u.uprops[SEARCHING].intrinsic || G.u.uprops[SEARCHING].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("automatic searching"), await from_what(SEARCHING));
  }
  if ((G.u.uprops[CLAIRVOYANT].intrinsic || G.u.uprops[CLAIRVOYANT].extrinsic) && !G.u.uprops[CLAIRVOYANT].blocked) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("clairvoyant"), await from_what(CLAIRVOYANT));
  } else if ((G.u.uprops[CLAIRVOYANT].intrinsic || G.u.uprops[CLAIRVOYANT].extrinsic) && G.u.uprops[CLAIRVOYANT].blocked) {
    strcpy(P(buf), await from_what(-CLAIRVOYANT));
    if (!strncmp(P(buf), S(" because of "), 12)) {
      strncpy(P(buf), S(" if not for "), 12);
    }
    await enlght_line(P(You_), final ? S("could have been") : S("could be"), S(" clairvoyant"), P(buf));
  }
  if (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("infravision"), await from_what(INFRAVISION));
  }
  if (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("sensing the presence of monsters"), S(""));
  }
  if (G.u.umconf) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("going to confuse monsters"), S(""));
  }
  if (G.u.uprops[ADORNED].extrinsic) {
    let adorn = 0;
    if (G.uleft && G.uleft.otyp === RIN_ADORNMENT) {
      adorn += G.uleft.spe;
    }
    if (G.uright && G.uright.otyp === RIN_ADORNMENT) {
      adorn += G.uright.spe;
    }
    sprintf(P(buf), S("%scharismatic"), adorn > 0 ? S("more ") : adorn < 0 ? S("less ") : S(""));
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), await from_what(ADORNED));
  }
  if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("invisible"), await from_what(INVIS));
  } else if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("invisible to others"), await from_what(INVIS));
  } else if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && G.u.uprops[INVIS].blocked) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("visible"), await from_what(-INVIS));
  }
  if (G.u.uprops[DISPLACED].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("displaced"), await from_what(DISPLACED));
  }
  if ((G.u.uprops[STEALTH].intrinsic || G.u.uprops[STEALTH].extrinsic) && !G.u.uprops[STEALTH].blocked) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("stealthy"), await from_what(STEALTH));
  }
  if (G.u.uprops[AGGRAVATE_MONSTER].intrinsic || G.u.uprops[AGGRAVATE_MONSTER].extrinsic) {
    await enlght_line(S("You aggravate"), final ? S("d") : S(""), S(" monsters"), await from_what(AGGRAVATE_MONSTER));
  }
  if (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) {
    await enlght_line(S("You cause"), final ? S("d") : S(""), S(" conflict"), await from_what(CONFLICT));
  }
  if (G.u.uprops[JUMPING].intrinsic || G.u.uprops[JUMPING].extrinsic) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("jump"), await from_what(JUMPING));
  }
  if (G.u.uprops[TELEPORT].intrinsic || G.u.uprops[TELEPORT].extrinsic) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("teleport"), await from_what(TELEPORT));
  }
  if (G.u.uprops[TELEPORT_CONTROL].intrinsic || G.u.uprops[TELEPORT_CONTROL].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("teleport control"), await from_what(TELEPORT_CONTROL));
  }
  if (G.u.uprops[LEVITATION].blocked) {
    let save_BLev = G.u.uprops[LEVITATION].blocked;
    G.u.uprops[LEVITATION].blocked = 0;
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
      let trapped = ((save_BLev & I_SPECIAL) !== 0 ? 1 : 0) << 24 >> 24;
      let terrain = ((save_BLev & FROMOUTSIDE) !== 0 ? 1 : 0) << 24 >> 24;
      sprintf(P(buf), S("%s%s%s"), trapped ? S(" if not trapped") : S(""), trapped && terrain ? S(" and") : S(""), terrain ? P(attributes_enlightenment$if_surroundings_permitted) : S(""));
      await enlght_line(P(You_), final ? S("would have levitated") : S("would levitate"), P(buf), S(""));
    }
    G.u.uprops[LEVITATION].blocked = save_BLev;
  }
  if (G.u.uprops[FLYING].blocked) {
    let save_BFly = G.u.uprops[FLYING].blocked;
    G.u.uprops[FLYING].blocked = 0;
    if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await enlght_line(P(You_), final ? S("would have flown") : S("would fly"), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S(" if you weren't levitating") : save_BFly === 536870912 ? S(" if you weren't trapped") : save_BFly === 67108864 ? P(attributes_enlightenment$if_surroundings_permitted) : S(" if circumstances permitted"), S(""));
    }
    G.u.uprops[FLYING].blocked = save_BFly;
  }
  if (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !walking_on_water()) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("walk on water"), await from_what(WWALKING));
  }
  if ((G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) && (G.u.uinwater | 0 || !G.u.uinwater)) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("swim"), await from_what(SWIMMING));
  }
  if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("survive without air"), await from_what(MAGICAL_BREATHING));
  } else if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("breathe water"), await from_what(MAGICAL_BREATHING));
  }
  if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("walk through walls"), await from_what(PASSES_WALLS));
  }
  if (G.u.uprops[REGENERATION].intrinsic || G.u.uprops[REGENERATION].extrinsic) {
    await enlght_line(S("You regenerate"), final ? S("d") : S(""), S(""), await from_what(REGENERATION));
  }
  if (G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("slower digestion"), await from_what(SLOW_DIGESTION));
  }
  if (G.u.uhitinc) {
    await enlght_line(P(You_), final ? P(had) : P(have), await enlght_combatinc(S("to hit"), G.u.uhitinc, final, P(buf)), S(""));
  }
  if (G.u.udaminc) {
    await enlght_line(P(You_), final ? P(had) : P(have), await enlght_combatinc(S("damage"), G.u.udaminc, final, P(buf)), S(""));
  }
  if (G.u.uspellprot || (G.u.uprops[PROTECTION].intrinsic || G.u.uprops[PROTECTION].extrinsic)) {
    let prot = 0;
    if (G.uleft && G.uleft.otyp === RIN_PROTECTION) {
      prot += G.uleft.spe;
    }
    if (G.uright && G.uright.otyp === RIN_PROTECTION) {
      prot += G.uright.spe;
    }
    if (G.u.uprops[PROTECTION].intrinsic & INTRINSIC) {
      prot += G.u.ublessed;
    }
    prot += G.u.uspellprot;
    if (prot) {
      await enlght_line(P(You_), final ? P(had) : P(have), await enlght_combatinc(S("defense"), prot, final, P(buf)), S(""));
    }
  }
  if ((armpro = magic_negation(G.youmonst)) > 0) {
    if (armpro >= (Math.trunc(32 / 8) | 0)) {
      armpro = (Math.trunc(32 / 8) | 0) - 1;
    }
    await enlght_line(P(You_), final ? P(were) : P(are), attributes_enlightenment$mc_types[armpro], S(""));
  }
  if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) {
    await enlght_halfdmg(HALF_PHDAM, final);
  }
  if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
    await enlght_halfdmg(HALF_SPDAM, final);
  }
  if (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("protected from shape changers"), await from_what(PROT_FROM_SHAPE_CHANGERS));
  }
  if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
    let what = null;
    if (!(G.u.umonnum !== G.u.umonster)) {
      await enlght_line(P(You_), final ? P(could) : P(can), S("not change from your current form"), await from_what(UNCHANGING));
    }
    if (G.u.uprops[POLYMORPH].intrinsic || G.u.uprops[POLYMORPH].extrinsic) {
      what = !final ? S("polymorph") : S("have polymorphed");
    } else if (G.u.ulycn >= LOW_PM) {
      what = !final ? S("change shape") : S("have changed shape");
    }
    if (what) {
      sprintf(P(buf), S("would %s periodically"), what);
      await enlght_line(P(You_), final ? P(buf) : P(buf), S(" if not locked into your current form"), S(""));
    }
  } else if (G.u.uprops[POLYMORPH].intrinsic || G.u.uprops[POLYMORPH].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("polymorphing periodically"), await from_what(POLYMORPH));
  }
  if (G.u.uprops[POLYMORPH_CONTROL].intrinsic || G.u.uprops[POLYMORPH_CONTROL].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("polymorph control"), await from_what(POLYMORPH_CONTROL));
  }
  if (G.u.umonnum !== G.u.umonster && G.u.umonnum !== G.u.ulycn && !(final === ENL_GAMEOVERDEAD && G.u.umonnum === PM_GREEN_SLIME && !(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic))) {
    sprintf(P(buf), S("polymorphed into %s"), await an(G.youmonst.data.mname));
    if (G.flags.debug) {
      sprintf(eos(P(buf)), S(" (%d)"), G.u.mtimedone);
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if ((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.flags.female) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("lay eggs"), S(""));
  }
  if (G.u.ulycn >= LOW_PM) {
    strcpy(P(buf), await an(G.mons[G.u.ulycn].mname));
    if (G.u.umonnum === G.u.ulycn) {
      strcat(P(buf), S(" in beast form"));
      if (G.flags.debug) {
        sprintf(eos(P(buf)), S(" (%d)"), G.u.mtimedone);
      }
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  }
  if ((G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && G.u.umonnum !== G.u.umonster) {
    await enlght_line(P(You_), final ? P(could) : P(can), S("not change from your current form"), await from_what(UNCHANGING));
  }
  if (G.u.ulycn >= -1 + 1 || hates_silver(G.youmonst.data)) {
    await enlght_line(P(You_), final ? P(were) : P(are), S("harmed by silver"), S(""));
  }
  if (G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic) {
    await enlght_line(P(You_), final ? P(were) : P(are), G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic ? S("very fast") : S("fast"), await from_what(FAST));
  }
  if (G.u.uprops[REFLECTING].intrinsic || G.u.uprops[REFLECTING].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("reflection"), await from_what(REFLECTING));
  }
  if (G.u.uprops[FREE_ACTION].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("free action"), await from_what(FREE_ACTION));
  }
  if (G.u.uprops[FIXED_ABIL].extrinsic) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("fixed abilities"), await from_what(FIXED_ABIL));
  }
  if (G.u.uprops[LIFESAVED].extrinsic) {
    await enlght_line(S("Your life "), final ? S("would have been") : S("will be"), S(" saved"), S(""));
  }
  if (G.u.uluck + G.u.moreluck) {
    ltmp = Math.abs(G.u.uluck + G.u.moreluck);
    sprintf(P(buf), S("%s%slucky"), ltmp >= 10 ? S("extremely ") : ltmp >= 5 ? S("very ") : S(""), G.u.uluck + G.u.moreluck < 0 ? S("un") : S(""));
    if (G.flags.debug) {
      sprintf(eos(P(buf)), S(" (%d)"), G.u.uluck + G.u.moreluck);
    }
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  } else if (G.flags.debug) {
    await enlght_line(S("Your luck "), final ? S("was") : S("is"), S(" zero"), S(""));
  }
  if (G.u.moreluck > 0) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("extra luck"), S(""));
  } else if (G.u.moreluck < 0) {
    await enlght_line(P(You_), final ? P(had) : P(have), S("reduced luck"), S(""));
  }
  if (carrying(LUCKSTONE) || stone_luck(TRUE)) {
    ltmp = stone_luck(FALSE);
    if (ltmp <= 0) {
      await enlght_line(S("Bad luck "), final ? S("did") : S("does"), S(" not time out for you"), S(""));
    }
    if (ltmp >= 0) {
      await enlght_line(S("Good luck "), final ? S("did") : S("does"), S(" not time out for you"), S(""));
    }
  }
  if (G.u.ugangr) {
    sprintf(P(buf), S(" %sangry with you"), G.u.ugangr > 6 ? S("extremely ") : G.u.ugangr > 3 ? S("very ") : S(""));
    if (G.flags.debug) {
      sprintf(eos(P(buf)), S(" (%d)"), G.u.ugangr);
    }
    await enlght_line(await u_gname(), final ? S(" was") : S(" is"), P(buf), S(""));
  } else {
    if (!final) {
      sprintf(P(buf), S("%ssafely pray"), await can_pray(FALSE) ? S("") : S("not "));
      if (G.flags.debug) {
        sprintf(eos(P(buf)), S(" (%d)"), G.u.ublesscnt);
      }
      await enlght_line(P(You_), final ? P(could) : P(can), P(buf), S(""));
    }
  }
  if (G.flags.debug && await debugcore(S("fruit"), 0)) {
    let f = null;
    await reorder_fruit(TRUE);
    for (f = G.ffruit; f; f = f.nextf) {
      sprintf(P(buf), S("Fruit #%d "), f.fid);
      await enlght_line(P(buf), final ? S("was ") : S("is "), P(f.fname), S(""));
    }
    await enlght_line(S("The current fruit "), final ? S("was ") : S("is "), P(G.pl_fruit), S(""));
    sprintf(P(buf), S("%d"), G.flags.made_fruit);
    await enlght_line(S("The made fruit flag "), final ? S("was ") : S("is "), P(buf), S(""));
  }
  {
    let p = null;
    buf[0] = 0;
    if (final < 2) {
      p = S("survived after being killed ");
      switch (G.u.umortality) {
      case 0:
        p = !final ? null : S("survived");
        break;
      case 1:
        strcpy(P(buf), S("once"));
        break;
      case 2:
        strcpy(P(buf), S("twice"));
        break;
      case 3:
        strcpy(P(buf), S("thrice"));
        break;
      default:
        sprintf(P(buf), S("%d times"), G.u.umortality);
        break;
      }
    } else {
      p = S("are dead");
      switch (G.u.umortality) {
      case 0:
        await impossible(S("dead without dying?"));
      case 1:
        break;
      default:
        sprintf(P(buf), S(" (%d%s time!)"), G.u.umortality, ordin(G.u.umortality));
        break;
      }
    }
    if (p) {
      await enlght_line(P(You_), final ? p : S("have been killed "), P(buf), S(""));
    }
  }
}

async function doattributes(): Promise<number> {
  let mode = BASICENLIGHTENMENT;
  if (G.flags.debug || G.flags.explore) {
    mode |= MAGICENLIGHTENMENT;
  }
  await enlightenment(mode, ENL_GAMEINPROGRESS);
  return 0;
}

export async function youhiding(via_enlghtmt: number, msgflag: number): Promise<void> {
  let bp = null;
  let buf = new Int8Array(256);
  strcpy(P(buf), S("hiding"));
  if ((G.youmonst.m_ap_type & 7) !== M_AP_NOTHING) {
    bp = eos(strcpy(P(buf), S("mimicking")));
    if ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT) {
      sprintf(bp, S(" %s"), await an(await simple_typename(G.youmonst.mappearance | 0)));
    } else if ((G.youmonst.m_ap_type & 7) === M_AP_FURNITURE) {
      strcpy(bp, S(" something"));
    } else if ((G.youmonst.m_ap_type & 7) === M_AP_MONSTER) {
      strcpy(bp, S(" someone"));
    } else {
      ;
    }
  } else if (G.u.uundetected) {
    bp = eos(P(buf));
    if (G.youmonst.data.mlet === S_EEL) {
      if (is_pool(G.u.ux, G.u.uy)) {
        sprintf(bp, S(" in the %s"), waterbody_name(G.u.ux, G.u.uy));
      }
    } else if ((G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
      let o = G.level.objects[G.u.ux][G.u.uy];
      if (o) {
        sprintf(bp, S(" underneath %s"), await ansimpleoname(o));
      }
    } else if ((G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      sprintf(bp, S(" on the %s"), ceiling(G.u.ux, G.u.uy));
    } else {
      if (G.u.utrap && G.u.utraptype === TT_PIT) {
        let t = t_at(G.u.ux, G.u.uy);
        sprintf(bp, S(" in a %spit"), t && (t.ttyp | 0) === SPIKED_PIT ? S("spiked ") : S(""));
      } else {
        sprintf(bp, S(" on the %s"), surface(G.u.ux, G.u.uy));
      }
    }
  } else {
    ;
  }
  if (via_enlghtmt) {
    let final = msgflag;
    await enlght_line(P(You_), final ? P(were) : P(are), P(buf), S(""));
  } else {
    await You(S("are %s %s."), msgflag ? S("already") : S("now"), P(buf));
  }
}

export async function doconduct(): Promise<number> {
  await show_conduct(0);
  return 0;
}

export async function show_conduct(final: number): Promise<void> {
  let buf = new Int8Array(256);
  let ngenocided = 0;
  en_win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_putstr(en_win, 0, S("Voluntary challenges:"));
  if (G.u.uroleplay.blind) {
    await enlght_line(P(You_), final ? P(were) : P(have_been), S("blind from birth"), S(""));
  }
  if (G.u.uroleplay.nudist) {
    await enlght_line(P(You_), final ? P(were) : P(have_been), S("faithfully nudist"), S(""));
  }
  if (!G.u.uconduct.food) {
    await enlght_line(P(You_), final ? S("went") : S("have gone"), S(" without food"), S(""));
  } else if (!G.u.uconduct.unvegan) {
    await enlght_line(P(You_), final ? S("") : P(have), S("followed a strict vegan diet"), S(""));
  } else if (!G.u.uconduct.unvegetarian) {
    await enlght_line(P(You_), final ? P(were) : P(have_been), S("vegetarian"), S(""));
  }
  if (!G.u.uconduct.gnostic) {
    await enlght_line(P(You_), final ? P(were) : P(have_been), S("an atheist"), S(""));
  }
  if (!G.u.uconduct.weaphit) {
    await enlght_line(P(You_), final ? P(never) : P(have_never), S("hit with a wielded weapon"), S(""));
  } else if (G.flags.debug) {
    sprintf(P(buf), S("used a wielded weapon %ld time%s"), G.u.uconduct.weaphit, G.u.uconduct.weaphit === 1 ? S("") : S("s"));
    await enlght_line(P(You_), final ? S("") : P(have), P(buf), S(""));
  }
  if (!G.u.uconduct.killer) {
    await enlght_line(P(You_), final ? P(were) : P(have_been), S("a pacifist"), S(""));
  }
  if (!G.u.uconduct.literate) {
    await enlght_line(P(You_), final ? P(were) : P(have_been), S("illiterate"), S(""));
  } else if (G.flags.debug) {
    sprintf(P(buf), S("read items or engraved %ld time%s"), G.u.uconduct.literate, G.u.uconduct.literate === 1 ? S("") : S("s"));
    await enlght_line(P(You_), final ? S("") : P(have), P(buf), S(""));
  }
  ngenocided = await num_genocides();
  if (ngenocided === 0) {
    await enlght_line(P(You_), final ? P(never) : P(have_never), S("genocided any monsters"), S(""));
  } else {
    sprintf(P(buf), S("genocided %d type%s of monster%s"), ngenocided, ngenocided === 1 ? S("") : S("s"), ngenocided === 1 ? S("") : S("s"));
    await enlght_line(P(You_), final ? S("") : P(have), P(buf), S(""));
  }
  if (!G.u.uconduct.polypiles) {
    await enlght_line(P(You_), final ? P(never) : P(have_never), S("polymorphed an object"), S(""));
  } else if (G.flags.debug) {
    sprintf(P(buf), S("polymorphed %ld item%s"), G.u.uconduct.polypiles, G.u.uconduct.polypiles === 1 ? S("") : S("s"));
    await enlght_line(P(You_), final ? S("") : P(have), P(buf), S(""));
  }
  if (!G.u.uconduct.polyselfs) {
    await enlght_line(P(You_), final ? P(never) : P(have_never), S("changed form"), S(""));
  } else if (G.flags.debug) {
    sprintf(P(buf), S("changed form %ld time%s"), G.u.uconduct.polyselfs, G.u.uconduct.polyselfs === 1 ? S("") : S("s"));
    await enlght_line(P(You_), final ? S("") : P(have), P(buf), S(""));
  }
  if (!G.u.uconduct.wishes) {
    await enlght_line(P(You_), final ? S("") : P(have), S("used no wishes"), S(""));
  } else {
    sprintf(P(buf), S("used %ld wish%s"), G.u.uconduct.wishes, G.u.uconduct.wishes > 1 ? S("es") : S(""));
    if (G.u.uconduct.wisharti) {
      if (G.u.uconduct.wisharti === G.u.uconduct.wishes) {
        sprintf(eos(P(buf)), S(" (%s"), G.u.uconduct.wisharti > 2 ? S("all ") : G.u.uconduct.wisharti === 2 ? S("both ") : S(""));
      } else {
        sprintf(eos(P(buf)), S(" (%ld "), G.u.uconduct.wisharti);
      }
      sprintf(eos(P(buf)), S("for %s)"), G.u.uconduct.wisharti === 1 ? S("an artifact") : S("artifacts"));
    }
    await enlght_line(P(You_), final ? S("") : P(have), P(buf), S(""));
    if (!G.u.uconduct.wisharti) {
      await enlght_line(P(You_), final ? S("did not wish") : S("have not wished"), S(" for any artifacts"), S(""));
    }
  }
  await G.windowprocs.win_display_nhwindow(en_win, TRUE);
  await G.windowprocs.win_destroy_nhwindow(en_win);
  en_win = WIN_ERR;
}

export function key2extcmddesc(key: number): Ptr | null {
  let mov = null;
  let k = 0;
  let c = 0;
  let M_5 = 181;
  let M_0 = 176;
  key2extcmddesc$key2cmdbuf[0] = 0;
  if (movecmd(k = key)) {
    strcpy(P(key2extcmddesc$key2cmdbuf), S("move"));
  } else if (movecmd(k = key <= (31 & 122) ? 96 | key : key)) {
    strcpy(P(key2extcmddesc$key2cmdbuf), S("rush"));
  } else if (movecmd(k = G.Cmd.num_pad ? 127 & key : lowc(key))) {
    strcpy(P(key2extcmddesc$key2cmdbuf), S("run"));
  }
  if ($rd(P(key2extcmddesc$key2cmdbuf))) {
    for (mov = movtab[0]; mov.k1; mov = $sadd(mov, 1)) {
      c = !G.Cmd.num_pad ? !G.Cmd.swap_yz ? mov.k1 : mov.k2 : !G.Cmd.phone_layout ? mov.k3 : mov.k4;
      if (c === k) {
        sprintf(eos(P(key2extcmddesc$key2cmdbuf)), S(" %s (screen %s)"), mov.txt, mov.alt);
        return P(key2extcmddesc$key2cmdbuf);
      }
    }
  } else if (digit(key) || G.Cmd.num_pad && digit(127 & key)) {
    key2extcmddesc$key2cmdbuf[0] = 0;
    if (!G.Cmd.num_pad) {
      strcpy(P(key2extcmddesc$key2cmdbuf), S("start of, or continuation of, a count"));
    } else if (key === 53 || key === M_5) {
      sprintf(P(key2extcmddesc$key2cmdbuf), S("%s prefix"), (!!G.Cmd.pcHack_compat ? 1 : 0) ^ (key === M_5 ? 1 : 0) ? S("run") : S("rush"));
    } else if (key === 48 || G.Cmd.pcHack_compat && key === M_0) {
      strcpy(P(key2extcmddesc$key2cmdbuf), S("synonym for 'i'"));
    }
    if ($rd(P(key2extcmddesc$key2cmdbuf))) {
      return P(key2extcmddesc$key2cmdbuf);
    }
  }
  if (G.Cmd.commands[key]) {
    if (G.Cmd.commands[key].ef_txt) {
      return G.Cmd.commands[key].ef_desc;
    }
  }
  return null;
}

export function bind_key(key: number, command: Ptr | null): number {
  let extcmd = null;
  if (!strcmp(command, S("nothing"))) {
    G.Cmd.commands[key] = null;
    return TRUE;
  }
  for (extcmd = G.extcmdlist[0]; extcmd.ef_txt; extcmd = $sadd(extcmd, 1)) {
    if (strcmp(command, extcmd.ef_txt)) {
      continue;
    }
    G.Cmd.commands[key] = extcmd;
    return TRUE;
  }
  return FALSE;
}

export function commands_init(): void {
  let extcmd = null;
  for (extcmd = G.extcmdlist[0]; extcmd.ef_txt; extcmd = $sadd(extcmd, 1)) {
    if (extcmd.key) {
      G.Cmd.commands[extcmd.key] = extcmd;
    }
  }
  bind_key(31 & 108, S("redraw"));
  bind_key(104, S("help"));
  bind_key(106, S("jump"));
  bind_key(107, S("kick"));
  bind_key(108, S("loot"));
  bind_key(31 & 110, S("annotate"));
  bind_key(110 - 128, S("name"));
  bind_key(78 - 128, S("name"));
  bind_key(117, S("untrap"));
  bind_key(79 - 128, S("overview"));
  bind_key(50 - 128, S("twoweapon"));
  bind_key(32, S("wait"));
}

export async function dokeylist_putcmds(datawin: number, docount: number, cmdflags: number, exflags: number, keys_used: Ptr | null): Promise<number> {
  let i = 0;
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(128);
  let count = 0;
  for (i = 0; i < 256; ++i) {
    let extcmd = null;
    let key = i & 0xff;
    if (keys_used.a[keys_used.o + i]) {
      continue;
    }
    if (key === 32 && !G.flags.rest_on_space) {
      continue;
    }
    if (!!(extcmd = G.Cmd.commands[i])) {
      if (cmdflags && !(extcmd.flags & cmdflags) || exflags && extcmd.flags & exflags) {
        continue;
      }
      if (docount) {
        ++count;
        continue;
      }
      sprintf(P(buf), S("%-8s %-12s %s"), key2txt(key, P(buf2)), extcmd.ef_txt, extcmd.ef_desc);
      await G.windowprocs.win_putstr(datawin, 0, P(buf));
      keys_used.a[keys_used.o + i] = TRUE;
    }
  }
  return count;
}

export async function dokeylist(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any;
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let key = 0;
  let keys_used = new Int8Array(256);
  let datawin = 0;
  let i = 0;
  datawin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  await G.windowprocs.win_putstr(datawin, 0, S(""));
  await G.windowprocs.win_putstr(datawin, 0, S("            Full Current Key Bindings List"));
  await G.windowprocs.win_putstr(datawin, 0, S(""));
  await G.windowprocs.win_putstr(datawin, 0, S("Directional keys:"));
  await show_direction_keys(datawin, 46, FALSE);
  keys_used[G.Cmd.move_NW & 0xff] = keys_used[G.Cmd.move_N & 0xff] = keys_used[G.Cmd.move_NE & 0xff] = keys_used[G.Cmd.move_W & 0xff] = keys_used[G.Cmd.move_E & 0xff] = keys_used[G.Cmd.move_SW & 0xff] = keys_used[G.Cmd.move_S & 0xff] = keys_used[G.Cmd.move_SE & 0xff] = TRUE;
  if (!G.iflags.num_pad) {
    ($t7 = ($t6 = ($t5 = ($t4 = ($t3 = ($t2 = ($t1 = keys_used[highc(G.Cmd.move_SE) & 0xff] = TRUE, keys_used[highc(G.Cmd.move_S) & 0xff] = $t1), keys_used[highc(G.Cmd.move_SW) & 0xff] = $t2), keys_used[highc(G.Cmd.move_E) & 0xff] = $t3), keys_used[highc(G.Cmd.move_W) & 0xff] = $t4), keys_used[highc(G.Cmd.move_NE) & 0xff] = $t5), keys_used[highc(G.Cmd.move_N) & 0xff] = $t6), keys_used[highc(G.Cmd.move_NW) & 0xff] = $t7);
    keys_used[(31 & G.Cmd.move_NW) & 0xff] = keys_used[(31 & G.Cmd.move_N) & 0xff] = keys_used[(31 & G.Cmd.move_NE) & 0xff] = keys_used[(31 & G.Cmd.move_W) & 0xff] = keys_used[(31 & G.Cmd.move_E) & 0xff] = keys_used[(31 & G.Cmd.move_SW) & 0xff] = keys_used[(31 & G.Cmd.move_S) & 0xff] = keys_used[(31 & G.Cmd.move_SE) & 0xff] = TRUE;
    await G.windowprocs.win_putstr(datawin, 0, S(""));
    await G.windowprocs.win_putstr(datawin, 0, S("Shift-<direction> will move in specified direction until you hit"));
    await G.windowprocs.win_putstr(datawin, 0, S("        a wall or run into something."));
    await G.windowprocs.win_putstr(datawin, 0, S("Ctrl-<direction> will run in specified direction until something"));
    await G.windowprocs.win_putstr(datawin, 0, S("        very interesting is seen."));
  }
  await G.windowprocs.win_putstr(datawin, 0, S(""));
  await G.windowprocs.win_putstr(datawin, 0, S("Miscellaneous keys:"));
  for (i = 0; dokeylist$misc_keys[i].desc; ++i) {
    key = G.Cmd.spkeys[dokeylist$misc_keys[i].nhkf] & 0xff;
    if (key && (dokeylist$misc_keys[i].numpad && G.iflags.num_pad || !dokeylist$misc_keys[i].numpad)) {
      keys_used[key] = TRUE;
      sprintf(P(buf), S("%-8s %s"), key2txt(key, P(buf2)), dokeylist$misc_keys[i].desc);
      await G.windowprocs.win_putstr(datawin, 0, P(buf));
    }
  }
  await G.windowprocs.win_putstr(datawin, 0, S("^c       break out of NetHack (SIGINT)"));
  keys_used[31 & 99] = TRUE;
  await G.windowprocs.win_putstr(datawin, 0, S(""));
  await show_menu_controls(datawin, TRUE);
  if (await dokeylist_putcmds(datawin, TRUE, GENERALCMD, WIZMODECMD, P(keys_used))) {
    await G.windowprocs.win_putstr(datawin, 0, S(""));
    await G.windowprocs.win_putstr(datawin, 0, S("General commands:"));
    await dokeylist_putcmds(datawin, FALSE, GENERALCMD, WIZMODECMD, P(keys_used));
  }
  if (await dokeylist_putcmds(datawin, TRUE, 0, WIZMODECMD, P(keys_used))) {
    await G.windowprocs.win_putstr(datawin, 0, S(""));
    await G.windowprocs.win_putstr(datawin, 0, S("Game commands:"));
    await dokeylist_putcmds(datawin, FALSE, 0, WIZMODECMD, P(keys_used));
  }
  if (G.flags.debug && await dokeylist_putcmds(datawin, TRUE, WIZMODECMD, 0, P(keys_used))) {
    await G.windowprocs.win_putstr(datawin, 0, S(""));
    await G.windowprocs.win_putstr(datawin, 0, S("Wizard-mode commands:"));
    await dokeylist_putcmds(datawin, FALSE, WIZMODECMD, 0, P(keys_used));
  }
  await G.windowprocs.win_display_nhwindow(datawin, FALSE);
  await G.windowprocs.win_destroy_nhwindow(datawin);
}

export function cmd_from_func(fn: Function | null): number {
  let i = 0;
  for (i = 0; i < 256; ++i) {
    if (G.Cmd.commands[i] && G.Cmd.commands[i].ef_funct === fn) {
      return i << 24 >> 24;
    }
  }
  return 0;
}

function size_obj(otmp: struct_obj | null): number {
  let sz = 96;
  if (otmp.oextra) {
    sz += 40;
    if (otmp.oextra.oname) {
      sz += (strlen(otmp.oextra.oname) | 0) + 1;
    }
    if (otmp.oextra.omonst) {
      sz += size_monst(otmp.oextra.omonst, FALSE);
    }
    if (otmp.oextra.omid) {
      sz += 4;
    }
    if (otmp.oextra.olong) {
      sz += 8;
    }
    if (otmp.oextra.omailcmd) {
      sz += (strlen(otmp.oextra.omailcmd) | 0) + 1;
    }
  }
  return sz;
}

function count_obj(chain: struct_obj | null, total_count: Ptr | null, total_size: Ptr | null, top: number, recurse: number): void {
  let count = 0;
  let size = 0;
  let obj = null;
  for (count = size = 0, obj = chain; obj; obj = obj.nobj) {
    if (top) {
      ++count;
      size += size_obj(obj);
    }
    if (recurse && obj.cobj) {
      count_obj(obj.cobj, total_count, total_size, TRUE, TRUE);
    }
  }
  total_count.a[total_count.o] += count;
  total_size.a[total_size.o] += size;
}

async function obj_chain(win: number, src: Ptr | null, chain: struct_obj | null, force: number, total_count: Ptr | null, total_size: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  const count = new Float64Array(1);
  count[0] = 0;
  const size = new Float64Array(1);
  size[0] = 0;
  count_obj(chain, P(count, 0), P(size, 0), TRUE, FALSE);
  if (count[0] || size[0] || force) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(buf), P(template), src, count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
}

async function mon_invent_chain(win: number, src: Ptr | null, chain: struct_monst | null, total_count: Ptr | null, total_size: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  const count = new Float64Array(1);
  count[0] = 0;
  const size = new Float64Array(1);
  size[0] = 0;
  let mon = null;
  for (mon = chain; mon; mon = mon.nmon) {
    count_obj(mon.minvent, P(count, 0), P(size, 0), TRUE, FALSE);
  }
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(buf), P(template), src, count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
}

async function contained_stats(win: number, src: Ptr | null, total_count: Ptr | null, total_size: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  const count = new Float64Array(1);
  count[0] = 0;
  const size = new Float64Array(1);
  size[0] = 0;
  let mon = null;
  count_obj(G.invent, P(count, 0), P(size, 0), FALSE, TRUE);
  count_obj(G.level.objlist, P(count, 0), P(size, 0), FALSE, TRUE);
  count_obj(G.level.buriedobjlist, P(count, 0), P(size, 0), FALSE, TRUE);
  count_obj(G.migrating_objs, P(count, 0), P(size, 0), FALSE, TRUE);
  for (mon = G.level.monlist; mon; mon = mon.nmon) {
    count_obj(mon.minvent, P(count, 0), P(size, 0), FALSE, TRUE);
  }
  for (mon = G.migrating_mons; mon; mon = mon.nmon) {
    count_obj(mon.minvent, P(count, 0), P(size, 0), FALSE, TRUE);
  }
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(buf), P(template), src, count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
}

function size_monst(mtmp: struct_monst | null, incl_wsegs: number): number {
  let sz = 144;
  if (mtmp.wormno | 0 && incl_wsegs) {
    sz += size_wseg(mtmp);
  }
  if (mtmp.mextra) {
    sz += 56;
    if (mtmp.mextra.mname) {
      sz += (strlen(mtmp.mextra.mname) | 0) + 1;
    }
    if (mtmp.mextra.egd) {
      sz += 324;
    }
    if (mtmp.mextra.epri) {
      sz += 40;
    }
    if (mtmp.mextra.eshk) {
      sz += 4936;
    }
    if (mtmp.mextra.emin) {
      sz += 2;
    }
    if (mtmp.mextra.edog) {
      sz += 56;
    }
  }
  return sz;
}

async function mon_chain(win: number, src: Ptr | null, chain: struct_monst | null, force: number, total_count: Ptr | null, total_size: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  let count = 0;
  let size = 0;
  let mon = null;
  let incl_wsegs = (!strncmpi(src, S("fmon"), -1) ? 1 : 0) << 24 >> 24;
  count = size = 0;
  for (mon = chain; mon; mon = mon.nmon) {
    ++count;
    size += size_monst(mon, incl_wsegs);
  }
  if (count || size || force) {
    total_count.a[total_count.o] += count;
    total_size.a[total_size.o] += size;
    sprintf(P(buf), P(template), src, count, size);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
}

async function misc_stats(win: number, total_count: Ptr | null, total_size: Ptr | null): Promise<void> {
  let buf = new Int8Array(256);
  let hdrbuf = new Int8Array(128);
  const count = new Float64Array(1);
  const size = new Float64Array(1);
  let idx = 0;
  let tt = null;
  let sd = null;
  let k = null;
  let bi = null;
  count[0] = size[0] = 0;
  for (tt = G.ftrap; tt; tt = tt.ntrap) {
    ++count[0];
    size[0] += 24;
  }
  total_count.a[total_count.o] += count[0];
  total_size.a[total_size.o] += size[0];
  sprintf(P(hdrbuf), S("traps, size %ld"), 24);
  sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  count[0] = size[0] = 0;
  engr_stats(S("engravings, size %ld+text"), P(hdrbuf), P(count, 0), P(size, 0));
  total_count.a[total_count.o] += count[0];
  total_size.a[total_size.o] += size[0];
  sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  count[0] = size[0] = 0;
  light_stats(S("light sources, size %ld"), P(hdrbuf), P(count, 0), P(size, 0));
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  count[0] = size[0] = 0;
  timer_stats(S("timers, size %ld"), P(hdrbuf), P(count, 0), P(size, 0));
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  count[0] = size[0] = 0;
  for (sd = G.level.damagelist; sd; sd = sd.next) {
    ++count[0];
    size[0] += 32;
  }
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(hdrbuf), S("shop damage, size %ld"), 32);
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  count[0] = size[0] = 0;
  region_stats(S("regions, size %ld+%ld*rect+N"), P(hdrbuf), P(count, 0), P(size, 0));
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  count[0] = size[0] = 0;
  for (k = G.killer.next; k; k = k.next) {
    ++count[0];
    size[0] += 272;
  }
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(hdrbuf), S("delayed killer%s, size %ld"), count[0] === 1 ? S("") : S("s"), 272);
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  count[0] = size[0] = 0;
  for (bi = G.level.bonesinfo; bi; bi = bi.next) {
    ++count[0];
    size[0] += 176;
  }
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    sprintf(P(hdrbuf), S("bones history, size %ld"), 176);
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  count[0] = size[0] = 0;
  for (idx = 0; idx < NUM_OBJECTS; ++idx) {
    if (G.objects[idx].oc_uname) {
      ++count[0];
      size[0] += strlen(G.objects[idx].oc_uname) + 1;
    }
  }
  if (count[0] || size[0]) {
    total_count.a[total_count.o] += count[0];
    total_size.a[total_size.o] += size[0];
    strcpy(P(hdrbuf), S("object type names, text"));
    sprintf(P(buf), P(template), P(hdrbuf), count[0], size[0]);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
}

async function wiz_show_stats(): Promise<number> {
  let buf = new Int8Array(256);
  let win = 0;
  const total_obj_size = new Float64Array(1);
  const total_obj_count = new Float64Array(1);
  const total_mon_size = new Float64Array(1);
  const total_mon_count = new Float64Array(1);
  const total_ovr_size = new Float64Array(1);
  const total_ovr_count = new Float64Array(1);
  const total_misc_size = new Float64Array(1);
  const total_misc_count = new Float64Array(1);
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  await G.windowprocs.win_putstr(win, 0, S("Current memory statistics:"));
  total_obj_count[0] = total_obj_size[0] = 0;
  await G.windowprocs.win_putstr(win, 0, P(stats_hdr));
  sprintf(P(buf), S("  Objects, base size %ld"), 96);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await obj_chain(win, S("invent"), G.invent, TRUE, P(total_obj_count, 0), P(total_obj_size, 0));
  await obj_chain(win, S("fobj"), G.level.objlist, TRUE, P(total_obj_count, 0), P(total_obj_size, 0));
  await obj_chain(win, S("buried"), G.level.buriedobjlist, FALSE, P(total_obj_count, 0), P(total_obj_size, 0));
  await obj_chain(win, S("migrating obj"), G.migrating_objs, FALSE, P(total_obj_count, 0), P(total_obj_size, 0));
  await obj_chain(win, S("billobjs"), G.billobjs, FALSE, P(total_obj_count, 0), P(total_obj_size, 0));
  await mon_invent_chain(win, S("minvent"), G.level.monlist, P(total_obj_count, 0), P(total_obj_size, 0));
  await mon_invent_chain(win, S("migrating minvent"), G.migrating_mons, P(total_obj_count, 0), P(total_obj_size, 0));
  await contained_stats(win, S("contained"), P(total_obj_count, 0), P(total_obj_size, 0));
  await G.windowprocs.win_putstr(win, 0, P(stats_sep));
  sprintf(P(buf), P(template), S("  Obj total"), total_obj_count[0], total_obj_size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  total_mon_count[0] = total_mon_size[0] = 0;
  await G.windowprocs.win_putstr(win, 0, S(""));
  sprintf(P(buf), S("  Monsters, base size %ld"), 144);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await mon_chain(win, S("fmon"), G.level.monlist, TRUE, P(total_mon_count, 0), P(total_mon_size, 0));
  await mon_chain(win, S("migrating"), G.migrating_mons, FALSE, P(total_mon_count, 0), P(total_mon_size, 0));
  if (G.mydogs) {
    await mon_chain(win, S("mydogs"), G.mydogs, FALSE, P(total_mon_count, 0), P(total_mon_size, 0));
  }
  await G.windowprocs.win_putstr(win, 0, P(stats_sep));
  sprintf(P(buf), P(template), S("  Mon total"), total_mon_count[0], total_mon_size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  total_ovr_count[0] = total_ovr_size[0] = 0;
  await G.windowprocs.win_putstr(win, 0, S(""));
  await G.windowprocs.win_putstr(win, 0, S("  Overview"));
  await overview_stats(win, P(template), P(total_ovr_count, 0), P(total_ovr_size, 0));
  await G.windowprocs.win_putstr(win, 0, P(stats_sep));
  sprintf(P(buf), P(template), S("  Over total"), total_ovr_count[0], total_ovr_size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  total_misc_count[0] = total_misc_size[0] = 0;
  await G.windowprocs.win_putstr(win, 0, S(""));
  await G.windowprocs.win_putstr(win, 0, S("  Miscellaneous"));
  await misc_stats(win, P(total_misc_count, 0), P(total_misc_size, 0));
  await G.windowprocs.win_putstr(win, 0, P(stats_sep));
  sprintf(P(buf), P(template), S("  Misc total"), total_misc_count[0], total_misc_size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await G.windowprocs.win_putstr(win, 0, S(""));
  await G.windowprocs.win_putstr(win, 0, P(stats_sep));
  sprintf(P(buf), P(template), S("  Grand total"), total_obj_count[0] + total_mon_count[0] + total_ovr_count[0] + total_misc_count[0], total_obj_size[0] + total_mon_size[0] + total_ovr_size[0] + total_misc_size[0]);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await G.windowprocs.win_display_nhwindow(win, FALSE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

export async function sanity_check(): Promise<void> {
  await obj_sanity_check();
  await timer_sanity_check();
  await mon_sanity_check();
  await light_sources_sanity_check();
  await bc_sanity_check();
}

export function bind_specialkey(key: number, command: Ptr | null): number {
  let i = 0;
  for (i = 0; i < (Math.trunc(672 / 16) | 0); ++i) {
    if (!G.spkeys_binds[i].name || strcmp(command, G.spkeys_binds[i].name)) {
      continue;
    }
    G.Cmd.spkeys[G.spkeys_binds[i].nhkf] = key << 24 >> 24;
    return TRUE;
  }
  return FALSE;
}

export function txt2key(txt: Ptr | null): number {
  txt = trimspaces(txt);
  if (!txt.a[txt.o]) {
    return 0;
  }
  if (!txt.a[txt.o + 1]) {
    return txt.a[txt.o];
  }
  if (!strcmp(txt, S("<enter>"))) {
    return 10;
  }
  if (!strcmp(txt, S("<space>"))) {
    return 32;
  }
  if (!strcmp(txt, S("<esc>"))) {
    return 27;
  }
  switch (txt.a[txt.o]) {
  case 109:
  case 77:
    txt = txt.add(1);
    if (txt.a[txt.o] === 45 && txt.a[txt.o + 1]) {
      txt = txt.add(1);
    }
    if (txt.a[txt.o + 1]) {
      return 0;
    }
    return txt.a[txt.o] - 128 << 24 >> 24;
  case 99:
  case 67:
  case 94:
    txt = txt.add(1);
    if (txt.a[txt.o] === 45 && txt.a[txt.o + 1]) {
      txt = txt.add(1);
    }
    if (txt.a[txt.o + 1]) {
      return 0;
    }
    return (31 & txt.a[txt.o]) << 24 >> 24;
  }
  if (txt.a[txt.o] >= 48 && txt.a[txt.o] <= 57) {
    let key = 0;
    let i = 0;
    for (i = 0; i < 3; ++i) {
      if (txt.a[txt.o + i] < 48 || txt.a[txt.o + i] > 57) {
        return 0;
      }
      key = 10 * key + txt.a[txt.o + i] - 48 & 0xff;
    }
    return key << 24 >> 24;
  }
  return 0;
}

export function key2txt(c: number, txt: Ptr | null): Ptr | null {
  if (c === 32) {
    sprintf(txt, S("<space>"));
  } else if (c === 27) {
    sprintf(txt, S("<esc>"));
  } else if (c === 10) {
    sprintf(txt, S("<enter>"));
  } else if (c === 127) {
    sprintf(txt, S("<del>"));
  } else {
    strcpy(txt, visctrl(c << 24 >> 24));
  }
  return txt;
}

export async function parseautocomplete(autocomplete: Ptr | null, condition: number): Promise<void> {
  let $t1: any;
  let efp = null;
  let autoc = null;
  if (!!(autoc = strchr(autocomplete, 44)) || !!(autoc = strchr(autocomplete, 58))) {
    $wr(($t1 = autoc, autoc = $t1.add(1), $t1), 0, 0);
    await parseautocomplete(autoc, condition);
  }
  autocomplete = trimspaces(autocomplete);
  if (!autocomplete.a[autocomplete.o]) {
    return;
  }
  if (autocomplete.a[autocomplete.o] === 33) {
    autocomplete = autocomplete.add(1);
    autocomplete = trimspaces(autocomplete);
    condition = (!condition ? 1 : 0) << 24 >> 24;
  }
  for (efp = G.extcmdlist[0]; efp.ef_txt; efp = $sadd(efp, 1)) {
    if (!strcmp(autocomplete, efp.ef_txt)) {
      if (condition) {
        efp.flags |= AUTOCOMPLETE;
      } else {
        efp.flags &= ~AUTOCOMPLETE;
      }
      return;
    }
  }
  raw_printf(S("Bad autocomplete: invalid extended command '%s'."), autocomplete);
  await G.windowprocs.win_wait_synch();
}

export function reset_commands(initial: number): void {
  let cmdtmp = null;
  let flagtemp = 0;
  let c = 0;
  let i = 0;
  let updated = 0;
  if (initial) {
    updated = 1;
    G.Cmd.num_pad = FALSE;
    G.Cmd.pcHack_compat = G.Cmd.phone_layout = G.Cmd.swap_yz = FALSE;
    for (i = 0; i < (Math.trunc(672 / 16) | 0); ++i) {
      G.Cmd.spkeys[G.spkeys_binds[i].nhkf] = G.spkeys_binds[i].key;
    }
    commands_init();
  } else {
    if (reset_commands$backed_dir_cmd) {
      for (i = 0; i < 8; ++i) {
        G.Cmd.commands[G.Cmd.dirchars.a[G.Cmd.dirchars.o + i] & 0xff] = reset_commands$back_dir_cmd[i];
      }
    }
    flagtemp = G.iflags.num_pad;
    if (flagtemp !== G.Cmd.num_pad) {
      G.Cmd.num_pad = flagtemp;
      ++updated;
    }
    flagtemp = (G.iflags.num_pad_mode & 1 ? !G.Cmd.num_pad ? 1 : 0 : FALSE) << 24 >> 24;
    if (flagtemp !== G.Cmd.swap_yz) {
      G.Cmd.swap_yz = flagtemp;
      ++updated;
      for (i = 0; i < (Math.trunc(24 / 4) | 0); ++i) {
        c = reset_commands$ylist[i] & 255;
        cmdtmp = G.Cmd.commands[c];
        G.Cmd.commands[c] = G.Cmd.commands[c + 1];
        G.Cmd.commands[c + 1] = cmdtmp;
      }
    }
    flagtemp = (G.iflags.num_pad_mode & 1 ? G.Cmd.num_pad : FALSE) << 24 >> 24;
    if (flagtemp !== G.Cmd.pcHack_compat) {
      G.Cmd.pcHack_compat = flagtemp;
      ++updated;
      c = 53 - 128 & 255;
      cmdtmp = G.Cmd.commands[53];
      G.Cmd.commands[53] = G.Cmd.commands[c];
      G.Cmd.commands[c] = cmdtmp;
      c = 48 - 128 & 255;
      G.Cmd.commands[c] = G.Cmd.pcHack_compat ? G.Cmd.commands[73] : null;
    }
    flagtemp = (G.iflags.num_pad_mode & 2 ? G.Cmd.num_pad : FALSE) << 24 >> 24;
    if (flagtemp !== G.Cmd.phone_layout) {
      G.Cmd.phone_layout = flagtemp;
      ++updated;
      for (i = 0; i < 3; ++i) {
        c = 49 + i;
        cmdtmp = G.Cmd.commands[c];
        G.Cmd.commands[c] = G.Cmd.commands[c + 6];
        G.Cmd.commands[c + 6] = cmdtmp;
        c = (49 - 128 & 255) + i;
        cmdtmp = G.Cmd.commands[c];
        G.Cmd.commands[c] = G.Cmd.commands[c + 6];
        G.Cmd.commands[c + 6] = cmdtmp;
      }
    }
  }
  if (updated) {
    G.Cmd.serialno = G.Cmd.serialno + 1 >>> 0;
  }
  G.Cmd.dirchars = !G.Cmd.num_pad ? !G.Cmd.swap_yz ? P(reset_commands$sdir) : P(reset_commands$sdir_swap_yz) : !G.Cmd.phone_layout ? P(reset_commands$ndir) : P(reset_commands$ndir_phone_layout);
  G.Cmd.alphadirchars = !G.Cmd.num_pad ? G.Cmd.dirchars : P(reset_commands$sdir);
  G.Cmd.move_W = G.Cmd.dirchars.a[G.Cmd.dirchars.o];
  G.Cmd.move_NW = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 1];
  G.Cmd.move_N = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 2];
  G.Cmd.move_NE = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 3];
  G.Cmd.move_E = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 4];
  G.Cmd.move_SE = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 5];
  G.Cmd.move_S = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 6];
  G.Cmd.move_SW = G.Cmd.dirchars.a[G.Cmd.dirchars.o + 7];
  if (!initial) {
    for (i = 0; i < 8; ++i) {
      reset_commands$back_dir_cmd[i] = G.Cmd.commands[G.Cmd.dirchars.a[G.Cmd.dirchars.o + i] & 0xff];
      G.Cmd.commands[G.Cmd.dirchars.a[G.Cmd.dirchars.o + i] & 0xff] = null;
    }
    reset_commands$backed_dir_cmd = TRUE;
    for (i = 0; i < 8; ++i) {
      bind_key(G.Cmd.dirchars.a[G.Cmd.dirchars.o + i], S("nothing"));
    }
  }
}

function accept_menu_prefix(cmd_func: Function | null): number {
  if (cmd_func === dopickup || cmd_func === dotip || cmd_func === doeat || cmd_func === dosacrifice || cmd_func === doapply || cmd_func === doloot || cmd_func === dotravel || cmd_func === wiz_level_tele || cmd_func === dotelecmd || cmd_func === doextcmd || cmd_func === doextlist) {
    return TRUE;
  }
  return FALSE;
}

export function randomkey(): number {
  let $t1: any, $t2: any;
  let c = 0;
  switch (rn2(16)) {
  default:
    c = 27;
    break;
  case 0:
    c = 10;
    break;
  case 1:
  case 2:
  case 3:
  case 4:
    c = rn2(126 - 32 + 1) + 32 << 24 >> 24;
    break;
  case 5:
    c = (rn2(2) ? 9 : 32) << 24 >> 24;
    break;
  case 6:
    c = rn2(122 - 97 + 1) + 97 << 24 >> 24;
    break;
  case 7:
    c = rn2(90 - 65 + 1) + 65 << 24 >> 24;
    break;
  case 8:
    c = G.extcmdlist[($t2 = randomkey$i, randomkey$i = $t2 + 1 >>> 0, $t2) % ((Math.trunc(5424 / 48) | 0) >>> 0)].key << 24 >> 24;
    break;
  case 9:
    c = 35;
    break;
  case 10:
  case 11:
  case 12:
    c = G.Cmd.dirchars.a[G.Cmd.dirchars.o + rn2(8)];
    if (!rn2(7)) {
      c = (!G.Cmd.num_pad ? !rn2(3) ? 31 & c : c + 65 - 97 : c - 128) << 24 >> 24;
    }
    break;
  case 13:
    c = rn2(57 - 48 + 1) + 48 << 24 >> 24;
    break;
  case 14:
    c = rnd(G.iflags.wc_eight_bit_input ? 255 : 127) << 24 >> 24;
    break;
  }
  return c;
}

export function random_response(buf: Ptr | null, sz: number): void {
  let c = 0;
  let count = 0;
  for (; ; ) {
    c = randomkey();
    if (c === 10) {
      break;
    }
    if (c === 27) {
      count = 0;
      break;
    }
    if (count < sz - 1) {
      buf.a[buf.o + count++] = c;
    }
  }
  buf.a[buf.o + count] = 0;
}

export function rnd_extcmd_idx(): number {
  return rn2(G.extcmdlist_length + 1) - 1;
}

export function ch2spkeys(c: number, start: number, end: number): number {
  let i = 0;
  for (i = start; i <= end; ++i) {
    if (G.Cmd.spkeys[i] === c) {
      return i;
    }
  }
  return NHKF_ESC;
}

export async function rhack(cmd: Ptr | null): Promise<void> {
  let $t1: any;
  let spkey = 0;
  let prefix_seen = 0;
  let bad_command = 0;
  let firsttime = (!cmd ? 1 : 0) << 24 >> 24;
  G.iflags.menu_requested = FALSE;
  if (G.program_state.done_hup) {
    await end_of_input();
  }
  if (firsttime) {
    G.context.nopick = 0;
    cmd = await parse();
  }
  if (cmd.a[cmd.o] === G.Cmd.spkeys[NHKF_ESC]) {
    G.context.move = FALSE;
    return;
  }
  if (cmd.a[cmd.o] === DOAGAIN && !G.in_doagain && saveq[0]) {
    G.in_doagain = TRUE;
    stail = 0;
    await rhack(null);
    G.in_doagain = FALSE;
    return;
  }
  if (!cmd.a[cmd.o] || cmd.a[cmd.o] === -1) {
    G.windowprocs.win_nhbell();
    G.context.move = FALSE;
    return;
  }
  prefix_seen = FALSE;
  G.context.travel = G.context.travel1 = 0;
  spkey = ch2spkeys(cmd.a[cmd.o], NHKF_RUN, NHKF_CLICKLOOK);
  switch (spkey) {
  case NHKF_RUSH:
    if (movecmd(cmd.a[cmd.o + 1])) {
      G.context.run = 2;
      G.domove_attempting = G.domove_attempting | DOMOVE_RUSH;
    } else {
      prefix_seen = TRUE;
    }
    break;
  case NHKF_RUN2:
    if (!G.Cmd.num_pad) {
      break;
    }
  case NHKF_RUN:
    if (movecmd(lowc(cmd.a[cmd.o + 1]))) {
      G.context.run = 3;
      G.domove_attempting = G.domove_attempting | DOMOVE_RUSH;
    } else {
      prefix_seen = TRUE;
    }
    break;
  case NHKF_FIGHT2:
    if (!G.Cmd.num_pad) {
      break;
    }
  case NHKF_FIGHT:
    if (movecmd(cmd.a[cmd.o + 1])) {
      G.context.forcefight = 1;
      G.domove_attempting = G.domove_attempting | DOMOVE_WALK;
    } else {
      prefix_seen = TRUE;
    }
    break;
  case NHKF_NOPICKUP:
    if (movecmd(cmd.a[cmd.o + 1]) || G.u.dz) {
      G.context.run = 0;
      G.context.nopick = 1;
      if (!G.u.dz) {
        G.domove_attempting = G.domove_attempting | DOMOVE_WALK;
      } else {
        cmd.a[cmd.o] = cmd.a[cmd.o + 1];
      }
    } else {
      prefix_seen = TRUE;
    }
    break;
  case NHKF_RUN_NOPICKUP:
    if (movecmd(lowc(cmd.a[cmd.o + 1]))) {
      G.context.run = 1;
      G.context.nopick = 1;
      G.domove_attempting = G.domove_attempting | DOMOVE_RUSH;
    } else {
      prefix_seen = TRUE;
    }
    break;
  case NHKF_DOINV:
    if (!G.Cmd.num_pad) {
      break;
    }
    await ddoinv();
    G.context.move = FALSE;
    G.multi = 0;
    return;
  case NHKF_CLICKLOOK:
    if (G.iflags.clicklook) {
      G.context.move = FALSE;
      await do_look(2, clicklook_cc);
    }
    return;
  case NHKF_TRAVEL:
    if (G.flags.travelcmd) {
      G.context.travel = 1;
      G.context.travel1 = 1;
      G.context.run = 8;
      G.context.nopick = 1;
      G.domove_attempting = G.domove_attempting | DOMOVE_RUSH;
      break;
    }
  default:
    if (movecmd(cmd.a[cmd.o])) {
      G.context.run = 0;
      G.domove_attempting = G.domove_attempting | DOMOVE_WALK;
    } else if (movecmd(G.Cmd.num_pad ? 127 & cmd.a[cmd.o] : lowc(cmd.a[cmd.o]))) {
      G.context.run = 1;
      G.domove_attempting = G.domove_attempting | DOMOVE_RUSH;
    } else if (movecmd(cmd.a[cmd.o] <= (31 & 122) ? 96 | cmd.a[cmd.o] : cmd.a[cmd.o])) {
      G.context.run = 3;
      G.domove_attempting = G.domove_attempting | DOMOVE_RUSH;
    }
    break;
  }
  if (prefix_seen && cmd.a[cmd.o] === G.Cmd.spkeys[NHKF_REQMENU]) {
    let ft = G.Cmd.commands[cmd.a[cmd.o + 1] & 255];
    let func = ft ? ft.ef_funct : null;
    if (func && accept_menu_prefix(func)) {
      G.iflags.menu_requested = TRUE;
      cmd = cmd.add(1);
    }
  }
  if ((G.domove_attempting & (DOMOVE_RUSH | DOMOVE_WALK)) !== 0 && !G.context.travel && !dxdy_moveok()) {
    await You_cant(S("get there from here..."));
    G.context.run = 0;
    G.context.nopick = G.context.forcefight = FALSE;
    G.context.move = G.context.mv = FALSE;
    G.multi = 0;
    return;
  }
  if ((G.domove_attempting & DOMOVE_WALK) !== 0) {
    if (G.multi) {
      G.context.mv = TRUE;
    }
    await domove();
    G.context.forcefight = 0;
    return;
  } else if ((G.domove_attempting & DOMOVE_RUSH) !== 0) {
    if (firsttime) {
      if (!G.multi) {
        G.multi = 80 > 21 ? 80 : 21;
      }
      G.u.last_str_turn = 0;
    }
    G.context.mv = TRUE;
    await domove();
    return;
  } else if (prefix_seen && cmd.a[cmd.o + 1] === G.Cmd.spkeys[NHKF_ESC]) {
    bad_command = FALSE;
  } else if (cmd.a[cmd.o] === 32 && !G.flags.rest_on_space) {
    bad_command = TRUE;
  } else {
    let tlist = null;
    let res = 0;
    let func = null;
    if (!!(tlist = G.Cmd.commands[cmd.a[cmd.o] & 255])) {
      if (!G.flags.debug && tlist.flags & WIZMODECMD) {
        await You_cant(S("do that!"));
        res = 0;
      } else if (G.u.uburied | 0 && !(tlist.flags & IFBURIED)) {
        await You_cant(S("do that while you are buried!"));
        res = 0;
      } else {
        func = tlist.ef_funct;
        if (tlist.f_text && !G.occupation && G.multi) {
          set_occupation(func, tlist.f_text, G.multi);
        }
        res = await func();
      }
      if (!res) {
        G.context.move = FALSE;
        G.multi = 0;
      }
      return;
    }
    bad_command = TRUE;
  }
  if (bad_command) {
    let expcmd = new Int8Array(20);
    let c = 0;
    let c1 = cmd.a[cmd.o + 1];
    expcmd[0] = 0;
    while ((c = $rd(($t1 = cmd, cmd = $t1.add(1), $t1))) !== 0) {
      strcat(P(expcmd), visctrl(c));
    }
    if (!prefix_seen || !await help_dir(c1, spkey, S("Invalid direction key!"))) {
      await Norep(S("Unknown command '%s'."), P(expcmd));
    }
  }
  G.context.move = FALSE;
  G.multi = 0;
  return;
}

export function xytod(x: number, y: number): number {
  let dd = 0;
  for (dd = 0; dd < 8; ++dd) {
    if (x === G.xdir[dd] && y === G.ydir[dd]) {
      return dd;
    }
  }
  return -1;
}

export function dtoxy(cc: struct_nhcoord | null, dd: number): void {
  cc.x = G.xdir[dd];
  cc.y = G.ydir[dd];
  return;
}

export function movecmd(sym: number): number {
  let dp = strchr(G.Cmd.dirchars, sym);
  G.u.dz = 0;
  if (!dp || !dp.a[dp.o]) {
    return 0;
  }
  G.u.dx = G.xdir[dp.o - G.Cmd.dirchars.o];
  G.u.dy = G.ydir[dp.o - G.Cmd.dirchars.o];
  G.u.dz = G.zdir[dp.o - G.Cmd.dirchars.o];
  return !G.u.dz ? 1 : 0;
}

export function dxdy_moveok(): number {
  if (G.u.dx && G.u.dy && G.u.umonnum === 115) {
    G.u.dx = G.u.dy = 0;
  }
  return G.u.dx || G.u.dy ? 1 : 0;
}

export function redraw_cmd(c: number): number {
  return (c === G.Cmd.spkeys[NHKF_REDRAW] || G.Cmd.num_pad && c === G.Cmd.spkeys[NHKF_REDRAW2] ? 1 : 0) << 24 >> 24;
}

export function prefix_cmd(c: number): number {
  return (c === G.Cmd.spkeys[NHKF_RUSH] || c === G.Cmd.spkeys[NHKF_RUN] || c === G.Cmd.spkeys[NHKF_NOPICKUP] || c === G.Cmd.spkeys[NHKF_RUN_NOPICKUP] || c === G.Cmd.spkeys[NHKF_FIGHT] || G.Cmd.num_pad && (c === G.Cmd.spkeys[NHKF_RUN2] || c === G.Cmd.spkeys[NHKF_FIGHT2]) ? 1 : 0) << 24 >> 24;
}

export async function get_adjacent_loc(prompt: Ptr | null, emsg: Ptr | null, x: number, y: number, cc: struct_nhcoord | null): Promise<number> {
  let new_x = 0;
  let new_y = 0;
  if (!await getdir(prompt)) {
    await pline(S("%s"), G.c_common_strings.c_Never_mind);
    return 0;
  }
  new_x = x + G.u.dx << 24 >> 24;
  new_y = y + G.u.dy << 24 >> 24;
  if (cc && isok(new_x, new_y)) {
    cc.x = new_x;
    cc.y = new_y;
  } else {
    if (emsg) {
      await pline(S("%s"), emsg);
    }
    return 0;
  }
  return 1;
}

export async function getdir(s: Ptr | null): Promise<number> {
  let $g = 0;
  let dirsym = 0;
  let is_mov = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
    case 1: // retry
      if (G.in_doagain || readchar_queue.a[readchar_queue.o]) {
        dirsym = await readchar();
      } else {
        dirsym = await yn_function(s && s.a[s.o] !== 94 ? s : S("In what direction?"), null, 0);
      }
      await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
      if (redraw_cmd(dirsym)) {
        await docrt();
        { $g = 1; continue $L; }
      }
      savech(dirsym);
      if (dirsym === G.Cmd.spkeys[NHKF_GETDIR_SELF] || dirsym === G.Cmd.spkeys[NHKF_GETDIR_SELF2]) {
        G.u.dx = G.u.dy = G.u.dz = 0;
      } else if (!(is_mov = movecmd(dirsym)) && !G.u.dz) {
        let did_help = FALSE;
        let help_requested = 0;
        if (!strchr(P(G.quitchars), dirsym)) {
          help_requested = (dirsym === G.Cmd.spkeys[NHKF_GETDIR_HELP] ? 1 : 0) << 24 >> 24;
          if (help_requested || G.iflags.cmdassist) {
            did_help = await help_dir(s && s.a[s.o] === 94 ? dirsym : 0, NHKF_ESC, help_requested ? null : S("Invalid direction key!"));
            if (help_requested) {
              { $g = 1; continue $L; }
            }
          }
          if (!did_help) {
            await pline(S("What a strange direction!"));
          }
        }
        return 0;
      } else if (is_mov && !dxdy_moveok()) {
        await You_cant(S("orient yourself that direction."));
        return 0;
      }
      if (!G.u.dz && (G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic && !rn2(5))) {
        confdir();
      }
      return 1;
    }
    break;
  }
}

async function show_direction_keys(win: number, centerchar: number, nodiag: number): Promise<void> {
  let buf = new Int8Array(256);
  if (!centerchar) {
    centerchar = 32;
  }
  if (nodiag) {
    sprintf(P(buf), S("             %c   "), G.Cmd.move_N);
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S("             |   "));
    sprintf(P(buf), S("          %c- %c -%c"), G.Cmd.move_W, centerchar, G.Cmd.move_E);
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S("             |   "));
    sprintf(P(buf), S("             %c   "), G.Cmd.move_S);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  } else {
    sprintf(P(buf), S("          %c  %c  %c"), G.Cmd.move_NW, G.Cmd.move_N, G.Cmd.move_NE);
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S("           \\ | / "));
    sprintf(P(buf), S("          %c- %c -%c"), G.Cmd.move_W, centerchar, G.Cmd.move_E);
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S("           / | \\ "));
    sprintf(P(buf), S("          %c  %c  %c"), G.Cmd.move_SW, G.Cmd.move_S, G.Cmd.move_SE);
    await G.windowprocs.win_putstr(win, 0, P(buf));
  }
  ;
}

async function help_dir(sym: number, spkey: number, msg: Ptr | null): Promise<number> {
  let ctrl = 0;
  let win = 0;
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let explain = null;
  let dothat = null;
  let how = null;
  let prefixhandling = 0;
  let viawindow = 0;
  viawindow = (spkey === NHKF_ESC || G.iflags.cmdassist ? 1 : 0) << 24 >> 24;
  prefixhandling = (spkey !== NHKF_ESC ? 1 : 0) << 24 >> 24;
  dothat = S("do that");
  how = S(" at");
  switch (spkey) {
  case NHKF_NOPICKUP:
    dothat = S("move");
    break;
  case NHKF_RUSH:
    dothat = S("rush");
    break;
  case NHKF_RUN2:
    if (!G.Cmd.num_pad) {
      break;
    }
  case NHKF_RUN:
  case NHKF_RUN_NOPICKUP:
    dothat = S("run");
    break;
  case NHKF_FIGHT2:
    if (!G.Cmd.num_pad) {
      break;
    }
  case NHKF_FIGHT:
    dothat = S("fight");
    how = S("");
    break;
  default:
    prefixhandling = FALSE;
    break;
  }
  buf[0] = 0;
  if (prefixhandling && (sym === G.Cmd.spkeys[NHKF_GETDIR_SELF] || G.Cmd.num_pad && sym === G.Cmd.spkeys[NHKF_GETDIR_SELF2])) {
    sprintf(P(buf), S("You can't %s%s yourself."), dothat, how);
  } else if (prefixhandling && (sym === 60 || sym === 62)) {
    sprintf(P(buf), S("You can't %s %s."), dothat, sym === 60 ? S("upward") : S("downward"));
  }
  if (!viawindow) {
    if (prefixhandling) {
      if (!$rd(P(buf))) {
        sprintf(P(buf), S("Invalid direction for '%s' prefix."), visctrl(G.Cmd.spkeys[spkey]));
      }
      await pline(S("%s"), P(buf));
      return TRUE;
    }
    return FALSE;
  }
  win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  if (!win) {
    return FALSE;
  }
  if ($rd(P(buf))) {
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S(""));
  } else if (msg) {
    sprintf(P(buf), S("cmdassist: %s"), msg);
    await G.windowprocs.win_putstr(win, 0, P(buf));
    await G.windowprocs.win_putstr(win, 0, S(""));
  }
  if (!prefixhandling && (letter(sym) || sym === 91)) {
    sym = highc(sym);
    ctrl = sym - 65 + 1 << 24 >> 24;
    if (!!(explain = dowhatdoes_core(ctrl, P(buf2))) && (!strchr(P(help_dir$wiz_only_list), sym) || G.flags.debug)) {
      sprintf(P(buf), S("Are you trying to use ^%c%s?"), sym, strchr(P(help_dir$wiz_only_list), sym) ? S("") : S(" as specified in the Guidebook"));
      await G.windowprocs.win_putstr(win, 0, P(buf));
      await G.windowprocs.win_putstr(win, 0, S(""));
      await G.windowprocs.win_putstr(win, 0, explain);
      await G.windowprocs.win_putstr(win, 0, S(""));
      await G.windowprocs.win_putstr(win, 0, S("To use that command, hold down the <Ctrl> key as a shift"));
      sprintf(P(buf), S("and press the <%c> key."), sym);
      await G.windowprocs.win_putstr(win, 0, P(buf));
      await G.windowprocs.win_putstr(win, 0, S(""));
    }
  }
  sprintf(P(buf), S("Valid direction keys%s%s%s are:"), prefixhandling ? S(" to ") : S(""), prefixhandling ? dothat : S(""), G.u.umonnum === 115 ? S(" in your current form") : S(""));
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await show_direction_keys(win, !prefixhandling ? 46 : 32, G.u.umonnum === 115 ? 1 : 0);
  if (!prefixhandling || spkey === NHKF_NOPICKUP) {
    await G.windowprocs.win_putstr(win, 0, S(""));
    await G.windowprocs.win_putstr(win, 0, S("          <  up"));
    await G.windowprocs.win_putstr(win, 0, S("          >  down"));
    if (!prefixhandling) {
      let selfi = G.Cmd.num_pad ? NHKF_GETDIR_SELF2 : NHKF_GETDIR_SELF;
      sprintf(P(buf), S("       %4s  direct at yourself"), visctrl(G.Cmd.spkeys[selfi]));
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
  }
  if (msg) {
    await G.windowprocs.win_putstr(win, 0, S(""));
    await G.windowprocs.win_putstr(win, 0, S("(Suppress this message with !cmdassist in config file.)"));
  }
  await G.windowprocs.win_display_nhwindow(win, FALSE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return TRUE;
}

export function confdir(): void {
  let x = G.u.umonnum === 115 ? 2 * rn2(4) : rn2(8);
  G.u.dx = G.xdir[x];
  G.u.dy = G.ydir[x];
  return;
}

export function directionname(dir: number): Ptr | null {
  if (dir < 0 || dir >= (Math.trunc(80 / 8) | 0)) {
    return S("invalid");
  }
  return directionname$dirnames[dir];
}

export function isok(x: number, y: number): number {
  return x >= 1 && x <= COLNO - 1 && y >= 0 && y <= ROWNO - 1 ? 1 : 0;
}

async function doherecmdmenu(): Promise<number> {
  let ch = await here_cmd_menu(TRUE);
  return ch ? 1 : 0;
}

async function dotherecmdmenu(): Promise<number> {
  let ch = 0;
  if (!await getdir(null) || !isok(G.u.ux + G.u.dx, G.u.uy + G.u.dy)) {
    return 0;
  }
  if (G.u.dx || G.u.dy) {
    ch = await there_cmd_menu(TRUE, G.u.ux + G.u.dx, G.u.uy + G.u.dy);
  } else {
    ch = await here_cmd_menu(TRUE);
  }
  return ch ? 1 : 0;
}

async function add_herecmd_menuitem(win: number, func: Function | null, text: Ptr | null): Promise<void> {
  let ch = 0;
  let any = new union_any();
  if ((ch = cmd_from_func(func)) !== 0) {
    any.$cp(G.zeroany);
    any.a_nfunc = func;
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, text, MENU_UNSELECTED);
  }
}

async function there_cmd_menu(doit: number, x: number, y: number): Promise<number> {
  let win = 0;
  let ch = 0;
  let buf = new Int8Array(256);
  let typ = $at2(G.level.locations, x, y).typ;
  let npick = 0;
  let K = 0;
  const picks = [null];
  picks[0] = null;
  let ttmp = null;
  let mtmp = null;
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  if (typ === DOOR) {
    let key_or_pick = 0;
    let card = 0;
    let dm = $at2(G.level.locations, x, y).flags | 0;
    if (dm & (D_CLOSED | D_LOCKED)) {
      await add_herecmd_menuitem(win, doopen, S("Open the door")), ++K;
      key_or_pick = (carrying(SKELETON_KEY) || carrying(LOCK_PICK) ? 1 : 0) << 24 >> 24;
      card = (!!carrying(CREDIT_CARD) ? 1 : 0) << 24 >> 24;
      if (key_or_pick || card) {
        sprintf(P(buf), S("%sunlock the door"), key_or_pick ? S("lock or ") : S(""));
        await add_herecmd_menuitem(win, doapply, upstart(P(buf))), ++K;
      }
      await add_herecmd_menuitem(win, dountrap, S("Search the door for a trap")), ++K;
      await add_herecmd_menuitem(win, dokick, S("Kick the door")), ++K;
    } else if (dm & D_ISOPEN) {
      await add_herecmd_menuitem(win, doclose, S("Close the door")), ++K;
    }
  }
  if (typ <= SCORR) {
    await add_herecmd_menuitem(win, dosearch, S("Search for secret doors")), ++K;
  }
  if (!!(ttmp = t_at(x, y)) && ttmp.tseen | 0) {
    await add_herecmd_menuitem(win, doidtrap, S("Examine trap")), ++K;
    if ((ttmp.ttyp | 0) !== VIBRATING_SQUARE) {
      await add_herecmd_menuitem(win, dountrap, S("Attempt to disarm trap")), ++K;
    }
  }
  mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
  if (mtmp && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    mtmp = null;
  }
  if (mtmp && await which_armor(mtmp, W_SADDLE)) {
    let mnam = await x_monnam(mtmp, ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE);
    if (!G.u.usteed) {
      sprintf(P(buf), S("Ride %s"), mnam);
      await add_herecmd_menuitem(win, doride, P(buf)), ++K;
    }
    sprintf(P(buf), S("Remove saddle from %s"), mnam);
    await add_herecmd_menuitem(win, doloot, P(buf)), ++K;
  }
  if (mtmp && can_saddle(mtmp) && !await which_armor(mtmp, W_SADDLE) && carrying(SADDLE)) {
    sprintf(P(buf), S("Put saddle on %s"), await mon_nam(mtmp)), ++K;
    await add_herecmd_menuitem(win, doapply, P(buf));
  }
  if (K) {
    await G.windowprocs.win_end_menu(win, S("What do you want to do?"));
    npick = await G.windowprocs.win_select_menu(win, PICK_ONE, P(picks, 0));
  } else {
    await pline(S("No applicable actions."));
    npick = 0;
  }
  await G.windowprocs.win_destroy_nhwindow(win);
  ch = 0;
  if (npick > 0) {
    let func = picks[0].item.a_nfunc;
    free(picks[0]);
    if (doit) {
      let ret = await func();
      ch = ret << 24 >> 24;
    } else {
      ch = cmd_from_func(func);
    }
  }
  return ch;
}

async function here_cmd_menu(doit: number): Promise<number> {
  let win = 0;
  let ch = 0;
  let buf = new Int8Array(256);
  let typ = $at2(G.level.locations, G.u.ux, G.u.uy).typ;
  let npick = 0;
  const picks = [null];
  picks[0] = null;
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  if (typ === FOUNTAIN || typ === SINK) {
    sprintf(P(buf), S("Drink from the %s"), G.defsyms[typ === FOUNTAIN ? S_fountain : S_sink].explanation);
    await add_herecmd_menuitem(win, dodrink, P(buf));
  }
  if (typ === FOUNTAIN) {
    await add_herecmd_menuitem(win, dodip, S("Dip something into the fountain"));
  }
  if (typ === THRONE) {
    await add_herecmd_menuitem(win, dosit, S("Sit on the throne"));
  }
  if (G.u.ux === G.upstair.sx && G.u.uy === G.upstair.sy || G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy && G.sstairs.up || G.u.ux === G.upladder.sx && G.u.uy === G.upladder.sy) {
    sprintf(P(buf), S("Go up the %s"), G.u.ux === G.upladder.sx && G.u.uy === G.upladder.sy ? S("ladder") : S("stairs"));
    await add_herecmd_menuitem(win, doup, P(buf));
  }
  if (G.u.ux === G.dnstair.sx && G.u.uy === G.dnstair.sy || G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy && !G.sstairs.up || G.u.ux === G.dnladder.sx && G.u.uy === G.dnladder.sy) {
    sprintf(P(buf), S("Go down the %s"), G.u.ux === G.upladder.sx && G.u.uy === G.upladder.sy ? S("ladder") : S("stairs"));
    await add_herecmd_menuitem(win, dodown, P(buf));
  }
  if (G.u.usteed) {
    sprintf(P(buf), S("Dismount %s"), await x_monnam(G.u.usteed, ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE));
    await add_herecmd_menuitem(win, doride, P(buf));
  }
  if (!!G.level.objects[G.u.ux][G.u.uy]) {
    let otmp = G.level.objects[G.u.ux][G.u.uy];
    sprintf(P(buf), S("Pick up %s"), otmp.v.v_nexthere ? S("items") : await doname(otmp));
    await add_herecmd_menuitem(win, dopickup, P(buf));
    if (otmp.otyp >= 189 && otmp.otyp <= 195) {
      sprintf(P(buf), S("Loot %s"), await doname(otmp));
      await add_herecmd_menuitem(win, doloot, P(buf));
    }
    if (otmp.oclass === FOOD_CLASS) {
      sprintf(P(buf), S("Eat %s"), await doname(otmp));
      await add_herecmd_menuitem(win, doeat, P(buf));
    }
  }
  if (G.invent) {
    await add_herecmd_menuitem(win, dodrop, S("Drop items"));
  }
  await add_herecmd_menuitem(win, donull, S("Rest one turn"));
  await add_herecmd_menuitem(win, dosearch, S("Search around you"));
  await add_herecmd_menuitem(win, dolook, S("Look at what is here"));
  await G.windowprocs.win_end_menu(win, S("What do you want to do?"));
  npick = await G.windowprocs.win_select_menu(win, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(win);
  ch = 0;
  if (npick > 0) {
    let func = picks[0].item.a_nfunc;
    free(picks[0]);
    if (doit) {
      let ret = await func();
      ch = ret << 24 >> 24;
    } else {
      ch = cmd_from_func(func);
    }
  }
  return ch;
}

export async function click_to_cmd(x: number, y: number, mod: number): Promise<Ptr | null> {
  let dir = 0;
  click_to_cmd$cmd[1] = 0;
  if (G.iflags.clicklook && mod === CLICK_2) {
    clicklook_cc.x = x << 24 >> 24;
    clicklook_cc.y = y << 24 >> 24;
    click_to_cmd$cmd[0] = G.Cmd.spkeys[NHKF_CLICKLOOK];
    return P(click_to_cmd$cmd);
  }
  x -= G.u.ux;
  y -= G.u.uy;
  if (G.flags.travelcmd) {
    if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
      x = sgn(x), y = sgn(y);
    } else {
      G.u.tx = G.u.ux + x << 24 >> 24;
      G.u.ty = G.u.uy + y << 24 >> 24;
      click_to_cmd$cmd[0] = G.Cmd.spkeys[NHKF_TRAVEL];
      return P(click_to_cmd$cmd);
    }
    if (x === 0 && y === 0) {
      if (G.iflags.herecmd_menu) {
        click_to_cmd$cmd[0] = await here_cmd_menu(FALSE);
        return P(click_to_cmd$cmd);
      }
      if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === FOUNTAIN || $at2(G.level.locations, G.u.ux, G.u.uy).typ === SINK) {
        click_to_cmd$cmd[0] = cmd_from_func(mod === CLICK_1 ? dodrink : dodip);
        return P(click_to_cmd$cmd);
      } else if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === THRONE) {
        click_to_cmd$cmd[0] = cmd_from_func(dosit);
        return P(click_to_cmd$cmd);
      } else if (G.u.ux === G.upstair.sx && G.u.uy === G.upstair.sy || G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy && G.sstairs.up || G.u.ux === G.upladder.sx && G.u.uy === G.upladder.sy) {
        click_to_cmd$cmd[0] = cmd_from_func(doup);
        return P(click_to_cmd$cmd);
      } else if (G.u.ux === G.dnstair.sx && G.u.uy === G.dnstair.sy || G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy && !G.sstairs.up || G.u.ux === G.dnladder.sx && G.u.uy === G.dnladder.sy) {
        click_to_cmd$cmd[0] = cmd_from_func(dodown);
        return P(click_to_cmd$cmd);
      } else if (!!G.level.objects[G.u.ux][G.u.uy]) {
        click_to_cmd$cmd[0] = cmd_from_func(G.level.objects[G.u.ux][G.u.uy].otyp >= 189 && G.level.objects[G.u.ux][G.u.uy].otyp <= 195 ? doloot : dopickup);
        return P(click_to_cmd$cmd);
      } else {
        click_to_cmd$cmd[0] = cmd_from_func(donull);
        return P(click_to_cmd$cmd);
      }
    }
    dir = xytod(x, y);
    if (!(!!G.level.monsters[G.u.ux + x][G.u.uy + y] ? G.level.monsters[G.u.ux + x][G.u.uy + y] : null) && !await test_move(G.u.ux, G.u.uy, x, y, TEST_MOVE)) {
      click_to_cmd$cmd[1] = G.Cmd.dirchars.a[G.Cmd.dirchars.o + dir];
      click_to_cmd$cmd[2] = 0;
      if (G.iflags.herecmd_menu) {
        click_to_cmd$cmd[0] = await there_cmd_menu(FALSE, G.u.ux + x, G.u.uy + y);
        if (click_to_cmd$cmd[0] === 0) {
          click_to_cmd$cmd[1] = 0;
        }
        return P(click_to_cmd$cmd);
      }
      if ($at2(G.level.locations, G.u.ux + x, G.u.uy + y).typ === DOOR) {
        if (($at2(G.level.locations, G.u.ux + x, G.u.uy + y).flags | 0) & D_LOCKED) {
          click_to_cmd$cmd[0] = cmd_from_func(dokick);
          return P(click_to_cmd$cmd);
        }
        if (($at2(G.level.locations, G.u.ux + x, G.u.uy + y).flags | 0) & D_CLOSED) {
          click_to_cmd$cmd[0] = cmd_from_func(doopen);
          return P(click_to_cmd$cmd);
        }
      }
      if ($at2(G.level.locations, G.u.ux + x, G.u.uy + y).typ <= SCORR) {
        click_to_cmd$cmd[0] = cmd_from_func(dosearch);
        click_to_cmd$cmd[1] = 0;
        return P(click_to_cmd$cmd);
      }
    }
  } else {
    if (x > 2 * Math.abs(y)) {
      x = 1, y = 0;
    } else if (y > 2 * Math.abs(x)) {
      x = 0, y = 1;
    } else if (x < -2 * Math.abs(y)) {
      x = -1, y = 0;
    } else if (y < -2 * Math.abs(x)) {
      x = 0, y = -1;
    } else {
      x = sgn(x), y = sgn(y);
    }
    if (x === 0 && y === 0) {
      click_to_cmd$cmd[0] = cmd_from_func(donull);
      return P(click_to_cmd$cmd);
    }
    dir = xytod(x, y);
  }
  click_to_cmd$cmd[1] = 0;
  if (mod === CLICK_1) {
    click_to_cmd$cmd[0] = G.Cmd.dirchars.a[G.Cmd.dirchars.o + dir];
  } else {
    click_to_cmd$cmd[0] = (G.Cmd.num_pad ? G.Cmd.dirchars.a[G.Cmd.dirchars.o + dir] - 128 : G.Cmd.dirchars.a[G.Cmd.dirchars.o + dir] - 97 + 65) << 24 >> 24;
  }
  return P(click_to_cmd$cmd);
}

export async function get_count(allowchars: Ptr | null, inkey: number, maxcount: number, count: Ptr | null, historical: number): Promise<number> {
  let qbuf = new Int8Array(128);
  let key = 0;
  let cnt = 0;
  let backspaced = FALSE;
  for (; ; ) {
    if (inkey) {
      key = inkey;
      inkey = 0;
    } else {
      key = await readchar();
    }
    if (digit(key)) {
      cnt = 10 * cnt + (key - 48);
      if (cnt < 0) {
        cnt = 0;
      } else if (maxcount > 0 && cnt > maxcount) {
        cnt = maxcount;
      }
    } else if (cnt && (key === 8 || key === STANDBY_erase_char)) {
      cnt = Math.trunc(cnt / 10);
      backspaced = TRUE;
    } else if (key === G.Cmd.spkeys[NHKF_ESC]) {
      break;
    } else if (!allowchars || strchr(allowchars, key)) {
      count.a[count.o] = cnt;
      break;
    }
    if (cnt > 9 || backspaced) {
      await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
      if (backspaced && !cnt) {
        sprintf(P(qbuf), S("Count: "));
      } else {
        sprintf(P(qbuf), S("Count: %ld"), cnt);
        backspaced = FALSE;
      }
      await custompline(SUPPRESS_HISTORY, S("%s"), P(qbuf));
      G.windowprocs.win_mark_synch();
    }
  }
  if (historical) {
    sprintf(P(qbuf), S("Count: %ld "), count.a[count.o]);
    key2txt(key & 0xff, eos(P(qbuf)));
    await G.windowprocs.win_putmsghistory(P(qbuf), FALSE);
  }
  return key << 24 >> 24;
}

async function parse(): Promise<Ptr | null> {
  let foo = 0;
  G.iflags.in_parse = TRUE;
  G.multi = 0;
  G.context.move = 1;
  await flush_screen(1);
  alt_esc = G.iflags.altmeta;
  if (!G.Cmd.num_pad || (foo = await readchar()) === G.Cmd.spkeys[NHKF_COUNT]) {
    const tmpmulti = new Float64Array(1);
    tmpmulti[0] = G.multi;
    foo = await get_count(null, 0, LARGEST_INT, P(tmpmulti, 0), FALSE);
    last_multi = G.multi = tmpmulti[0] | 0;
  }
  alt_esc = FALSE;
  if (G.iflags.debug_fuzzer && (G.Cmd.commands[foo & 255] && (G.Cmd.commands[foo & 255].ef_funct === dosuspend_core || G.Cmd.commands[foo & 255].ef_funct === dosh_core))) {
    foo = G.Cmd.spkeys[NHKF_ESC];
  }
  if (foo === G.Cmd.spkeys[NHKF_ESC]) {
    await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    G.multi = last_multi = 0;
  } else if (foo === G.Cmd.spkeys[NHKF_DOAGAIN] || G.in_doagain) {
    G.multi = last_multi;
  } else {
    last_multi = G.multi;
    savech(0);
    savech(foo << 24 >> 24);
  }
  if (G.multi) {
    --G.multi;
    G.save_cm = P(parse$in_line);
  } else {
    G.save_cm = null;
  }
  if (G.Cmd.pcHack_compat) {
    switch (foo) {
    case 53:
      foo = G.Cmd.spkeys[NHKF_RUSH];
      break;
    case 53 - 128:
      foo = G.Cmd.spkeys[NHKF_RUN];
      break;
    case 48 - 128:
      foo = G.Cmd.spkeys[NHKF_DOINV];
      break;
    default:
      break;
    }
  }
  parse$in_line[0] = foo << 24 >> 24;
  parse$in_line[1] = 0;
  if (prefix_cmd(foo)) {
    foo = await readchar();
    savech(foo << 24 >> 24);
    parse$in_line[1] = foo << 24 >> 24;
    parse$in_line[2] = 0;
  }
  await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
  G.iflags.in_parse = FALSE;
  return P(parse$in_line);
}

export async function hangup(sig_unused: number): Promise<void> {
  if (G.program_state.exiting) {
    G.program_state.in_moveloop = 0;
  }
  nhwindows_hangup();
  ++G.program_state.done_hup;
  if (G.program_state.in_moveloop && G.program_state.something_worth_saving) {
    return;
  }
  await end_of_input();
}

export async function end_of_input(): Promise<void> {
  if (G.program_state.something_worth_saving) {
    await dosave0();
  }
  if (G.iflags.window_inited) {
    await G.windowprocs.win_exit_nhwindows(null);
  }
  clearlocks();
  await nh_terminate(EXIT_SUCCESS);
  return;
}

export async function readchar(): Promise<number> {
  let $t1: any, $t2: any, $t3: any;
  let sym = 0;
  const x = new Int32Array(1);
  x[0] = G.u.ux;
  const y = new Int32Array(1);
  y[0] = G.u.uy;
  const mod = new Int32Array(1);
  mod[0] = 0;
  if (G.iflags.debug_fuzzer) {
    return randomkey();
  }
  if (readchar_queue.a[readchar_queue.o]) {
    sym = $rd(($t1 = readchar_queue, readchar_queue = $t1.add(1), $t1));
  } else {
    sym = G.in_doagain ? await pgetchar() : await G.windowprocs.win_nh_poskey(P(x, 0), P(y, 0), P(mod, 0));
  }
  if (sym === EOF) {
    let cnt = NR_OF_EOFS;
    do {
      clearerr(R.stdin);
      sym = await pgetchar();
    } while (--cnt && sym === EOF);
  }
  if (sym === EOF) {
    await hangup(0);
    sym = 27;
  } else if (sym === 27 && alt_esc) {
    sym = readchar_queue.a[readchar_queue.o] ? $rd(($t2 = readchar_queue, readchar_queue = $t2.add(1), $t2)) : await pgetchar();
    if (sym === EOF || sym === 0) {
      sym = 27;
    } else if (sym !== 27) {
      sym |= 128;
    }
  } else if (sym === 0) {
    readchar_queue = await click_to_cmd(x[0], y[0], mod[0]);
    sym = $rd(($t3 = readchar_queue, readchar_queue = $t3.add(1), $t3));
  }
  return sym << 24 >> 24;
}

async function dotravel(): Promise<number> {
  let cc = new struct_nhcoord();
  if (!G.flags.travelcmd) {
    return 0;
  }
  dotravel$cmd[1] = 0;
  cc.x = G.iflags.travelcc.x;
  cc.y = G.iflags.travelcc.y;
  if (cc.x === 0 && cc.y === 0) {
    cc.x = G.u.ux;
    cc.y = G.u.uy;
  }
  G.iflags.getloc_travelmode = TRUE;
  if (G.iflags.menu_requested) {
    let gf = G.iflags.getloc_filter;
    G.iflags.getloc_filter = GFILTER_VIEW;
    if (!await getpos_menu(cc, GLOC_INTERESTING)) {
      G.iflags.getloc_filter = gf;
      G.iflags.getloc_travelmode = FALSE;
      return 0;
    }
    G.iflags.getloc_filter = gf;
  } else {
    await pline(S("Where do you want to travel to?"));
    if (await getpos(cc, TRUE, S("the desired destination")) < 0) {
      G.iflags.getloc_travelmode = FALSE;
      return 0;
    }
  }
  G.iflags.getloc_travelmode = FALSE;
  G.iflags.travelcc.x = G.u.tx = cc.x;
  G.iflags.travelcc.y = G.u.ty = cc.y;
  dotravel$cmd[0] = G.Cmd.spkeys[NHKF_TRAVEL];
  readchar_queue = P(dotravel$cmd);
  return 0;
}

export async function yn_function(query: Ptr | null, resp: Ptr | null, def: number): Promise<number> {
  let res = 0;
  let qbuf = new Int8Array(128);
  let idx = G.saved_pline_index;
  let dumplog_buf = new Int8Array(144);
  G.iflags.last_msg = PLNMSG_UNKNOWN;
  if (strlen(query) >= QBUFSZ) {
    paniclog(S("Query truncated: "), query);
    strncpy(P(qbuf), query, QBUFSZ - 1 - 3);
    strcpy(P(qbuf, QBUFSZ - 1 - 3), S("..."));
    query = P(qbuf);
  }
  res = await G.windowprocs.win_yn_function(query, resp, def);
  if (idx === G.saved_pline_index) {
    sprintf(P(dumplog_buf), S("%s "), query);
    key2txt(res & 0xff, eos(P(dumplog_buf)));
    await dumplogmsg(P(dumplog_buf));
  }
  return res;
}

export async function paranoid_query(be_paranoid: number, prompt: Ptr | null): Promise<number> {
  let confirmed_ok = 0;
  if (be_paranoid) {
    let pbuf = new Int8Array(256);
    let qbuf = new Int8Array(128);
    let ans = new Int8Array(256);
    let promptprefix = S("");
    let responsetype = (G.flags.paranoia_bits & 1) >>> 0 !== 0 ? S("(yes|no)") : S("(yes) [no]");
    let k = 0;
    let trylimit = 6;
    copynchars(P(pbuf), prompt, BUFSZ - 1);
    do {
      k = strlen(promptprefix) + 1 + strlen(responsetype) | 0;
      if ((strlen(P(pbuf)) | 0) + k > QBUFSZ - 1) {
        strcpy(P(pbuf).add(QBUFSZ - 1).add(-k).add(-4), S("...?"));
      }
      sprintf(P(qbuf), S("%s%s %s"), promptprefix, P(pbuf), responsetype);
      $wr(P(ans), 0, 0);
      await G.windowprocs.win_getlin(P(qbuf), P(ans));
      mungspaces(P(ans));
      confirmed_ok = (!strncmpi(P(ans), S("yes"), -1) ? 1 : 0) << 24 >> 24;
      if (confirmed_ok || $rd(P(ans)) === 27) {
        break;
      }
      promptprefix = S("\"Yes\" or \"No\": ");
    } while ((G.flags.paranoia_bits & 1) >>> 0 !== 0 && strncmpi(P(ans), S("no"), -1) && --trylimit);
  } else {
    confirmed_ok = (await yn_function(prompt, P(G.ynchars), 110) === 121 ? 1 : 0) << 24 >> 24;
  }
  return confirmed_ok;
}

async function dosuspend_core(): Promise<number> {
  if (G.windowprocs.win_can_suspend()) {
    await dosuspend();
  } else {
    await Norep(P(cmdnotavail), S("#suspend"));
  }
  return 0;
}

async function dosh_core(): Promise<number> {
  await dosh();
  return 0;
}

export function $init(): void {
  alt_esc = 0;
  G.Cmd = struct_cmd.$of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, null, new Array(256).fill(null), new Int8Array(42));
  timed_occ_fn = null;
  readchar_queue = S("");
  clicklook_cc = new struct_nhcoord();
  unavailcmd = $cs("Unavailable command '%s'.", 26);
  cmdnotavail = $cs("'%s' command not available.", 28);
  pushq = new Int8Array(20);
  saveq = new Int8Array(20);
  phead = 0;
  ptail = 0;
  shead = 0;
  stail = 0;
  levltyp = [S("stone"),
S("vertical wall"),
S("horizontal wall"),
S("top-left corner wall"),
S("top-right corner wall"),
S("bottom-left corner wall"),
S("bottom-right corner wall"),
S("cross wall"),
S("tee-up wall"),
S("tee-down wall"),
S("tee-left wall"),
S("tee-right wall"),
S("drawbridge wall"),
S("tree"),
S("secret door"),
S("secret corridor"),
S("pool"),
S("moat"),
S("water"),
S("drawbridge up"),
S("lava pool"),
S("iron bars"),
S("door"),
S("corridor"),
S("room"),
S("stairs"),
S("ladder"),
S("fountain"),
S("throne"),
S("sink"),
S("grave"),
S("altar"),
S("ice"),
S("drawbridge down"),
S("air"),
S("cloud"),
S("unreachable/undiggable"),
S("")];
  en_win = -1;
  en_via_menu = 0;
  You_ = $cs("You ", 5);
  are = $cs("are ", 5);
  were = $cs("were ", 6);
  have = $cs("have ", 6);
  had = $cs("had ", 5);
  can = $cs("can ", 5);
  could = $cs("could ", 7);
  have_been = $cs("have been ", 11);
  have_never = $cs("have never ", 12);
  never = $cs("never ", 7);
  G.extcmdlist = $sarrOf([struct_ext_func_tab.$of(35, S("#"), S("perform an extended command"), doextcmd, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(191, S("?"), S("list all extended commands"), doextlist, IFBURIED | AUTOCOMPLETE | GENERALCMD),
struct_ext_func_tab.$of(225, S("adjust"), S("adjust inventory letters"), doorganize, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(193, S("annotate"), S("name current level"), donamelevel, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(97, S("apply"), S("apply (use) a tool (pick-axe, key, lamp...)"), doapply),
struct_ext_func_tab.$of(31 & 120, S("attributes"), S("show your attributes"), doattributes, IFBURIED),
struct_ext_func_tab.$of(64, S("autopickup"), S("toggle the pickup option on/off"), dotogglepickup, IFBURIED),
struct_ext_func_tab.$of(67, S("call"), S("call (name) something"), docallcmd, IFBURIED),
struct_ext_func_tab.$of(90, S("cast"), S("zap (cast) a spell"), docast, IFBURIED),
struct_ext_func_tab.$of(227, S("chat"), S("talk to someone"), dotalk, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(99, S("close"), S("close a door"), doclose),
struct_ext_func_tab.$of(195, S("conduct"), S("list voluntary challenges you have maintained"), doconduct, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(228, S("dip"), S("dip an object into something"), dodip, AUTOCOMPLETE),
struct_ext_func_tab.$of(62, S("down"), S("go down a staircase"), dodown),
struct_ext_func_tab.$of(100, S("drop"), S("drop an item"), dodrop),
struct_ext_func_tab.$of(68, S("droptype"), S("drop specific item types"), doddrop),
struct_ext_func_tab.$of(101, S("eat"), S("eat something"), doeat),
struct_ext_func_tab.$of(69, S("engrave"), S("engrave writing on the floor"), doengrave),
struct_ext_func_tab.$of(229, S("enhance"), S("advance or check weapon and spell skills"), enhance_weapon_skill, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(0, S("exploremode"), S("enter explore (discovery) mode"), enter_explore_mode, IFBURIED),
struct_ext_func_tab.$of(102, S("fire"), S("fire ammunition from quiver"), dofire),
struct_ext_func_tab.$of(230, S("force"), S("force a lock"), doforce, AUTOCOMPLETE),
struct_ext_func_tab.$of(59, S("glance"), S("show what type of thing a map symbol corresponds to"), doquickwhatis, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(63, S("help"), S("give a help message"), dohelp, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(0, S("herecmdmenu"), S("show menu of commands you can do here"), doherecmdmenu, IFBURIED),
struct_ext_func_tab.$of(86, S("history"), S("show long version and game history"), dohistory, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(105, S("inventory"), S("show your inventory"), ddoinv, IFBURIED),
struct_ext_func_tab.$of(73, S("inventtype"), S("inventory specific item types"), dotypeinv, IFBURIED),
struct_ext_func_tab.$of(233, S("invoke"), S("invoke an object's special powers"), doinvoke, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(234, S("jump"), S("jump to another location"), dojump, AUTOCOMPLETE),
struct_ext_func_tab.$of(31 & 100, S("kick"), S("kick something"), dokick),
struct_ext_func_tab.$of(92, S("known"), S("show what object types have been discovered"), dodiscovered, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(96, S("knownclass"), S("show discovered types for one class of objects"), doclassdisco, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(0, S("levelchange"), S("change experience level"), wiz_level_change, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("lightsources"), S("show mobile light sources"), wiz_light_sources, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(58, S("look"), S("look at what is here"), dolook, IFBURIED),
struct_ext_func_tab.$of(236, S("loot"), S("loot a box on the floor"), doloot, AUTOCOMPLETE),
struct_ext_func_tab.$of(237, S("monster"), S("use monster's special ability"), domonability, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(78, S("name"), S("name a monster or an object"), docallcmd, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(239, S("offer"), S("offer a sacrifice to the gods"), dosacrifice, AUTOCOMPLETE),
struct_ext_func_tab.$of(111, S("open"), S("open a door"), doopen),
struct_ext_func_tab.$of(79, S("options"), S("show option settings, possibly change them"), doset, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(31 & 111, S("overview"), S("show a summary of the explored dungeon"), dooverview, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(0, S("panic"), S("test panic routine (fatal to game)"), wiz_panic, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(112, S("pay"), S("pay your shopping bill"), dopay),
struct_ext_func_tab.$of(44, S("pickup"), S("pick up things at the current location"), dopickup),
struct_ext_func_tab.$of(0, S("polyself"), S("polymorph self"), wiz_polyself, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(240, S("pray"), S("pray to the gods for help"), dopray, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(31 & 112, S("prevmsg"), S("view recent game messages"), doprev_message, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(80, S("puton"), S("put on an accessory (ring, amulet, etc)"), doputon),
struct_ext_func_tab.$of(113, S("quaff"), S("quaff (drink) something"), dodrink),
struct_ext_func_tab.$of(241, S("quit"), S("exit without saving current game"), done2, IFBURIED | AUTOCOMPLETE | GENERALCMD),
struct_ext_func_tab.$of(81, S("quiver"), S("select ammunition for quiver"), dowieldquiver),
struct_ext_func_tab.$of(114, S("read"), S("read a scroll or spellbook"), doread),
struct_ext_func_tab.$of(31 & 114, S("redraw"), S("redraw screen"), doredraw, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(82, S("remove"), S("remove an accessory (ring, amulet, etc)"), doremring),
struct_ext_func_tab.$of(210, S("ride"), S("mount or dismount a saddled steed"), doride, AUTOCOMPLETE),
struct_ext_func_tab.$of(242, S("rub"), S("rub a lamp or a stone"), dorub, AUTOCOMPLETE),
struct_ext_func_tab.$of(83, S("save"), S("save the game and exit"), dosave, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(115, S("search"), S("search for traps and secret doors"), dosearch, IFBURIED, S("searching")),
struct_ext_func_tab.$of(42, S("seeall"), S("show all equipment in use"), doprinuse, IFBURIED),
struct_ext_func_tab.$of(AMULET_SYM, S("seeamulet"), S("show the amulet currently worn"), dopramulet, IFBURIED),
struct_ext_func_tab.$of(ARMOR_SYM, S("seearmor"), S("show the armor currently worn"), doprarm, IFBURIED),
struct_ext_func_tab.$of(GOLD_SYM, S("seegold"), S("count your gold"), doprgold, IFBURIED),
struct_ext_func_tab.$of(0, S("seenv"), S("show seen vectors"), wiz_show_seenv, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(RING_SYM, S("seerings"), S("show the ring(s) currently worn"), doprring, IFBURIED),
struct_ext_func_tab.$of(SPBOOK_SYM, S("seespells"), S("list and reorder known spells"), dovspell, IFBURIED),
struct_ext_func_tab.$of(TOOL_SYM, S("seetools"), S("show the tools currently in use"), doprtool, IFBURIED),
struct_ext_func_tab.$of(94, S("seetrap"), S("show the type of adjacent trap"), doidtrap, IFBURIED),
struct_ext_func_tab.$of(WEAPON_SYM, S("seeweapon"), S("show the weapon currently wielded"), doprwep, IFBURIED),
struct_ext_func_tab.$of(33, S("shell"), S("do a shell escape"), dosh_core, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(243, S("sit"), S("sit down"), dosit, AUTOCOMPLETE),
struct_ext_func_tab.$of(0, S("stats"), S("show memory statistics"), wiz_show_stats, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(31 & 122, S("suspend"), S("suspend the game"), dosuspend_core, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(120, S("swap"), S("swap wielded and secondary weapons"), doswapweapon),
struct_ext_func_tab.$of(84, S("takeoff"), S("take off one piece of armor"), dotakeoff),
struct_ext_func_tab.$of(65, S("takeoffall"), S("remove all armor"), doddoremarm),
struct_ext_func_tab.$of(31 & 116, S("teleport"), S("teleport around the level"), dotelecmd, IFBURIED),
struct_ext_func_tab.$of(0, S("terrain"), S("show map without obstructions"), doterrain, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(0, S("therecmdmenu"), S("menu of commands you can do from here to adjacent spot"), dotherecmdmenu),
struct_ext_func_tab.$of(116, S("throw"), S("throw something"), dothrow),
struct_ext_func_tab.$of(0, S("timeout"), S("look at timeout queue and hero's timed intrinsics"), wiz_timeout_queue, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(212, S("tip"), S("empty a container"), dotip, AUTOCOMPLETE),
struct_ext_func_tab.$of(95, S("travel"), S("travel to a specific location on the map"), dotravel),
struct_ext_func_tab.$of(244, S("turn"), S("turn undead away"), doturn, IFBURIED | AUTOCOMPLETE),
struct_ext_func_tab.$of(88, S("twoweapon"), S("toggle two-weapon combat"), dotwoweapon, AUTOCOMPLETE),
struct_ext_func_tab.$of(245, S("untrap"), S("untrap something"), dountrap, AUTOCOMPLETE),
struct_ext_func_tab.$of(60, S("up"), S("go up a staircase"), doup),
struct_ext_func_tab.$of(0, S("vanquished"), S("list vanquished monsters"), dovanquished, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(246, S("version"), S("list compile time options for this version of NetHack"), doextversion, IFBURIED | AUTOCOMPLETE | GENERALCMD),
struct_ext_func_tab.$of(118, S("versionshort"), S("show version"), doversion, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(0, S("vision"), S("show vision array"), wiz_show_vision, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(46, S("wait"), S("rest one move while doing nothing"), donull, IFBURIED, S("waiting")),
struct_ext_func_tab.$of(87, S("wear"), S("wear a piece of armor"), dowear),
struct_ext_func_tab.$of(38, S("whatdoes"), S("tell what a command does"), dowhatdoes, IFBURIED),
struct_ext_func_tab.$of(47, S("whatis"), S("show what type of thing a symbol corresponds to"), dowhatis, IFBURIED | GENERALCMD),
struct_ext_func_tab.$of(119, S("wield"), S("wield (put in use) a weapon"), dowield),
struct_ext_func_tab.$of(247, S("wipe"), S("wipe off your face"), dowipe, AUTOCOMPLETE),
struct_ext_func_tab.$of(0, S("wizbury"), S("bury objs under and around you"), wiz_debug_cmd_bury, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(31 & 101, S("wizdetect"), S("reveal hidden things within a small radius"), wiz_detect, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(31 & 103, S("wizgenesis"), S("create a monster"), wiz_genesis, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(31 & 105, S("wizidentify"), S("identify all items in inventory"), wiz_identify, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("wizintrinsic"), S("set an intrinsic"), wiz_intrinsic, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(31 & 118, S("wizlevelport"), S("teleport to another level"), wiz_level_tele, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("wizmakemap"), S("recreate the current level"), wiz_makemap, IFBURIED | WIZMODECMD),
struct_ext_func_tab.$of(31 & 102, S("wizmap"), S("map the level"), wiz_map, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("wizrumorcheck"), S("verify rumor boundaries"), wiz_rumor_check, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("wizsmell"), S("smell monster"), wiz_smell, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("wizwhere"), S("show locations of special levels"), wiz_where, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(31 & 119, S("wizwish"), S("wish for something"), wiz_wish, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(0, S("wmode"), S("show wall modes"), wiz_show_wmodes, IFBURIED | AUTOCOMPLETE | WIZMODECMD),
struct_ext_func_tab.$of(122, S("zap"), S("zap a wand"), dozap),
struct_ext_func_tab.$of(0, null, null, donull)]);
  movtab = $sarrOf([struct_movcmd.$of(104, 104, 52, 52, S("west"), S("left")),
struct_movcmd.$of(106, 106, 50, 56, S("south"), S("down")),
struct_movcmd.$of(107, 107, 56, 50, S("north"), S("up")),
struct_movcmd.$of(108, 108, 54, 54, S("east"), S("right")),
struct_movcmd.$of(98, 98, 49, 55, S("southwest"), S("lower left")),
struct_movcmd.$of(110, 110, 51, 57, S("southeast"), S("lower right")),
struct_movcmd.$of(117, 117, 57, 51, S("northeast"), S("upper right")),
struct_movcmd.$of(121, 122, 55, 49, S("northwest"), S("upper left")),
struct_movcmd.$of()]);
  G.extcmdlist_length = (Math.trunc(5424 / 48) | 0) - 1;
  template = $cs("%-27s  %4ld  %6ld", 18);
  stats_hdr = $cs("                             count  bytes", 42);
  stats_sep = $cs("---------------------------  ----- -------", 43);
  G.spkeys_binds = $sarrOf([anon_cmd_c_4285.$of(NHKF_ESC, 27),
anon_cmd_c_4285.$of(NHKF_DOAGAIN, DOAGAIN, S("repeat")),
anon_cmd_c_4285.$of(NHKF_REQMENU, 109, S("reqmenu")),
anon_cmd_c_4285.$of(NHKF_RUN, 71, S("run")),
anon_cmd_c_4285.$of(NHKF_RUN2, 53, S("run.numpad")),
anon_cmd_c_4285.$of(NHKF_RUSH, 103, S("rush")),
anon_cmd_c_4285.$of(NHKF_FIGHT, 70, S("fight")),
anon_cmd_c_4285.$of(NHKF_FIGHT2, 45, S("fight.numpad")),
anon_cmd_c_4285.$of(NHKF_NOPICKUP, 109, S("nopickup")),
anon_cmd_c_4285.$of(NHKF_RUN_NOPICKUP, 77, S("run.nopickup")),
anon_cmd_c_4285.$of(NHKF_DOINV, 48, S("doinv")),
anon_cmd_c_4285.$of(NHKF_TRAVEL, CMD_TRAVEL),
anon_cmd_c_4285.$of(NHKF_CLICKLOOK, CMD_CLICKLOOK),
anon_cmd_c_4285.$of(NHKF_REDRAW, 31 & 114, S("redraw")),
anon_cmd_c_4285.$of(NHKF_REDRAW2, 31 & 108, S("redraw.numpad")),
anon_cmd_c_4285.$of(NHKF_GETDIR_SELF, 46, S("getdir.self")),
anon_cmd_c_4285.$of(NHKF_GETDIR_SELF2, 115, S("getdir.self2")),
anon_cmd_c_4285.$of(NHKF_GETDIR_HELP, 63, S("getdir.help")),
anon_cmd_c_4285.$of(NHKF_COUNT, 110, S("count")),
anon_cmd_c_4285.$of(NHKF_GETPOS_SELF, 64, S("getpos.self")),
anon_cmd_c_4285.$of(NHKF_GETPOS_PICK, 46, S("getpos.pick")),
anon_cmd_c_4285.$of(NHKF_GETPOS_PICK_Q, 44, S("getpos.pick.quick")),
anon_cmd_c_4285.$of(NHKF_GETPOS_PICK_O, 59, S("getpos.pick.once")),
anon_cmd_c_4285.$of(NHKF_GETPOS_PICK_V, 58, S("getpos.pick.verbose")),
anon_cmd_c_4285.$of(NHKF_GETPOS_SHOWVALID, 36, S("getpos.valid")),
anon_cmd_c_4285.$of(NHKF_GETPOS_AUTODESC, 35, S("getpos.autodescribe")),
anon_cmd_c_4285.$of(NHKF_GETPOS_MON_NEXT, 109, S("getpos.mon.next")),
anon_cmd_c_4285.$of(NHKF_GETPOS_MON_PREV, 77, S("getpos.mon.prev")),
anon_cmd_c_4285.$of(NHKF_GETPOS_OBJ_NEXT, 111, S("getpos.obj.next")),
anon_cmd_c_4285.$of(NHKF_GETPOS_OBJ_PREV, 79, S("getpos.obj.prev")),
anon_cmd_c_4285.$of(NHKF_GETPOS_DOOR_NEXT, 100, S("getpos.door.next")),
anon_cmd_c_4285.$of(NHKF_GETPOS_DOOR_PREV, 68, S("getpos.door.prev")),
anon_cmd_c_4285.$of(NHKF_GETPOS_UNEX_NEXT, 120, S("getpos.unexplored.next")),
anon_cmd_c_4285.$of(NHKF_GETPOS_UNEX_PREV, 88, S("getpos.unexplored.prev")),
anon_cmd_c_4285.$of(NHKF_GETPOS_VALID_NEXT, 122, S("getpos.valid.next")),
anon_cmd_c_4285.$of(NHKF_GETPOS_VALID_PREV, 90, S("getpos.valid.prev")),
anon_cmd_c_4285.$of(NHKF_GETPOS_INTERESTING_NEXT, 97, S("getpos.all.next")),
anon_cmd_c_4285.$of(NHKF_GETPOS_INTERESTING_PREV, 65, S("getpos.all.prev")),
anon_cmd_c_4285.$of(NHKF_GETPOS_HELP, 63, S("getpos.help")),
anon_cmd_c_4285.$of(NHKF_GETPOS_LIMITVIEW, 34, S("getpos.filter")),
anon_cmd_c_4285.$of(NHKF_GETPOS_MOVESKIP, 42, S("getpos.moveskip")),
anon_cmd_c_4285.$of(NHKF_GETPOS_MENU, 33, S("getpos.menu"))]);
  last_multi = 0;
  doextlist$headings = [S("Extended commands"), S("Debugging Extended Commands")];
  wiz_intrinsic$wizintrinsic = $cs("#wizintrinsic", 14);
  wiz_intrinsic$fmt = $cs("You are%s %s.", 14);
  basics_enlightenment$Power = $cs("energy points (spell power)", 28);
  basics_enlightenment$Your_wallet = $cs("Your wallet ", 13);
  attributes_enlightenment$if_surroundings_permitted = $cs(" if surroundings permitted", 27);
  attributes_enlightenment$hofe_titles = [S("the Hand of Elbereth"), S("the Envoy of Balance"), S("the Glory of Arioch")];
  attributes_enlightenment$mc_types = [S(""),
S("warded"),
S("guarded"),
S("protected")];
  key2extcmddesc$key2cmdbuf = new Int8Array(48);
  dokeylist$run_desc = $cs("Prefix: run until something very interesting is seen", 53);
  dokeylist$forcefight_desc = $cs("Prefix: force fight even if you don't see a monster", 52);
  dokeylist$misc_keys = $sarrOf([anon_cmd_c_3733.$of(NHKF_ESC, S("escape from the current query/action")),
anon_cmd_c_3733.$of(NHKF_RUSH, S("Prefix: rush until something interesting is seen")),
anon_cmd_c_3733.$of(NHKF_RUN, P(dokeylist$run_desc)),
anon_cmd_c_3733.$of(NHKF_RUN2, P(dokeylist$run_desc), 1),
anon_cmd_c_3733.$of(NHKF_FIGHT, P(dokeylist$forcefight_desc)),
anon_cmd_c_3733.$of(NHKF_FIGHT2, P(dokeylist$forcefight_desc), 1),
anon_cmd_c_3733.$of(NHKF_NOPICKUP, S("Prefix: move without picking up objects/fighting")),
anon_cmd_c_3733.$of(NHKF_RUN_NOPICKUP, S("Prefix: run without picking up objects/fighting")),
anon_cmd_c_3733.$of(NHKF_DOINV, S("view inventory"), 1),
anon_cmd_c_3733.$of(NHKF_REQMENU, S("Prefix: request a menu")),
anon_cmd_c_3733.$of()]);
  reset_commands$sdir = $cs("hykulnjb><", 11);
  reset_commands$sdir_swap_yz = $cs("hzkulnjb><", 11);
  reset_commands$ndir = $cs("47896321><", 11);
  reset_commands$ndir_phone_layout = $cs("41236987><", 11);
  reset_commands$ylist = $ta(Int32Array, 6, [121, 89, 31 & 121, 121 - 128, 89 - 128, (31 & 121) - 128]);
  reset_commands$back_dir_cmd = new Array(8).fill(null);
  reset_commands$backed_dir_cmd = 0;
  randomkey$i = 0;
  help_dir$wiz_only_list = $cs("EFGIVW", 7);
  directionname$dirnames = [S("west"),
S("northwest"),
S("north"),
S("northeast"),
S("east"),
S("southeast"),
S("south"),
S("southwest"),
S("down"),
S("up")];
  click_to_cmd$cmd = new Int8Array(4);
  parse$in_line = new Int8Array(80);
  dotravel$cmd = new Int8Array(2);
}
