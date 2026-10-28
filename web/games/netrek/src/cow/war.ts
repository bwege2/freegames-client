// @ts-nocheck
// COW 3.3.3 war.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { sendShortPacket } from './socket.ts';
import { warning } from './warning.ts';
import { W_Beep, W_MapWindow, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, G, P, S, sprintf, strlen } from '../rt/index.ts';
import { FED, KLI, ORI, ROM } from './consts.ts';

let newhostile: number;
let feds: Ptr | null;
let roms: Ptr | null;
let klis: Ptr | null;
let oris: Ptr | null;
let gos: Ptr | null;
let exs: Ptr | null;
let peaces: Ptr | null;
let hostiles: Ptr | null;
let wars: Ptr | null;

function fillwin(menunum: number, string: Ptr | null, hostile: number, warbits: number, team: number): void {
  let buf = new Int8Array(80);
  if (team & warbits) {
    sprintf(P(buf), S("  %s%s"), string, wars);
    W_WriteText(G.war, 0, menunum, G.rColor, P(buf), strlen(P(buf)) | 0, null);
  } else if (team & hostile) {
    sprintf(P(buf), S("  %s%s"), string, hostiles);
    W_WriteText(G.war, 0, menunum, G.yColor, P(buf), strlen(P(buf)) | 0, null);
  } else {
    sprintf(P(buf), S("  %s%s"), string, peaces);
    W_WriteText(G.war, 0, menunum, G.gColor, P(buf), strlen(P(buf)) | 0, null);
  }
}

function warrefresh(): void {
  fillwin(0, feds, newhostile, G.me.p_swar, FED);
  fillwin(1, roms, newhostile, G.me.p_swar, ROM);
  fillwin(2, klis, newhostile, G.me.p_swar, KLI);
  fillwin(3, oris, newhostile, G.me.p_swar, ORI);
  W_WriteText(G.war, 0, 4, G.textColor, gos, strlen(gos) | 0, null);
  W_WriteText(G.war, 0, 5, G.textColor, exs, strlen(exs) | 0, null);
}

export function warwindow(): void {
  W_MapWindow(G.war);
  newhostile = G.me.p_hostile;
  warrefresh();
}

export function waraction(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let enemyteam = 0;
  switch (data.y) {
  case 0:
    enemyteam = FED;
    break;
  case 1:
    enemyteam = ROM;
    break;
  case 2:
    enemyteam = KLI;
    break;
  case 3:
    enemyteam = ORI;
    break;
  case 4:
    W_UnmapWindow(G.war);
    sendShortPacket(10, newhostile << 24 >> 24);
    return;
    break;
  case 5:
    W_UnmapWindow(G.war);
    return;
    break;
  }
  if (G.me.p_swar & enemyteam) {
    warning(S("You are already at war. Status cannot be changed."));
    W_Beep();
  } else {
    if (G.me.p_team === enemyteam) {
      warning(S("You can't declare war on your own team, fool."));
    } else {
      newhostile ^= enemyteam;
    }
  }
  warrefresh();
}

export function $init(): void {
  newhostile = 0;
  feds = S("FED - ");
  roms = S("ROM - ");
  klis = S("KLI - ");
  oris = S("ORI - ");
  gos = S("  Save");
  exs = S("  Exit - no change");
  peaces = S("Peace");
  hostiles = S("Hostile");
  wars = S("War");
}
