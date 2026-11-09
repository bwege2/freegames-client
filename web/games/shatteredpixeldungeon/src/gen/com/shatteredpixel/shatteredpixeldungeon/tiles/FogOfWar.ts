// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/FogOfWar.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Pixmap_Blending } from '../../../../../jre/index.ts';
import { Image } from '../../../watabou/noosa/Image.ts';

let Dungeon, SPDSettings, DungeonTileSheet, DungeonTilemap, TextureCache, NoosaScriptNoLighting, Rect;

export class FogOfWar extends Image {
  static FOG_COLORS: number[][] = null;
  static readonly VISIBLE: number = 0;
  static readonly VISITED: number = 1;
  static readonly MAPPED: number = 2;
  static readonly INVISIBLE: number = 3;
  mapWidth: number = 0;
  mapHeight: number = 0;
  mapLength: number = 0;
  pWidth: number = 0;
  pHeight: number = 0;
  width2: number = 0;
  height2: number = 0;
  toUpdate: ArrayList<Rect> = null;
  updating: ArrayList<Rect> = null;
  static readonly PIX_PER_TILE: number = 2;
  visible$FogOfWar: boolean[] = null;
  visited: boolean[] = null;
  mapped: boolean[] = null;
  brightness_: number = 0;
  _FogOfWar(mapWidth: number, mapHeight: number): this {
    this._Image$();
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.mapLength = Math.imul(mapHeight, mapWidth);
    this.pWidth = Math.imul(mapWidth, FogOfWar.PIX_PER_TILE);
    this.pHeight = Math.imul(mapHeight, FogOfWar.PIX_PER_TILE);
    this.width2 = 1;
    while (this.width2 < this.pWidth) {
      this.width2 <<= 1;
    }
    this.height2 = 1;
    while (this.height2 < this.pHeight) {
      this.height2 <<= 1;
    }
    let size = Math.fround($J.idiv(DungeonTilemap.SIZE, FogOfWar.PIX_PER_TILE));
    this.width_ = Math.fround(this.width2 * size);
    this.height_ = Math.fround(this.height2 * size);
    let key = 'FogOfWar' + this.width2 + 'x' + this.height2;
    this.texture(TextureCache.create(key, this.width2, this.height2));
    this.texture_.bitmap_.setColor(255);
    this.texture_.bitmap_.fill();
    this.texture_.bind();
    this.scale_.set$float$float(size, size);
    this.toUpdate = new ArrayList();
    this.toUpdate.add(new Rect()._Rect$int$int$int$int(0, 0, mapWidth, mapHeight));
    return this;
  }
  updateFog$(): void {
    this.toUpdate.clear();
    this.toUpdate.add(new Rect()._Rect$int$int$int$int(0, 0, this.mapWidth, this.mapHeight));
  }
  updateFog$Rect(update: Rect): void {
    for (let r of $J.toArrayInto(this.toUpdate.toArray(), $J.newArray(0, null))) {
      if (!r.intersect(update).isEmpty()) {
        this.toUpdate.remove(r);
        this.toUpdate.add(r.union$Rect(update));
        return;
      }
    }
    this.toUpdate.add(update);
  }
  updateFog$int$int(cell: number, radius: number): void {
    let update = new Rect()._Rect$int$int$int$int(((cell % this.mapWidth) - radius) | 0, (($J.idiv(cell, this.mapWidth)) - radius) | 0, ((cell % this.mapWidth) - radius + 1 + Math.imul(2, radius)) | 0, (($J.idiv(cell, this.mapWidth)) - radius + 1 + Math.imul(2, radius)) | 0);
    update.left_ = Math.max(0, update.left_);
    update.top_ = Math.max(0, update.top_);
    update.right_ = Math.min(this.mapWidth, update.right_);
    update.bottom_ = Math.min(this.mapHeight, update.bottom_);
    if (update.isEmpty()) {
      return;
    }
    this.updateFog$Rect(update);
  }
  updateFogArea(x: number, y: number, w: number, h: number): void {
    this.updateFog$Rect(new Rect()._Rect$int$int$int$int(x, y, (x + w) | 0, (y + h) | 0));
  }
  moveToUpdating(): void {
    this.updating = this.toUpdate;
    this.toUpdate = new ArrayList();
  }
  updateTexture(visible: boolean[], visited: boolean[], mapped: boolean[]): void {
    this.visible$FogOfWar = visible;
    this.visited = visited;
    this.mapped = mapped;
    this.brightness_ = (SPDSettings.brightness$() + 1) | 0;
    this.moveToUpdating();
    let fullUpdate = false;
    if (this.updating.size() === 1) {
      let update = this.updating.get(0);
      if (update.height() === this.mapHeight && update.width() === this.mapWidth) {
        fullUpdate = true;
      }
    }
    let fog = this.texture_.bitmap_;
    fog.setBlending(Pixmap_Blending.None);
    let cell: number;
    for (const $it0 = this.updating.iterator(); $it0.hasNext(); ) {
      let update = $it0.next();
      for (let i = update.top_; i < update.bottom_; i++) {
        cell = (Math.imul(this.mapWidth, i) + update.left_) | 0;
        for (let j = update.left_; j < update.right_; j++) {
          if (cell >= Dungeon.level.length()) {
            continue;
          }
          if (!Dungeon.level.discoverable[cell] || (!visible[cell] && !visited[cell] && !mapped[cell])) {
            if (fullUpdate) {
              this.fillCell(fog, j, i, FogOfWar.FOG_COLORS[FogOfWar.INVISIBLE][this.brightness_]);
            }
            cell++;
            continue;
          }
          if (this.wall(cell)) {
            if (((cell + this.mapWidth) | 0) >= this.mapLength) {
              this.fillCell(fog, j, i, FogOfWar.FOG_COLORS[FogOfWar.INVISIBLE][this.brightness_]);
            } else if (this.wall((cell + this.mapWidth) | 0)) {
              if (cell % this.mapWidth !== 0) {
                if (this.wall((cell - 1) | 0)) {
                  if (this.wall((cell + this.mapWidth - 1) | 0)) {
                    this.fillLeft(fog, j, i, FogOfWar.FOG_COLORS[FogOfWar.INVISIBLE][this.brightness_]);
                  } else {
                    this.fillLeft(fog, j, i, (FogOfWar.FOG_COLORS[Math.max(this.getCellFog(cell), Math.max(this.getCellFog((cell + this.mapWidth - 1) | 0), this.getCellFog((cell - 1) | 0)))])[this.brightness_]);
                  }
                } else {
                  this.fillLeft(fog, j, i, (FogOfWar.FOG_COLORS[Math.max(this.getCellFog(cell), this.getCellFog((cell - 1) | 0))])[this.brightness_]);
                }
              } else {
                this.fillLeft(fog, j, i, FogOfWar.FOG_COLORS[FogOfWar.INVISIBLE][this.brightness_]);
              }
              if (((cell + 1) | 0) % this.mapWidth !== 0) {
                if (this.wall((cell + 1) | 0)) {
                  if (this.wall((cell + this.mapWidth + 1) | 0)) {
                    this.fillRight(fog, j, i, FogOfWar.FOG_COLORS[FogOfWar.INVISIBLE][this.brightness_]);
                  } else {
                    this.fillRight(fog, j, i, (FogOfWar.FOG_COLORS[Math.max(this.getCellFog(cell), Math.max(this.getCellFog((cell + this.mapWidth + 1) | 0), this.getCellFog((cell + 1) | 0)))])[this.brightness_]);
                  }
                } else {
                  this.fillRight(fog, j, i, (FogOfWar.FOG_COLORS[Math.max(this.getCellFog(cell), this.getCellFog((cell + 1) | 0))])[this.brightness_]);
                }
              } else {
                this.fillRight(fog, j, i, FogOfWar.FOG_COLORS[FogOfWar.INVISIBLE][this.brightness_]);
              }
            } else {
              this.fillCell(fog, j, i, (FogOfWar.FOG_COLORS[Math.max(this.getCellFog(cell), this.getCellFog((cell + this.mapWidth) | 0))])[this.brightness_]);
            }
          } else {
            this.fillCell(fog, j, i, FogOfWar.FOG_COLORS[this.getCellFog(cell)][this.brightness_]);
          }
          cell++;
        }
      }
    }
    this.texture_.bitmap(fog);
  }
  wall(cell: number): boolean {
    return DungeonTileSheet.wallStitcheable(Dungeon.level.map_[cell]);
  }
  getCellFog(cell: number): number {
    if (this.visible$FogOfWar[cell]) {
      return FogOfWar.VISIBLE;
    } else if (this.visited[cell]) {
      return FogOfWar.VISITED;
    } else if (this.mapped[cell]) {
      return FogOfWar.MAPPED;
    } else {
      return FogOfWar.INVISIBLE;
    }
  }
  fillLeft(fog: Pixmap, x: number, y: number, color: number): void {
    fog.setColor((color << 8) | (color >>> 24));
    fog.fillRectangle(Math.imul(x, FogOfWar.PIX_PER_TILE), Math.imul(y, FogOfWar.PIX_PER_TILE), $J.idiv(FogOfWar.PIX_PER_TILE, 2), FogOfWar.PIX_PER_TILE);
  }
  fillRight(fog: Pixmap, x: number, y: number, color: number): void {
    fog.setColor((color << 8) | (color >>> 24));
    fog.fillRectangle((Math.imul(x, FogOfWar.PIX_PER_TILE) + $J.idiv(FogOfWar.PIX_PER_TILE, 2)) | 0, Math.imul(y, FogOfWar.PIX_PER_TILE), $J.idiv(FogOfWar.PIX_PER_TILE, 2), FogOfWar.PIX_PER_TILE);
  }
  fillCell(fog: Pixmap, x: number, y: number, color: number): void {
    fog.setColor((color << 8) | (color >>> 24));
    fog.fillRectangle(Math.imul(x, FogOfWar.PIX_PER_TILE), Math.imul(y, FogOfWar.PIX_PER_TILE), FogOfWar.PIX_PER_TILE, FogOfWar.PIX_PER_TILE);
  }
  script(): NoosaScript {
    return NoosaScriptNoLighting.get();
  }
  draw(): void {
    if (!this.toUpdate.isEmpty()) {
      this.updateTexture(Dungeon.level.heroFOV, Dungeon.level.visited, Dungeon.level.mapped);
    }
    super.draw();
  }
  destroy(): void {
    super.destroy();
    if (this.texture_ != null) {
      TextureCache.remove($J.cls(FogOfWar));
    }
  }
  static $clinit() {
    FogOfWar.FOG_COLORS = [[0, 0, 0], [-872415232, -1728053248, 1426063360], [-871292348, -1726401690, 1428309128], [-16777216, -16777216, -16777216]];
  }
}

$J.define(FogOfWar, 'com.shatteredpixel.shatteredpixeldungeon.tiles.FogOfWar', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'int,int': '_FogOfWar' }, meths: { 'updateFog(int,int)': 'updateFog$int$int', 'updateFog(com.watabou.utils.Rect)': 'updateFog$Rect', 'updateFog()': 'updateFog$' }, clinit: true, lazy: ['FOG_COLORS'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  NoosaScriptNoLighting = $J.load('com.watabou.noosa.NoosaScriptNoLighting');
  Rect = $J.load('com.watabou.utils.Rect');
});
