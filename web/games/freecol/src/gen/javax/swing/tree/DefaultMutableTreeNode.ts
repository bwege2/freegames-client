// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/DefaultMutableTreeNode.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayIndexOutOfBoundsException, CloneNotSupportedException, Collections, IllegalArgumentException, IllegalStateException, JError, JObject, Stack, Vector } from '../../../../jre/index.ts';

/**
 * A <code>DefaultMutableTreeNode</code> is a general-purpose node in a tree data
 * structure.
 * For examples of using default mutable tree nodes, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/tree.html">How to Use Trees</a>
 * in <em>The Java Tutorial.</em>
 *
 * <p>
 *
 * A tree node may have at most one parent and 0 or more children.
 * <code>DefaultMutableTreeNode</code> provides operations for examining and modifying a
 * node's parent and children and also operations for examining the tree that
 * the node is a part of.  A node's tree is the set of all nodes that can be
 * reached by starting at the node and following all the possible links to
 * parents and children.  A node with no parent is the root of its tree; a
 * node with no children is a leaf.  A tree may consist of many subtrees,
 * each node acting as the root for its own subtree.
 * <p>
 * This class provides enumerations for efficiently traversing a tree or
 * subtree in various orders or for following the path between two nodes.
 * A <code>DefaultMutableTreeNode</code> may also hold a reference to a user object, the
 * use of which is left to the user.  Asking a <code>DefaultMutableTreeNode</code> for its
 * string representation with <code>toString()</code> returns the string
 * representation of its user object.
 * <p>
 * <b>This is not a thread safe class.</b>If you intend to use
 * a DefaultMutableTreeNode (or a tree of TreeNodes) in more than one thread, you
 * need to do your own synchronizing. A good convention to adopt is
 * synchronizing on the root node of a tree.
 * <p>
 * While DefaultMutableTreeNode implements the MutableTreeNode interface and
 * will allow you to add in any implementation of MutableTreeNode not all
 * of the methods in DefaultMutableTreeNode will be applicable to all
 * MutableTreeNodes implementations. Especially with some of the enumerations
 * that are provided, using some of these methods assumes the
 * DefaultMutableTreeNode contains only DefaultMutableNode instances. All
 * of the TreeNode/MutableTreeNode methods will behave as defined no
 * matter what implementations are added.
 *
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
 * @see MutableTreeNode
 *
 * @author Rob Davis
 */
export class DefaultMutableTreeNode extends JObject {
  /**
   * An enumeration that is always empty. This is used when an enumeration
   * of a leaf node's children is requested.
   */
  static EMPTY_ENUMERATION: Enumeration<TreeNode> = null;
  /**
   * this node's parent, or null if this node has no parent
   */
  parent: MutableTreeNode = null;
  /**
   * array of children, may be null if this node has no children
   */
  children_: Vector<TreeNode> = null;
  /**
   * optional user object
   */
  userObject: any = null;
  /**
   * true if the node is able to have children
   */
  allowsChildren: boolean = false;
  /**
   * Creates a tree node with no parent, no children, but which allows
   * children, and initializes it with the specified user object.
   *
   * @param userObject an Object provided by the user that constitutes
   *                   the node's data
   */
  _DefaultMutableTreeNode$Object(userObject: any): this {
    this._DefaultMutableTreeNode$Object$boolean(userObject, true);
    return this;
  }
  /**
   * Creates a tree node with no parent, no children, initialized with
   * the specified user object, and that allows children only if
   * specified.
   *
   * @param userObject an Object provided by the user that constitutes
   *        the node's data
   * @param allowsChildren if true, the node is allowed to have child
   *        nodes -- otherwise, it is always a leaf node
   */
  _DefaultMutableTreeNode$Object$boolean(userObject: any, allowsChildren: boolean): this {
    this.parent = null;
    this.allowsChildren = allowsChildren;
    this.userObject = userObject;
    return this;
  }
  /**
   * Removes <code>newChild</code> from its present parent (if it has a
   * parent), sets the child's parent to this node, and then adds the child
   * to this node's child array at index <code>childIndex</code>.
   * <code>newChild</code> must not be null and must not be an ancestor of
   * this node.
   *
   * @param   newChild        the MutableTreeNode to insert under this node
   * @param   childIndex      the index in this node's child array
   *                          where this node is to be inserted
   * @throws       ArrayIndexOutOfBoundsException  if
   *                          <code>childIndex</code> is out of bounds
   * @throws       IllegalArgumentException        if
   *                          <code>newChild</code> is null or is an
   *                          ancestor of this node
   * @throws       IllegalStateException   if this node does not allow
   *                                          children
   * @see     #isNodeDescendant
   */
  insert(newChild: MutableTreeNode, childIndex: number): void {
    if (!this.allowsChildren) {
      throw new IllegalStateException('node does not allow children');
    } else if (newChild == null) {
      throw new IllegalArgumentException('new child is null');
    } else if (this.isNodeAncestor(newChild)) {
      throw new IllegalArgumentException('new child is an ancestor');
    }
    let oldParent = newChild.getParent();
    if (oldParent != null) {
      oldParent.remove$MutableTreeNode(newChild);
    }
    newChild.setParent(this);
    if (this.children_ == null) {
      this.children_ = new Vector();
    }
    this.children_.insertElementAt(newChild, childIndex);
  }
  /**
   * Removes the child at the specified index from this node's children
   * and sets that node's parent to null. The child node to remove
   * must be a <code>MutableTreeNode</code>.
   *
   * @param   childIndex      the index in this node's child array
   *                          of the child to remove
   * @throws       ArrayIndexOutOfBoundsException  if
   *                          <code>childIndex</code> is out of bounds
   */
  remove$int(childIndex: number): void {
    let child = this.getChildAt(childIndex);
    this.children_.removeElementAt(childIndex);
    child.setParent(null);
  }
  /**
   * Sets this node's parent to <code>newParent</code> but does not
   * change the parent's child array.  This method is called from
   * <code>insert()</code> and <code>remove()</code> to
   * reassign a child's parent, it should not be messaged from anywhere
   * else.
   *
   * @param   newParent       this node's new parent
   */
  setParent(newParent: MutableTreeNode): void {
    this.parent = newParent;
  }
  /**
   * Returns this node's parent or null if this node has no parent.
   *
   * @return  this node's parent TreeNode, or null if this node has no parent
   */
  getParent(): TreeNode {
    return this.parent;
  }
  /**
   * Returns the child at the specified index in this node's child array.
   *
   * @param   index   an index into this node's child array
   * @throws       ArrayIndexOutOfBoundsException  if <code>index</code>
   *                                          is out of bounds
   * @return  the TreeNode in this node's child array at  the specified index
   */
  getChildAt(index: number): TreeNode {
    if (this.children_ == null) {
      throw new ArrayIndexOutOfBoundsException('node has no children');
    }
    return this.children_.elementAt(index);
  }
  /**
   * Returns the number of children of this node.
   *
   * @return  an int giving the number of children of this node
   */
  getChildCount(): number {
    if (this.children_ == null) {
      return 0;
    } else {
      return this.children_.size();
    }
  }
  /**
   * Returns the index of the specified child in this node's child array.
   * If the specified node is not a child of this node, returns
   * <code>-1</code>.  This method performs a linear search and is O(n)
   * where n is the number of children.
   *
   * @param   aChild  the TreeNode to search for among this node's children
   * @throws       IllegalArgumentException        if <code>aChild</code>
   *                                                  is null
   * @return  an int giving the index of the node in this node's child
   *          array, or <code>-1</code> if the specified node is a not
   *          a child of this node
   */
  getIndex(aChild: TreeNode): number {
    if (aChild == null) {
      throw new IllegalArgumentException('argument is null');
    }
    if (!this.isNodeChild(aChild)) {
      return -1;
    }
    return this.children_.indexOf(aChild);
  }
  /**
   * Creates and returns a forward-order enumeration of this node's
   * children.  Modifying this node's child array invalidates any child
   * enumerations created before the modification.
   *
   * @return  an Enumeration of this node's children
   */
  children(): Enumeration<TreeNode> {
    if (this.children_ == null) {
      return DefaultMutableTreeNode.EMPTY_ENUMERATION;
    } else {
      return this.children_.elements();
    }
  }
  /**
   * Returns true if this node is allowed to have children.
   *
   * @return  true if this node allows children, else false
   */
  getAllowsChildren(): boolean {
    return this.allowsChildren;
  }
  /**
   * Sets the user object for this node to <code>userObject</code>.
   *
   * @param   userObject      the Object that constitutes this node's
   *                          user-specified data
   * @see     #getUserObject
   * @see     #toString
   */
  setUserObject(userObject: any): void {
    this.userObject = userObject;
  }
  /**
   * Returns this node's user object.
   *
   * @return  the Object stored at this node by the user
   * @see     #setUserObject
   * @see     #toString
   */
  getUserObject(): any {
    return this.userObject;
  }
  /**
   * Removes <code>aChild</code> from this node's child array, giving it a
   * null parent.
   *
   * @param   aChild  a child of this node to remove
   * @throws       IllegalArgumentException        if <code>aChild</code>
   *                                  is null or is not a child of this node
   */
  remove$MutableTreeNode(aChild: MutableTreeNode): void {
    if (aChild == null) {
      throw new IllegalArgumentException('argument is null');
    }
    if (!this.isNodeChild(aChild)) {
      throw new IllegalArgumentException('argument is not a child');
    }
    this.remove$int(this.getIndex(aChild));
  }
  /**
   * Removes <code>newChild</code> from its parent and makes it a child of
   * this node by adding it to the end of this node's child array.
   *
   * @see             #insert
   * @param   newChild        node to add as a child of this node
   * @throws       IllegalArgumentException    if <code>newChild</code>
   *                                          is null
   * @throws       IllegalStateException   if this node does not allow
   *                                          children
   */
  add(newChild: MutableTreeNode): void {
    if (newChild != null && newChild.getParent() === this) {
      this.insert(newChild, (this.getChildCount() - 1) | 0);
    } else {
      this.insert(newChild, this.getChildCount());
    }
  }
  /**
   * Returns true if <code>anotherNode</code> is an ancestor of this node
   * -- if it is this node, this node's parent, or an ancestor of this
   * node's parent.  (Note that a node is considered an ancestor of itself.)
   * If <code>anotherNode</code> is null, this method returns false.  This
   * operation is at worst O(h) where h is the distance from the root to
   * this node.
   *
   * @see             #isNodeDescendant
   * @see             #getSharedAncestor
   * @param   anotherNode     node to test as an ancestor of this node
   * @return  true if this node is a descendant of <code>anotherNode</code>
   */
  isNodeAncestor(anotherNode: TreeNode): boolean {
    if (anotherNode == null) {
      return false;
    }
    let ancestor = this;
    do {
      if (ancestor === anotherNode) {
        return true;
      }
    } while ((ancestor = ancestor.getParent()) != null);
    return false;
  }
  /**
   * Returns the number of levels above this node -- the distance from
   * the root to this node.  If this node is the root, returns 0.
   *
   * @see     #getDepth
   * @return  the number of levels above this node
   */
  getLevel(): number {
    let ancestor: TreeNode;
    let levels = 0;
    ancestor = this;
    while ((ancestor = ancestor.getParent()) != null) {
      levels++;
    }
    return levels;
  }
  /**
   * Returns the path from the root, to get to this node.  The last
   * element in the path is this node.
   *
   * @return an array of TreeNode objects giving the path, where the
   *         first element in the path is the root and the last
   *         element is this node.
   */
  getPath(): TreeNode[] {
    return this.getPathToRoot(this, 0);
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
  getPathToRoot(aNode: TreeNode, depth: number): TreeNode[] {
    let retNodes: TreeNode[];
    if (aNode == null) {
      if (depth === 0) {
        return null;
      } else {
        retNodes = $J.newArray(depth, null);
      }
    } else {
      depth++;
      retNodes = this.getPathToRoot(aNode.getParent(), depth);
      (retNodes[(retNodes.length - depth) | 0]) = aNode;
    }
    return retNodes;
  }
  /**
   * Creates and returns an enumeration that traverses the subtree rooted at
   * this node in preorder.  The first node returned by the enumeration's
   * <code>nextElement()</code> method is this node.<P>
   *
   * Modifying the tree by inserting, removing, or moving a node invalidates
   * any enumerations created before the modification.
   *
   * @see     #postorderEnumeration
   * @return  an enumeration for traversing the tree in preorder
   */
  preorderEnumeration(): Enumeration<TreeNode> {
    return new DefaultMutableTreeNode$PreorderEnumeration()._DefaultMutableTreeNode$PreorderEnumeration(this);
  }
  /**
   * Creates and returns an enumeration that traverses the subtree rooted at
   * this node in postorder.  The first node returned by the enumeration's
   * <code>nextElement()</code> method is the leftmost leaf.  This is the
   * same as a depth-first traversal.<P>
   *
   * Modifying the tree by inserting, removing, or moving a node invalidates
   * any enumerations created before the modification.
   *
   * @see     #depthFirstEnumeration
   * @see     #preorderEnumeration
   * @return  an enumeration for traversing the tree in postorder
   */
  postorderEnumeration(): Enumeration<TreeNode> {
    return new DefaultMutableTreeNode$PostorderEnumeration()._DefaultMutableTreeNode$PostorderEnumeration(this);
  }
  /**
   * Creates and returns an enumeration that traverses the subtree rooted at
   * this node in depth-first order.  The first node returned by the
   * enumeration's <code>nextElement()</code> method is the leftmost leaf.
   * This is the same as a postorder traversal.<P>
   *
   * Modifying the tree by inserting, removing, or moving a node invalidates
   * any enumerations created before the modification.
   *
   * @see     #breadthFirstEnumeration
   * @see     #postorderEnumeration
   * @return  an enumeration for traversing the tree in depth-first order
   */
  depthFirstEnumeration(): Enumeration<TreeNode> {
    return this.postorderEnumeration();
  }
  /**
   * Returns true if <code>aNode</code> is a child of this node.  If
   * <code>aNode</code> is null, this method returns false.
   *
   * @param   aNode the node to determinate whether it is a child
   * @return  true if <code>aNode</code> is a child of this node; false if
   *                  <code>aNode</code> is null
   */
  isNodeChild(aNode: TreeNode): boolean {
    let retval: boolean;
    if (aNode == null) {
      retval = false;
    } else {
      if (this.getChildCount() === 0) {
        retval = false;
      } else {
        retval = (aNode.getParent() === this);
      }
    }
    return retval;
  }
  /**
   * Returns true if this node has no children.  To distinguish between
   * nodes that have no children and nodes that <i>cannot</i> have
   * children (e.g. to distinguish files from empty directories), use this
   * method in conjunction with <code>getAllowsChildren</code>
   *
   * @see     #getAllowsChildren
   * @return  true if this node has no children
   */
  isLeaf(): boolean {
    return (this.getChildCount() === 0);
  }
  /**
   * Returns the result of sending <code>toString()</code> to this node's
   * user object, or the empty string if the node has no user object.
   *
   * @see     #getUserObject
   */
  toString(): string {
    if (this.userObject == null) {
      return '';
    } else {
      return $J.str(this.userObject);
    }
  }
  /**
   * Overridden to make clone public.  Returns a shallow copy of this node;
   * the new node has no parent or children and has a reference to the same
   * user object, if any.
   *
   * @return  a copy of this node
   */
  clone(): any {
    let newNode: DefaultMutableTreeNode;
    try {
      newNode = super.clone();
      newNode.children_ = null;
      newNode.parent = null;
    } catch ($e0) {
      if ($J.isa($e0, CloneNotSupportedException)) {
        let e = $J.exc($e0);
        throw new JError(e.toString());
      } else {
        throw $e0;
      }
    }
    return newNode;
  }
  static $clinit() {
    DefaultMutableTreeNode.EMPTY_ENUMERATION = Collections.emptyEnumeration();
  }
}

export class DefaultMutableTreeNode$PreorderEnumeration extends JObject {
  stack: Stack<Enumeration<TreeNode>> = null;
  _DefaultMutableTreeNode$PreorderEnumeration(rootNode: TreeNode): this {
    this.stack = new Stack();
    let v = new Vector(1);
    v.addElement(rootNode);
    this.stack.push(v.elements());
    return this;
  }
  hasMoreElements(): boolean {
    return (!this.stack.empty() && this.stack.peek().hasMoreElements());
  }
  nextElement(): TreeNode {
    let enumer = this.stack.peek();
    let node = enumer.nextElement();
    let children = node.children();
    if (!enumer.hasMoreElements()) {
      this.stack.pop();
    }
    if (children.hasMoreElements()) {
      this.stack.push(children);
    }
    return node;
  }
}

export class DefaultMutableTreeNode$PostorderEnumeration extends JObject {
  root: TreeNode = null;
  children_: Enumeration<TreeNode> = null;
  subtree: Enumeration<TreeNode> = null;
  _DefaultMutableTreeNode$PostorderEnumeration(rootNode: TreeNode): this {
    this.root = rootNode;
    this.children_ = this.root.children();
    this.subtree = DefaultMutableTreeNode.EMPTY_ENUMERATION;
    return this;
  }
  hasMoreElements(): boolean {
    return this.root != null;
  }
  nextElement(): TreeNode {
    let retval: TreeNode;
    if (this.subtree.hasMoreElements()) {
      retval = this.subtree.nextElement();
    } else if (this.children_.hasMoreElements()) {
      this.subtree = new DefaultMutableTreeNode$PostorderEnumeration()._DefaultMutableTreeNode$PostorderEnumeration(this.children_.nextElement());
      retval = this.subtree.nextElement();
    } else {
      retval = this.root;
      this.root = null;
    }
    return retval;
  }
}

$J.define(DefaultMutableTreeNode, 'javax.swing.tree.DefaultMutableTreeNode', { kind: 'class', ifaces: ['java.lang.Cloneable', 'javax.swing.tree.MutableTreeNode', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.lang.Object,boolean': '_DefaultMutableTreeNode$Object$boolean', 'java.lang.Object': '_DefaultMutableTreeNode$Object', '': '_DefaultMutableTreeNode$' }, meths: { 'remove(javax.swing.tree.MutableTreeNode)': 'remove$MutableTreeNode', 'remove(int)': 'remove$int' }, clinit: true, lazy: ['EMPTY_ENUMERATION'] });
$J.define(DefaultMutableTreeNode$PreorderEnumeration, 'javax.swing.tree.DefaultMutableTreeNode$PreorderEnumeration', { kind: 'class', ifaces: ['java.util.Enumeration'], sup: 'java.lang.Object', ctors: { 'javax.swing.tree.TreeNode': '_DefaultMutableTreeNode$PreorderEnumeration' } });
$J.define(DefaultMutableTreeNode$PostorderEnumeration, 'javax.swing.tree.DefaultMutableTreeNode$PostorderEnumeration', { kind: 'class', ifaces: ['java.util.Enumeration'], sup: 'java.lang.Object', ctors: { 'javax.swing.tree.TreeNode': '_DefaultMutableTreeNode$PostorderEnumeration' } });
