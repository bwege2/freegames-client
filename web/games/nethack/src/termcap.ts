// @ts-nocheck
// NetHack 3.6.7 ../win/tty/termcap.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { digit } from './hacklib.ts';
import { error } from './unixtty.ts';
import { setclipped, tty_curs, tty_raw_print, tty_wait_synch } from './wintty.ts';
import { anon_termcap_c_870, struct_tc_lcl_data } from './structs.ts';
import { $cs, $peq, $sarrOf, $ta, $u64, G, P, R, S, fflush, free, getenv, putchar, strcat, strcpy, strlen, strncmp, strncpy, tgetent, tgetflag, tgetnum, tgetstr, tgoto, tparm, tputs, usleep } from './rt/index.ts';
import { ATR_BLINK, BUFSZ, CLR_BLACK, CLR_BLUE, CLR_BRIGHT_BLUE, CLR_BRIGHT_CYAN, CLR_BRIGHT_GREEN, CLR_BRIGHT_MAGENTA, CLR_BROWN, CLR_CYAN, CLR_GRAY, CLR_GREEN, CLR_MAGENTA, CLR_MAX, CLR_ORANGE, CLR_RED, CLR_WHITE, CLR_YELLOW, COLNO, COLOR_BLACK, COLOR_BLUE, COLOR_CYAN, COLOR_GREEN, COLOR_MAGENTA, COLOR_RED, COLOR_WHITE, COLOR_YELLOW, FALSE, HL_BLINK, HL_BOLD, HL_DIM, HL_ULINE, NO_COLOR, ROWNO, TRUE } from './consts.ts';

let HO: Ptr | null;
let CL: Ptr | null;
let CE: Ptr | null;
let UP: Ptr | null;
let XD: Ptr | null;
let BC: Ptr | null;
let SO: Ptr | null;
let SE: Ptr | null;
let TI: Ptr | null;
let TE: Ptr | null;
let VS: Ptr | null;
let VE: Ptr | null;
let ME: Ptr | null;
let MR: Ptr | null;
let MB: Ptr | null;
let MH: Ptr | null;
let MD: Ptr | null;
let SG: number;
let PC: number;
let tbuf: any;
let KS: Ptr | null;
let KE: Ptr | null;
let nullstr: any;
let tmspc10: any;
let nilstring: any;
let nulstr: any;
let tty_decgraphics_termcap_fixup$ctrlN: any;
let tty_decgraphics_termcap_fixup$ctrlO: any;
let tty_decgraphics_termcap_fixup$appMode: any;
let tty_decgraphics_termcap_fixup$numMode: any;

export async function tty_startup(wid: Ptr | null, hgt: Ptr | null): Promise<void> {
  let i = 0;
  let term = null;
  let tptr = null;
  const tbufptr = [null];
  let pc = null;
  term = getenv(S("TERM"));
  if (!term) {
    await error(S("Can't get TERM."));
  }
  tptr = P(new Int8Array(1024));
  tbufptr[0] = P(tbuf);
  if (!strncmp(term, S("5620"), 4)) {
    G.flags.null = FALSE;
  }
  if (tgetent(tptr, term) < 1) {
    let buf = new Int8Array(256);
    strncpy(P(buf), term, BUFSZ - 1 - 27);
    buf[BUFSZ - 1] = 0;
    await error(S("Unknown terminal type: %s."), term);
  }
  if (!!(pc = tgetstr(S("pc"), P(tbufptr, 0)))) {
    PC = pc.a[pc.o];
  }
  if (!(BC = tgetstr(S("le"), P(tbufptr, 0)))) {
    await error(S("Terminal must backspace."));
  }
  HO = tgetstr(S("ho"), P(tbufptr, 0));
  if (!G.tc_gbl_data.tc_CO) {
    G.tc_gbl_data.tc_CO = tgetnum(S("co"));
  }
  if (!G.tc_gbl_data.tc_LI) {
    G.tc_gbl_data.tc_LI = tgetnum(S("li"));
  }
  if (G.tc_gbl_data.tc_CO < COLNO || G.tc_gbl_data.tc_LI < ROWNO + 3) {
    setclipped();
  }
  G.tc_lcl_data.tc_ND = tgetstr(S("nd"), P(tbufptr, 0));
  if (tgetflag(S("os"))) {
    await error(S("NetHack can't have OS."));
  }
  if (tgetflag(S("ul"))) {
    G.tc_lcl_data.tc_ul_hack = TRUE;
  }
  CE = tgetstr(S("ce"), P(tbufptr, 0));
  UP = tgetstr(S("up"), P(tbufptr, 0));
  XD = tgetstr(S("xd"), P(tbufptr, 0));
  if (!(G.tc_lcl_data.tc_CM = tgetstr(S("cm"), P(tbufptr, 0)))) {
    if (!UP && !HO) {
      await error(S("NetHack needs CM or UP or HO."));
    }
    tty_raw_print(S("Playing NetHack on terminals without CM is suspect."));
    await tty_wait_synch();
  }
  SO = tgetstr(S("so"), P(tbufptr, 0));
  SE = tgetstr(S("se"), P(tbufptr, 0));
  G.tc_lcl_data.tc_US = tgetstr(S("us"), P(tbufptr, 0));
  G.tc_lcl_data.tc_UE = tgetstr(S("ue"), P(tbufptr, 0));
  SG = tgetnum(S("sg"));
  if (!SO || !SE || SG > 0) {
    SO = SE = G.tc_lcl_data.tc_US = G.tc_lcl_data.tc_UE = P(nullstr);
  }
  TI = tgetstr(S("ti"), P(tbufptr, 0));
  TE = tgetstr(S("te"), P(tbufptr, 0));
  VS = VE = P(nullstr);
  VS = tgetstr(S("eA"), P(tbufptr, 0));
  KS = tgetstr(S("ks"), P(tbufptr, 0));
  KE = tgetstr(S("ke"), P(tbufptr, 0));
  MR = tgetstr(S("mr"), P(tbufptr, 0));
  MB = tgetstr(S("mb"), P(tbufptr, 0));
  MD = tgetstr(S("md"), P(tbufptr, 0));
  MH = tgetstr(S("mh"), P(tbufptr, 0));
  ME = tgetstr(S("me"), P(tbufptr, 0));
  if (!ME) {
    ME = SE ? SE : P(nullstr);
  }
  for (i = 0; digit(SO.a[SO.o + i]); ++i) {
    continue;
  }
  G.tc_lcl_data.tc_HI = await dupstr(SO.add(i));
  for (i = 0; digit(ME.a[ME.o + i]); ++i) {
    continue;
  }
  G.tc_lcl_data.tc_HE = await dupstr(ME.add(i));
  G.dynamic_HIHE = TRUE;
  G.tc_gbl_data.tc_AS = tgetstr(S("as"), P(tbufptr, 0));
  G.tc_gbl_data.tc_AE = tgetstr(S("ae"), P(tbufptr, 0));
  G.tc_lcl_data.tc_CD = tgetstr(S("cd"), P(tbufptr, 0));
  await init_hilite();
  wid.a[wid.o] = G.tc_gbl_data.tc_CO;
  hgt.a[hgt.o] = G.tc_gbl_data.tc_LI;
  if (!(CL = tgetstr(S("cl"), P(tbufptr, 0)))) {
    await error(S("NetHack needs CL."));
  }
  if ((tbufptr[0].o - P(tbuf).o | 0) > 512) {
    await error(S("TERMCAP entry too big...\n"));
  }
  free(tptr);
}

export function tty_shutdown(): void {
  kill_hilite();
  if (G.dynamic_HIHE) {
    free(G.tc_lcl_data.tc_HI), G.tc_lcl_data.tc_HI = null;
    free(G.tc_lcl_data.tc_HE), G.tc_lcl_data.tc_HE = null;
    G.dynamic_HIHE = FALSE;
  }
  return;
}

export function tty_number_pad(state: number): void {
  switch (state) {
  case -1:
    if (KS && KS.a[KS.o]) {
      xputs(KS);
    }
    break;
  case 1:
    if (KE && KE.a[KE.o]) {
      xputs(KE);
    }
    break;
  case 0:
  default:
    break;
  }
}

function tty_decgraphics_termcap_fixup(): void {
  if (!G.tc_gbl_data.tc_AS) {
    G.tc_gbl_data.tc_AS = P(tty_decgraphics_termcap_fixup$ctrlN);
  }
  if (!G.tc_gbl_data.tc_AE) {
    G.tc_gbl_data.tc_AE = P(tty_decgraphics_termcap_fixup$ctrlO);
  }
  if (!KS) {
    KS = P(tty_decgraphics_termcap_fixup$appMode);
  }
  if (!KE) {
    KE = P(tty_decgraphics_termcap_fixup$numMode);
  }
  if (G.symset[G.currentgraphics].handling === 2) {
    xputs(S("\x1b)0"));
  }
  {
    let nh_he = G.tc_lcl_data.tc_HE;
    let ae = G.tc_gbl_data.tc_AE;
    let he_limit = 0;
    let ae_length = 0;
    if (digit(ae.a[ae.o])) {
      do {
        ae = ae.add(1);
      } while (digit(ae.a[ae.o]));
      if (ae.a[ae.o] === 46) {
        ae = ae.add(1);
        if (digit(ae.a[ae.o])) {
          ae = ae.add(1);
        }
      }
      if (ae.a[ae.o] === 42) {
        ae = ae.add(1);
      }
    }
    ae_length = strlen(ae) | 0, he_limit = strlen(nh_he) | 0;
    while (he_limit >= ae_length) {
      if (strncmp(nh_he, ae, $u64(ae_length)) === 0) {
        G.HE_resets_AS = TRUE;
        break;
      }
      nh_he = nh_he.add(1), --he_limit;
    }
  }
}

export function tty_start_screen(): void {
  xputs(TI);
  xputs(VS);
  if (G.symset[G.currentgraphics].handling === 2) {
    tty_decgraphics_termcap_fixup();
  }
  G.decgraphics_mode_callback = tty_decgraphics_termcap_fixup;
  if (G.Cmd.num_pad) {
    tty_number_pad(1);
  }
}

export async function tty_end_screen(): Promise<void> {
  await clear_screen();
  xputs(VE);
  xputs(TE);
}

export async function nocmov(x: number, y: number): Promise<void> {
  if (G.ttyDisplay.cury > y) {
    if (UP) {
      while (G.ttyDisplay.cury > y) {
        xputs(UP);
        G.ttyDisplay.cury = G.ttyDisplay.cury - 1 << 16 >> 16;
      }
    } else if (G.tc_lcl_data.tc_CM) {
      cmov(x, y);
    } else if (HO) {
      await home();
      await tty_curs(G.BASE_WINDOW, x + 1, y);
    }
  } else if (G.ttyDisplay.cury < y) {
    if (XD) {
      while (G.ttyDisplay.cury < y) {
        xputs(XD);
        G.ttyDisplay.cury = G.ttyDisplay.cury + 1 << 16 >> 16;
      }
    } else if (G.tc_lcl_data.tc_CM) {
      cmov(x, y);
    } else {
      while (G.ttyDisplay.cury < y) {
        xputc(10);
        G.ttyDisplay.curx = 0;
        G.ttyDisplay.cury = G.ttyDisplay.cury + 1 << 16 >> 16;
      }
    }
  }
  if (G.ttyDisplay.curx < x) {
    if (!G.tc_lcl_data.tc_ND) {
      cmov(x, y);
    } else {
      while (G.ttyDisplay.curx < x) {
        xputs(G.tc_lcl_data.tc_ND);
        G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
      }
    }
  } else if (G.ttyDisplay.curx > x) {
    while (G.ttyDisplay.curx > x) {
      xputs(BC);
      G.ttyDisplay.curx = G.ttyDisplay.curx - 1 << 16 >> 16;
    }
  }
}

export function cmov(x: number, y: number): void {
  xputs(tgoto(G.tc_lcl_data.tc_CM, x, y));
  G.ttyDisplay.cury = y << 16 >> 16;
  G.ttyDisplay.curx = x << 16 >> 16;
}

export function xputc(c: number): number {
  return putchar(c);
}

export function xputs(s: Ptr | null): void {
  tputs(s, 1, xputc);
}

export async function cl_end(): Promise<void> {
  if (CE) {
    xputs(CE);
  } else {
    let cx = G.ttyDisplay.curx + 1;
    while (cx < G.tc_gbl_data.tc_CO) {
      xputc(32);
      ++cx;
    }
    await tty_curs(G.BASE_WINDOW, G.ttyDisplay.curx + 1, G.ttyDisplay.cury);
  }
}

export async function clear_screen(): Promise<void> {
  if (CL) {
    xputs(CL);
    await home();
  }
}

export async function home(): Promise<void> {
  if (HO) {
    xputs(HO);
  } else if (G.tc_lcl_data.tc_CM) {
    xputs(tgoto(G.tc_lcl_data.tc_CM, 0, 0));
  } else {
    await tty_curs(G.BASE_WINDOW, 1, 0);
  }
  G.ttyDisplay.curx = G.ttyDisplay.cury = 0;
}

export function standoutbeg(): void {
  if (SO) {
    xputs(SO);
  }
}

export function standoutend(): void {
  if (SE) {
    xputs(SE);
  }
}

export function backsp(): void {
  xputs(BC);
}

export function tty_nhbell(): void {
  if (G.flags.silent) {
    return;
  }
  putchar(7);
  fflush(R.stdout);
}

export function graph_on(): void {
  if (G.tc_gbl_data.tc_AS) {
    xputs(G.tc_gbl_data.tc_AS);
  }
}

export function graph_off(): void {
  if (G.tc_gbl_data.tc_AE) {
    xputs(G.tc_gbl_data.tc_AE);
  }
}

export async function tty_delay_output(): Promise<void> {
  if (G.iflags.debug_fuzzer) {
    return;
  }
  if (G.flags.nap) {
    fflush(R.stdout);
    await usleep(50 * 1000);
    return;
  }
  if (G.flags.null) {
    tputs(S("$<50>"), 1, xputc);
  } else if (R.ospeed > 0 && R.ospeed < (Math.trunc(30 / 2) | 0) && G.tc_lcl_data.tc_CM) {
    let cmlen = strlen(tgoto(G.tc_lcl_data.tc_CM, G.ttyDisplay.curx, G.ttyDisplay.cury)) | 0;
    let i = 500 + (tmspc10[R.ospeed] / 2 | 0);
    while (i > 0) {
      cmov(G.ttyDisplay.curx, G.ttyDisplay.cury);
      i -= Math.imul(cmlen, tmspc10[R.ospeed]);
    }
  }
}

export async function cl_eos(): Promise<void> {
  if (G.tc_lcl_data.tc_CD) {
    xputs(G.tc_lcl_data.tc_CD);
  } else {
    let cy = G.ttyDisplay.cury + 1;
    while (cy <= G.tc_gbl_data.tc_LI - 2) {
      await cl_end();
      xputc(10);
      ++cy;
    }
    await cl_end();
    await tty_curs(G.BASE_WINDOW, G.ttyDisplay.curx + 1, G.ttyDisplay.cury);
  }
}

async function init_hilite(): Promise<void> {
  let c = 0;
  let setf = null;
  let scratch = null;
  let md_len = 0;
  if (tgetnum(S("Co")) < 8 || !MD || strlen(MD) === 0 || !(setf = tgetstr(S("AF"), null)) && !(setf = tgetstr(S("Sf"), null))) {
    G.hilites[CLR_BLACK] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_RED] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_GREEN] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_BROWN] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_BLUE] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_MAGENTA] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_CYAN] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_GRAY] = P(nilstring);
    G.hilites[NO_COLOR] = P(nilstring);
    G.hilites[CLR_ORANGE] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_BRIGHT_GREEN] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_YELLOW] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_BRIGHT_BLUE] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_BRIGHT_MAGENTA] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_BRIGHT_CYAN] = G.tc_lcl_data.tc_HI;
    G.hilites[CLR_WHITE] = G.tc_lcl_data.tc_HI;
    return;
  }
  md_len = strlen(MD) | 0;
  c = 6;
  while (c--) {
    let work = null;
    scratch = tparm(setf, G.ti_map[c].ti_color);
    work = P(new Int8Array((strlen(scratch) + $u64(md_len) + 1 >>> 0)));
    strcpy(work, MD);
    G.hilites[G.ti_map[c].nh_bright_color] = work;
    work = work.add(md_len);
    strcpy(work, scratch);
    G.hilites[G.ti_map[c].nh_color] = work;
  }
  scratch = tparm(setf, COLOR_WHITE);
  G.hilites[CLR_WHITE] = P(new Int8Array((strlen(scratch) + $u64(md_len) + 1 >>> 0)));
  strcpy(G.hilites[CLR_WHITE], MD);
  strcat(G.hilites[CLR_WHITE], scratch);
  G.hilites[CLR_GRAY] = P(nilstring);
  G.hilites[NO_COLOR] = P(nilstring);
  if (G.iflags.wc2_darkgray) {
    scratch = tparm(setf, COLOR_BLACK);
    G.hilites[CLR_BLACK] = P(new Int8Array((strlen(scratch) + $u64(md_len) + 1 >>> 0)));
    strcpy(G.hilites[CLR_BLACK], MD);
    strcat(G.hilites[CLR_BLACK], scratch);
  } else {
    G.hilites[CLR_BLACK] = G.hilites[CLR_BLUE];
  }
}

function kill_hilite(): void {
  if ($peq(G.hilites[CLR_BLACK], G.tc_lcl_data.tc_HI)) {
    return;
  }
  if (!$peq(G.hilites[CLR_BLACK], G.hilites[CLR_BLUE])) {
    free(G.hilites[CLR_BLACK]);
  }
  free(G.hilites[CLR_BRIGHT_BLUE]);
  free(G.hilites[CLR_BRIGHT_GREEN]);
  free(G.hilites[CLR_BRIGHT_CYAN]);
  free(G.hilites[CLR_YELLOW]);
  free(G.hilites[CLR_ORANGE]);
  free(G.hilites[CLR_BRIGHT_MAGENTA]);
  free(G.hilites[CLR_WHITE]);
}

function s_atr2str(n: number): Ptr | null {
  switch (n) {
  case 5:
  case 4:
    if (n === ATR_BLINK) {
      if (MB && MB.a[MB.o]) {
        return MB;
      }
    } else {
      if (G.tc_lcl_data.tc_US && G.tc_lcl_data.tc_US.a[G.tc_lcl_data.tc_US.o]) {
        return G.tc_lcl_data.tc_US;
      }
    }
  case 1:
    if (MD && MD.a[MD.o]) {
      return MD;
    }
    if (G.tc_lcl_data.tc_HI && G.tc_lcl_data.tc_HI.a[G.tc_lcl_data.tc_HI.o]) {
      return G.tc_lcl_data.tc_HI;
    }
    break;
  case 7:
    if (MR && MR.a[MR.o]) {
      return MR;
    }
    break;
  case 2:
    if (MH && MH.a[MH.o]) {
      return MH;
    }
    break;
  }
  return P(nulstr);
}

function e_atr2str(n: number): Ptr | null {
  switch (n) {
  case 4:
    if (G.tc_lcl_data.tc_UE && G.tc_lcl_data.tc_UE.a[G.tc_lcl_data.tc_UE.o]) {
      return G.tc_lcl_data.tc_UE;
    }
  case 1:
  case 5:
    if (G.tc_lcl_data.tc_HE && G.tc_lcl_data.tc_HE.a[G.tc_lcl_data.tc_HE.o]) {
      return G.tc_lcl_data.tc_HE;
    }
  case 2:
  case 7:
    if (ME && ME.a[ME.o]) {
      return ME;
    }
    break;
  }
  return P(nulstr);
}

export function term_attr_fixup(msk: number): number {
  if (msk & HL_ULINE && (!G.tc_lcl_data.tc_US || !G.tc_lcl_data.tc_US.a[G.tc_lcl_data.tc_US.o])) {
    msk |= HL_BOLD;
    msk &= ~HL_ULINE;
  }
  if (msk & HL_BLINK && (!MB || !MB.a[MB.o])) {
    msk |= HL_BOLD;
    msk &= ~HL_BLINK;
  }
  if (msk & HL_DIM && (!MH || !MH.a[MH.o])) {
    msk &= ~HL_DIM;
  }
  return msk;
}

export function term_start_attr(attr: number): void {
  if (attr) {
    let astr = s_atr2str(attr);
    if (astr && astr.a[astr.o]) {
      xputs(astr);
    }
  }
}

export function term_end_attr(attr: number): void {
  if (attr) {
    let astr = e_atr2str(attr);
    if (astr && astr.a[astr.o]) {
      xputs(astr);
    }
  }
}

export function term_start_raw_bold(): void {
  xputs(G.tc_lcl_data.tc_HI);
}

export function term_end_raw_bold(): void {
  xputs(G.tc_lcl_data.tc_HE);
}

export function term_end_color(): void {
  xputs(G.tc_lcl_data.tc_HE);
}

export function term_start_color(color: number): void {
  if (color < CLR_MAX) {
    xputs(G.hilites[color]);
  }
}

export function $init(): void {
  G.tc_lcl_data = struct_tc_lcl_data.$of();
  HO = null;
  CL = null;
  CE = null;
  UP = null;
  XD = null;
  BC = null;
  SO = null;
  SE = null;
  TI = null;
  TE = null;
  VS = null;
  VE = null;
  ME = null;
  MR = null;
  MB = null;
  MH = null;
  MD = null;
  G.dynamic_HIHE = 0;
  SG = 0;
  PC = 0;
  tbuf = new Int8Array(512);
  G.hilites = new Array(16).fill(null);
  KS = null;
  KE = null;
  nullstr = $cs("", 1);
  tmspc10 = $ta(Int16Array, 15, [0, 2000, 1333, 909, 743, 666, 500, 333, 166, 83, 55, 41, 20, 10, 5]);
  G.ti_map = $sarrOf([anon_termcap_c_870.$of(COLOR_RED, CLR_RED, CLR_ORANGE),
anon_termcap_c_870.$of(COLOR_GREEN, CLR_GREEN, CLR_BRIGHT_GREEN),
anon_termcap_c_870.$of(COLOR_YELLOW, CLR_BROWN, CLR_YELLOW),
anon_termcap_c_870.$of(COLOR_BLUE, CLR_BLUE, CLR_BRIGHT_BLUE),
anon_termcap_c_870.$of(COLOR_MAGENTA, CLR_MAGENTA, CLR_BRIGHT_MAGENTA),
anon_termcap_c_870.$of(COLOR_CYAN, CLR_CYAN, CLR_BRIGHT_CYAN)]);
  nilstring = $cs("", 1);
  nulstr = $cs("", 1);
  tty_decgraphics_termcap_fixup$ctrlN = $cs("\x0e", 2);
  tty_decgraphics_termcap_fixup$ctrlO = $cs("\x0f", 2);
  tty_decgraphics_termcap_fixup$appMode = $cs("\x1b=", 3);
  tty_decgraphics_termcap_fixup$numMode = $cs("\x1b>", 3);
}
