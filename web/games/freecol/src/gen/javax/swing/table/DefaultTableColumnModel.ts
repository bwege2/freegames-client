// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/DefaultTableColumnModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, Vector } from '../../../../jre/index.ts';

let DefaultListSelectionModel, ChangeEvent, EventListenerList, TableColumnModelEvent, TableColumnModelListener;

/**
 * The standard column-handler for a <code>JTable</code>.
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
 * @see JTable
 */
export class DefaultTableColumnModel extends JObject {
  /**
   * Array of TableColumn objects in this model
   */
  tableColumns: Vector<TableColumn> = null;
  /**
   * Model for keeping track of column selections
   */
  selectionModel: ListSelectionModel = null;
  /**
   * Width margin between each column
   */
  columnMargin: number = 0;
  /**
   * List of TableColumnModelListener
   */
  listenerList: EventListenerList = null;
  /**
   * Change event (only one needed)
   */
  changeEvent: ChangeEvent = null;
  /**
   * Column selection allowed in this column model
   */
  columnSelectionAllowed: boolean = false;
  /**
   * A local cache of the combined width of all columns
   */
  totalColumnWidth: number = 0;
  /**
   * Creates a default table column model.
   */
  _DefaultTableColumnModel(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.changeEvent = null;
    this.tableColumns = new Vector();
    this.setSelectionModel(this.createSelectionModel());
    this.setColumnMargin(1);
    this.invalidateWidthCache();
    this.setColumnSelectionAllowed(false);
    return this;
  }
  /**
   * Appends <code>aColumn</code> to the end of the
   *  <code>tableColumns</code> array.
   *  This method also posts the <code>columnAdded</code>
   *  event to its listeners.
   *
   * @param   aColumn         the <code>TableColumn</code> to be added
   * @throws IllegalArgumentException      if <code>aColumn</code> is
   *                          <code>null</code>
   * @see     #removeColumn
   */
  addColumn(aColumn: TableColumn): void {
    if (aColumn == null) {
      throw new IllegalArgumentException('Object is null');
    }
    this.tableColumns.addElement(aColumn);
    aColumn.addPropertyChangeListener($J.fn(this, 'propertyChange'));
    this.invalidateWidthCache();
    this.fireColumnAdded(new TableColumnModelEvent()._TableColumnModelEvent(this, 0, (this.getColumnCount() - 1) | 0));
  }
  /**
   * Deletes the <code>column</code> from the
   *  <code>tableColumns</code> array.  This method will do nothing if
   *  <code>column</code> is not in the table's columns list.
   *  <code>tile</code> is called
   *  to resize both the header and table views.
   *  This method also posts a <code>columnRemoved</code>
   *  event to its listeners.
   *
   * @param   column          the <code>TableColumn</code> to be removed
   * @see     #addColumn
   */
  removeColumn(column: TableColumn): void {
    let columnIndex = this.tableColumns.indexOf(column);
    if (columnIndex !== -1) {
      if (this.selectionModel != null) {
        this.selectionModel.removeIndexInterval(columnIndex, columnIndex);
      }
      column.removePropertyChangeListener($J.fn(this, 'propertyChange'));
      this.tableColumns.removeElementAt(columnIndex);
      this.invalidateWidthCache();
      this.fireColumnRemoved(new TableColumnModelEvent()._TableColumnModelEvent(this, columnIndex, 0));
    }
  }
  /**
   * Moves the column and heading at <code>columnIndex</code> to
   * <code>newIndex</code>.  The old column at <code>columnIndex</code>
   * will now be found at <code>newIndex</code>.  The column
   * that used to be at <code>newIndex</code> is shifted
   * left or right to make room.  This will not move any columns if
   * <code>columnIndex</code> equals <code>newIndex</code>.  This method
   * also posts a <code>columnMoved</code> event to its listeners.
   *
   * @param   columnIndex                     the index of column to be moved
   * @param   newIndex                        new index to move the column
   * @throws IllegalArgumentException      if <code>column</code> or
   *                                          <code>newIndex</code>
   *                                          are not in the valid range
   */
  moveColumn(columnIndex: number, newIndex: number): void {
    if ((columnIndex < 0) || (columnIndex >= this.getColumnCount()) || (newIndex < 0) || (newIndex >= this.getColumnCount())) {
      throw new IllegalArgumentException('moveColumn() - Index out of range');
    }
    let aColumn: TableColumn;
    if (columnIndex === newIndex) {
      this.fireColumnMoved(new TableColumnModelEvent()._TableColumnModelEvent(this, columnIndex, newIndex));
      return;
    }
    aColumn = this.tableColumns.elementAt(columnIndex);
    this.tableColumns.removeElementAt(columnIndex);
    let selected = this.selectionModel.isSelectedIndex(columnIndex);
    this.selectionModel.removeIndexInterval(columnIndex, columnIndex);
    this.tableColumns.insertElementAt(aColumn, newIndex);
    this.selectionModel.insertIndexInterval(newIndex, 1, true);
    if (selected) {
      this.selectionModel.addSelectionInterval(newIndex, newIndex);
    } else {
      this.selectionModel.removeSelectionInterval(newIndex, newIndex);
    }
    this.fireColumnMoved(new TableColumnModelEvent()._TableColumnModelEvent(this, columnIndex, newIndex));
  }
  /**
   * Sets the column margin to <code>newMargin</code>.  This method
   * also posts a <code>columnMarginChanged</code> event to its
   * listeners.
   *
   * @param   newMargin               the new margin width, in pixels
   * @see     #getColumnMargin
   * @see     #getTotalColumnWidth
   */
  setColumnMargin(newMargin: number): void {
    if (newMargin !== this.columnMargin) {
      this.columnMargin = newMargin;
      this.fireColumnMarginChanged();
    }
  }
  /**
   * Returns the number of columns in the <code>tableColumns</code> array.
   *
   * @return  the number of columns in the <code>tableColumns</code> array
   * @see     #getColumns
   */
  getColumnCount(): number {
    return this.tableColumns.size();
  }
  /**
   * Returns an <code>Enumeration</code> of all the columns in the model.
   * @return an <code>Enumeration</code> of the columns in the model
   */
  getColumns(): Enumeration<TableColumn> {
    return this.tableColumns.elements();
  }
  /**
   * Returns the <code>TableColumn</code> object for the column
   * at <code>columnIndex</code>.
   *
   * @param   columnIndex     the index of the column desired
   * @return  the <code>TableColumn</code> object for the column
   *                          at <code>columnIndex</code>
   * @throws  ArrayIndexOutOfBoundsException if <code>columnIndex</code>
   *             is out of range:
   *             (<code>columnIndex &lt; 0 || columnIndex &gt;= getColumnCount()</code>)
   */
  getColumn(columnIndex: number): TableColumn {
    return this.tableColumns.elementAt(columnIndex);
  }
  /**
   * Returns the width margin for <code>TableColumn</code>.
   * The default <code>columnMargin</code> is 1.
   *
   * @return  the maximum width for the <code>TableColumn</code>
   * @see     #setColumnMargin
   */
  getColumnMargin(): number {
    return this.columnMargin;
  }
  /**
   * Returns the index of the column that lies at position <code>x</code>,
   * or -1 if no column covers this point.
   *
   * In keeping with Swing's separable model architecture, a
   * TableColumnModel does not know how the table columns actually appear on
   * screen.  The visual presentation of the columns is the responsibility
   * of the view/controller object using this model (typically JTable).  The
   * view/controller need not display the columns sequentially from left to
   * right.  For example, columns could be displayed from right to left to
   * accommodate a locale preference or some columns might be hidden at the
   * request of the user.  Because the model does not know how the columns
   * are laid out on screen, the given <code>xPosition</code> should not be
   * considered to be a coordinate in 2D graphics space.  Instead, it should
   * be considered to be a width from the start of the first column in the
   * model.  If the column index for a given X coordinate in 2D space is
   * required, <code>JTable.columnAtPoint</code> can be used instead.
   *
   * @param  x  the horizontal location of interest
   * @return  the index of the column or -1 if no column is found
   * @see javax.swing.JTable#columnAtPoint
   */
  getColumnIndexAtX(x: number): number {
    if (x < 0) {
      return -1;
    }
    let cc = this.getColumnCount();
    for (let column = 0; column < cc; column++) {
      x = (x - this.getColumn(column).getWidth()) | 0;
      if (x < 0) {
        return column;
      }
    }
    return -1;
  }
  /**
   * Returns the total combined width of all columns.
   * @return the <code>totalColumnWidth</code> property
   */
  getTotalColumnWidth(): number {
    if (this.totalColumnWidth === -1) {
      this.recalcWidthCache();
    }
    return this.totalColumnWidth;
  }
  /**
   * Sets the selection model for this <code>TableColumnModel</code>
   *  to <code>newModel</code>
   *  and registers for listener notifications from the new selection
   *  model.  If <code>newModel</code> is <code>null</code>,
   *  an exception is thrown.
   *
   * @param   newModel        the new selection model
   * @throws IllegalArgumentException      if <code>newModel</code>
   *                                          is <code>null</code>
   * @see     #getSelectionModel
   */
  setSelectionModel(newModel: ListSelectionModel): void {
    if (newModel == null) {
      throw new IllegalArgumentException('Cannot set a null SelectionModel');
    }
    let oldModel = this.selectionModel;
    if (newModel !== oldModel) {
      if (oldModel != null) {
        oldModel.removeListSelectionListener($J.fn(this, 'valueChanged'));
      }
      this.selectionModel = newModel;
      newModel.addListSelectionListener($J.fn(this, 'valueChanged'));
    }
  }
  /**
   * Returns the <code>ListSelectionModel</code> that is used to
   * maintain column selection state.
   *
   * @return  the object that provides column selection state.  Or
   *          <code>null</code> if row selection is not allowed.
   * @see     #setSelectionModel
   */
  getSelectionModel(): ListSelectionModel {
    return this.selectionModel;
  }
  /**
   * Sets whether column selection is allowed.  The default is false.
   * @param  flag true if column selection will be allowed, false otherwise
   */
  setColumnSelectionAllowed(flag: boolean): void {
    this.columnSelectionAllowed = flag;
  }
  /**
   * Returns true if column selection is allowed, otherwise false.
   * The default is false.
   * @return the <code>columnSelectionAllowed</code> property
   */
  getColumnSelectionAllowed(): boolean {
    return this.columnSelectionAllowed;
  }
  /**
   * Returns an array of selected columns.  If <code>selectionModel</code>
   * is <code>null</code>, returns an empty array.
   * @return an array of selected columns or an empty array if nothing
   *                  is selected or the <code>selectionModel</code> is
   *                  <code>null</code>
   */
  getSelectedColumns(): number[] {
    if (this.selectionModel != null) {
      return this.selectionModel.getSelectedIndices();
    }
    return $J.newArray(0, 0);
  }
  /**
   * Returns the number of columns selected.
   * @return the number of columns selected
   */
  getSelectedColumnCount(): number {
    if (this.selectionModel != null) {
      return this.selectionModel.getSelectedItemsCount();
    }
    return 0;
  }
  /**
   * Adds a listener for table column model events.
   * @param x  a <code>TableColumnModelListener</code> object
   */
  addColumnModelListener(x: TableColumnModelListener): void {
    this.listenerList.add($J.cls(TableColumnModelListener), x);
  }
  /**
   * Removes a listener for table column model events.
   * @param x  a <code>TableColumnModelListener</code> object
   */
  removeColumnModelListener(x: TableColumnModelListener): void {
    this.listenerList.remove($J.cls(TableColumnModelListener), x);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @param e  the event received
   * @see EventListenerList
   */
  fireColumnAdded(e: TableColumnModelEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TableColumnModelListener)) {
        (listeners[(i + 1) | 0]).columnAdded(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @param  e  the event received
   * @see EventListenerList
   */
  fireColumnRemoved(e: TableColumnModelEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TableColumnModelListener)) {
        (listeners[(i + 1) | 0]).columnRemoved(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @param  e the event received
   * @see EventListenerList
   */
  fireColumnMoved(e: TableColumnModelEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TableColumnModelListener)) {
        (listeners[(i + 1) | 0]).columnMoved(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @param e the event received
   * @see EventListenerList
   */
  fireColumnSelectionChanged(e: ListSelectionEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TableColumnModelListener)) {
        (listeners[(i + 1) | 0]).columnSelectionChanged(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the parameters passed into
   * the fire method.
   * @see EventListenerList
   */
  fireColumnMarginChanged(): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TableColumnModelListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        (listeners[(i + 1) | 0]).columnMarginChanged(this.changeEvent);
      }
    }
  }
  /**
   * Property Change Listener change method.  Used to track changes
   * to the column width or preferred column width.
   *
   * @param  evt  <code>PropertyChangeEvent</code>
   */
  propertyChange(evt: PropertyChangeEvent): void {
    let name = evt.getPropertyName();
    if (name === 'width' || name === 'preferredWidth') {
      this.invalidateWidthCache();
      this.fireColumnMarginChanged();
    }
  }
  /**
   * A <code>ListSelectionListener</code> that forwards
   * <code>ListSelectionEvents</code> when there is a column
   * selection change.
   *
   * @param e  the change event
   */
  valueChanged(e: ListSelectionEvent): void {
    this.fireColumnSelectionChanged(e);
  }
  /**
   * Creates a new default list selection model.
   *
   * @return a newly created default list selection model.
   */
  createSelectionModel(): ListSelectionModel {
    return new DefaultListSelectionModel()._DefaultListSelectionModel();
  }
  /**
   * Recalculates the total combined width of all columns.  Updates the
   * <code>totalColumnWidth</code> property.
   */
  recalcWidthCache(): void {
    let enumeration = this.getColumns();
    this.totalColumnWidth = 0;
    while (enumeration.hasMoreElements()) {
      this.totalColumnWidth = (this.totalColumnWidth + enumeration.nextElement().getWidth()) | 0;
    }
  }
  invalidateWidthCache(): void {
    this.totalColumnWidth = -1;
  }
}

$J.define(DefaultTableColumnModel, 'javax.swing.table.DefaultTableColumnModel', { kind: 'class', ifaces: ['javax.swing.table.TableColumnModel', 'java.beans.PropertyChangeListener', 'javax.swing.event.ListSelectionListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_DefaultTableColumnModel' } });
$J.module(() => {
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  TableColumnModelEvent = $J.load('javax.swing.event.TableColumnModelEvent');
  TableColumnModelListener = $J.load('javax.swing.event.TableColumnModelListener');
});
