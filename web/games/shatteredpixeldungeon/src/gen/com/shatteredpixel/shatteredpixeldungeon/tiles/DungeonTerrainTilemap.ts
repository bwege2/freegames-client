// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonTerrainTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, MiningLevel, Terrain, DungeonTileSheet, Image, PathFinder;

export class DungeonTerrainTilemap extends DungeonTilemap {
  static instance: DungeonTerrainTilemap = null;
  _DungeonTerrainTilemap(): this {
    this._DungeonTilemap(Dungeon.level.tilesTex());
    this.map(Dungeon.level.map_, Dungeon.level.width());
    DungeonTerrainTilemap.instance = this;
    return this;
  }
  getTileVisual(pos: number, tile: number, flat: boolean): number {
    let visual = DungeonTileSheet.directVisuals.get(tile, -1);
    if (visual !== -1) {
      if (visual === DungeonTileSheet.FLOOR_DECO && Dungeon.level instanceof MiningLevel) {
        for (let i of PathFinder.NEIGHBOURS4) {
          if ((this.map_[(pos + i) | 0]) === Terrain.MINE_BOULDER) {
            visual = DungeonTileSheet.MINE_FLOOR_DECO_HEAVY;
            break;
          }
        }
      }
      return DungeonTileSheet.getVisualWithAlts(visual, pos);
    }
    if (tile === Terrain.WATER) {
      return DungeonTileSheet.stitchWaterTile(this.map_[(pos + PathFinder.CIRCLE4[0]) | 0], this.map_[(pos + PathFinder.CIRCLE4[1]) | 0], this.map_[(pos + PathFinder.CIRCLE4[2]) | 0], this.map_[(pos + PathFinder.CIRCLE4[3]) | 0]);
    } else if (tile === Terrain.CHASM) {
      return DungeonTileSheet.stitchChasmTile(pos > this.mapWidth ? this.map_[(pos - this.mapWidth) | 0] : -1);
    }
    if (!flat) {
      if (DungeonTileSheet.doorTile(tile)) {
        return DungeonTileSheet.getRaisedDoorTile(tile, this.map_[(pos - this.mapWidth) | 0]);
      } else if (DungeonTileSheet.wallStitcheable(tile)) {
        return DungeonTileSheet.getRaisedWallTile(tile, pos, ((pos + 1) | 0) % this.mapWidth !== 0 ? this.map_[(pos + 1) | 0] : -1, ((pos + this.mapWidth) | 0) < this.size_ ? this.map_[(pos + this.mapWidth) | 0] : -1, pos % this.mapWidth !== 0 ? this.map_[(pos - 1) | 0] : -1);
      } else if (tile === Terrain.STATUE) {
        return DungeonTileSheet.RAISED_STATUE;
      } else if (tile === Terrain.STATUE_SP) {
        return DungeonTileSheet.RAISED_STATUE_SP;
      } else if (tile === Terrain.REGION_DECO) {
        return DungeonTileSheet.RAISED_REGION_DECO;
      } else if (tile === Terrain.REGION_DECO_ALT) {
        return DungeonTileSheet.RAISED_REGION_DECO_ALT;
      } else if (tile === Terrain.MINE_CRYSTAL) {
        return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_1, pos);
      } else if (tile === Terrain.MINE_BOULDER) {
        return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_MINE_BOULDER, pos);
      } else if (tile === Terrain.ALCHEMY) {
        return DungeonTileSheet.RAISED_ALCHEMY_POT;
      } else if (tile === Terrain.BARRICADE) {
        return DungeonTileSheet.RAISED_BARRICADE;
      } else if (tile === Terrain.HIGH_GRASS) {
        return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_HIGH_GRASS, pos);
      } else if (tile === Terrain.FURROWED_GRASS) {
        return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_FURROWED_GRASS, pos);
      } else {
        return DungeonTileSheet.NULL_TILE;
      }
    } else {
      return DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.directFlatVisuals.get(tile), pos);
    }
  }
  static tile(pos: number, tile: number): Image {
    let img = new Image()._Image$Object(DungeonTerrainTilemap.instance.texture_);
    img.frame$RectF(DungeonTerrainTilemap.instance.tileset.get$Object(DungeonTerrainTilemap.instance.getTileVisual(pos, tile, true)));
    return img;
  }
  needsRender(pos: number): boolean {
    return super.needsRender(pos) && this.data[pos] !== DungeonTileSheet.WATER;
  }
}

$J.define(DungeonTerrainTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTerrainTilemap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', ctors: { '': '_DungeonTerrainTilemap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Image = $J.load('com.watabou.noosa.Image');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
