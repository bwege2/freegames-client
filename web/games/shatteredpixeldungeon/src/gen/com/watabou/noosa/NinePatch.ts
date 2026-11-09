// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/NinePatch.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Visual } from './Visual.ts';

let TextureCache, Quad, Vertexbuffer, NoosaScript;

export class NinePatch extends Visual {
  texture_: SmartTexture = null;
  vertices: number[] = null;
  quads: FloatBuffer = null;
  buffer: Vertexbuffer = null;
  outterF: RectF = null;
  innerF: RectF = null;
  marginLeft_: number = 0;
  marginRight_: number = 0;
  marginTop_: number = 0;
  marginBottom_: number = 0;
  nWidth: number = 0;
  nHeight: number = 0;
  flipHorizontal_: boolean = false;
  flipVertical_: boolean = false;
  dirty: boolean = false;
  _NinePatch$Object$int(tx: any, margin: number): this {
    this._NinePatch$Object$int$int$int$int(tx, margin, margin, margin, margin);
    return this;
  }
  _NinePatch$Object$int$int$int$int(tx: any, left: number, top: number, right: number, bottom: number): this {
    this._NinePatch$Object$int$int$int$int$int$int$int$int(tx, 0, 0, 0, 0, left, top, right, bottom);
    return this;
  }
  _NinePatch$Object$int$int$int$int$int(tx: any, x: number, y: number, w: number, h: number, margin: number): this {
    this._NinePatch$Object$int$int$int$int$int$int$int$int(tx, x, y, w, h, margin, margin, margin, margin);
    return this;
  }
  _NinePatch$Object$int$int$int$int$int$int$int$int(tx: any, x: number, y: number, w: number, h: number, left: number, top: number, right: number, bottom: number): this {
    this._Visual(0, 0, 0, 0);
    this.texture_ = TextureCache.get(tx);
    w = w === 0 ? this.texture_.width_ : w;
    h = h === 0 ? this.texture_.height_ : h;
    this.nWidth = this.width_ = Math.fround(w);
    this.nHeight = this.height_ = Math.fround(h);
    this.vertices = $J.newArray(16, 0);
    this.quads = Quad.createSet(9);
    this.marginLeft_ = left;
    this.marginRight_ = right;
    this.marginTop_ = top;
    this.marginBottom_ = bottom;
    this.outterF = this.texture_.uvRect(Math.fround(x), Math.fround(y), Math.fround((x + w) | 0), Math.fround((y + h) | 0));
    this.innerF = this.texture_.uvRect(Math.fround((x + left) | 0), Math.fround((y + top) | 0), Math.fround((x + w - right) | 0), Math.fround((y + h - bottom) | 0));
    this.updateVertices();
    return this;
  }
  updateVertices(): void {
    (this.quads).position(0);
    let right = Math.fround(this.width_ - this.marginRight_);
    let bottom = Math.fround(this.height_ - this.marginBottom_);
    let outleft = this.flipHorizontal_ ? this.outterF.right_ : this.outterF.left_;
    let outright = this.flipHorizontal_ ? this.outterF.left_ : this.outterF.right_;
    let outtop = this.flipVertical_ ? this.outterF.bottom_ : this.outterF.top_;
    let outbottom = this.flipVertical_ ? this.outterF.top_ : this.outterF.bottom_;
    let inleft = this.flipHorizontal_ ? this.innerF.right_ : this.innerF.left_;
    let inright = this.flipHorizontal_ ? this.innerF.left_ : this.innerF.right_;
    let intop = this.flipVertical_ ? this.innerF.bottom_ : this.innerF.top_;
    let inbottom = this.flipVertical_ ? this.innerF.top_ : this.innerF.bottom_;
    Quad.fill(this.vertices, 0, Math.fround(this.marginLeft_), 0, Math.fround(this.marginTop_), outleft, inleft, outtop, intop);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, Math.fround(this.marginLeft_), right, 0, Math.fround(this.marginTop_), inleft, inright, outtop, intop);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, right, this.width_, 0, Math.fround(this.marginTop_), inright, outright, outtop, intop);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, 0, Math.fround(this.marginLeft_), Math.fround(this.marginTop_), bottom, outleft, inleft, intop, inbottom);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, Math.fround(this.marginLeft_), right, Math.fround(this.marginTop_), bottom, inleft, inright, intop, inbottom);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, right, this.width_, Math.fround(this.marginTop_), bottom, inright, outright, intop, inbottom);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, 0, Math.fround(this.marginLeft_), bottom, this.height_, outleft, inleft, inbottom, outbottom);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, Math.fround(this.marginLeft_), right, bottom, this.height_, inleft, inright, inbottom, outbottom);
    this.quads.put(this.vertices);
    Quad.fill(this.vertices, right, this.width_, bottom, this.height_, inright, outright, inbottom, outbottom);
    this.quads.put(this.vertices);
    this.dirty = true;
  }
  marginLeft(): number {
    return this.marginLeft_;
  }
  marginRight(): number {
    return this.marginRight_;
  }
  marginTop(): number {
    return this.marginTop_;
  }
  marginBottom(): number {
    return this.marginBottom_;
  }
  marginHor(): number {
    return (this.marginLeft_ + this.marginRight_) | 0;
  }
  marginVer(): number {
    return (this.marginTop_ + this.marginBottom_) | 0;
  }
  innerWidth(): number {
    return Math.fround(Math.fround(this.width_ - this.marginLeft_) - this.marginRight_);
  }
  innerHeight(): number {
    return Math.fround(Math.fround(this.height_ - this.marginTop_) - this.marginBottom_);
  }
  innerRight(): number {
    return Math.fround(this.width_ - this.marginRight_);
  }
  innerBottom(): number {
    return Math.fround(this.height_ - this.marginBottom_);
  }
  flipHorizontal(value: boolean): void {
    if (this.flipHorizontal_ !== value) {
      this.flipHorizontal_ = value;
      this.updateVertices();
    }
  }
  flipVertical(value: boolean): void {
    if (this.flipVertical_ !== value) {
      this.flipVertical_ = value;
      this.updateVertices();
    }
  }
  size(width: number, height: number): void {
    this.width_ = width;
    this.height_ = height;
    this.updateVertices();
  }
  draw(): void {
    super.draw();
    if (this.dirty) {
      if (this.buffer == null) {
        this.buffer = new Vertexbuffer()._Vertexbuffer(this.quads);
      } else {
        this.buffer.updateVertices$FloatBuffer(this.quads);
      }
      this.dirty = false;
    }
    let script = NoosaScript.get();
    this.texture_.bind();
    script.camera(this.camera());
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.drawQuadSet$Vertexbuffer$int$int(this.buffer, 9, 0);
  }
  destroy(): void {
    super.destroy();
    if (this.buffer != null) {
      this.buffer.delete();
    }
  }
}

$J.define(NinePatch, 'com.watabou.noosa.NinePatch', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'java.lang.Object,int,int,int,int,int,int,int,int': '_NinePatch$Object$int$int$int$int$int$int$int$int', 'java.lang.Object,int,int,int,int,int': '_NinePatch$Object$int$int$int$int$int', 'java.lang.Object,int,int,int,int': '_NinePatch$Object$int$int$int$int', 'java.lang.Object,int': '_NinePatch$Object$int' } });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
});
