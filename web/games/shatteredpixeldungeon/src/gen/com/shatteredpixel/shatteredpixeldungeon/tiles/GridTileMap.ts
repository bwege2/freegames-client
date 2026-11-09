// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/GridTileMap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { DungeonTilemap } from './DungeonTilemap.ts';

let Assets$Environment, Dungeon, SPDSettings, Terrain, DungeonTileSheet;

export class GridTileMap extends DungeonTilemap {
  gridSetting: number = 0;
  _GridTileMap(): this {
    this._DungeonTilemap(Assets$Environment.VISUAL_GRID);
    this.gridSetting = -1;
    this.map(Dungeon.level.map_, Dungeon.level.width());
    return this;
  }
  updateMap(): void {
    this.gridSetting = SPDSettings.visualGrid$();
    super.updateMap();
  }
  getTileVisual(pos: number, tile: number, flat: boolean): number {
    if (this.gridSetting === -1 || (pos % this.mapWidth) % 2 !== ($J.idiv(pos, this.mapWidth)) % 2) {
      return -1;
    } else if (DungeonTileSheet.floorTile(tile) || tile === Terrain.HIGH_GRASS || tile === Terrain.FURROWED_GRASS) {
      return this.gridSetting;
    } else if (DungeonTileSheet.doorTile(tile)) {
      if (DungeonTileSheet.wallStitcheable(this.map_[(pos - this.mapWidth) | 0])) {
        return (12 + this.gridSetting) | 0;
      } else if (tile === Terrain.OPEN_DOOR) {
        return (8 + this.gridSetting) | 0;
      } else {
        return (4 + this.gridSetting) | 0;
      }
    } else {
      return -1;
    }
  }
}

$J.define(GridTileMap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.GridTileMap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', ctors: { '': '_GridTileMap' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
});
