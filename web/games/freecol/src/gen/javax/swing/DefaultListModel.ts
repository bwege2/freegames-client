// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultListModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Vector } from '../../../jre/index.ts';
import { AbstractListModel } from './AbstractListModel.ts';

/**
 * This class loosely implements the {@code java.util.Vector}
 * API, in that it implements the 1.1.x version of
 * {@code java.util.Vector}, has no collection class support,
 * and notifies the {@code ListDataListener}s when changes occur.
 * Presently it delegates to a {@code Vector},
 * in a future release it will be a real Collection implementation.
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
 * @param <E> the type of the elements of this model
 *
 * @author Hans Muller
 * @since 1.2
 */
export class DefaultListModel<E> extends AbstractListModel {
  delegate_: Vector<E> = null;
  /**
   * Constructs a {@code DefaultListModel}.
   */
  _DefaultListModel(): this {
    this._AbstractListModel();
    this.delegate_ = new Vector();
    return this;
  }
  /**
   * Returns the number of components in this list.
   * <p>
   * This method is identical to {@code size}, which implements the
   * {@code List} interface defined in the 1.2 Collections framework.
   * This method exists in conjunction with {@code setSize} so that
   * {@code size} is identifiable as a JavaBean property.
   *
   * @return  the number of components in this list
   * @see #size()
   */
  getSize(): number {
    return this.delegate_.size();
  }
  /**
   * Returns the component at the specified index.
   * <blockquote>
   * <b>Note:</b> Although this method is not deprecated, the preferred
   *    method to use is {@code get(int)}, which implements the {@code List}
   *    interface defined in the 1.2 Collections framework.
   * </blockquote>
   * @param      index   an index into this list
   * @return     the component at the specified index
   * @throws     ArrayIndexOutOfBoundsException  if the {@code index}
   *             is negative or greater than the current size of this
   *             list
   * @see #get(int)
   */
  getElementAt(index: number): E {
    return this.delegate_.elementAt(index);
  }
  /**
   * Returns the number of components in this list.
   *
   * @return  the number of components in this list
   * @see Vector#size()
   */
  size(): number {
    return this.delegate_.size();
  }
  /**
   * Returns an enumeration of the components of this list.
   *
   * @return  an enumeration of the components of this list
   * @see Vector#elements()
   */
  elements(): Enumeration<E> {
    return this.delegate_.elements();
  }
  /**
   * Tests whether the specified object is a component in this list.
   *
   * @param   elem   an object
   * @return  {@code true} if the specified object
   *          is the same as a component in this list
   * @see Vector#contains(Object)
   */
  contains(elem: any): boolean {
    return this.delegate_.contains(elem);
  }
  /**
   * Searches for the first occurrence of {@code elem}.
   *
   * @param   elem   an object
   * @return  the index of the first occurrence of the argument in this
   *          list; returns {@code -1} if the object is not found
   * @see Vector#indexOf(Object)
   */
  indexOf$Object(elem: any): number {
    return this.delegate_.indexOf(elem);
  }
  /**
   * Returns the first component of this list.
   * @return     the first component of this list
   * @see Vector#firstElement()
   * @throws java.util.NoSuchElementException if this
   * vector has no components
   */
  firstElement(): E {
    return this.delegate_.firstElement();
  }
  /**
   * Sets the component at the specified {@code index} of this
   * list to be the specified element. The previous component at that
   * position is discarded.
   * <blockquote>
   * <b>Note:</b> Although this method is not deprecated, the preferred
   *    method to use is {@code set(int,Object)}, which implements the
   *    {@code List} interface defined in the 1.2 Collections framework.
   * </blockquote>
   *
   * @param      element what the component is to be set to
   * @param      index   the specified index
   * @throws     ArrayIndexOutOfBoundsException if the index is invalid
   * @see #set(int,Object)
   * @see Vector#setElementAt(Object,int)
   */
  setElementAt(element: E, index: number): void {
    this.delegate_.setElementAt(element, index);
    this.fireContentsChanged$Object$int$int(this, index, index);
  }
  /**
   * Deletes the component at the specified index.
   * <blockquote>
   * <b>Note:</b> Although this method is not deprecated, the preferred
   *    method to use is {@code remove(int)}, which implements the
   *    {@code List} interface defined in the 1.2 Collections framework.
   * </blockquote>
   *
   * @param      index   the index of the object to remove
   * @see #remove(int)
   * @see Vector#removeElementAt(int)
   * @throws ArrayIndexOutOfBoundsException if the index is invalid
   */
  removeElementAt(index: number): void {
    this.delegate_.removeElementAt(index);
    this.fireIntervalRemoved(this, index, index);
  }
  /**
   * Adds the specified component to the end of this list.
   *
   * @param   element   the component to be added
   * @see Vector#addElement(Object)
   */
  addElement(element: E): void {
    let index = this.delegate_.size();
    this.delegate_.addElement(element);
    this.fireIntervalAdded(this, index, index);
  }
  /**
   * Removes the first (lowest-indexed) occurrence of the argument
   * from this list.
   *
   * @param   obj   the component to be removed
   * @return  {@code true} if the argument was a component of this
   *          list; {@code false} otherwise
   * @see Vector#removeElement(Object)
   */
  removeElement(obj: any): boolean {
    let index = this.indexOf$Object(obj);
    let rv = this.delegate_.removeElement(obj);
    if (index >= 0) {
      this.fireIntervalRemoved(this, index, index);
    }
    return rv;
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a String representation of this object
   */
  toString(): string {
    return this.delegate_.toString();
  }
  /**
   * Returns the element at the specified position in this list.
   *
   * @param index index of element to return
   * @return the element at the specified position in this list
   * @throws ArrayIndexOutOfBoundsException if the index is out of range
   * ({@code index &lt; 0 || index &gt;= size()})
   */
  get(index: number): E {
    return this.delegate_.elementAt(index);
  }
  /**
   * Inserts the specified element at the specified position in this list.
   *
   * @param index index at which the specified element is to be inserted
   * @param element element to be inserted
   * @throws ArrayIndexOutOfBoundsException if the index is out of range
   * ({@code index &lt; 0 || index &gt; size()})
   */
  add(index: number, element: E): void {
    this.delegate_.insertElementAt(element, index);
    this.fireIntervalAdded(this, index, index);
  }
  /**
   * Removes the element at the specified position in this list.
   * Returns the element that was removed from the list
   *
   * @param index the index of the element to removed
   * @return the element previously at the specified position
   * @throws ArrayIndexOutOfBoundsException if the index is out of range
   * ({@code index &lt; 0 || index &gt;= size()})
   */
  remove(index: number): E {
    let rv = this.delegate_.elementAt(index);
    this.delegate_.removeElementAt(index);
    this.fireIntervalRemoved(this, index, index);
    return rv;
  }
  /**
   * Removes all of the elements from this list.  The list will
   * be empty after this call returns (unless it throws an exception).
   */
  clear(): void {
    let index1 = (this.delegate_.size() - 1) | 0;
    this.delegate_.removeAllElements();
    if (index1 >= 0) {
      this.fireIntervalRemoved(this, 0, index1);
    }
  }
  /**
   * Adds all of the elements present in the collection to the list.
   *
   * @param c the collection which contains the elements to add
   * @throws NullPointerException if {@code c} is null
   */
  addAll$Collection(c: Collection<E>): void {
    if (c.isEmpty()) {
      return;
    }
    let startIndex = this.getSize();
    this.delegate_.addAll(c);
    this.fireIntervalAdded(this, startIndex, (this.getSize() - 1) | 0);
  }
}

$J.define(DefaultListModel, 'javax.swing.DefaultListModel', { kind: 'class', sup: 'javax.swing.AbstractListModel', ctors: { '': '_DefaultListModel' }, meths: { 'addAll(int,java.util.Collection)': 'addAll$int$Collection', 'addAll(java.util.Collection)': 'addAll$Collection', 'lastIndexOf(java.lang.Object,int)': 'lastIndexOf$Object$int', 'lastIndexOf(java.lang.Object)': 'lastIndexOf$Object', 'indexOf(java.lang.Object,int)': 'indexOf$Object$int', 'indexOf(java.lang.Object)': 'indexOf$Object' } });
