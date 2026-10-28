// @ts-nocheck
// COW 3.3.3 warning.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_ClearArea, W_WriteText } from './x11window.ts';
import { G, P, S, fflush, fprintf, localtime, puts, sprintf, strlen, strncmp, time } from '../rt/index.ts';
import { WARNTIME } from './consts.ts';


export function warning(text: Ptr | null): void {
  let doPhaser = 0;
  const curtime = new Float64Array(1);
  let tm = null;
  let newtext = new Int8Array(128);
  if (G.warncount > 0) {
    W_ClearArea(G.warnw, 5, 5, Math.imul(G.W_Textwidth, G.warncount), G.W_Textheight);
  }
  doPhaser = G.showPhaser && strncmp(text, S("Phaser burst"), 12) === 0 ? 1 : 0;
  G.warncount = strlen(text) | 0;
  if (doPhaser && G.phaserShowStats) {
    sprintf(P(newtext), S("%s [%2d%%]"), text, G.phaserStatTry ? G.phaserStatHit * 100 / G.phaserStatTry | 0 : 0);
    G.warncount += 6;
    W_WriteText(G.warnw, 5, 5, G.textColor, P(newtext), G.warncount, G.W_RegularFont);
  } else {
    W_WriteText(G.warnw, 5, 5, G.textColor, text, G.warncount, G.W_RegularFont);
  }
  G.warntimer = G.udcounter + (Math.imul(WARNTIME, G.server_ups) / 5 | 0);
  if (G.logmess || doPhaser) {
    time(P(curtime, 0));
    tm = localtime(P(curtime, 0));
    sprintf(P(newtext), S("%.100s %02d:%02d:%02d"), doPhaser && G.phaserShowStats ? P(newtext) : text, tm.tm_hour, tm.tm_min, tm.tm_sec);
    G.warncount = G.warncount > 100 ? 109 : G.warncount + 9;
    if (G.logmess) {
      if (!!G.logFile) {
        fprintf(G.logFile, S("%s\n"), P(newtext));
        fflush(G.logFile);
      } else {
        puts(P(newtext));
      }
    }
    if (doPhaser) {
      W_WriteText(G.phaserwin, 0, 0, G.textColor, P(newtext), G.warncount, null);
      switch (G.showPhaser) {
      case 0:
        break;
      case 1:
        W_WriteText(G.messwa, 0, 0, G.textColor, P(newtext), G.warncount, null);
        break;
      case 2:
        W_WriteText(G.messwt, 0, 0, G.textColor, P(newtext), G.warncount, null);
        break;
      case 3:
        W_WriteText(G.messwi, 0, 0, G.textColor, P(newtext), G.warncount, null);
        break;
      case 4:
        W_WriteText(G.messwk, 0, 0, G.textColor, P(newtext), G.warncount, null);
        break;
      case 5:
        W_WriteText(G.reviewWin, 0, 0, G.textColor, P(newtext), G.warncount, null);
        break;
      default:
        break;
      }
    }
  }
}

export function $init(): void {
}
