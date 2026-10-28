// @ts-nocheck
// COW 3.3.3 smessage.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { dmessage } from './dmessage.ts';
import { sendMessage } from './socket.ts';
import { sendTools } from './tools.ts';
import { warning } from './warning.ts';
import { W_Beep, W_ClearArea, W_ClearWindow, W_DefineLocalcursor, W_DefineMapcursor, W_DefineTextCursor, W_WindowHeight, W_WriteText } from './x11window.ts';
import { $rd, $sadd, $ta, $view8, $wr, G, P, S, __ctype_b_loc, sprintf, strcat, strchr, strcpy, strlen, strncat } from '../rt/index.ts';
import { ADDRLEN, FED, KLI, MALL, MAXPLAYER, MGOD, MINDIV, MMOO, MTEAM, MTOOLS, ORI, PFREE, ROM, _IScntrl } from './consts.ts';

let lcount: number;
let HUDoffset: number;
let talkative: number;
let buf: any;
let cursor: any;
let mbuf: any;
let smessage$addr: number;
let smessage$addr_str: Ptr | null;
let smessage$pm: Ptr | null;
let getaddr2$addrmesg: any;

export function DisplayMessage(): void {
  let len = strlen(P(G.outmessage)) | 0;
  if (HUDoffset) {
    W_WriteText(G.w, 5, HUDoffset, G.textColor, P(G.outmessage), len, G.W_RegularFont);
  }
  W_ClearWindow(G.messagew);
  if (len === 0 && talkative < 5 && !G.serverDead) {
    W_WriteText(G.messagew, 5, 5, G.W_Red, S("Talk to everyone, click here, type, press enter.  Read and learn."), -1, G.W_RegularFont);
  } else {
    W_WriteText(G.messagew, 5, 5, G.textColor, P(G.outmessage), len, G.W_RegularFont);
  }
}

export function AddChar(twochar: Ptr | null): void {
  if (HUDoffset) {
    W_WriteText(G.w, 5 + Math.imul(G.W_Textwidth, lcount), HUDoffset, G.textColor, twochar, 2, G.W_RegularFont);
  }
  W_WriteText(G.messagew, 5 + Math.imul(G.W_Textwidth, lcount), 5, G.textColor, twochar, 2, G.W_RegularFont);
}

export function BlankChar(HUDoffsetcol: number, len: number): void {
  if (HUDoffset) {
    W_ClearArea(G.w, 5 + Math.imul(G.W_Textwidth, HUDoffsetcol), HUDoffset, Math.imul(G.W_Textwidth, len), G.W_Textheight);
  }
  W_ClearArea(G.messagew, 5 + Math.imul(G.W_Textwidth, HUDoffsetcol), 5, Math.imul(G.W_Textwidth, len), G.W_Textheight);
}

export function DrawCursor(col: number): void {
  if (HUDoffset) {
    W_WriteText(G.w, 5 + Math.imul(G.W_Textwidth, col), HUDoffset, G.textColor, P(cursor, 0), 1, G.W_RegularFont);
  }
  W_WriteText(G.messagew, 5 + Math.imul(G.W_Textwidth, col), 5, G.textColor, P(cursor, 0), 1, G.W_RegularFont);
}

export function smessage(ichar: number): void {
  let i = 0;
  let twochar = new Int8Array(2);
  if (G.messpend === 0) {
    G.messpend = 1;
    switch (G.messageHUD) {
    case 1:
      HUDoffset = 5;
      break;
    case 2:
      HUDoffset = W_WindowHeight(G.w) - G.W_Textheight - 5;
      break;
    default:
      HUDoffset = 0;
    }
    if (G.keys[0] !== 0) {
      if (smessage$pm = strchr($view8(P(G.keys), true), ichar)) {
        ichar = G.macroKeys[smessage$pm.o - $view8(P(G.keys), true).o].dest << 24 >> 24;
      }
    }
    if (ichar === 116 || ichar === 84) {
      smessage$addr = G.teamlet[G.me.p_team];
    } else {
      smessage$addr = ichar;
    }
    smessage$addr_str = getaddr(smessage$addr);
    if (!smessage$addr_str) {
      G.messpend = 0;
      message_off();
      return;
    }
    strcat(P(G.outmessage), smessage$addr_str);
    lcount = ADDRLEN;
    DrawCursor(ADDRLEN);
    while (strlen(P(G.outmessage)) < ADDRLEN) {
      strcat(P(G.outmessage), S(" "));
    }
    strcat(P(G.outmessage), S("_"));
    DisplayMessage();
    return;
  }
  if (ichar === -56 || ichar === -88) {
    ichar = 8;
  } else if (ichar === -69) {
    ichar = 27;
  } else if (ichar === -51 || ichar === -83) {
    ichar = 13;
  } else if (ichar === -54 || ichar === -86) {
    ichar = 13;
  } else if (ichar === -43 || ichar === -75) {
    ichar = 23;
  }
  switch (ichar & 0xff & ~128) {
  case 8:
  case 127:
    if (--lcount < ADDRLEN) {
      lcount = ADDRLEN;
      break;
    }
    BlankChar(lcount + 1, 1);
    DrawCursor(lcount);
    G.outmessage[lcount + 1] = 0;
    G.outmessage[lcount] = cursor[0];
    break;
  case 27:
    BlankChar(0, lcount + 1);
    G.mdisplayed = 0;
    G.messpend = 0;
    message_off();
    for (i = 0; i < 80; ++i) {
      G.outmessage[i] = 0;
    }
    DisplayMessage();
    break;
  case 23:
    while (--lcount >= ADDRLEN) {
      BlankChar(lcount + 1, 1);
      DrawCursor(lcount);
      G.outmessage[lcount + 1] = 0;
      G.outmessage[lcount] = cursor[0];
    }
    lcount = ADDRLEN;
    break;
  case 13:
    ++talkative;
    buf[lcount - ADDRLEN] = 0;
    G.messpend = 0;
    for (i = 0; i < 80; ++i) {
      G.outmessage[i] = 0;
    }
    switch (smessage$addr) {
    case 65:
      pmessage(P(buf), 0, MALL);
      break;
    case 70:
      pmessage(P(buf), FED, MTEAM);
      break;
    case 82:
      pmessage(P(buf), ROM, MTEAM);
      break;
    case 75:
      pmessage(P(buf), KLI, MTEAM);
      break;
    case 79:
      pmessage(P(buf), ORI, MTEAM);
      break;
    case 71:
      pmessage(P(buf), 0, MGOD);
      break;
    case 33:
      pmessage(P(buf), 0, MTOOLS);
      break;
    case 77:
      pmessage(P(buf), 0, MMOO);
      break;
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
      if ($sadd(G.players, (smessage$addr - 48)).p_status === PFREE) {
        warning(S("That player left the game. message not sent."));
        return;
      }
      pmessage(P(buf), smessage$addr - 48, MINDIV);
      break;
    case 97:
    case 98:
    case 99:
    case 100:
    case 101:
    case 102:
    case 103:
    case 104:
    case 105:
    case 106:
    case 107:
    case 108:
    case 109:
    case 110:
    case 111:
    case 112:
    case 113:
    case 114:
    case 115:
    case 116:
    case 117:
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
      if ($sadd(G.players, (smessage$addr - 97 + 10)).p_status === PFREE) {
        warning(S("That player left the game. message not sent."));
        return;
      }
      pmessage(P(buf), smessage$addr - 97 + 10, MINDIV);
      break;
    default:
      warning(S("Not legal recipient"));
    }
    BlankChar(0, lcount + 1);
    DisplayMessage();
    G.mdisplayed = 0;
    lcount = 0;
    break;
  default:
    if (lcount >= 79) {
      W_Beep();
      break;
    }
    if ($rd($rd(__ctype_b_loc()), (ichar & 0xff & ~128)) & _IScntrl) {
      break;
    }
    twochar[0] = ichar;
    twochar[1] = cursor[0];
    AddChar(P(twochar));
    G.outmessage[lcount] = ichar;
    G.outmessage[lcount + 1] = cursor[0];
    buf[lcount++ - ADDRLEN] = ichar;
    break;
  }
}

export function pmessage(str: Ptr | null, recip: number, group: number): void {
  let newbuf = new Int8Array(100);
  G.lastMessage[0] = 0;
  strncat(P(G.lastMessage), str, 79);
  str = P(G.lastMessage);
  switch (group) {
  case 20:
    sendTools(str);
    break;
  case 18:
    strcpy(P(G.defaultsFile), str);
    sprintf(P(mbuf), S("changing defaultsFile to %s"), str);
    warning(P(mbuf));
    break;
  default:
    sendMessage(str, group, recip);
  }
  if (group === MTEAM && recip !== G.me.p_team || group === MINDIV && recip !== G.me.p_no) {
    sprintf(P(newbuf), S("%s  %s"), getaddr2(group, recip), str);
    newbuf[79] = 0;
    dmessage(P(newbuf), group & 0xff, G.me.p_no & 0xff, recip & 0xff);
  }
  message_off();
}

export function getaddr(who: number): Ptr | null {
  switch (who) {
  case 65:
    return getaddr2(MALL, 0);
  case 70:
    return getaddr2(MTEAM, FED);
  case 82:
    return getaddr2(MTEAM, ROM);
  case 75:
    return getaddr2(MTEAM, KLI);
  case 79:
    return getaddr2(MTEAM, ORI);
  case 71:
    return getaddr2(MGOD, 0);
  case 77:
    return getaddr2(MMOO, 0);
  case 33:
    return getaddr2(MTOOLS, 0);
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
    if ($sadd(G.players, (who - 48)).p_status === PFREE) {
      warning(S("Slot is not alive."));
      return null;
    }
    return getaddr2(MINDIV, who - 48);
    break;
  case 97:
  case 98:
  case 99:
  case 100:
  case 101:
  case 102:
  case 103:
  case 104:
  case 105:
  case 106:
  case 107:
  case 108:
  case 109:
  case 110:
  case 111:
  case 112:
  case 113:
  case 114:
  case 115:
  case 116:
  case 117:
  case 118:
  case 119:
  case 120:
  case 121:
  case 122:
    if (who - 97 + 10 > MAXPLAYER) {
      warning(S("Player is not in game"));
      return null;
    }
    if ($sadd(G.players, (who - 97 + 10)).p_status === PFREE) {
      warning(S("Slot is not alive."));
      return null;
    }
    return getaddr2(MINDIV, who - 97 + 10);
    break;
  default:
    warning(S("Not legal recipient"));
    return null;
  }
}

export function getaddr2(flags: number, recip: number): Ptr | null {
  sprintf(P(getaddr2$addrmesg), S(" %c%c->"), G.teamlet[G.me.p_team], G.shipnos.a[G.shipnos.o + G.me.p_no]);
  switch (flags) {
  case 8:
    sprintf(P(getaddr2$addrmesg, 5), S("ALL"));
    break;
  case 4:
    sprintf(P(getaddr2$addrmesg, 5), S("%s"), G.teamshort[recip]);
    break;
  case 2:
    if (G.maskrecip) {
      sprintf(P(getaddr2$addrmesg, 5), S("?? "));
      G.maskrecip = 0;
    } else {
      sprintf(P(getaddr2$addrmesg, 5), S("%c%c "), G.teamlet[$sadd(G.players, recip).p_team], G.shipnos.a[G.shipnos.o + recip]);
    }
    break;
  case 16:
    sprintf(P(getaddr2$addrmesg, 5), S("GOD"));
    break;
  case 20:
    sprintf(P(getaddr2$addrmesg), S("COW: sh>"));
    break;
  case 18:
    sprintf(P(getaddr2$addrmesg, 5), S("MOO"));
    break;
  }
  return P(getaddr2$addrmesg);
}

export function message_on(): void {
  G.messageon = 1;
  W_DefineTextCursor(G.w);
  W_DefineTextCursor(G.mapw);
  G.messMouseDelta = 0;
  if (lcount) {
    DisplayMessage();
  }
}

export function message_off(): void {
  G.messageon = 0;
  W_DefineLocalcursor(G.w);
  W_DefineMapcursor(G.mapw);
}

export function message_hold(): void {
  let twochar = $ta(Int8Array, 2, [35, 32]);
  AddChar(P(twochar));
  message_off();
}

export function getgroup(addr: number, recip: Ptr | null): number {
  recip.a[recip.o] = 0;
  switch (addr) {
  case 65:
    recip.a[recip.o] = 0;
    return MALL;
    break;
  case 70:
    recip.a[recip.o] = FED;
    return MTEAM;
    break;
  case 82:
    recip.a[recip.o] = ROM;
    return MTEAM;
    break;
  case 75:
    recip.a[recip.o] = KLI;
    return MTEAM;
    break;
  case 79:
    recip.a[recip.o] = ORI;
    return MTEAM;
    break;
  case 71:
    recip.a[recip.o] = 0;
    return MGOD;
    break;
  case 33:
    recip.a[recip.o] = 0;
    return MTOOLS;
    break;
  case 77:
    recip.a[recip.o] = 0;
    return MMOO;
    break;
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
    if ($sadd(G.players, (addr - 48)).p_status === PFREE) {
      warning(S("That player left the game. message not sent."));
      return 0;
    }
    recip.a[recip.o] = addr - 48;
    return MINDIV;
    break;
  case 97:
  case 98:
  case 99:
  case 100:
  case 101:
  case 102:
  case 103:
  case 104:
  case 105:
  case 106:
  case 107:
  case 108:
  case 109:
  case 110:
  case 111:
  case 112:
  case 113:
  case 114:
  case 115:
  case 116:
  case 117:
  case 118:
  case 119:
  case 120:
  case 121:
  case 122:
    if ($sadd(G.players, (addr - 97 + 10)).p_status === PFREE) {
      warning(S("That player left the game. message not sent."));
      return 0;
    }
    recip.a[recip.o] = addr - 97 + 10;
    return MINDIV;
    break;
  default:
    warning(S("Not legal recipient"));
  }
  return 0;
}

export function pnbtmacro(c: number): void {
  switch (G.macro[c].who) {
  case 65:
    pmessage(G.macro[c].string, 0, MALL);
    break;
  case 70:
    pmessage(G.macro[c].string, FED, MTEAM);
    break;
  case 82:
    pmessage(G.macro[c].string, ROM, MTEAM);
    break;
  case 75:
    pmessage(G.macro[c].string, KLI, MTEAM);
    break;
  case 79:
    pmessage(G.macro[c].string, ORI, MTEAM);
    break;
  case 84:
    pmessage(G.macro[c].string, G.me.p_team, MTEAM);
    break;
  }
}

export function $init(): void {
  lcount = 0;
  HUDoffset = 0;
  talkative = 0;
  buf = new Int8Array(80);
  cursor = new Int8Array(1);
  cursor[0] = 95;
  mbuf = new Int8Array(80);
  smessage$addr = 0;
  smessage$addr_str = null;
  smessage$pm = null;
  getaddr2$addrmesg = new Int8Array(10);
}
