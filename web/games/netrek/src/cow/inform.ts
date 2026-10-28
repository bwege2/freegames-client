// @ts-nocheck
// COW 3.3.3 inform.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { ftoa } from './string_util.ts';
import { gettarget } from './util.ts';
import { W_DestroyWindow, W_MakeWindow, W_MapWindow, W_WindowHeight, W_WindowWidth, W_WriteText } from './x11window.ts';
import { $sadd, G, P, S, memccpy, sprintf, strlen } from '../rt/index.ts';
import { FED, KLI, ORI, PLAGRI, PLAYERTYPE, PLCORE, PLFUEL, PLREPAIR, ROM, STARBASE, TARG_PLANET, TARG_PLAYER, TARG_SELF } from './consts.ts';

let my_classes: any;

export function inform(ww: Ptr | null, x: number, y: number, key: number): void {
  let buf = new Int8Array(8192);
  let ftoabuf = new Int8Array(8);
  let line = 0;
  let j = null;
  let k = null;
  let mx = 0;
  let my = 0;
  let target = null;
  let windowWidth = 0;
  let windowHeight = 0;
  let KillsPerHour = 0;
  let LossesPerHour = 0;
  mx = x;
  my = y;
  G.infomapped = 1;
  if (key === 105) {
    target = gettarget(ww, x, y, TARG_PLAYER | TARG_PLANET);
  } else {
    target = gettarget(ww, x, y, TARG_PLAYER | TARG_SELF);
  }
  windowWidth = W_WindowWidth(ww);
  windowHeight = W_WindowHeight(ww);
  if (target.o_type === PLAYERTYPE) {
    if (key === 105) {
      if (mx + 23 * G.W_Textwidth + 2 > windowWidth) {
        mx = windowWidth - 23 * G.W_Textwidth - 2;
      }
      if (my + 5 * G.W_Textheight + 2 > windowHeight) {
        my = windowHeight - 5 * G.W_Textheight - 2;
      }
      G.infow = W_MakeWindow(S("info"), mx, my, 23 * G.W_Textwidth, 6 * G.W_Textheight, ww, 2, G.foreColor);
      W_MapWindow(G.infow);
      j = $sadd(G.players, target.o_num);
      sprintf(P(buf), S("%s (%c%c)"), P(j.p_name), G.teamlet[j.p_team], G.shipnos.a[G.shipnos.o + j.p_no]);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.me === j ? G.W_HighlightFont : !(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
      sprintf(P(buf), S("Speed:   %-d"), j.p_speed);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      sprintf(P(buf), S("kills:   %-4.2f"), j.p_kills);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      sprintf(P(buf), S("Ship Type: %-s"), my_classes[j.p_ship.s_type]);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      if (j.p_swar & G.me.p_team) {
        W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], S("WAR"), 3, G.W_RegularFont);
      } else if (j.p_hostile & G.me.p_team) {
        W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], S("HOSTILE"), 7, G.W_RegularFont);
      } else {
        W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], S("PEACEFUL"), 8, G.W_RegularFont);
      }
      sprintf(P(buf), S("%s@%s"), P(j.p_login), P(j.p_monitor));
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    } else {
      if (mx + 24 * G.W_Textwidth + 2 > windowWidth) {
        mx = windowWidth - 24 * G.W_Textwidth - 2;
      }
      if (my + 10 * G.W_Textheight + 2 > windowHeight) {
        my = windowHeight - 10 * G.W_Textheight - 2;
      }
      G.infow = W_MakeWindow(S("info"), mx, my, 24 * G.W_Textwidth, 10 * G.W_Textheight, ww, 2, G.foreColor);
      W_MapWindow(G.infow);
      j = $sadd(G.players, target.o_num);
      sprintf(P(buf), S("%s (%c%c):"), P(j.p_name), G.teamlet[j.p_team], G.shipnos.a[G.shipnos.o + j.p_no]);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.me === j ? G.W_HighlightFont : !(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
      sprintf(P(buf), S("Login   %-s"), P(j.p_login));
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      sprintf(P(buf), S("Display %-s"), P(j.p_monitor));
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      memccpy(P(buf), S("        Rating    Total"), 0, 25);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      ftoa(j.p_stats.st_tarmsbomb * G.status.timeprod / (j.p_stats.st_tticks * G.status.armsbomb), P(ftoabuf), 0, 2, 2);
      sprintf(P(buf), S("Bombing: %s  %5d"), P(ftoabuf), j.p_stats.st_armsbomb + j.p_stats.st_tarmsbomb);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      ftoa(j.p_stats.st_tplanets * G.status.timeprod / (j.p_stats.st_tticks * G.status.planets), P(ftoabuf), 0, 2, 2);
      sprintf(P(buf), S("Planets: %s  %5d"), P(ftoabuf), j.p_stats.st_planets + j.p_stats.st_tplanets);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      if (j.p_ship.s_type === STARBASE && G.SBhours) {
        KillsPerHour = (j.p_stats.st_sbticks === 0 ? 1 : 0) ? 0 : j.p_stats.st_sbkills * 36000 / j.p_stats.st_sbticks;
        sprintf(P(buf), S("KPH:     %5.2f  %5d"), KillsPerHour, j.p_stats.st_sbkills);
      } else {
        ftoa(j.p_stats.st_tkills * G.status.timeprod / (j.p_stats.st_tticks * G.status.kills), P(ftoabuf), 0, 2, 2);
        sprintf(P(buf), S("Offense: %s  %5d"), P(ftoabuf), j.p_stats.st_kills + j.p_stats.st_tkills);
      }
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      if (j.p_ship.s_type === STARBASE && G.SBhours) {
        LossesPerHour = (j.p_stats.st_sbticks === 0 ? 1 : 0) ? 0 : j.p_stats.st_sblosses * 36000 / j.p_stats.st_sbticks;
        sprintf(P(buf), S("DPH:     %5.2f  %5d"), LossesPerHour, j.p_stats.st_sblosses);
      } else {
        ftoa(j.p_stats.st_tticks * G.status.losses / (j.p_stats.st_tlosses !== 0 ? j.p_stats.st_tlosses * G.status.timeprod : G.status.timeprod), P(ftoabuf), 0, 2, 2);
        sprintf(P(buf), S("Defense: %s  %5d"), P(ftoabuf), j.p_stats.st_losses + j.p_stats.st_tlosses);
      }
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      if (j.p_ship.s_type === STARBASE) {
        sprintf(P(buf), S("  Maxkills: %6.2f"), j.p_stats.st_sbmaxkills);
      } else {
        sprintf(P(buf), S("  Maxkills: %6.2f"), j.p_stats.st_maxkills);
      }
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      if (j.p_ship.s_type === STARBASE && G.SBhours) {
        sprintf(P(buf), S("  Hours:    %6.2f"), j.p_stats.st_sbticks / 36000);
      } else {
        sprintf(P(buf), S("  Hours:    %6.2f"), j.p_stats.st_tticks / 36000);
      }
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    }
  } else {
    if (mx + 23 * G.W_Textwidth + 2 > windowWidth) {
      mx = windowWidth - 28 * G.W_Textwidth - 2;
    }
    if (my + 3 * G.W_Textheight + 2 > windowHeight) {
      my = windowHeight - 3 * G.W_Textheight - 2;
    }
    G.infow = W_MakeWindow(S("info"), mx, my, G.W_Textwidth * 28, G.W_Textheight * 3, ww, 2, G.foreColor);
    W_MapWindow(G.infow);
    k = $sadd(G.planets, target.o_num);
    if (k.pl_info & G.me.p_team || G.playback) {
      sprintf(P(buf), S("%s (%c)"), P(k.pl_name), G.teamlet[k.pl_owner]);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), k.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[k.pl_owner]] : G.unColor, P(buf), strlen(P(buf)) | 0, G.me.p_team === k.pl_owner ? G.W_HighlightFont : k.pl_info & G.me.p_team && !(k.pl_owner & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
      sprintf(P(buf), S("Armies %d"), k.pl_armies);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), k.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[k.pl_owner]] : G.unColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      sprintf(P(buf), S("%s %s %s %s %c%c%c%c"), k.pl_flags & PLREPAIR ? S("REPAIR") : S("      "), k.pl_flags & PLFUEL ? S("FUEL") : S("    "), k.pl_flags & PLAGRI ? S("AGRI") : S("    "), k.pl_flags & PLCORE ? S("CORE") : S("    "), k.pl_info & FED ? 70 : 32, k.pl_info & ROM ? 82 : 32, k.pl_info & KLI ? 75 : 32, k.pl_info & ORI ? 79 : 32);
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), k.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[k.pl_owner]] : G.unColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    } else {
      sprintf(P(buf), S("%s"), P(k.pl_name));
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), k.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[k.pl_owner]] : G.unColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      sprintf(P(buf), S("No other info"));
      W_WriteText(G.infow, G.W_Textwidth, Math.imul(G.W_Textheight, line++), k.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[k.pl_owner]] : G.unColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    }
  }
}

export function destroyInfo(): void {
  W_DestroyWindow(G.infow);
  G.infow = null;
  G.infomapped = 0;
}

export function $init(): void {
  my_classes = [S("SC"),
S("DD"),
S("CA"),
S("BB"),
S("AS"),
S("SB"),
S("GA"),
S("??")];
}
