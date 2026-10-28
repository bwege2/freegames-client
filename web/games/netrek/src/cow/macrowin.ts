// @ts-nocheck
// COW 3.3.3 macrowin.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_ClearWindow, W_DefineTrekCursor, W_IsMapped, W_MakeTextWindow, W_MapWindow, W_ResizeTextWindow, W_SetWindowButtonHandler, W_SetWindowExposeHandler, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $arr, $cast, $sadd, $u64, G, P, S, memccpy, sprintf, strcat, strlen } from '../rt/index.ts';
import { BORDER, MAXMACRO, NEWMMOUSE, NUMLINES } from './consts.ts';


function formatline(line: Ptr | null): number {
  let end = 0;
  let temp = null;
  let num = 0;
  if (!line) {
    return 0;
  }
  if (line.a[line.o] === 32) {
    line = line.add(1);
  }
  if (strlen(line) <= MAXMACRO) {
    memccpy(P(G.maclines[num]), line, 0, 65);
    ++G.lineno;
    return 1;
  }
  temp = line;
  while (1) {
    end = MAXMACRO - 1;
    if ($u64(end) > strlen(temp)) {
      ++G.lineno;
      memccpy(P(G.maclines[num++]), temp, 0, 65);
      return num;
    } else {
      for (; temp.a[temp.o + end] !== 37; --end) {
        ;
      }
    }
    ++G.lineno;
    memccpy(P(G.maclines[num++]), temp, 0, $u64(end));
    temp = temp.add(end);
  }
}

function filldist(fill: number): void {
  let i = 0;
  let row = 0;
  let c = 0;
  let num = 0;
  let key = new Int8Array(3);
  G.lineno = 0;
  for (i = 1, row = 6; $sadd(G.distmacro, i).macro; ++i) {
    if (fill) {
      if ($sadd(G.distmacro, i).c < 128) {
        sprintf(P(key), S("%c"), $sadd(G.distmacro, i).c);
      } else {
        sprintf(P(key), S("^%c"), $sadd(G.distmacro, i).c - 96);
      }
      sprintf(P(G.maclines[0]), S("%-7s %s"), P(key), $sadd(G.distmacro, i).name);
      W_WriteText(G.macroWin, 2, row++, G.W_Yellow, P(G.maclines[0]), strlen(P(G.maclines[0])) | 0, G.W_RegularFont);
    }
    ++G.lineno;
    num = formatline($sadd(G.distmacro, i).macro);
    if (fill) {
      for (c = 0; c < num; ++c) {
        W_WriteText(G.macroWin, 10, row++, G.textColor, P(G.maclines[c]), strlen(P(G.maclines[c])) | 0, G.W_RegularFont);
      }
    }
    if (G.lineno > NUMLINES) {
      continue;
    }
  }
}

export function fillmacro(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let row = 0;
  let i = 0;
  let macromessage = new Int8Array(255);
  W_ClearWindow(G.macroWin);
  sprintf(P(macromessage), S("Packages active:  NBT%s%s"), G.UseNewMacro ? S(", NEWMACRO") : S(""), G.UseSmartMacro ? S(", SMARTMACRO") : S(""));
  W_WriteText(G.macroWin, 2, 1, G.textColor, P(macromessage), strlen(P(macromessage)) | 0, G.W_RegularFont);
  sprintf(P(macromessage), S("Currently showing: %s"), G.maclevel ? S("Macros") : S("RCDS"));
  W_WriteText(G.macroWin, 2, 2, G.textColor, P(macromessage), strlen(P(macromessage)) | 0, G.W_RegularFont);
  if (G.maclevel === 0) {
    W_WriteText(G.macroWin, 2, 4, G.W_Yellow, S("Key     Distress Name"), 21, G.W_RegularFont);
    filldist(1);
    return;
  }
  for (row = 4, i = 0; i < G.macrocnt; ++row, ++i) {
    if (G.macro[i].key <= 128) {
      sprintf(P(macromessage), S("%c "), G.macro[i].key);
    } else {
      sprintf(P(macromessage), S("^%c"), G.macro[i].key - 96);
    }
    if (G.macro[i].type === NEWMMOUSE) {
      switch (G.macro[i].who) {
      case 1:
        strcat(P(macromessage), S(" PL MS "));
        break;
      case 2:
        strcat(P(macromessage), S(" TM MS "));
        break;
      default:
        strcat(P(macromessage), S(" SELF  "));
        break;
      }
    } else {
      switch (G.macro[i].who) {
      case 84:
        strcat(P(macromessage), S(" TEAM  "));
        break;
      case 65:
        strcat(P(macromessage), S(" ALL   "));
        break;
      case 70:
        strcat(P(macromessage), S(" FED   "));
        break;
      case 82:
        strcat(P(macromessage), S(" ROM   "));
        break;
      case 75:
        strcat(P(macromessage), S(" KLI   "));
        break;
      case 79:
        strcat(P(macromessage), S(" ORI   "));
        break;
      case 77:
        strcat(P(macromessage), S(" MOO   "));
        break;
      case 33:
        strcat(P(macromessage), S(" SHELL "));
        break;
      case 0:
        strcat(P(macromessage), S(" SPEC  "));
        break;
      default:
        strcat(P(macromessage), S(" ----  "));
        break;
      }
    }
    strcat(P(macromessage), G.macro[i].string);
    macromessage[MAXMACRO] = 0;
    W_WriteText(G.macroWin, 2, row, G.textColor, P(macromessage), strlen(P(macromessage)) | 0, G.W_RegularFont);
  }
}

function switchmacros(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let num = G.macrocnt + 5;
  if (!G.macroWin) {
    return;
  }
  G.maclevel = Math.abs(G.maclevel - 1);
  if (G.maclevel === 0) {
    G.lineno = 0;
    filldist(0);
    num = G.lineno + 6;
  }
  W_ResizeTextWindow(G.macroWin, 80, num);
  W_SetWindowExposeHandler(G.macroWin, fillmacro);
  W_SetWindowButtonHandler(G.macroWin, switchmacros);
  W_MapWindow(G.macroWin);
}

export function showMacroWin(): void {
  let num = G.macrocnt + 5;
  if (!G.macroWin) {
    if (G.maclevel === 0) {
      G.lineno = 0;
      filldist(0);
      num = G.lineno + 6;
    }
    G.macroWin = W_MakeTextWindow(S("macrow"), (G.small_screen ? 400 : 500) + BORDER, BORDER, 80, num, null, BORDER);
    W_ResizeTextWindow(G.macroWin, 80, num);
    W_DefineTrekCursor(G.macroWin);
    W_SetWindowExposeHandler(G.macroWin, fillmacro);
    W_SetWindowButtonHandler(G.macroWin, switchmacros);
    W_MapWindow(G.macroWin);
  } else if (W_IsMapped(G.macroWin)) {
    W_UnmapWindow(G.macroWin);
  } else {
    W_MapWindow(G.macroWin);
  }
}

export function $init(): void {
  G.lineno = 0;
  G.maclines = $arr(10, () => new Int8Array(65));
  G.maclevel = 0;
}
