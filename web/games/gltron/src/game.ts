// GLtron 0.70 on the website: the original Lua menu's modes and settings, the four lightcycles with
// human/AI seats, the three.js arena and HUD, the original sounds and the module soundtrack. The
// simulation is in sim.ts, the scene in render.ts.
import { loadAudio, type AudioSet } from './assets.ts';
import { Renderer, type MenuLine } from './render.ts';
import { DEFAULT_SETTINGS, GltronGame, Rng, type Settings } from './sim.ts';
import type { GameContext } from '../../../src/sdk/index.ts';

interface AppSettings extends Settings {
  camType: number;
  displayType: number;
  mapRatio: number;
  music: boolean;
  fx: boolean;
  musicVolume: number;
  fxVolume: number;
  keys: { left: string; right: string; glanceLeft: string; glanceRight: string; boost: string }[];
  alphaTrails: boolean;
  halos: boolean;
  recognizer: boolean;
  lod: number;
  showFps: number;
  showAi: boolean;
  showScores: boolean;
}

const DEFAULTS: AppSettings = {
  ...DEFAULT_SETTINGS,
  players: [0, 1, 1, 1],
  camType: 1,
  displayType: 3,
  mapRatio: 0.333,
  music: true,
  fx: true,
  musicVolume: 0.5,
  fxVolume: 0.2,
  keys: [
    { left: 'KeyA', right: 'KeyS', glanceLeft: 'KeyQ', glanceRight: 'KeyW', boost: 'KeyD' },
    { left: 'KeyJ', right: 'KeyK', glanceLeft: 'KeyU', glanceRight: 'KeyI', boost: 'KeyL' },
    { left: 'ArrowLeft', right: 'ArrowRight', glanceLeft: 'Delete', glanceRight: 'End', boost: 'ArrowDown' },
    { left: 'Numpad4', right: 'Numpad6', glanceLeft: 'Numpad7', glanceRight: 'Numpad9', boost: 'Numpad5' },
  ],
  alphaTrails: false,
  halos: true,
  recognizer: true,
  lod: 1,
  showFps: 0,
  showAi: true,
  showScores: true,
};

const SAVE_NAME = 'gltron-settings.json';
const GAME_TYPE_LABELS = ['classic', 'booster', 'wall accell.', 'both'];
const SPEED_LABELS = ['boring', 'normal', 'fast', 'crazy'];
const SPEED_VALUES = [5, 6.5, 8.5, 12];
const BOT_LABELS = ['dumb', 'normal', 'strong', 'the MCP himself'];
const ARENA_LABELS = ['tiny', 'medium', 'big', 'vast', 'extreme'];
const ARENA_VALUES = [160, 240, 480, 720, 1200];
const CAMERA_LABELS = ['circling', 'behind', 'cockpit', 'mouse'];
const VIEW_LABELS = ['single', 'split', '4 player', 'auto'];
const MAP_LABELS = ['none', 'small', 'medium', 'huge'];
const MAP_VALUES = [0, 0.333, 0.5, 0.9];
const PLAYER_LABELS = ['Human', 'Computer', 'None'];
const KEY_LABELS: Record<string, string> = {
  KeyA: 'a', KeyS: 's', KeyD: 'd', KeyQ: 'q', KeyW: 'w', KeyJ: 'j', KeyK: 'k', KeyL: 'l',
  KeyU: 'u', KeyI: 'i', ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  Delete: 'del', End: 'end', Numpad4: 'kp4', Numpad5: 'kp5', Numpad6: 'kp6', Numpad7: 'kp7',
  Numpad9: 'kp9', Space: 'space', Enter: 'return', Escape: 'escape',
};
const keyLabel = (code: string) => KEY_LABELS[code] ?? code.replace(/^Key/, '').toLowerCase();

class Sound {
  private readonly ctx: AudioContext;
  private set: AudioSet | null = null;
  private music: AudioBufferSourceNode | null = null;
  private engine: AudioBufferSourceNode | null = null;
  private readonly musicGain: GainNode;
  private readonly fxGain: GainNode;
  private readonly master: GainNode;
  private musicOn = true;
  private musicVol = 0.5;
  private fxVol = 0.2;
  private fxOn = true;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.musicGain = ctx.createGain();
    this.musicGain.connect(this.master);
    this.fxGain = ctx.createGain();
    this.fxGain.connect(this.master);
    this.setVolumes(0.5, 0.2);
  }

  load(): Promise<void> {
    return loadAudio(this.ctx).then((s) => { this.set = s; });
  }

  setVolumes(music: number, fx: number): void {
    this.musicVol = music; this.fxVol = fx;
    this.musicGain.gain.value = this.musicOn ? music : 0;
    this.fxGain.gain.value = this.fxOn ? fx : 0;
  }

  setMusic(on: boolean): void {
    this.musicOn = on; this.musicGain.gain.value = on ? this.musicVol : 0;
    if (on) this.playMusic(); else this.stopMusic();
  }

  setFx(on: boolean): void {
    this.fxOn = on; this.fxGain.gain.value = on ? this.fxVol : 0;
  }

  playMusic(): void {
    if (!this.set || !this.musicOn || this.music) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.set.music; s.loop = true; s.connect(this.musicGain); s.start();
    this.music = s;
  }

  stopMusic(): void {
    try { this.music?.stop(); } catch { /* already stopped */ }
    this.music = null;
  }

  startEngine(): void {
    if (!this.set || !this.fxOn || this.engine) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.set.engine; s.loop = true;
    const g = this.ctx.createGain(); g.gain.value = 0.7;
    s.connect(g); g.connect(this.fxGain); s.start();
    this.engine = s;
  }

  enginePitch(rate: number): void {
    if (this.engine) this.engine.playbackRate.value = Math.max(0.4, Math.min(2.5, rate));
  }

  stopEngine(): void {
    try { this.engine?.stop(); } catch { /* already stopped */ }
    this.engine = null;
  }

  crash(): void {
    if (!this.set || !this.fxOn) return;
    const s = this.ctx.createBufferSource(); s.buffer = this.set.crash; s.connect(this.fxGain); s.start();
  }

  dispose(): void { this.stopMusic(); this.stopEngine(); }
}

interface MenuItem {
  label: string;
  kind: 'action' | 'list' | 'key' | 'menu';
  menu?: string;
  values?: string[];
  read?: () => number;
  write?: (index: number) => void;
  action?: () => void;
  key?: { player: number; field: 'left' | 'right' | 'glanceLeft' | 'glanceRight' | 'boost' };
}
interface MenuDef { title: string; items: MenuItem[]; parent?: string }

export class GltronApp {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private renderer: Renderer;
  private settings: AppSettings = structuredClone(DEFAULTS);
  private readonly rng = new Rng(42);
  private game: GltronGame | null = null;
  private state: 'loading' | 'menu' | 'playing' | 'paused' | 'finished' = 'loading';
  private sound: Sound;
  private menus: Record<string, MenuDef> = {};
  private menuName = 'RootMenu';
  private menuIndex = 0;
  private menuStack: string[] = [];
  private keyCapture: { player: number; field: keyof AppSettings['keys'][number] } | null = null;
  private readonly cursor = { x: 0, y: 0 };
  private menuRects: { x: number; y: number; w: number; h: number }[] = [];
  private lastFrame = 0;
  private lastSpeeds = [0, 0, 0, 0];
  private carriedScores = [0, 0, 0, 0];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.renderer = new Renderer(host);
    this.sound = new Sound(ctx.audio);
  }

  async start(): Promise<void> {
    this.host.classList.add('gltron-app');
    this.addStyle();
    const loading = document.createElement('div');
    loading.className = 'gltron-loading';
    loading.textContent = 'loading GLtron…';
    this.host.append(loading);
    await Promise.all([this.loadSettings(), this.renderer.load(), this.sound.load()]);
    loading.remove();
    this.buildMenus();
    this.state = 'menu';
    (window as any).__glApp = this;
    this.sound.playMusic();
    this.bindInput();
    this.ctx.frame((time, dt) => this.frame(time, dt));
  }

  private frame(time: number, dt: number): void {
    if (this.state === 'loading') return;
    const delta = this.lastFrame ? Math.min(250, dt) : 0;
    this.lastFrame = time;
    if (this.state === 'playing' && this.game) {
      this.game.update(delta);
      this.updateAudio(delta);
      this.applyViewOptions();
      this.renderer.render(this.game, this.settings.displayType, this.humans(), time, false, delta);
      if (this.game.finished) {
        this.state = 'finished';
        this.sound.stopEngine();
        this.onCrashSounds();
      }
    } else if (this.state === 'paused' && this.game) {
      this.applyViewOptions();
      this.renderer.render(this.game, this.settings.displayType, this.humans(), time, true, delta);
    } else if (this.state === 'finished' && this.game) {
      this.applyViewOptions();
      this.renderer.render(this.game, this.settings.displayType, this.humans(), time, true, delta);
    } else {
      this.renderer.drawMenu(this.menuLines(), this.menus[this.menuName]?.title ?? '', this.footer());
    }
  }

  private applyViewOptions(): void {
    this.renderer.showScores = this.settings.showScores;
    this.renderer.showAi = this.settings.showAi;
    this.renderer.showRecognizer = this.settings.recognizer;
    this.renderer.mapRatio = this.settings.mapRatio;
    this.renderer.trailAlpha = this.settings.alphaTrails ? 0.6 : 1;
  }

  private humans(): number[] {
    return this.game ? this.game.players.map((p, i) => (p.ai.active === 0 ? i : -1)).filter((i) => i >= 0) : [0];
  }

  private updateAudio(dt: number): void {
    const d = this.game?.players[0].data;
    if (d) {
      this.sound.enginePitch(d.speed / this.settings.speed);
    }
    this.onCrashSounds();
    void dt;
  }

  private onCrashSounds(): void {
    if (!this.game) return;
    for (let i = 0; i < 4; i++) {
      const s = this.game.players[i].data.speed;
      if (s <= -1 && this.lastSpeeds[i] > 0) this.sound.crash();
      this.lastSpeeds[i] = s;
    }
  }

  private bindInput(): void {
    const signal = this.ctx.signal;
    window.addEventListener('keydown', (e) => this.keyDown(e), { signal });
    window.addEventListener('keyup', (e) => this.keyUp(e), { signal });
    this.host.addEventListener('pointerdown', (e) => this.click(e), { signal });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') { this.state = 'paused'; this.sound.stopEngine(); }
    }, { signal });
    this.host.addEventListener('pointermove', (e) => {
      const r = this.host.getBoundingClientRect();
      this.cursor.x = e.clientX - r.left; this.cursor.y = e.clientY - r.top;
    }, { signal });
  }

  private keyDown(e: KeyboardEvent): void {
    if (this.keyCapture) {
      e.preventDefault();
      if (e.code !== 'Escape') {
        this.settings.keys[this.keyCapture.player][this.keyCapture.field] = e.code;
        this.saveSettings();
      }
      this.keyCapture = null;
      return;
    }
    if (this.state === 'menu') {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Escape'].includes(e.code)) e.preventDefault();
      this.menuKey(e);
      return;
    }
    if (this.state === 'finished') {
      if (e.code === 'Escape') { this.toMenu(); return; }
      this.newRound();
      return;
    }
    if (this.state === 'paused') {
      if (e.code === 'Escape') { this.toMenu(); return; }
      this.state = 'playing';
      this.sound.startEngine();
      return;
    }
    if (this.state !== 'playing' || !this.game) return;
    if (['Space', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F1', 'F2', 'F3', 'F4', 'F5', 'F10', 'F11', 'F12'].includes(e.code)) e.preventDefault();
    if (e.code === 'Space' || e.code === 'Escape') {
      if (e.code === 'Escape') { this.state = 'paused'; this.sound.stopEngine(); return; }
      this.state = 'paused'; this.sound.stopEngine(); return;
    }
    if (e.code === 'F1') this.settings.displayType = 0;
    if (e.code === 'F2') this.settings.displayType = 1;
    if (e.code === 'F3') this.settings.displayType = 2;
    if (e.code === 'F4') this.settings.displayType = 3;
    if (e.code === 'F10') { this.settings.camType = (this.settings.camType + 1) % 4; this.renderer.camType = this.settings.camType; }
    if (e.code === 'F5') this.saveSettings();
    for (let i = 0; i < 4; i++) {
      if (this.game.players[i].ai.active !== 0) continue;
      const k = this.settings.keys[i];
      if (e.code === k.left) this.game.turn(i, 'left');
      else if (e.code === k.right) this.game.turn(i, 'right');
      else if (e.code === k.boost) this.game.boost(i, true);
      else if (e.code === k.glanceLeft) this.renderer.glance[i] = Math.PI / 2;
      else if (e.code === k.glanceRight) this.renderer.glance[i] = -Math.PI / 2;
    }
  }

  private keyUp(e: KeyboardEvent): void {
    if (this.state !== 'playing' || !this.game) return;
    for (let i = 0; i < 4; i++) {
      if (this.game.players[i].ai.active !== 0) continue;
      if (e.code === this.settings.keys[i].boost) this.game.boost(i, false);
      if (e.code === this.settings.keys[i].glanceLeft || e.code === this.settings.keys[i].glanceRight) this.renderer.glance[i] = 0;
    }
  }

  private click(e: PointerEvent): void {
    if (this.state !== 'menu') return;
    const r = this.host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const i = this.menuRects.findIndex((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
    if (i >= 0) { this.menuIndex = i; this.menuActivate(); }
  }

  private menuKey(e: KeyboardEvent): void {
    const items = this.menus[this.menuName].items;
    if (e.code === 'ArrowUp') { this.menuIndex = (this.menuIndex + items.length - 1) % items.length; return; }
    if (e.code === 'ArrowDown') { this.menuIndex = (this.menuIndex + 1) % items.length; return; }
    if (e.code === 'Escape') { this.menuBack(); return; }
    if (e.code === 'ArrowLeft') { this.menuAdjust(-1); return; }
    if (e.code === 'ArrowRight') { this.menuAdjust(1); return; }
    if (e.code === 'Enter' || e.code === 'Space') this.menuActivate();
  }

  private menuActivate(): void {
    const item = this.menus[this.menuName].items[this.menuIndex];
    if (!item) return;
    if (item.kind === 'action') { item.action?.(); return; }
    if (item.kind === 'menu') { this.menuStack.push(this.menuName); this.menuName = item.menu!; this.menuIndex = 0; return; }
    if (item.kind === 'list') { this.menuAdjust(1); return; }
    if (item.kind === 'key') {
      this.keyCapture = { player: item.key!.player, field: item.key!.field };
    }
  }

  private menuAdjust(delta: number): void {
    const item = this.menus[this.menuName].items[this.menuIndex];
    if (!item || item.kind !== 'list' || !item.read || !item.write || !item.values) return;
    const n = item.values.length;
    item.write((item.read() + delta + n) % n);
    this.saveSettings();
  }

  private menuBack(): void {
    if (this.menuName === 'RootMenu') return;
    this.menuName = this.menuStack.pop() ?? 'RootMenu';
    this.menuIndex = 0;
  }

  private menuLines(): MenuLine[] {
    const items = this.menus[this.menuName].items;
    const lines: MenuLine[] = [];
    this.menuRects = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      let value = '';
      if (it.kind === 'list' && it.values && it.read) value = it.values[it.read()];
      if (it.kind === 'key' && it.key) value = keyLabel(this.settings.keys[it.key.player][it.key.field]);
      lines.push({ text: it.label, value, active: i === this.menuIndex });
      this.menuRects.push({ x: 60, y: this.menuRowY(i), w: this.host.clientWidth - 80, h: 30 });
    }
    return lines;
  }

  private menuRowY(i: number): number {
    const logoW = Math.min(420, this.host.clientWidth * 0.5);
    const logoH = logoW * (64 / 256);
    const size = Math.max(14, Math.min(26, this.host.clientWidth / 40));
    return this.host.clientHeight * 0.04 + logoH + 30 + (this.menus[this.menuName].title ? size + 14 : 0) + i * (size + 10);
  }

  private footer(): string {
    if (this.keyCapture) return 'press a key, escape cancels';
    return this.menuName === 'RootMenu' ? 'up/down select · enter choose · arrows change · esc back' : 'esc back';
  }

  private buildMenus(): void {
    const list = (label: string, values: string[], read: () => number, write: (i: number) => void): MenuItem =>
      ({ label, kind: 'list', values, read, write });
    const action = (label: string, fn: () => void): MenuItem => ({ label, kind: 'action', action: fn });
    const sub = (label: string, menu: string): MenuItem => ({ label, kind: 'menu', menu });
    const key = (label: string, player: number, field: keyof AppSettings['keys'][number]): MenuItem =>
      ({ label, kind: 'key', key: { player, field } });
    const flag = (label: string, keyName: 'fastFinish' | 'eraseCrashed'): MenuItem =>
      list(label, ['off', 'on'], () => (this.settings[keyName] ? 1 : 0), (i) => { this.settings[keyName] = i === 1; });
    const gameType = (): number => (this.settings.boosterOn ? 1 : 0) + (this.settings.wallAccelOn ? 2 : 0);
    this.menus = {
      RootMenu: { title: '', items: [sub('Game', 'GameMenu'), sub('Video', 'VideoMenu'), sub('Audio', 'AudioMenu'), action('Quit', () => this.ctx.exit())] },
      GameMenu: { title: 'Game', items: [
        action('Start Game', () => this.startGame()), action('Reset Scores', () => this.resetScores()),
        sub('Game Rules', 'GameRulesMenu'), sub('Play Settings', 'GameSettingsMenu'),
        sub('Configure Players', 'PlayerConfigMenu'), sub('Configure Keys', 'KeyConfigMenu'), sub('Configure Joystick', 'JoyMenu'),
      ] },
      GameRulesMenu: { title: 'Game Rules', items: [
        list('Game type', GAME_TYPE_LABELS, gameType, (i) => { this.settings.boosterOn = i === 1 || i === 3; this.settings.wallAccelOn = i >= 2; }),
        list('Game speed', SPEED_LABELS, () => SPEED_VALUES.indexOf(this.settings.speed), (i) => { this.settings.speed = SPEED_VALUES[i]; }),
        list('Bot Skill', BOT_LABELS, () => this.settings.aiLevel, (i) => { this.settings.aiLevel = i; }),
        list('Arena Size', ARENA_LABELS, () => ARENA_VALUES.indexOf(this.settings.gridSize), (i) => { this.settings.gridSize = ARENA_VALUES[i]; }),
        flag('Erase dead players', 'eraseCrashed'),
      ] },
      GameSettingsMenu: { title: 'Play Settings', items: [
        flag('Fast finish', 'fastFinish'),
        list('Camera mode', CAMERA_LABELS, () => this.settings.camType, (i) => { this.settings.camType = i; this.renderer.camType = i; }),
        list('Viewports', VIEW_LABELS, () => this.settings.displayType, (i) => { this.settings.displayType = i; }),
        list('2D Map', MAP_LABELS, () => MAP_VALUES.indexOf(this.settings.mapRatio), (i) => { this.settings.mapRatio = MAP_VALUES[i]; }),
      ] },
      PlayerConfigMenu: { title: 'Configure Players', items: [0, 1, 2, 3].map((i) =>
        list(`Player ${i + 1}`, PLAYER_LABELS, () => this.settings.players[i], (v) => { this.settings.players[i] = v; })) },
      KeyConfigMenu: { title: 'Configure Keys', items: [sub('Player 1', 'Key1'), sub('Player 2', 'Key2'), sub('Player 3', 'Key3'), sub('Player 4', 'Key4')] },
      JoyMenu: { title: 'Configure Joystick', items: [action('Joystick is not available in the browser', () => {})] },
      VideoMenu: { title: 'Video', items: [action('Artpack: classic', () => {}), sub('Detail Options', 'DetailMenu')] },
      DetailMenu: { title: 'Detail Options', items: [
        list('Alpha trails', ['off', 'on'], () => (this.settings.alphaTrails ? 1 : 0), (i) => { this.settings.alphaTrails = i === 1; }),
        list('Halos', ['off', 'on'], () => (this.settings.halos ? 1 : 0), (i) => { this.settings.halos = i === 1; }),
        list('Recognizer', ['off', 'on'], () => (this.settings.recognizer ? 1 : 0), (i) => { this.settings.recognizer = i === 1; }),
        list('Scores', ['off', 'on'], () => (this.settings.showScores ? 1 : 0), (i) => { this.settings.showScores = i === 1; }),
        list('AI status', ['off', 'on'], () => (this.settings.showAi ? 1 : 0), (i) => { this.settings.showAi = i === 1; }),
        list('FPS counter', ['off', 'on'], () => (this.settings.showFps ? 1 : 0), (i) => { this.settings.showFps = i; }),
      ] },
      AudioMenu: { title: 'Audio', items: [
        list('Music', ['off', 'on'], () => (this.settings.music ? 1 : 0), (i) => { this.settings.music = i === 1; this.sound.setMusic(i === 1); }),
        list('FX', ['off', 'on'], () => (this.settings.fx ? 1 : 0), (i) => { this.settings.fx = i === 1; this.sound.setFx(i === 1); }),
        action('Song: revenge_of_cats.it (rendered)', () => {}),
        list('Music volume', ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'], () => Math.round(this.settings.musicVolume * 10), (i) => { this.settings.musicVolume = i / 10; this.sound.setVolumes(i / 10, this.settings.fxVolume); }),
        list('FX volume', ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'], () => Math.round(this.settings.fxVolume * 10), (i) => { this.settings.fxVolume = i / 10; this.sound.setVolumes(this.settings.musicVolume, i / 10); }),
      ] },
    };
    for (let p = 0; p < 4; p++) {
      this.menus[`Key${p + 1}`] = { title: `Player ${p + 1}`, items: [
        key('Turn Left', p, 'left'), key('Turn Right', p, 'right'), key('Glance Left', p, 'glanceLeft'),
        key('Glance Right', p, 'glanceRight'), key('Booster', p, 'boost'),
      ] };
    }
    this.menus.GameRulesMenu.parent = 'GameMenu';
    this.menus.GameSettingsMenu.parent = 'GameMenu';
    this.menus.PlayerConfigMenu.parent = 'GameMenu';
    this.menus.KeyConfigMenu.parent = 'GameMenu';
    this.menus.VideoMenu.parent = 'RootMenu';
    this.menus.AudioMenu.parent = 'RootMenu';
    this.renderer.camType = this.settings.camType;
  }

  private startGame(): void {
    this.game = new GltronGame({
      ...this.settings,
      players: this.settings.players.slice(),
    }, this.rng);
    for (let i = 0; i < 4; i++) this.game.players[i].data.score = this.carriedScores[i];
    this.lastSpeeds = [0, 0, 0, 0];
    // the original maps RETURN_GAME_LAUNCH to the pause callback: Start Game shows
    // "Game is paused" and waits for a key before the first physics step.
    this.state = 'paused';
    this.renderer.camType = this.settings.camType;
    this.menuStack = [];
    this.lastFrame = 0;
    this.sound.playMusic();
  }

  private newRound(): void {
    if (!this.game) { this.startGame(); return; }
    this.game.resetRound();
    this.lastSpeeds = [0, 0, 0, 0];
    this.lastFrame = 0;
    this.state = 'playing';
    this.sound.startEngine();
  }

  private resetScores(): void {
    this.carriedScores = [0, 0, 0, 0];
    for (const p of this.game?.players ?? []) p.data.score = 0;
  }

  private toMenu(): void {
    if (this.game) this.carriedScores = this.game.players.map((p) => p.data.score);
    this.state = 'menu';
    this.sound.stopEngine();
    this.menuName = 'GameMenu';
    this.menuIndex = 0;
    this.game = null;
  }

  private async loadSettings(): Promise<void> {
    try {
      const bytes = await Promise.race([
        this.ctx.storage.get(SAVE_NAME),
        new Promise<null>((r) => setTimeout(() => r(null), 2000)),
      ]);
      if (bytes) {
        const saved = JSON.parse(new TextDecoder().decode(bytes)) as Partial<AppSettings>;
        this.settings = { ...this.settings, ...saved };
        if (!Array.isArray(this.settings.players) || this.settings.players.length !== 4) this.settings.players = DEFAULTS.players.slice();
        if (!Array.isArray(this.settings.keys) || this.settings.keys.length !== 4) this.settings.keys = structuredClone(DEFAULTS.keys);
      }
    } catch { /* defaults */ }
  }

  private saveSettings(): void {
    void this.ctx.storage.put(SAVE_NAME, new TextEncoder().encode(JSON.stringify(this.settings))).catch(() => {});
  }

  private addStyle(): void {
    const style = document.createElement('style');
    style.textContent = `
      .gltron-app { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; touch-action: none; }
      .gltron-app .gltron-canvas, .gltron-app .gltron-hud { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
      .gltron-app .gltron-hud { pointer-events: none; }
      .gltron-app .gltron-loading { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font: 16px monospace; }
    `;
    this.host.append(style);
    this.style = style;
  }
  private style!: HTMLStyleElement;

  async stop(): Promise<void> {
    this.sound.dispose();
    this.renderer.dispose();
    this.style?.remove();
  }
}

