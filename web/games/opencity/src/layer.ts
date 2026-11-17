// src/buildinglayer.cpp: the city's squares and the structures built on them. A structure larger than
// one square fills the others with "part" structures that point to it (its main structure).
import { BIT, DIR, OC, PROP, SC, ST } from './codes.ts';
import type { HeightMap } from './heightmap.ts';
import type { GlibcRandom } from './rand.ts';
import { make, type PropertyManager, Structure } from './structure.ts';

export type Built = { ok: boolean; cost: number };

export class BuildingLayer {
  width: number;
  length: number;
  cells: (Structure | null)[];
  readonly pm: PropertyManager;
  map: HeightMap;
  readonly rng: GlibcRandom;

  constructor(width: number, length: number, pm: PropertyManager, map: HeightMap, rng: GlibcRandom) {
    this.width = width;
    this.length = length;
    this.cells = new Array(width * length).fill(null);
    this.pm = pm;
    this.map = map;
    this.rng = rng;
  }

  /** Structure::GetNumber(): every structure object alive is on one square */
  structureCount(): number {
    let n = 0;
    for (const s of this.cells) if (s !== null) n++;
    return n;
  }

  getLinear(i: number): Structure | null { return this.cells[i]; }
  get(w: number, l: number): Structure | null { return this.cells[l * this.width + w]; }
  maxLinear(): number { return this.width * this.length - 1; }

  isConstructive(W1: number, L1: number, W2: number, L2: number, code: number): boolean {
    if (L2 >= this.length || W2 >= this.width) return false;
    for (let l = L1; l <= L2; l++) {
      let li = l * this.width + W1;
      for (let w = W1; w <= W2; w++, li++) {
        switch (code) {
          case SC.ROAD: case SC.ELINE:
            if (!this.isPathConstructive(w, l, code)) return false;
            break;
          default:
            if (this.cells[li] !== null || !this.map.isSquarePlane(w, l)) return false;
        }
      }
    }
    return true;
  }

  /** BuildPreview: the graphic code to show and whether it can be built at (W, L) */
  buildPreview(W: number, L: number, code: number): { ok: boolean; gc: number } {
    const gc = this.pm.getGC(code);
    const [sw, sl] = this.pm.getWLH(gc, 4, 4, 1);
    return { ok: this.isConstructive(W, L, W + sw - 1, L + sl - 1, code), gc };
  }

  build(W1: number, L1: number, W2: number, L2: number, code: number): Built {
    switch (code) {
      case SC.RES: case SC.COM: case SC.IND: case SC.PARK: case SC.TEST:
        return this.buildRCI(W1, L1, W2, L2, code);
      case SC.EDUCATIONDEPT: case SC.FIREDEPT: case SC.POLICEDEPT: case SC.HOSPITALDEPT:
      case SC.EPLANT_COAL: case SC.EPLANT_NUCLEAR:
        return this.buildWEG(W1, L1, code);
      case SC.ROAD: case SC.ELINE:
        return this.buildPath(W1, L1, W2, L2, code);
      case SC.FLORA:
        return this.buildFlora(W1, L1, W2, L2, code);
      default:
        return { ok: false, cost: 0 };
    }
  }

  /** GetMainWL: the coordinates of a structure's main structure, searched around (w, l). Like the
   * original's reference parameters, a failed search leaves the loop's end values. */
  mainWL(s: Structure, w: number, l: number): [number, number] {
    const main = s.main ?? s;
    let [sw, sl] = this.pm.getWLH(main.gc, 0, 0, 0);
    sw--; sl--;
    const [w1, l1] = this.map.possible(w, l, -sw, -sl);
    const [w2, l2] = this.map.possible(w, l, sw, sl);
    let x = w1, y: number;
    for (y = l1; y <= l2; y++) for (x = w1; x <= w2; x++) if (this.cells[y * this.width + x] === main) return [x, y];
    return [x, y];
  }

  /** ResizeStructure: a zone's model changed its size with its level */
  resize(w: number, l: number, oldGC: number): void {
    const s = this.cells[l * this.width + w]!;
    if (oldGC === s.gc) return;
    const code = s.code;
    const [ow, ol] = this.pm.getWLH(oldGC, 0, 0, 0);
    const [nw, nl] = this.pm.getWLH(s.gc, 0, 0, 0);
    for (let dl = l; dl < l + ol; dl++) {
      let li = dl * this.width + w;
      for (let dw = w; dw < w + ow; dw++) this.cells[li++]!.unset(BIT.MARK);
    }
    for (let dl = l; dl < l + nl; dl++) {
      let li = dl * this.width + w;
      for (let dw = w; dw < w + nw; dw++) {
        let t = this.cells[li];
        if (t === null) {
          t = make.rci(this.pm, SC.PART, s);
          this.cells[li] = t;
        } else if (t !== s && t.main !== s) {
          const [sxw, sxl] = this.mainWL(t, dw, dl);
          const main = t.code === SC.PART ? t.main! : t;
          const destroyed = main.code;
          const [xw, xl] = this.pm.getWLH(main.gc, 0, 0, 0);
          this.destroyOne(dw, dl);
          t = make.rci(this.pm, SC.PART, s);
          this.cells[li] = t;
          if (xw > 1 || xl > 1) this.build(sxw, sxl, dw + xw - 1, dl + xl - 1, destroyed);
        }
        t.set(BIT.MARK);
        li++;
      }
    }
    for (let dl = l; dl < l + ol; dl++) {
      let li = dl * this.width + w;
      for (let dw = w; dw < w + ow; dw++) {
        if (!this.cells[li]!.isSet(BIT.MARK)) this.cells[li] = make.rci(this.pm, code);
        li++;
      }
    }
  }

  destroy(W1: number, L1: number, W2: number, L2: number): Built {
    if (W1 > W2) [W1, W2] = [W2, W1];
    if (L1 > L2) [L1, L2] = [L2, L1];
    let cost = 0;
    for (let w = W1; w <= W2; w++)
      for (let l = L1; l <= L2; l++) {
        const r = this.destroyOne(w, l);
        if (r.ok) cost += r.cost;
      }
    return { ok: cost > 0, cost };
  }

  /** StructureSet / StructureUnset on every square */
  unsetAll(bits: number): void { for (const s of this.cells) if (s !== null) s.unset(bits); }

  containStructure(W1: number, L1: number, W2: number, L2: number, code: number): boolean {
    if (code === SC.UNDEFINED) return false;
    for (let h = L1; h <= L2; h++) {
      let li = h * this.width + W1;
      for (let w = W1; w <= W2; w++, li++) {
        const s = this.cells[li];
        if (s === null) continue;
        if (code === SC.ELECTRIC) { if (s.isSet(BIT.E)) return true; }
        else if (s.code === code || code === SC.ANY) return true;
      }
    }
    return false;
  }

  containStructureOnly(W1: number, L1: number, W2: number, L2: number, code: number): boolean {
    if (code === SC.UNDEFINED) return false;
    if (code === SC.ANY) return true;
    for (let l = L1; l <= L2; l++) {
      let li = l * this.width + W1;
      for (let w = W1; w <= W2; w++, li++) {
        const s = this.cells[li];
        if (s === null) continue;
        if (code === SC.ELECTRIC) { if (!s.isSet(BIT.E)) return false; }
        else if ((s.main ?? s).code !== code) return false;
      }
    }
    return true;
  }

  /** _IsPathConstructive: a road or a line needs a square with at most one level of difference and an even
   * number of lowest corners, and nothing else on it */
  isPathConstructive(w: number, h: number, code: number): boolean {
    const s = this.get(w, h);
    if (s !== null && s.code !== code) return false;
    const t = this.map.squareHeight(w, h);
    let min = 127, max = -127;
    for (const v of t) { if (v < min) min = v; if (v > max) max = v; }
    if (max - min > 1) return false;
    let n = 0;
    for (const v of t) if (v === min) n++;
    return n % 2 === 0;
  }

  private buildPath(W1: number, L1: number, W2: number, L2: number, code: number): Built {
    if (W1 > W2) [W1, W2] = [W2, W1];
    if (L1 > L2) [L1, L2] = [L2, L1];
    if (W2 - W1 >= L2 - L1) {
      for (let w = W1; w < W2; w++) if (!this.isPathConstructive(w, L1, code)) return { ok: false, cost: 0 };
      for (let l = L1; l <= L2; l++) if (!this.isPathConstructive(W2, l, code)) return { ok: false, cost: 0 };
    } else {
      for (let l = L1; l < L2; l++) if (!this.isPathConstructive(W1, l, code)) return { ok: false, cost: 0 };
      for (let w = W1; w <= W2; w++) if (!this.isPathConstructive(w, L2, code)) return { ok: false, cost: 0 };
    }
    let cost = 0;
    if (W2 - W1 >= L2 - L1) {
      let li = L1 * this.width + W1;
      for (let w = W1; w < W2; w++, li++) cost += this.buildPathOne(w, L1, li, code);
      for (let l = L1; l <= L2; l++, li += this.width) cost += this.buildPathOne(W2, l, li, code);
    } else {
      let li = L1 * this.width + W1;
      for (let l = L1; l < L2; l++, li += this.width) cost += this.buildPathOne(W1, l, li, code);
      for (let w = W1; w <= W2; w++, li++) cost += this.buildPathOne(w, L2, li, code);
    }
    return { ok: true, cost };
  }

  private buildPathOne(w: number, l: number, li: number, code: number): number {
    if (this.cells[li] !== null) return 0;
    const s = make.path(this.pm, code);
    const cost = this.pm.get(PROP.TOOL_COST, code);
    this.cells[li] = s;
    const link = (dir: number, back: number): void => {
      const n = this.map.neighbour(w, l, dir);
      if (!n) return;
      const ns = this.get(n[0], n[1]);
      if (ns !== null && ns.code === code) {
        ns.addNeighbour(back);
        s.addNeighbour(dir);
      }
    };
    link(DIR.O_N, DIR.O_S);
    link(DIR.O_S, DIR.O_N);
    link(DIR.O_W, DIR.O_E);
    link(DIR.O_E, DIR.O_W);
    return cost;
  }

  private buildRCI(W1: number, L1: number, W2: number, L2: number, code: number): Built {
    if (W1 > W2) [W1, W2] = [W2, W1];
    if (L1 > L2) [L1, L2] = [L2, L1];
    let cost = 0;
    const each = this.pm.get(PROP.TOOL_COST, code);
    for (let l = L1; l <= L2; l++) {
      let li = l * this.width + W1;
      for (let w = W1; w <= W2; w++, li++) {
        if (this.cells[li] === null && this.map.isSquarePlane(w, l)) {
          this.cells[li] = make.rci(this.pm, code);
          cost += each;
        }
      }
    }
    return { ok: cost > 0, cost };
  }

  private buildFlora(W1: number, L1: number, W2: number, L2: number, code: number): Built {
    if (W1 > W2) [W1, W2] = [W2, W1];
    if (L1 > L2) [L1, L2] = [L2, L1];
    let cost = 0;
    const each = this.pm.get(PROP.TOOL_COST, code);
    for (let l = L1; l <= L2; l++) {
      let li = l * this.width + W1;
      for (let w = W1; w <= W2; w++, li++) {
        if (this.cells[li] === null && this.map.isSquarePlane(w, l)) {
          this.cells[li] = make.tree(this.pm, code, this.rng);
          cost += each;
        }
      }
    }
    return { ok: cost > 0, cost };
  }

  private buildWEG(W1: number, L1: number, code: number): Built {
    const gc = this.pm.getGC(code);
    const [sw, sl] = this.pm.getWLH(gc, 4, 4, 1);
    const W2 = W1 + sw - 1, L2 = L1 + sl - 1;
    if (!this.isConstructive(W1, L1, W2, L2, code)) return { ok: false, cost: 0 };
    const main = make.weg(this.pm, code);
    const cost = this.pm.get(PROP.TOOL_COST, code);
    for (let l = L1; l <= L2; l++) {
      let li = l * this.width + W1;
      for (let w = W1; w <= W2; w++, li++) this.cells[li] = make.part(this.pm, main);
    }
    this.cells[L1 * this.width + W1] = main;
    return { ok: true, cost };
  }

  /** _LoadStructure: put a loaded main structure back with its parts */
  placeLoaded(w1: number, l1: number, main: Structure): void {
    const [sw, sl, sh] = this.pm.getWLH(main.gc, 1, 1, 1);
    if (sw > 1 || sl > 1 || sh > 1) {
      for (let l = l1; l <= l1 + sl - 1; l++) {
        let li = l * this.width + w1;
        for (let w = w1; w <= w1 + sw - 1; w++, li++) this.cells[li] = make.part(this.pm, main);
      }
    }
    this.cells[l1 * this.width + w1] = main;
  }

  /** _DestroyStructure: the cost is the structure's own (or its part's) destroy cost */
  destroyOne(w: number, l: number): Built {
    const s = this.cells[l * this.width + w];
    if (s === null) return { ok: false, cost: 0 };
    const cost = this.pm.get(PROP.DESTROY_COST, s.code, s);
    switch (s.code) {
      case SC.ELINE: case SC.ROAD:
        this.destroyPath(w, l, s.code);
        return { ok: true, cost };
      default: {
        const main = s.code === SC.PART ? s.main! : s;
        let [sw, sl] = this.pm.getWLH(main.gc, 0, 0, 0);
        sw--; sl--;
        const [dw1, dl1] = this.map.possible(w, l, -sw, -sl);
        const [dw2, dl2] = this.map.possible(w, l, sw, sl);
        for (let y = dl1; y <= dl2; y++) {
          let li = y * this.width + dw1;
          for (let x = dw1; x <= dw2; x++, li++) {
            const p = this.cells[li];
            if (p !== null && (p.main === main || p === main)) this.cells[li] = null;
          }
        }
        return { ok: true, cost };
      }
    }
  }

  private destroyPath(w: number, l: number, code: number): void {
    const unlink = (dir: number, back: number): void => {
      const n = this.map.neighbour(w, l, dir);
      if (!n) return;
      const ns = this.get(n[0], n[1]);
      if (ns !== null && ns.code === code) ns.removeNeighbour(back);
    };
    unlink(DIR.O_N, DIR.O_S);
    unlink(DIR.O_S, DIR.O_N);
    unlink(DIR.O_W, DIR.O_E);
    unlink(DIR.O_E, DIR.O_W);
    this.cells[l * this.width + w] = null;
  }

  /** GetRandomStructure: up to OC_CHANCE_COUNTER_MAX random squares */
  randomStructure(code: number): { s: Structure; w: number; l: number } | null {
    if (code === SC.UNDEFINED) return null;
    for (let counter = 0; counter < OC.CHANCE_COUNTER_MAX; counter++) {
      const li = this.rng.rand() % (this.width * this.length);
      const s = this.cells[li];
      if (s !== null && (s.code === code || code === SC.ANY))
        return { s, w: li % this.width, l: Math.floor(li / this.width) };
    }
    return null;
  }

  /** the structure type ST of a loaded structure decides its class */
  static kindOfType(type: number): 'rci' | 'weg' | 'path' | 'tree' | null {
    switch (type) {
      case ST.RESIDENCE: case ST.COMMERCE: case ST.INDUSTRY: return 'rci';
      case ST.WATER: case ST.ELECTRICITY: case ST.GAS: case ST.GOVERNMENT: return 'weg';
      case ST.PATH: return 'path';
      case ST.TREE: return 'tree';
      default: return null;
    }
  }
}
