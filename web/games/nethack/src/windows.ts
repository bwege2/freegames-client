// @ts-nocheck
// NetHack 3.6.7 windows.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { nh_terminate } from './end.ts';
import { eos, hhmmss, mungspaces, strNsubst, strncmpi, yyyymmdd } from './hacklib.ts';
import { config_error_add, pline, raw_printf } from './pline.ts';
import { version_string } from './version.ts';
import { win_tty_init } from './wintty.ts';
import { struct_win_choices, struct_window_procs, union_any } from './structs.ts';
import { $rd, $rows, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, fclose, fopen, fprintf, fputs, free, getuid, puts, sprintf, strcmp, strcpy, strlen, strncpy, strstr } from './rt/index.ts';
import { BL_AC, BL_ALIGN, BL_CAP, BL_CH, BL_CO, BL_CONDITION, BL_DX, BL_ENE, BL_ENEMAX, BL_EXP, BL_FLUSH, BL_GOLD, BL_HD, BL_HP, BL_HPMAX, BL_HUNGER, BL_IN, BL_LEVELDESC, BL_MASK_BLIND, BL_MASK_CONF, BL_MASK_DEAF, BL_MASK_FLY, BL_MASK_FOODPOIS, BL_MASK_HALLU, BL_MASK_LEV, BL_MASK_RIDE, BL_MASK_SLIME, BL_MASK_STONE, BL_MASK_STRNGL, BL_MASK_STUN, BL_MASK_TERMILL, BL_RESET, BL_SCORE, BL_STR, BL_TIME, BL_TITLE, BL_WI, BL_XP, BUFSZ, COLNO, EXIT_FAILURE, EXIT_SUCCESS, FALSE, MAXBLSTATS, MAXCO, NHW_STATUS, NO_GLYPH, TRUE, WC2_FLUSH_STATUS, WC_COLOR, WINDOW_TYPE_MAXLEN, WININIT, WININIT_UNDO, WIN_ERR } from './consts.ts';

let winchoices: any;
let last_winchoice: struct_win_choices | null;
let hup_procs: struct_window_procs;
let previnterface_exit_nhwindows: Function | null;
let dumplog_windowprocs_backup: struct_window_procs;
let dumplog_file: Ptr | null;
let dumplog_now: number;
let genl_status_update$fieldorder: any;

export function genl_can_suspend_no(): number {
  return FALSE;
}

export function genl_can_suspend_yes(): number {
  return TRUE;
}

function def_raw_print(s: Ptr | null): void {
  puts(s);
}

function def_wait_synch(): void {
  return;
}

export async function choose_windows(s: Ptr | null): Promise<void> {
  let i = 0;
  let tmps = null;
  for (i = 0; winchoices[i].procs; ++i) {
    if (43 === $rd(winchoices[i].procs.name)) {
      continue;
    }
    if (45 === $rd(winchoices[i].procs.name)) {
      continue;
    }
    if (!strncmpi(s, winchoices[i].procs.name, -1)) {
      G.windowprocs.$cp(winchoices[i].procs);
      if (last_winchoice && last_winchoice.ini_routine) {
        last_winchoice.ini_routine(WININIT_UNDO);
      }
      if (winchoices[i].ini_routine) {
        winchoices[i].ini_routine(WININIT);
      }
      last_winchoice = $sat(winchoices, i);
      return;
    }
  }
  if (!G.windowprocs.win_raw_print) {
    G.windowprocs.win_raw_print = def_raw_print;
  }
  if (!G.windowprocs.win_wait_synch) {
    G.windowprocs.win_wait_synch = def_wait_synch;
  }
  if (!winchoices[0].procs) {
    raw_printf(S("No window types supported?"));
    await nh_terminate(EXIT_FAILURE);
  }
  if (strlen(s) >= WINDOW_TYPE_MAXLEN) {
    tmps = P(new Int8Array(WINDOW_TYPE_MAXLEN));
    strncpy(tmps, s, WINDOW_TYPE_MAXLEN - 1);
    tmps.a[tmps.o + (WINDOW_TYPE_MAXLEN - 1)] = 0;
    s = tmps;
  }
  if (!winchoices[1].procs) {
    await config_error_add(S("Window type %s not recognized.  The only choice is: %s"), s, winchoices[0].procs.name);
  } else {
    let buf = new Int8Array(256);
    let first = TRUE;
    buf[0] = 0;
    for (i = 0; winchoices[i].procs; ++i) {
      if (43 === $rd(winchoices[i].procs.name)) {
        continue;
      }
      if (45 === $rd(winchoices[i].procs.name)) {
        continue;
      }
      sprintf(eos(P(buf)), S("%s%s"), first ? S("") : S(", "), winchoices[i].procs.name);
      first = FALSE;
    }
    await config_error_add(S("Window type %s not recognized.  Choices are:  %s"), s, P(buf));
  }
  if (tmps) {
    free(tmps);
  }
  if (G.windowprocs.win_raw_print === def_raw_print || G.windowprocs.name && !strncmpi(S("safe-startup"), G.windowprocs.name, strlen(S("safe-startup")) | 0)) {
    await nh_terminate(EXIT_SUCCESS);
  }
}

export async function genl_message_menu(let_: number, how: number, mesg: Ptr | null): Promise<number> {
  await pline(S("%s"), mesg);
  return 0;
}

export function genl_preference_update(pref: Ptr | null): void {
  return;
}

export function genl_getmsghistory(init: number): Ptr | null {
  return null;
}

export async function genl_putmsghistory(msg: Ptr | null, is_restoring: number): Promise<void> {
  if (!is_restoring) {
    await pline(S("%s"), msg);
  }
  return;
}

export function nhwindows_hangup(): void {
  let previnterface_getmsghistory = null;
  G.iflags.altmeta = FALSE;
  if (G.iflags.window_inited && G.windowprocs.win_exit_nhwindows !== hup_exit_nhwindows) {
    previnterface_exit_nhwindows = G.windowprocs.win_exit_nhwindows;
  }
  if (G.windowprocs.win_getmsghistory !== hup_procs.win_getmsghistory) {
    previnterface_getmsghistory = G.windowprocs.win_getmsghistory;
  }
  G.windowprocs.$cp(hup_procs);
  if (previnterface_getmsghistory) {
    G.windowprocs.win_getmsghistory = previnterface_getmsghistory;
  }
}

async function hup_exit_nhwindows(lastgasp: Ptr | null): Promise<void> {
  if (previnterface_exit_nhwindows) {
    lastgasp = null;
    await previnterface_exit_nhwindows(lastgasp);
    previnterface_exit_nhwindows = null;
  }
  G.iflags.window_inited = 0;
}

function hup_nhgetch(): number {
  return 27;
}

function hup_yn_function(prompt: Ptr | null, resp: Ptr | null, deflt: number): number {
  if (!deflt) {
    deflt = 27;
  }
  return deflt;
}

function hup_nh_poskey(x: Ptr | null, y: Ptr | null, mod: Ptr | null): number {
  return 27;
}

function hup_getlin(prompt: Ptr | null, outbuf: Ptr | null): void {
  strcpy(outbuf, S("\x1b"));
}

function hup_init_nhwindows(argc_p: Ptr | null, argv: Ptr | null): void {
  G.iflags.window_inited = 1;
}

function hup_create_nhwindow(type: number): number {
  return WIN_ERR;
}

function hup_select_menu(window_: number, how: number, menu_list: Ptr | null): number {
  return -1;
}

function hup_add_menu(window_: number, glyph: number, identifier: union_any | null, sel: number, grpsel: number, attr: number, txt: Ptr | null, preselected: number): void {
  return;
}

function hup_end_menu(window_: number, prompt: Ptr | null): void {
  return;
}

function hup_putstr(window_: number, attr: number, text: Ptr | null): void {
  return;
}

function hup_print_glyph(window_: number, x: number, y: number, glyph: number, bkglyph: number): void {
  return;
}

function hup_outrip(tmpwin: number, how: number, when: number): void {
  return;
}

function hup_curs(window_: number, x: number, y: number): void {
  return;
}

function hup_display_nhwindow(window_: number, blocking: number): void {
  return;
}

function hup_display_file(fname: Ptr | null, complain: number): void {
  return;
}

function hup_cliparound(x: number, y: number): void {
  return;
}

function hup_status_update(idx: number, ptr: any, chg: number, pc: number, color: number, colormasks: Ptr | null): void {
  return;
}

function hup_int_ndecl(): number {
  return -1;
}

function hup_void_ndecl(): void {
  return;
}

function hup_void_fdecl_int(arg: number): void {
  return;
}

function hup_void_fdecl_winid(window_: number): void {
  return;
}

function hup_void_fdecl_constchar_p(string: Ptr | null): void {
  return;
}

export async function genl_status_init(): Promise<void> {
  let i = 0;
  for (i = 0; i < MAXBLSTATS; ++i) {
    G.status_vals[i] = P(new Int8Array(MAXCO));
    $wr(G.status_vals[i], 0, 0);
    G.status_activefields[i] = FALSE;
    G.status_fieldfmt[i] = null;
  }
  G.WIN_STATUS = await G.windowprocs.win_create_nhwindow(NHW_STATUS);
  await G.windowprocs.win_display_nhwindow(G.WIN_STATUS, FALSE);
}

export function genl_status_finish(): void {
  let i = 0;
  for (i = 0; i < MAXBLSTATS; ++i) {
    if (G.status_vals[i]) {
      free(G.status_vals[i]), G.status_vals[i] = null;
    }
  }
}

export function genl_status_enablefield(fieldidx: number, nm: Ptr | null, fmt: Ptr | null, enable: number): void {
  G.status_fieldfmt[fieldidx] = fmt;
  G.status_fieldnm[fieldidx] = nm;
  G.status_activefields[fieldidx] = enable;
}

export async function genl_status_update(idx: number, ptr: any, chg: number, percent: number, color: number, colormasks: Ptr | null): Promise<void> {
  let newbot1 = new Int8Array(200);
  let newbot2 = new Int8Array(200);
  let cond = 0;
  let condptr = ptr;
  let i = 0;
  let pass = 0;
  let lndelta = 0;
  let idx1 = 0;
  let idx2 = 0;
  let fieldlist = null;
  let nb = null;
  let text = ptr;
  G.windowprocs.wincap2 = (G.windowprocs.wincap2 | WC2_FLUSH_STATUS) >>> 0;
  if (idx >= 0) {
    if (!G.status_activefields[idx]) {
      return;
    }
    switch (idx) {
    case BL_CONDITION:
      cond = condptr ? condptr.a[condptr.o] : 0;
      nb = G.status_vals[idx];
      nb.a[nb.o] = 0;
      if (cond & BL_MASK_STONE) {
        strcpy(nb = eos(nb), S(" Stone"));
      }
      if (cond & BL_MASK_SLIME) {
        strcpy(nb = eos(nb), S(" Slime"));
      }
      if (cond & BL_MASK_STRNGL) {
        strcpy(nb = eos(nb), S(" Strngl"));
      }
      if (cond & BL_MASK_FOODPOIS) {
        strcpy(nb = eos(nb), S(" FoodPois"));
      }
      if (cond & BL_MASK_TERMILL) {
        strcpy(nb = eos(nb), S(" TermIll"));
      }
      if (cond & BL_MASK_BLIND) {
        strcpy(nb = eos(nb), S(" Blind"));
      }
      if (cond & BL_MASK_DEAF) {
        strcpy(nb = eos(nb), S(" Deaf"));
      }
      if (cond & BL_MASK_STUN) {
        strcpy(nb = eos(nb), S(" Stun"));
      }
      if (cond & BL_MASK_CONF) {
        strcpy(nb = eos(nb), S(" Conf"));
      }
      if (cond & BL_MASK_HALLU) {
        strcpy(nb = eos(nb), S(" Hallu"));
      }
      if (cond & BL_MASK_LEV) {
        strcpy(nb = eos(nb), S(" Lev"));
      }
      if (cond & BL_MASK_FLY) {
        strcpy(nb = eos(nb), S(" Fly"));
      }
      if (cond & BL_MASK_RIDE) {
        strcpy(nb = eos(nb), S(" Ride"));
      }
      break;
    default:
      sprintf(G.status_vals[idx], G.status_fieldfmt[idx] ? G.status_fieldfmt[idx] : S("%s"), text ? text : S(""));
      break;
    }
    return;
  }
  if (!(idx === BL_FLUSH || idx === BL_RESET)) {
    return;
  }
  nb = P(newbot1);
  nb.a[nb.o] = 0;
  for (i = 0; (idx1 = genl_status_update$fieldorder[0][i]) !== BL_FLUSH; ++i) {
    if (G.status_activefields[idx1]) {
      strcpy(nb = eos(nb), G.status_vals[idx1]);
    }
  }
  lndelta = (G.status_activefields[BL_GOLD] && strstr(G.status_vals[BL_GOLD], S("\\G")) ? 9 : 0) >>> 0;
  for (pass = 1; pass <= 4; pass = pass + 1 >>> 0) {
    fieldlist = P(genl_status_update$fieldorder[pass]);
    nb = P(newbot2);
    nb.a[nb.o] = 0;
    for (i = 0; (idx2 = fieldlist.a[fieldlist.o + i]) !== BL_FLUSH; ++i) {
      if (G.status_activefields[idx2]) {
        let val = G.status_vals[idx2];
        switch (idx2) {
        case BL_HP:
        case BL_XP:
        case BL_HD:
        case BL_TIME:
          strcpy(nb = eos(nb), S(" "));
          break;
        case BL_LEVELDESC:
          if (i !== 0) {
            strcpy(nb = eos(nb), S(" "));
          }
          break;
        case BL_HUNGER:
          if (strcmp(val, S(" "))) {
            strcpy(nb = eos(nb), S(" "));
          }
          break;
        case BL_CAP:
          if (!strcmp(val, S(" "))) {
            val = val.add(1);
          }
          break;
        default:
          break;
        }
        strcpy(nb = eos(nb), val);
      }
      if (idx2 === BL_CONDITION && pass < 4 && strlen(P(newbot2)) - lndelta > COLNO) {
        break;
      }
    }
    if (idx2 === BL_FLUSH) {
      if (pass > 1) {
        mungspaces(P(newbot2));
      }
      break;
    }
  }
  await G.windowprocs.win_curs(G.WIN_STATUS, 1, 0);
  await G.windowprocs.win_putstr(G.WIN_STATUS, 0, P(newbot1));
  await G.windowprocs.win_curs(G.WIN_STATUS, 1, 1);
  await G.windowprocs.win_putmixed(G.WIN_STATUS, 0, P(newbot2));
}

export function dump_fmtstr(fmt: Ptr | null, buf: Ptr | null, fullsubs: number): Ptr | null {
  let $g = 0;
  let fp = null;
  let bp = null;
  let slen = 0;
  let len = 0;
  let tmpbuf = new Int8Array(256);
  let verbuf = new Int8Array(256);
  let uid = 0;
  let now = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      fp = fmt;
      bp = buf;
      len = 0;
      tmpbuf = new Int8Array(256);
      verbuf = new Int8Array(256);
      now = dumplog_now;
      uid = getuid();
      while (fp && fp.a[fp.o] && len < BUFSZ - 1) {
        if (fp.a[fp.o] === 37) {
          fp = fp.add(1);
          switch (fp.a[fp.o]) {
          default:
            { $g = 1; continue $L; }
          case 0:
          case 37:
            sprintf(P(tmpbuf), S("%%"));
            break;
          case 116:
            if (fullsubs) {
              sprintf(P(tmpbuf), S("%lu"), $u64(G.ubirthday));
            } else {
              strcpy(P(tmpbuf), S("{game start cookie}"));
            }
            break;
          case 84:
            if (fullsubs) {
              sprintf(P(tmpbuf), S("%lu"), $u64(now));
            } else {
              strcpy(P(tmpbuf), S("{current time cookie}"));
            }
            break;
          case 100:
            if (fullsubs) {
              sprintf(P(tmpbuf), S("%08ld%06ld"), yyyymmdd(G.ubirthday), hhmmss(G.ubirthday));
            } else {
              strcpy(P(tmpbuf), S("{game start date+time}"));
            }
            break;
          case 68:
            if (fullsubs) {
              sprintf(P(tmpbuf), S("%08ld%06ld"), yyyymmdd(now), hhmmss(now));
            } else {
              strcpy(P(tmpbuf), S("{current date+time}"));
            }
            break;
          case 118:
            sprintf(P(tmpbuf), S("%s"), version_string(P(verbuf)));
            break;
          case 117:
            sprintf(P(tmpbuf), S("%ld"), uid);
            break;
          case 110:
            if (fullsubs) {
              sprintf(P(tmpbuf), S("%s"), $rd(P(G.plname)) ? P(G.plname) : S("unknown"));
            } else {
              strcpy(P(tmpbuf), S("{hero name}"));
            }
            break;
          case 78:
            if (fullsubs) {
              sprintf(P(tmpbuf), S("%c"), $rd(P(G.plname)) ? $rd(P(G.plname)) : 117);
            } else {
              strcpy(P(tmpbuf), S("{hero initial}"));
            }
            break;
          }
          if (fullsubs) {
            strNsubst(P(tmpbuf), S(" "), S("_"), 0);
            strNsubst(P(tmpbuf), S("/"), S("_"), 0);
            strNsubst(P(tmpbuf), S("\\"), S("_"), 0);
          }
          slen = strlen(P(tmpbuf)) | 0;
          if (len + slen < BUFSZ - 1) {
            len += slen;
            sprintf(bp, S("%s"), P(tmpbuf));
            bp = bp.add(slen);
            if (fp.a[fp.o]) {
              fp = fp.add(1);
            }
          } else {
            break;
          }
        } else {
          bp.a[bp.o] = fp.a[fp.o];
          bp = bp.add(1);
          fp = fp.add(1);
          ++len;
        }
      }
    case 1: // finish
      bp.a[bp.o] = 0;
      return buf;
    }
    break;
  }
}

export function dump_open_log(now: number): void {
  let buf = new Int8Array(256);
  let fname = null;
  dumplog_now = now;
  if (!G.sysopt.dumplogfile) {
    return;
  }
  fname = dump_fmtstr(G.sysopt.dumplogfile, P(buf), TRUE);
  dumplog_file = fopen(fname, S("w"));
  dumplog_windowprocs_backup.$cp(G.windowprocs);
}

export function dump_close_log(): void {
  if (dumplog_file) {
    fclose(dumplog_file);
    dumplog_file = null;
  }
}

export async function dump_forward_putstr(win: number, attr: number, str: Ptr | null, no_forward: number): Promise<void> {
  if (dumplog_file) {
    fprintf(dumplog_file, S("%s\n"), str);
  }
  if (!no_forward) {
    await G.windowprocs.win_putstr(win, attr, str);
  }
}

function dump_putstr(win: number, attr: number, str: Ptr | null): void {
  if (dumplog_file) {
    fprintf(dumplog_file, S("%s\n"), str);
  }
}

function dump_create_nhwindow(dummy: number): number {
  return dummy;
}

function dump_clear_nhwindow(win: number): void {
  return;
}

function dump_display_nhwindow(win: number, p: number): void {
  return;
}

function dump_destroy_nhwindow(win: number): void {
  return;
}

function dump_start_menu(win: number): void {
  return;
}

function dump_add_menu(win: number, glyph: number, identifier: union_any | null, ch: number, gch: number, attr: number, str: Ptr | null, preselected: number): void {
  if (dumplog_file) {
    if (glyph === NO_GLYPH) {
      fprintf(dumplog_file, S(" %s\n"), str);
    } else {
      fprintf(dumplog_file, S("  %c - %s\n"), ch, str);
    }
  }
}

function dump_end_menu(win: number, str: Ptr | null): void {
  if (dumplog_file) {
    if (str) {
      fprintf(dumplog_file, S("%s\n"), str);
    } else {
      fputs(S("\n"), dumplog_file);
    }
  }
}

function dump_select_menu(win: number, how: number, item: Ptr | null): number {
  item.a[item.o] = null;
  return 0;
}

export function dump_redirect(onoff_flag: number): void {
  if (dumplog_file) {
    if (onoff_flag) {
      G.windowprocs.win_create_nhwindow = dump_create_nhwindow;
      G.windowprocs.win_clear_nhwindow = dump_clear_nhwindow;
      G.windowprocs.win_display_nhwindow = dump_display_nhwindow;
      G.windowprocs.win_destroy_nhwindow = dump_destroy_nhwindow;
      G.windowprocs.win_start_menu = dump_start_menu;
      G.windowprocs.win_add_menu = dump_add_menu;
      G.windowprocs.win_end_menu = dump_end_menu;
      G.windowprocs.win_select_menu = dump_select_menu;
      G.windowprocs.win_putstr = dump_putstr;
    } else {
      G.windowprocs.$cp(dumplog_windowprocs_backup);
    }
    G.iflags.in_dumplog = onoff_flag;
  } else {
    G.iflags.in_dumplog = FALSE;
  }
}

export function has_color(color: number): number {
  return G.iflags.wc_color && G.windowprocs.name && (G.windowprocs.wincap & WC_COLOR) >>> 0 && G.windowprocs.has_color[color] ? 1 : 0;
}

export function $init(): void {
  G.windowprocs = new struct_window_procs();
  winchoices = $sarrOf([struct_win_choices.$of(G.tty_procs, win_tty_init), struct_win_choices.$of()]);
  last_winchoice = null;
  hup_procs = struct_window_procs.$of(S("hup"), 0, 0, new Int8Array(16), hup_init_nhwindows, hup_void_ndecl, hup_void_ndecl, hup_void_ndecl, hup_exit_nhwindows, hup_void_fdecl_constchar_p, hup_void_ndecl, hup_create_nhwindow, hup_void_fdecl_winid, hup_display_nhwindow, hup_void_fdecl_winid, hup_curs, hup_putstr, hup_putstr, hup_display_file, hup_void_fdecl_winid, hup_add_menu, hup_end_menu, hup_select_menu, genl_message_menu, hup_void_ndecl, hup_void_ndecl, hup_void_ndecl, hup_cliparound, hup_print_glyph, hup_void_fdecl_constchar_p, hup_void_fdecl_constchar_p, hup_nhgetch, hup_nh_poskey, hup_void_ndecl, hup_int_ndecl, hup_yn_function, hup_getlin, hup_int_ndecl, hup_void_fdecl_int, hup_void_ndecl, hup_void_ndecl, hup_void_ndecl, hup_outrip, genl_preference_update, genl_getmsghistory, genl_putmsghistory, hup_void_ndecl, hup_void_ndecl, genl_status_enablefield, hup_status_update, genl_can_suspend_no);
  previnterface_exit_nhwindows = null;
  G.status_fieldnm = new Array(23).fill(null);
  G.status_fieldfmt = new Array(23).fill(null);
  G.status_vals = new Array(23).fill(null);
  G.status_activefields = new Int8Array(23);
  dumplog_windowprocs_backup = new struct_window_procs();
  dumplog_file = null;
  dumplog_now = 0;
  genl_status_update$fieldorder = $rows([$ta(Int32Array, 15, [BL_TITLE, BL_STR, BL_DX, BL_CO, BL_IN, BL_WI, BL_CH, BL_ALIGN, BL_SCORE, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH, BL_FLUSH]),
$ta(Int32Array, 15, [BL_LEVELDESC, BL_GOLD, BL_HP, BL_HPMAX, BL_ENE, BL_ENEMAX, BL_AC, BL_XP, BL_EXP, BL_HD, BL_TIME, BL_HUNGER, BL_CAP, BL_CONDITION, BL_FLUSH]),
$ta(Int32Array, 15, [BL_LEVELDESC, BL_GOLD, BL_HP, BL_HPMAX, BL_ENE, BL_ENEMAX, BL_AC, BL_XP, BL_EXP, BL_HD, BL_HUNGER, BL_CAP, BL_CONDITION, BL_TIME, BL_FLUSH]),
$ta(Int32Array, 15, [BL_LEVELDESC, BL_GOLD, BL_HP, BL_HPMAX, BL_ENE, BL_ENEMAX, BL_AC, BL_HUNGER, BL_CAP, BL_CONDITION, BL_XP, BL_EXP, BL_HD, BL_TIME, BL_FLUSH]),
$ta(Int32Array, 15, [BL_HP, BL_HPMAX, BL_ENE, BL_ENEMAX, BL_AC, BL_HUNGER, BL_CAP, BL_CONDITION, BL_LEVELDESC, BL_GOLD, BL_XP, BL_EXP, BL_HD, BL_TIME, BL_FLUSH])]);
}
