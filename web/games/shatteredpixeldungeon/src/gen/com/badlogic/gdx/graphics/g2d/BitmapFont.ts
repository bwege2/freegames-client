// @ts-nocheck
// BitmapFont.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008-2010, Matthias Mann
 * 
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following
 * conditions are met:
 * 
 * * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
 * disclaimer in the documentation and/or other materials provided with the distribution. * Neither the name of Matthias Mann nor
 * the names of its contributors may be used to endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
 * BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { $J, Gdx, IllegalArgumentException, JObject, JString, Texture as Texture$lib, TextureAtlas_AtlasRegion } from '../../../../../../jre/index.ts';

let BitmapFontCache, TextureRegion, Array_;

/**
 * Renders bitmap fonts. The font consists of 2 files: an image file or {@link TextureRegion} containing the glyphs and a file in
 * the AngleCode BMFont text format that describes where each glyph is on the image.
 * <p>
 * Text is drawn using a {@link Batch}. Text can be cached in a {@link BitmapFontCache} for faster rendering of static text, which
 * saves needing to compute the location of each glyph each frame.
 * <p>
 * * The texture for a BitmapFont loaded from a file is managed. {@link #dispose()} must be called to free the texture when no
 * longer needed. A BitmapFont loaded using a {@link TextureRegion} is managed if the region's texture is managed. Disposing the
 * BitmapFont disposes the region's texture, which may not be desirable if the texture is still being used elsewhere.
 * <p>
 * The code was originally based on Matthias Mann's TWL BitmapFont class. Thanks for sharing, Matthias! :)
 * @author Nathan Sweet
 * @author Matthias Mann
 */
export class BitmapFont extends JObject {
  static readonly LOG2_PAGE_SIZE: number = 9;
  static readonly PAGE_SIZE: number = 512;
  static readonly PAGES: number = 128;
  data: BitmapFont$BitmapFontData = null;
  regions: Array_<TextureRegion> = null;
  cache: BitmapFontCache = null;
  flipped: boolean = false;
  integer: boolean = false;
  ownsTexture_: boolean = false;
  /**
   * Constructs a new BitmapFont from the given {@link BitmapFontData} and array of {@link TextureRegion}. If the TextureRegion
   * is null or empty, the image path(s) will be read from the BitmapFontData. The dispose() method will not dispose the texture
   * of the region(s) if the regions array is != null and not empty.
   * @param integer If true, rendering positions will be at integer values to avoid filtering artifacts.
   */
  _BitmapFont$BitmapFontData$Array$boolean(data: BitmapFont$BitmapFontData, pageRegions: Array_<TextureRegion>, integer: boolean): this {
    this.flipped = data.flipped;
    this.data = data;
    this.integer = integer;
    if (pageRegions == null || pageRegions.size_ === 0) {
      if (data.imagePaths == null) {
        throw new IllegalArgumentException('If no regions are specified, the font data must have an images path.');
      }
      let n = data.imagePaths.length;
      this.regions = new Array_()._Array$int(n);
      for (let i = 0; i < n; i++) {
        let file: FileHandle;
        if (data.fontFile == null) {
          file = Gdx.files.internal(data.imagePaths[i]);
        } else {
          file = Gdx.files.getFileHandle(data.imagePaths[i], data.fontFile.type());
        }
        this.regions.add$Object(new TextureRegion()._TextureRegion$Texture(new Texture$lib(file, false)));
      }
      this.ownsTexture_ = true;
    } else {
      this.regions = pageRegions;
      this.ownsTexture_ = false;
    }
    this.cache = this.newFontCache();
    this.load(data);
    return this;
  }
  load(data: BitmapFont$BitmapFontData): void {
    for (let page of data.glyphs) {
      if (page == null) {
        continue;
      }
      for (let glyph of page) {
        if (glyph != null) {
          data.setGlyphRegion(glyph, this.regions.get(glyph.page));
        }
      }
    }
    if (data.missingGlyph != null) {
      data.setGlyphRegion(data.missingGlyph, this.regions.get(data.missingGlyph.page));
    }
  }
  /**
   * Draws text at the specified position.
   * @see BitmapFontCache#addText(CharSequence, float, float)
   */
  draw$Batch$CharSequence$float$float(batch: Batch, str: CharSequence, x: number, y: number): GlyphLayout {
    this.cache.clear();
    let layout = this.cache.addText$CharSequence$float$float(str, x, y);
    this.cache.draw$Batch(batch);
    return layout;
  }
  /**
   * Returns the color of text drawn with this font.
   */
  getColor(): Color {
    return this.cache.getColor();
  }
  /**
   * Returns the array of TextureRegions that represents each texture page of glyphs.
   * @return the array of texture regions; modifying it may produce undesirable results
   */
  getRegions(): Array_<TextureRegion> {
    return this.regions;
  }
  /**
   * Disposes the texture used by this BitmapFont's region IF this BitmapFont created the texture.
   */
  dispose(): void {
    if (this.ownsTexture_) {
      for (let i = 0; i < this.regions.size_; i++) {
        this.regions.get(i).getTexture().dispose();
      }
    }
  }
  /**
   * Gets the underlying {@link BitmapFontData} for this BitmapFont.
   */
  getData(): BitmapFont$BitmapFontData {
    return this.data;
  }
  /**
   * Sets whether the font owns the texture. In case it does, the font will also dispose of the texture when {@link #dispose()}
   * is called. Use with care!
   * @param ownsTexture whether the font owns the texture
   */
  setOwnsTexture(ownsTexture: boolean): void {
    this.ownsTexture_ = ownsTexture;
  }
  /**
   * Creates a new BitmapFontCache for this font. Using this method allows the font to provide the BitmapFontCache
   * implementation to customize rendering.
   * <p>
   * Note this method is called by the BitmapFont constructors. If a subclass overrides this method, it will be called before the
   * subclass constructors.
   */
  newFontCache(): BitmapFontCache {
    return new BitmapFontCache()._BitmapFontCache$BitmapFont$boolean(this, this.integer);
  }
  toString(): string {
    return this.data.name_ != null ? this.data.name_ : super.toString();
  }
}

/**
 * Represents a single character in a font page.
 */
export class BitmapFont$Glyph extends JObject {
  id_: number = 0;
  srcX: number = 0;
  srcY: number = 0;
  width_: number = 0;
  height_: number = 0;
  u: number = 0;
  v: number = 0;
  u2: number = 0;
  v2: number = 0;
  xoffset: number = 0;
  yoffset: number = 0;
  xadvance: number = 0;
  kerning: number[][] = null;
  fixedWidth: boolean = false;
  /**
   * The index to the texture page that holds this glyph.
   */
  page: number = 0;
  _BitmapFont$Glyph(): this {
    this.page = 0;
    return this;
  }
  getKerning(ch: number): number {
    if (this.kerning != null) {
      let page = this.kerning[ch >>> BitmapFont.LOG2_PAGE_SIZE];
      if (page != null) {
        return page[ch & ((BitmapFont.PAGE_SIZE - 1) | 0)];
      }
    }
    return 0;
  }
  setKerning(ch: number, value: number): void {
    if (this.kerning == null) {
      this.kerning = $J.newArray(BitmapFont.PAGES, null);
    }
    let page = this.kerning[ch >>> BitmapFont.LOG2_PAGE_SIZE];
    if (page == null) {
      (this.kerning[ch >>> BitmapFont.LOG2_PAGE_SIZE]) = page = $J.newArray(BitmapFont.PAGE_SIZE, 0);
    }
    (page[ch & ((BitmapFont.PAGE_SIZE - 1) | 0)]) = ((value) << 24) >> 24;
  }
  toString(): string {
    return String.fromCharCode((this.id_) & 0xffff);
  }
}

/**
 * Backing data for a {@link BitmapFont}.
 */
export class BitmapFont$BitmapFontData extends JObject {
  /**
   * The name of the font, or null.
   */
  name_: string = null;
  /**
   * An array of the image paths, for multiple texture pages.
   */
  imagePaths: string[] = null;
  fontFile: FileHandle = null;
  flipped: boolean = false;
  padTop: number = 0;
  padRight: number = 0;
  padBottom: number = 0;
  padLeft: number = 0;
  /**
   * The distance from one line of text to the next. To set this value, use {@link #setLineHeight(float)}.
   */
  lineHeight: number = 0;
  /**
   * The distance from the top of most uppercase characters to the baseline. Since the drawing position is the cap height of
   * the first line, the cap height can be used to get the location of the baseline.
   */
  capHeight: number = 0;
  /**
   * The distance from the cap height to the top of the tallest glyph.
   */
  ascent: number = 0;
  /**
   * The distance from the baseline to the bottom of the glyph that extends the lowest. This number is negative.
   */
  descent: number = 0;
  /**
   * The distance to move down when \n is encountered.
   */
  down: number = 0;
  /**
   * Multiplier for the line height of blank lines. down * blankLineHeight is used as the distance to move down for a blank
   * line.
   */
  blankLineScale: number = 0;
  scaleX: number = 0;
  scaleY: number = 0;
  markupEnabled: boolean = false;
  /**
   * The amount to add to the glyph X position when drawing a cursor between glyphs. This field is not set by the BMFont
   * file, it needs to be set manually depending on how the glyphs are rendered on the backing textures.
   */
  cursorX: number = 0;
  glyphs: BitmapFont$Glyph[][] = null;
  /**
   * The glyph to display for characters not in the font. May be null.
   */
  missingGlyph: BitmapFont$Glyph = null;
  /**
   * The width of the space character.
   */
  spaceXadvance: number = 0;
  /**
   * The x-height, which is the distance from the top of most lowercase characters to the baseline.
   */
  xHeight: number = 0;
  /**
   * Additional characters besides whitespace where text is wrapped. Eg, a hypen (-).
   */
  breakChars: number[] = null;
  xChars: number[] = null;
  capChars: number[] = null;
  $init_BitmapFont_BitmapFontData() {
    this.capHeight = 1;
    this.blankLineScale = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    this.glyphs = $J.newArray(BitmapFont.PAGES, null);
    this.xHeight = 1;
    this.xChars = [120 /* 'x' */, 101 /* 'e' */, 97 /* 'a' */, 111 /* 'o' */, 110 /* 'n' */, 115 /* 's' */, 114 /* 'r' */, 99 /* 'c' */, 117 /* 'u' */, 109 /* 'm' */, 118 /* 'v' */, 119 /* 'w' */, 122 /* 'z' */];
    this.capChars = [77 /* 'M' */, 78 /* 'N' */, 66 /* 'B' */, 68 /* 'D' */, 67 /* 'C' */, 69 /* 'E' */, 70 /* 'F' */, 75 /* 'K' */, 65 /* 'A' */, 71 /* 'G' */, 72 /* 'H' */, 73 /* 'I' */, 74 /* 'J' */, 76 /* 'L' */, 79 /* 'O' */, 80 /* 'P' */, 81 /* 'Q' */, 82 /* 'R' */, 83 /* 'S' */, 84 /* 'T' */, 85 /* 'U' */, 86 /* 'V' */, 87 /* 'W' */, 88 /* 'X' */, 89 /* 'Y' */, 90 /* 'Z' */];
  }
  /**
   * Creates an empty BitmapFontData for configuration before calling {@link #load(FileHandle, boolean)}, to subclass, or to
   * populate yourself, e.g. using stb-truetype or FreeType.
   */
  _BitmapFont$BitmapFontData$(): this {
    this.$init_BitmapFont_BitmapFontData();
    return this;
  }
  setGlyphRegion(glyph: BitmapFont$Glyph, region: TextureRegion): void {
    let texture = region.getTexture();
    let invTexWidth = Math.fround(1 / texture.getWidth());
    let invTexHeight = Math.fround(1 / texture.getHeight());
    let offsetX = 0;
    let offsetY = 0;
    let u = region.u;
    let v = region.v;
    let regionWidth = Math.fround(region.getRegionWidth());
    let regionHeight = Math.fround(region.getRegionHeight());
    if ($J.isa(region, TextureAtlas_AtlasRegion)) {
      let atlasRegion = region;
      offsetX = atlasRegion.offsetX;
      offsetY = Math.fround(((atlasRegion.originalHeight - atlasRegion.packedHeight) | 0) - atlasRegion.offsetY);
    }
    let x = Math.fround(glyph.srcX);
    let x2 = Math.fround((glyph.srcX + glyph.width_) | 0);
    let y = Math.fround(glyph.srcY);
    let y2 = Math.fround((glyph.srcY + glyph.height_) | 0);
    if (offsetX > Math.fround(0)) {
      x = Math.fround(x - offsetX);
      if (x < Math.fround(0)) {
        glyph.width_ = $J.d2i(Math.fround(glyph.width_ + x));
        glyph.xoffset = $J.d2i(Math.fround(glyph.xoffset - x));
        x = 0;
      }
      x2 = Math.fround(x2 - offsetX);
      if (x2 > regionWidth) {
        glyph.width_ = $J.d2i(Math.fround(glyph.width_ - Math.fround(x2 - regionWidth)));
        x2 = regionWidth;
      }
    }
    if (offsetY > Math.fround(0)) {
      y = Math.fround(y - offsetY);
      if (y < Math.fround(0)) {
        glyph.height_ = $J.d2i(Math.fround(glyph.height_ + y));
        if (glyph.height_ < 0) {
          glyph.height_ = 0;
        }
        y = 0;
      }
      y2 = Math.fround(y2 - offsetY);
      if (y2 > regionHeight) {
        let amount = Math.fround(y2 - regionHeight);
        glyph.height_ = $J.d2i(Math.fround(glyph.height_ - amount));
        glyph.yoffset = $J.d2i(Math.fround(glyph.yoffset + amount));
        y2 = regionHeight;
      }
    }
    glyph.u = Math.fround(u + Math.fround(x * invTexWidth));
    glyph.u2 = Math.fround(u + Math.fround(x2 * invTexWidth));
    if (this.flipped) {
      glyph.v = Math.fround(v + Math.fround(y * invTexHeight));
      glyph.v2 = Math.fround(v + Math.fround(y2 * invTexHeight));
    } else {
      glyph.v2 = Math.fround(v + Math.fround(y * invTexHeight));
      glyph.v = Math.fround(v + Math.fround(y2 * invTexHeight));
    }
  }
  setGlyph(ch: number, glyph: BitmapFont$Glyph): void {
    let page = this.glyphs[$J.idiv(ch, BitmapFont.PAGE_SIZE)];
    if (page == null) {
      this.glyphs[$J.idiv(ch, BitmapFont.PAGE_SIZE)] = page = $J.newArray(BitmapFont.PAGE_SIZE, null);
    }
    (page[ch & ((BitmapFont.PAGE_SIZE - 1) | 0)]) = glyph;
  }
  /**
   * Returns the glyph for the specified character, or null if no such glyph exists. Note that
   * {@link #getGlyphs(GlyphRun, CharSequence, int, int, Glyph)} should be be used to shape a string of characters into a list
   * of glyphs.
   */
  getGlyph(ch: number): BitmapFont$Glyph {
    let page = this.glyphs[$J.idiv(ch, BitmapFont.PAGE_SIZE)];
    if (page != null) {
      return page[ch & ((BitmapFont.PAGE_SIZE - 1) | 0)];
    }
    return null;
  }
  /**
   * Using the specified string, populates the glyphs and positions of the specified glyph run.
   * @param str Characters to convert to glyphs. Will not contain newline or color tags. May contain "[[" for an escaped left
   *           square bracket.
   * @param lastGlyph The glyph immediately before this run, or null if this is run is the first on a line of text. Used tp
   *           apply kerning between the specified glyph and the first glyph in this run.
   */
  getGlyphs(run: GlyphLayout$GlyphRun, str: CharSequence, start: number, end: number, lastGlyph: BitmapFont$Glyph): void {
    let max = (end - start) | 0;
    if (max === 0) {
      return;
    }
    let markupEnabled = this.markupEnabled;
    let scaleX = this.scaleX;
    let glyphs = run.glyphs;
    let xAdvances = run.xAdvances;
    glyphs.ensureCapacity(max);
    run.xAdvances.ensureCapacity((max + 1) | 0);
    do {
      let ch = str.charCodeAt(start++);
      if (ch === 13 /* \u000d */) {
        continue;
      }
      let glyph = this.getGlyph(ch);
      if (glyph == null) {
        if (this.missingGlyph == null) {
          continue;
        }
        glyph = this.missingGlyph;
      }
      glyphs.add$Object(glyph);
      xAdvances.add$float(lastGlyph == null ? (glyph.fixedWidth ? 0 : Math.fround(Math.fround(-glyph.xoffset * scaleX) - this.padLeft)) : Math.fround(((lastGlyph.xadvance + lastGlyph.getKerning(ch)) | 0) * scaleX));
      lastGlyph = glyph;
      if (markupEnabled && ch === 91 /* '[' */ && start < end && str.charCodeAt(start) === 91 /* '[' */) {
        start++;
      }
    } while (start < end);
    if (lastGlyph != null) {
      let lastGlyphWidth = lastGlyph.fixedWidth ? Math.fround(lastGlyph.xadvance * scaleX) : Math.fround(Math.fround(((lastGlyph.width_ + lastGlyph.xoffset) | 0) * scaleX) - this.padRight);
      xAdvances.add$float(lastGlyphWidth);
    }
  }
  /**
   * Returns the first valid glyph index to use to wrap to the next line, starting at the specified start index and
   * (typically) moving toward the beginning of the glyphs array.
   */
  getWrapIndex(glyphs: Array_<BitmapFont$Glyph>, start: number): number {
    let i = (start - 1) | 0;
    let glyphsItems = glyphs.items_;
    let ch = ((glyphsItems[i]).id_) & 0xffff;
    if (this.isWhitespace(ch)) {
      return i;
    }
    if (this.isBreakChar(ch)) {
      i--;
    }
    for (; i > 0; i--) {
      ch = ((glyphsItems[i]).id_) & 0xffff;
      if (this.isWhitespace(ch) || this.isBreakChar(ch)) {
        return (i + 1) | 0;
      }
    }
    return 0;
  }
  isBreakChar(c: number): boolean {
    if (this.breakChars == null) {
      return false;
    }
    for (let br of this.breakChars) {
      if (c === br) {
        return true;
      }
    }
    return false;
  }
  isWhitespace(c: number): boolean {
    switch (c) {
      case 10 /* \u000a */:
      case 13 /* \u000d */:
      case 9 /* \u0009 */:
      case 32 /* ' ' */:
        return true;
      default:
        return false;
    }
  }
  toString(): string {
    return this.name_ != null ? this.name_ : super.toString();
  }
}

$J.define(BitmapFont, 'com.badlogic.gdx.graphics.g2d.BitmapFont', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Disposable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.g2d.BitmapFont$BitmapFontData,com.badlogic.gdx.utils.Array,boolean': '_BitmapFont$BitmapFontData$Array$boolean', 'com.badlogic.gdx.graphics.g2d.BitmapFont$BitmapFontData,com.badlogic.gdx.graphics.g2d.TextureRegion,boolean': '_BitmapFont$BitmapFontData$TextureRegion$boolean', 'com.badlogic.gdx.files.FileHandle,com.badlogic.gdx.files.FileHandle,boolean,boolean': '_BitmapFont$FileHandle$FileHandle$boolean$boolean', 'com.badlogic.gdx.files.FileHandle,com.badlogic.gdx.files.FileHandle,boolean': '_BitmapFont$FileHandle$FileHandle$boolean', 'com.badlogic.gdx.files.FileHandle,boolean': '_BitmapFont$FileHandle$boolean', 'com.badlogic.gdx.files.FileHandle': '_BitmapFont$FileHandle', 'com.badlogic.gdx.files.FileHandle,com.badlogic.gdx.graphics.g2d.TextureRegion,boolean': '_BitmapFont$FileHandle$TextureRegion$boolean', 'com.badlogic.gdx.files.FileHandle,com.badlogic.gdx.graphics.g2d.TextureRegion': '_BitmapFont$FileHandle$TextureRegion', 'boolean': '_BitmapFont$boolean', '': '_BitmapFont$' }, meths: { 'getRegion(int)': 'getRegion$int', 'getRegion()': 'getRegion$', 'setColor(float,float,float,float)': 'setColor$float$float$float$float', 'setColor(com.badlogic.gdx.graphics.Color)': 'setColor$Color', 'draw(com.badlogic.gdx.graphics.g2d.Batch,com.badlogic.gdx.graphics.g2d.GlyphLayout,float,float)': 'draw$Batch$GlyphLayout$float$float', 'draw(com.badlogic.gdx.graphics.g2d.Batch,java.lang.CharSequence,float,float,int,int,float,int,boolean,java.lang.String)': 'draw$Batch$CharSequence$float$float$int$int$float$int$boolean$String', 'draw(com.badlogic.gdx.graphics.g2d.Batch,java.lang.CharSequence,float,float,int,int,float,int,boolean)': 'draw$Batch$CharSequence$float$float$int$int$float$int$boolean', 'draw(com.badlogic.gdx.graphics.g2d.Batch,java.lang.CharSequence,float,float,float,int,boolean)': 'draw$Batch$CharSequence$float$float$float$int$boolean', 'draw(com.badlogic.gdx.graphics.g2d.Batch,java.lang.CharSequence,float,float)': 'draw$Batch$CharSequence$float$float' } });
$J.define(BitmapFont$Glyph, 'com.badlogic.gdx.graphics.g2d.BitmapFont$Glyph', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BitmapFont$Glyph' } });
$J.define(BitmapFont$BitmapFontData, 'com.badlogic.gdx.graphics.g2d.BitmapFont$BitmapFontData', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.files.FileHandle,boolean': '_BitmapFont$BitmapFontData$FileHandle$boolean', '': '_BitmapFont$BitmapFontData$' }, meths: { 'setScale(float)': 'setScale$float', 'setScale(float,float)': 'setScale$float$float' } });
$J.module(() => {
  BitmapFontCache = $J.load('com.badlogic.gdx.graphics.g2d.BitmapFontCache');
  TextureRegion = $J.load('com.badlogic.gdx.graphics.g2d.TextureRegion');
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
});
