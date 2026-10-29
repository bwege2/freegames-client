// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/table/JTableHeader.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException } from '../../../../jre/index.ts';
import { JComponent } from '../JComponent.ts';
import { JComponent$AccessibleJComponent } from '../JComponent.ts';
import { AccessibleContext } from '../../accessibility/AccessibleContext.ts';

let Component, Rectangle, MouseEvent, Accessible, JTable, SwingUtilities, ToolTipManager, UIManager, DefaultTableColumnModel, AWTAccessor, DefaultTableCellHeaderRenderer;

/**
 * This is the object which manages the header of the <code>JTable</code>.
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
 * @see javax.swing.JTable
 */
export class JTableHeader extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TableHeaderUI';
  /**
   * The table for which this object is the header;
   * the default is <code>null</code>.
   */
  table: JTable = null;
  /**
   * The <code>TableColumnModel</code> of the table header.
   */
  columnModel: TableColumnModel = null;
  /**
   * If true, reordering of columns are allowed by the user;
   * the default is true.
   */
  reorderingAllowed: boolean = false;
  /**
   * If true, resizing of columns are allowed by the user;
   * the default is true.
   */
  resizingAllowed: boolean = false;
  /**
   * Obsolete as of Java 2 platform v1.3.  Real time repaints, in response
   * to column dragging or resizing, are now unconditional.
   */
  updateTableInRealTime: boolean = false;
  /**
   * The index of the column being resized. <code>null</code> if not resizing.
   */
  resizingColumn: TableColumn = null;
  /**
   * The index of the column being dragged. <code>null</code> if not dragging.
   */
  draggedColumn: TableColumn = null;
  /**
   * The distance from its original position the column has been dragged.
   */
  draggedDistance: number = 0;
  /**
   * The default renderer to be used when a <code>TableColumn</code>
   *  does not define a <code>headerRenderer</code>.
   */
  defaultRenderer: TableCellRenderer = null;
  /**
   * Flag to indicate UI update is in progress
   */
  updateInProgress: boolean = false;
  /**
   * Constructs a <code>JTableHeader</code> which is initialized with
   *  <code>cm</code> as the column model.  If <code>cm</code> is
   *  <code>null</code> this method will initialize the table header
   *  with a default <code>TableColumnModel</code>.
   *
   * @param cm        the column model for the table
   * @see #createDefaultColumnModel
   */
  _JTableHeader$TableColumnModel(cm: TableColumnModel): this {
    this._JComponent();
    if (cm == null) {
      cm = this.createDefaultColumnModel();
    }
    this.setColumnModel(cm);
    this.initializeLocalVars();
    this.updateUI();
    return this;
  }
  /**
   * Sets the table associated with this header.
   *  @param  table   the new table
   */
  setTable(table: JTable): void {
    let old = this.table;
    this.table = table;
    this.firePropertyChange$String$Object$Object('table', old, table);
  }
  /**
   * Returns the table associated with this header.
   *  @return  the <code>table</code> property
   */
  getTable(): JTable {
    return this.table;
  }
  /**
   * Sets whether the user can drag column headers to reorder columns.
   *
   * @param   reorderingAllowed       true if the table view should allow
   *                                  reordering; otherwise false
   * @see     #getReorderingAllowed
   */
  setReorderingAllowed(reorderingAllowed: boolean): void {
    let old = this.reorderingAllowed;
    this.reorderingAllowed = reorderingAllowed;
    this.firePropertyChange$String$boolean$boolean('reorderingAllowed', old, reorderingAllowed);
  }
  /**
   * Returns true if the user is allowed to rearrange columns by
   * dragging their headers, false otherwise. The default is true. You can
   * rearrange columns programmatically regardless of this setting.
   *
   * @return  the <code>reorderingAllowed</code> property
   * @see     #setReorderingAllowed
   */
  getReorderingAllowed(): boolean {
    return this.reorderingAllowed;
  }
  /**
   * Returns true if the user is allowed to resize columns by dragging
   * between their headers, false otherwise. The default is true. You can
   * resize columns programmatically regardless of this setting.
   *
   * @return  the <code>resizingAllowed</code> property
   * @see     #setResizingAllowed
   */
  getResizingAllowed(): boolean {
    return this.resizingAllowed;
  }
  /**
   * Returns the dragged column, if and only if, a drag is in
   * process, otherwise returns <code>null</code>.
   *
   * @return  the dragged column, if a drag is in
   *          process, otherwise returns <code>null</code>
   * @see     #getDraggedDistance
   */
  getDraggedColumn(): TableColumn {
    return this.draggedColumn;
  }
  /**
   * Returns the column's horizontal distance from its original
   * position, if and only if, a drag is in process. Otherwise, the
   * the return value is meaningless.
   *
   * @return  the column's horizontal distance from its original
   *          position, if a drag is in process, otherwise the return
   *          value is meaningless
   * @see     #getDraggedColumn
   */
  getDraggedDistance(): number {
    return this.draggedDistance;
  }
  /**
   * Returns the resizing column.  If no column is being
   * resized this method returns <code>null</code>.
   *
   * @return  the resizing column, if a resize is in process, otherwise
   *          returns <code>null</code>
   */
  getResizingColumn(): TableColumn {
    return this.resizingColumn;
  }
  /**
   * Sets the default renderer to be used when no <code>headerRenderer</code>
   * is defined by a <code>TableColumn</code>.
   * @param  defaultRenderer  the default renderer
   * @since 1.3
   */
  setDefaultRenderer(defaultRenderer: TableCellRenderer): void {
    this.defaultRenderer = defaultRenderer;
  }
  /**
   * Returns the default renderer used when no <code>headerRenderer</code>
   * is defined by a <code>TableColumn</code>.
   * @return the default renderer
   * @since 1.3
   */
  getDefaultRenderer(): TableCellRenderer {
    return this.defaultRenderer;
  }
  /**
   * Returns the index of the column that <code>point</code> lies in, or -1 if it
   * lies out of bounds.
   *
   * @param point  if this <code>point</code> lies within a column, the index of
   *               that column will be returned; otherwise it is out of bounds
   *               and -1 is returned
   *
   * @return  the index of the column that <code>point</code> lies in, or -1 if it
   *          lies out of bounds
   */
  columnAtPoint(point: Point): number {
    let x = point.x_;
    if (!this.getComponentOrientation().isLeftToRight()) {
      x = (this.getWidthInRightToLeft() - x - 1) | 0;
    }
    return this.getColumnModel().getColumnIndexAtX(x);
  }
  /**
   * Returns the rectangle containing the header tile at <code>column</code>.
   * When the <code>column</code> parameter is out of bounds this method uses the
   * same conventions as the <code>JTable</code> method <code>getCellRect</code>.
   *
   * @param column  index of the column
   *
   * @return  the rectangle containing the header tile at <code>column</code>
   * @see JTable#getCellRect
   */
  getHeaderRect(column: number): Rectangle {
    let r = new Rectangle()._Rectangle$();
    let cm = this.getColumnModel();
    r.height_ = this.getHeight();
    if (column < 0) {
      if (!this.getComponentOrientation().isLeftToRight()) {
        r.x_ = this.getWidthInRightToLeft();
      }
    } else if (column >= cm.getColumnCount()) {
      if (this.getComponentOrientation().isLeftToRight()) {
        r.x_ = this.getWidth();
      }
    } else {
      for (let i = 0; i < column; i++) {
        r.x_ = (r.x_ + cm.getColumn(i).getWidth()) | 0;
      }
      if (!this.getComponentOrientation().isLeftToRight()) {
        r.x_ = (this.getWidthInRightToLeft() - r.x_ - cm.getColumn(column).getWidth()) | 0;
      }
      r.width_ = cm.getColumn(column).getWidth();
    }
    return r;
  }
  /**
   * Allows the renderer's tips to be used if there is text set.
   * @param  event  the location of the event identifies the proper
   *                          renderer and, therefore, the proper tip
   * @return the tool tip for this component
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    let tip = null;
    let p = event.getPoint();
    let column: number;
    if ((column = this.columnAtPoint(p)) !== -1) {
      let aColumn = this.columnModel.getColumn(column);
      let renderer = aColumn.getHeaderRenderer();
      if (renderer == null) {
        renderer = this.defaultRenderer;
      }
      let component = renderer.getTableCellRendererComponent(this.getTable(), aColumn.getHeaderValue(), false, false, -1, column);
      if (component instanceof JComponent) {
        let newEvent: MouseEvent;
        let cellRect = this.getHeaderRect(column);
        p.translate(-cellRect.x_, -cellRect.y_);
        newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(component, event.getID(), event.getWhen(), event.getModifiers(), p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
        let meAccessor = AWTAccessor.getMouseEventAccessor();
        meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(event));
        tip = (component).getToolTipText$MouseEvent(newEvent);
      }
    }
    if (tip == null) {
      tip = this.getToolTipText$();
    }
    return tip;
  }
  /**
   * Returns the preferred size of the table header.
   * This is the size required to display the header and requested for
   * the viewport.
   * The returned {@code Dimension} {@code width} will always be calculated by
   * the underlying TableHeaderUI, regardless of any width specified by
   * {@link JComponent#setPreferredSize(java.awt.Dimension)}
   *
   * @return the size
   */
  getPreferredSize$(): Dimension {
    let preferredSize = super.getPreferredSize$();
    if (this.isPreferredSizeSet() && this.ui != null) {
      let size = this.ui.getPreferredSize$JComponent(this);
      if (size != null) {
        preferredSize.width_ = size.width_;
      }
    }
    return preferredSize;
  }
  /**
   * Returns the look and feel (L&amp;F) object that renders this component.
   *
   * @return the <code>TableHeaderUI</code> object that renders this component
   */
  getUI(): TableHeaderUI {
    return this.ui;
  }
  /**
   * Sets the look and feel (L&amp;F) object that renders this component.
   *
   * @param ui  the <code>TableHeaderUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$TableHeaderUI(ui: TableHeaderUI): void {
    if (this.ui !== ui) {
      super.setUI$ComponentUI(ui);
      this.repaint$();
    }
  }
  /**
   * Notification from the <code>UIManager</code> that the look and feel
   * (L&amp;F) has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    if (!this.updateInProgress) {
      this.updateInProgress = true;
      try {
        this.setUI$TableHeaderUI(UIManager.getUI(this));
        let renderer = this.getDefaultRenderer();
        if (renderer instanceof Component) {
          SwingUtilities.updateComponentTreeUI(renderer);
        }
      } finally {
        this.updateInProgress = false;
      }
    }
  }
  /**
   * Returns the suffix used to construct the name of the look and feel
   * (L&amp;F) class used to render this component.
   *
   * @return the string "TableHeaderUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTableHeader.uiClassID;
  }
  /**
   * Sets the column model for this table to <code>newModel</code> and registers
   *  for listener notifications from the new column model.
   *
   * @param   columnModel     the new data source for this table
   * @throws IllegalArgumentException
   *                          if <code>newModel</code> is <code>null</code>
   * @see     #getColumnModel
   */
  setColumnModel(columnModel: TableColumnModel): void {
    if (columnModel == null) {
      throw new IllegalArgumentException('Cannot set a null ColumnModel');
    }
    let old = this.columnModel;
    if (columnModel !== old) {
      if (old != null) {
        old.removeColumnModelListener(this);
      }
      this.columnModel = columnModel;
      columnModel.addColumnModelListener(this);
      this.firePropertyChange$String$Object$Object('columnModel', old, columnModel);
      this.resizeAndRepaint();
    }
  }
  /**
   * Returns the <code>TableColumnModel</code> that contains all column information
   * of this table header.
   *
   * @return  the <code>columnModel</code> property
   * @see     #setColumnModel
   */
  getColumnModel(): TableColumnModel {
    return this.columnModel;
  }
  /**
   * Invoked when a column is added to the table column model.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by <code>JTable</code>.
   *
   * @param e  the event received
   * @see TableColumnModelListener
   */
  columnAdded(e: TableColumnModelEvent): void {
    this.resizeAndRepaint();
  }
  /**
   * Invoked when a column is removed from the table column model.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by <code>JTable</code>.
   *
   * @param e  the event received
   * @see TableColumnModelListener
   */
  columnRemoved(e: TableColumnModelEvent): void {
    this.resizeAndRepaint();
  }
  /**
   * Invoked when a column is repositioned.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by <code>JTable</code>.
   *
   * @param e the event received
   * @see TableColumnModelListener
   */
  columnMoved(e: TableColumnModelEvent): void {
    this.repaint$();
  }
  /**
   * Invoked when a column is moved due to a margin change.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by <code>JTable</code>.
   *
   * @param e the event received
   * @see TableColumnModelListener
   */
  columnMarginChanged(e: ChangeEvent): void {
    this.resizeAndRepaint();
  }
  /**
   * Invoked when the selection model of the <code>TableColumnModel</code>
   * is changed.  This method currently has no effect (the header is not
   * redrawn).
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by <code>JTable</code>.
   *
   * @param e the event received
   * @see TableColumnModelListener
   */
  columnSelectionChanged(e: ListSelectionEvent): void {
  }
  /**
   * Returns the default column model object which is
   *  a <code>DefaultTableColumnModel</code>.  A subclass can override this
   *  method to return a different column model object
   *
   * @return the default column model object
   */
  createDefaultColumnModel(): TableColumnModel {
    return new DefaultTableColumnModel()._DefaultTableColumnModel();
  }
  /**
   * Returns a default renderer to be used when no header renderer
   *  is defined by a <code>TableColumn</code>.
   *
   *  @return the default table column renderer
   * @since 1.3
   */
  createDefaultRenderer(): TableCellRenderer {
    return new DefaultTableCellHeaderRenderer()._DefaultTableCellHeaderRenderer();
  }
  /**
   * Initializes the local variables and properties with default values.
   * Used by the constructor methods.
   */
  initializeLocalVars(): void {
    this.setOpaque(true);
    this.table = null;
    this.reorderingAllowed = true;
    this.resizingAllowed = true;
    this.draggedColumn = null;
    this.draggedDistance = 0;
    this.resizingColumn = null;
    this.updateTableInRealTime = true;
    let toolTipManager = ToolTipManager.sharedInstance();
    toolTipManager.registerComponent(this);
    this.setDefaultRenderer(this.createDefaultRenderer());
  }
  /**
   * Sizes the header and marks it as needing display.  Equivalent
   * to <code>revalidate</code> followed by <code>repaint</code>.
   */
  resizeAndRepaint(): void {
    this.revalidate();
    this.repaint$();
  }
  /**
   * Sets the header's <code>draggedColumn</code> to <code>aColumn</code>.
   *  <p>
   *  Application code will not use this method explicitly, it is used
   *  internally by the column dragging mechanism.
   *
   *  @param  aColumn  the column being dragged, or <code>null</code> if
   *                 no column is being dragged
   */
  setDraggedColumn(aColumn: TableColumn): void {
    this.draggedColumn = aColumn;
  }
  /**
   * Sets the header's <code>draggedDistance</code> to <code>distance</code>.
   *  @param distance  the distance dragged
   */
  setDraggedDistance(distance: number): void {
    this.draggedDistance = distance;
  }
  /**
   * Sets the header's <code>resizingColumn</code> to <code>aColumn</code>.
   *  <p>
   *  Application code will not use this method explicitly, it
   *  is used internally by the column sizing mechanism.
   *
   *  @param  aColumn  the column being resized, or <code>null</code> if
   *                 no column is being resized
   */
  setResizingColumn(aColumn: TableColumn): void {
    this.resizingColumn = aColumn;
  }
  getWidthInRightToLeft(): number {
    if ((this.table != null) && (this.table.getAutoResizeMode() !== JTable.AUTO_RESIZE_OFF)) {
      return this.table.getWidth();
    }
    return super.getWidth();
  }
  /**
   * Returns a string representation of this <code>JTableHeader</code>. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   * <P>
   * Overriding <code>paramString</code> to provide information about the
   * specific new aspects of the JFC components.
   *
   * @return  a string representation of this <code>JTableHeader</code>
   */
  paramString(): string {
    let reorderingAllowedString = (this.reorderingAllowed ? 'true' : 'false');
    let resizingAllowedString = (this.resizingAllowed ? 'true' : 'false');
    let updateTableInRealTimeString = (this.updateTableInRealTime ? 'true' : 'false');
    return super.paramString() + ',draggedDistance=' + this.draggedDistance + ',reorderingAllowed=' + reorderingAllowedString + ',resizingAllowed=' + resizingAllowedString + ',updateTableInRealTime=' + updateTableInRealTimeString;
  }
  /**
   * Gets the AccessibleContext associated with this JTableHeader.
   * For JTableHeaders, the AccessibleContext takes the form of an
   * AccessibleJTableHeader.
   * A new AccessibleJTableHeader instance is created if necessary.
   *
   * @return an AccessibleJTableHeader that serves as the
   *         AccessibleContext of this JTableHeader
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTableHeader$AccessibleJTableHeader().$o(this)._JTableHeader$AccessibleJTableHeader();
    }
    return this.accessibleContext;
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTableHeader</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to table header user-interface
 * elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JTableHeader$AccessibleJTableHeader extends JComponent$AccessibleJComponent {
  /**
   * Constructs an {@code AccessibleJTableHeader}.
   */
  _JTableHeader$AccessibleJTableHeader(): this {
    this._JComponent$AccessibleJComponent();
    return this;
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement Accessible, than this
   * method should return the number of children of this object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    return this.$outer.columnModel.getColumnCount();
  }
  /**
   * Return the nth Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    if (i < 0 || i >= this.getAccessibleChildrenCount()) {
      return null;
    } else {
      let aColumn = this.$outer.columnModel.getColumn(i);
      let renderer = aColumn.getHeaderRenderer();
      if (renderer == null) {
        if (this.$outer.defaultRenderer != null) {
          renderer = this.$outer.defaultRenderer;
        } else {
          return null;
        }
      }
      let component = renderer.getTableCellRendererComponent(this.$outer.getTable(), aColumn.getHeaderValue(), false, false, -1, i);
      return new JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry().$o(this)._JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry(i, this.$outer, this.$outer.table);
    }
  }
}

/**
 * This class provides an implementation of the Java Accessibility
 * API appropriate for JTableHeader entries.
 */
export class JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry extends AccessibleContext {
  parent: JTableHeader = null;
  column: number = 0;
  table: JTable = null;
  /**
   * Constructs an AccessibleJTableHeaderEntry
   * @since 1.4
   *
   * @param c  the column index
   * @param p  the parent <code>JTableHeader</code>
   * @param t  the table <code>JTable</code>
   */
  _JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry(c: number, p: JTableHeader, t: JTable): this {
    this._AccessibleContext();
    this.parent = p;
    this.column = c;
    this.table = t;
    this.setAccessibleParent(this.parent);
    return this;
  }
  /**
   * Get the AccessibleContext associated with this object.
   * In the implementation of the Java Accessibility API
   * for this class, returns this object, which serves as
   * its own AccessibleContext.
   *
   * @return this object
   */
  getAccessibleContext(): AccessibleContext {
    return this;
  }
  getCurrentAccessibleContext(): AccessibleContext {
    let tcm = this.table.getColumnModel();
    if (tcm != null) {
      if (this.column < 0 || this.column >= tcm.getColumnCount()) {
        return null;
      }
      let aColumn = tcm.getColumn(this.column);
      let renderer = aColumn.getHeaderRenderer();
      if (renderer == null) {
        if (this.$outer.$outer.defaultRenderer != null) {
          renderer = this.$outer.$outer.defaultRenderer;
        } else {
          return null;
        }
      }
      let c = renderer.getTableCellRendererComponent(this.$outer.$outer.getTable(), aColumn.getHeaderValue(), false, false, -1, this.column);
      if ($J.isa(c, Accessible)) {
        return (c).getAccessibleContext();
      }
    }
    return null;
  }
  getAccessibleName(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      let name = ac.getAccessibleName();
      if ((name != null) && (name !== '')) {
        return name;
      }
    }
    if ((this.accessibleName != null) && (this.accessibleName !== '')) {
      return this.accessibleName;
    } else {
      let name = this.$outer.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
      if (name != null) {
        return name;
      } else {
        return this.table.getColumnName(this.column);
      }
    }
  }
  setAccessibleName(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleName(s);
    } else {
      super.setAccessibleName(s);
    }
  }
  getAccessibleDescription(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleDescription();
    } else {
      return super.getAccessibleDescription();
    }
  }
  setAccessibleDescription(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleDescription(s);
    } else {
      super.setAccessibleDescription(s);
    }
  }
  getAccessibleIndexInParent(): number {
    return this.column;
  }
  getAccessibleChildrenCount(): number {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleChildrenCount();
    } else {
      return 0;
    }
  }
  getAccessibleChild(i: number): Accessible {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      let accessibleChild = ac.getAccessibleChild(i);
      ac.setAccessibleParent(this);
      return accessibleChild;
    } else {
      return null;
    }
  }
  getAccessibleSelection$(): AccessibleSelection {
    return this.getCurrentAccessibleContext().getAccessibleSelection$();
  }
}

$J.define(JTableHeader, 'javax.swing.table.JTableHeader', { kind: 'class', ifaces: ['javax.swing.event.TableColumnModelListener', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.table.TableColumnModel': '_JTableHeader$TableColumnModel', '': '_JTableHeader$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTableHeader', 'setUI(javax.swing.plaf.TableHeaderUI)': 'setUI$TableHeaderUI', 'getPreferredSize()': 'getPreferredSize$', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent' } });
$J.define(JTableHeader$AccessibleJTableHeader, 'javax.swing.table.JTableHeader$AccessibleJTableHeader', { kind: 'class', sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JTableHeader$AccessibleJTableHeader' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry, 'javax.swing.table.JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.accessibility.AccessibleComponent'], sup: 'javax.accessibility.AccessibleContext', ctors: { 'int,javax.swing.table.JTableHeader,javax.swing.JTable': '_JTableHeader$AccessibleJTableHeader$AccessibleJTableHeaderEntry' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Rectangle = $J.load('java.awt.Rectangle');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  JTable = $J.load('javax.swing.JTable');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ToolTipManager = $J.load('javax.swing.ToolTipManager');
  UIManager = $J.load('javax.swing.UIManager');
  DefaultTableColumnModel = $J.load('javax.swing.table.DefaultTableColumnModel');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  DefaultTableCellHeaderRenderer = $J.load('sun.swing.table.DefaultTableCellHeaderRenderer');
});
