// @ts-nocheck
// NetHack 3.6.7 ../win/tty/topl.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { key2txt, readchar } from './cmd.ts';
import { panic } from './end.ts';
import { xwaitforspace } from './getline.ts';
import { digit, eos, lowc } from './hacklib.ts';
import { custompline, dumplogmsg } from './pline.ts';
import { backsp, cl_end, home, standoutbeg, standoutend, tty_nhbell } from './termcap.ts';
import { docorner, end_glyphout, g_putch, tty_clear_nhwindow, tty_curs } from './wintty.ts';
import { $peq, $rd, $u64, $wr, G, P, S, free, putchar, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncmp, strncpy } from './rt/index.ts';
import { FALSE, NHW_MENU, OVERRIDE_MSGTYPE, QBUFSZ, SUPPRESS_HISTORY, TBUFSZ, TRUE, WIN_ERR, WIN_LOCKHISTORY, WIN_STOP } from './consts.ts';

let snapshot_mesgs: Ptr | null;
let tty_getmsghistory$nxtidx: number;
let tty_putmsghistory$initd: number;

export async function tty_doprev_message(): Promise<number> {
  let cw = G.wins[G.WIN_MESSAGE];
  let prevmsg_win = 0;
  let i = 0;
  if (G.iflags.prevmsg_window !== 115 && !G.ttyDisplay.inread) {
    if (G.iflags.prevmsg_window === 102) {
      prevmsg_win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_putstr(prevmsg_win, 0, S("Message History"));
      await G.windowprocs.win_putstr(prevmsg_win, 0, S(""));
      cw.maxcol = cw.maxrow;
      i = cw.maxcol | 0;
      do {
        if (cw.data.a[cw.data.o + i] && strcmp(cw.data.a[cw.data.o + i], S(""))) {
          await G.windowprocs.win_putstr(prevmsg_win, 0, cw.data.a[cw.data.o + i]);
        }
        i = (i + 1) % cw.rows | 0;
      } while (i !== cw.maxcol);
      await G.windowprocs.win_putstr(prevmsg_win, 0, P(G.toplines));
      await G.windowprocs.win_display_nhwindow(prevmsg_win, TRUE);
      await G.windowprocs.win_destroy_nhwindow(prevmsg_win);
    } else if (G.iflags.prevmsg_window === 99) {
      do {
        G.morc = 0;
        if (cw.maxcol === cw.maxrow) {
          G.ttyDisplay.dismiss_more = 31 & 112;
          await redotoplin(P(G.toplines));
          --cw.maxcol;
          if (cw.maxcol < 0) {
            cw.maxcol = cw.rows - 1;
          }
          if (!cw.data.a[cw.data.o + cw.maxcol]) {
            cw.maxcol = cw.maxrow;
          }
        } else if (cw.maxcol === cw.maxrow - 1) {
          G.ttyDisplay.dismiss_more = 31 & 112;
          await redotoplin(cw.data.a[cw.data.o + cw.maxcol]);
          --cw.maxcol;
          if (cw.maxcol < 0) {
            cw.maxcol = cw.rows - 1;
          }
          if (!cw.data.a[cw.data.o + cw.maxcol]) {
            cw.maxcol = cw.maxrow;
          }
        } else {
          prevmsg_win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
          await G.windowprocs.win_putstr(prevmsg_win, 0, S("Message History"));
          await G.windowprocs.win_putstr(prevmsg_win, 0, S(""));
          cw.maxcol = cw.maxrow;
          i = cw.maxcol | 0;
          do {
            if (cw.data.a[cw.data.o + i] && strcmp(cw.data.a[cw.data.o + i], S(""))) {
              await G.windowprocs.win_putstr(prevmsg_win, 0, cw.data.a[cw.data.o + i]);
            }
            i = (i + 1) % cw.rows | 0;
          } while (i !== cw.maxcol);
          await G.windowprocs.win_putstr(prevmsg_win, 0, P(G.toplines));
          await G.windowprocs.win_display_nhwindow(prevmsg_win, TRUE);
          await G.windowprocs.win_destroy_nhwindow(prevmsg_win);
        }
      } while (G.morc === (31 & 112));
      G.ttyDisplay.dismiss_more = 0;
    } else {
      G.morc = 0;
      prevmsg_win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_putstr(prevmsg_win, 0, S("Message History"));
      await G.windowprocs.win_putstr(prevmsg_win, 0, S(""));
      await G.windowprocs.win_putstr(prevmsg_win, 0, P(G.toplines));
      cw.maxcol = cw.maxrow - 1;
      if (cw.maxcol < 0) {
        cw.maxcol = cw.rows - 1;
      }
      do {
        await G.windowprocs.win_putstr(prevmsg_win, 0, cw.data.a[cw.data.o + cw.maxcol]);
        --cw.maxcol;
        if (cw.maxcol < 0) {
          cw.maxcol = cw.rows - 1;
        }
        if (!cw.data.a[cw.data.o + cw.maxcol]) {
          cw.maxcol = cw.maxrow;
        }
      } while (cw.maxcol !== cw.maxrow);
      await G.windowprocs.win_display_nhwindow(prevmsg_win, TRUE);
      await G.windowprocs.win_destroy_nhwindow(prevmsg_win);
      cw.maxcol = cw.maxrow;
      G.ttyDisplay.dismiss_more = 0;
    }
  } else if (G.iflags.prevmsg_window === 115) {
    G.ttyDisplay.dismiss_more = 31 & 112;
    do {
      G.morc = 0;
      if (cw.maxcol === cw.maxrow) {
        await redotoplin(P(G.toplines));
      } else if (cw.data.a[cw.data.o + cw.maxcol]) {
        await redotoplin(cw.data.a[cw.data.o + cw.maxcol]);
      }
      --cw.maxcol;
      if (cw.maxcol < 0) {
        cw.maxcol = cw.rows - 1;
      }
      if (!cw.data.a[cw.data.o + cw.maxcol]) {
        cw.maxcol = cw.maxrow;
      }
    } while (G.morc === (31 & 112));
    G.ttyDisplay.dismiss_more = 0;
  }
  return 0;
}

async function redotoplin(str: Ptr | null): Promise<void> {
  let $t1: any;
  let otoplin = G.ttyDisplay.toplin;
  await home();
  if (str.a[str.o] & 128) {
    g_putch($rd(($t1 = str, str = $t1.add(1), $t1)));
    G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
  }
  end_glyphout();
  await putsyms(str);
  await cl_end();
  G.ttyDisplay.toplin = 1;
  if (G.ttyDisplay.cury && otoplin !== 3) {
    await more();
  }
}

export async function show_topl(str: Ptr | null): Promise<void> {
  let cw = G.wins[G.WIN_MESSAGE];
  if (!(cw.flags & WIN_STOP)) {
    if (G.ttyDisplay.cury && G.ttyDisplay.toplin === 2) {
      await tty_clear_nhwindow(G.WIN_MESSAGE);
    }
    cw.curx = cw.cury = 0;
    await home();
    await cl_end();
    await addtopl(str);
    if (G.ttyDisplay.cury && G.ttyDisplay.toplin !== 3) {
      G.ttyDisplay.toplin = 2;
    }
  }
}

export async function remember_topl(): Promise<void> {
  let cw = G.wins[G.WIN_MESSAGE];
  let idx = cw.maxrow | 0;
  let len = strlen(P(G.toplines)) + 1 >>> 0;
  if (cw.flags & WIN_LOCKHISTORY || !$rd(P(G.toplines))) {
    return;
  }
  if (len > cw.datlen.a[cw.datlen.o + idx] >>> 0) {
    if (cw.data.a[cw.data.o + idx]) {
      free(cw.data.a[cw.data.o + idx]);
    }
    len = len + (8 - ((len & 7) >>> 0) >>> 0) >>> 0;
    cw.data.a[cw.data.o + idx] = P(new Int8Array(len));
    cw.datlen.a[cw.datlen.o + idx] = len << 16 >> 16;
  }
  strcpy(cw.data.a[cw.data.o + idx], P(G.toplines));
  $wr(P(G.toplines), 0, 0);
  cw.maxcol = cw.maxrow = (idx + 1) % cw.rows;
}

export async function addtopl(s: Ptr | null): Promise<void> {
  let cw = G.wins[G.WIN_MESSAGE];
  await tty_curs(G.BASE_WINDOW, cw.curx + 1 | 0, cw.cury | 0);
  await putsyms(s);
  await cl_end();
  G.ttyDisplay.toplin = 1;
}

export async function more(): Promise<void> {
  let cw = G.wins[G.WIN_MESSAGE];
  if (G.ttyDisplay.inmore++) {
    return;
  }
  if (G.iflags.debug_fuzzer) {
    return;
  }
  if (G.ttyDisplay.toplin) {
    await tty_curs(G.BASE_WINDOW, cw.curx + 1 | 0, cw.cury | 0);
    if (cw.curx >= G.tc_gbl_data.tc_CO - 8) {
      await topl_putsym(10);
    }
  }
  if (G.flags.standout) {
    standoutbeg();
  }
  await putsyms(P(G.defmorestr));
  if (G.flags.standout) {
    standoutend();
  }
  await xwaitforspace(S("\x1b "));
  if (G.morc === 27) {
    cw.flags |= WIN_STOP;
  }
  if (G.ttyDisplay.toplin && cw.cury) {
    await docorner(1, cw.cury + 1 | 0);
    cw.curx = cw.cury = 0;
    await home();
  } else if (G.morc === 27) {
    cw.curx = cw.cury = 0;
    await home();
    await cl_end();
  }
  G.ttyDisplay.toplin = 0;
  G.ttyDisplay.inmore = 0;
}

export async function update_topl(bp: Ptr | null): Promise<void> {
  let $t1: any;
  let tl = null;
  let otl = null;
  let n0 = 0;
  let notdied = 1;
  let cw = G.wins[G.WIN_MESSAGE];
  n0 = strlen(bp) | 0;
  if ((G.ttyDisplay.toplin === 1 || cw.flags & WIN_STOP) && cw.cury === 0 && n0 + (strlen(P(G.toplines)) | 0) + 3 < G.tc_gbl_data.tc_CO - 8 && (notdied = strncmp(bp, S("You die"), 7)) !== 0) {
    strcat(P(G.toplines), S("  "));
    strcat(P(G.toplines), bp);
    cw.curx += 2;
    if (!(cw.flags & WIN_STOP)) {
      await addtopl(bp);
    }
    return;
  } else if (!(cw.flags & WIN_STOP)) {
    if (G.ttyDisplay.toplin === 1) {
      await more();
    } else if (cw.cury) {
      await docorner(1, cw.cury + 1 | 0);
      cw.curx = cw.cury = 0;
    }
  }
  await remember_topl();
  strncpy(P(G.toplines), bp, TBUFSZ);
  G.toplines[TBUFSZ - 1] = 0;
  for (tl = P(G.toplines); n0 >= G.tc_gbl_data.tc_CO; ) {
    otl = tl;
    for (tl = tl.add(G.tc_gbl_data.tc_CO - 1); !$peq(tl, otl); tl = tl.add(-1)) {
      if (tl.a[tl.o] === 32) {
        break;
      }
    }
    if ($peq(tl, otl)) {
      tl = strchr(otl, 32);
      if (!tl) {
        break;
      }
    }
    $wr(($t1 = tl, tl = $t1.add(1), $t1), 0, 10);
    n0 = strlen(tl) | 0;
  }
  if (!notdied) {
    cw.flags &= ~WIN_STOP;
  }
  if (!(cw.flags & WIN_STOP)) {
    await redotoplin(P(G.toplines));
  }
}

async function topl_putsym(c: number): Promise<void> {
  let cw = G.wins[G.WIN_MESSAGE];
  if (!cw) {
    await panic(S("Putsym window MESSAGE nonexistent"));
  }
  switch (c) {
  case 8:
    if (G.ttyDisplay.curx === 0 && G.ttyDisplay.cury > 0) {
      await tty_curs(G.BASE_WINDOW, G.tc_gbl_data.tc_CO, G.ttyDisplay.cury - 1);
    }
    backsp();
    G.ttyDisplay.curx = G.ttyDisplay.curx - 1 << 16 >> 16;
    cw.curx = G.ttyDisplay.curx;
    return;
  case 10:
    await cl_end();
    G.ttyDisplay.curx = 0;
    G.ttyDisplay.cury = G.ttyDisplay.cury + 1 << 16 >> 16;
    cw.cury = G.ttyDisplay.cury;
    break;
  default:
    if (G.ttyDisplay.curx === G.tc_gbl_data.tc_CO - 1) {
      await topl_putsym(10);
    }
    G.ttyDisplay.curx = G.ttyDisplay.curx + 1 << 16 >> 16;
  }
  cw.curx = G.ttyDisplay.curx;
  if (cw.curx === 0) {
    await cl_end();
  }
  putchar(c);
}

export async function putsyms(str: Ptr | null): Promise<void> {
  let $t1: any;
  while (str.a[str.o]) {
    await topl_putsym($rd(($t1 = str, str = $t1.add(1), $t1)));
  }
}

async function removetopl(n: number): Promise<void> {
  while (n-- > 0) {
    await putsyms(S("\x08 \x08"));
  }
}

export async function tty_yn_function(query: Ptr | null, resp: Ptr | null, def: number): Promise<number> {
  let $g = 0;
  let q = 0;
  let rtmp = new Int8Array(40);
  let digit_ok = 0;
  let allow_num = 0;
  let preserve_case = 0;
  let cw = null;
  let doprev = 0;
  let prompt = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      rtmp = new Int8Array(40);
      preserve_case = FALSE;
      cw = G.wins[G.WIN_MESSAGE];
      doprev = 0;
      prompt = new Int8Array(256);
      G.yn_number = 0;
      if (G.ttyDisplay.toplin === 1 && !(cw.flags & WIN_STOP)) {
        await more();
      }
      cw.flags &= ~WIN_STOP;
      G.ttyDisplay.toplin = 3;
      ++G.ttyDisplay.inread;
      if (resp) {
        let rb = null;
        let respbuf = new Int8Array(128);
        allow_num = (!!strchr(resp, 35) ? 1 : 0) << 24 >> 24;
        strcpy(P(respbuf), resp);
        for (rb = P(respbuf); rb.a[rb.o]; rb = rb.add(1)) {
          if (65 <= rb.a[rb.o] && rb.a[rb.o] <= 90) {
            preserve_case = TRUE;
            break;
          }
        }
        if (!!(rb = strchr(P(respbuf), 27))) {
          rb.a[rb.o] = 0;
        }
        strncpy(P(prompt), query, QBUFSZ - 1);
        prompt[QBUFSZ - 1] = 0;
        sprintf(eos(P(prompt)), S(" [%s]"), P(respbuf));
        if (def) {
          sprintf(eos(P(prompt)), S(" (%c)"), def);
        }
        strcat(P(prompt), S(" "));
        await custompline(OVERRIDE_MSGTYPE | SUPPRESS_HISTORY, S("%s"), P(prompt));
      } else {
        sprintf(P(prompt), S("%s "), query);
        await custompline(OVERRIDE_MSGTYPE | SUPPRESS_HISTORY, S("%s"), P(prompt));
        q = await readchar();
        { $g = 1; continue $L; }
      }
      do {
        q = await readchar();
        if (!preserve_case) {
          q = lowc(q);
        }
        if (q === 16) {
          if (G.iflags.prevmsg_window !== 115) {
            let sav = G.ttyDisplay.inread;
            G.ttyDisplay.inread = 0;
            await tty_doprev_message();
            G.ttyDisplay.inread = sav;
            await tty_clear_nhwindow(G.WIN_MESSAGE);
            cw.maxcol = cw.maxrow;
            await addtopl(P(prompt));
          } else {
            if (!doprev) {
              await tty_doprev_message();
            }
            await tty_doprev_message();
            doprev = 1;
          }
          q = 0;
          continue;
        } else if (doprev) {
          await tty_clear_nhwindow(G.WIN_MESSAGE);
          cw.maxcol = cw.maxrow;
          doprev = 0;
          await addtopl(P(prompt));
          q = 0;
          continue;
        }
        digit_ok = (allow_num && digit(q) ? 1 : 0) << 24 >> 24;
        if (q === 27) {
          if (strchr(resp, 113)) {
            q = 113;
          } else if (strchr(resp, 110)) {
            q = 110;
          } else {
            q = def;
          }
          break;
        } else if (strchr(P(G.quitchars), q)) {
          q = def;
          break;
        }
        if (!strchr(resp, q) && !digit_ok) {
          tty_nhbell();
          q = 0;
        } else if (q === 35 || digit_ok) {
          let z = 0;
          let digit_string = new Int8Array(2);
          let n_len = 0;
          let value = 0;
          await addtopl(S("#")), ++n_len;
          digit_string[1] = 0;
          if (q !== 35) {
            digit_string[0] = q;
            await addtopl(P(digit_string)), ++n_len;
            value = q - 48;
            q = 35;
          }
          do {
            z = await readchar();
            if (!preserve_case) {
              z = lowc(z);
            }
            if (digit(z)) {
              value = 10 * value + (z - 48);
              if (value < 0) {
                break;
              }
              digit_string[0] = z;
              await addtopl(P(digit_string)), ++n_len;
            } else if (z === 121 || strchr(P(G.quitchars), z)) {
              if (z === 27) {
                value = -1;
              }
              z = 10;
            } else if (z === G.erase_char || z === 8) {
              if (n_len <= 1) {
                value = -1;
                break;
              } else {
                value = Math.trunc(value / 10);
                await removetopl(1), --n_len;
              }
            } else {
              value = -1;
              tty_nhbell();
              break;
            }
          } while (z !== 10);
          if (value > 0) {
            G.yn_number = value;
          } else if (value === 0) {
            q = 110;
          } else {
            await removetopl(n_len), n_len = 0;
            q = 0;
          }
        }
      } while (!q);
    case 1: // clean_up
      if (G.yn_number) {
        sprintf(P(rtmp), S("#%ld"), G.yn_number);
      } else {
        key2txt(q, P(rtmp));
      }
      sprintf(P(G.toplines), S("%s%s"), P(prompt), P(rtmp));
      await dumplogmsg(P(G.toplines));
      --G.ttyDisplay.inread;
      G.ttyDisplay.toplin = 2;
      if (G.ttyDisplay.intr) {
        --G.ttyDisplay.intr;
      }
      if (G.wins[G.WIN_MESSAGE].cury) {
        await tty_clear_nhwindow(G.WIN_MESSAGE);
      }
      return q;
    }
    break;
  }
}

async function msghistory_snapshot(purge: number): Promise<void> {
  let mesg = null;
  let i = 0;
  let inidx = 0;
  let outidx = 0;
  let cw = null;
  if (G.WIN_MESSAGE === WIN_ERR || !G.wins[G.WIN_MESSAGE]) {
    return;
  }
  cw = G.wins[G.WIN_MESSAGE];
  await remember_topl();
  if (!purge) {
    cw.flags |= WIN_LOCKHISTORY;
  }
  snapshot_mesgs = P(new Array(($u64(cw.rows + 1) * 8 >>> 0) / 8).fill(null));
  outidx = 0;
  inidx = cw.maxrow | 0;
  for (i = 0; i < cw.rows; ++i) {
    snapshot_mesgs.a[snapshot_mesgs.o + i] = null;
    mesg = cw.data.a[cw.data.o + inidx];
    if (mesg && mesg.a[mesg.o]) {
      snapshot_mesgs.a[snapshot_mesgs.o + outidx++] = mesg;
      if (purge) {
        cw.data.a[cw.data.o + inidx] = null;
        cw.datlen.a[cw.datlen.o + inidx] = 0;
      }
    }
    inidx = (inidx + 1) % cw.rows | 0;
  }
  snapshot_mesgs.a[snapshot_mesgs.o + cw.rows] = null;
  if (purge) {
    cw.maxcol = cw.maxrow = 0;
  }
}

function free_msghistory_snapshot(purged: number): void {
  let $t1: any;
  if (snapshot_mesgs) {
    if (purged) {
      let i = 0;
      for (i = 0; snapshot_mesgs.a[snapshot_mesgs.o + i]; ++i) {
        free(snapshot_mesgs.a[snapshot_mesgs.o + i]);
      }
    }
    free(snapshot_mesgs), snapshot_mesgs = null;
    if (!purged) {
      ($t1 = G.wins[G.WIN_MESSAGE], $t1.flags = $t1.flags & ~WIN_LOCKHISTORY);
    }
  }
}

export async function tty_getmsghistory(init: number): Promise<Ptr | null> {
  let nextmesg = null;
  let result = null;
  if (init) {
    await msghistory_snapshot(FALSE);
    tty_getmsghistory$nxtidx = 0;
  }
  if (snapshot_mesgs) {
    nextmesg = snapshot_mesgs.a[snapshot_mesgs.o + tty_getmsghistory$nxtidx++];
    if (nextmesg) {
      result = nextmesg;
    } else {
      free_msghistory_snapshot(FALSE);
    }
  }
  return result;
}

export async function tty_putmsghistory(msg: Ptr | null, restoring_msghist: number): Promise<void> {
  let idx = 0;
  if (restoring_msghist && !tty_putmsghistory$initd) {
    await msghistory_snapshot(TRUE);
    tty_putmsghistory$initd = TRUE;
    G.saved_pline_index = 0;
  }
  if (msg) {
    await remember_topl();
    strcpy(P(G.toplines), msg);
    await dumplogmsg(P(G.toplines));
  } else if (snapshot_mesgs) {
    for (idx = 0; snapshot_mesgs.a[snapshot_mesgs.o + idx]; ++idx) {
      await remember_topl();
      strcpy(P(G.toplines), snapshot_mesgs.a[snapshot_mesgs.o + idx]);
      await dumplogmsg(P(G.toplines));
    }
    free_msghistory_snapshot(TRUE);
    tty_putmsghistory$initd = FALSE;
  }
}

export function $init(): void {
  snapshot_mesgs = null;
  tty_getmsghistory$nxtidx = 0;
  tty_putmsghistory$initd = 0;
}
