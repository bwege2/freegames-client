// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/FixedHeightLayoutCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Hashtable, IllegalArgumentException, JObject, NoSuchElementException, Stack } from '../../../../jre/index.ts';
import { AbstractLayoutCache } from './AbstractLayoutCache.ts';
import { DefaultMutableTreeNode } from './DefaultMutableTreeNode.ts';

let Rectangle, TreePath, SwingUtilities2;

/**
 * NOTE: This will become more open in a future release.
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
 * @author Scott Violet
 */
export class FixedHeightLayoutCache extends AbstractLayoutCache {
  /**
   * Root node.
   */
  root: FixedHeightLayoutCache$FHTreeStateNode = null;
  /**
   * Number of rows currently visible.
   */
  rowCount: number = 0;
  /**
   * Used in getting sizes for nodes to avoid creating a new Rectangle
   * every time a size is needed.
   */
  boundsBuffer: Rectangle = null;
  /**
   * Maps from TreePath to a FHTreeStateNode.
   */
  treePathMapping: Hashtable<TreePath, FixedHeightLayoutCache$FHTreeStateNode> = null;
  /**
   * Used for getting path/row information.
   */
  info: FixedHeightLayoutCache$SearchInfo = null;
  tempStacks: Stack<Stack<TreePath>> = null;
  /**
   * Constructs a {@code FixedHeightLayoutCache}.
   */
  _FixedHeightLayoutCache(): this {
    this._AbstractLayoutCache();
    this.tempStacks = new Stack();
    this.boundsBuffer = new Rectangle()._Rectangle$();
    this.treePathMapping = new Hashtable();
    this.info = new FixedHeightLayoutCache$SearchInfo().$o(this)._FixedHeightLayoutCache$SearchInfo();
    this.setRowHeight(1);
    return this;
  }
  /**
   * Sets the TreeModel that will provide the data.
   *
   * @param newModel the TreeModel that is to provide the data
   */
  setModel(newModel: TreeModel): void {
    super.setModel(newModel);
    this.rebuild(false);
  }
  /**
   * Determines whether or not the root node from
   * the TreeModel is visible.
   *
   * @param rootVisible true if the root node of the tree is to be displayed
   * @see #rootVisible
   */
  setRootVisible(rootVisible: boolean): void {
    if (this.isRootVisible() !== rootVisible) {
      super.setRootVisible(rootVisible);
      if (this.root != null) {
        if (rootVisible) {
          this.rowCount++;
          this.root.adjustRowBy$int(1);
        } else {
          this.rowCount--;
          this.root.adjustRowBy$int(-1);
        }
        this.visibleNodesChanged();
      }
    }
  }
  /**
   * Sets the height of each cell. If rowHeight is less than or equal to
   * 0 this will throw an IllegalArgumentException.
   *
   * @param rowHeight the height of each cell, in pixels
   */
  setRowHeight(rowHeight: number): void {
    if (rowHeight <= 0) {
      throw new IllegalArgumentException('FixedHeightLayoutCache only supports row heights greater than 0');
    }
    if (this.getRowHeight() !== rowHeight) {
      super.setRowHeight(rowHeight);
      this.visibleNodesChanged();
    }
  }
  /**
   * Returns the number of visible rows.
   */
  getRowCount(): number {
    return this.rowCount;
  }
  /**
   * Does nothing, FixedHeightLayoutCache doesn't cache width, and that
   * is all that could change.
   */
  invalidatePathBounds(path: TreePath): void {
  }
  /**
   * Informs the TreeState that it needs to recalculate all the sizes
   * it is referencing.
   */
  invalidateSizes(): void {
    this.visibleNodesChanged();
  }
  /**
   * Returns true if the value identified by row is currently expanded.
   */
  isExpanded(path: TreePath): boolean {
    if (path != null) {
      let lastNode = this.getNodeForPath(path, true, false);
      return (lastNode != null && lastNode.isExpanded());
    }
    return false;
  }
  /**
   * Returns a rectangle giving the bounds needed to draw path.
   *
   * @param path     a TreePath specifying a node
   * @param placeIn  a Rectangle object giving the available space
   * @return a Rectangle object specifying the space to be used
   */
  getBounds$TreePath$Rectangle(path: TreePath, placeIn: Rectangle): Rectangle {
    if (path == null) {
      return null;
    }
    let node = this.getNodeForPath(path, true, false);
    if (node != null) {
      return this.getBounds$FHTreeStateNode$int$Rectangle$FixedHeightLayoutCache(node, -1, placeIn);
    }
    let parentPath = path.getParentPath();
    node = this.getNodeForPath(parentPath, true, false);
    if (node != null && node.isExpanded()) {
      let childIndex = this.treeModel.getIndexOfChild(parentPath.getLastPathComponent(), path.getLastPathComponent());
      if (childIndex !== -1) {
        return this.getBounds$FHTreeStateNode$int$Rectangle$FixedHeightLayoutCache(node, childIndex, placeIn);
      }
    }
    return null;
  }
  /**
   * Returns the path for passed in row.  If row is not visible
   * null is returned.
   */
  getPathForRow(row: number): TreePath {
    if (row >= 0 && row < this.getRowCount()) {
      if (this.root.getPathForRow(row, this.getRowCount(), this.info)) {
        return this.info.getPath();
      }
    }
    return null;
  }
  /**
   * Returns the row that the last item identified in path is visible
   * at.  Will return -1 if any of the elements in path are not
   * currently visible.
   */
  getRowForPath(path: TreePath): number {
    if (path == null || this.root == null) {
      return -1;
    }
    let node = this.getNodeForPath(path, true, false);
    if (node != null) {
      return node.getRow();
    }
    let parentPath = path.getParentPath();
    node = this.getNodeForPath(parentPath, true, false);
    if (node != null && node.isExpanded()) {
      return node.getRowToModelIndex(this.treeModel.getIndexOfChild(parentPath.getLastPathComponent(), path.getLastPathComponent()));
    }
    return -1;
  }
  /**
   * Returns the path to the node that is closest to x,y.  If
   * there is nothing currently visible this will return null, otherwise
   * it'll always return a valid path.  If you need to test if the
   * returned object is exactly at x, y you should get the bounds for
   * the returned path and test x, y against that.
   */
  getPathClosestTo(x: number, y: number): TreePath {
    if (this.getRowCount() === 0) {
      return null;
    }
    let row = this.getRowContainingYLocation(y);
    return this.getPathForRow(row);
  }
  /**
   * Returns the number of visible children for row.
   */
  getVisibleChildCount(path: TreePath): number {
    let node = this.getNodeForPath(path, true, false);
    if (node == null) {
      return 0;
    }
    return node.getTotalChildCount();
  }
  /**
   * Returns an Enumerator that increments over the visible paths
   * starting at the passed in location. The ordering of the enumeration
   * is based on how the paths are displayed.
   */
  getVisiblePathsFrom(path: TreePath): Enumeration<TreePath> {
    if (path == null) {
      return null;
    }
    let node = this.getNodeForPath(path, true, false);
    if (node != null) {
      return new FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration().$o(this)._FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode(node);
    }
    let parentPath = path.getParentPath();
    node = this.getNodeForPath(parentPath, true, false);
    if (node != null && node.isExpanded()) {
      return new FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration().$o(this)._FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode$int(node, this.treeModel.getIndexOfChild(parentPath.getLastPathComponent(), path.getLastPathComponent()));
    }
    return null;
  }
  /**
   * Marks the path <code>path</code> expanded state to
   * <code>isExpanded</code>.
   */
  setExpandedState(path: TreePath, isExpanded: boolean): void {
    if (isExpanded) {
      this.ensurePathIsExpanded(path, true);
    } else if (path != null) {
      let parentPath = path.getParentPath();
      if (parentPath != null) {
        let parentNode = this.getNodeForPath(parentPath, false, true);
        if (parentNode != null) {
          parentNode.makeVisible();
        }
      }
      let childNode = this.getNodeForPath(path, true, false);
      if (childNode != null) {
        childNode.collapse(true);
      }
    }
  }
  /**
   * Returns true if the path is expanded, and visible.
   */
  getExpandedState(path: TreePath): boolean {
    let node = this.getNodeForPath(path, true, false);
    return (node != null) ? (node.isVisible() && node.isExpanded()) : false;
  }
  /**
   * <p>Invoked after a node (or a set of siblings) has changed in some
   * way. The node(s) have not changed locations in the tree or
   * altered their children arrays, but other attributes have
   * changed and may affect presentation. Example: the name of a
   * file has changed, but it is in the same location in the file
   * system.</p>
   *
   * <p>e.path() returns the path the parent of the changed node(s).</p>
   *
   * <p>e.childIndices() returns the index(es) of the changed node(s).</p>
   */
  treeNodesChanged(e: TreeModelEvent): void {
    if (e != null) {
      let changedIndexs: number[];
      let changedParent = this.getNodeForPath(SwingUtilities2.getTreePath(e, this.getModel()), false, false);
      let maxCounter: number;
      changedIndexs = e.getChildIndices();
      if (changedParent != null) {
        if (changedIndexs != null && (maxCounter = changedIndexs.length) > 0) {
          let parentValue = changedParent.getUserObject();
          for (let counter = 0; counter < maxCounter; counter++) {
            let child = changedParent.getChildAtModelIndex(changedIndexs[counter]);
            if (child != null) {
              child.setUserObject(this.treeModel.getChild(parentValue, changedIndexs[counter]));
            }
          }
          if (changedParent.isVisible() && changedParent.isExpanded()) {
            this.visibleNodesChanged();
          }
        } else if (changedParent === this.root && changedParent.isVisible() && changedParent.isExpanded()) {
          this.visibleNodesChanged();
        }
      }
    }
  }
  visibleNodesChanged(): void {
  }
  /**
   * Returns the bounds for the given node. If <code>childIndex</code>
   * is -1, the bounds of <code>parent</code> are returned, otherwise
   * the bounds of the node at <code>childIndex</code> are returned.
   */
  getBounds$FHTreeStateNode$int$Rectangle$FixedHeightLayoutCache(parent: FixedHeightLayoutCache$FHTreeStateNode, childIndex: number, placeIn: Rectangle): Rectangle {
    let expanded: boolean;
    let level: number;
    let row: number;
    let value: any;
    if (childIndex === -1) {
      row = parent.getRow();
      value = parent.getUserObject();
      expanded = parent.isExpanded();
      level = parent.getLevel();
    } else {
      row = parent.getRowToModelIndex(childIndex);
      value = this.treeModel.getChild(parent.getUserObject(), childIndex);
      expanded = false;
      level = (parent.getLevel() + 1) | 0;
    }
    let bounds = this.getNodeDimensions$Object$int$int$boolean$Rectangle(value, row, level, expanded, this.boundsBuffer);
    if (bounds == null) {
      return null;
    }
    if (placeIn == null) {
      placeIn = new Rectangle()._Rectangle$();
    }
    placeIn.x_ = bounds.x_;
    placeIn.height_ = this.getRowHeight();
    placeIn.y_ = Math.imul(row, placeIn.height_);
    placeIn.width_ = bounds.width_;
    return placeIn;
  }
  /**
   * Adjust the large row count of the AbstractTreeUI the receiver was
   * created with.
   */
  adjustRowCountBy(changeAmount: number): void {
    this.rowCount = (this.rowCount + changeAmount) | 0;
  }
  /**
   * Adds a mapping for node.
   */
  addMapping(node: FixedHeightLayoutCache$FHTreeStateNode): void {
    this.treePathMapping.put(node.getTreePath(), node);
  }
  /**
   * Removes the mapping for a previously added node.
   */
  removeMapping(node: FixedHeightLayoutCache$FHTreeStateNode): void {
    this.treePathMapping.remove(node.getTreePath());
  }
  /**
   * Returns the node previously added for <code>path</code>. This may
   * return null, if you to create a node use getNodeForPath.
   */
  getMapping(path: TreePath): FixedHeightLayoutCache$FHTreeStateNode {
    return this.treePathMapping.get(path);
  }
  /**
   * Sent to completely rebuild the visible tree. All nodes are collapsed.
   */
  rebuild(clearSelection: boolean): void {
    let rootUO: any;
    this.treePathMapping.clear();
    if (this.treeModel != null && (rootUO = this.treeModel.getRoot()) != null) {
      this.root = this.createNodeForValue(rootUO, 0);
      this.root.path = new TreePath()._TreePath$Object(rootUO);
      this.addMapping(this.root);
      if (this.isRootVisible()) {
        this.rowCount = 1;
        this.root.row = 0;
      } else {
        this.rowCount = 0;
        this.root.row = -1;
      }
      this.root.expand();
    } else {
      this.root = null;
      this.rowCount = 0;
    }
    if (clearSelection && this.treeSelectionModel != null) {
      this.treeSelectionModel.clearSelection();
    }
    this.visibleNodesChanged();
  }
  /**
   * Returns the index of the row containing location.  If there
   * are no rows, -1 is returned.  If location is beyond the last
   * row index, the last row index is returned.
   */
  getRowContainingYLocation(location: number): number {
    if (this.getRowCount() === 0) {
      return -1;
    }
    return Math.max(0, Math.min((this.getRowCount() - 1) | 0, $J.idiv(location, this.getRowHeight())));
  }
  /**
   * Ensures that all the path components in path are expanded, except
   * for the last component which will only be expanded if expandLast
   * is true.
   * Returns true if successful in finding the path.
   */
  ensurePathIsExpanded(aPath: TreePath, expandLast: boolean): boolean {
    if (aPath != null) {
      if (this.treeModel.isLeaf(aPath.getLastPathComponent())) {
        aPath = aPath.getParentPath();
        expandLast = true;
      }
      if (aPath != null) {
        let lastNode = this.getNodeForPath(aPath, false, true);
        if (lastNode != null) {
          lastNode.makeVisible();
          if (expandLast) {
            lastNode.expand();
          }
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Creates and returns an instance of FHTreeStateNode.
   */
  createNodeForValue(value: any, childIndex: number): FixedHeightLayoutCache$FHTreeStateNode {
    return new FixedHeightLayoutCache$FHTreeStateNode().$o(this)._FixedHeightLayoutCache$FHTreeStateNode(value, childIndex, -1);
  }
  /**
   * Messages getTreeNodeForPage(path, onlyIfVisible, shouldCreate,
   * path.length) as long as path is non-null and the length is {@literal >} 0.
   * Otherwise returns null.
   */
  getNodeForPath(path: TreePath, onlyIfVisible: boolean, shouldCreate: boolean): FixedHeightLayoutCache$FHTreeStateNode {
    if (path != null) {
      let node: FixedHeightLayoutCache$FHTreeStateNode;
      node = this.getMapping(path);
      if (node != null) {
        if (onlyIfVisible && !node.isVisible()) {
          return null;
        }
        return node;
      }
      if (onlyIfVisible) {
        return null;
      }
      let paths: Stack<TreePath>;
      if (this.tempStacks.size() === 0) {
        paths = new Stack();
      } else {
        paths = this.tempStacks.pop();
      }
      try {
        paths.push(path);
        path = path.getParentPath();
        node = null;
        while (path != null) {
          node = this.getMapping(path);
          if (node != null) {
            while (node != null && paths.size() > 0) {
              path = paths.pop();
              node = node.createChildFor(path.getLastPathComponent());
            }
            return node;
          }
          paths.push(path);
          path = path.getParentPath();
        }
      } finally {
        paths.removeAllElements();
        this.tempStacks.push(paths);
      }
      return null;
    }
    return null;
  }
}

/**
 * FHTreeStateNode is used to track what has been expanded.
 * FHTreeStateNode differs from VariableHeightTreeState.TreeStateNode
 * in that it is highly model intensive. That is almost all queries to a
 * FHTreeStateNode result in the TreeModel being queried. And it
 * obviously does not support variable sized row heights.
 */
export class FixedHeightLayoutCache$FHTreeStateNode extends DefaultMutableTreeNode {
  /**
   * Is this node expanded?
   */
  isExpanded_: boolean = false;
  /**
   * Index of this node from the model.
   */
  childIndex: number = 0;
  /**
   * Child count of the receiver.
   */
  childCount: number = 0;
  /**
   * Row of the receiver. This is only valid if the row is expanded.
   */
  row: number = 0;
  /**
   * Path of this node.
   */
  path: TreePath = null;
  _FixedHeightLayoutCache$FHTreeStateNode(userObject: any, childIndex: number, row: number): this {
    this._DefaultMutableTreeNode$Object(userObject);
    this.childIndex = childIndex;
    this.row = row;
    return this;
  }
  /**
   * Messaged when this node is added somewhere, resets the path
   * and adds a mapping from path to this node.
   */
  setParent(parent: MutableTreeNode): void {
    super.setParent(parent);
    if (parent != null) {
      this.path = (parent).getTreePath().pathByAddingChild(this.getUserObject());
      this.$outer.addMapping(this);
    }
  }
  /**
   * Messaged when this node is removed from its parent, this messages
   * <code>removedFromMapping</code> to remove all the children.
   */
  remove$int(childIndex: number): void {
    let node = this.getChildAt(childIndex);
    node.removeFromMapping();
    super.remove$int(childIndex);
  }
  /**
   * Messaged to set the user object. This resets the path.
   */
  setUserObject(o: any): void {
    super.setUserObject(o);
    if (this.path != null) {
      let parent = this.getParent();
      if (parent != null) {
        this.resetChildrenPaths(parent.getTreePath());
      } else {
        this.resetChildrenPaths(null);
      }
    }
  }
  /**
   * Returns the <code>TreePath</code> of the receiver.
   */
  getTreePath(): TreePath {
    return this.path;
  }
  /**
   * Returns the child for the passed in model index, this will
   * return <code>null</code> if the child for <code>index</code>
   * has not yet been created (expanded).
   */
  getChildAtModelIndex(index: number): FixedHeightLayoutCache$FHTreeStateNode {
    for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
      if ((this.getChildAt(counter)).childIndex === index) {
        return this.getChildAt(counter);
      }
    }
    return null;
  }
  /**
   * Returns true if this node is visible. This is determined by
   * asking all the parents if they are expanded.
   */
  isVisible(): boolean {
    let parent = this.getParent();
    if (parent == null) {
      return true;
    }
    return (parent.isExpanded() && parent.isVisible());
  }
  /**
   * Returns the row of the receiver.
   */
  getRow(): number {
    return this.row;
  }
  /**
   * Returns the row of the child with a model index of
   * <code>index</code>.
   */
  getRowToModelIndex(index: number): number {
    let child: FixedHeightLayoutCache$FHTreeStateNode;
    let lastRow = (this.getRow() + 1) | 0;
    let retValue = lastRow;
    for (let counter = 0, maxCounter = this.getChildCount(); counter < maxCounter; counter++) {
      child = this.getChildAt(counter);
      if (child.childIndex >= index) {
        if (child.childIndex === index) {
          return child.row;
        }
        if (counter === 0) {
          return (this.getRow() + 1 + index) | 0;
        }
        return (child.row - (child.childIndex - index)) | 0;
      }
    }
    return (this.getRow() + 1 + this.getTotalChildCount() - (this.childCount - index)) | 0;
  }
  /**
   * Returns the number of children in the receiver by descending all
   * expanded nodes and messaging them with getTotalChildCount.
   */
  getTotalChildCount(): number {
    if (this.isExpanded()) {
      let parent = this.getParent();
      let pIndex: number;
      if (parent != null && (((pIndex = parent.getIndex(this)) + 1) | 0) < parent.getChildCount()) {
        let nextSibling = parent.getChildAt((pIndex + 1) | 0);
        return (nextSibling.row - this.row - (nextSibling.childIndex - this.childIndex)) | 0;
      } else {
        let retCount = this.childCount;
        for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
          retCount = (retCount + (this.getChildAt(counter)).getTotalChildCount()) | 0;
        }
        return retCount;
      }
    }
    return 0;
  }
  /**
   * Returns true if this node is expanded.
   */
  isExpanded(): boolean {
    return this.isExpanded_;
  }
  /**
   * Recreates the receivers path, and all its children's paths.
   */
  resetChildrenPaths(parentPath: TreePath): void {
    this.$outer.removeMapping(this);
    if (parentPath == null) {
      this.path = new TreePath()._TreePath$Object(this.getUserObject());
    } else {
      this.path = parentPath.pathByAddingChild(this.getUserObject());
    }
    this.$outer.addMapping(this);
    for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
      (this.getChildAt(counter)).resetChildrenPaths(this.path);
    }
  }
  /**
   * Removes the receiver, and all its children, from the mapping
   * table.
   */
  removeFromMapping(): void {
    if (this.path != null) {
      this.$outer.removeMapping(this);
      for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
        (this.getChildAt(counter)).removeFromMapping();
      }
    }
  }
  /**
   * Creates a new node to represent <code>userObject</code>.
   * This does NOT check to ensure there isn't already a child node
   * to manage <code>userObject</code>.
   */
  createChildFor(userObject: any): FixedHeightLayoutCache$FHTreeStateNode {
    let newChildIndex = this.$outer.treeModel.getIndexOfChild(this.getUserObject(), userObject);
    if (newChildIndex < 0) {
      return null;
    }
    let aNode: FixedHeightLayoutCache$FHTreeStateNode;
    let child = this.$outer.createNodeForValue(userObject, newChildIndex);
    let childRow: number;
    if (this.isVisible()) {
      childRow = this.getRowToModelIndex(newChildIndex);
    } else {
      childRow = -1;
    }
    child.row = childRow;
    for (let counter = 0, maxCounter = this.getChildCount(); counter < maxCounter; counter++) {
      aNode = this.getChildAt(counter);
      if (aNode.childIndex > newChildIndex) {
        this.insert(child, counter);
        return child;
      }
    }
    this.add(child);
    return child;
  }
  /**
   * Adjusts the receiver, and all its children rows by
   * <code>amount</code>.
   */
  adjustRowBy$int(amount: number): void {
    this.row = (this.row + amount) | 0;
    if (this.isExpanded_) {
      for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
        (this.getChildAt(counter)).adjustRowBy$int(amount);
      }
    }
  }
  /**
   * Adjusts this node, its child, and its parent starting at
   * an index of <code>index</code> index is the index of the child
   * to start adjusting from, which is not necessarily the model
   * index.
   */
  adjustRowBy$int$int(amount: number, startIndex: number): void {
    if (this.isExpanded_) {
      for (let counter = (this.getChildCount() - 1) | 0; counter >= startIndex; counter--) {
        (this.getChildAt(counter)).adjustRowBy$int(amount);
      }
    }
    let parent = this.getParent();
    if (parent != null) {
      parent.adjustRowBy$int$int(amount, (parent.getIndex(this) + 1) | 0);
    }
  }
  /**
   * Messaged when the node has expanded. This updates all of
   * the receivers children rows, as well as the total row count.
   */
  didExpand(): void {
    let nextRow = this.setRowAndChildren(this.row);
    let parent = this.getParent();
    let childRowCount = (nextRow - this.row - 1) | 0;
    if (parent != null) {
      parent.adjustRowBy$int$int(childRowCount, (parent.getIndex(this) + 1) | 0);
    }
    this.$outer.adjustRowCountBy(childRowCount);
  }
  /**
   * Sets the receivers row to <code>nextRow</code> and recursively
   * updates all the children of the receivers rows. The index the
   * next row is to be placed as is returned.
   */
  setRowAndChildren(nextRow: number): number {
    this.row = nextRow;
    if (!this.isExpanded()) {
      return (this.row + 1) | 0;
    }
    let lastRow = (this.row + 1) | 0;
    let lastModelIndex = 0;
    let child: FixedHeightLayoutCache$FHTreeStateNode;
    let maxCounter = this.getChildCount();
    for (let counter = 0; counter < maxCounter; counter++) {
      child = this.getChildAt(counter);
      lastRow = (lastRow + (child.childIndex - lastModelIndex)) | 0;
      lastModelIndex = (child.childIndex + 1) | 0;
      if (child.isExpanded_) {
        lastRow = child.setRowAndChildren(lastRow);
      } else {
        child.row = lastRow++;
      }
    }
    return (lastRow + this.childCount - lastModelIndex) | 0;
  }
  /**
   * Makes the receiver visible, but invoking
   * <code>expandParentAndReceiver</code> on the superclass.
   */
  makeVisible(): void {
    let parent = this.getParent();
    if (parent != null) {
      parent.expandParentAndReceiver();
    }
  }
  /**
   * Invokes <code>expandParentAndReceiver</code> on the parent,
   * and expands the receiver.
   */
  expandParentAndReceiver(): void {
    let parent = this.getParent();
    if (parent != null) {
      parent.expandParentAndReceiver();
    }
    this.expand();
  }
  /**
   * Expands the receiver.
   */
  expand(): void {
    if (!this.isExpanded_ && !this.isLeaf()) {
      let visible = this.isVisible();
      this.isExpanded_ = true;
      this.childCount = this.$outer.treeModel.getChildCount(this.getUserObject());
      if (visible) {
        this.didExpand();
      }
      if (visible && this.$outer.treeSelectionModel != null) {
        this.$outer.treeSelectionModel.resetRowSelection();
      }
    }
  }
  /**
   * Collapses the receiver. If <code>adjustRows</code> is true,
   * the rows of nodes after the receiver are adjusted.
   */
  collapse(adjustRows: boolean): void {
    if (this.isExpanded_) {
      if (this.isVisible() && adjustRows) {
        let childCount = this.getTotalChildCount();
        this.isExpanded_ = false;
        this.$outer.adjustRowCountBy(-childCount);
        this.adjustRowBy$int$int(-childCount, 0);
      } else {
        this.isExpanded_ = false;
      }
      if (adjustRows && this.isVisible() && this.$outer.treeSelectionModel != null) {
        this.$outer.treeSelectionModel.resetRowSelection();
      }
    }
  }
  /**
   * Returns true if the receiver is a leaf.
   */
  isLeaf(): boolean {
    let model = this.$outer.getModel();
    return (model != null) ? model.isLeaf(this.getUserObject()) : true;
  }
  /**
   * Returns true if there is a row for <code>row</code>.
   * <code>nextRow</code> gives the bounds of the receiver.
   * Information about the found row is returned in <code>info</code>.
   * This should be invoked on root with <code>nextRow</code> set
   * to <code>getRowCount</code>().
   */
  getPathForRow(row: number, nextRow: number, info: FixedHeightLayoutCache$SearchInfo): boolean {
    if (this.row === row) {
      info.node = this;
      info.isNodeParentNode = false;
      info.childIndex = this.childIndex;
      return true;
    }
    let child: FixedHeightLayoutCache$FHTreeStateNode;
    let lastChild = null;
    for (let counter = 0, maxCounter = this.getChildCount(); counter < maxCounter; counter++) {
      child = this.getChildAt(counter);
      if (child.row > row) {
        if (counter === 0) {
          info.node = this;
          info.isNodeParentNode = true;
          info.childIndex = (row - this.row - 1) | 0;
          return true;
        } else {
          let lastChildEndRow = (1 + child.row - (child.childIndex - lastChild.childIndex)) | 0;
          if (row < lastChildEndRow) {
            return lastChild.getPathForRow(row, lastChildEndRow, info);
          }
          info.node = this;
          info.isNodeParentNode = true;
          info.childIndex = (row - lastChildEndRow + lastChild.childIndex + 1) | 0;
          return true;
        }
      }
      lastChild = child;
    }
    if (lastChild != null) {
      let lastChildEndRow = (nextRow - (this.childCount - lastChild.childIndex) + 1) | 0;
      if (row < lastChildEndRow) {
        return lastChild.getPathForRow(row, lastChildEndRow, info);
      }
      info.node = this;
      info.isNodeParentNode = true;
      info.childIndex = (row - lastChildEndRow + lastChild.childIndex + 1) | 0;
      return true;
    } else {
      let retChildIndex = (row - this.row - 1) | 0;
      if (retChildIndex >= this.childCount) {
        return false;
      }
      info.node = this;
      info.isNodeParentNode = true;
      info.childIndex = retChildIndex;
      return true;
    }
  }
}

/**
 * Used as a placeholder when getting the path in FHTreeStateNodes.
 */
export class FixedHeightLayoutCache$SearchInfo extends JObject {
  node: FixedHeightLayoutCache$FHTreeStateNode = null;
  isNodeParentNode: boolean = false;
  childIndex: number = 0;
  _FixedHeightLayoutCache$SearchInfo(): this {
    return this;
  }
  getPath(): TreePath {
    if (this.node == null) {
      return null;
    }
    if (this.isNodeParentNode) {
      return this.node.getTreePath().pathByAddingChild(this.$outer.treeModel.getChild(this.node.getUserObject(), this.childIndex));
    }
    return this.node.path;
  }
}

/**
 * An enumerator to iterate through visible nodes.
 */
export class FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration extends JObject {
  /**
   * Parent whose children are being enumerated.
   */
  parent: FixedHeightLayoutCache$FHTreeStateNode = null;
  /**
   * Index of next child. An index of -1 signifies parent should be
   * visibled next.
   */
  nextIndex: number = 0;
  /**
   * Number of children in parent.
   */
  childCount: number = 0;
  _FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode(node: FixedHeightLayoutCache$FHTreeStateNode): this {
    this._FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode$int(node, -1);
    return this;
  }
  _FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode$int(parent: FixedHeightLayoutCache$FHTreeStateNode, startIndex: number): this {
    this.parent = parent;
    this.nextIndex = startIndex;
    this.childCount = this.$outer.treeModel.getChildCount(this.parent.getUserObject());
    return this;
  }
  /**
   * @return true if more visible nodes.
   */
  hasMoreElements(): boolean {
    return (this.parent != null);
  }
  /**
   * @return next visible TreePath.
   */
  nextElement(): TreePath {
    if (!this.hasMoreElements()) {
      throw new NoSuchElementException('No more visible paths');
    }
    let retObject: TreePath;
    if (this.nextIndex === -1) {
      retObject = this.parent.getTreePath();
    } else {
      let node = this.parent.getChildAtModelIndex(this.nextIndex);
      if (node == null) {
        retObject = this.parent.getTreePath().pathByAddingChild(this.$outer.treeModel.getChild(this.parent.getUserObject(), this.nextIndex));
      } else {
        retObject = node.getTreePath();
      }
    }
    this.updateNextObject();
    return retObject;
  }
  /**
   * Determines the next object by invoking <code>updateNextIndex</code>
   * and if not successful <code>findNextValidParent</code>.
   */
  updateNextObject(): void {
    if (!this.updateNextIndex()) {
      this.findNextValidParent();
    }
  }
  /**
   * Finds the next valid parent, this should be called when nextIndex
   * is beyond the number of children of the current parent.
   */
  findNextValidParent(): boolean {
    if (this.parent === this.$outer.root) {
      this.parent = null;
      return false;
    }
    while (this.parent != null) {
      let newParent = this.parent.getParent();
      if (newParent != null) {
        this.nextIndex = this.parent.childIndex;
        this.parent = newParent;
        this.childCount = this.$outer.treeModel.getChildCount(this.parent.getUserObject());
        if (this.updateNextIndex()) {
          return true;
        }
      } else {
        this.parent = null;
      }
    }
    return false;
  }
  /**
   * Updates <code>nextIndex</code> returning false if it is beyond
   * the number of children of parent.
   */
  updateNextIndex(): boolean {
    if (this.nextIndex === -1 && !this.parent.isExpanded()) {
      return false;
    }
    if (this.childCount === 0) {
      return false;
    } else if (++this.nextIndex >= this.childCount) {
      return false;
    }
    let child = this.parent.getChildAtModelIndex(this.nextIndex);
    if (child != null && child.isExpanded()) {
      this.parent = child;
      this.nextIndex = -1;
      this.childCount = this.$outer.treeModel.getChildCount(child.getUserObject());
    }
    return true;
  }
}

$J.define(FixedHeightLayoutCache, 'javax.swing.tree.FixedHeightLayoutCache', { kind: 'class', sup: 'javax.swing.tree.AbstractLayoutCache', ctors: { '': '_FixedHeightLayoutCache' }, meths: { 'getBounds(javax.swing.tree.FixedHeightLayoutCache$FHTreeStateNode,int,java.awt.Rectangle)': 'getBounds$FHTreeStateNode$int$Rectangle$FixedHeightLayoutCache', 'getBounds(javax.swing.tree.TreePath,java.awt.Rectangle)': 'getBounds$TreePath$Rectangle' } });
$J.define(FixedHeightLayoutCache$FHTreeStateNode, 'javax.swing.tree.FixedHeightLayoutCache$FHTreeStateNode', { kind: 'class', sup: 'javax.swing.tree.DefaultMutableTreeNode', ctors: { 'java.lang.Object,int,int': '_FixedHeightLayoutCache$FHTreeStateNode' }, meths: { 'adjustRowBy(int,int)': 'adjustRowBy$int$int', 'adjustRowBy(int)': 'adjustRowBy$int', 'remove(int)': 'remove$int' }, inner: true });
$J.define(FixedHeightLayoutCache$SearchInfo, 'javax.swing.tree.FixedHeightLayoutCache$SearchInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FixedHeightLayoutCache$SearchInfo' }, inner: true });
$J.define(FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration, 'javax.swing.tree.FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration', { kind: 'class', ifaces: ['java.util.Enumeration'], sup: 'java.lang.Object', ctors: { 'javax.swing.tree.FixedHeightLayoutCache$FHTreeStateNode,int': '_FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode$int', 'javax.swing.tree.FixedHeightLayoutCache$FHTreeStateNode': '_FixedHeightLayoutCache$VisibleFHTreeStateNodeEnumeration$FHTreeStateNode' }, inner: true });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  TreePath = $J.load('javax.swing.tree.TreePath');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
