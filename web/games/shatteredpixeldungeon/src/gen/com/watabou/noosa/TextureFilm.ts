// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/TextureFilm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject } from '../../../../jre/index.ts';

let TextureCache, RectF;

export class TextureFilm extends JObject {
  static FULL: RectF = null;
  texWidth: number = 0;
  texHeight_: number = 0;
  frames: HashMap<any, RectF> = null;
  $init_TextureFilm() {
    this.frames = new HashMap();
  }
  _TextureFilm$Object(tx: any): this {
    this.$init_TextureFilm();
    let texture = TextureCache.get(tx);
    this.texWidth = texture.width_;
    this.texHeight_ = texture.height_;
    this.add$Object$RectF(null, TextureFilm.FULL);
    return this;
  }
  _TextureFilm$SmartTexture$int(texture: SmartTexture, width: number): this {
    this._TextureFilm$Object$int$int(texture, width, texture.height_);
    return this;
  }
  _TextureFilm$Object$int$int(tx: any, width: number, height: number): this {
    this.$init_TextureFilm();
    let texture = TextureCache.get(tx);
    this.texWidth = texture.width_;
    this.texHeight_ = texture.height_;
    let uw = Math.fround(Math.fround(width) / this.texWidth);
    let vh = Math.fround(Math.fround(height) / this.texHeight_);
    let cols = $J.idiv(this.texWidth, width);
    let rows = $J.idiv(this.texHeight_, height);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let rect = new RectF()._RectF$float$float$float$float(Math.fround(j * uw), Math.fround(i * vh), Math.fround(((j + 1) | 0) * uw), Math.fround(((i + 1) | 0) * vh));
        this.add$Object$RectF((Math.imul(i, cols) + j) | 0, rect);
      }
    }
    return this;
  }
  _TextureFilm$TextureFilm$Object$int$int(atlas: TextureFilm, key: any, width: number, height: number): this {
    this.$init_TextureFilm();
    this.texWidth = atlas.texWidth;
    this.texHeight_ = atlas.texHeight_;
    let patch = atlas.get$Object(key);
    let uw = Math.fround(Math.fround(width) / this.texWidth);
    let vh = Math.fround(Math.fround(height) / this.texHeight_);
    let cols = $J.d2i((Math.fround(this.width$RectF(patch) / width)));
    let rows = $J.d2i((Math.fround(this.height$RectF(patch) / height)));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let rect = new RectF()._RectF$float$float$float$float(Math.fround(j * uw), Math.fround(i * vh), Math.fround(((j + 1) | 0) * uw), Math.fround(((i + 1) | 0) * vh));
        rect.shift(patch.left_, patch.top_);
        this.add$Object$RectF((Math.imul(i, cols) + j) | 0, rect);
      }
    }
    return this;
  }
  _TextureFilm$int$int$int$int(txWidth: number, txHeight: number, width: number, height: number): this {
    this.$init_TextureFilm();
    this.texWidth = txWidth;
    this.texHeight_ = txHeight;
    let uw = Math.fround(Math.fround(width) / this.texWidth);
    let vh = Math.fround(Math.fround(height) / this.texHeight_);
    let cols = $J.idiv(this.texWidth, width);
    let rows = $J.idiv(this.texHeight_, height);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let rect = new RectF()._RectF$float$float$float$float(Math.fround(j * uw), Math.fround(i * vh), Math.fround(((j + 1) | 0) * uw), Math.fround(((i + 1) | 0) * vh));
        this.add$Object$RectF((Math.imul(i, cols) + j) | 0, rect);
      }
    }
    return this;
  }
  add$Object$RectF(id: any, rect: RectF): void {
    this.frames.put(id, rect);
  }
  add$Object$float$float$float$float(id: any, left: number, top: number, right: number, bottom: number): void {
    this.frames.put(id, new RectF()._RectF$float$float$float$float(Math.fround(left / this.texWidth), Math.fround(top / this.texHeight_), Math.fround(right / this.texWidth), Math.fround(bottom / this.texHeight_)));
  }
  get$Object(id: any): RectF {
    return this.frames.get(id);
  }
  width$Object(id: any): number {
    return this.width$RectF(this.get$Object(id));
  }
  width$RectF(frame: RectF): number {
    return Math.fround(frame.width() * this.texWidth);
  }
  height$Object(id: any): number {
    return this.height$RectF(this.get$Object(id));
  }
  height$RectF(frame: RectF): number {
    return Math.fround(frame.height() * this.texHeight_);
  }
  static $clinit() {
    TextureFilm.FULL = new RectF()._RectF$float$float$float$float(0, 0, 1, 1);
  }
}

$J.define(TextureFilm, 'com.watabou.noosa.TextureFilm', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_TextureFilm$int$int$int$int', 'com.watabou.noosa.TextureFilm,java.lang.Object,int,int': '_TextureFilm$TextureFilm$Object$int$int', 'java.lang.Object,int,int': '_TextureFilm$Object$int$int', 'com.watabou.gltextures.SmartTexture,int': '_TextureFilm$SmartTexture$int', 'java.lang.Object': '_TextureFilm$Object' }, meths: { 'height(com.watabou.utils.RectF)': 'height$RectF', 'height(java.lang.Object)': 'height$Object', 'width(com.watabou.utils.RectF)': 'width$RectF', 'width(java.lang.Object)': 'width$Object', 'get(java.lang.Object)': 'get$Object', 'add(java.lang.Object,float,float,float,float)': 'add$Object$float$float$float$float', 'add(java.lang.Object,com.watabou.utils.RectF)': 'add$Object$RectF' }, clinit: true, lazy: ['FULL'] });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  RectF = $J.load('com.watabou.utils.RectF');
});
