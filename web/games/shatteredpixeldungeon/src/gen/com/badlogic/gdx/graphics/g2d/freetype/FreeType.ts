// @ts-nocheck
// FreeType.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, BufferUtils, GdxRuntimeException, IOException, JObject, LongMap, Pixmap, Pixmap_Blending, Pixmap_Format, SharedLibraryLoader, StreamUtils } from '../../../../../../../jre/index.ts';

let Color;

export class FreeType extends JObject {
  static FT_PIXEL_MODE_NONE: number = 0;
  static FT_PIXEL_MODE_MONO: number = 0;
  static FT_PIXEL_MODE_GRAY: number = 0;
  static FT_PIXEL_MODE_GRAY2: number = 0;
  static FT_PIXEL_MODE_GRAY4: number = 0;
  static FT_PIXEL_MODE_LCD: number = 0;
  static FT_PIXEL_MODE_LCD_V: number = 0;
  static FT_ENCODING_NONE: number = 0;
  static FT_ENCODING_MS_SYMBOL: number = 0;
  static FT_ENCODING_UNICODE: number = 0;
  static FT_ENCODING_SJIS: number = 0;
  static FT_ENCODING_GB2312: number = 0;
  static FT_ENCODING_BIG5: number = 0;
  static FT_ENCODING_WANSUNG: number = 0;
  static FT_ENCODING_JOHAB: number = 0;
  static FT_ENCODING_ADOBE_STANDARD: number = 0;
  static FT_ENCODING_ADOBE_EXPERT: number = 0;
  static FT_ENCODING_ADOBE_CUSTOM: number = 0;
  static FT_ENCODING_ADOBE_LATIN_1: number = 0;
  static FT_ENCODING_OLD_LATIN_2: number = 0;
  static FT_ENCODING_APPLE_ROMAN: number = 0;
  static FT_FACE_FLAG_SCALABLE: number = 0;
  static FT_FACE_FLAG_FIXED_SIZES: number = 0;
  static FT_FACE_FLAG_FIXED_WIDTH: number = 0;
  static FT_FACE_FLAG_SFNT: number = 0;
  static FT_FACE_FLAG_HORIZONTAL: number = 0;
  static FT_FACE_FLAG_VERTICAL: number = 0;
  static FT_FACE_FLAG_KERNING: number = 0;
  static FT_FACE_FLAG_FAST_GLYPHS: number = 0;
  static FT_FACE_FLAG_MULTIPLE_MASTERS: number = 0;
  static FT_FACE_FLAG_GLYPH_NAMES: number = 0;
  static FT_FACE_FLAG_EXTERNAL_STREAM: number = 0;
  static FT_FACE_FLAG_HINTER: number = 0;
  static FT_FACE_FLAG_CID_KEYED: number = 0;
  static FT_FACE_FLAG_TRICKY: number = 0;
  static FT_STYLE_FLAG_ITALIC: number = 0;
  static FT_STYLE_FLAG_BOLD: number = 0;
  static FT_LOAD_DEFAULT: number = 0;
  static FT_LOAD_NO_SCALE: number = 0;
  static FT_LOAD_NO_HINTING: number = 0;
  static FT_LOAD_RENDER: number = 0;
  static FT_LOAD_NO_BITMAP: number = 0;
  static FT_LOAD_VERTICAL_LAYOUT: number = 0;
  static FT_LOAD_FORCE_AUTOHINT: number = 0;
  static FT_LOAD_CROP_BITMAP: number = 0;
  static FT_LOAD_PEDANTIC: number = 0;
  static FT_LOAD_IGNORE_GLOBAL_ADVANCE_WIDTH: number = 0;
  static FT_LOAD_NO_RECURSE: number = 0;
  static FT_LOAD_IGNORE_TRANSFORM: number = 0;
  static FT_LOAD_MONOCHROME: number = 0;
  static FT_LOAD_LINEAR_DESIGN: number = 0;
  static FT_LOAD_NO_AUTOHINT: number = 0;
  static FT_LOAD_TARGET_NORMAL: number = 0;
  static FT_LOAD_TARGET_LIGHT: number = 0;
  static FT_LOAD_TARGET_MONO: number = 0;
  static FT_LOAD_TARGET_LCD: number = 0;
  static FT_LOAD_TARGET_LCD_V: number = 0;
  static FT_RENDER_MODE_NORMAL: number = 0;
  static FT_RENDER_MODE_LIGHT: number = 0;
  static FT_RENDER_MODE_MONO: number = 0;
  static FT_RENDER_MODE_LCD: number = 0;
  static FT_RENDER_MODE_LCD_V: number = 0;
  static FT_RENDER_MODE_MAX: number = 0;
  static FT_KERNING_DEFAULT: number = 0;
  static FT_KERNING_UNFITTED: number = 0;
  static FT_KERNING_UNSCALED: number = 0;
  static FT_STROKER_LINECAP_BUTT: number = 0;
  static FT_STROKER_LINECAP_ROUND: number = 0;
  static FT_STROKER_LINECAP_SQUARE: number = 0;
  static FT_STROKER_LINEJOIN_ROUND: number = 0;
  static FT_STROKER_LINEJOIN_BEVEL: number = 0;
  static FT_STROKER_LINEJOIN_MITER_VARIABLE: number = 0;
  static FT_STROKER_LINEJOIN_MITER: number = 0;
  static FT_STROKER_LINEJOIN_MITER_FIXED: number = 0;
  static getLastErrorCode(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType', 'getLastErrorCode', this, $a);
  }
  static encode(a: number, b: number, c: number, d: number): number {
    return (a << 24) | (b << 16) | (c << 8) | d;
  }
  static initFreeType(): FreeType$Library {
    new SharedLibraryLoader().load('gdx-freetype');
    let address = FreeType.initFreeTypeJni();
    if (address === 0n) {
      throw new GdxRuntimeException('Couldn\'t initialize FreeType library, FreeType error code: ' + FreeType.getLastErrorCode());
    } else {
      return new FreeType$Library()._FreeType$Library(address);
    }
  }
  static initFreeTypeJni(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType', 'initFreeTypeJni', this, $a);
  }
  static toInt(value: number): number {
    return (((value + 63) | 0) & -64) >> 6;
  }
  static $clinit() {
    FreeType.FT_PIXEL_MODE_NONE = 0;
    FreeType.FT_PIXEL_MODE_MONO = 1;
    FreeType.FT_PIXEL_MODE_GRAY = 2;
    FreeType.FT_PIXEL_MODE_GRAY2 = 3;
    FreeType.FT_PIXEL_MODE_GRAY4 = 4;
    FreeType.FT_PIXEL_MODE_LCD = 5;
    FreeType.FT_PIXEL_MODE_LCD_V = 6;
    FreeType.FT_ENCODING_NONE = 0;
    FreeType.FT_ENCODING_MS_SYMBOL = FreeType.encode(115 /* 's' */, 121 /* 'y' */, 109 /* 'm' */, 98 /* 'b' */);
    FreeType.FT_ENCODING_UNICODE = FreeType.encode(117 /* 'u' */, 110 /* 'n' */, 105 /* 'i' */, 99 /* 'c' */);
    FreeType.FT_ENCODING_SJIS = FreeType.encode(115 /* 's' */, 106 /* 'j' */, 105 /* 'i' */, 115 /* 's' */);
    FreeType.FT_ENCODING_GB2312 = FreeType.encode(103 /* 'g' */, 98 /* 'b' */, 32 /* ' ' */, 32 /* ' ' */);
    FreeType.FT_ENCODING_BIG5 = FreeType.encode(98 /* 'b' */, 105 /* 'i' */, 103 /* 'g' */, 53 /* '5' */);
    FreeType.FT_ENCODING_WANSUNG = FreeType.encode(119 /* 'w' */, 97 /* 'a' */, 110 /* 'n' */, 115 /* 's' */);
    FreeType.FT_ENCODING_JOHAB = FreeType.encode(106 /* 'j' */, 111 /* 'o' */, 104 /* 'h' */, 97 /* 'a' */);
    FreeType.FT_ENCODING_ADOBE_STANDARD = FreeType.encode(65 /* 'A' */, 68 /* 'D' */, 79 /* 'O' */, 66 /* 'B' */);
    FreeType.FT_ENCODING_ADOBE_EXPERT = FreeType.encode(65 /* 'A' */, 68 /* 'D' */, 66 /* 'B' */, 69 /* 'E' */);
    FreeType.FT_ENCODING_ADOBE_CUSTOM = FreeType.encode(65 /* 'A' */, 68 /* 'D' */, 66 /* 'B' */, 67 /* 'C' */);
    FreeType.FT_ENCODING_ADOBE_LATIN_1 = FreeType.encode(108 /* 'l' */, 97 /* 'a' */, 116 /* 't' */, 49 /* '1' */);
    FreeType.FT_ENCODING_OLD_LATIN_2 = FreeType.encode(108 /* 'l' */, 97 /* 'a' */, 116 /* 't' */, 50 /* '2' */);
    FreeType.FT_ENCODING_APPLE_ROMAN = FreeType.encode(97 /* 'a' */, 114 /* 'r' */, 109 /* 'm' */, 110 /* 'n' */);
    FreeType.FT_FACE_FLAG_SCALABLE = (1 << 0);
    FreeType.FT_FACE_FLAG_FIXED_SIZES = (1 << 1);
    FreeType.FT_FACE_FLAG_FIXED_WIDTH = (1 << 2);
    FreeType.FT_FACE_FLAG_SFNT = (1 << 3);
    FreeType.FT_FACE_FLAG_HORIZONTAL = (1 << 4);
    FreeType.FT_FACE_FLAG_VERTICAL = (1 << 5);
    FreeType.FT_FACE_FLAG_KERNING = (1 << 6);
    FreeType.FT_FACE_FLAG_FAST_GLYPHS = (1 << 7);
    FreeType.FT_FACE_FLAG_MULTIPLE_MASTERS = (1 << 8);
    FreeType.FT_FACE_FLAG_GLYPH_NAMES = (1 << 9);
    FreeType.FT_FACE_FLAG_EXTERNAL_STREAM = (1 << 10);
    FreeType.FT_FACE_FLAG_HINTER = (1 << 11);
    FreeType.FT_FACE_FLAG_CID_KEYED = (1 << 12);
    FreeType.FT_FACE_FLAG_TRICKY = (1 << 13);
    FreeType.FT_STYLE_FLAG_ITALIC = (1 << 0);
    FreeType.FT_STYLE_FLAG_BOLD = (1 << 1);
    FreeType.FT_LOAD_DEFAULT = 0;
    FreeType.FT_LOAD_NO_SCALE = 1;
    FreeType.FT_LOAD_NO_HINTING = 2;
    FreeType.FT_LOAD_RENDER = 4;
    FreeType.FT_LOAD_NO_BITMAP = 8;
    FreeType.FT_LOAD_VERTICAL_LAYOUT = 16;
    FreeType.FT_LOAD_FORCE_AUTOHINT = 32;
    FreeType.FT_LOAD_CROP_BITMAP = 64;
    FreeType.FT_LOAD_PEDANTIC = 128;
    FreeType.FT_LOAD_IGNORE_GLOBAL_ADVANCE_WIDTH = 512;
    FreeType.FT_LOAD_NO_RECURSE = 1024;
    FreeType.FT_LOAD_IGNORE_TRANSFORM = 2048;
    FreeType.FT_LOAD_MONOCHROME = 4096;
    FreeType.FT_LOAD_LINEAR_DESIGN = 8192;
    FreeType.FT_LOAD_NO_AUTOHINT = 32768;
    FreeType.FT_LOAD_TARGET_NORMAL = 0;
    FreeType.FT_LOAD_TARGET_LIGHT = 65536;
    FreeType.FT_LOAD_TARGET_MONO = 131072;
    FreeType.FT_LOAD_TARGET_LCD = 196608;
    FreeType.FT_LOAD_TARGET_LCD_V = 262144;
    FreeType.FT_RENDER_MODE_NORMAL = 0;
    FreeType.FT_RENDER_MODE_LIGHT = 1;
    FreeType.FT_RENDER_MODE_MONO = 2;
    FreeType.FT_RENDER_MODE_LCD = 3;
    FreeType.FT_RENDER_MODE_LCD_V = 4;
    FreeType.FT_RENDER_MODE_MAX = 5;
    FreeType.FT_KERNING_DEFAULT = 0;
    FreeType.FT_KERNING_UNFITTED = 1;
    FreeType.FT_KERNING_UNSCALED = 2;
    FreeType.FT_STROKER_LINECAP_BUTT = 0;
    FreeType.FT_STROKER_LINECAP_ROUND = 1;
    FreeType.FT_STROKER_LINECAP_SQUARE = 2;
    FreeType.FT_STROKER_LINEJOIN_ROUND = 0;
    FreeType.FT_STROKER_LINEJOIN_BEVEL = 1;
    FreeType.FT_STROKER_LINEJOIN_MITER_VARIABLE = 2;
    FreeType.FT_STROKER_LINEJOIN_MITER = FreeType.FT_STROKER_LINEJOIN_MITER_VARIABLE;
    FreeType.FT_STROKER_LINEJOIN_MITER_FIXED = 3;
  }
}

export class FreeType$Pointer extends JObject {
  address: bigint = 0n;
  _FreeType$Pointer(address: bigint): this {
    this.address = address;
    return this;
  }
}

export class FreeType$Library extends FreeType$Pointer {
  fontData: LongMap<ByteBuffer> = null;
  _FreeType$Library(address: bigint): this {
    this._FreeType$Pointer(address);
    this.fontData = new LongMap();
    return this;
  }
  dispose(): void {
    FreeType$Library.doneFreeType(this.address);
    for (const $it0 = this.fontData.values().iterator(); $it0.hasNext(); ) {
      let buffer = $it0.next();
      if (BufferUtils.isUnsafeByteBuffer(buffer)) {
        BufferUtils.disposeUnsafeByteBuffer(buffer);
      }
    }
  }
  static doneFreeType(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Library', 'doneFreeType', this, $a);
  }
  newFace(fontFile: FileHandle, faceIndex: number): FreeType$Face {
    let buffer = null;
    try {
      buffer = fontFile.map();
    } catch ($e1) {
      if ($J.isa($e1, GdxRuntimeException)) {
        let ignored = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
    if (buffer == null) {
      let input = fontFile.read();
      try {
        let fileSize = $J.l2i(fontFile.length());
        if (fileSize === 0) {
          let data = StreamUtils.copyStreamToByteArray(input, Math.imul(1024, 16));
          buffer = BufferUtils.newUnsafeByteBuffer(data.length);
          BufferUtils.copy(data, 0, buffer, data.length);
        } else {
          buffer = BufferUtils.newUnsafeByteBuffer(fileSize);
          StreamUtils.copyStream(input, buffer);
        }
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let ex = $J.exc($e2);
          throw new GdxRuntimeException(ex);
        } else {
          throw $e2;
        }
      } finally {
        StreamUtils.closeQuietly(input);
      }
    }
    return this.newMemoryFace$ByteBuffer$int(buffer, faceIndex);
  }
  newMemoryFace$ByteBuffer$int(buffer: ByteBuffer, faceIndex: number): FreeType$Face {
    let face = FreeType$Library.newMemoryFace(this.address, buffer, buffer.remaining(), faceIndex);
    if (face === 0n) {
      if (BufferUtils.isUnsafeByteBuffer(buffer)) {
        BufferUtils.disposeUnsafeByteBuffer(buffer);
      }
      throw new GdxRuntimeException('Couldn\'t load font, FreeType error code: ' + FreeType.getLastErrorCode());
    } else {
      this.fontData.put(face, buffer);
      return new FreeType$Face()._FreeType$Face(face, this);
    }
  }
  static newMemoryFace(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Library', 'newMemoryFace', this, $a);
  }
  createStroker(): FreeType$Stroker {
    let stroker = FreeType$Library.strokerNew(this.address);
    if (stroker === 0n) {
      throw new GdxRuntimeException('Couldn\'t create FreeType stroker, FreeType error code: ' + FreeType.getLastErrorCode());
    }
    return new FreeType$Stroker()._FreeType$Stroker(stroker);
  }
  static strokerNew(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Library', 'strokerNew', this, $a);
  }
}

export class FreeType$Face extends FreeType$Pointer {
  library: FreeType$Library = null;
  _FreeType$Face(address: bigint, library: FreeType$Library): this {
    this._FreeType$Pointer(address);
    this.library = library;
    return this;
  }
  dispose(): void {
    FreeType$Face.doneFace(this.address);
    let buffer = this.library.fontData.get(this.address);
    if (buffer != null) {
      this.library.fontData.remove(this.address);
      if (BufferUtils.isUnsafeByteBuffer(buffer)) {
        BufferUtils.disposeUnsafeByteBuffer(buffer);
      }
    }
  }
  static doneFace(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'doneFace', this, $a);
  }
  getFaceFlags(): number {
    return FreeType$Face.getFaceFlags(this.address);
  }
  static getFaceFlags(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getFaceFlags', this, $a);
  }
  getNumGlyphs(): number {
    return FreeType$Face.getNumGlyphs(this.address);
  }
  static getNumGlyphs(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getNumGlyphs', this, $a);
  }
  getMaxAdvanceWidth(): number {
    return FreeType$Face.getMaxAdvanceWidth(this.address);
  }
  static getMaxAdvanceWidth(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getMaxAdvanceWidth', this, $a);
  }
  setPixelSizes(pixelWidth: number, pixelHeight: number): boolean {
    return FreeType$Face.setPixelSizes(this.address, pixelWidth, pixelHeight);
  }
  static setPixelSizes(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'setPixelSizes', this, $a);
  }
  loadChar(charCode: number, loadFlags: number): boolean {
    return FreeType$Face.loadChar(this.address, charCode, loadFlags);
  }
  static loadChar(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'loadChar', this, $a);
  }
  getGlyph(): FreeType$GlyphSlot {
    return new FreeType$GlyphSlot()._FreeType$GlyphSlot(FreeType$Face.getGlyph(this.address));
  }
  static getGlyph(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getGlyph', this, $a);
  }
  getSize(): FreeType$Size {
    return new FreeType$Size()._FreeType$Size(FreeType$Face.getSize(this.address));
  }
  static getSize(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getSize', this, $a);
  }
  hasKerning(): boolean {
    return FreeType$Face.hasKerning(this.address);
  }
  static hasKerning(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'hasKerning', this, $a);
  }
  getKerning(leftGlyph: number, rightGlyph: number, kernMode: number): number {
    return FreeType$Face.getKerning(this.address, leftGlyph, rightGlyph, kernMode);
  }
  static getKerning(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getKerning', this, $a);
  }
  getCharIndex(charCode: number): number {
    return FreeType$Face.getCharIndex(this.address, charCode);
  }
  static getCharIndex(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', 'getCharIndex', this, $a);
  }
}

export class FreeType$Size extends FreeType$Pointer {
  _FreeType$Size(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  getMetrics(): FreeType$SizeMetrics {
    return new FreeType$SizeMetrics()._FreeType$SizeMetrics(FreeType$Size.getMetrics(this.address));
  }
  static getMetrics(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Size', 'getMetrics', this, $a);
  }
}

export class FreeType$SizeMetrics extends FreeType$Pointer {
  _FreeType$SizeMetrics(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  getAscender(): number {
    return FreeType$SizeMetrics.getAscender(this.address);
  }
  static getAscender(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$SizeMetrics', 'getAscender', this, $a);
  }
  getDescender(): number {
    return FreeType$SizeMetrics.getDescender(this.address);
  }
  static getDescender(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$SizeMetrics', 'getDescender', this, $a);
  }
  getHeight(): number {
    return FreeType$SizeMetrics.getHeight(this.address);
  }
  static getHeight(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$SizeMetrics', 'getHeight', this, $a);
  }
}

export class FreeType$GlyphSlot extends FreeType$Pointer {
  _FreeType$GlyphSlot(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  getMetrics(): FreeType$GlyphMetrics {
    return new FreeType$GlyphMetrics()._FreeType$GlyphMetrics(FreeType$GlyphSlot.getMetrics(this.address));
  }
  static getMetrics(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphSlot', 'getMetrics', this, $a);
  }
  getFormat(): number {
    return FreeType$GlyphSlot.getFormat(this.address);
  }
  static getFormat(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphSlot', 'getFormat', this, $a);
  }
  getGlyph(): FreeType$Glyph {
    let glyph = FreeType$GlyphSlot.getGlyph(this.address);
    if (glyph === 0n) {
      throw new GdxRuntimeException('Couldn\'t get glyph, FreeType error code: ' + FreeType.getLastErrorCode());
    }
    return new FreeType$Glyph()._FreeType$Glyph(glyph);
  }
  static getGlyph(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphSlot', 'getGlyph', this, $a);
  }
}

export class FreeType$Glyph extends FreeType$Pointer {
  rendered: boolean = false;
  _FreeType$Glyph(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  dispose(): void {
    FreeType$Glyph.done(this.address);
  }
  static done(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', 'done', this, $a);
  }
  strokeBorder(stroker: FreeType$Stroker, inside: boolean): void {
    this.address = FreeType$Glyph.strokeBorder(this.address, stroker.address, inside);
  }
  static strokeBorder(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', 'strokeBorder', this, $a);
  }
  toBitmap(renderMode: number): void {
    let bitmap = FreeType$Glyph.toBitmap(this.address, renderMode);
    if (bitmap === 0n) {
      throw new GdxRuntimeException('Couldn\'t render glyph, FreeType error code: ' + FreeType.getLastErrorCode());
    }
    this.address = bitmap;
    this.rendered = true;
  }
  static toBitmap(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', 'toBitmap', this, $a);
  }
  getBitmap(): FreeType$Bitmap {
    if (!this.rendered) {
      throw new GdxRuntimeException('Glyph is not yet rendered');
    }
    return new FreeType$Bitmap()._FreeType$Bitmap(FreeType$Glyph.getBitmap(this.address));
  }
  static getBitmap(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', 'getBitmap', this, $a);
  }
  getLeft(): number {
    if (!this.rendered) {
      throw new GdxRuntimeException('Glyph is not yet rendered');
    }
    return FreeType$Glyph.getLeft(this.address);
  }
  static getLeft(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', 'getLeft', this, $a);
  }
  getTop(): number {
    if (!this.rendered) {
      throw new GdxRuntimeException('Glyph is not yet rendered');
    }
    return FreeType$Glyph.getTop(this.address);
  }
  static getTop(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', 'getTop', this, $a);
  }
}

export class FreeType$Bitmap extends FreeType$Pointer {
  _FreeType$Bitmap(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  getRows(): number {
    return FreeType$Bitmap.getRows(this.address);
  }
  static getRows(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Bitmap', 'getRows', this, $a);
  }
  getWidth(): number {
    return FreeType$Bitmap.getWidth(this.address);
  }
  static getWidth(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Bitmap', 'getWidth', this, $a);
  }
  getPitch(): number {
    return FreeType$Bitmap.getPitch(this.address);
  }
  static getPitch(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Bitmap', 'getPitch', this, $a);
  }
  getBuffer(): ByteBuffer {
    if (this.getRows() === 0) {
      return BufferUtils.newByteBuffer(1);
    }
    return FreeType$Bitmap.getBuffer(this.address);
  }
  static getBuffer(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Bitmap', 'getBuffer', this, $a);
  }
  getPixmap(format: Pixmap_Format, color: Color, gamma: number): Pixmap {
    let width = this.getWidth();
    let rows = this.getRows();
    let src = this.getBuffer();
    let pixmap: Pixmap;
    let pixelMode = this.getPixelMode();
    let rowBytes = Math.abs(this.getPitch());
    if (color === Color.WHITE && pixelMode === FreeType.FT_PIXEL_MODE_GRAY && rowBytes === width && gamma === Math.fround(1)) {
      pixmap = new Pixmap(width, rows, Pixmap_Format.Alpha);
      BufferUtils.copy(src, pixmap.getPixels(), pixmap.getPixels().capacity());
    } else {
      pixmap = new Pixmap(width, rows, Pixmap_Format.RGBA8888);
      let rgba = Color.rgba8888$Color(color);
      let srcRow = $J.newArray(rowBytes, 0);
      let dstRow = $J.newArray(width, 0);
      let dst = pixmap.getPixels().asIntBuffer();
      if (pixelMode === FreeType.FT_PIXEL_MODE_MONO) {
        for (let y = 0; y < rows; y++) {
          src.get(srcRow);
          for (let i = 0, x = 0; x < width; i++, x = (x + 8) | 0) {
            let b = srcRow[i];
            for (let ii = 0, n = Math.min(8, (width - x) | 0); ii < n; ii++) {
              if ((b & (1 << ((7 - ii) | 0))) !== 0) {
                (dstRow[(x + ii) | 0]) = rgba;
              } else {
                (dstRow[(x + ii) | 0]) = 0;
              }
            }
          }
          dst.put(dstRow);
        }
      } else {
        let rgb = rgba & -256;
        let a = rgba & 255;
        for (let y = 0; y < rows; y++) {
          src.get(srcRow);
          for (let x = 0; x < width; x++) {
            let alpha = srcRow[x] & 255;
            if (alpha === 0) {
              dstRow[x] = rgb;
            } else if (alpha === 255) {
              dstRow[x] = rgb | a;
            } else {
              dstRow[x] = rgb | $J.d2i((Math.fround(a * Math.fround($J.pow(Math.fround(alpha / 255), gamma)))));
            }
          }
          dst.put(dstRow);
        }
      }
    }
    let converted = pixmap;
    if (format !== pixmap.getFormat()) {
      converted = new Pixmap(pixmap.getWidth(), pixmap.getHeight(), format);
      converted.setBlending(Pixmap_Blending.None);
      converted.drawPixmap(pixmap, 0, 0);
      converted.setBlending(Pixmap_Blending.SourceOver);
      pixmap.dispose();
    }
    return converted;
  }
  getPixelMode(): number {
    return FreeType$Bitmap.getPixelMode(this.address);
  }
  static getPixelMode(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Bitmap', 'getPixelMode', this, $a);
  }
}

export class FreeType$GlyphMetrics extends FreeType$Pointer {
  _FreeType$GlyphMetrics(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  getHeight(): number {
    return FreeType$GlyphMetrics.getHeight(this.address);
  }
  static getHeight(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphMetrics', 'getHeight', this, $a);
  }
  getHoriAdvance(): number {
    return FreeType$GlyphMetrics.getHoriAdvance(this.address);
  }
  static getHoriAdvance(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphMetrics', 'getHoriAdvance', this, $a);
  }
}

export class FreeType$Stroker extends FreeType$Pointer {
  _FreeType$Stroker(address: bigint): this {
    this._FreeType$Pointer(address);
    return this;
  }
  set(radius: number, lineCap: number, lineJoin: number, miterLimit: number): void {
    FreeType$Stroker.set(this.address, radius, lineCap, lineJoin, miterLimit);
  }
  static set(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Stroker', 'set', this, $a);
  }
  dispose(): void {
    FreeType$Stroker.done(this.address);
  }
  static done(...$a: any[]): any {
    return $J.nativeCall('com.badlogic.gdx.graphics.g2d.freetype.FreeType$Stroker', 'done', this, $a);
  }
}

$J.define(FreeType, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeType' }, clinit: true, lazy: ['FT_PIXEL_MODE_NONE', 'FT_PIXEL_MODE_MONO', 'FT_PIXEL_MODE_GRAY', 'FT_PIXEL_MODE_GRAY2', 'FT_PIXEL_MODE_GRAY4', 'FT_PIXEL_MODE_LCD', 'FT_PIXEL_MODE_LCD_V', 'FT_ENCODING_NONE', 'FT_ENCODING_MS_SYMBOL', 'FT_ENCODING_UNICODE', 'FT_ENCODING_SJIS', 'FT_ENCODING_GB2312', 'FT_ENCODING_BIG5', 'FT_ENCODING_WANSUNG', 'FT_ENCODING_JOHAB', 'FT_ENCODING_ADOBE_STANDARD', 'FT_ENCODING_ADOBE_EXPERT', 'FT_ENCODING_ADOBE_CUSTOM', 'FT_ENCODING_ADOBE_LATIN_1', 'FT_ENCODING_OLD_LATIN_2', 'FT_ENCODING_APPLE_ROMAN', 'FT_FACE_FLAG_SCALABLE', 'FT_FACE_FLAG_FIXED_SIZES', 'FT_FACE_FLAG_FIXED_WIDTH', 'FT_FACE_FLAG_SFNT', 'FT_FACE_FLAG_HORIZONTAL', 'FT_FACE_FLAG_VERTICAL', 'FT_FACE_FLAG_KERNING', 'FT_FACE_FLAG_FAST_GLYPHS', 'FT_FACE_FLAG_MULTIPLE_MASTERS', 'FT_FACE_FLAG_GLYPH_NAMES', 'FT_FACE_FLAG_EXTERNAL_STREAM', 'FT_FACE_FLAG_HINTER', 'FT_FACE_FLAG_CID_KEYED', 'FT_FACE_FLAG_TRICKY', 'FT_STYLE_FLAG_ITALIC', 'FT_STYLE_FLAG_BOLD', 'FT_LOAD_DEFAULT', 'FT_LOAD_NO_SCALE', 'FT_LOAD_NO_HINTING', 'FT_LOAD_RENDER', 'FT_LOAD_NO_BITMAP', 'FT_LOAD_VERTICAL_LAYOUT', 'FT_LOAD_FORCE_AUTOHINT', 'FT_LOAD_CROP_BITMAP', 'FT_LOAD_PEDANTIC', 'FT_LOAD_IGNORE_GLOBAL_ADVANCE_WIDTH', 'FT_LOAD_NO_RECURSE', 'FT_LOAD_IGNORE_TRANSFORM', 'FT_LOAD_MONOCHROME', 'FT_LOAD_LINEAR_DESIGN', 'FT_LOAD_NO_AUTOHINT', 'FT_LOAD_TARGET_NORMAL', 'FT_LOAD_TARGET_LIGHT', 'FT_LOAD_TARGET_MONO', 'FT_LOAD_TARGET_LCD', 'FT_LOAD_TARGET_LCD_V', 'FT_RENDER_MODE_NORMAL', 'FT_RENDER_MODE_LIGHT', 'FT_RENDER_MODE_MONO', 'FT_RENDER_MODE_LCD', 'FT_RENDER_MODE_LCD_V', 'FT_RENDER_MODE_MAX', 'FT_KERNING_DEFAULT', 'FT_KERNING_UNFITTED', 'FT_KERNING_UNSCALED', 'FT_STROKER_LINECAP_BUTT', 'FT_STROKER_LINECAP_ROUND', 'FT_STROKER_LINECAP_SQUARE', 'FT_STROKER_LINEJOIN_ROUND', 'FT_STROKER_LINEJOIN_BEVEL', 'FT_STROKER_LINEJOIN_MITER_VARIABLE', 'FT_STROKER_LINEJOIN_MITER', 'FT_STROKER_LINEJOIN_MITER_FIXED'] });
$J.define(FreeType$Pointer, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'long': '_FreeType$Pointer' } });
$J.define(FreeType$Library, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Library', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$Library' }, meths: { 'newMemoryFace(java.nio.ByteBuffer,int)': 'newMemoryFace$ByteBuffer$int', 'newMemoryFace(byte[],int,int)': 'newMemoryFace$byteArr$int$int' } });
$J.define(FreeType$Face, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Face', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long,com.badlogic.gdx.graphics.g2d.freetype.FreeType$Library': '_FreeType$Face' } });
$J.define(FreeType$Size, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Size', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$Size' } });
$J.define(FreeType$SizeMetrics, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$SizeMetrics', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$SizeMetrics' } });
$J.define(FreeType$GlyphSlot, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphSlot', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$GlyphSlot' } });
$J.define(FreeType$Glyph, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Glyph', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$Glyph' } });
$J.define(FreeType$Bitmap, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Bitmap', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$Bitmap' } });
$J.define(FreeType$GlyphMetrics, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$GlyphMetrics', { kind: 'class', sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$GlyphMetrics' } });
$J.define(FreeType$Stroker, 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Stroker', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'com.badlogic.gdx.graphics.g2d.freetype.FreeType$Pointer', ctors: { 'long': '_FreeType$Stroker' } });
$J.module(() => {
  Color = $J.load('com.badlogic.gdx.graphics.Color');
});
