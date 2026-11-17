// The screens around the levels: menu/WorldMap.cpp (with WorldBranch, LevelNode, NodeDrawer, WorldInput),
// menu/Pedometer.cpp (+ SolverDrawer), state/DemoMode.cpp, state/PosterScroller.cpp, option/MenuHelp.cpp,
// option/MenuOptions.cpp with its widgets (widget/*.cpp, RadioBox, SelectLang, Slider) and Labels.
import { LuaError, type LuaValue } from '../lua/interp.ts';
import { Level, LevelStatus, type LevelHost } from './level.ts';
import { Dialog, Planner, Scripter, argInt, argStr, optStr } from './script.ts';
import { cppSplit } from './anim.ts';
import { GameState } from './state.ts';
import type { Env } from './env.ts';
import { Framebuffer, type Pic } from '../ui/fb.ts';
import type { FontName } from '../ui/text.ts';

/** what the screens draw with (the browser gives it; headless there is none) */
export interface Gfx {
  fb: Framebuffer;
  pic(path: string): Pic | null;
  text(font: FontName, size: number, bytes: string, color: [number, number, number]): Pic;
  textWidth(font: FontName, size: number, bytes: string): number;
  /** the room painter draws the level */
  drawLevel(level: Level): void;
  drawSubtitles(): void;
}

/** the services the game gives its screens */
export interface Game {
  env: Env;
  /** the screen size changed (VideoAgent::initVideoMode) */
  setScreenSize(w: number, h: number): void;
  /** leave the game (the world map's Exit) */
  exit(): void;
  /** before a level runs: its pictures are loaded */
  prepareLevel?(codename: string): void;
}

// ---------------------------------------------------------------- Labels (widget/Labels.cpp)

class Labels extends Scripter {
  pack = new Map<string, Dialog[]>();
  constructor(env: Env) {
    super(env);
    this.reg('label_text', (a) => {
      const name = argStr(a, 0, 'label_text');
      let l = this.pack.get(name);
      if (!l) this.pack.set(name, (l = []));
      l.push(new Dialog(argStr(a, 1, 'label_text'), '', argStr(a, 2, 'label_text'), ''));
    });
    this.scriptInclude('script/labels.lua');
  }
  private find(name: string): Dialog | null {
    const pick = (lang: string) => {
      let best: Dialog | null = null, bestScore = 0;
      for (const d of this.pack.get(name) ?? []) {
        let s = 0;
        const n = Math.min(lang.length, d.lang.length);
        for (let i = 0; i < n; i++) { if (lang[i] === d.lang[i]) s++; else { s = 0; break; } }
        if (bestScore < s) { bestScore = s; best = d; }
      }
      return bestScore < 2 ? null : best;
    };
    return pick(this.env.options.getParam('lang')) ?? pick('en');
  }
  getLabel(name: string): string { return this.find(name)?.subtitle ?? '???'; }
  getFormatedLabel(name: string, args: string[]): string { return this.find(name)?.getFormatedSubtitle(args) ?? '???'; }
}

// ---------------------------------------------------------------- the world map

const STATE_HIDDEN = 0, STATE_FAR = 1, STATE_OPEN = 2, STATE_SOLVED = 3;

export class LevelNode {
  codename: string;
  datafile: string;
  loc: { x: number; y: number };
  poster: string;
  state = STATE_FAR;
  depth = 1;
  bestMoves = -1;
  bestAuthor = '';
  children: LevelNode[] = [];
  constructor(codename: string, datafile: string, loc: { x: number; y: number }, poster: string) {
    this.codename = codename;
    this.datafile = datafile;
    this.loc = loc;
    this.poster = poster;
  }
  setState(s: number): void {
    if (s === STATE_SOLVED) for (const c of this.children) if (c.state < STATE_OPEN) c.setState(STATE_OPEN);
    this.state = s;
  }
  isUnder(x: number, y: number): boolean {
    const dx = this.loc.x - x, dy = this.loc.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 13;
  }
  findSelected(x: number, y: number): LevelNode | null {
    if (this.state >= STATE_OPEN) {
      if (this.isUnder(x, y)) return this;
      for (const c of this.children) {
        const s = c.findSelected(x, y);
        if (s) return s;
      }
    }
    return null;
  }
  findOpenNodes(): LevelNode[] {
    const out: LevelNode[] = [];
    if (this.state >= STATE_OPEN) {
      if (this.state === STATE_OPEN) out.push(this);
      for (const c of this.children) out.push(...c.findOpenNodes());
    }
    return out;
  }
  findNextOpen(current: LevelNode | null): LevelNode | null {
    const opened = this.findOpenNodes();
    let before = true;
    for (const n of opened) {
      if (n === current) before = false;
      else if (!before) return n;
    }
    return opened[0] ?? null;
  }
  findNamed(codename: string): LevelNode | null {
    if (this.codename === codename) return this;
    for (const c of this.children) {
      const n = c.findNamed(codename);
      if (n) return n;
    }
    return null;
  }
  areAllSolved(): boolean {
    return this.state === STATE_SOLVED && this.children.every((c) => c.areAllSolved());
  }
  addChild(n: LevelNode): void {
    this.children.push(n);
    n.depth = this.depth + 1;
    if (this.state === STATE_SOLVED && n.state < STATE_OPEN) n.setState(STATE_OPEN);
  }
  isLeaf(): boolean { return this.children.length === 0; }
}

interface LevelDesc { lang: string; levelname: string; desc: string }

/** WorldBranch::parseMap: runs script/worldmap.lua */
export function parseMap(env: Env, mapfile: string): { root: LevelNode; ending: LevelNode | null; descs: Map<string, LevelDesc[]> } {
  const s = new Scripter(env);
  let root: LevelNode | null = null;
  let ending: LevelNode | null = null;
  const descs = new Map<string, LevelDesc[]>();
  const wasSolved = (c: string) => env.vfs.exists(LevelStatus.solutionFile(c));
  s.reg('worldmap_addDesc', (a) => {
    const c = argStr(a, 0, 'worldmap_addDesc');
    let l = descs.get(c);
    if (!l) descs.set(c, (l = []));
    l.push({ lang: argStr(a, 1, 'worldmap_addDesc'), levelname: argStr(a, 2, 'worldmap_addDesc'), desc: argStr(a, 3, 'worldmap_addDesc') });
  });
  s.reg('branch_addNode', (a) => {
    const parent = argStr(a, 0, 'branch_addNode');
    const node = new LevelNode(argStr(a, 1, 'branch_addNode'), argStr(a, 2, 'branch_addNode'),
      { x: argInt(a, 3, 'branch_addNode'), y: argInt(a, 4, 'branch_addNode') }, optStr(a, 6, 'branch_addNode', ''));
    const hidden = a[5] !== undefined && a[5] !== false;
    if (wasSolved(node.codename)) node.setState(STATE_SOLVED);
    else if (hidden) node.setState(STATE_HIDDEN);
    else node.setState(STATE_FAR);
    if (parent === '' && root) throw new LuaError(`there is a one root node already: ${root.codename}`);
    if (root) {
      const p = root.findNamed(parent);
      if (!p) throw new LuaError(`there is no such parent node: ${parent}`);
      p.addChild(node);
    } else root = node;
  });
  s.reg('branch_setEnding', (a) => {
    ending = new LevelNode(argStr(a, 0, 'branch_setEnding'), argStr(a, 1, 'branch_setEnding'), { x: -1, y: -1 }, optStr(a, 2, 'branch_setEnding', ''));
    ending.setState(wasSolved(ending.codename) ? STATE_SOLVED : STATE_OPEN);
    ending.depth = -1;
  });
  s.reg('node_bestSolution', (a) => {
    const n = root?.findNamed(argStr(a, 0, 'node_bestSolution'));
    if (n) { n.bestMoves = argInt(a, 1, 'node_bestSolution'); n.bestAuthor = argStr(a, 2, 'node_bestSolution'); }
  });
  s.scriptInclude(mapfile);
  if (!root) throw new Error(`cannot create world map: ${mapfile}`);
  const r = root as LevelNode;
  if (r.state < STATE_OPEN) r.setState(STATE_OPEN);
  return { root: r, ending, descs };
}

function bestDesc(env: Env, descs: Map<string, LevelDesc[]>, codename: string): LevelDesc | null {
  const pick = (lang: string) => {
    let best: LevelDesc | null = null, bestScore = 0;
    for (const d of descs.get(codename) ?? []) {
      let s = 0;
      const n = Math.min(lang.length, d.lang.length);
      for (let i = 0; i < n; i++) { if (lang[i] === d.lang[i]) s++; else { s = 0; break; } }
      if (bestScore < s) { bestScore = s; best = d; }
    }
    return bestScore < 2 ? null : best;
  };
  return pick(env.options.getParam('lang')) ?? pick('en');
}

/** the masks of the map's corners (map_mask.png) */
interface Masks { intro: number; exit: number; credits: number; options: number }

function maskAt(pic: Pic | null, x: number, y: number): number {
  if (!pic || x < 0 || y < 0 || x >= pic.w || y >= pic.h) return -1;
  const i = (y * pic.w + x) * 4;
  return ((pic.px[i] << 16) | (pic.px[i + 1] << 8) | pic.px[i + 2]) >>> 0;
}

/** LayeredPicture::drawOn: the lower layer where the mask has the active colour */
function drawLayered(gfx: Gfx, bg: string, lower: string, mask: string, x0: number, y0: number, active: number): void {
  const pic = gfx.pic(bg);
  if (pic) gfx.fb.blit(pic, x0, y0);
  if (active < 0) return;
  const lo = gfx.pic(lower), m = gfx.pic(mask);
  if (!lo || !m) return;
  for (let py = 0; py < m.h; py++) {
    for (let px = 0; px < m.w; px++) {
      if (maskAt(m, px, py) === active) {
        const i = (py * lo.w + px) * 4;
        if (lo.px[i + 3] === 255) gfx.fb.put(x0 + px, y0 + py, lo.px[i], lo.px[i + 1], lo.px[i + 2]);
      }
    }
  }
}

export class WorldMap extends GameState implements LevelHost {
  readonly name = 'state_worldmap';
  game: Game;
  root: LevelNode;
  ending: LevelNode | null;
  descs: Map<string, LevelDesc[]>;
  selected: LevelNode | null = null;
  levelStatus: LevelStatus;
  lastMouse = { x: -1, y: -1 };
  activeMask = -1;
  masks: Masks | null = null;
  maskPic: () => Pic | null = () => null;
  w = 640;
  h = 480;

  constructor(game: Game, mapfile = 'script/worldmap.lua') {
    super(game.env);
    this.game = game;
    this.levelStatus = new LevelStatus(game.env);
    const m = parseMap(game.env, mapfile);
    this.root = m.root;
    this.ending = m.ending;
    this.descs = m.descs;
  }

  findLevelName(codename: string): string { return bestDesc(this.env, this.descs, codename)?.levelname ?? codename; }
  findDesc(codename: string): string { return bestDesc(this.env, this.descs, codename)?.desc ?? '???'; }
  createDemo(script: string): GameState { return new DemoMode(this.game, script); }
  setScreenSize(w: number, h: number): void { this.game.setScreenSize(w, h); }
  createHelp(): GameState { return new MenuHelp(this.game); }
  createMenu(): GameState { return new MenuOptions(this.game); }

  protected ownInit(): void {
    this.levelStatus.setRunning(true);
    this.ownResume();
  }

  protected ownUpdate(): void {
    if (this.ending && this.selected === this.ending) this.runSelected();
    else this.watchCursor();
  }

  protected ownResume(): void {
    let next: LevelNode | null = null;
    if (this.levelStatus.wasRunning) {
      if (this.levelStatus.complete) {
        if (this.selected) this.selected.setState(STATE_SOLVED);
        if (this.checkEnding()) next = this.ending;
      }
      this.levelStatus.setRunning(false);
      this.env.options.setParam('screen_width', this.w);
      this.env.options.setParam('screen_height', this.h);
      this.game.setScreenSize(this.w, this.h);
    }
    this.selected = next;
    this.env.sound.playMusic(this.env.vfs.dataPath('music/menu.ogg'));
  }

  protected ownClean(): void { this.env.sound.stopMusic(); }

  private watchCursor(): void {
    const m = this.input().mouse();
    if (m.x !== this.lastMouse.x || m.y !== this.lastMouse.y) {
      this.lastMouse = { ...m };
      this.selected = this.root.findSelected(m.x, m.y);
    }
    const mask = maskAt(this.maskPic(), m.x, m.y);
    const k = this.masks;
    this.activeMask = k && (mask === k.intro || mask === k.exit || mask === k.credits || mask === k.options) ? mask : -1;
  }

  selectNextLevel(): void { this.selected = this.root.findNextOpen(this.selected); }

  runSelected(): void {
    const node = this.selected;
    if (node) {
      const level = new Level(this.env, this, node.codename, node.datafile, node.depth);
      this.levelStatus.prepareRun(node.codename, node.poster, node.bestMoves, node.bestAuthor);
      level.fillStatus(this.levelStatus);
      this.game.prepareLevel?.(node.codename);
      if (node.state === STATE_SOLVED) this.pushState(new Pedometer(this.game, this.levelStatus, level));
      else this.pushState(level);
      return;
    }
    const k = this.masks;
    if (!k || this.activeMask < 0) return;
    if (this.activeMask === k.intro) this.pushState(new DemoMode(this.game, 'script/share/demo_intro.lua'));
    else if (this.activeMask === k.exit) this.quitState();
    else if (this.activeMask === k.credits) this.pushState(new PosterScroller(this.game, 'images/menu/credits.png'));
    else if (this.activeMask === k.options) this.pushState(new MenuOptions(this.game));
  }

  private checkEnding(): boolean {
    return !!this.ending && this.selected !== this.ending && !!this.selected && this.selected.isLeaf() && this.root.areAllSolved();
  }

  keyDown(key: string): void {
    switch (key) {
      case 'Escape': this.quitState(); break;
      case 'Tab': this.selectNextLevel(); break;
      case 'Enter': this.runSelected(); break;
      case 'F1': this.pushState(new MenuHelp(this.game)); break;
      case 'F10': this.pushState(new MenuOptions(this.game)); break;
      case 'F6': this.env.options.setPersistent('subtitles', !this.env.options.getAsBool('subtitles')); break;
    }
  }

  mouseDown(_x: number, _y: number, button: number): void { if (button === 0) this.runSelected(); }

  draw(g: unknown): void {
    const gfx = g as Gfx;
    // the masks are read from the corners of map_mask.png once it is loaded
    const mp = gfx.pic(this.env.vfs.dataPath('images/menu/map_mask.png'));
    if (mp && !this.masks) {
      this.maskPic = () => mp;
      this.masks = { intro: maskAt(mp, 0, 0), exit: maskAt(mp, mp.w - 1, 0), credits: maskAt(mp, 0, mp.h - 1), options: maskAt(mp, mp.w - 1, mp.h - 1) };
    }
    const vfs = this.env.vfs;
    drawLayered(gfx, vfs.dataPath('images/menu/map.png'), vfs.dataPath('images/menu/map_lower.png'), vfs.dataPath('images/menu/map_mask.png'), 0, 0, this.activeMask);
    this.drawPath(gfx, this.root);
    if (this.selected) {
      const dot = gfx.pic(vfs.dataPath('images/menu/n0.png'));
      const radius = dot ? Math.trunc(Math.max(dot.w, dot.h) / 2) + 1 : 8;
      gfx.fb.filledCircle(this.selected.loc.x, this.selected.loc.y, radius, 0xffc61880);
      drawSelectedName(gfx, this.findLevelName(this.selected.codename));
    }
  }

  private drawPath(gfx: Gfx, n: LevelNode): void {
    if (n.state > STATE_HIDDEN) {
      for (const c of n.children) {
        if (c.state > STATE_HIDDEN) {
          const { x: x1, y: y1 } = n.loc, { x: x2, y: y2 } = c.loc;
          for (const [ox, oy] of [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1]]) gfx.fb.aaline(x1 + ox, y1 + oy, x2 + ox, y2 + oy, 0xffff00ff);
          this.drawPath(gfx, c);
        }
      }
      this.drawNode(gfx, n);
    }
  }

  private drawNode(gfx: Gfx, n: LevelNode): void {
    const vfs = this.env.vfs;
    const dot = (path: string) => {
      const p = gfx.pic(vfs.dataPath(path));
      if (p) gfx.fb.blit(p, n.loc.x - Math.trunc(p.w / 2), n.loc.y - Math.trunc(p.h / 2));
    };
    dot('images/menu/n_far.png');
    if (n.state === STATE_OPEN) {
      let phase = this.env.cycles % 10;
      if (phase > 4) phase--;
      if (phase > 7) phase--;
      if (phase >= 4) phase = 7 - phase;
      dot(`images/menu/n${phase + 1}.png`);
    } else if (n.state === STATE_SOLVED) dot('images/menu/n0.png');
  }
}

/** NodeDrawer::drawSelected */
function drawSelectedName(gfx: Gfx, name: string): void {
  const w = gfx.textWidth('menu', 22, name);
  const t = gfx.text('menu', 22, name, [255, 255, 0]);
  gfx.fb.blit(t, Math.trunc((gfx.fb.w - w) / 2), gfx.fb.h - 50);
}

// ---------------------------------------------------------------- Pedometer

export class Pedometer extends GameState {
  readonly name = 'state_pedometer';
  game: Game;
  level: Level | null;
  status: LevelStatus;
  solution: string;
  meterPhase = 0;
  activeMask = -1;
  masks: { run: number; replay: number; cancel: number } | null = null;
  maskPic: Pic | null = null;
  labels: Labels;
  constructor(game: Game, status: LevelStatus, level: Level) {
    super(game.env);
    this.game = game;
    this.status = status;
    this.level = level;
    this.solution = status.readSolvedMoves();
    this.labels = new Labels(game.env);
  }

  protected ownUpdate(): void {
    const m = this.input().mouse();
    const mask = maskAt(this.maskPic, m.x - 193, m.y - 141);
    const k = this.masks;
    this.activeMask = k && (mask === k.run || mask === k.replay || mask === k.cancel) ? mask : -1;
  }

  runSelected(): void {
    const k = this.masks;
    if (k && this.activeMask === k.run) this.runLevel();
    else if (k && this.activeMask === k.replay) this.runReplay();
    else this.quitState();
  }

  runLevel(): void {
    const level = this.level!;
    this.level = null;
    if (this.status.poster !== '') {
      const poster = new DemoMode(this.game, this.status.poster);
      poster.setNextState(level);
      this.changeState(poster);
    } else this.changeState(level);
  }

  runReplay(): void {
    const level = this.level!;
    this.level = null;
    this.changeState(level);
    level.loadReplay(this.solution);
  }

  keyDown(key: string): void {
    if (key === 'Escape') this.quitState();
    else if (key === 'F1') this.pushState(new MenuHelp(this.game));
    else if (key === 'F10') this.pushState(new MenuOptions(this.game));
  }
  mouseDown(_x: number, _y: number, button: number): void { if (button === 0) this.runSelected(); }

  draw(g: unknown): void {
    const gfx = g as Gfx;
    const vfs = this.env.vfs;
    const map = gfx.pic(vfs.dataPath('images/menu/map.png'));
    if (map) gfx.fb.blit(map, 0, 0);
    if (this.level) drawSelectedName(gfx, this.level.getLevelName());
    // SolverDrawer
    const label = ({ 1: 'solver_better', 0: 'solver_equals' } as Record<number, string>)[this.status.compareToBest()] ?? 'solver_worse';
    const text = this.labels.getFormatedLabel(label, ['', String(this.status.bestMoves), this.status.bestAuthor]);
    const lines = cppSplit(text, '\n').map((l) => (l === '' ? ' ' : l));
    const pics = lines.map((l) => gfx.text('menu', 14, l, [255, 255, 255]));
    const bw = Math.max(...pics.map((p) => p.w));
    let y = gfx.fb.h - 150;
    const x0 = Math.trunc((gfx.fb.w - bw) / 2);
    for (const p of pics) { gfx.fb.blit(p, x0 + Math.trunc((bw - p.w) / 2), y); y += p.h; }
    const mp = gfx.pic(vfs.dataPath('images/menu/pedometer_mask.png'));
    if (mp && !this.masks) {
      this.maskPic = mp;
      this.masks = { run: maskAt(mp, 86, 100), replay: maskAt(mp, 128, 100), cancel: maskAt(mp, 170, 100) };
    }
    drawLayered(gfx, vfs.dataPath('images/menu/pedometer.png'), vfs.dataPath('images/menu/pedometer_lower.png'), vfs.dataPath('images/menu/pedometer_mask.png'), 193, 141, this.activeMask);
    // the rotating numbers
    const numbers = gfx.pic(vfs.dataPath('images/menu/numbers.png'));
    if (numbers) {
      let value = this.solution.length;
      const nw = numbers.w, nh = Math.trunc(numbers.h / 10);
      for (let i = 4; i >= 0; --i) {
        const cipher = value % 10;
        value = Math.trunc(value / 10);
        const shiftY = Math.max(nh * (9 - cipher), nh * 9 - 8 * this.meterPhase);
        this.meterPhase++;
        gfx.fb.blit(numbers, 275 + nw * i, 177, 0, shiftY, nw, nh);
      }
    }
  }
}

// ---------------------------------------------------------------- DemoMode and posters

export class DemoMode extends GameState {
  readonly name = 'state_demo';
  game: Game;
  script: Planner;
  demoscript: string;
  display: { path: string; x: number; y: number } | null = null;
  oldLimitY = 0;
  started = false;
  buffer: Framebuffer | null = null;
  constructor(game: Game, demoscript: string) {
    super(game.env);
    this.game = game;
    this.demoscript = demoscript;
    this.script = new Planner(game.env);
    this.script.reg('demo_display', (a: LuaValue[]) => {
      const path = this.env.vfs.dataPath(argStr(a, 0, 'demo_display'));
      this.display = { path, x: argInt(a, 1, 'demo_display'), y: argInt(a, 2, 'demo_display') };
      if (!this.started) {
        this.started = true;
        this.pendingSize = true;
      }
    });
  }
  private pendingSize = false;

  protected ownInit(): void {
    this.oldLimitY = this.env.subtitles.limitY;
    this.script.scriptInclude(this.demoscript);
  }

  protected ownUpdate(): void {
    if (this.script.satisfyPlan()) this.quitState();
  }

  protected ownClean(): void {
    this.display = null;
    this.env.subtitles.limitY = this.oldLimitY;
    this.script.killPlan();
  }

  keyDown(key: string): void {
    if (key === ' ' || key === 'Escape') this.quitState();
    else if (key === 'F1') this.pushState(new MenuHelp(this.game));
    else if (key === 'F10') this.pushState(new MenuOptions(this.game));
  }
  mouseDown(): void { this.quitState(); }

  draw(g: unknown): void {
    const gfx = g as Gfx;
    if (this.display) {
      const p = gfx.pic(this.display.path);
      if (p && this.pendingSize) {
        // DemoMode::action_display: the screen takes the picture's size
        this.pendingSize = false;
        this.env.options.setParam('screen_width', p.w);
        this.env.options.setParam('screen_height', p.h);
        this.env.subtitles.limitY = 2 * p.h;
        this.game.setScreenSize(p.w, p.h);
        return;
      }
      // the picture is drawn into a buffer that keeps what was drawn before
      if (!this.buffer || this.buffer.w !== gfx.fb.w || this.buffer.h !== gfx.fb.h) {
        this.buffer = new Framebuffer(gfx.fb.w, gfx.fb.h);
        this.buffer.clear();
      }
      if (p) this.buffer.blit(p, this.display.x, this.display.y);
    }
    if (this.buffer) gfx.fb.blit(this.buffer, 0, 0);
    gfx.drawSubtitles();
  }
}

export class PosterScroller extends GameState {
  readonly name = 'state_poster';
  game: Game;
  picture: string;
  shift = 0;
  screenH = 0;
  y = 0;
  constructor(game: Game, picture: string) {
    super(game.env);
    this.game = game;
    this.picture = game.env.vfs.dataPath(picture);
  }
  allowBg(): boolean { return true; }
  protected ownInit(): void {
    this.screenH = this.env.options.getAsInt('screen_height');
    this.shift = -this.screenH + 4;
  }
  private picH = 0;
  protected ownUpdate(): void {
    const maxShift = Math.min(this.shift, this.picH - Math.trunc(this.screenH / 3));
    this.y = -maxShift;
    this.shift += 4;
    if (this.picH > 0 && this.shift > this.picH) this.quitState();
  }
  keyDown(key: string): void { if (key === ' ' || key === 'Escape') this.quitState(); }
  mouseDown(): void { this.quitState(); }
  draw(g: unknown): void {
    const gfx = g as Gfx;
    const p = gfx.pic(this.picture);
    if (!p) return;
    this.picH = p.h;
    gfx.fb.blit(p, 0, this.y);
  }
}

// ---------------------------------------------------------------- MenuHelp

export class MenuHelp extends GameState {
  readonly name = 'state_help';
  game: Game;
  labels: Labels;
  constructor(game: Game) {
    super(game.env);
    this.game = game;
    this.labels = new Labels(game.env);
  }
  allowBg(): boolean { return true; }
  keyDown(key: string): void {
    if (key === 'Escape') this.quitState();
    else if (key === 'F10') this.pushState(new MenuOptions(this.game));
    else if (key !== 'F1') this.quitState();
  }
  mouseDown(): void { this.quitState(); }
  draw(g: unknown): void {
    const gfx = g as Gfx;
    gfx.fb.alphaFill(0, 0, 0, 129);
    const lines = cppSplit(this.labels.getLabel('help'), '\n').map((l) => (l === '' ? ' ' : l));
    const pics = lines.map((l) => gfx.text('menu', 14, l, [255, 255, 255]));
    const w = Math.max(...pics.map((p) => p.w)), h = pics.reduce((s, p) => s + p.h, 0);
    let y = Math.trunc((gfx.fb.h - h) / 2);
    const x = Math.trunc((gfx.fb.w - w) / 2);
    for (const p of pics) { gfx.fb.blit(p, x, y); y += p.h; }
  }
}

// ---------------------------------------------------------------- MenuOptions and its widgets

interface Widget {
  x: number; y: number; w: number; h: number;
  tip: string;
  setShift(x: number, y: number): void;
  draw(gfx: Gfx): void;
  click(x: number, y: number): void;
  getTip(x: number, y: number): string;
}

abstract class Base implements Widget {
  x = 0; y = 0; w = 0; h = 0; tip = '';
  setShift(x: number, y: number): void { this.x = x; this.y = y; }
  abstract draw(gfx: Gfx): void;
  inside(x: number, y: number): boolean { return x - this.x >= 0 && x - this.x < this.w && y - this.y >= 0 && y - this.y < this.h; }
  click(x: number, y: number): void { if (this.inside(x, y)) this.ownClick(x, y); }
  ownClick(_x: number, _y: number): void {}
  getTip(x: number, y: number): string { return this.inside(x, y) ? this.ownTip(x, y) : ''; }
  ownTip(_x: number, _y: number): string { return this.tip; }
}

class Space extends Base {
  constructor(w: number, h: number) { super(); this.w = w; this.h = h; }
  draw(): void {}
}

class Picture extends Base {
  path: string;
  constructor(path: string, size: { w: number; h: number }) { super(); this.path = path; this.w = size.w; this.h = size.h; }
  draw(gfx: Gfx): void { const p = gfx.pic(this.path); if (p) gfx.fb.blit(p, this.x, this.y); }
}

class Box extends Base {
  kids: Widget[] = [];
  vertical: boolean;
  constructor(vertical: boolean) { super(); this.vertical = vertical; }
  add(k: Widget): void {
    this.kids.push(k);
    if (this.vertical) { k.setShift(this.x, this.y + this.h); this.w = Math.max(this.w, k.w); this.h += k.h; } else { k.setShift(this.x + this.w, this.y); this.w += k.w; this.h = Math.max(this.h, k.h); }
  }
  setShift(x: number, y: number): void {
    super.setShift(x, y);
    let o = 0;
    for (const k of this.kids) {
      if (this.vertical) { k.setShift(x, y + o); o += k.h; } else { k.setShift(x + o, y); o += k.w; }
    }
  }
  draw(gfx: Gfx): void { for (const k of this.kids) k.draw(gfx); }
  ownClick(x: number, y: number): void { for (const k of this.kids) k.click(x, y); }
  ownTip(x: number, y: number): string {
    if (this.tip !== '') return this.tip;
    for (const k of this.kids) { const t = k.getTip(x, y); if (t !== '') return t; }
    return '';
  }
}

class Slider extends Base {
  param: string;
  env: Env;
  constructor(env: Env, param: string) { super(); this.env = env; this.param = param; this.w = 200; this.h = 30; }
  draw(gfx: Gfx): void {
    const v = this.env.options.getAsInt(this.param);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) gfx.fb.blend(this.x + x, this.y + y, 0, 0, 0, 129);
    const slide = Math.min(100, Math.max(0, v)) * 2;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < slide; x++) gfx.fb.put(this.x + x, this.y + y, 0, 255, 0);
  }
  ownClick(x: number): void {
    const value = Math.trunc((x - this.x) / 2 + 0.5);
    this.env.options.setPersistent(this.param, value);
  }
}

class RadioBox extends Base {
  env: Env; param: string; value: string; pic: Picture;
  constructor(env: Env, param: string, value: string, pic: Picture) {
    super();
    this.env = env; this.param = param; this.value = value; this.pic = pic;
    this.w = pic.w + 8; this.h = pic.h + 8;
  }
  setShift(x: number, y: number): void { super.setShift(x, y); this.pic.setShift(x + 4, y + 4); }
  draw(gfx: Gfx): void {
    if (this.env.options.getParam(this.param) === this.value) {
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) gfx.fb.put(this.x + x, this.y + y, 0, 255, 0);
    }
    this.pic.draw(gfx);
  }
  ownClick(): void { this.env.options.setPersistent(this.param, this.value); }
}

class Button extends Base {
  pic: Picture; action: () => void;
  constructor(pic: Picture, action: () => void) { super(); this.pic = pic; this.action = action; this.w = pic.w; this.h = pic.h; }
  setShift(x: number, y: number): void { super.setShift(x, y); this.pic.setShift(x, y); }
  draw(gfx: Gfx): void { this.pic.draw(gfx); }
  ownClick(): void { this.action(); }
}

class StatusBar extends Base {
  label = '';
  constructor(w: number) { super(); this.w = w; this.h = 19; }
  draw(gfx: Gfx): void { if (this.label !== '') gfx.fb.blit(gfx.text('menu', 16, this.label, [0, 255, 0]), this.x, this.y); }
}

/** the sizes of the menu's pictures, so the layout is known before they are drawn */
export const MENU_PICTURE_SIZES = new Map<string, { w: number; h: number }>();

export class MenuOptions extends GameState {
  readonly name = 'state_options';
  game: Game;
  container: Box | null = null;
  statusBar: StatusBar | null = null;
  needRefresh = false;
  private langWatch = (name: string) => { if (name === 'lang') this.needRefresh = true; };
  constructor(game: Game) {
    super(game.env);
    this.game = game;
    this.prepareMenu();
  }
  allowBg(): boolean { return true; }

  private size(path: string): { w: number; h: number } { return MENU_PICTURE_SIZES.get(path) ?? { w: 32, h: 32 }; }
  private picture(file: string): Picture {
    const p = this.env.vfs.dataPath(file);
    return new Picture(p, this.size(p));
  }

  private selectLang(option: string, file: string): Box {
    const box = new Box(true);
    let row = new Box(false);
    const s = new Scripter(this.env);
    s.reg('select_addFlag', (a) => {
      const value = argStr(a, 0, 'select_addFlag');
      const flag = new RadioBox(this.env, option, value, this.picture(argStr(a, 1, 'select_addFlag')));
      flag.tip = value;
      row.add(flag);
      if (row.w > 200) { box.add(row); row = new Box(false); }
    });
    s.scriptInclude(file);
    box.add(row);
    return box;
  }

  private prepareMenu(): void {
    const labels = new Labels(this.env);
    const panel = (pic: string, w: Widget, tip: string) => {
      const b = new Box(false);
      b.add(this.picture(pic));
      b.add(new Space(10, 0));
      b.add(w);
      b.tip = labels.getLabel(tip);
      return b;
    };
    const sound = panel('images/menu/volume_sound.png', new Slider(this.env, 'volume_sound'), 'menu_sound');
    const music = panel('images/menu/volume_music.png', new Slider(this.env, 'volume_music'), 'menu_music');
    const subs = new Box(false);
    subs.add(new RadioBox(this.env, 'subtitles', '1', this.picture('images/menu/subtitles/yes.png')));
    subs.add(new RadioBox(this.env, 'subtitles', '0', this.picture('images/menu/subtitles/no.png')));
    const vbox = new Box(true);
    vbox.add(sound);
    vbox.add(new Space(0, 10));
    vbox.add(music);
    vbox.add(new Space(0, 10));
    vbox.add(panel('images/menu/lang.png', this.selectLang('lang', 'script/select_lang.lua'), 'menu_lang'));
    vbox.add(new Space(0, 5));
    vbox.add(panel('images/menu/speech.png', this.selectLang('speech', 'script/select_speech.lua'), 'menu_speech'));
    vbox.add(new Space(0, 5));
    vbox.add(panel('images/menu/subtitle.png', subs, 'menu_subtitles'));
    const back = new Button(this.picture('images/menu/back.png'), () => this.quitState());
    back.tip = labels.getLabel('menu_back');
    this.statusBar = new StatusBar(music.w - back.w);
    const backBox = new Box(false);
    backBox.add(this.statusBar);
    backBox.add(back);
    vbox.add(backBox);
    this.container = vbox;
  }

  protected ownInit(): void {
    this.env.options.watchers.push(this.langWatch);
    this.ownResume();
  }
  protected ownClean(): void {
    const i = this.env.options.watchers.indexOf(this.langWatch);
    if (i >= 0) this.env.options.watchers.splice(i, 1);
  }
  protected ownResume(): void {
    const c = this.container!;
    c.setShift(Math.trunc((this.env.options.getAsInt('screen_width') - c.w) / 2), Math.trunc((this.env.options.getAsInt('screen_height') - c.h) / 2));
  }
  protected ownUpdate(): void {
    if (this.needRefresh) {
      this.needRefresh = false;
      this.prepareMenu();
      this.ownResume();
    }
    const m = this.input().mouse();
    this.statusBar!.label = this.container!.getTip(m.x, m.y);
  }
  keyDown(key: string): void {
    if (key === 'Escape' || key === 'F10') this.quitState();
    else if (key === 'F1') this.pushState(new MenuHelp(this.game));
  }
  mouseDown(x: number, y: number, button: number): void { if (button === 0) this.container!.click(x, y); }
  draw(g: unknown): void {
    const gfx = g as Gfx;
    gfx.fb.alphaFill(0xf0, 0xf0, 0xf0, 129);
    this.container!.draw(gfx);
  }
}
