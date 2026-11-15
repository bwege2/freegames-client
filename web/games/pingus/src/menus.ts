// The menus: PingusMenu with its MenuButtons and scrolling LayerManager background (screens/pingus_menu.cpp,
// components/menu_button.cpp, layer_manager.cpp), the LevelMenu with Levelset (screens/level_menu.cpp,
// levelset.cpp), the StoryScreen (screens/story_screen.cpp, worldmap/worldmap_story.cpp) and the Credits
// (screens/credits.cpp).
import { globals, playMusic, playSound } from './common.ts';
import { Fonts, breakLine } from './fonts.ts';
import { type DrawingContext, SceneContext, rect, rgba } from './gfx.ts';
import { Component, GUIScreen, RectComponent, SCREEN_H, SCREEN_W, ScreenManager, SurfaceButton, TickButton, contains } from './gui.ts';
import { data, loadSurface } from './res.ts';
import { SavegameManager, StatManager } from './saves.ts';
import { type FileReader, SExprReader } from './sexpr.ts';
import { StartScreen, drawBoard } from './session.ts';
import { Sprite } from './sprite.ts';
import { type PingusLevel, loadLevel } from './world.ts';

const tr = Math.trunc;

/** what the menu's buttons do that the browser cannot (the editor, the options) or does its own way (exit) */
export const menuHooks = {
  exit: () => {},
  editor: () => {},
  options: () => {},
  startWorldmap: (_file: string) => {},
};

class LayerManager {
  private layers: { sur: Sprite; x: number; y: number; xu: number; yu: number; xo: number; yo: number }[] = [];
  add(sur: Sprite, xo: number, yo: number, xu: number, yu: number) { this.layers.push({ sur, x: 0, y: 0, xu, yu, xo, yo }); }
  draw(gc: DrawingContext) {
    const f = Math.fround;
    for (const l of this.layers) {
      gc.draw3(l.sur, { x: f(l.x + l.xo), y: f(l.y + l.yo) });
      gc.draw3(l.sur, { x: f(f(l.x + l.xo) - gc.width), y: f(l.y + l.yo) });
    }
  }
  update(delta: number) {
    if (globals.staticGraphics) return;
    const f = Math.fround;
    for (const l of this.layers) {
      l.x = f(f(l.x + f(l.xu * delta)) % SCREEN_W);
      l.y = f(f(l.y + f(l.yu * delta)) % SCREEN_H);
    }
  }
}

class MenuButton extends Component {
  private menu: PingusMenu;
  private surface = Sprite.load('core/menu/menuitem');
  private highlight = Sprite.load('core/menu/menuitem_highlight');
  private text: string;
  readonly desc: string;
  x: number;
  y: number;
  private over = false;
  constructor(menu: PingusMenu, x: number, y: number, text: string, desc: string) {
    super();
    this.menu = menu; this.x = x; this.y = y; this.text = text; this.desc = desc;
  }
  draw(gc: DrawingContext) {
    gc.draw(this.surface, this.x, this.y);
    if (this.over) gc.draw(this.highlight, this.x, this.y);
    gc.printCenter(Fonts.chalkLarge, this.x, this.y - 28, this.text);
  }
  onPrimaryButtonClick() { this.menu.onClick(this); }
  onPointerEnter() { this.over = true; playSound('tick'); this.menu.hint = this.desc; }
  onPointerLeave() { this.over = false; this.menu.hint = ''; }
  isAt(x: number, y: number) {
    const w = this.surface.width, h = this.surface.height;
    return x > this.x - tr(w / 2) && x < this.x + tr(w / 2) && y > this.y - tr(h / 2) && y < this.y + tr(h / 2);
  }
}

export class PingusMenu extends GUIScreen {
  hint = '';
  private help = '..:: Ctrl-g: mouse grab   ::   F10: fps counter   ::   F11: fullscreen   ::   F12: screenshot ::..';
  private background = new LayerManager();
  private logo = Sprite.load('core/misc/logo');
  private start: MenuButton;
  private quit: MenuButton;
  private editor: MenuButton;
  private contrib: MenuButton;
  private options: MenuButton;
  constructor() {
    super();
    const w = SCREEN_W, h = SCREEN_H;
    this.start = new MenuButton(this, w / 2 - 125, h / 2 - 20, 'Story', '..:: Start the game ::..');
    this.editor = new MenuButton(this, w / 2 + 125, h / 2 - 20, 'Editor', '..:: Create your own levels ::..');
    this.options = new MenuButton(this, w / 2 + 125, h / 2 + 50, 'Options', '..:: Configure the game ::..');
    this.contrib = new MenuButton(this, w / 2 - 125, h / 2 + 50, 'Levelsets', '..:: Play User Built levels ::..');
    this.quit = new MenuButton(this, w / 2, h / 2 + 120, 'Exit', '..:: Bye, bye ::..');
    for (const b of [this.quit, this.options, this.contrib, this.start, this.editor]) this.gui.add(b);
    const l = (n: number) => Sprite.fromSurface(loadSurface(`core/menu/layer${n}`));
    this.background.add(l(1), 0, 0, 12, 0);
    this.background.add(l(2), 0, 150, 25, 0);
    this.background.add(l(3), 0, 200, 50, 0);
    this.background.add(l(4), 0, 429, 100, 0);
    this.background.add(l(5), 0, 500, 200, 0);
    playMusic('pingus-1.it');
  }
  drawBackground(gc: DrawingContext) {
    this.background.draw(gc);
    gc.draw(this.logo, tr(gc.width / 2) - tr(this.logo.width / 2), tr(gc.height / 2) - 280);
    gc.printLeft(Fonts.pingusSmall, tr(gc.width / 2) - 400 + 25, gc.height - 140,
      'Pingus 0.7.6 - Copyright (C) 1998-2011 Ingo Ruhnke <grumbel@gmail.com>\n'
      + 'See the file AUTHORS for a complete list of contributors.\n'
      + 'Pingus comes with ABSOLUTELY NO WARRANTY. This is free software, and you are\n'
      + 'welcome to redistribute it under certain conditions; see the file COPYING for details.\n');
    gc.drawFillrect(rect(0, SCREEN_H - 26, SCREEN_W, SCREEN_H), rgba(0, 0, 0, 255));
    gc.printCenter(Fonts.pingusSmall, tr(gc.width / 2), gc.height - Fonts.pingusSmall.height - 8, this.help);
  }
  onClick(b: MenuButton) {
    if (b === this.start) { playSound('letsgo'); menuHooks.startWorldmap('worldmaps/tutorial.worldmap'); }
    else if (b === this.quit) ScreenManager.instance.pop();
    else if (b === this.editor) menuHooks.editor();
    else if (b === this.contrib) ScreenManager.instance.push(new LevelMenu());
    else if (b === this.options) menuHooks.options();
  }
  update(delta: number) { this.background.update(delta); super.update(delta); }
  onStartup() {}
}

// ---- levelsets ----

export class Levelset {
  title = '';
  description = '';
  sprite: Sprite | null = null;
  developerOnly = false;
  priority = 0;
  completion = 0;
  levels: { resname: string; plf: PingusLevel; accessible: boolean; finished: boolean }[] = [];
  static fromFile(path: string): Levelset {
    const r = SExprReader.parse(data().text(path) ?? '');
    if (r.getName() !== 'pingus-levelset') throw new Error(`Error: ${path}: not a 'pingus-levelset' file`);
    const l = new Levelset();
    l.title = r.readString('title') ?? '';
    l.description = r.readString('description') ?? '';
    const img = r.readString('image');
    if (img !== undefined) l.sprite = Sprite.load(img);
    l.developerOnly = r.readBool('developer-only') ?? false;
    l.priority = r.readFloat('priority') ?? 0;
    const locked = r.readBool('locked') ?? true;
    if (!l.developerOnly || globals.developerMode) {
      for (const s of r.section('levels').getSections()) {
        if (s.getName() !== 'level') continue;
        const f = s.readString('filename');
        if (f !== undefined) l.addLevel(f, !locked);
      }
    }
    l.refresh();
    return l;
  }
  addLevel(resname: string, accessible: boolean) {
    try { this.levels.push({ resname, plf: loadLevel(resname), accessible, finished: false }); } catch { /* failed to load */ }
  }
  refresh() {
    for (const l of this.levels) {
      const s = SavegameManager.instance.get(l.resname);
      if (s) { l.accessible = s.status !== 'none'; l.finished = s.status === 'finished'; }
    }
    if (this.levels.length) {
      this.levels[0].accessible = true;
      for (let i = 0; i < this.levels.length - 1; i++) if (this.levels[i].finished) this.levels[i + 1].accessible = true;
    }
    this.completion = this.levels.filter((l) => l.finished).length;
    if (this.levels.length) this.completion = Math.max(0, Math.min(tr(this.completion * 100 / this.levels.length), 100));
  }
}

/** the levelset files the menu offers (levelsets/*.levelset) */
export function levelsetFiles(): string[] { return data().list('levelsets').filter((f) => f.endsWith('.levelset')); }

class LevelsetSelector extends RectComponent {
  private menu: LevelMenu;
  levelsets: Levelset[] = [];
  private current: Levelset | null = null;
  private marker = Sprite.load('core/menu/marker');
  page = 0;
  private list = rect(30, 70, 680 - 90, 70 + 4 * 95);
  constructor(menu: LevelMenu) {
    super(rect(0, 0, 0, 0));
    this.menu = menu;
    for (const f of levelsetFiles()) {
      try {
        const l = Levelset.fromFile(f);
        if (!l.developerOnly || globals.developerMode) this.levelsets.push(l);
      } catch { /* logged by the original */ }
    }
    // "Under Construction" (every level in levels/) needs developer mode and is not offered here
    this.levelsets = this.levelsets.map((l, i) => ({ l, i })).sort((a, b) => b.l.priority - a.l.priority || a.i - b.i).map((e) => e.l);
  }
  draw(gc: DrawingContext) {
    gc.pushModelview();
    gc.translateBy(this.rect.left, this.rect.top);
    gc.printCenter(Fonts.chalkLarge, tr((this.rect.right - this.rect.left) / 2), 10, 'Levelsets');
    let y = this.list.top;
    for (let i = this.page; i < this.page + 4 && i < this.levelsets.length; i++) {
      const l = this.levelsets[i];
      if (l === this.current) gc.draw(this.marker, 15, y - 5);
      if (l.sprite) gc.draw(l.sprite, this.list.left + 10, y);
      gc.printLeft(Fonts.chalkNormal, this.list.left + 105, 15 + y, l.title);
      gc.printLeft(Fonts.chalkSmall, this.list.left + 105, 40 + y, l.description);
      gc.printRight(Fonts.chalkNormal, this.list.right, 15 + y, `Solved: ${l.completion}%`);
      gc.printRight(Fonts.chalkSmall, this.list.right, 40 + y, `${l.levels.length} levels`);
      y += 95;
    }
    gc.popModelview();
  }
  nextPage() { this.page += 1; if (this.page >= this.levelsets.length - 4) this.page = Math.max(0, this.levelsets.length - 4); }
  prevPage() { this.page = Math.max(0, this.page - 1); }
  onPointerLeave() { this.current = null; }
  onPointerMove(x: number, y: number) {
    x -= this.rect.left; y -= this.rect.top;
    if (!contains(this.list, x, y)) { this.current = null; return; }
    y -= this.list.top;
    if (this.levelsets.length) {
      const i = tr(y / 95) + this.page;
      this.current = i >= 0 && i < this.levelsets.length ? this.levelsets[i] : null;
    }
  }
  onPrimaryButtonPress(x: number, y: number) { this.onPointerMove(x, y); if (this.current) this.menu.setLevelset(this.current); }
}

class LevelSelector extends RectComponent {
  private marker = Sprite.load('core/menu/marker2');
  private marked = Sprite.load('core/menu/checkbox_marked_small');
  private locked = Sprite.load('core/menu/locked_small');
  private checkbox = Sprite.load('core/menu/checkbox_small');
  levelset: Levelset | null = null;
  private current = -1;
  page = 0;
  private list = rect(50, 112, 680 - 90, 112 + 10 * 32);
  constructor() { super(rect(0, 0, 0, 0)); }
  draw(gc: DrawingContext) {
    const ls = this.levelset!;
    gc.pushModelview();
    gc.translateBy(this.rect.left, this.rect.top);
    const w = this.rect.right - this.rect.left;
    if (ls.sprite) {
      gc.draw(ls.sprite, tr(w / 2) - tr(ls.sprite.width / 2) - 275, 15);
      gc.draw(ls.sprite, tr(w / 2) - tr(ls.sprite.width / 2) + 275, 15);
    }
    gc.printCenter(Fonts.chalkLarge, tr(w / 2), 10, ls.title);
    gc.printCenter(Fonts.chalkNormal, tr(w / 2), 62, ls.description);
    ls.refresh();
    let y = this.list.top;
    for (let i = this.page; i < this.page + 10 && i < ls.levels.length; i++) {
      const l = ls.levels[i];
      if (l.accessible && i === this.current) gc.draw(this.marker, 20, y);
      gc.printLeft(Fonts.chalkNormal, this.list.left + 40, y + 4, globals.developerMode ? l.plf.resname : l.plf.levelname);
      gc.draw(!l.accessible ? this.locked : l.finished ? this.marked : this.checkbox, this.list.left, y);
      y += 32;
    }
    gc.popModelview();
  }
  prevPage() { this.page = Math.max(0, this.page - 1); }
  nextPage() {
    const n = this.levelset!.levels.length;
    this.page += 1;
    if (this.page >= n - 10) this.page = Math.max(0, n - 10);
  }
  setLevelset(l: Levelset) { this.page = 0; this.levelset = l; }
  onPointerLeave() { this.current = -1; }
  onPointerMove(x: number, y: number) {
    x -= this.rect.left; y -= this.rect.top;
    if (!contains(this.list, x, y)) { this.current = -1; return; }
    y -= this.list.top;
    this.current = tr(y / 32) + this.page;
    if (this.current < 0 || this.current >= this.levelset!.levels.length) this.current = -1;
  }
  onPrimaryButtonPress(x: number, y: number) {
    this.onPointerMove(x, y);
    if (this.current !== -1 && this.levelset!.levels[this.current].accessible) {
      ScreenManager.instance.push(new StartScreen(this.levelset!.levels[this.current].plf));
    }
  }
}

class ScrollButton extends SurfaceButton {
  private cb: () => void;
  constructor(x: number, y: number, base: string, cb: () => void) { super(x, y, base, base + '_pressed', base + '_hover'); this.cb = cb; }
  onClick() { this.cb(); }
  onPointerEnter() { super.onPointerEnter(); playSound('tick'); }
}

class BackButton extends TickButton {
  draw(gc: DrawingContext) { super.draw(gc); gc.printCenter(Fonts.chalkNormal, this.x + 55, this.y, 'Back'); }
}

export class LevelMenu extends GUIScreen {
  private bg = Sprite.load('core/menu/wood');
  private board = Sprite.load('core/menu/blackboard');
  private levelsetSelector: LevelsetSelector;
  private levelSelector: LevelSelector;
  constructor() {
    super();
    this.levelsetSelector = this.gui.add(new LevelsetSelector(this));
    this.levelSelector = this.gui.add(new LevelSelector());
    this.gui.add(new ScrollButton(SCREEN_W / 2 + 280, SCREEN_H / 2 - 48 - 12, 'core/menu/arrow_up', () => this.prevPage()));
    this.gui.add(new ScrollButton(SCREEN_W / 2 + 280, SCREEN_H / 2 + 12, 'core/menu/arrow_down', () => this.nextPage()));
    this.gui.add(new BackButton(SCREEN_W / 2 - 300, SCREEN_H / 2 + 200, 'core/start/back', () => this.onEscapePress()));
    this.levelSelector.hide();
    const x = (SCREEN_W - globals.defaultScreenWidth) / 2, y = (SCREEN_H - globals.defaultScreenHeight) / 2;
    this.levelsetSelector.setRect(rect(x + 60, y + 50, x + 60 + 680, y + 50 + 500));
    this.levelSelector.setRect(rect(x + 60, y + 50, x + 60 + 680, y + 50 + 500));
  }
  drawBackground(gc: DrawingContext) { drawBoard(gc, this.bg, this.board); }
  onEscapePress() {
    if (this.levelSelector.visible) { this.levelsetSelector.show(); this.levelSelector.hide(); }
    else ScreenManager.instance.pop();
  }
  onActionUpPress() { this.prevPage(); }
  onActionDownPress() { this.nextPage(); }
  nextPage() { if (this.levelSelector.visible) this.levelSelector.nextPage(); else this.levelsetSelector.nextPage(); }
  prevPage() { if (this.levelSelector.visible) this.levelSelector.prevPage(); else this.levelsetSelector.prevPage(); }
  setLevelset(l: Levelset) { this.levelSelector.setLevelset(l); this.levelsetSelector.hide(); this.levelSelector.show(); }
}

// ---- stories and credits ----

export class WorldmapStory {
  title: string;
  music: string;
  pages: { image: { name: string; modifier: string }; text: string; name: string }[] = [];
  constructor(r: FileReader) {
    this.title = r.readString('title') ?? '';
    this.music = r.readString('music') ?? '';
    let desc = { name: '', modifier: 'ROT0' }, text = '';
    for (const p of r.section('pages').getSections()) {
      desc = p.readDesc('surface') ?? desc;
      text = p.readString('text') ?? text;
      this.pages.push({ image: desc, text: breakLine(text, 570, Fonts.chalkNormal), name: p.getName() });
    }
    this.pages.reverse();
    if (!this.pages.length) throw new Error('WorldmapStory: Worldmap does not include a valid story');
  }
}

class StoryScreenComponent extends Component {
  private bg = Sprite.load('core/menu/wood');
  private board = Sprite.load('core/menu/blackboard');
  private displayText = '';
  private time = 0;
  private complete = false;
  readonly story: WorldmapStory;
  private pages: WorldmapStory['pages'];
  private page: WorldmapStory['pages'][number];
  private pageSurface: Sprite;
  private credits: boolean;
  constructor(story: WorldmapStory, credits: boolean) {
    super();
    this.story = story;
    this.credits = credits;
    this.pages = [...story.pages];
    this.page = this.pages[this.pages.length - 1];
    this.pageSurface = Sprite.load(this.page.image);
  }
  draw(gc: DrawingContext) {
    drawBoard(gc, this.bg, this.board);
    const cx = tr(gc.width / 2), cy = tr(gc.height / 2);
    gc.printCenter(Fonts.chalkLarge, cx, cy - 200, this.story.title);
    gc.draw(this.pageSurface, cx, cy - 65);
    gc.printLeft(Fonts.chalkNormal, cx - 280, cy + 35, this.displayText);
  }
  update(delta: number) {
    this.time = Math.fround(this.time + delta);
    if (this.complete) return;
    const len = tr(Math.fround(20 * this.time));
    const chars = [...this.page.text];
    this.displayText = chars.slice(0, Math.min(chars.length, len)).join('');
    if (chars.length < len) this.complete = true;
  }
  skip() { this.complete = true; while (this.pages.length > 1) this.pages.pop(); this.nextText(); }
  nextText() {
    if (!this.complete) { this.complete = true; this.displayText = this.page.text; return; }
    this.pages.pop();
    if (this.pages.length) {
      this.page = this.pages[this.pages.length - 1];
      this.pageSurface = Sprite.load(this.page.image);
      this.displayText = '';
      this.time = 0;
      this.complete = false;
    } else if (this.credits) {
      ScreenManager.instance.replace(new Credits());
    } else {
      ScreenManager.instance.pop();
    }
  }
}

export class StoryScreen extends GUIScreen {
  private comp: StoryScreenComponent;
  constructor(r: FileReader, credits = false) {
    super();
    this.comp = this.gui.add(new StoryScreenComponent(new WorldmapStory(r), credits));
    const next = new TickButton(SCREEN_W / 2 + 220 + 40, SCREEN_H / 2 + 180 + 32, 'core/misc/next', () => this.comp.nextText(), ['', '_hover']);
    this.gui.add(next);
    if (globals.developerMode) this.gui.add(new SkipButton(SCREEN_W - 4, SCREEN_H - 26, () => this.comp.skip()));
  }
  onFastForwardPress() { this.comp.nextText(); }
  onEscapePress() { ScreenManager.instance.pop(); }
  onStartup() { playMusic(this.comp.story.music, 0.7); }
}

class SkipButton extends SurfaceButton {
  private cb: () => void;
  constructor(x: number, y: number, cb: () => void) { super(x, y, '', '', ''); this.cb = cb; }
  draw(gc: DrawingContext) { gc.printRight(Fonts.chalkSmall, this.x, this.y, 'skip'); }
  isAt(x: number, y: number) {
    return x > this.x - tr(Fonts.chalkSmall.width('skip')) && x < this.x && y > this.y && y < this.y + Fonts.chalkSmall.height;
  }
  onPointerEnter() { super.onPointerEnter(); playSound('tick'); }
  onClick() { this.cb(); }
}

export class Credits extends GUIScreen {
  private sc = new SceneContext(rect(0, 0, SCREEN_W, SCREEN_H));
  private fast = false;
  private bg = Sprite.load('core/menu/wood');
  private board = Sprite.load('core/menu/blackboard');
  private pingu = Sprite.load('core/misc/creditpingu');
  private endOffset: number;
  private offset = 0;
  private lines: string[];
  constructor() {
    super();
    this.gui.add(new TickButton(SCREEN_W / 2 + 260, SCREEN_H / 2 + 170, 'core/start/ok', () => { this.onEscapePress(); playSound('yipee'); }));
    const text = data().text('credits/pingus.credits');
    this.lines = text === null ? ['couldn\'t open credits/pingus.credits'] : text.split('\n');
    if (text !== null && text.endsWith('\n')) this.lines.pop();
    let end = -SCREEN_H / 2 - 50;
    for (const l of this.lines) {
      if (l[0] === '-') end += Fonts.chalkNormal.height + 5;
      else if (l[0] === '_') end += Fonts.chalkLarge.height + 5;
      else if (l[0] === 'n') end += 50;
    }
    this.endOffset = -end;
  }
  update(delta: number) {
    super.update(delta);
    if (this.offset >= this.endOffset) this.offset = Math.fround(this.offset - Math.fround((this.fast ? 450 : 35) * delta));
  }
  drawBackground(gc: DrawingContext) {
    for (let y = 0; y < gc.height; y += this.bg.height) for (let x = 0; x < gc.width; x += this.bg.width) gc.draw(this.bg, x, y);
    const x = SCREEN_W / 2, y = tr(this.offset);
    gc.draw(this.board, tr(gc.width / 2), tr(gc.height / 2));
    gc.draw(this.pingu, tr(gc.width / 2), tr(gc.height / 2) - 20);
    let yof = 0;
    this.sc.clear();
    this.sc.setCliprect(rect(tr(gc.width / 2) - tr(685 / 2), tr(gc.height / 2) - 250, tr(gc.width / 2) + tr(685 / 2), tr(gc.height / 2) + 250));
    for (const l of this.lines) {
      if (l[0] === '-') { this.sc.color().printCenter(Fonts.chalkNormal, x, y + yof, l.slice(1)); yof += Fonts.chalkNormal.height + 5; }
      else if (l[0] === '_') { this.sc.color().printCenter(Fonts.chalkLarge, x, y + yof, l.slice(1)); yof += Fonts.chalkLarge.height + 5; }
      else if (l[0] === 'n') yof += 50;
    }
    gc.drawScene(this.sc, 100);
  }
  onStartup() { this.offset = SCREEN_H - 50; }
  onFastForwardPress() { this.fast = !this.fast; }
  onEscapePress() {
    // the destructor sets credits-seen; the first time, the screen below (the story) goes too
    const seen = StatManager.instance.getBool('credits-seen') ?? false;
    StatManager.instance.setBool('credits-seen', true);
    if (!seen) ScreenManager.instance.pop();
    ScreenManager.instance.pop();
  }
}

void RectComponent;
