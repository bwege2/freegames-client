// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/TableColumn.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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

let SwingPropertyChangeSupport;

/**
 * A <code>TableColumn</code> represents all the attributes of a column in a
 *  <code>JTable</code>, such as width, resizability, minimum and maximum width.
 *  In addition, the <code>TableColumn</code> provides slots for a renderer and
 *  an editor that can be used to display and edit the values in this column.
 *  <p>
 *  It is also possible to specify renderers and editors on a per type basis
 *  rather than a per column basis - see the
 *  <code>setDefaultRenderer</code> method in the <code>JTable</code> class.
 *  This default mechanism is only used when the renderer (or
 *  editor) in the <code>TableColumn</code> is <code>null</code>.
 * <p>
 *  The <code>TableColumn</code> stores the link between the columns in the
 *  <code>JTable</code> and the columns in the <code>TableModel</code>.
 *  The <code>modelIndex</code> is the column in the
 *  <code>TableModel</code>, which will be queried for the data values for the
 *  cells in this column. As the column moves around in the view this
 *  <code>modelIndex</code> does not change.
 *  <p>
 * <b>Note:</b> Some implementations may assume that all
 *    <code>TableColumnModel</code>s are unique, therefore we would
 *    recommend that the same <code>TableColumn</code> instance
 *    not be added more than once to a <code>TableColumnModel</code>.
 *    To show <code>TableColumn</code>s with the same column of
 *    data from the model, create a new instance with the same
 *    <code>modelIndex</code>.
 *  <p>
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
 * @see javax.swing.table.TableColumnModel
 *
 * @see javax.swing.table.DefaultTableColumnModel
 * @see javax.swing.table.JTableHeader#getDefaultRenderer()
 * @see JTable#getDefaultRenderer(Class)
 * @see JTable#getDefaultEditor(Class)
 * @see JTable#getCellRenderer(int, int)
 * @see JTable#getCellEditor(int, int)
 */
export class TableColumn extends JObject {
  /**
   * Obsolete as of Java 2 platform v1.3.  Please use string literals to identify
   * properties.
   */
  static readonly COLUMN_WIDTH_PROPERTY: string = 'columWidth';
  /**
   * Obsolete as of Java 2 platform v1.3.  Please use string literals to identify
   * properties.
   */
  static readonly HEADER_VALUE_PROPERTY: string = 'headerValue';
  /**
   * Obsolete as of Java 2 platform v1.3.  Please use string literals to identify
   * properties.
   */
  static readonly HEADER_RENDERER_PROPERTY: string = 'headerRenderer';
  /**
   * Obsolete as of Java 2 platform v1.3.  Please use string literals to identify
   * properties.
   */
  static readonly CELL_RENDERER_PROPERTY: string = 'cellRenderer';
  /**
   * The index of the column in the model which is to be displayed by
   * this <code>TableColumn</code>. As columns are moved around in the
   * view <code>modelIndex</code> remains constant.
   */
  modelIndex: number = 0;
  /**
   * This object is not used internally by the drawing machinery of
   *  the <code>JTable</code>; identifiers may be set in the
   *  <code>TableColumn</code> as an
   *  optional way to tag and locate table columns. The table package does
   *  not modify or invoke any methods in these identifier objects other
   *  than the <code>equals</code> method which is used in the
   *  <code>getColumnIndex()</code> method in the
   *  <code>DefaultTableColumnModel</code>.
   */
  identifier: any = null;
  /**
   * The width of the column.
   */
  width_: number = 0;
  /**
   * The minimum width of the column.
   */
  minWidth_: number = 0;
  /**
   * The preferred width of the column.
   */
  preferredWidth: number = 0;
  /**
   * The maximum width of the column.
   */
  maxWidth_: number = 0;
  /**
   * The renderer used to draw the header of the column.
   */
  headerRenderer: TableCellRenderer = null;
  /**
   * The header value of the column.
   */
  headerValue: any = null;
  /**
   * The renderer used to draw the data cells of the column.
   */
  cellRenderer: TableCellRenderer = null;
  /**
   * The editor used to edit the data cells of the column.
   */
  cellEditor: TableCellEditor = null;
  /**
   * If true, the user is allowed to resize the column; the default is true.
   */
  isResizable_: boolean = false;
  /**
   * This field was not used in previous releases and there are
   * currently no plans to support it in the future.
   *
   * @deprecated as of Java 2 platform v1.3
   */
  resizedPostingDisableCount: number = 0;
  /**
   * If any <code>PropertyChangeListeners</code> have been registered, the
   * <code>changeSupport</code> field describes them.
   */
  changeSupport: SwingPropertyChangeSupport = null;
  /**
   * Cover method, using a default width of 75, a <code>null</code>
   *  renderer and a <code>null</code> editor.
   *  @see #TableColumn(int, int, TableCellRenderer, TableCellEditor)
   *
   *  @param modelIndex  the index of the column in the model
   *  that supplies the data for this column in the table;
   *  the model index remains the same even when columns
   *  are reordered in the view
   */
  _TableColumn$int(modelIndex: number): this {
    this._TableColumn$int$int$TableCellRenderer$TableCellEditor(modelIndex, 75, null, null);
    return this;
  }
  /**
   * Creates and initializes an instance of
   *  <code>TableColumn</code> with the specified model index,
   *  width, cell renderer, and cell editor;
   *  all <code>TableColumn</code> constructors delegate to this one.
   *  The value of <code>width</code> is used
   *  for both the initial and preferred width;
   *  if <code>width</code> is negative,
   *  they're set to 0.
   *  The minimum width is set to 15 unless the initial width is less,
   *  in which case the minimum width is set to
   *  the initial width.
   *
   *  <p>
   *  When the <code>cellRenderer</code>
   *  or <code>cellEditor</code> parameter is <code>null</code>,
   *  a default value provided by the <code>JTable</code>
   *  <code>getDefaultRenderer</code>
   *  or <code>getDefaultEditor</code> method, respectively,
   *  is used to
   *  provide defaults based on the type of the data in this column.
   *  This column-centric rendering strategy can be circumvented by overriding
   *  the <code>getCellRenderer</code> methods in <code>JTable</code>.
   *
   * @param modelIndex the index of the column
   *  in the model that supplies the data for this column in the table;
   *  the model index remains the same
   *  even when columns are reordered in the view
   * @param width this column's preferred width and initial width
   * @param cellRenderer the object used to render values in this column
   * @param cellEditor the object used to edit values in this column
   * @see #getMinWidth()
   * @see JTable#getDefaultRenderer(Class)
   * @see JTable#getDefaultEditor(Class)
   * @see JTable#getCellRenderer(int, int)
   * @see JTable#getCellEditor(int, int)
   */
  _TableColumn$int$int$TableCellRenderer$TableCellEditor(modelIndex: number, width: number, cellRenderer: TableCellRenderer, cellEditor: TableCellEditor): this {
    this.modelIndex = modelIndex;
    this.preferredWidth = this.width_ = Math.max(width, 0);
    this.cellRenderer = cellRenderer;
    this.cellEditor = cellEditor;
    this.minWidth_ = Math.min(15, this.width_);
    this.maxWidth_ = 2147483647;
    this.isResizable_ = true;
    this.resizedPostingDisableCount = 0;
    this.headerValue = null;
    return this;
  }
  firePropertyChange$String$Object$Object$TableColumn(propertyName: string, oldValue: any, newValue: any): void {
    if (this.changeSupport != null) {
      this.changeSupport.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  firePropertyChange$String$int$int$TableColumn(propertyName: string, oldValue: number, newValue: number): void {
    if (oldValue !== newValue) {
      this.firePropertyChange$String$Object$Object$TableColumn(propertyName, oldValue, newValue);
    }
  }
  /**
   * Returns the model index for this column.
   * @return the <code>modelIndex</code> property
   */
  getModelIndex(): number {
    return this.modelIndex;
  }
  /**
   * Sets the <code>Object</code> whose string representation will be
   * used as the value for the <code>headerRenderer</code>.  When the
   * <code>TableColumn</code> is created, the default <code>headerValue</code>
   * is <code>null</code>.
   * @param headerValue  the new headerValue
   * @see       #getHeaderValue
   */
  setHeaderValue(headerValue: any): void {
    let old = this.headerValue;
    this.headerValue = headerValue;
    this.firePropertyChange$String$Object$Object$TableColumn('headerValue', old, headerValue);
  }
  /**
   * Returns the <code>Object</code> used as the value for the header
   * renderer.
   *
   * @return  the <code>headerValue</code> property
   * @see     #setHeaderValue
   */
  getHeaderValue(): any {
    return this.headerValue;
  }
  /**
   * Sets the <code>TableCellRenderer</code> used to draw the
   * <code>TableColumn</code>'s header to <code>headerRenderer</code>.
   * <p>
   * It is the header renderers responsibility to render the sorting
   * indicator.  If you are using sorting and specify a renderer your
   * renderer must render the sorting indication.
   *
   * @param headerRenderer  the new headerRenderer
   *
   * @see       #getHeaderRenderer
   */
  setHeaderRenderer(headerRenderer: TableCellRenderer): void {
    let old = this.headerRenderer;
    this.headerRenderer = headerRenderer;
    this.firePropertyChange$String$Object$Object$TableColumn('headerRenderer', old, headerRenderer);
  }
  /**
   * Returns the <code>TableCellRenderer</code> used to draw the header of the
   * <code>TableColumn</code>. When the <code>headerRenderer</code> is
   * <code>null</code>, the <code>JTableHeader</code>
   * uses its <code>defaultRenderer</code>. The default value for a
   * <code>headerRenderer</code> is <code>null</code>.
   *
   * @return  the <code>headerRenderer</code> property
   * @see     #setHeaderRenderer
   * @see     #setHeaderValue
   * @see     javax.swing.table.JTableHeader#getDefaultRenderer()
   */
  getHeaderRenderer(): TableCellRenderer {
    return this.headerRenderer;
  }
  /**
   * Sets the <code>TableCellRenderer</code> used by <code>JTable</code>
   * to draw individual values for this column.
   *
   * @param cellRenderer  the new cellRenderer
   * @see     #getCellRenderer
   */
  setCellRenderer(cellRenderer: TableCellRenderer): void {
    let old = this.cellRenderer;
    this.cellRenderer = cellRenderer;
    this.firePropertyChange$String$Object$Object$TableColumn('cellRenderer', old, cellRenderer);
  }
  /**
   * Returns the <code>TableCellRenderer</code> used by the
   * <code>JTable</code> to draw
   * values for this column.  The <code>cellRenderer</code> of the column
   * not only controls the visual look for the column, but is also used to
   * interpret the value object supplied by the <code>TableModel</code>.
   * When the <code>cellRenderer</code> is <code>null</code>,
   * the <code>JTable</code> uses a default renderer based on the
   * class of the cells in that column. The default value for a
   * <code>cellRenderer</code> is <code>null</code>.
   *
   * @return  the <code>cellRenderer</code> property
   * @see     #setCellRenderer
   * @see     JTable#setDefaultRenderer
   */
  getCellRenderer(): TableCellRenderer {
    return this.cellRenderer;
  }
  /**
   * Sets the editor to used by when a cell in this column is edited.
   *
   * @param cellEditor  the new cellEditor
   * @see     #getCellEditor
   */
  setCellEditor(cellEditor: TableCellEditor): void {
    let old = this.cellEditor;
    this.cellEditor = cellEditor;
    this.firePropertyChange$String$Object$Object$TableColumn('cellEditor', old, cellEditor);
  }
  /**
   * Returns the <code>TableCellEditor</code> used by the
   * <code>JTable</code> to edit values for this column.  When the
   * <code>cellEditor</code> is <code>null</code>, the <code>JTable</code>
   * uses a default editor based on the
   * class of the cells in that column. The default value for a
   * <code>cellEditor</code> is <code>null</code>.
   *
   * @return  the <code>cellEditor</code> property
   * @see     #setCellEditor
   * @see     JTable#setDefaultEditor
   */
  getCellEditor(): TableCellEditor {
    return this.cellEditor;
  }
  /**
   * This method should not be used to set the widths of columns in the
   * <code>JTable</code>, use <code>setPreferredWidth</code> instead.
   * Like a layout manager in the
   * AWT, the <code>JTable</code> adjusts a column's width automatically
   * whenever the
   * table itself changes size, or a column's preferred width is changed.
   * Setting widths programmatically therefore has no long term effect.
   * <p>
   * This method sets this column's width to <code>width</code>.
   * If <code>width</code> exceeds the minimum or maximum width,
   * it is adjusted to the appropriate limiting value.
   * @param  width  the new width
   * @see     #getWidth
   * @see     #setMinWidth
   * @see     #setMaxWidth
   * @see     #setPreferredWidth
   * @see     JTable#doLayout()
   */
  setWidth(width: number): void {
    let old = this.width_;
    this.width_ = Math.min(Math.max(width, this.minWidth_), this.maxWidth_);
    this.firePropertyChange$String$int$int$TableColumn('width', old, this.width_);
  }
  /**
   * Returns the width of the <code>TableColumn</code>. The default width is
   * 75.
   *
   * @return  the <code>width</code> property
   * @see     #setWidth
   */
  getWidth(): number {
    return this.width_;
  }
  /**
   * Sets this column's preferred width to <code>preferredWidth</code>.
   * If <code>preferredWidth</code> exceeds the minimum or maximum width,
   * it is adjusted to the appropriate limiting value.
   * <p>
   * For details on how the widths of columns in the <code>JTable</code>
   * (and <code>JTableHeader</code>) are calculated from the
   * <code>preferredWidth</code>,
   * see the <code>doLayout</code> method in <code>JTable</code>.
   *
   * @param  preferredWidth the new preferred width
   * @see     #getPreferredWidth
   * @see     JTable#doLayout()
   */
  setPreferredWidth(preferredWidth: number): void {
    let old = this.preferredWidth;
    this.preferredWidth = Math.min(Math.max(preferredWidth, this.minWidth_), this.maxWidth_);
    this.firePropertyChange$String$int$int$TableColumn('preferredWidth', old, this.preferredWidth);
  }
  /**
   * Returns the preferred width of the <code>TableColumn</code>.
   * The default preferred width is 75.
   *
   * @return  the <code>preferredWidth</code> property
   * @see     #setPreferredWidth
   */
  getPreferredWidth(): number {
    return this.preferredWidth;
  }
  /**
   * Returns the minimum width for the <code>TableColumn</code>. The
   * <code>TableColumn</code>'s width can't be made less than this either
   * by the user or programmatically.
   *
   * @return  the <code>minWidth</code> property
   * @see     #setMinWidth
   * @see     #TableColumn(int, int, TableCellRenderer, TableCellEditor)
   */
  getMinWidth(): number {
    return this.minWidth_;
  }
  /**
   * Returns the maximum width for the <code>TableColumn</code>. The
   * <code>TableColumn</code>'s width can't be made larger than this
   * either by the user or programmatically.  The default maxWidth
   * is Integer.MAX_VALUE.
   *
   * @return  the <code>maxWidth</code> property
   * @see     #setMaxWidth
   */
  getMaxWidth(): number {
    return this.maxWidth_;
  }
  /**
   * Returns true if the user is allowed to resize the
   * <code>TableColumn</code>'s
   * width, false otherwise. You can change the width programmatically
   * regardless of this setting.  The default is true.
   *
   * @return  the <code>isResizable</code> property
   * @see     #setResizable
   */
  getResizable(): boolean {
    return this.isResizable_;
  }
  /**
   * Adds a {@code PropertyChangeListener} to the listener list. The listener
   * is registered for all bound properties of this class, including the
   * following:
   * <ul>
   *    <li>this TableColumn's modelIndex ("modelIndex")</li>
   *    <li>this TableColumn's identifier ("identifier")</li>
   *    <li>this TableColumn's header value ("headerValue")</li>
   *    <li>this TableColumn's header renderer ("headerRenderer")</li>
   *    <li>this TableColumn's cell renderer ("cellRenderer")</li>
   *    <li>this TableColumn's cell editor ("cellEditor")</li>
   *    <li>this TableColumn's width ("width")</li>
   *    <li>this TableColumn's preferred width ("preferredWidth")</li>
   *    <li>this TableColumn's minimum width ("minWidth")</li>
   *    <li>this TableColumn's maximum width ("maxWidth")</li>
   *    <li>this TableColumn's resizable state ("isResizable")</li>
   * </ul>
   *
   * @param  listener the listener to be added
   * @see #removePropertyChangeListener(PropertyChangeListener)
   */
  addPropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport == null) {
      this.changeSupport = new SwingPropertyChangeSupport()._SwingPropertyChangeSupport$Object(this);
    }
    this.changeSupport.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  /**
   * Removes a <code>PropertyChangeListener</code> from the listener list.
   * The <code>PropertyChangeListener</code> to be removed was registered
   * for all properties.
   *
   * @param listener  the listener to be removed
   */
  removePropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.changeSupport != null) {
      this.changeSupport.removePropertyChangeListener$PropertyChangeListener(listener);
    }
  }
}

$J.define(TableColumn, 'javax.swing.table.TableColumn', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int,int,javax.swing.table.TableCellRenderer,javax.swing.table.TableCellEditor': '_TableColumn$int$int$TableCellRenderer$TableCellEditor', 'int,int': '_TableColumn$int$int', 'int': '_TableColumn$int', '': '_TableColumn$' }, meths: { 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean$TableColumn', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int$TableColumn', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object$TableColumn' } });
$J.module(() => {
  SwingPropertyChangeSupport = $J.load('javax.swing.event.SwingPropertyChangeSupport');
});
