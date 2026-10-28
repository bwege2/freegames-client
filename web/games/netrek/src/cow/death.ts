// @ts-nocheck
// COW 3.3.3 death.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { destroyInfo } from './inform.ts';
import { optiondone } from './option.ts';
import { resetWeaponInfo } from './short.ts';
import { sounddone } from './sound.ts';
import { W_GalacticBgd } from './x11sprite.ts';
import { W_ChangeBorder, W_ClearArea, W_ClearWindow, W_EventsPending, W_IsMapped, W_NextEvent, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $peq, $sadd, G, P, S, longjmp, sprintf, strcpy, strlen } from '../rt/index.ts';
import { GENO_PIX, PFGREEN, PFSHIELD } from './consts.ts';

let teamstring: any;
let death$first: number;

export async function death(): Promise<void> {
  let event = new struct_event();
  let oldw = null;
  oldw = G.w;
  W_ClearWindow(G.w);
  W_ClearWindow(G.iconWin);
  G.sound_flags = PFSHIELD;
  if (G.oldalert !== PFGREEN) {
    if (G.extraBorder) {
      W_ChangeBorder(oldw, G.gColor);
    }
    W_ChangeBorder(G.baseWin, G.gColor);
    G.oldalert = PFGREEN;
  }
  if (W_IsMapped(G.statwin)) {
    W_UnmapWindow(G.statwin);
    G.showStats = 1;
  } else {
    G.showStats = 0;
  }
  if (G.infomapped) {
    destroyInfo();
  }
  W_UnmapWindow(G.planetw);
  W_UnmapWindow(G.rankw);
  W_UnmapWindow(G.war);
  if (G.optionWin) {
    optiondone();
  }
  if (G.soundWin) {
    sounddone();
  }
  if (G.promoted) {
    if (G.mystats.st_rank < G.nranks) {
      sprintf(P(G.deathmessage), S("Congratulations, you were promoted to %s"), $sadd(G.ranks, G.mystats.st_rank).name);
    } else {
      sprintf(P(G.deathmessage), S("Congratulations, you were promoted"));
    }
    if (G.warncount > 0) {
      W_ClearArea(G.warnw, 5, 5, Math.imul(G.W_Textwidth, G.warncount), G.W_Textheight);
    }
    W_WriteText(G.warnw, 5, 5, G.W_Green, P(G.deathmessage), strlen(P(G.deathmessage)) | 0, G.W_HighlightFont);
    G.warncount = strlen(P(G.deathmessage)) | 0;
    G.promoted = 0;
  } else {
    if (death$first) {
      --death$first;
      sprintf(P(G.deathmessage), S("Okay, you died, but that is NORMAL!  Press Enter for new ship!"));
      if (G.warncount > 0) {
        W_ClearArea(G.warnw, 5, 5, Math.imul(G.W_Textwidth, G.warncount), G.W_Textheight);
      }
      W_WriteText(G.warnw, 5, 5, G.W_Green, P(G.deathmessage), strlen(P(G.deathmessage)) | 0, G.W_HighlightFont);
      G.warncount = strlen(P(G.deathmessage)) | 0;
    }
  }
  G.deathFont = G.W_RegularFont;
  switch (G.me.p_whydead) {
  case 1:
    strcpy(P(G.deathmessage), S("           You QUIT!!"));
    break;
  case 2:
    sprintf(P(G.deathmessage), S("You were thumped by a photon torpedo from %s (%c%c)."), P($sadd(G.players, G.me.p_whodead).p_name), G.teamlet[$sadd(G.players, G.me.p_whodead).p_team], G.shipnos.a[G.shipnos.o + G.me.p_whodead]);
    break;
  case 11:
    sprintf(P(G.deathmessage), S("You were SMACKed by a plasma torpedo from %s (%c%c) "), P($sadd(G.players, G.me.p_whodead).p_name), G.teamlet[$sadd(G.players, G.me.p_whodead).p_team], G.shipnos.a[G.shipnos.o + G.me.p_whodead]);
    break;
  case 3:
    sprintf(P(G.deathmessage), S("You were phasered to death by %s (%c%c)"), P($sadd(G.players, G.me.p_whodead).p_name), G.teamlet[$sadd(G.players, G.me.p_whodead).p_team], G.shipnos.a[G.shipnos.o + G.me.p_whodead]);
    break;
  case 4:
    sprintf(P(G.deathmessage), S("You were killed by planetary fire from %s (%c)"), P($sadd(G.planets, G.me.p_whodead).pl_name), G.teamlet[$sadd(G.planets, G.me.p_whodead).pl_owner]);
    break;
  case 5:
    sprintf(P(G.deathmessage), S("You were killed by the explosion of %s (%c%c)"), P($sadd(G.players, G.me.p_whodead).p_name), G.teamlet[$sadd(G.players, G.me.p_whodead).p_team], G.shipnos.a[G.shipnos.o + G.me.p_whodead]);
    break;
  case 6:
    strcpy(P(G.deathmessage), S("You were killed by a dying daemon."));
    break;
  case 7:
    sprintf(P(G.deathmessage), S("Galaxy has been conquered by %s (%c%c) %s"), P($sadd(G.players, G.me.p_whodead).p_name), G.teamlet[$sadd(G.players, G.me.p_whodead).p_team], G.shipnos.a[G.shipnos.o + $sadd(G.players, G.me.p_whodead).p_no], teamstring[$sadd(G.players, G.me.p_whodead).p_team]);
    G.deathFont = G.W_HighlightFont;
    W_GalacticBgd(GENO_PIX);
    break;
  case 8:
    strcpy(P(G.deathmessage), S("You were killed by a confused daemon."));
    break;
  case 9:
    sprintf(P(G.deathmessage), S("You were GENOCIDED by %s (%c%c) %s. You suck!"), P($sadd(G.players, G.me.p_whodead).p_name), G.teamlet[$sadd(G.players, G.me.p_whodead).p_team], G.shipnos.a[G.shipnos.o + G.me.p_whodead], teamstring[$sadd(G.players, G.me.p_whodead).p_team]);
    G.deathFont = G.W_HighlightFont;
    break;
  case 10:
    strcpy(P(G.deathmessage), S("You were nuked by GOD."));
    break;
  case 13:
    strcpy(P(G.deathmessage), S("The game is  over!"));
    break;
  case 14:
    strcpy(P(G.deathmessage), S("The tournament game has begun!"));
    break;
  case 12:
    strcpy(P(G.deathmessage), S("The tournament game has ended."));
    break;
  case 15:
    strcpy(P(G.deathmessage), S("Your netrek executable didn't verify correctly."));
    break;
  default:
    strcpy(P(G.deathmessage), S("You were killed by something unknown to this game?"));
    break;
  }
  W_ClearWindow(G.messagew);
  W_WriteText(G.messagew, 5, 5, G.W_Yellow, P(G.deathmessage), strlen(P(G.deathmessage)) | 0, G.deathFont);
  G.w = oldw;
  resetWeaponInfo();
  while (await W_EventsPending()) {
    await W_NextEvent(event);
  }
  longjmp(G.env[0], 0);
}

export function updatedeath(): void {
  if (!$peq(G.deathFont, G.W_HighlightFont)) {
    G.deathFont = G.W_RegularFont;
  }
  W_WriteText(G.messagew, 5, 5, G.W_Yellow, P(G.deathmessage), strlen(P(G.deathmessage)) | 0, G.deathFont);
}

export function $init(): void {
  G.deathFont = null;
  teamstring = [S(""),
S("and the Feds"),
S("and the Roms"),
S(""),
S("and the Klis"),
S(""),
S(""),
S(""),
S("and the Oris")];
  death$first = 10;
}
