// @ts-nocheck
// COW 3.3.3 dashboard3.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_ClearArea, W_ClearWindow, W_FillArea, W_MakeLine, W_MaskText, W_WriteText } from './x11window.ts';
import { $rd, $wr, G, P, S } from '../rt/index.ts';
import { ASSAULT, PFBEAMDOWN, PFBEAMUP, PFBOMB, PFCLOAK, PFDOCK, PFDOCKOK, PFENG, PFGREEN, PFORBIT, PFPLLOCK, PFPLOCK, PFPRESS, PFREPAIR, PFSHIELD, PFTRACT, PFWEP, PFYELLOW, STARBASE } from './consts.ts';

let db_flags$old_flags: number;
let db_flags$old_tourn: number;
let db_redraw_lab2$old_spd: number;
let db_redraw_lab2$old_cur_max: number;
let db_redraw_lab2$old_shl: number;
let db_redraw_lab2$old_dam: number;
let db_redraw_lab2$old_arm: number;
let db_redraw_lab2$old_cur_arm: number;
let db_redraw_lab2$old_wpn: number;
let db_redraw_lab2$old_egn: number;
let db_redraw_lab2$old_ful: number;
let db_redraw_lab2$old_kills: number;

function db_itoa(s: Ptr | null, v: number): number {
  let $t1: any;
  let buf = s;
  buf.a[buf.o] = 48 + (v / 100000 | 0) << 24 >> 24;
  if (buf.a[buf.o] !== 48) {
    buf = buf.add(1);
  }
  buf.a[buf.o] = 48 + (v % 100000 / 10000 | 0) << 24 >> 24;
  if (buf.a[buf.o] !== 48 || v >= 100000) {
    buf = buf.add(1);
  }
  buf.a[buf.o] = 48 + (v % 10000 / 1000 | 0) << 24 >> 24;
  if (buf.a[buf.o] !== 48 || v >= 10000) {
    buf = buf.add(1);
  }
  buf.a[buf.o] = 48 + (v % 1000 / 100 | 0) << 24 >> 24;
  if (buf.a[buf.o] !== 48 || v >= 1000) {
    buf = buf.add(1);
  }
  buf.a[buf.o] = 48 + (v % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o] !== 48 || v >= 100) {
    buf = buf.add(1);
  }
  $wr(($t1 = buf, buf = $t1.add(1), $t1), 0, 48 + v % 10 << 24 >> 24);
  return buf.o - s.o | 0;
}

function db_ftoa(s: Ptr | null, v: number): number {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any;
  let buf = s;
  if (v >= 100) {
    $wr(($t1 = buf, buf = $t1.add(1), $t1), 0, 48 + (Math.trunc(v / 100) | 0) << 24 >> 24);
    $wr(($t2 = buf, buf = $t2.add(1), $t2), 0, 48 + ((Math.trunc(v) | 0) % 100 / 10 | 0) << 24 >> 24);
  } else if (v >= 10) {
    $wr(($t3 = buf, buf = $t3.add(1), $t3), 0, 48 + (Math.trunc(v / 10) | 0) << 24 >> 24);
  }
  $wr(($t4 = buf, buf = $t4.add(1), $t4), 0, 48 + (Math.trunc(v) | 0) % 10 << 24 >> 24);
  $wr(($t5 = buf, buf = $t5.add(1), $t5), 0, 46);
  $wr(($t6 = buf, buf = $t6.add(1), $t6), 0, 48 + (Math.trunc(v * 10) | 0) % 10 << 24 >> 24);
  $wr(($t7 = buf, buf = $t7.add(1), $t7), 0, 48 + (Math.trunc(v * 100) | 0) % 10 << 24 >> 24);
  return buf.o - s.o | 0;
}

function db_bar(l: Ptr | null, x: number, y: number, w: number, h: number, m: number, t: number, v: number, b: number): void {
  let i = 0;
  let hgt = 0;
  let val_pix = 0;
  let tmax_pix = 0;
  let yellow_pix = 0;
  let red_pix = 0;
  let label_len = 0;
  let label = new Int8Array(32);
  W_ClearArea(G.tstatw, x, y, w, h);
  if (b) {
    val_pix = Math.imul(w, v) / m | 0;
  } else {
    val_pix = Math.imul(w, m - v) / m | 0;
  }
  tmax_pix = Math.imul(w, t) / m | 0;
  yellow_pix = w / 3 | 0;
  red_pix = 2 * w / 3 | 0;
  if (t < 0 || t > m || v < 0 || v > m) {
    W_FillArea(G.tstatw, x, y, w, h, G.W_Red);
    W_MaskText(G.tstatw, x + w - 3 * G.W_Textwidth - 2, y + h - G.W_Textheight - 2, G.W_White, l, 3, G.W_HighlightFont);
    label_len = db_itoa(P(label), v);
    W_MaskText(G.tstatw, x, y, G.W_White, P(label), label_len, G.W_HighlightFont);
    label_len = db_itoa(P(label), t);
    if (t === m) {
      W_MaskText(G.tstatw, x, y + G.W_Textheight + 2, G.W_Grey, P(label), label_len, G.W_RegularFont);
    } else {
      W_MaskText(G.tstatw, x, y + G.W_Textheight + 2, G.W_White, P(label), label_len, G.W_RegularFont);
    }
  } else {
    for (i = 0; i < w; ++i) {
      hgt = h - (Math.imul(h, i) / w | 0);
      if (i >= tmax_pix && i % 2) {
        W_MakeLine(G.tstatw, x + i, y + hgt, x + i, y + h, G.W_Grey);
      } else if (i <= val_pix) {
        if (i < yellow_pix) {
          W_MakeLine(G.tstatw, x + i, y + hgt, x + i, y + h, G.W_Green);
        } else if (i < red_pix) {
          W_MakeLine(G.tstatw, x + i, y + hgt, x + i, y + h, G.W_Yellow);
        } else {
          W_MakeLine(G.tstatw, x + i, y + hgt, x + i, y + h, G.W_Red);
        }
      }
    }
    if (b ? v > (m / 2 | 0) ? 1 : 0 : v < (m / 2 | 0) ? 1 : 0) {
      W_MaskText(G.tstatw, x + w - 3 * G.W_Textwidth - 2, y + h - G.W_Textheight - 2, G.W_White, l, 3, G.W_RegularFont);
    } else {
      W_MaskText(G.tstatw, x + w - 3 * G.W_Textwidth - 2, y + h - G.W_Textheight - 2, G.W_Grey, l, 3, G.W_RegularFont);
    }
    label_len = db_itoa(P(label), v);
    if (b ? v > (m / 2 | 0) ? 1 : 0 : v < (m / 2 | 0) ? 1 : 0) {
      W_MaskText(G.tstatw, x, y, G.W_White, P(label), label_len, G.W_HighlightFont);
    } else {
      W_MaskText(G.tstatw, x, y, G.W_Grey, P(label), label_len, G.W_HighlightFont);
    }
    label_len = db_itoa(P(label), t);
    if (t === m) {
      W_MaskText(G.tstatw, x, y + G.W_Textheight + 2, G.W_Grey, P(label), label_len, G.W_RegularFont);
    } else {
      W_MaskText(G.tstatw, x, y + G.W_Textheight + 2, G.W_White, P(label), label_len, G.W_RegularFont);
    }
  }
  W_MakeLine(G.tstatw, x, y + h, x + w, y + h, G.W_Grey);
  W_MakeLine(G.tstatw, x + w, y, x + w, y + h, G.W_Grey);
}

function db_flags(fr: number): void {
  let buf = new Int8Array(13);
  if (fr || db_flags$old_flags !== G.me.p_flags || db_flags$old_tourn !== G.status.tourn) {
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
    if (G.status.tourn) {
      buf[12] = 116;
    } else {
      buf[12] = 32;
    }
    W_WriteText(G.tstatw, 2, 32, G.W_White, P(buf), 13, G.W_RegularFont);
    db_flags$old_flags = G.me.p_flags;
    db_flags$old_tourn = G.status.tourn;
  }
}

export function db_redraw_lab2(fr: number): void {
  let cur_max = 0;
  let cur_arm = 0;
  let label_len = 0;
  let label = new Int8Array(32);
  if (G.me.p_ship.s_type === ASSAULT) {
    cur_arm = Math.trunc(3 * G.me.p_kills) | 0;
  } else {
    cur_arm = Math.trunc(2 * G.me.p_kills) | 0;
  }
  if (cur_arm < 0) {
    cur_arm = 0;
  } else if (cur_arm > G.me.p_ship.s_maxarmies || G.me.p_ship.s_type === STARBASE) {
    cur_arm = G.me.p_ship.s_maxarmies;
  }
  cur_max = Math.trunc(G.me.p_ship.s_maxspeed + 2 - (G.me.p_ship.s_maxspeed + 1) * (G.me.p_damage / G.me.p_ship.s_maxdamage)) | 0;
  if (cur_max < 0) {
    cur_max = 0;
  } else if (cur_max > G.me.p_ship.s_maxspeed) {
    cur_max = G.me.p_ship.s_maxspeed;
  }
  if (fr) {
    W_ClearWindow(G.tstatw);
  }
  db_flags(fr);
  if (fr || G.me.p_speed !== db_redraw_lab2$old_spd || db_redraw_lab2$old_cur_max !== cur_max) {
    db_bar(S("Spd"), 2, 2, 75, 25, G.me.p_ship.s_maxspeed, cur_max, G.me.p_speed, 1);
  }
  if (fr || db_redraw_lab2$old_ful !== G.me.p_fuel) {
    db_bar(S("Ful"), 82, 2, 75, 25, G.me.p_ship.s_maxfuel, G.me.p_ship.s_maxfuel, G.me.p_fuel, 0);
  }
  if (fr || db_redraw_lab2$old_shl !== G.me.p_shield) {
    db_bar(S("Shl"), 162, 2, 75, 25, G.me.p_ship.s_maxshield, G.me.p_ship.s_maxshield, G.me.p_shield, 0);
  }
  if (fr || db_redraw_lab2$old_dam !== G.me.p_damage) {
    db_bar(S("Dam"), 242, 2, 75, 25, G.me.p_ship.s_maxdamage, G.me.p_ship.s_maxdamage, G.me.p_damage, 1);
  }
  if (G.me.p_ship.s_type === STARBASE) {
    if (fr || db_redraw_lab2$old_wpn !== G.me.p_wtemp) {
      db_bar(S("Wpn"), 322, 2, 75, 25, G.me.p_ship.s_maxwpntemp / 10 | 0, G.me.p_ship.s_maxwpntemp / 10 | 0, G.me.p_wtemp / 10 | 0, 1);
    }
    if (fr || db_redraw_lab2$old_egn !== G.me.p_etemp) {
      W_ClearArea(G.tstatw, 324, 32, 78, G.W_Textheight);
      label[0] = 69;
      label[1] = 103;
      label[2] = 110;
      label[3] = 58;
      label[4] = 32;
      label_len = 5 + db_itoa(P(label, 5), G.me.p_etemp / 10 | 0);
      label[label_len++] = 47;
      label_len += db_itoa(P(label, label_len), G.me.p_ship.s_maxegntemp / 10 | 0);
      if (G.me.p_etemp > (G.me.p_ship.s_maxegntemp / 2 | 0)) {
        W_WriteText(G.tstatw, 324, 32, G.W_White, P(label), label_len, G.W_HighlightFont);
      } else {
        W_WriteText(G.tstatw, 324, 32, G.W_Grey, P(label), label_len, G.W_RegularFont);
      }
    }
  } else {
    if (fr || db_redraw_lab2$old_egn !== G.me.p_etemp) {
      db_bar(S("Egn"), 322, 2, 75, 25, G.me.p_ship.s_maxegntemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0, G.me.p_etemp / 10 | 0, 1);
    }
    if (fr || db_redraw_lab2$old_wpn !== G.me.p_wtemp) {
      W_ClearArea(G.tstatw, 324, 32, 78, G.W_Textheight);
      label[0] = 87;
      label[1] = 112;
      label[2] = 110;
      label[3] = 58;
      label[4] = 32;
      label_len = 5 + db_itoa(P(label, 5), G.me.p_wtemp / 10 | 0);
      label[label_len++] = 47;
      label_len += db_itoa(P(label, label_len), G.me.p_ship.s_maxwpntemp / 10 | 0);
      if (G.me.p_wtemp > (G.me.p_ship.s_maxwpntemp / 2 | 0)) {
        W_WriteText(G.tstatw, 324, 32, G.W_White, P(label), label_len, G.W_HighlightFont);
      } else {
        W_WriteText(G.tstatw, 324, 32, G.W_Grey, P(label), label_len, G.W_RegularFont);
      }
    }
  }
  if (fr || db_redraw_lab2$old_arm !== G.me.p_armies || db_redraw_lab2$old_cur_arm !== cur_arm) {
    W_ClearArea(G.tstatw, 402, 2, 98, G.W_Textheight);
    if (cur_arm > 0) {
      label[0] = 65;
      label[1] = 114;
      label[2] = 109;
      label[3] = 105;
      label[4] = 101;
      label[5] = 115;
      label[6] = 58;
      label[7] = 32;
      label_len = 8 + db_itoa(P(label, 8), G.me.p_armies);
      label[label_len++] = 47;
      label_len += db_itoa(P(label, label_len), cur_arm);
      if (G.me.p_armies >= cur_arm) {
        W_WriteText(G.tstatw, 402, 2, G.W_Red, P(label), label_len, G.W_HighlightFont);
      } else if (G.me.p_armies > 0) {
        W_WriteText(G.tstatw, 402, 2, G.W_Yellow, P(label), label_len, G.W_HighlightFont);
      } else {
        W_WriteText(G.tstatw, 402, 2, G.W_Green, P(label), label_len, G.W_HighlightFont);
      }
    }
  }
  if (fr || db_redraw_lab2$old_kills !== G.me.p_kills) {
    W_ClearArea(G.tstatw, 402, 4 + G.W_Textheight, 98, G.W_Textheight);
    if (G.me.p_kills > 0) {
      label[0] = 32;
      label[1] = 75;
      label[2] = 105;
      label[3] = 108;
      label[4] = 108;
      label[5] = 115;
      label[6] = 58;
      label[7] = 32;
      label_len = 8 + db_ftoa(P(label, 8), G.me.p_kills);
      if (cur_arm > 4) {
        W_WriteText(G.tstatw, 402, 4 + G.W_Textheight, G.W_White, P(label), label_len, G.W_HighlightFont);
      } else if (cur_arm > 1) {
        W_WriteText(G.tstatw, 402, 4 + G.W_Textheight, G.W_White, P(label), label_len, G.W_RegularFont);
      } else {
        W_WriteText(G.tstatw, 402, 4 + G.W_Textheight, G.W_Grey, P(label), label_len, G.W_RegularFont);
      }
    }
    db_redraw_lab2$old_kills = G.me.p_kills;
  }
  db_redraw_lab2$old_spd = G.me.p_speed;
  db_redraw_lab2$old_cur_max = cur_max;
  db_redraw_lab2$old_shl = G.me.p_shield;
  db_redraw_lab2$old_dam = G.me.p_damage;
  db_redraw_lab2$old_arm = G.me.p_armies;
  db_redraw_lab2$old_cur_arm = cur_arm;
  db_redraw_lab2$old_wpn = G.me.p_wtemp;
  db_redraw_lab2$old_egn = G.me.p_etemp;
  db_redraw_lab2$old_ful = G.me.p_fuel;
}

export function $init(): void {
  db_flags$old_flags = 4294967295;
  db_flags$old_tourn = 255;
  db_redraw_lab2$old_spd = -1;
  db_redraw_lab2$old_cur_max = -1;
  db_redraw_lab2$old_shl = -1;
  db_redraw_lab2$old_dam = -1;
  db_redraw_lab2$old_arm = -1;
  db_redraw_lab2$old_cur_arm = -1;
  db_redraw_lab2$old_wpn = -1;
  db_redraw_lab2$old_egn = -1;
  db_redraw_lab2$old_ful = -1;
  db_redraw_lab2$old_kills = -1;
}
