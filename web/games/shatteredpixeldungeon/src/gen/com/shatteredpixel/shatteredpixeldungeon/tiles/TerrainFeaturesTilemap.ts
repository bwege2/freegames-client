// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/TerrainFeaturesTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Environment, Dungeon, LastShopLevel, Terrain, Trap, DungeonTileSheet, Image, ScaleTweener, PointF;

export class TerrainFeaturesTilemap extends DungeonTilemap {
  static instance: TerrainFeaturesTilemap = null;
  plants: SparseArray<Plant> = null;
  traps: SparseArray<Trap> = null;
  _TerrainFeaturesTilemap(plants: SparseArray<Plant>, traps: SparseArray<Trap>): this {
    this._DungeonTilemap(Assets$Environment.TERRAIN_FEATURES);
    this.plants = plants;
    this.traps = traps;
    if (Dungeon.level != null) {
      this.map(Dungeon.level.map_, Dungeon.level.width());
    }
    TerrainFeaturesTilemap.instance = this;
    return this;
  }
  getTileVisual(pos: number, tile: number, flat: boolean): number {
    if (this.traps.get(pos) != null) {
      let trap = this.traps.get(pos);
      if (!trap.visible_) {
        return -1;
      } else {
        return ((trap.active ? trap.color_ : Trap.BLACK) + (Math.imul(trap.shape, 16))) | 0;
      }
    }
    if (this.plants.get(pos) != null) {
      return (this.plants.get(pos).image_ + Math.imul(7, 16)) | 0;
    }
    let stage = $J.idiv(((Dungeon.depth - 1) | 0), 5);
    if (Dungeon.depth === 21 && Dungeon.level instanceof LastShopLevel) {
      stage--;
    }
    stage = Math.min(stage, 4);
    if (tile === Terrain.HIGH_GRASS) {
      if (DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_HIGH_GRASS, pos) === DungeonTileSheet.RAISED_HIGH_GRASS_ALT) {
        return (128 + Math.imul(16, stage) + 1) | 0;
      } else {
        return (128 + Math.imul(16, stage)) | 0;
      }
    } else if (tile === Terrain.FURROWED_GRASS) {
      if (DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_FURROWED_GRASS, pos) === DungeonTileSheet.RAISED_FURROWED_ALT) {
        return (130 + Math.imul(16, stage) + 1) | 0;
      } else {
        return (130 + Math.imul(16, stage)) | 0;
      }
    } else if (tile === Terrain.GRASS) {
      if (DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.GRASS, pos) === DungeonTileSheet.GRASS_ALT) {
        return (132 + Math.imul(16, stage) + 1) | 0;
      } else {
        return (132 + Math.imul(16, stage)) | 0;
      }
    } else if (tile === Terrain.BARRICADE) {
      return (134 + Math.imul(16, stage)) | 0;
    } else if (tile === Terrain.ALCHEMY) {
      return (135 + Math.imul(16, stage)) | 0;
    } else if (tile === Terrain.STATUE || tile === Terrain.STATUE_SP) {
      return (136 + Math.imul(16, stage)) | 0;
    } else if (tile === Terrain.REGION_DECO) {
      return (137 + Math.imul(16, stage)) | 0;
    } else if (tile === Terrain.REGION_DECO_ALT) {
      return (138 + Math.imul(16, stage)) | 0;
    } else if (tile === Terrain.EMBERS) {
      if (DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.EMBERS, pos) === DungeonTileSheet.EMBERS_ALT) {
        return (208 + 1) | 0;
      } else {
        return 208;
      }
    } else if (tile === Terrain.MINE_CRYSTAL) {
      let vis = DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_1, pos);
      if (vis === DungeonTileSheet.RAISED_MINE_CRYSTAL_RED_2) {
        return (210 + 5) | 0;
      } else if (vis === DungeonTileSheet.RAISED_MINE_CRYSTAL_RED_1) {
        return (210 + 4) | 0;
      } else if (vis === DungeonTileSheet.RAISED_MINE_CRYSTAL_GREEN_2) {
        return (210 + 3) | 0;
      } else if (vis === DungeonTileSheet.RAISED_MINE_CRYSTAL_GREEN_1) {
        return (210 + 2) | 0;
      } else if (vis === DungeonTileSheet.RAISED_MINE_CRYSTAL_BLUE_2) {
        return (210 + 1) | 0;
      } else {
        return (210 + 0) | 0;
      }
    } else if (tile === Terrain.MINE_BOULDER) {
      let vis = DungeonTileSheet.getVisualWithAlts(DungeonTileSheet.RAISED_MINE_BOULDER, pos);
      if (vis === DungeonTileSheet.RAISED_MINE_BOULDER_ALT_2) {
        return (216 + 2) | 0;
      } else if (vis === DungeonTileSheet.RAISED_MINE_BOULDER_ALT) {
        return (216 + 1) | 0;
      } else {
        return 216;
      }
    }
    return -1;
  }
  static getTrapVisual(trap: Trap): Image {
    if (TerrainFeaturesTilemap.instance == null) {
      TerrainFeaturesTilemap.instance = new TerrainFeaturesTilemap()._TerrainFeaturesTilemap(null, null);
    }
    let uv = TerrainFeaturesTilemap.instance.tileset.get$Object(((trap.active ? trap.color_ : Trap.BLACK) + (Math.imul(trap.shape, 16))) | 0);
    if (uv == null) {
      return null;
    }
    let img = new Image()._Image$Object(TerrainFeaturesTilemap.instance.texture_);
    img.frame$RectF(uv);
    return img;
  }
  static getPlantVisual(plant: Plant): Image {
    if (TerrainFeaturesTilemap.instance == null) {
      TerrainFeaturesTilemap.instance = new TerrainFeaturesTilemap()._TerrainFeaturesTilemap(null, null);
    }
    let uv = TerrainFeaturesTilemap.instance.tileset.get$Object((plant.image_ + Math.imul(7, 16)) | 0);
    if (uv == null) {
      return null;
    }
    let img = new Image()._Image$Object(TerrainFeaturesTilemap.instance.texture_);
    img.frame$RectF(uv);
    return img;
  }
  static tile(pos: number, tile: number): Image {
    let uv = TerrainFeaturesTilemap.instance.tileset.get$Object(TerrainFeaturesTilemap.instance.getTileVisual(pos, tile, true));
    if (uv == null) {
      return null;
    }
    let img = new Image()._Image$Object(TerrainFeaturesTilemap.instance.texture_);
    img.frame$RectF(uv);
    return img;
  }
  growPlant(pos: number): void {
    let plant = TerrainFeaturesTilemap.tile(pos, this.map_[pos]);
    if (plant == null) {
      return;
    }
    plant.origin.set$float$float(8, 12);
    plant.scale_.set$float(0);
    plant.point$PointF(DungeonTilemap.tileToWorld(pos));
    this.parent.add$Gizmo(plant);
    this.parent.add$Gizmo(new (TerrainFeaturesTilemap$1())().$o(this).$c(plant, pos)._ScaleTweener(plant, new PointF()._PointF$float$float(1, 1), Math.fround(0.2)));
  }
}

let $TerrainFeaturesTilemap$1: any = null;
/** An anonymous class (TerrainFeaturesTilemap.java:181). */
function TerrainFeaturesTilemap$1(): any {
  return $TerrainFeaturesTilemap$1 ??= $J.local(class extends ScaleTweener {
    onComplete(): void {
      this.$cv_plant.killAndErase();
      this.killAndErase();
      this.$outer.updateMapCell(this.$cv_pos);
    }
    $c($plant, $pos): this {
      this.$cv_plant = $plant; this.$cv_pos = $pos;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.tiles.TerrainFeaturesTilemap$1', []);
}

$J.define(TerrainFeaturesTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.TerrainFeaturesTilemap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', ctors: { 'com.watabou.utils.SparseArray,com.watabou.utils.SparseArray': '_TerrainFeaturesTilemap' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  LastShopLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.LastShopLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Trap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Image = $J.load('com.watabou.noosa.Image');
  ScaleTweener = $J.load('com.watabou.noosa.tweeners.ScaleTweener');
  PointF = $J.load('com.watabou.utils.PointF');
});
