// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/ComponentView.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException } from '../../../../jre/index.ts';
import { View } from './View.ts';
import { Container } from '../../../java/awt/Container.ts';

let Dimension, KeyboardFocusManager, Rectangle, SwingUtilities, AbstractDocument, BadLocationException, Position$Bias, StyleConstants;

/**
 * Component decorator that implements the view interface.  The
 * entire element is used to represent the component.  This acts
 * as a gateway from the display-only View implementations to
 * interactive lightweight components (ie it allows components
 * to be embedded into the View hierarchy).
 * <p>
 * The component is placed relative to the text baseline
 * according to the value returned by
 * <code>Component.getAlignmentY</code>.  For Swing components
 * this value can be conveniently set using the method
 * <code>JComponent.setAlignmentY</code>.  For example, setting
 * a value of <code>0.75</code> will cause 75 percent of the
 * component to be above the baseline, and 25 percent of the
 * component to be below the baseline.
 * <p>
 * This class is implemented to do the extra work necessary to
 * work properly in the presence of multiple threads (i.e. from
 * asynchronous notification of model changes for example) by
 * ensuring that all component access is done on the event thread.
 * <p>
 * The component used is determined by the return value of the
 * createComponent method.  The default implementation of this
 * method is to return the component held as an attribute of
 * the element (by calling StyleConstants.getComponent).  A
 * limitation of this behavior is that the component cannot
 * be used by more than one text component (i.e. with a shared
 * model).  Subclasses can remove this constraint by implementing
 * the createComponent to actually create a component based upon
 * some kind of specification contained in the attributes.  The
 * ObjectView class in the html package is an example of a
 * ComponentView implementation that supports multiple component
 * views of a shared model.
 *
 * @author Timothy Prinzing
 */
export class ComponentView extends View {
  createdC: Component = null;
  c: ComponentView$Invalidator = null;
  /**
   * Creates a new ComponentView object.
   *
   * @param elem the element to decorate
   */
  _ComponentView(elem: Element): this {
    this._View(elem);
    return this;
  }
  /**
   * Create the component that is associated with
   * this view.  This will be called when it has
   * been determined that a new component is needed.
   * This would result from a call to setParent or
   * as a result of being notified that attributes
   * have changed.
   * @return the component that is associated with
   * this view
   */
  createComponent(): Component {
    let attr = this.getElement().getAttributes();
    let comp = StyleConstants.getComponent(attr);
    return comp;
  }
  /**
   * The real paint behavior occurs naturally from the association
   * that the component has with its parent container (the same
   * container hosting this view).  This is implemented to do nothing.
   *
   * @param g the graphics context
   * @param a the shape
   * @see View#paint
   */
  paint(g: Graphics, a: Shape): void {
    if (this.c != null) {
      let alloc = (a instanceof Rectangle) ? a : a.getBounds();
      this.c.setBounds$int$int$int$int(alloc.x_, alloc.y_, alloc.width_, alloc.height_);
    }
  }
  /**
   * Determines the preferred span for this view along an
   * axis.  This is implemented to return the value
   * returned by Component.getPreferredSize along the
   * axis of interest.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return   the span the view would like to be rendered into &gt;=0.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @throws IllegalArgumentException for an invalid axis
   */
  getPreferredSpan(axis: number): number {
    if ((axis !== View.X_AXIS) && (axis !== View.Y_AXIS)) {
      throw new IllegalArgumentException('Invalid axis: ' + axis);
    }
    if (this.c != null) {
      let size = this.c.getPreferredSize$();
      if (axis === View.X_AXIS) {
        return Math.fround(size.width_);
      } else {
        return Math.fround(size.height_);
      }
    }
    return 0;
  }
  /**
   * Determines the minimum span for this view along an
   * axis.  This is implemented to return the value
   * returned by Component.getMinimumSize along the
   * axis of interest.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return   the span the view would like to be rendered into &gt;=0.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @throws IllegalArgumentException for an invalid axis
   */
  getMinimumSpan(axis: number): number {
    if ((axis !== View.X_AXIS) && (axis !== View.Y_AXIS)) {
      throw new IllegalArgumentException('Invalid axis: ' + axis);
    }
    if (this.c != null) {
      let size = this.c.getMinimumSize$();
      if (axis === View.X_AXIS) {
        return Math.fround(size.width_);
      } else {
        return Math.fround(size.height_);
      }
    }
    return 0;
  }
  /**
   * Determines the maximum span for this view along an
   * axis.  This is implemented to return the value
   * returned by Component.getMaximumSize along the
   * axis of interest.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return   the span the view would like to be rendered into &gt;=0.
   *           Typically the view is told to render into the span
   *           that is returned, although there is no guarantee.
   *           The parent may choose to resize or break the view.
   * @throws IllegalArgumentException for an invalid axis
   */
  getMaximumSpan(axis: number): number {
    if ((axis !== View.X_AXIS) && (axis !== View.Y_AXIS)) {
      throw new IllegalArgumentException('Invalid axis: ' + axis);
    }
    if (this.c != null) {
      let size = this.c.getMaximumSize();
      if (axis === View.X_AXIS) {
        return Math.fround(size.width_);
      } else {
        return Math.fround(size.height_);
      }
    }
    return 0;
  }
  /**
   * Determines the desired alignment for this view along an
   * axis.  This is implemented to give the alignment of the
   * embedded component.
   *
   * @param axis may be either View.X_AXIS or View.Y_AXIS
   * @return the desired alignment.  This should be a value
   *   between 0.0 and 1.0 where 0 indicates alignment at the
   *   origin and 1.0 indicates alignment to the full span
   *   away from the origin.  An alignment of 0.5 would be the
   *   center of the view.
   */
  getAlignment(axis: number): number {
    if (this.c != null) {
      switch (axis) {
        case View.X_AXIS:
          return this.c.getAlignmentX();
        case View.Y_AXIS:
          return this.c.getAlignmentY();
      }
    }
    return super.getAlignment(axis);
  }
  /**
   * Sets the parent for a child view.
   * The parent calls this on the child to tell it who its
   * parent is, giving the view access to things like
   * the hosting Container.  The superclass behavior is
   * executed, followed by a call to createComponent if
   * the parent view parameter is non-null and a component
   * has not yet been created. The embedded components parent
   * is then set to the value returned by <code>getContainer</code>.
   * If the parent view parameter is null, this view is being
   * cleaned up, thus the component is removed from its parent.
   * <p>
   * The changing of the component hierarchy will
   * touch the component lock, which is the one thing
   * that is not safe from the View hierarchy.  Therefore,
   * this functionality is executed immediately if on the
   * event thread, or is queued on the event queue if
   * called from another thread (notification of change
   * from an asynchronous update).
   *
   * @param p the parent
   */
  setParent(p: View): void {
    super.setParent(p);
    if (SwingUtilities.isEventDispatchThread()) {
      this.setComponentParent();
    } else {
      let callSetComponentParent = () => {
        let doc = this.getDocument();
        try {
          if (doc instanceof AbstractDocument) {
            (doc).readLock();
          }
          this.setComponentParent();
          let host = this.getContainer();
          if (host != null) {
            this.preferenceChanged(null, true, true);
            host.repaint$();
          }
        } finally {
          if (doc instanceof AbstractDocument) {
            (doc).readUnlock();
          }
        }
      };
      SwingUtilities.invokeLater(callSetComponentParent);
    }
  }
  /**
   * Set the parent of the embedded component
   * with assurance that it is thread-safe.
   */
  setComponentParent(): void {
    let p = this.getParent();
    if (p != null) {
      let parent = this.getContainer();
      if (parent != null) {
        if (this.c == null) {
          let comp = this.createComponent();
          if (comp != null) {
            this.createdC = comp;
            this.c = new ComponentView$Invalidator().$o(this)._ComponentView$Invalidator(comp);
          }
        }
        if (this.c != null) {
          if (this.c.getParent() == null) {
            parent.add$Component$Object(this.c, this);
            parent.addPropertyChangeListener$String$PropertyChangeListener('enabled', $J.fn(this.c, 'propertyChange'));
          }
        }
      }
    } else {
      if (this.c != null) {
        let parent = this.c.getParent();
        if (parent != null) {
          parent.remove$Component(this.c);
          parent.removePropertyChangeListener$String$PropertyChangeListener('enabled', $J.fn(this.c, 'propertyChange'));
        }
      }
    }
  }
  /**
   * Provides a mapping from the coordinate space of the model to
   * that of the view.
   *
   * @param pos the position to convert &gt;=0
   * @param a the allocated region to render into
   * @return the bounding box of the given position is returned
   * @throws BadLocationException  if the given position does not
   *   represent a valid location in the associated document
   * @see View#modelToView
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    let p0 = this.getStartOffset();
    let p1 = this.getEndOffset();
    if ((pos >= p0) && (pos <= p1)) {
      let r = a.getBounds();
      if (pos === p1) {
        r.x_ = (r.x_ + r.width_) | 0;
      }
      r.width_ = 0;
      return r;
    }
    throw new BadLocationException()._BadLocationException(pos + ' not in range ' + p0 + ',' + p1, pos);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x the X coordinate &gt;=0
   * @param y the Y coordinate &gt;=0
   * @param a the allocated region to render into
   * @return the location within the model that best represents
   *    the given point in the view
   * @see View#viewToModel
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, bias: Position$Bias[]): number {
    let alloc = a;
    if (x < Math.fround((alloc.x_ + ($J.idiv(alloc.width_, 2))) | 0)) {
      bias[0] = Position$Bias.Forward;
      return this.getStartOffset();
    }
    bias[0] = Position$Bias.Backward;
    return this.getEndOffset();
  }
}

/**
 * This class feeds the invalidate back to the
 * hosting View.  This is needed to get the View
 * hierarchy to consider giving the component
 * a different size (i.e. layout may have been
 * cached between the associated view and the
 * container hosting this component).
 */
export class ComponentView$Invalidator extends Container {
  min: Dimension = null;
  pref: Dimension = null;
  max_: Dimension = null;
  yalign: number = 0;
  xalign: number = 0;
  _ComponentView$Invalidator(child: Component): this {
    this._Container();
    this.setLayout(null);
    this.add$Component(child);
    this.cacheChildSizes();
    return this;
  }
  /**
   * The components invalid layout needs
   * to be propagated through the view hierarchy
   * so the views (which position the component)
   * can have their layout recomputed.
   */
  invalidate(): void {
    super.invalidate();
    if (this.getParent() != null) {
      this.$outer.preferenceChanged(null, true, true);
    }
  }
  doLayout(): void {
    this.cacheChildSizes();
  }
  setBounds$int$int$int$int(x: number, y: number, w: number, h: number): void {
    super.setBounds$int$int$int$int(x, y, w, h);
    if (this.getComponentCount() > 0) {
      this.getComponent$int(0).setSize$int$int(w, h);
    }
    this.cacheChildSizes();
  }
  validateIfNecessary(): void {
    if (!this.isValid()) {
      this.validate();
    }
  }
  cacheChildSizes(): void {
    if (this.getComponentCount() > 0) {
      let child = this.getComponent$int(0);
      this.min = child.getMinimumSize$();
      this.pref = child.getPreferredSize$();
      this.max_ = child.getMaximumSize();
      this.yalign = child.getAlignmentY();
      this.xalign = child.getAlignmentX();
    } else {
      this.min = this.pref = this.max_ = new Dimension()._Dimension$int$int(0, 0);
    }
  }
  /**
   * Shows or hides this component depending on the value of parameter
   * <code>b</code>.
   * @param b If <code>true</code>, shows this component;
   * otherwise, hides this component.
   * @see #isVisible
   * @since 1.1
   */
  setVisible(b: boolean): void {
    super.setVisible(b);
    if (this.getComponentCount() > 0) {
      this.getComponent$int(0).setVisible(b);
    }
  }
  /**
   * Overridden to fix 4759054. Must return true so that content
   * is painted when inside a CellRendererPane which is normally
   * invisible.
   */
  isShowing(): boolean {
    return true;
  }
  getMinimumSize$(): Dimension {
    this.validateIfNecessary();
    return this.min;
  }
  getPreferredSize$(): Dimension {
    this.validateIfNecessary();
    return this.pref;
  }
  getMaximumSize(): Dimension {
    this.validateIfNecessary();
    return this.max_;
  }
  getAlignmentX(): number {
    this.validateIfNecessary();
    return this.xalign;
  }
  getAlignmentY(): number {
    this.validateIfNecessary();
    return this.yalign;
  }
  getFocusTraversalKeys(id: number): JSet<AWTKeyStroke> {
    return KeyboardFocusManager.getCurrentKeyboardFocusManager$().getDefaultFocusTraversalKeys(id);
  }
  propertyChange(ev: PropertyChangeEvent): void {
    let enable = ev.getNewValue();
    if (this.getComponentCount() > 0) {
      this.getComponent$int(0).setEnabled(enable);
    }
  }
}

$J.define(ComponentView, 'javax.swing.text.ComponentView', { kind: 'class', sup: 'javax.swing.text.View', ctors: { 'javax.swing.text.Element': '_ComponentView' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' } });
$J.define(ComponentView$Invalidator, 'javax.swing.text.ComponentView$Invalidator', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.awt.Container', ctors: { 'java.awt.Component': '_ComponentView$Invalidator' }, meths: { 'getPreferredSize()': 'getPreferredSize$', 'getMinimumSize()': 'getMinimumSize$', 'setBounds(int,int,int,int)': 'setBounds$int$int$int$int' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Rectangle = $J.load('java.awt.Rectangle');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
});
