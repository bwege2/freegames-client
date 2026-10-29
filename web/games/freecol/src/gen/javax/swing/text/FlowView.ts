// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/FlowView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Vector } from '../../../../jre/index.ts';
import { BoxView } from './BoxView.ts';
import { CompositeView } from './CompositeView.ts';

let SizeRequirements, DocumentEvent$EventType, BadLocationException, ComponentView, LabelView, Position$Bias, TabExpander, TabableView, View;

/**
 * A View that tries to flow it's children into some
 * partially constrained space.  This can be used to
 * build things like paragraphs, pages, etc.  The
 * flow is made up of the following pieces of functionality.
 * <ul>
 * <li>A logical set of child views, which as used as a
 * layout pool from which a physical view is formed.
 * <li>A strategy for translating the logical view to
 * a physical (flowed) view.
 * <li>Constraints for the strategy to work against.
 * <li>A physical structure, that represents the flow.
 * The children of this view are where the pieces of
 * of the logical views are placed to create the flow.
 * </ul>
 *
 * @author  Timothy Prinzing
 * @see     View
 * @since 1.3
 */
export class FlowView extends BoxView {
  /**
   * Default constraint against which the flow is
   * created against.
   */
  layoutSpan: number = 0;
  /**
   * These are the views that represent the child elements
   * of the element this view represents (The logical view
   * to translate to a physical view).  These are not
   * directly children of this view.  These are either
   * placed into the rows directly or used for the purpose
   * of breaking into smaller chunks, to form the physical
   * view.
   */
  layoutPool: View = null;
  /**
   * The behavior for keeping the flow updated.  By
   * default this is a singleton shared by all instances
   * of FlowView (FlowStrategy is stateless).  Subclasses
   * can create an alternative strategy, which might keep
   * state.
   */
  strategy: FlowView$FlowStrategy = null;
  /**
   * Constructs a FlowView for the given element.
   *
   * @param elem the element that this view is responsible for
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   */
  _FlowView(elem: Element, axis: number): this {
    this._BoxView(elem, axis);
    this.layoutSpan = 2147483647;
    this.strategy = new FlowView$FlowStrategy()._FlowView$FlowStrategy();
    return this;
  }
  /**
   * Fetches the axis along which views should be
   * flowed.  By default, this will be the axis
   * orthogonal to the axis along which the flow
   * rows are tiled (the axis of the default flow
   * rows themselves).  This is typically used
   * by the <code>FlowStrategy</code>.
   * @return the axis along which views should be
   * flowed
   */
  getFlowAxis(): number {
    if (this.getAxis() === View.Y_AXIS) {
      return View.X_AXIS;
    }
    return View.Y_AXIS;
  }
  /**
   * Loads all of the children to initialize the view.
   * This is called by the <code>setParent</code> method.
   * This is reimplemented to not load any children directly
   * (as they are created in the process of formatting).
   * If the layoutPool variable is null, an instance of
   * LogicalView is created to represent the logical view
   * that is used in the process of formatting.
   *
   * @param f the view factory
   */
  loadChildren(f: ViewFactory): void {
    if (this.layoutPool == null) {
      this.layoutPool = new FlowView$LogicalView()._FlowView$LogicalView(this.getElement());
    }
    this.layoutPool.setParent(this);
    this.strategy.insertUpdate(this, null, null);
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
    if (pos >= this.getStartOffset() && (pos < this.getEndOffset())) {
      for (let counter = 0; counter < this.getViewCount(); counter++) {
        let v = this.getView(counter);
        if (pos >= v.getStartOffset() && pos < v.getEndOffset()) {
          return counter;
        }
      }
    }
    return -1;
  }
  /**
   * Lays out the children.  If the span along the flow
   * axis has changed, layout is marked as invalid which
   * which will cause the superclass behavior to recalculate
   * the layout along the box axis.  The FlowStrategy.layout
   * method will be called to rebuild the flow rows as
   * appropriate.  If the height of this view changes
   * (determined by the preferred size along the box axis),
   * a preferenceChanged is called.  Following all of that,
   * the normal box layout of the superclass is performed.
   *
   * @param width  the width to lay out against &gt;= 0.  This is
   *   the width inside of the inset area.
   * @param height the height to lay out against &gt;= 0 This
   *   is the height inside of the inset area.
   */
  layout(width: number, height: number): void {
    let faxis = this.getFlowAxis();
    let newSpan: number;
    if (faxis === View.X_AXIS) {
      newSpan = width;
    } else {
      newSpan = height;
    }
    if (this.layoutSpan !== newSpan) {
      this.layoutChanged(faxis);
      this.layoutChanged(this.getAxis());
      this.layoutSpan = newSpan;
    }
    if (!this.isLayoutValid(faxis)) {
      let heightAxis = this.getAxis();
      let oldFlowHeight = (heightAxis === View.X_AXIS) ? this.getWidth() : this.getHeight();
      this.strategy.layout(this);
      let newFlowHeight = $J.d2i(this.getPreferredSpan(heightAxis));
      if (oldFlowHeight !== newFlowHeight) {
        let p = this.getParent();
        if (p != null) {
          p.preferenceChanged(this, (heightAxis === View.X_AXIS), (heightAxis === View.Y_AXIS));
        }
        let host = this.getContainer();
        if (host != null) {
          host.repaint$();
        }
      }
    }
    super.layout(width, height);
  }
  /**
   * Calculate requirements along the minor axis.  This
   * is implemented to forward the request to the logical
   * view by calling getMinimumSpan, getPreferredSpan, and
   * getMaximumSpan on it.
   */
  calculateMinorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    if (r == null) {
      r = new SizeRequirements()._SizeRequirements$();
    }
    let pref = this.layoutPool.getPreferredSpan(axis);
    let min = this.layoutPool.getMinimumSpan(axis);
    r.minimum = $J.d2i(min);
    r.preferred_ = Math.max(r.minimum, $J.d2i(pref));
    r.maximum = 2147483647;
    r.alignment = 0.5;
    return r;
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
    this.layoutPool.insertUpdate(changes, a, f);
    this.strategy.insertUpdate(this, changes, this.getInsideAllocation(a));
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
    this.layoutPool.removeUpdate(changes, a, f);
    this.strategy.removeUpdate(this, changes, this.getInsideAllocation(a));
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
    this.layoutPool.changedUpdate(changes, a, f);
    this.strategy.changedUpdate(this, changes, this.getInsideAllocation(a));
  }
  /**
   * {@inheritDoc}
   */
  setParent(parent: View): void {
    super.setParent(parent);
    if (parent == null && this.layoutPool != null) {
      this.layoutPool.setParent(null);
    }
  }
}

/**
 * Strategy for maintaining the physical form
 * of the flow.  The default implementation is
 * completely stateless, and recalculates the
 * entire flow if the layout is invalid on the
 * given FlowView.  Alternative strategies can
 * be implemented by subclassing, and might
 * perform incremental repair to the layout
 * or alternative breaking behavior.
 * @since 1.3
 */
export class FlowView$FlowStrategy extends JObject {
  damageStart: Position = null;
  viewBuffer: Vector<View> = null;
  /**
   * Constructs a {@code FlowStrategy}.
   */
  _FlowView$FlowStrategy(): this {
    this.damageStart = null;
    return this;
  }
  addDamage(fv: FlowView, offset: number): void {
    if (offset >= fv.getStartOffset() && offset < fv.getEndOffset()) {
      if (this.damageStart == null || offset < this.damageStart.getOffset()) {
        try {
          this.damageStart = fv.getDocument().createPosition(offset);
        } catch ($e0) {
          if ($J.isa($e0, BadLocationException)) {
            let e = $J.exc($e0);
            // assert (false)
          } else {
            throw $e0;
          }
        }
      }
    }
  }
  unsetDamage(): void {
    this.damageStart = null;
  }
  /**
   * Gives notification that something was inserted into the document
   * in a location that the given flow view is responsible for.  The
   * strategy should update the appropriate changed region (which
   * depends upon the strategy used for repair).
   *
   * @param fv the flow view
   * @param e the change information from the associated document
   * @param alloc the current allocation of the view inside of the insets.
   *   This value will be null if the view has not yet been displayed.
   * @see View#insertUpdate
   */
  insertUpdate(fv: FlowView, e: DocumentEvent, alloc: Rectangle): void {
    if (e != null) {
      this.addDamage(fv, e.getOffset());
    }
    if (alloc != null) {
      let host = fv.getContainer();
      if (host != null) {
        host.repaint$int$int$int$int(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
      }
    } else {
      fv.preferenceChanged(null, true, true);
    }
  }
  /**
   * Gives notification that something was removed from the document
   * in a location that the given flow view is responsible for.
   *
   * @param fv the flow view
   * @param e the change information from the associated document
   * @param alloc the current allocation of the view inside of the insets.
   * @see View#removeUpdate
   */
  removeUpdate(fv: FlowView, e: DocumentEvent, alloc: Rectangle): void {
    this.addDamage(fv, e.getOffset());
    if (alloc != null) {
      let host = fv.getContainer();
      if (host != null) {
        host.repaint$int$int$int$int(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
      }
    } else {
      fv.preferenceChanged(null, true, true);
    }
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   *
   * @param fv     the <code>FlowView</code> containing the changes
   * @param e      the <code>DocumentEvent</code> describing the changes
   *               done to the Document
   * @param alloc  Bounds of the View
   * @see View#changedUpdate
   */
  changedUpdate(fv: FlowView, e: DocumentEvent, alloc: Rectangle): void {
    this.addDamage(fv, e.getOffset());
    if (alloc != null) {
      let host = fv.getContainer();
      if (host != null) {
        host.repaint$int$int$int$int(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
      }
    } else {
      fv.preferenceChanged(null, true, true);
    }
  }
  /**
   * This method gives flow strategies access to the logical
   * view of the FlowView.
   * @param fv the FlowView
   * @return the logical view of the FlowView
   */
  getLogicalView(fv: FlowView): View {
    return fv.layoutPool;
  }
  /**
   * Update the flow on the given FlowView.  By default, this causes
   * all of the rows (child views) to be rebuilt to match the given
   * constraints for each row.  This is called by a FlowView.layout
   * to update the child views in the flow.
   *
   * @param fv the view to reflow
   */
  layout(fv: FlowView): void {
    let pool = this.getLogicalView(fv);
    let rowIndex: number;
    let p0: number;
    let p1 = fv.getEndOffset();
    if (fv.majorAllocValid) {
      if (this.damageStart == null) {
        return;
      }
      let offset = this.damageStart.getOffset();
      while ((rowIndex = fv.getViewIndexAtPosition(offset)) < 0) {
        offset--;
      }
      if (rowIndex > 0) {
        rowIndex--;
      }
      p0 = fv.getView(rowIndex).getStartOffset();
    } else {
      rowIndex = 0;
      p0 = fv.getStartOffset();
    }
    this.reparentViews(pool, p0);
    this.viewBuffer = new Vector(10, 10);
    let rowCount = fv.getViewCount();
    while (p0 < p1) {
      let row: View;
      if (rowIndex >= rowCount) {
        row = fv.createRow();
        fv.append(row);
      } else {
        row = fv.getView(rowIndex);
      }
      p0 = this.layoutRow(fv, rowIndex, p0);
      rowIndex++;
    }
    this.viewBuffer = null;
    if (rowIndex < rowCount) {
      fv.replace(rowIndex, (rowCount - rowIndex) | 0, null);
    }
    this.unsetDamage();
  }
  /**
   * Creates a row of views that will fit within the
   * layout span of the row.  This is called by the layout method.
   * This is implemented to fill the row by repeatedly calling
   * the createView method until the available span has been
   * exhausted, a forced break was encountered, or the createView
   * method returned null.  If the remaining span was exhausted,
   * the adjustRow method will be called to perform adjustments
   * to the row to try and make it fit into the given span.
   *
   * @param fv the flow view
   * @param rowIndex the index of the row to fill in with views.  The
   *   row is assumed to be empty on entry.
   * @param pos  The current position in the children of
   *   this views element from which to start.
   * @return the position to start the next row
   */
  layoutRow(fv: FlowView, rowIndex: number, pos: number): number {
    let row = fv.getView(rowIndex);
    let x = Math.fround(fv.getFlowStart(rowIndex));
    let spanLeft = Math.fround(fv.getFlowSpan(rowIndex));
    let end = fv.getEndOffset();
    let te = ($J.isa(fv, TabExpander)) ? fv : null;
    let flowAxis = fv.getFlowAxis();
    let breakWeight = View.BadBreakWeight;
    let breakX = 0;
    let breakSpan = 0;
    let breakIndex = -1;
    let n = 0;
    this.viewBuffer.clear();
    while (pos < end && spanLeft >= Math.fround(0)) {
      let v = this.createView(fv, pos, $J.d2i(spanLeft), rowIndex);
      if (v == null) {
        break;
      }
      let bw = v.getBreakWeight$int$float$float(flowAxis, x, spanLeft);
      if (bw >= View.ForcedBreakWeight) {
        let w = v.breakView$int$int$float$float(flowAxis, pos, x, spanLeft);
        if (w != null) {
          this.viewBuffer.add(w);
        } else if (n === 0) {
          this.viewBuffer.add(v);
        }
        break;
      } else if (bw >= breakWeight && bw > View.BadBreakWeight) {
        breakWeight = bw;
        breakX = x;
        breakSpan = spanLeft;
        breakIndex = n;
      }
      let chunkSpan: number;
      if (flowAxis === View.X_AXIS && $J.isa(v, TabableView)) {
        chunkSpan = (v).getTabbedSpan(x, te);
      } else {
        chunkSpan = v.getPreferredSpan(flowAxis);
      }
      if (chunkSpan > spanLeft && breakIndex >= 0) {
        if (breakIndex < n) {
          v = this.viewBuffer.get(breakIndex);
        }
        for (let i = (n - 1) | 0; i >= breakIndex; i--) {
          this.viewBuffer.removeAt(i);
        }
        v = v.breakView$int$int$float$float(flowAxis, v.getStartOffset(), breakX, breakSpan);
      }
      spanLeft = Math.fround(spanLeft - chunkSpan);
      x = Math.fround(x + chunkSpan);
      this.viewBuffer.add(v);
      pos = v.getEndOffset();
      n++;
    }
    let views = $J.newArray(this.viewBuffer.size(), null);
    $J.toArrayInto(this.viewBuffer.toArray(), views);
    row.replace(0, row.getViewCount(), views);
    return (views.length > 0 ? row.getEndOffset() : pos);
  }
  reparentViews(pool: View, startPos: number): void {
    let n = pool.getViewIndex$int$Bias(startPos, Position$Bias.Forward);
    if (n >= 0) {
      for (let i = n; i < pool.getViewCount(); i++) {
        pool.getView(i).setParent(pool);
      }
    }
  }
  /**
   * Creates a view that can be used to represent the current piece
   * of the flow.  This can be either an entire view from the
   * logical view, or a fragment of the logical view.
   *
   * @param fv the view holding the flow
   * @param startOffset the start location for the view being created
   * @param spanLeft the about of span left to fill in the row
   * @param rowIndex the row the view will be placed into
   * @return a view that can be used to represent the current piece
   * of the flow
   */
  createView(fv: FlowView, startOffset: number, spanLeft: number, rowIndex: number): View {
    let lv = this.getLogicalView(fv);
    let childIndex = lv.getViewIndex$int$Bias(startOffset, Position$Bias.Forward);
    let v = lv.getView(childIndex);
    if (startOffset === v.getStartOffset()) {
      return v;
    }
    v = v.createFragment(startOffset, v.getEndOffset());
    return v;
  }
}

/**
 * This class can be used to represent a logical view for
 * a flow.  It keeps the children updated to reflect the state
 * of the model, gives the logical child views access to the
 * view hierarchy, and calculates a preferred span.  It doesn't
 * do any rendering, layout, or model/view translation.
 */
export class FlowView$LogicalView extends CompositeView {
  _FlowView$LogicalView(elem: Element): this {
    this._CompositeView(elem);
    return this;
  }
  getViewIndexAtPosition(pos: number): number {
    let elem = this.getElement();
    if (elem.isLeaf()) {
      return 0;
    }
    return super.getViewIndexAtPosition(pos);
  }
  loadChildren(f: ViewFactory): void {
    let elem = this.getElement();
    if (elem.isLeaf()) {
      let v = new LabelView()._LabelView(elem);
      this.append(v);
    } else {
      super.loadChildren(f);
    }
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
  /**
   * Determines the preferred span for this view along an
   * axis.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return   the span the view would like to be rendered into.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @see View#getPreferredSpan
   */
  getPreferredSpan(axis: number): number {
    let maxpref = 0;
    let pref = 0;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      pref = Math.fround(pref + v.getPreferredSpan(axis));
      if (v.getBreakWeight$int$float$float(axis, 0, Math.fround(2147483647)) >= View.ForcedBreakWeight) {
        maxpref = Math.max(maxpref, pref);
        pref = 0;
      }
    }
    maxpref = Math.max(maxpref, pref);
    return maxpref;
  }
  /**
   * Determines the minimum span for this view along an
   * axis.  The is implemented to find the minimum unbreakable
   * span.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return  the span the view would like to be rendered into.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @see View#getPreferredSpan
   */
  getMinimumSpan(axis: number): number {
    let maxmin = 0;
    let min = 0;
    let nowrap = false;
    let n = this.getViewCount();
    for (let i = 0; i < n; i++) {
      let v = this.getView(i);
      if (v.getBreakWeight$int$float$float(axis, 0, Math.fround(2147483647)) === View.BadBreakWeight) {
        min = Math.fround(min + v.getPreferredSpan(axis));
        nowrap = true;
      } else if (nowrap) {
        maxmin = Math.max(min, maxmin);
        nowrap = false;
        min = 0;
      }
      if (v instanceof ComponentView) {
        maxmin = Math.max(maxmin, v.getMinimumSpan(axis));
      }
    }
    maxmin = Math.max(maxmin, min);
    return maxmin;
  }
  /**
   * Forward the DocumentEvent to the given child view.  This
   * is implemented to reparent the child to the logical view
   * (the children may have been parented by a row in the flow
   * if they fit without breaking) and then execute the superclass
   * behavior.
   *
   * @param v the child view to forward the event to.
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see #forwardUpdate
   * @since 1.3
   */
  forwardUpdateToView(v: View, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    let parent = v.getParent();
    v.setParent(this);
    super.forwardUpdateToView(v, e, a, f);
    v.setParent(parent);
  }
  /**
   * {@inheritDoc}
   */
  forwardUpdate(ec: DocumentEvent$ElementChange, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    super.forwardUpdate(ec, e, a, f);
    let type$ = e.getType();
    if (type$ === DocumentEvent$EventType.INSERT || type$ === DocumentEvent$EventType.REMOVE) {
      this.firstUpdateIndex = Math.min(((this.lastUpdateIndex + 1) | 0), ((this.getViewCount() - 1) | 0));
      this.lastUpdateIndex = Math.max(((this.getViewCount() - 1) | 0), 0);
      for (let i = this.firstUpdateIndex; i <= this.lastUpdateIndex; i++) {
        let v = this.getView(i);
        if (v != null) {
          v.updateAfterChange();
        }
      }
    }
  }
  /**
   * Renders using the given rendering surface and area on that
   * surface.  This is implemented to do nothing, the logical
   * view is never visible.
   *
   * @param g the rendering surface to use
   * @param allocation the allocated region to render into
   * @see View#paint
   */
  paint(g: Graphics, allocation: Shape): void {
  }
  /**
   * Tests whether a point lies before the rectangle range.
   * Implemented to return false, as hit detection is not
   * performed on the logical view.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param alloc the rectangle
   * @return true if the point is before the specified range
   */
  isBefore(x: number, y: number, alloc: Rectangle): boolean {
    return false;
  }
  /**
   * Tests whether a point lies after the rectangle range.
   * Implemented to return false, as hit detection is not
   * performed on the logical view.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param alloc the rectangle
   * @return true if the point is after the specified range
   */
  isAfter(x: number, y: number, alloc: Rectangle): boolean {
    return false;
  }
  /**
   * Fetches the child view at the given point.
   * Implemented to return null, as hit detection is not
   * performed on the logical view.
   *
   * @param x the X coordinate &gt;= 0
   * @param y the Y coordinate &gt;= 0
   * @param alloc the parent's allocation on entry, which should
   *   be changed to the child's allocation on exit
   * @return the child view
   */
  getViewAtPoint(x: number, y: number, alloc: Rectangle): View {
    return null;
  }
  /**
   * Returns the allocation for a given child.
   * Implemented to do nothing, as the logical view doesn't
   * perform layout on the children.
   *
   * @param index the index of the child, &gt;= 0 &amp;&amp; &lt; getViewCount()
   * @param a  the allocation to the interior of the box on entry,
   *   and the allocation of the child view at the index on exit.
   */
  childAllocation(index: number, a: Rectangle): void {
  }
}

$J.define(FlowView, 'javax.swing.text.FlowView', { kind: 'class', sup: 'javax.swing.text.BoxView', ctors: { 'javax.swing.text.Element,int': '_FlowView' } });
$J.define(FlowView$FlowStrategy, 'javax.swing.text.FlowView$FlowStrategy', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FlowView$FlowStrategy' } });
$J.define(FlowView$LogicalView, 'javax.swing.text.FlowView$LogicalView', { kind: 'class', sup: 'javax.swing.text.CompositeView', ctors: { 'javax.swing.text.Element': '_FlowView$LogicalView' } });
$J.module(() => {
  SizeRequirements = $J.load('javax.swing.SizeRequirements');
  DocumentEvent$EventType = $J.load('javax.swing.event.DocumentEvent$EventType');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  ComponentView = $J.load('javax.swing.text.ComponentView');
  LabelView = $J.load('javax.swing.text.LabelView');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  TabExpander = $J.load('javax.swing.text.TabExpander');
  TabableView = $J.load('javax.swing.text.TabableView');
  View = $J.load('javax.swing.text.View');
});
