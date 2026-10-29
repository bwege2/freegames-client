// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/FieldView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';
import { PlainView } from './PlainView.ts';

let JComponent, JTextField, SwingConstants, BadLocationException, SegmentCache, Utilities, View, SwingUtilities2;

/**
 * Extends the multi-line plain text view to be suitable
 * for a single-line editor view.  If the view is
 * allocated extra space, the field must adjust for it.
 * If the hosting component is a JTextField, this view
 * will manage the ranges of the associated BoundedRangeModel
 * and will adjust the horizontal allocation to match the
 * current visibility settings of the JTextField.
 *
 * @author  Timothy Prinzing
 * @see     View
 */
export class FieldView extends PlainView {
  /**
   * Constructs a new FieldView wrapped on an element.
   *
   * @param elem the element
   */
  _FieldView(elem: Element): this {
    this._PlainView(elem);
    return this;
  }
  /**
   * Fetches the font metrics associated with the component hosting
   * this view.
   *
   * @return the metrics
   */
  getFontMetrics(): FontMetrics {
    let c = this.getContainer();
    return c.getFontMetrics(c.getFont());
  }
  /**
   * Adjusts the allocation given to the view
   * to be a suitable allocation for a text field.
   * If the view has been allocated more than the
   * preferred span vertically, the allocation is
   * changed to be centered vertically.  Horizontally
   * the view is adjusted according to the horizontal
   * alignment property set on the associated JTextField
   * (if that is the type of the hosting component).
   *
   * @param a the allocation given to the view, which may need
   *  to be adjusted.
   * @return the allocation that the superclass should use.
   */
  adjustAllocation(a: Shape): Shape {
    if (a != null) {
      let bounds = a.getBounds();
      let vspan = $J.d2i(this.getPreferredSpan(View.Y_AXIS));
      let hspan = $J.d2i(this.getPreferredSpan(View.X_AXIS));
      if (bounds.height_ !== vspan) {
        let slop = (bounds.height_ - vspan) | 0;
        bounds.y_ = (bounds.y_ + $J.idiv(slop, 2)) | 0;
        bounds.height_ = (bounds.height_ - slop) | 0;
      }
      let c = this.getContainer();
      if (c instanceof JTextField) {
        let field = c;
        let vis = field.getHorizontalVisibility();
        let max = Math.max(hspan, bounds.width_);
        let value = vis.getValue();
        let extent = Math.min(max, (bounds.width_ - 1) | 0);
        if (((value + extent) | 0) > max) {
          value = (max - extent) | 0;
        }
        vis.setRangeProperties(value, extent, vis.getMinimum(), max, false);
        if (hspan < bounds.width_) {
          let slop = (bounds.width_ - 1 - hspan) | 0;
          let align = (c).getHorizontalAlignment();
          if (Utilities.isLeftToRight(c)) {
            if (align === SwingConstants.LEADING) {
              align = SwingConstants.LEFT;
            } else if (align === SwingConstants.TRAILING) {
              align = SwingConstants.RIGHT;
            }
          } else {
            if (align === SwingConstants.LEADING) {
              align = SwingConstants.RIGHT;
            } else if (align === SwingConstants.TRAILING) {
              align = SwingConstants.LEFT;
            }
          }
          switch (align) {
            case SwingConstants.CENTER:
              bounds.x_ = (bounds.x_ + $J.idiv(slop, 2)) | 0;
              bounds.width_ = (bounds.width_ - slop) | 0;
              break;
            case SwingConstants.RIGHT:
              bounds.x_ = (bounds.x_ + slop) | 0;
              bounds.width_ = (bounds.width_ - slop) | 0;
              break;
          }
        } else {
          bounds.width_ = hspan;
          bounds.x_ = (bounds.x_ - vis.getValue()) | 0;
        }
      }
      return bounds;
    }
    return null;
  }
  /**
   * Update the visibility model with the associated JTextField
   * (if there is one) to reflect the current visibility as a
   * result of changes to the document model.  The bounded
   * range properties are updated.  If the view hasn't yet been
   * shown the extent will be zero and we just set it to be full
   * until determined otherwise.
   */
  updateVisibilityModel(): void {
    let c = this.getContainer();
    if (c instanceof JTextField) {
      let field = c;
      let vis = field.getHorizontalVisibility();
      let hspan = $J.d2i(this.getPreferredSpan(View.X_AXIS));
      let extent = vis.getExtent();
      let maximum = Math.max(hspan, extent);
      extent = (extent === 0) ? maximum : extent;
      let value = (maximum - extent) | 0;
      let oldValue = vis.getValue();
      if (((oldValue + extent) | 0) > maximum) {
        oldValue = (maximum - extent) | 0;
      }
      value = Math.max(0, Math.min(value, oldValue));
      vis.setRangeProperties(value, extent, 0, maximum, false);
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
    let r = a;
    g.clipRect(r.x_, r.y_, r.width_, r.height_);
    super.paint(g, a);
  }
  /**
   * Adjusts <code>a</code> based on the visible region and returns it.
   */
  adjustPaintRegion(a: Shape): Shape {
    return this.adjustAllocation(a);
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
    {
      let buff: Segment, doc: Document, width: number;
      switch (axis) {
        case View.X_AXIS:
          buff = SegmentCache.getSharedSegment();
          doc = this.getDocument();
          try {
            let fm = this.getFontMetrics();
            doc.getText$int$int$Segment(0, doc.getLength(), buff);
            width = Utilities.getTabbedTextWidth$Segment$FontMetrics$int$TabExpander$int(buff, fm, 0, this, 0);
            if (buff.count_ > 0) {
              let c = this.getContainer();
              this.firstLineOffset = SwingUtilities2.getLeftSideBearing$JComponent$FontMetrics$char((c instanceof JComponent) ? c : null, fm, buff.array[buff.offset]);
              this.firstLineOffset = Math.max(0, -this.firstLineOffset);
            } else {
              this.firstLineOffset = 0;
            }
          } catch ($e0) {
            if ($J.isa($e0, BadLocationException)) {
              let bl = $J.exc($e0);
              width = 0;
            } else {
              throw $e0;
            }
          }
          SegmentCache.releaseSharedSegment(buff);
          return Math.fround((width + this.firstLineOffset) | 0);
        default:
          return super.getPreferredSpan(axis);
      }
    }
  }
  /**
   * Determines the resizability of the view along the
   * given axis.  A value of 0 or less is not resizable.
   *
   * @param axis View.X_AXIS or View.Y_AXIS
   * @return the weight -&gt; 1 for View.X_AXIS, else 0
   */
  getResizeWeight(axis: number): number {
    if (axis === View.X_AXIS) {
      return 1;
    }
    return 0;
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
    return super.modelToView$int$Shape$Bias(pos, this.adjustAllocation(a), b);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param fx the X coordinate &gt;= 0.0f
   * @param fy the Y coordinate &gt;= 0.0f
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *  given point in the view
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(fx: number, fy: number, a: Shape, bias: Position$Bias[]): number {
    return super.viewToModel$float$float$Shape$BiasArr(fx, fy, this.adjustAllocation(a), bias);
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
    super.insertUpdate(changes, this.adjustAllocation(a), f);
    this.updateVisibilityModel();
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
    super.removeUpdate(changes, this.adjustAllocation(a), f);
    this.updateVisibilityModel();
  }
}

$J.define(FieldView, 'javax.swing.text.FieldView', { kind: 'class', sup: 'javax.swing.text.PlainView', ctors: { 'javax.swing.text.Element': '_FieldView' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' } });
$J.module(() => {
  JComponent = $J.load('javax.swing.JComponent');
  JTextField = $J.load('javax.swing.JTextField');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  SegmentCache = $J.load('javax.swing.text.SegmentCache');
  Utilities = $J.load('javax.swing.text.Utilities');
  View = $J.load('javax.swing.text.View');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
