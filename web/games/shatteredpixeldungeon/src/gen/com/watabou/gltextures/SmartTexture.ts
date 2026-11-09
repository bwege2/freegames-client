// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/gltextures/SmartTexture.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { Texture } from '../glwrap/Texture.ts';

let RectF;

export class SmartTexture extends Texture {
  width_: number = 0;
  height_: number = 0;
  fModeMin: number = 0;
  fModeMax: number = 0;
  wModeH: number = 0;
  wModeV: number = 0;
  bitmap_: Pixmap = null;
  atlas: Atlas = null;
  _SmartTexture$Pixmap(bitmap: Pixmap): this {
    this._SmartTexture$Pixmap$int$int$boolean(bitmap, Texture.NEAREST, Texture.CLAMP, false);
    return this;
  }
  _SmartTexture$Pixmap$int$int$boolean(bitmap: Pixmap, filtering: number, wrapping: number, premultiplied: boolean): this {
    this._Texture();
    this.bitmap_ = bitmap;
    this.width_ = bitmap.getWidth();
    this.height_ = bitmap.getHeight();
    this.fModeMin = this.fModeMax = filtering;
    this.wModeH = this.wModeV = wrapping;
    this.premultiplied = premultiplied;
    return this;
  }
  generate(): void {
    super.generate();
    this.bitmap(this.bitmap_);
    this.filter(this.fModeMin, this.fModeMax);
    this.wrap(this.wModeH, this.wModeV);
  }
  filter(minMode: number, maxMode: number): void {
    this.fModeMin = minMode;
    this.fModeMax = maxMode;
    if (this.id_ !== -1) {
      super.filter(this.fModeMin, this.fModeMax);
    }
  }
  wrap(s: number, t: number): void {
    this.wModeH = s;
    this.wModeV = t;
    if (this.id_ !== -1) {
      super.wrap(this.wModeH, this.wModeV);
    }
  }
  bitmap(bitmap: Pixmap): void {
    super.bitmap(bitmap);
    this.bitmap_ = bitmap;
    this.width_ = bitmap.getWidth();
    this.height_ = bitmap.getHeight();
  }
  getPixel(x: number, y: number): number {
    let color = this.bitmap_.getPixel(x, y);
    return ((color << 24) | (color >>> 8));
  }
  reload(): void {
    this.id_ = -1;
    this.generate();
  }
  delete(): void {
    super.delete();
    if (this.bitmap_ != null) {
      this.bitmap_.dispose();
    }
    this.bitmap_ = null;
  }
  uvRect(left: number, top: number, right: number, bottom: number): RectF {
    return new RectF()._RectF$float$float$float$float(Math.fround(left / this.width_), Math.fround(top / this.height_), Math.fround(right / this.width_), Math.fround(bottom / this.height_));
  }
  uvRectBySize(left: number, top: number, width: number, height: number): RectF {
    return this.uvRect(left, top, Math.fround(left + width), Math.fround(top + height));
  }
}

$J.define(SmartTexture, 'com.watabou.gltextures.SmartTexture', { kind: 'class', sup: 'com.watabou.glwrap.Texture', ctors: { 'com.badlogic.gdx.graphics.Pixmap,int,int,boolean': '_SmartTexture$Pixmap$int$int$boolean', 'com.badlogic.gdx.graphics.Pixmap': '_SmartTexture$Pixmap' } });
$J.module(() => {
  RectF = $J.load('com.watabou.utils.RectF');
});
