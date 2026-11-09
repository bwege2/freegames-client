// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Image.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let SmartTexture, TextureCache, Quad, Vertexbuffer, NoosaScript, RectF;

export class Image extends Visual {
  texture_: SmartTexture = null;
  frame_: RectF = null;
  flipHorizontal_: boolean = false;
  flipVertical_: boolean = false;
  vertices: number[] = null;
  verticesBuffer: FloatBuffer = null;
  buffer: Vertexbuffer = null;
  dirty: boolean = false;
  _Image$(): this {
    this._Visual(0, 0, 0, 0);
    this.vertices = $J.newArray(16, 0);
    this.verticesBuffer = Quad.create();
    return this;
  }
  _Image$Image(src: Image): this {
    this._Image$();
    this.copy(src);
    return this;
  }
  _Image$Object(tx: any): this {
    this._Image$();
    this.texture(tx);
    return this;
  }
  _Image$Object$int$int$int$int(tx: any, left: number, top: number, width: number, height: number): this {
    this._Image$Object(tx);
    this.frame$RectF(this.texture_.uvRect(Math.fround(left), Math.fround(top), Math.fround((left + width) | 0), Math.fround((top + height) | 0)));
    return this;
  }
  texture(tx: any): void {
    this.texture_ = tx instanceof SmartTexture ? tx : TextureCache.get(tx);
    this.frame$RectF(new RectF()._RectF$float$float$float$float(0, 0, 1, 1));
  }
  frame$RectF(frame: RectF): void {
    this.frame_ = frame;
    this.width_ = Math.fround(frame.width() * this.texture_.width_);
    this.height_ = Math.fround(frame.height() * this.texture_.height_);
    this.updateFrame();
    this.updateVertices();
  }
  frame$int$int$int$int(left: number, top: number, width: number, height: number): void {
    this.frame$RectF(this.texture_.uvRect(Math.fround(left), Math.fround(top), Math.fround((left + width) | 0), Math.fround((top + height) | 0)));
  }
  frame$(): RectF {
    return new RectF()._RectF$RectF(this.frame_);
  }
  copy(other: Image): void {
    this.texture_ = other.texture_;
    this.frame_ = new RectF()._RectF$RectF(other.frame_);
    this.width_ = other.width_;
    this.height_ = other.height_;
    this.scale_ = other.scale_;
    this.updateFrame();
    this.updateVertices();
    this.rm = other.rm;
    this.gm = other.gm;
    this.bm = other.bm;
    this.am = other.am;
    this.ra = other.ra;
    this.ga = other.ga;
    this.ba = other.ba;
    this.aa = other.aa;
  }
  updateFrame(): void {
    if (this.flipHorizontal_) {
      this.vertices[2] = this.frame_.right_;
      this.vertices[6] = this.frame_.left_;
      this.vertices[10] = this.frame_.left_;
      this.vertices[14] = this.frame_.right_;
    } else {
      this.vertices[2] = this.frame_.left_;
      this.vertices[6] = this.frame_.right_;
      this.vertices[10] = this.frame_.right_;
      this.vertices[14] = this.frame_.left_;
    }
    if (this.flipVertical_) {
      this.vertices[3] = this.frame_.bottom_;
      this.vertices[7] = this.frame_.bottom_;
      this.vertices[11] = this.frame_.top_;
      this.vertices[15] = this.frame_.top_;
    } else {
      this.vertices[3] = this.frame_.top_;
      this.vertices[7] = this.frame_.top_;
      this.vertices[11] = this.frame_.bottom_;
      this.vertices[15] = this.frame_.bottom_;
    }
    this.dirty = true;
  }
  updateVertices(): void {
    this.vertices[0] = 0;
    this.vertices[1] = 0;
    this.vertices[4] = this.width_;
    this.vertices[5] = 0;
    this.vertices[8] = this.width_;
    this.vertices[9] = this.height_;
    this.vertices[12] = 0;
    this.vertices[13] = this.height_;
    this.dirty = true;
  }
  draw(): void {
    if (this.texture_ == null || (!this.dirty && this.buffer == null)) {
      return;
    }
    super.draw();
    if (this.dirty) {
      (this.verticesBuffer).position(0);
      this.verticesBuffer.put(this.vertices);
      if (this.buffer == null) {
        this.buffer = new Vertexbuffer()._Vertexbuffer(this.verticesBuffer);
      } else {
        this.buffer.updateVertices$FloatBuffer(this.verticesBuffer);
      }
      this.dirty = false;
    }
    let script = this.script();
    this.texture_.bind();
    script.camera(this.camera());
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.drawQuad$Vertexbuffer(this.buffer);
  }
  script(): NoosaScript {
    return NoosaScript.get();
  }
  destroy(): void {
    super.destroy();
    if (this.buffer != null) {
      this.buffer.delete();
    }
  }
}

$J.define(Image, 'com.watabou.noosa.Image', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'java.lang.Object,int,int,int,int': '_Image$Object$int$int$int$int', 'java.lang.Object': '_Image$Object', 'com.watabou.noosa.Image': '_Image$Image', '': '_Image$' }, meths: { 'frame()': 'frame$', 'frame(int,int,int,int)': 'frame$int$int$int$int', 'frame(com.watabou.utils.RectF)': 'frame$RectF' } });
$J.module(() => {
  SmartTexture = $J.load('com.watabou.gltextures.SmartTexture');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
  RectF = $J.load('com.watabou.utils.RectF');
});
