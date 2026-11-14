// Online games: the original's internet game (a PokerTH server runs the engine, the clients show it) becomes
// a lockstep game: every client runs the same engine (./engine/) on the same stream of messages in the
// server's order, and the server module only deals (protocol/games/pokerth.capnp, PokerthModule.java):
// hole cards come privately, board and hole cards are shown when every client asks for them. A message for
// step n of a hand counts only if it comes after the message that ended step n-1, so every client takes the
// same one. Like the original server, a player who times out checks if he can, else folds.
// AGPL-3.0-or-later, see ../LICENSE.md.
import { packGame, unpackGame, SERVER_SEAT, type GameContext, type GameMessage, type RoundStart } from '../../../src/sdk/index.ts';
import {
  AFTERMB_DOUBLE_BLINDS, DOUBLE_BLINDS, MANUAL_BLINDS_ORDER, PLAYER_ACTION_FOLD, PLAYER_TYPE_HUMAN, RAISE_ON_HANDNUMBER,
  RAISE_ON_MINUTES, defaultGameData, type GameData, type GameState, type PlayerData,
} from './engine/defs.ts';
import { Game } from './engine/game.ts';
import type { LocalHand } from './engine/hand.ts';
import { provideMyActions } from './engine/human.ts';
import type { LocalPlayer } from './engine/player.ts';
import { Rng } from './engine/rng.ts';
import { Msg, Options, Results } from './proto/pokerth.ts';
import type { Config } from './config.ts';
import { saveConfig } from './config.ts';
import type { Sound } from './sound.ts';
import { applyHumanAction, type GameTable, type HumanAction, type TableDriver } from './table.ts';

const GRACE_MS = 5000;
const KIND: HumanAction['kind'][] = ['fold', 'fold', 'check', 'call', 'set', 'set', 'allin'];

export interface OnlineSetup {
  ctx: GameContext;
  lobbyHost: HTMLElement;
  config: Config;
  makeTable: (title: string, speed: number) => GameTable;
  back: () => void;
  nextGameNum: () => number;
  sound: Sound;
  blindsFields: (d: HTMLElement, c: Config, net: boolean) => () => Partial<GameData>;
}

/** the "Create Internet Game" settings, before the lobby */
function settings(s: OnlineSetup): Promise<boolean> {
  const c = s.config;
  return new Promise((resolve) => {
    const o = document.createElement('div');
    o.className = 'pth-overlay';
    const d = document.createElement('div');
    d.className = 'pth-dialog';
    o.appendChild(d);
    s.lobbyHost.appendChild(o);
    const h = document.createElement('h3');
    h.textContent = 'Internet Game: your name and the settings of a game you create';
    d.appendChild(h);
    const row = (label: string, value: number, min: number, max: number) => {
      const r = document.createElement('div');
      r.className = 'row';
      const l = document.createElement('label');
      l.textContent = label;
      const i = document.createElement('input');
      i.type = 'number';
      i.min = String(min);
      i.max = String(max);
      i.value = String(value);
      r.append(l, i);
      d.appendChild(r);
      return () => Math.min(max, Math.max(min, Math.trunc(Number(i.value)) || min));
    };
    const nr = document.createElement('div');
    nr.className = 'row';
    const nl = document.createElement('label');
    nl.textContent = 'Nick:';
    const name = document.createElement('input');
    name.type = 'text';
    name.maxLength = 20;
    name.value = c.myName;
    nr.append(nl, name);
    d.appendChild(nr);
    const cash = row('Start cash: $', c.netStartCash, 1000, 1000000);
    const blinds = s.blindsFields(d, c, true);
    const timeout = row('Timeout for player action (sec):', c.netTimeOutPlayerAction, 5, 60);
    const speed = row('Game speed:', c.gameSpeed, 1, 11);
    const bs = document.createElement('div');
    bs.className = 'buttons';
    const cancel = document.createElement('button');
    cancel.textContent = 'Cancel';
    cancel.onclick = () => {
      o.remove();
      resolve(false);
    };
    const ok = document.createElement('button');
    ok.textContent = 'OK';
    ok.onclick = () => {
      c.myName = name.value.trim().slice(0, 20) || 'Human Player';
      c.netStartCash = cash();
      blinds();
      c.netTimeOutPlayerAction = timeout();
      c.gameSpeed = speed();
      void saveConfig(s.ctx.storage, c).catch(() => {});
      o.remove();
      resolve(true);
    };
    bs.append(cancel, ok);
    d.appendChild(bs);
  });
}

function packOptions(c: Config): Uint8Array {
  return packGame(Options, (o) => {
    o.startCash = c.netStartCash;
    o.firstSmallBlind = Math.min(c.firstSmallBlind, Math.floor(c.netStartCash / 2));
    o.raiseOnMinutes = c.raiseOnMinutes;
    o.raiseEvery = c.raiseOnMinutes ? c.raiseEveryMinutes : c.raiseEveryHands;
    const list = c.alwaysDoubleBlinds ? [] : c.manualBlinds;
    const l = o._initManualBlinds(list.length);
    list.forEach((b, i) => l.set(i, b));
    o.afterManual = c.afterMB === 'd' ? 1 : c.afterMB === 'r' ? 2 : 3;
    o.raiseAbout = c.afterMBRaiseValue;
    o.timeoutSec = c.netTimeOutPlayerAction;
    o.gameSpeed = c.gameSpeed;
  });
}

function gameData(options: Uint8Array, players: number): { gd: GameData; timeoutSec: number } {
  const gd = defaultGameData();
  let timeoutSec = 20;
  gd.maxNumberOfPlayers = players;
  gd.startMoney = 3000;
  gd.firstSmallBlind = 10;
  if (options.length) {
    const o = unpackGame(Options, options);
    gd.startMoney = o.startCash;
    gd.firstSmallBlind = o.firstSmallBlind;
    gd.raiseIntervalMode = o.raiseOnMinutes ? RAISE_ON_MINUTES : RAISE_ON_HANDNUMBER;
    gd.raiseSmallBlindEveryHandsValue = o.raiseEvery;
    gd.raiseSmallBlindEveryMinutesValue = o.raiseEvery;
    const manual = [...o.manualBlinds];
    gd.raiseMode = manual.length ? MANUAL_BLINDS_ORDER : DOUBLE_BLINDS;
    gd.manualBlindsList = manual;
    gd.afterManualBlindsMode = o.afterManual || AFTERMB_DOUBLE_BLINDS;
    gd.afterMBAlwaysRaiseValue = o.raiseAbout;
    gd.guiSpeed = o.gameSpeed || 4;
    timeoutSec = o.timeoutSec || 20;
  }
  return { gd, timeoutSec };
}

/** opens the lobby and plays one round; resolves with a function that leaves it */
export async function startOnline(s: OnlineSetup): Promise<() => void> {
  if (!(await settings(s))) throw new Error('cancelled');
  const round = await s.ctx.lobby(s.lobbyHost, {
    title: 'PokerTH: Internet Game',
    seats: { min: 2, max: 10, default: 10 },
    options: () => packOptions(s.config),
  });
  const game = new OnlineGame(s, round);
  return () => game.close();
}

interface Entry {
  i: number;
  from: number;
  m: Msg;
}

class OnlineGame {
  private table: GameTable;
  private game: Game;
  private myIndex: number;
  private n: number;
  /** the message stream, in the server's order */
  private stream: Entry[] = [];
  private nextIndex = 0;
  private waiter: (() => boolean) | null = null;
  private off: (() => void)[] = [];
  private handNo = -1;
  private step = 0;
  /** the stream index of the message that ended the previous step (or dealt the hand) */
  private activatedAt = -1;
  private elapsed = 0;
  private myCards: [number, number] | null = null;
  private left = new Set<number>();
  private timeoutSec: number;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(private s: OnlineSetup, private round: RoundStart) {
    const ctx = s.ctx;
    const seats = [...round.seats].sort((a, b) => a.seat - b.seat);
    this.n = seats.length;
    this.myIndex = seats.findIndex((x) => x.seat === round.you);
    const { gd, timeoutSec } = gameData(round.options, this.n);
    this.timeoutSec = timeoutSec;
    this.table = s.makeTable('PokerTH', gd.guiSpeed);
    this.table.setOnline(true);
    this.table.seatOffset = this.myIndex;
    this.table.playerCount = this.n;
    const rng = new Rng(Number(round.seed & 0xffffffffn) || 1);
    const dealer = rng.getRand(0, this.n - 1);
    const pdl: PlayerData[] = seats.map((x, i) => ({ uniqueId: i, type: PLAYER_TYPE_HUMAN, name: x.name || `Player ${i + 1}`, avatar: '', startCash: -1 }));
    const self = this;
    const driver: TableDriver = {
      online: true,
      otherPlayersTurn: (hand, p) => self.awaitAction(hand, p),
      myAction: (hand, a) => self.sendAction(hand, a),
      boardCards: (hand, round2, cont) => self.boardCards(hand, round2, cont),
      holeCards: (hand, cont) => self.holeCards(hand, cont),
      nextHand: () => self.nextHand(),
      newGame: () => {},
      leave: () => self.leave(),
    };
    this.table.driver = driver;
    this.table.onMyTurn = (hand, p) => this.awaitAction(hand, p);
    this.game = new Game(this.table, pdl, gd, { numberOfPlayers: this.n, startDealerPlayerId: dealer }, s.nextGameNum(), {
      rng,
      humanId: this.myIndex,
      elapsedSeconds: () => this.elapsed,
      dealer: {
        deal: (hand: LocalHand) => {
          const cards = new Array<number>(52).fill(-1);
          const apl = hand.getActivePlayerList();
          // unknown cards: value 1, so that a lone player left in the hand still wins the pot everywhere
          for (const p of apl) {
            p.setMyCardsValueInt(1);
            p.setMyCards([-1, -1]);
          }
          const k = apl.findIndex((p) => p.getMyUniqueID() === this.myIndex);
          if (k >= 0 && this.myCards) {
            cards[5 + 2 * k] = this.myCards[0];
            cards[6 + 2 * k] = this.myCards[1];
          }
          return cards;
        },
      },
    });
    this.table.game = this.game;
    this.off.push(ctx.rooms.on('message', (m: GameMessage) => this.take(m)));
    this.off.push(ctx.rooms.on('finished', () => this.over('The game is over.')));
    this.off.push(ctx.rooms.on('closed', () => this.over('The connection to the game was closed.')));
    this.off.push(ctx.rooms.on('started', (r) => {
      if (r.rejoined) this.over('The connection was lost; this port cannot bring a running game back.');
    }));
    if (round.rejoined) {
      this.over('The connection was lost; this port cannot bring a running game back.');
      return;
    }
    this.table.logLine(`Game with ${seats.map((x) => x.name).join(', ')}`);
    this.nextHand();
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const f of this.off) f();
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.table.stopTimer();
    try {
      this.s.ctx.rooms.leave();
    } catch {
      /* already out */
    }
  }

  private leave(): void {
    this.close();
    this.s.back();
  }

  private over(text: string): void {
    if (this.closed) return;
    this.table.stopTimer();
    this.table.message(text);
    const back = this.table.root.querySelector('.overlay button') as HTMLButtonElement | null;
    if (back) back.addEventListener('click', () => this.leave());
  }

  // ---- the stream
  private take(gm: GameMessage): void {
    let m: Msg;
    try {
      m = unpackGame(Msg, gm.data);
      m.which();
    } catch {
      return;
    }
    const e: Entry = { i: this.nextIndex++, from: gm.from, m };
    // a seat leaving is known from its place in the stream on
    this.stream.push(e);
    this.pump();
  }

  private pump(): void {
    if (this.waiter && this.waiter()) this.waiter = null;
  }

  private wait(w: () => boolean): void {
    this.waiter = w;
    this.pump();
  }

  private send(fill: (m: Msg) => void, to: 'all' | 'server'): void {
    this.s.ctx.rooms.send(packGame(Msg, fill), to);
  }

  private request(kind: 'deal' | 'reveal', hand: number, stage: number, seats: number[]): void {
    this.send((m) => {
      const r = kind === 'deal' ? m._initDeal() : m._initReveal();
      r.hand = hand;
      r.stage = stage;
      const l = r._initSeats(seats.length);
      seats.forEach((x, i) => l.set(i, x));
    }, 'server');
  }

  /** the first entry after `from` that matches, removed from the stream */
  private find(pred: (e: Entry) => boolean, from = -1): Entry | null {
    const k = this.stream.findIndex((e) => e.i > from && pred(e));
    if (k < 0) return null;
    return this.stream.splice(k, 1)[0];
  }

  // ---- hands
  private nextHand(): void {
    const apl = this.game.getActivePlayerList().filter((p) => p.getMyCash() > 0);
    if (apl.length <= 1) {
      const w = apl[0];
      if (w && this.myIndex === 0) {
        this.s.ctx.rooms.finish(packGame(Results, (r) => {
          r.winner = w.getMyUniqueID();
        }));
      }
      this.over(w ? `${w.getMyName()} wins the game!` : 'The game is over.');
      return;
    }
    const h = this.handNo + 1;
    this.request('deal', h, 0, apl.map((p) => p.getMyUniqueID()).sort((a, b) => a - b));
    this.wait(() => {
      const e = this.find((x) => x.from === SERVER_SEAT && x.m.which() === Msg.DEALT && x.m.dealt.hand === h);
      if (!e) return false;
      const d = e.m.dealt;
      this.handNo = h;
      this.step = 0;
      this.activatedAt = e.i;
      this.elapsed = d.elapsedSec;
      const c = [...d.cards];
      this.myCards = c.length === 2 ? [c[0], c[1]] : null;
      this.sweepLeft(e.i);
      // the stream keeps nothing older than this hand
      this.stream = this.stream.filter((x) => x.i > e.i || (x.m.which() === Msg.ACTION && x.m.action.hand >= h));
      this.game.initHand();
      this.game.startHand();
      return true;
    });
  }

  private validAction(hand: LocalHand, p: LocalPlayer, kind: number, value: number): HumanAction | null {
    const a = provideMyActions(hand, p);
    switch (KIND[kind] ?? '') {
      case 'fold':
        return kind === 1 ? { kind: 'fold' } : null;
      case 'check':
        return a.callCheck === 'check' ? { kind: 'check' } : null;
      case 'call':
        return a.callCheck === 'call' ? { kind: 'call' } : null;
      case 'set': {
        const want = kind === 4 ? 'bet' : 'raise';
        if (a.betRaise !== want) return null;
        if (value < Math.min(a.betMin, p.getMyCash()) || value > p.getMyCash()) return null;
        return { kind: 'set', value, raise: want === 'raise', bet: want === 'bet' };
      }
      case 'allin':
        return a.allIn ? { kind: 'allin' } : null;
    }
    return null;
  }

  /** a player's turn (this screen's player too): the first valid action for this step in the stream */
  private awaitAction(hand: LocalHand, p: LocalPlayer): void {
    const h = this.handNo;
    const step = this.step;
    const seat = p.getMyUniqueID();
    const after = this.activatedAt;
    this.table.startTimeoutAnimation(p.getMyID(), this.timeoutSec);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.send((m) => {
        const x = m._initIdle();
        x.hand = h;
        x.step = step;
      }, 'server');
    }, this.timeoutSec * 1000 + GRACE_MS);
    const done = (e: Entry | null, a: HumanAction) => {
      if (this.idleTimer) clearTimeout(this.idleTimer);
      this.idleTimer = null;
      this.table.stopTimeoutAnimation();
      if (e) this.activatedAt = e.i;
      this.step++;
      applyHumanAction(hand, p, a);
      this.table.nextPlayerAnimation();
    };
    const autoAction = (): HumanAction =>
      hand.getCurrentBeRo().getHighestSet() === p.getMySet() ? { kind: 'check' } : { kind: 'fold' };
    this.sweepLeft(after);
    if (this.left.has(seat)) return done(null, autoAction());
    this.wait(() => {
      for (;;) {
        const e = this.find((x) => {
          const w = x.m.which();
          if (w === Msg.ACTION) return x.m.action.hand === h && x.m.action.step === step;
          if (w === Msg.TIMED_OUT) return x.from === SERVER_SEAT && x.m.timedOut.hand === h && x.m.timedOut.step === step;
          return w === Msg.LEFT && x.from === SERVER_SEAT;
        }, after);
        if (!e) return false;
        const w = e.m.which();
        if (w === Msg.LEFT) {
          this.markLeft(e.m.left);
          if (e.m.left === seat) {
            done(e, autoAction());
            return true;
          }
          continue;
        }
        if (w === Msg.TIMED_OUT) {
          done(e, autoAction());
          return true;
        }
        if (e.from !== this.seatOf(seat)) continue;
        const a = this.validAction(hand, p, e.m.action.kind, e.m.action.value);
        if (!a) continue;
        done(e, a);
        return true;
      }
    });
  }

  /** seats that left before stream position `upTo` (the same set on every client) */
  private sweepLeft(upTo: number): void {
    for (;;) {
      const e = this.stream.find((x) => x.i <= upTo && x.from === SERVER_SEAT && x.m.which() === Msg.LEFT);
      if (!e) return;
      this.stream.splice(this.stream.indexOf(e), 1);
      this.markLeft(e.m.left);
    }
  }

  private markLeft(seat: number): void {
    if (this.left.has(seat)) return;
    this.left.add(seat);
    this.table.logLine(`${this.game.getSeatsList()[seat]?.getMyName() ?? '?'} has left the game.`, '#ff6633');
  }

  /** room seat number of a round index */
  private seatOf(index: number): number {
    return [...this.round.seats].sort((a, b) => a.seat - b.seat)[index].seat;
  }

  private sendAction(_hand: LocalHand, a: HumanAction): void {
    const kind = a.kind === 'fold' ? 1 : a.kind === 'check' ? 2 : a.kind === 'call' ? 3 : a.kind === 'allin' ? 6 : a.bet ? 4 : 5;
    const value = a.kind === 'set' ? a.value : 0;
    const h = this.handNo;
    const step = this.step;
    this.send((m) => {
      const x = m._initAction();
      x.hand = h;
      x.step = step;
      x.kind = kind;
      x.value = value;
    }, 'all');
  }

  private boardCards(hand: LocalHand, round: GameState, cont: () => void): void {
    const b = [0, 0, 0, 0, 0];
    hand.getBoard().getMyCards(b);
    const idx = round === 1 ? [0, 1, 2] : [round + 1];
    if (idx.every((k) => b[k] >= 0)) return cont();
    const h = this.handNo;
    this.request('reveal', h, round, []);
    this.wait(() => {
      const e = this.find((x) => x.from === SERVER_SEAT && x.m.which() === Msg.BOARD && x.m.board.hand === h && x.m.board.stage === round);
      if (!e) return false;
      const c = [...e.m.board.cards];
      idx.forEach((k, i) => (b[k] = c[i] ?? -1));
      hand.reveal(b, new Map());
      cont();
      return true;
    });
  }

  private holeCards(hand: LocalHand, cont: () => void): void {
    const nonfold = hand.getActivePlayerList().filter((p) => p.getMyAction() !== PLAYER_ACTION_FOLD);
    if (nonfold.length <= 1) return cont();
    // the others' cards are known only after the server showed them (all in, or this showdown)
    const known = nonfold.every((p) => {
      const c = [0, 0];
      p.getMyCards(c);
      return c[0] >= 0 && c[1] >= 0;
    });
    if (known) return cont();
    const h = this.handNo;
    const seats = nonfold.map((p) => p.getMyUniqueID()).sort((a, b) => a - b);
    this.request('reveal', h, 4, seats);
    this.wait(() => {
      const e = this.find((x) => x.from === SERVER_SEAT && x.m.which() === Msg.HOLES && x.m.holes.hand === h);
      if (!e) return false;
      const ss = [...e.m.holes.seats];
      const cc = [...e.m.holes.cards];
      const holes = new Map<number, [number, number]>();
      ss.forEach((x, i) => holes.set(x, [cc[2 * i], cc[2 * i + 1]]));
      hand.reveal(null, holes);
      cont();
      return true;
    });
  }
}
