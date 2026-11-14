// PokerTH 1.1.2 in the browser: the start window (src/gui/qt/startwindow/), the local game settings dialog
// (newgamedialog.ui, changecompleteblindsdialog.ui), the game table (./table.ts) and online play (./online.ts).
// AGPL-3.0-or-later, see ../LICENSE.md.
import type { GameContext, StartGame } from '../../../src/sdk/index.ts';
import { allImageUrls, miscUrl } from './assets.ts';
import {
  DOUBLE_BLINDS, MANUAL_BLINDS_ORDER, AFTERMB_DOUBLE_BLINDS, AFTERMB_RAISE_ABOUT, AFTERMB_STAY_AT_LAST_BLIND,
  PLAYER_TYPE_COMPUTER, PLAYER_TYPE_HUMAN, RAISE_ON_HANDNUMBER, RAISE_ON_MINUTES, defaultGameData, type GameData, type PlayerData,
} from './engine/defs.ts';
import { Game } from './engine/game.ts';
import { Rng } from './engine/rng.ts';
import { startOnline } from './online.ts';
import { Sound } from './sound.ts';
import { GameTable, applyHumanAction, type TableDriver } from './table.ts';
import { Config, loadConfig, saveConfig } from './config.ts';

export const start: StartGame = async (host, ctx) => {
  host.style.position = 'relative';
  host.style.overflow = 'hidden';
  host.style.background = '#000';
  const app = new App(host, ctx);
  await app.init();
  return { stop: () => app.destroy() };
};

const START_CSS = `
.pth-start { position: absolute; left: 0; top: 0; width: 450px; height: 350px; transform-origin: 0 0;
  background: #000 url("${miscUrl('startwindowbg10_desktop')}") no-repeat; font: bold 12px sans-serif; user-select: none; }
.pth-start .bar { position: absolute; left: 0; top: 0; width: 450px; height: 21px; background: #4f4f4f; color: #ffcc33; font: 12px sans-serif; display: flex; }
.pth-start .bar div { padding: 3px 10px; cursor: pointer; }
.pth-start .bar div:hover { background: #666; }
.pth-start button.big { position: absolute; left: 134px; width: 182px; height: 40px; background: linear-gradient(#6e6e6e, #4a4a4a);
  border: 1px solid #2f2f2f; border-radius: 3px; color: #ffcc33; font: bold 12px sans-serif; text-align: left; padding-left: 38px; cursor: pointer; }
.pth-start button.big:hover { background: linear-gradient(#7e7e7e, #5a5a5a); }
.pth-start .dialog, .pth-dialog { background: #efefef; color: #000; font: 12px sans-serif; padding: 10px 12px; border: 1px solid #888; }
.pth-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.35); z-index: 30; }
.pth-dialog h3 { font-size: 12px; margin: 0 0 6px; font-weight: normal; }
.pth-dialog fieldset { border: 1px solid #bbb; margin: 6px 0; padding: 4px 8px; }
.pth-dialog .row { display: flex; justify-content: space-between; align-items: center; margin: 5px 0; gap: 12px; }
.pth-dialog input[type=number] { width: 84px; } .pth-dialog input[type=text] { width: 140px; }
.pth-dialog .buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.pth-dialog button { min-width: 80px; padding: 3px 8px; }
`;

class App {
  private ac = new AbortController();
  private signal: AbortSignal;
  private sound: Sound;
  private config: Config = new Config();
  private table: GameTable | null = null;
  private tableHost: HTMLDivElement | null = null;
  private startWin: HTMLDivElement | null = null;
  private gameNum = 0;
  private stopOnline: (() => void) | null = null;

  constructor(private host: HTMLElement, private ctx: GameContext) {
    this.signal = AbortSignal.any([ctx.signal, this.ac.signal]);
    this.sound = new Sound(ctx.audio, this.signal);
    const style = document.createElement('style');
    style.textContent = START_CSS;
    host.appendChild(style);
    new ResizeObserver(() => this.fit()).observe(host);
  }

  async init(): Promise<void> {
    // the settings file comes from the server; without it (offline) the original's defaults
    this.config = await Promise.race([
      loadConfig(this.ctx.storage).catch(() => new Config()),
      new Promise<Config>((r) => setTimeout(() => r(new Config()), 4000)),
    ]);
    this.sound.enabled = this.config.playSoundEffects;
    // preload the pictures, so the table does not appear piece by piece
    await Promise.all(allImageUrls().map((u) => new Promise<void>((r) => {
      const i = new Image();
      i.onload = i.onerror = () => r();
      i.src = u;
    })));
    this.sound.preload(['fold', 'check', 'call', 'bet', 'raise', 'allin', 'dealtwocards', 'yourturn']);
    this.showStartWindow();
  }

  destroy(): void {
    this.stopOnline?.();
    this.ac.abort();
    this.table?.stopTimer();
  }

  private fit(): void {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (this.table) this.table.fit(w, h);
    if (this.startWin) {
      const s = Math.min(w / 450, h / 350);
      this.startWin.style.transform = `translate(${(w - 450 * s) / 2}px, ${(h - 350 * s) / 2}px) scale(${s})`;
    }
  }

  private dropTable(): void {
    this.stopOnline?.();
    this.stopOnline = null;
    this.table?.stopTimer();
    this.tableHost?.remove();
    this.table = null;
    this.tableHost = null;
  }

  // ---- the start window (startwindowimpl.cpp)
  showStartWindow(): void {
    this.dropTable();
    this.startWin?.remove();
    const w = (this.startWin = document.createElement('div'));
    w.className = 'pth-start';
    this.host.appendChild(w);
    const bar = document.createElement('div');
    bar.className = 'bar';
    w.appendChild(bar);
    const quit = document.createElement('div');
    quit.textContent = 'Quit';
    quit.onclick = () => this.ctx.exit();
    const settings = document.createElement('div');
    settings.textContent = 'Settings';
    settings.onclick = () => this.settingsDialog();
    bar.append(settings, quit);
    const buttons: [string, () => void][] = [
      ['1  Start Local Game', () => this.newGameDialog()],
      ['2  Internet Game', () => void this.internetGame()],
    ];
    buttons.forEach(([t, fn], i) => {
      const b = document.createElement('button');
      b.className = 'big';
      b.style.top = `${73 + 46 * i}px`;
      b.textContent = t;
      b.onclick = fn;
      w.appendChild(b);
    });
    this.host.ownerDocument.addEventListener('keydown', (e) => {
      if (!this.startWin || this.host.querySelector('.pth-overlay')) return;
      if (e.key === '1' || (e.key === 'n' && e.ctrlKey)) {
        e.preventDefault();
        this.newGameDialog();
      } else if (e.key === '2') {
        void this.internetGame();
      }
    }, { signal: this.signal });
    this.fit();
  }

  private dialog(build: (d: HTMLDivElement, close: () => void) => void): void {
    const o = document.createElement('div');
    o.className = 'pth-overlay';
    const d = document.createElement('div');
    d.className = 'pth-dialog';
    o.appendChild(d);
    this.host.appendChild(o);
    build(d, () => o.remove());
  }

  private static numberRow(parent: HTMLElement, label: string, value: number, min: number, max: number, prefix = ''): HTMLInputElement {
    const r = document.createElement('div');
    r.className = 'row';
    const l = document.createElement('label');
    l.textContent = label;
    const i = document.createElement('input');
    i.type = 'number';
    i.min = String(min);
    i.max = String(max);
    i.value = String(value);
    if (prefix) i.title = prefix;
    r.append(l, i);
    parent.appendChild(r);
    return i;
  }

  private static clampInput(i: HTMLInputElement): number {
    const v = Math.trunc(Number(i.value));
    return Math.min(Number(i.max), Math.max(Number(i.min), Number.isFinite(v) ? v : Number(i.min)));
  }

  /** the blinds part of changecompleteblindsdialog.ui; returns a reader */
  static blindsFields(d: HTMLElement, c: Config, net: boolean): () => Partial<GameData> {
    const fs = document.createElement('fieldset');
    const lg = document.createElement('legend');
    lg.textContent = 'Blinds';
    fs.appendChild(lg);
    d.appendChild(fs);
    const sb = App.numberRow(fs, 'First small blind: $', c.firstSmallBlind, 1, 20000);
    const mode = document.createElement('select');
    mode.innerHTML = '<option value="h">Raise blinds every … hands</option><option value="m">Raise blinds every … minutes</option>';
    mode.value = c.raiseOnMinutes ? 'm' : 'h';
    fs.appendChild(mode);
    const every = App.numberRow(fs, 'Every:', c.raiseOnMinutes ? c.raiseEveryMinutes : c.raiseEveryHands, 1, 1000);
    mode.onchange = () => {
      every.value = String(mode.value === 'm' ? c.raiseEveryMinutes : c.raiseEveryHands);
    };
    const how = document.createElement('select');
    how.innerHTML = '<option value="d">Always double blinds</option><option value="m">Manual blinds order</option>';
    how.value = c.manualBlinds.length && !c.alwaysDoubleBlinds ? 'm' : 'd';
    fs.appendChild(how);
    const list = document.createElement('input');
    list.type = 'text';
    list.placeholder = 'e.g. 20 40 60 100';
    list.value = c.manualBlinds.join(' ');
    const after = document.createElement('select');
    after.innerHTML = '<option value="d">After this: always double blinds</option><option value="r">After this: always raise about …</option><option value="s">After this: stay at last blind</option>';
    after.value = c.afterMB;
    const raiseAbout = App.numberRow(fs, 'Raise about: $', c.afterMBRaiseValue, 1, 100000);
    const manual = document.createElement('div');
    manual.append(list, after);
    fs.insertBefore(manual, raiseAbout.parentElement);
    const show = () => {
      manual.style.display = raiseAbout.parentElement!.style.display = how.value === 'm' ? '' : 'none';
    };
    how.onchange = show;
    show();
    void net;
    return () => {
      const minutes = mode.value === 'm';
      const n = App.clampInput(every);
      c.firstSmallBlind = App.clampInput(sb);
      c.raiseOnMinutes = minutes;
      if (minutes) c.raiseEveryMinutes = n;
      else c.raiseEveryHands = n;
      c.alwaysDoubleBlinds = how.value === 'd';
      c.manualBlinds = list.value.split(/[^0-9]+/).filter(Boolean).map(Number).filter((x) => x > 0).sort((a, b) => a - b).slice(0, 30);
      c.afterMB = after.value as 'd' | 'r' | 's';
      c.afterMBRaiseValue = App.clampInput(raiseAbout);
      return {
        firstSmallBlind: c.firstSmallBlind,
        raiseIntervalMode: minutes ? RAISE_ON_MINUTES : RAISE_ON_HANDNUMBER,
        raiseSmallBlindEveryHandsValue: c.raiseEveryHands,
        raiseSmallBlindEveryMinutesValue: c.raiseEveryMinutes,
        raiseMode: c.alwaysDoubleBlinds ? DOUBLE_BLINDS : MANUAL_BLINDS_ORDER,
        manualBlindsList: c.alwaysDoubleBlinds ? [] : c.manualBlinds,
        afterManualBlindsMode: c.afterMB === 'd' ? AFTERMB_DOUBLE_BLINDS : c.afterMB === 'r' ? AFTERMB_RAISE_ABOUT : AFTERMB_STAY_AT_LAST_BLIND,
        afterMBAlwaysRaiseValue: c.afterMBRaiseValue,
      };
    };
  }

  // ---- "Local Game Settings" (newgamedialog.ui)
  newGameDialog(): void {
    const c = this.config;
    this.dialog((d, close) => {
      const h = document.createElement('h3');
      h.textContent = 'Local Game Settings';
      d.appendChild(h);
      const players = App.numberRow(d, 'Number of players:', c.numberOfPlayers, 2, 10);
      const cash = App.numberRow(d, 'Start Cash: $', c.startCash, 1000, 1000000);
      const blinds = App.blindsFields(d, c, false);
      const speed = App.numberRow(d, 'Game Speed:', c.gameSpeed, 1, 11);
      const bs = document.createElement('div');
      bs.className = 'buttons';
      const cancel = document.createElement('button');
      cancel.textContent = 'Cancel';
      cancel.onclick = close;
      const ok = document.createElement('button');
      ok.textContent = 'OK';
      ok.onclick = () => {
        c.numberOfPlayers = App.clampInput(players);
        c.startCash = App.clampInput(cash);
        c.gameSpeed = App.clampInput(speed);
        const gd = { ...defaultGameData(), ...blinds() };
        gd.maxNumberOfPlayers = c.numberOfPlayers;
        gd.startMoney = c.startCash;
        gd.guiSpeed = c.gameSpeed;
        void saveConfig(this.ctx.storage, c).catch(() => {});
        close();
        this.startLocalGame(gd);
      };
      bs.append(cancel, ok);
      d.appendChild(bs);
      ok.focus();
    });
  }

  private settingsDialog(): void {
    const c = this.config;
    this.dialog((d, close) => {
      const h = document.createElement('h3');
      h.textContent = 'Settings';
      d.appendChild(h);
      const r = document.createElement('div');
      r.className = 'row';
      const l = document.createElement('label');
      l.textContent = 'Nick:';
      const name = document.createElement('input');
      name.type = 'text';
      name.maxLength = 20;
      name.value = c.myName;
      r.append(l, name);
      d.appendChild(r);
      const r2 = document.createElement('div');
      r2.className = 'row';
      const snd = document.createElement('input');
      snd.type = 'checkbox';
      snd.checked = c.playSoundEffects;
      const l2 = document.createElement('label');
      l2.append(snd, ' Play sound effects');
      r2.appendChild(l2);
      d.appendChild(r2);
      const bs = document.createElement('div');
      bs.className = 'buttons';
      const ok = document.createElement('button');
      ok.textContent = 'OK';
      ok.onclick = () => {
        c.myName = name.value.trim().slice(0, 20) || 'Human Player';
        c.playSoundEffects = snd.checked;
        this.sound.enabled = snd.checked;
        void saveConfig(this.ctx.storage, c).catch(() => {});
        close();
      };
      const cancel = document.createElement('button');
      cancel.textContent = 'Cancel';
      cancel.onclick = close;
      bs.append(cancel, ok);
      d.appendChild(bs);
    });
  }

  makeTable(title: string, speed: number): GameTable {
    this.dropTable();
    this.startWin?.remove();
    this.startWin = null;
    const th = (this.tableHost = document.createElement('div'));
    th.style.position = 'absolute';
    th.style.inset = '0';
    this.host.appendChild(th);
    this.table = new GameTable({ host: th, signal: this.signal, sound: this.sound, title, speed });
    // for the end-to-end test (games/pokerth/e2e.mjs): the hand number and everyone's cash
    const t = this.table;
    (window as unknown as { __pokerth: unknown }).__pokerth = {
      state: () => {
        try {
          const g = t.game;
          return { hand: g.getCurrentHandID(), history: t.history };
        } catch {
          return null;
        }
      },
    };
    this.fit();
    return this.table;
  }

  // ---- startWindowImpl::startNewLocalGame + Session::startLocalGame
  startLocalGame(gd: GameData): void {
    const table = this.makeTable('PokerTH', gd.guiSpeed);
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    const rng = new Rng(seed);
    const n = gd.maxNumberOfPlayers;
    const dealer = rng.getRand(0, n - 1);
    const pdl: PlayerData[] = [];
    for (let i = 0; i < n; i++) {
      pdl.push({ uniqueId: i, type: i === 0 ? PLAYER_TYPE_HUMAN : PLAYER_TYPE_COMPUTER, name: i === 0 ? this.config.myName : `Player ${i}`, avatar: '', startCash: -1 });
    }
    const driver: TableDriver = {
      online: false,
      otherPlayersTurn: (hand) => hand.getCurrentBeRo().nextPlayer(),
      myAction: (hand, a) => {
        applyHumanAction(hand, hand.getSeatsList()[0], a);
        table.nextPlayerAnimation();
      },
      boardCards: (_h, _r, cont) => cont(),
      holeCards: (_h, cont) => cont(),
      nextHand: () => table.startNewHand(),
      newGame: () => this.newGameDialog(),
      leave: () => this.showStartWindow(),
    };
    table.driver = driver;
    table.setOnline(false);
    const game = new Game(table, pdl, gd, { numberOfPlayers: n, startDealerPlayerId: dealer }, ++this.gameNum, { rng });
    table.game = game;
    this.sound.newGameStarts();
    game.initHand();
    game.startHand();
  }

  private async internetGame(): Promise<void> {
    this.startWin?.remove();
    this.startWin = null;
    const lobbyHost = document.createElement('div');
    lobbyHost.style.position = 'absolute';
    lobbyHost.style.inset = '0';
    this.host.appendChild(lobbyHost);
    try {
      this.stopOnline = await startOnline({
        ctx: this.ctx,
        lobbyHost,
        config: this.config,
        makeTable: (title, speed) => this.makeTable(title, speed),
        back: () => this.showStartWindow(),
        nextGameNum: () => ++this.gameNum,
        sound: this.sound,
        blindsFields: App.blindsFields,
      });
    } catch {
      this.showStartWindow();
    } finally {
      lobbyHost.remove();
    }
  }
}
