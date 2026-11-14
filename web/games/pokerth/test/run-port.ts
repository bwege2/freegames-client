// The port driven exactly as re/pokerth/oracle/main.cpp drives PokerTH 1.1.2's engine: every animation timer
// of the game table is a queued task, the human player (seat 0) is scripted from the same random stream, and
// the same transcript is printed. AGPL-3.0-or-later, see ../LICENSE.md.
import { cardsValue } from '../src/engine/cardsvalue.ts';
import {
  AFTERMB_DOUBLE_BLINDS, DOUBLE_BLINDS, GAME_STATE_RIVER, MANUAL_BLINDS_ORDER, PLAYER_ACTION_FOLD,
  PLAYER_TYPE_COMPUTER, PLAYER_TYPE_HUMAN, RAISE_ON_HANDNUMBER, defaultGameData, type PlayerData,
} from '../src/engine/defs.ts';
import { Game } from '../src/engine/game.ts';
import type { GuiInterface } from '../src/engine/gui.ts';
import type { LocalHand } from '../src/engine/hand.ts';
import { determineHandName } from '../src/engine/handname.ts';
import { myAllIn, myCall, myCheck, myFold, mySet } from '../src/engine/human.ts';
import { Rng } from '../src/engine/rng.ts';

const ACTION = ['none', 'fold', 'check', 'call', 'bet', 'raise', 'allin'];

export function runGame(seed: number, players: number, startCash: number, smallBlind: number, everyHands: number, maxHands: number, manualBlinds: number[] = []): string {
  const out: string[] = [];
  const rng = new Rng(seed);
  const tasks: (() => void)[] = [];
  let gameOver = false;
  let handsPlayed = 0;
  let flipDone = false;
  // eslint-disable-next-line prefer-const
  let game: Game;
  const hand = (): LocalHand => game.getCurrentHand();
  const run = () => tasks.push(() => hand().getCurrentBeRo().run());

  const showHoleCards = (h: LocalHand, playerId: number, allIn: boolean) => {
    for (const p of h.getActivePlayerList()) {
      if (p.getMyUniqueID() === playerId) {
        if (h.getCurrentRound() < GAME_STATE_RIVER || allIn) p.setMyCardsFlip(true, 2);
        else p.setMyCardsFlip(true, 1);
      }
    }
  };

  const human = () => hand().getSeatsList()[0];
  const myActionDone = () => gui.nextPlayerAnimation();

  const humanAction = () => {
    const h = hand();
    const p = human();
    const bero = h.getCurrentBeRo();
    const hs = bero.getHighestSet();
    const full = bero.getFullBetRule();
    let callCheck = 0;
    let betRaise = 0;
    if (h.getCurrentRound() === 0) {
      if (p.getMyCash() + p.getMySet() > hs && !full) betRaise = 2;
      callCheck = p.getMySet() === hs && p.getMyButton() === 3 ? 1 : 2;
    } else {
      if (hs === 0) {
        callCheck = 1;
        betRaise = 1;
      }
      if (hs > 0 && hs > p.getMySet()) {
        callCheck = 2;
        if (p.getMyCash() + p.getMySet() > hs && !full) betRaise = 2;
      }
    }
    const allIn = !full;
    const r = rng.getRand(1, 100);
    if (r <= 10) {
      myFold(h, p);
      return myActionDone();
    }
    if (r > 70 && r <= 92 && betRaise) {
      let minimum = hs - p.getMySet() + bero.getMinimumRaise();
      if (betRaise === 1 && minimum < 2 * h.getSmallBlind()) minimum = 2 * h.getSmallBlind();
      const value = minimum >= p.getMyCash() ? p.getMyCash() : rng.getRand(minimum, p.getMyCash());
      mySet(h, p, value, betRaise === 2, betRaise === 1);
      return myActionDone();
    }
    if (r > 92 && allIn) {
      myAllIn(h, p);
      return myActionDone();
    }
    if (callCheck === 2) myCall(h, p);
    else if (callCheck === 1) myCheck(h, p);
    else myFold(h, p);
    myActionDone();
  };

  const printHand = () => {
    const h = hand();
    const b = [0, 0, 0, 0, 0];
    h.getBoard().getMyCards(b);
    out.push(`board ${b.join(' ')} sb ${h.getSmallBlind()} dealer ${h.getDealerPosition()}`);
    for (const p of h.getSeatsList()) {
      if (!p.getMyActiveStatus()) continue;
      const c = [0, 0];
      const pos = [0, 0, 0, 0, 0];
      p.getMyCards(c);
      p.getMyBestHandPosition(pos);
      out.push(`seat ${p.getMyID()} ${p.getMyName()} button ${p.getMyButton()} cash ${p.getMyCash()} set ${p.getMySet()} cards ${c[0]} ${c[1]} value ${p.getMyCardsValueInt()} best ${pos.join('')} dude ${p.getMyDude()}/${p.getMyDude4()} bluff ${p.getSBluff()}`);
    }
  };

  const endOfHand = () => {
    const h = hand();
    const apl = h.getActivePlayerList();
    let nonfold = 0;
    for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) nonfold++;
    if (nonfold !== 1) {
      if (!flipDone) {
        for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD && p.checkIfINeedToShowCards()) showHoleCards(h, p.getMyUniqueID(), false);
        flipDone = true;
      } else {
        for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) p.setMyCardsFlip(true, 3);
      }
    }
    out.push(`highest ${h.getCurrentBeRo().getHighestCardsValue()}`);
    out.push(`show${h.getBoard().getPlayerNeedToShowCards().map((x) => ` ${x}`).join('')}`);
    out.push(`winners${h.getBoard().getWinners().map((x) => ` ${x}`).join('')}`);
    out.push(`cash${h.getSeatsList().map((p) => ` ${p.getMyCash()}/${p.getLastMoneyWon()}`).join('')}`);
    handsPlayed++;
    const positive = apl.filter((p) => p.getMyCash() > 0);
    if (positive.length === 1) {
      out.push(`gamewinner ${positive[0].getMyName()}`);
      gameOver = true;
      return;
    }
    if (handsPlayed >= maxHands) {
      gameOver = true;
      return;
    }
    flipDone = false;
    game.initHand();
    printHand();
    game.startHand();
  };

  const gui: GuiInterface = {
    refreshSet() {},
    refreshCash() {},
    refreshAction() {},
    refreshPot() {},
    refreshGroupbox() {},
    refreshAll() {},
    refreshGameLabels() {},
    dealBeRoCards: () => tasks.push(() => hand().switchRounds()),
    dealHoleCards() {},
    nextPlayerAnimation: () => tasks.push(() => hand().switchRounds()),
    beRoAnimation2: () => tasks.push(() => hand().getCurrentBeRo().nextPlayer()),
    preflopAnimation1: run,
    flopAnimation1: run,
    turnAnimation1: run,
    riverAnimation1: run,
    postRiverAnimation1: () => tasks.push(() => hand().getCurrentBeRo().postRiverRun()),
    postRiverRunAnimation1: () => tasks.push(endOfHand),
    flipHolecardsAllIn() {
      const h = hand();
      if (!flipDone && h.getCurrentRound() < GAME_STATE_RIVER) {
        const apl = h.getActivePlayerList();
        const nonfold = apl.filter((p) => p.getMyAction() !== PLAYER_ACTION_FOLD).length;
        if (nonfold !== 1) for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) showHoleCards(h, p.getMyUniqueID(), false);
        flipDone = true;
      }
    },
    nextRoundCleanGui() {},
    meInAction: () => tasks.push(humanAction),
    logPlayerActionMsg: (name, action, setValue) => out.push(`act ${name} ${ACTION[action] ?? '?'} ${setValue}`),
    logNewGameHandMsg: (_g, handId) => out.push(`hand ${handId}`),
    logNewBlindsSetsMsg: (sb, bb, sbName, bbName) => out.push(`blinds ${sb} ${bb} ${sbName} / ${bbName}`),
    logDealBoardCardsMsg: (round, c1, c2, c3, c4 = -1, c5 = -1) => out.push(`deal ${round} ${c1} ${c2} ${c3} ${c4} ${c5}`),
    logFlipHoleCardsMsg: (name, c1, c2, value = -1, showHas = 'shows') => {
      out.push(`flip ${name} ${c1} ${c2} ${value} ${showHas}`);
      // guiLog::logFlipHoleCardsMsg writes the hand's name
      if (value !== -1) out.push(`handname ${name} ${determineHandName(value, hand().getActivePlayerList())}`);
    },
    flushLogAtGame() {},
    flushLogAtHand() {},
  };

  const gd = defaultGameData();
  gd.maxNumberOfPlayers = players;
  gd.startMoney = startCash;
  gd.firstSmallBlind = smallBlind;
  gd.raiseIntervalMode = RAISE_ON_HANDNUMBER;
  gd.raiseSmallBlindEveryHandsValue = everyHands;
  if (manualBlinds.length) {
    gd.raiseMode = MANUAL_BLINDS_ORDER;
    gd.manualBlindsList = manualBlinds;
    gd.afterManualBlindsMode = AFTERMB_DOUBLE_BLINDS;
  } else {
    gd.raiseMode = DOUBLE_BLINDS;
  }
  const dealer = rng.getRand(0, players - 1);
  const pdl: PlayerData[] = [];
  for (let i = 0; i < players; i++) {
    pdl.push({ uniqueId: i, type: i === 0 ? PLAYER_TYPE_HUMAN : PLAYER_TYPE_COMPUTER, name: i === 0 ? 'Human_Player' : `Player_${i}`, avatar: '', startCash: -1 });
  }
  game = new Game(gui, pdl, gd, { numberOfPlayers: players, startDealerPlayerId: dealer }, 1, { rng });
  out.push(`game players ${players} cash ${startCash} sb ${smallBlind} dealer ${dealer}`);
  for (const p of game.getSeatsList()) out.push(`player ${p.getMyID()} dude ${p.getMyDude()}/${p.getMyDude4()}`);
  game.initHand();
  printHand();
  game.startHand();
  let steps = 0;
  while (tasks.length && !gameOver) {
    tasks.shift()!();
    if (++steps > 10000000) throw new Error('too many steps');
  }
  out.push(`end ${handsPlayed}`);
  return out.join('\n') + '\n';
}

/** rank SEED COUNT, as the oracle: cardsValue of random 7-card hands */
export function runRank(seed: number, count: number): string {
  const rng = new Rng(seed);
  const out: string[] = [];
  for (let n = 0; n < count; n++) {
    const deck: number[] = [];
    for (let i = 0; i < 52; i++) deck.push(i);
    rng.shuffle(deck);
    const cards = deck.slice(0, 7);
    const pos = [-1, -1, -1, -1, -1];
    const v = cardsValue(cards, pos);
    out.push(`${cards.join(' ')} ${v} ${pos.join('')}`);
  }
  return out.join('\n') + '\n';
}
