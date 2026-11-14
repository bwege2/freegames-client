// PokerTH 1.1.2: src/engine/local_engine/localplayer.h and localplayer.cpp, translated line by line: the
// player's state, action(), evaluation() and calcMyOdds() here, the computer opponent's decisions
// (preflopEngine, flopEngine, turnEngine, riverEngine, flopCardsValue, turnCardsValue) in ./ai/.
// 1.1.2 has no "EngineVersion" config entry, so readConfigInt("EngineVersion") is 0 and action() always uses
// the first engines; preflopEngine3 ... riverEngine3 are never called and are not ported.
// AGPL-3.0-or-later, see ../../LICENSE.md.
import { cardsValue, holeCardsToIntCode } from './cardsvalue.ts';
import {
  GAME_STATE_FLOP, GAME_STATE_PREFLOP, GAME_STATE_RIVER, GAME_STATE_TURN, PLAYER_ACTION_ALLIN, PLAYER_ACTION_BET,
  PLAYER_ACTION_CALL, PLAYER_ACTION_CHECK, PLAYER_ACTION_FOLD, PLAYER_ACTION_NONE, PLAYER_ACTION_RAISE, idiv,
  type PlayerAction, type PlayerType,
} from './defs.ts';
import type { LocalHand } from './hand.ts';
import type { Rng } from './rng.ts';
import { PreflopValues, FlopValues } from './ai/tables.ts';
import { preflopEngine } from './ai/preflop.ts';
import { flopEngine } from './ai/flop.ts';
import { turnEngine } from './ai/turn.ts';
import { riverEngine } from './ai/river.ts';
import { flopCardsValue } from './ai/cardsvalue-ai.ts';

export class LocalPlayer {
  currentHand: LocalHand | null = null;
  // Konstanten
  myID: number;
  myUniqueID: number;
  myGuid = '';
  myType: PlayerType;
  myName: string;
  myAvatar: string;
  myDude = 0;
  myDude4 = 0;
  // Laufvariablen
  myCardsValueInt = 0;
  myBestHandPosition = [-1, -1, -1, -1, -1];
  myOdds = -1.0;
  myNiveau = [0, 0, 0];
  logHoleCardsDone = false;
  myCards = [-1, -1];
  myCash: number;
  mySet = 0;
  myLastRelativeSet = 0;
  myAction: PlayerAction = PLAYER_ACTION_NONE;
  /** 0 = none, 1 = dealer, 2 = small, 3 = big */
  myButton: number;
  /** 0 = inactive, 1 = active */
  myActiveStatus: boolean;
  /** 0 = left, 1 = stay */
  myStayOnTableStatus: boolean;
  myTurn = false;
  myCardsFlip = false;
  myRoundStartCash = 0;
  lastMoneyWon = 0;
  myAverageSets = [0, 0, 0, 0];
  myAggressive = [false, false, false, false, false, false, false];
  sBluff = 0;
  sBluffStatus = false;
  isSessionActive = false;
  rng: Rng;

  constructor(rng: Rng, id: number, uniqueId: number, type: PlayerType, name: string, avatar: string, sC: number, aS: boolean, sotS: boolean, mB: number) {
    this.rng = rng;
    this.myID = id;
    this.myUniqueID = uniqueId;
    this.myType = type;
    this.myName = name;
    this.myAvatar = avatar;
    this.myCash = sC;
    this.myButton = mB;
    this.myActiveStatus = aS;
    this.myStayOnTableStatus = sotS;

    // Dude zuweisen
    this.myDude = rng.getRand(3, 5);
    // Dude4 zuweisen
    const interval = 7;
    const count = 4;
    const tempArray = rng.getRandArray(0, 2 * interval, count);
    for (let i = 0; i < count; i++) this.myDude4 += tempArray[i];
    this.myDude4 = idiv(this.myDude4, count) - interval;
  }

  setHand(br: LocalHand): void { this.currentHand = br; }
  hand(): LocalHand { return this.currentHand!; }
  getMyID(): number { return this.myID; }
  getMyUniqueID(): number { return this.myUniqueID; }
  getMyType(): PlayerType { return this.myType; }
  getMyDude(): number { return this.myDude; }
  getMyDude4(): number { return this.myDude4; }
  getMyName(): string { return this.myName; }
  getMyAvatar(): string { return this.myAvatar; }
  setMyCash(v: number): void { this.myCash = v; }
  getMyCash(): number { return this.myCash; }
  setMySet(theValue: number): void {
    this.myLastRelativeSet = theValue;
    this.mySet += theValue;
    this.myCash -= theValue;
  }
  setMySetAbsolute(v: number): void { this.mySet = v; }
  setMySetNull(): void {
    this.mySet = 0;
    this.myLastRelativeSet = 0;
  }
  getMySet(): number { return this.mySet; }
  getMyLastRelativeSet(): number { return this.myLastRelativeSet; }
  /** human: the game table's actions log themselves here (logging for seat 0) */
  setMyAction(theValue: PlayerAction, human = false): void {
    this.myAction = theValue;
    if (this.myAction && human) this.hand().getGuiInterface().logPlayerActionMsg(this.myName, this.myAction, this.myLastRelativeSet);
  }
  getMyAction(): PlayerAction { return this.myAction; }
  setMyButton(v: number): void { this.myButton = v; }
  getMyButton(): number { return this.myButton; }
  setMyActiveStatus(v: boolean): void { this.myActiveStatus = v; }
  getMyActiveStatus(): boolean { return this.myActiveStatus; }
  getMyStayOnTableStatus(): boolean { return this.myStayOnTableStatus; }
  setMyCards(v: ArrayLike<number>): void {
    for (let i = 0; i < 2; i++) this.myCards[i] = v[i];
  }
  getMyCards(out: number[]): void {
    for (let i = 0; i < 2; i++) out[i] = this.myCards[i];
  }
  setMyTurn(v: boolean): void { this.myTurn = v; }
  getMyTurn(): boolean { return this.myTurn; }
  setMyCardsFlip(theValue: boolean, state: number): void {
    this.myCardsFlip = theValue;
    // log flipping cards
    if (this.myCardsFlip) {
      const gui = this.hand().getGuiInterface();
      switch (state) {
        case 1: gui.logFlipHoleCardsMsg(this.myName, this.myCards[0], this.myCards[1], this.myCardsValueInt); break;
        case 2: gui.logFlipHoleCardsMsg(this.myName, this.myCards[0], this.myCards[1]); break;
        case 3: gui.logFlipHoleCardsMsg(this.myName, this.myCards[0], this.myCards[1], this.myCardsValueInt, 'has'); break;
      }
    }
  }
  getMyCardsFlip(): boolean { return this.myCardsFlip; }
  setMyCardsValueInt(v: number): void { this.myCardsValueInt = v; }
  getMyCardsValueInt(): number { return this.myCardsValueInt; }
  setMyBestHandPosition(v: ArrayLike<number>): void {
    for (let i = 0; i < 5; i++) this.myBestHandPosition[i] = v[i];
  }
  getMyBestHandPosition(out: number[]): void {
    for (let i = 0; i < 5; i++) out[i] = this.myBestHandPosition[i];
  }
  setMyRoundStartCash(v: number): void { this.myRoundStartCash = v; }
  getMyRoundStartCash(): number { return this.myRoundStartCash; }
  setLastMoneyWon(v: number): void { this.lastMoneyWon = v; }
  getLastMoneyWon(): number { return this.lastMoneyWon; }
  setMyAverageSets(theValue: number): void {
    this.myAverageSets[0] = this.myAverageSets[1];
    this.myAverageSets[1] = this.myAverageSets[2];
    this.myAverageSets[2] = this.myAverageSets[3];
    this.myAverageSets[3] = theValue;
  }
  getMyAverageSets(): number {
    return idiv(this.myAverageSets[0] + this.myAverageSets[1] + this.myAverageSets[2] + this.myAverageSets[3], 4);
  }
  setMyAggressive(theValue: boolean): void {
    for (let i = 0; i < 6; i++) this.myAggressive[i] = this.myAggressive[i + 1];
    this.myAggressive[6] = theValue;
  }
  getMyAggressive(): number {
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += this.myAggressive[i] ? 1 : 0;
    return sum;
  }
  setSBluff(v: number): void { this.sBluff = v; }
  getSBluff(): number { return this.sBluff; }
  setSBluffStatus(v: boolean): void { this.sBluffStatus = v; }
  getSBluffStatus(): boolean { return this.sBluffStatus; }

  action(): void {
    const hand = this.hand();
    switch (hand.getCurrentRound()) {
      case GAME_STATE_PREFLOP:
        preflopEngine(this);
        hand.getBoard().collectSets();
        hand.getGuiInterface().refreshPot();
        break;
      case GAME_STATE_FLOP:
        flopEngine(this);
        hand.getBoard().collectSets();
        hand.getGuiInterface().refreshPot();
        break;
      case GAME_STATE_TURN:
        turnEngine(this);
        hand.getBoard().collectSets();
        hand.getGuiInterface().refreshPot();
        break;
      case GAME_STATE_RIVER:
        riverEngine(this);
        hand.getBoard().collectSets();
        hand.getGuiInterface().refreshPot();
        break;
    }
    this.myTurn = false;
    //set that i was the last active player. need this for unhighlighting groupbox
    hand.setPreviousPlayerID(this.myID);
    hand.getGuiInterface().logPlayerActionMsg(this.myName, this.myAction, this.myLastRelativeSet);
    hand.getGuiInterface().nextPlayerAnimation();
  }

  checkMyAction(targetAction: number, targetBet: number, highestSet: number, minimumRaise: number, smallBlind: number): number {
    switch (targetAction) {
      case PLAYER_ACTION_FOLD:
        return 0;
      case PLAYER_ACTION_CHECK:
        if (this.getMySet() === highestSet) return 0;
        break;
      case PLAYER_ACTION_CALL:
        if (this.getMySet() < highestSet && targetBet <= this.getMyCash()) {
          if (this.getMyCash() + this.getMySet() >= highestSet && targetBet === highestSet - this.getMySet()) return 0;
          if (this.getMyCash() + this.getMySet() <= highestSet) return 0;
        }
        break;
      case PLAYER_ACTION_BET:
        if (highestSet === 0 && targetBet <= this.getMyCash() && targetBet >= 2 * smallBlind) return 0;
        break;
      case PLAYER_ACTION_RAISE:
        if (highestSet > 0 && targetBet >= minimumRaise && targetBet <= this.getMyCash()) return 0;
        break;
      case PLAYER_ACTION_ALLIN:
        if (targetBet === this.getMyCash()) return 0;
        break;
    }
    return 1;
  }

  evaluation(bet: number, raise: number): void {
    const hand = this.hand();
    const bero = hand.getCurrentBeRo();
    let highestSet = bero.getHighestSet();
    switch (this.myAction) {
      case PLAYER_ACTION_CALL:
        if (highestSet >= this.myCash + this.mySet) {
          this.setMySet(this.myCash);
          this.myAction = PLAYER_ACTION_ALLIN;
        } else {
          this.setMySet(highestSet - this.mySet);
        }
        break;
      case PLAYER_ACTION_BET:
        if (bet >= this.myCash) {
          if (this.myCash < 2 * hand.getSmallBlind()) bero.setFullBetRule(true);
          bero.setMinimumRaise(this.myCash);
          this.setMySet(this.myCash);
          this.myAction = PLAYER_ACTION_ALLIN;
          highestSet = this.mySet;
        } else {
          bero.setMinimumRaise(bet);
          this.setMySet(bet);
          highestSet = this.mySet;
        }
        hand.setLastActionPlayerID(this.myUniqueID);
        break;
      case PLAYER_ACTION_RAISE:
        if (bero.getFullBetRule()) {
          // full bet rule -> only call possible
          if (highestSet >= this.myCash + this.mySet) {
            this.setMySet(this.myCash);
            this.myAction = PLAYER_ACTION_ALLIN;
          } else {
            this.setMySet(highestSet - this.mySet);
            this.myAction = PLAYER_ACTION_CALL;
          }
        } else {
          if (raise < bero.getMinimumRaise()) raise = bero.getMinimumRaise();
          if (highestSet + raise >= this.myCash + this.mySet) {
            if (highestSet + bero.getMinimumRaise() > this.myCash + this.mySet) {
              if (highestSet >= this.myCash + this.mySet) {
                this.setMySet(this.myCash);
                this.myAction = PLAYER_ACTION_ALLIN;
              } else {
                bero.setFullBetRule(true);
                hand.setLastActionPlayerID(this.myUniqueID);
                this.setMySet(this.myCash);
                bero.setMinimumRaise(this.mySet - highestSet);
                this.myAction = PLAYER_ACTION_ALLIN;
                highestSet = this.mySet;
              }
            } else {
              hand.setLastActionPlayerID(this.myUniqueID);
              this.setMySet(this.myCash);
              bero.setMinimumRaise(this.mySet - highestSet);
              this.myAction = PLAYER_ACTION_ALLIN;
              highestSet = this.mySet;
            }
          } else {
            bero.setMinimumRaise(raise);
            this.setMySet(highestSet + raise - this.mySet);
            highestSet = this.mySet;
            hand.setLastActionPlayerID(this.myUniqueID);
          }
        }
        break;
    }
    bero.setHighestSet(highestSet);
  }

  calcMyOdds(): void {
    const hand = this.hand();
    let handCode: number;
    switch (hand.getCurrentRound()) {
      case GAME_STATE_PREFLOP: {
        handCode = holeCardsToIntCode(this.myCards);
        let players = hand.getActivePlayerList().length;
        if (players > 5) players = 5;
        if (players < 2) players = 2;
        const v = PreflopValues.get(handCode);
        if (v) this.myOdds = 100.0 * v[players - 2];
        if (this.myOdds === -1) console.error(`localplayer.cpp: ERROR myOdds - ${handCode}`);
        break;
      }
      case GAME_STATE_FLOP: {
        const tempArray = [0, 0, 0, 0, 0];
        const boardCards = [0, 0, 0, 0, 0];
        for (let i = 0; i < 2; i++) tempArray[i] = this.myCards[i];
        hand.getBoard().getMyCards(boardCards);
        for (let i = 0; i < 3; i++) tempArray[2 + i] = boardCards[i];
        handCode = flopCardsValue(tempArray);
        let players = hand.getActivePlayerList().length;
        if (players > 5) players = 5;
        if (players < 2) players = 2;
        if (handCode !== 80000) {
          const v = FlopValues.get(handCode);
          if (v) this.myOdds = 100.0 * v[players - 2];
          if (this.myOdds === -1) console.error(`localplayer.cpp: ERROR myOdds is -1: ${tempArray.join(' ')}`);
        } else {
          this.myOdds = 100;
        }
        break;
      }
      case GAME_STATE_TURN: {
        const b = [0, 0, 0, 0, 0];
        const my = [0, 0, 0, 0, 0, 0, 0];
        const op = [0, 0, 0, 0, 0, 0, 0];
        hand.getBoard().getMyCards(b);
        my[0] = this.myCards[0];
        my[1] = this.myCards[1];
        my[2] = b[0];
        my[3] = b[1];
        my[4] = b[2];
        my[5] = b[3];
        op[2] = b[0];
        op[3] = b[1];
        op[4] = b[2];
        op[5] = b[3];
        let countAll = 0;
        let countMy = 0;
        const c0 = this.myCards[0];
        const c1 = this.myCards[1];
        for (let i = 0; i < 49; i++) {
          if (i !== c0 && i !== c1 && i !== b[0] && i !== b[1] && i !== b[2]) {
            for (let j = i + 1; j < 50; j++) {
              if (j !== c0 && j !== c1 && j !== b[0] && j !== b[1] && j !== b[2]) {
                for (let k = j + 1; k < 51; k++) {
                  if (k !== c0 && k !== c1 && k !== b[0] && k !== b[1] && k !== b[2]) {
                    countAll++;
                    op[0] = i;
                    op[1] = j;
                    op[6] = k;
                    my[6] = k;
                    if (cardsValue(my, null) >= cardsValue(op, null)) countMy++;
                  }
                }
              }
            }
          }
        }
        this.myOdds = (100.0 * (countMy * 1.0)) / (countAll * 1.0);
        break;
      }
      case GAME_STATE_RIVER: {
        const b = [0, 0, 0, 0, 0];
        const my = [0, 0, 0, 0, 0, 0, 0];
        const op = [0, 0, 0, 0, 0, 0, 0];
        hand.getBoard().getMyCards(b);
        my[0] = this.myCards[0];
        my[1] = this.myCards[1];
        for (let i = 0; i < 5; i++) {
          my[2 + i] = b[i];
          op[2 + i] = b[i];
        }
        let countAll = 0;
        let countMy = 0;
        const myValue = () => cardsValue(my, null);
        const c0 = this.myCards[0];
        const c1 = this.myCards[1];
        for (let i = 0; i < 49; i++) {
          if (i !== c0 && i !== c1 && i !== b[0] && i !== b[1] && i !== b[2]) {
            for (let j = i + 1; j < 50; j++) {
              if (j !== c0 && j !== c1 && j !== b[0] && j !== b[1] && j !== b[2]) {
                countAll++;
                op[0] = i;
                op[1] = j;
                if (myValue() >= cardsValue(op, null)) countMy++;
              }
            }
          }
        }
        this.myOdds = (100.0 * (countMy * 1.0)) / (countAll * 1.0);
        break;
      }
      default:
        console.error('localplayer.cpp: ERROR - wrong init of currentRound');
    }
  }

  checkIfINeedToShowCards(): boolean {
    return this.hand().getBoard().getPlayerNeedToShowCards().includes(this.myUniqueID);
  }
}

export { PLAYER_ACTION_BET, PLAYER_ACTION_CALL, PLAYER_ACTION_CHECK, PLAYER_ACTION_RAISE };
