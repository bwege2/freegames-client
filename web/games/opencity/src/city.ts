// src/city.cpp and the parts of src/main.cpp that run the game: a city of 50x50 squares (the size in
// config/opencity.xml), its money, population and calendar, the tools, the yearly income and monthly bills,
// the simulator thread and the save file. No drawing here: the port's renderer and GUI read this state.
//
// The original runs the simulators in a second thread that sleeps Simulator::RCIDelay() milliseconds
// between rounds, and the main loop draws a frame and sleeps msPerFrame (20 ms). Here both run on one
// virtual clock: a frame every 20 ms, and before each frame every simulator round that is due.
import { GC, OC, PROP, SC, SIM, SOUND, TOOL, VERSION } from './codes.ts';
import { HeightMap } from './heightmap.ts';
import { BuildingLayer } from './layer.ts';
import { MapMaker } from './mapgen.ts';
import { Reader, Writer } from './persist.ts';
import { GlibcRandom } from './rand.ts';
import { MainSim } from './simulator.ts';
import { make, type PropertyManager, Structure } from './structure.ts';
import { MovementManager } from './vehicle.ts';

export const CITY_W = 50;
export const CITY_L = 50;
export const MS_PER_FRAME = 20;
const f = Math.fround;
const u32 = (v: number): number => v >>> 0;

export interface Ressource { fund: number; population: number; r: number; c: number; i: number; w: number; e: number; g: number }

/** main.cpp: gfMsSimDelayMax = log10((float)w*l + 1) * OC_MS_GLOBAL_LOG_FACTOR, in float */
export function simDelayMax(w: number, l: number): number {
  return f(f(Math.log10(f(f(w * l) + 1))) * OC.MS_GLOBAL_LOG_FACTOR);
}

/** Simulator::RCIDelay(): (uint)(gfMsSimDelayMax - log10((float)structures + 1) * OC_MS_STRUCTURE_LOG_FACTOR) */
export function rciDelay(delayMax: number, structures: number): number {
  return Math.trunc(f(delayMax - f(f(Math.log10(f(f(structures) + 1))) * OC.MS_STRUCTURE_LOG_FACTOR)));
}

export class City {
  readonly width: number;
  readonly length: number;
  income = 0;
  fund: number = OC.FUND_START;
  population = 0;
  day = 1;
  month = 1;
  year = 0;
  records: Ressource[] = [];
  paused = false;
  readonly map: HeightMap;
  readonly layer: BuildingLayer;
  readonly sim: MainSim;
  /** set when a day passed (the GUI refreshes its bars every 3 days) */
  onDay: ((city: City) => void) | null = null;

  readonly game: OpenCity;

  constructor(game: OpenCity, maker: MapMaker) {
    this.game = game;
    this.width = CITY_W;
    this.length = CITY_L;
    for (let i = 0; i < OC.MAX_RESSOURCE_RECORD; i++) this.records.push({ fund: 0, population: 0, r: 0, c: 0, i: 0, w: 0, e: 0, g: 0 });
    this.map = new HeightMap(this.width, this.length, maker.getMap());
    this.layer = new BuildingLayer(this.width, this.length, game.pm, this.map, game.rng);
    this.map.layer = this.layer;
    // _CreateTree
    const trees = maker.getTreeDensity();
    for (let l = 0, li = 0; l < this.length; l++)
      for (let w = 0; w < this.width; w++, li++)
        if (trees[li] > 0) this.layer.build(w, l, w, l, SC.FLORA);
    this.sim = new MainSim(this.layer, this.map, game.moves);
    this.sim.run();
  }

  /** City::Run, once a frame */
  run(): void {
    this.game.moves.move();
    if (this.paused) return;
    if (++this.game.frameCounter * MS_PER_FRAME <= OC.MS_PER_DAY) return;
    const r = u32(this.sim.value(SIM.RESIDENTIAL));
    const c = u32(this.sim.value(SIM.COMMERCIAL));
    const i = u32(this.sim.value(SIM.INDUSTRIAL));
    if (++this.day > 30) {
      this.day = 1;
      this.population = u32(r + Math.floor(c / 2) + Math.floor(i / 3));
      if (++this.month > 12) {
        this.month = 1;
        this.year++;
        this.doBill(true);
        this.recordRessource();
      } else {
        this.doBill(false);
      }
    }
    this.game.frameCounter = 0;
    this.onDay?.(this);
  }

  private recordRessource(): void {
    this.records.shift();
    this.records.push({ fund: this.fund, population: this.population,
      r: u32(this.sim.value(SIM.RESIDENTIAL)), c: u32(this.sim.value(SIM.COMMERCIAL)), i: u32(this.sim.value(SIM.INDUSTRIAL)),
      w: 0, e: 0, g: 0 });
  }

  /** _DoBill: the maintenance of every square each month; the income at the end of the year */
  private doBill(income: boolean): void {
    let maintenance = 0;
    for (const s of this.layer.cells) if (s !== null) maintenance += this.game.pm.get(PROP.MAINTENANCE_COST, s.code);
    maintenance = u32(maintenance);
    this.fund -= maintenance;
    const r = u32(this.sim.value(SIM.RESIDENTIAL));
    const c = u32(this.sim.value(SIM.COMMERCIAL));
    const i = u32(this.sim.value(SIM.INDUSTRIAL));
    const tax = u32(u32(u32(Math.imul(r, OC.R_INCOME_TAX)) + u32(Math.imul(c, OC.C_INCOME_TAX))) + u32(Math.imul(i, OC.I_INCOME_TAX)));
    this.income = u32(this.income + Math.floor(tax / 100));
    if (income) {
      this.income = u32(this.income + Math.floor(u32(Math.imul(this.income, OC.INCOME_HELP)) / 100));
      this.fund += this.income;
      this.income = 0;
    }
  }

  /** _DoTool: the tool on the selected rectangle; returns the sound to play (or -1), and the fund pays */
  doTool(tool: number, w1: number, l1: number, w2: number, l2: number): number {
    if (tool === TOOL.NONE) return -1;
    if (this.fund < 0) return -1;
    let ok = false, cost = 0, sound = -1;
    const build = (code: number, snd: number): void => {
      const r = this.layer.build(w1, l1, w2, l2, code);
      ok = r.ok; cost = r.cost;
      if (ok) sound = snd;
    };
    switch (tool) {
      case TOOL.ZONE_RES: build(SC.RES, SOUND.RCI); break;
      case TOOL.ZONE_COM: build(SC.COM, SOUND.RCI); break;
      case TOOL.ZONE_IND: build(SC.IND, SOUND.RCI); break;
      case TOOL.ROAD: build(SC.ROAD, SOUND.ROAD); break;
      case TOOL.ELINE: build(SC.ELINE, SOUND.ELINE); break;
      case TOOL.EPLANT_COAL:
        build(SC.EPLANT_COAL, SOUND.EPLANT);
        if (ok) this.sim.addStructure(w1, l1, SIM.ELECTRIC);
        break;
      case TOOL.EPLANT_NUCLEAR:
        build(SC.EPLANT_NUCLEAR, SOUND.EPLANT);
        if (ok) this.sim.addStructure(w1, l1, SIM.ELECTRIC);
        break;
      case TOOL.PARK: build(SC.PARK, SOUND.PARK); break;
      case TOOL.FLORA: build(SC.FLORA, SOUND.PARK); break;
      case TOOL.FIRE: build(SC.FIREDEPT, SOUND.EPLANT); break;
      case TOOL.POLICE: build(SC.POLICEDEPT, SOUND.EPLANT); break;
      case TOOL.HOSPITAL: build(SC.HOSPITALDEPT, SOUND.EPLANT); break;
      case TOOL.EDUCATION: build(SC.EDUCATIONDEPT, SOUND.EPLANT); break;
      case TOOL.HEIGHT_UP:
      case TOOL.HEIGHT_DOWN:
        ok = this.map.changeHeight(w1, l1, tool === TOOL.HEIGHT_UP ? 1 : -1);
        if (ok) { sound = SOUND.TERRAIN; cost = 5; this.game.heightChanged = true; }
        break;
      case TOOL.DESTROY: {
        this.sim.removeStructure(w1, l1);
        const r = this.layer.destroy(w1, l1, w2, l2);
        ok = r.ok; cost = r.cost;
        if (ok) sound = SOUND.DESTROY;
        break;
      }
      default:
        ok = false;
    }
    if (ok) this.fund -= cost;
    return sound;
  }

  /** BuildingLayer::QueryStructure: which of R, C, I, E the square's structure has */
  query(w: number, l: number): { r: boolean; c: boolean; i: boolean; e: boolean } | null {
    const s = this.layer.get(w, l);
    if (s === null) return null;
    return { r: s.isSet(0x01), c: s.isSet(0x02), i: s.isSet(0x04), e: s.isSet(0x10) };
  }

  // ------------------------------------------------------------------ save file

  save(): Uint8Array {
    const o = new Writer();
    o.line(`OpenCity_${VERSION.str}`);
    o.num(VERSION.long);
    for (const v of [this.income, this.fund, this.population, this.day, this.month, this.year, this.width, this.length]) o.num(v);
    for (const r of this.records) for (const v of [r.fund, r.population, r.r, r.c, r.i, r.w, r.e, r.g]) o.num(v);
    o.num(this.map.width); o.num(this.map.length);
    for (const h of this.map.heights) o.num(h);
    o.num(this.layer.width); o.num(this.layer.length);
    for (const s of this.layer.cells) {
      if (s === null || s.main !== null) { o.num(0); continue; }
      o.num(1);
      o.num(s.type);
      for (const v of [s.gc, s.code, s.type, s.status, s.level]) o.num(v);
      if (s.kind === 'path') { o.num(s.neighbours); o.num(s.traffic); }
    }
    for (const sim of this.sim.sims) { o.num(sim.variation); o.num(sim.value); }
    return o.bytes();
  }

  /** _Load; false (and nothing changed) for a file of a newer version */
  load(bytes: Uint8Array): boolean {
    const r = new Reader(bytes);
    r.line();
    if (r.num() > VERSION.long) return false;
    this.game.moves.removeAll();
    this.income = r.num(); this.fund = r.num(); this.population = r.num();
    this.day = r.num(); this.month = r.num(); this.year = r.num();
    r.num(); r.num();   // the city's width and length: 50x50
    for (let i = 0; i < OC.MAX_RESSOURCE_RECORD; i++)
      this.records[i] = { fund: r.num(), population: r.num(), r: r.num(), c: r.num(), i: r.num(), w: r.num(), e: r.num(), g: r.num() };
    const mw = r.num(), ml = r.num();
    const heights = new Int8Array((mw + 1) * (ml + 1));
    for (let i = 0; i < heights.length; i++) heights[i] = r.num();
    this.map.heights = heights;
    this.game.heightChanged = true;
    const lw = r.num(), ll = r.num();
    this.layer.cells = new Array(lw * ll).fill(null);
    for (let l = 0; l < ll; l++)
      for (let w = 0; w < lw; w++) {
        if (r.num() === 0) continue;
        const kind = BuildingLayer.kindOfType(r.num());
        const s = new Structure();
        if (kind === null) throw new Error('bad structure type in save file');
        s.kind = kind;
        s.gc = r.num(); s.code = r.num(); s.type = r.num(); s.status = r.num() >>> 0; s.level = r.num();
        if (kind === 'path') { s.neighbours = r.num() & 0xff; s.traffic = r.num() & 0xff; }
        this.layer.placeLoaded(w, l, s);
      }
    for (const sim of this.sim.sims) { sim.variation = r.num(); sim.value = r.num(); }
    this.sim.electricity.resetPlants();
    for (let w = 0; w < this.width; w++) for (let l = 0; l < this.length; l++) this.sim.addStructure(w, l);
    this.sim.refreshSimValue();
    return true;
  }
}

/** The program: the data that outlives a city (main.cpp's managers and the functions' static counters) */
export class OpenCity {
  readonly rng = new GlibcRandom();
  readonly pm: PropertyManager;
  readonly moves = new MovementManager();
  readonly delayMax = simDelayMax(CITY_W, CITY_L);
  city!: City;
  /** the map maker of the last new city (its height map and tree density) */
  lastMaker: MapMaker | null = null;
  /** City::Run's static frame counter */
  frameCounter = 0;
  /** MainSim::Main's static round counter */
  simTimes = 0;
  clock = 0;
  nextSim = 0;
  heightChanged = true;

  constructor(pm: PropertyManager) { this.pm = pm; }

  /** a new city: MapMaker(mapSeed) (which ends with srand(time(NULL)): gameSeed), then the City */
  newCity(mapSeed: number, gameSeed: number): City {
    this.moves.removeAll();
    const maker = new MapMaker(CITY_W, CITY_L, mapSeed, this.rng);
    this.lastMaker = maker;
    this.rng.srand(gameSeed);
    this.city = new City(this, maker);
    this.nextSim = this.clock;
    this.heightChanged = true;
    return this.city;
  }

  /** one frame of the virtual clock: the simulator rounds that are due, then City::Run */
  frame(): void {
    while (this.nextSim <= this.clock) {
      this.city.sim.step(this.simTimes);
      this.simTimes = (this.simTimes + 1) % 5;
      this.nextSim += rciDelay(this.delayMax, this.city.layer.structureCount());
    }
    this.city.run();
    this.clock += MS_PER_FRAME;
  }

  runMs(ms: number): void {
    const end = this.clock + ms;
    while (this.clock < end) this.frame();
  }

  setPaused(paused: boolean): void {
    this.city.paused = paused;
    if (paused) this.city.sim.stop(); else this.city.sim.run();
  }
}

export { GC, make };
