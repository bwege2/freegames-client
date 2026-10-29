// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/BoxLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2019, Oracle and/or its affiliates. All rights reserved.
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
 * A layout manager that allows multiple components to be laid out either
 * vertically or horizontally. The components will not wrap so, for
 * example, a vertical arrangement of components will stay vertically
 * arranged when the frame is resized.
 * <div style="float:right;text-align:center">
 *   <p><b>Example:</b>
 *   <p><img src="doc-files/BoxLayout-1.gif"
 *      alt="The following text describes this graphic."
 *      width="191" height="201">
 * </div>
 * <p>
 * Nesting multiple panels with different combinations of horizontal and
 * vertical gives an effect similar to GridBagLayout, without the
 * complexity. The diagram shows two panels arranged horizontally, each
 * of which contains 3 components arranged vertically.
 *
 * <p> The BoxLayout manager is constructed with an axis parameter that
 * specifies the type of layout that will be done. There are four choices:
 *
 * <blockquote><b>{@code X_AXIS}</b> - Components are laid out horizontally
 * from left to right.</blockquote>
 *
 * <blockquote><b>{@code Y_AXIS}</b> - Components are laid out vertically
 * from top to bottom.</blockquote>
 *
 * <blockquote><b>{@code LINE_AXIS}</b> - Components are laid out the way
 * words are laid out in a line, based on the container's
 * {@code ComponentOrientation} property. If the container's
 * {@code ComponentOrientation} is horizontal then components are laid out
 * horizontally, otherwise they are laid out vertically.  For horizontal
 * orientations, if the container's {@code ComponentOrientation} is left to
 * right then components are laid out left to right, otherwise they are laid
 * out right to left. For vertical orientations components are always laid out
 * from top to bottom.</blockquote>
 *
 * <blockquote><b>{@code PAGE_AXIS}</b> - Components are laid out the way
 * text lines are laid out on a page, based on the container's
 * {@code ComponentOrientation} property. If the container's
 * {@code ComponentOrientation} is horizontal then components are laid out
 * vertically, otherwise they are laid out horizontally.  For horizontal
 * orientations, if the container's {@code ComponentOrientation} is left to
 * right then components are laid out left to right, otherwise they are laid
 * out right to left.&nbsp; For vertical orientations components are always
 * laid out from top to bottom.</blockquote>
 * <p>
 * For all directions, components are arranged in the same order as they were
 * added to the container.
 * <p>
 * BoxLayout attempts to arrange components
 * at their preferred widths (for horizontal layout)
 * or heights (for vertical layout).
 * For a horizontal layout,
 * if not all the components are the same height,
 * BoxLayout attempts to make all the components
 * as high as the highest component.
 * If that's not possible for a particular component,
 * then BoxLayout aligns that component vertically,
 * according to the component's Y alignment.
 * By default, a component has a Y alignment of 0.5,
 * which means that the vertical center of the component
 * should have the same Y coordinate as
 * the vertical centers of other components with 0.5 Y alignment.
 * <p>
 * Similarly, for a vertical layout,
 * BoxLayout attempts to make all components in the column
 * as wide as the widest component.
 * If that fails, it aligns them horizontally
 * according to their X alignments.  For {@code PAGE_AXIS} layout,
 * horizontal alignment is done based on the leading edge of the component.
 * In other words, an X alignment value of 0.0 means the left edge of a
 * component if the container's {@code ComponentOrientation} is left to
 * right and it means the right edge of the component otherwise.
 * <p>
 * Instead of using BoxLayout directly, many programs use the Box class.
 * The Box class is a lightweight container that uses a BoxLayout.
 * It also provides handy methods to help you use BoxLayout well.
 * Adding components to multiple nested boxes is a powerful way to get
 * the arrangement you want.
 * <p>
 * For further information and examples see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/layout/box.html">How to Use BoxLayout</a>,
 * a section in <em>The Java Tutorial.</em>
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the {@code java.beans} package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see Box
 * @see java.awt.ComponentOrientation
 * @see JComponent#getAlignmentX
 * @see JComponent#getAlignmentY
 *
 * @author   Timothy Prinzing
 * @since 1.2
 */
export class BoxLayout extends JObject {
  /**
   * Specifies that components should be laid out left to right.
   */
  static readonly X_AXIS: number = 0;
  /**
   * Specifies that components should be laid out top to bottom.
   */
  static readonly Y_AXIS: number = 1;
  /**
   * Specifies that components should be laid out in the direction of
   * a line of text as determined by the target container's
   * {@code ComponentOrientation} property.
   */
  static readonly LINE_AXIS: number = 2;
  /**
   * Specifies that components should be laid out in the direction that
   * lines flow across a page as determined by the target container's
   * {@code ComponentOrientation} property.
   */
  static readonly PAGE_AXIS: number = 3;
  axis: number = 0;
  target: Container = null;
  xChildren: SizeRequirements[] = null;
  yChildren: SizeRequirements[] = null;
  xTotal: SizeRequirements = null;
  yTotal: SizeRequirements = null;
  dbg: PrintStream = null;
  /**
   * Creates a layout manager that will lay out components along the
   * given axis.
   *
   * @param target  the container that needs to be laid out
   * @param axis  the axis to lay out components along. Can be one of:
   *              {@code BoxLayout.X_AXIS, BoxLayout.Y_AXIS,
   *              BoxLayout.LINE_AXIS} or {@code BoxLayout.PAGE_AXIS}
   *
   * @throws AWTError  if the value of {@code axis} is invalid
   */
  _BoxLayout$Container$int(target: Container, axis: number): this {
    if (axis !== BoxLayout.X_AXIS && axis !== BoxLayout.Y_AXIS && axis !== BoxLayout.LINE_AXIS && axis !== BoxLayout.PAGE_AXIS) {
      throw new AWTError()._AWTError('Invalid axis');
    }
    this.axis = axis;
    this.target = target;
    return this;
  }
  /**
   * Indicates that a child has changed its layout related information,
   * and thus any cached calculations should be flushed.
   * <p>
   * This method is called by AWT when the invalidate method is called
   * on the Container.  Since the invalidate method may be called
   * asynchronously to the event thread, this method may be called
   * asynchronously.
   *
   * @param target  the affected container
   *
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   */
  invalidateLayout(target: Container): void {
    this.checkContainer(target);
    this.xChildren = null;
    this.yChildren = null;
    this.xTotal = null;
    this.yTotal = null;
  }
  /**
   * Not used by this class.
   *
   * @param name the name of the component
   * @param comp the component
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
    this.invalidateLayout(comp.getParent());
  }
  /**
   * Not used by this class.
   *
   * @param comp the component
   */
  removeLayoutComponent(comp: Component): void {
    this.invalidateLayout(comp.getParent());
  }
  /**
   * Not used by this class.
   *
   * @param comp the component
   * @param constraints constraints
   */
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
    this.invalidateLayout(comp.getParent());
  }
  /**
   * Returns the preferred dimensions for this layout, given the components
   * in the specified target container.
   *
   * @param target  the container that needs to be laid out
   * @return the dimensions &gt;= 0 &amp;&amp; &lt;= Integer.MAX_VALUE
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   * @see Container
   * @see #minimumLayoutSize
   * @see #maximumLayoutSize
   */
  preferredLayoutSize(target: Container): Dimension {
    let size: Dimension;
    {
      this.checkContainer(target);
      this.checkRequests();
      size = new Dimension()._Dimension$int$int(this.xTotal.preferred_, this.yTotal.preferred_);
    }
    let insets = target.getInsets$();
    size.width_ = (Math.min(size.width_ + insets.left + insets.right, 2147483647)) | 0;
    size.height_ = (Math.min(size.height_ + insets.top + insets.bottom, 2147483647)) | 0;
    return size;
  }
  /**
   * Returns the minimum dimensions needed to lay out the components
   * contained in the specified target container.
   *
   * @param target  the container that needs to be laid out
   * @return the dimensions &gt;= 0 &amp;&amp; &lt;= Integer.MAX_VALUE
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   * @see #preferredLayoutSize
   * @see #maximumLayoutSize
   */
  minimumLayoutSize(target: Container): Dimension {
    let size: Dimension;
    {
      this.checkContainer(target);
      this.checkRequests();
      size = new Dimension()._Dimension$int$int(this.xTotal.minimum, this.yTotal.minimum);
    }
    let insets = target.getInsets$();
    size.width_ = (Math.min(size.width_ + insets.left + insets.right, 2147483647)) | 0;
    size.height_ = (Math.min(size.height_ + insets.top + insets.bottom, 2147483647)) | 0;
    return size;
  }
  /**
   * Returns the maximum dimensions the target container can use
   * to lay out the components it contains.
   *
   * @param target  the container that needs to be laid out
   * @return the dimensions &gt;= 0 &amp;&amp; &lt;= Integer.MAX_VALUE
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   * @see #preferredLayoutSize
   * @see #minimumLayoutSize
   */
  maximumLayoutSize(target: Container): Dimension {
    let size: Dimension;
    {
      this.checkContainer(target);
      this.checkRequests();
      size = new Dimension()._Dimension$int$int(this.xTotal.maximum, this.yTotal.maximum);
    }
    let insets = target.getInsets$();
    size.width_ = (Math.min(size.width_ + insets.left + insets.right, 2147483647)) | 0;
    size.height_ = (Math.min(size.height_ + insets.top + insets.bottom, 2147483647)) | 0;
    return size;
  }
  /**
   * Returns the alignment along the X axis for the container.
   * If the box is horizontal, the default
   * alignment will be returned. Otherwise, the alignment needed
   * to place the children along the X axis will be returned.
   *
   * @param target  the container
   * @return the alignment &gt;= 0.0f &amp;&amp; &lt;= 1.0f
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   */
  getLayoutAlignmentX(target: Container): number {
    this.checkContainer(target);
    this.checkRequests();
    return this.xTotal.alignment;
  }
  /**
   * Returns the alignment along the Y axis for the container.
   * If the box is vertical, the default
   * alignment will be returned. Otherwise, the alignment needed
   * to place the children along the Y axis will be returned.
   *
   * @param target  the container
   * @return the alignment &gt;= 0.0f &amp;&amp; &lt;= 1.0f
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   */
  getLayoutAlignmentY(target: Container): number {
    this.checkContainer(target);
    this.checkRequests();
    return this.yTotal.alignment;
  }
  /**
   * Called by the AWT <!-- XXX CHECK! --> when the specified container
   * needs to be laid out.
   *
   * @param target  the container to lay out
   *
   * @throws AWTError  if the target isn't the container specified to the
   *                      BoxLayout constructor
   */
  layoutContainer$Container(target: Container): void {
    this.checkContainer(target);
    let nChildren = target.getComponentCount();
    let xOffsets = $J.newArray(nChildren, 0);
    let xSpans = $J.newArray(nChildren, 0);
    let yOffsets = $J.newArray(nChildren, 0);
    let ySpans = $J.newArray(nChildren, 0);
    let alloc = target.getSize$();
    let in$ = target.getInsets$();
    alloc.width_ = (alloc.width_ - (in$.left + in$.right)) | 0;
    alloc.height_ = (alloc.height_ - (in$.top + in$.bottom)) | 0;
    let o = target.getComponentOrientation();
    let absoluteAxis = this.resolveAxis(this.axis, o);
    let ltr = (absoluteAxis !== this.axis) ? o.isLeftToRight() : true;
    {
      this.checkRequests();
      if (absoluteAxis === BoxLayout.X_AXIS) {
        SizeRequirements.calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean(alloc.width_, this.xTotal, this.xChildren, xOffsets, xSpans, ltr);
        SizeRequirements.calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr(alloc.height_, this.yTotal, this.yChildren, yOffsets, ySpans);
      } else {
        SizeRequirements.calculateAlignedPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr$boolean(alloc.width_, this.xTotal, this.xChildren, xOffsets, xSpans, ltr);
        SizeRequirements.calculateTiledPositions$int$SizeRequirements$SizeRequirementsArr$intArr$intArr(alloc.height_, this.yTotal, this.yChildren, yOffsets, ySpans);
      }
    }
    for (let i = 0; i < nChildren; i++) {
      let c = target.getComponent$int(i);
      c.setBounds$int$int$int$int((Math.min(in$.left + xOffsets[i], 2147483647)) | 0, (Math.min(in$.top + yOffsets[i], 2147483647)) | 0, xSpans[i], ySpans[i]);
    }
    if (this.dbg != null) {
      for (let i = 0; i < nChildren; i++) {
        let c = target.getComponent$int(i);
        this.dbg.println(c.toString());
        this.dbg.println('X: ' + $J.str(this.xChildren[i]));
        this.dbg.println('Y: ' + $J.str(this.yChildren[i]));
      }
    }
  }
  checkContainer(target: Container): void {
    if (this.target !== target) {
      throw new AWTError()._AWTError('BoxLayout can\'t be shared');
    }
  }
  checkRequests(): void {
    if (this.xChildren == null || this.yChildren == null) {
      let n = this.target.getComponentCount();
      this.xChildren = $J.newArray(n, null);
      this.yChildren = $J.newArray(n, null);
      for (let i = 0; i < n; i++) {
        let c = this.target.getComponent$int(i);
        if (!c.isVisible$()) {
          this.xChildren[i] = new SizeRequirements()._SizeRequirements$int$int$int$float(0, 0, 0, c.getAlignmentX());
          this.yChildren[i] = new SizeRequirements()._SizeRequirements$int$int$int$float(0, 0, 0, c.getAlignmentY());
          continue;
        }
        let min = c.getMinimumSize$();
        let typ = c.getPreferredSize$();
        let max = c.getMaximumSize();
        this.xChildren[i] = new SizeRequirements()._SizeRequirements$int$int$int$float(min.width_, typ.width_, max.width_, c.getAlignmentX());
        this.yChildren[i] = new SizeRequirements()._SizeRequirements$int$int$int$float(min.height_, typ.height_, max.height_, c.getAlignmentY());
      }
      let absoluteAxis = this.resolveAxis(this.axis, this.target.getComponentOrientation());
      if (absoluteAxis === BoxLayout.X_AXIS) {
        this.xTotal = SizeRequirements.getTiledSizeRequirements(this.xChildren);
        this.yTotal = SizeRequirements.getAlignedSizeRequirements(this.yChildren);
      } else {
        this.xTotal = SizeRequirements.getAlignedSizeRequirements(this.xChildren);
        this.yTotal = SizeRequirements.getTiledSizeRequirements(this.yChildren);
      }
    }
  }
  /**
   * Given one of the 4 axis values, resolve it to an absolute axis.
   * The relative axis values, PAGE_AXIS and LINE_AXIS, are converted
   * to their absolute counterpart given the target's ComponentOrientation
   * value.  The absolute axes, X_AXIS and Y_AXIS, are returned unmodified.
   *
   * @param axis the axis to resolve
   * @param o the ComponentOrientation to resolve against
   * @return the resolved axis
   */
  resolveAxis(axis: number, o: ComponentOrientation): number {
    let absoluteAxis: number;
    if (axis === BoxLayout.LINE_AXIS) {
      absoluteAxis = o.isHorizontal() ? BoxLayout.X_AXIS : BoxLayout.Y_AXIS;
    } else if (axis === BoxLayout.PAGE_AXIS) {
      absoluteAxis = o.isHorizontal() ? BoxLayout.Y_AXIS : BoxLayout.X_AXIS;
    } else {
      absoluteAxis = axis;
    }
    return absoluteAxis;
  }
}

$J.define(BoxLayout, 'javax.swing.BoxLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.Container,int,java.io.PrintStream': '_BoxLayout$Container$int$PrintStream', 'java.awt.Container,int': '_BoxLayout$Container$int' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  AWTError = $J.load('java.awt.AWTError');
  Dimension = $J.load('java.awt.Dimension');
  SizeRequirements = $J.load('javax.swing.SizeRequirements');
});
