// @ts-nocheck
// NetHack 3.6.7 pline.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { flush_screen } from './display.ts';
import { is_fainted } from './eat.ts';
import { panic } from './end.ts';
import { config_erradd, paniclog } from './files.ts';
import { msgtype_type } from './options.ts';
import { unconscious } from './trap.ts';
import { vision_recalc } from './vision.ts';
import { $peq, $u64, G, P, S, VaList, free, strcat, strchr, strcmp, strcpy, strlen, strncpy, vsnprintf } from './rt/index.ts';
import { ATR_NOHISTORY, ATR_NONE, ATR_URGENT, BLINDED, BUFSZ, DEAF, DUMPLOG_MSG_COUNT, FALSE, MSGTYP_NOREP, MSGTYP_NORMAL, MSGTYP_NOSHOW, MSGTYP_STOP, OVERRIDE_MSGTYPE, PLINE_NOREPEAT, PLNMSG_UNKNOWN, SUPPRESS_HISTORY, TRUE, URGENT_MESSAGE, WC2_SUPPRESS_HIST, WC2_URGENT_MESG } from './consts.ts';

let pline_flags: number;
let prevmsg: any;
let you_buf: Ptr | null;
let you_buf_siz: number;
let vpline$in_pline: number;

export async function dumplogmsg(line: Ptr | null): Promise<void> {
  let indx = G.saved_pline_index;
  let oldest = G.saved_plines[indx];
  if (oldest && strlen(oldest) >= strlen(line)) {
    strcpy(oldest, line);
  } else {
    if (oldest) {
      free(oldest);
    }
    G.saved_plines[indx] = await dupstr(line);
  }
  G.saved_pline_index = (indx + 1 >>> 0) % DUMPLOG_MSG_COUNT;
}

export function dumplogfreemessages(): void {
  let indx = 0;
  for (indx = 0; indx < DUMPLOG_MSG_COUNT; indx = indx + 1 >>> 0) {
    if (G.saved_plines[indx]) {
      free(G.saved_plines[indx]), G.saved_plines[indx] = null;
    }
  }
  G.saved_pline_index = 0;
}

async function putmesg(line: Ptr | null): Promise<void> {
  let attr = ATR_NONE;
  if ((pline_flags & URGENT_MESSAGE) >>> 0 !== 0 && (G.windowprocs.wincap2 & WC2_URGENT_MESG) >>> 0 !== 0) {
    attr |= ATR_URGENT;
  }
  if ((pline_flags & SUPPRESS_HISTORY) >>> 0 !== 0 && (G.windowprocs.wincap2 & WC2_SUPPRESS_HIST) >>> 0 !== 0) {
    attr |= ATR_NOHISTORY;
  }
  await G.windowprocs.win_putstr(G.WIN_MESSAGE, attr, line);
}

export async function pline(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    await vpline(line, the_args);
    undefined;
  }
  ;
}

async function vpline(line: Ptr | null, the_args: Ptr | null): Promise<void> {
  let $g = 0;
  let pbuf = new Int8Array(1280);
  let ln = 0;
  let msgtyp = 0;
  let vlen = 0;
  let no_repeat = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      pbuf = new Int8Array(1280);
      vlen = 0;
      if (!line || !line.a[line.o]) {
        return;
      }
      if (G.program_state.done_hup) {
        return;
      }
      if (G.program_state.wizkit_wishing) {
        return;
      }
      if (strchr(line, 37)) {
        vlen = vsnprintf(P(pbuf), 1280, line, the_args);
        line = P(pbuf);
      }
      if ((ln = strlen(line) | 0) > BUFSZ - 1) {
        if (!$peq(line, P(pbuf))) {
          strncpy(P(pbuf), line, BUFSZ - 1);
        }
        strncpy(P(pbuf).add(BUFSZ).add(-1).add(-6), S("..."), 3);
        pbuf[BUFSZ - 1 - 3] = line.a[line.o + (ln - 3)];
        pbuf[BUFSZ - 1 - 2] = line.a[line.o + (ln - 2)];
        pbuf[BUFSZ - 1 - 1] = line.a[line.o + (ln - 1)];
        pbuf[BUFSZ - 1] = 0;
        line = P(pbuf);
      }
      if ((pline_flags & SUPPRESS_HISTORY) >>> 0 === 0) {
        await dumplogmsg(line);
      }
      if (vpline$in_pline++ || !G.iflags.window_inited) {
        G.windowprocs.win_raw_print(line);
        G.iflags.last_msg = PLNMSG_UNKNOWN;
        { $g = 1; continue $L; }
      }
      msgtyp = MSGTYP_NORMAL;
      no_repeat = ((pline_flags & PLINE_NOREPEAT) >>> 0 ? TRUE : FALSE) << 24 >> 24;
      if ((pline_flags & OVERRIDE_MSGTYPE) >>> 0 === 0) {
        msgtyp = msgtype_type(line, no_repeat);
        if ((pline_flags & URGENT_MESSAGE) >>> 0 === 0 && (msgtyp === MSGTYP_NOSHOW || msgtyp === MSGTYP_NOREP && !strcmp(line, P(prevmsg)))) {
          { $g = 1; continue $L; }
        }
      }
      if (G.vision_full_recalc) {
        await vision_recalc(0);
      }
      if (G.u.ux) {
        await flush_screen(1);
      }
      await putmesg(line);
      G.iflags.last_msg = PLNMSG_UNKNOWN;
      strncpy(P(prevmsg), line, BUFSZ), prevmsg[BUFSZ - 1] = 0;
      if (msgtyp === MSGTYP_STOP) {
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
      }
    case 1: // pline_done
      --vpline$in_pline;
      return;
    }
    break;
  }
}

export async function custompline(pflags: number, line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    pline_flags = pflags;
    await vpline(line, the_args);
    pline_flags = 0;
    undefined;
  }
  ;
  return;
}

export async function Norep(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    pline_flags = PLINE_NOREPEAT;
    await vpline(line, the_args);
    pline_flags = 0;
    undefined;
  }
  ;
  return;
}

async function You_buf(siz: number): Promise<Ptr | null> {
  if (siz > you_buf_siz) {
    if (you_buf) {
      free(you_buf);
    }
    you_buf_siz = siz + 10;
    you_buf = P(new Int8Array((you_buf_siz >>> 0)));
  }
  return you_buf;
}

export function free_youbuf(): void {
  if (you_buf) {
    free(you_buf), you_buf = null;
  }
  you_buf_siz = 0;
}

export async function You(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    await vpline(strcat((strcpy(tmp = await You_buf(strlen(line) + 5 | 0), S("You ")), tmp), line), the_args);
    undefined;
  }
  ;
}

export async function Your(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    await vpline(strcat((strcpy(tmp = await You_buf(strlen(line) + 6 | 0), S("Your ")), tmp), line), the_args);
    undefined;
  }
  ;
}

export async function You_feel(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    if (G.multi < 0 && (unconscious() || is_fainted())) {
      strcpy(tmp = await You_buf(strlen(line) + 25 | 0), S("You dream that you feel "));
    } else {
      strcpy(tmp = await You_buf(strlen(line) + 10 | 0), S("You feel "));
    }
    await vpline(strcat(tmp, line), the_args);
    undefined;
  }
  ;
}

export async function You_cant(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    await vpline(strcat((strcpy(tmp = await You_buf(strlen(line) + 11 | 0), S("You can't ")), tmp), line), the_args);
    undefined;
  }
  ;
}

export async function pline_The(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    await vpline(strcat((strcpy(tmp = await You_buf(strlen(line) + 5 | 0), S("The ")), tmp), line), the_args);
    undefined;
  }
  ;
}

export async function There(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    await vpline(strcat((strcpy(tmp = await You_buf(strlen(line) + 7 | 0), S("There ")), tmp), line), the_args);
    undefined;
  }
  ;
}

export async function You_hear(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic || !G.flags.acoustics) {
      return;
    }
    the_args = new VaList($va);
    ;
    if (G.u.uinwater) {
      strcpy(tmp = await You_buf(strlen(line) + 17 | 0), S("You barely hear "));
    } else if (G.multi < 0 && (unconscious() || is_fainted())) {
      strcpy(tmp = await You_buf(strlen(line) + 25 | 0), S("You dream that you hear "));
    } else {
      strcpy(tmp = await You_buf(strlen(line) + 10 | 0), S("You hear "));
    }
    await vpline(strcat(tmp, line), the_args);
    undefined;
  }
  ;
}

export async function You_see(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    if (G.multi < 0 && (unconscious() || is_fainted())) {
      strcpy(tmp = await You_buf(strlen(line) + 24 | 0), S("You dream that you see "));
    } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      strcpy(tmp = await You_buf(strlen(line) + 11 | 0), S("You sense "));
    } else {
      strcpy(tmp = await You_buf(strlen(line) + 9 | 0), S("You see "));
    }
    await vpline(strcat(tmp, line), the_args);
    undefined;
  }
  ;
}

export async function verbalize(line: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let tmp = null;
    the_args = new VaList($va);
    ;
    tmp = await You_buf($u64(strlen(line) | 0) + 3 | 0);
    strcpy(tmp, S("\""));
    strcat(tmp, line);
    strcat(tmp, S("\""));
    await vpline(tmp, the_args);
    undefined;
  }
  ;
}

export function raw_printf(line: Ptr | null, ...$va: any[]): void {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    vraw_printf(line, the_args);
    undefined;
  }
  ;
}

function vraw_printf(line: Ptr | null, the_args: Ptr | null): void {
  let pbuf = new Int8Array(1280);
  if (strchr(line, 37)) {
    vsnprintf(P(pbuf), 1280, line, the_args);
    line = P(pbuf);
  }
  if ((strlen(line) | 0) > BUFSZ - 1) {
    if (!$peq(line, P(pbuf))) {
      line = strncpy(P(pbuf), line, BUFSZ - 1);
    }
    pbuf[BUFSZ - 1] = 0;
  }
  G.windowprocs.win_raw_print(line);
}

export async function impossible(s: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    let pbuf = new Int8Array(1280);
    the_args = new VaList($va);
    ;
    if (G.program_state.in_impossible) {
      await panic(S("impossible called impossible"));
    }
    G.program_state.in_impossible = 1;
    vsnprintf(P(pbuf), 1280, s, the_args);
    pbuf[BUFSZ - 1] = 0;
    paniclog(S("impossible"), P(pbuf));
    if (G.iflags.debug_fuzzer) {
      await panic(S("%s"), P(pbuf));
    }
    await pline(S("%s"), P(pbuf));
    strcpy(P(pbuf), S("Program in disorder!"));
    if (G.program_state.something_worth_saving) {
      strcat(P(pbuf), S("  (Saving and reloading may fix this problem.)"));
    }
    await pline(S("%s"), P(pbuf));
    G.program_state.in_impossible = 0;
    undefined;
  }
  ;
}

export async function config_error_add(str: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    await vconfig_error_add(str, the_args);
    undefined;
  }
  ;
}

async function vconfig_error_add(str: Ptr | null, the_args: Ptr | null): Promise<void> {
  let vlen = 0;
  let buf = new Int8Array(1280);
  vlen = vsnprintf(P(buf), 1280, str, the_args);
  buf[BUFSZ - 1] = 0;
  await config_erradd(P(buf));
}

export function $init(): void {
  pline_flags = 0;
  prevmsg = new Int8Array(256);
  G.saved_pline_index = 0;
  G.saved_plines = [null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
  you_buf = null;
  you_buf_siz = 0;
  vpline$in_pline = 0;
}
