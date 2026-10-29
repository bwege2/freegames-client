// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/BoxView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException } from '../../../../jre/index.ts';
import { CompositeView } from './CompositeView.ts';

let Rectangle, SizeRequirements, Position$Bias, View;

/**
 * A view that arranges its children into a box shape by tiling
 * its children along an axis.  The box is somewhat like that
 * found in TeX where there is alignment of the
 * children, flexibility of the children is considered, etc.
 * This is a building block that might be useful to represent
 * things like a collection of lines, paragraphs,
 * lists, columns, pages, etc.  The axis along which the children are tiled is
 * considered the major axis.  The orthogonal axis is the minor axis.
 * <p>
 * Layout for each axis is handled separately by the methods
 * <code>layoutMajorAxis</code> and <code>layoutMinorAxis</code>.
 * Subclasses can change the layout algorithm by
 * reimplementing these methods.    These methods will be called
 * as necessary depending upon whether or not there is cached
 * layout information and the cache is considered
 * valid.  These methods are typically called if the given size
 * along the axis changes, or if <code>layoutChanged</code> is
 * called to force an updated layout.  The <code>layoutChanged</code>
 * method invalidates cached layout information, if there is any.
 * The requirements published to the parent view are calculated by
 * the methods <code>calculateMajorAxisRequirements</code>
 * and  <code>calculateMinorAxisRequirements</code>.
 * If the layout algorithm is changed, these methods will
 * likely need to be reimplemented.
 *
 * @author  Timothy Prinzing
 */
export class BoxView extends CompositeView {
  majorAxis: number = 0;
  majorSpan: number = 0;
  minorSpan: number = 0;
  majorReqValid: boolean = false;
  minorReqValid: boolean = false;
  majorRequest: SizeRequirements = null;
  minorRequest: SizeRequirements = null;
  majorAllocValid: boolean = false;
  majorOffsets: number[] = null;
  majorSpans: number[] = null;
  minorAllocValid: boolean = false;
  minorOffsets: number[] = null;
  minorSpans: number[] = null;
  /**
   * used in paint.
   */
  tempRect: Rectangle = null;
  /**
   * Constructs a <code>BoxView</code>.
   *
   * @param elem the element this view is responsible for
   * @param axis either <code>View.X_AXIS</code> or <code>View.Y_AXIS</code>
   */
  _BoxView(elem: Element, axis: number): this {
    this._CompositeView(elem);
    this.tempRect = new Rectangle()._Rectangle$();
    this.majorAxis = axis;
    this.majorOffsets = $J.newArray(0, 0);
    this.majorSpans = $J.newArray(0, 0);
    this.majorReqValid = false;
    this.majorAllocValid = false;
    this.minorOffsets = $J.newArray(0, 0);
    this.minorSpans = $J.newArray(0, 0);
    this.minorReqValid = false;
    this.minorAllocValid = false;
    return this;
  }
  /**
   * Fetches the tile axis property.  This is the axis along which
   * the child views are tiled.
   *
   * @return the major axis of the box, either
   *  <code>View.X_AXIS</code> or <code>View.Y_AXIS</code>
   *
   * @since 1.3
   */
  getAxis(): number {
    return this.majorAxis;
  }
  /**
   * Invalidates the layout along an axis.  This happens
   * automatically if the preferences have changed for
   * any of the child views.  In some cases the layout
   * may need to be recalculated when the preferences
   * have not changed.  The layout can be marked as
   * invalid by calling this method.  The layout will
   * be updated the next time the <code>setSize</code> method
   * is called on this view (typically in paint).
   *
   * @param axis either <code>View.X_AXIS</code> or <code>View.Y_AXIS</code>
   *
   * @since 1.3
   */
  layoutChanged(axis: number): void {
    if (axis === this.majorAxis) {
      this.majorAllocValid = false;
    } else {
      this.minorAllocValid = false;
    }
  }
  /**
   * Determines if the layout is valid along the given axis.
   * @return if the layout is valid along the given axis
   *
   * @param axis either <code>View.X_AXIS</code> or <code>View.Y_AXIS</code>
   *
   * @since 1.4
   */
  isLayoutValid(axis: number): boolean {
    if (axis === this.majorAxis) {
      return this.majorAllocValid;
    } else {
      return this.minorAllocValid;
    }
  }
  /**
   * Paints a child.  By default
   * that is all it does, but a subclass can use this to paint
   * things relative to the child.
   *
   * @param g the graphics context
   * @param alloc the allocated region to paint into
   * @param index the child index, &gt;= 0 &amp;&amp; &lt; getViewCount()
   */
  paintChild(g: Graphics, alloc: Rectangle, index: number): void {
    let child = this.getView(index);
    child.paint(g, alloc);
  }
  /**
   * Invalidates the layout and resizes the cache of
   * requests/allocations.  The child allocations can still
   * be accessed for the old layout, but the new children
   * will have an offset and span of 0.
   *
   * @param index the starting index into the child views to insert
   *   the new views; this should be a value &gt;= 0 and &lt;= getViewCount
   * @param length the number of existing child views to remove;
   *   This should be a value &gt;= 0 and &lt;= (getViewCount() - offset)
   * @param elems the child views to add; this value can be
   *   <code>null</code>to indicate no children are being added
   *   (useful to remove)
   */
  replace(index: number, length: number, elems: View[]): void {
    super.replace(index, length, elems);
    let nInserted = (elems != null) ? elems.length : 0;
    this.majorOffsets = this.updateLayoutArray(this.majorOffsets, index, nInserted);
    this.majorSpans = this.updateLayoutArray(this.majorSpans, index, nInserted);
    this.majorReqValid = false;
    this.majorAllocValid = false;
    this.minorOffsets = this.updateLayoutArray(this.minorOffsets, index, nInserted);
    this.minorSpans = this.updateLayoutArray(this.minorSpans, index, nInserted);
    this.minorReqValid = false;
    this.minorAllocValid = false;
  }
  /**
   * Resizes the given layout array to match the new number of
   * child views.  The current number of child views are used to
   * produce the new array.  The contents of the old array are
   * inserted into the new array at the appropriate places so that
   * the old layout information is transferred to the new array.
   *
   * @param oldArray the original layout array
   * @param offset location where new views will be inserted
   * @param nInserted the number of child views being inserted;
   *          therefore the number of blank spaces to leave in the
   *          new array at location <code>offset</code>
   * @return the new layout array
   */
  updateLayoutArray(oldArray: number[], offset: number, nInserted: number): number[] {
    let n = this.getViewCount();
    let newArray = $J.newArray(n, 0);
    $J.system_arraycopy(oldArray, 0, newArray, 0, offset);
    $J.system_arraycopy(oldArray, offset, newArray, (offset + nInserted) | 0, (n - nInserted - offset) | 0);
    return newArray;
  }
  /**
   * Forwards the given <code>DocumentEvent</code> to the child views
   * that need to be notified of the change to the model.
   * If a child changed its requirements and the allocation
   * was valid prior to forwarding the portion of the box
   * from the starting child to the end of the box will
   * be repainted.
   *
   * @param ec changes to the element this view is responsible
   *  for (may be <code>null</code> if there were no changes)
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see #insertUpdate
   * @see #removeUpdate
   * @see #changedUpdate
   * @since 1.3
   */
  forwardUpdate(ec: DocumentEvent$ElementChange, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    let wasValid = this.isLayoutValid(this.majorAxis);
    super.forwardUpdate(ec, e, a, f);
    if (wasValid && (!this.isLayoutValid(this.majorAxis))) {
      let c = this.getContainer();
      if ((a != null) && (c != null)) {
        let pos = e.getOffset();
        let index = this.getViewIndexAtPosition(pos);
        let alloc = this.getInsideAllocation(a);
        if (this.majorAxis === View.X_AXIS) {
          alloc.x_ = (alloc.x_ + this.majorOffsets[index]) | 0;
          alloc.width_ = (alloc.width_ - this.majorOffsets[index]) | 0;
        } else {
          alloc.y_ = (alloc.y_ + this.minorOffsets[index]) | 0;
          alloc.height_ = (alloc.height_ - this.minorOffsets[index]) | 0;
        }
        c.repaint$int$int$int$int(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
      }
    }
  }
  /**
   * This is called by a child to indicate its
   * preferred span has changed.  This is implemented to
   * throw away cached layout information so that new
   * calculations will be done the next time the children
   * need an allocation.
   *
   * @param child the child view
   * @param width true if the width preference should change
   * @param height true if the height preference should change
   */
  preferenceChanged(child: View, width: boolean, height: boolean): void {
    let majorChanged = (this.majorAxis === View.X_AXIS) ? width : height;
    let minorChanged = (this.majorAxis === View.X_AXIS) ? height : width;
    if (majorChanged) {
      this.majorReqValid = false;
      this.majorAllocValid = false;
    }
    if (minorChanged) {
      this.minorReqValid = false;
      this.minorAllocValid = false;
    }
    super.preferenceChanged(child, width, height);
  }
  /**
   * Gets the resize weight.  A value of 0 or less is not resizable.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @return the weight
   * @throws IllegalArgumentException for an invalid axis
   */
  getResizeWeight(axis: number): number {
    this.checkRequests(axis);
    if (axis === this.majorAxis) {
      if ((this.majorRequest.preferred_ !== this.majorRequest.minimum) || (this.majorRequest.preferred_ !== this.majorRequest.maximum)) {
        return 1;
      }
    } else {
      if ((this.minorRequest.preferred_ !== this.minorRequest.minimum) || (this.minorRequest.preferred_ !== this.minorRequest.maximum)) {
        return 1;
      }
    }
    return 0;
  }
  /**
   * Sets the size of the view along an axis.  This should cause
   * layout of the view along the given axis.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @param span the span to layout to >= 0
   */
  setSpanOnAxis(axis: number, span: number): void {
    if (axis === this.majorAxis) {
      if (this.majorSpan !== $J.d2i(span)) {
        this.majorAllocValid = false;
      }
      if (!this.majorAllocValid) {
        this.majorSpan = $J.d2i(span);
        this.checkRequests(this.majorAxis);
        this.layoutMajorAxis(this.majorSpan, axis, this.majorOffsets, this.majorSpans);
        this.majorAllocValid = true;
        this.updateChildSizes();
      }
    } else {
      if (($J.d2i(span)) !== this.minorSpan) {
        this.minorAllocValid = false;
      }
      if (!this.minorAllocValid) {
        this.minorSpan = $J.d2i(span);
        this.checkRequests(axis);
        this.layoutMinorAxis(this.minorSpan, axis, this.minorOffsets, this.minorSpans);
        this.minorAllocValid = true;
        this.updateChildSizes();
      }
    }
  }
  /**
   * Propagates the current allocations to the child views.
   */
  updateChildSizes(): void {
    let n = this.getViewCount();
    if (this.majorAxis === View.X_AXIS) {
      for (let i = 0; i < n; i++) {
        let v = this.getView(i);
        v.setSize(Math.fround(this.majorSpans[i]), Math.fround(this.minorSpans[i]));
      }
    } else {
      for (let i = 0; i < n; i++) {
        let v = this.getView(i);
        v.setSize(Math.fround(this.minorSpans[i]), Math.fround(this.majorSpans[i]));
      }
    }
  }
  /**
   * Sets the size of the view.  This should cause
   * layout of the view if the view caches any layout
   * information.  This is implemented to call the
   * layout method with the sizes inside of the insets.
   *
   * @param width the width &gt;= 0
   * @param height the height &gt;= 0
   */
  setSize(width: number, height: number): void {
    this.layout(Math.max(0, $J.d2i((Math.fround(Math.fround(width - this.getLeftInset()) - this.getRightInset())))), Math.max(0, $J.d2i((Math.fround(Math.fround(height - this.getTopInset()) - this.getBottomInset())))));
  }
  /**
   * Renders the <code>BoxView</code> using the given
   * rendering surface and area
   * on that surface.  Only the children that intersect
   * the clip bounds of the given <code>Graphics</code>
   * will be rendered.
   *
   * @param g the rendering surface to use
   * @param allocation the allocated region to render into
   * @see View#paint
   */
  paint(g: Graphics, allocation: Shape): void {
    let alloc = (allocation instanceof Rectangle) ? allocation : allocation.getBounds();
    let n = this.getViewCount();
    let x = (alloc.x_ + this.getLeftInset()) | 0;
    let y = (alloc.y_ + this.getTopInset()) | 0;
    let clip = g.getClipBounds$();
    for (let i = 0; i < n; i++) {
      this.tempRect.x_ = (x + this.getOffset(View.X_AXIS, i)) | 0;
      this.tempRect.y_ = (y + this.getOffset(View.Y_AXIS, i)) | 0;
      this.tempRect.width_ = this.getSpan(View.X_AXIS, i);
      this.tempRect.height_ = this.getSpan(View.Y_AXIS, i);
      let trx0 = this.tempRect.x_;
      let trx1 = (trx0 + this.tempRect.width_) | 0;
      let try0 = this.tempRect.y_;
      let try1 = (try0 + this.tempRect.height_) | 0;
      let crx0 = clip.x_;
      let crx1 = (crx0 + clip.width_) | 0;
      let cry0 = clip.y_;
      let cry1 = (cry0 + clip.height_) | 0;
      if ((trx1 >= crx0) && (try1 >= cry0) && (crx1 >= trx0) && (cry1 >= try0)) {
        this.paintChild(g, this.tempRect, i);
      }
    }
  }
  /**
   * Fetches the allocation for the given child view.
   * This enables finding out where various views
   * are located.  This is implemented to return
   * <code>null</code> if the layout is invalid,
   * otherwise the superclass behavior is executed.
   *
   * @param index the index of the child, &gt;= 0 &amp;&amp; &gt; getViewCount()
   * @param a  the allocation to this view
   * @return the allocation to the child; or <code>null</code>
   *          if <code>a</code> is <code>null</code>;
   *          or <code>null</code> if the layout is invalid
   */
  getChildAllocation(index: number, a: Shape): Shape {
    if (a != null) {
      let ca = super.getChildAllocation(index, a);
      if ((ca != null) && (!this.isAllocationValid())) {
        let r = (ca instanceof Rectangle) ? ca : ca.getBounds();
        if ((r.width_ === 0) && (r.height_ === 0)) {
          return null;
        }
      }
      return ca;
    }
    return null;
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.  This makes
   * sure the allocation is valid before calling the superclass.
   *
   * @param pos the position to convert &gt;= 0
   * @param a the allocated region to render into
   * @return the bounding box of the given position
   * @throws BadLocationException  if the given position does
   *  not represent a valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    if (!this.isAllocationValid()) {
      let alloc = a.getBounds();
      this.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
    }
    return super.modelToView$int$Shape$Bias(pos, a, b);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x   x coordinate of the view location to convert &gt;= 0
   * @param y   y coordinate of the view location to convert &gt;= 0
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *  given point in the view &gt;= 0
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, bias: Position$Bias[]): number {
    if (!this.isAllocationValid()) {
      let alloc = a.getBounds();
      this.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
    }
    return super.viewToModel$float$float$Shape$BiasArr(x, y, a, bias);
  }
  /**
   * Determines the desired alignment for this view along an
   * axis.  This is implemented to give the total alignment
   * needed to position the children with the alignment points
   * lined up along the axis orthogonal to the axis that is
   * being tiled.  The axis being tiled will request to be
   * centered (i.e. 0.5f).
   *
   * @param axis may be either <code>View.X_AXIS</code>
   *   or <code>View.Y_AXIS</code>
   * @return the desired alignment &gt;= 0.0f &amp;&amp; &lt;= 1.0f; this should
   *   be a value between 0.0 and 1.0 where 0 indicates alignment at the
   *   origin and 1.0 indicates alignment to the full span
   *   away from the origin; an alignment of 0.5 would be the
   *   center of the view
   * @throws IllegalArgumentException for an invalid axis
   */
  getAlignment(axis: number): number {
    this.checkRequests(axis);
    if (axis === this.majorAxis) {
      return this.majorRequest.alignment;
    } else {
      return this.minorRequest.alignment;
    }
  }
  /**
   * Determines the preferred span for this view along an
   * axis.
   *
   * @param axis may be either <code>View.X_AXIS</code>
   *           or <code>View.Y_AXIS</code>
   * @return   the span the view would like to be rendered into &gt;= 0;
   *           typically the view is told to render into the span
   *           that is returned, although there is no guarantee;
   *           the parent may choose to resize or break the view
   * @throws IllegalArgumentException for an invalid axis type
   */
  getPreferredSpan(axis: number): number {
    this.checkRequests(axis);
    let marginSpan = Math.fround((axis === View.X_AXIS) ? (this.getLeftInset() + this.getRightInset()) | 0 : (this.getTopInset() + this.getBottomInset()) | 0);
    if (axis === this.majorAxis) {
      return Math.fround((Math.fround(this.majorRequest.preferred_)) + marginSpan);
    } else {
      return Math.fround((Math.fround(this.minorRequest.preferred_)) + marginSpan);
    }
  }
  /**
   * Determines the minimum span for this view along an
   * axis.
   *
   * @param axis may be either <code>View.X_AXIS</code>
   *           or <code>View.Y_AXIS</code>
   * @return  the span the view would like to be rendered into &gt;= 0;
   *           typically the view is told to render into the span
   *           that is returned, although there is no guarantee;
   *           the parent may choose to resize or break the view
   * @throws IllegalArgumentException for an invalid axis type
   */
  getMinimumSpan(axis: number): number {
    this.checkRequests(axis);
    let marginSpan = Math.fround((axis === View.X_AXIS) ? (this.getLeftInset() + this.getRightInset()) | 0 : (this.getTopInset() + this.getBottomInset()) | 0);
    if (axis === this.majorAxis) {
      return Math.fround((Math.fround(this.majorRequest.minimum)) + marginSpan);
    } else {
      return Math.fround((Math.fround(this.minorRequest.minimum)) + marginSpan);
    }
  }
  /**
   * Determines the maximum span for this view along an
   * axis.
   *
   * @param axis may be either <code>View.X_AXIS</code>
   *           or <code>View.Y_AXIS</code>
   * @return   the span the view would like to be rendered into &gt;= 0;
   *           typically the view is told to render into the span
   *           that is returned, although there is no guarantee;
   *           the parent may choose to resize or break the view
   * @throws IllegalArgumentException for an invalid axis type
   */
  getMaximumSpan(axis: number): number {
    this.checkRequests(axis);
    let marginSpan = Math.fround((axis === View.X_AXIS) ? (this.getLeftInset() + this.getRightInset()) | 0 : (this.getTopInset() + this.getBottomInset()) | 0);
    if (axis === this.majorAxis) {
      return Math.fround((Math.fround(this.majorRequest.maximum)) + marginSpan);
    } else {
      return Math.fround((Math.fround(this.minorRequest.maximum)) + marginSpan);
    }
  }
  /**
   * Are the allocations for the children still
   * valid?
   *
   * @return true if allocations still valid
   */
  isAllocationValid(): boolean {
    return (this.majorAllocValid && this.minorAllocValid);
  }
  /**
   * Determines if a point falls before an allocated region.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param innerAlloc the allocated region; this is the area
   *   inside of the insets
   * @return true if the point lies before the region else false
   */
  isBefore(x: number, y: number, innerAlloc: Rectangle): boolean {
    if (this.majorAxis === View.X_AXIS) {
      return (x < innerAlloc.x_);
    } else {
      return (y < innerAlloc.y_);
    }
  }
  /**
   * Determines if a point falls after an allocated region.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param innerAlloc the allocated region; this is the area
   *   inside of the insets
   * @return true if the point lies after the region else false
   */
  isAfter(x: number, y: number, innerAlloc: Rectangle): boolean {
    if (this.majorAxis === View.X_AXIS) {
      return (x > ((innerAlloc.width_ + innerAlloc.x_) | 0));
    } else {
      return (y > ((innerAlloc.height_ + innerAlloc.y_) | 0));
    }
  }
  /**
   * Fetches the child view at the given coordinates.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param alloc the parents inner allocation on entry, which should
   *   be changed to the child's allocation on exit
   * @return the view
   */
  getViewAtPoint(x: number, y: number, alloc: Rectangle): View {
    let n = this.getViewCount();
    if (this.majorAxis === View.X_AXIS) {
      if (x < ((alloc.x_ + this.majorOffsets[0]) | 0)) {
        this.childAllocation(0, alloc);
        return this.getView(0);
      }
      for (let i = 0; i < n; i++) {
        if (x < ((alloc.x_ + this.majorOffsets[i]) | 0)) {
          this.childAllocation((i - 1) | 0, alloc);
          return this.getView((i - 1) | 0);
        }
      }
      this.childAllocation((n - 1) | 0, alloc);
      return this.getView((n - 1) | 0);
    } else {
      if (y < ((alloc.y_ + this.majorOffsets[0]) | 0)) {
        this.childAllocation(0, alloc);
        return this.getView(0);
      }
      for (let i = 0; i < n; i++) {
        if (y < ((alloc.y_ + this.majorOffsets[i]) | 0)) {
          this.childAllocation((i - 1) | 0, alloc);
          return this.getView((i - 1) | 0);
        }
      }
      this.childAllocation((n - 1) | 0, alloc);
      return this.getView((n - 1) | 0);
    }
  }
  /**
   * Allocates a region for a child view.
   *
   * @param index the index of the child view to
   *   allocate, &gt;= 0 &amp;&amp; &lt; getViewCount()
   * @param alloc the allocated region
   */
  childAllocation(index: number, alloc: Rectangle): void {
    alloc.x_ = (alloc.x_ + this.getOffset(View.X_AXIS, index)) | 0;
    alloc.y_ = (alloc.y_ + this.getOffset(View.Y_AXIS, index)) | 0;
    alloc.width_ = this.getSpan(View.X_AXIS, index);
    alloc.height_ = this.getSpan(View.Y_AXIS, index);
  }
  /**
   * Perform layout on the box
   *
   * @param width the width (inside of the insets) &gt;= 0
   * @param height the height (inside of the insets) &gt;= 0
   */
  layout(width: number, height: number): void {
    this.setSpanOnAxis(View.X_AXIS, Math.fround(width));
    this.setSpanOnAxis(View.Y_AXIS, Math.fround(height));
  }
  /**
   * Returns the current width of the box.  This is the width that
   * it was last allocated.
   * @return the current width of the box
   */
  getWidth(): number {
    let span: number;
    if (this.majorAxis === View.X_AXIS) {
      span = this.majorSpan;
    } else {
      span = this.minorSpan;
    }
    span = (span + (this.getLeftInset() - this.getRightInset())) | 0;
    return span;
  }
  /**
   * Returns the current height of the box.  This is the height that
   * it was last allocated.
   * @return the current height of the box
   */
  getHeight(): number {
    let span: number;
    if (this.majorAxis === View.Y_AXIS) {
      span = this.majorSpan;
    } else {
      span = this.minorSpan;
    }
    span = (span + (this.getTopInset() - this.getBottomInset())) | 0;
    return span;
  }
  /**
   * Performs layout for the major axis of the box (i.e. the
   * axis that it represents). The results of the layout (the
   * offset and span for each children) are placed in the given
   * arrays which represent the allocations to the children
   * along the major axis.
   *
   * @param targetSpan the total span given to the view, which
   *  would be used to layout the children
   * @param axis the axis being laid out
   * @param offsets the offsets from the origin of the view for
   *  each of the child views; this is a return value and is
   *  filled in by the implementation of this method
   * @param spans the span of each child view; this is a return
   *  value and is filled in by the implementation of this method
   */
  layoutMajorAxis(targetSpan: number, axis: number, offsets: number[], spans: number[]): void {
    let preferred = 0;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      spans[i] = $J.d2i(v.getPreferredSpan(axis));
      preferred += spans[i];
    }
    let desiredAdjustment = targetSpan - preferred;
    let adjustmentFactor = 0;
    let diffs = null;
    if (desiredAdjustment !== 0) {
      let totalSpan = 0;
      diffs = $J.newArray(n, 0);
      for (let i = 0; i < n; i++) {
        let v = this.getView(i);
        let tmp: number;
        if (desiredAdjustment < 0) {
          tmp = $J.d2i(v.getMinimumSpan(axis));
          diffs[i] = (spans[i] - tmp) | 0;
        } else {
          tmp = $J.d2i(v.getMaximumSpan(axis));
          diffs[i] = (tmp - spans[i]) | 0;
        }
        totalSpan += tmp;
      }
      let maximumAdjustment = Math.fround(Math.abs(totalSpan - preferred));
      adjustmentFactor = Math.fround(desiredAdjustment / maximumAdjustment);
      adjustmentFactor = Math.min(adjustmentFactor, 1);
      adjustmentFactor = Math.max(adjustmentFactor, Math.fround(-1));
    }
    let totalOffset = 0;
    for (let i = 0; i < n; i++) {
      offsets[i] = totalOffset;
      if (desiredAdjustment !== 0) {
        let adjF = Math.fround(adjustmentFactor * diffs[i]);
        spans[i] = (spans[i] + $J.roundf(adjF)) | 0;
      }
      totalOffset = (Math.min(totalOffset + spans[i], 2147483647)) | 0;
    }
  }
  /**
   * Performs layout for the minor axis of the box (i.e. the
   * axis orthogonal to the axis that it represents). The results
   * of the layout (the offset and span for each children) are
   * placed in the given arrays which represent the allocations to
   * the children along the minor axis.
   *
   * @param targetSpan the total span given to the view, which
   *  would be used to layout the children
   * @param axis the axis being laid out
   * @param offsets the offsets from the origin of the view for
   *  each of the child views; this is a return value and is
   *  filled in by the implementation of this method
   * @param spans the span of each child view; this is a return
   *  value and is filled in by the implementation of this method
   */
  layoutMinorAxis(targetSpan: number, axis: number, offsets: number[], spans: number[]): void {
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      let max = $J.d2i(v.getMaximumSpan(axis));
      if (max < targetSpan) {
        let align = v.getAlignment(axis);
        offsets[i] = $J.d2i((Math.fround(((targetSpan - max) | 0) * align)));
        spans[i] = max;
      } else {
        let min = $J.d2i(v.getMinimumSpan(axis));
        offsets[i] = 0;
        spans[i] = Math.max(min, targetSpan);
      }
    }
  }
  /**
   * Calculates the size requirements for the major axis
   * <code>axis</code>.
   *
   * @param axis the axis being studied
   * @param r the <code>SizeRequirements</code> object;
   *          if <code>null</code> one will be created
   * @return the newly initialized <code>SizeRequirements</code> object
   * @see javax.swing.SizeRequirements
   */
  calculateMajorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    let min = 0;
    let pref = 0;
    let max = 0;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      min = Math.fround(min + v.getMinimumSpan(axis));
      pref = Math.fround(pref + v.getPreferredSpan(axis));
      max = Math.fround(max + v.getMaximumSpan(axis));
    }
    if (r == null) {
      r = new SizeRequirements()._SizeRequirements$();
    }
    r.alignment = 0.5;
    r.minimum = $J.d2i(min);
    r.preferred_ = $J.d2i(pref);
    r.maximum = $J.d2i(max);
    return r;
  }
  /**
   * Calculates the size requirements for the minor axis
   * <code>axis</code>.
   *
   * @param axis the axis being studied
   * @param r the <code>SizeRequirements</code> object;
   *          if <code>null</code> one will be created
   * @return the newly initialized <code>SizeRequirements</code> object
   * @see javax.swing.SizeRequirements
   */
  calculateMinorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    let min = 0;
    let pref = 0;
    let max = 2147483647;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      min = Math.max($J.d2i(v.getMinimumSpan(axis)), min);
      pref = Math.max($J.d2i(v.getPreferredSpan(axis)), pref);
      max = Math.max($J.d2i(v.getMaximumSpan(axis)), max);
    }
    if (r == null) {
      r = new SizeRequirements()._SizeRequirements$();
      r.alignment = 0.5;
    }
    r.preferred_ = (pref) | 0;
    r.minimum = min;
    r.maximum = max;
    return r;
  }
  /**
   * Checks the request cache and update if needed.
   * @param axis the axis being studied
   * @throws IllegalArgumentException if <code>axis</code> is
   *  neither <code>View.X_AXIS</code> nor <code>View.Y_AXIS</code>
   */
  checkRequests(axis: number): void {
    if ((axis !== View.X_AXIS) && (axis !== View.Y_AXIS)) {
      throw new IllegalArgumentException('Invalid axis: ' + axis);
    }
    if (axis === this.majorAxis) {
      if (!this.majorReqValid) {
        this.majorRequest = this.calculateMajorAxisRequirements(axis, this.majorRequest);
        this.majorReqValid = true;
      }
    } else if (!this.minorReqValid) {
      this.minorRequest = this.calculateMinorAxisRequirements(axis, this.minorRequest);
      this.minorReqValid = true;
    }
  }
  /**
   * Computes the location and extent of each child view
   * in this <code>BoxView</code> given the <code>targetSpan</code>,
   * which is the width (or height) of the region we have to
   * work with.
   *
   * @param targetSpan the total span given to the view, which
   *  would be used to layout the children
   * @param axis the axis being studied, either
   *          <code>View.X_AXIS</code> or <code>View.Y_AXIS</code>
   * @param offsets an empty array filled by this method with
   *          values specifying the location  of each child view
   * @param spans  an empty array filled by this method with
   *          values specifying the extent of each child view
   */
  baselineLayout(targetSpan: number, axis: number, offsets: number[], spans: number[]): void {
    let totalAscent = $J.d2i((Math.fround(targetSpan * this.getAlignment(axis))));
    let totalDescent = (targetSpan - totalAscent) | 0;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      let align = v.getAlignment(axis);
      let viewSpan: number;
      if (v.getResizeWeight(axis) > 0) {
        let minSpan = v.getMinimumSpan(axis);
        let maxSpan = v.getMaximumSpan(axis);
        if (align === 0) {
          viewSpan = Math.max(Math.min(maxSpan, Math.fround(totalDescent)), minSpan);
        } else if (align === 1) {
          viewSpan = Math.max(Math.min(maxSpan, Math.fround(totalAscent)), minSpan);
        } else {
          let fitSpan = Math.min(Math.fround(totalAscent / align), Math.fround(totalDescent / (Math.fround(1 - align))));
          viewSpan = Math.max(Math.min(maxSpan, fitSpan), minSpan);
        }
      } else {
        viewSpan = v.getPreferredSpan(axis);
      }
      offsets[i] = (totalAscent - $J.d2i((Math.fround(viewSpan * align)))) | 0;
      spans[i] = $J.d2i(viewSpan);
    }
  }
  /**
   * Calculates the size requirements for this <code>BoxView</code>
   * by examining the size of each child view.
   *
   * @param axis the axis being studied
   * @param r the <code>SizeRequirements</code> object;
   *          if <code>null</code> one will be created
   * @return the newly initialized <code>SizeRequirements</code> object
   */
  baselineRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    let totalAscent = new SizeRequirements()._SizeRequirements$();
    let totalDescent = new SizeRequirements()._SizeRequirements$();
    if (r == null) {
      r = new SizeRequirements()._SizeRequirements$();
    }
    r.alignment = 0.5;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      let align = v.getAlignment(axis);
      let span: number;
      let ascent: number;
      let descent: number;
      span = v.getPreferredSpan(axis);
      ascent = $J.d2i((Math.fround(align * span)));
      descent = $J.d2i((Math.fround(span - ascent)));
      totalAscent.preferred_ = Math.max(ascent, totalAscent.preferred_);
      totalDescent.preferred_ = Math.max(descent, totalDescent.preferred_);
      if (v.getResizeWeight(axis) > 0) {
        span = v.getMinimumSpan(axis);
        ascent = $J.d2i((Math.fround(align * span)));
        descent = $J.d2i((Math.fround(span - ascent)));
        totalAscent.minimum = Math.max(ascent, totalAscent.minimum);
        totalDescent.minimum = Math.max(descent, totalDescent.minimum);
        span = v.getMaximumSpan(axis);
        ascent = $J.d2i((Math.fround(align * span)));
        descent = $J.d2i((Math.fround(span - ascent)));
        totalAscent.maximum = Math.max(ascent, totalAscent.maximum);
        totalDescent.maximum = Math.max(descent, totalDescent.maximum);
      } else {
        totalAscent.minimum = Math.max(ascent, totalAscent.minimum);
        totalDescent.minimum = Math.max(descent, totalDescent.minimum);
        totalAscent.maximum = Math.max(ascent, totalAscent.maximum);
        totalDescent.maximum = Math.max(descent, totalDescent.maximum);
      }
    }
    r.preferred_ = (Math.min(totalAscent.preferred_ + totalDescent.preferred_, 2147483647)) | 0;
    if (r.preferred_ > 0) {
      r.alignment = Math.fround(Math.fround(totalAscent.preferred_) / r.preferred_);
    }
    if (r.alignment === 0) {
      r.minimum = totalDescent.minimum;
      r.maximum = totalDescent.maximum;
    } else if (r.alignment === 1) {
      r.minimum = totalAscent.minimum;
      r.maximum = totalAscent.maximum;
    } else {
      r.minimum = $J.roundf(Math.max(Math.fround(totalAscent.minimum / r.alignment), Math.fround(totalDescent.minimum / (Math.fround(1 - r.alignment)))));
      r.maximum = $J.roundf(Math.min(Math.fround(totalAscent.maximum / r.alignment), Math.fround(totalDescent.maximum / (Math.fround(1 - r.alignment)))));
    }
    return r;
  }
  /**
   * Fetches the offset of a particular child's current layout.
   * @param axis the axis being studied
   * @param childIndex the index of the requested child
   * @return the offset (location) for the specified child
   */
  getOffset(axis: number, childIndex: number): number {
    let offsets = (axis === this.majorAxis) ? this.majorOffsets : this.minorOffsets;
    return offsets[childIndex];
  }
  /**
   * Fetches the span of a particular child's current layout.
   * @param axis the axis being studied
   * @param childIndex the index of the requested child
   * @return the span (width or height) of the specified child
   */
  getSpan(axis: number, childIndex: number): number {
    let spans = (axis === this.majorAxis) ? this.majorSpans : this.minorSpans;
    return spans[childIndex];
  }
  /**
   * Determines in which direction the next view lays.
   * Consider the View at index n. Typically the <code>View</code>s
   * are laid out from left to right, so that the <code>View</code>
   * to the EAST will be at index n + 1, and the <code>View</code>
   * to the WEST will be at index n - 1. In certain situations,
   * such as with bidirectional text, it is possible
   * that the <code>View</code> to EAST is not at index n + 1,
   * but rather at index n - 1, or that the <code>View</code>
   * to the WEST is not at index n - 1, but index n + 1.
   * In this case this method would return true,
   * indicating the <code>View</code>s are laid out in
   * descending order. Otherwise the method would return false
   * indicating the <code>View</code>s are laid out in ascending order.
   * <p>
   * If the receiver is laying its <code>View</code>s along the
   * <code>Y_AXIS</code>, this will return the value from
   * invoking the same method on the <code>View</code>
   * responsible for rendering <code>position</code> and
   * <code>bias</code>. Otherwise this will return false.
   *
   * @param position position into the model
   * @param bias either <code>Position.Bias.Forward</code> or
   *          <code>Position.Bias.Backward</code>
   * @return true if the <code>View</code>s surrounding the
   *          <code>View</code> responding for rendering
   *          <code>position</code> and <code>bias</code>
   *          are laid out in descending order; otherwise false
   */
  flipEastAndWestAtEnds(position: number, bias: Position$Bias): boolean {
    var compositeView;
    if (this.majorAxis === View.Y_AXIS) {
      let testPos = (bias === Position$Bias.Backward) ? Math.max(0, (position - 1) | 0) : position;
      let index = this.getViewIndexAtPosition(testPos);
      var compositeView;
      if (index !== -1) {
        let v = this.getView(index);
        var compositeView;
        if ((compositeView = v) instanceof CompositeView) {
          return compositeView.flipEastAndWestAtEnds(position, bias);
        }
      }
    }
    return false;
  }
}

$J.define(BoxView, 'javax.swing.text.BoxView', { kind: 'class', sup: 'javax.swing.text.CompositeView', ctors: { 'javax.swing.text.Element,int': '_BoxView' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  SizeRequirements = $J.load('javax.swing.SizeRequirements');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  View = $J.load('javax.swing.text.View');
});
