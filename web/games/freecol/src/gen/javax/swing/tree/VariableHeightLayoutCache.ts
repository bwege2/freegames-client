// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/VariableHeightLayoutCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Hashtable, JObject, NoSuchElementException, Stack, Vector } from '../../../../jre/index.ts';
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
 * @author Rob Davis
 * @author Ray Ryan
 * @author Scott Violet
 */
export class VariableHeightLayoutCache extends AbstractLayoutCache {
  /**
   * The array of nodes that are currently visible, in the order they
   * are displayed.
   */
  visibleNodes: Vector<any> = null;
  /**
   * This is set to true if one of the entries has an invalid size.
   */
  updateNodeSizes_: boolean = false;
  /**
   * The root node of the internal cache of nodes that have been shown.
   * If the treeModel is vending a network rather than a true tree,
   * there may be one cached node for each path to a modeled node.
   */
  root: VariableHeightLayoutCache$TreeStateNode = null;
  /**
   * Used in getting sizes for nodes to avoid creating a new Rectangle
   * every time a size is needed.
   */
  boundsBuffer: Rectangle = null;
  /**
   * Maps from <code>TreePath</code> to a <code>TreeStateNode</code>.
   */
  treePathMapping: Hashtable<TreePath, VariableHeightLayoutCache$TreeStateNode> = null;
  /**
   * A stack of stacks.
   */
  tempStacks: Stack<Stack<TreePath>> = null;
  /**
   * Constructs a {@code VariableHeightLayoutCache}.
   */
  _VariableHeightLayoutCache(): this {
    this._AbstractLayoutCache();
    this.tempStacks = new Stack();
    this.visibleNodes = new Vector();
    this.boundsBuffer = new Rectangle()._Rectangle$();
    this.treePathMapping = new Hashtable();
    return this;
  }
  /**
   * Sets the <code>TreeModel</code> that will provide the data.
   *
   * @param newModel the <code>TreeModel</code> that is to provide the data
   */
  setModel(newModel: TreeModel): void {
    super.setModel(newModel);
    this.rebuild(false);
  }
  /**
   * Determines whether or not the root node from
   * the <code>TreeModel</code> is visible.
   *
   * @param rootVisible true if the root node of the tree is to be displayed
   * @see #rootVisible
   */
  setRootVisible(rootVisible: boolean): void {
    if (this.isRootVisible() !== rootVisible && this.root != null) {
      if (rootVisible) {
        this.root.updatePreferredSize$int(0);
        this.visibleNodes.insertElementAt(this.root, 0);
      } else if (this.visibleNodes.size() > 0) {
        this.visibleNodes.removeElementAt(0);
        if (this.treeSelectionModel != null) {
          this.treeSelectionModel.removeSelectionPath(this.root.getTreePath());
        }
      }
      if (this.treeSelectionModel != null) {
        this.treeSelectionModel.resetRowSelection();
      }
      if (this.getRowCount() > 0) {
        this.getNode(0).setYOrigin(0);
      }
      this.updateYLocationsFrom(0);
      this.visibleNodesChanged();
    }
    super.setRootVisible(rootVisible);
  }
  /**
   * Sets the height of each cell.  If the specified value
   * is less than or equal to zero the current cell renderer is
   * queried for each row's height.
   *
   * @param rowHeight the height of each cell, in pixels
   */
  setRowHeight(rowHeight: number): void {
    if (rowHeight !== this.getRowHeight()) {
      super.setRowHeight(rowHeight);
      this.invalidateSizes();
      this.visibleNodesChanged();
    }
  }
  /**
   * Sets the renderer that is responsible for drawing nodes in the tree.
   * @param nd the renderer
   */
  setNodeDimensions(nd: AbstractLayoutCache$NodeDimensions): void {
    super.setNodeDimensions(nd);
    this.invalidateSizes();
    this.visibleNodesChanged();
  }
  /**
   * Marks the path <code>path</code> expanded state to
   * <code>isExpanded</code>.
   * @param path the <code>TreePath</code> of interest
   * @param isExpanded true if the path should be expanded, otherwise false
   */
  setExpandedState(path: TreePath, isExpanded: boolean): void {
    if (path != null) {
      if (isExpanded) {
        this.ensurePathIsExpanded(path, true);
      } else {
        let node = this.getNodeForPath(path, false, true);
        if (node != null) {
          node.makeVisible();
          node.collapse$();
        }
      }
    }
  }
  /**
   * Returns true if the path is expanded, and visible.
   * @return true if the path is expanded and visible, otherwise false
   */
  getExpandedState(path: TreePath): boolean {
    let node = this.getNodeForPath(path, true, false);
    return (node != null) ? (node.isVisible() && node.isExpanded()) : false;
  }
  /**
   * Returns the <code>Rectangle</code> enclosing the label portion
   * into which the item identified by <code>path</code> will be drawn.
   *
   * @param path  the path to be drawn
   * @param placeIn the bounds of the enclosing rectangle
   * @return the bounds of the enclosing rectangle or <code>null</code>
   *    if the node could not be ascertained
   */
  getBounds$TreePath$Rectangle(path: TreePath, placeIn: Rectangle): Rectangle {
    let node = this.getNodeForPath(path, true, false);
    if (node != null) {
      if (this.updateNodeSizes_) {
        this.updateNodeSizes(false);
      }
      return node.getNodeBounds(placeIn);
    }
    return null;
  }
  /**
   * Returns the path for <code>row</code>.  If <code>row</code>
   * is not visible, <code>null</code> is returned.
   *
   * @param row the location of interest
   * @return the path for <code>row</code>, or <code>null</code>
   * if <code>row</code> is not visible
   */
  getPathForRow(row: number): TreePath {
    if (row >= 0 && row < this.getRowCount()) {
      return this.getNode(row).getTreePath();
    }
    return null;
  }
  /**
   * Returns the row where the last item identified in path is visible.
   * Will return -1 if any of the elements in path are not
   * currently visible.
   *
   * @param path the <code>TreePath</code> of interest
   * @return the row where the last item in path is visible
   */
  getRowForPath(path: TreePath): number {
    if (path == null) {
      return -1;
    }
    let visNode = this.getNodeForPath(path, true, false);
    if (visNode != null) {
      return visNode.getRow();
    }
    return -1;
  }
  /**
   * Returns the number of visible rows.
   * @return the number of visible rows
   */
  getRowCount(): number {
    return this.visibleNodes.size();
  }
  /**
   * Instructs the <code>LayoutCache</code> that the bounds for
   * <code>path</code> are invalid, and need to be updated.
   *
   * @param path the <code>TreePath</code> which is now invalid
   */
  invalidatePathBounds(path: TreePath): void {
    let node = this.getNodeForPath(path, true, false);
    if (node != null) {
      node.markSizeInvalid();
      if (node.isVisible()) {
        this.updateYLocationsFrom(node.getRow());
      }
    }
  }
  /**
   * Returns the preferred height.
   * @return the preferred height
   */
  getPreferredHeight(): number {
    let rowCount = this.getRowCount();
    if (rowCount > 0) {
      let node = this.getNode((rowCount - 1) | 0);
      return (node.getYOrigin() + node.getPreferredHeight()) | 0;
    }
    return 0;
  }
  /**
   * Returns the preferred width and height for the region in
   * <code>visibleRegion</code>.
   *
   * @param bounds  the region being queried
   */
  getPreferredWidth(bounds: Rectangle): number {
    if (this.updateNodeSizes_) {
      this.updateNodeSizes(false);
    }
    return this.getMaxNodeWidth();
  }
  /**
   * Returns the path to the node that is closest to x,y.  If
   * there is nothing currently visible this will return <code>null</code>,
   * otherwise it will always return a valid path.
   * If you need to test if the
   * returned object is exactly at x, y you should get the bounds for
   * the returned path and test x, y against that.
   *
   * @param x  the x-coordinate
   * @param y  the y-coordinate
   * @return the path to the node that is closest to x, y
   */
  getPathClosestTo(x: number, y: number): TreePath {
    if (this.getRowCount() === 0) {
      return null;
    }
    if (this.updateNodeSizes_) {
      this.updateNodeSizes(false);
    }
    let row = this.getRowContainingYLocation(y);
    return this.getNode(row).getTreePath();
  }
  /**
   * Returns an <code>Enumerator</code> that increments over the visible paths
   * starting at the passed in location. The ordering of the enumeration
   * is based on how the paths are displayed.
   *
   * @param path the location in the <code>TreePath</code> to start
   * @return an <code>Enumerator</code> that increments over the visible
   *     paths
   */
  getVisiblePathsFrom(path: TreePath): Enumeration<TreePath> {
    let node = this.getNodeForPath(path, true, false);
    if (node != null) {
      return new VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration().$o(this)._VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration$TreeStateNode(node);
    }
    return null;
  }
  /**
   * Returns the number of visible children for <code>path</code>.
   * @return the number of visible children for <code>path</code>
   */
  getVisibleChildCount(path: TreePath): number {
    let node = this.getNodeForPath(path, true, false);
    return (node != null) ? node.getVisibleChildCount() : 0;
  }
  /**
   * Informs the <code>TreeState</code> that it needs to recalculate
   * all the sizes it is referencing.
   */
  invalidateSizes(): void {
    if (this.root != null) {
      this.root.deepMarkSizeInvalid();
    }
    if (!this.isFixedRowHeight() && this.visibleNodes.size() > 0) {
      this.updateNodeSizes(true);
    }
  }
  /**
   * Returns true if the value identified by <code>path</code> is
   * currently expanded.
   * @return true if the value identified by <code>path</code> is
   *    currently expanded
   */
  isExpanded(path: TreePath): boolean {
    if (path != null) {
      let lastNode = this.getNodeForPath(path, true, false);
      return (lastNode != null && lastNode.isExpanded());
    }
    return false;
  }
  /**
   * Invoked after a node (or a set of siblings) has changed in some
   * way. The node(s) have not changed locations in the tree or
   * altered their children arrays, but other attributes have
   * changed and may affect presentation. Example: the name of a
   * file has changed, but it is in the same location in the file
   * system.
   *
   * <p><code>e.path</code> returns the path the parent of the
   * changed node(s).
   *
   * <p><code>e.childIndices</code> returns the index(es) of the
   * changed node(s).
   *
   * @param e the <code>TreeModelEvent</code> of interest
   */
  treeNodesChanged(e: TreeModelEvent): void {
    if (e != null) {
      let changedIndexs = e.getChildIndices();
      let changedNode = this.getNodeForPath(SwingUtilities2.getTreePath(e, this.getModel()), false, false);
      if (changedNode != null) {
        let changedValue = changedNode.getValue();
        changedNode.updatePreferredSize$();
        if (changedNode.hasBeenExpanded() && changedIndexs != null) {
          for (let index of changedIndexs) {
            let changedChildNode = changedNode.getChildAt(index);
            changedChildNode.setUserObject(this.treeModel.getChild(changedValue, index));
            changedChildNode.updatePreferredSize$();
          }
        } else if (changedNode === this.root) {
          changedNode.updatePreferredSize$();
        }
        if (!this.isFixedRowHeight()) {
          let aRow = changedNode.getRow();
          if (aRow !== -1) {
            this.updateYLocationsFrom(aRow);
          }
        }
        this.visibleNodesChanged();
      }
    }
  }
  visibleNodesChanged(): void {
  }
  /**
   * Adds a mapping for node.
   */
  addMapping(node: VariableHeightLayoutCache$TreeStateNode): void {
    this.treePathMapping.put(node.getTreePath(), node);
  }
  /**
   * Removes the mapping for a previously added node.
   */
  removeMapping(node: VariableHeightLayoutCache$TreeStateNode): void {
    this.treePathMapping.remove(node.getTreePath());
  }
  /**
   * Returns the node previously added for <code>path</code>. This may
   * return null, if you to create a node use getNodeForPath.
   */
  getMapping(path: TreePath): VariableHeightLayoutCache$TreeStateNode {
    return this.treePathMapping.get(path);
  }
  /**
   * Completely rebuild the tree, all expanded state, and node caches are
   * removed. All nodes are collapsed, except the root.
   */
  rebuild(clearSelection: boolean): void {
    let rootObject: any;
    this.treePathMapping.clear();
    if (this.treeModel != null && (rootObject = this.treeModel.getRoot()) != null) {
      this.root = this.createNodeForValue(rootObject);
      this.root.path = new TreePath()._TreePath$Object(rootObject);
      this.addMapping(this.root);
      this.root.updatePreferredSize$int(0);
      this.visibleNodes.removeAllElements();
      if (this.isRootVisible()) {
        this.visibleNodes.addElement(this.root);
      }
      if (!this.root.isExpanded()) {
        this.root.expand$();
      } else {
        let cursor = this.root.children();
        while (cursor.hasMoreElements()) {
          this.visibleNodes.addElement(cursor.nextElement());
        }
        if (!this.isFixedRowHeight()) {
          this.updateYLocationsFrom(0);
        }
      }
    } else {
      this.visibleNodes.removeAllElements();
      this.root = null;
    }
    if (clearSelection && this.treeSelectionModel != null) {
      this.treeSelectionModel.clearSelection();
    }
    this.visibleNodesChanged();
  }
  /**
   * Returns the TreeStateNode identified by path.  This mirrors
   * the behavior of getNodeForPath, but tries to take advantage of
   * path if it is an instance of AbstractTreePath.
   */
  getNodeForPath(path: TreePath, onlyIfVisible: boolean, shouldCreate: boolean): VariableHeightLayoutCache$TreeStateNode {
    if (path != null) {
      let node: VariableHeightLayoutCache$TreeStateNode;
      node = this.getMapping(path);
      if (node != null) {
        if (onlyIfVisible && !node.isVisible()) {
          return null;
        }
        return node;
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
              node.getLoadedChildren(shouldCreate);
              let childIndex = this.treeModel.getIndexOfChild(node.getUserObject(), path.getLastPathComponent());
              if (childIndex === -1 || childIndex >= node.getChildCount() || (onlyIfVisible && !node.isVisible())) {
                node = null;
              } else {
                node = node.getChildAt(childIndex);
              }
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
    }
    return null;
  }
  /**
   * Updates the y locations of all of the visible nodes after
   * location.
   */
  updateYLocationsFrom(location: number): void {
    if (location >= 0 && location < this.getRowCount()) {
      let counter: number;
      let maxCounter: number;
      let newYOrigin: number;
      let aNode: VariableHeightLayoutCache$TreeStateNode;
      aNode = this.getNode(location);
      newYOrigin = (aNode.getYOrigin() + aNode.getPreferredHeight()) | 0;
      for (counter = (location + 1) | 0, maxCounter = this.visibleNodes.size(); counter < maxCounter; counter++) {
        aNode = this.visibleNodes.elementAt(counter);
        aNode.setYOrigin(newYOrigin);
        newYOrigin = (newYOrigin + aNode.getPreferredHeight()) | 0;
      }
    }
  }
  /**
   * Resets the y origin of all the visible nodes as well as messaging
   * all the visible nodes to updatePreferredSize().  You should not
   * normally have to call this.  Expanding and contracting the nodes
   * automatically adjusts the locations.
   * updateAll determines if updatePreferredSize() is call on all nodes
   * or just those that don't have a valid size.
   */
  updateNodeSizes(updateAll: boolean): void {
    let aY: number;
    let counter: number;
    let maxCounter: number;
    let node: VariableHeightLayoutCache$TreeStateNode;
    this.updateNodeSizes_ = false;
    for (aY = counter = 0, maxCounter = this.visibleNodes.size(); counter < maxCounter; counter++) {
      node = this.visibleNodes.elementAt(counter);
      node.setYOrigin(aY);
      if (updateAll || !node.hasValidSize()) {
        node.updatePreferredSize$int(counter);
      }
      aY = (aY + node.getPreferredHeight()) | 0;
    }
  }
  /**
   * Returns the index of the row containing location.  If there
   * are no rows, -1 is returned.  If location is beyond the last
   * row index, the last row index is returned.
   */
  getRowContainingYLocation(location: number): number {
    let rows = this.getRowCount();
    if (rows <= 0) {
      return -1;
    }
    if (this.isFixedRowHeight()) {
      return Math.max(0, Math.min((rows - 1) | 0, $J.idiv(location, this.getRowHeight())));
    }
    let max = rows;
    let min = 0;
    let mid = 0;
    while (min < max) {
      mid = ($J.idiv(((max - min) | 0), 2) + min) | 0;
      let node = this.visibleNodes.elementAt(mid);
      let minY = node.getYOrigin();
      let maxY = (minY + node.getPreferredHeight()) | 0;
      if (location < minY) {
        max = (mid - 1) | 0;
      } else if (location >= maxY) {
        min = (mid + 1) | 0;
      } else {
        break;
      }
    }
    if (min === max) {
      mid = min;
      if (mid >= rows) {
        mid = (rows - 1) | 0;
      }
    }
    return mid;
  }
  /**
   * Ensures that all the path components in path are expanded, accept
   * for the last component which will only be expanded if expandLast
   * is true.
   * Returns true if successful in finding the path.
   */
  ensurePathIsExpanded(aPath: TreePath, expandLast: boolean): void {
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
            lastNode.expand$();
          }
        }
      }
    }
  }
  /**
   * Returns the AbstractTreeUI.VisibleNode displayed at the given row
   */
  getNode(row: number): VariableHeightLayoutCache$TreeStateNode {
    return this.visibleNodes.elementAt(row);
  }
  /**
   * Returns the maximum node width.
   */
  getMaxNodeWidth(): number {
    let maxWidth = 0;
    let nodeWidth: number;
    let counter: number;
    let node: VariableHeightLayoutCache$TreeStateNode;
    for (counter = (this.getRowCount() - 1) | 0; counter >= 0; counter--) {
      node = this.getNode(counter);
      nodeWidth = (node.getPreferredWidth() + node.getXOrigin()) | 0;
      if (nodeWidth > maxWidth) {
        maxWidth = nodeWidth;
      }
    }
    return maxWidth;
  }
  /**
   * Responsible for creating a TreeStateNode that will be used
   * to track display information about value.
   */
  createNodeForValue(value: any): VariableHeightLayoutCache$TreeStateNode {
    return new VariableHeightLayoutCache$TreeStateNode().$o(this)._VariableHeightLayoutCache$TreeStateNode(value);
  }
}

/**
 * TreeStateNode is used to keep track of each of
 * the nodes that have been expanded. This will also cache the preferred
 * size of the value it represents.
 */
export class VariableHeightLayoutCache$TreeStateNode extends DefaultMutableTreeNode {
  /**
   * Preferred size needed to draw the user object.
   */
  preferredWidth: number = 0;
  preferredHeight: number = 0;
  /**
   * X location that the user object will be drawn at.
   */
  xOrigin: number = 0;
  /**
   * Y location that the user object will be drawn at.
   */
  yOrigin: number = 0;
  /**
   * Is this node currently expanded?
   */
  expanded: boolean = false;
  /**
   * Has this node been expanded at least once?
   */
  hasBeenExpanded_: boolean = false;
  /**
   * Path of this node.
   */
  path: TreePath = null;
  _VariableHeightLayoutCache$TreeStateNode(value: any): this {
    this._DefaultMutableTreeNode$Object(value);
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
   * Returns the children of the receiver.
   * If the receiver is not currently expanded, this will return an
   * empty enumeration.
   */
  children(): Enumeration<TreeNode> {
    if (!this.isExpanded()) {
      return DefaultMutableTreeNode.EMPTY_ENUMERATION;
    } else {
      return super.children();
    }
  }
  /**
   * Returns true if the receiver is a leaf.
   */
  isLeaf(): boolean {
    return this.$outer.getModel().isLeaf(this.getValue());
  }
  /**
   * Returns the location and size of this node.
   */
  getNodeBounds(placeIn: Rectangle): Rectangle {
    if (placeIn == null) {
      placeIn = new Rectangle()._Rectangle$int$int$int$int(this.getXOrigin(), this.getYOrigin(), this.getPreferredWidth(), this.getPreferredHeight());
    } else {
      placeIn.x_ = this.getXOrigin();
      placeIn.y_ = this.getYOrigin();
      placeIn.width_ = this.getPreferredWidth();
      placeIn.height_ = this.getPreferredHeight();
    }
    return placeIn;
  }
  /**
   * @return x location to draw node at.
   */
  getXOrigin(): number {
    if (!this.hasValidSize()) {
      this.updatePreferredSize$int(this.getRow());
    }
    return this.xOrigin;
  }
  /**
   * Returns the y origin the user object will be drawn at.
   */
  getYOrigin(): number {
    if (this.$outer.isFixedRowHeight()) {
      let aRow = this.getRow();
      if (aRow === -1) {
        return -1;
      }
      return Math.imul(this.$outer.getRowHeight(), aRow);
    }
    return this.yOrigin;
  }
  /**
   * Returns the preferred height of the receiver.
   */
  getPreferredHeight(): number {
    if (this.$outer.isFixedRowHeight()) {
      return this.$outer.getRowHeight();
    } else if (!this.hasValidSize()) {
      this.updatePreferredSize$int(this.getRow());
    }
    return this.preferredHeight;
  }
  /**
   * Returns the preferred width of the receiver.
   */
  getPreferredWidth(): number {
    if (!this.hasValidSize()) {
      this.updatePreferredSize$int(this.getRow());
    }
    return this.preferredWidth;
  }
  /**
   * Returns true if this node has a valid size.
   */
  hasValidSize(): boolean {
    return (this.preferredHeight !== 0);
  }
  /**
   * Returns the row of the receiver.
   */
  getRow(): number {
    return this.$outer.visibleNodes.indexOf(this);
  }
  /**
   * Returns true if this node has been expanded at least once.
   */
  hasBeenExpanded(): boolean {
    return this.hasBeenExpanded_;
  }
  /**
   * Returns true if the receiver has been expanded.
   */
  isExpanded(): boolean {
    return this.expanded;
  }
  /**
   * Returns true if the receiver is currently visible.
   */
  isVisible(): boolean {
    if (this === this.$outer.root) {
      return true;
    }
    let parent = this.getParent();
    return (parent != null && parent.isExpanded() && parent.isVisible());
  }
  /**
   * Returns the number of visible children, that is the number of
   * children that are expanded, or leafs.
   */
  getVisibleChildCount(): number {
    let childCount = 0;
    if (this.isExpanded()) {
      let maxCounter = this.getChildCount();
      childCount = (childCount + maxCounter) | 0;
      for (let counter = 0; counter < maxCounter; counter++) {
        childCount = (childCount + (this.getChildAt(counter)).getVisibleChildCount()) | 0;
      }
    }
    return childCount;
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
   * Expands the receiver.
   */
  expand$(): void {
    this.expand$boolean(true);
  }
  /**
   * Collapses the receiver.
   */
  collapse$(): void {
    this.collapse$boolean(true);
  }
  /**
   * Returns the value the receiver is representing. This is a cover
   * for getUserObject.
   */
  getValue(): any {
    return this.getUserObject();
  }
  /**
   * Returns a TreePath instance for this node.
   */
  getTreePath(): TreePath {
    return this.path;
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
   * Sets y origin the user object will be drawn at to
   * <I>newYOrigin</I>.
   */
  setYOrigin(newYOrigin: number): void {
    this.yOrigin = newYOrigin;
  }
  /**
   * Shifts the y origin by <code>offset</code>.
   */
  shiftYOriginBy(offset: number): void {
    this.yOrigin = (this.yOrigin + offset) | 0;
  }
  /**
   * Updates the receivers preferredSize by invoking
   * <code>updatePreferredSize</code> with an argument of -1.
   */
  updatePreferredSize$(): void {
    this.updatePreferredSize$int(this.getRow());
  }
  /**
   * Updates the preferred size by asking the current renderer
   * for the Dimension needed to draw the user object this
   * instance represents.
   */
  updatePreferredSize$int(index: number): void {
    let bounds = this.$outer.getNodeDimensions$Object$int$int$boolean$Rectangle(this.getUserObject(), index, this.getLevel(), this.isExpanded(), this.$outer.boundsBuffer);
    if (bounds == null || bounds.height_ === 0) {
      this.xOrigin = 0;
      this.preferredWidth = this.preferredHeight = 0;
      this.$outer.updateNodeSizes_ = true;
    } else {
      this.xOrigin = bounds.x_;
      this.preferredWidth = bounds.width_;
      if (this.$outer.isFixedRowHeight()) {
        this.preferredHeight = this.$outer.getRowHeight();
      } else {
        this.preferredHeight = bounds.height_;
      }
    }
  }
  /**
   * Marks the receivers size as invalid. Next time the size, location
   * is asked for it will be obtained.
   */
  markSizeInvalid(): void {
    this.preferredHeight = 0;
  }
  /**
   * Marks the receivers size, and all its descendants sizes, as invalid.
   */
  deepMarkSizeInvalid(): void {
    this.markSizeInvalid();
    for (let counter = (this.getChildCount() - 1) | 0; counter >= 0; counter--) {
      (this.getChildAt(counter)).deepMarkSizeInvalid();
    }
  }
  /**
   * Returns the children of the receiver. If the children haven't
   * been loaded from the model and
   * <code>createIfNeeded</code> is true, the children are first
   * loaded.
   */
  getLoadedChildren(createIfNeeded: boolean): Enumeration<TreeNode> {
    if (!createIfNeeded || this.hasBeenExpanded_) {
      return super.children();
    }
    let newNode: VariableHeightLayoutCache$TreeStateNode;
    let realNode = this.getValue();
    let treeModel = this.$outer.getModel();
    let count = treeModel.getChildCount(realNode);
    this.hasBeenExpanded_ = true;
    let childRow = this.getRow();
    if (childRow === -1) {
      for (let i = 0; i < count; i++) {
        newNode = this.$outer.createNodeForValue(treeModel.getChild(realNode, i));
        this.add(newNode);
        newNode.updatePreferredSize$int(-1);
      }
    } else {
      childRow++;
      for (let i = 0; i < count; i++) {
        newNode = this.$outer.createNodeForValue(treeModel.getChild(realNode, i));
        this.add(newNode);
        newNode.updatePreferredSize$int(childRow++);
      }
    }
    return super.children();
  }
  /**
   * Messaged from expand and collapse. This is meant for subclassers
   * that may wish to do something interesting with this.
   */
  didAdjustTree(): void {
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
    this.expand$();
  }
  /**
   * Expands this node in the tree.  This will load the children
   * from the treeModel if this node has not previously been
   * expanded.  If <I>adjustTree</I> is true the tree and selection
   * are updated accordingly.
   */
  expand$boolean(adjustTree: boolean): void {
    if (!this.isExpanded() && !this.isLeaf()) {
      let isFixed = this.$outer.isFixedRowHeight();
      let startHeight = this.getPreferredHeight();
      let originalRow = this.getRow();
      this.expanded = true;
      this.updatePreferredSize$int(originalRow);
      if (!this.hasBeenExpanded_) {
        let newNode: VariableHeightLayoutCache$TreeStateNode;
        let realNode = this.getValue();
        let treeModel = this.$outer.getModel();
        let count = treeModel.getChildCount(realNode);
        let offset = originalRow === -1 ? -1 : (originalRow + 1) | 0;
        this.hasBeenExpanded_ = true;
        for (let i = 0; i < count; i++) {
          newNode = this.$outer.createNodeForValue(treeModel.getChild(realNode, i));
          this.add(newNode);
          newNode.updatePreferredSize$int(offset);
        }
      }
      let i = originalRow;
      let cursor = this.preorderEnumeration();
      cursor.nextElement();
      let newYOrigin = isFixed || (this === this.$outer.root && !this.$outer.isRootVisible()) ? 0 : (this.getYOrigin() + this.getPreferredHeight()) | 0;
      let aNode: VariableHeightLayoutCache$TreeStateNode;
      if (!isFixed) {
        while (cursor.hasMoreElements()) {
          aNode = cursor.nextElement();
          if (!this.$outer.updateNodeSizes_ && !aNode.hasValidSize()) {
            aNode.updatePreferredSize$int((i + 1) | 0);
          }
          aNode.setYOrigin(newYOrigin);
          newYOrigin = (newYOrigin + aNode.getPreferredHeight()) | 0;
          this.$outer.visibleNodes.insertElementAt(aNode, ++i);
        }
      } else {
        while (cursor.hasMoreElements()) {
          aNode = cursor.nextElement();
          this.$outer.visibleNodes.insertElementAt(aNode, ++i);
        }
      }
      if (adjustTree && (originalRow !== i || this.getPreferredHeight() !== startHeight)) {
        if (!isFixed && ++i < this.$outer.getRowCount()) {
          let counter: number;
          let heightDiff = (newYOrigin - (this.getYOrigin() + this.getPreferredHeight()) + (this.getPreferredHeight() - startHeight)) | 0;
          for (counter = (this.$outer.visibleNodes.size() - 1) | 0; counter >= i; counter--) {
            (this.$outer.visibleNodes.elementAt(counter)).shiftYOriginBy(heightDiff);
          }
        }
        this.didAdjustTree();
        this.$outer.visibleNodesChanged();
      }
      if (this.$outer.treeSelectionModel != null) {
        this.$outer.treeSelectionModel.resetRowSelection();
      }
    }
  }
  /**
   * Collapses this node in the tree.  If <I>adjustTree</I> is
   * true the tree and selection are updated accordingly.
   */
  collapse$boolean(adjustTree: boolean): void {
    if (this.isExpanded()) {
      let cursor = this.preorderEnumeration();
      cursor.nextElement();
      let rowsDeleted = 0;
      let isFixed = this.$outer.isFixedRowHeight();
      let lastYEnd: number;
      if (isFixed) {
        lastYEnd = 0;
      } else {
        lastYEnd = (this.getPreferredHeight() + this.getYOrigin()) | 0;
      }
      let startHeight = this.getPreferredHeight();
      let startYEnd = lastYEnd;
      let myRow = this.getRow();
      if (!isFixed) {
        while (cursor.hasMoreElements()) {
          let node = cursor.nextElement();
          if (node.isVisible()) {
            rowsDeleted++;
            lastYEnd = (node.getYOrigin() + node.getPreferredHeight()) | 0;
          }
        }
      } else {
        while (cursor.hasMoreElements()) {
          let node = cursor.nextElement();
          if (node.isVisible()) {
            rowsDeleted++;
          }
        }
      }
      for (let counter = (rowsDeleted + myRow) | 0; counter > myRow; counter--) {
        this.$outer.visibleNodes.removeElementAt(counter);
      }
      this.expanded = false;
      if (myRow === -1) {
        this.markSizeInvalid();
      } else if (adjustTree) {
        this.updatePreferredSize$int(myRow);
      }
      if (myRow !== -1 && adjustTree && (rowsDeleted > 0 || startHeight !== this.getPreferredHeight())) {
        startYEnd = (startYEnd + (this.getPreferredHeight() - startHeight)) | 0;
        if (!isFixed && ((myRow + 1) | 0) < this.$outer.getRowCount() && startYEnd !== lastYEnd) {
          let counter: number;
          let maxCounter: number;
          let shiftAmount: number;
          shiftAmount = (startYEnd - lastYEnd) | 0;
          for (counter = (myRow + 1) | 0, maxCounter = this.$outer.visibleNodes.size(); counter < maxCounter; counter++) {
            (this.$outer.visibleNodes.elementAt(counter)).shiftYOriginBy(shiftAmount);
          }
        }
        this.didAdjustTree();
        this.$outer.visibleNodesChanged();
      }
      if (this.$outer.treeSelectionModel != null && rowsDeleted > 0 && myRow !== -1) {
        this.$outer.treeSelectionModel.resetRowSelection();
      }
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
}

/**
 * An enumerator to iterate through visible nodes.
 */
export class VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration extends JObject {
  /**
   * Parent whose children are being enumerated.
   */
  parent: VariableHeightLayoutCache$TreeStateNode = null;
  /**
   * Index of next child. An index of -1 signifies parent should be
   * visibled next.
   */
  nextIndex: number = 0;
  /**
   * Number of children in parent.
   */
  childCount: number = 0;
  _VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration$TreeStateNode(node: VariableHeightLayoutCache$TreeStateNode): this {
    this._VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration$TreeStateNode$int(node, -1);
    return this;
  }
  _VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration$TreeStateNode$int(parent: VariableHeightLayoutCache$TreeStateNode, startIndex: number): this {
    this.parent = parent;
    this.nextIndex = startIndex;
    this.childCount = this.parent.getChildCount();
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
      let node = this.parent.getChildAt(this.nextIndex);
      retObject = node.getTreePath();
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
        this.nextIndex = newParent.getIndex(this.parent);
        this.parent = newParent;
        this.childCount = this.parent.getChildCount();
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
    if ((this.nextIndex === -1 && !this.parent.isExpanded()) || this.childCount === 0 || ++this.nextIndex >= this.childCount) {
      return false;
    }
    let child = this.parent.getChildAt(this.nextIndex);
    if (child != null && child.isExpanded()) {
      this.parent = child;
      this.nextIndex = -1;
      this.childCount = child.getChildCount();
    }
    return true;
  }
}

$J.define(VariableHeightLayoutCache, 'javax.swing.tree.VariableHeightLayoutCache', { kind: 'class', sup: 'javax.swing.tree.AbstractLayoutCache', ctors: { '': '_VariableHeightLayoutCache' }, meths: { 'getBounds(int,java.awt.Rectangle)': 'getBounds$int$Rectangle$VariableHeightLayoutCache', 'getBounds(javax.swing.tree.TreePath,java.awt.Rectangle)': 'getBounds$TreePath$Rectangle' } });
$J.define(VariableHeightLayoutCache$TreeStateNode, 'javax.swing.tree.VariableHeightLayoutCache$TreeStateNode', { kind: 'class', sup: 'javax.swing.tree.DefaultMutableTreeNode', ctors: { 'java.lang.Object': '_VariableHeightLayoutCache$TreeStateNode' }, meths: { 'collapse(boolean)': 'collapse$boolean', 'expand(boolean)': 'expand$boolean', 'updatePreferredSize(int)': 'updatePreferredSize$int', 'updatePreferredSize()': 'updatePreferredSize$', 'collapse()': 'collapse$', 'expand()': 'expand$', 'remove(int)': 'remove$int' }, inner: true });
$J.define(VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration, 'javax.swing.tree.VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration', { kind: 'class', ifaces: ['java.util.Enumeration'], sup: 'java.lang.Object', ctors: { 'javax.swing.tree.VariableHeightLayoutCache$TreeStateNode,int': '_VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration$TreeStateNode$int', 'javax.swing.tree.VariableHeightLayoutCache$TreeStateNode': '_VariableHeightLayoutCache$VisibleTreeStateNodeEnumeration$TreeStateNode' }, inner: true });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  TreePath = $J.load('javax.swing.tree.TreePath');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
