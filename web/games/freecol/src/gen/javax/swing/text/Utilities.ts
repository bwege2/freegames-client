// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/Utilities.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, BreakIterator, Character, JObject } from '../../../../jre/index.ts';

let Graphics2D, TextAttribute, JComponent, SwingConstants, BadLocationException, CompositeView, ParagraphView$Row, Position$Bias, SegmentCache, StyleConstants, StyledDocument, SwingUtilities2;

/**
 * A collection of methods to deal with various text
 * related activities.
 *
 * @author  Timothy Prinzing
 */
export class Utilities extends JObject {
  /**
   * If <code>view</code>'s container is a <code>JComponent</code> it
   * is returned, after casting.
   */
  static getJComponent(view: View): JComponent {
    if (view != null) {
      let component = view.getContainer();
      if (component instanceof JComponent) {
        return component;
      }
    }
    return null;
  }
  static drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean(view: View, s: Segment, x: number, y: number, g: Graphics, e: TabExpander, startOffset: number, justificationData: number[], useFPAPI: boolean): number {
    let component = Utilities.getJComponent(view);
    let metrics = SwingUtilities2.getFontMetrics$JComponent$Graphics(component, g);
    let nextX = x;
    let txt = s.array;
    let txtOffset = s.offset;
    let flushLen = 0;
    let flushIndex = s.offset;
    let spaceAddon = 0;
    let spaceAddonLeftoverEnd = -1;
    let startJustifiableContent = 0;
    let endJustifiableContent = 0;
    if (justificationData != null) {
      let offset = (-startOffset + txtOffset) | 0;
      let parent = null;
      if (view != null && (parent = view.getParent()) != null) {
        offset = (offset + parent.getStartOffset()) | 0;
      }
      spaceAddon = justificationData[ParagraphView$Row.SPACE_ADDON];
      spaceAddonLeftoverEnd = (justificationData[ParagraphView$Row.SPACE_ADDON_LEFTOVER_END] + offset) | 0;
      startJustifiableContent = (justificationData[ParagraphView$Row.START_JUSTIFIABLE] + offset) | 0;
      endJustifiableContent = (justificationData[ParagraphView$Row.END_JUSTIFIABLE] + offset) | 0;
    }
    let n = (s.offset + s.count_) | 0;
    for (let i = txtOffset; i < n; i++) {
      if (txt[i] === 9 /* \u0009 */ || ((spaceAddon !== 0 || i <= spaceAddonLeftoverEnd) && (txt[i] === 32 /* ' ' */) && startJustifiableContent <= i && i <= endJustifiableContent)) {
        if (flushLen > 0) {
          nextX = SwingUtilities2.drawChars$JComponent$Graphics$charArr$int$int$float$float(component, g, txt, flushIndex, flushLen, x, y);
          flushLen = 0;
        }
        flushIndex = (i + 1) | 0;
        if (txt[i] === 9 /* \u0009 */) {
          if (e != null) {
            nextX = e.nextTabStop(nextX, (startOffset + i - txtOffset) | 0);
          } else {
            nextX = Math.fround(nextX + SwingUtilities2.getFontCharWidth(32 /* ' ' */, metrics, useFPAPI));
          }
        } else if (txt[i] === 32 /* ' ' */) {
          let spaceWidth = SwingUtilities2.getFontCharWidth(32 /* ' ' */, metrics, useFPAPI);
          nextX = Math.fround(nextX + Math.fround(spaceWidth + spaceAddon));
          if (i <= spaceAddonLeftoverEnd) {
            nextX++;
          }
        }
        x = nextX;
      } else if ((txt[i] === 10 /* \u000a */) || (txt[i] === 13 /* \u000d */)) {
        if (flushLen > 0) {
          nextX = SwingUtilities2.drawChars$JComponent$Graphics$charArr$int$int$float$float$boolean(component, g, txt, flushIndex, flushLen, x, y, useFPAPI);
          flushLen = 0;
        }
        flushIndex = (i + 1) | 0;
        x = nextX;
      } else {
        flushLen = (flushLen + 1) | 0;
      }
    }
    if (flushLen > 0) {
      nextX = SwingUtilities2.drawChars$JComponent$Graphics$charArr$int$int$float$float$boolean(component, g, txt, flushIndex, flushLen, x, y, useFPAPI);
    }
    return nextX;
  }
  /**
   * Determines the width of the given segment of text taking tabs
   * into consideration.  This is implemented in a 1.1 style coordinate
   * system where ints are used and 72dpi is assumed.
   *
   * @param s  the source of the text
   * @param metrics the font metrics to use for the calculation
   * @param x  the X origin &gt;= 0
   * @param e  how to expand the tabs.  If this value is null,
   *   tabs will be expanded as a space character.
   * @param startOffset starting offset of the text in the document &gt;= 0
   * @return  the width of the text
   *
   * @deprecated replaced by
   *     {@link #getTabbedTextWidth(Segment, FontMetrics, float, TabExpander, int)}
   */
  static getTabbedTextWidth$Segment$FontMetrics$int$TabExpander$int(s: Segment, metrics: FontMetrics, x: number, e: TabExpander, startOffset: number): number {
    return Utilities.getTabbedTextWidth$View$Segment$FontMetrics$int$TabExpander$int$intArr(null, s, metrics, x, e, startOffset, null);
  }
  /**
   * Determines the width of the given segment of text taking tabs
   * into consideration.
   *
   * @param s  the source of the text
   * @param metrics the font metrics to use for the calculation
   * @param x  the X origin {@code >= 0}
   * @param e  how to expand the tabs.  If this value is null,
   *   tabs will be expanded as a space character.
   * @param startOffset starting offset of the text in the document {@code >= 0}
   * @return  the width of the text
   *
   * @since 9
   */
  static getTabbedTextWidth$Segment$FontMetrics$float$TabExpander$int(s: Segment, metrics: FontMetrics, x: number, e: TabExpander, startOffset: number): number {
    return Utilities.getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr(null, s, metrics, x, e, startOffset, null);
  }
  static getTabbedTextWidth$View$Segment$FontMetrics$int$TabExpander$int$intArr(view: View, s: Segment, metrics: FontMetrics, x: number, e: TabExpander, startOffset: number, justificationData: number[]): number {
    return $J.d2i(Utilities.getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr$boolean(view, s, metrics, Math.fround(x), e, startOffset, justificationData, false));
  }
  static getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr(view: View, s: Segment, metrics: FontMetrics, x: number, e: TabExpander, startOffset: number, justificationData: number[]): number {
    return Utilities.getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr$boolean(view, s, metrics, x, e, startOffset, justificationData, true);
  }
  static getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr$boolean(view: View, s: Segment, metrics: FontMetrics, x: number, e: TabExpander, startOffset: number, justificationData: number[], useFPAPI: boolean): number {
    let nextX = x;
    let txt = s.array;
    let txtOffset = s.offset;
    let n = (s.offset + s.count_) | 0;
    let charCount = 0;
    let spaceAddon = 0;
    let spaceAddonLeftoverEnd = -1;
    let startJustifiableContent = 0;
    let endJustifiableContent = 0;
    if (justificationData != null) {
      let offset = (-startOffset + txtOffset) | 0;
      let parent = null;
      if (view != null && (parent = view.getParent()) != null) {
        offset = (offset + parent.getStartOffset()) | 0;
      }
      spaceAddon = justificationData[ParagraphView$Row.SPACE_ADDON];
      spaceAddonLeftoverEnd = (justificationData[ParagraphView$Row.SPACE_ADDON_LEFTOVER_END] + offset) | 0;
      startJustifiableContent = (justificationData[ParagraphView$Row.START_JUSTIFIABLE] + offset) | 0;
      endJustifiableContent = (justificationData[ParagraphView$Row.END_JUSTIFIABLE] + offset) | 0;
    }
    for (let i = txtOffset; i < n; i++) {
      if (txt[i] === 9 /* \u0009 */ || ((spaceAddon !== 0 || i <= spaceAddonLeftoverEnd) && (txt[i] === 32 /* ' ' */) && startJustifiableContent <= i && i <= endJustifiableContent)) {
        nextX = Math.fround(nextX + metrics.charsWidth(txt, (i - charCount) | 0, charCount));
        charCount = 0;
        if (txt[i] === 9 /* \u0009 */) {
          if (e != null) {
            nextX = e.nextTabStop(nextX, (startOffset + i - txtOffset) | 0);
          } else {
            nextX = Math.fround(nextX + SwingUtilities2.getFontCharWidth(32 /* ' ' */, metrics, useFPAPI));
          }
        } else if (txt[i] === 32 /* ' ' */) {
          let spaceWidth = SwingUtilities2.getFontCharWidth(32 /* ' ' */, metrics, useFPAPI);
          nextX = Math.fround(nextX + Math.fround(spaceWidth + spaceAddon));
          if (i <= spaceAddonLeftoverEnd) {
            nextX++;
          }
        }
      } else if (txt[i] === 10 /* \u000a */) {
        nextX = Math.fround(nextX + SwingUtilities2.getFontCharsWidth(txt, (i - charCount) | 0, charCount, metrics, useFPAPI));
        charCount = 0;
      } else {
        charCount++;
      }
    }
    nextX = Math.fround(nextX + SwingUtilities2.getFontCharsWidth(txt, (n - charCount) | 0, charCount, metrics, useFPAPI));
    return Math.fround(nextX - x);
  }
  static getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$intArr(view: View, s: Segment, metrics: FontMetrics, x0: number, x: number, e: TabExpander, startOffset: number, justificationData: number[]): number {
    return Utilities.getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$boolean$intArr$boolean(view, s, metrics, x0, x, e, startOffset, true, justificationData, true);
  }
  /**
   * Determines the relative offset into the given text that
   * best represents the given span in the view coordinate
   * system.
   *
   * @param s  the source of the text
   * @param metrics the font metrics to use for the calculation
   * @param x0 the starting view location representing the start
   *   of the given text {@code >= 0}.
   * @param x  the target view location to translate to an
   *   offset into the text {@code >= 0}.
   * @param e  how to expand the tabs.  If this value is null,
   *   tabs will be expanded as a space character.
   * @param startOffset starting offset of the text in the document {@code >= 0}
   * @param round whether or not to round
   * @return  the offset into the text {@code >= 0}
   *
   * @since 9
   */
  static getTabbedTextOffset$Segment$FontMetrics$float$float$TabExpander$int$boolean(s: Segment, metrics: FontMetrics, x0: number, x: number, e: TabExpander, startOffset: number, round: boolean): number {
    return Utilities.getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$boolean$intArr$boolean(null, s, metrics, x0, x, e, startOffset, round, null, true);
  }
  static getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$boolean$intArr$boolean(view: View, s: Segment, metrics: FontMetrics, x0: number, x: number, e: TabExpander, startOffset: number, round: boolean, justificationData: number[], useFPAPI: boolean): number {
    if (x0 >= x) {
      return 0;
    }
    let nextX = x0;
    let txt = s.array;
    let txtOffset = s.offset;
    let txtCount = s.count_;
    let spaceAddon = 0;
    let spaceAddonLeftoverEnd = -1;
    let startJustifiableContent = 0;
    let endJustifiableContent = 0;
    if (justificationData != null) {
      let offset = (-startOffset + txtOffset) | 0;
      let parent = null;
      if (view != null && (parent = view.getParent()) != null) {
        offset = (offset + parent.getStartOffset()) | 0;
      }
      spaceAddon = justificationData[ParagraphView$Row.SPACE_ADDON];
      spaceAddonLeftoverEnd = (justificationData[ParagraphView$Row.SPACE_ADDON_LEFTOVER_END] + offset) | 0;
      startJustifiableContent = (justificationData[ParagraphView$Row.START_JUSTIFIABLE] + offset) | 0;
      endJustifiableContent = (justificationData[ParagraphView$Row.END_JUSTIFIABLE] + offset) | 0;
    }
    let n = (s.offset + s.count_) | 0;
    for (let i = s.offset; i < n; i++) {
      if (txt[i] === 9 /* \u0009 */ || ((spaceAddon !== 0 || i <= spaceAddonLeftoverEnd) && (txt[i] === 32 /* ' ' */) && startJustifiableContent <= i && i <= endJustifiableContent)) {
        if (txt[i] === 9 /* \u0009 */) {
          if (e != null) {
            nextX = e.nextTabStop(nextX, (startOffset + i - txtOffset) | 0);
          } else {
            nextX = Math.fround(nextX + SwingUtilities2.getFontCharWidth(32 /* ' ' */, metrics, useFPAPI));
          }
        } else if (txt[i] === 32 /* ' ' */) {
          nextX = Math.fround(nextX + SwingUtilities2.getFontCharWidth(32 /* ' ' */, metrics, useFPAPI));
          nextX = Math.fround(nextX + spaceAddon);
          if (i <= spaceAddonLeftoverEnd) {
            nextX++;
          }
        }
      } else {
        nextX = Math.fround(nextX + SwingUtilities2.getFontCharWidth(txt[i], metrics, useFPAPI));
      }
      if (x < nextX) {
        let offset: number;
        if (round) {
          offset = (i + 1 - txtOffset) | 0;
          let width = SwingUtilities2.getFontCharsWidth(txt, txtOffset, offset, metrics, useFPAPI);
          let span = Math.fround(x - x0);
          if (span < width) {
            while (offset > 0) {
              let charsWidth = SwingUtilities2.getFontCharsWidth(txt, txtOffset, (offset - 1) | 0, metrics, useFPAPI);
              let nextWidth = offset > 1 ? charsWidth : 0;
              if (span >= nextWidth) {
                if (Math.fround(span - nextWidth) < Math.fround(width - span)) {
                  offset--;
                }
                break;
              }
              width = nextWidth;
              offset--;
            }
          }
        } else {
          offset = (i - txtOffset) | 0;
          while (offset > 0 && SwingUtilities2.getFontCharsWidth(txt, txtOffset, offset, metrics, useFPAPI) > (Math.fround(x - x0))) {
            offset--;
          }
        }
        return offset;
      }
    }
    return txtCount;
  }
  static getBreakLocation$Segment$FontMetrics$float$float$TabExpander$int$boolean(s: Segment, metrics: FontMetrics, x0: number, x: number, e: TabExpander, startOffset: number, useFPIAPI: boolean): number {
    let txt = s.array;
    let txtOffset = s.offset;
    let txtCount = s.count_;
    let index = Utilities.getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$boolean$intArr$boolean(null, s, metrics, x0, x, e, startOffset, false, null, useFPIAPI);
    if (index >= ((txtCount - 1) | 0)) {
      return txtCount;
    }
    for (let i = (txtOffset + index) | 0; i >= txtOffset; i--) {
      let ch = txt[i];
      if (ch < 256) {
        if (Character.isWhitespace(ch)) {
          index = (i - txtOffset + 1) | 0;
          break;
        }
      } else {
        let bit = BreakIterator.getLineInstance();
        bit.setText(s);
        let breakPos = bit.preceding((i + 1) | 0);
        if (breakPos > txtOffset) {
          index = (breakPos - txtOffset) | 0;
        }
        break;
      }
    }
    return index;
  }
  /**
   * Determine where to break the given text to fit
   * within the given span. This tries to find a word boundary.
   * @param s  the source of the text
   * @param metrics the font metrics to use for the calculation
   * @param x0 the starting view location representing the start
   *        of the given text.
   * @param x  the target view location to translate to an
   *        offset into the text.
   * @param e  how to expand the tabs.  If this value is null,
   *        tabs will be expanded as a space character.
   * @param startOffset starting offset in the document of the text
   * @return  the offset into the given text
   *
   * @since 9
   */
  static getBreakLocation$Segment$FontMetrics$float$float$TabExpander$int(s: Segment, metrics: FontMetrics, x0: number, x: number, e: TabExpander, startOffset: number): number {
    return Utilities.getBreakLocation$Segment$FontMetrics$float$float$TabExpander$int$boolean(s, metrics, x0, x, e, startOffset, true);
  }
  /**
   * Determines the starting row model position of the row that contains
   * the specified model position.  The component given must have a
   * size to compute the result.  If the component doesn't have a size
   * a value of -1 will be returned.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @return the position &gt;= 0 if the request can be computed, otherwise
   *  a value of -1 will be returned.
   * @throws BadLocationException if the offset is out of range
   */
  static getRowStart(c: JTextComponent, offs: number): number {
    let r = c.modelToView(offs);
    if (r == null) {
      return -1;
    }
    let lastOffs = offs;
    let y = r.y_;
    while ((r != null) && (y === r.y_)) {
      if (r.height_ !== 0) {
        offs = lastOffs;
      }
      lastOffs = (lastOffs - 1) | 0;
      r = (lastOffs >= 0) ? c.modelToView(lastOffs) : null;
    }
    return offs;
  }
  /**
   * Determines the ending row model position of the row that contains
   * the specified model position.  The component given must have a
   * size to compute the result.  If the component doesn't have a size
   * a value of -1 will be returned.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @return the position &gt;= 0 if the request can be computed, otherwise
   *  a value of -1 will be returned.
   * @throws BadLocationException if the offset is out of range
   */
  static getRowEnd(c: JTextComponent, offs: number): number {
    let r = c.modelToView2D(offs);
    if (r == null) {
      return -1;
    }
    let n = c.getDocument().getLength();
    let lastOffs = offs;
    let y = r.getY();
    while ((r != null) && (y === r.getY())) {
      if (r.getHeight() !== 0) {
        offs = lastOffs;
      }
      lastOffs = (lastOffs + 1) | 0;
      r = (lastOffs <= n) ? c.modelToView(lastOffs) : null;
    }
    return offs;
  }
  /**
   * Determines the position in the model that is closest to the given
   * view location in the row above.  The component given must have a
   * size to compute the result.  If the component doesn't have a size
   * a value of -1 will be returned.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @param x the X coordinate &gt;= 0
   * @return the position &gt;= 0 if the request can be computed, otherwise
   *  a value of -1 will be returned.
   * @throws BadLocationException if the offset is out of range
   *
   * @deprecated replaced by
   *     {@link #getPositionAbove(JTextComponent, int, float)}
   */
  static getPositionAbove$JTextComponent$int$int(c: JTextComponent, offs: number, x: number): number {
    return Utilities.getPositionAbove$JTextComponent$int$float$boolean(c, offs, Math.fround(x), false);
  }
  static getPositionAbove$JTextComponent$int$float$boolean(c: JTextComponent, offs: number, x: number, useFPAPI: boolean): number {
    let lastOffs = (Utilities.getRowStart(c, offs) - 1) | 0;
    if (lastOffs < 0) {
      return -1;
    }
    let bestSpan = 2147483647;
    let y = 0;
    let r = null;
    if (lastOffs >= 0) {
      r = useFPAPI ? c.modelToView2D(lastOffs) : c.modelToView(lastOffs);
      y = r.getY();
    }
    while ((r != null) && (y === r.getY())) {
      let span = Math.abs(r.getX() - x);
      if (span < bestSpan) {
        offs = lastOffs;
        bestSpan = span;
      }
      lastOffs = (lastOffs - 1) | 0;
      if (lastOffs >= 0) {
        r = useFPAPI ? c.modelToView2D(lastOffs) : c.modelToView(lastOffs);
      } else {
        r = null;
      }
    }
    return offs;
  }
  /**
   * Determines the position in the model that is closest to the given
   * view location in the row below.  The component given must have a
   * size to compute the result.  If the component doesn't have a size
   * a value of -1 will be returned.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @param x the X coordinate &gt;= 0
   * @return the position &gt;= 0 if the request can be computed, otherwise
   *  a value of -1 will be returned.
   * @throws BadLocationException if the offset is out of range
   *
   * @deprecated replaced by
   *     {@link #getPositionBelow(JTextComponent, int, float)}
   */
  static getPositionBelow$JTextComponent$int$int(c: JTextComponent, offs: number, x: number): number {
    return Utilities.getPositionBelow$JTextComponent$int$float$boolean(c, offs, Math.fround(x), false);
  }
  static getPositionBelow$JTextComponent$int$float$boolean(c: JTextComponent, offs: number, x: number, useFPAPI: boolean): number {
    let lastOffs = (Utilities.getRowEnd(c, offs) + 1) | 0;
    if (lastOffs <= 0) {
      return -1;
    }
    let bestSpan = 2147483647;
    let n = c.getDocument().getLength();
    let y = 0;
    let r = null;
    if (lastOffs <= n) {
      r = useFPAPI ? c.modelToView2D(lastOffs) : c.modelToView(lastOffs);
      y = r.getY();
    }
    while ((r != null) && (y === r.getY())) {
      let span = Math.abs(x - r.getX());
      if (span < bestSpan) {
        offs = lastOffs;
        bestSpan = span;
      }
      lastOffs = (lastOffs + 1) | 0;
      if (lastOffs <= n) {
        r = useFPAPI ? c.modelToView2D(lastOffs) : c.modelToView(lastOffs);
      } else {
        r = null;
      }
    }
    return offs;
  }
  /**
   * Determines the start of a word for the given model location.
   * Uses BreakIterator.getWordInstance() to actually get the words.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @return the location in the model of the word start &gt;= 0
   * @throws BadLocationException if the offset is out of range
   */
  static getWordStart(c: JTextComponent, offs: number): number {
    let doc = c.getDocument();
    let line = Utilities.getParagraphElement(c, offs);
    if (line == null) {
      throw new BadLocationException()._BadLocationException('No word at ' + offs, offs);
    }
    let lineStart = line.getStartOffset();
    let lineEnd = Math.min(line.getEndOffset(), doc.getLength());
    let seg = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(lineStart, (lineEnd - lineStart) | 0, seg);
    if (seg.count_ > 0) {
      let words = BreakIterator.getWordInstance(c.getLocale$());
      words.setText(seg);
      let wordPosition = (seg.offset + offs - lineStart) | 0;
      if (wordPosition >= words.last()) {
        wordPosition = (words.last() - 1) | 0;
      }
      words.following(wordPosition);
      offs = (lineStart + words.previous() - seg.offset) | 0;
    }
    SegmentCache.releaseSharedSegment(seg);
    return offs;
  }
  /**
   * Determines the end of a word for the given location.
   * Uses BreakIterator.getWordInstance() to actually get the words.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @return the location in the model of the word end &gt;= 0
   * @throws BadLocationException if the offset is out of range
   */
  static getWordEnd(c: JTextComponent, offs: number): number {
    let doc = c.getDocument();
    let line = Utilities.getParagraphElement(c, offs);
    if (line == null) {
      throw new BadLocationException()._BadLocationException('No word at ' + offs, offs);
    }
    let lineStart = line.getStartOffset();
    let lineEnd = Math.min(line.getEndOffset(), doc.getLength());
    let seg = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(lineStart, (lineEnd - lineStart) | 0, seg);
    if (seg.count_ > 0) {
      let words = BreakIterator.getWordInstance(c.getLocale$());
      words.setText(seg);
      let wordPosition = (offs - lineStart + seg.offset) | 0;
      if (wordPosition >= words.last()) {
        wordPosition = (words.last() - 1) | 0;
      }
      offs = (lineStart + words.following(wordPosition) - seg.offset) | 0;
    }
    SegmentCache.releaseSharedSegment(seg);
    return offs;
  }
  /**
   * Determines the start of the next word for the given location.
   * Uses BreakIterator.getWordInstance() to actually get the words.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @return the location in the model of the word start &gt;= 0
   * @throws BadLocationException if the offset is out of range
   */
  static getNextWord(c: JTextComponent, offs: number): number {
    let nextWord: number;
    let line = Utilities.getParagraphElement(c, offs);
    for (nextWord = Utilities.getNextWordInParagraph(c, line, offs, false); nextWord === -1; nextWord = Utilities.getNextWordInParagraph(c, line, offs, true)) {
      offs = line.getEndOffset();
      line = Utilities.getParagraphElement(c, offs);
    }
    return nextWord;
  }
  /**
   * Finds the next word in the given elements text.  The first
   * parameter allows searching multiple paragraphs where even
   * the first offset is desired.
   * Returns the offset of the next word, or BreakIterator.DONE
   * if there are no more words in the element.
   */
  static getNextWordInParagraph(c: JTextComponent, line: Element, offs: number, first: boolean): number {
    if (line == null) {
      throw new BadLocationException()._BadLocationException('No more words', offs);
    }
    let doc = line.getDocument();
    let lineStart = line.getStartOffset();
    let lineEnd = Math.min(line.getEndOffset(), doc.getLength());
    if ((offs >= lineEnd) || (offs < lineStart)) {
      throw new BadLocationException()._BadLocationException('No more words', offs);
    }
    let seg = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(lineStart, (lineEnd - lineStart) | 0, seg);
    let words = BreakIterator.getWordInstance(c.getLocale$());
    words.setText(seg);
    if ((first && (words.first() === ((seg.offset + offs - lineStart) | 0))) && (!Character.isWhitespace(seg.array[words.first()]))) {
      return offs;
    }
    let wordPosition = words.following((seg.offset + offs - lineStart) | 0);
    if ((wordPosition === -1) || (wordPosition >= ((seg.offset + seg.count_) | 0))) {
      return -1;
    }
    let ch = seg.array[wordPosition];
    if (!Character.isWhitespace(ch)) {
      return (lineStart + wordPosition - seg.offset) | 0;
    }
    wordPosition = words.next();
    if (wordPosition !== -1) {
      offs = (lineStart + wordPosition - seg.offset) | 0;
      if (offs !== lineEnd) {
        return offs;
      }
    }
    SegmentCache.releaseSharedSegment(seg);
    return -1;
  }
  /**
   * Determine the start of the prev word for the given location.
   * Uses BreakIterator.getWordInstance() to actually get the words.
   *
   * @param c the editor
   * @param offs the offset in the document &gt;= 0
   * @return the location in the model of the word start &gt;= 0
   * @throws BadLocationException if the offset is out of range
   */
  static getPreviousWord(c: JTextComponent, offs: number): number {
    let prevWord: number;
    let line = Utilities.getParagraphElement(c, offs);
    for (prevWord = Utilities.getPrevWordInParagraph(c, line, offs); prevWord === -1; prevWord = Utilities.getPrevWordInParagraph(c, line, offs)) {
      offs = (line.getStartOffset() - 1) | 0;
      line = Utilities.getParagraphElement(c, offs);
    }
    return prevWord;
  }
  /**
   * Finds the previous word in the given elements text.  The first
   * parameter allows searching multiple paragraphs where even
   * the first offset is desired.
   * Returns the offset of the next word, or BreakIterator.DONE
   * if there are no more words in the element.
   */
  static getPrevWordInParagraph(c: JTextComponent, line: Element, offs: number): number {
    if (line == null) {
      throw new BadLocationException()._BadLocationException('No more words', offs);
    }
    let doc = line.getDocument();
    let lineStart = line.getStartOffset();
    let lineEnd = line.getEndOffset();
    if ((offs > lineEnd) || (offs < lineStart)) {
      throw new BadLocationException()._BadLocationException('No more words', offs);
    }
    let seg = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(lineStart, (lineEnd - lineStart) | 0, seg);
    let words = BreakIterator.getWordInstance(c.getLocale$());
    words.setText(seg);
    if (words.following((seg.offset + offs - lineStart) | 0) === -1) {
      words.last();
    }
    let wordPosition = words.previous();
    if (wordPosition === ((seg.offset + offs - lineStart) | 0)) {
      wordPosition = words.previous();
    }
    if (wordPosition === -1) {
      return -1;
    }
    let ch = seg.array[wordPosition];
    if (!Character.isWhitespace(ch)) {
      return (lineStart + wordPosition - seg.offset) | 0;
    }
    wordPosition = words.previous();
    if (wordPosition !== -1) {
      return (lineStart + wordPosition - seg.offset) | 0;
    }
    SegmentCache.releaseSharedSegment(seg);
    return -1;
  }
  /**
   * Determines the element to use for a paragraph/line.
   *
   * @param c the editor
   * @param offs the starting offset in the document &gt;= 0
   * @return the element
   */
  static getParagraphElement(c: JTextComponent, offs: number): Element {
    let doc = c.getDocument();
    if ($J.isa(doc, StyledDocument)) {
      return (doc).getParagraphElement(offs);
    }
    let map = doc.getDefaultRootElement();
    let index = map.getElementIndex(offs);
    let paragraph = map.getElement(index);
    if ((offs >= paragraph.getStartOffset()) && (offs < paragraph.getEndOffset())) {
      return paragraph;
    }
    return null;
  }
  static isComposedTextElement$Document$int(doc: Document, offset: number): boolean {
    let elem = doc.getDefaultRootElement();
    while (!elem.isLeaf()) {
      elem = elem.getElement(elem.getElementIndex(offset));
    }
    return Utilities.isComposedTextElement$Element(elem);
  }
  static isComposedTextElement$Element(elem: Element): boolean {
    let as$ = elem.getAttributes();
    return Utilities.isComposedTextAttributeDefined(as$);
  }
  static isComposedTextAttributeDefined(as$: AttributeSet): boolean {
    return ((as$ != null) && (as$.isDefined(StyleConstants.ComposedTextAttribute)));
  }
  static drawComposedText$View$AttributeSet$Graphics$float$float$int$int(view: View, attr: AttributeSet, g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return Utilities.drawComposedText$View$AttributeSet$Graphics$float$float$int$int$boolean(view, attr, g, x, y, p0, p1, true);
  }
  static drawComposedText$View$AttributeSet$Graphics$float$float$int$int$boolean(view: View, attr: AttributeSet, g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    let g2d = g;
    let as$ = attr.getAttribute(StyleConstants.ComposedTextAttribute);
    as$.addAttribute(TextAttribute.FONT, g.getFont());
    if (p0 >= p1) {
      return x;
    }
    let aci = as$.getIterator(null, p0, p1);
    return Math.fround(x + SwingUtilities2.drawString$JComponent$Graphics$AttributedCharacterIterator$float$float(Utilities.getJComponent(view), g2d, aci, x, y));
  }
  /**
   * Paints the composed text in a GlyphView
   */
  static paintComposedText(g: Graphics, alloc: Rectangle, v: GlyphView): void {
    if (g instanceof Graphics2D) {
      let g2d = g;
      let p0 = v.getStartOffset();
      let p1 = v.getEndOffset();
      let attrSet = v.getElement().getAttributes();
      let as$ = attrSet.getAttribute(StyleConstants.ComposedTextAttribute);
      let start = v.getElement().getStartOffset();
      let y = (alloc.y_ + alloc.height_ - $J.d2i(v.getGlyphPainter().getDescent(v))) | 0;
      let x = alloc.x_;
      as$.addAttribute(TextAttribute.FONT, v.getFont());
      as$.addAttribute(TextAttribute.FOREGROUND, v.getForeground());
      if (StyleConstants.isBold(v.getAttributes())) {
        as$.addAttribute(TextAttribute.WEIGHT, TextAttribute.WEIGHT_BOLD);
      }
      if (StyleConstants.isItalic(v.getAttributes())) {
        as$.addAttribute(TextAttribute.POSTURE, TextAttribute.POSTURE_OBLIQUE);
      }
      if (v.isUnderline()) {
        as$.addAttribute(TextAttribute.UNDERLINE, TextAttribute.UNDERLINE_ON);
      }
      if (v.isStrikeThrough()) {
        as$.addAttribute(TextAttribute.STRIKETHROUGH, TextAttribute.STRIKETHROUGH_ON);
      }
      if (v.isSuperscript()) {
        as$.addAttribute(TextAttribute.SUPERSCRIPT, TextAttribute.SUPERSCRIPT_SUPER);
      }
      if (v.isSubscript()) {
        as$.addAttribute(TextAttribute.SUPERSCRIPT, TextAttribute.SUPERSCRIPT_SUB);
      }
      let aci = as$.getIterator(null, (p0 - start) | 0, (p1 - start) | 0);
      SwingUtilities2.drawString$JComponent$Graphics$AttributedCharacterIterator$int$int(Utilities.getJComponent(v), g2d, aci, x, y);
    }
  }
  static isLeftToRight(c: Component): boolean {
    return c.getComponentOrientation().isLeftToRight();
  }
  /**
   * Provides a way to determine the next visually represented model
   * location that one might place a caret.  Some views may not be visible,
   * they might not be in the same order found in the model, or they just
   * might not allow access to some of the locations in the model.
   * <p>
   * This implementation assumes the views are laid out in a logical
   * manner. That is, that the view at index x + 1 is visually after
   * the View at index x, and that the View at index x - 1 is visually
   * before the View at x. There is support for reversing this behavior
   * only if the passed in <code>View</code> is an instance of
   * <code>CompositeView</code>. The <code>CompositeView</code>
   * must then override the <code>flipEastAndWestAtEnds</code> method.
   *
   * @param v View to query
   * @param pos the position to convert &gt;= 0
   * @param alloc the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard;
   *  this may be one of the following:
   *  <ul>
   *  <li><code>SwingConstants.WEST</code>
   *  <li><code>SwingConstants.EAST</code>
   *  <li><code>SwingConstants.NORTH</code>
   *  <li><code>SwingConstants.SOUTH</code>
   *  </ul>
   * @param biasRet an array contain the bias that was checked
   * @return the location within the model that best represents the next
   *  location visual position
   * @throws BadLocationException
   * @throws IllegalArgumentException if <code>direction</code> is invalid
   */
  static getNextVisualPositionFrom(v: View, pos: number, b: Position$Bias, alloc: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (v.getViewCount() === 0) {
      return pos;
    }
    let top = (direction === SwingConstants.NORTH || direction === SwingConstants.WEST);
    let retValue: number;
    if (pos === -1) {
      let childIndex = (top) ? (v.getViewCount() - 1) | 0 : 0;
      let child = v.getView(childIndex);
      let childBounds = v.getChildAllocation(childIndex, alloc);
      retValue = child.getNextVisualPositionFrom(pos, b, childBounds, direction, biasRet);
      if (retValue === -1 && !top && v.getViewCount() > 1) {
        child = v.getView(1);
        childBounds = v.getChildAllocation(1, alloc);
        retValue = child.getNextVisualPositionFrom(-1, biasRet[0], childBounds, direction, biasRet);
      }
    } else {
      let increment = (top) ? -1 : 1;
      let childIndex: number;
      if (b === Position$Bias.Backward && pos > 0) {
        childIndex = v.getViewIndex$int$Bias((pos - 1) | 0, Position$Bias.Forward);
      } else {
        childIndex = v.getViewIndex$int$Bias(pos, Position$Bias.Forward);
      }
      let child = v.getView(childIndex);
      let childBounds = v.getChildAllocation(childIndex, alloc);
      retValue = child.getNextVisualPositionFrom(pos, b, childBounds, direction, biasRet);
      if ((direction === SwingConstants.EAST || direction === SwingConstants.WEST) && (v instanceof CompositeView) && (v).flipEastAndWestAtEnds(pos, b)) {
        increment = Math.imul(increment, -1);
      }
      childIndex = (childIndex + increment) | 0;
      if (retValue === -1 && childIndex >= 0 && childIndex < v.getViewCount()) {
        child = v.getView(childIndex);
        childBounds = v.getChildAllocation(childIndex, alloc);
        retValue = child.getNextVisualPositionFrom(-1, b, childBounds, direction, biasRet);
        if (retValue === pos && biasRet[0] !== b) {
          return Utilities.getNextVisualPositionFrom(v, pos, biasRet[0], alloc, direction, biasRet);
        }
      } else if (retValue !== -1 && biasRet[0] !== b && ((increment === 1 && child.getEndOffset() === retValue) || (increment === -1 && child.getStartOffset() === retValue)) && childIndex >= 0 && childIndex < v.getViewCount()) {
        child = v.getView(childIndex);
        childBounds = v.getChildAllocation(childIndex, alloc);
        let originalBias = biasRet[0];
        let nextPos = child.getNextVisualPositionFrom(-1, b, childBounds, direction, biasRet);
        if (biasRet[0] === b) {
          retValue = nextPos;
        } else {
          biasRet[0] = originalBias;
        }
      }
    }
    return retValue;
  }
}

$J.define(Utilities, 'javax.swing.text.Utilities', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Utilities' }, meths: { 'drawComposedText(javax.swing.text.View,javax.swing.text.AttributeSet,java.awt.Graphics,float,float,int,int,boolean)': 'drawComposedText$View$AttributeSet$Graphics$float$float$int$int$boolean', 'drawComposedText(javax.swing.text.View,javax.swing.text.AttributeSet,java.awt.Graphics,float,float,int,int)': 'drawComposedText$View$AttributeSet$Graphics$float$float$int$int', 'drawComposedText(javax.swing.text.View,javax.swing.text.AttributeSet,java.awt.Graphics,int,int,int,int)': 'drawComposedText$View$AttributeSet$Graphics$int$int$int$int', 'isComposedTextElement(javax.swing.text.Element)': 'isComposedTextElement$Element', 'isComposedTextElement(javax.swing.text.Document,int)': 'isComposedTextElement$Document$int', 'getPositionBelow(javax.swing.text.JTextComponent,int,float)': 'getPositionBelow$JTextComponent$int$float', 'getPositionBelow(javax.swing.text.JTextComponent,int,float,boolean)': 'getPositionBelow$JTextComponent$int$float$boolean', 'getPositionBelow(javax.swing.text.JTextComponent,int,int)': 'getPositionBelow$JTextComponent$int$int', 'getPositionAbove(javax.swing.text.JTextComponent,int,float)': 'getPositionAbove$JTextComponent$int$float', 'getPositionAbove(javax.swing.text.JTextComponent,int,float,boolean)': 'getPositionAbove$JTextComponent$int$float$boolean', 'getPositionAbove(javax.swing.text.JTextComponent,int,int)': 'getPositionAbove$JTextComponent$int$int', 'getBreakLocation(javax.swing.text.Segment,java.awt.FontMetrics,float,float,javax.swing.text.TabExpander,int)': 'getBreakLocation$Segment$FontMetrics$float$float$TabExpander$int', 'getBreakLocation(javax.swing.text.Segment,java.awt.FontMetrics,float,float,javax.swing.text.TabExpander,int,boolean)': 'getBreakLocation$Segment$FontMetrics$float$float$TabExpander$int$boolean', 'getBreakLocation(javax.swing.text.Segment,java.awt.FontMetrics,int,int,javax.swing.text.TabExpander,int)': 'getBreakLocation$Segment$FontMetrics$int$int$TabExpander$int', 'getTabbedTextOffset(javax.swing.text.View,javax.swing.text.Segment,java.awt.FontMetrics,float,float,javax.swing.text.TabExpander,int,boolean,int[],boolean)': 'getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$boolean$intArr$boolean', 'getTabbedTextOffset(javax.swing.text.Segment,java.awt.FontMetrics,float,float,javax.swing.text.TabExpander,int,boolean)': 'getTabbedTextOffset$Segment$FontMetrics$float$float$TabExpander$int$boolean', 'getTabbedTextOffset(javax.swing.text.Segment,java.awt.FontMetrics,int,int,javax.swing.text.TabExpander,int,boolean)': 'getTabbedTextOffset$Segment$FontMetrics$int$int$TabExpander$int$boolean', 'getTabbedTextOffset(javax.swing.text.View,javax.swing.text.Segment,java.awt.FontMetrics,float,float,javax.swing.text.TabExpander,int,int[])': 'getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$intArr', 'getTabbedTextOffset(javax.swing.text.View,javax.swing.text.Segment,java.awt.FontMetrics,int,int,javax.swing.text.TabExpander,int,int[])': 'getTabbedTextOffset$View$Segment$FontMetrics$int$int$TabExpander$int$intArr', 'getTabbedTextOffset(javax.swing.text.Segment,java.awt.FontMetrics,int,int,javax.swing.text.TabExpander,int)': 'getTabbedTextOffset$Segment$FontMetrics$int$int$TabExpander$int', 'getTabbedTextWidth(javax.swing.text.View,javax.swing.text.Segment,java.awt.FontMetrics,float,javax.swing.text.TabExpander,int,int[],boolean)': 'getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr$boolean', 'getTabbedTextWidth(javax.swing.text.View,javax.swing.text.Segment,java.awt.FontMetrics,float,javax.swing.text.TabExpander,int,int[])': 'getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr', 'getTabbedTextWidth(javax.swing.text.View,javax.swing.text.Segment,java.awt.FontMetrics,int,javax.swing.text.TabExpander,int,int[])': 'getTabbedTextWidth$View$Segment$FontMetrics$int$TabExpander$int$intArr', 'getTabbedTextWidth(javax.swing.text.Segment,java.awt.FontMetrics,float,javax.swing.text.TabExpander,int)': 'getTabbedTextWidth$Segment$FontMetrics$float$TabExpander$int', 'getTabbedTextWidth(javax.swing.text.Segment,java.awt.FontMetrics,int,javax.swing.text.TabExpander,int)': 'getTabbedTextWidth$Segment$FontMetrics$int$TabExpander$int', 'drawTabbedText(javax.swing.text.View,javax.swing.text.Segment,float,float,java.awt.Graphics,javax.swing.text.TabExpander,int,int[],boolean)': 'drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean', 'drawTabbedText(javax.swing.text.View,javax.swing.text.Segment,int,int,java.awt.Graphics,javax.swing.text.TabExpander,int,int[])': 'drawTabbedText$View$Segment$int$int$Graphics$TabExpander$int$intArr', 'drawTabbedText(javax.swing.text.View,javax.swing.text.Segment,int,int,java.awt.Graphics,javax.swing.text.TabExpander,int)': 'drawTabbedText$View$Segment$int$int$Graphics$TabExpander$int', 'drawTabbedText(javax.swing.text.Segment,float,float,java.awt.Graphics2D,javax.swing.text.TabExpander,int)': 'drawTabbedText$Segment$float$float$Graphics2D$TabExpander$int', 'drawTabbedText(javax.swing.text.Segment,int,int,java.awt.Graphics,javax.swing.text.TabExpander,int)': 'drawTabbedText$Segment$int$int$Graphics$TabExpander$int' } });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  JComponent = $J.load('javax.swing.JComponent');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  CompositeView = $J.load('javax.swing.text.CompositeView');
  ParagraphView$Row = $J.load('javax.swing.text.ParagraphView$Row');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
