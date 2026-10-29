// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/CompositeView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays, HashSet, IllegalArgumentException } from '../../../../jre/index.ts';
import { View } from './View.ts';

let Rectangle, SwingConstants, BadLocationException, Position$Bias, StyleConstants, Utilities;

/**
 * <code>CompositeView</code> is an abstract <code>View</code>
 * implementation which manages one or more child views.
 * (Note that <code>CompositeView</code> is intended
 * for managing relatively small numbers of child views.)
 * <code>CompositeView</code> is intended to be used as
 * a starting point for <code>View</code> implementations,
 * such as <code>BoxView</code>, that will contain child
 * <code>View</code>s. Subclasses that wish to manage the
 * collection of child <code>View</code>s should use the
 * {@link #replace} method.  As <code>View</code> invokes
 * <code>replace</code> during <code>DocumentListener</code>
 * notification, you normally won't need to directly
 * invoke <code>replace</code>.
 *
 * <p>While <code>CompositeView</code>
 * does not impose a layout policy on its child <code>View</code>s,
 * it does allow for inseting the child <code>View</code>s
 * it will contain.  The insets can be set by either
 * {@link #setInsets} or {@link #setParagraphInsets}.
 *
 * <p>In addition to the abstract methods of
 * {@link javax.swing.text.View},
 * subclasses of <code>CompositeView</code> will need to
 * override:
 * <ul>
 * <li>{@link #isBefore} - Used to test if a given
 *     <code>View</code> location is before the visual space
 *     of the <code>CompositeView</code>.
 * <li>{@link #isAfter} - Used to test if a given
 *     <code>View</code> location is after the visual space
 *     of the <code>CompositeView</code>.
 * <li>{@link #getViewAtPoint} - Returns the view at
 *     a given visual location.
 * <li>{@link #childAllocation} - Returns the bounds of
 *     a particular child <code>View</code>.
 *     <code>getChildAllocation</code> will invoke
 *     <code>childAllocation</code> after offsetting
 *     the bounds by the <code>Inset</code>s of the
 *     <code>CompositeView</code>.
 * </ul>
 *
 * @author  Timothy Prinzing
 */
export class CompositeView extends View {
  static ZERO: View[] = null;
  children_: View[] = null;
  nchildren: number = 0;
  left: number = 0;
  right: number = 0;
  top: number = 0;
  bottom: number = 0;
  childAlloc: Rectangle = null;
  /**
   * Constructs a <code>CompositeView</code> for the given element.
   *
   * @param elem  the element this view is responsible for
   */
  _CompositeView(elem: Element): this {
    this._View(elem);
    this.children_ = $J.newArray(1, null);
    this.nchildren = 0;
    this.childAlloc = new Rectangle()._Rectangle$();
    return this;
  }
  /**
   * Loads all of the children to initialize the view.
   * This is called by the {@link #setParent}
   * method.  Subclasses can reimplement this to initialize
   * their child views in a different manner.  The default
   * implementation creates a child view for each
   * child element.
   *
   * @param f the view factory
   * @see #setParent
   */
  loadChildren(f: ViewFactory): void {
    if (f == null) {
      return;
    }
    let e = this.getElement();
    let n = e.getElementCount();
    if (n > 0) {
      let added = $J.newArray(n, null);
      for (let i = 0; i < n; i++) {
        added[i] = f.create(e.getElement(i));
      }
      this.replace(0, 0, added);
    }
  }
  /**
   * Sets the parent of the view.
   * This is reimplemented to provide the superclass
   * behavior as well as calling the <code>loadChildren</code>
   * method if this view does not already have children.
   * The children should not be loaded in the
   * constructor because the act of setting the parent
   * may cause them to try to search up the hierarchy
   * (to get the hosting <code>Container</code> for example).
   * If this view has children (the view is being moved
   * from one place in the view hierarchy to another),
   * the <code>loadChildren</code> method will not be called.
   *
   * @param parent the parent of the view, <code>null</code> if none
   */
  setParent(parent: View): void {
    super.setParent(parent);
    if ((parent != null) && (this.nchildren === 0)) {
      let f = this.getViewFactory();
      this.loadChildren(f);
    }
  }
  /**
   * Returns the number of child views of this view.
   *
   * @return the number of views &gt;= 0
   * @see #getView
   */
  getViewCount(): number {
    return this.nchildren;
  }
  /**
   * Returns the n-th view in this container.
   *
   * @param n the number of the desired view, &gt;= 0 &amp;&amp; &lt; getViewCount()
   * @return the view at index <code>n</code>
   */
  getView(n: number): View {
    return this.children_[n];
  }
  /**
   * Replaces child views.  If there are no views to remove
   * this acts as an insert.  If there are no views to
   * add this acts as a remove.  Views being removed will
   * have the parent set to <code>null</code>,
   * and the internal reference to them removed so that they
   * may be garbage collected.
   *
   * @param offset the starting index into the child views to insert
   *   the new views; &gt;= 0 and &lt;= getViewCount
   * @param length the number of existing child views to remove;
   *   this should be a value &gt;= 0 and &lt;= (getViewCount() - offset)
   * @param views the child views to add; this value can be
   *  <code>null</code>
   *   to indicate no children are being added (useful to remove)
   */
  replace(offset: number, length: number, views: View[]): void {
    if (views == null) {
      views = CompositeView.ZERO;
    }
    let set$ = new HashSet(Arrays.asList(...views));
    for (let i = offset; i < ((offset + length) | 0); i++) {
      let child = this.children_[i];
      if (child.getParent() === this && !set$.contains(child)) {
        this.children_[i].setParent(null);
      }
      this.children_[i] = null;
    }
    let delta = (views.length - length) | 0;
    let src = (offset + length) | 0;
    let nmove = (this.nchildren - src) | 0;
    let dest = (src + delta) | 0;
    if (((this.nchildren + delta) | 0) >= this.children_.length) {
      let newLength = Math.max(Math.imul(2, this.children_.length), (this.nchildren + delta) | 0);
      let newChildren = $J.newArray(newLength, null);
      $J.system_arraycopy(this.children_, 0, newChildren, 0, offset);
      $J.system_arraycopy(views, 0, newChildren, offset, views.length);
      $J.system_arraycopy(this.children_, src, newChildren, dest, nmove);
      this.children_ = newChildren;
    } else {
      $J.system_arraycopy(this.children_, src, this.children_, dest, nmove);
      $J.system_arraycopy(views, 0, this.children_, offset, views.length);
    }
    this.nchildren = (this.nchildren + delta) | 0;
    for (let i = 0; i < views.length; i++) {
      views[i].setParent(this);
    }
  }
  /**
   * Fetches the allocation for the given child view to
   * render into. This enables finding out where various views
   * are located.
   *
   * @param index the index of the child, &gt;= 0 &amp;&amp; &lt; getViewCount()
   * @param a  the allocation to this view
   * @return the allocation to the child
   */
  getChildAllocation(index: number, a: Shape): Shape {
    let alloc = this.getInsideAllocation(a);
    this.childAllocation(index, alloc);
    return alloc;
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert &gt;= 0
   * @param a the allocated region to render into
   * @param b a bias value of either <code>Position.Bias.Forward</code>
   *  or <code>Position.Bias.Backward</code>
   * @return the bounding box of the given position
   * @throws BadLocationException  if the given position does
   *   not represent a valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    let isBackward = (b === Position$Bias.Backward);
    let testPos = (isBackward) ? Math.max(0, (pos - 1) | 0) : pos;
    if (isBackward && testPos < this.getStartOffset()) {
      return null;
    }
    let vIndex = this.getViewIndexAtPosition(testPos);
    if ((vIndex !== -1) && (vIndex < this.getViewCount())) {
      let v = this.getView(vIndex);
      if (v != null && testPos >= v.getStartOffset() && testPos < v.getEndOffset()) {
        let childShape = this.getChildAllocation(vIndex, a);
        if (childShape == null) {
          return null;
        }
        let retShape = v.modelToView$int$Shape$Bias(pos, childShape, b);
        if (retShape == null && v.getEndOffset() === pos) {
          if (++vIndex < this.getViewCount()) {
            v = this.getView(vIndex);
            retShape = v.modelToView$int$Shape$Bias(pos, this.getChildAllocation(vIndex, a), b);
          }
        }
        return retShape;
      }
    }
    throw new BadLocationException()._BadLocationException('Position not represented by view', pos);
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param p0 the position to convert &gt;= 0
   * @param b0 the bias toward the previous character or the
   *  next character represented by p0, in case the
   *  position is a boundary of two views; either
   *  <code>Position.Bias.Forward</code> or
   *  <code>Position.Bias.Backward</code>
   * @param p1 the position to convert &gt;= 0
   * @param b1 the bias toward the previous character or the
   *  next character represented by p1, in case the
   *  position is a boundary of two views
   * @param a the allocated region to render into
   * @return the bounding box of the given position is returned
   * @throws BadLocationException  if the given position does
   *   not represent a valid location in the associated document
   * @throws IllegalArgumentException for an invalid bias argument
   * @see View#viewToModel
   */
  modelToView$int$Bias$int$Bias$Shape(p0: number, b0: Position$Bias, p1: number, b1: Position$Bias, a: Shape): Shape {
    if (p0 === this.getStartOffset() && p1 === this.getEndOffset()) {
      return a;
    }
    let alloc = this.getInsideAllocation(a);
    let r0 = new Rectangle()._Rectangle$Rectangle(alloc);
    let v0 = this.getViewAtPosition((b0 === Position$Bias.Backward) ? Math.max(0, (p0 - 1) | 0) : p0, r0);
    let r1 = new Rectangle()._Rectangle$Rectangle(alloc);
    let v1 = this.getViewAtPosition((b1 === Position$Bias.Backward) ? Math.max(0, (p1 - 1) | 0) : p1, r1);
    if (v0 === v1) {
      if (v0 == null) {
        return a;
      }
      return v0.modelToView$int$Bias$int$Bias$Shape(p0, b0, p1, b1, r0);
    }
    let viewCount = this.getViewCount();
    let counter = 0;
    while (counter < viewCount) {
      let v: View;
      if ((v = this.getView(counter)) === v0 || v === v1) {
        let endView: View;
        let retRect: Rectangle;
        let tempRect = new Rectangle()._Rectangle$();
        if (v === v0) {
          retRect = v0.modelToView$int$Bias$int$Bias$Shape(p0, b0, v0.getEndOffset(), Position$Bias.Backward, r0).getBounds();
          endView = v1;
        } else {
          retRect = v1.modelToView$int$Bias$int$Bias$Shape(v1.getStartOffset(), Position$Bias.Forward, p1, b1, r1).getBounds();
          endView = v0;
        }
        while (++counter < viewCount && (v = this.getView(counter)) !== endView) {
          tempRect.setBounds$Rectangle(alloc);
          this.childAllocation(counter, tempRect);
          retRect.add$Rectangle(tempRect);
        }
        if (endView != null) {
          let endShape: Shape;
          if (endView === v1) {
            endShape = v1.modelToView$int$Bias$int$Bias$Shape(v1.getStartOffset(), Position$Bias.Forward, p1, b1, r1);
          } else {
            endShape = v0.modelToView$int$Bias$int$Bias$Shape(p0, b0, v0.getEndOffset(), Position$Bias.Backward, r0);
          }
          if (endShape instanceof Rectangle) {
            retRect.add$Rectangle(endShape);
          } else {
            retRect.add$Rectangle(endShape.getBounds());
          }
        }
        return retRect;
      }
      counter++;
    }
    throw new BadLocationException()._BadLocationException('Position not represented by view', p0);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x   x coordinate of the view location to convert &gt;= 0
   * @param y   y coordinate of the view location to convert &gt;= 0
   * @param a the allocated region to render into
   * @param bias either <code>Position.Bias.Forward</code> or
   *  <code>Position.Bias.Backward</code>
   * @return the location within the model that best represents the
   *  given point in the view &gt;= 0
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, bias: Position$Bias[]): number {
    let alloc = this.getInsideAllocation(a);
    if (this.isBefore($J.d2i(x), $J.d2i(y), alloc)) {
      let retValue = -1;
      try {
        retValue = this.getNextVisualPositionFrom(-1, Position$Bias.Forward, a, SwingConstants.EAST, bias);
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException) || $J.isa($e0, IllegalArgumentException)) {
          let e = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
      if (retValue === -1) {
        retValue = this.getStartOffset();
        bias[0] = Position$Bias.Forward;
      }
      return retValue;
    } else if (this.isAfter($J.d2i(x), $J.d2i(y), alloc)) {
      let retValue = -1;
      try {
        retValue = this.getNextVisualPositionFrom(-1, Position$Bias.Forward, a, SwingConstants.WEST, bias);
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException) || $J.isa($e1, IllegalArgumentException)) {
          let e = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
      if (retValue === -1) {
        retValue = (this.getEndOffset() - 1) | 0;
        bias[0] = Position$Bias.Forward;
      }
      return retValue;
    } else {
      let v = this.getViewAtPoint($J.d2i(x), $J.d2i(y), alloc);
      if (v != null) {
        return v.viewToModel$float$float$Shape$BiasArr(x, y, alloc, bias);
      }
    }
    return -1;
  }
  /**
   * Provides a way to determine the next visually represented model
   * location that one might place a caret.  Some views may not be visible,
   * they might not be in the same order found in the model, or they just
   * might not allow access to some of the locations in the model.
   * This is a convenience method for {@link #getNextNorthSouthVisualPositionFrom}
   * and {@link #getNextEastWestVisualPositionFrom}.
   * This method enables specifying a position to convert
   * within the range of &gt;=0.  If the value is -1, a position
   * will be calculated automatically.  If the value &lt; -1,
   * the {@code BadLocationException} will be thrown.
   *
   * @param pos the position to convert
   * @param b a bias value of either <code>Position.Bias.Forward</code>
   *  or <code>Position.Bias.Backward</code>
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard;
   *  this may be one of the following:
   *  <ul>
   *  <li><code>SwingConstants.WEST</code>
   *  <li><code>SwingConstants.EAST</code>
   *  <li><code>SwingConstants.NORTH</code>
   *  <li><code>SwingConstants.SOUTH</code>
   *  </ul>
   * @param biasRet an array containing the bias that was checked
   * @return the location within the model that best represents the next
   *  location visual position
   * @throws BadLocationException the given position is not a valid
   *                                 position within the document
   * @throws IllegalArgumentException if <code>direction</code> is invalid
   */
  getNextVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (pos < -1 || pos > this.getDocument().getLength()) {
      throw new BadLocationException()._BadLocationException('invalid position', pos);
    }
    let alloc = this.getInsideAllocation(a);
    switch (direction) {
      case SwingConstants.NORTH:
        return this.getNextNorthSouthVisualPositionFrom(pos, b, a, direction, biasRet);
      case SwingConstants.SOUTH:
        return this.getNextNorthSouthVisualPositionFrom(pos, b, a, direction, biasRet);
      case SwingConstants.EAST:
        return this.getNextEastWestVisualPositionFrom(pos, b, a, direction, biasRet);
      case SwingConstants.WEST:
        return this.getNextEastWestVisualPositionFrom(pos, b, a, direction, biasRet);
      default:
        throw new IllegalArgumentException('Bad direction: ' + direction);
    }
  }
  /**
   * Returns the child view index representing the given
   * position in the model.  This is implemented to call the
   * <code>getViewIndexByPosition</code>
   * method for backward compatibility.
   *
   * @param pos the position &gt;= 0
   * @return  index of the view representing the given position, or
   *   -1 if no view represents that position
   * @since 1.3
   */
  getViewIndex$int$Bias(pos: number, b: Position$Bias): number {
    if (b === Position$Bias.Backward) {
      pos = (pos - 1) | 0;
    }
    if ((pos >= this.getStartOffset()) && (pos < this.getEndOffset())) {
      return this.getViewIndexAtPosition(pos);
    }
    return -1;
  }
  /**
   * Fetches the child view that represents the given position in
   * the model.  This is implemented to fetch the view in the case
   * where there is a child view for each child element.
   *
   * @param pos the position &gt;= 0
   * @param a  the allocation to the interior of the box on entry,
   *   and the allocation of the view containing the position on exit
   * @return  the view representing the given position, or
   *   <code>null</code> if there isn't one
   */
  getViewAtPosition(pos: number, a: Rectangle): View {
    let index = this.getViewIndexAtPosition(pos);
    if ((index >= 0) && (index < this.getViewCount())) {
      let v = this.getView(index);
      if (a != null) {
        this.childAllocation(index, a);
      }
      return v;
    }
    return null;
  }
  /**
   * Fetches the child view index representing the given position in
   * the model.  This is implemented to fetch the view in the case
   * where there is a child view for each child element.
   *
   * @param pos the position &gt;= 0
   * @return  index of the view representing the given position, or
   *   -1 if no view represents that position
   */
  getViewIndexAtPosition(pos: number): number {
    let elem = this.getElement();
    return elem.getElementIndex(pos);
  }
  /**
   * Translates the immutable allocation given to the view
   * to a mutable allocation that represents the interior
   * allocation (i.e. the bounds of the given allocation
   * with the top, left, bottom, and right insets removed.
   * It is expected that the returned value would be further
   * mutated to represent an allocation to a child view.
   * This is implemented to reuse an instance variable so
   * it avoids creating excessive Rectangles.  Typically
   * the result of calling this method would be fed to
   * the <code>childAllocation</code> method.
   *
   * @param a the allocation given to the view
   * @return the allocation that represents the inside of the
   *   view after the margins have all been removed; if the
   *   given allocation was <code>null</code>,
   *   the return value is <code>null</code>
   */
  getInsideAllocation(a: Shape): Rectangle {
    if (a != null) {
      let alloc: Rectangle;
      if (a instanceof Rectangle) {
        alloc = a;
      } else {
        alloc = a.getBounds();
      }
      this.childAlloc.setBounds$Rectangle(alloc);
      this.childAlloc.x_ = (this.childAlloc.x_ + this.getLeftInset()) | 0;
      this.childAlloc.y_ = (this.childAlloc.y_ + this.getTopInset()) | 0;
      this.childAlloc.width_ = (this.childAlloc.width_ - (this.getLeftInset() + this.getRightInset())) | 0;
      this.childAlloc.height_ = (this.childAlloc.height_ - (this.getTopInset() + this.getBottomInset())) | 0;
      return this.childAlloc;
    }
    return null;
  }
  /**
   * Sets the insets from the paragraph attributes specified in
   * the given attributes.
   *
   * @param attr the attributes
   */
  setParagraphInsets(attr: AttributeSet): void {
    this.top = (($J.d2i(StyleConstants.getSpaceAbove(attr))) << 16) >> 16;
    this.left = (($J.d2i(StyleConstants.getLeftIndent(attr))) << 16) >> 16;
    this.bottom = (($J.d2i(StyleConstants.getSpaceBelow(attr))) << 16) >> 16;
    this.right = (($J.d2i(StyleConstants.getRightIndent(attr))) << 16) >> 16;
  }
  /**
   * Gets the left inset.
   *
   * @return the inset &gt;= 0
   */
  getLeftInset(): number {
    return this.left;
  }
  /**
   * Gets the right inset.
   *
   * @return the inset &gt;= 0
   */
  getRightInset(): number {
    return this.right;
  }
  /**
   * Gets the top inset.
   *
   * @return the inset &gt;= 0
   */
  getTopInset(): number {
    return this.top;
  }
  /**
   * Gets the bottom inset.
   *
   * @return the inset &gt;= 0
   */
  getBottomInset(): number {
    return this.bottom;
  }
  /**
   * Returns the next visual position for the cursor, in either the
   * north or south direction.
   *
   * @param pos the position to convert &gt;= 0
   * @param b a bias value of either <code>Position.Bias.Forward</code>
   *  or <code>Position.Bias.Backward</code>
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard;
   *  this may be one of the following:
   *  <ul>
   *  <li><code>SwingConstants.NORTH</code>
   *  <li><code>SwingConstants.SOUTH</code>
   *  </ul>
   * @param biasRet an array containing the bias that was checked
   * @return the location within the model that best represents the next
   *  north or south location
   * @throws BadLocationException for a bad location within a document model
   * @throws IllegalArgumentException if <code>direction</code> is invalid
   * @see #getNextVisualPositionFrom
   */
  getNextNorthSouthVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (pos < -1 || pos > this.getDocument().getLength()) {
      throw new BadLocationException()._BadLocationException('invalid position', pos);
    }
    return Utilities.getNextVisualPositionFrom(this, pos, b, a, direction, biasRet);
  }
  /**
   * Returns the next visual position for the cursor, in either the
   * east or west direction.
   *
   * @param pos the position to convert &gt;= 0
   * @param b a bias value of either <code>Position.Bias.Forward</code>
   *  or <code>Position.Bias.Backward</code>
   * @param a the allocated region to render into
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard;
   *  this may be one of the following:
   *  <ul>
   *  <li><code>SwingConstants.WEST</code>
   *  <li><code>SwingConstants.EAST</code>
   *  </ul>
   * @param biasRet an array containing the bias that was checked
   * @return the location within the model that best represents the next
   *  west or east location
   * @throws BadLocationException for a bad location within a document model
   * @throws IllegalArgumentException if <code>direction</code> is invalid
   * @see #getNextVisualPositionFrom
   */
  getNextEastWestVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (pos < -1 || pos > this.getDocument().getLength()) {
      throw new BadLocationException()._BadLocationException('invalid position', pos);
    }
    return Utilities.getNextVisualPositionFrom(this, pos, b, a, direction, biasRet);
  }
  /**
   * Determines in which direction the next view lays.
   * Consider the <code>View</code> at index n. Typically the
   * <code>View</code>s are laid out from left to right,
   * so that the <code>View</code> to the EAST will be
   * at index n + 1, and the <code>View</code> to the WEST
   * will be at index n - 1. In certain situations,
   * such as with bidirectional text, it is possible
   * that the <code>View</code> to EAST is not at index n + 1,
   * but rather at index n - 1, or that the <code>View</code>
   * to the WEST is not at index n - 1, but index n + 1.
   * In this case this method would return true, indicating the
   * <code>View</code>s are laid out in descending order.
   * <p>
   * This unconditionally returns false, subclasses should override this
   * method if there is the possibility for laying <code>View</code>s in
   * descending order.
   *
   * @param position position into the model
   * @param bias either <code>Position.Bias.Forward</code> or
   *          <code>Position.Bias.Backward</code>
   * @return false
   */
  flipEastAndWestAtEnds(position: number, bias: Position$Bias): boolean {
    return false;
  }
  static $clinit() {
    CompositeView.ZERO = $J.newArray(0, null);
  }
}

$J.define(CompositeView, 'javax.swing.text.CompositeView', { kind: 'class', sup: 'javax.swing.text.View', ctors: { 'javax.swing.text.Element': '_CompositeView' }, meths: { 'getViewIndex(int,javax.swing.text.Position$Bias)': 'getViewIndex$int$Bias', 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,javax.swing.text.Position$Bias,int,javax.swing.text.Position$Bias,java.awt.Shape)': 'modelToView$int$Bias$int$Bias$Shape', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' }, clinit: true, lazy: ['ZERO'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  Utilities = $J.load('javax.swing.text.Utilities');
});
