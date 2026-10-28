// @ts-nocheck
// COW 3.3.3 getname.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { terminate } from './cowmain.ts';
import { myc, myf } from './myf.ts';
import { readFromServer, sendLoginReq, sendUpdatePacket } from './socket.ts';
import { W_Beep, W_ClearWindow, W_EventsPending, W_EventsQueuedCk, W_Flush, W_FlushWindow, W_NextEvent, W_Socket, W_WriteText } from './x11window.ts';
import { struct_event, struct_fd_set, struct_timeval } from './structs.ts';
import { $peq, $rd, $shl64, $u64, $wr, G, P, R, S, fprintf, memccpy, memset, perror, printf, select, sleep, strcmp, strcpy, strlen, strncmp, time } from '../rt/index.ts';
import { DEFAULT_PORT, ERROR_PAUSE_SECONDS, EXIT_LOGIN_FAILURE, PFREE, ST_DISCONNECTED, ST_DONE, ST_ERROR_PAUSE, ST_GETNAME, ST_GETPASS, ST_KEEPPEACE, ST_MAKEPASS1, ST_MAKEPASS2, ST_MAPMODE, ST_NAMEMODE, ST_RX_GUEST, ST_RX_LOGIN, ST_RX_NAME, ST_SHOWGLOBAL, ST_SHOWLOCAL, ST_SHOWSHIELDS, ST_TX_GUEST, ST_TX_LOGIN, ST_TX_NAME, TWINSIDE, X_L } from './consts.ts';

let n_def: Ptr | null;
let n_buf: any;
let p_buf_a: any;
let p_buf_b: any;
let state: number;
let automatic: number;
let err: Ptr | null;
let time_left: number;
let time_error_ends: number;
let asterisks$buf: any;
let redraw_readme$README: any;

function asterisks(password: Ptr | null): Ptr | null {
  let len = 0;
  strcpy(P(asterisks$buf), S("****************"));
  len = strlen(password) | 0;
  if ($u64(len) > strlen(P(asterisks$buf))) {
    len = strlen(P(asterisks$buf)) | 0;
  }
  asterisks$buf[len] = 0;
  return P(asterisks$buf);
}

function redraw_readme(): void {
  let i = 0;
  for (i = 0; $u64(i) < Math.trunc(48 / 8); ++i) {
    myf(X_L, Math.imul(i, G.W_Textheight) + 180, G.W_Cyan, G.W_RegularFont, S("%s"), redraw_readme$README[i]);
  }
}

function redraw_time_left(): void {
  if (automatic) {
    return;
  }
  myf(X_L, 400, G.W_Grey, G.W_RegularFont, S("Seconds to go: %d "), time_left);
}

function redraw(): void {
  let pad = S("                ");
  if (state === ST_DONE) {
    return;
  }
  if (automatic) {
    return;
  }
  if (state === ST_DISCONNECTED) {
    W_ClearWindow(G.w);
    myf(X_L, TWINSIDE / 2 | 0, G.W_Red, G.W_HighlightFont, S("Connection to server lost, press enter to quit."));
    return;
  }
  myf(X_L, 10, G.W_White, G.W_RegularFont, S("Welcome to Netrek."));
  myf(X_L, 20, G.W_Grey, G.W_RegularFont, S("Connected to server %s."), G.serverName);
  if (state === ST_GETNAME) {
    myf(X_L, 50, G.W_Green, G.W_RegularFont, S("What is your name? : %s%s"), strlen(P(n_buf)) === 0 ? n_def : P(n_buf), pad);
    if (G.xtrekPort === DEFAULT_PORT) {
      myf(X_L, 70, G.W_Grey, G.W_RegularFont, S("Use guest if you do not want to have your statistics saved."));
      myf(X_L, 90, G.W_Grey, G.W_RegularFont, S("Servers keep statistics by name."));
      myf(X_L, 100, G.W_Grey, G.W_RegularFont, S("This is the name the server will remember you by."));
      myf(X_L, 110, G.W_Grey, G.W_RegularFont, S("You may want to use an alias, most players do."));
      myf(X_L, 120, G.W_Grey, G.W_RegularFont, S("If the name is known, the server will ask for your password."));
      myf(X_L, 130, G.W_Grey, G.W_RegularFont, S("If not an account is created and you get to set a password."));
    }
  } else if (state === ST_GETPASS) {
    myf(X_L, 50, G.W_Grey, G.W_RegularFont, S("What is your name? : %s%s"), P(n_buf), pad);
    myf(X_L, 60, G.W_Green, G.W_RegularFont, S("What is your password? : %s%s"), asterisks(P(p_buf_a)), pad);
    myc(X_L, 70);
    myc(X_L, 90);
    myc(X_L, 100);
    myc(X_L, 110);
    myc(X_L, 120);
    myc(X_L, 130);
  } else if (state === ST_MAKEPASS1 || state === ST_MAKEPASS2) {
    myf(X_L, 50, G.W_Grey, G.W_RegularFont, S("What is your name? : %s%s"), P(n_buf), pad);
    myc(X_L, 70);
    myf(X_L, 70, G.W_Grey, G.W_HighlightFont, S("Name not known to server, so it will make one."));
    myf(X_L, 80, G.W_Grey, G.W_RegularFont, S("Think of a password you can remember, and enter it."));
    myf(X_L, 90, G.W_Green, G.W_RegularFont, S("What is your password? : %s%s"), asterisks(P(p_buf_a)), pad);
    myc(X_L, 100);
    myc(X_L, 110);
    myc(X_L, 120);
    myc(X_L, 130);
  }
  if (state === ST_MAKEPASS2) {
    myf(X_L, 110, G.W_Grey, G.W_HighlightFont, S("Enter it again to make sure you typed it right."));
    myf(X_L, 120, G.W_Green, G.W_RegularFont, S("Your password? : %s%s"), asterisks(P(p_buf_b)), pad);
  }
  if (!!err) {
    myf(X_L, 130, G.W_Red, G.W_HighlightFont, err);
  } else {
    myc(X_L, 130);
  }
  switch (state) {
  case 2:
  case 4:
  case 9:
    myf(X_L, 140, G.W_Yellow, G.W_HighlightFont, S("(server wait)"));
    break;
  default:
    myc(X_L, 140);
  }
  redraw_readme();
}

function error_pause(msg: Ptr | null): void {
  time_error_ends = time_left - ERROR_PAUSE_SECONDS;
  err = msg;
  state = ST_ERROR_PAUSE;
}

function automatic_failed(): void {
  automatic = 0;
  $wr(P(G.defpasswd), 0, $wr(P(p_buf_a), 0, $wr(P(p_buf_b), 0, 0)));
  err = S("Automatic login failed");
  W_WriteText(G.w, X_L, 130, G.W_Red, err, strlen(err) | 0, G.W_HighlightFont);
}

function key_to_buffer(ch: number, str: Ptr | null): void {
  let strLen = 0;
  strLen = strlen(str) | 0;
  if (ch === 21) {
    str.a[str.o] = 0;
    redraw();
  } else if (ch === 8 || ch === 127) {
    if (strLen > 0) {
      str.a[str.o + (strLen - 1)] = 0;
      redraw();
    }
  } else {
    if (strLen === 15) {
      return;
    }
    str.a[str.o + (strLen + 1)] = 0;
    str.a[str.o + strLen] = ch;
    redraw();
  }
}

function key(ch: number): void {
  if (ch === 10) {
    ch = 13;
  }
  if ((ch === 4 || ch === -60 || ch === -92) && state === ST_GETNAME && $rd(P(n_buf)) === 0) {
    terminate(0);
  }
  if (ch < 32 && ch !== 21 && ch !== 13 && ch !== 8) {
    return;
  }
  switch (state) {
  case 0:
    if (ch === 13) {
      err = null;
      if ($rd(P(n_buf)) === 0) {
        memccpy(P(n_buf), n_def, 0, 16);
      }
      if (strncmp(P(n_buf), S("Guest"), 5) === 0 || strncmp(P(n_buf), S("guest"), 5) === 0) {
        state = ST_TX_GUEST;
      } else {
        state = ST_TX_NAME;
      }
      redraw();
    } else {
      key_to_buffer(ch, P(n_buf));
    }
    break;
  case 5:
    if (ch === 13) {
      err = null;
      state = ST_TX_LOGIN;
      redraw();
    } else {
      key_to_buffer(ch, P(p_buf_a));
    }
    break;
  case 6:
    if (ch === 13) {
      err = null;
      state = ST_MAKEPASS2;
      redraw();
    } else {
      key_to_buffer(ch, P(p_buf_a));
    }
    break;
  case 7:
    if (ch === 13) {
      err = null;
      if (strcmp(P(p_buf_a), P(p_buf_b)) !== 0) {
        if (!automatic) {
          error_pause(S("Passwords do not match, starting again!"));
        } else {
          automatic_failed();
          state = ST_GETNAME;
        }
        $wr(P(n_buf), 0, 0);
      } else {
        state = ST_TX_LOGIN;
      }
      redraw();
    } else {
      key_to_buffer(ch, P(p_buf_b));
    }
    break;
  case 11:
    if (ch === 13) {
      terminate(EXIT_LOGIN_FAILURE);
    }
  default:
    W_Beep();
    break;
  }
  return;
}

async function events(): Promise<void> {
  let do_redraw = 0;
  let ch = 0;
  let event = new struct_event();
  while (await W_EventsPending()) {
    await W_NextEvent(event);
    switch (event.type) {
    case 1:
      if ($peq(event.Window, G.w)) {
        do_redraw = 1;
      }
      break;
    case 2:
      ch = event.key << 24 >> 24;
      if (!automatic) {
        key(ch);
      }
      break;
    case 6:
      if ($peq(event.Window, G.baseWin)) {
        fprintf(R.stderr, S("you quit, by closing the login window\n"));
        terminate(0);
      }
      break;
    }
  }
  if (do_redraw) {
    redraw();
    redraw_time_left();
  }
}

function mystats_init(): void {
  let j = 0;
  memset(G.mystats, 0, 568);
  G.mystats.st_tticks = 1;
  for (j = 0; j < 95; ++j) {
    G.mystats.st_keymap[j] = j + 32 & 0xff;
    G.mystats.st_keymap[j + 96] = j + 32 + 96 & 0xff;
    G.mystats.st_keymap[j + 192] = j + 32 & 0xff;
    G.mystats.st_keymap[j + 288] = j + 32 & 0xff;
    G.mystats.st_keymap[j + 384] = j + 32 & 0xff;
  }
  G.mystats.st_keymap[95] = 0;
  G.mystats.st_flags = ST_MAPMODE + ST_NAMEMODE + ST_SHOWSHIELDS + ST_KEEPPEACE + ST_SHOWLOCAL * 2 + ST_SHOWGLOBAL * 2;
}

export async function getname(defname: Ptr | null, defpasswd: Ptr | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let ch = 0;
  let lasttime = 0;
  let j = 0;
  let timeout = new struct_timeval();
  let readfds = new struct_fd_set();
  let ppwd = new Int8Array(16);
  W_ClearWindow(G.w);
  memccpy(P(ppwd), S("\x00\x00\x00"), 0, 4);
  automatic = defpasswd.a[defpasswd.o] && defname.a[defname.o] ? 1 : 0;
  n_def = defname;
  mystats_init();
  lasttime = time(null);
  if (G.ghoststart) {
    return;
  }
  n_buf[0] = 0;
  p_buf_a[0] = 0;
  p_buf_b[0] = 0;
  state = ST_GETNAME;
  redraw();
  while (1) {
    switch (state) {
    case 1:
      G.loginAccept = -1;
      sendUpdatePacket(1000000 / G.client_ups | 0);
      sendLoginReq(P(n_buf), P(ppwd), P(G.login), 0);
      state = ST_RX_GUEST;
      redraw();
      break;
    case 3:
      G.loginAccept = -1;
      sendUpdatePacket(1000000 / G.client_ups | 0);
      sendLoginReq(P(n_buf), P(ppwd), P(G.login), 1);
      state = ST_RX_NAME;
      redraw();
      break;
    case 8:
      G.loginAccept = -1;
      sendUpdatePacket(1000000 / G.client_ups | 0);
      sendLoginReq(P(n_buf), P(p_buf_a), P(G.login), 0);
      state = ST_RX_LOGIN;
      redraw();
      break;
    }
    await events();
    W_FlushWindow(G.w);
    W_Flush();
    if (automatic) {
      timeout.tv_sec = 0;
      timeout.tv_usec = 1000;
    } else {
      timeout.tv_sec = 1;
      timeout.tv_usec = 0;
    }
    do {
      let __i = 0;
      let __arr = readfds;
      for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
        __arr.__fds_bits[__i] = 0;
      }
    } while (0);
    if (!G.serverDead) {
      ($t1 = readfds.__fds_bits, $t2 = G.sock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, G.sock % (8 * 8)));
      if (G.udpSock >= 0) {
        ($t3 = readfds.__fds_bits, $t4 = G.udpSock / (8 * 8) | 0, $t3[$t4] = $t3[$t4] | $shl64(1, G.udpSock % (8 * 8)));
      }
    }
    ($t5 = readfds.__fds_bits, $t6 = W_Socket() / (8 * 8) | 0, $t5[$t6] = $t5[$t6] | $shl64(1, W_Socket() % (8 * 8)));
    if (await select(32, readfds, null, null, timeout) < 0) {
      perror(S("select"));
      await sleep(1);
      continue;
    }
    if (!G.serverDead) {
      if ((readfds.__fds_bits[G.sock / (8 * 8) | 0] & $shl64(1, G.sock % (8 * 8))) !== 0 || G.udpSock >= 0 && (readfds.__fds_bits[G.udpSock / (8 * 8) | 0] & $shl64(1, G.udpSock % (8 * 8))) !== 0) {
        await readFromServer(readfds);
      }
    }
    if (G.serverDead) {
      state = ST_DISCONNECTED;
      redraw();
    }
    switch (state) {
    case 2:
      if (G.loginAccept !== -1) {
        if (G.loginAccept === 0) {
          error_pause(S("Server refuses guest login, use another name."));
          G.fastGuest = 0;
          $wr(P(n_buf), 0, 0);
        } else {
          G.me.p_pos = -1;
          G.me.p_stats.st_tticks = 1;
          memccpy(P(G.me.p_name), P(n_buf), 0, 16);
          state = ST_DONE;
        }
        redraw();
      }
      break;
    case 4:
      if (G.loginAccept !== -1) {
        $wr(P(p_buf_a), 0, $wr(P(p_buf_b), 0, 0));
        if (G.loginAccept === 0) {
          state = ST_MAKEPASS1;
        } else {
          state = ST_GETPASS;
        }
        redraw();
      }
      break;
    case 9:
      if (G.loginAccept !== -1) {
        if (G.loginAccept === 0) {
          if (!automatic) {
            error_pause(S("Bad password!"));
          } else {
            automatic_failed();
            state = ST_GETNAME;
          }
          $wr(P(n_buf), 0, 0);
        } else {
          memccpy(P(G.me.p_name), P(n_buf), 0, 16);
          G.keeppeace = (G.me.p_stats.st_flags / ST_KEEPPEACE | 0) & 1;
          state = ST_DONE;
        }
        redraw();
      }
      break;
    }
    if ((readfds.__fds_bits[W_Socket() / (8 * 8) | 0] & $shl64(1, W_Socket() % (8 * 8))) !== 0) {
      while (W_EventsQueuedCk()) {
        await events();
      }
    }
    if (time(null) !== lasttime) {
      ++lasttime;
      --time_left;
      redraw_time_left();
      if (time_left === 0) {
        G.me.p_status = PFREE;
        printf(S("Timed Out.\n"));
        terminate(0);
      }
      switch (state) {
      case 12:
        if (time_left < time_error_ends) {
          state = ST_GETNAME;
          W_ClearWindow(G.w);
          err = null;
          redraw();
        }
      }
    }
    if (state === ST_DONE) {
      W_ClearWindow(G.w);
      W_ClearWindow(G.mapw);
      return;
    }
    if (automatic) {
      switch (state) {
      case 0:
        n_buf[0] = 0;
        ch = 13;
        j = 0;
        key(ch);
        break;
      case 5:
      case 6:
      case 7:
        ch = defpasswd.a[defpasswd.o + j++];
        if (ch === 0) {
          j = 0;
          ch = 13;
        }
        key(ch);
        break;
      }
    }
  }
}

export function $init(): void {
  n_def = null;
  n_buf = new Int8Array(16);
  p_buf_a = new Int8Array(16);
  p_buf_b = new Int8Array(16);
  state = 0;
  automatic = 0;
  err = null;
  time_left = 199;
  time_error_ends = 0;
  asterisks$buf = new Int8Array(17);
  redraw_readme$README = [S("--                                             --"),
S(""),
S("netrek-client-cow maintainer: quozl@us.netrek.org"),
S("bug reports welcome"),
S(""),
S("--                                             --")];
}
