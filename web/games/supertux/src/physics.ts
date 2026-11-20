// The original's swept-AABB collision maths (src/collision/collision.cpp and
// collision_system.cpp) and its AATriangle slopes, translated to TypeScript.
export const EPSILON = 0.002;
export const SHIFT_DELTA = 7;

export interface Vec { x: number; y: number }
export const vec = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec, n: number): Vec => ({ x: a.x * n, y: a.y * n });
export const len = (a: Vec): number => Math.hypot(a.x, a.y);
export const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;

export class Rect {
  left: number; top: number; right: number; bottom: number;
  constructor(left: number, top: number, right: number, bottom: number) {
    this.left = left; this.top = top; this.right = right; this.bottom = bottom;
  }
  static fromPosSize(x: number, y: number, w: number, h: number): Rect {
    return new Rect(x, y, x + w, y + h);
  }
  clone(): Rect { return new Rect(this.left, this.top, this.right, this.bottom); }
  get width(): number { return this.right - this.left; }
  get height(): number { return this.bottom - this.top; }
  get p1(): Vec { return { x: this.left, y: this.top }; }
  get p2(): Vec { return { x: this.right, y: this.bottom }; }
  get middle(): Vec { return { x: (this.left + this.right) / 2, y: (this.top + this.bottom) / 2 }; }
  setSize(w: number, h: number): void { this.right = this.left + w; this.bottom = this.top + h; }
  setWidth(w: number): void { this.right = this.left + w; }
  setHeight(h: number): void { this.bottom = this.top + h; }
  setPos(p: Vec): void { this.right = p.x + this.width; this.bottom = p.y + this.height; this.left = p.x; this.top = p.y; }
  move(v: Vec): void { this.left += v.x; this.right += v.x; this.top += v.y; this.bottom += v.y; }
  grown(n: number): Rect { return new Rect(this.left - n, this.top - n, this.right + n, this.bottom + n); }
  setLeft(v: number): void { const w = this.width; this.left = v; this.right = v + w; }
  setRight(v: number): void { const w = this.width; this.right = v; this.left = v - w; }
  setTop(v: number): void { const h = this.height; this.top = v; this.bottom = v + h; }
  setBottom(v: number): void { const h = this.height; this.bottom = v; this.top = v - h; }
}

export interface CollisionHit {
  left: boolean; right: boolean; top: boolean; bottom: boolean; crush: boolean;
  slopeNormal: Vec;
}

export const emptyHit = (): CollisionHit => ({ left: false, right: false, top: false, bottom: false, crush: false, slopeNormal: { x: 0, y: 0 } });

export class Constraints {
  hit: CollisionHit = emptyHit();
  positionLeft = -Infinity;
  positionRight = Infinity;
  positionTop = -Infinity;
  positionBottom = Infinity;
  constrainLeft(v: number): void { this.positionLeft = Math.max(this.positionLeft, v); }
  constrainRight(v: number): void { this.positionRight = Math.min(this.positionRight, v); }
  constrainTop(v: number): void { this.positionTop = Math.max(this.positionTop, v); }
  constrainBottom(v: number): void { this.positionBottom = Math.min(this.positionBottom, v); }
  get hasConstraints(): boolean {
    return this.positionLeft > -Infinity || this.positionRight < Infinity ||
      this.positionTop > -Infinity || this.positionBottom < Infinity;
  }
  get height(): number { return this.positionBottom - this.positionTop; }
  get width(): number { return this.positionRight - this.positionLeft; }
  get xMidpoint(): number { return 0.5 * (this.positionLeft + this.positionRight); }
  merge(other: Constraints): void {
    this.constrainLeft(other.positionLeft);
    this.constrainRight(other.positionRight);
    this.constrainTop(other.positionTop);
    this.constrainBottom(other.positionBottom);
    this.hit.left ||= other.hit.left;
    this.hit.right ||= other.hit.right;
    this.hit.top ||= other.hit.top;
    this.hit.bottom ||= other.hit.bottom;
    this.hit.crush ||= other.hit.crush;
    if (other.hit.slopeNormal.x !== 0 || other.hit.slopeNormal.y !== 0) this.hit.slopeNormal = other.hit.slopeNormal;
  }
}

export function intersects(r1: Rect, r2: Rect): boolean {
  if (r1.right < r2.left || r1.left > r2.right) return false;
  if (r1.bottom < r2.top || r1.top > r2.bottom) return false;
  return true;
}

export function setRectangleRectangleConstraints(c: Constraints, r1: Rect, r2: Rect): void {
  const itop = r1.bottom - r2.top;
  const ibottom = r2.bottom - r1.top;
  const ileft = r1.right - r2.left;
  const iright = r2.right - r1.left;
  const vert = Math.min(itop, ibottom);
  const horiz = Math.min(ileft, iright);
  if (vert < horiz) {
    if (itop < ibottom) { c.constrainBottom(r2.top); c.hit.bottom = true; }
    else { c.constrainTop(r2.bottom); c.hit.top = true; }
  } else {
    if (ileft < iright) { c.constrainRight(r2.left); c.hit.right = true; }
    else { c.constrainLeft(r2.right); c.hit.left = true; }
  }
}

/** src/collision/collision_system.cpp check_collisions (tiles and static rectangles) */
export function checkCollisions(movement: Vec, moving: Rect, other: Rect): Constraints {
  const c = new Constraints();
  const grown = other.grown(EPSILON);
  if (!intersects(moving, grown)) return c;
  const itop = moving.bottom - grown.top;
  const ibottom = grown.bottom - moving.top;
  const ileft = moving.right - grown.left;
  const iright = grown.right - moving.left;
  let shiftout = false;
  if (Math.abs(movement.y) > Math.abs(movement.x)) {
    if (ileft < SHIFT_DELTA) { c.constrainRight(grown.left); shiftout = true; }
    else if (iright < SHIFT_DELTA) { c.constrainLeft(grown.right); shiftout = true; }
  } else {
    if (itop < SHIFT_DELTA) { c.constrainBottom(grown.top); shiftout = true; }
    else if (ibottom < SHIFT_DELTA) { c.constrainTop(grown.bottom); shiftout = true; }
  }
  if (!shiftout) {
    const vert = Math.min(itop, ibottom);
    const horiz = Math.min(ileft, iright);
    if (vert < horiz) {
      if (itop < ibottom) { c.constrainBottom(grown.top); c.hit.bottom = true; }
      else { c.constrainTop(grown.bottom); c.hit.top = true; }
    } else {
      if (ileft < iright) { c.constrainRight(grown.left); c.hit.right = true; }
      else { c.constrainLeft(grown.right); c.hit.left = true; }
    }
  }
  return c;
}

export const SOUTHWEST = 0, NORTHEAST = 1, SOUTHEAST = 2, NORTHWEST = 3;
export const DIRECTION_MASK = 0x0003;
export const DEFORM_BOTTOM = 0x0010, DEFORM_TOP = 0x0020, DEFORM_LEFT = 0x0030, DEFORM_RIGHT = 0x0040, DEFORM_MASK = 0x0070;

export interface AATriangle { bbox: Rect; dir: number }

export function verticalFlip(dir: number): number {
  let direction = (3 - (dir & DIRECTION_MASK)) & DIRECTION_MASK;
  let deform = dir & DEFORM_MASK;
  if (deform === DEFORM_BOTTOM) deform = DEFORM_TOP;
  else if (deform === DEFORM_TOP) deform = DEFORM_BOTTOM;
  return direction | deform;
}

function makePlane(p1: Vec, p2: Vec): { n: Vec; c: number } {
  let nx = p2.y - p1.y, ny = p1.x - p2.x;
  let cc = -(p2.x * nx + p2.y * ny);
  const nval = Math.hypot(nx, ny) || 1;
  nx /= nval; ny /= nval; cc /= nval;
  return { n: { x: nx, y: ny }, c: cc };
}

/** src/collision/collision.cpp rectangle_aatriangle; returns whether the triangle was hit. */
export function rectangleAATriangle(c: Constraints, rect: Rect, tri: AATriangle, hitsBottom: { value: boolean }): boolean {
  if (!intersects(rect, tri.bbox)) return false;
  const bb = tri.bbox;
  let normal: Vec = { x: 0, y: 0 };
  let planeC = 0;
  let p1: Vec = { x: 0, y: 0 };
  const area = new Rect(0, 0, 0, 0);
  switch (tri.dir & DEFORM_MASK) {
    case 0: area.left = bb.left; area.top = bb.top; area.right = bb.right; area.bottom = bb.bottom; break;
    case DEFORM_BOTTOM: area.left = bb.left; area.top = bb.top + bb.height / 2; area.right = bb.right; area.bottom = bb.bottom; break;
    case DEFORM_TOP: area.left = bb.left; area.top = bb.top; area.right = bb.right; area.bottom = bb.top + bb.height / 2; break;
    case DEFORM_LEFT: area.left = bb.left; area.top = bb.top; area.right = bb.left + bb.width / 2; area.bottom = bb.bottom; break;
    case DEFORM_RIGHT: area.left = bb.left + bb.width / 2; area.top = bb.top; area.right = bb.right; area.bottom = bb.bottom; break;
    default: return false;
  }
  switch (tri.dir & DIRECTION_MASK) {
    case SOUTHWEST: {
      p1 = { x: rect.left, y: rect.bottom };
      const pl = makePlane({ x: area.left, y: area.top }, { x: area.right, y: area.bottom });
      normal = pl.n; planeC = pl.c;
      break;
    }
    case NORTHEAST: {
      p1 = { x: rect.right, y: rect.top };
      const pl = makePlane({ x: area.right, y: area.bottom }, { x: area.left, y: area.top });
      normal = pl.n; planeC = pl.c;
      break;
    }
    case SOUTHEAST: {
      p1 = { x: rect.right, y: rect.bottom };
      const pl = makePlane({ x: area.left, y: area.bottom }, { x: area.right, y: area.top });
      normal = pl.n; planeC = pl.c;
      break;
    }
    case NORTHWEST: {
      p1 = { x: rect.left, y: rect.top };
      const pl = makePlane({ x: area.right, y: area.top }, { x: area.left, y: area.bottom });
      normal = pl.n; planeC = pl.c;
      break;
    }
    default: return false;
  }
  const np1 = -(normal.x * p1.x + normal.y * p1.y);
  const depth = np1 - planeC;
  if (depth < 0) return false;
  const out = { x: normal.x * (depth + 0.2), y: normal.y * (depth + 0.2) };
  const RDELTA = 3;
  if (p1.x < area.left - RDELTA || p1.x > area.right + RDELTA || p1.y < area.top - RDELTA || p1.y > area.bottom + RDELTA) {
    setRectangleRectangleConstraints(c, rect, area);
  } else {
    if (out.x < 0) { c.constrainRight(rect.right + out.x); c.hit.right = true; }
    else { c.constrainLeft(rect.left + out.x); c.hit.left = true; }
    if (out.y < 0) { c.constrainBottom(rect.bottom + out.y); c.hit.bottom = true; hitsBottom.value = true; }
    else { c.constrainTop(rect.top + out.y); c.hit.top = true; }
    c.hit.slopeNormal = normal;
  }
  return true;
}

/** Collision movement of one object against the solid tilemaps and static rectangles. */
export interface CollisionWorld {
  /** the solid tilemap's tiles overlapping rect; x1,y1 are inclusive, x2,y2 exclusive */
  tilesOverlapping(rect: Rect): Array<{ x: number; y: number; bbox: Rect; solid: boolean; slope: number | null; unisolid: boolean; unisolidDir?: number }>;
  isFreeOfTiles(rect: Rect, ignoreUnisolid?: boolean): boolean;
}

export function moveWithCollision(world: CollisionWorld, movement: Vec, bbox: Rect, onSolid: (hit: CollisionHit) => void): void {
  const dest = bbox.clone();
  dest.move(movement);

  let constraints = new Constraints();
  for (let i = 0; i < 2; i++) {
    collectStatic(world, constraints, { x: 0, y: movement.y }, dest);
    if (!constraints.hasConstraints) break;
    if (constraints.positionBottom < Infinity) {
      const height = constraints.height;
      if (height >= bbox.height) dest.setBottom(constraints.positionBottom - EPSILON);
    } else if (constraints.positionTop > -Infinity) {
      dest.setTop(constraints.positionTop + EPSILON);
    }
  }
  if (constraints.hasConstraints && (constraints.hit.top || constraints.hit.bottom)) {
    constraints.hit.left = false;
    constraints.hit.right = false;
    onSolid(constraints.hit);
  }

  constraints = new Constraints();
  for (let i = 0; i < 2; i++) {
    collectStatic(world, constraints, movement, dest);
    if (!constraints.hasConstraints) break;
    const width = constraints.width;
    if (width < Infinity) {
      if (width + SHIFT_DELTA >= bbox.width) {
        const xmid = constraints.xMidpoint;
        dest.left = xmid - bbox.width / 2;
        dest.right = xmid + bbox.width / 2;
      }
    } else if (constraints.positionRight < Infinity) {
      dest.setRight(constraints.positionRight - EPSILON);
    } else if (constraints.positionLeft > -Infinity) {
      dest.setLeft(constraints.positionLeft + EPSILON);
    }
  }
  if (constraints.hasConstraints && (constraints.hit.left || constraints.hit.right || constraints.hit.top || constraints.hit.bottom)) {
    onSolid(constraints.hit);
  }

  bbox.setPos(dest.p1);
}

function unisolidSolid(dir: number, movement: Vec, position: Rect, tile: Rect): boolean {
  switch (dir & 3) {
    case 0: return movement.y > -EPSILON && (position.bottom - SHIFT_DELTA) <= tile.top;
    case 1: return movement.y < EPSILON && (position.top + SHIFT_DELTA) >= tile.bottom;
    case 2: return movement.x > -EPSILON && (position.right - SHIFT_DELTA) <= tile.left;
    default: return movement.x < EPSILON && (position.left + SHIFT_DELTA) >= tile.right;
  }
}

function collectStatic(world: CollisionWorld, c: Constraints, movement: Vec, dest: Rect): void {
  for (const t of world.tilesOverlapping(dest)) {
    if (!t.solid) continue;
    if (t.unisolid && !unisolidSolid(t.unisolidDir ?? 0, movement, dest, t.bbox)) continue;
    if (t.slope !== null) {
      rectangleAATriangle(c, dest, { bbox: t.bbox, dir: t.slope }, { value: false });
    } else {
      c.merge(checkCollisions(movement, dest, t.bbox));
    }
  }
}
