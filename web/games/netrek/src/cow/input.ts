// @ts-nocheck
// COW 3.3.3 input.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { terminate } from './cowmain.ts';
import { getdefault, initDefaults, resetdefaults, shipchange, strcmpi } from './defaults.ts';
import { showdef } from './defwin.ts';
import { showdocs, showxtrekrc } from './docwin.ts';
import { fillhelp } from './helpwin.ts';
import { destroyInfo, inform } from './inform.ts';
import { beam_down, beam_up, bomb_planet, cloak, cloak_off, cloak_on, set_course, set_speed, shield_down, shield_tog, shield_up, ustime } from './interface.ts';
import { showMacroWin } from './macrowin.ts';
import { nsdone, nswindow } from './netstatopt.ts';
import { optiondone, optionredrawoption, optionredrawtarget, optionwindow } from './option.ts';
import { redrawPStats } from './pingstats.ts';
import { pblockplanet, pblockplayer, pbsetspeed } from './playback.ts';
import { RedrawPlayerList } from './playerlist.ts';
import { intrupt, redraw } from './redraw.ts';
import { emergency, pmacro } from './senddist.ts';
import { sendShortReq } from './short.ts';
import { DisplayMessage, message_off, message_on, pnbtmacro, smessage } from './smessage.ts';
import { sendDetMineReq, sendRepressReq, sendShortPacket, sendTractorReq, sendUdpReq } from './socket.ts';
import { Play_Sound, sounddone, soundwindow } from './sound.ts';
import { spdone, spwindow } from './spopt.ts';
import { showToolsWin } from './tools.ts';
import { udpdone, udpwindow } from './udpopt.ts';
import { gettarget } from './util.ts';
import { warwindow } from './war.ts';
import { warning } from './warning.ts';
import { W_Beep, W_CameraSnap, W_ClearWindow, W_EventsQueued, W_EventsQueuedCk, W_Flush, W_FullScreenToggle, W_GetWindowButtonHandler, W_GetWindowExposeHandler, W_GetWindowKeyDownHandler, W_IsMapped, W_MapWindow, W_Socket, W_SpNextEvent, W_UnmapWindow, findMouseInWin } from './x11window.ts';
import { struct_event, struct_fd_set, struct_key_handler_type, struct_timeval } from './structs.ts';
import { $cast, $peq, $rd, $sadd, $sarrOf, $shl64, $u64, $view8, $wr, G, P, R, S, atan2, fprintf, hypot, printf, rint, select, sprintf, strchr, strcpy, strlen, strncat } from '../rt/index.ts';
import { COMM_UPDATE, EXIT_DISCONNECTED, GWIDTH, MACRO_ENEMY, MACRO_FRIEND, MAXASCII, MAXKEY, MAXPLANETS, MAXPLAYER, MAXTORP, MAX_MACRO, MESSAGE_SOUND, NBTM, PALIVE, PFCLOAK, PFDOCKOK, PFOBSERV, PFPLLOCK, PFPLOCK, PFPRESS, PFREFIT, PFTRACT, PLANETTYPE, PLAYERTYPE, SCALE, SELF_DESTRUCT_SOUND, SPK_ALL, SPK_MOFF, SPK_MON, SPK_SALL, STARBASE, TARG_CLOAK, TARG_ENEMY, TARG_FRIEND, TARG_PLANET, TARG_PLAYER, TMOVE, TSTRAIGHT, TWINSIDE, UDPVERSION, W_BUTTON_RANGE, W_EV_CM_BUTTON, W_LBUTTON, W_MBUTTON, W_RBUTTON, asbomb, asw, base_ogg, bomb, bombing, carrying, controlling, crippled, doing1, doing2, escorting, free_beer, generic, help1, help2, no_gas, ogg, ogging, other1, other2, pickup, pop, save_planet, space_control, take } from './consts.ts';

let docline: number;
let xtrekrcline: number;
let Key100$lastdet: number;

export function getctrlkey(s: Ptr | null): number {
  let str = s.a[s.o];
  let c = 0;
  if (str.a[str.o] === 94) {
    str = str.add(1);
    if (str.a[str.o] !== 94) {
      c = str.a[str.o] + 96 & 0xff;
    } else {
      c = str.a[str.o];
    }
  } else {
    c = str.a[str.o];
  }
  str = str.add(1);
  s.a[s.o] = str;
  return c;
}

export function initkeymap(): void {
  let $t1: any;
  const str = [null];
  if (!!(str[0] = G.myshipdef.keymap)) {
    while (str[0].a[str[0].o] !== 0) {
      if (str[0].a[str[0].o] >= 32 && str[0].a[str[0].o] < 128) {
        G.mystats.st_keymap[str[0].a[str[0].o] - 32] = $rd(str[0].add(1));
      }
      str[0] = str[0].add(2);
    }
  }
  if (!!(str[0] = $view8(getdefault(S("macroKey")), false))) {
    const p = [null];
    if (strlen($view8(str[0], true)) === 1) {
      G.mystats.st_keymap[str[0].a[str[0].o] - 32] = 88;
    } else if (!strcmpi($view8(str[0], true), S("TAB"))) {
      p[0] = $view8(S("^i"), false);
      G.mystats.st_keymap[getctrlkey(P(p, 0)) - 32] = 88;
    } else if (!strcmpi($view8(str[0], true), S("ESC"))) {
      p[0] = $view8(S("^["), false);
      G.mystats.st_keymap[getctrlkey(P(p, 0)) - 32] = 88;
    }
  }
  if (!!(str[0] = G.myshipdef.ckeymap)) {
    let c1 = 0;
    let c2 = 0;
    while (str[0].a[str[0].o] !== 0) {
      if (str[0].a[str[0].o] >= 32 && str[0].a[str[0].o] < MAXASCII) {
        c1 = getctrlkey(P(str, 0)) - 32 & 0xff;
        c2 = getctrlkey(P(str, 0));
        G.mystats.st_keymap[c1] = c2;
      }
    }
  }
  if (!!(str[0] = $view8(getdefault(S("b1keymap")), false))) {
    G.b1_as_shift = 1;
    while (str[0].a[str[0].o] !== 0) {
      if (str[0].a[str[0].o] >= 32 && str[0].a[str[0].o] < 176) {
        G.mystats.st_keymap[str[0].a[str[0].o] - 32 + 192] = $rd(str[0].add(1));
      }
      str[0] = str[0].add(2);
    }
  }
  if (!!(str[0] = $view8(getdefault(S("b2keymap")), false))) {
    G.b2_as_shift = 1;
    while (str[0].a[str[0].o] !== 0) {
      if (str[0].a[str[0].o] >= 32 && str[0].a[str[0].o] < 176) {
        G.mystats.st_keymap[str[0].a[str[0].o] - 32 + 288] = $rd(str[0].add(1));
      }
      str[0] = str[0].add(2);
    }
  }
  if (!!(str[0] = $view8(getdefault(S("b3keymap")), false))) {
    G.b3_as_shift = 1;
    while (str[0].a[str[0].o] !== 0) {
      if (str[0].a[str[0].o] >= 32 && str[0].a[str[0].o] < 176) {
        G.mystats.st_keymap[str[0].a[str[0].o] - 32 + 384] = $rd(str[0].add(1));
      }
      str[0] = str[0].add(2);
    }
  }
  if (!!(str[0] = G.myshipdef.buttonmap)) {
    while (str[0].a[str[0].o] !== 0) {
      switch ($rd(($t1 = str[0], str[0] = $t1.add(1), $t1))) {
      case 49:
        G.buttonmap[1] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 50:
        G.buttonmap[2] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 51:
        G.buttonmap[3] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 100:
        G.buttonmap[4] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 101:
        G.buttonmap[5] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 102:
        G.buttonmap[6] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 103:
        G.buttonmap[7] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 52:
        G.buttonmap[9] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 53:
        G.buttonmap[10] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 54:
        G.buttonmap[11] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 104:
        G.buttonmap[12] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 105:
        G.buttonmap[13] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 106:
        G.buttonmap[14] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 107:
        G.buttonmap[15] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 55:
        G.buttonmap[17] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 56:
        G.buttonmap[18] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 57:
        G.buttonmap[19] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 108:
        G.buttonmap[20] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 109:
        G.buttonmap[21] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 110:
        G.buttonmap[22] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 111:
        G.buttonmap[23] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 97:
        G.buttonmap[25] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 98:
        G.buttonmap[26] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 99:
        G.buttonmap[27] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 112:
        G.buttonmap[28] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 113:
        G.buttonmap[29] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 114:
        G.buttonmap[30] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      case 115:
        G.buttonmap[31] = getctrlkey(P(str, 0)) << 24 >> 24;
        break;
      default:
        fprintf(R.stderr, S("%c ignored in buttonmap\n"), $rd(str[0].add(-1)));
        break;
      }
    }
  }
}

export function detsetallow(_dummy: number): void {
  G.detallow = 1;
}

export async function input(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let readfds = new struct_fd_set();
  let xsock = W_Socket();
  let timeout = new struct_timeval();
  let retval = 0;
  let flush = 0;
  let stall = 100;
  while (1) {
    do {
      let __i = 0;
      let __arr = readfds;
      for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
        __arr.__fds_bits[__i] = 0;
      }
    } while (0);
    ($t1 = readfds.__fds_bits, $t2 = xsock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, xsock % (8 * 8)));
    if (xsock > G.max_fd) {
      fprintf(R.stderr, S("input: xsock > max_fd\n"));
    }
    if (!G.serverDead) {
      ($t3 = readfds.__fds_bits, $t4 = G.sock / (8 * 8) | 0, $t3[$t4] = $t3[$t4] | $shl64(1, G.sock % (8 * 8)));
      if (G.sock > G.max_fd) {
        fprintf(R.stderr, S("input: sock > max_fd\n"));
      }
      if (G.udpSock >= 0) {
        ($t5 = readfds.__fds_bits, $t6 = G.udpSock / (8 * 8) | 0, $t5[$t6] = $t5[$t6] | $shl64(1, G.udpSock % (8 * 8)));
        if (G.sock > G.max_fd) {
          fprintf(R.stderr, S("input: udpSock > max_fd\n"));
        }
      }
    } else {
      warning(S("Lost connection to server, press q to quit."));
      G.redrawall = 1;
      redraw();
      ++flush;
    }
    timeout.tv_sec = 0;
    timeout.tv_usec = 10000;
    retval = await select(G.max_fd, readfds, null, null, timeout);
    if (retval === 0) {
      if (W_EventsQueuedCk()) {
        while (W_EventsQueuedCk()) {
          await process_event();
        }
        ++flush;
      }
      --stall;
      if (stall < 0) {
        warning(S("Stall in data stream from server!"));
        G.redrawall = 1;
        redraw();
        ++flush;
        stall = 100;
      }
    } else if (retval > 0) {
      if ((readfds.__fds_bits[xsock / (8 * 8) | 0] & $shl64(1, xsock % (8 * 8))) !== 0) {
        while (W_EventsQueuedCk()) {
          await process_event();
        }
        ++flush;
      }
      if ((readfds.__fds_bits[G.sock / (8 * 8) | 0] & $shl64(1, G.sock % (8 * 8))) !== 0 || G.udpSock >= 0 && (readfds.__fds_bits[G.udpSock / (8 * 8) | 0] & $shl64(1, G.udpSock % (8 * 8))) !== 0) {
        stall = 100;
        await intrupt(readfds);
        ++flush;
        if (G.serverDead) {
          warning(S("Lost connection to server!"));
        }
        if (G.keepInfo > 0 && G.opened_info !== -2) {
          --G.opened_info;
          if (G.opened_info < 0 && G.infomapped) {
            destroyInfo();
          }
        }
      }
    }
    if (flush) {
      W_Flush();
      flush = 0;
    }
  }
}

export async function process_event(): Promise<number> {
  let data = new struct_event();
  let loop = 0;
  let handler = null;
  do {
    ++loop;
    if (!await W_SpNextEvent(data)) {
      continue;
    }
    switch (data.type) {
    case 2:
      if (!!(handler = W_GetWindowKeyDownHandler(data.Window))) {
        await handler(data);
      }
      if ($peq(data.Window, G.messagew)) {
        break;
      }
      if (G.serverDead) {
        if (data.key === 113) {
          terminate(EXIT_DISCONNECTED);
        }
      } else if ($peq(data.Window, G.docwin)) {
        switch (data.key) {
        case 102:
          docline += 28;
          if (docline >= G.maxdoclines) {
            docline = G.maxdoclines - 28;
          }
          showdocs(docline);
          break;
        case 98:
          docline -= 28;
          if (docline < 0) {
            docline = 0;
          }
          showdocs(docline);
          break;
        case 70:
          docline += 4;
          if (docline >= G.maxdoclines) {
            docline = G.maxdoclines - 28;
          }
          showdocs(docline);
          break;
        case 66:
          docline -= 4;
          if (docline < 0) {
            docline = 0;
          }
          showdocs(docline);
          break;
        default:
          data.Window = G.w;
          await keyaction(data);
          break;
        }
      } else if ($peq(data.Window, G.xtrekrcwin)) {
        switch (data.key) {
        case 102:
          xtrekrcline += 28;
          if (xtrekrcline >= G.maxxtrekrclines) {
            xtrekrcline = G.maxxtrekrclines - 28;
          }
          showxtrekrc(xtrekrcline);
          break;
        case 98:
          xtrekrcline -= 28;
          if (xtrekrcline < 0) {
            xtrekrcline = 0;
          }
          showxtrekrc(xtrekrcline);
          break;
        case 70:
          xtrekrcline += 4;
          if (xtrekrcline >= G.maxxtrekrclines) {
            xtrekrcline = G.maxxtrekrclines - 28;
          }
          showxtrekrc(xtrekrcline);
          break;
        case 66:
          xtrekrcline -= 4;
          if (xtrekrcline < 0) {
            xtrekrcline = 0;
          }
          showxtrekrc(xtrekrcline);
          break;
        default:
          data.Window = G.w;
          await keyaction(data);
          break;
        }
      } else if (G.messageon) {
        smessage(data.key << 24 >> 24);
      } else {
        await keyaction(data);
      }
      break;
    case 5:
    case 3:
      if (!!(handler = W_GetWindowButtonHandler(data.Window))) {
        await handler(data);
      } else {
        await buttonaction(data);
      }
      break;
    case 1:
      if (!!(handler = W_GetWindowExposeHandler(data.Window))) {
        await handler(data);
      } else if ($peq(data.Window, G.mapw)) {
        G.redrawall = 1;
      } else if ($peq(data.Window, G.warnw)) {
        W_ClearWindow(G.warnw);
      } else if ($peq(data.Window, G.messagew)) {
        DisplayMessage();
      } else if (G.defWin && $peq(data.Window, G.defWin)) {
        showdef();
      } else if (G.docwin && $peq(data.Window, G.docwin)) {
        showdocs(docline);
      } else if (G.xtrekrcwin && $peq(data.Window, G.xtrekrcwin)) {
        showxtrekrc(xtrekrcline);
      }
      break;
    case 6:
      if ($peq(data.Window, G.baseWin)) {
        fprintf(R.stderr, S("you quit, by closing the play window in play\n"));
        G.fastQuit = 1;
        sendShortPacket(7, 0);
      }
      break;
    default:
      break;
    }
  } while (W_EventsQueued());
  return loop;
}

async function keyaction(data: struct_event | null): Promise<void> {
  G.fastQuit = 0;
  if (!$peq(data.Window, G.mapw) && !$peq(data.Window, G.w) && !$peq(data.Window, G.infow) && !$peq(data.Window, G.scanw)) {
    data.Window = G.w;
    data.x = data.y = TWINSIDE / 2 | 0;
  }
  G.key = data.key;
  if ($peq(data.Window, G.infow)) {
    const x = new Int32Array(1);
    const y = new Int32Array(1);
    if (findMouseInWin(P(x, 0), P(y, 0), G.w)) {
      data.Window = G.w;
      data.x = x[0];
      data.y = y[0];
    } else if (findMouseInWin(P(x, 0), P(y, 0), G.mapw)) {
      data.Window = G.mapw;
      data.x = x[0];
      data.y = y[0];
    }
  }
  if ((G.localflags & PFREFIT) >>> 0) {
    switch (G.key) {
    case 99:
      {
        sendShortPacket(23, 2);
        shipchange(2);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 111:
      {
        sendShortPacket(23, 5);
        shipchange(5);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 97:
      {
        sendShortPacket(23, 4);
        shipchange(4);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 100:
      {
        sendShortPacket(23, 1);
        shipchange(1);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 103:
      {
        sendShortPacket(23, 6);
        shipchange(6);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 98:
      {
        sendShortPacket(23, 3);
        shipchange(3);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 115:
      {
        sendShortPacket(23, 0);
        shipchange(0);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    case 42:
      {
        sendShortPacket(23, 7);
        shipchange(7);
      }
      ;
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    default:
      G.localflags = (G.localflags & 4293918719) >>> 0;
      return;
      break;
    }
  }
  if (G.playback) {
    switch (G.key) {
    case 8:
    case 13:
      pbsetspeed(G.key << 24 >> 24);
      return;
    }
  }
  if (G.key >= 32 && G.key < MAXKEY) {
    G.key = G.mystats.st_keymap[G.key - 32];
  } else {
    fprintf(R.stderr, S("input.c: keyaction() key %d outside range\n"), G.key);
    W_Beep();
    return;
  }
  if (G.playback) {
    let target = null;
    switch (G.key) {
    case 81:
    case 113:
      terminate(0);
      break;
    case 32:
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 33:
    case 35:
    case 37:
    case 40:
    case 41:
    case 60:
    case 62:
    case 64:
    case 82:
    case 106:
    case 74:
    case 115:
      pbsetspeed(G.key << 24 >> 24);
      return;
      break;
    case 108:
      target = gettarget(data.Window, data.x, data.y, TARG_PLAYER | TARG_CLOAK);
      pblockplayer(target.o_num);
      return;
      break;
    case 59:
      target = gettarget(data.Window, data.x, data.y, TARG_PLANET);
      pblockplanet(target.o_num);
      return;
      break;
    case 61:
      printf(S("sequence #%d\n"), G.pb_sequence_count);
      return;
      break;
    case 73:
    case 105:
    case 63:
      break;
    default:
      return;
    }
  }
  if (!G.MacroMode && G.singleMacro[0] !== 0 && strchr($view8(P(G.singleMacro), true), data.key)) {
    G.MacroMode = 1;
    G.MacroNum = -1;
  }
  if (G.MacroMode) {
    doMacro(data);
    return;
  }
  if (data.type === W_EV_CM_BUTTON && !G.motion_mouse_enablable && G.key !== 107) {
    return;
  }
  await G.key_handlers[G.key].handler(data);
}

export async function mkeyaction(data: struct_event | null): Promise<void> {
  let key = data.key;
  G.fastQuit = 0;
  if (!strchr(S("sbogadc"), key) || !((G.localflags & PFREFIT) >>> 0)) {
    if (key >= 32 && key < 176) {
      let offset = 0;
      switch (data.modifier) {
      case 1:
        offset = 192;
        break;
      case 2:
        offset = 288;
        break;
      case 3:
        offset = 384;
        break;
      }
      key = G.mystats.st_keymap[key - 32 + offset];
    }
  }
  data.key = key;
  await keyaction(data);
}

export async function buttonaction(data: struct_event | null): Promise<void> {
  let course = 0;
  if (G.messageon) {
    message_off();
  }
  G.fastQuit = 0;
  if (G.playback) {
    return;
  }
  if ($peq(data.Window, G.reviewWin)) {
    if (G.recv_mesg) {
      sendShortReq(SPK_MOFF);
    } else {
      sendShortReq(SPK_MON);
    }
    return;
  }
  if (!$peq(data.Window, G.w) && !$peq(data.Window, G.mapw) && !$peq(data.Window, G.infow)) {
    return;
  }
  if (data.key >= W_LBUTTON && data.key < W_BUTTON_RANGE) {
    if (G.buttonmap[data.key] !== 0) {
      data.key = G.buttonmap[data.key] & 0xff;
      await keyaction(data);
      return;
    }
  }
  if (data.type === W_EV_CM_BUTTON && !G.motion_mouse_enablable && data.key !== W_RBUTTON) {
    return;
  }
  if ($peq(data.Window, G.infow)) {
    const x = new Int32Array(1);
    const y = new Int32Array(1);
    if (findMouseInWin(P(x, 0), P(y, 0), G.w)) {
      data.Window = G.w;
      data.x = x[0];
      data.y = y[0];
    } else if (findMouseInWin(P(x, 0), P(y, 0), G.mapw)) {
      data.Window = G.mapw;
      data.x = x[0];
      data.y = y[0];
    }
  }
  if (data.key === W_RBUTTON) {
    course = getcourse(data.Window, data.x, data.y) & 0xff;
    set_course(course);
  } else if (data.key === W_LBUTTON) {
    course = getcourse(data.Window, data.x, data.y) & 0xff;
    sendShortPacket(6, (G.rotate ? course - G.rotate_deg : course) << 24 >> 24);
  } else if (data.key === W_MBUTTON) {
    course = getcourse(data.Window, data.x, data.y) & 0xff;
    sendShortPacket(4, (G.rotate ? course - G.rotate_deg : course) << 24 >> 24);
  }
}

export function getcourse(ww: Ptr | null, x: number, y: number): number {
  if ($peq(ww, G.mapw)) {
    let me_x = 0;
    let me_y = 0;
    me_x = Math.imul(G.me.p_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
    me_y = Math.imul(G.me.p_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
    return (Math.trunc(rint(atan2(x - me_x, me_y - y) / 3.1415899999999999 * 128 + 0.5)) | 0) & 0xff;
  } else {
    return (Math.trunc(rint(atan2(x - (500 / 2 | 0), (500 / 2 | 0) - y) / 3.1415899999999999 * 128 + 0.5)) | 0) & 0xff;
  }
}

function detmine(): void {
  let i = 0;
  for (i = 0; i < MAXTORP; ++i) {
    if ($sadd(G.torps, (i + Math.imul(G.me.p_no, MAXTORP))).t_status === TMOVE || $sadd(G.torps, (i + Math.imul(G.me.p_no, MAXTORP))).t_status === TSTRAIGHT) {
      sendDetMineReq(i + Math.imul(G.me.p_no, MAXTORP) << 16 >> 16);
      if (G.recv_short) {
        break;
      }
    }
  }
}

export function lockPlanetOrBase(ww: Ptr | null, x: number, y: number): void {
  let i = 0;
  let j = null;
  let k = null;
  let g_x = 0;
  let g_y = 0;
  let dist = 0;
  let closedist = 0;
  let targtyp = 0;
  let targnum = 0;
  if ($peq(ww, G.mapw)) {
    g_x = Math.imul(x, GWIDTH) / (G.small_screen ? 400 : 500) | 0;
    g_y = Math.imul(y, GWIDTH) / (G.small_screen ? 400 : 500) | 0;
  } else {
    g_x = G.me.p_x + Math.imul(x - (TWINSIDE / 2 | 0), SCALE);
    g_y = G.me.p_y + Math.imul(y - (TWINSIDE / 2 | 0), SCALE);
  }
  closedist = GWIDTH;
  for (i = 0, k = $sadd(G.planets, i); i < MAXPLANETS; ++i, k = $sadd(k, 1)) {
    dist = hypot(g_x - k.pl_x, g_y - k.pl_y);
    if (dist < closedist) {
      targtyp = PLANETTYPE;
      targnum = i;
      closedist = dist;
    }
  }
  for (i = 0, j = $sadd(G.players, i); i < MAXPLAYER; ++i, j = $sadd(j, 1)) {
    if (j.p_status !== PALIVE) {
      continue;
    }
    if ((j.p_flags & PFCLOAK) >>> 0) {
      continue;
    }
    if (j === G.me) {
      continue;
    }
    if (j.p_ship.s_type === STARBASE && j.p_team === G.me.p_team) {
      dist = hypot(g_x - j.p_x, g_y - j.p_y);
      if (dist < closedist) {
        targtyp = PLAYERTYPE;
        targnum = i;
        closedist = dist;
      }
    }
  }
  if (targtyp === PLAYERTYPE) {
    sendShortPacket(16, targnum << 24 >> 24);
    G.me.p_playerl = targnum << 16 >> 16;
  } else {
    sendShortPacket(15, targnum << 24 >> 24);
    G.me.p_planet = targnum << 16 >> 16;
  }
}

function emptyKey(data: struct_event | null): void {
  data = $cast(struct_event, data);
  fprintf(R.stderr, S("input.c: emptyKey %d\n"), G.key);
  W_Beep();
}

export function macro_on(): void {
  warning(S("In Macro Mode"));
  G.MacroMode = 1;
  G.MacroNum = -1;
}

export function doMacro(data: struct_event | null): void {
  let target = null;
  let targettype = 0;
  let i = 0;
  let c = 0;
  let who = 0;
  let found = 0;
  warning(S(" "));
  G.MacroMode = 0;
  if (data.key === 63) {
    showMacroWin();
    return;
  }
  if (G.UseNewMacro) {
    if (G.MacroNum > -1) {
      if (G.MacroNum >= MAX_MACRO) {
        fprintf(R.stderr, S("Unknown Macro Num!  There is a macro bug!!\n"));
      }
      if (!pmacro(G.MacroNum, data.key << 24 >> 24, data)) {
        W_Beep();
      }
      G.MacroNum = -1;
      return;
    }
  }
  for (c = 0; c < G.macrocnt; ++c) {
    if (G.macro[c].key === data.key) {
      if (!G.UseNewMacro) {
        if (G.rejectMacro && G.macro[c].type !== NBTM) {
          warning(S("NEWMACROs not allowed at this server!!"));
        } else {
          pnbtmacro(c);
        }
        return;
      }
      switch (G.macro[c].type) {
      case 0:
        pnbtmacro(c);
        return;
        break;
      case 1:
        warning(S("Send macro to which player?"));
        G.MacroNum = c;
        G.MacroMode = 1;
        return;
        break;
      case 3:
        {
          let j = null;
          let l = null;
          switch (G.macro[c].who) {
          case 3:
          case 4:
          case 1:
            targettype = TARG_PLAYER;
            if (G.macro[c].who === MACRO_ENEMY) {
              targettype |= TARG_ENEMY;
            } else if (G.macro[c].who === MACRO_FRIEND) {
              targettype |= TARG_FRIEND;
            }
            target = gettarget(data.Window, data.x, data.y, targettype | TARG_CLOAK);
            if (target.o_type === PLAYERTYPE) {
              j = $sadd(G.players, target.o_num);
              if ((j.p_flags & PFCLOAK) >>> 0) {
                G.maskrecip = 1;
              }
              who = j.p_mapchars[1];
            } else {
              who = G.me.p_mapchars[1];
              warning(S("Can only send a message to a player"));
            }
            break;
          case 2:
            target = gettarget(data.Window, data.x, data.y, TARG_PLAYER | TARG_PLANET);
            if (target.o_type === PLANETTYPE) {
              l = $sadd(G.planets, target.o_num);
              who = G.teamlet[l.pl_owner];
            } else if (target.o_type === PLAYERTYPE) {
              j = $sadd(G.players, target.o_num);
              who = j.p_mapchars[0];
            } else {
              who = G.me.p_mapchars[1];
              warning(S("Player or planet only please"));
            }
            break;
          default:
            who = G.me.p_mapchars[1];
            break;
          }
          if (!pmacro(c, who, data)) {
            W_Beep();
          }
          return;
          break;
        }
      case 4:
        if (!pmacro(c, G.macro[c].who, data)) {
          W_Beep();
        }
        found = 1;
        break;
      case 2:
        if (!pmacro(c, G.macro[c].who, data)) {
          W_Beep();
        }
        return;
        break;
      default:
        fprintf(R.stderr, S("Unknown Macro Type!  Jeff's a twink!!\n"));
        warning(S("Unknown macro type (eg There is a macro bug)"));
        return;
        break;
      }
    }
  }
  if (found) {
    return;
  }
  for (i = take; $sadd(G.distmacro, i).name; ++i) {
    if ($sadd(G.distmacro, i).c === data.key) {
      emergency(i, data);
      return;
    }
  }
  warning(S("Unknown macro"));
  W_Beep();
}

function Key32(data: struct_event | null): void {
  data = $cast(struct_event, data);
  W_UnmapWindow(G.planetw);
  W_UnmapWindow(G.rankw);
  if (G.infomapped) {
    destroyInfo();
  }
  W_UnmapWindow(G.helpWin);
  W_UnmapWindow(G.macroWin);
  if (G.defWin) {
    W_UnmapWindow(G.defWin);
  }
  W_UnmapWindow(G.war);
  if (G.optionWin) {
    optiondone();
  }
  if (G.udpWin) {
    udpdone();
  }
}

function Key33(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(11);
}

function Key34(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let ok = W_FullScreenToggle(G.baseWin);
  switch (ok) {
  case -1:
    warning(S("Full screen mode was not built in this program."));
    break;
  case 0:
    warning(S("Full screen mode toggled."));
    break;
  case 1:
    warning(S("Full screen mode not available here."));
    break;
  }
}

function Key35(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(G.me.p_ship.s_maxspeed / 2 | 0);
}

function Key36(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendTractorReq(0, G.me.p_no << 24 >> 24);
}

function Key37(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(99);
}

function Key38(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let mbuf = new Int8Array(80);
  if (strlen(P(G.defaultsFile)) > 0) {
    strcpy(P(mbuf), S("Re-reading "));
    strncat(P(mbuf), P(G.defaultsFile), 80 - strlen(P(mbuf)) - 1);
    warning(P(mbuf));
    initDefaults(P(G.defaultsFile));
    resetdefaults();
    initkeymap();
  } else {
    warning(S("no default file found"));
  }
}

async function Key39(data: struct_event | null): Promise<void> {
  data = $cast(struct_event, data);
  await sendUdpReq(COMM_UPDATE);
}

function Key40(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(10);
}

function Key41(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(10);
}

function Key42(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendShortPacket(11, 0);
}

function Key43(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!!G.udpWin && W_IsMapped(G.udpWin)) {
    udpdone();
  } else {
    let buf = new Int8Array(80);
    udpwindow();
    sprintf(P(buf), S("UDP client version %.1f"), UDPVERSION / 10);
    warning(P(buf));
  }
}

function Key44(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.pStats)) {
    W_UnmapWindow(G.pStats);
  } else {
    W_MapWindow(G.pStats);
    redrawPStats(null);
  }
}

function Key45(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendShortReq(SPK_SALL);
}

function Key46(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!!G.netstatWin && W_IsMapped(G.netstatWin)) {
    nsdone();
  } else {
    nswindow();
  }
}

function Key47(data: struct_event | null): void {
  data = $cast(struct_event, data);
  G.sortPlayers = !G.sortPlayers ? 1 : 0;
  RedrawPlayerList(null);
}

function Key48(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(0);
}

function Key49(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(1);
}

function Key50(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(2);
}

function Key51(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(3);
}

function Key52(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(4);
}

function Key53(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(5);
}

function Key54(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(6);
}

function Key55(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(7);
}

function Key56(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(8);
}

function Key57(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(9);
}

function Key58(data: struct_event | null): void {
  data = $cast(struct_event, data);
  G.logmess = !G.logmess ? 1 : 0;
  if (G.logmess) {
    warning(S("Message logging is ON"));
  } else {
    warning(S("Message logging is OFF"));
  }
}

function Key59(data: struct_event | null): void {
  data = $cast(struct_event, data);
  lockPlanetOrBase(data.Window, data.x, data.y);
}

function Key60(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(G.me.p_speed - 1);
}

async function Key61(data: struct_event | null): Promise<void> {
  data = $cast(struct_event, data);
  await sendUdpReq(COMM_UPDATE);
}

function Key62(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(G.me.p_speed + 1);
}

function Key63(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.phaserwin)) {
    G.phaserWindow = 1;
  }
  if (!W_IsMapped(G.reviewWin)) {
    if (W_IsMapped(G.messwa)) {
      W_UnmapWindow(G.messwa);
      W_UnmapWindow(G.phaserwin);
      W_UnmapWindow(G.messwt);
      W_UnmapWindow(G.messwi);
      W_UnmapWindow(G.messwk);
    } else {
      W_MapWindow(G.reviewWin);
    }
  } else {
    W_UnmapWindow(G.reviewWin);
    W_MapWindow(G.messwa);
    W_MapWindow(G.messwt);
    W_MapWindow(G.messwi);
    W_MapWindow(G.messwk);
    if (G.phaserWindow) {
      W_MapWindow(G.phaserwin);
    }
    if (W_IsMapped(G.statwin)) {
      W_UnmapWindow(G.statwin);
      W_MapWindow(G.statwin);
    }
  }
  if (G.optionWin) {
    optionredrawtarget(G.reviewWin);
    optionredrawtarget(G.messwa);
    optionredrawtarget(G.phaserwin);
    optionredrawtarget(G.messwt);
    optionredrawtarget(G.messwi);
    optionredrawtarget(G.messwk);
  }
}

function Key64(data: struct_event | null): void {
  data = $cast(struct_event, data);
  set_speed(12);
}

function Key65(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key66(data: struct_event | null): void {
  data = $cast(struct_event, data);
  ++G.showgalactic;
  if (G.showgalactic > 4) {
    G.showgalactic = 0;
  }
  G.redrawall = 2;
}

function Key67(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendShortPacket(26, 0);
  W_CameraSnap(G.w);
}

function Key68(data: struct_event | null): void {
  data = $cast(struct_event, data);
  detmine();
}

function Key69(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(generic, data);
}

function Key70(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(carrying, data);
}

function Key71(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key72(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key73(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!G.infomapped) {
    inform(data.Window, data.x, data.y, G.key << 24 >> 24);
    G.opened_info = Math.imul(G.keepInfo, G.server_ups) / 5 | 0;
  } else {
    destroyInfo();
    G.opened_info = -2;
  }
}

function Key74(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key75(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key76(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.playerw)) {
    W_UnmapWindow(G.playerw);
  } else {
    W_MapWindow(G.playerw);
  }
}

function Key77(data: struct_event | null): void {
  data = $cast(struct_event, data);
  showToolsWin();
}

function Key78(data: struct_event | null): void {
  data = $cast(struct_event, data);
  G.namemode = !G.namemode ? 1 : 0;
  if (G.optionWin) {
    optionredrawoption(P(G, "namemode"));
  }
}

function Key79(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!!G.optionWin && W_IsMapped(G.optionWin)) {
    optiondone();
  } else {
    optionwindow();
  }
}

function Key80(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.planetw)) {
    W_UnmapWindow(G.planetw);
  } else {
    W_MapWindow(G.planetw);
  }
}

function Key81(data: struct_event | null): void {
  data = $cast(struct_event, data);
  Play_Sound(SELF_DESTRUCT_SOUND);
  sendShortPacket(7, 0);
}

function Key82(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendShortPacket(13, 1);
}

function Key83(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.statwin)) {
    W_UnmapWindow(G.statwin);
  } else {
    W_MapWindow(G.statwin);
  }
}

function Key84(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if ((G.me.p_flags & (PFTRACT | PFPRESS)) >>> 0) {
    sendTractorReq(0, G.me.p_no << 24 >> 24);
    return;
  }
  G.target = gettarget(data.Window, data.x, data.y, TARG_PLAYER);
  G.me.p_tractor = G.target.o_num << 16 >> 16;
  if (G.key === 84) {
    sendTractorReq(1, G.target.o_num << 24 >> 24);
  } else {
    sendRepressReq(1, G.target.o_num << 24 >> 24);
  }
}

function Key85(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.rankw)) {
    W_UnmapWindow(G.rankw);
  } else {
    W_MapWindow(G.rankw);
  }
}

function Key86(data: struct_event | null): void {
  data = $cast(struct_event, data);
  ++G.showlocal;
  if (G.showlocal > 4) {
    G.showlocal = 0;
  }
}

function Key87(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key88(data: struct_event | null): void {
  data = $cast(struct_event, data);
  macro_on();
}

function Key89(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key90(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key91(data: struct_event | null): void {
  data = $cast(struct_event, data);
  shield_down();
}

function Key92(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (G.netstat) {
    if (!!G.lMeter && W_IsMapped(G.lMeter)) {
      W_UnmapWindow(G.lMeter);
    } else {
      W_MapWindow(G.lMeter);
    }
  } else {
    warning(S("Network stats are not being collected!"));
  }
}

function Key93(data: struct_event | null): void {
  data = $cast(struct_event, data);
  shield_up();
}

function Key94(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if ((G.me.p_flags & (PFTRACT | PFPRESS)) >>> 0) {
    sendRepressReq(0, G.me.p_no << 24 >> 24);
  }
  G.target = gettarget(data.Window, data.x, data.y, TARG_PLAYER);
  G.me.p_tractor = G.target.o_num << 16 >> 16;
  sendRepressReq(1, G.target.o_num << 24 >> 24);
}

function Key95(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if ((G.me.p_flags & (PFTRACT | PFPRESS)) >>> 0) {
    sendTractorReq(0, G.me.p_no << 24 >> 24);
  }
  G.target = gettarget(data.Window, data.x, data.y, TARG_PLAYER);
  G.me.p_tractor = G.target.o_num << 16 >> 16;
  sendTractorReq(1, G.target.o_num << 24 >> 24);
}

function Key96(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!!G.spWin && W_IsMapped(G.spWin)) {
    spdone();
  } else {
    spwindow();
  }
}

function Key98(data: struct_event | null): void {
  data = $cast(struct_event, data);
  bomb_planet();
}

function Key99(data: struct_event | null): void {
  data = $cast(struct_event, data);
  cloak();
}

function Key100(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let curtime = 0;
  curtime = ustime();
  if (curtime >= Key100$lastdet + $u64(1000000 / G.server_fps | 0)) {
    sendShortPacket(20, 0);
    Key100$lastdet = curtime;
  }
  G.detCircle = 1;
}

function Key101(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if ((G.me.p_flags & PFDOCKOK) >>> 0) {
    sendShortPacket(30, 0);
  } else {
    sendShortPacket(30, 1);
  }
}

function Key102(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let course = 0;
  course = getcourse(data.Window, data.x, data.y) & 0xff;
  sendShortPacket(5, (G.rotate ? course - G.rotate_deg : course) << 24 >> 24);
}

function Key103(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key104(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.helpWin)) {
    W_UnmapWindow(G.helpWin);
  } else {
    fillhelp(null);
    W_MapWindow(G.helpWin);
  }
  if (G.optionWin) {
    optionredrawtarget(G.helpWin);
  }
}

function Key105(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!G.infomapped) {
    inform(data.Window, data.x, data.y, G.key << 24 >> 24);
    G.opened_info = Math.imul(G.keepInfo, G.server_ups) / 5 | 0;
  } else {
    destroyInfo();
    G.opened_info = -2;
  }
}

function Key106(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key107(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let course = 0;
  if ((G.me.p_flags & PFOBSERV) >>> 0) {
    warning(S("Course change ignored while observing!"));
    return;
  }
  course = getcourse(data.Window, data.x, data.y) & 0xff;
  set_course(course);
  G.me.p_flags = (G.me.p_flags & 4294918143) >>> 0;
}

function Key108(data: struct_event | null): void {
  data = $cast(struct_event, data);
  G.target = gettarget(data.Window, data.x, data.y, TARG_PLAYER | TARG_PLANET);
  if (G.target.o_type === PLAYERTYPE) {
    sendShortPacket(16, G.target.o_num << 24 >> 24);
    G.me.p_playerl = G.target.o_num << 16 >> 16;
  } else {
    sendShortPacket(15, G.target.o_num << 24 >> 24);
    G.me.p_planet = G.target.o_num << 16 >> 16;
  }
}

export function Key109(data: struct_event | null): void {
  data = $cast(struct_event, data);
  Play_Sound(MESSAGE_SOUND);
  message_on();
}

function Key110(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key111(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendShortPacket(14, 1);
}

function Key112(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let course = 0;
  course = getcourse(data.Window, data.x, data.y) & 0xff;
  sendShortPacket(4, (G.rotate ? course - G.rotate_deg : course) << 24 >> 24);
}

function Key113(data: struct_event | null): void {
  data = $cast(struct_event, data);
  Play_Sound(SELF_DESTRUCT_SOUND);
  G.fastQuit = 1;
  sendShortPacket(7, 0);
}

function Key114(data: struct_event | null): void {
  data = $cast(struct_event, data);
  G.localflags = (G.localflags | PFREFIT) >>> 0;
  warning(S("s=scout, d=destroyer, c=cruiser, b=battleship, a=assault, g=galaxy, o=starbase/outpost"));
}

function Key115(data: struct_event | null): void {
  data = $cast(struct_event, data);
  shield_tog();
}

function Key116(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let course = 0;
  course = getcourse(data.Window, data.x, data.y) & 0xff;
  sendShortPacket(6, (G.rotate ? course - G.rotate_deg : course) << 24 >> 24);
}

function Key117(data: struct_event | null): void {
  data = $cast(struct_event, data);
  shield_tog();
}

function Key118(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key119(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (W_IsMapped(G.war)) {
    W_UnmapWindow(G.war);
  } else {
    warwindow();
  }
}

function Key120(data: struct_event | null): void {
  data = $cast(struct_event, data);
  beam_down();
}

function Key121(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if ((G.me.p_flags & (PFTRACT | PFPRESS)) >>> 0) {
    sendTractorReq(0, G.me.p_no << 24 >> 24);
    return;
  }
  G.target = gettarget(data.Window, data.x, data.y, TARG_PLAYER);
  G.me.p_tractor = G.target.o_num << 16 >> 16;
  if (G.key === 84) {
    sendTractorReq(1, G.target.o_num << 24 >> 24);
  } else {
    sendRepressReq(1, G.target.o_num << 24 >> 24);
  }
}

function Key122(data: struct_event | null): void {
  data = $cast(struct_event, data);
  beam_up();
}

function Key123(data: struct_event | null): void {
  data = $cast(struct_event, data);
  cloak_on();
}

function Key124(data: struct_event | null): void {
  data = $cast(struct_event, data);
  sendShortReq(SPK_ALL);
}

function Key125(data: struct_event | null): void {
  data = $cast(struct_event, data);
  cloak_off();
}

function Key126(data: struct_event | null): void {
  data = $cast(struct_event, data);
  if (!!G.soundWin && W_IsMapped(G.soundWin)) {
    sounddone();
  } else {
    soundwindow();
  }
}

function Key127(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emptyKey(data);
}

function Key180(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(take, data);
}

function Key212(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(take, data);
}

function Key207(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(ogg, data);
}

function Key194(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(bomb, data);
}

function Key195(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(space_control, data);
}

function Key145(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(save_planet, data);
}

function Key146(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(base_ogg, data);
}

function Key147(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(help1, data);
}

function Key148(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(help2, data);
}

function Key197(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(escorting, data);
}

function Key208(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(ogging, data);
}

function Key205(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(bombing, data);
}

function Key204(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(controlling, data);
}

function Key175(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(ogging, data);
}

function Key162(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(bombing, data);
}

function Key163(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(controlling, data);
}

function Key149(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(asw, data);
}

function Key150(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(asbomb, data);
}

function Key151(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(doing1, data);
}

function Key152(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(doing2, data);
}

function Key198(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(free_beer, data);
}

function Key206(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(no_gas, data);
}

function Key200(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(crippled, data);
}

function Key153(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(pickup, data);
}

function Key144(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(pop, data);
}

function Key160(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(other1, data);
}

function Key131(data: struct_event | null): void {
  data = $cast(struct_event, data);
  emergency(other2, data);
}

export function $init(): void {
  G.detallow = 1;
  docline = 0;
  xtrekrcline = 0;
  G.opened_info = -2;
  G.target = null;
  G.key = 32;
  G.key_handlers = $sarrOf([struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key32),
struct_key_handler_type.$of(Key33),
struct_key_handler_type.$of(Key34),
struct_key_handler_type.$of(Key35),
struct_key_handler_type.$of(Key36),
struct_key_handler_type.$of(Key37),
struct_key_handler_type.$of(Key38),
struct_key_handler_type.$of(Key39),
struct_key_handler_type.$of(Key40),
struct_key_handler_type.$of(Key41),
struct_key_handler_type.$of(Key42),
struct_key_handler_type.$of(Key43),
struct_key_handler_type.$of(Key44),
struct_key_handler_type.$of(Key45),
struct_key_handler_type.$of(Key46),
struct_key_handler_type.$of(Key47),
struct_key_handler_type.$of(Key48),
struct_key_handler_type.$of(Key49),
struct_key_handler_type.$of(Key50),
struct_key_handler_type.$of(Key51),
struct_key_handler_type.$of(Key52),
struct_key_handler_type.$of(Key53),
struct_key_handler_type.$of(Key54),
struct_key_handler_type.$of(Key55),
struct_key_handler_type.$of(Key56),
struct_key_handler_type.$of(Key57),
struct_key_handler_type.$of(Key58),
struct_key_handler_type.$of(Key59),
struct_key_handler_type.$of(Key60),
struct_key_handler_type.$of(Key61),
struct_key_handler_type.$of(Key62),
struct_key_handler_type.$of(Key63),
struct_key_handler_type.$of(Key64),
struct_key_handler_type.$of(Key65),
struct_key_handler_type.$of(Key66),
struct_key_handler_type.$of(Key67),
struct_key_handler_type.$of(Key68),
struct_key_handler_type.$of(Key69),
struct_key_handler_type.$of(Key70),
struct_key_handler_type.$of(Key71),
struct_key_handler_type.$of(Key72),
struct_key_handler_type.$of(Key73),
struct_key_handler_type.$of(Key74),
struct_key_handler_type.$of(Key75),
struct_key_handler_type.$of(Key76),
struct_key_handler_type.$of(Key77),
struct_key_handler_type.$of(Key78),
struct_key_handler_type.$of(Key79),
struct_key_handler_type.$of(Key80),
struct_key_handler_type.$of(Key81),
struct_key_handler_type.$of(Key82),
struct_key_handler_type.$of(Key83),
struct_key_handler_type.$of(Key84),
struct_key_handler_type.$of(Key85),
struct_key_handler_type.$of(Key86),
struct_key_handler_type.$of(Key87),
struct_key_handler_type.$of(Key88),
struct_key_handler_type.$of(Key89),
struct_key_handler_type.$of(Key90),
struct_key_handler_type.$of(Key91),
struct_key_handler_type.$of(Key92),
struct_key_handler_type.$of(Key93),
struct_key_handler_type.$of(Key94),
struct_key_handler_type.$of(Key95),
struct_key_handler_type.$of(Key96),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key98),
struct_key_handler_type.$of(Key99),
struct_key_handler_type.$of(Key100),
struct_key_handler_type.$of(Key101),
struct_key_handler_type.$of(Key102),
struct_key_handler_type.$of(Key103),
struct_key_handler_type.$of(Key104),
struct_key_handler_type.$of(Key105),
struct_key_handler_type.$of(Key106),
struct_key_handler_type.$of(Key107),
struct_key_handler_type.$of(Key108),
struct_key_handler_type.$of(Key109),
struct_key_handler_type.$of(Key110),
struct_key_handler_type.$of(Key111),
struct_key_handler_type.$of(Key112),
struct_key_handler_type.$of(Key113),
struct_key_handler_type.$of(Key114),
struct_key_handler_type.$of(Key115),
struct_key_handler_type.$of(Key116),
struct_key_handler_type.$of(Key117),
struct_key_handler_type.$of(Key118),
struct_key_handler_type.$of(Key119),
struct_key_handler_type.$of(Key120),
struct_key_handler_type.$of(Key121),
struct_key_handler_type.$of(Key122),
struct_key_handler_type.$of(Key123),
struct_key_handler_type.$of(Key124),
struct_key_handler_type.$of(Key125),
struct_key_handler_type.$of(Key126),
struct_key_handler_type.$of(Key127),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key131),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key144),
struct_key_handler_type.$of(Key145),
struct_key_handler_type.$of(Key146),
struct_key_handler_type.$of(Key147),
struct_key_handler_type.$of(Key148),
struct_key_handler_type.$of(Key149),
struct_key_handler_type.$of(Key150),
struct_key_handler_type.$of(Key151),
struct_key_handler_type.$of(Key152),
struct_key_handler_type.$of(Key153),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key160),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key162),
struct_key_handler_type.$of(Key163),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key175),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key180),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key194),
struct_key_handler_type.$of(Key195),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key197),
struct_key_handler_type.$of(Key198),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key200),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key204),
struct_key_handler_type.$of(Key205),
struct_key_handler_type.$of(Key206),
struct_key_handler_type.$of(Key207),
struct_key_handler_type.$of(Key208),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(Key212),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey),
struct_key_handler_type.$of(emptyKey)]);
  Key100$lastdet = 0;
}
