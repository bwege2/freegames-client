// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/util/IdentityArrayList.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2007, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AbstractList, Arrays, Collection, IllegalArgumentException, IndexOutOfBoundsException } from '../../../../jre/index.ts';

/**
 * Resizable-array implementation of the {@code List} interface.  Implements
 * all optional list operations, and permits all elements, including
 * {@code null}.  In addition to implementing the {@code List} interface,
 * this class provides methods to manipulate the size of the array that is
 * used internally to store the list.  (This class is roughly equivalent to
 * {@code Vector}, except that it is unsynchronized.)<p>
 *
 * The {@code size}, {@code isEmpty}, {@code get}, {@code set},
 * {@code iterator}, and {@code listIterator} operations run in constant
 * time.  The {@code add} operation runs in <i>amortized constant time</i>,
 * that is, adding n elements requires O(n) time.  All of the other operations
 * run in linear time (roughly speaking).  The constant factor is low compared
 * to that for the {@code LinkedList} implementation.<p>
 *
 * Each {@code IdentityArrayList} instance has a <i>capacity</i>.  The capacity is
 * the size of the array used to store the elements in the list.  It is always
 * at least as large as the list size.  As elements are added to an IdentityArrayList,
 * its capacity grows automatically.  The details of the growth policy are not
 * specified beyond the fact that adding an element has constant amortized
 * time cost.<p>
 *
 * An application can increase the capacity of an {@code IdentityArrayList} instance
 * before adding a large number of elements using the {@code ensureCapacity}
 * operation.  This may reduce the amount of incremental reallocation.
 *
 * <p><strong>Note that this implementation is not synchronized.</strong>
 * If multiple threads access an {@code IdentityArrayList} instance concurrently,
 * and at least one of the threads modifies the list structurally, it
 * <i>must</i> be synchronized externally.  (A structural modification is
 * any operation that adds or deletes one or more elements, or explicitly
 * resizes the backing array; merely setting the value of an element is not
 * a structural modification.)  This is typically accomplished by
 * synchronizing on some object that naturally encapsulates the list.
 *
 * If no such object exists, the list should be "wrapped" using the
 * {@link java.util.Collections#synchronizedList Collections.synchronizedList}
 * method.  This is best done at creation time, to prevent accidental
 * unsynchronized access to the list:<pre>
 *   List list = Collections.synchronizedList(new IdentityArrayList(...));</pre>
 *
 * <p>The iterators returned by this class's {@code iterator} and
 * {@code listIterator} methods are <i>fail-fast</i>: if the list is
 * structurally modified at any time after the iterator is created, in any way
 * except through the iterator's own {@code remove} or {@code add} methods,
 * the iterator will throw a {@link ConcurrentModificationException}.  Thus, in
 * the face of concurrent modification, the iterator fails quickly and cleanly,
 * rather than risking arbitrary, non-deterministic behavior at an undetermined
 * time in the future.<p>
 *
 * Note that the fail-fast behavior of an iterator cannot be guaranteed
 * as it is, generally speaking, impossible to make any hard guarantees in the
 * presence of unsynchronized concurrent modification.  Fail-fast iterators
 * throw {@code ConcurrentModificationException} on a best-effort basis.
 * Therefore, it would be wrong to write a program that depended on this
 * exception for its correctness: <i>the fail-fast behavior of iterators
 * should be used only to detect bugs.</i><p>
 */
export class IdentityArrayList<E> extends AbstractList {
  /**
   * The array buffer into which the elements of the IdentityArrayList are stored.
   * The capacity of the IdentityArrayList is the length of this array buffer.
   */
  elementData: any[] = null;
  /**
   * The size of the IdentityArrayList (the number of elements it contains).
   *
   * @serial
   */
  size_: number = 0;
  /**
   * Constructs an empty list with the specified initial capacity.
   *
   * @param   initialCapacity   the initial capacity of the list
   * @throws IllegalArgumentException if the specified initial capacity
   *            is negative
   */
  _IdentityArrayList$int(initialCapacity: number): this {
    this._AbstractList();
    if (initialCapacity < 0) {
      throw new IllegalArgumentException('Illegal Capacity: ' + initialCapacity);
    }
    this.elementData = $J.newArray(initialCapacity, null);
    return this;
  }
  /**
   * Constructs an empty list with an initial capacity of ten.
   */
  _IdentityArrayList$(): this {
    this._IdentityArrayList$int(10);
    return this;
  }
  /**
   * Constructs a list containing the elements of the specified
   * collection, in the order they are returned by the collection's
   * iterator.
   *
   * @param c the collection whose elements are to be placed into this list
   * @throws NullPointerException if the specified collection is null
   */
  _IdentityArrayList$Collection(c: Collection<E>): this {
    this._AbstractList();
    this.elementData = c.toArray();
    this.size_ = this.elementData.length;
    if ($J.getClass(this.elementData) !== $J.cls('java.lang.Object[]')) {
      this.elementData = Arrays.copyOf(this.elementData, this.size_, $J.cls('java.lang.Object[]'));
    }
    return this;
  }
  /**
   * Increases the capacity of this {@code IdentityArrayList} instance, if
   * necessary, to ensure that it can hold at least the number of elements
   * specified by the minimum capacity argument.
   *
   * @param   minCapacity   the desired minimum capacity
   */
  ensureCapacity(minCapacity: number): void {
    this.modCount++;
    let oldCapacity = this.elementData.length;
    if (minCapacity > oldCapacity) {
      let oldData = this.elementData;
      let newCapacity = ($J.idiv((Math.imul(oldCapacity, 3)), 2) + 1) | 0;
      if (newCapacity < minCapacity) {
        newCapacity = minCapacity;
      }
      this.elementData = Arrays.copyOf(this.elementData, newCapacity);
    }
  }
  /**
   * Returns the number of elements in this list.
   *
   * @return the number of elements in this list
   */
  size(): number {
    return this.size_;
  }
  /**
   * Returns {@code true} if this list contains no elements.
   *
   * @return {@code true} if this list contains no elements
   */
  isEmpty(): boolean {
    return this.size_ === 0;
  }
  /**
   * Returns {@code true} if this list contains the specified element.
   * More formally, returns {@code true} if and only if this list contains
   * at least one element {@code e} such that
   * {@code o == e}.
   *
   * @param o element whose presence in this list is to be tested
   * @return {@code true} if this list contains the specified element
   */
  contains(o: any): boolean {
    return this.indexOf(o) >= 0;
  }
  /**
   * Returns the index of the first occurrence of the specified element
   * in this list, or -1 if this list does not contain the element.
   * More formally, returns the lowest index {@code i} such that
   * {@code get(i) == o},
   * or -1 if there is no such index.
   *
   * @param o element to search for
   * @return the index of the first occurrence of the specified element in
   *         this list, or -1 if this list does not contain the element
   */
  indexOf(o: any): number {
    for (let i = 0; i < this.size_; i++) {
      if (o === this.elementData[i]) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Returns the index of the last occurrence of the specified element
   * in this list, or -1 if this list does not contain the element.
   * More formally, returns the highest index {@code i} such that
   * {@code get(i) == o},
   * or -1 if there is no such index.
   *
   * @param o element to search for
   * @return the index of the last occurrence of the specified element in
   *         this list, or -1 if this list does not contain the element
   */
  lastIndexOf(o: any): number {
    for (let i = (this.size_ - 1) | 0; i >= 0; i--) {
      if (o === this.elementData[i]) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Returns an array containing all of the elements in this list
   * in proper sequence (from first to last element).
   *
   * <p>The returned array will be "safe" in that no references to it are
   * maintained by this list.  (In other words, this method must allocate
   * a new array).  The caller is thus free to modify the returned array.
   *
   * <p>This method acts as bridge between array-based and collection-based
   * APIs.
   *
   * @return an array containing all of the elements in this list in
   *         proper sequence
   */
  toArray$(): any[] {
    return Arrays.copyOf(this.elementData, this.size_);
  }
  /**
   * Returns an array containing all of the elements in this list in proper
   * sequence (from first to last element); the runtime type of the returned
   * array is that of the specified array.  If the list fits in the
   * specified array, it is returned therein.  Otherwise, a new array is
   * allocated with the runtime type of the specified array and the size of
   * this list.
   *
   * <p>If the list fits in the specified array with room to spare
   * (i.e., the array has more elements than the list), the element in
   * the array immediately following the end of the collection is set to
   * {@code null}.  (This is useful in determining the length of the
   * list <i>only</i> if the caller knows that the list does not contain
   * any null elements.)
   *
   * @param a the array into which the elements of the list are to
   *          be stored, if it is big enough; otherwise, a new array of the
   *          same runtime type is allocated for this purpose.
   * @return an array containing the elements of the list
   * @throws ArrayStoreException if the runtime type of the specified array
   *         is not a supertype of the runtime type of every element in
   *         this list
   * @throws NullPointerException if the specified array is null
   */
  toArray$ObjectArr<T>(a: T[]): T[] {
    if (a.length < this.size_) {
      return Arrays.copyOf(this.elementData, this.size_, $J.getClass(a));
    }
    $J.system_arraycopy(this.elementData, 0, a, 0, this.size_);
    if (a.length > this.size_) {
      a[this.size_] = null;
    }
    return a;
  }
  /**
   * Returns the element at the specified position in this list.
   *
   * @param  index index of the element to return
   * @return the element at the specified position in this list
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  get(index: number): E {
    this.rangeCheck(index);
    let rv = this.elementData[index];
    return rv;
  }
  /**
   * Replaces the element at the specified position in this list with
   * the specified element.
   *
   * @param index index of the element to replace
   * @param element element to be stored at the specified position
   * @return the element previously at the specified position
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  set(index: number, element: E): E {
    this.rangeCheck(index);
    let oldValue = this.elementData[index];
    this.elementData[index] = element;
    return oldValue;
  }
  /**
   * Appends the specified element to the end of this list.
   *
   * @param e element to be appended to this list
   * @return {@code true} (as specified by {@link Collection#add})
   */
  add$Object(e: E): boolean {
    this.ensureCapacity((this.size_ + 1) | 0);
    this.elementData[this.size_++] = e;
    return true;
  }
  /**
   * Inserts the specified element at the specified position in this
   * list. Shifts the element currently at that position (if any) and
   * any subsequent elements to the right (adds one to their indices).
   *
   * @param index index at which the specified element is to be inserted
   * @param element element to be inserted
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  add$int$Object(index: number, element: E): void {
    this.rangeCheckForAdd(index);
    this.ensureCapacity((this.size_ + 1) | 0);
    $J.system_arraycopy(this.elementData, index, this.elementData, (index + 1) | 0, (this.size_ - index) | 0);
    this.elementData[index] = element;
    this.size_++;
  }
  /**
   * Removes the element at the specified position in this list.
   * Shifts any subsequent elements to the left (subtracts one from their
   * indices).
   *
   * @param index the index of the element to be removed
   * @return the element that was removed from the list
   * @throws IndexOutOfBoundsException {@inheritDoc}
   */
  remove$int(index: number): E {
    this.rangeCheck(index);
    this.modCount++;
    let oldValue = this.elementData[index];
    let numMoved = (this.size_ - index - 1) | 0;
    if (numMoved > 0) {
      $J.system_arraycopy(this.elementData, (index + 1) | 0, this.elementData, index, numMoved);
    }
    this.elementData[--this.size_] = null;
    return oldValue;
  }
  /**
   * Removes the first occurrence of the specified element from this list,
   * if it is present.  If this list does not contain the element, the list is
   * unchanged.  More formally, removes the element with the lowest index
   * {@code i} such that {@code get(i) == o}
   * (if such an element exists).  Returns {@code true} if this list
   * contained the specified element (or equivalently, if this list
   * changed as a result of the call).
   *
   * @param o element to be removed from this list, if present
   * @return {@code true} if this list contained the specified element
   */
  remove$Object(o: any): boolean {
    for (let index = 0; index < this.size_; index++) {
      if (o === this.elementData[index]) {
        this.fastRemove(index);
        return true;
      }
    }
    return false;
  }
  fastRemove(index: number): void {
    this.modCount++;
    let numMoved = (this.size_ - index - 1) | 0;
    if (numMoved > 0) {
      $J.system_arraycopy(this.elementData, (index + 1) | 0, this.elementData, index, numMoved);
    }
    this.elementData[--this.size_] = null;
  }
  /**
   * Removes all of the elements from this list.  The list will
   * be empty after this call returns.
   */
  clear(): void {
    this.modCount++;
    for (let i = 0; i < this.size_; i++) {
      this.elementData[i] = null;
    }
    this.size_ = 0;
  }
  /**
   * Appends all of the elements in the specified collection to the end of
   * this list, in the order that they are returned by the
   * specified collection's Iterator.  The behavior of this operation is
   * undefined if the specified collection is modified while the operation
   * is in progress.  (This implies that the behavior of this call is
   * undefined if the specified collection is this list, and this
   * list is nonempty.)
   *
   * @param c collection containing elements to be added to this list
   * @return {@code true} if this list changed as a result of the call
   * @throws NullPointerException if the specified collection is null
   */
  addAll$Collection(c: Collection<E>): boolean {
    let a = c.toArray();
    let numNew = a.length;
    this.ensureCapacity((this.size_ + numNew) | 0);
    $J.system_arraycopy(a, 0, this.elementData, this.size_, numNew);
    this.size_ = (this.size_ + numNew) | 0;
    return numNew !== 0;
  }
  /**
   * Inserts all of the elements in the specified collection into this
   * list, starting at the specified position.  Shifts the element
   * currently at that position (if any) and any subsequent elements to
   * the right (increases their indices).  The new elements will appear
   * in the list in the order that they are returned by the
   * specified collection's iterator.
   *
   * @param index index at which to insert the first element from the
   *              specified collection
   * @param c collection containing elements to be added to this list
   * @return {@code true} if this list changed as a result of the call
   * @throws IndexOutOfBoundsException {@inheritDoc}
   * @throws NullPointerException if the specified collection is null
   */
  addAll$int$Collection(index: number, c: Collection<E>): boolean {
    this.rangeCheckForAdd(index);
    let a = c.toArray();
    let numNew = a.length;
    this.ensureCapacity((this.size_ + numNew) | 0);
    let numMoved = (this.size_ - index) | 0;
    if (numMoved > 0) {
      $J.system_arraycopy(this.elementData, index, this.elementData, (index + numNew) | 0, numMoved);
    }
    $J.system_arraycopy(a, 0, this.elementData, index, numNew);
    this.size_ = (this.size_ + numNew) | 0;
    return numNew !== 0;
  }
  /**
   * Removes from this list all of the elements whose index is between
   * {@code fromIndex}, inclusive, and {@code toIndex}, exclusive.
   * Shifts any succeeding elements to the left (reduces their index).
   * This call shortens the list by {@code (toIndex - fromIndex)} elements.
   * (If {@code toIndex==fromIndex}, this operation has no effect.)
   *
   * @param fromIndex index of first element to be removed
   * @param toIndex index after last element to be removed
   * @throws IndexOutOfBoundsException if fromIndex or toIndex out of
   *              range (fromIndex &lt; 0 || fromIndex &gt;= size() || toIndex
   *              &gt; size() || toIndex &lt; fromIndex)
   */
  removeRange(fromIndex: number, toIndex: number): void {
    this.modCount++;
    let numMoved = (this.size_ - toIndex) | 0;
    $J.system_arraycopy(this.elementData, toIndex, this.elementData, fromIndex, numMoved);
    let newSize = (this.size_ - (toIndex - fromIndex)) | 0;
    while (this.size_ !== newSize) {
      this.elementData[--this.size_] = null;
    }
  }
  /**
   * Checks if the given index is in range.  If not, throws an appropriate
   * runtime exception.  This method does *not* check if the index is
   * negative: It is always used immediately prior to an array access,
   * which throws an ArrayIndexOutOfBoundsException if index is negative.
   */
  rangeCheck(index: number): void {
    if (index >= this.size_) {
      throw new IndexOutOfBoundsException(this.outOfBoundsMsg(index));
    }
  }
  /**
   * A version of rangeCheck used by add and addAll.
   */
  rangeCheckForAdd(index: number): void {
    if (index > this.size_ || index < 0) {
      throw new IndexOutOfBoundsException(this.outOfBoundsMsg(index));
    }
  }
  /**
   * Constructs an IndexOutOfBoundsException detail message.
   * Of the many possible refactorings of the error handling code,
   * this "outlining" performs best with both server and client VMs.
   */
  outOfBoundsMsg(index: number): string {
    return 'Index: ' + index + ', Size: ' + this.size_;
  }
  add(...a: any[]): any {
    if (a.length === 1) return this.add$Object(...a);
    if (a.length === 2 && typeof a[0] === 'number') return this.add$int$Object(...a);
    return super.add(...a);
  }
  addAll(...a: any[]): any {
    if (a.length === 1 && (a[0] == null || $J.isa(a[0], Collection))) return this.addAll$Collection(...a);
    if (a.length === 2 && typeof a[0] === 'number' && (a[1] == null || $J.isa(a[1], Collection))) return this.addAll$int$Collection(...a);
    return super.addAll(...a);
  }
  remove(...a: any[]): any {
    if (a.length === 1 && typeof a[0] === 'number') return this.remove$int(...a);
    if (a.length === 1) return this.remove$Object(...a);
    return super.remove(...a);
  }
  toArray(...a: any[]): any {
    if (a.length === 0) return this.toArray$(...a);
    if (a.length === 1 && (a[0] == null || Array.isArray(a[0]) || ArrayBuffer.isView(a[0]))) return this.toArray$ObjectArr(...a);
    return super.toArray(...a);
  }
}

$J.define(IdentityArrayList, 'sun.awt.util.IdentityArrayList', { kind: 'class', ifaces: ['java.util.List', 'java.util.RandomAccess'], sup: 'java.util.AbstractList', ctors: { 'java.util.Collection': '_IdentityArrayList$Collection', '': '_IdentityArrayList$', 'int': '_IdentityArrayList$int' }, meths: { 'addAll(int,java.util.Collection)': 'addAll$int$Collection', 'addAll(java.util.Collection)': 'addAll$Collection', 'remove(java.lang.Object)': 'remove$Object', 'remove(int)': 'remove$int', 'add(int,java.lang.Object)': 'add$int$Object', 'add(java.lang.Object)': 'add$Object', 'toArray(java.lang.Object[])': 'toArray$ObjectArr', 'toArray()': 'toArray$' } });
