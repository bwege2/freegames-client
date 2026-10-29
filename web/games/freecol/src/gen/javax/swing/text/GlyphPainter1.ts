// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/GlyphPainter1.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Toolkit } from '../../../../jre/index.ts';
import { GlyphView$GlyphPainter } from './GlyphView.ts';

let Rectangle, BadLocationException, ParagraphView$Row, Position$Bias, SegmentCache, Utilities;

/**
 * A class to perform rendering of the glyphs.
 * This can be implemented to be stateless, or
 * to hold some information as a cache to
 * facilitate faster rendering and model/view
 * translation.  At a minimum, the GlyphPainter
 * allows a View implementation to perform its
 * duties independent of a particular version
 * of JVM and selection of capabilities (i.e.
 * shaping for i18n, etc).
 * <p>
 * This implementation is intended for operation
 * under the JDK1.1 API of the Java Platform.
 * Since the JDK is backward compatible with
 * JDK1.1 API, this class will also function on
 * Java 2.  The JDK introduces improved
 * API for rendering text however, so the GlyphPainter2
 * is recommended for the DK.
 *
 * @author  Timothy Prinzing
 * @see GlyphView
 */
export class GlyphPainter1 extends GlyphView$GlyphPainter {
  metrics: FontMetrics = null;
  _GlyphPainter1(): this {
    this._GlyphView$GlyphPainter();
    return this;
  }
  /**
   * Determine the span the glyphs given a start location
   * (for tab expansion).
   */
  getSpan(v: GlyphView, p0: number, p1: number, e: TabExpander, x: number): number {
    this.sync(v);
    let text = v.getText(p0, p1);
    let justificationData = this.getJustificationData(v);
    let width = Utilities.getTabbedTextWidth$View$Segment$FontMetrics$int$TabExpander$int$intArr(v, text, this.metrics, $J.d2i(x), e, p0, justificationData);
    SegmentCache.releaseSharedSegment(text);
    return Math.fround(width);
  }
  getHeight(v: GlyphView): number {
    this.sync(v);
    return Math.fround(this.metrics.getHeight());
  }
  /**
   * Fetches the ascent above the baseline for the glyphs
   * corresponding to the given range in the model.
   */
  getAscent(v: GlyphView): number {
    this.sync(v);
    return Math.fround(this.metrics.getAscent());
  }
  /**
   * Fetches the descent below the baseline for the glyphs
   * corresponding to the given range in the model.
   */
  getDescent(v: GlyphView): number {
    this.sync(v);
    return Math.fround(this.metrics.getDescent());
  }
  /**
   * Paints the glyphs representing the given range.
   */
  paint(v: GlyphView, g: Graphics, a: Shape, p0: number, p1: number): void {
    this.sync(v);
    let text: Segment;
    let expander = v.getTabExpander();
    let alloc = (a instanceof Rectangle) ? a : a.getBounds();
    let x = Math.fround(alloc.x_);
    let p = v.getStartOffset();
    let justificationData = this.getJustificationData(v);
    if (p !== p0) {
      text = v.getText(p, p0);
      let width = Utilities.getTabbedTextWidth$View$Segment$FontMetrics$float$TabExpander$int$intArr(v, text, this.metrics, x, expander, p, justificationData);
      x = Math.fround(x + width);
      SegmentCache.releaseSharedSegment(text);
    }
    let y = Math.fround((alloc.y_ + this.metrics.getHeight() - this.metrics.getDescent()) | 0);
    text = v.getText(p0, p1);
    g.setFont(this.metrics.getFont());
    Utilities.drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean(v, text, x, y, g, expander, p0, justificationData, true);
    SegmentCache.releaseSharedSegment(text);
  }
  modelToView(v: GlyphView, pos: number, bias: Position$Bias, a: Shape): Shape {
    this.sync(v);
    let alloc = (a instanceof Rectangle) ? a : a.getBounds();
    let p0 = v.getStartOffset();
    let p1 = v.getEndOffset();
    let expander = v.getTabExpander();
    let text: Segment;
    if (pos === p1) {
      return new Rectangle()._Rectangle$int$int$int$int((alloc.x_ + alloc.width_) | 0, alloc.y_, 0, this.metrics.getHeight());
    }
    if ((pos >= p0) && (pos <= p1)) {
      text = v.getText(p0, pos);
      let justificationData = this.getJustificationData(v);
      let width = Utilities.getTabbedTextWidth$View$Segment$FontMetrics$int$TabExpander$int$intArr(v, text, this.metrics, alloc.x_, expander, p0, justificationData);
      SegmentCache.releaseSharedSegment(text);
      return new Rectangle()._Rectangle$int$int$int$int((alloc.x_ + width) | 0, alloc.y_, 0, this.metrics.getHeight());
    }
    throw new BadLocationException()._BadLocationException('modelToView - can\'t convert', p1);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param v the view containing the view coordinates
   * @param x the X coordinate
   * @param y the Y coordinate
   * @param a the allocated region to render into
   * @param biasReturn always returns <code>Position.Bias.Forward</code>
   *   as the zero-th element of this array
   * @return the location within the model that best represents the
   *  given point in the view
   * @see View#viewToModel
   */
  viewToModel(v: GlyphView, x: number, y: number, a: Shape, biasReturn: Position$Bias[]): number {
    this.sync(v);
    let alloc = (a instanceof Rectangle) ? a : a.getBounds();
    let p0 = v.getStartOffset();
    let p1 = v.getEndOffset();
    let expander = v.getTabExpander();
    let text = v.getText(p0, p1);
    let justificationData = this.getJustificationData(v);
    let offs = Utilities.getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$intArr(v, text, this.metrics, Math.fround(alloc.x_), x, expander, p0, justificationData);
    SegmentCache.releaseSharedSegment(text);
    let retValue = (p0 + offs) | 0;
    if (retValue === p1) {
      retValue--;
    }
    biasReturn[0] = Position$Bias.Forward;
    return retValue;
  }
  /**
   * Determines the best location (in the model) to break
   * the given view.
   * This method attempts to break on a whitespace
   * location.  If a whitespace location can't be found, the
   * nearest character location is returned.
   *
   * @param v the view
   * @param p0 the location in the model where the
   *  fragment should start its representation >= 0
   * @param x the graphic location along the axis that the
   *  broken view would occupy >= 0; this may be useful for
   *  things like tab calculations
   * @param len specifies the distance into the view
   *  where a potential break is desired >= 0
   * @return the model location desired for a break
   * @see View#breakView
   */
  getBoundedPosition(v: GlyphView, p0: number, x: number, len: number): number {
    this.sync(v);
    let expander = v.getTabExpander();
    let s = v.getText(p0, v.getEndOffset());
    let justificationData = this.getJustificationData(v);
    let index = Utilities.getTabbedTextOffset$View$Segment$FontMetrics$float$float$TabExpander$int$boolean$intArr$boolean(v, s, this.metrics, x, (Math.fround(x + len)), expander, p0, false, justificationData, true);
    SegmentCache.releaseSharedSegment(s);
    let p1 = (p0 + index) | 0;
    return p1;
  }
  sync(v: GlyphView): void {
    let f = v.getFont();
    let fm = null;
    let c = v.getContainer();
    if (c != null) {
      fm = c.getFontMetrics(f);
    }
    if ((this.metrics == null) || (!f.equals(this.metrics.getFont())) || (!this.metrics.equals(fm))) {
      this.metrics = (c != null) ? fm : Toolkit.getDefaultToolkit().getFontMetrics(f);
    }
  }
  /**
   * @return justificationData from the ParagraphRow this GlyphView
   * is in or {@code null} if no justification is needed
   */
  getJustificationData(v: GlyphView): number[] {
    let parent = v.getParent();
    let ret = null;
    if (parent instanceof ParagraphView$Row) {
      let row = (parent);
      ret = row.justificationData;
    }
    return ret;
  }
}

$J.define(GlyphPainter1, 'javax.swing.text.GlyphPainter1', { kind: 'class', sup: 'javax.swing.text.GlyphView$GlyphPainter', ctors: { '': '_GlyphPainter1' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  ParagraphView$Row = $J.load('javax.swing.text.ParagraphView$Row');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  Utilities = $J.load('javax.swing.text.Utilities');
});
