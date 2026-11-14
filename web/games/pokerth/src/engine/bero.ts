// PokerTH 1.1.2: src/engine/local_engine/localbero.cpp, localberopreflop.cpp, localberoflop.cpp,
// localberoturn.cpp, localberoriver.cpp, localberopostriver.cpp ("BeRo" = Betting Round), translated line
// by line. AGPL-3.0-or-later, see ../../LICENSE.md.
import {
  BUTTON_BIG_BLIND, BUTTON_SMALL_BLIND, EngineError, GAME_STATE_FLOP, GAME_STATE_POST_RIVER, GAME_STATE_PREFLOP,
  GAME_STATE_RIVER, GAME_STATE_TURN, MAX_NUMBER_OF_PLAYERS, PLAYER_ACTION_FOLD, PLAYER_ACTION_NONE, type GameState,
} from './defs.ts';
import type { LocalHand } from './hand.ts';

export class LocalBeRo {
  protected myHand: LocalHand;
  protected myBeRoID: GameState;
  protected dealerPosition: number;
  protected smallBlindPositionId = 0;
  protected bigBlindPositionId = 0;
  protected smallBlind: number;
  protected highestSet = 0;
  protected minimumRaise: number;
  protected fullBetRule = false;
  protected firstRun = true;
  protected firstRunGui = true;
  protected firstRound = true;
  protected currentPlayersTurnId = 0;
  protected firstRoundLastPlayersTurnId = 0;
  protected logBoardCardsDone = false;

  constructor(hi: LocalHand, dP: number, sB: number, gS: GameState) {
    this.myHand = hi;
    this.myBeRoID = gS;
    this.dealerPosition = dP;
    this.smallBlind = sB;
    this.minimumRaise = 2 * sB;
    const apl = hi.getActivePlayerList();
    // determine bigBlindPosition
    let p = apl.find((x) => x.getMyButton() === BUTTON_BIG_BLIND);
    if (!p) throw new EngineError('ERR_ACTIVE_PLAYER_NOT_FOUND');
    this.bigBlindPositionId = p.getMyUniqueID();
    // determine smallBlindPosition
    p = apl.find((x) => x.getMyButton() === BUTTON_SMALL_BLIND);
    if (!p) throw new EngineError('ERR_ACTIVE_PLAYER_NOT_FOUND');
    this.smallBlindPositionId = p.getMyUniqueID();
  }

  getMyBeRoID(): GameState { return this.myBeRoID; }
  getHighestCardsValue(): number {
    console.error('localbero.cpp: getHighestCardsValue() in wrong BeRo');
    return 0;
  }
  setMinimumRaise(v: number): void { this.minimumRaise = v; }
  getMinimumRaise(): number { return this.minimumRaise; }
  setFullBetRule(v: boolean): void { this.fullBetRule = v; }
  getFullBetRule(): boolean { return this.fullBetRule; }
  skipFirstRunGui(): void { this.firstRunGui = false; }
  setCurrentPlayersTurnId(v: number): void { this.currentPlayersTurnId = v; }
  getCurrentPlayersTurnId(): number { return this.currentPlayersTurnId; }
  setFirstRoundLastPlayersTurnId(v: number): void { this.firstRoundLastPlayersTurnId = v; }
  getFirstRoundLastPlayersTurnId(): number { return this.firstRoundLastPlayersTurnId; }
  setHighestSet(v: number): void { this.highestSet = v; }
  getHighestSet(): number { return this.highestSet; }
  setFirstRun(v: boolean): void { this.firstRun = v; }
  getFirstRun(): boolean { return this.firstRun; }
  setFirstRound(v: boolean): void { this.firstRound = v; }
  getFirstRound(): boolean { return this.firstRound; }
  getSmallBlindPositionId(): number { return this.smallBlindPositionId; }
  getBigBlindPositionId(): number { return this.bigBlindPositionId; }
  getSmallBlind(): number { return this.smallBlind; }
  getDealerPosition(): number { return this.dealerPosition; }

  nextPlayer(): void {
    const p = this.myHand.getRunningPlayerList()[this.myHand.getRunningPlayerIt(this.currentPlayersTurnId)];
    if (!p) throw new EngineError('ERR_RUNNING_PLAYER_NOT_FOUND');
    p.action();
  }

  run(): void {
    const hand = this.myHand;
    const gui = hand.getGuiInterface();
    if (this.firstRunGui) {
      this.firstRunGui = false;
      hand.setPreviousPlayerID(-1);
      gui.dealBeRoCards(this.myBeRoID);
    } else {
      if (this.firstRun) {
        this.firstRun = false;
        if (!hand.getAllInCondition()) {
          const apl = hand.getActivePlayerList();
          if (apl.length > 2) {
            // running player before smallBlind
            let formerRunningPlayerFound = false;
            let it_1 = hand.getActivePlayerIt(this.smallBlindPositionId);
            if (it_1 < 0) throw new EngineError('ERR_ACTIVE_PLAYER_NOT_FOUND');
            for (let i = 0; i < apl.length; i++) {
              if (it_1 === 0) it_1 = apl.length;
              it_1--;
              const it_2 = hand.getRunningPlayerIt(apl[it_1].getMyUniqueID());
              if (it_2 >= 0) {
                this.firstRoundLastPlayersTurnId = hand.getRunningPlayerList()[it_2].getMyUniqueID();
                formerRunningPlayerFound = true;
                break;
              }
            }
            if (!formerRunningPlayerFound) throw new EngineError('ERR_FORMER_RUNNING_PLAYER_NOT_FOUND');
          } else {
            // heads up: bigBlind begins -> dealer/smallBlind is running player before bigBlind
            this.firstRoundLastPlayersTurnId = this.smallBlindPositionId;
          }
          this.currentPlayersTurnId = this.firstRoundLastPlayersTurnId;
        }
      }

      //log the turned cards
      if (!this.logBoardCardsDone) {
        const b = [0, 0, 0, 0, 0];
        hand.getBoard().getMyCards(b);
        switch (this.myBeRoID) {
          case GAME_STATE_FLOP: gui.logDealBoardCardsMsg(this.myBeRoID, b[0], b[1], b[2]); break;
          case GAME_STATE_TURN: gui.logDealBoardCardsMsg(this.myBeRoID, b[0], b[1], b[2], b[3]); break;
          case GAME_STATE_RIVER: gui.logDealBoardCardsMsg(this.myBeRoID, b[0], b[1], b[2], b[3], b[4]); break;
          default: console.error('localbero.cpp: ERROR - wrong myBeRoID');
        }
        this.logBoardCardsDone = true;
      }

      let allHighestSet = true;
      const rpl = hand.getRunningPlayerList();
      // check if all running players have same sets (else allHighestSet = false)
      for (const p of rpl) {
        if (this.highestSet !== p.getMySet()) {
          allHighestSet = false;
          break;
        }
      }

      if (!this.firstRound && allHighestSet) {
        // aktuelle bero nicht dran, weil alle Sets gleich sind, also gehe in naechste bero
        hand.setCurrentRound((this.myBeRoID + 1) as GameState);
        for (const p of rpl) p.setMyAction(PLAYER_ACTION_NONE);
        hand.getBoard().collectSets();
        hand.getBoard().collectPot();
        gui.refreshPot();
        gui.refreshSet();
        gui.refreshCash();
        for (let i = 0; i < MAX_NUMBER_OF_PLAYERS; i++) gui.refreshAction(i, PLAYER_ACTION_NONE);
        hand.switchRounds();
      } else {
        // determine next running player
        let it = hand.getRunningPlayerIt(this.currentPlayersTurnId);
        if (it < 0) throw new EngineError('ERR_RUNNING_PLAYER_NOT_FOUND');
        it++;
        if (it === rpl.length) it = 0;
        this.currentPlayersTurnId = rpl[it].getMyUniqueID();
        //highlight active players groupbox and clear action
        gui.refreshGroupbox(this.currentPlayersTurnId, 2);
        gui.refreshAction(this.currentPlayersTurnId, 0);
        it = hand.getRunningPlayerIt(this.currentPlayersTurnId);
        if (it < 0) throw new EngineError('ERR_RUNNING_PLAYER_NOT_FOUND');
        rpl[it].setMyTurn(true);
        if (this.currentPlayersTurnId === this.firstRoundLastPlayersTurnId) this.firstRound = false;
        if (this.currentPlayersTurnId === hand.humanUniqueId()) {
          // Wir sind dran
          gui.meInAction();
        } else {
          // Gegner sind dran
          gui.beRoAnimation2(this.myBeRoID);
        }
      }
    }
  }

  postRiverRun(): void {}
}

export class LocalBeRoPreflop extends LocalBeRo {
  constructor(hi: LocalHand, dP: number, sB: number) {
    super(hi, dP, sB, GAME_STATE_PREFLOP);
    this.setHighestSet(2 * this.getSmallBlind());
  }

  override run(): void {
    const hand = this.myHand;
    const gui = hand.getGuiInterface();
    if (this.getFirstRun()) {
      const apl = hand.getActivePlayerList();
      // search bigBlindPosition in runningPlayerList
      const bigBlindPositionIt = hand.getRunningPlayerIt(this.getBigBlindPositionId());
      if (apl.length > 2) {
        if (bigBlindPositionIt < 0) {
          // bigBlindPlayer is all in: search smallBlindPosition in runningPlayerList
          const smallBlindPositionIt = hand.getRunningPlayerIt(this.getSmallBlindPositionId());
          if (smallBlindPositionIt < 0) {
            // smallBlindPlayer all in too -> next active player before smallBlindPlayer
            let it = hand.getActivePlayerIt(this.getSmallBlindPositionId());
            if (it < 0) throw new EngineError('ERR_ACTIVE_PLAYER_NOT_FOUND');
            if (it === 0) it = apl.length;
            it--;
            this.setFirstRoundLastPlayersTurnId(apl[it].getMyUniqueID());
          } else {
            this.setFirstRoundLastPlayersTurnId(this.getSmallBlindPositionId());
          }
        } else {
          this.setFirstRoundLastPlayersTurnId(this.getBigBlindPositionId());
        }
      } else {
        // heads up -> dealer/smallBlindPlayer is first action player and bigBlindPlayer is player before
        if (bigBlindPositionIt < 0) {
          const smallBlindPositionIt = hand.getRunningPlayerIt(this.getSmallBlindPositionId());
          if (smallBlindPositionIt < 0) {
            // no running player -> showdown and no firstRoundLastPlayersTurnId is used
          } else {
            this.setFirstRoundLastPlayersTurnId(this.getSmallBlindPositionId());
          }
        } else {
          this.setFirstRoundLastPlayersTurnId(this.getBigBlindPositionId());
        }
      }
      this.setCurrentPlayersTurnId(this.getFirstRoundLastPlayersTurnId());
      this.setFirstRun(false);
    }

    let allHighestSet = true;
    const rpl = hand.getRunningPlayerList();
    for (const p of rpl) {
      if (this.getHighestSet() !== p.getMySet()) {
        allHighestSet = false;
        break;
      }
    }

    // determine next player
    let it = hand.getRunningPlayerIt(this.getCurrentPlayersTurnId());
    if (it < 0) throw new EngineError('ERR_RUNNING_PLAYER_NOT_FOUND');
    it++;
    if (it === rpl.length) it = 0;
    this.setCurrentPlayersTurnId(rpl[it].getMyUniqueID());

    if (!this.getFirstRound() && allHighestSet) {
      // Preflop nicht dran, also gehe in Flop
      hand.setCurrentRound(GAME_STATE_FLOP);
      for (const p of rpl) p.setMyAction(PLAYER_ACTION_NONE);
      hand.getBoard().collectSets();
      hand.getBoard().collectPot();
      gui.refreshPot();
      gui.refreshSet();
      gui.refreshCash();
      for (let i = 0; i < MAX_NUMBER_OF_PLAYERS; i++) gui.refreshAction(i, PLAYER_ACTION_NONE);
      hand.switchRounds();
    } else {
      // lastPlayersTurn -> PreflopFirstRound is over
      if (this.getCurrentPlayersTurnId() === this.getFirstRoundLastPlayersTurnId()) this.setFirstRound(false);
      it = hand.getRunningPlayerIt(this.getCurrentPlayersTurnId());
      if (it < 0) throw new EngineError('ERR_RUNNING_PLAYER_NOT_FOUND');
      rpl[it].setMyTurn(true);
      gui.refreshGroupbox(this.getCurrentPlayersTurnId(), 2);
      gui.refreshAction(this.getCurrentPlayersTurnId(), PLAYER_ACTION_NONE);
      if (this.getCurrentPlayersTurnId() === hand.humanUniqueId()) {
        gui.meInAction();
      } else {
        gui.beRoAnimation2(this.getMyBeRoID());
      }
    }
  }
}

export class LocalBeRoFlop extends LocalBeRo {
  constructor(hi: LocalHand, dP: number, sB: number) { super(hi, dP, sB, GAME_STATE_FLOP); }
}
export class LocalBeRoTurn extends LocalBeRo {
  constructor(hi: LocalHand, dP: number, sB: number) { super(hi, dP, sB, GAME_STATE_TURN); }
}
export class LocalBeRoRiver extends LocalBeRo {
  constructor(hi: LocalHand, dP: number, sB: number) { super(hi, dP, sB, GAME_STATE_RIVER); }
}

export class LocalBeRoPostRiver extends LocalBeRo {
  private highestCardsValue = 0;
  constructor(hi: LocalHand, dP: number, sB: number) { super(hi, dP, sB, GAME_STATE_POST_RIVER); }

  override getHighestCardsValue(): number { return this.highestCardsValue; }
  override run(): void {}

  override postRiverRun(): void {
    const hand = this.myHand;
    const apl = hand.getActivePlayerList();
    // who is the winner
    for (const p of apl) {
      if (p.getMyAction() !== PLAYER_ACTION_FOLD && p.getMyCardsValueInt() > this.highestCardsValue) {
        this.highestCardsValue = p.getMyCardsValueInt();
      }
    }
    let potPlayers = 0;
    for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) potPlayers++;
    // pruefen ob nur noch ein Spieler an der Verteilung teilnimmt und myAggressive setzen
    if (potPlayers === 1) {
      for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) p.setMyAggressive(true);
    }
    // Spieler ermitteln, welche die Karten auf jeden Fall umdrehen muessen
    hand.getBoard().determinePlayerNeedToShowCards();
    // Pot-Verteilung
    hand.getBoard().distributePot(this.getDealerPosition());
    hand.getBoard().setPot(0);
    // starte die Animationsreihe
    hand.getGuiInterface().postRiverRunAnimation1();
  }
}
