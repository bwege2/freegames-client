// @ts-nocheck
// BitmapFontCache.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays, IllegalArgumentException, JObject, JString } from '../../../../../../jre/index.ts';

let Color, GlyphLayout, Align, Array_, FlushablePool, IntArray, NumberUtils;

/**
 * Caches glyph geometry for a BitmapFont, providing a fast way to render static text. This saves needing to compute the glyph
 * geometry each frame.
 * @author Nathan Sweet
 * @author davebaol
 * @author Alexander Dorokhov
 */
export class BitmapFontCache extends JObject {
  static tempColor: Color = null;
  font: BitmapFont = null;
  integer: boolean = false;
  layouts: Array_<GlyphLayout> = null;
  pooledLayouts: FlushablePool<GlyphLayout> = null;
  glyphCount: number = 0;
  x: number = 0;
  y: number = 0;
  color_: Color = null;
  currentTint: number = 0;
  /**
   * Vertex data per page.
   */
  pageVertices: number[][] = null;
  /**
   * Number of vertex data entries per page.
   */
  idx: number[] = null;
  /**
   * For each page, an array with a value for each glyph from that page, where the value is the index of the character in the
   * full text being cached.
   */
  pageGlyphIndices: IntArray[] = null;
  /**
   * Used internally to ensure a correct capacity for multi-page font vertex data.
   */
  tempGlyphCount: number[] = null;
  $init_BitmapFontCache() {
    this.layouts = new Array_()._Array$int(1);
    this.pooledLayouts = new (BitmapFontCache$1())().$o(this)._FlushablePool$();
    this.color_ = new Color()._Color$float$float$float$float(1, 1, 1, 1);
  }
  /**
   * @param integer If true, rendering positions will be at integer values to avoid filtering artifacts.
   */
  _BitmapFontCache$BitmapFont$boolean(font: BitmapFont, integer: boolean): this {
    this.$init_BitmapFontCache();
    this.font = font;
    this.integer = integer;
    let pageCount = font.regions.size_;
    if (pageCount === 0) {
      throw new IllegalArgumentException('The specified font must contain at least one texture page.');
    }
    this.pageVertices = $J.newArray(pageCount, null);
    this.idx = $J.newArray(pageCount, 0);
    if (pageCount > 1) {
      this.pageGlyphIndices = $J.newArray(pageCount, null);
      for (let i = 0, n = this.pageGlyphIndices.length; i < n; i++) {
        this.pageGlyphIndices[i] = new IntArray()._IntArray$();
      }
    }
    this.tempGlyphCount = $J.newArray(pageCount, 0);
    return this;
  }
  /**
   * Returns the color used for subsequently added text. Modifying the color affects text subsequently added to the cache, but
   * does not affect existing text currently in the cache.
   */
  getColor(): Color {
    return this.color_;
  }
  draw$Batch(spriteBatch: Batch): void {
    let regions = this.font.getRegions();
    for (let j = 0, n = this.pageVertices.length; j < n; j++) {
      if (this.idx[j] > 0) {
        let vertices = this.pageVertices[j];
        spriteBatch.draw(regions.get(j).getTexture(), vertices, 0, this.idx[j]);
      }
    }
  }
  /**
   * Removes all glyphs in the cache.
   */
  clear(): void {
    this.x = 0;
    this.y = 0;
    this.pooledLayouts.flush();
    this.layouts.clear();
    for (let i = 0, n = this.idx.length; i < n; i++) {
      if (this.pageGlyphIndices != null) {
        this.pageGlyphIndices[i].clear();
      }
      this.idx[i] = 0;
    }
  }
  requireGlyphs(layout: GlyphLayout): void {
    if (this.pageVertices.length === 1) {
      this.requirePageGlyphs(0, layout.glyphCount);
    } else {
      let tempGlyphCount = this.tempGlyphCount;
      Arrays.fill(tempGlyphCount, 0);
      for (let i = 0, n = layout.runs.size_; i < n; i++) {
        let glyphs = layout.runs.get(i).glyphs;
        let glyphItems = glyphs.items_;
        for (let ii = 0, nn = glyphs.size_; ii < nn; ii++) {
          tempGlyphCount[(glyphItems[ii]).page]++;
        }
      }
      for (let i = 0, n = tempGlyphCount.length; i < n; i++) {
        this.requirePageGlyphs(i, tempGlyphCount[i]);
      }
    }
  }
  requirePageGlyphs(page: number, glyphCount: number): void {
    if (this.pageGlyphIndices != null) {
      if (glyphCount > this.pageGlyphIndices[page].items_.length) {
        this.pageGlyphIndices[page].ensureCapacity((glyphCount - this.pageGlyphIndices[page].size_) | 0);
      }
    }
    let vertexCount = (this.idx[page] + Math.imul(glyphCount, 20)) | 0;
    let vertices = this.pageVertices[page];
    if (vertices == null) {
      this.pageVertices[page] = $J.newArray(vertexCount, 0);
    } else if (vertices.length < vertexCount) {
      let newVertices = $J.newArray(vertexCount, 0);
      $J.system_arraycopy(vertices, 0, newVertices, 0, this.idx[page]);
      this.pageVertices[page] = newVertices;
    }
  }
  setPageCount(pageCount: number): void {
    let newPageVertices = $J.newArray(pageCount, null);
    $J.system_arraycopy(this.pageVertices, 0, newPageVertices, 0, this.pageVertices.length);
    this.pageVertices = newPageVertices;
    let newIdx = $J.newArray(pageCount, 0);
    $J.system_arraycopy(this.idx, 0, newIdx, 0, this.idx.length);
    this.idx = newIdx;
    let newPageGlyphIndices = $J.newArray(pageCount, null);
    let pageGlyphIndicesLength = 0;
    if (this.pageGlyphIndices != null) {
      pageGlyphIndicesLength = this.pageGlyphIndices.length;
      $J.system_arraycopy(this.pageGlyphIndices, 0, newPageGlyphIndices, 0, this.pageGlyphIndices.length);
    }
    for (let i = pageGlyphIndicesLength; i < pageCount; i++) {
      newPageGlyphIndices[i] = new IntArray()._IntArray$();
    }
    this.pageGlyphIndices = newPageGlyphIndices;
    this.tempGlyphCount = $J.newArray(pageCount, 0);
  }
  addToCache(layout: GlyphLayout, x: number, y: number): void {
    let runCount = layout.runs.size_;
    if (runCount === 0) {
      return;
    }
    if (this.pageVertices.length < this.font.regions.size_) {
      this.setPageCount(this.font.regions.size_);
    }
    this.layouts.add$Object(layout);
    this.requireGlyphs(layout);
    let colors = layout.colors;
    let colorsIndex = 0;
    let nextColorGlyphIndex = 0;
    let glyphIndex = 0;
    let lastColorFloatBits = 0;
    for (let i = 0; i < runCount; i++) {
      let run = layout.runs.get(i);
      let glyphs = run.glyphs.items_;
      let xAdvances = run.xAdvances.items_;
      let gx = Math.fround(x + run.x);
      let gy = Math.fround(y + run.y);
      for (let ii = 0, nn = run.glyphs.size_; ii < nn; ii++) {
        if (glyphIndex++ === nextColorGlyphIndex) {
          lastColorFloatBits = NumberUtils.intToFloatColor(colors.get(++colorsIndex));
          nextColorGlyphIndex = ++colorsIndex < colors.size_ ? colors.get(colorsIndex) : -1;
        }
        gx = Math.fround(gx + xAdvances[ii]);
        this.addGlyph(glyphs[ii], gx, gy, lastColorFloatBits);
      }
    }
    this.currentTint = Color.WHITE_FLOAT_BITS;
  }
  addGlyph(glyph: BitmapFont$Glyph, x: number, y: number, color: number): void {
    let scaleX = this.font.data.scaleX;
    let scaleY = this.font.data.scaleY;
    x = Math.fround(x + Math.fround(glyph.xoffset * scaleX));
    y = Math.fround(y + Math.fround(glyph.yoffset * scaleY));
    let width = Math.fround(glyph.width_ * scaleX);
    let height = Math.fround(glyph.height_ * scaleY);
    let u = glyph.u;
    let u2 = glyph.u2;
    let v = glyph.v;
    let v2 = glyph.v2;
    if (this.integer) {
      x = Math.fround($J.roundf(x));
      y = Math.fround($J.roundf(y));
      width = Math.fround($J.roundf(width));
      height = Math.fround($J.roundf(height));
    }
    let x2 = Math.fround(x + width);
    let y2 = Math.fround(y + height);
    let page = glyph.page;
    let idx = this.idx[page];
    this.idx[page] = (this.idx[page] + 20) | 0;
    if (this.pageGlyphIndices != null) {
      this.pageGlyphIndices[page].add$int(this.glyphCount++);
    }
    let vertices = this.pageVertices[page];
    vertices[idx++] = x;
    vertices[idx++] = y;
    vertices[idx++] = color;
    vertices[idx++] = u;
    vertices[idx++] = v;
    vertices[idx++] = x;
    vertices[idx++] = y2;
    vertices[idx++] = color;
    vertices[idx++] = u;
    vertices[idx++] = v2;
    vertices[idx++] = x2;
    vertices[idx++] = y2;
    vertices[idx++] = color;
    vertices[idx++] = u2;
    vertices[idx++] = v2;
    vertices[idx++] = x2;
    vertices[idx++] = y;
    vertices[idx++] = color;
    vertices[idx++] = u2;
    vertices[idx] = v;
  }
  /**
   * Adds glyphs for the specified text.
   * @see #addText(CharSequence, float, float, int, int, float, int, boolean, String)
   */
  addText$CharSequence$float$float(str: CharSequence, x: number, y: number): GlyphLayout {
    return this.addText$CharSequence$float$float$int$int$float$int$boolean$String(str, x, y, 0, str.length, 0, Align.left, false, null);
  }
  /**
   * Adds glyphs for the the specified text.
   * @param x The x position for the left most character.
   * @param y The y position for the top of most capital letters in the font (the {@link BitmapFontData#capHeight cap height}).
   * @param start The first character of the string to draw.
   * @param end The last character of the string to draw (exclusive).
   * @param targetWidth The width of the area the text will be drawn, for wrapping or truncation.
   * @param halign Horizontal alignment of the text, see {@link Align}.
   * @param wrap If true, the text will be wrapped within targetWidth.
   * @param truncate If not null, the text will be truncated within targetWidth with this string appended. May be an empty
   *           string.
   * @return The glyph layout for the cached string (the layout's height is the distance from y to the baseline).
   */
  addText$CharSequence$float$float$int$int$float$int$boolean$String(str: CharSequence, x: number, y: number, start: number, end: number, targetWidth: number, halign: number, wrap: boolean, truncate: string): GlyphLayout {
    let layout = this.pooledLayouts.obtain();
    layout.setText$BitmapFont$CharSequence$int$int$Color$float$int$boolean$String(this.font, str, start, end, this.color_, targetWidth, halign, wrap, truncate);
    this.addText$GlyphLayout$float$float(layout, x, y);
    return layout;
  }
  /**
   * Adds the specified glyphs.
   * @param layout The cache keeps the layout until cleared or new text is set. The layout should not be modified before then.
   */
  addText$GlyphLayout$float$float(layout: GlyphLayout, x: number, y: number): void {
    this.addToCache(layout, x, Math.fround(y + this.font.data.ascent));
  }
  static $clinit() {
    BitmapFontCache.tempColor = new Color()._Color$float$float$float$float(1, 1, 1, 1);
  }
}

let $BitmapFontCache$1: any = null;
/** An anonymous class (BitmapFontCache.java:42). */
function BitmapFontCache$1(): any {
  return $BitmapFontCache$1 ??= $J.local(class extends FlushablePool {
    newObject(): GlyphLayout {
      return new GlyphLayout()._GlyphLayout$();
    }
  }, 'com.badlogic.gdx.graphics.g2d.BitmapFontCache$1', []);
}

$J.define(BitmapFontCache, 'com.badlogic.gdx.graphics.g2d.BitmapFontCache', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.g2d.BitmapFont,boolean': '_BitmapFontCache$BitmapFont$boolean', 'com.badlogic.gdx.graphics.g2d.BitmapFont': '_BitmapFontCache$BitmapFont' }, meths: { 'getVertices(int)': 'getVertices$int', 'getVertices()': 'getVertices$', 'addText(com.badlogic.gdx.graphics.g2d.GlyphLayout,float,float)': 'addText$GlyphLayout$float$float', 'addText(java.lang.CharSequence,float,float,int,int,float,int,boolean,java.lang.String)': 'addText$CharSequence$float$float$int$int$float$int$boolean$String', 'addText(java.lang.CharSequence,float,float,int,int,float,int,boolean)': 'addText$CharSequence$float$float$int$int$float$int$boolean', 'addText(java.lang.CharSequence,float,float,float,int,boolean)': 'addText$CharSequence$float$float$float$int$boolean', 'addText(java.lang.CharSequence,float,float)': 'addText$CharSequence$float$float', 'setText(com.badlogic.gdx.graphics.g2d.GlyphLayout,float,float)': 'setText$GlyphLayout$float$float', 'setText(java.lang.CharSequence,float,float,int,int,float,int,boolean,java.lang.String)': 'setText$CharSequence$float$float$int$int$float$int$boolean$String', 'setText(java.lang.CharSequence,float,float,int,int,float,int,boolean)': 'setText$CharSequence$float$float$int$int$float$int$boolean', 'setText(java.lang.CharSequence,float,float,float,int,boolean)': 'setText$CharSequence$float$float$float$int$boolean', 'setText(java.lang.CharSequence,float,float)': 'setText$CharSequence$float$float', 'draw(com.badlogic.gdx.graphics.g2d.Batch,float)': 'draw$Batch$float', 'draw(com.badlogic.gdx.graphics.g2d.Batch,int,int)': 'draw$Batch$int$int', 'draw(com.badlogic.gdx.graphics.g2d.Batch)': 'draw$Batch', 'setColor(float,float,float,float)': 'setColor$float$float$float$float', 'setColor(com.badlogic.gdx.graphics.Color)': 'setColor$Color', 'setColors(float,int,int)': 'setColors$float$int$int', 'setColors(com.badlogic.gdx.graphics.Color,int,int)': 'setColors$Color$int$int', 'setColors(float,float,float,float)': 'setColors$float$float$float$float', 'setColors(com.badlogic.gdx.graphics.Color)': 'setColors$Color', 'setColors(float)': 'setColors$float' }, clinit: true, lazy: ['tempColor'] });
$J.module(() => {
  Color = $J.load('com.badlogic.gdx.graphics.Color');
  GlyphLayout = $J.load('com.badlogic.gdx.graphics.g2d.GlyphLayout');
  Align = $J.load('com.badlogic.gdx.utils.Align');
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
  FlushablePool = $J.load('com.badlogic.gdx.utils.FlushablePool');
  IntArray = $J.load('com.badlogic.gdx.utils.IntArray');
  NumberUtils = $J.load('com.badlogic.gdx.utils.NumberUtils');
});
