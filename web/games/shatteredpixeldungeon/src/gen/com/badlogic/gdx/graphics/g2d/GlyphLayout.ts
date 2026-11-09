// @ts-nocheck
// GlyphLayout.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject, JString, StringBuilder } from '../../../../../../jre/index.ts';

let Colors, Align, Array_, DefaultPool, FloatArray, IntArray;

/**
 * Stores {@link GlyphRun runs} of glyphs for a piece of text. The text may contain newlines and color markup tags.
 * <p>
 * Where wrapping occurs is determined by {@link BitmapFontData#getWrapIndex(Array, int)}. Additionally, when
 * {@link BitmapFontData#markupEnabled} is true wrapping can occur at color start or end tags.
 * <p>
 * When wrapping occurs, whitespace is removed before and after the wrap position. Whitespace is determined by
 * {@link BitmapFontData#isWhitespace(char)}.
 * <p>
 * Glyphs positions are determined by {@link BitmapFontData#getGlyphs(GlyphRun, CharSequence, int, int, Glyph)}.
 * <p>
 * This class is not thread safe, even if synchronized externally, and must only be used from the game thread.
 * @author Nathan Sweet
 * @author davebaol
 * @author Alexander Dorokhov
 * @author Thomas Creutzenberg
 */
export class GlyphLayout extends JObject {
  static glyphRunPool: Pool<GlyphLayout$GlyphRun> = null;
  static colorStack: IntArray = null;
  static readonly epsilon: number = Math.fround(1E-4);
  /**
   * Each run has the glyphs for a line of text.
   * <p>
   * Runs are pooled, so references should not be kept past the next call to
   * {@link #setText(BitmapFont, CharSequence, int, int, Color, float, int, boolean, String)} or {@link #reset()}.
   */
  runs: Array_<GlyphLayout$GlyphRun> = null;
  /**
   * Determines the colors of the glpyhs in the {@link #runs}. Entries are pairs where the first is the glyph index (across all
   * runs) where the color starts and the second is the color encoded as ABGR8888.
   * <p>
   * For example: <code>[0, WHITE, 4, GREEN, 5, WHITE]</code><br>
   * Glpyhs 0 to 3 are WHITE, 4 is GREEN and 5 to the end are WHITE.
   * <p>
   * The array is empty if there are no runs, otherwise it has at least two entries: <code>[0, startColor]</code>
   */
  colors: IntArray = null;
  /**
   * Number of glyphs across all {@link #runs}.
   */
  glyphCount: number = 0;
  width_: number = 0;
  height_: number = 0;
  $init_GlyphLayout() {
    this.runs = new Array_()._Array$int(1);
    this.colors = new IntArray()._IntArray$int(2);
  }
  /**
   * Creates an empty GlyphLayout.
   */
  _GlyphLayout$(): this {
    this.$init_GlyphLayout();
    return this;
  }
  /**
   * @see #setText(BitmapFont, CharSequence)
   */
  _GlyphLayout$BitmapFont$CharSequence(font: BitmapFont, str: CharSequence): this {
    this.$init_GlyphLayout();
    this.setText$BitmapFont$CharSequence(font, str);
    return this;
  }
  /**
   * Calls {@link #setText(BitmapFont, CharSequence, int, int, Color, float, int, boolean, String) setText} with the whole
   * string, the font's current color, and no alignment or wrapping.
   */
  setText$BitmapFont$CharSequence(font: BitmapFont, str: CharSequence): void {
    this.setText$BitmapFont$CharSequence$int$int$Color$float$int$boolean$String(font, str, 0, str.length, font.getColor(), 0, Align.left, false, null);
  }
  /**
   * @param color The default color to use for the text (the BitmapFont {@link BitmapFont#getColor() color} is not used). If
   *           {@link BitmapFontData#markupEnabled} is true, color markup tags in the specified string may change the color for
   *           portions of the text.
   * @param halign Horizontal alignment of the text, see {@link Align}.
   * @param targetWidth The width used for alignment, line wrapping, and truncation. May be zero if those features are not used.
   * @param truncate If not null and the width of the glyphs exceed targetWidth, the glyphs are truncated and the glyphs for the
   *           specified truncate string are placed at the end. Empty string can be used to truncate without adding glyphs.
   *           Truncate should not be used with text that contains multiple lines. Wrap is ignored if truncate is not null.
   */
  setText$BitmapFont$CharSequence$int$int$Color$float$int$boolean$String(font: BitmapFont, str: CharSequence, start: number, end: number, color: Color, targetWidth: number, halign: number, wrap: boolean, truncate: string): void {
    this.reset();
    let fontData = font.data;
    if (start === end) {
      this.height_ = fontData.capHeight;
      return;
    }
    if (wrap) {
      targetWidth = Math.max(targetWidth, Math.fround(fontData.spaceXadvance * 3));
    }
    let wrapOrTruncate = wrap || truncate != null;
    let currentColor = color.toIntBits();
    let nextColor = currentColor;
    this.colors.add$int$int(0, currentColor);
    let markupEnabled = fontData.markupEnabled;
    if (markupEnabled) {
      GlyphLayout.colorStack.add$int(currentColor);
    }
    let isLastRun = false;
    let y = 0;
    let down = fontData.down;
    let lineRun = null;
    let lastGlyph = null;
    let runStart = start;
    outer:
    while (true) {
      let runEnd: number;
      let newline = false;
      if (start === end) {
        if (runStart === end) {
          break;
        }
        runEnd = end;
        isLastRun = true;
      } else {
        switch (str.charCodeAt(start++)) {
          case 10 /* \u000a */:
            runEnd = (start - 1) | 0;
            newline = true;
            break;
          case 91 /* '[' */:
            if (markupEnabled) {
              let length = this.parseColorMarkup(str, start, end);
              if (length >= 0) {
                runEnd = (start - 1) | 0;
                start = (start + (length + 1)) | 0;
                if (start === end) {
                  isLastRun = true;
                } else {
                  nextColor = GlyphLayout.colorStack.peek();
                }
                break;
              }
              if (length === -2) {
                start++;
              }
            }
          default:
            continue outer;
        }
      }
      runEnded:
      {
        let run = GlyphLayout.glyphRunPool.obtain();
        run.x = 0;
        run.y = y;
        fontData.getGlyphs(run, str, runStart, runEnd, lastGlyph);
        this.glyphCount = (this.glyphCount + run.glyphs.size_) | 0;
        if (nextColor !== currentColor) {
          if (this.colors.get((this.colors.size_ - 2) | 0) === this.glyphCount) {
            this.colors.set((this.colors.size_ - 1) | 0, nextColor);
          } else {
            this.colors.add$int(this.glyphCount);
            this.colors.add$int(nextColor);
          }
          currentColor = nextColor;
        }
        if (run.glyphs.size_ === 0) {
          GlyphLayout.glyphRunPool.free(run);
          if (lineRun == null) {
            break runEnded;
          }
        } else if (lineRun == null) {
          lineRun = run;
          this.runs.add$Object(lineRun);
        } else {
          lineRun.appendRun(run);
          GlyphLayout.glyphRunPool.free(run);
        }
        if (newline || isLastRun) {
          this.setLastGlyphXAdvance(fontData, lineRun);
          lastGlyph = null;
        } else {
          lastGlyph = lineRun.glyphs.peek();
        }
        if (!wrapOrTruncate || lineRun.glyphs.size_ === 0) {
          break runEnded;
        }
        if (newline || isLastRun) {
          let runWidth = Math.fround(lineRun.xAdvances.first() + lineRun.xAdvances.get(1));
          for (let i = 2; i < lineRun.xAdvances.size_; i++) {
            let glyph = lineRun.glyphs.get((i - 1) | 0);
            let glyphWidth = this.getGlyphWidth(glyph, fontData);
            if (Math.fround(Math.fround(runWidth + glyphWidth) - GlyphLayout.epsilon) <= targetWidth) {
              runWidth = Math.fround(runWidth + lineRun.xAdvances.items_[i]);
              continue;
            }
            if (truncate != null) {
              this.truncate(fontData, lineRun, targetWidth, truncate);
              break outer;
            }
            let wrapIndex = fontData.getWrapIndex(lineRun.glyphs, i);
            if ((wrapIndex === 0 && lineRun.x === Math.fround(0)) || wrapIndex >= lineRun.glyphs.size_) {
              wrapIndex = (i - 1) | 0;
            }
            lineRun = this.wrap(fontData, lineRun, wrapIndex);
            if (lineRun == null) {
              break runEnded;
            }
            this.runs.add$Object(lineRun);
            y = Math.fround(y + down);
            lineRun.x = 0;
            lineRun.y = y;
            runWidth = Math.fround(lineRun.xAdvances.first() + lineRun.xAdvances.get(1));
            i = 1;
          }
        }
      }
      if (newline) {
        lineRun = null;
        lastGlyph = null;
        if (runEnd === runStart) {
          y = Math.fround(y + Math.fround(down * fontData.blankLineScale));
        } else {
          y = Math.fround(y + down);
        }
      }
      runStart = start;
    }
    this.height_ = Math.fround(fontData.capHeight + Math.fround(Math.abs(y)));
    this.calculateWidths(fontData);
    this.alignRuns(targetWidth, halign);
    if (markupEnabled) {
      GlyphLayout.colorStack.clear();
    }
  }
  /**
   * Calculate run widths and the entire layout width.
   */
  calculateWidths(fontData: BitmapFont$BitmapFontData): void {
    let width = 0;
    let runsItems = this.runs.items_;
    for (let i = 0, n = this.runs.size_; i < n; i++) {
      let run = runsItems[i];
      let xAdvances = run.xAdvances.items_;
      let runWidth = Math.fround(run.x + xAdvances[0]);
      let max = 0;
      let glyphs = run.glyphs.items_;
      for (let ii = 0, nn = run.glyphs.size_; ii < nn; ) {
        let glyph = glyphs[ii];
        let glyphWidth = this.getGlyphWidth(glyph, fontData);
        max = Math.max(max, Math.fround(runWidth + glyphWidth));
        ii++;
        runWidth = Math.fround(runWidth + xAdvances[ii]);
      }
      run.width_ = Math.fround(Math.max(runWidth, max) - run.x);
      width = Math.max(width, Math.fround(run.x + run.width_));
    }
    this.width_ = width;
  }
  /**
   * Align runs to center or right of targetWidth. Requires run.width of runs to be already set
   */
  alignRuns(targetWidth: number, halign: number): void {
    if ((halign & Align.left) === 0) {
      let center = (halign & Align.center) !== 0;
      let runsItems = this.runs.items_;
      for (let i = 0, n = this.runs.size_; i < n; i++) {
        let run = runsItems[i];
        run.x = Math.fround(run.x + (center ? Math.fround(0.5 * (Math.fround(targetWidth - run.width_))) : Math.fround(targetWidth - run.width_)));
      }
    }
  }
  /**
   * @param truncate May be empty string.
   */
  truncate(fontData: BitmapFont$BitmapFontData, run: GlyphLayout$GlyphRun, targetWidth: number, truncate: string): void {
    let glyphCount = run.glyphs.size_;
    let truncateRun = GlyphLayout.glyphRunPool.obtain();
    fontData.getGlyphs(truncateRun, truncate, 0, truncate.length, null);
    let truncateWidth = 0;
    if (truncateRun.xAdvances.size_ > 0) {
      this.setLastGlyphXAdvance(fontData, truncateRun);
      let xAdvances = truncateRun.xAdvances.items_;
      for (let i = 1, n = truncateRun.xAdvances.size_; i < n; i++) {
        truncateWidth = Math.fround(truncateWidth + xAdvances[i]);
      }
    }
    targetWidth = Math.fround(targetWidth - truncateWidth);
    let count = 0;
    let width = run.x;
    let xAdvances = run.xAdvances.items_;
    while (count < run.xAdvances.size_) {
      let xAdvance = xAdvances[count];
      width = Math.fround(width + xAdvance);
      if (width > targetWidth) {
        break;
      }
      count++;
    }
    if (count > 1) {
      run.glyphs.truncate((count - 1) | 0);
      run.xAdvances.truncate(count);
      this.setLastGlyphXAdvance(fontData, run);
      if (truncateRun.xAdvances.size_ > 0) {
        run.xAdvances.addAll$FloatArray$int$int(truncateRun.xAdvances, 1, (truncateRun.xAdvances.size_ - 1) | 0);
      }
    } else {
      run.glyphs.clear();
      run.xAdvances.clear();
      run.xAdvances.addAll$FloatArray(truncateRun.xAdvances);
    }
    let droppedGlyphCount = (glyphCount - run.glyphs.size_) | 0;
    if (droppedGlyphCount > 0) {
      this.glyphCount = (this.glyphCount - droppedGlyphCount) | 0;
      if (fontData.markupEnabled) {
        while (this.colors.size_ > 2 && this.colors.get((this.colors.size_ - 2) | 0) >= this.glyphCount) {
          this.colors.size_ = (this.colors.size_ - 2) | 0;
        }
      }
    }
    run.glyphs.addAll$Array(truncateRun.glyphs);
    this.glyphCount = (this.glyphCount + truncate.length) | 0;
    GlyphLayout.glyphRunPool.free(truncateRun);
  }
  /**
   * Breaks a run into two runs at the specified wrapIndex.
   * @return May be null if second run is all whitespace.
   */
  wrap(fontData: BitmapFont$BitmapFontData, first: GlyphLayout$GlyphRun, wrapIndex: number): GlyphLayout$GlyphRun {
    let glyphs2 = first.glyphs;
    let glyphCount = first.glyphs.size_;
    let xAdvances2 = first.xAdvances;
    let firstEnd = wrapIndex;
    for (; firstEnd > 0; firstEnd--) {
      if (!fontData.isWhitespace((glyphs2.get((firstEnd - 1) | 0).id_) & 0xffff)) {
        break;
      }
    }
    let secondStart = wrapIndex;
    for (; secondStart < glyphCount; secondStart++) {
      if (!fontData.isWhitespace((glyphs2.get(secondStart).id_) & 0xffff)) {
        break;
      }
    }
    let second = null;
    if (secondStart < glyphCount) {
      second = GlyphLayout.glyphRunPool.obtain();
      let glyphs1 = second.glyphs;
      glyphs1.addAll$Array$int$int(glyphs2, 0, firstEnd);
      glyphs2.removeRange(0, (secondStart - 1) | 0);
      first.glyphs = glyphs1;
      second.glyphs = glyphs2;
      let xAdvances1 = second.xAdvances;
      xAdvances1.addAll$FloatArray$int$int(xAdvances2, 0, (firstEnd + 1) | 0);
      xAdvances2.removeRange(1, secondStart);
      xAdvances2.items_[0] = this.getLineOffset(glyphs2, fontData);
      first.xAdvances = xAdvances1;
      second.xAdvances = xAdvances2;
      let firstGlyphCount = first.glyphs.size_;
      let secondGlyphCount = second.glyphs.size_;
      let droppedGlyphCount = (glyphCount - firstGlyphCount - secondGlyphCount) | 0;
      this.glyphCount = (this.glyphCount - droppedGlyphCount) | 0;
      if (fontData.markupEnabled && droppedGlyphCount > 0) {
        let reductionThreshold = (this.glyphCount - secondGlyphCount) | 0;
        for (let i = (this.colors.size_ - 2) | 0; i >= 2; i = (i - 2) | 0) {
          let colorChangeIndex = this.colors.get(i);
          if (colorChangeIndex <= reductionThreshold) {
            break;
          }
          this.colors.set(i, (colorChangeIndex - droppedGlyphCount) | 0);
        }
      }
    } else {
      glyphs2.truncate(firstEnd);
      xAdvances2.truncate((firstEnd + 1) | 0);
      let droppedGlyphCount = (secondStart - firstEnd) | 0;
      if (droppedGlyphCount > 0) {
        this.glyphCount = (this.glyphCount - droppedGlyphCount) | 0;
        if (fontData.markupEnabled && this.colors.get((this.colors.size_ - 2) | 0) > this.glyphCount) {
          let lastColor = this.colors.peek();
          while (this.colors.get((this.colors.size_ - 2) | 0) > this.glyphCount) {
            this.colors.size_ = (this.colors.size_ - 2) | 0;
          }
          this.colors.set((this.colors.size_ - 2) | 0, this.glyphCount);
          this.colors.set((this.colors.size_ - 1) | 0, lastColor);
        }
      }
    }
    if (firstEnd === 0) {
      GlyphLayout.glyphRunPool.free(first);
      this.runs.pop();
    } else {
      this.setLastGlyphXAdvance(fontData, first);
    }
    return second;
  }
  /**
   * Sets the xadvance of the last glyph to use its width instead of xadvance.
   */
  setLastGlyphXAdvance(fontData: BitmapFont$BitmapFontData, run: GlyphLayout$GlyphRun): void {
    let last = run.glyphs.peek();
    if (!last.fixedWidth) {
      (run.xAdvances.items_[(run.xAdvances.size_ - 1) | 0]) = this.getGlyphWidth(last, fontData);
    }
  }
  /**
   * Returns the distance from the glyph's drawing position to the right edge of the glyph.
   */
  getGlyphWidth(glyph: BitmapFont$Glyph, fontData: BitmapFont$BitmapFontData): number {
    return Math.fround(Math.fround((glyph.fixedWidth ? glyph.xadvance : (glyph.width_ + glyph.xoffset) | 0) * fontData.scaleX) - fontData.padRight);
  }
  /**
   * Returns an X offset for the first glyph so when drawn, none of it is left of the line's drawing position.
   */
  getLineOffset(glyphs: Array_<BitmapFont$Glyph>, fontData: BitmapFont$BitmapFontData): number {
    let first = glyphs.first();
    return Math.fround((first.fixedWidth ? 0 : Math.fround(-first.xoffset * fontData.scaleX)) - fontData.padLeft);
  }
  parseColorMarkup(str: CharSequence, start: number, end: number): number {
    if (start === end) {
      return -1;
    }
    {
      let color: number;
      switch (str.charCodeAt(start)) {
        case 35 /* '#' */:
          color = 0;
          for (let i = (start + 1) | 0; i < end; i++) {
            let ch = str.charCodeAt(i);
            if (ch === 93 /* ']' */) {
              if (i < ((start + 2) | 0) || i > ((start + 9) | 0)) {
                break;
              }
              if (((i - start) | 0) < 8) {
                color = color << (((9 - (i - start)) | 0) << 2) | 255;
              }
              GlyphLayout.colorStack.add$int($J.Integer_reverseBytes(color));
              return (i - start) | 0;
            }
            color = ((color << 4) + ch) | 0;
            if (ch >= 48 /* '0' */ && ch <= 57 /* '9' */) {
              color = (color - 48 /* '0' */) | 0;
            } else if (ch >= 65 /* 'A' */ && ch <= 70 /* 'F' */) {
              color = (color - (65 /* 'A' */ - 10)) | 0;
            } else if (ch >= 97 /* 'a' */ && ch <= 102 /* 'f' */) {
              color = (color - (97 /* 'a' */ - 10)) | 0;
            } else {
              break;
            }
          }
          return -1;
        case 91 /* '[' */:
          return -2;
        case 93 /* ']' */:
          if (GlyphLayout.colorStack.size_ > 1) {
            GlyphLayout.colorStack.pop();
          }
          return 0;
      }
    }
    for (let i = (start + 1) | 0; i < end; i++) {
      let ch = str.charCodeAt(i);
      if (ch !== 93 /* ']' */) {
        continue;
      }
      let color = Colors.get($J.str(JString.subSequence(str, start, i)));
      if (color == null) {
        return -1;
      }
      GlyphLayout.colorStack.add$int(color.toIntBits());
      return (i - start) | 0;
    }
    return -1;
  }
  reset(): void {
    GlyphLayout.glyphRunPool.freeAll(this.runs);
    this.runs.clear();
    this.colors.clear();
    this.glyphCount = 0;
    this.width_ = 0;
    this.height_ = 0;
  }
  toString(): string {
    if (this.runs.size_ === 0) {
      return '';
    }
    let buffer = new StringBuilder(128);
    buffer.append($J.fstr(this.width_));
    buffer.append(String.fromCharCode(120 /* 'x' */));
    buffer.append($J.fstr(this.height_));
    buffer.append(String.fromCharCode(10 /* \u000a */));
    for (let i = 0, n = this.runs.size_; i < n; i++) {
      buffer.append(this.runs.get(i).toString());
      buffer.append(String.fromCharCode(10 /* \u000a */));
    }
    buffer.setLength((buffer.length() - 1) | 0);
    return buffer.toString();
  }
  static $clinit() {
    GlyphLayout.glyphRunPool = new DefaultPool()._DefaultPool$PoolSupplier(() => new GlyphLayout$GlyphRun()._GlyphLayout$GlyphRun());
    GlyphLayout.colorStack = new IntArray()._IntArray$int(4);
  }
}

/**
 * Stores glyphs and positions for a line of text.
 * @author Nathan Sweet
 */
export class GlyphLayout$GlyphRun extends JObject {
  glyphs: Array_<BitmapFont$Glyph> = null;
  /**
   * Contains glyphs.size+1 entries:<br>
   * The first entry is the X offset relative to the drawing position.<br>
   * Subsequent entries are the X advance relative to previous glyph position.<br>
   * The last entry is the width of the last glyph.
   */
  xAdvances: FloatArray = null;
  x: number = 0;
  y: number = 0;
  width_: number = 0;
  _GlyphLayout$GlyphRun(): this {
    this.glyphs = new Array_()._Array$();
    this.xAdvances = new FloatArray()._FloatArray$();
    return this;
  }
  appendRun(run: GlyphLayout$GlyphRun): void {
    this.glyphs.addAll$Array(run.glyphs);
    if (this.xAdvances.notEmpty()) {
      this.xAdvances.size_--;
    }
    this.xAdvances.addAll$FloatArray(run.xAdvances);
  }
  reset(): void {
    this.glyphs.clear();
    this.xAdvances.clear();
  }
  toString(): string {
    let buffer = new StringBuilder((this.glyphs.size_ + 32) | 0);
    let glyphs = this.glyphs;
    for (let i = 0, n = glyphs.size_; i < n; i++) {
      let g = glyphs.get(i);
      buffer.append(String.fromCharCode((g.id_) & 0xffff));
    }
    buffer.append(', ');
    buffer.append($J.fstr(this.x));
    buffer.append(', ');
    buffer.append($J.fstr(this.y));
    buffer.append(', ');
    buffer.append($J.fstr(this.width_));
    return buffer.toString();
  }
}

$J.define(GlyphLayout, 'com.badlogic.gdx.graphics.g2d.GlyphLayout', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Pool$Poolable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence,int,int,com.badlogic.gdx.graphics.Color,float,int,boolean,java.lang.String': '_GlyphLayout$BitmapFont$CharSequence$int$int$Color$float$int$boolean$String', 'com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence,com.badlogic.gdx.graphics.Color,float,int,boolean': '_GlyphLayout$BitmapFont$CharSequence$Color$float$int$boolean', 'com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence': '_GlyphLayout$BitmapFont$CharSequence', '': '_GlyphLayout$' }, meths: { 'setText(com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence,int,int,com.badlogic.gdx.graphics.Color,float,int,boolean,java.lang.String)': 'setText$BitmapFont$CharSequence$int$int$Color$float$int$boolean$String', 'setText(com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence,com.badlogic.gdx.graphics.Color,float,int,boolean)': 'setText$BitmapFont$CharSequence$Color$float$int$boolean', 'setText(com.badlogic.gdx.graphics.g2d.BitmapFont,java.lang.CharSequence)': 'setText$BitmapFont$CharSequence' }, clinit: true, lazy: ['glyphRunPool', 'colorStack'] });
$J.define(GlyphLayout$GlyphRun, 'com.badlogic.gdx.graphics.g2d.GlyphLayout$GlyphRun', { kind: 'class', ifaces: ['com.badlogic.gdx.utils.Pool$Poolable'], sup: 'java.lang.Object', ctors: { '': '_GlyphLayout$GlyphRun' } });
$J.module(() => {
  Colors = $J.load('com.badlogic.gdx.graphics.Colors');
  Align = $J.load('com.badlogic.gdx.utils.Align');
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
  DefaultPool = $J.load('com.badlogic.gdx.utils.DefaultPool');
  FloatArray = $J.load('com.badlogic.gdx.utils.FloatArray');
  IntArray = $J.load('com.badlogic.gdx.utils.IntArray');
});
