// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonWallsTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Terrain, DungeonTileSheet;

export class DungeonWallsTilemap extends DungeonTilemap {
  static skipCells: HashSet<number> = null;
  _DungeonWallsTilemap(): this {
    this._DungeonTilemap(Dungeon.level.tilesTex());
    DungeonWallsTilemap.skipCells.clear();
    this.map(Dungeon.level.map_, Dungeon.level.width());
    return this;
  }
  getTileVisual(pos: number, tile: number, flat: boolean): number {
    if (flat) {
      return -1;
    }
    if (DungeonTileSheet.wallStitcheable(tile)) {
      if (((pos + this.mapWidth) | 0) < this.size_ && !(DungeonTileSheet.wallStitcheable(this.map_[(pos + this.mapWidth) | 0]))) {
        if ((this.map_[(pos + this.mapWidth) | 0]) === Terrain.DOOR) {
          return DungeonTileSheet.DOOR_SIDEWAYS;
        } else if ((this.map_[(pos + this.mapWidth) | 0]) === Terrain.LOCKED_DOOR) {
          return DungeonTileSheet.DOOR_SIDEWAYS_LOCKED;
        } else if ((this.map_[(pos + this.mapWidth) | 0]) === Terrain.HERO_LKD_DR) {
          return DungeonTileSheet.DOOR_SIDEWAYS_LOCKED;
        } else if ((this.map_[(pos + this.mapWidth) | 0]) === Terrain.CRYSTAL_DOOR) {
          return DungeonTileSheet.DOOR_SIDEWAYS_CRYSTAL;
        } else if ((this.map_[(pos + this.mapWidth) | 0]) === Terrain.OPEN_DOOR) {
          return DungeonTileSheet.NULL_TILE;
        }
      } else {
        return DungeonTileSheet.stitchInternalWallTile(tile, ((pos + 1) | 0) % this.mapWidth !== 0 ? this.map_[(pos + 1) | 0] : -1, ((pos + 1) | 0) % this.mapWidth !== 0 && ((pos + this.mapWidth) | 0) < this.size_ ? this.map_[(pos + 1 + this.mapWidth) | 0] : -1, ((pos + this.mapWidth) | 0) < this.size_ ? this.map_[(pos + this.mapWidth) | 0] : -1, pos % this.mapWidth !== 0 && ((pos + this.mapWidth) | 0) < this.size_ ? this.map_[(pos - 1 + this.mapWidth) | 0] : -1, pos % this.mapWidth !== 0 ? this.map_[(pos - 1) | 0] : -1);
      }
    }
    if (DungeonWallsTilemap.skipCells.contains(pos)) {
      return -1;
    }
    if (this.map_[pos] === Terrain.LOCKED_EXIT || this.map_[pos] === Terrain.UNLOCKED_EXIT) {
      return DungeonTileSheet.EXIT_UNDERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && DungeonTileSheet.wallStitcheable(this.map_[(pos + this.mapWidth) | 0])) {
      return DungeonTileSheet.stitchWallOverhangTile(tile, ((pos + 1) | 0) % this.mapWidth !== 0 ? this.map_[(pos + 1 + this.mapWidth) | 0] : -1, this.map_[(pos + this.mapWidth) | 0], pos % this.mapWidth !== 0 ? this.map_[(pos - 1 + this.mapWidth) | 0] : -1);
    } else if (Dungeon.level.insideMap(pos) && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.DOOR) {
      return DungeonTileSheet.DOOR_OVERHANG;
    } else if (Dungeon.level.insideMap(pos) && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.LOCKED_DOOR) {
      return DungeonTileSheet.DOOR_OVERHANG;
    } else if (Dungeon.level.insideMap(pos) && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.HERO_LKD_DR) {
      return DungeonTileSheet.DOOR_OVERHANG;
    } else if (Dungeon.level.insideMap(pos) && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.OPEN_DOOR) {
      return DungeonTileSheet.DOOR_OVERHANG_OPEN;
    } else if (Dungeon.level.insideMap(pos) && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.CRYSTAL_DOOR) {
      return DungeonTileSheet.DOOR_OVERHANG_CRYSTAL;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.STATUE) {
      return DungeonTileSheet.STATUE_OVERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.STATUE_SP) {
      return DungeonTileSheet.STATUE_SP_OVERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.REGION_DECO) {
      return DungeonTileSheet.REGION_DECO_OVERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.REGION_DECO_ALT) {
      return DungeonTileSheet.REGION_DECO_ALT_OVERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.MINE_CRYSTAL) {
      return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.MINE_CRYSTAL_OVERHANG_BLUE, (pos + this.mapWidth) | 0);
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.MINE_BOULDER) {
      return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.MINE_BOULDER_OVERHANG, (pos + this.mapWidth) | 0);
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.ALCHEMY) {
      return DungeonTileSheet.ALCHEMY_POT_OVERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.BARRICADE) {
      return DungeonTileSheet.BARRICADE_OVERHANG;
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.HIGH_GRASS) {
      return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.HIGH_GRASS_OVERHANG, (pos + this.mapWidth) | 0);
    } else if (((pos + this.mapWidth) | 0) < this.size_ && (this.map_[(pos + this.mapWidth) | 0]) === Terrain.FURROWED_GRASS) {
      return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.FURROWED_OVERHANG, (pos + this.mapWidth) | 0);
    }
    return -1;
  }
  overlapsPoint(x: number, y: number): boolean {
    return true;
  }
  overlapsScreenPoint(x: number, y: number): boolean {
    return true;
  }
  static $clinit() {
    DungeonWallsTilemap.skipCells = new HashSet();
  }
}

$J.define(DungeonWallsTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonWallsTilemap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', ctors: { '': '_DungeonWallsTilemap' }, clinit: true, lazy: ['skipCells'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
});
