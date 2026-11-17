// The program around the engine: the main menu, the level pack menu, the level menu with previews, the
// game with its status bar, mouse input and game menu (gui/*.cc, client.cc, game.cc), and the player's
// state (solved levels and times) kept in server storage.
import { LevelSession, GameLoop, SV } from './engine/level.ts';
import {
  server, player, world, display, host, rng, V2, GetFloor, type Value,
} from './engine/core.ts';
import { textSource } from './engine/objects/stones1.ts';
import { Renderer, drawModel, FONT, GAME_W, GAME_H, type ImageLookup } from './render.ts';
import { fromBytes } from './lua/lib.ts';
import type { SoundPlayer, MenuMusic } from './sound.ts';

export interface PackInfo { dir: string; title: string; group: string; levels: { id: string; title: string; author: string; file: string; easy: boolean }[] }
export interface Platform {
  g: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  img: ImageLookup;
  packs: PackInfo[];
  loadPack(dir: string): Promise<Record<string, string>>;
  libs: Record<string, string>;
  sound: SoundPlayer | null;
  music: MenuMusic | null;
  storage: { get(name: string): Promise<Uint8Array | null>; put(name: string, d: Uint8Array): Promise<void> };
  /** CSS pixels per game pixel, for the mouse speed */
  scale(): number;
  exit(): void;
  lockPointer(): void;
  unlockPointer(): void;
  pointerLocked(): boolean;
}

interface Button { x: number; y: number; w: number; h: number; label?: string; image?: string; act: () => void }

// ------------------------------------------------------------------ state.xml

interface LevelScore { easy?: number; difficult?: number }
export class State {
  props = new Map<string, string>();
  scores = new Map<string, LevelScore>();
  parse(xml: string) {
    for (const m of xml.matchAll(/<property key="([^"]*)" value="([^"]*)"\/>/g)) this.props.set(m[1], unescape(m[2]));
    for (const m of xml.matchAll(/<level id="([^"]*)"([^>]*)\/>/g)) {
      const s: LevelScore = {};
      const e = /easy="([^"]*)"/.exec(m[2]), d = /difficult="([^"]*)"/.exec(m[2]);
      if (e) s.easy = Number(e[1]);
      if (d) s.difficult = Number(d[1]);
      this.scores.set(unescape(m[1]), s);
    }
  }
  toXml(): string {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    let x = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<state>\n  <properties>\n';
    for (const [k, v] of this.props) x += `    <property key="${esc(k)}" value="${esc(v)}"/>\n`;
    x += '  </properties>\n  <levels>\n';
    for (const [id, s] of this.scores) {
      x += `    <level id="${esc(id)}"${s.easy !== undefined ? ` easy="${s.easy}"` : ''}${s.difficult !== undefined ? ` difficult="${s.difficult}"` : ''}/>\n`;
    }
    return x + '  </levels>\n</state>\n';
  }
}
function unescape(s: string) { return s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }

// ------------------------------------------------------------------ the application

type Screen = 'main' | 'packs' | 'levels' | 'game' | 'gamemenu' | 'help' | 'error';

export class EnigmaApp {
  p: Platform;
  r: Renderer;
  state = new State();
  screen: Screen = 'main';
  buttons: Button[] = [];
  hover = -1;
  pack = 0;
  levelIdx = 0;
  firstShown = 0;
  difficult = true;
  packTexts = new Map<string, Record<string, string>>();
  previews = new Map<string, HTMLCanvasElement | 'error'>();
  session: LevelSession | null = null;
  loop: GameLoop | null = null;
  totalTime = 0;
  mouse = { dx: 0, dy: 0 };
  mouseSpeed = 4;
  errorText = '';
  helpLines: string[] = [];

  constructor(p: Platform) {
    this.p = p;
    this.r = new Renderer(p.g, p.img);
    host.showText = (s) => { this.r.textInterruptible = false; this.r.showText(fromBytes(s), true, -1); };
    host.sound = (n, x, y, v) => this.p.sound?.emit(n, x, y, v);
    player.onInventory = () => { this.r.updateInventory(); };
  }

  async init() {
    const raw = await this.p.storage.get('state.xml').catch(() => null);
    if (raw) this.state.parse(new TextDecoder().decode(raw));
    const pk = this.state.props.get('CurrentPack');
    const pi = this.p.packs.findIndex((x) => x.dir === pk);
    this.pack = pi >= 0 ? pi : Math.max(0, this.p.packs.findIndex((x) => x.title === 'Tutorial'));
    this.levelIdx = Number(this.state.props.get('CurrentLevel') ?? 0) || 0;
    this.difficult = this.state.props.get('Difficulty') !== '1';
    this.mouseSpeed = Number(this.state.props.get('MouseSpeed') ?? 4) || 4;
    this.toMain();
  }
  private async save() {
    this.state.props.set('CurrentPack', this.p.packs[this.pack].dir);
    this.state.props.set('CurrentLevel', String(this.levelIdx));
    this.state.props.set('Difficulty', this.difficult ? '2' : '1');
    this.state.props.set('MouseSpeed', String(this.mouseSpeed));
    await this.p.storage.put('state.xml', new TextEncoder().encode(this.state.toXml())).catch(() => {});
  }

  // ---------------------------------------------------------- screens
  toMain() {
    this.screen = 'main';
    this.p.music?.start();
    this.buttons = [
      { x: 80, y: 200, w: 200, h: 50, label: 'Start Game', act: () => this.toLevels() },
      { x: 80, y: 260, w: 200, h: 50, label: 'Level Pack', act: () => this.toPacks() },
      { x: 360, y: 200, w: 200, h: 50, label: 'Help', act: () => this.toHelp() },
      { x: 360, y: 260, w: 200, h: 50, label: 'Quit', act: () => this.p.exit() },
    ];
  }
  toPacks() {
    this.screen = 'packs';
    const groups = [...new Set(this.p.packs.map((x) => x.group))];
    this.buttons = [];
    let col = 0;
    for (const g of groups) {
      const list = this.p.packs.map((x, i) => ({ x, i })).filter((e) => e.x.group === g);
      list.forEach((e, k) => {
        this.buttons.push({ x: 20 + col * 155, y: 70 + k * 36, w: 145, h: 30, label: e.x.title, act: () => { this.pack = e.i; this.levelIdx = 0; this.firstShown = 0; void this.save(); this.toLevels(); } });
      });
      col++;
    }
    this.buttons.push({ x: 480, y: 430, w: 140, h: 35, label: 'Main Menu', act: () => this.toMain() });
  }
  toHelp() {
    this.screen = 'help';
    this.helpLines = [
      'Enigma 1.30 - find and open all pairs of identical Oxyd stones.',
      '', 'Move the mouse to accelerate the marble.',
      'Left mouse button:  activate/drop leftmost inventory item',
      'Right mouse button / Tab:  rotate inventory items',
      'Escape:  game menu        F3:  kill current marble',
      'Shift+F3:  restart the level        F4/F5:  next level',
      'Left/right arrow:  change mouse speed',
      '', 'Enigma is free software (GNU GPL, version 2 or later).',
      'Copyright (C) 2002-2021 Daniel Heck and contributors.',
      'Port for freegames.stream: see the game page for credits.',
    ];
    this.buttons = [{ x: 250, y: 420, w: 140, h: 35, label: 'Back', act: () => this.toMain() }];
  }
  toLevels() {
    this.screen = 'levels';
    this.p.unlockPointer();
    this.p.music?.start();
    const pk = this.p.packs[this.pack];
    if (this.levelIdx >= pk.levels.length) this.levelIdx = 0;
    if (this.levelIdx < this.firstShown || this.levelIdx >= this.firstShown + 12) this.firstShown = Math.floor(this.levelIdx / 4) * 4;
    void this.ensurePack(pk.dir);
    this.layoutLevels();
  }
  private layoutLevels() {
    const pk = this.p.packs[this.pack];
    this.buttons = [];
    for (let k = 0; k < 12; k++) {
      const i = this.firstShown + k;
      if (i >= pk.levels.length) break;
      const x = 10 + 3 / 2 + (k % 4) * (147 + 3), y = 60 + Math.floor(k / 4) * (122 + 1);
      this.buttons.push({ x, y, w: 147, h: 122, act: () => { if (this.levelIdx === i) void this.startLevel(); else this.levelIdx = i; } });
    }
    const page = (d: number) => {
      this.firstShown = Math.max(0, Math.min(this.firstShown + d, Math.max(0, Math.ceil(pk.levels.length / 4) * 4 - 12)));
      this.layoutLevels();
    };
    this.buttons.push({ x: 610, y: 70, w: 20, h: 50, image: 'ic-up', act: () => page(-12) });
    this.buttons.push({ x: 610, y: 130, w: 20, h: 50, image: 'ic-down', act: () => page(12) });
    this.buttons.push({ x: 610, y: 270, w: 20, h: 50, image: 'ic-top', act: () => page(-100000) });
    this.buttons.push({ x: 610, y: 330, w: 20, h: 50, image: 'ic-bottom', act: () => page(100000) });
    this.buttons.push({ x: 25, y: 430, w: 90, h: 35, image: 'ic-unsolved', act: () => this.nextUnsolved() });
    this.buttons.push({ x: 125, y: 430, w: 90, h: 35, image: 'ic-next', act: () => void this.startLevel() });
    this.buttons.push({ x: 225, y: 430, w: 90, h: 35, image: this.difficult ? 'ic-normalmode' : 'ic-easymode', act: () => { this.difficult = !this.difficult; void this.save(); this.layoutLevels(); } });
    this.buttons.push({ x: 325, y: 430, w: 140, h: 35, label: 'Level Pack', act: () => this.toPacks() });
    this.buttons.push({ x: 475, y: 430, w: 140, h: 35, label: 'Main Menu', act: () => this.toMain() });
  }
  private nextUnsolved() {
    const pk = this.p.packs[this.pack];
    for (let k = 1; k <= pk.levels.length; k++) {
      const i = (this.levelIdx + k) % pk.levels.length;
      if (!this.isSolved(pk.levels[i].id)) { this.levelIdx = i; this.toLevels(); return; }
    }
  }
  isSolved(id: string, difficult = this.difficult) {
    const s = this.state.scores.get(id);
    return !!s && (difficult ? s.difficult !== undefined : s.easy !== undefined || s.difficult !== undefined);
  }
  private async ensurePack(dir: string) {
    if (this.packTexts.has(dir)) return this.packTexts.get(dir)!;
    const t = await this.p.loadPack(dir);
    this.packTexts.set(dir, t);
    return t;
  }

  // ---------------------------------------------------------- previews (LevelPreviewCache)
  private makePreview(xml: string): HTMLCanvasElement | 'error' {
    try {
      const s = new LevelSession(xml, this.libSource(), this.difficult);
      textSource.get = (k) => s.localized(k);
      server.CreatingPreview = true;
      s.load(false);
      const c = document.createElement('canvas');
      c.width = GAME_W; c.height = GAME_H;
      const r = new Renderer(c.getContext('2d')!, this.p.img);
      r.follower.reset();
      // the preview shows the level's first screen at the player's position
      const a = player.mainActor(0);
      if (a) r.follower.center(a.ai.pos);
      r.drawGame();
      const t = document.createElement('canvas');
      t.width = 120; t.height = 78;
      const g = t.getContext('2d')!;
      g.imageSmoothingQuality = 'high';
      g.drawImage(c, 0, 0, 120, 78);
      return t;
    } catch (e) { console.warn('enigma: preview failed', e); return 'error'; } finally { server.CreatingPreview = false; }
  }
  libSource() { return { get: (path: string, release: number) => this.p.libs[`${path}_${release}.xml`] ?? this.p.libs[`${path}.xml`] ?? null }; }

  // ---------------------------------------------------------- the game
  async startLevel() {
    const pk = this.p.packs[this.pack];
    const texts = await this.ensurePack(pk.dir);
    const lv = pk.levels[this.levelIdx];
    this.p.music?.stop();
    void this.save();
    this.session = new LevelSession(texts[lv.file], this.libSource(), this.difficult);
    textSource.get = (k) => this.session!.localized(k);
    this.loadCurrent(false);
  }
  private loadCurrent(isRestart: boolean) {
    const s = this.session!;
    try {
      s.load(isRestart);
    } catch (e) {
      this.showError(`Server Error: could not load level '${s.info.title}'\n${(e as Error).message}`);
      return;
    }
    const loop = new GameLoop(s);
    this.loop = loop;
    loop.onSolved = (t) => this.solved(t);
    loop.onFinished = () => this.advance();
    loop.onReload = (r) => this.loadCurrent(r);
    this.totalTime = 0;
    this.r.follower.reset();
    const a = player.mainActor(0);
    if (a) this.r.follower.center(a.ai.pos);
    this.r.updateInventory();
    const info = s.info;
    let text = `"${info.title || 'Another nameless level'}"`;
    if (info.author) text += ` by ${info.author}`;
    if (info.subtitle && info.subtitle !== 'subtitle') text += ` - "${info.subtitle}"`;
    this.r.textInterruptible = false;
    this.r.showText(text, true, 2.0);
    loop.start();
    this.screen = 'game';
    this.buttons = [];
    this.p.lockPointer();
  }
  private solved(time: number) {
    const id = this.p.packs[this.pack].levels[this.levelIdx].id;
    const s = this.state.scores.get(id) ?? {};
    const t = Math.round(time);
    if (this.difficult) s.difficult = s.difficult === undefined ? t : Math.min(s.difficult, t);
    else s.easy = s.easy === undefined ? t : Math.min(s.easy, t);
    this.state.scores.set(id, s);
    void this.save();
  }
  private advance() {
    const pk = this.p.packs[this.pack];
    if (this.levelIdx + 1 < pk.levels.length) { this.levelIdx++; void this.startLevel(); }
    else this.toLevels();
  }
  showError(t: string) {
    this.screen = 'error';
    this.errorText = t;
    this.p.unlockPointer();
    this.buttons = [{ x: 250, y: 420, w: 140, h: 35, label: 'Ok', act: () => this.toLevels() }];
  }
  toGameMenu() {
    this.screen = 'gamemenu';
    this.p.unlockPointer();
    const mk = (y: number, label: string, act: () => void): Button => ({ x: 200, y, w: 240, h: 35, label, act });
    this.buttons = [
      mk(110, 'Resume Level (ESC)', () => this.resume()),
      mk(155, 'Restart Level (Shift-F3)', () => { this.resume(); this.loop?.restartLevel(); }),
      mk(200, 'Level Info', () => { this.resume(); this.showLevelInfo(); }),
      mk(245, 'Abort Level', () => { this.loop = null; this.toLevels(); }),
      mk(290, 'Exit Enigma (Shift-ESC)', () => this.p.exit()),
    ];
  }
  private showLevelInfo() {
    const info = this.session?.info;
    if (info) { this.r.textInterruptible = false; this.r.showText(`"${info.title}" by ${info.author}`, true, 3.0); }
  }
  resume() { this.screen = 'game'; this.buttons = []; this.p.lockPointer(); }

  // ---------------------------------------------------------- input
  onMouseMove(dx: number, dy: number) {
    if (this.screen === 'game' && this.p.pointerLocked()) { this.mouse.dx += dx; this.mouse.dy += dy; }
  }
  onPointer(x: number, y: number) {
    this.hover = this.buttons.findIndex((b) => x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h);
  }
  onClick(x: number, y: number, button: number) {
    if (this.screen === 'game') {
      if (!this.p.pointerLocked()) { this.p.lockPointer(); return; }
      if (button === 0) player.activateFirstItem();
      else if (button === 2) player.rotateInventory(1);
      return;
    }
    const b = this.buttons.find((b) => x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h);
    if (b) { this.p.sound?.emit('menuok', 0, 0, 1); b.act(); }
  }
  onPointerLockLost() { if (this.screen === 'game') this.toGameMenu(); }
  onKey(e: KeyboardEvent) {
    if (this.screen === 'game') {
      switch (e.code) {
        case 'Escape': if (e.shiftKey) this.p.exit(); else this.toGameMenu(); break;
        case 'F3': if (e.shiftKey) this.loop?.restartLevel(); else if (server.AllowSuicide) player.suicide(); break;
        case 'Tab': player.rotateInventory(1); break;
        case 'ArrowLeft': this.setMouseSpeed(this.mouseSpeed - 1); break;
        case 'ArrowRight': this.setMouseSpeed(this.mouseSpeed + 1); break;
        case 'F4': case 'F5': this.advance(); break;
        case 'KeyA': if (e.ctrlKey) this.loop?.restartLevel(); break;
        default: return false;
      }
      return true;
    }
    if (e.code === 'Escape') {
      if (this.screen === 'gamemenu') this.resume();
      else if (this.screen === 'levels' || this.screen === 'packs' || this.screen === 'help') this.toMain();
      return true;
    }
    if (this.screen === 'levels') {
      const n = this.p.packs[this.pack].levels.length;
      const mv = (d: number) => { this.levelIdx = Math.max(0, Math.min(n - 1, this.levelIdx + d)); this.toLevels(); };
      switch (e.code) {
        case 'ArrowLeft': mv(-1); return true;
        case 'ArrowRight': mv(1); return true;
        case 'ArrowUp': mv(-4); return true;
        case 'ArrowDown': mv(4); return true;
        case 'Enter': void this.startLevel(); return true;
      }
    }
    return false;
  }
  private setMouseSpeed(s: number) {
    this.mouseSpeed = Math.max(1, Math.min(15, s));
    this.r.textInterruptible = true;
    this.r.showText(`Mouse speed: ${this.mouseSpeed}`, false, 2.0);
    void this.save();
  }

  // ---------------------------------------------------------- the frame
  private accu = 0;
  frame(dt: number) {
    if (this.screen === 'game' && this.loop) {
      this.accu = Math.min(this.accu + dt, 0.1);
      const steps = Math.floor(this.accu / 0.01 + 1e-9);
      const scale = this.p.scale() || 1;
      for (let i = 0; i < steps; i++) {
        // the mouse motion of this frame, spread over its 10 ms ticks (the original polls every 10 ms)
        const fx = this.mouse.dx / steps / scale * this.mouseSpeed, fy = this.mouse.dy / steps / scale * this.mouseSpeed;
        world.mouseForce.x += fx; world.mouseForce.y += fy;
        this.loop.tick(0.01);
        if (this.loop.state !== SV.idle) this.totalTime += 0.01;
        this.r.tickStatus(0.01);
        const a = player.mainActor(player.current);
        if (a) this.r.follower.tick(0.01, a.ai.pos);
        if (!this.loop || this.screen !== 'game') break;
      }
      this.accu -= steps * 0.01;
      this.mouse.dx = this.mouse.dy = 0;
      if (this.p.sound) { const o = this.r.follower.offset; this.p.sound.view = { x: o.x, y: o.y, w: 20, h: 13 }; }
    } else if (this.screen === 'levels') this.previewStep();
    this.draw();
  }
  private previewStep() {
    const pk = this.p.packs[this.pack];
    const texts = this.packTexts.get(pk.dir);
    if (!texts) return;
    for (let k = 0; k < 12; k++) {
      const lv = pk.levels[this.firstShown + k];
      if (lv && !this.previews.has(lv.file)) { this.previews.set(lv.file, this.makePreview(texts[lv.file])); return; }
    }
  }

  draw() {
    const g = this.p.g;
    if (this.screen === 'game' || this.screen === 'gamemenu') {
      this.r.drawGame();
      this.r.drawStatus(this.totalTime, server.ShowMoves ? server.moveCounter : null);
      if (this.screen === 'gamemenu') {
        g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 0, 640, 480);
        this.drawButtons();
      } else if (!this.p.pointerLocked()) {
        g.font = `16px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center';
        g.fillText('Click to continue', 320, 200);
        g.textAlign = 'left';
      }
      return;
    }
    const bg = this.p.img('menu_bg');
    if (bg) g.drawImage(bg, 0, 0); else { g.fillStyle = '#000'; g.fillRect(0, 0, 640, 480); }
    g.textAlign = 'left';
    if (this.screen === 'main') {
      const logo = this.p.img('enigma_logo3');
      if (logo) g.drawImage(logo, (640 - (logo as HTMLImageElement).width) / 2, 57);
      g.font = `12px ${FONT}`; g.fillStyle = '#ddd';
      g.fillText('Enigma v1.30', 5, 472);
    } else if (this.screen === 'packs') {
      g.font = `20px ${FONT}`; g.fillStyle = '#fff'; g.fillText('Level Packs', 20, 40);
    } else if (this.screen === 'help') {
      g.font = `16px ${FONT}`; g.fillStyle = '#fff';
      this.helpLines.forEach((l, i) => g.fillText(l, 40, 60 + i * 26));
    } else if (this.screen === 'error') {
      g.font = `16px ${FONT}`; g.fillStyle = '#fff';
      this.errorText.split('\n').forEach((l, i) => g.fillText(l.slice(0, 80), 20, 60 + i * 24));
    } else if (this.screen === 'levels') this.drawLevels();
    this.drawButtons();
  }
  private drawLevels() {
    const g = this.p.g;
    const pk = this.p.packs[this.pack];
    const lv = pk.levels[this.levelIdx];
    g.font = `16px ${FONT}`; g.fillStyle = '#fff';
    if (lv) {
      g.fillText(`${this.levelIdx + 1}: ${lv.title}`, 5, 30);
      g.font = `14px ${FONT}`; g.fillStyle = '#ccc';
      const s = this.state.scores.get(lv.id);
      const st = s ? (this.difficult ? s.difficult : s.easy) : undefined;
      g.fillText(`by ${lv.author}` + (st !== undefined ? `   your time: ${Math.floor(st / 60)}:${String(st % 60).padStart(2, '0')}` : ''), 5, 52);
    }
    g.textAlign = 'right'; g.font = `16px ${FONT}`; g.fillStyle = '#fff';
    const solved = pk.levels.filter((l) => this.isSolved(l.id)).length;
    g.fillText(`${pk.title}  ${solved}/${pk.levels.length}`, 635, 30);
    g.textAlign = 'left';
    for (let k = 0; k < 12; k++) {
      const i = this.firstShown + k;
      const l = pk.levels[i];
      if (!l) break;
      const xpos = 10 + 1 + (k % 4) * (147 + 3), ypos = 60 + Math.floor(k / 4) * (122 + 1);
      const imgx = xpos + (147 - 120) / 2, imgy = ypos + 4;
      const pv = this.previews.get(l.file);
      if (i === this.levelIdx) { const b = this.p.img('thumbborder-120x78'); if (b) g.drawImage(b, imgx - 4, imgy - 4); }
      if (pv instanceof HTMLCanvasElement) {
        if (i !== this.levelIdx) g.filter = 'brightness(0.67)';
        g.drawImage(pv, imgx, imgy);
        g.filter = 'none';
      } else {
        const e = this.p.img(pv === 'error' ? 'error-120x78' : 'ic-obsolete-120x78');
        if (e && pv === 'error') g.drawImage(e, imgx, imgy); else { g.fillStyle = '#222'; g.fillRect(imgx, imgy, 120, 78); }
      }
      const sc = this.state.scores.get(l.id);
      if (l.easy) { const im = this.p.img(sc?.easy !== undefined ? 'completed-easy' : 'ic-feather'); if (im) g.drawImage(im, imgx + 3, imgy); }
      if (sc?.difficult !== undefined) { const im = this.p.img('completed'); if (im) g.drawImage(im, imgx + 8, imgy); }
      g.font = `12px ${FONT}`; g.fillStyle = i === this.levelIdx ? '#fff' : '#aaa'; g.textAlign = 'center';
      let t = l.title;
      while (g.measureText(t).width > 140 && t.length > 3) t = t.slice(0, -2) + '…';
      g.fillText(t, xpos + 147 / 2, imgy + 78 + 18);
      g.textAlign = 'left';
    }
  }
  private drawButtons() {
    const g = this.p.g;
    this.buttons.forEach((b, i) => {
      if (b.label === undefined && b.image === undefined) return;
      if (b.image) {
        const im = this.p.img(b.image);
        if (b.w >= 80) { const bg = this.p.img(i === this.hover ? 'buttonhl' : 'button'); if (bg) g.drawImage(bg, b.x, b.y, b.w, b.h); }
        if (im) g.drawImage(im, b.x + (b.w - (im as HTMLImageElement).width) / 2, b.y + (b.h - (im as HTMLImageElement).height) / 2);
        return;
      }
      const bg = this.p.img(i === this.hover ? 'buttonhl' : 'button');
      if (bg) g.drawImage(bg, b.x, b.y, b.w, b.h);
      else { g.fillStyle = i === this.hover ? '#666' : '#333'; g.fillRect(b.x, b.y, b.w, b.h); }
      g.font = `16px ${FONT}`; g.fillStyle = i === this.hover ? 'rgb(180,180,180)' : '#fff';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(b.label!, b.x + b.w / 2, b.y + b.h / 2);
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    });
  }
}
export const _keep = [display, rng, V2, GetFloor, drawModel];
export type { Value };
