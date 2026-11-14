// PokerTH 1.1.2's game table: src/gui/qt/gametable/gametableimpl.cpp (the GuiInterface the engine calls, its
// animation timers and speeds, the action buttons), gametable.ui (the layout: every position below is the
// original's widget geometry at the minimum window size 1024x600, read from the running original with
// QT_USE_NATIVE_WINDOWS=1 and xwininfo, re/pokerth/NOTES.md), the default table style
// (gfx/gui/table/default/defaulttablestyle.xml: images, colours; gametablestylereader.cpp: Linux font sizes),
// mycardspixmaplabel.cpp (flip and fade animations) and log/guilog.cpp (the log's texts).
// The table is drawn with DOM elements on a 1024x600 surface that is scaled to the window.
// AGPL-3.0-or-later, see ../LICENSE.md.
import { FONT_URL, cardUrl, flipsideUrl, miscUrl, tableUrl } from './assets.ts';
import {
  GAME_STATE_FLOP, GAME_STATE_RIVER, GAME_STATE_TURN, MAX_NUMBER_OF_PLAYERS, PLAYER_ACTION_ALLIN, PLAYER_ACTION_FOLD,
  PLAYER_ACTION_NONE, type GameState,
} from './engine/defs.ts';
import type { Game } from './engine/game.ts';
import type { GuiInterface } from './engine/gui.ts';
import type { LocalHand } from './engine/hand.ts';
import { determineHandName, translateCardCode } from './engine/handname.ts';
import { getMyBetAmount, myAllIn, myCall, myCheck, myFold, mySet, provideMyActions } from './engine/human.ts';
import type { LocalPlayer } from './engine/player.ts';
import type { Sound } from './sound.ts';

/** what the human pressed: the game table's myFold, myCheck, myCall, mySet, myAllIn */
export type HumanAction =
  | { kind: 'fold' }
  | { kind: 'check' }
  | { kind: 'call' }
  | { kind: 'set'; value: number; raise: boolean; bet: boolean }
  | { kind: 'allin' };

/** apply a human action to the engine exactly as the game table does (without the GUI part) */
export function applyHumanAction(hand: LocalHand, player: LocalPlayer, a: HumanAction): void {
  switch (a.kind) {
    case 'fold': return myFold(hand, player);
    case 'check': return myCheck(hand, player);
    case 'call': return myCall(hand, player);
    case 'set': return mySet(hand, player, a.value, a.raise, a.bet);
    case 'allin': return myAllIn(hand, player);
  }
}

/**
 * Where a local game and an online game differ. The local driver (the original's local game) does
 * everything at once; the online driver (online.ts) waits for the server where the cards are not known yet,
 * and for the other players' actions.
 */
export interface TableDriver {
  online: boolean;
  /** a computer opponent's or another player's turn (beRoAnimation2 → nextPlayer) */
  otherPlayersTurn(hand: LocalHand, player: LocalPlayer): void;
  /** the player at this screen acted */
  myAction(hand: LocalHand, a: HumanAction): void;
  /** before the board cards of `round` are shown (dealFlopCards4, dealTurnCards2, dealRiverCards2) */
  boardCards(hand: LocalHand, round: GameState, cont: () => void): void;
  /** before hole cards are shown (all-in, showdown) and before the pot is distributed */
  holeCards(hand: LocalHand, cont: () => void): void;
  /** startNewHand: the next hand */
  nextHand(): void;
  /** the break button: "Stop" pressed / "Start" pressed after the game ended */
  newGame(): void;
  /** leave the table (menu) */
  leave(): void;
}

const W = 1024;
const H = 600;
/** group box positions (gametable.ui groupBox0..9, absolute, the menu bar is 0..21) */
const SEAT_POS: [number, number][] = [
  [416, 267], [209, 267], [2, 232], [2, 56], [209, 21], [416, 21], [623, 21], [832, 56], [832, 232], [623, 267],
];
/** the seats whose name is above the cards (groupBox3..7) */
const TOP = [false, false, false, true, true, true, true, true, false, false];

const css = `
@font-face { font-family: "PokerTH DejaVu Sans"; src: url("${FONT_URL}"); font-weight: bold; }
.pth { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; overflow: hidden;
  background: #145300 url("${tableUrl('table')}") no-repeat center bottom; font-family: "PokerTH DejaVu Sans", "DejaVu Sans", sans-serif;
  user-select: none; -webkit-user-select: none; color: #f0f0f0; }
.pth * { box-sizing: border-box; }
.pth .abs { position: absolute; }
.pth .menu { left: 0; top: 0; width: ${W}px; height: 21px; background: #145300; color: #99d500; font: 12px sans-serif; display: flex; }
.pth .menu > div { padding: 3px 8px; cursor: pointer; position: relative; }
.pth .menu > div:hover { background: #286400; }
.pth .menu .drop { display: none; position: absolute; left: 0; top: 21px; background: #145300; border: 1px solid #286400; z-index: 10; min-width: 220px; }
.pth .menu > div.open .drop { display: block; }
.pth .menu .drop div { padding: 4px 10px; white-space: nowrap; }
.pth .menu .drop div:hover { background: #286400; }
.pth .seat { width: 190px; height: 142px; background-repeat: no-repeat; }
.pth .name { font-size: 11px; font-weight: bold; color: #f0f0f0; white-space: nowrap; overflow: hidden; }
.pth .cash { font-size: 10px; font-weight: bold; color: #ffff00; }
.pth .set { font-size: 10px; font-weight: bold; color: #ffff00; text-align: center; }
.pth .card { width: 48px; height: 76px; }
.pth .board-big { font-size: 17px; font-weight: bold; color: #669900; text-align: center; }
.pth .board-small { font-size: 13px; font-weight: bold; color: #669900; }
.pth .abtn { width: 168px; height: 43px; border: none; background: no-repeat center center; font: bold 12px "PokerTH DejaVu Sans", sans-serif;
  color: #f0f0f0; white-space: pre; cursor: pointer; padding: 0; line-height: 14px; }
.pth .abtn .fkey { position: absolute; left: 6px; top: 15px; font-size: 9px; color: #ffffff; opacity: .6; }
.pth .bet { width: 73px; height: 22px; background: #1d3b00; color: #f0f0f0; border: 1px solid #286400; font: bold 10px sans-serif; padding: 0 3px; }
.pth .bet:disabled { background: #316300; color: #6d7b5f; }
.pth input[type=range] { accent-color: #99d500; }
.pth .tabs { display: flex; gap: 2px; font: 11px sans-serif; }
.pth .tab { color: #99d500; background: #145300; border: 2px solid #286400; border-bottom: none; border-radius: 4px 4px 0 0; padding: 0 9px; cursor: pointer; height: 22px; line-height: 20px; }
.pth .tab.sel { background: #145300; }
.pth .tab:not(.sel) { margin-top: 2px; height: 20px; opacity: .85; }
.pth .pane { border: 2px solid #286400; border-radius: 2px; background: #145300; }
.pth .log { background: #1d3b00; color: #f0f0f0; font: 11px sans-serif; overflow-y: auto; padding: 2px 4px; line-height: 14px; }
.pth .log::-webkit-scrollbar { width: 12px; } .pth .log::-webkit-scrollbar-thumb { background: #176400; border: 1px solid #1b7200; }
.pth .away { font: 11px sans-serif; color: #99d500; padding: 8px; }
.pth .away label { display: block; margin: 6px 0; cursor: pointer; }
.pth .speed { font: bold 12px sans-serif; color: #99d500; }
.pth .brk { width: 80px; height: 20px; background: #145300; color: #99d500; border: 1px solid #286400; font: 12px sans-serif; cursor: pointer; }
.pth .brk:disabled { color: #486f3e; }
.pth .brk.blink { background: #6e9e00; color: #000; }
.pth .overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.45); z-index: 20; }
.pth .dialog { background: #efefef; color: #000; font: 12px sans-serif; padding: 12px; border: 1px solid #888; min-width: 240px; }
.pth .dialog .row { display: flex; justify-content: space-between; align-items: center; margin: 6px 0; gap: 10px; }
.pth .dialog input[type=number], .pth .dialog input[type=text] { width: 90px; }
.pth .dialog .buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.pth .timeout { height: 10px; width: 52px; background: #145300; border: 1px solid #286400; }
.pth .timeout > div { height: 100%; background: #99d500; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, parent: HTMLElement, x?: number, y?: number, w?: number, h?: number): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (x !== undefined) {
    e.classList.add('abs');
    e.style.left = `${x}px`;
    e.style.top = `${y}px`;
    if (w !== undefined) e.style.width = `${w}px`;
    if (h !== undefined) e.style.height = `${h}px`;
  }
  parent.appendChild(e);
  return e;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US');

/** a QTimer used single-shot: start() restarts it */
class Timer {
  private id: ReturnType<typeof setTimeout> | null = null;
  constructor(private fn: () => void, private signal: AbortSignal) {}
  start(ms: number): void {
    this.stop();
    if (this.signal.aborted) return;
    this.id = setTimeout(() => {
      this.id = null;
      if (!this.signal.aborted) this.fn();
    }, ms);
  }
  stop(): void {
    if (this.id !== null) clearTimeout(this.id);
    this.id = null;
  }
  active(): boolean {
    return this.id !== null;
  }
}

/** MyCardsPixmapLabel: a card with the original's flip (scale) and fade-out animations */
class CardLabel {
  img: HTMLImageElement;
  private anim: ReturnType<typeof setInterval> | null = null;
  isFlipside = false;
  constructor(parent: HTMLElement, x: number, y: number, private signal: AbortSignal) {
    this.img = el('img', 'card', parent, x, y, 48, 76);
    this.img.draggable = false;
    this.clear();
  }
  private stopAnim(): void {
    if (this.anim !== null) clearInterval(this.anim);
    this.anim = null;
    this.img.style.transform = '';
    this.img.style.opacity = '';
  }
  clear(): void {
    this.stopAnim();
    this.img.style.visibility = 'hidden';
    this.isFlipside = false;
  }
  set(url: string, flipside: boolean): void {
    this.stopAnim();
    this.img.src = url;
    this.img.style.visibility = 'visible';
    this.isFlipside = flipside;
  }
  /** startFlipCards(speed, front, flipside): the back shrinks to a line, then the front grows (40 ms frames) */
  flip(speed: number, frontUrl: string): void {
    this.stopAnim();
    this.isFlipside = false;
    let inc = 0.1;
    if (speed > 4 && speed <= 6) inc = 0.2;
    if (speed > 6 && speed <= 8) inc = 0.25;
    if (speed > 8 && speed <= 10) inc = 0.5;
    if (speed === 11) return this.set(frontUrl, false);
    let s1 = 1.0;
    let s2 = 0.0;
    let phase = 1;
    this.img.src = flipsideUrl();
    this.img.style.visibility = 'visible';
    this.img.style.transform = `scaleX(${s1})`;
    this.anim = setInterval(() => {
      if (this.signal.aborted) return this.stopAnim();
      if (s1 > 0.1) {
        s1 -= inc;
        this.img.style.transform = `scaleX(${Math.max(s1, 0)})`;
      } else if (phase === 1) {
        phase = 2;
        this.img.src = frontUrl;
        this.img.style.transform = 'scaleX(0)';
      } else if (s2 < 0.95) {
        s2 += inc;
        this.img.style.transform = `scaleX(${Math.min(s2, 1)})`;
      } else {
        this.stopAnim();
        this.img.src = frontUrl;
      }
    }, 40);
  }
  /** startFadeOut(speed): opacity down to 0.25 */
  fadeOut(speed: number): void {
    if (speed === 11) return;
    let step = 0.01;
    if (speed > 4 && speed <= 7) step = 0.02;
    if (speed > 7 && speed <= 10) step = 0.04;
    if (this.anim !== null) clearInterval(this.anim);
    let o = 1.0;
    this.anim = setInterval(() => {
      if (this.signal.aborted || o <= 0.25) {
        if (this.anim !== null) clearInterval(this.anim);
        this.anim = null;
        return;
      }
      o -= step;
      this.img.style.opacity = String(o);
    }, 40);
  }
}

interface SeatWidgets {
  box: HTMLDivElement;
  avatar: HTMLImageElement;
  name: HTMLDivElement;
  cash: HTMLDivElement;
  set: HTMLDivElement;
  button: HTMLImageElement;
  cards: [CardLabel, CardLabel];
  action: HTMLImageElement;
  timeout: HTMLDivElement;
}

export interface TableOptions {
  host: HTMLElement;
  signal: AbortSignal;
  sound: Sound;
  title: string;
  /** game speed 1..11 (GameSpeed) */
  speed: number;
}

export class GameTable implements GuiInterface {
  game!: Game;
  driver!: TableDriver;
  /** online: the table turns so that this screen's player sits at the bottom (position 0), as in the original */
  seatOffset = 0;
  playerCount = MAX_NUMBER_OF_PLAYERS;
  /** online: called when it is this screen's player's turn (the action comes back through the server) */
  onMyTurn: ((hand: LocalHand, p: LocalPlayer) => void) | null = null;
  root: HTMLDivElement;
  private seats: SeatWidgets[] = [];
  private board: CardLabel[] = [];
  private potLabel: HTMLDivElement;
  private totalValue: HTMLDivElement;
  private setsValue: HTMLDivElement;
  private handLabel: HTMLDivElement;
  private gameNumber: HTMLDivElement;
  private handNumber: HTMLDivElement;
  private btnBetRaise: HTMLButtonElement;
  private btnCallCheck: HTMLButtonElement;
  private btnFold: HTMLButtonElement;
  private btnAllIn: HTMLButtonElement;
  private betInput: HTMLInputElement;
  private slider: HTMLInputElement;
  private log: HTMLDivElement;
  private speedValue: HTMLDivElement;
  private speedSlider: HTMLInputElement;
  private breakButton: HTMLButtonElement;
  private signal: AbortSignal;
  private sound: Sound;
  private myActionIsRaise = false;
  private myActionIsBet = false;
  /** pre-actions: the buttons are checkable while it is not the player's turn */
  private checkable = false;
  private checked: 'betraise' | 'callcheck' | 'fold' | 'allin' | null = null;
  /** 0 manual, 1 auto check/call all, 2 auto check/fold all */
  private playingMode = 0;
  private flipHolecardsAllInAlreadyDone = false;
  private breakAfterCurrentHand = false;
  currentGameOver = false;
  private distributePotAnimCounter = 0;
  private guiGameSpeed: number;
  private gameSpeed = 0;
  private dealCardsSpeed = 0;
  private preDealCardsSpeed = 0;
  private postDealCardsSpeed = 0;
  private AllInDealCardsSpeed = 0;
  private postRiverRunAnimationSpeed = 0;
  private winnerBlinkSpeed = 0;
  private newRoundSpeed = 0;
  private nextPlayerSpeed1 = 0;
  private nextPlayerSpeed2 = 0;
  private nextPlayerSpeed3 = 0;
  private preflopNextPlayerSpeed = 0;
  private timers: Record<string, Timer> = {};
  private blinkTimer: ReturnType<typeof setInterval> | null = null;
  private timeoutAnim: ReturnType<typeof setInterval> | null = null;

  constructor(opts: TableOptions) {
    this.signal = opts.signal;
    this.sound = opts.sound;
    this.guiGameSpeed = opts.speed;
    const style = document.createElement('style');
    style.textContent = css;
    opts.host.appendChild(style);
    const root = (this.root = el('div', 'pth', opts.host));
    root.tabIndex = -1;

    // seats (groupBox0..9)
    for (let i = 0; i < MAX_NUMBER_OF_PLAYERS; i++) {
      const [x, y] = SEAT_POS[i];
      const box = el('div', 'seat', root, x, y, 190, 142);
      const t = TOP[i];
      const avatar = el('img', '', box, 13, t ? 13 : 79, 50, 50);
      avatar.draggable = false;
      const name = el('div', 'name', box, 70, t ? 11 : 117, 104, 14);
      const cash = el('div', 'cash', box, 70, t ? 25 : 104, 104, 14);
      const set = el('div', 'set', box, 70, t ? 119 : 10, 104, 14);
      const button = el('img', '', box, 18, t ? 88 : 16, 40, 42);
      button.draggable = false;
      const cards: [CardLabel, CardLabel] = [new CardLabel(box, 86, t ? 39 : 26, this.signal), new CardLabel(box, 110, t ? 39 : 26, this.signal)];
      const action = el('img', '', box, 67, t ? 56 : 43, 111, 40);
      action.style.objectFit = 'none';
      action.draggable = false;
      const timeout = el('div', 'timeout', box, 12, t ? 75 : 64, 52, 10);
      timeout.style.display = 'none';
      el('div', '', timeout);
      this.seats.push({ box, avatar, name, cash, set, button, cards, action, timeout });
    }
    // the board: card holders and cards
    const holders = ['cardholder_flop', 'cardholder_flop', 'cardholder_flop', 'cardholder_turn', 'cardholder_river'];
    for (let i = 0; i < 5; i++) {
      const h = el('img', '', root, 389 + 55 * i, 175, 54, 82);
      h.src = tableUrl(holders[i]);
      h.draggable = false;
      this.board.push(new CardLabel(root, 392 + 55 * i, 178, this.signal));
    }
    this.potLabel = el('div', 'board-big', root, 212, 176, 144, 39);
    this.potLabel.style.lineHeight = '39px';
    this.potLabel.textContent = 'Pot';
    const total = el('div', 'board-small', root, 212, 215, 74, 19);
    total.textContent = 'Total:';
    total.style.textAlign = 'right';
    this.totalValue = el('div', 'board-small', root, 292, 215, 90, 19);
    const sets = el('div', 'board-small', root, 212, 236, 74, 18);
    sets.textContent = 'Bets:';
    sets.style.textAlign = 'right';
    this.setsValue = el('div', 'board-small', root, 292, 236, 90, 18);
    this.handLabel = el('div', 'board-big', root, 670, 176, 142, 39);
    this.handLabel.style.lineHeight = '39px';
    const g = el('div', 'board-small', root, 670, 215, 70, 19);
    g.textContent = 'Game:';
    g.style.textAlign = 'right';
    this.gameNumber = el('div', 'board-small', root, 746, 215, 69, 19);
    const hn = el('div', 'board-small', root, 670, 236, 70, 18);
    hn.textContent = 'Hand:';
    hn.style.textAlign = 'right';
    this.handNumber = el('div', 'board-small', root, 746, 236, 69, 18);

    // the human player's controls
    this.betInput = el('input', 'bet', root, 428, 418, 73, 22);
    this.betInput.type = 'number';
    this.betInput.disabled = true;
    const mk = (y: number, x: number, w: number, h: number, img: string, fkey: string) => {
      const b = el('button', 'abtn', root, x, y, w, h);
      b.style.backgroundImage = `url("${tableUrl(img)}")`;
      b.dataset.img = img;
      const f = el('span', 'fkey', b);
      f.textContent = fkey;
      el('span', 'txt', b);
      return b;
    };
    this.btnAllIn = mk(417, 501, 95, 25, 'playeraction_orange', 'F4');
    this.btnAllIn.style.backgroundSize = '95px 25px';
    (this.btnAllIn.querySelector('.fkey') as HTMLElement).style.top = '6px';
    this.slider = el('input', '', root, 428, 443, 168, 15);
    this.slider.type = 'range';
    this.slider.min = this.slider.max = this.slider.value = '0';
    this.slider.disabled = true;
    this.btnBetRaise = mk(459, 428, 168, 43, 'playeraction_green', 'F3');
    this.btnCallCheck = mk(503, 428, 168, 43, 'playeraction_blue', 'F2');
    this.btnFold = mk(547, 428, 168, 43, 'playeraction_red', 'F1');

    // left tool box: the hand ranking
    const lbox = el('div', '', root, 2, 409, 260, 188);
    lbox.style.background = `url("${tableUrl('toolboxbg')}") no-repeat`;
    const ltabs = el('div', 'tabs', root, 11, 413);
    const lt = el('div', 'tab sel', ltabs);
    lt.textContent = 'Hands';
    const lpane = el('div', 'pane', root, 8, 435, 248, 156);
    const hr = el('img', '', lpane, 2, 0, 240, 153);
    hr.src = tableUrl('handranking');
    hr.draggable = false;

    // right tool box: log and away
    const rbox = el('div', '', root, 762, 388, 260, 190);
    rbox.style.background = `url("${tableUrl('toolboxbg')}") no-repeat`;
    const rtabs = el('div', 'tabs', root, 771, 413);
    const rpane = el('div', 'pane', root, 766, 435, 252, 136);
    this.log = el('div', 'log', rpane, 0, 0, 248, 132);
    const away = el('div', 'away', rpane, 0, 0, 248, 132);
    away.style.display = 'none';
    const modes: [string, number][] = [['Manual action (F6)', 0], ['Auto check / fold all (F7)', 2], ['Auto check / call any (F8)', 1]];
    for (const [label, mode] of modes) {
      const l = el('label', '', away);
      const r = el('input', '', l);
      r.type = 'radio';
      r.name = 'pth-mode';
      r.checked = mode === 0;
      r.dataset.mode = String(mode);
      r.addEventListener('change', () => (this.playingMode = mode), { signal: this.signal });
      l.append(' ' + label);
    }
    for (const [name, pane] of [['Log', this.log], ['Away', away]] as const) {
      const t = el('div', 'tab' + (name === 'Log' ? ' sel' : ''), rtabs);
      t.textContent = name;
      t.addEventListener('click', () => {
        for (const c of Array.from(rtabs.children)) c.classList.remove('sel');
        t.classList.add('sel');
        this.log.style.display = pane === this.log ? '' : 'none';
        away.style.display = pane === away ? '' : 'none';
      }, { signal: this.signal });
    }
    const sp = el('div', 'speed', root, 766, 573, 45, 20);
    sp.textContent = 'Speed:';
    sp.style.lineHeight = '20px';
    this.speedValue = el('div', 'speed', root, 811, 573, 22, 20);
    this.speedValue.style.lineHeight = '20px';
    this.speedSlider = el('input', '', root, 835, 573, 97, 20);
    this.speedSlider.type = 'range';
    this.speedSlider.min = '1';
    this.speedSlider.max = '11';
    this.speedSlider.addEventListener('input', () => {
      this.guiGameSpeed = Number(this.speedSlider.value);
      this.speedValue.textContent = String(this.guiGameSpeed);
      this.setSpeeds();
    }, { signal: this.signal });
    this.breakButton = el('button', 'brk', root, 938, 573, 80, 20);
    this.breakButton.textContent = 'Stop';
    this.breakButton.addEventListener('click', () => this.breakButtonClicked(), { signal: this.signal });

    // menu bar
    const menu = el('div', 'menu', root, 0, 0, W, 21);
    const m = el('div', '', menu);
    m.textContent = 'PokerTH';
    const drop = el('div', 'drop', m);
    this.menuItem(drop, 'New Game ... (Ctrl+N)', () => this.driver.newGame());
    this.menuItem(drop, 'Back to the start window', () => this.driver.leave());
    m.addEventListener('click', (e) => {
      e.stopPropagation();
      m.classList.toggle('open');
    }, { signal: this.signal });
    root.addEventListener('click', () => m.classList.remove('open'), { signal: this.signal });

    this.initButtons();
    this.makeTimers();
    this.setSpeeds();
    this.speedSlider.value = String(this.guiGameSpeed);
    this.speedValue.textContent = String(this.guiGameSpeed);
    this.clearMyButtons();
  }

  private menuItem(drop: HTMLElement, text: string, fn: () => void): void {
    const d = el('div', '', drop);
    d.textContent = text;
    d.addEventListener('click', fn, { signal: this.signal });
  }

  /** scale the 1024x600 surface into `w`x`h`, keeping its aspect */
  fit(w: number, h: number): void {
    const s = Math.min(w / W, h / H);
    this.root.style.transform = `translate(${(w - W * s) / 2}px, ${(h - H * s) / 2}px) scale(${s})`;
  }

  setOnline(online: boolean): void {
    this.breakButton.style.display = online ? 'none' : '';
    this.speedSlider.disabled = false;
  }

  // ---- timers (gametableimpl.cpp's constructor: connect(...Timer, SIGNAL(timeout()), ...))
  private makeTimers(): void {
    const t = (name: string, fn: () => void) => (this.timers[name] = new Timer(fn, this.signal));
    const hand = () => this.game.getCurrentHand();
    t('dealFlopCards0', () => this.dealFlopCards(1));
    t('dealFlopCards1', () => this.dealFlopCards(2));
    t('dealFlopCards2', () => this.dealFlopCards(3));
    t('dealFlopCards3', () => this.dealFlopCards(4));
    t('dealFlopCards4', () => this.dealFlopCards(5));
    t('dealFlopCards5', () => this.dealFlopCards(6));
    t('dealFlopCards6', () => this.handSwitchRounds());
    t('dealTurnCards0', () => this.dealTurnCards(1));
    t('dealTurnCards1', () => this.dealTurnCards(2));
    t('dealTurnCards2', () => this.handSwitchRounds());
    t('dealRiverCards0', () => this.dealRiverCards(1));
    t('dealRiverCards1', () => this.dealRiverCards(2));
    t('dealRiverCards2', () => this.handSwitchRounds());
    t('nextPlayerAnimation', () => this.handSwitchRounds());
    t('beRoAnimation1', () => hand().getCurrentBeRo().run());
    t('beRoAnimation2', () => {
      const h = hand();
      const p = h.getRunningPlayerList()[h.getRunningPlayerIt(h.getCurrentBeRo().getCurrentPlayersTurnId())];
      this.driver.otherPlayersTurn(h, p);
    });
    t('postRiverAnimation1', () => this.driver.holeCards(hand(), () => hand().getCurrentBeRo().postRiverRun()));
    t('postRiverRunAnimation1', () => this.postRiverRunAnimation2());
    t('postRiverRunAnimation2', () => this.postRiverRunAnimation3());
    t('postRiverRunAnimation3', () => this.postRiverRunAnimation4());
    t('potDistribute', () => this.postRiverRunAnimation5());
    t('postRiverRunAnimation5', () => this.postRiverRunAnimation6());
    t('postRiverRunAnimation6', () => this.driver.nextHand());
  }

  stopTimer(): void {
    for (const t of Object.values(this.timers)) t.stop();
    this.stopBlink();
  }

  /** gameTableImpl::setSpeeds */
  setSpeeds(): void {
    this.gameSpeed = (11 - this.guiGameSpeed) * 10;
    this.dealCardsSpeed = Math.trunc(this.gameSpeed / 2) * 10;
    this.preDealCardsSpeed = this.dealCardsSpeed * 2;
    this.postDealCardsSpeed = this.dealCardsSpeed * 3;
    this.AllInDealCardsSpeed = this.dealCardsSpeed * 4;
    this.postRiverRunAnimationSpeed = this.gameSpeed * 18;
    this.winnerBlinkSpeed = this.gameSpeed * 3;
    this.newRoundSpeed = this.gameSpeed * 35;
    this.nextPlayerSpeed1 = this.gameSpeed * 10;
    this.nextPlayerSpeed2 = this.gameSpeed * 4;
    this.nextPlayerSpeed3 = this.gameSpeed * 7;
    this.preflopNextPlayerSpeed = this.gameSpeed * 10;
  }

  // ---- GuiInterface: refresh
  refreshSet(): void {
    for (const p of this.game.getSeatsList()) {
      this.seat(p.getMyID()).set.textContent = p.getMySet() === 0 ? '' : fmt(p.getMySet());
    }
  }

  refreshButton(): void {
    const apl = this.game.getActivePlayerList();
    for (const p of this.game.getSeatsList()) {
      const b = this.seat(p.getMyID()).button;
      let img = '';
      if (p.getMyActiveStatus()) {
        if (apl.length > 2) {
          if (p.getMyButton() === 1) img = 'dealerPuck';
          else if (p.getMyButton() === 2) img = 'smallblindPuck';
          else if (p.getMyButton() === 3) img = 'bigblindPuck';
        } else {
          if (p.getMyButton() === 2) img = 'dealerPuck';
          else if (p.getMyButton() === 3) img = 'bigblindPuck';
        }
      }
      if (img) {
        b.src = tableUrl(img);
        b.style.visibility = 'visible';
      } else {
        b.style.visibility = 'hidden';
      }
    }
  }

  /** getCurrentSeatState: active, or (network) stays on the table, or cleared */
  private seatState(p: LocalPlayer): 'active' | 'stay' | 'clear' {
    if (p.getMyActiveStatus()) return 'active';
    if (p.getMyStayOnTableStatus() && this.driver.online) return 'stay';
    return 'clear';
  }

  refreshPlayerName(): void {
    for (const p of this.game.getSeatsList()) {
      const s = this.seat(p.getMyID());
      const st = this.seatState(p);
      s.name.textContent = st === 'clear' ? '' : p.getMyName();
      s.name.style.opacity = st === 'stay' ? '0.5' : '';
    }
  }

  refreshPlayerAvatar(): void {
    for (const p of this.game.getSeatsList()) {
      const s = this.seat(p.getMyID());
      const st = this.seatState(p);
      if (st === 'clear') {
        s.avatar.style.visibility = 'hidden';
      } else {
        s.avatar.src = tableUrl('genereticAvatar');
        s.avatar.style.visibility = 'visible';
        s.avatar.style.opacity = st === 'stay' ? '0.5' : '';
      }
    }
  }

  refreshAction(playerID = -1, playerAction = -1): void {
    const ACTIONS = ['', 'fold', 'check', 'call', 'bet', 'raise', 'allin'];
    if (playerID === -1 || playerAction === -1) {
      for (const p of this.game.getSeatsList()) {
        const s = this.seat(p.getMyID());
        this.setActionPic(s, p.getMyAction());
        if (p.getMyAction() === 1 && p.getMyID() !== 0) {
          s.cards[0].clear();
          s.cards[1].clear();
        }
      }
    } else {
      const s = this.seat(playerID);
      if (playerAction === 0) {
        this.setActionPic(s, 0);
      } else {
        this.setActionPic(s, playerAction);
        this.sound.playSound(ACTIONS[playerAction], this.pos(playerID));
      }
      if (playerAction === 1) {
        // FOLD
        if (playerID === this.myId()) {
          s.cards[0].fadeOut(10);
          s.cards[1].fadeOut(10);
        } else {
          s.cards[0].clear();
          s.cards[1].clear();
        }
      }
    }
  }

  private setActionPic(s: SeatWidgets, action: number): void {
    const ACTIONS = ['', 'fold', 'check', 'call', 'bet', 'raise', 'allin', 'winner'];
    if (action === 0) {
      s.action.style.visibility = 'hidden';
    } else {
      s.action.src = miscUrl(`action_${ACTIONS[action]}`);
      s.action.style.visibility = 'visible';
    }
  }

  refreshCash(): void {
    for (const p of this.game.getSeatsList()) {
      this.seat(p.getMyID()).cash.textContent = this.seatState(p) === 'active' ? fmt(p.getMyCash()) : '';
    }
  }

  refreshGroupbox(playerID = -1, status = -1): void {
    const active = (id: number, on: boolean) => {
      this.seat(id).box.style.backgroundImage = `url("${tableUrl(on ? 'playerSeatActive' : 'playerSeatInactive')}")`;
    };
    if (playerID === -1 || status === -1) {
      for (const p of this.game.getSeatsList()) active(p.getMyID(), p.getMyTurn());
    } else {
      active(playerID, status === 2);
    }
  }

  refreshGameLabels(gameState: GameState): void {
    this.handLabel.textContent = ['Preflop', 'Flop', 'Turn', 'River', ''][gameState] ?? '!!! ERROR !!!';
    this.handNumber.textContent = String(this.game.getCurrentHand().getMyID());
    this.gameNumber.textContent = String(this.game.getMyGameID());
  }

  refreshAll(): void {
    this.refreshSet();
    this.refreshButton();
    for (const p of this.game.getSeatsList()) this.refreshAction(p.getMyID(), p.getMyAction());
    this.refreshCash();
    this.refreshGroupbox();
    this.refreshPlayerName();
    this.refreshPlayerAvatar();
  }

  refreshPot(): void {
    const b = this.game.getCurrentHand().getBoard();
    this.setsValue.textContent = fmt(b.getSets());
    this.totalValue.textContent = fmt(b.getPot());
  }

  // ---- GuiInterface: dealing
  /** the table position of a player (myID) */
  pos(id: number): number {
    return (id - this.seatOffset + this.playerCount) % this.playerCount;
  }

  private seat(id: number): SeatWidgets {
    return this.seats[id < this.playerCount ? this.pos(id) : id];
  }

  private myId(): number {
    return this.game.getCurrentHand().humanUniqueId();
  }

  dealHoleCards(): void {
    for (const p of this.game.getSeatsList()) {
      const s = this.seat(p.getMyID());
      const c = [0, 0];
      p.getMyCards(c);
      for (let j = 0; j < 2; j++) {
        if (p.getMyActiveStatus()) {
          if (p.getMyUniqueID() === this.myId() && c[j] >= 0) s.cards[j].set(cardUrl(c[j]), false);
          else s.cards[j].set(flipsideUrl(), true);
        } else {
          s.cards[j].clear();
        }
      }
    }
    this.sound.playSound('dealtwocards', 0);
  }

  dealBeRoCards(myBeRoID: number): void {
    this.uncheckMyButtons();
    this.checkable = false;
    this.clearMyButtons();
    this.slider.disabled = true;
    this.betInput.disabled = true;
    if (myBeRoID === GAME_STATE_FLOP) this.timers.dealFlopCards0.start(this.preDealCardsSpeed);
    else if (myBeRoID === GAME_STATE_TURN) this.timers.dealTurnCards0.start(this.preDealCardsSpeed);
    else if (myBeRoID === GAME_STATE_RIVER) this.timers.dealRiverCards0.start(this.preDealCardsSpeed);
  }

  private boardCard(i: number): void {
    const b = [0, 0, 0, 0, 0];
    this.game.getCurrentHand().getBoard().getMyCards(b);
    this.board[i].flip(this.guiGameSpeed, cardUrl(b[i]));
  }

  /** after the last card of a round: the all-in pace, or the player's pre-action buttons */
  private afterBoardCard(next: Timer): void {
    if (this.game.getCurrentHand().getAllInCondition()) {
      next.start(this.AllInDealCardsSpeed);
    } else {
      this.updateMyButtonsState(0);
      next.start(this.postDealCardsSpeed);
    }
  }

  /** dealFlopCards1..6 */
  private dealFlopCards(step: number): void {
    const t = this.timers;
    const hand = this.game.getCurrentHand();
    switch (step) {
      case 1: case 2: case 3:
        this.board[step - 1].set(flipsideUrl(), true);
        t[`dealFlopCards${step}`].start(this.dealCardsSpeed);
        break;
      case 4:
        this.driver.boardCards(hand, GAME_STATE_FLOP, () => {
          this.boardCard(0);
          t.dealFlopCards4.start(this.dealCardsSpeed);
        });
        break;
      case 5:
        this.boardCard(1);
        t.dealFlopCards5.start(this.dealCardsSpeed);
        break;
      case 6:
        this.boardCard(2);
        this.afterBoardCard(t.dealFlopCards6);
        break;
    }
  }

  private dealTurnCards(step: number): void {
    const hand = this.game.getCurrentHand();
    if (step === 1) {
      this.board[3].set(flipsideUrl(), true);
      this.timers.dealTurnCards1.start(this.dealCardsSpeed);
    } else {
      this.driver.boardCards(hand, GAME_STATE_TURN, () => {
        this.boardCard(3);
        this.afterBoardCard(this.timers.dealTurnCards2);
      });
    }
  }

  private dealRiverCards(step: number): void {
    const hand = this.game.getCurrentHand();
    if (step === 1) {
      this.board[4].set(flipsideUrl(), true);
      this.timers.dealRiverCards1.start(this.dealCardsSpeed);
    } else {
      this.driver.boardCards(hand, GAME_STATE_RIVER, () => {
        this.boardCard(4);
        this.afterBoardCard(this.timers.dealRiverCards2);
      });
    }
  }

  // ---- GuiInterface: the flow
  nextPlayerAnimation(): void {
    const hand = this.game.getCurrentHand();
    this.refreshSet();
    if (hand.getPreviousPlayerID() !== -1) {
      const p = hand.getSeatsList().find((x) => x.getMyID() === hand.getPreviousPlayerID());
      if (p) this.refreshAction(hand.getPreviousPlayerID(), p.getMyAction());
    }
    this.refreshCash();
    this.updateMyButtonsState();
    this.timers.nextPlayerAnimation.start(this.nextPlayerSpeed1);
  }

  private handSwitchRounds(): void {
    this.game.getCurrentHand().switchRounds();
  }

  beRoAnimation2(myBeRoID: number): void {
    this.timers.beRoAnimation2.start(myBeRoID === 0 ? this.preflopNextPlayerSpeed : this.nextPlayerSpeed3);
  }

  preflopAnimation1(): void { this.timers.beRoAnimation1.start(this.nextPlayerSpeed2); }
  flopAnimation1(): void { this.timers.beRoAnimation1.start(this.nextPlayerSpeed2); }
  turnAnimation1(): void { this.timers.beRoAnimation1.start(this.nextPlayerSpeed2); }
  riverAnimation1(): void { this.timers.beRoAnimation1.start(this.nextPlayerSpeed2); }
  postRiverAnimation1(): void { this.timers.postRiverAnimation1.start(this.nextPlayerSpeed2); }
  postRiverRunAnimation1(): void { this.timers.postRiverRunAnimation1.start(this.postRiverRunAnimationSpeed); }

  private postRiverRunAnimation2(): void {
    this.uncheckMyButtons();
    this.checkable = false;
    this.clearMyButtons();
    this.slider.disabled = true;
    this.betInput.disabled = true;
    const hand = this.game.getCurrentHand();
    const apl = hand.getActivePlayerList();
    const nonfold = apl.filter((p) => p.getMyAction() !== PLAYER_ACTION_FOLD).length;
    if (nonfold !== 1) {
      if (!this.flipHolecardsAllInAlreadyDone) {
        for (const p of apl) {
          if (p.getMyAction() !== PLAYER_ACTION_FOLD && p.checkIfINeedToShowCards()) this.showHoleCards(p.getMyUniqueID());
        }
        this.flipHolecardsAllInAlreadyDone = true;
      } else {
        for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) p.setMyCardsFlip(true, 3);
      }
      this.timers.postRiverRunAnimation2.start(this.postRiverRunAnimationSpeed);
    } else {
      this.postRiverRunAnimation3();
    }
  }

  private postRiverRunAnimation3(): void {
    const hand = this.game.getCurrentHand();
    const apl = hand.getActivePlayerList();
    const nonfold = apl.filter((p) => p.getMyAction() !== PLAYER_ACTION_FOLD).length;
    const winners = hand.getBoard().getWinners();
    const highest = hand.getCurrentBeRo().getHighestCardsValue();
    for (const p of apl) {
      const s = this.seat(p.getMyID());
      if (p.getMyAction() !== PLAYER_ACTION_FOLD && p.getMyCardsValueInt() === highest) {
        this.setActionPic(s, 7);
        if (nonfold !== 1) {
          const pos = [0, 0, 0, 0, 0];
          p.getMyBestHandPosition(pos);
          // fade out the cards that are not part of the best hand
          for (let idx = 0; idx < 7; idx++) {
            if (!pos.includes(idx)) {
              if (idx < 2) s.cards[idx].fadeOut(this.guiGameSpeed);
              else this.board[idx - 2].fadeOut(this.guiGameSpeed);
            }
          }
        }
        this.logLine(`${esc(p.getMyName())} wins ${fmt(p.getLastMoneyWon())}`, '#ffff00');
      } else if (apl.length !== 1 && p.getMyAction() !== PLAYER_ACTION_FOLD) {
        s.cards[0].fadeOut(this.guiGameSpeed);
        s.cards[1].fadeOut(this.guiGameSpeed);
      }
    }
    for (const p of apl) {
      if (p.getMyAction() !== PLAYER_ACTION_FOLD && p.getMyCardsValueInt() !== highest && winners.includes(p.getMyUniqueID())) {
        this.logLine(`${esc(p.getMyName())} wins ${fmt(p.getLastMoneyWon())} (side pot)`, '#ffffcc');
      }
    }
    for (const p of apl) {
      if (p.getMyCash() === 0) this.logLine(`<i>${esc(p.getMyName())} sits out</i>`, '#ff6633');
    }
    this.timers.postRiverRunAnimation3.start(Math.trunc(this.postRiverRunAnimationSpeed / 2));
  }

  private postRiverRunAnimation4(): void {
    this.distributePotAnimCounter = 0;
    this.blinkWinners();
  }

  private blinkWinners(): void {
    this.timers.potDistribute.start(this.winnerBlinkSpeed);
  }

  private postRiverRunAnimation5(): void {
    const hand = this.game.getCurrentHand();
    const highest = hand.getCurrentBeRo().getHighestCardsValue();
    const winners = hand.getActivePlayerList().filter((p) => p.getMyAction() !== PLAYER_ACTION_FOLD && p.getMyCardsValueInt() === highest);
    if (this.distributePotAnimCounter < 10) {
      const hide = this.distributePotAnimCounter % 2 === 0;
      this.potLabel.textContent = hide ? '' : 'Pot';
      for (const p of winners) this.seat(p.getMyID()).name.style.visibility = hide ? 'hidden' : '';
      this.distributePotAnimCounter++;
      this.blinkWinners();
    } else {
      this.timers.postRiverRunAnimation5.start(this.gameSpeed);
    }
  }

  private postRiverRunAnimation6(): void {
    for (const s of this.seats) s.name.style.visibility = '';
    this.potLabel.textContent = 'Pot';
    this.refreshCash();
    this.refreshPot();
    const apl = this.game.getCurrentHand().getActivePlayerList();
    const positive = apl.filter((p) => p.getMyCash() > 0);
    if (positive.length === 1) {
      this.logLine(`<i><b>${esc(positive[0].getMyName())} wins game ${this.game.getMyGameID()}!</b></i><br>`);
      if (!this.driver.online) {
        this.currentGameOver = true;
        this.breakButton.disabled = false;
        this.breakButton.textContent = 'Start';
        this.startBlink();
      } else {
        this.driver.nextHand();
      }
      return;
    }
    this.timers.postRiverRunAnimation6.start(this.newRoundSpeed);
  }

  /** gameTableImpl::startNewHand (local) */
  startNewHand(): void {
    if (!this.breakAfterCurrentHand) {
      this.game.initHand();
      this.game.startHand();
    } else {
      this.breakButton.disabled = false;
      this.breakButton.textContent = 'Start';
      this.breakAfterCurrentHand = false;
      this.startBlink();
    }
  }

  private breakButtonClicked(): void {
    if (this.breakButton.textContent === 'Stop') {
      this.breakButton.disabled = true;
      this.breakAfterCurrentHand = true;
    } else if (this.breakButton.textContent === 'Start') {
      this.stopBlink();
      this.breakButton.textContent = 'Stop';
      if (this.currentGameOver) {
        this.sound.newGameStarts();
        this.currentGameOver = false;
        this.driver.newGame();
      } else {
        this.startNewHand();
      }
    }
  }

  private startBlink(): void {
    this.stopBlink();
    this.blinkTimer = setInterval(() => this.breakButton.classList.toggle('blink'), 500);
    this.signal.addEventListener('abort', () => this.stopBlink(), { once: true });
  }

  private stopBlink(): void {
    if (this.blinkTimer !== null) clearInterval(this.blinkTimer);
    this.blinkTimer = null;
    this.breakButton.classList.remove('blink');
  }

  private showHoleCards(playerId: number, allIn = false): void {
    const hand = this.game.getCurrentHand();
    for (const p of hand.getActivePlayerList()) {
      if (p.getMyUniqueID() === playerId) {
        const c = [0, 0];
        p.getMyCards(c);
        for (let j = 0; j < 2; j++) if (c[j] >= 0) this.seat(p.getMyID()).cards[j].flip(this.guiGameSpeed, cardUrl(c[j]));
        if (hand.getCurrentRound() < GAME_STATE_RIVER || allIn) p.setMyCardsFlip(true, 2);
        else p.setMyCardsFlip(true, 1);
      }
    }
  }

  flipHolecardsAllIn(): void {
    const hand = this.game.getCurrentHand();
    if (!this.flipHolecardsAllInAlreadyDone && hand.getCurrentRound() < GAME_STATE_RIVER) {
      this.flipHolecardsAllInAlreadyDone = true;
      this.driver.holeCards(hand, () => {
        const apl = hand.getActivePlayerList();
        const nonfold = apl.filter((p) => p.getMyAction() !== PLAYER_ACTION_FOLD).length;
        if (nonfold !== 1) {
          for (const p of apl) if (p.getMyAction() !== PLAYER_ACTION_FOLD) this.showHoleCards(p.getMyUniqueID());
        }
      });
    }
  }

  /** everyone's cash at the start of each hand (for the end-to-end test) */
  history: string[] = [];

  nextRoundCleanGui(): void {
    this.history.push(`${this.game.getCurrentHandID()} ${this.game.getSeatsList().filter((p) => p.getMyName()).map((p) => `${p.getMyName()}:${p.getMyCash() + p.getMySet()}`).join(' ')}`);
    for (const b of this.board) b.clear();
    for (const s of this.seats) {
      s.timeout.style.display = 'none';
      s.cards[0].clear();
      s.cards[1].clear();
    }
    this.stopTimeoutAnimation();
    this.disableMyButtons();
    this.handLabel.textContent = '';
    this.refreshAll();
    this.flipHolecardsAllInAlreadyDone = false;
    this.breakButton.disabled = false;
    this.breakAfterCurrentHand = false;
    this.stopBlink();
    this.breakButton.textContent = 'Stop';
    this.slider.disabled = true;
    this.betInput.disabled = true;
    this.uncheckMyButtons();
    this.checkable = false;
    this.clearMyButtons();
  }

  // ---- the human player's buttons
  private initButtons(): void {
    const on = (b: HTMLButtonElement, which: 'betraise' | 'callcheck' | 'fold' | 'allin') =>
      b.addEventListener('click', () => this.pushButtonClicked(which), { signal: this.signal });
    on(this.btnBetRaise, 'betraise');
    on(this.btnCallCheck, 'callcheck');
    on(this.btnFold, 'fold');
    on(this.btnAllIn, 'allin');
    this.slider.addEventListener('input', () => this.changeSpinBoxBetValue(Number(this.slider.value)), { signal: this.signal });
    this.betInput.addEventListener('input', () => this.spinBoxBetValueChanged(Number(this.betInput.value)), { signal: this.signal });
    this.betInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.pushButtonClicked('betraise');
    }, { signal: this.signal });
    this.root.ownerDocument.addEventListener('keydown', (e) => {
      const map: Record<string, () => void> = {
        F1: () => this.pushButtonClicked('fold'),
        F2: () => this.pushButtonClicked('callcheck'),
        F3: () => this.pushButtonClicked('betraise'),
        F4: () => this.pushButtonClicked('allin'),
        F6: () => this.setMode(0),
        F7: () => this.setMode(2),
        F8: () => this.setMode(1),
      };
      if (map[e.key]) {
        e.preventDefault();
        map[e.key]();
      } else if (e.key === 'Shift' && !this.driver.online) {
        this.breakButtonClicked();
      } else if ((e.key === 'n' || e.key === 'N') && e.ctrlKey) {
        e.preventDefault();
        this.driver.newGame();
      }
    }, { signal: this.signal });
  }

  private setMode(mode: number): void {
    this.playingMode = mode;
    const r = this.root.querySelector(`input[data-mode="${mode}"]`) as HTMLInputElement | null;
    if (r) r.checked = true;
  }

  private text(b: HTMLButtonElement): string {
    return (b.querySelector('.txt') as HTMLElement).textContent ?? '';
  }

  private setText(b: HTMLButtonElement, t: string): void {
    (b.querySelector('.txt') as HTMLElement).textContent = t;
    (b.querySelector('.fkey') as HTMLElement).style.display = t ? '' : 'none';
    b.style.cursor = t ? 'pointer' : 'default';
  }

  private styleButtons(): void {
    const set = (b: HTMLButtonElement, which: string, textColor: string, checkColor: string) => {
      const img = b.dataset.img!;
      b.style.backgroundImage = `url("${tableUrl(this.checked === which ? `${img}_checked` : img)}")`;
      b.style.color = this.checkable ? checkColor : textColor;
    };
    set(this.btnBetRaise, 'betraise', '#f0f0f0', '#87ff97');
    set(this.btnCallCheck, 'callcheck', '#f0f0f0', '#87cdff');
    set(this.btnFold, 'fold', '#f0f0f0', '#ff8787');
    set(this.btnAllIn, 'allin', '#f0f0f0', '#ffe187');
  }

  private clearMyButtons(): void {
    for (const b of [this.btnBetRaise, this.btnCallCheck, this.btnFold, this.btnAllIn]) this.setText(b, '');
    this.styleButtons();
  }

  private uncheckMyButtons(): void {
    this.checked = null;
    this.styleButtons();
  }

  private disableMyButtons(): void {
    this.clearMyButtons();
    this.slider.disabled = true;
    this.betInput.disabled = true;
    this.betInput.value = '';
    this.slider.value = '0';
  }

  /** gameTableImpl::updateMyButtonsState: the pre-action buttons while others act */
  private updateMyButtonsState(mode = -1): void {
    const hand = this.game.getCurrentHand();
    const me = hand.getSeatsList().find((p) => p.getMyUniqueID() === this.myId());
    if (!me || !me.getMyActiveStatus()) return this.clearMyButtons();
    if (hand.getPreviousPlayerID() === me.getMyID()) {
      this.checkable = false;
      this.clearMyButtons();
    } else if (me.getMyAction() !== PLAYER_ACTION_ALLIN) {
      this.checkable = true;
      this.provideMyActions(mode);
    }
  }

  /** gameTableImpl::provideMyActions(mode): the buttons' texts */
  private provideMyActions(mode = -1): void {
    const hand = this.game.getCurrentHand();
    const me = hand.getSeatsList().find((p) => p.getMyUniqueID() === this.myId())!;
    const bero = hand.getCurrentBeRo();
    const lastCallCheck = this.text(this.btnCallCheck);
    if (
      (mode !== 0 && (me.getMyAction() === PLAYER_ACTION_ALLIN || me.getMyAction() === PLAYER_ACTION_FOLD ||
        (me.getMySet() === bero.getHighestSet() && me.getMyAction() !== PLAYER_ACTION_NONE)))
    ) {
      this.clearMyButtons();
      this.slider.disabled = true;
      this.betInput.disabled = true;
      this.checkable = false;
      return;
    }
    this.slider.disabled = false;
    this.betInput.disabled = false;
    const a = provideMyActions(hand, me);
    let fold = 'Fold';
    let callCheck = a.callCheck === 'check' ? 'Check' : a.callCheck === 'call' ? `Call\n${fmt(a.callAmount)}` : '';
    let betRaise = a.betRaise ? `${a.betRaise === 'raise' ? 'Raise' : 'Bet'}\n${fmt(getMyBetAmount(hand, me, 0))}` : '';
    let allIn = a.allIn ? 'All-In' : '';
    if (hand.getCurrentRound() !== 0 && bero.getHighestSet() === 0 && this.checkable) fold = 'Check /\nFold';
    if (mode === 0) {
      if (me.getMyAction() !== PLAYER_ACTION_FOLD) {
        betRaise = `Bet\n${fmt(getMyBetAmount(hand, me, 0))}`;
        callCheck = 'Check';
        const apl = hand.getActivePlayerList();
        fold = (apl.length > 2 && me.getMyButton() === 2) || (apl.length <= 2 && me.getMyButton() === 3) ? 'Fold' : 'Check /\nFold';
        allIn = 'All-In';
        a.betRaise = 'bet';
        a.betMin = hand.getSmallBlind() * 2;
      } else {
        betRaise = callCheck = fold = allIn = '';
        this.slider.disabled = true;
        this.betInput.disabled = true;
        this.checkable = false;
      }
    }
    if (callCheck !== lastCallCheck && this.checked === 'callcheck') this.uncheckMyButtons();
    if (!betRaise) {
      this.slider.disabled = true;
      this.betInput.disabled = true;
    }
    this.setText(this.btnFold, fold);
    this.setText(this.btnBetRaise, betRaise);
    this.setText(this.btnCallCheck, callCheck);
    this.setText(this.btnAllIn, allIn);
    this.myActionIsRaise = betRaise.startsWith('Raise');
    this.myActionIsBet = betRaise.startsWith('Bet');
    if (betRaise) {
      this.slider.min = String(a.betMin);
      this.slider.max = String(me.getMyCash());
      this.slider.step = '10';
      this.betInput.min = String(a.betMin);
      this.betInput.max = String(me.getMyCash());
      if (Number(this.slider.value) < a.betMin) this.slider.value = String(a.betMin);
      this.changeSpinBoxBetValue(Number(this.slider.value));
    }
    this.styleButtons();
  }

  /** gameTableImpl::changeSpinBoxBetValue: the slider rounds the amount by the size of the stack */
  private changeSpinBoxBetValue(value: number): void {
    const max = Number(this.slider.max);
    const min = Number(this.slider.min);
    let v: number;
    if (value === max) v = value;
    else {
      const r = max <= 1000 ? 10 : max <= 10000 ? 50 : max <= 100000 ? 500 : 5000;
      v = Math.trunc(value / r) * r;
      if (v < min) v = min;
    }
    this.betInput.value = String(v);
    this.showBetValue(v);
  }

  private spinBoxBetValueChanged(value: number): void {
    if (this.slider.disabled) return;
    const min = Number(this.slider.min);
    const max = Number(this.slider.max);
    const v = value >= min ? Math.min(value, max) : min;
    this.slider.value = String(v);
    this.showBetValue(v);
  }

  private showBetValue(v: number): void {
    const t = this.text(this.btnBetRaise);
    if (t) this.setText(this.btnBetRaise, `${t.split('\n')[0]}\n${fmt(v)}`);
  }

  private betRaiseValue(): number {
    return Number(this.text(this.btnBetRaise).replace(/[^0-9]/g, ''));
  }

  meInAction(): void {
    this.checkable = false;
    this.slider.disabled = false;
    this.betInput.disabled = false;
    const pre = this.checked;
    const lastFold = this.text(this.btnFold);
    this.provideMyActions();
    this.checked = null;
    this.styleButtons();
    this.sound.playSound('yourturn', 0);
    if (this.onMyTurn) {
      const hand = this.game.getCurrentHand();
      const me = hand.getSeatsList().find((p) => p.getMyUniqueID() === this.myId());
      if (me) this.onMyTurn(hand, me);
    }
    if (pre === 'betraise') return this.pushButtonClicked('betraise');
    if (pre === 'callcheck') return this.pushButtonClicked('callcheck');
    if (pre === 'fold') {
      if (lastFold === 'Check /\nFold' && this.text(this.btnCallCheck) === 'Check') return this.pushButtonClicked('callcheck');
      return this.pushButtonClicked('fold');
    }
    if (pre === 'allin') return this.pushButtonClicked('allin');
    if (this.playingMode === 1) this.pushButtonClicked('callcheck');
    else if (this.playingMode === 2) {
      if (this.text(this.btnCallCheck) === 'Check') this.pushButtonClicked('callcheck');
      else this.pushButtonClicked('fold');
    }
  }

  private pushButtonClicked(which: 'betraise' | 'callcheck' | 'fold' | 'allin'): void {
    const b = { betraise: this.btnBetRaise, callcheck: this.btnCallCheck, fold: this.btnFold, allin: this.btnAllIn }[which];
    const t = this.text(b);
    if (!t) return;
    if (this.checkable) {
      // a pre-action for when it is the player's turn
      this.checked = this.checked === which ? null : which;
      if (this.checked) this.setMode(0);
      this.styleButtons();
      return;
    }
    const hand = this.game.getCurrentHand();
    let a: HumanAction | null = null;
    if (which === 'fold' && t === 'Fold') a = { kind: 'fold' };
    if (which === 'callcheck') a = t.startsWith('Call') ? { kind: 'call' } : t === 'Check' ? { kind: 'check' } : null;
    if (which === 'betraise') a = { kind: 'set', value: this.betRaiseValue(), raise: this.myActionIsRaise, bet: this.myActionIsBet };
    if (which === 'allin' && t === 'All-In') a = { kind: 'allin' };
    if (!a) return;
    this.disableMyButtons();
    this.myActionIsRaise = false;
    this.myActionIsBet = false;
    this.driver.myAction(hand, a);
  }

  // ---- online: the action time-out (MyTimeoutLabel)
  startTimeoutAnimation(playerId: number, timeoutSec: number): void {
    this.stopTimeoutAnimation();
    const s = this.seat(playerId);
    s.timeout.style.display = '';
    const bar = s.timeout.firstElementChild as HTMLElement;
    const t0 = performance.now();
    this.timeoutAnim = setInterval(() => {
      const f = 1 - (performance.now() - t0) / (timeoutSec * 1000);
      bar.style.width = `${Math.max(0, f) * 100}%`;
      if (f <= 0 || this.signal.aborted) this.stopTimeoutAnimation();
    }, 100);
  }

  stopTimeoutAnimation(): void {
    if (this.timeoutAnim !== null) clearInterval(this.timeoutAnim);
    this.timeoutAnim = null;
    for (const s of this.seats) s.timeout.style.display = 'none';
  }

  // ---- the log (guiLog)
  logLine(html: string, color = '#f0f0f0'): void {
    const d = el('div', '', this.log);
    d.style.color = color;
    d.innerHTML = html;
    while (this.log.childElementCount > 500) this.log.firstElementChild!.remove();
    this.log.scrollTop = this.log.scrollHeight;
  }

  logPlayerActionMsg(playerName: string, action: number, setValue: number): void {
    let msg = esc(playerName);
    switch (action) {
      case 1: msg += ' folds.'; break;
      case 2: msg += ' checks.'; break;
      case 3: msg += ' calls '; break;
      case 4: msg += ' bets '; break;
      case 5: msg += ' bets '; break;
      case 6: msg += ' is all in with '; break;
      default: msg += 'ERROR';
    }
    if (action >= 3) msg += `$${setValue}.`;
    this.logLine(msg);
  }

  logNewGameHandMsg(gameID: number, handID: number): void {
    this.logLine(`<span style="font-size:13px;font-weight:bold">## Game: ${gameID} | Hand: ${handID} ##</span>`);
  }

  logNewBlindsSetsMsg(sbSet: number, bbSet: number, sbName: string, bbName: string): void {
    this.sound.blindsWereSet(sbSet);
    this.logLine(`${esc(sbName)} posts small blind ($${sbSet})`);
    this.logLine(`${esc(bbName)} posts big blind ($${bbSet})`);
  }

  private card(c: number): string {
    const [r, s] = translateCardCode(c);
    return r + s;
  }

  logDealBoardCardsMsg(roundID: number, c1: number, c2: number, c3: number, c4 = -1, c5 = -1): void {
    // guiLog writes only flop, turn and river (round 4 of an all-in only sets "ERROR")
    if (roundID < 1 || roundID > 3) return;
    const cards = [c1, c2, c3, c4, c5].slice(0, roundID + 2).map((c) => this.card(c));
    const round = ['', 'Flop', 'Turn', 'River'][roundID];
    this.logLine(`--- ${round} --- [${cards.join(',')}]`, '#ff6633');
  }

  logFlipHoleCardsMsg(playerName: string, card1: number, card2: number, cardsValueInt = -1, showHas = 'shows'): void {
    let msg = `${esc(playerName)} ${showHas} [${this.card(card1)},${this.card(card2)}]`;
    if (cardsValueInt !== -1) msg += ` - "${esc(determineHandName(cardsValueInt, this.game.getActivePlayerList()))}"`;
    this.logLine(msg);
  }

  flushLogAtGame(): void {}
  flushLogAtHand(): void {}

  /** the original's message boxes */
  message(text: string): void {
    const o = el('div', 'overlay', this.root);
    const d = el('div', 'dialog', o);
    el('div', '', d).textContent = text;
    const bs = el('div', 'buttons', d);
    const ok = el('button', '', bs);
    ok.textContent = 'OK';
    ok.addEventListener('click', () => o.remove(), { signal: this.signal });
  }
}

export function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
