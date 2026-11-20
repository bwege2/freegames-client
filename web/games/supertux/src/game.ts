// The game around the simulation: title menu, Icy Island worldmap, level lifecycle, HUD,
// pause menu, local two-player co-op and the save file in the player's account storage.
import { imageReady, SoundBank } from './assets.ts';
import { loadText } from './resources.ts';
import { parseLevel, type LevelData } from './level.ts';
import { loadTileSet, type TileSet } from './tileset.ts';
import { Sector, TileLayer, VIEW_W, VIEW_H } from './sector.ts';
import { Controller } from './entity.ts';
import { PlayerStatus } from './player.ts';
import { loadSprite, type Sprite } from './sprite.ts';
import { loadFont, type BitmapFont } from './font.ts';
import { parseSexp, child } from './sexp.ts';
import type { GameContext, StartGame, GameInstance } from '../../../src/sdk/index.ts';

const STEP = 0.015;
const WORLD_LEVELS = [
  'welcome_antarctica.stl', 'journey_begins.stl', 'via_nostalgica.stl', 'fork_in_the_road.stl',
  'somewhat_smaller_bath.stl', 'frosted_fields.stl', 'more_snowballs.stl', 'stone_cold.stl',
  '23rd_airborne.stl', 'above_arctic_skies.stl', 'night_chill.stl', 'into_stars.stl',
  'entrance_cave.stl', 'between_glaciers.stl', 'under_the_ice.stl', 'living_inside_fridge.stl',
  'or_just_me.stl', 'ice_in_the_hole.stl', 'miyamoto_monument.stl', 'end_of_tunnel.stl',
  'path_in_the_clouds.stl', 'castle_of_nolok.stl', 'shattered_bridge.stl', 'frozen_bridge.stl',
  'icy_valley.stl', 'crystal_mine.stl', 'yeti_boss.stl',
];
const LEVEL_NAMES: Record<string, string> = {
  'welcome_antarctica.stl': 'Welcome to Antarctica', 'journey_begins.stl': 'The Journey Begins',
  'via_nostalgica.stl': 'Via Nostalgica', 'fork_in_the_road.stl': 'Fork in the Road',
  'somewhat_smaller_bath.stl': 'A Somewhat Smaller Bath', 'frosted_fields.stl': 'Frosted Fields',
  'more_snowballs.stl': 'More Snowballs', 'stone_cold.stl': 'Stone Cold', '23rd_airborne.stl': '23rd Airborne',
  'above_arctic_skies.stl': 'Above Arctic Skies', 'night_chill.stl': 'Night Chill', 'into_stars.stl': 'Into the Stars',
  'entrance_cave.stl': 'Entrance Cave', 'between_glaciers.stl': 'Between Glaciers', 'under_the_ice.stl': 'Under the Ice',
  'living_inside_fridge.stl': 'Living Inside a Fridge', 'or_just_me.stl': 'Or Just Me', 'ice_in_the_hole.stl': 'Ice in the Hole',
  'miyamoto_monument.stl': 'Miyamoto Monument', 'end_of_tunnel.stl': 'End of the Tunnel',
  'path_in_the_clouds.stl': 'Path in the Clouds', 'castle_of_nolok.stl': 'Castle of Nolok',
  'shattered_bridge.stl': 'Shattered Bridge', 'frozen_bridge.stl': 'Frozen Bridge', 'icy_valley.stl': 'Icy Valley',
  'crystal_mine.stl': 'Crystal Mine', 'yeti_boss.stl': 'The Yeti',
};

interface Save {
  completed: string[];
  current: string;
  coins?: number;
  best?: Record<string, number>;
}

interface MapNode { file: string; x: number; y: number; sprite: string; order: number }

function css(): string {
  return `
.st-root { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #000; }
.st-canvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; background: #000; }
.st-load { color: #fff; font: 16px system-ui, sans-serif; }
`;
}

export class Supertux implements GameInstance {
  private host: HTMLElement;
  private ctx: GameContext;
  private root: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private c2d: CanvasRenderingContext2D;
  private style: HTMLStyleElement;
  private sound: SoundBank;
  private font: BitmapFont | null = null;
  private bigFont: BitmapFont | null = null;
  private state: 'loading' | 'menu' | 'help' | 'worldmap' | 'intro' | 'level' | 'paused' | 'dead' | 'complete' = 'loading';
  private menuIndex = 0;
  private pauseIndex = 0;
  private helpBack = false;
  private save: Save = { completed: [], current: WORLD_LEVELS[0] };
  private twoPlayers = false;
  private keys = new Set<string>();
  private controller1 = new Controller();
  private controller2 = new Controller();
  private statuses: PlayerStatus[] = [new PlayerStatus(), new PlayerStatus()];
  private sector: Sector | null = null;
  private level: LevelData | null = null;
  private tileset: TileSet | null = null;
  private currentFile = '';
  private currentSpawn = 'main';
  private overlayTimer = 0;
  private messageTimer = 0;
  private map: LevelData | null = null;
  private mapTileset: TileSet | null = null;
  private mapLayers: TileLayer[] = [];
  private mapNodes: MapNode[] = [];
  private mapIndex = 0;
  private mapTux: Sprite | null = null;
  private acc = 0;
  private resizeObserver: ResizeObserver | null = null;
  private stopped = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.style = document.createElement('style');
    this.style.textContent = css();
    this.root = document.createElement('div');
    this.root.className = 'st-root';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'st-canvas';
    this.canvas.width = VIEW_W;
    this.canvas.height = VIEW_H;
    this.root.append(this.canvas);
    host.append(this.style, this.root);
    const c2d = this.canvas.getContext('2d');
    if (!c2d) throw new Error('no 2d canvas');
    this.c2d = c2d;
    this.c2d.imageSmoothingEnabled = false;
    this.sound = new SoundBank(ctx.audio);
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.addKeys();
    void this.boot();
    ctx.frame((t, dt) => this.frame(t, dt));
  }

  private resize(): void {
    const w = this.host.clientWidth || window.innerWidth;
    const h = this.host.clientHeight || window.innerHeight;
    const scale = Math.min(w / VIEW_W, h / VIEW_H);
    this.canvas.style.width = `${Math.max(1, Math.floor(VIEW_W * scale))}px`;
    this.canvas.style.height = `${Math.max(1, Math.floor(VIEW_H * scale))}px`;
  }

  private addKeys(): void {
    const signal = this.ctx.signal;
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Tab', 'Slash'].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
      if (!e.repeat) this.keyPressed(e.code);
    }, { signal });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); }, { signal });
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.state !== 'worldmap') return;
      const r = this.canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * VIEW_W / r.width;
      const y = (e.clientY - r.top) * VIEW_H / r.height;
      const cam = this.mapCamera();
      const wx = x + cam.x, wy = y + cam.y;
      let best = -1, bestD = 36;
      for (let i = 0; i < this.mapNodes.length; i++) {
        const n = this.mapNodes[i];
        const d = Math.hypot(n.x + 16 - wx, n.y + 16 - wy);
        if (d < bestD) { best = i; bestD = d; }
      }
      if (best >= 0) {
        if (this.mapIndex === best) this.enterMapNode(); else this.mapIndex = best;
      }
    }, { signal });
  }

  private async boot(): Promise<void> {
    try {
      [this.font, this.bigFont] = await Promise.all([loadFont('fonts/andale12.stf'), loadFont('fonts/white.stf')]);
    } catch { /* the UI still runs without text */ }
    try {
      const f = await this.ctx.storage.get('savegame');
      if (f) {
        const s = JSON.parse(new TextDecoder().decode(f)) as Save;
        if (Array.isArray(s.completed)) this.save = { completed: s.completed.filter((x) => WORLD_LEVELS.includes(x)), current: s.current || WORLD_LEVELS[0], coins: s.coins };
        if (typeof s.coins === 'number') this.statuses[0].coins = s.coins;
        if (s.best && typeof s.best === 'object') this.save.best = s.best;
      }
    } catch { /* offline: a save only in this tab */ }
    if (this.stopped) return;
    void this.loadWorldmap();
    this.state = 'menu';
  }

  private async loadWorldmap(): Promise<void> {
    try {
      const text = await loadText('levels/world1/worldmap.stwm');
      this.map = parseLevel('worldmap.stwm', text);
      this.mapTileset = await loadTileSet('images/ice_world.strf');
      const data = this.map.sectors.values().next().value;
      if (!data) return;
      this.mapLayers = data.tilemaps.map((tm) => new TileLayer(tm, this.mapTileset!, null));
      const nodes: MapNode[] = [];
      for (const o of data.objects) {
        if (o.type !== 'level') continue;
        const file = o.strings.get('level');
        if (!file || !WORLD_LEVELS.includes(file)) continue;
        nodes.push({ file, x: Math.round(o.x * 32), y: Math.round(o.y * 32), sprite: o.sprite, order: WORLD_LEVELS.indexOf(file) });
      }
      nodes.sort((a, b) => a.order - b.order);
      this.mapNodes = nodes;
      try { this.mapTux = await loadSprite('images/worldmap/common/tux.sprite'); } catch { this.mapTux = null; }
      const cur = this.mapNodes.findIndex((n) => n.file === this.save.current);
      this.mapIndex = cur >= 0 ? cur : 0;
    } catch { this.map = null; }
  }

  private isComplete(file: string): boolean { return this.save.completed.includes(file); }
  private isUnlocked(index: number): boolean {
    // the original walks along worldmap paths; this map lets the player choose any level so that
    // every level of Icy Island can be seen (the README lists this as a deviation)
    return index >= 0 && index < this.mapNodes.length;
  }

  private async saveGame(): Promise<void> {
    try { await this.ctx.storage.put('savegame', new TextEncoder().encode(JSON.stringify(this.save))); } catch { /* offline */ }
  }

  private keyPressed(code: string): void {
    if (this.state === 'menu') {
      if (code === 'ArrowUp' || code === 'KeyW') this.menuIndex = (this.menuIndex + 3) % 4;
      else if (code === 'ArrowDown' || code === 'KeyS') this.menuIndex = (this.menuIndex + 1) % 4;
      else if (code === 'Enter' || code === 'Space') this.menuSelect();
      else if (code === 'Escape') this.ctx.exit();
      return;
    }
    if (this.state === 'help') {
      if (code === 'Escape' || code === 'Enter' || code === 'Space') this.state = this.helpBack ? 'menu' : 'worldmap';
      return;
    }
    if (this.state === 'worldmap') {
      if (code === 'Escape') { this.state = 'menu'; return; }
      if (code === 'Enter' || code === 'Space') { this.enterMapNode(); return; }
      const dir = code === 'ArrowLeft' || code === 'KeyA' ? 'left' : code === 'ArrowRight' || code === 'KeyD' ? 'right'
        : code === 'ArrowUp' || code === 'KeyW' ? 'up' : code === 'ArrowDown' || code === 'KeyS' ? 'down' : '';
      if (dir) this.moveMapSelection(dir);
      return;
    }
    if (this.state === 'level') {
      if (code === 'Escape' || code === 'KeyP') { this.state = 'paused'; this.pauseIndex = 0; this.sound.stopMusic(); return; }
      if (code === 'Enter') { /* no level menu */ }
      return;
    }
    if (this.state === 'paused') {
      if (code === 'Escape' || code === 'KeyP') { this.state = 'level'; if (this.sector) this.sector.playMusic(this.sector.data.music); return; }
      if (code === 'ArrowUp') this.pauseIndex = (this.pauseIndex + 3) % 4;
      else if (code === 'ArrowDown') this.pauseIndex = (this.pauseIndex + 1) % 4;
      else if (code === 'Enter' || code === 'Space') this.pauseSelect();
      return;
    }
    if (this.state === 'intro') {
      if (code === 'Enter' || code === 'Space' || code === 'Escape') this.overlayTimer = 0;
      return;
    }
    if (this.state === 'complete' || this.state === 'dead') {
      if (code === 'Enter' || code === 'Space') this.overlayTimer = 0;
    }
  }

  private menuSelect(): void {
    if (this.menuIndex === 0) { this.twoPlayers = false; this.startWorldmap(true); }
    else if (this.menuIndex === 1) { this.twoPlayers = true; this.startWorldmap(true); }
    else if (this.menuIndex === 2) { this.helpBack = true; this.state = 'help'; }
    else this.ctx.exit();
  }

  private pauseSelect(): void {
    if (this.pauseIndex === 0) { this.state = 'level'; if (this.sector) this.sector.playMusic(this.sector.data.music); }
    else if (this.pauseIndex === 1) { void this.startLevel(this.currentFile, this.currentSpawn); }
    else if (this.pauseIndex === 2) { this.state = 'worldmap'; this.sector = null; this.sound.stopMusic(); }
    else this.ctx.exit();
  }

  private startWorldmap(fresh = false): void {
    if (fresh) { this.statuses = [new PlayerStatus(), new PlayerStatus()]; this.save.coins = 100; }
    this.state = 'worldmap';
    this.sound.stopMusic();
    const cur = this.mapNodes.findIndex((n) => n.file === this.save.current);
    this.mapIndex = cur >= 0 ? cur : 0;
    void this.loadMapMusic();
  }

  private async loadMapMusic(): Promise<void> {
    const music = this.map?.sectors.values().next().value?.music;
    if (music) this.playMusicFile(music);
  }

  private moveMapSelection(dir: string): void {
    const from = this.mapNodes[this.mapIndex];
    if (!from) return;
    let best = -1, bestScore = Infinity;
    for (let i = 0; i < this.mapNodes.length; i++) {
      if (i === this.mapIndex || !this.isUnlocked(i)) continue;
      const n = this.mapNodes[i];
      const dx = n.x - from.x, dy = n.y - from.y;
      const ok = dir === 'left' ? dx < -8 : dir === 'right' ? dx > 8 : dir === 'up' ? dy < -8 : dy > 8;
      if (!ok) continue;
      const score = Math.hypot(dx, dy) + (dir === 'left' || dir === 'right' ? Math.abs(dy) * 2 : Math.abs(dx) * 2);
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best >= 0) this.mapIndex = best;
  }

  private enterMapNode(): void {
    const n = this.mapNodes[this.mapIndex];
    if (!n) return;
    if (!this.isUnlocked(this.mapIndex)) { this.showMessage('Finish the previous level first.'); return; }
    this.save.current = n.file;
    void this.startLevel(n.file, 'main');
  }

  private async startLevel(file: string, spawnpoint: string): Promise<void> {
    this.state = 'loading';
    this.sound.stopMusic();
    this.currentFile = file; this.currentSpawn = spawnpoint;
    try {
      if (!this.tileset) this.tileset = await loadTileSet('images/tiles.strf');
      const text = await loadText(`levels/world1/${file}`);
      this.level = parseLevel(file, text);
      const statuses = this.twoPlayers ? this.statuses : [this.statuses[0]];
      const controllers = this.twoPlayers ? [this.controller1, this.controller2] : [this.controller1];
      this.sector = new Sector(this.level, 'main', this.tileset, {
        players: this.twoPlayers ? 2 : 1, controllers, statuses, sound: this.sound, spawnpoint,
        onFinish: () => this.finishedLevel(),
        onSwitchSector: (s, sp) => { void this.switchSector(s, sp); },
        onDied: () => this.playerDied(),
      });
      this.overlayTimer = 1.5;
      this.state = 'intro';
    } catch (e) {
      console.error('supertux: could not load level', e);
      this.state = 'menu';
      this.showMessage(`Could not load ${file}: ${(e as Error).message}`);
    }
  }

  private async switchSector(name: string, spawnpoint: string): Promise<void> {
    if (!this.level || !this.tileset) return;
    const statuses = this.twoPlayers ? this.statuses : [this.statuses[0]];
    const controllers = this.twoPlayers ? [this.controller1, this.controller2] : [this.controller1];
    this.sector = new Sector(this.level, name, this.tileset, {
      players: this.twoPlayers ? 2 : 1, controllers, statuses, sound: this.sound, spawnpoint,
      onFinish: () => this.finishedLevel(),
      onSwitchSector: (s, sp) => { void this.switchSector(s, sp); },
      onDied: () => this.playerDied(),
    });
    this.currentSpawn = spawnpoint;
    this.state = 'level';
  }

  private finishedLevel(): void {
    if (!this.isComplete(this.currentFile)) this.save.completed.push(this.currentFile);
    this.save.coins = this.statuses[0].coins;
    const old = this.save.best?.[this.currentFile];
    const t = this.sector?.time ?? 0;
    this.save.best = { ...(this.save.best ?? {}) };
    this.save.best[this.currentFile] = old === undefined ? t : Math.min(old, t);
    const next = WORLD_LEVELS.find((f) => !this.isComplete(f));
    if (next) this.save.current = next;
    void this.saveGame();
    this.sound.play('sounds/tada.ogg');
    this.overlayTimer = 2;
    this.state = 'complete';
  }

  private playerDied(): void {
    this.overlayTimer = 1.5;
    this.state = 'dead';
    const coins = this.statuses[0].coins;
    const penalty = Math.max(25, Math.floor(coins / 10));
    this.statuses[0].coins = Math.max(0, coins - penalty);
    this.statuses[0].bonus = 0;
    this.save.coins = this.statuses[0].coins;
    const old = this.save.best?.[this.currentFile];
    const t = this.sector?.time ?? 0;
    this.save.best = { ...(this.save.best ?? {}) };
    this.save.best[this.currentFile] = old === undefined ? t : Math.min(old, t);
  }

  private showMessage(text: string): void {
    this.messageTimer = 4;
    if (this.sector) this.sector.showMessage(text);
    else this.mapMessage = text;
  }
  private mapMessage = '';

  private playMusicFile(music: string): void {
    if (music.endsWith('.music')) {
      void loadText(music.replace(/^\/+/, '')).then((text) => {
        const doc = parseSexp(text);
        const file = child(doc, 'file');
        if (file && typeof file[1] === 'string') {
          const dir = music.replace(/^\/+/, '').replace(/[^/]+$/, '');
          this.sound.playMusic(dir + file[1]);
        }
      }).catch(() => { /* no music */ });
    } else {
      this.sound.playMusic(music.replace(/^\/+/, ''));
    }
  }

  private frame(t: number, dtMs: number): void {
    void t;
    const dt = Math.min(0.05, Math.max(0, dtMs / 1000));
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < 8) {
      this.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === 8) this.acc = 0;
    this.render();
  }

  private step(dt: number): void {
    if (this.state === 'intro') {
      this.overlayTimer -= dt;
      if (this.overlayTimer <= 0) this.state = 'level';
      return;
    }
    if (this.state === 'complete') {
      this.overlayTimer -= dt;
      if (this.overlayTimer <= 0) { this.state = 'worldmap'; this.sector = null; this.mapIndex = Math.max(0, this.mapNodes.findIndex((n) => n.file === this.save.current)); }
      return;
    }
    if (this.state === 'dead') {
      this.overlayTimer -= dt;
      if (this.overlayTimer <= 0) { void this.startLevel(this.currentFile, this.currentSpawn); }
      return;
    }
    if (this.state !== 'level' || !this.sector) return;
    this.applyInput();
    this.sector.update(dt);
    this.padSnapshot();
    if (this.messageTimer > 0) this.messageTimer -= dt;
  }

  private applyInput(): void {
    const k = this.keys;
    const c1 = this.controller1, c2 = this.controller2;
    c1.set('LEFT', k.has('ArrowLeft')); c1.set('RIGHT', k.has('ArrowRight'));
    c1.set('UP', k.has('ArrowUp')); c1.set('DOWN', k.has('ArrowDown'));
    c1.set('JUMP', k.has('Space')); c1.set('ACTION', k.has('ControlLeft') || k.has('AltLeft') || k.has('KeyC'));
    c2.set('LEFT', k.has('KeyA')); c2.set('RIGHT', k.has('KeyD'));
    c2.set('UP', k.has('KeyW')); c2.set('DOWN', k.has('KeyS'));
    c2.set('JUMP', k.has('KeyW')); c2.set('ACTION', k.has('KeyF'));
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (let p = 0; p < Math.min(2, pads.length); p++) {
      const pad = pads[p];
      if (!pad) continue;
      const c = p === 0 ? c1 : c2;
      const press = (i: number): boolean => !!pad.buttons[i]?.pressed;
      const axis = pad.axes[0] ?? 0;
      c.set('LEFT', press(14) || axis < -0.4); c.set('RIGHT', press(15) || axis > 0.4);
      c.set('UP', press(12)); c.set('DOWN', press(13));
      c.set('JUMP', press(0)); c.set('ACTION', press(2) || press(1));
    }
  }

  private padSnapshot(): void {
    this.controller1.snapshot(); this.controller2.snapshot();
  }

  // ---- drawing ----
  private render(): void {
    const ctx = this.c2d;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    if (this.state === 'loading') {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      this.text('Loading SuperTux…', 40, 40, 2);
    } else if (this.state === 'menu' || this.state === 'help') {
      this.drawMenu(ctx);
    } else if (this.state === 'worldmap') {
      this.drawWorldmap(ctx);
    } else {
      this.drawGame(ctx);
    }
    if (this.state === 'paused') this.drawPause(ctx);
    if (this.state === 'intro') this.drawIntro(ctx);
    if (this.state === 'complete') this.drawOverlay(ctx, 'Level finished!', 'Press Enter to continue');
    if (this.state === 'dead') this.drawOverlay(ctx, 'Tux died', 'Press Enter to retry');
    ctx.restore();
  }

  private text(s: string, x: number, y: number, scale = 1, big = false): void {
    const f = big ? this.bigFont : this.font;
    if (f) f.draw(this.c2d, s, x, y, scale);
    else { this.c2d.fillStyle = '#fff'; this.c2d.font = `${16 * scale}px monospace`; this.c2d.fillText(s, x, y); }
  }

  private drawMenu(ctx: CanvasRenderingContext2D): void {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#1b2a4a'); g.addColorStop(1, '#0a1220');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const logo = imageReady('images/engine/menu/logo.png');
    if (logo) ctx.drawImage(logo, (VIEW_W - logo.width * 1.4) / 2, 110, logo.width * 1.4, logo.height * 1.4);
    else this.text('SuperTux', 480, 180, 4, true);
    if (this.state === 'help') {
      const lines = [
        'Controls', '',
        'Player 1: Arrow keys to walk, Space to jump, Ctrl or Alt to shoot.',
        'Player 2 (two players): A / D to walk, W to jump, S to duck, F to shoot.',
        'Gamepads work too (first pad is player 1, second pad player 2).',
        'Enter the doors and reach the end of a level to finish it.',
        'Esc opens the pause menu; the pause menu can leave the level.',
        '',
        'Press Enter or Esc to go back.',
      ];
      lines.forEach((l, i) => this.text(l, 110, 380 + i * 24, 1.4));
      return;
    }
    const items = ['Start Game (1 player)', 'Two Players (one computer)', 'Controls', 'Quit to the website'];
    items.forEach((item, i) => {
      const y = 430 + i * 40;
      if (i === this.menuIndex) {
        ctx.fillStyle = 'rgba(255,210,80,.25)'; ctx.fillRect(380, y - 4, 520, 32);
        ctx.fillStyle = '#ffd250'; ctx.fillRect(380, y - 4, 6, 32);
      }
      this.text(item, 400, y, 1.6);
    });
    const save = this.save.completed.length ? `Continue: ${this.save.completed.length} of ${WORLD_LEVELS.length} levels finished` : 'Icy Island, the original first world';
    this.text(save, 380, 610, 1.2);
    this.text('Up/Down, Enter — Esc quits', 380, 650, 1.1);
    this.drawCopyright(ctx);
  }

  private drawCopyright(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    this.text('SuperTux 0.6.3 (GPL-3.0-or-later) — port by freegames.stream', 380, 700, 1);
  }

  private mapCamera(): { x: number; y: number } {
    const n = this.mapNodes[this.mapIndex];
    if (!n || !this.map) return { x: 0, y: 0 };
    const w = this.map.sectors.values().next().value?.width ?? VIEW_W;
    const h = this.map.sectors.values().next().value?.height ?? VIEW_H;
    const x = Math.max(0, Math.min(n.x + 16 - VIEW_W / 2, Math.max(0, w - VIEW_W)));
    const y = Math.max(0, Math.min(n.y + 16 - VIEW_H / 2, Math.max(0, h - VIEW_H)));
    return { x, y };
  }

  private drawWorldmap(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#6f9fd0'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (!this.map) { this.text('The worldmap could not be loaded.', 100, 100, 2); return; }
    const cam = this.mapCamera();
    // background and layers
    const data = this.map.sectors.values().next().value;
    if (data) {
      for (const b of data.backgrounds) {
        if (b.color) { ctx.fillStyle = `rgb(${b.color.map((v) => Math.round(v * 255)).join(',')})`; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
      }
      const layers = [...this.mapLayers].sort((a, b) => a.data.z - b.data.z);
      for (const l of layers) l.draw(ctx, Math.round(cam.x), Math.round(cam.y), 0);
    }
    for (let i = 0; i < this.mapNodes.length; i++) {
      const n = this.mapNodes[i];
      const x = Math.round(n.x - cam.x), y = Math.round(n.y - cam.y);
      if (x < -60 || y < -60 || x > VIEW_W + 60 || y > VIEW_H + 60) continue;
      const complete = this.isComplete(n.file), unlocked = this.isUnlocked(i);
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, i === this.mapIndex ? 11 : 7, 0, Math.PI * 2);
      ctx.fillStyle = complete ? '#ffd250' : unlocked ? '#ffffff' : 'rgba(255,255,255,.28)';
      ctx.fill();
      ctx.strokeStyle = i === this.mapIndex ? '#ff4040' : 'rgba(0,0,0,.55)';
      ctx.lineWidth = i === this.mapIndex ? 3 : 1;
      ctx.stroke();
    }
    const n = this.mapNodes[this.mapIndex];
    if (n) {
      const tux = this.mapTux;
      if (tux) {
        tux.setAction('small-stop');
        tux.draw(ctx, n.x - cam.x - 4, n.y - cam.y - 22);
      }
      this.text(`${LEVEL_NAMES[n.file] ?? n.file}`, 30, 26, 1.4);
      this.text(`${this.save.completed.length} / ${WORLD_LEVELS.length} levels finished`, 30, 52, 1.1);
      this.text('Arrows move, Enter plays, Esc menu', 30, VIEW_H - 34, 1.1);
    }
    if (this.mapMessage) { this.text(this.mapMessage, 30, 80, 1.2); }
  }

  private drawGame(ctx: CanvasRenderingContext2D): void {
    if (!this.sector) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H); return; }
    this.sector.draw(ctx);
    // HUD
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0, 0, VIEW_W, 44);
    const status = this.sector.statuses[0];
    this.text(this.level?.name ?? '', 18, 12, 1.2);
    this.text(`Coins: ${status?.coins ?? 0}`, VIEW_W - 190, 12, 1.2);
    if (this.twoPlayers) this.text('P1', 18, 56, 1.1);
    if (this.messageTimer > 0 && this.sector.message) {
      const msg = this.decodeInfo(this.sector.message.text);
      const lines = msg.split('\n').slice(0, 5);
      ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(80, VIEW_H - 190, VIEW_W - 160, 150);
      lines.forEach((line, i) => this.text(line, 100, VIEW_H - 172 + i * 24, 1.15));
    }
  }

  private decodeInfo(text: string): string {
    return text.split('\n').filter((l) => !l.startsWith('!')).map((l) => l.replace(/^#/, '')).join('\n');
  }

  private drawPause(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.text('Paused', 540, 220, 3, true);
    const items = ['Resume', 'Restart level', 'Back to the worldmap', 'Quit to the website'];
    items.forEach((item, i) => {
      if (i === this.pauseIndex) this.text(`> ${item}`, 480, 330 + i * 40, 1.8);
      else this.text(`  ${item}`, 480, 330 + i * 40, 1.8);
    });
    this.text('Up/Down, Enter — Esc resumes', 480, 520, 1.2);
  }

  private drawIntro(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.text(this.level?.name ?? this.currentFile, 120, 330, 3, true);
    this.text(`from ${this.level?.author || 'SuperTux Team'}`, 120, 400, 1.4);
    this.text('Enter to start', 120, 470, 1.2);
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, title: string, sub: string): void {
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.text(title, 400, 340, 3, true);
    this.text(sub, 400, 400, 1.4);
  }

  stop(): void {
    this.stopped = true;
    this.sound.stopMusic();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.root.remove();
    this.style.remove();
  }
}

export const start: StartGame = (host, ctx) => new Supertux(host, ctx);
