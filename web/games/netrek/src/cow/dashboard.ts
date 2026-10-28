// @ts-nocheck
// COW 3.3.3 dashboard.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { db_redraw_lab2 } from './dashboard3.ts';
import { ftoa, itoapad } from './string_util.ts';
import { W_ClearArea, W_ClearWindow, W_FillArea, W_FlushWindow, W_MakeLine, W_WriteText } from './x11window.ts';
import { $sadd, G, P, S, strlen } from '../rt/index.ts';
import { ASSAULT, BAR_LENGTH, DB_3DIGITS, DB_5DIGITS, DB_FILL, DB_LINE, DB_NOFILL, PFBEAMDOWN, PFBEAMUP, PFBOMB, PFCLOAK, PFDOCK, PFDOCKOK, PFENG, PFGREEN, PFOBSERV, PFORBIT, PFPLLOCK, PFPLOCK, PFPRESS, PFREPAIR, PFSHIELD, PFTRACT, PFWEP, PFYELLOW, STARBASE } from './consts.ts';

let db_flags$old_kills: number;
let db_flags$old_torp: number;
let db_flags$old_flags: number;
let db_flags$old_tourn: number;
let db_redraw_krp$old_spd: number;
let db_redraw_krp$old_cur_spd: number;
let db_redraw_krp$old_shl: number;
let db_redraw_krp$old_dam: number;
let db_redraw_krp$old_arm: number;
let db_redraw_krp$old_cur_arm: number;
let db_redraw_krp$old_wpn: number;
let db_redraw_krp$old_egn: number;
let db_redraw_krp$old_ful: number;
let db_redraw_COW$old_spd: number;
let db_redraw_COW$old_cur_spd: number;
let db_redraw_COW$old_shl: number;
let db_redraw_COW$old_dam: number;
let db_redraw_COW$old_arm: number;
let db_redraw_COW$old_cur_arm: number;
let db_redraw_COW$old_wpn: number;
let db_redraw_COW$old_egn: number;
let db_redraw_COW$old_ful: number;

export function db_box(x: number, y: number, w: number, h: number, f: number, color: number): void {
  let border = G.W_White;
  if (color === G.W_Red) {
    border = color;
  }
  if (w === 0 || h === 0) {
    return;
  }
  switch (f) {
  case 2:
    W_FillArea(G.tstatw, x, y, w + 1, h + 1, color);
    break;
  case 1:
    W_MakeLine(G.tstatw, x + w, y, x + w, y + h, border);
    W_MakeLine(G.tstatw, x + w, y + 4, x + BAR_LENGTH, y + 4, border);
    break;
  case 0:
    W_MakeLine(G.tstatw, x, y, x + w, y, border);
    W_MakeLine(G.tstatw, x + w, y, x + w, y + h, border);
    W_MakeLine(G.tstatw, x + w, y + h, x, y + h, border);
    W_MakeLine(G.tstatw, x, y + h, x, y, border);
    break;
  }
}

export function db_bar(lab: Ptr | null, x: number, y: number, value: number, tmpmax: number, max: number, digits: number, color: number): void {
  let wt = 0;
  let wv = 0;
  let tw = 0;
  let tc = 0;
  let valstr = new Int8Array(32);
  switch (digits) {
  case 0:
    tc = 11;
    tw = Math.imul(G.W_Textwidth, tc);
    valstr[0] = lab.a[lab.o];
    valstr[1] = lab.a[lab.o + 1];
    valstr[2] = 91;
    itoapad(value, P(valstr, 3), 0, 3);
    valstr[6] = 47;
    itoapad(tmpmax, P(valstr, 7), 0, 3);
    valstr[10] = 93;
    W_ClearArea(G.tstatw, x, y, tw + BAR_LENGTH, 10);
    break;
  case 1:
    tc = 15;
    tw = Math.imul(G.W_Textwidth, tc);
    valstr[0] = lab.a[lab.o];
    valstr[1] = lab.a[lab.o + 1];
    valstr[2] = 91;
    itoapad(value, P(valstr, 3), 0, 5);
    valstr[8] = 47;
    itoapad(tmpmax, P(valstr, 9), 0, 5);
    valstr[14] = 93;
    W_ClearArea(G.tstatw, x, y, tw + BAR_LENGTH, 10);
    break;
  }
  wt = Math.trunc(BAR_LENGTH * (tmpmax / max)) | 0;
  wv = Math.trunc(BAR_LENGTH * (value / max)) | 0;
  if (wt > BAR_LENGTH) {
    wt = BAR_LENGTH;
  }
  if (wv > BAR_LENGTH) {
    wv = BAR_LENGTH;
  }
  W_WriteText(G.tstatw, x, y, G.textColor, P(valstr), 3, G.W_RegularFont);
  W_WriteText(G.tstatw, x + 3 * G.W_Textwidth, y, G.textColor, P(valstr, 3), (tc / 2 | 0) + 1, G.W_HighlightFont);
  W_WriteText(G.tstatw, x + Math.imul((tc / 2 | 0) + 1, G.W_Textwidth), y, G.textColor, P(valstr, (tc / 2 | 0) + 1), tc / 2 | 0, G.W_RegularFont);
  db_box(x + tw, y, BAR_LENGTH, 9, DB_NOFILL, color);
  if (wt >= wv && wt > 0) {
    db_box(x + tw, y, wt, 9, DB_LINE, color);
  }
  if (wv > 0) {
    db_box(x + tw, y, wv, 9, DB_FILL, color);
  }
}

export function db_flags(fr: number): void {
  let buf = new Int8Array(16);
  let plr = null;
  if ((G.me.p_flags & (PFPLOCK | PFOBSERV)) >>> 0 === (PFPLOCK | PFOBSERV)) {
    plr = $sadd(G.players, G.me.p_playerl);
  } else {
    plr = G.me;
  }
  if (fr || G.me.p_flags !== db_flags$old_flags) {
    buf[0] = ((G.me.p_flags & PFSHIELD) >>> 0 ? 83 : 32) << 24 >> 24;
    if ((G.me.p_flags & PFGREEN) >>> 0) {
      buf[1] = 71;
    } else if ((G.me.p_flags & PFYELLOW) >>> 0) {
      buf[1] = 89;
    } else {
      buf[1] = 82;
    }
    buf[2] = ((G.me.p_flags & (PFPLLOCK | PFPLOCK)) >>> 0 ? 76 : 32) << 24 >> 24;
    buf[3] = ((G.me.p_flags & PFREPAIR) >>> 0 ? 82 : 32) << 24 >> 24;
    buf[4] = ((G.me.p_flags & PFBOMB) >>> 0 ? 66 : 32) << 24 >> 24;
    buf[5] = ((G.me.p_flags & PFORBIT) >>> 0 ? 79 : 32) << 24 >> 24;
    if (G.me.p_ship.s_type === STARBASE) {
      buf[6] = ((G.me.p_flags & PFDOCKOK) >>> 0 ? 68 : 32) << 24 >> 24;
    } else {
      buf[6] = ((G.me.p_flags & PFDOCK) >>> 0 ? 68 : 32) << 24 >> 24;
    }
    buf[7] = ((G.me.p_flags & PFCLOAK) >>> 0 ? 67 : 32) << 24 >> 24;
    buf[8] = ((G.me.p_flags & PFWEP) >>> 0 ? 87 : 32) << 24 >> 24;
    buf[9] = ((G.me.p_flags & PFENG) >>> 0 ? 69 : 32) << 24 >> 24;
    if ((G.me.p_flags & PFPRESS) >>> 0) {
      buf[10] = 80;
    } else if ((G.me.p_flags & PFTRACT) >>> 0) {
      buf[10] = 84;
    } else {
      buf[10] = 32;
    }
    if ((G.me.p_flags & PFBEAMUP) >>> 0) {
      buf[11] = 117;
    } else if ((G.me.p_flags & PFBEAMDOWN) >>> 0) {
      buf[11] = 100;
    } else {
      buf[11] = 32;
    }
    W_WriteText(G.tstatw, 2, 3, G.textColor, S("Flags"), 5, G.W_RegularFont);
    W_WriteText(G.tstatw, 2, 17, G.textColor, P(buf), 12, G.W_RegularFont);
    db_flags$old_flags = G.me.p_flags;
  }
  if (fr || G.status.tourn !== db_flags$old_tourn) {
    if (G.status.tourn) {
      W_WriteText(G.tstatw, 74, 17, G.textColor, S("T"), 1, G.W_HighlightFont);
    } else {
      W_WriteText(G.tstatw, 74, 17, G.textColor, S(" "), 1, G.W_HighlightFont);
    }
    db_flags$old_tourn = G.status.tourn;
  }
  if (fr || plr.p_kills !== db_flags$old_kills) {
    if (plr.p_kills > 0) {
      W_WriteText(G.tstatw, 346, 17, G.textColor, S("Kills:"), 6, G.W_RegularFont);
      ftoa(plr.p_kills, P(buf), 0, 3, 2);
      W_WriteText(G.tstatw, 386, 17, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    } else {
      W_ClearArea(G.tstatw, 346, 17, 96, 10);
    }
    db_flags$old_kills = plr.p_kills;
  }
  if (fr || plr.p_ntorp !== db_flags$old_torp) {
    if (plr.p_ntorp > 0) {
      W_WriteText(G.tstatw, 346, 30, G.textColor, S("Torps:"), 6, G.W_RegularFont);
      buf[0] = plr.p_ntorp % 10 + 48 << 24 >> 24;
      W_WriteText(G.tstatw, 386, 30, G.textColor, P(buf), 1, G.W_RegularFont);
    } else {
      W_ClearArea(G.tstatw, 346, 30, 96, 10);
    }
    db_flags$old_torp = plr.p_ntorp;
  }
}

export function db_redraw_krp(fr: number): void {
  let cur_max = 0;
  let value = 0;
  let color = 0;
  let kills = 0;
  if ((G.me.p_flags & (PFPLOCK | PFOBSERV)) >>> 0 === (PFPLOCK | PFOBSERV)) {
    kills = $sadd(G.players, G.me.p_playerl).p_kills;
  } else {
    kills = G.me.p_kills;
  }
  if (fr) {
    W_ClearWindow(G.tstatw);
  }
  db_flags(fr);
  cur_max = Math.trunc(G.me.p_ship.s_maxspeed + 2 - (G.me.p_ship.s_maxspeed + 1) * (G.me.p_damage / G.me.p_ship.s_maxdamage)) | 0;
  if (cur_max > G.me.p_ship.s_maxspeed) {
    cur_max = G.me.p_ship.s_maxspeed;
  }
  if (cur_max < 0) {
    cur_max = 0;
  }
  if (fr || G.me.p_speed !== db_redraw_krp$old_spd || cur_max !== db_redraw_krp$old_cur_spd) {
    if (G.me.p_speed >= G.me.p_ship.s_maxspeed - 2) {
      color = G.W_Red;
    } else {
      color = G.W_Green;
    }
    db_bar(S("Sp"), 90, 3, G.me.p_speed, cur_max, G.me.p_ship.s_maxspeed, DB_3DIGITS, color);
    db_redraw_krp$old_spd = G.me.p_speed;
    db_redraw_krp$old_cur_spd = cur_max;
  }
  if (fr || G.me.p_shield !== db_redraw_krp$old_shl) {
    value = 100 * G.me.p_shield / G.me.p_ship.s_maxshield | 0;
    if (value <= 16) {
      color = G.W_Red;
    } else if (value <= 66) {
      color = G.W_Yellow;
    } else {
      color = G.W_Green;
    }
    db_bar(S("Sh"), 90, 17, G.me.p_shield, G.me.p_ship.s_maxshield, G.me.p_ship.s_maxshield, DB_3DIGITS, color);
    db_redraw_krp$old_shl = G.me.p_shield;
  }
  if (fr || G.me.p_damage !== db_redraw_krp$old_dam) {
    value = 100 * (G.me.p_ship.s_maxdamage - G.me.p_damage) / G.me.p_ship.s_maxdamage | 0;
    if (value <= 16) {
      color = G.W_Red;
    } else if (value <= 66) {
      color = G.W_Yellow;
    } else {
      color = G.W_Green;
    }
    db_bar(S("Hu"), 90, 31, G.me.p_ship.s_maxdamage - G.me.p_damage, G.me.p_ship.s_maxdamage, G.me.p_ship.s_maxdamage, DB_3DIGITS, color);
    db_redraw_krp$old_dam = G.me.p_damage;
  }
  if (G.me.p_ship.s_type === ASSAULT) {
    cur_max = kills * 3 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(kills * 3) | 0;
  } else if (G.me.p_ship.s_type === STARBASE) {
    cur_max = G.me.p_ship.s_maxarmies;
  } else {
    cur_max = kills * 2 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(kills * 2) | 0;
  }
  if (fr || G.me.p_armies !== db_redraw_krp$old_arm || cur_max !== db_redraw_krp$old_cur_arm) {
    value = G.me.p_armies;
    if (value <= 0) {
      color = G.W_Green;
    } else {
      color = G.W_Red;
    }
    db_bar(S("Ar"), 218, 3, G.me.p_armies, cur_max, G.me.p_ship.s_maxarmies, DB_3DIGITS, color);
    db_redraw_krp$old_arm = G.me.p_armies;
    db_redraw_krp$old_cur_arm = cur_max;
  }
  if (fr || G.me.p_wtemp !== db_redraw_krp$old_wpn) {
    value = 100 * G.me.p_wtemp / G.me.p_ship.s_maxwpntemp | 0;
    if (value <= 16) {
      color = G.W_Green;
    } else if (value <= 66) {
      color = G.W_Yellow;
    } else {
      color = G.W_Red;
    }
    db_bar(S("Wt"), 218, 17, G.me.p_wtemp / 10 | 0, G.me.p_ship.s_maxwpntemp / 10 | 0, G.me.p_ship.s_maxwpntemp / 10 | 0, DB_3DIGITS, color);
    db_redraw_krp$old_wpn = G.me.p_wtemp;
  }
  if (fr || G.me.p_etemp !== db_redraw_krp$old_egn) {
    value = 100 * G.me.p_etemp / G.me.p_ship.s_maxegntemp | 0;
    if (value <= 16) {
      color = G.W_Green;
    } else if (value <= 66) {
      color = G.W_Yellow;
    } else {
      color = G.W_Red;
    }
    db_bar(S("Et"), 218, 31, G.me.p_etemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0, DB_3DIGITS, color);
    db_redraw_krp$old_egn = G.me.p_etemp;
  }
  if (fr || G.me.p_fuel !== db_redraw_krp$old_ful) {
    value = 100 * G.me.p_fuel / G.me.p_ship.s_maxfuel | 0;
    if (value <= 16) {
      color = G.W_Red;
    } else if (value <= 66) {
      color = G.W_Yellow;
    } else {
      color = G.W_Green;
    }
    db_bar(S("Fu"), 346, 3, G.me.p_fuel, G.me.p_ship.s_maxfuel, G.me.p_ship.s_maxfuel, DB_5DIGITS, color);
    db_redraw_krp$old_ful = G.me.p_fuel;
  }
}

export function db_redraw_COW(fr: number): void {
  let cur_max = 0;
  let value = 0;
  let color = 0;
  let kills = 0;
  if ((G.me.p_flags & (PFPLOCK | PFOBSERV)) >>> 0 === (PFPLOCK | PFOBSERV)) {
    kills = $sadd(G.players, G.me.p_playerl).p_kills;
  } else {
    kills = G.me.p_kills;
  }
  if (fr) {
    W_ClearWindow(G.tstatw);
  }
  db_flags(fr);
  cur_max = Math.trunc(G.me.p_ship.s_maxspeed + 2 - (G.me.p_ship.s_maxspeed + 1) * (G.me.p_damage / G.me.p_ship.s_maxdamage)) | 0;
  if (cur_max > G.me.p_ship.s_maxspeed) {
    cur_max = G.me.p_ship.s_maxspeed;
  }
  if (cur_max < 0) {
    cur_max = 0;
  }
  if (fr || G.me.p_speed !== db_redraw_COW$old_spd || cur_max !== db_redraw_COW$old_cur_spd) {
    if (G.me.p_speed >= G.me.p_ship.s_maxspeed - 2) {
      color = G.W_Yellow;
    } else {
      color = G.W_White;
    }
    db_bar(S("Sp"), 90, 3, G.me.p_speed, cur_max, G.me.p_ship.s_maxspeed, DB_3DIGITS, color);
    db_redraw_COW$old_spd = G.me.p_speed;
    db_redraw_COW$old_cur_spd = cur_max;
  }
  if (fr || G.me.p_shield !== db_redraw_COW$old_shl) {
    value = 100 * G.me.p_shield / G.me.p_ship.s_maxshield | 0;
    if (value <= 50) {
      color = G.W_Red;
    } else if (value < 90) {
      color = G.W_Yellow;
    } else {
      color = G.W_White;
    }
    db_bar(S("Sh"), 90, 17, G.me.p_ship.s_maxshield - G.me.p_shield, G.me.p_ship.s_maxshield, G.me.p_ship.s_maxshield, DB_3DIGITS, color);
    db_redraw_COW$old_shl = G.me.p_shield;
  }
  if (fr || G.me.p_damage !== db_redraw_COW$old_dam) {
    value = 100 * G.me.p_damage / G.me.p_ship.s_maxdamage | 0;
    if (value <= 10) {
      color = G.W_White;
    } else if (value > 50) {
      color = G.W_Red;
    } else {
      color = G.W_Yellow;
    }
    db_bar(S("Da"), 90, 31, G.me.p_damage, G.me.p_ship.s_maxdamage, G.me.p_ship.s_maxdamage, DB_3DIGITS, color);
    db_redraw_COW$old_dam = G.me.p_damage;
  }
  if (G.me.p_ship.s_type === ASSAULT) {
    cur_max = kills * 3 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(kills * 3) | 0;
  } else if (G.me.p_ship.s_type === STARBASE) {
    cur_max = G.me.p_ship.s_maxarmies;
  } else {
    cur_max = kills * 2 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(kills * 2) | 0;
  }
  if (fr || G.me.p_armies !== db_redraw_COW$old_arm || cur_max !== db_redraw_COW$old_cur_arm) {
    value = G.me.p_armies;
    if (value <= 3) {
      color = G.W_White;
    } else if (value > 5) {
      color = G.W_Red;
    } else {
      color = G.W_Yellow;
    }
    db_bar(S("Ar"), 218, 3, G.me.p_armies, cur_max, G.me.p_ship.s_maxarmies, DB_3DIGITS, color);
    db_redraw_COW$old_arm = G.me.p_armies;
    db_redraw_COW$old_cur_arm = cur_max;
  }
  if (fr || G.me.p_wtemp !== db_redraw_COW$old_wpn) {
    value = 100 * G.me.p_wtemp / G.me.p_ship.s_maxwpntemp | 0;
    if (value > 50) {
      color = G.W_Red;
    } else if (value <= 20) {
      color = G.W_White;
    } else {
      color = G.W_Yellow;
    }
    db_bar(S("Wt"), 218, 17, G.me.p_wtemp / 10 | 0, G.me.p_ship.s_maxwpntemp / 10 | 0, G.me.p_ship.s_maxwpntemp / 10 | 0, DB_3DIGITS, color);
    db_redraw_COW$old_wpn = G.me.p_wtemp;
  }
  if (fr || G.me.p_etemp !== db_redraw_COW$old_egn) {
    value = 100 * G.me.p_etemp / G.me.p_ship.s_maxegntemp | 0;
    if (value <= 25) {
      color = G.W_White;
    } else if (value < 75) {
      color = G.W_Yellow;
    } else {
      color = G.W_Red;
    }
    db_bar(S("Et"), 218, 31, G.me.p_etemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0, DB_3DIGITS, color);
    db_redraw_COW$old_egn = G.me.p_etemp;
  }
  if (fr || G.me.p_fuel !== db_redraw_COW$old_ful) {
    value = 100 * G.me.p_fuel / G.me.p_ship.s_maxfuel | 0;
    if (value <= 50) {
      color = G.W_Red;
    } else if (value > 90) {
      color = G.W_White;
    } else {
      color = G.W_Yellow;
    }
    db_bar(S("Fu"), 346, 3, G.me.p_fuel, G.me.p_ship.s_maxfuel, G.me.p_ship.s_maxfuel, DB_5DIGITS, color);
    db_redraw_COW$old_ful = G.me.p_fuel;
  }
}

export function db_redraw(fr: number): void {
  switch (G.newDashboard) {
  case 2:
    db_redraw_krp(fr);
    break;
  case 3:
    db_redraw_lab2(fr);
    break;
  default:
    db_redraw_COW(fr);
  }
  W_FlushWindow(G.tstatw);
}

export function $init(): void {
  db_flags$old_kills = -1;
  db_flags$old_torp = -1;
  db_flags$old_flags = 4294967295;
  db_flags$old_tourn = -1;
  db_redraw_krp$old_spd = -1;
  db_redraw_krp$old_cur_spd = -1;
  db_redraw_krp$old_shl = -1;
  db_redraw_krp$old_dam = -1;
  db_redraw_krp$old_arm = -1;
  db_redraw_krp$old_cur_arm = -1;
  db_redraw_krp$old_wpn = -1;
  db_redraw_krp$old_egn = -1;
  db_redraw_krp$old_ful = -1;
  db_redraw_COW$old_spd = -1;
  db_redraw_COW$old_cur_spd = -1;
  db_redraw_COW$old_shl = -1;
  db_redraw_COW$old_dam = -1;
  db_redraw_COW$old_arm = -1;
  db_redraw_COW$old_cur_arm = -1;
  db_redraw_COW$old_wpn = -1;
  db_redraw_COW$old_egn = -1;
  db_redraw_COW$old_ful = -1;
}
