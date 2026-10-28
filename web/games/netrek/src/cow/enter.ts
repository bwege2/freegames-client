// @ts-nocheck
// COW 3.3.3 enter.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_WriteText } from './x11window.ts';
import { struct_rank } from './structs.ts';
import { $sadd, $salloc, $u64, G, P, S, memcpy, sprintf, strlen } from '../rt/index.ts';
import { DEFAULT_NUMRANKS, GU_UNSAFE, GWIDTH, MAXPLANETS, MAXPLASMA, MAXPLAYER, MAXTORP, PFREE, PHFREE, PTFREE, S_LINE_HORIZONTAL, S_LINE_VERTICAL, TFREE } from './consts.ts';


export function enter(): void {
  drawTstats();
  G.delay = 0;
}

export function openmem(): void {
  let i = 0;
  G.players = G.universe.players[0];
  G.torps = G.universe.torps[0];
  G.plasmatorps = G.universe.plasmatorps[0];
  G.status = G.universe.status[0];
  G.planets = G.universe.planets[0];
  G.phasers = G.universe.phasers[0];
  G.mctl = G.universe.mctl[0];
  G.messages = G.universe.messages[0];
  G.context = G.universe.context[0];
  G.context.gameup = GU_UNSAFE;
  for (i = 0; i < MAXPLAYER; ++i) {
    $sadd(G.players, i).p_status = PFREE;
    $sadd(G.players, i).p_cloakphase = 0;
    $sadd(G.players, i).p_no = i;
    $sadd(G.players, i).p_ntorp = 0;
    $sadd(G.players, i).p_explode = 1;
    $sadd(G.players, i).p_stats.st_tticks = 1;
  }
  G.mctl.mc_current = 0;
  G.status.time = 1;
  G.status.timeprod = 1;
  G.status.kills = 1;
  G.status.losses = 1;
  G.status.time = 1;
  G.status.planets = 1;
  G.status.armsbomb = 1;
  for (i = 0; i < Math.imul(MAXPLAYER, MAXTORP); ++i) {
    $sadd(G.torps, i).t_status = TFREE;
    $sadd(G.torps, i).t_owner = (i / MAXTORP | 0) << 16 >> 16;
  }
  for (i = 0; i < MAXPLAYER; ++i) {
    $sadd(G.phasers, i).ph_status = PHFREE;
    $sadd(G.phasers, i).sound_phaser = 0;
  }
  for (i = 0; i < Math.imul(MAXPLAYER, MAXPLASMA); ++i) {
    $sadd(G.plasmatorps, i).pt_status = PTFREE;
    $sadd(G.plasmatorps, i).pt_owner = (i / MAXPLASMA | 0) << 16 >> 16;
  }
  for (i = 0; i < MAXPLANETS; ++i) {
    $sadd(G.planets, i).pl_no = i;
  }
  for (i = 0; i < MAXPLANETS; ++i) {
    G.pl_update[i].plu_update = -1;
  }
  G.nranks = DEFAULT_NUMRANKS;
  i = $u64(G.nranks) * 32 | 0;
  G.ranks = $salloc(struct_rank, $u64(i));
  memcpy(G.ranks, P(G.default_ranks), $u64(i));
  if (G.ghoststart) {
    G.me = $sadd(G.players, G.ghost_pno);
    G.myship = G.me.p_ship;
    G.mystats = G.me.p_stats;
  }
}

export function drawTstats(): void {
  let buf = new Int8Array(8192);
  if (G.newDashboard) {
    return;
  }
  sprintf(P(buf), S("Flags        Warp Dam Shd Torps  Kills Armies   Fuel  Wtemp Etemp"));
  W_WriteText(G.tstatw, 50, 5, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  sprintf(P(buf), S("Maximum:      %2d  %3d %3d               %3d   %6d   %3d   %3d"), G.me.p_ship.s_maxspeed, G.me.p_ship.s_maxdamage, G.me.p_ship.s_maxshield, G.me.p_ship.s_maxarmies, G.me.p_ship.s_maxfuel, G.me.p_ship.s_maxwpntemp / 10 | 0, G.me.p_ship.s_maxegntemp / 10 | 0);
  W_WriteText(G.tstatw, 50, 27, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
}

export function init_hockey_lines(): void {
  let i = 0;
  G.s_lines[i].begin_x = ((100000 - 0) / 2 | 0) - ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) + ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = 0 + ((100000 - 0) / 10 | 0);
  G.s_lines[i].color = G.W_Red;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) - ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = 0 + ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_y = 0 + (((100000 - 0) / 10 | 0) / 2 | 0);
  G.s_lines[i].color = G.W_Green;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_VERTICAL;
  G.s_lines[i].begin_x = G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) + ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = 0 + ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_y = 0 + (((100000 - 0) / 10 | 0) / 2 | 0);
  G.s_lines[i].color = G.W_Green;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_VERTICAL;
  G.s_lines[i].begin_x = ((100000 - 0) / 2 | 0) - ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) + ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = 0 + (((100000 - 0) / 10 | 0) / 2 | 0);
  G.s_lines[i].color = G.W_Green;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = (100000 / 2 | 0) - ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].end_x = (100000 / 2 | 0) + ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = 0 + ((100000 - 0) / 3 | 0);
  G.s_lines[i].color = G.W_Cyan;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = ((100000 - 0) / 2 | 0) - ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) + ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = 100000 - ((100000 - 0) / 10 | 0);
  G.s_lines[i].color = G.W_Red;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) - ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = 100000 - ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_y = 100000 - (((100000 - 0) / 10 | 0) / 2 | 0);
  G.s_lines[i].color = G.W_Cyan;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_VERTICAL;
  G.s_lines[i].begin_x = G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) + ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = 100000 - ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_y = 100000 - (((100000 - 0) / 10 | 0) / 2 | 0);
  G.s_lines[i].color = G.W_Cyan;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_VERTICAL;
  G.s_lines[i].begin_x = ((100000 - 0) / 2 | 0) - ((100000 - 0) / 10 | 0);
  G.s_lines[i].end_x = ((100000 - 0) / 2 | 0) + ((100000 - 0) / 10 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = 100000 - (((100000 - 0) / 10 | 0) / 2 | 0);
  G.s_lines[i].color = G.W_Cyan;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = (100000 / 2 | 0) - ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].end_x = (100000 / 2 | 0) + ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = 100000 - ((100000 - 0) / 3 | 0);
  G.s_lines[i].color = G.W_Cyan;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = (100000 / 2 | 0) - ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].end_x = (100000 / 2 | 0) + ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].begin_y = G.s_lines[i].end_y = (100000 - 0) / 2 | 0;
  G.s_lines[i].color = G.W_Red;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_HORIZONTAL;
  G.s_lines[i].begin_x = G.s_lines[i].end_x = (100000 / 2 | 0) + ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].begin_y = 0;
  G.s_lines[i].end_y = GWIDTH - 1;
  G.s_lines[i].color = G.W_Grey;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_VERTICAL;
  G.s_lines[i].begin_x = G.s_lines[i].end_x = (100000 / 2 | 0) - ((100000 * 2 / 3 | 0) / 2 | 0);
  G.s_lines[i].begin_y = 0;
  G.s_lines[i].end_y = GWIDTH - 1;
  G.s_lines[i].color = G.W_Grey;
  G.s_lines[i].flag = P(G, "hockey_s_lines");
  G.s_lines[i++].orientation = S_LINE_VERTICAL;
}

export function $init(): void {
}
