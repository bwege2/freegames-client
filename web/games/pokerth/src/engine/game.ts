// PokerTH 1.1.2: src/engine/game.cpp, translated line by line (without DEBUG_MODE and the SQLite log).
// AGPL-3.0-or-later, see ../../LICENSE.md.
import { LocalBoard } from './board.ts';
import {
  AFTERMB_DOUBLE_BLINDS, AFTERMB_RAISE_ABOUT, DOUBLE_BLINDS, EngineError, MAX_NUMBER_OF_PLAYERS, PLAYER_ACTION_NONE,
  PLAYER_TYPE_COMPUTER, PLAYER_TYPE_HUMAN, RAISE_ON_HANDNUMBER, idiv, type GameData, type PlayerData, type PlayerType,
  type StartData,
} from './defs.ts';
import type { GuiInterface } from './gui.ts';
import { LocalHand, localDealer, type Dealer } from './hand.ts';
import { LocalPlayer } from './player.ts';
import type { Rng } from './rng.ts';

export interface GameOptions {
  /** the random stream (Tools::GetRand) */
  rng: Rng;
  /** who deals the cards; the original's shuffle by default */
  dealer?: Dealer;
  /** blindsTimer.elapsed() in seconds (RAISE_ON_MINUTES) */
  elapsedSeconds?: () => number;
  /** the uniqueId of the player at this screen (the original: 0) */
  humanId?: number;
}

export class Game {
  private currentBoard: LocalBoard;
  private seatsList: LocalPlayer[] = [];
  private activePlayerList: LocalPlayer[] = [];
  private runningPlayerList: LocalPlayer[] = [];
  private currentHand: LocalHand | null = null;
  private startQuantityPlayers: number;
  private startCash: number;
  private startSmallBlind: number;
  private currentSmallBlind: number;
  private currentHandID = 0;
  private dealerPosition: number;
  private lastHandBlindsRaised = 1;
  private lastTimeBlindsRaised = 0;
  private blindsList: number[];
  private rng: Rng;
  private dealer: Dealer;
  private elapsedSeconds: () => number;
  private humanId: number;

  private myGui: GuiInterface;
  private myGameData: GameData;
  private myGameID: number;

  constructor(myGui: GuiInterface, playerDataList: PlayerData[], myGameData: GameData, startData: StartData, myGameID: number, opts: GameOptions) {
    this.myGui = myGui;
    this.myGameData = myGameData;
    this.myGameID = myGameID;
    this.rng = opts.rng;
    this.dealer = opts.dealer ?? localDealer(opts.rng);
    const start = Date.now();
    this.elapsedSeconds = opts.elapsedSeconds ?? (() => Math.floor((Date.now() - start) / 1000));
    this.humanId = opts.humanId ?? 0;
    this.startQuantityPlayers = startData.numberOfPlayers;
    this.startCash = myGameData.startMoney;
    this.startSmallBlind = myGameData.firstSmallBlind;
    this.currentSmallBlind = myGameData.firstSmallBlind;
    this.blindsList = [...myGameData.manualBlindsList];
    this.dealerPosition = startData.startDealerPlayerId;

    // determine dealer position
    if (!playerDataList.some((p) => p.uniqueId === this.dealerPosition)) throw new EngineError('ERR_DEALER_NOT_FOUND');

    // create board
    this.currentBoard = new LocalBoard();

    // create player
    let pi = 0;
    for (let i = 0; i < MAX_NUMBER_OF_PLAYERS; i++) {
      let myName = '';
      let myAvatarFile = '';
      let uniqueId = 0;
      let type: PlayerType = PLAYER_TYPE_COMPUTER;
      let myStartCash = this.startCash;
      let myStayOnTableStatus = false;
      if (pi < playerDataList.length) {
        const pd = playerDataList[pi];
        uniqueId = pd.uniqueId;
        type = pd.type;
        myName = pd.name;
        myAvatarFile = pd.avatar;
        if (pd.startCash >= 0) myStartCash = pd.startCash;
        myStayOnTableStatus = type === PLAYER_TYPE_HUMAN;
        pi++;
      }
      const tmpPlayer = new LocalPlayer(this.rng, i, uniqueId, type, myName, myAvatarFile, myStartCash, this.startQuantityPlayers > i, myStayOnTableStatus, 0);
      this.seatsList.push(tmpPlayer);
      if (this.startQuantityPlayers > i) this.activePlayerList.push(tmpPlayer);
      this.runningPlayerList.length = 0;
      this.runningPlayerList.push(...this.activePlayerList);
    }
    this.currentBoard.setPlayerLists(this.seatsList, this.activePlayerList, this.runningPlayerList);
  }

  getCurrentHand(): LocalHand {
    if (!this.currentHand) throw new EngineError('no hand');
    return this.currentHand;
  }
  getSeatsList(): LocalPlayer[] { return this.seatsList; }
  getActivePlayerList(): LocalPlayer[] { return this.activePlayerList; }
  getRunningPlayerList(): LocalPlayer[] { return this.runningPlayerList; }
  getMyGameID(): number { return this.myGameID; }
  getStartQuantityPlayers(): number { return this.startQuantityPlayers; }
  getStartSmallBlind(): number { return this.startSmallBlind; }
  getCurrentSmallBlind(): number { return this.currentSmallBlind; }
  getCurrentHandID(): number { return this.currentHandID; }
  getDealerPosition(): number { return this.dealerPosition; }
  getStartCash(): number { return this.startCash; }

  initHand(): void {
    this.currentHandID++;
    // calculate smallBlind
    this.raiseBlinds();
    // set player action none
    for (const p of this.seatsList) p.setMyAction(PLAYER_ACTION_NONE);
    // set player with empty cash inactive
    for (let i = 0; i < this.activePlayerList.length;) {
      if (this.activePlayerList[i].getMyCash() === 0) {
        this.activePlayerList[i].setMyActiveStatus(false);
        this.activePlayerList.splice(i, 1);
      } else {
        i++;
      }
    }
    this.runningPlayerList.length = 0;
    this.runningPlayerList.push(...this.activePlayerList);

    // create Hand
    this.currentHand = new LocalHand(this.myGui, this.currentBoard, this.seatsList, this.activePlayerList, this.runningPlayerList,
      this.currentHandID, this.startQuantityPlayers, this.dealerPosition, this.currentSmallBlind, this.startCash, this.rng, this.dealer,
      this.humanId);

    // shifting dealer button -> TODO exception-rule !!!
    let nextDealerFound = false;
    let dealerPositionIt = this.currentHand.getSeatIt(this.dealerPosition);
    if (dealerPositionIt < 0) throw new EngineError('ERR_SEAT_NOT_FOUND');
    for (let i = 0; i < this.seatsList.length; i++) {
      dealerPositionIt++;
      if (dealerPositionIt === this.seatsList.length) dealerPositionIt = 0;
      const it_c = this.currentHand.getActivePlayerIt(this.seatsList[dealerPositionIt].getMyUniqueID());
      if (it_c >= 0) {
        nextDealerFound = true;
        this.dealerPosition = this.activePlayerList[it_c].getMyUniqueID();
        break;
      }
    }
    if (!nextDealerFound) throw new EngineError('ERR_NEXT_DEALER_NOT_FOUND');
  }

  startHand(): void {
    this.myGui.nextRoundCleanGui();
    // log new hand
    this.myGui.logNewGameHandMsg(this.myGameID, this.currentHandID);
    this.myGui.flushLogAtGame(this.myGameID);
    this.getCurrentHand().start();
  }

  getPlayerByUniqueId(id: number): LocalPlayer | undefined {
    return this.seatsList.find((p) => p.getMyUniqueID() === id);
  }

  getCurrentPlayer(): LocalPlayer {
    const p = this.getPlayerByUniqueId(this.getCurrentHand().getCurrentBeRo().getCurrentPlayersTurnId());
    if (!p) throw new EngineError('ERR_CURRENT_PLAYER_NOT_FOUND');
    return p;
  }

  raiseBlinds(): void {
    let raiseBlinds = false;
    const gd = this.myGameData;
    if (gd.raiseIntervalMode === RAISE_ON_HANDNUMBER) {
      if (this.lastHandBlindsRaised + gd.raiseSmallBlindEveryHandsValue <= this.currentHandID) {
        raiseBlinds = true;
        this.lastHandBlindsRaised = this.currentHandID;
      }
    } else {
      const minutes = idiv(this.elapsedSeconds(), 60);
      if (this.lastTimeBlindsRaised + gd.raiseSmallBlindEveryMinutesValue <= minutes) {
        raiseBlinds = true;
        this.lastTimeBlindsRaised = minutes;
      }
    }
    if (raiseBlinds) {
      if (gd.raiseMode === DOUBLE_BLINDS) {
        this.currentSmallBlind *= 2;
      } else {
        if (this.blindsList.length) {
          this.currentSmallBlind = this.blindsList.shift()!;
        } else {
          // The position exceeds the list
          if (gd.afterManualBlindsMode === AFTERMB_DOUBLE_BLINDS) {
            this.currentSmallBlind *= 2;
          } else if (gd.afterManualBlindsMode === AFTERMB_RAISE_ABOUT) {
            this.currentSmallBlind += gd.afterMBAlwaysRaiseValue;
          }
        }
      }
      this.currentSmallBlind = Math.min(this.currentSmallBlind, idiv(this.startQuantityPlayers * this.startCash, 2));
    }
  }
}
