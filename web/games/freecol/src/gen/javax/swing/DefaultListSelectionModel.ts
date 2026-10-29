// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/DefaultListSelectionModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BitSet, IllegalArgumentException, IndexOutOfBoundsException, JObject } from '../../../jre/index.ts';

let ListSelectionModel, EventListenerList, ListSelectionEvent, ListSelectionListener;

/**
 * Default data model for list selections.
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
 * @author Philip Milne
 * @author Hans Muller
 * @see ListSelectionModel
 * @since 1.2
 */
export class DefaultListSelectionModel extends JObject {
  static readonly MIN: number = -1;
  static readonly MAX: number = 2147483647;
  selectionMode: number = 0;
  minIndex: number = 0;
  maxIndex: number = 0;
  anchorIndex: number = 0;
  leadIndex: number = 0;
  firstAdjustedIndex: number = 0;
  lastAdjustedIndex: number = 0;
  isAdjusting: boolean = false;
  firstChangedIndex: number = 0;
  lastChangedIndex: number = 0;
  value_: BitSet = null;
  /**
   * The list of listeners.
   */
  listenerList: EventListenerList = null;
  /**
   * Whether or not the lead anchor notification is enabled.
   */
  leadAnchorNotificationEnabled: boolean = false;
  /**
   * Constructs a {@code DefaultListSelectionModel}.
   */
  _DefaultListSelectionModel(): this {
    this.selectionMode = ListSelectionModel.MULTIPLE_INTERVAL_SELECTION;
    this.minIndex = DefaultListSelectionModel.MAX;
    this.maxIndex = DefaultListSelectionModel.MIN;
    this.anchorIndex = -1;
    this.leadIndex = -1;
    this.firstAdjustedIndex = DefaultListSelectionModel.MAX;
    this.lastAdjustedIndex = DefaultListSelectionModel.MIN;
    this.isAdjusting = false;
    this.firstChangedIndex = DefaultListSelectionModel.MAX;
    this.lastChangedIndex = DefaultListSelectionModel.MIN;
    this.value_ = new BitSet(32);
    this.listenerList = new EventListenerList()._EventListenerList();
    this.leadAnchorNotificationEnabled = true;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getMinSelectionIndex(): number {
    return this.isSelectionEmpty() ? -1 : this.minIndex;
  }
  /**
   * {@inheritDoc}
   */
  getMaxSelectionIndex(): number {
    return this.maxIndex;
  }
  /**
   * {@inheritDoc}
   */
  getValueIsAdjusting(): boolean {
    return this.isAdjusting;
  }
  /**
   * {@inheritDoc}
   */
  getSelectionMode(): number {
    return this.selectionMode;
  }
  /**
   * {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   */
  setSelectionMode(selectionMode: number): void {
    let oldMode = this.selectionMode;
    switch (selectionMode) {
      case ListSelectionModel.SINGLE_SELECTION:
      case ListSelectionModel.SINGLE_INTERVAL_SELECTION:
      case ListSelectionModel.MULTIPLE_INTERVAL_SELECTION:
        this.selectionMode = selectionMode;
        break;
      default:
        throw new IllegalArgumentException('invalid selectionMode');
    }
    if (oldMode > this.selectionMode) {
      if (this.selectionMode === ListSelectionModel.SINGLE_SELECTION) {
        if (!this.isSelectionEmpty()) {
          this.setSelectionInterval(this.minIndex, this.minIndex);
        }
      } else if (this.selectionMode === ListSelectionModel.SINGLE_INTERVAL_SELECTION) {
        if (!this.isSelectionEmpty()) {
          let selectionEndindex = this.minIndex;
          while (this.value_.get((selectionEndindex + 1) | 0)) {
            selectionEndindex++;
          }
          this.setSelectionInterval(this.minIndex, selectionEndindex);
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  isSelectedIndex(index: number): boolean {
    return ((index < this.minIndex) || (index > this.maxIndex)) ? false : this.value_.get(index);
  }
  /**
   * {@inheritDoc}
   */
  isSelectionEmpty(): boolean {
    return (this.minIndex > this.maxIndex);
  }
  /**
   * {@inheritDoc}
   */
  addListSelectionListener(l: ListSelectionListener): void {
    this.listenerList.add($J.cls(ListSelectionListener), l);
  }
  /**
   * {@inheritDoc}
   */
  removeListSelectionListener(l: ListSelectionListener): void {
    this.listenerList.remove($J.cls(ListSelectionListener), l);
  }
  /**
   * Notifies listeners that we have ended a series of adjustments.
   * @param isAdjusting true if this is the final change in a series of
   *          adjustments
   */
  fireValueChanged$boolean(isAdjusting: boolean): void {
    if (this.lastChangedIndex === DefaultListSelectionModel.MIN) {
      return;
    }
    let oldFirstChangedIndex = this.firstChangedIndex;
    let oldLastChangedIndex = this.lastChangedIndex;
    this.firstChangedIndex = DefaultListSelectionModel.MAX;
    this.lastChangedIndex = DefaultListSelectionModel.MIN;
    this.fireValueChanged$int$int$boolean(oldFirstChangedIndex, oldLastChangedIndex, isAdjusting);
  }
  /**
   * Notifies <code>ListSelectionListeners</code> that the value
   * of the selection, in the closed interval <code>firstIndex</code>,
   * <code>lastIndex</code>, has changed.
   *
   * @param firstIndex the first index in the interval
   * @param lastIndex the last index in the interval
   */
  fireValueChanged$int$int(firstIndex: number, lastIndex: number): void {
    this.fireValueChanged$int$int$boolean(firstIndex, lastIndex, this.getValueIsAdjusting());
  }
  /**
   * Notifies <code>ListSelectionListeners</code> that the value
   * of the selection, in the closed interval <code>firstIndex</code>,
   * <code>lastIndex</code>, has changed and if this is the final change
   * in the series of adjustments.
   *
   * @param firstIndex the first index in the interval
   * @param lastIndex the last index in the interval
   * @param isAdjusting true if this is the final change in a series of
   *          adjustments
   * @see EventListenerList
   */
  fireValueChanged$int$int$boolean(firstIndex: number, lastIndex: number, isAdjusting: boolean): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ListSelectionListener)) {
        if (e == null) {
          e = new ListSelectionEvent()._ListSelectionEvent(this, firstIndex, lastIndex, isAdjusting);
        }
        $J.fn((listeners[(i + 1) | 0]), 'valueChanged')(e);
      }
    }
  }
  fireValueChanged$$DefaultListSelectionModel(): void {
    if (this.lastAdjustedIndex === DefaultListSelectionModel.MIN) {
      return;
    }
    if (this.getValueIsAdjusting()) {
      this.firstChangedIndex = Math.min(this.firstChangedIndex, this.firstAdjustedIndex);
      this.lastChangedIndex = Math.max(this.lastChangedIndex, this.lastAdjustedIndex);
    }
    let oldFirstAdjustedIndex = this.firstAdjustedIndex;
    let oldLastAdjustedIndex = this.lastAdjustedIndex;
    this.firstAdjustedIndex = DefaultListSelectionModel.MAX;
    this.lastAdjustedIndex = DefaultListSelectionModel.MIN;
    this.fireValueChanged$int$int(oldFirstAdjustedIndex, oldLastAdjustedIndex);
  }
  markAsDirty(r: number): void {
    if (r === -1) {
      return;
    }
    this.firstAdjustedIndex = Math.min(this.firstAdjustedIndex, r);
    this.lastAdjustedIndex = Math.max(this.lastAdjustedIndex, r);
  }
  set(r: number): void {
    if (this.value_.get(r)) {
      return;
    }
    this.value_.set(r);
    this.markAsDirty(r);
    this.minIndex = Math.min(this.minIndex, r);
    this.maxIndex = Math.max(this.maxIndex, r);
  }
  clear(r: number): void {
    if (!this.value_.get(r)) {
      return;
    }
    this.value_.clear(r);
    this.markAsDirty(r);
    if (r === this.minIndex && this.minIndex < 2147483647) {
      for (this.minIndex = (this.minIndex + 1) | 0; this.minIndex <= this.maxIndex; this.minIndex++) {
        if (this.value_.get(this.minIndex)) {
          break;
        }
      }
    }
    if (r === this.maxIndex) {
      for (this.maxIndex = (this.maxIndex - 1) | 0; this.minIndex <= this.maxIndex; this.maxIndex--) {
        if (this.value_.get(this.maxIndex)) {
          break;
        }
      }
    }
    if (this.isSelectionEmpty()) {
      this.minIndex = DefaultListSelectionModel.MAX;
      this.maxIndex = DefaultListSelectionModel.MIN;
    }
  }
  updateLeadAnchorIndices(anchorIndex: number, leadIndex: number): void {
    if (this.leadAnchorNotificationEnabled) {
      if (this.anchorIndex !== anchorIndex) {
        this.markAsDirty(this.anchorIndex);
        this.markAsDirty(anchorIndex);
      }
      if (this.leadIndex !== leadIndex) {
        this.markAsDirty(this.leadIndex);
        this.markAsDirty(leadIndex);
      }
    }
    this.anchorIndex = anchorIndex;
    this.leadIndex = leadIndex;
  }
  contains(a: number, b: number, i: number): boolean {
    return (i >= a) && (i <= b);
  }
  changeSelection$int$int$int$int$boolean$DefaultListSelectionModel(clearMin: number, clearMax: number, setMin: number, setMax: number, clearFirst: boolean): void {
    for (let i = Math.min(setMin, clearMin); i <= Math.max(setMax, clearMax); i++) {
      let shouldClear = this.contains(clearMin, clearMax, i);
      let shouldSet = this.contains(setMin, setMax, i);
      if (shouldSet && shouldClear) {
        if (clearFirst) {
          shouldClear = false;
        } else {
          shouldSet = false;
        }
      }
      if (shouldSet) {
        this.set(i);
      }
      if (shouldClear) {
        this.clear(i);
      }
      if (i === 2147483647) {
        break;
      }
    }
    this.fireValueChanged$$DefaultListSelectionModel();
  }
  /**
   * Change the selection with the effect of first clearing the values
   * in the inclusive range [clearMin, clearMax] then setting the values
   * in the inclusive range [setMin, setMax]. Do this in one pass so
   * that no values are cleared if they would later be set.
   */
  changeSelection$int$int$int$int$DefaultListSelectionModel(clearMin: number, clearMax: number, setMin: number, setMax: number): void {
    this.changeSelection$int$int$int$int$boolean$DefaultListSelectionModel(clearMin, clearMax, setMin, setMax, true);
  }
  /**
   * {@inheritDoc}
   */
  clearSelection(): void {
    this.removeSelectionIntervalImpl(this.minIndex, this.maxIndex, false);
  }
  /**
   * Changes the selection to be between {@code index0} and {@code index1}
   * inclusive. {@code index0} doesn't have to be less than or equal to
   * {@code index1}.
   * <p>
   * In {@code SINGLE_SELECTION} selection mode, only the second index
   * is used.
   * <p>
   * If this represents a change to the current selection, then each
   * {@code ListSelectionListener} is notified of the change.
   * <p>
   * If either index is {@code -1}, this method does nothing and returns
   * without exception. Otherwise, if either index is less than {@code -1},
   * an {@code IndexOutOfBoundsException} is thrown.
   *
   * @param index0 one end of the interval.
   * @param index1 other end of the interval
   * @throws IndexOutOfBoundsException if either index is less than {@code -1}
   *         (and neither index is {@code -1})
   * @see #addListSelectionListener
   */
  setSelectionInterval(index0: number, index1: number): void {
    if (index0 === -1 || index1 === -1) {
      return;
    }
    if (this.getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) {
      index0 = index1;
    }
    this.updateLeadAnchorIndices(index0, index1);
    let clearMin = this.minIndex;
    let clearMax = this.maxIndex;
    let setMin = Math.min(index0, index1);
    let setMax = Math.max(index0, index1);
    this.changeSelection$int$int$int$int$DefaultListSelectionModel(clearMin, clearMax, setMin, setMax);
  }
  /**
   * Changes the selection to be the set union of the current selection
   * and the indices between {@code index0} and {@code index1} inclusive.
   * <p>
   * In {@code SINGLE_SELECTION} selection mode, this is equivalent
   * to calling {@code setSelectionInterval}, and only the second index
   * is used. In {@code SINGLE_INTERVAL_SELECTION} selection mode, this
   * method behaves like {@code setSelectionInterval}, unless the given
   * interval is immediately adjacent to or overlaps the existing selection,
   * and can therefore be used to grow it.
   * <p>
   * If this represents a change to the current selection, then each
   * {@code ListSelectionListener} is notified of the change. Note that
   * {@code index0} doesn't have to be less than or equal to {@code index1}.
   * <p>
   * If either index is {@code -1}, this method does nothing and returns
   * without exception. Otherwise, if either index is less than {@code -1},
   * an {@code IndexOutOfBoundsException} is thrown.
   *
   * @param index0 one end of the interval.
   * @param index1 other end of the interval
   * @throws IndexOutOfBoundsException if either index is less than {@code -1}
   *         (and neither index is {@code -1})
   * @see #addListSelectionListener
   * @see #setSelectionInterval
   */
  addSelectionInterval(index0: number, index1: number): void {
    if (index0 === -1 || index1 === -1) {
      return;
    }
    if (this.getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) {
      this.setSelectionInterval(index0, index1);
      return;
    }
    this.updateLeadAnchorIndices(index0, index1);
    let clearMin = DefaultListSelectionModel.MAX;
    let clearMax = DefaultListSelectionModel.MIN;
    let setMin = Math.min(index0, index1);
    let setMax = Math.max(index0, index1);
    if (this.getSelectionMode() === ListSelectionModel.SINGLE_INTERVAL_SELECTION && (setMax < ((this.minIndex - 1) | 0) || setMin > ((this.maxIndex + 1) | 0))) {
      this.setSelectionInterval(index0, index1);
      return;
    }
    this.changeSelection$int$int$int$int$DefaultListSelectionModel(clearMin, clearMax, setMin, setMax);
  }
  /**
   * Changes the selection to be the set difference of the current selection
   * and the indices between {@code index0} and {@code index1} inclusive.
   * {@code index0} doesn't have to be less than or equal to {@code index1}.
   * <p>
   * In {@code SINGLE_INTERVAL_SELECTION} selection mode, if the removal
   * would produce two disjoint selections, the removal is extended through
   * the greater end of the selection. For example, if the selection is
   * {@code 0-10} and you supply indices {@code 5,6} (in any order) the
   * resulting selection is {@code 0-4}.
   * <p>
   * If this represents a change to the current selection, then each
   * {@code ListSelectionListener} is notified of the change.
   * <p>
   * If either index is {@code -1}, this method does nothing and returns
   * without exception. Otherwise, if either index is less than {@code -1},
   * an {@code IndexOutOfBoundsException} is thrown.
   *
   * @param index0 one end of the interval
   * @param index1 other end of the interval
   * @throws IndexOutOfBoundsException if either index is less than {@code -1}
   *         (and neither index is {@code -1})
   * @see #addListSelectionListener
   */
  removeSelectionInterval(index0: number, index1: number): void {
    this.removeSelectionIntervalImpl(index0, index1, true);
  }
  removeSelectionIntervalImpl(index0: number, index1: number, changeLeadAnchor: boolean): void {
    if (index0 === -1 || index1 === -1) {
      return;
    }
    if (changeLeadAnchor) {
      this.updateLeadAnchorIndices(index0, index1);
    }
    let clearMin = Math.min(index0, index1);
    let clearMax = Math.max(index0, index1);
    let setMin = DefaultListSelectionModel.MAX;
    let setMax = DefaultListSelectionModel.MIN;
    if (this.getSelectionMode() !== ListSelectionModel.MULTIPLE_INTERVAL_SELECTION && clearMin > this.minIndex && clearMax < this.maxIndex) {
      clearMax = this.maxIndex;
    }
    this.changeSelection$int$int$int$int$DefaultListSelectionModel(clearMin, clearMax, setMin, setMax);
  }
  setState(index: number, state: boolean): void {
    if (state) {
      this.set(index);
    } else {
      this.clear(index);
    }
  }
  /**
   * Insert length indices beginning before/after index. If the value
   * at index is itself selected and the selection mode is not
   * SINGLE_SELECTION, set all of the newly inserted items as selected.
   * Otherwise leave them unselected. This method is typically
   * called to sync the selection model with a corresponding change
   * in the data model.
   *
   * @throws IndexOutOfBoundsException if either {@code index}
   *          or {@code length} is negative
   */
  insertIndexInterval(index: number, length: number, before: boolean): void {
    if (length < 0 || index < 0) {
      throw new IndexOutOfBoundsException('index or length is negative');
    }
    if (index === 2147483647 || length === 0) {
      return;
    }
    let insMinIndex = (before) ? index : (index + 1) | 0;
    let insMaxIndex = (((insMinIndex + length) | 0) >= 0) ? (insMinIndex + length - 1) | 0 : 2147483647;
    for (let i = Math.min(this.maxIndex, (2147483647 - length) | 0); i >= insMinIndex; i--) {
      this.setState((i + length) | 0, this.value_.get(i));
    }
    let setInsertedValues = ((this.getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) ? false : this.value_.get(index));
    for (let i = insMaxIndex; i >= insMinIndex; i--) {
      this.setState(i, setInsertedValues);
    }
    let leadIndex = this.leadIndex;
    if (leadIndex > index || (before && leadIndex === index)) {
      leadIndex = (this.leadIndex + length) | 0;
    }
    let anchorIndex = this.anchorIndex;
    if (anchorIndex > index || (before && anchorIndex === index)) {
      anchorIndex = (this.anchorIndex + length) | 0;
    }
    if (leadIndex !== this.leadIndex || anchorIndex !== this.anchorIndex) {
      this.updateLeadAnchorIndices(anchorIndex, leadIndex);
    }
    this.fireValueChanged$$DefaultListSelectionModel();
  }
  /**
   * Remove the indices in the interval index0,index1 (inclusive) from
   * the selection model.  This is typically called to sync the selection
   * model width a corresponding change in the data model.  Note
   * that (as always) index0 need not be &lt;= index1.
   *
   * @throws IndexOutOfBoundsException if either index is negative
   */
  removeIndexInterval(index0: number, index1: number): void {
    if (index0 < 0 || index1 < 0) {
      throw new IndexOutOfBoundsException('index is negative');
    }
    let rmMinIndex = Math.min(index0, index1);
    let rmMaxIndex = Math.max(index0, index1);
    if (rmMinIndex === 0 && rmMaxIndex === 2147483647) {
      for (let i = 2147483647; i >= 0; i--) {
        this.setState(i, false);
      }
      if (this.anchorIndex !== -1 || this.leadIndex !== -1) {
        this.updateLeadAnchorIndices(-1, -1);
      }
      return;
    }
    let gapLength = (rmMaxIndex - rmMinIndex + 1) | 0;
    for (let i = rmMinIndex; i >= 0 && i <= this.maxIndex; i++) {
      this.setState(i, (i <= ((2147483647 - gapLength) | 0)) && (((i + gapLength) | 0) >= this.minIndex) && this.value_.get((i + gapLength) | 0));
    }
    let leadIndex = this.leadIndex;
    if (leadIndex === 0 && rmMinIndex === 0) {
    } else if (leadIndex > rmMaxIndex) {
      leadIndex = (this.leadIndex - gapLength) | 0;
    } else if (leadIndex >= rmMinIndex) {
      leadIndex = (rmMinIndex - 1) | 0;
    }
    let anchorIndex = this.anchorIndex;
    if (anchorIndex === 0 && rmMinIndex === 0) {
    } else if (anchorIndex > rmMaxIndex) {
      anchorIndex = (this.anchorIndex - gapLength) | 0;
    } else if (anchorIndex >= rmMinIndex) {
      anchorIndex = (rmMinIndex - 1) | 0;
    }
    if (leadIndex !== this.leadIndex || anchorIndex !== this.anchorIndex) {
      this.updateLeadAnchorIndices(anchorIndex, leadIndex);
    }
    this.fireValueChanged$$DefaultListSelectionModel();
  }
  /**
   * {@inheritDoc}
   */
  setValueIsAdjusting(isAdjusting: boolean): void {
    if (isAdjusting !== this.isAdjusting) {
      this.isAdjusting = isAdjusting;
      this.fireValueChanged$boolean(isAdjusting);
    }
  }
  /**
   * Returns a string that displays and identifies this
   * object's properties.
   *
   * @return a <code>String</code> representation of this object
   */
  toString(): string {
    let s = ((this.getValueIsAdjusting()) ? '~' : '=') + this.value_.toString();
    return $J.getClass(this).getName() + ' ' + $J.hashCode(this) + ' ' + s;
  }
  /**
   * Returns a clone of this selection model with the same selection.
   * <code>listenerLists</code> are not duplicated.
   *
   * @throws CloneNotSupportedException if the selection model does not
   *    both (a) implement the Cloneable interface and (b) define a
   *    <code>clone</code> method.
   */
  clone(): any {
    let clone = super.clone();
    clone.value_ = this.value_.clone();
    clone.listenerList = new EventListenerList()._EventListenerList();
    return clone;
  }
  /**
   * {@inheritDoc}
   */
  getAnchorSelectionIndex(): number {
    return this.anchorIndex;
  }
  /**
   * {@inheritDoc}
   */
  getLeadSelectionIndex(): number {
    return this.leadIndex;
  }
  /**
   * Set the anchor selection index, leaving all selection values unchanged.
   * If leadAnchorNotificationEnabled is true, send a notification covering
   * the old and new anchor cells.
   *
   * @see #getAnchorSelectionIndex
   * @see #setLeadSelectionIndex
   */
  setAnchorSelectionIndex(anchorIndex: number): void {
    this.updateLeadAnchorIndices(anchorIndex, this.leadIndex);
    this.fireValueChanged$$DefaultListSelectionModel();
  }
  /**
   * Set the lead selection index, leaving all selection values unchanged.
   * If leadAnchorNotificationEnabled is true, send a notification covering
   * the old and new lead cells.
   *
   * @param leadIndex the new lead selection index
   *
   * @see #setAnchorSelectionIndex
   * @see #setLeadSelectionIndex
   * @see #getLeadSelectionIndex
   *
   * @since 1.5
   */
  moveLeadSelectionIndex(leadIndex: number): void {
    if (leadIndex === -1) {
      if (this.anchorIndex !== -1) {
        return;
      }
    }
    this.updateLeadAnchorIndices(this.anchorIndex, leadIndex);
    this.fireValueChanged$$DefaultListSelectionModel();
  }
  /**
   * Sets the lead selection index, ensuring that values between the
   * anchor and the new lead are either all selected or all deselected.
   * If the value at the anchor index is selected, first clear all the
   * values in the range [anchor, oldLeadIndex], then select all the values
   * in the range [anchor, newLeadIndex], where oldLeadIndex is the old
   * leadIndex and newLeadIndex is the new one.
   * <p>
   * If the value at the anchor index is not selected, do the same thing in
   * reverse selecting values in the old range and deselecting values in the
   * new one.
   * <p>
   * Generate a single event for this change and notify all listeners.
   * For the purposes of generating minimal bounds in this event, do the
   * operation in a single pass; that way the first and last index inside the
   * ListSelectionEvent that is broadcast will refer to cells that actually
   * changed value because of this method. If, instead, this operation were
   * done in two steps the effect on the selection state would be the same
   * but two events would be generated and the bounds around the changed
   * values would be wider, including cells that had been first cleared only
   * to later be set.
   * <p>
   * This method can be used in the <code>mouseDragged</code> method
   * of a UI class to extend a selection.
   *
   * @see #getLeadSelectionIndex
   * @see #setAnchorSelectionIndex
   */
  setLeadSelectionIndex(leadIndex: number): void {
    let anchorIndex = this.anchorIndex;
    if (leadIndex === -1) {
      if (anchorIndex === -1) {
        this.updateLeadAnchorIndices(anchorIndex, leadIndex);
        this.fireValueChanged$$DefaultListSelectionModel();
      }
      return;
    } else if (anchorIndex === -1) {
      return;
    }
    if (this.leadIndex === -1) {
      this.leadIndex = leadIndex;
    }
    let shouldSelect = this.value_.get(this.anchorIndex);
    if (this.getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) {
      anchorIndex = leadIndex;
      shouldSelect = true;
    }
    let oldMin = Math.min(this.anchorIndex, this.leadIndex);
    let oldMax = Math.max(this.anchorIndex, this.leadIndex);
    let newMin = Math.min(anchorIndex, leadIndex);
    let newMax = Math.max(anchorIndex, leadIndex);
    this.updateLeadAnchorIndices(anchorIndex, leadIndex);
    if (shouldSelect) {
      this.changeSelection$int$int$int$int$DefaultListSelectionModel(oldMin, oldMax, newMin, newMax);
    } else {
      this.changeSelection$int$int$int$int$boolean$DefaultListSelectionModel(newMin, newMax, oldMin, oldMax, false);
    }
  }
}

$J.define(DefaultListSelectionModel, 'javax.swing.DefaultListSelectionModel', { kind: 'class', ifaces: ['javax.swing.ListSelectionModel', 'java.lang.Cloneable', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultListSelectionModel' }, meths: { 'changeSelection(int,int,int,int)': 'changeSelection$int$int$int$int$DefaultListSelectionModel', 'changeSelection(int,int,int,int,boolean)': 'changeSelection$int$int$int$int$boolean$DefaultListSelectionModel', 'fireValueChanged()': 'fireValueChanged$$DefaultListSelectionModel', 'fireValueChanged(int,int,boolean)': 'fireValueChanged$int$int$boolean', 'fireValueChanged(int,int)': 'fireValueChanged$int$int', 'fireValueChanged(boolean)': 'fireValueChanged$boolean' } });
$J.module(() => {
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  ListSelectionEvent = $J.load('javax.swing.event.ListSelectionEvent');
  ListSelectionListener = $J.load('javax.swing.event.ListSelectionListener');
});
