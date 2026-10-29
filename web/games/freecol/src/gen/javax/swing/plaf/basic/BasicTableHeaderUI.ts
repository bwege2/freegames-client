// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTableHeaderUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { TableHeaderUI } from '../TableHeaderUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Cursor, Dimension, Point, CellRendererPane, JComponent, JScrollPane, JTable, LookAndFeel, SwingUtilities, BasicLookAndFeel, LazyActionMap, JTableHeader, DefaultLookup, SwingUtilities2;

/**
 * BasicTableHeaderUI implementation
 *
 * @author Alan Chung
 * @author Philip Milne
 */
export class BasicTableHeaderUI extends TableHeaderUI {
  static resizeCursor: Cursor = null;
  /**
   * The {@code JTableHeader} that is delegating the painting to this UI.
   */
  header: JTableHeader = null;
  /**
   * The instance of {@code CellRendererPane}.
   */
  rendererPane: CellRendererPane = null;
  /**
   * Listeners that are attached to the {@code JTable}
   */
  mouseInputListener: MouseInputListener = null;
  rolloverColumn: number = 0;
  selectedColumnIndex: number = 0;
  static focusListener: FocusListener = null;
  /**
   * Constructs a {@code BasicTableHeaderUI}.
   */
  _BasicTableHeaderUI(): this {
    this._TableHeaderUI();
    this.rolloverColumn = -1;
    this.selectedColumnIndex = 0;
    return this;
  }
  /**
   * Creates the mouse listener for the {@code JTableHeader}.
   *
   * @return the mouse listener for the {@code JTableHeader}
   */
  createMouseInputListener(): MouseInputListener {
    return new BasicTableHeaderUI$MouseInputHandler().$o(this)._BasicTableHeaderUI$MouseInputHandler();
  }
  /**
   * Returns a new instance of {@code BasicTableHeaderUI}.
   *
   * @param h a component.
   * @return a new instance of {@code BasicTableHeaderUI}
   */
  static createUI(h: JComponent): ComponentUI {
    return new BasicTableHeaderUI()._BasicTableHeaderUI();
  }
  installUI(c: JComponent): void {
    this.header = c;
    this.rendererPane = new CellRendererPane()._CellRendererPane();
    this.header.add$Component(this.rendererPane);
    this.installDefaults();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Initializes JTableHeader properties such as font, foreground, and background.
   * The font, foreground, and background properties are only set if their
   * current value is either null or a UIResource, other properties are set
   * if the current value is null.
   *
   * @see #installUI
   */
  installDefaults(): void {
    LookAndFeel.installColorsAndFont(this.header, 'TableHeader.background', 'TableHeader.foreground', 'TableHeader.font');
    LookAndFeel.installProperty(this.header, 'opaque', true);
  }
  /**
   * Attaches listeners to the JTableHeader.
   */
  installListeners(): void {
    this.mouseInputListener = this.createMouseInputListener();
    this.header.addMouseListener(this.mouseInputListener);
    this.header.addMouseMotionListener(this.mouseInputListener);
    this.header.addFocusListener(BasicTableHeaderUI.focusListener);
  }
  /**
   * Register all keyboard actions on the JTableHeader.
   */
  installKeyboardActions(): void {
    let keyMap = DefaultLookup.get(this.header, this, 'TableHeader.ancestorInputMap');
    SwingUtilities.replaceUIInputMap(this.header, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, keyMap);
    LazyActionMap.installLazyActionMap(this.header, $J.cls(BasicTableHeaderUI), 'TableHeader.actionMap');
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    this.header.remove$Component(this.rendererPane);
    this.rendererPane = null;
    this.header = null;
  }
  /**
   * Uninstalls default properties
   */
  uninstallDefaults(): void {
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    this.header.removeMouseListener(this.mouseInputListener);
    this.header.removeMouseMotionListener(this.mouseInputListener);
    this.header.removeFocusListener(BasicTableHeaderUI.focusListener);
    this.mouseInputListener = null;
  }
  /**
   * Unregisters default key actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIInputMap(this.header, JComponent.WHEN_FOCUSED, null);
    SwingUtilities.replaceUIActionMap(this.header, null);
  }
  /**
   * Populates TableHeader's actions.
   */
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.TOGGLE_SORT_ORDER));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.SELECT_COLUMN_TO_LEFT));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.SELECT_COLUMN_TO_RIGHT));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.MOVE_COLUMN_LEFT));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.MOVE_COLUMN_RIGHT));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.RESIZE_LEFT));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.RESIZE_RIGHT));
    map.put$Action(new BasicTableHeaderUI$Actions()._BasicTableHeaderUI$Actions(BasicTableHeaderUI$Actions.FOCUS_TABLE));
  }
  /**
   * This method gets called every time when a rollover column in the table
   * header is updated. Every look and feel that supports a rollover effect
   * in a table header should override this method and repaint the header.
   *
   * @param oldColumn the index of the previous rollover column or -1 if the
   * mouse was not over a column
   * @param newColumn the index of the new rollover column or -1 if the mouse
   * is not over a column
   * @see #getRolloverColumn()
   * @see JTableHeader#getHeaderRect(int)
   * @since 1.6
   */
  rolloverColumnUpdated(oldColumn: number, newColumn: number): void {
  }
  updateRolloverColumn(e: MouseEvent): void {
    if (this.header.getDraggedColumn() == null && this.header.contains$Point(e.getPoint())) {
      let col = this.header.columnAtPoint(e.getPoint());
      if (col !== this.rolloverColumn) {
        let oldRolloverColumn = this.rolloverColumn;
        this.rolloverColumn = col;
        this.rolloverColumnUpdated(oldRolloverColumn, this.rolloverColumn);
      }
    }
  }
  selectNextColumn(doIt: boolean): number {
    let newIndex = this.getSelectedColumnIndex();
    if (newIndex < ((this.header.getColumnModel().getColumnCount() - 1) | 0)) {
      newIndex++;
      if (doIt) {
        this.selectColumn$int(newIndex);
      }
    }
    return newIndex;
  }
  selectPreviousColumn(doIt: boolean): number {
    let newIndex = this.getSelectedColumnIndex();
    if (newIndex > 0) {
      newIndex--;
      if (doIt) {
        this.selectColumn$int(newIndex);
      }
    }
    return newIndex;
  }
  /**
   * Selects the specified column in the table header. Repaints the
   * affected header cells and makes sure the newly selected one is visible.
   */
  selectColumn$int(newColIndex: number): void {
    this.selectColumn$int$boolean(newColIndex, true);
  }
  selectColumn$int$boolean(newColIndex: number, doScroll: boolean): void {
    let repaintRect = this.header.getHeaderRect(this.selectedColumnIndex);
    this.header.repaint$Rectangle(repaintRect);
    this.selectedColumnIndex = newColIndex;
    repaintRect = this.header.getHeaderRect(newColIndex);
    this.header.repaint$Rectangle(repaintRect);
    if (doScroll) {
      this.scrollToColumn(newColIndex);
    }
    return;
  }
  /**
   * Used by selectColumn to scroll horizontally, if necessary,
   * to ensure that the newly selected column is visible.
   */
  scrollToColumn(col: number): void {
    let table: JTable;
    if ((this.header.getParent() == null) || !(this.header.getParent().getParent() instanceof JScrollPane) || ((table = this.header.getTable()) == null)) {
      return;
    }
    let vis = table.getVisibleRect();
    let cellBounds = table.getCellRect(0, col, true);
    vis.x_ = cellBounds.x_;
    vis.width_ = cellBounds.width_;
    table.scrollRectToVisible(vis);
  }
  getSelectedColumnIndex(): number {
    let numCols = this.header.getColumnModel().getColumnCount();
    if (this.selectedColumnIndex >= numCols && numCols > 0) {
      this.selectedColumnIndex = (numCols - 1) | 0;
    }
    return this.selectedColumnIndex;
  }
  static canResize(column: TableColumn, header: JTableHeader): boolean {
    return (column != null) && header.getResizingAllowed() && column.getResizable();
  }
  changeColumnWidth(resizingColumn: TableColumn, th: JTableHeader, oldWidth: number, newWidth: number): number {
    resizingColumn.setWidth(newWidth);
    let container: Container;
    let table: JTable;
    if ((th.getParent() == null) || ((container = th.getParent().getParent()) == null) || !(container instanceof JScrollPane) || ((table = th.getTable()) == null)) {
      return 0;
    }
    if (!container.getComponentOrientation().isLeftToRight() && !th.getComponentOrientation().isLeftToRight()) {
      let viewport = (container).getViewport();
      let viewportWidth = viewport.getWidth();
      let diff = (newWidth - oldWidth) | 0;
      let newHeaderWidth = (table.getWidth() + diff) | 0;
      let tableSize = table.getSize$();
      tableSize.width_ = (tableSize.width_ + diff) | 0;
      table.setSize$Dimension(tableSize);
      if ((newHeaderWidth >= viewportWidth) && (table.getAutoResizeMode() === JTable.AUTO_RESIZE_OFF)) {
        let p = viewport.getViewPosition();
        p.x_ = Math.max(0, Math.min((newHeaderWidth - viewportWidth) | 0, (p.x_ + diff) | 0));
        viewport.setViewPosition(p);
        return diff;
      }
    }
    return 0;
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let baseline = -1;
    let columnModel = this.header.getColumnModel();
    for (let column = 0; column < columnModel.getColumnCount(); column++) {
      let aColumn = columnModel.getColumn(column);
      let comp = this.getHeaderRenderer(column);
      let pref = comp.getPreferredSize$();
      let columnBaseline = comp.getBaseline(pref.width_, height);
      if (columnBaseline >= 0) {
        if (baseline === -1) {
          baseline = columnBaseline;
        } else if (baseline !== columnBaseline) {
          baseline = -1;
          break;
        }
      }
    }
    return baseline;
  }
  paint(g: Graphics, c: JComponent): void {
    if (this.header.getColumnModel().getColumnCount() <= 0) {
      return;
    }
    let ltr = this.header.getComponentOrientation().isLeftToRight();
    let clip = g.getClipBounds$();
    let left = clip.getLocation();
    let right = new Point()._Point$int$int((clip.x_ + clip.width_ - 1) | 0, clip.y_);
    let cm = this.header.getColumnModel();
    let cMin = this.header.columnAtPoint(ltr ? left : right);
    let cMax = this.header.columnAtPoint(ltr ? right : left);
    if (cMin === -1) {
      cMin = 0;
    }
    if (cMax === -1) {
      cMax = (cm.getColumnCount() - 1) | 0;
    }
    let draggedColumn = this.header.getDraggedColumn();
    let columnWidth: number;
    let cellRect = this.header.getHeaderRect(ltr ? cMin : cMax);
    let aColumn: TableColumn;
    if (ltr) {
      for (let column = cMin; column <= cMax; column++) {
        aColumn = cm.getColumn(column);
        columnWidth = aColumn.getWidth();
        cellRect.width_ = columnWidth;
        if (aColumn !== draggedColumn) {
          this.paintCell(g, cellRect, column);
        }
        cellRect.x_ = (cellRect.x_ + columnWidth) | 0;
      }
    } else {
      for (let column = cMax; column >= cMin; column--) {
        aColumn = cm.getColumn(column);
        columnWidth = aColumn.getWidth();
        cellRect.width_ = columnWidth;
        if (aColumn !== draggedColumn) {
          this.paintCell(g, cellRect, column);
        }
        cellRect.x_ = (cellRect.x_ + columnWidth) | 0;
      }
    }
    if (draggedColumn != null) {
      let draggedColumnIndex = this.viewIndexForColumn(draggedColumn);
      if (draggedColumnIndex !== -1) {
        let draggedCellRect = this.header.getHeaderRect(draggedColumnIndex);
        g.setColor(this.header.getParent().getBackground());
        g.fillRect(draggedCellRect.x_, draggedCellRect.y_, draggedCellRect.width_, draggedCellRect.height_);
        draggedCellRect.x_ = (draggedCellRect.x_ + this.header.getDraggedDistance()) | 0;
        g.setColor(this.header.getBackground());
        g.fillRect(draggedCellRect.x_, draggedCellRect.y_, draggedCellRect.width_, draggedCellRect.height_);
        this.paintCell(g, draggedCellRect, draggedColumnIndex);
      }
    }
    this.rendererPane.removeAll();
  }
  getHeaderRenderer(columnIndex: number): Component {
    let aColumn = this.header.getColumnModel().getColumn(columnIndex);
    let renderer = aColumn.getHeaderRenderer();
    if (renderer == null) {
      renderer = this.header.getDefaultRenderer();
    }
    let hasFocus = !this.header.isPaintingForPrint() && (columnIndex === this.getSelectedColumnIndex()) && this.header.hasFocus();
    return renderer.getTableCellRendererComponent(this.header.getTable(), aColumn.getHeaderValue(), false, hasFocus, -1, columnIndex);
  }
  paintCell(g: Graphics, cellRect: Rectangle, columnIndex: number): void {
    let component = this.getHeaderRenderer(columnIndex);
    this.rendererPane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, component, this.header, cellRect.x_, cellRect.y_, cellRect.width_, cellRect.height_, true);
  }
  viewIndexForColumn(aColumn: TableColumn): number {
    let cm = this.header.getColumnModel();
    for (let column = 0; column < cm.getColumnCount(); column++) {
      if (cm.getColumn(column) === aColumn) {
        return column;
      }
    }
    return -1;
  }
  getHeaderHeight(): number {
    let height = 0;
    let accomodatedDefault = false;
    let columnModel = this.header.getColumnModel();
    for (let column = 0; column < columnModel.getColumnCount(); column++) {
      let aColumn = columnModel.getColumn(column);
      let isDefault = (aColumn.getHeaderRenderer() == null);
      if (!isDefault || !accomodatedDefault) {
        let comp = this.getHeaderRenderer(column);
        let rendererHeight = comp.getPreferredSize$().height_;
        height = Math.max(height, rendererHeight);
        if (isDefault && rendererHeight > 0) {
          let headerValue = aColumn.getHeaderValue();
          if (headerValue != null) {
            headerValue = $J.str(headerValue);
            if (headerValue != null && !$J.equals(headerValue, '')) {
              accomodatedDefault = true;
            }
          }
        }
      }
    }
    return height;
  }
  createHeaderSize(width: number): Dimension {
    if (width > 2147483647) {
      width = 2147483647;
    }
    return new Dimension()._Dimension$int$int((width) | 0, this.getHeaderHeight());
  }
  /**
   * Return the minimum size of the header. The minimum width is the sum
   * of the minimum widths of each column (plus inter-cell spacing).
   */
  getMinimumSize(c: JComponent): Dimension {
    let width = 0;
    let enumeration = this.header.getColumnModel().getColumns();
    while (enumeration.hasMoreElements()) {
      let aColumn = enumeration.nextElement();
      width = width + aColumn.getMinWidth();
    }
    return this.createHeaderSize(width);
  }
  /**
   * Return the preferred size of the header. The preferred height is the
   * maximum of the preferred heights of all of the components provided
   * by the header renderers. The preferred width is the sum of the
   * preferred widths of each column (plus inter-cell spacing).
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let width = 0;
    let enumeration = this.header.getColumnModel().getColumns();
    while (enumeration.hasMoreElements()) {
      let aColumn = enumeration.nextElement();
      width = width + aColumn.getPreferredWidth();
    }
    return this.createHeaderSize(width);
  }
  /**
   * Return the maximum size of the header. The maximum width is the sum
   * of the maximum widths of each column (plus inter-cell spacing).
   */
  getMaximumSize(c: JComponent): Dimension {
    let width = 0;
    let enumeration = this.header.getColumnModel().getColumns();
    while (enumeration.hasMoreElements()) {
      let aColumn = enumeration.nextElement();
      width = width + aColumn.getMaxWidth();
    }
    return this.createHeaderSize(width);
  }
  static $clinit() {
    BasicTableHeaderUI.resizeCursor = Cursor.getPredefinedCursor(Cursor.E_RESIZE_CURSOR);
    BasicTableHeaderUI.focusListener = new (BasicTableHeaderUI$1())();
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code BasicTableHeaderUI}.
 */
export class BasicTableHeaderUI$MouseInputHandler extends JObject {
  mouseXOffset: number = 0;
  otherCursor: Cursor = null;
  /**
   * Constructs a {@code MouseInputHandler}.
   */
  _BasicTableHeaderUI$MouseInputHandler(): this {
    this.otherCursor = BasicTableHeaderUI.resizeCursor;
    return this;
  }
  mouseClicked(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    if (e.getClickCount() % 2 === 1 && SwingUtilities.isLeftMouseButton(e)) {
      let table = this.$outer.header.getTable();
      let sorter: RowSorter<any>;
      if (table != null && (sorter = table.getRowSorter()) != null) {
        let columnIndex = this.$outer.header.columnAtPoint(e.getPoint());
        if (columnIndex !== -1) {
          columnIndex = table.convertColumnIndexToModel(columnIndex);
          sorter.toggleSortOrder(columnIndex);
        }
      }
    }
  }
  getResizingColumn$Point$BasicTableHeaderUI_MouseInputHandler(p: Point): TableColumn {
    return this.getResizingColumn$Point$int$BasicTableHeaderUI_MouseInputHandler(p, this.$outer.header.columnAtPoint(p));
  }
  getResizingColumn$Point$int$BasicTableHeaderUI_MouseInputHandler(p: Point, column: number): TableColumn {
    if (column === -1) {
      return null;
    }
    let r = this.$outer.header.getHeaderRect(column);
    r.grow(-3, 0);
    if (r.contains$Point(p)) {
      return null;
    }
    let midPoint = (r.x_ + $J.idiv(r.width_, 2)) | 0;
    let columnIndex: number;
    if (this.$outer.header.getComponentOrientation().isLeftToRight()) {
      columnIndex = (p.x_ < midPoint) ? (column - 1) | 0 : column;
    } else {
      columnIndex = (p.x_ < midPoint) ? column : (column - 1) | 0;
    }
    if (columnIndex === -1) {
      return null;
    }
    return this.$outer.header.getColumnModel().getColumn(columnIndex);
  }
  mousePressed(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    this.$outer.header.setDraggedColumn(null);
    this.$outer.header.setResizingColumn(null);
    this.$outer.header.setDraggedDistance(0);
    let p = e.getPoint();
    let columnModel = this.$outer.header.getColumnModel();
    let index = this.$outer.header.columnAtPoint(p);
    if (index !== -1) {
      let resizingColumn = this.getResizingColumn$Point$int$BasicTableHeaderUI_MouseInputHandler(p, index);
      if (BasicTableHeaderUI.canResize(resizingColumn, this.$outer.header)) {
        this.$outer.header.setResizingColumn(resizingColumn);
        if (this.$outer.header.getComponentOrientation().isLeftToRight()) {
          this.mouseXOffset = (p.x_ - resizingColumn.getWidth()) | 0;
        } else {
          this.mouseXOffset = (p.x_ + resizingColumn.getWidth()) | 0;
        }
      } else if (this.$outer.header.getReorderingAllowed()) {
        let hitColumn = columnModel.getColumn(index);
        this.$outer.header.setDraggedColumn(hitColumn);
        this.mouseXOffset = p.x_;
      }
    }
    if (this.$outer.header.getReorderingAllowed()) {
      let oldRolloverColumn = this.$outer.rolloverColumn;
      this.$outer.rolloverColumn = -1;
      this.$outer.rolloverColumnUpdated(oldRolloverColumn, this.$outer.rolloverColumn);
    }
  }
  swapCursor(): void {
    let tmp = this.$outer.header.getCursor();
    this.$outer.header.setCursor$Cursor(this.otherCursor);
    this.otherCursor = tmp;
  }
  mouseMoved(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    if (BasicTableHeaderUI.canResize(this.getResizingColumn$Point$BasicTableHeaderUI_MouseInputHandler(e.getPoint()), this.$outer.header) !== (this.$outer.header.getCursor() === BasicTableHeaderUI.resizeCursor)) {
      this.swapCursor();
    }
    this.$outer.updateRolloverColumn(e);
  }
  mouseDragged(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    let mouseX = e.getX();
    let resizingColumn = this.$outer.header.getResizingColumn();
    let draggedColumn = this.$outer.header.getDraggedColumn();
    let headerLeftToRight = this.$outer.header.getComponentOrientation().isLeftToRight();
    if (resizingColumn != null) {
      let oldWidth = resizingColumn.getWidth();
      let newWidth: number;
      if (headerLeftToRight) {
        newWidth = (mouseX - this.mouseXOffset) | 0;
      } else {
        newWidth = (this.mouseXOffset - mouseX) | 0;
      }
      this.mouseXOffset = (this.mouseXOffset + this.$outer.changeColumnWidth(resizingColumn, this.$outer.header, oldWidth, newWidth)) | 0;
    } else if (draggedColumn != null) {
      let cm = this.$outer.header.getColumnModel();
      let draggedDistance = (mouseX - this.mouseXOffset) | 0;
      let direction = (draggedDistance < 0) ? -1 : 1;
      let columnIndex = this.$outer.viewIndexForColumn(draggedColumn);
      let newColumnIndex = (columnIndex + (headerLeftToRight ? direction : -direction)) | 0;
      if (0 <= newColumnIndex && newColumnIndex < cm.getColumnCount()) {
        let width = cm.getColumn(newColumnIndex).getWidth();
        if (Math.abs(draggedDistance) > ($J.idiv(width, 2))) {
          this.mouseXOffset = (this.mouseXOffset + Math.imul(direction, width)) | 0;
          this.$outer.header.setDraggedDistance((draggedDistance - Math.imul(direction, width)) | 0);
          let selectedIndex = SwingUtilities2.convertColumnIndexToModel(this.$outer.header.getColumnModel(), this.$outer.getSelectedColumnIndex());
          cm.moveColumn(columnIndex, newColumnIndex);
          this.$outer.selectColumn$int$boolean(SwingUtilities2.convertColumnIndexToView(this.$outer.header.getColumnModel(), selectedIndex), false);
          return;
        }
      }
      this.setDraggedDistance(draggedDistance, columnIndex);
    }
    this.$outer.updateRolloverColumn(e);
  }
  mouseReleased(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    this.setDraggedDistance(0, this.$outer.viewIndexForColumn(this.$outer.header.getDraggedColumn()));
    this.$outer.header.setResizingColumn(null);
    this.$outer.header.setDraggedColumn(null);
    this.$outer.updateRolloverColumn(e);
  }
  mouseEntered(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    this.$outer.updateRolloverColumn(e);
  }
  mouseExited(e: MouseEvent): void {
    if (!this.$outer.header.isEnabled()) {
      return;
    }
    let oldRolloverColumn = this.$outer.rolloverColumn;
    this.$outer.rolloverColumn = -1;
    this.$outer.rolloverColumnUpdated(oldRolloverColumn, this.$outer.rolloverColumn);
  }
  setDraggedDistance(draggedDistance: number, column: number): void {
    this.$outer.header.setDraggedDistance(draggedDistance);
    if (column !== -1) {
      this.$outer.header.getColumnModel().moveColumn(column, column);
    }
  }
}

export class BasicTableHeaderUI$Actions extends UIAction {
  static readonly TOGGLE_SORT_ORDER: string = 'toggleSortOrder';
  static readonly SELECT_COLUMN_TO_LEFT: string = 'selectColumnToLeft';
  static readonly SELECT_COLUMN_TO_RIGHT: string = 'selectColumnToRight';
  static readonly MOVE_COLUMN_LEFT: string = 'moveColumnLeft';
  static readonly MOVE_COLUMN_RIGHT: string = 'moveColumnRight';
  static readonly RESIZE_LEFT: string = 'resizeLeft';
  static readonly RESIZE_RIGHT: string = 'resizeRight';
  static readonly FOCUS_TABLE: string = 'focusTable';
  _BasicTableHeaderUI$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  accept(sender: any): boolean {
    if (sender instanceof JTableHeader) {
      let th = sender;
      let cm = th.getColumnModel();
      if (cm.getColumnCount() <= 0) {
        return false;
      }
      let key = this.getName();
      let ui = BasicLookAndFeel.getUIOfType(th.getUI(), $J.cls(BasicTableHeaderUI));
      if (ui != null) {
        if (key === BasicTableHeaderUI$Actions.MOVE_COLUMN_LEFT) {
          return th.getReorderingAllowed() && this.maybeMoveColumn(true, th, ui, false);
        } else if (key === BasicTableHeaderUI$Actions.MOVE_COLUMN_RIGHT) {
          return th.getReorderingAllowed() && this.maybeMoveColumn(false, th, ui, false);
        } else if (key === BasicTableHeaderUI$Actions.RESIZE_LEFT || key === BasicTableHeaderUI$Actions.RESIZE_RIGHT) {
          return BasicTableHeaderUI.canResize(cm.getColumn(ui.getSelectedColumnIndex()), th);
        } else if (key === BasicTableHeaderUI$Actions.FOCUS_TABLE) {
          return (th.getTable() != null);
        }
      }
    }
    return true;
  }
  actionPerformed(e: ActionEvent): void {
    let th = e.getSource();
    let ui = BasicLookAndFeel.getUIOfType(th.getUI(), $J.cls(BasicTableHeaderUI));
    if (ui == null) {
      return;
    }
    let name = this.getName();
    if (BasicTableHeaderUI$Actions.TOGGLE_SORT_ORDER === name) {
      let table = th.getTable();
      let sorter = table == null ? null : table.getRowSorter();
      if (sorter != null) {
        let columnIndex = ui.getSelectedColumnIndex();
        columnIndex = table.convertColumnIndexToModel(columnIndex);
        sorter.toggleSortOrder(columnIndex);
      }
    } else if (BasicTableHeaderUI$Actions.SELECT_COLUMN_TO_LEFT === name) {
      if (th.getComponentOrientation().isLeftToRight()) {
        ui.selectPreviousColumn(true);
      } else {
        ui.selectNextColumn(true);
      }
    } else if (BasicTableHeaderUI$Actions.SELECT_COLUMN_TO_RIGHT === name) {
      if (th.getComponentOrientation().isLeftToRight()) {
        ui.selectNextColumn(true);
      } else {
        ui.selectPreviousColumn(true);
      }
    } else if (BasicTableHeaderUI$Actions.MOVE_COLUMN_LEFT === name) {
      this.moveColumn(true, th, ui);
    } else if (BasicTableHeaderUI$Actions.MOVE_COLUMN_RIGHT === name) {
      this.moveColumn(false, th, ui);
    } else if (BasicTableHeaderUI$Actions.RESIZE_LEFT === name) {
      this.resize(true, th, ui);
    } else if (BasicTableHeaderUI$Actions.RESIZE_RIGHT === name) {
      this.resize(false, th, ui);
    } else if (BasicTableHeaderUI$Actions.FOCUS_TABLE === name) {
      let table = th.getTable();
      if (table != null) {
        table.requestFocusInWindow$();
      }
    }
  }
  moveColumn(leftArrow: boolean, th: JTableHeader, ui: BasicTableHeaderUI): void {
    this.maybeMoveColumn(leftArrow, th, ui, true);
  }
  maybeMoveColumn(leftArrow: boolean, th: JTableHeader, ui: BasicTableHeaderUI, doIt: boolean): boolean {
    let oldIndex = ui.getSelectedColumnIndex();
    let newIndex: number;
    if (th.getComponentOrientation().isLeftToRight()) {
      newIndex = leftArrow ? ui.selectPreviousColumn(doIt) : ui.selectNextColumn(doIt);
    } else {
      newIndex = leftArrow ? ui.selectNextColumn(doIt) : ui.selectPreviousColumn(doIt);
    }
    if (newIndex !== oldIndex) {
      if (doIt) {
        th.getColumnModel().moveColumn(oldIndex, newIndex);
      } else {
        return true;
      }
    }
    return false;
  }
  resize(leftArrow: boolean, th: JTableHeader, ui: BasicTableHeaderUI): void {
    let columnIndex = ui.getSelectedColumnIndex();
    let resizingColumn = th.getColumnModel().getColumn(columnIndex);
    th.setResizingColumn(resizingColumn);
    let oldWidth = resizingColumn.getWidth();
    let newWidth = oldWidth;
    if (th.getComponentOrientation().isLeftToRight()) {
      newWidth = (newWidth + (leftArrow ? -1 : 1)) | 0;
    } else {
      newWidth = (newWidth + (leftArrow ? 1 : -1)) | 0;
    }
    ui.changeColumnWidth(resizingColumn, th, oldWidth, newWidth);
  }
}

let $BasicTableHeaderUI$1: any = null;
/** An anonymous class (BasicTableHeaderUI.java:78). */
function BasicTableHeaderUI$1(): any {
  return $BasicTableHeaderUI$1 ??= $J.local(class extends JObject {
    focusGained(e: FocusEvent): void {
      this.repaintHeader(e.getSource());
    }
    focusLost(e: FocusEvent): void {
      this.repaintHeader(e.getSource());
    }
    repaintHeader(source: any): void {
      if (source instanceof JTableHeader) {
        let th = source;
        let ui = BasicLookAndFeel.getUIOfType(th.getUI(), $J.cls(BasicTableHeaderUI));
        if (ui == null) {
          return;
        }
        th.repaint$Rectangle(th.getHeaderRect(ui.getSelectedColumnIndex()));
      }
    }
  }, 'javax.swing.plaf.basic.BasicTableHeaderUI$1', ['java.awt.event.FocusListener']);
}

$J.define(BasicTableHeaderUI, 'javax.swing.plaf.basic.BasicTableHeaderUI', { kind: 'class', sup: 'javax.swing.plaf.TableHeaderUI', ctors: { '': '_BasicTableHeaderUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'selectColumn(int,boolean)': 'selectColumn$int$boolean', 'selectColumn(int)': 'selectColumn$int' }, clinit: true, lazy: ['resizeCursor', 'focusListener'] });
$J.define(BasicTableHeaderUI$MouseInputHandler, 'javax.swing.plaf.basic.BasicTableHeaderUI$MouseInputHandler', { kind: 'class', ifaces: ['javax.swing.event.MouseInputListener'], sup: 'java.lang.Object', ctors: { '': '_BasicTableHeaderUI$MouseInputHandler' }, meths: { 'getResizingColumn(java.awt.Point,int)': 'getResizingColumn$Point$int$BasicTableHeaderUI_MouseInputHandler', 'getResizingColumn(java.awt.Point)': 'getResizingColumn$Point$BasicTableHeaderUI_MouseInputHandler' }, inner: true });
$J.define(BasicTableHeaderUI$Actions, 'javax.swing.plaf.basic.BasicTableHeaderUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicTableHeaderUI$Actions' } });
$J.module(() => {
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  JComponent = $J.load('javax.swing.JComponent');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTable = $J.load('javax.swing.JTable');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  JTableHeader = $J.load('javax.swing.table.JTableHeader');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
