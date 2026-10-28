// @ts-nocheck
// COW 3.3.3 myf.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_ClearArea, W_WriteText } from './x11window.ts';
import { G, P, VaList, vsnprintf } from '../rt/index.ts';
import { TWINSIDE } from './consts.ts';


export function myf(x: number, y: number, color: number, font: Ptr | null, fmt: Ptr | null, ...$va: any[]): void {
  let buf = new Int8Array(128);
  let len = 0;
  let args = null;
  args = new VaList($va);
  len = vsnprintf(P(buf), 128, fmt, args);
  undefined;
  if (len >= 128) {
    len = 128 - 1;
  }
  if (len > 0) {
    W_WriteText(G.w, x, y, color, P(buf), len, font);
  }
}

export function myc(x: number, y: number): void {
  W_ClearArea(G.w, x, y, TWINSIDE - x, G.W_Textheight);
}

export function $init(): void {
}
