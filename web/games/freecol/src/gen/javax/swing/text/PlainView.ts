// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/PlainView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, Exception, HashMap, IllegalArgumentException, JEnum, JObject, Objects, RuntimeException, SoftReference } from '../../../../jre/index.ts';
import { View } from './View.ts';

let Graphics, Graphics2D, Rectangle, Rectangle2D$Float, DocumentEvent$EventType, BadLocationException, LayeredHighlighter, PlainDocument, Position$Bias, SegmentCache, StateInvariantError, Utilities;

/**
 * Implements View interface for a simple multi-line text view
 * that has text in one font and color.  The view represents each
 * child element as a line of text.
 *
 * @author  Timothy Prinzing
 * @see     View
 */
export class PlainView extends View {
  /**
   * Font metrics for the current font.
   */
  metrics: FontMetrics = null;
  /**
   * The current longest line.  This is used to calculate
   * the preferred width of the view.  Since the calculation
   * is potentially expensive we try to avoid it by stashing
   * which line is currently the longest.
   */
  longLine: Element = null;
  /**
   * Font used to calculate the longest line... if this
   * changes we need to recalculate the longest line
   */
  font: Font = null;
  lineBuffer: Segment = null;
  tabSize: number = 0;
  tabBase: number = 0;
  sel0: number = 0;
  sel1: number = 0;
  unselected: Color = null;
  selected: Color = null;
  /**
   * Offset of where to draw the first character on the first line.
   * This is a hack and temporary until we can better address the problem
   * of text measuring. This field is actually never set directly in
   * PlainView, but by FieldView.
   */
  firstLineOffset: number = 0;
  static methodsOverriddenMapRef: SoftReference<HashMap<PlainView$FPMethodItem, boolean>> = null;
  drawLineOverridden: boolean = false;
  drawSelectedTextOverridden: boolean = false;
  drawUnselectedTextOverridden: boolean = false;
  useFloatingPointAPI: boolean = false;
  /**
   * Constructs a new PlainView wrapped on an element.
   *
   * @param elem the element
   */
  _PlainView(elem: Element): this {
    this._View(elem);
    this.drawLineOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawLine', PlainView$FPMethodArgs.IGNN);
    this.drawSelectedTextOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawSelectedText', PlainView$FPMethodArgs.GNNII);
    this.drawUnselectedTextOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawUnselectedText', PlainView$FPMethodArgs.GNNII);
    this.useFloatingPointAPI = this.drawUnselectedTextOverridden || this.drawSelectedTextOverridden;
    return this;
  }
  /**
   * Returns the tab size set for the document, defaulting to 8.
   *
   * @return the tab size
   */
  getTabSize(): number {
    let i = this.getDocument().getProperty(PlainDocument.tabSizeAttribute);
    let size = (i != null) ? (+i) : 8;
    return size;
  }
  /**
   * Renders a line of text, suppressing whitespace at the end
   * and expanding any tabs.  This is implemented to make calls
   * to the methods <code>drawUnselectedText</code> and
   * <code>drawSelectedText</code> so that the way selected and
   * unselected text are rendered can be customized.
   *
   * @param lineIndex the line to draw &gt;= 0
   * @param g the <code>Graphics</code> context
   * @param x the starting X position &gt;= 0
   * @param y the starting Y position &gt;= 0
   * @see #drawUnselectedText
   * @see #drawSelectedText
   *
   * @deprecated replaced by
   *     {@link #drawLine(int, Graphics2D, float, float)}
   */
  drawLine$int$Graphics$int$int(lineIndex: number, g: Graphics, x: number, y: number): void {
    this.drawLineImpl(lineIndex, g, Math.fround(x), Math.fround(y));
  }
  drawLineImpl(lineIndex: number, g: Graphics, x: number, y: number): void {
    let line = this.getElement().getElement(lineIndex);
    let elem: Element;
    try {
      if (line.isLeaf()) {
        this.drawElement(lineIndex, line, g, x, y);
      } else {
        let count = line.getElementCount();
        for (let i = 0; i < count; i++) {
          elem = line.getElement(i);
          x = this.drawElement(lineIndex, elem, g, x, y);
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, BadLocationException)) {
        let e = $J.exc($e0);
        throw new StateInvariantError()._StateInvariantError('Can\'t render line: ' + lineIndex);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Renders a line of text, suppressing whitespace at the end
   * and expanding any tabs.  This is implemented to make calls
   * to the methods {@code drawUnselectedText} and
   * {@code drawSelectedText} so that the way selected and
   * unselected text are rendered can be customized.
   *
   * @param lineIndex the line to draw {@code >= 0}
   * @param g the {@code Graphics} context
   * @param x the starting X position {@code >= 0}
   * @param y the starting Y position {@code >= 0}
   * @see #drawUnselectedText
   * @see #drawSelectedText
   *
   * @since 9
   */
  drawLine$int$Graphics2D$float$float(lineIndex: number, g: Graphics2D, x: number, y: number): void {
    this.drawLineImpl(lineIndex, g, x, y);
  }
  drawElement(lineIndex: number, elem: Element, g: Graphics, x: number, y: number): number {
    let p0 = elem.getStartOffset();
    let p1 = elem.getEndOffset();
    p1 = Math.min(this.getDocument().getLength(), p1);
    if (lineIndex === 0) {
      x = Math.fround(x + this.firstLineOffset);
    }
    let attr = elem.getAttributes();
    if (Utilities.isComposedTextAttributeDefined(attr)) {
      g.setColor(this.unselected);
      x = Utilities.drawComposedText$View$AttributeSet$Graphics$float$float$int$int(this, attr, g, x, y, (p0 - elem.getStartOffset()) | 0, (p1 - elem.getStartOffset()) | 0);
    } else {
      if (this.sel0 === this.sel1 || this.selected === this.unselected) {
        x = this.callDrawUnselectedText(g, x, y, p0, p1);
      } else if ((p0 >= this.sel0 && p0 <= this.sel1) && (p1 >= this.sel0 && p1 <= this.sel1)) {
        x = this.callDrawSelectedText(g, x, y, p0, p1);
      } else if (this.sel0 >= p0 && this.sel0 <= p1) {
        if (this.sel1 >= p0 && this.sel1 <= p1) {
          x = this.callDrawUnselectedText(g, x, y, p0, this.sel0);
          x = this.callDrawSelectedText(g, x, y, this.sel0, this.sel1);
          x = this.callDrawUnselectedText(g, x, y, this.sel1, p1);
        } else {
          x = this.callDrawUnselectedText(g, x, y, p0, this.sel0);
          x = this.callDrawSelectedText(g, x, y, this.sel0, p1);
        }
      } else if (this.sel1 >= p0 && this.sel1 <= p1) {
        x = this.callDrawSelectedText(g, x, y, p0, this.sel1);
        x = this.callDrawUnselectedText(g, x, y, this.sel1, p1);
      } else {
        x = this.callDrawUnselectedText(g, x, y, p0, p1);
      }
    }
    return x;
  }
  /**
   * Renders the given range in the model as normal unselected
   * text.  Uses the foreground or disabled color to render the text.
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param p0 the beginning position in the model &gt;= 0
   * @param p1 the ending position in the model &gt;= 0
   * @return the X location of the end of the range &gt;= 0
   * @throws BadLocationException if the range is invalid
   *
   * @deprecated replaced by
   *     {@link #drawUnselectedText(Graphics2D, float, float, int, int)}
   */
  drawUnselectedText$Graphics$int$int$int$int(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return $J.d2i(this.drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PlainView(g, Math.fround(x), Math.fround(y), p0, p1, false));
  }
  callDrawUnselectedText(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return this.drawUnselectedTextOverridden && (g instanceof Graphics2D) ? this.drawUnselectedText$Graphics2D$float$float$int$int(g, x, y, p0, p1) : Math.fround(this.drawUnselectedText$Graphics$int$int$int$int(g, $J.d2i(x), $J.d2i(y), p0, p1));
  }
  drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PlainView(g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    g.setColor(this.unselected);
    let doc = this.getDocument();
    let s = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(p0, (p1 - p0) | 0, s);
    let ret = Utilities.drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean(this, s, x, y, g, this, p0, null, useFPAPI);
    SegmentCache.releaseSharedSegment(s);
    return ret;
  }
  /**
   * Renders the given range in the model as normal unselected
   * text.  Uses the foreground or disabled color to render the text.
   *
   * @param g the graphics context
   * @param x the starting X coordinate {@code >= 0}
   * @param y the starting Y coordinate {@code >= 0}
   * @param p0 the beginning position in the model {@code >= 0}
   * @param p1 the ending position in the model {@code >= 0}
   * @return the X location of the end of the range {@code >= 0}
   * @throws BadLocationException if the range is invalid
   *
   * @since 9
   */
  drawUnselectedText$Graphics2D$float$float$int$int(g: Graphics2D, x: number, y: number, p0: number, p1: number): number {
    return this.drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PlainView(g, x, y, p0, p1, true);
  }
  /**
   * Renders the given range in the model as selected text.  This
   * is implemented to render the text in the color specified in
   * the hosting component.  It assumes the highlighter will render
   * the selected background.
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param p0 the beginning position in the model &gt;= 0
   * @param p1 the ending position in the model &gt;= 0
   * @return the location of the end of the range
   * @throws BadLocationException if the range is invalid
   *
   * @deprecated replaced by
   *     {@link #drawSelectedText(Graphics2D, float, float, int, int)}
   */
  drawSelectedText$Graphics$int$int$int$int(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return $J.d2i(this.drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PlainView(g, Math.fround(x), Math.fround(y), p0, p1, false));
  }
  callDrawSelectedText(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return this.drawSelectedTextOverridden && g instanceof Graphics2D ? this.drawSelectedText$Graphics2D$float$float$int$int(g, x, y, p0, p1) : Math.fround(this.drawSelectedText$Graphics$int$int$int$int(g, $J.d2i(x), $J.d2i(y), p0, p1));
  }
  drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PlainView(g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    g.setColor(this.selected);
    let doc = this.getDocument();
    let s = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(p0, (p1 - p0) | 0, s);
    let ret = Utilities.drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean(this, s, x, y, g, this, p0, null, useFPAPI);
    SegmentCache.releaseSharedSegment(s);
    return ret;
  }
  /**
   * Renders the given range in the model as selected text.  This
   * is implemented to render the text in the color specified in
   * the hosting component.  It assumes the highlighter will render
   * the selected background.
   *
   * @param g the graphics context
   * @param x the starting X coordinate {@code >= 0}
   * @param y the starting Y coordinate {@code >= 0}
   * @param p0 the beginning position in the model {@code >= 0}
   * @param p1 the ending position in the model {@code >= 0}
   * @return the location of the end of the range
   * @throws BadLocationException if the range is invalid
   *
   * @since 9
   */
  drawSelectedText$Graphics2D$float$float$int$int(g: Graphics2D, x: number, y: number, p0: number, p1: number): number {
    return this.drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PlainView(g, x, y, p0, p1, true);
  }
  /**
   * Checks to see if the font metrics and longest line
   * are up-to-date.
   *
   * @since 1.4
   */
  updateMetrics(): void {
    let host = this.getContainer();
    let f = host.getFont();
    let fm = (this.font == null) ? null : host.getFontMetrics(this.font);
    if (this.font !== f || !Objects.equals(this.metrics, fm)) {
      this.calculateLongestLine();
      if (this.useFloatingPointAPI) {
        let frc = this.metrics.getFontRenderContext();
        let tabWidth = Math.fround(this.font.getStringBounds$String$FontRenderContext('m', frc).getWidth());
        this.tabSize = Math.fround(this.getTabSize() * tabWidth);
      } else {
        this.tabSize = Math.fround(Math.imul(this.getTabSize(), this.metrics.charWidth$char(109 /* 'm' */)));
      }
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
   * @throws IllegalArgumentException for an invalid axis
   */
  getPreferredSpan(axis: number): number {
    this.updateMetrics();
    switch (axis) {
      case View.X_AXIS:
        return Math.fround(this.getLineWidth(this.longLine));
      case View.Y_AXIS:
        return Math.fround(Math.imul(this.getElement().getElementCount(), this.metrics.getHeight()));
      default:
        throw new IllegalArgumentException('Invalid axis: ' + axis);
    }
  }
  /**
   * Renders using the given rendering surface and area on that surface.
   * The view may need to do layout and create child views to enable
   * itself to render into the given allocation.
   *
   * @param g the rendering surface to use
   * @param a the allocated region to render into
   *
   * @see View#paint
   */
  paint(g: Graphics, a: Shape): void {
    let originalA = a;
    a = this.adjustPaintRegion(a);
    let alloc = a;
    this.tabBase = alloc.x_;
    let host = this.getContainer();
    let h = host.getHighlighter();
    g.setFont(host.getFont());
    this.sel0 = host.getSelectionStart();
    this.sel1 = host.getSelectionEnd();
    this.unselected = (host.isEnabled()) ? host.getForeground() : host.getDisabledTextColor();
    let c = host.getCaret();
    this.selected = c.isSelectionVisible() && h != null ? host.getSelectedTextColor() : this.unselected;
    this.updateMetrics();
    let clip = g.getClipBounds$();
    let fontHeight = this.metrics.getHeight();
    let heightBelow = (alloc.y_ + alloc.height_ - (clip.y_ + clip.height_)) | 0;
    let heightAbove = (clip.y_ - alloc.y_) | 0;
    let linesBelow: number;
    let linesAbove: number;
    let linesTotal: number;
    if (fontHeight > 0) {
      linesBelow = Math.max(0, $J.idiv(heightBelow, fontHeight));
      linesAbove = Math.max(0, $J.idiv(heightAbove, fontHeight));
      linesTotal = $J.idiv(alloc.height_, fontHeight);
      if (alloc.height_ % fontHeight !== 0) {
        linesTotal++;
      }
    } else {
      linesBelow = linesAbove = linesTotal = 0;
    }
    let lineArea = this.lineToRect(a, linesAbove);
    let y = (lineArea.y_ + this.metrics.getAscent()) | 0;
    let x = lineArea.x_;
    let map = this.getElement();
    let lineCount = map.getElementCount();
    let endLine = Math.min(lineCount, (linesTotal - linesBelow) | 0);
    lineCount--;
    let dh = (h instanceof LayeredHighlighter) ? h : null;
    for (let line = linesAbove; line < endLine; line++) {
      if (dh != null) {
        let lineElement = map.getElement(line);
        if (line === lineCount) {
          dh.paintLayeredHighlights(g, lineElement.getStartOffset(), lineElement.getEndOffset(), originalA, host, this);
        } else {
          dh.paintLayeredHighlights(g, lineElement.getStartOffset(), (lineElement.getEndOffset() - 1) | 0, originalA, host, this);
        }
      }
      if (this.drawLineOverridden && (g instanceof Graphics2D)) {
        this.drawLine$int$Graphics2D$float$float(line, g, Math.fround(x), Math.fround(y));
      } else {
        this.drawLine$int$Graphics$int$int(line, g, x, y);
      }
      y = (y + fontHeight) | 0;
      if (line === 0) {
        x = (x - this.firstLineOffset) | 0;
      }
    }
  }
  /**
   * Should return a shape ideal for painting based on the passed in
   * Shape <code>a</code>. This is useful if painting in a different
   * region. The default implementation returns <code>a</code>.
   */
  adjustPaintRegion(a: Shape): Shape {
    return a;
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert &gt;= 0
   * @param a the allocated region to render into
   * @return the bounding box of the given position
   * @throws BadLocationException  if the given position does not
   *   represent a valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    let doc = this.getDocument();
    let map = this.getElement();
    let lineIndex = map.getElementIndex(pos);
    if (lineIndex < 0) {
      return this.lineToRect(a, 0);
    }
    let lineArea = this.lineToRect(a, lineIndex);
    this.tabBase = lineArea.x_;
    let line = map.getElement(lineIndex);
    let p0 = line.getStartOffset();
    let s = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(p0, (pos - p0) | 0, s);
    if (this.useFloatingPointAPI) {
      let xOffs = Utilities.getTabbedTextWidth$Segment$FontMetrics$float$TabExpander$int(s, this.metrics, Math.fround(this.tabBase), this, p0);
      SegmentCache.releaseSharedSegment(s);
      return new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(Math.fround(lineArea.x_ + xOffs), Math.fround(lineArea.y_), 1, Math.fround(this.metrics.getHeight()));
    }
    let xOffs = Utilities.getTabbedTextWidth$Segment$FontMetrics$int$TabExpander$int(s, this.metrics, this.tabBase, this, p0);
    SegmentCache.releaseSharedSegment(s);
    lineArea.x_ = (lineArea.x_ + xOffs) | 0;
    lineArea.width_ = 1;
    lineArea.height_ = this.metrics.getHeight();
    return lineArea;
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *  given point in the view &gt;= 0
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, bias: Position$Bias[]): number {
    bias[0] = Position$Bias.Forward;
    let alloc = a.getBounds();
    let doc = this.getDocument();
    if (y < Math.fround(alloc.y_)) {
      return this.getStartOffset();
    } else if (y > Math.fround((alloc.y_ + alloc.height_) | 0)) {
      return (this.getEndOffset() - 1) | 0;
    } else {
      let map = doc.getDefaultRootElement();
      let fontHeight = this.metrics.getHeight();
      let lineIndex = (fontHeight > 0 ? $J.d2i(Math.fround(Math.abs(Math.fround((Math.fround(y - alloc.y_)) / fontHeight)))) : (map.getElementCount() - 1) | 0);
      if (lineIndex >= map.getElementCount()) {
        return (this.getEndOffset() - 1) | 0;
      }
      let line = map.getElement(lineIndex);
      let dx = 0;
      if (lineIndex === 0) {
        alloc.x_ = (alloc.x_ + this.firstLineOffset) | 0;
        alloc.width_ = (alloc.width_ - this.firstLineOffset) | 0;
      }
      if (x < Math.fround(alloc.x_)) {
        return line.getStartOffset();
      } else if (x > Math.fround((alloc.x_ + alloc.width_) | 0)) {
        return (line.getEndOffset() - 1) | 0;
      } else {
        try {
          let p0 = line.getStartOffset();
          let p1 = (line.getEndOffset() - 1) | 0;
          let s = SegmentCache.getSharedSegment();
          doc.getText$int$int$Segment(p0, (p1 - p0) | 0, s);
          this.tabBase = alloc.x_;
          let offs = (p0 + Utilities.getTabbedTextOffset$Segment$FontMetrics$float$float$TabExpander$int$boolean(s, this.metrics, Math.fround(this.tabBase), x, this, p0, true)) | 0;
          SegmentCache.releaseSharedSegment(s);
          return offs;
        } catch ($e1) {
          if ($J.isa($e1, BadLocationException)) {
            let e = $J.exc($e1);
            return -1;
          } else {
            throw $e1;
          }
        }
      }
    }
  }
  /**
   * Gives notification that something was inserted into the document
   * in a location that this view is responsible for.
   *
   * @param changes the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#insertUpdate
   */
  insertUpdate(changes: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.updateDamage(changes, a, f);
  }
  /**
   * Gives notification that something was removed from the document
   * in a location that this view is responsible for.
   *
   * @param changes the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#removeUpdate
   */
  removeUpdate(changes: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.updateDamage(changes, a, f);
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param changes the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#changedUpdate
   */
  changedUpdate(changes: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.updateDamage(changes, a, f);
  }
  /**
   * Sets the size of the view.  This should cause
   * layout of the view along the given axis, if it
   * has any layout duties.
   *
   * @param width the width &gt;= 0
   * @param height the height &gt;= 0
   */
  setSize(width: number, height: number): void {
    super.setSize(width, height);
    this.updateMetrics();
  }
  /**
   * Returns the next tab stop position after a given reference position.
   * This implementation does not support things like centering so it
   * ignores the tabOffset argument.
   *
   * @param x the current position &gt;= 0
   * @param tabOffset the position within the text stream
   *   that the tab occurred at &gt;= 0.
   * @return the tab stop, measured in points &gt;= 0
   */
  nextTabStop(x: number, tabOffset: number): number {
    if (this.tabSize === Math.fround(0)) {
      return x;
    }
    let ntabs = $J.d2i((Math.fround((Math.fround(x - this.tabBase)) / this.tabSize)));
    return Math.fround(this.tabBase + (Math.fround(((ntabs + 1) | 0) * this.tabSize)));
  }
  /**
   * Repaint the region of change covered by the given document
   * event.  Damages the line that begins the range to cover
   * the case when the insert/remove is only on one line.
   * If lines are added or removed, damages the whole
   * view.  The longest line is checked to see if it has
   * changed.
   *
   * @param changes the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @since 1.4
   */
  updateDamage(changes: DocumentEvent, a: Shape, f: ViewFactory): void {
    let host = this.getContainer();
    this.updateMetrics();
    let elem = this.getElement();
    let ec = changes.getChange(elem);
    let added = (ec != null) ? ec.getChildrenAdded() : null;
    let removed = (ec != null) ? ec.getChildrenRemoved() : null;
    if (((added != null) && (added.length > 0)) || ((removed != null) && (removed.length > 0))) {
      if (added != null) {
        let currWide = this.getLineWidth(this.longLine);
        for (let i = 0; i < added.length; i++) {
          let w = this.getLineWidth(added[i]);
          if (w > currWide) {
            currWide = w;
            this.longLine = added[i];
          }
        }
      }
      if (removed != null) {
        for (let i = 0; i < removed.length; i++) {
          if (removed[i] === this.longLine) {
            this.calculateLongestLine();
            break;
          }
        }
      }
      this.preferenceChanged(null, true, true);
      host.repaint$();
    } else {
      let map = this.getElement();
      let line = map.getElementIndex(changes.getOffset());
      this.damageLineRange(line, line, a, host);
      if (changes.getType() === DocumentEvent$EventType.INSERT) {
        let w = this.getLineWidth(this.longLine);
        let e = map.getElement(line);
        if (e === this.longLine) {
          this.preferenceChanged(null, true, false);
        } else if (this.getLineWidth(e) > w) {
          this.longLine = e;
          this.preferenceChanged(null, true, false);
        }
      } else if (changes.getType() === DocumentEvent$EventType.REMOVE) {
        if (map.getElement(line) === this.longLine) {
          this.calculateLongestLine();
          this.preferenceChanged(null, true, false);
        }
      }
    }
  }
  /**
   * Repaint the given line range.
   *
   * @param host the component hosting the view (used to call repaint)
   * @param a  the region allocated for the view to render into
   * @param line0 the starting line number to repaint.  This must
   *   be a valid line number in the model.
   * @param line1 the ending line number to repaint.  This must
   *   be a valid line number in the model.
   * @since 1.4
   */
  damageLineRange(line0: number, line1: number, a: Shape, host: Component): void {
    if (a != null) {
      let area0 = this.lineToRect(a, line0);
      let area1 = this.lineToRect(a, line1);
      if ((area0 != null) && (area1 != null)) {
        let damage = area0.union(area1);
        host.repaint$int$int$int$int(damage.x_, damage.y_, damage.width_, damage.height_);
      } else {
        host.repaint$();
      }
    }
  }
  /**
   * Determine the rectangle that represents the given line.
   *
   * @param a  the region allocated for the view to render into
   * @param line the line number to find the region of.  This must
   *   be a valid line number in the model.
   * @return the rectangle that represents the given line
   * @since 1.4
   */
  lineToRect(a: Shape, line: number): Rectangle {
    let r = null;
    this.updateMetrics();
    if (this.metrics != null) {
      let alloc = a.getBounds();
      if (line === 0) {
        alloc.x_ = (alloc.x_ + this.firstLineOffset) | 0;
        alloc.width_ = (alloc.width_ - this.firstLineOffset) | 0;
      }
      r = new Rectangle()._Rectangle$int$int$int$int(alloc.x_, (alloc.y_ + (Math.imul(line, this.metrics.getHeight()))) | 0, alloc.width_, this.metrics.getHeight());
    }
    return r;
  }
  /**
   * Iterate over the lines represented by the child elements
   * of the element this view represents, looking for the line
   * that is the longest.  The <em>longLine</em> variable is updated to
   * represent the longest line contained.  The <em>font</em> variable
   * is updated to indicate the font used to calculate the
   * longest line.
   */
  calculateLongestLine(): void {
    let c = this.getContainer();
    this.font = c.getFont();
    this.metrics = c.getFontMetrics(this.font);
    let doc = this.getDocument();
    let lines = this.getElement();
    let n = lines.getElementCount();
    let maxWidth = -1;
    for (let i = 0; i < n; i++) {
      let line = lines.getElement(i);
      let w = this.getLineWidth(line);
      if (w > maxWidth) {
        maxWidth = w;
        this.longLine = line;
      }
    }
  }
  /**
   * Calculate the width of the line represented by
   * the given element.  It is assumed that the font
   * and font metrics are up-to-date.
   */
  getLineWidth(line: Element): number {
    if (line == null) {
      return 0;
    }
    let p0 = line.getStartOffset();
    let p1 = line.getEndOffset();
    let w: number;
    let s = SegmentCache.getSharedSegment();
    try {
      line.getDocument().getText$int$int$Segment(p0, (p1 - p0) | 0, s);
      w = Utilities.getTabbedTextWidth$Segment$FontMetrics$int$TabExpander$int(s, this.metrics, this.tabBase, this, p0);
    } catch ($e2) {
      if ($J.isa($e2, BadLocationException)) {
        let ble = $J.exc($e2);
        w = 0;
      } else {
        throw $e2;
      }
    }
    SegmentCache.releaseSharedSegment(s);
    return w;
  }
  static getFPMethodOverridden(cls: JClass<any>, method: string, methodArgs: PlainView$FPMethodArgs): boolean {
    let map = null;
    let initialized = PlainView.methodsOverriddenMapRef != null && (map = PlainView.methodsOverriddenMapRef.get()) != null;
    if (!initialized) {
      map = new HashMap();
      PlainView.methodsOverriddenMapRef = new SoftReference(map);
    }
    let key = new PlainView$FPMethodItem()._PlainView$FPMethodItem(cls, method);
    let isFPMethodOverridden = map.get(key);
    if (isFPMethodOverridden == null) {
      isFPMethodOverridden = PlainView.checkFPMethodOverridden(cls, method, methodArgs);
      map.put(key, isFPMethodOverridden);
    }
    return isFPMethodOverridden;
  }
  static checkFPMethodOverridden(className: JClass<any>, methodName: string, methodArgs: PlainView$FPMethodArgs): boolean {
    return AccessController.doPrivileged(new (PlainView$1())().$c(methodName, className, methodArgs));
  }
  static isFPMethodOverridden(method: string, cls: JClass<any>, intTypes: JClass<any>[], fpTypes: JClass<any>[]): boolean {
    let thisModule = $J.cls(PlainView).getModule();
    while (!$J.equals(thisModule, cls.getModule())) {
      try {
        cls.getDeclaredMethod(method, ...fpTypes);
        return true;
      } catch ($e3) {
        if ($J.isa($e3, Exception)) {
          let e1 = $J.exc($e3);
          try {
            cls.getDeclaredMethod(method, ...intTypes);
            return false;
          } catch ($e4) {
            if ($J.isa($e4, Exception)) {
              let e2 = $J.exc($e4);
              cls = cls.getSuperclass();
            } else {
              throw $e4;
            }
          }
        } else {
          throw $e3;
        }
      }
    }
    return true;
  }
}

export class PlainView$FPMethodArgs extends JEnum {
  static IGNN: PlainView$FPMethodArgs = null;
  static IIGNN: PlainView$FPMethodArgs = null;
  static GNNII: PlainView$FPMethodArgs = null;
  static GNNC: PlainView$FPMethodArgs = null;
  static $VALUES: PlainView$FPMethodArgs[] = null;
  _PlainView$FPMethodArgs($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  getMethodArguments(isFPType: boolean): JClass<any>[] {
    let N = (isFPType) ? $J.cls('float') : $J.cls('int');
    let G = (isFPType) ? $J.cls(Graphics2D) : $J.cls(Graphics);
    switch (this) {
      case PlainView$FPMethodArgs.IGNN:
        return [$J.cls('int'), G, N, N];
      case PlainView$FPMethodArgs.IIGNN:
        return [$J.cls('int'), $J.cls('int'), G, N, N];
      case PlainView$FPMethodArgs.GNNII:
        return [G, N, N, $J.cls('int'), $J.cls('int')];
      case PlainView$FPMethodArgs.GNNC:
        return [G, N, N, $J.cls('char')];
      default:
        throw new RuntimeException('Unknown method arguments!');
    }
  }
  static values(): PlainView$FPMethodArgs[] { return PlainView$FPMethodArgs.$VALUES.slice(); }
  static valueOf(name: string): PlainView$FPMethodArgs { return $J.enumValueOf(PlainView$FPMethodArgs, name); }
  static $clinit() {
    PlainView$FPMethodArgs.IGNN = new PlainView$FPMethodArgs()._PlainView$FPMethodArgs('IGNN', 0);
    PlainView$FPMethodArgs.IIGNN = new PlainView$FPMethodArgs()._PlainView$FPMethodArgs('IIGNN', 1);
    PlainView$FPMethodArgs.GNNII = new PlainView$FPMethodArgs()._PlainView$FPMethodArgs('GNNII', 2);
    PlainView$FPMethodArgs.GNNC = new PlainView$FPMethodArgs()._PlainView$FPMethodArgs('GNNC', 3);
    PlainView$FPMethodArgs.$VALUES = [PlainView$FPMethodArgs.IGNN, PlainView$FPMethodArgs.IIGNN, PlainView$FPMethodArgs.GNNII, PlainView$FPMethodArgs.GNNC];
  }
}

export class PlainView$FPMethodItem extends JObject {
  className: JClass<any> = null;
  methodName: string = null;
  _PlainView$FPMethodItem(className: JClass<any>, methodName: string): this {
    this.className = className;
    this.methodName = methodName;
    return this;
  }
  equals(obj: any): boolean {
    if (obj instanceof PlainView$FPMethodItem) {
      let that = obj;
      return $J.equals(this.className, that.className) && $J.equals(this.methodName, that.methodName);
    }
    return false;
  }
  hashCode(): number {
    return (Math.imul(31, $J.hashCode(this.methodName)) + $J.hashCode(this.className)) | 0;
  }
}

let $PlainView$1: any = null;
/** An anonymous class (PlainView.java:848). */
function PlainView$1(): any {
  return $PlainView$1 ??= $J.local(class extends JObject {
    run(): boolean {
      return PlainView.isFPMethodOverridden(this.$cv_methodName, this.$cv_className, this.$cv_methodArgs.getMethodArguments(false), this.$cv_methodArgs.getMethodArguments(true));
    }
    $c($methodName, $className, $methodArgs): this {
      this.$cv_methodName = $methodName; this.$cv_className = $className; this.$cv_methodArgs = $methodArgs;
      return this;
    }
  }, 'javax.swing.text.PlainView$1', ['java.security.PrivilegedAction']);
}

$J.define(PlainView, 'javax.swing.text.PlainView', { kind: 'class', ifaces: ['javax.swing.text.TabExpander'], sup: 'javax.swing.text.View', ctors: { 'javax.swing.text.Element': '_PlainView' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias', 'drawSelectedText(java.awt.Graphics2D,float,float,int,int)': 'drawSelectedText$Graphics2D$float$float$int$int', 'drawSelectedTextImpl(java.awt.Graphics,float,float,int,int,boolean)': 'drawSelectedTextImpl$Graphics$float$float$int$int$boolean$PlainView', 'drawSelectedText(java.awt.Graphics,int,int,int,int)': 'drawSelectedText$Graphics$int$int$int$int', 'drawUnselectedText(java.awt.Graphics2D,float,float,int,int)': 'drawUnselectedText$Graphics2D$float$float$int$int', 'drawUnselectedTextImpl(java.awt.Graphics,float,float,int,int,boolean)': 'drawUnselectedTextImpl$Graphics$float$float$int$int$boolean$PlainView', 'drawUnselectedText(java.awt.Graphics,int,int,int,int)': 'drawUnselectedText$Graphics$int$int$int$int', 'drawLine(int,java.awt.Graphics2D,float,float)': 'drawLine$int$Graphics2D$float$float', 'drawLine(int,java.awt.Graphics,int,int)': 'drawLine$int$Graphics$int$int' } });
$J.define(PlainView$FPMethodArgs, 'javax.swing.text.PlainView$FPMethodArgs', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_PlainView$FPMethodArgs' }, clinit: true, lazy: ['$VALUES', 'IGNN', 'IIGNN', 'GNNII', 'GNNC'] });
$J.define(PlainView$FPMethodItem, 'javax.swing.text.PlainView$FPMethodItem', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Class,java.lang.String': '_PlainView$FPMethodItem' } });
$J.module(() => {
  Graphics = $J.load('java.awt.Graphics');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Rectangle = $J.load('java.awt.Rectangle');
  Rectangle2D$Float = $J.load('java.awt.geom.Rectangle2D$Float');
  DocumentEvent$EventType = $J.load('javax.swing.event.DocumentEvent$EventType');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  LayeredHighlighter = $J.load('javax.swing.text.LayeredHighlighter');
  PlainDocument = $J.load('javax.swing.text.PlainDocument');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  Utilities = $J.load('javax.swing.text.Utilities');
});
