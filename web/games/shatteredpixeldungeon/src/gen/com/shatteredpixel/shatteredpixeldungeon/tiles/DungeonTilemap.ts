// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/DungeonTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Terrain, DungeonTileSheet, Image, TextureFilm, AlphaTweener, GameMath, PathFinder, PointF;

export class DungeonTilemap extends Tilemap {
  static readonly SIZE: number = 16;
  map_: number[] = null;
  _DungeonTilemap(tex: string): this {
    this._Tilemap(tex, new TextureFilm()._TextureFilm$Object$int$int(tex, DungeonTilemap.SIZE, DungeonTilemap.SIZE));
    return this;
  }
  map(data: number[], cols: number): void {
    this.map_ = data;
    super.map($J.newArray(data.length, 0), cols);
  }
  updateMap(): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.getTileVisual(i, this.map_[i], false);
    }
    super.updateMap();
  }
  updateMapCell(cell: number): void {
    if (Dungeon.level.insideMap(cell)) {
      for (let i of PathFinder.NEIGHBOURS9) {
        (this.data[(cell + i) | 0]) = this.getTileVisual((cell + i) | 0, this.map_[(cell + i) | 0], false);
      }
      super.updateMapCell((cell - this.mapWidth - 1) | 0);
      super.updateMapCell((cell + this.mapWidth + 1) | 0);
    } else {
      this.data[cell] = this.getTileVisual(cell, this.map_[cell], false);
      super.updateMapCell(cell);
    }
  }
  screenToTile$int$int(x: number, y: number): number {
    return this.screenToTile$int$int$boolean(x, y, false);
  }
  screenToTile$int$int$boolean(x: number, y: number, wallAssist: boolean): number {
    let p = this.camera().screenToCamera(x, y).offset$PointF(this.point$().negate()).invScale(Math.fround(DungeonTilemap.SIZE));
    p.x = GameMath.gate(0, p.x, Math.fround(Dungeon.level.width() - Math.fround(0.001)));
    p.y = GameMath.gate(0, p.y, Math.fround(Dungeon.level.height() - Math.fround(0.001)));
    let cell = ($J.d2i(p.x) + Math.imul($J.d2i(p.y), Dungeon.level.width())) | 0;
    if (wallAssist && this.map_ != null && this.isWallAssistable(cell)) {
      if (((cell + this.mapWidth) | 0) < this.size_ && Math.fround(p.y % 1) >= 0.75 && !(this.isWallAssistable((cell + this.mapWidth) | 0))) {
        cell = (cell + this.mapWidth) | 0;
      }
    }
    return cell;
  }
  isWallAssistable(cell: number): boolean {
    if (this.map_ == null || cell >= this.size_) {
      return false;
    }
    if (DungeonTileSheet.wallStitcheable(this.map_[cell])) {
      return true;
    }
    if (Dungeon.depth >= 10 && Dungeon.depth <= 15 && (this.map_[cell] === Terrain.REGION_DECO || this.map_[cell] === Terrain.REGION_DECO_ALT)) {
      return true;
    }
    return false;
  }
  overlapsPoint(x: number, y: number): boolean {
    return true;
  }
  discover(pos: number, oldValue: number): void {
    let visual = this.getTileVisual(pos, oldValue, false);
    if (visual < 0) {
      return;
    }
    let tile = new Image()._Image$Object(this.texture_);
    tile.frame$RectF(this.tileset.get$Object(this.getTileVisual(pos, oldValue, false)));
    tile.point$PointF(DungeonTilemap.tileToWorld(pos));
    this.parent.add$Gizmo(tile);
    this.parent.add$Gizmo(new (DungeonTilemap$1())().$o(this).$c(tile)._AlphaTweener(tile, 0, Math.fround(0.6)));
  }
  static tileToWorld(pos: number): PointF {
    return new PointF()._PointF$float$float(Math.fround(pos % Dungeon.level.width()), Math.fround($J.idiv(pos, Dungeon.level.width()))).scale(Math.fround(DungeonTilemap.SIZE));
  }
  static tileCenterToWorld(pos: number): PointF {
    return new PointF()._PointF$float$float(Math.fround((Math.fround(pos % Dungeon.level.width() + 0.5)) * DungeonTilemap.SIZE), Math.fround((Math.fround($J.idiv(pos, Dungeon.level.width()) + 0.5)) * DungeonTilemap.SIZE));
  }
  static raisedTileCenterToWorld(pos: number): PointF {
    return new PointF()._PointF$float$float(Math.fround((Math.fround(pos % Dungeon.level.width() + 0.5)) * DungeonTilemap.SIZE), Math.fround((Math.fround($J.idiv(pos, Dungeon.level.width()) + Math.fround(0.1))) * DungeonTilemap.SIZE));
  }
  static worldToTile(x: number, y: number, width: number): number {
    return ($J.d2i((Math.fround(x / DungeonTilemap.SIZE))) + (Math.imul($J.d2i((Math.fround(y / DungeonTilemap.SIZE))), width))) | 0;
  }
  overlapsScreenPoint(x: number, y: number): boolean {
    return true;
  }
}

let $DungeonTilemap$1: any = null;
/** An anonymous class (DungeonTilemap.java:145). */
function DungeonTilemap$1(): any {
  return $DungeonTilemap$1 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      this.$cv_tile.killAndErase();
      this.killAndErase();
    }
    $c($tile): this {
      this.$cv_tile = $tile;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap$1', []);
}

$J.define(DungeonTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap', { kind: 'class', sup: 'com.watabou.noosa.Tilemap', ctors: { 'java.lang.String': '_DungeonTilemap' }, meths: { 'screenToTile(int,int,boolean)': 'screenToTile$int$int$boolean', 'screenToTile(int,int)': 'screenToTile$int$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Image = $J.load('com.watabou.noosa.Image');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
});
