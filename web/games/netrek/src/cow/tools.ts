// @ts-nocheck
// COW 3.3.3 tools.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { strcmpi } from './defaults.ts';
import { W_IsMapped, W_MapWindow, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { G, P, S, fgets, pclose, popen, signal, sscanf, strlen } from '../rt/index.ts';



export function sendTools(str: Ptr | null): void {
  let pipebuf = new Int8Array(100);
  const c = new Int8Array(1);
  let pipefp = null;
  let len = 0;
  let i = 0;
  if (sscanf(str, S("set %s %c"), P(pipebuf), P(c, 0)) === 2) {
    for (i = 0; G.keys[i]; ++i) {
      if (strcmpi(G.macroKeys[i].name, P(pipebuf)) === 0) {
        G.macroKeys[i].dest = c[0] & 0xff;
        W_WriteText(G.toolsWin, 0, 0, G.textColor, str, strlen(str) | 0, G.W_RegularFont);
        return;
      }
    }
  }
  if (!W_IsMapped(G.toolsWin)) {
    showToolsWin();
  }
  signal(17, null);
  if (G.shelltools && !!(pipefp = popen(str, S("r")))) {
    while (!!fgets(P(pipebuf), 80, pipefp)) {
      len = strlen(P(pipebuf)) | 0;
      if (pipebuf[len - 1] === 10) {
        pipebuf[len - 1] = 0;
      }
      W_WriteText(G.toolsWin, 0, 0, G.textColor, P(pipebuf), strlen(P(pipebuf)) | 0, G.W_RegularFont);
    }
    pclose(pipefp);
  } else {
    W_WriteText(G.toolsWin, 0, 0, G.textColor, str, strlen(str) | 0, G.W_RegularFont);
  }
}

export function showToolsWin(): void {
  if (W_IsMapped(G.toolsWin)) {
    W_UnmapWindow(G.toolsWin);
  } else {
    W_MapWindow(G.toolsWin);
  }
}

export function $init(): void {
}
