// The port's pathfinder on the map's terrain.
//
// 0 A.D. uses 1 m navcells, a hierarchical long-range pathfinder and a vertex pathfinder with
// unit pushing (source/simulation2/helpers/*, CCmpPathfinder.cpp). The slice uses a 2 m grid with
// A* and line-of-sight smoothing, and simple separation between units. The passability values are
// the original's: passability class "default" has MaxWaterDepth 2, MaxTerrainSlope 1.0 and
// Clearance 0.8 (simulation/data/pathfinder.xml in the engine mod). The slope is
// CTerrain::GetSlopeFixed: (max-min of the tile's four corner heights) / 4 m / 92 units-per-metre.
import type { Terrain } from '../data/pmp.ts';
import { PATCH_SIZE } from '../data/pmp.ts';

export const NAV_CELL = 2;
const MAX_WATER_DEPTH = 2;
const MAX_SLOPE = 1.0;

interface Obstacle { x: number; z: number; halfW: number; halfD: number; circle: boolean }

export class NavGrid {
  readonly terrain: Terrain;
  readonly waterHeight: number | null;
  readonly cells: number;
  readonly size: number;
  readonly blocked: Uint8Array;
  private readonly obstacles: Obstacle[] = [];
  private readonly gScore: Float64Array;
  private readonly from: Int32Array;
  private readonly stamp: Int32Array;
  private generation = 0;

  constructor(terrain: Terrain, waterHeight: number | null) {
    this.terrain = terrain;
    this.waterHeight = waterHeight;
    this.size = Math.ceil(terrain.size / NAV_CELL);
    this.cells = this.size * this.size;
    this.blocked = new Uint8Array(this.cells);
    this.gScore = new Float64Array(this.cells);
    this.from = new Int32Array(this.cells);
    this.stamp = new Int32Array(this.cells);
    this.buildTerrain();
  }

  private buildTerrain(): void {
    const t = this.terrain;
    const tiles = t.tilesPerSide;
    const slopeBlocked = new Uint8Array(tiles * tiles);
    for (let tj = 0; tj < tiles; tj++) {
      for (let ti = 0; ti < tiles; ti++) {
        // CTerrain::GetSlopeFixed uses the four corners of the 4 m tile
        const i = ti, j = tj;
        const h00 = t.heights[j * t.verticesPerSide + i];
        const h01 = t.heights[(j + 1) * t.verticesPerSide + i];
        const h10 = t.heights[j * t.verticesPerSide + i + 1];
        const h11 = t.heights[(j + 1) * t.verticesPerSide + i + 1];
        const delta = Math.max(h00, h01, h10, h11) - Math.min(h00, h01, h10, h11);
        const slope = delta / 4 / 92;
        if (slope > MAX_SLOPE) slopeBlocked[j * tiles + i] = 1;
      }
    }
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        const x = (i + 0.5) * NAV_CELL;
        const z = (j + 0.5) * NAV_CELL;
        const ti = Math.min(tiles - 1, Math.floor(x / 4));
        const tj = Math.min(tiles - 1, Math.floor(z / 4));
        let blocked = slopeBlocked[tj * tiles + ti] === 1;
        if (!blocked && this.waterHeight !== null) {
          const depth = this.waterHeight - t.heightAt(x, z);
          if (depth > MAX_WATER_DEPTH) blocked = true;
        }
        this.blocked[j * this.size + i] = blocked ? 1 : 0;
      }
    }
  }

  index(x: number, z: number): number {
    const i = Math.max(0, Math.min(this.size - 1, Math.floor(x / NAV_CELL)));
    const j = Math.max(0, Math.min(this.size - 1, Math.floor(z / NAV_CELL)));
    return j * this.size + i;
  }

  cellCenter(index: number): { x: number; z: number } {
    const i = index % this.size;
    const j = Math.floor(index / this.size);
    return { x: (i + 0.5) * NAV_CELL, z: (j + 0.5) * NAV_CELL };
  }

  /** Mark a building/resource footprint; width/depth are the obstruction's, not the model's. */
  addObstacle(x: number, z: number, width: number, depth: number, circle = false): void {
    const halfW = Math.max(NAV_CELL * 0.5, width / 2);
    const halfD = Math.max(NAV_CELL * 0.5, depth / 2);
    this.obstacles.push({ x, z, halfW, halfD, circle });
    const i0 = Math.max(0, Math.floor((x - halfW) / NAV_CELL));
    const i1 = Math.min(this.size - 1, Math.floor((x + halfW) / NAV_CELL));
    const j0 = Math.max(0, Math.floor((z - halfD) / NAV_CELL));
    const j1 = Math.min(this.size - 1, Math.floor((z + halfD) / NAV_CELL));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const cx = (i + 0.5) * NAV_CELL;
        const cz = (j + 0.5) * NAV_CELL;
        if (circle) {
          if ((cx - x) ** 2 + (cz - z) ** 2 > halfW * halfW) continue;
        }
        this.blocked[j * this.size + i] = 1;
      }
    }
  }

  isBlocked(x: number, z: number): boolean {
    return this.blocked[this.index(x, z)] === 1;
  }

  /** Find the nearest unblocked cell centre to (x,z), searching rings of cells. */
  nearestFree(x: number, z: number, maxRadius = 15): { x: number; z: number } | null {
    const ci = Math.max(0, Math.min(this.size - 1, Math.floor(x / NAV_CELL)));
    const cj = Math.max(0, Math.min(this.size - 1, Math.floor(z / NAV_CELL)));
    for (let r = 0; r <= maxRadius; r++) {
      let best: { x: number; z: number; d: number } | null = null;
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
          const i = ci + di, j = cj + dj;
          if (i < 0 || j < 0 || i >= this.size || j >= this.size) continue;
          const idx = j * this.size + i;
          if (this.blocked[idx]) continue;
          const c = this.cellCenter(idx);
          const d = (c.x - x) ** 2 + (c.z - z) ** 2;
          if (!best || d < best.d) best = { ...c, d };
        }
      }
      if (best) return { x: best.x, z: best.z };
    }
    return null;
  }

  /** Whether a rectangular/circular footprint centred at (x,z) is free of static blockers. */
  freeArea(x: number, z: number, width: number, depth: number, circle = false): boolean {
    const halfW = Math.max(NAV_CELL * 0.5, width / 2);
    const halfD = Math.max(NAV_CELL * 0.5, depth / 2);
    const i0 = Math.floor((x - halfW) / NAV_CELL), i1 = Math.floor((x + halfW) / NAV_CELL);
    const j0 = Math.floor((z - halfD) / NAV_CELL), j1 = Math.floor((z + halfD) / NAV_CELL);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (i < 0 || j < 0 || i >= this.size || j >= this.size) return false;
        const cx = (i + 0.5) * NAV_CELL, cz = (j + 0.5) * NAV_CELL;
        if (circle && (cx - x) ** 2 + (cz - z) ** 2 > halfW * halfW) continue;
        if (this.blocked[j * this.size + i]) return false;
      }
    }
    return true;
  }

  lineClear(x0: number, z0: number, x1: number, z1: number): boolean {
    const dx = x1 - x0, dz = z1 - z0;
    const dist = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(dist / (NAV_CELL * 0.45)));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      if (this.isBlocked(x0 + dx * t, z0 + dz * t)) return false;
    }
    return true;
  }

  /**
   * A* from (sx,sz) to (gx,gz). The goal is moved to the nearest free cell, so a unit can walk to
   * the edge of a tree or foundation. Returns world-space waypoints, smoothed.
   */
  findPath(sx: number, sz: number, gx: number, gz: number, maxNodes = 120000): { x: number; z: number }[] | null {
    const start = this.nearestFree(sx, sz, 2);
    const goal = this.nearestFree(gx, gz, 15);
    if (!start || !goal) return null;
    const si = this.index(start.x, start.z);
    const gi = this.index(goal.x, goal.z);
    if (si === gi) return [goal];
    this.generation++;
    const gen = this.generation;
    const open = new MinHeap();
    this.gScore[si] = 0;
    this.from[si] = -1;
    this.stamp[si] = gen;
    open.push(si, this.heuristic(si, gi));
    let visited = 0;
    while (open.size > 0) {
      const current = open.pop();
      if (current === gi) {
        const raw: number[] = [];
        for (let n = current; n !== -1; n = this.from[n]) raw.push(n);
        raw.reverse();
        const pts = raw.map((n) => this.cellCenter(n));
        pts[pts.length - 1] = goal;
        return this.smooth(start, pts);
      }
      if (++visited > maxNodes) return null;
      const ci = current % this.size, cj = Math.floor(current / this.size);
      const g = this.gScore[current];
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const ni = ci + di, nj = cj + dj;
          if (ni < 0 || nj < 0 || ni >= this.size || nj >= this.size) continue;
          const n = nj * this.size + ni;
          if (this.blocked[n]) continue;
          if (di && dj) {
            // no corner cutting: both orthogonal neighbours must be free
            if (this.blocked[cj * this.size + ni] || this.blocked[nj * this.size + ci]) continue;
          }
          const step = di && dj ? 1.41421356 : 1;
          const ng = g + step;
          if (this.stamp[n] === gen && ng >= this.gScore[n]) continue;
          this.stamp[n] = gen;
          this.gScore[n] = ng;
          this.from[n] = current;
          open.push(n, ng + this.heuristic(n, gi));
        }
      }
    }
    return null;
  }

  private heuristic(a: number, b: number): number {
    const ai = a % this.size, aj = Math.floor(a / this.size);
    const bi = b % this.size, bj = Math.floor(b / this.size);
    const dx = Math.abs(ai - bi), dz = Math.abs(aj - bj);
    return (dx + dz) + (1.41421356 - 2) * Math.min(dx, dz);
  }

  private smooth(start: { x: number; z: number }, pts: { x: number; z: number }[]): { x: number; z: number }[] {
    const out: { x: number; z: number }[] = [];
    let anchor = start;
    let i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      for (; j > i; j--) {
        if (this.lineClear(anchor.x, anchor.z, pts[j].x, pts[j].z)) break;
      }
      out.push(pts[j]);
      anchor = pts[j];
      i = j + 1;
    }
    return out;
  }

  /** Free cells in a ring around (x,z), for placing a trained unit or a building. */
  freeSpot(x: number, z: number, radius: number, rng: { next(): number }): { x: number; z: number } | null {
    for (let attempt = 0; attempt < 40; attempt++) {
      const angle = rng.next() * Math.PI * 2;
      const dist = radius + rng.next() * radius;
      const px = x + Math.cos(angle) * dist;
      const pz = z + Math.sin(angle) * dist;
      if (!this.isBlocked(px, pz)) return { x: px, z: pz };
    }
    return this.nearestFree(x, z, 12);
  }
}

class MinHeap {
  private readonly items: number[] = [];
  private readonly priority: number[] = [];
  get size(): number { return this.items.length; }
  push(item: number, p: number): void {
    this.items.push(item);
    this.priority.push(p);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.priority[parent] <= this.priority[i]) break;
      this.swap(parent, i);
      i = parent;
    }
  }
  pop(): number {
    const top = this.items[0];
    const lastItem = this.items.pop()!;
    const lastP = this.priority.pop()!;
    if (this.items.length) {
      this.items[0] = lastItem;
      this.priority[0] = lastP;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let best = i;
        if (l < this.items.length && this.priority[l] < this.priority[best]) best = l;
        if (r < this.items.length && this.priority[r] < this.priority[best]) best = r;
        if (best === i) break;
        this.swap(best, i);
        i = best;
      }
    }
    return top;
  }
  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
    [this.priority[a], this.priority[b]] = [this.priority[b], this.priority[a]];
  }
}

export { PATCH_SIZE };
