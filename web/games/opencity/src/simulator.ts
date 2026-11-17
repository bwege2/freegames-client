// src/simulator/*.cpp: the five micro simulators (residential, commercial, industrial, electricity,
// traffic) and MainSim, which runs them one after the other in its own thread and recomputes their
// values from the structures' levels every five rounds.
import { BIT, RANGE, SC, SIM } from './codes.ts';
import type { HeightMap } from './heightmap.ts';
import type { BuildingLayer } from './layer.ts';
import type { Structure } from './structure.ts';
import { findShortestPath, type MovementManager, PATH_TYPE, Vehicle, VEHICLE } from './vehicle.ts';

const RUNNING = 0, STOPPED = 1;

export class Simulator {
  variation = 0;
  value = 0;
  state = STOPPED;
  protected readonly layer: BuildingLayer;
  protected readonly map: HeightMap;

  constructor(layer: BuildingLayer, map: HeightMap) {
    this.layer = layer;
    this.map = map;
  }

  main(): void {}
  addStructure(_w: number, _l: number): void {}
  removeStructure(_w: number, _l: number): void {}
  maxValue(): number { return 0; }

  checkRange(w: number, l: number, range: number, code: number): boolean {
    const [W1, L1] = this.map.possible(w, l, -range, -range);
    const [W2, L2] = this.map.possible(w, l, range, range);
    return this.layer.containStructure(W1, L1, W2, L2, code);
  }

  /** CheckLevelUp / CheckLevelDown: the model of the new level must fit on plane squares of the same zone */
  checkLevel(w: number, l: number, s: Structure, up: boolean): boolean {
    const nextGC = up ? s.nextLevelGraphicCode() : s.previousLevelGraphicCode();
    const curGC = s.gc;
    if (nextGC === curGC) return true;
    const [ow, ol, oh] = this.layer.pm.getWLH(curGC, 0, 0, 0);
    const [nw, nl, nh] = this.layer.pm.getWLH(nextGC, 0, 0, 0);
    if (ow === nw && ol === nl && oh === nh) return true;
    const w2 = w + nw - 1, l2 = l + nl - 1;
    if (w2 >= this.layer.width || l2 >= this.layer.length) return false;
    if (!this.map.isSurfacePlane(w, l, w2, l2)) return false;
    return this.layer.containStructureOnly(w, l, w2, l2, s.code);
  }
}

/** ResidentialSim, CommercialSim, IndustrialSim: the same algorithm with other neighbours */
class RCISim extends Simulator {
  private readonly code: number;
  private readonly own: number;
  private readonly needs: [number, number, number, number][];   // [range, structure, bit, variation index]
  private readonly variations: Int32Array;
  private readonly rand: () => number;

  constructor(layer: BuildingLayer, map: HeightMap, variations: Int32Array, code: number, own: number,
    needs: [number, number, number, number][]) {
    super(layer, map);
    this.code = code;
    this.own = own;
    this.needs = needs;
    this.variations = variations;
    this.rand = () => layer.rng.rand();
  }

  override main(): void {
    if (this.state !== RUNNING) return;
    const r = this.layer.randomStructure(this.code);
    if (r === null) return;
    const { s, w, l } = r;
    s.unset(BIT.W | BIT.G | BIT.R | BIT.C | BIT.I | BIT.P);
    s.set(this.own);
    for (const [range, code, bit, vi] of this.needs) {
      if (this.checkRange(w, l, range, code)) s.set(bit);
      else this.variations[vi]++;
    }
    const levelUp = s.isSet(BIT.E | BIT.R | BIT.C | BIT.I | BIT.P);
    const iRandom = this.rand() % 100;
    const oldGC = s.gc;
    const simIndex = this.code === SC.RES ? SIM.RESIDENTIAL : this.code === SC.COM ? SIM.COMMERCIAL : SIM.INDUSTRIAL;
    if (levelUp) {
      if (iRandom < SIM.UP && this.checkLevel(w, l, s, true) && s.levelUp()) {
        this.layer.resize(w, l, oldGC);
        this.value++;
        this.variations[simIndex]--;
      }
    } else if (iRandom < SIM.DOWN && this.checkLevel(w, l, s, false) && s.levelDown()) {
      this.layer.resize(w, l, oldGC);
      this.value--;
      this.variations[simIndex]++;
    }
  }

  override removeStructure(w: number, l: number): void {
    const s = this.layer.get(w, l);
    // GetLevel() is unsigned: for a level 0 zone, level - 1 wraps to 2^32 - 1 (> 0), and subtracting it
    // from the int value adds 1
    const d = (s === null ? 0 : s.level - 1) >>> 0;
    if (s !== null && s.code === this.code && d > 0) this.value = (this.value - d) | 0;
  }
}

class ElectricitySim extends Simulator {
  plants: [number, number][] = [];
  valueMax = 0;
  numberPlants = 0;

  override maxValue(): number { return this.valueMax; }

  /** a breadth-first walk from every power plant over the structures that touch each other */
  override main(): void {
    if (this.state !== RUNNING) return;
    const layer = this.layer;
    layer.unsetAll(BIT.MARK | BIT.E);
    const deque: [number, number][] = [];
    const contains = (w: number, l: number) => deque.some(([a, b]) => a === w && b === l);
    for (const [pw, pl] of this.plants) {
      const ps = layer.get(pw, pl);
      if (ps !== null && !ps.isSet(BIT.MARK)) deque.push([pw, pl]);
      while (deque.length > 0) {
        const [w, l] = deque.shift()!;
        const s = layer.get(w, l)!;
        switch (s.code) {
          case SC.EPLANT_COAL: case SC.EPLANT_NUCLEAR:
            s.set(BIT.E);
            break;
          case SC.RES: case SC.COM: case SC.IND: case SC.PART:
          case SC.FIREDEPT: case SC.POLICEDEPT: case SC.EDUCATIONDEPT: case SC.HOSPITALDEPT:
            if (this.checkRange(w, l, RANGE.E_RCI, SC.ELECTRIC)) s.set(BIT.E);
            break;
          case SC.ELINE:
            if (this.checkRange(w, l, RANGE.E_E, SC.ELECTRIC)) s.set(BIT.E);
            break;
          default:
            break;
        }
        s.set(BIT.MARK);
        for (const dir of [0, 1, 2, 3]) {   // N, E, S, W
          const n = this.map.neighbour(w, l, dir);
          if (!n) continue;
          const ns = layer.get(n[0], n[1]);
          if (ns !== null && !ns.isSet(BIT.MARK) && !contains(n[0], n[1])) deque.push([n[0], n[1]]);
        }
      }
    }
  }

  override addStructure(w: number, l: number): void {
    const s = this.layer.get(w, l);
    if (s === null) return;
    if (s.code === SC.EPLANT_COAL) {
      this.valueMax += SIM.EPLANT_COAL_POWER; this.numberPlants++; this.plants.push([w, l]);
    } else if (s.code === SC.EPLANT_NUCLEAR) {
      this.valueMax += SIM.EPLANT_NUCLEAR_POWER; this.numberPlants++; this.plants.push([w, l]);
    }
  }

  override removeStructure(w1: number, h1: number): void {
    let s = this.layer.get(w1, h1);
    if (s === null) return;
    let code = s.code;
    let mainW = w1, mainH = h1;
    if (code === SC.PART) {
      s = s.main!;
      code = s.code;
      let [sw, sl] = this.layer.pm.getWLH(s.gc, 4, 4, 1);
      sw--; sl--;
      const [mw1, mh1] = this.map.possible(w1, h1, -sw, -sl);
      const [mw2, mh2] = this.map.possible(w1, h1, sw, sl);
      let found = false;
      mainH = mh1;
      while (!found && mainH <= mh2) {
        mainW = mw1;
        while (!found && mainW <= mw2) {
          if (this.layer.get(mainW, mainH) === s) found = true;
          else mainW++;
        }
        mainH++;
      }
    }
    if (code === SC.EPLANT_COAL || code === SC.EPLANT_NUCLEAR) {
      this.valueMax -= code === SC.EPLANT_COAL ? SIM.EPLANT_COAL_POWER : SIM.EPLANT_NUCLEAR_POWER;
      this.numberPlants--;
      const i = this.plants.findIndex(([a, b]) => a === mainW && b === mainH);
      if (i >= 0) this.plants.splice(i, 1);
    }
  }

  resetPlants(): void { this.numberPlants = 0; this.valueMax = 0; this.plants = []; }
}

const TSIM_VEHICLE_CHANCE = 10;
const TSIM_TRAFFIC_MIN = 50;

class TrafficSim extends Simulator {
  private readonly moves: MovementManager;
  private readonly variations: Int32Array;

  constructor(layer: BuildingLayer, map: HeightMap, moves: MovementManager, variations: Int32Array) {
    super(layer, map);
    this.moves = moves;
    this.variations = variations;
  }

  override main(): void {
    if (this.state !== RUNNING) return;
    const r = this.layer.randomStructure(SC.ROAD);
    if (r === null) return;
    const { s: road, w: startW, l: startH } = r;
    const [w1, h1] = this.map.possible(startW, startH, -RANGE.P_RCIP, -RANGE.P_RCIP);
    const [w2, h2] = this.map.possible(startW, startH, RANGE.P_RCIP, RANGE.P_RCIP);
    let traffic = 0, paths = 0;
    for (let w = w1; w <= w2; w++)
      for (let h = h1; h <= h2; h++) {
        const s = this.layer.get(w, h);
        if (s === null) continue;
        if (s.code === SC.ROAD) paths++;
        else if (s.code === SC.RES || s.code === SC.COM || s.code === SC.IND) traffic += s.level;
      }
    traffic = Math.trunc(traffic / paths);
    road.traffic = traffic & 0xff;
    if (traffic > TSIM_TRAFFIC_MIN && this.layer.rng.rand() % 100 < TSIM_VEHICLE_CHANCE) {
      this.createVehicle(startW, startH);
      this.variations[SIM.TRAFFIC]--;
    }
  }

  private createVehicle(w: number, h: number): void {
    if (this.moves.isFull()) return;
    const r = this.layer.randomStructure(SC.ROAD);
    if (r === null) return;
    const type = this.layer.rng.rand() % VEHICLE.NUMBER;
    const path = findShortestPath(this.layer, this.map, w, h, r.w, r.l,
      type === VEHICLE.BUS ? PATH_TYPE.DISTANCE : PATH_TYPE.TRAFFIC);
    if (path.length > 0) {
      const v = new Vehicle(type);
      v.start(path);
      this.moves.add(v);
    }
  }
}

export class MainSim {
  readonly sims: Simulator[];
  readonly variations = new Int32Array(SIM.NUMBER);
  state = STOPPED;
  private readonly layer: BuildingLayer;

  constructor(layer: BuildingLayer, map: HeightMap, moves: MovementManager) {
    this.layer = layer;
    const v = this.variations;
    this.sims = [
      new RCISim(layer, map, v, SC.RES, BIT.R,
        [[RANGE.R_P, SC.ROAD, BIT.P, SIM.TRAFFIC], [RANGE.R_C, SC.COM, BIT.C, SIM.COMMERCIAL], [RANGE.R_I, SC.IND, BIT.I, SIM.INDUSTRIAL]]),
      new RCISim(layer, map, v, SC.COM, BIT.C,
        [[RANGE.C_P, SC.ROAD, BIT.P, SIM.TRAFFIC], [RANGE.C_R, SC.RES, BIT.R, SIM.RESIDENTIAL], [RANGE.C_I, SC.IND, BIT.I, SIM.INDUSTRIAL]]),
      new RCISim(layer, map, v, SC.IND, BIT.I,
        [[RANGE.I_P, SC.ROAD, BIT.P, SIM.TRAFFIC], [RANGE.I_R, SC.RES, BIT.R, SIM.RESIDENTIAL], [RANGE.I_C, SC.COM, BIT.C, SIM.COMMERCIAL]]),
      new ElectricitySim(layer, map),
      new TrafficSim(layer, map, moves, v),
    ];
  }

  get electricity(): ElectricitySim { return this.sims[SIM.ELECTRIC] as ElectricitySim; }

  /** one round of MainSim::Main's loop (without the delay, which the caller asks for with rciDelay);
   * times is the loop's static counter: the values are recomputed when it is 0 */
  step(times: number): void {
    if (this.state === RUNNING) for (const s of this.sims) s.main();
    if (times === 0) this.refreshSimValue();
  }

  run(): void { for (const s of this.sims) s.state = RUNNING; this.state = RUNNING; }
  stop(): void { for (const s of this.sims) s.state = STOPPED; this.state = STOPPED; }

  addStructure(w1: number, l1: number, sim = -1): void {
    if (sim < 0) for (const s of this.sims) s.addStructure(w1, l1);
    else this.sims[sim].addStructure(w1, l1);
  }

  removeStructure(w1: number, l1: number): void { for (const s of this.sims) s.removeStructure(w1, l1); }

  value(sim: number): number { return this.sims[sim].value; }
  maxValue(sim: number): number { return this.sims[sim].maxValue(); }

  /** recompute the values from the levels of all structures */
  refreshSimValue(): void {
    let res = 0, com = 0, ind = 0, ele = 0;
    for (const s of this.layer.cells) {
      if (s === null) continue;
      const level = s.level;
      const e = s.isSet(BIT.E) ? 1 : 0;
      switch (s.code) {
        case SC.RES: res += level; ele -= level * e; break;
        case SC.COM: com += level; ele -= level * e; break;
        case SC.IND: ind += level; ele -= level * e; break;
        case SC.FIREDEPT: case SC.POLICEDEPT: case SC.EDUCATIONDEPT: case SC.HOSPITALDEPT:
          ele -= SIM.DEPT_POWER_CONSUMPTION * e; break;
        case SC.PART: case SC.ELINE: ele -= 1 * e; break;
        case SC.EPLANT_COAL: ele += SIM.EPLANT_COAL_POWER; break;
        case SC.EPLANT_NUCLEAR: ele += SIM.EPLANT_NUCLEAR_POWER; break;
        default: break;
      }
    }
    this.sims[SIM.RESIDENTIAL].value = res;
    this.sims[SIM.COMMERCIAL].value = com;
    this.sims[SIM.INDUSTRIAL].value = ind;
    this.sims[SIM.ELECTRIC].value = ele;
  }
}
