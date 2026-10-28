// @ts-nocheck
// NetHack 3.6.7 ../win/tty/wintty.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { bot, stat_cap_indx, status_initialize } from './botl.ts';
import { randomkey, readchar } from './cmd.ts';
import { docrt, flush_screen, redraw_map, row_refresh } from './display.ts';
import { dlb_fclose, dlb_fgets, dlb_fopen } from './dlb.ts';
import { nh_terminate, panic } from './end.ts';
import { clearlocks, debugcore, paniclog } from './files.ts';
import { tty_get_ext_cmd, tty_getlin, xwaitforspace } from './getline.ts';
import { eos, highc, lowc, pmatchi, tabexpand } from './hacklib.ts';
import { free_pickinv_cache } from './invent.ts';
import { getwindowsz } from './ioctl.ts';
import { decode_mixed, genl_putmixed, mapglyph } from './mapglyph.ts';
import { an } from './objnam.ts';
import { get_menu_coloring, map_menu_cmd, set_wc2_option_mod_status } from './options.ts';
import { impossible, pline } from './pline.ts';
import { genl_outrip } from './rip.ts';
import { build_plselection_prompt, clearrolefilter, gotrolefilter, ok_align, ok_gend, ok_race, ok_role, pick_align, pick_gend, pick_race, pick_role, plnamesuffix, randalign, randgend, randrace, randrole, rigid_role_checks, role_menu_extra, role_selection_prolog, setrolefilter, validalign, validgend, validrace } from './role.ts';
import { backsp, cl_end, cl_eos, clear_screen, cmov, graph_off, graph_on, home, nocmov, standoutbeg, standoutend, term_attr_fixup, term_end_attr, term_end_color, term_end_raw_bold, term_start_attr, term_start_color, term_start_raw_bold, tty_delay_output, tty_end_screen, tty_nhbell, tty_number_pad, tty_shutdown, tty_start_screen, tty_startup, xputs } from './termcap.ts';
import { addtopl, more, remember_topl, show_topl, tty_doprev_message, tty_getmsghistory, tty_putmsghistory, tty_yn_function, update_topl } from './topl.ts';
import { gettty, setftty, settty } from './unixtty.ts';
import { copyright_banner_line } from './version.ts';
import { genl_can_suspend_yes, genl_preference_update, genl_status_enablefield, genl_status_finish, genl_status_init } from './windows.ts';
import { struct_DisplayDesc, struct_WinDesc, struct_condition_t, struct_mi, struct_tty_mi, struct_tty_status_fields, struct_window_procs, union_any } from './structs.ts';
import { $arr, $at2, $cs, $peq, $rd, $rows, $sadd, $sarr, $sarrOf, $ta, $u64, $wr, G, P, R, S, fflush, fileno, fputs, free, getchar, perror, putchar, puts, read, setbuf, signal, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncpy } from './rt/index.ts';
import { ATR_INVERSE, ATR_NOHISTORY, ATR_NONE, BEFORE, BL_AC, BL_ALIGN, BL_ATTCLR_MAX, BL_CAP, BL_CH, BL_CO, BL_CONDITION, BL_DX, BL_ENE, BL_ENEMAX, BL_EXP, BL_FLUSH, BL_GOLD, BL_HD, BL_HP, BL_HPMAX, BL_HUNGER, BL_IN, BL_LEVELDESC, BL_MASK_BLIND, BL_MASK_CONF, BL_MASK_DEAF, BL_MASK_FLY, BL_MASK_FOODPOIS, BL_MASK_HALLU, BL_MASK_LEV, BL_MASK_RIDE, BL_MASK_SLIME, BL_MASK_STONE, BL_MASK_STRNGL, BL_MASK_STUN, BL_MASK_TERMILL, BL_RESET, BL_SCORE, BL_STR, BL_TIME, BL_TITLE, BL_WI, BL_XP, BUFSZ, CLR_MAX, COLNO, EOF, EXIT_SUCCESS, FALSE, FORCE_RESET, HL_ATTCLR_DIM, HL_BLINK, HL_BOLD, HL_DIM, HL_INVERSE, HL_ULINE, MAXBLSTATS, MAXWIN, MENU_EXPLICIT_CHOICE, MENU_FIRST_PAGE, MENU_INVERT_ALL, MENU_INVERT_PAGE, MENU_LAST_PAGE, MENU_NEXT_PAGE, MENU_PREVIOUS_PAGE, MENU_SEARCH, MENU_SELECTED, MENU_SELECT_ALL, MENU_SELECT_PAGE, MENU_UNSELECTED, MENU_UNSELECT_ALL, MENU_UNSELECT_PAGE, MG_BW_LAVA, MG_DETECT, MG_OBJPILE, MG_PET, NHW_BASE, NHW_MAP, NHW_MENU, NHW_MESSAGE, NHW_STATUS, NHW_TEXT, NOW, NO_COLOR, NO_GLYPH, NO_RESET, PICK_ANY, PICK_NONE, PICK_ONE, PICK_RANDOM, QBUFSZ, REASSESS_ONLY, ROLE_ALIGNS, ROLE_FEMALE, ROLE_GENDERS, ROLE_GENDMASK, ROLE_MALE, ROLE_NONE, ROLE_RANDOM, ROWNO, RS_ALGNMNT, RS_GENDER, RS_RACE, RS_ROLE, RS_filter, SET_IN_GAME, SIGWINCH, TRUE, WC2_DARKGRAY, WC2_FLUSH_STATUS, WC2_HILITE_STATUS, WC2_HITPOINTBAR, WC2_RESET_STATUS, WC2_STATUSLINES, WC2_SUPPRESS_HIST, WC_COLOR, WC_EIGHT_BIT_IN, WC_HILITE_PET, WC_INVERSE, WININIT, WIN_CANCELLED, WIN_ERR, WIN_STOP } from './consts.ts';

let obuf: any;
let winpanicstr: any;
let clipping: number;
let clipx: number;
let clipxmax: number;
let clipy: number;
let clipymax: number;
let default_menu_cmds: any;
let tty_colormasks: Ptr | null;
let tty_condition_bits: number;
let tty_status: any;
let hpbar_percent: number;
let hpbar_color: number;
let conditions: any;
let encvals: any;
let twolineorder: any;
let threelineorder: any;
let fieldorder: Ptr | null;
let finalx: any;
let windowdata_init: number;
let cond_shrinklvl: number;
let enclev: number;
let enc_shrinklvl: number;
let dlvl_shrinklvl: number;
let truncation_expected: number;
let do_field_opt: number;
let tty_askname$who_are_you: any;
let compress_str$cbuf: any;
let tty_nhgetch$nesting: number;
let render_status$once_only: number;

async function bail(mesg: Ptr | null): Promise<void> {
  clearlocks();
  await tty_exit_nhwindows(mesg);
  await nh_terminate(EXIT_SUCCESS);
}

async function winch_handler(sig_unused: number): Promise<void> {
  let oldLI = G.tc_gbl_data.tc_LI;
  let oldCO = G.tc_gbl_data.tc_CO;
  let i = 0;
  let cw = null;
  getwindowsz();
  if ((oldLI !== G.tc_gbl_data.tc_LI || oldCO !== G.tc_gbl_data.tc_CO) && G.ttyDisplay) {
    G.ttyDisplay.rows = G.tc_gbl_data.tc_LI << 16 >> 16;
    G.ttyDisplay.cols = G.tc_gbl_data.tc_CO << 16 >> 16;
    cw = G.wins[G.BASE_WINDOW];
    cw.rows = G.ttyDisplay.rows;
    cw.cols = G.ttyDisplay.cols;
    if (G.iflags.window_inited) {
      cw = G.wins[G.WIN_MESSAGE];
      cw.curx = cw.cury = 0;
      await new_status_window();
      if (G.u.ux) {
        i = G.ttyDisplay.toplin;
        G.ttyDisplay.toplin = 0;
        await docrt();
        await bot();
        G.ttyDisplay.toplin = i;
        await flush_screen(1);
        if (i) {
          await addtopl(P(G.toplines));
        } else {
          for (i = G.WIN_INVEN; i < MAXWIN; ++i) {
            if (G.wins[i] && G.wins[i].active) {
              await addtopl(S("Press Return to continue: "));
              break;
            }
          }
        }
        fflush(R.stdout);
        if (i < 2) {
          await flush_screen(1);
        }
      }
    }
  }
}

async function new_status_window(): Promise<void> {
  if (G.WIN_STATUS !== WIN_ERR) {
    if (G.wins[G.WIN_STATUS].maxrow > G.iflags.wc2_statuslines) {
      await tty_clear_nhwindow(G.WIN_STATUS);
    }
    await tty_destroy_nhwindow(G.WIN_STATUS), G.WIN_STATUS = WIN_ERR;
  }
  genl_status_finish();
  await tty_status_init();
  await tty_clear_nhwindow(G.WIN_STATUS);
  await status_initialize(REASSESS_ONLY);
  if (G.u.ux) {
    if (G.tc_gbl_data.tc_LI < 1 + ROWNO + G.iflags.wc2_statuslines) {
      setclipped();
      await tty_cliparound(G.u.ux, G.u.uy);
    } else {
      clipping = FALSE;
      clipx = clipy = 0;
    }
  }
}

export async function tty_init_nhwindows(argcp: Ptr | null, argv: Ptr | null): Promise<void> {
  const wid = new Int32Array(1);
  const hgt = new Int32Array(1);
  let i = 0;
  G.iflags.wc2_statuslines = G.iflags.wc2_statuslines < 3 ? 2 : 3;
  setbuf(R.stdout, P(obuf));
  gettty();
  await tty_startup(P(wid, 0), P(hgt, 0));
  setftty();
  G.ttyDisplay = new struct_DisplayDesc();
  G.ttyDisplay.toplin = 0;
  G.ttyDisplay.rows = hgt[0] << 16 >> 16;
  G.ttyDisplay.cols = wid[0] << 16 >> 16;
  G.ttyDisplay.curx = G.ttyDisplay.cury = 0;
  G.ttyDisplay.inmore = G.ttyDisplay.inread = G.ttyDisplay.intr = 0;
  G.ttyDisplay.dismiss_more = 0;
  G.ttyDisplay.color = NO_COLOR;
  G.ttyDisplay.attrs = 0;
  G.BASE_WINDOW = await tty_create_nhwindow(NHW_BASE);
  G.wins[G.BASE_WINDOW].active = 1;
  G.ttyDisplay.lastwin = WIN_ERR;
  signal(SIGWINCH, winch_handler);
  await tty_clear_nhwindow(G.BASE_WINDOW);
  await tty_putstr(G.BASE_WINDOW, 0, S(""));
  for (i = 1; i <= 4; ++i) {
    await tty_putstr(G.BASE_WINDOW, 0, copyright_banner_line(i));
  }
  await tty_putstr(G.BASE_WINDOW, 0, S(""));
  await tty_display_nhwindow(G.BASE_WINDOW, FALSE);
  if ((G.tty_procs.wincap2 & WC2_STATUSLINES) >>> 0) {
    await set_wc2_option_mod_status(WC2_STATUSLINES, SET_IN_GAME);
  }
}

export async function tty_preference_update(pref: Ptr | null): Promise<void> {
  if (!strcmp(pref, S("statuslines")) && G.iflags.window_inited) {
    await new_status_window();
  }
  genl_preference_update(pref);
  return;
}

export async function tty_player_selection(): Promise<void> {
  let $g = 0;
  let i = 0;
  let k = 0;
  let n = 0;
  let choice = 0;
  let nextpick = 0;
  let getconfirmation = 0;
  let picksomething = 0;
  let pick4u = 0;
  let pbuf = new Int8Array(128);
  let plbuf = new Int8Array(128);
  let win = 0;
  let any = new union_any();
  let selected = [null];
  $L: for (;;) {
    switch ($g) {
    case 0:
      pick4u = 110;
      pbuf = new Int8Array(128);
      plbuf = new Int8Array(128);
      any = new union_any();
      selected[0] = null;
      picksomething = (G.flags.initrole === ROLE_NONE || G.flags.initrace === ROLE_NONE || G.flags.initgend === ROLE_NONE || G.flags.initalign === ROLE_NONE ? 1 : 0) << 24 >> 24;
      if (G.flags.randomall && picksomething) {
        if (G.flags.initrole === ROLE_NONE) {
          G.flags.initrole = ROLE_RANDOM;
        }
        if (G.flags.initrace === ROLE_NONE) {
          G.flags.initrace = ROLE_RANDOM;
        }
        if (G.flags.initgend === ROLE_NONE) {
          G.flags.initgend = ROLE_RANDOM;
        }
        if (G.flags.initalign === ROLE_NONE) {
          G.flags.initalign = ROLE_RANDOM;
        }
      }
      rigid_role_checks();
      if (G.flags.initrole === ROLE_NONE || G.flags.initrace === ROLE_NONE || G.flags.initgend === ROLE_NONE || G.flags.initalign === ROLE_NONE) {
        let echoline = 0;
        let prompt = build_plselection_prompt(P(pbuf), QBUFSZ, G.flags.initrole, G.flags.initrace, G.flags.initgend, G.flags.initalign);
        await tty_putstr(G.BASE_WINDOW, 0, S(""));
        echoline = G.wins[G.BASE_WINDOW].cury | 0;
        await tty_putstr(G.BASE_WINDOW, 0, prompt);
        do {
          pick4u = lowc(await readchar());
          if (strchr(P(G.quitchars), pick4u)) {
            pick4u = 121;
          }
        } while (!strchr(P(G.ynaqchars), pick4u));
        if ((strlen(prompt) | 0) + 1 < G.tc_gbl_data.tc_CO) {
          await tty_putsym(G.BASE_WINDOW, (strlen(prompt) | 0) + 1, echoline, pick4u);
          await tty_putstr(G.BASE_WINDOW, 0, S(""));
        } else {
          await tty_clear_nhwindow(G.BASE_WINDOW);
        }
        if (pick4u !== 121 && pick4u !== 97 && pick4u !== 110) {
          { $g = 1; continue $L; }
        }
      }
    case 2: // makepicks
      nextpick = RS_ROLE;
      do {
        if (nextpick === RS_ROLE) {
          nextpick = RS_RACE;
          if (G.flags.initrole < 0) {
            if (pick4u === 121 || pick4u === 97 || G.flags.initrole === ROLE_RANDOM) {
              k = pick_role(G.flags.initrace, G.flags.initgend, G.flags.initalign, PICK_RANDOM);
              if (k < 0) {
                await tty_putstr(G.BASE_WINDOW, 0, S("Incompatible role!"));
                k = randrole(FALSE);
              }
            } else {
              await tty_clear_nhwindow(G.BASE_WINDOW);
              await role_selection_prolog(RS_ROLE, G.BASE_WINDOW);
              win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
              await G.windowprocs.win_start_menu(win);
              await setup_rolemenu(win, TRUE, G.flags.initrace, G.flags.initgend, G.flags.initalign);
              await role_menu_extra(ROLE_RANDOM, win, TRUE);
              any.$cp(G.zeroany);
              await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
              await role_menu_extra(RS_RACE, win, FALSE);
              await role_menu_extra(RS_GENDER, win, FALSE);
              await role_menu_extra(RS_ALGNMNT, win, FALSE);
              if (gotrolefilter()) {
                await role_menu_extra(RS_filter, win, FALSE);
              }
              await role_menu_extra(ROLE_NONE, win, FALSE);
              strcpy(P(pbuf), S("Pick a role or profession"));
              await G.windowprocs.win_end_menu(win, P(pbuf));
              n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
              if (n > 0) {
                choice = selected[0].item.a_int;
                if (n > 1 && choice === ROLE_RANDOM) {
                  choice = $sadd(selected[0], 1).item.a_int;
                }
              } else {
                choice = n === 0 ? ROLE_RANDOM : ROLE_NONE;
              }
              if (selected[0]) {
                free(selected[0]), selected[0] = null;
              }
              await G.windowprocs.win_destroy_nhwindow(win);
              if (choice === ROLE_NONE) {
                { $g = 1; continue $L; }
              } else if (choice === -2 - (4 + 1)) {
                G.flags.initalign = k = ROLE_NONE;
                nextpick = RS_ALGNMNT;
              } else if (choice === -2 - (3 + 1)) {
                G.flags.initgend = k = ROLE_NONE;
                nextpick = RS_GENDER;
              } else if (choice === -2 - (2 + 1)) {
                G.flags.initrace = k = ROLE_NONE;
                nextpick = RS_RACE;
              } else if (choice === -2 - (5 + 1)) {
                G.flags.initrole = k = ROLE_NONE;
                await reset_role_filtering();
                nextpick = RS_ROLE;
              } else if (choice === ROLE_RANDOM) {
                k = pick_role(G.flags.initrace, G.flags.initgend, G.flags.initalign, PICK_RANDOM);
                if (k < 0) {
                  k = randrole(FALSE);
                }
              } else {
                k = choice - 1;
              }
            }
            G.flags.initrole = k;
          }
        }
        if (nextpick === RS_RACE) {
          nextpick = G.flags.initrole < 0 ? RS_ROLE : RS_GENDER;
          if (G.flags.initrace < 0 || !validrace(G.flags.initrole, G.flags.initrace)) {
            if (pick4u === 121 || pick4u === 97 || G.flags.initrace === ROLE_RANDOM) {
              k = pick_race(G.flags.initrole, G.flags.initgend, G.flags.initalign, PICK_RANDOM);
              if (k < 0) {
                await tty_putstr(G.BASE_WINDOW, 0, S("Incompatible race!"));
                k = randrace(G.flags.initrole);
              }
            } else {
              n = 0;
              k = 0;
              for (i = 0; G.races[i].noun; ++i) {
                if (ok_race(G.flags.initrole, i, G.flags.initgend, G.flags.initalign)) {
                  ++n;
                  k = i;
                }
              }
              if (n === 0) {
                for (i = 0; G.races[i].noun; ++i) {
                  if (validrace(G.flags.initrole, i)) {
                    ++n;
                    k = i;
                  }
                }
              }
              if (n > 1) {
                await tty_clear_nhwindow(G.BASE_WINDOW);
                await role_selection_prolog(RS_RACE, G.BASE_WINDOW);
                win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
                await G.windowprocs.win_start_menu(win);
                any.$cp(G.zeroany);
                await setup_racemenu(win, TRUE, G.flags.initrole, G.flags.initgend, G.flags.initalign);
                await role_menu_extra(ROLE_RANDOM, win, TRUE);
                any.a_int = 0;
                await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
                await role_menu_extra(RS_ROLE, win, FALSE);
                await role_menu_extra(RS_GENDER, win, FALSE);
                await role_menu_extra(RS_ALGNMNT, win, FALSE);
                if (gotrolefilter()) {
                  await role_menu_extra(RS_filter, win, FALSE);
                }
                await role_menu_extra(ROLE_NONE, win, FALSE);
                strcpy(P(pbuf), S("Pick a race or species"));
                await G.windowprocs.win_end_menu(win, P(pbuf));
                n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
                if (n > 0) {
                  choice = selected[0].item.a_int;
                  if (n > 1 && choice === ROLE_RANDOM) {
                    choice = $sadd(selected[0], 1).item.a_int;
                  }
                } else {
                  choice = n === 0 ? ROLE_RANDOM : ROLE_NONE;
                }
                if (selected[0]) {
                  free(selected[0]), selected[0] = null;
                }
                await G.windowprocs.win_destroy_nhwindow(win);
                if (choice === ROLE_NONE) {
                  { $g = 1; continue $L; }
                } else if (choice === -2 - (4 + 1)) {
                  G.flags.initalign = k = ROLE_NONE;
                  nextpick = RS_ALGNMNT;
                } else if (choice === -2 - (3 + 1)) {
                  G.flags.initgend = k = ROLE_NONE;
                  nextpick = RS_GENDER;
                } else if (choice === -2 - (1 + 1)) {
                  G.flags.initrole = k = ROLE_NONE;
                  nextpick = RS_ROLE;
                } else if (choice === -2 - (5 + 1)) {
                  G.flags.initrace = k = ROLE_NONE;
                  if (await reset_role_filtering()) {
                    nextpick = RS_ROLE;
                  } else {
                    nextpick = RS_RACE;
                  }
                } else if (choice === ROLE_RANDOM) {
                  k = pick_race(G.flags.initrole, G.flags.initgend, G.flags.initalign, PICK_RANDOM);
                  if (k < 0) {
                    k = randrace(G.flags.initrole);
                  }
                } else {
                  k = choice - 1;
                }
              }
            }
            G.flags.initrace = k;
          }
        }
        if (nextpick === RS_GENDER) {
          nextpick = G.flags.initrole < 0 ? RS_ROLE : G.flags.initrace < 0 ? RS_RACE : RS_ALGNMNT;
          if (G.flags.initgend < 0 || !validgend(G.flags.initrole, G.flags.initrace, G.flags.initgend)) {
            if (pick4u === 121 || pick4u === 97 || G.flags.initgend === ROLE_RANDOM) {
              k = pick_gend(G.flags.initrole, G.flags.initrace, G.flags.initalign, PICK_RANDOM);
              if (k < 0) {
                await tty_putstr(G.BASE_WINDOW, 0, S("Incompatible gender!"));
                k = randgend(G.flags.initrole, G.flags.initrace);
              }
            } else {
              n = 0;
              k = 0;
              for (i = 0; i < ROLE_GENDERS; ++i) {
                if (ok_gend(G.flags.initrole, G.flags.initrace, i, G.flags.initalign)) {
                  ++n;
                  k = i;
                }
              }
              if (n === 0) {
                for (i = 0; i < ROLE_GENDERS; ++i) {
                  if (validgend(G.flags.initrole, G.flags.initrace, i)) {
                    ++n;
                    k = i;
                  }
                }
              }
              if (n > 1) {
                await tty_clear_nhwindow(G.BASE_WINDOW);
                await role_selection_prolog(RS_GENDER, G.BASE_WINDOW);
                win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
                await G.windowprocs.win_start_menu(win);
                any.$cp(G.zeroany);
                await setup_gendmenu(win, TRUE, G.flags.initrole, G.flags.initrace, G.flags.initalign);
                await role_menu_extra(ROLE_RANDOM, win, TRUE);
                any.a_int = 0;
                await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
                await role_menu_extra(RS_ROLE, win, FALSE);
                await role_menu_extra(RS_RACE, win, FALSE);
                await role_menu_extra(RS_ALGNMNT, win, FALSE);
                if (gotrolefilter()) {
                  await role_menu_extra(RS_filter, win, FALSE);
                }
                await role_menu_extra(ROLE_NONE, win, FALSE);
                strcpy(P(pbuf), S("Pick a gender or sex"));
                await G.windowprocs.win_end_menu(win, P(pbuf));
                n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
                if (n > 0) {
                  choice = selected[0].item.a_int;
                  if (n > 1 && choice === ROLE_RANDOM) {
                    choice = $sadd(selected[0], 1).item.a_int;
                  }
                } else {
                  choice = n === 0 ? ROLE_RANDOM : ROLE_NONE;
                }
                if (selected[0]) {
                  free(selected[0]), selected[0] = null;
                }
                await G.windowprocs.win_destroy_nhwindow(win);
                if (choice === ROLE_NONE) {
                  { $g = 1; continue $L; }
                } else if (choice === -2 - (4 + 1)) {
                  G.flags.initalign = k = ROLE_NONE;
                  nextpick = RS_ALGNMNT;
                } else if (choice === -2 - (2 + 1)) {
                  G.flags.initrace = k = ROLE_NONE;
                  nextpick = RS_RACE;
                } else if (choice === -2 - (1 + 1)) {
                  G.flags.initrole = k = ROLE_NONE;
                  nextpick = RS_ROLE;
                } else if (choice === -2 - (5 + 1)) {
                  G.flags.initgend = k = ROLE_NONE;
                  if (await reset_role_filtering()) {
                    nextpick = RS_ROLE;
                  } else {
                    nextpick = RS_GENDER;
                  }
                } else if (choice === ROLE_RANDOM) {
                  k = pick_gend(G.flags.initrole, G.flags.initrace, G.flags.initalign, PICK_RANDOM);
                  if (k < 0) {
                    k = randgend(G.flags.initrole, G.flags.initrace);
                  }
                } else {
                  k = choice - 1;
                }
              }
            }
            G.flags.initgend = k;
          }
        }
        if (nextpick === RS_ALGNMNT) {
          nextpick = G.flags.initrole < 0 ? RS_ROLE : G.flags.initrace < 0 ? RS_RACE : RS_GENDER;
          if (G.flags.initalign < 0 || !validalign(G.flags.initrole, G.flags.initrace, G.flags.initalign)) {
            if (pick4u === 121 || pick4u === 97 || G.flags.initalign === ROLE_RANDOM) {
              k = pick_align(G.flags.initrole, G.flags.initrace, G.flags.initgend, PICK_RANDOM);
              if (k < 0) {
                await tty_putstr(G.BASE_WINDOW, 0, S("Incompatible alignment!"));
                k = randalign(G.flags.initrole, G.flags.initrace);
              }
            } else {
              n = 0;
              k = 0;
              for (i = 0; i < ROLE_ALIGNS; ++i) {
                if (ok_align(G.flags.initrole, G.flags.initrace, G.flags.initgend, i)) {
                  ++n;
                  k = i;
                }
              }
              if (n === 0) {
                for (i = 0; i < ROLE_ALIGNS; ++i) {
                  if (validalign(G.flags.initrole, G.flags.initrace, i)) {
                    ++n;
                    k = i;
                  }
                }
              }
              if (n > 1) {
                await tty_clear_nhwindow(G.BASE_WINDOW);
                await role_selection_prolog(RS_ALGNMNT, G.BASE_WINDOW);
                win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
                await G.windowprocs.win_start_menu(win);
                any.$cp(G.zeroany);
                await setup_algnmenu(win, TRUE, G.flags.initrole, G.flags.initrace, G.flags.initgend);
                await role_menu_extra(ROLE_RANDOM, win, TRUE);
                any.a_int = 0;
                await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
                await role_menu_extra(RS_ROLE, win, FALSE);
                await role_menu_extra(RS_RACE, win, FALSE);
                await role_menu_extra(RS_GENDER, win, FALSE);
                if (gotrolefilter()) {
                  await role_menu_extra(RS_filter, win, FALSE);
                }
                await role_menu_extra(ROLE_NONE, win, FALSE);
                strcpy(P(pbuf), S("Pick an alignment or creed"));
                await G.windowprocs.win_end_menu(win, P(pbuf));
                n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
                if (n > 0) {
                  choice = selected[0].item.a_int;
                  if (n > 1 && choice === ROLE_RANDOM) {
                    choice = $sadd(selected[0], 1).item.a_int;
                  }
                } else {
                  choice = n === 0 ? ROLE_RANDOM : ROLE_NONE;
                }
                if (selected[0]) {
                  free(selected[0]), selected[0] = null;
                }
                await G.windowprocs.win_destroy_nhwindow(win);
                if (choice === ROLE_NONE) {
                  { $g = 1; continue $L; }
                } else if (choice === -2 - (3 + 1)) {
                  G.flags.initgend = k = ROLE_NONE;
                  nextpick = RS_GENDER;
                } else if (choice === -2 - (2 + 1)) {
                  G.flags.initrace = k = ROLE_NONE;
                  nextpick = RS_RACE;
                } else if (choice === -2 - (1 + 1)) {
                  G.flags.initrole = k = ROLE_NONE;
                  nextpick = RS_ROLE;
                } else if (choice === -2 - (5 + 1)) {
                  G.flags.initalign = k = ROLE_NONE;
                  if (await reset_role_filtering()) {
                    nextpick = RS_ROLE;
                  } else {
                    nextpick = RS_ALGNMNT;
                  }
                } else if (choice === ROLE_RANDOM) {
                  k = pick_align(G.flags.initrole, G.flags.initrace, G.flags.initgend, PICK_RANDOM);
                  if (k < 0) {
                    k = randalign(G.flags.initrole, G.flags.initrace);
                  }
                } else {
                  k = choice - 1;
                }
              }
            }
            G.flags.initalign = k;
          }
        }
      } while (G.flags.initrole < 0 || G.flags.initrace < 0 || G.flags.initgend < 0 || G.flags.initalign < 0);
      getconfirmation = (picksomething && pick4u !== 97 && !G.flags.randomall ? 1 : 0) << 24 >> 24;
      while (getconfirmation) {
        await tty_clear_nhwindow(G.BASE_WINDOW);
        await role_selection_prolog(ROLE_NONE, G.BASE_WINDOW);
        win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(win);
        any.$cp(G.zeroany);
        any.a_int = 0;
        if (!G.roles[G.flags.initrole].name.f && (G.roles[G.flags.initrole].allow & ROLE_GENDMASK) === (ROLE_MALE | ROLE_FEMALE)) {
          sprintf(P(plbuf), S(" %s"), G.genders[G.flags.initgend].adj);
        } else {
          $wr(P(plbuf), 0, 0);
        }
        sprintf(P(pbuf), S("%s, %s%s %s %s"), P(G.plname), G.aligns[G.flags.initalign].adj, P(plbuf), G.races[G.flags.initrace].adj, G.flags.initgend === 1 && G.roles[G.flags.initrole].name.f ? G.roles[G.flags.initrole].name.f : G.roles[G.flags.initrole].name.m);
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(pbuf), MENU_UNSELECTED);
        any.a_int = 0;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
        any.a_int = 1;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 121, 0, ATR_NONE, S("Yes; start game"), MENU_SELECTED);
        any.a_int = 2;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 110, 0, ATR_NONE, S("No; choose role again"), MENU_UNSELECTED);
        if (G.iflags.renameallowed) {
          any.a_int = 3;
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 97, 0, ATR_NONE, S("Not yet; choose another name"), MENU_UNSELECTED);
        }
        any.a_int = -1;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 113, 0, ATR_NONE, S("Quit"), MENU_UNSELECTED);
        sprintf(P(pbuf), S("Is this ok? [yn%sq]"), G.iflags.renameallowed ? S("a") : S(""));
        await G.windowprocs.win_end_menu(win, P(pbuf));
        n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
        choice = n > 0 ? $sadd(selected[0], (n - 1)).item.a_int : n === 0 ? 1 : -1;
        if (selected[0]) {
          free(selected[0]), selected[0] = null;
        }
        await G.windowprocs.win_destroy_nhwindow(win);
        switch (choice) {
        default:
          { $g = 1; continue $L; }
          break;
        case 3:
          {
            let saveROLE = 0;
            let saveRACE = 0;
            let saveGEND = 0;
            let saveALGN = 0;
            G.iflags.renameinprogress = TRUE;
            saveROLE = G.flags.initrole, saveRACE = G.flags.initrace, saveGEND = G.flags.initgend, saveALGN = G.flags.initalign;
            $wr(P(G.plname), 0, 0);
            await plnamesuffix();
            G.flags.initrole = saveROLE, G.flags.initrace = saveRACE, G.flags.initgend = saveGEND, G.flags.initalign = saveALGN;
            break;
          }
        case 2:
          pick4u = 110;
          G.flags.initrole = G.flags.initrace = G.flags.initgend = G.flags.initalign = ROLE_NONE;
          { $g = 2; continue $L; }
          break;
        case 1:
          getconfirmation = FALSE;
          break;
        }
      }
      await tty_display_nhwindow(G.BASE_WINDOW, FALSE);
      return;
    case 1: // give_up
      if (selected[0]) {
        free(selected[0]);
      }
      await bail(null);
      return;
    }
    break;
  }
}

async function reset_role_filtering(): Promise<number> {
  let win = 0;
  let any = new union_any();
  let i = 0;
  let n = 0;
  const selected = [null];
  selected[0] = null;
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  any.$cp(G.zeroany);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S("Unacceptable roles"), MENU_UNSELECTED);
  await setup_rolemenu(win, FALSE, ROLE_NONE, ROLE_NONE, ROLE_NONE);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S("Unacceptable races"), MENU_UNSELECTED);
  await setup_racemenu(win, FALSE, ROLE_NONE, ROLE_NONE, ROLE_NONE);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S("Unacceptable genders"), MENU_UNSELECTED);
  await setup_gendmenu(win, FALSE, ROLE_NONE, ROLE_NONE, ROLE_NONE);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S("Unacceptable alignments"), MENU_UNSELECTED);
  await setup_algnmenu(win, FALSE, ROLE_NONE, ROLE_NONE, ROLE_NONE);
  await G.windowprocs.win_end_menu(win, S("Pick all that apply"));
  n = await G.windowprocs.win_select_menu(win, PICK_ANY, P(selected, 0));
  if (n > 0) {
    clearrolefilter();
    for (i = 0; i < n; ++i) {
      setrolefilter($sadd(selected[0], i).item.a_string);
    }
    G.flags.initrole = G.flags.initrace = G.flags.initgend = G.flags.initalign = ROLE_NONE;
  }
  if (selected[0]) {
    free(selected[0]), selected[0] = null;
  }
  await G.windowprocs.win_destroy_nhwindow(win);
  return (n > 0 ? TRUE : FALSE) << 24 >> 24;
}

async function setup_rolemenu(win: number, filtering: number, race: number, gend: number, algn: number): Promise<void> {
  let any = new union_any();
  let i = 0;
  let role_ok = 0;
  let thisch = 0;
  let lastch = 0;
  let rolenamebuf = new Int8Array(50);
  any.$cp(G.zeroany);
  for (i = 0; G.roles[i].name.m; ++i) {
    role_ok = ok_role(i, race, gend, algn);
    if (filtering && !role_ok) {
      continue;
    }
    if (filtering) {
      any.a_int = i + 1;
    } else {
      any.a_string = G.roles[i].name.m;
    }
    thisch = lowc($rd(G.roles[i].name.m));
    if (thisch === lastch) {
      thisch = highc(thisch);
    }
    strcpy(P(rolenamebuf), G.roles[i].name.m);
    if (G.roles[i].name.f) {
      if (gend === 1) {
        strcpy(P(rolenamebuf), G.roles[i].name.f);
      } else if (gend < 0) {
        strcat(P(rolenamebuf), S("/"));
        strcat(P(rolenamebuf), G.roles[i].name.f);
      }
    }
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, thisch, 0, ATR_NONE, await an(P(rolenamebuf)), !filtering && !role_ok ? MENU_SELECTED : MENU_UNSELECTED);
    lastch = thisch;
  }
}

async function setup_racemenu(win: number, filtering: number, role: number, gend: number, algn: number): Promise<void> {
  let any = new union_any();
  let race_ok = 0;
  let i = 0;
  let this_ch = 0;
  any.$cp(G.zeroany);
  for (i = 0; G.races[i].noun; ++i) {
    race_ok = ok_race(role, i, gend, algn);
    if (filtering && !race_ok) {
      continue;
    }
    if (filtering) {
      any.a_int = i + 1;
    } else {
      any.a_string = G.races[i].noun;
    }
    this_ch = $rd(G.races[i].noun);
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, filtering ? this_ch : highc(this_ch), filtering ? highc(this_ch) : 0, ATR_NONE, G.races[i].noun, !filtering && !race_ok ? MENU_SELECTED : MENU_UNSELECTED);
  }
}

async function setup_gendmenu(win: number, filtering: number, role: number, race: number, algn: number): Promise<void> {
  let any = new union_any();
  let gend_ok = 0;
  let i = 0;
  let this_ch = 0;
  any.$cp(G.zeroany);
  for (i = 0; i < ROLE_GENDERS; ++i) {
    gend_ok = ok_gend(role, race, i, algn);
    if (filtering && !gend_ok) {
      continue;
    }
    if (filtering) {
      any.a_int = i + 1;
    } else {
      any.a_string = G.genders[i].adj;
    }
    this_ch = $rd(G.genders[i].adj);
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, filtering ? this_ch : highc(this_ch), filtering ? highc(this_ch) : 0, ATR_NONE, G.genders[i].adj, !filtering && !gend_ok ? MENU_SELECTED : MENU_UNSELECTED);
  }
}

async function setup_algnmenu(win: number, filtering: number, role: number, race: number, gend: number): Promise<void> {
  let any = new union_any();
  let algn_ok = 0;
  let i = 0;
  let this_ch = 0;
  any.$cp(G.zeroany);
  for (i = 0; i < ROLE_ALIGNS; ++i) {
    algn_ok = ok_align(role, race, gend, i);
    if (filtering && !algn_ok) {
      continue;
    }
    if (filtering) {
      any.a_int = i + 1;
    } else {
      any.a_string = G.aligns[i].adj;
    }
    this_ch = $rd(G.aligns[i].adj);
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, filtering ? this_ch : highc(this_ch), filtering ? highc(this_ch) : 0, ATR_NONE, G.aligns[i].adj, !filtering && !algn_ok ? MENU_SELECTED : MENU_UNSELECTED);
  }
}

export async function tty_askname(): Promise<void> {
  let c = 0;
  let ct = 0;
  let tryct = 0;
  await tty_putstr(G.BASE_WINDOW, 0, S(""));
  do {
    if (++tryct > 1) {
      if (tryct > 10) {
        await bail(S("Giving up after 10 tries.\n"));
      }
      await tty_curs(G.BASE_WINDOW, 1, G.wins[G.BASE_WINDOW].cury - 1 | 0);
      await tty_putstr(G.BASE_WINDOW, 0, S("Enter a name for your character..."));
      await tty_curs(G.BASE_WINDOW, 1, G.wins[G.BASE_WINDOW].cury | 0), await cl_end();
    }
    await tty_putstr(G.BASE_WINDOW, 0, P(tty_askname$who_are_you));
    await tty_curs(G.BASE_WINDOW, 14, G.wins[G.BASE_WINDOW].cury - 1 | 0);
    ct = 0;
    while ((c = await tty_nhgetch()) !== 10) {
      if (c === EOF) {
        c = 27;
      }
      if (c === 13) {
        break;
      }
      if (c === 27) {
        ct = 0;
        break;
      }
      if (c === 8 || c === 127) {
        if (ct) {
          --ct;
          putchar(8);
          putchar(32);
          putchar(8);
        }
        continue;
      }
      if (c !== 45 && c !== 64) {
        if (!(c >= 97 && c <= 122) && !(c >= 65 && c <= 90) && !(c >= 48 && c <= 57 && ct > 0)) {
          c = 95;
        }
      }
      if (ct < 32 - 1) {
        putchar(c);
        G.plname[ct++] = c << 24 >> 24;
      }
    }
    G.plname[ct] = 0;
  } while (ct === 0);
  await tty_curs(G.BASE_WINDOW, 1, G.wins[G.BASE_WINDOW].cury + 1 | 0);
  G.iflags.renameallowed = TRUE;
}

export function tty_get_nh_event(): void {
  return;
}

async function getret(): Promise<void> {
  ;
  xputs(S("\n"));
  if (G.flags.standout) {
    standoutbeg();
  }
  xputs(S("Hit "));
  xputs(G.iflags.cbreak ? S("space") : S("return"));
  xputs(S(" to continue: "));
  if (G.flags.standout) {
    standoutend();
  }
  await xwaitforspace(S(" "));
}

export async function tty_suspend_nhwindows(str: Ptr | null): Promise<void> {
  await settty(str);
  if (!str) {
    tty_raw_print(S(""));
  }
}

export async function tty_resume_nhwindows(): Promise<void> {
  gettty();
  setftty();
  await docrt();
}

export async function tty_exit_nhwindows(str: Ptr | null): Promise<void> {
  let i = 0;
  await tty_suspend_nhwindows(str);
  await free_pickinv_cache();
  for (i = 0; i < MAXWIN; ++i) {
    if (i === G.BASE_WINDOW) {
      continue;
    }
    if (G.wins[i]) {
      free_window_info(G.wins[i], TRUE);
      free(G.wins[i]);
      G.wins[i] = null;
    }
  }
  G.WIN_MAP = G.WIN_MESSAGE = G.WIN_INVEN = WIN_ERR;
  G.WIN_STATUS = WIN_ERR;
  if (G.BASE_WINDOW !== WIN_ERR && G.wins[G.BASE_WINDOW]) {
    free_window_info(G.wins[G.BASE_WINDOW], TRUE);
    free(G.wins[G.BASE_WINDOW]);
    G.wins[G.BASE_WINDOW] = null;
    G.BASE_WINDOW = WIN_ERR;
  }
  free(G.ttyDisplay);
  G.ttyDisplay = null;
  tty_shutdown();
  G.iflags.window_inited = 0;
}

export async function tty_create_nhwindow(type: number): Promise<number> {
  let newwin = null;
  let i = 0;
  let rowoffset = 0;
  let newid = 0;
  for (newid = 0; newid < MAXWIN; ++newid) {
    if (!G.wins[newid]) {
      break;
    }
  }
  if (newid === MAXWIN) {
    await panic(S("No window slots!"));
    return WIN_ERR;
  }
  newwin = new struct_WinDesc();
  G.wins[newid] = newwin;
  newwin.type = type << 24 >> 24;
  newwin.flags = 0;
  newwin.active = FALSE;
  newwin.curx = newwin.cury = 0;
  newwin.morestr = null;
  newwin.mlist = null;
  newwin.plist = null;
  newwin.npages = newwin.plist_size = newwin.nitems = newwin.how = 0;
  switch (type) {
  case 6:
    newwin.offx = newwin.offy = 0;
    newwin.rows = G.ttyDisplay.rows;
    newwin.cols = G.ttyDisplay.cols;
    newwin.maxrow = newwin.maxcol = 0;
    break;
  case 1:
    newwin.offx = newwin.offy = 0;
    if (G.iflags.msg_history < 20) {
      G.iflags.msg_history = 20;
    } else if (G.iflags.msg_history > 60) {
      G.iflags.msg_history = 60;
    }
    newwin.maxrow = newwin.rows = G.iflags.msg_history;
    newwin.maxcol = newwin.cols = 0;
    break;
  case 2:
    if (G.iflags.wc2_statuslines < 2 || G.iflags.wc2_statuslines > 3) {
      G.iflags.wc2_statuslines = 2;
    }
    newwin.offx = 0;
    rowoffset = G.ttyDisplay.rows - G.iflags.wc2_statuslines;
    newwin.offy = (rowoffset < 21 + 1 ? rowoffset : 21 + 1) << 16 >> 16;
    newwin.rows = newwin.maxrow = G.iflags.wc2_statuslines;
    newwin.cols = newwin.maxcol = G.ttyDisplay.cols;
    break;
  case 3:
    newwin.offx = 0;
    newwin.offy = 1;
    newwin.rows = ROWNO;
    newwin.cols = COLNO;
    newwin.maxrow = 0;
    newwin.maxcol = 0;
    break;
  case 4:
  case 5:
    newwin.offx = newwin.offy = 0;
    newwin.rows = 0;
    newwin.cols = G.ttyDisplay.cols;
    newwin.maxrow = newwin.maxcol = 0;
    break;
  default:
    await panic(S("Tried to create window type %d\n"), type);
    return WIN_ERR;
  }
  if (newwin.maxrow) {
    newwin.data = P(new Array(($u64(newwin.maxrow) * 8 >>> 0) / 8).fill(null));
    newwin.datlen = P(new Int16Array(($u64(newwin.maxrow) * 2 >>> 0) / 2));
    for (i = 0; i < newwin.maxrow; ++i) {
      if (newwin.maxcol) {
        newwin.data.a[newwin.data.o + i] = P(new Int8Array((newwin.maxcol >>> 0)));
        newwin.datlen.a[newwin.datlen.o + i] = newwin.maxcol << 16 >> 16;
      } else {
        newwin.data.a[newwin.data.o + i] = null;
        newwin.datlen.a[newwin.datlen.o + i] = 0;
      }
    }
    if (newwin.type === NHW_MESSAGE) {
      newwin.maxrow = 0;
    }
  } else {
    newwin.data = null;
    newwin.datlen = null;
  }
  return newid;
}

async function erase_menu_or_text(window_: number, cw: struct_WinDesc | null, clear: number): Promise<void> {
  if (cw.offx === 0) {
    if (cw.offy) {
      await tty_curs(window_, 1, 0);
      await cl_eos();
    } else if (clear) {
      await clear_screen();
    } else {
      await docrt();
    }
  } else {
    await docorner(cw.offx, cw.maxrow + 1 | 0);
  }
}

function free_window_info(cw: struct_WinDesc | null, free_data: number): void {
  let i = 0;
  if (cw.data) {
    if (cw === G.wins[G.WIN_MESSAGE] && cw.rows > cw.maxrow) {
      cw.maxrow = cw.rows;
    }
    for (i = 0; i < cw.maxrow; ++i) {
      if (cw.data.a[cw.data.o + i]) {
        free(cw.data.a[cw.data.o + i]);
        cw.data.a[cw.data.o + i] = null;
        if (cw.datlen) {
          cw.datlen.a[cw.datlen.o + i] = 0;
        }
      }
    }
    if (free_data) {
      free(cw.data);
      cw.data = null;
      if (cw.datlen) {
        free(cw.datlen);
      }
      cw.datlen = null;
      cw.rows = 0;
    }
  }
  cw.maxrow = cw.maxcol = 0;
  if (cw.mlist) {
    let temp = null;
    while (!!(temp = cw.mlist)) {
      cw.mlist = temp.next;
      if (temp.str) {
        free(temp.str);
      }
      free(temp);
    }
  }
  if (cw.plist) {
    free(cw.plist);
    cw.plist = null;
  }
  cw.plist_size = cw.npages = cw.nitems = cw.how = 0;
  if (cw.morestr) {
    free(cw.morestr);
    cw.morestr = null;
  }
}

export async function tty_clear_nhwindow(window_: number): Promise<void> {
  let i = 0;
  let j = 0;
  let m = 0;
  let n = 0;
  let cw = null;
  ;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    await panic(P(winpanicstr), window_);
  }
  G.ttyDisplay.lastwin = window_;
  ;
  ;
  switch (cw.type) {
  case 1:
    if (G.ttyDisplay.toplin) {
      await home();
      await cl_end();
      if (cw.cury) {
        await docorner(1, cw.cury + 1 | 0);
      }
      G.ttyDisplay.toplin = 0;
    }
    break;
  case 2:
    m = cw.maxrow | 0;
    n = cw.cols | 0;
    for (i = 0; i < m; ++i) {
      await tty_curs(window_, 1, i);
      await cl_end();
      for (j = 0; j < n - 1; ++j) {
        $wr(cw.data.a[cw.data.o + i], j, 32);
      }
      $wr(cw.data.a[cw.data.o + i], (n - 1), 0);
    }
    G.context.botlx = 1;
    break;
  case 3:
    G.context.botlx = 1;
  case 6:
    await clear_screen();
    break;
  case 4:
  case 5:
    if (cw.active) {
      await erase_menu_or_text(window_, cw, TRUE);
    }
    free_window_info(cw, FALSE);
    break;
  }
  cw.curx = cw.cury = 0;
}

export async function toggle_menu_curr(window_: number, curr: struct_tty_mi | null, lineno: number, in_view: number, counting: number, count: number): Promise<number> {
  if (curr.selected) {
    if (counting && count > 0) {
      curr.count = count;
      if (in_view) {
        await set_item_state(window_, lineno, curr);
      }
      return TRUE;
    } else {
      curr.selected = FALSE;
      curr.count = -1;
      if (in_view) {
        await set_item_state(window_, lineno, curr);
      }
      return TRUE;
    }
  } else {
    if (counting && count > 0) {
      curr.count = count;
      curr.selected = TRUE;
      if (in_view) {
        await set_item_state(window_, lineno, curr);
      }
      return TRUE;
    } else if (!counting) {
      curr.selected = TRUE;
      if (in_view) {
        await set_item_state(window_, lineno, curr);
      }
      return TRUE;
    }
  }
  return FALSE;
}

async function dmore(cw: struct_WinDesc | null, s: Ptr | null): Promise<void> {
  let prompt = cw.morestr ? cw.morestr : P(G.defmorestr);
  let offset = cw.type === NHW_TEXT ? 1 : 2;
  ;
  await tty_curs(G.BASE_WINDOW, G.ttyDisplay.curx + offset, G.ttyDisplay.cury);
  if (G.flags.standout) {
    standoutbeg();
  }
  xputs(prompt);
  G.ttyDisplay.curx = $u64(G.ttyDisplay.curx) + strlen(prompt) << 16 >> 16;
  if (G.flags.standout) {
    standoutend();
  }
  await xwaitforspace(s);
}

async function set_item_state(window_: number, lineno: number, item: struct_tty_mi | null): Promise<void> {
  let ch = (item.selected ? item.count === -1 ? 43 : 35 : 45) << 24 >> 24;
  ;
  await tty_curs(window_, 4, lineno);
  term_start_attr(item.attr);
  putchar(ch);
  G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
  term_end_attr(item.attr);
}

async function set_all_on_page(window_: number, page_start: struct_tty_mi | null, page_end: struct_tty_mi | null): Promise<void> {
  let curr = null;
  let n = 0;
  for (n = 0, curr = page_start; curr !== page_end; ++n, curr = curr.next) {
    if (curr.identifier.a_void && !curr.selected) {
      curr.selected = TRUE;
      await set_item_state(window_, n, curr);
    }
  }
}

async function unset_all_on_page(window_: number, page_start: struct_tty_mi | null, page_end: struct_tty_mi | null): Promise<void> {
  let curr = null;
  let n = 0;
  for (n = 0, curr = page_start; curr !== page_end; ++n, curr = curr.next) {
    if (curr.identifier.a_void && curr.selected) {
      curr.selected = FALSE;
      curr.count = -1;
      await set_item_state(window_, n, curr);
    }
  }
}

async function invert_all_on_page(window_: number, page_start: struct_tty_mi | null, page_end: struct_tty_mi | null, acc: number): Promise<void> {
  let curr = null;
  let n = 0;
  for (n = 0, curr = page_start; curr !== page_end; ++n, curr = curr.next) {
    if (curr.identifier.a_void && (acc === 0 || curr.gselector === acc)) {
      if (curr.selected) {
        curr.selected = FALSE;
        curr.count = -1;
      } else {
        curr.selected = TRUE;
      }
      await set_item_state(window_, n, curr);
    }
  }
}

async function invert_all(window_: number, page_start: struct_tty_mi | null, page_end: struct_tty_mi | null, acc: number): Promise<void> {
  let curr = null;
  let on_curr_page = 0;
  let cw = G.wins[window_];
  await invert_all_on_page(window_, page_start, page_end, acc);
  for (on_curr_page = FALSE, curr = cw.mlist; curr; curr = curr.next) {
    if (curr === page_start) {
      on_curr_page = TRUE;
    } else if (curr === page_end) {
      on_curr_page = FALSE;
    }
    if (!on_curr_page && curr.identifier.a_void && (acc === 0 || curr.gselector === acc)) {
      if (curr.selected) {
        curr.selected = FALSE;
        curr.count = -1;
      } else {
        curr.selected = TRUE;
      }
    }
  }
}

function toggle_menu_attr(on: number, color: number, attr: number): void {
  if (on) {
    term_start_attr(attr);
    if (color !== NO_COLOR) {
      term_start_color(color);
    }
  } else {
    if (color !== NO_COLOR) {
      term_end_color();
    }
    term_end_attr(attr);
  }
}

async function process_menu_window(window_: number, cw: struct_WinDesc | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let $g = 0;
  let page_start = null;
  let page_end = null;
  let curr = null;
  let count = 0;
  let n = 0;
  let attr_n = 0;
  let curr_page = 0;
  let page_lines = 0;
  let resp_len = 0;
  let finished = 0;
  let counting = 0;
  let reset_count = 0;
  let cp = null;
  let rp = null;
  let resp = new Int8Array(128);
  let gacc = new Int8Array(128);
  let msave = null;
  let morestr = null;
  let really_morc = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      resp = new Int8Array(128);
      gacc = new Int8Array(128);
      curr_page = page_lines = 0;
      page_start = page_end = null;
      msave = cw.morestr;
      cw.morestr = morestr = P(new Int8Array(QBUFSZ));
      counting = FALSE;
      count = 0;
      reset_count = TRUE;
      finished = FALSE;
      gacc[0] = 0;
      if (cw.how !== PICK_NONE) {
        let i = 0;
        let gcnt = new Int32Array(128);
        for (i = 0; i < (Math.trunc(512 / 4) | 0); ++i) {
          gcnt[i] = 0;
        }
        for (n = 0, curr = cw.mlist; curr; curr = curr.next) {
          if (curr.gselector && curr.gselector !== curr.selector) {
            ++n;
            ($t1 = gcnt, $t2 = curr.gselector & 127, $t1[$t2] = $t1[$t2] + 1);
          }
        }
        if (n > 0) {
          for (rp = P(gacc), curr = cw.mlist; curr; curr = curr.next) {
            if (curr.gselector && curr.gselector !== curr.selector && !strchr(P(gacc), curr.gselector) && (cw.how === PICK_ANY || gcnt[curr.gselector & 127] === 1)) {
              $wr(($t3 = rp, rp = $t3.add(1), $t3), 0, curr.gselector);
              rp.a[rp.o] = 0;
            }
          }
        }
      }
      resp_len = 0;
    case 2:
      if (!!finished) { $g = 3; continue $L; }
      ;
      if (reset_count) {
        counting = FALSE;
        count = 0;
      } else {
        reset_count = TRUE;
      }
      if (!page_start) {
        if (curr_page < 0 || cw.npages > 0 && curr_page >= cw.npages) {
          await panic(S("bad menu screen page #%d"), curr_page);
        }
        if (!cw.offx) {
          if (cw.offy) {
            await tty_curs(window_, 1, 0);
            await cl_eos();
          } else {
            await clear_screen();
          }
        }
        rp = P(resp);
        if (cw.npages > 0) {
          page_start = cw.plist.a[cw.plist.o + curr_page];
          page_end = cw.plist.a[cw.plist.o + (curr_page + 1)];
          for (page_lines = 0, curr = page_start; curr !== page_end; ++page_lines, curr = curr.next) {
            const attr = new Int32Array(1);
            const color = new Int32Array(1);
            color[0] = NO_COLOR;
            if (curr.selector) {
              $wr(($t4 = rp, rp = $t4.add(1), $t4), 0, curr.selector);
            }
            await tty_curs(window_, 1, page_lines);
            if (cw.offx) {
              await cl_end();
            }
            putchar(32);
            G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
            if (!G.iflags.use_menu_color || !get_menu_coloring(curr.str, P(color, 0), P(attr, 0))) {
              attr[0] = curr.attr;
            }
            attr_n = 0;
            if (curr.str.a[curr.str.o] && curr.str.a[curr.str.o + 1] === 32 && curr.str.a[curr.str.o + 2] && strchr(S("-+#"), curr.str.a[curr.str.o + 2]) && curr.str.a[curr.str.o + 3] === 32) {
              attr_n = 4;
            }
            for (n = 0, cp = curr.str; cp.a[cp.o] && (G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16) < G.ttyDisplay.cols; cp = cp.add(1), ++n) {
              if (n === attr_n && (color[0] !== NO_COLOR || attr[0] !== ATR_NONE)) {
                toggle_menu_attr(TRUE, color[0], attr[0]);
              }
              if (n === 2 && !!curr.identifier.a_void && curr.selected) {
                if (curr.count === -1) {
                  putchar(43);
                } else {
                  putchar(35);
                }
              } else {
                putchar(cp.a[cp.o]);
              }
            }
            if (n > attr_n && (color[0] !== NO_COLOR || attr[0] !== ATR_NONE)) {
              toggle_menu_attr(FALSE, color[0], attr[0]);
            }
          }
        } else {
          page_start = null;
          page_end = null;
          page_lines = 0;
        }
        rp.a[rp.o] = 0;
        resp_len = strlen(P(resp)) | 0;
        if (cw.offx) {
          for (n = page_lines + 1; n < cw.maxrow; ++n) {
            await tty_curs(window_, 1, n);
            await cl_end();
          }
        }
        strcat(P(resp), P(default_menu_cmds));
        strcat(P(resp), S(" "));
        strcat(P(resp), S("0123456789\x1b\n\r"));
        strcat(P(resp), P(gacc));
        strcat(P(resp), P(G.mapped_menu_cmds));
        if (cw.npages > 1) {
          sprintf(cw.morestr, S("(%d of %d)"), curr_page + 1, cw.npages | 0);
        } else if (msave) {
          strcpy(cw.morestr, msave);
        } else {
          strcpy(cw.morestr, P(G.defmorestr));
        }
        await tty_curs(window_, 1, page_lines);
        await cl_end();
        await dmore(cw, P(resp));
      } else {
        await tty_curs(window_, (strlen(cw.morestr) | 0) + 2, page_lines);
        await xwaitforspace(P(resp));
      }
      really_morc = G.morc;
      if (!!(rp = strchr(P(resp), G.morc)) && rp.o < P(resp).add(resp_len).o) {
        G.morc = MENU_EXPLICIT_CHOICE;
      } else {
        G.morc = map_menu_cmd(G.morc);
      }
      switch (G.morc) {
      case 48: { $g = 5; continue $L; }
      case 49: { $g = 6; continue $L; }
      case 50: { $g = 7; continue $L; }
      case 51: { $g = 8; continue $L; }
      case 52: { $g = 9; continue $L; }
      case 53: { $g = 10; continue $L; }
      case 54: { $g = 11; continue $L; }
      case 55: { $g = 12; continue $L; }
      case 56: { $g = 13; continue $L; }
      case 57: { $g = 14; continue $L; }
      case 27: { $g = 15; continue $L; }
      case 0: { $g = 16; continue $L; }
      case 10: { $g = 17; continue $L; }
      case 13: { $g = 18; continue $L; }
      case 32: { $g = 19; continue $L; }
      case 62: { $g = 20; continue $L; }
      case 60: { $g = 21; continue $L; }
      case 94: { $g = 22; continue $L; }
      case 124: { $g = 23; continue $L; }
      case 44: { $g = 24; continue $L; }
      case 92: { $g = 25; continue $L; }
      case 126: { $g = 26; continue $L; }
      case 46: { $g = 27; continue $L; }
      case 45: { $g = 28; continue $L; }
      case 64: { $g = 29; continue $L; }
      case 58: { $g = 30; continue $L; }
      case 127: { $g = 31; continue $L; }
      default: { $g = 32; continue $L; }
      }
    case 5:
      if (!counting && strchr(P(gacc), G.morc)) {
        { $g = 1; continue $L; }
      }
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
      count = count * 10 + (G.morc - 48);
      if (count !== 0) {
        counting = TRUE;
        reset_count = FALSE;
      }
      { $g = 4; continue $L; };
    case 15:
      if (!counting) {
        for (curr = cw.mlist; curr; curr = curr.next) {
          curr.selected = FALSE;
          curr.count = -1;
        }
        cw.flags |= WIN_CANCELLED;
        finished = TRUE;
      }
      { $g = 4; continue $L; };
    case 16:
    case 17:
    case 18:
      if (cw.how !== PICK_NONE) {
        finished = TRUE;
        { $g = 4; continue $L; };
      }
    case 19:
    case 20:
      if (cw.npages > 0 && curr_page !== cw.npages - 1) {
        ++curr_page;
        page_start = null;
      } else if (G.morc === 32) {
        finished = TRUE;
      }
      { $g = 4; continue $L; };
    case 21:
      if (cw.npages > 0 && curr_page !== 0) {
        --curr_page;
        page_start = null;
      }
      { $g = 4; continue $L; };
    case 22:
      if (cw.npages > 0 && curr_page !== 0) {
        page_start = null;
        curr_page = 0;
      }
      { $g = 4; continue $L; };
    case 23:
      if (cw.npages > 0 && curr_page !== cw.npages - 1) {
        page_start = null;
        curr_page = cw.npages - 1 | 0;
      }
      { $g = 4; continue $L; };
    case 24:
      if (cw.how === PICK_ANY) {
        await set_all_on_page(window_, page_start, page_end);
      }
      { $g = 4; continue $L; };
    case 25:
      await unset_all_on_page(window_, page_start, page_end);
      { $g = 4; continue $L; };
    case 26:
      if (cw.how === PICK_ANY) {
        await invert_all_on_page(window_, page_start, page_end, 0);
      }
      { $g = 4; continue $L; };
    case 27:
      if (cw.how === PICK_ANY) {
        await set_all_on_page(window_, page_start, page_end);
        for (curr = cw.mlist; curr; curr = curr.next) {
          if (curr.identifier.a_void && !curr.selected) {
            curr.selected = TRUE;
          }
        }
      }
      { $g = 4; continue $L; };
    case 28:
      await unset_all_on_page(window_, page_start, page_end);
      for (curr = cw.mlist; curr; curr = curr.next) {
        if (curr.identifier.a_void && curr.selected) {
          curr.selected = FALSE;
          curr.count = -1;
        }
      }
      { $g = 4; continue $L; };
    case 29:
      if (cw.how === PICK_ANY) {
        await invert_all(window_, page_start, page_end, 0);
      }
      { $g = 4; continue $L; };
    case 30:
      if (cw.how === PICK_NONE) {
        tty_nhbell();
        { $g = 4; continue $L; };
      } else {
        let searchbuf = new Int8Array(258);
        let tmpbuf = new Int8Array(256);
        let on_curr_page = FALSE;
        let lineno = 0;
        await tty_getlin(S("Search for:"), P(tmpbuf));
        if (!tmpbuf[0] || tmpbuf[0] === 27) {
          { $g = 4; continue $L; };
        }
        sprintf(P(searchbuf), S("*%s*"), P(tmpbuf));
        for (curr = cw.mlist; curr; curr = curr.next) {
          if (on_curr_page) {
            ++lineno;
          }
          if (curr === page_start) {
            on_curr_page = TRUE;
          } else if (curr === page_end) {
            on_curr_page = FALSE;
          }
          if (curr.identifier.a_void && pmatchi(P(searchbuf), curr.str)) {
            await toggle_menu_curr(window_, curr, lineno, on_curr_page, counting, count);
            if (cw.how === PICK_ONE) {
              finished = TRUE;
              break;
            }
          }
        }
      }
      { $g = 4; continue $L; };
    case 31:
      G.morc = really_morc;
    case 32:
      if (!(cw.how === PICK_NONE || !strchr(P(resp), G.morc))) { $g = 34; continue $L; }
      {
        tty_nhbell();
        { $g = 4; continue $L; };
      }
      { $g = 33; continue $L; }
    case 34:
      if (!strchr(P(gacc), G.morc)) { $g = 35; continue $L; }
    case 1: // group_accel
      await invert_all(window_, page_start, page_end, G.morc);
      if (cw.how === PICK_ONE) {
        finished = TRUE;
      }
      { $g = 4; continue $L; };
    case 35:
    case 33:
      for (n = 0, curr = page_start; curr !== page_end; ++n, curr = curr.next) {
        if (G.morc === curr.selector) {
          await toggle_menu_curr(window_, curr, n, TRUE, counting, count);
          if (cw.how === PICK_ONE) {
            finished = TRUE;
          }
          break;
        }
      }
      { $g = 4; continue $L; };
    case 4:
      { $g = 2; continue $L; }
    case 3:
      cw.morestr = msave;
      free(morestr);
    }
    break;
  }
}

async function process_text_window(window_: number, cw: struct_WinDesc | null): Promise<void> {
  let i = 0;
  let n = 0;
  let attr = 0;
  let linestart = 0;
  let cp = null;
  for (n = 0, i = 0; i < cw.maxrow; ++i) {
    ;
    if (!cw.offx && n + cw.offy === G.ttyDisplay.rows - 1) {
      await tty_curs(window_, 1, n);
      await cl_end();
      await dmore(cw, P(G.quitchars));
      if (G.morc === 27) {
        cw.flags |= WIN_CANCELLED;
        break;
      }
      if (cw.offy) {
        await tty_curs(window_, 1, 0);
        await cl_eos();
      } else {
        await clear_screen();
      }
      n = 0;
    }
    await tty_curs(window_, 1, n++);
    await cl_end();
    if (cw.data.a[cw.data.o + i]) {
      attr = $rd(cw.data.a[cw.data.o + i]) - 1;
      if (cw.offx) {
        putchar(32);
        G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
      }
      term_start_attr(attr);
      for (cp = cw.data.a[cw.data.o + i].add(1), linestart = TRUE; cp.a[cp.o] && (G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16) < G.ttyDisplay.cols; cp = cp.add(1)) {
        if (linestart && (cp.a[cp.o] & 128) !== 0) {
          g_putch(cp.a[cp.o]);
          end_glyphout();
          linestart = FALSE;
        } else {
          putchar(cp.a[cp.o]);
        }
      }
      term_end_attr(attr);
    }
  }
  if (i === cw.maxrow) {
    if (cw.type === NHW_TEXT) {
      await tty_curs(G.BASE_WINDOW, 1, G.ttyDisplay.cury + 1);
      await cl_eos();
    }
    await tty_curs(G.BASE_WINDOW, cw.offx + 1, cw.type === NHW_TEXT ? G.ttyDisplay.rows - 1 : n);
    await cl_end();
    await dmore(cw, P(G.quitchars));
    if (G.morc === 27) {
      cw.flags |= WIN_CANCELLED;
    }
  }
}

export async function tty_display_nhwindow(window_: number, blocking: number): Promise<void> {
  let cw = null;
  let s_maxcol = 0;
  ;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    await panic(P(winpanicstr), window_);
  }
  if (cw.flags & WIN_CANCELLED) {
    return;
  }
  G.ttyDisplay.lastwin = window_;
  G.ttyDisplay.rawprint = 0;
  ;
  ;
  switch (cw.type) {
  case 1:
    if (G.ttyDisplay.toplin === 1) {
      await more();
      G.ttyDisplay.toplin = 1;
      await tty_clear_nhwindow(window_);
    } else {
      G.ttyDisplay.toplin = 0;
    }
    cw.curx = cw.cury = 0;
    if (!cw.active) {
      G.iflags.window_inited = TRUE;
    }
    break;
  case 3:
    end_glyphout();
    if (blocking) {
      if (!G.ttyDisplay.toplin) {
        G.ttyDisplay.toplin = 1;
      }
      await tty_display_nhwindow(G.WIN_MESSAGE, TRUE);
      return;
    }
  case 6:
    fflush(R.stdout);
    break;
  case 5:
    cw.maxcol = G.ttyDisplay.cols;
  case 4:
    cw.active = 1;
    s_maxcol = cw.maxcol << 16 >> 16;
    cw.offx = (cw.type === NHW_TEXT ? 0 : (82 < (G.ttyDisplay.cols / 2 | 0) ? 82 : G.ttyDisplay.cols / 2 | 0) < G.ttyDisplay.cols - s_maxcol - 1 ? 82 < (G.ttyDisplay.cols / 2 | 0) ? 82 : G.ttyDisplay.cols / 2 | 0 : G.ttyDisplay.cols - s_maxcol - 1) << 16 >> 16;
    if (cw.offx < 0) {
      cw.offx = 0;
    }
    if (cw.type === NHW_MENU) {
      cw.offy = 0;
    }
    if (G.ttyDisplay.toplin === 1) {
      await tty_display_nhwindow(G.WIN_MESSAGE, TRUE);
    }
    if (cw.maxrow >= G.ttyDisplay.rows || !G.iflags.menu_overlay) {
      cw.offx = 0;
      if (cw.offy || G.iflags.menu_overlay) {
        await tty_curs(window_, 1, 0);
        await cl_eos();
      } else {
        await clear_screen();
      }
      G.ttyDisplay.toplin = 0;
    } else {
      if (G.WIN_MESSAGE !== WIN_ERR) {
        await tty_clear_nhwindow(G.WIN_MESSAGE);
      }
    }
    if (cw.data || !cw.maxrow) {
      await process_text_window(window_, cw);
    } else {
      await process_menu_window(window_, cw);
    }
    break;
  }
  cw.active = 1;
}

export async function tty_dismiss_nhwindow(window_: number): Promise<void> {
  let cw = null;
  ;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    await panic(P(winpanicstr), window_);
  }
  ;
  ;
  switch (cw.type) {
  case 1:
    if (G.ttyDisplay.toplin) {
      await tty_display_nhwindow(G.WIN_MESSAGE, TRUE);
    }
  case 2:
  case 6:
  case 3:
    await tty_curs(G.BASE_WINDOW, 1, G.ttyDisplay.rows - 1);
    cw.active = 0;
    break;
  case 4:
  case 5:
    if (cw.active) {
      if (G.iflags.window_inited) {
        await erase_menu_or_text(window_, cw, FALSE);
      }
      cw.active = 0;
    }
    break;
  }
  cw.flags = 0;
}

export async function tty_destroy_nhwindow(window_: number): Promise<void> {
  let cw = null;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    await panic(P(winpanicstr), window_);
  }
  if (cw.active) {
    await tty_dismiss_nhwindow(window_);
  }
  if (cw.type === NHW_MESSAGE) {
    G.iflags.window_inited = 0;
  }
  if (cw.type === NHW_MAP) {
    await clear_screen();
  }
  free_window_info(cw, TRUE);
  free(cw);
  G.wins[window_] = null;
}

export async function tty_curs(window_: number, x: number, y: number): Promise<void> {
  let cw = null;
  let cx = G.ttyDisplay.curx;
  let cy = G.ttyDisplay.cury;
  ;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    await panic(P(winpanicstr), window_);
  }
  G.ttyDisplay.lastwin = window_;
  ;
  ;
  cw.curx = --x;
  cw.cury = y;
  if (x < 0 || y < 0 || y >= cw.rows || x > cw.cols) {
    let s = S("[unknown type]");
    switch (cw.type) {
    case 1:
      s = S("[topl window]");
      break;
    case 2:
      s = S("[status window]");
      break;
    case 3:
      s = S("[map window]");
      break;
    case 4:
      s = S("[corner window]");
      break;
    case 5:
      s = S("[text window]");
      break;
    case 6:
      s = S("[base window]");
      break;
    }
    do {
      if (await debugcore(S("../win/tty/wintty.c"), 1)) {
        await pline(S("bad curs positioning win %d %s (%d,%d)"), window_, s, x, y);
      }
    } while (0);
  }
  x += cw.offx;
  y += cw.offy;
  if (clipping && window_ === G.WIN_MAP) {
    x -= clipx;
    y -= clipy;
  }
  if (y === cy && x === cx) {
    return;
  }
  if (cw.type === NHW_MAP) {
    end_glyphout();
  }
  if (!G.tc_lcl_data.tc_ND && (cx !== x || x <= 3)) {
    cmov(x, y);
    return;
  }
  if ((cy -= y) < 0) {
    cy = -cy;
  }
  if ((cx -= x) < 0) {
    cx = -cx;
  }
  if (cy <= 3 && cx <= 3) {
    await nocmov(x, y);
  } else if (x <= 3 && cy <= 3 || !G.tc_lcl_data.tc_CM && x < cx) {
    putchar(13);
    G.ttyDisplay.curx = 0;
    await nocmov(x, y);
  } else if (!G.tc_lcl_data.tc_CM) {
    await nocmov(x, y);
  } else {
    cmov(x, y);
  }
  G.ttyDisplay.curx = x << 16 >> 16;
  G.ttyDisplay.cury = y << 16 >> 16;
}

async function tty_putsym(window_: number, x: number, y: number, ch: number): Promise<void> {
  let cw = null;
  ;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    await panic(P(winpanicstr), window_);
  }
  ;
  ;
  switch (cw.type) {
  case 3:
  case 6:
    await tty_curs(window_, x, y);
    putchar(ch);
    G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
    ++cw.curx;
    break;
  case 1:
  case 4:
  case 5:
    await impossible(S("Can't putsym to window type %d"), cw.type);
    break;
  }
}

function compress_str(str: Ptr | null): Ptr | null {
  let $t1: any, $t2: any, $t3: any;
  if ((strlen(str) | 0) >= G.tc_gbl_data.tc_CO || strchr(str, 10)) {
    let in_str = str;
    let c = 0;
    let outstr = P(compress_str$cbuf);
    let outend = P(compress_str$cbuf, 256 - 1);
    let was_space = TRUE;
    while ((c = $rd(($t2 = in_str, in_str = $t2.add(1), $t2))) !== 0 && outstr.o < outend.o) {
      if (c === 10) {
        c = 32;
      }
      if (was_space && c === 32) {
        continue;
      }
      $wr(($t3 = outstr, outstr = $t3.add(1), $t3), 0, c);
      was_space = (c === 32 ? 1 : 0) << 24 >> 24;
    }
    if (was_space && outstr.o > P(compress_str$cbuf).o || $peq(outstr, outend)) {
      outstr = outstr.add(-1);
    }
    outstr.a[outstr.o] = 0;
    str = P(compress_str$cbuf);
  }
  return str;
}

export async function tty_putstr(window_: number, attr: number, str: Ptr | null): Promise<void> {
  let $t1: any;
  let cw = null;
  let ob = null;
  let i = 0;
  let n0 = 0;
  ;
  if (window_ === WIN_ERR || !(cw = G.wins[window_])) {
    tty_raw_print(str);
    return;
  }
  if (!str || cw.flags & WIN_CANCELLED && cw.type !== NHW_MESSAGE) {
    return;
  }
  if (cw.type !== NHW_MESSAGE) {
    str = compress_str(str);
  }
  G.ttyDisplay.lastwin = window_;
  ;
  ;
  switch (cw.type) {
  case 1:
    {
      let suppress_history = attr & ATR_NOHISTORY;
      if (!suppress_history) {
        await update_topl(str);
      } else {
        await remember_topl();
        await show_topl(str);
      }
      break;
    }
  case 3:
    await tty_curs(window_, cw.curx + 1 | 0, cw.cury | 0);
    term_start_attr(attr);
    while (str.a[str.o] && G.ttyDisplay.curx < G.ttyDisplay.cols - 1) {
      putchar(str.a[str.o]);
      str = str.add(1);
      G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
    }
    cw.curx = 0;
    ++cw.cury;
    term_end_attr(attr);
    break;
  case 6:
    await tty_curs(window_, cw.curx + 1 | 0, cw.cury | 0);
    term_start_attr(attr);
    while (str.a[str.o]) {
      if (G.ttyDisplay.curx >= G.ttyDisplay.cols - 1) {
        cw.curx = 0;
        ++cw.cury;
        await tty_curs(window_, cw.curx + 1 | 0, cw.cury | 0);
      }
      putchar(str.a[str.o]);
      str = str.add(1);
      G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
    }
    cw.curx = 0;
    ++cw.cury;
    term_end_attr(attr);
    break;
  case 4:
  case 5:
    if (cw.type === NHW_TEXT && cw.cury + cw.offy === G.ttyDisplay.rows - 1) {
      cw.maxcol = G.ttyDisplay.cols;
      await tty_display_nhwindow(window_, TRUE);
      for (i = 0; i < cw.maxrow; ++i) {
        if (cw.data.a[cw.data.o + i]) {
          free(cw.data.a[cw.data.o + i]);
          cw.data.a[cw.data.o + i] = null;
        }
      }
      cw.maxrow = cw.cury = 0;
    }
    if (cw.cury >= cw.rows) {
      let tmp = null;
      cw.rows += 12;
      tmp = P(new Array((8 * (cw.rows >>> 0) >>> 0) / 8).fill(null));
      for (i = 0; i < cw.maxrow; ++i) {
        tmp.a[tmp.o + i] = cw.data.a[cw.data.o + i];
      }
      if (cw.data) {
        free(cw.data);
      }
      cw.data = tmp;
      for (i = cw.maxrow; i < cw.rows; ++i) {
        cw.data.a[cw.data.o + i] = null;
      }
    }
    if (cw.data.a[cw.data.o + cw.cury]) {
      free(cw.data.a[cw.data.o + cw.cury]);
    }
    n0 = strlen(str) + 1;
    ob = cw.data.a[cw.data.o + cw.cury] = P(new Int8Array(((n0 >>> 0) + 1 >>> 0)));
    $wr(($t1 = ob, ob = $t1.add(1), $t1), 0, attr + 1 << 24 >> 24);
    strcpy(ob, str);
    if (n0 > cw.maxcol) {
      cw.maxcol = n0;
    }
    if (++cw.cury > cw.maxrow) {
      cw.maxrow = cw.cury;
    }
    if (n0 > G.tc_gbl_data.tc_CO) {
      for (i = G.tc_gbl_data.tc_CO - 1; i && str.a[str.o + i] !== 32 && str.a[str.o + i] !== 10; ) {
        --i;
      }
      if (i) {
        $wr(cw.data.a[cw.data.o + (cw.cury - 1)], ++i, 0);
        await tty_putstr(window_, attr, str.add(i));
      }
    }
    break;
  }
}

export async function tty_display_file(fname: Ptr | null, complain: number): Promise<void> {
  {
    let f = null;
    let buf = new Int8Array(256);
    let cr = null;
    await tty_clear_nhwindow(G.WIN_MESSAGE);
    f = await dlb_fopen(fname, S("r"));
    if (!f) {
      if (complain) {
        await home();
        tty_mark_synch();
        tty_raw_print(S(""));
        perror(fname);
        await tty_wait_synch();
        await pline(S("Cannot open \"%s\"."), fname);
      } else if (G.u.ux) {
        await docrt();
      }
    } else {
      let datawin = await tty_create_nhwindow(NHW_TEXT);
      let empty = TRUE;
      if (complain && G.tc_lcl_data.tc_CD) {
        G.wins[datawin].offy = G.wins[G.WIN_STATUS].offy + 3 << 16 >> 16;
        if (G.wins[datawin].offy + 12 > G.ttyDisplay.rows) {
          G.wins[datawin].offy = 0;
        }
      }
      while (dlb_fgets(P(buf), BUFSZ, f)) {
        if (!!(cr = strchr(P(buf), 10))) {
          cr.a[cr.o] = 0;
        }
        if (!!strchr(P(buf), 9)) {
          tabexpand(P(buf));
        }
        empty = FALSE;
        await tty_putstr(datawin, 0, P(buf));
        if (G.wins[datawin].flags & WIN_CANCELLED) {
          break;
        }
      }
      if (!empty) {
        await tty_display_nhwindow(datawin, FALSE);
      }
      await tty_destroy_nhwindow(datawin);
      dlb_fclose(f);
    }
  }
}

export async function tty_start_menu(window_: number): Promise<void> {
  await tty_clear_nhwindow(window_);
  return;
}

export async function tty_add_menu(window_: number, glyph: number, identifier: union_any | null, ch: number, gch: number, attr: number, str: Ptr | null, preselected: number): Promise<void> {
  let cw = null;
  let item = null;
  let newstr = null;
  let buf = new Int8Array(260);
  ;
  if (!str) {
    return;
  }
  if (window_ === WIN_ERR || !(cw = G.wins[window_]) || cw.type !== NHW_MENU) {
    await panic(P(winpanicstr), window_);
  }
  ++cw.nitems;
  if (identifier.a_void) {
    let len = strlen(str) | 0;
    if (len >= BUFSZ) {
      await impossible(S("Menu item too long (%d)."), len);
      len = BUFSZ - 1;
    }
    sprintf(P(buf), S("%c - "), ch ? ch : 63);
    strncpy(P(buf).add(4), str, $u64(len));
    buf[4 + len] = 0;
    newstr = P(buf);
  } else {
    newstr = str;
  }
  item = new struct_tty_mi();
  item.identifier.$cp(identifier);
  item.count = -1;
  item.selected = preselected;
  item.selector = ch;
  item.gselector = gch;
  item.attr = attr;
  item.str = await dupstr(newstr ? newstr : S(""));
  item.next = cw.mlist;
  cw.mlist = item;
}

function reverse(curr: struct_tty_mi | null): struct_tty_mi | null {
  let next = null;
  let head = null;
  while (curr) {
    next = curr.next;
    curr.next = head;
    head = curr;
    curr = next;
  }
  return head;
}

export async function tty_end_menu(window_: number, prompt: Ptr | null): Promise<void> {
  let $t1: any;
  let cw = null;
  let curr = null;
  let len = 0;
  let lmax = 0;
  let n = 0;
  let menu_ch = 0;
  if (window_ === WIN_ERR || !(cw = G.wins[window_]) || cw.type !== NHW_MENU) {
    await panic(P(winpanicstr), window_);
  }
  cw.mlist = reverse(cw.mlist);
  if (prompt) {
    let any = new union_any();
    any.$cp(G.zeroany);
    await tty_add_menu(window_, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
    await tty_add_menu(window_, NO_GLYPH, any, 0, 0, ATR_NONE, prompt, MENU_UNSELECTED);
  }
  lmax = 52 < G.ttyDisplay.rows - 1 ? 52 : G.ttyDisplay.rows - 1;
  cw.npages = Math.trunc((cw.nitems + (lmax - 1)) / lmax);
  if (cw.plist_size < cw.npages + 1) {
    if (cw.plist) {
      free(cw.plist);
    }
    cw.plist_size = cw.npages + 1;
    cw.plist = P(new Array(($u64(cw.plist_size) * 8 >>> 0) / 8).fill(null));
  }
  cw.cols = 0;
  menu_ch = 63;
  for (n = 0, curr = cw.mlist; curr; ++n, curr = curr.next) {
    if (n % lmax === 0) {
      menu_ch = 97;
      cw.plist.a[cw.plist.o + (n / lmax | 0)] = curr;
    }
    if (curr.identifier.a_void && !curr.selector) {
      curr.str.a[curr.str.o] = curr.selector = menu_ch;
      if (($t1 = menu_ch, menu_ch = $t1 + 1 << 24 >> 24, $t1) === 122) {
        menu_ch = 65;
      }
    }
    len = strlen(curr.str) + 2 << 16 >> 16;
    if (len > G.ttyDisplay.cols) {
      curr.str.a[curr.str.o + (G.ttyDisplay.cols - 2)] = 0;
      len = G.ttyDisplay.cols;
    }
    if (len > cw.cols) {
      cw.cols = len;
    }
  }
  cw.plist.a[cw.plist.o + cw.npages] = null;
  if (cw.npages > 1) {
    let buf = new Int8Array(128);
    sprintf(P(buf), S("(%ld of %ld) "), cw.npages, cw.npages);
    len = strlen(P(buf)) << 16 >> 16;
    cw.morestr = await dupstr(S(""));
  } else {
    cw.morestr = await dupstr(S("(end) "));
    len = strlen(cw.morestr) << 16 >> 16;
  }
  if (len > G.ttyDisplay.cols) {
    if (cw.npages <= 1) {
      cw.morestr.a[cw.morestr.o + G.ttyDisplay.cols] = 0;
    }
    len = G.ttyDisplay.cols;
  }
  if (len > cw.cols) {
    cw.cols = len;
  }
  cw.maxcol = cw.cols;
  if (cw.npages > 1) {
    cw.maxrow = cw.rows = lmax + 1;
  } else {
    cw.maxrow = cw.rows = cw.nitems + 1;
  }
}

export async function tty_select_menu(window_: number, how: number, menu_list: Ptr | null): Promise<number> {
  let cw = null;
  let curr = null;
  let mi = null;
  let n = 0;
  let cancelled = 0;
  if (window_ === WIN_ERR || !(cw = G.wins[window_]) || cw.type !== NHW_MENU) {
    await panic(P(winpanicstr), window_);
  }
  menu_list.a[menu_list.o] = null;
  cw.how = how << 16 >> 16;
  G.morc = 0;
  await tty_display_nhwindow(window_, TRUE);
  cancelled = !!(cw.flags & WIN_CANCELLED) ? 1 : 0;
  await tty_dismiss_nhwindow(window_);
  if (cancelled) {
    n = -1;
  } else {
    for (n = 0, curr = cw.mlist; curr; curr = curr.next) {
      if (curr.selected) {
        ++n;
      }
    }
  }
  if (n > 0) {
    menu_list.a[menu_list.o] = $sarr(struct_mi, ($u64(n) * 16 >>> 0) / 16)[0];
    for (mi = menu_list.a[menu_list.o], curr = cw.mlist; curr; curr = curr.next) {
      if (curr.selected) {
        mi.item.$cp(curr.identifier);
        mi.count = curr.count;
        mi = $sadd(mi, 1);
      }
    }
  }
  return n;
}

export async function tty_message_menu(let_: number, how: number, mesg: Ptr | null): Promise<number> {
  let $t1: any;
  ;
  if (how === PICK_NONE) {
    await pline(S("%s"), mesg);
    return 0;
  }
  G.ttyDisplay.dismiss_more = let_;
  G.morc = 0;
  await tty_putstr(G.WIN_MESSAGE, 0, mesg);
  if (G.ttyDisplay.toplin === 1) {
    await more();
    G.ttyDisplay.toplin = 1;
    await tty_clear_nhwindow(G.WIN_MESSAGE);
  }
  ($t1 = G.wins[G.WIN_MESSAGE], $t1.flags = $t1.flags & ~WIN_CANCELLED);
  G.ttyDisplay.dismiss_more = 0;
  return (how === PICK_ONE && G.morc === let_ || G.morc === 27 ? G.morc : 0) << 24 >> 24;
}

export function tty_update_inventory(): void {
  return;
}

export function tty_mark_synch(): void {
  ;
  fflush(R.stdout);
}

export async function tty_wait_synch(): Promise<void> {
  ;
  if (!G.ttyDisplay || G.ttyDisplay.rawprint) {
    await getret();
    if (G.ttyDisplay) {
      G.ttyDisplay.rawprint = 0;
    }
  } else {
    await tty_display_nhwindow(G.WIN_MAP, FALSE);
    if (G.ttyDisplay.inmore) {
      await addtopl(S("--More--"));
      fflush(R.stdout);
    } else if (G.ttyDisplay.inread > G.program_state.gameover) {
      G.ttyDisplay.toplin = 3;
      await tty_doprev_message();
      await tty_doprev_message();
      ++G.ttyDisplay.intr;
      fflush(R.stdout);
    }
  }
}

export async function docorner(xmin: number, ymax: number): Promise<void> {
  let y = 0;
  let cw = G.wins[G.WIN_MAP];
  ;
  if (ymax > G.tc_gbl_data.tc_LI) {
    ymax = G.tc_gbl_data.tc_LI;
  }
  for (y = 0; y < ymax; ++y) {
    await tty_curs(G.BASE_WINDOW, xmin, y);
    await cl_end();
    if (y < cw.offy || y + clipy > ROWNO) {
      continue;
    }
    await row_refresh(xmin + clipx - cw.offx, COLNO - 1, y + clipy - cw.offy);
  }
  end_glyphout();
  if (ymax >= G.wins[G.WIN_STATUS].offy) {
    G.context.botlx = 1;
    await bot();
  }
}

export function end_glyphout(): void {
  ;
  if (G.GFlag) {
    G.GFlag = FALSE;
    graph_off();
  }
  if (G.ttyDisplay.color !== NO_COLOR) {
    term_end_color();
    G.ttyDisplay.color = NO_COLOR;
  }
}

export function g_putch(in_ch: number): void {
  let ch = in_ch << 24 >> 24;
  ;
  if (G.symset[G.currentgraphics].handling === 1 || G.iflags.wc_eight_bit_input && (!(G.symset[G.currentgraphics].handling === 2) || (in_ch & 127) < 96)) {
    putchar(ch);
  } else if (ch & 128) {
    if (!G.GFlag || G.HE_resets_AS) {
      graph_on();
      G.GFlag = TRUE;
    }
    putchar(ch ^ 128);
  } else {
    if (G.GFlag) {
      graph_off();
      G.GFlag = FALSE;
    }
    putchar(ch);
  }
  return;
}

export function setclipped(): void {
  clipping = TRUE;
  clipx = clipy = 0;
  clipxmax = G.tc_gbl_data.tc_CO;
  clipymax = G.tc_gbl_data.tc_LI - 1 - G.iflags.wc2_statuslines;
}

export async function tty_cliparound(x: number, y: number): Promise<void> {
  let oldx = clipx;
  let oldy = clipy;
  ;
  if (!clipping) {
    return;
  }
  if (x < clipx + 5) {
    clipx = 0 > x - 20 ? 0 : x - 20;
    clipxmax = clipx + G.tc_gbl_data.tc_CO;
  } else if (x > clipxmax - 5) {
    clipxmax = 80 < clipxmax + 20 ? 80 : clipxmax + 20;
    clipx = clipxmax - G.tc_gbl_data.tc_CO;
  }
  if (y < clipy + 2) {
    clipy = 0 > y - ((clipymax - clipy) / 2 | 0) ? 0 : y - ((clipymax - clipy) / 2 | 0);
    clipymax = clipy + (G.tc_gbl_data.tc_LI - 1 - G.iflags.wc2_statuslines);
  } else if (y > clipymax - 2) {
    clipymax = 21 < clipymax + ((clipymax - clipy) / 2 | 0) ? 21 : clipymax + ((clipymax - clipy) / 2 | 0);
    clipy = clipymax - (G.tc_gbl_data.tc_LI - 1 - G.iflags.wc2_statuslines);
  }
  if (clipx !== oldx || clipy !== oldy) {
    await redraw_map();
  }
}

export async function tty_print_glyph(window_: number, x: number, y: number, glyph: number, bkglyph: number): Promise<void> {
  let $t1: any;
  const ch = new Int32Array(1);
  let reverse_on = FALSE;
  const color = new Int32Array(1);
  const special = new Uint32Array(1);
  ;
  if (clipping) {
    if (x <= clipx || y < clipy || x >= clipxmax || y >= clipymax) {
      return;
    }
  }
  mapglyph(glyph, P(ch, 0), P(color, 0), P(special, 0), x, y, 0);
  ;
  ;
  await tty_curs(window_, x, y);
  ;
  ;
  if (G.tc_lcl_data.tc_ul_hack && ch[0] === 95) {
    putchar(32);
    backsp();
  }
  if (color[0] !== G.ttyDisplay.color) {
    if (G.ttyDisplay.color !== NO_COLOR) {
      term_end_color();
    }
    G.ttyDisplay.color = color[0];
    if (color[0] !== NO_COLOR) {
      term_start_color(color[0]);
    }
  }
  if ((special[0] & MG_PET) >>> 0 && G.iflags.wc_hilite_pet || (special[0] & MG_OBJPILE) >>> 0 && G.iflags.hilite_pile || (special[0] & MG_DETECT) >>> 0 && G.iflags.wc_inverse || (special[0] & MG_BW_LAVA) >>> 0 && G.iflags.wc_inverse) {
    term_start_attr(ATR_INVERSE);
    reverse_on = TRUE;
  }
  g_putch(ch[0]);
  if (reverse_on) {
    term_end_attr(ATR_INVERSE);
    if (G.ttyDisplay.color !== NO_COLOR) {
      term_end_color();
      G.ttyDisplay.color = NO_COLOR;
    }
  }
  ;
  ;
  ($t1 = G.wins[window_], $t1.curx = $t1.curx + 1);
  G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
}

export function tty_raw_print(str: Ptr | null): void {
  ;
  if (G.ttyDisplay) {
    ++G.ttyDisplay.rawprint;
  }
  ;
  ;
  puts(str);
  fflush(R.stdout);
}

export function tty_raw_print_bold(str: Ptr | null): void {
  ;
  if (G.ttyDisplay) {
    ++G.ttyDisplay.rawprint;
  }
  ;
  ;
  term_start_raw_bold();
  fputs(str, R.stdout);
  term_end_raw_bold();
  puts(S(""));
  fflush(R.stdout);
}

export async function tty_nhgetch(): Promise<number> {
  let $t1: any;
  let i = 0;
  const nestbuf = new Int8Array(1);
  ;
  ;
  ;
  fflush(R.stdout);
  if (G.WIN_MESSAGE !== WIN_ERR && G.wins[G.WIN_MESSAGE]) {
    ($t1 = G.wins[G.WIN_MESSAGE], $t1.flags = $t1.flags & ~WIN_STOP);
  }
  if (G.iflags.debug_fuzzer) {
    i = randomkey();
  } else {
    i = ++tty_nhgetch$nesting === 1 ? await getchar() : read(fileno(R.stdin), P(nestbuf, 0), 1) === 1 ? nestbuf[0] : EOF;
    --tty_nhgetch$nesting;
  }
  if (!i) {
    i = 27;
  } else if (i === EOF) {
    i = 27;
  }
  if (G.ttyDisplay && G.ttyDisplay.toplin === 1) {
    G.ttyDisplay.toplin = 2;
  }
  return i;
}

export async function tty_nh_poskey(x: Ptr | null, y: Ptr | null, mod: Ptr | null): Promise<number> {
  let i = 0;
  ;
  ;
  ;
  ;
  i = await tty_nhgetch();
  return i;
}

export function win_tty_init(dir: number): void {
  if (dir !== WININIT) {
    return;
  }
  return;
}

export async function tty_status_init(): Promise<void> {
  let i = 0;
  let num_rows = 0;
  num_rows = G.iflags.wc2_statuslines < 3 ? 2 : 3;
  fieldorder = num_rows !== 3 ? P(twolineorder) : P(threelineorder);
  for (i = 0; i < MAXBLSTATS; ++i) {
    $at2(tty_status, NOW, i).idx = BL_FLUSH;
    $at2(tty_status, NOW, i).color = NO_COLOR;
    $at2(tty_status, NOW, i).attr = ATR_NONE;
    $at2(tty_status, NOW, i).x = $at2(tty_status, NOW, i).y = 0;
    $at2(tty_status, NOW, i).valid = FALSE;
    $at2(tty_status, NOW, i).dirty = FALSE;
    $at2(tty_status, NOW, i).redraw = FALSE;
    $at2(tty_status, NOW, i).sanitycheck = FALSE;
    $at2(tty_status, BEFORE, i).$cp($at2(tty_status, NOW, i));
  }
  tty_condition_bits = 0;
  hpbar_percent = 0, hpbar_color = NO_COLOR;
  await genl_status_init();
}

export function tty_status_enablefield(fieldidx: number, nm: Ptr | null, fmt: Ptr | null, enable: number): void {
  genl_status_enablefield(fieldidx, nm, fmt, enable);
}

export async function tty_status_update(fldidx: number, ptr: any, chg: number, percent: number, color: number, colormasks: Ptr | null): Promise<void> {
  let $t1: any, $t2: any;
  let attrmask = 0;
  let condptr = ptr;
  let text = ptr;
  let goldbuf = new Int8Array(40);
  let lastchar = null;
  let p = null;
  let fmt = null;
  let reset_state = NO_RESET;
  if (fldidx < BL_RESET || fldidx >= MAXBLSTATS) {
    return;
  }
  if (fldidx >= 0 && fldidx < MAXBLSTATS && !G.status_activefields[fldidx]) {
    return;
  }
  switch (fldidx) {
  case BL_RESET:
    reset_state = FORCE_RESET;
  case BL_FLUSH:
    if (await make_things_fit(reset_state) || truncation_expected) {
      await render_status();
    }
    return;
  case BL_CONDITION:
    $at2(tty_status, NOW, fldidx).idx = fldidx;
    tty_condition_bits = condptr.a[condptr.o];
    tty_colormasks = colormasks;
    $at2(tty_status, NOW, fldidx).valid = TRUE;
    $at2(tty_status, NOW, fldidx).dirty = TRUE;
    $at2(tty_status, NOW, fldidx).sanitycheck = TRUE;
    truncation_expected = FALSE;
    break;
  case BL_GOLD:
    text = decode_mixed(P(goldbuf), text);
  default:
    attrmask = color >> 8 & 255;
    fmt = G.status_fieldfmt[fldidx];
    if (!fmt) {
      fmt = S("%s");
    }
    if (fmt.a[fmt.o] === 32 && (fldidx === fieldorder.a[fieldorder.o][0] || fldidx === fieldorder.a[fieldorder.o + 1][0] || fldidx === fieldorder.a[fieldorder.o + 2][0])) {
      fmt = fmt.add(1);
    }
    sprintf(G.status_vals[fldidx], fmt, text);
    $at2(tty_status, NOW, fldidx).idx = fldidx;
    $at2(tty_status, NOW, fldidx).color = color & 255;
    $at2(tty_status, NOW, fldidx).attr = term_attr_fixup(attrmask);
    $at2(tty_status, NOW, fldidx).lth = strlen(G.status_vals[fldidx]);
    $at2(tty_status, NOW, fldidx).valid = TRUE;
    $at2(tty_status, NOW, fldidx).dirty = TRUE;
    $at2(tty_status, NOW, fldidx).sanitycheck = TRUE;
    break;
  }
  if (fldidx >= 0 && fldidx < MAXBLSTATS && $at2(tty_status, NOW, fldidx).lth === 1 && $rd(G.status_vals[fldidx]) === 32) {
    $wr(G.status_vals[fldidx], 0, 0);
    $at2(tty_status, NOW, fldidx).lth = 0;
  }
  switch (fldidx) {
  case BL_HP:
    if (G.iflags.wc2_hitpointbar) {
      hpbar_percent = percent;
      hpbar_color = color & 255;
      tty_status[NOW][BL_TITLE].color = hpbar_color;
      tty_status[NOW][BL_TITLE].dirty = TRUE;
    }
    break;
  case BL_LEVELDESC:
    dlvl_shrinklvl = 0;
  case BL_HUNGER:
    if ($at2(tty_status, NOW, fldidx).lth > 0) {
      p = G.status_vals[fldidx];
      for (lastchar = eos(p); lastchar.o > p.o && $rd((lastchar = lastchar.add(-1))) === 32; ) {
        lastchar.a[lastchar.o] = 0;
        ($t1 = $at2(tty_status, NOW, fldidx), $t1.lth = $u64($t1.lth - 1));
      }
    }
    break;
  case BL_TITLE:
    if (G.iflags.wc2_hitpointbar) {
      $at2(tty_status, NOW, fldidx).lth = 30 + 2;
    }
    break;
  case BL_GOLD:
    if (!!(p = strchr(G.status_vals[fldidx], 92)) && p.a[p.o + 1] === 71) {
      ($t2 = $at2(tty_status, NOW, fldidx), $t2.lth = $t2.lth - (10 - 1));
    }
    break;
  case BL_CAP:
    enc_shrinklvl = 0;
    enclev = stat_cap_indx();
    break;
  }
  return;
}

async function make_things_fit(force_update: number): Promise<number> {
  let trycnt = 0;
  let fitting = 0;
  let requirement = 0;
  let rowsz = new Int32Array(3);
  let num_rows = 0;
  let condrow = 0;
  let otheroptions = 0;
  num_rows = G.iflags.wc2_statuslines < 3 ? 2 : 3;
  condrow = num_rows - 1;
  cond_shrinklvl = 0;
  if (enc_shrinklvl > 0 && num_rows === 2) {
    shrink_enc(0);
  }
  if (dlvl_shrinklvl > 0) {
    shrink_dlvl(0);
  }
  set_condition_length();
  for (trycnt = 0; trycnt < 6 && !fitting; ++trycnt) {
    if (!await check_fields(force_update, P(rowsz))) {
      fitting = 0;
      break;
    }
    requirement = rowsz[condrow] - 1;
    if (requirement <= G.wins[G.WIN_STATUS].cols - 1) {
      fitting = requirement;
      break;
    }
    if (trycnt < 2) {
      if (cond_shrinklvl < trycnt + 1) {
        cond_shrinklvl = trycnt + 1;
        set_condition_length();
      }
      continue;
    }
    if (cond_shrinklvl >= 2) {
      if (otheroptions < 2) {
        if (num_rows === 2) {
          shrink_enc(otheroptions + 1);
        }
      } else if (otheroptions === 2) {
        shrink_dlvl(1);
      } else {
        truncation_expected = TRUE;
        break;
      }
      ++otheroptions;
    }
  }
  return fitting;
}

async function check_fields(forcefields: number, sz: Ptr | null): Promise<number> {
  let c = 0;
  let i = 0;
  let row = 0;
  let col = 0;
  let num_rows = 0;
  let idx = 0;
  let valid = TRUE;
  let matchprev = 0;
  let update_right = 0;
  if (!windowdata_init && !await check_windowdata()) {
    return FALSE;
  }
  num_rows = G.iflags.wc2_statuslines < 3 ? 2 : 3;
  for (row = 0; row < num_rows; ++row) {
    sz.a[sz.o + row] = 0;
    col = 1;
    update_right = FALSE;
    for (i = 0; (idx = fieldorder.a[fieldorder.o + row][i]) !== BL_FLUSH; ++i) {
      if (!G.status_activefields[idx]) {
        continue;
      }
      if (!$at2(tty_status, NOW, idx).valid) {
        valid = FALSE;
      }
      $at2(tty_status, NOW, idx).redraw = FALSE;
      $at2(tty_status, NOW, idx).y = row;
      $at2(tty_status, NOW, idx).x = col;
      if ($u64($at2(tty_status, NOW, idx).x) + $at2(tty_status, NOW, idx).lth !== $u64($at2(tty_status, BEFORE, idx).x) + $at2(tty_status, BEFORE, idx).lth) {
        update_right = TRUE;
      } else if ($at2(tty_status, NOW, idx).lth !== $at2(tty_status, BEFORE, idx).lth || $at2(tty_status, NOW, idx).x !== $at2(tty_status, BEFORE, idx).x) {
        $at2(tty_status, NOW, idx).redraw = TRUE;
      } else {
        update_right = FALSE;
      }
      matchprev = FALSE;
      if (valid && !update_right && !forcefields && !$at2(tty_status, NOW, idx).redraw) {
        if (do_field_opt && idx !== BL_CONDITION && $at2(tty_status, NOW, idx).color === $at2(tty_status, BEFORE, idx).color && $at2(tty_status, NOW, idx).attr === $at2(tty_status, BEFORE, idx).attr) {
          matchprev = TRUE;
          if ($at2(tty_status, NOW, idx).dirty) {
            let ob = null;
            let nb = null;
            let cw = G.wins[G.WIN_STATUS];
            c = col - 1;
            ob = cw.data.a[cw.data.o + row].add(c);
            nb = G.status_vals[idx];
            while (nb.a[nb.o] && c < cw.cols) {
              if (nb.a[nb.o] !== ob.a[ob.o]) {
                break;
              }
              nb = nb.add(1);
              ob = ob.add(1);
              ++c;
            }
            if (nb.a[nb.o]) {
              matchprev = FALSE;
            }
          }
        }
      }
      if (forcefields || update_right || $at2(tty_status, NOW, idx).dirty && !matchprev) {
        $at2(tty_status, NOW, idx).redraw = TRUE;
      }
      col += $at2(tty_status, NOW, idx).lth;
    }
    sz.a[sz.o + row] = col;
  }
  return valid;
}

async function tty_putstatusfield(text: Ptr | null, x: number, y: number): Promise<void> {
  let i = 0;
  let n = 0;
  let ncols = 0;
  let nrows = 0;
  let lth = 0;
  let cw = null;
  if (G.WIN_STATUS === WIN_ERR || !(cw = G.wins[G.WIN_STATUS])) {
    await panic(S("tty_putstatusfield: Invalid WinDesc\n"));
  }
  ncols = cw.cols | 0;
  nrows = cw.maxrow | 0;
  lth = strlen(text) | 0;
  ;
  ;
  if (x < ncols && y < nrows) {
    if (x !== cw.curx || y !== cw.cury) {
      await tty_curs(NHW_STATUS, x, y);
    }
    for (i = 0; i < lth; ++i) {
      n = i + x;
      if (n < ncols && text.a[text.o]) {
        putchar(text.a[text.o]);
        G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
        ++cw.curx;
        $wr(cw.data.a[cw.data.o + y], (n - 1), text.a[text.o]);
        text = text.add(1);
      }
    }
  }
}

function set_condition_length(): void {
  let mask = 0;
  let c = 0;
  let lth = 0;
  if (tty_condition_bits) {
    for (c = 0; c < (Math.trunc(416 / 32) | 0); ++c) {
      mask = conditions[c].mask;
      if ((tty_condition_bits & mask) === mask) {
        lth += 1 + (strlen(conditions[c].text[cond_shrinklvl]) | 0);
      }
    }
  }
  tty_status[NOW][BL_CONDITION].lth = $u64(lth);
}

function shrink_enc(lvl: number): void {
  if (lvl <= 2) {
    enc_shrinklvl = lvl;
    sprintf(G.status_vals[BL_CAP], S(" %s"), encvals[lvl][enclev]);
  }
  tty_status[NOW][BL_CAP].lth = strlen(G.status_vals[BL_CAP]);
}

function shrink_dlvl(lvl: number): void {
  let buf = new Int8Array(256);
  let levval = strchr(G.status_vals[BL_LEVELDESC], 58);
  if (levval) {
    dlvl_shrinklvl = lvl;
    strcpy(P(buf), lvl === 0 ? S("Dlvl") : S("Dl"));
    strcat(P(buf), levval);
    strcpy(G.status_vals[BL_LEVELDESC], P(buf));
    tty_status[NOW][BL_LEVELDESC].lth = strlen(G.status_vals[BL_LEVELDESC]);
  }
}

async function check_windowdata(): Promise<number> {
  if (G.WIN_STATUS === WIN_ERR || !G.wins[G.WIN_STATUS]) {
    paniclog(S("check_windowdata"), S(" null status window."));
    return FALSE;
  } else if (!windowdata_init) {
    await tty_clear_nhwindow(G.WIN_STATUS);
    windowdata_init = TRUE;
  }
  return TRUE;
}

function condcolor(bm: number, bmarray: Ptr | null): number {
  let i = 0;
  if (bm && bmarray) {
    for (i = 0; i < CLR_MAX; ++i) {
      if (($u64(bm) & bmarray.a[bmarray.o + i]) >>> 0 !== 0) {
        return i;
      }
    }
  }
  return NO_COLOR;
}

function condattr(bm: number, bmarray: Ptr | null): number {
  let attr = 0;
  let i = 0;
  if (bm && bmarray) {
    for (i = HL_ATTCLR_DIM; i < BL_ATTCLR_MAX; ++i) {
      if (($u64(bm) & bmarray.a[bmarray.o + i]) >>> 0 !== 0) {
        switch (i) {
        case 16 + 0:
          attr |= HL_DIM;
          break;
        case 16 + 1:
          attr |= HL_BLINK;
          break;
        case 16 + 2:
          attr |= HL_ULINE;
          break;
        case 16 + 3:
          attr |= HL_INVERSE;
          break;
        case 16 + 4:
          attr |= HL_BOLD;
          break;
        }
      }
    }
  }
  return attr;
}

async function render_status(): Promise<void> {
  let $t1: any, $t2: any;
  let mask = 0;
  let bits = 0;
  let i = 0;
  let x = 0;
  let y = 0;
  let idx = 0;
  let c = 0;
  let row = 0;
  let tlth = 0;
  let num_rows = 0;
  let coloridx = 0;
  let attrmask = 0;
  let text = null;
  let cw = null;
  if (G.WIN_STATUS === WIN_ERR || !(cw = G.wins[G.WIN_STATUS])) {
    paniclog(S("render_status"), S("WIN_ERR on status window."));
    return;
  }
  num_rows = G.iflags.wc2_statuslines < 3 ? 2 : 3;
  for (row = 0; row < num_rows; ++row) {
    ;
    y = row;
    await tty_curs(G.WIN_STATUS, 1, y);
    for (i = 0; (idx = fieldorder.a[fieldorder.o + row][i]) !== BL_FLUSH; ++i) {
      if (!G.status_activefields[idx]) {
        continue;
      }
      x = $at2(tty_status, NOW, idx).x;
      text = G.status_vals[idx];
      tlth = $at2(tty_status, NOW, idx).lth | 0;
      if ($at2(tty_status, NOW, idx).redraw || !do_field_opt) {
        let hitpointbar = (idx === BL_TITLE && G.iflags.wc2_hitpointbar ? 1 : 0) << 24 >> 24;
        if (idx === BL_CONDITION) {
          bits = tty_condition_bits;
          if (num_rows === 3 && bits !== 0) {
            let k = 0;
            let dat = cw.data.a[cw.data.o + y].add(0);
            if (tty_status[BEFORE][BL_HUNGER].y < row && x < tty_status[BEFORE][BL_HUNGER].x && tty_status[BEFORE][BL_HUNGER].x + tlth < cw.cols - 1) {
              k = tty_status[BEFORE][BL_HUNGER].x;
            } else if (x + tlth < cw.cols - 1) {
              k = cw.cols - tlth | 0;
            } else {
              k = x;
            }
            while (x < k) {
              if (dat.a[dat.o + (x - 1)] !== 32) {
                await tty_putstatusfield(S(" "), x, y);
              }
              ++x;
            }
            tty_status[NOW][BL_CONDITION].x = x;
            await tty_curs(G.WIN_STATUS, x, y);
          }
          for (c = 0; c < (Math.trunc(416 / 32) | 0) && bits !== 0; ++c) {
            mask = conditions[c].mask;
            if (bits & mask) {
              let condtext = null;
              await tty_putstatusfield(S(" "), x++, y);
              if (G.iflags.hilite_delta) {
                attrmask = condattr(mask, tty_colormasks);
                do {
                  if (attrmask) {
                    if (attrmask & HL_BOLD) {
                      term_start_attr(1);
                    }
                    if (attrmask & HL_INVERSE) {
                      term_start_attr(7);
                    }
                    if (attrmask & HL_ULINE) {
                      term_start_attr(4);
                    }
                    if (attrmask & HL_BLINK) {
                      term_start_attr(5);
                    }
                    if (attrmask & HL_DIM) {
                      term_start_attr(2);
                    }
                  }
                } while (0);
                coloridx = condcolor(mask, tty_colormasks);
                if (coloridx !== NO_COLOR) {
                  term_start_color(coloridx);
                }
              }
              condtext = conditions[c].text[cond_shrinklvl];
              if (x >= cw.cols && !truncation_expected) {
                await impossible(S("Unexpected condition placement overflow for \"%s\""), condtext);
                condtext = S("");
                bits = 0;
              }
              await tty_putstatusfield(condtext, x, y);
              x += strlen(condtext) | 0;
              if (G.iflags.hilite_delta) {
                if (coloridx !== NO_COLOR) {
                  term_end_color();
                }
                do {
                  if (attrmask) {
                    if (attrmask & HL_DIM) {
                      term_end_attr(2);
                    }
                    if (attrmask & HL_BLINK) {
                      term_end_attr(5);
                    }
                    if (attrmask & HL_ULINE) {
                      term_end_attr(4);
                    }
                    if (attrmask & HL_INVERSE) {
                      term_end_attr(7);
                    }
                    if (attrmask & HL_BOLD) {
                      term_end_attr(1);
                    }
                  }
                } while (0);
              }
              bits = bits & ~mask;
            }
          }
          if (x > cw.cols) {
            if (!truncation_expected && !($t2 = render_status$once_only, render_status$once_only = $t2 + 1 >>> 0, $t2)) {
              paniclog(S("render_status()"), S(" unexpected truncation."));
            }
            x = cw.cols | 0;
          }
        } else if (hitpointbar) {
          let bar_len = 0;
          let bar_pos = 0;
          let bar = new Int8Array(200);
          let bar2 = null;
          let savedch = 0;
          let twoparts = (hpbar_percent < 100 ? 1 : 0) << 24 >> 24;
          if (strlen(text) !== 30) {
            sprintf(P(bar), S("%-30.30s"), text);
            strcpy(G.status_vals[BL_TITLE], P(bar));
          } else {
            strcpy(P(bar), text);
          }
          bar_len = strlen(P(bar)) | 0;
          tlth = bar_len + 2;
          if (twoparts) {
            bar_pos = Math.imul(bar_len, hpbar_percent) / 100 | 0;
            if (bar_pos < 1 && hpbar_percent > 0) {
              bar_pos = 1;
            }
            if (bar_pos >= bar_len && hpbar_percent < 100) {
              bar_pos = bar_len - 1;
            }
            bar2 = P(bar, bar_pos);
            savedch = bar2.a[bar2.o];
            bar2.a[bar2.o] = 0;
          }
          await tty_putstatusfield(S("["), x++, y);
          if ($rd(P(bar))) {
            term_start_attr(ATR_INVERSE);
            if (G.iflags.hilite_delta && hpbar_color !== NO_COLOR) {
              term_start_color(hpbar_color);
            }
            await tty_putstatusfield(P(bar), x, y);
            x += strlen(P(bar)) | 0;
            if (G.iflags.hilite_delta && hpbar_color !== NO_COLOR) {
              term_end_color();
            }
            term_end_attr(ATR_INVERSE);
          }
          if (twoparts) {
            bar2.a[bar2.o] = savedch;
            await tty_putstatusfield(bar2, x, y);
            x += strlen(bar2) | 0;
          }
          await tty_putstatusfield(S("]"), x++, y);
        } else {
          if (G.iflags.hilite_delta) {
            while (text.a[text.o] === 32) {
              await tty_putstatusfield(S(" "), x++, y);
              text = text.add(1);
            }
            if (text.a[text.o] === 47 && idx === BL_EXP) {
              await tty_putstatusfield(S("/"), x++, y);
              text = text.add(1);
            }
            attrmask = $at2(tty_status, NOW, idx).attr;
            do {
              if (attrmask) {
                if (attrmask & HL_BOLD) {
                  term_start_attr(1);
                }
                if (attrmask & HL_INVERSE) {
                  term_start_attr(7);
                }
                if (attrmask & HL_ULINE) {
                  term_start_attr(4);
                }
                if (attrmask & HL_BLINK) {
                  term_start_attr(5);
                }
                if (attrmask & HL_DIM) {
                  term_start_attr(2);
                }
              }
            } while (0);
            coloridx = $at2(tty_status, NOW, idx).color;
            if (coloridx !== NO_COLOR) {
              term_start_color(coloridx);
            }
          }
          await tty_putstatusfield(text, x, y);
          x += strlen(text) | 0;
          if (G.iflags.hilite_delta) {
            if (coloridx !== NO_COLOR) {
              term_end_color();
            }
            do {
              if (attrmask) {
                if (attrmask & HL_DIM) {
                  term_end_attr(2);
                }
                if (attrmask & HL_BLINK) {
                  term_end_attr(5);
                }
                if (attrmask & HL_ULINE) {
                  term_end_attr(4);
                }
                if (attrmask & HL_INVERSE) {
                  term_end_attr(7);
                }
                if (attrmask & HL_BOLD) {
                  term_end_attr(1);
                }
              }
            } while (0);
          }
        }
      } else {
        x += tlth;
      }
      finalx[row][NOW] = x - 1;
      $at2(tty_status, NOW, idx).dirty = FALSE;
      $at2(tty_status, NOW, idx).redraw = FALSE;
      $at2(tty_status, NOW, idx).sanitycheck = FALSE;
      $at2(tty_status, BEFORE, idx).$cp($at2(tty_status, NOW, idx));
    }
    x = finalx[row][NOW];
    if ((x < finalx[row][BEFORE] || !finalx[row][BEFORE]) && x + 1 < cw.cols) {
      await tty_curs(G.WIN_STATUS, x + 1, y);
      await cl_end();
    }
    finalx[row][BEFORE] = finalx[row][NOW];
  }
  return;
}

export function $init(): void {
  G.tty_procs = struct_window_procs.$of(S("tty"), 0 | WC_COLOR | WC_HILITE_PET | WC_INVERSE | WC_EIGHT_BIT_IN, 0 | WC2_HILITE_STATUS | WC2_HITPOINTBAR | WC2_FLUSH_STATUS | WC2_RESET_STATUS | WC2_DARKGRAY | WC2_SUPPRESS_HIST | WC2_STATUSLINES, $ta(Int8Array, 16, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), tty_init_nhwindows, tty_player_selection, tty_askname, tty_get_nh_event, tty_exit_nhwindows, tty_suspend_nhwindows, tty_resume_nhwindows, tty_create_nhwindow, tty_clear_nhwindow, tty_display_nhwindow, tty_destroy_nhwindow, tty_curs, tty_putstr, genl_putmixed, tty_display_file, tty_start_menu, tty_add_menu, tty_end_menu, tty_select_menu, tty_message_menu, tty_update_inventory, tty_mark_synch, tty_wait_synch, tty_cliparound, tty_print_glyph, tty_raw_print, tty_raw_print_bold, tty_nhgetch, tty_nh_poskey, tty_nhbell, tty_doprev_message, tty_yn_function, tty_getlin, tty_get_ext_cmd, tty_number_pad, tty_delay_output, tty_start_screen, tty_end_screen, genl_outrip, tty_preference_update, tty_getmsghistory, tty_putmsghistory, tty_status_init, genl_status_finish, tty_status_enablefield, tty_status_update, genl_can_suspend_yes);
  G.BASE_WINDOW = 0;
  G.wins = new Array(20).fill(null);
  G.ttyDisplay = null;
  obuf = new Int8Array(8192);
  winpanicstr = $cs("Bad window id %d", 17);
  G.defmorestr = $cs("--More--", 9);
  clipping = 0;
  clipx = 0;
  clipxmax = 0;
  clipy = 0;
  clipymax = 0;
  G.GFlag = 0;
  G.HE_resets_AS = 0;
  default_menu_cmds = $ta(Int8Array, 12, [MENU_FIRST_PAGE, MENU_LAST_PAGE, MENU_NEXT_PAGE, MENU_PREVIOUS_PAGE, MENU_SELECT_ALL, MENU_UNSELECT_ALL, MENU_INVERT_ALL, MENU_SELECT_PAGE, MENU_UNSELECT_PAGE, MENU_INVERT_PAGE, MENU_SEARCH]);
  tty_colormasks = null;
  tty_condition_bits = 0;
  tty_status = $arr(2, () => $sarr(struct_tty_status_fields, 23));
  hpbar_percent = 0;
  hpbar_color = 0;
  conditions = $sarrOf([struct_condition_t.$of(BL_MASK_STONE, [S("Stone"), S("Ston"), S("Sto")]),
struct_condition_t.$of(BL_MASK_SLIME, [S("Slime"), S("Slim"), S("Slm")]),
struct_condition_t.$of(BL_MASK_STRNGL, [S("Strngl"), S("Stngl"), S("Str")]),
struct_condition_t.$of(BL_MASK_FOODPOIS, [S("FoodPois"), S("Fpois"), S("Poi")]),
struct_condition_t.$of(BL_MASK_TERMILL, [S("TermIll"), S("Ill"), S("Ill")]),
struct_condition_t.$of(BL_MASK_BLIND, [S("Blind"), S("Blnd"), S("Bl")]),
struct_condition_t.$of(BL_MASK_DEAF, [S("Deaf"), S("Def"), S("Df")]),
struct_condition_t.$of(BL_MASK_STUN, [S("Stun"), S("Stun"), S("St")]),
struct_condition_t.$of(BL_MASK_CONF, [S("Conf"), S("Cnf"), S("Cf")]),
struct_condition_t.$of(BL_MASK_HALLU, [S("Hallu"), S("Hal"), S("Hl")]),
struct_condition_t.$of(BL_MASK_LEV, [S("Lev"), S("Lev"), S("Lv")]),
struct_condition_t.$of(BL_MASK_FLY, [S("Fly"), S("Fly"), S("Fl")]),
struct_condition_t.$of(BL_MASK_RIDE, [S("Ride"), S("Rid"), S("Rd")])]);
  encvals = [[S(""),
S("Burdened"),
S("Stressed"),
S("Strained"),
S("Overtaxed"),
S("Overloaded")], [S(""),
S("Burden"),
S("Stress"),
S("Strain"),
S("Overtax"),
S("Overload")], [S(""),
S("Brd"),
S("Strs"),
S("Strn"),
S("Ovtx"),
S("Ovld")]];
  twolineorder = $rows([$ta(Int32Array, 15, [BL_TITLE, BL_STR, BL_DX, BL_CO, BL_IN, BL_WI, BL_CH, BL_ALIGN, BL_SCORE, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH]), $ta(Int32Array, 15, [BL_LEVELDESC, BL_GOLD, BL_HP, BL_HPMAX, BL_ENE, BL_ENEMAX, BL_AC, BL_XP, BL_EXP, BL_HD, BL_TIME, BL_HUNGER, BL_CAP, BL_CONDITION, BL_FLUSH]), $ta(Int32Array, 15, [BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH])]);
  threelineorder = $rows([$ta(Int32Array, 15, [BL_TITLE, BL_STR, BL_DX, BL_CO, BL_IN, BL_WI, BL_CH, BL_SCORE, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH]), $ta(Int32Array, 15, [BL_ALIGN, BL_GOLD, BL_HP, BL_HPMAX, BL_ENE, BL_ENEMAX, BL_AC, BL_XP, BL_EXP, BL_HD, BL_HUNGER, BL_CAP, BL_FLUSH, BL_FLUSH, BL_FLUSH]), $ta(Int32Array, 15, [BL_LEVELDESC, BL_TIME, BL_CONDITION, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH])]);
  fieldorder = null;
  finalx = $arr(3, () => new Int32Array(2));
  windowdata_init = 0;
  cond_shrinklvl = 0;
  enclev = 0;
  enc_shrinklvl = 0;
  dlvl_shrinklvl = 0;
  truncation_expected = 0;
  do_field_opt = 1;
  tty_askname$who_are_you = $cs("Who are you? ", 14);
  compress_str$cbuf = new Int8Array(256);
  tty_nhgetch$nesting = 0;
  render_status$once_only = 0;
}
