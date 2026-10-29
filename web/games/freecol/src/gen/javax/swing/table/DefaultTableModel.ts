// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/DefaultTableModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Vector } from '../../../../jre/index.ts';
import { AbstractTableModel } from './AbstractTableModel.ts';

/**
 * This is an implementation of <code>TableModel</code> that
 * uses a <code>Vector</code> of <code>Vectors</code> to store the
 * cell value objects.
 * <p>
 * <strong>Warning:</strong> <code>DefaultTableModel</code> returns a
 * column class of <code>Object</code>.  When
 * <code>DefaultTableModel</code> is used with a
 * <code>TableRowSorter</code> this will result in extensive use of
 * <code>toString</code>, which for non-<code>String</code> data types
 * is expensive.  If you use <code>DefaultTableModel</code> with a
 * <code>TableRowSorter</code> you are strongly encouraged to override
 * <code>getColumnClass</code> to return the appropriate type.
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
 *
 * @see TableModel
 * @see #getDataVector
 */
export class DefaultTableModel extends AbstractTableModel {
  /**
   * The <code>Vector</code> of <code>Vectors</code> of
   * <code>Object</code> values.
   */
  dataVector: Vector<Vector> = null;
  /**
   * The <code>Vector</code> of column identifiers.
   */
  columnIdentifiers: Vector = null;
  /**
   * Constructs a default <code>DefaultTableModel</code>
   *  which is a table of zero columns and zero rows.
   */
  _DefaultTableModel$(): this {
    this._DefaultTableModel$int$int(0, 0);
    return this;
  }
  /**
   * Constructs a <code>DefaultTableModel</code> with
   *  <code>rowCount</code> and <code>columnCount</code> of
   *  <code>null</code> object values.
   *
   * @param rowCount           the number of rows the table holds
   * @param columnCount        the number of columns the table holds
   *
   * @see #setValueAt
   */
  _DefaultTableModel$int$int(rowCount: number, columnCount: number): this {
    this._DefaultTableModel$Vector$int(DefaultTableModel.newVector(columnCount), rowCount);
    return this;
  }
  /**
   * Constructs a <code>DefaultTableModel</code> with as many columns
   *  as there are elements in <code>columnNames</code>
   *  and <code>rowCount</code> of <code>null</code>
   *  object values.  Each column's name will be taken from
   *  the <code>columnNames</code> vector.
   *
   * @param columnNames       <code>vector</code> containing the names
   *                          of the new columns; if this is
   *                          <code>null</code> then the model has no columns
   * @param rowCount           the number of rows the table holds
   * @see #setDataVector
   * @see #setValueAt
   */
  _DefaultTableModel$Vector$int(columnNames: Vector<any>, rowCount: number): this {
    this._AbstractTableModel();
    this.setDataVector$Vector$Vector(DefaultTableModel.newVector(rowCount), columnNames);
    return this;
  }
  /**
   * Constructs a <code>DefaultTableModel</code> and initializes the table
   *  by passing <code>data</code> and <code>columnNames</code>
   *  to the <code>setDataVector</code> method.
   *
   * @param data              the data of the table, a <code>Vector</code>
   *                          of <code>Vector</code>s of <code>Object</code>
   *                          values
   * @param columnNames       <code>vector</code> containing the names
   *                          of the new columns
   * @see #getDataVector
   * @see #setDataVector
   */
  _DefaultTableModel$Vector$Vector(data: Vector<Vector>, columnNames: Vector<any>): this {
    this._AbstractTableModel();
    this.setDataVector$Vector$Vector(data, columnNames);
    return this;
  }
  static newVector<E>(size: number): Vector<E> {
    let v = new Vector(size);
    v.setSize(size);
    return v;
  }
  static nonNullVector<E>(v: Vector<E>): Vector<E> {
    return (v != null) ? v : new Vector();
  }
  /**
   * Replaces the current <code>dataVector</code> instance variable
   *  with the new <code>Vector</code> of rows, <code>dataVector</code>.
   *  Each row is represented in <code>dataVector</code> as a
   *  <code>Vector</code> of <code>Object</code> values.
   *  <code>columnIdentifiers</code> are the names of the new
   *  columns.  The first name in <code>columnIdentifiers</code> is
   *  mapped to column 0 in <code>dataVector</code>. Each row in
   *  <code>dataVector</code> is adjusted to match the number of
   *  columns in <code>columnIdentifiers</code>
   *  either by truncating the <code>Vector</code> if it is too long,
   *  or adding <code>null</code> values if it is too short.
   *  <p>Note that passing in a <code>null</code> value for
   *  <code>dataVector</code> results in unspecified behavior,
   *  an possibly an exception.
   *
   * @param   dataVector         the new data vector
   * @param   columnIdentifiers     the names of the columns
   * @see #getDataVector
   */
  setDataVector$Vector$Vector(dataVector: Vector<Vector>, columnIdentifiers: Vector<any>): void {
    this.dataVector = DefaultTableModel.nonNullVector(dataVector);
    this.columnIdentifiers = DefaultTableModel.nonNullVector(columnIdentifiers);
    this.justifyRows(0, this.getRowCount());
    this.fireTableStructureChanged();
  }
  justifyRows(from: number, to: number): void {
    this.dataVector.setSize(this.getRowCount());
    for (let i = from; i < to; i++) {
      if (this.dataVector.elementAt(i) == null) {
        this.dataVector.setElementAt(new Vector(), i);
      }
      this.dataVector.elementAt(i).setSize(this.getColumnCount());
    }
  }
  /**
   * Returns the number of rows in this data table.
   * @return the number of rows in the model
   */
  getRowCount(): number {
    return this.dataVector.size();
  }
  /**
   * Returns the number of columns in this data table.
   * @return the number of columns in the model
   */
  getColumnCount(): number {
    return this.columnIdentifiers.size();
  }
  /**
   * Returns the column name.
   *
   * @return a name for this column using the string value of the
   * appropriate member in <code>columnIdentifiers</code>.
   * If <code>columnIdentifiers</code> does not have an entry
   * for this index, returns the default
   * name provided by the superclass.
   */
  getColumnName(column: number): string {
    let id = null;
    if (column < this.columnIdentifiers.size() && (column >= 0)) {
      id = this.columnIdentifiers.elementAt(column);
    }
    return (id == null) ? super.getColumnName(column) : $J.str(id);
  }
  /**
   * Returns true regardless of parameter values.
   *
   * @param   row             the row whose value is to be queried
   * @param   column          the column whose value is to be queried
   * @return                  true
   * @see #setValueAt
   */
  isCellEditable(row: number, column: number): boolean {
    return true;
  }
  /**
   * Returns an attribute value for the cell at <code>row</code>
   * and <code>column</code>.
   *
   * @param   row             the row whose value is to be queried
   * @param   column          the column whose value is to be queried
   * @return                  the value Object at the specified cell
   * @throws  ArrayIndexOutOfBoundsException  if an invalid row or
   *               column was given
   */
  getValueAt(row: number, column: number): any {
    let rowVector = this.dataVector.elementAt(row);
    return rowVector.elementAt(column);
  }
  /**
   * Sets the object value for the cell at <code>column</code> and
   * <code>row</code>.  <code>aValue</code> is the new value.  This method
   * will generate a <code>tableChanged</code> notification.
   *
   * @param   aValue          the new value; this can be null
   * @param   row             the row whose value is to be changed
   * @param   column          the column whose value is to be changed
   * @throws  ArrayIndexOutOfBoundsException  if an invalid row or
   *               column was given
   */
  setValueAt(aValue: any, row: number, column: number): void {
    let rowVector = this.dataVector.elementAt(row);
    rowVector.setElementAt(aValue, column);
    this.fireTableCellUpdated(row, column);
  }
}

$J.define(DefaultTableModel, 'javax.swing.table.DefaultTableModel', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.table.AbstractTableModel', ctors: { 'java.lang.Object[][],java.lang.Object[]': '_DefaultTableModel$ObjectArrArr$ObjectArr', 'java.util.Vector,java.util.Vector': '_DefaultTableModel$Vector$Vector', 'java.lang.Object[],int': '_DefaultTableModel$ObjectArr$int', 'java.util.Vector,int': '_DefaultTableModel$Vector$int', 'int,int': '_DefaultTableModel$int$int', '': '_DefaultTableModel$' }, meths: { 'convertToVector(java.lang.Object[][])': 'convertToVector$ObjectArrArr', 'convertToVector(java.lang.Object[])': 'convertToVector$ObjectArr', 'addColumn(java.lang.Object,java.lang.Object[])': 'addColumn$Object$ObjectArr', 'addColumn(java.lang.Object,java.util.Vector)': 'addColumn$Object$Vector', 'addColumn(java.lang.Object)': 'addColumn$Object', 'setColumnIdentifiers(java.lang.Object[])': 'setColumnIdentifiers$ObjectArr', 'setColumnIdentifiers(java.util.Vector)': 'setColumnIdentifiers$Vector', 'insertRow(int,java.lang.Object[])': 'insertRow$int$ObjectArr', 'insertRow(int,java.util.Vector)': 'insertRow$int$Vector', 'addRow(java.lang.Object[])': 'addRow$ObjectArr', 'addRow(java.util.Vector)': 'addRow$Vector', 'setDataVector(java.lang.Object[][],java.lang.Object[])': 'setDataVector$ObjectArrArr$ObjectArr', 'setDataVector(java.util.Vector,java.util.Vector)': 'setDataVector$Vector$Vector' } });
