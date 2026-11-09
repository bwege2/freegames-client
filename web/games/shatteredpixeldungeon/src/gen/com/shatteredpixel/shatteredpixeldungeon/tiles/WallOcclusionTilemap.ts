// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/WallOcclusionTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Environment, Dungeon, Terrain, DungeonTileSheet;

export class WallOcclusionTilemap extends DungeonTilemap {
  static readonly SIZE: number = 16;
  static readonly CLEARED: number = 0;
  static readonly EMPTY: number = 0;
  static readonly DOOR_VERT: number = 6;
  static readonly DOOR_HORIZ: number = 7;
  static readonly WALL_ABOVE: number = 40;
  static readonly WALL_LEFT_BELOW: number = 1;
  static readonly WALL_LEFT: number = 2;
  static readonly WALL_LEFT_ABOVE: number = 3;
  static readonly WALL_LEFT_BOTH: number = 4;
  static readonly WALL_RIGHT_BELOW: number = 8;
  static readonly WALL_RIGHT: number = 16;
  static readonly WALL_RIGHT_ABOVE: number = 24;
  static readonly WALL_RIGHT_BOTH: number = 32;
  _WallOcclusionTilemap(): this {
    this._DungeonTilemap(Assets$Environment.OCCLUSION_SHADOWS);
    this.map(Dungeon.level.map_, Dungeon.level.width());
    return this;
  }
  getTileVisual(pos: number, tile: number, flat: boolean): number {
    if (!Dungeon.level.insideMap(pos) || !Dungeon.level.discoverable[pos]) {
      return WallOcclusionTilemap.CLEARED;
    }
    let curr = WallOcclusionTilemap.EMPTY;
    if (DungeonTileSheet.doorTile(tile)) {
      if (this.wall((pos - 1) | 0) && this.wall((pos + 1) | 0)) {
        curr = WallOcclusionTilemap.DOOR_HORIZ;
      } else {
        curr = WallOcclusionTilemap.DOOR_VERT;
      }
    } else if (!DungeonTileSheet.wallStitcheable(tile) && !Dungeon.level.pit[pos]) {
      if (this.wall((pos - this.mapWidth) | 0) && this.map_[pos] !== Terrain.ALCHEMY) {
        curr = (curr + WallOcclusionTilemap.WALL_ABOVE) | 0;
        if (this.wall((pos - 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_LEFT) | 0;
        } else if (this.wall((pos + this.mapWidth - 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_LEFT_BELOW) | 0;
        }
        if (this.wall((pos + 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_RIGHT) | 0;
        } else if (this.wall((pos + this.mapWidth + 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_RIGHT_BELOW) | 0;
        }
      } else {
        if (this.wall((pos - 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_LEFT) | 0;
        } else if (this.wall((pos + this.mapWidth - 1) | 0)) {
          if (this.wall((pos - this.mapWidth - 1) | 0)) {
            curr = (curr + WallOcclusionTilemap.WALL_LEFT_BOTH) | 0;
          } else {
            curr = (curr + WallOcclusionTilemap.WALL_LEFT_BELOW) | 0;
          }
        } else if (this.wall((pos - this.mapWidth - 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_LEFT_ABOVE) | 0;
        }
        if (this.wall((pos + 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_RIGHT) | 0;
        } else if (this.wall((pos + this.mapWidth + 1) | 0)) {
          if (this.wall((pos - this.mapWidth + 1) | 0)) {
            curr = (curr + WallOcclusionTilemap.WALL_RIGHT_BOTH) | 0;
          } else {
            curr = (curr + WallOcclusionTilemap.WALL_RIGHT_BELOW) | 0;
          }
        } else if (this.wall((pos - this.mapWidth + 1) | 0)) {
          curr = (curr + WallOcclusionTilemap.WALL_RIGHT_ABOVE) | 0;
        }
      }
    } else {
      curr = WallOcclusionTilemap.EMPTY;
    }
    return curr;
  }
  wall(cell: number): boolean {
    return DungeonTileSheet.wallStitcheable(this.map_[cell]);
  }
  door(cell: number): boolean {
    return DungeonTileSheet.doorTile(this.map_[cell]);
  }
}

$J.define(WallOcclusionTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.WallOcclusionTilemap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', ctors: { '': '_WallOcclusionTilemap' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
});
