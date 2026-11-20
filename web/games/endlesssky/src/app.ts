// Endless Sky in the browser: the game's screens (main menu, flight, star
// map, planet, trading, shipyard, outfitter, pilot info), drawn with the
// original's bitmap font and sprites on a 1024x768 canvas.
import type { GameContext, StartGame } from '../../../src/sdk/index.ts';
import { Assets, SoundBank } from './assets.ts';
import { drawText, fontHeight, loadFont, textWidth, wrapText } from './render/font.ts';
import {
  type Commodity, type GameData, type Outfit, type Planet, type ShipModel, type StarSystem,
} from './data/gamedata.ts';
import { type Conditions } from './data/conditions.ts';
import { Angle, Point } from './sim/math.ts';
import { GameDate } from './sim/date.ts';
import { Random, seedFromText } from './sim/rng.ts';
import { Ship, type Commands } from './sim/ship.ts';
import { World } from './sim/world.ts';
import {
  addCargo, cargoFree, cargoUsed, createPilot, loadPilot, mortgagePayment, pilotConditions,
  recordPurchase, savePilot, stepDay, syncEconomy, type Pilot,
} from './sim/pilot.ts';

const W = 1024;
const H = 768;
const FPS = 60;

type Screen = 'loading' | 'menu' | 'flight' | 'map' | 'planet' | 'trade' | 'shipyard' | 'outfitter'
  | 'info' | 'pause' | 'dead';

interface Hit {
  x: number;
  y: number;
  w: number;
  h: number;
  action: () => void;
  enabled: boolean;
}

const COLORS = {
  text: '#e6e6e6',
  dim: '#8f949c',
  faint: '#4a5058',
  accent: '#58c8ff',
  good: '#52d273',
  bad: '#ff5f56',
  warn: '#ffd24a',
  panel: 'rgba(4, 8, 14, 0.92)',
  line: '#2a3440',
  shield: '#2e8bff',
  hull: '#ff9f40',
  energy: '#ffd60a',
  fuel: '#30d158',
  heat: '#ff453a',
};

export class App {
  private readonly ctx: GameContext;
  private readonly host: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly c: CanvasRenderingContext2D;
  private readonly assets = new Assets();
  private readonly hits: Hit[] = [];
  private readonly keys = new Set<string>();
  private readonly style: HTMLStyleElement;
  private readonly root: HTMLDivElement;

  private data: GameData | null = null;
  private font14 = '';
  private font18 = '';
  private sound: SoundBank | null = null;
  private pilot: Pilot | null = null;
  private world: World | null = null;
  private saveData: Uint8Array | null = null;

  private screen: Screen = 'loading';
  private prior: Screen = 'flight';
  private accumulator = 0;
  private mouse = { x: 0, y: 0 };
  private message = '';
  private messageTime = 0;
  private playtime = 0;
  private selectedSystem: StarSystem | null = null;
  private route: StarSystem[] = [];
  private selectedCommodity = 0;
  private selectedShip = 0;
  private selectedOutfit = 0;
  private shipsForSale: ShipModel[] = [];
  private outfitsForSale: Outfit[] = [];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.style = document.createElement('style');
    this.style.textContent = `
      .es-root { position:absolute; inset:0; background:#000; display:flex; align-items:center; justify-content:center; }
      .es-canvas { display:block; background:#000; image-rendering:auto; }
      .es-setup { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
        background:rgba(0,0,0,.82); color:${COLORS.text}; font:14px/1.5 'DejaVu Sans Mono',monospace; z-index:4; }
      .es-setup h1 { font:bold 28px 'DejaVu Sans Mono',monospace; letter-spacing:.18em; margin:0 0 4px; color:#fff; }
      .es-setup h2 { font:bold 15px 'DejaVu Sans Mono',monospace; letter-spacing:.12em; margin:18px 0 6px; color:${COLORS.accent}; }
      .es-setup p { margin:0 0 10px; color:${COLORS.dim}; max-width:640px; text-align:center; }
      .es-row { display:flex; gap:8px; align-items:center; margin:4px 0; }
      .es-row label { min-width:70px; color:${COLORS.dim}; }
      .es-row input { background:#0a1018; color:#fff; border:1px solid ${COLORS.line}; padding:4px 6px; font:inherit; width:180px; }
      .es-ships { display:flex; gap:10px; margin-top:6px; }
      .es-ship { border:1px solid ${COLORS.line}; background:#0a1018; padding:8px 10px; width:190px; cursor:pointer; }
      .es-ship.sel { border-color:${COLORS.accent}; box-shadow:0 0 0 1px ${COLORS.accent} inset; }
      .es-ship b { color:#fff; display:block; margin-bottom:4px; }
      .es-ship span { color:${COLORS.dim}; display:block; }
      .es-setup button { font:inherit; background:#101a26; color:${COLORS.text}; border:1px solid ${COLORS.line};
        padding:6px 16px; cursor:pointer; margin-top:14px; }
      .es-setup button:hover { border-color:${COLORS.accent}; color:#fff; }
      .es-setup button:disabled { opacity:.4; cursor:default; }
    `;
    document.head.append(this.style);
    this.root = document.createElement('div');
    this.root.className = 'es-root';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'es-canvas';
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.tabIndex = 0;
    this.root.append(this.canvas);
    host.append(this.root);
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('no 2d context');
    this.c = context;
    this.sound = new SoundBank(ctx.audio, this.assets);

    this.fit();
    const observer = new ResizeObserver(() => this.fit());
    observer.observe(host);
    ctx.signal.addEventListener('abort', () => observer.disconnect());
    this.canvas.addEventListener('pointermove', (event) => {
      const p = this.toCanvas(event);
      this.mouse = p;
    }, { signal: ctx.signal });
    this.canvas.addEventListener('pointerdown', (event) => {
      const p = this.toCanvas(event);
      this.mouse = p;
      this.click(p.x, p.y);
      this.canvas.focus();
    }, { signal: ctx.signal });
    this.canvas.addEventListener('wheel', (event) => {
      if (this.screen !== 'map') return;
      event.preventDefault();
      const p = this.toCanvas(event as unknown as PointerEvent);
      const before = this.mapView;
      const factor = event.deltaY < 0 ? 1.2 : 1 / 1.2;
      const next = Math.max(0.12, Math.min(8, before.scale * factor));
      // Zoom around the pointer.
      const centerX = 385;
      const centerY = 390;
      before.cx += (p.x - centerX) / before.scale - (p.x - centerX) / next;
      before.cy += (p.y - centerY) / before.scale - (p.y - centerY) / next;
      before.scale = next;
    }, { signal: ctx.signal, passive: false });
    window.addEventListener('keydown', (event) => this.keyDown(event), { signal: ctx.signal });
    window.addEventListener('keyup', (event) => this.keys.delete(event.key.toLowerCase()), { signal: ctx.signal });
    window.addEventListener('blur', () => this.keys.clear(), { signal: ctx.signal });
    (window as unknown as { __es: unknown }).__es = {
      app: this,
      startNew: () => this.startNewForScreenshot(),
      show: (screen: Screen) => { this.screen = screen; },
      depart: () => this.depart(),
      land: () => this.tryLand(),
      setSystem: (name: string) => {
        if (!this.data || !this.pilot || !this.world) return;
        const system = this.data.systems.get(name);
        if (!system) return;
        this.pilot.system = system;
        this.pilot.visited.add(name);
        this.world.jumpTo(system);
        this.screen = 'flight';
      },
      courseTo: (name: string) => {
        if (!this.data || !this.pilot || !this.world) return;
        const system = this.data.systems.get(name);
        if (!system) return;
        this.selectedSystem = system;
        this.route = this.world.route(this.pilot.system, system) ?? [];
      },
    };
  }

  /** The screenshot harness's setup: a real new pilot on New Boston. */
  startNewForScreenshot(): void {
    if (!this.data) return;
    const model = this.data.ships.get('Star Barge')!;
    this.beginNewGame('James', 'Pilot', model);
  }

  async start(): Promise<void> {
    await Promise.all([loadFont(this.assets.font14), loadFont(this.assets.font18)].map((p) => p.catch(() => undefined)));
    this.font14 = this.assets.font14;
    this.font18 = this.assets.font18;
    this.data = await this.assets.loadGameData();
    await this.assets.preload([
      '_menu/title@1x', '_menu/haze-tear-0',
      this.data.ships.get('Star Barge')!.sprite,
    ]);
    try {
      this.saveData = await this.ctx.storage.get('pilot.txt');
    } catch {
      this.saveData = null;
    }
    this.screen = 'menu';
    (window as unknown as { __es: { ready?: boolean } }).__es.ready = true;
    this.ctx.frame((_time, dt) => this.loop(dt));
  }

  stop(): void {
    if (this.pilot) {
      const text = savePilot(this.pilot);
      void this.ctx.storage.put('pilot.txt', new TextEncoder().encode(text)).catch(() => undefined);
    }
    this.root.remove();
    this.style.remove();
  }

  private fit(): void {
    const width = this.host.clientWidth || W;
    const height = this.host.clientHeight || H;
    const scale = Math.min(width / W, height / H);
    this.canvas.style.width = `${Math.floor(W * scale)}px`;
    this.canvas.style.height = `${Math.floor(H * scale)}px`;
  }

  private toCanvas(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * W / rect.width,
      y: (event.clientY - rect.top) * H / rect.height,
    };
  }

  private loop(dt: number): void {
    this.playtime += Math.max(0, Math.min(dt, 100)) / 1000;
    if (this.screen === 'flight' && this.world && this.pilot) {
      this.accumulator += Math.max(0, Math.min(dt, 100)) / 1000 * FPS;
      let steps = 0;
      while (this.accumulator >= 1 && steps < 4) {
        this.world.update(this.commands());
        this.accumulator -= 1;
        ++steps;
      }
      if (this.pilot.ship.isDestroyed) this.screen = 'dead';
    }
    this.render();
  }

  private commands(): Commands {
    const k = this.keys;
    const left = k.has('arrowleft') || k.has('a');
    const right = k.has('arrowright') || k.has('d');
    const forward = k.has('arrowup') || k.has('w');
    const reverse = k.has('arrowdown') || k.has('s');
    return {
      turn: (right ? 1 : 0) - (left ? 1 : 0),
      forward,
      reverse,
      afterburner: k.has('shift') || k.has('tab') || k.has('f'),
      firePrimary: k.has(' ') || k.has('enter'),
      fireSecondary: k.has('q'),
      stop: k.has('x'),
    };
  }

  private keyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab', '/'].includes(key)) event.preventDefault();
    this.keys.add(key);
    if (key === 'escape') {
      if (this.screen === 'flight') { this.screen = 'pause'; return; }
      if (this.screen === 'pause') { this.screen = 'flight'; return; }
      if (this.screen === 'menu') { this.ctx.exit(); return; }
      if (this.screen === 'planet') { this.depart(); return; }
      if (this.screen === 'map') { this.screen = 'flight'; return; }
      if (this.screen === 'trade' || this.screen === 'shipyard' || this.screen === 'outfitter' || this.screen === 'info') {
        this.screen = 'planet';
        return;
      }
    }
    if (this.screen === 'flight' && this.world && this.pilot) {
      if (key === 'm') { this.screen = 'map'; this.selectedSystem = this.pilot.system; this.route = []; return; }
      if (key === 'i') { this.screen = 'info'; return; }
      if (key === 'l') { this.tryLand(); return; }
      if (key === 'j') { this.jumpNext(); return; }
      if (key === 'p') { this.screen = 'pause'; return; }
    }
    if (this.screen === 'map') {
      if (key === 'm') { this.screen = 'flight'; return; }
      if (key === 'j') { this.jumpNext(); return; }
      const step = 40 / this.mapView.scale;
      if (key === 'arrowleft' || key === 'a') this.mapView.cx -= step;
      if (key === 'arrowright' || key === 'd') this.mapView.cx += step;
      if (key === 'arrowup' || key === 'w') this.mapView.cy -= step;
      if (key === 'arrowdown' || key === 's') this.mapView.cy += step;
      if (key === '+' || key === '=') this.mapView.scale = Math.min(8, this.mapView.scale * 1.35);
      if (key === '-') this.mapView.scale = Math.max(0.12, this.mapView.scale / 1.35);
    }
  }

  private click(x: number, y: number): void {
    for (let i = this.hits.length - 1; i >= 0; --i) {
      const hit = this.hits[i];
      if (hit.enabled && x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) {
        hit.action();
        return;
      }
    }
    if (this.screen === 'map') this.clickMap(x, y);
  }

  private addHit(x: number, y: number, w: number, h: number, action: () => void, enabled = true): void {
    this.hits.push({ x, y, w, h, action, enabled });
  }

  private notify(text: string): void {
    this.message = text;
    this.messageTime = performance.now();
  }

  // ------------------------------------------------------------------ render

  private render(): void {
    this.hits.length = 0;
    this.c.clearRect(0, 0, W, H);
    this.c.fillStyle = '#000';
    this.c.fillRect(0, 0, W, H);
    switch (this.screen) {
      case 'loading': this.drawLoading(); break;
      case 'menu': this.drawMenu(); break;
      case 'flight': this.drawFlight(); break;
      case 'map': this.drawMap(); break;
      case 'planet': this.drawPlanet(); break;
      case 'trade': this.drawTrade(); break;
      case 'shipyard': this.drawShipyard(); break;
      case 'outfitter': this.drawOutfitter(); break;
      case 'info': this.drawInfo(); break;
      case 'pause': this.drawFlight(); this.drawPause(); break;
      case 'dead': this.drawDead(); break;
    }
    if (this.message && performance.now() - this.messageTime < 4000) {
      this.drawText(this.message, W / 2, H - 150, COLORS.warn, this.font14, 'center', 0);
    }
  }

  private drawLoading(): void {
    this.drawText('ENDLESS SKY', W / 2, H / 2 - 20, COLORS.text, this.font18, 'center', 0);
    this.drawText('loading the data files...', W / 2, H / 2 + 12, COLORS.dim, this.font14, 'center', 0);
  }

  private drawMenu(): void {
    // The original's title art, over the menu haze.
    this.drawSprite('_menu/haze-tear-0', W / 2, H / 2 + 20, 1.2, 0.55);
    this.drawSprite('_menu/title@1x', W / 2, 170, 2, 1);
    this.drawText('A port of the original by M. C. Martin and the community', W / 2, 250, COLORS.dim, this.font14, 'center', 0);
    const cx = W / 2 - 140;
    const button = (label: string, y: number, action: () => void, enabled = true): void => {
      this.drawButton(cx, y, 280, 34, label, action, enabled);
    };
    if (this.saveData) button('Continue', 330, () => this.continueGame());
    button('New Pilot', this.saveData ? 376 : 340, () => this.newPilotScreen());
    button('About Endless Sky', this.saveData ? 422 : 386, () => { this.screen = 'info'; });
    button('Quit to the website', this.saveData ? 468 : 432, () => this.ctx.exit());
    this.drawText('GPL-3.0-or-later  -  data, sprites and sounds from the original', W / 2, H - 42, COLORS.faint, this.font14, 'center', 0);
  }

  private newPilotScreen(): void {
    const data = this.data!;
    const overlay = document.createElement('div');
    overlay.className = 'es-setup';
    const title = document.createElement('h1');
    title.textContent = 'NEW PILOT';
    const sub = document.createElement('p');
    sub.textContent = 'You have 480,000 credits and a mortgage. Choose one of the three ships for sale at New Boston.';
    const row = document.createElement('div');
    row.className = 'es-row';
    const firstLabel = document.createElement('label');
    firstLabel.textContent = 'First name';
    const first = document.createElement('input');
    first.value = 'James';
    first.maxLength = 24;
    const last = document.createElement('input');
    last.value = 'Pilot';
    last.maxLength = 24;
    const lastLabel = document.createElement('label');
    lastLabel.textContent = 'Last name';
    row.append(firstLabel, first, lastLabel, last);
    const heading = document.createElement('h2');
    heading.textContent = 'YOUR FIRST SHIP';
    const ships = document.createElement('div');
    ships.className = 'es-ships';
    const sale = data.shipyards.get('Basic Ships');
    const models = (sale?.ships ?? ['Shuttle', 'Sparrow', 'Star Barge'])
      .map((name) => data.ships.get(name)).filter((s): s is ShipModel => !!s);
    let chosen = models.find((m) => m.name === 'Star Barge') ?? models[0];
    const cards: HTMLDivElement[] = [];
    for (const model of models) {
      const card = document.createElement('div');
      card.className = 'es-ship';
      const cost = data.shipCost(model);
      card.innerHTML = `<b>${escapeHtml(model.displayName)}</b><span>${cost.toLocaleString('en-US')} credits</span>`
        + `<span>${model.base.get('shields')} shields, ${model.base.get('hull')} hull</span>`
        + `<span>${model.base.get('cargo space')} tons cargo, ${model.base.get('outfit space')} outfit space</span>`;
      card.onclick = () => {
        chosen = model;
        for (const c of cards) c.classList.remove('sel');
        card.classList.add('sel');
      };
      cards.push(card);
      ships.append(card);
    }
    cards[models.indexOf(chosen)]?.classList.add('sel');
    const start = document.createElement('button');
    start.textContent = 'Buy the ship and start on New Boston';
    start.onclick = () => {
      const name = (first.value || 'James').trim().slice(0, 24);
      const surname = (last.value || 'Pilot').trim().slice(0, 24);
      overlay.remove();
      this.beginNewGame(name, surname, chosen);
    };
    overlay.append(title, sub, row, heading, ships, start);
    this.root.append(overlay);
  }

  private beginNewGame(first: string, last: string, model: ShipModel): void {
    const data = this.data!;
    const pilot = createPilot(data, 'default', first, last, model.name, model.displayName);
    syncEconomy(pilot, data);
    this.pilot = pilot;
    this.world = new World({
      data, player: pilot.ship, system: pilot.system, date: pilot.date,
      random: new Random(seedFromText(`${first} ${last} ${pilot.date.daysSinceEpoch()}`)),
      spriteSize: (name) => this.assets.spriteSize(name),
      onSound: (name, volume) => this.sound?.play(name, volume ?? 1),
    });
    this.screen = 'planet';
    void this.saveGame(true);
    void this.preloadSystem();
  }

  private async continueGame(): Promise<void> {
    if (!this.saveData || !this.data) return;
    const text = new TextDecoder().decode(this.saveData);
    const pilot = loadPilot(text, this.data);
    if (!pilot) { this.notify('The save file could not be read.'); return; }
    this.pilot = pilot;
    this.world = new World({
      data: this.data, player: pilot.ship, system: pilot.system, date: pilot.date,
      random: new Random(seedFromText(`${pilot.firstName} ${pilot.lastName}`)),
      spriteSize: (name) => this.assets.spriteSize(name),
      onSound: (name, volume) => this.sound?.play(name, volume ?? 1),
    });
    if (pilot.planet) {
      this.screen = 'planet';
    } else {
      this.screen = 'flight';
      this.world.launchFrom('');
      await this.preloadSystem();
    }
    await this.assets.preload([pilot.ship.model.sprite]);
  }

  private async preloadSystem(): Promise<void> {
    if (!this.world || !this.pilot) return;
    const names = [this.pilot.ship.model.sprite, ...this.world.system.objects.map((o) => o.sprite)];
    await this.assets.preload(names);
    // Recompute planet radii now that the sprites have dimensions.
    this.world.arrangeSystem();
  }

  // ------------------------------------------------------------------- flight

  private drawFlight(): void {
    if (!this.world || !this.pilot) return;
    const world = this.world;
    const player = this.pilot.ship;
    const camera = new Point(W / 2 - player.position.x, H / 2 - player.position.y);

    this.drawStarfield(camera.x, camera.y, world.system.name);
    // Stellar objects, farthest first.
    const objects = [...world.objects].sort((a, b) => b.position.distance(player.position) - a.position.distance(player.position));
    for (const object of objects) {
      this.drawSprite(object.sprite, object.position.x + camera.x, object.position.y + camera.y, 1, 1);
    }
    // Ships, then projectiles and effects.
    for (const ship of world.ships) {
      if (ship === player) continue;
      this.drawShip(ship, camera);
    }
    this.drawShip(player, camera);
    for (const projectile of world.projectiles) {
      const weapon = projectile.weapon;
      const drawn = this.drawSprite(weapon.sprite, projectile.position.x + camera.x, projectile.position.y + camera.y,
        1, 1, projectile.angle.degrees());
      if (!drawn) {
        this.c.strokeStyle = COLORS.warn;
        this.c.lineWidth = 2;
        this.c.beginPath();
        this.c.moveTo(projectile.position.x + camera.x, projectile.position.y + camera.y);
        this.c.lineTo(projectile.position.x + camera.x + projectile.velocity.x * 2, projectile.position.y + camera.y + projectile.velocity.y * 2);
        this.c.stroke();
      }
    }
    for (const visual of world.visuals) {
      const frame = Math.floor(visual.age * (visual.effect.frameRate || 1 / 60));
      this.drawSprite(visual.effect.sprite, visual.position.x + camera.x, visual.position.y + camera.y,
        Math.max(0.1, 1), 1, visual.angle.degrees(), frame);
    }
    this.drawHud();
  }

  private drawStarfield(offsetX: number, offsetY: number, name: string): void {
    let seed = 0;
    for (let i = 0; i < name.length; ++i) seed = (Math.imul(seed, 31) + name.charCodeAt(i)) | 0;
    const random = new Random(seed);
    for (let i = 0; i < 320; ++i) {
      const x = random.real() * W;
      const y = random.real() * H;
      const bright = random.real();
      this.c.fillStyle = bright > 0.92 ? '#cdd8ff' : bright > 0.7 ? '#8d9ab8' : '#4b5568';
      const size = bright > 0.95 ? 2 : 1;
      this.c.fillRect(Math.round(x), Math.round(y), size, size);
    }
    // A very faint nebula, drawn from the offset so that it parallaxes a little.
    const haze = this.assets.frameImage('_menu/haze-tear-0');
    if (haze) {
      this.c.globalAlpha = 0.16;
      const size = 1800;
      this.c.drawImage(haze, ((-offsetX * 0.05) % size + size) % size - size, ((-offsetY * 0.05) % size + size) % size - size, size, size);
      this.c.globalAlpha = 1;
    }
  }

  private drawShip(ship: Ship, camera: Point): void {
    const x = ship.position.x + camera.x;
    const y = ship.position.y + camera.y;
    const angle = ship.angle.degrees();
    let drawn = false;
    if (ship.velocity.length() > 0.1) {
      // The original's engine flares; here a simple additive flame in the
      // ship's direction.
      const flame = this.assets.frameImage('effect/ion flare/tiny');
      if (flame) {
        this.c.save();
        this.c.translate(x, y);
        this.c.rotate(-angle * Math.PI / 180);
        this.c.globalCompositeOperation = 'lighter';
        this.c.globalAlpha = 0.65;
        this.c.drawImage(flame, -flame.width / 2, flame.height / 4, flame.width, flame.height);
        this.c.restore();
      }
    }
    drawn = this.drawSprite(ship.model.sprite, x, y, 1, 1, angle) || drawn;
    if (!drawn) {
      this.c.save();
      this.c.translate(x, y);
      this.c.rotate(angle * Math.PI / 180);
      this.c.fillStyle = ship.isPlayer ? COLORS.accent : COLORS.bad;
      this.c.beginPath();
      this.c.moveTo(0, -14);
      this.c.lineTo(10, 12);
      this.c.lineTo(0, 6);
      this.c.lineTo(-10, 12);
      this.c.closePath();
      this.c.fill();
      this.c.restore();
    }
    if (ship.isPlayer && ship.isDisabled) {
      this.c.strokeStyle = COLORS.warn;
      this.c.strokeRect(x - 16, y - 16, 32, 32);
    }
    if (ship === this.world?.selected) {
      this.c.strokeStyle = COLORS.bad;
      this.c.lineWidth = 1;
      this.c.strokeRect(x - 28, y - 28, 56, 56);
    }
  }

  private drawHud(): void {
    if (!this.pilot || !this.world) return;
    const ship = this.pilot.ship;
    const world = this.world;
    const barY = H - 128;
    this.c.fillStyle = COLORS.panel;
    this.c.fillRect(0, barY, W, 128);
    this.c.strokeStyle = COLORS.line;
    this.c.beginPath();
    this.c.moveTo(0, barY);
    this.c.lineTo(W, barY);
    this.c.stroke();

    // Left: system, date, location.
    this.drawText(world.system.displayName, 18, barY + 10, COLORS.text, this.font18);
    this.drawText(this.pilot.date.toString(), 18, barY + 32, COLORS.dim, this.font14);
    const near = world.nearestObject();
    if (near?.planet) {
      const distance = Math.round(world.player.position.distance(near.position) - near.radius);
      this.drawText(`${this.data!.planets.get(near.planet)?.displayName ?? near.planet}  ${distance} m`, 18, barY + 50, COLORS.dim, this.font14);
    }

    // Bars in the middle.
    const bars: [string, number, number, string][] = [
      ['SHIELDS', ship.shields, ship.maxShields(), COLORS.shield],
      ['HULL', ship.hull, ship.maxHull(), COLORS.hull],
      ['ENERGY', ship.energy, ship.maxEnergy(), COLORS.energy],
      ['FUEL', ship.fuel, ship.maxFuel(), COLORS.fuel],
      ['HEAT', ship.heat, ship.maxHeat(), COLORS.heat],
    ];
    const bx = 270;
    const barWidth = 240;
    for (let i = 0; i < bars.length; ++i) {
      const [label, value, max, color] = bars[i];
      const y = barY + 10 + i * 19;
      this.c.fillStyle = '#111820';
      this.c.fillRect(bx, y, barWidth, 12);
      this.c.fillStyle = color;
      this.c.fillRect(bx, y, Math.max(0, Math.min(1, max ? value / max : 0)) * barWidth, 12);
      this.drawText(label, bx - 8, y - 2, COLORS.dim, this.font14, 'right', 0);
      this.drawText(`${Math.round(value)} / ${Math.round(max)}`, bx + barWidth + 8, y - 2, COLORS.text, this.font14);
    }

    // Credits and cargo.
    const rightX = 700;
    this.drawText(`${this.pilot.credits.toLocaleString('en-US')} credits`, rightX, barY + 10, COLORS.text, this.font14);
    this.drawText(`cargo ${cargoUsed(this.pilot)} / ${this.pilot.ship.stats.get('cargo space')}`, rightX, barY + 28, COLORS.dim, this.font14);
    this.drawText(`fuel ${Math.round(this.pilot.ship.fuel)}  jump ${Math.round(world.jumpFuel())}`, rightX, barY + 46, COLORS.dim, this.font14);
    const hostile = world.nearestHostile();
    if (hostile) {
      this.drawText(`TARGET ${hostile.ship.model.displayName}`, rightX, barY + 64, COLORS.bad, this.font14);
      this.drawText(`${Math.round(hostile.distance)} m`, rightX, barY + 82, COLORS.dim, this.font14);
    }

    // Radar in the lower right corner of the bar.
    this.drawRadar(W - 58, H - 64, 40);
    if (ship.isDisabled) this.drawText('SHIP DISABLED', W / 2, H / 2 - 80, COLORS.warn, this.font18, 'center', 0);
    if (world.landingTarget()) {
      const state = world.landingTarget()!;
      const name = this.data!.planets.get(state.planet)?.displayName ?? state.planet;
      this.drawText(`Press L to land on ${name}`, W / 2, H - 140, COLORS.good, this.font14, 'center', 0);
    }
    // Menu keys.
    this.drawText('M map   L land   J jump', 18, barY + 74, COLORS.faint, this.font14);
    this.drawText('I info   Esc menu', 18, barY + 94, COLORS.faint, this.font14);
  }

  private drawRadar(cx: number, cy: number, radius: number): void {
    if (!this.world) return;
    this.c.strokeStyle = COLORS.line;
    this.c.beginPath();
    this.c.arc(cx, cy, radius, 0, Math.PI * 2);
    this.c.stroke();
    this.c.fillStyle = '#02060a';
    this.c.beginPath();
    this.c.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    this.c.fill();
    const range = 4000;
    for (const object of this.world.objects) {
      const dx = (object.position.x - this.world.player.position.x) / range * radius;
      const dy = (object.position.y - this.world.player.position.y) / range * radius;
      if (dx * dx + dy * dy > (radius - 2) ** 2) continue;
      this.c.fillStyle = object.isStar ? '#ffe066' : '#6fa8dc';
      this.c.fillRect(cx + dx - 2, cy + dy - 2, 4, 4);
    }
    for (const ship of this.world.ships) {
      if (ship === this.world.player) continue;
      const dx = (ship.position.x - this.world.player.position.x) / range * radius;
      const dy = (ship.position.y - this.world.player.position.y) / range * radius;
      if (dx * dx + dy * dy > (radius - 2) ** 2) continue;
      this.c.fillStyle = this.world.isEnemy(this.world.player.government, ship.government) ? COLORS.bad : COLORS.good;
      this.c.fillRect(cx + dx - 1, cy + dy - 1, 3, 3);
    }
    this.c.fillStyle = COLORS.accent;
    this.c.fillRect(cx - 1, cy - 1, 3, 3);
  }

  private drawPause(): void {
    this.c.fillStyle = 'rgba(0,0,0,.72)';
    this.c.fillRect(0, 0, W, H);
    this.drawText('PAUSED', W / 2, 230, COLORS.text, this.font18, 'center', 0);
    this.drawButton(W / 2 - 130, 280, 260, 32, 'Resume', () => { this.screen = 'flight'; });
    this.drawButton(W / 2 - 130, 320, 260, 32, 'Save game', () => this.saveGame());
    this.drawButton(W / 2 - 130, 360, 260, 32, 'Pilot info', () => { this.prior = 'pause'; this.screen = 'info'; });
    this.drawButton(W / 2 - 130, 400, 260, 32, 'Main menu', () => { this.saveGame(); this.screen = 'menu'; });
    this.drawButton(W / 2 - 130, 440, 260, 32, 'Quit to the website', () => this.ctx.exit());
  }

  private drawDead(): void {
    this.c.fillStyle = '#000';
    this.c.fillRect(0, 0, W, H);
    this.drawText('YOUR SHIP WAS DESTROYED', W / 2, 280, COLORS.bad, this.font18, 'center', 0);
    this.drawText('The original would reload the last save.', W / 2, 312, COLORS.dim, this.font14, 'center', 0);
    this.drawButton(W / 2 - 130, 370, 260, 34, 'Load the last save', () => { void this.continueGame().then(() => { this.screen = 'flight'; }); });
    this.drawButton(W / 2 - 130, 414, 260, 34, 'Main menu', () => { this.screen = 'menu'; });
  }

  // ---------------------------------------------------------------------- map

  private drawMap(): void {
    if (!this.data || !this.pilot) return;
    this.c.fillStyle = '#02040a';
    this.c.fillRect(0, 0, W, H);
    if (!this.mapView.ready) {
      this.mapView.cx = this.pilot.system.position.x;
      this.mapView.cy = this.pilot.system.position.y;
      this.mapView.scale = 0.9;
      this.mapView.ready = true;
    }
    const view = this.mapView;
    const centerX = 385;
    const centerY = 390;
    const at = (s: StarSystem): Point => new Point(
      centerX + (s.position.x - view.cx) * view.scale,
      centerY + (s.position.y - view.cy) * view.scale,
    );
    const systems = [...this.data.systems.values()];
    const visited = this.pilot.visited;

    this.c.save();
    this.c.beginPath();
    this.c.rect(0, 72, 776, 630);
    this.c.clip();
    // Links first.
    this.c.lineWidth = 1;
    for (const system of systems) {
      const a = at(system);
      if (a.x < -100 || a.x > 876 || a.y < 0 || a.y > 780) continue;
      for (const linkName of system.links) {
        const other = this.data.systems.get(linkName);
        if (!other || other.name < system.name) continue;
        const b = at(other);
        if (b.x < -100 || b.x > 876 || b.y < 0 || b.y > 780) continue;
        const known = visited.has(system.name) && visited.has(other.name);
        this.c.strokeStyle = known ? '#3a5a74' : '#18232e';
        this.c.beginPath();
        this.c.moveTo(a.x, a.y);
        this.c.lineTo(b.x, b.y);
        this.c.stroke();
      }
    }
    // Systems.
    for (const system of systems) {
      const p = at(system);
      if (p.x < -20 || p.x > 796 || p.y < 60 || p.y > 720) continue;
      const known = visited.has(system.name);
      const current = system === this.pilot.system;
      const selected = system === this.selectedSystem;
      const onRoute = this.route.includes(system);
      const radius = current || selected ? 4.5 : known ? 2.4 : 1.4;
      this.c.fillStyle = current ? COLORS.good : selected ? COLORS.accent : onRoute ? COLORS.warn
        : known ? '#a9c7dd' : '#3c4a58';
      this.c.beginPath();
      this.c.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.c.fill();
      if (current || selected) {
        this.c.strokeStyle = current ? COLORS.good : COLORS.accent;
        this.c.beginPath();
        this.c.arc(p.x, p.y, 8, 0, Math.PI * 2);
        this.c.stroke();
      }
    }
    // Route.
    if (this.route.length) {
      this.c.strokeStyle = COLORS.warn;
      this.c.lineWidth = 2;
      this.c.beginPath();
      let prev = at(this.pilot.system);
      this.c.moveTo(prev.x, prev.y);
      for (const step of this.route) {
        prev = at(step);
        this.c.lineTo(prev.x, prev.y);
      }
      this.c.stroke();
    }
    // Names, avoiding overlap.
    const labels: { x: number; y: number; w: number; h: number }[] = [];
    for (const system of systems) {
      const p = at(system);
      if (p.x < -20 || p.x > 796 || p.y < 60 || p.y > 720) continue;
      const important = system === this.pilot.system || system === this.selectedSystem
        || this.route.includes(system) || visited.has(system.name);
      if (!important) continue;
      const width = textWidth(this.font14, system.displayName);
      const box = { x: p.x + 7, y: p.y - 7, w: width, h: 16 };
      if (labels.some((l) => box.x < l.x + l.w && box.x + box.w > l.x && box.y < l.y + l.h && box.y + box.h > l.y)) continue;
      labels.push(box);
      this.drawText(system.displayName, box.x, box.y + 1, system === this.pilot.system ? COLORS.good
        : system === this.selectedSystem ? COLORS.accent : COLORS.text, this.font14);
    }
    this.c.restore();

    this.drawText('STAR MAP', 30, 30, COLORS.text, this.font18);
    this.drawText(`fuel ${Math.round(this.pilot.ship.fuel)} / jump ${Math.round(this.world?.jumpFuel() ?? 100)}`, 30, 52, COLORS.dim, this.font14);
    this.drawButton(590, 24, 34, 28, '+', () => { this.mapView.scale = Math.min(8, this.mapView.scale * 1.35); });
    this.drawButton(630, 24, 34, 28, '-', () => { this.mapView.scale = Math.max(0.12, this.mapView.scale / 1.35); });
    this.drawButton(674, 24, 90, 28, 'Center', () => {
      this.mapView.cx = this.pilot!.system.position.x;
      this.mapView.cy = this.pilot!.system.position.y;
    });
    this.drawText('click a star: course; arrows pan; +/- zoom', 30, 715, COLORS.faint, this.font14);
    this.drawButton(W - 240, 24, 210, 28, 'Back to flight (M)', () => { this.screen = 'flight'; });

    // Right panel.
    const selected = this.selectedSystem;
    const px = 800;
    this.c.fillStyle = COLORS.panel;
    this.c.fillRect(px - 10, 70, W - px + 10, H - 90);
    if (selected) {
      this.drawText(selected.displayName, px, 86, COLORS.text, this.font18);
      this.drawText(this.data.governments.get(selected.government)?.displayName ?? selected.government, px, 108, COLORS.dim, this.font14);
      let y = 140;
      this.drawText('PLANETS', px, y, COLORS.accent, this.font14);
      y += 22;
      for (const object of selected.objects) {
        if (!object.planet) continue;
        const planet = this.data.planets.get(object.planet);
        if (!planet) continue;
        this.drawText(planet.displayName, px, y, COLORS.text, this.font14);
        y += 18;
        if (y > 360) break;
      }
      y = Math.max(y + 10, 370);
      this.drawText('TRADE', px, y, COLORS.accent, this.font14);
      y += 22;
      for (const [commodity, price] of selected.trade) {
        this.drawText(commodity, px, y, COLORS.text, this.font14);
        this.drawText(String(price.price), px + 190, y, COLORS.dim, this.font14, 'right', 0);
        y += 18;
        if (y > H - 140) break;
      }
      const current = selected === this.pilot.system;
      if (!current) {
        this.drawButton(px, H - 90, W - px - 10, 30, this.route.length ? 'Course set' : 'Set course', () => {
          if (!this.pilot) return;
          this.route = this.world?.route(this.pilot.system, selected) ?? [];
          if (!this.route.length) this.notify('No hyperspace route.');
          else this.notify(`Course set: ${this.route.length} jump${this.route.length === 1 ? '' : 's'}. Press J.`);
        });
        this.drawButton(px, H - 54, W - px - 10, 30, 'Jump (J)', () => this.jumpNext(), this.route.length > 0);
      }
    } else {
      this.drawText('Click a star system.', px, 100, COLORS.dim, this.font14);
      this.drawText('Visited systems are bright;', px, 124, COLORS.faint, this.font14);
      this.drawText('the rest of the galaxy is dim.', px, 142, COLORS.faint, this.font14);
    }
  }

  private mapView = { cx: 0, cy: 0, scale: 0.9, ready: false };

  private clickMap(x: number, y: number): void {
    if (!this.data || !this.pilot || x > 776 || y < 72) return;
    const centerX = 385;
    const centerY = 390;
    let best: StarSystem | null = null;
    let bestDistance = 13 * 13;
    for (const system of this.data.systems.values()) {
      const px = centerX + (system.position.x - this.mapView.cx) * this.mapView.scale;
      const py = centerY + (system.position.y - this.mapView.cy) * this.mapView.scale;
      if (px < 0 || px > 776 || py < 72 || py > 720) continue;
      const distance = (px - x) ** 2 + (py - y) ** 2;
      if (distance < bestDistance) { bestDistance = distance; best = system; }
    }
    if (best) {
      this.selectedSystem = best;
      this.route = this.world?.route(this.pilot.system, best) ?? [];
      void this.preloadSystem();
    }
  }

  // ------------------------------------------------------------------- planet

  private drawPlanet(): void {
    if (!this.pilot || !this.data) return;
    const planet = this.data.planets.get(this.pilot.planet);
    if (!planet) { this.screen = 'flight'; return; }
    // Landscape.
    const landscape = planet.landscapes[Math.abs(hashName(planet.name)) % Math.max(1, planet.landscapes.length)]?.name;
    if (landscape) {
      const image = this.assets.frameImage(landscape);
      if (image) {
        this.c.globalAlpha = 0.9;
        this.c.drawImage(image, 0, 0, W, H);
        this.c.globalAlpha = 1;
        this.c.fillStyle = 'rgba(0,0,0,.62)';
        this.c.fillRect(0, 0, W, H);
      }
    }
    this.c.fillStyle = 'rgba(3,7,12,.9)';
    this.c.fillRect(28, 26, 700, H - 150);
    this.drawText(planet.displayName, 50, 44, COLORS.text, this.font18);
    this.drawText(`${this.data.systems.get(planet.system)?.displayName ?? planet.system}  -  ${this.pilot.date.toString()}`, 50, 68, COLORS.dim, this.font14);
    const conditions = pilotConditions(this.pilot);
    const description = paragraphsText(planet.description, conditions);
    const spaceport = paragraphsText(planet.spaceport, conditions);
    let y = 100;
    for (const line of wrapText(this.font14, description, 650)) {
      this.drawText(line, 50, y, COLORS.text, this.font14);
      y += 20;
      if (y > 330) break;
    }
    y += 10;
    if (spaceport) {
      this.drawText('SPACEPORT', 50, y, COLORS.accent, this.font14);
      y += 22;
      for (const line of wrapText(this.font14, spaceport, 650)) {
        this.drawText(line, 50, y, COLORS.dim, this.font14);
        y += 20;
        if (y > H - 180) break;
      }
    }
    // Services.
    const buttons: [string, () => void, boolean][] = [
      ['Trading', () => { this.screen = 'trade'; this.selectedCommodity = 0; }, planet.hasSpaceport],
      ['Shipyard', () => { this.screen = 'shipyard'; this.selectedShip = 0; }, planet.shipyards.length > 0],
      ['Outfitter', () => { this.screen = 'outfitter'; this.selectedOutfit = 0; }, planet.outfitters.length > 0],
      ['Depart', () => this.depart(), true],
    ];
    for (let i = 0; i < buttons.length; ++i) {
      this.drawButton(752, 130 + i * 44, 230, 34, buttons[i][0], buttons[i][1], buttons[i][2]);
    }
    this.drawText(`${this.pilot.credits.toLocaleString('en-US')} credits`, 752, 320, COLORS.text, this.font14);
    if (this.pilot.mortgage) {
      this.drawText(`Mortgage: ${this.pilot.mortgage.principal.toLocaleString('en-US')}`, 752, 340, COLORS.dim, this.font14);
      this.drawText(`Payment: ${mortgagePayment(this.pilot.mortgage).toLocaleString('en-US')} / day`, 752, 360, COLORS.dim, this.font14);
    }
    this.drawText(`${cargoUsed(this.pilot)} / ${this.pilot.ship.stats.get('cargo space')} tons cargo`, 752, 390, COLORS.dim, this.font14);
  }

  private tryLand(): void {
    if (!this.world || !this.pilot) return;
    const target = this.world.landingTarget();
    if (!target) { this.notify('No planet in range.'); return; }
    const planet = this.data!.planets.get(target.planet);
    if (!planet) return;
    this.pilot.planet = planet.name;
    this.pilot.visitedPlanets.add(planet.name);
    this.screen = 'planet';
    this.world.landedOn = planet.name;
    // Landing at a spaceport recharges the ship (Port::GetRecharges).
    if (planet.hasSpaceport) {
      this.pilot.ship.shields = this.pilot.ship.maxShields();
      this.pilot.ship.hull = this.pilot.ship.maxHull();
      this.pilot.ship.energy = this.pilot.ship.maxEnergy();
      this.pilot.ship.fuel = this.pilot.ship.maxFuel();
      this.pilot.ship.heat = 0;
      this.pilot.ship.isDisabled = false;
    }
    this.sound?.play('landing');
    void this.saveGame(true);
  }

  private depart(): void {
    if (!this.pilot || !this.world) return;
    if (!this.pilot.ship) return;
    const planet = this.pilot.planet;
    this.pilot.planet = '';
    this.world.launchFrom(planet);
    this.screen = 'flight';
    this.sound?.play('afterburner', 0.4);
    void this.preloadSystem();
  }

  private jumpNext(): void {
    if (!this.pilot || !this.world || !this.data) return;
    if (!this.world.canJump()) { this.notify('This ship has no hyperdrive.'); return; }
    if (!this.route.length) { this.notify('Open the map (M) and set a course first.'); return; }
    const next = this.route[0];
    if (!this.pilot.system.links.includes(next.name)) { this.notify('The next jump is not a hyperspace link.'); return; }
    const cost = this.world.jumpFuel();
    if (this.pilot.ship.fuel < cost) { this.notify('Not enough fuel for the jump.'); return; }
    this.pilot.ship.fuel -= cost;
    this.route.shift();
    this.pilot.system = next;
    this.pilot.visited.add(next.name);
    stepDay(this.pilot, this.data, new Random(seedFromText(next.name + this.pilot.date.toString())), []);
    this.world.jumpTo(next);
    this.screen = 'flight';
    this.sound?.play('hyperdrive', 0.6);
    void this.saveGame(true);
    void this.preloadSystem();
  }

  // -------------------------------------------------------------------- trade

  private drawTrade(): void {
    if (!this.pilot || !this.data) return;
    const system = this.pilot.system;
    this.drawHeader('TRADING', this.pilot.planet);
    this.drawText(`Credits ${this.pilot.credits.toLocaleString('en-US')}   cargo ${cargoUsed(this.pilot)} / ${this.pilot.ship.stats.get('cargo space')}   free ${cargoFree(this.pilot)}`, 40, 100, COLORS.dim, this.font14);
    const commodities = this.data.commodities;
    let y = 130;
    for (let i = 0; i < commodities.length; ++i) {
      const commodity = commodities[i];
      const selected = i === this.selectedCommodity;
      if (selected) { this.c.fillStyle = '#101a26'; this.c.fillRect(30, y - 5, 620, 26); }
      this.addHit(30, y - 5, 620, 26, () => { this.selectedCommodity = i; });
      const price = this.data.tradePrice(system, commodity.name);
      this.drawText(commodity.name, 40, y, COLORS.text, this.font14);
      this.drawText(String(price), 300, y, COLORS.text, this.font14, 'right', 0);
      this.drawText(`${this.pilot.ship.cargo.get(commodity.name) ?? 0} t`, 430, y, COLORS.dim, this.font14, 'right', 0);
      this.drawText(`${commodity.low}-${commodity.high}`, 560, y, COLORS.faint, this.font14, 'right', 0);
      y += 30;
    }
    const commodity = commodities[this.selectedCommodity];
    if (commodity) {
      const price = this.data.tradePrice(system, commodity.name);
      this.drawText(commodity.name, 40, 470, COLORS.accent, this.font18);
      const buttons: [string, number, () => void][] = [
        ['Buy 1', 1, () => this.buy(commodity, 1)],
        ['Buy 10', 10, () => this.buy(commodity, 10)],
        ['Buy max', Infinity, () => this.buy(commodity, Infinity)],
        ['Sell 1', 1, () => this.sell(commodity, 1)],
        ['Sell 10', 10, () => this.sell(commodity, 10)],
        ['Sell all', Infinity, () => this.sell(commodity, Infinity)],
      ];
      for (let i = 0; i < buttons.length; ++i) {
        this.drawButton(40 + (i % 3) * 180, 500 + Math.floor(i / 3) * 42, 160, 32, buttons[i][0], buttons[i][2],
          i < 3 ? price * (buttons[i][1] === Infinity ? 1 : buttons[i][1]) <= this.pilot.credits
            : (this.pilot.ship.cargo.get(commodity.name) ?? 0) > 0);
      }
      this.drawText(`Price ${price} credits per ton. Buying lowers the price the next day; selling raises it.`, 40, 590, COLORS.dim, this.font14);
    }
    this.drawButton(W - 210, H - 60, 180, 34, 'Back to planet', () => { this.screen = 'planet'; });
  }

  private buy(commodity: Commodity, requested: number): void {
    if (!this.pilot || !this.data) return;
    const price = this.data.tradePrice(this.pilot.system, commodity.name);
    let count = requested === Infinity ? Math.floor(this.pilot.credits / Math.max(1, price)) : requested;
    count = Math.min(count, cargoFree(this.pilot));
    if (count <= 0) { this.notify('No cargo space or not enough credits.'); return; }
    this.pilot.credits -= price * count;
    addCargo(this.pilot, commodity.name, count);
    recordPurchase(this.pilot, this.pilot.system, commodity.name, -count);
    this.notify(`Bought ${count} tons of ${commodity.name}.`);
  }

  private sell(commodity: Commodity, requested: number): void {
    if (!this.pilot || !this.data) return;
    const have = this.pilot.ship.cargo.get(commodity.name) ?? 0;
    const count = Math.min(have, requested === Infinity ? have : requested);
    if (count <= 0) { this.notify('You have none of that commodity.'); return; }
    const price = this.data.tradePrice(this.pilot.system, commodity.name);
    this.pilot.credits += price * count;
    addCargo(this.pilot, commodity.name, -count);
    recordPurchase(this.pilot, this.pilot.system, commodity.name, count);
    this.notify(`Sold ${count} tons of ${commodity.name}.`);
  }

  // ------------------------------------------------------------------ shipyard

  private drawShipyard(): void {
    if (!this.pilot || !this.data) return;
    this.drawHeader('SHIPYARD', this.pilot.planet);
    const planet = this.data.planets.get(this.pilot.planet);
    this.shipsForSale = [];
    for (const name of planet?.shipyards ?? []) {
      for (const ship of this.data.shipyards.get(name)?.ships ?? []) {
        const model = this.data.ships.get(ship);
        if (model && !this.shipsForSale.includes(model)) this.shipsForSale.push(model);
      }
    }
    this.drawText(`Credits ${this.pilot.credits.toLocaleString('en-US')}   Your ship: ${this.pilot.ship.model.displayName}`, 40, 100, COLORS.dim, this.font14);
    let y = 135;
    for (let i = 0; i < this.shipsForSale.length; ++i) {
      const model = this.shipsForSale[i];
      const attrs = this.data.shipAttributes(model);
      const selected = i === this.selectedShip;
      if (selected) { this.c.fillStyle = '#101a26'; this.c.fillRect(30, y - 6, 640, 34); }
      this.addHit(30, y - 6, 640, 34, () => { this.selectedShip = i; });
      this.drawText(model.displayName, 40, y, COLORS.text, this.font14);
      this.drawText(`${this.data.shipCost(model).toLocaleString('en-US')} cr`, 360, y, COLORS.text, this.font14, 'right', 0);
      this.drawText(`${attrs.get('shields')} sh  ${attrs.get('hull')} hull  ${attrs.get('cargo space')} t`, 390, y, COLORS.dim, this.font14);
      this.drawText(model.category, 40, y + 16, COLORS.faint, this.font14);
      y += 40;
      if (y > H - 180) break;
    }
    const model = this.shipsForSale[this.selectedShip];
    if (model) {
      this.drawText(model.displayName, 730, 130, COLORS.accent, this.font18);
      const attrs = this.data.shipAttributes(model);
      const stats: [string, string][] = [
        ['cost', this.data.shipCost(model).toLocaleString('en-US')],
        ['mass', String(Math.round(attrs.mass))],
        ['shields', String(attrs.get('shields'))],
        ['hull', String(attrs.get('hull'))],
        ['cargo', String(attrs.get('cargo space'))],
        ['outfit space', String(attrs.get('outfit space'))],
        ['thrust', String(attrs.get('thrust'))],
        ['turn', String(attrs.get('turn'))],
      ];
      for (let i = 0; i < stats.length; ++i) this.drawText(`${stats[i][0]}  ${stats[i][1]}`, 730, 160 + i * 20, COLORS.text, this.font14);
      const desc = model.description.map((p) => p.text).join('').trim();
      let ty = 340;
      for (const line of wrapText(this.font14, desc, 260)) {
        this.drawText(line, 730, ty, COLORS.dim, this.font14);
        ty += 18;
        if (ty > H - 180) break;
      }
      const tradeIn = Math.round(this.data.shipCost(this.pilot.ship.model) * 0.75);
      this.drawText(`Trade-in for your ship: ${tradeIn.toLocaleString('en-US')} cr`, 40, H - 150, COLORS.dim, this.font14);
      this.drawButton(40, H - 110, 220, 34, 'Buy this ship', () => this.buyShip(model, tradeIn),
        this.pilot!.credits + tradeIn >= this.data!.shipCost(model));
    }
    this.drawButton(W - 210, H - 60, 180, 34, 'Back to planet', () => { this.screen = 'planet'; });
  }

  private buyShip(model: ShipModel, tradeIn: number): void {
    if (!this.pilot || !this.data || !this.world) return;
    const price = this.data.shipCost(model);
    if (this.pilot.credits + tradeIn < price) { this.notify('You cannot afford that ship.'); return; }
    const cargo = new Map(this.pilot.ship.cargo);
    const newShip = new Ship(this.data, model, model.defaultOutfits, model.displayName, true);
    let used = 0;
    for (const tons of cargo.values()) used += tons;
    if (used > newShip.stats.get('cargo space')) cargo.clear();
    for (const [name, tons] of cargo) newShip.cargo.set(name, tons);
    this.pilot.credits += tradeIn - price;
    this.pilot.ship = newShip;
    this.world.player = newShip;
    newShip.position = this.pilot.ship.position;
    this.screen = 'planet';
    this.notify(`Bought a ${model.displayName}. Your old ship was traded in.`);
    void this.saveGame(true);
  }

  // ------------------------------------------------------------------ outfitter

  private drawOutfitter(): void {
    if (!this.pilot || !this.data) return;
    this.drawHeader('OUTFITTER', this.pilot.planet);
    const planet = this.data.planets.get(this.pilot.planet);
    this.outfitsForSale = [];
    for (const name of planet?.outfitters ?? []) {
      for (const outfit of this.data.outfitters.get(name)?.outfits ?? []) {
        const item = this.data.outfits.get(outfit);
        if (item && !this.outfitsForSale.includes(item)) this.outfitsForSale.push(item);
      }
    }
    this.outfitsForSale.sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));
    this.drawText(`Credits ${this.pilot.credits.toLocaleString('en-US')}   outfit space ${Math.round(this.pilot.ship.stats.get('outfit space'))}`, 40, 100, COLORS.dim, this.font14);
    const start = Math.max(0, Math.min(this.outfitsForSale.length - 12, this.selectedOutfit - 6));
    let y = 130;
    for (let i = start; i < Math.min(this.outfitsForSale.length, start + 12); ++i) {
      const outfit = this.outfitsForSale[i];
      const selected = i === this.selectedOutfit;
      if (selected) { this.c.fillStyle = '#101a26'; this.c.fillRect(30, y - 5, 600, 25); }
      this.addHit(30, y - 5, 600, 25, () => { this.selectedOutfit = i; });
      this.drawText(outfit.name, 40, y, COLORS.text, this.font14);
      this.drawText(outfit.category, 370, y, COLORS.faint, this.font14);
      this.drawText(String(outfit.cost), 600, y, COLORS.text, this.font14, 'right', 0);
      const installed = this.pilot.ship.outfitCount(outfit.name);
      if (installed) this.drawText(`x${installed}`, 630, y, COLORS.good, this.font14);
      y += 30;
    }
    const outfit = this.outfitsForSale[this.selectedOutfit];
    if (outfit) {
      this.drawText(outfit.name, 700, 130, COLORS.accent, this.font18);
      this.drawText(outfit.category, 700, 152, COLORS.dim, this.font14);
      const stats: [string, string][] = [
        ['cost', String(outfit.cost)],
        ['mass', String(outfit.mass)],
        ['outfit space', String(outfit.stats.get('outfit space'))],
        ['weapon capacity', String(outfit.stats.get('weapon capacity'))],
        ['engine capacity', String(outfit.stats.get('engine capacity'))],
      ];
      let sy = 180;
      for (const [label, value] of stats) {
        if (value === '0') continue;
        this.drawText(`${label}  ${value}`, 700, sy, COLORS.text, this.font14);
        sy += 20;
      }
      const desc = outfit.description.map((p) => p.text).join('').trim();
      sy += 8;
      for (const line of wrapText(this.font14, desc, 300)) {
        this.drawText(line, 700, sy, COLORS.dim, this.font14);
        sy += 18;
        if (sy > H - 150) break;
      }
      const installed = this.pilot.ship.outfitCount(outfit.name);
      this.drawButton(40, H - 110, 180, 34, 'Buy', () => this.buyOutfit(outfit),
        this.pilot!.credits >= outfit.cost && this.canInstall(outfit));
      this.drawButton(240, H - 110, 180, 34, 'Sell', () => this.sellOutfit(outfit), installed > 0);
      this.drawButton(40, H - 70, 120, 28, 'Prev', () => { this.selectedOutfit = Math.max(0, this.selectedOutfit - 12); }, this.selectedOutfit > 0);
      this.drawButton(180, H - 70, 120, 28, 'Next', () => { this.selectedOutfit = Math.min(this.outfitsForSale.length - 1, this.selectedOutfit + 12); },
        this.selectedOutfit + 12 < this.outfitsForSale.length);
      this.drawText(this.canInstall(outfit) ? 'It fits in your ship.' : 'It does not fit in your ship.', 440, H - 100,
        this.canInstall(outfit) ? COLORS.good : COLORS.bad, this.font14);
    }
    this.drawButton(W - 210, H - 60, 180, 34, 'Back to planet', () => { this.screen = 'planet'; });
  }

  private canInstall(outfit: Outfit): boolean {
    if (!this.pilot) return false;
    const ship = this.pilot.ship;
    const next = ship.stats.clone();
    next.addStats(outfit.stats, 1);
    if (next.get('outfit space') < 0 || next.get('weapon capacity') < 0 || next.get('engine capacity') < 0) return false;
    if (next.get('gun ports') < 0 || next.get('turret mounts') < 0) return false;
    if (next.get('required crew') > next.get('bunks') && next.get('required crew') > 1) return false;
    for (const license of outfit.licenses) {
      if (!this.pilot.conditions.get('license: ' + license)) return false;
    }
    return true;
  }

  private buyOutfit(outfit: Outfit): void {
    if (!this.pilot) return;
    if (this.pilot.credits < outfit.cost) { this.notify('You cannot afford that outfit.'); return; }
    if (!this.canInstall(outfit)) { this.notify('It does not fit in your ship.'); return; }
    this.pilot.credits -= outfit.cost;
    this.pilot.ship.addOutfit(outfit.name, 1);
    this.notify(`Installed ${outfit.name}.`);
  }

  private sellOutfit(outfit: Outfit): void {
    if (!this.pilot) return;
    if (this.pilot.ship.outfitCount(outfit.name) <= 0) { this.notify('You do not have that outfit.'); return; }
    this.pilot.credits += Math.round(outfit.cost * 0.75);
    this.pilot.ship.addOutfit(outfit.name, -1);
    this.notify(`Sold ${outfit.name}.`);
  }

  // ---------------------------------------------------------------------- info

  private drawInfo(): void {
    if (!this.pilot || !this.data) { this.drawAbout(); return; }
    const pilot = this.pilot;
    this.drawHeader('PILOT', '');
    this.drawText(`${pilot.firstName} ${pilot.lastName}`, 50, 120, COLORS.text, this.font18);
    const lines: [string, string][] = [
      ['Date', pilot.date.toString()],
      ['System', pilot.system.displayName],
      ['Planet', pilot.planet || 'in flight'],
      ['Credits', pilot.credits.toLocaleString('en-US')],
      ['Score', String(pilot.score)],
      ['Ship', pilot.ship.model.displayName],
      ['Shields', `${Math.round(pilot.ship.shields)} / ${Math.round(pilot.ship.maxShields())}`],
      ['Hull', `${Math.round(pilot.ship.hull)} / ${Math.round(pilot.ship.maxHull())}`],
      ['Cargo', `${cargoUsed(pilot)} / ${pilot.ship.stats.get('cargo space')} tons`],
      ['Outfits', `${pilot.ship.outfits.size} kinds installed`],
      ['Playtime', `${Math.round(pilot.playtime + this.playtime)} s`],
    ];
    if (pilot.mortgage) {
      lines.push(['Mortgage', pilot.mortgage.principal.toLocaleString('en-US')]);
      lines.push(['Payment', `${mortgagePayment(pilot.mortgage).toLocaleString('en-US')} / day`]);
    }
    let y = 160;
    for (const [key, value] of lines) {
      this.drawText(key, 50, y, COLORS.dim, this.font14);
      this.drawText(value, 220, y, COLORS.text, this.font14);
      y += 24;
    }
    this.drawButton(50, H - 100, 180, 34, 'Save game', () => this.saveGame());
    this.drawButton(250, H - 100, 180, 34, 'Back', () => {
      this.screen = this.screen === 'info' && this.prior === 'pause' ? 'pause' : (this.pilot?.planet ? 'planet' : 'flight');
      this.prior = 'flight';
    });
    this.drawText('The original saves a pilot file; this port keeps pilot.txt in your account.', 50, H - 50, COLORS.faint, this.font14);
  }

  private drawAbout(): void {
    this.drawHeader('ENDLESS SKY', '');
    this.drawText('Endless Sky', 50, 110, COLORS.text, this.font18);
    this.drawText('A 2D space trading and combat game by M. C. Martin and the community.', 50, 145, COLORS.text, this.font14);
    this.drawText('This port follows the stable release 0.11.4: the original data files,', 50, 175, COLORS.dim, this.font14);
    this.drawText('ships, outfits, sprites, sounds and bitmap fonts, with the flight physics,', 50, 195, COLORS.dim, this.font14);
    this.drawText('star map, trading, outfitting and combat of the original.', 50, 215, COLORS.dim, this.font14);
    this.drawText('Code and data are GPL-3.0-or-later; artwork is CC-BY-SA-4.0;', 50, 255, COLORS.dim, this.font14);
    this.drawText('see LICENSE.md and ORIGINAL-COPYRIGHT.txt for the file-by-file credits.', 50, 275, COLORS.dim, this.font14);
    this.drawText('Controls: arrows or WASD fly, Space fire, Q missiles, L land, J jump,', 50, 315, COLORS.text, this.font14);
    this.drawText('M map, I info, Esc menu. Shift/F afterburner, X stop.', 50, 335, COLORS.text, this.font14);
    this.drawButton(50, H - 90, 180, 34, 'Back', () => { this.screen = 'menu'; });
  }

  // --------------------------------------------------------------------- save

  private async saveGame(quiet = false): Promise<void> {
    if (!this.pilot) return;
    this.pilot.playtime += this.playtime;
    this.playtime = 0;
    try {
      const bytes = new TextEncoder().encode(savePilot(this.pilot));
      this.saveData = bytes;
      if (!this.ctx.net.hasAccount()) {
        if (!quiet) this.notify('No account yet; the pilot is kept in this browser session.');
        return;
      }
      await this.ctx.storage.put('pilot.txt', bytes);
      if (!quiet) this.notify('Game saved.');
    } catch {
      if (!quiet) this.notify('Could not save to the server.');
    }
  }

  // ------------------------------------------------------------------- drawing

  private drawHeader(title: string, where: string): void {
    this.c.fillStyle = COLORS.panel;
    this.c.fillRect(0, 0, W, 72);
    this.c.strokeStyle = COLORS.line;
    this.c.beginPath();
    this.c.moveTo(0, 72);
    this.c.lineTo(W, 72);
    this.c.stroke();
    this.drawText(title, 40, 20, COLORS.text, this.font18);
    if (where) this.drawText(` - ${where}`, 40 + textWidth(this.font18, title), 20, COLORS.dim, this.font18);
    this.drawText(this.pilot?.date.toString() ?? '', W - 40, 24, COLORS.dim, this.font14, 'right', 0);
  }

  private drawButton(x: number, y: number, w: number, h: number, label: string, action: () => void, enabled = true): void {
    const hover = enabled && this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y && this.mouse.y <= y + h;
    this.c.fillStyle = hover ? '#172433' : '#0b121b';
    this.c.fillRect(x, y, w, h);
    this.c.strokeStyle = enabled ? (hover ? COLORS.accent : COLORS.line) : '#1c242c';
    this.c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    this.drawText(label, x + w / 2, y + (h - fontHeight(this.font14)) / 2 - 1,
      enabled ? (hover ? '#ffffff' : COLORS.text) : '#46505a', this.font14, 'center', 0);
    this.addHit(x, y, w, h, action, enabled);
  }

  private drawText(text: string, x: number, y: number, color: string, font: string,
    align: 'left' | 'center' | 'right' = 'left', width = 0): void {
    drawText(this.c, font, text, x, y, { color, align, width });
  }

  /** Draw a sprite at screen x/y, rotated by `degrees`, scaled. Returns false if not loaded. */
  private drawSprite(name: string, x: number, y: number, scale = 1, alpha = 1, degrees = 0, frame = 0): boolean {
    const image = this.assets.frameImage(name, frame);
    if (!image) return false;
    const blend = this.assets.blendOf(name, frame);
    this.c.save();
    this.c.translate(x, y);
    if (degrees) this.c.rotate(degrees * Math.PI / 180);
    this.c.globalAlpha *= alpha;
    if (blend === '+' || blend === '~') this.c.globalCompositeOperation = 'lighter';
    else if (blend === '^') { this.c.globalCompositeOperation = 'lighter'; this.c.globalAlpha *= 0.5; }
    this.c.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
    this.c.restore();
    return true;
  }
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

function hashName(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; ++i) hash = (Math.imul(hash, 31) + text.charCodeAt(i)) | 0;
  return hash;
}

function paragraphsText(paragraphs: readonly { condition: Condition; text: string }[], conditions: Conditions): string {
  return paragraphs.filter((p) => p.text && p.condition(conditions)).map((p) => p.text).join('');
}

type Condition = (conditions: Conditions) => boolean;

export const start: StartGame = async (host, ctx) => {
  const app = new App(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};

export type { Angle, Point, Planet, StarSystem, GameDate, Condition };
