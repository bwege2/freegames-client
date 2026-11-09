// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/WallBlockingTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Tilemap } from '../../../watabou/noosa/Tilemap.ts';

let Assets$Environment, Dungeon, HallsBossLevel, MiningLevel, Terrain, DungeonTileSheet, TextureFilm;

export class WallBlockingTilemap extends Tilemap {
  static readonly SIZE: number = 16;
  static readonly CLEARED: number = -2;
  static readonly BLOCK_NONE: number = -1;
  static readonly BLOCK_RIGHT: number = 0;
  static readonly BLOCK_LEFT: number = 1;
  static readonly BLOCK_ALL: number = 2;
  static readonly BLOCK_BELOW: number = 3;
  curr: number = 0;
  _WallBlockingTilemap(): this {
    this._Tilemap(Assets$Environment.WALL_BLOCKING, new TextureFilm()._TextureFilm$Object$int$int(Assets$Environment.WALL_BLOCKING, WallBlockingTilemap.SIZE, WallBlockingTilemap.SIZE));
    this.map($J.newArray(Dungeon.level.length(), 0), Dungeon.level.width());
    return this;
  }
  updateMap(): void {
    for (let cell = 0; cell < this.data.length; cell++) {
      if (!Dungeon.level.discoverable[cell] || ((cell - this.mapWidth) | 0) <= 0 || ((cell + this.mapWidth) | 0) >= this.size_) {
        this.data[cell] = WallBlockingTilemap.CLEARED;
      } else {
        this.updateMapCell(cell);
      }
    }
    super.updateMap();
  }
  updateMapCell(cell: number): void {
    if (Dungeon.level instanceof HallsBossLevel) {
      this.data[cell] = WallBlockingTilemap.CLEARED;
      super.updateMapCell(cell);
      return;
    }
    if (!this.wall(cell)) {
      if (!this.fogHidden(cell) || !(this.wall((cell + this.mapWidth) | 0))) {
        this.curr = WallBlockingTilemap.CLEARED;
      } else if (!(this.fogHidden((cell + this.mapWidth) | 0)) && (this.fogHidden((cell - 1) | 0) || this.wall((cell - 1) | 0)) && (this.fogHidden((cell + 1) | 0) || this.wall((cell + 1) | 0)) && (this.fogHidden((cell - 1 + this.mapWidth) | 0) || this.wall((cell - 1 + this.mapWidth) | 0)) && (this.fogHidden((cell + 1 + this.mapWidth) | 0) || this.wall((cell + 1 + this.mapWidth) | 0))) {
        this.curr = WallBlockingTilemap.BLOCK_BELOW;
      } else {
        this.curr = WallBlockingTilemap.BLOCK_NONE;
      }
    } else {
      if (!(this.wall((cell + this.mapWidth) | 0))) {
        if (this.wall((cell - 1 - this.mapWidth) | 0) && this.wall((cell - this.mapWidth) | 0) && this.wall((cell + 1 - this.mapWidth) | 0)) {
          if (this.shelf((cell - 1 - this.mapWidth) | 0) || this.shelf((cell - this.mapWidth) | 0) || this.shelf((cell + 1 - this.mapWidth) | 0) || Dungeon.level instanceof MiningLevel) {
            this.curr = WallBlockingTilemap.BLOCK_NONE;
          } else {
            this.curr = WallBlockingTilemap.CLEARED;
          }
        } else if ((!(this.wall((cell - 1 - this.mapWidth) | 0)) && !(this.fogHidden((cell - 1 - this.mapWidth) | 0)) && this.wall((cell - 1) | 0)) || (!(this.wall((cell - this.mapWidth) | 0)) && !(this.fogHidden((cell - this.mapWidth) | 0))) || (!(this.wall((cell + 1 - this.mapWidth) | 0)) && !(this.fogHidden((cell + 1 - this.mapWidth) | 0)) && this.wall((cell + 1) | 0))) {
          if (!(this.fogHidden((cell + this.mapWidth) | 0)) || (!(this.wall((cell - 1) | 0)) && !(this.fogHidden((cell - 1) | 0))) || (!(this.wall((cell - 1 + this.mapWidth) | 0)) && !(this.fogHidden((cell - 1 + this.mapWidth) | 0))) || (!(this.wall((cell + 1) | 0)) && !(this.fogHidden((cell + 1) | 0))) || (!(this.wall((cell + 1 + this.mapWidth) | 0)) && !(this.fogHidden((cell + 1 + this.mapWidth) | 0)))) {
            this.curr = WallBlockingTilemap.CLEARED;
          } else {
            this.curr = WallBlockingTilemap.BLOCK_ALL;
          }
        } else {
          this.curr = WallBlockingTilemap.BLOCK_NONE;
        }
      } else {
        this.curr = WallBlockingTilemap.BLOCK_NONE;
        if (!(this.fogHidden((cell - this.mapWidth) | 0)) || !(this.fogHidden((cell - this.mapWidth - 1) | 0)) || !(this.fogHidden((cell - this.mapWidth + 1) | 0)) || !this.fogHidden(cell) || !(this.fogHidden((cell + this.mapWidth) | 0))) {
          if ((((cell + 1) | 0) % this.mapWidth === 0) || (!(this.wall((cell + 1) | 0)) && !(this.fogHidden((cell + 1 - this.mapWidth) | 0))) || (!(this.wall((cell + 1) | 0)) && !(this.fogHidden((cell + 1) | 0))) || (!(this.wall((cell + 1 + this.mapWidth) | 0)) && !(this.fogHidden((cell + 1 + this.mapWidth) | 0)))) {
          } else {
            this.curr = (this.curr + 1) | 0;
          }
          if ((cell % this.mapWidth === 0) || (!(this.wall((cell - 1) | 0)) && !(this.fogHidden((cell - 1 - this.mapWidth) | 0))) || (!(this.wall((cell - 1) | 0)) && !(this.fogHidden((cell - 1) | 0))) || (!(this.wall((cell - 1 + this.mapWidth) | 0)) && !(this.fogHidden((cell - 1 + this.mapWidth) | 0)))) {
          } else {
            this.curr = (this.curr + 2) | 0;
          }
          if (this.curr === WallBlockingTilemap.BLOCK_NONE) {
            this.curr = WallBlockingTilemap.CLEARED;
          }
        }
      }
    }
    if (this.data[cell] !== this.curr) {
      this.data[cell] = this.curr;
      super.updateMapCell(cell);
    }
  }
  fogHidden(cell: number): boolean {
    if (!Dungeon.level.visited[cell] && !Dungeon.level.mapped[cell]) {
      return true;
    } else if (this.wall(cell) && ((cell + this.mapWidth) | 0) < this.size_ && !(this.wall((cell + this.mapWidth) | 0)) && !(Dungeon.level.visited[(cell + this.mapWidth) | 0]) && !(Dungeon.level.mapped[(cell + this.mapWidth) | 0])) {
      return true;
    }
    return false;
  }
  wall(cell: number): boolean {
    return DungeonTileSheet.wallStitcheable(Dungeon.level.map_[cell]);
  }
  shelf(cell: number): boolean {
    return Dungeon.level.map_[cell] === Terrain.BOOKSHELF;
  }
  door(cell: number): boolean {
    return DungeonTileSheet.doorTile(Dungeon.level.map_[cell]);
  }
  updateArea$int$int(cell: number, radius: number): void {
    let l = (cell % this.mapWidth - radius) | 0;
    let t = ($J.idiv(cell, this.mapWidth) - radius) | 0;
    let r = (cell % this.mapWidth - radius + 1 + Math.imul(2, radius)) | 0;
    let b = ($J.idiv(cell, this.mapWidth) - radius + 1 + Math.imul(2, radius)) | 0;
    this.updateArea$int$int$int$int(Math.max(0, l), Math.max(0, t), Math.min((this.mapWidth - 1) | 0, (r - l) | 0), Math.min((this.mapHeight - 1) | 0, (b - t) | 0));
  }
  updateArea$int$int$int$int(x: number, y: number, w: number, h: number): void {
    let cell: number;
    for (let i = x; i <= ((x + w) | 0); i++) {
      for (let j = y; j <= ((y + h) | 0); j++) {
        cell = (i + Math.imul(j, this.mapWidth)) | 0;
        if (cell < this.data.length && this.data[cell] !== WallBlockingTilemap.CLEARED) {
          this.updateMapCell(cell);
        }
      }
    }
  }
}

$J.define(WallBlockingTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.WallBlockingTilemap', { kind: 'class', sup: 'com.watabou.noosa.Tilemap', ctors: { '': '_WallBlockingTilemap' }, meths: { 'updateArea(int,int,int,int)': 'updateArea$int$int$int$int', 'updateArea(int,int)': 'updateArea$int$int' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HallsBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
