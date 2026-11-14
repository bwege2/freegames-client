// PokerTH 1.1.2: src/gui/guiinterface.h, the half the engine calls (the game table implements it:
// ../table/table.ts; the tests implement it with a task queue). AGPL-3.0-or-later, see ../../LICENSE.md.
import type { GameState } from './defs.ts';

export interface GuiInterface {
  refreshSet(): void;
  refreshCash(): void;
  refreshAction(playerID?: number, playerAction?: number): void;
  refreshPot(): void;
  refreshGroupbox(playerID?: number, status?: number): void;
  refreshAll(): void;
  refreshGameLabels(state: GameState): void;
  dealBeRoCards(myBeRoID: number): void;
  dealHoleCards(): void;
  nextPlayerAnimation(): void;
  beRoAnimation2(myBeRoID: number): void;
  preflopAnimation1(): void;
  flopAnimation1(): void;
  turnAnimation1(): void;
  riverAnimation1(): void;
  postRiverAnimation1(): void;
  postRiverRunAnimation1(): void;
  flipHolecardsAllIn(): void;
  nextRoundCleanGui(): void;
  meInAction(): void;
  logPlayerActionMsg(playerName: string, action: number, setValue: number): void;
  logNewGameHandMsg(gameID: number, handID: number): void;
  logNewBlindsSetsMsg(sbSet: number, bbSet: number, sbName: string, bbName: string): void;
  logDealBoardCardsMsg(roundID: number, card1: number, card2: number, card3: number, card4?: number, card5?: number): void;
  logFlipHoleCardsMsg(playerName: string, card1: number, card2: number, cardsValueInt?: number, showHas?: string): void;
  flushLogAtGame(gameID: number): void;
  flushLogAtHand(): void;
}
