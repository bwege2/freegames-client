// @ts-nocheck
// FreeTypeFontGenerator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Gdx, Gdx2DPixmap, GdxRuntimeException, JEnum, JObject, JString, Pixmap, Pixmap_Blending, Pixmap_Format, Texture_TextureFilter } from '../../../../../../../jre/index.ts';
import { BitmapFont$BitmapFontData } from '../BitmapFont.ts';

let Color, BitmapFont, BitmapFont$Glyph, PixmapPacker, PixmapPacker$GuillotineStrategy, PixmapPacker$SkylineStrategy, FreeType, MathUtils, Array_;

/**
 * Generates {@link BitmapFont} and {@link BitmapFontData} instances from TrueType, OTF, and other FreeType supported fonts.
 * </p>
 *
 * Usage example:
 *
 * <pre>
 * FreeTypeFontGenerator gen = new FreeTypeFontGenerator(Gdx.files.internal(&quot;myfont.ttf&quot;));
 * BitmapFont font = gen.generateFont(16);
 * gen.dispose(); // Don't dispose if doing incremental glyph generation.
 * </pre>
 *
 * The generator has to be disposed once it is no longer used. The returned {@link BitmapFont} instances are managed by the user
 * and have to be disposed as usual.
 *
 * @author mzechner
 * @author Nathan Sweet
 * @author Rob Rendell
 */
export class FreeTypeFontGenerator extends JObject {
  static readonly DEFAULT_CHARS: string = '\u0000ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"!`?\'.,;:()[]{}<>|/@\\^$€-%+=#_&~* ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';
  /**
   * A hint to scale the texture as needed, without capping it at any maximum size
   */
  static readonly NO_MAXIMUM: number = -1;
  /**
   * The maximum texture size allowed by generateData, when storing in a texture atlas. Multiple texture pages will be created
   * if necessary. Default is 1024.
   * @see #setMaxTextureSize(int)
   */
  static maxTextureSize: number = 0;
  library: FreeType$Library = null;
  face: FreeType$Face = null;
  name_: string = null;
  bitmapped: boolean = false;
  pixelWidth: number = 0;
  pixelHeight: number = 0;
  $init_FreeTypeFontGenerator() {
    this.bitmapped = false;
  }
  /**
   * {@link #FreeTypeFontGenerator(FileHandle, int)}
   */
  _FreeTypeFontGenerator$FileHandle(fontFile: FileHandle): this {
    this._FreeTypeFontGenerator$FileHandle$int(fontFile, 0);
    return this;
  }
  /**
   * Creates a new generator from the given font file. Uses {@link FileHandle#length()} to determine the file size. If the file
   * length could not be determined (it was 0), an extra copy of the font bytes is performed. Throws a
   * {@link GdxRuntimeException} if loading did not succeed.
   */
  _FreeTypeFontGenerator$FileHandle$int(fontFile: FileHandle, faceIndex: number): this {
    this.$init_FreeTypeFontGenerator();
    this.name_ = fontFile.nameWithoutExtension();
    this.library = FreeType.initFreeType();
    this.face = this.library.newFace(fontFile, faceIndex);
    if (this.checkForBitmapFont()) {
      return this;
    }
    this.setPixelSizes(0, 15);
    return this;
  }
  getLoadingFlags(parameter: FreeTypeFontGenerator$FreeTypeFontParameter): number {
    let loadingFlags = FreeType.FT_LOAD_DEFAULT;
    switch (parameter.hinting) {
      case FreeTypeFontGenerator$Hinting.None:
        loadingFlags |= FreeType.FT_LOAD_NO_HINTING;
        break;
      case FreeTypeFontGenerator$Hinting.Slight:
        loadingFlags |= FreeType.FT_LOAD_TARGET_LIGHT;
        break;
      case FreeTypeFontGenerator$Hinting.Medium:
        loadingFlags |= FreeType.FT_LOAD_TARGET_NORMAL;
        break;
      case FreeTypeFontGenerator$Hinting.Full:
        loadingFlags |= FreeType.FT_LOAD_TARGET_MONO;
        break;
      case FreeTypeFontGenerator$Hinting.AutoSlight:
        loadingFlags |= FreeType.FT_LOAD_FORCE_AUTOHINT | FreeType.FT_LOAD_TARGET_LIGHT;
        break;
      case FreeTypeFontGenerator$Hinting.AutoMedium:
        loadingFlags |= FreeType.FT_LOAD_FORCE_AUTOHINT | FreeType.FT_LOAD_TARGET_NORMAL;
        break;
      case FreeTypeFontGenerator$Hinting.AutoFull:
        loadingFlags |= FreeType.FT_LOAD_FORCE_AUTOHINT | FreeType.FT_LOAD_TARGET_MONO;
        break;
    }
    return loadingFlags;
  }
  loadChar$int$FreeTypeFontGenerator(c: number): boolean {
    return this.loadChar$int$int$FreeTypeFontGenerator(c, FreeType.FT_LOAD_DEFAULT | FreeType.FT_LOAD_FORCE_AUTOHINT);
  }
  loadChar$int$int$FreeTypeFontGenerator(c: number, flags: number): boolean {
    return this.face.loadChar(c, flags);
  }
  checkForBitmapFont(): boolean {
    let faceFlags = this.face.getFaceFlags();
    if (((faceFlags & FreeType.FT_FACE_FLAG_FIXED_SIZES) === FreeType.FT_FACE_FLAG_FIXED_SIZES) && ((faceFlags & FreeType.FT_FACE_FLAG_HORIZONTAL) === FreeType.FT_FACE_FLAG_HORIZONTAL)) {
      if (this.loadChar$int$FreeTypeFontGenerator(32)) {
        let slot = this.face.getGlyph();
        if (slot.getFormat() === 1651078259) {
          this.bitmapped = true;
        }
      }
    }
    return this.bitmapped;
  }
  generateFont$FreeTypeFontParameter(parameter: FreeTypeFontGenerator$FreeTypeFontParameter): BitmapFont {
    return this.generateFont$FreeTypeFontParameter$FreeTypeBitmapFontData(parameter, new FreeTypeFontGenerator$FreeTypeBitmapFontData()._FreeTypeFontGenerator$FreeTypeBitmapFontData());
  }
  /**
   * Generates a new {@link BitmapFont}. The size is expressed in pixels. Throws a GdxRuntimeException if the font could not be
   * generated. Using big sizes might cause such an exception.
   * @param parameter configures how the font is generated
   */
  generateFont$FreeTypeFontParameter$FreeTypeBitmapFontData(parameter: FreeTypeFontGenerator$FreeTypeFontParameter, data: FreeTypeFontGenerator$FreeTypeBitmapFontData): BitmapFont {
    let updateTextureRegions = data.regions == null && parameter.packer != null;
    if (updateTextureRegions) {
      data.regions = new Array_()._Array$();
    }
    this.generateData$FreeTypeFontParameter$FreeTypeBitmapFontData(parameter, data);
    if (updateTextureRegions) {
      parameter.packer.updateTextureRegions(data.regions, parameter.minFilter, parameter.magFilter, parameter.genMipMaps);
    }
    if (data.regions.isEmpty()) {
      throw new GdxRuntimeException('Unable to create a font with no texture regions.');
    }
    let font = this.newBitmapFont(data, data.regions, true);
    font.setOwnsTexture(parameter.packer == null);
    return font;
  }
  /**
   * Called by generateFont to create a new {@link BitmapFont} instance. This allows injecting a customized {@link BitmapFont},
   * eg for a RTL font.
   * @see BitmapFont#BitmapFont(BitmapFontData, Array, boolean)
   */
  newBitmapFont(data: BitmapFont$BitmapFontData, pageRegions: Array_<TextureRegion>, integer: boolean): BitmapFont {
    return new BitmapFont()._BitmapFont$BitmapFontData$Array$boolean(data, pageRegions, integer);
  }
  setPixelSizes(pixelWidth: number, pixelHeight: number): void {
    this.pixelWidth = pixelWidth;
    this.pixelHeight = pixelHeight;
    if (!this.bitmapped && !this.face.setPixelSizes(pixelWidth, pixelHeight)) {
      throw new GdxRuntimeException('Couldn\'t set size for font');
    }
  }
  /**
   * Generates a new {@link BitmapFontData} instance, expert usage only. Throws a GdxRuntimeException if something went wrong.
   * @param parameter configures how the font is generated
   */
  generateData$FreeTypeFontParameter$FreeTypeBitmapFontData(parameter: FreeTypeFontGenerator$FreeTypeFontParameter, data: FreeTypeFontGenerator$FreeTypeBitmapFontData): FreeTypeFontGenerator$FreeTypeBitmapFontData {
    data.name_ = this.name_ + '-' + parameter.size_;
    let characters = JString.toCharArray(parameter.characters);
    let charactersLength = characters.length;
    let incremental = parameter.incremental;
    let flags = this.getLoadingFlags(parameter);
    this.setPixelSizes(0, parameter.size_);
    let fontMetrics = this.face.getSize().getMetrics();
    data.flipped = parameter.flip_;
    data.ascent = Math.fround(FreeType.toInt(fontMetrics.getAscender()));
    data.descent = Math.fround(FreeType.toInt(fontMetrics.getDescender()));
    data.lineHeight = Math.fround(FreeType.toInt(fontMetrics.getHeight()));
    let baseLine = data.ascent;
    if (this.bitmapped && (data.lineHeight === Math.fround(0))) {
      for (let c = 32; c < ((32 + this.face.getNumGlyphs()) | 0); c++) {
        if (this.loadChar$int$int$FreeTypeFontGenerator(c, flags)) {
          let lh = FreeType.toInt(this.face.getGlyph().getMetrics().getHeight());
          data.lineHeight = (Math.fround(lh) > data.lineHeight) ? Math.fround(lh) : data.lineHeight;
        }
      }
    }
    data.lineHeight = Math.fround(data.lineHeight + parameter.spaceY);
    if (this.loadChar$int$int$FreeTypeFontGenerator(32 /* ' ' */, flags) || this.loadChar$int$int$FreeTypeFontGenerator(108 /* 'l' */, flags)) {
      data.spaceXadvance = Math.fround(FreeType.toInt(this.face.getGlyph().getMetrics().getHoriAdvance()));
    } else {
      data.spaceXadvance = Math.fround(this.face.getMaxAdvanceWidth());
    }
    for (let xChar of data.xChars) {
      if (!this.loadChar$int$int$FreeTypeFontGenerator(xChar, flags)) {
        continue;
      }
      data.xHeight = Math.fround(FreeType.toInt(this.face.getGlyph().getMetrics().getHeight()));
      break;
    }
    if (data.xHeight === Math.fround(0)) {
      throw new GdxRuntimeException('No x-height character found in font');
    }
    for (let capChar of data.capChars) {
      if (!this.loadChar$int$int$FreeTypeFontGenerator(capChar, flags)) {
        continue;
      }
      data.capHeight = Math.fround((FreeType.toInt(this.face.getGlyph().getMetrics().getHeight()) + Math.abs(parameter.shadowOffsetY)) | 0);
      break;
    }
    if (!this.bitmapped && data.capHeight === Math.fround(1)) {
      throw new GdxRuntimeException('No cap character found in font');
    }
    data.ascent = Math.fround(data.ascent - data.capHeight);
    data.down = Math.fround(-data.lineHeight);
    if (parameter.flip_) {
      data.ascent = Math.fround(-data.ascent);
      data.down = Math.fround(-data.down);
    }
    let ownsAtlas = false;
    let packer = parameter.packer;
    if (packer == null) {
      let size: number;
      let packStrategy: PixmapPacker$PackStrategy;
      if (incremental) {
        size = FreeTypeFontGenerator.maxTextureSize;
        packStrategy = new PixmapPacker$GuillotineStrategy()._PixmapPacker$GuillotineStrategy();
      } else {
        let maxGlyphHeight = $J.d2i(Math.ceil(data.lineHeight));
        size = MathUtils.nextPowerOfTwo($J.d2i(Math.sqrt(Math.imul(Math.imul(maxGlyphHeight, maxGlyphHeight), charactersLength))));
        if (FreeTypeFontGenerator.maxTextureSize > 0) {
          size = Math.min(size, FreeTypeFontGenerator.maxTextureSize);
        }
        packStrategy = new PixmapPacker$SkylineStrategy()._PixmapPacker$SkylineStrategy();
      }
      ownsAtlas = true;
      packer = new PixmapPacker()._PixmapPacker$int$int$Format$int$boolean$PackStrategy(size, size, Pixmap_Format.RGBA8888, 1, false, packStrategy);
      packer.setTransparentColor(parameter.color_);
      packer.getTransparentColor().a = 0;
      if (parameter.borderWidth > Math.fround(0)) {
        packer.setTransparentColor(parameter.borderColor);
        packer.getTransparentColor().a = 0;
      }
    }
    if (incremental) {
      data.glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData = new Array_()._Array$int((charactersLength + 32) | 0);
    }
    let stroker = null;
    if (parameter.borderWidth > Math.fround(0)) {
      stroker = this.library.createStroker();
      stroker.set($J.d2i((Math.fround(parameter.borderWidth * 64))), parameter.borderStraight ? FreeType.FT_STROKER_LINECAP_BUTT : FreeType.FT_STROKER_LINECAP_ROUND, parameter.borderStraight ? FreeType.FT_STROKER_LINEJOIN_MITER_FIXED : FreeType.FT_STROKER_LINEJOIN_ROUND, 0);
    }
    let heights = $J.newArray(charactersLength, 0);
    for (let i = 0; i < charactersLength; i++) {
      let c = characters[i];
      let height = this.loadChar$int$int$FreeTypeFontGenerator(c, flags) ? FreeType.toInt(this.face.getGlyph().getMetrics().getHeight()) : 0;
      heights[i] = height;
      if (c === 0 /* \u0000 */) {
        let missingGlyph = this.createGlyph(0 /* \u0000 */, data, parameter, stroker, baseLine, packer);
        if (missingGlyph != null && missingGlyph.width_ !== 0 && missingGlyph.height_ !== 0) {
          data.setGlyph(0 /* \u0000 */, missingGlyph);
          data.missingGlyph = missingGlyph;
          if (incremental) {
            data.glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData.add$Object(missingGlyph);
          }
        }
      }
    }
    let heightsCount = heights.length;
    while (heightsCount > 0) {
      let best = 0;
      let maxHeight = heights[0];
      for (let i = 1; i < heightsCount; i++) {
        let height = heights[i];
        if (height > maxHeight) {
          maxHeight = height;
          best = i;
        }
      }
      let c = characters[best];
      if (data.getGlyph(c) == null) {
        let glyph = this.createGlyph(c, data, parameter, stroker, baseLine, packer);
        if (glyph != null) {
          data.setGlyph(c, glyph);
          if (incremental) {
            data.glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData.add$Object(glyph);
          }
        }
      }
      heightsCount--;
      heights[best] = heights[heightsCount];
      let tmpChar = characters[best];
      characters[best] = characters[heightsCount];
      characters[heightsCount] = tmpChar;
    }
    if (stroker != null && !incremental) {
      stroker.dispose();
    }
    if (incremental) {
      data.generator = this;
      data.parameter = parameter;
      data.stroker = stroker;
      data.packer = packer;
    }
    parameter.kerning = !!(parameter.kerning & this.face.hasKerning());
    if (parameter.kerning) {
      for (let i = 0; i < charactersLength; i++) {
        let firstChar = characters[i];
        let first = data.getGlyph(firstChar);
        if (first == null) {
          continue;
        }
        let firstIndex = this.face.getCharIndex(firstChar);
        for (let ii = i; ii < charactersLength; ii++) {
          let secondChar = characters[ii];
          let second = data.getGlyph(secondChar);
          if (second == null) {
            continue;
          }
          let secondIndex = this.face.getCharIndex(secondChar);
          let kerning = this.face.getKerning(firstIndex, secondIndex, 0);
          if (kerning !== 0) {
            first.setKerning(secondChar, FreeType.toInt(kerning));
          }
          kerning = this.face.getKerning(secondIndex, firstIndex, 0);
          if (kerning !== 0) {
            second.setKerning(firstChar, FreeType.toInt(kerning));
          }
        }
      }
    }
    if (ownsAtlas) {
      data.regions = new Array_()._Array$();
      packer.updateTextureRegions(data.regions, parameter.minFilter, parameter.magFilter, parameter.genMipMaps);
    }
    let spaceGlyph = data.getGlyph(32 /* ' ' */);
    if (spaceGlyph == null) {
      spaceGlyph = new BitmapFont$Glyph()._BitmapFont$Glyph();
      spaceGlyph.xadvance = ($J.d2i(data.spaceXadvance) + parameter.spaceX) | 0;
      spaceGlyph.id_ = 32 /* ' ' */;
      data.setGlyph(32 /* ' ' */, spaceGlyph);
    }
    if (spaceGlyph.width_ === 0) {
      spaceGlyph.width_ = $J.d2i((Math.fround(spaceGlyph.xadvance + data.padRight)));
    }
    return data;
  }
  /**
   * @return null if glyph was not found.
   */
  createGlyph(c: number, data: FreeTypeFontGenerator$FreeTypeBitmapFontData, parameter: FreeTypeFontGenerator$FreeTypeFontParameter, stroker: FreeType$Stroker, baseLine: number, packer: PixmapPacker): BitmapFont$Glyph {
    let missing = this.face.getCharIndex(c) === 0 && c !== 0;
    if (missing) {
      return null;
    }
    if (!this.loadChar$int$int$FreeTypeFontGenerator(c, this.getLoadingFlags(parameter))) {
      return null;
    }
    let slot = this.face.getGlyph();
    let mainGlyph = slot.getGlyph();
    try {
      mainGlyph.toBitmap(parameter.mono ? FreeType.FT_RENDER_MODE_MONO : FreeType.FT_RENDER_MODE_NORMAL);
    } catch ($e0) {
      if ($J.isa($e0, GdxRuntimeException)) {
        let e = $J.exc($e0);
        mainGlyph.dispose();
        Gdx.app.log('FreeTypeFontGenerator', 'Couldn\'t render char: ' + String.fromCharCode(c));
        return null;
      } else {
        throw $e0;
      }
    }
    let mainBitmap = mainGlyph.getBitmap();
    let mainPixmap = mainBitmap.getPixmap(Pixmap_Format.RGBA8888, parameter.color_, parameter.gamma);
    if (mainBitmap.getWidth() !== 0 && mainBitmap.getRows() !== 0) {
      let offsetX = 0;
      let offsetY = 0;
      if (parameter.borderWidth > Math.fround(0)) {
        let top = mainGlyph.getTop();
        let left = mainGlyph.getLeft();
        let borderGlyph = slot.getGlyph();
        borderGlyph.strokeBorder(stroker, false);
        borderGlyph.toBitmap(parameter.mono ? FreeType.FT_RENDER_MODE_MONO : FreeType.FT_RENDER_MODE_NORMAL);
        offsetX = (left - borderGlyph.getLeft()) | 0;
        offsetY = -((top - borderGlyph.getTop()) | 0);
        let borderBitmap = borderGlyph.getBitmap();
        let borderPixmap = borderBitmap.getPixmap(Pixmap_Format.RGBA8888, parameter.borderColor, parameter.borderGamma);
        for (let i = 0, n = parameter.renderCount; i < n; i++) {
          borderPixmap.drawPixmap(mainPixmap, offsetX, offsetY);
        }
        mainPixmap.dispose();
        mainGlyph.dispose();
        mainPixmap = borderPixmap;
        mainGlyph = borderGlyph;
      }
      if (parameter.shadowOffsetX !== 0 || parameter.shadowOffsetY !== 0) {
        let mainW = mainPixmap.getWidth();
        let mainH = mainPixmap.getHeight();
        let shadowOffsetX = Math.max(parameter.shadowOffsetX, 0);
        let shadowOffsetY = Math.max(parameter.shadowOffsetY, 0);
        let shadowW = (mainW + Math.abs(parameter.shadowOffsetX)) | 0;
        let shadowH = (mainH + Math.abs(parameter.shadowOffsetY)) | 0;
        let shadowPixmap = new Pixmap(new Gdx2DPixmap(shadowW, shadowH, Pixmap_Format.toGdx2DPixmapFormat(mainPixmap.getFormat())));
        shadowPixmap.setColor(packer.getTransparentColor());
        shadowPixmap.fill();
        let shadowColor = parameter.shadowColor;
        let a = shadowColor.a;
        if (a !== Math.fround(0)) {
          let r = (($J.d2i((Math.fround(shadowColor.r * 255)))) << 24) >> 24;
          let g = (($J.d2i((Math.fround(shadowColor.g * 255)))) << 24) >> 24;
          let b = (($J.d2i((Math.fround(shadowColor.b * 255)))) << 24) >> 24;
          let mainPixels = mainPixmap.getPixels();
          let shadowPixels = shadowPixmap.getPixels();
          for (let y = 0; y < mainH; y++) {
            let shadowRow = (Math.imul(shadowW, ((y + shadowOffsetY) | 0)) + shadowOffsetX) | 0;
            for (let x = 0; x < mainW; x++) {
              let mainPixel = Math.imul(((Math.imul(mainW, y) + x) | 0), 4);
              let mainA = mainPixels.get((mainPixel + 3) | 0);
              if (mainA === 0) {
                continue;
              }
              let shadowPixel = Math.imul(((shadowRow + x) | 0), 4);
              shadowPixels.put(shadowPixel, r);
              shadowPixels.put((shadowPixel + 1) | 0, g);
              shadowPixels.put((shadowPixel + 2) | 0, b);
              shadowPixels.put((shadowPixel + 3) | 0, (($J.d2i((Math.fround((mainA & 255) * a)))) << 24) >> 24);
            }
          }
        }
        for (let i = 0, n = parameter.renderCount; i < n; i++) {
          shadowPixmap.drawPixmap(mainPixmap, Math.max(-parameter.shadowOffsetX, 0), Math.max(-parameter.shadowOffsetY, 0));
        }
        mainPixmap.dispose();
        mainPixmap = shadowPixmap;
      } else if (parameter.borderWidth === Math.fround(0)) {
        for (let i = 0, n = (parameter.renderCount - 1) | 0; i < n; i++) {
          mainPixmap.drawPixmap(mainPixmap, 0, 0);
        }
      }
      if (parameter.padTop > 0 || parameter.padLeft > 0 || parameter.padBottom > 0 || parameter.padRight > 0) {
        let padPixmap = new Pixmap((mainPixmap.getWidth() + parameter.padLeft + parameter.padRight) | 0, (mainPixmap.getHeight() + parameter.padTop + parameter.padBottom) | 0, mainPixmap.getFormat());
        padPixmap.setBlending(Pixmap_Blending.None);
        padPixmap.drawPixmap(mainPixmap, parameter.padLeft, parameter.padTop);
        mainPixmap.dispose();
        mainPixmap = padPixmap;
      }
    }
    let metrics = slot.getMetrics();
    let glyph = new BitmapFont$Glyph()._BitmapFont$Glyph();
    glyph.id_ = c;
    glyph.width_ = mainPixmap.getWidth();
    glyph.height_ = mainPixmap.getHeight();
    glyph.xoffset = mainGlyph.getLeft();
    if (parameter.flip_) {
      glyph.yoffset = (-mainGlyph.getTop() + $J.d2i(baseLine)) | 0;
    } else {
      glyph.yoffset = (-((glyph.height_ - mainGlyph.getTop()) | 0) - $J.d2i(baseLine)) | 0;
    }
    glyph.xadvance = (FreeType.toInt(metrics.getHoriAdvance()) + $J.d2i(parameter.borderWidth) + parameter.spaceX) | 0;
    if (this.bitmapped) {
      mainPixmap.setColor(Color.CLEAR);
      mainPixmap.fill();
      let buf = mainBitmap.getBuffer();
      let whiteIntBits = Color.WHITE.toIntBits();
      let clearIntBits = Color.CLEAR.toIntBits();
      for (let h = 0; h < glyph.height_; h++) {
        let idx = Math.imul(h, mainBitmap.getPitch());
        for (let w = 0; w < ((glyph.width_ + glyph.xoffset) | 0); w++) {
          let bit = (buf.get((idx + ($J.idiv(w, 8))) | 0) >>> ((7 - (w % 8)) | 0)) & 1;
          mainPixmap.drawPixel(w, h, ((bit === 1) ? whiteIntBits : clearIntBits));
        }
      }
    }
    let rect = packer.pack$Pixmap(mainPixmap);
    glyph.page = packer.getPages().indexOf(rect.page, true);
    glyph.srcX = rect.getX();
    glyph.srcY = rect.getY();
    if (parameter.incremental && data.regions != null && data.regions.size_ <= glyph.page) {
      packer.updateTextureRegions(data.regions, parameter.minFilter, parameter.magFilter, parameter.genMipMaps);
    }
    mainPixmap.dispose();
    mainGlyph.dispose();
    return glyph;
  }
  toString(): string {
    return this.name_;
  }
  /**
   * Cleans up all resources of the generator. Call this if you no longer use the generator.
   */
  dispose(): void {
    this.face.dispose();
    this.library.dispose();
  }
  static $clinit() {
    FreeTypeFontGenerator.maxTextureSize = 1024;
  }
}

/**
 * {@link BitmapFontData} used for fonts generated via the {@link FreeTypeFontGenerator}. The texture storing the glyphs is
 * held in memory, thus the {@link #getImagePaths()} and {@link #getFontFile()} methods will return null.
 * @author mzechner
 * @author Nathan Sweet
 */
export class FreeTypeFontGenerator$FreeTypeBitmapFontData extends BitmapFont$BitmapFontData {
  regions: Array_<TextureRegion> = null;
  generator: FreeTypeFontGenerator = null;
  parameter: FreeTypeFontGenerator$FreeTypeFontParameter = null;
  stroker: FreeType$Stroker = null;
  packer: PixmapPacker = null;
  glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData: Array_<BitmapFont$Glyph> = null;
  dirty: boolean = false;
  _FreeTypeFontGenerator$FreeTypeBitmapFontData(): this {
    this._BitmapFont$BitmapFontData$();
    return this;
  }
  getGlyph(ch: number): BitmapFont$Glyph {
    let glyph = super.getGlyph(ch);
    if (glyph == null && this.generator != null) {
      this.generator.setPixelSizes(0, this.parameter.size_);
      let baseline = Math.fround((Math.fround((this.flipped ? Math.fround(-this.ascent) : this.ascent) + this.capHeight)) / this.scaleY);
      glyph = this.generator.createGlyph(ch, this, this.parameter, this.stroker, baseline, this.packer);
      if (glyph == null) {
        return this.missingGlyph;
      }
      this.setGlyphRegion(glyph, this.regions.get(glyph.page));
      this.setGlyph(ch, glyph);
      this.glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData.add$Object(glyph);
      this.dirty = true;
      let face = this.generator.face;
      if (this.parameter.kerning) {
        let glyphIndex = face.getCharIndex(ch);
        for (let i = 0, n = this.glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData.size_; i < n; i++) {
          let other = this.glyphs$FreeTypeFontGenerator_FreeTypeBitmapFontData.get(i);
          let otherIndex = face.getCharIndex(other.id_);
          let kerning = face.getKerning(glyphIndex, otherIndex, 0);
          if (kerning !== 0) {
            glyph.setKerning(other.id_, FreeType.toInt(kerning));
          }
          kerning = face.getKerning(otherIndex, glyphIndex, 0);
          if (kerning !== 0) {
            other.setKerning(ch, FreeType.toInt(kerning));
          }
        }
      }
    }
    return glyph;
  }
  getGlyphs(run: GlyphLayout$GlyphRun, str: CharSequence, start: number, end: number, lastGlyph: BitmapFont$Glyph): void {
    if (this.packer != null) {
      this.packer.setPackToTexture(true);
    }
    super.getGlyphs(run, str, start, end, lastGlyph);
    if (this.dirty) {
      this.dirty = false;
      this.packer.updateTextureRegions(this.regions, this.parameter.minFilter, this.parameter.magFilter, this.parameter.genMipMaps);
    }
  }
  dispose(): void {
    if (this.stroker != null) {
      this.stroker.dispose();
    }
    if (this.packer != null) {
      this.packer.dispose();
    }
  }
}

/**
 * Font smoothing algorithm.
 */
export class FreeTypeFontGenerator$Hinting extends JEnum {
  static None: FreeTypeFontGenerator$Hinting = null;
  static Slight: FreeTypeFontGenerator$Hinting = null;
  static Medium: FreeTypeFontGenerator$Hinting = null;
  static Full: FreeTypeFontGenerator$Hinting = null;
  static AutoSlight: FreeTypeFontGenerator$Hinting = null;
  static AutoMedium: FreeTypeFontGenerator$Hinting = null;
  static AutoFull: FreeTypeFontGenerator$Hinting = null;
  static $VALUES: FreeTypeFontGenerator$Hinting[] = null;
  _FreeTypeFontGenerator$Hinting($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FreeTypeFontGenerator$Hinting[] { return FreeTypeFontGenerator$Hinting.$VALUES.slice(); }
  static valueOf(name: string): FreeTypeFontGenerator$Hinting { return $J.enumValueOf(FreeTypeFontGenerator$Hinting, name); }
  static $clinit() {
    FreeTypeFontGenerator$Hinting.None = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('None', 0);
    FreeTypeFontGenerator$Hinting.Slight = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('Slight', 1);
    FreeTypeFontGenerator$Hinting.Medium = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('Medium', 2);
    FreeTypeFontGenerator$Hinting.Full = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('Full', 3);
    FreeTypeFontGenerator$Hinting.AutoSlight = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('AutoSlight', 4);
    FreeTypeFontGenerator$Hinting.AutoMedium = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('AutoMedium', 5);
    FreeTypeFontGenerator$Hinting.AutoFull = new FreeTypeFontGenerator$Hinting()._FreeTypeFontGenerator$Hinting('AutoFull', 6);
    FreeTypeFontGenerator$Hinting.$VALUES = [FreeTypeFontGenerator$Hinting.None, FreeTypeFontGenerator$Hinting.Slight, FreeTypeFontGenerator$Hinting.Medium, FreeTypeFontGenerator$Hinting.Full, FreeTypeFontGenerator$Hinting.AutoSlight, FreeTypeFontGenerator$Hinting.AutoMedium, FreeTypeFontGenerator$Hinting.AutoFull];
  }
}

/**
 * Parameter container class that helps configure how {@link FreeTypeBitmapFontData} and {@link BitmapFont} instances are
 * generated.
 *
 * The packer field is for advanced usage, where it is necessary to pack multiple BitmapFonts (i.e. styles, sizes, families)
 * into a single Texture atlas. If no packer is specified, the generator will use its own PixmapPacker to pack the glyphs into
 * a power-of-two sized texture, and the resulting {@link FreeTypeBitmapFontData} will have a valid {@link TextureRegion} which
 * can be used to construct a new {@link BitmapFont}.
 *
 * @author siondream
 * @author Nathan Sweet
 */
export class FreeTypeFontGenerator$FreeTypeFontParameter extends JObject {
  /**
   * The size in pixels
   */
  size_: number = 0;
  /**
   * If true, font smoothing is disabled.
   */
  mono: boolean = false;
  /**
   * Strength of hinting
   */
  hinting: FreeTypeFontGenerator$Hinting = null;
  /**
   * Foreground color (required for non-black borders)
   */
  color_: Color = null;
  /**
   * Glyph gamma. Values > 1 reduce antialiasing.
   */
  gamma: number = 0;
  /**
   * Number of times to render the glyph. Useful with a shadow or border, so it doesn't show through the glyph.
   */
  renderCount: number = 0;
  /**
   * Border width in pixels, 0 to disable
   */
  borderWidth: number = 0;
  /**
   * Border color; only used if borderWidth > 0
   */
  borderColor: Color = null;
  /**
   * true for straight (mitered), false for rounded borders
   */
  borderStraight: boolean = false;
  /**
   * Values < 1 increase the border size.
   */
  borderGamma: number = 0;
  /**
   * Offset of text shadow on X axis in pixels, 0 to disable
   */
  shadowOffsetX: number = 0;
  /**
   * Offset of text shadow on Y axis in pixels, 0 to disable
   */
  shadowOffsetY: number = 0;
  /**
   * Shadow color; only used if shadowOffset > 0. If alpha component is 0, no shadow is drawn but characters are still offset
   * by shadowOffset.
   */
  shadowColor: Color = null;
  /**
   * Pixels to add to glyph spacing when text is rendered. Can be negative.
   */
  spaceX: number = 0;
  /**
   * Pixels to add to glyph spacing when text is rendered. Can be negative.
   */
  spaceY: number = 0;
  /**
   * Pixels to add to the glyph in the texture. Cannot be negative.
   */
  padTop: number = 0;
  /**
   * Pixels to add to the glyph in the texture. Cannot be negative.
   */
  padLeft: number = 0;
  /**
   * Pixels to add to the glyph in the texture. Cannot be negative.
   */
  padBottom: number = 0;
  /**
   * Pixels to add to the glyph in the texture. Cannot be negative.
   */
  padRight: number = 0;
  /**
   * The characters the font should contain. If '\0' is not included then {@link BitmapFontData#missingGlyph} is not set.
   */
  characters: string = null;
  /**
   * Whether the font should include kerning
   */
  kerning: boolean = false;
  /**
   * The optional PixmapPacker to use for packing multiple fonts into a single texture.
   * @see FreeTypeFontParameter
   */
  packer: PixmapPacker = null;
  /**
   * Whether to flip the font vertically
   */
  flip_: boolean = false;
  /**
   * Whether to generate mip maps for the resulting texture
   */
  genMipMaps: boolean = false;
  /**
   * Minification filter
   */
  minFilter: Texture_TextureFilter = null;
  /**
   * Magnification filter
   */
  magFilter: Texture_TextureFilter = null;
  /**
   * When true, glyphs are rendered on the fly to the font's glyph page textures as they are needed. The
   * FreeTypeFontGenerator must not be disposed until the font is no longer needed. The FreeTypeBitmapFontData must be
   * disposed (separately from the generator) when the font is no longer needed. The FreeTypeFontParameter should not be
   * modified after creating a font. If a PixmapPacker is not specified, the font glyph page textures will use
   * {@link FreeTypeFontGenerator#getMaxTextureSize()}.
   */
  incremental: boolean = false;
  _FreeTypeFontGenerator$FreeTypeFontParameter(): this {
    this.size_ = 16;
    this.hinting = FreeTypeFontGenerator$Hinting.AutoMedium;
    this.color_ = Color.WHITE;
    this.gamma = Math.fround(1.8);
    this.renderCount = 2;
    this.borderWidth = 0;
    this.borderColor = Color.BLACK;
    this.borderStraight = false;
    this.borderGamma = Math.fround(1.8);
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowColor = new Color()._Color$float$float$float$float(0, 0, 0, 0.75);
    this.characters = FreeTypeFontGenerator.DEFAULT_CHARS;
    this.kerning = true;
    this.packer = null;
    this.flip_ = false;
    this.genMipMaps = false;
    this.minFilter = Texture_TextureFilter.Nearest;
    this.magFilter = Texture_TextureFilter.Nearest;
    return this;
  }
}

$J.define(FreeTypeFontGenerator, 'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.files.FileHandle,int': '_FreeTypeFontGenerator$FileHandle$int', 'com.badlogic.gdx.files.FileHandle': '_FreeTypeFontGenerator$FileHandle' }, meths: { 'generateData(com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeFontParameter,com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeBitmapFontData)': 'generateData$FreeTypeFontParameter$FreeTypeBitmapFontData', 'generateData(com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeFontParameter)': 'generateData$FreeTypeFontParameter', 'generateData(int)': 'generateData$int', 'generateFont(com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeFontParameter,com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeBitmapFontData)': 'generateFont$FreeTypeFontParameter$FreeTypeBitmapFontData', 'generateFont(com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeFontParameter)': 'generateFont$FreeTypeFontParameter', 'loadChar(int,int)': 'loadChar$int$int$FreeTypeFontGenerator', 'loadChar(int)': 'loadChar$int$FreeTypeFontGenerator' }, clinit: true, lazy: ['maxTextureSize'] });
$J.define(FreeTypeFontGenerator$FreeTypeBitmapFontData, 'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeBitmapFontData', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'com.badlogic.gdx.graphics.g2d.BitmapFont$BitmapFontData', ctors: { '': '_FreeTypeFontGenerator$FreeTypeBitmapFontData' } });
$J.define(FreeTypeFontGenerator$Hinting, 'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$Hinting', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FreeTypeFontGenerator$Hinting' }, clinit: true, lazy: ['$VALUES', 'None', 'Slight', 'Medium', 'Full', 'AutoSlight', 'AutoMedium', 'AutoFull'] });
$J.define(FreeTypeFontGenerator$FreeTypeFontParameter, 'com.badlogic.gdx.graphics.g2d.freetype.FreeTypeFontGenerator$FreeTypeFontParameter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeTypeFontGenerator$FreeTypeFontParameter' } });
$J.module(() => {
  Color = $J.load('com.badlogic.gdx.graphics.Color');
  BitmapFont = $J.load('com.badlogic.gdx.graphics.g2d.BitmapFont');
  BitmapFont$Glyph = $J.load('com.badlogic.gdx.graphics.g2d.BitmapFont$Glyph');
  PixmapPacker = $J.load('com.badlogic.gdx.graphics.g2d.PixmapPacker');
  PixmapPacker$GuillotineStrategy = $J.load('com.badlogic.gdx.graphics.g2d.PixmapPacker$GuillotineStrategy');
  PixmapPacker$SkylineStrategy = $J.load('com.badlogic.gdx.graphics.g2d.PixmapPacker$SkylineStrategy');
  FreeType = $J.load('com.badlogic.gdx.graphics.g2d.freetype.FreeType');
  MathUtils = $J.load('com.badlogic.gdx.math.MathUtils');
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
});
