// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTableUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, StringBuilder } from '../../../../../jre/index.ts';
import { TableUI } from '../TableUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { TransferHandler } from '../../TransferHandler.ts';

let Color, Component$BaselineResizeBehavior, Dimension, Point, MouseEvent, Action, CellRendererPane, DefaultListSelectionModel, JComponent, JScrollPane, JTable, JTable$PrintMode, ListSelectionModel, LookAndFeel, SwingUtilities, Timer, UIManager, UIResource, BasicGraphicsUtils, BasicTableHeaderUI, BasicTransferable, DragRecognitionSupport, LazyActionMap, DefaultTableCellRenderer, DefaultLookup, SwingUtilities2;

/**
 * BasicTableUI implementation
 *
 * @author Philip Milne
 * @author Shannon Hickey (drag and drop)
 */
export class BasicTableUI extends TableUI {
  static BASELINE_COMPONENT_KEY: StringBuilder = null;
  /**
   * The instance of {@code JTable}.
   */
  table: JTable = null;
  /**
   * The instance of {@code CellRendererPane}.
   */
  rendererPane: CellRendererPane = null;
  /**
   * {@code KeyListener} that are attached to the {@code JTable}.
   */
  keyListener: KeyListener = null;
  /**
   * {@code FocusListener} that are attached to the {@code JTable}.
   */
  focusListener: FocusListener = null;
  /**
   * {@code MouseInputListener} that are attached to the {@code JTable}.
   */
  mouseInputListener: MouseInputListener = null;
  handler: BasicTableUI$Handler = null;
  /**
   * Local cache of Table's client property "Table.isFileList"
   */
  isFileList: boolean = false;
  static defaultTransferHandler: TransferHandler = null;
  /**
   * Constructs a {@code BasicTableUI}.
   */
  _BasicTableUI(): this {
    this._TableUI();
    this.isFileList = false;
    return this;
  }
  pointOutsidePrefSize(row: number, column: number, p: Point): boolean {
    if (!this.isFileList) {
      return false;
    }
    return SwingUtilities2.pointOutsidePrefSize(this.table, row, column, p);
  }
  getHandler(): BasicTableUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicTableUI$Handler().$o(this)._BasicTableUI$Handler();
    }
    return this.handler;
  }
  /**
   * Creates the key listener for handling keyboard navigation in the {@code JTable}.
   *
   * @return the key listener for handling keyboard navigation in the {@code JTable}
   */
  createKeyListener(): KeyListener {
    return null;
  }
  /**
   * Creates the focus listener for handling keyboard navigation in the {@code JTable}.
   *
   * @return the focus listener for handling keyboard navigation in the {@code JTable}
   */
  createFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Creates the mouse listener for the {@code JTable}.
   *
   * @return the mouse listener for the {@code JTable}
   */
  createMouseInputListener(): MouseInputListener {
    return this.getHandler();
  }
  /**
   * Returns a new instance of {@code BasicTableUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicTableUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicTableUI()._BasicTableUI();
  }
  installUI(c: JComponent): void {
    this.table = c;
    this.rendererPane = new CellRendererPane()._CellRendererPane();
    this.table.add$Component(this.rendererPane);
    this.installDefaults();
    this.installDefaults2();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Initialize JTable properties, e.g. font, foreground, and background.
   * The font, foreground, and background properties are only set if their
   * current value is either null or a UIResource, other properties are set
   * if the current value is null.
   *
   * @see #installUI
   */
  installDefaults(): void {
    LookAndFeel.installColorsAndFont(this.table, 'Table.background', 'Table.foreground', 'Table.font');
    LookAndFeel.installProperty(this.table, 'opaque', true);
    let sbg = this.table.getSelectionBackground();
    if (sbg == null || $J.isa(sbg, UIResource)) {
      sbg = UIManager.getColor$Object('Table.selectionBackground');
      this.table.setSelectionBackground(sbg != null ? sbg : UIManager.getColor$Object('textHighlight'));
    }
    let sfg = this.table.getSelectionForeground();
    if (sfg == null || $J.isa(sfg, UIResource)) {
      sfg = UIManager.getColor$Object('Table.selectionForeground');
      this.table.setSelectionForeground(sfg != null ? sfg : UIManager.getColor$Object('textHighlightText'));
    }
    let gridColor = this.table.getGridColor();
    if (gridColor == null || $J.isa(gridColor, UIResource)) {
      gridColor = UIManager.getColor$Object('Table.gridColor');
      this.table.setGridColor(gridColor != null ? gridColor : Color.GRAY);
    }
    let parent = SwingUtilities.getUnwrappedParent(this.table);
    var scrollPane;
    if (parent != null) {
      parent = parent.getParent();
      var scrollPane;
      if ((scrollPane = parent) instanceof JScrollPane) {
        LookAndFeel.installBorder(scrollPane, 'Table.scrollPaneBorder');
      }
    }
    this.isFileList = $J.equals(true, this.table.getClientProperty('Table.isFileList'));
  }
  installDefaults2(): void {
    let th = this.table.getTransferHandler();
    if (th == null || $J.isa(th, UIResource)) {
      this.table.setTransferHandler(BasicTableUI.defaultTransferHandler);
      if ($J.isa(this.table.getDropTarget(), UIResource)) {
        this.table.setDropTarget(null);
      }
    }
  }
  /**
   * Attaches listeners to the JTable.
   */
  installListeners(): void {
    this.focusListener = this.createFocusListener();
    this.keyListener = this.createKeyListener();
    this.mouseInputListener = this.createMouseInputListener();
    this.table.addFocusListener(this.focusListener);
    this.table.addKeyListener(this.keyListener);
    this.table.addMouseListener(this.mouseInputListener);
    this.table.addMouseMotionListener(this.mouseInputListener);
    this.table.addPropertyChangeListener$PropertyChangeListener($J.fn(this.getHandler(), 'propertyChange'));
    if (this.isFileList) {
      this.table.getSelectionModel().addListSelectionListener($J.fn(this.getHandler(), 'valueChanged'));
    }
  }
  /**
   * Register all keyboard actions on the JTable.
   */
  installKeyboardActions(): void {
    LazyActionMap.installLazyActionMap(this.table, $J.cls(BasicTableUI), 'Table.actionMap');
    let inputMap = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.table, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, inputMap);
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      let keyMap = DefaultLookup.get(this.table, this, 'Table.ancestorInputMap');
      let rtlKeyMap: InputMap;
      if (this.table.getComponentOrientation().isLeftToRight() || ((rtlKeyMap = DefaultLookup.get(this.table, this, 'Table.ancestorInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    }
    return null;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_COLUMN, 1, 0, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_COLUMN_CHANGE_LEAD, 1, 0, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_COLUMN, -1, 0, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_COLUMN_CHANGE_LEAD, -1, 0, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_ROW, 0, 1, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_ROW_CHANGE_LEAD, 0, 1, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_ROW, 0, -1, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_ROW_CHANGE_LEAD, 0, -1, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_COLUMN_EXTEND_SELECTION, 1, 0, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_COLUMN_EXTEND_SELECTION, -1, 0, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_ROW_EXTEND_SELECTION, 0, 1, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_ROW_EXTEND_SELECTION, 0, -1, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_UP_CHANGE_SELECTION, false, false, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_DOWN_CHANGE_SELECTION, false, true, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.FIRST_COLUMN, false, false, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.LAST_COLUMN, false, true, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_UP_EXTEND_SELECTION, true, false, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_DOWN_EXTEND_SELECTION, true, true, true, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.FIRST_COLUMN_EXTEND_SELECTION, true, false, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.LAST_COLUMN_EXTEND_SELECTION, true, true, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.FIRST_ROW, false, false, true, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.LAST_ROW, false, true, true, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.FIRST_ROW_EXTEND_SELECTION, true, false, true, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.LAST_ROW_EXTEND_SELECTION, true, true, true, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_COLUMN_CELL, 1, 0, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_COLUMN_CELL, -1, 0, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.NEXT_ROW_CELL, 0, 1, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$int$int$boolean$boolean(BasicTableUI$Actions.PREVIOUS_ROW_CELL, 0, -1, false, true));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.SELECT_ALL));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.CLEAR_SELECTION));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.CANCEL_EDITING));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.START_EDITING));
    map.put$Object$Action(TransferHandler.getCutAction().getValue$String(Action.NAME), TransferHandler.getCutAction());
    map.put$Object$Action(TransferHandler.getCopyAction().getValue$String(Action.NAME), TransferHandler.getCopyAction());
    map.put$Object$Action(TransferHandler.getPasteAction().getValue$String(Action.NAME), TransferHandler.getPasteAction());
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_LEFT_CHANGE_SELECTION, false, false, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_RIGHT_CHANGE_SELECTION, false, true, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_LEFT_EXTEND_SELECTION, true, false, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(BasicTableUI$Actions.SCROLL_RIGHT_EXTEND_SELECTION, true, true, false, false));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.ADD_TO_SELECTION));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.TOGGLE_AND_ANCHOR));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.EXTEND_TO));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.MOVE_SELECTION_TO));
    map.put$Action(new BasicTableUI$Actions()._BasicTableUI$Actions$String(BasicTableUI$Actions.FOCUS_HEADER));
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    this.table.remove$Component(this.rendererPane);
    this.rendererPane = null;
    this.table = null;
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    if ($J.isa(this.table.getTransferHandler(), UIResource)) {
      this.table.setTransferHandler(null);
    }
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    this.table.removeFocusListener(this.focusListener);
    this.table.removeKeyListener(this.keyListener);
    this.table.removeMouseListener(this.mouseInputListener);
    this.table.removeMouseMotionListener(this.mouseInputListener);
    this.table.removePropertyChangeListener$PropertyChangeListener($J.fn(this.getHandler(), 'propertyChange'));
    if (this.isFileList) {
      this.table.getSelectionModel().removeListSelectionListener($J.fn(this.getHandler(), 'valueChanged'));
    }
    this.focusListener = null;
    this.keyListener = null;
    this.mouseInputListener = null;
    this.handler = null;
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIInputMap(this.table, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
    SwingUtilities.replaceUIActionMap(this.table, null);
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
    let lafDefaults = UIManager.getLookAndFeelDefaults();
    let renderer = lafDefaults.get(BasicTableUI.BASELINE_COMPONENT_KEY);
    if (renderer == null) {
      let tcr = new DefaultTableCellRenderer()._DefaultTableCellRenderer();
      renderer = tcr.getTableCellRendererComponent(this.table, 'a', false, false, -1, -1);
      lafDefaults.put(BasicTableUI.BASELINE_COMPONENT_KEY, renderer);
    }
    renderer.setFont(this.table.getFont());
    let rowMargin = this.table.getRowMargin();
    return (renderer.getBaseline(2147483647, (this.table.getRowHeight$() - rowMargin) | 0) + $J.idiv(rowMargin, 2)) | 0;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
  }
  createTableSize(width: number): Dimension {
    let height = 0;
    let rowCount = this.table.getRowCount();
    if (rowCount > 0 && this.table.getColumnCount() > 0) {
      let r = this.table.getCellRect((rowCount - 1) | 0, 0, true);
      height = (r.y_ + r.height_) | 0;
    }
    let tmp = Math.abs(width);
    if (tmp > 2147483647) {
      tmp = 2147483647;
    }
    return new Dimension()._Dimension$int$int((tmp) | 0, height);
  }
  /**
   * Return the minimum size of the table. The minimum height is the
   * row height times the number of rows.
   * The minimum width is the sum of the minimum widths of each column.
   */
  getMinimumSize(c: JComponent): Dimension {
    let width = 0;
    let enumeration = this.table.getColumnModel().getColumns();
    while (enumeration.hasMoreElements()) {
      let aColumn = enumeration.nextElement();
      width = width + aColumn.getMinWidth();
    }
    return this.createTableSize(width);
  }
  /**
   * Return the preferred size of the table. The preferred height is the
   * row height times the number of rows.
   * The preferred width is the sum of the preferred widths of each column.
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let width = 0;
    let enumeration = this.table.getColumnModel().getColumns();
    while (enumeration.hasMoreElements()) {
      let aColumn = enumeration.nextElement();
      width = width + aColumn.getPreferredWidth();
    }
    return this.createTableSize(width);
  }
  /**
   * Return the maximum size of the table. The maximum height is the
   * row heighttimes the number of rows.
   * The maximum width is the sum of the maximum widths of each column.
   */
  getMaximumSize(c: JComponent): Dimension {
    let width = 0;
    let enumeration = this.table.getColumnModel().getColumns();
    while (enumeration.hasMoreElements()) {
      let aColumn = enumeration.nextElement();
      width = width + aColumn.getMaxWidth();
    }
    return this.createTableSize(width);
  }
  /**
   * Paint a representation of the <code>table</code> instance
   * that was set in installUI().
   */
  paint(g: Graphics, c: JComponent): void {
    let clip = g.getClipBounds$();
    let bounds = this.table.getBounds$();
    bounds.x_ = bounds.y_ = 0;
    if (this.table.getRowCount() <= 0 || this.table.getColumnCount() <= 0 || !bounds.intersects$Rectangle(clip)) {
      this.paintDropLines(g);
      return;
    }
    let ltr = this.table.getComponentOrientation().isLeftToRight();
    let upperLeft: Point;
    let lowerRight: Point;
    let visibleBounds = clip.intersection(bounds);
    upperLeft = visibleBounds.getLocation();
    lowerRight = new Point()._Point$int$int((visibleBounds.x_ + visibleBounds.width_ - 1) | 0, (visibleBounds.y_ + visibleBounds.height_ - 1) | 0);
    let rMin = this.table.rowAtPoint(upperLeft);
    let rMax = this.table.rowAtPoint(lowerRight);
    if (rMin === -1) {
      rMin = 0;
    }
    if (rMax === -1) {
      rMax = (this.table.getRowCount() - 1) | 0;
    }
    let printMode = this.table.getClientProperty('Table.printMode');
    if (printMode === JTable$PrintMode.FIT_WIDTH) {
      upperLeft = clip.getLocation();
      lowerRight = new Point()._Point$int$int((clip.x_ + clip.width_ - 1) | 0, (clip.y_ + clip.height_ - 1) | 0);
    }
    let cMin = this.table.columnAtPoint(ltr ? upperLeft : lowerRight);
    let cMax = this.table.columnAtPoint(ltr ? lowerRight : upperLeft);
    if (cMin === -1) {
      cMin = 0;
    }
    if (cMax === -1) {
      cMax = (this.table.getColumnCount() - 1) | 0;
    }
    let comp = SwingUtilities.getUnwrappedParent(this.table);
    if (comp != null) {
      comp = comp.getParent();
    }
    this.paintGrid(g, rMin, rMax, cMin, cMax);
    this.paintCells(g, rMin, rMax, cMin, cMax);
    this.paintDropLines(g);
  }
  paintDropLines(g: Graphics): void {
    let loc = this.table.getDropLocation();
    if (loc == null) {
      return;
    }
    let color = UIManager.getColor$Object('Table.dropLineColor');
    let shortColor = UIManager.getColor$Object('Table.dropLineShortColor');
    if (color == null && shortColor == null) {
      return;
    }
    let rect: Rectangle;
    rect = this.getHDropLineRect(loc);
    if (rect != null) {
      let x = rect.x_;
      let w = rect.width_;
      if (color != null) {
        this.extendRect(rect, true);
        g.setColor(color);
        g.fillRect(rect.x_, rect.y_, rect.width_, rect.height_);
      }
      if (!loc.isInsertColumn() && shortColor != null) {
        g.setColor(shortColor);
        g.fillRect(x, rect.y_, w, rect.height_);
      }
    }
    rect = this.getVDropLineRect(loc);
    if (rect != null) {
      let y = rect.y_;
      let h = rect.height_;
      if (color != null) {
        this.extendRect(rect, false);
        g.setColor(color);
        g.fillRect(rect.x_, rect.y_, rect.width_, rect.height_);
      }
      if (!loc.isInsertRow() && shortColor != null) {
        g.setColor(shortColor);
        g.fillRect(rect.x_, y, rect.width_, h);
      }
    }
  }
  getHDropLineRect(loc: JTable$DropLocation): Rectangle {
    if (!loc.isInsertRow()) {
      return null;
    }
    let row = loc.getRow();
    let col = loc.getColumn();
    if (col >= this.table.getColumnCount()) {
      col--;
    }
    let rect = this.table.getCellRect(row, col, true);
    if (row >= this.table.getRowCount()) {
      row--;
      let prevRect = this.table.getCellRect(row, col, true);
      rect.y_ = (prevRect.y_ + prevRect.height_) | 0;
    }
    if (rect.y_ === 0) {
      rect.y_ = -1;
    } else {
      rect.y_ = (rect.y_ - 2) | 0;
    }
    rect.height_ = 3;
    return rect;
  }
  getVDropLineRect(loc: JTable$DropLocation): Rectangle {
    if (!loc.isInsertColumn()) {
      return null;
    }
    let ltr = this.table.getComponentOrientation().isLeftToRight();
    let col = loc.getColumn();
    let rect = this.table.getCellRect(loc.getRow(), col, true);
    if (col >= this.table.getColumnCount()) {
      col--;
      rect = this.table.getCellRect(loc.getRow(), col, true);
      if (ltr) {
        rect.x_ = (rect.x_ + rect.width_) | 0;
      }
    } else if (!ltr) {
      rect.x_ = (rect.x_ + rect.width_) | 0;
    }
    if (rect.x_ === 0) {
      rect.x_ = -1;
    } else {
      rect.x_ = (rect.x_ - 2) | 0;
    }
    rect.width_ = 3;
    return rect;
  }
  extendRect(rect: Rectangle, horizontal: boolean): Rectangle {
    if (rect == null) {
      return rect;
    }
    if (horizontal) {
      rect.x_ = 0;
      rect.width_ = this.table.getWidth();
    } else {
      rect.y_ = 0;
      if (this.table.getRowCount() !== 0) {
        let lastRect = this.table.getCellRect((this.table.getRowCount() - 1) | 0, 0, true);
        rect.height_ = (lastRect.y_ + lastRect.height_) | 0;
      } else {
        rect.height_ = this.table.getHeight();
      }
    }
    return rect;
  }
  paintGrid(g: Graphics, rMin: number, rMax: number, cMin: number, cMax: number): void {
    g.setColor(this.table.getGridColor());
    let minCell = this.table.getCellRect(rMin, cMin, true);
    let maxCell = this.table.getCellRect(rMax, cMax, true);
    let damagedArea = minCell.union(maxCell);
    if (this.table.getShowHorizontalLines()) {
      let tableWidth = (damagedArea.x_ + damagedArea.width_) | 0;
      let y = damagedArea.y_;
      for (let row = rMin; row <= rMax; row++) {
        y = (y + this.table.getRowHeight$int(row)) | 0;
        SwingUtilities2.drawHLine(g, damagedArea.x_, (tableWidth - 1) | 0, (y - 1) | 0);
      }
    }
    if (this.table.getShowVerticalLines()) {
      let cm = this.table.getColumnModel();
      let tableHeight = (damagedArea.y_ + damagedArea.height_) | 0;
      let x: number;
      if (this.table.getComponentOrientation().isLeftToRight()) {
        x = damagedArea.x_;
        for (let column = cMin; column <= cMax; column++) {
          let w = cm.getColumn(column).getWidth();
          x = (x + w) | 0;
          SwingUtilities2.drawVLine(g, (x - 1) | 0, 0, (tableHeight - 1) | 0);
        }
      } else {
        x = damagedArea.x_;
        for (let column = cMax; column >= cMin; column--) {
          let w = cm.getColumn(column).getWidth();
          x = (x + w) | 0;
          SwingUtilities2.drawVLine(g, (x - 1) | 0, 0, (tableHeight - 1) | 0);
        }
      }
    }
  }
  viewIndexForColumn(aColumn: TableColumn): number {
    let cm = this.table.getColumnModel();
    for (let column = 0; column < cm.getColumnCount(); column++) {
      if (cm.getColumn(column) === aColumn) {
        return column;
      }
    }
    return -1;
  }
  paintCells(g: Graphics, rMin: number, rMax: number, cMin: number, cMax: number): void {
    let header = this.table.getTableHeader();
    let draggedColumn = (header == null) ? null : header.getDraggedColumn();
    let cm = this.table.getColumnModel();
    let columnMargin = cm.getColumnMargin();
    let cellRect: Rectangle;
    let aColumn: TableColumn;
    let columnWidth: number;
    if (this.table.getComponentOrientation().isLeftToRight()) {
      for (let row = rMin; row <= rMax; row++) {
        cellRect = this.table.getCellRect(row, cMin, false);
        for (let column = cMin; column <= cMax; column++) {
          aColumn = cm.getColumn(column);
          columnWidth = aColumn.getWidth();
          cellRect.width_ = (columnWidth - columnMargin) | 0;
          if (aColumn !== draggedColumn) {
            this.paintCell(g, cellRect, row, column);
          }
          cellRect.x_ = (cellRect.x_ + columnWidth) | 0;
        }
      }
    } else {
      for (let row = rMin; row <= rMax; row++) {
        cellRect = this.table.getCellRect(row, cMin, false);
        aColumn = cm.getColumn(cMin);
        if (aColumn !== draggedColumn) {
          columnWidth = aColumn.getWidth();
          cellRect.width_ = (columnWidth - columnMargin) | 0;
          this.paintCell(g, cellRect, row, cMin);
        }
        for (let column = (cMin + 1) | 0; column <= cMax; column++) {
          aColumn = cm.getColumn(column);
          columnWidth = aColumn.getWidth();
          cellRect.width_ = (columnWidth - columnMargin) | 0;
          cellRect.x_ = (cellRect.x_ - columnWidth) | 0;
          if (aColumn !== draggedColumn) {
            this.paintCell(g, cellRect, row, column);
          }
        }
      }
    }
    if (draggedColumn != null) {
      this.paintDraggedArea(g, rMin, rMax, draggedColumn, header.getDraggedDistance());
    }
    this.rendererPane.removeAll();
  }
  paintDraggedArea(g: Graphics, rMin: number, rMax: number, draggedColumn: TableColumn, distance: number): void {
    let draggedColumnIndex = this.viewIndexForColumn(draggedColumn);
    if (draggedColumnIndex === -1) {
      return;
    }
    let minCell = this.table.getCellRect(rMin, draggedColumnIndex, true);
    let maxCell = this.table.getCellRect(rMax, draggedColumnIndex, true);
    let vacatedColumnRect = minCell.union(maxCell);
    g.setColor(this.table.getParent().getBackground());
    g.fillRect(vacatedColumnRect.x_, vacatedColumnRect.y_, vacatedColumnRect.width_, vacatedColumnRect.height_);
    vacatedColumnRect.x_ = (vacatedColumnRect.x_ + distance) | 0;
    g.setColor(this.table.getBackground());
    g.fillRect(vacatedColumnRect.x_, vacatedColumnRect.y_, vacatedColumnRect.width_, vacatedColumnRect.height_);
    if (this.table.getShowVerticalLines()) {
      g.setColor(this.table.getGridColor());
      let x1 = vacatedColumnRect.x_;
      let y1 = vacatedColumnRect.y_;
      let x2 = (x1 + vacatedColumnRect.width_ - 1) | 0;
      let y2 = (y1 + vacatedColumnRect.height_ - 1) | 0;
      g.drawLine((x1 - 1) | 0, y1, (x1 - 1) | 0, y2);
      g.drawLine(x2, y1, x2, y2);
    }
    for (let row = rMin; row <= rMax; row++) {
      let r = this.table.getCellRect(row, draggedColumnIndex, false);
      r.x_ = (r.x_ + distance) | 0;
      this.paintCell(g, r, row, draggedColumnIndex);
      if (this.table.getShowHorizontalLines()) {
        g.setColor(this.table.getGridColor());
        let rcr = this.table.getCellRect(row, draggedColumnIndex, true);
        rcr.x_ = (rcr.x_ + distance) | 0;
        let x1 = rcr.x_;
        let y1 = rcr.y_;
        let x2 = (x1 + rcr.width_ - 1) | 0;
        let y2 = (y1 + rcr.height_ - 1) | 0;
        g.drawLine(x1, y2, x2, y2);
      }
    }
  }
  paintCell(g: Graphics, cellRect: Rectangle, row: number, column: number): void {
    if (this.table.isEditing() && this.table.getEditingRow() === row && this.table.getEditingColumn() === column) {
      let component = this.table.getEditorComponent();
      component.setBounds$Rectangle(cellRect);
      component.validate();
    } else {
      let renderer = this.table.getCellRenderer(row, column);
      let component = this.table.prepareRenderer(renderer, row, column);
      this.rendererPane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, component, this.table, cellRect.x_, cellRect.y_, cellRect.width_, cellRect.height_, true);
    }
  }
  static getAdjustedLead$JTable$boolean$ListSelectionModel(table: JTable, row: boolean, model: ListSelectionModel): number {
    let index = model.getLeadSelectionIndex();
    let compare = row ? table.getRowCount() : table.getColumnCount();
    return index < compare ? index : -1;
  }
  static getAdjustedLead$JTable$boolean(table: JTable, row: boolean): number {
    return row ? BasicTableUI.getAdjustedLead$JTable$boolean$ListSelectionModel(table, row, table.getSelectionModel()) : BasicTableUI.getAdjustedLead$JTable$boolean$ListSelectionModel(table, row, table.getColumnModel().getSelectionModel());
  }
  static $clinit() {
    BasicTableUI.BASELINE_COMPONENT_KEY = new StringBuilder('Table.baselineComponent');
    BasicTableUI.defaultTransferHandler = new BasicTableUI$TableTransferHandler()._BasicTableUI$TableTransferHandler();
  }
}

export class BasicTableUI$Actions extends UIAction {
  static readonly CANCEL_EDITING: string = 'cancel';
  static readonly SELECT_ALL: string = 'selectAll';
  static readonly CLEAR_SELECTION: string = 'clearSelection';
  static readonly START_EDITING: string = 'startEditing';
  static readonly NEXT_ROW: string = 'selectNextRow';
  static readonly NEXT_ROW_CELL: string = 'selectNextRowCell';
  static readonly NEXT_ROW_EXTEND_SELECTION: string = 'selectNextRowExtendSelection';
  static readonly NEXT_ROW_CHANGE_LEAD: string = 'selectNextRowChangeLead';
  static readonly PREVIOUS_ROW: string = 'selectPreviousRow';
  static readonly PREVIOUS_ROW_CELL: string = 'selectPreviousRowCell';
  static readonly PREVIOUS_ROW_EXTEND_SELECTION: string = 'selectPreviousRowExtendSelection';
  static readonly PREVIOUS_ROW_CHANGE_LEAD: string = 'selectPreviousRowChangeLead';
  static readonly NEXT_COLUMN: string = 'selectNextColumn';
  static readonly NEXT_COLUMN_CELL: string = 'selectNextColumnCell';
  static readonly NEXT_COLUMN_EXTEND_SELECTION: string = 'selectNextColumnExtendSelection';
  static readonly NEXT_COLUMN_CHANGE_LEAD: string = 'selectNextColumnChangeLead';
  static readonly PREVIOUS_COLUMN: string = 'selectPreviousColumn';
  static readonly PREVIOUS_COLUMN_CELL: string = 'selectPreviousColumnCell';
  static readonly PREVIOUS_COLUMN_EXTEND_SELECTION: string = 'selectPreviousColumnExtendSelection';
  static readonly PREVIOUS_COLUMN_CHANGE_LEAD: string = 'selectPreviousColumnChangeLead';
  static readonly SCROLL_LEFT_CHANGE_SELECTION: string = 'scrollLeftChangeSelection';
  static readonly SCROLL_LEFT_EXTEND_SELECTION: string = 'scrollLeftExtendSelection';
  static readonly SCROLL_RIGHT_CHANGE_SELECTION: string = 'scrollRightChangeSelection';
  static readonly SCROLL_RIGHT_EXTEND_SELECTION: string = 'scrollRightExtendSelection';
  static readonly SCROLL_UP_CHANGE_SELECTION: string = 'scrollUpChangeSelection';
  static readonly SCROLL_UP_EXTEND_SELECTION: string = 'scrollUpExtendSelection';
  static readonly SCROLL_DOWN_CHANGE_SELECTION: string = 'scrollDownChangeSelection';
  static readonly SCROLL_DOWN_EXTEND_SELECTION: string = 'scrollDownExtendSelection';
  static readonly FIRST_COLUMN: string = 'selectFirstColumn';
  static readonly FIRST_COLUMN_EXTEND_SELECTION: string = 'selectFirstColumnExtendSelection';
  static readonly LAST_COLUMN: string = 'selectLastColumn';
  static readonly LAST_COLUMN_EXTEND_SELECTION: string = 'selectLastColumnExtendSelection';
  static readonly FIRST_ROW: string = 'selectFirstRow';
  static readonly FIRST_ROW_EXTEND_SELECTION: string = 'selectFirstRowExtendSelection';
  static readonly LAST_ROW: string = 'selectLastRow';
  static readonly LAST_ROW_EXTEND_SELECTION: string = 'selectLastRowExtendSelection';
  static readonly ADD_TO_SELECTION: string = 'addToSelection';
  static readonly TOGGLE_AND_ANCHOR: string = 'toggleAndAnchor';
  static readonly EXTEND_TO: string = 'extendTo';
  static readonly MOVE_SELECTION_TO: string = 'moveSelectionTo';
  static readonly FOCUS_HEADER: string = 'focusHeader';
  dx: number = 0;
  dy: number = 0;
  extend: boolean = false;
  inSelection: boolean = false;
  forwards: boolean = false;
  vertically: boolean = false;
  toLimit: boolean = false;
  leadRow: number = 0;
  leadColumn: number = 0;
  _BasicTableUI$Actions$String(name: string): this {
    this._UIAction(name);
    return this;
  }
  _BasicTableUI$Actions$String$int$int$boolean$boolean(name: string, dx: number, dy: number, extend: boolean, inSelection: boolean): this {
    this._UIAction(name);
    if (inSelection) {
      this.inSelection = true;
      dx = $J.Integer_signum(dx);
      dy = $J.Integer_signum(dy);
      // assert (dx == 0 || dy == 0) && !(dx == 0 && dy == 0)
    }
    this.dx = dx;
    this.dy = dy;
    this.extend = extend;
    return this;
  }
  _BasicTableUI$Actions$String$boolean$boolean$boolean$boolean(name: string, extend: boolean, forwards: boolean, vertically: boolean, toLimit: boolean): this {
    this._BasicTableUI$Actions$String$int$int$boolean$boolean(name, 0, 0, extend, false);
    this.forwards = forwards;
    this.vertically = vertically;
    this.toLimit = toLimit;
    return this;
  }
  static clipToRange(i: number, a: number, b: number): number {
    return Math.min(Math.max(i, a), (b - 1) | 0);
  }
  moveWithinTableRange(table: JTable, dx: number, dy: number): void {
    this.leadRow = BasicTableUI$Actions.clipToRange((this.leadRow + dy) | 0, 0, table.getRowCount());
    this.leadColumn = BasicTableUI$Actions.clipToRange((this.leadColumn + dx) | 0, 0, table.getColumnCount());
  }
  /**
   * Called to move within the selected range of the given JTable.
   * This method uses the table's notion of selection, which is
   * important to allow the user to navigate between items visually
   * selected on screen. This notion may or may not be the same as
   * what could be determined by directly querying the selection models.
   * It depends on certain table properties (such as whether or not
   * row or column selection is allowed). When performing modifications,
   * it is recommended that caution be taken in order to preserve
   * the intent of this method, especially when deciding whether to
   * query the selection models or interact with JTable directly.
   */
  moveWithinSelectedRange(table: JTable, dx: number, dy: number, rsm: ListSelectionModel, csm: ListSelectionModel): boolean {
    let totalCount: number;
    let minX: number;
    let maxX: number;
    let minY: number;
    let maxY: number;
    let rs = table.getRowSelectionAllowed();
    let cs = table.getColumnSelectionAllowed();
    if (rs && cs) {
      totalCount = Math.imul(table.getSelectedRowCount(), table.getSelectedColumnCount());
      minX = csm.getMinSelectionIndex();
      maxX = csm.getMaxSelectionIndex();
      minY = rsm.getMinSelectionIndex();
      maxY = rsm.getMaxSelectionIndex();
    } else if (rs) {
      totalCount = table.getSelectedRowCount();
      minX = 0;
      maxX = (table.getColumnCount() - 1) | 0;
      minY = rsm.getMinSelectionIndex();
      maxY = rsm.getMaxSelectionIndex();
    } else if (cs) {
      totalCount = table.getSelectedColumnCount();
      minX = csm.getMinSelectionIndex();
      maxX = csm.getMaxSelectionIndex();
      minY = 0;
      maxY = (table.getRowCount() - 1) | 0;
    } else {
      totalCount = 0;
      minX = maxX = minY = maxY = 0;
    }
    let stayInSelection: boolean;
    if (totalCount === 0 || (totalCount === 1 && table.isCellSelected(this.leadRow, this.leadColumn))) {
      stayInSelection = false;
      maxX = (table.getColumnCount() - 1) | 0;
      maxY = (table.getRowCount() - 1) | 0;
      minX = Math.min(0, maxX);
      minY = Math.min(0, maxY);
    } else {
      stayInSelection = true;
    }
    if (dy === 1 && this.leadColumn === -1) {
      this.leadColumn = minX;
      this.leadRow = -1;
    } else if (dx === 1 && this.leadRow === -1) {
      this.leadRow = minY;
      this.leadColumn = -1;
    } else if (dy === -1 && this.leadColumn === -1) {
      this.leadColumn = maxX;
      this.leadRow = (maxY + 1) | 0;
    } else if (dx === -1 && this.leadRow === -1) {
      this.leadRow = maxY;
      this.leadColumn = (maxX + 1) | 0;
    }
    this.leadRow = Math.min(Math.max(this.leadRow, (minY - 1) | 0), (maxY + 1) | 0);
    this.leadColumn = Math.min(Math.max(this.leadColumn, (minX - 1) | 0), (maxX + 1) | 0);
    do {
      this.calcNextPos(dx, minX, maxX, dy, minY, maxY);
    } while (stayInSelection && !table.isCellSelected(this.leadRow, this.leadColumn));
    return stayInSelection;
  }
  /**
   * Find the next lead row and column based on the given
   * dx/dy and max/min values.
   */
  calcNextPos(dx: number, minX: number, maxX: number, dy: number, minY: number, maxY: number): void {
    if (dx !== 0) {
      this.leadColumn = (this.leadColumn + dx) | 0;
      if (this.leadColumn > maxX) {
        this.leadColumn = minX;
        this.leadRow++;
        if (this.leadRow > maxY) {
          this.leadRow = minY;
        }
      } else if (this.leadColumn < minX) {
        this.leadColumn = maxX;
        this.leadRow--;
        if (this.leadRow < minY) {
          this.leadRow = maxY;
        }
      }
    } else {
      this.leadRow = (this.leadRow + dy) | 0;
      if (this.leadRow > maxY) {
        this.leadRow = minY;
        this.leadColumn++;
        if (this.leadColumn > maxX) {
          this.leadColumn = minX;
        }
      } else if (this.leadRow < minY) {
        this.leadRow = maxY;
        this.leadColumn--;
        if (this.leadColumn < minX) {
          this.leadColumn = maxX;
        }
      }
    }
  }
  actionPerformed(e: ActionEvent): void {
    let key = this.getName();
    let table = e.getSource();
    let rsm = table.getSelectionModel();
    this.leadRow = BasicTableUI.getAdjustedLead$JTable$boolean$ListSelectionModel(table, true, rsm);
    let csm = table.getColumnModel().getSelectionModel();
    this.leadColumn = BasicTableUI.getAdjustedLead$JTable$boolean$ListSelectionModel(table, false, csm);
    if (key === BasicTableUI$Actions.SCROLL_LEFT_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_LEFT_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_RIGHT_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_RIGHT_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_UP_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_UP_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_DOWN_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_DOWN_EXTEND_SELECTION || key === BasicTableUI$Actions.FIRST_COLUMN || key === BasicTableUI$Actions.FIRST_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.FIRST_ROW || key === BasicTableUI$Actions.FIRST_ROW_EXTEND_SELECTION || key === BasicTableUI$Actions.LAST_COLUMN || key === BasicTableUI$Actions.LAST_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.LAST_ROW || key === BasicTableUI$Actions.LAST_ROW_EXTEND_SELECTION) {
      if (this.toLimit) {
        if (this.vertically) {
          let rowCount = table.getRowCount();
          this.dx = 0;
          this.dy = this.forwards ? rowCount : -rowCount;
        } else {
          let colCount = table.getColumnCount();
          this.dx = this.forwards ? colCount : -colCount;
          this.dy = 0;
        }
      } else {
        if (!(SwingUtilities.getUnwrappedParent(table).getParent() instanceof JScrollPane)) {
          return;
        }
        let delta = table.getParent().getSize$();
        if (this.vertically) {
          let r = table.getCellRect(this.leadRow, 0, true);
          if (this.forwards) {
            r.y_ = (r.y_ + Math.max(delta.height_, r.height_)) | 0;
          } else {
            r.y_ = (r.y_ - delta.height_) | 0;
          }
          this.dx = 0;
          let newRow = table.rowAtPoint(r.getLocation());
          if (newRow === -1 && this.forwards) {
            newRow = table.getRowCount();
          }
          this.dy = (newRow - this.leadRow) | 0;
        } else {
          let r = table.getCellRect(0, this.leadColumn, true);
          if (this.forwards) {
            r.x_ = (r.x_ + Math.max(delta.width_, r.width_)) | 0;
          } else {
            r.x_ = (r.x_ - delta.width_) | 0;
          }
          let newColumn = table.columnAtPoint(r.getLocation());
          if (newColumn === -1) {
            let ltr = table.getComponentOrientation().isLeftToRight();
            newColumn = this.forwards ? (ltr ? table.getColumnCount() : 0) : (ltr ? 0 : table.getColumnCount());
          }
          this.dx = (newColumn - this.leadColumn) | 0;
          this.dy = 0;
        }
      }
    }
    if (key === BasicTableUI$Actions.NEXT_ROW || key === BasicTableUI$Actions.NEXT_ROW_CELL || key === BasicTableUI$Actions.NEXT_ROW_EXTEND_SELECTION || key === BasicTableUI$Actions.NEXT_ROW_CHANGE_LEAD || key === BasicTableUI$Actions.NEXT_COLUMN || key === BasicTableUI$Actions.NEXT_COLUMN_CELL || key === BasicTableUI$Actions.NEXT_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.NEXT_COLUMN_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_ROW || key === BasicTableUI$Actions.PREVIOUS_ROW_CELL || key === BasicTableUI$Actions.PREVIOUS_ROW_EXTEND_SELECTION || key === BasicTableUI$Actions.PREVIOUS_ROW_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_COLUMN || key === BasicTableUI$Actions.PREVIOUS_COLUMN_CELL || key === BasicTableUI$Actions.PREVIOUS_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.PREVIOUS_COLUMN_CHANGE_LEAD || key === BasicTableUI$Actions.SCROLL_LEFT_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_LEFT_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_RIGHT_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_RIGHT_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_UP_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_UP_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_DOWN_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_DOWN_EXTEND_SELECTION || key === BasicTableUI$Actions.FIRST_COLUMN || key === BasicTableUI$Actions.FIRST_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.FIRST_ROW || key === BasicTableUI$Actions.FIRST_ROW_EXTEND_SELECTION || key === BasicTableUI$Actions.LAST_COLUMN || key === BasicTableUI$Actions.LAST_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.LAST_ROW || key === BasicTableUI$Actions.LAST_ROW_EXTEND_SELECTION) {
      if (table.isEditing() && !table.getCellEditor$().stopCellEditing()) {
        return;
      }
      let changeLead = false;
      if (key === BasicTableUI$Actions.NEXT_ROW_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_ROW_CHANGE_LEAD) {
        changeLead = (rsm.getSelectionMode() === ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
      } else if (key === BasicTableUI$Actions.NEXT_COLUMN_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_COLUMN_CHANGE_LEAD) {
        changeLead = (csm.getSelectionMode() === ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
      }
      if (changeLead) {
        this.moveWithinTableRange(table, this.dx, this.dy);
        if (this.dy !== 0) {
          (rsm).moveLeadSelectionIndex(this.leadRow);
          if (BasicTableUI.getAdjustedLead$JTable$boolean$ListSelectionModel(table, false, csm) === -1 && table.getColumnCount() > 0) {
            (csm).moveLeadSelectionIndex(0);
          }
        } else {
          (csm).moveLeadSelectionIndex(this.leadColumn);
          if (BasicTableUI.getAdjustedLead$JTable$boolean$ListSelectionModel(table, true, rsm) === -1 && table.getRowCount() > 0) {
            (rsm).moveLeadSelectionIndex(0);
          }
        }
        let cellRect = table.getCellRect(this.leadRow, this.leadColumn, false);
        if (cellRect != null) {
          table.scrollRectToVisible(cellRect);
        }
      } else if (!this.inSelection) {
        this.moveWithinTableRange(table, this.dx, this.dy);
        table.changeSelection(this.leadRow, this.leadColumn, false, this.extend);
      } else {
        if (table.getRowCount() <= 0 || table.getColumnCount() <= 0) {
          return;
        }
        if (this.moveWithinSelectedRange(table, this.dx, this.dy, rsm, csm)) {
          if (rsm.isSelectedIndex(this.leadRow)) {
            rsm.addSelectionInterval(this.leadRow, this.leadRow);
          } else {
            rsm.removeSelectionInterval(this.leadRow, this.leadRow);
          }
          if (csm.isSelectedIndex(this.leadColumn)) {
            csm.addSelectionInterval(this.leadColumn, this.leadColumn);
          } else {
            csm.removeSelectionInterval(this.leadColumn, this.leadColumn);
          }
          let cellRect = table.getCellRect(this.leadRow, this.leadColumn, false);
          if (cellRect != null) {
            table.scrollRectToVisible(cellRect);
          }
        } else {
          table.changeSelection(this.leadRow, this.leadColumn, false, false);
        }
      }
    } else if (key === BasicTableUI$Actions.CANCEL_EDITING) {
      if (table.isEditing()) {
        table.getCellEditor$().cancelCellEditing();
      }
      table.removeEditor();
    } else if (key === BasicTableUI$Actions.SELECT_ALL) {
      table.selectAll();
    } else if (key === BasicTableUI$Actions.CLEAR_SELECTION) {
      table.clearSelection();
    } else if (key === BasicTableUI$Actions.START_EDITING) {
      if (!table.hasFocus()) {
        let cellEditor = table.getCellEditor$();
        if (cellEditor != null && !cellEditor.stopCellEditing()) {
          return;
        }
        table.requestFocus$();
        return;
      }
      table.editCellAt$int$int$EventObject(this.leadRow, this.leadColumn, e);
      let editorComp = table.getEditorComponent();
      if (editorComp != null) {
        editorComp.requestFocus$();
      }
    } else if (key === BasicTableUI$Actions.ADD_TO_SELECTION) {
      if (!table.isCellSelected(this.leadRow, this.leadColumn)) {
        let oldAnchorRow = rsm.getAnchorSelectionIndex();
        let oldAnchorColumn = csm.getAnchorSelectionIndex();
        rsm.setValueIsAdjusting(true);
        csm.setValueIsAdjusting(true);
        table.changeSelection(this.leadRow, this.leadColumn, true, false);
        rsm.setAnchorSelectionIndex(oldAnchorRow);
        csm.setAnchorSelectionIndex(oldAnchorColumn);
        rsm.setValueIsAdjusting(false);
        csm.setValueIsAdjusting(false);
      }
    } else if (key === BasicTableUI$Actions.TOGGLE_AND_ANCHOR) {
      table.changeSelection(this.leadRow, this.leadColumn, true, false);
    } else if (key === BasicTableUI$Actions.EXTEND_TO) {
      table.changeSelection(this.leadRow, this.leadColumn, false, true);
    } else if (key === BasicTableUI$Actions.MOVE_SELECTION_TO) {
      table.changeSelection(this.leadRow, this.leadColumn, false, false);
    } else if (key === BasicTableUI$Actions.FOCUS_HEADER) {
      let th = table.getTableHeader();
      if (th != null) {
        let col = table.getSelectedColumn();
        if (col >= 0) {
          let thUI = th.getUI();
          if (thUI instanceof BasicTableHeaderUI) {
            (thUI).selectColumn$int(col);
          }
        }
        th.requestFocusInWindow$();
      }
    }
  }
  accept(sender: any): boolean {
    let key = this.getName();
    if (sender instanceof JTable && $J.equals(true, (sender).getClientProperty('Table.isFileList'))) {
      if (key === BasicTableUI$Actions.NEXT_COLUMN || key === BasicTableUI$Actions.NEXT_COLUMN_CELL || key === BasicTableUI$Actions.NEXT_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.NEXT_COLUMN_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_COLUMN || key === BasicTableUI$Actions.PREVIOUS_COLUMN_CELL || key === BasicTableUI$Actions.PREVIOUS_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.PREVIOUS_COLUMN_CHANGE_LEAD || key === BasicTableUI$Actions.SCROLL_LEFT_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_LEFT_EXTEND_SELECTION || key === BasicTableUI$Actions.SCROLL_RIGHT_CHANGE_SELECTION || key === BasicTableUI$Actions.SCROLL_RIGHT_EXTEND_SELECTION || key === BasicTableUI$Actions.FIRST_COLUMN || key === BasicTableUI$Actions.FIRST_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.LAST_COLUMN || key === BasicTableUI$Actions.LAST_COLUMN_EXTEND_SELECTION || key === BasicTableUI$Actions.NEXT_ROW_CELL || key === BasicTableUI$Actions.PREVIOUS_ROW_CELL) {
        return false;
      }
    }
    if (key === BasicTableUI$Actions.CANCEL_EDITING && sender instanceof JTable) {
      return (sender).isEditing();
    } else if (key === BasicTableUI$Actions.NEXT_ROW_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_ROW_CHANGE_LEAD) {
      return sender != null && (sender).getSelectionModel() instanceof DefaultListSelectionModel;
    } else if (key === BasicTableUI$Actions.NEXT_COLUMN_CHANGE_LEAD || key === BasicTableUI$Actions.PREVIOUS_COLUMN_CHANGE_LEAD) {
      return sender != null && (sender).getColumnModel().getSelectionModel() instanceof DefaultListSelectionModel;
    } else if (key === BasicTableUI$Actions.ADD_TO_SELECTION && sender instanceof JTable) {
      let table = sender;
      let leadRow = BasicTableUI.getAdjustedLead$JTable$boolean(table, true);
      let leadCol = BasicTableUI.getAdjustedLead$JTable$boolean(table, false);
      return !(table.isEditing() || table.isCellSelected(leadRow, leadCol));
    } else if (key === BasicTableUI$Actions.FOCUS_HEADER && sender instanceof JTable) {
      let table = sender;
      return table.getTableHeader() != null;
    }
    return true;
  }
}

export class BasicTableUI$Handler extends JObject {
  dispatchComponent: Component = null;
  pressedRow: number = 0;
  pressedCol: number = 0;
  pressedEvent: MouseEvent = null;
  dragPressDidSelection: boolean = false;
  dragStarted: boolean = false;
  shouldStartTimer: boolean = false;
  outsidePrefSize: boolean = false;
  timer: Timer = null;
  _BasicTableUI$Handler(): this {
    this.timer = null;
    return this;
  }
  repaintLeadCell(): void {
    let lr = BasicTableUI.getAdjustedLead$JTable$boolean(this.$outer.table, true);
    let lc = BasicTableUI.getAdjustedLead$JTable$boolean(this.$outer.table, false);
    if (lr < 0 || lc < 0) {
      return;
    }
    let dirtyRect = this.$outer.table.getCellRect(lr, lc, false);
    this.$outer.table.repaint$Rectangle(dirtyRect);
  }
  focusGained(e: FocusEvent): void {
    this.repaintLeadCell();
  }
  focusLost(e: FocusEvent): void {
    this.repaintLeadCell();
  }
  mouseClicked(e: MouseEvent): void {
  }
  setDispatchComponent(e: MouseEvent): void {
    let editorComponent = this.$outer.table.getEditorComponent();
    let p = e.getPoint();
    let p2 = SwingUtilities.convertPoint$Component$Point$Component(this.$outer.table, p, editorComponent);
    this.dispatchComponent = SwingUtilities.getDeepestComponentAt(editorComponent, p2.x_, p2.y_);
    SwingUtilities2.setSkipClickCount(this.dispatchComponent, (e.getClickCount() - 1) | 0);
  }
  repostEvent(e: MouseEvent): boolean {
    if (this.dispatchComponent == null || !this.$outer.table.isEditing()) {
      return false;
    }
    let e2 = SwingUtilities.convertMouseEvent(this.$outer.table, e, this.dispatchComponent);
    this.dispatchComponent.dispatchEvent(e2);
    return true;
  }
  setValueIsAdjusting(flag: boolean): void {
    this.$outer.table.getSelectionModel().setValueIsAdjusting(flag);
    this.$outer.table.getColumnModel().getSelectionModel().setValueIsAdjusting(flag);
  }
  canStartDrag(): boolean {
    if (this.pressedRow === -1 || this.pressedCol === -1) {
      return false;
    }
    if (this.$outer.isFileList) {
      return !this.outsidePrefSize;
    }
    if ((this.$outer.table.getSelectionModel().getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) && (this.$outer.table.getColumnModel().getSelectionModel().getSelectionMode() === ListSelectionModel.SINGLE_SELECTION)) {
      return true;
    }
    return this.$outer.table.isCellSelected(this.pressedRow, this.pressedCol);
  }
  mousePressed(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.table)) {
      return;
    }
    if (this.$outer.table.isEditing() && !this.$outer.table.getCellEditor$().stopCellEditing()) {
      let editorComponent = this.$outer.table.getEditorComponent();
      if (editorComponent != null && !editorComponent.hasFocus()) {
        SwingUtilities2.compositeRequestFocus(editorComponent);
      }
      return;
    }
    let p = e.getPoint();
    this.pressedRow = this.$outer.table.rowAtPoint(p);
    this.pressedCol = this.$outer.table.columnAtPoint(p);
    this.outsidePrefSize = this.$outer.pointOutsidePrefSize(this.pressedRow, this.pressedCol, p);
    if (this.$outer.isFileList) {
      this.shouldStartTimer = this.$outer.table.isCellSelected(this.pressedRow, this.pressedCol) && !e.isShiftDown() && !BasicGraphicsUtils.isMenuShortcutKeyDown(e) && !this.outsidePrefSize;
    }
    if (this.$outer.table.getDragEnabled()) {
      this.mousePressedDND(e);
    } else {
      SwingUtilities2.adjustFocus(this.$outer.table);
      if (!this.$outer.isFileList) {
        this.setValueIsAdjusting(true);
      }
      this.adjustSelection(e);
    }
  }
  mousePressedDND(e: MouseEvent): void {
    this.pressedEvent = e;
    let grabFocus = true;
    this.dragStarted = false;
    if (this.canStartDrag() && DragRecognitionSupport.mousePressed(e)) {
      this.dragPressDidSelection = false;
      if (BasicGraphicsUtils.isMenuShortcutKeyDown(e) && this.$outer.isFileList) {
        return;
      } else if (!e.isShiftDown() && this.$outer.table.isCellSelected(this.pressedRow, this.pressedCol)) {
        this.$outer.table.getSelectionModel().addSelectionInterval(this.pressedRow, this.pressedRow);
        this.$outer.table.getColumnModel().getSelectionModel().addSelectionInterval(this.pressedCol, this.pressedCol);
        return;
      }
      this.dragPressDidSelection = true;
      grabFocus = false;
    } else if (!this.$outer.isFileList) {
      this.setValueIsAdjusting(true);
    }
    if (grabFocus) {
      SwingUtilities2.adjustFocus(this.$outer.table);
    }
    this.adjustSelection(e);
  }
  adjustSelection(e: MouseEvent): void {
    if (this.outsidePrefSize) {
      if (e.getID() === MouseEvent.MOUSE_PRESSED && (!e.isShiftDown() || this.$outer.table.getSelectionModel().getSelectionMode() === ListSelectionModel.SINGLE_SELECTION)) {
        this.$outer.table.clearSelection();
        let tce = this.$outer.table.getCellEditor$();
        if (tce != null) {
          tce.stopCellEditing();
        }
      }
      return;
    }
    if ((this.pressedCol === -1) || (this.pressedRow === -1)) {
      return;
    }
    let dragEnabled = this.$outer.table.getDragEnabled();
    if (!dragEnabled && !this.$outer.isFileList && this.$outer.table.editCellAt$int$int$EventObject(this.pressedRow, this.pressedCol, e)) {
      this.setDispatchComponent(e);
      this.repostEvent(e);
    }
    let editor = this.$outer.table.getCellEditor$();
    if (dragEnabled || editor == null || editor.shouldSelectCell(e)) {
      this.$outer.table.changeSelection(this.pressedRow, this.pressedCol, BasicGraphicsUtils.isMenuShortcutKeyDown(e), e.isShiftDown());
    }
  }
  valueChanged(e: ListSelectionEvent): void {
    if (this.timer != null) {
      this.timer.stop();
      this.timer = null;
    }
  }
  actionPerformed(ae: ActionEvent): void {
    this.$outer.table.editCellAt$int$int$EventObject(this.pressedRow, this.pressedCol, null);
    let editorComponent = this.$outer.table.getEditorComponent();
    if (editorComponent != null && !editorComponent.hasFocus()) {
      SwingUtilities2.compositeRequestFocus(editorComponent);
    }
    return;
  }
  maybeStartTimer(): void {
    if (!this.shouldStartTimer) {
      return;
    }
    if (this.timer == null) {
      this.timer = new Timer()._Timer(1200, $J.fn(this, 'actionPerformed'));
      this.timer.setRepeats(false);
    }
    this.timer.start();
  }
  mouseReleased(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.table)) {
      return;
    }
    if (this.$outer.table.getDragEnabled()) {
      this.mouseReleasedDND(e);
    } else {
      if (this.$outer.isFileList) {
        this.maybeStartTimer();
      }
    }
    this.pressedEvent = null;
    this.repostEvent(e);
    this.dispatchComponent = null;
    this.setValueIsAdjusting(false);
  }
  mouseReleasedDND(e: MouseEvent): void {
    let me = DragRecognitionSupport.mouseReleased(e);
    if (me != null) {
      SwingUtilities2.adjustFocus(this.$outer.table);
      if (!this.dragPressDidSelection) {
        this.adjustSelection(me);
      }
    }
    if (!this.dragStarted) {
      if (this.$outer.isFileList) {
        this.maybeStartTimer();
        return;
      }
      let p = e.getPoint();
      if (this.pressedEvent != null && this.$outer.table.rowAtPoint(p) === this.pressedRow && this.$outer.table.columnAtPoint(p) === this.pressedCol && this.$outer.table.editCellAt$int$int$EventObject(this.pressedRow, this.pressedCol, this.pressedEvent)) {
        this.setDispatchComponent(this.pressedEvent);
        this.repostEvent(this.pressedEvent);
        let ce = this.$outer.table.getCellEditor$();
        if (ce != null) {
          ce.shouldSelectCell(this.pressedEvent);
        }
      }
    }
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  mouseMoved(e: MouseEvent): void {
  }
  dragStarting(me: MouseEvent): void {
    this.dragStarted = true;
    if (BasicGraphicsUtils.isMenuShortcutKeyDown(me) && this.$outer.isFileList) {
      this.$outer.table.getSelectionModel().addSelectionInterval(this.pressedRow, this.pressedRow);
      this.$outer.table.getColumnModel().getSelectionModel().addSelectionInterval(this.pressedCol, this.pressedCol);
    }
    this.pressedEvent = null;
  }
  mouseDragged(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.table)) {
      return;
    }
    if (this.$outer.table.getDragEnabled() && (DragRecognitionSupport.mouseDragged(e, this) || this.dragStarted)) {
      return;
    }
    this.repostEvent(e);
    if (this.$outer.isFileList || this.$outer.table.isEditing()) {
      return;
    }
    let p = e.getPoint();
    let row = this.$outer.table.rowAtPoint(p);
    let column = this.$outer.table.columnAtPoint(p);
    if ((column === -1) || (row === -1)) {
      return;
    }
    this.$outer.table.changeSelection(row, column, BasicGraphicsUtils.isMenuShortcutKeyDown(e), true);
  }
  propertyChange(event: PropertyChangeEvent): void {
    let changeName = event.getPropertyName();
    if ('componentOrientation' === changeName) {
      let inputMap = this.$outer.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
      SwingUtilities.replaceUIInputMap(this.$outer.table, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, inputMap);
      let header = this.$outer.table.getTableHeader();
      if (header != null) {
        header.setComponentOrientation(event.getNewValue());
      }
    } else if ('dropLocation' === changeName) {
      let oldValue = event.getOldValue();
      this.repaintDropLocation(oldValue);
      this.repaintDropLocation(this.$outer.table.getDropLocation());
    } else if ('Table.isFileList' === changeName) {
      this.$outer.isFileList = $J.equals(true, this.$outer.table.getClientProperty('Table.isFileList'));
      this.$outer.table.revalidate();
      this.$outer.table.repaint$();
      if (this.$outer.isFileList) {
        this.$outer.table.getSelectionModel().addListSelectionListener($J.fn(this.$outer.getHandler(), 'valueChanged'));
      } else {
        this.$outer.table.getSelectionModel().removeListSelectionListener($J.fn(this.$outer.getHandler(), 'valueChanged'));
        this.timer = null;
      }
    } else if ('selectionModel' === changeName) {
      if (this.$outer.isFileList) {
        let old = event.getOldValue();
        old.removeListSelectionListener($J.fn(this.$outer.getHandler(), 'valueChanged'));
        this.$outer.table.getSelectionModel().addListSelectionListener($J.fn(this.$outer.getHandler(), 'valueChanged'));
      }
    }
  }
  repaintDropLocation(loc: JTable$DropLocation): void {
    if (loc == null) {
      return;
    }
    if (!loc.isInsertRow() && !loc.isInsertColumn()) {
      let rect = this.$outer.table.getCellRect(loc.getRow(), loc.getColumn(), false);
      if (rect != null) {
        this.$outer.table.repaint$Rectangle(rect);
      }
      return;
    }
    if (loc.isInsertRow()) {
      let rect = this.$outer.extendRect(this.$outer.getHDropLineRect(loc), true);
      if (rect != null) {
        this.$outer.table.repaint$Rectangle(rect);
      }
    }
    if (loc.isInsertColumn()) {
      let rect = this.$outer.extendRect(this.$outer.getVDropLineRect(loc), false);
      if (rect != null) {
        this.$outer.table.repaint$Rectangle(rect);
      }
    }
  }
}

export class BasicTableUI$TableTransferHandler extends TransferHandler {
  _BasicTableUI$TableTransferHandler(): this {
    this._TransferHandler$();
    return this;
  }
  /**
   * Create a Transferable to use as the source for a data transfer.
   *
   * @param c  The component holding the data to be transferred.  This
   *  argument is provided to enable sharing of TransferHandlers by
   *  multiple components.
   * @return  The representation of the data to be transferred.
   */
  createTransferable(c: JComponent): Transferable {
    if (c instanceof JTable) {
      let table = c;
      let rows: number[];
      let cols: number[];
      if (!table.getRowSelectionAllowed() && !table.getColumnSelectionAllowed()) {
        return null;
      }
      if (!table.getRowSelectionAllowed()) {
        let rowCount = table.getRowCount();
        rows = $J.newArray(rowCount, 0);
        for (let counter = 0; counter < rowCount; counter++) {
          rows[counter] = counter;
        }
      } else {
        rows = table.getSelectedRows();
      }
      if (!table.getColumnSelectionAllowed()) {
        let colCount = table.getColumnCount();
        cols = $J.newArray(colCount, 0);
        for (let counter = 0; counter < colCount; counter++) {
          cols[counter] = counter;
        }
      } else {
        cols = table.getSelectedColumns();
      }
      if (rows == null || cols == null || rows.length === 0 || cols.length === 0) {
        return null;
      }
      let plainStr = new StringBuilder();
      let htmlStr = new StringBuilder();
      htmlStr.append('<html>\n<body>\n<table>\n');
      for (let row = 0; row < rows.length; row++) {
        htmlStr.append('<tr>\n');
        for (let col = 0; col < cols.length; col++) {
          let obj = table.getValueAt(rows[row], cols[col]);
          let val = ((obj == null) ? '' : $J.str(obj));
          plainStr.append(val).append(String.fromCharCode(9 /* \u0009 */));
          htmlStr.append('  <td>').append(val).append('</td>\n');
        }
        plainStr.deleteCharAt((plainStr.length() - 1) | 0).append(String.fromCharCode(10 /* \u000a */));
        htmlStr.append('</tr>\n');
      }
      plainStr.deleteCharAt((plainStr.length() - 1) | 0);
      htmlStr.append('</table>\n</body>\n</html>');
      return new BasicTransferable()._BasicTransferable(plainStr.toString(), htmlStr.toString());
    }
    return null;
  }
  getSourceActions(c: JComponent): number {
    return TransferHandler.COPY;
  }
}

$J.define(BasicTableUI, 'javax.swing.plaf.basic.BasicTableUI', { kind: 'class', sup: 'javax.swing.plaf.TableUI', ctors: { '': '_BasicTableUI' }, meths: { 'getAdjustedLead(javax.swing.JTable,boolean)': 'getAdjustedLead$JTable$boolean', 'getAdjustedLead(javax.swing.JTable,boolean,javax.swing.ListSelectionModel)': 'getAdjustedLead$JTable$boolean$ListSelectionModel', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' }, clinit: true, lazy: ['BASELINE_COMPONENT_KEY', 'defaultTransferHandler'] });
$J.define(BasicTableUI$Actions, 'javax.swing.plaf.basic.BasicTableUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String,boolean,boolean,boolean,boolean': '_BasicTableUI$Actions$String$boolean$boolean$boolean$boolean', 'java.lang.String,int,int,boolean,boolean': '_BasicTableUI$Actions$String$int$int$boolean$boolean', 'java.lang.String': '_BasicTableUI$Actions$String' } });
$J.define(BasicTableUI$Handler, 'javax.swing.plaf.basic.BasicTableUI$Handler', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'javax.swing.event.MouseInputListener', 'java.beans.PropertyChangeListener', 'javax.swing.event.ListSelectionListener', 'java.awt.event.ActionListener', 'javax.swing.plaf.basic.DragRecognitionSupport$BeforeDrag'], sup: 'java.lang.Object', ctors: { '': '_BasicTableUI$Handler' }, inner: true });
$J.define(BasicTableUI$TableTransferHandler, 'javax.swing.plaf.basic.BasicTableUI$TableTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.TransferHandler', ctors: { '': '_BasicTableUI$TableTransferHandler' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  Action = $J.load('javax.swing.Action');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  JComponent = $J.load('javax.swing.JComponent');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTable = $J.load('javax.swing.JTable');
  JTable$PrintMode = $J.load('javax.swing.JTable$PrintMode');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicTableHeaderUI = $J.load('javax.swing.plaf.basic.BasicTableHeaderUI');
  BasicTransferable = $J.load('javax.swing.plaf.basic.BasicTransferable');
  DragRecognitionSupport = $J.load('javax.swing.plaf.basic.DragRecognitionSupport');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultTableCellRenderer = $J.load('javax.swing.table.DefaultTableCellRenderer');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
