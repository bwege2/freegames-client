// @ts-nocheck
// COW 3.3.3 redraw.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { db_redraw } from './dashboard.ts';
import { death } from './death.ts';
import { msetime, run_clock } from './interface.ts';
import { clearLocal, local } from './local.ts';
import { initPlanets, map } from './map.ts';
import { readFromFile } from './playback.ts';
import { UpdatePlistFn } from './playerlist.ts';
import { readFromServer, sendUpdatePacket } from './socket.ts';
import { updateStats } from './stats.ts';
import { W_ClearArea, W_ClearWindow, W_EraseTTSText, W_Flush, W_FlushLineCaches, W_FlushWindow, W_IsMapped, W_ProbeLatency, W_WriteTTSText, W_WriteText } from './x11window.ts';
import { struct_event, struct_fd_set } from './structs.ts';
import { $cast, $rd, $sadd, $u64, $wr, G, P, R, S, fprintf, sprintf, strlen, time } from '../rt/index.ts';
import { ASSAULT, PFBEAMDOWN, PFBEAMUP, PFBOMB, PFCLOAK, PFDOCK, PFDOCKOK, PFENG, PFGREEN, PFOBSERV, PFORBIT, PFPLLOCK, PFPLOCK, PFPRESS, PFRED, PFREPAIR, PFSHIELD, PFTRACT, PFWEP, PFYELLOW, POUTFIT, STARBASE, TWINSIDE } from './consts.ts';

let lastread: number;
let needredraw: number;
let lastredraw: number;
let redraw$last_width: number;
let stline$buf1: any;
let stline$buf2: any;
let stline$whichbuf: number;
let updateMaxStats$lastdamage: number;
let updateMaxStats$lastkills: number;
let updateMaxStats$lastship: number;

export async function intrupt(readfds: struct_fd_set | null): Promise<void> {
  let t = 0;
  ++G.udcounter;
  if (G.playback) {
    needredraw |= await readFromFile();
  } else {
    needredraw |= await readFromServer(readfds);
  }
  t = msetime();
  if (needredraw && t >= lastredraw + $u64(G.redrawDelay * 100)) {
    lastredraw = t;
    needredraw = 0;
    lastread = time(null);
    redraw();
    updateMaxStats(0);
    if (G.plistUpdated) {
      UpdatePlistFn();
    }
  }
  if (G.reinitPlanets) {
    initPlanets();
    G.reinitPlanets = 0;
  }
  if (G.me.p_status === POUTFIT) {
    await death();
  }
  return;
}

export function redraw(): void {
  if (G.warntimer <= G.udcounter && G.warncount > 0) {
    W_ClearArea(G.warnw, 5, 5, Math.imul(G.W_Textwidth, G.warncount), G.W_Textheight);
    G.warncount = 0;
  }
  run_clock(lastread);
  clearLocal();
  if (G.tts_timer) {
    --G.tts_timer;
    if (!G.tts_timer) {
      W_EraseTTSText(G.w, TWINSIDE, G.tts_pos, redraw$last_width);
      redraw$last_width = 0;
    } else if (G.tts_timer === G.tts_time - 1 && redraw$last_width) {
      W_EraseTTSText(G.w, TWINSIDE, G.tts_pos, redraw$last_width);
      W_WriteTTSText(G.w, TWINSIDE, G.tts_pos, G.tts_width, P(G.lastIn), G.tts_len);
      redraw$last_width = G.tts_width;
    } else {
      W_WriteTTSText(G.w, TWINSIDE, G.tts_pos, G.tts_width, P(G.lastIn), G.tts_len);
      redraw$last_width = G.tts_width;
    }
  }
  local();
  W_FlushLineCaches(G.w);
  if (G.newDashboard) {
    if (G.newDashboard === G.old_db) {
      db_redraw(0);
    } else {
      redrawTstats(null);
    }
  } else if (G.newDashboard === G.old_db) {
    stline(0);
  } else {
    redrawTstats(null);
  }
  G.old_db = G.newDashboard;
  if (W_IsMapped(G.statwin)) {
    updateStats();
  }
  W_FlushWindow(G.w);
  W_ProbeLatency(G.w);
  W_Flush();
  map();
  W_FlushWindow(G.mapw);
  if (G.visual_l > 40000 && G.client_ups >= 25) {
    fprintf(R.stderr, S("redraw: visual latency %lu us exceeds %d ups, drop to 10 ups\n"), G.visual_l, G.client_ups);
    G.client_ups = 10;
    sendUpdatePacket(1000000 / G.client_ups | 0);
  }
  if (G.visual_l > 100000 && G.client_ups >= 10) {
    fprintf(R.stderr, S("redraw: visual latency %lu us exceeds %d ups, drop to 5 ups\n"), G.visual_l, G.client_ups);
    G.client_ups = 5;
    sendUpdatePacket(1000000 / G.client_ups | 0);
  }
  if (G.visual_l > 200000 && G.client_ups >= 5) {
    fprintf(R.stderr, S("redraw: visual latency %lu us exceeds %d ups, drop to 2 ups\n"), G.visual_l, G.client_ups);
    G.client_ups = 2;
    sendUpdatePacket(1000000 / G.client_ups | 0);
  }
}

function stline(flag: number): void {
  let $t1: any, $t2: any;
  let buf = null;
  let oldbuf = null;
  let s = null;
  let i = 0;
  let j = 0;
  let k = 0;
  let plr = null;
  if ((G.me.p_flags & (PFPLOCK | PFOBSERV)) >>> 0 === (PFPLOCK | PFOBSERV)) {
    plr = $sadd(G.players, G.me.p_playerl);
  } else {
    plr = G.me;
  }
  if (flag) {
    stline$whichbuf = 0;
  }
  if (stline$whichbuf !== 2) {
    buf = P(stline$buf1);
    oldbuf = P(stline$buf2);
  } else {
    buf = P(stline$buf2);
    oldbuf = P(stline$buf1);
  }
  buf.a[buf.o] = ((G.me.p_flags & PFSHIELD) >>> 0 ? 83 : 32) << 24 >> 24;
  if ((G.me.p_flags & PFGREEN) >>> 0) {
    buf.a[buf.o + 1] = 71;
  } else if ((G.me.p_flags & PFYELLOW) >>> 0) {
    buf.a[buf.o + 1] = 89;
  } else if ((G.me.p_flags & PFRED) >>> 0) {
    buf.a[buf.o + 1] = 82;
  }
  buf.a[buf.o + 2] = ((G.me.p_flags & (PFPLLOCK | PFPLOCK)) >>> 0 ? 76 : 32) << 24 >> 24;
  buf.a[buf.o + 3] = ((G.me.p_flags & PFREPAIR) >>> 0 ? 82 : 32) << 24 >> 24;
  buf.a[buf.o + 4] = ((G.me.p_flags & PFBOMB) >>> 0 ? 66 : 32) << 24 >> 24;
  buf.a[buf.o + 5] = ((G.me.p_flags & PFORBIT) >>> 0 ? 79 : 32) << 24 >> 24;
  if (G.me.p_ship.s_type === STARBASE) {
    buf.a[buf.o + 6] = ((G.me.p_flags & PFDOCKOK) >>> 0 ? 68 : 32) << 24 >> 24;
  } else {
    buf.a[buf.o + 6] = ((G.me.p_flags & PFDOCK) >>> 0 ? 68 : 32) << 24 >> 24;
  }
  buf.a[buf.o + 7] = ((G.me.p_flags & PFCLOAK) >>> 0 ? 67 : 32) << 24 >> 24;
  buf.a[buf.o + 8] = ((G.me.p_flags & PFWEP) >>> 0 ? 87 : 32) << 24 >> 24;
  buf.a[buf.o + 9] = ((G.me.p_flags & PFENG) >>> 0 ? 69 : 32) << 24 >> 24;
  if ((G.me.p_flags & PFPRESS) >>> 0) {
    buf.a[buf.o + 10] = 80;
  } else if ((G.me.p_flags & PFTRACT) >>> 0) {
    buf.a[buf.o + 10] = 84;
  } else {
    buf.a[buf.o + 10] = 32;
  }
  if ((G.me.p_flags & PFBEAMUP) >>> 0) {
    buf.a[buf.o + 11] = 117;
  } else if ((G.me.p_flags & PFBEAMDOWN) >>> 0) {
    buf.a[buf.o + 11] = 100;
  } else {
    buf.a[buf.o + 11] = 32;
  }
  buf.a[buf.o + 12] = (G.status.tourn ? 116 : 32) << 24 >> 24;
  buf.a[buf.o + 13] = 32;
  buf.a[buf.o + 14] = 48 + (G.me.p_speed % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 14] === 48) {
    buf.a[buf.o + 14] = 32;
  }
  buf.a[buf.o + 15] = 48 + G.me.p_speed % 10 << 24 >> 24;
  buf.a[buf.o + 16] = 32;
  buf.a[buf.o + 17] = 32;
  buf.a[buf.o + 18] = 48 + (G.me.p_damage / 100 | 0) << 24 >> 24;
  if (buf.a[buf.o + 18] === 48) {
    buf.a[buf.o + 18] = 32;
  }
  buf.a[buf.o + 19] = 48 + (G.me.p_damage % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 19] === 48 && G.me.p_damage < 100) {
    buf.a[buf.o + 19] = 32;
  }
  buf.a[buf.o + 20] = 48 + G.me.p_damage % 10 << 24 >> 24;
  buf.a[buf.o + 21] = 32;
  buf.a[buf.o + 22] = 48 + (G.me.p_shield / 100 | 0) << 24 >> 24;
  if (buf.a[buf.o + 22] === 48) {
    buf.a[buf.o + 22] = 32;
  }
  buf.a[buf.o + 23] = 48 + (G.me.p_shield % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 23] === 48 && G.me.p_shield < 100) {
    buf.a[buf.o + 23] = 32;
  }
  buf.a[buf.o + 24] = 48 + G.me.p_shield % 10 << 24 >> 24;
  buf.a[buf.o + 25] = 32;
  buf.a[buf.o + 26] = 32;
  buf.a[buf.o + 27] = 48 + (plr.p_ntorp % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 27] === 48) {
    buf.a[buf.o + 27] = 32;
  }
  buf.a[buf.o + 28] = 48 + plr.p_ntorp % 10 << 24 >> 24;
  buf.a[buf.o + 29] = 32;
  buf.a[buf.o + 30] = 32;
  buf.a[buf.o + 31] = 32;
  buf.a[buf.o + 32] = 48 + (Math.trunc(plr.p_kills / 100) | 0) << 24 >> 24;
  if (buf.a[buf.o + 32] === 48) {
    buf.a[buf.o + 32] = 32;
  }
  buf.a[buf.o + 33] = 48 + (Math.trunc(plr.p_kills / 10) | 0) % 10 << 24 >> 24;
  if (buf.a[buf.o + 32] === 32 && buf.a[buf.o + 33] === 48) {
    buf.a[buf.o + 33] = 32;
  }
  buf.a[buf.o + 34] = 48 + (Math.trunc(plr.p_kills) | 0) % 10 << 24 >> 24;
  buf.a[buf.o + 35] = 46;
  buf.a[buf.o + 36] = 48 + (Math.trunc(plr.p_kills * 10) | 0) % 10 << 24 >> 24;
  buf.a[buf.o + 37] = 48 + (Math.trunc(plr.p_kills * 100) | 0) % 10 << 24 >> 24;
  buf.a[buf.o + 38] = 32;
  buf.a[buf.o + 39] = 32;
  buf.a[buf.o + 40] = 32;
  buf.a[buf.o + 41] = 32;
  buf.a[buf.o + 42] = 48 + (G.me.p_armies % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 42] === 48) {
    buf.a[buf.o + 42] = 32;
  }
  buf.a[buf.o + 43] = 48 + G.me.p_armies % 10 << 24 >> 24;
  buf.a[buf.o + 44] = 32;
  buf.a[buf.o + 45] = 32;
  buf.a[buf.o + 46] = 48 + (G.me.p_fuel / 100000 | 0) << 24 >> 24;
  if (buf.a[buf.o + 46] === 48) {
    buf.a[buf.o + 46] = 32;
  }
  buf.a[buf.o + 47] = 48 + (G.me.p_fuel % 100000 / 10000 | 0) << 24 >> 24;
  if (buf.a[buf.o + 47] === 48 && G.me.p_fuel < 100000) {
    buf.a[buf.o + 47] = 32;
  }
  buf.a[buf.o + 48] = 48 + (G.me.p_fuel % 10000 / 1000 | 0) << 24 >> 24;
  if (buf.a[buf.o + 48] === 48 && G.me.p_fuel < 10000) {
    buf.a[buf.o + 48] = 32;
  }
  buf.a[buf.o + 49] = 48 + (G.me.p_fuel % 1000 / 100 | 0) << 24 >> 24;
  if (buf.a[buf.o + 49] === 48 && G.me.p_fuel < 1000) {
    buf.a[buf.o + 49] = 32;
  }
  buf.a[buf.o + 50] = 48 + (G.me.p_fuel % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 50] === 48 && G.me.p_fuel < 100) {
    buf.a[buf.o + 50] = 32;
  }
  buf.a[buf.o + 51] = 48 + G.me.p_fuel % 10 << 24 >> 24;
  buf.a[buf.o + 52] = 32;
  buf.a[buf.o + 53] = 32;
  buf.a[buf.o + 54] = 32;
  buf.a[buf.o + 55] = 48 + ((G.me.p_wtemp / 10 | 0) / 100 | 0) << 24 >> 24;
  if (buf.a[buf.o + 55] === 48) {
    buf.a[buf.o + 55] = 32;
  }
  buf.a[buf.o + 56] = 48 + ((G.me.p_wtemp / 10 | 0) % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 56] === 48 && G.me.p_wtemp < 1000) {
    buf.a[buf.o + 56] = 32;
  }
  buf.a[buf.o + 57] = 48 + (G.me.p_wtemp / 10 | 0) % 10 << 24 >> 24;
  buf.a[buf.o + 58] = 32;
  buf.a[buf.o + 59] = 32;
  buf.a[buf.o + 60] = 32;
  buf.a[buf.o + 61] = 48 + ((G.me.p_etemp / 10 | 0) / 100 | 0) << 24 >> 24;
  if (buf.a[buf.o + 61] === 48) {
    buf.a[buf.o + 61] = 32;
  }
  buf.a[buf.o + 62] = 48 + ((G.me.p_etemp / 10 | 0) % 100 / 10 | 0) << 24 >> 24;
  if (buf.a[buf.o + 62] === 48 && G.me.p_etemp < 1000) {
    buf.a[buf.o + 62] = 32;
  }
  buf.a[buf.o + 63] = 48 + (G.me.p_etemp / 10 | 0) % 10 << 24 >> 24;
  if (stline$whichbuf === 0) {
    W_WriteText(G.tstatw, 50, 16, G.textColor, buf, 64, G.W_RegularFont);
    stline$whichbuf = 1;
  } else {
    stline$whichbuf = 3 - stline$whichbuf << 24 >> 24;
    j = -1;
    for (i = 0; i < 64; ++i) {
      if ($rd(($t1 = buf, buf = $t1.add(1), $t1)) !== $rd(($t2 = oldbuf, oldbuf = $t2.add(1), $t2))) {
        if (j === -1) {
          k = i;
          s = buf.add(-1);
        }
        j = 0;
      } else {
        if (j === -1) {
          continue;
        }
        ++j;
        if (j === 20) {
          W_WriteText(G.tstatw, 50 + Math.imul(G.W_Textwidth, k), 16, G.textColor, s, i - k - 19, G.W_RegularFont);
          j = -1;
        }
      }
    }
    if (j !== -1) {
      W_WriteText(G.tstatw, 50 + Math.imul(G.W_Textwidth, k), 16, G.textColor, s, i - k - j, G.W_RegularFont);
    }
  }
}

export function redrawTstats(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  if (G.newDashboard) {
    db_redraw(1);
  } else {
    W_ClearWindow(G.tstatw);
    stline(1);
    updateMaxStats(1);
  }
  return;
}

function updateMaxStats(redraw: number): void {
  let buf = new Int8Array(8192);
  let maxspeed = 0;
  let troop_capacity = 0;
  let kills = 0;
  let mykills = 0;
  if (G.newDashboard) {
    return;
  }
  if ((G.me.p_flags & (PFPLOCK | PFOBSERV)) >>> 0 === (PFPLOCK | PFOBSERV)) {
    kills = $sadd(G.players, G.me.p_playerl).p_kills;
  } else {
    kills = G.me.p_kills;
  }
  mykills = Math.trunc(10 * kills) | 0;
  if (!redraw && updateMaxStats$lastkills === mykills && updateMaxStats$lastship === G.me.p_ship.s_type && updateMaxStats$lastdamage === G.me.p_damage) {
    return;
  }
  updateMaxStats$lastkills = mykills;
  updateMaxStats$lastdamage = G.me.p_damage;
  updateMaxStats$lastship = G.me.p_ship.s_type;
  if (G.me.p_ship.s_type === ASSAULT) {
    troop_capacity = kills * 3 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(kills * 3) | 0;
  } else if (G.me.p_ship.s_type !== STARBASE) {
    troop_capacity = kills * 2 > G.me.p_ship.s_maxarmies ? G.me.p_ship.s_maxarmies : Math.trunc(kills * 2) | 0;
  } else {
    troop_capacity = G.me.p_ship.s_maxarmies;
  }
  maxspeed = Math.trunc(G.me.p_ship.s_maxspeed + 2 - (G.me.p_ship.s_maxspeed + 1) * (G.me.p_damage / G.me.p_ship.s_maxdamage)) | 0;
  if (maxspeed > G.me.p_ship.s_maxspeed) {
    maxspeed = G.me.p_ship.s_maxspeed;
  }
  if (maxspeed < 0) {
    maxspeed = 0;
  }
  sprintf(P(buf), S("Flags        Warp Dam Shd Torps  Kills Armies   Fuel  Wtemp Etemp  Time"));
  W_WriteText(G.tstatw, 50, 5, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  sprintf(P(buf), S("Maximum:   %2d/%2d  %3d %3d              %2d/%2d  %6d   %3d   %3d"), maxspeed, G.me.p_ship.s_maxspeed, G.me.p_ship.s_maxdamage, G.me.p_ship.s_maxshield, troop_capacity, G.me.p_ship.s_maxarmies, G.me.p_ship.s_maxfuel, G.me.p_ship.s_maxwpntemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0);
  W_WriteText(G.tstatw, 50, 27, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
}

export function $init(): void {
  lastread = 0;
  needredraw = 0;
  lastredraw = 0;
  redraw$last_width = 0;
  stline$buf1 = new Int8Array(80);
  stline$buf2 = new Int8Array(80);
  stline$whichbuf = 0;
  updateMaxStats$lastdamage = -1;
  updateMaxStats$lastkills = -1;
  updateMaxStats$lastship = -1;
}
