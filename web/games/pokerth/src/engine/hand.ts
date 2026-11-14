// PokerTH 1.1.2: src/engine/local_engine/localhand.cpp, translated line by line (without the DEBUG_MODE
// card presets and the SQLite log). AGPL-3.0-or-later, see ../../LICENSE.md.
//
// One deviation for online play: where the original deals the cards itself (the constructor shuffles the
// deck), a Dealer may be passed that leaves them unknown (-1) until the server shows them; see ../online.ts.
import { LocalBeRo, LocalBeRoFlop, LocalBeRoPostRiver, LocalBeRoPreflop, LocalBeRoRiver, LocalBeRoTurn } from './bero.ts';
import type { LocalBoard } from './board.ts';
import { cardsValue } from './cardsvalue.ts';
import {
  BUTTON_BIG_BLIND, BUTTON_DEALER, BUTTON_NONE, BUTTON_SMALL_BLIND, EngineError, GAME_STATE_FLOP, GAME_STATE_POST_RIVER,
  GAME_STATE_PREFLOP, GAME_STATE_RIVER, GAME_STATE_TURN, PLAYER_ACTION_ALLIN, PLAYER_ACTION_FOLD, type GameState,
} from './defs.ts';
import type { GuiInterface } from './gui.ts';
import type { LocalPlayer } from './player.ts';
import type { Rng } from './rng.ts';

/** Who deals: the original's shuffle (localDealer), or the server (online). */
export interface Dealer {
  /** the 52 cards in dealing order: board 0..4, then two per active player; -1 where unknown */
  deal(hand: LocalHand): number[];
}

export function localDealer(rng: Rng): Dealer {
  return {
    deal() {
      const cardsArray: number[] = [];
      for (let i = 0; i < 52; i++) cardsArray.push(i);
      rng.shuffle(cardsArray);
      return cardsArray;
    },
  };
}

export class LocalHand {
  myBeRo: LocalBeRo[];
  private currentRound: GameState = GAME_STATE_PREFLOP;
  private roundBeforePostRiver: GameState = GAME_STATE_PREFLOP;
  smallBlindPosition: number;
  bigBlindPosition: number;
  private previousPlayerID = -1;
  private lastActionPlayerID = 0;
  private allInCondition = false;
  private cardsShown = false;

  private myGui: GuiInterface;
  private myBoard: LocalBoard;
  private seatsList: LocalPlayer[];
  private activePlayerList: LocalPlayer[];
  private runningPlayerList: LocalPlayer[];
  private myID: number;
  private startQuantityPlayers: number;
  private dealerPosition: number;
  private smallBlind: number;
  private startCash: number;
  private humanId: number;

  constructor(myGui: GuiInterface, myBoard: LocalBoard, seatsList: LocalPlayer[], activePlayerList: LocalPlayer[], runningPlayerList: LocalPlayer[], myID: number, startQuantityPlayers: number, dealerPosition: number, smallBlind: number, startCash: number, rng: Rng, dealer: Dealer, humanId = 0) {
    this.myGui = myGui;
    this.myBoard = myBoard;
    this.seatsList = seatsList;
    this.activePlayerList = activePlayerList;
    this.runningPlayerList = runningPlayerList;
    this.myID = myID;
    this.startQuantityPlayers = startQuantityPlayers;
    this.dealerPosition = dealerPosition;
    this.smallBlind = smallBlind;
    this.startCash = startCash;
    this.humanId = humanId;
    this.smallBlindPosition = dealerPosition;
    this.bigBlindPosition = dealerPosition;
    for (const p of seatsList) {
      p.setHand(this);
      // set myFlipCards 0
      p.setMyCardsFlip(false, 0);
    }

    // generate cards and assign to board and player
    const cardsArray = dealer.deal(this);
    const tempBoardArray = [0, 0, 0, 0, 0];
    const tempPlayerArray = [0, 0];
    const tempPlayerAndBoardArray = [0, 0, 0, 0, 0, 0, 0];
    const bestHandPos = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) {
      tempBoardArray[i] = cardsArray[i];
      tempPlayerAndBoardArray[i + 2] = cardsArray[i];
    }
    this.myBoard.setMyCards(tempBoardArray);
    let k = 0;
    for (const p of activePlayerList) {
      p.getMyBestHandPosition(bestHandPos);
      for (let j = 0; j < 2; j++) {
        tempPlayerArray[j] = cardsArray[2 * k + j + 5];
        tempPlayerAndBoardArray[j] = cardsArray[2 * k + j + 5];
      }
      p.setMyCards(tempPlayerArray);
      // online, the cards are not known yet: the value is computed when they are shown (LocalHand.reveal)
      if (tempPlayerAndBoardArray.every((c) => c >= 0)) {
        p.setMyCardsValueInt(cardsValue(tempPlayerAndBoardArray, bestHandPos));
        p.setMyBestHandPosition(bestHandPos);
      }
      p.setMyRoundStartCash(p.getMyCash());
      // set sBluff for all players --> TODO for ai-player in internet
      if (p.getMyID() !== 0) {
        p.setSBluff(rng.getRand(1, 100));
        p.setSBluffStatus(false);
      }
      k++;
    }

    // determine dealer, SB, BB
    this.assignButtons();
    this.setBlinds();
    this.myBeRo = [
      new LocalBeRoPreflop(this, this.dealerPosition, this.smallBlind),
      new LocalBeRoFlop(this, this.dealerPosition, this.smallBlind),
      new LocalBeRoTurn(this, this.dealerPosition, this.smallBlind),
      new LocalBeRoRiver(this, this.dealerPosition, this.smallBlind),
      new LocalBeRoPostRiver(this, this.dealerPosition, this.smallBlind),
    ];
  }

  /** online: the cards became known; recompute the hand values of the players whose seven cards are known */
  reveal(board: number[] | null, holes: Map<number, [number, number]>): void {
    if (board) this.myBoard.setMyCards(board);
    const b = [0, 0, 0, 0, 0];
    this.myBoard.getMyCards(b);
    for (const p of this.activePlayerList) {
      const h = holes.get(p.getMyUniqueID());
      if (h) p.setMyCards(h);
      const c = [0, 0];
      p.getMyCards(c);
      const seven = [c[0], c[1], ...b];
      if (seven.every((x) => x >= 0)) {
        const pos = [0, 0, 0, 0, 0];
        p.setMyCardsValueInt(cardsValue(seven, pos));
        p.setMyBestHandPosition(pos);
      }
    }
  }

  humanUniqueId(): number { return this.humanId; }

  start(): void {
    // Log blinds sets for new Hand
    const sb = this.activePlayerList[this.getActivePlayerIt(this.getCurrentBeRo().getSmallBlindPositionId())];
    const bb = this.activePlayerList[this.getActivePlayerIt(this.getCurrentBeRo().getBigBlindPositionId())];
    if (sb && bb) this.myGui.logNewBlindsSetsMsg(sb.getMySet(), bb.getMySet(), sb.getMyName(), bb.getMyName());
    else console.error('localhand.cpp: Log Error: cannot find sBID or bBID');
    this.myGui.flushLogAtHand();
    // deal cards
    this.myGui.dealHoleCards();
    this.getBoard().collectSets();
    this.myGui.refreshPot();
    // change rounds | first start preflop
    this.myGui.nextPlayerAnimation();
  }

  getSeatsList(): LocalPlayer[] { return this.seatsList; }
  getActivePlayerList(): LocalPlayer[] { return this.activePlayerList; }
  getRunningPlayerList(): LocalPlayer[] { return this.runningPlayerList; }
  getBoard(): LocalBoard { return this.myBoard; }
  getGuiInterface(): GuiInterface { return this.myGui; }
  getCurrentBeRo(): LocalBeRo { return this.myBeRo[this.currentRound]; }
  getMyID(): number { return this.myID; }
  getStartQuantityPlayers(): number { return this.startQuantityPlayers; }
  setCurrentRound(v: GameState): void { this.currentRound = v; }
  getCurrentRound(): GameState { return this.currentRound; }
  getRoundBeforePostRiver(): GameState { return this.roundBeforePostRiver; }
  getDealerPosition(): number { return this.dealerPosition; }
  getSmallBlind(): number { return this.smallBlind; }
  setAllInCondition(v: boolean): void { this.allInCondition = v; }
  getAllInCondition(): boolean { return this.allInCondition; }
  getStartCash(): number { return this.startCash; }
  setPreviousPlayerID(v: number): void { this.previousPlayerID = v; }
  getPreviousPlayerID(): number { return this.previousPlayerID; }
  getLastActionPlayerID(): number { return this.lastActionPlayerID; }
  setCardsShown(v: boolean): void { this.cardsShown = v; }
  getCardsShown(): boolean { return this.cardsShown; }
  setLastActionPlayerID(v: number): void {
    this.lastActionPlayerID = v;
    this.myBoard.setLastActionPlayerID(v);
  }

  /** the index in seatsList, or -1 (the original's end()) */
  getSeatIt(uniqueId: number): number { return this.seatsList.findIndex((p) => p.getMyUniqueID() === uniqueId); }
  getActivePlayerIt(uniqueId: number): number { return this.activePlayerList.findIndex((p) => p.getMyUniqueID() === uniqueId); }
  getRunningPlayerIt(uniqueId: number): number { return this.runningPlayerList.findIndex((p) => p.getMyUniqueID() === uniqueId); }

  assignButtons(): void {
    const seats = this.seatsList;
    const apl = this.activePlayerList;
    // delete all buttons
    for (const p of seats) p.setMyButton(BUTTON_NONE);
    // assign dealer button
    let it = this.getSeatIt(this.dealerPosition);
    if (it < 0) throw new EngineError('ERR_SEAT_NOT_FOUND');
    seats[it].setMyButton(BUTTON_DEALER);

    // assign Small Blind next to dealer. ATTENTION: in heads up it is big blind
    // assign big blind next to small blind. ATTENTION: in heads up it is small blind
    let nextActivePlayerFound = false;
    let dealerPositionIt = this.getSeatIt(this.dealerPosition);
    if (dealerPositionIt < 0) throw new EngineError('ERR_SEAT_NOT_FOUND');
    for (let i = 0; i < seats.length; i++) {
      dealerPositionIt++;
      if (dealerPositionIt === seats.length) dealerPositionIt = 0;
      it = this.getActivePlayerIt(seats[dealerPositionIt].getMyUniqueID());
      if (it >= 0) {
        nextActivePlayerFound = true;
        if (apl.length > 2) {
          //small blind normal
          apl[it].setMyButton(2);
          this.smallBlindPosition = apl[it].getMyUniqueID();
        } else {
          //big blind in heads up
          apl[it].setMyButton(3);
          this.bigBlindPosition = apl[it].getMyUniqueID();
        }
        // first player after dealer have to show his cards first (in showdown)
        this.lastActionPlayerID = apl[it].getMyUniqueID();
        this.myBoard.setLastActionPlayerID(this.lastActionPlayerID);
        it++;
        if (it === apl.length) it = 0;
        if (apl.length > 2) {
          //big blind normal
          apl[it].setMyButton(3);
          this.bigBlindPosition = apl[it].getMyUniqueID();
        } else {
          //small blind in heads up
          apl[it].setMyButton(2);
          this.smallBlindPosition = apl[it].getMyUniqueID();
        }
        break;
      }
    }
    if (!nextActivePlayerFound) throw new EngineError('ERR_NEXT_ACTIVE_PLAYER_NOT_FOUND');
  }

  setBlinds(): void {
    for (const p of this.runningPlayerList) {
      //small blind
      if (p.getMyButton() === BUTTON_SMALL_BLIND) {
        if (p.getMyCash() <= this.smallBlind) {
          p.setMySet(p.getMyCash());
          p.setMyAction(PLAYER_ACTION_ALLIN);
        } else {
          p.setMySet(this.smallBlind);
        }
      }
    }
    for (const p of this.runningPlayerList) {
      //big blind
      if (p.getMyButton() === BUTTON_BIG_BLIND) {
        if (p.getMyCash() <= 2 * this.smallBlind) {
          p.setMySet(p.getMyCash());
          p.setMyAction(PLAYER_ACTION_ALLIN);
        } else {
          p.setMySet(2 * this.smallBlind);
        }
      }
    }
  }

  switchRounds(): void {
    const rpl = this.runningPlayerList;
    const apl = this.activePlayerList;
    const gui = this.myGui;
    // refresh runningPlayerList
    for (let it = 0; it < rpl.length;) {
      const a = rpl[it].getMyAction();
      if (a === PLAYER_ACTION_FOLD || a === PLAYER_ACTION_ALLIN) {
        rpl.splice(it, 1);
        if (rpl.length) {
          let it_1 = it;
          if (it_1 === 0) it_1 = rpl.length;
          it_1--;
          this.getCurrentBeRo().setCurrentPlayersTurnId(rpl[it_1].getMyUniqueID());
        }
      } else {
        it++;
      }
    }

    // determine number of all in players
    let allInPlayersCounter = 0;
    for (const p of apl) if (p.getMyAction() === PLAYER_ACTION_ALLIN) allInPlayersCounter++;
    // determine number of non-fold players
    let nonFoldPlayerCounter = 0;
    for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) nonFoldPlayerCounter++;

    // if only one player non-fold -> distribute pot
    if (nonFoldPlayerCounter === 1) {
      this.myBoard.collectPot();
      gui.refreshPot();
      gui.refreshSet();
      this.currentRound = GAME_STATE_POST_RIVER;
    } else {
      // check for all in condition
      // 1) all players all in
      if (allInPlayersCounter === nonFoldPlayerCounter) {
        this.allInCondition = true;
        this.myBoard.setAllInCondition(true);
      }
      // 2) all players but one all in and he has highest set
      if (allInPlayersCounter + 1 === nonFoldPlayerCounter) {
        for (const p of rpl) {
          if (p.getMySet() >= this.myBeRo[this.currentRound].getHighestSet()) {
            this.allInCondition = true;
            this.myBoard.setAllInCondition(true);
          }
        }
        // exception no.1: if in first Preflop Round next player is small blind and only all-in-big-blind with
        // less than smallblind amount and other all-in players with less than small blind are nonfold too
        const smallBlindIt = this.getRunningPlayerIt(this.myBeRo[this.currentRound].getSmallBlindPositionId());
        const bigBlindIt = this.getActivePlayerIt(this.myBeRo[this.currentRound].getBigBlindPositionId());
        if (smallBlindIt >= 0 && bigBlindIt >= 0 && this.currentRound === GAME_STATE_PREFLOP && this.myBeRo[this.currentRound].getFirstRound()) {
          let tempCounter = 0;
          for (const p of apl) {
            if (p.getMyAction() === PLAYER_ACTION_ALLIN && p.getMySet() <= this.smallBlind) tempCounter++;
          }
          if (apl[bigBlindIt].getMySet() <= this.smallBlind && tempCounter === allInPlayersCounter) {
            this.allInCondition = true;
            this.myBoard.setAllInCondition(true);
          }
        }
        // exception no.2: heads up -> detect player who is all in and bb but could set less than sb
        for (const p of apl) {
          if (apl.length === 2 && p.getMyAction() === PLAYER_ACTION_ALLIN && p.getMyButton() === BUTTON_BIG_BLIND && p.getMySet() <= this.smallBlind && this.currentRound === GAME_STATE_PREFLOP) {
            this.allInCondition = true;
            this.myBoard.setAllInCondition(true);
          }
        }
      }
    }

    // special routine
    if (this.allInCondition) {
      this.myBoard.collectPot();
      gui.refreshPot();
      gui.refreshSet();
      gui.flipHolecardsAllIn();
      if (this.currentRound < GAME_STATE_POST_RIVER) {
        // do not increment past 4
        this.currentRound = (this.currentRound + 1) as GameState;
      }
      //log board cards for allin
      if (this.currentRound >= GAME_STATE_FLOP) {
        const b = [0, 0, 0, 0, 0];
        this.myBoard.getMyCards(b);
        gui.logDealBoardCardsMsg(this.currentRound, b[0], b[1], b[2], b[3], b[4]);
      }
    }

    //unhighlight current players groupbox
    if (this.getActivePlayerIt(this.previousPlayerID) >= 0) gui.refreshGroupbox(this.previousPlayerID, 1);
    gui.refreshGameLabels(this.currentRound);

    if (this.currentRound < GAME_STATE_POST_RIVER) this.roundBeforePostRiver = this.currentRound;

    switch (this.currentRound) {
      case GAME_STATE_PREFLOP: gui.preflopAnimation1(); break;
      case GAME_STATE_FLOP: gui.flopAnimation1(); break;
      case GAME_STATE_TURN: gui.turnAnimation1(); break;
      case GAME_STATE_RIVER: gui.riverAnimation1(); break;
      case GAME_STATE_POST_RIVER: gui.postRiverAnimation1(); break;
    }
  }
}
