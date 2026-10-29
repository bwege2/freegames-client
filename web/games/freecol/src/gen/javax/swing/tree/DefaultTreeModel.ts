// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/DefaultTreeModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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

let EventListenerList, TreeModelEvent, TreeModelListener;

/**
 * A simple tree data model that uses TreeNodes.
 * For further information and examples that use DefaultTreeModel,
 * see <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/tree.html">How to Use Trees</a>
 * in <em>The Java Tutorial.</em>
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
export class DefaultTreeModel extends JObject {
  /**
   * Root of the tree.
   */
  root: TreeNode = null;
  /**
   * Listeners.
   */
  listenerList: EventListenerList = null;
  /**
   * Determines how the <code>isLeaf</code> method figures
   * out if a node is a leaf node. If true, a node is a leaf
   * node if it does not allow children. (If it allows
   * children, it is not a leaf node, even if no children
   * are present.) That lets you distinguish between <i>folder</i>
   * nodes and <i>file</i> nodes in a file system, for example.
   * <p>
   * If this value is false, then any node which has no
   * children is a leaf node, and any node may acquire
   * children.
   *
   * @see TreeNode#getAllowsChildren
   * @see TreeModel#isLeaf
   * @see #setAsksAllowsChildren
   */
  asksAllowsChildren_: boolean = false;
  $init_DefaultTreeModel() {
    this.listenerList = new EventListenerList()._EventListenerList();
  }
  /**
   * Creates a tree in which any node can have children.
   *
   * @param root a TreeNode object that is the root of the tree
   * @see #DefaultTreeModel(TreeNode, boolean)
   */
  _DefaultTreeModel$TreeNode(root: TreeNode): this {
    this._DefaultTreeModel$TreeNode$boolean(root, false);
    return this;
  }
  /**
   * Creates a tree specifying whether any node can have children,
   * or whether only certain nodes can have children.
   *
   * @param root a TreeNode object that is the root of the tree
   * @param asksAllowsChildren a boolean, false if any node can
   *        have children, true if each node is asked to see if
   *        it can have children
   * @see #asksAllowsChildren
   */
  _DefaultTreeModel$TreeNode$boolean(root: TreeNode, asksAllowsChildren: boolean): this {
    this.$init_DefaultTreeModel();
    this.root = root;
    this.asksAllowsChildren_ = asksAllowsChildren;
    return this;
  }
  /**
   * Returns the root of the tree.  Returns null only if the tree has
   * no nodes.
   *
   * @return  the root of the tree
   */
  getRoot(): any {
    return this.root;
  }
  /**
   * Returns the index of child in parent.
   * If either the parent or child is <code>null</code>, returns -1.
   * @param parent a note in the tree, obtained from this data source
   * @param child the node we are interested in
   * @return the index of the child in the parent, or -1
   *    if either the parent or the child is <code>null</code>
   */
  getIndexOfChild(parent: any, child: any): number {
    if (parent == null || child == null) {
      return -1;
    }
    return (parent).getIndex(child);
  }
  /**
   * Returns the child of <I>parent</I> at index <I>index</I> in the parent's
   * child array.  <I>parent</I> must be a node previously obtained from
   * this data source. This should not return null if <i>index</i>
   * is a valid index for <i>parent</i> (that is <i>index</i> &gt;= 0 &amp;&amp;
   * <i>index</i> &lt; getChildCount(<i>parent</i>)).
   *
   * @param   parent  a node in the tree, obtained from this data source
   * @return  the child of <I>parent</I> at index <I>index</I>
   */
  getChild(parent: any, index: number): any {
    return (parent).getChildAt(index);
  }
  /**
   * Returns the number of children of <I>parent</I>.  Returns 0 if the node
   * is a leaf or if it has no children.  <I>parent</I> must be a node
   * previously obtained from this data source.
   *
   * @param   parent  a node in the tree, obtained from this data source
   * @return  the number of children of the node <I>parent</I>
   */
  getChildCount(parent: any): number {
    return (parent).getChildCount();
  }
  /**
   * Returns whether the specified node is a leaf node.
   * The way the test is performed depends on the
   * <code>asksAllowsChildren</code> setting.
   *
   * @param node the node to check
   * @return true if the node is a leaf node
   *
   * @see #asksAllowsChildren
   * @see TreeModel#isLeaf
   */
  isLeaf(node: any): boolean {
    if (this.asksAllowsChildren_) {
      return !(node).getAllowsChildren();
    }
    return (node).isLeaf();
  }
  /**
   * This sets the user object of the TreeNode identified by path
   * and posts a node changed.  If you use custom user objects in
   * the TreeModel you're going to need to subclass this and
   * set the user object of the changed node to something meaningful.
   */
  valueForPathChanged(path: TreePath, newValue: any): void {
    let aNode = path.getLastPathComponent();
    aNode.setUserObject(newValue);
    this.nodeChanged(aNode);
  }
  /**
   * Invoke this method after you've changed how node is to be
   * represented in the tree.
   *
   * @param node the changed node
   */
  nodeChanged(node: TreeNode): void {
    if (this.listenerList != null && node != null) {
      let parent = node.getParent();
      if (parent != null) {
        let anIndex = parent.getIndex(node);
        if (anIndex !== -1) {
          let cIndexs = $J.newArray(1, 0);
          cIndexs[0] = anIndex;
          this.nodesChanged(parent, cIndexs);
        }
      } else if (node === this.getRoot()) {
        this.nodesChanged(node, null);
      }
    }
  }
  /**
   * Invoke this method after you've changed how the children identified by
   * childIndicies are to be represented in the tree.
   *
   * @param node         changed node
   * @param childIndices indexes of changed children
   */
  nodesChanged(node: TreeNode, childIndices: number[]): void {
    if (node != null) {
      if (childIndices != null) {
        let cCount = childIndices.length;
        if (cCount > 0) {
          let cChildren = $J.newArray(cCount, null);
          for (let counter = 0; counter < cCount; counter++) {
            cChildren[counter] = node.getChildAt(childIndices[counter]);
          }
          this.fireTreeNodesChanged(this, this.getPathToRoot$TreeNode(node), childIndices, cChildren);
        }
      } else if (node === this.getRoot()) {
        this.fireTreeNodesChanged(this, this.getPathToRoot$TreeNode(node), null, null);
      }
    }
  }
  /**
   * Builds the parents of node up to and including the root node,
   * where the original node is the last element in the returned array.
   * The length of the returned array gives the node's depth in the
   * tree.
   *
   * @param aNode the TreeNode to get the path for
   * @return an array of TreeNodes giving the path from the root
   */
  getPathToRoot$TreeNode(aNode: TreeNode): TreeNode[] {
    return this.getPathToRoot$TreeNode$int(aNode, 0);
  }
  /**
   * Builds the parents of node up to and including the root node,
   * where the original node is the last element in the returned array.
   * The length of the returned array gives the node's depth in the
   * tree.
   *
   * @param aNode  the TreeNode to get the path for
   * @param depth  an int giving the number of steps already taken towards
   *        the root (on recursive calls), used to size the returned array
   * @return an array of TreeNodes giving the path from the root to the
   *         specified node
   */
  getPathToRoot$TreeNode$int(aNode: TreeNode, depth: number): TreeNode[] {
    let retNodes: TreeNode[];
    if (aNode == null) {
      if (depth === 0) {
        return null;
      } else {
        retNodes = $J.newArray(depth, null);
      }
    } else {
      depth++;
      if (aNode === this.root) {
        retNodes = $J.newArray(depth, null);
      } else {
        retNodes = this.getPathToRoot$TreeNode$int(aNode.getParent(), depth);
      }
      (retNodes[(retNodes.length - depth) | 0]) = aNode;
    }
    return retNodes;
  }
  /**
   * Adds a listener for the TreeModelEvent posted after the tree changes.
   *
   * @see     #removeTreeModelListener
   * @param   l       the listener to add
   */
  addTreeModelListener(l: TreeModelListener): void {
    this.listenerList.add($J.cls(TreeModelListener), l);
  }
  /**
   * Removes a listener previously added with <B>addTreeModelListener()</B>.
   *
   * @see     #addTreeModelListener
   * @param   l       the listener to remove
   */
  removeTreeModelListener(l: TreeModelListener): void {
    this.listenerList.remove($J.cls(TreeModelListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   *
   * @param source the source of the {@code TreeModelEvent};
   *               typically {@code this}
   * @param path the path to the parent of the nodes that changed; use
   *             {@code null} to identify the root has changed
   * @param childIndices the indices of the changed elements
   * @param children the changed elements
   */
  fireTreeNodesChanged(source: any, path: any[], childIndices: number[], children: any[]): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeModelListener)) {
        if (e == null) {
          e = new TreeModelEvent()._TreeModelEvent$Object$ObjectArr$intArr$ObjectArr(source, path, childIndices, children);
        }
        (listeners[(i + 1) | 0]).treeNodesChanged(e);
      }
    }
  }
}

$J.define(DefaultTreeModel, 'javax.swing.tree.DefaultTreeModel', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.swing.tree.TreeModel'], sup: 'java.lang.Object', ctors: { 'javax.swing.tree.TreeNode,boolean': '_DefaultTreeModel$TreeNode$boolean', 'javax.swing.tree.TreeNode': '_DefaultTreeModel$TreeNode' }, meths: { 'fireTreeStructureChanged(java.lang.Object,javax.swing.tree.TreePath)': 'fireTreeStructureChanged$Object$TreePath$DefaultTreeModel', 'fireTreeStructureChanged(java.lang.Object,java.lang.Object[],int[],java.lang.Object[])': 'fireTreeStructureChanged$Object$ObjectArr$intArr$ObjectArr', 'getPathToRoot(javax.swing.tree.TreeNode,int)': 'getPathToRoot$TreeNode$int', 'getPathToRoot(javax.swing.tree.TreeNode)': 'getPathToRoot$TreeNode', 'reload(javax.swing.tree.TreeNode)': 'reload$TreeNode', 'reload()': 'reload$' } });
$J.module(() => {
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  TreeModelEvent = $J.load('javax.swing.event.TreeModelEvent');
  TreeModelListener = $J.load('javax.swing.event.TreeModelListener');
});
