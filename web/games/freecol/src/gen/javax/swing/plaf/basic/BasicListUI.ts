// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicListUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2018, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, JString, StringBuilder } from '../../../../../jre/index.ts';
import { ListUI } from '../ListUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { TransferHandler } from '../../TransferHandler.ts';

let Component$BaselineResizeBehavior, Dimension, Point, Rectangle, MouseEvent, Point2D, Action, CellRendererPane, DefaultListCellRenderer, DefaultListSelectionModel, JComponent, JList, KeyStroke, ListSelectionModel, LookAndFeel, SwingUtilities, UIManager, UIResource, BasicGraphicsUtils, BasicLookAndFeel, BasicTransferable, DragRecognitionSupport, LazyActionMap, Position$Bias, DefaultLookup, SwingUtilities2;

/**
 * An extensible implementation of {@code ListUI}.
 * <p>
 * {@code BasicListUI} instances cannot be shared between multiple
 * lists.
 *
 * @author Hans Muller
 * @author Philip Milne
 * @author Shannon Hickey (drag and drop)
 */
export class BasicListUI extends ListUI {
  static BASELINE_COMPONENT_KEY: StringBuilder = null;
  /**
   * The instance of {@code JList}.
   */
  list: JList<any> = null;
  /**
   * The instance of {@code CellRendererPane}.
   */
  rendererPane: CellRendererPane = null;
  /**
   * {@code FocusListener} that attached to {@code JList}.
   */
  focusListener: FocusListener = null;
  /**
   * {@code MouseInputListener} that attached to {@code JList}.
   */
  mouseInputListener: MouseInputListener = null;
  /**
   * {@code ListSelectionListener} that attached to {@code JList}.
   */
  listSelectionListener: ListSelectionListener = null;
  /**
   * {@code ListDataListener} that attached to {@code JList}.
   */
  listDataListener: ListDataListener = null;
  /**
   * {@code PropertyChangeListener} that attached to {@code JList}.
   */
  propertyChangeListener: PropertyChangeListener = null;
  handler: BasicListUI$Handler = null;
  /**
   * The array of cells' height
   */
  cellHeights: number[] = null;
  /**
   * The height of cell.
   */
  cellHeight: number = 0;
  /**
   * The width of cell.
   */
  cellWidth: number = 0;
  /**
   * The value represents changes to {@code JList} model.
   */
  updateLayoutStateNeeded: number = 0;
  /**
   * Height of the list. When asked to paint, if the current size of
   * the list differs, this will update the layout state.
   */
  listHeight: number = 0;
  /**
   * Width of the list. When asked to paint, if the current size of
   * the list differs, this will update the layout state.
   */
  listWidth: number = 0;
  /**
   * The layout orientation of the list.
   */
  layoutOrientation: number = 0;
  /**
   * Number of columns to create.
   */
  columnCount: number = 0;
  /**
   * Preferred height to make the list, this is only used if the
   * the list is laid out horizontally.
   */
  preferredHeight: number = 0;
  /**
   * Number of rows per column. This is only used if the row height is
   * fixed.
   */
  rowsPerColumn: number = 0;
  /**
   * The time factor to treat the series of typed alphanumeric key
   * as prefix for first letter navigation.
   */
  timeFactor: number = 0;
  /**
   * Local cache of JList's client property "List.isFileList"
   */
  isFileList: boolean = false;
  /**
   * Local cache of JList's component orientation property
   */
  isLeftToRight_: boolean = false;
  /**
   * The bit relates to model changed property.
   */
  static readonly modelChanged: number = 1;
  /**
   * The bit relates to selection model changed property.
   */
  static readonly selectionModelChanged: number = 2;
  /**
   * The bit relates to font changed property.
   */
  static readonly fontChanged: number = 4;
  /**
   * The bit relates to fixed cell width changed property.
   */
  static readonly fixedCellWidthChanged: number = 8;
  /**
   * The bit relates to fixed cell height changed property.
   */
  static readonly fixedCellHeightChanged: number = 16;
  /**
   * The bit relates to prototype cell value changed property.
   */
  static readonly prototypeCellValueChanged: number = 32;
  /**
   * The bit relates to cell renderer changed property.
   */
  static readonly cellRendererChanged: number = 64;
  static readonly layoutOrientationChanged: number = 128;
  static readonly heightChanged: number = 256;
  static readonly widthChanged: number = 512;
  static readonly componentOrientationChanged: number = 1024;
  static readonly DROP_LINE_THICKNESS: number = 2;
  /**
   * Used by IncrementLeadSelectionAction. Indicates the action should
   * change the lead, and not select it.
   */
  static readonly CHANGE_LEAD: number = 0;
  /**
   * Used by IncrementLeadSelectionAction. Indicates the action should
   * change the selection and lead.
   */
  static readonly CHANGE_SELECTION: number = 1;
  /**
   * Used by IncrementLeadSelectionAction. Indicates the action should
   * extend the selection from the anchor to the next index.
   */
  static readonly EXTEND_SELECTION: number = 2;
  static defaultTransferHandler: TransferHandler = null;
  /**
   * Constructs a {@code BasicListUI}.
   */
  _BasicListUI(): this {
    this._ListUI();
    this.list = null;
    this.cellHeights = null;
    this.cellHeight = -1;
    this.cellWidth = -1;
    this.updateLayoutStateNeeded = BasicListUI.modelChanged;
    this.timeFactor = 1000;
    this.isFileList = false;
    this.isLeftToRight_ = true;
    return this;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_PREVIOUS_COLUMN));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_PREVIOUS_COLUMN_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_PREVIOUS_COLUMN_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_NEXT_COLUMN));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_NEXT_COLUMN_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_NEXT_COLUMN_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_PREVIOUS_ROW));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_PREVIOUS_ROW_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_PREVIOUS_ROW_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_NEXT_ROW));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_NEXT_ROW_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_NEXT_ROW_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_FIRST_ROW));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_FIRST_ROW_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_FIRST_ROW_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_LAST_ROW));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_LAST_ROW_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_LAST_ROW_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SCROLL_UP));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SCROLL_UP_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SCROLL_UP_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SCROLL_DOWN));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SCROLL_DOWN_EXTEND));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SCROLL_DOWN_CHANGE_LEAD));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.SELECT_ALL));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.CLEAR_SELECTION));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.ADD_TO_SELECTION));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.TOGGLE_AND_ANCHOR));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.EXTEND_TO));
    map.put$Action(new BasicListUI$Actions()._BasicListUI$Actions(BasicListUI$Actions.MOVE_SELECTION_TO));
    map.put$Object$Action(TransferHandler.getCutAction().getValue$String(Action.NAME), TransferHandler.getCutAction());
    map.put$Object$Action(TransferHandler.getCopyAction().getValue$String(Action.NAME), TransferHandler.getCopyAction());
    map.put$Object$Action(TransferHandler.getPasteAction().getValue$String(Action.NAME), TransferHandler.getPasteAction());
  }
  /**
   * Paint one List cell: compute the relevant state, get the "rubber stamp"
   * cell renderer component, and then use the {@code CellRendererPane} to paint it.
   * Subclasses may want to override this method rather than {@code paint()}.
   *
   * @param g an instance of {@code Graphics}
   * @param row a row
   * @param rowBounds a bounding rectangle to render to
   * @param cellRenderer a list of {@code ListCellRenderer}
   * @param dataModel a list model
   * @param selModel a selection model
   * @param leadIndex a lead index
   * @see #paint
   */
  paintCell(g: Graphics, row: number, rowBounds: Rectangle, cellRenderer: ListCellRenderer<any>, dataModel: ListModel<any>, selModel: ListSelectionModel, leadIndex: number): void {
    let value = dataModel.getElementAt(row);
    let cellHasFocus = this.list.hasFocus() && (row === leadIndex);
    let isSelected = selModel.isSelectedIndex(row);
    let rendererComponent = cellRenderer.getListCellRendererComponent(this.list, value, row, isSelected, cellHasFocus);
    let cx = rowBounds.x_;
    let cy = rowBounds.y_;
    let cw = rowBounds.width_;
    let ch = rowBounds.height_;
    if (this.isFileList) {
      let w = Math.min(cw, (rendererComponent.getPreferredSize$().width_ + 4) | 0);
      if (!this.isLeftToRight_) {
        cx = (cx + (cw - w)) | 0;
      }
      cw = w;
    }
    this.rendererPane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, rendererComponent, this.list, cx, cy, cw, ch, true);
  }
  /**
   * Paint the rows that intersect the Graphics objects clipRect.  This
   * method calls paintCell as necessary.  Subclasses
   * may want to override these methods.
   *
   * @see #paintCell
   */
  paint(g: Graphics, c: JComponent): void {
    let clip = g.getClip();
    this.paintImpl(g, c);
    g.setClip$Shape(clip);
    this.paintDropLine(g);
  }
  paintImpl(g: Graphics, c: JComponent): void {
    switch (this.layoutOrientation) {
      case JList.VERTICAL_WRAP:
        if (this.list.getHeight() !== this.listHeight) {
          this.updateLayoutStateNeeded |= BasicListUI.heightChanged;
          this.redrawList();
        }
        break;
      case JList.HORIZONTAL_WRAP:
        if (this.list.getWidth() !== this.listWidth) {
          this.updateLayoutStateNeeded |= BasicListUI.widthChanged;
          this.redrawList();
        }
        break;
      default:
        break;
    }
    this.maybeUpdateLayoutState();
    let renderer = this.list.getCellRenderer();
    let dataModel = this.list.getModel();
    let selModel = this.list.getSelectionModel();
    let size: number;
    if ((renderer == null) || (size = dataModel.getSize()) === 0) {
      return;
    }
    let paintBounds = g.getClipBounds$();
    let startColumn: number;
    let endColumn: number;
    if (c.getComponentOrientation().isLeftToRight()) {
      startColumn = this.convertLocationToColumn(paintBounds.x_, paintBounds.y_);
      endColumn = this.convertLocationToColumn((paintBounds.x_ + paintBounds.width_) | 0, paintBounds.y_);
    } else {
      startColumn = this.convertLocationToColumn((paintBounds.x_ + paintBounds.width_) | 0, paintBounds.y_);
      endColumn = this.convertLocationToColumn(paintBounds.x_, paintBounds.y_);
    }
    let maxY = (paintBounds.y_ + paintBounds.height_) | 0;
    let leadIndex = BasicListUI.adjustIndex(this.list.getLeadSelectionIndex(), this.list);
    let rowIncrement = (this.layoutOrientation === JList.HORIZONTAL_WRAP) ? this.columnCount : 1;
    for (let colCounter = startColumn; colCounter <= endColumn; colCounter++) {
      let row = this.convertLocationToRowInColumn(paintBounds.y_, colCounter);
      let rowCount = this.getRowCount(colCounter);
      let index = this.getModelIndex(colCounter, row);
      let rowBounds = this.getCellBounds$JList$int$int(this.list, index, index);
      if (rowBounds == null) {
        return;
      }
      while (row < rowCount && rowBounds.y_ < maxY && index < size) {
        rowBounds.height_ = this.getHeight(colCounter, row);
        g.setClip$int$int$int$int(rowBounds.x_, rowBounds.y_, rowBounds.width_, rowBounds.height_);
        g.clipRect(paintBounds.x_, paintBounds.y_, paintBounds.width_, paintBounds.height_);
        this.paintCell(g, index, rowBounds, renderer, dataModel, selModel, leadIndex);
        rowBounds.y_ = (rowBounds.y_ + rowBounds.height_) | 0;
        index = (index + rowIncrement) | 0;
        row++;
      }
    }
    this.rendererPane.removeAll();
  }
  paintDropLine(g: Graphics): void {
    let loc = this.list.getDropLocation();
    if (loc == null || !loc.isInsert()) {
      return;
    }
    let c = DefaultLookup.getColor$JComponent$ComponentUI$String$Color(this.list, this, 'List.dropLineColor', null);
    if (c != null) {
      g.setColor(c);
      let rect = this.getDropLineRect(loc);
      g.fillRect(rect.x_, rect.y_, rect.width_, rect.height_);
    }
  }
  getDropLineRect(loc: JList$DropLocation): Rectangle {
    let size = this.list.getModel().getSize();
    if (size === 0) {
      let insets = this.list.getInsets$();
      if (this.layoutOrientation === JList.HORIZONTAL_WRAP) {
        if (this.isLeftToRight_) {
          return new Rectangle()._Rectangle$int$int$int$int(insets.left, insets.top, BasicListUI.DROP_LINE_THICKNESS, 20);
        } else {
          return new Rectangle()._Rectangle$int$int$int$int((this.list.getWidth() - BasicListUI.DROP_LINE_THICKNESS - insets.right) | 0, insets.top, BasicListUI.DROP_LINE_THICKNESS, 20);
        }
      } else {
        return new Rectangle()._Rectangle$int$int$int$int(insets.left, insets.top, (this.list.getWidth() - insets.left - insets.right) | 0, BasicListUI.DROP_LINE_THICKNESS);
      }
    }
    let rect = null;
    let index = loc.getIndex();
    let decr = false;
    if (this.layoutOrientation === JList.HORIZONTAL_WRAP) {
      if (index === size) {
        decr = true;
      } else if (index !== 0 && this.convertModelToRow(index) !== (this.convertModelToRow((index - 1) | 0))) {
        let prev = this.getCellBounds$JList$int$BasicListUI(this.list, (index - 1) | 0);
        let me = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        let p = loc.getDropPoint();
        if (this.isLeftToRight_) {
          decr = Point2D.distance((prev.x_ + prev.width_) | 0, (prev.y_ + $J.d2i((prev.height_ / 2))) | 0, p.x_, p.y_) < Point2D.distance(me.x_, (me.y_ + $J.d2i((me.height_ / 2))) | 0, p.x_, p.y_);
        } else {
          decr = Point2D.distance(prev.x_, (prev.y_ + $J.d2i((prev.height_ / 2))) | 0, p.x_, p.y_) < Point2D.distance((me.x_ + me.width_) | 0, (me.y_ + $J.d2i((prev.height_ / 2))) | 0, p.x_, p.y_);
        }
      }
      if (decr) {
        index--;
        rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        if (this.isLeftToRight_) {
          rect.x_ = (rect.x_ + rect.width_) | 0;
        } else {
          rect.x_ = (rect.x_ - BasicListUI.DROP_LINE_THICKNESS) | 0;
        }
      } else {
        rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        if (!this.isLeftToRight_) {
          rect.x_ = (rect.x_ + (rect.width_ - BasicListUI.DROP_LINE_THICKNESS)) | 0;
        }
      }
      if (rect.x_ >= this.list.getWidth()) {
        rect.x_ = (this.list.getWidth() - BasicListUI.DROP_LINE_THICKNESS) | 0;
      } else if (rect.x_ < 0) {
        rect.x_ = 0;
      }
      rect.width_ = BasicListUI.DROP_LINE_THICKNESS;
    } else if (this.layoutOrientation === JList.VERTICAL_WRAP) {
      if (index === size) {
        index--;
        rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        rect.y_ = (rect.y_ + rect.height_) | 0;
      } else if (index !== 0 && this.convertModelToColumn(index) !== (this.convertModelToColumn((index - 1) | 0))) {
        let prev = this.getCellBounds$JList$int$BasicListUI(this.list, (index - 1) | 0);
        let me = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        let p = loc.getDropPoint();
        if (Point2D.distance((prev.x_ + $J.d2i((prev.width_ / 2))) | 0, (prev.y_ + prev.height_) | 0, p.x_, p.y_) < Point2D.distance((me.x_ + $J.d2i((me.width_ / 2))) | 0, me.y_, p.x_, p.y_)) {
          index--;
          rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
          rect.y_ = (rect.y_ + rect.height_) | 0;
        } else {
          rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        }
      } else {
        rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
      }
      if (rect.y_ >= this.list.getHeight()) {
        rect.y_ = (this.list.getHeight() - BasicListUI.DROP_LINE_THICKNESS) | 0;
      }
      rect.height_ = BasicListUI.DROP_LINE_THICKNESS;
    } else {
      if (index === size) {
        index--;
        rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
        rect.y_ = (rect.y_ + rect.height_) | 0;
      } else {
        rect = this.getCellBounds$JList$int$BasicListUI(this.list, index);
      }
      if (rect.y_ >= this.list.getHeight()) {
        rect.y_ = (this.list.getHeight() - BasicListUI.DROP_LINE_THICKNESS) | 0;
      }
      rect.height_ = BasicListUI.DROP_LINE_THICKNESS;
    }
    return rect;
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
    let rowHeight = this.list.getFixedCellHeight();
    let lafDefaults = UIManager.getLookAndFeelDefaults();
    let renderer = lafDefaults.get(BasicListUI.BASELINE_COMPONENT_KEY);
    if (renderer == null) {
      let lcr = UIManager.get$Object('List.cellRenderer');
      if (lcr == null) {
        lcr = new DefaultListCellRenderer()._DefaultListCellRenderer();
      }
      renderer = lcr.getListCellRendererComponent(this.list, 'a', -1, false, false);
      lafDefaults.put(BasicListUI.BASELINE_COMPONENT_KEY, renderer);
    }
    renderer.setFont(this.list.getFont());
    if (rowHeight === -1) {
      rowHeight = renderer.getPreferredSize$().height_;
    }
    return (renderer.getBaseline(2147483647, rowHeight) + this.list.getInsets$().top) | 0;
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
  /**
   * The preferredSize of the list depends upon the layout orientation.
   *
   * <table class="striped">
   * <caption>Describes the preferred size for each layout orientation
   * </caption>
   * <thead>
   *   <tr>
   *     <th scope="col">Layout Orientation
   *     <th scope="col">Preferred Size
   * </thead>
   * <tbody>
   *   <tr>
   *     <th scope="row">JList.VERTICAL
   *     <td>The preferredSize of the list is total height of the rows
   *     and the maximum width of the cells. If JList.fixedCellHeight
   *     is specified then the total height of the rows is just
   *     (cellVerticalMargins + fixedCellHeight) * model.getSize() where
   *     rowVerticalMargins is the space we allocate for drawing
   *     the yellow focus outline. Similarly if fixedCellWidth is
   *     specified then we just use that.
   *   <tr>
   *     <th scope="row">JList.VERTICAL_WRAP
   *     <td>If the visible row count is greater than zero, the preferredHeight
   *     is the maximum cell height * visibleRowCount. If the visible row
   *     count is &lt;= 0, the preferred height is either the current height
   *     of the list, or the maximum cell height, whichever is
   *     bigger. The preferred width is than the maximum cell width *
   *     number of columns needed. Where the number of columns needs is
   *     list.height / max cell height. Max cell height is either the fixed
   *     cell height, or is determined by iterating through all the cells
   *     to find the maximum height from the ListCellRenderer.
   *   <tr>
   *     <th scope="row">JList.HORIZONTAL_WRAP
   *     <td>If the visible row count is greater than zero, the preferredHeight
   *     is the maximum cell height * adjustedRowCount. Where
   *     visibleRowCount is used to determine the number of columns.
   *     Because this lays out horizontally the number of rows is
   *     then determined from the column count. For example, lets say
   *     you have a model with 10 items and the visible row count is 8.
   *     The number of columns needed to display this is 2, but you no
   *     longer need 8 rows to display this, you only need 5, thus
   *     the adjustedRowCount is 5.
   *     <p>
   *     If the visible row count is &lt;= 0, the preferred height is dictated
   *     by the number of columns, which will be as many as can fit in the
   *     width of the {@code JList} (width / max cell width), with at least
   *     one column. The preferred height then becomes the model size / number
   *     of columns * maximum cell height. Max cell height is either the fixed
   *     cell height, or is determined by iterating through all the cells to
   *     find the maximum height from the ListCellRenderer.
   * </tbody>
   * </table>
   *
   * The above specifies the raw preferred width and height. The resulting
   * preferred width is the above width + insets.left + insets.right and
   * the resulting preferred height is the above height + insets.top +
   * insets.bottom. Where the <code>Insets</code> are determined from
   * <code>list.getInsets()</code>.
   *
   * @param c The JList component.
   * @return The total size of the list.
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    this.maybeUpdateLayoutState();
    let lastRow = (this.list.getModel().getSize() - 1) | 0;
    if (lastRow < 0) {
      return new Dimension()._Dimension$int$int(0, 0);
    }
    let insets = this.list.getInsets$();
    let width = (Math.imul(this.cellWidth, this.columnCount) + insets.left + insets.right) | 0;
    let height: number;
    if (this.layoutOrientation !== JList.VERTICAL) {
      height = this.preferredHeight;
    } else {
      let bounds = this.getCellBounds$JList$int$BasicListUI(this.list, lastRow);
      if (bounds != null) {
        height = (bounds.y_ + bounds.height_ + insets.bottom) | 0;
      } else {
        height = 0;
      }
    }
    return new Dimension()._Dimension$int$int(width, height);
  }
  /**
   * Registers the keyboard bindings on the <code>JList</code> that the
   * <code>BasicListUI</code> is associated with. This method is called at
   * installUI() time.
   *
   * @see #installUI
   */
  installKeyboardActions(): void {
    let inputMap = this.getInputMap(JComponent.WHEN_FOCUSED);
    SwingUtilities.replaceUIInputMap(this.list, JComponent.WHEN_FOCUSED, inputMap);
    LazyActionMap.installLazyActionMap(this.list, $J.cls(BasicListUI), 'List.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_FOCUSED) {
      let keyMap = DefaultLookup.get(this.list, this, 'List.focusInputMap');
      let rtlKeyMap: InputMap;
      if (this.isLeftToRight_ || ((rtlKeyMap = DefaultLookup.get(this.list, this, 'List.focusInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    }
    return null;
  }
  /**
   * Unregisters keyboard actions installed from
   * <code>installKeyboardActions</code>.
   * This method is called at uninstallUI() time - subclassess should
   * ensure that all of the keyboard actions registered at installUI
   * time are removed here.
   *
   * @see #installUI
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.list, null);
    SwingUtilities.replaceUIInputMap(this.list, JComponent.WHEN_FOCUSED, null);
  }
  /**
   * Creates and installs the listeners for the JList, its model, and its
   * selectionModel.  This method is called at installUI() time.
   *
   * @see #installUI
   * @see #uninstallListeners
   */
  installListeners(): void {
    let th = this.list.getTransferHandler();
    if (th == null || $J.isa(th, UIResource)) {
      this.list.setTransferHandler(BasicListUI.defaultTransferHandler);
      if ($J.isa(this.list.getDropTarget(), UIResource)) {
        this.list.setDropTarget(null);
      }
    }
    this.focusListener = this.createFocusListener();
    this.mouseInputListener = this.createMouseInputListener();
    this.propertyChangeListener = this.createPropertyChangeListener();
    this.listSelectionListener = this.createListSelectionListener();
    this.listDataListener = this.createListDataListener();
    this.list.addFocusListener(this.focusListener);
    this.list.addMouseListener(this.mouseInputListener);
    this.list.addMouseMotionListener(this.mouseInputListener);
    this.list.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.list.addKeyListener(this.getHandler());
    let model = this.list.getModel();
    if (model != null) {
      model.addListDataListener(this.listDataListener);
    }
    let selectionModel = this.list.getSelectionModel();
    if (selectionModel != null) {
      selectionModel.addListSelectionListener(this.listSelectionListener);
    }
  }
  /**
   * Removes the listeners from the JList, its model, and its
   * selectionModel.  All of the listener fields, are reset to
   * null here.  This method is called at uninstallUI() time,
   * it should be kept in sync with installListeners.
   *
   * @see #uninstallUI
   * @see #installListeners
   */
  uninstallListeners(): void {
    this.list.removeFocusListener(this.focusListener);
    this.list.removeMouseListener(this.mouseInputListener);
    this.list.removeMouseMotionListener(this.mouseInputListener);
    this.list.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.list.removeKeyListener(this.getHandler());
    let model = this.list.getModel();
    if (model != null) {
      model.removeListDataListener(this.listDataListener);
    }
    let selectionModel = this.list.getSelectionModel();
    if (selectionModel != null) {
      selectionModel.removeListSelectionListener(this.listSelectionListener);
    }
    this.focusListener = null;
    this.mouseInputListener = null;
    this.listSelectionListener = null;
    this.listDataListener = null;
    this.propertyChangeListener = null;
    this.handler = null;
  }
  /**
   * Initializes list properties such as font, foreground, and background,
   * and adds the CellRendererPane. The font, foreground, and background
   * properties are only set if their current value is either null
   * or a UIResource, other properties are set if the current
   * value is null.
   *
   * @see #uninstallDefaults
   * @see #installUI
   * @see CellRendererPane
   */
  installDefaults(): void {
    this.list.setLayout(null);
    LookAndFeel.installBorder(this.list, 'List.border');
    LookAndFeel.installColorsAndFont(this.list, 'List.background', 'List.foreground', 'List.font');
    LookAndFeel.installProperty(this.list, 'opaque', true);
    if (this.list.getCellRenderer() == null) {
      let tmp = (UIManager.get$Object('List.cellRenderer'));
      this.list.setCellRenderer(tmp);
    }
    let sbg = this.list.getSelectionBackground();
    if (sbg == null || $J.isa(sbg, UIResource)) {
      this.list.setSelectionBackground(UIManager.getColor$Object('List.selectionBackground'));
    }
    let sfg = this.list.getSelectionForeground();
    if (sfg == null || $J.isa(sfg, UIResource)) {
      this.list.setSelectionForeground(UIManager.getColor$Object('List.selectionForeground'));
    }
    let l = UIManager.get$Object('List.timeFactor');
    this.timeFactor = (l != null) ? (+l) : 1000;
    this.updateIsFileList();
  }
  updateIsFileList(): void {
    let b = $J.equals(true, this.list.getClientProperty('List.isFileList'));
    if (b !== this.isFileList) {
      this.isFileList = b;
      let oldFont = this.list.getFont();
      if (oldFont == null || $J.isa(oldFont, UIResource)) {
        let newFont = UIManager.getFont$Object(b ? 'FileChooser.listFont' : 'List.font');
        if (newFont != null && newFont !== oldFont) {
          this.list.setFont(newFont);
        }
      }
    }
  }
  /**
   * Sets the list properties that have not been explicitly overridden to
   * {@code null}. A property is considered overridden if its current value
   * is not a {@code UIResource}.
   *
   * @see #installDefaults
   * @see #uninstallUI
   * @see CellRendererPane
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.list);
    if ($J.isa(this.list.getFont(), UIResource)) {
      this.list.setFont(null);
    }
    if ($J.isa(this.list.getForeground(), UIResource)) {
      this.list.setForeground(null);
    }
    if ($J.isa(this.list.getBackground(), UIResource)) {
      this.list.setBackground(null);
    }
    if ($J.isa(this.list.getSelectionBackground(), UIResource)) {
      this.list.setSelectionBackground(null);
    }
    if ($J.isa(this.list.getSelectionForeground(), UIResource)) {
      this.list.setSelectionForeground(null);
    }
    if ($J.isa(this.list.getCellRenderer(), UIResource)) {
      this.list.setCellRenderer(null);
    }
    if ($J.isa(this.list.getTransferHandler(), UIResource)) {
      this.list.setTransferHandler(null);
    }
  }
  /**
   * Initializes <code>this.list</code> by calling <code>installDefaults()</code>,
   * <code>installListeners()</code>, and <code>installKeyboardActions()</code>
   * in order.
   *
   * @see #installDefaults
   * @see #installListeners
   * @see #installKeyboardActions
   */
  installUI(c: JComponent): void {
    let tmp = c;
    this.list = tmp;
    this.layoutOrientation = this.list.getLayoutOrientation();
    this.rendererPane = new CellRendererPane()._CellRendererPane();
    this.list.add$Component(this.rendererPane);
    this.columnCount = 1;
    this.updateLayoutStateNeeded = BasicListUI.modelChanged;
    this.isLeftToRight_ = this.list.getComponentOrientation().isLeftToRight();
    this.installDefaults();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Uninitializes <code>this.list</code> by calling <code>uninstallListeners()</code>,
   * <code>uninstallKeyboardActions()</code>, and <code>uninstallDefaults()</code>
   * in order.  Sets this.list to null.
   *
   * @see #uninstallListeners
   * @see #uninstallKeyboardActions
   * @see #uninstallDefaults
   */
  uninstallUI(c: JComponent): void {
    this.uninstallListeners();
    this.uninstallDefaults();
    this.uninstallKeyboardActions();
    this.cellWidth = this.cellHeight = -1;
    this.cellHeights = null;
    this.listWidth = this.listHeight = -1;
    this.list.remove$Component(this.rendererPane);
    this.rendererPane = null;
    this.list = null;
  }
  /**
   * Returns a new instance of {@code BasicListUI}.
   * {@code BasicListUI} delegates are allocated one per {@code JList}.
   *
   * @param list a component
   * @return a new {@code ListUI} implementation for the Windows look and feel.
   */
  static createUI(list: JComponent): ComponentUI {
    return new BasicListUI()._BasicListUI();
  }
  /**
   * {@inheritDoc}
   * @throws NullPointerException {@inheritDoc}
   */
  locationToIndex(list: JList<any>, location: Point): number {
    this.maybeUpdateLayoutState();
    return this.convertLocationToModel(location.x_, location.y_);
  }
  /**
   * {@inheritDoc}
   */
  getCellBounds$JList$int$int(list: JList<any>, index1: number, index2: number): Rectangle {
    this.maybeUpdateLayoutState();
    let minIndex = Math.min(index1, index2);
    let maxIndex = Math.max(index1, index2);
    if (minIndex >= list.getModel().getSize()) {
      return null;
    }
    let minBounds = this.getCellBounds$JList$int$BasicListUI(list, minIndex);
    if (minBounds == null) {
      return null;
    }
    if (minIndex === maxIndex) {
      return minBounds;
    }
    let maxBounds = this.getCellBounds$JList$int$BasicListUI(list, maxIndex);
    if (maxBounds != null) {
      if (this.layoutOrientation === JList.HORIZONTAL_WRAP) {
        let minRow = this.convertModelToRow(minIndex);
        let maxRow = this.convertModelToRow(maxIndex);
        if (minRow !== maxRow) {
          minBounds.x_ = 0;
          minBounds.width_ = list.getWidth();
        }
      } else if (minBounds.x_ !== maxBounds.x_) {
        minBounds.y_ = 0;
        minBounds.height_ = list.getHeight();
      }
      minBounds.add$Rectangle(maxBounds);
    }
    return minBounds;
  }
  /**
   * Gets the bounds of the specified model index, returning the resulting
   * bounds, or null if <code>index</code> is not valid.
   */
  getCellBounds$JList$int$BasicListUI(list: JList<any>, index: number): Rectangle {
    this.maybeUpdateLayoutState();
    let row = this.convertModelToRow(index);
    let column = this.convertModelToColumn(index);
    if (row === -1 || column === -1) {
      return null;
    }
    let insets = list.getInsets$();
    let x: number;
    let w = this.cellWidth;
    let y = insets.top;
    let h: number;
    switch (this.layoutOrientation) {
      case JList.VERTICAL_WRAP:
      case JList.HORIZONTAL_WRAP:
        if (this.isLeftToRight_) {
          x = (insets.left + Math.imul(column, this.cellWidth)) | 0;
        } else {
          x = (list.getWidth() - insets.right - Math.imul(((column + 1) | 0), this.cellWidth)) | 0;
        }
        y = (y + Math.imul(this.cellHeight, row)) | 0;
        h = this.cellHeight;
        break;
      default:
        x = insets.left;
        if (this.cellHeights == null) {
          y = (y + (Math.imul(this.cellHeight, row))) | 0;
        } else if (row >= this.cellHeights.length) {
          y = 0;
        } else {
          for (let i = 0; i < row; i++) {
            y = (y + this.cellHeights[i]) | 0;
          }
        }
        w = (list.getWidth() - (insets.left + insets.right)) | 0;
        h = this.getRowHeight(index);
        break;
    }
    return new Rectangle()._Rectangle$int$int$int$int(x, y, w, h);
  }
  /**
   * Returns the height of the specified row based on the current layout.
   *
   * @param row a row
   * @return the specified row height or -1 if row isn't valid
   * @see #convertYToRow
   * @see #convertRowToY
   * @see #updateLayoutState
   */
  getRowHeight(row: number): number {
    return this.getHeight(0, row);
  }
  /**
   * Returns the height of the cell at the passed in location.
   */
  getHeight(column: number, row: number): number {
    if (column < 0 || column > this.columnCount || row < 0) {
      return -1;
    }
    if (this.layoutOrientation !== JList.VERTICAL) {
      return this.cellHeight;
    }
    if (row >= this.list.getModel().getSize()) {
      return -1;
    }
    return (this.cellHeights == null) ? this.cellHeight : ((row < this.cellHeights.length) ? this.cellHeights[row] : -1);
  }
  /**
   * Returns the row at location x/y.
   *
   * @param closest If true and the location doesn't exactly match a
   *                particular location, this will return the closest row.
   */
  convertLocationToRow(x: number, y0: number, closest: boolean): number {
    let size = this.list.getModel().getSize();
    if (size <= 0) {
      return -1;
    }
    let insets = this.list.getInsets$();
    if (this.cellHeights == null) {
      let row = (this.cellHeight === 0) ? 0 : ($J.idiv(((y0 - insets.top) | 0), this.cellHeight));
      if (closest) {
        if (row < 0) {
          row = 0;
        } else if (row >= size) {
          row = (size - 1) | 0;
        }
      }
      return row;
    } else if (size > this.cellHeights.length) {
      return -1;
    } else {
      let y = insets.top;
      let row = 0;
      if (closest && y0 < y) {
        return 0;
      }
      let i: number;
      for (i = 0; i < size; i++) {
        if ((y0 >= y) && (y0 < ((y + this.cellHeights[i]) | 0))) {
          return row;
        }
        y = (y + this.cellHeights[i]) | 0;
        row = (row + 1) | 0;
      }
      return (i - 1) | 0;
    }
  }
  /**
   * Returns the closest row that starts at the specified y-location
   * in the passed in column.
   */
  convertLocationToRowInColumn(y: number, column: number): number {
    let x = 0;
    if (this.layoutOrientation !== JList.VERTICAL) {
      if (this.isLeftToRight_) {
        x = Math.imul(column, this.cellWidth);
      } else {
        x = (this.list.getWidth() - Math.imul(((column + 1) | 0), this.cellWidth) - this.list.getInsets$().right) | 0;
      }
    }
    return this.convertLocationToRow(x, y, true);
  }
  /**
   * Returns the closest location to the model index of the passed in
   * location.
   */
  convertLocationToModel(x: number, y: number): number {
    let row = this.convertLocationToRow(x, y, true);
    let column = this.convertLocationToColumn(x, y);
    if (row >= 0 && column >= 0) {
      return this.getModelIndex(column, row);
    }
    return -1;
  }
  /**
   * Returns the number of rows in the given column.
   */
  getRowCount(column: number): number {
    if (column < 0 || column >= this.columnCount) {
      return -1;
    }
    if (this.layoutOrientation === JList.VERTICAL || (column === 0 && this.columnCount === 1)) {
      return this.list.getModel().getSize();
    }
    if (column >= this.columnCount) {
      return -1;
    }
    if (this.layoutOrientation === JList.VERTICAL_WRAP) {
      if (column < ((this.columnCount - 1) | 0)) {
        return this.rowsPerColumn;
      }
      return (this.list.getModel().getSize() - Math.imul(((this.columnCount - 1) | 0), this.rowsPerColumn)) | 0;
    }
    let diff = (this.columnCount - (Math.imul(this.columnCount, this.rowsPerColumn) - this.list.getModel().getSize())) | 0;
    if (column >= diff) {
      return Math.max(0, (this.rowsPerColumn - 1) | 0);
    }
    return this.rowsPerColumn;
  }
  /**
   * Returns the model index for the specified display location.
   * If <code>column</code>x<code>row</code> is beyond the length of the
   * model, this will return the model size - 1.
   */
  getModelIndex(column: number, row: number): number {
    switch (this.layoutOrientation) {
      case JList.VERTICAL_WRAP:
        return Math.min((this.list.getModel().getSize() - 1) | 0, (Math.imul(this.rowsPerColumn, column) + (Math.min(row, (this.rowsPerColumn - 1) | 0))) | 0);
      case JList.HORIZONTAL_WRAP:
        return Math.min((this.list.getModel().getSize() - 1) | 0, (Math.imul(row, this.columnCount) + column) | 0);
      default:
        return row;
    }
  }
  /**
   * Returns the closest column to the passed in location.
   */
  convertLocationToColumn(x: number, y: number): number {
    if (this.cellWidth > 0) {
      if (this.layoutOrientation === JList.VERTICAL) {
        return 0;
      }
      let insets = this.list.getInsets$();
      let col: number;
      if (this.isLeftToRight_) {
        col = $J.idiv(((x - insets.left) | 0), this.cellWidth);
      } else {
        col = $J.idiv(((this.list.getWidth() - x - insets.right - 1) | 0), this.cellWidth);
      }
      if (col < 0) {
        return 0;
      } else if (col >= this.columnCount) {
        return (this.columnCount - 1) | 0;
      }
      return col;
    }
    return 0;
  }
  /**
   * Returns the row that the model index <code>index</code> will be
   * displayed in..
   */
  convertModelToRow(index: number): number {
    let size = this.list.getModel().getSize();
    if ((index < 0) || (index >= size)) {
      return -1;
    }
    if (this.layoutOrientation !== JList.VERTICAL && this.columnCount > 1 && this.rowsPerColumn > 0) {
      if (this.layoutOrientation === JList.VERTICAL_WRAP) {
        return index % this.rowsPerColumn;
      }
      return $J.idiv(index, this.columnCount);
    }
    return index;
  }
  /**
   * Returns the column that the model index <code>index</code> will be
   * displayed in.
   */
  convertModelToColumn(index: number): number {
    let size = this.list.getModel().getSize();
    if ((index < 0) || (index >= size)) {
      return -1;
    }
    if (this.layoutOrientation !== JList.VERTICAL && this.rowsPerColumn > 0 && this.columnCount > 1) {
      if (this.layoutOrientation === JList.VERTICAL_WRAP) {
        return $J.idiv(index, this.rowsPerColumn);
      }
      return index % this.columnCount;
    }
    return 0;
  }
  /**
   * If updateLayoutStateNeeded is non zero, call updateLayoutState() and reset
   * updateLayoutStateNeeded.  This method should be called by methods
   * before doing any computation based on the geometry of the list.
   * For example it's the first call in paint() and getPreferredSize().
   *
   * @see #updateLayoutState
   */
  maybeUpdateLayoutState(): void {
    if (this.updateLayoutStateNeeded !== 0) {
      this.updateLayoutState();
      this.updateLayoutStateNeeded = 0;
    }
  }
  /**
   * Recompute the value of cellHeight or cellHeights based
   * and cellWidth, based on the current font and the current
   * values of fixedCellWidth, fixedCellHeight, and prototypeCellValue.
   *
   * @see #maybeUpdateLayoutState
   */
  updateLayoutState(): void {
    let fixedCellHeight = this.list.getFixedCellHeight();
    let fixedCellWidth = this.list.getFixedCellWidth();
    this.cellWidth = (fixedCellWidth !== -1) ? fixedCellWidth : -1;
    if (fixedCellHeight !== -1) {
      this.cellHeight = fixedCellHeight;
      this.cellHeights = null;
    } else {
      this.cellHeight = -1;
      this.cellHeights = $J.newArray(this.list.getModel().getSize(), 0);
    }
    if ((fixedCellWidth === -1) || (fixedCellHeight === -1)) {
      let dataModel = this.list.getModel();
      let dataModelSize = dataModel.getSize();
      let renderer = this.list.getCellRenderer();
      if (renderer != null) {
        for (let index = 0; index < dataModelSize; index++) {
          let value = dataModel.getElementAt(index);
          let c = renderer.getListCellRendererComponent(this.list, value, index, false, false);
          this.rendererPane.add$Component(c);
          let cellSize = c.getPreferredSize$();
          if (fixedCellWidth === -1) {
            this.cellWidth = Math.max(cellSize.width_, this.cellWidth);
          }
          if (fixedCellHeight === -1) {
            this.cellHeights[index] = cellSize.height_;
          }
        }
      } else {
        if (this.cellWidth === -1) {
          this.cellWidth = 0;
        }
        if (this.cellHeights == null) {
          this.cellHeights = $J.newArray(dataModelSize, 0);
        }
        for (let index = 0; index < dataModelSize; index++) {
          this.cellHeights[index] = 0;
        }
      }
    }
    this.columnCount = 1;
    if (this.layoutOrientation !== JList.VERTICAL) {
      this.updateHorizontalLayoutState(fixedCellWidth, fixedCellHeight);
    }
  }
  /**
   * Invoked when the list is laid out horizontally to determine how
   * many columns to create.
   * <p>
   * This updates the <code>rowsPerColumn, </code><code>columnCount</code>,
   * <code>preferredHeight</code> and potentially <code>cellHeight</code>
   * instance variables.
   */
  updateHorizontalLayoutState(fixedCellWidth: number, fixedCellHeight: number): void {
    let visRows = this.list.getVisibleRowCount();
    let dataModelSize = this.list.getModel().getSize();
    let insets = this.list.getInsets$();
    this.listHeight = this.list.getHeight();
    this.listWidth = this.list.getWidth();
    if (dataModelSize === 0) {
      this.rowsPerColumn = this.columnCount = 0;
      this.preferredHeight = (insets.top + insets.bottom) | 0;
      return;
    }
    let height: number;
    if (fixedCellHeight !== -1) {
      height = fixedCellHeight;
    } else {
      let maxHeight = 0;
      if (this.cellHeights.length > 0) {
        maxHeight = this.cellHeights[(this.cellHeights.length - 1) | 0];
        for (let counter = (this.cellHeights.length - 2) | 0; counter >= 0; counter--) {
          maxHeight = Math.max(maxHeight, this.cellHeights[counter]);
        }
      }
      height = this.cellHeight = maxHeight;
      this.cellHeights = null;
    }
    this.rowsPerColumn = dataModelSize;
    if (visRows > 0) {
      this.rowsPerColumn = visRows;
      this.columnCount = Math.max(1, $J.idiv(dataModelSize, this.rowsPerColumn));
      if (dataModelSize > 0 && dataModelSize > this.rowsPerColumn && dataModelSize % this.rowsPerColumn !== 0) {
        this.columnCount++;
      }
      if (this.layoutOrientation === JList.HORIZONTAL_WRAP) {
        this.rowsPerColumn = ($J.idiv(dataModelSize, this.columnCount));
        if (dataModelSize % this.columnCount > 0) {
          this.rowsPerColumn++;
        }
      }
    } else if (this.layoutOrientation === JList.VERTICAL_WRAP && height !== 0) {
      this.rowsPerColumn = Math.max(1, $J.idiv(((this.listHeight - insets.top - insets.bottom) | 0), height));
      this.columnCount = Math.max(1, $J.idiv(dataModelSize, this.rowsPerColumn));
      if (dataModelSize > 0 && dataModelSize > this.rowsPerColumn && dataModelSize % this.rowsPerColumn !== 0) {
        this.columnCount++;
      }
    } else if (this.layoutOrientation === JList.HORIZONTAL_WRAP && this.cellWidth > 0 && this.listWidth > 0) {
      this.columnCount = Math.max(1, $J.idiv(((this.listWidth - insets.left - insets.right) | 0), this.cellWidth));
      this.rowsPerColumn = $J.idiv(dataModelSize, this.columnCount);
      if (dataModelSize % this.columnCount > 0) {
        this.rowsPerColumn++;
      }
    }
    this.preferredHeight = (Math.imul(this.rowsPerColumn, this.cellHeight) + insets.top + insets.bottom) | 0;
  }
  getHandler(): BasicListUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicListUI$Handler().$o(this)._BasicListUI$Handler();
    }
    return this.handler;
  }
  /**
   * Creates a delegate that implements {@code MouseInputListener}.
   * The delegate is added to the corresponding {@code java.awt.Component} listener
   * lists at {@code installUI()} time. Subclasses can override this method to return
   * a custom {@code MouseInputListener}, e.g.
   * <pre>
   * class MyListUI extends BasicListUI {
   *    protected MouseInputListener <b>createMouseInputListener</b>() {
   *        return new MyMouseInputHandler();
   *    }
   *    public class MyMouseInputHandler extends MouseInputHandler {
   *        public void mouseMoved(MouseEvent e) {
   *            // do some extra work when the mouse moves
   *            super.mouseMoved(e);
   *        }
   *    }
   * }
   * </pre>
   *
   * @return an instance of {@code MouseInputListener}
   * @see MouseInputHandler
   * @see #installUI
   */
  createMouseInputListener(): MouseInputListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code FocusListener}.
   *
   * @return an instance of {@code FocusListener}
   */
  createFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Creates an instance of {@code ListSelectionHandler} that's added to
   * the {@code JLists} by selectionModel as needed.  Subclasses can override
   * this method to return a custom {@code ListSelectionListener}, e.g.
   * <pre>
   * class MyListUI extends BasicListUI {
   *    protected ListSelectionListener <b>createListSelectionListener</b>() {
   *        return new MySelectionListener();
   *    }
   *    public class MySelectionListener extends ListSelectionHandler {
   *        public void valueChanged(ListSelectionEvent e) {
   *            // do some extra work when the selection changes
   *            super.valueChange(e);
   *        }
   *    }
   * }
   * </pre>
   *
   * @return an instance of {@code ListSelectionHandler}
   * @see ListSelectionHandler
   * @see #installUI
   */
  createListSelectionListener(): ListSelectionListener {
    return $J.fn(this.getHandler(), 'valueChanged');
  }
  redrawList(): void {
    this.list.revalidate();
    this.list.repaint$();
  }
  /**
   * Creates an instance of {@code ListDataListener} that's added to
   * the {@code JLists} by model as needed. Subclasses can override
   * this method to return a custom {@code ListDataListener}, e.g.
   * <pre>
   * class MyListUI extends BasicListUI {
   *    protected ListDataListener <b>createListDataListener</b>() {
   *        return new MyListDataListener();
   *    }
   *    public class MyListDataListener extends ListDataHandler {
   *        public void contentsChanged(ListDataEvent e) {
   *            // do some extra work when the models contents change
   *            super.contentsChange(e);
   *        }
   *    }
   * }
   * </pre>
   *
   * @return an instance of {@code ListDataListener}
   * @see ListDataListener
   * @see JList#getModel
   * @see #installUI
   */
  createListDataListener(): ListDataListener {
    return this.getHandler();
  }
  /**
   * Creates an instance of {@code PropertyChangeHandler} that's added to
   * the {@code JList} by {@code installUI()}. Subclasses can override this method
   * to return a custom {@code PropertyChangeListener}, e.g.
   * <pre>
   * class MyListUI extends BasicListUI {
   *    protected PropertyChangeListener <b>createPropertyChangeListener</b>() {
   *        return new MyPropertyChangeListener();
   *    }
   *    public class MyPropertyChangeListener extends PropertyChangeHandler {
   *        public void propertyChange(PropertyChangeEvent e) {
   *            if (e.getPropertyName().equals("model")) {
   *                // do some extra work when the model changes
   *            }
   *            super.propertyChange(e);
   *        }
   *    }
   * }
   * </pre>
   *
   * @return an instance of {@code PropertyChangeHandler}
   * @see PropertyChangeListener
   * @see #installUI
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  static adjustIndex(index: number, list: JList<any>): number {
    return index < list.getModel().getSize() ? index : -1;
  }
  static $clinit() {
    BasicListUI.BASELINE_COMPONENT_KEY = new StringBuilder('List.baselineComponent');
    BasicListUI.defaultTransferHandler = new BasicListUI$ListTransferHandler()._BasicListUI$ListTransferHandler();
  }
}

export class BasicListUI$Actions extends UIAction {
  static readonly SELECT_PREVIOUS_COLUMN: string = 'selectPreviousColumn';
  static readonly SELECT_PREVIOUS_COLUMN_EXTEND: string = 'selectPreviousColumnExtendSelection';
  static readonly SELECT_PREVIOUS_COLUMN_CHANGE_LEAD: string = 'selectPreviousColumnChangeLead';
  static readonly SELECT_NEXT_COLUMN: string = 'selectNextColumn';
  static readonly SELECT_NEXT_COLUMN_EXTEND: string = 'selectNextColumnExtendSelection';
  static readonly SELECT_NEXT_COLUMN_CHANGE_LEAD: string = 'selectNextColumnChangeLead';
  static readonly SELECT_PREVIOUS_ROW: string = 'selectPreviousRow';
  static readonly SELECT_PREVIOUS_ROW_EXTEND: string = 'selectPreviousRowExtendSelection';
  static readonly SELECT_PREVIOUS_ROW_CHANGE_LEAD: string = 'selectPreviousRowChangeLead';
  static readonly SELECT_NEXT_ROW: string = 'selectNextRow';
  static readonly SELECT_NEXT_ROW_EXTEND: string = 'selectNextRowExtendSelection';
  static readonly SELECT_NEXT_ROW_CHANGE_LEAD: string = 'selectNextRowChangeLead';
  static readonly SELECT_FIRST_ROW: string = 'selectFirstRow';
  static readonly SELECT_FIRST_ROW_EXTEND: string = 'selectFirstRowExtendSelection';
  static readonly SELECT_FIRST_ROW_CHANGE_LEAD: string = 'selectFirstRowChangeLead';
  static readonly SELECT_LAST_ROW: string = 'selectLastRow';
  static readonly SELECT_LAST_ROW_EXTEND: string = 'selectLastRowExtendSelection';
  static readonly SELECT_LAST_ROW_CHANGE_LEAD: string = 'selectLastRowChangeLead';
  static readonly SCROLL_UP: string = 'scrollUp';
  static readonly SCROLL_UP_EXTEND: string = 'scrollUpExtendSelection';
  static readonly SCROLL_UP_CHANGE_LEAD: string = 'scrollUpChangeLead';
  static readonly SCROLL_DOWN: string = 'scrollDown';
  static readonly SCROLL_DOWN_EXTEND: string = 'scrollDownExtendSelection';
  static readonly SCROLL_DOWN_CHANGE_LEAD: string = 'scrollDownChangeLead';
  static readonly SELECT_ALL: string = 'selectAll';
  static readonly CLEAR_SELECTION: string = 'clearSelection';
  static readonly ADD_TO_SELECTION: string = 'addToSelection';
  static readonly TOGGLE_AND_ANCHOR: string = 'toggleAndAnchor';
  static readonly EXTEND_TO: string = 'extendTo';
  static readonly MOVE_SELECTION_TO: string = 'moveSelectionTo';
  _BasicListUI$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let name = this.getName();
    let list = e.getSource();
    let ui = BasicLookAndFeel.getUIOfType(list.getUI(), $J.cls(BasicListUI));
    if (name === BasicListUI$Actions.SELECT_PREVIOUS_COLUMN) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, this.getNextColumnIndex(list, ui, -1), -1);
    } else if (name === BasicListUI$Actions.SELECT_PREVIOUS_COLUMN_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, this.getNextColumnIndex(list, ui, -1), -1);
    } else if (name === BasicListUI$Actions.SELECT_PREVIOUS_COLUMN_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, this.getNextColumnIndex(list, ui, -1), -1);
    } else if (name === BasicListUI$Actions.SELECT_NEXT_COLUMN) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, this.getNextColumnIndex(list, ui, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_NEXT_COLUMN_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, this.getNextColumnIndex(list, ui, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_NEXT_COLUMN_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, this.getNextColumnIndex(list, ui, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_PREVIOUS_ROW) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, this.getNextIndex(list, ui, -1), -1);
    } else if (name === BasicListUI$Actions.SELECT_PREVIOUS_ROW_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, this.getNextIndex(list, ui, -1), -1);
    } else if (name === BasicListUI$Actions.SELECT_PREVIOUS_ROW_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, this.getNextIndex(list, ui, -1), -1);
    } else if (name === BasicListUI$Actions.SELECT_NEXT_ROW) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, this.getNextIndex(list, ui, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_NEXT_ROW_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, this.getNextIndex(list, ui, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_NEXT_ROW_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, this.getNextIndex(list, ui, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_FIRST_ROW) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, 0, -1);
    } else if (name === BasicListUI$Actions.SELECT_FIRST_ROW_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, 0, -1);
    } else if (name === BasicListUI$Actions.SELECT_FIRST_ROW_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, 0, -1);
    } else if (name === BasicListUI$Actions.SELECT_LAST_ROW) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, (list.getModel().getSize() - 1) | 0, 1);
    } else if (name === BasicListUI$Actions.SELECT_LAST_ROW_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, (list.getModel().getSize() - 1) | 0, 1);
    } else if (name === BasicListUI$Actions.SELECT_LAST_ROW_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, (list.getModel().getSize() - 1) | 0, 1);
    } else if (name === BasicListUI$Actions.SCROLL_UP) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, this.getNextPageIndex(list, -1), -1);
    } else if (name === BasicListUI$Actions.SCROLL_UP_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, this.getNextPageIndex(list, -1), -1);
    } else if (name === BasicListUI$Actions.SCROLL_UP_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, this.getNextPageIndex(list, -1), -1);
    } else if (name === BasicListUI$Actions.SCROLL_DOWN) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, this.getNextPageIndex(list, 1), 1);
    } else if (name === BasicListUI$Actions.SCROLL_DOWN_EXTEND) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, this.getNextPageIndex(list, 1), 1);
    } else if (name === BasicListUI$Actions.SCROLL_DOWN_CHANGE_LEAD) {
      this.changeSelection(list, BasicListUI.CHANGE_LEAD, this.getNextPageIndex(list, 1), 1);
    } else if (name === BasicListUI$Actions.SELECT_ALL) {
      this.selectAll(list);
    } else if (name === BasicListUI$Actions.CLEAR_SELECTION) {
      this.clearSelection(list);
    } else if (name === BasicListUI$Actions.ADD_TO_SELECTION) {
      let index = BasicListUI.adjustIndex(list.getSelectionModel().getLeadSelectionIndex(), list);
      if (!list.isSelectedIndex(index)) {
        let oldAnchor = list.getSelectionModel().getAnchorSelectionIndex();
        list.setValueIsAdjusting(true);
        list.addSelectionInterval(index, index);
        list.getSelectionModel().setAnchorSelectionIndex(oldAnchor);
        list.setValueIsAdjusting(false);
      }
    } else if (name === BasicListUI$Actions.TOGGLE_AND_ANCHOR) {
      let index = BasicListUI.adjustIndex(list.getSelectionModel().getLeadSelectionIndex(), list);
      if (list.isSelectedIndex(index)) {
        list.removeSelectionInterval(index, index);
      } else {
        list.addSelectionInterval(index, index);
      }
    } else if (name === BasicListUI$Actions.EXTEND_TO) {
      this.changeSelection(list, BasicListUI.EXTEND_SELECTION, BasicListUI.adjustIndex(list.getSelectionModel().getLeadSelectionIndex(), list), 0);
    } else if (name === BasicListUI$Actions.MOVE_SELECTION_TO) {
      this.changeSelection(list, BasicListUI.CHANGE_SELECTION, BasicListUI.adjustIndex(list.getSelectionModel().getLeadSelectionIndex(), list), 0);
    }
  }
  accept(c: any): boolean {
    let name = this.getName();
    if (name === BasicListUI$Actions.SELECT_PREVIOUS_COLUMN_CHANGE_LEAD || name === BasicListUI$Actions.SELECT_NEXT_COLUMN_CHANGE_LEAD || name === BasicListUI$Actions.SELECT_PREVIOUS_ROW_CHANGE_LEAD || name === BasicListUI$Actions.SELECT_NEXT_ROW_CHANGE_LEAD || name === BasicListUI$Actions.SELECT_FIRST_ROW_CHANGE_LEAD || name === BasicListUI$Actions.SELECT_LAST_ROW_CHANGE_LEAD || name === BasicListUI$Actions.SCROLL_UP_CHANGE_LEAD || name === BasicListUI$Actions.SCROLL_DOWN_CHANGE_LEAD) {
      return c != null && (c).getSelectionModel() instanceof DefaultListSelectionModel;
    }
    return true;
  }
  clearSelection(list: JList<any>): void {
    list.clearSelection();
  }
  selectAll(list: JList<any>): void {
    let size = list.getModel().getSize();
    if (size > 0) {
      let lsm = list.getSelectionModel();
      let lead = BasicListUI.adjustIndex(lsm.getLeadSelectionIndex(), list);
      if (lsm.getSelectionMode() === ListSelectionModel.SINGLE_SELECTION) {
        if (lead === -1) {
          let min = BasicListUI.adjustIndex(list.getMinSelectionIndex(), list);
          lead = (min === -1 ? 0 : min);
        }
        list.setSelectionInterval(lead, lead);
        list.ensureIndexIsVisible(lead);
      } else {
        list.setValueIsAdjusting(true);
        let anchor = BasicListUI.adjustIndex(lsm.getAnchorSelectionIndex(), list);
        list.setSelectionInterval(0, (size - 1) | 0);
        SwingUtilities2.setLeadAnchorWithoutSelection(lsm, anchor, lead);
        list.setValueIsAdjusting(false);
      }
    }
  }
  getNextPageIndex(list: JList<any>, direction: number): number {
    if (list.getModel().getSize() === 0) {
      return -1;
    }
    let index = -1;
    let visRect = list.getVisibleRect();
    let lsm = list.getSelectionModel();
    let lead = BasicListUI.adjustIndex(lsm.getLeadSelectionIndex(), list);
    let leadRect = (lead === -1) ? new Rectangle()._Rectangle$() : list.getCellBounds(lead, lead);
    if (leadRect == null) {
      return index;
    }
    if (list.getLayoutOrientation() === JList.VERTICAL_WRAP && list.getVisibleRowCount() <= 0) {
      if (!list.getComponentOrientation().isLeftToRight()) {
        direction = -direction;
      }
      if (direction < 0) {
        visRect.x_ = (leadRect.x_ + leadRect.width_ - visRect.width_) | 0;
        let p = new Point()._Point$int$int((visRect.x_ - 1) | 0, leadRect.y_);
        index = list.locationToIndex(p);
        if (index === -1) {
          return index;
        }
        let cellBounds = list.getCellBounds(index, index);
        if (cellBounds != null && visRect.intersects$Rectangle(cellBounds)) {
          p.x_ = (cellBounds.x_ - 1) | 0;
          index = list.locationToIndex(p);
          if (index === -1) {
            return index;
          }
          cellBounds = list.getCellBounds(index, index);
        }
        if (cellBounds != null && cellBounds.y_ !== leadRect.y_) {
          p.x_ = (cellBounds.x_ + cellBounds.width_) | 0;
          index = list.locationToIndex(p);
        }
      } else {
        visRect.x_ = leadRect.x_;
        let p = new Point()._Point$int$int((visRect.x_ + visRect.width_) | 0, leadRect.y_);
        index = list.locationToIndex(p);
        if (index === -1) {
          return index;
        }
        let cellBounds = list.getCellBounds(index, index);
        if (cellBounds != null && visRect.intersects$Rectangle(cellBounds)) {
          p.x_ = (cellBounds.x_ + cellBounds.width_) | 0;
          index = list.locationToIndex(p);
          if (index === -1) {
            return index;
          }
          cellBounds = list.getCellBounds(index, index);
        }
        if (cellBounds != null && cellBounds.y_ !== leadRect.y_) {
          p.x_ = (cellBounds.x_ - 1) | 0;
          index = list.locationToIndex(p);
        }
      }
    } else {
      if (direction < 0) {
        let p = new Point()._Point$int$int(leadRect.x_, visRect.y_);
        index = list.locationToIndex(p);
        if (lead <= index) {
          visRect.y_ = (leadRect.y_ + leadRect.height_ - visRect.height_) | 0;
          p.y_ = visRect.y_;
          index = list.locationToIndex(p);
          if (index === -1) {
            return index;
          }
          let cellBounds = list.getCellBounds(index, index);
          if (cellBounds != null && cellBounds.y_ < visRect.y_) {
            p.y_ = (cellBounds.y_ + cellBounds.height_) | 0;
            index = list.locationToIndex(p);
            if (index === -1) {
              return index;
            }
            cellBounds = list.getCellBounds(index, index);
          }
          if (cellBounds != null && cellBounds.y_ >= leadRect.y_) {
            p.y_ = (leadRect.y_ - 1) | 0;
            index = list.locationToIndex(p);
          }
        }
      } else {
        let p = new Point()._Point$int$int(leadRect.x_, (visRect.y_ + visRect.height_ - 1) | 0);
        index = list.locationToIndex(p);
        if (index === -1) {
          return index;
        }
        let cellBounds = list.getCellBounds(index, index);
        if (cellBounds != null && ((cellBounds.y_ + cellBounds.height_) | 0) > ((visRect.y_ + visRect.height_) | 0)) {
          p.y_ = (cellBounds.y_ - 1) | 0;
          index = list.locationToIndex(p);
          if (index === -1) {
            return index;
          }
          cellBounds = list.getCellBounds(index, index);
          index = Math.max(index, lead);
        }
        if (lead >= index) {
          visRect.y_ = leadRect.y_;
          p.y_ = (visRect.y_ + visRect.height_ - 1) | 0;
          index = list.locationToIndex(p);
          if (index === -1) {
            return index;
          }
          cellBounds = list.getCellBounds(index, index);
          if (cellBounds != null && ((cellBounds.y_ + cellBounds.height_) | 0) > ((visRect.y_ + visRect.height_) | 0)) {
            p.y_ = (cellBounds.y_ - 1) | 0;
            index = list.locationToIndex(p);
            if (index === -1) {
              return index;
            }
            cellBounds = list.getCellBounds(index, index);
          }
          if (cellBounds != null && cellBounds.y_ <= leadRect.y_) {
            p.y_ = (leadRect.y_ + leadRect.height_) | 0;
            index = list.locationToIndex(p);
          }
        }
      }
    }
    return index;
  }
  changeSelection(list: JList<any>, type$: number, index: number, direction: number): void {
    if (index >= 0 && index < list.getModel().getSize()) {
      let lsm = list.getSelectionModel();
      if (type$ === BasicListUI.CHANGE_LEAD && list.getSelectionMode() !== ListSelectionModel.MULTIPLE_INTERVAL_SELECTION) {
        type$ = BasicListUI.CHANGE_SELECTION;
      }
      this.adjustScrollPositionIfNecessary(list, index, direction);
      if (type$ === BasicListUI.EXTEND_SELECTION) {
        let anchor = BasicListUI.adjustIndex(lsm.getAnchorSelectionIndex(), list);
        if (anchor === -1) {
          anchor = 0;
        }
        list.setSelectionInterval(anchor, index);
      } else if (type$ === BasicListUI.CHANGE_SELECTION) {
        list.setSelectedIndex(index);
      } else {
        (lsm).moveLeadSelectionIndex(index);
      }
    }
  }
  /**
   * When scroll down makes selected index the last completely visible
   * index. When scroll up makes selected index the first visible index.
   * Adjust visible rectangle respect to list's component orientation.
   */
  adjustScrollPositionIfNecessary(list: JList<any>, index: number, direction: number): void {
    if (direction === 0) {
      return;
    }
    let cellBounds = list.getCellBounds(index, index);
    let visRect = list.getVisibleRect();
    if (cellBounds != null && !visRect.contains$Rectangle(cellBounds)) {
      if (list.getLayoutOrientation() === JList.VERTICAL_WRAP && list.getVisibleRowCount() <= 0) {
        if (list.getComponentOrientation().isLeftToRight()) {
          if (direction > 0) {
            let x = Math.max(0, (cellBounds.x_ + cellBounds.width_ - visRect.width_) | 0);
            let startIndex = list.locationToIndex(new Point()._Point$int$int(x, cellBounds.y_));
            if (startIndex === -1) {
              return;
            }
            let startRect = list.getCellBounds(startIndex, startIndex);
            if (startRect != null && startRect.x_ < x && startRect.x_ < cellBounds.x_) {
              startRect.x_ = (startRect.x_ + startRect.width_) | 0;
              startIndex = list.locationToIndex(startRect.getLocation());
              if (startIndex === -1) {
                return;
              }
              startRect = list.getCellBounds(startIndex, startIndex);
            }
            cellBounds = startRect;
          }
          if (cellBounds != null) {
            cellBounds.width_ = visRect.width_;
          }
        } else {
          if (direction > 0) {
            let x = (cellBounds.x_ + visRect.width_) | 0;
            let rightIndex = list.locationToIndex(new Point()._Point$int$int(x, cellBounds.y_));
            if (rightIndex === -1) {
              return;
            }
            let rightRect = list.getCellBounds(rightIndex, rightIndex);
            if (rightRect != null) {
              if (((rightRect.x_ + rightRect.width_) | 0) > x && rightRect.x_ > cellBounds.x_) {
                rightRect.width_ = 0;
              }
              cellBounds.x_ = Math.max(0, (rightRect.x_ + rightRect.width_ - visRect.width_) | 0);
              cellBounds.width_ = visRect.width_;
            }
          } else {
            cellBounds.x_ = (cellBounds.x_ + (Math.max(0, (cellBounds.width_ - visRect.width_) | 0))) | 0;
            cellBounds.width_ = Math.min(cellBounds.width_, visRect.width_);
          }
        }
      } else {
        if (direction > 0 && (cellBounds.y_ < visRect.y_ || ((cellBounds.y_ + cellBounds.height_) | 0) > ((visRect.y_ + visRect.height_) | 0))) {
          let y = Math.max(0, (cellBounds.y_ + cellBounds.height_ - visRect.height_) | 0);
          let startIndex = list.locationToIndex(new Point()._Point$int$int(cellBounds.x_, y));
          if (startIndex === -1) {
            return;
          }
          let startRect = list.getCellBounds(startIndex, startIndex);
          if (startRect != null && startRect.y_ < y && startRect.y_ < cellBounds.y_) {
            startRect.y_ = (startRect.y_ + startRect.height_) | 0;
            startIndex = list.locationToIndex(startRect.getLocation());
            if (startIndex === -1) {
              return;
            }
            startRect = list.getCellBounds(startIndex, startIndex);
          }
          cellBounds = startRect;
          if (cellBounds != null) {
            cellBounds.height_ = visRect.height_;
          }
        } else {
          cellBounds.height_ = Math.min(cellBounds.height_, visRect.height_);
        }
      }
      if (cellBounds != null) {
        list.scrollRectToVisible(cellBounds);
      }
    }
  }
  getNextColumnIndex(list: JList<any>, ui: BasicListUI, amount: number): number {
    if (list.getLayoutOrientation() !== JList.VERTICAL) {
      let index = BasicListUI.adjustIndex(list.getLeadSelectionIndex(), list);
      let size = list.getModel().getSize();
      if (index === -1) {
        return 0;
      } else if (size === 1) {
        return 0;
      } else if (ui == null || ui.columnCount <= 1) {
        return -1;
      }
      let column = ui.convertModelToColumn(index);
      let row = ui.convertModelToRow(index);
      column = (column + amount) | 0;
      if (column >= ui.columnCount || column < 0) {
        return -1;
      }
      let maxRowCount = ui.getRowCount(column);
      if (row >= maxRowCount) {
        return -1;
      }
      return ui.getModelIndex(column, row);
    }
    return -1;
  }
  getNextIndex(list: JList<any>, ui: BasicListUI, amount: number): number {
    let index = BasicListUI.adjustIndex(list.getLeadSelectionIndex(), list);
    let size = list.getModel().getSize();
    if (index === -1) {
      if (size > 0) {
        if (amount > 0) {
          index = 0;
        } else {
          index = (size - 1) | 0;
        }
      }
    } else if (size === 1) {
      index = 0;
    } else if (list.getLayoutOrientation() === JList.HORIZONTAL_WRAP) {
      if (ui != null) {
        index = (index + Math.imul(ui.columnCount, amount)) | 0;
      }
    } else {
      index = (index + amount) | 0;
    }
    return index;
  }
}

export class BasicListUI$Handler extends JObject {
  prefix: string = null;
  typedString: string = null;
  lastTime: number = 0;
  dragPressDidSelection: boolean = false;
  _BasicListUI$Handler(): this {
    this.prefix = '';
    this.typedString = '';
    this.lastTime = 0;
    return this;
  }
  /**
   * Invoked when a key has been typed.
   *
   * Moves the keyboard focus to the first element whose prefix matches the
   * sequence of alphanumeric keys pressed by the user with delay less
   * than value of <code>timeFactor</code> property (or 1000 milliseconds
   * if it is not defined). Subsequent same key presses move the keyboard
   * focus to the next object that starts with the same letter until another
   * key is pressed, then it is treated as the prefix with appropriate number
   * of the same letters followed by first typed another letter.
   */
  keyTyped(e: KeyEvent): void {
    let src = e.getSource();
    let model = src.getModel();
    if (model.getSize() === 0 || e.isAltDown() || BasicGraphicsUtils.isMenuShortcutKeyDown(e) || this.isNavigationKey(e)) {
      return;
    }
    let startingFromSelection = true;
    let c = e.getKeyChar();
    let time = e.getWhen();
    let startIndex = BasicListUI.adjustIndex(src.getLeadSelectionIndex(), this.$outer.list);
    if (time - this.lastTime < this.$outer.timeFactor) {
      this.typedString += String.fromCharCode(c);
      if ((this.prefix.length === 1) && (c === this.prefix.charCodeAt(0))) {
        startIndex++;
      } else {
        this.prefix = this.typedString;
      }
    } else {
      startIndex++;
      this.typedString = '' + String.fromCharCode(c);
      this.prefix = this.typedString;
    }
    this.lastTime = time;
    if (startIndex < 0 || startIndex >= model.getSize()) {
      startingFromSelection = false;
      startIndex = 0;
    }
    let index = src.getNextMatch(this.prefix, startIndex, Position$Bias.Forward);
    if (index >= 0) {
      src.setSelectedIndex(index);
      src.ensureIndexIsVisible(index);
    } else if (startingFromSelection) {
      index = src.getNextMatch(this.prefix, 0, Position$Bias.Forward);
      if (index >= 0) {
        src.setSelectedIndex(index);
        src.ensureIndexIsVisible(index);
      }
    }
  }
  /**
   * Invoked when a key has been pressed.
   *
   * Checks to see if the key event is a navigation key to prevent
   * dispatching these keys for the first letter navigation.
   */
  keyPressed(e: KeyEvent): void {
    if (this.isNavigationKey(e)) {
      this.prefix = '';
      this.typedString = '';
      this.lastTime = 0;
    }
  }
  /**
   * Invoked when a key has been released.
   * See the class description for {@link KeyEvent} for a definition of
   * a key released event.
   */
  keyReleased(e: KeyEvent): void {
  }
  /**
   * Returns whether or not the supplied key event maps to a key that is used for
   * navigation.  This is used for optimizing key input by only passing non-
   * navigation keys to the first letter navigation mechanism.
   */
  isNavigationKey(event: KeyEvent): boolean {
    let inputMap = this.$outer.list.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    let key = KeyStroke.getKeyStrokeForEvent(event);
    if (inputMap != null && inputMap.get(key) != null) {
      return true;
    }
    return false;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (propertyName === 'model') {
      let oldModel = e.getOldValue();
      let newModel = e.getNewValue();
      if (oldModel != null) {
        oldModel.removeListDataListener(this.$outer.listDataListener);
      }
      if (newModel != null) {
        newModel.addListDataListener(this.$outer.listDataListener);
      }
      this.$outer.updateLayoutStateNeeded |= BasicListUI.modelChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'selectionModel') {
      let oldModel = e.getOldValue();
      let newModel = e.getNewValue();
      if (oldModel != null) {
        oldModel.removeListSelectionListener(this.$outer.listSelectionListener);
      }
      if (newModel != null) {
        newModel.addListSelectionListener(this.$outer.listSelectionListener);
      }
      this.$outer.updateLayoutStateNeeded |= BasicListUI.modelChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'cellRenderer') {
      this.$outer.updateLayoutStateNeeded |= BasicListUI.cellRendererChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'font' || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
      this.$outer.updateLayoutStateNeeded |= BasicListUI.fontChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'prototypeCellValue') {
      this.$outer.updateLayoutStateNeeded |= BasicListUI.prototypeCellValueChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'fixedCellHeight') {
      this.$outer.updateLayoutStateNeeded |= BasicListUI.fixedCellHeightChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'fixedCellWidth') {
      this.$outer.updateLayoutStateNeeded |= BasicListUI.fixedCellWidthChanged;
      this.$outer.redrawList();
    } else if (propertyName === 'selectionForeground') {
      this.$outer.list.repaint$();
    } else if (propertyName === 'selectionBackground') {
      this.$outer.list.repaint$();
    } else if ('layoutOrientation' === propertyName) {
      this.$outer.updateLayoutStateNeeded |= BasicListUI.layoutOrientationChanged;
      this.$outer.layoutOrientation = this.$outer.list.getLayoutOrientation();
      this.$outer.redrawList();
    } else if ('visibleRowCount' === propertyName) {
      if (this.$outer.layoutOrientation !== JList.VERTICAL) {
        this.$outer.updateLayoutStateNeeded |= BasicListUI.layoutOrientationChanged;
        this.$outer.redrawList();
      }
    } else if ('componentOrientation' === propertyName) {
      this.$outer.isLeftToRight_ = this.$outer.list.getComponentOrientation().isLeftToRight();
      this.$outer.updateLayoutStateNeeded |= BasicListUI.componentOrientationChanged;
      this.$outer.redrawList();
      let inputMap = this.$outer.getInputMap(JComponent.WHEN_FOCUSED);
      SwingUtilities.replaceUIInputMap(this.$outer.list, JComponent.WHEN_FOCUSED, inputMap);
    } else if ('List.isFileList' === propertyName) {
      this.$outer.updateIsFileList();
      this.$outer.redrawList();
    } else if ('dropLocation' === propertyName) {
      let oldValue = e.getOldValue();
      this.repaintDropLocation(oldValue);
      this.repaintDropLocation(this.$outer.list.getDropLocation());
    }
  }
  repaintDropLocation(loc: JList$DropLocation): void {
    if (loc == null) {
      return;
    }
    let r: Rectangle;
    if (loc.isInsert()) {
      r = this.$outer.getDropLineRect(loc);
    } else {
      r = this.$outer.getCellBounds$JList$int$BasicListUI(this.$outer.list, loc.getIndex());
    }
    if (r != null) {
      this.$outer.list.repaint$Rectangle(r);
    }
  }
  intervalAdded(e: ListDataEvent): void {
    this.$outer.updateLayoutStateNeeded = BasicListUI.modelChanged;
    let minIndex = Math.min(e.getIndex0(), e.getIndex1());
    let maxIndex = Math.max(e.getIndex0(), e.getIndex1());
    let sm = this.$outer.list.getSelectionModel();
    if (sm != null) {
      sm.insertIndexInterval(minIndex, (maxIndex - minIndex + 1) | 0, true);
    }
    this.$outer.redrawList();
  }
  intervalRemoved(e: ListDataEvent): void {
    this.$outer.updateLayoutStateNeeded = BasicListUI.modelChanged;
    let sm = this.$outer.list.getSelectionModel();
    if (sm != null) {
      sm.removeIndexInterval(e.getIndex0(), e.getIndex1());
    }
    this.$outer.redrawList();
  }
  contentsChanged(e: ListDataEvent): void {
    this.$outer.updateLayoutStateNeeded = BasicListUI.modelChanged;
    this.$outer.redrawList();
  }
  valueChanged(e: ListSelectionEvent): void {
    this.$outer.maybeUpdateLayoutState();
    let size = this.$outer.list.getModel().getSize();
    let firstIndex = Math.min((size - 1) | 0, Math.max(e.getFirstIndex(), 0));
    let lastIndex = Math.min((size - 1) | 0, Math.max(e.getLastIndex(), 0));
    let bounds = this.$outer.getCellBounds$JList$int$int(this.$outer.list, firstIndex, lastIndex);
    if (bounds != null) {
      this.$outer.list.repaint$int$int$int$int(bounds.x_, bounds.y_, bounds.width_, bounds.height_);
    }
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  mousePressed(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.list)) {
      return;
    }
    let dragEnabled = this.$outer.list.getDragEnabled();
    let grabFocus = true;
    if (dragEnabled) {
      let row = SwingUtilities2.loc2IndexFileList(this.$outer.list, e.getPoint());
      if (row !== -1 && DragRecognitionSupport.mousePressed(e)) {
        this.dragPressDidSelection = false;
        if (BasicGraphicsUtils.isMenuShortcutKeyDown(e)) {
          return;
        } else if (!e.isShiftDown() && this.$outer.list.isSelectedIndex(row)) {
          this.$outer.list.addSelectionInterval(row, row);
          return;
        }
        grabFocus = false;
        this.dragPressDidSelection = true;
      }
    } else {
      this.$outer.list.setValueIsAdjusting(true);
    }
    if (grabFocus) {
      SwingUtilities2.adjustFocus(this.$outer.list);
    }
    this.adjustSelection(e);
  }
  adjustSelection(e: MouseEvent): void {
    let row = SwingUtilities2.loc2IndexFileList(this.$outer.list, e.getPoint());
    if (row < 0) {
      if (this.$outer.isFileList && e.getID() === MouseEvent.MOUSE_PRESSED && (!e.isShiftDown() || this.$outer.list.getSelectionMode() === ListSelectionModel.SINGLE_SELECTION)) {
        this.$outer.list.clearSelection();
      }
    } else {
      let anchorIndex = BasicListUI.adjustIndex(this.$outer.list.getAnchorSelectionIndex(), this.$outer.list);
      let anchorSelected: boolean;
      if (anchorIndex === -1) {
        anchorIndex = 0;
        anchorSelected = false;
      } else {
        anchorSelected = this.$outer.list.isSelectedIndex(anchorIndex);
      }
      if (BasicGraphicsUtils.isMenuShortcutKeyDown(e)) {
        if (e.isShiftDown()) {
          if (anchorSelected) {
            this.$outer.list.addSelectionInterval(anchorIndex, row);
          } else {
            this.$outer.list.removeSelectionInterval(anchorIndex, row);
            if (this.$outer.isFileList) {
              this.$outer.list.addSelectionInterval(row, row);
              this.$outer.list.getSelectionModel().setAnchorSelectionIndex(anchorIndex);
            }
          }
        } else if (this.$outer.list.isSelectedIndex(row)) {
          this.$outer.list.removeSelectionInterval(row, row);
        } else {
          this.$outer.list.addSelectionInterval(row, row);
        }
      } else if (e.isShiftDown()) {
        this.$outer.list.setSelectionInterval(anchorIndex, row);
      } else {
        this.$outer.list.setSelectionInterval(row, row);
      }
    }
  }
  dragStarting(me: MouseEvent): void {
    if (BasicGraphicsUtils.isMenuShortcutKeyDown(me)) {
      let row = SwingUtilities2.loc2IndexFileList(this.$outer.list, me.getPoint());
      this.$outer.list.addSelectionInterval(row, row);
    }
  }
  mouseDragged(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.list)) {
      return;
    }
    if (this.$outer.list.getDragEnabled()) {
      DragRecognitionSupport.mouseDragged(e, this);
      return;
    }
    if (e.isShiftDown() || BasicGraphicsUtils.isMenuShortcutKeyDown(e)) {
      return;
    }
    let row = this.$outer.locationToIndex(this.$outer.list, e.getPoint());
    if (row !== -1) {
      if (this.$outer.isFileList) {
        return;
      }
      let cellBounds = this.$outer.getCellBounds$JList$int$int(this.$outer.list, row, row);
      if (cellBounds != null) {
        this.$outer.list.scrollRectToVisible(cellBounds);
        this.$outer.list.setSelectionInterval(row, row);
      }
    }
  }
  mouseMoved(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.list)) {
      return;
    }
    if (this.$outer.list.getDragEnabled()) {
      let me = DragRecognitionSupport.mouseReleased(e);
      if (me != null) {
        SwingUtilities2.adjustFocus(this.$outer.list);
        if (!this.dragPressDidSelection) {
          this.adjustSelection(me);
        }
      }
    } else {
      this.$outer.list.setValueIsAdjusting(false);
    }
  }
  repaintCellFocus(): void {
    let leadIndex = BasicListUI.adjustIndex(this.$outer.list.getLeadSelectionIndex(), this.$outer.list);
    if (leadIndex !== -1) {
      let r = this.$outer.getCellBounds$JList$int$int(this.$outer.list, leadIndex, leadIndex);
      if (r != null) {
        this.$outer.list.repaint$int$int$int$int(r.x_, r.y_, r.width_, r.height_);
      }
    }
  }
  focusGained(e: FocusEvent): void {
    this.repaintCellFocus();
  }
  focusLost(e: FocusEvent): void {
    this.repaintCellFocus();
  }
}

export class BasicListUI$ListTransferHandler extends TransferHandler {
  _BasicListUI$ListTransferHandler(): this {
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
    if (c instanceof JList) {
      let list = c;
      let values = list.getSelectedValues();
      if (values == null || values.length === 0) {
        return null;
      }
      let plainStr = new StringBuilder();
      let htmlStr = new StringBuilder();
      htmlStr.append('<html>\n<body>\n<ul>\n');
      for (let i = 0; i < values.length; i++) {
        let obj = values[i];
        let val = ((obj == null) ? '' : $J.str(obj));
        plainStr.append(val).append(String.fromCharCode(10 /* \u000a */));
        htmlStr.append('  <li>').append(val).append(String.fromCharCode(10 /* \u000a */));
      }
      plainStr.deleteCharAt((plainStr.length() - 1) | 0);
      htmlStr.append('</ul>\n</body>\n</html>');
      return new BasicTransferable()._BasicTransferable(plainStr.toString(), htmlStr.toString());
    }
    return null;
  }
  getSourceActions(c: JComponent): number {
    return TransferHandler.COPY;
  }
}

$J.define(BasicListUI, 'javax.swing.plaf.basic.BasicListUI', { kind: 'class', sup: 'javax.swing.plaf.ListUI', ctors: { '': '_BasicListUI' }, meths: { 'getCellBounds(javax.swing.JList,int)': 'getCellBounds$JList$int$BasicListUI', 'getCellBounds(javax.swing.JList,int,int)': 'getCellBounds$JList$int$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' }, clinit: true, lazy: ['BASELINE_COMPONENT_KEY', 'defaultTransferHandler'] });
$J.define(BasicListUI$Actions, 'javax.swing.plaf.basic.BasicListUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicListUI$Actions' } });
$J.define(BasicListUI$Handler, 'javax.swing.plaf.basic.BasicListUI$Handler', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'java.awt.event.KeyListener', 'javax.swing.event.ListDataListener', 'javax.swing.event.ListSelectionListener', 'javax.swing.event.MouseInputListener', 'java.beans.PropertyChangeListener', 'javax.swing.plaf.basic.DragRecognitionSupport$BeforeDrag'], sup: 'java.lang.Object', ctors: { '': '_BasicListUI$Handler' }, inner: true });
$J.define(BasicListUI$ListTransferHandler, 'javax.swing.plaf.basic.BasicListUI$ListTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.TransferHandler', ctors: { '': '_BasicListUI$ListTransferHandler' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  Point2D = $J.load('java.awt.geom.Point2D');
  Action = $J.load('javax.swing.Action');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  DefaultListCellRenderer = $J.load('javax.swing.DefaultListCellRenderer');
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  JComponent = $J.load('javax.swing.JComponent');
  JList = $J.load('javax.swing.JList');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  BasicTransferable = $J.load('javax.swing.plaf.basic.BasicTransferable');
  DragRecognitionSupport = $J.load('javax.swing.plaf.basic.DragRecognitionSupport');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
