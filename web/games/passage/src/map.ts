// map.cpp: walls (a maze that gets denser further down), chests, their gems. Walls are cached in a
// 3000-entry hash table, and a cell's "all neighbours blocked" test reads that cache, so the maze
// depends on the order in which cells are first asked about: the port asks in the original's order.
import { HashTable } from './HashTable.ts';
import { noise3d } from './landscape.ts';

export const TILE_W = 8, TILE_H = 8;
export const CHEST_NONE = 0, CHEST_CLOSED = 1, CHEST_OPEN = 2;

/** C integer division (truncates toward zero) */
const idiv = (a: number, b: number) => Math.trunc(a / b);

export class GameMap {
  /** time(NULL) when the game started */
  seed = 0;
  private readonly blocked = new HashTable<boolean>(3000, false);
  private readonly openedChests: { x: number; y: number }[] = [];

  /** resetMap(): a new seed, no chest opened */
  reset(seed: number): void {
    this.seed = seed | 0;
    this.openedChests.length = 0;
    this.blocked.clear();
  }

  private allNeighborsBlocked(gx: number, gy: number): boolean {
    if (!this.isBlockedGridHash(gx, gy - 1, true)) return false; // top
    if (!this.isBlockedGridHash(gx + 1, gy, true)) return false; // right
    if (!this.isBlockedGridHash(gx, gy + 1, true)) return false; // bottom
    if (!this.isBlockedGridHash(gx - 1, gy, true)) return false; // left
    return true;
  }

  private isBlockedGridHash(gx: number, gy: number, doNotRecurse: boolean): boolean {
    const found = this.blocked.lookup(gx, gy);
    if (found !== undefined) return found;
    const b = this.isBlockedGrid(gx, gy, doNotRecurse);
    // only the full (recursive) answer is the real one, so only it is kept
    if (!doNotRecurse) this.blocked.insert(gx, gy, b);
    return b;
  }

  private isBlockedGrid(gx: number, gy: number, doNotRecurse: boolean): boolean {
    if (gx <= 0 || gy <= 0) return true; // wall along far left and top
    if (gy <= 1) return false; // empty passage at top
    if (gx % 2 !== 0 && gy % 2 !== 0) {
      // a grid of empty cells from which the maze is carved, unless all neighbours are walls
      return doNotRecurse ? false : this.allNeighborsBlocked(gx, gy);
    }
    const threshold = 1 - gy / 20.0; // blocks get denser as y increases
    if (noise3d(gx, gy, this.seed) > threshold) return true;
    return doNotRecurse ? false : this.allNeighborsBlocked(gx, gy);
  }

  isBlocked(x: number, y: number): boolean {
    return this.isBlockedGridHash(idiv(x, TILE_W), idiv(y, TILE_H), false);
  }

  isChest(x: number, y: number): number {
    const gx = idiv(x, TILE_W), gy = idiv(y, TILE_H);
    // denser further down, none above gridY 5, rarer than walls; another seed than the walls
    const threshold = 1 - (gy - 5) / 200.0;
    if (!(noise3d(Math.imul(73642, gx), Math.imul(283277, gy), Math.imul(this.seed, 987423)) > threshold)) return CHEST_NONE;
    for (const p of this.openedChests) if (p.x === gx && p.y === gy) return CHEST_OPEN;
    return CHEST_CLOSED;
  }

  /** six gem bits; emulates the original's two's-complement cast (and its tied gems), see map.cpp */
  getChestCode(x: number, y: number): number {
    const gx = idiv(x, TILE_W), gy = idiv(y, TILE_H);
    const r = noise3d(Math.imul(37462, gx), Math.imul(1747, gy), Math.imul(this.seed, 3748147));
    const casted = r < 0 ? (256 + Math.trunc(r * 15)) & 0xff : Math.trunc(r * 15) & 0xff;
    return casted & 0x3f;
  }

  getChestCenter(x: number, y: number): { x: number; y: number } {
    const gx = idiv(x, TILE_W), gy = idiv(y, TILE_H);
    return { x: gx * TILE_W + idiv(TILE_W, 2), y: gy * TILE_H + idiv(TILE_H, 2) };
  }

  openChest(x: number, y: number): void {
    this.openedChests.push({ x: idiv(x, TILE_W), y: idiv(y, TILE_H) });
  }
}
