// X-Moto's collision system (src/xmoto/Collision.cpp): the 3x3 m grid of static blocking lines, the grid
// handlers for dynamic blocks and entities, and the circle/line contact generation that feeds ODE.
import type { Contact } from './ode.ts';
import { dContactApprox1_1, dContactSlip1 } from './ode.ts';
import { f, v2, vlen, vsub, vnormalize, intersectLineCircle2f, intersectLineLine2f, AABB, type Vec2 } from './vmath.ts';

export interface Line { x1: number; y1: number; x2: number; y2: number; grip: number }

export interface HasAABB { getAABB(): AABB }
export interface DynBlockLike extends HasAABB { isBackground(): boolean; collisionLines: Line[] }

const CD_EPSILON = f(0.01);
const EPS4 = f(0.0001);

interface ColElement<T> { id: T; gridCells: number[]; curCheck: number }

/** ElementHandler<T> (Collision.cpp): elements sorted into the grid by their AABB */
export class ElementHandler<T extends HasAABB> {
  private elements: ColElement<T>[] = [];
  private grid: ColElement<T>[][] = [];
  private minX = 0; private minY = 0; private maxX = 0; private maxY = 0;
  private gw = 0; private gh = 0;
  private wDiv = 0; private hDiv = 0;
  private curCheck = 0;
  private returned: T[] = [];

  reset(): void { this.elements = []; this.grid = []; }
  setDims(minX: number, minY: number, maxX: number, maxY: number, gw: number, gh: number, xoff = 1.0, yoff = 1.0): void {
    this.minX = minX; this.minY = minY; this.maxX = maxX; this.maxY = maxY;
    if (xoff !== 1.0 || yoff !== 1.0) {
      this.minY = f(this.minY * yoff);
      this.maxX = f(this.maxX * xoff);
    }
    this.gw = gw; this.gh = gh;
    this.wDiv = f(f(gw) / f(this.maxX - this.minX));
    this.hDiv = f(f(gh) / f(this.maxY - this.minY));
    this.grid = Array.from({ length: gw * gh }, () => []);
  }
  add(id: T): ColElement<T> {
    const e: ColElement<T> = { id, gridCells: [], curCheck: 0 };
    this.elements.push(e);
    this.addInCells(e);
    return e;
  }
  remove(id: T): void {
    const i = this.elements.findIndex((e) => e.id === id);
    if (i < 0) throw new Error('Collision element not found');
    const e = this.elements[i];
    this.elements.splice(i, 1);
    this.removeFromCells(e);
  }
  move(id: T): void {
    const e = this.elements.find((x) => x.id === id);
    if (!e) throw new Error('Collision element not found');
    this.removeFromCells(e);
    this.addInCells(e);
  }
  private cellRange(b: AABB): [number, number, number, number] {
    let x0 = myFloor(f(f(f(b.minX - this.minX) - CD_EPSILON) * this.wDiv));
    let y0 = myFloor(f(f(f(b.minY - this.minY) - CD_EPSILON) * this.hDiv));
    let x1 = myFloor(f(f(f(b.maxX - this.minX) + CD_EPSILON) * this.wDiv));
    let y1 = myFloor(f(f(f(b.maxY - this.minY) + CD_EPSILON) * this.hDiv));
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 >= this.gw) x1 = this.gw;
    if (y1 >= this.gh) y1 = this.gh;
    return [x0, y0, x1, y1];
  }
  near(b: AABB): T[] {
    this.returned = [];
    const [x0, y0, x1, y1] = this.cellRange(b);
    this.curCheck++;
    for (let i = x0; i <= x1; i++) {
      if (i < 0 || i >= this.gw) continue;
      for (let j = y0; j <= y1; j++) {
        if (j < 0 || j >= this.gh) continue;
        for (const e of this.grid[i + j * this.gw]) {
          if (e.curCheck !== this.curCheck) {
            e.curCheck = this.curCheck;
            this.returned.push(e.id);
          }
        }
      }
    }
    return this.returned;
  }
  private addInCells(e: ColElement<T>): void {
    e.curCheck = 0;
    const [x0, y0, x1, y1] = this.cellRange(e.id.getAABB());
    for (let i = x0; i <= x1; i++) {
      if (i < 0 || i >= this.gw) continue;
      for (let j = y0; j <= y1; j++) {
        if (j < 0 || j >= this.gh) continue;
        const cell = i + j * this.gw;
        e.gridCells.push(cell);
        this.grid[cell].push(e);
      }
    }
  }
  private removeFromCells(e: ColElement<T>): void {
    for (const cell of e.gridCells) {
      const list = this.grid[cell];
      const k = list.indexOf(e);
      if (k >= 0) list.splice(k, 1);
    }
    e.gridCells = [];
  }
}

/** my_floor: truncation then -1 for negatives (also for negative integers, like the original) */
function myFloor(x: number): number {
  const ix = Math.trunc(x) | 0;
  return ix >= 0 ? ix : ix - 1;
}

export interface WheelPhysics { bikeWheelErp: number; bikeWheelCfm: number }

export class CollisionSystem {
  minX = 0; minY = 0; maxX = 0; maxY = 0;
  lines: Line[] = [];
  private grid: Line[][] = [];
  gw = 0; gh = 0; cellW = 0; cellH = 0;
  private dynamicTouched = false;
  entities = new ElementHandler<HasAABB>();
  dynBlocks = new ElementHandler<DynBlockLike>();

  reset(): void {
    this.lines = [];
    this.grid = [];
    this.entities.reset();
    this.dynBlocks.reset();
  }
  setDims(minX: number, minY: number, maxX: number, maxY: number): void {
    this.gw = Math.ceil(f(maxX - minX) / 3.0) | 0;
    this.cellW = f(f(maxX - minX) / this.gw);
    this.gh = Math.ceil(f(maxY - minY) / 3.0) | 0;
    this.cellH = f(f(maxY - minY) / this.gh);
    this.minX = minX; this.minY = minY; this.maxX = maxX; this.maxY = maxY;
    this.grid = Array.from({ length: this.gw * this.gh }, () => []);
    this.entities.setDims(minX, minY, maxX, maxY, this.gw, this.gh);
    this.dynBlocks.setDims(minX, minY, maxX, maxY, this.gw, this.gh);
  }
  private cellRange(x0f: number, y0f: number, x1f: number, y1f: number): [number, number, number, number] {
    const w = f(this.maxX - this.minX), h = f(this.maxY - this.minY);
    let x0 = Math.floor(f(f(f(f(x0f - this.minX) - CD_EPSILON) * f(this.gw)) / w));
    let y0 = Math.floor(f(f(f(f(y0f - this.minY) - CD_EPSILON) * f(this.gh)) / h));
    let x1 = Math.floor(f(f(f(f(x1f - this.minX) + CD_EPSILON) * f(this.gw)) / w));
    let y1 = Math.floor(f(f(f(f(y1f - this.minY) + CD_EPSILON) * f(this.gh)) / h));
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 > this.gw - 1) x1 = this.gw - 1;
    if (y1 > this.gh - 1) y1 = this.gh - 1;
    return [x0, y0, x1, y1];
  }
  defineLine(x1: number, y1: number, x2: number, y2: number, grip: number): void {
    x1 = f(x1); y1 = f(y1); x2 = f(x2); y2 = f(y2);
    const line: Line = { x1, y1, x2, y2, grip: f(grip) };
    this.lines.push(line);
    const [cx0, cy0, cx1, cy1] = this.cellRange(Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2));
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) this.grid[cx + cy * this.gw].push(line);
    }
  }
  clearDynamicTouched(): void { this.dynamicTouched = false; }
  isDynamicTouched(): boolean { return this.dynamicTouched; }

  private dynBlocksNear(minX: number, minY: number, maxX: number, maxY: number): DynBlockLike[] {
    const b = new AABB();
    b.addPoint(minX, minY);
    b.addPoint(maxX, maxY);
    return this.dynBlocks.near(b);
  }

  checkCircle(x: number, y: number, r: number): boolean {
    const minX = f(x - r), minY = f(y - r), maxX = f(x + r), maxY = f(y + r);
    const [cx0, cy0, cx1, cy1] = this.cellRange(minX, minY, maxX, maxY);
    for (const block of this.dynBlocksNear(minX, minY, maxX, maxY)) {
      if (block.isBackground()) continue;
      for (const l of block.collisionLines) if (checkCircleAndLine(l, x, y, r)) return true;
    }
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        for (const l of this.grid[cx + cy * this.gw]) if (checkCircleAndLine(l, x, y, r)) return true;
      }
    }
    return false;
  }

  collideLine(x1: number, y1: number, x2: number, y2: number, out: Contact[], maxC: number, ps: WheelPhysics): number {
    let n = 0;
    const minX = Math.min(x1, x2), minY = Math.min(y1, y2), maxX = Math.max(x1, x2), maxY = Math.max(y1, y2);
    const [cx0, cy0, cx1, cy1] = this.cellRange(minX, minY, maxX, maxY);
    const A0 = v2(x1, y1), A1 = v2(x2, y2);
    const T: Vec2 = { x: 0, y: 0 };
    for (const block of this.dynBlocksNear(minX, minY, maxX, maxY)) {
      if (block.isBackground()) continue;
      for (const l of block.collisionLines) {
        const vx = f(l.x2 - l.x1), vy = f(l.y2 - l.y1);
        if (Math.abs(vx) < EPS4 && Math.abs(vy) < EPS4) continue;
        if (intersectLineLine2f(A0, A1, v2(l.x1, l.y1), v2(l.x2, l.y2), T) > 0) {
          const W = v2(vx, vy);
          vnormalize(W);
          const c = wheelContact(T, W, 0.0, l.grip, ps);
          const old = n;
          n = addContact(out, n, c, maxC);
          if (n !== old) this.dynamicTouched = true;
        }
      }
    }
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        for (const l of this.grid[cx + cy * this.gw]) {
          const vx = f(l.x2 - l.x1), vy = f(l.y2 - l.y1);
          if (Math.abs(vx) < EPS4 && Math.abs(vy) < EPS4) continue;
          if (intersectLineLine2f(A0, A1, v2(l.x1, l.y1), v2(l.x2, l.y2), T) > 0) {
            const W = v2(vx, vy);
            vnormalize(W);
            n = addContact(out, n, wheelContact(T, W, 0.0, l.grip, ps), maxC);
          }
        }
      }
    }
    return n;
  }

  collideCircle(x: number, y: number, r: number, out: Contact[], maxC: number, ps: WheelPhysics): number {
    let n = 0;
    const minX = f(x - r), minY = f(y - r), maxX = f(x + r), maxY = f(y + r);
    const [cx0, cy0, cx1, cy1] = this.cellRange(minX, minY, maxX, maxY);
    for (const block of this.dynBlocksNear(minX, minY, maxX, maxY)) {
      if (block.isBackground()) continue;
      for (const l of block.collisionLines) {
        const old = n;
        n = collideCircleAndLine(l, x, y, r, out, n, maxC, l.grip, ps);
        if (old !== n) this.dynamicTouched = true;
      }
    }
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        for (const l of this.grid[cx + cy * this.gw]) n = collideCircleAndLine(l, x, y, r, out, n, maxC, l.grip, ps);
      }
    }
    return n;
  }
}

function checkCircleAndLine(l: Line, x: number, y: number, r: number): boolean {
  const vx = f(l.x2 - l.x1), vy = f(l.y2 - l.y1);
  const enx = -vy, eny = vx;
  if (f(f(enx * x) + f(eny * y)) < f(f(enx * l.x1) + f(eny * l.y1))) return false;
  if (Math.abs(vx) < EPS4 && Math.abs(vy) < EPS4) return false;
  const rr = f(r * r);
  const dx1 = f(l.x1 - x), dy1 = f(l.y1 - y);
  if (f(f(dx1 * dx1) + f(dy1 * dy1)) <= rr) return true;
  const dx2 = f(l.x2 - x), dy2 = f(l.y2 - y);
  if (f(f(dx2 * dx2) + f(dy2 * dy2)) <= rr) return true;
  const T1 = { x: 0, y: 0 }, T2 = { x: 0, y: 0 };
  return intersectLineCircle2f(v2(x, y), r, v2(l.x1, l.y1), v2(l.x2, l.y2), T1, T2) > 0;
}

function collideCircleAndLine(l: Line, x: number, y: number, r: number, out: Contact[], n: number, maxC: number, grip: number, ps: WheelPhysics): number {
  const vx = f(l.x2 - l.x1), vy = f(l.y2 - l.y1);
  const enx = -vy, eny = vx;
  if (f(f(enx * x) + f(eny * y)) < f(f(enx * l.x1) + f(eny * l.y1))) return n;
  if (Math.abs(vx) < EPS4 && Math.abs(vy) < EPS4) return n;
  const C = v2(x, y);
  const lim = f(r + EPS4);
  const dx1 = f(l.x1 - x), dy1 = f(l.y1 - y);
  if (f(Math.sqrt(f(f(dx1 * dx1) + f(dy1 * dy1)))) <= lim) {
    const W = v2(-dx1, -dy1);
    vnormalize(W);
    const P = v2(l.x1, l.y1);
    n = addContact(out, n, wheelContact(P, W, calculateDepth(C, r, P), grip, ps), maxC);
  }
  const dx2 = f(l.x2 - x), dy2 = f(l.y2 - y);
  if (f(Math.sqrt(f(f(dx2 * dx2) + f(dy2 * dy2)))) <= lim) {
    const W = v2(-dx2, -dy2);
    vnormalize(W);
    const P = v2(l.x2, l.y2);
    n = addContact(out, n, wheelContact(P, W, calculateDepth(C, r, P), grip, ps), maxC);
  }
  const T1 = { x: 0, y: 0 }, T2 = { x: 0, y: 0 };
  const k = intersectLineCircle2f(C, r, v2(l.x1, l.y1), v2(l.x2, l.y2), T1, T2);
  if (k > 0) {
    const W = v2(enx, eny);
    vnormalize(W);
    const depth = calculateCircleLineDepth(C, r, v2(l.x1, l.y1), v2(l.x2, l.y2));
    n = addContact(out, n, wheelContact(T1, W, depth, grip, ps), maxC);
    if (k > 1) n = addContact(out, n, wheelContact(T2, W, depth, grip, ps), maxC);
  }
  return n;
}

function calculateDepth(Cp: Vec2, Cr: number, P: Vec2): number {
  const dist = vlen(vsub(Cp, P));
  let depth = Cr - dist;
  if (depth < 0) depth = 0;
  return depth;
}

function calculateCircleLineDepth(Cp: Vec2, Cr: number, P1: Vec2, P2: Vec2): number {
  const N = v2(f(P2.y - P1.y), -f(P2.x - P1.x));
  const R = vsub(P1, Cp);
  if (vlen(N) > 0) {
    vnormalize(N);
    const d = f(f(R.x * N.x) + f(R.y * N.y));
    return Cr - Math.abs(d);
  }
  return 0;
}

const DEPTH_MIN = f(0.01);
const NEAR = f(0.1);

/** _SetWheelContactParams */
function wheelContact(pos: Vec2, normalT: Vec2, depth: number, grip: number, _ps: WheelPhysics): Contact {
  const N = { x: normalT.x, y: normalT.y };
  vnormalize(N);
  if (depth < DEPTH_MIN) depth = 0.0;
  return {
    geom: { pos: [pos.x, pos.y, 0], normal: [N.x, N.y, 0], depth },
    mu: grip,
    mode: dContactApprox1_1 | dContactSlip1,
    slip1: 0,
  };
}

/** _AddContactToList: contacts closer than 0.1 to an earlier one are dropped */
function addContact(out: Contact[], n: number, c: Contact, maxC: number): number {
  if (n === maxC) return n;
  for (let i = 0; i < n; i++) {
    if (Math.abs(out[i].geom.pos[0] - c.geom.pos[0]) < NEAR && Math.abs(out[i].geom.pos[1] - c.geom.pos[1]) < NEAR) return n;
  }
  out[n] = c;
  return n + 1;
}
