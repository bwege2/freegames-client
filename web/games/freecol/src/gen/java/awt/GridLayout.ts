// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GridLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject } from '../../../jre/index.ts';

let Dimension;

/**
 * The {@code GridLayout} class is a layout manager that
 * lays out a container's components in a rectangular grid.
 * The container is divided into equal-sized rectangles,
 * and one component is placed in each rectangle.
 * For example, the following is an applet that lays out six buttons
 * into three rows and two columns:
 *
 * <hr><blockquote>
 * <pre>
 * import java.awt.*;
 * import java.applet.Applet;
 * public class ButtonGrid extends Applet {
 *     public void init() {
 *         setLayout(new GridLayout(3,2));
 *         add(new Button("1"));
 *         add(new Button("2"));
 *         add(new Button("3"));
 *         add(new Button("4"));
 *         add(new Button("5"));
 *         add(new Button("6"));
 *     }
 * }
 * </pre></blockquote><hr>
 * <p>
 * If the container's {@code ComponentOrientation} property is horizontal
 * and left-to-right, the above example produces the output shown in Figure 1.
 * If the container's {@code ComponentOrientation} property is horizontal
 * and right-to-left, the example produces the output shown in Figure 2.
 *
 * <div style="margin:0 auto;width:600px;text-align:center;font-weight:bold">
 *   <div style="float:left">
 *     <p><img SRC="doc-files/GridLayout-1.gif"
 *        alt="Shows 6 buttons in rows of 2. Row 1 shows buttons 1 then 2.
 *        Row 2 shows buttons 3 then 4. Row 3 shows buttons 5 then 6.">
 *     <p>Figure 1: Horizontal, Left-to-Right
 *   </div>
 *   <div style="float:right">
 *     <p><img SRC="doc-files/GridLayout-2.gif"
 *        alt="Shows 6 buttons in rows of 2. Row 1 shows buttons 2 then 1.
 *        Row 2 shows buttons 4 then 3. Row 3 shows buttons 6 then 5.">
 *     <p>Figure 2: Horizontal, Right-to-Left
 *   </div>
 *   <br style="clear:both;">
 * </div>
 * <p>
 * When both the number of rows and the number of columns have
 * been set to non-zero values, either by a constructor or
 * by the {@code setRows} and {@code setColumns} methods, the number of
 * columns specified is ignored.  Instead, the number of
 * columns is determined from the specified number of rows
 * and the total number of components in the layout. So, for
 * example, if three rows and two columns have been specified
 * and nine components are added to the layout, they will
 * be displayed as three rows of three columns.  Specifying
 * the number of columns affects the layout only when the
 * number of rows is set to zero.
 *
 * @author  Arthur van Hoff
 * @since   1.0
 */
export class GridLayout extends JObject {
  /**
   * This is the horizontal gap (in pixels) which specifies the space
   * between columns.  They can be changed at any time.
   * This should be a non-negative integer.
   *
   * @serial
   * @see #getHgap()
   * @see #setHgap(int)
   */
  hgap: number = 0;
  /**
   * This is the vertical gap (in pixels) which specifies the space
   * between rows.  They can be changed at any time.
   * This should be a non negative integer.
   *
   * @serial
   * @see #getVgap()
   * @see #setVgap(int)
   */
  vgap: number = 0;
  /**
   * This is the number of rows specified for the grid.  The number
   * of rows can be changed at any time.
   * This should be a non negative integer, where '0' means
   * 'any number' meaning that the number of Rows in that
   * dimension depends on the other dimension.
   *
   * @serial
   * @see #getRows()
   * @see #setRows(int)
   */
  rows: number = 0;
  /**
   * This is the number of columns specified for the grid.  The number
   * of columns can be changed at any time.
   * This should be a non negative integer, where '0' means
   * 'any number' meaning that the number of Columns in that
   * dimension depends on the other dimension.
   *
   * @serial
   * @see #getColumns()
   * @see #setColumns(int)
   */
  cols: number = 0;
  /**
   * Creates a grid layout with the specified number of rows and
   * columns. All components in the layout are given equal size.
   * <p>
   * One, but not both, of {@code rows} and {@code cols} can
   * be zero, which means that any number of objects can be placed in a
   * row or in a column.
   * @param     rows   the rows, with the value zero meaning
   *                   any number of rows.
   * @param     cols   the columns, with the value zero meaning
   *                   any number of columns.
   */
  _GridLayout$int$int(rows: number, cols: number): this {
    this._GridLayout$int$int$int$int(rows, cols, 0, 0);
    return this;
  }
  /**
   * Creates a grid layout with the specified number of rows and
   * columns. All components in the layout are given equal size.
   * <p>
   * In addition, the horizontal and vertical gaps are set to the
   * specified values. Horizontal gaps are placed between each
   * of the columns. Vertical gaps are placed between each of
   * the rows.
   * <p>
   * One, but not both, of {@code rows} and {@code cols} can
   * be zero, which means that any number of objects can be placed in a
   * row or in a column.
   * <p>
   * All {@code GridLayout} constructors defer to this one.
   * @param     rows   the rows, with the value zero meaning
   *                   any number of rows
   * @param     cols   the columns, with the value zero meaning
   *                   any number of columns
   * @param     hgap   the horizontal gap
   * @param     vgap   the vertical gap
   * @throws   IllegalArgumentException  if the value of both
   *                  {@code rows} and {@code cols} is
   *                  set to zero
   */
  _GridLayout$int$int$int$int(rows: number, cols: number, hgap: number, vgap: number): this {
    if ((rows === 0) && (cols === 0)) {
      throw new IllegalArgumentException('rows and cols cannot both be zero');
    }
    this.rows = rows;
    this.cols = cols;
    this.hgap = hgap;
    this.vgap = vgap;
    return this;
  }
  /**
   * Sets the horizontal gap between components to the specified value.
   * @param        hgap   the horizontal gap between components
   * @since        1.1
   */
  setHgap(hgap: number): void {
    this.hgap = hgap;
  }
  /**
   * Adds the specified component with the specified name to the layout.
   * @param name the name of the component
   * @param comp the component to be added
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  /**
   * Removes the specified component from the layout.
   * @param comp the component to be removed
   */
  removeLayoutComponent(comp: Component): void {
  }
  /**
   * Determines the preferred size of the container argument using
   * this grid layout.
   * <p>
   * The preferred width of a grid layout is the largest preferred
   * width of all of the components in the container times the number of
   * columns, plus the horizontal padding times the number of columns
   * minus one, plus the left and right insets of the target container.
   * <p>
   * The preferred height of a grid layout is the largest preferred
   * height of all of the components in the container times the number of
   * rows, plus the vertical padding times the number of rows minus one,
   * plus the top and bottom insets of the target container.
   *
   * @param     parent   the container in which to do the layout
   * @return    the preferred dimensions to lay out the
   *                      subcomponents of the specified container
   * @see       java.awt.GridLayout#minimumLayoutSize
   * @see       java.awt.Container#getPreferredSize()
   */
  preferredLayoutSize(parent: Container): Dimension {
    {
      let insets = parent.getInsets$();
      let ncomponents = parent.getComponentCount();
      let nrows = this.rows;
      let ncols = this.cols;
      if (nrows > 0) {
        ncols = $J.idiv(((ncomponents + nrows - 1) | 0), nrows);
      } else {
        nrows = $J.idiv(((ncomponents + ncols - 1) | 0), ncols);
      }
      let w = 0;
      let h = 0;
      for (let i = 0; i < ncomponents; i++) {
        let comp = parent.getComponent$int(i);
        let d = comp.getPreferredSize$();
        if (w < d.width_) {
          w = d.width_;
        }
        if (h < d.height_) {
          h = d.height_;
        }
      }
      return new Dimension()._Dimension$int$int((insets.left + insets.right + Math.imul(ncols, w) + Math.imul(((ncols - 1) | 0), this.hgap)) | 0, (insets.top + insets.bottom + Math.imul(nrows, h) + Math.imul(((nrows - 1) | 0), this.vgap)) | 0);
    }
  }
  /**
   * Determines the minimum size of the container argument using this
   * grid layout.
   * <p>
   * The minimum width of a grid layout is the largest minimum width
   * of all of the components in the container times the number of columns,
   * plus the horizontal padding times the number of columns minus one,
   * plus the left and right insets of the target container.
   * <p>
   * The minimum height of a grid layout is the largest minimum height
   * of all of the components in the container times the number of rows,
   * plus the vertical padding times the number of rows minus one, plus
   * the top and bottom insets of the target container.
   *
   * @param       parent   the container in which to do the layout
   * @return      the minimum dimensions needed to lay out the
   *                      subcomponents of the specified container
   * @see         java.awt.GridLayout#preferredLayoutSize
   * @see         java.awt.Container#doLayout
   */
  minimumLayoutSize(parent: Container): Dimension {
    {
      let insets = parent.getInsets$();
      let ncomponents = parent.getComponentCount();
      let nrows = this.rows;
      let ncols = this.cols;
      if (nrows > 0) {
        ncols = $J.idiv(((ncomponents + nrows - 1) | 0), nrows);
      } else {
        nrows = $J.idiv(((ncomponents + ncols - 1) | 0), ncols);
      }
      let w = 0;
      let h = 0;
      for (let i = 0; i < ncomponents; i++) {
        let comp = parent.getComponent$int(i);
        let d = comp.getMinimumSize$();
        if (w < d.width_) {
          w = d.width_;
        }
        if (h < d.height_) {
          h = d.height_;
        }
      }
      return new Dimension()._Dimension$int$int((insets.left + insets.right + Math.imul(ncols, w) + Math.imul(((ncols - 1) | 0), this.hgap)) | 0, (insets.top + insets.bottom + Math.imul(nrows, h) + Math.imul(((nrows - 1) | 0), this.vgap)) | 0);
    }
  }
  /**
   * Lays out the specified container using this layout.
   * <p>
   * This method reshapes the components in the specified target
   * container in order to satisfy the constraints of the
   * {@code GridLayout} object.
   * <p>
   * The grid layout manager determines the size of individual
   * components by dividing the free space in the container into
   * equal-sized portions according to the number of rows and columns
   * in the layout. The container's free space equals the container's
   * size minus any insets and any specified horizontal or vertical
   * gap. All components in a grid layout are given the same size.
   *
   * @param      parent   the container in which to do the layout
   * @see        java.awt.Container
   * @see        java.awt.Container#doLayout
   */
  layoutContainer$Container(parent: Container): void {
    {
      let insets = parent.getInsets$();
      let ncomponents = parent.getComponentCount();
      let nrows = this.rows;
      let ncols = this.cols;
      let ltr = parent.getComponentOrientation().isLeftToRight();
      if (ncomponents === 0) {
        return;
      }
      if (nrows > 0) {
        ncols = $J.idiv(((ncomponents + nrows - 1) | 0), nrows);
      } else {
        nrows = $J.idiv(((ncomponents + ncols - 1) | 0), ncols);
      }
      let totalGapsWidth = Math.imul(((ncols - 1) | 0), this.hgap);
      let widthWOInsets = (parent.width_ - (insets.left + insets.right)) | 0;
      let widthOnComponent = $J.idiv(((widthWOInsets - totalGapsWidth) | 0), ncols);
      let extraWidthAvailable = $J.idiv(((widthWOInsets - (Math.imul(widthOnComponent, ncols) + totalGapsWidth)) | 0), 2);
      let totalGapsHeight = Math.imul(((nrows - 1) | 0), this.vgap);
      let heightWOInsets = (parent.height_ - (insets.top + insets.bottom)) | 0;
      let heightOnComponent = $J.idiv(((heightWOInsets - totalGapsHeight) | 0), nrows);
      let extraHeightAvailable = $J.idiv(((heightWOInsets - (Math.imul(heightOnComponent, nrows) + totalGapsHeight)) | 0), 2);
      if (ltr) {
        for (let c = 0, x = (insets.left + extraWidthAvailable) | 0; c < ncols; c++, x = (x + (widthOnComponent + this.hgap)) | 0) {
          for (let r = 0, y = (insets.top + extraHeightAvailable) | 0; r < nrows; r++, y = (y + (heightOnComponent + this.vgap)) | 0) {
            let i = (Math.imul(r, ncols) + c) | 0;
            if (i < ncomponents) {
              parent.getComponent$int(i).setBounds$int$int$int$int(x, y, widthOnComponent, heightOnComponent);
            }
          }
        }
      } else {
        for (let c = 0, x = (parent.width_ - insets.right - widthOnComponent - extraWidthAvailable) | 0; c < ncols; c++, x = (x - (widthOnComponent + this.hgap)) | 0) {
          for (let r = 0, y = (insets.top + extraHeightAvailable) | 0; r < nrows; r++, y = (y + (heightOnComponent + this.vgap)) | 0) {
            let i = (Math.imul(r, ncols) + c) | 0;
            if (i < ncomponents) {
              parent.getComponent$int(i).setBounds$int$int$int$int(x, y, widthOnComponent, heightOnComponent);
            }
          }
        }
      }
    }
  }
  /**
   * Returns the string representation of this grid layout's values.
   * @return     a string representation of this grid layout
   */
  toString(): string {
    return $J.getClass(this).getName() + '[hgap=' + this.hgap + ',vgap=' + this.vgap + ',rows=' + this.rows + ',cols=' + this.cols + ']';
  }
}

$J.define(GridLayout, 'java.awt.GridLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_GridLayout$int$int$int$int', 'int,int': '_GridLayout$int$int', '': '_GridLayout$' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
