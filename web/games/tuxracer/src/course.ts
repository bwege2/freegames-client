// A Tux Racer course: the original's course.tcl parameters, elevation/terrain/tree bitmaps
// (converted by re/tuxracer/fetch.sh) and the derived geometry and object placements, exactly as
// src/course_load.c and src/course_render.c calculate them.
import {
  add, cross, normalize, point, scale, subtract, vec,
  type Plane, type Point3, type Vec3,
} from './math3.ts';

export const ICE = 0, ROCK = 1, SNOW = 2;
export type Terrain = 0 | 1 | 2;

export interface CourseConfig {
  id: string;
  name: string;
  author: string;
  width: number;
  length: number;
  playWidth: number;
  playLength: number;
  startX: number;
  startY: number;
  angle: number;
  elevScale: number;
  baseHeight: number;
  elev: string;
  terrain: string;
  friction: number[];
}

export interface TreeType {
  name: string; diam: number; height: number; vary: number;
  rgb: [number, number, number]; texture: string;
}
export interface ItemType {
  name: string; diam: number; height: number; aboveGround: number;
  rgb: [number, number, number]; collectable: boolean; drawable: boolean;
  texture: string;
}

/** The tree and item types of courses/common/courseinit.tcl, in the order it defines them. */
export const TREE_TYPES: TreeType[] = [
  { name: 'tree3', diam: 1.4, height: 1.0, vary: 0.5, rgb: [0, 255, 48], texture: 'shrub' },
  { name: 'tree1', diam: 1.4, height: 2.5, vary: 0.5, rgb: [255, 255, 255], texture: 'tree' },
  { name: 'tree2', diam: 1.4, height: 2.5, vary: 0.5, rgb: [255, 96, 0], texture: 'tree_barren' },
];
export const ITEM_TYPES: ItemType[] = [
  { name: 'herring', diam: 1.0, height: 1.0, aboveGround: 0.2, rgb: [28, 185, 204], collectable: true, drawable: true, texture: 'herring_standard' },
  { name: 'flag', diam: 1.0, height: 1.0, aboveGround: 0, rgb: [194, 40, 40], collectable: false, drawable: true, texture: 'flag' },
  { name: 'finish', diam: 9.0, height: 6.0, aboveGround: 0, rgb: [255, 255, 0], collectable: false, drawable: true, texture: 'finish' },
  { name: 'start', diam: 9.0, height: 6.0, aboveGround: 0, rgb: [128, 128, 0], collectable: false, drawable: true, texture: 'start' },
  { name: 'float', diam: 0.8, height: 0.5, aboveGround: 0, rgb: [255, 128, 255], collectable: false, drawable: false, texture: 'float' },
];

export interface Tree {
  x: number; y: number; z: number;
  height: number; diam: number; type: number;
}
export interface Item {
  x: number; y: number; z: number;
  height: number; diam: number; type: number;
  collectable: boolean; drawable: boolean;
  collected: boolean;
}

export interface RawImage { w: number; h: number; data: Uint8Array }

/** The original's .rgb-derived binary: u16 width, u16 height, then the channels row by row. */
export function decodeImage(buffer: ArrayBuffer): RawImage {
  const view = new DataView(buffer);
  const w = view.getUint16(0, true);
  const h = view.getUint16(2, true);
  return { w, h, data: new Uint8Array(buffer, 4) };
}

function intensityToTerrain(intensity: number): Terrain {
  const dist = [Math.abs(intensity - 0), Math.abs(intensity - 127), Math.abs(intensity - 255)];
  let min = dist[0];
  let minIdx = 0;
  for (let i = 1; i < 3; i++) if (dist[i] < min) { min = dist[i]; minIdx = i; }
  return minIdx as Terrain;
}

export class Course {
  readonly cfg: CourseConfig;
  readonly nx: number;
  readonly ny: number;
  readonly elevation: Float64Array;
  readonly terrain: Uint8Array;
  readonly normals: Vec3[];
  readonly trees: Tree[] = [];
  readonly items: Item[] = [];
  readonly friction: number[];
  readonly mirrored: boolean;
  readonly startX: number;

  private lastX = Number.NaN;
  private lastZ = Number.NaN;
  private lastY = 0;

  constructor(cfg: CourseConfig, elev: RawImage, terrain: RawImage, trees: RawImage, random: () => number = Math.random, options?: { mirror?: boolean }) {
    this.cfg = cfg;
    this.nx = elev.w;
    this.ny = elev.h;
    if (terrain.w !== this.nx || terrain.h !== this.ny) throw new Error(`${cfg.id}: terrain and elevation differ`);
    this.friction = cfg.friction;
    const slope = Math.tan((Math.PI / 180) * cfg.angle);
    this.elevation = new Float64Array(this.nx * this.ny);
    const px = elev.data;
    // course_load.c, elev_cb(): the image is turned around (both axes) and tilted by the course angle
    for (let y = 0; y < this.ny; y++) {
      for (let x = 0; x < this.nx; x++) {
        this.elevation[(this.nx - 1 - x) + this.nx * (this.ny - 1 - y)] =
          ((px[x + this.nx * y] - cfg.baseHeight) / 255.0) * cfg.elevScale -
          ((this.ny - 1 - y) / this.ny) * cfg.length * slope;
      }
    }
    this.terrain = new Uint8Array(this.nx * this.ny);
    const tp = terrain.data;
    for (let y = 0; y < this.ny; y++) {
      for (let x = 0; x < this.nx; x++) {
        this.terrain[(this.nx - 1 - x) + this.nx * (this.ny - 1 - y)] = intensityToTerrain(tp[x + this.nx * y]);
      }
    }
    this.placeObjects(trees, random);
    this.mirrored = !!options?.mirror;
    if (this.mirrored) {
      const elev = new Float64Array(this.nx * this.ny);
      const terr = new Uint8Array(this.nx * this.ny);
      for (let y = 0; y < this.ny; y++) {
        for (let x = 0; x < this.nx; x++) {
          elev[x + this.nx * y] = this.elevation[(this.nx - 1 - x) + this.nx * y];
          terr[x + this.nx * y] = this.terrain[(this.nx - 1 - x) + this.nx * y];
        }
      }
      this.elevation = elev;
      this.terrain = terr;
      for (const t of this.trees) t.x = this.cfg.width - t.x;
      for (const it of this.items) it.x = this.cfg.width - it.x;
    }
    this.normals = this.calcNormals();
    this.startX = this.mirrored ? this.cfg.width - this.cfg.startX : this.cfg.startX;
    this.lastX = Number.NaN;
  }

  elevationAt(x: number, y: number): number { return this.elevation[x + this.nx * y]; }

  vertex(x: number, y: number): Point3 {
    return point((x / (this.nx - 1)) * this.cfg.width, this.elevationAt(x, y),
      -(y / (this.ny - 1)) * this.cfg.length);
  }

  private calcNormals(): Vec3[] {
    const nmls: Vec3[] = new Array(this.nx * this.ny);
    const P = (x: number, y: number) => this.vertex(x, y);
    for (let y = 0; y < this.ny; y++) {
      for (let x = 0; x < this.nx; x++) {
        let nml = vec(0, 0, 0);
        const p0 = P(x, y);
        const addNormal = (p1: Point3, p2: Point3, swap = false) => {
          const v1 = subtract(p1, p0);
          const v2 = subtract(p2, p0);
          const n = swap ? cross(v1, v2) : cross(v2, v1);
          normalize(n);
          nml = add(nml, n);
        };
        if ((x + y) % 2 === 0) {
          if (x > 0 && y > 0) {
            addNormal(P(x, y - 1), P(x - 1, y - 1));
            addNormal(P(x - 1, y - 1), P(x - 1, y));
          }
          if (x > 0 && y < this.ny - 1) {
            addNormal(P(x - 1, y), P(x - 1, y + 1));
            addNormal(P(x - 1, y + 1), P(x, y + 1));
          }
          if (x < this.nx - 1 && y > 0) {
            addNormal(P(x + 1, y), P(x + 1, y - 1));
            addNormal(P(x + 1, y - 1), P(x, y - 1));
          }
          if (x < this.nx - 1 && y < this.ny - 1) {
            addNormal(P(x + 1, y), P(x + 1, y + 1), true);
            addNormal(P(x + 1, y + 1), P(x, y + 1), true);
          }
        } else {
          if (x > 0 && y > 0) addNormal(P(x, y - 1), P(x - 1, y));
          if (x > 0 && y < this.ny - 1) addNormal(P(x - 1, y), P(x, y + 1));
          if (x < this.nx - 1 && y > 0) addNormal(P(x + 1, y), P(x, y - 1));
          if (x < this.nx - 1 && y < this.ny - 1) addNormal(P(x + 1, y), P(x, y + 1), true);
        }
        normalize(nml);
        nmls[x + this.nx * y] = nml;
      }
    }
    return nmls;
  }

  /** The original's tree/item placement: colours in trees.rgb, grouped by type, heights randomised. */
  private placeObjects(image: RawImage, random: () => number): void {
    const positions: { x: number; y: number }[][] = TREE_TYPES.map(() => []);
    const itemPositions: { x: number; y: number }[][] = ITEM_TYPES.map(() => []);
    const sx = image.w;
    const sy = image.h;
    for (let y = 0; y < sy; y++) {
      for (let x = 0; x < sx; x++) {
        const i = (x + sx * y) * 3;
        const r = image.data[i], g = image.data[i + 1], b = image.data[i + 2];
        let bestTree = r + g + b;
        let treeType = -1;
        let bestItem = r + g + b;
        let itemType = -1;
        TREE_TYPES.forEach((t, k) => {
          const d = Math.abs(t.rgb[0] - r) + Math.abs(t.rgb[1] - g) + Math.abs(t.rgb[2] - b);
          if (d < bestTree) { bestTree = d; treeType = k; }
        });
        ITEM_TYPES.forEach((t, k) => {
          const d = Math.abs(t.rgb[0] - r) + Math.abs(t.rgb[1] - g) + Math.abs(t.rgb[2] - b);
          if (d < bestItem) { bestItem = d; itemType = k; }
        });
        if (bestTree < bestItem && treeType >= 0) {
          positions[treeType].push({
            x: ((sx - x) / (sx - 1)) * this.cfg.width,
            y: (-(sy - y) / (sy - 1)) * this.cfg.length,
          });
        } else if (itemType >= 0) {
          itemPositions[itemType].push({
            x: ((sx - x) / (sx - 1)) * this.cfg.width,
            y: (-(sy - y) / (sy - 1)) * this.cfg.length,
          });
        }
      }
    }
    const rand = () => random();
    positions.forEach((list, type) => {
      const t = TREE_TYPES[type];
      for (const p of list) {
        let height = (rand() * t.vary * 2) - t.vary;
        height = t.height + height * t.height;
        this.trees.push({
          x: p.x, z: p.y, y: this.findY(p.x, p.y), height,
          diam: (height / t.height) * t.diam, type,
        });
      }
    });
    itemPositions.forEach((list, type) => {
      const t = ITEM_TYPES[type];
      for (const p of list) {
        this.items.push({
          x: p.x, z: p.y, y: this.findY(p.x, p.y) + t.aboveGround,
          height: t.height, diam: t.diam, type,
          collectable: t.collectable, drawable: t.drawable, collected: false,
        });
      }
    });
  }

  get minY(): number {
    return -this.cfg.length * Math.tan((Math.PI / 180) * this.cfg.angle);
  }

  indicesForPoint(x: number, z: number): { x0: number; y0: number; x1: number; y1: number } {
    const nx = this.nx, ny = this.ny;
    let xidx = (x / this.cfg.width) * (nx - 1);
    let yidx = (-z / this.cfg.length) * (ny - 1);
    if (xidx < 0) xidx = 0; else if (xidx > nx - 1) xidx = nx - 1;
    if (yidx < 0) yidx = 0; else if (yidx > ny - 1) yidx = ny - 1;
    let x0 = Math.trunc(xidx);
    let x1 = Math.trunc(xidx + 0.9999);
    let y0 = Math.trunc(yidx);
    let y1 = Math.trunc(yidx + 0.9999);
    if (x0 === x1) { if (x1 < nx - 1) x1++; else x0--; }
    if (y0 === y1) { if (y1 < ny - 1) y1++; else y0--; }
    return { x0, y0, x1, y1 };
  }

  /** The original's find_barycentric_coords: triangle index, u and v. */
  barycentric(x: number, z: number): { idx0: { i: number; j: number }; idx1: { i: number; j: number }; idx2: { i: number; j: number }; u: number; v: number } {
    const nx = this.nx, ny = this.ny;
    const { x0, y0, x1, y1 } = this.indicesForPoint(x, z);
    const xidx = (x / this.cfg.width) * (nx - 1);
    const yidx = (-z / this.cfg.length) * (ny - 1);
    let idx0: { i: number; j: number }, idx1: { i: number; j: number }, idx2: { i: number; j: number };
    if ((x0 + y0) % 2 === 0) {
      if (yidx - y0 < xidx - x0) {
        idx0 = { i: x0, j: y0 }; idx1 = { i: x1, j: y0 }; idx2 = { i: x1, j: y1 };
      } else {
        idx0 = { i: x1, j: y1 }; idx1 = { i: x0, j: y1 }; idx2 = { i: x0, j: y0 };
      }
    } else if (yidx - y0 + xidx - x0 < 1) {
      idx0 = { i: x0, j: y0 }; idx1 = { i: x1, j: y0 }; idx2 = { i: x0, j: y1 };
    } else {
      idx0 = { i: x1, j: y1 }; idx1 = { i: x0, j: y1 }; idx2 = { i: x1, j: y0 };
    }
    const dx = idx0.i - idx2.i, dz = idx0.j - idx2.j;
    const ex = idx1.i - idx2.i, ez = idx1.j - idx2.j;
    const qx = xidx - idx2.i, qz = yidx - idx2.j;
    const invdet = 1.0 / (dx * ez - dz * ex);
    return { idx0, idx1, idx2, u: (qx * ez - qz * ex) * invdet, v: (qz * dx - qx * dz) * invdet };
  }

  findY(x: number, z: number): number {
    if (this.lastX === x && this.lastZ === z) return this.lastY;
    const { idx0, idx1, idx2, u, v } = this.barycentric(x, z);
    const p0 = this.vertex(idx0.i, idx0.j);
    const p1 = this.vertex(idx1.i, idx1.j);
    const p2 = this.vertex(idx2.i, idx2.j);
    const y = u * p0.y + v * p1.y + (1 - u - v) * p2.y;
    this.lastX = x; this.lastZ = z; this.lastY = y;
    return y;
  }

  findNormal(x: number, z: number): Vec3 {
    const { idx0, idx1, idx2, u, v } = this.barycentric(x, z);
    const n0 = this.normals[idx0.i + this.nx * idx0.j];
    const n1 = this.normals[idx1.i + this.nx * idx1.j];
    const n2 = this.normals[idx2.i + this.nx * idx2.j];
    const p0 = this.vertex(idx0.i, idx0.j);
    const p1 = this.vertex(idx1.i, idx1.j);
    const p2 = this.vertex(idx2.i, idx2.j);
    let smooth = add(scale(u, n0), add(scale(v, n1), scale(1 - u - v, n2)));
    const tri = cross(subtract(p1, p0), subtract(p2, p0));
    normalize(tri);
    const minBary = Math.min(u, Math.min(v, 1 - u - v));
    const interp = Math.min(minBary / 0.05, 1.0);
    const n = add(scale(interp, tri), scale(1 - interp, smooth));
    normalize(n);
    return n;
  }

  surfaceWeights(x: number, z: number): [number, number, number] {
    const { idx0, idx1, idx2, u, v } = this.barycentric(x, z);
    const w: [number, number, number] = [0, 0, 0];
    const t0 = this.terrain[idx0.i + this.nx * idx0.j];
    const t1 = this.terrain[idx1.i + this.nx * idx1.j];
    const t2 = this.terrain[idx2.i + this.nx * idx2.j];
    w[t0] += u;
    w[t1] += v;
    w[t2] += 1 - u - v;
    return w;
  }

  localPlane(pt: Point3): Plane {
    const p = point(pt.x, this.findY(pt.x, pt.z), pt.z);
    const nml = this.findNormal(p.x, p.z);
    return { nml, d: -(nml.x * p.x + nml.y * p.y + nml.z * p.z) };
  }

  get compressionDepth(): number { return 0; } // per-surface, see compressionFor()
}

export function compressionFor(surface: Terrain): number {
  switch (surface) {
    case ICE: return 0.03;
    case ROCK: return 0.01;
    case SNOW: return 0.11;
    default: return 0;
  }
}
