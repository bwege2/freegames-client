// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/WrappedPlainView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, SoftReference } from '../../../../jre/index.ts';
import { BoxView } from './BoxView.ts';
import { View } from './View.ts';

let Graphics2D, Rectangle2D$Float, BadLocationException, LayeredHighlighter, PlainDocument, PlainView, PlainView$FPMethodArgs, Position$Bias, SegmentCache, StateInvariantError, Utilities;

/**
 * View of plain text (text with only one font and color)
 * that does line-wrapping.  This view expects that its
 * associated element has child elements that represent
 * the lines it should be wrapping.  It is implemented
 * as a vertical box that contains logical line views.
 * The logical line views are nested classes that render
 * the logical line as multiple physical line if the logical
 * line is too wide to fit within the allocation.  The
 * line views draw upon the outer class for its state
 * to reduce their memory requirements.
 * <p>
 * The line views do all of their rendering through the
 * <code>drawLine</code> method which in turn does all of
 * its rendering through the <code>drawSelectedText</code>
 * and <code>drawUnselectedText</code> methods.  This
 * enables subclasses to easily specialize the rendering
 * without concern for the layout aspects.
 *
 * @author  Timothy Prinzing
 * @see     View
 */
export class WrappedPlainView extends BoxView {
  metrics: FontMetrics = null;
  lineBuffer: Segment = null;
  widthChanging: boolean = false;
  tabBase: number = 0;
  tabSize: number = 0;
  wordWrap: boolean = false;
  sel0: number = 0;
  sel1: number = 0;
  unselected: Color = null;
  selected: Color = null;
  drawLineOverridden: boolean = false;
  drawSelectedTextOverridden: boolean = false;
  drawUnselectedTextOverridden: boolean = false;
  useFloatingPointAPI: boolean = false;
  $init_WrappedPlainView() {
    this.drawLineOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawLine', PlainView$FPMethodArgs.IIGNN);
    this.drawSelectedTextOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawSelectedText', PlainView$FPMethodArgs.GNNII);
    this.drawUnselectedTextOverridden = PlainView.getFPMethodOverridden($J.getClass(this), 'drawUnselectedText', PlainView$FPMethodArgs.GNNII);
    this.useFloatingPointAPI = this.drawUnselectedTextOverridden || this.drawSelectedTextOverridden;
  }
  /**
   * Creates a new WrappedPlainView.  Lines will be wrapped
   * on character boundaries.
   *
   * @param elem the element underlying the view
   */
  _WrappedPlainView$Element(elem: Element): this {
    this._WrappedPlainView$Element$boolean(elem, false);
    return this;
  }
  /**
   * Creates a new WrappedPlainView.  Lines can be wrapped on
   * either character or word boundaries depending upon the
   * setting of the wordWrap parameter.
   *
   * @param elem the element underlying the view
   * @param wordWrap should lines be wrapped on word boundaries?
   */
  _WrappedPlainView$Element$boolean(elem: Element, wordWrap: boolean): this {
    this._BoxView(elem, View.Y_AXIS);
    this.$init_WrappedPlainView();
    this.wordWrap = wordWrap;
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
   * @param p0 the starting document location to use &gt;= 0
   * @param p1 the ending document location to use &gt;= p1
   * @param g the graphics context
   * @param x the starting X position &gt;= 0
   * @param y the starting Y position &gt;= 0
   * @see #drawUnselectedText
   * @see #drawSelectedText
   *
   * @deprecated replaced by
   *     {@link #drawLine(int, int, Graphics2D, float, float)}
   */
  drawLine$int$int$Graphics$int$int(p0: number, p1: number, g: Graphics, x: number, y: number): void {
    this.drawLineImpl(p0, p1, g, Math.fround(x), Math.fround(y), false);
  }
  drawLineImpl(p0: number, p1: number, g: Graphics, x: number, y: number, useFPAPI: boolean): void {
    let lineMap = this.getElement();
    let line = lineMap.getElement(lineMap.getElementIndex(p0));
    let elem: Element;
    try {
      if (line.isLeaf()) {
        this.drawText(line, p0, p1, g, x, y);
      } else {
        let idx = line.getElementIndex(p0);
        let lastIdx = line.getElementIndex(p1);
        for (; idx <= lastIdx; idx++) {
          elem = line.getElement(idx);
          let start = Math.max(elem.getStartOffset(), p0);
          let end = Math.min(elem.getEndOffset(), p1);
          x = this.drawText(elem, start, end, g, x, y);
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, BadLocationException)) {
        let e = $J.exc($e0);
        throw new StateInvariantError()._StateInvariantError('Can\'t render: ' + p0 + ',' + p1);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Renders a line of text, suppressing whitespace at the end
   * and expanding any tabs.  This is implemented to make calls
   * to the methods <code>drawUnselectedText</code> and
   * <code>drawSelectedText</code> so that the way selected and
   * unselected text are rendered can be customized.
   *
   * @param p0 the starting document location to use &gt;= 0
   * @param p1 the ending document location to use &gt;= p1
   * @param g the graphics context
   * @param x the starting X position &gt;= 0
   * @param y the starting Y position &gt;= 0
   * @see #drawUnselectedText
   * @see #drawSelectedText
   *
   * @since 9
   */
  drawLine$int$int$Graphics2D$float$float(p0: number, p1: number, g: Graphics2D, x: number, y: number): void {
    this.drawLineImpl(p0, p1, g, x, y, true);
  }
  drawText(elem: Element, p0: number, p1: number, g: Graphics, x: number, y: number): number {
    p1 = Math.min(this.getDocument().getLength(), p1);
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
   * text.
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param p0 the beginning position in the model &gt;= 0
   * @param p1 the ending position in the model &gt;= p0
   * @return the X location of the end of the range &gt;= 0
   * @throws BadLocationException if the range is invalid
   *
   * @deprecated replaced by
   *     {@link #drawUnselectedText(Graphics2D, float, float, int, int)}
   */
  drawUnselectedText$Graphics$int$int$int$int(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return $J.d2i(this.drawUnselectedTextImpl(g, Math.fround(x), Math.fround(y), p0, p1, false));
  }
  callDrawUnselectedText(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return this.drawUnselectedTextOverridden && g instanceof Graphics2D ? this.drawUnselectedText$Graphics2D$float$float$int$int(g, x, y, p0, p1) : Math.fround(this.drawUnselectedText$Graphics$int$int$int$int(g, $J.d2i(x), $J.d2i(y), p0, p1));
  }
  drawUnselectedTextImpl(g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    g.setColor(this.unselected);
    let doc = this.getDocument();
    let segment = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(p0, (p1 - p0) | 0, segment);
    let ret = Utilities.drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean(this, segment, x, y, g, this, p0, null, useFPAPI);
    SegmentCache.releaseSharedSegment(segment);
    return ret;
  }
  /**
   * Renders the given range in the model as normal unselected
   * text.
   *
   * @param g the graphics context
   * @param x the starting X coordinate &gt;= 0
   * @param y the starting Y coordinate &gt;= 0
   * @param p0 the beginning position in the model &gt;= 0
   * @param p1 the ending position in the model &gt;= p0
   * @return the X location of the end of the range &gt;= 0
   * @throws BadLocationException if the range is invalid
   *
   * @since 9
   */
  drawUnselectedText$Graphics2D$float$float$int$int(g: Graphics2D, x: number, y: number, p0: number, p1: number): number {
    return this.drawUnselectedTextImpl(g, x, y, p0, p1, true);
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
   * @param p1 the ending position in the model &gt;= p0
   * @return the location of the end of the range.
   * @throws BadLocationException if the range is invalid
   *
   * @deprecated replaced by
   *     {@link #drawSelectedText(Graphics2D, float, float, int, int)}
   */
  drawSelectedText$Graphics$int$int$int$int(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return $J.d2i(this.drawSelectedTextImpl(g, Math.fround(x), Math.fround(y), p0, p1, false));
  }
  callDrawSelectedText(g: Graphics, x: number, y: number, p0: number, p1: number): number {
    return this.drawSelectedTextOverridden && g instanceof Graphics2D ? this.drawSelectedText$Graphics2D$float$float$int$int(g, x, y, p0, p1) : Math.fround(this.drawSelectedText$Graphics$int$int$int$int(g, $J.d2i(x), $J.d2i(y), p0, p1));
  }
  drawSelectedTextImpl(g: Graphics, x: number, y: number, p0: number, p1: number, useFPAPI: boolean): number {
    g.setColor(this.selected);
    let doc = this.getDocument();
    let segment = SegmentCache.getSharedSegment();
    doc.getText$int$int$Segment(p0, (p1 - p0) | 0, segment);
    let ret = Utilities.drawTabbedText$View$Segment$float$float$Graphics$TabExpander$int$intArr$boolean(this, segment, x, y, g, this, p0, null, useFPAPI);
    SegmentCache.releaseSharedSegment(segment);
    return ret;
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
   * @param p1 the ending position in the model &gt;= p0
   * @return the location of the end of the range.
   * @throws BadLocationException if the range is invalid
   *
   * @since 9
   */
  drawSelectedText$Graphics2D$float$float$int$int(g: Graphics2D, x: number, y: number, p0: number, p1: number): number {
    return this.drawSelectedTextImpl(g, x, y, p0, p1, true);
  }
  /**
   * This is called by the nested wrapped line
   * views to determine the break location.  This can
   * be reimplemented to alter the breaking behavior.
   * It will either break at word or character boundaries
   * depending upon the break argument given at
   * construction.
   * @param p0 the starting document location
   * @param p1 the ending document location to use
   * @return the break position
   */
  calculateBreakPosition(p0: number, p1: number): number {
    let p: number;
    let segment = SegmentCache.getSharedSegment();
    this.loadText(segment, p0, p1);
    let currentWidth = this.getWidth();
    if (this.wordWrap) {
      p = (p0 + Utilities.getBreakLocation$Segment$FontMetrics$float$float$TabExpander$int(segment, this.metrics, Math.fround(this.tabBase), Math.fround(((this.tabBase + currentWidth) | 0)), this, p0)) | 0;
    } else {
      p = (p0 + Utilities.getTabbedTextOffset$Segment$FontMetrics$float$float$TabExpander$int$boolean(segment, this.metrics, Math.fround(this.tabBase), Math.fround(((this.tabBase + currentWidth) | 0)), this, p0, false)) | 0;
    }
    SegmentCache.releaseSharedSegment(segment);
    return p;
  }
  /**
   * Loads all of the children to initialize the view.
   * This is called by the <code>setParent</code> method.
   * Subclasses can reimplement this to initialize their
   * child views in a different manner.  The default
   * implementation creates a child view for each
   * child element.
   *
   * @param f the view factory
   */
  loadChildren(f: ViewFactory): void {
    let e = this.getElement();
    let n = e.getElementCount();
    if (n > 0) {
      let added = $J.newArray(n, null);
      for (let i = 0; i < n; i++) {
        added[i] = new WrappedPlainView$WrappedLine().$o(this)._WrappedPlainView$WrappedLine(e.getElement(i));
      }
      this.replace(0, 0, added);
    }
  }
  /**
   * Update the child views in response to a
   * document event.
   */
  updateChildren$DocumentEvent$Shape(e: DocumentEvent, a: Shape): void {
    let elem = this.getElement();
    let ec = e.getChange(elem);
    if (ec != null) {
      let removedElems = ec.getChildrenRemoved();
      let addedElems = ec.getChildrenAdded();
      let added = $J.newArray(addedElems.length, null);
      for (let i = 0; i < addedElems.length; i++) {
        added[i] = new WrappedPlainView$WrappedLine().$o(this)._WrappedPlainView$WrappedLine(addedElems[i]);
      }
      this.replace(ec.getIndex(), removedElems.length, added);
      if (a != null) {
        this.preferenceChanged(null, true, true);
        this.getContainer().repaint$();
      }
    }
    this.updateMetrics();
  }
  /**
   * Load the text buffer with the given range
   * of text.  This is used by the fragments
   * broken off of this view as well as this
   * view itself.
   */
  loadText(segment: Segment, p0: number, p1: number): void {
    try {
      let doc = this.getDocument();
      doc.getText$int$int$Segment(p0, (p1 - p0) | 0, segment);
    } catch ($e1) {
      if ($J.isa($e1, BadLocationException)) {
        let bl = $J.exc($e1);
        throw new StateInvariantError()._StateInvariantError('Can\'t get line text');
      } else {
        throw $e1;
      }
    }
  }
  updateMetrics(): void {
    let host = this.getContainer();
    let f = host.getFont();
    this.metrics = host.getFontMetrics(f);
    if (this.useFloatingPointAPI) {
      let frc = this.metrics.getFontRenderContext();
      let tabWidth = Math.fround(f.getStringBounds$String$FontRenderContext('m', frc).getWidth());
      this.tabSize = Math.fround(this.getTabSize() * tabWidth);
    } else {
      this.tabSize = Math.fround(Math.imul(this.getTabSize(), this.metrics.charWidth$char(109 /* 'm' */)));
    }
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
   * Renders using the given rendering surface and area
   * on that surface.  This is implemented to stash the
   * selection positions, selection colors, and font
   * metrics for the nested lines to use.
   *
   * @param g the rendering surface to use
   * @param a the allocated region to render into
   *
   * @see View#paint
   */
  paint(g: Graphics, a: Shape): void {
    let alloc = a;
    this.tabBase = alloc.x_;
    let host = this.getContainer();
    this.sel0 = host.getSelectionStart();
    this.sel1 = host.getSelectionEnd();
    this.unselected = (host.isEnabled()) ? host.getForeground() : host.getDisabledTextColor();
    let c = host.getCaret();
    this.selected = c.isSelectionVisible() && host.getHighlighter() != null ? host.getSelectedTextColor() : this.unselected;
    g.setFont(host.getFont());
    super.paint(g, a);
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
    this.updateMetrics();
    if ($J.d2i(width) !== this.getWidth()) {
      this.preferenceChanged(null, true, true);
      this.widthChanging = true;
    }
    super.setSize(width, height);
    this.widthChanging = false;
  }
  /**
   * Determines the preferred span for this view along an
   * axis.  This is implemented to provide the superclass
   * behavior after first making sure that the current font
   * metrics are cached (for the nested lines which use
   * the metrics to determine the height of the potentially
   * wrapped lines).
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return  the span the view would like to be rendered into.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @see View#getPreferredSpan
   */
  getPreferredSpan(axis: number): number {
    this.updateMetrics();
    return super.getPreferredSpan(axis);
  }
  /**
   * Determines the minimum span for this view along an
   * axis.  This is implemented to provide the superclass
   * behavior after first making sure that the current font
   * metrics are cached (for the nested lines which use
   * the metrics to determine the height of the potentially
   * wrapped lines).
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return  the span the view would like to be rendered into.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @see View#getMinimumSpan
   */
  getMinimumSpan(axis: number): number {
    this.updateMetrics();
    return super.getMinimumSpan(axis);
  }
  /**
   * Determines the maximum span for this view along an
   * axis.  This is implemented to provide the superclass
   * behavior after first making sure that the current font
   * metrics are cached (for the nested lines which use
   * the metrics to determine the height of the potentially
   * wrapped lines).
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return  the span the view would like to be rendered into.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @see View#getMaximumSpan
   */
  getMaximumSpan(axis: number): number {
    this.updateMetrics();
    return super.getMaximumSpan(axis);
  }
  /**
   * Gives notification that something was inserted into the
   * document in a location that this view is responsible for.
   * This is implemented to simply update the children.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#insertUpdate
   */
  insertUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.updateChildren$DocumentEvent$Shape(e, a);
    let alloc = ((a != null) && this.isAllocationValid()) ? this.getInsideAllocation(a) : null;
    let pos = e.getOffset();
    let v = this.getViewAtPosition(pos, alloc);
    if (v != null) {
      v.insertUpdate(e, alloc, f);
    }
  }
  /**
   * Gives notification that something was removed from the
   * document in a location that this view is responsible for.
   * This is implemented to simply update the children.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#removeUpdate
   */
  removeUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.updateChildren$DocumentEvent$Shape(e, a);
    let alloc = ((a != null) && this.isAllocationValid()) ? this.getInsideAllocation(a) : null;
    let pos = e.getOffset();
    let v = this.getViewAtPosition(pos, alloc);
    if (v != null) {
      v.removeUpdate(e, alloc, f);
    }
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#changedUpdate
   */
  changedUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.updateChildren$DocumentEvent$Shape(e, a);
  }
}

/**
 * Simple view of a line that wraps if it doesn't
 * fit within the horizontal space allocated.
 * This class tries to be lightweight by carrying little
 * state of its own and sharing the state of the outer class
 * with its siblings.
 */
export class WrappedPlainView$WrappedLine extends View {
  lineCount: number = 0;
  lineCache: SoftReference<number[]> = null;
  _WrappedPlainView$WrappedLine(elem: Element): this {
    this._View(elem);
    this.lineCache = null;
    this.lineCount = -1;
    return this;
  }
  /**
   * Determines the preferred span for this view along an
   * axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return   the span the view would like to be rendered into.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @see View#getPreferredSpan
   */
  getPreferredSpan(axis: number): number {
    {
      let width: number;
      switch (axis) {
        case View.X_AXIS:
          width = Math.fround(this.$outer.getWidth());
          if (width === Math.fround(2147483647)) {
            return 100;
          }
          return width;
        case View.Y_AXIS:
          if (this.lineCount < 0 || this.$outer.widthChanging) {
            this.breakLines(this.getStartOffset());
          }
          return Math.fround(Math.imul(this.lineCount, this.$outer.metrics.getHeight()));
        default:
          throw new IllegalArgumentException('Invalid axis: ' + axis);
      }
    }
  }
  /**
   * Renders using the given rendering surface and area on that
   * surface.  The view may need to do layout and create child
   * views to enable itself to render into the given allocation.
   *
   * @param g the rendering surface to use
   * @param a the allocated region to render into
   * @see View#paint
   */
  paint(g: Graphics, a: Shape): void {
    let alloc = a;
    let y = (alloc.y_ + this.$outer.metrics.getAscent()) | 0;
    let x = alloc.x_;
    let host = this.getContainer();
    let h = host.getHighlighter();
    let dh = (h instanceof LayeredHighlighter) ? h : null;
    let start = this.getStartOffset();
    let end = this.getEndOffset();
    let p0 = start;
    let lineEnds = this.getLineEnds();
    let useDrawLineFP = this.$outer.drawLineOverridden && g instanceof Graphics2D;
    for (let i = 0; i < this.lineCount; i++) {
      let p1 = (lineEnds == null) ? end : (start + lineEnds[i]) | 0;
      if (dh != null) {
        let hOffset = (p1 === end) ? ((p1 - 1) | 0) : p1;
        dh.paintLayeredHighlights(g, p0, hOffset, a, host, this);
      }
      if (useDrawLineFP) {
        this.$outer.drawLine$int$int$Graphics2D$float$float(p0, p1, g, Math.fround(x), Math.fround(y));
      } else {
        this.$outer.drawLine$int$int$Graphics$int$int(p0, p1, g, x, y);
      }
      p0 = p1;
      y = (y + this.$outer.metrics.getHeight()) | 0;
    }
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert
   * @param a the allocated region to render into
   * @return the bounding box of the given position is returned
   * @throws BadLocationException  if the given position does not represent a
   *   valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    let alloc = a.getBounds();
    alloc.height_ = this.$outer.metrics.getHeight();
    alloc.width_ = 1;
    let p0 = this.getStartOffset();
    if (pos < p0 || pos > this.getEndOffset()) {
      throw new BadLocationException()._BadLocationException('Position out of range', pos);
    }
    let testP = (b === Position$Bias.Forward) ? pos : Math.max(p0, (pos - 1) | 0);
    let line = 0;
    let lineEnds = this.getLineEnds();
    if (lineEnds != null) {
      line = this.findLine$int$WrappedPlainView_WrappedLine((testP - p0) | 0);
      if (line > 0) {
        p0 = (p0 + (lineEnds[(line - 1) | 0])) | 0;
      }
      alloc.y_ = (alloc.y_ + Math.imul(alloc.height_, line)) | 0;
    }
    if (pos > p0) {
      let segment = SegmentCache.getSharedSegment();
      this.$outer.loadText(segment, p0, pos);
      let x = Math.fround(alloc.x_);
      x = Math.fround(x + Utilities.getTabbedTextWidth$Segment$FontMetrics$float$TabExpander$int(segment, this.$outer.metrics, x, this.$outer, p0));
      SegmentCache.releaseSharedSegment(segment);
      return new Rectangle2D$Float()._Rectangle2D$Float$float$float$float$float(x, Math.fround(alloc.y_), Math.fround(alloc.width_), Math.fround(alloc.height_));
    }
    return alloc;
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param fx the X coordinate
   * @param fy the Y coordinate
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *  given point in the view
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(fx: number, fy: number, a: Shape, bias: Position$Bias[]): number {
    bias[0] = Position$Bias.Forward;
    let alloc = a;
    let x = $J.d2i(fx);
    let y = $J.d2i(fy);
    if (y < alloc.y_) {
      return this.getStartOffset();
    } else if (y > ((alloc.y_ + alloc.height_) | 0)) {
      return (this.getEndOffset() - 1) | 0;
    } else {
      alloc.height_ = this.$outer.metrics.getHeight();
      let line = (alloc.height_ > 0 ? $J.idiv(((y - alloc.y_) | 0), alloc.height_) : (this.lineCount - 1) | 0);
      if (line >= this.lineCount) {
        return (this.getEndOffset() - 1) | 0;
      } else {
        let p0 = this.getStartOffset();
        let p1: number;
        if (this.lineCount === 1) {
          p1 = this.getEndOffset();
        } else {
          let lineEnds = this.getLineEnds();
          p1 = (p0 + lineEnds[line]) | 0;
          if (line > 0) {
            p0 = (p0 + (lineEnds[(line - 1) | 0])) | 0;
          }
        }
        if (x < alloc.x_) {
          return p0;
        } else if (x > ((alloc.x_ + alloc.width_) | 0)) {
          return (p1 - 1) | 0;
        } else {
          let segment = SegmentCache.getSharedSegment();
          this.$outer.loadText(segment, p0, p1);
          let n = Utilities.getTabbedTextOffset$Segment$FontMetrics$float$float$TabExpander$int$boolean(segment, this.$outer.metrics, Math.fround(alloc.x_), Math.fround(x), this.$outer, p0, false);
          SegmentCache.releaseSharedSegment(segment);
          return Math.min((p0 + n) | 0, (p1 - 1) | 0);
        }
      }
    }
  }
  insertUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.update(e, a);
  }
  removeUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.update(e, a);
  }
  update(ev: DocumentEvent, a: Shape): void {
    let oldCount = this.lineCount;
    this.breakLines(ev.getOffset());
    if (oldCount !== this.lineCount) {
      this.$outer.preferenceChanged(this, false, true);
      this.getContainer().repaint$();
    } else if (a != null) {
      let c = this.getContainer();
      let alloc = a;
      c.repaint$int$int$int$int(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
    }
  }
  /**
   * Returns line cache. If the cache was GC'ed, recreates it.
   * If there's no cache, returns null
   */
  getLineEnds(): number[] {
    if (this.lineCache == null) {
      return null;
    } else {
      let lineEnds = this.lineCache.get();
      if (lineEnds == null) {
        return this.breakLines(this.getStartOffset());
      } else {
        return lineEnds;
      }
    }
  }
  /**
   * Creates line cache if text breaks into more than one physical line.
   * @param startPos position to start breaking from
   * @return the cache created, ot null if text breaks into one line
   */
  breakLines(startPos: number): number[] {
    let lineEnds = (this.lineCache == null) ? null : this.lineCache.get();
    let oldLineEnds = lineEnds;
    let start = this.getStartOffset();
    let lineIndex = 0;
    if (lineEnds != null) {
      lineIndex = this.findLine$int$WrappedPlainView_WrappedLine((startPos - start) | 0);
      if (lineIndex > 0) {
        lineIndex--;
      }
    }
    let p0 = (lineIndex === 0) ? start : (start + (lineEnds[(lineIndex - 1) | 0])) | 0;
    let p1 = this.getEndOffset();
    while (p0 < p1) {
      let p = this.$outer.calculateBreakPosition(p0, p1);
      p0 = (p === p0) ? ++p : p;
      if (lineIndex === 0 && p0 >= p1) {
        this.lineCache = null;
        lineEnds = null;
        lineIndex = 1;
        break;
      } else if (lineEnds == null || lineIndex >= lineEnds.length) {
        let growFactor = (((p1 - start) | 0) / ((p0 - start) | 0));
        let newSize = $J.d2i(Math.ceil(((lineIndex + 1) | 0) * growFactor));
        newSize = Math.max(newSize, (lineIndex + 2) | 0);
        let tmp = $J.newArray(newSize, 0);
        if (lineEnds != null) {
          $J.system_arraycopy(lineEnds, 0, tmp, 0, lineIndex);
        }
        lineEnds = tmp;
      }
      lineEnds[lineIndex++] = (p0 - start) | 0;
    }
    this.lineCount = lineIndex;
    if (this.lineCount > 1) {
      let maxCapacity = (this.lineCount + $J.idiv(this.lineCount, 3)) | 0;
      if (lineEnds.length > maxCapacity) {
        let tmp = $J.newArray(maxCapacity, 0);
        $J.system_arraycopy(lineEnds, 0, tmp, 0, this.lineCount);
        lineEnds = tmp;
      }
    }
    if (lineEnds != null && lineEnds !== oldLineEnds) {
      this.lineCache = new SoftReference(lineEnds);
    }
    return lineEnds;
  }
  /**
   * Binary search in the cache for line containing specified offset
   * (which is relative to the beginning of the view). This method
   * assumes that cache exists.
   */
  findLine$int$WrappedPlainView_WrappedLine(offset: number): number {
    let lineEnds = this.lineCache.get();
    if (offset < lineEnds[0]) {
      return 0;
    } else if (offset > (lineEnds[(this.lineCount - 1) | 0])) {
      return this.lineCount;
    } else {
      return this.findLine$intArr$int$int$int$WrappedPlainView_WrappedLine(lineEnds, offset, 0, (this.lineCount - 1) | 0);
    }
  }
  findLine$intArr$int$int$int$WrappedPlainView_WrappedLine(array: number[], offset: number, min: number, max: number): number {
    if (((max - min) | 0) <= 1) {
      return max;
    } else {
      let mid = $J.idiv(((max + min) | 0), 2);
      return (offset < array[mid]) ? this.findLine$intArr$int$int$int$WrappedPlainView_WrappedLine(array, offset, min, mid) : this.findLine$intArr$int$int$int$WrappedPlainView_WrappedLine(array, offset, mid, max);
    }
  }
}

$J.define(WrappedPlainView, 'javax.swing.text.WrappedPlainView', { kind: 'class', ifaces: ['javax.swing.text.TabExpander'], sup: 'javax.swing.text.BoxView', ctors: { 'javax.swing.text.Element,boolean': '_WrappedPlainView$Element$boolean', 'javax.swing.text.Element': '_WrappedPlainView$Element' }, meths: { 'updateChildren(javax.swing.event.DocumentEvent,java.awt.Shape)': 'updateChildren$DocumentEvent$Shape', 'drawSelectedText(java.awt.Graphics2D,float,float,int,int)': 'drawSelectedText$Graphics2D$float$float$int$int', 'drawSelectedText(java.awt.Graphics,int,int,int,int)': 'drawSelectedText$Graphics$int$int$int$int', 'drawUnselectedText(java.awt.Graphics2D,float,float,int,int)': 'drawUnselectedText$Graphics2D$float$float$int$int', 'drawUnselectedText(java.awt.Graphics,int,int,int,int)': 'drawUnselectedText$Graphics$int$int$int$int', 'drawLine(int,int,java.awt.Graphics2D,float,float)': 'drawLine$int$int$Graphics2D$float$float', 'drawLine(int,int,java.awt.Graphics,int,int)': 'drawLine$int$int$Graphics$int$int' } });
$J.define(WrappedPlainView$WrappedLine, 'javax.swing.text.WrappedPlainView$WrappedLine', { kind: 'class', sup: 'javax.swing.text.View', ctors: { 'javax.swing.text.Element': '_WrappedPlainView$WrappedLine' }, meths: { 'findLine(int[],int,int,int)': 'findLine$intArr$int$int$int$WrappedPlainView_WrappedLine', 'findLine(int)': 'findLine$int$WrappedPlainView_WrappedLine', 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' }, inner: true });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  Rectangle2D$Float = $J.load('java.awt.geom.Rectangle2D$Float');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  LayeredHighlighter = $J.load('javax.swing.text.LayeredHighlighter');
  PlainDocument = $J.load('javax.swing.text.PlainDocument');
  PlainView = $J.load('javax.swing.text.PlainView');
  PlainView$FPMethodArgs = $J.load('javax.swing.text.PlainView$FPMethodArgs');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  Utilities = $J.load('javax.swing.text.Utilities');
});
