// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/RaisedTerrainTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, HashSet } from '../../../../../jre/index.ts';
import { DungeonTilemap } from './DungeonTilemap.ts';

let Assets$Environment, Dungeon, Terrain, DungeonTileSheet;

export class RaisedTerrainTilemap extends DungeonTilemap {
  static skipCells: HashSet<number> = null;
  _RaisedTerrainTilemap(): this {
    this._DungeonTilemap(Assets$Environment.RAISED_TERRAIN);
    RaisedTerrainTilemap.skipCells.clear();
    this.map(Dungeon.level.map_, Dungeon.level.width());
    return this;
  }
  getTileVisual(pos: number, tile: number, flat: boolean): number {
    if (flat) {
      return -1;
    }
    if (RaisedTerrainTilemap.skipCells.contains(pos)) {
      return -1;
    }
    let region = $J.idiv(((Dungeon.depth - 1) | 0), 5);
    let regionOffset = Math.imul(region, 4);
    if (tile === Terrain.HIGH_GRASS) {
      if (DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_HIGH_GRASS, pos) === DungeonTileSheet.RAISED_HIGH_GRASS_ALT) {
        return (regionOffset + 2) | 0;
      } else {
        return regionOffset;
      }
    } else if (tile === Terrain.FURROWED_GRASS) {
      if (DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_FURROWED_GRASS, pos) === DungeonTileSheet.RAISED_FURROWED_ALT) {
        return (regionOffset + 1 + 2) | 0;
      } else {
        return (regionOffset + 1) | 0;
      }
    }
    return -1;
  }
  static $clinit() {
    RaisedTerrainTilemap.skipCells = new HashSet();
  }
}

$J.define(RaisedTerrainTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.RaisedTerrainTilemap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', ctors: { '': '_RaisedTerrainTilemap' }, clinit: true, lazy: ['skipCells'] });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
});
