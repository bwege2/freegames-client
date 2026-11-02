// Maelstrom 4.0.2 on the website: the original 640x480 arcade screen, the
// title/high-score/controls/about screens, the 30 Hz game loop, original
// sprites and sounds, keyboard controls and account high scores. The game
// rules are in sim.ts.
import { PixelScreen, SERVER_SEAT, unpackGame, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import {
  GAME_W, GAME_H, STATUS_H, MAX_SHIELD, MaelstromGame, defaultInput,
  SOUND, type GameAssets, type InputState, type MObject, type Player,
} from './sim.ts';
import { clearModAssets, loadBlit, loadImageBlit, loadSound, setModAssets, soundIds, type Blit } from './assets.ts';
import { Msg } from './proto/maelstrom.ts';
import { ReplayRecorder, encodeReplay, parseReplay, type ReplayData } from './replay.ts';
import { unzip } from './unzip.ts';
import {
  decodeInput, encodeInput, packDone, packInput, packOptions, readInput, readOptions, readResults,
  type OnlineResults,
} from './net.ts';
import { THRUST_ORIGINS } from './assets/tables.ts';

interface ScoreEntry { name: string; score: number; wave: number }
const SCORE_FILE = 'hiscores.txt';

type Screen = 'title' | 'playing' | 'paused' | 'gameover' | 'name' | 'scores' | 'controls' | 'about' | 'replays' | 'replaying' | 'mods';

interface MenuItem { key: string; label: string; action: () => void }

const TITLE_MENU: MenuItem[] = [
  { key: 'P', label: '1 player', action: () => { /* set below */ } },
  { key: '2', label: '2 players - co-op', action: () => { /* set below */ } },
  { key: '3', label: '2 players - deathmatch', action: () => { /* set below */ } },
  { key: '4', label: '3 players - co-op', action: () => { /* set below */ } },
  { key: 'O', label: 'Online co-op', action: () => { /* set below */ } },
  { key: 'V', label: 'Online deathmatch', action: () => { /* set below */ } },
  { key: 'R', label: 'Replays', action: () => { /* set below */ } },
  { key: 'M', label: 'Mods', action: () => { /* set below */ } },
  { key: 'C', label: 'Controls', action: () => { /* set below */ } },
  { key: 'Z', label: 'Zap the high scores', action: () => { /* set below */ } },
  { key: 'A', label: 'About Maelstrom...', action: () => { /* set below */ } },
  { key: 'Q', label: 'Quit', action: () => { /* set below */ } },
];

export class MaelstromApp {
  private readonly ctx: GameContext;
  private readonly screen: PixelScreen;
  private readonly g: CanvasRenderingContext2D;
  private assets: GameAssets | null = null;
  private titleBg: Blit | null = null;
  private logo: Blit | null = null;
  private icons = new Map<string, Blit>();
  private sounds = new Map<number, AudioBuffer>();
  private game: MaelstromGame | null = null;
  private state: Screen = 'title';
  private localIndex = 0;
  private numPlayers = 1;
  private online = false;
  private onlineSeat = 0;
  private onlineSeats = 1;
  private onlineFrame = 0;
  private onlineSent = 0;
  private onlineInputs: Map<number, number>[] = [];
  private onlineDone = false;
  private onlineResults: OnlineResults | null = null;
  private onlineMessage = '';
  private lobbyHost: HTMLDivElement | null = null;
  private readonly host: HTMLElement;
  private readonly touch = new Set<string>();
  private touchBox: HTMLDivElement | null = null;
  private menu = 0;
  private keys = new Set<string>();
  private acc = 0;
  private scores: ScoreEntry[] = [];
  private nameEntry = '';
  private lastScore = 0;
  private lastWave = 0;
  private replay: ReplayRecorder | null = null;
  private replayData: ReplayData | null = null;
  private replayFiles: string[] = [];
  private replayMenu = 0;
  private replayFrame = 0;
  private replayName = '';
  private mods: string[] = [];
  private modMenu = 0;
  private modName = '';
  private soundOn = true;
  private thruster: AudioBufferSourceNode | null = null;
  private thrusterGain: GainNode | null = null;
  private readonly audio: AudioContext;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.host = host;
    this.audio = ctx.audio;
    this.screen = new PixelScreen(host, { width: GAME_W, height: GAME_H, background: '#000' }, ctx.signal);
    const c = this.screen.ctx;
    if (!c) throw new Error('no canvas context');
    this.g = c;
    (window as unknown as { __maelstrom?: { app: MaelstromApp } }).__maelstrom = { app: this };
  }

  async start(): Promise<void> {
    await this.loadSelectedMod();
    await this.loadAssets();
    await this.loadScores();
    this.bindInput();
    this.makeTouchControls();
    this.ctx.frame((t, dt) => this.frame(t, dt));
    this.drawTitle();
  }

  private async loadAssets(): Promise<void> {
    this.sounds.clear();
    const [playerShip, thrust1, thrust2, explosion, shipExplosion, shrapnel1, shrapnel2,
      largeR, largeL, mediumR, mediumL, smallR, smallL, steelL, steelR, enemy1, enemy2,
      prize, mult0, mult1, mult2, mult3, bonus, point, vortex, mineR, mineL, shield,
      damaged, nova, playerShot, enemyShot] = await Promise.all([
      loadBlit(true, 200, 48), loadBlit(false, 400, 48), loadBlit(false, 500, 48),
      loadBlit(true, 600, 12), loadBlit(true, 1500, 21), loadBlit(true, 1800, 48),
      loadBlit(true, 1900, 40), loadBlit(true, 500, 60), loadBlit(true, 500, 60, true),
      loadBlit(true, 400, 40), loadBlit(true, 400, 40, true), loadBlit(false, 300, 20),
      loadBlit(false, 300, 20, true), loadBlit(true, 700, 40), loadBlit(true, 700, 40, true),
      loadBlit(true, 1700, 40), loadBlit(true, 2100, 40), loadBlit(true, 800, 30),
      loadBlit(true, 2000, 1), loadBlit(true, 2002, 1), loadBlit(true, 2004, 1),
      loadBlit(true, 2006, 1), loadBlit(true, 900, 10), loadBlit(true, 1000, 6),
      loadBlit(true, 1100, 10), loadBlit(true, 1200, 40), loadBlit(true, 1200, 40, true),
      loadBlit(true, 1300, 2), loadBlit(true, 1600, 10), loadBlit(true, 1400, 18),
      loadImageBlit('shot_player.png'), loadImageBlit('shot_enemy.png'),
    ]);
    this.assets = {
      playerShip, thrust1, thrust2, explosion, shipExplosion, shrapnel1, shrapnel2,
      largeR, largeL, mediumR, mediumL, smallR, smallL, steelR, steelL, enemy1, enemy2,
      prize, mult: [mult0, mult1, mult2, mult3], bonus, point, vortex, mineR, mineL,
      shield, damaged, nova, playerShot, enemyShot,
    };
    this.titleBg = await loadImageBlit('Maelstrom_Titles_130.png');
    this.logo = await loadImageBlit('Maelstrom_Titles_129.png');
    for (const n of ['Maelstrom_Icon_128', 'Maelstrom_Icon_129', 'Maelstrom_Icon_130',
      'Maelstrom_Icon_131', 'Maelstrom_Icon_132', 'Maelstrom_Icon_133', 'Maelstrom_Icon_134',
      'Maelstrom_Icon_135', 'Maelstrom_Icon_136', 'Maelstrom_Icon_137']) {
      this.icons.set(n, await loadImageBlit(`${n}.png`));
    }
    await Promise.all(soundIds().map(async (id) => {
      const b = await loadSound(this.audio, id);
      if (b) this.sounds.set(id, b);
    }));
  }

  private async loadScores(): Promise<void> {
    try {
      const f = await this.ctx.storage.get(SCORE_FILE);
      if (f) this.scores = parseScores(new TextDecoder().decode(f));
    } catch { this.scores = []; }
  }

  private saveScores(): void {
    void this.ctx.storage.put(SCORE_FILE, new TextEncoder().encode(formatScores(this.scores))).catch(() => {});
  }

  private bindInput(): void {
    const sig = this.ctx.signal;
    window.addEventListener('keydown', (e) => {
      if (this.state === 'playing') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'CapsLock'].includes(e.code)) e.preventDefault();
      }
      if (e.repeat) return;
      this.keys.add(e.code);
      this.key(e);
    }, { signal: sig });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code), { signal: sig });
    window.addEventListener('blur', () => this.keys.clear(), { signal: sig });
  }

  private key(e: KeyboardEvent): void {
    const k = e.key.toLowerCase();
    if (this.state === 'title') {
      if (k === 'arrowup') { this.menu = (this.menu + TITLE_MENU.length - 1) % TITLE_MENU.length; return; }
      if (k === 'arrowdown') { this.menu = (this.menu + 1) % TITLE_MENU.length; return; }
      if (k === 'enter' || k === ' ') { this.activateMenu(); return; }
      if (k === 'p') { this.startGame(1); return; }
      if (k === '2') { this.startGame(2, 'coop'); return; }
      if (k === '3') { this.startGame(2, 'deathmatch'); return; }
      if (k === '4') { this.startGame(3, 'coop'); return; }
      if (k === 'o') { void this.startOnline('coop'); return; }
      if (k === 'v') { void this.startOnline('deathmatch'); return; }
      if (k === 'r') { void this.openReplays(); return; }
      if (k === 'm') { void this.openMods(); return; }
      if (k === 'c') { this.state = 'controls'; return; }
      if (k === 'z') { this.zapScores(); return; }
      if (k === 'a') { this.state = 'about'; return; }
      if (k === 'q') { this.ctx.exit(); }
      return;
    }
    if (this.state === 'controls' || this.state === 'about' || this.state === 'scores') {
      if (k === 'escape' || k === 'enter') this.state = 'title';
      return;
    }
    if (this.state === 'mods') {
      const n = this.mods.length + 1;
      if (k === 'escape') this.state = 'title';
      else if (k === 'arrowup') this.modMenu = (this.modMenu + n - 1) % n;
      else if (k === 'arrowdown') this.modMenu = (this.modMenu + 1) % n;
      else if (k === 'u') this.uploadMod();
      else if (k === 'enter') void this.applyMod(this.modMenu === 0 ? '' : this.mods[this.modMenu - 1] ?? '');
      return;
    }
    if (this.state === 'replays') {
      if (k === 'escape') this.state = 'title';
      else if (k === 'arrowup') this.replayMenu = (this.replayMenu + this.replayFiles.length - 1) % Math.max(1, this.replayFiles.length);
      else if (k === 'arrowdown') this.replayMenu = (this.replayMenu + 1) % Math.max(1, this.replayFiles.length);
      else if (k === 'enter' && this.replayFiles[this.replayMenu]) void this.playReplay(this.replayFiles[this.replayMenu]);
      return;
    }
    if (this.state === 'replaying') {
      if (k === 'escape' || k === 'enter') { this.state = 'title'; this.game = null; this.replayData = null; }
      return;
    }
    if (this.state === 'playing') {
      if (k === 'escape' || e.code === 'CapsLock') {
        if (this.online) this.leaveOnline();
        else { this.state = 'paused'; this.stopThruster(); }
      }
      return;
    }
    if (this.state === 'paused') {
      if (k === 'escape') { this.state = 'title'; this.game = null; this.stopThruster(); return; }
      this.state = 'playing';
      return;
    }
    if (this.state === 'name') {
      if (k === 'escape') { this.state = 'title'; this.game = null; return; }
      if (k === 'enter') this.submitName();
      else if (k === 'backspace') this.nameEntry = this.nameEntry.slice(0, -1);
      else if (k.length === 1 && this.nameEntry.length < 20 && /^[\x20-\x7e]$/.test(k)) this.nameEntry += k;
      return;
    }
    if (this.state === 'gameover') {
      if (k === 'escape' || k === 'enter' || k === ' ') {
        if (this.online) this.leaveOnline();
        else { this.state = 'title'; this.game = null; this.replayData = null; this.onlineMessage = ''; }
      }
      return;
    }
  }

  private activateMenu(): void {
    const item = TITLE_MENU[this.menu];
    if (!item) return;
    if (item.key === 'P') this.startGame(1);
    else if (item.key === '2') this.startGame(2, 'coop');
    else if (item.key === '3') this.startGame(2, 'deathmatch');
    else if (item.key === '4') this.startGame(3, 'coop');
    else if (item.key === 'O') void this.startOnline('coop');
    else if (item.key === 'V') void this.startOnline('deathmatch');
    else if (item.key === 'R') void this.openReplays();
    else if (item.key === 'M') void this.openMods();
    else if (item.key === 'C') this.state = 'controls';
    else if (item.key === 'Z') this.zapScores();
    else if (item.key === 'A') this.state = 'about';
    else if (item.key === 'Q') this.ctx.exit();
  }

  private zapScores(): void {
    this.scores = [];
    this.saveScores();
  }

  private startGame(players = 1, mode: 'coop' | 'deathmatch' = 'coop'): void {
    if (!this.assets) return;
    this.online = false;
    this.onlineResults = null;
    this.numPlayers = Math.max(1, Math.min(3, players));
    this.localIndex = 0;
    const seed = (Date.now() >>> 0) || 1;
    this.game = new MaelstromGame(this.assets, seed,
      this.numPlayers, mode, 10);
    this.replay = new ReplayRecorder(seed, this.numPlayers, mode);
    this.replayData = null;
    this.game.start(3);
    this.state = 'playing';
    this.acc = 0;
  }

  private async startOnline(mode: 'coop' | 'deathmatch'): Promise<void> {
    if (!this.assets) return;
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:30;overflow:auto;background:#111;color:#eee;';
    const host = document.createElement('div');
    host.style.cssText = 'max-width:46rem;margin:0 auto;padding:1rem;';
    box.append(host); document.body.append(box);
    this.lobbyHost = box;
    this.game = null;
    try {
      const round = await this.ctx.lobby(host, {
        title: mode === 'deathmatch' ? 'Maelstrom online: deathmatch' : 'Maelstrom online: co-op',
        seats: { min: 2, max: 3, default: 2 },
        seatNames: ['Pilot 1', 'Pilot 2', 'Pilot 3'],
        options: () => packOptions(mode, 10),
      });
      box.remove(); this.lobbyHost = null;
      const opts = readOptions(round.options);
      this.online = true;
      this.onlineSeat = round.you;
      this.onlineSeats = round.seats.length;
      this.onlineFrame = 0;
      this.onlineSent = 0;
      this.onlineDone = false;
      this.onlineResults = null;
      this.onlineMessage = `You are Pilot ${round.you + 1}.`;
      this.onlineInputs = Array.from({ length: this.onlineSeats }, () => new Map<number, number>());
      this.localIndex = round.you;
      this.numPlayers = this.onlineSeats;
      this.game = new MaelstromGame(this.assets, (Number(round.seed & 0xffffffffn) >>> 0) || 1,
        this.onlineSeats, opts.mode, opts.fragTarget);
      this.game.start(3);
      this.ctx.rooms.on('message', ({ from, data }) => this.onlineMessageIn(from, data));
      this.ctx.rooms.on('finished', ({ results, stopped }) => this.onlineFinished(results, stopped));
      this.state = 'playing';
      this.acc = 0;
    } catch {
      box.remove(); this.lobbyHost = null;
      this.online = false;
      this.state = 'title';
    }
  }

  private onlineMessageIn(from: number, data: Uint8Array): void {
    if (!this.online || from !== SERVER_SEAT) return;
    let msg: Msg;
    try { msg = unpackGame(Msg, data); } catch { return; }
    const input = readInput(msg);
    if (!input || input.seat < 0 || input.seat >= this.onlineSeats) return;
    this.onlineInputs[input.seat].set(input.frame, input.buttons);
  }

  private onlineStep(): void {
    const g = this.game;
    if (!g || !this.online) return;
    const buttons = encodeInput(this.input(this.localIndex));
    while (this.onlineSent <= this.onlineFrame + 2) {
      const frame = this.onlineSent++;
      this.onlineInputs[this.onlineSeat].set(frame, buttons);
      this.ctx.rooms.send(packInput(frame, buttons), 'server');
    }
    let ticked = false;
    while (this.onlineInputs.every((m) => m.has(this.onlineFrame))) {
      const inputs = this.onlineInputs.map((m) => decodeInput(m.get(this.onlineFrame)!));
      g.tick(inputs);
      this.onlineFrame++;
      ticked = true;
      if (g.state === 'gameover') { this.finishGame(); break; }
    }
    if (ticked) {
      this.consumeEvents();
      if (this.onlineFrame > 120) {
        for (const m of this.onlineInputs) {
          for (const k of m.keys()) if (k < this.onlineFrame - 30) m.delete(k);
        }
      }
    }
  }

  private onlineFinished(results: Uint8Array, stopped: string): void {
    if (!this.online) return;
    if (results.length) {
      try { this.onlineResults = readResults(results); } catch { this.onlineResults = null; }
    }
    if (stopped) this.onlineMessage = stopped;
    else if (this.onlineResults?.reason === 'left') this.onlineMessage = 'The other pilot left.';
    else if (this.onlineResults?.reason === 'timeout') this.onlineMessage = 'The other pilot stopped responding.';
    else if (this.onlineResults && !this.onlineResults.agreed) this.onlineMessage = 'The pilots reported different results.';
    if (this.state !== 'gameover') {
      this.stopThruster();
      this.state = 'gameover';
    }
  }

  private input(index = this.localIndex): InputState {
    const i = defaultInput();
    if (index === 0) {
      i.thrust = this.keys.has('ArrowUp');
      i.brake = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
      i.left = this.keys.has('ArrowLeft');
      i.right = this.keys.has('ArrowRight');
      i.shield = this.keys.has('ArrowDown');
      i.fire = this.keys.has('Space');
    } else if (index === 1) {
      i.thrust = this.keys.has('KeyW');
      i.brake = this.keys.has('KeyQ');
      i.left = this.keys.has('KeyA');
      i.right = this.keys.has('KeyD');
      i.shield = this.keys.has('KeyS');
      i.fire = this.keys.has('KeyF');
    } else if (index === 2) {
      i.thrust = this.keys.has('KeyI');
      i.brake = this.keys.has('KeyU');
      i.left = this.keys.has('KeyJ');
      i.right = this.keys.has('KeyL');
      i.shield = this.keys.has('KeyK');
      i.fire = this.keys.has('KeyH');
    }
    const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    const pad = pads?.[index];
    if (pad) {
      const ax = pad.axes[0] ?? 0, ay = pad.axes[1] ?? 0;
      if (ax < -0.3) i.left = true;
      if (ax > 0.3) i.right = true;
      if (ay < -0.35) i.thrust = true;
      if (ay > 0.35) i.shield = true;
      if (pad.buttons[0]?.pressed) i.fire = true;
      if (pad.buttons[1]?.pressed) i.brake = true;
      if (pad.buttons[12]?.pressed) i.thrust = true;
      if (pad.buttons[13]?.pressed) i.shield = true;
      if (pad.buttons[14]?.pressed) i.left = true;
      if (pad.buttons[15]?.pressed) i.right = true;
    }
    if (index === this.localIndex) {
      if (this.touch.has('thrust')) i.thrust = true;
      if (this.touch.has('brake')) i.brake = true;
      if (this.touch.has('left')) i.left = true;
      if (this.touch.has('right')) i.right = true;
      if (this.touch.has('shield')) i.shield = true;
      if (this.touch.has('fire')) i.fire = true;
    }
    return i;
  }

  private makeTouchControls(): void {
    if (!matchMedia('(pointer: coarse)').matches) return;
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;inset:auto 0 0 0;display:grid;grid-template-columns:repeat(3,1fr) repeat(3,1fr);gap:6px;padding:8px;z-index:5;pointer-events:none;user-select:none;'
      + 'background:linear-gradient(transparent,rgb(0 0 0 / .55));';
    const defs: [string, string][] = [['left', '◀'], ['thrust', '▲'], ['right', '▶'],
      ['shield', 'SHIELD'], ['fire', 'FIRE'], ['brake', 'BRAKE']];
    for (const [name, label] of defs) {
      const b = document.createElement('button');
      b.textContent = label;
      b.dataset.touch = name;
      b.style.cssText = 'pointer-events:auto;touch-action:none;font:bold 12px system-ui,sans-serif;color:#fff;'
        + 'background:rgb(40 40 80 / .72);border:1px solid #9c9cff;border-radius:8px;padding:12px 4px;';
      const down = (e: PointerEvent): void => { e.preventDefault(); this.touch.add(name); b.setPointerCapture?.(e.pointerId); };
      const up = (e: PointerEvent): void => { e.preventDefault(); this.touch.delete(name); };
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('pointerleave', up);
      box.append(b);
    }
    this.host.append(box);
    this.touchBox = box;
  }

  private leaveOnline(): void {
    this.ctx.rooms?.leave?.();
    this.online = false;
    this.game = null;
    this.touch.clear();
    this.stopThruster();
    this.state = 'title';
  }

  private async openReplays(): Promise<void> {
    try {
      this.replayFiles = (await this.ctx.storage.list(''))
        .map((f) => f.name).filter((n) => n.endsWith('.mreplay')).sort();
    } catch { this.replayFiles = []; }
    this.replayMenu = 0;
    this.state = 'replays';
  }

  private async playReplay(name: string): Promise<void> {
    try {
      const f = await this.ctx.storage.get(name);
      const data = f ? parseReplay(new TextDecoder().decode(f)) : null;
      if (!data || !this.assets) return;
      this.replayData = data;
      this.replayFrame = 0;
      this.replayName = name;
      this.online = false;
      this.localIndex = 0;
      this.numPlayers = data.players;
      this.game = new MaelstromGame(this.assets, data.seed, data.players, data.mode, 10);
      this.replay = null;
      this.game.start(3);
      this.state = 'replaying';
      this.acc = 0;
    } catch { /* ignore a malformed file */ }
  }

  private drawReplays(): void {
    this.clear();
    this.panel(70, 40, 500, 390);
    this.text(110, 65, 'Replays', 24, '#9c9cff');
    if (!this.replayFiles.length) {
      this.text(120, 120, 'No replays yet. Finish a game to record LastGame.mreplay.', 13, '#ffffff');
    }
    for (let i = 0; i < this.replayFiles.length && i < 11; i++) {
      const n = this.replayFiles[i];
      this.text(120, 115 + i * 24, `${i === this.replayMenu ? '>' : ' '} ${n}`, 14,
        i === this.replayMenu ? '#ffff00' : '#ffffff');
    }
    this.text(110, 395, 'ENTER - play   ESC - back', 13, '#9c9cff');
  }

  private async loadSelectedMod(): Promise<void> {
    try {
      const f = await this.ctx.storage.get('mod.txt');
      if (!f) { clearModAssets(); return; }
      const name = new TextDecoder().decode(f).trim();
      if (!name) { clearModAssets(); return; }
      const zip = await this.ctx.storage.get(name);
      if (!zip) { clearModAssets(); return; }
      setModAssets(await unzip(new Uint8Array(zip)));
      this.modName = name;
    } catch { clearModAssets(); }
  }

  private async openMods(): Promise<void> {
    try {
      this.mods = (await this.ctx.storage.list(''))
        .map((f) => f.name).filter((n) => n.endsWith('.zip')).sort();
    } catch { this.mods = []; }
    this.modMenu = 0;
    this.state = 'mods';
  }

  private async applyMod(name: string): Promise<void> {
    try {
      if (!name) {
        clearModAssets();
        this.modName = '';
        await this.ctx.storage.put('mod.txt', new TextEncoder().encode(''));
      } else {
        const zip = await this.ctx.storage.get(name);
        if (!zip) return;
        setModAssets(await unzip(new Uint8Array(zip)));
        this.modName = name;
        await this.ctx.storage.put('mod.txt', new TextEncoder().encode(name));
      }
      this.assets = null;
      await this.loadAssets();
      this.game = null;
      this.state = 'title';
    } catch { /* invalid zip: keep the current assets */ }
  }

  private uploadMod(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,application/zip';
    input.style.display = 'none';
    document.body.append(input);
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return;
      const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 60);
      const name = safe.endsWith('.zip') ? safe : `${safe}.zip`;
      void file.arrayBuffer().then(async (ab) => {
        await this.ctx.storage.put(name, new Uint8Array(ab));
        this.mods = (await this.ctx.storage.list('')).map((f) => f.name).filter((n) => n.endsWith('.zip')).sort();
        this.modMenu = 0;
        await this.applyMod(name);
      }).catch(() => {});
    });
    input.click();
  }

  private drawMods(): void {
    this.clear();
    this.panel(70, 40, 500, 390);
    this.text(110, 65, 'Mods', 24, '#9c9cff');
    const rows = ['Original art and sounds', ...this.mods];
    for (let i = 0; i < rows.length && i < 11; i++) {
      this.text(115, 110 + i * 24, `${i === this.modMenu ? '>' : ' '} ${rows[i]}`, 14,
        i === this.modMenu ? '#ffff00' : '#ffffff');
    }
    this.text(110, 375, `Selected: ${this.modName || 'original'}`, 12, '#9c9cff');
    this.text(110, 395, 'ENTER - use   U - upload .zip   ESC - back', 12, '#9c9cff');
  }

  private frame(now: number, dt: number): void {
    if (this.touchBox) this.touchBox.style.display = this.state === 'playing' || this.state === 'paused' ? 'grid' : 'none';
    if (this.state === 'playing' && this.game) {
      this.acc += Math.min(250, dt);
      const step = 1000 / 30;
      while (this.acc >= step) {
        this.acc -= step;
        if (this.online) {
          this.onlineStep();
        } else {
          const inputs = this.game.players.map((_, i) => this.input(i));
          this.replay?.record(inputs.map((i) => encodeInput(i)));
          this.game.tick(inputs);
          this.consumeEvents();
          if (this.game.state === 'gameover') { this.finishGame(); break; }
        }
        if (this.state !== 'playing') break;
      }
      this.drawGame();
      this.updateThruster();
    } else if (this.state === 'paused' && this.game) {
      this.drawGame();
      this.panel(220, 190, 200, 80);
      this.text(250, 218, 'Paused', 24, '#ffff00');
      this.text(250, 246, 'ESC - menu', 14, '#9c9cff');
    } else if (this.state === 'mods') {
      this.drawMods();
    } else if (this.state === 'replays') {
      this.drawReplays();
    } else if (this.state === 'replaying' && this.game && this.replayData) {
      this.acc += Math.min(250, dt);
      const step = 1000 / 30;
      while (this.acc >= step) {
        this.acc -= step;
        const inputs = this.replayData.frames[this.replayFrame];
        if (!inputs) { this.state = 'gameover'; this.onlineMessage = `Replay ended: ${this.replayName}`; break; }
        this.game.tick(inputs.map((n) => decodeInput(n)));
        this.replayFrame++;
        if (this.game.state === 'gameover') {
          this.state = 'gameover';
          this.lastScore = this.game.players[0].score;
          this.lastWave = this.game.wave;
          break;
        }
      }
      this.consumeEvents();
      this.drawGame();
    } else if (this.state === 'scores') {
      this.drawScores();
    } else if (this.state === 'controls') {
      this.drawControls();
    } else if (this.state === 'about') {
      this.drawAbout();
    } else if (this.state === 'gameover' || this.state === 'name') {
      const g = this.game;
      if (!g) { this.drawTitle(); return; }
      this.drawGame();
      this.panel(190, 140, 260, 190);
      this.text(230, 165, 'GAME OVER', 24, '#ffff00');
      if (g.players.length > 1) {
        g.players.forEach((p, i) => this.text(220, 200 + i * 18,
          `${i === this.localIndex ? '*' : ' '} Pilot ${i + 1}: ${p.score}${g.mode === 'deathmatch' ? ` (${p.frags} frags)` : ''}`, 13, i === this.localIndex ? '#ffff00' : '#ffffff'));
      } else {
        this.text(220, 205, `Score: ${this.lastScore}   Wave: ${this.lastWave}`, 16, '#ffffff');
      }
      if (this.onlineMessage) this.text(230, 270, this.onlineMessage, 11, '#9c9cff');
      if (this.state === 'name') {
        this.text(230, 235, 'Enter your name:', 14, '#9c9cff');
        this.text(230, 257, this.nameEntry || '_', 16, '#ffff00');
      } else {
        this.text(245, 255, 'Press a key', 14, '#9c9cff');
      }
    } else {
      this.drawTitle();
    }
    void now;
  }

  private consumeEvents(): void {
    if (!this.game) return;
    for (const e of this.game.clearEvents()) this.playSound(e.id, e.volume, e.pan);
  }

  private playSound(id: number, volume = 4, pan = 0): void {
    if (!this.soundOn) return;
    const b = this.sounds.get(id);
    if (!b) return;
    try {
      const s = this.audio.createBufferSource();
      s.buffer = b;
      const g = this.audio.createGain();
      g.gain.value = 0.04 * ((volume + 1) / 6);
      const p = this.audio.createStereoPanner?.();
      if (p) { p.pan.value = Math.max(-1, Math.min(1, pan / 32)); p.connect(g); s.connect(p); }
      else s.connect(g);
      g.connect(this.audio.destination);
      s.start();
    } catch { /* audio is optional */ }
  }

  private updateThruster(): void {
    const p = this.game?.players[this.localIndex];
    if (this.soundOn && p && p.alive && p.thrusting && !this.thruster) {
      const b = this.sounds.get(SOUND.thruster);
      if (b) {
        try {
          const s = this.audio.createBufferSource();
          s.buffer = b; s.loop = true;
          const g = this.audio.createGain(); g.gain.value = 0.02;
          s.connect(g); g.connect(this.audio.destination); s.start();
          this.thruster = s; this.thrusterGain = g;
        } catch { /* optional */ }
      }
    } else if ((!p?.thrusting || !p?.alive) && this.thruster) this.stopThruster();
  }

  private stopThruster(): void {
    try { this.thruster?.stop(); } catch { /* stopped */ }
    try { this.thrusterGain?.disconnect(); } catch { /* disconnected */ }
    this.thruster = null; this.thrusterGain = null;
  }

  private finishGame(): void {
    if (!this.game) return;
    if (!this.online && this.replay) {
      const data = this.replay.finish(this.game);
      this.replay = null;
      void this.ctx.storage.put('LastGame.mreplay', new TextEncoder().encode(encodeReplay(data))).catch(() => {});
    }
    const p = this.game.players[this.localIndex] ?? this.game.player;
    this.lastScore = p.score;
    this.lastWave = this.game.wave;
    this.stopThruster();
    if (this.online) {
      if (!this.onlineDone) {
        this.onlineDone = true;
        this.ctx.rooms.send(packDone(this.game), 'server');
      }
      this.state = 'gameover';
      return;
    }
    if (this.numPlayers === 1 && this.lastScore > 0
      && (this.scores.length < 10 || this.lastScore >= this.scores[this.scores.length - 1].score)) {
      this.state = 'name'; this.nameEntry = '';
    } else this.state = 'gameover';
  }

  private submitName(): void {
    const name = (this.nameEntry || 'Player').slice(0, 20);
    this.scores.push({ name, score: this.lastScore, wave: this.lastWave });
    this.scores.sort((a, b) => b.score - a.score || b.wave - a.wave || a.name.localeCompare(b.name));
    this.scores = this.scores.slice(0, 10);
    this.saveScores();
    this.state = 'scores';
  }

  // ------------------------------------------------------------ drawing

  private clear(): void { this.g.fillStyle = '#000'; this.g.fillRect(0, 0, GAME_W, GAME_H); }
  private text(x: number, y: number, s: string, size: number, color: string, align: CanvasTextAlign = 'left'): void {
    this.g.fillStyle = color;
    this.g.font = `${size >= 20 ? 'bold ' : size >= 15 ? 'bold ' : ''}${size}px ${size <= 14 ? 'Verdana, Geneva, sans-serif' : "'Times New Roman', Times, serif"}`;
    this.g.textAlign = align;
    this.g.textBaseline = 'top';
    this.g.fillText(s, x, y);
  }
  private panel(x: number, y: number, w: number, h: number): void {
    const colors = ['#7575ff', '#9c9cff', '#c3c3ff', '#9c9cff', '#7575ff'];
    this.g.fillStyle = '#000'; this.g.fillRect(x - 8, y - 8, w + 16, h + 16);
    for (let i = 0; i < colors.length; i++) {
      this.g.fillStyle = colors[i];
      this.g.fillRect(x - i, y - i, w + i * 2, h + i * 2);
    }
    this.g.fillStyle = '#000'; this.g.fillRect(x + 4, y + 4, w - 8, h - 8);
  }
  private image(b: Blit | null | undefined, x: number, y: number, frame = 0): void {
    const f = b?.frames[frame] ?? b?.frames[0];
    if (f) this.g.drawImage(f.image, Math.round(x), Math.round(y));
  }

  private drawTitle(): void {
    this.clear();
    if (this.titleBg) this.image(this.titleBg, 64, 48);
    if (this.logo) this.image(this.logo, 214, 30);
    this.text(70, 440, 'Maelstrom 4.0.2', 12, '#9c9cff');
    this.panel(30, 90, 250, 375);
    for (let i = 0; i < TITLE_MENU.length; i++) {
      const y = 108 + i * 29;
      this.text(45, y, `${i === this.menu ? '>' : ' '} ${TITLE_MENU[i].key} - ${TITLE_MENU[i].label}`, 12, i === this.menu ? '#ffff00' : '#ffffff');
    }
    this.panel(300, 90, 310, 375);
    this.text(320, 135, 'TOP PILOTS', 18, '#9c9cff');
    this.text(322, 165, 'Name', 12, '#7575ff');
    this.text(455, 165, 'Score', 12, '#7575ff');
    this.text(535, 165, 'Wave', 12, '#7575ff');
    for (let i = 0; i < 10; i++) {
      const s = this.scores[i];
      if (!s) break;
      this.text(322, 185 + i * 16, s.name.slice(0, 20), 12, '#ffffff');
      this.text(455, 185 + i * 16, String(s.score), 12, '#ffffff');
      this.text(545, 185 + i * 16, String(s.wave), 12, '#ffffff');
    }
    this.text(32, 470, '1/2/3/4 local  O/V online  R replays  M mods  C controls  Z zap  A about  Q quit', 8, '#9c9cff');
  }

  private drawGame(): void {
    const g = this.game;
    if (!g) return;
    this.clear();
    this.drawStars(g);
    for (const o of g.objects) this.drawObject(o);
    for (const o of g.objects) {
      if (o.kind === 'enemy' || o.kind === 'enemySmall') this.drawEnemyShots(o as import('./sim.ts').Shenobi);
    }
    for (const p of g.players) this.drawPlayer(p);
    this.drawStatus(g);
    if (g.state === 'bonus') {
      this.panel(150, 170, 340, 140);
      this.text(180, 195, `Wave ${g.wave} completed.`, 22, '#ffff00');
      this.text(180, 230, `Bonus: ${g.bonusTotal}`, 18, '#ffffff');
      this.text(180, 260, 'Prepare for the next wave...', 14, '#9c9cff');
    }
  }

  private drawStars(g: MaelstromGame): void {
    for (const s of g.borderStars) { this.g.fillStyle = s.color; this.g.fillRect(s.x, s.y, 1, 1); }
    for (const s of g.stars) { this.g.fillStyle = s.color; this.g.fillRect(s.x, s.y, 1, 1); }
  }

  private drawObject(o: MObject): void {
    if (o.dead) return;
    const f = o.blit.frames[o.phase] ?? o.blit.frames[0];
    if (!f) return;
    this.g.drawImage(f.image, Math.floor(o.x / 16), Math.floor(o.y / 16));
  }

  private drawPlayer(p: Player): void {
    for (const s of p.shots) {
      const b = this.assets?.playerShot.frames[0];
      if (b) this.g.drawImage(b.image, Math.floor(s.x / 16), Math.floor(s.y / 16));
    }
    if (!p.alive) {
      const f = p.blit.frames[p.phase] ?? p.blit.frames[0];
      if (f) this.g.drawImage(f.image, Math.floor(p.x / 16), Math.floor(p.y / 16));
      return;
    }
    const f = p.blit.frames[p.phase] ?? p.blit.frames[0];
    if (!f) return;
    const x = Math.floor(p.x / 16), y = Math.floor(p.y / 16);
    if (this.numPlayers > 1) { this.g.fillStyle = p.color; this.g.fillRect(x + 14, y + 10, 4, 4); }
    if (p.autoShield || (p.shieldOn && p.shieldLevel > 0)) {
      const sf = this.assets?.shield.frames[p.shieldPhase] ?? this.assets?.shield.frames[0];
      if (sf) this.g.drawImage(sf.image, x, y);
    }
    if (p.thrusting && !p.noThrust) {
      const origin = thrustOrigin(p.phase);
      const tb = p.thrustBlit.frames[p.phase] ?? p.thrustBlit.frames[0];
      if (tb) this.g.drawImage(tb.image, x + Math.floor(origin.h / 16), y + Math.floor(origin.v / 16));
    }
    this.g.drawImage(f.image, x, y);
  }

  private drawEnemyShots(e: import('./sim.ts').Shenobi): void {
    const b = this.assets?.enemyShot.frames[0];
    if (!b) return;
    for (const s of e.enemyShots) this.g.drawImage(b.image, Math.floor(s.x / 16), Math.floor(s.y / 16));
  }

  private drawStatus(g: MaelstromGame): void {
    const p = g.players[this.localIndex] ?? g.player;
    const y = GAME_H - STATUS_H;
    this.g.fillStyle = '#000'; this.g.fillRect(0, y, GAME_W, STATUS_H);
    this.g.fillStyle = '#9c9cff'; this.g.fillRect(0, y, GAME_W, 1);
    if (g.players.length > 1) {
      let x = 3;
      g.players.forEach((q, i) => {
        const label = `${i === this.localIndex ? '*' : ' '}P${i + 1} ${q.score}${g.mode === 'deathmatch' ? `/${q.frags}` : ''}`;
        this.text(x, y + 1, label, 10, i === this.localIndex ? '#ffff00' : '#9c9cff');
        x += 78;
      });
      this.text(250, y + 1, `Wave: ${g.wave}`, 10, '#9c9cff');
      this.text(330, y + 1, `Lives: ${p.lives}`, 10, '#9c9cff');
      this.text(395, y + 1, `Shield:`, 10, '#9c9cff');
      this.g.fillStyle = '#000'; this.g.fillRect(435, y + 3, 48, 8);
      this.g.fillStyle = '#7575ff'; this.g.fillRect(435, y + 3, Math.floor(46 * p.shieldLevel / MAX_SHIELD), 8);
      this.text(490, y + 1, `Bonus: ${p.bonus}`, 10, '#9c9cff');
      const icon = (name: string, ix: number): void => { const b = this.icons.get(name); if (b) this.image(b, ix, y + 2); };
      const multIcon = ['Maelstrom_Icon_130', 'Maelstrom_Icon_131', 'Maelstrom_Icon_132', 'Maelstrom_Icon_134'];
      if (p.bonusMult >= 2 && p.bonusMult <= 5) icon(multIcon[p.bonusMult - 2], 575);
      if (p.getSpecial(0x01)) icon('Maelstrom_Icon_128', 591);
      if (p.getSpecial(0x02)) icon('Maelstrom_Icon_129', 607);
      return;
    }
    this.text(3, y + 1, `Score: ${p.score}`, 11, '#9c9cff');
    this.text(130, y + 1, `Shield:`, 11, '#9c9cff');
    this.g.fillStyle = '#000'; this.g.fillRect(180, y + 3, 55, 8);
    this.g.fillStyle = '#7575ff'; this.g.fillRect(180, y + 3, Math.floor(53 * p.shieldLevel / MAX_SHIELD), 8);
    this.text(250, y + 1, `Wave: ${g.wave}`, 11, '#9c9cff');
    this.text(320, y + 1, `Lives: ${p.lives}`, 11, '#9c9cff');
    this.text(390, y + 1, `Bonus: ${p.bonus}`, 11, '#9c9cff');
    const icon = (name: string, x: number): void => { const b = this.icons.get(name); if (b) this.image(b, x, y + 2); };
    const multIcon = ['Maelstrom_Icon_130', 'Maelstrom_Icon_131', 'Maelstrom_Icon_132', 'Maelstrom_Icon_134'];
    if (p.bonusMult >= 2 && p.bonusMult <= 5) icon(multIcon[p.bonusMult - 2], 480);
    if (p.getSpecial(0x01)) icon('Maelstrom_Icon_128', 496);
    if (p.getSpecial(0x02)) icon('Maelstrom_Icon_129', 512);
    if (p.getSpecial(0x80)) icon('Maelstrom_Icon_133', 528);
    if (p.getSpecial(0x04)) icon('Maelstrom_Icon_135', 544);
    if (p.getSpecial(0x08)) icon('Maelstrom_Icon_136', 560);
  }

  private drawScores(): void {
    this.clear();
    this.panel(80, 50, 480, 360);
    this.text(120, 75, 'TOP PILOTS', 24, '#9c9cff');
    for (let i = 0; i < 10; i++) {
      const s = this.scores[i];
      if (!s) break;
      this.text(120, 120 + i * 24, `${i + 1}. ${s.name}`, 16, '#ffffff');
      this.text(470, 120 + i * 24, String(s.score), 16, '#ffffff', 'right');
      this.text(540, 120 + i * 24, String(s.wave), 16, '#9c9cff', 'right');
    }
    this.text(120, 380, 'ESC - back', 14, '#9c9cff');
  }

  private drawControls(): void {
    this.clear();
    this.panel(70, 50, 500, 370);
    this.text(110, 75, 'Controls', 24, '#9c9cff');
    const rows = [['Pilot 1', 'Arrows + Space, Shift brake'], ['Pilot 2', 'W A S D + F, Q brake'],
      ['Pilot 3', 'I J K L + H, U brake'], ['Gamepad', 'Stick, A fire, B brake'],
      ['Touch', 'On-screen buttons'], ['Pause / menu', 'Caps Lock / Esc']];
    for (let i = 0; i < rows.length; i++) {
      this.text(120, 125 + i * 28, rows[i][0], 16, '#ffffff');
      this.text(360, 125 + i * 28, rows[i][1], 16, '#ffff00');
    }
    this.text(120, 380, 'ESC - back', 14, '#9c9cff');
  }

  private drawAbout(): void {
    this.clear();
    this.panel(60, 40, 520, 400);
    this.text(100, 65, 'Maelstrom', 26, '#ffff00');
    this.text(100, 100, 'The classic asteroid belt by Ambrosia Software, 1993.', 14, '#ffffff');
    this.text(100, 125, 'Open-source SDL port: Sam Lantinga and contributors.', 14, '#ffffff');
    this.text(100, 150, 'This browser port is a TypeScript translation of the', 14, '#ffffff');
    this.text(100, 170, '4.0.2 source, with the original sprites and sounds.', 14, '#ffffff');
    this.text(100, 210, 'Pilot your ship, blast the asteroids, collect prizes,', 14, '#9c9cff');
    this.text(100, 230, 'survive the Shenobi fighters, and see how many waves', 14, '#9c9cff');
    this.text(100, 250, 'you can clear.', 14, '#9c9cff');
    this.text(100, 300, 'Artwork: CC BY 3.0, Ambrosia Software.', 12, '#7575ff');
    this.text(100, 318, 'Code: zlib license (Maelstrom 4.0).', 12, '#7575ff');
    this.text(100, 380, 'ESC - back', 14, '#9c9cff');
  }

  stop(): void {
    this.touchBox?.remove(); this.lobbyHost?.remove();
    this.ctx.rooms?.leave?.();
    delete (window as unknown as { __maelstrom?: unknown }).__maelstrom;
    this.stopThruster();
  }
}

function thrustOrigin(phase: number): { h: number; v: number } {
  const e = THRUST_ORIGINS[((phase % 48) + 48) % 48] ?? { h: 0, v: 0 };
  return { h: e.h, v: e.v };
}

function parseScores(text: string): ScoreEntry[] {
  const out: ScoreEntry[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const m = /^(.*?)\s+(-?\d+)\s+(-?\d+)\s*$/.exec(line);
    if (m) out.push({ name: m[1].slice(0, 20), score: Number(m[2]), wave: Number(m[3]) });
  }
  return out.sort((a, b) => b.score - a.score || b.wave - a.wave).slice(0, 10);
}

function formatScores(s: ScoreEntry[]): string {
  let out = '# Maelstrom high scores (name score wave)\n';
  for (const e of s) out += `${e.name} ${e.score} ${e.wave}\n`;
  return out;
}

export const start: StartGame = async (host, ctx) => {
  const app = new MaelstromApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
