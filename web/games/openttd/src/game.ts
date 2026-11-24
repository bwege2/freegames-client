// The stage-2 page: a generated OpenTTD 15.3 landscape drawn with the
// original's sprites, pannable and zoomable. Map generation is the ported
// TerraGenesis code; towns, industries, trees and vehicles are later stages.
import type { GameContext } from '../../../src/sdk/index.ts';
import { defaultGeneration, Landscape, type GenerationSettings } from './sim/settings.ts';
import { TileType } from './sim/world.ts';
import { generateWorld, type GeneratedWorld } from './sim/worldgen.ts';
import { convertDateToYMD, convertYMDToDate } from './sim/date.ts';
import { groundSpriteId } from './render/scene.ts';
import { treeSprites } from './render/tree.ts';
import { buildScenario, scenarioAt, scenarioDescription, type Scenario } from './scenario.ts';
import { Construction, type ConstructionSave } from './construction.ts';
import { COAL_TRUCK, Fleet, type FleetSave, type Truck } from './vehicles.ts';
import { Palette } from './render/palette.ts';
import { SpriteRenderer, type SpriteTable } from './render/renderer.ts';
import spritesUrl from '../assets/sprites/sprites.json?url';

const ATLAS_URLS = import.meta.glob<string>('../assets/sprites/atlas-*.bin', { eager: true, query: '?url', import: 'default' });
const ZOOMS = [0.125, 0.25, 0.5, 1, 2];
const START_SEED = 12345;
const SAVE_NAME = 'openttd-save.json';

const CSS = `
.ottd { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0b0e0b; }
.ottd canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; cursor: grab; touch-action: none; }
.ottd.dragging canvas { cursor: grabbing; }
.ottd .hud { position: absolute; left: 8px; top: 8px; padding: 4px 8px; border-radius: 4px; background: rgba(8, 14, 8, .78); color: #dfe8df; font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace; pointer-events: none; white-space: pre; }
.ottd .hud b { color: #f2c14e; font-weight: 600; }
.ottd .load { position: absolute; inset: 0; display: grid; place-items: center; color: #dfe8df; font: 14px ui-monospace, Menlo, Consolas, monospace; background: #0b0e0b; }
.ottd .panel { position: absolute; right: 8px; top: 8px; max-width: 380px; padding: 8px 10px; border-radius: 4px; background: rgba(8, 14, 8, .9); color: #dfe8df; font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace; border: 1px solid rgba(242, 193, 78, .35); display: none; white-space: pre-wrap; }
.ottd .panel b { color: #f2c14e; }
.ottd .toolbar { position: absolute; left: 8px; bottom: 8px; padding: 6px; border-radius: 4px; background: rgba(8, 14, 8, .9); border: 1px solid rgba(242, 193, 78, .35); color: #dfe8df; font: 12px ui-monospace, Menlo, Consolas, monospace; display: flex; gap: 6px; align-items: center; }
.ottd .toolbar button { background: #1c2a1c; color: #dfe8df; border: 1px solid #405040; border-radius: 3px; padding: 3px 8px; font: inherit; cursor: pointer; }
.ottd .toolbar button.active { background: #f2c14e; color: #14180f; }
.ottd .toolbar .money { color: #f2c14e; margin-left: 8px; min-width: 84px; }
.ottd .toolbar .status { color: #9fb09f; margin-left: 4px; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ottd .fleet { position: absolute; right: 8px; bottom: 8px; min-width: 250px; max-width: 380px; padding: 6px 8px; border-radius: 4px; background: rgba(8, 14, 8, .9); border: 1px solid rgba(242, 193, 78, .35); color: #dfe8df; font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap; }
.ottd .fleet b { color: #f2c14e; }
.ottd .panel button { margin-top: 6px; background: #1c2a1c; color: #dfe8df; border: 1px solid #405040; border-radius: 3px; padding: 3px 8px; font: inherit; cursor: pointer; }
`;

function settingsFor(seed: number): GenerationSettings {
  const s = defaultGeneration(seed);
  // The stage-3 configuration used by the oracle fixtures: a bare landscape
  // with rivers; trees, towns and industries arrive in later milestones.
  s.terrainType = 1;
  s.tgenSmoothness = 1;
  s.variety = 0;
  s.quantitySeaLakes = 0;
  s.mapHeightLimit = 0;
  s.freeformEdges = true;
  s.waterBorders = 16;
  s.amountOfRivers = 2;
  s.treePlacer = 2;
  s.landscape = Landscape.Temperate;
  return s;
}

export class OpenTTDGame {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly root: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly hud: HTMLDivElement;
  private readonly load: HTMLDivElement;
  private readonly panel: HTMLDivElement;
  private readonly toolbar: HTMLDivElement;
  private readonly fleetPanel: HTMLDivElement;
  private readonly signal: AbortSignal;
  private readonly palette: Palette;
  private renderer: SpriteRenderer | null = null;
  private world: GeneratedWorld | null = null;
  private order: Uint32Array = new Uint32Array(0);
  private ground: Uint32Array = new Uint32Array(0);
  private style: HTMLStyleElement;
  private seed = START_SEED;
  private zoomIndex = 3;
  private offsetX = 0;
  private offsetY = 0;
  private width = 1;
  private height = 1;
  private drag: { id: number; x: number; y: number } | null = null;
  private downAt = { x: 0, y: 0 };
  private scenario: Scenario | null = null;
  private scenarioSprites = new Map<number, { sprite: number; dy: number }[]>();
  private construction: Construction | null = null;
  private fleet: Fleet | null = null;
  private selectedTruck: number | null = null;
  private selectedStop: number | null = null;
  private saveBusy = false;
  private constructionSprites = new Map<number, { sprite: number; dy: number }[]>();
  private tool: 'select' | 'road' | 'stop' | 'demolish' = 'select';
  private buildStart: number | null = null;
  private keys = new Set<string>();
  private disposed = false;
  private ready = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.signal = ctx.signal;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.style = style;
    this.root = document.createElement('div');
    this.root.className = 'ottd';
    this.canvas = document.createElement('canvas');
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.load = document.createElement('div');
    this.load.className = 'load';
    this.load.textContent = 'Loading OpenTTD graphics…';
    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'toolbar';
    this.fleetPanel = document.createElement('div');
    this.fleetPanel.className = 'fleet';
    this.root.append(this.canvas, this.hud, this.panel, this.toolbar, this.fleetPanel, this.load);
    host.replaceChildren(this.root);
    this.palette = new Palette();
    this.signal.addEventListener('abort', () => this.destroy(), { once: true });
  }

  async init(): Promise<void> {
    const raw = (await (await fetch(spritesUrl, { signal: this.signal })).json()) as {
      atlases: SpriteTable['atlases'];
      sprites: Record<string, Record<string, SpriteTable['sprites'][string]>>;
      recolours: Record<string, Record<string, string>>;
    };
    const table: SpriteTable = { atlases: raw.atlases, sprites: raw.sprites.temperate, recolours: raw.recolours.temperate };
    const files = Object.keys(ATLAS_URLS).sort();
    const buffers = await Promise.all(files.map(async (f) => new Uint8Array(await (await fetch(ATLAS_URLS[f], { signal: this.signal })).arrayBuffer())));
    if (this.signal.aborted || this.disposed) return;
    // The table's atlas order must be the one the build wrote.
    const order = table.atlases.map((a) => files.findIndex((f) => f.endsWith('/' + a.file)));
    if (order.some((i) => i < 0)) throw new Error('sprite atlas list and files disagree');
    const atlases = order.map((i) => buffers[i]);
    this.renderer = new SpriteRenderer(this.canvas, table, atlases);
    this.load.textContent = 'Generating landscape…';
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (this.disposed) return;
    this.newWorld(START_SEED);
    this.ready = true;
    if (location.search.includes('debug')) (globalThis as unknown as { __openttd: OpenTTDGame }).__openttd = this;
    this.load.remove();
    this.resize();
    this.center();
    this.installInput();
    this.updateHud();
    this.ctx.frame((_time, dt) => this.step(dt));
    window.addEventListener('pagehide', () => { void this.saveGame(false); }, { signal: this.signal });
  }

  private newWorld(seed: number): void {
    this.seed = seed >>> 0;
    this.world = generateWorld(settingsFor(this.seed));
    this.scenarioSprites.clear();
    try {
      this.scenario = buildScenario(this.world.world);
    } catch {
      // A random landscape can lack a large enough flat area; the landscape
      // viewer still works, and the fixed start seed has a complete scenario.
      this.scenario = null;
    }
    const scenario = this.scenario;
    const addSprite = (tile: number, sprite: number, dy: number): void => {
      const list = this.scenarioSprites.get(tile) ?? [];
      list.push({ sprite, dy });
      this.scenarioSprites.set(tile, list);
    };
    if (scenario) {
      for (const road of scenario.town.roads) addSprite(road.tile, road.sprite, road.dy);
      for (const house of scenario.town.houses) addSprite(house.tile, house.sprite, house.dy);
      for (const industry of scenario.industries) {
        addSprite(this.world.world.tileXY(industry.x, industry.y), industry.sprite, 0);
      }
    }
    this.construction = new Construction(this.world.world, scenario);
    this.fleet = scenario ? new Fleet(this.world.world, this.construction, scenario) : null;
    this.selectedTruck = null;
    this.selectedStop = null;
    this.constructionSprites.clear();
    this.buildStart = null;
    this.tool = 'select';
    this.buildToolbar();
    this.panel.style.display = 'none';
    const size = this.world.world.sizeX;
    const order = new Uint32Array(size * size);
    for (let i = 0; i < order.length; i++) order[i] = i;
    // Back to front: the original draws the viewport row by row; for a static
    // landscape (x + y, then x) is the same depth order.
    order.sort((a, b) => {
      const ax = a % size, ay = (a / size) | 0, bx = b % size, by = (b / size) | 0;
      return (ax + ay) - (bx + by) || bx - ax;
    });
    this.order = order;
    this.ground = new Uint32Array(size * size).fill(0xffffffff);
    for (let i = 0; i < this.ground.length; i++) {
      const id = groundSpriteId(this.world.world, i);
      if (id !== null) this.ground[i] = id;
    }
  }

  private get zoom(): number { return ZOOMS[this.zoomIndex]; }

  private resize(): void {
    const w = Math.max(1, Math.round(this.root.clientWidth));
    const h = Math.max(1, Math.round(this.root.clientHeight));
    if (w !== this.width || h !== this.height) {
      this.width = w;
      this.height = h;
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  private center(): void {
    if (!this.world) return;
    const w = this.world.world;
    const z = this.zoom;
    const cx = w.sizeX / 2, cy = w.sizeY / 2;
    this.offsetX = this.width / 2 - (cy - cx) * 32 * z;
    this.offsetY = this.height / 2 - (cx + cy) * 16 * z + 4 * z;
  }

  private installInput(): void {
    const c = this.canvas;
    c.addEventListener('contextmenu', (e) => e.preventDefault(), { signal: this.signal });
    c.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.button !== 2) return;
      if (e.button === 0 && this.tool !== 'select') {
        const tile = this.pickTile(e.clientX, e.clientY);
        this.buildStart = tile;
        e.preventDefault();
        return;
      }
      c.setPointerCapture(e.pointerId);
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      this.downAt = { x: e.clientX, y: e.clientY };
      this.root.classList.add('dragging');
      e.preventDefault();
    }, { signal: this.signal });
    c.addEventListener('pointermove', (e) => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      this.offsetX += e.clientX - this.drag.x;
      this.offsetY += e.clientY - this.drag.y;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
    }, { signal: this.signal });
    const endDrag = (e: PointerEvent): void => {
      if (this.drag?.id === e.pointerId) {
        this.drag = null;
        this.root.classList.remove('dragging');
        if (Math.abs(e.clientX - this.downAt.x) + Math.abs(e.clientY - this.downAt.y) < 5) this.selectAt(e.clientX, e.clientY);
      }
    };
    c.addEventListener('pointerup', (e) => {
      if (e.button === 0 && this.tool !== 'select') {
        this.applyTool(e.clientX, e.clientY);
        e.preventDefault();
        return;
      }
      endDrag(e);
    }, { signal: this.signal });
    c.addEventListener('pointercancel', endDrag, { signal: this.signal });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY);
    }, { signal: this.signal, passive: false });
    window.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown' || k === '+' || k === '=' || k === '-' || k === 'F5' || k === 'F6') e.preventDefault();
      if (k === '+' || k === '=' || k === 'F5') this.zoomAt(1, this.width / 2, this.height / 2);
      else if (k === '-' || k === 'F6') this.zoomAt(-1, this.width / 2, this.height / 2);
      else if (k === 'Home') this.center();
      else if (k === 'n' || k === 'N') {
        const r = crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff;
        this.newWorld(r || 1);
        this.center();
        this.updateHud();
      } else this.keys.add(k);
    }, { signal: this.signal });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key), { signal: this.signal });
    window.addEventListener('blur', () => this.keys.clear(), { signal: this.signal });
  }

  private zoomAt(delta: number, x: number, y: number): void {
    const old = this.zoom;
    const next = Math.min(ZOOMS.length - 1, Math.max(0, this.zoomIndex + delta));
    if (next === this.zoomIndex) return;
    // Keep the world point under the cursor fixed.
    const wx = (x - this.offsetX) / old;
    const wy = (y - this.offsetY) / old;
    this.zoomIndex = next;
    this.offsetX = x - wx * this.zoom;
    this.offsetY = y - wy * this.zoom;
    this.updateHud();
  }

  private step(dt: number): void {
    if (this.disposed || !this.ready) return;
    this.fleet?.tick(dt / 1000);
    this.updateFleetPanel();
    const speed = 700 * Math.max(0.25, Math.min(2, dt / 16.7));
    if (this.keys.has('ArrowLeft')) this.offsetX += speed;
    if (this.keys.has('ArrowRight')) this.offsetX -= speed;
    if (this.keys.has('ArrowUp')) this.offsetY += speed;
    if (this.keys.has('ArrowDown')) this.offsetY -= speed;
    this.resize();
    this.render();
  }

  private render(): void {
    if (!this.renderer || !this.world) return;
    const w = this.world.world;
    const z = this.zoom;
    this.renderer.begin(this.width, this.height);
    this.palette.animate();
    this.renderer.updatePalette(this.palette.rgba);

    const inv = (sx: number, sy: number): [number, number] => {
      const a = (sx - this.offsetX) / (32 * z);
      const b = (sy - this.offsetY) / (16 * z);
      return [(b - a) / 2, (b + a) / 2];
    };
    const corners = [inv(-64, -64), inv(this.width + 64, -64), inv(-64, this.height + 64), inv(this.width + 64, this.height + 64)];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of corners) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    minX = Math.max(0, Math.floor(minX) - 20); maxX = Math.min(w.sizeX - 1, Math.ceil(maxX) + 20);
    minY = Math.max(0, Math.floor(minY) - 20); maxY = Math.min(w.sizeY - 1, Math.ceil(maxY) + 20);

    const size = w.sizeX;
    const margin = 96 * z;
    for (let k = 0; k < this.order.length; k++) {
      const tile = this.order[k];
      const x = tile % size, y = (tile / size) | 0;
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      const sx = (y - x) * 32 * z + this.offsetX;
      const sy = (x + y) * 16 * z - w.height[tile] * 8 * z + this.offsetY;
      if (sx < -margin || sx > this.width + margin || sy < -margin || sy > this.height + margin) continue;
      const id = this.ground[tile];
      if (id !== 0xffffffff) this.renderer.draw(id, sx, sy, z);
    }
    // Trees are drawn after the ground. Within one tile the original sorts
    // them by their in-tile x+y; across tiles the back-to-front tile order is
    // kept (the full viewport sorter is a later rendering milestone).
    for (let k = 0; k < this.order.length; k++) {
      const tile = this.order[k];
      if (w.tileType(tile) !== TileType.Trees) continue;
      const x = tile % size, y = (tile / size) | 0;
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      const sx = (y - x) * 32 * z + this.offsetX;
      const sy = (x + y) * 16 * z - w.tileZ(tile) * 8 * z + this.offsetY;
      if (sx < -margin || sx > this.width + margin || sy < -margin || sy > this.height + margin) continue;
      const maxZ = w.tileMaxZ(tile) - w.tileZ(tile);
      for (const spr of treeSprites(w, tile)) {
        const tx = sx + (spr.y - spr.x) * 2 * z;
        const ty = sy + (spr.x + spr.y) * z - maxZ * 4 * z;
        this.renderer.draw(spr.id, tx, ty, z);
      }
    }
    // Scenario buildings and roads are drawn when their anchor tile is
    // reached, so multi-tile industries sort correctly by their north tile.
    for (let k = 0; k < this.order.length; k++) {
      const tile = this.order[k];
      const sprites = this.scenarioSprites.get(tile);
      if (!sprites) continue;
      const x = tile % size, y = (tile / size) | 0;
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      const sx = (y - x) * 32 * z + this.offsetX;
      const sy = (x + y) * 16 * z - w.height[tile] * 8 * z + this.offsetY;
      if (sx < -margin || sx > this.width + margin || sy < -margin || sy > this.height + margin) continue;
      for (const spr of sprites) this.renderer.draw(spr.sprite, sx, sy + spr.dy * z, z);
    }
    for (let k = 0; k < this.order.length; k++) {
      const tile = this.order[k];
      const sprites = this.constructionSprites.get(tile);
      if (!sprites) continue;
      const x = tile % size, y = (tile / size) | 0;
      if (x < minX || x > maxX || y < minY || y > maxY) continue;
      const sx = (y - x) * 32 * z + this.offsetX;
      const sy = (x + y) * 16 * z - w.height[tile] * 8 * z + this.offsetY;
      if (sx < -margin || sx > this.width + margin || sy < -margin || sy > this.height + margin) continue;
      for (const spr of sprites) this.renderer.draw(spr.sprite, sx, sy + spr.dy * z, z);
    }
    if (this.fleet) {
      for (const truck of this.fleet.trucks) {
        const v = this.fleet.view(truck);
        const ax = w.tileX(v.tile), ay = w.tileY(v.tile);
        let sx = (ay - ax) * 32 * z + this.offsetX;
        let sy = (ax + ay) * 16 * z - w.height[v.tile] * 8 * z + this.offsetY;
        if (v.nextTile !== null) {
          const bx = w.tileX(v.nextTile), by = w.tileY(v.nextTile);
          const nx = (by - bx) * 32 * z + this.offsetX;
          const ny = (bx + by) * 16 * z - w.height[v.nextTile] * 8 * z + this.offsetY;
          sx += (nx - sx) * v.between;
          sy += (ny - sy) * v.between;
        }
        this.renderer.draw(COAL_TRUCK.image, sx, sy, z);
      }
    }
    this.renderer.end();
  }

  /** The map tile under a pointer position, using the drawn tile diamonds. */
  private pickTile(clientX: number, clientY: number): number | null {
    if (!this.world) return null;
    const w = this.world.world;
    const rect = this.canvas.getBoundingClientRect();
    const X = clientX - rect.left, Y = clientY - rect.top;
    const z = this.zoom;
    const u = (X - this.offsetX) / z, v = (Y - this.offsetY) / z;
    const cx = Math.round((v / 16 - u / 32) / 2);
    const cy = Math.round((v / 16 + u / 32) / 2);
    let best: number | null = null;
    let bestScore = Infinity;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const x = cx + dx, y = cy + dy;
        if (!w.inMap(x, y)) continue;
        const tile = w.tileXY(x, y);
        const sx = (y - x) * 32 * z + this.offsetX;
        const sy = (x + y) * 16 * z - w.height[tile] * 8 * z + this.offsetY;
        const px = X - sx, py = Y - sy;
        const d = Math.abs(px) / (32 * z) + Math.abs(py - 16 * z) / (16 * z);
        if (d <= 1 && d < bestScore) {
          bestScore = d;
          best = tile;
        }
      }
    }
    return best;
  }

  private selectAt(clientX: number, clientY: number): void {
    if (!this.world || !this.scenario) return;
    const tile = this.pickTile(clientX, clientY);
    if (tile !== null && this.fleet) {
      const truck = this.fleet.truckAt(tile);
      if (truck && !(this.selectedTruck !== null && this.construction?.stops.has(tile))) {
        this.selectedTruck = truck.id;
        this.truckPanel(truck);
        return;
      }
    }
    if (tile !== null && this.construction?.stops.has(tile)) {
      if (this.selectedTruck !== null && this.fleet) {
        const truck = this.fleet.trucks.find((t) => t.id === this.selectedTruck);
        if (truck) {
          if (truck.orders.length === 0) truck.orders = [tile];
          else if (truck.orders.length === 1 && truck.orders[0] !== tile) {
            const result = this.fleet.setOrders(truck, [truck.orders[0], tile]);
            this.setStatus(result.ok ? 'orders set: A→B' : `orders: ${result.reason}`);
          }
          this.truckPanel(truck);
          return;
        }
      }
      const stop = this.construction.stops.get(tile)!;
      this.selectedStop = tile;
      this.panel.dataset.mode = 'stop';
      this.panel.innerHTML = `<b>Truck stop</b>\norientation ${['NE', 'SE', 'SW', 'NW'][stop.orientation]} · catchment 4 tiles\nclick elsewhere to close`;
      const buy = document.createElement('button');
      buy.textContent = `Buy ${COAL_TRUCK.name} · £${COAL_TRUCK.purchaseCost}`;
      buy.addEventListener('click', () => {
        if (!this.fleet || this.selectedStop === null) return;
        const result = this.fleet.buyTruck(this.selectedStop);
        if (!result.ok || !result.truck) {
          this.setStatus(`buy: ${result.reason}`);
          return;
        }
        this.selectedTruck = result.truck.id;
        this.truckPanel(result.truck);
        this.updateFleetPanel();
        this.setStatus(`bought truck #${result.truck.id}: £${COAL_TRUCK.purchaseCost}`);
      }, { signal: this.signal });
      this.panel.append(buy);
      this.panel.style.display = 'block';
      return;
    }
    const selection = tile === null ? null : scenarioAt(this.scenario, this.world.world, tile);
    if (selection === null) {
      this.panel.style.display = 'none';
      return;
    }
    const title = selection.kind === 'town' ? selection.town.name : selection.industry.name;
    this.panel.dataset.mode = 'scenario';
    this.panel.innerHTML = `<b>${title}</b>\n${scenarioDescription(selection)}\nclick elsewhere to close`;
    this.panel.style.display = 'block';
  }

  private setStatus(text: string): void {
    const status = this.toolbar.querySelector('.status');
    if (status) status.textContent = text;
    const money = this.toolbar.querySelector('.money');
    if (money && this.construction) money.textContent = `£${this.construction.money.toLocaleString('en-GB')}`;
  }

  private buildToolbar(): void {
    if (!this.construction) return;
    this.toolbar.replaceChildren();
    const tools: [typeof this.tool, string][] = [['road', 'Road'], ['stop', 'Truck stop'], ['demolish', 'Demolish']];
    for (const [tool, label] of tools) {
      const button = document.createElement('button');
      button.textContent = label;
      if (this.tool === tool) button.className = 'active';
      button.addEventListener('click', () => {
        this.tool = this.tool === tool ? 'select' : tool;
        this.buildStart = null;
        this.buildToolbar();
        this.setStatus(this.tool === 'select' ? 'Select mode' : `${label} tool`);
      }, { signal: this.signal });
      this.toolbar.append(button);
    }
    for (const [label, action] of [['Save', () => { void this.saveGame(true); }], ['Load', () => { void this.loadGame(); }]] as const) {
      const button = document.createElement('button');
      button.textContent = label;
      button.addEventListener('click', action, { signal: this.signal });
      this.toolbar.append(button);
    }
    const money = document.createElement('span');
    money.className = 'money';
    money.textContent = `£${this.construction.money.toLocaleString('en-GB')}`;
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = 'Select mode';
    this.toolbar.append(money, status);
  }

  private refreshConstructionSprites(): void {
    this.constructionSprites.clear();
    if (!this.construction) return;
    for (const road of this.construction.roads.values()) {
      if (road.owner === 'town') continue; // the 5a scenario already draws town roads
      this.constructionSprites.set(road.tile, [{ sprite: 1333, dy: 0 }]);
    }
    for (const stop of this.construction.stops.values()) {
      this.constructionSprites.set(stop.tile, [
        { sprite: stop.sprite, dy: 0 },
        { sprite: 2712 + stop.orientation, dy: 0 },
      ]);
    }
  }

  private applyTool(clientX: number, clientY: number): void {
    if (!this.construction) return;
    const tile = this.pickTile(clientX, clientY);
    if (tile === null) {
      this.buildStart = null;
      this.setStatus('outside the map');
      return;
    }
    let result;
    if (this.tool === 'road') {
      const from = this.buildStart ?? tile;
      result = this.construction.buildRoadLine(from, tile);
      if (result.ok) this.setStatus(`road: £${result.cost}`);
      else this.setStatus(`road: ${result.reason}`);
      this.buildStart = null;
    } else if (this.tool === 'stop') {
      result = this.construction.placeTruckStop(tile);
      this.setStatus(result.ok ? `truck stop: £${result.cost}` : `truck stop: ${result.reason}`);
    } else {
      result = this.construction.demolish(tile);
      this.setStatus(result.ok ? `demolished: £${result.cost}` : `demolish: ${result.reason}`);
    }
    this.refreshConstructionSprites();
    this.setStatus(this.toolbar.querySelector('.status')?.textContent ?? '');
  }

  private async saveGame(report: boolean): Promise<void> {
    if (this.saveBusy || !this.construction || !this.fleet || !this.scenario || !this.world) return;
    this.saveBusy = true;
    try {
      const data = {
        version: 1,
        seed: this.seed,
        camera: { zoomIndex: this.zoomIndex, offsetX: this.offsetX, offsetY: this.offsetY },
        construction: this.construction.serialize(),
        fleet: this.fleet.serialize(),
      } satisfies SaveGame;
      await this.ctx.storage.put(SAVE_NAME, new TextEncoder().encode(JSON.stringify(data)));
      if (report) this.setStatus('saved');
    } catch {
      if (report) this.setStatus('save failed (no account or storage)');
    } finally {
      this.saveBusy = false;
    }
  }

  private async loadGame(): Promise<void> {
    if (this.saveBusy) return;
    this.saveBusy = true;
    try {
      const bytes = await this.ctx.storage.get(SAVE_NAME);
      if (bytes === null) {
        this.setStatus('no save found');
        return;
      }
      const data = JSON.parse(new TextDecoder().decode(bytes)) as SaveGame;
      if (data.version !== 1 || !Number.isInteger(data.seed) || !data.construction || !data.fleet) {
        throw new Error('bad save');
      }
      this.newWorld(data.seed);
      if (!this.construction || !this.fleet) throw new Error('bad save state');
      this.construction.restore(data.construction as ConstructionSave);
      this.fleet.restore(data.fleet as FleetSave);
      this.zoomIndex = Math.max(0, Math.min(ZOOMS.length - 1, data.camera?.zoomIndex ?? 3));
      this.offsetX = data.camera?.offsetX ?? 0;
      this.offsetY = data.camera?.offsetY ?? 0;
      this.selectedTruck = this.fleet.trucks.length > 0 ? this.fleet.trucks[0].id : null;
      this.selectedStop = null;
      this.buildToolbar();
      this.refreshConstructionSprites();
      this.panel.style.display = 'none';
      this.updateHud();
      this.updateFleetPanel();
      this.setStatus(`loaded day ${Math.floor(this.fleet.time) + 1}`);
    } catch {
      this.setStatus('save is corrupt; not loaded');
    } finally {
      this.saveBusy = false;
    }
  }

  private updateMoney(): void {
    const money = this.toolbar.querySelector('.money');
    if (money && this.construction) money.textContent = `£${Math.round(this.construction.money).toLocaleString('en-GB')}`;
  }

  private stopName(tile: number): string {
    if (!this.fleet) return 'stop';
    if (this.fleet.ratingFor(tile, 0) > 0) return 'Coal Mine';
    if (this.fleet.ratingFor(tile, 1) > 0) return 'Power Station';
    return 'Truck stop';
  }

  private truckInfoText(truck: Truck): string {
    if (!this.fleet) return '';
    const v = this.fleet.view(truck);
    const orders = v.orders.length === 0 ? 'none' : v.orders.map((t) => this.stopName(t)).join(' → ');
    const orderText = v.orders.length === 0
      ? 'No orders: click two truck stops.'
      : `${orders} (${v.orders.length < 2 ? 'click the second stop' : 'A→B and back'})`;
    return `cargo ${v.cargo.toFixed(0)}/${COAL_TRUCK.capacity} t · speed ${Math.round(v.speed * 48)} km/h\n` +
      `orders: ${orderText}\n` +
      `trips ${v.trips} · revenue £${Math.round(v.revenue)} · running £${Math.round(v.running)} · profit £${Math.round(v.profit)}`;
  }

  private truckPanel(truck: Truck): void {
    const v = this.fleet!.view(truck);
    this.panel.dataset.mode = 'truck';
    this.panel.innerHTML = `<b>Truck #${v.id} · ${COAL_TRUCK.name}</b>\n<span class="truckinfo"></span>`;
    const info = this.panel.querySelector('.truckinfo');
    if (info) info.textContent = this.truckInfoText(truck);
    const clear = document.createElement('button');
    clear.textContent = 'Clear orders';
    clear.addEventListener('click', () => {
      truck.orders = [];
      truck.path = [v.tile];
      truck.pos = 0;
      truck.cargo = 0;
      this.truckPanel(truck);
    }, { signal: this.signal });
    this.panel.append(clear);
    this.panel.style.display = 'block';
  }

  private updateFleetPanel(): void {
    if (!this.fleet || !this.construction) {
      this.fleetPanel.style.display = 'none';
      return;
    }
    const truck = this.selectedTruck === null ? null : this.fleet.trucks.find((t) => t.id === this.selectedTruck) ?? null;
    let text = `<b>Road fleet</b> · balance £${Math.round(this.construction.money).toLocaleString('en-GB')}\n`;
    if (truck) {
      const v = this.fleet.view(truck);
      text += `Truck #${v.id} · cargo ${v.cargo.toFixed(0)}/${COAL_TRUCK.capacity} t · ${Math.round(v.speed * 48)} km/h · profit £${Math.round(v.profit)}\n`;
      if (this.panel.dataset.mode === 'truck') {
        const info = this.panel.querySelector('.truckinfo');
        if (info) info.textContent = this.truckInfoText(truck);
      }
    }
    text += `revenue £${Math.round(this.fleet.revenue)} · running £${Math.round(this.fleet.runningCosts)} · net £${Math.round(this.fleet.revenue - this.fleet.runningCosts)}`;
    this.fleetPanel.textContent = '';
    this.fleetPanel.innerHTML = text;
    this.fleetPanel.style.display = 'block';
    this.updateMoney();
  }

  private updateHud(): void {
    const w = this.world?.world;
    if (!w) return;
    const date = convertDateToYMD(convertYMDToDate(1950, 0, 1));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.hud.innerHTML = `<b>OpenTTD 15.3</b> · seed ${this.seed} · ${w.sizeX}×${w.sizeY} · temperate\n${date.day} ${months[date.month]} ${date.year} · zoom ${this.zoom}×\nDrag to scroll · wheel / + − to zoom · N new landscape · click a town or industry`;
  }

  destroy(): void {
    if (this.disposed) return;
    void this.saveGame(false);
    this.disposed = true;
    this.ready = false;
    this.renderer?.dispose();
    this.renderer = null;
    this.world = null;
    this.root.remove();
    this.style.remove();
    this.host.replaceChildren();
  }
}

interface SaveGame {
  version: 1;
  seed: number;
  camera: { zoomIndex: number; offsetX: number; offsetY: number };
  construction: ConstructionSave;
  fleet: FleetSave;
}
