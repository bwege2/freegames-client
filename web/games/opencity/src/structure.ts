// src/structure/*.cpp and src/propertymanager.cpp: the structures on the building layer and their
// properties (costs, graphic codes, types, the width/length/height of every model's .conf).
import { Conf } from './conf.ts';
import { BIT, DIR, GC, LEVEL, PROP, SC, ST } from './codes.ts';
import type { GlibcRandom } from './rand.ts';

/** PropertyManager: graphism.conf names a model per graphic code; its .conf holds width, length, height */
export class PropertyManager {
  private readonly confs = new Map<number, Conf>();

  /** graphismConf: config/graphism.conf; readConf(path of a .conf) → its text or null */
  constructor(graphismConf: string, readConf: (path: string) => string | null) {
    const main = new Conf(graphismConf);
    for (let i = 0; i < GC.MAX; i++) {
      let v = main.getValue(String(i), '');
      if (v === '') continue;
      const pos = v.lastIndexOf('.ac');
      if (pos >= 0) v = v.slice(0, pos) + '.conf' + v.slice(pos + '.conf'.length);
      const text = readConf(v);
      if (text !== null) this.confs.set(i, new Conf(text));
    }
  }

  /** GetWLH: (uint)strtol of width/length/height ("2.35" → 2) */
  getWLH(gc: number, defw: number, defl: number, defh: number): [number, number, number] {
    const c = this.confs.get(gc);
    if (!c) throw new Error(`no properties for graphic code ${gc}`);
    return [c.getLint('width', defw) >>> 0, c.getLint('length', defl) >>> 0, c.getLint('height', defh) >>> 0];
  }

  get(prop: number, sc: number, s: Structure | null = null): number {
    switch (prop) {
      case PROP.TOOL_COST:
        switch (sc) {
          case SC.RES: case SC.COM: return 5;
          case SC.IND: return 8;
          case SC.PARK: return 100;
          case SC.ELINE: return 3;
          case SC.EPLANT_COAL: return 2000;
          case SC.EPLANT_NUCLEAR: return 5000;
          case SC.FIREDEPT: case SC.POLICEDEPT: case SC.HOSPITALDEPT: case SC.EDUCATIONDEPT: return 1500;
          case SC.ROAD: case SC.FLORA: return 5;
          default: return 0;
        }
      case PROP.DESTROY_COST:
        switch (sc) {
          case SC.RES: case SC.COM: return 2 * (s!.level + 1);
          case SC.IND: return 3 * (s!.level + 1);
          case SC.PARK: return 10;
          case SC.ELINE: return 1;
          case SC.ROAD: case SC.FLORA: return 4;
          case SC.PART: case SC.EPLANT_COAL: case SC.FIREDEPT: case SC.POLICEDEPT: case SC.HOSPITALDEPT:
          case SC.EDUCATIONDEPT: return 200;
          case SC.EPLANT_NUCLEAR: return 800;
          default: return 0;
        }
      case PROP.MAINTENANCE_COST:
        switch (sc) {
          case SC.PARK: case SC.ELINE: case SC.ROAD: case SC.FLORA: return 1;
          case SC.EPLANT_COAL: return 20;
          case SC.EPLANT_NUCLEAR: return 80;
          case SC.FIREDEPT: case SC.POLICEDEPT: case SC.HOSPITALDEPT: case SC.EDUCATIONDEPT: return 15;
          default: return 0;
        }
      default: return 0;
    }
  }

  getGC(sc: number): number {
    switch (sc) {
      case SC.RES: return GC.RES_ZONE0;
      case SC.COM: return GC.COM_ZONE0;
      case SC.IND: return GC.IND_ZONE0;
      case SC.PARK: return GC.PARK0;
      case SC.FLORA: return GC.TREE_BEGIN;
      case SC.ROAD: return GC.ROAD_O_N;
      case SC.ELINE: return GC.ELINE_O_N;
      case SC.TEST: return GC.TEST_BUILDING;
      case SC.EPLANT_COAL: return GC.EPLANT_COAL;
      case SC.EPLANT_NUCLEAR: return GC.EPLANT_NUCLEAR;
      case SC.FIREDEPT: return GC.FIRE_DEPT;
      case SC.POLICEDEPT: return GC.POLICE_DEPT;
      case SC.HOSPITALDEPT: return GC.HOSPITAL_DEPT;
      case SC.EDUCATIONDEPT: return GC.EDUCATION_DEPT;
      default: return GC.EMPTY;
    }
  }

  getST(sc: number): number {
    switch (sc) {
      case SC.RES: case SC.PARK: return ST.RESIDENCE;
      case SC.COM: return ST.COMMERCE;
      case SC.IND: return ST.INDUSTRY;
      case SC.EPLANT_COAL: case SC.EPLANT_NUCLEAR: return ST.ELECTRICITY;
      case SC.ROAD: case SC.ELINE: return ST.PATH;
      case SC.FIREDEPT: case SC.POLICEDEPT: case SC.HOSPITALDEPT: case SC.MILITARYDEPT: case SC.EDUCATIONDEPT:
        return ST.GOVERNMENT;
      case SC.FLORA: return ST.TREE;
      default: return ST.UNDEFINED;
    }
  }
}

/** The class of a structure object: the original's Structure subclasses */
export type Kind = 'base' | 'rci' | 'weg' | 'path' | 'tree';

export class Structure {
  kind: Kind = 'base';
  gc: number = GC.EMPTY;
  code: number = SC.UNDEFINED;
  type: number = ST.UNDEFINED;
  status = 0;
  level: number = LEVEL.START;
  main: Structure | null = null;
  // PathStructure
  neighbours = 0;
  traffic = 0;
  length = 0;

  set(bits: number): void { this.status = (this.status | bits) >>> 0; }
  unset(bits: number): void { this.status = (this.status & ~bits) >>> 0; }
  isSet(bits: number): boolean { return (this.status & bits) === bits; }

  baseGraphicCode(): number {
    switch (this.code) {
      case SC.RES: return GC.RES_ZONE0;
      case SC.COM: return GC.COM_ZONE0;
      case SC.IND: return GC.IND_ZONE0;
      default: return GC.EMPTY;
    }
  }

  nextLevelGraphicCode(): number {
    if (this.kind !== 'rci') return this.gc;
    return this.level < LEVEL.MAX ? this.baseGraphicCode() + Math.floor((this.level + 1) / LEVEL.RATIO) : this.gc;
  }

  previousLevelGraphicCode(): number {
    if (this.kind !== 'rci') return this.gc;
    return this.level > LEVEL.MIN ? this.baseGraphicCode() + Math.floor((this.level - 1) / LEVEL.RATIO) : this.gc;
  }

  levelUp(): boolean {
    const next = this.nextLevelGraphicCode();
    if (this.level < LEVEL.MAX) {
      this.level++;
      if (this.kind === 'rci') this.gc = next;
      return true;
    }
    return false;
  }

  levelDown(): boolean {
    const prev = this.previousLevelGraphicCode();
    if (this.level > LEVEL.MIN) {
      this.level--;
      if (this.kind === 'rci') this.gc = prev;
      return true;
    }
    return false;
  }

  /** PathStructure::AddNeighbour: the road/line model follows its neighbours */
  addNeighbour(dir: number): void {
    const base = this.code === SC.ROAD ? GC.ROAD_O_N : this.code === SC.ELINE ? GC.ELINE_O_N : GC.EMPTY;
    const g = this.gc;
    let n = g;
    const k = this.neighbours;
    if (k === 0) {
      if (dir === DIR.O_E) n = base + 1;
      else if (dir === DIR.O_S) n = base + 2;
      else if (dir === DIR.O_W) n = base + 3;
    } else if (k === 1) {
      if (dir === DIR.O_N) { if (g === base + 1) n = base + 6; else if (g === base + 2) n = base + 4; else if (g === base + 3) n = base + 7; else return; }
      else if (dir === DIR.O_E) { if (g === base) n = base + 6; else if (g === base + 2) n = base + 8; else if (g === base + 3) n = base + 5; else return; }
      else if (dir === DIR.O_S) { if (g === base) n = base + 4; else if (g === base + 1) n = base + 8; else if (g === base + 3) n = base + 9; else return; }
      else if (dir === DIR.O_W) { if (g === base) n = base + 7; else if (g === base + 1) n = base + 5; else if (g === base + 2) n = base + 9; else return; }
    } else if (k === 2) {
      if (dir === DIR.O_N) { if (g === base + 8) n = base + 10; else if (g === base + 9) n = base + 12; else if (g === base + 5) n = base + 13; else return; }
      else if (dir === DIR.O_E) { if (g === base + 9) n = base + 11; else if (g === base + 7) n = base + 13; else if (g === base + 4) n = base + 10; else return; }
      else if (dir === DIR.O_S) { if (g === base + 6) n = base + 10; else if (g === base + 7) n = base + 12; else if (g === base + 5) n = base + 11; else return; }
      else if (dir === DIR.O_W) { if (g === base + 8) n = base + 11; else if (g === base + 6) n = base + 13; else if (g === base + 4) n = base + 12; else return; }
    } else if (k === 3) {
      if (dir === DIR.O_N) { if (g === base + 11) n = base + 14; else return; }
      else if (dir === DIR.O_E) { if (g === base + 12) n = base + 14; else return; }
      else if (dir === DIR.O_S) { if (g === base + 13) n = base + 14; else return; }
      else if (dir === DIR.O_W) { if (g === base + 10) n = base + 14; else return; }
    } else {
      throw new Error('Internal game design error !');
    }
    this.gc = n;
    this.neighbours = (this.neighbours + 1) & 0xff;
  }

  /** PathStructure::RemoveNeighbour */
  removeNeighbour(dir: number): void {
    if (this.neighbours === 0) return;
    const base = this.code === SC.ROAD ? GC.ROAD_O_N : this.code === SC.ELINE ? GC.ELINE_O_N : GC.EMPTY;
    const g = this.gc;
    let n = g;
    const k = this.neighbours;
    if (k === 1) {
      n = base;
    } else if (k === 2) {
      if (dir === DIR.O_N) { if (g === base + 4) n = base + 2; else if (g === base + 6) n = base + 1; else if (g === base + 7) n = base + 3; else return; }
      else if (dir === DIR.O_E) { if (g === base + 6) n = base; else if (g === base + 8) n = base + 2; else if (g === base + 5) n = base + 3; else return; }
      else if (dir === DIR.O_S) { if (g === base + 4) n = base; else if (g === base + 8) n = base + 1; else if (g === base + 9) n = base + 3; else return; }
      else if (dir === DIR.O_W) { if (g === base + 7) n = base; else if (g === base + 5) n = base + 1; else if (g === base + 9) n = base + 2; else return; }
    } else if (k === 3) {
      if (dir === DIR.O_N) { if (g === base + 10) n = base + 8; else if (g === base + 12) n = base + 9; else if (g === base + 13) n = base + 5; else return; }
      else if (dir === DIR.O_E) { if (g === base + 11) n = base + 9; else if (g === base + 13) n = base + 7; else if (g === base + 10) n = base + 4; else return; }
      else if (dir === DIR.O_S) { if (g === base + 10) n = base + 6; else if (g === base + 12) n = base + 7; else if (g === base + 11) n = base + 5; else return; }
      else if (dir === DIR.O_W) { if (g === base + 11) n = base + 8; else if (g === base + 13) n = base + 6; else if (g === base + 12) n = base + 4; else return; }
    } else if (k === 4) {
      if (dir === DIR.O_N) n = base + 11;
      else if (dir === DIR.O_E) n = base + 12;
      else if (dir === DIR.O_S) n = base + 13;
      else if (dir === DIR.O_W) n = base + 10;
    }
    this.gc = n;
    this.neighbours = (this.neighbours - 1) & 0xff;
  }
}

/** The constructors of the original's classes */
export const make = {
  /** Structure(code, main): a part of a bigger structure (WEG parts, loaded parts) */
  part(pm: PropertyManager, main: Structure): Structure {
    const s = new Structure();
    s.code = SC.PART; s.type = pm.getST(SC.PART); s.main = main;
    return s;
  },
  /** RCIStructure(code) and RCIStructure(code, main) */
  rci(pm: PropertyManager, code: number, main: Structure | null = null): Structure {
    const s = new Structure();
    s.kind = 'rci'; s.code = code; s.main = main;
    s.gc = pm.getGC(code); s.type = pm.getST(code);
    return s;
  },
  /** WEGStructure(code): an electric plant starts with its E bit */
  weg(pm: PropertyManager, code: number): Structure {
    const s = new Structure();
    s.kind = 'weg'; s.code = code;
    s.gc = pm.getGC(code); s.type = pm.getST(code);
    if (code === SC.EPLANT_COAL || code === SC.EPLANT_NUCLEAR) s.set(BIT.E);
    return s;
  },
  path(pm: PropertyManager, code: number): Structure {
    const s = new Structure();
    s.kind = 'path'; s.code = code;
    s.gc = pm.getGC(code); s.type = pm.getST(code);
    return s;
  },
  /** TreeStructure(code): one of the five tree models at random */
  tree(pm: PropertyManager, code: number, rng: GlibcRandom): Structure {
    const s = new Structure();
    s.kind = 'tree'; s.code = code;
    s.gc = GC.TREE_BEGIN + rng.rand() % (GC.TREE_END - GC.TREE_BEGIN + 1);
    s.type = pm.getST(code);
    return s;
  },
};
