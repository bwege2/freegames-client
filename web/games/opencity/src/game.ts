// OpenCity on the website: main.cpp's clientMode() (splash, managers, the main loop) and city.cpp's user
// interface (keys, mouse, tool circles, status bar, main menu, query, saving), around the ported game
// logic (city.ts) and the 3D view (render.ts). The main loop runs on fixed 20 ms frames (msPerFrame of
// config/opencity.xml); the simulator rounds run on the same clock (see city.ts).
import * as THREE from 'three';
import type { GameContext } from '../../../src/sdk/index.ts';
import { loadModel, type Model } from './ac3d.ts';
import { fetchBytes, fetchText, guiImagePaths, loadImage } from './assets.ts';
import { type City, MS_PER_FRAME, OpenCity } from './city.ts';
import { Conf } from './conf.ts';
import { SC, SIM, TOOL } from './codes.ts';
import { drawText, GUIBar, GUIButton, GUIContainer, GUILabel, MOUSEOVER, CLICKED, PALETTE, POS, type Screen, VISIBLE } from './gui.ts';
import { Renderer } from './render.ts';
import { PropertyManager } from './structure.ts';

const SAVE_FILE = 'opencity.save';
/** sound/sound.m3u, in its order (OPENCITY_SOUND_EFFECT indexes into it) */
const SOUND_LIST = 'sound/sound.m3u';
const TOOL_BUTTON_POS: [number, number, number, number] = [85, 4, 24, 24];
const TOOL_STATUS: Record<number, string> = {
  [TOOL.NONE]: 'unknown', [TOOL.DESTROY]: 'destroy', [TOOL.ZONE_RES]: 'residential', [TOOL.ZONE_COM]: 'commercial',
  [TOOL.ZONE_IND]: 'industrial', [TOOL.HEIGHT_UP]: 'raise', [TOOL.HEIGHT_DOWN]: 'lower', [TOOL.ROAD]: 'road',
  [TOOL.ELINE]: 'power_line', [TOOL.EPLANT_COAL]: 'power_plant_coal', [TOOL.EPLANT_NUCLEAR]: 'power_plant_nuclear',
  [TOOL.PARK]: 'park', [TOOL.FLORA]: 'tree', [TOOL.FIRE]: 'fire', [TOOL.POLICE]: 'police', [TOOL.HOSPITAL]: 'hospital',
  [TOOL.EDUCATION]: 'education', [TOOL.AGENT_POLICE]: 'unknown', [TOOL.AGENT_DEMONSTRATOR]: 'unknown',
  [TOOL.AGENT_ROBBER]: 'unknown', [TOOL.TEST_BUILDING]: 'unknown', [TOOL.QUERY]: 'query',
};
/** City::_BuildPreview: the tools that show their model while the button is held */
const PREVIEW: Record<number, number> = {
  [TOOL.EPLANT_COAL]: SC.EPLANT_COAL, [TOOL.EPLANT_NUCLEAR]: SC.EPLANT_NUCLEAR, [TOOL.PARK]: SC.PARK,
  [TOOL.FLORA]: SC.FLORA, [TOOL.FIRE]: SC.FIREDEPT, [TOOL.POLICE]: SC.POLICEDEPT, [TOOL.HOSPITAL]: SC.HOSPITALDEPT,
  [TOOL.EDUCATION]: SC.EDUCATIONDEPT, [TOOL.TEST_BUILDING]: SC.TEST,
};

/** "a/b/../c.png" → "a/c.png" */
function normalize(path: string): string {
  const out: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') out.pop();
    else if (part !== '.' && part !== '') out.push(part);
  }
  return out.join('/');
}

const KEY = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3, PAGEUP: 4, PAGEDOWN: 5, ALT: 6, INSERT: 7, DELETE: 8 } as const;

/** the city's user interface (the GUI part of City) */
interface CityGUI {
  status: GUIContainer;
  pause: GUIButton; play: GUIButton;
  fund: GUILabel; population: GUILabel; date: GUILabel;
  barR: GUIBar; barC: GUIBar; barI: GUIBar; barP: GUIBar;
  toolButtons: GUIButton[];
  main: GUIContainer; z: GUIContainer; l: GUIContainer; t: GUIContainer; g: GUIContainer; n: GUIContainer; s: GUIContainer;
  current: GUIContainer;
  query: GUIContainer | null;
  menu: GUIContainer | null;
  tool: number;
  statusVisible: boolean;
}

export class OpenCityGame {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly root: HTMLDivElement;
  private readonly canvas3d: HTMLCanvasElement;
  private readonly canvas2d: HTMLCanvasElement;
  private readonly g2d: CanvasRenderingContext2D;
  private width = 750;
  private height = 560;
  private readonly images = new Map<string, HTMLImageElement>();
  private engine!: OpenCity;
  private renderer!: Renderer;
  private gui!: CityGUI;
  private queryContainer!: GUIContainer;
  private queryButtons!: Record<string, GUIButton>;
  private readonly keys = new Array<boolean>(9).fill(false);
  private lmbPressed = false;
  private w1 = 0; private l1 = 0; private w2 = 0; private l2 = 0;
  private mouseX = 0; private mouseY = 0;
  private mouseButtons = 0;
  private sounds: (AudioBuffer | null)[] = [];
  private soundEnabled = true;
  private accumulator = 0;
  private stopped = false;
  private minimap: HTMLCanvasElement;
  private minimapChanged = true;
  private busy = false;
  private observer: ResizeObserver | null = null;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.root = document.createElement('div');
    this.root.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#000;cursor:default;';
    this.canvas3d = document.createElement('canvas');
    this.canvas2d = document.createElement('canvas');
    for (const c of [this.canvas3d, this.canvas2d]) c.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;';
    this.root.append(this.canvas3d, this.canvas2d);
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.append(this.root);
    this.g2d = this.canvas2d.getContext('2d')!;
    this.minimap = document.createElement('canvas');
    this.minimap.width = 50;
    this.minimap.height = 50;
  }

  private screen(): Screen { return { ctx: this.g2d, width: this.width, height: this.height }; }
  private image = (name: string): HTMLImageElement | null => this.images.get(name) ?? null;

  private measure(): void {
    this.width = Math.max(1, Math.floor(this.host.clientWidth));
    this.height = Math.max(1, Math.floor(this.host.clientHeight));
    this.canvas2d.width = this.width;
    this.canvas2d.height = this.height;
  }

  /** main.cpp displayStatus(): the splash on its green, a line of text under it */
  private displayStatus(text: string): void {
    const s = this.screen();
    const c = this.g2d;
    c.fillStyle = 'rgb(38,102,64)';   // OC_SPLASH_CLEAR_COLOR .15, .4, .25
    c.fillRect(0, 0, this.width, this.height);
    const splash = this.image('graphism/gui/splash.png');
    if (splash) {
      const x = Math.trunc((this.width - 512) / 2), y = Math.trunc((this.height - 256) / 2);
      c.drawImage(splash, x + 1, this.height - (y + 256), 511, 255);
    }
    drawText(s, Math.trunc((this.width - text.length * 10) / 2), Math.trunc((this.height - 140) / 2), PALETTE.BLUE, text);
  }

  async init(): Promise<void> {
    const signal = this.ctx.signal;
    this.measure();
    this.images.set('graphism/gui/splash.png', await loadImage('graphism/gui/splash.png'));
    this.displayStatus('Looking for GPU freezing system... ');
    await Promise.all(guiImagePaths().map(async (p) => { this.images.set(p, await loadImage(p)); }));
    this.displayStatus('Warming up central processing unit...');
    await this.loadSounds(signal);
    this.displayStatus('Initializing the vibration detector...');
    const graphism = await fetchText('config/graphism.conf', signal);
    const conf = new Conf(graphism);
    const modelPaths = new Map<number, string>();
    for (let gc = 0; gc < 491; gc++) { const p = conf.getValue(String(gc)); if (p) modelPaths.set(gc, p); }
    const confTexts = new Map<string, string>();
    await Promise.all([...modelPaths.values()].map(async (p) => {
      const c = p.replace(/\.ac$/, '.conf');
      confTexts.set(c, await fetchText(c, signal));
    }));
    this.displayStatus('Activating embedded GPS...');
    const pm = new PropertyManager(graphism, (p) => confTexts.get(p) ?? null);
    this.engine = new OpenCity(pm);
    this.displayStatus('Calibrating earthquake subsystem...');
    const models = new Map<number, Model>();
    const modelTexts = new Map<string, Model | null>();
    await Promise.all([...new Set(modelPaths.values())].map(async (p) => { modelTexts.set(p, loadModel(await fetchText(p, signal))); }));
    const textures = new Map<string, THREE.Texture>();
    const texCache = new Map<string, THREE.Texture>();
    for (const [gc, p] of modelPaths) {
      const m = modelTexts.get(p);
      if (!m) continue;
      models.set(gc, m);
      if (m.texture) {
        const tp = normalize(p.slice(0, p.lastIndexOf('/') + 1) + m.texture);
        let t = texCache.get(tp);
        if (!t) { t = this.texture(await loadImage(tp), true); texCache.set(tp, t); }
        textures.set(String(gc), t);
      }
    }
    this.displayStatus('Shaking DNA mixer thread...');
    const terrain3D = await this.terrainTexture();
    const water = this.texture(await loadImage('graphism/texture/blue_water_512.png'), true);
    const cloud = this.texture(await loadImage('graphism/texture/cloud.png'), false);
    this.displayStatus('Mounting intergalactic hyperlink ...');
    this.renderer = new Renderer(this.canvas3d, pm, models, textures, terrain3D, water, cloud);
    this.displayStatus('Initializing the particle handler ...');
    const seed = Math.floor(Date.now() / 1000) >>> 0;
    this.engine.newCity(seed, seed);
    this.createQueryContainer();
    this.displayStatus('Almost done...');
    this.createGUI();
    this.resize();
    this.observer = new ResizeObserver(() => { if (!this.stopped) this.resize(); });
    this.observer.observe(this.host);
    this.listen();
    this.ctx.frame((_t, dt) => this.loop(dt));
  }

  private texture(img: HTMLImageElement, repeat: boolean): THREE.Texture {
    const t = new THREE.Texture(img);
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }

  /** Texture::_Load3D: the 64x4096 image as 64 slices of 64x64, not flipped */
  private async terrainTexture(): Promise<THREE.Data3DTexture> {
    const img = await loadImage('graphism/texture/terrain_64x4096_texture.png');
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const cx = c.getContext('2d', { willReadFrequently: true })!;
    cx.drawImage(img, 0, 0);
    const data = new Uint8Array(cx.getImageData(0, 0, img.width, img.height).data.buffer);
    const t = new THREE.Data3DTexture(data, img.width, img.width, img.height / img.width);
    t.format = THREE.RGBAFormat;
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.wrapR = THREE.ClampToEdgeWrapping;
    t.unpackAlignment = 1;
    t.needsUpdate = true;
    return t;
  }

  private async loadSounds(signal: AbortSignal): Promise<void> {
    // AudioManager::ParseM3UList: every line that is not empty and does not start with '#'
    const list = (await fetchText(SOUND_LIST, signal)).split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.length > 0 && l[0] !== '#');
    this.sounds = await Promise.all(list.map(async (p) => {
      try { return await this.ctx.audio.decodeAudioData(await fetchBytes(p, signal)); } catch { return null; }
    }));
  }

  private playSound(index: number): void {
    if (index < 0 || !this.soundEnabled) return;
    const b = this.sounds[index];
    if (!b) return;
    const src = this.ctx.audio.createBufferSource();
    src.buffer = b;
    src.connect(this.ctx.audio.destination);
    src.start();
  }

  // ------------------------------------------------------------------ GUI (City::_CreateGUI)

  private button(pos: [number, number, number, number], name: string, states = 2): GUIButton {
    return new GUIButton(pos[0], pos[1], pos[2], pos[3], `graphism/gui/${name}`, this.image, states);
  }

  private circle(bg = 'graphism/gui/toolcircle_bg.png'): GUIContainer {
    return new GUIContainer(100, 100, 140, 140, bg, this.image, this.width, this.height);
  }

  private createGUI(): void {
    const toolButtons: GUIButton[] = [];
    for (let t = 0; t < TOOL.NUMBER; t++) toolButtons.push(this.button(TOOL_BUTTON_POS, `status/${TOOL_STATUS[t]}`));
    const pause = this.button([54, 4, 24, 24], 'status/speed_pause');
    const play = this.button([54, 4, 24, 24], 'status/speed_play');
    pause.unset(VISIBLE);
    const city = this.engine.city;
    const fund = new GUILabel(125, 11, 80, 10, String(city.fund)); fund.align = 'right'; fund.color = PALETTE.WHITE;
    const population = new GUILabel(240, 11, 80, 10, String(city.population)); population.align = 'right'; population.color = PALETTE.WHITE;
    const date = new GUILabel(348, 11, 80, 10, `${city.day}/${city.month}/${city.year}`); date.align = 'center'; date.color = PALETTE.WHITE;
    const barR = new GUIBar(5, 5, 7, 53); barR.color = PALETTE.GREEN;
    const barC = new GUIBar(18, 5, 7, 53); barC.color = PALETTE.BLUE;
    const barI = new GUIBar(29, 5, 7, 53); barI.color = PALETTE.YELLOW;
    const barP = new GUIBar(42, 5, 7, 53); barP.color = PALETTE.PINK;
    const status = new GUIContainer(Math.trunc((this.width - 512) / 2), 0, 512, 64, 'graphism/gui/main_status_bar.png', this.image, this.width, this.height);
    for (const c of [pause, play, fund, population, date, barR, barC, barI, barP]) status.add(c);
    status.set(VISIBLE);
    for (const b of toolButtons) { b.unset(VISIBLE); status.add(b); }
    toolButtons[TOOL.NONE].set(VISIBLE);
    const main = this.circle();
    for (const [p, n] of [[0, 'zone'], [4, 'save'], [1, 'power'], [2, 'road'], [3, 'bulldozer'], [5, 'government']] as const) main.add(this.button(POS[p], n));
    const z = this.circle();
    for (const [p, n] of [[0, 'back'], [1, 'residential'], [2, 'commercial'], [3, 'industrial']] as const) z.add(this.button(POS[p], n));
    const l = this.circle();
    for (const [p, n] of [[1, 'back'], [2, 'power_line'], [3, 'power_plant_nuclear'], [4, 'power_plant_coal']] as const) l.add(this.button(POS[p], n));
    const t = this.circle();
    // added in the order back, raise, lower, destroy, query
    for (const [p, n] of [[3, 'back'], [1, 'raise'], [2, 'lower'], [0, 'destroy'], [4, 'query']] as const) t.add(this.button(POS[p], n));
    const g = this.circle();
    for (const [p, n] of [[5, 'back'], [0, 'park'], [4, 'education'], [1, 'hospital'], [2, 'police'], [3, 'fire']] as const) g.add(this.button(POS[p], n));
    const n = this.circle();
    for (const [p, nm] of [[0, 'back'], [5, 'park_city'], [4, 'tree']] as const) n.add(this.button(POS[p], nm));
    const s = this.circle();
    for (const [p, nm] of [[4, 'back'], [5, 'save_save'], [0, 'save_load']] as const) s.add(this.button(POS[p], nm));
    this.gui = {
      status, pause, play, fund, population, date, barR, barC, barI, barP, toolButtons,
      main, z, l, t, g, n, s, current: main, query: null, menu: null, tool: TOOL.NONE, statusVisible: true,
    };
    city.onDay = (c) => this.onDay(c);
    this.minimapChanged = true;
  }

  /** Layer::_CreateQueryContainer */
  private createQueryContainer(): void {
    const q = this.circle('graphism/gui/querycircle_bg.png');
    const names = ['residential', 'water', 'electricity', 'gas', 'industrial', 'commercial'];
    const b: Record<string, GUIButton> = {};
    names.forEach((nm, i) => { b[`${nm}_on`] = this.button(POS[i], `query_${nm}_on`, 1); });
    names.forEach((nm, i) => { b[`${nm}_off`] = this.button(POS[i], `query_${nm}_off`, 1); });
    for (const nm of names) q.add(b[`${nm}_on`]);
    for (const nm of names) q.add(b[`${nm}_off`]);
    b.water_on.unset(VISIBLE);
    b.gas_on.unset(VISIBLE);
    this.queryContainer = q;
    this.queryButtons = b;
  }

  private onDay(city: City): void {
    if (city.day % 3 !== 0) return;
    const sim = city.sim;
    const r = sim.value(SIM.RESIDENTIAL) >>> 0, c = sim.value(SIM.COMMERCIAL) >>> 0, i = sim.value(SIM.INDUSTRIAL) >>> 0;
    const initial = ((r + c + i) >>> 0) + 1;
    for (const bar of [this.gui.barR, this.gui.barC, this.gui.barI]) bar.setInitialValue(initial);
    this.gui.barR.setValue(r);
    this.gui.barC.setValue(c);
    this.gui.barI.setValue(i);
    this.gui.barP.setInitialValue(sim.maxValue(SIM.ELECTRIC) + 1);
    const e = sim.value(SIM.ELECTRIC);
    this.gui.barP.setValue(e > 0 ? e : 0);
    this.minimapChanged = true;
  }

  private setTool(tool: number): void {
    this.gui.toolButtons[this.gui.tool].unset(VISIBLE);
    this.gui.tool = tool;
    this.gui.toolButtons[tool].set(VISIBLE);
  }

  private loadMenu(): void {
    const menu = new GUIContainer(0, 0, this.width, this.height, 'graphism/gui/main_menu_bg.png', this.image, this.width, this.height);
    for (const n of ['new', 'load', 'save', 'quit']) menu.add(this.button([0, 0, 128, 128], `main_menu_${n}`));
    menu.set(VISIBLE);
    this.gui.menu = menu;
    if (this.gui.statusVisible) { this.renderer.show.compass = !this.renderer.show.compass; this.gui.status.unset(VISIBLE); }
    this.centerMenu();
  }

  private centerMenu(): void {
    const m = this.gui.menu!;
    const x = Math.trunc(this.width / 2), y = Math.trunc(this.height / 2);
    m.children[0].setLocation(x - 264, y);
    m.children[1].setLocation(x - 64, y);
    m.children[2].setLocation(x + 136, y);
    m.children[3].setLocation(this.width - 150, 22);
    m.mouseMotion(this.mouseX, this.mouseY);
  }

  private unloadMenu(): void {
    this.gui.menu = null;
    if (this.gui.statusVisible) { this.renderer.show.compass = !this.renderer.show.compass; this.gui.status.set(VISIBLE); }
  }

  // ------------------------------------------------------------------ input

  private listen(): void {
    const signal = this.ctx.signal;
    this.root.tabIndex = 0;
    this.root.style.outline = 'none';
    this.root.focus();
    const pos = (e: MouseEvent): [number, number] => {
      const r = this.root.getBoundingClientRect();
      return [Math.floor(e.clientX - r.left), Math.floor(e.clientY - r.top)];
    };
    this.root.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    this.root.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.root.focus();
      [this.mouseX, this.mouseY] = pos(e);
      this.mouseButtons = e.buttons;
      const b = e.button === 0 ? 0 : e.button === 2 ? 2 : -1;
      if (b >= 0) this.mouseButton(true, b, e);
    }, { signal });
    window.addEventListener('mouseup', (e) => {
      [this.mouseX, this.mouseY] = pos(e);
      this.mouseButtons = e.buttons;
      const b = e.button === 0 ? 0 : e.button === 2 ? 2 : -1;
      if (b >= 0) this.mouseButton(false, b, e);
    }, { signal });
    window.addEventListener('mousemove', (e) => {
      [this.mouseX, this.mouseY] = pos(e);
      this.mouseButtons = e.buttons;
      this.mouseMotion();
    }, { signal });
    this.root.addEventListener('wheel', (e) => {
      e.preventDefault();
      [this.mouseX, this.mouseY] = pos(e);
      // SDL's buttons 4 (forward) and 5 (backward), pressed and released
      const b = e.deltaY < 0 ? 4 : 5;
      this.mouseButton(true, b, e);
      this.mouseButton(false, b, e);
    }, { signal, passive: false });
    this.root.addEventListener('keydown', (e) => this.keyboard(e, true), { signal });
    this.root.addEventListener('keyup', (e) => this.keyboard(e, false), { signal });
  }

  /** City::MouseMotion */
  private mouseMotion(): void {
    if (this.gui.menu) this.gui.menu.mouseMotion(this.mouseX, this.mouseY);
    else {
      this.gui.current.mouseMotion(this.mouseX, this.mouseY);
      this.gui.status.mouseMotion(this.mouseX, this.mouseY);
    }
  }

  /** City::MouseButton (button 0 left, 2 right, 4/5 the wheel) */
  private mouseButton(pressed: boolean, button: number, e: MouseEvent): void {
    const gui = this.gui;
    const sdlButton = button === 0 ? 0 : button;
    if (gui.menu) {
      gui.menu.mouseButton(pressed, sdlButton);
      if (gui.menu.getClick() !== 0) { this.handleMenuClick(); this.lmbPressed = false; }
      return;
    }
    gui.status.mouseButton(pressed, sdlButton);
    if (gui.status.getClick() !== 0) { this.handleStatusClick(); this.lmbPressed = false; return; }
    gui.current.mouseButton(pressed, sdlButton);
    if (gui.current.getClick() !== 0) { this.handleGUIClick(); this.lmbPressed = false; return; }
    const city = this.engine.city;
    if (pressed) {
      this.lmbPressed = false;
      if (button === 0) {
        const p = this.renderer.pick(city, this.mouseX, this.mouseY);
        if (p) { [this.w1, this.l1] = p; this.lmbPressed = true; }
      }
      if (button === 2) {
        if (gui.current === gui.query) {
          gui.current = gui.main;
          gui.current.set(VISIBLE);
        }
        if (gui.current.isSet(VISIBLE)) gui.current.unset(VISIBLE);
        else {
          gui.current.setLocation(this.mouseX - 70, this.height - this.mouseY - 70);
          gui.current.set(VISIBLE);
        }
      }
      if (button === 4 || button === 5) {
        const ctrl = e.ctrlKey, shift = e.shiftKey;
        if (button === 4) {
          if (ctrl) this.renderer.moveRight();
          if (shift) this.renderer.moveUp();
          if (!ctrl && !shift) this.renderer.zoomIn();
        } else {
          if (ctrl) this.renderer.moveLeft();
          if (shift) this.renderer.moveDown();
          if (!ctrl && !shift) this.renderer.zoomOut();
        }
      }
    } else {
      if (!e.ctrlKey && this.lmbPressed) {
        const p = this.renderer.pick(city, this.mouseX, this.mouseY);
        if (p) { [this.w2, this.l2] = p; this.doTool(); }
      }
      this.lmbPressed = false;
    }
  }

  private doTool(): void {
    const gui = this.gui;
    const city = this.engine.city;
    if (gui.tool === TOOL.QUERY) {
      if (city.fund < 0) return;
      this.queryStructure(this.w1, this.l1);
      gui.current.resetAttribute(CLICKED | MOUSEOVER);
      gui.current.unset(VISIBLE);
      gui.query = this.queryContainer;
      gui.current = this.queryContainer;
      gui.current.setLocation(this.mouseX - 70, this.height - this.mouseY - 70);
      gui.current.set(VISIBLE);
      return;
    }
    const sound = city.doTool(gui.tool, this.w1, this.l1, this.w2, this.l2);
    this.playSound(sound);
  }

  /** BuildingLayer::QueryStructure: R, C, I, E on or off; water and gas are not implemented */
  private queryStructure(w: number, l: number): void {
    const q = this.engine.city.query(w, l);
    const b = this.queryButtons;
    const show = (name: string, on: boolean) => {
      if (on) { b[`${name}_on`].set(VISIBLE); b[`${name}_off`].unset(VISIBLE); }
      else { b[`${name}_on`].unset(VISIBLE); b[`${name}_off`].set(VISIBLE); }
    };
    if (q) {
      show('residential', q.r); show('commercial', q.c); show('industrial', q.i); show('electricity', q.e);
    } else {
      for (const nm of ['residential', 'commercial', 'industrial', 'water', 'electricity', 'gas']) {
        b[`${nm}_off`].set(VISIBLE);
        b[`${nm}_on`].unset(VISIBLE);
      }
    }
  }

  private handleMenuClick(): void {
    const which = this.gui.menu!.getClick();
    switch (which) {
      case 1: this.restart = true; break;
      case 2: void this.load(); break;
      case 3: void this.save(); break;
      case 4: this.unloadMenu(); this.ctx.exit(); return;
      default: break;
    }
    this.unloadMenu();
  }

  private restart = false;

  private handleStatusClick(): void {
    const gui = this.gui;
    switch (gui.status.getClick()) {
      case 1:
        gui.pause.unset(VISIBLE); gui.play.set(VISIBLE);
        this.engine.setPaused(false);
        break;
      case 2:
        gui.play.unset(VISIBLE); gui.pause.set(VISIBLE);
        this.engine.setPaused(true);
        break;
      default: break;
    }
    gui.status.resetAttribute(CLICKED | MOUSEOVER);
  }

  /** City::_HandleGUIClick */
  private handleGUIClick(): void {
    const gui = this.gui;
    const old = gui.current;
    const o = old.getClick();
    const go = (c: GUIContainer, highlight: number) => { gui.current = c; c.setChild(highlight, MOUSEOVER); };
    if (old === gui.main) {
      switch (o) {
        case 1: go(gui.z, 1); break;
        case 2: go(gui.s, 1); break;
        case 3: go(gui.l, 1); break;
        case 4: this.setTool(TOOL.ROAD); break;
        case 5: go(gui.t, 1); break;
        case 6: go(gui.g, 1); break;
      }
    } else if (old === gui.z) {
      switch (o) {
        case 1: go(gui.main, 1); break;
        case 2: this.setTool(TOOL.ZONE_RES); break;
        case 3: this.setTool(TOOL.ZONE_COM); break;
        case 4: this.setTool(TOOL.ZONE_IND); break;
      }
    } else if (old === gui.l) {
      switch (o) {
        case 1: go(gui.main, 3); break;
        case 2: this.setTool(TOOL.ELINE); break;
        case 3: this.setTool(TOOL.EPLANT_NUCLEAR); break;
        case 4: this.setTool(TOOL.EPLANT_COAL); break;
      }
    } else if (old === gui.t) {
      switch (o) {
        case 1: go(gui.main, 5); break;
        case 2: this.setTool(TOOL.HEIGHT_UP); break;
        case 3: this.setTool(TOOL.HEIGHT_DOWN); break;
        case 4: this.setTool(TOOL.DESTROY); break;
        case 5: this.setTool(TOOL.QUERY); break;
      }
    } else if (old === gui.g) {
      switch (o) {
        case 1: go(gui.main, 6); break;
        case 2: go(gui.n, 1); break;
        case 3: this.setTool(TOOL.EDUCATION); break;
        case 4: this.setTool(TOOL.HOSPITAL); break;
        case 5: this.setTool(TOOL.POLICE); break;
        case 6: this.setTool(TOOL.FIRE); break;
      }
    } else if (old === gui.n) {
      switch (o) {
        case 1: go(gui.g, 2); break;
        case 2: this.setTool(TOOL.PARK); break;
        case 3: this.setTool(TOOL.FLORA); break;
      }
    } else if (old === gui.s) {
      switch (o) {
        case 1: go(gui.main, 2); break;
        case 2: void this.save(); break;
        case 3: void this.load(); break;
      }
    }
    if (gui.current !== old) {
      old.resetAttribute(CLICKED | MOUSEOVER);
      gui.current.setLocation(old.x, old.y);
      gui.current.set(VISIBLE);
    } else {
      old.resetAttribute(CLICKED);
    }
    old.unset(VISIBLE);
  }

  /** City::Keyboard */
  private keyboard(e: KeyboardEvent, down: boolean): void {
    const k = e.key;
    const handled = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Insert', 'Delete', 'F2', 'F6',
      'Escape', 'Alt', ' ', 'Home', 'End'].includes(k);
    if (handled || (k.length === 1 && !e.ctrlKey && !e.metaKey)) e.preventDefault();
    const held: Record<string, number> = {
      ArrowUp: KEY.UP, ArrowDown: KEY.DOWN, ArrowLeft: KEY.LEFT, ArrowRight: KEY.RIGHT, PageUp: KEY.PAGEUP,
      PageDown: KEY.PAGEDOWN, Insert: KEY.INSERT, Delete: KEY.DELETE,
    };
    if (!down) {
      if (!e.altKey) this.keys[KEY.ALT] = false;
      if (k in held) this.keys[held[k]] = false;
      return;
    }
    if (e.altKey) this.keys[KEY.ALT] = true;
    if (k in held) { this.keys[held[k]] = true; return; }
    if (e.repeat) return;   // SDL 1.2 without key repeat: one event per press
    const r = this.renderer;
    const gui = this.gui;
    switch (k.toLowerCase()) {
      case 'n': this.setTool(TOOL.NONE); break;
      case 'r': this.setTool(TOOL.ZONE_RES); break;
      case 'c': this.setTool(TOOL.ZONE_COM); break;
      case 'i': this.setTool(TOOL.ZONE_IND); break;
      case 'p': this.setTool(TOOL.ROAD); break;
      case 'l': this.setTool(TOOL.ELINE); break;
      case 'e': this.setTool(TOOL.EPLANT_NUCLEAR); break;
      case 'u': this.setTool(TOOL.HEIGHT_UP); break;
      case 'd': this.setTool(TOOL.HEIGHT_DOWN); break;
      case 'q': this.setTool(TOOL.QUERY); break;
      case 'x': this.setTool(TOOL.DESTROY); break;
      case 'b': r.show.structure = !r.show.structure; break;
      case 'f': r.show.wireframe = !r.show.wireframe; break;
      case 'g': r.show.grid = !r.show.grid; break;
      case 'k':
        if (gui.menu) break;
        gui.statusVisible = !gui.statusVisible;
        r.show.compass = !r.show.compass;
        if (gui.statusVisible) gui.status.set(VISIBLE); else gui.status.unset(VISIBLE);
        break;
      case 'o': r.perspective = !r.perspective; break;
      case 't': r.show.terrain = !r.show.terrain; break;
      case 'w': r.show.water = !r.show.water; break;
      case 's': this.soundEnabled = !this.soundEnabled; break;
      case 'h': r.home(); break;
      case 'f2': void this.save(); break;
      case 'f6': void this.load(); break;
      case 'escape':
        if (gui.menu === null) this.loadMenu(); else this.unloadMenu();
        break;
      default: break;
    }
  }

  /** City::_HandleKeyPressed, once a frame */
  private handleKeyPressed(): void {
    const factor = this.keys[KEY.ALT] ? 10 : 1;
    const r = this.renderer;
    if (this.keys[KEY.UP]) r.moveDown(factor);
    if (this.keys[KEY.DOWN]) r.moveUp(factor);
    if (this.keys[KEY.LEFT]) r.moveRight(factor);
    if (this.keys[KEY.RIGHT]) r.moveLeft(factor);
    if (this.keys[KEY.PAGEUP]) r.rotateLeft(factor);
    if (this.keys[KEY.PAGEDOWN]) r.rotateRight(factor);
    if (this.keys[KEY.INSERT]) r.zoomIn();
    if (this.keys[KEY.DELETE]) r.zoomOut();
  }

  // ------------------------------------------------------------------ saving (City::_Save, City::_Load)

  private async save(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try { await this.ctx.storage.put(SAVE_FILE, this.engine.city.save()); } catch (err) { console.warn('opencity: save failed', err); }
    this.busy = false;
  }

  private async load(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const bytes = await this.ctx.storage.get(SAVE_FILE);
      if (bytes && !this.stopped) {
        this.engine.city.load(bytes);
        this.minimapChanged = true;
      }
    } catch (err) { console.warn('opencity: load failed', err); }
    this.busy = false;
  }

  // ------------------------------------------------------------------ main loop

  private resize(): void {
    this.measure();
    this.renderer.setSize(this.width, this.height);
    const gui = this.gui;
    gui.status.setLocation(Math.trunc((this.width - 512) / 2), 0);
    for (const c of [gui.status, gui.main, gui.z, gui.l, gui.t, gui.g, gui.n, gui.s, this.queryContainer]) c.resize(this.width, this.height);
    if (gui.menu) { gui.menu.resize(this.width, this.height); gui.menu.setSize(this.width, this.height); this.centerMenu(); }
  }

  private loop(dt: number): void {
    if (this.stopped) return;
    if (this.restart) {
      // main.cpp: "Restart with a new city from scratch"
      this.restart = false;
      const seed = Math.floor(Date.now() / 1000) >>> 0;
      this.engine.newCity(seed, seed);
      this.lmbPressed = false;
      this.createGUI();
      this.resize();
    }
    this.accumulator = Math.min(this.accumulator + dt, 250);
    while (this.accumulator >= MS_PER_FRAME) {
      this.accumulator -= MS_PER_FRAME;
      this.engine.frame();
      this.handleKeyPressed();
    }
    this.display();
  }

  /** City::Display */
  private display(): void {
    const city = this.engine.city;
    const r = this.renderer;
    if (this.engine.heightChanged) { r.rebuildTerrain(city.map); this.engine.heightChanged = false; }
    r.rebuildStructures(city);
    r.updateVehicles(this.engine.moves.slots);
    let drag: { tool: number; w1: number; l1: number; w2: number; l2: number } | null = null;
    if (this.lmbPressed && this.gui.tool !== TOOL.NONE && (this.mouseButtons & 1)) {
      const p = r.pick(city, this.mouseX, this.mouseY);
      if (p) [this.w2, this.l2] = p;
      drag = { tool: this.gui.tool, w1: this.w1, l1: this.l1, w2: this.w2, l2: this.l2 };
    }
    let preview: { w: number; l: number; gc: number; ok: boolean } | null = null;
    const sc = PREVIEW[this.gui.tool];
    if (sc !== undefined && this.lmbPressed) {
      const res = city.layer.buildPreview(this.w1, this.l1, sc);
      preview = { w: this.w1, l: this.l1, gc: res.gc, ok: res.ok };
    }
    r.updateOverlay(city, drag, preview);
    r.render();
    // the 2D layer: compass and minimap (part of the 3D display), labels, status bar, tool circle, menu
    const s = this.screen();
    this.g2d.clearRect(0, 0, this.width, this.height);
    if (r.show.compass) this.drawCompass(city);
    this.gui.fund.text = String(city.fund);
    this.gui.population.text = String(city.population);
    this.gui.date.text = `${city.day}/${city.month}/${city.year}`;
    this.gui.status.display(s);
    this.gui.current.display(s);
    this.gui.menu?.display(s);
  }

  /** Renderer::_DisplayCompass: the rotating compass and the minimap (Texture::Building2Texture) */
  private drawCompass(city: City): void {
    const c = this.g2d;
    const cx = Math.trunc(this.width / 2) + 223, cy = 32;
    const a = THREE.MathUtils.degToRad(this.renderer.yRotateAngle);
    const pt = (x: number, y: number): [number, number] => {
      const rx = x * Math.cos(a) - y * Math.sin(a), ry = x * Math.sin(a) + y * Math.cos(a);
      return [cx + rx, this.height - (cy + ry)];
    };
    c.lineWidth = 1;
    const line = (x1: number, y1: number, x2: number, y2: number, col: string) => {
      c.strokeStyle = col;
      c.beginPath();
      c.moveTo(...pt(x1, y1));
      c.lineTo(...pt(x2, y2));
      c.stroke();
    };
    line(-20, 0, 20, 0, 'rgb(128,128,128)');
    line(0, -20, 0, 20, 'rgb(204,204,204)');
    c.fillStyle = 'rgb(204,204,204)';
    c.beginPath();
    c.moveTo(...pt(-5, 14)); c.lineTo(...pt(5, 14)); c.lineTo(...pt(0, 20));
    c.closePath();
    c.fill();
    if (this.minimapChanged) {
      const m = this.minimap.getContext('2d')!;
      const img = m.createImageData(50, 50);
      for (let l = 0; l < 50; l++)
        for (let w = 0; w < 50; w++) {
          const st = city.layer.get(w, l);
          let rgb: [number, number, number];
          if (st === null) rgb = [0x50, 0xa0, 0x50];
          else if (st.code === SC.RES) rgb = [0x50, 0xff, 0x50];
          else if (st.code === SC.COM) rgb = [0x50, 0x50, 0xff];
          else if (st.code === SC.IND) rgb = [0xff, 0xff, 0x50];
          else rgb = [0x50, 0x50, 0x50];
          const i = (l * 50 + w) * 4;
          img.data.set([...rgb, 0xe5], i);
        }
      m.putImageData(img, 0, 0);
      this.minimapChanged = false;
    }
    c.imageSmoothingEnabled = true;
    c.drawImage(this.minimap, Math.trunc(this.width / 2) + 195, this.height - (3 + 56), 56, 56);
  }

  stop(): void {
    this.stopped = true;
    this.observer?.disconnect();
    this.renderer?.dispose();
    this.root.remove();
  }
}

