// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/GlyphPainter2.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Character, IllegalArgumentException } from '../../../../jre/index.ts';
import { GlyphView$GlyphPainter } from './GlyphView.ts';

let Graphics2D, TextHitInfo, Rectangle2D, Rectangle2D$Float, SwingConstants, AbstractDocument, BadLocationException, Position$Bias, SegmentCache;

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
 * under the JDK.  It uses the
 * java.awt.font.TextLayout class to do i18n capable
 * rendering.
 *
 * @author  Timothy Prinzing
 * @see GlyphView
 */
export class GlyphPainter2 extends GlyphView$GlyphPainter {
  layout_: TextLayout = null;
  _GlyphPainter2(layout: TextLayout): this {
    this._GlyphView$GlyphPainter();
    this.layout_ = layout;
    return this;
  }
  /**
   * Create a painter to use for the given GlyphView.
   */
  getPainter(v: GlyphView, p0: number, p1: number): GlyphView$GlyphPainter {
    return null;
  }
  /**
   * Determine the span the glyphs given a start location
   * (for tab expansion).  This implementation assumes it
   * has no tabs (i.e. TextLayout doesn't deal with tab
   * expansion).
   */
  getSpan(v: GlyphView, p0: number, p1: number, e: TabExpander, x: number): number {
    if ((p0 === v.getStartOffset()) && (p1 === v.getEndOffset())) {
      return this.layout_.getAdvance();
    }
    let p = v.getStartOffset();
    let index0 = (p0 - p) | 0;
    let index1 = (p1 - p) | 0;
    let hit0 = TextHitInfo.afterOffset(index0);
    let hit1 = TextHitInfo.beforeOffset(index1);
    let locs = this.layout_.getCaretInfo(hit0);
    let x0 = locs[0];
    locs = this.layout_.getCaretInfo(hit1);
    let x1 = locs[0];
    return (x1 > x0) ? Math.fround(x1 - x0) : Math.fround(x0 - x1);
  }
  getHeight(v: GlyphView): number {
    return Math.fround(Math.fround(this.layout_.getAscent() + this.layout_.getDescent()) + this.layout_.getLeading());
  }
  /**
   * Fetch the ascent above the baseline for the glyphs
   * corresponding to the given range in the model.
   */
  getAscent(v: GlyphView): number {
    return this.layout_.getAscent();
  }
  /**
   * Fetch the descent below the baseline for the glyphs
   * corresponding to the given range in the model.
   */
  getDescent(v: GlyphView): number {
    return this.layout_.getDescent();
  }
  /**
   * Paint the glyphs for the given view.  This is implemented
   * to only render if the Graphics is of type Graphics2D which
   * is required by TextLayout (and this should be the case if
   * running on the JDK).
   */
  paint(v: GlyphView, g: Graphics, a: Shape, p0: number, p1: number): void {
    if (g instanceof Graphics2D) {
      let alloc = a.getBounds2D();
      let g2d = g;
      let y = Math.fround(Math.fround(Math.fround(alloc.getY()) + this.layout_.getAscent()) + this.layout_.getLeading());
      let x = Math.fround(alloc.getX());
      if (p0 > v.getStartOffset() || p1 < v.getEndOffset()) {
        try {
          let s = v.modelToView$int$Bias$int$Bias$Shape(p0, Position$Bias.Forward, p1, Position$Bias.Backward, a);
          let savedClip = g.getClip();
          g2d.clip(s);
          this.layout_.draw(g2d, x, y);
          g.setClip$Shape(savedClip);
        } catch ($e0) {
          if ($J.isa($e0, BadLocationException)) {
            let e = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      } else {
        this.layout_.draw(g2d, x, y);
      }
    }
  }
  modelToView(v: GlyphView, pos: number, bias: Position$Bias, a: Shape): Shape {
    let offs = (pos - v.getStartOffset()) | 0;
    let alloc = a.getBounds2D();
    let hit = (bias === Position$Bias.Forward) ? TextHitInfo.afterOffset(offs) : TextHitInfo.beforeOffset(offs);
    let locs = this.layout_.getCaretInfo(hit);
    let rect = new Rectangle2D$Float()._Rectangle2D$Float$();
    rect.setRect$double$double$double$double(alloc.getX() + locs[0], alloc.getY(), 1, alloc.getHeight());
    return rect;
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param v the view containing the view coordinates
   * @param x the X coordinate
   * @param y the Y coordinate
   * @param a the allocated region to render into
   * @param biasReturn either <code>Position.Bias.Forward</code>
   *  or <code>Position.Bias.Backward</code> is returned as the
   *  zero-th element of this array
   * @return the location within the model that best represents the
   *  given point of view
   * @see View#viewToModel
   */
  viewToModel(v: GlyphView, x: number, y: number, a: Shape, biasReturn: Position$Bias[]): number {
    let alloc = (a instanceof Rectangle2D) ? a : a.getBounds2D();
    let hit = this.layout_.hitTestChar(Math.fround(x - Math.fround(alloc.getX())), 0);
    let pos = hit.getInsertionIndex();
    if (pos === v.getEndOffset()) {
      pos--;
    }
    biasReturn[0] = hit.isLeadingEdge() ? Position$Bias.Forward : Position$Bias.Backward;
    return (pos + v.getStartOffset()) | 0;
  }
  /**
   * Determines the model location that represents the
   * maximum advance that fits within the given span.
   * This could be used to break the given view.  The result
   * should be a location just shy of the given advance.  This
   * differs from viewToModel which returns the closest
   * position which might be proud of the maximum advance.
   *
   * @param v the view to find the model location to break at.
   * @param p0 the location in the model where the
   *  fragment should start it's representation >= 0.
   * @param x the graphic location along the axis that the
   *  broken view would occupy >= 0.  This may be useful for
   *  things like tab calculations.
   * @param len specifies the distance into the view
   *  where a potential break is desired >= 0.
   * @return the maximum model location possible for a break.
   * @see View#breakView
   */
  getBoundedPosition(v: GlyphView, p0: number, x: number, len: number): number {
    if (len < Math.fround(0)) {
      throw new IllegalArgumentException('Length must be >= 0.');
    }
    let hit: TextHitInfo;
    if (this.layout_.isLeftToRight()) {
      hit = this.layout_.hitTestChar(len, 0);
    } else {
      hit = this.layout_.hitTestChar(Math.fround(this.layout_.getAdvance() - len), 0);
    }
    return (v.getStartOffset() + hit.getCharIndex()) | 0;
  }
  /**
   * Provides a way to determine the next visually represented model
   * location that one might place a caret.  Some views may not be
   * visible, they might not be in the same order found in the model, or
   * they just might not allow access to some of the locations in the
   * model.
   *
   * @param v the view to use
   * @param pos the position to convert >= 0
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard.
   *  This may be SwingConstants.WEST, SwingConstants.EAST,
   *  SwingConstants.NORTH, or SwingConstants.SOUTH.
   * @return the location within the model that best represents the next
   *  location visual position.
   * @throws BadLocationException
   * @throws IllegalArgumentException for an invalid direction
   */
  getNextVisualPositionFrom(v: GlyphView, pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    let doc = v.getDocument();
    let startOffset = v.getStartOffset();
    let endOffset = v.getEndOffset();
    let text: Segment;
    let viewIsLeftToRight: boolean;
    let currentHit: TextHitInfo;
    let nextHit: TextHitInfo;
    switch (direction) {
      case SwingConstants.NORTH:
        break;
      case SwingConstants.SOUTH:
        break;
      case SwingConstants.EAST:
        viewIsLeftToRight = AbstractDocument.isLeftToRight(doc, startOffset, endOffset);
        if (startOffset === doc.getLength()) {
          if (pos === -1) {
            biasRet[0] = Position$Bias.Forward;
            return startOffset;
          }
          return -1;
        }
        if (pos === -1) {
          if (viewIsLeftToRight) {
            biasRet[0] = Position$Bias.Forward;
            return startOffset;
          } else {
            text = v.getText((endOffset - 1) | 0, endOffset);
            let c = text.array[text.offset];
            SegmentCache.releaseSharedSegment(text);
            if (c === 10 /* \u000a */) {
              biasRet[0] = Position$Bias.Forward;
              return (endOffset - 1) | 0;
            }
            biasRet[0] = Position$Bias.Backward;
            return endOffset;
          }
        }
        if (b === Position$Bias.Forward) {
          currentHit = TextHitInfo.afterOffset((pos - startOffset) | 0);
        } else {
          currentHit = TextHitInfo.beforeOffset((pos - startOffset) | 0);
        }
        nextHit = this.layout_.getNextRightHit(currentHit);
        if (nextHit == null) {
          return -1;
        }
        if (viewIsLeftToRight !== this.layout_.isLeftToRight()) {
          nextHit = this.layout_.getVisualOtherHit(nextHit);
        }
        pos = (nextHit.getInsertionIndex() + startOffset) | 0;
        if (pos === endOffset) {
          text = v.getText((endOffset - 1) | 0, endOffset);
          let c = text.array[text.offset];
          SegmentCache.releaseSharedSegment(text);
          if (c === 10 /* \u000a */) {
            return -1;
          }
          biasRet[0] = Position$Bias.Backward;
        } else {
          biasRet[0] = Position$Bias.Forward;
        }
        return pos;
      case SwingConstants.WEST:
        viewIsLeftToRight = AbstractDocument.isLeftToRight(doc, startOffset, endOffset);
        if (startOffset === doc.getLength()) {
          if (pos === -1) {
            biasRet[0] = Position$Bias.Forward;
            return startOffset;
          }
          return -1;
        }
        if (pos === -1) {
          if (viewIsLeftToRight) {
            text = v.getText((endOffset - 1) | 0, endOffset);
            let c = text.array[text.offset];
            SegmentCache.releaseSharedSegment(text);
            if ((c === 10 /* \u000a */) || Character.isSpaceChar(c)) {
              biasRet[0] = Position$Bias.Forward;
              return (endOffset - 1) | 0;
            }
            biasRet[0] = Position$Bias.Backward;
            return endOffset;
          } else {
            biasRet[0] = Position$Bias.Forward;
            return startOffset;
          }
        }
        if (b === Position$Bias.Forward) {
          currentHit = TextHitInfo.afterOffset((pos - startOffset) | 0);
        } else {
          currentHit = TextHitInfo.beforeOffset((pos - startOffset) | 0);
        }
        nextHit = this.layout_.getNextLeftHit(currentHit);
        if (nextHit == null) {
          return -1;
        }
        if (viewIsLeftToRight !== this.layout_.isLeftToRight()) {
          nextHit = this.layout_.getVisualOtherHit(nextHit);
        }
        pos = (nextHit.getInsertionIndex() + startOffset) | 0;
        if (pos === endOffset) {
          text = v.getText((endOffset - 1) | 0, endOffset);
          let c = text.array[text.offset];
          SegmentCache.releaseSharedSegment(text);
          if (c === 10 /* \u000a */) {
            return -1;
          }
          biasRet[0] = Position$Bias.Backward;
        } else {
          biasRet[0] = Position$Bias.Forward;
        }
        return pos;
      default:
        throw new IllegalArgumentException('Bad direction: ' + direction);
    }
    return pos;
  }
}

$J.define(GlyphPainter2, 'javax.swing.text.GlyphPainter2', { kind: 'class', sup: 'javax.swing.text.GlyphView$GlyphPainter', ctors: { 'java.awt.font.TextLayout': '_GlyphPainter2' } });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  TextHitInfo = $J.load('java.awt.font.TextHitInfo');
  Rectangle2D = $J.load('java.awt.geom.Rectangle2D');
  Rectangle2D$Float = $J.load('java.awt.geom.Rectangle2D$Float');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
});
