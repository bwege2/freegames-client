// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/CustomTilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';

let Dungeon, NoosaScript, TextureFilm, Tilemap;

export class CustomTilemap extends JObject {
  static readonly SIZE: number = 16;
  tileX: number = 0;
  tileY: number = 0;
  tileW: number = 0;
  tileH: number = 0;
  texture_: any = null;
  vis: Tilemap = null;
  static readonly TILE_X: string = 'tileX';
  static readonly TILE_Y: string = 'tileY';
  static readonly TILE_W: string = 'tileW';
  static readonly TILE_H: string = 'tileH';
  _CustomTilemap(): this {
    this.tileW = 1;
    this.tileH = 1;
    this.vis = null;
    return this;
  }
  pos$int(pos: number): void {
    this.pos$int$Level(pos, Dungeon.level);
  }
  pos$int$Level(pos: number, level: Level): void {
    this.pos$int$int(pos % level.width(), $J.idiv(pos, level.width()));
  }
  pos$int$int(tileX: number, tileY: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
  }
  setRect$int$int(topLeft: number, bottomRight: number): void {
    this.setRect$int$int$int$int(topLeft % Dungeon.level.width(), $J.idiv(topLeft, Dungeon.level.width()), (bottomRight % Dungeon.level.width() - topLeft % Dungeon.level.width()) | 0, ($J.idiv(bottomRight, Dungeon.level.width()) - $J.idiv(topLeft, Dungeon.level.width())) | 0);
  }
  setRect$int$int$int$int(tileX: number, tileY: number, tileW: number, tileH: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
    this.tileW = tileW;
    this.tileH = tileH;
  }
  mapSimpleImage(txX: number, txY: number, texW: number): number[] {
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let texTileWidth = $J.idiv(texW, CustomTilemap.SIZE);
    let x = txX;
    let y = txY;
    for (let i = 0; i < data.length; i++) {
      data[i] = (x + (Math.imul(texTileWidth, y))) | 0;
      x++;
      if (((x - txX) | 0) === this.tileW) {
        x = txX;
        y++;
      }
    }
    return data;
  }
  create(): Tilemap {
    if (this.vis != null && this.vis.alive) {
      this.vis.killAndErase();
    }
    this.vis = new (CustomTilemap$1())().$o(this)._Tilemap(this.texture_, new TextureFilm()._TextureFilm$Object$int$int(this.texture_, CustomTilemap.SIZE, CustomTilemap.SIZE));
    this.vis.x = Math.fround(Math.imul(this.tileX, CustomTilemap.SIZE));
    this.vis.y = Math.fround(Math.imul(this.tileY, CustomTilemap.SIZE));
    return this.vis;
  }
  updateCell(cell: number, data: number[]): boolean {
    return false;
  }
  updateAll(data: number[]): void {
  }
  allowWater(tileX: number, tileY: number): boolean {
    return this.image(tileX, tileY) == null;
  }
  image(tileX: number, tileY: number): Image {
    if (this.vis == null) {
      return null;
    } else {
      return this.vis.image(tileX, tileY);
    }
  }
  name(tileX: number, tileY: number): string {
    return null;
  }
  desc(tileX: number, tileY: number): string {
    return null;
  }
  restoreFromBundle(bundle: Bundle): void {
    this.tileX = bundle.getInt(CustomTilemap.TILE_X);
    this.tileY = bundle.getInt(CustomTilemap.TILE_Y);
    this.tileW = bundle.getInt(CustomTilemap.TILE_W);
    this.tileH = bundle.getInt(CustomTilemap.TILE_H);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(CustomTilemap.TILE_X, this.tileX);
    bundle.put$String$int(CustomTilemap.TILE_Y, this.tileY);
    bundle.put$String$int(CustomTilemap.TILE_W, this.tileW);
    bundle.put$String$int(CustomTilemap.TILE_H, this.tileH);
  }
}

let $CustomTilemap$1: any = null;
/** An anonymous class (CustomTilemap.java:91). */
function CustomTilemap$1(): any {
  return $CustomTilemap$1 ??= $J.local(class extends Tilemap {
    script(): NoosaScript {
      return NoosaScript.get();
    }
    updateMap(): void {
      this.$outer.updateAll(this.data);
      super.updateMap();
    }
    updateMapCell(cell: number): void {
      let custX = (cell % Dungeon.level.width() - this.$outer.tileX) | 0;
      let custY = ($J.idiv(cell, Dungeon.level.width()) - this.$outer.tileY) | 0;
      if (custX >= 0 && custY >= 0 && custX < this.$outer.tileW && custY < this.$outer.tileH) {
        if (this.$outer.updateCell(cell, this.data)) {
          super.updateMap();
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap$1', []);
}

$J.define(CustomTilemap, 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_CustomTilemap' }, meths: { 'setRect(int,int,int,int)': 'setRect$int$int$int$int', 'setRect(int,int)': 'setRect$int$int', 'pos(int,int)': 'pos$int$int', 'pos(int,com.shatteredpixel.shatteredpixeldungeon.levels.Level)': 'pos$int$Level', 'pos(int)': 'pos$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Tilemap = $J.load('com.watabou.noosa.Tilemap');
});
