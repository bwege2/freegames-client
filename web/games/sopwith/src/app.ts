// Sopwith on the website: the original title/menu, options and key bindings,
// the seven mission files, the 10 Hz game loop, the 320x200 display, local
// two-player (browser extra) and two-player online lockstep through the
// site's rooms. The simulation is in sim.ts, the mission parser in mission.ts.
import { PixelScreen, packGame, unpackGame, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import { Msg, Options } from './proto/sopwith.ts';
import { Video, COLOR_MAPPINGS, W, H } from './video.ts';
import { ORIGINAL_GROUND } from './assets/level.ts';
import { MISSION_FILES, buildMissions, builtinOnly, type Mission } from './mission.ts';
import {
  SopwithGame, K_ACCEL, K_DEACC, K_FLAPU, K_FLAPD, K_FLIP, K_SHOT, K_BOMB, K_HOME,
  K_MISSILE, K_STARBURST, K_HARRYKEYS, MAXCRASH, type Mode, type Obj,
} from './sim.ts';
import { DEFAULT_TUNE, TunePlayer } from './tune.ts';

const MAP_TEXT = import.meta.glob('../assets/maps/*.sop', {
  eager: true, query: '?raw', import: 'default',
}) as Record<string, string>;

type KeyAction = 'pullup' | 'pulldown' | 'flip' | 'bomb' | 'fire' | 'home'
  | 'missile' | 'starburst' | 'accel' | 'decel' | 'sound';

interface Settings {
  conf_missiles: boolean;
  conf_solidground: boolean;
  conf_hudsplats: boolean;
  conf_wounded: boolean;
  conf_animals: boolean;
  conf_harrykeys: boolean;
  conf_big_explosions: boolean;
  conf_medals: boolean;
  vid_fullscreen: boolean;
  snd_tinnyfilter: boolean;
  conf_video_palette: number;
  keys: Record<KeyAction, number>;
  controllers: Record<KeyAction, number>;
}

const KEY_ACTIONS: { id: KeyAction; label: string; config: string }[] = [
  { id: 'accel', label: 'Accelerate', config: 'key_accelerate' },
  { id: 'decel', label: 'Decelerate', config: 'key_decelerate' },
  { id: 'pullup', label: 'Pull up', config: 'key_pullup' },
  { id: 'pulldown', label: 'Pull down', config: 'key_pulldown' },
  { id: 'flip', label: 'Flip', config: 'key_flip' },
  { id: 'fire', label: 'Fire machine gun', config: 'key_fire' },
  { id: 'bomb', label: 'Drop bomb', config: 'key_dropbomb' },
  { id: 'home', label: 'Navigate home', config: 'key_home' },
  { id: 'missile', label: 'Fire missile', config: 'key_missile' },
  { id: 'starburst', label: 'Starburst', config: 'key_starburst' },
  { id: 'sound', label: 'Sound on/off', config: 'key_sound' },
];

const DEFAULT_KEYS: Record<KeyAction, number> = {
  pullup: 54, pulldown: 56, flip: 55, bomb: 5, fire: 44, home: 11,
  missile: 25, starburst: 6, accel: 27, decel: 29, sound: 22,
};
const DEFAULT_CONTROLLERS: Record<KeyAction, number> = {
  pullup: 12, pulldown: 11, flip: 0, bomb: 9, fire: 10, home: 6,
  missile: -1, starburst: -1, accel: 3, decel: 1, sound: -1,
};

function defaults(): Settings {
  return {
    conf_missiles: false, conf_solidground: false, conf_hudsplats: false,
    conf_wounded: false, conf_animals: true, conf_harrykeys: false,
    conf_big_explosions: true, conf_medals: true, vid_fullscreen: false,
    snd_tinnyfilter: true, conf_video_palette: 0,
    keys: { ...DEFAULT_KEYS }, controllers: { ...DEFAULT_CONTROLLERS },
  };
}

const PALETTE_NAMES = ['CGA 1', 'CGA 2', 'CGA 3', 'Mono Amber', 'Mono Green', 'Mono Grey',
  'Tosh LCD 1', 'Tosh LCD 2', 'Tosh LCD 3', 'IBM LCD', 'Tandy LCD', 'Gas Plasma', 'Atari', 'Muted'];

const HID_CODES: Record<number, string> = {
  4: 'KeyA', 5: 'KeyB', 6: 'KeyC', 7: 'KeyD', 8: 'KeyE', 9: 'KeyF', 10: 'KeyG', 11: 'KeyH',
  12: 'KeyI', 13: 'KeyJ', 14: 'KeyK', 15: 'KeyL', 16: 'KeyM', 17: 'KeyN', 18: 'KeyO',
  19: 'KeyP', 20: 'KeyQ', 21: 'KeyR', 22: 'KeyS', 23: 'KeyT', 24: 'KeyU', 25: 'KeyV',
  26: 'KeyW', 27: 'KeyX', 28: 'KeyY', 29: 'KeyZ',
  30: 'Digit1', 31: 'Digit2', 32: 'Digit3', 33: 'Digit4', 34: 'Digit5', 35: 'Digit6',
  36: 'Digit7', 37: 'Digit8', 38: 'Digit9', 39: 'Digit0',
  40: 'Enter', 41: 'Escape', 42: 'Backspace', 43: 'Tab', 44: 'Space', 45: 'Minus',
  46: 'Equal', 47: 'BracketLeft', 48: 'BracketRight', 49: 'Backslash', 51: 'Semicolon',
  52: 'Quote', 53: 'Backquote', 54: 'Comma', 55: 'Period', 56: 'Slash',
  57: 'CapsLock', 58: 'F1', 59: 'F2', 60: 'F3', 61: 'F4', 62: 'F5', 63: 'F6', 64: 'F7',
  65: 'F8', 66: 'F9', 67: 'F10', 68: 'F11', 69: 'F12', 74: 'Home', 75: 'PageUp',
  76: 'Delete', 77: 'End', 78: 'PageDown', 79: 'ArrowRight', 80: 'ArrowLeft',
  81: 'ArrowDown', 82: 'ArrowUp', 224: 'ControlLeft', 225: 'ShiftLeft', 226: 'AltLeft',
  227: 'MetaLeft', 228: 'ControlRight', 229: 'ShiftRight', 230: 'AltRight', 231: 'MetaRight',
};
const CODE_HID = Object.fromEntries(Object.entries(HID_CODES).map(([h, c]) => [c, Number(h)]));

// SDL controller button index -> standard Gamepad API button index.
const SDL_TO_BROWSER = [0, 1, 2, 3, 8, 16, 9, 10, 11, 4, 5, 12, 13, 14, 15];

function keyName(hid: number): string {
  if (hid < 0) return 'none';
  const code = HID_CODES[hid];
  if (!code) return `#${hid}`;
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'ArrowUp') return 'Up';
  if (code === 'ArrowDown') return 'Down';
  if (code === 'ArrowLeft') return 'Left';
  if (code === 'ArrowRight') return 'Right';
  return code;
}

interface HighScore {
  name: string;
  score: number;
  medals: number[];
  ribbons: number[];
}

const DEFAULT_HIGH: HighScore[] = [
  { name: 'DLC', score: 6500, medals: [], ribbons: [] },
  { name: 'DG', score: 6000, medals: [], ribbons: [] },
  { name: 'JHC', score: 5500, medals: [], ribbons: [] },
  { name: 'JS', score: 5000, medals: [], ribbons: [] },
  { name: 'JH', score: 4500, medals: [], ribbons: [] },
  { name: 'CR', score: 4000, medals: [], ribbons: [] },
  { name: 'AMJ', score: 3500, medals: [], ribbons: [] },
  { name: 'HJM', score: 3000, medals: [], ribbons: [] },
  { name: 'BMB', score: 2500, medals: [], ribbons: [] },
  { name: 'SDH', score: 2000, medals: [], ribbons: [] },
];

const SAVE = 'sopwith.cfg';
const HISCORE = 'hiscores.txt';

type Screen = 'title' | 'single' | 'options' | 'keys' | 'missions' | 'hiscore'
  | 'playing' | 'paused' | 'over' | 'name' | 'next' | 'lobby';

interface MenuItem { key: string; label: string; action: () => void }

export class SopwithApp {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly root: HTMLDivElement;
  private readonly pane1: HTMLDivElement;
  private readonly pane2: HTMLDivElement;
  private readonly screen: PixelScreen;
  private readonly video: Video;
  private screen2: PixelScreen | null = null;
  private video2: Video | null = null;
  private screen2AC: AbortController | null = null;
  private settings: Settings = defaults();
  private missions: Mission[] = builtinOnly();
  private missionIndex = 0;
  private state: Screen = 'title';
  private selection = 0;
  private optionSelection = 0;
  private keySelection = 0;
  private missionSelection = 0;
  private awaitingKey: KeyAction | null = null;
  private game: SopwithGame | null = null;
  private mode: Mode = 'novice';
  private gamenum = 0;
  private carryScore = 0;
  private carryStats: { score: number; medals: number[]; ribbons: number[]; planekills: number; valour: number; landings: number } | null = null;
  private acc = 0;
  private tick = 0;
  private sentTick = -1;
  private lastSendAt = 0;
  private seat = 0;
  private pending = new Map<number, (number | undefined)[]>();
  private held = new Set<string>();
  private latch = new Set<string>();
  private gamepad: boolean[] = [];
  private gamepadLatch = new Set<number>();
  private highs: HighScore[] = [];
  private nameEntry = '';
  private finalScore = 0;
  private finalMedals: number[] = [];
  private finalRibbons: number[] = [];
  private finalMessage = '';
  private titleStart = 0;
  private soundEnabled = true;
  private readonly audio: AudioContext;
  private readonly tune: TunePlayer;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private lastShots = 0;
  private lastBombs = 0;
  private lastCrashes = 0;
  private titleTunePlaying = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.audio = ctx.audio;
    this.tune = new TunePlayer(this.audio);
    this.host.style.touchAction = 'none';
    this.root = document.createElement('div');
    this.root.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:#000';
    this.pane1 = document.createElement('div');
    this.pane1.style.cssText = 'position:relative;flex:1 1 100%;min-height:0';
    this.pane2 = document.createElement('div');
    this.pane2.style.cssText = 'position:relative;flex:1 1 50%;min-height:0;display:none';
    this.root.append(this.pane1, this.pane2);
    this.host.append(this.root);
    this.screen = new PixelScreen(this.pane1, { width: W, height: H, background: '#000' }, ctx.signal);
    this.video = new Video(this.screen.ctx);
    // window.__sopwith (like window.__pinball): state for the browser/E2E tests
    (window as unknown as { __sopwith?: { app: SopwithApp } }).__sopwith = { app: this };
  }

  async start(): Promise<void> {
    await this.loadFiles();
    this.loadMissions();
    this.bindInput();
    this.titleStart = performance.now();
    this.ctx.frame((t, dt) => this.frame(t, dt));
    this.drawTitle(performance.now());
  }

  private loadMissions(): void {
    const files: Record<string, string> = {};
    for (const [path, text] of Object.entries(MAP_TEXT)) {
      const name = path.split('/').pop();
      if (name) files[name] = text;
    }
    try {
      const all = buildMissions(files);
      if (all.length) this.missions = all;
    } catch {
      this.missions = builtinOnly();
    }
  }

  private currentMission(): Mission {
    return this.missions[Math.max(0, Math.min(this.missions.length - 1, this.missionIndex))];
  }

  // ---------------------------------------------------------------- files

  private async loadFiles(): Promise<void> {
    this.settings = defaults();
    try {
      const cfg = await this.ctx.storage.get(SAVE);
      if (cfg) {
        const text = new TextDecoder().decode(cfg);
        if (text.trimStart().startsWith('{')) this.loadLegacySettings(text);
        else this.settings = parseConfig(text);
      }
    } catch { /* defaults */ }
    this.highs = initialHighScores();
    try {
      const h = await this.ctx.storage.get(HISCORE);
      if (h) this.highs = parseHighScores(new TextDecoder().decode(h), this.highs);
    } catch { /* defaults */ }
  }

  private loadLegacySettings(text: string): void {
    try {
      const o = JSON.parse(text) as Record<string, unknown>;
      if (typeof o.palette === 'number') this.settings.conf_video_palette = clampPalette(o.palette);
      if (typeof o.solidGround === 'boolean') this.settings.conf_solidground = o.solidGround;
      if (typeof o.wounded === 'boolean') this.settings.conf_wounded = o.wounded;
      if (typeof o.animals === 'boolean') this.settings.conf_animals = o.animals;
      if (typeof o.medals === 'boolean') this.settings.conf_medals = o.medals;
      if (typeof o.bigExplosions === 'boolean') this.settings.conf_big_explosions = o.bigExplosions;
      if (typeof o.harryKeys === 'boolean') this.settings.conf_harrykeys = o.harryKeys;
    } catch { /* defaults */ }
  }

  private saveFiles(): void {
    void this.ctx.storage.put(SAVE, new TextEncoder().encode(formatConfig(this.settings))).catch(() => {});
    void this.ctx.storage.put(HISCORE, new TextEncoder().encode(formatHighScores(this.highs))).catch(() => {});
  }

  // ---------------------------------------------------------------- input

  private bindInput(): void {
    const sig = this.ctx.signal;
    window.addEventListener('keydown', (e) => {
      if (this.state === 'playing' || this.state === 'paused') {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '/', 'F5'].includes(e.code)) e.preventDefault();
      }
      if (e.repeat) return;
      this.held.add(e.code);
      this.latch.add(e.code);
      this.key(e);
    }, { signal: sig });
    window.addEventListener('keyup', (e) => this.held.delete(e.code), { signal: sig });
    window.addEventListener('blur', () => { this.held.clear(); this.latch.clear(); }, { signal: sig });
  }

  private key(e: KeyboardEvent): void {
    if (this.awaitingKey) {
      e.preventDefault();
      if (e.code === 'Escape') { this.awaitingKey = null; return; }
      const hid = CODE_HID[e.code];
      if (hid !== undefined) {
        this.settings.keys[this.awaitingKey] = hid;
        this.awaitingKey = null;
        this.saveFiles();
      }
      return;
    }
    const k = e.key.toLowerCase();
    switch (this.state) {
      case 'title': this.keyTitle(k); return;
      case 'single':
        if (k === 'n') this.startGame('novice', true);
        else if (k === 'e') this.startGame('expert', true);
        else if (k === 'escape') this.state = 'title';
        return;
      case 'options': this.keyOptions(k); return;
      case 'keys': this.keyKeys(k); return;
      case 'missions': this.keyMissions(k); return;
      case 'hiscore':
        if (k === 'escape' || k === 'enter') { this.state = 'title'; this.titleStart = performance.now(); }
        return;
      case 'playing':
        if (k === 'escape') { this.state = 'paused'; this.stopEngine(); }
        else if (e.code === keyCode(this.settings.keys.sound)) this.toggleSound();
        return;
      case 'paused':
        if (k === 'escape') { this.leaveGame(); return; }
        this.state = 'playing';
        this.startEngine();
        return;
      case 'over':
        if (k === 'escape' || k === 'enter' || k === ' ') { this.leaveGame(); }
        return;
      case 'next':
        if (k === 'escape') { this.leaveGame(); return; }
        this.startGame(this.mode, false);
        return;
      case 'name': this.keyName(k); return;
      case 'lobby':
        if (k === 'escape') this.state = 'title';
        return;
      default:
        return;
    }
  }

  private keyTitle(k: string): void {
    const items = this.mainItems();
    if (k === 'arrowup') { this.selection = (this.selection + items.length - 1) % items.length; return; }
    if (k === 'arrowdown') { this.selection = (this.selection + 1) % items.length; return; }
    if (k === 'enter' || k === ' ') { items[this.selection]?.action(); return; }
    if (k === 's') { this.state = 'single'; this.selection = 0; return; }
    if (k === 'c') { this.startGame('computer', true); return; }
    if (k === 'n') { void this.online(); return; }
    if (k === 'l') { this.startGame('local', true); return; }
    if (k === 'm') { this.state = 'missions'; this.missionSelection = this.missionIndex; return; }
    if (k === 'o') { this.state = 'options'; this.optionSelection = 0; return; }
    if (k === 'h') { this.state = 'hiscore'; return; }
    if (k === 'q') { this.ctx.exit(); }
  }

  private mainItems(): MenuItem[] {
    return [
      { key: 'S', label: 'single player', action: () => { this.state = 'single'; } },
      { key: 'C', label: 'versus computer', action: () => this.startGame('computer', true) },
      { key: 'N', label: 'network game', action: () => { void this.online(); } },
      { key: 'L', label: 'local 2 players', action: () => this.startGame('local', true) },
      { key: 'M', label: 'mission', action: () => { this.state = 'missions'; this.missionSelection = this.missionIndex; } },
      { key: 'O', label: 'options', action: () => { this.state = 'options'; this.optionSelection = 0; } },
      { key: 'H', label: 'high scores', action: () => { this.state = 'hiscore'; } },
      { key: 'Q', label: 'quit', action: () => this.ctx.exit() },
    ];
  }

  private keyOptions(k: string): void {
    const n = this.optionCount();
    if (k === 'arrowup') this.optionSelection = (this.optionSelection + n - 1) % n;
    else if (k === 'arrowdown') this.optionSelection = (this.optionSelection + 1) % n;
    else if (k === 'arrowleft') this.adjustOption(-1);
    else if (k === 'arrowright' || k === 'enter' || k === ' ') this.adjustOption(1);
    else if (k === 'k') { this.state = 'keys'; this.keySelection = 0; }
    else if (k === 'escape') { this.state = 'title'; this.saveFiles(); }
  }

  private optionCount(): number { return 11; }

  private optionLabel(i: number): { label: string; value: string } {
    switch (i) {
      case 0: return { label: 'Run fullscreen', value: onOff(this.settings.vid_fullscreen) };
      case 1: return { label: 'Video palette', value: PALETTE_NAMES[this.settings.conf_video_palette] ?? '0' };
      case 2: return { label: 'Solid ground', value: onOff(this.settings.conf_solidground) };
      case 3: return { label: 'HUD splats', value: onOff(this.settings.conf_hudsplats) };
      case 4: return { label: 'Wounded planes', value: onOff(this.settings.conf_wounded) };
      case 5: return { label: 'Oxen and birds', value: onOff(this.settings.conf_animals) };
      case 6: return { label: 'Big oil tank explosions', value: onOff(this.settings.conf_big_explosions) };
      case 7: return { label: 'Medals', value: onOff(this.settings.conf_medals) };
      case 8: return { label: 'Harry keys mode', value: onOff(this.settings.conf_harrykeys) };
      case 9: return { label: 'Missiles and starbursts', value: onOff(this.settings.conf_missiles) };
      case 10: return { label: 'Key bindings >>>', value: '' };
      default: return { label: '', value: '' };
    }
  }

  private adjustOption(dir: number): void {
    const i = this.optionSelection;
    if (i === 0) {
      this.settings.vid_fullscreen = !this.settings.vid_fullscreen;
      try {
        if (this.settings.vid_fullscreen) void document.documentElement.requestFullscreen?.();
        else if (document.fullscreenElement) void document.exitFullscreen?.();
      } catch { /* fullscreen is optional */ }
    } else if (i === 1) this.settings.conf_video_palette = (this.settings.conf_video_palette + dir + PALETTE_NAMES.length) % PALETTE_NAMES.length;
    else if (i === 2) this.settings.conf_solidground = !this.settings.conf_solidground;
    else if (i === 3) this.settings.conf_hudsplats = !this.settings.conf_hudsplats;
    else if (i === 4) this.settings.conf_wounded = !this.settings.conf_wounded;
    else if (i === 5) this.settings.conf_animals = !this.settings.conf_animals;
    else if (i === 6) this.settings.conf_big_explosions = !this.settings.conf_big_explosions;
    else if (i === 7) this.settings.conf_medals = !this.settings.conf_medals;
    else if (i === 8) this.settings.conf_harrykeys = !this.settings.conf_harrykeys;
    else if (i === 9) this.settings.conf_missiles = !this.settings.conf_missiles;
    else if (i === 10) { this.state = 'keys'; this.keySelection = 0; }
    this.video.palette = this.settings.conf_video_palette;
    this.saveFiles();
  }

  private keyKeys(k: string): void {
    const n = KEY_ACTIONS.length;
    if (k === 'arrowup') this.keySelection = (this.keySelection + n - 1) % n;
    else if (k === 'arrowdown') this.keySelection = (this.keySelection + 1) % n;
    else if (k === 'enter' || k === ' ') this.awaitingKey = KEY_ACTIONS[this.keySelection].id;
    else if (k === 'escape') { this.state = 'options'; this.saveFiles(); }
  }

  private keyMissions(k: string): void {
    const n = MISSION_FILES.length;
    if (k === 'arrowup') this.missionSelection = (this.missionSelection + n - 1) % n;
    else if (k === 'arrowdown') this.missionSelection = (this.missionSelection + 1) % n;
    else if (k === 'enter' || k === ' ') {
      this.missionIndex = Math.max(0, Math.min(this.missions.length - 1, this.missionSelection));
      this.tune.stop(); this.titleTunePlaying = false;
      this.state = 'title';
      this.titleStart = performance.now();
    } else if (k === 'escape') this.state = 'title';
  }

  private keyName(k: string): void {
    if (k === 'enter') {
      if (this.nameEntry) this.submitName();
      else { this.state = 'over'; this.finalMessage = 'NO HIGH SCORE'; }
    } else if (k === 'backspace') this.nameEntry = this.nameEntry.slice(0, -1);
    else if (/^[a-z0-9]$/.test(k) && this.nameEntry.length < 3) this.nameEntry += k.toUpperCase();
  }

  // ---------------------------------------------------------------- game flow

  private startGame(mode: Mode, reset: boolean): void {
    if (reset) { this.gamenum = 0; this.carryScore = 0; this.carryStats = null; }
    this.mode = mode;
    const mission = this.currentMission();
    const humanSeats = mode === 'local' ? 2 : 1;
    this.game = new SopwithGame(mode, mission, {
      humanSeats, gamenum: this.gamenum, carryScore: this.carryScore, carryStats: this.carryStats,
      wounded: this.settings.conf_wounded, animals: this.settings.conf_animals,
      missiles: this.settings.conf_missiles, bigExplosions: this.settings.conf_big_explosions,
      harryKeys: this.settings.conf_harrykeys, seed: 0x4d595df4 ^ (this.gamenum * 2654435761),
    });
    this.state = 'playing';
    this.acc = 0; this.tick = 0; this.pending.clear(); this.sentTick = -1; this.lastSendAt = 0;
    this.lastShots = this.lastBombs = this.lastCrashes = 0;
    this.titleTunePlaying = false;
    this.tune.stop();
    if (mode !== 'local') this.hideLocal();
    this.startEngine();
  }

  private leaveGame(): void {
    this.game = null;
    this.state = 'title';
    this.titleStart = performance.now();
    this.stopEngine();
    this.tune.stop();
    this.hideLocal();
    if (this.mode === 'online') this.ctx.rooms?.leave?.();
  }

  private finishGame(): void {
    const g = this.game;
    if (!g) return;
    this.finalScore = g.players[0]?.score ?? 0;
    this.finalMedals = [...(g.players[0]?.medals ?? [])];
    this.finalRibbons = [...(g.players[0]?.ribbons ?? [])];
    if (this.mode === 'online') {
      this.sendResult();
      this.finalMessage = g.winnerSeat === this.seat ? 'YOU WIN' : 'YOU LOSE';
      this.state = 'over';
      this.stopEngine();
      return;
    }
    if (g.over === 'win') {
      g.awardWinner();
      g.awardRemainingLives();
      this.carryScore = g.players[0]?.score ?? this.finalScore;
      const p = g.players[0];
      this.carryStats = p ? {
        score: p.score, medals: [...p.medals], ribbons: [...p.ribbons],
        planekills: p.planekills, valour: p.valour, landings: p.landings,
      } : null;
      this.gamenum++;
      this.finalMessage = 'MISSION ACCOMPLISHED';
      this.state = 'next';
      this.stopEngine();
      return;
    }
    this.finalMessage = 'THE END';
    const hs = this.highScoreFor(g.players[0]);
    if (this.highScoreEligible() && this.newHighScoreIndex(hs) >= 0) {
      this.state = 'name'; this.nameEntry = '';
    } else {
      this.state = 'over';
    }
    this.stopEngine();
  }

  private highScoreEligible(): boolean {
    return this.mode === 'computer' && this.currentMission().id === 'original'
      && !this.settings.conf_missiles && !this.settings.conf_wounded
      && this.settings.conf_animals && this.settings.conf_big_explosions;
  }

  private highScoreFor(p: Obj | undefined): HighScore {
    return {
      name: '', score: p?.score ?? this.finalScore,
      medals: p ? [...p.medals] : this.finalMedals,
      ribbons: p ? [...p.ribbons] : this.finalRibbons,
    };
  }

  private submitName(): void {
    const hs = this.highScoreFor(this.game?.players[0]);
    hs.name = (this.nameEntry || 'AAA').slice(0, 3).toUpperCase();
    const i = this.newHighScoreIndex(hs);
    if (i >= 0) {
      this.highs.splice(i, 0, hs);
      this.highs = this.highs.slice(0, 10);
      this.saveFiles();
    }
    this.state = 'hiscore';
  }

  private newHighScoreIndex(hs: HighScore): number {
    for (let i = 0; i < this.highs.length; i++) {
      const h = this.highs[i];
      if (hs.score !== h.score) { if (hs.score > h.score) return i; continue; }
      if (hs.medals.length !== h.medals.length) { if (hs.medals.length > h.medals.length) return i; continue; }
      if (hs.ribbons.length > h.ribbons.length) return i;
    }
    return this.highs.length < 10 ? this.highs.length : -1;
  }

  // ---------------------------------------------------------------- online

  private async online(): Promise<void> {
    this.state = 'lobby';
    this.drawLobby('Connecting...');
    try {
      const round = await this.ctx.lobby(this.host, {
        title: 'Sopwith online', seats: { min: 2, max: 2 },
        seatNames: ['Player 1', 'Player 2'],
        options: () => packGame(Options, (o) => { o.mission = this.missionIndex; }),
      });
      this.seat = round.you;
      const missionIdx = readMissionIndex(round.options, this.missions.length);
      this.missionIndex = missionIdx;
      this.mode = 'online';
      this.game = new SopwithGame('online', this.currentMission(), {
        humanSeats: 2, seed: Number(round.seed) || 0x4d595df4,
        wounded: this.settings.conf_wounded, animals: this.settings.conf_animals,
        missiles: this.settings.conf_missiles, bigExplosions: this.settings.conf_big_explosions,
        harryKeys: this.settings.conf_harrykeys,
      });
      this.ctx.rooms.on('message', ({ from, data }) => this.onNet(from, data));
      this.ctx.rooms.on('finished', (f) => {
        if (this.state === 'playing') {
          this.finalScore = this.game?.players[0]?.score ?? 0;
          this.finalMessage = f.stopped ? 'CONNECTION LOST' : 'THE END';
          this.state = 'over';
          this.stopEngine();
        }
      });
      this.state = 'playing'; this.tick = 0; this.acc = 0; this.sentTick = -1; this.pending.clear();
      this.lastShots = this.lastBombs = this.lastCrashes = 0;
      this.tune.stop();
      this.startEngine();
    } catch {
      this.state = 'title';
      this.titleStart = performance.now();
    }
  }

  private onNet(from: number, data: Uint8Array): void {
    let msg;
    try { msg = unpackGame(Msg, data); } catch { return; }
    if (!msg._isInput || from > 1) return;
    const input = msg.input;
    const tick = input.tick >>> 0;
    const keys = input.keys & 0xffff;
    let e = this.pending.get(tick);
    if (!e) { e = [undefined, undefined]; this.pending.set(tick, e); }
    e[from] = keys;
  }

  private tryNetStep(): void {
    const e = this.pending.get(this.tick);
    if (!e || e[0] === undefined || e[1] === undefined || !this.game) return;
    this.pending.delete(this.tick);
    this.game.step([e[0], e[1]]);
    this.tick++;
    this.sentTick = -1;
    this.updateSfx(this.game);
    if (this.game.over) {
      this.finishGame();
      return;
    }
    this.sendNet();
  }

  private sendNet(): void {
    if (this.mode !== 'online' || !this.ctx.rooms) return;
    const now = performance.now();
    if (this.sentTick === this.tick && now - this.lastSendAt < 400) return;
    const keys = this.keysForOnline(this.seat);
    const data = packGame(Msg, (m) => {
      const i = m._initInput();
      i.tick = this.tick;
      i.keys = keys;
    });
    this.ctx.rooms.send(data, 'all');
    this.sentTick = this.tick;
    this.lastSendAt = now;
    this.latch.clear();
    this.gamepadLatch.clear();
  }

  private sendResult(): void {
    const g = this.game;
    if (!g || !this.ctx.rooms) return;
    const data = packGame(Msg, (m) => {
      const r = m._initResult();
      r.winner = g.winnerSeat >= 0 ? g.winnerSeat : 255;
      r.score0 = g.players[0]?.score ?? 0;
      r.score1 = g.players[1]?.score ?? 0;
    });
    this.ctx.rooms.send(data, 'server');
  }

  // ---------------------------------------------------------------- keys

  private heldAction(id: KeyAction): boolean {
    const code = keyCode(this.settings.keys[id]);
    return code ? this.held.has(code) : false;
  }
  private latchedAction(id: KeyAction): boolean {
    const code = keyCode(this.settings.keys[id]);
    return code ? this.latch.has(code) : false;
  }

  private keysForOnline(seat: number): number {
    if (seat === this.seat) return this.keysForPlayer();
    return 0;
  }

  private keysForPlayer(): number {
    let k = 0;
    if (this.heldAction('accel') || this.padHeld('accel')) k |= K_ACCEL;
    if (this.heldAction('decel') || this.padHeld('decel')) k |= K_DEACC;
    if (this.heldAction('pullup') || this.padHeld('pullup')) k |= K_FLAPU;
    if (this.heldAction('pulldown') || this.padHeld('pulldown')) k |= K_FLAPD;
    if (this.latchedAction('flip') || this.padPressed('flip')) k |= K_FLIP;
    if (this.heldAction('fire') || this.padHeld('fire')) k |= K_SHOT;
    if (this.heldAction('bomb') || this.padHeld('bomb')) k |= K_BOMB;
    if (this.heldAction('home') || this.padHeld('home')) k |= K_HOME;
    if (this.latchedAction('missile') || this.padPressed('missile')) k |= K_MISSILE;
    if (this.latchedAction('starburst') || this.padPressed('starburst')) k |= K_STARBURST;
    if (this.settings.conf_harrykeys) k |= K_HARRYKEYS;
    return k;
  }

  private keysForLocal(seat: number): number {
    if (seat === 0) return this.keysForPlayer();
    let k = 0;
    if (this.held.has('KeyW')) k |= K_ACCEL;
    if (this.held.has('KeyS')) k |= K_DEACC;
    if (this.held.has('ArrowUp')) k |= K_FLAPU;
    if (this.held.has('ArrowDown')) k |= K_FLAPD;
    if (this.latch.has('KeyQ')) k |= K_FLIP;
    if (this.held.has('Enter')) k |= K_SHOT;
    if (this.held.has('KeyA')) k |= K_BOMB;
    if (this.held.has('KeyG')) k |= K_HOME;
    if (this.latch.has('KeyT')) k |= K_MISSILE;
    if (this.latch.has('KeyR')) k |= K_STARBURST;
    return k;
  }

  private keysFor(seat: number): number {
    return this.mode === 'local' ? this.keysForLocal(seat) : this.keysForPlayer();
  }

  private toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) { this.tune.stop(); this.titleTunePlaying = false; this.stopEngine(); }
    else if (this.state === 'playing') this.startEngine();
  }

  // ---------------------------------------------------------------- frame

  private frame(now: number, dt: number): void {
    this.pollGamepad();
    const d = Math.min(250, dt);
    if (this.state === 'playing' && this.game) {
      if (this.mode === 'online') {
        this.acc += d;
        if (this.acc >= 100) {
          this.acc %= 100;
          this.sendNet();
          this.tryNetStep();
        }
      } else {
        const inputs = [this.keysFor(0), this.keysFor(1)];
        this.acc += d;
        let first = true;
        while (this.acc >= 100) {
          this.acc -= 100;
          this.game.step(inputs);
          if (first) { this.latch.clear(); this.gamepadLatch.clear(); first = false; }
          this.updateSfx(this.game);
          if (this.game.over) { this.finishGame(); break; }
        }
      }
      if (this.game && this.state === 'playing') this.drawGame();
    } else if (this.state === 'title' || this.state === 'single') {
      this.drawTitle(now);
    } else if (this.state === 'options' || this.state === 'keys' || this.state === 'missions') {
      this.drawFullMenu();
    } else if (this.state === 'hiscore') {
      this.drawHighScores();
    } else if (this.state === 'paused' && this.game) {
      this.drawGame();
      this.video.text(11, 8, 'GAME IS PAUSED', 3);
      this.video.text(10, 10, 'ESC - MENU', 1);
      this.video.present();
    } else if (this.state === 'over' && this.game) {
      this.drawGame();
      this.video.text(9, 7, this.finalMessage || 'THE END', 3);
      this.video.text(9, 9, `SCORE ${this.finalScore}`, 2);
      this.video.text(8, 11, 'PRESS A KEY', 1);
      this.video.present();
    } else if (this.state === 'next' && this.game) {
      this.drawGame();
      this.video.text(6, 7, 'MISSION ACCOMPLISHED', 3);
      this.video.text(8, 9, `SCORE ${this.carryScore}`, 2);
      this.video.text(6, 11, 'PRESS A KEY FOR THE NEXT MISSION', 1);
      this.video.present();
    } else if (this.state === 'name' && this.game) {
      this.drawGame();
      this.video.text(9, 7, 'NEW HIGH SCORE!', 3);
      this.video.text(8, 9, `SCORE ${this.finalScore}`, 2);
      this.video.text(10, 11, this.nameEntry.padEnd(3, '_'), 1);
      this.video.present();
    } else if (this.state === 'lobby') {
      // the lobby's own DOM is visible; nothing to draw
    }
  }

  private pollGamepad(): void {
    try {
      const pads = navigator.getGamepads?.() ?? [];
      const pad = Array.from(pads).find((p) => p?.connected) ?? null;
      const before = this.gamepad;
      this.gamepad = pad ? pad.buttons.map((b) => b.pressed) : [];
      for (let i = 0; i < this.gamepad.length; i++) {
        if (this.gamepad[i] && !before[i]) this.gamepadLatch.add(i);
      }
    } catch {
      this.gamepad = [];
    }
  }

  private gamepadButton(id: KeyAction): number | undefined {
    const sdl = this.settings.controllers[id];
    if (sdl < 0) return undefined;
    return SDL_TO_BROWSER[sdl];
  }

  private padHeld(id: KeyAction): boolean {
    const b = this.gamepadButton(id);
    return b !== undefined && !!this.gamepad[b];
  }

  private padPressed(id: KeyAction): boolean {
    const b = this.gamepadButton(id);
    return b !== undefined && this.gamepadLatch.has(b);
  }

  // ---------------------------------------------------------------- title/menu drawing

  private drawTitle(now: number): void {
    const v = this.video;
    v.clear();
    v.palette = this.settings.conf_video_palette;
    if (this.state === 'title' && this.highScorePeriod(now)) {
      this.drawHighScores();
      return;
    }
    this.titleContent();
    this.titleDecorations();
    v.ground(ORIGINAL_GROUND, 507);
    const items = this.state === 'single'
      ? [{ key: 'N', label: 'novice player' }, { key: 'E', label: 'expert player' }]
      : this.mainItems();
    v.clearRows(156, 199);
    for (let i = 0; i < items.length; i++) {
      const sel = i === this.selection;
      const col = i < 5 ? 0 : 20;
      const row = i < 5 ? 20 + i : 20 + i - 5;
      if (row > 24) break;
      v.text(col, row, `${sel ? '>' : ' '}${items[i].key} - ${items[i].label}`, sel ? 2 : 3);
    }
    if (this.state === 'single') v.text(0, 22, '  ESC - back', 1);
    v.present();
    this.startTitleTune();
  }

  private highScorePeriod(now: number): boolean {
    return this.state === 'title' && now - this.titleStart > 10000
      && Math.floor((now - this.titleStart) / 10000) % 2 === 1;
  }

  private titleContent(): void {
    const v = this.video;
    v.text(18, 2, 'SDL', 2);
    v.text(13, 4, 'S O P W I T H', 3);
    v.text(13, 6, 'Version 2.9.0', 3);
    v.text(0, 9, '(c) 1984, 1985, 1987 ', 3);
    v.text(22, 9, 'BMB ', 1);
    v.text(26, 9, 'Compuscience', 3);
    v.text(0, 10, '(c) 1984-2000 David L. Clark', 3);
    v.text(0, 11, '(c) 2001-2024 Simon Howard, Jesse Smith', 3);
    v.text(0, 12, '    Distributed under the ', 3);
    v.text(30, 12, 'GNU', 1);
    v.text(33, 12, ' GPL', 3);
  }

  private titleDecorations(): void {
    const v = this.video;
    const sprites = this.currentMission().sprites;
    const oxY = (ORIGINAL_GROUND[720] ?? 64) + 16;
    const targetY = (ORIGINAL_GROUND[530] ?? 64) + 16;
    v.dispSymbol(40, 180, sprites.plane[0].sym[0], 1);
    v.dispSymbol(130, 80, sprites.plane[1].sym[6], 2);
    v.dispSymbol(23, targetY, sprites.target[3].sym[0], 2);
    v.dispSymbol(213, oxY, sprites.ox[0].sym[0], 1);
    v.dispSymbol(270, 160, sprites.planeHit[0].sym[0], 2);
    for (let y = 165; y <= 190; y += 5) v.plotWorld(280, y, 2);
  }

  private drawFullMenu(): void {
    const v = this.video;
    v.clear();
    v.palette = this.settings.conf_video_palette;
    const title = this.state === 'options' ? 'OPTIONS > KEY BINDINGS'
      : this.state === 'keys' ? 'OPTIONS > KEY BINDINGS' : 'MISSION';
    const line = (i: number): { label: string; value: string } => {
      if (this.state === 'options') return this.optionLabel(i);
      if (this.state === 'keys') {
        const a = KEY_ACTIONS[i];
        return { label: a.label, value: keyName(this.settings.keys[a.id]) };
      }
      const m = MISSION_FILES[i];
      return { label: m?.label ?? '', value: i === this.missionIndex ? 'current' : '' };
    };
    const count = this.state === 'options' ? this.optionCount() : this.state === 'keys' ? KEY_ACTIONS.length : MISSION_FILES.length;
    const selected = this.state === 'options' ? this.optionSelection : this.state === 'keys' ? this.keySelection : this.missionSelection;
    const x = 19 - Math.trunc(title.length / 2);
    v.text(x, 2, title, 2);
    const menuPlane = this.currentMission().sprites.plane[0];
    v.dispSymbol(x * 8 - 32, H - 10, menuPlane.sym[0], 1);
    v.dispSymbol((x + title.length) * 8 + 16, H - 10, menuPlane.sym[6], 2);
    for (let i = 0; i < count; i++) {
      const y = 5 + i;
      if (y > 20) break;
      const l = line(i);
      const sel = i === selected;
      v.text(0, y, `${sel ? '>' : ' '}${l.label}`, sel ? 2 : 3);
      if (l.value) v.text(28, y, l.value, sel ? 2 : 3);
    }
    v.text(1, 22, this.awaitingKey ? 'PRESS THE NEW KEY (ESC - CANCEL)' : '   ESC - Exit Menu', 1);
    if (this.awaitingKey) v.text(1, 20, `Changing: ${KEY_ACTIONS.find((a) => a.id === this.awaitingKey)?.label ?? ''}`, 3);
    v.present();
    this.startTitleTune();
  }

  private drawHighScores(): void {
    const v = this.video;
    v.clear();
    v.palette = this.settings.conf_video_palette;
    v.text(12, 1, 'TOP PILOTS', 2);
    for (let i = 9; i >= 0; i--) {
      const hs = this.highs[i];
      if (!hs) continue;
      this.drawHighScore(hs, 9, 3 + i);
    }
    v.text(10, 18, 'ESC - BACK', 1);
    v.present();
  }

  private drawHighScore(hs: HighScore, x: number, y: number): void {
    const v = this.video;
    v.text(x, y, `${hs.name.padEnd(3, ' ')} ....... ${String(hs.score).padStart(4, ' ')}`, 3);
    if (!this.settings.conf_medals) return;
    const px = (x + 16) * 8 + 4;
    const py = (H - 1) - y * 8 + 5;
    const widths = [10, 8, 8], offsets = [0, -1, -1];
    let ox = px;
    for (const medal of hs.medals) {
      v.dispSymbol(ox + (offsets[medal] ?? 0), py, this.currentMission().sprites.medal[medal]?.sym[0], 1);
      ox += widths[medal] ?? 8;
    }
    v.boxWorld(px, py, 32, 3, 0);
    for (let m = 0; m < hs.ribbons.length; m++) {
      const rx = Math.trunc(m / 2) * 8;
      const ry = (m % 2) * 4 + 6;
      v.dispSymbol(px + 18 + rx, py - ry, this.currentMission().sprites.ribbon[hs.ribbons[m]]?.sym[0], 1);
    }
  }

  // ---------------------------------------------------------------- game screen

  private ensureLocal(): void {
    this.pane2.style.display = 'block';
    this.pane1.style.flex = '1 1 50%';
    this.pane2.style.flex = '1 1 50%';
    if (!this.screen2) {
      this.screen2AC = new AbortController();
      this.screen2 = new PixelScreen(this.pane2, { width: W, height: H, background: '#000' }, this.screen2AC.signal);
      this.video2 = new Video(this.screen2.ctx);
    }
  }

  private hideLocal(): void {
    this.pane2.style.display = 'none';
    this.pane1.style.flex = '1 1 100%';
    this.screen2AC?.abort();
    this.screen2AC = null;
    this.screen2 = null;
    this.video2 = null;
  }

  private drawGame(): void {
    const g = this.game;
    if (!g) return;
    if (this.mode === 'local') {
      this.ensureLocal();
      this.drawScreen(this.video, g, 0);
      if (this.video2) this.drawScreen(this.video2, g, 1);
    } else {
      this.hideLocal();
      this.drawScreen(this.video, g, this.mode === 'online' ? this.seat : 0);
    }
  }

  private drawScreen(v: Video, g: SopwithGame, seat: number): void {
    v.clear();
    v.palette = this.settings.conf_video_palette;
    this.drawStatus(v, g, seat);
    v.clipTop = 0; v.clipBottom = 180;
    this.drawWorld(v, g, this.camera(g, seat));
    v.clipTop = 0; v.clipBottom = H - 1;
    if (this.mode === 'local') v.text(1, 1, `P${seat + 1}`, g.players[seat]?.clr || 1);
    if (g.messageTime > 0) v.text(1, 2, g.message, 3);
    if (this.settings.conf_hudsplats) this.drawSplats(v, g);
    const p = g.players[seat];
    if (p && p.athome && p.state === 'flying' && !g.successfulFlight && g.gamenum === 0
      && (this.mode === 'novice' || (p.crashcnt >= 3 && (this.mode === 'expert' || this.mode === 'computer')))) {
      this.drawHelp(v, seat);
    }
    v.present();
  }

  private drawWorld(v: Video, g: SopwithGame, camera: number): void {
    if (this.settings.conf_solidground) v.solidGround(g.ground, camera);
    for (const o of g.objects) {
      if (o.dead || !o.symbol) continue;
      if (o.type === 'plane' && (o.state === 'finished' || o.state === 'waiting')) continue;
      const color = o.type === 'shot' ? 3 : o.clr;
      v.dispSymbol(Math.round(o.x - camera), Math.round(o.y), o.symbol, color);
    }
    if (!this.settings.conf_solidground) v.ground(g.ground, camera);
  }

  private camera(g: SopwithGame, seat: number): number {
    const maxX = g.mission.ground.length;
    const focus = g.players[seat]?.x ?? 160;
    return Math.max(0, Math.min(maxX - W - 1, Math.round(focus) - 152));
  }

  private drawStatus(v: Video, g: SopwithGame, seat: number): void {
    const p = g.players[seat];
    const maxX = g.mission.ground.length;
    const wrx = Math.trunc(maxX / 320) * 2 + 1;
    const wry = 13;
    const sx0 = 152;
    for (let x = 0; x < W; x++) v.plotWorld(x, 18, 3);
    let sx = sx0;
    let dx = 0, maxh = 0, y = 0;
    for (let x = 0; x < maxX; x++) {
      maxh = Math.max(maxh, g.ground[x] ?? 0);
      dx++;
      if (dx === wrx) {
        maxh = Math.trunc(maxh / wry);
        if (maxh === y) v.plotWorld(sx, maxh, 3);
        else if (maxh > y) { for (++y; y <= maxh; y++) v.plotWorld(sx, y, 3); }
        else { for (--y; y >= maxh; y--) v.plotWorld(sx, y, 3); }
        y = maxh;
        v.plotWorld(sx, 0, 3);
        sx++;
        dx = 0; maxh = 0;
      }
    }
    const maxMapY = Math.trunc(200 / wry);
    for (y = 0; y <= maxMapY; y++) { v.plotWorld(sx0, y, 3); v.plotWorld(sx, y, 3); }
    for (const o of g.objects) {
      if (!o.onmap || !o.symbol || o.x < 0 || o.x >= maxX) continue;
      const mapx = o.x + Math.trunc(o.symbol.w / 2);
      const mapy = (o.y - o.symbol.h <= (g.ground[o.x] ?? 0))
        ? o.y - o.symbol.h + 8 : o.y - Math.trunc(o.symbol.h / 2);
      const px = sx0 + Math.trunc(mapx / wrx);
      const py = Math.trunc(mapy / wry);
      if (py < 15) v.plotWorld(px, py, COLOR_MAPPINGS[o.clr]?.[1] ?? 3);
    }
    v.boxWorld(0, 16, 80, 16, 0);
    const score = p?.score ?? 0;
    const scoreX = !inRange(-9999, score, 99999) ? 0 : !inRange(-999, score, 9999) ? 1 : 2;
    v.text(scoreX, 24, String(score), p?.clr || 1);
    const sep = this.settings.conf_missiles ? 3 : 5;
    let x = 127;
    x = this.gauge(v, x + sep, MAXCRASH - (p?.crashcnt ?? 0), MAXCRASH, 1);
    x = this.gauge(v, x + sep, Math.trunc((p?.life ?? 0) / 16), Math.trunc(9000 / 16), 1);
    x = this.gauge(v, x + sep, p?.bombs ?? 0, 5, 2);
    x = this.gauge(v, x + sep, p?.rounds ?? 0, 200, 3);
    if (this.settings.conf_missiles) {
      x = this.gauge(v, x + sep, p?.missiles ?? 0, 5, 1);
      this.gauge(v, x + sep, p?.bursts ?? 0, 5, 2);
    }
    if (this.settings.conf_medals && p) this.drawMedals(v, p);
  }

  private gauge(v: Video, x: number, value: number, max: number, color: number): number {
    const cury = max > 0 ? Math.min(9, Math.trunc(value * 10 / max) - 1) : -1;
    let y = 0;
    for (; y <= cury; y++) v.plotWorld(x, y, color);
    for (; y <= 9; y++) v.plotWorld(x, y, 0);
    return x;
  }

  private drawMedals(v: Video, p: Obj): void {
    const widths = [10, 8, 8], offsets = [0, -1, -1];
    let x = 50;
    for (const id of p.medals) {
      v.dispSymbol(x + (offsets[id] ?? 0), 11, this.currentMission().sprites.medal[id]?.sym[0], 1);
      x += widths[id] ?? 8;
    }
    const row = (ids: number[], y: number): void => {
      let rx = 50 + (3 - ids.length) * 4;
      for (const id of ids) {
        v.dispSymbol(rx, y, this.currentMission().sprites.ribbon[id]?.sym[0], 1);
        rx += 8;
      }
    };
    if (p.ribbons.length <= 3) row(p.ribbons, 15);
    else { row(p.ribbons.slice(0, 3), 16); row(p.ribbons.slice(3), 14); }
  }

  private drawHelp(v: Video, seat: number): void {
    v.text(1, 2, "BEGINNER'S HELP", 2);
    const items: { name: string; id: KeyAction }[] = [
      { name: 'Accelerate', id: 'accel' }, { name: 'Decelerate', id: 'decel' },
      { name: 'Pull Up', id: 'pullup' }, { name: 'Pull Down', id: 'pulldown' },
      { name: 'Flip Plane', id: 'flip' }, { name: 'Fire Gun', id: 'fire' },
      { name: 'Drop Bomb', id: 'bomb' }, { name: 'Fly Home', id: 'home' },
    ];
    for (let i = 0; i < items.length; i++) {
      const code = seat === 0 ? keyName(this.settings.keys[items[i].id]) : localKeyName(items[i].id);
      v.text(1, 3 + i, `${items[i].name.padEnd(11)}- ${code}`, 3);
    }
  }

  private drawSplats(v: Video, g: SopwithGame): void {
    if (g.oxSplatted) {
      for (let y = 19; y < H; y++) for (let x = 0; x < W; x++) v.plotWorld(x, y, 2);
    }
    for (const s of g.splats) {
      if (s.sym) v.dispSymbol(s.x, s.y, s.sym, s.clr);
    }
  }

  private drawLobby(text: string): void {
    this.video.clear();
    this.video.palette = this.settings.conf_video_palette;
    this.video.text(4, 8, text, 3);
    this.video.present();
  }

  // ---------------------------------------------------------------- sound

  private startTitleTune(): void {
    if (!this.soundEnabled || this.titleTunePlaying) return;
    const tune = this.currentMission().tune ?? DEFAULT_TUNE;
    this.tune.start(tune);
    this.titleTunePlaying = true;
  }

  private startEngine(): void {
    this.stopEngine();
    if (!this.soundEnabled) return;
    try {
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'square'; o.frequency.value = 90; g.gain.value = 0.012;
      o.connect(g); g.connect(this.audio.destination); o.start();
      this.engineOsc = o; this.engineGain = g;
    } catch { /* audio is optional */ }
  }

  private stopEngine(): void {
    try { this.engineOsc?.stop(); } catch { /* stopped */ }
    try { this.engineGain?.disconnect(); } catch { /* disconnected */ }
    this.engineOsc = null; this.engineGain = null;
  }

  private beep(freq: number, ms: number, volume = 0.06): void {
    if (!this.soundEnabled) return;
    try {
      const now = this.audio.currentTime;
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(volume, now);
      g.gain.exponentialRampToValueAtTime(0.00001, now + ms / 1000);
      o.connect(g); g.connect(this.audio.destination);
      o.start(now); o.stop(now + ms / 1000);
    } catch { /* optional */ }
  }

  private updateSfx(g: SopwithGame): void {
    if (this.engineOsc) {
      const p = g.players[this.mode === 'online' ? this.seat : 0];
      this.engineOsc.frequency.value = 70 + Math.max(0, Math.min(12, p?.speed ?? 0)) * 22;
    }
    const shots = g.objects.filter((o) => o.type === 'shot').length;
    const bombs = g.objects.filter((o) => o.type === 'bomb').length;
    const crashes = g.players.reduce((n, p) => n + p.crashcnt, 0);
    if (shots > this.lastShots) this.beep(900, 25, 0.05);
    if (bombs > this.lastBombs) this.beep(280, 60, 0.06);
    if (crashes > this.lastCrashes) this.beep(70, 220, 0.12);
    this.lastShots = shots; this.lastBombs = bombs; this.lastCrashes = crashes;
  }

  stop(): void {
    delete (window as unknown as { __sopwith?: unknown }).__sopwith;
    this.stopEngine();
    this.tune.stop();
    this.screen2AC?.abort();
    this.root.remove();
  }
}

// ---------------------------------------------------------------- helpers

function onOff(v: boolean): string { return v ? 'on' : 'off'; }
function inRange(min: number, v: number, max: number): boolean { return v >= min && v <= max; }
function clampPalette(v: number): number { return Math.max(0, Math.min(PALETTE_NAMES.length - 1, Math.trunc(v))); }
function keyCode(hid: number): string | undefined { return HID_CODES[hid]; }
function localKeyName(id: KeyAction): string {
  switch (id) {
    case 'accel': return 'W'; case 'decel': return 'S'; case 'pullup': return 'Up';
    case 'pulldown': return 'Down'; case 'flip': return 'Q'; case 'fire': return 'Enter';
    case 'bomb': return 'A'; case 'home': return 'G'; case 'missile': return 'T';
    case 'starburst': return 'R'; default: return 'S';
  }
}

function configName(id: KeyAction): string {
  return KEY_ACTIONS.find((a) => a.id === id)?.config ?? `key_${id}`;
}

function parseConfig(text: string): Settings {
  const s = defaults();
  const bools: Record<string, keyof Settings> = {
    conf_missiles: 'conf_missiles', conf_solidground: 'conf_solidground',
    conf_hudsplats: 'conf_hudsplats', conf_wounded: 'conf_wounded',
    conf_animals: 'conf_animals', conf_harrykeys: 'conf_harrykeys',
    conf_big_explosions: 'conf_big_explosions', conf_medals: 'conf_medals',
    vid_fullscreen: 'vid_fullscreen', snd_tinnyfilter: 'snd_tinnyfilter',
  };
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = /^(\S+)\s+(-?\d+)/.exec(t);
    if (!m) continue;
    const [, name, val] = m;
    if (name === 'conf_video_palette') s.conf_video_palette = clampPalette(Number(val));
    else if (name in bools) (s[bools[name]] as boolean) = Number(val) !== 0;
    else {
      const action = KEY_ACTIONS.find((a) => a.config === name);
      if (action) s.keys[action.id] = Number(val);
      else if (name.startsWith('controller_')) {
        const id = name.slice('controller_'.length) as KeyAction;
        if (id in s.controllers) s.controllers[id] = Number(val);
      }
    }
  }
  return s;
}

function formatConfig(s: Settings): string {
  let out = '# Configuration file for SDL Sopwith\n# Created by SDL Sopwith 2.9.0\n\n';
  const line = (name: string, value: string | number | boolean): void => {
    out += `${name.padEnd(25, ' ')} ${typeof value === 'boolean' ? (value ? 1 : 0) : value}\n`;
  };
  line('conf_missiles', s.conf_missiles);
  line('conf_solidground', s.conf_solidground);
  line('conf_hudsplats', s.conf_hudsplats);
  line('conf_wounded', s.conf_wounded);
  line('conf_animals', s.conf_animals);
  line('conf_harrykeys', s.conf_harrykeys);
  line('conf_big_explosions', s.conf_big_explosions);
  line('conf_medals', s.conf_medals);
  line('vid_fullscreen', s.vid_fullscreen);
  line('snd_tinnyfilter', s.snd_tinnyfilter);
  line('conf_video_palette', s.conf_video_palette);
  for (const a of KEY_ACTIONS) line(configName(a.id), s.keys[a.id]);
  for (const a of KEY_ACTIONS) {
    if (a.id === 'sound') continue;
    line(`controller_${a.id}`, s.controllers[a.id]);
  }
  return `${out}\n\n`;
}

function initialHighScores(): HighScore[] {
  return DEFAULT_HIGH.map((h) => {
    const medals: number[] = [], ribbons: number[] = [];
    for (let m = 0; m < 2; m++) if (h.score > Math.random() * 4500) medals.push(m + 1);
    for (let m = 0; m < 6; m++) if (h.score > Math.random() * 6500) ribbons.push(m);
    return { ...h, medals, ribbons };
  });
}

function unpackMask(mask: number, max: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < max; i++) if (mask & (1 << i)) out.push(i);
  return out;
}
function packMask(ids: number[]): number {
  let mask = 0;
  for (const id of ids) mask |= 1 << id;
  return mask;
}

function parseHighScores(text: string, defaultsIn: HighScore[]): HighScore[] {
  const out = defaultsIn.map((h) => ({ ...h, medals: [...h.medals], ribbons: [...h.ribbons] }));
  let idx = 0;
  for (const line of text.split(/\r?\n/)) {
    if (idx >= 10) break;
    if (!line || line.startsWith('#')) continue;
    const m = /^(\S{1,3})\s+(-?\d+)\s+(\d+)\s+(\d+)/.exec(line.trim());
    if (!m) continue;
    out[idx] = {
      name: m[1].slice(0, 3), score: Number(m[2]),
      medals: unpackMask(Number(m[3]), 3), ribbons: unpackMask(Number(m[4]), 6),
    };
    idx++;
  }
  return out;
}

function formatHighScores(h: HighScore[]): string {
  let out = '# Sopwith high scores file, generated by SDL Sopwith 2.9.0\n';
  for (let i = 0; i < 10; i++) {
    const hs = h[i] ?? DEFAULT_HIGH[i] ?? { name: '---', score: 0, medals: [], ribbons: [] };
    out += `${hs.name.slice(0, 3).padEnd(3, ' ')} ${String(hs.score).padStart(7, ' ')} ${packMask(hs.medals)} ${String(packMask(hs.ribbons)).padStart(2, ' ')}\n`;
  }
  return out;
}

function readMissionIndex(data: Uint8Array, count: number): number {
  if (!data.length) return 0;
  try {
    const o = unpackGame(Options, data);
    return Math.max(0, Math.min(count - 1, o.mission));
  } catch {
    return 0;
  }
}

export const start: StartGame = async (host, ctx) => {
  const app = new SopwithApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
