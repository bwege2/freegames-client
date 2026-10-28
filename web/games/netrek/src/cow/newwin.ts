// @ts-nocheck
// COW 3.3.3 newwin.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { getColorDefs } from './colors.ts';
import { updatedeath } from './death.ts';
import { booleanDefault, intDefault } from './defaults.ts';
import { fillhelp } from './helpwin.ts';
import { Key109 } from './input.ts';
import { run_clock } from './interface.ts';
import { lMeterHeight, lMeterWidth, redrawLMeter } from './lagmeter.ts';
import { fillmacro } from './macrowin.ts';
import { map } from './map.ts';
import { nsaction, nswindow } from './netstatopt.ts';
import { pStatsHeight, pStatsWidth, redrawPStats } from './pingstats.ts';
import { planetlist } from './planetlist.ts';
import { PlistMaxWidth, RedrawPlayerList, UpdatePlistFn } from './playerlist.ts';
import { ranklist } from './ranklist.ts';
import { redrawTstats } from './redraw.ts';
import { smessage } from './smessage.ts';
import { readFromServer, sendShortPacket, sendTeamReq } from './socket.ts';
import { sound_window_height, soundaction } from './sound.ts';
import { spaction, spwindow } from './spopt.ts';
import { redrawStats } from './stats.ts';
import { udpaction, udpwindow } from './udpopt.ts';
import { waraction } from './war.ts';
import { warning } from './warning.ts';
import { W_Beep, W_ClearArea, W_ClearWindow, W_DefineArrowCursor, W_DefineFedCursor, W_DefineKliCursor, W_DefineLocalcursor, W_DefineMapcursor, W_DefineOriCursor, W_DefineRomCursor, W_DefineTextCursor, W_DefineTrekCursor, W_DefineWarningCursor, W_EventsPending, W_EventsQueuedCk, W_Flush, W_FlushWindow, W_FullScreenBegin, W_FullScreenInitialise, W_GetPixmaps, W_Initialize, W_IsMapped, W_MakeLine, W_MakeMenu, W_MakeScrollingWindow, W_MakeTextWindow, W_MakeWindow, W_MapWindow, W_MaskText, W_NextEvent, W_SetIconWindow, W_SetWindowButtonHandler, W_SetWindowExposeHandler, W_SetWindowKeyDownHandler, W_Socket, W_StoreBitmap, W_TileWindow, W_UnTileWindow, W_UnmapWindow, W_WindowWidth, W_WriteBitmap, W_WriteText, checkMapped, checkMappedPref, pastebuffer } from './x11window.ts';
import { struct_event, struct_fd_set, struct_motd_line, struct_timeval } from './structs.ts';
import { $cast, $peq, $rd, $rows, $sadd, $shl64, $ta, $u64, $wr, G, P, R, S, cos, fork, fprintf, free, perror, random, select, sin, sprintf, strcmp, strdup, strlen, time } from '../rt/index.ts';
import { ASSAULT, ATT, BATTLESHIP, BORDER, CRUISER, DESTROYER, EBADF, EX_FRAMES, HULL_FRAMES, KGENOCIDE, KWINNER, MAXPLANETS, MAXPLAYER, MESSAGESIZE, MOTD_PAGE_SIZE, NETSTAT_NUMFIELDS, NOBODY, NUMTEAM, PALIVE, PFREE, PLISTSIZE, SBEXPVIEWS, SCOUT, SGALAXY, SHIELD_FRAMES, SPK_NUMFIELDS, STARBASE, STATSIZE, TOOLSWINLEN, TWINSIDE, UDP_NUMOPTS, VIEWS, WARBORDER, WARWIDTH, W_EV_BUTTON, YOFF, cloak_height, cloak_width, clock_height, clock_width, cloud_height, cloud_width, emph_planet_seq_frames, emph_planet_seq_height, emph_planet_seq_width, emph_player_seq_frames, emph_player_seq_height, emph_player_seq_width, emph_player_seql_frames, emph_player_seql_height, emph_player_seql_width, eplasmatorp_height, eplasmatorp_width, etorp_height, etorp_width, ex_height, ex_width, fed_assault_height, fed_assault_width, fed_battleship_height, fed_battleship_width, fed_destroyer_height, fed_destroyer_width, fed_galaxy_width, fed_scout_height, fed_scout_width, fed_starbase_height, fed_starbase_width, hull_height, hull_width, icon_height, icon_width, ind_assault_height, ind_assault_width, ind_battleship_height, ind_battleship_width, ind_cruiser_height, ind_cruiser_width, ind_destroyer_height, ind_destroyer_width, ind_galaxy_height, ind_galaxy_width, ind_scout_height, ind_scout_width, ind_starbase_height, ind_starbase_width, kli_assault_height, kli_assault_width, kli_battleship_height, kli_battleship_width, kli_destroyer_height, kli_destroyer_width, kli_galaxy_width, kli_scout_height, kli_scout_width, kli_starbase_height, kli_starbase_width, mplanet_height, mplanet_width, mplasmatorp_height, mplasmatorp_width, mtorp_height, mtorp_width, ori_assault_height, ori_assault_width, ori_battleship_height, ori_battleship_width, ori_destroyer_height, ori_destroyer_width, ori_galaxy_width, ori_scout_height, ori_scout_width, ori_starbase_height, ori_starbase_width, planet_height, planet_width, plasmacloud_height, plasmacloud_width, press_height, press_width, rom_assault_height, rom_assault_width, rom_battleship_height, rom_battleship_width, rom_destroyer_height, rom_destroyer_width, rom_galaxy_width, rom_scout_height, rom_scout_width, rom_starbase_height, rom_starbase_width, sbexp_height, sbexp_width, shield_height, shield_width, stipple_height, stipple_width, tract_height, tract_width } from './consts.ts';
const fed_cruiser_height = 20;
const fed_cruiser_width = 20;
const kli_cruiser_height = 20;
const kli_cruiser_width = 20;
const ori_cruiser_height = 20;
const ori_cruiser_width = 20;
const rom_cruiser_height = 20;
const rom_cruiser_width = 20;

let emph_planet_seq_bits: any;
let emph_player_seq_bits: any;
let emph_player_seql_bits: any;
let fed_scout_bits: any;
let kli_scout_bits: any;
let rom_scout_bits: any;
let ori_scout_bits: any;
let fed_cruiser_bits: any;
let kli_cruiser_bits: any;
let rom_cruiser_bits: any;
let ROMVLVS_bits: any;
let ori_cruiser_bits: any;
let fed_battleship_bits: any;
let kli_battleship_bits: any;
let rom_battleship_bits: any;
let ori_battleship_bits: any;
let fed_starbase_bits: any;
let kli_starbase_bits: any;
let rom_starbase_bits: any;
let ori_starbase_bits: any;
let rom_assault_bits: any;
let ori_assault_bits: any;
let kli_assault_bits: any;
let fed_assault_bits: any;
let kli_destroyer_bits: any;
let ori_destroyer_bits: any;
let fed_destroyer_bits: any;
let rom_destroyer_bits: any;
let sbexp_bits: any;
let fed_galaxy_bits: any;
let rom_galaxy_bits: any;
let kli_galaxy_bits: any;
let ori_galaxy_bits: any;
let ind_galaxy_bits: any;
let ind_scout_bits: any;
let ind_cruiser_bits: any;
let ind_battleship_bits: any;
let ind_starbase_bits: any;
let ind_assault_bits: any;
let ind_destroyer_bits: any;
let myplanet000_bits: any;
let myplanet001_bits: any;
let myplanet010_bits: any;
let myplanet011_bits: any;
let myplanet100_bits: any;
let myplanet101_bits: any;
let myplanet110_bits: any;
let myplanet111_bits: any;
let myindmplanet_bits: any;
let mymplanet011_bits: any;
let mymplanet010_bits: any;
let mymplanet001_bits: any;
let noinfo_bits: any;
let rmyplanet000_bits: any;
let rmyplanet001_bits: any;
let rmyplanet010_bits: any;
let rmyplanet011_bits: any;
let rmyplanet100_bits: any;
let rmyplanet101_bits: any;
let rmyplanet110_bits: any;
let rmyplanet111_bits: any;
let rmyindmplanet_bits: any;
let rmymplanet011_bits: any;
let rmymplanet010_bits: any;
let rmymplanet001_bits: any;
let tng_fed_scout_bits: any;
let tng_fed_cruiser_bits: any;
let tng_fed_battleship_bits: any;
let tng_fed_assault_bits: any;
let tng_fed_destroyer_bits: any;
let hull_bits: any;
let clock_bits: any;
let ex_bits: any;
let plasmacloud_bits: any;
let cloud_bits: any;
let etorp_bits: any;
let eplasmatorp_bits: any;
let mtorp_bits: any;
let mplasmatorp_bits: any;
let indplanet_bits: any;
let indmplanet_bits: any;
let planet_bits: any;
let fedplanet_bits: any;
let oriplanet_bits: any;
let kliplanet_bits: any;
let romplanet_bits: any;
let mplanet_bits: any;
let klimplanet_bits: any;
let rommplanet_bits: any;
let orimplanet_bits: any;
let fedmplanet_bits: any;
let mplanet111_bits: any;
let mplanet110_bits: any;
let mplanet101_bits: any;
let mplanet100_bits: any;
let mplanet011_bits: any;
let mplanet010_bits: any;
let mplanet001_bits: any;
let planet111_bits: any;
let planet110_bits: any;
let planet101_bits: any;
let planet100_bits: any;
let planet011_bits: any;
let planet010_bits: any;
let planet001_bits: any;
let shield_bits: any;
let cloak_bits: any;
let icon_bits: any;
let motd_offset: number;
let motd_lines: struct_motd_line | null;
let stipple_bits: any;
let tract_bits: any;
let press_bits: any;
let newwin_last_hostmon: Ptr | null;
let newwin_last_progname: Ptr | null;
let entrywindow$previous_team: number;
let entrywindow$previous_ship: number;
let showValues$msg: Ptr | null;
let newMotdLine$old: struct_motd_line | null;
let newMotdLine$statmode: number;
let redrawTeam$teams: any;

function handleMessageWindowKeyDown(event: struct_event | null): void {
  event = $cast(struct_event, event);
  smessage(event.key << 24 >> 24);
}

function handleMessageWindowButton(event: struct_event | null): void {
  event = $cast(struct_event, event);
  switch (event.key) {
  case 2:
    pastebuffer();
    break;
  case 1:
    if (G.messageon === 0) {
      Key109(event);
      if (G.messpend === 0) {
        smessage(65);
      }
    }
    return;
  }
}

export function newwin_fork(): number {
  let pid = 0;
  pid = fork();
  if (pid === 0) {
    newwin(newwin_last_hostmon, newwin_last_progname);
  }
  return pid;
}

export function newwinmeta(hostmon: Ptr | null, progname: Ptr | null): void {
  newwin_last_hostmon = hostmon;
  newwin_last_progname = progname;
  W_Initialize(hostmon);
  getResources(progname);
}

export function newwin(hostmon: Ptr | null, progname: Ptr | null): void {
  let need_width = 0;
  let need_height = 0;
  let main_width = 0;
  let main_height = 0;
  let ow = 0;
  need_width = TWINSIDE + (G.small_screen ? 400 : 500) + BORDER * 3;
  need_height = (G.small_screen ? 400 : 500) + 4 * BORDER + PLISTSIZE;
  if (G.small_screen) {
    need_width = need_width < 800 ? need_width : 800;
    need_height = need_height < 600 ? need_height : 600;
  }
  main_width = need_width > (G.small_screen ? 800 : 1024) ? need_width : G.small_screen ? 800 : 1024;
  main_height = need_height > (G.small_screen ? 600 : 768) ? need_height : G.small_screen ? 600 : 768;
  ow = (main_width - need_width) / 2 | 0;
  if (ow < 0) {
    ow = 0;
  }
  newwin_last_hostmon = hostmon;
  newwin_last_progname = progname;
  W_Initialize(hostmon);
  W_FullScreenInitialise();
  G.baseWin = W_MakeWindow(S("netrek"), 0, YOFF, main_width, main_height, null, BORDER, G.gColor);
  G.iconWin = W_MakeWindow(S("netrek_icon"), 0, 0, icon_width, icon_height, null, BORDER, G.gColor);
  W_SetWindowExposeHandler(G.iconWin, drawIcon);
  W_SetIconWindow(G.baseWin, G.iconWin);
  G.w = W_MakeWindow(S("local"), ow, 0, TWINSIDE, TWINSIDE, G.baseWin, BORDER, G.foreColor);
  G.mapw = W_MakeWindow(S("map"), TWINSIDE + BORDER + ow, 0, G.small_screen ? 400 : 500, G.small_screen ? 400 : 500, G.baseWin, BORDER, G.foreColor);
  W_GetPixmaps(G.w, G.mapw);
  G.tstatw = W_MakeWindow(S("tstat"), ow, TWINSIDE + BORDER, TWINSIDE, STATSIZE, G.baseWin, BORDER, G.foreColor);
  W_SetWindowExposeHandler(G.tstatw, redrawTstats);
  G.warnw = W_MakeWindow(S("warn"), ow + TWINSIDE + BORDER, (G.small_screen ? 400 : 500) + BORDER, G.small_screen ? 400 : 500, MESSAGESIZE, G.baseWin, BORDER, G.foreColor);
  W_SetWindowKeyDownHandler(G.warnw, handleMessageWindowKeyDown);
  G.messagew = W_MakeWindow(S("message"), ow + TWINSIDE + BORDER, (G.small_screen ? 400 : 500) + BORDER + MESSAGESIZE, G.small_screen ? 400 : 500, MESSAGESIZE, G.baseWin, BORDER, G.foreColor);
  W_SetWindowKeyDownHandler(G.messagew, handleMessageWindowKeyDown);
  W_SetWindowButtonHandler(G.messagew, handleMessageWindowButton);
  G.planetw = W_MakeTextWindow(S("planet"), 10, 10, 57, MAXPLANETS + 3, G.w, 2);
  W_SetWindowExposeHandler(G.planetw, planetlist);
  G.rankw = W_MakeTextWindow(S("rank"), 48, 300, 65, G.nranks + 9, G.w, 2);
  W_SetWindowExposeHandler(G.rankw, ranklist);
  if (G.small_screen) {
    G.playerw = W_MakeTextWindow(S("player"), ow + TWINSIDE + 4, YOFF + (G.small_screen ? 400 : 500) + 2 * BORDER + 2 * MESSAGESIZE, PlistMaxWidth(), 20, G.baseWin, 2);
  } else {
    G.playerw = W_MakeTextWindow(S("player"), ow, YOFF + TWINSIDE + BORDER + STATSIZE + BORDER, PlistMaxWidth(), MAXPLAYER + 3, G.baseWin, 2);
  }
  W_SetWindowExposeHandler(G.playerw, RedrawPlayerList);
  G.helpWin = W_MakeTextWindow(S("help"), 0, YOFF + TWINSIDE + 2 * BORDER + 2 * MESSAGESIZE, 160, 20, null, BORDER);
  W_SetWindowExposeHandler(G.helpWin, fillhelp);
  if (G.small_screen) {
    G.messwt = W_MakeScrollingWindow(S("review_team"), ow, YOFF + TWINSIDE + BORDER + STATSIZE, 80, 1, G.baseWin, 1);
    G.messwi = W_MakeScrollingWindow(S("review_your"), ow, YOFF + TWINSIDE + MESSAGESIZE + STATSIZE, 80, 1, G.baseWin, 1);
    G.messwa = W_MakeScrollingWindow(S("review_all"), ow, YOFF + TWINSIDE + 2 * MESSAGESIZE + STATSIZE, 80, 1, G.baseWin, 1);
    G.messwk = W_MakeScrollingWindow(S("review_kill"), ow, YOFF + TWINSIDE + 3 * MESSAGESIZE + STATSIZE, 35, 1, G.baseWin, 1);
    G.phaserwin = W_MakeScrollingWindow(S("review_phaser"), ow + 25 + 35 * G.W_Textwidth, YOFF + TWINSIDE + 3 * MESSAGESIZE + STATSIZE, 40, 1, G.baseWin, 1);
    G.reviewWin = W_MakeScrollingWindow(S("review"), ow, YOFF + TWINSIDE + BORDER + STATSIZE + 3, 80, 5, G.baseWin, BORDER);
  } else {
    G.messwa = W_MakeScrollingWindow(S("review_all"), ow + TWINSIDE + BORDER, YOFF + (G.small_screen ? 400 : 500) + 3 * BORDER + 2 * MESSAGESIZE, 80, 10, G.baseWin, BORDER);
    G.messwt = W_MakeScrollingWindow(S("review_team"), ow + TWINSIDE + BORDER, YOFF + (G.small_screen ? 400 : 500) + 4 * BORDER + 2 * MESSAGESIZE + 10 * G.W_Textheight + 8, 80, 5, G.baseWin, BORDER);
    G.messwi = W_MakeScrollingWindow(S("review_your"), ow + TWINSIDE + BORDER, YOFF + (G.small_screen ? 400 : 500) + 5 * BORDER + 2 * MESSAGESIZE + 15 * G.W_Textheight + 16, 80, 4, G.baseWin, BORDER);
    G.messwk = W_MakeScrollingWindow(S("review_kill"), ow + TWINSIDE + BORDER, YOFF + (G.small_screen ? 400 : 500) + 6 * BORDER + 2 * MESSAGESIZE + 19 * G.W_Textheight + 24, 80, 6, G.baseWin, BORDER);
    G.phaserwin = W_MakeScrollingWindow(S("review_phaser"), ow + TWINSIDE + BORDER, YOFF + (G.small_screen ? 400 : 500) + 3 * BORDER + 2 * MESSAGESIZE + 15 * G.W_Textheight + 16, 80, 4, G.baseWin, BORDER);
    G.reviewWin = W_MakeScrollingWindow(S("review"), ow + TWINSIDE + BORDER + 1, YOFF + (G.small_screen ? 400 : 500) + BORDER + STATSIZE, 81, 21, G.baseWin, BORDER - 1);
  }
  W_SetWindowKeyDownHandler(G.messwa, handleMessageWindowKeyDown);
  W_SetWindowKeyDownHandler(G.messwt, handleMessageWindowKeyDown);
  W_SetWindowKeyDownHandler(G.messwi, handleMessageWindowKeyDown);
  W_SetWindowKeyDownHandler(G.reviewWin, handleMessageWindowKeyDown);
  G.netstatWin = W_MakeMenu(S("netstat"), TWINSIDE + 10, -BORDER + 10, 40, NETSTAT_NUMFIELDS, null, BORDER);
  W_SetWindowKeyDownHandler(G.netstatWin, nsaction);
  W_SetWindowButtonHandler(G.netstatWin, nsaction);
  G.lMeter = W_MakeWindow(S("lagMeter"), 800, 4, lMeterWidth(), lMeterHeight(), null, BORDER, G.foreColor);
  W_SetWindowExposeHandler(G.lMeter, redrawLMeter);
  G.pStats = W_MakeWindow(S("pingStats"), 500, 4, pStatsWidth(), pStatsHeight(), null, 1, G.foreColor);
  W_SetWindowExposeHandler(G.pStats, redrawPStats);
  G.udpWin = W_MakeMenu(S("UDP"), TWINSIDE + 10, -BORDER + 10, 40, UDP_NUMOPTS, null, 2);
  W_SetWindowButtonHandler(G.udpWin, udpaction);
  G.spWin = W_MakeMenu(S("network"), TWINSIDE + 10, -BORDER + 10, 40, SPK_NUMFIELDS, null, 2);
  W_SetWindowKeyDownHandler(G.spWin, spaction);
  W_SetWindowButtonHandler(G.spWin, spaction);
  G.soundWin = W_MakeMenu(S("sound"), TWINSIDE + 20, -BORDER + 10, 30, sound_window_height(), null, 2);
  W_SetWindowKeyDownHandler(G.soundWin, soundaction);
  W_SetWindowButtonHandler(G.soundWin, soundaction);
  W_DefineArrowCursor(G.soundWin);
  G.toolsWin = W_MakeScrollingWindow(S("tools"), TWINSIDE + BORDER, BORDER, 80, TOOLSWINLEN, null, BORDER);
  W_DefineTrekCursor(G.toolsWin);
  G.defWin = W_MakeTextWindow(S("xtrekrc_help"), 1, 100, 174, 41, null, BORDER);
  G.docwin = W_MakeWindow(S("DocWin"), 0, 181, 500, 500, null, 2, G.foreColor);
  G.xtrekrcwin = W_MakeWindow(S("xtrekrcWin"), 0, 200, 500, 500, null, 2, G.foreColor);
  G.teamWin[0] = W_MakeWindow(G.teamshort[1 << 0], -1, 400, 500 / 5 | 0, 500 / 5 | 0, G.w, 1, G.foreColor);
  G.teamWin[1] = W_MakeWindow(G.teamshort[1 << 1], -1, -1, 500 / 5 | 0, 500 / 5 | 0, G.w, 1, G.foreColor);
  G.teamWin[2] = W_MakeWindow(G.teamshort[1 << 2], 400, -1, 500 / 5 | 0, 500 / 5 | 0, G.w, 1, G.foreColor);
  G.teamWin[3] = W_MakeWindow(G.teamshort[1 << 3], 400, 400, 500 / 5 | 0, 500 / 5 | 0, G.w, 1, G.foreColor);
  G.qwin = W_MakeWindow(S("quit"), 200, 400, 500 / 5 | 0, 500 / 5 | 0, G.w, 1, G.foreColor);
  G.statwin = W_MakeWindow(S("stats"), 422, 13, 160, 110, null, 5, G.foreColor);
  W_SetWindowExposeHandler(G.statwin, redrawStats);
  W_DefineArrowCursor(G.netstatWin);
  W_DefineArrowCursor(G.lMeter);
  W_DefineTrekCursor(G.baseWin);
  W_DefineLocalcursor(G.w);
  W_DefineMapcursor(G.mapw);
  W_DefineTrekCursor(G.pStats);
  W_DefineTextCursor(G.warnw);
  W_DefineTrekCursor(G.messwt);
  W_DefineTrekCursor(G.messwi);
  W_DefineTrekCursor(G.helpWin);
  W_DefineTrekCursor(G.reviewWin);
  W_DefineTrekCursor(G.messwk);
  W_DefineTrekCursor(G.phaserwin);
  W_DefineTrekCursor(G.playerw);
  W_DefineTrekCursor(G.rankw);
  W_DefineTrekCursor(G.statwin);
  W_DefineTrekCursor(G.iconWin);
  W_DefineTextCursor(G.messagew);
  W_DefineTrekCursor(G.tstatw);
  W_DefineWarningCursor(G.qwin);
  W_DefineArrowCursor(G.udpWin);
  W_DefineArrowCursor(G.spWin);
  W_DefineFedCursor(G.teamWin[0]);
  W_DefineRomCursor(G.teamWin[1]);
  W_DefineKliCursor(G.teamWin[2]);
  W_DefineOriCursor(G.teamWin[3]);
  G.war = W_MakeMenu(S("war"), ow + TWINSIDE + 10, -BORDER + 10, WARWIDTH, 6, G.baseWin, WARBORDER);
  W_SetWindowButtonHandler(G.war, waraction);
  W_DefineArrowCursor(G.war);
  getResources(progname);
  savebitmaps();
}

export function mapAll(): void {
  W_MapWindow(G.mapw);
  W_MapWindow(G.tstatw);
  W_MapWindow(G.warnw);
  if (booleanDefault(S("message.mapped"), 1)) {
    W_MapWindow(G.messagew);
  }
  W_MapWindow(G.w);
  W_MapWindow(G.baseWin);
  W_FullScreenBegin(G.baseWin);
  if (checkMapped(S("planet"))) {
    W_MapWindow(G.planetw);
  }
  if (checkMapped(S("rank"))) {
    W_MapWindow(G.rankw);
  }
  if (checkMapped(S("help"))) {
    W_MapWindow(G.helpWin);
  }
  if (checkMapped(S("review_all")) && !G.identityBlind) {
    W_MapWindow(G.messwa);
  }
  if (checkMapped(S("review_team")) && !G.identityBlind) {
    W_MapWindow(G.messwt);
  }
  if (checkMapped(S("review_your")) && !G.identityBlind) {
    W_MapWindow(G.messwi);
  }
  if (checkMapped(S("review_kill")) && !G.identityBlind) {
    W_MapWindow(G.messwk);
  }
  if (checkMapped(S("netstat"))) {
    nswindow();
  }
  if (checkMapped(S("lagMeter"))) {
    W_MapWindow(G.lMeter);
  }
  if (checkMapped(S("pingStats"))) {
    W_MapWindow(G.pStats);
  }
  if (checkMapped(S("review_phaser"))) {
    W_MapWindow(G.phaserwin);
    G.phaserWindow = 1;
  }
  if (checkMappedPref(S("player"), 1)) {
    W_MapWindow(G.playerw);
  }
  if (checkMappedPref(S("review"), 1) && !G.identityBlind) {
    W_MapWindow(G.reviewWin);
  }
  if (checkMapped(S("UDP"))) {
    udpwindow();
  }
  if (checkMapped(S("network"))) {
    spwindow();
  }
}

function savebitmaps(): void {
  let i = 0;
  for (i = 0; i < VIEWS; ++i) {
    G.tng_fed_bitmaps[SCOUT][i] = W_StoreBitmap(fed_scout_width, fed_scout_height, P(tng_fed_scout_bits[i]), G.w);
    G.tng_fed_bitmaps[DESTROYER][i] = W_StoreBitmap(fed_destroyer_width, fed_destroyer_height, P(tng_fed_destroyer_bits[i]), G.w);
    G.tng_fed_bitmaps[CRUISER][i] = W_StoreBitmap(fed_cruiser_width, fed_cruiser_height, P(tng_fed_cruiser_bits[i]), G.w);
    G.tng_fed_bitmaps[BATTLESHIP][i] = W_StoreBitmap(fed_battleship_width, fed_battleship_height, P(tng_fed_battleship_bits[i]), G.w);
    G.tng_fed_bitmaps[ASSAULT][i] = W_StoreBitmap(fed_assault_width, fed_assault_height, P(tng_fed_assault_bits[i]), G.w);
    G.tng_fed_bitmaps[STARBASE][i] = W_StoreBitmap(fed_starbase_width, fed_starbase_height, P(fed_starbase_bits[i]), G.w);
    G.tng_fed_bitmaps[SGALAXY][i] = W_StoreBitmap(fed_galaxy_width, fed_galaxy_width, P(fed_galaxy_bits[i]), G.w);
    G.tng_fed_bitmaps[ATT][i] = W_StoreBitmap(fed_cruiser_width, fed_cruiser_height, P(fed_cruiser_bits[i]), G.w);
    G.ROMVLVS_bitmap[i] = W_StoreBitmap(rom_cruiser_width, rom_cruiser_height, P(ROMVLVS_bits[i]), G.w);
    G.fed_bitmaps[SCOUT][i] = W_StoreBitmap(fed_scout_width, fed_scout_height, P(fed_scout_bits[i]), G.w);
    G.fed_bitmaps[DESTROYER][i] = W_StoreBitmap(fed_destroyer_width, fed_destroyer_height, P(fed_destroyer_bits[i]), G.w);
    G.fed_bitmaps[CRUISER][i] = W_StoreBitmap(fed_cruiser_width, fed_cruiser_height, P(fed_cruiser_bits[i]), G.w);
    G.fed_bitmaps[BATTLESHIP][i] = W_StoreBitmap(fed_battleship_width, fed_battleship_height, P(fed_battleship_bits[i]), G.w);
    G.fed_bitmaps[ASSAULT][i] = W_StoreBitmap(fed_assault_width, fed_assault_height, P(fed_assault_bits[i]), G.w);
    G.fed_bitmaps[STARBASE][i] = W_StoreBitmap(fed_starbase_width, fed_starbase_height, P(fed_starbase_bits[i]), G.w);
    G.fed_bitmaps[SGALAXY][i] = W_StoreBitmap(fed_galaxy_width, fed_galaxy_width, P(fed_galaxy_bits[i]), G.w);
    G.fed_bitmaps[ATT][i] = W_StoreBitmap(fed_cruiser_width, fed_cruiser_height, P(fed_cruiser_bits[i]), G.w);
    G.kli_bitmaps[SCOUT][i] = W_StoreBitmap(kli_scout_width, kli_scout_height, P(kli_scout_bits[i]), G.w);
    G.kli_bitmaps[DESTROYER][i] = W_StoreBitmap(kli_destroyer_width, kli_destroyer_height, P(kli_destroyer_bits[i]), G.w);
    G.kli_bitmaps[CRUISER][i] = W_StoreBitmap(kli_cruiser_width, kli_cruiser_height, P(kli_cruiser_bits[i]), G.w);
    G.kli_bitmaps[BATTLESHIP][i] = W_StoreBitmap(kli_battleship_width, kli_battleship_height, P(kli_battleship_bits[i]), G.w);
    G.kli_bitmaps[ASSAULT][i] = W_StoreBitmap(kli_assault_width, kli_assault_height, P(kli_assault_bits[i]), G.w);
    G.kli_bitmaps[STARBASE][i] = W_StoreBitmap(kli_starbase_width, kli_starbase_height, P(kli_starbase_bits[i]), G.w);
    G.kli_bitmaps[SGALAXY][i] = W_StoreBitmap(kli_galaxy_width, kli_galaxy_width, P(kli_galaxy_bits[i]), G.w);
    G.kli_bitmaps[ATT][i] = W_StoreBitmap(kli_cruiser_width, kli_cruiser_height, P(kli_cruiser_bits[i]), G.w);
    G.rom_bitmaps[SCOUT][i] = W_StoreBitmap(rom_scout_width, rom_scout_height, P(rom_scout_bits[i]), G.w);
    G.rom_bitmaps[DESTROYER][i] = W_StoreBitmap(rom_destroyer_width, rom_destroyer_height, P(rom_destroyer_bits[i]), G.w);
    G.rom_bitmaps[CRUISER][i] = W_StoreBitmap(rom_cruiser_width, rom_cruiser_height, P(rom_cruiser_bits[i]), G.w);
    G.rom_bitmaps[BATTLESHIP][i] = W_StoreBitmap(rom_battleship_width, rom_battleship_height, P(rom_battleship_bits[i]), G.w);
    G.rom_bitmaps[ASSAULT][i] = W_StoreBitmap(rom_assault_width, rom_assault_height, P(rom_assault_bits[i]), G.w);
    G.rom_bitmaps[STARBASE][i] = W_StoreBitmap(rom_starbase_width, rom_starbase_height, P(rom_starbase_bits[i]), G.w);
    G.rom_bitmaps[SGALAXY][i] = W_StoreBitmap(rom_galaxy_width, rom_galaxy_width, P(rom_galaxy_bits[i]), G.w);
    G.rom_bitmaps[ATT][i] = W_StoreBitmap(rom_cruiser_width, rom_cruiser_height, P(rom_cruiser_bits[i]), G.w);
    G.ori_bitmaps[SCOUT][i] = W_StoreBitmap(ori_scout_width, ori_scout_height, P(ori_scout_bits[i]), G.w);
    G.ori_bitmaps[DESTROYER][i] = W_StoreBitmap(ori_destroyer_width, ori_destroyer_height, P(ori_destroyer_bits[i]), G.w);
    G.ori_bitmaps[CRUISER][i] = W_StoreBitmap(ori_cruiser_width, ori_cruiser_height, P(ori_cruiser_bits[i]), G.w);
    G.ori_bitmaps[BATTLESHIP][i] = W_StoreBitmap(ori_battleship_width, ori_battleship_height, P(ori_battleship_bits[i]), G.w);
    G.ori_bitmaps[ASSAULT][i] = W_StoreBitmap(ori_assault_width, ori_assault_height, P(ori_assault_bits[i]), G.w);
    G.ori_bitmaps[STARBASE][i] = W_StoreBitmap(ori_starbase_width, ori_starbase_height, P(ori_starbase_bits[i]), G.w);
    G.ori_bitmaps[SGALAXY][i] = W_StoreBitmap(ori_galaxy_width, ori_galaxy_width, P(ori_galaxy_bits[i]), G.w);
    G.ori_bitmaps[ATT][i] = W_StoreBitmap(ori_cruiser_width, ori_cruiser_height, P(ori_cruiser_bits[i]), G.w);
    G.ind_bitmaps[SCOUT][i] = W_StoreBitmap(ind_scout_width, ind_scout_height, P(ind_scout_bits[i]), G.w);
    G.ind_bitmaps[DESTROYER][i] = W_StoreBitmap(ind_destroyer_width, ind_destroyer_height, P(ind_destroyer_bits[i]), G.w);
    G.ind_bitmaps[CRUISER][i] = W_StoreBitmap(ind_cruiser_width, ind_cruiser_height, P(ind_cruiser_bits[i]), G.w);
    G.ind_bitmaps[BATTLESHIP][i] = W_StoreBitmap(ind_battleship_width, ind_battleship_height, P(ind_battleship_bits[i]), G.w);
    G.ind_bitmaps[ASSAULT][i] = W_StoreBitmap(ind_assault_width, ind_assault_height, P(ind_assault_bits[i]), G.w);
    G.ind_bitmaps[STARBASE][i] = W_StoreBitmap(ind_starbase_width, ind_starbase_height, P(ind_starbase_bits[i]), G.w);
    G.ind_bitmaps[SGALAXY][i] = W_StoreBitmap(ind_galaxy_width, ind_galaxy_height, P(ind_galaxy_bits[i]), G.w);
    G.ind_bitmaps[ATT][i] = W_StoreBitmap(ind_cruiser_width, ind_cruiser_height, P(ind_cruiser_bits[i]), G.w);
  }
  G.noinfoplanet = W_StoreBitmap(planet_width, planet_height, P(noinfo_bits), G.w);
  G.clockpic = W_StoreBitmap(clock_width, clock_height, P(clock_bits), G.qwin);
  for (i = 0; i < emph_player_seq_frames; ++i) {
    G.emph_player_seq[emph_player_seq_frames - (i + 1)] = W_StoreBitmap(emph_player_seq_width, emph_player_seq_height, P(emph_player_seq_bits[i]), G.mapw);
  }
  for (i = 0; i < emph_player_seql_frames; ++i) {
    G.emph_player_seql[emph_player_seql_frames - (i + 1)] = W_StoreBitmap(emph_player_seql_width, emph_player_seql_height, P(emph_player_seql_bits[i]), G.w);
  }
  for (i = 0; i < emph_planet_seq_frames; ++i) {
    G.emph_planet_seq[emph_planet_seq_frames - (i + 1)] = W_StoreBitmap(emph_planet_seq_width, emph_planet_seq_height, P(emph_planet_seq_bits[i]), G.mapw);
  }
  for (i = 0; i < 5; ++i) {
    G.cloud[i] = W_StoreBitmap(cloud_width, cloud_height, P(cloud_bits[4 - i]), G.w);
    G.plasmacloud[i] = W_StoreBitmap(plasmacloud_width, plasmacloud_height, P(plasmacloud_bits[4 - i]), G.w);
  }
  G.etorp = W_StoreBitmap(etorp_width, etorp_height, P(etorp_bits), G.w);
  G.mtorp = W_StoreBitmap(mtorp_width, mtorp_height, P(mtorp_bits), G.w);
  G.eplasmatorp = W_StoreBitmap(eplasmatorp_width, eplasmatorp_height, P(eplasmatorp_bits), G.w);
  G.mplasmatorp = W_StoreBitmap(mplasmatorp_width, mplasmatorp_height, P(mplasmatorp_bits), G.w);
  G.bplanets[0] = W_StoreBitmap(planet_width, planet_height, P(indplanet_bits), G.w);
  G.bplanets[1] = W_StoreBitmap(planet_width, planet_height, P(fedplanet_bits), G.w);
  G.bplanets[2] = W_StoreBitmap(planet_width, planet_height, P(romplanet_bits), G.w);
  G.bplanets[3] = W_StoreBitmap(planet_width, planet_height, P(kliplanet_bits), G.w);
  G.bplanets[4] = W_StoreBitmap(planet_width, planet_height, P(oriplanet_bits), G.w);
  G.bplanets[5] = W_StoreBitmap(planet_width, planet_height, P(planet_bits), G.w);
  G.bplanets[6] = W_StoreBitmap(planet_width, planet_height, P(myplanet000_bits), G.w);
  G.mbplanets[0] = W_StoreBitmap(mplanet_width, mplanet_height, P(indmplanet_bits), G.mapw);
  G.mbplanets[1] = W_StoreBitmap(mplanet_width, mplanet_height, P(fedmplanet_bits), G.mapw);
  G.mbplanets[2] = W_StoreBitmap(mplanet_width, mplanet_height, P(rommplanet_bits), G.mapw);
  G.mbplanets[3] = W_StoreBitmap(mplanet_width, mplanet_height, P(klimplanet_bits), G.mapw);
  G.mbplanets[4] = W_StoreBitmap(mplanet_width, mplanet_height, P(orimplanet_bits), G.mapw);
  G.mbplanets[5] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet_bits), G.mapw);
  G.bplanets2[0] = G.bplanets[0];
  G.mbplanets2[0] = G.mbplanets[0];
  G.bplanets2[1] = W_StoreBitmap(planet_width, planet_height, P(planet001_bits), G.w);
  G.bplanets2[2] = W_StoreBitmap(planet_width, planet_height, P(planet010_bits), G.w);
  G.bplanets2[3] = W_StoreBitmap(planet_width, planet_height, P(planet011_bits), G.w);
  G.bplanets2[4] = W_StoreBitmap(planet_width, planet_height, P(planet100_bits), G.w);
  G.bplanets2[5] = W_StoreBitmap(planet_width, planet_height, P(planet101_bits), G.w);
  G.bplanets2[6] = W_StoreBitmap(planet_width, planet_height, P(planet110_bits), G.w);
  G.bplanets2[7] = W_StoreBitmap(planet_width, planet_height, P(planet111_bits), G.w);
  G.mbplanets2[1] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet001_bits), G.mapw);
  G.mbplanets2[2] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet010_bits), G.mapw);
  G.mbplanets2[3] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet011_bits), G.mapw);
  G.mbplanets2[4] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet100_bits), G.mapw);
  G.mbplanets2[5] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet101_bits), G.mapw);
  G.mbplanets2[6] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet110_bits), G.mapw);
  G.mbplanets2[7] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet111_bits), G.mapw);
  G.bplanets3[0] = W_StoreBitmap(planet_width, planet_height, P(myplanet000_bits), G.w);
  G.bplanets3[1] = W_StoreBitmap(planet_width, planet_height, P(myplanet001_bits), G.w);
  G.bplanets3[2] = W_StoreBitmap(planet_width, planet_height, P(myplanet010_bits), G.w);
  G.bplanets3[3] = W_StoreBitmap(planet_width, planet_height, P(myplanet011_bits), G.w);
  G.bplanets3[4] = W_StoreBitmap(planet_width, planet_height, P(myplanet100_bits), G.w);
  G.bplanets3[5] = W_StoreBitmap(planet_width, planet_height, P(myplanet101_bits), G.w);
  G.bplanets3[6] = W_StoreBitmap(planet_width, planet_height, P(myplanet110_bits), G.w);
  G.bplanets3[7] = W_StoreBitmap(planet_width, planet_height, P(myplanet111_bits), G.w);
  G.mbplanets3[0] = W_StoreBitmap(mplanet_width, mplanet_height, P(myindmplanet_bits), G.mapw);
  G.mbplanets3[1] = W_StoreBitmap(mplanet_width, mplanet_height, P(mymplanet001_bits), G.mapw);
  G.mbplanets3[2] = W_StoreBitmap(mplanet_width, mplanet_height, P(mymplanet010_bits), G.mapw);
  G.mbplanets3[3] = W_StoreBitmap(mplanet_width, mplanet_height, P(mymplanet011_bits), G.mapw);
  G.mbplanets3[4] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet100_bits), G.mapw);
  G.mbplanets3[5] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet101_bits), G.mapw);
  G.mbplanets3[6] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet110_bits), G.mapw);
  G.mbplanets3[7] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet111_bits), G.mapw);
  G.bplanets4[0] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet000_bits), G.w);
  G.bplanets4[1] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet001_bits), G.w);
  G.bplanets4[2] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet010_bits), G.w);
  G.bplanets4[3] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet011_bits), G.w);
  G.bplanets4[4] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet100_bits), G.w);
  G.bplanets4[5] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet101_bits), G.w);
  G.bplanets4[6] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet110_bits), G.w);
  G.bplanets4[7] = W_StoreBitmap(planet_width, planet_height, P(rmyplanet111_bits), G.w);
  G.mbplanets4[0] = W_StoreBitmap(mplanet_width, mplanet_height, P(rmyindmplanet_bits), G.mapw);
  G.mbplanets4[1] = W_StoreBitmap(mplanet_width, mplanet_height, P(rmymplanet001_bits), G.mapw);
  G.mbplanets4[2] = W_StoreBitmap(mplanet_width, mplanet_height, P(rmymplanet010_bits), G.mapw);
  G.mbplanets4[3] = W_StoreBitmap(mplanet_width, mplanet_height, P(rmymplanet011_bits), G.mapw);
  G.mbplanets4[4] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet100_bits), G.mapw);
  G.mbplanets4[5] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet101_bits), G.mapw);
  G.mbplanets4[6] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet110_bits), G.mapw);
  G.mbplanets4[7] = W_StoreBitmap(mplanet_width, mplanet_height, P(mplanet111_bits), G.mapw);
  for (i = 0; i < EX_FRAMES; ++i) {
    G.expview[i] = W_StoreBitmap(ex_width, ex_height, P(ex_bits[i]), G.w);
  }
  for (i = 0; i < SBEXPVIEWS; ++i) {
    G.sbexpview[i] = W_StoreBitmap(sbexp_width, sbexp_height, P(sbexp_bits[i]), G.w);
  }
  for (i = 0; i < SHIELD_FRAMES; ++i) {
    G.shield[i] = W_StoreBitmap(shield_width, shield_height, P(shield_bits[i]), G.w);
  }
  for (i = 0; i < HULL_FRAMES; ++i) {
    G.hull[i] = W_StoreBitmap(hull_width, hull_height, P(hull_bits[i]), G.w);
  }
  G.cloakicon = W_StoreBitmap(cloak_width, cloak_height, P(cloak_bits), G.w);
  G.icon = W_StoreBitmap(icon_width, icon_height, P(icon_bits), G.iconWin);
  G.tractbits = W_StoreBitmap(tract_width, tract_height, P(tract_bits), G.w);
  G.pressbits = W_StoreBitmap(press_width, press_height, P(press_bits), G.w);
}

function numShips(owner: number): number {
  let i = 0;
  let num = 0;
  let p = null;
  for (i = 0, p = G.players; i < MAXPLAYER; ++i, p = $sadd(p, 1)) {
    if (p.p_status === PALIVE && p.p_team === owner) {
      ++num;
    }
  }
  return num;
}

function realNumShips(owner: number): number {
  let i = 0;
  let num = 0;
  let p = null;
  for (i = 0, p = G.players; i < MAXPLAYER; ++i, p = $sadd(p, 1)) {
    if (p.p_status !== PFREE && p.p_team === owner) {
      ++num;
    }
  }
  return num;
}

function mercenary(team: Ptr | null, ship: Ptr | null): void {
  let i = 0;
  let count = new Int32Array(4);
  let large = new Int32Array(2);
  for (i = 0; i < NUMTEAM; ++i) {
    count[i] = 0;
  }
  for (i = 0; i < NUMTEAM; ++i) {
    count[i] = realNumShips(1 << i);
    if (count[i] > count[large[0]]) {
      large[1] = large[0];
      large[0] = i;
    } else if (count[i] > count[large[1]] || large[0] === large[1]) {
      large[1] = i;
    }
  }
  if (count[large[0]] === 0) {
    team.a[team.o] = random() % 4 | 0;
    ship.a[ship.o] = CRUISER;
    return;
  }
  team.a[team.o] = large[1];
  ship.a[ship.o] = CRUISER;
}

function show_team_windows(): void {
  let i = 0;
  for (i = 0; i < NUMTEAM; ++i) {
    W_MapWindow(G.teamWin[i]);
  }
}

function hide_team_windows(): void {
  let i = 0;
  for (i = 0; i < NUMTEAM; ++i) {
    W_UnmapWindow(G.teamWin[i]);
  }
  W_Flush();
}

function show_quit_window(): void {
  W_MapWindow(G.qwin);
}

function hide_quit_window(): void {
  W_UnmapWindow(G.qwin);
}

export async function entrywindow(team: Ptr | null, s_type: Ptr | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let chosen_ship_ok = 0;
  let i = 0;
  let startTime = 0;
  let event = new struct_event();
  let lastplayercount = new Int32Array(4);
  let okayMask = 0;
  let lastOkayMask = 0;
  let resetting = 0;
  const chosen_team = new Int32Array(1);
  chosen_team[0] = -1;
  const chosen_ship = new Int32Array(1);
  chosen_ship[0] = -1;
  let request_sent = 0;
  let request_time = 0;
  let quittime = 120;
  let lasttime = -1;
  let elapsed = 0;
  team.a[team.o] = -1;
  if (G.fastQuit) {
    return;
  }
  chosen_ship[0] = s_type.a[s_type.o];
  lastOkayMask = okayMask = G.tournMask;
  for (i = 0; i < NUMTEAM; ++i) {
    if (okayMask & 1 << i) {
      W_UnTileWindow(G.teamWin[i]);
    } else {
      W_TileWindow(G.teamWin[i], G.stipple);
    }
    lastplayercount[i] = -1;
  }
  show_quit_window();
  show_team_windows();
  team.a[team.o] = -1;
  startTime = time(null);
  if (G.me.p_whydead !== KWINNER && G.me.p_whydead !== KGENOCIDE) {
    showMotd(G.w, motd_offset);
  }
  run_clock(startTime);
  updatedeath();
  if (G.remap[G.me.p_team] === NOBODY) {
    RedrawPlayerList(null);
  } else if (G.plistUpdated) {
    UpdatePlistFn();
  }
  quittime = intDefault(S("autoquit"), quittime | 0);
  if (G.fastGuest) {
    if (entrywindow$previous_team === -1 && entrywindow$previous_ship === -1) {
      mercenary(P(chosen_team, 0), P(chosen_ship, 0));
    }
  }
  G.pickOk = -1;
  while (1) {
    while (!await W_EventsPending()) {
      let rfds = new struct_fd_set();
      let tv = new struct_timeval();
      let retval = 0;
      if (request_sent === 0 && chosen_team[0] !== -1 && chosen_ship[0] !== -1) {
        if (G.serverDead) {
          return;
        }
        sendTeamReq(chosen_team[0], chosen_ship[0]);
        ++request_sent;
        request_time = time(null);
        hide_team_windows();
      }
      if (request_sent > 0 && time(null) - request_time > 3) {
        sendTeamReq(chosen_team[0], chosen_ship[0]);
        warning(S("Odd, server has not replied, sending it again ..."));
        ++request_sent;
        request_time = time(null);
      }
      tv.tv_sec = 1;
      tv.tv_usec = 0;
      do {
        let __i = 0;
        let __arr = rfds;
        for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
          __arr.__fds_bits[__i] = 0;
        }
      } while (0);
      ($t1 = rfds.__fds_bits, $t2 = W_Socket() / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, W_Socket() % (8 * 8)));
      if (!G.serverDead) {
        ($t3 = rfds.__fds_bits, $t4 = G.sock / (8 * 8) | 0, $t3[$t4] = $t3[$t4] | $shl64(1, G.sock % (8 * 8)));
        if (G.udpSock >= 0) {
          ($t5 = rfds.__fds_bits, $t6 = G.udpSock / (8 * 8) | 0, $t5[$t6] = $t5[$t6] | $shl64(1, G.udpSock % (8 * 8)));
        }
      }
      retval = await select(32, rfds, null, null, tv);
      if (retval < 0) {
        if ($rd(P(R, "errno")) === EBADF) {
          return;
        }
        perror(S("select"));
      }
      if ((rfds.__fds_bits[W_Socket() / (8 * 8) | 0] & $shl64(1, W_Socket() % (8 * 8))) !== 0) {
        W_EventsQueuedCk();
      }
      if ((rfds.__fds_bits[G.sock / (8 * 8) | 0] & $shl64(1, G.sock % (8 * 8))) !== 0 || G.udpSock >= 0 && (rfds.__fds_bits[G.udpSock / (8 * 8) | 0] & $shl64(1, G.udpSock % (8 * 8))) !== 0) {
        await readFromServer(rfds);
        if (G.serverDead) {
          fprintf(R.stderr, S("server connection lost, during team or ship selection\n"));
          warning(S("Lost connection to server, your only option is to quit and try again."));
          hide_team_windows();
        }
        switch (G.pickOk) {
        case -1:
          break;
        case 0:
          show_team_windows();
          chosen_team[0] = -1;
          request_sent = 0;
          G.pickOk = -1;
          break;
        case 1:
          hide_quit_window();
          entrywindow$previous_team = chosen_team[0];
          entrywindow$previous_ship = chosen_ship[0];
          team.a[team.o] = chosen_team[0];
          s_type.a[s_type.o] = chosen_ship[0];
          return;
        }
      }
      elapsed = time(null) - startTime;
      if (elapsed > quittime) {
        hide_quit_window();
        hide_team_windows();
        return;
      }
      map();
      if (lasttime !== time(null)) {
        run_clock(lasttime);
        updatedeath();
        if (W_IsMapped(G.playerw)) {
          if (G.plistUpdated) {
            UpdatePlistFn();
          }
        }
        showTimeLeft(elapsed, quittime);
        lasttime = time(null);
      }
      okayMask = G.tournMask;
      for (i = 0; i < NUMTEAM; ++i) {
        if ((okayMask ^ lastOkayMask) & 1 << i) {
          if (okayMask & 1 << i) {
            W_UnTileWindow(G.teamWin[i]);
          } else {
            W_TileWindow(G.teamWin[i], G.stipple);
          }
          lastplayercount[i] = -1;
        }
        redrawTeam(G.teamWin[i], i, P(lastplayercount, i));
      }
      lastOkayMask = okayMask;
    }
    await W_NextEvent(event);
    switch (event.type) {
    case 2:
      chosen_ship_ok = 1;
      switch (event.key) {
      case 113:
        hide_quit_window();
        hide_team_windows();
        return;
      case 32:
      case 13:
        chosen_ship_ok = 0;
        if (entrywindow$previous_team !== -1 && entrywindow$previous_ship !== -1) {
          chosen_team[0] = entrywindow$previous_team;
          chosen_ship[0] = entrywindow$previous_ship;
        } else {
          mercenary(P(chosen_team, 0), P(chosen_ship, 0));
        }
        break;
      case 115:
        chosen_ship[0] = SCOUT;
        break;
      case 100:
        chosen_ship[0] = DESTROYER;
        break;
      case 99:
        chosen_ship[0] = CRUISER;
        break;
      case 98:
        chosen_ship[0] = BATTLESHIP;
        break;
      case 103:
        chosen_ship[0] = SGALAXY;
        break;
      case 88:
        chosen_ship[0] = ATT;
        break;
      case 97:
        chosen_ship[0] = ASSAULT;
        break;
      case 111:
        chosen_ship[0] = STARBASE;
        break;
      default:
        chosen_ship_ok = 0;
        break;
      }
      if (chosen_ship_ok) {
        for (i = 0; i < NUMTEAM; ++i) {
          if ($peq(event.Window, G.teamWin[i])) {
            chosen_team[0] = i;
          }
        }
        if (chosen_team[0] === -1) {
          warning(S("Ship type chosen, now select a team."));
        }
        break;
      }
      if ($peq(event.Window, G.w)) {
        switch (event.key) {
        case 82:
          warning(S("Please confirm reset request. (y/n)"));
          resetting = 1;
          break;
        case 121:
          if (resetting) {
            sendShortPacket(32, 89);
            warning(S("OK, your reset request has been sent to the server."));
            resetting = 0;
          }
          break;
        case 110:
          if (resetting) {
            warning(S("Yeah, WHATever."));
            resetting = 0;
          }
          break;
        case 102:
          motd_offset = motd_offset + MOTD_PAGE_SIZE;
          if (motd_offset > G.motd_last) {
            motd_offset = motd_offset - MOTD_PAGE_SIZE;
            break;
          }
          W_ClearWindow(G.w);
          showMotd(G.w, motd_offset);
          break;
        case 98:
          if (motd_offset === 0) {
            break;
          }
          motd_offset = motd_offset - MOTD_PAGE_SIZE;
          if (motd_offset < 0) {
            motd_offset = 0;
          }
          W_ClearWindow(G.w);
          showMotd(G.w, motd_offset);
          break;
        case 70:
          motd_offset = motd_offset + 4;
          if (motd_offset > G.motd_last) {
            motd_offset = motd_offset - 4;
            break;
          }
          W_ClearWindow(G.w);
          showMotd(G.w, motd_offset);
          break;
        case 66:
          if (motd_offset === 0) {
            break;
          }
          motd_offset = motd_offset - 4;
          if (motd_offset < 0) {
            motd_offset = 0;
          }
          W_ClearWindow(G.w);
          showMotd(G.w, motd_offset);
          break;
        }
      }
    case 3:
      for (i = 0; i < NUMTEAM; ++i) {
        if ($peq(event.Window, G.teamWin[i])) {
          chosen_team[0] = i;
          break;
        }
      }
      if ($peq(event.Window, G.qwin) && event.type === W_EV_BUTTON) {
        hide_quit_window();
        hide_team_windows();
        return;
      }
      break;
    case 1:
      for (i = 0; i < NUMTEAM; ++i) {
        if ($peq(event.Window, G.teamWin[i])) {
          lastplayercount[i] = -1;
          redrawTeam(G.teamWin[i], i, P(lastplayercount, i));
          break;
        }
      }
      if ($peq(event.Window, G.qwin)) {
        run_clock(lasttime);
        redrawQuit();
        showTimeLeft(elapsed, quittime);
      } else if ($peq(event.Window, G.tstatw)) {
        redrawTstats(null);
      } else if ($peq(event.Window, G.iconWin)) {
        drawIcon(null);
      } else if ($peq(event.Window, G.w)) {
        run_clock(lasttime);
        showMotd(G.w, motd_offset);
      } else if ($peq(event.Window, G.mapw)) {
        G.redrawall = 1;
        map();
      } else if ($peq(event.Window, G.helpWin)) {
        fillhelp(null);
      } else if ($peq(event.Window, G.macroWin)) {
        fillmacro(null);
      } else if ($peq(event.Window, G.playerw)) {
        RedrawPlayerList(null);
      } else if ($peq(event.Window, G.warnw)) {
        W_ClearWindow(G.warnw);
      } else if ($peq(event.Window, G.messagew)) {
        W_ClearWindow(G.messagew);
      }
      break;
    case 6:
      if ($peq(event.Window, G.baseWin)) {
        fprintf(R.stderr, S("you quit, by closing the play window in refit\n"));
        team.a[team.o] = -1;
        return;
      }
    }
  }
}

export function deadTeam(owner: number): number {
  let i = 0;
  let num = 0;
  let p = null;
  if ($sadd(G.planets, (G.remap[owner] * 10 - 10)).pl_couptime === 0) {
    return 0;
  }
  for (i = 0, p = G.planets; i < MAXPLANETS; ++i, p = $sadd(p, 1)) {
    if (p.pl_owner & owner) {
      ++num;
    }
  }
  if (num !== 0) {
    return 0;
  }
  return 1;
}

function checkBold(line: Ptr | null): number {
  let s = null;
  let t = null;
  let i = 0;
  let end = 0;
  if (!G.me) {
    return 0;
  }
  if (strlen(line) < 60) {
    return 0;
  }
  s = line.add(4);
  t = P(G.me.p_name);
  for (i = 0; i < 16; ++i) {
    if (!end) {
      if (t.a[t.o] === 0) {
        end = 1;
      } else if (t.a[t.o] !== s.a[s.o]) {
        return 0;
      }
    }
    if (end) {
      if (s.a[s.o] !== 32) {
        return 0;
      }
    }
    s = s.add(1);
    t = t.add(1);
  }
  return 1;
}

function show_motd_heading(w: Ptr | null, text: Ptr | null, line: number, colour: number): void {
  let length = strlen(text) | 0;
  let center = (TWINSIDE / 2 | 0) - (Math.imul(length, G.W_Textwidth) / 2 | 0);
  W_WriteText(w, center, Math.imul(line, G.W_Textheight), colour, text, length, G.W_RegularFont);
}

export function showMotd(w: Ptr | null, atline: number): void {
  let i = 0;
  let length = 0;
  let top = 0;
  let center = 0;
  let data = null;
  let count = 0;
  let buf = new Int8Array(128);
  sprintf(P(buf), S("---  %s  ---"), S("COW 3.3"));
  length = strlen(P(buf)) | 0;
  center = (TWINSIDE / 2 | 0) - (Math.imul(length, G.W_Textwidth) / 2 | 0);
  W_WriteText(w, center, G.W_Textheight, G.W_Cyan, P(buf), length, G.W_HighlightFont);
  show_motd_heading(w, S("feedback to: quozl@us.netrek.org"), 3, G.W_Cyan);
  if (!G.me) {
    show_motd_heading(w, S("while you are in the queue"), 5, G.W_Grey);
    show_motd_heading(w, S("do some reading or play somewhere else"), 6, G.W_Grey);
  } else {
    show_motd_heading(w, S("this is the team selection window"), 5, G.W_Grey);
    show_motd_heading(w, S("press enter to join the default team"), 6, G.W_Grey);
  }
  show_motd_heading(w, S("server message follows below"), 9, G.W_Grey);
  top = 11;
  data = motd_lines;
  while (!!data) {
    if (data.bold === -1) {
      data.bold = checkBold(data.data);
    }
    data = data.next;
  }
  data = motd_lines;
  for (i = 0; i < atline; ++i) {
    if (!data) {
      atline = 0;
      data = motd_lines;
      break;
    }
    data = data.next;
  }
  count = MOTD_PAGE_SIZE;
  for (i = top; i < 50; ++i) {
    if (!data) {
      break;
    }
    if (!strcmp(data.data, S("\t@@@"))) {
      break;
    }
    if (data.bold) {
      W_WriteText(w, 20, Math.imul(i, G.W_Textheight), G.textColor, data.data, strlen(data.data) | 0, G.W_HighlightFont);
    } else {
      W_WriteText(w, 20, Math.imul(i, G.W_Textheight), G.textColor, data.data, strlen(data.data) | 0, G.W_RegularFont);
    }
    data = data.next;
    --count;
    if (count <= 0) {
      break;
    }
  }
  if (!G.motd_clears) {
    showValues(data);
  }
  W_FlushWindow(w);
}

function showValues(data: struct_motd_line | null): void {
  let i = 0;
  W_ClearWindow(G.mapw);
  while (1) {
    if (!data) {
      return;
    }
    if (!strcmp(data.data, S("\t@@@"))) {
      break;
    }
    data = data.next;
  }
  data = data.next;
  W_WriteText(G.mapw, 20, 14 * G.W_Textheight, G.textColor, showValues$msg, strlen(showValues$msg) | 0, G.W_RegularFont);
  for (i = 16; i < 50; ++i) {
    let y = Math.imul(i, G.W_Textheight) * 15 / 10 | 0;
    if (!data) {
      break;
    }
    if (data.data.a[data.data.o] === 43) {
      W_WriteText(G.mapw, 20, y, G.textColor, data.data.add(1), strlen(data.data) - 1 | 0, G.W_HighlightFont);
    } else {
      W_WriteText(G.mapw, 20, y, G.textColor, data.data, strlen(data.data) | 0, G.W_RegularFont);
    }
    data = data.next;
  }
  W_FlushWindow(G.mapw);
}

export function newMotdLine(line: Ptr | null): void {
  let new_ = null;
  if (strcmp(line, S("\x1b\x18CLEAR_MOTD\x00")) === 0) {
    W_ClearWindow(G.w);
    ClearMotd();
    newMotdLine$statmode = 0;
    return;
  }
  if (!strcmp(line, S("\t@@@"))) {
    newMotdLine$statmode = 1;
  }
  new_ = new struct_motd_line();
  if (!new_) {
    return;
  }
  if (!newMotdLine$statmode) {
    ++G.motd_last;
  }
  new_.next = null;
  new_.bold = -1;
  new_.data = strdup(line);
  if (!motd_lines) {
    motd_lines = new_;
  } else {
    newMotdLine$old.next = new_;
  }
  newMotdLine$old = new_;
  ++G.motd_refresh_needed;
}

export function motd_refresh(): void {
  if (G.motd_refresh_needed) {
    showMotd(G.w, motd_offset);
    G.motd_refresh_needed = 0;
  }
}

function ClearMotd(): void {
  let next = null;
  let this_ = null;
  next = motd_lines;
  while (!!next) {
    this_ = next;
    next = next.next;
    free(this_.data);
    free(this_);
  }
  motd_lines = null;
  motd_offset = 0;
  G.motd_last = 0;
  ++G.motd_clears;
}

function getResources(prog: Ptr | null): void {
  getColorDefs();
  getTiles();
}

function getTiles(): void {
  G.stipple = W_StoreBitmap(stipple_width, stipple_height, P(stipple_bits), G.w);
}

function redrawTeam(win: Ptr | null, teamNo: number, lastnum: Ptr | null): void {
  let buf = new Int8Array(8192);
  let num = numShips(1 << teamNo);
  if (lastnum.a[lastnum.o] === num) {
    return;
  }
  W_ClearWindow(win);
  W_WriteText(win, 5, 5, G.shipCol[teamNo + 1], redrawTeam$teams[teamNo], strlen(redrawTeam$teams[teamNo]) | 0, G.W_RegularFont);
  sprintf(P(buf), S("%d"), num);
  W_MaskText(win, 5, 46, G.shipCol[teamNo + 1], P(buf), strlen(P(buf)) | 0, G.W_BigFont);
  lastnum.a[lastnum.o] = num;
}

function redrawQuit(): void {
  let msg = S("Quit");
  W_ClearWindow(G.qwin);
  let tx = $u64(W_WindowWidth(G.qwin) / 2 | 0) - Math.trunc($u64(G.W_Textwidth) * strlen(msg) / 2) | 0;
  W_WriteText(G.qwin, tx, 5, G.textColor, msg, -1, G.W_RegularFont);
}

export function drawIcon(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  W_WriteBitmap(0, 0, G.icon, G.W_White);
}

function showTimeLeft(time: number, max: number): void {
  let buf = new Int8Array(8192);
  let cp = null;
  let cx = 0;
  let cy = 0;
  let ex = 0;
  let ey = 0;
  let tx = 0;
  let ty = 0;
  if (max - time < 10 && time & 1) {
    W_Beep();
  }
  W_ClearArea(G.qwin, ((500 / 5 | 0) / 2 | 0) - (((500 / 5 | 0) * 9 / 10 | 0) / 2 | 0), ((500 / 5 | 0) / 2 | 0) - (((500 / 5 | 0) * 2 / 3 | 0) / 2 | 0), (500 / 5 | 0) * 9 / 10 | 0, (500 / 5 | 0) * 2 / 3 | 0);
  cx = ((500 / 5 | 0) / 2 | 0) - (((500 / 5 | 0) * 9 / 10 | 0) / 2 | 0) + (((500 / 5 | 0) * 9 / 10 | 0) / 2 | 0);
  cy = ((500 / 5 | 0) / 2 | 0) - (((500 / 5 | 0) * 2 / 3 | 0) / 2 | 0) + (((500 / 5 | 0) * 2 / 3 | 0) / 2 | 0);
  ex = cx - (clock_width / 2 | 0);
  ey = cy - (clock_height / 2 | 0);
  W_WriteBitmap(ex, ey, G.clockpic, G.foreColor);
  ex = Math.trunc(cx - clock_width * sin(2 * 3.1415926540000001 * time / max) / 2) | 0;
  ey = Math.trunc(cy - clock_height * cos(2 * 3.1415926540000001 * time / max) / 2) | 0;
  W_MakeLine(G.qwin, cx, cy, ex, ey, G.foreColor);
  sprintf(P(buf), S("%d"), max - time | 0);
  tx = $u64(cx) - Math.trunc($u64(G.W_Textwidth) * strlen(P(buf)) / 2) | 0;
  ty = cy - (G.W_Textheight / 2 | 0);
  W_WriteText(G.qwin, tx, ty, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  cp = S("Auto Quit Timer");
  tx = $u64(cx) - Math.trunc($u64(G.W_Textwidth) * strlen(cp) / 2) | 0;
  ty = ((500 / 5 | 0) / 2 | 0) - (((500 / 5 | 0) * 2 / 3 | 0) / 2 | 0) + ((500 / 5 | 0) * 2 / 3 | 0);
  W_WriteText(G.qwin, tx, ty, G.textColor, cp, strlen(cp) | 0, G.W_RegularFont);
  W_FlushWindow(G.qwin);
}

export function $init(): void {
  emph_planet_seq_bits = $rows([$ta(Int8Array, 72, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 124, 0, 0, -125, 1, -64, 0, 6, 64, 0, 4, 32, 0, 8, 32, 0, 8, 16, 0, 16, 16, 0, 16, 16, 0, 16, 16, 0, 16, 16, 0, 16, 32, 0, 8, 32, 0, 8, 64, 0, 4, -64, 0, 6, 0, -125, 1, 0, 124]),
$ta(Int8Array, 72, [0, 0, 0, 0, 0, 0, 0, -2, 0, -128, 1, 3, 64, 0, 4, 32, 0, 8, 16, 0, 16, 16, 0, 16, 8, 0, 32, 8, 0, 32, 8, 0, 32, 8, 0, 32, 8, 0, 32, 8, 0, 32, 8, 0, 32, 16, 0, 16, 16, 0, 16, 32, 0, 8, 64, 0, 4, -128, 1, 3, 0, -2]),
$ta(Int8Array, 72, [0, 0, 0, 0, -2, 0, -128, 1, 3, 64, 0, 4, 32, 0, 8, 16, 0, 16, 8, 0, 32, 8, 0, 32, 4, 0, 64, 4, 0, 64, 4, 0, 64, 4, 0, 64, 4, 0, 64, 4, 0, 64, 4, 0, 64, 8, 0, 32, 8, 0, 32, 16, 0, 16, 32, 0, 8, 64, 0, 4, -128, 1, 3, 0, -2]),
$ta(Int8Array, 72, [0, -2, 0, -128, 1, 3, 96, 0, 12, 16, 0, 16, 8, 0, 32, 8, 0, 32, 4, 0, 64, 4, 0, 64, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 4, 0, 64, 4, 0, 64, 8, 0, 32, 8, 0, 32, 16, 0, 16, 96, 0, 12, -128, 1, 3, 0, -2]),
$ta(Int8Array, 72, [0, -1, 1, -64, 0, 6, 48, 0, 24, 8, 0, 32, 8, 0, 32, 4, 0, 64, 4, 0, 64, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 2, 0, -128, 4, 0, 64, 4, 0, 64, 8, 0, 32, 8, 0, 32, 48, 0, 24, -64, 0, 6, 0, -1, 1])]);
  emph_player_seq_bits = $rows([$ta(Int8Array, 72, [0, 0, 0, 0, 8, 0, 0, 8, 0, -128, -100, 0, -128, -1, 0, -64, -63, 1, 96, 0, 3, 56, 0, 14, 48, 0, 6, 16, 0, 4, 24, 0, 12, 30, 0, 60, 24, 0, 12, 16, 0, 4, 48, 0, 6, 56, 0, 14, 96, 0, 3, -64, -63, 1, -128, -1, 0, -128, -100, 0, 0, 8, 0, 0, 8]), $ta(Int8Array, 72, [0, 8, 0, 0, 8, 0, 64, 28, 1, -64, -1, 1, -64, -1, 1, -32, -128, 3, 124, 0, 31, 56, 0, 14, 24, 0, 12, 24, 0, 12, 28, 0, 28, 31, 0, 124, 28, 0, 28, 24, 0, 12, 24, 0, 12, 56, 0, 14, 124, 0, 31, -32, -128, 3, -64, -1, 1, -64, -1, 1, 64, 28, 1, 0, 8, 0, 0, 8]), new Int8Array(72)]);
  emph_player_seql_bits = $rows([$ta(Int8Array, 120, [0, 0, 0, 0, 0, 8, 4, 0, 0, 24, 6, 0, -128, -4, 79, 0, -128, 15, 124, 0, -64, 1, -32, 0, 96, 0, -128, 1, 56, 0, 0, 7, 48, 0, 0, 3, 16, 0, 0, 2, 24, 0, 0, 6, 30, 0, 0, 30, 12, 0, 0, 12, 8, 0, 0, 4, 8, 0, 0, 4, 8, 0, 0, 4, 8, 0, 0, 4, 12, 0, 0, 12, 30, 0, 0, 30, 24, 0, 0, 6, 16, 0, 0, 2, 48, 0, 0, 3, 56, 0, 0, 7, 96, 0, -128, 1, -64, 1, -32, 0, -128, 15, 124, 0, -128, -4, 79, 0, 0, 24, 6, 0, 0, 8, 4]), $ta(Int8Array, 120, [0, 8, 4, 0, 0, 24, 6, 0, 64, -4, -113, 0, -64, -1, -1, 0, -64, 15, -4, 0, -32, 0, -64, 1, 124, 0, -128, 15, 56, 0, 0, 7, 24, 0, 0, 6, 24, 0, 0, 6, 28, 0, 0, 14, 31, 0, 0, 62, 14, 0, 0, 28, 12, 0, 0, 12, 12, 0, 0, 12, 12, 0, 0, 12, 12, 0, 0, 12, 14, 0, 0, 28, 31, 0, 0, 62, 28, 0, 0, 14, 24, 0, 0, 6, 24, 0, 0, 6, 56, 0, 0, 7, 124, 0, -128, 15, -32, 0, -64, 1, -64, 15, -4, 0, -64, -1, -1, 0, 64, -4, -113, 0, 0, 24, 6, 0, 0, 8, 4]), new Int8Array(120)]);
  fed_scout_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 31, 0, -128, 63, 0, -128, 63, 0, -128, 63, 0, 0, 31, 0, 0, 14, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 31, 0, -128, 63, 0, -128, 63, 0, 0, 63, 0, 0, 31, 0, 0, 14, 0, 0, 3, 0, 0, 1, 0, 0, 1, 0, -128, 0, 0, -128, 0, 0, 64, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 124, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, 126, 0, 0, 1, 0, -128, 0, 0, 64, 0, 0, 32, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, -8, 0, 0, -4, 1, 0, -4, 1, 0, -4, 1, -128, -5, 0, -32, 112, 0, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -16, 1, 0, -8, 3, -8, -1, 3, 0, -8, 3, 0, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, -32, 112, 0, -128, -5, 0, 0, -4, 1, 0, -4, 1, 0, -4, 1, 0, -8, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 32, 0, 0, 64, 0, 0, -128, 0, 0, 0, 1, 0, 0, 126, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, 124]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 6, 0, 0, 28, 0, 0, 62, 0, 0, 126, 0, 0, 127, 0, 0, 127, 0, 0, 62, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 14, 0, 0, 31, 0, -128, 63, 0, -128, 63, 0, -128, 63, 0, 0, 31, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 32, 0, 0, 16, 0, 0, 16, 0, 0, 8, 0, 0, 8, 0, 0, 12, 0, 0, 6, 0, -128, 15, 0, -64, 15, 0, -64, 31, 0, -64, 31, 0, -128, 15, 0, -128, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 64, 0, 0, 32, 0, 0, 16, 0, 0, 8, 0, -32, 7, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -32, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, -32, 112, 0, -16, 29, 0, -8, 3, 0, -8, 3, 0, -8, 3, 0, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, -8, 0, 0, -4, 1, 0, -4, -1, 1, -4, 1, 0, -8, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -16, 1, 0, -8, 3, 0, -8, 3, 0, -8, 3, 0, -16, 29, 0, -32, 112, 0, 0, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 3, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -32, 7, 0, 0, 8, 0, 0, 16, 0, 0, 32, 0, 0, 64, 0, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 7, 0, -64, 15, 0, -64, 31, 0, -64, 31, 0, -64, 31, 0, -64, 31, 0, -128, 15, 0, 0, 4, 0, 0, 8, 0, 0, 8, 0, 0, 16, 0, 0, 16, 0, 0, 32, 0, 0, 32])]);
  kli_scout_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 7, 0, -128, 15, 0, 0, 7, 0, 0, 7, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, -128, 15, 0, -64, 31, 0, -64, 31, 0, -64, 31, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 56, 0, 0, 56, 0, 0, 24, 0, 0, 8, 0, 0, 4, 0, 0, 7, 0, -64, 15, 0, -64, 15, 0, -128, 15, 0, 0, 15, 0, 0, 1, 0, -128, 0, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 112, 0, 0, -16, 0, 0, 112, 0, 0, 8, 0, -64, 7, 0, -64, 7, 0, -128, 7, 0, -128, 7, 0, 64, 2, 0, 32, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -64, 1, 0, -31, 1, -64, -9, 1, -128, 15, 0, -128, 15, 0, -32, 15, 0, 24, 7, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -64, -125, 0, -64, -29, 1, -4, -1, 1, -64, -29, 1, -64, -125, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 24, 7, 0, -32, 15, 0, -128, 15, 0, -128, 15, 0, -64, -9, 1, 0, -31, 1, 0, -64, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 32, 0, 0, 64, 2, 0, -128, 7, 0, -128, 7, 0, -64, 7, 0, -64, 7, 0, 0, 8, 0, 0, 112, 0, 0, -16, 0, 0, 112, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 0, 0, 0, 1, 0, 0, 15, 0, -128, 15, 0, -64, 15, 0, -64, 15, 0, 0, 7, 0, 0, 4, 0, 0, 8, 0, 0, 24, 0, 0, 56, 0, 0, 56, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, -64, 31, 0, -64, 31, 0, -64, 31, 0, -128, 15, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 7, 0, 0, 7, 0, -128, 15, 0, 0, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 8, 0, 0, 4, 0, -128, 7, 0, -128, 15, 0, -128, 31, 0, -128, 31, 0, 0, 7, 0, 0, 1, 0, -128, 0, 0, -64, 0, 0, -32, 0, 0, -32, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 32, 0, 0, 18, 0, 0, 15, 0, 0, 15, 0, 0, 31, 0, 0, 31, 0, -128, 0, 0, 112, 0, 0, 120, 0, 0, 112, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, -57, 0, -128, 63, 0, -128, 15, 0, -128, 15, 0, 124, 31, 0, 60, 4, 0, 28, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 8, 30, 0, 60, 30, 0, -4, -1, 1, 60, 30, 0, 8, 30, 0, 0, 28]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 28, 0, 0, 60, 4, 0, 124, 31, 0, -128, 15, 0, -128, 15, 0, -128, 63, 0, 0, -57, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 112, 0, 0, 120, 0, 0, 112, 0, 0, -128, 0, 0, 0, 31, 0, 0, 31, 0, 0, 15, 0, 0, 15, 0, 0, 18, 0, 0, 32, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 0, 0, -32, 0, 0, -32, 0, 0, -64, 0, 0, -128, 0, 0, 0, 1, 0, 0, 7, 0, -128, 31, 0, -128, 31, 0, -128, 15, 0, -128, 7, 0, 0, 4, 0, 0, 8, 0, 0, 8])]);
  rom_scout_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 32, 0, 32, 32, 0, 32, 32, 0, 32, 34, 0, 48, 103, 0, -16, 127, 0, -16, 127, 0, 48, 103, 0, 32, 32, 0, 32, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 0, 0, 64, 0, 0, 96, 64, 0, 96, 70, 0, -16, 39, 0, -80, 39, 0, -112, 63, 0, 0, 59, 0, 0, 48, 0, 0, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, -128, 0, 0, 96, 0, 0, 112, 0, 0, -16, 67, 0, -56, 35, 0, -64, 19, 0, -128, 15, 0, 0, 14, 0, 0, 6, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, -32, 3, 0, -16, 0, 0, -48, 0, 0, -128, 7, 0, -64, 7, 0, -64, 3, 0, -128, 99, 0, 0, 30, 0, 0, 15, 0, -128, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 3, 0, -16, 63, 0, -128, 1, 0, -128, 1, 0, -64, 3, 0, -64, 7, 0, -64, 3, 0, -128, 1, 0, -128, 1, 0, -16, 63, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 3, 0, 0, 15, 0, 0, 30, 0, -128, 99, 0, -64, 3, 0, -64, 7, 0, -128, 7, 0, -48, 0, 0, -16, 0, 0, -32, 3, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 6, 0, 0, 14, 0, -128, 15, 0, -64, 19, 0, -56, 35, 0, -16, 67, 0, 112, 0, 0, 96, 0, 0, -128, 0, 0, 0, 1, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 48, 0, 0, 59, 0, -112, 63, 0, -80, 39, 0, -16, 39, 0, 96, 70, 0, 96, 64, 0, 64, 0, 0, -128, 0, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 32, 0, 32, 32, 0, 48, 103, 0, -16, 127, 0, -16, 127, 0, 48, 103, 0, 32, 34, 0, 32, 32, 0, 32, 32, 0, 32, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, 96, 0, 0, -32, 6, 0, -32, 79, 0, 32, 111, 0, 32, 127, 0, 16, 51, 0, 16, 48, 0, 0, 16, 0, 0, 8, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 0, -128, 3, 0, -128, 15, 0, 64, 30, 0, 32, -98, 0, 16, 126, 0, 0, 112, 0, 0, 48, 0, 0, 8, 0, 0, 4, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, -128, 7, 0, -64, 3, 0, 48, 14, 0, 0, 30, 0, 0, 31, 0, 0, 15, 0, 0, 88, 0, 0, 120, 0, 0, 62, 0, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, -32, 127, 0, 0, 12, 0, 0, 12, 0, 0, 30, 0, 0, 31, 0, 0, 30, 0, 0, 12, 0, 0, 12, 0, -32, 127, 0, 0, 30]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 62, 0, 0, 120, 0, 0, 88, 0, 0, 15, 0, 0, 31, 0, 0, 30, 0, 48, 14, 0, -64, 3, 0, -128, 7, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 0, 8, 0, 0, 48, 0, 0, 112, 0, 16, 126, 0, 32, -98, 0, 64, 30, 0, -128, 15, 0, -128, 3, 0, 0, 3, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 8, 0, 0, 16, 0, 16, 48, 0, 16, 51, 0, 32, 127, 0, 32, 111, 0, -32, 79, 0, -32, 6, 0, 96, 0, 0, -64])]);
  ori_scout_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 4, 0, 0, 31, 0, 0, 14, 0, 0, 4, 0, 0, 21, 0, 0, 21, 0, 0, 31, 0, 0, 27, 0, 0, 17, 0, 0, 17, 0, 0, 17, 0, 0, 17]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 56, 0, 0, 56, 0, 0, 26, 0, 0, 14, 0, 0, 60, 0, -128, 13, 0, -128, 6, 0, -64, 23, 0, 64, 31, 0, 64, 12, 0, 96, 4, 0, 32, 4, 0, 0, 6, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -32, 0, 0, -28, 0, 0, 28, 0, 0, 29, 0, -128, 62, 0, -64, 7, 0, -32, 11, 0, 16, 7, 0, 8, 3, 0, 0, 1, 0, -128, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, -40, 1, -128, -7, 1, -32, 60, 0, -72, 55, 0, 12, 3, 0, -128, 7, 0, -32, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -8, 39, 0, -128, -79, 1, 0, -1, 3, -128, -79, 1, -8, 39]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, -32, 0, 0, -128, 7, 0, 12, 3, 0, -72, 55, 0, -32, 60, 0, -128, -7, 1, 0, -40, 1, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -128, 0, 0, 0, 1, 0, 8, 3, 0, 16, 7, 0, -32, 11, 0, -64, 7, 0, -128, 62, 0, 0, 29, 0, 0, 28, 0, 0, -28, 0, 0, -32, 0, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 6, 0, 32, 4, 0, 96, 4, 0, 64, 12, 0, 64, 31, 0, -64, 23, 0, -128, 6, 0, -128, 13, 0, 0, 60, 0, 0, 14, 0, 0, 26, 0, 0, 56, 0, 0, 56, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 17, 0, 0, 17, 0, 0, 17, 0, 0, 27, 0, 0, 31, 0, 0, 21, 0, 0, 21, 0, 0, 4, 0, 0, 14, 0, 0, 31, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 6, 0, 0, 66, 0, 0, 98, 0, 0, 35, 0, -128, 47, 0, -128, 62, 0, 0, 22, 0, 0, 27, 0, -64, 3, 0, 0, 7, 0, -128, 5, 0, -64, 1, 0, -64, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 16, 0, 0, 8, 0, 0, 12, 1, 0, -114, 0, 0, 125, 0, 0, 62, 0, -64, 23, 0, -128, 11, 0, -128, 3, 0, 112, 2, 0, 112, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, 112, 0, 0, 30, 0, 0, 12, 3, -64, -34, 1, -64, 115, 0, -8, 25, 0, -72, 1, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, -2, 1, -40, 24, 0, -4, 15, 0, -40, 24, 0, 64, -2, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, -72, 1, 0, -8, 25, 0, -64, 115, 0, -64, -34, 1, 0, 12, 3, 0, 30, 0, 0, 112, 0, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, 112, 0, 0, 112, 2, 0, -128, 3, 0, -128, 11, 0, -64, 23, 0, 0, 62, 0, 0, 125, 0, 0, -114, 0, 0, 12, 1, 0, 8, 0, 0, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -64, 1, 0, -64, 1, 0, -128, 5, 0, 0, 7, 0, -64, 3, 0, 0, 27, 0, 0, 22, 0, -128, 62, 0, -128, 47, 0, 0, 35, 0, 0, 98, 0, 0, 66, 0, 0, 6, 0, 0, 4])]);
  fed_cruiser_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15, 0, 64, 38, 0, 64, 38, 0, 64, 47, 0, -64, 63, 0, -64, 54, 0, 64, 38, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 126, 0, 0, -1, 0, 0, -1, 0, 0, -2, 0, -128, 126, 0, -128, 60, 0, 64, 14, 0, 64, 70, 0, -32, 39, 0, 32, 47, 0, -96, 27, 0, 16, 17, 0, 16, 8, 0, 8, 8, 0, 0, 12, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -16, 1, 0, -8, 3, 0, -8, 3, 0, -6, 3, 0, -7, 3, -128, -8, 3, -64, -1, 1, 32, 14, 0, 16, 79, 0, 8, 43, 0, 4, 24, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -14, 1, -128, -5, 3, 96, -8, 3, -8, -4, 3, -122, -1, 3, -64, -9, 1, -64, 3, 0, 0, 50, 0, 0, 15, 0, -128, 1, 0, 96, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, -25, 0, -64, -16, 1, -128, -7, 3, -32, -1, 3, -32, -1, 3, -128, -7, 3, -64, -16, 1, -2, -25]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, -128, 1, 0, 0, 15, 0, 0, 50, 0, -64, 3, 0, -64, -9, 1, -122, -1, 3, -8, -8, 3, -32, -8, 3, 0, -5, 3, 0, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 1, 0, 0, 2, 0, 0, 4, 0, 0, 12, 0, 4, 21, 0, -120, 39, 0, 16, 7, 0, 96, -1, 0, -64, -3, 1, -128, -4, 1, 0, -3, 1, 0, -4, 1, 0, -4, 1, 0, -8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, 0, 12, 0, 8, 8, 0, 16, 8, 0, 16, 16, 0, 32, 27, 0, 32, 47, 0, -32, 39, 0, 64, 102, 0, 64, 14, 0, -128, 60, 0, -128, 126, 0, 0, -2, 0, 0, -1, 0, 0, -1, 0, 0, 126, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 38, 0, -64, 54, 0, -64, 63, 0, 64, 47, 0, 64, 38, 0, 64, 38, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 1, 1, 0, -127, 0, -128, -128, 0, -128, 77, 0, 64, 79, 0, 64, 126, 0, 96, 38, 0, 0, 39, 0, -64, 19, 0, -32, 23, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -32, 7, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 3, 0, -128, 10, 2, 64, 30, 1, 32, -114, 0, 0, 127, 0, -8, 35, 0, -4, 19, 0, -4, 11, 0, -4, 3, 0, -4, 3, 0, -4, 3, 0, -8, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -32, 0, 0, 24, 0, 0, 15, 0, -128, 8, 0, 0, 56, 0, -8, 62, 0, -4, 31, 6, -4, -13, 1, -4, 113, 0, -4, 13, 0, -8, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, -1, 3, 124, 24, 0, -2, 12, 0, -2, 63, 0, -2, 63, 0, -2, 12, 0, 124, 24, 0, 56, -1, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, -8, 0, 0, -4, 13, 0, -4, 113, 0, -4, -13, 1, -4, 31, 6, 120, 63, 0, 0, 60, 0, -128, 4, 0, 0, 15, 0, 0, 56, 0, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 1, 0, -8, 3, 0, -8, 3, 0, -8, 11, 0, -8, 19, 0, -8, 35, 0, -16, 127, 0, 0, -114, 0, 64, 30, 1, -128, 26, 2, 0, 3, 0, 0, 2, 0, 0, 4, 0, 0, 8, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 7, 0, -64, 15, 0, -32, 31, 0, -32, 31, 0, -32, 31, 0, -64, 47, 0, -128, 39, 0, 0, 78, 0, 64, 78, 0, -128, -4, 0, -128, -98, 0, 0, -101, 0, 0, 3, 1, 0, 2, 1, 0, 2, 2, 0, 6, 0, 0, 4])]);
  kli_cruiser_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 31, 0, 0, 14, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 32, -114, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -96, -65, 0, 32, -118, 0, 32, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 120, 0, 0, 112, 0, 0, -16, 0, 0, 16, 0, 0, 16, 0, 0, 8, 0, 96, 8, 0, -32, 14, 0, -32, 15, 0, -16, -97, 0, -48, -1, 0, -120, 127, 0, 0, 126, 0, 0, 32, 0, 0, 32, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, -32, 0, 0, -32, 1, 64, -32, 1, 96, 16, 0, -16, 11, 0, -24, 7, 0, -28, 15, 0, -64, 15, 0, -64, 15, 0, -128, 63, 0, 0, 30, 0, 0, 8, 0, 0, 4, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -128, 0, -32, -64, 1, -8, -64, 3, -28, -31, 3, -32, -69, 1, -32, 15, 0, -16, 7, 0, -64, 7, 0, -32, 7, 0, -128, 7, 0, 0, 15, 0, -128, 3, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -8, 3, 0, -64, 1, 0, -32, 1, 0, -32, 1, 1, -16, -125, 3, -32, -1, 3, -16, -125, 3, -32, 1, 1, -32, 1, 0, -64, 1, 0, -8, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -128, 3, 0, 0, 15, 0, -128, 7, 0, -32, 7, 0, -64, 7, 0, -16, 7, 0, -32, 15, 0, -32, -69, 1, -28, -31, 3, -8, -64, 3, -32, -64, 1, -128, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 0, 8, 0, 0, 30, 0, -128, 63, 0, -64, 15, 0, -64, 15, 0, -28, 15, 0, -24, 7, 0, -16, 11, 0, 96, 16, 0, 64, -32, 1, 0, -32, 1, 0, -32, 0, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 32, 0, 0, 32, 0, 0, 126, 0, -120, 127, 0, -48, -1, 0, -16, -97, 0, -32, 15, 0, -32, 14, 0, 96, 8, 0, 0, 8, 0, 0, 16, 0, 0, 16, 0, 0, -16, 0, 0, 112, 0, 0, 120]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 32, -128, 0, 32, -118, 0, -96, -65, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, 32, -114, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 14, 0, 0, 31, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 0, 0, -128, 0, 0, -64, 15, 0, -64, 63, 2, -32, 127, 1, 32, -1, 1, 0, -2, 0, 0, -18, 0, 0, -62, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, -32, 1, 0, -64, 1, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 0, 0, 1, 0, -128, 7, 0, -64, 31, 0, 0, 63, 0, 0, 63, 0, 0, 127, 2, 0, 126, 1, 0, -3, 0, -128, 96, 0, 120, 32, 0, 120, 0, 0, 112, 0, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 56, 0, 0, 30, 0, 0, 60, 0, 0, -4, 0, 0, 124, 0, 0, -4, 1, 0, -2, 0, -80, -5, 0, -8, -16, 4, 120, -32, 3, 112, -32, 0, 32, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 1, 0, 56, 0, 0, 120, 0, 8, 120, 0, 28, -4, 0, -4, 127, 0, 28, -4, 0, 8, 120, 0, 0, 120, 0, 0, 56, 0, 0, -4, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 32, 0, 112, -32, 0, 120, -32, 3, -8, -16, 4, -80, -5, 0, 0, -2, 0, 0, -4, 1, 0, 124, 0, 0, -4, 0, 0, 60, 0, 0, 30, 0, 0, 56, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 112, 0, 0, 120, 0, 0, 120, 32, 0, -128, 96, 0, 0, -3, 0, 0, 126, 1, 0, 127, 2, 0, 63, 0, 0, 63, 0, -64, 31, 0, -128, 7, 0, 0, 1, 0, 0, 2, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 3, 0, -64, 1, 0, -32, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, -62, 0, 0, -18, 0, 0, -2, 0, 32, -1, 1, -32, 127, 1, -64, 63, 2, -64, 15, 0, -128, 0, 0, -128, 0, 0, -128])]);
  rom_cruiser_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 15, 1, -120, 31, 1, -56, 63, 1, -24, 127, 1, -24, 127, 1, -8, -1, 1, -8, -1, 1, 56, -64, 1, 8, 0, 1, 8, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 16, 0, 0, 16, 15, 0, -56, 31, 0, -24, 63, 0, -4, 63, 2, -4, 63, 1, -60, 63, 1, 2, -66, 0, 0, -8, 0, 0, 112, 0, 0, 96, 0, 0, 64, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 1, 0, -128, 0, 0, 64, 0, 0, -96, 31, 0, -16, 63, 0, -8, 127, 0, -28, 127, 0, -128, 127, 0, 0, 127, 4, 0, 126, 2, 0, 124, 1, 0, -72, 0, 0, 120, 0, 0, 48, 0, 0, 16, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 6, 0, -64, 1, 0, -16, 0, 0, -4, 15, 0, -32, 63, 0, -64, 63, 0, -128, 63, 0, -128, 127, 0, 0, 127, 0, 0, 63, 0, 0, 62, 0, 0, 30, 1, 0, -50, 0, 0, 62, 0, 0, 6, 0, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 127, 0, -128, 3, 0, -128, 15, 0, 0, 31, 0, 0, 63, 0, 0, 127, 0, 0, 127, 0, 0, 127, 0, 0, 127, 0, 0, 63, 0, 0, 31, 0, -128, 15, 0, -128, 3, 0, -32, 127]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 6, 0, 0, 62, 0, 0, -50, 0, 0, 30, 1, 0, 62, 0, 0, 63, 0, 0, 127, 0, -128, 127, 0, -128, 63, 0, -64, 63, 0, -32, 63, 0, -4, 15, 0, -16, 0, 0, -64, 1, 0, 0, 6, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 16, 0, 0, 48, 0, 0, 120, 0, 0, -72, 0, 0, 124, 1, 0, 126, 2, 0, 127, 4, -128, 127, 0, -28, 127, 0, -8, 127, 0, -16, 63, 0, -96, 31, 0, 64, 0, 0, -128, 0, 0, 0, 1, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 64, 0, 0, 96, 0, 0, 112, 0, 0, -8, 0, 2, -66, 0, -60, 63, 1, -4, 63, 1, -4, 63, 2, -24, 63, 0, -56, 31, 0, 16, 15, 0, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 1, 8, 0, 1, 56, -64, 1, -8, -1, 1, -8, -1, 1, -24, 127, 1, -24, 127, 1, -56, 63, 1, -120, 31, 1, 8, 15, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 32, 0, 0, 96, 0, 0, -32, 0, 0, -16, 1, 0, -48, 7, 4, -56, 63, 2, -56, -1, 3, -60, -1, 3, -64, 127, 1, -128, 63, 1, 0, -113, 0, 0, -128, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, -128, 1, 0, -64, 3, 0, -96, 3, 0, -48, 7, 0, -56, 15, 0, -60, 31, 0, -64, 63, 0, -64, -1, 4, -64, -1, 3, -128, -1, 1, 0, -65, 0, 0, 64, 0, 0, 32, 0, 0, 16, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 6, 0, -64, 7, 0, 48, 7, 0, -120, 7, 0, -64, 7, 0, -64, 15, 0, -32, 15, 0, -32, 31, 0, -64, 31, 0, -64, 63, 0, -64, 127, 0, 0, -1, 3, 0, -16, 0, 0, 56, 0, 0, 6, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 127, 0, 0, 28, 0, 0, 31, 0, -128, 15, 0, -64, 15, 0, -32, 15, 0, -32, 15, 0, -32, 15, 0, -32, 15, 0, -64, 15, 0, -128, 15, 0, 0, 31, 0, 0, 28, 0, -32, 127]),
$ta(Int8Array, 60, [0, 0, 0, 0, 1, 0, 0, 6, 0, 0, 56, 0, 0, -16, 0, 0, -1, 3, -64, 127, 0, -64, 63, 0, -64, 31, 0, -32, 31, 0, -32, 15, 0, -64, 15, 0, -64, 7, 0, -120, 7, 0, 48, 7, 0, -64, 7, 0, 0, 6, 0, 0, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 16, 0, 0, 32, 0, 0, 64, 0, 0, -65, 0, -128, -1, 1, -64, -1, 3, -64, -1, 4, -64, 63, 0, -60, 31, 0, -56, 15, 0, -48, 7, 0, -96, 3, 0, -64, 3, 0, -128, 1, 0, 0, 1, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -128, 0, 0, -113, 0, -128, 63, 1, -64, 127, 1, -60, -1, 3, -56, -1, 3, -56, 63, 2, -48, 7, 4, -16, 1, 0, -32, 0, 0, 96, 0, 0, 32, 0, 0, 64])]);
  ROMVLVS_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4, 2, 15, 4, -122, 31, 6, -98, -97, 7, -6, -1, 5, -14, -1, 4, -30, 127, 4, -62, 63, 4, 2, 15, 4, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 16, 0, 0, 8, 0, 0, 24, 0, 0, 20, 15, 0, -76, 31, 0, -14, 31, 0, -30, 31, 0, -32, 31, 4, -64, -1, 3, -64, 127, 2, -64, 15, 1, 0, 1, 1, 0, -128, 0, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, 32, 0, 0, 48, 0, 0, 40, 0, 0, 36, 0, 0, 98, 30, 0, 96, 63, 0, -32, 63, 0, -32, 63, 0, -64, 63, 0, -64, 31, 0, -32, 15, 0, -64, 63, 4, -128, -4, 3, 0, 0, 1, 0, -128, 0, 0, 64, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 1, 0, -64, 0, 0, -80, 0, 0, -116, 0, 0, -64, 0, 0, -64, 0, 0, -64, 15, 0, -32, 31, 0, -32, 31, 0, -16, 31, 0, -16, 31, 0, -32, 15, 0, -32, 15, 0, 0, 28, 0, 0, 120, 1, 0, -64, 0, 0, 48, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, -64, 127, 0, 0, 24, 0, 0, 12, 0, 0, 6, 0, 0, 7, 0, -128, 7, 0, -128, 31, 0, -32, 63, 0, -32, 63, 0, -32, 63, 0, -32, 63, 0, -128, 31, 0, -128, 7, 0, 0, 7, 0, 0, 6, 0, 0, 12, 0, 0, 24, 0, -64, 127]),
$ta(Int8Array, 60, [0, 0, 0, 0, 12, 0, 0, 48, 0, 0, -64, 0, 0, 120, 1, 0, 30, 0, -32, 15, 0, -32, 31, 0, -16, 63, 0, -32, 63, 0, -64, 63, 0, -64, 63, 0, -64, 31, 0, -128, 1, 0, -128, 1, 0, 24, 1, 0, 96, 1, 0, -128, 1, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 64, 0, 0, -128, 0, 0, 0, 1, -128, -4, 3, -64, 63, 4, -32, 15, 0, -32, 31, 0, -64, 63, 0, -32, 63, 0, -32, 63, 0, 96, 63, 0, 98, 30, 0, 36, 0, 0, 40, 0, 0, 48, 0, 0, 32, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 1, 1, -64, 15, 1, -64, 127, 2, -64, -1, 3, -32, 31, 4, -30, 31, 4, -14, 31, 0, -76, 31, 0, 20, 15, 0, 24, 0, 0, 8, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 2, 15, 4, -62, 63, 4, -30, 127, 4, -14, -1, 4, -6, -1, 5, -98, -97, 7, -122, 31, 6, 2, 15, 4, 2, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 8, 8, 0, 8, 63, 0, -28, 63, 0, -4, 63, 0, -126, 127, 0, -126, 127, 4, -128, -1, 4, -128, -33, 2, 0, -113, 2, 0, -128, 1, 0, 0, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, 32, 0, 0, 16, 0, 0, 8, 0, 0, -4, 19, 0, -62, 63, 0, 0, 127, 0, -128, 63, 0, -64, 63, 0, -64, 127, 0, -64, 127, 0, -64, 111, 0, -128, 103, 4, 0, 64, 2, 0, 64, 1, 0, -64, 0, 0, 64, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 3, 0, -64, 0, 0, 48, 0, 0, -24, 1, 0, -128, 7, 0, 0, 127, 0, 0, 127, 0, -128, -1, 0, -128, 127, 0, -128, 127, 0, -128, 127, 0, 0, 63, 0, 0, 48, 0, 0, 48, 0, 0, 16, 3, 0, -48, 0, 0, 48, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, -32, 63, 0, -128, 1, 0, 0, 3, 0, 0, 6, 0, 0, 14, 0, 0, 30, 0, -128, 31, 0, -64, 127, 0, -64, 127, 0, -64, 127, 0, -64, 127, 0, -128, 31, 0, 0, 30, 0, 0, 14, 0, 0, 6, 0, 0, 3, 0, -128, 1, 0, -32, 63]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 48, 0, 0, -48, 0, 0, 16, 3, 0, 48, 0, 0, 48, 0, 0, 63, 0, -128, 127, 0, -128, 127, 0, -128, -1, 0, -128, -1, 0, 0, 127, 0, 0, 127, 0, -128, 7, 0, -24, 1, 0, 48, 0, 0, -64, 0, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 64, 0, 0, -64, 0, 0, 64, 1, 0, 64, 2, -128, 103, 4, -64, 111, 0, -64, 127, 0, -64, 127, 0, -64, 63, 0, -128, 63, 0, 0, 127, 0, -126, 63, 0, -4, 19, 0, 8, 0, 0, 16, 0, 0, 32, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 1, 0, -128, 1, 0, -113, 2, -128, -33, 2, -128, -1, 4, -128, 127, 4, -126, 127, 0, -4, 63, 0, -28, 63, 0, 8, 63, 0, 8, 12, 0, 16, 0, 0, 16])]);
  ori_cruiser_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 6, 0, 32, 79, 0, 32, 79, 0, 48, -49, 0, -80, -33, 0, -16, -1, 0, -16, -10, 0, -80, -48, 0, 48, -49, 0, 32, 64, 0, 32, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 56, 0, 0, 124, 0, 0, 120, 0, 64, 56, 0, 64, 14, 0, 96, 30, 0, 48, 31, 0, -16, -113, 0, -8, -113, 0, 88, -33, 0, 88, -8, 0, -56, 125, 0, 0, 114, 0, 0, 48, 0, 0, 16, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, -32, 1, -128, -31, 1, -64, -8, 0, 96, 60, 0, -16, 63, 0, -40, 31, 0, 72, 15, 0, 68, 79, 0, 64, 108, 0, -128, 63, 0, 0, 24, 0, 0, 12, 0, 0, 6, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, -64, 7, 3, -16, -127, 7, -16, -46, 7, -116, -1, 7, 64, 127, 1, 32, 63, 0, 64, 15, 0, 64, 14, 0, -128, 103, 0, 0, 62, 0, 0, 31, 0, -64, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 3, 0, -4, 15, 0, -64, 0, 0, -32, 1, 0, -112, -49, 1, -48, -1, 3, -48, -1, 3, -112, -49, 1, -32, 1, 0, -64, 0, 0, -4, 15, 0, -16, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 7, 0, 0, 31, 0, 0, 62, 0, -128, 103, 0, 64, 14, 0, 64, 15, 0, 32, 63, 0, 64, 127, 1, -116, -1, 7, -16, -46, 7, -16, -127, 7, -64, 7, 3, 0, 11]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 6, 0, 0, 12, 0, 0, 24, 0, -128, 63, 0, 64, 108, 0, 68, 79, 0, 72, 15, 0, -40, 31, 0, -16, 63, 0, 96, 60, 0, -64, -8, 0, -128, -31, 1, 0, -32, 1, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 16, 0, 0, 48, 0, 0, 118, 0, -56, 125, 0, 88, 120, 0, 88, -33, 0, -8, -49, 0, -8, -113, 0, 48, 31, 0, 112, 30, 0, 96, 14, 0, 64, 56, 0, 0, 120, 0, 0, 120, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 32, 64, 0, 32, 64, 0, 48, -49, 0, -80, -48, 0, -16, -10, 0, -16, -1, 0, -80, -33, 0, 48, -49, 0, 32, 79, 0, 32, 79, 0, 0, 6, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 1, 0, -128, 0, 0, -64, 0, 0, -32, 6, 0, -32, 59, 1, -32, -95, 1, -80, -81, 1, 48, -1, 1, 16, -1, 1, -128, -49, 0, -128, -25, 0, 0, 103, 0, -64, 33, 0, -32, 1, 0, -32, 1, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 6, 0, 0, 3, 0, -128, 1, 0, -64, 31, 0, 96, 35, 0, 32, 47, 2, 0, 47, 1, -128, -65, 1, -64, -1, 0, -64, 99, 0, -16, 49, 0, 120, 24, 0, 120, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, -128, 15, 0, -64, 7, 0, 96, 30, 0, 0, 39, 0, 0, 47, 0, -64, 79, 0, -24, 47, 0, -2, 31, 3, -66, -12, 0, 30, -8, 0, 12, 62, 0, 0, 13]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 0, 0, -1, 3, 0, 48, 0, 0, 120, 0, 56, -97, 0, -4, -65, 0, -4, -65, 0, 56, -97, 0, 0, 120, 0, 0, 48, 0, 0, -1, 3, 0, -4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 12, 62, 0, 30, -8, 0, -66, -12, 0, -2, 31, 3, -24, 47, 0, -64, 79, 0, 0, 47, 0, 0, 39, 0, 96, 30, 0, -64, 7, 0, -128, 15, 0, 0, 62]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 120, 0, 0, 120, 24, 0, -16, 49, 0, -64, 99, 0, -64, -1, 0, -128, -65, 1, 0, 47, 1, 32, 47, 2, 96, 35, 0, -64, 31, 0, -128, 1, 0, 0, 3, 0, 0, 6, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 0, 0, -64, 1, 0, -32, 3, 0, -32, 1, 0, -64, 33, 0, 0, 39, 0, -128, 103, 0, -128, -49, 0, 16, -1, 0, 16, -1, 1, -80, -81, 1, -16, -95, 1, -32, 59, 1, -32, 4, 0, -64, 0, 0, -128, 0, 0, 0, 1])]);
  fed_battleship_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15, 0, 64, 38, 0, 64, 47, 0, 64, 47, 0, 64, 47, 0, -64, 63, 0, -64, 63, 0, 64, 47, 0, 64, 38, 0, 64, 32, 0, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 56, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, -128, -4, 0, -128, 124, 0, -64, 30, 0, 64, 78, 0, 96, 111, 0, -32, 47, 0, -96, 47, 0, -80, 63, 0, -112, 19, 0, 24, 25, 0, 8, 8, 0, 0, 12, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -16, 0, 0, -8, 1, 0, -8, 3, 0, -6, 3, 0, -7, 3, -128, -8, 3, 64, -2, 1, -32, 15, 0, -48, 79, 0, -56, 39, 0, -60, 23, 0, -62, 15, 0, 0, 4, 0, 0, 2, 0, 0, 1, 0, -128, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 3, 0, -10, 7, -128, -13, 7, -32, -16, 7, 124, -2, 7, -58, -1, 7, -64, -17, 3, -32, 3, 0, -32, 51, 0, 0, 31, 0, -128, 3, 0, -32, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, -49, 1, -64, -32, 3, -32, -9, 7, -16, -1, 7, -16, -1, 7, -32, -9, 7, -64, -32, 3, -2, -49, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, -32, 0, 0, -128, 3, 0, 0, 31, 0, -32, 51, 0, -32, 7, 0, -64, -17, 3, -58, -1, 7, 120, -2, 7, -32, -16, 7, -128, -13, 7, 0, -10, 7, 0, -32, 3]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, -128, 0, 0, 0, 1, 0, 0, 2, 0, 0, 4, 0, -62, 15, 0, -60, 23, 0, -56, 39, 0, -48, 79, 0, -32, 15, 0, 64, -2, 1, -128, -8, 3, 0, -7, 3, 0, -6, 3, 0, -8, 3, 0, -8, 1, 0, -16]),
$ta(Int8Array, 60, [0, 4, 0, 0, 12, 0, 8, 8, 0, 24, 25, 0, -112, 19, 0, -80, 63, 0, -96, 47, 0, -32, 47, 0, 96, 111, 0, 64, 78, 0, -64, 30, 0, -128, 124, 0, -128, -4, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, -2, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 38, 0, 64, 47, 0, -64, 63, 0, -64, 63, 0, 64, 47, 0, 64, 47, 0, 64, 47, 0, 64, 38, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 1, 1, -128, -127, 1, -128, -100, 0, -64, -33, 0, 64, 94, 0, 64, 127, 0, 96, 111, 0, 32, 39, 0, 0, 55, 0, -32, 19, 0, -16, 23, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -16, 3, 0, -32, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 63, 0, -128, 62, 2, 64, 62, 1, 32, -65, 0, 0, 127, 0, -8, 39, 0, -4, 17, 0, -4, 9, 0, -4, 5, 0, -4, 1, 0, -4, 1, 0, -8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, -64, 0, 0, 56, 0, 0, 30, 0, -128, -7, 0, 0, -4, 0, -8, 126, 8, -4, 127, 6, -4, -17, 1, -4, 97, 0, -4, 25, 0, -4, 5, 0, -8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, -1, 7, 124, 48, 0, -2, 126, 0, -2, -1, 0, -2, -1, 0, -2, 126, 0, 124, 48, 0, 56, -1, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 0, 0, -4, 4, 0, -4, 25, 0, -4, -31, 0, -4, -1, 3, -4, 127, 12, -8, -2, 0, 0, -4, 0, -128, -7, 0, 0, 30, 0, 0, 48, 0, 0, -64, 1, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -16, 0, 0, -8, 1, 0, -4, 1, 0, -4, 5, 0, -4, 9, 0, -4, 17, 0, -8, 39, 0, 0, 127, 0, 32, -65, 0, 64, 62, 1, -128, 62, 2, 0, 63, 4, 0, 2, 0, 0, 4, 0, 0, 8, 0, 0, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, -32, 1, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -16, 7, 0, -16, 23, 0, -32, 19, 0, -128, 55, 0, 32, 39, 0, 96, 111, 0, 64, 126, 0, -64, 94, 0, -128, -33, 0, -128, -103, 0, 0, -127, 1, 0, 3, 1, 0, 2, 0, 0, 2])]);
  kli_battleship_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 10, 0, 0, 27, 0, 0, 27, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 14, 0, 0, 14, 0, 32, -97, 0, -96, -65, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, 32, -97, 0, 32, -124, 0, 32, -124, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 48, 0, 0, -72, 0, 0, -40, 0, 0, -4, 0, 0, 124, 0, 64, 124, 0, 64, 60, 0, 96, 31, 0, -32, 31, 0, -32, -97, 0, -16, -65, 0, -112, -1, 0, 8, 127, 0, 0, 115, 0, 0, 33, 0, -128, 32, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -32, 2, 0, 112, 3, -128, -8, 3, 64, -8, 1, -32, -1, 0, -16, 127, 0, -56, 31, 0, -60, 31, 0, -64, 31, 0, -128, 95, 0, 64, 63, 0, 32, 24, 0, 0, 8, 0, 0, 4, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -125, 3, -32, -32, 1, -8, -15, 4, -20, -1, 7, -64, -1, 3, -32, -1, 0, -32, 31, 0, -16, 15, 0, -56, 7, 0, 0, 63, 0, 0, 15, 0, -128, 3, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -8, 7, 0, -64, 1, 0, -64, 3, 0, -32, -25, 3, -32, -1, 7, -4, -1, 0, -32, -1, 7, -32, -25, 3, -64, 3, 0, -64, 1, 0, -8, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, -128, 3, 0, 0, 15, 0, 0, 63, 0, -56, 7, 0, -16, 15, 0, -32, 31, 0, -32, -1, 0, -64, -1, 3, -20, -1, 7, -8, -15, 4, -32, -32, 1, -128, -125, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 0, 8, 0, 32, 24, 0, 64, 63, 0, -128, 95, 0, -64, 31, 0, -60, 31, 0, -56, 31, 0, -16, 127, 0, -32, -1, 0, 64, -8, 1, -128, -8, 3, 0, 112, 3, 0, -32, 2, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 32, 0, -128, 32, 0, 0, 33, 0, 0, 115, 0, 8, 127, 0, -112, -1, 0, -16, -65, 0, -32, -97, 0, -32, 31, 0, 96, 31, 0, 64, 60, 0, 64, 124, 0, 0, 124, 0, 0, -4, 0, 0, -40, 0, 0, -72, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, 32, -124, 0, 32, -124, 0, 32, -97, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -96, -65, 0, 32, -97, 0, 0, 14, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 27, 0, 0, 27, 0, 0, 10]),
$ta(Int8Array, 60, [0, 0, 0, -128, 0, 0, -128, 32, 0, -128, 16, 0, -64, 25, 0, -64, 31, 2, -32, 63, 1, -96, -1, 1, 32, -1, 0, 0, -1, 0, 0, -33, 0, -128, 71, 0, -64, 71, 0, -64, 7, 0, -32, 7, 0, 96, 3, 0, -96, 3, 0, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, -125, 0, -128, 95, 0, 64, 63, 0, 0, 127, 0, 0, 127, 4, 0, 127, 2, -64, -1, 1, -32, -1, 0, -16, 67, 0, -8, 35, 0, -40, 1, 0, -24, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 56, 0, 0, 30, 0, -128, 31, 0, 0, 124, 2, 0, -2, 1, 0, -1, 0, -32, -1, 0, -8, 127, 0, -4, -1, 6, -28, -15, 3, -16, -32, 0, 56, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 1, 0, 56, 0, 0, 60, 0, 124, 126, 0, -2, 127, 0, -16, -1, 3, -2, 127, 0, 124, 126, 0, 0, 60, 0, 0, 56, 0, 0, -2, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 0, -16, -32, 0, -28, -15, 3, -4, -1, 6, -8, 127, 0, -32, -1, 0, 0, -1, 0, 0, -2, 1, 0, 124, 2, -128, 31, 0, 0, 30, 0, 0, 56, 0, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 112, 0, 0, -24, 0, 0, -40, 1, 0, -8, 35, 0, -16, 67, 0, -32, -1, 0, -64, -1, 1, 0, 127, 2, 0, 127, 4, 0, 127, 0, 64, 63, 0, -128, 95, 0, 0, -125, 0, 0, 2, 0, 0, 4, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, -128, 1, 0, -96, 3, 0, 96, 3, 0, -32, 7, 0, -64, 7, 0, -64, 71, 0, -128, 71, 0, 0, -33, 0, 0, -1, 0, 32, -1, 0, -96, -1, 1, -32, 63, 1, -64, 31, 2, -64, 25, 0, -128, 16, 0, -128, 32, 0, -128])]);
  rom_battleship_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 8, 15, 1, -120, 31, 1, -56, 63, 1, -24, 127, 1, -24, 127, 1, -8, -1, 1, -8, -1, 1, 56, -49, 1, 8, 6, 1, 72, 47, 1, -64, 63, 0, -64, 63, 0, 64, 38, 0, 64, 32, 0, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 32, 0, 0, 16, 0, 0, 16, 15, 0, -40, 31, 0, -24, 63, 0, -8, 63, 2, -4, 63, 1, -36, 63, 1, -126, -65, 1, -112, -1, 0, -48, -13, 0, -8, 97, 0, -24, 75, 0, -56, 39, 0, -124, 4, 0, 4, 4, 0, 0, 2, 0, 0, 2]),
$ta(Int8Array, 60, [0, 4, 0, 0, 2, 0, 0, 1, 0, -128, 0, 0, -64, 63, 0, -32, 127, 0, -16, -1, 0, 8, -1, 0, 0, -1, 0, 32, -1, 8, -112, -1, 4, -8, -1, 2, -28, -29, 1, -30, -31, 0, -64, 101, 0, 0, 35, 0, 0, 17, 0, -128, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 56, 0, 0, 14, 0, -128, 3, 0, -32, 127, 0, 0, -1, 0, 64, -2, 1, 112, -4, 1, 124, -2, 1, -26, -1, 1, -32, -1, 1, -32, -7, 0, -64, 113, 4, -128, 115, 7, -64, -16, 1, 48, 56, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 3, 0, 28, 0, 0, 124, 0, -4, -7, 0, -64, -8, 1, -64, -3, 3, -32, -1, 3, -32, -1, 3, -64, -3, 3, -64, -8, 1, -4, -7, 0, 0, 124, 0, 0, 28, 0, 0, -1, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 12, 0, 48, 56, 0, -64, -16, 1, -128, 115, 7, -64, 113, 4, -32, -7, 0, -32, -1, 1, -26, -1, 1, 124, -2, 1, 112, -4, 1, 64, -2, 1, 0, -1, 0, -32, 127, 0, -128, 3, 0, 0, 14, 0, 0, 56, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, -128, 0, 0, 0, 17, 0, 0, 35, 0, -64, 101, 0, -30, -31, 0, -28, -29, 1, -8, -1, 2, -112, -1, 4, 32, -1, 8, 0, -1, 0, 8, -1, 0, -16, -1, 0, -32, 127, 0, -64, 63, 0, -128, 0, 0, 0, 1, 0, 0, 2, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, 0, 4, 0, 8, 8, 0, 8, 9, 0, -112, 79, 0, -48, -105, 0, -16, -61, 0, -96, -25, 1, 32, -1, 1, 4, 127, 3, -72, 127, 2, -8, 127, 2, -16, 127, 4, -48, 127, 0, -80, 63, 0, 32, 30, 0, 32, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 38, 0, -64, 63, 0, -64, 63, 0, 72, 47, 1, 8, 6, 1, 56, -49, 1, -8, -1, 1, -8, -1, 1, -24, 127, 1, -24, 127, 1, -56, 63, 1, -120, 31, 1, 8, 15, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 1, 1, 0, 9, 1, 32, -97, 0, -112, -66, 0, 48, -4, 0, 120, 94, 0, -8, 79, 0, -20, 15, 2, -28, -33, 1, -28, -1, 1, -30, -1, 0, -32, -65, 0, -64, -33, 0, -128, 71, 0, 0, 64, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 16, 0, -128, 8, 0, 64, 12, 0, 96, 58, 0, 112, 120, 4, 120, 124, 2, -12, -1, 1, -14, -97, 0, -15, 79, 0, -16, 15, 0, -16, 15, 1, -16, -1, 0, -32, 127, 0, -64, 63, 0, 0, 16, 0, 0, 8, 0, 0, 4, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 3, 0, -64, -63, 0, -8, 48, 0, -18, 28, 0, -30, 56, 0, -16, 121, 0, -8, 127, 0, -8, 127, 6, -8, -25, 3, -8, -29, 0, -8, 39, 0, -16, 15, 0, -32, 127, 0, 0, 28, 0, 0, 7, 0, -64, 1, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 15, 0, -128, 3, 0, -32, 3, 0, -16, -7, 3, -8, 49, 0, -4, 59, 0, -4, 127, 0, -4, 127, 0, -4, 59, 0, -8, 49, 0, -16, -7, 3, -32, 3, 0, -128, 3, 0, -4, 15]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, -64, 1, 0, 0, 7, 0, 0, 28, 0, -32, 127, 0, -16, 15, 0, -8, 39, 0, -8, -29, 0, -8, -25, 3, -8, 127, 6, -8, 127, 0, -16, 121, 0, -30, 56, 0, -18, 28, 0, -8, 48, 0, -64, -63, 0, 0, 3]),
$ta(Int8Array, 60, [0, 2, 0, 0, 4, 0, 0, 8, 0, 0, 16, 0, -64, 63, 0, -32, 127, 0, -16, -1, 0, -16, 15, 1, -16, 15, 0, -15, 79, 0, -14, -97, 0, -12, -1, 1, 120, 124, 2, 112, 120, 4, 96, 58, 0, 64, 12, 0, -128, 8, 0, 0, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 64, 0, 0, -128, 0, 0, -113, 0, -128, -65, 1, -64, 127, 1, -60, -1, 1, -56, -1, 3, -56, -65, 3, -40, 31, 4, -16, -97, 0, -16, -68, 0, 96, -8, 1, 32, 125, 1, 64, 62, 1, 0, 18, 2, 0, 2, 2, 0, 4, 0, 0, 4])]);
  ori_battleship_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 64, 95, 0, 64, 95, 0, 64, 78, 0, 64, 78, 0, 64, 78, 0, -64, 110, 0, -64, 127, 0, -64, 127, 0, -64, 127, 0, -64, 127, 0, -64, 110, 0, -64, 110]),
$ta(Int8Array, 60, [0, 0, 0, 0, 112, 0, 0, -8, 0, 0, -8, 0, 0, -4, 0, 0, 125, 0, -128, 124, 0, -128, 62, 0, -64, -66, 0, 64, -98, 0, 96, 78, 0, 96, 79, 0, -16, 103, 0, -16, 55, 0, -8, 63, 0, -40, 31, 0, -48, 31, 0, -128, 29, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -14, 1, 0, -7, 1, -128, -4, 1, 64, -2, 0, 32, 126, 0, 48, 63, 0, -72, -97, 0, -4, 71, 0, -2, 35, 0, -16, 17, 0, -8, 15, 0, -16, 7, 0, -96, 3, 0, -128, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -114, 1, -128, -29, 7, -32, -4, 7, 120, -4, 7, 126, -1, 7, -2, -1, 0, -8, 63, 0, -4, 65, 0, -4, 112, 0, -4, 31, 0, -16, 3, 0, 120, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 31, 0, -2, 0, 0, 120, -8, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, 120, -8, 3, -2, 0, 0, -2, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 120, 0, 0, -16, 3, 0, -4, 31, 0, -4, 112, 0, -4, 65, 0, -8, 63, 0, -2, -1, 0, 126, -1, 7, 120, -4, 7, -32, -4, 7, -128, -29, 7, 0, -114, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 1, 0, -96, 3, 0, -16, 7, 0, -8, 15, 0, -16, 17, 0, -2, 35, 0, -4, 71, 0, -72, -97, 0, 48, 63, 0, 32, 126, 0, 64, -2, 0, -128, -4, 1, 0, -7, 1, 0, -14, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 12, 0, -128, 29, 0, -48, 31, 0, -40, 31, 0, -8, 63, 0, -16, 55, 0, -16, 103, 0, 96, 79, 0, 96, 78, 0, 64, -98, 0, -64, -66, 0, -128, 62, 0, -128, 124, 0, 0, 125, 0, 0, -4, 0, 0, -8, 0, 0, -8, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, -64, 110, 0, -64, 110, 0, -64, 127, 0, -64, 127, 0, -64, 127, 0, -64, 127, 0, -64, 110, 0, 64, 78, 0, 64, 78, 0, 64, 78, 0, 64, 95, 0, 64, 95, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 6, 0, 0, 55, 0, 0, 127, 1, 0, 127, 3, -128, -1, 3, -128, -3, 1, -64, -4, 1, 64, -34, 0, 64, -50, 0, 32, 79, 0, -96, 111, 0, -128, 47, 0, -64, 39, 0, -64, 23, 0, -32, 7, 0, -32, 3, 0, -32, 3, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 24, 0, 0, 92, 0, 0, -2, 0, 0, -1, 1, -128, -8, 0, 64, -4, 7, 32, -2, 3, -112, -33, 1, -64, -49, 0, -32, 71, 0, -16, 39, 0, -8, 19, 0, -8, 9, 0, -8, 4, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -32, 1, 0, -4, 0, -128, -1, 3, -32, -16, 3, 32, -8, 3, -64, -1, 1, -16, -1, 7, -2, -17, 7, -2, -29, 1, -2, 115, 0, 126, 28, 0, 24, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -1, 7, 0, -16, 7, -4, -31, 1, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -31, 1, 0, -16, 7, -128, -1, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 7, 0, 126, 28, 0, -2, 115, 0, -2, -29, 1, -2, -17, 7, -16, -1, 7, -64, -1, 1, 32, -8, 3, -32, -16, 3, -128, -1, 3, 0, -4, 0, 0, -32, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 112, 0, 0, -8, 4, 0, -8, 9, 0, -8, 19, 0, -16, 39, 0, -32, 71, 0, -64, -49, 0, -112, -33, 1, 32, -2, 3, 64, -4, 7, -128, -8, 0, 0, -1, 1, 0, -2, 0, 0, 92, 0, 0, 24, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, -64, 1, 0, -32, 3, 0, -32, 3, 0, -32, 7, 0, -64, 23, 0, -64, 39, 0, -128, 47, 0, -96, 111, 0, 32, 79, 0, 64, -50, 0, 64, -34, 0, -64, -4, 1, -128, -3, 1, -128, -1, 3, 0, 127, 3, 0, 127, 1, 0, 55, 0, 0, 6])]);
  fed_starbase_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2]),
$ta(Int8Array, 60, [0, 0, 0, 2, 0, 1, -124, 15, 3, 104, -14, 0, 16, -14, 0, 104, -14, 0, -24, -1, 0, -60, 31, 1, -60, 31, 1, -4, -1, 1, -60, 31, 1, -60, 31, 1, -8, -65, 0, 120, -78, 0, 120, 66, 0, 120, -78, 2, -122, 15, 1, 4, -128, 2])]);
  kli_starbase_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 68, 41, 2, -26, 112, 6, -28, 121, 2, -4, -1, 3, -2, -1, 7, -2, -1, 7, -2, -1, 7, -4, -1, 3, -28, 121, 2, -26, 112, 6, 68, 41, 2, 64, 32, 0, 64, 32])]);
  rom_starbase_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -64, 79, 0, 96, -60, 0, -16, -59, 1, -48, 47, 0, -48, 29, 0, -104, 62, 3, -8, -1, 3, -104, 47, 3, 0, 119, 1, -128, 126, 1, 80, -12, 1, 48, -60, 0, 96, 126, 0, 0, 14])]);
  ori_starbase_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 24, -128, 1, 28, -128, 3, -68, -48, 3, 112, -32, 0, -16, 121, 0, -56, 63, 0, -44, 55, 0, -126, 29, 0, -128, 27, 0, -64, 62, 1, -64, -65, 0, -24, 121, 0, -16, -32, 0, 60, -63, 3, 28, -96, 3, 24, -128, 1])]);
  rom_assault_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 14, 0, 0, 31, 0, -128, 63, 0, -96, -65, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, 96, -50, 0, 32, -97, 0, 32, -97, 0, 32, -97, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 27, 0, 0, 17]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 62, 0, 64, 127, 0, -32, 127, 0, -32, 127, 0, -16, 127, 1, 112, -1, 0, 24, -1, 0, -120, 119, 0, -128, 119, 0, -64, 39, 0, -32, 35, 0, -32, 19, 0, 16, 3, 0, 0, 1, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, -7, 0, -128, -1, 1, -64, -1, 1, -32, -1, 1, -16, -1, 1, 8, -2, 0, -128, -1, 2, -64, -1, 1, -64, -9, 0, -16, 119, 0, -8, 51, 0, -4, 16, 0, -32, 8, 0, 96, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, -50, 0, -128, -1, 1, -32, -1, 3, 0, -2, 3, -128, -3, 3, -64, -1, 3, -8, -1, 1, -2, -5, 0, -16, -5, 1, 112, 120, 0, 56, 28, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -1, 0, 0, 124, 0, 0, -8, 1, -68, -5, 3, -8, -1, 7, -16, -1, 7, -8, -1, 7, -68, -5, 3, 0, -8, 1, 0, 124, 0, -128, -1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 56, 28, 0, 112, 120, 0, -16, -5, 1, -2, -5, 0, -8, -1, 1, -64, -1, 3, -128, -3, 3, 0, -2, 3, -32, -1, 3, -128, -1, 1, 0, -50, 0, 0, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 32, 0, 0, 96, 0, 0, -32, 8, 0, -4, 16, 0, -8, 51, 0, -16, 119, 0, -64, -9, 0, -64, -1, 1, -128, -1, 2, 8, -2, 0, -16, -1, 1, -32, -1, 1, -64, -1, 1, -128, -1, 1, 0, -7, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 16, 3, 0, -32, 19, 0, -32, 35, 0, -64, 39, 0, -128, 119, 0, -120, 119, 0, 24, -1, 0, 112, -1, 0, -16, 127, 1, -32, 127, 0, -32, 127, 0, 64, 127, 0, 64, 62]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 27, 0, 0, 31, 0, 0, 31, 0, 0, 14, 0, 32, -97, 0, 32, -97, 0, 32, -97, 0, 96, -50, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -96, -65, 0, -128, 63, 0, 0, 31, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 8, 0, 0, -116, 0, -128, 124, 0, 64, 124, 0, 64, 62, 0, -32, 30, 0, -32, 30, 1, -16, -113, 1, -16, -17, 0, -24, -1, 0, -32, 127, 0, -32, 127, 0, -32, 47, 0, -64, 39]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 96, 0, 0, 113, 0, -128, -16, 3, -64, -4, 1, -32, -2, 0, -16, 62, 0, -8, 63, 0, -12, 31, 0, -16, 7, 1, -8, -1, 0, -8, 127, 0, -8, 63, 0, -8, 31, 0, -16, 9, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, -128, -61, 1, -32, -31, 0, -8, -3, 0, -16, -3, 7, -8, -1, 1, -4, 63, 0, -4, 27, 0, -4, 7, 0, -4, 127, 0, -8, 31, 0, 48, 7, 0, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 31, 0, -32, 3, 0, -8, 1, 0, -4, -35, 3, -2, -1, 1, -2, -1, 0, -2, -1, 1, -4, -35, 3, -8, 1, 0, -32, 3, 0, -16, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 48, 7, 0, -8, 31, 0, -4, 127, 0, -4, 7, 0, -4, 27, 0, -4, 63, 0, -8, -1, 1, -16, -3, 7, -8, -3, 0, -32, -31, 0, -128, -61, 1, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, -16, 9, 0, -8, 31, 0, -8, 63, 0, -8, 127, 0, -8, -1, 0, -16, 7, 1, -12, 31, 0, -8, 63, 0, -16, 62, 0, -32, -2, 0, -64, -4, 1, -128, -16, 3, 0, 113, 0, 0, 96, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 39, 0, -32, 47, 0, -32, 127, 0, -32, 127, 0, -24, -1, 0, -16, -17, 0, -16, -113, 1, -32, 30, 1, -32, 30, 0, 64, 62, 0, 64, 124, 0, -128, 124, 0, 0, -116, 0, 0, 8, 0, 0, 8])]);
  ori_assault_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, 112, -17, 0, 48, -49, 0, 48, -58]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 120, 0, 0, 120, 0, 0, 60, 0, 0, 60, 0, 0, 60, 0, -128, 30, 0, -32, 31, 0, -16, 31, 0, -8, 63, 0, -8, 63, 0, -100, 127, 0, -52, 127, 0, -64, 115, 0, -128, 59, 0, 0, 56, 0, 0, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -32, 1, 0, -16, 1, -64, -15, 0, -16, 127, 0, -8, 31, 0, -4, 31, 0, -100, 31, 0, -56, 63, 0, -32, 63, 0, -32, 61, 0, -64, 28, 0, 0, 30, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, -128, 1, -8, -31, 3, -2, -5, 3, -2, -1, 3, -32, 127, 0, -16, 63, 0, -8, 7, 0, -8, 15, 0, -72, 15, 0, -128, 7, 0, -64, 3, 0, -32, 3, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 124, 0, 0, -4, 1, 0, -16, 3, 0, -32, 3, 0, -8, -73, 1, -4, -1, 3, -4, -1, 3, -8, -73, 1, -32, 3, 0, -16, 3, 0, -4, 1, 0, 124]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -32, 0, 0, -32, 3, 0, -64, 3, 0, -128, 7, 0, -72, 15, 0, -8, 15, 0, -8, 7, 0, -16, 63, 0, -32, 127, 0, -2, -1, 3, -2, -5, 3, -8, -31, 3, 64, -128, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, 0, 30, 0, -64, 28, 0, -32, 61, 0, -32, 63, 0, -56, 63, 0, -100, 31, 0, -4, 31, 0, -8, 31, 0, -16, 127, 0, -64, -15, 0, 0, -16, 1, 0, -32, 1, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 24, 0, 0, 56, 0, -128, 59, 0, -64, 115, 0, -52, 127, 0, -100, 127, 0, -8, 63, 0, -8, 63, 0, -16, 31, 0, -32, 31, 0, -128, 30, 0, 0, 60, 0, 0, 60, 0, 0, 60, 0, 0, 120, 0, 0, 120, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 48, -58, 0, 48, -49, 0, 112, -17, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, -128, 1, 0, -64, 1, 0, -64, 29, 0, -32, 60, 0, -32, 63, 3, -32, -97, 3, -64, -1, 1, -64, -1, 1, -128, -1, 0, -128, 127, 0, -128, 23, 0, -64, 3, 0, -64, 3, 0, -64, 3, 0, -32, 1, 0, -32, 1, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, -128, 7, 0, -128, 51, 0, -64, 123, 0, -64, 127, 0, -64, 63, 1, -128, -97, 3, -128, -1, 3, -128, -1, 1, -32, -1, 0, -16, 56, 0, -8, 0, 0, 120, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, 124, 0, 0, 60, 0, 0, 30, 0, 0, -33, 1, 0, -1, 1, 0, -2, 1, -64, -1, 0, -32, 127, 0, -4, -1, 7, -4, -3, 7, 124, -8, 1, 24, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 3, 0, -8, 3, 0, -4, 0, 0, 124, 0, -40, -2, 1, -4, -1, 3, -4, -1, 3, -40, -2, 1, 0, 124, 0, 0, -4, 0, 0, -8, 3, 0, -32, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 32, 0, 124, -8, 1, -4, -3, 7, -4, -1, 7, -32, 127, 0, -64, -1, 0, 0, -2, 1, 0, -1, 1, 0, -33, 1, 0, 30, 0, 0, 60, 0, 0, 124, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 120, 0, 0, -8, 0, 0, -16, 56, 0, -32, -1, 0, -128, -1, 1, -128, -1, 3, -128, -97, 3, -64, 63, 1, -64, 127, 0, -64, 123, 0, -128, 51, 0, -128, 7, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 0, 0, -32, 1, 0, -32, 1, 0, -64, 3, 0, -64, 3, 0, -64, 3, 0, -128, 23, 0, -128, 127, 0, -128, -1, 0, -64, -1, 1, -64, -1, 1, -32, -97, 3, -32, 63, 3, -32, 60, 0, -64, 29, 0, -64, 1, 0, -128, 1])]);
  kli_assault_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 14, 0, 32, -97, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, 32, -97, 0, 32, -97, 0, 32, -114, 0, 32, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 120, 0, 0, -8, 0, 0, 124, 0, 0, 124, 0, 0, 124, 0, 64, 62, 0, 96, 62, 0, -32, 31, 0, -32, -97, 0, -16, -1, 0, -112, -1, 0, -120, 127, 0, -120, 103, 0, -128, 35, 0, 0, 32, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -64, 3, 0, -16, 3, -128, -8, 3, -64, -8, 0, -32, -1, 0, -16, 127, 0, -56, 31, 0, -60, 31, 0, -32, 31, 0, -32, 127, 0, -32, 63, 0, -64, 25, 0, 0, 8, 0, 0, 4, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -127, 3, -32, -95, 7, -8, -7, 7, -26, -1, 7, -64, -1, 6, -16, -1, 0, -8, 63, 0, -16, 7, 0, -16, 15, 0, 96, 31, 0, 0, 15, 0, -128, 3, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 7, 0, -64, 3, 0, -64, 3, 0, -16, 119, 3, -8, -1, 7, -8, -1, 7, -8, -1, 7, -16, 119, 3, -64, 3, 0, -64, 3, 0, -4, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, -128, 3, 0, 0, 15, 0, 96, 31, 0, -16, 15, 0, -16, 7, 0, -8, 63, 0, -16, -1, 0, -64, -1, 6, -26, -1, 7, -8, -7, 7, -32, -95, 7, -128, -127, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 4, 0, -32, 12, 0, -16, 31, 0, -16, 63, 0, -16, 15, 0, -30, 15, 0, -28, 15, 0, -8, 63, 0, -16, 127, 0, 96, 124, 0, 64, -4, 1, 0, -8, 1, 0, -32, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 32, 0, -128, 35, 0, -120, 103, 0, -120, 127, 0, -112, -1, 0, -16, -1, 0, -32, -97, 0, -32, 31, 0, 96, 62, 0, 64, 62, 0, 0, 124, 0, 0, 124, 0, 0, 124, 0, 0, -8, 0, 0, 120]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 32, -128, 0, 32, -114, 0, 32, -97, 0, 32, -97, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, -32, -1, 0, 32, -97, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 0, 0, -128, 56, 0, -64, 60, 2, -64, 63, 2, -32, 63, 1, -32, -1, 1, 32, -1, 0, 0, -1, 0, -128, -49, 0, -128, 79, 0, -64, 7, 0, -64, 7, 0, -64, 7, 0, -32, 3, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 115, 0, -128, -1, 0, -64, -1, 0, 0, -1, 0, 0, 127, 4, 0, 127, 2, -64, -1, 1, -32, -1, 0, -32, 99, 0, -8, 35, 0, -8, 1, 0, 120, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 28, 0, 0, 15, 0, -128, 111, 0, 0, -1, 0, 0, -2, 0, -64, -1, 1, -16, -1, 0, -10, 63, 0, -2, 127, 6, -2, -7, 1, 94, 120, 0, 28, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 3, 0, 60, 0, 0, 60, 0, -20, -2, 0, -2, -1, 1, -2, -1, 1, -2, -1, 1, -20, -2, 0, 0, 60, 0, 0, 60, 0, 0, -2, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 48, 0, -68, -16, 0, -4, -13, 3, -4, -1, 12, -20, 127, 0, -32, -1, 1, -128, -1, 3, 0, -4, 1, 0, -2, 1, 0, -33, 0, 0, 30, 0, 0, 56, 0, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, 120, 0, 0, -8, 1, 0, -8, 35, 0, -32, 99, 0, -32, -1, 0, -64, -1, 1, 0, 127, 2, 0, 127, 4, 0, -1, 0, -64, -1, 0, -128, -1, 0, 0, 115, 0, 0, 2, 0, 0, 4, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 3, 0, -32, 3, 0, -64, 7, 0, -64, 7, 0, -64, 7, 0, -128, 79, 0, -128, -49, 0, 0, -1, 0, 32, -1, 0, -32, -1, 1, -32, 63, 1, -64, 63, 2, -64, 60, 2, -128, 56, 0, -128, 0, 0, -128])]);
  fed_assault_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, -96, 95, 0, -32, 127, 0, 96, 111, 0, 32, 70, 0, 32, 79, 0, 32, 79, 0, 32, 70, 0, 32, 79, 0, 32, 79, 0, 32, 70]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 126, 0, 0, -1, 0, 0, -1, 0, 64, -1, 0, 64, -2, 0, -64, 127, 0, 32, 31, 0, 32, -65, 0, 16, 103, 0, -112, 71, 0, -104, 39, 0, -120, 35, 0, -64, 19, 0, -128, 17, 0, 0, 16, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 120, 0, 0, -4, 0, 0, -3, 1, -128, -4, 1, -64, -1, 1, 32, -2, 1, 16, -2, 0, -120, 31, 0, -124, 83, 0, -32, 51, 0, -32, 16, 0, -32, 8, 0, 0, 4, 0, 0, 2, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -28, 0, 0, -13, 1, -32, -1, 3, 120, -4, 3, 12, -2, 3, -64, -1, 3, -16, -1, 1, -16, 63, 0, -8, 17, 0, 48, 56, 0, 0, 14, 0, -64, 3, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 15, 0, 0, -26, 0, 0, -4, 1, -40, -2, 3, -4, -1, 3, -4, -1, 3, -40, -2, 3, 0, -4, 1, 0, -26, 0, -4, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, -64, 3, 0, 0, 14, 0, 48, 56, 0, -8, 17, 0, -16, 63, 0, -16, -1, 1, -64, -1, 3, 12, -2, 3, 120, -4, 3, -32, -1, 3, 0, -13, 1, 0, -28]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 4, 0, -32, 8, 0, -32, 16, 0, -32, 51, 0, -124, 83, 0, -120, 31, 0, 16, -2, 0, 32, -2, 1, -64, -1, 1, -128, -4, 1, 0, -3, 1, 0, -4, 0, 0, 120]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 16, 0, -128, 17, 0, -64, 19, 0, -120, 35, 0, -104, 39, 0, -112, 71, 0, 16, 103, 0, 32, -65, 0, 32, 31, 0, -64, 127, 0, 64, -2, 0, 64, -1, 0, 0, -1, 0, 0, -1, 0, 0, 126, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 32, 70, 0, 32, 79, 0, 32, 79, 0, 32, 70, 0, 32, 79, 0, 32, 79, 0, 32, 70, 0, 96, 111, 0, -32, 127, 0, -96, 95, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 1, 0, -128, 0, 0, -128, 24, 0, -128, 60, 0, 64, 28, 1, 64, -98, 1, 32, -98, 0, 96, -114, 0, -48, 79, 0, -128, 79, 0, -32, 63, 0, -16, 39, 0, -16, 47, 0, -16, 15, 0, -16, 15, 0, -32, 7, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 113, 0, -128, 112, 0, -64, 124, 0, -96, 28, 2, -128, 31, 1, -16, -121, 0, -8, 71, 0, -8, 63, 0, -8, 19, 0, -8, 11, 0, -16, 3, 0, -32, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, 120, 0, 0, 14, 0, -128, -125, 1, 0, -15, 3, -128, -1, 1, -16, -1, 1, -8, 127, 0, -8, 15, 6, -8, -57, 3, -8, -1, 0, -16, 25, 0, -32, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 3, 112, 6, 0, -8, 3, 0, -4, -73, 1, -4, -1, 3, -4, -1, 3, -4, -73, 1, -8, 3, 0, 112, 6, 0, 0, -1, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 4, 0, -16, 25, 0, -8, -1, 0, -8, -57, 3, -8, 15, 6, -8, 127, 0, -16, -1, 1, -128, -1, 1, 0, -15, 3, -128, -125, 1, 0, 14, 0, 0, 120, 0, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 1, 0, -16, 3, 0, -8, 11, 0, -8, 19, 0, -8, 63, 0, -8, 71, 0, -16, -121, 0, -128, 31, 1, -96, 28, 2, -64, 124, 0, -128, 112, 0, 0, 113, 0, 0, 2, 0, 0, 4, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 3, 0, -32, 7, 0, -16, 15, 0, -16, 15, 0, -16, 47, 0, -16, 39, 0, -32, 63, 0, -128, 79, 0, -48, 79, 0, 96, -114, 0, 32, -98, 0, 64, -98, 1, 64, 28, 1, -128, 60, 0, -128, 24, 0, -128, 0, 0, 0, 1])]);
  kli_destroyer_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 16, 31, 1, -112, 63, 1, -16, -1, 1, -16, -1, 1, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 112, 0, 0, 112, 0, 0, 48, 0, 0, 16, 0, 0, 16, 0, 16, 8, 0, 16, 14, 0, 8, 15, 0, -8, 15, 0, -8, 15, 0, -32, 31, 1, -128, -97, 0, 0, -1, 0, 0, 120]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -64, 1, 0, -64, 1, 16, 32, 0, 8, 16, 0, 12, 14, 0, -4, 15, 0, -8, 15, 0, -16, 7, 0, -32, 7, 0, -32, 7, 0, -64, 7, 0, 0, 39, 0, 0, 30, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 28, -128, 1, 24, -64, 3, 56, -16, 1, -8, 29, 0, -8, 7, 0, -16, 3, 0, -16, 3, 0, -32, 1, 0, -32, 1, 0, -64, 1, 0, -64, 5, 0, -128, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 0, 0, 48, 0, 0, 48, 0, 0, 112, 0, 0, -16, 0, 0, -8, -121, 1, -8, -1, 3, -8, -121, 1, -16, 0, 0, 112, 0, 0, 48, 0, 0, 48, 0, 0, -16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 3, 0, -64, 5, 0, -64, 1, 0, -32, 1, 0, -32, 1, 0, -16, 3, 0, -16, 3, 0, -8, 7, 0, -8, 29, 0, 56, -16, 1, 24, -64, 3, 28, -128, 1, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 30, 0, 0, 39, 0, -64, 7, 0, -32, 7, 0, -32, 7, 0, -16, 7, 0, -8, 15, 0, -4, 15, 0, 12, 14, 0, 8, 16, 0, 16, 32, 0, 0, -64, 1, 0, -64, 1, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 0, -128, 127, 0, -64, 79, 0, -16, -113, 0, -4, 7, 0, -4, 7, 0, -124, 7, 0, 8, 7, 0, 8, 4, 0, 0, 8, 0, 0, 8, 0, 0, 24, 0, 0, 56, 0, 0, 56, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, -16, -1, 1, -16, -1, 1, -112, 63, 1, 16, 31, 1, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 3, 0, -32, 31, 0, 32, 63, 0, 16, -1, 0, 0, -2, 3, 0, -2, 3, 0, 30, 2, 0, 14, 1, 0, 2, 1, 0, 1, 0, 0, 1, 0, -128, 1, 0, -64, 1, 0, -64, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 3, 0, -128, 7, 0, 64, 14, 0, 0, 62, 0, 0, 126, 0, 0, 126, 0, 0, -2, 0, 0, -1, 1, 0, -1, 3, 0, 7, 3, -128, 0, 1, 64, -128, 0, 56, 0, 0, 56, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 58, 0, 0, 56, 0, 0, 120, 0, 0, 120, 0, 0, -4, 0, 0, -4, 0, 0, -2, 1, -128, -5, 1, -8, -64, 1, 60, -128, 1, 24, -128, 3, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 0, 0, -64, 0, 0, -64, 0, 0, -32, 0, 0, -16, 0, 24, -2, 1, -4, -1, 1, 24, -2, 1, 0, -16, 0, 0, -32, 0, 0, -64, 0, 0, -64, 0, 0, -16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 48, 0, 7, 120, 0, 3, -16, -127, 3, 0, -9, 3, 0, -4, 3, 0, -8, 1, 0, -8, 1, 0, -16, 0, 0, -16, 0, 0, 112, 0, 0, 116, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 56, 0, 0, 56, 0, 0, 64, -128, 0, -128, 0, 1, 0, 7, 3, 0, -1, 3, 0, -1, 1, 0, -2, 0, 0, 126, 0, 0, 126, 0, 0, 62, 0, 64, 14, 0, -128, 7, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -64, 1, 0, -64, 1, 0, -128, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 1, 0, 14, 1, 0, 30, 2, 0, -2, 3, 0, -2, 3, 16, -1, 0, 32, 63, 0, -32, 31, 0, -64, 3])]);
  ori_destroyer_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 6, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 64, 38, 0, -64, 54, 0, -32, 127, 0, -16, -1, 0, -16, -10, 0, 112, -26, 0, 48, -64, 0, 48, -64, 0, 48, -64, 0, 16, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 56, 0, 0, 60, 0, 0, 60, 0, 0, 62, 0, -128, 30, 0, -128, 30, 0, -16, 14, 0, -16, 39, 0, -8, 63, 0, 56, 127, 0, 28, 115, 0, 12, 112, 0, 4, 112, 0, 0, 48, 0, 0, 48, 0, 0, 16, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -32, 1, 0, -16, 1, -32, -7, 0, -16, 121, 0, -8, 63, 0, -4, 15, 0, 14, 15, 0, -126, 63, 0, 0, 61, 0, 0, 60, 0, 0, 60, 0, 0, 28, 0, 0, 14, 0, 0, 6, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -16, -57, 7, -4, -13, 3, -98, -13, 3, 0, -1, 1, -128, 95, 0, -128, 15, 0, 0, 60, 0, 0, 28, 0, 0, 30, 0, 0, 15, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 1, 0, -8, 3, 0, -64, 15, 0, -128, 7, 0, 0, -13, 1, -64, -1, 7, -64, -1, 7, 0, -13, 1, -128, 7, 0, -64, 15, 0, -8, 3, 0, -4, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 3, 0, 0, 15, 0, 0, 30, 0, 0, 28, 0, 0, 60, 0, -128, 15, 0, -128, 95, 0, 0, -1, 1, -98, -13, 3, -4, -13, 3, -16, -57, 7, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 3, 0, 0, 6, 0, 0, 14, 0, 0, 28, 0, 0, 60, 0, 0, 60, 0, 0, 61, 0, -126, 63, 0, 14, 15, 0, -4, 15, 0, -8, 63, 0, -16, 121, 0, -32, -7, 0, 0, -16, 1, 0, -32, 1, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 32, 0, 0, 96, 0, 0, 96, 0, 8, -32, 0, 24, -32, 0, 56, -26, 0, 112, -2, 0, -16, 127, 0, -32, 79, 0, -32, 29, 0, 0, 61, 0, 0, 61, 0, 0, 124, 0, 0, 120, 0, 0, 120, 0, 0, 112, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 16, -128, 0, 48, -64, 0, 48, -64, 0, 48, -64, 0, 112, -26, 0, -16, -10, 0, -16, -1, 0, -32, 127, 0, -64, 54, 0, 64, 38, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, 64, 0, 0, 96, 0, 0, 96, 0, 0, 112, 0, 1, 112, -128, 1, 112, -58, 1, -16, -25, 0, -32, -1, 0, 32, 127, 0, -128, 123, 0, -64, 11, 0, -64, 11, 0, -32, 3, 0, -32, 1, 0, -32, 1, 0, -32, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 12, 0, 0, 6, 0, 0, 7, 0, -128, 3, 0, -64, 3, 0, -64, 3, 0, -64, 11, 0, -64, 31, 4, 0, 15, 7, 0, -1, 3, -64, -1, 1, -32, -7, 0, -16, 121, 0, -8, 0, 0, 120, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 15, 0, -128, 7, 0, -128, 3, 0, -64, 3, 0, 0, 31, 0, -96, 31, 0, -8, 15, 0, -4, -100, 7, -4, -4, 3, 62, -2, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 7, 0, -8, 3, 0, 126, 0, 0, 60, 0, -16, 25, 0, -4, 127, 0, -4, 127, 0, -16, 25, 0, 0, 60, 0, 0, 126, 0, 0, -8, 3, 0, -16, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 62, -2, 0, -4, -4, 3, -4, -100, 7, -8, 15, 0, -96, 31, 0, 0, 31, 0, -64, 3, 0, -128, 3, 0, -128, 7, 0, 0, 15, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 120, 0, 0, -8, 0, 0, -16, 121, 0, -32, -7, 0, -64, -1, 1, 0, -1, 3, 0, 15, 7, -64, 31, 4, -64, 11, 0, -64, 3, 0, -64, 3, 0, -128, 3, 0, 0, 7, 0, 0, 6, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, -64, 1, 0, -64, 3, 0, -64, 3, 0, -64, 7, 0, -128, 23, 0, -128, 23, 0, 0, -9, 0, 64, -2, 0, -64, -1, 1, -32, -49, 1, -32, -116, 3, -32, 0, 3, -32, 0, 2, -64, 0, 0, -64, 0, 0, -128, 0, 0, -128])]);
  fed_destroyer_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15, 0, 64, 38, 0, -64, 63, 0, 64, 47, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 126, 0, 0, -1, 0, 0, -1, 0, 0, -2, 0, -128, -2, 0, -128, 60, 0, -64, 15, 0, 64, 111, 0, 32, 60, 0, 32, 32, 0, 32, 16, 0, 16, 16, 0, 16, 8, 0, 0, 8, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -8, 0, 0, -4, 1, 0, -4, 1, 0, -3, 1, -128, -3, 1, 64, -1, 1, 32, -1, 0, 16, 14, 0, 8, 60, 0, 4, 16, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -16, 1, 0, -5, 3, -32, -7, 3, 56, -5, 3, 14, -1, 3, 0, -10, 1, 0, -58, 0, 0, 28, 0, 0, 14, 0, -128, 1, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, -25, 0, 0, -14, 1, 0, -5, 3, 0, -1, 3, 0, -1, 3, 0, -5, 3, 0, -14, 1, -4, -25]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, -128, 1, 0, 0, 14, 0, 0, 28, 0, 0, -58, 0, 0, -10, 1, 14, -1, 3, 56, -5, 3, -32, -7, 3, 0, -5, 3, 0, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 1, 0, 0, 2, 0, 0, 4, 0, 0, 8, 0, 4, 16, 0, 8, 60, 0, 16, 14, 0, 32, -1, 0, 64, -1, 1, -128, -3, 1, 0, -3, 1, 0, -4, 1, 0, -4, 1, 0, -8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 8, 0, 16, 8, 0, 16, 16, 0, 32, 16, 0, 32, 32, 0, 32, 60, 0, 64, 111, 0, -64, 15, 0, -128, 60, 0, -128, -2, 0, 0, -2, 0, 0, -1, 0, 0, -1, 0, 0, 126, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 32, 0, 64, 47, 0, -64, 63, 0, 64, 38, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -64, 63, 0, -64, 63, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, -127, 0, -128, -128, 0, -128, 64, 0, 64, 64, 0, -64, 67, 0, 96, 47, 0, 0, 63, 0, -64, 19, 0, -16, 23, 0, -16, 7, 0, -16, 15, 0, -16, 15, 0, -32, 7, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 16, 0, 0, 8, 0, 0, 4, 0, 0, 2, 0, 0, 1, 4, -128, 7, 2, 0, 14, 1, -32, -97, 0, -16, 95, 0, -16, 55, 0, -16, 23, 0, -16, 7, 0, -16, 7, 0, -32, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 24, 0, 0, 7, 0, -128, 3, 0, 48, 6, 0, -8, 6, 0, -4, 15, 7, -4, -51, 1, -4, 121, 0, -4, 13, 0, -8, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, -2, 3, -8, 4, 0, -4, 13, 0, -4, 15, 0, -4, 15, 0, -4, 13, 0, -8, 4, 0, 112, -2, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, -8, 0, 0, -4, 13, 0, -4, 121, 0, -4, -51, 1, -4, 15, 7, -8, 6, 0, 48, 6, 0, -128, 3, 0, 0, 7, 0, 0, 24, 0, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 3, 0, -16, 7, 0, -16, 7, 0, -16, 23, 0, -16, 55, 0, -16, 95, 0, -32, -97, 0, 0, 14, 1, -128, 7, 2, 0, 1, 4, 0, 2, 0, 0, 4, 0, 0, 8, 0, 0, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 7, 0, -64, 15, 0, -32, 31, 0, -32, 31, 0, -32, 15, 0, -32, 47, 0, -128, 39, 0, 0, 126, 0, -64, 94, 0, -128, -121, 0, -128, -128, 0, 0, -127, 0, 0, 1, 1, 0, 2, 1, 0, 2, 0, 0, 2])]);
  rom_destroyer_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 4, 0, 0, 4, 0, 8, 4, 2, 8, 4, 2, 8, 4, 2, -8, -1, 3, -8, -1, 3, -56, 127, 2, 0, 31, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 10]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 56, 0, 16, 56, 0, 16, 8, 0, 8, 8, 0, 24, 4, 0, -4, 4, 0, -12, 7, 2, -32, 15, 2, -64, 63, 1, -128, -1, 1, -128, -1, 0, -64, -125, 0, -64, 1, 0, -32, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 32, -32, 0, 16, -32, 0, 56, -32, 0, 112, 16, 0, -32, 8, 0, -32, 7, 0, -64, 7, 0, -64, 7, 0, -32, 15, 0, -16, 31, 1, -8, -68, 0, 104, 112, 0, 48, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, -128, 3, 0, -32, 0, 0, -64, 0, 0, -64, -127, 7, -64, -127, 3, -64, -13, 3, -64, 31, 0, -32, 7, 0, -8, 7, 0, -2, 7, 0, 120, 15, 0, 12, 14, 0, 0, -100, 0, 0, 120, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 31, 0, 0, 3, 0, 0, 3, 0, -128, 3, 0, -128, 3, 0, -64, 3, 0, -2, -125, 3, -4, -1, 7, -2, -125, 3, -64, 3, 0, -128, 3, 0, -128, 3, 0, 0, 3, 0, 0, 3, 0, -64, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 120, 0, 0, -100, 0, 12, 14, 0, 120, 15, 0, -2, 7, 0, -8, 7, 0, -32, 7, 0, -64, 31, 0, -64, -13, 3, -64, -127, 3, -64, -127, 7, -64, 0, 0, -32, 0, 0, -128, 3, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 32, 0, 104, 112, 0, -8, -68, 0, -16, 31, 1, -32, 15, 0, -64, 7, 0, -64, 7, 0, -32, 7, 0, -32, 8, 0, 112, 16, 0, 56, -32, 0, 16, -32, 0, 32, -32, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -32, 1, 0, -64, 1, 0, -64, -125, 0, -128, -1, 0, -128, -1, 1, -64, 63, 1, -32, 15, 2, -12, 7, 2, -4, 4, 0, 24, 4, 0, 8, 8, 0, 16, 8, 0, 16, 56, 0, 0, 56, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 10, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 31, 0, -56, 127, 2, -8, -1, 3, -8, -1, 3, 8, 4, 2, 8, 4, 2, 8, 4, 2, 0, 4, 0, 0, 4, 0, 0, 14, 0, 0, 14, 0, 0, 14, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 120, 0, 0, 56, 0, 16, 60, 0, -16, 31, 0, -8, 31, 0, -56, 63, 0, 4, 127, 0, 4, -2, 2, 0, -14, 3, 0, -126, 1, 0, 1, 1, 0, -127, 0, -64, -127, 0, -64, 1, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, -64, 0, -32, 96, 1, -48, -13, 1, -120, -1, 0, 0, 127, 0, 0, 62, 0, 0, 62, 0, 0, 126, 0, 0, 113, 0, -128, -32, 0, 112, -64, 1, 112, -128, 0, 112, 64, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 3, 0, -32, 1, 0, -112, 3, 0, 0, 7, 3, 0, -17, 1, 0, -2, 7, 0, -2, 1, 0, 126, 0, -128, 63, 0, -4, 60, 0, 28, 56, 0, 30, 56, 0, 0, 48, 0, 0, 112, 0, 0, 28, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 63, 0, 0, 12, 0, 0, 12, 0, 0, 28, 0, 0, 28, 0, 0, 60, 0, 28, -4, 7, -2, -1, 3, 28, -4, 7, 0, 60, 0, 0, 28, 0, 0, 28, 0, 0, 12, 0, 0, 12, 0, -128, 63]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 56, 0, 0, -32, 0, 0, 96, 0, 60, 112, 0, 56, 112, 0, -8, 121, 0, 0, 127, 0, 0, -4, 0, 0, -4, 3, 0, -4, 15, 0, -34, 3, 0, 14, 6, 32, 7, 0, -64, 3, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 32, 0, 112, 64, 0, 112, -128, 0, 112, -64, 1, -128, -32, 0, 0, 113, 0, 0, 126, 0, 0, 62, 0, 0, 62, 0, 0, 127, 0, -120, -1, 0, -48, -13, 1, -32, 96, 1, 64, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 1, 0, -64, 1, 0, -64, -127, 0, 0, -127, 0, 0, 1, 1, 0, -126, 1, 0, -14, 3, 4, -2, 2, 4, 127, 0, -56, 63, 0, -8, 31, 0, -16, 31, 0, 16, 60, 0, 0, 56, 0, 0, 120, 0, 0, 16])]);
  sbexp_bits = $rows([$ta(Int8Array, 800, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 64, 0, 16, 0, 0, 0, 0, 0, 0, 0, -128, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, -127, 4, 0, 0, 0, 0, 0, 0, 0, 0, -14, 31, 0, 0, 0, 0, 0, 0, 0, 0, -66, 124, 0, 0, 0, 0, 0, 0, 0, 0, -10, 79, 0, 0, 0, 0, 0, 0, 0, 0, -34, 125, 0, 0, 0, 0, 0, 0, 0, 0, -22, -17, 1, 0, 0, 0, 0, 0, 0, 0, -1, 85, 0, 0, 0, 0, 0, 0, 0, 0, -35, -3, 3, 0, 0, 0, 0, 0, 0, 0, -65, -82, 34, 54, 0, 0, 0, 0, 0, -37, -9, 63, 30, 0, 0, 0, 0, 0, -128, 80, -65, -65, -123, 0, 0, 0, 0, 0, 0, 0, -1, -27, 0, 0, 0, 0, 0, 0, 0, 0, -18, 126, 0, 0, 0, 0, 0, 0, 0, 0, 116, 75, 0, 0, 0, 0, 0, 0, 0, 0, -24, 62, 0, 0, 0, 0, 0, 0, 0, 0, -8, 73, 0, 0, 0, 0, 0, 0, 0, 0, 84, 7, 0, 0, 0, 0, 0, 0, 0, 0, 4, -128, 0, 0, 0, 0, 0, 0, 0, 0, 2, -128, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4]),
$ta(Int8Array, 800, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 0, 0, 0, 0, 0, 0, 0, -64, 112, 0, 0, 0, 0, 0, 0, 0, 0, 120, -111, 0, 0, 0, 0, 0, 0, 0, 96, -15, 83, 0, 0, 0, 0, 0, 0, 0, 64, -105, 92, 0, 0, 0, 0, 0, 0, 0, -96, 12, -116, 27, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, -60, 1, 0, -56, 0, 0, 0, 0, 0, 0, 8, 2, 0, -120, 0, 0, 0, 0, 0, 0, 11, 0, 0, 8, 0, 0, 0, 0, 0, 0, 96, 0, 2, 64, 2, 0, 0, 0, 0, 0, 112, 0, 12, 64, 0, 0, 0, 0, 0, 0, 112, -32, 13, 0, 4, 0, 0, 0, 0, 0, 114, -56, 7, 64, 8, 0, 0, 0, 0, -128, 2, 120, 47, 64, 0, 0, 0, 0, 0, 64, 2, -80, 10, 32, 119, 0, 0, 0, 0, 64, 19, 16, 51, 0, 0, 0, 0, 0, 0, -64, 2, 120, -69, -127, 9, 0, 0, 0, 0, 0, 2, -36, -25, 0, 9, 0, 0, 0, 0, 0, 0, -84, 120, 0, 49, 0, 0, 0, 0, 64, 3, 116, 75, 0, 3, 0, 0, 0, 0, -128, 2, -24, 62, 0, 1, 16, 0, 0, 0, -128, 0, -8, 73, -128, 9, 28, 0, 0, 0, 0, 12, 64, 7, 0, 5, 28, 0, 0, 0, -128, 9, 4, -128, 0, 2, 0, 0, 0, 0, -128, 17, 0, 0, 0, 3, 0, 0, 0, 0, -128, 29, 1, 0, 0, 1, 0, 0, 0, 0, -128, -29, 11, 0, 34, 1, 0, 0, 0, 0, -128, -113, 16, 0, -96, 0, 0, 0, 0, 0, -128, 79, 32, 120, 96, 0, 0, 0, 0, 0, 0, -128, -128, 121, 24, 0, 0, 0, 0, 0, 0, 0, 120, 124, 5, 0, 0, 0, 0, 0, 0, 0, 0, 30, 3, 0, 0, 0, 0, 0, 0, 0, 0, -121, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3]),
$ta(Int8Array, 800, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, -128, 1, 2, 0, 0, 0, 0, 0, 0, 24, -64, 4, 0, 0, 0, 0, 0, 0, 0, -124, -128, 4, 0, 0, 0, 0, 0, 0, 0, -128, 96, 6, 12, 0, 0, 0, 0, 0, 0, -128, 7, 100, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 0, 0, 0, 0, 0, 0, 32, 0, 8, 114, 0, 0, 0, 0, 0, 0, 8, 0, 0, -32, 0, 0, 0, 0, 0, -128, 59, 0, 0, -64, 51, 0, 0, 0, 0, -96, 27, 0, 0, -128, 66, 0, 0, 0, 0, -48, 8, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 32, 0, 0, 0, 0, 106, 0, 0, 0, 0, 40, 0, 0, 0, 0, 24, 0, 0, 0, 0, 80, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, -128, 7, 0, 0, 0, 0, -128, 1, 0, 0, 48, 5, 0, 0, 0, 0, 0, 2, 0, 0, -128, 3, 3, -128, 0, 0, 0, 8, 0, 0, -30, -126, 3, 0, 32, 0, 0, 64, 0, 0, 14, -128, 3, 0, 76, 0, 0, 16, 0, 0, 14, -128, 3, -20, 16, 0, 0, 96, 0, 0, 18, 0, 0, 5, -109, 1, 0, 32, 0, 0, 18, 0, 0, 0, 92, 12, 0, 96, 0, 0, 48, 0, -64, 5, -127, 16, 0, 0, 0, 0, 44, 0, 0, -52, 6, 0, 0, 32, 0, 0, 48, 0, 0, 40, 32, 2, 0, 0, 0, 0, 48, -128, -128, 34, 0, 2, 0, 0, 2, 0, 32, 0, -128, 2, 32, 8, 0, 32, 2, 0, 56, 0, 0, 0, 17, 40, 0, 32, 6, 0, 32, 0, -128, 14, -64, 33, 0, 92, 0, 0, 36, 0, -112, 64, 88, 4, 0, 32, 1, 0, 36, 0, 16, 34, 2, 5, 0, 32, 2, 0, 0, 0, 0, 40, -74, 0, 0, 32, 1, 0, 112, 0, 0, 24, -63, 0, 0, -64, 1, 0, -64, 0, 0, 64, -125, 4, 0, -64, 1, 0, 0, 1, -128, -4, 65, 2, 0, 16, 0, 0, 0, 1, 0, 3, 48, 0, 0, 16, 0, 0, 16, 2, 0, 64, 29, 0, 0, 32, 0, 0, 48, 4, 0, 0, 0, 2, 0, 32, 0, 0, 0, 4, 0, 96, 0, 0, 0, 32, 0, 0, 0, 24, 0, 0, 0, 0, 0, 64, 0, 0, 0, 62, 0, 0, 0, 0, 0, 64, 1, 0, 0, 24, 0, 0, 0, 0, 0, -64, 0, 0, 0, 56, 0, -127, 15, 0, 0, 42, 0, 0, 0, -8, 2, -128, 15, 0, 0, 16, 0, 0, 0, -8, 2, -128, 15, 0, 0, 8, 0, 0, 0, 0, 6, -64, 1, 0, 0, 7, 0, 0, 0, 0, 20, -32, 0, 0, -128, 0, 0, 0, 0, 0, 8, 112, 0, 0, -123, 0, 0, 0, 0, -64, 0, 48, 0, 32, 60, 0, 0, 0, 0, 0, -32, -32, -128, 0, 11, 0, 0, 0, 0, 0, -32, 121, -125, -128, 0, 0, 0, 0, 0, 0, 0, -128, 25, 34, 0, 0, 0, 0, 0, 0, 0, 0, -12, 40]),
$ta(Int8Array, 800, [0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 4, 0, 32, 0, 1, 0, 0, 0, 0, 0, 0, 0, 16, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 64, 0, 0, 0, 0, 2, 0, 0, 0, 0, 32, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, -125, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 3, 0, 0, 0, 0, 0, 0, 1, 0, -64, 7, 0, 0, 0, 0, 0, 0, 0, 0, -32, 3, 0, -128, 0, 0, 0, 0, 0, 0, -64, 1, 0, 0, 0, 0, 0, 0, 8, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 1, 0, 0, 0, 0, 3, 0, 0, 0, 2, -112, 0, 0, 0, 64, 2, 2, 0, -128, -128, 0, 2, 0, 0, 0, 64, 0, 0, 64, 0, 32, 0, 0, 0, 0, 0, 1, 0, 32, 0, 4, 2, 0, 0, 0, 0, 0, 0, 48, 40, -112, 5, 0, 0, 64, 0, 0, 0, 72, 5, 0, 33, 0, 0, 12, 0, 0, 0, -124, 0, 84, 5, 0, 0, 0, 4, 0, 0, 64, 5, -128, 65, 0, 0, 0, 0, 0, 0, 0, 14, 2, 1, 0, 0, 32, 0, 0, 0, 8, 32, 32, 1, 0, 0, 0, 0, 0, 0, -124, -126, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 6, 72, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 64, 4, 0, 0, 0, 42, 0, 33, 0, 0, 0, 0, 0, 0, -112, 64, 64, 4, 0, 0, -128, 0, 0, 0, 0, 2, 2, 65, 0, 0, 0, 0, 0, 0, 8, 64, -96, 0, 0, 0, 80, 0, 0, 0, 0, 16, 1, 0, 0, 0, 64, 64, 0, 0, 0, 64, 2, 4, 0, 0, 48, 0, 0, 0, -128, -124, 0, 2, 0, 0, 0, 0, 0, 0, 0, -62, 32, 32, 0, 0, 0, 0, 0, 0, 16, -64, 5, 32, 0, 0, 0, 0, 0, 0, 32, 4, 0, 2, 0, 0, 16, 8, 0, 0, -128, 0, 16, 16, 0, 0, 8, 16, 2, 0, 0, 33, 4, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 8, 0, 40, 0, 0, 0, 0, 0, 0, 8, 16, 0, 20, 0, 0, 0, 0, 0, 0, 58, 0, 0, 44, 0, 0, 0, 64, 4, 0, 96, 0, 0, 7, 0, 0, 0, 0, 4, 0, -72, 1, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 32, 0, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 32, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18]),
$ta(Int8Array, 800, [0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 16, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 32, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -127, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 8, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 2, 0, 0, 0, 0, 0, 0, 0, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 2, 0, 0, 0, 0, 0, 0, 0, 64, 0, -128, -128, 0, -128, 0, 0, 0, 0, 96, 0, 0, 8, 0, 0, 0, 0, 0, 0, -112, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 0, 1, 16, 4, 0, 0, 0, 64, 0, 2, 2, -112, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 3, 0, 0, 0, 0, 0, 0, 0, 28, 32, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 40, 0, 20, 0, 0, 0, 0, 0, -128, 0, 0, 0, 32, 64, 0, 0, 0, 0, 0, 0, 0, 68, -60, 0, 0, 0, 0, 0, 6, 64, 0, 0, 64, 0, 2, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 16, 0, 0, 0, 0, 0, 0, 0, 8, 16, 0, 0, 0, 0, 4, 0, 0, 0, 32, 0, 0, 0, 0, 0, -128, 16, 0, 0, 16, 0, 0, 0, 0, 0, -128, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, -128, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 66, 0, 0, 4, 32, 1, 0, 0, 0, 0, 0, 16, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0, 0, -128, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 32, 5, 0, 0, 0, 0, 0, 0, 2, 0, -127, 7, 1, 3, 0, 0, 0, 0, 64, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 64, 2, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32, 0, 0, 0, 0, 0, 0, 8, 2, -128, 32, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -126, 0, 0, 0, 0, 0, -128, 0, 0, 64, 0, 0, 8, 0, 0, 0, -64, 0, 0, -128, 2, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 64, 1, 0, 8, 0, 0, 0, 0, 0, 0, 0, 2, 0, 16, 0, 0, 0, 0, 0, 0, 64, 13, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64]),
$ta(Int8Array, 800, [0, 0, 0, 0, 0, 0, 0, -32, 7, 0, 0, 0, 0, 0, 0, 0, 0, -32, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0, -120, 0, 0, 0, 0, 0, 0, 16, 0, 0, 112, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, 0, 0, 0, 0, 0, 0, 0, -48, 0, 0, 0, 0, 0, 1, 0, 0, 0, -120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 16, 0, 0, 4, 0, 0, 32, 0, 2, 2, 8, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 32, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 64, 0, 2, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 64, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 4, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, -128, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 2, 32, 0, 0, 8, 0, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -124, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8]),
$ta(Int8Array, 800, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, -128, 0, 2, 0, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, -112])]);
  fed_galaxy_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 31, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -128, 31, 0, 96, 111, 0, 96, 111, 0, 96, 102, 0, 96, 111, 0, -32, 127, 0, -32, 127, 0, 96, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 31, 0, -128, 127, 0, -64, -1, 0, -64, -1, 1, -64, -1, 1, -64, -1, 1, -128, -1, 1, 32, -1, 0, 112, 127, 0, 48, 7, 0, -8, 51, 0, -8, 51, 0, -20, 31, 0, -128, 31, 0, 0, 14, 0, 0, 12, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, 0, -2, 0, 0, -1, 1, 0, -1, 1, 0, -1, 3, 64, -1, 3, -32, -2, 3, 112, -1, 3, 56, -1, 1, -4, -9, 0, -24, 9, 0, -64, 29, 0, -128, 15, 0, 0, 7, 0, -128, 3, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 120, 0, 0, -4, 0, 0, -2, 1, -64, -2, 1, -16, -2, 3, 60, -2, 3, 62, -1, 3, -8, -1, 3, -16, -1, 3, -16, -8, 1, -32, -14, 0, -32, 7, 0, -64, 3, 0, -32, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, -4, -3, 1, -4, -3, 1, 24, -2, 3, -72, -1, 3, -8, -1, 3, -8, -1, 3, -72, -1, 3, 24, -2, 3, -4, -3, 1, -4, -3, 1, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 32, 0, 0, -32, 0, 0, -64, 3, 0, -32, 7, 0, -32, -14, 0, -16, -8, 1, -16, -1, 3, -8, -1, 3, 62, -1, 3, 60, -2, 3, -16, -2, 3, -64, -2, 1, 0, -2, 1, 0, -4, 0, 0, 120]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, -128, 3, 0, 0, 7, 0, -128, 15, 0, -64, 29, 0, -24, 9, 0, -4, -9, 0, 56, -1, 1, 112, -1, 3, -32, -2, 3, 64, -1, 3, 0, -1, 3, 0, -1, 1, 0, -1, 1, 0, -2, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, 0, 12, 0, 0, 14, 0, -128, 31, 0, -20, 31, 0, -8, 51, 0, -8, 51, 0, 48, 7, 0, 112, 127, 0, 32, -1, 0, -128, -1, 1, -64, -1, 1, -64, -1, 1, -64, -1, 1, -64, -1, 0, -128, 127, 0, 0, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 96, 96, 0, -32, 127, 0, -32, 127, 0, 96, 111, 0, 96, 102, 0, 96, 111, 0, 96, 111, 0, -128, 31, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -128, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 7, 0, -128, 31, 0, -128, 127, 3, -64, -4, 1, -64, -4, 1, 0, -50, 0, -32, -17, 0, -16, 79, 0, -8, 31, 0, -8, 63, 0, -8, 63, 0, -8, 63, 0, -16, 63, 0, -32, 31, 0, -128, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 16, 0, 0, 56, 0, 0, 28, 0, 0, 62, 0, 0, 119, 0, 0, -14, 2, -32, -3, 7, -16, -97, 3, -8, -33, 1, -8, -17, 0, -8, 95, 0, -8, 31, 0, -16, 31, 0, -16, 31, 0, -32, 15, 0, -128, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 112, 0, 0, 60, 0, 0, 126, 0, -16, 116, 0, -8, -15, 0, -4, -1, 0, -4, -1, 1, -4, -49, 7, -4, -57, 3, -4, -9, 0, -8, 55, 0, -8, 7, 0, -16, 3, 0, -32, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -8, -5, 3, -8, -5, 3, -4, -121, 1, -4, -33, 1, -4, -1, 1, -4, -1, 1, -4, -33, 1, -4, -121, 1, -8, -5, 3, -8, -5, 3, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 1, 0, -16, 3, 0, -8, 7, 0, -8, 55, 0, -4, -9, 0, -4, -57, 3, -4, -49, 7, -4, -1, 1, -4, -1, 0, -8, -15, 0, -16, 116, 0, 0, 126, 0, 0, 60, 0, 0, 112, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 7, 0, -32, 15, 0, -16, 31, 0, -16, 31, 0, -8, 31, 0, -8, 95, 0, -8, -17, 0, -8, -33, 1, -16, -97, 3, -32, -3, 7, 0, -14, 2, 0, 119, 0, 0, 62, 0, 0, 28, 0, 0, 56, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 15, 0, -32, 31, 0, -16, 63, 0, -8, 63, 0, -8, 63, 0, -8, 63, 0, -8, 31, 0, -16, 79, 0, -32, -17, 0, 0, -50, 0, -64, -4, 1, -64, -4, 1, -128, 127, 3, -128, 31, 0, 0, 7, 0, 0, 3, 0, 0, 2])]);
  rom_galaxy_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 6, 0, 4, 6, 2, -60, 63, 2, 124, -17, 3, 12, 6, 3, -4, -1, 3, -4, -1, 3, -8, -1, 1, -16, -1, 0, -32, 127, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 56, 0, 0, 60, 0, 16, 56, 0, 24, 12, 0, 24, 12, 0, -4, 14, 0, -52, 7, 0, 60, 15, 0, -4, 59, 3, -8, -25, 1, -8, -33, 1, -16, -1, 0, -16, -1, 0, -32, 63, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -64, 1, -32, -32, 1, 112, -32, 1, 120, -16, 0, -40, 59, 0, 56, 31, 0, 120, 15, 0, -8, 31, 0, -8, 31, 0, -16, -109, 1, -16, -9, 0, -16, -17, 0, -32, 127, 0, 0, 63]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 3, 0, -64, 1, 0, -16, 0, 0, -16, 0, 0, -72, -63, 3, 120, -63, 3, 120, -5, 1, -8, -66, 0, -4, 15, 0, -4, 7, 0, -4, 13, 0, -4, 13, 0, -8, 27, 0, -16, -5, 0, -64, 63, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 15, 0, -32, 3, 0, -16, 2, 0, -8, 2, 0, -8, 6, 0, -4, 4, 0, -2, -58, 0, -2, -1, 3, -2, -1, 3, -2, -58, 0, -4, 4, 0, -8, 6, 0, -8, 2, 0, -16, 2, 0, -32, 3, 0, -64, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, -64, 63, 0, -16, 123, 0, -8, 11, 0, -4, 13, 0, -4, 13, 0, -4, 7, 0, -4, 15, 0, -8, -66, 0, 120, -5, 1, 120, -63, 3, -72, -63, 3, -16, 0, 0, -16, 0, 0, -64, 1, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 0, -32, 127, 0, -16, -17, 0, -16, -9, 0, -16, -109, 1, -8, 31, 0, -8, 31, 0, 120, 15, 0, 56, 31, 0, -40, 59, 0, 120, -16, 0, 112, -32, 1, -32, -32, 1, -128, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 3, 0, -32, 63, 0, -16, -1, 0, -16, -1, 0, -8, -33, 1, -8, -25, 1, -4, 59, 3, 60, 15, 2, -52, 7, 0, -4, 14, 0, 24, 12, 0, 24, 12, 0, 16, 56, 0, 0, 60, 0, 0, 56, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 15, 0, -128, 31, 0, -32, 127, 0, -16, -1, 0, -8, -1, 1, -4, -1, 3, -4, -1, 3, 12, 6, 3, 124, -17, 3, -60, 63, 2, 4, 6, 2, 0, 6, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, -64, 127, 0, -16, -1, 0, -16, -1, 0, -72, -1, 1, 120, -2, 1, -52, -3, 3, 4, -49, 3, 0, 62, 3, 0, -9, 3, 0, -125, 1, 0, -125, 1, -64, -127, 0, -64, 3, 0, -64, 1, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 15, 0, -32, 127, 0, 112, -1, 0, -16, -2, 0, -104, -4, 0, -128, -1, 1, -128, -1, 1, 0, -17, 1, -128, -49, 1, -64, -67, 1, -16, -32, 1, 120, -32, 0, 120, 112, 0, 56, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, -64, 63, 0, -32, -3, 0, 0, -3, 1, 0, -5, 3, 0, -5, 3, 0, -2, 3, 0, -1, 3, -48, -9, 1, -8, -19, 1, 60, -24, 1, 60, -40, 1, 0, -16, 0, 0, -16, 0, 0, 56, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 31, 0, 0, 62, 0, 0, 122, 0, 0, -6, 0, 0, -5, 0, 0, -7, 1, 24, -5, 3, -2, -1, 3, -2, -1, 3, 24, -5, 3, 0, -7, 1, 0, -5, 0, 0, -6, 0, 0, 122, 0, 0, 62, 0, -128, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 56, 0, 0, -16, 0, 0, -16, 0, 60, -40, 1, 60, -24, 1, -8, -19, 1, -48, -9, 1, 0, -1, 3, 0, -2, 3, 0, -5, 3, 0, -5, 3, 0, -3, 1, -32, -3, 0, -64, 63, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 16, 0, 120, 112, 0, 120, -32, 0, -16, -32, 1, -32, -67, 1, -128, -49, 1, 64, -17, 1, -128, -1, 1, -128, -1, 1, -104, -2, 0, -16, -2, 0, 112, -1, 0, -32, 127, 0, -64, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 0, 0, -64, 1, 0, -64, 3, 0, -64, -127, 0, 0, -125, 1, 0, -125, 1, 0, -9, 3, 0, 62, 3, 4, -49, 3, -52, -3, 3, 120, -2, 1, -72, -1, 1, -16, -1, 0, -16, -1, 0, -64, 127, 0, 0, 60])]);
  kli_galaxy_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6, 0, 2, 6, 4, 2, 6, 4, 2, 6, 4, 2, 15, 4, 6, 15, 6, -98, -97, 7, -2, -7, 7, -68, -33, 3, -72, -33, 1, -80, -33, 0, -32, 127, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 48, 0, 16, 56, 0, 8, 56, 0, 8, 56, 0, 12, 12, 0, 4, 12, 0, 6, 6, 0, -114, 7, 4, -2, 7, 4, -66, 14, 2, -34, 13, 2, -36, -97, 3, -20, -3, 1, -8, -2, 1, -8, -2, 0, -32, 127, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 32, 0, 0, 16, 0, 0, 8, -64, 1, 12, -32, 1, 28, -32, 1, 60, -16, 0, 60, 56, 0, -4, 31, 0, -68, 13, 0, -36, 11, 0, -24, 15, 0, -8, 15, 0, -8, 11, 0, -8, 61, 4, -16, 126, 2, -32, -1, 1, 0, -4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, -64, 1, 0, 96, 0, 0, 120, 0, 0, 60, 0, 0, 60, -64, 3, 124, -64, 3, -2, -15, 1, -2, -65, 0, 94, 15, 0, -26, 6, 0, -4, 7, 0, -4, 2, 0, 60, 3, 0, -40, 3, 1, -8, -25, 0, -32, 63, 0, -128, 15]),
$ta(Int8Array, 60, [0, 0, 0, -128, 63, 0, -64, 3, 0, -32, 1, 0, -16, 1, 0, -8, 0, 0, -120, 0, 0, -4, 1, 0, -2, -121, 1, 126, -1, 3, 126, -1, 3, -2, -121, 1, -4, 1, 0, -120, 0, 0, -8, 0, 0, -16, 1, 0, -32, 1, 0, -64, 3, 0, -128, 63]),
$ta(Int8Array, 60, [0, 0, 0, -128, 15, 0, -32, 63, 0, -8, -25, 0, -40, -125, 1, 60, 3, 0, -4, 2, 0, -4, 7, 0, -26, 6, 0, 94, 15, 0, -2, -65, 0, -2, -15, 1, 124, -64, 3, 60, -64, 3, 60, 0, 0, 120, 0, 0, -32, 0, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -2, 0, -32, -1, 1, -16, 126, 2, -8, 61, 4, -8, 11, 0, -8, 15, 0, -24, 15, 0, -40, 11, 0, -68, 13, 0, -4, 31, 0, 60, 56, 0, 60, -16, 0, 28, -32, 1, 12, -32, 1, 8, -64, 1, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 15, 0, -32, 127, 0, -8, -2, 0, -8, -2, 0, -20, -3, 1, -36, -97, 3, -34, 13, 2, -66, 14, 2, -2, 7, 4, -114, 7, 4, 6, 6, 0, 4, 12, 0, 12, 12, 0, 8, 56, 0, 24, 60, 0, 16, 56, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 15, 0, -128, 31, 0, -32, 127, 0, -80, -33, 0, -72, -33, 1, -68, -33, 3, -2, -7, 7, -98, -97, 7, 6, 15, 6, 2, 15, 4, 2, 6, 4, 2, 6, 4, 2, 6, 4, 0, 6, 0, 0, 15, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 15, 0, -32, 127, 0, -16, -9, 1, -16, -9, 1, -8, 123, 3, -104, -65, 3, 12, -69, 7, 4, -41, 7, 4, -2, 7, 0, 30, 7, 0, 6, 6, 0, 3, 2, 0, 3, 3, -128, 1, 1, -64, -127, 1, -64, -127, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -16, 3, 0, -8, 127, 0, -28, -9, 0, -62, -5, 1, 0, -3, 1, 0, -1, 1, 0, 127, 1, 0, -67, 3, 0, -37, 3, -128, -1, 3, -64, -63, 3, -16, -64, 3, 120, -128, 3, 120, 0, 3, 56, 0, 1, 0, -128, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 31, 0, -64, 127, 0, 112, -1, 1, 8, -68, 1, 0, -52, 3, 0, -12, 3, 0, -2, 3, 0, 118, 6, 0, -81, 7, -64, -1, 7, -8, -8, 7, 60, -32, 3, 60, -64, 3, 0, -64, 1, 0, -64, 1, 0, -32, 0, 0, 56, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, -64, 31, 0, 0, 60, 0, 0, 120, 0, 0, -8, 0, 0, -16, 1, 0, 16, 1, 0, -8, 3, 24, -2, 7, -4, -17, 7, -4, -17, 7, 24, -2, 7, 0, -8, 3, 0, 16, 1, 0, -16, 1, 0, -8, 0, 0, 120, 0, 0, 60, 0, -64, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 6, 0, 0, 60, 0, 0, -32, 0, 0, -32, 1, 30, -64, 1, 30, -32, 1, 124, -16, 3, -24, -1, 3, -128, -105, 3, 0, 123, 2, 0, -5, 3, 0, -2, 1, 0, -26, 1, 4, -98, 1, 56, -1, 0, -32, -1, 0, -128, 63, 0, 0, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 64, 0, 0, -128, 0, 56, 0, 1, 120, 0, 3, 120, -128, 3, -16, -64, 3, -64, -63, 3, -128, -1, 3, 0, -37, 3, 0, -67, 1, 0, 127, 1, 0, -1, 1, 0, -3, 1, -62, -5, 1, -28, -9, 0, -8, 127, 0, -16, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 0, 0, -64, -127, 1, -64, 3, 1, -64, 1, 3, 0, 3, 2, 0, 3, 6, 0, 6, 6, 0, 30, 7, 2, -2, 7, 6, -42, 7, 4, -69, 7, 12, -65, 3, -8, 123, 3, -8, -9, 1, -16, -9, 1, -32, 127, 0, 0, 15])]);
  ori_galaxy_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 15, 0, -96, 95, 0, -80, -33, 0, -112, -106, 0, -112, -106, 0, 24, -122, 1, 24, -113, 1, -40, -65, 1, 120, -26, 1, 24, -113, 1, 120, -26, 1, -8, -10, 1, -104, -97, 1, 48, -49, 0, 32, 79, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 112, 0, -128, 120, 0, -32, 124, 0, 32, 122, 0, 48, 88, 0, 48, 92, 2, 120, 15, 3, -8, 15, 3, 28, 15, 1, -36, -97, 1, -108, -77, 1, -80, -25, 0, -32, -15, 0, -32, 127, 0, -32, 115, 0, -64, 49]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, -29, 1, -64, -7, 1, -32, -28, 1, 112, -16, 1, -8, -69, 0, 60, -97, 0, 124, 78, 2, 100, 31, 3, -92, -101, 1, -16, -47, 0, -16, -10, 0, -16, 127, 0, -32, 60, 0, 0, 28, 0, 0, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 28, 0, -128, 15, 0, -32, 1, 0, 120, -16, 3, -4, -64, 3, -76, -15, 3, 16, -1, 1, 80, -97, 0, -40, 79, 0, -8, 15, 0, -4, 13, 3, 60, -51, 1, 120, 124, 0, -64, 61, 0, 0, 31, 0, -128, 7, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 15, 0, -8, 127, 0, 108, -63, 0, 96, 3, 0, 48, -14, 0, -100, -58, 1, -2, -1, 3, -2, -1, 3, -100, -58, 1, 48, -14, 0, 96, 3, 0, 108, -63, 0, -8, 127, 0, -16, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 3, 0, 0, 15, 0, -64, 63, 0, 120, -4, 0, 60, -115, 1, -4, 5, 3, -4, 15, 0, -40, 79, 0, 80, -97, 0, 16, -1, 1, -68, -15, 3, -4, -64, 3, 120, -16, 3, -32, 1, 0, -128, 15, 0, 0, 28]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 28, 0, -32, 60, 0, -16, 127, 0, -16, -10, 0, -16, -47, 0, -92, -101, 1, 100, 31, 3, 124, 78, 2, 56, -97, 0, -8, -69, 0, 112, -16, 1, -32, -28, 1, -64, -7, 1, 0, -29, 1, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 49, 0, -32, 115, 0, -32, 127, 0, -32, -15, 0, -80, -25, 0, -108, -77, 1, -36, -97, 1, 28, 15, 1, -8, 15, 3, 120, 15, 2, 48, 92, 2, 48, 88, 0, 32, 122, 0, 96, 124, 0, -64, 120, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 6, 0, 32, 79, 0, 48, -49, 0, -104, -97, 1, -8, -10, 1, 120, -26, 1, 24, -113, 1, 120, -26, 1, -40, -65, 1, 24, -113, 1, 24, -122, 1, -112, -106, 0, -112, -106, 0, -80, -33, 0, -96, 95, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 56, 0, -32, 124, 0, -32, 127, 0, -16, 120, 0, 112, -34, 0, -40, -100, 2, -104, -65, 3, 8, -113, 3, 12, -1, 1, 12, -17, 1, -92, -61, 0, -96, -63, 0, -32, 69, 0, -32, 99, 0, -32, 33, 0, -32, 48]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 14, 0, -128, 3, 0, -64, 115, 0, -32, -1, 0, -16, -10, 0, -80, -8, 0, -104, 93, 2, -116, 111, 2, 36, -25, 3, -112, -49, 3, -48, -3, 1, -8, -32, 0, 120, 114, 0, -8, 57, 0, 120, 12, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 15, 0, -64, 63, 0, -16, -29, 1, 24, -53, 3, 12, -6, 3, 0, -1, 3, 32, -65, 1, -112, -81, 0, -8, -113, 0, -4, -40, 3, 60, -16, 3, -4, -32, 1, 0, 120, 0, 0, 31, 0, -128, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, -32, -1, 1, 48, 104, 3, 0, 108, 0, -16, -60, 0, 56, -106, 3, -4, -1, 7, -4, -1, 7, 56, -106, 3, -16, -60, 0, 0, 108, 0, 48, 104, 3, -32, -1, 1, 0, -1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 3, 0, 0, 31, 0, 0, 120, 0, -4, -32, 1, 60, -16, 3, -4, -40, 3, -8, -113, 0, -112, -81, 0, 32, -65, 1, 0, -1, 3, 12, -6, 3, 24, -53, 3, -16, -29, 1, -64, 63, 0, 0, 15, 0, 0, 28]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 120, 12, 0, -8, 57, 0, 120, 114, 0, -8, -32, 0, -48, -3, 1, -112, -49, 1, 36, -25, 3, -116, 111, 2, -104, 93, 2, -80, -8, 0, -16, -10, 0, -32, -1, 0, -64, 115, 0, -128, 3, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -32, 16, 0, -32, 49, 0, -32, 99, 0, -32, 69, 0, -96, -63, 0, -92, -61, 0, 12, -17, 1, 12, -1, 1, 8, -113, 3, -104, -65, 3, -40, -100, 2, 112, -34, 0, -16, 120, 0, -32, 127, 0, -32, 124, 0, -64, 56])]);
  ind_galaxy_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 4, 6, 2, -124, 22, 2, -124, 22, 2, -60, 63, 2, -50, 57, 7, -2, -7, 7, -2, -7, 7, -72, -33, 1, -8, -1, 1, -80, -33, 0, -32, 127, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 16, 48, 0, 16, 24, 0, 8, 24, 0, 12, 29, 0, -114, 13, 0, -34, 47, 0, -2, 31, 4, -4, 61, 2, -4, 60, 2, -4, -67, 3, -4, -1, 3, -8, -1, 3, -32, -1, 1, -32, 127, 0, -64, 61, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 0, 0, 32, 0, 0, 56, 64, 0, 60, -32, 0, 60, 116, 0, -4, 59, 0, -4, 31, 0, -4, 15, 0, -4, 60, 0, -12, 28, 0, -4, 31, 2, -8, 31, 2, -8, -1, 1, -8, -1, 0, -16, -2, 0, -128, 127]),
$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, -32, 3, 0, -16, 0, 0, -16, 0, 0, 120, 0, 0, -4, 11, 1, -4, -25, 3, -4, -1, 0, -4, 63, 0, 120, 12, 0, -4, 62, 0, -2, 31, 0, -4, 15, 0, -8, 7, 0, -32, -113, 1, -32, 127, 0, -64, 63, 0, 0, 28]),
$ta(Int8Array, 60, [0, 0, 0, -128, 3, 0, -128, 63, 0, -32, 3, 0, -16, 1, 0, -8, 1, 0, -88, 7, 0, -8, 31, 0, -4, 7, 0, 126, -4, 3, 126, -4, 3, -4, 7, 0, -8, 31, 0, -88, 7, 0, -8, 1, 0, -16, 1, 0, -32, 3, 0, -128, 63, 0, -128, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 28, 0, -64, 63, 0, -32, 127, 0, -32, -113, 1, -8, 7, 0, -4, 15, 0, -2, 31, 0, -4, 62, 0, 120, 12, 0, -4, 63, 0, -4, -1, 0, -4, -25, 3, -4, 11, 1, 120, 0, 0, -16, 0, 0, -16, 0, 0, -32, 3, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 127, 0, -16, -2, 0, -8, -1, 0, -8, -1, 1, -8, 31, 2, -4, 31, 2, -12, 28, 0, -4, 28, 0, -4, 47, 0, -4, 31, 0, -4, 59, 0, 60, 116, 0, 60, -32, 0, 56, 64, 0, 32, 0, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, -128, 0, 0, -64, 61, 0, -32, 127, 0, -32, -1, 1, -8, -1, 3, -4, -1, 3, -4, -67, 3, -4, 60, 2, -4, 61, 2, -2, 31, 4, -34, 47, 0, -114, 13, 0, 12, 29, 0, 8, 24, 0, 16, 24, 0, 16, 48, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 6, 0, 0, 15, 0, -32, 127, 0, -80, -33, 0, -8, -1, 1, -72, -33, 1, -2, -7, 7, -2, -7, 7, -50, 57, 7, -60, 63, 2, -124, 22, 2, -124, 22, 2, 4, 6, 2, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 16, 0, -64, 59, 0, -32, 127, 0, -8, 127, 0, -4, -1, 1, -4, -1, 3, -36, -5, 3, -60, -13, 3, -60, -5, 3, -126, -1, 7, 64, -65, 7, 0, 27, 7, -128, 11, 3, -128, 1, 1, -128, -127, 0, -64, -128, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -32, 31, 0, -16, -9, 0, -16, -1, 1, -8, -1, 1, -124, -1, 1, -124, -1, 3, -128, -13, 2, -128, -13, 3, 64, -1, 3, -128, -1, 3, -64, -3, 3, -32, -60, 3, 112, -64, 3, 32, -64, 1, 0, 64, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, -128, 3, 0, -64, 63, 0, -32, 127, 0, 24, 127, 0, 0, -2, 1, 0, -1, 3, -128, -1, 7, -64, -9, 3, 0, -29, 1, -64, -1, 3, -16, -1, 3, 124, -2, 3, 8, -3, 3, 0, -32, 1, 0, -16, 0, 0, -16, 0, 0, 124, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 28, 0, -64, 31, 0, 0, 124, 0, 0, -8, 0, 0, -8, 1, 0, 94, 1, -128, -1, 1, 0, -2, 3, -4, -29, 7, -4, -29, 7, 0, -2, 3, -128, -1, 1, 0, 94, 1, 0, -8, 1, 0, -8, 0, 0, 124, 0, -64, 31, 0, 0, 28]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 124, 0, 0, -16, 0, 0, -16, 0, 0, -32, 1, 8, -3, 3, 124, -2, 3, -16, -1, 3, -64, -1, 3, 0, -29, 1, -64, -9, 3, -128, -1, 7, 0, -1, 3, 0, -2, 1, 24, 127, 0, -32, 127, 0, -64, 63, 0, -128, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 64, 0, 32, -64, 1, 112, -64, 3, -32, -60, 3, -64, -3, 3, -128, -1, 3, 0, -1, 3, -64, -13, 3, -128, -13, 2, -124, -1, 3, -124, -1, 1, -8, -1, 1, -16, -1, 1, -16, -9, 0, -32, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -64, -128, 0, -128, -127, 0, -128, 1, 1, -128, 11, 3, 0, 27, 7, 64, -65, 7, -126, -1, 7, -60, -5, 3, -60, -13, 3, -36, -5, 3, -4, -1, 3, -4, -1, 1, -8, 127, 0, -32, 127, 0, -64, 59, 0, 0, 16])]);
  ind_scout_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 64, 38, 0, 64, 47, 0, -64, 63, 0, -64, 63, 0, -32, 118, 0, 48, -58, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 24, 0, 0, 28, 0, 0, 12, 0, 64, 12, 0, 64, 7, 0, -32, 47, 0, -16, 63, 0, -40, 31, 0, -128, 31, 0, -128, 29, 0, 0, 49, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 112, 0, -128, 56, 0, -64, 28, 0, -4, 15, 0, -8, 7, 0, -128, 7, 0, -64, 31, 0, -32, 14, 0, 64, 6, 0, 0, 4, 0, 0, 4, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 3, 0, -16, 97, 0, -32, -5, 0, -32, 63, 0, -64, 7, 0, -16, 7, 0, -32, 3, 0, -128, 15, 0, 0, 3, 0, -128, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 96, 0, 0, -64, 7, 0, -64, 1, 0, -128, 3, 0, -16, -1, 0, -16, -1, 0, -128, 3, 0, -64, 1, 0, -64, 7, 0, 96, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 1, 0, 0, 3, 0, -128, 15, 0, -32, 3, 0, -16, 7, 0, -64, 7, 0, -32, 63, 0, -32, -5, 0, -16, 97, 0, 24, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 64, 6, 0, -32, 14, 0, -64, 31, 0, -128, 7, 0, -32, 7, 0, -4, 15, 0, -64, 28, 0, -128, 56, 0, 0, 112, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 49, 0, -128, 29, 0, -128, 31, 0, -40, 31, 0, -16, 63, 0, -32, 47, 0, 64, 7, 0, 64, 12, 0, 0, 12, 0, 0, 28, 0, 0, 24, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 48, -58, 0, -32, 118, 0, -64, 63, 0, -64, 63, 0, 64, 47, 0, 64, 38, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0, 6, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -64, 8, 0, -128, 27, 0, -128, 31, 0, -128, -65, 1, -64, -1, 0, 64, 127, 0, 0, 46, 0, 0, 35, 0, 0, 3, 0, -128, 3, 0, -128, 1, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 6, 0, 0, 6, 0, 0, 38, 0, 0, 119, 0, -128, 63, 0, 0, 30, 0, 0, 126, 0, 0, -1, 3, -128, 51, 0, -64, 17, 0, -32, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 24, 0, 0, 12, 0, 0, 31, 0, 0, 124, 0, 0, -2, 0, 0, 62, 0, -64, 127, 0, -16, 125, 0, 96, -8, 0, 0, -116, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 96, 0, 0, 62, 0, 0, 56, 0, 0, 28, 0, -16, -1, 0, -16, -1, 0, 0, 28, 0, 0, 56, 0, 0, 62, 0, 0, 96, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -116, 1, 96, -8, 0, -16, 125, 0, -64, 127, 0, 0, 62, 0, 0, -2, 0, 0, 124, 0, 0, 31, 0, 0, 12, 0, 0, 24, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -32, 0, 0, -64, 17, 0, -128, 51, 0, 0, -1, 3, 0, -2, 1, 0, 30, 0, -128, 63, 0, 0, 119, 0, 0, 38, 0, 0, 6, 0, 0, 6, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, -128, 1, 0, -128, 3, 0, 0, 3, 0, 0, 35, 0, 0, 46, 0, 64, 127, 0, -64, -1, 0, -128, -65, 1, -128, 31, 0, -128, 27, 0, -64, 8, 0, 64])]);
  ind_cruiser_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 25, 0, -64, 57, 0, -32, 127, 0, -32, 127, 0, 0, 15, 0, 0, 15, 0, 96, 111, 0, -32, 127, 0, 96, 111, 0, 96, 111, 0, -32, 127, 0, -32, 127, 0, 96, 102, 0, 96, 102, 0, 32, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, -128, 79, 0, -128, -17, 0, 0, -2, 0, 64, -2, 1, -64, -2, 0, -32, 31, 0, 96, 47, 0, -16, 127, 0, -16, 111, 0, -16, 63, 0, -104, 63, 0, -120, 63, 0, 0, 25, 0, 0, 24, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 124, 0, 0, 60, 0, -128, 56, 1, -128, -7, 3, -32, -1, 3, 96, -1, 3, 112, -97, 3, -4, 31, 1, -52, 63, 0, -64, 119, 0, -32, 31, 0, 64, 30, 0, 0, 6, 0, 0, 7, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, -16, 0, 0, -13, 1, -32, -9, 0, -8, 122, 0, -4, -1, 3, -32, -1, 3, -32, -1, 3, -16, -113, 3, -32, -101, 1, -128, 63, 0, -128, 15, 0, -64, 3, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -8, -49, 0, -16, -49, 1, -64, -60, 3, -64, -1, 3, -16, -1, 0, -16, -1, 0, -64, -1, 3, -64, -60, 3, -16, -49, 1, -8, -49]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, -64, 3, 0, -128, 15, 0, -128, 63, 0, -32, -101, 1, -16, -113, 3, -32, -1, 3, -32, -1, 3, -4, -1, 3, -8, 122, 0, -32, -9, 0, 0, -13, 1, 0, -16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 7, 0, 0, 6, 0, 64, 30, 0, -32, 31, 0, -64, 119, 0, -52, 63, 0, -4, 31, 0, -8, -97, 3, 96, -1, 3, -32, -1, 3, -128, -7, 3, -128, 56, 1, 0, 60, 0, 0, 124, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 24, 0, 0, 25, 0, -120, 63, 0, -104, 63, 0, -16, 63, 0, -16, 111, 0, -16, 127, 0, 96, 47, 0, -32, 31, 0, -64, -2, 0, 64, -2, 1, 0, -2, 0, -128, -17, 0, -128, 79, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 64, 0, 96, 102, 0, 96, 102, 0, -32, 127, 0, -32, 127, 0, 96, 111, 0, 96, 111, 0, -32, 127, 0, 96, 111, 0, 0, 15, 0, 0, 15, 0, -32, 127, 0, -32, 127, 0, -64, 57, 0, -128, 25]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, -128, 1, 0, -128, 9, 0, -64, 31, 1, -64, -97, 1, -64, -1, 0, 96, -1, 0, -32, -1, 0, 64, 111, 0, -128, 127, 0, -16, 55, 0, -8, 39, 0, -16, 7, 0, 112, 31, 0, 32, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 6, 0, -128, 39, 0, -128, 127, 0, -32, 60, 0, -64, 63, 3, -128, -1, 3, -100, -1, 1, -4, 111, 0, -4, 127, 0, -4, 25, 0, -56, 17, 0, -64, 3, 0, -32, 7, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 60, 0, 0, 31, 0, -64, 31, 0, -104, 125, 0, 28, -1, 0, -4, 127, 0, -4, 127, 0, -4, -1, 3, -32, -11, 1, -16, 126, 0, -8, 12, 0, -16, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, -1, 1, 56, -1, 0, 60, 50, 0, -4, 63, 0, -16, -1, 0, -16, -1, 0, -4, 63, 0, 60, 50, 0, 56, -1, 0, 48, -1, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -16, 0, 0, -8, 12, 0, -16, 126, 0, -32, -11, 1, -4, -1, 3, -4, 127, 0, -4, 127, 0, 28, -1, 0, -104, 125, 0, -64, 31, 0, 0, 31, 0, 0, 60, 0, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 3, 0, -32, 7, 0, -64, 3, 0, -56, 17, 0, -4, 25, 0, -4, 127, 0, -4, 111, 0, -100, -17, 0, -120, -1, 3, -64, 63, 3, -32, 60, 0, -128, 127, 0, -128, 39, 0, 0, 6, 0, 0, 12, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 15, 0, 32, 31, 0, 112, 31, 0, -16, 7, 0, -8, 39, 0, -16, 55, 0, -128, 127, 0, 64, 111, 0, -32, -1, 0, 96, -1, 0, -64, -1, 0, -64, -97, 1, -64, 31, 1, -128, 9, 0, -128, 1, 0, 0, 1])]);
  ind_battleship_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 15, 0, -16, -1, 0, -16, -1, 0, 16, -128, 0, -16, -1, 0, -16, -1, 0, -80, -33, 0, 0, 15, 0, 0, 15, 0, -128, 31, 0, -64, 63, 0, -16, -1, 0, -16, -1, 0, 48, -64, 0, 48, -64, 0, 48, -64, 0, 48, -64]),
$ta(Int8Array, 60, [-128, 0, 0, -128, 27, 0, -128, 127, 0, -64, -4, 0, -64, -13, 3, -32, -113, 3, 0, 127, 3, 0, -1, 3, 0, -1, 1, -128, -97, 1, -8, 15, 0, -8, 31, 0, -36, 31, 0, 12, 63, 0, 12, 124, 0, 4, 48, 0, 0, 48, 0, 0, 24, 0, 0, 24, 0, 0, 16]),
$ta(Int8Array, 60, [0, 8, 0, 0, 28, 0, 0, 126, 0, 0, -9, 0, -128, -25, 1, 0, -33, 3, 0, -100, 3, 16, 124, 7, -8, 127, 14, -4, -1, 6, -2, -1, 3, -57, -49, 1, -126, -113, 0, 0, 15, 0, 0, 14, 0, 0, 28, 0, 0, 12, 0, 0, 7, 0, -128, 3, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -16, 0, 0, -4, 0, 0, -36, 1, 32, -72, 3, 120, -72, 3, -1, -67, 7, -26, 127, 7, -32, 127, 3, -64, -1, 6, -64, -1, 6, -128, -57, 15, -128, -61, 1, 0, 67, 0, -128, 3, 0, -32, 3, 0, -16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, -16, 3, -4, 112, 3, -64, 97, 3, -64, 115, 3, -64, 127, 7, -64, 127, 7, -64, 127, 7, -64, 127, 7, -64, 115, 3, -64, 97, 3, -4, 112, 3, -4, -16, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -16, 0, 0, -32, 3, 0, -128, 3, 0, 0, 67, 0, -128, -61, 1, -128, -57, 15, -64, -1, 6, -64, -1, 6, -32, 127, 3, -26, 127, 7, -1, -67, 7, 120, -72, 3, 32, -72, 3, 0, -36, 1, 0, -4, 0, 0, -16]),
$ta(Int8Array, 60, [0, 1, 0, -128, 3, 0, 0, 7, 0, 0, 12, 0, 0, 28, 0, 0, 14, 0, 0, 15, 0, -126, -113, 0, -57, -49, 1, -26, -49, 3, -4, -1, 7, -8, 127, 14, 16, 124, 7, 0, -100, 3, 0, -33, 3, -128, -25, 1, 0, -9, 0, 0, 126, 0, 0, 28, 0, 0, 8]),
$ta(Int8Array, 60, [0, 16, 0, 0, 24, 0, 0, 24, 0, 0, 48, 0, 4, 48, 0, 12, 124, 0, 12, 63, 0, -36, 31, 0, -8, 31, 0, -8, 15, 0, -128, -97, 1, 0, -1, 1, 0, -1, 3, 0, 127, 3, -32, -113, 3, -64, -13, 3, -64, -4, 0, -128, 127, 0, -128, 27, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 48, -64, 0, 48, -64, 0, 48, -64, 0, 48, -64, 0, -16, -1, 0, -16, -1, 0, -64, 63, 0, -128, 31, 0, 0, 15, 0, 0, 15, 0, -80, -33, 0, -16, -1, 0, -16, -1, 0, 16, -128, 0, -16, -1, 0, -16, -1, 0, 0, 15]),
$ta(Int8Array, 60, [-128, 0, 0, -128, 1, 0, -128, 1, 0, -64, 0, 0, -64, 0, 2, -32, 3, 3, -64, 15, 3, -128, -65, 3, -128, -1, 1, 0, -1, 1, -104, 31, 0, -8, 15, 0, -4, 15, 0, -20, 15, 0, 28, 127, 0, -4, 60, 0, -16, 51, 0, -32, 31, 0, -128, 29, 0, 0, 16]),
$ta(Int8Array, 60, [0, 8, 0, 0, 28, 0, 0, 14, 0, 0, 7, 0, -128, 7, 0, 0, 7, 0, 0, 15, 0, 16, 31, 4, 56, 63, 14, 60, 127, 6, -2, -1, 3, -25, -1, 1, -18, -121, 0, -100, 7, 0, -68, 15, 0, 120, 30, 0, -16, 12, 0, -32, 7, 0, -128, 3, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -16, 0, 0, 124, 0, 0, 28, 0, 32, 12, 0, 56, 28, 0, 63, 30, 0, -10, 63, 0, -10, 63, 0, -20, 127, 0, -18, 127, 6, -34, -5, 15, -36, -31, 1, -36, 65, 0, -72, 3, 0, -16, 3, 0, -16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, -16, 3, -20, -16, 3, 108, 56, 0, -20, 60, 0, -18, 63, 0, -18, 63, 0, -18, 63, 0, -18, 63, 0, -20, 60, 0, 108, 56, 0, -20, -16, 3, -4, -16, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -16, 0, 0, -16, 3, 0, -72, 3, 0, -36, 65, 0, -36, -31, 1, -34, -5, 15, -18, 127, 6, -20, 127, 0, -10, 63, 0, -10, 63, 0, 63, 30, 0, 56, 28, 0, 32, 12, 0, 0, 28, 0, 0, 124, 0, 0, -16]),
$ta(Int8Array, 60, [0, 1, 0, -128, 3, 0, -32, 7, 0, -16, 12, 0, 120, 30, 0, -68, 15, 0, -100, 7, 0, -18, -121, 0, -25, -1, 1, -10, -1, 3, -4, -1, 7, 56, 63, 14, 16, 31, 4, 0, 15, 0, 0, 7, 0, -128, 7, 0, 0, 7, 0, 0, 14, 0, 0, 28, 0, 0, 8]),
$ta(Int8Array, 60, [0, 16, 0, -128, 29, 0, -32, 31, 0, -16, 51, 0, -4, 60, 0, 28, 127, 0, -20, 15, 0, -4, 15, 0, -8, 15, 0, -104, 31, 0, 0, -1, 1, -128, -1, 1, -128, -65, 3, -64, 15, 3, -32, 3, 3, -64, 0, 2, -64, 0, 0, -128, 1, 0, -128, 1, 0, -128])]);
  ind_starbase_bits = $rows([$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6]),
$ta(Int8Array, 60, [0, 6, 0, 0, 15, 0, -64, 63, 0, -32, 127, 0, -16, -10, 0, 120, -32, 1, -68, -33, 3, -36, -65, 3, -50, 54, 7, -33, -71, 15, -33, -71, 15, -50, 54, 7, -36, -65, 3, -68, -33, 3, 120, -32, 1, -16, -10, 0, -32, 127, 0, -64, 63, 0, 0, 15, 0, 0, 6])]);
  ind_assault_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 16, -113, 0, -112, -97, 0, -48, -65, 0, -8, -1, 1, -8, -1, 1, 88, -81, 1, 88, -81, 1, 88, -81, 1, 88, -81, 1, 88, -81, 1, -16, -1, 0, -16, -1, 0, -32, 112, 0, -32, 112, 0, -32, 112]),
$ta(Int8Array, 60, [0, 0, 0, -128, 0, 0, -128, 16, 0, 64, 62, 0, -32, 63, 0, -16, 127, 0, -16, 127, 2, -72, 127, 3, 88, -1, 3, 88, -1, 3, 104, -81, 1, -8, -81, 1, -8, -41, 1, -8, -33, 0, 56, -1, 0, 60, 126, 0, 0, 62, 0, 0, 14, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, -128, 7, 0, -128, 3, 0, -64, 127, 0, -32, -1, 0, 48, -1, 0, -72, -4, 0, 88, -2, 0, 60, -1, 4, -4, -1, 3, -4, -25, 3, -2, -41, 3, -124, -53, 0, -128, 119, 0, -128, 63, 0, -128, 31, 0, -64, 7, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 60, 0, -128, 31, 0, -32, 15, 0, -16, 124, 0, 56, -1, 1, -8, -4, 3, 126, -1, 1, -2, -1, 1, -4, -1, 1, -32, -1, 0, -64, -15, 6, -64, -17, 1, -16, -13, 0, -16, 125, 0, -16, 31, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 63, 0, -32, -1, 1, 124, 48, 0, -4, 127, 0, 124, -16, 0, -32, -1, 1, -32, -1, 3, -32, -1, 3, -32, -1, 1, 124, -16, 0, -4, 127, 0, 124, 48, 0, -32, -1, 1, -128, 63]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 16, 0, 0, -16, 31, 0, -16, 125, 0, -16, -13, 0, -64, -17, 1, -64, -15, 6, -32, -1, 0, -4, -1, 1, -2, -1, 1, 126, -1, 1, -8, -4, 3, 56, -1, 1, -16, 124, 0, -32, 15, 0, -128, 31, 0, 0, 60]),
$ta(Int8Array, 60, [0, 0, 0, -128, 0, 0, -64, 7, 0, -128, 31, 0, -128, 63, 0, -128, 119, 0, -124, -53, 0, -2, -41, 3, -4, -25, 3, -4, -17, 3, -68, -1, 6, 88, -2, 0, -72, -4, 0, 48, -1, 0, -32, -1, 0, -64, 127, 0, -128, 3, 0, -128, 7, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 12, 0, 0, 14, 0, 0, 62, 0, 60, 126, 0, 56, -1, 0, -8, -33, 0, -8, -41, 1, -8, -81, 1, 104, -81, 1, 88, -1, 3, 88, -1, 3, -72, 127, 3, -16, 127, 2, -16, 127, 0, -32, 63, 0, 64, 62, 0, -128, 16, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -32, 112, 0, -32, 112, 0, -32, 112, 0, -16, -1, 0, -16, -1, 0, 88, -81, 1, 88, -81, 1, 88, -81, 1, 88, -81, 1, 88, -81, 1, -8, -1, 1, -8, -1, 1, -48, -65, 0, -112, -97, 0, 16, -113, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 3, 0, 0, 7, 0, -64, 7, 0, -32, -57, 3, -16, -49, 1, -80, -1, 1, -72, -2, 1, 88, -1, 1, 88, 111, 1, -4, -81, 1, -4, -81, 1, -20, -33, 1, -28, -1, 0, -32, -1, 0, -64, 127, 0, -64, 39, 0, -128, 16, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 16, 0, 0, 62, 0, -128, 31, 0, -64, 31, 0, -32, 30, 0, 48, 29, 2, -68, -4, 7, 124, -2, 3, 124, -1, 3, -10, -33, 3, -16, -89, 1, -16, -41, 1, -16, -49, 0, -16, 127, 0, -32, 63, 0, 0, 28, 0, 0, 28, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, -128, 0, -128, -1, 0, -32, -5, 0, -16, -4, 0, 120, 63, 0, -10, 56, 0, -16, 127, 0, -8, -1, 3, -8, -1, 7, -8, -17, 7, -4, -13, 1, -8, -49, 1, -32, -13, 0, 0, 127, 0, -128, 31, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 31, 0, -8, 127, 0, -64, -32, 3, -32, -1, 3, -16, -32, 3, -8, 127, 0, -4, 127, 0, -4, 127, 0, -8, 127, 0, -16, -32, 3, -32, -1, 3, -64, -32, 3, -8, 127, 0, -64, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 3, 0, -128, 31, 0, 0, 127, 0, -32, -13, 0, -8, -49, 1, -4, -13, 1, -8, -17, 7, -8, -1, 7, -8, -1, 3, -16, 127, 0, -10, 56, 0, 120, 63, 0, -16, -4, 0, -32, -5, 0, -128, -1, 0, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 28, 0, 0, 28, 0, -32, 63, 0, -16, 127, 0, -16, -49, 0, -16, -41, 1, -16, -89, 1, -14, -49, 3, -4, -1, 3, 124, -2, 3, -68, -4, 7, 48, 29, 2, -32, 30, 0, -64, 31, 0, -128, 31, 0, 0, 62, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 16, 0, -128, 16, 0, -64, 39, 0, -64, 127, 0, -32, -1, 0, -28, -1, 0, -20, -33, 1, -4, -81, 1, -4, -81, 1, 88, 111, 1, 88, -1, 1, -72, -2, 1, -80, -1, 1, -16, -49, 1, -32, -57, 3, -64, 7, 0, 0, 7, 0, 0, 3])]);
  ind_destroyer_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, -128, 31, 0, -64, 63, 0, -32, 127, 0, 0, 6, 0, 16, -122, 0, 48, -58, 0, 48, -58, 0, 48, -49, 0, -16, -1, 0, -16, -1, 0, -64, 63, 0, -64, 54, 0, -64, 54]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 31, 0, -128, 127, 0, 32, 126, 0, 96, 124, 0, 48, -52, 0, 48, 6, 0, -72, -121, 0, -8, -57, 0, -32, 111, 0, -16, 127, 0, -80, 127, 0, -96, 47, 0, -128, 14, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, -64, 124, 0, -32, 120, 0, 112, -8, 0, 56, -4, 0, 48, -52, 0, -16, -57, 0, -8, 7, 0, -4, 103, 0, -32, 119, 0, -32, 63, 0, -128, 31, 0, -128, 9, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, -32, 121, 0, -16, 112, 0, 96, -16, 1, -8, -8, 1, -4, -1, 0, -8, -25, 1, -16, -61, 0, -8, 67, 0, -64, 17, 0, -16, 63, 0, 96, 15, 0, 0, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 15, 0, -64, 39, 0, -8, 96, 0, -8, -32, 0, -32, -31, 0, -8, -1, 1, -8, -1, 1, -32, -31, 0, -8, -32, 0, -8, 96, 0, -64, 39, 0, -64, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 96, 15, 0, -16, 63, 0, -64, 17, 0, -8, 67, 0, -16, -61, 0, -8, -25, 1, -4, -1, 0, -8, -8, 1, 96, -16, 1, -16, 112, 0, -32, 121, 0, 0, 11]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 0, 0, -128, 9, 0, -128, 31, 0, -32, 63, 0, -32, 119, 0, -4, 103, 0, -8, 7, 0, -16, -121, 0, -16, -49, 0, 56, -4, 0, 112, -8, 0, -32, 120, 0, -64, 124, 0, 0, 30]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, -128, 14, 0, -96, 47, 0, -80, 127, 0, -16, 127, 0, -32, 111, 0, -8, -57, 0, -72, -121, 0, 48, 6, 0, 48, -52, 0, 96, 124, 0, 32, 126, 0, -128, 127, 0, 0, 31, 0, 0, 26]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 54, 0, -64, 54, 0, -64, 63, 0, -16, -1, 0, -16, -1, 0, 48, -49, 0, 48, -58, 0, 48, -58, 0, 16, -122, 0, 0, 6, 0, -32, 127, 0, -64, 63, 0, -128, 31, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 23, 0, 64, 95, 0, -32, -33, 0, -32, -1, 0, 96, 127, 0, 48, -2, 1, 16, -34, 1, 0, -58, 0, 48, -61, 0, -32, 99, 0, -32, 71, 0, -32, 31, 0, -128, 15, 0, -128, 5]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 25, 0, -128, 31, 0, -64, 127, 0, -32, 124, 0, 96, -4, 3, 0, -4, 1, 16, -4, 0, 48, -1, 0, -16, -61, 1, -16, -31, 0, -32, 113, 0, -32, 55, 0, -128, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 111, 0, -64, -1, 0, -128, 56, 0, 32, -4, 1, 48, -4, 0, 120, -2, 1, -16, -1, 3, -8, -15, 1, -8, 96, 0, -32, -16, 0, -32, 121, 0, 0, 13]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 0, 64, 62, 0, 96, -16, 1, 112, -16, 1, 112, 120, 0, -8, -1, 1, -8, -1, 1, 112, 120, 0, 112, -16, 1, 96, -16, 1, 64, 62, 0, 0, 63]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, -32, 121, 0, -32, -16, 0, -8, 96, 0, -8, -15, 1, -16, -1, 3, 120, -2, 1, 48, -4, 0, 32, -4, 1, -128, 56, 0, -64, -1, 0, 0, 111, 0, 0, 12]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 7, 0, -32, 55, 0, -32, 113, 0, -16, -31, 0, -16, -61, 1, 48, -57, 0, 48, -2, 0, 0, -4, 1, 96, -4, 3, -32, 124, 0, -64, 127, 0, -128, 31, 0, 0, 25, 0, 0, 16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 5, 0, -128, 15, 0, -32, 31, 0, -32, 71, 0, -32, 99, 0, 48, -61, 0, 0, -58, 0, 16, -34, 1, 48, -2, 1, 96, 127, 0, -32, -1, 0, -32, -33, 0, 64, 95, 0, 0, 23, 0, 0, 2])]);
  myplanet000_bits = $ta(Int8Array, 120, [0, 24, 3, 0, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 0, 24, 3]);
  myplanet001_bits = $ta(Int8Array, 120, [0, -80, 1, 0, 0, 4, 4, 0, 0, 0, 0, 0, 32, 0, -128, 0, 0, 0, 0, 0, 8, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 64, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 2, 0, 0, 0, 0, 32, 0, -128, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, -80, 1]);
  myplanet010_bits = $ta(Int8Array, 120, [0, 24, 3, 0, 0, 0, 0, 0, -64, 0, 96, 0, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, 4, 0, 0, 4, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 4, 0, 0, 4, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, -64, 0, 96, 0, 0, 0, 0, 0, 0, 24, 3]);
  myplanet011_bits = $ta(Int8Array, 120, [0, -80, 1, 0, 0, 4, 4, 0, 0, 0, 0, 0, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 64, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 2, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 0, 0, 0, 0, 0, 4, 4, 0, 0, -80, 1]);
  myplanet100_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  myplanet101_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, -1, 31, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 3, 0, 0, 24, 3, 0, 0, 24, 3, 0, 0, 24, 3, 64, 0, 24, 3, 0, 0, 24, 3, 0, 0, 24, 3, 0, 0, 24, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, -1, 31, 0, 0, -8, 3]);
  myplanet110_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 40, 0, -128, 2, 16, 0, 0, 1, 40, 0, -128, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 40, 0, -128, 2, 16, 0, 0, 1, 40, 0, -128, 2, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  myplanet111_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, -1, 31, 0, -64, 0, 96, 0, 40, 0, -128, 2, 16, 0, 0, 1, 40, 0, -128, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 3, 0, 0, 24, 3, 0, 0, 24, 3, 0, 0, 24, 3, 64, 0, 24, 3, 0, 0, 24, 3, 0, 0, 24, 3, 0, 0, 24, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 40, 0, -128, 2, 16, 0, 0, 1, 40, 0, -128, 2, -64, 0, 96, 0, 0, -1, 31, 0, 0, -8, 3]);
  myindmplanet_bits = $ta(Int8Array, 32, [32, 2, 0, 0, 4, 16, 0, 0, 0, 0, 1, 64, 0, 0, 0, 0, 0, 0, 1, 64, 0, 0, 0, 0, 4, 16, 0, 0, 32, 2]);
  mymplanet011_bits = $ta(Int8Array, 32, [32, 2, 0, 0, 68, 17, 64, 1, -64, 1, -127, 76, -128, 20, -128, 20, -128, 20, -127, 92, -64, 1, 64, 1, 68, 17, 0, 0, 32, 2]);
  mymplanet010_bits = $ta(Int8Array, 32, [32, 2, 0, 0, 68, 17, 64, 1, -64, 1, -127, 64, -128, 0, -128, 0, -128, 0, -127, 64, -64, 1, 64, 1, 68, 17, 0, 0, 32, 2]);
  mymplanet001_bits = $ta(Int8Array, 32, [32, 2, 0, 0, 4, 16, 0, 0, 0, 0, 1, 76, 0, 20, 0, 20, 0, 20, 1, 92, 0, 0, 0, 0, 4, 16, 0, 0, 32, 2]);
  noinfo_bits = $ta(Int8Array, 120, [0, -72, 3, 0, 0, 71, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, -64, 0, 16, 1, 32, 1, 16, 1, 0, 1, 16, 2, -128, 0, 8, 1, 64, 0, 16, 1, 64, 0, 16, 1, 0, 0, 16, 2, 64, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 28, 0, 0, -72, 3]);
  rmyplanet000_bits = $ta(Int8Array, 120, [0, 24, 3, 0, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 16, 0, 0, 1, 8, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 2, 16, 0, 0, 1, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 0, 24, 3]);
  rmyplanet001_bits = $ta(Int8Array, 120, [0, 24, 3, 7, 0, 0, 0, 5, -64, 0, 96, 7, 0, 0, 0, 1, 16, 0, 0, 1, 8, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 2, 16, 0, 0, 1, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 0, 24, 3]);
  rmyplanet010_bits = $ta(Int8Array, 120, [28, 24, 3, 0, 20, 0, 0, 0, -36, 0, 96, 0, 16, 0, 0, 0, 16, 0, 0, 1, 8, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 2, 16, 0, 0, 1, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 0, 24, 3]);
  rmyplanet011_bits = $ta(Int8Array, 120, [28, 24, 3, 7, 20, 0, 0, 5, -36, 0, 96, 7, 16, 0, 0, 1, 16, 0, 0, 1, 8, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 16, 1, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 2, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 2, 16, 0, 0, 1, 0, 0, 0, 0, -64, 0, 96, 0, 0, 0, 0, 0, 0, 24, 3]);
  rmyplanet100_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  rmyplanet101_bits = $ta(Int8Array, 120, [0, -8, 3, 7, 0, 7, 28, 5, -64, 0, 96, 7, 32, 0, 0, 1, 16, 0, 0, 1, 8, 0, 0, 0, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  rmyplanet110_bits = $ta(Int8Array, 120, [28, -8, 3, 0, 20, 7, 28, 0, -36, 0, 96, 0, 16, 0, -128, 0, 16, 0, 0, 1, 0, 0, 0, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  rmyplanet111_bits = $ta(Int8Array, 120, [28, -8, 3, 7, 20, 7, 28, 5, -36, 0, 96, 7, 16, 0, 0, 1, 16, 0, 0, 1, 0, 0, 0, 0, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  rmyindmplanet_bits = $ta(Int8Array, 32, [-96, 2, 8, 8, 0, 0, 2, 32, 0, 0, 1, 64, 0, 0, 1, 64, 0, 0, 1, 64, 0, 0, 2, 32, 0, 0, 8, 8, -96, 2]);
  rmymplanet011_bits = $ta(Int8Array, 32, [-96, 2, 8, 8, 64, 1, 66, 33, -64, 1, -127, 76, -128, 20, -127, 84, -128, 20, -127, 92, -64, 1, 66, 33, 64, 1, 8, 8, -96, 2]);
  rmymplanet010_bits = $ta(Int8Array, 32, [-96, 2, 8, 8, 64, 1, 66, 33, -64, 1, -127, 64, -128, 0, -127, 64, -128, 0, -127, 64, -64, 1, 66, 33, 64, 1, 8, 8, -96, 2]);
  rmymplanet001_bits = $ta(Int8Array, 32, [-96, 2, 8, 8, 0, 0, 2, 32, 0, 0, 1, 76, 0, 20, 1, 84, 0, 20, 1, 92, 0, 0, 2, 32, 0, 0, 8, 8, -96, 2]);
  tng_fed_scout_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, -128, 15, 0, -128, 15, 0, -128, 15, 0, 0, 7, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 14, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, -128]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 62, 0, 0, 62, 0, 0, 62, 0, 0, 30, 0, 0, 1, 0, -128, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 124, 0, 0, 124, 0, 0, 127, 0, -64, 56, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, -8, 0, -64, -1, 0, 0, -8, 0, 0, 112]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, -64, 56, 0, 0, 127, 0, 0, 124, 0, 0, 124, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -128, 0, 0, 0, 1, 0, 0, 30, 0, 0, 62, 0, 0, 62, 0, 0, 62, 0, 0, 28]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 14, 0, 0, 31, 0, 0, 31, 0, 0, 31, 0, 0, 14]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 7, 0, -128, 15, 0, -128, 15, 0, -128, 15, 0, 0, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 8, 0, 0, 8, 0, 0, 4, 0, 0, 4, 0, 0, 7, 0, -128, 15, 0, -128, 15, 0, -128, 15, 0, 0, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 16, 0, 0, 8, 0, -128, 7, 0, -64, 7, 0, -64, 7, 0, -64, 7, 0, -128, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, -64, 49, 0, -32, 15, 0, -32, 3, 0, -32, 3, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -16, 1, 0, -16, 63, 0, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -32, 3, 0, -32, 3, 0, -32, 15, 0, -64, 49, 0, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 3, 0, -64, 7, 0, -64, 7, 0, -64, 7, 0, -128, 7, 0, 0, 8, 0, 0, 16, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, -128, 15, 0, -128, 15, 0, -128, 15, 0, 0, 7, 0, 0, 4, 0, 0, 4, 0, 0, 8, 0, 0, 8, 0, 0, 16])]);
  tng_fed_cruiser_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 31, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -64, 63, 0, -112, -97, 0, 48, -49, 0, 48, -49, 0, 48, -58, 0, 48, -58, 0, -16, -1, 0, -48, -65]),
$ta(Int8Array, 60, [0, 0, 0, 0, 63, 0, -128, -1, 0, -128, -1, 0, -64, -1, 1, -64, -1, 1, -64, -1, 1, -128, -1, 1, -80, -1, 0, -80, -1, 0, -104, 63, 0, 24, 15, 0, -100, 71, 0, -76, 99, 0, -16, 49, 0, -64, 55, 0, 0, 31, 0, 0, 24, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 56, 0, 0, -2, 0, 0, -2, 1, 0, -1, 3, 0, -1, 3, 32, -1, 7, 48, -1, 7, 56, -1, 7, 28, -1, 3, -114, -1, 3, -104, -1, 0, -8, 3, 0, -16, 0, 0, -32, 56, 0, -64, 29, 0, -128, 15, 0, 0, 6, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 0, 0, -4, 3, -64, -4, 3, 112, -2, 7, 60, -2, 7, 14, -1, 7, -104, -1, 7, -40, -1, 7, -8, -1, 7, -16, -2, 3, 48, -32, 0, 96, 12, 0, -32, 15, 0, -128, 3, 0, -64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 113, 0, -8, -4, 1, 12, -2, 1, 12, -1, 3, -52, -1, 3, -4, -1, 3, -4, -1, 3, -52, -1, 3, 12, -1, 3, 12, -2, 1, -8, -4, 1, -4, 113]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 0, 0, -128, 3, 0, -32, 15, 0, 96, 12, 0, 48, -32, 0, -16, -2, 3, -8, -1, 7, -40, -1, 7, -104, -1, 7, 14, -1, 7, 60, -2, 7, 112, -2, 7, -64, -4, 3, 0, -4, 3, 0, -16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 2, 0, 0, 6, 0, -128, 15, 0, -64, 29, 0, -32, 56, 0, -16, 0, 0, -8, 3, 0, -104, -1, 0, -114, -1, 3, 28, -1, 3, 56, -1, 7, 48, -1, 7, 32, -1, 7, 0, -1, 3, 0, -1, 3, 0, -2, 1, 0, -2, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 8, 0, 0, 24, 0, 0, 31, 0, -64, 55, 0, -16, 49, 0, -76, 99, 0, -100, 71, 0, 24, 15, 0, -104, 63, 0, -80, -1, 0, -80, -1, 0, -128, -1, 1, -64, -1, 1, -64, -1, 1, -64, -1, 1, -128, -1, 0, -128, -1, 0, 0, 63]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -48, -65, 0, -16, -1, 0, 48, -58, 0, 48, -58, 0, 48, -49, 0, 48, -49, 0, -112, -97, 0, -64, 63, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -128, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 1, 0, -128, 1, 0, -128, 15, 0, -64, 62, 0, -64, -8, 0, 96, -36, 2, 32, -98, 3, 0, -113, 1, -64, -97, 1, -16, -33, 0, -16, -33, 0, -8, 31, 0, -8, 63, 0, -8, 63, 0, -8, 63, 0, -16, 31, 0, -16, 31, 0, -64, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 4, 0, 0, 6, 0, 0, 31, 0, -128, 59, 0, -64, 113, 0, 0, -16, 0, 0, -4, 1, -16, -97, 1, -4, 31, 7, -4, -113, 3, -2, -49, 1, -2, -49, 0, -2, 79, 0, -4, 15, 0, -4, 15, 0, -8, 7, 0, -16, 7, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 28, 0, 0, 127, 0, 0, 99, 0, 112, -64, 0, -4, -9, 0, -2, -1, 1, -2, -65, 1, -2, -97, 1, -2, 15, 7, -2, -57, 3, -2, -25, 0, -4, 51, 0, -4, 3, 0, -16]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, -8, 3, -8, -13, 1, -8, 7, 3, -4, 15, 3, -4, 63, 3, -4, -1, 3, -4, -1, 3, -4, 63, 3, -4, 15, 3, -8, 7, 3, -8, -13, 1, -32, -8, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 0, 0, -4, 3, 0, -4, 51, 0, -2, -25, 0, -2, -57, 3, -2, 15, 7, -2, -97, 1, -2, -65, 1, -2, -1, 1, -4, -9, 0, 112, -64, 0, 0, 99, 0, 0, 127, 0, 0, 28, 0, 0, 48]),
$ta(Int8Array, 60, [0, 0, 0, -64, 1, 0, -16, 7, 0, -8, 7, 0, -4, 15, 0, -4, 15, 0, -2, 79, 0, -2, -49, 0, -2, -49, 1, -4, -113, 3, -4, 31, 7, -16, -97, 1, 0, -4, 1, 0, -16, 0, -64, 113, 0, -128, 59, 0, 0, 31, 0, 0, 6, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, -64, 15, 0, -16, 31, 0, -16, 31, 0, -8, 63, 0, -8, 63, 0, -8, 63, 0, -8, 31, 0, -16, -33, 0, -16, -33, 0, -64, -97, 1, 0, -113, 1, 32, -98, 3, 96, -36, 2, -64, -8, 0, -64, 62, 0, -128, 15, 0, -128, 1, 0, 0, 1])]);
  tng_fed_battleship_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 31, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -48, -65, 0, -80, -33, 0, 48, -49, 0, 48, -49, 0, -16, -1, 0, -16, -1, 0, -48, -65]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 63, 0, -128, -1, 0, -64, -1, 1, -64, -1, 1, -64, -1, 3, -64, -1, 3, -48, -1, 3, -80, -1, 1, -104, -1, 1, -104, -1, 0, -100, 31, 0, -2, -57, 0, -12, 99, 0, -16, 119, 0, -64, 63, 0, 0, 59, 0, 0, 24]),
$ta(Int8Array, 60, [0, 0, 0, 0, 56, 0, 0, -2, 0, 0, -2, 1, 0, -1, 3, 64, -1, 3, 96, -1, 7, 112, -1, 7, -72, -1, 7, -100, -1, 3, -68, -1, 3, -16, -1, 0, -16, 15, 0, -32, 113, 0, -64, 59, 0, -128, 31, 0, 0, 14, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 126, 0, 0, -1, 0, -32, -1, 1, 120, -1, 1, -98, -1, 3, -114, -1, 3, -40, -1, 3, -4, -1, 3, -8, -1, 3, -8, -1, 1, 112, -4, 0, 112, 7, 0, -64, 3, 0, -32, 1, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 121, 0, -8, -2, 1, 28, -1, 1, -100, -1, 3, -4, -1, 3, -4, -1, 3, -4, -1, 3, -4, -1, 3, -100, -1, 3, 28, -1, 1, -8, -2, 1, -4, 121]),
$ta(Int8Array, 60, [0, 0, 0, 64, 0, 0, -32, 0, 0, -64, 3, 0, -16, 15, 0, 112, 4, 0, 120, -8, 0, -8, -1, 1, -4, -1, 3, -4, -1, 3, -40, -1, 3, -114, -1, 3, -98, -1, 3, 60, -1, 3, 112, -1, 1, 64, -1, 1, 0, -2, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 14, 0, -128, 31, 0, -64, 59, 0, -32, 113, 0, -16, 15, 0, -16, -1, 0, -68, -1, 3, -100, -1, 3, -72, -1, 7, 112, -1, 7, 96, -1, 7, 64, -1, 3, 0, -1, 3, 0, -2, 1, 0, -2, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 24, 0, 0, 26, 0, -128, 63, 0, -32, 55, 0, -24, 99, 0, -4, 103, 0, -104, 95, 0, -72, -1, 0, -80, -1, 1, -32, -1, 1, -64, -1, 3, -64, -1, 3, -64, -1, 1, -64, -1, 1, -64, -1, 0, -128, 127, 0, 0, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -48, -65, 0, -16, -1, 0, -16, -1, 0, 48, -49, 0, 48, -49, 0, -80, -33, 0, -48, -65, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -32, 127, 0, -128, 31]),
$ta(Int8Array, 60, [0, 0, 0, -128, 1, 0, -128, 5, 0, -64, 31, 0, -64, 126, 0, 96, 124, 1, 96, -2, 3, -96, -97, 1, -16, -33, 1, -8, -33, 0, -8, 127, 0, -4, 63, 0, -4, 63, 0, -8, 63, 0, -8, 63, 0, -16, 63, 0, -32, 31, 0, -128, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 7, 0, -128, 31, 0, -64, 61, 0, -32, 120, 0, 0, -1, 0, -16, -1, 0, -4, -33, 3, -4, -97, 3, -2, -33, 1, -2, -17, 0, -2, 111, 0, -4, 47, 0, -4, 15, 0, -8, 7, 0, -16, 7, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 32, 0, 0, 112, 0, 0, 60, 0, 0, -1, 0, 0, -30, 0, -16, -31, 1, -8, -1, 1, -4, -1, 3, -4, -1, 3, -4, -65, 1, -4, 31, 7, -4, -97, 7, -4, -49, 3, -8, -17, 0, -8, 47, 0, -16, 7, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, -7, 3, -8, -9, 1, -8, -113, 3, -4, -97, 3, -4, -1, 3, -4, -1, 3, -4, -1, 3, -4, -1, 3, -4, -97, 3, -8, -113, 3, -8, -9, 1, -32, -7, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -128, 1, 0, -32, 7, 0, -16, 15, 0, -8, 127, 0, -8, -17, 1, -4, -97, 7, -4, 31, 7, -4, -65, 1, -4, -1, 3, -4, -1, 1, -8, -1, 1, -16, -29, 0, 0, -18, 0, 0, 60, 0, 0, 120, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, -64, 1, 0, -16, 7, 0, -8, 7, 0, -4, 15, 0, -4, 47, 0, -2, 111, 0, -2, -17, 0, -2, -33, 1, -4, -97, 3, -4, -33, 3, -16, -1, 0, 0, -1, 0, -32, 120, 0, -64, 61, 0, -128, 31, 0, 0, 7, 0, 0, 6]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, -64, 15, 0, -16, 31, 0, -8, 63, 0, -8, 63, 0, -4, 63, 0, -4, 63, 0, -4, -65, 0, -8, -33, 0, -8, -97, 1, -16, -97, 1, -128, -97, 3, 48, -2, 7, 96, -4, 2, -32, -2, 0, -64, 63, 0, -64, 13, 0, -128, 1])]);
  tng_fed_assault_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 31, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -80, -33, 0, 48, -49, 0, 32, 79, 0, -128, 31, 0, 0, 15, 0, -128, 31, 0, 0, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, -64, 31, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -8, -1, 1, -104, -1, 0, -112, -1, 0, -32, 103, 0, -64, 99, 0, -16, 55, 0, -32, 1, 0, -64, 3]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 15, 0, -64, 63, 0, -32, 127, 0, -16, 127, 0, -80, -1, 0, -48, -1, 0, -128, -1, 0, -32, -1, 0, -32, -1, 0, -8, 117, 0, -8, 57, 0, 112, 28, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, -64, 63, 0, -32, 127, 0, -16, 127, 0, 16, -1, 0, -96, -1, 0, -16, -1, 1, -4, -1, 0, -8, -1, 0, -8, 120, 0, -16, 60, 0, 32, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, -128, -1, 0, 0, -4, 0, 80, -2, 1, -8, -1, 1, -8, -1, 1, -8, -1, 1, -8, -1, 1, 80, -2, 1, 0, -4, 0, -128, -1, 0, 0, 127]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 32, 31, 0, -80, 124, 0, -8, -4, 0, -8, -1, 0, -8, -1, 1, -24, -1, 1, -96, -1, 1, 0, -1, 0, 32, -1, 0, -32, 127, 0, -64, 127, 0, 0, 31, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 112, 28, 0, -8, 57, 0, -8, 117, 0, -32, -1, 0, -32, -1, 0, -128, -1, 0, -48, -1, 0, -80, -1, 0, -16, 127, 0, -32, 127, 0, -64, 63, 0, -128, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 1, 0, -64, 1, 0, -32, 27, 0, -16, 55, 0, -32, 115, 0, -32, 119, 0, -112, 127, 0, -112, -1, 0, -80, -1, 0, -16, -1, 0, -32, -1, 0, -32, 127, 0, -64, 63, 0, -128, 15, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, -128, 31, 0, 0, 15, 0, -128, 31, 0, 32, 79, 0, 48, -49, 0, -80, -33, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -128, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 56, 0, -128, 125, 0, -64, -2, 0, -32, 124, 0, -32, 126, 0, -32, -97, 0, -16, -97, 0, -16, -33, 0, -16, -1, 0, -16, 127, 0, -32, 127, 0, -64, 63, 0, 0, 31, 0, 0, 4]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, -128, -29, 0, -64, -7, 1, -32, -6, 1, -16, 127, 0, -16, 127, 0, -16, 31, 0, -16, -65, 0, -16, -33, 0, -32, -1, 0, -32, 127, 0, -64, 63, 0, 0, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, -128, 79, 0, -32, -45, 0, -16, -13, 1, -16, -1, 1, -8, -1, 1, -8, 127, 1, -8, 95, 0, -16, 15, 0, -16, 79, 0, -32, 127, 0, -32, 63, 0, -128, 15, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 15, 0, -16, 31, 0, -16, 3, 0, -8, -89, 0, -8, -1, 1, -8, -1, 1, -8, -1, 1, -8, -1, 1, -8, -89, 0, -16, 3, 0, -16, 31, 0, -32, 15]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 7, 0, -64, 63, 0, -32, 127, 0, -32, -1, 0, -16, -113, 0, -16, 95, 0, -8, -1, 0, -16, -1, 3, -16, -1, 1, -32, -15, 1, -64, -13, 0, 0, 79]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, -64, 63, 0, -32, 127, 0, -32, -1, 0, -16, -33, 0, -16, -65, 0, -16, 31, 0, -16, 127, 0, -16, 127, 0, -32, -6, 1, -64, -7, 1, -128, -29, 0, 0, 96]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, -128, 63, 0, -32, 127, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -8, -1, 1, -16, -97, 1, -16, -97, 0, 96, 126, 0, 96, 60, 0, -64, -2, 0, 0, 120, 0, 0, 60])]);
  tng_fed_destroyer_bits = $rows([$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 31, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -128, 31, 0, 0, 15, 0, 64, 38, 0, 64, 47, 0, -64, 63, 0, -64, 57, 0, 64, 32, 0, 64, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 7, 0, -64, 63, 0, -32, 127, 0, -64, -1, 0, -64, -1, 1, -128, -1, 1, 0, -1, 1, 32, 127, 0, 32, 7, 0, -16, 3, 0, -112, 11, 0, 8, 14, 0, 0, 4, 0, 0, 4, 0, 0, 2]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 127, 0, 0, -1, 0, 0, -1, 0, 0, -2, 1, 64, -2, 1, 32, -2, 1, -16, -1, 1, -56, -29, 0, 0, 3, 0, 0, 11, 0, 0, 6, 0, 0, 2, 0, 0, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 124, 0, 0, -4, 0, 0, -4, 1, -128, -3, 1, 112, -4, 3, 104, -2, 3, -64, -1, 3, -128, -5, 3, 0, -31, 3, -128, -63, 1, -128, 13, 0, -128, 3, 0, 64]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -16, 1, -16, -13, 1, -64, -8, 3, -64, -3, 3, -128, -1, 3, -128, -1, 3, -64, -3, 3, -64, -8, 3, -16, -13, 1, 0, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, -128, 3, 0, -128, 13, 0, -128, -63, 1, 0, -31, 3, -128, -5, 3, -64, -1, 3, 104, -2, 3, 112, -4, 3, -128, -3, 1, 0, -4, 1, 0, -4, 0, 0, 124, 0, 0, 56]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 6, 0, 0, 11, 0, 0, 3, 0, -56, -29, 0, -16, -1, 1, 32, -2, 1, 64, -2, 1, 0, -2, 1, 0, -1, 0, 0, -1, 0, 0, 127, 0, 0, 30]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 0, 4, 0, 8, 14, 0, -112, 11, 0, -16, 3, 0, 32, 7, 0, 32, 127, 0, 0, -1, 1, -128, -1, 1, -64, -1, 1, -64, -1, 0, -32, 127, 0, -64, 63, 0, -128, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 32, 0, 64, 32, 0, -64, 57, 0, -64, 63, 0, 64, 47, 0, 64, 38, 0, 0, 15, 0, -128, 31, 0, -32, 127, 0, -16, -1, 0, -16, -1, 0, -16, -1, 0, -32, 127, 0, -128, 31]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 0, 0, 2, 0, 0, 7, 1, 0, -99, 0, 0, -4, 0, 0, 78, 0, -32, 79, 0, -8, 15, 0, -8, 31, 0, -8, 63, 0, -16, 63, 0, -32, 127, 0, -64, 63, 0, 0, 30]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 4, 0, 0, 6, 0, 0, 13, 0, 0, 12, 0, 112, 60, 1, -8, -1, 0, -8, 71, 0, -8, 39, 0, -8, 7, 0, -16, 15, 0, -16, 15, 0, -32, 15, 0, -128, 7]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 28, 0, 0, 27, 0, 56, 24, 0, 124, 8, 0, -4, 29, 0, -4, 63, 0, -4, 103, 1, -4, -29, 0, -8, 27, 0, -8, 3, 0, -16, 3, 0, -32, 3, 0, -64, 1]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 0, 0, -16, 1, 0, -16, -7, 1, -8, 99, 0, -8, 119, 0, -8, 63, 0, -8, 63, 0, -8, 119, 0, -8, 99, 0, -16, -7, 1, -16, 1, 0, -32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, -32, 3, 0, -16, 3, 0, -8, 3, 0, -8, 27, 0, -4, -29, 0, -4, 103, 1, -4, 63, 0, -4, 29, 0, 124, 8, 0, 56, 24, 0, 0, 27, 0, 0, 28, 0, 0, 32]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 7, 0, -32, 15, 0, -16, 15, 0, -16, 15, 0, -8, 7, 0, -8, 39, 0, -8, 71, 0, -8, -1, 0, 112, 60, 1, 0, 12, 0, 0, 13, 0, 0, 6, 0, 0, 4, 0, 0, 8]),
$ta(Int8Array, 60, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0, -64, 63, 0, -32, 127, 0, -16, 63, 0, -8, 63, 0, -8, 31, 0, -8, 15, 0, -32, 79, 0, 0, 78, 0, 0, -4, 0, 0, -99, 0, 0, 7, 1, 0, 2, 0, 0, 2, 0, 0, 4])]);
  hull_bits = $rows([$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4]),
$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4]),
$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8]),
$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8]),
$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8]),
$ta(Int8Array, 66, [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8]),
$ta(Int8Array, 66, [0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8])]);
  clock_bits = $ta(Int8Array, 288, [0, 0, -8, 15, 0, 0, 0, -128, -121, -16, 0, 0, 0, 96, -128, 0, 3, 0, 0, 24, -128, 0, 12, 0, 0, 20, 0, 0, 16, 0, 0, 35, 0, 0, 104, 0, -128, 0, 0, 0, -124, 0, 64, 0, 0, 0, 0, 1, 32, 0, 0, 0, 0, 2, 32, 0, 0, 0, 0, 2, 16, 0, 0, 0, 0, 4, 24, 0, 0, 0, 0, 8, 40, 0, 0, 0, 0, 12, 4, 0, 0, 0, 0, 18, 4, 0, 0, 0, 0, 16, 2, 0, 0, 0, 0, 32, 2, 0, 0, 0, 0, 32, 2, 0, 0, 0, 0, 32, 2, 0, 0, 0, 0, 32, 1, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, 64, 15, 0, -128, 0, 0, 120, 1, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, 64, 2, 0, 0, 0, 0, 32, 2, 64, -35, 93, 1, 32, 2, 64, 73, 69, 1, 32, 2, -128, -56, -52, 0, 32, 4, 64, 73, 69, 1, 16, 4, 64, 73, 93, 1, 16, 40, 0, 0, 0, 0, 10, 24, 0, 0, 0, 0, 12, 16, 0, 112, 7, 0, 4, 32, 0, 32, 2, 0, 2, 32, 0, 32, 2, 0, 2, 64, 0, 32, 2, 0, 1, -128, 0, 112, 7, -128, 0, 0, 35, 0, 0, 98, 0, 0, 20, 0, 0, 20, 0, 0, 24, -128, 0, 12, 0, 0, 96, -128, 0, 3, 0, 0, -128, -121, -16, 0, 0, 0, 0, -8, 15]);
  ex_bits = $rows([$ta(Int8Array, 512, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 8, 0, 0, 0, 0, 0, 0, 74, 8, 0, 0, 0, 0, 0, 98, 8, 56, 0, 0, 0, 0, 32, 0, 0, 56, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 64, 4, 10, 0, 18, 0, 0, 0, 2, 0, 8, 0, 2, 0, 0, 16, -116, 6, 8, 16, 0, 0, 0, 0, 16, 26, 0, 0, 0, 0, 0, 0, -2, 28, 8, 2, 0, 0, 0, 0, 7, 11, 32, 0, 0, 0, 0, -128, 11, 8, 24, 0, 0, 0, 0, -60, -32, 15, 6, 0, 0, 0, 0, 112, -108, 21, 32, 0, 0, 0, 0, 48, -43, 117, 32, 0, 0, 0, 0, 4, -107, 34, 0, 0, 0, 0, 32, 2, 96, 27, 0, 0, 0, -128, 1, 0, -12, 30, 0, 0, 0, 0, 0, 0, 16, 1, 50, 0, 0, 0, 0, 0, -92, 38, 6, 0, 0, 0, 0, 4, 3, 40, 8, 0, 0, 0, 0, 64, -128, 38, -96, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 16, 0, 48, 12, 80, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 24, 0, -128, 0, 0, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0, 0, -16, 19, 3, 0, 0, 0, 0, 96, -64, 1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]),
$ta(Int8Array, 512, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 2, -128, 0, 0, 0, 0, 0, 0, 0, 64, 1, 0, 0, 0, 0, -128, 4, 16, 0, 0, 0, 0, 0, 0, 0, -126, 0, 0, 4, 8, 0, 0, 0, 68, 0, 0, 0, 0, 0, 4, 0, -128, 0, 0, 8, 8, 0, -120, 0, 0, 0, 0, 0, 0, 0, 0, -96, -64, 0, 0, 0, 0, 0, 0, -88, 37, 0, 0, 0, 0, 0, 32, 0, 18, 2, 0, 0, 0, 0, 0, -127, 2, 2, 0, 0, 0, 0, 0, 96, 18, 44, 0, 0, 0, 0, 34, -110, 0, 18, 0, 0, 16, 0, 0, 64, 4, 0, 0, 0, 16, 0, 18, 66, 0, 8, 0, 0, 0, 0, 0, 40, 72, 0, 0, 0, 0, 0, 0, 32, 71, 2, 0, 0, 0, 0, 32, 40, 72, 0, 0, 0, 0, 0, 0, 66, 24, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, -64, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, -128, 0, 32, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 64, 20, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 32, 8, 32]),
$ta(Int8Array, 512, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, -128, 32, 0, 0, 0, 0, -124, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 8, 2, 0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 80, 0, 9, 0, 0, 0, 0, 0, -111, 9, 0, 0, 0, 0, 0, 1, 0, 4, 32, 0, 0, 0, 0, 0, 64, 68, 64, 0, 0, 0, 0, 16, -128, 0, 0, 0, 0, 0, 0, 0, 48, 68, -128, 16, 0, 0, 4, 64, 0, 0, 0, 5, 0, 0, 0, 1, -120, 0, 64, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 68, 0, 32, 0, 0, 2, 0, 0, 0, 0, 18, 0, 4, 0, 0, 0, 0, 0, 0, 34, 64, 0, 0, 0, 0, 0, 8, 18, 4, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 16, -112, 32, 0, 0, 0, 0, 64, 32, 48, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, -64, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 16, 1, 0, 0, 0, 0, 0, 32, 8, 0, 0, 0, 0, 0, 0, 0, 64]),
$ta(Int8Array, 512, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 64, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, -128, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 72, 0, -128, 0, 0, 0, 0, 64, 0, 0, 8, 0, 0, 0, 0, 0, 68, 17, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 1, 4, 0, 0, 0, 2, 64, 8, 0, 4, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 32, 8, 2, 16, 8, 0, 0, 0, 8, 0, 0, 64, 0, 8, 0, 8, 0, 0, 0, 0, 1, 0, 4, 0, -126, 0, 0, 8, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 64, 0, 8, 2, 0, 16, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32, 0, 0, 0, 0, -128, 0, -128, 0, 0, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 0, 4, 34, 32, 0, 0, 0, 0, 64, 0, 0, 16, 0, 0, 0, 4, 0, 8, 64, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 8, 16, -64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 32, 1]),
$ta(Int8Array, 512, [0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 0, 64, 8, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 66, 33, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 64, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 4, -128, 0, 0, 32, 0, 32, 16, 0, 0, 0, 0, 0, 0, -128, 0, 0, 0, 0, 0, 0, 0, 16, 0, 8, 0, 2, 0, 0, 0, 2, 8, 0, 0, 16, 0, -128, 0, 0, 0, 0, 0, 64, 0, 0, -128, 0, 0, 0, 0, 1, 32, 0, 0, -128, 0, 0, -128, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 16, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 16, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 2, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 68, 0, 0, 0, 0, 0, 16, 0, 0, -128, 0, 0, 32, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 32, 0, 0, 0, 1, 8, -128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 32, 8])]);
  plasmacloud_bits = $rows([$ta(Int8Array, 26, [64, 0, -14, 9, -4, 7, -4, 7, -2, 15, -2, 15, -1, 31, -2, 15, -2, 15, -4, 7, -4, 7, -14, 9, 64]),
$ta(Int8Array, 26, [64, 0, 66, 8, 68, 4, -24, 2, -16, 1, -8, 3, -1, 31, -8, 3, -16, 1, -24, 2, 68, 4, 66, 8, 64]),
$ta(Int8Array, 26, [0, 0, 0, 0, 64, 0, 72, 2, 80, 1, -32, 0, -68, 7, -32, 0, 80, 1, 72, 2, 64]),
$ta(Int8Array, 26, [0, 0, 0, 0, 0, 0, 64, 0, 64, 0, 64, 0, -72, 3, 64, 0, 64, 0, 64]),
$ta(Int8Array, 26, [0, 0, 0, 0, 0, 0, 64, 0, 64, 0, 64, 0, -72, 3, 64, 0, 64, 0, 64])]);
  cloud_bits = $rows([$ta(Int8Array, 8, [0, 0, 16, 40, 84, 40, 16]),
$ta(Int8Array, 8, [0, 16, 40, 84, -86, 84, 40, 16]),
$ta(Int8Array, 8, [0, 40, 84, -126, 68, -126, 84, 40]),
$ta(Int8Array, 8, [0, 84, -126, 0, -126, 0, -126, 84]),
$ta(Int8Array, 8, [0, 40, 0, -126, 0, -126, 0, 40])]);
  etorp_bits = $ta(Int8Array, 3, [5, 2, 5]);
  eplasmatorp_bits = $ta(Int8Array, 7, [8, 42, 28, 127, 28, 42, 8]);
  mtorp_bits = $ta(Int8Array, 3, [2, 7, 2]);
  mplasmatorp_bits = $ta(Int8Array, 5, [4, 14, 31, 14, 4]);
  indplanet_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 1, 0, 0, 16, 2, 0, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  indmplanet_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, 2, 32, 2, 32, 1, 64, 1, 64, 1, 64, 1, 64, 1, 64, 2, 32, 2, 32, 4, 16, 24, 12, -32, 3]);
  planet_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, 4, -16, 3, 4, 2, -8, 7, 8, 2, 28, 14, 8, 2, 12, 12, 8, 1, 0, 12, 16, 1, 0, 14, 16, 1, 0, 7, 16, 1, -128, 3, 16, 1, -64, 1, 16, 1, -64, 0, 16, 1, -64, 0, 16, 2, -64, 0, 8, 2, 0, 0, 8, 2, 0, 0, 8, 4, -64, 0, 4, 4, -64, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  fedplanet_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 64, 0, 4, 4, -32, 0, 4, 2, -32, 0, 8, 2, -16, 1, 8, 2, -16, 1, 8, 1, -8, 3, 16, 1, -8, 3, 16, 1, -4, 7, 16, 1, -4, 7, 16, 1, -2, 15, 16, 1, -66, 15, 16, 1, 31, 31, 16, 2, 15, 30, 8, -126, 7, 60, 8, -126, 3, 56, 8, -124, 1, 48, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  oriplanet_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 64, 0, 1, 8, 64, 0, 2, 4, 72, 2, 4, 4, 73, 18, 4, -126, -1, 63, 8, 2, 1, 16, 8, 2, 1, 16, 8, -63, -31, 112, 16, 1, -15, 17, 16, 1, -7, 19, 16, -15, -7, -13, 17, 1, -7, 19, 16, 1, -15, 17, 16, -63, -31, 112, 16, 2, 1, 16, 8, 2, 1, 16, 8, -126, -1, 63, 8, 4, 73, 18, 4, 4, 72, 2, 4, 8, 64, 0, 2, 16, 64, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  kliplanet_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 64, 96, 0, 32, 64, -128, 0, 16, 64, 0, 1, 8, 64, 0, 2, 4, 64, 0, 4, 4, 64, 0, 4, 2, -32, 0, 8, 2, -32, 0, 8, 2, -32, 0, 8, 1, -16, 1, 16, 1, -16, 1, 16, 1, -16, 1, 16, 1, -8, 3, 16, 1, -16, 1, 16, 1, -26, 12, 16, 1, 79, 30, 16, 2, 31, 63, 8, -126, 31, 127, 8, -126, 15, -2, 8, -60, 7, -8, 5, -60, 1, 0, 4, -56, 0, 0, 2, 80, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  romplanet_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 64, -128, 0, 16, -32, 0, 1, 8, -8, 3, 2, 4, -96, 0, 4, 4, -96, 0, 4, 2, -80, 1, 8, 2, -84, 6, 8, 2, -86, 9, 8, 1, 74, 9, 16, 1, 17, 17, 16, 1, 33, 17, 16, 1, 33, 17, 16, 1, -63, 16, 16, 1, 1, 22, 16, 1, 2, 9, 16, 2, 2, 9, 8, 2, 12, 6, 8, 2, -16, 1, 8, 4, -96, 0, 4, 4, -96, 0, 4, 8, -96, 0, 2, 16, 64, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  mplanet_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, 2, 32, -62, 33, 33, 66, 1, 66, 1, 65, -127, 64, -127, 64, 2, 32, -126, 32, 4, 16, 24, 12, -32, 3]);
  klimplanet_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, -124, 16, -126, 32, -126, 32, -63, 65, -63, 65, -63, 65, -79, 66, 113, 71, 58, 39, 10, 44, 4, 16, 24, 12, -32, 3]);
  rommplanet_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, -124, 16, -126, 32, -62, 33, -95, 66, 49, 69, -47, 68, 17, 71, -95, 66, -62, 33, -126, 32, -124, 16, 24, 12, -32, 3]);
  orimplanet_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, -126, 32, -94, 34, -15, 71, 33, 66, -71, 78, 33, 66, -15, 71, -94, 34, -126, 32, 4, 16, 24, 12, -32, 3]);
  fedmplanet_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, 2, 32, -126, 32, -63, 65, -63, 65, -31, 67, -31, 67, 113, 71, 50, 38, 2, 32, 4, 16, 24, 12, -32, 3]);
  mplanet111_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 68, 17, 90, 33, -38, 33, -127, 76, -103, 84, -91, 84, -67, 84, -91, 92, -38, 33, 90, 33, 68, 17, 24, 12, -32, 3]);
  mplanet110_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 68, 17, 90, 33, -38, 33, -127, 64, -103, 64, -91, 64, -67, 64, -91, 64, -38, 33, 90, 33, 68, 17, 24, 12, -32, 3]);
  mplanet101_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, 26, 32, 26, 32, 1, 76, 25, 84, 37, 84, 61, 84, 37, 92, 26, 32, 26, 32, 4, 16, 24, 12, -32, 3]);
  mplanet100_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, 26, 32, 26, 32, 1, 64, 25, 64, 37, 64, 61, 64, 37, 64, 26, 32, 26, 32, 4, 16, 24, 12, -32, 3]);
  mplanet011_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 68, 17, 66, 33, -62, 33, -127, 76, -127, 84, -127, 84, -127, 84, -127, 92, -62, 33, 66, 33, 68, 17, 24, 12, -32, 3]);
  mplanet010_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 68, 17, 66, 33, -62, 33, -127, 64, -127, 64, -127, 64, -127, 64, -127, 64, -62, 33, 66, 33, 68, 17, 24, 12, -32, 3]);
  mplanet001_bits = $ta(Int8Array, 32, [-32, 3, 24, 12, 4, 16, 2, 32, 2, 32, 1, 76, 1, 84, 1, 84, 1, 84, 1, 92, 2, 32, 2, 32, 4, 16, 24, 12, -32, 3]);
  planet111_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 16, 97, 0, 32, 24, -125, 0, 16, 24, 3, 1, 8, 24, 3, 2, 4, -8, 3, 4, -60, -7, 3, 4, -62, -31, 0, 8, -62, -31, -8, 8, -126, 64, 8, 9, -15, -25, 8, 18, -23, 75, -88, 18, -87, -22, 72, 18, -23, 75, -88, 18, -87, -22, 8, 18, -23, 75, 8, 18, 97, -29, 8, 18, 98, 67, 8, 10, 98, -29, -8, 11, 98, -29, 0, 8, 100, -5, 3, 4, 4, -8, 3, 4, 8, 24, 3, 2, 16, 24, 3, 1, 32, 24, -125, 0, -64, 16, 97, 0, 0, 7, 28, 0, 0, -8, 3]);
  planet110_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 16, 97, 0, 32, 24, -125, 0, 16, 24, 3, 1, 8, 24, 3, 2, 4, -8, 3, 4, -60, -7, 3, 4, -62, -31, 0, 8, -62, -31, 0, 8, -126, 64, 0, 8, -15, -25, 0, 16, -23, 75, 0, 16, -87, -22, 0, 16, -23, 75, 0, 16, -87, -22, 0, 16, -23, 75, 0, 16, 97, -29, 0, 16, 98, 67, 0, 8, 98, -29, 0, 8, 98, -29, 0, 8, 100, -5, 3, 4, 4, -8, 3, 4, 8, 24, 3, 2, 16, 24, 3, 1, 32, 24, -125, 0, -64, 16, 97, 0, 0, 7, 28, 0, 0, -8, 3]);
  planet101_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, -60, 1, 0, 4, -62, 1, 0, 8, -62, 1, -8, 8, -126, 0, 8, 9, -15, 7, 8, 18, -23, 11, -88, 18, -87, 10, 72, 18, -23, 11, -88, 18, -87, 10, 8, 18, -23, 11, 8, 18, 97, 3, 8, 18, 98, 3, 8, 10, 98, 3, -8, 11, 98, 3, 0, 8, 100, 3, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  planet100_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, -60, 1, 0, 4, -62, 1, 0, 8, -62, 1, 0, 8, -126, 0, 0, 8, -15, 7, 0, 16, -23, 11, 0, 16, -87, 10, 0, 16, -23, 11, 0, 16, -87, 10, 0, 16, -23, 11, 0, 16, 97, 3, 0, 16, 98, 3, 0, 8, 98, 3, 0, 8, 98, 3, 0, 8, 100, 3, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  planet011_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 16, 97, 0, 32, 24, -125, 0, 16, 24, 3, 1, 8, 24, 3, 2, 4, -8, 3, 4, 4, -8, 3, 4, 2, -32, 0, 8, 2, -32, -8, 8, 2, 64, 8, 9, 1, -32, 8, 18, 1, 64, -88, 18, 1, -32, 72, 18, 1, 64, -88, 18, 1, -32, 8, 18, 1, 64, 8, 18, 1, -32, 8, 18, 2, 64, 8, 10, 2, -32, -8, 11, 2, -32, 0, 8, 4, -8, 3, 4, 4, -8, 3, 4, 8, 24, 3, 2, 16, 24, 3, 1, 32, 24, -125, 0, -64, 16, 97, 0, 0, 7, 28, 0, 0, -8, 3]);
  planet010_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 16, 97, 0, 32, 24, -125, 0, 16, 24, 3, 1, 8, 24, 3, 2, 4, -8, 3, 4, 4, -8, 3, 4, 2, -32, 0, 8, 2, -32, 0, 8, 2, 64, 0, 8, 1, -32, 0, 16, 1, 64, 0, 16, 1, -32, 0, 16, 1, 64, 0, 16, 1, -32, 0, 16, 1, 64, 0, 16, 1, -32, 0, 16, 2, 64, 0, 8, 2, -32, 0, 8, 2, -32, 0, 8, 4, -8, 3, 4, 4, -8, 3, 4, 8, 24, 3, 2, 16, 24, 3, 1, 32, 24, -125, 0, -64, 16, 97, 0, 0, 7, 28, 0, 0, -8, 3]);
  planet001_bits = $ta(Int8Array, 120, [0, -8, 3, 0, 0, 7, 28, 0, -64, 0, 96, 0, 32, 0, -128, 0, 16, 0, 0, 1, 8, 0, 0, 2, 4, 0, 0, 4, 4, 0, 0, 4, 2, 0, 0, 8, 2, 0, -8, 8, 2, 0, 8, 9, 1, 0, 8, 18, 1, 0, -88, 18, 1, 0, 72, 18, 1, 0, -88, 18, 1, 0, 8, 18, 1, 0, 8, 18, 1, 0, 8, 18, 2, 0, 8, 10, 2, 0, -8, 11, 2, 0, 0, 8, 4, 0, 0, 4, 4, 0, 0, 4, 8, 0, 0, 2, 16, 0, 0, 1, 32, 0, -128, 0, -64, 0, 96, 0, 0, 7, 28, 0, 0, -8, 3]);
  shield_bits = $rows([$ta(Int8Array, 60, [64, 41, 0, 16, -128, 0, 0, 0, 0, 4, 0, 2, 0, 0, 0, 2, 0, 4, 0, 0, 0, 1, 0, 8, 0, 0, 0, 1, 0, 8, 1, 0, 8, 0, 0, 0, 1, 0, 8, 0, 0, 0, 2, 0, 4, 0, 0, 0, 4, 0, 2, 0, 0, 0, 16, -128, 0, 64, 41]),
$ta(Int8Array, 60, [-64, 54, 0, 32, 64, 0, 8, 0, 1, 4, 0, 2, 0, 0, 0, 2, 0, 4, 1, 0, 8, 1, 0, 8, 0, 0, 0, 1, 0, 8, 1, 0, 8, 0, 0, 0, 1, 0, 8, 1, 0, 8, 2, 0, 4, 0, 0, 0, 4, 0, 2, 8, 0, 1, 32, 64, 0, -64, 54]),
$ta(Int8Array, 60, [-64, 63, 0, 48, -64, 0, 8, 0, 1, 4, 0, 2, 2, 0, 4, 2, 0, 4, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 2, 0, 4, 2, 0, 4, 4, 0, 2, 8, 0, 1, 48, -64, 0, -64, 63]),
$ta(Int8Array, 60, [-64, 63, 0, 112, -32, 0, 24, -128, 1, 12, 0, 3, 6, 0, 6, 2, 0, 4, 3, 0, 12, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 3, 0, 12, 2, 0, 4, 6, 0, 6, 12, 0, 3, 24, -128, 1, 112, -32, 0, -64, 63]),
$ta(Int8Array, 60, [-64, 63, 0, 112, -32, 0, 24, -128, 1, 12, 0, 3, 6, 0, 6, 2, 0, 4, 3, 0, 12, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 1, 0, 8, 3, 0, 12, 2, 0, 4, 6, 0, 6, 12, 0, 3, 24, -128, 1, 112, -32, 0, -64, 63])]);
  cloak_bits = $ta(Int8Array, 60, [0, 7, 0, 0, 0, 0, 16, 64, 0, 8, -126, 0, 4, 0, 1, 32, 32, 0, 0, 2, 0, -128, 8, 0, 1, 0, 4, 73, -112, 4, 1, 0, 4, -128, 8, 0, 0, 2, 0, 32, 32, 0, 4, 0, 1, 8, -126, 0, 16, 64, 0, 0, 0, 0, 0, 7]);
  icon_bits = $ta(Int8Array, 1120, [-2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 115, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, -8, 1, 38, 0, 1, 0, 0, 0, 0, 0, -128, -63, 31, 124, 32, 113, -86, -85, 3, 0, 0, 0, 0, 0, -128, -127, 15, 56, 32, 23, -78, 16, 1, 0, 0, 0, 0, 0, -128, 1, 15, 24, 32, 117, -94, 43, 3, 0, 0, 0, 0, 0, -128, 1, 30, 12, 0, 0, 0, 0, 0, 0, -128, -1, -1, -1, -127, 1, 30, 12, 0, -32, 1, 0, -120, 4, -128, -1, -1, -1, -127, 1, 60, 6, 0, 32, -36, -36, -43, 113, -125, -32, -61, 7, -127, 1, 60, 3, 0, 32, 69, 69, -100, 84, 5, -64, -127, 3, -128, 1, 120, 3, 0, -32, 93, 93, -108, 117, 5, -64, -127, 3, -128, 1, -8, 1, 0, 0, 0, 0, 0, 0, 0, -64, -127, 3, -128, 1, -16, 0, 0, 0, 0, 0, 0, 0, 0, -64, -127, 3, -128, 1, -16, 0, -4, -113, 127, -128, -113, -31, 0, -64, -127, 3, -128, 1, -32, 1, -2, -121, -1, -32, -121, 113, 0, -64, -127, 3, -128, 1, -32, 1, 96, -128, -31, 112, -128, 57, 0, -64, -127, 3, -128, 1, -16, 3, 96, -128, 113, 56, -128, 29, 0, -64, -127, 3, -128, 1, -40, 3, 96, -128, 57, 24, -128, 15, 0, -64, -127, 3, -128, 1, -104, 7, 96, -128, 29, -8, -121, 63, 0, -64, -127, 3, -128, 1, -116, 7, 96, -128, 127, -8, -125, 127, 0, -64, -127, 3, -128, 1, 6, 15, 96, -128, -31, 24, -128, -31, 0, -64, -127, 3, -128, 1, 6, 15, 96, -128, -63, 56, -128, -63, 0, -64, -127, 3, -128, 1, 3, 31, 96, -128, -63, 112, -120, -63, -128, -32, -61, 7, -127, -127, 3, 62, 96, -128, -63, -32, -113, -63, -121, -1, -1, -1, -127, -31, 7, -1, -16, -64, -29, -128, -57, -29, -125, -1, -1, -1, -127, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, -63, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -127, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -4, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, -128, -1, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, -4, -1, -1, 7, 0, -64, -1, 3, -2, -1, -1, 7, -128, 1, -2, -1, -1, 15, 0, -2, -1, 127, -2, -1, -1, 1, -128, 1, 64, 0, -64, -128, 0, -1, -1, -1, 0, 6, 0, 0, -128, -127, -128, -1, -65, -1, 0, 0, -1, -8, -1, -1, 3, 0, -128, -127, 127, -1, 31, -128, 0, 0, 24, -16, -1, -1, 3, 0, -128, -127, 4, -1, 31, 0, 0, 0, 0, -16, -1, 15, 0, 0, -128, 1, 4, -3, 23, -18, 1, 0, 0, -32, 127, 0, 0, 0, -128, 1, -128, -7, 19, 120, 0, 0, 0, -128, 31, 0, 0, 0, -128, 1, 0, -15, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -3, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -7, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -7, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -16, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -16, 17, 0, 0, 0, 0, 0, 0, 0, 4, 0, -128, 1, 0, -8, 19, 0, 0, 0, 0, 0, 0, -128, 46, 0, -128, 1, 0, -16, 1, 0, 0, 0, 0, 0, 0, 64, 95, 0, -128, 1, 0, 64, 0, 0, 0, 0, 0, 0, 0, -4, -1, 7, -128, 1, 0, 64, 0, 0, 0, 0, 0, 0, -128, -25, -18, 60, -128, 1, 0, 65, 0, 0, 0, 0, 0, 0, 96, -128, 49, -64, -128, 1, 0, 71, 4, 0, 0, 0, 0, 0, 16, 96, -50, 0, -127, 1, 0, -7, 3, 0, 0, 0, 0, 0, 16, 0, 0, 0, -127, 1, 0, -28, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, -32, 0, 0, -128, 127, 0, 0, 0, 0, 0, 0, -128, 1, 0, -32, 0, 0, -64, 31, 0, 0, 0, 0, 0, 0, -128, 1, 0, -32, 0, 0, -32, 63, 0, 0, 0, 0, 0, 0, -128, 1, 0, -16, 1, 0, -8, -1, 0, 0, 0, 0, 0, 0, -128, 1, 0, -32, 0, 0, 124, -16, 63, 0, 0, 0, 0, 0, -128, 1, 0, 64, 0, 0, -6, -1, -1, -2, 127, 0, 0, 0, -128, 1, 0, -32, 0, 0, -124, 15, 125, -1, -1, 7, 0, 0, -128, 1, 0, 64, 0, -16, -1, -1, -5, -1, -1, 3, 0, 0, -128, 1, 0, 0, 0, -16, -1, -1, 63, -4, 63, 0, 0, 0, -128, 1, 0, 0, 0, 0, -2, -1, 3, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -128, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -64, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -32, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 127]);
  motd_offset = 0;
  G.motd_last = 0;
  G.motd_clears = 0;
  G.motd_refresh_needed = 0;
  motd_lines = null;
  stipple_bits = $ta(Int8Array, 32, [1, 1, 2, 2, 4, 4, 8, 8, 16, 16, 32, 32, 64, 64, -128, -128, 1, 1, 2, 2, 4, 4, 8, 8, 16, 16, 32, 32, 64, 64, -128, -128]);
  tract_bits = $ta(Int8Array, 5, [31, 4, 4, 4, 4]);
  press_bits = $ta(Int8Array, 5, [15, 17, 15, 1, 1]);
  newwin_last_hostmon = null;
  newwin_last_progname = null;
  entrywindow$previous_team = -1;
  entrywindow$previous_ship = -1;
  showValues$msg = S("Server options set:");
  newMotdLine$old = null;
  newMotdLine$statmode = 0;
  redrawTeam$teams = [S("Federation"),
S("Romulan"),
S("Klingon"),
S("Orion")];
}
