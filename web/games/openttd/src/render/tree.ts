// Tree sprite selection, following DrawTile_Trees in src/tree_cmd.cpp and the
// original tables in src/table/tree_land.h (generated into treetable.ts).
import { getTreeCount, getTreeDensity, getTreeGround, getTreeGrowth, getTreeType, TreeGround } from '../sim/trees.ts';
import type { World } from '../sim/world.ts';
import { TREE_LAYOUT_SPRITE, TREE_LAYOUT_XY } from './treetable.ts';

const TREE_SUB_ARCTIC = 0x0c;
const TREE_RAINFOREST = 0x14;

export interface TreeSprite {
  id: number;
  /** Offset within the tile, in pixels. */
  x: number;
  y: number;
  palette: string;
}

function countBits(v: number): number {
  let n = v >>> 0;
  n = n - ((n >>> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
  n = (n + (n >>> 4)) & 0x0f0f0f0f;
  return Math.imul(n, 0x01010101) >>> 24;
}

/** The trees drawn on a tree tile, in the original's drawing order. */
export function treeSprites(world: World, tile: number): TreeSprite[] {
  const tmp = countBits(tile + world.tileX(tile) * 16 + world.tileY(tile) * 16);
  let index = (tmp & 3) + (getTreeType(world, tile) << 2);
  const ground = getTreeGround(world, tile);
  const density = getTreeDensity(world, tile);
  if ((ground === TreeGround.SnowDesert || ground === TreeGround.RoughSnow) && density >= 2 &&
      index >= TREE_SUB_ARCTIC << 2 && index < TREE_RAINFOREST << 2) {
    index += 164 - (TREE_SUB_ARCTIC << 2);
  }
  const row = TREE_LAYOUT_SPRITE[index];
  if (!row) return [];
  const pos = TREE_LAYOUT_XY[(tmp >> 2) & 3];
  const count = getTreeCount(world, tile);
  const growth = getTreeGrowth(world, tile);

  const list: TreeSprite[] = [];
  for (let i = 0; i < count; i++) {
    const [base, palette] = row[i];
    list.push({
      id: base + (i === count - 1 ? growth : 3),
      x: pos[i][0],
      y: pos[i][1],
      palette,
    });
  }

  // The original picks the smallest x+y first, ties by lowest index, and
  // replaces the picked entry with the last one.
  const out: TreeSprite[] = [];
  while (list.length > 0) {
    let min = list[0].x + list[0].y;
    let mi = 0;
    for (let i = 1; i < list.length; i++) {
      if (list[i].x + list[i].y < min) {
        min = list[i].x + list[i].y;
        mi = i;
      }
    }
    out.push(list[mi]);
    list[mi] = list[list.length - 1];
    list.pop();
  }
  return out;
}
