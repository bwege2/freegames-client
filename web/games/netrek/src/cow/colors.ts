// @ts-nocheck
// COW 3.3.3 colors.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { G } from '../rt/index.ts';



export function getColorDefs(): void {
  G.borderColor = G.W_Grey;
  G.backColor = G.W_Black;
  G.foreColor = G.W_White;
  G.textColor = G.W_White;
  G.shipCol[0] = G.W_Ind;
  G.shipCol[1] = G.W_Fed;
  G.shipCol[2] = G.W_Rom;
  G.shipCol[3] = G.W_Kli;
  G.shipCol[4] = G.W_Ori;
  G.warningColor = G.W_Red;
  G.unColor = G.W_Grey;
  G.rColor = G.W_Red;
  G.yColor = G.W_Yellow;
  G.gColor = G.W_Green;
  G.myColor = G.W_White;
}

export function $init(): void {
}
