// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GridBagLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Arrays, Hashtable, IllegalArgumentException, JObject } from '../../../jre/index.ts';

let Component$BaselineResizeBehavior, Dimension, GridBagConstraints, GridBagLayoutInfo, Rectangle;

/**
 * The {@code GridBagLayout} class is a flexible layout
 * manager that aligns components vertically, horizontally or along their
 * baseline without requiring that the components be of the same size.
 * Each {@code GridBagLayout} object maintains a dynamic,
 * rectangular grid of cells, with each component occupying
 * one or more cells, called its <em>display area</em>.
 * <p>
 * Each component managed by a {@code GridBagLayout} is associated with
 * an instance of {@link GridBagConstraints}.  The constraints object
 * specifies where a component's display area should be located on the grid
 * and how the component should be positioned within its display area.  In
 * addition to its constraints object, the {@code GridBagLayout} also
 * considers each component's minimum and preferred sizes in order to
 * determine a component's size.
 * <p>
 * The overall orientation of the grid depends on the container's
 * {@link ComponentOrientation} property.  For horizontal left-to-right
 * orientations, grid coordinate (0,0) is in the upper left corner of the
 * container with x increasing to the right and y increasing downward.  For
 * horizontal right-to-left orientations, grid coordinate (0,0) is in the upper
 * right corner of the container with x increasing to the left and y
 * increasing downward.
 * <p>
 * To use a grid bag layout effectively, you must customize one or more
 * of the {@code GridBagConstraints} objects that are associated
 * with its components. You customize a {@code GridBagConstraints}
 * object by setting one or more of its instance variables:
 *
 * <dl>
 * <dt>{@link GridBagConstraints#gridx},
 * {@link GridBagConstraints#gridy}
 * <dd>Specifies the cell containing the leading corner of the component's
 * display area, where the cell at the origin of the grid has address
 * <code>gridx&nbsp;=&nbsp;0</code>,
 * <code>gridy&nbsp;=&nbsp;0</code>.  For horizontal left-to-right layout,
 * a component's leading corner is its upper left.  For horizontal
 * right-to-left layout, a component's leading corner is its upper right.
 * Use {@code GridBagConstraints.RELATIVE} (the default value)
 * to specify that the component be placed immediately following
 * (along the x axis for {@code gridx} or the y axis for
 * {@code gridy}) the component that was added to the container
 * just before this component was added.
 * <dt>{@link GridBagConstraints#gridwidth},
 * {@link GridBagConstraints#gridheight}
 * <dd>Specifies the number of cells in a row (for {@code gridwidth})
 * or column (for {@code gridheight})
 * in the component's display area.
 * The default value is 1.
 * Use {@code GridBagConstraints.REMAINDER} to specify
 * that the component's display area will be from {@code gridx}
 * to the last cell in the row (for {@code gridwidth})
 * or from {@code gridy} to the last cell in the column
 * (for {@code gridheight}).
 *
 * Use {@code GridBagConstraints.RELATIVE} to specify
 * that the component's display area will be from {@code gridx}
 * to the next to the last cell in its row (for {@code gridwidth})
 * or from {@code gridy} to the next to the last cell in its
 * column (for {@code gridheight}).
 *
 * <dt>{@link GridBagConstraints#fill}
 * <dd>Used when the component's display area
 * is larger than the component's requested size
 * to determine whether (and how) to resize the component.
 * Possible values are
 * {@code GridBagConstraints.NONE} (the default),
 * {@code GridBagConstraints.HORIZONTAL}
 * (make the component wide enough to fill its display area
 * horizontally, but don't change its height),
 * {@code GridBagConstraints.VERTICAL}
 * (make the component tall enough to fill its display area
 * vertically, but don't change its width), and
 * {@code GridBagConstraints.BOTH}
 * (make the component fill its display area entirely).
 * <dt>{@link GridBagConstraints#ipadx},
 * {@link GridBagConstraints#ipady}
 * <dd>Specifies the component's internal padding within the layout,
 * how much to add to the minimum size of the component.
 * The width of the component will be at least its minimum width
 * plus {@code ipadx} pixels. Similarly, the height of
 * the component will be at least the minimum height plus
 * {@code ipady} pixels.
 * <dt>{@link GridBagConstraints#insets}
 * <dd>Specifies the component's external padding, the minimum
 * amount of space between the component and the edges of its display area.
 * <dt>{@link GridBagConstraints#anchor}
 * <dd>Specifies where the component should be positioned in its display area.
 * There are three kinds of possible values: absolute, orientation-relative,
 * and baseline-relative.
 * Orientation relative values are interpreted relative to the container's
 * {@code ComponentOrientation} property while absolute values
 * are not.  Baseline relative values are calculated relative to the
 * baseline.  Valid values are:
 *
 * <ul>
 *   <li>Absolute Values:
 *     <ul>
 *       <li>{@code GridBagConstraints.NORTH}
 *       <li>{@code GridBagConstraints.SOUTH}
 *       <li>{@code GridBagConstraints.WEST}
 *       <li>{@code GridBagConstraints.EAST}
 *       <li>{@code GridBagConstraints.NORTHWEST}
 *       <li>{@code GridBagConstraints.NORTHEAST}
 *       <li>{@code GridBagConstraints.SOUTHWEST}
 *       <li>{@code GridBagConstraints.SOUTHEAST}
 *       <li>{@code GridBagConstraints.CENTER} (the default)
 *     </ul>
 *   <li>Orientation Relative Values:
 *     <ul >
 *       <li>{@code GridBagConstraints.PAGE_START}
 *       <li>{@code GridBagConstraints.PAGE_END}
 *       <li>{@code GridBagConstraints.LINE_START}
 *       <li>{@code GridBagConstraints.LINE_END}
 *       <li>{@code GridBagConstraints.FIRST_LINE_START}
 *       <li>{@code GridBagConstraints.FIRST_LINE_END}
 *       <li>{@code GridBagConstraints.LAST_LINE_START}
 *       <li>{@code GridBagConstraints.LAST_LINE_END}
 *     </ul>
 *   <li>Baseline Relative Values:
 *     <ul>
 *       <li>{@code GridBagConstraints.BASELINE}
 *       <li>{@code GridBagConstraints.BASELINE_LEADING}
 *       <li>{@code GridBagConstraints.BASELINE_TRAILING}
 *       <li>{@code GridBagConstraints.ABOVE_BASELINE}
 *       <li>{@code GridBagConstraints.ABOVE_BASELINE_LEADING}
 *       <li>{@code GridBagConstraints.ABOVE_BASELINE_TRAILING}
 *       <li>{@code GridBagConstraints.BELOW_BASELINE}
 *       <li>{@code GridBagConstraints.BELOW_BASELINE_LEADING}
 *       <li>{@code GridBagConstraints.BELOW_BASELINE_TRAILING}
 *     </ul>
 * </ul>
 * <dt>{@link GridBagConstraints#weightx},
 * {@link GridBagConstraints#weighty}
 * <dd>Used to determine how to distribute space, which is
 * important for specifying resizing behavior.
 * Unless you specify a weight for at least one component
 * in a row ({@code weightx}) and column ({@code weighty}),
 * all the components clump together in the center of their container.
 * This is because when the weight is zero (the default),
 * the {@code GridBagLayout} object puts any extra space
 * between its grid of cells and the edges of the container.
 * </dl>
 * <p>
 * Each row may have a baseline; the baseline is determined by the
 * components in that row that have a valid baseline and are aligned
 * along the baseline (the component's anchor value is one of {@code
 * BASELINE}, {@code BASELINE_LEADING} or {@code BASELINE_TRAILING}).
 * If none of the components in the row has a valid baseline, the row
 * does not have a baseline.
 * <p>
 * If a component spans rows it is aligned either to the baseline of
 * the start row (if the baseline-resize behavior is {@code
 * CONSTANT_ASCENT}) or the end row (if the baseline-resize behavior
 * is {@code CONSTANT_DESCENT}).  The row that the component is
 * aligned to is called the <em>prevailing row</em>.
 * <p>
 * The following figure shows a baseline layout and includes a
 * component that spans rows:
 * <p style="text-align: center">
 *   <img src="doc-files/GridBagLayout-baseline.png"
 *   alt="The following text describes this graphic (Figure 1).">
 * </p>
 * This layout consists of three components:
 * <ul><li>A panel that starts in row 0 and ends in row 1.  The panel
 *   has a baseline-resize behavior of {@code CONSTANT_DESCENT} and has
 *   an anchor of {@code BASELINE}.  As the baseline-resize behavior
 *   is {@code CONSTANT_DESCENT} the prevailing row for the panel is
 *   row 1.
 * <li>Two buttons, each with a baseline-resize behavior of
 *   {@code CENTER_OFFSET} and an anchor of {@code BASELINE}.
 * </ul>
 * Because the second button and the panel share the same prevailing row,
 * they are both aligned along their baseline.
 * <p>
 * Components positioned using one of the baseline-relative values resize
 * differently than when positioned using an absolute or orientation-relative
 * value.  How components change is dictated by how the baseline of the
 * prevailing row changes.  The baseline is anchored to the
 * bottom of the display area if any components with the same prevailing row
 * have a baseline-resize behavior of {@code CONSTANT_DESCENT},
 * otherwise the baseline is anchored to the top of the display area.
 * The following rules dictate the resize behavior:
 * <ul>
 * <li>Resizable components positioned above the baseline can only
 * grow as tall as the baseline.  For example, if the baseline is at 100
 * and anchored at the top, a resizable component positioned above the
 * baseline can never grow more than 100 units.
 * <li>Similarly, resizable components positioned below the baseline can
 * only grow as high as the difference between the display height and the
 * baseline.
 * <li>Resizable components positioned on the baseline with a
 * baseline-resize behavior of {@code OTHER} are only resized if
 * the baseline at the resized size fits within the display area.  If
 * the baseline is such that it does not fit within the display area
 * the component is not resized.
 * <li>Components positioned on the baseline that do not have a
 * baseline-resize behavior of {@code OTHER}
 * can only grow as tall as {@code display height - baseline + baseline of component}.
 * </ul>
 * If you position a component along the baseline, but the
 * component does not have a valid baseline, it will be vertically centered
 * in its space.  Similarly if you have positioned a component relative
 * to the baseline and none of the components in the row have a valid
 * baseline the component is vertically centered.
 * <p>
 * The following figures show ten components (all buttons)
 * managed by a grid bag layout.  Figure 2 shows the layout for a horizontal,
 * left-to-right container and Figure 3 shows the layout for a horizontal,
 * right-to-left container.
 *
 * <div style="margin:0 auto;width:680px;text-align:center;font-weight:bold">
 *   <div style="float:left">
 *     <p><img src="doc-files/GridBagLayout-1.gif"
 *        alt="The preceding text describes this graphic (Figure 2)."
 *        style="margin: 7px 10px;">
 *     <p>Figure 2: Horizontal, Left-to-Right
 *   </div>
 *   <div style="float:right">
 *     <p><img src="doc-files/GridBagLayout-2.gif"
 *        alt="The preceding text describes this graphic (Figure 3)."
 *        style="margin: 7px 10px;">
 *     <p>Figure 3: Horizontal, Right-to-Left
 *   </div>
 *   <br style="clear:both;">
 * </div>
 * <p>
 * Each of the ten components has the {@code fill} field
 * of its associated {@code GridBagConstraints} object
 * set to {@code GridBagConstraints.BOTH}.
 * In addition, the components have the following non-default constraints:
 *
 * <ul>
 * <li>Button1, Button2, Button3: <code>weightx&nbsp;=&nbsp;1.0</code>
 * <li>Button4: <code>weightx&nbsp;=&nbsp;1.0</code>,
 * <code>gridwidth&nbsp;=&nbsp;GridBagConstraints.REMAINDER</code>
 * <li>Button5: <code>gridwidth&nbsp;=&nbsp;GridBagConstraints.REMAINDER</code>
 * <li>Button6: <code>gridwidth&nbsp;=&nbsp;GridBagConstraints.RELATIVE</code>
 * <li>Button7: <code>gridwidth&nbsp;=&nbsp;GridBagConstraints.REMAINDER</code>
 * <li>Button8: <code>gridheight&nbsp;=&nbsp;2</code>,
 * <code>weighty&nbsp;=&nbsp;1.0</code>
 * <li>Button9, Button 10:
 * <code>gridwidth&nbsp;=&nbsp;GridBagConstraints.REMAINDER</code>
 * </ul>
 * <p>
 * Here is the code that implements the example shown above:
 *
 * <hr><blockquote><pre>
 * import java.awt.*;
 * import java.util.*;
 * import java.applet.Applet;
 *
 * public class GridBagEx1 extends Applet {
 *
 *     protected void makebutton(String name,
 *                               GridBagLayout gridbag,
 *                               GridBagConstraints c) {
 *         Button button = new Button(name);
 *         gridbag.setConstraints(button, c);
 *         add(button);
 *     }
 *
 *     public void init() {
 *         GridBagLayout gridbag = new GridBagLayout();
 *         GridBagConstraints c = new GridBagConstraints();
 *
 *         setFont(new Font("SansSerif", Font.PLAIN, 14));
 *         setLayout(gridbag);
 *
 *         c.fill = GridBagConstraints.BOTH;
 *         c.weightx = 1.0;
 *         makebutton("Button1", gridbag, c);
 *         makebutton("Button2", gridbag, c);
 *         makebutton("Button3", gridbag, c);
 *
 *         c.gridwidth = GridBagConstraints.REMAINDER; //end row
 *         makebutton("Button4", gridbag, c);
 *
 *         c.weightx = 0.0;                //reset to the default
 *         makebutton("Button5", gridbag, c); //another row
 *
 *         c.gridwidth = GridBagConstraints.RELATIVE; //next-to-last in row
 *         makebutton("Button6", gridbag, c);
 *
 *         c.gridwidth = GridBagConstraints.REMAINDER; //end row
 *         makebutton("Button7", gridbag, c);
 *
 *         c.gridwidth = 1;                //reset to the default
 *         c.gridheight = 2;
 *         c.weighty = 1.0;
 *         makebutton("Button8", gridbag, c);
 *
 *         c.weighty = 0.0;                //reset to the default
 *         c.gridwidth = GridBagConstraints.REMAINDER; //end row
 *         c.gridheight = 1;               //reset to the default
 *         makebutton("Button9", gridbag, c);
 *         makebutton("Button10", gridbag, c);
 *
 *         setSize(300, 100);
 *     }
 *
 *     public static void main(String args[]) {
 *         Frame f = new Frame("GridBag Layout Example");
 *         GridBagEx1 ex1 = new GridBagEx1();
 *
 *         ex1.init();
 *
 *         f.add("Center", ex1);
 *         f.pack();
 *         f.setSize(f.getPreferredSize());
 *         f.show();
 *     }
 * }
 * </pre></blockquote><hr>
 *
 * @author Doug Stein
 * @author Bill Spitzak (original NeWS &amp; OLIT implementation)
 * @see       java.awt.GridBagConstraints
 * @see       java.awt.GridBagLayoutInfo
 * @see       java.awt.ComponentOrientation
 * @since 1.0
 */
export class GridBagLayout extends JObject {
  static readonly EMPIRICMULTIPLIER: number = 2;
  /**
   * This field is no longer used to reserve arrays and kept for backward
   * compatibility. Previously, this was
   * the maximum number of grid positions (both horizontal and
   * vertical) that could be laid out by the grid bag layout.
   * Current implementation doesn't impose any limits
   * on the size of a grid.
   */
  static readonly MAXGRIDSIZE: number = 512;
  /**
   * The smallest grid that can be laid out by the grid bag layout.
   */
  static readonly MINSIZE: number = 1;
  /**
   * The preferred grid size that can be laid out by the grid bag layout.
   */
  static readonly PREFERREDSIZE: number = 2;
  /**
   * This hashtable maintains the association between
   * a component and its gridbag constraints.
   * The Keys in {@code comptable} are the components and the
   * values are the instances of {@code GridBagConstraints}.
   *
   * @serial
   * @see java.awt.GridBagConstraints
   */
  comptable: Hashtable<Component, GridBagConstraints> = null;
  /**
   * This field holds a gridbag constraints instance
   * containing the default values, so if a component
   * does not have gridbag constraints associated with
   * it, then the component will be assigned a
   * copy of the {@code defaultConstraints}.
   *
   * @serial
   * @see #getConstraints(Component)
   * @see #setConstraints(Component, GridBagConstraints)
   * @see #lookupConstraints(Component)
   */
  defaultConstraints: GridBagConstraints = null;
  /**
   * This field holds the layout information
   * for the gridbag.  The information in this field
   * is based on the most recent validation of the
   * gridbag.
   * If {@code layoutInfo} is {@code null}
   * this indicates that there are no components in
   * the gridbag or if there are components, they have
   * not yet been validated.
   *
   * @serial
   * @see #getLayoutInfo(Container, int)
   */
  layoutInfo: GridBagLayoutInfo = null;
  /**
   * This field holds the overrides to the column minimum
   * width.  If this field is non-{@code null} the values are
   * applied to the gridbag after all of the minimum columns
   * widths have been calculated.
   * If columnWidths has more elements than the number of
   * columns, columns are added to the gridbag to match
   * the number of elements in columnWidth.
   *
   * @serial
   * @see #getLayoutDimensions()
   */
  columnWidths: number[] = null;
  /**
   * This field holds the overrides to the row minimum
   * heights.  If this field is non-{@code null} the values are
   * applied to the gridbag after all of the minimum row
   * heights have been calculated.
   * If {@code rowHeights} has more elements than the number of
   * rows, rows are added to the gridbag to match
   * the number of elements in {@code rowHeights}.
   *
   * @serial
   * @see #getLayoutDimensions()
   */
  rowHeights: number[] = null;
  /**
   * This field holds the overrides to the column weights.
   * If this field is non-{@code null} the values are
   * applied to the gridbag after all of the columns
   * weights have been calculated.
   * If {@code columnWeights[i] >} weight for column i, then
   * column i is assigned the weight in {@code columnWeights[i]}.
   * If {@code columnWeights} has more elements than the number
   * of columns, the excess elements are ignored - they do
   * not cause more columns to be created.
   *
   * @serial
   */
  columnWeights: number[] = null;
  /**
   * This field holds the overrides to the row weights.
   * If this field is non-{@code null} the values are
   * applied to the gridbag after all of the rows
   * weights have been calculated.
   * If {@code rowWeights[i] > } weight for row i, then
   * row i is assigned the weight in {@code rowWeights[i]}.
   * If {@code rowWeights} has more elements than the number
   * of rows, the excess elements are ignored - they do
   * not cause more rows to be created.
   *
   * @serial
   */
  rowWeights: number[] = null;
  /**
   * The component being positioned.  This is set before calling into
   * {@code adjustForGravity}.
   */
  componentAdjusting: Component = null;
  rightToLeft_: boolean = false;
  /**
   * Creates a grid bag layout manager.
   */
  _GridBagLayout(): this {
    this.rightToLeft_ = false;
    this.comptable = new Hashtable();
    this.defaultConstraints = new GridBagConstraints()._GridBagConstraints$();
    return this;
  }
  /**
   * Sets the constraints for the specified component in this layout.
   * @param       comp the component to be modified
   * @param       constraints the constraints to be applied
   */
  setConstraints(comp: Component, constraints: GridBagConstraints): void {
    this.comptable.put(comp, constraints.clone());
  }
  /**
   * Retrieves the constraints for the specified component.
   * The return value is not a copy, but is the actual
   * {@code GridBagConstraints} object used by the layout mechanism.
   * <p>
   * If {@code comp} is not in the {@code GridBagLayout},
   * a set of default {@code GridBagConstraints} are returned.
   * A {@code comp} value of {@code null} is invalid
   * and returns {@code null}.
   *
   * @param       comp the component to be queried
   * @return      the constraints for the specified component
   */
  lookupConstraints(comp: Component): GridBagConstraints {
    let constraints = this.comptable.get(comp);
    if (constraints == null) {
      this.setConstraints(comp, this.defaultConstraints);
      constraints = this.comptable.get(comp);
    }
    return constraints;
  }
  /**
   * Removes the constraints for the specified component in this layout
   * @param       comp the component to be modified
   */
  removeConstraints(comp: Component): void {
    this.comptable.remove(comp);
  }
  /**
   * Has no effect, since this layout manager does not use a per-component string.
   */
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  /**
   * Adds the specified component to the layout, using the specified
   * {@code constraints} object.  Note that constraints
   * are mutable and are, therefore, cloned when cached.
   *
   * @param      comp         the component to be added
   * @param      constraints  an object that determines how
   *                          the component is added to the layout
   * @throws IllegalArgumentException if {@code constraints}
   *            is not a {@code GridBagConstraint}
   */
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
    if (constraints instanceof GridBagConstraints) {
      this.setConstraints(comp, constraints);
    } else if (constraints != null) {
      throw new IllegalArgumentException('cannot add to layout: constraints must be a GridBagConstraint');
    }
  }
  /**
   * Removes the specified component from this layout.
   * <p>
   * Most applications do not call this method directly.
   * @param    comp   the component to be removed.
   * @see      java.awt.Container#remove(java.awt.Component)
   * @see      java.awt.Container#removeAll()
   */
  removeLayoutComponent(comp: Component): void {
    this.removeConstraints(comp);
  }
  /**
   * Determines the preferred size of the {@code parent}
   * container using this grid bag layout.
   * <p>
   * Most applications do not call this method directly.
   *
   * @param     parent   the container in which to do the layout
   * @see       java.awt.Container#getPreferredSize
   * @return the preferred size of the {@code parent}
   *  container
   */
  preferredLayoutSize(parent: Container): Dimension {
    let info = this.getLayoutInfo(parent, GridBagLayout.PREFERREDSIZE);
    return this.getMinSize(parent, info);
  }
  /**
   * Determines the minimum size of the {@code parent} container
   * using this grid bag layout.
   * <p>
   * Most applications do not call this method directly.
   * @param     parent   the container in which to do the layout
   * @see       java.awt.Container#doLayout
   * @return the minimum size of the {@code parent} container
   */
  minimumLayoutSize(parent: Container): Dimension {
    let info = this.getLayoutInfo(parent, GridBagLayout.MINSIZE);
    return this.getMinSize(parent, info);
  }
  /**
   * Returns the maximum dimensions for this layout given the components
   * in the specified target container.
   * @param target the container which needs to be laid out
   * @see Container
   * @see #minimumLayoutSize(Container)
   * @see #preferredLayoutSize(Container)
   * @return the maximum dimensions for this layout
   */
  maximumLayoutSize(target: Container): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Returns the alignment along the x axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   *
   * @return the value {@code 0.5f} to indicate centered
   */
  getLayoutAlignmentX(parent: Container): number {
    return 0.5;
  }
  /**
   * Returns the alignment along the y axis.  This specifies how
   * the component would like to be aligned relative to other
   * components.  The value should be a number between 0 and 1
   * where 0 represents alignment along the origin, 1 is aligned
   * the furthest away from the origin, 0.5 is centered, etc.
   *
   * @return the value {@code 0.5f} to indicate centered
   */
  getLayoutAlignmentY(parent: Container): number {
    return 0.5;
  }
  /**
   * Invalidates the layout, indicating that if the layout manager
   * has cached information it should be discarded.
   */
  invalidateLayout(target: Container): void {
  }
  /**
   * Lays out the specified container using this grid bag layout.
   * This method reshapes components in the specified container in
   * order to satisfy the constraints of this {@code GridBagLayout}
   * object.
   * <p>
   * Most applications do not call this method directly.
   * @param parent the container in which to do the layout
   * @see java.awt.Container
   * @see java.awt.Container#doLayout
   */
  layoutContainer$Container(parent: Container): void {
    this.arrangeGrid(parent);
  }
  /**
   * Returns a string representation of this grid bag layout's values.
   * @return     a string representation of this grid bag layout.
   */
  toString(): string {
    return $J.getClass(this).getName();
  }
  /**
   * Fills in an instance of {@code GridBagLayoutInfo} for the
   * current set of managed children. This requires three passes through the
   * set of children:
   *
   * <ol>
   * <li>Figure out the dimensions of the layout grid.
   * <li>Determine which cells the components occupy.
   * <li>Distribute the weights and min sizes among the rows/columns.
   * </ol>
   *
   * This also caches the minsizes for all the children when they are
   * first encountered (so subsequent loops don't need to ask again).
   * <p>
   * This method should only be used internally by
   * {@code GridBagLayout}.
   *
   * @param parent  the layout container
   * @param sizeflag either {@code PREFERREDSIZE} or
   *   {@code MINSIZE}
   * @return the {@code GridBagLayoutInfo} for the set of children
   * @since 1.4
   */
  getLayoutInfo(parent: Container, sizeflag: number): GridBagLayoutInfo {
    return this.GetLayoutInfo(parent, sizeflag);
  }
  preInitMaximumArraySizes(parent: Container): number[] {
    let components = parent.getComponents();
    let comp: Component;
    let constraints: GridBagConstraints;
    let curX: number;
    let curY: number;
    let curWidth: number;
    let curHeight: number;
    let preMaximumArrayXIndex = 0;
    let preMaximumArrayYIndex = 0;
    let returnArray = $J.newArray(2, 0);
    for (let compId = 0; compId < components.length; compId++) {
      comp = components[compId];
      if (!comp.isVisible$()) {
        continue;
      }
      constraints = this.lookupConstraints(comp);
      curX = constraints.gridx;
      curY = constraints.gridy;
      curWidth = constraints.gridwidth;
      curHeight = constraints.gridheight;
      if (curX < 0) {
        curX = ++preMaximumArrayYIndex;
      }
      if (curY < 0) {
        curY = ++preMaximumArrayXIndex;
      }
      if (curWidth <= 0) {
        curWidth = 1;
      }
      if (curHeight <= 0) {
        curHeight = 1;
      }
      preMaximumArrayXIndex = Math.max((curY + curHeight) | 0, preMaximumArrayXIndex);
      preMaximumArrayYIndex = Math.max((curX + curWidth) | 0, preMaximumArrayYIndex);
    }
    returnArray[0] = preMaximumArrayXIndex;
    returnArray[1] = preMaximumArrayYIndex;
    return returnArray;
  }
  /**
   * This method is obsolete and supplied for backwards
   * compatibility only; new code should call {@link
   * #getLayoutInfo(java.awt.Container, int) getLayoutInfo} instead.
   *
   * Fills in an instance of {@code GridBagLayoutInfo} for the
   * current set of managed children. This method is the same
   * as {@code getLayoutInfo}; refer to {@code getLayoutInfo}
   * description for details.
   *
   * @param  parent the layout container
   * @param  sizeflag either {@code PREFERREDSIZE} or {@code MINSIZE}
   * @return the {@code GridBagLayoutInfo} for the set of children
   */
  GetLayoutInfo(parent: Container, sizeflag: number): GridBagLayoutInfo {
    {
      let r: GridBagLayoutInfo;
      let comp: Component;
      let constraints: GridBagConstraints;
      let d: Dimension;
      let components = parent.getComponents();
      let layoutWidth: number;
      let layoutHeight: number;
      let xMaxArray: number[];
      let yMaxArray: number[];
      let compindex: number;
      let i: number;
      let k: number;
      let px: number;
      let py: number;
      let pixels_diff: number;
      let nextSize: number;
      let curX = 0;
      let curY = 0;
      let curWidth = 1;
      let curHeight = 1;
      let curRow: number;
      let curCol: number;
      let weight_diff: number;
      let weight: number;
      let maximumArrayXIndex = 0;
      let maximumArrayYIndex = 0;
      let anchor: number;
      layoutWidth = layoutHeight = 0;
      curRow = curCol = -1;
      let arraySizes = this.preInitMaximumArraySizes(parent);
      maximumArrayXIndex = (GridBagLayout.EMPIRICMULTIPLIER * arraySizes[0] > 2147483647) ? 2147483647 : Math.imul(GridBagLayout.EMPIRICMULTIPLIER, (arraySizes[0]) | 0);
      maximumArrayYIndex = (GridBagLayout.EMPIRICMULTIPLIER * arraySizes[1] > 2147483647) ? 2147483647 : Math.imul(GridBagLayout.EMPIRICMULTIPLIER, (arraySizes[1]) | 0);
      if (this.rowHeights != null) {
        maximumArrayXIndex = Math.max(maximumArrayXIndex, this.rowHeights.length);
      }
      if (this.columnWidths != null) {
        maximumArrayYIndex = Math.max(maximumArrayYIndex, this.columnWidths.length);
      }
      xMaxArray = $J.newArray(maximumArrayXIndex, 0);
      yMaxArray = $J.newArray(maximumArrayYIndex, 0);
      let hasBaseline = false;
      for (compindex = 0; compindex < components.length; compindex++) {
        comp = components[compindex];
        if (!comp.isVisible$()) {
          continue;
        }
        constraints = this.lookupConstraints(comp);
        curX = constraints.gridx;
        curY = constraints.gridy;
        curWidth = constraints.gridwidth;
        if (curWidth <= 0) {
          curWidth = 1;
        }
        curHeight = constraints.gridheight;
        if (curHeight <= 0) {
          curHeight = 1;
        }
        if (curX < 0 && curY < 0) {
          if (curRow >= 0) {
            curY = curRow;
          } else if (curCol >= 0) {
            curX = curCol;
          } else {
            curY = 0;
          }
        }
        if (curX < 0) {
          px = 0;
          for (i = curY; i < ((curY + curHeight) | 0); i++) {
            px = Math.max(px, xMaxArray[i]);
          }
          curX = (px - curX - 1) | 0;
          if (curX < 0) {
            curX = 0;
          }
        } else if (curY < 0) {
          py = 0;
          for (i = curX; i < ((curX + curWidth) | 0); i++) {
            py = Math.max(py, yMaxArray[i]);
          }
          curY = (py - curY - 1) | 0;
          if (curY < 0) {
            curY = 0;
          }
        }
        px = (curX + curWidth) | 0;
        if (layoutWidth < px) {
          layoutWidth = px;
        }
        py = (curY + curHeight) | 0;
        if (layoutHeight < py) {
          layoutHeight = py;
        }
        for (i = curX; i < ((curX + curWidth) | 0); i++) {
          yMaxArray[i] = py;
        }
        for (i = curY; i < ((curY + curHeight) | 0); i++) {
          xMaxArray[i] = px;
        }
        if (sizeflag === GridBagLayout.PREFERREDSIZE) {
          d = comp.getPreferredSize$();
        } else {
          d = comp.getMinimumSize$();
        }
        constraints.minWidth_ = d.width_;
        constraints.minHeight_ = d.height_;
        if (this.calculateBaseline(comp, constraints, d)) {
          hasBaseline = true;
        }
        if (constraints.gridheight === 0 && constraints.gridwidth === 0) {
          curRow = curCol = -1;
        }
        if (constraints.gridheight === 0 && curRow < 0) {
          curCol = (curX + curWidth) | 0;
        } else if (constraints.gridwidth === 0 && curCol < 0) {
          curRow = (curY + curHeight) | 0;
        }
      }
      if (this.columnWidths != null && layoutWidth < this.columnWidths.length) {
        layoutWidth = this.columnWidths.length;
      }
      if (this.rowHeights != null && layoutHeight < this.rowHeights.length) {
        layoutHeight = this.rowHeights.length;
      }
      r = new GridBagLayoutInfo()._GridBagLayoutInfo(layoutWidth, layoutHeight);
      curRow = curCol = -1;
      Arrays.fill(xMaxArray, 0);
      Arrays.fill(yMaxArray, 0);
      let maxAscent = null;
      let maxDescent = null;
      let baselineType = null;
      if (hasBaseline) {
        r.maxAscent = maxAscent = $J.newArray(layoutHeight, 0);
        r.maxDescent = maxDescent = $J.newArray(layoutHeight, 0);
        r.baselineType = baselineType = $J.newArray(layoutHeight, 0);
        r.hasBaseline_ = true;
      }
      for (compindex = 0; compindex < components.length; compindex++) {
        comp = components[compindex];
        if (!comp.isVisible$()) {
          continue;
        }
        constraints = this.lookupConstraints(comp);
        curX = constraints.gridx;
        curY = constraints.gridy;
        curWidth = constraints.gridwidth;
        curHeight = constraints.gridheight;
        if (curX < 0 && curY < 0) {
          if (curRow >= 0) {
            curY = curRow;
          } else if (curCol >= 0) {
            curX = curCol;
          } else {
            curY = 0;
          }
        }
        if (curX < 0) {
          if (curHeight <= 0) {
            curHeight = (curHeight + (r.height_ - curY)) | 0;
            if (curHeight < 1) {
              curHeight = 1;
            }
          }
          px = 0;
          for (i = curY; i < ((curY + curHeight) | 0); i++) {
            px = Math.max(px, xMaxArray[i]);
          }
          curX = (px - curX - 1) | 0;
          if (curX < 0) {
            curX = 0;
          }
        } else if (curY < 0) {
          if (curWidth <= 0) {
            curWidth = (curWidth + (r.width_ - curX)) | 0;
            if (curWidth < 1) {
              curWidth = 1;
            }
          }
          py = 0;
          for (i = curX; i < ((curX + curWidth) | 0); i++) {
            py = Math.max(py, yMaxArray[i]);
          }
          curY = (py - curY - 1) | 0;
          if (curY < 0) {
            curY = 0;
          }
        }
        if (curWidth <= 0) {
          curWidth = (curWidth + (r.width_ - curX)) | 0;
          if (curWidth < 1) {
            curWidth = 1;
          }
        }
        if (curHeight <= 0) {
          curHeight = (curHeight + (r.height_ - curY)) | 0;
          if (curHeight < 1) {
            curHeight = 1;
          }
        }
        px = (curX + curWidth) | 0;
        py = (curY + curHeight) | 0;
        for (i = curX; i < ((curX + curWidth) | 0); i++) {
          yMaxArray[i] = py;
        }
        for (i = curY; i < ((curY + curHeight) | 0); i++) {
          xMaxArray[i] = px;
        }
        if (constraints.gridheight === 0 && constraints.gridwidth === 0) {
          curRow = curCol = -1;
        }
        if (constraints.gridheight === 0 && curRow < 0) {
          curCol = (curX + curWidth) | 0;
        } else if (constraints.gridwidth === 0 && curCol < 0) {
          curRow = (curY + curHeight) | 0;
        }
        constraints.tempX = curX;
        constraints.tempY = curY;
        constraints.tempWidth = curWidth;
        constraints.tempHeight = curHeight;
        anchor = constraints.anchor;
        if (hasBaseline) {
          switch (anchor) {
            case GridBagConstraints.BASELINE:
            case GridBagConstraints.BASELINE_LEADING:
            case GridBagConstraints.BASELINE_TRAILING:
              if (constraints.ascent >= 0) {
                if (curHeight === 1) {
                  maxAscent[curY] = Math.max(maxAscent[curY], constraints.ascent);
                  maxDescent[curY] = Math.max(maxDescent[curY], constraints.descent);
                } else {
                  if (constraints.baselineResizeBehavior === Component$BaselineResizeBehavior.CONSTANT_DESCENT) {
                    (maxDescent[(curY + curHeight - 1) | 0]) = Math.max(maxDescent[(curY + curHeight - 1) | 0], constraints.descent);
                  } else {
                    maxAscent[curY] = Math.max(maxAscent[curY], constraints.ascent);
                  }
                }
                if (constraints.baselineResizeBehavior === Component$BaselineResizeBehavior.CONSTANT_DESCENT) {
                  (baselineType[(curY + curHeight - 1) | 0]) = ((baselineType[(curY + curHeight - 1) | 0] | (1 << constraints.baselineResizeBehavior.ordinal())) << 16) >> 16;
                } else {
                  baselineType[curY] = ((baselineType[curY] | (1 << constraints.baselineResizeBehavior.ordinal())) << 16) >> 16;
                }
              }
              break;
            case GridBagConstraints.ABOVE_BASELINE:
            case GridBagConstraints.ABOVE_BASELINE_LEADING:
            case GridBagConstraints.ABOVE_BASELINE_TRAILING:
              pixels_diff = (constraints.minHeight_ + constraints.insets_.top + constraints.ipady) | 0;
              maxAscent[curY] = Math.max(maxAscent[curY], pixels_diff);
              maxDescent[curY] = Math.max(maxDescent[curY], constraints.insets_.bottom);
              break;
            case GridBagConstraints.BELOW_BASELINE:
            case GridBagConstraints.BELOW_BASELINE_LEADING:
            case GridBagConstraints.BELOW_BASELINE_TRAILING:
              pixels_diff = (constraints.minHeight_ + constraints.insets_.bottom + constraints.ipady) | 0;
              maxDescent[curY] = Math.max(maxDescent[curY], pixels_diff);
              maxAscent[curY] = Math.max(maxAscent[curY], constraints.insets_.top);
              break;
          }
        }
      }
      r.weightX = $J.newArray(maximumArrayYIndex, 0);
      r.weightY = $J.newArray(maximumArrayXIndex, 0);
      r.minWidth_ = $J.newArray(maximumArrayYIndex, 0);
      r.minHeight_ = $J.newArray(maximumArrayXIndex, 0);
      if (this.columnWidths != null) {
        $J.system_arraycopy(this.columnWidths, 0, r.minWidth_, 0, this.columnWidths.length);
      }
      if (this.rowHeights != null) {
        $J.system_arraycopy(this.rowHeights, 0, r.minHeight_, 0, this.rowHeights.length);
      }
      if (this.columnWeights != null) {
        $J.system_arraycopy(this.columnWeights, 0, r.weightX, 0, Math.min(r.weightX.length, this.columnWeights.length));
      }
      if (this.rowWeights != null) {
        $J.system_arraycopy(this.rowWeights, 0, r.weightY, 0, Math.min(r.weightY.length, this.rowWeights.length));
      }
      nextSize = 2147483647;
      for (i = 1; i !== 2147483647; i = nextSize, nextSize = 2147483647) {
        for (compindex = 0; compindex < components.length; compindex++) {
          comp = components[compindex];
          if (!comp.isVisible$()) {
            continue;
          }
          constraints = this.lookupConstraints(comp);
          if (constraints.tempWidth === i) {
            px = (constraints.tempX + constraints.tempWidth) | 0;
            weight_diff = constraints.weightx;
            for (k = constraints.tempX; k < px; k++) {
              weight_diff -= r.weightX[k];
            }
            if (weight_diff > 0) {
              weight = 0;
              for (k = constraints.tempX; k < px; k++) {
                weight += r.weightX[k];
              }
              for (k = constraints.tempX; weight > 0 && k < px; k++) {
                let wt = r.weightX[k];
                let dx = (wt * weight_diff) / weight;
                r.weightX[k] += dx;
                weight_diff -= dx;
                weight -= wt;
              }
              (r.weightX[(px - 1) | 0]) += weight_diff;
            }
            pixels_diff = (constraints.minWidth_ + constraints.ipadx + constraints.insets_.left + constraints.insets_.right) | 0;
            for (k = constraints.tempX; k < px; k++) {
              pixels_diff = (pixels_diff - r.minWidth_[k]) | 0;
            }
            if (pixels_diff > 0) {
              weight = 0;
              for (k = constraints.tempX; k < px; k++) {
                weight += r.weightX[k];
              }
              for (k = constraints.tempX; weight > 0 && k < px; k++) {
                let wt = r.weightX[k];
                let dx = $J.d2i(((wt * (pixels_diff)) / weight));
                r.minWidth_[k] = (r.minWidth_[k] + dx) | 0;
                pixels_diff = (pixels_diff - dx) | 0;
                weight -= wt;
              }
              (r.minWidth_[(px - 1) | 0]) += pixels_diff;
            }
          } else if (constraints.tempWidth > i && constraints.tempWidth < nextSize) {
            nextSize = constraints.tempWidth;
          }
          if (constraints.tempHeight === i) {
            py = (constraints.tempY + constraints.tempHeight) | 0;
            weight_diff = constraints.weighty;
            for (k = constraints.tempY; k < py; k++) {
              weight_diff -= r.weightY[k];
            }
            if (weight_diff > 0) {
              weight = 0;
              for (k = constraints.tempY; k < py; k++) {
                weight += r.weightY[k];
              }
              for (k = constraints.tempY; weight > 0 && k < py; k++) {
                let wt = r.weightY[k];
                let dy = (wt * weight_diff) / weight;
                r.weightY[k] += dy;
                weight_diff -= dy;
                weight -= wt;
              }
              (r.weightY[(py - 1) | 0]) += weight_diff;
            }
            pixels_diff = -1;
            if (hasBaseline) {
              switch (constraints.anchor) {
                case GridBagConstraints.BASELINE:
                case GridBagConstraints.BASELINE_LEADING:
                case GridBagConstraints.BASELINE_TRAILING:
                  if (constraints.ascent >= 0) {
                    if (constraints.tempHeight === 1) {
                      pixels_diff = (maxAscent[constraints.tempY] + maxDescent[constraints.tempY]) | 0;
                    } else if (constraints.baselineResizeBehavior !== Component$BaselineResizeBehavior.CONSTANT_DESCENT) {
                      pixels_diff = (maxAscent[constraints.tempY] + constraints.descent) | 0;
                    } else {
                      pixels_diff = (constraints.ascent + (maxDescent[(constraints.tempY + constraints.tempHeight - 1) | 0])) | 0;
                    }
                  }
                  break;
                case GridBagConstraints.ABOVE_BASELINE:
                case GridBagConstraints.ABOVE_BASELINE_LEADING:
                case GridBagConstraints.ABOVE_BASELINE_TRAILING:
                  pixels_diff = (constraints.insets_.top + constraints.minHeight_ + constraints.ipady + maxDescent[constraints.tempY]) | 0;
                  break;
                case GridBagConstraints.BELOW_BASELINE:
                case GridBagConstraints.BELOW_BASELINE_LEADING:
                case GridBagConstraints.BELOW_BASELINE_TRAILING:
                  pixels_diff = (maxAscent[constraints.tempY] + constraints.minHeight_ + constraints.insets_.bottom + constraints.ipady) | 0;
                  break;
              }
            }
            if (pixels_diff === -1) {
              pixels_diff = (constraints.minHeight_ + constraints.ipady + constraints.insets_.top + constraints.insets_.bottom) | 0;
            }
            for (k = constraints.tempY; k < py; k++) {
              pixels_diff = (pixels_diff - r.minHeight_[k]) | 0;
            }
            if (pixels_diff > 0) {
              weight = 0;
              for (k = constraints.tempY; k < py; k++) {
                weight += r.weightY[k];
              }
              for (k = constraints.tempY; weight > 0 && k < py; k++) {
                let wt = r.weightY[k];
                let dy = $J.d2i(((wt * (pixels_diff)) / weight));
                r.minHeight_[k] = (r.minHeight_[k] + dy) | 0;
                pixels_diff = (pixels_diff - dy) | 0;
                weight -= wt;
              }
              (r.minHeight_[(py - 1) | 0]) += pixels_diff;
            }
          } else if (constraints.tempHeight > i && constraints.tempHeight < nextSize) {
            nextSize = constraints.tempHeight;
          }
        }
      }
      return r;
    }
  }
  /**
   * Calculate the baseline for the specified component.
   * If {@code c} is positioned along it's baseline, the baseline is
   * obtained and the {@code constraints} ascent, descent and
   * baseline resize behavior are set from the component; and true is
   * returned. Otherwise false is returned.
   */
  calculateBaseline(c: Component, constraints: GridBagConstraints, size: Dimension): boolean {
    let anchor = constraints.anchor;
    if (anchor === GridBagConstraints.BASELINE || anchor === GridBagConstraints.BASELINE_LEADING || anchor === GridBagConstraints.BASELINE_TRAILING) {
      let w = (size.width_ + constraints.ipadx) | 0;
      let h = (size.height_ + constraints.ipady) | 0;
      constraints.ascent = c.getBaseline(w, h);
      if (constraints.ascent >= 0) {
        let baseline = constraints.ascent;
        constraints.descent = (h - constraints.ascent + constraints.insets_.bottom) | 0;
        constraints.ascent = (constraints.ascent + constraints.insets_.top) | 0;
        constraints.baselineResizeBehavior = c.getBaselineResizeBehavior();
        constraints.centerPadding = 0;
        if (constraints.baselineResizeBehavior === Component$BaselineResizeBehavior.CENTER_OFFSET) {
          let nextBaseline = c.getBaseline(w, (h + 1) | 0);
          constraints.centerOffset = (baseline - $J.idiv(h, 2)) | 0;
          if (h % 2 === 0) {
            if (baseline !== nextBaseline) {
              constraints.centerPadding = 1;
            }
          } else if (baseline === nextBaseline) {
            constraints.centerOffset--;
            constraints.centerPadding = 1;
          }
        }
      }
      return true;
    } else {
      constraints.ascent = -1;
      return false;
    }
  }
  /**
   * Adjusts the x, y, width, and height fields to the correct
   * values depending on the constraint geometry and pads.
   * This method should only be used internally by
   * {@code GridBagLayout}.
   *
   * @param constraints the constraints to be applied
   * @param r the {@code Rectangle} to be adjusted
   * @since 1.4
   */
  adjustForGravity(constraints: GridBagConstraints, r: Rectangle): void {
    this.AdjustForGravity(constraints, r);
  }
  /**
   * Adjusts the x, y, width, and height fields to the correct
   * values depending on the constraint geometry and pads.
   * <p>
   * This method is obsolete and supplied for backwards
   * compatibility only; new code should call {@link
   * #adjustForGravity(java.awt.GridBagConstraints, java.awt.Rectangle)
   * adjustForGravity} instead.
   * This method is the same as {@code adjustForGravity}
   *
   * @param  constraints the constraints to be applied
   * @param  r the {@code Rectangle} to be adjusted
   */
  AdjustForGravity(constraints: GridBagConstraints, r: Rectangle): void {
    let diffx: number;
    let diffy: number;
    let cellY = r.y_;
    let cellHeight = r.height_;
    if (!this.rightToLeft_) {
      r.x_ = (r.x_ + constraints.insets_.left) | 0;
    } else {
      r.x_ = (r.x_ - (r.width_ - constraints.insets_.right)) | 0;
    }
    r.width_ = (r.width_ - (constraints.insets_.left + constraints.insets_.right)) | 0;
    r.y_ = (r.y_ + constraints.insets_.top) | 0;
    r.height_ = (r.height_ - (constraints.insets_.top + constraints.insets_.bottom)) | 0;
    diffx = 0;
    if ((constraints.fill_ !== GridBagConstraints.HORIZONTAL && constraints.fill_ !== GridBagConstraints.BOTH) && (r.width_ > ((constraints.minWidth_ + constraints.ipadx) | 0))) {
      diffx = (r.width_ - (constraints.minWidth_ + constraints.ipadx)) | 0;
      r.width_ = (constraints.minWidth_ + constraints.ipadx) | 0;
    }
    diffy = 0;
    if ((constraints.fill_ !== GridBagConstraints.VERTICAL && constraints.fill_ !== GridBagConstraints.BOTH) && (r.height_ > ((constraints.minHeight_ + constraints.ipady) | 0))) {
      diffy = (r.height_ - (constraints.minHeight_ + constraints.ipady)) | 0;
      r.height_ = (constraints.minHeight_ + constraints.ipady) | 0;
    }
    switch (constraints.anchor) {
      case GridBagConstraints.BASELINE:
        r.x_ = (r.x_ + $J.idiv(diffx, 2)) | 0;
        this.alignOnBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.BASELINE_LEADING:
        if (this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        this.alignOnBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.BASELINE_TRAILING:
        if (!this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        this.alignOnBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.ABOVE_BASELINE:
        r.x_ = (r.x_ + $J.idiv(diffx, 2)) | 0;
        this.alignAboveBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.ABOVE_BASELINE_LEADING:
        if (this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        this.alignAboveBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.ABOVE_BASELINE_TRAILING:
        if (!this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        this.alignAboveBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.BELOW_BASELINE:
        r.x_ = (r.x_ + $J.idiv(diffx, 2)) | 0;
        this.alignBelowBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.BELOW_BASELINE_LEADING:
        if (this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        this.alignBelowBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.BELOW_BASELINE_TRAILING:
        if (!this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        this.alignBelowBaseline(constraints, r, cellY, cellHeight);
        break;
      case GridBagConstraints.CENTER:
        r.x_ = (r.x_ + $J.idiv(diffx, 2)) | 0;
        r.y_ = (r.y_ + $J.idiv(diffy, 2)) | 0;
        break;
      case GridBagConstraints.PAGE_START:
      case GridBagConstraints.NORTH:
        r.x_ = (r.x_ + $J.idiv(diffx, 2)) | 0;
        break;
      case GridBagConstraints.NORTHEAST:
        r.x_ = (r.x_ + diffx) | 0;
        break;
      case GridBagConstraints.EAST:
        r.x_ = (r.x_ + diffx) | 0;
        r.y_ = (r.y_ + $J.idiv(diffy, 2)) | 0;
        break;
      case GridBagConstraints.SOUTHEAST:
        r.x_ = (r.x_ + diffx) | 0;
        r.y_ = (r.y_ + diffy) | 0;
        break;
      case GridBagConstraints.PAGE_END:
      case GridBagConstraints.SOUTH:
        r.x_ = (r.x_ + $J.idiv(diffx, 2)) | 0;
        r.y_ = (r.y_ + diffy) | 0;
        break;
      case GridBagConstraints.SOUTHWEST:
        r.y_ = (r.y_ + diffy) | 0;
        break;
      case GridBagConstraints.WEST:
        r.y_ = (r.y_ + $J.idiv(diffy, 2)) | 0;
        break;
      case GridBagConstraints.NORTHWEST:
        break;
      case GridBagConstraints.LINE_START:
        if (this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        r.y_ = (r.y_ + $J.idiv(diffy, 2)) | 0;
        break;
      case GridBagConstraints.LINE_END:
        if (!this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        r.y_ = (r.y_ + $J.idiv(diffy, 2)) | 0;
        break;
      case GridBagConstraints.FIRST_LINE_START:
        if (this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        break;
      case GridBagConstraints.FIRST_LINE_END:
        if (!this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        break;
      case GridBagConstraints.LAST_LINE_START:
        if (this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        r.y_ = (r.y_ + diffy) | 0;
        break;
      case GridBagConstraints.LAST_LINE_END:
        if (!this.rightToLeft_) {
          r.x_ = (r.x_ + diffx) | 0;
        }
        r.y_ = (r.y_ + diffy) | 0;
        break;
      default:
        throw new IllegalArgumentException('illegal anchor value');
    }
  }
  /**
   * Positions on the baseline.
   *
   * @param cellY the location of the row, does not include insets
   * @param cellHeight the height of the row, does not take into account
   *        insets
   * @param r available bounds for the component, is padded by insets and
   *        ipady
   */
  alignOnBaseline(cons: GridBagConstraints, r: Rectangle, cellY: number, cellHeight: number): void {
    if (cons.ascent >= 0) {
      if (cons.baselineResizeBehavior === Component$BaselineResizeBehavior.CONSTANT_DESCENT) {
        let maxY = (cellY + cellHeight - (this.layoutInfo.maxDescent[(cons.tempY + cons.tempHeight - 1) | 0]) + cons.descent - cons.insets_.bottom) | 0;
        if (!cons.isVerticallyResizable()) {
          r.y_ = (maxY - cons.minHeight_) | 0;
          r.height_ = cons.minHeight_;
        } else {
          r.height_ = (maxY - cellY - cons.insets_.top) | 0;
        }
      } else {
        let baseline: number;
        let ascent = cons.ascent;
        if (this.layoutInfo.hasConstantDescent(cons.tempY)) {
          baseline = (cellHeight - this.layoutInfo.maxDescent[cons.tempY]) | 0;
        } else {
          baseline = this.layoutInfo.maxAscent[cons.tempY];
        }
        if (cons.baselineResizeBehavior === Component$BaselineResizeBehavior.OTHER) {
          let fits = false;
          ascent = this.componentAdjusting.getBaseline(r.width_, r.height_);
          if (ascent >= 0) {
            ascent = (ascent + cons.insets_.top) | 0;
          }
          if (ascent >= 0 && ascent <= baseline) {
            if (((baseline + (r.height_ - ascent - cons.insets_.top)) | 0) <= ((cellHeight - cons.insets_.bottom) | 0)) {
              fits = true;
            } else if (cons.isVerticallyResizable()) {
              let ascent2 = this.componentAdjusting.getBaseline(r.width_, (cellHeight - cons.insets_.bottom - baseline + ascent) | 0);
              if (ascent2 >= 0) {
                ascent2 = (ascent2 + cons.insets_.top) | 0;
              }
              if (ascent2 >= 0 && ascent2 <= ascent) {
                r.height_ = (cellHeight - cons.insets_.bottom - baseline + ascent) | 0;
                ascent = ascent2;
                fits = true;
              }
            }
          }
          if (!fits) {
            ascent = cons.ascent;
            r.width_ = cons.minWidth_;
            r.height_ = cons.minHeight_;
          }
        }
        r.y_ = (cellY + baseline - ascent + cons.insets_.top) | 0;
        if (cons.isVerticallyResizable()) {
          switch (cons.baselineResizeBehavior) {
            case Component$BaselineResizeBehavior.CONSTANT_ASCENT:
              r.height_ = Math.max(cons.minHeight_, (cellY + cellHeight - r.y_ - cons.insets_.bottom) | 0);
              break;
            case Component$BaselineResizeBehavior.CENTER_OFFSET:
              {
                let upper = (r.y_ - cellY - cons.insets_.top) | 0;
                let lower = (cellY + cellHeight - r.y_ - cons.minHeight_ - cons.insets_.bottom) | 0;
                let delta = Math.min(upper, lower);
                delta = (delta + delta) | 0;
                if (delta > 0 && (($J.idiv(((cons.minHeight_ + cons.centerPadding + delta) | 0), 2) + cons.centerOffset) | 0) !== baseline) {
                  delta--;
                }
                r.height_ = (cons.minHeight_ + delta) | 0;
                r.y_ = (cellY + baseline - $J.idiv(((r.height_ + cons.centerPadding) | 0), 2) - cons.centerOffset) | 0;
              }
              break;
            case Component$BaselineResizeBehavior.OTHER:
              break;
            default:
              break;
          }
        }
      }
    } else {
      this.centerVertically(cons, r, cellHeight);
    }
  }
  /**
   * Positions the specified component above the baseline. That is
   * the bottom edge of the component will be aligned along the baseline.
   * If the row does not have a baseline, this centers the component.
   */
  alignAboveBaseline(cons: GridBagConstraints, r: Rectangle, cellY: number, cellHeight: number): void {
    if (this.layoutInfo.hasBaseline(cons.tempY)) {
      let maxY: number;
      if (this.layoutInfo.hasConstantDescent(cons.tempY)) {
        maxY = (cellY + cellHeight - this.layoutInfo.maxDescent[cons.tempY]) | 0;
      } else {
        maxY = (cellY + this.layoutInfo.maxAscent[cons.tempY]) | 0;
      }
      if (cons.isVerticallyResizable()) {
        r.y_ = (cellY + cons.insets_.top) | 0;
        r.height_ = (maxY - r.y_) | 0;
      } else {
        r.height_ = (cons.minHeight_ + cons.ipady) | 0;
        r.y_ = (maxY - r.height_) | 0;
      }
    } else {
      this.centerVertically(cons, r, cellHeight);
    }
  }
  /**
   * Positions below the baseline.
   */
  alignBelowBaseline(cons: GridBagConstraints, r: Rectangle, cellY: number, cellHeight: number): void {
    if (this.layoutInfo.hasBaseline(cons.tempY)) {
      if (this.layoutInfo.hasConstantDescent(cons.tempY)) {
        r.y_ = (cellY + cellHeight - this.layoutInfo.maxDescent[cons.tempY]) | 0;
      } else {
        r.y_ = (cellY + this.layoutInfo.maxAscent[cons.tempY]) | 0;
      }
      if (cons.isVerticallyResizable()) {
        r.height_ = (cellY + cellHeight - r.y_ - cons.insets_.bottom) | 0;
      }
    } else {
      this.centerVertically(cons, r, cellHeight);
    }
  }
  centerVertically(cons: GridBagConstraints, r: Rectangle, cellHeight: number): void {
    if (!cons.isVerticallyResizable()) {
      r.y_ = (r.y_ + Math.max(0, $J.idiv(((cellHeight - cons.insets_.top - cons.insets_.bottom - cons.minHeight_ - cons.ipady) | 0), 2))) | 0;
    }
  }
  /**
   * Figures out the minimum size of the
   * parent based on the information from {@code getLayoutInfo}.
   * This method should only be used internally by
   * {@code GridBagLayout}.
   *
   * @param parent the layout container
   * @param info the layout info for this parent
   * @return a {@code Dimension} object containing the
   *   minimum size
   * @since 1.4
   */
  getMinSize(parent: Container, info: GridBagLayoutInfo): Dimension {
    return this.GetMinSize(parent, info);
  }
  /**
   * This method is obsolete and supplied for backwards
   * compatibility only; new code should call {@link
   * #getMinSize(java.awt.Container, GridBagLayoutInfo) getMinSize} instead.
   * This method is the same as {@code getMinSize}
   *
   * @param  parent the layout container
   * @param  info the layout info for this parent
   * @return a {@code Dimension} object containing the
   *         minimum size
   */
  GetMinSize(parent: Container, info: GridBagLayoutInfo): Dimension {
    let d = new Dimension()._Dimension$();
    let i: number;
    let t: number;
    let insets = parent.getInsets$();
    t = 0;
    for (i = 0; i < info.width_; i++) {
      t = (t + info.minWidth_[i]) | 0;
    }
    d.width_ = (t + insets.left + insets.right) | 0;
    t = 0;
    for (i = 0; i < info.height_; i++) {
      t = (t + info.minHeight_[i]) | 0;
    }
    d.height_ = (t + insets.top + insets.bottom) | 0;
    return d;
  }
  /**
   * Lays out the grid.
   * This method should only be used internally by
   * {@code GridBagLayout}.
   *
   * @param parent the layout container
   * @since 1.4
   */
  arrangeGrid(parent: Container): void {
    this.ArrangeGrid(parent);
  }
  /**
   * This method is obsolete and supplied for backwards
   * compatibility only; new code should call {@link
   * #arrangeGrid(Container) arrangeGrid} instead.
   * This method is the same as {@code arrangeGrid}
   *
   * @param  parent the layout container
   */
  ArrangeGrid(parent: Container): void {
    let comp: Component;
    let compindex: number;
    let constraints: GridBagConstraints;
    let insets = parent.getInsets$();
    let components = parent.getComponents();
    let d: Dimension;
    let r = new Rectangle()._Rectangle$();
    let i: number;
    let diffw: number;
    let diffh: number;
    let weight: number;
    let info: GridBagLayoutInfo;
    this.rightToLeft_ = !parent.getComponentOrientation().isLeftToRight();
    if (components.length === 0 && (this.columnWidths == null || this.columnWidths.length === 0) && (this.rowHeights == null || this.rowHeights.length === 0)) {
      return;
    }
    info = this.getLayoutInfo(parent, GridBagLayout.PREFERREDSIZE);
    d = this.getMinSize(parent, info);
    if (parent.width_ < d.width_ || parent.height_ < d.height_) {
      info = this.getLayoutInfo(parent, GridBagLayout.MINSIZE);
      d = this.getMinSize(parent, info);
    }
    this.layoutInfo = info;
    r.width_ = d.width_;
    r.height_ = d.height_;
    diffw = (parent.width_ - r.width_) | 0;
    if (diffw !== 0) {
      weight = 0;
      for (i = 0; i < info.width_; i++) {
        weight += info.weightX[i];
      }
      if (weight > 0) {
        for (i = 0; i < info.width_; i++) {
          let dx = $J.d2i((((diffw) * info.weightX[i]) / weight));
          info.minWidth_[i] = (info.minWidth_[i] + dx) | 0;
          r.width_ = (r.width_ + dx) | 0;
          if (info.minWidth_[i] < 0) {
            r.width_ = (r.width_ - info.minWidth_[i]) | 0;
            info.minWidth_[i] = 0;
          }
        }
      }
      diffw = (parent.width_ - r.width_) | 0;
    } else {
      diffw = 0;
    }
    diffh = (parent.height_ - r.height_) | 0;
    if (diffh !== 0) {
      weight = 0;
      for (i = 0; i < info.height_; i++) {
        weight += info.weightY[i];
      }
      if (weight > 0) {
        for (i = 0; i < info.height_; i++) {
          let dy = $J.d2i((((diffh) * info.weightY[i]) / weight));
          info.minHeight_[i] = (info.minHeight_[i] + dy) | 0;
          r.height_ = (r.height_ + dy) | 0;
          if (info.minHeight_[i] < 0) {
            r.height_ = (r.height_ - info.minHeight_[i]) | 0;
            info.minHeight_[i] = 0;
          }
        }
      }
      diffh = (parent.height_ - r.height_) | 0;
    } else {
      diffh = 0;
    }
    info.startx = ($J.idiv(diffw, 2) + insets.left) | 0;
    info.starty = ($J.idiv(diffh, 2) + insets.top) | 0;
    for (compindex = 0; compindex < components.length; compindex++) {
      comp = components[compindex];
      if (!comp.isVisible$()) {
        continue;
      }
      constraints = this.lookupConstraints(comp);
      if (!this.rightToLeft_) {
        r.x_ = info.startx;
        for (i = 0; i < constraints.tempX; i++) {
          r.x_ = (r.x_ + info.minWidth_[i]) | 0;
        }
      } else {
        r.x_ = (parent.width_ - ($J.idiv(diffw, 2) + insets.right)) | 0;
        for (i = 0; i < constraints.tempX; i++) {
          r.x_ = (r.x_ - info.minWidth_[i]) | 0;
        }
      }
      r.y_ = info.starty;
      for (i = 0; i < constraints.tempY; i++) {
        r.y_ = (r.y_ + info.minHeight_[i]) | 0;
      }
      r.width_ = 0;
      for (i = constraints.tempX; i < ((constraints.tempX + constraints.tempWidth) | 0); i++) {
        r.width_ = (r.width_ + info.minWidth_[i]) | 0;
      }
      r.height_ = 0;
      for (i = constraints.tempY; i < ((constraints.tempY + constraints.tempHeight) | 0); i++) {
        r.height_ = (r.height_ + info.minHeight_[i]) | 0;
      }
      this.componentAdjusting = comp;
      this.adjustForGravity(constraints, r);
      if (r.x_ < 0) {
        r.width_ = (r.width_ + r.x_) | 0;
        r.x_ = 0;
      }
      if (r.y_ < 0) {
        r.height_ = (r.height_ + r.y_) | 0;
        r.y_ = 0;
      }
      if ((r.width_ <= 0) || (r.height_ <= 0)) {
        comp.setBounds$int$int$int$int(0, 0, 0, 0);
      } else {
        if (comp.x_ !== r.x_ || comp.y_ !== r.y_ || comp.width_ !== r.width_ || comp.height_ !== r.height_) {
          comp.setBounds$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
        }
      }
    }
  }
}

$J.define(GridBagLayout, 'java.awt.GridBagLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_GridBagLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  GridBagConstraints = $J.load('java.awt.GridBagConstraints');
  GridBagLayoutInfo = $J.load('java.awt.GridBagLayoutInfo');
  Rectangle = $J.load('java.awt.Rectangle');
});
