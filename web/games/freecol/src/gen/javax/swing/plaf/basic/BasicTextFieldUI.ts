// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTextFieldUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { BasicTextUI } from './BasicTextUI.ts';
import { ParagraphView } from '../../text/ParagraphView.ts';

let Component$BaselineResizeBehavior, JTextField, SwingConstants, BasicHTML, AbstractDocument, FieldView, GlyphView, View;

/**
 * Basis of a look and feel for a JTextField.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author  Timothy Prinzing
 */
export class BasicTextFieldUI extends BasicTextUI {
  /**
   * Creates a new BasicTextFieldUI.
   */
  _BasicTextFieldUI(): this {
    this._BasicTextUI();
    return this;
  }
  /**
   * Creates a UI for a JTextField.
   *
   * @param c the text field
   * @return the UI
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicTextFieldUI()._BasicTextFieldUI();
  }
  /**
   * Fetches the name used as a key to lookup properties through the
   * UIManager.  This is used as a prefix to all the standard
   * text properties.
   *
   * @return the name ("TextField")
   */
  getPropertyPrefix(): string {
    return 'TextField';
  }
  /**
   * Creates a view for an element.
   *
   * @param elem the element
   * @return the view for the element
   */
  create(elem: Element): View {
    let doc = elem.getDocument();
    let i18nFlag = doc.getProperty('i18n');
    if ($J.equals(true, i18nFlag)) {
      let kind = elem.getName();
      if (kind != null) {
        if ($J.equals(kind, AbstractDocument.ContentElementName)) {
          return new (BasicTextFieldUI$1())().$o(this)._GlyphView(elem);
        } else if ($J.equals(kind, AbstractDocument.ParagraphElementName)) {
          return new BasicTextFieldUI$I18nFieldView()._BasicTextFieldUI$I18nFieldView(elem);
        }
      }
    }
    return new FieldView()._FieldView(elem);
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let rootView = this.getRootView(c);
    if (rootView.getViewCount() > 0) {
      let insets = c.getInsets$();
      height = (height - insets.top - insets.bottom) | 0;
      if (height > 0) {
        let baseline = insets.top;
        let fieldView = rootView.getView(0);
        let vspan = $J.d2i(fieldView.getPreferredSpan(View.Y_AXIS));
        if (height !== vspan) {
          let slop = (height - vspan) | 0;
          baseline = (baseline + $J.idiv(slop, 2)) | 0;
        }
        if (fieldView instanceof BasicTextFieldUI$I18nFieldView) {
          let fieldBaseline = BasicHTML.getBaseline$View$int$int(fieldView, (width - insets.left - insets.right) | 0, height);
          if (fieldBaseline < 0) {
            return -1;
          }
          baseline = (baseline + fieldBaseline) | 0;
        } else {
          let fm = c.getFontMetrics(c.getFont());
          baseline = (baseline + fm.getAscent()) | 0;
        }
        return baseline;
      }
    }
    return -1;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    return Component$BaselineResizeBehavior.CENTER_OFFSET;
  }
}

/**
 * A field view that support bidirectional text via the
 * support provided by ParagraphView.
 */
export class BasicTextFieldUI$I18nFieldView extends ParagraphView {
  _BasicTextFieldUI$I18nFieldView(elem: Element): this {
    this._ParagraphView(elem);
    return this;
  }
  /**
   * Fetch the constraining span to flow against for
   * the given child index.  There is no limit for
   * a field since it scrolls, so this is implemented to
   * return <code>Integer.MAX_VALUE</code>.
   */
  getFlowSpan(index: number): number {
    return 2147483647;
  }
  setJustification(j: number): void {
  }
  static isLeftToRight(c: Component): boolean {
    return c.getComponentOrientation().isLeftToRight();
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
          if (BasicTextFieldUI$I18nFieldView.isLeftToRight(c)) {
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
    super.paint(g, this.adjustAllocation(a));
  }
  /**
   * Determines the resizability of the view along the
   * given axis.  A value of 0 or less is not resizable.
   *
   * @param axis View.X_AXIS or View.Y_AXIS
   * @return the weight -> 1 for View.X_AXIS, else 0
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
   * @param pos the position to convert >= 0
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
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param p0 the position to convert >= 0
   * @param b0 the bias toward the previous character or the
   *  next character represented by p0, in case the
   *  position is a boundary of two views.
   * @param p1 the position to convert >= 0
   * @param b1 the bias toward the previous character or the
   *  next character represented by p1, in case the
   *  position is a boundary of two views.
   * @param a the allocated region to render into
   * @return the bounding box of the given position is returned
   * @throws BadLocationException  if the given position does
   *   not represent a valid location in the associated document
   * @throws IllegalArgumentException for an invalid bias argument
   * @see View#viewToModel
   */
  modelToView$int$Bias$int$Bias$Shape(p0: number, b0: Position$Bias, p1: number, b1: Position$Bias, a: Shape): Shape {
    return super.modelToView$int$Bias$int$Bias$Shape(p0, b0, p1, b1, this.adjustAllocation(a));
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param fx the X coordinate >= 0.0f
   * @param fy the Y coordinate >= 0.0f
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

let $BasicTextFieldUI$1: any = null;
/** An anonymous class (BasicTextFieldUI.java:100). */
function BasicTextFieldUI$1(): any {
  return $BasicTextFieldUI$1 ??= $J.local(class extends GlyphView {
    getMinimumSpan(axis: number): number {
      return this.getPreferredSpan(axis);
    }
  }, 'javax.swing.plaf.basic.BasicTextFieldUI$1', []);
}

$J.define(BasicTextFieldUI, 'javax.swing.plaf.basic.BasicTextFieldUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTextUI', ctors: { '': '_BasicTextFieldUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' } });
$J.define(BasicTextFieldUI$I18nFieldView, 'javax.swing.plaf.basic.BasicTextFieldUI$I18nFieldView', { kind: 'class', sup: 'javax.swing.text.ParagraphView', ctors: { 'javax.swing.text.Element': '_BasicTextFieldUI$I18nFieldView' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,javax.swing.text.Position$Bias,int,javax.swing.text.Position$Bias,java.awt.Shape)': 'modelToView$int$Bias$int$Bias$Shape', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  JTextField = $J.load('javax.swing.JTextField');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  FieldView = $J.load('javax.swing.text.FieldView');
  GlyphView = $J.load('javax.swing.text.GlyphView');
  View = $J.load('javax.swing.text.View');
});
