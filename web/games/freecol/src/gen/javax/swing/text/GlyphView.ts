// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/GlyphView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BitSet, BreakIterator, Character, CloneNotSupportedException, IllegalArgumentException, JObject, Locale } from '../../../../jre/index.ts';
import { View } from './View.ts';

let Rectangle, SwingConstants, UIManager, AbstractDocument, BadLocationException, GlyphPainter1, JTextComponent, LayeredHighlighter, Position$Bias, SegmentCache, StateInvariantError, StyleConstants, StyledDocument, Utilities, WhitespaceBasedBreakIterator, SwingUtilities2;

/**
 * A GlyphView is a styled chunk of text that represents a view
 * mapped over an element in the text model. This view is generally
 * responsible for displaying text glyphs using character level
 * attributes in some way.
 * An implementation of the GlyphPainter class is used to do the
 * actual rendering and model/view translations.  This separates
 * rendering from layout and management of the association with
 * the model.
 * <p>
 * The view supports breaking for the purpose of formatting.
 * The fragments produced by breaking share the view that has
 * primary responsibility for the element (i.e. they are nested
 * classes and carry only a small amount of state of their own)
 * so they can share its resources.
 * <p>
 * Since this view
 * represents text that may have tabs embedded in it, it implements the
 * <code>TabableView</code> interface.  Tabs will only be
 * expanded if this view is embedded in a container that does
 * tab expansion.  ParagraphView is an example of a container
 * that does tab expansion.
 *
 * @since 1.3
 *
 * @author  Timothy Prinzing
 */
export class GlyphView extends View {
  /**
   * Used by paint() to store highlighted view positions
   */
  selections: number[] = null;
  offset: number = 0;
  length_: number = 0;
  impliedCR: boolean = false;
  skipWidth: boolean = false;
  /**
   * how to expand tabs
   */
  expander: TabExpander = null;
  /**
   * Cached minimum x-span value
   */
  minimumSpan: number = 0;
  /**
   * Cached breakpoints within the view
   */
  breakSpots: number[] = null;
  /**
   * location for determining tab expansion against.
   */
  x_: number = 0;
  /**
   * Glyph rendering functionality.
   */
  painter: GlyphView$GlyphPainter = null;
  /**
   * The prototype painter used by default.
   */
  static defaultPainter: GlyphView$GlyphPainter = null;
  justificationInfo: GlyphView$JustificationInfo = null;
  /**
   * Constructs a new view wrapped on an element.
   *
   * @param elem the element
   */
  _GlyphView(elem: Element): this {
    this._View(elem);
    this.selections = null;
    this.minimumSpan = -1;
    this.breakSpots = null;
    this.justificationInfo = null;
    this.offset = 0;
    this.length_ = 0;
    let parent = elem.getParentElement();
    let attr = elem.getAttributes();
    this.impliedCR = (attr != null && attr.getAttribute(SwingUtilities2.IMPLIED_CR) != null && parent != null && parent.getElementCount() > 1);
    this.skipWidth = $J.equals(elem.getName(), 'br');
    return this;
  }
  /**
   * Creates a shallow copy.  This is used by the
   * createFragment and breakView methods.
   *
   * @return the copy
   */
  clone(): any {
    let o: any;
    try {
      o = super.clone();
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let cnse = $J.exc($e0);
        o = null;
      } else {
        throw $e0;
      }
    }
    return o;
  }
  /**
   * Fetch the currently installed glyph painter.
   * If a painter has not yet been installed, and
   * a default was not yet needed, null is returned.
   * @return the currently installed glyph painter
   */
  getGlyphPainter(): GlyphView$GlyphPainter {
    return this.painter;
  }
  /**
   * Sets the painter to use for rendering glyphs.
   * @param p the painter to use for rendering glyphs
   */
  setGlyphPainter(p: GlyphView$GlyphPainter): void {
    this.painter = p;
  }
  /**
   * Fetch a reference to the text that occupies
   * the given range.  This is normally used by
   * the GlyphPainter to determine what characters
   * it should render glyphs for.
   *
   * @param p0  the starting document offset &gt;= 0
   * @param p1  the ending document offset &gt;= p0
   * @return    the <code>Segment</code> containing the text
   */
  getText(p0: number, p1: number): Segment {
    let text = SegmentCache.getSharedSegment();
    try {
      let doc = this.getDocument();
      doc.getText$int$int$Segment(p0, (p1 - p0) | 0, text);
    } catch ($e1) {
      if ($J.isa($e1, BadLocationException)) {
        let bl = $J.exc($e1);
        throw new StateInvariantError()._StateInvariantError('GlyphView: Stale view: ' + $J.str(bl));
      } else {
        throw $e1;
      }
    }
    return text;
  }
  /**
   * Fetch the background color to use to render the
   * glyphs.  If there is no background color, null should
   * be returned.  This is implemented to call
   * <code>StyledDocument.getBackground</code> if the associated
   * document is a styled document, otherwise it returns null.
   * @return the background color to use to render the glyphs
   */
  getBackground(): Color {
    let doc = this.getDocument();
    if ($J.isa(doc, StyledDocument)) {
      let attr = this.getAttributes();
      if (attr.isDefined(StyleConstants.Background)) {
        return (doc).getBackground(attr);
      }
    }
    return null;
  }
  /**
   * Fetch the foreground color to use to render the
   * glyphs.  If there is no foreground color, null should
   * be returned.  This is implemented to call
   * <code>StyledDocument.getBackground</code> if the associated
   * document is a StyledDocument.  If the associated document
   * is not a StyledDocument, the associated components foreground
   * color is used.  If there is no associated component, null
   * is returned.
   * @return the foreground color to use to render the glyphs
   */
  getForeground(): Color {
    let doc = this.getDocument();
    if ($J.isa(doc, StyledDocument)) {
      let attr = this.getAttributes();
      return (doc).getForeground(attr);
    }
    let c = this.getContainer();
    if (c != null) {
      return c.getForeground();
    }
    return null;
  }
  /**
   * Fetch the font that the glyphs should be based
   * upon.  This is implemented to call
   * <code>StyledDocument.getFont</code> if the associated
   * document is a StyledDocument.  If the associated document
   * is not a StyledDocument, the associated components font
   * is used.  If there is no associated component, null
   * is returned.
   * @return the font that the glyphs should be based upon
   */
  getFont(): Font {
    let doc = this.getDocument();
    if ($J.isa(doc, StyledDocument)) {
      let attr = this.getAttributes();
      return (doc).getFont(attr);
    }
    let c = this.getContainer();
    if (c != null) {
      return c.getFont();
    }
    return null;
  }
  /**
   * Determine if the glyphs should be underlined.  If true,
   * an underline should be drawn through the baseline.
   * @return if the glyphs should be underlined
   */
  isUnderline(): boolean {
    let attr = this.getAttributes();
    return StyleConstants.isUnderline(attr);
  }
  /**
   * Determine if the glyphs should have a strikethrough
   * line.  If true, a line should be drawn through the center
   * of the glyphs.
   * @return if the glyphs should have a strikethrough line
   */
  isStrikeThrough(): boolean {
    let attr = this.getAttributes();
    return StyleConstants.isStrikeThrough(attr);
  }
  /**
   * Determine if the glyphs should be rendered as superscript.
   * @return if the glyphs should be rendered as superscript
   */
  isSubscript(): boolean {
    let attr = this.getAttributes();
    return StyleConstants.isSubscript(attr);
  }
  /**
   * Determine if the glyphs should be rendered as subscript.
   * @return if the glyphs should be rendered as subscript
   */
  isSuperscript(): boolean {
    let attr = this.getAttributes();
    return StyleConstants.isSuperscript(attr);
  }
  /**
   * Fetch the TabExpander to use if tabs are present in this view.
   * @return the TabExpander to use if tabs are present in this view
   */
  getTabExpander(): TabExpander {
    return this.expander;
  }
  /**
   * Check to see that a glyph painter exists.  If a painter
   * doesn't exist, a default glyph painter will be installed.
   */
  checkPainter(): void {
    if (this.painter == null) {
      if (GlyphView.defaultPainter == null) {
        GlyphView.defaultPainter = new GlyphPainter1()._GlyphPainter1();
      }
      this.setGlyphPainter(GlyphView.defaultPainter.getPainter(this, this.getStartOffset(), this.getEndOffset()));
    }
  }
  /**
   * Determines the desired span when using the given
   * tab expansion implementation.
   *
   * @param x the position the view would be located
   *  at for the purpose of tab expansion &gt;= 0.
   * @param e how to expand the tabs when encountered.
   * @return the desired span &gt;= 0
   * @see TabableView#getTabbedSpan
   */
  getTabbedSpan(x: number, e: TabExpander): number {
    this.checkPainter();
    let old = this.expander;
    this.expander = e;
    if (this.expander !== old) {
      this.preferenceChanged(null, true, false);
    }
    this.x_ = $J.d2i(x);
    let p0 = this.getStartOffset();
    let p1 = this.getEndOffset();
    let width = this.painter.getSpan(this, p0, p1, this.expander, x);
    return width;
  }
  /**
   * Determines the span along the same axis as tab
   * expansion for a portion of the view.  This is
   * intended for use by the TabExpander for cases
   * where the tab expansion involves aligning the
   * portion of text that doesn't have whitespace
   * relative to the tab stop.  There is therefore
   * an assumption that the range given does not
   * contain tabs.
   * <p>
   * This method can be called while servicing the
   * getTabbedSpan or getPreferredSize.  It has to
   * arrange for its own text buffer to make the
   * measurements.
   *
   * @param p0 the starting document offset &gt;= 0
   * @param p1 the ending document offset &gt;= p0
   * @return the span &gt;= 0
   */
  getPartialSpan(p0: number, p1: number): number {
    this.checkPainter();
    let width = this.painter.getSpan(this, p0, p1, this.expander, Math.fround(this.x_));
    return width;
  }
  /**
   * Fetches the portion of the model that this view is responsible for.
   *
   * @return the starting offset into the model
   * @see View#getStartOffset
   */
  getStartOffset(): number {
    let e = this.getElement();
    return (this.length_ > 0) ? (e.getStartOffset() + this.offset) | 0 : e.getStartOffset();
  }
  /**
   * Fetches the portion of the model that this view is responsible for.
   *
   * @return the ending offset into the model
   * @see View#getEndOffset
   */
  getEndOffset(): number {
    let e = this.getElement();
    return (this.length_ > 0) ? (e.getStartOffset() + this.offset + this.length_) | 0 : e.getEndOffset();
  }
  /**
   * Lazily initializes the selections field
   */
  initSelections(p0: number, p1: number): void {
    let viewPosCount = (p1 - p0 + 1) | 0;
    if (this.selections == null || viewPosCount > this.selections.length) {
      this.selections = $J.newArray(viewPosCount, 0);
      return;
    }
    for (let i = 0; i < viewPosCount; this.selections[i++] = 0) {
    }
  }
  /**
   * Renders a portion of a text style run.
   *
   * @param g the rendering surface to use
   * @param a the allocated region to render into
   */
  paint(g: Graphics, a: Shape): void {
    this.checkPainter();
    let paintedText = false;
    let c = this.getContainer();
    let p0 = this.getStartOffset();
    let p1 = this.getEndOffset();
    let alloc = (a instanceof Rectangle) ? a : a.getBounds();
    let bg = this.getBackground();
    let fg = this.getForeground();
    if (c != null && !c.isEnabled()) {
      fg = (c instanceof JTextComponent ? (c).getDisabledTextColor() : UIManager.getColor$Object('textInactiveText'));
    }
    if (bg != null) {
      g.setColor(bg);
      g.fillRect(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
    }
    if (c instanceof JTextComponent) {
      let tc = c;
      let h = tc.getHighlighter();
      if (h instanceof LayeredHighlighter) {
        (h).paintLayeredHighlights(g, p0, p1, a, tc, this);
      }
    }
    if (Utilities.isComposedTextElement$Element(this.getElement())) {
      Utilities.paintComposedText(g, a.getBounds(), this);
      paintedText = true;
    } else if (c instanceof JTextComponent) {
      let tc = c;
      let selFG = tc.getSelectedTextColor();
      if ((tc.getHighlighter() != null) && (selFG != null) && !selFG.equals(fg)) {
        let h = tc.getHighlighter().getHighlights();
        if (h.length !== 0) {
          let initialized = false;
          let viewSelectionCount = 0;
          for (let i = 0; i < h.length; i++) {
            let highlight = h[i];
            let hStart = highlight.getStartOffset();
            let hEnd = highlight.getEndOffset();
            if (hStart > p1 || hEnd < p0) {
              continue;
            }
            if (!SwingUtilities2.useSelectedTextColor(highlight, tc)) {
              continue;
            }
            if (hStart <= p0 && hEnd >= p1) {
              this.paintTextUsingColor(g, a, selFG, p0, p1);
              paintedText = true;
              break;
            }
            if (!initialized) {
              this.initSelections(p0, p1);
              initialized = true;
            }
            hStart = Math.max(p0, hStart);
            hEnd = Math.min(p1, hEnd);
            this.paintTextUsingColor(g, a, selFG, hStart, hEnd);
            (this.selections[(hStart - p0) | 0])++;
            (this.selections[(hEnd - p0) | 0])--;
            viewSelectionCount++;
          }
          if (!paintedText && viewSelectionCount > 0) {
            let curPos = -1;
            let startPos = 0;
            let viewLen = (p1 - p0) | 0;
            while (curPos++ < viewLen) {
              while (curPos < viewLen && this.selections[curPos] === 0) {
                curPos++;
              }
              if (startPos !== curPos) {
                this.paintTextUsingColor(g, a, fg, (p0 + startPos) | 0, (p0 + curPos) | 0);
              }
              let checkSum = 0;
              while (curPos < viewLen && (checkSum = (checkSum + this.selections[curPos]) | 0) !== 0) {
                curPos++;
              }
              startPos = curPos;
            }
            paintedText = true;
          }
        }
      }
    }
    if (!paintedText) {
      this.paintTextUsingColor(g, a, fg, p0, p1);
    }
  }
  /**
   * Paints the specified region of text in the specified color.
   */
  paintTextUsingColor(g: Graphics, a: Shape, c: Color, p0: number, p1: number): void {
    g.setColor(c);
    this.painter.paint(this, g, a, p0, p1);
    let underline = this.isUnderline();
    let strike = this.isStrikeThrough();
    if (underline || strike) {
      let alloc = (a instanceof Rectangle) ? a : a.getBounds();
      let parent = this.getParent();
      if ((parent != null) && (parent.getEndOffset() === p1)) {
        let s = this.getText(p0, p1);
        while (Character.isWhitespace(s.last())) {
          p1 = (p1 - 1) | 0;
          s.count_ = (s.count_ - 1) | 0;
        }
        SegmentCache.releaseSharedSegment(s);
      }
      let x0 = alloc.x_;
      let p = this.getStartOffset();
      if (p !== p0) {
        x0 = (x0 + $J.d2i(this.painter.getSpan(this, p, p0, this.getTabExpander(), Math.fround(x0)))) | 0;
      }
      let x1 = (x0 + $J.d2i(this.painter.getSpan(this, p0, p1, this.getTabExpander(), Math.fround(x0)))) | 0;
      let y = (alloc.y_ + $J.d2i((Math.fround(this.painter.getHeight(this) - this.painter.getDescent(this))))) | 0;
      if (underline) {
        let yTmp = (y + 1) | 0;
        g.drawLine(x0, yTmp, x1, yTmp);
      }
      if (strike) {
        let yTmp = (y - $J.d2i((Math.fround(this.painter.getAscent(this) * Math.fround(0.3))))) | 0;
        g.drawLine(x0, yTmp, x1, yTmp);
      }
    }
  }
  /**
   * Determines the minimum span for this view along an axis.
   *
   * <p>This implementation returns the longest non-breakable area within
   * the view as a minimum span for {@code View.X_AXIS}.</p>
   *
   * @param axis  may be either {@code View.X_AXIS} or {@code View.Y_AXIS}
   * @return      the minimum span the view can be rendered into
   * @throws IllegalArgumentException if the {@code axis} parameter is invalid
   * @see         javax.swing.text.View#getMinimumSpan
   */
  getMinimumSpan(axis: number): number {
    switch (axis) {
      case View.X_AXIS:
        if (this.minimumSpan < Math.fround(0)) {
          this.minimumSpan = 0;
          let p0 = this.getStartOffset();
          let p1 = this.getEndOffset();
          while (p1 > p0) {
            let breakSpot = this.getBreakSpot(p0, p1);
            if (breakSpot === -1) {
              breakSpot = p0;
            }
            this.minimumSpan = Math.max(this.minimumSpan, this.getPartialSpan(breakSpot, p1));
            p1 = (breakSpot - 1) | 0;
          }
        }
        return this.minimumSpan;
      case View.Y_AXIS:
        return super.getMinimumSpan(axis);
      default:
        throw new IllegalArgumentException('Invalid axis: ' + axis);
    }
  }
  /**
   * Determines the preferred span for this view along an
   * axis.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return   the span the view would like to be rendered into &gt;= 0.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   */
  getPreferredSpan(axis: number): number {
    if (this.impliedCR) {
      return 0;
    }
    this.checkPainter();
    let p0 = this.getStartOffset();
    let p1 = this.getEndOffset();
    {
      let h: number;
      switch (axis) {
        case View.X_AXIS:
          if (this.skipWidth) {
            return 0;
          }
          return this.painter.getSpan(this, p0, p1, this.expander, Math.fround(this.x_));
        case View.Y_AXIS:
          h = this.painter.getHeight(this);
          if (this.isSuperscript()) {
            h = Math.fround(h + Math.fround(h / 3));
          }
          return h;
        default:
          throw new IllegalArgumentException('Invalid axis: ' + axis);
      }
    }
  }
  /**
   * Determines the desired alignment for this view along an
   * axis.  For the label, the alignment is along the font
   * baseline for the y axis, and the superclasses alignment
   * along the x axis.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return the desired alignment.  This should be a value
   *   between 0.0 and 1.0 inclusive, where 0 indicates alignment at the
   *   origin and 1.0 indicates alignment to the full span
   *   away from the origin.  An alignment of 0.5 would be the
   *   center of the view.
   */
  getAlignment(axis: number): number {
    this.checkPainter();
    if (axis === View.Y_AXIS) {
      let sup = this.isSuperscript();
      let sub = this.isSubscript();
      let h = this.painter.getHeight(this);
      let d = this.painter.getDescent(this);
      let a = this.painter.getAscent(this);
      let align: number;
      if (sup) {
        align = 1;
      } else if (sub) {
        align = (h > Math.fround(0)) ? Math.fround((Math.fround(h - (Math.fround(d + (Math.fround(a / 2)))))) / h) : 0;
      } else {
        align = (h > Math.fround(0)) ? Math.fround((Math.fround(h - d)) / h) : 0;
      }
      return align;
    }
    return super.getAlignment(axis);
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert &gt;= 0
   * @param a   the allocated region to render into
   * @param b   either <code>Position.Bias.Forward</code>
   *                or <code>Position.Bias.Backward</code>
   * @return the bounding box of the given position
   * @throws BadLocationException  if the given position does not represent a
   *   valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    this.checkPainter();
    return this.painter.modelToView(this, pos, b, a);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param a the allocated region to render into
   * @param biasReturn either <code>Position.Bias.Forward</code>
   *  or <code>Position.Bias.Backward</code> is returned as the
   *  zero-th element of this array
   * @return the location within the model that best represents the
   *  given point of view &gt;= 0
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, biasReturn: Position$Bias[]): number {
    this.checkPainter();
    return this.painter.viewToModel(this, x, y, a, biasReturn);
  }
  /**
   * Determines how attractive a break opportunity in
   * this view is.  This can be used for determining which
   * view is the most attractive to call <code>breakView</code>
   * on in the process of formatting.  The
   * higher the weight, the more attractive the break.  A
   * value equal to or lower than <code>View.BadBreakWeight</code>
   * should not be considered for a break.  A value greater
   * than or equal to <code>View.ForcedBreakWeight</code> should
   * be broken.
   * <p>
   * This is implemented to forward to the superclass for
   * the Y_AXIS.  Along the X_AXIS the following values
   * may be returned.
   * <dl>
   * <dt><b>View.ExcellentBreakWeight</b>
   * <dd>if there is whitespace proceeding the desired break
   *   location.
   * <dt><b>View.BadBreakWeight</b>
   * <dd>if the desired break location results in a break
   *   location of the starting offset.
   * <dt><b>View.GoodBreakWeight</b>
   * <dd>if the other conditions don't occur.
   * </dl>
   * This will normally result in the behavior of breaking
   * on a whitespace location if one can be found, otherwise
   * breaking between characters.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @param pos the potential location of the start of the
   *   broken view &gt;= 0.  This may be useful for calculating tab
   *   positions.
   * @param len specifies the relative length from <em>pos</em>
   *   where a potential break is desired &gt;= 0.
   * @return the weight, which should be a value between
   *   View.ForcedBreakWeight and View.BadBreakWeight.
   * @see LabelView
   * @see ParagraphView
   * @see View#BadBreakWeight
   * @see View#GoodBreakWeight
   * @see View#ExcellentBreakWeight
   * @see View#ForcedBreakWeight
   */
  getBreakWeight$int$float$float(axis: number, pos: number, len: number): number {
    if (axis === View.X_AXIS) {
      this.checkPainter();
      let p0 = this.getStartOffset();
      let p1 = this.painter.getBoundedPosition(this, p0, pos, len);
      return p1 === p0 ? View.BadBreakWeight : this.getBreakSpot(p0, p1) !== -1 ? View.ExcellentBreakWeight : View.GoodBreakWeight;
    }
    return super.getBreakWeight$int$float$float(axis, pos, len);
  }
  /**
   * Breaks this view on the given axis at the given length.
   * This is implemented to attempt to break on a whitespace
   * location, and returns a fragment with the whitespace at
   * the end.  If a whitespace location can't be found, the
   * nearest character is used.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @param p0 the location in the model where the
   *  fragment should start it's representation &gt;= 0.
   * @param pos the position along the axis that the
   *  broken view would occupy &gt;= 0.  This may be useful for
   *  things like tab calculations.
   * @param len specifies the distance along the axis
   *  where a potential break is desired &gt;= 0.
   * @return the fragment of the view that represents the
   *  given span, if the view can be broken.  If the view
   *  doesn't support breaking behavior, the view itself is
   *  returned.
   * @see View#breakView
   */
  breakView$int$int$float$float(axis: number, p0: number, pos: number, len: number): View {
    if (axis === View.X_AXIS) {
      this.checkPainter();
      let p1 = this.painter.getBoundedPosition(this, p0, pos, len);
      let breakSpot = this.getBreakSpot(p0, p1);
      if (breakSpot !== -1) {
        p1 = breakSpot;
      }
      if (p0 === this.getStartOffset() && p1 === this.getEndOffset()) {
        return this;
      }
      let v = this.createFragment(p0, p1);
      v.x_ = $J.d2i(pos);
      return v;
    }
    return this;
  }
  /**
   * Returns a location to break at in the passed in region, or
   * BreakIterator.DONE if there isn't a good location to break at
   * in the specified region.
   */
  getBreakSpot(p0: number, p1: number): number {
    if (this.breakSpots == null) {
      let start = this.getStartOffset();
      let end = this.getEndOffset();
      let bs = $J.newArray((end + 1 - start) | 0, 0);
      let ix = 0;
      let parent = this.getElement().getParentElement();
      let pstart = (parent == null ? start : parent.getStartOffset());
      let pend = (parent == null ? end : parent.getEndOffset());
      let s = this.getText(pstart, pend);
      s.first();
      let breaker = this.getBreaker();
      breaker.setText(s);
      let startFrom = (end + (pend > end ? 1 : 0)) | 0;
      for (; ; ) {
        startFrom = (breaker.preceding((s.offset + (startFrom - pstart)) | 0) + (pstart - s.offset)) | 0;
        if (startFrom > start) {
          bs[ix++] = startFrom;
        } else {
          break;
        }
      }
      SegmentCache.releaseSharedSegment(s);
      this.breakSpots = $J.newArray(ix, 0);
      $J.system_arraycopy(bs, 0, this.breakSpots, 0, ix);
    }
    let breakSpot = -1;
    for (let i = 0; i < this.breakSpots.length; i++) {
      let bsp = this.breakSpots[i];
      if (bsp <= p1) {
        if (bsp > p0) {
          breakSpot = bsp;
        }
        break;
      }
    }
    return breakSpot;
  }
  /**
   * Return break iterator appropriate for the current document.
   *
   * For non-i18n documents a fast whitespace-based break iterator is used.
   */
  getBreaker(): BreakIterator {
    let doc = this.getDocument();
    if ((doc != null) && $J.equals(true, doc.getProperty(AbstractDocument.MultiByteProperty))) {
      let c = this.getContainer();
      let locale = (c == null ? Locale.getDefault() : c.getLocale$());
      return BreakIterator.getLineInstance(locale);
    } else {
      return new WhitespaceBasedBreakIterator()._WhitespaceBasedBreakIterator();
    }
  }
  /**
   * Creates a view that represents a portion of the element.
   * This is potentially useful during formatting operations
   * for taking measurements of fragments of the view.  If
   * the view doesn't support fragmenting (the default), it
   * should return itself.
   * <p>
   * This view does support fragmenting.  It is implemented
   * to return a nested class that shares state in this view
   * representing only a portion of the view.
   *
   * @param p0 the starting offset &gt;= 0.  This should be a value
   *   greater or equal to the element starting offset and
   *   less than the element ending offset.
   * @param p1 the ending offset &gt; p0.  This should be a value
   *   less than or equal to the elements end offset and
   *   greater than the elements starting offset.
   * @return the view fragment, or itself if the view doesn't
   *   support breaking into fragments
   * @see LabelView
   */
  createFragment(p0: number, p1: number): View {
    this.checkPainter();
    let elem = this.getElement();
    let v = this.clone();
    v.offset = (p0 - elem.getStartOffset()) | 0;
    v.length_ = (p1 - p0) | 0;
    v.painter = this.painter.getPainter(v, p0, p1);
    v.justificationInfo = null;
    return v;
  }
  /**
   * Provides a way to determine the next visually represented model
   * location that one might place a caret.  Some views may not be
   * visible, they might not be in the same order found in the model, or
   * they just might not allow access to some of the locations in the
   * model.
   * This method enables specifying a position to convert
   * within the range of &gt;=0.  If the value is -1, a position
   * will be calculated automatically.  If the value &lt; -1,
   * the {@code BadLocationException} will be thrown.
   *
   * @param pos the position to convert
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard.
   *  This may be SwingConstants.WEST, SwingConstants.EAST,
   *  SwingConstants.NORTH, or SwingConstants.SOUTH.
   * @return the location within the model that best represents the next
   *  location visual position.
   * @throws BadLocationException the given position is not a valid
   *                                 position within the document
   * @throws IllegalArgumentException for an invalid direction
   */
  getNextVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (pos < -1 || pos > this.getDocument().getLength()) {
      throw new BadLocationException()._BadLocationException('invalid position', pos);
    }
    return this.painter.getNextVisualPositionFrom(this, pos, b, a, direction, biasRet);
  }
  /**
   * Gives notification that something was inserted into
   * the document in a location that this view is responsible for.
   * This is implemented to call preferenceChanged along the
   * axis the glyphs are rendered.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#insertUpdate
   */
  insertUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.justificationInfo = null;
    this.breakSpots = null;
    this.minimumSpan = -1;
    this.syncCR();
    this.preferenceChanged(null, true, false);
  }
  /**
   * Gives notification that something was removed from the document
   * in a location that this view is responsible for.
   * This is implemented to call preferenceChanged along the
   * axis the glyphs are rendered.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#removeUpdate
   */
  removeUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.justificationInfo = null;
    this.breakSpots = null;
    this.minimumSpan = -1;
    this.syncCR();
    this.preferenceChanged(null, true, false);
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   * This is implemented to call preferenceChanged along both the
   * horizontal and vertical axis.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#changedUpdate
   */
  changedUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.minimumSpan = -1;
    this.syncCR();
    this.preferenceChanged(null, true, true);
  }
  syncCR(): void {
    if (this.impliedCR) {
      let parent = this.getElement().getParentElement();
      this.impliedCR = (parent != null && parent.getElementCount() > 1);
    }
  }
  /**
   * {@inheritDoc}
   */
  updateAfterChange(): void {
    this.breakSpots = null;
  }
  getJustificationInfo(rowStartOffset: number): GlyphView$JustificationInfo {
    if (this.justificationInfo != null) {
      return this.justificationInfo;
    }
    let TRAILING = 0;
    let CONTENT = 1;
    let SPACES = 2;
    let startOffset = this.getStartOffset();
    let endOffset = this.getEndOffset();
    let segment = this.getText(startOffset, endOffset);
    let txtOffset = segment.offset;
    let txtEnd = (segment.offset + segment.count_ - 1) | 0;
    let startContentPosition = (txtEnd + 1) | 0;
    let endContentPosition = (txtOffset - 1) | 0;
    let lastTabPosition = (txtOffset - 1) | 0;
    let trailingSpaces = 0;
    let contentSpaces = 0;
    let leadingSpaces = 0;
    let hasTab = false;
    let spaceMap = new BitSet((endOffset - startOffset + 1) | 0);
    for (let i = txtEnd, state = TRAILING; i >= txtOffset; i--) {
      if (32 /* ' ' */ === segment.array[i]) {
        spaceMap.set((i - txtOffset) | 0);
        if (state === TRAILING) {
          trailingSpaces++;
        } else if (state === CONTENT) {
          state = SPACES;
          leadingSpaces = 1;
        } else if (state === SPACES) {
          leadingSpaces++;
        }
      } else if (9 /* \u0009 */ === segment.array[i]) {
        hasTab = true;
        break;
      } else {
        if (state === TRAILING) {
          if (10 /* \u000a */ !== segment.array[i] && 13 /* \u000d */ !== segment.array[i]) {
            state = CONTENT;
            endContentPosition = i;
          }
        } else if (state === CONTENT) {
        } else if (state === SPACES) {
          contentSpaces = (contentSpaces + leadingSpaces) | 0;
          leadingSpaces = 0;
        }
        startContentPosition = i;
      }
    }
    SegmentCache.releaseSharedSegment(segment);
    let startJustifiableContent = -1;
    if (startContentPosition < txtEnd) {
      startJustifiableContent = (startContentPosition - txtOffset) | 0;
    }
    let endJustifiableContent = -1;
    if (endContentPosition > txtOffset) {
      endJustifiableContent = (endContentPosition - txtOffset) | 0;
    }
    this.justificationInfo = new GlyphView$JustificationInfo()._GlyphView$JustificationInfo(startJustifiableContent, endJustifiableContent, leadingSpaces, contentSpaces, trailingSpaces, hasTab, spaceMap);
    return this.justificationInfo;
  }
}

/**
 * Class to hold data needed to justify this GlyphView in a PargraphView.Row
 */
export class GlyphView$JustificationInfo extends JObject {
  start_: number = 0;
  end_: number = 0;
  leadingSpaces: number = 0;
  contentSpaces: number = 0;
  trailingSpaces: number = 0;
  hasTab: boolean = false;
  spaceMap: BitSet = null;
  _GlyphView$JustificationInfo(start: number, end: number, leadingSpaces: number, contentSpaces: number, trailingSpaces: number, hasTab: boolean, spaceMap: BitSet): this {
    this.start_ = start;
    this.end_ = end;
    this.leadingSpaces = leadingSpaces;
    this.contentSpaces = contentSpaces;
    this.trailingSpaces = trailingSpaces;
    this.hasTab = hasTab;
    this.spaceMap = spaceMap;
    return this;
  }
}

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
 *
 * @since 1.3
 */
export class GlyphView$GlyphPainter extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _GlyphView$GlyphPainter(): this {
    return this;
  }
  /**
   * Create a painter to use for the given GlyphView.  If
   * the painter carries state it can create another painter
   * to represent a new GlyphView that is being created.  If
   * the painter doesn't hold any significant state, it can
   * return itself.  The default behavior is to return itself.
   * @param v  the <code>GlyphView</code> to provide a painter for
   * @param p0 the starting document offset &gt;= 0
   * @param p1 the ending document offset &gt;= p0
   * @return a painter to use for the given GlyphView
   */
  getPainter(v: GlyphView, p0: number, p1: number): GlyphView$GlyphPainter {
    return this;
  }
  /**
   * Provides a way to determine the next visually represented model
   * location that one might place a caret.  Some views may not be
   * visible, they might not be in the same order found in the model, or
   * they just might not allow access to some of the locations in the
   * model.
   *
   * @param v the view to use
   * @param pos the position to convert &gt;= 0
   * @param b   either <code>Position.Bias.Forward</code>
   *                or <code>Position.Bias.Backward</code>
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard.
   *  This may be SwingConstants.WEST, SwingConstants.EAST,
   *  SwingConstants.NORTH, or SwingConstants.SOUTH.
   * @param biasRet  either <code>Position.Bias.Forward</code>
   *                 or <code>Position.Bias.Backward</code>
   *                 is returned as the zero-th element of this array
   * @return the location within the model that best represents the next
   *  location visual position.
   * @throws BadLocationException for a bad location within a document model
   * @throws IllegalArgumentException for an invalid direction
   */
  getNextVisualPositionFrom(v: GlyphView, pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    let startOffset = v.getStartOffset();
    let endOffset = v.getEndOffset();
    let text: Segment;
    {
      let container: Container;
      switch (direction) {
        case SwingConstants.NORTH:
        case SwingConstants.SOUTH:
          if (pos !== -1) {
            return -1;
          }
          container = v.getContainer();
          if (container instanceof JTextComponent) {
            let c = (container).getCaret();
            let magicPoint: Point;
            magicPoint = (c != null) ? c.getMagicCaretPosition() : null;
            if (magicPoint == null) {
              biasRet[0] = Position$Bias.Forward;
              return startOffset;
            }
            let value = v.viewToModel$float$float$Shape$BiasArr(Math.fround(magicPoint.x_), 0, a, biasRet);
            return value;
          }
          break;
        case SwingConstants.EAST:
          if (startOffset === v.getDocument().getLength()) {
            if (pos === -1) {
              biasRet[0] = Position$Bias.Forward;
              return startOffset;
            }
            return -1;
          }
          if (pos === -1) {
            biasRet[0] = Position$Bias.Forward;
            return startOffset;
          }
          if (pos === endOffset) {
            return -1;
          }
          if (++pos === endOffset) {
            return -1;
          } else {
            biasRet[0] = Position$Bias.Forward;
          }
          return pos;
        case SwingConstants.WEST:
          if (startOffset === v.getDocument().getLength()) {
            if (pos === -1) {
              biasRet[0] = Position$Bias.Forward;
              return startOffset;
            }
            return -1;
          }
          if (pos === -1) {
            biasRet[0] = Position$Bias.Forward;
            return (endOffset - 1) | 0;
          }
          if (pos === startOffset) {
            return -1;
          }
          biasRet[0] = Position$Bias.Forward;
          return ((pos - 1) | 0);
        default:
          throw new IllegalArgumentException('Bad direction: ' + direction);
      }
    }
    return pos;
  }
}

$J.define(GlyphView, 'javax.swing.text.GlyphView', { kind: 'class', ifaces: ['javax.swing.text.TabableView', 'java.lang.Cloneable'], sup: 'javax.swing.text.View', ctors: { 'javax.swing.text.Element': '_GlyphView' }, meths: { 'breakView(int,int,float,float)': 'breakView$int$int$float$float', 'getBreakWeight(int,float,float)': 'getBreakWeight$int$float$float', 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' } });
$J.define(GlyphView$JustificationInfo, 'javax.swing.text.GlyphView$JustificationInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int,int,boolean,java.util.BitSet': '_GlyphView$JustificationInfo' } });
$J.define(GlyphView$GlyphPainter, 'javax.swing.text.GlyphView$GlyphPainter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GlyphView$GlyphPainter' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  GlyphPainter1 = $J.load('javax.swing.text.GlyphPainter1');
  JTextComponent = $J.load('javax.swing.text.JTextComponent');
  LayeredHighlighter = $J.load('javax.swing.text.LayeredHighlighter');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  StyledDocument = $J.load('javax.swing.text.StyledDocument');
  Utilities = $J.load('javax.swing.text.Utilities');
  WhitespaceBasedBreakIterator = $J.load('javax.swing.text.WhitespaceBasedBreakIterator');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
