// C-Dogs SDL 2.5.0, translated: the end screens (screens_end.c): victory, dogfight and deathmatch scores.
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { AnyButton, CLAMP_OPPOSITE, CMD_DOWN, CMD_UP, DIRECTION_DOWN, MAX, MIN, colorDarker, colorGreen, colorPurple, colorRed, colorWhite, rand, type Vec2i } from '../core/base.ts';
import { FPS_FRAMELIMIT } from '../core/classes.ts';
import { ConfigGetInt } from '../core/config.ts';
import { GAME_MODE_DEATHMATCH, GAME_MODE_DOGFIGHT, gCampaign, gPlayerDatas, type Campaign } from '../core/state.ts';
import type { PlayerData } from '../core/types.ts';
import { GetNumPlayers, IsPlayerAlive, PLAYER_ANY, PlayerDataGetByUID } from '../core/player.ts';
import { gSoundDevice, SoundPlay, StrSound } from '../core/sounds.ts';
import { MUSIC_VICTORY, MusicPlayFromChunk } from '../core/music.ts';
import { ALIGN_CENTER, FontChMask, FontH, FontOptsNew, FontStr, FontStrMask, FontStrOpt, FontStrW, gGfx } from '../render/gfx.ts';
import {
  MENU_SOUND_BACK, MENU_SOUND_SWITCH, MENU_TYPE_NORMAL, MENU_TYPE_RETURN, MenuAddExitType, MenuAddSubmenu, MenuCreateCustom, MenuCreateNormal,
  MenuCreateReturn, MenuDraw, MenuGetSubmenuByName, MenuPlaySound, MenuSystemInit, MenuUpdate, type MenuSystem,
} from './menu.ts';
import { GameLoopDataNew, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';
import { DisplayCharacterAndName } from './playerselect.ts';
import { HighScoresScreen } from './hiscores.ts';

const PLAYER_LIST_ROW_HEIGHT = 16;
/** game_mode.c ModeMaxRoundsWon */
const ModeMaxRoundsWon = (mode: number): number => (mode === GAME_MODE_DOGFIGHT ? ConfigGetInt('Dogfight.FirstTo') : 1);
interface PlayerList {
  ms: MenuSystem;
  pos: Vec2i;
  size: Vec2i;
  scroll: number;
  updateFunc: (pl: PlayerList, l: LoopRunner) => number;
  drawFunc: (() => void) | null;
  hasMenu: boolean;
  showWinners: boolean;
  showLastMan: boolean;
  playerUIDs: number[];
}
const GetModeScore = (p: PlayerData): number => (gCampaign.Entry.Mode === GAME_MODE_DEATHMATCH ? p.Totals.Kills : p.Totals.Score);
function PlayerListNew(updateFunc: PlayerList['updateFunc'], drawFunc: (() => void) | null, hasMenu: boolean, showWinners: boolean): PlayerList {
  let alive = 0;
  const uids: number[] = [];
  for (const p of gPlayerDatas) {
    uids.push(p.UID);
    if (p.Lives > 0) alive++;
  }
  // glibc qsort is a stable merge sort here, as Array.prototype.sort
  uids.sort((a, b) => GetModeScore(PlayerDataGetByUID(b)!) - GetModeScore(PlayerDataGetByUID(a)!));
  return {
    ms: MenuSystemInit({ x: 0, y: 0 }, { x: 0, y: 0 }), pos: { x: 0, y: 0 }, size: { x: gGfx.w, y: gGfx.h }, scroll: 0, updateFunc, drawFunc,
    hasMenu, showWinners, showLastMan: alive === 1, playerUIDs: uids,
  };
}
const PlayerListMaxRows = (pl: PlayerList): number => Math.trunc((pl.size.y - FontH() * 3) / PLAYER_LIST_ROW_HEIGHT) - 2;
const PlayerListMaxScroll = (pl: PlayerList): number => MAX(pl.playerUIDs.length - PlayerListMaxRows(pl), 0);
function PlayerListCustomDraw(pl: PlayerList, pos: Vec2i, size: Vec2i): void {
  const xStart = pos.x + 80 + Math.trunc((size.x - 320) / 2);
  let x = xStart;
  let y = pos.y;
  FontStrMask('Player', { x, y }, colorPurple);
  x += 68;
  FontStrMask('Score', { x, y }, colorPurple);
  x += 32;
  FontStrMask('Kills', { x, y }, colorPurple);
  x += 32;
  FontStrMask('Time', { x, y }, colorPurple);
  y += FontH() * 2 + PLAYER_LIST_ROW_HEIGHT + 4;
  let maxScore = -1;
  for (let i = pl.scroll; i < MIN(pl.playerUIDs.length, pl.scroll + PlayerListMaxRows(pl)); i++) {
    const p = PlayerDataGetByUID(pl.playerUIDs[i]);
    if (p == null) continue;
    if (maxScore < GetModeScore(p)) maxScore = GetModeScore(p);
    x = xStart;
    const textColor = p.IsLocal ? colorPurple : colorWhite;
    DisplayCharacterAndName({ x: x + (i & 1) * 16, y: y + 4 }, p.Char, DIRECTION_DOWN, p.name, textColor, p.guns[0]);
    x += 68;
    FontStrMask(`${p.Totals.Score}`, { x, y }, textColor);
    x += 32;
    FontStrMask(`${p.Totals.Kills}`, { x, y }, textColor);
    x += 32;
    const t = Math.trunc(p.Totals.TimeTicks / FPS_FRAMELIMIT);
    FontStrMask(`${Math.trunc(t / 60)}:${String(t % 60).padStart(2, '0')}`, { x, y }, textColor);
    x += 32;
    if (pl.showWinners && GetModeScore(p) === maxScore) FontStrMask('Winner!', { x, y }, colorGreen);
    else if (pl.showLastMan && p.Lives > 0 && gCampaign.Entry.Mode === GAME_MODE_DEATHMATCH) FontStrMask('Last man standing!', { x, y }, colorGreen);
    y += PLAYER_LIST_ROW_HEIGHT;
  }
  if (pl.scroll > 0) FontStr('^', { x: pos.x + Math.trunc((size.x - FontStrW('^')) / 2), y: pos.y + FontH() });
  if (pl.scroll < PlayerListMaxScroll(pl)) FontStr('v', { x: pos.x + Math.trunc((size.x - FontStrW('v')) / 2), y: pos.y + size.y - FontH() });
  pl.drawFunc?.();
}
function PlayerListInput(pl: PlayerList, cmd: number): boolean {
  pl.playerUIDs = pl.playerUIDs.filter((uid) => PlayerDataGetByUID(uid) != null);
  if (cmd === CMD_DOWN) {
    MenuPlaySound(MENU_SOUND_SWITCH);
    pl.scroll++;
  } else if (cmd === CMD_UP) {
    MenuPlaySound(MENU_SOUND_SWITCH);
    pl.scroll--;
  } else if (AnyButton(cmd)) {
    MenuPlaySound(MENU_SOUND_BACK);
    return true;
  }
  pl.scroll = CLAMP_OPPOSITE(pl.scroll, 0, PlayerListMaxScroll(pl));
  return false;
}
function PlayerListLoop(pl: PlayerList): GameLoopData {
  pl.ms = MenuSystemInit(pl.pos, pl.size);
  const menuScores = MenuCreateCustom('View Scores', (_m, pos, size) => PlayerListCustomDraw(pl, pos, size), (cmd) => PlayerListInput(pl, cmd), pl);
  if (pl.hasMenu) {
    pl.ms.root = MenuCreateNormal('', '', MENU_TYPE_NORMAL, 0);
    MenuAddSubmenu(pl.ms.root, menuScores);
    MenuAddSubmenu(pl.ms.root, MenuCreateReturn('Finish', 0));
  } else {
    pl.ms.root = menuScores;
  }
  pl.ms.allowAborts = true;
  MenuAddExitType(pl.ms, MENU_TYPE_RETURN);
  return GameLoopDataNew({
    OnEnter: () => {
      pl.ms.current = pl.hasMenu ? MenuGetSubmenuByName(pl.ms.root!, 'View Scores') : pl.ms.root;
    },
    OnExit: () => MenuPlaySound(MENU_SOUND_SWITCH),
    UpdateFunc: (l: LoopRunner) => pl.updateFunc(pl, l),
    DrawFunc: () => MenuDraw(pl.ms),
  });
}
function PlayerListUpdate(pl: PlayerList, l: LoopRunner): number {
  const result = MenuUpdate(pl.ms);
  if (result === UPDATE_RESULT_OK) l.change(HighScoresScreen(gCampaign));
  return result;
}

const finalWordsSingle = [
  "Ha, next time I'll use my good hand",
  'Over already? I was just warming up...',
  "There's just no good opposition to be found these days!",
  "Well, maybe I'll just do my monthly reload then",
  'Woof woof',
  "I'll just bury the bones in the back yard, he-he",
  "I just wish they'd let me try bare-handed",
  "Rambo? Who's Rambo?",
  "<in Austrian accent:> I'll be back",
  'Gee, my trigger finger is sore',
  'I need more practice. I think I missed a few shots at times',
];
const finalWordsMulti = [
  'United we stand, divided we conquer',
  "Nothing like good teamwork, is there?",
  'Which way is the camera?',
  'We eat bullets for breakfast and have grenades as dessert',
  "We're so cool we have to wear mittens",
];
export function ScreenVictory(c: Campaign): GameLoopData {
  SoundPlay(gSoundDevice, StrSound('victory'));
  const words = GetNumPlayers(PLAYER_ANY, false, true) === 1 ? finalWordsSingle : finalWordsMulti;
  const finalWords = words[rand() % words.length];
  const pl = PlayerListNew(PlayerListUpdate, () => {
    const opts = FontOptsNew();
    opts.HAlign = ALIGN_CENTER;
    opts.Area = { x: gGfx.w, y: gGfx.h };
    let y = 30;
    FontStrOpt('Congratulations, you have completed ', { x: 0, y }, opts);
    y += 15;
    opts.Mask = colorRed;
    FontStrOpt(c.Setting.Title, { x: 0, y }, opts);
    y += 15;
    let pos = { x: Math.trunc((gGfx.w - FontStrW(finalWords)) / 2), y };
    pos = FontChMask(34, pos, colorDarker);
    pos = FontStrMask(finalWords, pos, colorPurple);
    FontChMask(34, pos, colorDarker);
  }, true, false);
  pl.pos.y = 75;
  pl.size.y -= pl.pos.y;
  MusicPlayFromChunk(MUSIC_VICTORY);
  return PlayerListLoop(pl);
}
export function ScreenDogfightScores(): GameLoopData {
  let maxScore = 0;
  for (const p of gPlayerDatas) {
    if (IsPlayerAlive(p)) {
      p.Totals.Score++;
      maxScore = MAX(maxScore, p.Totals.Score);
    }
  }
  gCampaign.IsComplete = maxScore === ModeMaxRoundsWon(gCampaign.Entry.Mode);
  const pl = PlayerListNew((pl2, l) => {
    const result = MenuUpdate(pl2.ms);
    if (result === UPDATE_RESULT_OK) {
      if (gCampaign.IsComplete) l.change(ScreenDogfightFinalScores());
      // the original leaves this screen on the stack with no menu (NULL) and dereferences it on the next frame;
      // the port goes back to the game options, which start the next round
      else l.pop();
    }
    return result;
  }, null, false, false);
  pl.pos.y = 24;
  pl.size.y -= pl.pos.y;
  return PlayerListLoop(pl);
}
export function ScreenDogfightFinalScores(): GameLoopData {
  SoundPlay(gSoundDevice, StrSound('victory'));
  const pl = PlayerListNew(PlayerListUpdate, null, true, true);
  pl.pos.y = 24;
  pl.size.y -= pl.pos.y;
  return PlayerListLoop(pl);
}
export function ScreenDeathmatchFinalScores(): GameLoopData {
  SoundPlay(gSoundDevice, StrSound('victory'));
  const pl = PlayerListNew(PlayerListUpdate, null, true, true);
  pl.pos.y = 24;
  pl.size.y -= pl.pos.y;
  return PlayerListLoop(pl);
}
