// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/AbstractLayoutCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Scott Violet
 */
export class AbstractLayoutCache extends JObject {
  /**
   * Object responsible for getting the size of a node.
   */
  nodeDimensions: AbstractLayoutCache$NodeDimensions = null;
  /**
   * Model providing information.
   */
  treeModel: TreeModel = null;
  /**
   * Selection model.
   */
  treeSelectionModel: TreeSelectionModel = null;
  /**
   * True if the root node is displayed, false if its children are
   * the highest visible nodes.
   */
  rootVisible: boolean = false;
  /**
   * Height to use for each row.  If this is &lt;= 0 the renderer will be
   * used to determine the height for each row.
   */
  rowHeight: number = 0;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractLayoutCache(): this {
    return this;
  }
  /**
   * Sets the renderer that is responsible for drawing nodes in the tree
   * and which is therefore responsible for calculating the dimensions of
   * individual nodes.
   *
   * @param nd a <code>NodeDimensions</code> object
   */
  setNodeDimensions(nd: AbstractLayoutCache$NodeDimensions): void {
    this.nodeDimensions = nd;
  }
  /**
   * Returns the object that renders nodes in the tree, and which is
   * responsible for calculating the dimensions of individual nodes.
   *
   * @return the <code>NodeDimensions</code> object
   */
  getNodeDimensions$(): AbstractLayoutCache$NodeDimensions {
    return this.nodeDimensions;
  }
  /**
   * Sets the <code>TreeModel</code> that will provide the data.
   *
   * @param newModel the <code>TreeModel</code> that is to
   *          provide the data
   */
  setModel(newModel: TreeModel): void {
    this.treeModel = newModel;
  }
  /**
   * Returns the <code>TreeModel</code> that is providing the data.
   *
   * @return the <code>TreeModel</code> that is providing the data
   */
  getModel(): TreeModel {
    return this.treeModel;
  }
  /**
   * Determines whether or not the root node from
   * the <code>TreeModel</code> is visible.
   *
   * @param rootVisible true if the root node of the tree is to be displayed
   * @see #rootVisible
   */
  setRootVisible(rootVisible: boolean): void {
    this.rootVisible = rootVisible;
  }
  /**
   * Returns true if the root node of the tree is displayed.
   *
   * @return true if the root node of the tree is displayed
   * @see #rootVisible
   */
  isRootVisible(): boolean {
    return this.rootVisible;
  }
  /**
   * Sets the height of each cell.  If the specified value
   * is less than or equal to zero the current cell renderer is
   * queried for each row's height.
   *
   * @param rowHeight the height of each cell, in pixels
   */
  setRowHeight(rowHeight: number): void {
    this.rowHeight = rowHeight;
  }
  /**
   * Returns the height of each row.  If the returned value is less than
   * or equal to 0 the height for each row is determined by the
   * renderer.
   *
   * @return the height of each row
   */
  getRowHeight(): number {
    return this.rowHeight;
  }
  /**
   * Sets the <code>TreeSelectionModel</code> used to manage the
   * selection to new LSM.
   *
   * @param newLSM  the new <code>TreeSelectionModel</code>
   */
  setSelectionModel(newLSM: TreeSelectionModel): void {
    if (this.treeSelectionModel != null) {
      this.treeSelectionModel.setRowMapper(null);
    }
    this.treeSelectionModel = newLSM;
    if (this.treeSelectionModel != null) {
      this.treeSelectionModel.setRowMapper(this);
    }
  }
  /**
   * Returns the preferred height.
   *
   * @return the preferred height
   */
  getPreferredHeight(): number {
    let rowCount = this.getRowCount();
    if (rowCount > 0) {
      let bounds = this.getBounds$TreePath$Rectangle(this.getPathForRow((rowCount - 1) | 0), null);
      if (bounds != null) {
        return (bounds.y_ + bounds.height_) | 0;
      }
    }
    return 0;
  }
  /**
   * Returns the preferred width for the passed in region.
   * The region is defined by the path closest to
   * <code>(bounds.x, bounds.y)</code> and
   * ends at <code>bounds.height + bounds.y</code>.
   * If <code>bounds</code> is <code>null</code>,
   * the preferred width for all the nodes
   * will be returned (and this may be a VERY expensive
   * computation).
   *
   * @param bounds the region being queried
   * @return the preferred width for the passed in region
   */
  getPreferredWidth(bounds: Rectangle): number {
    let rowCount = this.getRowCount();
    if (rowCount > 0) {
      let firstPath: TreePath;
      let endY: number;
      if (bounds == null) {
        firstPath = this.getPathForRow(0);
        endY = 2147483647;
      } else {
        firstPath = this.getPathClosestTo(bounds.x_, bounds.y_);
        endY = (bounds.height_ + bounds.y_) | 0;
      }
      let paths = this.getVisiblePathsFrom(firstPath);
      if (paths != null && paths.hasMoreElements()) {
        let pBounds = this.getBounds$TreePath$Rectangle(paths.nextElement(), null);
        let width: number;
        if (pBounds != null) {
          width = (pBounds.x_ + pBounds.width_) | 0;
          if (pBounds.y_ >= endY) {
            return width;
          }
        } else {
          width = 0;
        }
        while (pBounds != null && paths.hasMoreElements()) {
          pBounds = this.getBounds$TreePath$Rectangle(paths.nextElement(), pBounds);
          if (pBounds != null && pBounds.y_ < endY) {
            width = Math.max(width, (pBounds.x_ + pBounds.width_) | 0);
          } else {
            pBounds = null;
          }
        }
        return width;
      }
    }
    return 0;
  }
  /**
   * Returns the rows that the <code>TreePath</code> instances in
   * <code>path</code> are being displayed at.
   * This method should return an array of the same length as that passed
   * in, and if one of the <code>TreePaths</code>
   * in <code>path</code> is not valid its entry in the array should
   * be set to -1.
   *
   * @param paths the array of <code>TreePath</code>s being queried
   * @return an array of the same length that is passed in containing
   *          the rows that each corresponding where each
   *          <code>TreePath</code> is displayed; if <code>paths</code>
   *          is <code>null</code>, <code>null</code> is returned
   */
  getRowsForPaths(paths: TreePath[]): number[] {
    if (paths == null) {
      return null;
    }
    let numPaths = paths.length;
    let rows = $J.newArray(numPaths, 0);
    for (let counter = 0; counter < numPaths; counter++) {
      rows[counter] = this.getRowForPath(paths[counter]);
    }
    return rows;
  }
  /**
   * Returns, by reference in <code>placeIn</code>,
   * the size needed to represent <code>value</code>.
   * If <code>inPlace</code> is <code>null</code>, a newly created
   * <code>Rectangle</code> should be returned, otherwise the value
   * should be placed in <code>inPlace</code> and returned. This will
   * return <code>null</code> if there is no renderer.
   *
   * @param value the <code>value</code> to be represented
   * @param row  row being queried
   * @param depth the depth of the row
   * @param expanded true if row is expanded, false otherwise
   * @param placeIn  a <code>Rectangle</code> containing the size needed
   *          to represent <code>value</code>
   * @return a <code>Rectangle</code> containing the node dimensions,
   *          or <code>null</code> if node has no dimension
   */
  getNodeDimensions$Object$int$int$boolean$Rectangle(value: any, row: number, depth: number, expanded: boolean, placeIn: Rectangle): Rectangle {
    let nd = this.getNodeDimensions$();
    if (nd != null) {
      return nd.getNodeDimensions(value, row, depth, expanded, placeIn);
    }
    return null;
  }
  /**
   * Returns true if the height of each row is a fixed size.
   *
   * @return whether the height of each row is a fixed size
   */
  isFixedRowHeight(): boolean {
    return (this.rowHeight > 0);
  }
}

/**
 * Used by <code>AbstractLayoutCache</code> to determine the size
 * and x origin of a particular node.
 */
export class AbstractLayoutCache$NodeDimensions extends JObject {
  /**
   * Constructor for subclasses to call.
   */
  _AbstractLayoutCache$NodeDimensions(): this {
    return this;
  }
}

$J.define(AbstractLayoutCache, 'javax.swing.tree.AbstractLayoutCache', { kind: 'class', ifaces: ['javax.swing.tree.RowMapper'], sup: 'java.lang.Object', ctors: { '': '_AbstractLayoutCache' }, meths: { 'getNodeDimensions(java.lang.Object,int,int,boolean,java.awt.Rectangle)': 'getNodeDimensions$Object$int$int$boolean$Rectangle', 'getBounds(javax.swing.tree.TreePath,java.awt.Rectangle)': 'getBounds$TreePath$Rectangle', 'getNodeDimensions()': 'getNodeDimensions$' } });
$J.define(AbstractLayoutCache$NodeDimensions, 'javax.swing.tree.AbstractLayoutCache$NodeDimensions', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AbstractLayoutCache$NodeDimensions' } });
