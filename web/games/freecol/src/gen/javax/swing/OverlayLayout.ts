// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/OverlayLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

let AWTError, Dimension, SizeRequirements;

/**
 * A layout manager to arrange components over the top
 * of each other.  The requested size of the container
 * will be the largest requested size of the children,
 * taking alignment needs into consideration.
 *
 * The alignment is based upon what is needed to properly
 * fit the children in the allocation area.  The children
 * will be placed such that their alignment points are all
 * on top of each other.
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
 * @author   Timothy Prinzing
 * @since 1.2
 */
export class OverlayLayout extends JObject {
  target: Container = null;
  xChildren: SizeRequirements[] = null;
  yChildren: SizeRequirements[] = null;
  xTotal: SizeRequirements = null;
  yTotal: SizeRequirements = null;
  /**
   * Constructs a layout manager that performs overlay
   * arrangement of the children.  The layout manager
   * created is dedicated to the given container.
   *
   * @param target  the container to do layout against
   */
  _OverlayLayout(target: Container): this {
    this.target = target;
    return this;
  }
  /**
   * Indicates a child has changed its layout related information,
   * which causes any cached calculations to be flushed.
   *
   * @param target the container
   */
  invalidateLayout(target: Container): void {
    this.checkContainer(target);
    this.xChildren = null;
    this.yChildren = null;
    this.xTotal = null;
    this.yTotal = null;
  }
  /**
   * Adds the specified component to the layout. Used by
   * this class to know when to invalidate layout.
   *
   * @param name the name of the component
   * @param comp the component to be added
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
    this.invalidateLayout(comp.getParent());
  }
  /**
   * Removes the specified component from the layout. Used by
   * this class to know when to invalidate layout.
   *
   * @param comp the component to remove
   */
  removeLayoutComponent(comp: Component): void {
    this.invalidateLayout(comp.getParent());
  }
  /**
   * Adds the specified component to the layout, using the specified
   * constraint object. Used by this class to know when to invalidate
   * layout.
   *
   * @param comp the component to be added
   * @param constraints  where/how the component is added to the layout.
   */
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
    this.invalidateLayout(comp.getParent());
  }
  /**
   * Returns the preferred dimensions for this layout given the components
   * in the specified target container.  Recomputes the layout if it
   * has been invalidated.  Factors in the current inset setting returned
   * by getInsets().
   *
   * @param target the component which needs to be laid out
   * @return a Dimension object containing the preferred dimensions
   * @see #minimumLayoutSize
   */
  preferredLayoutSize(target: Container): Dimension {
    this.checkContainer(target);
    this.checkRequests();
    let size = new Dimension()._Dimension$int$int(this.xTotal.preferred_, this.yTotal.preferred_);
    let insets = target.getInsets$();
    size.width_ = (size.width_ + (insets.left + insets.right)) | 0;
    size.height_ = (size.height_ + (insets.top + insets.bottom)) | 0;
    return size;
  }
  /**
   * Returns the minimum dimensions needed to lay out the components
   * contained in the specified target container.  Recomputes the layout
   * if it has been invalidated, and factors in the current inset setting.
   *
   * @param target the component which needs to be laid out
   * @return a Dimension object containing the minimum dimensions
   * @see #preferredLayoutSize
   */
  minimumLayoutSize(target: Container): Dimension {
    this.checkContainer(target);
    this.checkRequests();
    let size = new Dimension()._Dimension$int$int(this.xTotal.minimum, this.yTotal.minimum);
    let insets = target.getInsets$();
    size.width_ = (size.width_ + (insets.left + insets.right)) | 0;
    size.height_ = (size.height_ + (insets.top + insets.bottom)) | 0;
    return size;
  }
  /**
   * Returns the maximum dimensions needed to lay out the components
   * contained in the specified target container.  Recomputes the
   * layout if it has been invalidated, and factors in the inset setting
   * returned by <code>getInset</code>.
   *
   * @param target the component that needs to be laid out
   * @return a <code>Dimension</code> object containing the maximum
   *         dimensions
   * @see #preferredLayoutSize
   */
  maximumLayoutSize(target: Container): Dimension {
    this.checkContainer(target);
    this.checkRequests();
    let size = new Dimension()._Dimension$int$int(this.xTotal.maximum, this.yTotal.maximum);
    let insets = target.getInsets$();
    size.width_ = (size.width_ + (insets.left + insets.right)) | 0;
    size.height_ = (size.height_ + (insets.top + insets.bottom)) | 0;
    return size;
  }
  /**
   * Returns the alignment along the x axis for the container.
   *
   * @param target the container
   * @return the alignment &gt;= 0.0f &amp;&amp; &lt;= 1.0f
   */
  getLayoutAlignmentX(target: Container): number {
    this.checkContainer(target);
    this.checkRequests();
    return this.xTotal.alignment;
  }
  /**
   * Returns the alignment along the y axis for the container.
   *
   * @param target the container
   * @return the alignment &gt;= 0.0f &amp;&amp; &lt;= 1.0f
   */
  getLayoutAlignmentY(target: Container): number {
    this.checkContainer(target);
    this.checkRequests();
    return this.yTotal.alignment;
  }
  /**
   * Called by the AWT when the specified container needs to be laid out.
   *
   * @param target  the container to lay out
   *
   * @throws AWTError  if the target isn't the container specified to the
   *                      constructor
   */
  layoutContainer$Container(target: Container): void {
    this.checkContainer(target);
    this.checkRequests();
    let nChildren = target.getComponentCount();
    let xOffsets = $J.newArray(nChildren, 0);
    let xSpans = $J.newArray(nChildren, 0);
    let yOffsets = $J.newArray(nChildren, 0);
    let ySpans = $J.newArray(nChildren, 0);
    let alloc = target.getSize$();
    let in$ = target.getInsets$();
    alloc.width_ = (alloc.width_ - (in$.left + in$.right)) | 0;
    alloc.height_ = (alloc.height_ - (in$.top + in$.bottom)) | 0;
    SizeRequirements.calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr(alloc.width_, this.xTotal, this.xChildren, xOffsets, xSpans);
    SizeRequirements.calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr(alloc.height_, this.yTotal, this.yChildren, yOffsets, ySpans);
    for (let i = 0; i < nChildren; i++) {
      let c = target.getComponent$int(i);
      c.setBounds$int$int$int$int((in$.left + xOffsets[i]) | 0, (in$.top + yOffsets[i]) | 0, xSpans[i], ySpans[i]);
    }
  }
  checkContainer(target: Container): void {
    if (this.target !== target) {
      throw new AWTError()._AWTError('OverlayLayout can\'t be shared');
    }
  }
  checkRequests(): void {
    if (this.xChildren == null || this.yChildren == null) {
      let n = this.target.getComponentCount();
      this.xChildren = $J.newArray(n, null);
      this.yChildren = $J.newArray(n, null);
      for (let i = 0; i < n; i++) {
        let c = this.target.getComponent$int(i);
        let min = c.getMinimumSize$();
        let typ = c.getPreferredSize$();
        let max = c.getMaximumSize();
        this.xChildren[i] = new SizeRequirements()._SizeRequirements$int$int$int$float(min.width_, typ.width_, max.width_, c.getAlignmentX());
        this.yChildren[i] = new SizeRequirements()._SizeRequirements$int$int$int$float(min.height_, typ.height_, max.height_, c.getAlignmentY());
      }
      this.xTotal = SizeRequirements.getAlignedSizeRequirements(this.xChildren);
      this.yTotal = SizeRequirements.getAlignedSizeRequirements(this.yChildren);
    }
  }
}

$J.define(OverlayLayout, 'javax.swing.OverlayLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.Container': '_OverlayLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  AWTError = $J.load('java.awt.AWTError');
  Dimension = $J.load('java.awt.Dimension');
  SizeRequirements = $J.load('javax.swing.SizeRequirements');
});
