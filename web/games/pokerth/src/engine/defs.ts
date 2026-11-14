// PokerTH 1.1.2: src/game_defs.h, src/engine/engine_defs.h, src/playerdata.h (the parts the engine uses).
// AGPL-3.0-or-later, see ../../LICENSE.md.

export const MAX_NUMBER_OF_PLAYERS = 10;

export const GAME_STATE_PREFLOP = 0;
export const GAME_STATE_FLOP = 1;
export const GAME_STATE_TURN = 2;
export const GAME_STATE_RIVER = 3;
export const GAME_STATE_POST_RIVER = 4;
export type GameState = 0 | 1 | 2 | 3 | 4;

export const PLAYER_ACTION_NONE = 0;
export const PLAYER_ACTION_FOLD = 1;
export const PLAYER_ACTION_CHECK = 2;
export const PLAYER_ACTION_CALL = 3;
export const PLAYER_ACTION_BET = 4;
export const PLAYER_ACTION_RAISE = 5;
export const PLAYER_ACTION_ALLIN = 6;
export type PlayerAction = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** myButton: 0 = none, 1 = dealer, 2 = small blind, 3 = big blind */
export const BUTTON_NONE = 0;
export const BUTTON_DEALER = 1;
export const BUTTON_SMALL_BLIND = 2;
export const BUTTON_BIG_BLIND = 3;

export const PLAYER_TYPE_COMPUTER = 0;
export const PLAYER_TYPE_HUMAN = 1;
export type PlayerType = 0 | 1;

// gamedata.h
export const RAISE_ON_HANDNUMBER = 1;
export const RAISE_ON_MINUTES = 2;
export const DOUBLE_BLINDS = 1;
export const MANUAL_BLINDS_ORDER = 2;
export const AFTERMB_DOUBLE_BLINDS = 1;
export const AFTERMB_RAISE_ABOUT = 2;
export const AFTERMB_STAY_AT_LAST_BLIND = 3;

export interface GameData {
  maxNumberOfPlayers: number;
  startMoney: number;
  firstSmallBlind: number;
  raiseIntervalMode: number;
  raiseSmallBlindEveryHandsValue: number;
  raiseSmallBlindEveryMinutesValue: number;
  raiseMode: number;
  manualBlindsList: number[];
  afterManualBlindsMode: number;
  afterMBAlwaysRaiseValue: number;
  guiSpeed: number;
  delayBetweenHandsSec: number;
  playerActionTimeoutSec: number;
}

/** GameData's constructor defaults (gamedata.h) */
export function defaultGameData(): GameData {
  return {
    maxNumberOfPlayers: 0, startMoney: 0, firstSmallBlind: 0, raiseIntervalMode: RAISE_ON_HANDNUMBER,
    raiseSmallBlindEveryHandsValue: 8, raiseSmallBlindEveryMinutesValue: 1, raiseMode: DOUBLE_BLINDS, manualBlindsList: [],
    afterManualBlindsMode: AFTERMB_DOUBLE_BLINDS, afterMBAlwaysRaiseValue: 0, guiSpeed: 4, delayBetweenHandsSec: 6,
    playerActionTimeoutSec: 20,
  };
}

export interface StartData {
  startDealerPlayerId: number;
  numberOfPlayers: number;
}

export interface PlayerData {
  uniqueId: number;
  type: PlayerType;
  name: string;
  avatar: string;
  /** used if >= 0 */
  startCash: number;
}

/** C/C++ integer division (truncates toward zero) */
export function idiv(a: number, b: number): number {
  const q = a / b;
  if (!Number.isFinite(q)) throw new Error(`integer division by zero (${a}/${b})`);
  return Math.trunc(q);
}

/** C++'s int % int (the sign of the dividend) */
export function imod(a: number, b: number): number {
  if (b === 0) throw new Error('integer modulo by zero');
  return a % b;
}

export class EngineError extends Error {}
