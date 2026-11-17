// src/pathfinder.cpp, src/destination.cpp, src/movement.cpp, src/vehicle.cpp, src/movementmanager.cpp:
// the traffic simulator's vehicles. A vehicle drives a path found over the roads, one square every
// (traffic + 10) frames.
import { DIR, GC, SC } from './codes.ts';
import type { HeightMap } from './heightmap.ts';
import type { BuildingLayer } from './layer.ts';
import type { Structure } from './structure.ts';

const f = Math.fround;
const MAX_LENGTH = 0xffff0000;
export const MOVEMENT_MAX = 100;
const VEHICLE_DEFAULT_SPEED = 10;
export const VEHICLE = { STD: 0, BUS: 1, SPORT: 2, NUMBER: 3 } as const;
export const PATH_TYPE = { DISTANCE: 0, TRAFFIC: 1 } as const;

export interface Destination {
  dir: number; w: number; l: number; hMin: number; hMax: number; time: number; traffic: number;
}

interface Node { own: number; father: number; evaluation: number; path: Structure }

/** libstdc++'s std::sort (introsort, then insertion sort), so that equal nodes end up in the same
 * order as in the original */
function stdSort<T>(a: T[], comp: (x: T, y: T) => boolean): void {
  const n = a.length;
  if (n < 2) return;
  const lg = 31 - Math.clz32(n);
  introsortLoop(a, 0, n, lg * 2, comp);
  finalInsertionSort(a, 0, n, comp);
}
const THRESHOLD = 16;
function introsortLoop<T>(a: T[], first: number, last: number, depth: number, comp: (x: T, y: T) => boolean): void {
  while (last - first > THRESHOLD) {
    if (depth === 0) { heapSort(a, first, last, comp); return; }
    --depth;
    const cut = partitionPivot(a, first, last, comp);
    introsortLoop(a, cut, last, depth, comp);
    last = cut;
  }
}
function swap<T>(a: T[], i: number, j: number): void { const t = a[i]; a[i] = a[j]; a[j] = t; }
function moveMedianToFirst<T>(a: T[], result: number, x: number, y: number, z: number, comp: (p: T, q: T) => boolean): void {
  if (comp(a[x], a[y])) {
    if (comp(a[y], a[z])) swap(a, result, y);
    else if (comp(a[x], a[z])) swap(a, result, z);
    else swap(a, result, x);
  } else if (comp(a[x], a[z])) swap(a, result, x);
  else if (comp(a[y], a[z])) swap(a, result, z);
  else swap(a, result, y);
}
function partitionPivot<T>(a: T[], first: number, last: number, comp: (x: T, y: T) => boolean): number {
  const mid = first + ((last - first) >> 1);
  moveMedianToFirst(a, first, first + 1, mid, last - 1, comp);
  let lo = first + 1, hi = last;
  for (;;) {
    while (comp(a[lo], a[first])) ++lo;
    --hi;
    while (comp(a[first], a[hi])) --hi;
    if (!(lo < hi)) return lo;
    swap(a, lo, hi);
    ++lo;
  }
}
function insertionSort<T>(a: T[], first: number, last: number, comp: (x: T, y: T) => boolean): void {
  if (first === last) return;
  for (let i = first + 1; i !== last; ++i) {
    if (comp(a[i], a[first])) {
      const v = a[i];
      for (let k = i; k > first; k--) a[k] = a[k - 1];
      a[first] = v;
    } else {
      const v = a[i];
      let k = i, next = i - 1;
      while (comp(v, a[next])) { a[k] = a[next]; k = next; --next; }
      a[k] = v;
    }
  }
}
function unguardedInsertionSort<T>(a: T[], first: number, last: number, comp: (x: T, y: T) => boolean): void {
  for (let i = first; i !== last; ++i) {
    const v = a[i];
    let k = i, next = i - 1;
    while (comp(v, a[next])) { a[k] = a[next]; k = next; --next; }
    a[k] = v;
  }
}
function finalInsertionSort<T>(a: T[], first: number, last: number, comp: (x: T, y: T) => boolean): void {
  if (last - first > THRESHOLD) {
    insertionSort(a, first, first + THRESHOLD, comp);
    unguardedInsertionSort(a, first + THRESHOLD, last, comp);
  } else insertionSort(a, first, last, comp);
}
function adjustHeap<T>(a: T[], first: number, hole: number, len: number, value: T, comp: (x: T, y: T) => boolean): void {
  const top = hole;
  let second = hole;
  while (second < Math.floor((len - 1) / 2)) {
    second = 2 * (second + 1);
    if (comp(a[first + second], a[first + second - 1])) second--;
    a[first + hole] = a[first + second];
    hole = second;
  }
  if ((len & 1) === 0 && second === Math.floor((len - 2) / 2)) {
    second = 2 * (second + 1);
    a[first + hole] = a[first + second - 1];
    hole = second - 1;
  }
  let parent = Math.floor((hole - 1) / 2);
  while (hole > top && comp(a[first + parent], value)) {
    a[first + hole] = a[first + parent];
    hole = parent;
    parent = Math.floor((hole - 1) / 2);
  }
  a[first + hole] = value;
}
function heapSort<T>(a: T[], first: number, last: number, comp: (x: T, y: T) => boolean): void {
  const len = last - first;
  if (len >= 2) for (let parent = Math.floor((len - 2) / 2); ; parent--) {
    adjustHeap(a, first, parent, len, a[first + parent], comp);
    if (parent === 0) break;
  }
  while (last - first > 1) {
    --last;
    const v = a[last];
    a[last] = a[first];
    adjustHeap(a, first, 0, last - first, v, comp);
  }
}

function getDir(a: Destination, b: Destination): number {
  if (a.w === b.w && a.l === b.l) return a.dir;
  if (a.w < b.w) return DIR.O_E;
  if (a.w > b.w) return DIR.O_W;
  if (a.l < b.l) return DIR.O_S;
  if (a.l > b.l) return DIR.O_N;
  return DIR.O_S;
}

/** PathFinder::findShortestPath: Dijkstra over the roads, by traffic or by distance to the target */
export function findShortestPath(layer: BuildingLayer, map: HeightMap, w1: number, h1: number, w2: number, h2: number,
  type: number): Destination[] {
  const out: Destination[] = [];
  const start = layer.get(w1, h1);
  if (start === null || start.kind !== 'path') return out;
  const W = layer.width;
  const comp = type === PATH_TYPE.DISTANCE
    ? (a: Node, b: Node) => a.evaluation > b.evaluation
    : (a: Node, b: Node) => a.path.length > b.path.length;
  const evaluate = (a: number, b: number, c: number, d: number) => ((c - a) * (c - a) + (d - b) * (d - b)) >>> 0;
  for (const s of layer.cells) if (s !== null && s.code === SC.ROAD) { s.unset(0x80); s.length = MAX_LENGTH; }
  start.length = 0;
  const processing: Node[] = [{ own: W * h1 + w1, father: -1, evaluation: evaluate(w1, h1, w2, h2), path: start }];
  const done: Node[] = [];
  let found = false;
  while (!found && processing.length > 0) {
    stdSort(processing, comp);
    const node = processing.pop()!;
    const h = Math.floor(node.own / W), w = node.own % W;
    if (w === w2 && h === h2) { found = true; done.push(node); break; }
    for (const dir of [DIR.O_N, DIR.O_E, DIR.O_S, DIR.O_W]) {
      const n = map.neighbour(w, h, dir);
      if (!n) continue;
      const s = layer.get(n[0], n[1]);
      if (s === null || s.code !== SC.ROAD || s.isSet(0x80)) continue;
      const len = (node.path.length + s.traffic) >>> 0;
      if (s.length > len) {
        s.length = len;
        processing.push({ own: n[1] * W + n[0], father: node.own, evaluation: evaluate(n[0], n[1], w2, h2), path: s });
      }
    }
    node.path.set(0x80);
    done.push(node);
  }
  if (found) {
    let i = done.length - 1;
    let node = done[i];
    let father = node.father;
    const dest = (own: number): Destination => {
      const w = own % W, l = Math.floor(own / W);
      return { dir: DIR.O_S, w, l, hMin: map.squareMinHeight(w, l), hMax: map.squareMaxHeight(w, l), time: 1,
        traffic: layer.getLinear(own)!.traffic };
    };
    let last = dest(node.own);
    out.push(last);
    while (--i >= 0) {
      node = done[i];
      if (node.own !== father) continue;
      father = node.father;
      const d = dest(node.own);
      d.dir = getDir(d, last);
      out.push(d);
      last = d;
    }
    out.reverse();
  }
  return out;
}

export class Vehicle {
  readonly type: number;
  readonly gc: number;
  path: Destination[] = [];
  index = 0;
  cur!: Destination;
  frames = 0;
  framesPerUnit = 0;
  w = 0; l = 0; h = 0;
  dw = 0; dl = 0; dh = 0;
  // Movement: rotation and translation compensation
  ry = 0; rx = 0; rz = 0;
  tx = 0; ty = 0; tz = 0;
  dir: number = DIR.O_S;

  constructor(type: number) {
    this.type = type;
    this.gc = type === VEHICLE.STD ? GC.VEHICLE_STD : type === VEHICLE.BUS ? GC.VEHICLE_PICKUP : GC.VEHICLE_ROBBER;
  }

  start(path: Destination[]): void {
    this.path = path;
    this.frames = 0;
    this.index = 0;
    this.cur = { ...path[0] };
    this.w = this.cur.w; this.l = this.cur.l; this.h = this.cur.hMin;
    this.calculateDelta();
  }

  private calculateDelta(): void {
    if (this.index + 1 < this.path.length) {
      const next = this.path[this.index + 1];
      this.framesPerUnit = next.traffic + 10;
      this.dw = f(f(next.w - this.w) / this.framesPerUnit);
      this.dl = f(f(next.l - this.l) / this.framesPerUnit);
      this.dh = f(f(this.cur.hMax - this.cur.hMin) / this.framesPerUnit);
      this.setAngle(this.cur);
      this.setSlope(this.cur, next);
    } else {
      this.framesPerUnit = VEHICLE_DEFAULT_SPEED;
      this.dw = 0; this.dl = 0; this.dh = 0;
    }
  }

  private setAngle(d: Destination): void {
    this.dir = d.dir;
    switch (this.dir) {
      case DIR.O_N: this.ry = 180; this.tx = 1; this.ty = 0; this.tz = 1; break;
      case DIR.O_E: this.ry = 90; this.tx = 0; this.ty = 0; this.tz = 1; break;
      case DIR.O_S: this.ry = 0; this.tx = 0; this.ty = 0; this.tz = 0; break;
      case DIR.O_W: this.ry = -90; this.tx = 1; this.ty = 0; this.tz = 0; break;
      default: break;
    }
  }

  private setSlope(a: Destination, b: Destination): void {
    if (a.hMin !== a.hMax) {
      let sign: number;
      if (a.hMin > b.hMin) sign = 1;
      else if (b.hMin !== b.hMax) sign = -1;
      else sign = 0;
      if (this.dir === DIR.O_N || this.dir === DIR.O_S) { this.rx = 0; this.rz = 45; }
      else { this.rx = sign * 45; this.rz = 0; }
    } else { this.rx = 0; this.rz = 0; }
  }

  /** Vehicle::Move, once a frame; false when the vehicle has arrived */
  move(): boolean {
    this.w = f(this.w + this.dw);
    this.l = f(this.l + this.dl);
    this.h = f(this.h + this.dh);
    if (++this.frames === this.framesPerUnit) {
      if (this.cur.time > 1) {
        --this.cur.time;
      } else if (this.index < this.path.length - 1) {
        ++this.index;
        this.cur = { ...this.path[this.index] };
        this.w = this.cur.w; this.l = this.cur.l; this.h = this.cur.hMin;
        this.calculateDelta();
      } else return false;
      this.frames = 0;
    }
    return true;
  }
}

export class MovementManager {
  readonly slots: (Vehicle | null)[] = new Array(MOVEMENT_MAX).fill(null);
  count = 0;

  add(v: Vehicle): number {
    for (let i = 0; i < MOVEMENT_MAX; i++) if (this.slots[i] === null) { this.slots[i] = v; ++this.count; return i; }
    return -1;
  }

  isFull(): boolean { return this.count === MOVEMENT_MAX; }

  removeAll(): void { this.slots.fill(null); this.count = 0; }

  move(): void {
    for (let i = 0; i < MOVEMENT_MAX; i++) {
      const v = this.slots[i];
      if (v !== null && !v.move()) { this.slots[i] = null; --this.count; }
    }
  }
}
