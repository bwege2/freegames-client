// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/SkinnedBlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Image } from './Image.ts';

let Texture, RectF;

export class SkinnedBlock extends Image {
  scaleX: number = 0;
  scaleY: number = 0;
  offsetX_: number = 0;
  offsetY_: number = 0;
  autoAdjust: boolean = false;
  _SkinnedBlock(width: number, height: number, tx: any): this {
    this._Image$Object(tx);
    this.autoAdjust = false;
    this.texture_.wrap(Texture.REPEAT, Texture.REPEAT);
    this.size(width, height);
    return this;
  }
  frame$RectF(frame: RectF): void {
    this.scaleX = 1;
    this.scaleY = 1;
    this.offsetX_ = 0;
    this.offsetY_ = 0;
    super.frame$RectF(new RectF()._RectF$float$float$float$float(0, 0, 1, 1));
  }
  updateFrame(): void {
    if (this.autoAdjust) {
      while (this.offsetX_ > Math.fround(this.texture_.width_)) {
        this.offsetX_ = Math.fround(this.offsetX_ - this.texture_.width_);
      }
      while (this.offsetX_ < Math.fround(-this.texture_.width_)) {
        this.offsetX_ = Math.fround(this.offsetX_ + this.texture_.width_);
      }
      while (this.offsetY_ > Math.fround(this.texture_.height_)) {
        this.offsetY_ = Math.fround(this.offsetY_ - this.texture_.height_);
      }
      while (this.offsetY_ < Math.fround(-this.texture_.height_)) {
        this.offsetY_ = Math.fround(this.offsetY_ + this.texture_.height_);
      }
    }
    let tw = Math.fround(1 / this.texture_.width_);
    let th = Math.fround(1 / this.texture_.height_);
    let u0 = Math.fround(this.offsetX_ * tw);
    let v0 = Math.fround(this.offsetY_ * th);
    let u1 = Math.fround(u0 + Math.fround(Math.fround(this.width_ * tw) / this.scaleX));
    let v1 = Math.fround(v0 + Math.fround(Math.fround(this.height_ * th) / this.scaleY));
    this.vertices[2] = u0;
    this.vertices[3] = v0;
    this.vertices[6] = u1;
    this.vertices[7] = v0;
    this.vertices[10] = u1;
    this.vertices[11] = v1;
    this.vertices[14] = u0;
    this.vertices[15] = v1;
    this.dirty = true;
  }
  offsetTo(x: number, y: number): void {
    this.offsetX_ = x;
    this.offsetY_ = y;
    this.updateFrame();
  }
  offset(x: number, y: number): void {
    this.offsetX_ = Math.fround(this.offsetX_ + x);
    this.offsetY_ = Math.fround(this.offsetY_ + y);
    this.updateFrame();
  }
  offsetX(): number {
    return this.offsetX_;
  }
  offsetY(): number {
    return this.offsetY_;
  }
  scale(x: number, y: number): void {
    this.scaleX = x;
    this.scaleY = y;
    this.updateFrame();
  }
  size(w: number, h: number): void {
    this.width_ = w;
    this.height_ = h;
    this.updateFrame();
    this.updateVertices();
  }
}

$J.define(SkinnedBlock, 'com.watabou.noosa.SkinnedBlock', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'float,float,java.lang.Object': '_SkinnedBlock' }, meths: { 'frame(com.watabou.utils.RectF)': 'frame$RectF' } });
$J.module(() => {
  Texture = $J.load('com.watabou.glwrap.Texture');
  RectF = $J.load('com.watabou.utils.RectF');
});
