// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/RowSorter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2006, Oracle and/or its affiliates. All rights reserved.
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

let EventListenerList, RowSorterEvent, RowSorterEvent$Type, RowSorterListener;

/**
 * <code>RowSorter</code> provides the basis for sorting and filtering.
 * Beyond creating and installing a <code>RowSorter</code>, you very rarely
 * need to interact with one directly.  Refer to
 * {@link javax.swing.table.TableRowSorter TableRowSorter} for a concrete
 * implementation of <code>RowSorter</code> for <code>JTable</code>.
 * <p>
 * <code>RowSorter</code>'s primary role is to provide a mapping between
 * two coordinate systems: that of the view (for example a
 * <code>JTable</code>) and that of the underlying data source, typically a
 * model.
 * <p>
 * The view invokes the following methods on the <code>RowSorter</code>:
 * <ul>
 * <li><code>toggleSortOrder</code> &#8212; The view invokes this when the
 *     appropriate user gesture has occurred to trigger a sort.  For example,
 *     the user clicked a column header in a table.
 * <li>One of the model change methods &#8212; The view invokes a model
 *     change method when the underlying model
 *     has changed.  There may be order dependencies in how the events are
 *     delivered, so a <code>RowSorter</code> should not update its mapping
 *     until one of these methods is invoked.
 * </ul>
 * Because the view makes extensive use of  the
 * <code>convertRowIndexToModel</code>,
 * <code>convertRowIndexToView</code> and <code>getViewRowCount</code> methods,
 * these methods need to be fast.
 * <p>
 * <code>RowSorter</code> provides notification of changes by way of
 * <code>RowSorterListener</code>.  Two types of notification are sent:
 * <ul>
 * <li><code>RowSorterEvent.Type.SORT_ORDER_CHANGED</code> &#8212; notifies
 *     listeners that the sort order has changed.  This is typically followed
 *     by a notification that the sort has changed.
 * <li><code>RowSorterEvent.Type.SORTED</code> &#8212; notifies listeners that
 *     the mapping maintained by the <code>RowSorter</code> has changed in
 *     some way.
 * </ul>
 * <code>RowSorter</code> implementations typically don't have a one-to-one
 * mapping with the underlying model, but they can.
 * For example, if a database does the sorting,
 * <code>toggleSortOrder</code> might call through to the database
 * (on a background thread), and override the mapping methods to return the
 * argument that is passed in.
 * <p>
 * Concrete implementations of <code>RowSorter</code>
 * need to reference a model such as <code>TableModel</code> or
 * <code>ListModel</code>.  The view classes, such as
 * <code>JTable</code> and <code>JList</code>, will also have a
 * reference to the model.  To avoid ordering dependencies,
 * <code>RowSorter</code> implementations should not install a
 * listener on the model.  Instead the view class will call into the
 * <code>RowSorter</code> when the model changes.  For
 * example, if a row is updated in a <code>TableModel</code>
 * <code>JTable</code> invokes <code>rowsUpdated</code>.
 * When the model changes, the view may call into any of the following methods:
 * <code>modelStructureChanged</code>, <code>allRowsChanged</code>,
 * <code>rowsInserted</code>, <code>rowsDeleted</code> and
 * <code>rowsUpdated</code>.
 *
 * @param <M> the type of the underlying model
 * @see javax.swing.table.TableRowSorter
 * @since 1.6
 */
export class RowSorter<M> extends JObject {
  listenerList: EventListenerList = null;
  /**
   * Creates a <code>RowSorter</code>.
   */
  _RowSorter(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    return this;
  }
  /**
   * Adds a <code>RowSorterListener</code> to receive notification
   * about this <code>RowSorter</code>.  If the same
   * listener is added more than once it will receive multiple
   * notifications.  If <code>l</code> is <code>null</code> nothing
   * is done.
   *
   * @param l the <code>RowSorterListener</code>
   */
  addRowSorterListener(l: RowSorterListener): void {
    this.listenerList.add($J.cls(RowSorterListener), l);
  }
  /**
   * Removes a <code>RowSorterListener</code>.  If
   * <code>l</code> is <code>null</code> nothing is done.
   *
   * @param l the <code>RowSorterListener</code>
   */
  removeRowSorterListener(l: RowSorterListener): void {
    this.listenerList.remove($J.cls(RowSorterListener), l);
  }
  /**
   * Notifies listener that the sort order has changed.
   */
  fireSortOrderChanged(): void {
    this.fireRowSorterChanged$RowSorterEvent(new RowSorterEvent()._RowSorterEvent$RowSorter(this));
  }
  /**
   * Notifies listener that the mapping has changed.
   *
   * @param lastRowIndexToModel the mapping from model indices to
   *        view indices prior to the sort, may be <code>null</code>
   */
  fireRowSorterChanged$intArr(lastRowIndexToModel: number[]): void {
    this.fireRowSorterChanged$RowSorterEvent(new RowSorterEvent()._RowSorterEvent$RowSorter$Type$intArr(this, RowSorterEvent$Type.SORTED, lastRowIndexToModel));
  }
  fireRowSorterChanged$RowSorterEvent(event: RowSorterEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(RowSorterListener)) {
        (listeners[(i + 1) | 0]).sorterChanged(event);
      }
    }
  }
}

/**
 * SortKey describes the sort order for a particular column.  The
 * column index is in terms of the underlying model, which may differ
 * from that of the view.
 *
 * @since 1.6
 */
export class RowSorter$SortKey extends JObject {
  column: number = 0;
  sortOrder: SortOrder = null;
  /**
   * Creates a <code>SortKey</code> for the specified column with
   * the specified sort order.
   *
   * @param column index of the column, in terms of the model
   * @param sortOrder the sorter order
   * @throws IllegalArgumentException if <code>sortOrder</code> is
   *         <code>null</code>
   */
  _RowSorter$SortKey(column: number, sortOrder: SortOrder): this {
    if (sortOrder == null) {
      throw new IllegalArgumentException('sort order must be non-null');
    }
    this.column = column;
    this.sortOrder = sortOrder;
    return this;
  }
  /**
   * Returns the index of the column.
   *
   * @return index of column
   */
  getColumn(): number {
    return this.column;
  }
  /**
   * Returns the sort order of the column.
   *
   * @return the sort order of the column
   */
  getSortOrder(): SortOrder {
    return this.sortOrder;
  }
  /**
   * Returns the hash code for this <code>SortKey</code>.
   *
   * @return hash code
   */
  hashCode(): number {
    let result = 17;
    result = (Math.imul(37, result) + this.column) | 0;
    result = (Math.imul(37, result) + this.sortOrder.hashCode()) | 0;
    return result;
  }
  /**
   * Returns true if this object equals the specified object.
   * If the specified object is a <code>SortKey</code> and
   * references the same column and sort order, the two objects
   * are equal.
   *
   * @param o the object to compare to
   * @return true if <code>o</code> is equal to this <code>SortKey</code>
   */
  equals(o: any): boolean {
    if (o === this) {
      return true;
    }
    if (o instanceof RowSorter$SortKey) {
      return ((o).column === this.column && (o).sortOrder === this.sortOrder);
    }
    return false;
  }
}

$J.define(RowSorter, 'javax.swing.RowSorter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RowSorter' }, meths: { 'fireRowSorterChanged(javax.swing.event.RowSorterEvent)': 'fireRowSorterChanged$RowSorterEvent', 'fireRowSorterChanged(int[])': 'fireRowSorterChanged$intArr', 'rowsUpdated(int,int,int)': 'rowsUpdated$int$int$int', 'rowsUpdated(int,int)': 'rowsUpdated$int$int' } });
$J.define(RowSorter$SortKey, 'javax.swing.RowSorter$SortKey', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,javax.swing.SortOrder': '_RowSorter$SortKey' } });
$J.module(() => {
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  RowSorterEvent = $J.load('javax.swing.event.RowSorterEvent');
  RowSorterEvent$Type = $J.load('javax.swing.event.RowSorterEvent$Type');
  RowSorterListener = $J.load('javax.swing.event.RowSorterListener');
});
