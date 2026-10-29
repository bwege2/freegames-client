// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/AbstractTableModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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

let EventListenerList, TableModelEvent, TableModelListener;

/**
 * This abstract class provides default implementations for most of
 *  the methods in the <code>TableModel</code> interface. It takes care of
 *  the management of listeners and provides some conveniences for generating
 *  <code>TableModelEvents</code> and dispatching them to the listeners.
 *  To create a concrete <code>TableModel</code> as a subclass of
 *  <code>AbstractTableModel</code> you need only provide implementations
 *  for the following three methods:
 *
 *  <pre>
 *  public int getRowCount();
 *  public int getColumnCount();
 *  public Object getValueAt(int row, int column);
 *  </pre>
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
 * @author Alan Chung
 * @author Philip Milne
 */
export class AbstractTableModel extends JObject {
  /**
   * List of listeners
   */
  listenerList: EventListenerList = null;
  /**
   * Constructor for subclasses to call.
   */
  _AbstractTableModel(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    return this;
  }
  /**
   * Returns a default name for the column using spreadsheet conventions:
   *  A, B, C, ... Z, AA, AB, etc.  If <code>column</code> cannot be found,
   *  returns an empty string.
   *
   * @param column  the column being queried
   * @return a string containing the default name of <code>column</code>
   */
  getColumnName(column: number): string {
    let result = '';
    for (; column >= 0; column = ($J.idiv(column, 26) - 1) | 0) {
      result = String.fromCharCode(((((((column % 26)) & 0xffff) + 65 /* 'A' */) | 0)) & 0xffff) + result;
    }
    return result;
  }
  /**
   * Returns <code>Object.class</code> regardless of <code>columnIndex</code>.
   *
   *  @param columnIndex  the column being queried
   *  @return the Object.class
   */
  getColumnClass(columnIndex: number): JClass<any> {
    return $J.cls(JObject);
  }
  /**
   * Returns false.  This is the default implementation for all cells.
   *
   *  @param  rowIndex  the row being queried
   *  @param  columnIndex the column being queried
   *  @return false
   */
  isCellEditable(rowIndex: number, columnIndex: number): boolean {
    return false;
  }
  /**
   * This empty implementation is provided so users don't have to implement
   *  this method if their data model is not editable.
   *
   *  @param  aValue   value to assign to cell
   *  @param  rowIndex   row of cell
   *  @param  columnIndex  column of cell
   */
  setValueAt(aValue: any, rowIndex: number, columnIndex: number): void {
  }
  /**
   * Adds a listener to the list that's notified each time a change
   * to the data model occurs.
   *
   * @param   l               the TableModelListener
   */
  addTableModelListener(l: TableModelListener): void {
    this.listenerList.add($J.cls(TableModelListener), l);
  }
  /**
   * Removes a listener from the list that's notified each time a
   * change to the data model occurs.
   *
   * @param   l               the TableModelListener
   */
  removeTableModelListener(l: TableModelListener): void {
    this.listenerList.remove($J.cls(TableModelListener), l);
  }
  /**
   * Notifies all listeners that all cell values in the table's
   * rows may have changed. The number of rows may also have changed
   * and the <code>JTable</code> should redraw the
   * table from scratch. The structure of the table (as in the order of the
   * columns) is assumed to be the same.
   *
   * @see TableModelEvent
   * @see EventListenerList
   * @see javax.swing.JTable#tableChanged(TableModelEvent)
   */
  fireTableDataChanged(): void {
    this.fireTableChanged(new TableModelEvent()._TableModelEvent$TableModel(this));
  }
  /**
   * Notifies all listeners that the table's structure has changed.
   * The number of columns in the table, and the names and types of
   * the new columns may be different from the previous state.
   * If the <code>JTable</code> receives this event and its
   * <code>autoCreateColumnsFromModel</code>
   * flag is set it discards any table columns that it had and reallocates
   * default columns in the order they appear in the model. This is the
   * same as calling <code>setModel(TableModel)</code> on the
   * <code>JTable</code>.
   *
   * @see TableModelEvent
   * @see EventListenerList
   */
  fireTableStructureChanged(): void {
    this.fireTableChanged(new TableModelEvent()._TableModelEvent$TableModel$int(this, TableModelEvent.HEADER_ROW));
  }
  /**
   * Notifies all listeners that rows in the range
   * <code>[firstRow, lastRow]</code>, inclusive, have been inserted.
   *
   * @param  firstRow  the first row
   * @param  lastRow   the last row
   *
   * @see TableModelEvent
   * @see EventListenerList
   */
  fireTableRowsInserted(firstRow: number, lastRow: number): void {
    this.fireTableChanged(new TableModelEvent()._TableModelEvent$TableModel$int$int$int$int(this, firstRow, lastRow, TableModelEvent.ALL_COLUMNS, TableModelEvent.INSERT));
  }
  /**
   * Notifies all listeners that rows in the range
   * <code>[firstRow, lastRow]</code>, inclusive, have been deleted.
   *
   * @param firstRow  the first row
   * @param lastRow   the last row
   *
   * @see TableModelEvent
   * @see EventListenerList
   */
  fireTableRowsDeleted(firstRow: number, lastRow: number): void {
    this.fireTableChanged(new TableModelEvent()._TableModelEvent$TableModel$int$int$int$int(this, firstRow, lastRow, TableModelEvent.ALL_COLUMNS, TableModelEvent.DELETE));
  }
  /**
   * Notifies all listeners that the value of the cell at
   * <code>[row, column]</code> has been updated.
   *
   * @param row  row of cell which has been updated
   * @param column  column of cell which has been updated
   * @see TableModelEvent
   * @see EventListenerList
   */
  fireTableCellUpdated(row: number, column: number): void {
    this.fireTableChanged(new TableModelEvent()._TableModelEvent$TableModel$int$int$int(this, row, row, column));
  }
  /**
   * Forwards the given notification event to all
   * <code>TableModelListeners</code> that registered
   * themselves as listeners for this table model.
   *
   * @param e  the event to be forwarded
   *
   * @see #addTableModelListener
   * @see TableModelEvent
   * @see EventListenerList
   */
  fireTableChanged(e: TableModelEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TableModelListener)) {
        (listeners[(i + 1) | 0]).tableChanged(e);
      }
    }
  }
}

$J.define(AbstractTableModel, 'javax.swing.table.AbstractTableModel', { kind: 'class', ifaces: ['javax.swing.table.TableModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_AbstractTableModel' } });
$J.module(() => {
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  TableModelEvent = $J.load('javax.swing.event.TableModelEvent');
  TableModelListener = $J.load('javax.swing.event.TableModelListener');
});
