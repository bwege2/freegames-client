// The browser UI of the TEG port: the default theme's map and dialogs, the original's menus and
// toolbar, a local game against the robot or in hot seat, and (in online.ts) the shared lobby's
// round. The rules live in src/rules; this file only draws the state and turns clicks into commands.
import { packGame, unpackGame, type GameContext, type RoundStart } from '../../../../src/sdk/index.ts';
import { COUNTRIES, CONTINENTS, MAX_PLAYERS, PLAYER_COLORS, ROBOT_NAMES, missionName, colorOf } from '../rules/data.ts';
import { TegGame, type GameOptions, type LogEntry, type PlayerSetup, type Snapshot } from '../rules/engine.ts';
import { Robot } from '../rules/ai.ts';
import { loadAssets, type Assets } from './assets.ts';
import { Board } from './board.ts';
import {
  Msg, Msg_Which, Options as ProtoOptions, Phase as ProtoPhase, EventKind as ProtoEventKind,
  Reason as ProtoReason, Results as ProtoResults, type State as ProtoState,
} from '../proto/teg.ts';

const CSS = `
.teg-app { position:absolute; inset:0; display:flex; flex-direction:column; overflow:hidden;
  background:#101b2c; color:#f4e8cf; font:14px/1.35 system-ui, sans-serif; user-select:none; }
.teg-app * { box-sizing:border-box; }
.teg-bar { display:flex; flex-direction:column; gap:2px; padding:4px 6px 2px; background:#16263f; border-bottom:2px solid #9b7b3e; flex:none; }
.teg-menus { display:flex; gap:2px; flex-wrap:wrap; }
.teg-menu { position:relative; }
.teg-menu > button { background:transparent; border:0; color:#f4e8cf; font:inherit; padding:3px 9px; border-radius:4px; cursor:pointer; }
.teg-menu > button:hover, .teg-menu > button.open { background:#2b4264; }
.teg-drop { position:absolute; z-index:40; top:100%; left:0; min-width:190px; background:#f4e8cf; color:#231a10; border:1px solid #6b5225;
  border-radius:6px; box-shadow:0 6px 20px rgb(0 0 0 / .45); padding:4px; display:none; }
.teg-drop.open { display:block; }
.teg-drop button { display:block; width:100%; text-align:left; background:transparent; border:0; color:inherit; font:inherit; padding:5px 8px;
  border-radius:4px; cursor:pointer; }
.teg-drop button:hover:not(:disabled) { background:#e2d1a8; }
.teg-drop button:disabled { opacity:.45; cursor:default; }
.teg-drop .sep { height:1px; margin:4px 2px; background:#c9b689; }
.teg-tools { display:flex; gap:4px; align-items:center; flex-wrap:wrap; padding:2px 0; }
.teg-tools button { font:inherit; padding:4px 10px; border:1px solid #9b7b3e; border-radius:5px; background:#22395a; color:#f4e8cf; cursor:pointer; }
.teg-tools button:hover:not(:disabled) { background:#33517c; }
.teg-tools button:disabled { opacity:.4; cursor:default; }
.teg-tools .teg-remaining { margin-left:auto; color:#ffd98a; font-weight:600; }
.teg-status { flex:none; min-height:34px; padding:4px 8px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;
  background-image:var(--infobar); background-size:100% 100%; background-repeat:no-repeat; color:#171008; font-size:13px; border-bottom:1px solid #6b5225; }
.teg-status .teg-turn { display:flex; gap:3px; align-items:center; }
.teg-status img { width:12px; height:12px; vertical-align:middle; }
.teg-status .teg-starter { width:16px; height:16px; }
.teg-status strong { font-weight:700; }
.teg-main { position:relative; flex:1 1 auto; min-height:0; display:flex; align-items:center; justify-content:center; padding:4px; }
.teg-boardwrap { position:relative; display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
.teg-boardwrap canvas { display:block; border:1px solid #050b14; box-shadow:0 0 0 2px #9b7b3e, 0 6px 18px rgb(0 0 0 / .4); background:#1b3a5a; }
.teg-chat[hidden] { display:none; }
.teg-chat { flex:none; display:flex; gap:6px; padding:3px 8px; background:#0f1d31; border-top:1px solid #2f4a70; }
.teg-chat input { flex:1; font:inherit; padding:2px 6px; border:1px solid #2f4a70; border-radius:4px; background:#16263f; color:#f4e8cf; }
.teg-chat button { font:inherit; padding:2px 10px; border:1px solid #9b7b3e; border-radius:4px; background:#22395a; color:#f4e8cf; cursor:pointer; }
.teg-log { flex:none; height:76px; overflow:auto; background:#0b1422; border-top:1px solid #2f4a70; padding:3px 8px; font-size:12px;
  line-height:1.3; user-select:text; }
.teg-log div { white-space:pre-wrap; }
.teg-log .error { color:#ff9a8a; }
.teg-log .attack, .teg-log .dice { color:#ffd98a; }
.teg-log .conquest, .teg-log .win { color:#9dff9d; font-weight:600; }
.teg-log .lost { color:#ff9a8a; }
.teg-log .card, .teg-log .exchange { color:#9fd3ff; }
.teg-log .round { color:#e4c7ff; }
.teg-bottom { flex:none; min-height:22px; padding:2px 8px; background:#16263f; color:#cfe0f5; font-size:12px; display:flex; gap:12px; }
.teg-bottom .teg-hint { margin-left:auto; color:#8fa6c2; }
.teg-cursor { cursor:pointer; }
.teg-dialog-layer { position:absolute; inset:0; z-index:60; pointer-events:none; }
.teg-dialog-layer > .teg-overlay { pointer-events:auto; position:absolute; inset:0; background:rgb(0 0 0 / .45); display:flex; align-items:center; justify-content:center; padding:12px; }
.teg-dialog { max-width:min(540px, 96vw); max-height:90vh; overflow:auto; background:#f4e8cf; color:#231a10; border:2px solid #6b5225; border-radius:8px;
  box-shadow:0 12px 40px rgb(0 0 0 / .55); padding:14px 16px; user-select:text; }
.teg-dialog h2 { margin:0 0 8px; font-size:18px; color:#3c2a12; }
.teg-dialog h3 { margin:10px 0 4px; font-size:14px; color:#5b4522; }
.teg-dialog p { margin:4px 0; }
.teg-dialog .teg-buttons { display:flex; gap:8px; justify-content:flex-end; margin-top:12px; flex-wrap:wrap; }
.teg-dialog button { font:inherit; padding:5px 14px; border:1px solid #2f5d9b; border-radius:5px; background:#2f5d9b; color:#fff; cursor:pointer; }
.teg-dialog button.quiet { background:transparent; color:#2f5d9b; }
.teg-dialog button:disabled { opacity:.45; cursor:default; }
.teg-dialog input[type=text], .teg-dialog select { font:inherit; padding:3px 5px; border:1px solid #9b7b3e; border-radius:4px; background:#fffaf0; color:#231a10; }
.teg-dialog input[type=range] { width:100%; }
.teg-dialog table { border-collapse:collapse; width:100%; }
.teg-dialog th, .teg-dialog td { text-align:left; padding:3px 5px; border-bottom:1px solid #d7c69e; }
.teg-dialog .teg-setup-row { display:flex; gap:6px; align-items:center; margin:3px 0; }
.teg-dialog .teg-setup-row input[type=text] { flex:1; min-width:80px; }
.teg-dialog .teg-setup-row input[type=checkbox] { flex:none; width:auto; min-width:0; }
.teg-dialog .teg-setup-row { align-items:flex-start; }
.teg-dialog .teg-colors { width:20px; height:20px; border:1px solid #333; border-radius:3px; }
.teg-dialog .teg-error { color:#b3261e; min-height:1.2em; }
.teg-dialog .teg-card { position:relative; display:inline-block; margin:4px; vertical-align:top; }
.teg-dialog .teg-card img { display:block; border:1px solid #6b5225; }
.teg-dialog .teg-card .teg-card-name { position:absolute; left:0; right:0; text-align:center; color:brown; font-weight:700; font-size:13px; }
.teg-dialog .teg-card .teg-card-cont { position:absolute; left:0; right:0; text-align:center; color:brown; font-size:10px; }
.teg-dialog .teg-card button { position:absolute; left:2px; right:2px; bottom:2px; font-size:11px; padding:2px; }
.teg-dialog .teg-card .teg-select { position:absolute; top:2px; right:2px; }
.teg-dialog .teg-mission { position:relative; width:189px; height:142px; background-size:100% 100%; color:brown; }
.teg-dialog .teg-mission .teg-mtext { position:absolute; left:4px; top:8px; width:181px; white-space:pre-line; font:12px/1.2 serif; }
.teg-dialog .teg-mission .teg-mnote { position:absolute; left:4px; bottom:4px; font:10px/1.1 serif; }
.teg-dialog .teg-log-list { max-height:260px; overflow:auto; }
.teg-online-lobby { position:absolute; inset:0; z-index:55; overflow:auto; background:#101b2c; }
.teg-online-lobby .fg-lobby { margin-top:3rem; }
.teg-welcome { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgb(7 15 27 / .52); z-index:20; }
.teg-welcome .teg-panel { background:#f4e8cf; color:#231a10; border:2px solid #6b5225; border-radius:10px; padding:18px 22px; max-width:420px;
  box-shadow:0 12px 40px rgb(0 0 0 / .5); text-align:center; }
.teg-welcome h1 { margin:0 0 2px; font-size:26px; color:#3c2a12; }
.teg-welcome h2 { margin:0 0 10px; font-size:13px; font-weight:400; color:#6b5225; }
.teg-welcome p { margin:6px 0; text-align:left; font-size:13px; }
.teg-welcome .teg-buttons { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:12px; }
.teg-welcome button { font:inherit; padding:6px 14px; border:1px solid #2f5d9b; border-radius:5px; background:#2f5d9b; color:#fff; cursor:pointer; }
.teg-welcome button.quiet { background:transparent; color:#2f5d9b; }
.teg-badge { font-size:11px; background:#5b4522; color:#f4e8cf; border-radius:3px; padding:0 4px; margin-left:4px; }
@media (max-width:640px) {
  .teg-log { height:52px; }
  .teg-tools button { padding:3px 7px; font-size:12px; }
  .teg-status { font-size:11px; gap:6px; }
}
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}


function phaseName(p: number): 'place1' | 'place2' | 'reinforce' | 'attack' | 'regroup' | 'move' | 'card' | 'over' {
  switch (p) {
    case ProtoPhase.PLACE1: return 'place1';
    case ProtoPhase.PLACE2: return 'place2';
    case ProtoPhase.REINFORCE: return 'reinforce';
    case ProtoPhase.ATTACK: return 'attack';
    case ProtoPhase.REGROUP: return 'regroup';
    case ProtoPhase.MOVE: return 'move';
    case ProtoPhase.CARD: return 'card';
    default: return 'over';
  }
}
function eventKindName(k: number): string {
  switch (k) {
    case ProtoEventKind.ERROR: return 'error';
    case ProtoEventKind.ATTACK: return 'attack';
    case ProtoEventKind.DICE: return 'dice';
    case ProtoEventKind.CONQUEST: return 'conquest';
    case ProtoEventKind.CARD: return 'card';
    case ProtoEventKind.EXCHANGE: return 'exchange';
    case ProtoEventKind.TURN: return 'turn';
    case ProtoEventKind.ROUND: return 'round';
    case ProtoEventKind.WIN: return 'win';
    case ProtoEventKind.LOST: return 'lost';
    case ProtoEventKind.PLACE: return 'place';
    case ProtoEventKind.REGROUP: return 'regroup';
    case ProtoEventKind.MOVE: return 'move';
    case ProtoEventKind.MISSION: return 'mission';
    case ProtoEventKind.CHAT: return 'chat';
    default: return 'info';
  }
}

interface MenuItem { label?: string; action?: () => void; sep?: boolean; disabled?: boolean }
interface DialogButton { label: string; value: string; quiet?: boolean }

export class TegApp {
  private readonly ctx: GameContext;
  private readonly root: HTMLElement;
  private readonly boardWrap: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly status: HTMLElement;
  private readonly logEl: HTMLElement;
  private readonly chatBar: HTMLElement;
  private readonly chatInput: HTMLInputElement;
  private readonly bottom: HTMLElement;
  private readonly toolbar: HTMLElement;
  private readonly dialogLayer: HTMLElement;
  private readonly welcome: HTMLElement;
  private readonly buttonByAction = new Map<string, HTMLButtonElement[]>();
  private assets!: Assets;
  private board!: Board;
  private game: TegGame | null = null;
  private robots = new Map<number, Robot>();
  private humanSeats: number[] = [];
  private mode: 'welcome' | 'local' = 'welcome';
  private selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
  private regroupMode = false;
  private pending = new Map<number, number>();
  private hover = -1;
  private shownLog = 0;
  private lastKey = '';
  private lastAi = 0;
  private endShown = false;
  private scoresSubmitted = false;
  private dialogOpen = 0;
  private readonly ro: ResizeObserver;
  private resizeQueued = false;
  private hoverQueued = false;
  private destroyed = false;
  private moveDialog = false;
  private online = false;
  private mySeat = -1;
  private onlineRules: GameOptions = { secretMissions: false, commonMission: true, fogOfWar: false, startArmies: 5, secondArmies: 3 };
  private onlineOff: (() => void)[] = [];
  private lobbyHost: HTMLElement | null = null;
  private onlinePendingMission = false;
  private onlineSeatIds: number[] = [];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    if (!document.getElementById('teg-css')) document.head.append(el('style', { id: 'teg-css', textContent: CSS }));
    this.root = el('div', { className: 'teg-app' });
    this.toolbar = el('div', { className: 'teg-tools' });
    this.status = el('div', { className: 'teg-status' });
    this.canvas = el('canvas');
    this.boardWrap = el('div', { className: 'teg-boardwrap' }, this.canvas);
    this.logEl = el('div', { className: 'teg-log' });
    this.chatInput = el('input', { type: 'text', maxLength: 300, placeholder: 'Say something to the room…' });
    const chatSend = el('button', { type: 'button', textContent: 'Send' });
    this.chatBar = el('div', { className: 'teg-chat', hidden: true }, this.chatInput, chatSend);
    this.bottom = el('div', { className: 'teg-bottom' });
    this.dialogLayer = el('div', { className: 'teg-dialog-layer' });
    this.welcome = el('div', { className: 'teg-welcome' });
    this.root.append(this.makeBar(), this.status, el('div', { className: 'teg-main' }, this.boardWrap, this.welcome), this.chatBar, this.logEl, this.bottom, this.dialogLayer);
    host.replaceChildren(this.root);
    this.ro = new ResizeObserver(() => this.queueResize());
    this.ro.observe(this.root);
    const debug = {
      state: () => this.game ? {
        phase: this.game.phase, turn: this.game.turn, round: this.game.round, online: this.online, mySeat: this.mySeat,
        pending: this.game.pendingMove, lastDice: this.game.lastDice, winner: this.game.winner,
        countries: this.game.countries.map((c, id) => ({ id, owner: c.owner, armies: c.armies, cardOwner: c.cardOwner, cardUsed: c.cardUsed })),
        players: this.game.players.map((p) => ({ seat: p.seat, name: p.name, color: p.color, active: p.active, mission: p.mission, score: p.score, cards: p.knownCards })),
      } : null,
      center: (id: number) => this.board ? this.board.center(id) : null,
      board: () => { const c = this.canvas.getBoundingClientRect(); return { x: c.x, y: c.y, w: c.width, h: c.height }; },
    };
    (window as unknown as { __teg: typeof debug }).__teg = debug;
    this.installInput();
    const sendChat = () => {
      const text = this.chatInput.value.trim();
      if (!text || !this.online) return;
      this.chatInput.value = '';
      this.sendMsg((m) => { const c = m._initChat(); c.seat = this.mySeat; c.text = text; });
    };
    chatSend.addEventListener('click', sendChat, { signal: this.ctx.signal });
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); sendChat(); }
    }, { signal: this.ctx.signal });
    void this.setup();
  }

  // ---------------------------------------------------------------- start up
  private async setup(): Promise<void> {
    try {
      this.assets = await loadAssets();
    } catch (e) {
      this.welcome.replaceChildren(el('div', { className: 'teg-panel' }, el('p', { textContent: `Could not load the game's pictures: ${String(e)}` })));
      return;
    }
    if (this.destroyed) return;
    this.board = new Board(this.canvas, this.assets);
    const bar = this.status;
    bar.style.setProperty('--infobar', `url(${[...this.assets.images.entries()].find(([k]) => k === this.assets.theme.toolbar.file)?.[1].src ?? ''})`);
    this.showWelcome();
    this.ctx.frame(() => this.frame());
    this.queueResize();
  }

  destroy(): void {
    this.destroyed = true;
    if ((window as unknown as { __teg?: unknown }).__teg) delete (window as unknown as { __teg?: unknown }).__teg;
    for (const off of this.onlineOff.splice(0)) off();
    this.ro.disconnect();
    this.closeAllDialogs();
    this.root.remove();
  }

  private queueResize(): void {
    if (this.resizeQueued) return;
    this.resizeQueued = true;
    requestAnimationFrame(() => {
      this.resizeQueued = false;
      if (!this.board || this.destroyed) return;
      const r = this.boardWrap.getBoundingClientRect();
      this.board.fit(r.width - 8, r.height - 8);
    });
  }

  // ---------------------------------------------------------------- menus and toolbar
  private makeBar(): HTMLElement {
    const menus = el('div', { className: 'teg-menus' });
    menus.append(
      this.menu('Game', [
        { label: 'New game…', action: () => void this.showSetup() },
        { label: 'Play online…', action: () => void this.showOnline() },
        { sep: true },
        { label: 'Scores…', action: () => void this.showScores() },
        { sep: true },
        { label: 'Quit', action: () => this.ctx.exit() },
      ]),
      this.menu('Actions', [
        { label: 'Send armies', action: () => this.sendArmies() },
        { label: 'Regroup armies', action: () => this.enterRegroup() },
        { label: 'Get card', action: () => this.getCard() },
        { label: 'End turn', action: () => this.endTurn() },
        { sep: true },
        { label: 'Surrender', action: () => void this.surrender() },
      ]),
      this.menu('View', [
        { label: 'Players', action: () => this.showPlayers() },
        { label: 'Mission', action: () => this.showMission() },
        { label: 'Cards', action: () => this.showCards() },
        { sep: true },
        { label: 'Zoom in', action: () => this.zoom(1.05) },
        { label: 'Zoom out', action: () => this.zoom(0.95) },
        { label: 'Fit map', action: () => this.fitMap() },
      ]),
      this.menu('Settings', [
        { label: 'Rules for a new game…', action: () => void this.showSetup() },
        { label: 'Full screen', action: () => void this.fullScreen() },
      ]),
      this.menu('Help', [
        { label: 'Controls', action: () => this.showHelp() },
        { label: 'About', action: () => this.showAbout() },
      ]),
    );
    const tools = this.toolbar;
    const add = (label: string, action: string, fn: () => void): HTMLButtonElement => {
      const b = el('button', { textContent: label });
      b.addEventListener('click', fn, { signal: this.ctx.signal });
      tools.append(b);
      const list = this.buttonByAction.get(action) ?? [];
      list.push(b);
      this.buttonByAction.set(action, list);
      return b;
    };
    add('Send armies', 'send', () => this.sendArmies());
    add('1. Regroup', 'regroup', () => this.enterRegroup());
    add('2. Get card', 'card', () => this.getCard());
    add('3. End turn', 'end', () => this.endTurn());
    add('View players', 'players', () => this.showPlayers());
    const remaining = el('span', { className: 'teg-remaining' });
    remaining.id = 'teg-remaining-tools';
    tools.append(remaining);
    return el('div', { className: 'teg-bar' }, menus, tools);
  }

  private menu(label: string, items: MenuItem[]): HTMLElement {
    const box = el('div', { className: 'teg-menu' });
    const button = el('button', { textContent: label, type: 'button' });
    const drop = el('div', { className: 'teg-drop' });
    box.append(button, drop);
    const close = () => { drop.classList.remove('open'); button.classList.remove('open'); };
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = drop.classList.contains('open');
      for (const d of this.root.querySelectorAll('.teg-drop.open')) d.classList.remove('open');
      for (const b of this.root.querySelectorAll('.teg-menu > button.open')) b.classList.remove('open');
      if (!open) { drop.classList.add('open'); button.classList.add('open'); }
    }, { signal: this.ctx.signal });
    this.root.addEventListener('click', close, { signal: this.ctx.signal });
    for (const it of items) {
      if (it.sep) { drop.append(el('div', { className: 'sep' })); continue; }
      const b = el('button', { textContent: it.label ?? '', type: 'button', disabled: !!it.disabled });
      b.addEventListener('click', () => { close(); it.action?.(); }, { signal: this.ctx.signal });
      drop.append(b);
    }
    return box;
  }

  private setEnabled(action: string, on: boolean): void {
    for (const b of this.buttonByAction.get(action) ?? []) b.disabled = !on;
  }

  private zoom(k: number): void {
    if (!this.board) return;
    const w = this.canvas.getBoundingClientRect().width * k;
    const h = this.canvas.getBoundingClientRect().height * k;
    this.canvas.style.width = `${Math.max(100, w)}px`;
    this.canvas.style.height = `${Math.max(60, h)}px`;
  }
  private fitMap(): void {
    if (this.board) { this.canvas.style.width = ''; this.canvas.style.height = ''; this.queueResize(); }
  }
  private async fullScreen(): Promise<void> {
    try { await this.root.requestFullscreen(); } catch { /* the browser refused */ }
  }

  // ---------------------------------------------------------------- the welcome and the setup
  private showWelcome(): void {
    this.mode = 'welcome';
    this.game = null;
    this.online = false;
    this.mySeat = -1;
    this.board?.drawStatic();
    this.welcome.replaceChildren(el('div', { className: 'teg-panel' },
      el('h1', { textContent: 'Tenés Empanadas Graciela' }),
      el('h2', { textContent: 'TEG 0.13.0 · Argentina’s Risk, as the original program plays it' }),
      el('p', { textContent: 'Fifty countries on the original’s world map. Take countries, place armies, attack with dice, hold continents, trade the four kinds of country cards and finish your secret mission.' }),
      el('div', { className: 'teg-buttons' },
        (() => { const b = el('button', { textContent: 'New game' }); b.onclick = () => void this.showSetup(); return b; })(),
        (() => { const b = el('button', { textContent: 'Play online' }); b.onclick = () => void this.showOnline(); return b; })(),
        (() => { const b = el('button', { className: 'quiet', textContent: 'Controls' }); b.onclick = () => this.showHelp(); return b; })(),
      )));
    this.welcome.style.display = 'flex';
    this.chatBar.hidden = true;
    this.updateControls();
    this.renderStatus();
  }

  private showSetup(): void {
    if (!this.board) { this.toast('The map is still loading…'); return; }
    const old = this.game;
    if (old && !old.isOver() && !window.confirm('Start a new game? The current one will be lost.')) return;
    const players: { name: string; color: number; human: boolean }[] = [
      { name: 'Player 1', color: 0, human: true },
      { name: 'Player 2', color: 1, human: false },
    ];
    const box = el('div', { className: 'teg-dialog' });
    const count = el('select');
    for (let n = 2; n <= MAX_PLAYERS; n++) count.append(el('option', { value: String(n), textContent: `${n} players` }));
    const rows = el('div');
    const error = el('div', { className: 'teg-error' });
    const secret = el('input', { type: 'checkbox' }) as HTMLInputElement;
    const common = el('input', { type: 'checkbox' }) as HTMLInputElement;
    common.checked = true;
    const fog = el('input', { type: 'checkbox' }) as HTMLInputElement;

    const drawRows = () => {
      const n = Number(count.value);
      while (players.length < n) {
        const i = players.length;
        players.push({ name: i === 1 ? ROBOT_NAMES[0] : `Player ${i + 1}`, color: i, human: i === 0 });
      }
      players.length = n;
      rows.replaceChildren();
      players.forEach((p, i) => {
        const name = el('input', { type: 'text', value: p.name, maxLength: 24, placeholder: 'Name' });
        name.addEventListener('input', () => { p.name = name.value; });
        const color = el('select');
        for (const c of PLAYER_COLORS) {
          color.append(el('option', { value: String(c.id), textContent: c.name, selected: c.id === p.color }));
        }
        color.addEventListener('change', () => { p.color = Number(color.value); });
        const human = el('select');
        human.append(el('option', { value: '1', textContent: 'Human' }), el('option', { value: '0', textContent: 'Robot' }));
        human.value = p.human ? '1' : '0';
        human.addEventListener('change', () => { p.human = human.value === '1'; });
        const swatch = el('span', { className: 'teg-colors' });
        swatch.style.background = colorOf(p.color).fill;
        color.addEventListener('change', () => { swatch.style.background = colorOf(p.color).fill; });
        rows.append(el('div', { className: 'teg-setup-row' }, el('span', { textContent: `${i + 1}.` }), swatch, name, color, human));
      });
    };
    count.value = String(players.length);
    count.addEventListener('change', drawRows);
    drawRows();
    box.append(
      el('h2', { textContent: 'New game' }),
      el('label', { className: 'teg-setup-row' }, el('span', { textContent: 'Players' }), count),
      rows,
      el('h3', { textContent: 'Rules' }),
      el('label', { className: 'teg-setup-row' }, secret, el('span', { textContent: 'Secret missions (otherwise conquer the world)' })),
      el('label', { className: 'teg-setup-row' }, common, el('span', { textContent: 'The common mission: 30 countries also wins' })),
      el('label', { className: 'teg-setup-row' }, fog, el('span', { textContent: 'Fog of war (you see your countries and their neighbours)' })),
      el('p', { textContent: 'The first placement is 5 armies, the second 3. A player whose turn comes places half of their countries’ armies (at least 3), plus 3 for South America, 5 for North America or Europe, 3 for Africa, 2 for Oceania and 7 for Asia.' }),
      error,
      el('div', { className: 'teg-buttons' },
        (() => { const b = el('button', { textContent: 'Start' }); b.onclick = () => {
          const used = new Set<number>();
          for (const p of players) {
            if (!p.name.trim()) { error.textContent = 'Every player needs a name.'; return; }
            if (used.has(p.color)) { error.textContent = 'Every player needs a different colour.'; return; }
            used.add(p.color);
          }
          this.closeAllDialogs();
          this.startLocal(players.map((p) => ({ ...p, name: p.name.trim() })), {
            secretMissions: secret.checked, commonMission: common.checked, fogOfWar: fog.checked,
          });
        }; return b; })(),
        (() => { const b = el('button', { className: 'quiet', textContent: 'Cancel' }); b.onclick = () => { this.closeAllDialogs(); if (!this.game) this.showWelcome(); }; return b; })(),
      ));
    this.openDialog(box, false);
  }

  private startLocal(setups: PlayerSetup[], options: Partial<GameOptions>): void {
    if (!this.board) return;
    for (const off of this.onlineOff.splice(0)) off();
    this.online = false;
    this.mySeat = -1;
    const seed = new Uint32Array(1);
    crypto.getRandomValues(seed);
    this.game = TegGame.create(seed[0], setups, options);
    this.mode = 'local';
    this.humanSeats = setups.map((p, i) => (p.human ? i : -1)).filter((i) => i >= 0);
    this.robots = new Map();
    for (const p of this.game.players) if (!p.human) this.robots.set(p.seat, new Robot(this.game, p.seat));
    this.selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
    this.regroupMode = false;
    this.pending.clear();
    this.shownLog = 0;
    this.lastKey = '';
    this.lastAi = 0;
    this.endShown = false;
    this.scoresSubmitted = false;
    this.logEl.replaceChildren();
    this.welcome.style.display = 'none';
    this.chatBar.hidden = true;
    this.afterChange();
  }

  // ---------------------------------------------------------------- the game loop
  private frame(): void {
    if (this.online || this.mode !== 'local' || !this.game || this.game.isOver() || this.dialogOpen) return;
    const g = this.game;
    if (g.player(g.turn).human) return;
    const now = performance.now();
    if (now - this.lastAi < 360) return;
    const robot = this.robots.get(g.turn);
    const r = robot?.step() ?? null;
    this.lastAi = now;
    if (r) this.afterChange();
    else this.fallbackAi();
  }

  /** never let the page hang on a robot whose action the engine refused */
  private fallbackAi(): void {
    const g = this.game;
    if (!g || g.player(g.turn).human) return;
    const seat = g.turn;
    const owned = g.countriesOf(seat);
    if (g.phase === 'place1' || g.phase === 'place2' || g.phase === 'reinforce') {
      if (!owned.length) { g.surrender(seat); this.afterChange(); return; }
      const counts = new Map<number, number>();
      if (g.phase === 'reinforce') {
        const r = g.reinforcement(seat);
        for (let c = 0; c < CONTINENTS.length; c++) {
          if (r.conts & (1 << c)) {
            const first = owned.find((x) => COUNTRIES[x].continent === c);
            if (first !== undefined) counts.set(first, CONTINENTS[c].bonus);
          }
        }
        const first = owned[0];
        counts.set(first, (counts.get(first) ?? 0) + r.base + r.exchange);
      } else {
        counts.set(owned[0], g.requiredArmies(seat));
      }
      if (!g.place(seat, counts)) g.surrender(seat);
    } else if (g.phase === 'move') {
      g.moveAfterConquest(seat, 0);
    } else {
      g.endTurn(seat);
    }
    this.afterChange();
  }

  private afterChange(): void {
    const g = this.game;
    if (!g) return;
    const key = `${g.round}:${g.turn}:${g.phase}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
      this.regroupMode = false;
      if (g.phase !== 'reinforce' && g.phase !== 'place1' && g.phase !== 'place2') this.pending.clear();
    }
    this.renderLog();
    this.draw();
    this.renderStatus();
    this.updateControls();
    if (g.isOver() && !this.endShown) {
      this.endShown = true;
      this.showGameOver();
      this.submitScores();
    }
    if (g.phase === 'move' && this.humanTurn()) this.askMove();
    if (g.phase !== 'over' && this.humanSeats.length && this.humanTurn() && !g.players[g.turn].active) {
      // cannot happen, but never leave the turn on an inactive player
      g.surrender(g.turn);
      this.afterChange();
    }
  }

  private renderLog(): void {
    const g = this.game;
    if (!g) return;
    if (this.shownLog > g.log.length) { this.shownLog = 0; this.logEl.replaceChildren(); }
    for (let i = this.shownLog; i < g.log.length; i++) {
      const e: LogEntry = g.log[i];
      this.logEl.append(el('div', { className: e.kind, textContent: e.text }));
    }
    this.shownLog = g.log.length;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private draw(): void {
    if (!this.game || !this.board) return;
    const g = this.game;
    const seat = g.isOver() ? -1 : this.viewSeat();
    const sel: Parameters<Board['draw']>[2] = { hover: this.hover };
    if (this.selection.attackSource >= 0) sel.attackSource = this.selection.attackSource;
    if (this.selection.attackTarget >= 0) sel.attackTarget = this.selection.attackTarget;
    if (this.selection.regroupSource >= 0) sel.regroupSource = this.selection.regroupSource;
    if (this.selection.regroupTarget >= 0) sel.regroupTarget = this.selection.regroupTarget;
    if (this.pending.size && this.humanTurn()) sel.placeIn = [...this.pending.keys()][0];
    this.board.draw(g, seat, sel, this.pending);
    const d = g.lastDice;
    if (d && (seat < 0 || (g.canSee(seat, d.src) && g.canSee(seat, d.dst)))) {
      const a = g.player(g.countries[d.src].owner);
      const b = g.player(g.countries[d.dst].owner);
      this.board.drawDice(d.src, d.dst, d.srcDice, d.dstDice, colorOf(a.color).fill, colorOf(b.color).fill);
    }
  }

  /** the seat whose fog is shown; a robot's turn hides its countries from the human */
  private viewSeat(): number {
    const g = this.game;
    if (!g) return -1;
    if (this.online) return this.mySeat;
    if (g.player(g.turn).human) return g.turn;
    return this.humanSeats[0] ?? -1;
  }

  private renderStatus(): void {
    const g = this.game;
    if (!g) { this.status.replaceChildren(el('span', { textContent: 'Tenés Empanadas Graciela' })); return; }
    const t = this.status;
    t.replaceChildren();
    const hov = this.hover >= 0 ? this.hover : -1;
    const visible = hov < 0 || !g.options.fogOfWar || g.canSee(this.viewSeat(), hov);
    const country = hov >= 0 ? `${COUNTRIES[hov].name} armies: ${visible ? g.countries[hov].armies : '?'}` : '';
    t.append(el('span', { textContent: country }));
    const turn = el('span', { className: 'teg-turn' }, el('strong', { textContent: 'Players turn:' }));
    for (const p of g.players) {
      if (!p.active) continue;
      const disc = this.assets?.pix.get(`disc_${colorOf(p.color).name}.png`);
      if (disc) {
        const img = el('img', { src: disc.src, title: p.name });
        // the original shows the colours of all players, bright for the one on turn
        if (p.seat !== g.turn) img.style.opacity = '0.4';
        turn.append(img);
      }
    }
    t.append(turn);
    const starter = g.players[g.roundStarter];
    const starterDisc = this.assets?.pix.get(`disc_${colorOf(starter.color).name}.png`);
    const start = el('span', { className: 'teg-turn' }, el('strong', { textContent: 'Round started by:' }));
    if (starterDisc) {
      const img = el('img', { className: 'teg-starter', src: starterDisc.src, title: starter.name });
      start.append(img);
    }
    start.append(el('span', { textContent: starter.name }));
    t.append(start);
    t.append(el('span', { textContent: `Round number: ${g.round}` }));
    t.append(el('span', { textContent: this.phaseLabel() }));
    if (this.pending.size) {
      const left = this.remaining();
      t.append(el('span', { textContent: `Armies left: ${left}` }));
    }
  }

  private phaseLabel(): string {
    const g = this.game!;
    const p = g.players[g.turn];
    switch (g.phase) {
      case 'place1': return `${p.name}: placing the first armies`;
      case 'place2': return `${p.name}: placing the second armies`;
      case 'reinforce': return `${p.name}: placing armies`;
      case 'attack': return `${p.name}: attacking`;
      case 'regroup': return `${p.name}: regrouping`;
      case 'move': return `${p.name}: moving into a conquered country`;
      case 'card': return `${p.name}: getting a card`;
      case 'over': return 'game over';
      default: return '';
    }
  }

  private updateControls(): void {
    const g = this.game;
    const human = !!g && this.humanTurn() && !g.isOver();
    const place = human && (g!.phase === 'place1' || g!.phase === 'place2' || g!.phase === 'reinforce');
    const attack = human && (g!.phase === 'attack' || g!.phase === 'regroup');
    const end = !!g && human && g.canEndTurn(g.turn);
    const card = !!g && human && g.canDrawCard(g.turn);
    this.setEnabled('send', place);
    this.setEnabled('regroup', attack);
    this.setEnabled('card', card);
    this.setEnabled('end', end);
    this.setEnabled('players', !!g);
    const rem = document.getElementById('teg-remaining-tools');
    if (rem) {
      if (place) {
        const r = this.remaining();
        const bonus = g!.phase === 'reinforce' ? this.continentHint() : '';
        rem.textContent = `${r} armies left${bonus ? ` · ${bonus}` : ''}`;
      } else rem.textContent = '';
    }
    this.bottom.replaceChildren(
      el('span', { textContent: this.bottomText() }),
      el('span', { className: 'teg-hint', textContent: this.hint() }),
    );
  }

  private bottomText(): string {
    const g = this.game;
    if (!g) return '';
    if (g.isOver()) {
      const w = g.winner !== null ? g.players[g.winner] : null;
      return w ? `${w.name} won after round ${g.round}.` : 'The game is over.';
    }
    if (g.phase === 'attack') {
      if (this.selection.attackSource >= 0) return `Source: ${COUNTRIES[this.selection.attackSource].name}. Click a neighbouring enemy country to attack.`;
      return 'Click one of your countries with at least 2 armies, then a neighbouring enemy country.';
    }
    if (g.phase === 'regroup' || this.regroupMode) {
      if (this.selection.regroupSource >= 0) return `From ${COUNTRIES[this.selection.regroupSource].name}: click a neighbouring country of yours.`;
      return 'Regroup: click a country of yours (with more than 1 army), then a neighbouring country of yours.';
    }
    if (g.phase === 'place1' || g.phase === 'place2' || g.phase === 'reinforce') {
      const r = this.remaining();
      return `Left-click a country of yours to add an army, right-click to take one back. ${r} still to place.`;
    }
    if (g.phase === 'move') return 'Choose how many of the armies to move into the conquered country.';
    if (g.phase === 'card') return 'You received a card. Use the cards you own for 2 armies each, then end the turn.';
    return '';
  }

  private hint(): string {
    const g = this.game;
    if (!g) return 'Play → New game, or Play online';
    if (g.isOver()) return 'Game → New game';
    if (!this.humanTurn()) return this.online ? `Waiting for ${g.player(g.turn).name}…` : 'The robot is thinking…';
    if (g.phase === 'card') return 'End turn when done';
    if (g.phase === 'attack') return 'R: regroup · C: get card · Enter: end turn';
    if (g.phase === 'reinforce') return 'Enter: send armies';
    return '';
  }

  // ---------------------------------------------------------------- input
  private installInput(): void {
    const signal = this.ctx.signal;
    this.canvas.addEventListener('click', (e) => this.clickCountry(e), { signal });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    this.canvas.addEventListener('pointermove', (e) => this.pointerMove(e), { signal });
    this.canvas.addEventListener('pointerleave', () => { this.hover = -1; this.renderStatus(); this.draw(); }, { signal });
    this.canvas.addEventListener('wheel', (e) => this.wheel(e), { signal, passive: false });
    window.addEventListener('keydown', (e) => this.key(e), { signal });
  }

  private countryFromEvent(e: MouseEvent | PointerEvent): number {
    if (!this.board) return -1;
    const p = this.board.point(e);
    return this.board.countryAt(p.x, p.y);
  }

  private humanTurn(): boolean {
    if (!this.game) return false;
    if (this.online) return this.game.turn === this.mySeat && !this.game.isOver();
    return this.game.player(this.game.turn).human;
  }

  private clickCountry(e: MouseEvent): void {
    if (!this.game || this.dialogOpen || this.game.isOver()) return;
    if (!this.humanTurn()) return;
    const c = this.countryFromEvent(e);
    if (c < 0) { this.clearSelection(); return; }
    if (e.button === 2) {
      if (this.isPlacement() && (this.pending.get(c) ?? 0) > 0) {
        this.pending.set(c, (this.pending.get(c) ?? 0) - 1);
        if (this.pending.get(c) === 0) this.pending.delete(c);
        this.afterChange();
      } else this.clearSelection();
      return;
    }
    if (this.isPlacement()) { this.placeClick(c); return; }
    if (this.regroupMode || this.game.phase === 'regroup') { this.regroupClick(c); return; }
    if (this.game.phase === 'attack') this.attackClick(c);
  }

  private isPlacement(): boolean {
    const g = this.game;
    return !!g && (g.phase === 'place1' || g.phase === 'place2' || g.phase === 'reinforce');
  }

  private placeClick(c: number): void {
    const g = this.game!;
    if (g.countries[c].owner !== g.turn) { this.toast('You can only place armies in your own countries.'); return; }
    if (this.remaining() <= 0) { this.toast('All armies are placed. Send them with “Send armies”.'); return; }
    this.pending.set(c, (this.pending.get(c) ?? 0) + 1);
    this.afterChange();
  }

  private wheel(e: WheelEvent): void {
    if (!this.game || !this.humanTurn() || this.dialogOpen || !this.isPlacement()) return;
    e.preventDefault();
    const c = this.countryFromEvent(e);
    if (c < 0 || this.game.countries[c].owner !== this.game.turn) return;
    if (e.deltaY < 0) { if (this.remaining() > 0) this.pending.set(c, (this.pending.get(c) ?? 0) + 1); }
    else {
      const n = this.pending.get(c) ?? 0;
      if (n > 0) { if (n === 1) this.pending.delete(c); else this.pending.set(c, n - 1); }
    }
    this.afterChange();
  }

  private pointerMove(e: PointerEvent): void {
    if (!this.board || !this.game) return;
    const c = this.countryFromEvent(e);
    if (c === this.hover) return;
    this.hover = c;
    this.canvas.classList.toggle('teg-cursor', c >= 0 && this.humanTurn() && !this.game.isOver());
    if (this.hoverQueued) return;
    this.hoverQueued = true;
    requestAnimationFrame(() => {
      this.hoverQueued = false;
      this.renderStatus();
      this.draw();
    });
  }

  private attackClick(c: number): void {
    const g = this.game!;
    const sel = this.selection;
    if (sel.attackSource < 0) {
      if (g.countries[c].owner !== g.turn) { this.toast('Select one of your own countries first.'); return; }
      if (g.countries[c].armies < 2) { this.toast(`${COUNTRIES[c].name} needs at least 2 armies to attack.`); return; }
      sel.attackSource = c;
      sel.attackTarget = -1;
      this.afterChange();
      return;
    }
    if (c === sel.attackSource) { this.clearSelection(); return; }
    if (g.countries[c].owner === g.turn) { this.toast('You cannot attack your own countries.'); return; }
    if (!g.canAttack(g.turn, sel.attackSource, c)) {
      this.toast(`${COUNTRIES[c].name} is not a neighbour you can attack from ${COUNTRIES[sel.attackSource].name}.`);
      return;
    }
    sel.attackTarget = c;
    if (this.online) {
      const src = sel.attackSource;
      this.sendMsg((m) => { const a = m._initAttack(); a.src = src; a.dst = c; });
      this.selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
      this.afterChange();
      return;
    }
    const roll = g.attack(g.turn, sel.attackSource, c);
    if (!roll) { this.afterChange(); return; }
    this.selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
    this.afterChange();
  }

  private enterRegroup(): void {
    const g = this.game;
    if (!g || !this.humanTurn() || (g.phase !== 'attack' && g.phase !== 'regroup')) { this.toast('You cannot regroup now.'); return; }
    this.clearSelection();
    this.regroupMode = true;
    this.afterChange();
    this.toast('Regroup: click the country to move armies from, then the neighbouring country to move them to.');
  }

  private regroupClick(c: number): void {
    const g = this.game!;
    const sel = this.selection;
    if (sel.regroupSource < 0) {
      if (g.countries[c].owner !== g.turn) { this.toast('Select one of your own countries.'); return; }
      if (g.countries[c].armies - g.countries[c].regrouped <= 1) { this.toast(`${COUNTRIES[c].name} has no armies free to move.`); return; }
      sel.regroupSource = c;
      this.afterChange();
      return;
    }
    if (c === sel.regroupSource) { this.clearSelection(); return; }
    if (g.countries[c].owner !== g.turn) { this.toast('You can only regroup into your own countries.'); return; }
    if (!COUNTRIES[sel.regroupSource].adj.includes(c)) { this.toast(`${COUNTRIES[c].name} is not next to ${COUNTRIES[sel.regroupSource].name}.`); return; }
    const max = g.countries[sel.regroupSource].armies - g.countries[sel.regroupSource].regrouped - 1;
    sel.regroupTarget = c;
    this.afterChange();
    void this.askRegroup(sel.regroupSource, c, max);
  }

  private async askRegroup(src: number, dst: number, max: number): Promise<void> {
    const g = this.game!;
    const input = el('input', { type: 'range', min: '0', max: String(max), value: '0' }) as HTMLInputElement;
    const value = el('strong', { textContent: '0' });
    input.addEventListener('input', () => { value.textContent = input.value; });
    const body = el('div', {},
      el('p', { textContent: `Moving armies from “${COUNTRIES[src].name}” to “${COUNTRIES[dst].name}”.` }),
      el('p', {}, 'Armies to move ', value),
      input,
      el('p', { textContent: 'You can regroup as many times as you want, as long as you do not regroup an army that was regrouped before in this turn.' }),
    );
    const v = await this.openDialog(body, true, [{ label: 'OK', value: 'ok' }, { label: 'Cancel', value: 'cancel', quiet: true }]);
    if (v === 'ok' && Number(input.value) > 0) {
      if (this.online) this.sendMsg((m) => { const x = m._initRegroup(); x.src = src; x.dst = dst; x.armies = Number(input.value); });
      else if (!g.regroup(g.turn, src, dst, Number(input.value))) this.toast('The server refused that regroup.');
    }
    this.clearSelection();
    this.regroupMode = g.phase === 'regroup';
    this.afterChange();
  }

  private askMove(): void {
    const g = this.game;
    if (!g || !g.pendingMove || !this.humanTurn() || this.moveDialog) return;
    this.moveDialog = true;
    const m = g.pendingMove;
    const input = el('input', { type: 'range', min: '0', max: String(m.max), value: '0' }) as HTMLInputElement;
    const value = el('strong', { textContent: '0' });
    input.addEventListener('input', () => { value.textContent = input.value; });
    const body = el('div', {},
      el('p', { textContent: `You conquered “${COUNTRIES[m.dst].name}” in your attack from “${COUNTRIES[m.src].name}”.` }),
      el('p', {}, 'Armies to move: ', value),
      input,
      el('p', { textContent: `The server moved 1 army to “${COUNTRIES[m.dst].name}” for you. Choose how many more armies you want to move.` }),
    );
    void this.openDialog(body, false, [{ label: 'OK', value: 'ok' }]).then(() => {
      this.moveDialog = false;
      if (this.online) this.sendMsg((x) => { const v = x._initMove(); v.src = m.src; v.dst = m.dst; v.armies = Number(input.value); });
      else g.moveAfterConquest(g.turn, Number(input.value));
      this.afterChange();
    });
  }

  private clearSelection(): void {
    this.selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
    this.regroupMode = false;
    this.afterChange();
  }

  private toast(text: string): void {
    this.bottom.replaceChildren(el('span', { textContent: text }), el('span', { className: 'teg-hint', textContent: this.hint() }));
  }

  // ---------------------------------------------------------------- actions
  private remaining(): number {
    const g = this.game;
    if (!g) return 0;
    const req = g.requiredArmies(g.turn);
    let n = 0;
    for (const v of this.pending.values()) n += v;
    return Math.max(0, req - n);
  }

  private continentHint(): string {
    const g = this.game;
    if (!g) return '';
    const r = g.reinforcement(g.turn);
    const parts: string[] = [];
    for (const c of CONTINENTS) if (r.conts & (1 << c.id)) parts.push(`${c.bonus} in ${c.name}`);
    if (r.exchange) parts.push(`${r.exchange} from cards`);
    return parts.join(', ');
  }

  private sendArmies(): void {
    const g = this.game;
    if (!g || !this.humanTurn() || !this.isPlacement()) { this.toast('It is not the moment to place armies.'); return; }
    if (this.remaining() !== 0) { this.toast(`Place ${this.remaining()} more armies first.`); return; }
    if (this.online) {
      const list = [...this.pending].filter(([, n]) => n > 0);
      this.sendMsg((m) => {
        const p = m._initPlace();
        const cs = p._initCountries(list.length), as = p._initArmies(list.length);
        list.forEach(([c, n], i) => { cs.set(i, c); as.set(i, n); });
      });
      this.pending.clear();
      this.afterChange();
      return;
    }
    if (!g.place(g.turn, this.pending)) { this.toast('The placement was refused; adjust the armies.'); return; }
    this.pending.clear();
    this.afterChange();
  }

  private getCard(): void {
    const g = this.game;
    if (!g || !this.humanTurn()) { this.toast('It is not your turn.'); return; }
    if (!g.canDrawCard(g.turn)) {
      this.toast('You can take a card after conquering a country (two countries after your 4th exchange).');
      return;
    }
    if (this.online) {
      this.sendMsg((m) => { m.drawCard = true; });
      this.toast('The server deals a card…');
      this.afterChange();
      return;
    }
    const card = g.drawCard(g.turn);
    if (card === false) { this.afterChange(); return; }
    this.afterChange();
    const body = el('div', {});
    body.append(el('p', { textContent: `You received the card of ${COUNTRIES[card].name} (${CONTINENTS[COUNTRIES[card].continent].name}).` }));
    if (g.countries[card].owner === g.turn) body.append(el('p', { textContent: 'Its country is yours, so 2 armies were placed there.' }));
    body.append(el('p', { textContent: 'You can use every card whose country you own for 2 armies (the cards remain yours but their 2 armies are used). End your turn when done.' }));
    void this.openDialog(body, true, [{ label: 'OK', value: 'ok' }]);
  }

  private endTurn(): void {
    const g = this.game;
    if (!g || !this.humanTurn()) { this.toast('It is not your turn.'); return; }
    if (!g.canEndTurn(g.turn)) { this.toast('You cannot end the turn now.'); return; }
    if (this.online) {
      this.sendMsg((m) => { m.endTurn = true; });
      this.pending.clear();
      this.afterChange();
      return;
    }
    g.endTurn(g.turn);
    this.pending.clear();
    this.afterChange();
  }

  private async surrender(): Promise<void> {
    const g = this.game;
    if (!g || !this.humanTurn()) { this.toast('It is not your turn.'); return; }
    const v = await this.openDialog(el('div', {}, el('p', { textContent: 'Leave the game? Your countries stay on the board but you are out.' })), true,
      [{ label: 'Leave', value: 'ok' }, { label: 'Stay', value: 'cancel', quiet: true }]);
    if (v !== 'ok') return;
    if (this.online) {
      this.sendMsg((m) => { m.surrender = true; });
      this.afterChange();
      return;
    }
    g.surrender(g.turn);
    this.afterChange();
  }

  // ---------------------------------------------------------------- the dialogs
  private openDialog(content: Node, closable: boolean, buttons: DialogButton[] = []): Promise<string> {
    const overlay = el('div', { className: 'teg-overlay' });
    const box = el('div', { className: 'teg-dialog' });
    box.append(content);
    const row = el('div', { className: 'teg-buttons' });
    this.dialogLayer.append(overlay);
    overlay.append(box);
    this.dialogOpen++;
    return new Promise<string>((resolve) => {
      let done = false;
      const finish = (value: string) => {
        if (done) return;
        done = true;
        window.removeEventListener('keydown', onKey);
        overlay.remove();
        this.dialogOpen = Math.max(0, this.dialogOpen - 1);
        resolve(value);
      };
      for (const b of buttons) {
        const btn = el('button', { className: b.quiet ? 'quiet' : '', textContent: b.label });
        btn.onclick = () => finish(b.value);
        row.append(btn);
      }
      if (row.childNodes.length) box.append(row);
      overlay.addEventListener('click', (e) => { if (e.target === overlay && closable) finish('cancel'); });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closable) { e.preventDefault(); finish('cancel'); }
      };
      window.addEventListener('keydown', onKey);
    });
  }

  private closeAllDialogs(): void {
    for (const o of this.dialogLayer.querySelectorAll('.teg-overlay')) o.remove();
    this.dialogOpen = 0;
  }

  private showGameOver(): void {
    const g = this.game!;
    const w = g.winner !== null ? g.players[g.winner] : null;
    const body = el('div', {});
    if (w) {
      body.append(el('p', { textContent: `${w.name} (${colorOf(w.color).name}) won after round ${g.round}.` }));
      body.append(el('p', { textContent: `Mission: ${missionName(g.winnerMission >= 0 ? g.winnerMission : w.mission)}` }));
    } else body.append(el('p', { textContent: 'The game is over.' }));
    const table = el('table');
    table.append(el('tr', {}, el('th', { textContent: 'Player' }), el('th', { textContent: 'Countries' }), el('th', { textContent: 'Armies' }), el('th', { textContent: 'Score' })));
    for (const p of g.players) {
      const dc = g.displayCountries(p.seat), da = g.displayArmies(p.seat);
      table.append(el('tr', {},
        el('td', { textContent: `${p.name} (${colorOf(p.color).name})` }),
        el('td', { textContent: dc < 0 ? '?' : String(dc) }),
        el('td', { textContent: da < 0 ? '?' : String(da) }),
        el('td', { textContent: String(p.score) })));
    }
    body.append(table);
    const buttons = this.online
      ? [{ label: 'High scores', value: 'scores', quiet: true }, { label: 'Back to lobby', value: 'lobby' }, { label: 'Close', value: 'close', quiet: true }]
      : [{ label: 'High scores', value: 'scores', quiet: true }, { label: 'New game', value: 'new' }, { label: 'Close', value: 'close', quiet: true }];
    void this.openDialog(body, true, buttons).then((v) => {
      if (v === 'new') void this.showSetup();
      else if (v === 'lobby') this.openLobby();
      else if (v === 'scores') void this.showScores();
    });
  }

  private async submitScores(): Promise<void> {
    const g = this.game;
    if (!g || this.scoresSubmitted) return;
    this.scoresSubmitted = true;
    if (this.online) return; // the module records the scores of the round it ran
    for (const p of g.players) {
      if (!p.human) continue;
      if (p.score <= 0 && p.stats.armiesKilled === 0) continue;
      try { await this.ctx.scores.submit('scores', p.score, p.name); } catch { /* offline or no server: the game still ends */ }
    }
  }

  private async showScores(): Promise<void> {
    const body = el('div', { className: 'teg-log-list' });
    body.append(el('p', { textContent: 'The shared TEG high scores (the original’s server_scores.xml):' }));
    const list = el('div', { textContent: 'Loading…' });
    body.append(list);
    void this.openDialog(body, true, [{ label: 'Close', value: 'close' }]);
    try {
      const entries = await this.ctx.scores.get('scores', 10);
      if (!entries.length) { list.textContent = 'No scores yet. Finish a game to enter one.'; return; }
      const table = el('table');
      table.append(el('tr', {}, el('th', { textContent: '#' }), el('th', { textContent: 'Player' }), el('th', { textContent: 'Score' }), el('th', { textContent: 'Date' })));
      for (const e of entries) {
        table.append(el('tr', {},
          el('td', { textContent: String(e.rank) }),
          el('td', { textContent: e.name }),
          el('td', { textContent: String(e.score) }),
          el('td', { textContent: new Date(e.time).toLocaleString() })));
      }
      list.replaceChildren(table);
    } catch {
      list.textContent = 'The score table is not reachable right now.';
    }
  }

  private showPlayers(): void {
    const g = this.game;
    if (!g) return;
    const body = el('div', {});
    const table = el('table');
    table.append(el('tr', {}, ...['Colour', 'Name', 'Countries', 'Armies', 'Cards', 'Turn', 'Score'].map((h) => el('th', { textContent: h }))));
    for (const p of g.players) {
      const visible = !g.options.fogOfWar || p.seat === this.viewSeat();
      table.append(el('tr', {},
        el('td', {}, colorOf(p.color).name),
        el('td', {}, p.name, p.eliminated ? el('span', { className: 'teg-badge', textContent: 'out' }) : ''),
        el('td', { textContent: visible ? String(g.displayCountries(p.seat)) : '?' }),
        el('td', { textContent: visible ? String(g.displayArmies(p.seat)) : '?' }),
        el('td', { textContent: String(g.cardCount(p.seat)) }),
        el('td', { textContent: p.seat === g.turn ? 'yes' : '' }),
        el('td', { textContent: String(p.score) })));
    }
    body.append(table);
    if (g.options.fogOfWar) body.append(el('p', { textContent: 'Fog of war: other players’ countries and armies are hidden unless they border one of yours.' }));
    void this.openDialog(body, true, [{ label: 'Close', value: 'close' }]);
  }

  private showMission(): void {
    const g = this.game;
    if (!g || !this.humanTurn()) { this.toast('It is not your turn.'); return; }
    if (this.online) {
      this.onlinePendingMission = true;
      this.sendMsg((m) => { m.mission = true; });
      this.toast('Asking the server for your mission…');
      return;
    }
    const m = g.requestMission(g.turn);
    this.showMissionCard(m);
    this.afterChange();
  }

  private showMissionCard(m: number): void {
    const g = this.game;
    if (!g) return;
    const body = el('div', {});
    const card = el('div', { className: 'teg-mission' });
    const img = this.assets.pix.get('objetivo.png');
    if (img) card.style.backgroundImage = `url(${img.src})`;
    card.append(el('div', { className: 'teg-mtext', textContent: missionName(m) }));
    card.append(el('div', { className: 'teg-mnote', textContent: '[Your mission]' }));
    body.append(card);
    body.append(el('p', { textContent: 'The common mission, when it is enabled, also wins: conquer 30 countries.' }));
    void this.openDialog(body, true, [{ label: 'Close', value: 'close' }]);
  }

  private showCards(): void {
    const g = this.game;
    if (!g) return;
    const body = el('div', {});
    const cards = g.cardsOf(this.humanTurn() ? g.turn : (this.humanSeats[0] ?? 0));
    if (!cards.length) body.append(el('p', { textContent: 'You have no cards. You receive one after conquering a country (two countries after your 4th exchange).' }));
    const grid = el('div');
    for (const c of cards) {
      const key = COUNTRIES[c].card === 'joker' ? 'jocker' : COUNTRIES[c].card === 'galleon' ? 'ship' : COUNTRIES[c].card;
      const t = this.assets.theme.cards[key];
      const card = el('div', { className: 'teg-card' });
      const img = t ? this.assets.images.get(t) : undefined;
      const canvas = el('canvas', { width: img?.width ?? 95, height: img?.height ?? 145 });
      const cx = canvas.getContext('2d');
      if (cx && img) cx.drawImage(img, 0, 0);
      if (cx) {
        cx.fillStyle = '#8b4513';
        cx.textAlign = 'center';
        cx.font = 'bold 12px Helvetica, Arial, sans-serif';
        cx.fillText(COUNTRIES[c].name, canvas.width / 2, this.assets.theme.cardsPosY);
        cx.font = '9px Helvetica, Arial, sans-serif';
        cx.fillText(CONTINENTS[COUNTRIES[c].continent].name, canvas.width / 2, this.assets.theme.cardsPosY + 13);
      }
      card.append(canvas);
      if (g.phase === 'card' && g.countries[c].cardOwner === g.turn && !g.countries[c].cardUsed && g.countries[c].owner === g.turn) {
        const b = el('button', { textContent: 'Put 2 armies' });
        b.onclick = () => {
          if (this.online) { this.sendMsg((m) => { m.useCard = c; }); this.closeAllDialogs(); return; }
          if (g.useCard(g.turn, c)) { this.closeAllDialogs(); this.showCards(); this.afterChange(); }
        };
        card.append(b);
      }
      grid.append(card);
    }
    body.append(grid);
    if (g.phase === 'reinforce' && this.humanTurn()) {
      body.append(el('h3', { textContent: 'Exchange three cards' }));
      const hint = el('p', { textContent: 'Select three cards: three of the same kind, or one of each kind, or any set with a joker.' });
      const selected: number[] = [];
      const exchange = el('button', { textContent: 'Exchange', disabled: true });
      const grid2 = el('div');
      for (const c of cards) {
        const b = el('button', { textContent: `${COUNTRIES[c].name} (${COUNTRIES[c].card})`, className: 'quiet' });
        b.onclick = () => {
          const i = selected.indexOf(c);
          if (i >= 0) { selected.splice(i, 1); b.style.background = ''; }
          else if (selected.length < 3) { selected.push(c); b.style.background = '#e2d1a8'; }
          exchange.disabled = selected.length !== 3;
        };
        grid2.append(b);
      }
      exchange.onclick = () => {
        if (selected.length !== 3) return;
        if (this.online) {
          this.sendMsg((m) => { const x = m._initExchange(); x.a = selected[0]; x.b = selected[1]; x.c = selected[2]; });
          this.closeAllDialogs();
          return;
        }
        if (g.exchange(g.turn, selected[0], selected[1], selected[2])) {
          this.closeAllDialogs();
          this.afterChange();
        } else this.toast('Those cards cannot be exchanged.');
      };
      body.append(hint, grid2, exchange);
    }
    void this.openDialog(body, true, [{ label: 'Close', value: 'close' }]);
  }

  private showHelp(): void {
    const body = el('div', {},
      el('p', { textContent: 'The original’s controls, with a mouse:' }),
      el('ul', {},
        el('li', { textContent: 'Placing armies: click your country to add an army, right-click (or the mouse wheel) to take one back. “Send armies” commits the whole placement. The continent bonuses must be placed in their continent.' }),
        el('li', { textContent: 'Attacking: click one of your countries with at least 2 armies, then a neighbouring enemy country. Each click is one attack; the dice are shown on the map.' }),
        el('li', { textContent: 'After a conquest, choose how many more armies to move (the server already moved one).' }),
        el('li', { textContent: 'Regroup: click your country, then a neighbouring country of yours, and choose the armies (you cannot move the same armies twice in a turn).' }),
        el('li', { textContent: 'Get card: after conquering at least one country (two after the fourth exchange) you may take one card. Then you may put 2 armies on each card’s country you own.' }),
        el('li', { textContent: 'End turn: ends the attack phase. View → Mission shows your mission; View → Cards shows your cards.' }),
      ),
      el('p', { textContent: 'Keys: Esc cancels the selection or closes a dialog; Enter sends the armies in a placement; R regroups; C takes a card; E ends the turn; M shows the mission; P the players; K the cards. The robot plays after 0.36 s per action.' }),
      el('p', { textContent: 'Online: the server decides the dice, the cards, the turn order and the winner. A player who leaves their last country is out; if one player remains, or a mission is accomplished, the round ends.' }),
    );
    void this.openDialog(body, true, [{ label: 'Close', value: 'close' }]);
  }

  private showAbout(): void {
    const body = el('div', {},
      el('p', { textContent: 'Tenés Empanadas Graciela 0.13.0, by Ricardo Quesada and the TEG contributors; artwork by Wolfgang Morawetz. This is a browser port of the original C++ client and server, under the GNU General Public License version 2 only (see the game’s README and LICENSE.md).' }),
      el('p', { textContent: 'The rules, the 50 countries, the map, the cards and the robot are the original’s. The browser UI, the online server module and the tests are new in this port.' }),
      el('p', { textContent: 'The original’s program uses a world map; “Tenés Empanadas Graciela” is the Argentine board game’s TEG, but the software has always shipped this Risk-like world.' }),
    );
    void this.openDialog(body, true, [{ label: 'Close', value: 'close' }]);
  }

  private key(e: KeyboardEvent): void {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
    if (this.dialogOpen) return;
    if (!this.game || this.game.isOver()) return;
    if (e.key === 'Escape') {
      if (this.selection.attackSource >= 0 || this.selection.regroupSource >= 0 || this.regroupMode) { e.preventDefault(); this.clearSelection(); }
      return;
    }
    if (!this.humanTurn()) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.isPlacement()) this.sendArmies();
      else if (this.game.canEndTurn(this.game.turn)) this.endTurn();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key.toLowerCase()) {
      case 'r': e.preventDefault(); this.enterRegroup(); break;
      case 'c': e.preventDefault(); this.getCard(); break;
      case 'e': e.preventDefault(); this.endTurn(); break;
      case 'm': e.preventDefault(); this.showMission(); break;
      case 'p': e.preventDefault(); this.showPlayers(); break;
      case 'k': e.preventDefault(); this.showCards(); break;
      default:
        if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
    }
  }

  // ---------------------------------------------------------------- online
  private sendMsg(fill: (m: Msg) => void): void {
    this.ctx.rooms.send(packGame(Msg, fill), 'server');
  }
  private sendSnapshot(): void {
    this.sendMsg((m) => { m.snapshot = true; });
  }
  private packRules(): Uint8Array {
    return packGame(ProtoOptions, (o) => {
      o.secretMissions = this.onlineRules.secretMissions;
      o.commonMission = this.onlineRules.commonMission;
      o.fogOfWar = this.onlineRules.fogOfWar;
      o.startingArmies = this.onlineRules.startArmies;
      o.secondArmies = this.onlineRules.secondArmies;
    });
  }

  private async showOnline(): Promise<void> {
    if (!this.board) return;
    if (this.online) {
      // already in a room: the lobby shows it, so the room can be left or a new round started
      this.openLobby();
      return;
    }
    if (this.game && !this.game.isOver() && !window.confirm('Leave this game and play online?')) return;
    const secret = el('input', { type: 'checkbox' }) as HTMLInputElement;
    secret.checked = this.onlineRules.secretMissions;
    const common = el('input', { type: 'checkbox' }) as HTMLInputElement;
    common.checked = this.onlineRules.commonMission;
    const fog = el('input', { type: 'checkbox' }) as HTMLInputElement;
    fog.checked = this.onlineRules.fogOfWar;
    const body = el('div', {},
      el('p', { textContent: 'The host’s rules for a new room. Every player sees the same board; the server rolls the dice and deals the cards.' }),
      el('label', { className: 'teg-setup-row' }, secret, el('span', { textContent: 'Secret missions (otherwise conquer the world)' })),
      el('label', { className: 'teg-setup-row' }, common, el('span', { textContent: 'The common mission: 30 countries also wins' })),
      el('label', { className: 'teg-setup-row' }, fog, el('span', { textContent: 'Fog of war' })),
      el('p', { textContent: 'The room takes two to six players. The first placement is 5 armies, the second 3.' }),
    );
    const answer = await this.openDialog(body, true, [{ label: 'Open lobby', value: 'ok' }, { label: 'Cancel', value: 'cancel', quiet: true }]);
    if (answer !== 'ok') return;
    this.onlineRules = { ...this.onlineRules, secretMissions: secret.checked, commonMission: common.checked, fogOfWar: fog.checked };
    this.openLobby();
  }

  private async openLobby(): Promise<void> {
    if (this.lobbyHost) return;
    const host = el('div', { className: 'teg-online-lobby' });
    this.lobbyHost = host;
    this.root.append(host);
    this.welcome.style.display = 'none';
    try {
      const round = await this.ctx.lobby(host, {
        title: 'TEG online',
        seats: { min: 2, max: 6, default: 2 },
        seatNames: PLAYER_COLORS.map((c) => c.name[0].toUpperCase() + c.name.slice(1)),
        options: () => this.packRules(),
      });
      host.remove();
      this.lobbyHost = null;
      this.beginOnline(round);
    } catch (e) {
      host.remove();
      this.lobbyHost = null;
      if (this.game && !this.online) this.afterChange();
      else this.showWelcome();
      if (e instanceof Error && e.message !== 'cancelled') this.toast(e.message);
    }
  }

  private beginOnline(round: RoundStart): void {
    for (const off of this.onlineOff.splice(0)) off();
    const seats = [...round.seats].sort((a, b) => a.seat - b.seat);
    this.onlineSeatIds = seats.map((s) => s.seat);
    const setups: PlayerSetup[] = seats.map((s, i) => ({ name: s.name, color: i % 6, human: true }));
    const seed = Number(BigInt.asUintN(32, round.seed));
    this.game = TegGame.create(seed, setups, this.onlineRules);
    this.game.log.length = 0;
    this.online = true;
    this.mySeat = this.onlineSeatIds.indexOf(round.you);
    this.humanSeats = [round.you];
    this.robots.clear();
    this.mode = 'local';
    this.pending.clear();
    this.selection = { attackSource: -1, attackTarget: -1, regroupSource: -1, regroupTarget: -1 };
    this.shownLog = 0;
    this.logEl.replaceChildren();
    this.lastKey = '';
    this.lastAi = 0;
    this.endShown = false;
    this.scoresSubmitted = true;
    this.onlinePendingMission = false;
    this.welcome.style.display = 'none';
    this.chatBar.hidden = false;
    this.onlineOff.push(this.ctx.rooms.on('message', (msg) => this.onlineMessage(msg.data)));
    this.onlineOff.push(this.ctx.rooms.on('started', (r) => {
      if (r.rejoined) {
        this.onlinePendingMission = false;
        this.sendSnapshot();
      }
    }));
    this.onlineOff.push(this.ctx.rooms.on('finished', (f) => this.onlineFinished(f.results)));
    this.onlineOff.push(this.ctx.rooms.on('closed', (c) => {
      this.online = false;
        this.toast(`The room was closed: ${c.reason}`);
      this.showWelcome();
    }));
    this.sendSnapshot();
    this.renderStatus();
    this.updateControls();
    this.toast('Waiting for the server’s first state…');
  }

  private onlineMessage(data: Uint8Array): void {
    let m: Msg;
    try { m = unpackGame(Msg, data); } catch { return; }
    if (m.which() === Msg_Which.STATE) this.applyOnlineState(m.state);
    else if (m.which() === Msg_Which.CHAT) {
      const c = m.chat;
      const local = this.onlineSeatIds.indexOf(c.seat);
      const name = this.game?.players.find((p) => p.seat === local)?.name ?? `Player ${c.seat + 1}`;
      if (this.game) {
        this.game.log.push({ kind: 'chat', text: `${name}: ${c.text}`, seat: local });
        this.renderLog();
      }
    }
  }

  private applyOnlineState(st: ProtoState): void {
    if (!this.game) return;
    const dmap = new Map<number, number>();
    this.onlineSeatIds.forEach((s, i) => dmap.set(s, i));
    const dense = (s: number) => (s < 0 ? -1 : dmap.get(s) ?? -1);
    const countries = [];
    for (let i = 0; i < st.countries.length; i++) {
      const c = st.countries.get(i);
      countries.push({ id: i, owner: dense(c.owner), armies: c.armies, regrouped: c.regrouped, cardOwner: dense(c.cardOwner), cardUsed: c.cardUsed });
    }
    const players = [];
    for (let i = 0; i < st.players.length; i++) {
      const p = st.players.get(i);
      players.push({
        seat: dense(p.seat), name: p.name, color: p.color, active: p.active, eliminated: p.eliminated,
        countries: p.countries, armies: p.armies, cards: p.cards, mission: p.mission,
        exchanges: p.exchanges, hasExchanged: p.hasExchanged, conquered: p.conquered, score: p.score,
      });
    }
    const ev = st.event;
    const event = ev.seq > 0 ? {
      seq: ev.seq, kind: eventKindName(ev.kind), text: ev.text, seat: dense(ev.seat), src: ev.src, dst: ev.dst,
      srcDice: Array.from({ length: ev.srcDice.length }, (_, i) => ev.srcDice.get(i) as number),
      dstDice: Array.from({ length: ev.dstDice.length }, (_, i) => ev.dstDice.get(i) as number),
      card: ev.card, amount: ev.amount,
    } : null;
    const snapshot: Snapshot = {
      countries, players, turn: dense(st.turn), phase: phaseName(st.phase), round: st.round,
      roundStarter: dense(st.roundStarter),
      pending: st.pendingSrc >= 0 ? { src: st.pendingSrc, dst: st.pendingDst, max: st.pendingMax } : null,
      winner: dense(st.winner), winnerMission: st.winnerMission, event,
      options: {
        secretMissions: st.options.secretMissions, commonMission: st.options.commonMission,
        fogOfWar: st.options.fogOfWar, startArmies: st.options.startingArmies, secondArmies: st.options.secondArmies,
      },
    };
    this.game.applySnapshot(snapshot);
    this.onlineRules = { ...snapshot.options };
    this.afterChange();
    if (this.onlinePendingMission) {
      const p = this.game.player(this.mySeat);
      if (p.mission >= 0) {
        this.onlinePendingMission = false;
        this.showMissionCard(p.mission);
      }
    }
  }

  private onlineFinished(data: Uint8Array): void {
    if (!this.game) return;
    let r: ProtoResults;
    try { r = unpackGame(ProtoResults, data); } catch { return; }
    this.endShown = true;
    this.closeAllDialogs();
    this.game.phase = 'over';
    const wi = this.onlineSeatIds.indexOf(r.winner);
    this.game.winner = r.winner >= 0 && wi >= 0 ? wi : null;
    this.game.winnerMission = r.mission;
    const lines: string[] = [];
    const reason = r.reason;
    if (this.game.winner !== null) lines.push(`${this.game.player(this.game.winner).name} won.`);
    else if (reason === ProtoReason.TIMEOUT) lines.push('The round ended: nobody moved in time.');
    else lines.push('The round is over.');
    if (reason === ProtoReason.LEFT) lines.push('A player left the room.');
    if (reason === ProtoReason.TIMEOUT) lines.push('The server stopped the round after a long pause.');
    if (this.game.winner !== null) lines.push(`Mission: ${missionName(this.game.winnerMission >= 0 ? this.game.winnerMission : 0)}`);
    const table = el('table');
    table.append(el('tr', {}, el('th', { textContent: 'Player' }), el('th', { textContent: 'Score' }), el('th', { textContent: 'Countries' }), el('th', { textContent: 'Armies' })));
    for (let i = 0; i < r.scores.length; i++) {
      const s = r.scores.get(i);
      const p = this.game.players[this.onlineSeatIds.indexOf(s.seat)];
      table.append(el('tr', {}, el('td', { textContent: p?.name ?? `Seat ${s.seat + 1}` }),
        el('td', { textContent: String(s.score) }), el('td', { textContent: String(s.countries) }), el('td', { textContent: String(s.armies) })));
    }
    this.afterChange();
    const body = el('div', {}, ...lines.map((t) => el('p', { textContent: t })), table);
    void this.openDialog(body, true, [
      { label: 'High scores', value: 'scores', quiet: true },
      { label: 'Back to lobby', value: 'lobby' },
      { label: 'Close', value: 'close', quiet: true },
    ]).then((v) => {
      if (v === 'lobby') this.openLobby();
      else if (v === 'scores') void this.showScores();
    });
  }
}
