// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The game on the website: the title and its menus, a local match (one to four players at one keyboard, the others
// played by the computer), an online match through a website room, the pause, the score boards. The rules are
// sim.ts (the original's), the pictures render.ts, the sounds sound.ts, online play net.ts.
import { PixelScreen, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import { Brain } from './ai.ts';
import { FPS, MapEntry, sortMaps, type Keys } from './sim.ts';
import { Match } from './match.ts';
import { Online, packOptions, type RoomOptions } from './net.ts';
import { BLOB_COLORS, BLOB_NAMES, EXTRA_TITLES, Renderer, SCREEN_H, SCREEN_W, mapTitle } from './render.ts';
import { Sound } from './sound.ts';
import { Sprites } from './sprites.ts';

const MAP_FILES = import.meta.glob('../maps/*.map', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** ClanBomber's keymaps (README): arrows + Enter, W A S D + Tab, I J K L + Space, the number pad + 0 */
const KEYMAPS: Record<keyof Keys, string[]>[] = [
  { left: ['ArrowLeft'], up: ['ArrowUp'], right: ['ArrowRight'], down: ['ArrowDown'], bomb: ['Enter', 'NumpadEnter'] },
  { left: ['KeyA'], up: ['KeyW'], right: ['KeyD'], down: ['KeyS'], bomb: ['Tab'] },
  { left: ['KeyJ'], up: ['KeyI'], right: ['KeyL'], down: ['KeyK'], bomb: ['Space'] },
  { left: ['Numpad4'], up: ['Numpad8'], right: ['Numpad6'], down: ['Numpad5'], bomb: ['Numpad0'] },
];
const GAME_KEYS = new Set(KEYMAPS.flatMap((m) => Object.values(m).flat()).concat(['Escape', 'KeyP', 'Space', 'Enter']));
const STEP_MS = 1000 / FPS;

type State = 'loading' | 'title' | 'setup' | 'controls' | 'about' | 'local' | 'lobby' | 'online';

interface Settings {
  humans: number;
  bots: number;
  points: number;
  time: number;
  random: boolean;
  startMap: number;
}

export class App {
  private readonly ctx: GameContext;
  private readonly host: HTMLElement;
  private readonly screen: PixelScreen;
  private readonly g: CanvasRenderingContext2D;
  private sp!: Sprites;
  private r!: Renderer;
  private readonly sound: Sound;
  private readonly maps: MapEntry[];
  private state: State = 'loading';
  private menu = 0;
  private settings: Settings = { humans: 1, bots: 3, points: 5, time: 90, random: false, startMap: 0 };
  private readonly held = new Set<string>();
  /** a bomb key went down since the last frame, by keymap */
  private readonly bombLatch = [false, false, false, false];
  private match: Match | null = null;
  private brains: (Brain | null)[] = [];
  private names: string[] = [];
  private paused = false;
  private acc = 0;
  private over = false;
  private online: Online | null = null;
  private offs: (() => void)[] = [];
  private lobbyBox: HTMLDivElement | null = null;
  private now = 0;
  private frozen = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.host = host;
    this.screen = new PixelScreen(host, { width: SCREEN_W, height: SCREEN_H, background: '#0d0a12' }, ctx.signal);
    this.g = this.screen.ctx;
    this.sound = new Sound(ctx.audio);
    this.maps = sortMaps(Object.entries(MAP_FILES).map(([path, text]) => new MapEntry(path.replace(/^.*\//, '').replace(/\.map$/, ''), text)));
    (window as unknown as { __bomberslop?: unknown }).__bomberslop = {
      state: () => this.state,
      info: () => this.info(),
      online: () => this.onlineInfo(),
      // for the screenshots: hold a local match still for a moment (no overlay, unlike P)
      freeze: (on: boolean) => { this.frozen = on; },
    };
  }

  async start(): Promise<void> {
    this.sp = await Sprites.load();
    this.r = new Renderer(this.sp);
    void this.sound.load(this.ctx.signal);
    this.bindKeys();
    this.host.tabIndex = 0;
    this.host.focus();
    this.toTitle();
    this.ctx.frame((t, dt) => this.frame(t, dt));
  }

  stop(): void {
    for (const off of this.offs) off();
    this.offs = [];
    this.lobbyBox?.remove();
    if (this.online) this.ctx.rooms.leave();
    delete (window as unknown as { __bomberslop?: unknown }).__bomberslop;
  }

  // ---------------------------------------------------------------- keys

  private bindKeys(): void {
    const signal = this.ctx.signal;
    window.addEventListener('keydown', (e) => {
      if (this.state === 'lobby') return; // the lobby's fields take the keys
      if (GAME_KEYS.has(e.code) || e.code.startsWith('Arrow') || e.code.startsWith('Numpad')) e.preventDefault();
      if (!e.repeat) {
        KEYMAPS.forEach((m, i) => {
          if (m.bomb.includes(e.code)) this.bombLatch[i] = true;
        });
        this.key(e.code);
      }
      this.held.add(e.code);
    }, { signal });
    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    }, { signal });
    window.addEventListener('blur', () => this.held.clear(), { signal });
  }

  /** the keys of keymap m now (all keymaps for the one player when there is one) */
  private keysOf(maps: number[]): Keys {
    const on = (k: keyof Keys) => maps.some((m) => KEYMAPS[m][k].some((c) => this.held.has(c)));
    const bomb = on('bomb') || maps.some((m) => this.bombLatch[m]);
    return { left: on('left'), up: on('up'), right: on('right'), down: on('down'), bomb };
  }

  private key(code: string): void {
    switch (this.state) {
      case 'title': this.menuKey(code, this.titleItems()); break;
      case 'setup': this.menuKey(code, this.setupItems()); break;
      case 'controls':
      case 'about':
        if (code === 'Escape' || code === 'Enter' || code === 'Space') {
          this.sound.play('clear');
          this.toTitle();
        }
        break;
      case 'local': this.localKey(code); break;
      case 'online': this.onlineKey(code); break;
      default: break;
    }
  }

  // ---------------------------------------------------------------- menus

  private titleItems(): MenuItem[] {
    return [
      { label: 'Local game', go: () => { this.state = 'setup'; this.menu = 0; this.sound.play('whoosh'); } },
      { label: 'Online game', go: () => void this.startOnline() },
      { label: 'Controls and extras', go: () => { this.state = 'controls'; this.sound.play('whoosh'); } },
      { label: 'About', go: () => { this.state = 'about'; this.sound.play('whoosh'); } },
      { label: 'Quit', go: () => this.ctx.exit() },
    ];
  }

  private setupItems(): MenuItem[] {
    const s = this.settings;
    const clampBots = () => {
      s.bots = Math.max(s.humans === 1 ? 1 : 0, Math.min(4 - s.humans, s.bots));
    };
    return [
      { label: `Players at this keyboard: ${s.humans}`, change: (d) => { s.humans = Math.max(1, Math.min(4, s.humans + d)); clampBots(); } },
      { label: `Computer players: ${s.bots}`, change: (d) => { s.bots += d; clampBots(); } },
      { label: `Points to win: ${s.points}`, change: (d) => { s.points = Math.max(1, Math.min(10, s.points + d)); } },
      { label: `Round time: ${s.time} s`, change: (d) => { s.time = Math.max(30, Math.min(300, s.time + d * 15)); } },
      { label: `Maps: ${s.random ? 'at random' : 'in turn'}`, change: () => { s.random = !s.random; } },
      { label: `First map: ${mapTitle(this.maps[s.startMap].name)}`, change: (d) => { s.startMap = (s.startMap + d + this.maps.length) % this.maps.length; } },
      { label: 'Start!', go: () => this.startLocal() },
      { label: 'Back', go: () => this.toTitle() },
    ];
  }

  private menuKey(code: string, items: MenuItem[]): void {
    if (code === 'ArrowUp' || code === 'KeyW') {
      this.menu = (this.menu + items.length - 1) % items.length;
      this.sound.play('break');
    } else if (code === 'ArrowDown' || code === 'KeyS') {
      this.menu = (this.menu + 1) % items.length;
      this.sound.play('break');
    } else if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD') {
      const it = items[this.menu];
      if (it?.change) {
        it.change(code === 'ArrowLeft' || code === 'KeyA' ? -1 : 1);
        this.sound.play('break');
      }
    } else if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') {
      const it = items[this.menu];
      if (it?.go) {
        this.sound.play('clear');
        it.go();
      } else if (it?.change) {
        it.change(1);
        this.sound.play('break');
      }
    } else if (code === 'Escape') {
      if (this.state === 'setup') {
        this.sound.play('clear');
        this.toTitle();
      }
    }
  }

  private toTitle(): void {
    this.state = 'title';
    this.menu = 0;
    this.match = null;
    this.paused = false;
    this.sound.play('whoosh');
  }

  // ---------------------------------------------------------------- a local match

  private startLocal(): void {
    const s = this.settings;
    const players = s.humans + s.bots;
    const seed = ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 1;
    this.match = new Match(this.maps, players, seed, {
      points_to_win: s.points, round_time: s.time, random_map_order: s.random ? 1 : 0, start_map: s.startMap,
    });
    this.brains = Array.from({ length: players }, (_, i) => (i < s.humans ? null : new Brain(i, seed + i * 7919)));
    this.names = BLOB_NAMES.slice(0, players);
    this.r.cpu = Array.from({ length: players }, (_, i) => i >= s.humans);
    this.paused = false;
    this.over = false;
    this.acc = 0;
    this.state = 'local';
  }

  private localKey(code: string): void {
    const m = this.match;
    if (!m) return;
    if (this.over) {
      if (code === 'Enter' || code === 'Space' || code === 'Escape') this.toTitle();
      return;
    }
    if (code === 'Escape') {
      // the original's Esc: quit the current game
      this.sound.play('clear');
      this.toTitle();
    } else if (code === 'KeyP') {
      this.paused = !this.paused;
    } else if (m.board > 0 && (code === 'Enter' || code === 'Space')) {
      m.skipBoard();
    }
  }

  private localKeys(): Keys[] {
    const m = this.match!;
    const humans = this.settings.humans;
    return m.game.bomber_objects.map((_, i) => {
      const brain = this.brains[i];
      if (brain) return brain.think(m.game);
      return this.keysOf(humans === 1 ? [0, 1, 2, 3] : [i]);
    });
  }

  private stepLocal(dt: number): void {
    const m = this.match!;
    if (this.paused || this.over || this.frozen) return;
    this.acc = Math.min(this.acc + dt, STEP_MS * 8);
    while (this.acc >= STEP_MS) {
      this.acc -= STEP_MS;
      m.step(this.localKeys());
      this.bombLatch.fill(false);
      for (const s of m.sounds) this.sound.play(s);
      if (m.over) {
        this.over = true;
        this.sound.play('klatsch');
        break;
      }
    }
  }

  // ---------------------------------------------------------------- online

  private async startOnline(): Promise<void> {
    this.state = 'lobby';
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(13,10,18,0.92);';
    const inner = document.createElement('div');
    inner.style.cssText = 'max-width:46rem;margin:0 auto;padding:1rem;';
    box.append(inner);
    this.host.append(box);
    this.lobbyBox = box;
    const s = this.settings;
    const options: RoomOptions = { pointsToWin: s.points, roundTime: s.time, randomMapOrder: s.random, startMap: s.startMap };
    try {
      const round = await this.ctx.lobby(inner, {
        title: 'Bomberslop online',
        seats: { min: 2, max: 4, default: 2 },
        seatNames: BLOB_NAMES,
        options: () => packOptions(options),
      });
      box.remove();
      this.lobbyBox = null;
      this.beginOnline(round);
    } catch {
      box.remove();
      this.lobbyBox = null;
      this.toTitle();
    }
    this.host.focus();
  }

  private beginOnline(round: RoundStart): void {
    for (const off of this.offs) off();
    const on = new Online(this.ctx, this.maps);
    this.online = on;
    on.start(round);
    this.names = on.names;
    this.r.cpu = [];
    this.over = false;
    this.offs = [
      this.ctx.rooms.on('message', ({ from, data }) => on.message(from, data)),
      this.ctx.rooms.on('finished', ({ results, stopped }) => {
        on.finished(results, stopped);
        this.sound.play('klatsch');
      }),
      this.ctx.rooms.on('started', (r) => {
        // back after a dropped connection: the match is played again from every turn so far
        if (r.rejoined) on.start(r);
      }),
      this.ctx.rooms.on('closed', ({ reason }) => {
        if (this.state === 'online' && !on.end) on.end = { reason: 'stopped', winner: -1, text: `Out of the room: ${reason}` };
      }),
    ];
    this.state = 'online';
  }

  private onlineKey(code: string): void {
    const on = this.online;
    if (!on) return;
    if (code === 'Escape' || (on.end && (code === 'Enter' || code === 'Space'))) {
      this.leaveOnline();
      return;
    }
    if (KEYMAPS.some((m) => m.bomb.includes(code))) on.bombPressed();
  }

  private leaveOnline(): void {
    for (const off of this.offs) off();
    this.offs = [];
    this.ctx.rooms.leave();
    this.online = null;
    this.sound.play('clear');
    this.toTitle();
  }

  private stepOnline(now: number): void {
    const on = this.online!;
    const before = on.match?.frames ?? 0;
    on.tick(now, () => this.keysOf([0, 1, 2, 3]));
    this.bombLatch.fill(false);
    const m = on.match;
    if (m && m.frames !== before) {
      // the sounds of the last frame played (a catch-up of many frames stays quiet but for its last)
      for (const s of m.sounds) this.sound.play(s);
    }
  }

  // ---------------------------------------------------------------- each frame

  private frame(t: number, dt: number): void {
    this.now = t;
    const g = this.g;
    switch (this.state) {
      case 'loading':
        g.fillStyle = '#0d0a12';
        g.fillRect(0, 0, SCREEN_W, SCREEN_H);
        return;
      case 'title': this.drawTitle(); return;
      case 'setup': this.drawSetup(); return;
      case 'controls': this.drawControls(); return;
      case 'about': this.drawAbout(); return;
      case 'lobby': this.drawTitle(true); return;
      case 'local': {
        this.stepLocal(dt);
        const m = this.match!;
        if (this.over) this.r.drawBoard(g, m, this.names, t, true, 'ENTER: back to the menu');
        else this.r.drawMatch(g, m, this.names, t, this.paused ? 'PAUSED - P: GO ON, ESC: QUIT' : '');
        return;
      }
      case 'online': {
        const on = this.online!;
        this.stepOnline(performance.now());
        const m = on.match!;
        if (on.end) {
          this.drawOnlineEnd(on);
        } else if (m.over && m.lastRound) {
          this.r.drawBoard(g, m, this.names, t, true, 'Waiting for the others...');
        } else {
          let note = '';
          if (on.waitingForHistory) note = 'Catching up...';
          else if (on.waiting() > 8) note = 'Waiting for the others...';
          else if (on.leftNames.length) note = `${on.leftNames[on.leftNames.length - 1]} left the match`;
          this.r.drawMatch(g, m, this.names, t, note);
        }
        return;
      }
    }
  }

  private drawOnlineEnd(on: Online): void {
    const g = this.g;
    const m = on.match!;
    const e = on.end!;
    if (m.lastRound) this.r.drawBoard(g, m, this.names, this.now, true, 'ENTER: back to the menu');
    else {
      g.fillStyle = '#1a1423';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      this.sp.text(g, 'MATCH OVER', 160, 30, '#ffe14d', 0.5, 2);
      this.sp.text(g, 'ENTER: back to the menu', 160, 226, '#ffe14d', 0.5);
    }
    g.fillStyle = 'rgba(26,20,35,0.9)';
    g.fillRect(10, 196, 300, 24);
    let line = '';
    switch (e.reason) {
      case 'won': line = e.winner >= 0 ? `${this.names[e.winner]} wins!` : 'The match is over'; break;
      case 'left': line = e.winner >= 0 ? `The others left: ${this.names[e.winner]} wins` : 'Everyone left'; break;
      case 'desync': line = 'The games went apart: stopped'; break;
      case 'disagreed': line = 'The browsers disagreed on the end'; break;
      case 'limit': line = 'An hour is the limit'; break;
      case 'stopped': line = e.text.slice(0, 48); break;
    }
    this.sp.text(g, line, 160, 204, '#fbf7ef', 0.5);
  }

  // ---------------------------------------------------------------- screens

  private backdrop(): void {
    const g = this.g;
    g.fillStyle = '#1a1423';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) this.sp.draw(g, 'floor_canteen', x * 16, y * 16, 0.12);
  }

  private drawTitle(dim = false): void {
    const g = this.g;
    this.backdrop();
    this.sp.draw(g, 'logo', 67, 14);
    // the four blobs hop
    for (let i = 0; i < 4; i++) {
      const pose = [0, 1, 0, 2][Math.floor(this.now / 160 + i) % 4];
      this.sp.draw(g, `p${i}_down_${pose}`, 112 + i * 24, 58);
    }
    this.sp.draw(g, 'bomb_0_0', 92, 62);
    this.sp.draw(g, `bomb_3_${Math.floor(this.now / 100) % 4}`, 212, 62);
    if (!dim) this.drawMenu(this.titleItems(), 96);
    this.sp.text(g, '100% made by AI', 160, 214, '#cfc8bb', 0.5);
    this.sp.text(g, 'rules and sounds: ClanBomber 2', 160, 225, '#7a7088', 0.5);
  }

  private drawMenu(items: MenuItem[], top: number): void {
    const g = this.g;
    items.forEach((it, i) => {
      const y = top + i * 14;
      const sel = i === this.menu;
      if (sel) {
        g.fillStyle = 'rgba(134,207,85,0.25)';
        g.fillRect(40, y - 3, 240, 13);
        this.sp.draw(g, 'p0_right_0', 42 + (Math.floor(this.now / 200) % 2), y - 6);
      }
      this.sp.text(g, it.label, 160, y, sel ? '#d0f39a' : '#fbf7ef', 0.5);
    });
  }

  private drawSetup(): void {
    const g = this.g;
    this.backdrop();
    this.sp.text(g, 'LOCAL GAME', 160, 12, '#ffe14d', 0.5, 2);
    this.drawMenu(this.setupItems(), 44);
    const s = this.settings;
    for (let i = 0; i < s.humans + s.bots; i++) {
      this.sp.draw(g, `p${i}_down_0`, 100 + i * 32, 166);
      this.sp.text(g, i < s.humans ? `P${i + 1}` : 'CPU', 108 + i * 32, 188, i < s.humans ? BLOB_COLORS[i] : '#7a7088', 0.5);
    }
    this.sp.text(g, 'ESC: back', 160, 226, '#7a7088', 0.5);
  }

  private drawControls(): void {
    const g = this.g;
    this.backdrop();
    this.sp.text(g, 'CONTROLS', 160, 8, '#ffe14d', 0.5, 2);
    const rows = [
      ['Player 1', 'arrows, ENTER: bomb'],
      ['Player 2', 'W A S D, TAB: bomb'],
      ['Player 3', 'I J K L, SPACE: bomb'],
      ['Player 4', 'number pad 8 4 5 6, 0: bomb'],
      ['Alone', 'any of these'],
      ['P / ESC', 'pause / quit the game'],
    ];
    rows.forEach(([a, b], i) => {
      this.sp.text(g, a, 12, 30 + i * 10, BLOB_COLORS[i % 4]);
      this.sp.text(g, b, 70, 30 + i * 10, '#fbf7ef');
    });
    this.sp.text(g, 'Bomb again standing on it: throw (mitt)', 12, 92, '#cfc8bb');
    EXTRA_TITLES.forEach(([name, text], i) => {
      const y = 104 + i * 15;
      this.sp.draw(g, name, 12, y - 5);
      this.sp.text(g, text, 34, y, i >= 5 ? '#ef85a9' : '#fbf7ef');
    });
    this.sp.text(g, 'ESC: back', 160, 228, '#7a7088', 0.5);
  }

  private drawAbout(): void {
    const g = this.g;
    this.backdrop();
    this.sp.text(g, 'ABOUT', 160, 8, '#ffe14d', 0.5, 2);
    const lines = [
      'Bomberslop is 100% made by AI (Claude):',
      'the code and every picture.',
      '',
      'Its rules come from ClanBomber 2',
      '(Andreas Hundt, Denis Oliver Kropp,',
      'Rene Lopez and others, GPL 3),',
      'ported line by line and checked',
      'frame by frame against the original.',
      'The sounds are ClanBomber 2\'s own.',
      '',
      'Pictures drawn as code with pxl.',
      'Links: see the game\'s page.',
    ];
    lines.forEach((l, i) => this.sp.text(g, l, 160, 34 + i * 13, i < 2 ? '#d0f39a' : '#fbf7ef', 0.5));
    this.sp.text(g, 'ESC: back', 160, 228, '#7a7088', 0.5);
  }

  // ---------------------------------------------------------------- for the tests

  private info(): unknown {
    const m = this.online?.match ?? this.match;
    if (!m) return { state: this.state };
    const g = m.game;
    return {
      state: this.state,
      frames: m.frames,
      board: m.board,
      over: m.over,
      map: g.map.current.name,
      roundTime: g.observer.round_time,
      players: g.bomber_objects.map((b) => ({ x: b.x, y: b.y, dead: b.dead, gone: b.gone, points: b.points, bombs: b.cur_bombs })),
      objects: g.objects.length,
      explosions: g.objects.filter((o) => o.type === 3).length,
      bombs: g.objects.filter((o) => o.type === 0).length,
      extras: g.objects.filter((o) => o.type === 4).length,
      hash: m.hash(),
    };
  }

  private onlineInfo(): unknown {
    const on = this.online;
    if (!on) return null;
    return { me: on.me, seats: on.seats, turn: on.turn, sent: on.sent, end: on.end, log: on.log.slice(-200), left: on.leftNames };
  }
}

interface MenuItem {
  label: string;
  go?: () => void;
  change?: (d: number) => void;
}

