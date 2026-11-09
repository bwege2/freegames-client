// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Texture.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ByteBuffer, ByteOrder, Gdx, JObject } from '../../../../jre/index.ts';

export class Texture extends JObject {
  static NEAREST: number = 0;
  static LINEAR: number = 0;
  static REPEAT: number = 0;
  static MIRROR: number = 0;
  static CLAMP: number = 0;
  id_: number = 0;
  static bound_id: number = 0;
  premultiplied: boolean = false;
  _Texture(): this {
    this.id_ = -1;
    this.premultiplied = false;
    return this;
  }
  generate(): void {
    this.id_ = Gdx.gl.glGenTexture();
  }
  static activate(index: number): void {
    Gdx.gl.glActiveTexture((33984 + index) | 0);
  }
  bind(): void {
    if (this.id_ === -1) {
      this.generate();
    }
    if (this.id_ !== Texture.bound_id) {
      Gdx.gl.glBindTexture(3553, this.id_);
      Texture.bound_id = this.id_;
    }
  }
  static clear(): void {
    Texture.bound_id = 0;
  }
  filter(minMode: number, maxMode: number): void {
    this.bind();
    Gdx.gl.glTexParameterf(3553, 10241, Math.fround(minMode));
    Gdx.gl.glTexParameterf(3553, 10240, Math.fround(maxMode));
  }
  wrap(s: number, t: number): void {
    this.bind();
    Gdx.gl.glTexParameterf(3553, 10242, Math.fround(s));
    Gdx.gl.glTexParameterf(3553, 10243, Math.fround(t));
  }
  delete(): void {
    if (Texture.bound_id === this.id_) {
      Texture.bound_id = 0;
    }
    Gdx.gl.glDeleteTexture(this.id_);
  }
  bitmap(pixmap: Pixmap): void {
    this.bind();
    Gdx.gl.glTexImage2D(3553, 0, pixmap.getGLInternalFormat(), pixmap.getWidth(), pixmap.getHeight(), 0, pixmap.getGLFormat(), pixmap.getGLType(), pixmap.getPixels());
    this.premultiplied = true;
  }
  pixels$int$int$intArr(w: number, h: number, pixels: number[]): void {
    this.bind();
    let imageBuffer = ByteBuffer.allocateDirect(Math.imul(Math.imul(w, h), 4)).order(ByteOrder.nativeOrder()).asIntBuffer();
    imageBuffer.put(pixels);
    (imageBuffer).position(0);
    Gdx.gl.glTexImage2D(3553, 0, 6408, w, h, 0, 6408, 5121, imageBuffer);
  }
  pixels$int$int$byteArr(w: number, h: number, pixels: number[]): void {
    this.bind();
    let imageBuffer = ByteBuffer.allocateDirect(Math.imul(w, h)).order(ByteOrder.nativeOrder());
    imageBuffer.put(pixels);
    (imageBuffer).position(0);
    Gdx.gl.glPixelStorei(3317, 1);
    Gdx.gl.glTexImage2D(3553, 0, 6406, w, h, 0, 6406, 5121, imageBuffer);
  }
  static create$Pixmap(pix: Pixmap): Texture {
    let tex = new Texture()._Texture();
    tex.bitmap(pix);
    return tex;
  }
  static create$int$int$intArr(width: number, height: number, pixels: number[]): Texture {
    let tex = new Texture()._Texture();
    tex.pixels$int$int$intArr(width, height, pixels);
    return tex;
  }
  static create$int$int$byteArr(width: number, height: number, pixels: number[]): Texture {
    let tex = new Texture()._Texture();
    tex.pixels$int$int$byteArr(width, height, pixels);
    return tex;
  }
  static $clinit() {
    Texture.NEAREST = 9728;
    Texture.LINEAR = 9729;
    Texture.REPEAT = 10497;
    Texture.MIRROR = 33648;
    Texture.CLAMP = 33071;
    Texture.bound_id = 0;
  }
}

$J.define(Texture, 'com.watabou.glwrap.Texture', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Texture' }, meths: { 'create(int,int,byte[])': 'create$int$int$byteArr', 'create(int,int,int[])': 'create$int$int$intArr', 'create(com.badlogic.gdx.graphics.Pixmap)': 'create$Pixmap', 'pixels(int,int,byte[])': 'pixels$int$int$byteArr', 'pixels(int,int,int[])': 'pixels$int$int$intArr' }, clinit: true, lazy: ['NEAREST', 'LINEAR', 'REPEAT', 'MIRROR', 'CLAMP', 'bound_id'] });
