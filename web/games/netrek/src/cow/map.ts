// @ts-nocheck
// COW 3.3.3 map.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { S_mArmy, S_mFuel, S_mOwner, S_mPlanet, S_mRepair, W_DrawSprite, W_GalacticBgd } from './x11sprite.ts';
import { W_ClearArea, W_ClearWindow, W_Halo, W_MakeLine, W_MaskText, W_OverlayBitmap, W_WriteBitmap, W_WriteText, W_WriteTriangle } from './x11window.ts';
import { struct_planet } from './structs.ts';
import { $arr, $sadd, $sidx, G, P, S, sprintf, strcat, strcpy, strlen, tolower } from '../rt/index.ts';
import { DETAIL, GU_CHAOS, GU_CONQUER, GU_INL_DRAFTING, GU_INROBOT, GU_PAUSED, GU_PRACTICE, GU_UNSAFE, GWIDTH, HOCKEY_PIX, LITE_PLAYERS_MAP, MAP_PIX, MAXPLANETS, MAXPLAYER, NOBODY, NO_HALOS, NO_MAP_PIX, PALIVE, PFCLOAK, PFOBSERV, PFPLLOCK, PFPLOCK, PLCLEAR, PLFUEL, PLREDRAW, PLREPAIR, TWINSIDE, emph_planet_seq_frames, emph_planet_seq_height, emph_planet_seq_width, emph_player_seq_frames, emph_player_seq_height, emph_player_seq_width, mplanet_height, mplanet_width } from './consts.ts';

let roughMap: any;
let roughMap2: any;
let initialized: number;
let gu_last_width: number;
let gu_height: number;
let gu_text: any;
let gu_length: number;
let gu_width: number;
let gu_redraw: number;
let gu_update$old_gameup: number;
let gu_update$old_tournament_remain: number;
let gu_update$old_flags: number;
let map$clearlock: number;
let map$mclearzone: any;
let map$clearlmark: any;
let map$lastUpdate: any;

export function initPlanets(): void {
  let x = 0;
  let y = 0;
  let k = 0;
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  let pl = null;
  let pRadius = (Math.imul(mplanet_width, GWIDTH) / (G.small_screen ? 400 : 500) | 0) / 2 | 0;
  let tHeight = Math.imul(G.W_Textheight, GWIDTH) / (G.small_screen ? 400 : 500) | 0;
  let tWidth = Math.imul(G.W_Textwidth, GWIDTH) / (G.small_screen ? 400 : 500) | 0;
  for (x = 0; x < DETAIL; ++x) {
    for (y = 0; y < DETAIL; ++y) {
      roughMap[x][y] = -1;
      roughMap2[x][y] = -1;
    }
  }
  for (k = 0, pl = G.planets; k < MAXPLANETS; ++k, pl = $sadd(pl, 1)) {
    startX = (pl.pl_x - pRadius - tWidth) / (100000 / 100 | 0) | 0;
    endX = (pl.pl_x + pRadius + tWidth + (tWidth / 2 | 0)) / (100000 / 100 | 0) | 0;
    startY = (pl.pl_y - pRadius - (tHeight / 2 | 0)) / (100000 / 100 | 0) | 0;
    endY = (pl.pl_y + pRadius + tHeight + (tHeight / 2 | 0)) / (100000 / 100 | 0) | 0;
    if (startX < 0) {
      startX = 0;
    }
    if (endX >= DETAIL) {
      endX = DETAIL - 1;
    }
    if (startY < 0) {
      startY = 0;
    }
    if (endY >= DETAIL) {
      endY = DETAIL - 1;
    }
    for (x = startX; x <= endX; ++x) {
      for (y = startY; y <= endY; ++y) {
        if (roughMap[x][y] === -1) {
          roughMap[x][y] = k << 24 >> 24;
        } else {
          roughMap2[x][y] = k << 24 >> 24;
        }
      }
    }
  }
  initialized = 1;
}

function checkRedraw(x: number, y: number): void {
  let $t1: any, $t2: any;
  let i = 0;
  let j = null;
  x = x / (100000 / 100 | 0) | 0;
  y = y / (100000 / 100 | 0) | 0;
  i = roughMap[x][y];
  if (i === -1) {
    return;
  }
  ($t1 = $sadd(G.planets, i), $t1.pl_flags = $t1.pl_flags | PLREDRAW);
  for (i = 0, j = $sadd(G.players, i); i < MAXPLAYER; ++i, j = $sadd(j, 1)) {
    if (j.p_status !== PALIVE) {
      continue;
    }
    if ((j.p_flags & PFOBSERV) >>> 0) {
      continue;
    }
    if (roughMap[j.p_x / (100000 / 100 | 0) | 0][j.p_y / (100000 / 100 | 0) | 0] !== -1) {
      G.redrawPlayer[i] = 1;
    }
  }
  i = roughMap2[x][y];
  if (i === -1) {
    return;
  }
  ($t2 = $sadd(G.planets, i), $t2.pl_flags = $t2.pl_flags | PLREDRAW);
}

function planetmBitmap(p: struct_planet | null): Ptr | null {
  let i = 0;
  if (G.showgalactic === 0) {
    return G.mbplanets[0];
  } else if (p.pl_info & G.me.p_team || G.playback) {
    if (G.showgalactic === 1) {
      return G.mbplanets[G.remap[p.pl_owner]];
    } else {
      i = 0;
      if (p.pl_armies > 4) {
        i += 4;
      }
      if (p.pl_flags & PLREPAIR) {
        i += 2;
      }
      if (p.pl_flags & PLFUEL) {
        i += 1;
      }
      switch (G.showgalactic) {
      case 2:
        return G.mbplanets2[i];
      case 3:
        return G.mbplanets3[i];
      case 4:
        return G.mbplanets4[i];
      default:
        return G.mbplanets[0];
      }
    }
  } else {
    return G.mbplanets[5];
  }
}

function DrawPlanets(): void {
  let l = null;
  let dx = 0;
  let dy = 0;
  const ch = new Int8Array(1);
  let sprite = null;
  for (l = $sadd($sadd(G.planets, MAXPLANETS), -1); $sidx(l) >= $sidx(G.planets); l = $sadd(l, -1)) {
    if (!(l.pl_flags & PLREDRAW)) {
      continue;
    }
    l.pl_flags &= ~PLREDRAW;
    dx = Math.imul(l.pl_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
    dy = Math.imul(l.pl_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
    if (G.pl_update[l.pl_no].plu_update === 1) {
      let odx = 0;
      let ody = 0;
      odx = Math.imul(G.pl_update[l.pl_no].plu_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
      ody = Math.imul(G.pl_update[l.pl_no].plu_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
      W_ClearArea(G.mapw, odx - (mplanet_width / 2 | 0), ody - (mplanet_height / 2 | 0), mplanet_width, mplanet_height);
      W_WriteText(G.mapw, odx - (mplanet_width / 2 | 0), ody + (mplanet_height / 2 | 0), G.backColor, P(l.pl_name), 3, G.me.p_team === l.pl_owner ? G.W_HighlightFont : l.pl_info & G.me.p_team && !(l.pl_owner & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
      G.pl_update[l.pl_no].plu_update = 0;
    } else if (l.pl_flags & PLCLEAR) {
      W_ClearArea(G.mapw, dx - ((mplanet_width / 2 | 0) + 4), dy - ((mplanet_height / 2 | 0) + 4), mplanet_width + 8, mplanet_height + 8);
      l.pl_flags &= ~PLCLEAR;
    }
    if (G.UseLite && G.emph_planet_seq_n[l.pl_no] > 0) {
      let seq_n = (G.emph_planet_seq_n[l.pl_no] * 5 / G.server_ups | 0) % emph_planet_seq_frames;
      W_OverlayBitmap(dx - ((emph_planet_seq_width / 2 | 0) + 1), dy - (emph_planet_seq_height / 2 | 0), G.emph_planet_seq[seq_n], G.W_White);
      W_WriteBitmap(dx - (mplanet_width / 2 | 0), dy - (mplanet_height / 2 | 0), planetmBitmap(l), l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor);
      G.emph_planet_seq_n[l.pl_no] -= 1;
      l.pl_flags |= PLREDRAW;
      l.pl_flags |= PLCLEAR;
    } else {
      sprite = S_mPlanet(l.pl_no);
      if (!sprite) {
        G.pixFlags |= NO_MAP_PIX;
      }
      if (!(G.pixFlags & NO_MAP_PIX)) {
        W_DrawSprite(sprite, dx, dy, G.small_screen ? 400 : 500);
        W_DrawSprite(S_mArmy(l.pl_no), dx, dy, G.small_screen ? 400 : 500);
        W_DrawSprite(S_mRepair(l.pl_no), dx, dy, G.small_screen ? 400 : 500);
        W_DrawSprite(S_mFuel(l.pl_no), dx, dy, G.small_screen ? 400 : 500);
        W_DrawSprite(S_mOwner(l.pl_no), dx, dy, G.small_screen ? 400 : 500);
        if (!(G.pixFlags & NO_HALOS)) {
          W_Halo(dx, dy, l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor);
        }
      } else {
        W_OverlayBitmap(dx - (mplanet_width / 2 | 0), dy - (mplanet_height / 2 | 0), planetmBitmap(l), l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor);
      }
    }
    W_WriteText(G.mapw, dx - (mplanet_width / 2 | 0), dy + (mplanet_height / 2 | 0), l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor, P(l.pl_name), 3, G.me.p_team === l.pl_owner ? G.W_HighlightFont : l.pl_info & G.me.p_team && !(l.pl_owner & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
    if (G.showIND && (l.pl_info & G.me.p_team || G.playback) && l.pl_owner === NOBODY) {
      W_MakeLine(G.mapw, dx + ((mplanet_width / 2 | 0) - 1), dy + ((mplanet_height / 2 | 0) - 1), dx - (mplanet_width / 2 | 0), dy - (mplanet_height / 2 | 0), G.W_White);
      W_MakeLine(G.mapw, dx - (mplanet_width / 2 | 0), dy + ((mplanet_height / 2 | 0) - 1), dx + ((mplanet_width / 2 | 0) - 1), dy - (mplanet_height / 2 | 0), G.W_White);
    }
    if (G.showPlanetOwner) {
      ch[0] = (l.pl_info & G.me.p_team || G.playback ? tolower(G.teamlet[l.pl_owner]) : 63) << 24 >> 24;
      W_WriteText(G.mapw, dx + (mplanet_width / 2 | 0) + 2, dy - 4, l.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[l.pl_owner]] : G.unColor, P(ch, 0), 1, G.me.p_team === l.pl_owner ? G.W_HighlightFont : l.pl_info & G.me.p_team && !(l.pl_owner & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
    }
  }
}

function gu_draw(color: number): void {
  W_MaskText(G.mapw, (TWINSIDE / 2 | 0) - (gu_width / 2 | 0), (TWINSIDE / 2 | 0) - (gu_height / 2 | 0), color, P(gu_text), gu_length, G.W_BigFont);
}

function gu_update(): void {
  let eager = 0;
  if (gu_last_width === -1) {
    gu_height = G.W_BigTextheight;
    gu_width = -1;
    gu_redraw = 1;
  }
  if (!gu_redraw && (G.me.p_flags & PFOBSERV) >>> 0 === gu_update$old_flags >>> 0 && G.context.gameup === gu_update$old_gameup && G.context.tournament_remain === gu_update$old_tournament_remain) {
    return;
  }
  gu_update$old_flags = (G.me.p_flags & PFOBSERV) >>> 0 | 0;
  gu_update$old_gameup = G.context.gameup;
  gu_update$old_tournament_remain = G.context.tournament_remain;
  if (gu_last_width !== -1) {
    gu_draw(G.W_Black);
  }
  strcpy(P(gu_text), S(" "));
  if (!(G.context.gameup & GU_UNSAFE)) {
    strcat(P(gu_text), S("SAFE-IDLE "));
    ++eager;
  }
  if ((G.me.p_flags & PFOBSERV) >>> 0) {
    strcat(P(gu_text), S("OBSERVE "));
    ++eager;
  }
  if (G.context.gameup & GU_INROBOT) {
    if (G.context.gameup & (GU_CHAOS | GU_PRACTICE)) {
      strcat(P(gu_text), S("PREGAME "));
      ++eager;
    } else if (G.context.gameup & (GU_PRACTICE | GU_PAUSED)) {
      strcat(P(gu_text), S("PAUSED "));
      ++eager;
    }
    if (G.context.gameup & GU_INL_DRAFTING) {
      strcat(P(gu_text), S("DRAFTING "));
      ++eager;
    }
  } else {
    if (G.context.gameup & GU_CONQUER) {
      strcat(P(gu_text), S("CONQUEST PARADE "));
      ++eager;
    } else if (G.context.gameup & GU_PAUSED) {
      strcat(P(gu_text), S("PAUSED "));
      ++eager;
    }
  }
  if (G.context.tournament_remain !== 0) {
    let buf = new Int8Array(40);
    sprintf(P(buf), S("%d%c "), G.context.tournament_remain, G.context.tournament_remain_units);
    strcat(P(gu_text), P(buf));
    ++eager;
  }
  if (eager) {
    gu_length = strlen(P(gu_text)) | 0;
    gu_width = Math.imul(G.W_BigTextwidth, gu_length);
    gu_draw(G.W_Grey);
  } else {
    gu_width = -1;
  }
  gu_last_width = gu_width;
  gu_redraw = 0;
}

export function map(): void {
  let i = 0;
  let update = null;
  let j = null;
  let l = null;
  let dx = 0;
  let dy = 0;
  if (G.redrawall) {
    if (!initialized) {
      return;
    }
    if (G.hockey_s_lines) {
      W_GalacticBgd(HOCKEY_PIX);
    } else {
      W_GalacticBgd(MAP_PIX);
    }
    W_ClearWindow(G.mapw);
    map$clearlock = 0;
    for (i = 0; i < MAXPLAYER; ++i) {
      map$lastUpdate[i] = 0;
      map$mclearzone[2][i] = 0;
      G.redrawPlayer[i] = 1;
    }
    for (l = $sadd($sadd(G.planets, MAXPLANETS), -1); $sidx(l) >= $sidx(G.planets); l = $sadd(l, -1)) {
      l.pl_flags |= PLREDRAW;
    }
    ++gu_redraw;
    G.redrawall = 0;
  } else {
    if (map$clearlock) {
      map$clearlock = 0;
      W_WriteTriangle(G.mapw, map$clearlmark[0], map$clearlmark[1], map$clearlmark[2], map$clearlmark[3], G.backColor);
    }
    for (i = 0, update = P(map$lastUpdate); i < MAXPLAYER; ++i, update = update.add(1)) {
      if (G.redrawPlayer[i]) {
        if (map$mclearzone[2][i]) {
          W_ClearArea(G.mapw, map$mclearzone[0][i], map$mclearzone[1][i], map$mclearzone[2][i], map$mclearzone[3][i]);
          checkRedraw(map$mclearzone[4][i], map$mclearzone[5][i]);
          map$mclearzone[2][i] = 0;
        }
        update.a[update.o] = 0;
      } else if (update.a[update.o] === G.server_ups) {
        G.redrawPlayer[i] = 1;
      } else {
        update.a[update.o] = update.a[update.o] + 1 & 0xff;
      }
    }
  }
  gu_update();
  DrawPlanets();
  for (i = 0, j = $sadd(G.players, i); i < MAXPLAYER; ++i, j = $sadd(j, 1)) {
    if (!G.redrawPlayer[i]) {
      continue;
    }
    if (j.p_status !== PALIVE) {
      continue;
    }
    if ((j.p_flags & PFOBSERV) >>> 0) {
      continue;
    }
    if (j.p_x < 0 || j.p_x >= GWIDTH || j.p_y < 0 || j.p_y >= GWIDTH) {
      continue;
    }
    dx = Math.imul(j.p_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
    dy = Math.imul(j.p_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
    if ((j.p_flags & PFCLOAK) >>> 0) {
      W_WriteText(G.mapw, dx - G.W_Textwidth, dy - (G.W_Textheight / 2 | 0), G.unColor, P(G.cloakChars), G.cloakChars[1] === 0 ? 1 : 2, G.W_RegularFont);
    } else {
      W_WriteText(G.mapw, dx - G.W_Textwidth, dy - (G.W_Textheight / 2 | 0), G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(j.p_mapchars), 2, G.me === j ? G.W_HighlightFont : !(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
    }
    if (G.UseLite && G.emph_player_seq_n[i] > 0 && G.liteflag & LITE_PLAYERS_MAP) {
      let seq_n = (G.emph_player_seq_n[i] * 5 / G.server_ups | 0) % emph_player_seq_frames;
      W_WriteBitmap(dx - ((emph_player_seq_width / 2 | 0) - 1), dy - ((emph_player_seq_height / 2 | 0) + 1), G.emph_player_seq[seq_n], G.W_White);
      G.emph_player_seq_n[i] -= 1;
      map$mclearzone[0][i] = dx - ((emph_player_seq_width / 2 | 0) - 1);
      map$mclearzone[1][i] = dy - ((emph_player_seq_height / 2 | 0) + 1);
      map$mclearzone[2][i] = emph_player_seq_width;
      map$mclearzone[3][i] = emph_player_seq_height;
      map$mclearzone[4][i] = j.p_x;
      map$mclearzone[5][i] = j.p_y;
      G.redrawPlayer[i] = 1;
    } else {
      map$mclearzone[0][i] = dx - G.W_Textwidth;
      map$mclearzone[1][i] = dy - (G.W_Textheight / 2 | 0);
      map$mclearzone[2][i] = G.W_Textwidth * 2;
      map$mclearzone[3][i] = G.W_Textheight;
      map$mclearzone[4][i] = j.p_x;
      map$mclearzone[5][i] = j.p_y;
      G.redrawPlayer[i] = 0;
    }
  }
  if ((G.me.p_flags & PFPLOCK) >>> 0 && G.showLock & 1) {
    j = $sadd(G.players, G.me.p_playerl);
    if (j.p_status === PALIVE && !((j.p_flags & PFCLOAK) >>> 0)) {
      dx = Math.imul(j.p_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
      dy = Math.imul(j.p_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
      W_WriteTriangle(G.mapw, dx, dy + 6, 4, 1, G.foreColor);
      map$clearlmark[0] = dx;
      map$clearlmark[1] = dy + 6;
      map$clearlmark[2] = 4;
      map$clearlmark[3] = 1;
      map$clearlock = 1;
    }
  } else if ((G.me.p_flags & PFPLLOCK) >>> 0 && G.showLock & 1) {
    let l = $sadd(G.planets, G.me.p_planet);
    dx = Math.imul(l.pl_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
    dy = Math.imul(l.pl_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
    W_WriteTriangle(G.mapw, dx, dy - (mplanet_height / 2 | 0) - 4, 4, 0, G.foreColor);
    map$clearlmark[0] = dx;
    map$clearlmark[1] = dy - (mplanet_height / 2 | 0) - 4;
    map$clearlmark[2] = 4;
    map$clearlmark[3] = 0;
    map$clearlock = 1;
  }
}

export function $init(): void {
  roughMap = $arr(100, () => new Int8Array(100));
  roughMap2 = $arr(100, () => new Int8Array(100));
  initialized = 0;
  G.redrawall = 1;
  G.redrawPlayer = new Uint8Array(36);
  gu_last_width = -1;
  gu_height = 0;
  gu_text = new Int8Array(80);
  gu_length = 0;
  gu_width = 0;
  gu_redraw = 0;
  gu_update$old_gameup = 0;
  gu_update$old_tournament_remain = 0;
  gu_update$old_flags = 0;
  map$clearlock = 0;
  map$mclearzone = $arr(6, () => new Int32Array(36));
  map$clearlmark = new Int32Array(4);
  map$lastUpdate = new Uint8Array(36);
}
