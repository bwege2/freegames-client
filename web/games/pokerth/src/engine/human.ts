// PokerTH 1.1.2: the human player's actions of the game table, src/gui/qt/gametable/gametableimpl.cpp
// (myFold, myCheck, myCall, mySet, myAllIn, getMyCallAmount, getMyBetAmount and the button logic of
// provideMyActions), without the Qt widgets: they change the engine's state exactly as the original does.
// `player` is the acting human (the original: seatsList->front(), the local player; online, a remote player's
// action arrives over the network and goes through the same code). AGPL-3.0-or-later, see ../../LICENSE.md.
import {
  GAME_STATE_PREFLOP, PLAYER_ACTION_ALLIN, PLAYER_ACTION_BET, PLAYER_ACTION_CALL, PLAYER_ACTION_CHECK,
  PLAYER_ACTION_FOLD, PLAYER_ACTION_RAISE,
} from './defs.ts';
import type { LocalHand } from './hand.ts';
import type { LocalPlayer } from './player.ts';

export function myFold(hand: LocalHand, player: LocalPlayer): void {
  player.setMyAction(PLAYER_ACTION_FOLD, true);
  player.setMyTurn(false);
  hand.setPreviousPlayerID(player.getMyID());
}

export function myCheck(hand: LocalHand, player: LocalPlayer): void {
  player.setMyTurn(false);
  player.setMyAction(PLAYER_ACTION_CHECK, true);
  hand.setPreviousPlayerID(player.getMyID());
}

export function getMyCallAmount(hand: LocalHand, player: LocalPlayer): number {
  const tempHighestSet = hand.getCurrentBeRo().getHighestSet();
  if (player.getMyCash() + player.getMySet() <= tempHighestSet) return player.getMyCash();
  return tempHighestSet - player.getMySet();
}

/** the smallest amount the bet/raise button offers (getMyBetAmount with a value below the minimum) */
export function getMyBetAmount(hand: LocalHand, player: LocalPlayer, betValue: number): number {
  const minimum = hand.getCurrentBeRo().getHighestSet() - player.getMySet() + hand.getCurrentBeRo().getMinimumRaise();
  if (betValue < minimum) return Math.min(minimum, player.getMyCash());
  return betValue;
}

export function myCall(hand: LocalHand, player: LocalPlayer): void {
  const tempHighestSet = hand.getCurrentBeRo().getHighestSet();
  if (player.getMyCash() + player.getMySet() <= tempHighestSet) {
    player.setMySet(player.getMyCash());
    player.setMyCash(0);
    player.setMyAction(PLAYER_ACTION_ALLIN, true);
  } else {
    player.setMySet(tempHighestSet - player.getMySet());
    player.setMyAction(PLAYER_ACTION_CALL, true);
  }
  player.setMyTurn(false);
  hand.getBoard().collectSets();
  hand.setPreviousPlayerID(player.getMyID());
}

/** mySet(): the bet/raise button with `value` (the amount the button shows) */
export function mySet(hand: LocalHand, player: LocalPlayer, value: number, isRaise: boolean, isBet: boolean): void {
  const bero = hand.getCurrentBeRo();
  const tempCash = player.getMyCash();
  player.setMySet(value);
  if (value >= tempCash) {
    player.setMySet(player.getMyCash());
    player.setMyCash(0);
    player.setMyAction(PLAYER_ACTION_ALLIN, true);
    if (bero.getHighestSet() + bero.getMinimumRaise() > player.getMySet()) bero.setFullBetRule(true);
  }
  if (isRaise) {
    if (player.getMyAction() !== PLAYER_ACTION_ALLIN) player.setMyAction(PLAYER_ACTION_RAISE, true);
    bero.setMinimumRaise(player.getMySet() - bero.getHighestSet());
  }
  if (isBet) {
    if (player.getMyAction() !== PLAYER_ACTION_ALLIN) player.setMyAction(PLAYER_ACTION_BET, true);
    bero.setMinimumRaise(player.getMySet());
  }
  bero.setHighestSet(player.getMySet());
  player.setMyTurn(false);
  hand.getBoard().collectSets();
  hand.setPreviousPlayerID(player.getMyID());
  hand.setLastActionPlayerID(player.getMyUniqueID());
}

export function myAllIn(hand: LocalHand, player: LocalPlayer): void {
  const bero = hand.getCurrentBeRo();
  player.setMySet(player.getMyCash());
  player.setMyCash(0);
  player.setMyAction(PLAYER_ACTION_ALLIN, true);
  if (bero.getHighestSet() + bero.getMinimumRaise() > player.getMySet()) bero.setFullBetRule(true);
  if (player.getMySet() > bero.getHighestSet()) {
    bero.setMinimumRaise(player.getMySet() - bero.getHighestSet());
    bero.setHighestSet(player.getMySet());
    hand.setLastActionPlayerID(player.getMyUniqueID());
  }
  player.setMyTurn(false);
  hand.getBoard().collectSets();
  hand.setPreviousPlayerID(player.getMyID());
}

/** What provideMyActions() puts on the four buttons when it is the player's turn (mode != 0). */
export interface MyActions {
  /** the Fold button: "Fold" (the original also shows "Check / Fold" as a pre-action) */
  fold: boolean;
  /** the Call/Check button */
  callCheck: 'check' | 'call' | null;
  callAmount: number;
  /** the Bet/Raise button */
  betRaise: 'bet' | 'raise' | null;
  /** the slider's range for bet/raise */
  betMin: number;
  betMax: number;
  allIn: boolean;
}

export function provideMyActions(hand: LocalHand, player: LocalPlayer): MyActions {
  const bero = hand.getCurrentBeRo();
  const hs = bero.getHighestSet();
  const full = bero.getFullBetRule();
  const a: MyActions = { fold: true, callCheck: null, callAmount: 0, betRaise: null, betMin: 0, betMax: player.getMyCash(), allIn: !full };
  if (hand.getCurrentRound() === GAME_STATE_PREFLOP) {
    if (player.getMyCash() + player.getMySet() > hs && !full) a.betRaise = 'raise';
    if (player.getMySet() === hs && player.getMyButton() === 3) a.callCheck = 'check';
    else a.callCheck = 'call';
  } else {
    if (hs === 0) {
      a.callCheck = 'check';
      a.betRaise = 'bet';
    }
    if (hs > 0 && hs > player.getMySet()) {
      a.callCheck = 'call';
      if (player.getMyCash() + player.getMySet() > hs && !full) a.betRaise = 'raise';
    }
  }
  if (a.callCheck === 'call') a.callAmount = getMyCallAmount(hand, player);
  if (a.betRaise === 'raise') a.betMin = hs - player.getMySet() + bero.getMinimumRaise();
  else if (a.betRaise === 'bet') a.betMin = hand.getSmallBlind() * 2;
  return a;
}
