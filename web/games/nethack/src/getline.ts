// @ts-nocheck
// NetHack 3.6.7 ../win/tty/getline.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { extcmd_via_menu, pgetchar, savech } from './cmd.ts';
import { eos, mungspaces, strncmpi } from './hacklib.ts';
import { custompline, dumplogmsg, pline } from './pline.ts';
import { tty_nhbell } from './termcap.ts';
import { addtopl, more, putsyms, tty_doprev_message } from './topl.ts';
import { tty_clear_nhwindow, tty_nhgetch } from './wintty.ts';
import { $peq, $rd, $wr, G, P, R, S, fflush, strcat, strchr, strcpy, strlen } from './rt/index.ts';
import { AUTOCOMPLETE, BUFSZ, CMD_NOT_AVAILABLE, COLNO, EOF, FALSE, OVERRIDE_MSGTYPE, SUPPRESS_HISTORY, TRUE, WIN_STOP, WIZMODECMD } from './consts.ts';

let suppress_history: number;

export async function tty_getlin(query: Ptr | null, bufp: Ptr | null): Promise<void> {
  suppress_history = FALSE;
  await hooked_tty_getlin(query, bufp, null);
}

async function hooked_tty_getlin(query: Ptr | null, bufp: Ptr | null, hook: Function | null): Promise<void> {
  let obufp = bufp;
  let c = 0;
  let cw = G.wins[G.WIN_MESSAGE];
  let doprev = 0;
  if (G.ttyDisplay.toplin === 1 && !(cw.flags & WIN_STOP)) {
    await more();
  }
  cw.flags &= ~WIN_STOP;
  G.ttyDisplay.toplin = 3;
  ++G.ttyDisplay.inread;
  await custompline(OVERRIDE_MSGTYPE | SUPPRESS_HISTORY, S("%s "), query);
  bufp.a[bufp.o] = 0;
  for (; ; ) {
    fflush(R.stdout);
    strcat(strcat(strcpy(P(G.toplines), query), S(" ")), obufp);
    c = await pgetchar();
    if (c === 27 || c === EOF) {
      if (c === 27 && obufp.a[obufp.o] !== 0) {
        obufp.a[obufp.o] = 0;
        bufp = obufp;
        await tty_clear_nhwindow(G.WIN_MESSAGE);
        cw.maxcol = cw.maxrow;
        await addtopl(query);
        await addtopl(S(" "));
        await addtopl(obufp);
      } else {
        obufp.a[obufp.o] = 27;
        obufp.a[obufp.o + 1] = 0;
        break;
      }
    }
    if (G.ttyDisplay.intr) {
      --G.ttyDisplay.intr;
      bufp.a[bufp.o] = 0;
    }
    if (c === 16) {
      if (G.iflags.prevmsg_window !== 115) {
        let sav = G.ttyDisplay.inread;
        G.ttyDisplay.inread = 0;
        await tty_doprev_message();
        G.ttyDisplay.inread = sav;
        await tty_clear_nhwindow(G.WIN_MESSAGE);
        cw.maxcol = cw.maxrow;
        await addtopl(query);
        await addtopl(S(" "));
        bufp.a[bufp.o] = 0;
        await addtopl(obufp);
      } else {
        if (!doprev) {
          await tty_doprev_message();
        }
        await tty_doprev_message();
        doprev = 1;
        continue;
      }
    } else if (doprev && G.iflags.prevmsg_window === 115) {
      await tty_clear_nhwindow(G.WIN_MESSAGE);
      cw.maxcol = cw.maxrow;
      doprev = 0;
      await addtopl(query);
      await addtopl(S(" "));
      bufp.a[bufp.o] = 0;
      await addtopl(obufp);
    }
    if (c === G.erase_char || c === 8) {
      if (!$peq(bufp, obufp)) {
        let i = null;
        bufp = bufp.add(-1);
        await putsyms(S("\x08"));
        for (i = bufp; i.a[i.o]; i = i.add(1)) {
          await putsyms(S(" "));
        }
        for (; i.o > bufp.o; i = i.add(-1)) {
          await putsyms(S("\x08"));
        }
        bufp.a[bufp.o] = 0;
      } else {
        tty_nhbell();
      }
    } else if (c === 10 || c === 13) {
      break;
    } else if (32 <= (c & 0xff) && c !== 127 && (bufp.o - obufp.o < BUFSZ - 1 && bufp.o - obufp.o < COLNO)) {
      let i = eos(bufp);
      bufp.a[bufp.o] = c << 24 >> 24;
      bufp.a[bufp.o + 1] = 0;
      await putsyms(bufp);
      bufp = bufp.add(1);
      if (hook && await hook(obufp)) {
        await putsyms(bufp);
        for (i = bufp; i.a[i.o]; i = i.add(1)) {
          await putsyms(S("\x08"));
        }
      } else if (i.o > bufp.o) {
        let s = i;
        for (; i.o > bufp.o; i = i.add(-1)) {
          await putsyms(S(" "));
        }
        for (; s.o > bufp.o; s = s.add(-1)) {
          await putsyms(S("\x08"));
        }
      }
    } else if (c === G.kill_char || c === 127) {
      for (; bufp.a[bufp.o]; bufp = bufp.add(1)) {
        await putsyms(S(" "));
      }
      for (; !$peq(bufp, obufp); bufp = bufp.add(-1)) {
        await putsyms(S("\x08 \x08"));
      }
      bufp.a[bufp.o] = 0;
    } else {
      tty_nhbell();
    }
  }
  G.ttyDisplay.toplin = 2;
  --G.ttyDisplay.inread;
  await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
  if (suppress_history) {
    $wr(P(G.toplines), 0, 0);
  } else {
    await dumplogmsg(P(G.toplines));
  }
}

export async function xwaitforspace(s: Ptr | null): Promise<void> {
  let c = 0;
  let x = G.ttyDisplay ? G.ttyDisplay.dismiss_more : 10;
  G.morc = 0;
  while (!G.program_state.done_hup && (c = await tty_nhgetch()) !== EOF) {
    if (c === 10 || c === 13) {
      break;
    }
    if (G.iflags.cbreak) {
      if (c === 27) {
        if (G.ttyDisplay) {
          G.ttyDisplay.dismiss_more = 1;
        }
        G.morc = 27;
        break;
      }
      if (s && strchr(s, c) || c === x || x === 10 && c === 13) {
        G.morc = c << 24 >> 24;
        break;
      }
      tty_nhbell();
    }
  }
}

function ext_cmd_getlin_hook(base: Ptr | null): number {
  let oindex = 0;
  let com_index = 0;
  com_index = -1;
  for (oindex = 0; !!G.extcmdlist[oindex].ef_txt; ++oindex) {
    if (G.extcmdlist[oindex].flags & CMD_NOT_AVAILABLE) {
      continue;
    }
    if (G.extcmdlist[oindex].flags & AUTOCOMPLETE && !(!G.flags.debug && G.extcmdlist[oindex].flags & WIZMODECMD) && !strncmpi(base, G.extcmdlist[oindex].ef_txt, strlen(base) | 0)) {
      if (com_index === -1) {
        com_index = oindex;
      } else {
        return FALSE;
      }
    }
  }
  if (com_index >= 0) {
    strcpy(base, G.extcmdlist[com_index].ef_txt);
    return TRUE;
  }
  return FALSE;
}

export async function tty_get_ext_cmd(): Promise<number> {
  let i = 0;
  let buf = new Int8Array(256);
  if (G.iflags.extmenu) {
    return await extcmd_via_menu();
  }
  suppress_history = TRUE;
  buf[0] = 0;
  await hooked_tty_getlin(S("#"), P(buf), G.in_doagain ? null : ext_cmd_getlin_hook);
  mungspaces(P(buf));
  if (buf[0] === 0 || buf[0] === 27) {
    return -1;
  }
  for (i = 0; !!G.extcmdlist[i].ef_txt; ++i) {
    if (!strncmpi(P(buf), G.extcmdlist[i].ef_txt, -1)) {
      break;
    }
  }
  if (!G.in_doagain) {
    let j = 0;
    for (j = 0; buf[j]; ++j) {
      savech(buf[j]);
    }
    savech(10);
  }
  if (!G.extcmdlist[i].ef_txt) {
    await pline(S("%s: unknown extended command."), P(buf));
    i = -1;
  }
  return i;
}

export function $init(): void {
  G.morc = 0;
  suppress_history = 0;
}
