// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/ParagraphView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, Throwable } from '../../../../jre/index.ts';
import { FlowView } from './FlowView.ts';
import { BoxView } from './BoxView.ts';

let Rectangle, TextAttribute, SwingConstants, AbstractDocument, BadLocationException, GlyphView, Position$Bias, Segment, StateInvariantError, StyleConstants, TabStop, TabableView, TextLayoutStrategy, View;

/**
 * View of a simple line-wrapping paragraph that supports
 * multiple fonts, colors, components, icons, etc.  It is
 * basically a vertical box with a margin around it.  The
 * contents of the box are a bunch of rows which are special
 * horizontal boxes.  This view creates a collection of
 * views that represent the child elements of the paragraph
 * element.  Each of these views are placed into a row
 * directly if they will fit, otherwise the <code>breakView</code>
 * method is called to try and carve the view into pieces
 * that fit.
 *
 * @author  Timothy Prinzing
 * @author  Scott Violet
 * @author  Igor Kushnirskiy
 * @see     View
 */
export class ParagraphView extends FlowView {
  justification: number = 0;
  lineSpacing: number = 0;
  /**
   * Indentation for the first line, from the left inset.
   */
  firstLineIndent: number = 0;
  /**
   * Used by the TabExpander functionality to determine
   * where to base the tab calculations.  This is basically
   * the location of the left side of the paragraph.
   */
  tabBase: number = 0;
  /**
   * Used to create an i18n-based layout strategy
   */
  static i18nStrategy: JClass<any> = null;
  /**
   * Used for searching for a tab.
   */
  static tabChars: number[] = null;
  /**
   * Used for searching for a tab or decimal character.
   */
  static tabDecimalChars: number[] = null;
  /**
   * Constructs a <code>ParagraphView</code> for the given element.
   *
   * @param elem the element that this view is responsible for
   */
  _ParagraphView(elem: Element): this {
    this._FlowView(elem, View.Y_AXIS);
    this.firstLineIndent = 0;
    this.setPropertiesFromAttributes();
    let doc = elem.getDocument();
    let i18nFlag = doc.getProperty(AbstractDocument.I18NProperty);
    if ((i18nFlag != null) && $J.equals(i18nFlag, true)) {
      try {
        this.strategy = new TextLayoutStrategy()._TextLayoutStrategy();
      } catch ($e0) {
        {
          let e = $J.exc($e0);
          throw new StateInvariantError()._StateInvariantError('ParagraphView: Can\'t create i18n strategy: ' + e.getMessage());
        }
      }
    }
    return this;
  }
  /**
   * Sets the type of justification.
   *
   * @param j one of the following values:
   * <ul>
   * <li><code>StyleConstants.ALIGN_LEFT</code>
   * <li><code>StyleConstants.ALIGN_CENTER</code>
   * <li><code>StyleConstants.ALIGN_RIGHT</code>
   * </ul>
   */
  setJustification(j: number): void {
    this.justification = j;
  }
  /**
   * Sets the line spacing.
   *
   * @param ls the value is a factor of the line height
   */
  setLineSpacing(ls: number): void {
    this.lineSpacing = ls;
  }
  /**
   * Sets the indent on the first line.
   *
   * @param fi the value in points
   */
  setFirstLineIndent(fi: number): void {
    this.firstLineIndent = $J.d2i(fi);
  }
  /**
   * Set the cached properties from the attributes.
   */
  setPropertiesFromAttributes(): void {
    let attr = this.getAttributes();
    if (attr != null) {
      this.setParagraphInsets(attr);
      let a = attr.getAttribute(StyleConstants.Alignment);
      let alignment: number;
      if (a == null) {
        let doc = this.getElement().getDocument();
        let o = doc.getProperty(TextAttribute.RUN_DIRECTION);
        if ((o != null) && $J.equals(o, TextAttribute.RUN_DIRECTION_RTL)) {
          alignment = StyleConstants.ALIGN_RIGHT;
        } else {
          alignment = StyleConstants.ALIGN_LEFT;
        }
      } else {
        alignment = (+a);
      }
      this.setJustification(alignment);
      this.setLineSpacing(StyleConstants.getLineSpacing(attr));
      this.setFirstLineIndent(StyleConstants.getFirstLineIndent(attr));
    }
  }
  /**
   * Returns the number of views that this view is
   * responsible for.
   * The child views of the paragraph are rows which
   * have been used to arrange pieces of the <code>View</code>s
   * that represent the child elements.  This is the number
   * of views that have been tiled in two dimensions,
   * and should be equivalent to the number of child elements
   * to the element this view is responsible for.
   *
   * @return the number of views that this <code>ParagraphView</code>
   *          is responsible for
   */
  getLayoutViewCount(): number {
    return this.layoutPool.getViewCount();
  }
  /**
   * Returns the view at a given <code>index</code>.
   * The child views of the paragraph are rows which
   * have been used to arrange pieces of the <code>Views</code>
   * that represent the child elements.  This methods returns
   * the view responsible for the child element index
   * (prior to breaking).  These are the Views that were
   * produced from a factory (to represent the child
   * elements) and used for layout.
   *
   * @param index the <code>index</code> of the desired view
   * @return the view at <code>index</code>
   */
  getLayoutView(index: number): View {
    return this.layoutPool.getView(index);
  }
  /**
   * Returns the next visual position for the cursor, in
   * either the east or west direction.
   * Overridden from <code>CompositeView</code>.
   * @param pos position into the model
   * @param b either <code>Position.Bias.Forward</code> or
   *          <code>Position.Bias.Backward</code>
   * @param a the allocated region to render into
   * @param direction either <code>SwingConstants.NORTH</code>
   *          or <code>SwingConstants.SOUTH</code>
   * @param biasRet an array containing the bias that were checked
   *  in this method
   * @return the location in the model that represents the
   *  next location visual position
   */
  getNextNorthSouthVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    let vIndex: number;
    if (pos === -1) {
      vIndex = (direction === SwingConstants.NORTH) ? (this.getViewCount() - 1) | 0 : 0;
    } else {
      if (b === Position$Bias.Backward && pos > 0) {
        vIndex = this.getViewIndexAtPosition((pos - 1) | 0);
      } else {
        vIndex = this.getViewIndexAtPosition(pos);
      }
      if (direction === SwingConstants.NORTH) {
        if (vIndex === 0) {
          return -1;
        }
        vIndex--;
      } else if (++vIndex >= this.getViewCount()) {
        return -1;
      }
    }
    let text = this.getContainer();
    let c = text.getCaret();
    let magicPoint: Point;
    magicPoint = (c != null) ? c.getMagicCaretPosition() : null;
    let x: number;
    if (magicPoint == null) {
      let posBounds: Shape;
      try {
        posBounds = text.getUI().modelToView$JTextComponent$int$Bias(text, pos, b);
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let exc = $J.exc($e1);
          posBounds = null;
        } else {
          throw $e1;
        }
      }
      if (posBounds == null) {
        x = 0;
      } else {
        x = posBounds.getBounds().x_;
      }
    } else {
      x = magicPoint.x_;
    }
    return this.getClosestPositionTo(pos, b, a, direction, biasRet, vIndex, x);
  }
  /**
   * Returns the closest model position to <code>x</code>.
   * <code>rowIndex</code> gives the index of the view that corresponds
   * that should be looked in.
   * @param pos  position into the model
   * @param b the bias
   * @param a the allocated region to render into
   * @param direction one of the following values:
   * <ul>
   * <li><code>SwingConstants.NORTH</code>
   * <li><code>SwingConstants.SOUTH</code>
   * </ul>
   * @param biasRet an array containing the bias that were checked
   *  in this method
   * @param rowIndex the index of the view
   * @param x the x coordinate of interest
   * @throws BadLocationException if a bad location is encountered
   * @return the closest model position to <code>x</code>
   */
  getClosestPositionTo(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[], rowIndex: number, x: number): number {
    let text = this.getContainer();
    let doc = this.getDocument();
    let row = this.getView(rowIndex);
    let lastPos = -1;
    biasRet[0] = Position$Bias.Forward;
    for (let vc = 0, numViews = row.getViewCount(); vc < numViews; vc++) {
      let v = row.getView(vc);
      let start = v.getStartOffset();
      let ltr = AbstractDocument.isLeftToRight(doc, start, (start + 1) | 0);
      if (ltr) {
        lastPos = start;
        for (let end = v.getEndOffset(); lastPos < end; lastPos++) {
          let xx = Math.fround(text.modelToView(lastPos).getBounds().x_);
          if (xx >= Math.fround(x)) {
            while (++lastPos < end && Math.fround(text.modelToView(lastPos).getBounds().x_) === xx) {
            }
            return --lastPos;
          }
        }
        lastPos--;
      } else {
        for (lastPos = (v.getEndOffset() - 1) | 0; lastPos >= start; lastPos--) {
          let xx = Math.fround(text.modelToView(lastPos).getBounds().x_);
          if (xx >= Math.fround(x)) {
            while (--lastPos >= start && Math.fround(text.modelToView(lastPos).getBounds().x_) === xx) {
            }
            return ++lastPos;
          }
        }
        lastPos++;
      }
    }
    if (lastPos === -1) {
      return this.getStartOffset();
    }
    return lastPos;
  }
  /**
   * Determines in which direction the next view lays.
   * Consider the <code>View</code> at index n.
   * Typically the <code>View</code>s are laid out
   * from left to right, so that the <code>View</code>
   * to the EAST will be at index n + 1, and the
   * <code>View</code> to the WEST will be at index n - 1.
   * In certain situations, such as with bidirectional text,
   * it is possible that the <code>View</code> to EAST is not
   * at index n + 1, but rather at index n - 1,
   * or that the <code>View</code> to the WEST is not at
   * index n - 1, but index n + 1.  In this case this method
   * would return true, indicating the <code>View</code>s are
   * laid out in descending order.
   * <p>
   * This will return true if the text is laid out right
   * to left at position, otherwise false.
   *
   * @param position position into the model
   * @param bias either <code>Position.Bias.Forward</code> or
   *          <code>Position.Bias.Backward</code>
   * @return true if the text is laid out right to left at
   *         position, otherwise false.
   */
  flipEastAndWestAtEnds(position: number, bias: Position$Bias): boolean {
    let doc = this.getDocument();
    position = this.getStartOffset();
    return !(AbstractDocument.isLeftToRight(doc, position, (position + 1) | 0));
  }
  /**
   * Fetches the constraining span to flow against for
   * the given child index.
   * @param index the index of the view being queried
   * @return the constraining span for the given view at
   *  <code>index</code>
   * @since 1.3
   */
  getFlowSpan(index: number): number {
    let child = this.getView(index);
    let adjust = 0;
    if (child instanceof ParagraphView$Row) {
      let row = child;
      adjust = (row.getLeftInset() + row.getRightInset()) | 0;
    }
    return (this.layoutSpan === 2147483647) ? this.layoutSpan : ((this.layoutSpan - adjust) | 0);
  }
  /**
   * Fetches the location along the flow axis that the
   * flow span will start at.
   * @param index the index of the view being queried
   * @return the location for the given view at
   *  <code>index</code>
   * @since 1.3
   */
  getFlowStart(index: number): number {
    let child = this.getView(index);
    let adjust = 0;
    if (child instanceof ParagraphView$Row) {
      let row = child;
      adjust = row.getLeftInset();
    }
    return (this.tabBase + adjust) | 0;
  }
  /**
   * Create a <code>View</code> that should be used to hold a
   * a row's worth of children in a flow.
   * @return the new <code>View</code>
   * @since 1.3
   */
  createRow(): View {
    return new ParagraphView$Row().$o(this)._ParagraphView$Row(this.getElement());
  }
  /**
   * Returns the next tab stop position given a reference position.
   * This view implements the tab coordinate system, and calls
   * <code>getTabbedSpan</code> on the logical children in the process
   * of layout to determine the desired span of the children.  The
   * logical children can delegate their tab expansion upward to
   * the paragraph which knows how to expand tabs.
   * <code>LabelView</code> is an example of a view that delegates
   * its tab expansion needs upward to the paragraph.
   * <p>
   * This is implemented to try and locate a <code>TabSet</code>
   * in the paragraph element's attribute set.  If one can be
   * found, its settings will be used, otherwise a default expansion
   * will be provided.  The base location for tab expansion
   * is the left inset from the paragraphs most recent allocation
   * (which is what the layout of the children is based upon).
   *
   * @param x the X reference position
   * @param tabOffset the position within the text stream
   *   that the tab occurred at &gt;= 0
   * @return the trailing end of the tab expansion &gt;= 0
   * @see TabSet
   * @see TabStop
   * @see LabelView
   */
  nextTabStop(x: number, tabOffset: number): number {
    if (this.justification !== StyleConstants.ALIGN_LEFT) {
      return Math.fround(x + 10);
    }
    x = Math.fround(x - this.tabBase);
    let tabs = this.getTabSet();
    if (tabs == null) {
      return Math.fround(((this.tabBase + (Math.imul((($J.idiv($J.d2i(x), 72) + 1) | 0), 72))) | 0));
    }
    let tab = tabs.getTabAfter(Math.fround(x + Math.fround(0.01)));
    if (tab == null) {
      return Math.fround(Math.fround(this.tabBase + x) + 5);
    }
    let alignment = tab.getAlignment();
    let offset: number;
    switch (alignment) {
      default:
      case TabStop.ALIGN_LEFT:
        return Math.fround(this.tabBase + tab.getPosition());
      case TabStop.ALIGN_BAR:
        return Math.fround(this.tabBase + tab.getPosition());
      case TabStop.ALIGN_RIGHT:
      case TabStop.ALIGN_CENTER:
        offset = this.findOffsetToCharactersInString(ParagraphView.tabChars, (tabOffset + 1) | 0);
        break;
      case TabStop.ALIGN_DECIMAL:
        offset = this.findOffsetToCharactersInString(ParagraphView.tabDecimalChars, (tabOffset + 1) | 0);
        break;
    }
    if (offset === -1) {
      offset = this.getEndOffset();
    }
    let charsSize = this.getPartialSize((tabOffset + 1) | 0, offset);
    switch (alignment) {
      case TabStop.ALIGN_RIGHT:
      case TabStop.ALIGN_DECIMAL:
        return Math.fround(this.tabBase + Math.max(x, Math.fround(tab.getPosition() - charsSize)));
      case TabStop.ALIGN_CENTER:
        return Math.fround(this.tabBase + Math.max(x, Math.fround(tab.getPosition() - Math.fround(charsSize / 2))));
    }
    return x;
  }
  /**
   * Gets the <code>Tabset</code> to be used in calculating tabs.
   *
   * @return the <code>TabSet</code>
   */
  getTabSet(): TabSet {
    return StyleConstants.getTabSet(this.getElement().getAttributes());
  }
  /**
   * Returns the size used by the views between
   * <code>startOffset</code> and <code>endOffset</code>.
   * This uses <code>getPartialView</code> to calculate the
   * size if the child view implements the
   * <code>TabableView</code> interface. If a
   * size is needed and a <code>View</code> does not implement
   * the <code>TabableView</code> interface,
   * the <code>preferredSpan</code> will be used.
   *
   * @param startOffset the starting document offset &gt;= 0
   * @param endOffset the ending document offset &gt;= startOffset
   * @return the size &gt;= 0
   */
  getPartialSize(startOffset: number, endOffset: number): number {
    let size = 0;
    let viewIndex: number;
    let numViews = this.getViewCount();
    let view: View;
    let viewEnd: number;
    let tempEnd: number;
    viewIndex = this.getElement().getElementIndex(startOffset);
    numViews = this.layoutPool.getViewCount();
    while (startOffset < endOffset && viewIndex < numViews) {
      view = this.layoutPool.getView(viewIndex++);
      viewEnd = view.getEndOffset();
      tempEnd = Math.min(endOffset, viewEnd);
      if ($J.isa(view, TabableView)) {
        size = Math.fround(size + (view).getPartialSpan(startOffset, tempEnd));
      } else if (startOffset === view.getStartOffset() && tempEnd === view.getEndOffset()) {
        size = Math.fround(size + view.getPreferredSpan(View.X_AXIS));
      } else {
        return 0;
      }
      startOffset = viewEnd;
    }
    return size;
  }
  /**
   * Finds the next character in the document with a character in
   * <code>string</code>, starting at offset <code>start</code>. If
   * there are no characters found, -1 will be returned.
   *
   * @param string the string of characters
   * @param start where to start in the model &gt;= 0
   * @return the document offset, or -1 if no characters found
   */
  findOffsetToCharactersInString(string$: number[], start: number): number {
    let stringLength = string$.length;
    let end = this.getEndOffset();
    let seg = new Segment()._Segment$();
    try {
      this.getDocument().getText$int$int$Segment(start, (end - start) | 0, seg);
    } catch ($e2) {
      if ($J.isa($e2, BadLocationException)) {
        let ble = $J.exc($e2);
        return -1;
      } else {
        throw $e2;
      }
    }
    for (let counter = seg.offset, maxCounter = (seg.offset + seg.count_) | 0; counter < maxCounter; counter++) {
      let currentChar = seg.array[counter];
      for (let subCounter = 0; subCounter < stringLength; subCounter++) {
        if (currentChar === string$[subCounter]) {
          return (counter - seg.offset + start) | 0;
        }
      }
    }
    return -1;
  }
  /**
   * Renders using the given rendering surface and area on that
   * surface.  This is implemented to delegate to the superclass
   * after stashing the base coordinate for tab calculations.
   *
   * @param g the rendering surface to use
   * @param a the allocated region to render into
   * @see View#paint
   */
  paint(g: Graphics, a: Shape): void {
    let alloc = (a instanceof Rectangle) ? a : a.getBounds();
    this.tabBase = (alloc.x_ + this.getLeftInset()) | 0;
    super.paint(g, a);
    if (this.firstLineIndent < 0) {
      let sh = this.getChildAllocation(0, a);
      if ((sh != null) && sh.intersects$Rectangle2D(alloc)) {
        let x = (alloc.x_ + this.getLeftInset() + this.firstLineIndent) | 0;
        let y = (alloc.y_ + this.getTopInset()) | 0;
        let clip = g.getClipBounds$();
        this.tempRect.x_ = (x + this.getOffset(View.X_AXIS, 0)) | 0;
        this.tempRect.y_ = (y + this.getOffset(View.Y_AXIS, 0)) | 0;
        this.tempRect.width_ = (this.getSpan(View.X_AXIS, 0) - this.firstLineIndent) | 0;
        this.tempRect.height_ = this.getSpan(View.Y_AXIS, 0);
        if (this.tempRect.intersects$Rectangle(clip)) {
          this.tempRect.x_ = (this.tempRect.x_ - this.firstLineIndent) | 0;
          this.paintChild(g, this.tempRect, 0);
        }
      }
    }
  }
  /**
   * Determines the desired alignment for this view along an
   * axis.  This is implemented to give the alignment to the
   * center of the first row along the y axis, and the default
   * along the x axis.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *   <code>View.Y_AXIS</code>
   * @return the desired alignment.  This should be a value
   *   between 0.0 and 1.0 inclusive, where 0 indicates alignment at the
   *   origin and 1.0 indicates alignment to the full span
   *   away from the origin.  An alignment of 0.5 would be the
   *   center of the view.
   */
  getAlignment(axis: number): number {
    {
      let a: number;
      switch (axis) {
        case View.Y_AXIS:
          a = 0.5;
          if (this.getViewCount() !== 0) {
            let paragraphSpan = $J.d2i(this.getPreferredSpan(View.Y_AXIS));
            let v = this.getView(0);
            let rowSpan = $J.d2i(v.getPreferredSpan(View.Y_AXIS));
            a = (paragraphSpan !== 0) ? Math.fround((Math.fround(($J.idiv(rowSpan, 2)))) / paragraphSpan) : 0;
          }
          return a;
        case View.X_AXIS:
          return 0.5;
        default:
          throw new IllegalArgumentException('Invalid axis: ' + axis);
      }
    }
  }
  /**
   * Calculate the needs for the paragraph along the minor axis.
   *
   * <p>This uses size requirements of the superclass, modified to take into
   * account the non-breakable areas at the adjacent views edges.  The minimal
   * size requirements for such views should be no less than the sum of all
   * adjacent fragments.</p>
   *
   * <p>If the {@code axis} parameter is neither {@code View.X_AXIS} nor
   * {@code View.Y_AXIS}, {@link IllegalArgumentException} is thrown.  If the
   * {@code r} parameter is {@code null,} a new {@code SizeRequirements}
   * object is created, otherwise the supplied {@code SizeRequirements}
   * object is returned.</p>
   *
   * @param axis  the minor axis
   * @param r     the input {@code SizeRequirements} object
   * @return      the new or adjusted {@code SizeRequirements} object
   * @throws IllegalArgumentException  if the {@code axis} parameter is invalid
   */
  calculateMinorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    r = super.calculateMinorAxisRequirements(axis, r);
    let min = 0;
    let glue = 0;
    let n = this.getLayoutViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getLayoutView(i);
      let span = v.getMinimumSpan(axis);
      if (v.getBreakWeight$int$float$float(axis, 0, v.getMaximumSpan(axis)) > View.BadBreakWeight) {
        let p0 = v.getStartOffset();
        let p1 = v.getEndOffset();
        let start = this.findEdgeSpan(v, axis, p0, p0, p1);
        let end = this.findEdgeSpan(v, axis, p1, p0, p1);
        glue = Math.fround(glue + start);
        min = Math.max(min, Math.max(span, glue));
        glue = end;
      } else {
        glue = Math.fround(glue + span);
        min = Math.max(min, glue);
      }
    }
    r.minimum = Math.max(r.minimum, $J.d2i(min));
    r.preferred_ = Math.max(r.minimum, r.preferred_);
    r.maximum = Math.max(r.preferred_, r.maximum);
    return r;
  }
  /**
   * Binary search for the longest non-breakable fragment at the view edge.
   */
  findEdgeSpan(v: View, axis: number, fp: number, p0: number, p1: number): number {
    let len = (p1 - p0) | 0;
    if (len <= 1) {
      return v.getMinimumSpan(axis);
    } else {
      let mid = (p0 + $J.idiv(len, 2)) | 0;
      let startEdge = mid > fp;
      let f = startEdge ? v.createFragment(fp, mid) : v.createFragment(mid, fp);
      let breakable = f.getBreakWeight$int$float$float(axis, 0, f.getMaximumSpan(axis)) > View.BadBreakWeight;
      if (breakable === startEdge) {
        p1 = mid;
      } else {
        p0 = mid;
      }
      return this.findEdgeSpan(f, axis, fp, p0, p1);
    }
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param changes the change information from the
   *  associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#changedUpdate
   */
  changedUpdate(changes: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.setPropertiesFromAttributes();
    this.layoutChanged(View.X_AXIS);
    this.layoutChanged(View.Y_AXIS);
    super.changedUpdate(changes, a, f);
  }
  static $clinit() {
    ParagraphView.tabChars = $J.newArray(1, 0);
    ParagraphView.tabChars[0] = 9 /* \u0009 */;
    ParagraphView.tabDecimalChars = $J.newArray(2, 0);
    ParagraphView.tabDecimalChars[0] = 9 /* \u0009 */;
    ParagraphView.tabDecimalChars[1] = 46 /* '.' */;
  }
}

/**
 * Internally created view that has the purpose of holding
 * the views that represent the children of the paragraph
 * that have been arranged in rows.
 */
export class ParagraphView$Row extends BoxView {
  static readonly SPACE_ADDON: number = 0;
  static readonly SPACE_ADDON_LEFTOVER_END: number = 1;
  static readonly START_JUSTIFIABLE: number = 2;
  static readonly END_JUSTIFIABLE: number = 3;
  justificationData: number[] = null;
  _ParagraphView$Row(elem: Element): this {
    this._BoxView(elem, View.X_AXIS);
    this.justificationData = null;
    return this;
  }
  /**
   * This is reimplemented to do nothing since the
   * paragraph fills in the row with its needed
   * children.
   */
  loadChildren(f: ViewFactory): void {
  }
  /**
   * Fetches the attributes to use when rendering.  This view
   * isn't directly responsible for an element so it returns
   * the outer classes attributes.
   */
  getAttributes(): AttributeSet {
    let p = this.getParent();
    return (p != null) ? p.getAttributes() : null;
  }
  getAlignment(axis: number): number {
    if (axis === View.X_AXIS) {
      {
        let rv: number;
        switch (this.$outer.justification) {
          case StyleConstants.ALIGN_LEFT:
            return 0;
          case StyleConstants.ALIGN_RIGHT:
            return 1;
          case StyleConstants.ALIGN_CENTER:
            return 0.5;
          case StyleConstants.ALIGN_JUSTIFIED:
            rv = 0.5;
            if (this.isJustifiableDocument()) {
              rv = 0;
            }
            return rv;
        }
      }
    }
    return super.getAlignment(axis);
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.  This is
   * implemented to let the superclass find the position along
   * the major axis and the allocation of the row is used
   * along the minor axis, so that even though the children
   * are different heights they all get the same caret height.
   *
   * @param pos the position to convert
   * @param a the allocated region to render into
   * @return the bounding box of the given position
   * @throws BadLocationException  if the given position does not represent a
   *   valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    let r = a.getBounds();
    let v = this.getViewAtPosition(pos, r);
    if ((v != null) && (!v.getElement().isLeaf())) {
      return super.modelToView$int$Shape$Bias(pos, a, b);
    }
    r = a.getBounds();
    let height = r.height_;
    let y = r.y_;
    let loc = super.modelToView$int$Shape$Bias(pos, a, b);
    let bounds = loc.getBounds2D();
    bounds.setRect$double$double$double$double(bounds.getX(), y, bounds.getWidth(), height);
    return bounds;
  }
  /**
   * Range represented by a row in the paragraph is only
   * a subset of the total range of the paragraph element.
   */
  getStartOffset(): number {
    let offs = 2147483647;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      offs = Math.min(offs, v.getStartOffset());
    }
    return offs;
  }
  getEndOffset(): number {
    let offs = 0;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      offs = Math.max(offs, v.getEndOffset());
    }
    return offs;
  }
  /**
   * Perform layout for the minor axis of the box (i.e. the
   * axis orthogonal to the axis that it represents).  The results
   * of the layout should be placed in the given arrays which represent
   * the allocations to the children along the minor axis.
   * <p>
   * This is implemented to do a baseline layout of the children
   * by calling BoxView.baselineLayout.
   *
   * @param targetSpan the total span given to the view, which
   *  would be used to layout the children.
   * @param axis the axis being laid out.
   * @param offsets the offsets from the origin of the view for
   *  each of the child views.  This is a return value and is
   *  filled in by the implementation of this method.
   * @param spans the span of each child view.  This is a return
   *  value and is filled in by the implementation of this method.
   * @return the offset and span for each child view in the
   *  offsets and spans parameters
   */
  layoutMinorAxis(targetSpan: number, axis: number, offsets: number[], spans: number[]): void {
    this.baselineLayout(targetSpan, axis, offsets, spans);
  }
  calculateMinorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    return this.baselineRequirements(axis, r);
  }
  isLastRow(): boolean {
    let parent: View;
    return ((parent = this.getParent()) == null || this === parent.getView((parent.getViewCount() - 1) | 0));
  }
  isBrokenRow(): boolean {
    let rv = false;
    let viewsCount = this.getViewCount();
    if (viewsCount > 0) {
      let lastView = this.getView((viewsCount - 1) | 0);
      if (lastView.getBreakWeight$int$float$float(View.X_AXIS, 0, 0) >= View.ForcedBreakWeight) {
        rv = true;
      }
    }
    return rv;
  }
  isJustifiableDocument(): boolean {
    return (!$J.equals(true, this.getDocument().getProperty(AbstractDocument.I18NProperty)));
  }
  /**
   * Whether we need to justify this {@code Row}.
   * At this time (jdk1.6) we support justification on for non
   * 18n text.
   *
   * @return {@code true} if this {@code Row} should be justified.
   */
  isJustifyEnabled(): boolean {
    let ret = (this.$outer.justification === StyleConstants.ALIGN_JUSTIFIED);
    ret = ret && this.isJustifiableDocument();
    ret = ret && !this.isLastRow();
    ret = ret && !this.isBrokenRow();
    return ret;
  }
  calculateMajorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    let oldJustficationData = this.justificationData;
    this.justificationData = null;
    let ret = super.calculateMajorAxisRequirements(axis, r);
    if (this.isJustifyEnabled()) {
      this.justificationData = oldJustficationData;
    }
    return ret;
  }
  layoutMajorAxis(targetSpan: number, axis: number, offsets: number[], spans: number[]): void {
    let oldJustficationData = this.justificationData;
    this.justificationData = null;
    super.layoutMajorAxis(targetSpan, axis, offsets, spans);
    if (!this.isJustifyEnabled()) {
      return;
    }
    let currentSpan = 0;
    for (let span of spans) {
      currentSpan = (currentSpan + span) | 0;
    }
    if (currentSpan === targetSpan) {
      return;
    }
    let extendableSpaces = 0;
    let startJustifiableContent = -1;
    let endJustifiableContent = -1;
    let lastLeadingSpaces = 0;
    let rowStartOffset = this.getStartOffset();
    let rowEndOffset = this.getEndOffset();
    let spaceMap = $J.newArray((rowEndOffset - rowStartOffset) | 0, 0);
    for (let i = (this.getViewCount() - 1) | 0; i >= 0; i--) {
      let view = this.getView(i);
      if (view instanceof GlyphView) {
        let justificationInfo = (view).getJustificationInfo(rowStartOffset);
        let viewStartOffset = view.getStartOffset();
        let offset = (viewStartOffset - rowStartOffset) | 0;
        for (let j = 0; j < justificationInfo.spaceMap.length(); j++) {
          if (justificationInfo.spaceMap.get(j)) {
            (spaceMap[(j + offset) | 0]) = 1;
          }
        }
        if (startJustifiableContent > 0) {
          if (justificationInfo.end_ >= 0) {
            extendableSpaces = (extendableSpaces + justificationInfo.trailingSpaces) | 0;
          } else {
            lastLeadingSpaces = (lastLeadingSpaces + justificationInfo.trailingSpaces) | 0;
          }
        }
        if (justificationInfo.start_ >= 0) {
          startJustifiableContent = (justificationInfo.start_ + viewStartOffset) | 0;
          extendableSpaces = (extendableSpaces + lastLeadingSpaces) | 0;
        }
        if (justificationInfo.end_ >= 0 && endJustifiableContent < 0) {
          endJustifiableContent = (justificationInfo.end_ + viewStartOffset) | 0;
        }
        extendableSpaces = (extendableSpaces + justificationInfo.contentSpaces) | 0;
        lastLeadingSpaces = justificationInfo.leadingSpaces;
        if (justificationInfo.hasTab) {
          break;
        }
      }
    }
    if (extendableSpaces <= 0) {
      return;
    }
    let adjustment = ((targetSpan - currentSpan) | 0);
    let spaceAddon = (extendableSpaces > 0) ? $J.idiv(adjustment, extendableSpaces) : 0;
    let spaceAddonLeftoverEnd = -1;
    for (let i = (startJustifiableContent - rowStartOffset) | 0, leftover = (adjustment - Math.imul(spaceAddon, extendableSpaces)) | 0; leftover > 0; leftover = (leftover - spaceMap[i]) | 0, i++) {
      spaceAddonLeftoverEnd = i;
    }
    if (spaceAddon > 0 || spaceAddonLeftoverEnd >= 0) {
      this.justificationData = (oldJustficationData != null) ? oldJustficationData : $J.newArray((ParagraphView$Row.END_JUSTIFIABLE + 1) | 0, 0);
      this.justificationData[ParagraphView$Row.SPACE_ADDON] = spaceAddon;
      this.justificationData[ParagraphView$Row.SPACE_ADDON_LEFTOVER_END] = spaceAddonLeftoverEnd;
      this.justificationData[ParagraphView$Row.START_JUSTIFIABLE] = (startJustifiableContent - rowStartOffset) | 0;
      this.justificationData[ParagraphView$Row.END_JUSTIFIABLE] = (endJustifiableContent - rowStartOffset) | 0;
      super.layoutMajorAxis(targetSpan, axis, offsets, spans);
    }
  }
  getMaximumSpan(axis: number): number {
    let ret: number;
    if (View.X_AXIS === axis && this.isJustifyEnabled()) {
      ret = Math.fround(3.4028235E38);
    } else {
      ret = super.getMaximumSpan(axis);
    }
    return ret;
  }
  /**
   * Fetches the child view index representing the given position in
   * the model.
   *
   * @param pos the position &gt;= 0
   * @return  index of the view representing the given position, or
   *   -1 if no view represents that position
   */
  getViewIndexAtPosition(pos: number): number {
    if (pos < this.getStartOffset() || pos >= this.getEndOffset()) {
      return -1;
    }
    for (let counter = (this.getViewCount() - 1) | 0; counter >= 0; counter--) {
      let v = this.getView(counter);
      if (pos >= v.getStartOffset() && pos < v.getEndOffset()) {
        return counter;
      }
    }
    return -1;
  }
  /**
   * Gets the left inset.
   *
   * @return the inset
   */
  getLeftInset(): number {
    let parentView: View;
    let adjustment = 0;
    if ((parentView = this.getParent()) != null) {
      if (this === parentView.getView(0)) {
        adjustment = this.$outer.firstLineIndent;
      }
    }
    return ((((super.getLeftInset() + adjustment) | 0)) << 16) >> 16;
  }
  getBottomInset(): number {
    return (($J.d2i((Math.fround(super.getBottomInset() + Math.fround(((this.minorRequest != null) ? this.minorRequest.preferred_ : 0) * this.$outer.lineSpacing))))) << 16) >> 16;
  }
}

$J.define(ParagraphView, 'javax.swing.text.ParagraphView', { kind: 'class', ifaces: ['javax.swing.text.TabExpander'], sup: 'javax.swing.text.FlowView', ctors: { 'javax.swing.text.Element': '_ParagraphView' }, meths: { 'getBreakWeight(int,float)': 'getBreakWeight$int$float', 'breakView(int,float,java.awt.Shape)': 'breakView$int$float$Shape' }, clinit: true, lazy: ['i18nStrategy', 'tabChars', 'tabDecimalChars'] });
$J.define(ParagraphView$Row, 'javax.swing.text.ParagraphView$Row', { kind: 'class', sup: 'javax.swing.text.BoxView', ctors: { 'javax.swing.text.Element': '_ParagraphView$Row' }, meths: { 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' }, inner: true });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  GlyphView = $J.load('javax.swing.text.GlyphView');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  Segment = $J.load('javax.swing.text.Segment');
  StateInvariantError = $J.load('javax.swing.text.StateInvariantError');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  TabStop = $J.load('javax.swing.text.TabStop');
  TabableView = $J.load('javax.swing.text.TabableView');
  TextLayoutStrategy = $J.load('javax.swing.text.TextLayoutStrategy');
  View = $J.load('javax.swing.text.View');
});
