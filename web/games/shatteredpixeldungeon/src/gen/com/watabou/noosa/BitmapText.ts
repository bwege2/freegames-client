// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/BitmapText.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../jre/index.ts';
import { Visual } from './Visual.ts';
import { TextureFilm } from './TextureFilm.ts';

let Matrix, Quad, Vertexbuffer, NoosaScript, RectF;

export class BitmapText extends Visual {
  text_: string = null;
  font: BitmapText$Font = null;
  vertices: number[] = null;
  quads: FloatBuffer = null;
  buffer: Vertexbuffer = null;
  realLength: number = 0;
  dirty: boolean = false;
  $init_BitmapText() {
    this.vertices = $J.newArray(16, 0);
    this.dirty = true;
  }
  _BitmapText$(): this {
    this._BitmapText$String$Font('', null);
    return this;
  }
  _BitmapText$Font(font: BitmapText$Font): this {
    this._BitmapText$String$Font('', font);
    return this;
  }
  _BitmapText$String$Font(text: string, font: BitmapText$Font): this {
    this._Visual(0, 0, 0, 0);
    this.$init_BitmapText();
    this.text_ = text;
    this.font = font;
    return this;
  }
  updateMatrix(): void {
    Matrix.setIdentity(this.matrix);
    Matrix.translate(this.matrix, this.x, this.y);
    Matrix.scale(this.matrix, this.scale_.x, this.scale_.y);
    Matrix.rotate(this.matrix, this.angle);
  }
  draw(): void {
    super.draw();
    if (this.dirty) {
      this.updateVertices();
      (this.quads).limit(this.quads.position());
      if (this.buffer == null) {
        this.buffer = new Vertexbuffer()._Vertexbuffer(this.quads);
      } else {
        this.buffer.updateVertices$FloatBuffer(this.quads);
      }
    }
    let script = NoosaScript.get();
    this.font.texture_.bind();
    script.camera(this.camera());
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.drawQuadSet$Vertexbuffer$int$int(this.buffer, this.realLength, 0);
  }
  destroy(): void {
    super.destroy();
    if (this.buffer != null) {
      this.buffer.delete();
    }
  }
  updateVertices(): void {
    this.width_ = 0;
    this.height_ = 0;
    if (this.text_ == null) {
      this.text_ = '';
    }
    this.quads = Quad.createSet(this.text_.length);
    this.realLength = 0;
    let length = this.text_.length;
    for (let i = 0; i < length; i++) {
      let rect = this.font.get$char(this.text_.charCodeAt(i));
      if (rect == null) {
        rect = null;
      }
      let w = this.font.width$RectF(rect);
      let h = this.font.height$RectF(rect);
      this.vertices[0] = this.width_;
      this.vertices[1] = 0;
      this.vertices[2] = rect.left_;
      this.vertices[3] = rect.top_;
      this.vertices[4] = Math.fround(this.width_ + w);
      this.vertices[5] = 0;
      this.vertices[6] = rect.right_;
      this.vertices[7] = rect.top_;
      this.vertices[8] = Math.fround(this.width_ + w);
      this.vertices[9] = h;
      this.vertices[10] = rect.right_;
      this.vertices[11] = rect.bottom_;
      this.vertices[12] = this.width_;
      this.vertices[13] = h;
      this.vertices[14] = rect.left_;
      this.vertices[15] = rect.bottom_;
      this.quads.put(this.vertices);
      this.realLength++;
      this.width_ = Math.fround(this.width_ + Math.fround(w + this.font.tracking));
      if (h > this.height_) {
        this.height_ = h;
      }
    }
    if (length > 0) {
      this.width_ = Math.fround(this.width_ - this.font.tracking);
    }
    this.dirty = false;
  }
  measure(): void {
    this.width_ = 0;
    this.height_ = 0;
    if (this.text_ == null) {
      this.text_ = '';
    }
    let length = this.text_.length;
    for (let i = 0; i < length; i++) {
      let rect = this.font.get$char(this.text_.charCodeAt(i));
      let w = this.font.width$RectF(rect);
      let h = this.font.height$RectF(rect);
      this.width_ = Math.fround(this.width_ + Math.fround(w + this.font.tracking));
      if (h > this.height_) {
        this.height_ = h;
      }
    }
    if (length > 0) {
      this.width_ = Math.fround(this.width_ - this.font.tracking);
    }
  }
  baseLine(): number {
    return Math.fround(this.font.baseLine_ * this.scale_.y);
  }
  font$(): BitmapText$Font {
    return this.font;
  }
  font$Font(value: BitmapText$Font): void {
    this.font = value;
  }
  text$(): string {
    return this.text_;
  }
  text$String(str: string): void {
    if (str == null || !$J.equals(str, this.text_)) {
      this.text_ = str;
      this.dirty = true;
    }
  }
}

export class BitmapText$Font extends TextureFilm {
  static readonly LATIN_FULL: string = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
  texture_: SmartTexture = null;
  tracking: number = 0;
  baseLine_: number = 0;
  lineHeight: number = 0;
  $init_BitmapText_Font() {
    this.tracking = 0;
  }
  _BitmapText$Font$SmartTexture(tx: SmartTexture): this {
    this._TextureFilm$Object(tx);
    this.$init_BitmapText_Font();
    this.texture_ = tx;
    return this;
  }
  _BitmapText$Font$SmartTexture$int$String(tx: SmartTexture, width: number, chars: string): this {
    this._BitmapText$Font$SmartTexture$int$int$String(tx, width, tx.height_, chars);
    return this;
  }
  _BitmapText$Font$SmartTexture$int$int$String(tx: SmartTexture, width: number, height: number, chars: string): this {
    this._TextureFilm$Object(tx);
    this.$init_BitmapText_Font();
    this.texture_ = tx;
    let length = chars.length;
    let uw = Math.fround(Math.fround(width) / tx.width_);
    let vh = Math.fround(Math.fround(height) / tx.height_);
    let left = 0;
    let top = 0;
    let bottom = vh;
    for (let i = 0; i < length; i++) {
      let rect = new RectF()._RectF$float$float$float$float(left, top, left = Math.fround(left + uw), bottom);
      this.add$Object$RectF(chars.charCodeAt(i), rect);
      if (left >= Math.fround(1)) {
        left = 0;
        top = bottom;
        bottom = Math.fround(bottom + vh);
      }
    }
    this.lineHeight = this.baseLine_ = Math.fround(height);
    return this;
  }
  splitBy(bitmap: Pixmap, height: number, color: number, chars: string): void {
    let length = chars.length;
    let width = bitmap.getWidth();
    let vHeight = Math.fround(Math.fround(height) / bitmap.getHeight());
    let pos: number;
    let line = 0;
    spaceMeasuring:
    for (pos = 0; pos < width; pos++) {
      for (let j = 0; j < height; j++) {
        if (bitmap.getPixel(pos, j) !== color) {
          break spaceMeasuring;
        }
      }
    }
    this.add$Object$RectF(32 /* ' ' */, new RectF()._RectF$float$float$float$float(0, 0, Math.fround(Math.fround(pos) / width), Math.fround(vHeight - Math.fround(0.01))));
    let separator = pos;
    for (let i = 0; i < length; i++) {
      let ch = chars.charCodeAt(i);
      if (ch === 32 /* ' ' */) {
        continue;
      } else {
        let found: boolean;
        do {
          if (separator >= width) {
            line = (line + height) | 0;
            separator = 0;
          }
          found = false;
          for (let j = line; j < ((line + height) | 0); j++) {
            if (this.colorNotMatch(bitmap, separator, j, color)) {
              found = true;
              break;
            }
          }
          if (!found) {
            separator++;
          }
        } while (!found);
        let start = separator;
        do {
          if (++separator >= width) {
            line = (line + height) | 0;
            separator = start = 0;
            if (((line + height) | 0) >= bitmap.getHeight()) {
              break;
            }
          }
          found = true;
          for (let j = line; j < ((line + height) | 0); j++) {
            if (this.colorNotMatch(bitmap, separator, j, color)) {
              found = false;
              break;
            }
          }
        } while (!found);
        this.add$Object$RectF(ch, new RectF()._RectF$float$float$float$float(Math.fround(Math.fround(start) / width), Math.fround(Math.fround(line) / bitmap.getHeight()), Math.fround(Math.fround(separator) / width), Math.fround(Math.fround(Math.fround(line) / bitmap.getHeight()) + vHeight)));
        separator++;
      }
    }
    this.lineHeight = this.baseLine_ = this.height$RectF(this.frames.get(chars.charCodeAt(0)));
  }
  colorNotMatch(pixmap: Pixmap, x: number, y: number, color: number): boolean {
    let pixel = pixmap.getPixel(x, y);
    if ((pixel & 255) === 0) {
      return color !== 0;
    }
    return pixel !== color;
  }
  static colorMarked$SmartTexture$int$String(tex: SmartTexture, color: number, chars: string): BitmapText$Font {
    let font = new BitmapText$Font()._BitmapText$Font$SmartTexture(tex);
    font.splitBy(tex.bitmap_, tex.height_, color, chars);
    return font;
  }
  static colorMarked$SmartTexture$int$int$String(tex: SmartTexture, height: number, color: number, chars: string): BitmapText$Font {
    let font = new BitmapText$Font()._BitmapText$Font$SmartTexture(tex);
    font.splitBy(tex.bitmap_, height, color, chars);
    return font;
  }
  get$char(ch: number): RectF {
    if (this.frames.containsKey(ch)) {
      return super.get$Object(ch);
    } else {
      return super.get$Object(63 /* '?' */);
    }
  }
}

$J.define(BitmapText, 'com.watabou.noosa.BitmapText', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'java.lang.String,com.watabou.noosa.BitmapText$Font': '_BitmapText$String$Font', 'com.watabou.noosa.BitmapText$Font': '_BitmapText$Font', '': '_BitmapText$' }, meths: { 'text(java.lang.String)': 'text$String', 'text()': 'text$', 'font(com.watabou.noosa.BitmapText$Font)': 'font$Font', 'font()': 'font$' } });
$J.define(BitmapText$Font, 'com.watabou.noosa.BitmapText$Font', { kind: 'class', sup: 'com.watabou.noosa.TextureFilm', ctors: { 'com.watabou.gltextures.SmartTexture,int,int,java.lang.String': '_BitmapText$Font$SmartTexture$int$int$String', 'com.watabou.gltextures.SmartTexture,int,java.lang.String': '_BitmapText$Font$SmartTexture$int$String', 'com.watabou.gltextures.SmartTexture': '_BitmapText$Font$SmartTexture' }, meths: { 'get(char)': 'get$char', 'colorMarked(com.watabou.gltextures.SmartTexture,int,int,java.lang.String)': 'colorMarked$SmartTexture$int$int$String', 'colorMarked(com.watabou.gltextures.SmartTexture,int,java.lang.String)': 'colorMarked$SmartTexture$int$String' } });
$J.module(() => {
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
  RectF = $J.load('com.watabou.utils.RectF');
});
