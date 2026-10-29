// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/event/TableModelEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, EventObject } from '../../../../jre/index.ts';

/**
 * TableModelEvent is used to notify listeners that a table model
 * has changed. The model event describes changes to a TableModel
 * and all references to rows and columns are in the coordinate
 * system of the model.
 * Depending on the parameters used in the constructors, the TableModelevent
 * can be used to specify the following types of changes:
 *
 * <pre>
 * TableModelEvent(source);              //  The data, ie. all rows changed
 * TableModelEvent(source, HEADER_ROW);  //  Structure change, reallocate TableColumns
 * TableModelEvent(source, 1);           //  Row 1 changed
 * TableModelEvent(source, 3, 6);        //  Rows 3 to 6 inclusive changed
 * TableModelEvent(source, 2, 2, 6);     //  Cell at (2, 6) changed
 * TableModelEvent(source, 3, 6, ALL_COLUMNS, INSERT); // Rows (3, 6) were inserted
 * TableModelEvent(source, 3, 6, ALL_COLUMNS, DELETE); // Rows (3, 6) were deleted
 * </pre>
 *
 * It is possible to use other combinations of the parameters, not all of them
 * are meaningful. By subclassing, you can add other information, for example:
 * whether the event WILL happen or DID happen. This makes the specification
 * of rows in DELETE events more useful but has not been included in
 * the swing package as the JTable only needs post-event notification.
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
 * @see TableModel
 */
export class TableModelEvent extends EventObject {
  /**
   * Identifies the addition of new rows or columns.
   */
  static readonly INSERT: number = 1;
  /**
   * Identifies a change to existing data.
   */
  static readonly UPDATE: number = 0;
  /**
   * Identifies the removal of rows or columns.
   */
  static readonly DELETE: number = -1;
  /**
   * Identifies the header row.
   */
  static readonly HEADER_ROW: number = -1;
  /**
   * Specifies all columns in a row or rows.
   */
  static readonly ALL_COLUMNS: number = -1;
  /**
   * The type of the event.
   */
  type: number = 0;
  /**
   * The first row that has changed.
   */
  firstRow: number = 0;
  /**
   * The last row that has changed.
   */
  lastRow: number = 0;
  /**
   * The column for the event.
   */
  column: number = 0;
  /**
   * All row data in the table has changed, listeners should discard any state
   * that was based on the rows and requery the <code>TableModel</code>
   * to get the new row count and all the appropriate values.
   * The <code>JTable</code> will repaint the entire visible region on
   * receiving this event, querying the model for the cell values that are visible.
   * The structure of the table ie, the column names, types and order
   * have not changed.
   *
   * @param source the {@code TableModel} affected by this event
   */
  _TableModelEvent$TableModel(source: TableModel): this {
    this._TableModelEvent$TableModel$int$int$int$int(source, 0, 2147483647, TableModelEvent.ALL_COLUMNS, TableModelEvent.UPDATE);
    return this;
  }
  /**
   * This row of data has been updated.
   * To denote the arrival of a completely new table with a different structure
   * use <code>HEADER_ROW</code> as the value for the <code>row</code>.
   * When the <code>JTable</code> receives this event and its
   * <code>autoCreateColumnsFromModel</code>
   * flag is set it discards any TableColumns that it had and reallocates
   * default ones in the order they appear in the model. This is the
   * same as calling <code>setModel(TableModel)</code> on the <code>JTable</code>.
   *
   * @param source the {@code TableModel} affected by this event
   * @param row the row which has been updated
   */
  _TableModelEvent$TableModel$int(source: TableModel, row: number): this {
    this._TableModelEvent$TableModel$int$int$int$int(source, row, row, TableModelEvent.ALL_COLUMNS, TableModelEvent.UPDATE);
    return this;
  }
  /**
   * The cells in column <I>column</I> in the range
   *  [<I>firstRow</I>, <I>lastRow</I>] have been updated.
   *
   * @param source the {@code TableModel} affected by this event
   * @param firstRow the first row affected by this event
   * @param lastRow  the last row affected by this event
   * @param column the column index of cells changed; {@code ALL_COLUMNS}
   *        signifies all cells in the specified range of rows are changed.
   */
  _TableModelEvent$TableModel$int$int$int(source: TableModel, firstRow: number, lastRow: number, column: number): this {
    this._TableModelEvent$TableModel$int$int$int$int(source, firstRow, lastRow, column, TableModelEvent.UPDATE);
    return this;
  }
  /**
   * The cells from (firstRow, column) to (lastRow, column) have been changed.
   * The <I>column</I> refers to the column index of the cell in the model's
   * coordinate system. When <I>column</I> is ALL_COLUMNS, all cells in the
   * specified range of rows are considered changed.
   * <p>
   * The <I>type</I> should be one of: INSERT, UPDATE and DELETE.
   *
   * @param source the {@code TableModel} affected by this event
   * @param firstRow the first row affected by this event
   * @param lastRow  the last row affected by this event
   * @param column the column index of cells changed; {@code ALL_COLUMNS}
   *        signifies all cells in the specified range of rows are changed.
   * @param type the type of change signified by this even, {@code INSERT},
   *        {@code DELETE } or {@code UPDATE}
   */
  _TableModelEvent$TableModel$int$int$int$int(source: TableModel, firstRow: number, lastRow: number, column: number, type$: number): this {
    this._EventObject(source);
    this.firstRow = firstRow;
    this.lastRow = lastRow;
    this.column = column;
    this.type = type$;
    return this;
  }
  /**
   * Returns the first row that changed.  HEADER_ROW means the meta data,
   * ie. names, types and order of the columns.
   *
   * @return an integer signifying the first row changed
   */
  getFirstRow(): number {
    return this.firstRow;
  }
  /**
   * Returns the last row that changed.
   *
   * @return an integer signifying the last row changed
   */
  getLastRow(): number {
    return this.lastRow;
  }
  /**
   * Returns the column for the event.  If the return
   *  value is ALL_COLUMNS; it means every column in the specified
   *  rows changed.
   *
   * @return an integer signifying which column is affected by this event
   */
  getColumn(): number {
    return this.column;
  }
  /**
   * Returns the type of event - one of: INSERT, UPDATE and DELETE.
   *
   * @return the type of change to a table model, an {@code INSERT} or
   *         {@code DELETE } of row(s) or column(s) or {@code UPDATE}
   *         to data
   */
  getType(): number {
    return this.type;
  }
}

$J.define(TableModelEvent, 'javax.swing.event.TableModelEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'javax.swing.table.TableModel,int,int,int,int': '_TableModelEvent$TableModel$int$int$int$int', 'javax.swing.table.TableModel,int,int,int': '_TableModelEvent$TableModel$int$int$int', 'javax.swing.table.TableModel,int,int': '_TableModelEvent$TableModel$int$int', 'javax.swing.table.TableModel,int': '_TableModelEvent$TableModel$int', 'javax.swing.table.TableModel': '_TableModelEvent$TableModel' } });
