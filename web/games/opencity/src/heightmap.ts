// src/map.cpp: the height of every corner of the city's squares ((w+1) x (l+1) signed chars).
import { DIR, OC, SC } from './codes.ts';

/** what Map needs from the building layer */
export interface StructureQuery {
  containStructure(w1: number, l1: number, w2: number, l2: number, code: number): boolean;
}

const sc8 = (v: number): number => (v << 24) >> 24;

export class HeightMap {
  width: number;
  length: number;
  heights: Int8Array;
  layer: StructureQuery | null = null;

  constructor(width: number, length: number, heights: ArrayLike<number>) {
    this.width = width;
    this.length = length;
    const size = (width + 1) * (length + 1);
    this.heights = new Int8Array(size);
    for (let i = 0; i < size; i++) this.heights[i] = sc8(heights[i]);
  }

  linear(w: number, h: number): number { return h * (this.width + 1) + w; }

  /** [left-up, left-down, right-down, right-up]: (w,l), (w,l+1), (w+1,l+1), (w+1,l) */
  squareHeight(w: number, l: number): [number, number, number, number] {
    const a = this.linear(w, l), b = this.linear(w, l + 1);
    return [this.heights[a], this.heights[b], this.heights[b + 1], this.heights[a + 1]];
  }

  squareMinHeight(w: number, l: number): number { return Math.min(127, ...this.squareHeight(w, l)); }
  squareMaxHeight(w: number, l: number): number { return Math.max(-127, ...this.squareHeight(w, l)); }

  isSquarePlane(w: number, l: number): boolean {
    const t = this.squareHeight(w, l);
    return t[0] === t[1] && t[0] === t[2] && t[0] === t[3];
  }

  isSurfacePlane(w1: number, l1: number, w2: number, l2: number): boolean {
    for (let l = l1; l <= l2; l++) for (let w = w1; w <= w2; w++) if (!this.isSquarePlane(w, l)) return false;
    return true;
  }

  /** GetNeighbourWH: null outside the map */
  neighbour(w: number, h: number, dir: number): [number, number] | null {
    switch (dir) {
      case DIR.O_N: h--; break;
      case DIR.N_E: h--; w++; break;
      case DIR.O_E: w++; break;
      case DIR.S_E: w++; h++; break;
      case DIR.O_S: h++; break;
      case DIR.S_W: h++; w--; break;
      case DIR.O_W: w--; break;
      case DIR.N_W: w--; h--; break;
      default: break;
    }
    if (w < 0 || w >= this.width || h < 0 || h >= this.length) return null;
    return [w, h];
  }

  /** GetPossibleWH: (w + dw, h + dh) clamped to the map */
  possible(w: number, h: number, dw: number, dh: number): [number, number] {
    let nw = w + dw, nh = h + dh;
    if (nw < 0) nw = 0;
    if (nw >= this.width) nw = this.width - 1;
    if (nh < 0) nh = 0;
    if (nh >= this.length) nh = this.length - 1;
    return [nw, nh];
  }

  /** ChangeHeight: raise the lowest or lower the highest corners of a square; nothing may stand around it */
  changeHeight(w: number, h: number, variation: 1 | -1): boolean {
    if (this.layer) {
      const [w1, h1] = this.possible(w, h, -1, -1);
      const [w2, h2] = this.possible(w, h, 1, 1);
      if (this.layer.containStructure(w1, h1, w2, h2, SC.ANY)) return false;
    }
    const t = this.squareHeight(w, h);
    let ref: number;
    if (variation === 1) {
      ref = this.squareMinHeight(w, h);
      if (ref === OC.MAP_HEIGHT_MAX) return false;
    } else {
      ref = this.squareMaxHeight(w, h);
      if (ref === OC.MAP_HEIGHT_MIN) return false;
    }
    for (let i = 0; i < 4; i++) if (t[i] === ref) t[i] += variation;
    const a = this.linear(w, h), b = this.linear(w, h + 1);
    this.heights[a] = t[0];
    this.heights[a + 1] = t[3];
    this.heights[b] = t[1];
    this.heights[b + 1] = t[2];
    return true;
  }
}
