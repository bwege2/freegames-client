// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JTable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Applet, DateFormat, Double, Exception, Float, IllegalArgumentException, JBoolean, JDate, JEnum, JNumber, JObject, JString, NumberFormat, ReflectUtil } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { TransferHandler$DropLocation } from './TransferHandler.ts';
import { DefaultTableCellRenderer$UIResource } from './table/DefaultTableCellRenderer.ts';
import { JCheckBox } from './JCheckBox.ts';
import { JCheckBox$AccessibleJCheckBox } from './JCheckBox.ts';
import { DefaultCellEditor } from './DefaultCellEditor.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';
import { AccessibleContext } from '../accessibility/AccessibleContext.ts';

let Color, Dimension, GraphicsEnvironment, HeadlessException, KeyboardFocusManager, Point, Rectangle, Window, KeyEvent, MouseEvent, Accessible, AccessibleTableModelChange, DefaultListSelectionModel, DropMode, Icon, ImageIcon, JScrollPane, JTextField, JViewport, ListSelectionModel, ScrollPaneConstants, SwingConstants, SwingUtilities, ToolTipManager, UIDefaults, UIManager, EmptyBorder, LineBorder, RowSorterEvent$Type, TableModelEvent, UIResource, AbstractTableModel, DefaultTableColumnModel, DefaultTableModel, JTableHeader, TableCellEditor, TableColumn, TableColumnModel, TableModel, TableRowSorter, AWTAccessor, SwingUtilities2, SwingUtilities2$Section;

/**
 * The <code>JTable</code> is used to display and edit regular two-dimensional tables
 * of cells.
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/table.html">How to Use Tables</a>
 * in <em>The Java Tutorial</em>
 * for task-oriented documentation and examples of using <code>JTable</code>.
 *
 * <p>
 * The <code>JTable</code> has many
 * facilities that make it possible to customize its rendering and editing
 * but provides defaults for these features so that simple tables can be
 * set up easily.  For example, to set up a table with 10 rows and 10
 * columns of numbers:
 *
 * <pre>
 *      TableModel dataModel = new AbstractTableModel() {
 *          public int getColumnCount() { return 10; }
 *          public int getRowCount() { return 10;}
 *          public Object getValueAt(int row, int col) { return Integer.valueOf(row*col); }
 *      };
 *      JTable table = new JTable(dataModel);
 *      JScrollPane scrollpane = new JScrollPane(table);
 * </pre>
 * <p>
 * {@code JTable}s are typically placed inside of a {@code JScrollPane}.  By
 * default, a {@code JTable} will adjust its width such that
 * a horizontal scrollbar is unnecessary.  To allow for a horizontal scrollbar,
 * invoke {@link #setAutoResizeMode} with {@code AUTO_RESIZE_OFF}.
 * Note that if you wish to use a <code>JTable</code> in a standalone
 * view (outside of a <code>JScrollPane</code>) and want the header
 * displayed, you can get it using {@link #getTableHeader} and
 * display it separately.
 * <p>
 * To enable sorting and filtering of rows, use a
 * {@code RowSorter}.
 * You can set up a row sorter in either of two ways:
 * <ul>
 *   <li>Directly set the {@code RowSorter}. For example:
 *        {@code table.setRowSorter(new TableRowSorter(model))}.
 *   <li>Set the {@code autoCreateRowSorter}
 *       property to {@code true}, so that the {@code JTable}
 *       creates a {@code RowSorter} for
 *       you. For example: {@code setAutoCreateRowSorter(true)}.
 * </ul>
 * <p>
 * When designing applications that use the <code>JTable</code> it is worth paying
 * close attention to the data structures that will represent the table's data.
 * The <code>DefaultTableModel</code> is a model implementation that
 * uses a <code>Vector</code> of <code>Vector</code>s of <code>Object</code>s to
 * store the cell values. As well as copying the data from an
 * application into the <code>DefaultTableModel</code>,
 * it is also possible to wrap the data in the methods of the
 * <code>TableModel</code> interface so that the data can be passed to the
 * <code>JTable</code> directly, as in the example above. This often results
 * in more efficient applications because the model is free to choose the
 * internal representation that best suits the data.
 * A good rule of thumb for deciding whether to use the <code>AbstractTableModel</code>
 * or the <code>DefaultTableModel</code> is to use the <code>AbstractTableModel</code>
 * as the base class for creating subclasses and the <code>DefaultTableModel</code>
 * when subclassing is not required.
 * <p>
 * The "TableExample" directory in the demo area of the source distribution
 * gives a number of complete examples of <code>JTable</code> usage,
 * covering how the <code>JTable</code> can be used to provide an
 * editable view of data taken from a database and how to modify
 * the columns in the display to use specialized renderers and editors.
 * <p>
 * The <code>JTable</code> uses integers exclusively to refer to both the rows and the columns
 * of the model that it displays. The <code>JTable</code> simply takes a tabular range of cells
 * and uses <code>getValueAt(int, int)</code> to retrieve the
 * values from the model during painting.  It is important to remember that
 * the column and row indexes returned by various <code>JTable</code> methods
 * are in terms of the <code>JTable</code> (the view) and are not
 * necessarily the same indexes used by the model.
 * <p>
 * By default, columns may be rearranged in the <code>JTable</code> so that the
 * view's columns appear in a different order to the columns in the model.
 * This does not affect the implementation of the model at all: when the
 * columns are reordered, the <code>JTable</code> maintains the new order of the columns
 * internally and converts its column indices before querying the model.
 * <p>
 * So, when writing a <code>TableModel</code>, it is not necessary to listen for column
 * reordering events as the model will be queried in its own coordinate
 * system regardless of what is happening in the view.
 * In the examples area there is a demonstration of a sorting algorithm making
 * use of exactly this technique to interpose yet another coordinate system
 * where the order of the rows is changed, rather than the order of the columns.
 * <p>
 * Similarly when using the sorting and filtering functionality
 * provided by <code>RowSorter</code> the underlying
 * <code>TableModel</code> does not need to know how to do sorting,
 * rather <code>RowSorter</code> will handle it.  Coordinate
 * conversions will be necessary when using the row based methods of
 * <code>JTable</code> with the underlying <code>TableModel</code>.
 * All of <code>JTable</code>s row based methods are in terms of the
 * <code>RowSorter</code>, which is not necessarily the same as that
 * of the underlying <code>TableModel</code>.  For example, the
 * selection is always in terms of <code>JTable</code> so that when
 * using <code>RowSorter</code> you will need to convert using
 * <code>convertRowIndexToView</code> or
 * <code>convertRowIndexToModel</code>.  The following shows how to
 * convert coordinates from <code>JTable</code> to that of the
 * underlying model:
 * <pre>
 *   int[] selection = table.getSelectedRows();
 *   for (int i = 0; i &lt; selection.length; i++) {
 *     selection[i] = table.convertRowIndexToModel(selection[i]);
 *   }
 *   // selection is now in terms of the underlying TableModel
 * </pre>
 * <p>
 * By default if sorting is enabled <code>JTable</code> will persist the
 * selection and variable row heights in terms of the model on
 * sorting.  For example if row 0, in terms of the underlying model,
 * is currently selected, after the sort row 0, in terms of the
 * underlying model will be selected.  Visually the selection may
 * change, but in terms of the underlying model it will remain the
 * same.  The one exception to that is if the model index is no longer
 * visible or was removed.  For example, if row 0 in terms of model
 * was filtered out the selection will be empty after the sort.
 * <p>
 * J2SE 5 adds methods to <code>JTable</code> to provide convenient access to some
 * common printing needs. Simple new {@link #print()} methods allow for quick
 * and easy addition of printing support to your application. In addition, a new
 * {@link #getPrintable} method is available for more advanced printing needs.
 * <p>
 * As for all <code>JComponent</code> classes, you can use
 * {@link InputMap} and {@link ActionMap} to associate an
 * {@link Action} object with a {@link KeyStroke} and execute the
 * action under specified conditions.
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @author Shannon Hickey (printing support)
 * @see javax.swing.table.DefaultTableModel
 * @see javax.swing.table.TableRowSorter
 * @since 1.2
 */
export class JTable extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TableUI';
  /**
   * Do not adjust column widths automatically; use a horizontal scrollbar instead.
   */
  static readonly AUTO_RESIZE_OFF: number = 0;
  /**
   * When a column is adjusted in the UI, adjust the next column the opposite way.
   */
  static readonly AUTO_RESIZE_NEXT_COLUMN: number = 1;
  /**
   * During UI adjustment, change subsequent columns to preserve the total width;
   * this is the default behavior.
   */
  static readonly AUTO_RESIZE_SUBSEQUENT_COLUMNS: number = 2;
  /**
   * During all resize operations, apply adjustments to the last column only.
   */
  static readonly AUTO_RESIZE_LAST_COLUMN: number = 3;
  /**
   * During all resize operations, proportionately resize all columns.
   */
  static readonly AUTO_RESIZE_ALL_COLUMNS: number = 4;
  /**
   * The <code>TableModel</code> of the table.
   */
  dataModel: TableModel = null;
  /**
   * The <code>TableColumnModel</code> of the table.
   */
  columnModel: TableColumnModel = null;
  /**
   * The <code>ListSelectionModel</code> of the table, used to keep track of row selections.
   */
  selectionModel: ListSelectionModel = null;
  /**
   * The <code>TableHeader</code> working with the table.
   */
  tableHeader: JTableHeader = null;
  /**
   * The height in pixels of each row in the table.
   */
  rowHeight: number = 0;
  /**
   * The height in pixels of the margin between the cells in each row.
   */
  rowMargin: number = 0;
  /**
   * The color of the grid.
   */
  gridColor: Color = null;
  /**
   * The table draws horizontal lines between cells if <code>showHorizontalLines</code> is true.
   */
  showHorizontalLines: boolean = false;
  /**
   * The table draws vertical lines between cells if <code>showVerticalLines</code> is true.
   */
  showVerticalLines: boolean = false;
  /**
   * Determines if the table automatically resizes the
   *  width of the table's columns to take up the entire width of the
   *  table, and how it does the resizing.
   */
  autoResizeMode: number = 0;
  /**
   * The table will query the <code>TableModel</code> to build the default
   *  set of columns if this is true.
   */
  autoCreateColumnsFromModel: boolean = false;
  /**
   * Used by the <code>Scrollable</code> interface to determine the initial visible area.
   */
  preferredViewportSize: Dimension = null;
  /**
   * True if row selection is allowed in this table.
   */
  rowSelectionAllowed: boolean = false;
  /**
   * Obsolete as of Java 2 platform v1.3.  Please use the
   * <code>rowSelectionAllowed</code> property and the
   * <code>columnSelectionAllowed</code> property of the
   * <code>columnModel</code> instead. Or use the
   * method <code>getCellSelectionEnabled</code>.
   */
  cellSelectionEnabled: boolean = false;
  /**
   * If editing, the <code>Component</code> that is handling the editing.
   */
  editorComp: Component = null;
  /**
   * The active cell editor object, that overwrites the screen real estate
   * occupied by the current cell and allows the user to change its contents.
   * {@code null} if the table isn't currently editing.
   */
  cellEditor: TableCellEditor = null;
  /**
   * Identifies the column of the cell being edited.
   */
  editingColumn: number = 0;
  /**
   * Identifies the row of the cell being edited.
   */
  editingRow: number = 0;
  /**
   * A table of objects that display the contents of a cell,
   * indexed by class as declared in <code>getColumnClass</code>
   * in the <code>TableModel</code> interface.
   */
  defaultRenderersByColumnClass: Hashtable<any, any> = null;
  /**
   * A table of objects that display and edit the contents of a cell,
   * indexed by class as declared in <code>getColumnClass</code>
   * in the <code>TableModel</code> interface.
   */
  defaultEditorsByColumnClass: Hashtable<any, any> = null;
  /**
   * The foreground color of selected cells.
   */
  selectionForeground: Color = null;
  /**
   * The background color of selected cells.
   */
  selectionBackground: Color = null;
  rowModel: SizeSequence = null;
  dragEnabled: boolean = false;
  surrendersFocusOnKeystroke: boolean = false;
  editorRemover: PropertyChangeListener = null;
  /**
   * The last value of getValueIsAdjusting from the column selection models
   * columnSelectionChanged notification. Used to test if a repaint is
   * needed.
   */
  columnSelectionAdjusting: boolean = false;
  /**
   * The last value of getValueIsAdjusting from the row selection models
   * valueChanged notification. Used to test if a repaint is needed.
   */
  rowSelectionAdjusting: boolean = false;
  /**
   * To communicate errors between threads during printing.
   */
  printError: Throwable = null;
  /**
   * True when setRowHeight(int) has been invoked.
   */
  isRowHeightSet: boolean = false;
  /**
   * If true, on a sort the selection is reset.
   */
  updateSelectionOnSort: boolean = false;
  /**
   * Information used in sorting.
   */
  sortManager: JTable$SortManager = null;
  /**
   * If true, when sorterChanged is invoked it's value is ignored.
   */
  ignoreSortChange: boolean = false;
  /**
   * Whether or not sorterChanged has been invoked.
   */
  sorterChanged_: boolean = false;
  /**
   * If true, any time the model changes a new RowSorter is set.
   */
  autoCreateRowSorter: boolean = false;
  /**
   * Whether or not the table always fills the viewport height.
   * @see #setFillsViewportHeight
   * @see #getScrollableTracksViewportHeight
   */
  fillsViewportHeight: boolean = false;
  /**
   * The drop mode for this component.
   */
  dropMode: DropMode = null;
  /**
   * The drop location.
   */
  dropLocation: JTable$DropLocation = null;
  /**
   * Flag to indicate UI update is in progress
   */
  updateInProgress: boolean = false;
  $init_JTable() {
    this.editorRemover = null;
    this.dropMode = DropMode.USE_SELECTION;
  }
  /**
   * Constructs a default <code>JTable</code> that is initialized with a default
   * data model, a default column model, and a default selection
   * model.
   *
   * @see #createDefaultDataModel
   * @see #createDefaultColumnModel
   * @see #createDefaultSelectionModel
   */
  _JTable$(): this {
    this._JTable$TableModel$TableColumnModel$ListSelectionModel(null, null, null);
    return this;
  }
  /**
   * Constructs a <code>JTable</code> that is initialized with
   * <code>dm</code> as the data model, a default column model,
   * and a default selection model.
   *
   * @param dm        the data model for the table
   * @see #createDefaultColumnModel
   * @see #createDefaultSelectionModel
   */
  _JTable$TableModel(dm: TableModel): this {
    this._JTable$TableModel$TableColumnModel$ListSelectionModel(dm, null, null);
    return this;
  }
  /**
   * Constructs a <code>JTable</code> that is initialized with
   * <code>dm</code> as the data model, <code>cm</code>
   * as the column model, and a default selection model.
   *
   * @param dm        the data model for the table
   * @param cm        the column model for the table
   * @see #createDefaultSelectionModel
   */
  _JTable$TableModel$TableColumnModel(dm: TableModel, cm: TableColumnModel): this {
    this._JTable$TableModel$TableColumnModel$ListSelectionModel(dm, cm, null);
    return this;
  }
  /**
   * Constructs a <code>JTable</code> that is initialized with
   * <code>dm</code> as the data model, <code>cm</code> as the
   * column model, and <code>sm</code> as the selection model.
   * If any of the parameters are <code>null</code> this method
   * will initialize the table with the corresponding default model.
   * The <code>autoCreateColumnsFromModel</code> flag is set to false
   * if <code>cm</code> is non-null, otherwise it is set to true
   * and the column model is populated with suitable
   * <code>TableColumns</code> for the columns in <code>dm</code>.
   *
   * @param dm        the data model for the table
   * @param cm        the column model for the table
   * @param sm        the row selection model for the table
   * @see #createDefaultDataModel
   * @see #createDefaultColumnModel
   * @see #createDefaultSelectionModel
   */
  _JTable$TableModel$TableColumnModel$ListSelectionModel(dm: TableModel, cm: TableColumnModel, sm: ListSelectionModel): this {
    this._JComponent();
    this.$init_JTable();
    this.setLayout(null);
    this.setFocusTraversalKeys(KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, JComponent.getManagingFocusForwardTraversalKeys());
    this.setFocusTraversalKeys(KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, JComponent.getManagingFocusBackwardTraversalKeys());
    if (cm == null) {
      cm = this.createDefaultColumnModel();
      this.autoCreateColumnsFromModel = true;
    }
    this.setColumnModel(cm);
    if (sm == null) {
      sm = this.createDefaultSelectionModel();
    }
    this.setSelectionModel(sm);
    if (dm == null) {
      dm = this.createDefaultDataModel();
    }
    this.setModel(dm);
    this.initializeLocalVars();
    this.updateUI();
    return this;
  }
  /**
   * Constructs a <code>JTable</code> with <code>numRows</code>
   * and <code>numColumns</code> of empty cells using
   * <code>DefaultTableModel</code>.  The columns will have
   * names of the form "A", "B", "C", etc.
   *
   * @param numRows           the number of rows the table holds
   * @param numColumns        the number of columns the table holds
   * @see javax.swing.table.DefaultTableModel
   */
  _JTable$int$int(numRows: number, numColumns: number): this {
    this._JTable$TableModel(new DefaultTableModel()._DefaultTableModel$int$int(numRows, numColumns));
    return this;
  }
  /**
   * Constructs a <code>JTable</code> to display the values in the
   * <code>Vector</code> of <code>Vectors</code>, <code>rowData</code>,
   * with column names, <code>columnNames</code>.  The
   * <code>Vectors</code> contained in <code>rowData</code>
   * should contain the values for that row. In other words,
   * the value of the cell at row 1, column 5 can be obtained
   * with the following code:
   *
   * <pre>((Vector)rowData.elementAt(1)).elementAt(5);</pre>
   *
   * @param rowData           the data for the new table
   * @param columnNames       names of each column
   */
  _JTable$Vector$Vector(rowData: Vector<Vector>, columnNames: Vector<any>): this {
    this._JTable$TableModel(new DefaultTableModel()._DefaultTableModel$Vector$Vector(rowData, columnNames));
    return this;
  }
  /**
   * Constructs a <code>JTable</code> to display the values in the two dimensional array,
   * <code>rowData</code>, with column names, <code>columnNames</code>.
   * <code>rowData</code> is an array of rows, so the value of the cell at row 1,
   * column 5 can be obtained with the following code:
   *
   * <pre> rowData[1][5]; </pre>
   * <p>
   * All rows must be of the same length as <code>columnNames</code>.
   *
   * @param rowData           the data for the new table
   * @param columnNames       names of each column
   */
  _JTable$ObjectArrArr$ObjectArr(rowData: any[][], columnNames: any[]): this {
    this._JTable$TableModel(new (JTable$1())().$o(this).$c(columnNames, rowData)._AbstractTableModel());
    return this;
  }
  /**
   * Calls the <code>configureEnclosingScrollPane</code> method.
   *
   * @see #configureEnclosingScrollPane
   */
  addNotify(): void {
    super.addNotify();
    this.configureEnclosingScrollPane();
  }
  /**
   * If this <code>JTable</code> is the <code>viewportView</code> of an enclosing <code>JScrollPane</code>
   * (the usual situation), configure this <code>ScrollPane</code> by, amongst other things,
   * installing the table's <code>tableHeader</code> as the <code>columnHeaderView</code> of the scroll pane.
   * When a <code>JTable</code> is added to a <code>JScrollPane</code> in the usual way,
   * using <code>new JScrollPane(myTable)</code>, <code>addNotify</code> is
   * called in the <code>JTable</code> (when the table is added to the viewport).
   * <code>JTable</code>'s <code>addNotify</code> method in turn calls this method,
   * which is protected so that this default installation procedure can
   * be overridden by a subclass.
   *
   * @see #addNotify
   */
  configureEnclosingScrollPane(): void {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      let port = parent;
      let gp = port.getParent();
      if (gp instanceof JScrollPane) {
        let scrollPane = gp;
        let viewport = scrollPane.getViewport();
        if (viewport == null || SwingUtilities.getUnwrappedView(viewport) !== this) {
          return;
        }
        scrollPane.setColumnHeaderView(this.getTableHeader());
        this.configureEnclosingScrollPaneUI();
      }
    }
  }
  /**
   * This is a sub-part of configureEnclosingScrollPane() that configures
   * anything on the scrollpane that may change when the look and feel
   * changes. It needed to be split out from configureEnclosingScrollPane() so
   * that it can be called from updateUI() when the LAF changes without
   * causing the regression found in bug 6687962. This was because updateUI()
   * is called from the constructor which then caused
   * configureEnclosingScrollPane() to be called by the constructor which
   * changes its contract for any subclass that overrides it. So by splitting
   * it out in this way configureEnclosingScrollPaneUI() can be called both
   * from configureEnclosingScrollPane() and updateUI() in a safe manor.
   */
  configureEnclosingScrollPaneUI(): void {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      let port = parent;
      let gp = port.getParent();
      if (gp instanceof JScrollPane) {
        let scrollPane = gp;
        let viewport = scrollPane.getViewport();
        if (viewport == null || SwingUtilities.getUnwrappedView(viewport) !== this) {
          return;
        }
        let border = scrollPane.getBorder();
        if (border == null || $J.isa(border, UIResource)) {
          let scrollPaneBorder = UIManager.getBorder$Object('Table.scrollPaneBorder');
          if (scrollPaneBorder != null) {
            scrollPane.setBorder(scrollPaneBorder);
          }
        }
        let corner = scrollPane.getCorner(ScrollPaneConstants.UPPER_TRAILING_CORNER);
        if (corner == null || $J.isa(corner, UIResource)) {
          corner = null;
          try {
            corner = UIManager.get$Object('Table.scrollPaneCornerComponent');
          } catch ($e0) {
            if ($J.isa($e0, Exception)) {
              let e = $J.exc($e0);
            } else {
              throw $e0;
            }
          }
          scrollPane.setCorner(ScrollPaneConstants.UPPER_TRAILING_CORNER, corner);
        }
      }
    }
  }
  /**
   * Calls the <code>unconfigureEnclosingScrollPane</code> method.
   *
   * @see #unconfigureEnclosingScrollPane
   */
  removeNotify(): void {
    KeyboardFocusManager.getCurrentKeyboardFocusManager$().removePropertyChangeListener$String$PropertyChangeListener('permanentFocusOwner', this.editorRemover);
    this.editorRemover = null;
    this.unconfigureEnclosingScrollPane();
    super.removeNotify();
  }
  /**
   * Reverses the effect of <code>configureEnclosingScrollPane</code>
   * by replacing the <code>columnHeaderView</code> of the enclosing
   * scroll pane with <code>null</code>. <code>JTable</code>'s
   * <code>removeNotify</code> method calls
   * this method, which is protected so that this default uninstallation
   * procedure can be overridden by a subclass.
   *
   * @see #removeNotify
   * @see #configureEnclosingScrollPane
   * @since 1.3
   */
  unconfigureEnclosingScrollPane(): void {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      let port = parent;
      let gp = port.getParent();
      if (gp instanceof JScrollPane) {
        let scrollPane = gp;
        let viewport = scrollPane.getViewport();
        if (viewport == null || SwingUtilities.getUnwrappedView(viewport) !== this) {
          return;
        }
        scrollPane.setColumnHeaderView(null);
        let corner = scrollPane.getCorner(ScrollPaneConstants.UPPER_TRAILING_CORNER);
        if ($J.isa(corner, UIResource)) {
          scrollPane.setCorner(ScrollPaneConstants.UPPER_TRAILING_CORNER, null);
        }
      }
    }
  }
  setUIProperty(propertyName: string, value: any): void {
    if (propertyName === 'rowHeight') {
      if (!this.isRowHeightSet) {
        this.setRowHeight$int($J.d2i(+(value)));
        this.isRowHeightSet = false;
      }
      return;
    }
    super.setUIProperty(propertyName, value);
  }
  /**
   * Equivalent to <code>new JScrollPane(aTable)</code>.
   *
   * @param aTable a {@code JTable} to be used for the scroll pane
   * @return a {@code JScrollPane} created using {@code aTable}
   * @deprecated As of Swing version 1.0.2,
   * replaced by <code>new JScrollPane(aTable)</code>.
   */
  static createScrollPaneForTable(aTable: JTable): JScrollPane {
    return new JScrollPane()._JScrollPane$Component(aTable);
  }
  /**
   * Sets the <code>tableHeader</code> working with this <code>JTable</code> to <code>newHeader</code>.
   * It is legal to have a <code>null</code> <code>tableHeader</code>.
   *
   * @param   tableHeader                       new tableHeader
   * @see     #getTableHeader
   */
  setTableHeader(tableHeader: JTableHeader): void {
    if (this.tableHeader !== tableHeader) {
      let old = this.tableHeader;
      if (old != null) {
        old.setTable(null);
      }
      this.tableHeader = tableHeader;
      if (tableHeader != null) {
        tableHeader.setTable(this);
      }
      this.firePropertyChange$String$Object$Object('tableHeader', old, tableHeader);
    }
  }
  /**
   * Returns the <code>tableHeader</code> used by this <code>JTable</code>.
   *
   * @return  the <code>tableHeader</code> used by this table
   * @see     #setTableHeader
   */
  getTableHeader(): JTableHeader {
    return this.tableHeader;
  }
  /**
   * Sets the height, in pixels, of all cells to <code>rowHeight</code>,
   * revalidates, and repaints.
   * The height of the cells will be equal to the row height minus
   * the row margin.
   *
   * @param   rowHeight                       new row height
   * @throws IllegalArgumentException      if <code>rowHeight</code> is
   *                                          less than 1
   * @see     #getRowHeight
   */
  setRowHeight$int(rowHeight: number): void {
    if (rowHeight <= 0) {
      throw new IllegalArgumentException('New row height less than 1');
    }
    let old = this.rowHeight;
    this.rowHeight = rowHeight;
    this.rowModel = null;
    if (this.sortManager != null) {
      this.sortManager.modelRowSizes = null;
    }
    this.isRowHeightSet = true;
    this.resizeAndRepaint();
    this.firePropertyChange$String$int$int('rowHeight', old, rowHeight);
  }
  /**
   * Returns the height of a table row, in pixels.
   *
   * @return  the height in pixels of a table row
   * @see     #setRowHeight
   */
  getRowHeight$(): number {
    return this.rowHeight;
  }
  /**
   * Returns the height, in pixels, of the cells in <code>row</code>.
   * @param   row              the row whose height is to be returned
   * @return the height, in pixels, of the cells in the row
   * @since 1.3
   */
  getRowHeight$int(row: number): number {
    return (this.rowModel == null) ? this.getRowHeight$() : this.rowModel.getSize(row);
  }
  /**
   * Sets the amount of empty space between cells in adjacent rows.
   *
   * @param  rowMargin  the number of pixels between cells in a row
   * @see     #getRowMargin
   */
  setRowMargin(rowMargin: number): void {
    let old = this.rowMargin;
    this.rowMargin = rowMargin;
    this.resizeAndRepaint();
    this.firePropertyChange$String$int$int('rowMargin', old, rowMargin);
  }
  /**
   * Gets the amount of empty space, in pixels, between cells. Equivalent to:
   * <code>getIntercellSpacing().height</code>.
   * @return the number of pixels between cells in a row
   *
   * @see     #setRowMargin
   */
  getRowMargin(): number {
    return this.rowMargin;
  }
  /**
   * Sets the <code>rowMargin</code> and the <code>columnMargin</code> --
   * the height and width of the space between cells -- to
   * <code>intercellSpacing</code>.
   *
   * @param   intercellSpacing        a <code>Dimension</code>
   *                                  specifying the new width
   *                                  and height between cells
   * @see     #getIntercellSpacing
   */
  setIntercellSpacing(intercellSpacing: Dimension): void {
    this.setRowMargin(intercellSpacing.height_);
    this.getColumnModel().setColumnMargin(intercellSpacing.width_);
    this.resizeAndRepaint();
  }
  /**
   * Sets the color used to draw grid lines to <code>gridColor</code> and redisplays.
   * The default color is look and feel dependent.
   *
   * @param   gridColor                       the new color of the grid lines
   * @throws IllegalArgumentException      if <code>gridColor</code> is <code>null</code>
   * @see     #getGridColor
   */
  setGridColor(gridColor: Color): void {
    if (gridColor == null) {
      throw new IllegalArgumentException('New color is null');
    }
    let old = this.gridColor;
    this.gridColor = gridColor;
    this.firePropertyChange$String$Object$Object('gridColor', old, gridColor);
    this.repaint$();
  }
  /**
   * Returns the color used to draw grid lines.
   * The default color is look and feel dependent.
   *
   * @return  the color used to draw grid lines
   * @see     #setGridColor
   */
  getGridColor(): Color {
    return this.gridColor;
  }
  /**
   * Sets whether the table draws grid lines around cells.
   *  If <code>showGrid</code> is true it does; if it is false it doesn't.
   *  There is no <code>getShowGrid</code> method as this state is held
   *  in two variables -- <code>showHorizontalLines</code> and <code>showVerticalLines</code> --
   *  each of which can be queried independently.
   *
   * @param   showGrid                 true if table view should draw grid lines
   *
   * @see     #setShowVerticalLines
   * @see     #setShowHorizontalLines
   */
  setShowGrid(showGrid: boolean): void {
    this.setShowHorizontalLines(showGrid);
    this.setShowVerticalLines(showGrid);
    this.repaint$();
  }
  /**
   * Sets whether the table draws horizontal lines between cells.
   *  If <code>showHorizontalLines</code> is true it does; if it is false it doesn't.
   *
   * @param   showHorizontalLines      true if table view should draw horizontal lines
   * @see     #getShowHorizontalLines
   * @see     #setShowGrid
   * @see     #setShowVerticalLines
   */
  setShowHorizontalLines(showHorizontalLines: boolean): void {
    let old = this.showHorizontalLines;
    this.showHorizontalLines = showHorizontalLines;
    this.firePropertyChange$String$boolean$boolean('showHorizontalLines', old, showHorizontalLines);
    this.repaint$();
  }
  /**
   * Sets whether the table draws vertical lines between cells.
   *  If <code>showVerticalLines</code> is true it does; if it is false it doesn't.
   *
   * @param   showVerticalLines              true if table view should draw vertical lines
   * @see     #getShowVerticalLines
   * @see     #setShowGrid
   * @see     #setShowHorizontalLines
   */
  setShowVerticalLines(showVerticalLines: boolean): void {
    let old = this.showVerticalLines;
    this.showVerticalLines = showVerticalLines;
    this.firePropertyChange$String$boolean$boolean('showVerticalLines', old, showVerticalLines);
    this.repaint$();
  }
  /**
   * Returns true if the table draws horizontal lines between cells, false if it
   * doesn't. The default value is look and feel dependent.
   *
   * @return  true if the table draws horizontal lines between cells, false if it
   *          doesn't
   * @see     #setShowHorizontalLines
   */
  getShowHorizontalLines(): boolean {
    return this.showHorizontalLines;
  }
  /**
   * Returns true if the table draws vertical lines between cells, false if it
   * doesn't. The default value is look and feel dependent.
   *
   * @return  true if the table draws vertical lines between cells, false if it
   *          doesn't
   * @see     #setShowVerticalLines
   */
  getShowVerticalLines(): boolean {
    return this.showVerticalLines;
  }
  /**
   * Sets the table's auto resize mode when the table is resized.  For further
   * information on how the different resize modes work, see
   * {@link #doLayout}.
   *
   * @param   mode One of 5 legal values:
   *                   AUTO_RESIZE_OFF,
   *                   AUTO_RESIZE_NEXT_COLUMN,
   *                   AUTO_RESIZE_SUBSEQUENT_COLUMNS,
   *                   AUTO_RESIZE_LAST_COLUMN,
   *                   AUTO_RESIZE_ALL_COLUMNS
   *
   * @see     #getAutoResizeMode
   * @see     #doLayout
   */
  setAutoResizeMode(mode: number): void {
    if (JTable.isValidAutoResizeMode(mode)) {
      let old = this.autoResizeMode;
      this.autoResizeMode = mode;
      this.resizeAndRepaint();
      if (this.tableHeader != null) {
        this.tableHeader.resizeAndRepaint();
      }
      this.firePropertyChange$String$int$int('autoResizeMode', old, this.autoResizeMode);
    }
  }
  static isValidAutoResizeMode(mode: number): boolean {
    return (mode === JTable.AUTO_RESIZE_OFF) || (mode === JTable.AUTO_RESIZE_NEXT_COLUMN) || (mode === JTable.AUTO_RESIZE_SUBSEQUENT_COLUMNS) || (mode === JTable.AUTO_RESIZE_LAST_COLUMN) || (mode === JTable.AUTO_RESIZE_ALL_COLUMNS);
  }
  /**
   * Returns the auto resize mode of the table.  The default mode
   * is AUTO_RESIZE_SUBSEQUENT_COLUMNS.
   *
   * @return  the autoResizeMode of the table
   *
   * @see     #setAutoResizeMode
   * @see     #doLayout
   */
  getAutoResizeMode(): number {
    return this.autoResizeMode;
  }
  /**
   * Sets this table's <code>autoCreateColumnsFromModel</code> flag.
   * This method calls <code>createDefaultColumnsFromModel</code> if
   * <code>autoCreateColumnsFromModel</code> changes from false to true.
   *
   * @param   autoCreateColumnsFromModel   true if <code>JTable</code> should automatically create columns
   * @see     #getAutoCreateColumnsFromModel
   * @see     #createDefaultColumnsFromModel
   */
  setAutoCreateColumnsFromModel(autoCreateColumnsFromModel: boolean): void {
    if (this.autoCreateColumnsFromModel !== autoCreateColumnsFromModel) {
      let old = this.autoCreateColumnsFromModel;
      this.autoCreateColumnsFromModel = autoCreateColumnsFromModel;
      if (autoCreateColumnsFromModel) {
        this.createDefaultColumnsFromModel();
      }
      this.firePropertyChange$String$boolean$boolean('autoCreateColumnsFromModel', old, autoCreateColumnsFromModel);
    }
  }
  /**
   * Determines whether the table will create default columns from the model.
   * If true, <code>setModel</code> will clear any existing columns and
   * create new columns from the new model.  Also, if the event in
   * the <code>tableChanged</code> notification specifies that the
   * entire table changed, then the columns will be rebuilt.
   * The default is true.
   *
   * @return  the autoCreateColumnsFromModel of the table
   * @see     #setAutoCreateColumnsFromModel
   * @see     #createDefaultColumnsFromModel
   */
  getAutoCreateColumnsFromModel(): boolean {
    return this.autoCreateColumnsFromModel;
  }
  /**
   * Creates default columns for the table from
   * the data model using the <code>getColumnCount</code> method
   * defined in the <code>TableModel</code> interface.
   * <p>
   * Clears any existing columns before creating the
   * new columns based on information from the model.
   *
   * @see     #getAutoCreateColumnsFromModel
   */
  createDefaultColumnsFromModel(): void {
    let m = this.getModel();
    if (m != null) {
      let cm = this.getColumnModel();
      while (cm.getColumnCount() > 0) {
        cm.removeColumn(cm.getColumn(0));
      }
      for (let i = 0; i < m.getColumnCount(); i++) {
        let newColumn = new TableColumn()._TableColumn$int(i);
        this.addColumn(newColumn);
      }
    }
  }
  /**
   * Sets a default cell renderer to be used if no renderer has been set in
   * a <code>TableColumn</code>. If renderer is <code>null</code>,
   * removes the default renderer for this column class.
   *
   * @param  columnClass     set the default cell renderer for this columnClass
   * @param  renderer        default cell renderer to be used for this
   *                         columnClass
   * @see     #getDefaultRenderer
   * @see     #setDefaultEditor
   */
  setDefaultRenderer(columnClass: JClass<any>, renderer: TableCellRenderer): void {
    if (renderer != null) {
      this.defaultRenderersByColumnClass.put(columnClass, renderer);
    } else {
      this.defaultRenderersByColumnClass.remove(columnClass);
    }
  }
  /**
   * Returns the cell renderer to be used when no renderer has been set in
   * a <code>TableColumn</code>. During the rendering of cells the renderer is fetched from
   * a <code>Hashtable</code> of entries according to the class of the cells in the column. If
   * there is no entry for this <code>columnClass</code> the method returns
   * the entry for the most specific superclass. The <code>JTable</code> installs entries
   * for <code>Object</code>, <code>Number</code>, and <code>Boolean</code>, all of which can be modified
   * or replaced.
   *
   * @param   columnClass   return the default cell renderer
   *                        for this columnClass
   * @return  the renderer for this columnClass
   * @see     #setDefaultRenderer
   * @see     #getColumnClass
   */
  getDefaultRenderer(columnClass: JClass<any>): TableCellRenderer {
    if (columnClass == null) {
      return null;
    } else {
      if (this.defaultRenderersByColumnClass == null) {
        this.createDefaultRenderers();
      }
      let renderer = this.defaultRenderersByColumnClass.get(columnClass);
      if (renderer != null) {
        return renderer;
      } else {
        let c = columnClass.getSuperclass();
        if (c == null && columnClass !== $J.cls(JObject)) {
          c = $J.cls(JObject);
        }
        return this.getDefaultRenderer(c);
      }
    }
  }
  /**
   * Returns the editor to be used when no editor has been set in
   * a <code>TableColumn</code>. During the editing of cells the editor is fetched from
   * a <code>Hashtable</code> of entries according to the class of the cells in the column. If
   * there is no entry for this <code>columnClass</code> the method returns
   * the entry for the most specific superclass. The <code>JTable</code> installs entries
   * for <code>Object</code>, <code>Number</code>, and <code>Boolean</code>, all of which can be modified
   * or replaced.
   *
   * @param   columnClass  return the default cell editor for this columnClass
   * @return the default cell editor to be used for this columnClass
   * @see     #setDefaultEditor
   * @see     #getColumnClass
   */
  getDefaultEditor(columnClass: JClass<any>): TableCellEditor {
    if (columnClass == null) {
      return null;
    } else {
      if (this.defaultEditorsByColumnClass == null) {
        this.createDefaultEditors();
      }
      let editor = this.defaultEditorsByColumnClass.get(columnClass);
      if (editor != null) {
        return editor;
      } else {
        return this.getDefaultEditor(columnClass.getSuperclass());
      }
    }
  }
  /**
   * Turns on or off automatic drag handling. In order to enable automatic
   * drag handling, this property should be set to {@code true}, and the
   * table's {@code TransferHandler} needs to be {@code non-null}.
   * The default value of the {@code dragEnabled} property is {@code false}.
   * <p>
   * The job of honoring this property, and recognizing a user drag gesture,
   * lies with the look and feel implementation, and in particular, the table's
   * {@code TableUI}. When automatic drag handling is enabled, most look and
   * feels (including those that subclass {@code BasicLookAndFeel}) begin a
   * drag and drop operation whenever the user presses the mouse button over
   * an item (in single selection mode) or a selection (in other selection
   * modes) and then moves the mouse a few pixels. Setting this property to
   * {@code true} can therefore have a subtle effect on how selections behave.
   * <p>
   * If a look and feel is used that ignores this property, you can still
   * begin a drag and drop operation by calling {@code exportAsDrag} on the
   * table's {@code TransferHandler}.
   *
   * @param b whether or not to enable automatic drag handling
   * @throws HeadlessException if
   *            <code>b</code> is <code>true</code> and
   *            <code>GraphicsEnvironment.isHeadless()</code>
   *            returns <code>true</code>
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see #getDragEnabled
   * @see #setTransferHandler
   * @see TransferHandler
   * @since 1.4
   */
  setDragEnabled(b: boolean): void {
    this.checkDragEnabled(b);
    this.dragEnabled = b;
  }
  checkDragEnabled(b: boolean): void {
    if (b && GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
  }
  /**
   * Returns whether or not automatic drag handling is enabled.
   *
   * @return the value of the {@code dragEnabled} property
   * @see #setDragEnabled
   * @since 1.4
   */
  getDragEnabled(): boolean {
    return this.dragEnabled;
  }
  static checkDropMode(dropMode: DropMode): void {
    if (dropMode != null) {
      switch (dropMode) {
        case DropMode.USE_SELECTION:
        case DropMode.ON:
        case DropMode.INSERT:
        case DropMode.INSERT_ROWS:
        case DropMode.INSERT_COLS:
        case DropMode.ON_OR_INSERT:
        case DropMode.ON_OR_INSERT_ROWS:
        case DropMode.ON_OR_INSERT_COLS:
          return;
      }
    }
    throw new IllegalArgumentException($J.str(dropMode) + ': Unsupported drop mode for table');
  }
  /**
   * Calculates a drop location in this component, representing where a
   * drop at the given point should insert data.
   *
   * @param p the point to calculate a drop location for
   * @return the drop location, or <code>null</code>
   */
  dropLocationForPoint$Point(p: Point): JTable$DropLocation {
    let location = null;
    let row = this.rowAtPoint(p);
    let col = this.columnAtPoint(p);
    let outside = true === this.getClientProperty('Table.isFileList') && SwingUtilities2.pointOutsidePrefSize(this, row, col, p);
    let rect = this.getCellRect(row, col, true);
    let xSection: SwingUtilities2$Section;
    let ySection: SwingUtilities2$Section;
    let between = false;
    let ltr = this.getComponentOrientation().isLeftToRight();
    switch (this.dropMode) {
      case DropMode.USE_SELECTION:
      case DropMode.ON:
        if (row === -1 || col === -1 || outside) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, -1, -1, false, false);
        } else {
          location = new JTable$DropLocation()._JTable$DropLocation(p, row, col, false, false);
        }
        break;
      case DropMode.INSERT:
        if (row === -1 && col === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, 0, 0, true, true);
          break;
        }
        xSection = SwingUtilities2.liesInHorizontal(rect, p, ltr, true);
        if (row === -1) {
          if (xSection === SwingUtilities2$Section.LEADING) {
            location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), col, true, true);
          } else if (xSection === SwingUtilities2$Section.TRAILING) {
            location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), (col + 1) | 0, true, true);
          } else {
            location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), col, true, false);
          }
        } else if (xSection === SwingUtilities2$Section.LEADING || xSection === SwingUtilities2$Section.TRAILING) {
          ySection = SwingUtilities2.liesInVertical(rect, p, true);
          if (ySection === SwingUtilities2$Section.LEADING) {
            between = true;
          } else if (ySection === SwingUtilities2$Section.TRAILING) {
            row++;
            between = true;
          }
          location = new JTable$DropLocation()._JTable$DropLocation(p, row, xSection === SwingUtilities2$Section.TRAILING ? (col + 1) | 0 : col, between, true);
        } else {
          if (SwingUtilities2.liesInVertical(rect, p, false) === SwingUtilities2$Section.TRAILING) {
            row++;
          }
          location = new JTable$DropLocation()._JTable$DropLocation(p, row, col, true, false);
        }
        break;
      case DropMode.INSERT_ROWS:
        if (row === -1 && col === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, -1, -1, false, false);
          break;
        }
        if (row === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), col, true, false);
          break;
        }
        if (SwingUtilities2.liesInVertical(rect, p, false) === SwingUtilities2$Section.TRAILING) {
          row++;
        }
        location = new JTable$DropLocation()._JTable$DropLocation(p, row, col, true, false);
        break;
      case DropMode.ON_OR_INSERT_ROWS:
        if (row === -1 && col === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, -1, -1, false, false);
          break;
        }
        if (row === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), col, true, false);
          break;
        }
        ySection = SwingUtilities2.liesInVertical(rect, p, true);
        if (ySection === SwingUtilities2$Section.LEADING) {
          between = true;
        } else if (ySection === SwingUtilities2$Section.TRAILING) {
          row++;
          between = true;
        }
        location = new JTable$DropLocation()._JTable$DropLocation(p, row, col, between, false);
        break;
      case DropMode.INSERT_COLS:
        if (row === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, -1, -1, false, false);
          break;
        }
        if (col === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, this.getColumnCount(), col, false, true);
          break;
        }
        if (SwingUtilities2.liesInHorizontal(rect, p, ltr, false) === SwingUtilities2$Section.TRAILING) {
          col++;
        }
        location = new JTable$DropLocation()._JTable$DropLocation(p, row, col, false, true);
        break;
      case DropMode.ON_OR_INSERT_COLS:
        if (row === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, -1, -1, false, false);
          break;
        }
        if (col === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, row, this.getColumnCount(), false, true);
          break;
        }
        xSection = SwingUtilities2.liesInHorizontal(rect, p, ltr, true);
        if (xSection === SwingUtilities2$Section.LEADING) {
          between = true;
        } else if (xSection === SwingUtilities2$Section.TRAILING) {
          col++;
          between = true;
        }
        location = new JTable$DropLocation()._JTable$DropLocation(p, row, col, false, between);
        break;
      case DropMode.ON_OR_INSERT:
        if (row === -1 && col === -1) {
          location = new JTable$DropLocation()._JTable$DropLocation(p, 0, 0, true, true);
          break;
        }
        xSection = SwingUtilities2.liesInHorizontal(rect, p, ltr, true);
        if (row === -1) {
          if (xSection === SwingUtilities2$Section.LEADING) {
            location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), col, true, true);
          } else if (xSection === SwingUtilities2$Section.TRAILING) {
            location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), (col + 1) | 0, true, true);
          } else {
            location = new JTable$DropLocation()._JTable$DropLocation(p, this.getRowCount(), col, true, false);
          }
          break;
        }
        ySection = SwingUtilities2.liesInVertical(rect, p, true);
        if (ySection === SwingUtilities2$Section.LEADING) {
          between = true;
        } else if (ySection === SwingUtilities2$Section.TRAILING) {
          row++;
          between = true;
        }
        location = new JTable$DropLocation()._JTable$DropLocation(p, row, xSection === SwingUtilities2$Section.TRAILING ? (col + 1) | 0 : col, between, xSection !== SwingUtilities2$Section.MIDDLE);
        break;
      default:
        // assert false
    }
    return location;
  }
  /**
   * Called to set or clear the drop location during a DnD operation.
   * In some cases, the component may need to use it's internal selection
   * temporarily to indicate the drop location. To help facilitate this,
   * this method returns and accepts as a parameter a state object.
   * This state object can be used to store, and later restore, the selection
   * state. Whatever this method returns will be passed back to it in
   * future calls, as the state parameter. If it wants the DnD system to
   * continue storing the same state, it must pass it back every time.
   * Here's how this is used:
   * <p>
   * Let's say that on the first call to this method the component decides
   * to save some state (because it is about to use the selection to show
   * a drop index). It can return a state object to the caller encapsulating
   * any saved selection state. On a second call, let's say the drop location
   * is being changed to something else. The component doesn't need to
   * restore anything yet, so it simply passes back the same state object
   * to have the DnD system continue storing it. Finally, let's say this
   * method is messaged with <code>null</code>. This means DnD
   * is finished with this component for now, meaning it should restore
   * state. At this point, it can use the state parameter to restore
   * said state, and of course return <code>null</code> since there's
   * no longer anything to store.
   *
   * @param location the drop location (as calculated by
   *        <code>dropLocationForPoint</code>) or <code>null</code>
   *        if there's no longer a valid drop location
   * @param state the state object saved earlier for this component,
   *        or <code>null</code>
   * @param forDrop whether or not the method is being called because an
   *        actual drop occurred
   * @return any saved state for this component, or <code>null</code> if none
   */
  setDropLocation$DropLocation$Object$boolean(location: TransferHandler$DropLocation, state: any, forDrop: boolean): any {
    let retVal = null;
    let tableLocation = location;
    if (this.dropMode === DropMode.USE_SELECTION) {
      if (tableLocation == null) {
        if (!forDrop && state != null) {
          this.clearSelection();
          let rows = (state)[0];
          let cols = (state)[1];
          let anchleads = (state)[2];
          for (let row of rows) {
            this.addRowSelectionInterval(row, row);
          }
          for (let col of cols) {
            this.addColumnSelectionInterval(col, col);
          }
          SwingUtilities2.setLeadAnchorWithoutSelection(this.getSelectionModel(), anchleads[1], anchleads[0]);
          SwingUtilities2.setLeadAnchorWithoutSelection(this.getColumnModel().getSelectionModel(), anchleads[3], anchleads[2]);
        }
      } else {
        if (this.dropLocation == null) {
          retVal = [this.getSelectedRows(), this.getSelectedColumns(), [this.getAdjustedIndex(this.getSelectionModel().getAnchorSelectionIndex(), true), this.getAdjustedIndex(this.getSelectionModel().getLeadSelectionIndex(), true), this.getAdjustedIndex(this.getColumnModel().getSelectionModel().getAnchorSelectionIndex(), false), this.getAdjustedIndex(this.getColumnModel().getSelectionModel().getLeadSelectionIndex(), false)]];
        } else {
          retVal = state;
        }
        if (tableLocation.getRow() === -1) {
          this.clearSelectionAndLeadAnchor();
        } else {
          this.setRowSelectionInterval(tableLocation.getRow(), tableLocation.getRow());
          this.setColumnSelectionInterval(tableLocation.getColumn(), tableLocation.getColumn());
        }
      }
    }
    let old = this.dropLocation;
    this.dropLocation = tableLocation;
    this.firePropertyChange$String$Object$Object('dropLocation', old, this.dropLocation);
    return retVal;
  }
  /**
   * Returns the location that this component should visually indicate
   * as the drop location during a DnD operation over the component,
   * or {@code null} if no location is to currently be shown.
   * <p>
   * This method is not meant for querying the drop location
   * from a {@code TransferHandler}, as the drop location is only
   * set after the {@code TransferHandler}'s <code>canImport</code>
   * has returned and has allowed for the location to be shown.
   * <p>
   * When this property changes, a property change event with
   * name "dropLocation" is fired by the component.
   *
   * @return the drop location
   * @see #setDropMode
   * @see TransferHandler#canImport(TransferHandler.TransferSupport)
   * @since 1.6
   */
  getDropLocation(): JTable$DropLocation {
    return this.dropLocation;
  }
  /**
   * Specifies whether a {@code RowSorter} should be created for the
   * table whenever its model changes.
   * <p>
   * When {@code setAutoCreateRowSorter(true)} is invoked, a {@code
   * TableRowSorter} is immediately created and installed on the
   * table.  While the {@code autoCreateRowSorter} property remains
   * {@code true}, every time the model is changed, a new {@code
   * TableRowSorter} is created and set as the table's row sorter.
   * The default value for the {@code autoCreateRowSorter}
   * property is {@code false}.
   *
   * @param autoCreateRowSorter whether or not a {@code RowSorter}
   *        should be automatically created
   * @see javax.swing.table.TableRowSorter
   * @since 1.6
   */
  setAutoCreateRowSorter(autoCreateRowSorter: boolean): void {
    let oldValue = this.autoCreateRowSorter;
    this.autoCreateRowSorter = autoCreateRowSorter;
    if (autoCreateRowSorter) {
      this.setRowSorter(new TableRowSorter()._TableRowSorter$TableModel(this.getModel()));
    }
    this.firePropertyChange$String$boolean$boolean('autoCreateRowSorter', oldValue, autoCreateRowSorter);
  }
  /**
   * Returns {@code true} if whenever the model changes, a new
   * {@code RowSorter} should be created and installed
   * as the table's sorter; otherwise, returns {@code false}.
   *
   * @return true if a {@code RowSorter} should be created when
   *         the model changes
   * @since 1.6
   */
  getAutoCreateRowSorter(): boolean {
    return this.autoCreateRowSorter;
  }
  /**
   * Returns true if the selection should be updated after sorting.
   *
   * @return whether to update the selection on a sort
   * @since 1.6
   */
  getUpdateSelectionOnSort(): boolean {
    return this.updateSelectionOnSort;
  }
  /**
   * Sets the <code>RowSorter</code>.  <code>RowSorter</code> is used
   * to provide sorting and filtering to a <code>JTable</code>.
   * <p>
   * This method clears the selection and resets any variable row heights.
   * <p>
   * This method fires a <code>PropertyChangeEvent</code> when appropriate,
   * with the property name <code>"rowSorter"</code>.  For
   * backward-compatibility, this method fires an additional event with the
   * property name <code>"sorter"</code>.
   * <p>
   * If the underlying model of the <code>RowSorter</code> differs from
   * that of this <code>JTable</code> undefined behavior will result.
   *
   * @param sorter the <code>RowSorter</code>; <code>null</code> turns
   *        sorting off
   * @see javax.swing.table.TableRowSorter
   * @since 1.6
   */
  setRowSorter(sorter: RowSorter<TableModel>): void {
    let oldRowSorter = null;
    if (this.sortManager != null) {
      oldRowSorter = this.sortManager.sorter;
      this.sortManager.dispose();
      this.sortManager = null;
    }
    this.rowModel = null;
    this.clearSelectionAndLeadAnchor();
    if (sorter != null) {
      this.sortManager = new JTable$SortManager().$o(this)._JTable$SortManager(sorter);
    }
    this.resizeAndRepaint();
    this.firePropertyChange$String$Object$Object('rowSorter', oldRowSorter, sorter);
    this.firePropertyChange$String$Object$Object('sorter', oldRowSorter, sorter);
  }
  /**
   * Returns the object responsible for sorting.
   *
   * @return the object responsible for sorting
   * @since 1.6
   */
  getRowSorter(): RowSorter<TableModel> {
    return (this.sortManager != null) ? this.sortManager.sorter : null;
  }
  /**
   * Sets the table's selection mode to allow only single selections, a single
   * contiguous interval, or multiple intervals.
   * <P>
   * <b>Note:</b>
   * <code>JTable</code> provides all the methods for handling
   * column and row selection.  When setting states,
   * such as <code>setSelectionMode</code>, it not only
   * updates the mode for the row selection model but also sets similar
   * values in the selection model of the <code>columnModel</code>.
   * If you want to have the row and column selection models operating
   * in different modes, set them both directly.
   * <p>
   * Both the row and column selection models for <code>JTable</code>
   * default to using a <code>DefaultListSelectionModel</code>
   * so that <code>JTable</code> works the same way as the
   * <code>JList</code>. See the <code>setSelectionMode</code> method
   * in <code>JList</code> for details about the modes.
   *
   * @param selectionMode the mode used by the row and column selection models
   * @see JList#setSelectionMode
   */
  setSelectionMode(selectionMode: number): void {
    this.clearSelection();
    this.getSelectionModel().setSelectionMode(selectionMode);
    this.getColumnModel().getSelectionModel().setSelectionMode(selectionMode);
  }
  /**
   * Sets whether the rows in this model can be selected.
   *
   * @param rowSelectionAllowed   true if this model will allow row selection
   * @see #getRowSelectionAllowed
   */
  setRowSelectionAllowed(rowSelectionAllowed: boolean): void {
    let old = this.rowSelectionAllowed;
    this.rowSelectionAllowed = rowSelectionAllowed;
    if (old !== rowSelectionAllowed) {
      this.repaint$();
    }
    this.firePropertyChange$String$boolean$boolean('rowSelectionAllowed', old, rowSelectionAllowed);
  }
  /**
   * Returns true if rows can be selected.
   *
   * @return true if rows can be selected, otherwise false
   * @see #setRowSelectionAllowed
   */
  getRowSelectionAllowed(): boolean {
    return this.rowSelectionAllowed;
  }
  /**
   * Sets whether the columns in this model can be selected.
   *
   * @param columnSelectionAllowed   true if this model will allow column selection
   * @see #getColumnSelectionAllowed
   */
  setColumnSelectionAllowed(columnSelectionAllowed: boolean): void {
    let old = this.columnModel.getColumnSelectionAllowed();
    this.columnModel.setColumnSelectionAllowed(columnSelectionAllowed);
    if (old !== columnSelectionAllowed) {
      this.repaint$();
    }
    this.firePropertyChange$String$boolean$boolean('columnSelectionAllowed', old, columnSelectionAllowed);
  }
  /**
   * Returns true if columns can be selected.
   *
   * @return true if columns can be selected, otherwise false
   * @see #setColumnSelectionAllowed
   */
  getColumnSelectionAllowed(): boolean {
    return this.columnModel.getColumnSelectionAllowed();
  }
  /**
   * Sets whether this table allows both a column selection and a
   * row selection to exist simultaneously. When set,
   * the table treats the intersection of the row and column selection
   * models as the selected cells. Override <code>isCellSelected</code> to
   * change this default behavior. This method is equivalent to setting
   * both the <code>rowSelectionAllowed</code> property and
   * <code>columnSelectionAllowed</code> property of the
   * <code>columnModel</code> to the supplied value.
   *
   * @param  cellSelectionEnabled     true if simultaneous row and column
   *                                  selection is allowed
   * @see #getCellSelectionEnabled
   * @see #isCellSelected
   */
  setCellSelectionEnabled(cellSelectionEnabled: boolean): void {
    this.setRowSelectionAllowed(cellSelectionEnabled);
    this.setColumnSelectionAllowed(cellSelectionEnabled);
    let old = this.cellSelectionEnabled;
    this.cellSelectionEnabled = cellSelectionEnabled;
    this.firePropertyChange$String$boolean$boolean('cellSelectionEnabled', old, cellSelectionEnabled);
  }
  /**
   * Selects all rows, columns, and cells in the table.
   */
  selectAll(): void {
    if (this.isEditing()) {
      this.removeEditor();
    }
    if (this.getRowCount() > 0 && this.getColumnCount() > 0) {
      let oldLead: number;
      let oldAnchor: number;
      let selModel: ListSelectionModel;
      selModel = this.selectionModel;
      selModel.setValueIsAdjusting(true);
      oldLead = this.getAdjustedIndex(selModel.getLeadSelectionIndex(), true);
      oldAnchor = this.getAdjustedIndex(selModel.getAnchorSelectionIndex(), true);
      this.setRowSelectionInterval(0, (this.getRowCount() - 1) | 0);
      SwingUtilities2.setLeadAnchorWithoutSelection(selModel, oldLead, oldAnchor);
      selModel.setValueIsAdjusting(false);
      selModel = this.columnModel.getSelectionModel();
      selModel.setValueIsAdjusting(true);
      oldLead = this.getAdjustedIndex(selModel.getLeadSelectionIndex(), false);
      oldAnchor = this.getAdjustedIndex(selModel.getAnchorSelectionIndex(), false);
      this.setColumnSelectionInterval(0, (this.getColumnCount() - 1) | 0);
      SwingUtilities2.setLeadAnchorWithoutSelection(selModel, oldLead, oldAnchor);
      selModel.setValueIsAdjusting(false);
    }
  }
  /**
   * Deselects all selected columns and rows.
   */
  clearSelection(): void {
    this.selectionModel.clearSelection();
    this.columnModel.getSelectionModel().clearSelection();
  }
  clearSelectionAndLeadAnchor(): void {
    this.selectionModel.setValueIsAdjusting(true);
    this.columnModel.getSelectionModel().setValueIsAdjusting(true);
    this.clearSelection();
    this.selectionModel.setAnchorSelectionIndex(-1);
    this.selectionModel.setLeadSelectionIndex(-1);
    this.columnModel.getSelectionModel().setAnchorSelectionIndex(-1);
    this.columnModel.getSelectionModel().setLeadSelectionIndex(-1);
    this.selectionModel.setValueIsAdjusting(false);
    this.columnModel.getSelectionModel().setValueIsAdjusting(false);
  }
  getAdjustedIndex(index: number, row: boolean): number {
    let compare = row ? this.getRowCount() : this.getColumnCount();
    return index < compare ? index : -1;
  }
  boundRow(row: number): number {
    if (row < 0 || row >= this.getRowCount()) {
      throw new IllegalArgumentException('Row index out of range');
    }
    return row;
  }
  boundColumn(col: number): number {
    if (col < 0 || col >= this.getColumnCount()) {
      throw new IllegalArgumentException('Column index out of range');
    }
    return col;
  }
  /**
   * Selects the rows from <code>index0</code> to <code>index1</code>,
   * inclusive.
   *
   * @throws IllegalArgumentException      if <code>index0</code> or
   *                                          <code>index1</code> lie outside
   *                                          [0, <code>getRowCount()</code>-1]
   * @param   index0 one end of the interval
   * @param   index1 the other end of the interval
   */
  setRowSelectionInterval(index0: number, index1: number): void {
    this.selectionModel.setSelectionInterval(this.boundRow(index0), this.boundRow(index1));
  }
  /**
   * Selects the columns from <code>index0</code> to <code>index1</code>,
   * inclusive.
   *
   * @throws IllegalArgumentException      if <code>index0</code> or
   *                                          <code>index1</code> lie outside
   *                                          [0, <code>getColumnCount()</code>-1]
   * @param   index0 one end of the interval
   * @param   index1 the other end of the interval
   */
  setColumnSelectionInterval(index0: number, index1: number): void {
    this.columnModel.getSelectionModel().setSelectionInterval(this.boundColumn(index0), this.boundColumn(index1));
  }
  /**
   * Adds the rows from <code>index0</code> to <code>index1</code>, inclusive, to
   * the current selection.
   *
   * @throws IllegalArgumentException      if <code>index0</code> or <code>index1</code>
   *                                          lie outside [0, <code>getRowCount()</code>-1]
   * @param   index0 one end of the interval
   * @param   index1 the other end of the interval
   */
  addRowSelectionInterval(index0: number, index1: number): void {
    this.selectionModel.addSelectionInterval(this.boundRow(index0), this.boundRow(index1));
  }
  /**
   * Adds the columns from <code>index0</code> to <code>index1</code>,
   * inclusive, to the current selection.
   *
   * @throws IllegalArgumentException      if <code>index0</code> or
   *                                          <code>index1</code> lie outside
   *                                          [0, <code>getColumnCount()</code>-1]
   * @param   index0 one end of the interval
   * @param   index1 the other end of the interval
   */
  addColumnSelectionInterval(index0: number, index1: number): void {
    this.columnModel.getSelectionModel().addSelectionInterval(this.boundColumn(index0), this.boundColumn(index1));
  }
  /**
   * Returns the index of the first selected row, -1 if no row is selected.
   * @return the index of the first selected row
   */
  getSelectedRow(): number {
    return this.selectionModel.getMinSelectionIndex();
  }
  /**
   * Returns the index of the first selected column,
   * -1 if no column is selected.
   * @return the index of the first selected column
   */
  getSelectedColumn(): number {
    return this.columnModel.getSelectionModel().getMinSelectionIndex();
  }
  /**
   * Returns the indices of all selected rows.
   *
   * @return an array of integers containing the indices of all selected rows,
   *         or an empty array if no row is selected
   * @see #getSelectedRow
   */
  getSelectedRows(): number[] {
    return this.selectionModel.getSelectedIndices();
  }
  /**
   * Returns the indices of all selected columns.
   *
   * @return an array of integers containing the indices of all selected columns,
   *         or an empty array if no column is selected
   * @see #getSelectedColumn
   */
  getSelectedColumns(): number[] {
    return this.columnModel.getSelectedColumns();
  }
  /**
   * Returns the number of selected rows.
   *
   * @return the number of selected rows, 0 if no rows are selected
   */
  getSelectedRowCount(): number {
    return this.selectionModel.getSelectedItemsCount();
  }
  /**
   * Returns the number of selected columns.
   *
   * @return the number of selected columns, 0 if no columns are selected
   */
  getSelectedColumnCount(): number {
    return this.columnModel.getSelectedColumnCount();
  }
  /**
   * Returns true if the specified index is in the valid range of rows,
   * and the row at that index is selected.
   *
   * @param row a row in the row model
   * @return true if <code>row</code> is a valid index and the row at
   *              that index is selected (where 0 is the first row)
   */
  isRowSelected(row: number): boolean {
    return this.selectionModel.isSelectedIndex(row);
  }
  /**
   * Returns true if the specified index is in the valid range of columns,
   * and the column at that index is selected.
   *
   * @param   column   the column in the column model
   * @return true if <code>column</code> is a valid index and the column at
   *              that index is selected (where 0 is the first column)
   */
  isColumnSelected(column: number): boolean {
    return this.columnModel.getSelectionModel().isSelectedIndex(column);
  }
  /**
   * Returns true if the specified indices are in the valid range of rows
   * and columns and the cell at the specified position is selected.
   * @param row   the row being queried
   * @param column  the column being queried
   *
   * @return true if <code>row</code> and <code>column</code> are valid indices
   *              and the cell at index <code>(row, column)</code> is selected,
   *              where the first row and first column are at index 0
   */
  isCellSelected(row: number, column: number): boolean {
    if (!this.getRowSelectionAllowed() && !this.getColumnSelectionAllowed()) {
      return false;
    }
    return (!this.getRowSelectionAllowed() || this.isRowSelected(row)) && (!this.getColumnSelectionAllowed() || this.isColumnSelected(column));
  }
  changeSelectionModel(sm: ListSelectionModel, index: number, toggle: boolean, extend: boolean, selected: boolean, anchor: number, anchorSelected: boolean): void {
    if (extend) {
      if (toggle) {
        if (anchorSelected) {
          sm.addSelectionInterval(anchor, index);
        } else {
          sm.removeSelectionInterval(anchor, index);
          if (true === this.getClientProperty('Table.isFileList')) {
            sm.addSelectionInterval(index, index);
            sm.setAnchorSelectionIndex(anchor);
          }
        }
      } else {
        sm.setSelectionInterval(anchor, index);
      }
    } else {
      if (toggle) {
        if (selected) {
          sm.removeSelectionInterval(index, index);
        } else {
          sm.addSelectionInterval(index, index);
        }
      } else {
        sm.setSelectionInterval(index, index);
      }
    }
  }
  /**
   * Updates the selection models of the table, depending on the state of the
   * two flags: <code>toggle</code> and <code>extend</code>. Most changes
   * to the selection that are the result of keyboard or mouse events received
   * by the UI are channeled through this method so that the behavior may be
   * overridden by a subclass. Some UIs may need more functionality than
   * this method provides, such as when manipulating the lead for discontiguous
   * selection, and may not call into this method for some selection changes.
   * <p>
   * This implementation uses the following conventions:
   * <ul>
   * <li> <code>toggle</code>: <em>false</em>, <code>extend</code>: <em>false</em>.
   *      Clear the previous selection and ensure the new cell is selected.
   * <li> <code>toggle</code>: <em>false</em>, <code>extend</code>: <em>true</em>.
   *      Extend the previous selection from the anchor to the specified cell,
   *      clearing all other selections.
   * <li> <code>toggle</code>: <em>true</em>, <code>extend</code>: <em>false</em>.
   *      If the specified cell is selected, deselect it. If it is not selected, select it.
   * <li> <code>toggle</code>: <em>true</em>, <code>extend</code>: <em>true</em>.
   *      Apply the selection state of the anchor to all cells between it and the
   *      specified cell.
   * </ul>
   * @param  rowIndex   affects the selection at <code>row</code>
   * @param  columnIndex  affects the selection at <code>column</code>
   * @param  toggle  see description above
   * @param  extend  if true, extend the current selection
   *
   * @since 1.3
   */
  changeSelection(rowIndex: number, columnIndex: number, toggle: boolean, extend: boolean): void {
    let rsm = this.getSelectionModel();
    let csm = this.getColumnModel().getSelectionModel();
    let anchorRow = this.getAdjustedIndex(rsm.getAnchorSelectionIndex(), true);
    let anchorCol = this.getAdjustedIndex(csm.getAnchorSelectionIndex(), false);
    let anchorSelected = true;
    if (anchorRow === -1) {
      if (this.getRowCount() > 0) {
        anchorRow = 0;
      }
      anchorSelected = false;
    }
    if (anchorCol === -1) {
      if (this.getColumnCount() > 0) {
        anchorCol = 0;
      }
      anchorSelected = false;
    }
    let selected = this.isCellSelected(rowIndex, columnIndex);
    anchorSelected = anchorSelected && this.isCellSelected(anchorRow, anchorCol);
    this.changeSelectionModel(csm, columnIndex, toggle, extend, selected, anchorCol, anchorSelected);
    this.changeSelectionModel(rsm, rowIndex, toggle, extend, selected, anchorRow, anchorSelected);
    if (this.getAutoscrolls()) {
      let cellRect = this.getCellRect(rowIndex, columnIndex, false);
      if (cellRect != null) {
        this.scrollRectToVisible(cellRect);
      }
    }
  }
  /**
   * Returns the foreground color for selected cells.
   *
   * @return the <code>Color</code> object for the foreground property
   * @see #setSelectionForeground
   * @see #setSelectionBackground
   */
  getSelectionForeground(): Color {
    return this.selectionForeground;
  }
  /**
   * Sets the foreground color for selected cells.  Cell renderers
   * can use this color to render text and graphics for selected
   * cells.
   * <p>
   * The default value of this property is defined by the look
   * and feel implementation.
   * <p>
   * This is a <a href="https://docs.oracle.com/javase/tutorial/javabeans/writing/properties.html">JavaBeans</a> bound property.
   *
   * @param selectionForeground  the <code>Color</code> to use in the foreground
   *                             for selected list items
   * @see #getSelectionForeground
   * @see #setSelectionBackground
   * @see #setForeground
   * @see #setBackground
   * @see #setFont
   */
  setSelectionForeground(selectionForeground: Color): void {
    let old = this.selectionForeground;
    this.selectionForeground = selectionForeground;
    this.firePropertyChange$String$Object$Object('selectionForeground', old, selectionForeground);
    this.repaint$();
  }
  /**
   * Returns the background color for selected cells.
   *
   * @return the <code>Color</code> used for the background of selected list items
   * @see #setSelectionBackground
   * @see #setSelectionForeground
   */
  getSelectionBackground(): Color {
    return this.selectionBackground;
  }
  /**
   * Sets the background color for selected cells.  Cell renderers
   * can use this color to the fill selected cells.
   * <p>
   * The default value of this property is defined by the look
   * and feel implementation.
   * <p>
   * This is a <a href="https://docs.oracle.com/javase/tutorial/javabeans/writing/properties.html">JavaBeans</a> bound property.
   *
   * @param selectionBackground  the <code>Color</code> to use for the background
   *                             of selected cells
   * @see #getSelectionBackground
   * @see #setSelectionForeground
   * @see #setForeground
   * @see #setBackground
   * @see #setFont
   */
  setSelectionBackground(selectionBackground: Color): void {
    let old = this.selectionBackground;
    this.selectionBackground = selectionBackground;
    this.firePropertyChange$String$Object$Object('selectionBackground', old, selectionBackground);
    this.repaint$();
  }
  /**
   * Maps the index of the column in the view at
   * <code>viewColumnIndex</code> to the index of the column
   * in the table model.  Returns the index of the corresponding
   * column in the model.  If <code>viewColumnIndex</code>
   * is less than zero, returns <code>viewColumnIndex</code>.
   *
   * @param   viewColumnIndex     the index of the column in the view
   * @return  the index of the corresponding column in the model
   *
   * @see #convertColumnIndexToView
   */
  convertColumnIndexToModel(viewColumnIndex: number): number {
    return SwingUtilities2.convertColumnIndexToModel(this.getColumnModel(), viewColumnIndex);
  }
  /**
   * Maps the index of the column in the table model at
   * <code>modelColumnIndex</code> to the index of the column
   * in the view.  Returns the index of the
   * corresponding column in the view; returns -1 if this column is not
   * being displayed.  If <code>modelColumnIndex</code> is less than zero,
   * returns <code>modelColumnIndex</code>.
   *
   * @param   modelColumnIndex     the index of the column in the model
   * @return   the index of the corresponding column in the view
   *
   * @see #convertColumnIndexToModel
   */
  convertColumnIndexToView(modelColumnIndex: number): number {
    return SwingUtilities2.convertColumnIndexToView(this.getColumnModel(), modelColumnIndex);
  }
  /**
   * Maps the index of the row in terms of the
   * <code>TableModel</code> to the view.  If the contents of the
   * model are not sorted the model and view indices are the same.
   *
   * @param modelRowIndex the index of the row in terms of the model
   * @return the index of the corresponding row in the view, or -1 if
   *         the row isn't visible
   * @throws IndexOutOfBoundsException if sorting is enabled and passed an
   *         index outside the number of rows of the <code>TableModel</code>
   * @see javax.swing.table.TableRowSorter
   * @since 1.6
   */
  convertRowIndexToView$int(modelRowIndex: number): number {
    let sorter = this.getRowSorter();
    if (sorter != null) {
      return sorter.convertRowIndexToView(modelRowIndex);
    }
    return modelRowIndex;
  }
  /**
   * Maps the index of the row in terms of the view to the
   * underlying <code>TableModel</code>.  If the contents of the
   * model are not sorted the model and view indices are the same.
   *
   * @param viewRowIndex the index of the row in the view
   * @return the index of the corresponding row in the model
   * @throws IndexOutOfBoundsException if sorting is enabled and passed an
   *         index outside the range of the <code>JTable</code> as
   *         determined by the method <code>getRowCount</code>
   * @see javax.swing.table.TableRowSorter
   * @see #getRowCount
   * @since 1.6
   */
  convertRowIndexToModel$int(viewRowIndex: number): number {
    let sorter = this.getRowSorter();
    if (sorter != null) {
      return sorter.convertRowIndexToModel(viewRowIndex);
    }
    return viewRowIndex;
  }
  /**
   * Returns the number of rows that can be shown in the
   * <code>JTable</code>, given unlimited space.  If a
   * <code>RowSorter</code> with a filter has been specified, the
   * number of rows returned may differ from that of the underlying
   * <code>TableModel</code>.
   *
   * @return the number of rows shown in the <code>JTable</code>
   * @see #getColumnCount
   */
  getRowCount(): number {
    let sorter = this.getRowSorter();
    if (sorter != null) {
      return sorter.getViewRowCount();
    }
    return this.getModel().getRowCount();
  }
  /**
   * Returns the number of columns in the column model. Note that this may
   * be different from the number of columns in the table model.
   *
   * @return  the number of columns in the table
   * @see #getRowCount
   * @see #removeColumn
   */
  getColumnCount(): number {
    return this.getColumnModel().getColumnCount();
  }
  /**
   * Returns the name of the column appearing in the view at
   * column position <code>column</code>.
   *
   * @param  column    the column in the view being queried
   * @return the name of the column at position <code>column</code>
   *                        in the view where the first column is column 0
   */
  getColumnName(column: number): string {
    return this.getModel().getColumnName(this.convertColumnIndexToModel(column));
  }
  /**
   * Returns the type of the column appearing in the view at
   * column position <code>column</code>.
   *
   * @param   column   the column in the view being queried
   * @return the type of the column at position <code>column</code>
   *          in the view where the first column is column 0
   */
  getColumnClass(column: number): JClass<any> {
    return this.getModel().getColumnClass(this.convertColumnIndexToModel(column));
  }
  /**
   * Returns the cell value at <code>row</code> and <code>column</code>.
   * <p>
   * <b>Note</b>: The column is specified in the table view's display
   *              order, and not in the <code>TableModel</code>'s column
   *              order.  This is an important distinction because as the
   *              user rearranges the columns in the table,
   *              the column at a given index in the view will change.
   *              Meanwhile the user's actions never affect the model's
   *              column ordering.
   *
   * @param   row             the row whose value is to be queried
   * @param   column          the column whose value is to be queried
   * @return  the Object at the specified cell
   */
  getValueAt(row: number, column: number): any {
    return this.getModel().getValueAt(this.convertRowIndexToModel$int(row), this.convertColumnIndexToModel(column));
  }
  /**
   * Sets the value for the cell in the table model at <code>row</code>
   * and <code>column</code>.
   * <p>
   * <b>Note</b>: The column is specified in the table view's display
   *              order, and not in the <code>TableModel</code>'s column
   *              order.  This is an important distinction because as the
   *              user rearranges the columns in the table,
   *              the column at a given index in the view will change.
   *              Meanwhile the user's actions never affect the model's
   *              column ordering.
   *
   * <code>aValue</code> is the new value.
   *
   * @param   aValue          the new value
   * @param   row             the row of the cell to be changed
   * @param   column          the column of the cell to be changed
   * @see #getValueAt
   */
  setValueAt(aValue: any, row: number, column: number): void {
    this.getModel().setValueAt(aValue, this.convertRowIndexToModel$int(row), this.convertColumnIndexToModel(column));
  }
  /**
   * Returns true if the cell at <code>row</code> and <code>column</code>
   * is editable.  Otherwise, invoking <code>setValueAt</code> on the cell
   * will have no effect.
   * <p>
   * <b>Note</b>: The column is specified in the table view's display
   *              order, and not in the <code>TableModel</code>'s column
   *              order.  This is an important distinction because as the
   *              user rearranges the columns in the table,
   *              the column at a given index in the view will change.
   *              Meanwhile the user's actions never affect the model's
   *              column ordering.
   *
   *
   * @param   row      the row whose value is to be queried
   * @param   column   the column whose value is to be queried
   * @return  true if the cell is editable
   * @see #setValueAt
   */
  isCellEditable(row: number, column: number): boolean {
    return this.getModel().isCellEditable(this.convertRowIndexToModel$int(row), this.convertColumnIndexToModel(column));
  }
  /**
   * Appends <code>aColumn</code> to the end of the array of columns held by
   *  this <code>JTable</code>'s column model.
   *  If the column name of <code>aColumn</code> is <code>null</code>,
   *  sets the column name of <code>aColumn</code> to the name
   *  returned by <code>getModel().getColumnName()</code>.
   *  <p>
   *  To add a column to this <code>JTable</code> to display the
   *  <code>modelColumn</code>'th column of data in the model with a
   *  given <code>width</code>, <code>cellRenderer</code>,
   *  and <code>cellEditor</code> you can use:
   *  <pre>
   *
   *      addColumn(new TableColumn(modelColumn, width, cellRenderer, cellEditor));
   *
   *  </pre>
   *  [Any of the <code>TableColumn</code> constructors can be used
   *  instead of this one.]
   *  The model column number is stored inside the <code>TableColumn</code>
   *  and is used during rendering and editing to locate the appropriates
   *  data values in the model. The model column number does not change
   *  when columns are reordered in the view.
   *
   *  @param  aColumn         the <code>TableColumn</code> to be added
   *  @see    #removeColumn
   */
  addColumn(aColumn: TableColumn): void {
    if (aColumn.getHeaderValue() == null) {
      let modelColumn = aColumn.getModelIndex();
      let columnName = this.getModel().getColumnName(modelColumn);
      aColumn.setHeaderValue(columnName);
    }
    this.getColumnModel().addColumn(aColumn);
  }
  /**
   * Returns the index of the column that <code>point</code> lies in,
   * or -1 if the result is not in the range
   * [0, <code>getColumnCount()</code>-1].
   *
   * @param   point   the location of interest
   * @return  the index of the column that <code>point</code> lies in,
   *          or -1 if the result is not in the range
   *          [0, <code>getColumnCount()</code>-1]
   * @see     #rowAtPoint
   */
  columnAtPoint(point: Point): number {
    let x = point.x_;
    if (!this.getComponentOrientation().isLeftToRight()) {
      x = (this.getWidth() - x - 1) | 0;
    }
    return this.getColumnModel().getColumnIndexAtX(x);
  }
  /**
   * Returns the index of the row that <code>point</code> lies in,
   * or -1 if the result is not in the range
   * [0, <code>getRowCount()</code>-1].
   *
   * @param   point   the location of interest
   * @return  the index of the row that <code>point</code> lies in,
   *          or -1 if the result is not in the range
   *          [0, <code>getRowCount()</code>-1]
   * @see     #columnAtPoint
   */
  rowAtPoint(point: Point): number {
    let y = point.y_;
    let result = (this.rowModel == null) ? $J.idiv(y, this.getRowHeight$()) : this.rowModel.getIndex$int(y);
    if (result < 0) {
      return -1;
    } else if (result >= this.getRowCount()) {
      return -1;
    } else {
      return result;
    }
  }
  /**
   * Returns a rectangle for the cell that lies at the intersection of
   * <code>row</code> and <code>column</code>.
   * If <code>includeSpacing</code> is true then the value returned
   * has the full height and width of the row and column
   * specified. If it is false, the returned rectangle is inset by the
   * intercell spacing to return the true bounds of the rendering or
   * editing component as it will be set during rendering.
   * <p>
   * If the column index is valid but the row index is less
   * than zero the method returns a rectangle with the
   * <code>y</code> and <code>height</code> values set appropriately
   * and the <code>x</code> and <code>width</code> values both set
   * to zero. In general, when either the row or column indices indicate a
   * cell outside the appropriate range, the method returns a rectangle
   * depicting the closest edge of the closest cell that is within
   * the table's range. When both row and column indices are out
   * of range the returned rectangle covers the closest
   * point of the closest cell.
   * <p>
   * In all cases, calculations that use this method to calculate
   * results along one axis will not fail because of anomalies in
   * calculations along the other axis. When the cell is not valid
   * the <code>includeSpacing</code> parameter is ignored.
   *
   * @param   row                   the row index where the desired cell
   *                                is located
   * @param   column                the column index where the desired cell
   *                                is located in the display; this is not
   *                                necessarily the same as the column index
   *                                in the data model for the table; the
   *                                {@link #convertColumnIndexToView(int)}
   *                                method may be used to convert a data
   *                                model column index to a display
   *                                column index
   * @param   includeSpacing        if false, return the true cell bounds -
   *                                computed by subtracting the intercell
   *                                spacing from the height and widths of
   *                                the column and row models
   *
   * @return  the rectangle containing the cell at location
   *          <code>row</code>,<code>column</code>
   * @see #getIntercellSpacing
   */
  getCellRect(row: number, column: number, includeSpacing: boolean): Rectangle {
    let r = new Rectangle()._Rectangle$();
    let valid = true;
    if (row < 0) {
      valid = false;
    } else if (row >= this.getRowCount()) {
      r.y_ = this.getHeight();
      valid = false;
    } else {
      r.height_ = this.getRowHeight$int(row);
      r.y_ = (this.rowModel == null) ? Math.imul(row, r.height_) : this.rowModel.getPosition$int(row);
    }
    if (column < 0) {
      if (!this.getComponentOrientation().isLeftToRight()) {
        r.x_ = this.getWidth();
      }
      valid = false;
    } else if (column >= this.getColumnCount()) {
      if (this.getComponentOrientation().isLeftToRight()) {
        r.x_ = this.getWidth();
      }
      valid = false;
    } else {
      let cm = this.getColumnModel();
      if (this.getComponentOrientation().isLeftToRight()) {
        for (let i = 0; i < column; i++) {
          r.x_ = (r.x_ + cm.getColumn(i).getWidth()) | 0;
        }
      } else {
        for (let i = (cm.getColumnCount() - 1) | 0; i > column; i--) {
          r.x_ = (r.x_ + cm.getColumn(i).getWidth()) | 0;
        }
      }
      r.width_ = cm.getColumn(column).getWidth();
    }
    if (valid && !includeSpacing) {
      let rm = Math.min(this.getRowMargin(), r.height_);
      let cm = Math.min(this.getColumnModel().getColumnMargin(), r.width_);
      r.setBounds$int$int$int$int((r.x_ + $J.idiv(cm, 2)) | 0, (r.y_ + $J.idiv(rm, 2)) | 0, (r.width_ - cm) | 0, (r.height_ - rm) | 0);
    }
    return r;
  }
  viewIndexForColumn(aColumn: TableColumn): number {
    let cm = this.getColumnModel();
    for (let column = 0; column < cm.getColumnCount(); column++) {
      if (cm.getColumn(column) === aColumn) {
        return column;
      }
    }
    return -1;
  }
  /**
   * Causes this table to lay out its rows and columns.  Overridden so
   * that columns can be resized to accommodate a change in the size of
   * a containing parent.
   * Resizes one or more of the columns in the table
   * so that the total width of all of this <code>JTable</code>'s
   * columns is equal to the width of the table.
   * <p>
   * Before the layout begins the method gets the
   * <code>resizingColumn</code> of the <code>tableHeader</code>.
   * When the method is called as a result of the resizing of an enclosing window,
   * the <code>resizingColumn</code> is <code>null</code>. This means that resizing
   * has taken place "outside" the <code>JTable</code> and the change -
   * or "delta" - should be distributed to all of the columns regardless
   * of this <code>JTable</code>'s automatic resize mode.
   * <p>
   * If the <code>resizingColumn</code> is not <code>null</code>, it is one of
   * the columns in the table that has changed size rather than
   * the table itself. In this case the auto-resize modes govern
   * the way the extra (or deficit) space is distributed
   * amongst the available columns.
   * <p>
   * The modes are:
   * <ul>
   * <li>  AUTO_RESIZE_OFF: Don't automatically adjust the column's
   * widths at all. Use a horizontal scrollbar to accommodate the
   * columns when their sum exceeds the width of the
   * <code>Viewport</code>.  If the <code>JTable</code> is not
   * enclosed in a <code>JScrollPane</code> this may
   * leave parts of the table invisible.
   * <li>  AUTO_RESIZE_NEXT_COLUMN: Use just the column after the
   * resizing column. This results in the "boundary" or divider
   * between adjacent cells being independently adjustable.
   * <li>  AUTO_RESIZE_SUBSEQUENT_COLUMNS: Use all columns after the
   * one being adjusted to absorb the changes.  This is the
   * default behavior.
   * <li>  AUTO_RESIZE_LAST_COLUMN: Automatically adjust the
   * size of the last column only. If the bounds of the last column
   * prevent the desired size from being allocated, set the
   * width of the last column to the appropriate limit and make
   * no further adjustments.
   * <li>  AUTO_RESIZE_ALL_COLUMNS: Spread the delta amongst all the columns
   * in the <code>JTable</code>, including the one that is being
   * adjusted.
   * </ul>
   * <p>
   * <b>Note:</b> When a <code>JTable</code> makes adjustments
   *   to the widths of the columns it respects their minimum and
   *   maximum values absolutely.  It is therefore possible that,
   *   even after this method is called, the total width of the columns
   *   is still not equal to the width of the table. When this happens
   *   the <code>JTable</code> does not put itself
   *   in AUTO_RESIZE_OFF mode to bring up a scroll bar, or break other
   *   commitments of its current auto-resize mode -- instead it
   *   allows its bounds to be set larger (or smaller) than the total of the
   *   column minimum or maximum, meaning, either that there
   *   will not be enough room to display all of the columns, or that the
   *   columns will not fill the <code>JTable</code>'s bounds.
   *   These respectively, result in the clipping of some columns
   *   or an area being painted in the <code>JTable</code>'s
   *   background color during painting.
   * <p>
   *   The mechanism for distributing the delta amongst the available
   *   columns is provided in a private method in the <code>JTable</code>
   *   class:
   * <pre>
   *   adjustSizes(long targetSize, final Resizable3 r, boolean inverse)
   * </pre>
   *   an explanation of which is provided in the following section.
   *   <code>Resizable3</code> is a private
   *   interface that allows any data structure containing a collection
   *   of elements with a size, preferred size, maximum size and minimum size
   *   to have its elements manipulated by the algorithm.
   *
   * <H4> Distributing the delta </H4>
   *
   * <H5> Overview </H5>
   * <P>
   * Call "DELTA" the difference between the target size and the
   * sum of the preferred sizes of the elements in r. The individual
   * sizes are calculated by taking the original preferred
   * sizes and adding a share of the DELTA - that share being based on
   * how far each preferred size is from its limiting bound (minimum or
   * maximum).
   *
   * <H5>Definition</H5>
   * <P>
   * Call the individual constraints min[i], max[i], and pref[i].
   * <p>
   * Call their respective sums: MIN, MAX, and PREF.
   * <p>
   * Each new size will be calculated using:
   *
   * <pre>
   *          size[i] = pref[i] + delta[i]
   * </pre>
   * where each individual delta[i] is calculated according to:
   * <p>
   * If (DELTA &lt; 0) we are in shrink mode where:
   *
   * <PRE>
   *                        DELTA
   *          delta[i] = ------------ * (pref[i] - min[i])
   *                     (PREF - MIN)
   * </PRE>
   * If (DELTA &gt; 0) we are in expand mode where:
   *
   * <PRE>
   *                        DELTA
   *          delta[i] = ------------ * (max[i] - pref[i])
   *                      (MAX - PREF)
   * </PRE>
   * <P>
   * The overall effect is that the total size moves that same percentage,
   * k, towards the total minimum or maximum and that percentage guarantees
   * accommodation of the required space, DELTA.
   *
   * <H5>Details</H5>
   * <P>
   * Naive evaluation of the formulae presented here would be subject to
   * the aggregated rounding errors caused by doing this operation in finite
   * precision (using ints). To deal with this, the multiplying factor above,
   * is constantly recalculated and this takes account of the rounding
   * errors in the previous iterations. The result is an algorithm that
   * produces a set of integers whose values exactly sum to the supplied
   * <code>targetSize</code>, and does so by spreading the rounding
   * errors evenly over the given elements.
   *
   * <H5>When the MAX and MIN bounds are hit</H5>
   * <P>
   * When <code>targetSize</code> is outside the [MIN, MAX] range,
   * the algorithm sets all sizes to their appropriate limiting value
   * (maximum or minimum).
   */
  doLayout(): void {
    let resizingColumn = this.getResizingColumn();
    if (resizingColumn == null) {
      this.setWidthsFromPreferredWidths(false);
    } else {
      let columnIndex = this.viewIndexForColumn(resizingColumn);
      let delta = (this.getWidth() - this.getColumnModel().getTotalColumnWidth()) | 0;
      this.accommodateDelta(columnIndex, delta);
      delta = (this.getWidth() - this.getColumnModel().getTotalColumnWidth()) | 0;
      if (delta !== 0) {
        resizingColumn.setWidth((resizingColumn.getWidth() + delta) | 0);
      }
      this.setWidthsFromPreferredWidths(true);
    }
    super.doLayout();
  }
  getResizingColumn(): TableColumn {
    return (this.tableHeader == null) ? null : this.tableHeader.getResizingColumn();
  }
  setWidthsFromPreferredWidths(inverse: boolean): void {
    let totalWidth = this.getWidth();
    let totalPreferred = this.getPreferredSize$().width_;
    let target = !inverse ? totalWidth : totalPreferred;
    let cm = this.columnModel;
    let r = new (JTable$2())().$o(this).$c(cm, inverse);
    this.adjustSizes$long$Resizable3$boolean$JTable(target, r, inverse);
  }
  accommodateDelta(resizingColumnIndex: number, delta: number): void {
    let columnCount = this.getColumnCount();
    let from = resizingColumnIndex;
    let to: number;
    switch (this.autoResizeMode) {
      case JTable.AUTO_RESIZE_NEXT_COLUMN:
        from = (from + 1) | 0;
        to = Math.min((from + 1) | 0, columnCount);
        break;
      case JTable.AUTO_RESIZE_SUBSEQUENT_COLUMNS:
        from = (from + 1) | 0;
        to = columnCount;
        break;
      case JTable.AUTO_RESIZE_LAST_COLUMN:
        from = (columnCount - 1) | 0;
        to = (from + 1) | 0;
        break;
      case JTable.AUTO_RESIZE_ALL_COLUMNS:
        from = 0;
        to = columnCount;
        break;
      default:
        return;
    }
    let start = from;
    let end = to;
    let cm = this.columnModel;
    let r = new (JTable$3())().$o(this).$c(end, start, cm);
    let totalWidth = 0;
    for (let i = from; i < to; i++) {
      let aColumn = this.columnModel.getColumn(i);
      let input = aColumn.getWidth();
      totalWidth = (totalWidth + input) | 0;
    }
    this.adjustSizes$long$Resizable3$boolean$JTable((totalWidth + delta) | 0, r, false);
  }
  adjustSizes$long$Resizable3$boolean$JTable(target: number, r: JTable$Resizable3, inverse: boolean): void {
    let N = r.getElementCount();
    let totalPreferred = 0;
    for (let i = 0; i < N; i++) {
      totalPreferred += r.getMidPointAt(i);
    }
    let s: JTable$Resizable2;
    if ((target < totalPreferred) === !inverse) {
      s = new (JTable$4())().$o(this).$c(r);
    } else {
      s = new (JTable$5())().$o(this).$c(r);
    }
    this.adjustSizes$long$Resizable2$boolean$JTable(target, s, !inverse);
  }
  adjustSizes$long$Resizable2$boolean$JTable(target: number, r: JTable$Resizable2, limitToRange: boolean): void {
    let totalLowerBound = 0;
    let totalUpperBound = 0;
    for (let i = 0; i < r.getElementCount(); i++) {
      totalLowerBound += r.getLowerBoundAt(i);
      totalUpperBound += r.getUpperBoundAt(i);
    }
    if (limitToRange) {
      target = Math.min(Math.max(totalLowerBound, target), totalUpperBound);
    }
    for (let i = 0; i < r.getElementCount(); i++) {
      let lowerBound = r.getLowerBoundAt(i);
      let upperBound = r.getUpperBoundAt(i);
      let newSize: number;
      if (totalLowerBound === totalUpperBound) {
        newSize = lowerBound;
      } else {
        let f = (target - totalLowerBound) / (totalUpperBound - totalLowerBound);
        newSize = ($J.round(lowerBound + f * ((upperBound - lowerBound) | 0))) | 0;
      }
      r.setSizeAt(newSize, i);
      target -= newSize;
      totalLowerBound -= lowerBound;
      totalUpperBound -= upperBound;
    }
  }
  /**
   * Overrides <code>JComponent</code>'s <code>getToolTipText</code>
   * method in order to allow the renderer's tips to be used
   * if it has text set.
   * <p>
   * <b>Note:</b> For <code>JTable</code> to properly display
   * tooltips of its renderers
   * <code>JTable</code> must be a registered component with the
   * <code>ToolTipManager</code>.
   * This is done automatically in <code>initializeLocalVars</code>,
   * but if at a later point <code>JTable</code> is told
   * <code>setToolTipText(null)</code> it will unregister the table
   * component, and no tips from renderers will display anymore.
   *
   * @see JComponent#getToolTipText
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    let tip = null;
    let p = event.getPoint();
    let hitColumnIndex = this.columnAtPoint(p);
    let hitRowIndex = this.rowAtPoint(p);
    if ((hitColumnIndex !== -1) && (hitRowIndex !== -1)) {
      let renderer = this.getCellRenderer(hitRowIndex, hitColumnIndex);
      let component = this.prepareRenderer(renderer, hitRowIndex, hitColumnIndex);
      if (component instanceof JComponent) {
        let cellRect = this.getCellRect(hitRowIndex, hitColumnIndex, false);
        p.translate(-cellRect.x_, -cellRect.y_);
        let modifiers = event.getModifiers();
        let newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(component, event.getID(), event.getWhen(), modifiers, p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
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
   * Sets whether editors in this JTable get the keyboard focus
   * when an editor is activated as a result of the JTable
   * forwarding keyboard events for a cell.
   * By default, this property is false, and the JTable
   * retains the focus unless the cell is clicked.
   *
   * @param surrendersFocusOnKeystroke true if the editor should get the focus
   *          when keystrokes cause the editor to be
   *          activated
   *
   *
   * @see #getSurrendersFocusOnKeystroke
   * @since 1.4
   */
  setSurrendersFocusOnKeystroke(surrendersFocusOnKeystroke: boolean): void {
    this.surrendersFocusOnKeystroke = surrendersFocusOnKeystroke;
  }
  /**
   * Returns true if the editor should get the focus
   * when keystrokes cause the editor to be activated
   *
   * @return  true if the editor should get the focus
   *          when keystrokes cause the editor to be
   *          activated
   *
   * @see #setSurrendersFocusOnKeystroke
   * @since 1.4
   */
  getSurrendersFocusOnKeystroke(): boolean {
    return this.surrendersFocusOnKeystroke;
  }
  /**
   * Programmatically starts editing the cell at <code>row</code> and
   * <code>column</code>, if those indices are in the valid range, and
   * the cell at those indices is editable.
   * Note that this is a convenience method for
   * <code>editCellAt(int, int, null)</code>.
   *
   * @param   row                             the row to be edited
   * @param   column                          the column to be edited
   * @return  false if for any reason the cell cannot be edited,
   *                or if the indices are invalid
   */
  editCellAt$int$int(row: number, column: number): boolean {
    return this.editCellAt$int$int$EventObject(row, column, null);
  }
  /**
   * Programmatically starts editing the cell at <code>row</code> and
   * <code>column</code>, if those indices are in the valid range, and
   * the cell at those indices is editable.
   * To prevent the <code>JTable</code> from
   * editing a particular table, column or cell value, return false from
   * the <code>isCellEditable</code> method in the <code>TableModel</code>
   * interface.
   *
   * @param   row     the row to be edited
   * @param   column  the column to be edited
   * @param   e       event to pass into <code>shouldSelectCell</code>;
   *                  note that as of Java 2 platform v1.2, the call to
   *                  <code>shouldSelectCell</code> is no longer made
   * @return  false if for any reason the cell cannot be edited,
   *                or if the indices are invalid
   */
  editCellAt$int$int$EventObject(row: number, column: number, e: EventObject): boolean {
    if (this.cellEditor != null && !this.cellEditor.stopCellEditing()) {
      return false;
    }
    if (row < 0 || row >= this.getRowCount() || column < 0 || column >= this.getColumnCount()) {
      return false;
    }
    if (!this.isCellEditable(row, column)) {
      return false;
    }
    if (this.editorRemover == null) {
      let fm = KeyboardFocusManager.getCurrentKeyboardFocusManager$();
      this.editorRemover = $J.fn(new JTable$CellEditorRemover().$o(this)._JTable$CellEditorRemover(fm), 'propertyChange');
      fm.addPropertyChangeListener$String$PropertyChangeListener('permanentFocusOwner', this.editorRemover);
    }
    let editor = this.getCellEditor$int$int(row, column);
    if (editor != null && editor.isCellEditable(e)) {
      this.editorComp = this.prepareEditor(editor, row, column);
      if (this.editorComp == null) {
        this.removeEditor();
        return false;
      }
      this.editorComp.setBounds$Rectangle(this.getCellRect(row, column, false));
      this.add$Component(this.editorComp);
      this.editorComp.validate();
      this.editorComp.repaint$();
      this.setCellEditor(editor);
      this.setEditingRow(row);
      this.setEditingColumn(column);
      editor.addCellEditorListener(this);
      return true;
    }
    return false;
  }
  /**
   * Returns true if a cell is being edited.
   *
   * @return  true if the table is editing a cell
   * @see     #editingColumn
   * @see     #editingRow
   */
  isEditing(): boolean {
    return this.cellEditor != null;
  }
  /**
   * Returns the component that is handling the editing session.
   * If nothing is being edited, returns null.
   *
   * @return  Component handling editing session
   */
  getEditorComponent(): Component {
    return this.editorComp;
  }
  /**
   * Returns the index of the column that contains the cell currently
   * being edited.  If nothing is being edited, returns -1.
   *
   * @return  the index of the column that contains the cell currently
   *          being edited; returns -1 if nothing being edited
   * @see #editingRow
   */
  getEditingColumn(): number {
    return this.editingColumn;
  }
  /**
   * Returns the index of the row that contains the cell currently
   * being edited.  If nothing is being edited, returns -1.
   *
   * @return  the index of the row that contains the cell currently
   *          being edited; returns -1 if nothing being edited
   * @see #editingColumn
   */
  getEditingRow(): number {
    return this.editingRow;
  }
  /**
   * Sets the L&amp;F object that renders this component and repaints.
   *
   * @param ui  the TableUI L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$TableUI(ui: TableUI): void {
    if (this.ui !== ui) {
      super.setUI$ComponentUI(ui);
      this.repaint$();
    }
  }
  /**
   * Notification from the <code>UIManager</code> that the L&amp;F has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    if (this.updateInProgress) {
      return;
    }
    this.updateInProgress = true;
    try {
      let cm = this.getColumnModel();
      for (let column = 0; column < cm.getColumnCount(); column++) {
        let aColumn = cm.getColumn(column);
        SwingUtilities.updateRendererOrEditorUI(aColumn.getCellRenderer());
        SwingUtilities.updateRendererOrEditorUI(aColumn.getCellEditor());
        SwingUtilities.updateRendererOrEditorUI(aColumn.getHeaderRenderer());
      }
      let defaultRenderers = this.defaultRenderersByColumnClass.elements();
      while (defaultRenderers.hasMoreElements()) {
        SwingUtilities.updateRendererOrEditorUI(defaultRenderers.nextElement());
      }
      let defaultEditors = this.defaultEditorsByColumnClass.elements();
      while (defaultEditors.hasMoreElements()) {
        SwingUtilities.updateRendererOrEditorUI(defaultEditors.nextElement());
      }
      if (this.tableHeader != null && this.tableHeader.getParent() == null) {
        this.tableHeader.updateUI();
      }
      this.configureEnclosingScrollPaneUI();
      this.setUI$TableUI(UIManager.getUI(this));
    } finally {
      this.updateInProgress = false;
    }
  }
  /**
   * Returns the suffix used to construct the name of the L&amp;F class used to
   * render this component.
   *
   * @return the string "TableUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTable.uiClassID;
  }
  /**
   * Sets the data model for this table to {@code dataModel} and registers
   * with it for listener notifications from the new data model.
   *
   * @param  dataModel the new data source for this table
   * @throws IllegalArgumentException if {@code dataModel} is {@code null}
   * @see #getModel
   */
  setModel(dataModel: TableModel): void {
    if (dataModel == null) {
      throw new IllegalArgumentException('Cannot set a null TableModel');
    }
    if (this.dataModel !== dataModel) {
      let old = this.dataModel;
      if (old != null) {
        old.removeTableModelListener(this);
      }
      this.dataModel = dataModel;
      dataModel.addTableModelListener(this);
      this.tableChanged(new TableModelEvent()._TableModelEvent$TableModel$int(dataModel, TableModelEvent.HEADER_ROW));
      this.firePropertyChange$String$Object$Object('model', old, dataModel);
      if (this.getAutoCreateRowSorter()) {
        this.setRowSorter(new TableRowSorter()._TableRowSorter$TableModel(dataModel));
      }
    }
  }
  /**
   * Returns the {@code TableModel} that provides the data displayed by this
   * {@code JTable}.
   *
   * @return the {@code TableModel} that provides the data displayed by this
   *         {@code JTable}
   * @see #setModel
   */
  getModel(): TableModel {
    return this.dataModel;
  }
  /**
   * Sets the column model for this table to {@code columnModel} and registers
   * for listener notifications from the new column model. Also sets the
   * column model of the {@code JTableHeader} to {@code columnModel}.
   *
   * @param  columnModel the new data source for this table
   * @throws IllegalArgumentException if {@code columnModel} is {@code null}
   * @see #getColumnModel
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
      if (this.tableHeader != null) {
        this.tableHeader.setColumnModel(columnModel);
      }
      this.firePropertyChange$String$Object$Object('columnModel', old, columnModel);
      this.resizeAndRepaint();
    }
  }
  /**
   * Returns the {@code TableColumnModel} that contains all column information
   * of this table.
   *
   * @return the object that provides the column state of the table
   * @see #setColumnModel
   */
  getColumnModel(): TableColumnModel {
    return this.columnModel;
  }
  /**
   * Sets the row selection model for this table to {@code selectionModel}
   * and registers for listener notifications from the new selection model.
   *
   * @param  selectionModel the new selection model
   * @throws IllegalArgumentException if {@code selectionModel} is
   *         {@code null}
   * @see #getSelectionModel
   */
  setSelectionModel(selectionModel: ListSelectionModel): void {
    if (selectionModel == null) {
      throw new IllegalArgumentException('Cannot set a null SelectionModel');
    }
    let oldModel = this.selectionModel;
    if (selectionModel !== oldModel) {
      if (oldModel != null) {
        oldModel.removeListSelectionListener($J.fn(this, 'valueChanged'));
      }
      this.selectionModel = selectionModel;
      selectionModel.addListSelectionListener($J.fn(this, 'valueChanged'));
      this.firePropertyChange$String$Object$Object('selectionModel', oldModel, selectionModel);
      this.repaint$();
    }
  }
  /**
   * Returns the {@code ListSelectionModel} that is used to maintain row
   * selection state.
   *
   * @return the object that provides row selection state, {@code null} if row
   *         selection is not allowed
   * @see #setSelectionModel
   */
  getSelectionModel(): ListSelectionModel {
    return this.selectionModel;
  }
  /**
   * <code>RowSorterListener</code> notification that the
   * <code>RowSorter</code> has changed in some way.
   *
   * @param e the <code>RowSorterEvent</code> describing the change
   * @throws NullPointerException if <code>e</code> is <code>null</code>
   * @since 1.6
   */
  sorterChanged(e: RowSorterEvent): void {
    if (e.getType() === RowSorterEvent$Type.SORT_ORDER_CHANGED) {
      let header = this.getTableHeader();
      if (header != null) {
        header.repaint$();
      }
    } else if (e.getType() === RowSorterEvent$Type.SORTED) {
      this.sorterChanged_ = true;
      if (!this.ignoreSortChange) {
        this.sortedTableChanged(e, null);
      }
    }
  }
  /**
   * Invoked when <code>sorterChanged</code> is invoked, or
   * when <code>tableChanged</code> is invoked and sorting is enabled.
   */
  sortedTableChanged(sortedEvent: RowSorterEvent, e: TableModelEvent): void {
    let editingModelIndex = -1;
    let change = (e != null) ? new JTable$ModelChange().$o(this)._JTable$ModelChange(e) : null;
    if ((change == null || !change.allRowsChanged_) && this.editingRow !== -1) {
      editingModelIndex = this.convertRowIndexToModel$RowSorterEvent$int$JTable(sortedEvent, this.editingRow);
    }
    this.sortManager.prepareForChange(sortedEvent, change);
    if (e != null) {
      if (change.type === TableModelEvent.UPDATE) {
        this.repaintSortedRows(change);
      }
      this.notifySorter(change);
      if (change.type !== TableModelEvent.UPDATE) {
        this.sorterChanged_ = true;
      }
    } else {
      this.sorterChanged_ = true;
    }
    this.sortManager.processChange(sortedEvent, change, this.sorterChanged_);
    if (this.sorterChanged_) {
      if (this.editingRow !== -1) {
        let newIndex = (editingModelIndex === -1) ? -1 : this.convertRowIndexToView$int$ModelChange$JTable(editingModelIndex, change);
        this.restoreSortingEditingRow(newIndex);
      }
      if (e == null || change.type !== TableModelEvent.UPDATE) {
        this.resizeAndRepaint();
      }
    }
    if (change != null && change.allRowsChanged_) {
      this.clearSelectionAndLeadAnchor();
      this.resizeAndRepaint();
    }
  }
  /**
   * Repaints the sort of sorted rows in response to a TableModelEvent.
   */
  repaintSortedRows(change: JTable$ModelChange): void {
    if (change.startModelIndex > change.endModelIndex || ((change.startModelIndex + 10) | 0) < change.endModelIndex) {
      this.repaint$();
      return;
    }
    let eventColumn = change.event.getColumn();
    let columnViewIndex = eventColumn;
    if (columnViewIndex === TableModelEvent.ALL_COLUMNS) {
      columnViewIndex = 0;
    } else {
      columnViewIndex = this.convertColumnIndexToView(columnViewIndex);
      if (columnViewIndex === -1) {
        return;
      }
    }
    let modelIndex = change.startModelIndex;
    while (modelIndex <= change.endModelIndex) {
      let viewIndex = this.convertRowIndexToView$int(modelIndex++);
      if (viewIndex !== -1) {
        let dirty = this.getCellRect(viewIndex, columnViewIndex, false);
        let x = dirty.x_;
        let w = dirty.width_;
        if (eventColumn === TableModelEvent.ALL_COLUMNS) {
          x = 0;
          w = this.getWidth();
        }
        this.repaint$int$int$int$int(x, dirty.y_, w, dirty.height_);
      }
    }
  }
  /**
   * Restores the selection after a model event/sort order changes.
   * All coordinates are in terms of the model.
   */
  restoreSortingSelection(selection: number[], lead: number, change: JTable$ModelChange): void {
    for (let i = (selection.length - 1) | 0; i >= 0; i--) {
      selection[i] = this.convertRowIndexToView$int$ModelChange$JTable(selection[i], change);
    }
    lead = this.convertRowIndexToView$int$ModelChange$JTable(lead, change);
    if (selection.length === 0 || (selection.length === 1 && selection[0] === this.getSelectedRow())) {
      return;
    }
    this.selectionModel.setValueIsAdjusting(true);
    this.selectionModel.clearSelection();
    for (let i = (selection.length - 1) | 0; i >= 0; i--) {
      if (selection[i] !== -1) {
        this.selectionModel.addSelectionInterval(selection[i], selection[i]);
      }
    }
    SwingUtilities2.setLeadAnchorWithoutSelection(this.selectionModel, lead, lead);
    this.selectionModel.setValueIsAdjusting(false);
  }
  /**
   * Restores the editing row after a model event/sort order change.
   *
   * @param editingRow new index of the editingRow, in terms of the view
   */
  restoreSortingEditingRow(editingRow: number): void {
    if (editingRow === -1) {
      let editor = this.getCellEditor$();
      if (editor != null) {
        editor.cancelCellEditing();
        if (this.getCellEditor$() != null) {
          this.removeEditor();
        }
      }
    } else {
      this.editingRow = editingRow;
      this.repaint$();
    }
  }
  /**
   * Notifies the sorter of a change in the underlying model.
   */
  notifySorter(change: JTable$ModelChange): void {
    try {
      this.ignoreSortChange = true;
      this.sorterChanged_ = false;
      switch (change.type) {
        case TableModelEvent.UPDATE:
          if (change.event.getLastRow() === 2147483647) {
            this.sortManager.sorter.allRowsChanged();
          } else if (change.event.getColumn() === TableModelEvent.ALL_COLUMNS) {
            this.sortManager.sorter.rowsUpdated$int$int(change.startModelIndex, change.endModelIndex);
          } else {
            this.sortManager.sorter.rowsUpdated$int$int$int(change.startModelIndex, change.endModelIndex, change.event.getColumn());
          }
          break;
        case TableModelEvent.INSERT:
          this.sortManager.sorter.rowsInserted(change.startModelIndex, change.endModelIndex);
          break;
        case TableModelEvent.DELETE:
          this.sortManager.sorter.rowsDeleted(change.startModelIndex, change.endModelIndex);
          break;
      }
    } finally {
      this.ignoreSortChange = false;
    }
  }
  /**
   * Converts a model index to view index.  This is called when the
   * sorter or model changes and sorting is enabled.
   *
   * @param change describes the TableModelEvent that initiated the change;
   *        will be null if called as the result of a sort
   */
  convertRowIndexToView$int$ModelChange$JTable(modelIndex: number, change: JTable$ModelChange): number {
    if (modelIndex < 0) {
      return -1;
    }
    if (change != null && modelIndex >= change.startModelIndex) {
      if (change.type === TableModelEvent.INSERT) {
        if (((modelIndex + change.length_) | 0) >= change.modelRowCount) {
          return -1;
        }
        return this.sortManager.sorter.convertRowIndexToView((modelIndex + change.length_) | 0);
      } else if (change.type === TableModelEvent.DELETE) {
        if (modelIndex <= change.endModelIndex) {
          return -1;
        } else {
          if (((modelIndex - change.length_) | 0) >= change.modelRowCount) {
            return -1;
          }
          return this.sortManager.sorter.convertRowIndexToView((modelIndex - change.length_) | 0);
        }
      }
    }
    if (modelIndex >= this.getModel().getRowCount()) {
      return -1;
    }
    return this.sortManager.sorter.convertRowIndexToView(modelIndex);
  }
  /**
   * Converts the selection to model coordinates.  This is used when
   * the model changes or the sorter changes.
   */
  convertSelectionToModel(e: RowSorterEvent): number[] {
    let selection = this.getSelectedRows();
    for (let i = (selection.length - 1) | 0; i >= 0; i--) {
      selection[i] = this.convertRowIndexToModel$RowSorterEvent$int$JTable(e, selection[i]);
    }
    return selection;
  }
  convertRowIndexToModel$RowSorterEvent$int$JTable(e: RowSorterEvent, viewIndex: number): number {
    if (e != null) {
      if (e.getPreviousRowCount() === 0) {
        return viewIndex;
      }
      return e.convertPreviousRowIndexToModel(viewIndex);
    }
    if (viewIndex < 0 || viewIndex >= this.getRowCount()) {
      return -1;
    }
    return this.convertRowIndexToModel$int(viewIndex);
  }
  /**
   * Invoked when this table's <code>TableModel</code> generates
   * a <code>TableModelEvent</code>.
   * The <code>TableModelEvent</code> should be constructed in the
   * coordinate system of the model; the appropriate mapping to the
   * view coordinate system is performed by this <code>JTable</code>
   * when it receives the event.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by <code>JTable</code>.
   * <p>
   * Note that as of 1.3, this method clears the selection, if any.
   */
  tableChanged(e: TableModelEvent): void {
    if (e == null || e.getFirstRow() === TableModelEvent.HEADER_ROW) {
      this.clearSelectionAndLeadAnchor();
      this.rowModel = null;
      if (this.sortManager != null) {
        try {
          this.ignoreSortChange = true;
          this.sortManager.sorter.modelStructureChanged();
        } finally {
          this.ignoreSortChange = false;
        }
        this.sortManager.allChanged();
      }
      if (this.getAutoCreateColumnsFromModel()) {
        this.createDefaultColumnsFromModel();
        return;
      }
      this.resizeAndRepaint();
      return;
    }
    if (this.sortManager != null) {
      this.sortedTableChanged(null, e);
      return;
    }
    if (this.rowModel != null) {
      this.repaint$();
    }
    if (e.getType() === TableModelEvent.INSERT) {
      this.tableRowsInserted(e);
      return;
    }
    if (e.getType() === TableModelEvent.DELETE) {
      this.tableRowsDeleted(e);
      return;
    }
    let modelColumn = e.getColumn();
    let start = e.getFirstRow();
    let end = e.getLastRow();
    let dirtyRegion: Rectangle;
    if (modelColumn === TableModelEvent.ALL_COLUMNS) {
      dirtyRegion = new Rectangle()._Rectangle$int$int$int$int(0, Math.imul(start, this.getRowHeight$()), this.getColumnModel().getTotalColumnWidth(), 0);
    } else {
      let column = this.convertColumnIndexToView(modelColumn);
      dirtyRegion = this.getCellRect(start, column, false);
    }
    if (end !== 2147483647) {
      dirtyRegion.height_ = Math.imul(((end - start + 1) | 0), this.getRowHeight$());
      this.repaint$int$int$int$int(dirtyRegion.x_, dirtyRegion.y_, dirtyRegion.width_, dirtyRegion.height_);
    } else {
      this.clearSelectionAndLeadAnchor();
      this.resizeAndRepaint();
      this.rowModel = null;
    }
  }
  tableRowsInserted(e: TableModelEvent): void {
    let start = e.getFirstRow();
    let end = e.getLastRow();
    if (start < 0) {
      start = 0;
    }
    if (end < 0) {
      end = (this.getRowCount() - 1) | 0;
    }
    let length = (end - start + 1) | 0;
    this.selectionModel.insertIndexInterval(start, length, true);
    if (this.rowModel != null) {
      this.rowModel.insertEntries(start, length, this.getRowHeight$());
    }
    let rh = this.getRowHeight$();
    let drawRect = new Rectangle()._Rectangle$int$int$int$int(0, Math.imul(start, rh), this.getColumnModel().getTotalColumnWidth(), Math.imul(((this.getRowCount() - start) | 0), rh));
    this.revalidate();
    this.repaint$Rectangle(drawRect);
  }
  tableRowsDeleted(e: TableModelEvent): void {
    let start = e.getFirstRow();
    let end = e.getLastRow();
    if (start < 0) {
      start = 0;
    }
    if (end < 0) {
      end = (this.getRowCount() - 1) | 0;
    }
    let deletedCount = (end - start + 1) | 0;
    let previousRowCount = (this.getRowCount() + deletedCount) | 0;
    this.selectionModel.removeIndexInterval(start, end);
    if (this.rowModel != null) {
      this.rowModel.removeEntries(start, deletedCount);
    }
    let rh = this.getRowHeight$();
    let drawRect = new Rectangle()._Rectangle$int$int$int$int(0, Math.imul(start, rh), this.getColumnModel().getTotalColumnWidth(), Math.imul(((previousRowCount - start) | 0), rh));
    this.revalidate();
    this.repaint$Rectangle(drawRect);
  }
  /**
   * Invoked when a column is added to the table column model.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @see TableColumnModelListener
   */
  columnAdded(e: TableColumnModelEvent): void {
    if (this.isEditing()) {
      this.removeEditor();
    }
    this.resizeAndRepaint();
  }
  /**
   * Invoked when a column is removed from the table column model.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @see TableColumnModelListener
   */
  columnRemoved(e: TableColumnModelEvent): void {
    if (this.isEditing()) {
      this.removeEditor();
    }
    this.resizeAndRepaint();
  }
  /**
   * Invoked when a column is repositioned. If a cell is being
   * edited, then editing is stopped and the cell is redrawn.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @param e   the event received
   * @see TableColumnModelListener
   */
  columnMoved(e: TableColumnModelEvent): void {
    if (this.isEditing() && !this.getCellEditor$().stopCellEditing()) {
      this.getCellEditor$().cancelCellEditing();
    }
    this.repaint$();
  }
  /**
   * Invoked when a column is moved due to a margin change.
   * If a cell is being edited, then editing is stopped and the cell
   * is redrawn.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @param  e    the event received
   * @see TableColumnModelListener
   */
  columnMarginChanged(e: ChangeEvent): void {
    if (this.isEditing() && !this.getCellEditor$().stopCellEditing()) {
      this.getCellEditor$().cancelCellEditing();
    }
    let resizingColumn = this.getResizingColumn();
    if (resizingColumn != null && this.autoResizeMode === JTable.AUTO_RESIZE_OFF) {
      resizingColumn.setPreferredWidth(resizingColumn.getWidth());
    }
    this.resizeAndRepaint();
  }
  limit(i: number, a: number, b: number): number {
    return Math.min(b, Math.max(i, a));
  }
  /**
   * Invoked when the selection model of the <code>TableColumnModel</code>
   * is changed.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @param  e  the event received
   * @see TableColumnModelListener
   */
  columnSelectionChanged(e: ListSelectionEvent): void {
    let isAdjusting = e.getValueIsAdjusting();
    if (this.columnSelectionAdjusting && !isAdjusting) {
      this.columnSelectionAdjusting = false;
      return;
    }
    this.columnSelectionAdjusting = isAdjusting;
    if (this.getRowCount() <= 0 || this.getColumnCount() <= 0) {
      return;
    }
    let firstIndex = this.limit(e.getFirstIndex(), 0, (this.getColumnCount() - 1) | 0);
    let lastIndex = this.limit(e.getLastIndex(), 0, (this.getColumnCount() - 1) | 0);
    let minRow = 0;
    let maxRow = (this.getRowCount() - 1) | 0;
    if (this.getRowSelectionAllowed()) {
      minRow = this.selectionModel.getMinSelectionIndex();
      maxRow = this.selectionModel.getMaxSelectionIndex();
      let leadRow = this.getAdjustedIndex(this.selectionModel.getLeadSelectionIndex(), true);
      if (minRow === -1 || maxRow === -1) {
        if (leadRow === -1) {
          return;
        }
        minRow = maxRow = leadRow;
      } else {
        if (leadRow !== -1) {
          minRow = Math.min(minRow, leadRow);
          maxRow = Math.max(maxRow, leadRow);
        }
      }
    }
    let firstColumnRect = this.getCellRect(minRow, firstIndex, false);
    let lastColumnRect = this.getCellRect(maxRow, lastIndex, false);
    let dirtyRegion = firstColumnRect.union(lastColumnRect);
    this.repaint$Rectangle(dirtyRegion);
  }
  /**
   * Invoked when the row selection changes -- repaints to show the new
   * selection.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @param e   the event received
   * @see ListSelectionListener
   */
  valueChanged(e: ListSelectionEvent): void {
    if (this.sortManager != null) {
      this.sortManager.viewSelectionChanged(e);
    }
    let isAdjusting = e.getValueIsAdjusting();
    if (this.rowSelectionAdjusting && !isAdjusting) {
      this.rowSelectionAdjusting = false;
      return;
    }
    this.rowSelectionAdjusting = isAdjusting;
    if (this.getRowCount() <= 0 || this.getColumnCount() <= 0) {
      return;
    }
    let firstIndex = this.limit(e.getFirstIndex(), 0, (this.getRowCount() - 1) | 0);
    let lastIndex = this.limit(e.getLastIndex(), 0, (this.getRowCount() - 1) | 0);
    let firstRowRect = this.getCellRect(firstIndex, 0, false);
    let lastRowRect = this.getCellRect(lastIndex, (this.getColumnCount() - 1) | 0, false);
    let dirtyRegion = firstRowRect.union(lastRowRect);
    this.repaint$Rectangle(dirtyRegion);
  }
  /**
   * Invoked when editing is finished. The changes are saved and the
   * editor is discarded.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @param  e  the event received
   * @see CellEditorListener
   */
  editingStopped(e: ChangeEvent): void {
    let editor = this.getCellEditor$();
    if (editor != null) {
      let value = editor.getCellEditorValue();
      this.setValueAt(value, this.editingRow, this.editingColumn);
      this.removeEditor();
    }
  }
  /**
   * Invoked when editing is canceled. The editor object is discarded
   * and the cell is rendered once again.
   * <p>
   * Application code will not use these methods explicitly, they
   * are used internally by JTable.
   *
   * @param  e  the event received
   * @see CellEditorListener
   */
  editingCanceled(e: ChangeEvent): void {
    this.removeEditor();
  }
  /**
   * Sets the preferred size of the viewport for this table.
   *
   * @param size  a <code>Dimension</code> object specifying the <code>preferredSize</code> of a
   *              <code>JViewport</code> whose view is this table
   * @see Scrollable#getPreferredScrollableViewportSize
   */
  setPreferredScrollableViewportSize(size: Dimension): void {
    this.preferredViewportSize = size;
  }
  /**
   * Returns the preferred size of the viewport for this table.
   *
   * @return a <code>Dimension</code> object containing the <code>preferredSize</code> of the <code>JViewport</code>
   *         which displays this table
   * @see Scrollable#getPreferredScrollableViewportSize
   */
  getPreferredScrollableViewportSize(): Dimension {
    return this.preferredViewportSize;
  }
  /**
   * Returns the scroll increment (in pixels) that completely exposes one new
   * row or column (depending on the orientation).
   * <p>
   * This method is called each time the user requests a unit scroll.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation either <code>SwingConstants.VERTICAL</code>
   *                  or <code>SwingConstants.HORIZONTAL</code>
   * @param direction less than zero to scroll up/left,
   *                  greater than zero for down/right
   * @return the "unit" increment for scrolling in the specified direction
   * @see Scrollable#getScrollableUnitIncrement
   */
  getScrollableUnitIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    let leadingRow: number;
    let leadingCol: number;
    let leadingCellRect: Rectangle;
    let leadingVisibleEdge: number;
    let leadingCellEdge: number;
    let leadingCellSize: number;
    leadingRow = this.getLeadingRow(visibleRect);
    leadingCol = this.getLeadingCol(visibleRect);
    if (orientation === SwingConstants.VERTICAL && leadingRow < 0) {
      return this.getRowHeight$();
    } else if (orientation === SwingConstants.HORIZONTAL && leadingCol < 0) {
      return 100;
    }
    leadingCellRect = this.getCellRect(leadingRow, leadingCol, true);
    leadingVisibleEdge = this.leadingEdge(visibleRect, orientation);
    leadingCellEdge = this.leadingEdge(leadingCellRect, orientation);
    if (orientation === SwingConstants.VERTICAL) {
      leadingCellSize = leadingCellRect.height_;
    } else {
      leadingCellSize = leadingCellRect.width_;
    }
    if (leadingVisibleEdge === leadingCellEdge) {
      if (direction < 0) {
        let retVal = 0;
        if (orientation === SwingConstants.VERTICAL) {
          while (--leadingRow >= 0) {
            retVal = this.getRowHeight$int(leadingRow);
            if (retVal !== 0) {
              break;
            }
          }
        } else {
          while (--leadingCol >= 0) {
            retVal = this.getCellRect(leadingRow, leadingCol, true).width_;
            if (retVal !== 0) {
              break;
            }
          }
        }
        return retVal;
      } else {
        return leadingCellSize;
      }
    } else {
      let hiddenAmt = Math.abs((leadingVisibleEdge - leadingCellEdge) | 0);
      let visibleAmt = (leadingCellSize - hiddenAmt) | 0;
      if (direction > 0) {
        return visibleAmt;
      } else {
        return hiddenAmt;
      }
    }
  }
  /**
   * Returns <code>visibleRect.height</code> or
   * <code>visibleRect.width</code>,
   * depending on this table's orientation.  Note that as of Swing 1.1.1
   * (Java 2 v 1.2.2) the value
   * returned will ensure that the viewport is cleanly aligned on
   * a row boundary.
   *
   * @return <code>visibleRect.height</code> or
   *                                  <code>visibleRect.width</code>
   *                                  per the orientation
   * @see Scrollable#getScrollableBlockIncrement
   */
  getScrollableBlockIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    if (this.getRowCount() === 0) {
      if (SwingConstants.VERTICAL === orientation) {
        let rh = this.getRowHeight$();
        return (rh > 0) ? Math.max(rh, Math.imul(($J.idiv(visibleRect.height_, rh)), rh)) : visibleRect.height_;
      } else {
        return visibleRect.width_;
      }
    }
    if (null == this.rowModel && SwingConstants.VERTICAL === orientation) {
      let row = this.rowAtPoint(visibleRect.getLocation());
      // assert row != -1
      let col = this.columnAtPoint(visibleRect.getLocation());
      let cellRect = this.getCellRect(row, col, true);
      if (cellRect.y_ === visibleRect.y_) {
        let rh = this.getRowHeight$();
        // assert rh > 0
        return Math.max(rh, Math.imul(($J.idiv(visibleRect.height_, rh)), rh));
      }
    }
    if (direction < 0) {
      return this.getPreviousBlockIncrement(visibleRect, orientation);
    } else {
      return this.getNextBlockIncrement(visibleRect, orientation);
    }
  }
  /**
   * Called to get the block increment for upward scrolling in cases of
   * horizontal scrolling, or for vertical scrolling of a table with
   * variable row heights.
   */
  getPreviousBlockIncrement(visibleRect: Rectangle, orientation: number): number {
    let row: number;
    let col: number;
    let newEdge: number;
    let newCellLoc: Point;
    let visibleLeadingEdge = this.leadingEdge(visibleRect, orientation);
    let leftToRight = this.getComponentOrientation().isLeftToRight();
    let newLeadingEdge: number;
    if (orientation === SwingConstants.VERTICAL) {
      newEdge = (visibleLeadingEdge - visibleRect.height_) | 0;
      let x = (visibleRect.x_ + (leftToRight ? 0 : visibleRect.width_)) | 0;
      newCellLoc = new Point()._Point$int$int(x, newEdge);
    } else if (leftToRight) {
      newEdge = (visibleLeadingEdge - visibleRect.width_) | 0;
      newCellLoc = new Point()._Point$int$int(newEdge, visibleRect.y_);
    } else {
      newEdge = (visibleLeadingEdge + visibleRect.width_) | 0;
      newCellLoc = new Point()._Point$int$int((newEdge - 1) | 0, visibleRect.y_);
    }
    row = this.rowAtPoint(newCellLoc);
    col = this.columnAtPoint(newCellLoc);
    if (!!(orientation === SwingConstants.VERTICAL & row < 0)) {
      newLeadingEdge = 0;
    } else if (!!(orientation === SwingConstants.HORIZONTAL & col < 0)) {
      if (leftToRight) {
        newLeadingEdge = 0;
      } else {
        newLeadingEdge = this.getWidth();
      }
    } else {
      let newCellRect = this.getCellRect(row, col, true);
      let newCellLeadingEdge = this.leadingEdge(newCellRect, orientation);
      let newCellTrailingEdge = this.trailingEdge(newCellRect, orientation);
      if ((orientation === SwingConstants.VERTICAL || leftToRight) && (newCellTrailingEdge >= visibleLeadingEdge)) {
        newLeadingEdge = newCellLeadingEdge;
      } else if (orientation === SwingConstants.HORIZONTAL && !leftToRight && newCellTrailingEdge <= visibleLeadingEdge) {
        newLeadingEdge = newCellLeadingEdge;
      } else if (newEdge === newCellLeadingEdge) {
        newLeadingEdge = newCellLeadingEdge;
      } else {
        newLeadingEdge = newCellTrailingEdge;
      }
    }
    return Math.abs((visibleLeadingEdge - newLeadingEdge) | 0);
  }
  /**
   * Called to get the block increment for downward scrolling in cases of
   * horizontal scrolling, or for vertical scrolling of a table with
   * variable row heights.
   */
  getNextBlockIncrement(visibleRect: Rectangle, orientation: number): number {
    let trailingRow = this.getTrailingRow(visibleRect);
    let trailingCol = this.getTrailingCol(visibleRect);
    let cellRect: Rectangle;
    let cellFillsVis: boolean;
    let cellLeadingEdge: number;
    let cellTrailingEdge: number;
    let newLeadingEdge: number;
    let visibleLeadingEdge = this.leadingEdge(visibleRect, orientation);
    if (orientation === SwingConstants.VERTICAL && trailingRow < 0) {
      return visibleRect.height_;
    } else if (orientation === SwingConstants.HORIZONTAL && trailingCol < 0) {
      return visibleRect.width_;
    }
    cellRect = this.getCellRect(trailingRow, trailingCol, true);
    cellLeadingEdge = this.leadingEdge(cellRect, orientation);
    cellTrailingEdge = this.trailingEdge(cellRect, orientation);
    if (orientation === SwingConstants.VERTICAL || this.getComponentOrientation().isLeftToRight()) {
      cellFillsVis = cellLeadingEdge <= visibleLeadingEdge;
    } else {
      cellFillsVis = cellLeadingEdge >= visibleLeadingEdge;
    }
    if (cellFillsVis) {
      newLeadingEdge = cellTrailingEdge;
    } else if (cellTrailingEdge === this.trailingEdge(visibleRect, orientation)) {
      newLeadingEdge = cellTrailingEdge;
    } else {
      newLeadingEdge = cellLeadingEdge;
    }
    return Math.abs((newLeadingEdge - visibleLeadingEdge) | 0);
  }
  getLeadingRow(visibleRect: Rectangle): number {
    let leadingPoint: Point;
    if (this.getComponentOrientation().isLeftToRight()) {
      leadingPoint = new Point()._Point$int$int(visibleRect.x_, visibleRect.y_);
    } else {
      leadingPoint = new Point()._Point$int$int((visibleRect.x_ + visibleRect.width_ - 1) | 0, visibleRect.y_);
    }
    return this.rowAtPoint(leadingPoint);
  }
  getLeadingCol(visibleRect: Rectangle): number {
    let leadingPoint: Point;
    if (this.getComponentOrientation().isLeftToRight()) {
      leadingPoint = new Point()._Point$int$int(visibleRect.x_, visibleRect.y_);
    } else {
      leadingPoint = new Point()._Point$int$int((visibleRect.x_ + visibleRect.width_ - 1) | 0, visibleRect.y_);
    }
    return this.columnAtPoint(leadingPoint);
  }
  getTrailingRow(visibleRect: Rectangle): number {
    let trailingPoint: Point;
    if (this.getComponentOrientation().isLeftToRight()) {
      trailingPoint = new Point()._Point$int$int(visibleRect.x_, (visibleRect.y_ + visibleRect.height_ - 1) | 0);
    } else {
      trailingPoint = new Point()._Point$int$int((visibleRect.x_ + visibleRect.width_ - 1) | 0, (visibleRect.y_ + visibleRect.height_ - 1) | 0);
    }
    return this.rowAtPoint(trailingPoint);
  }
  getTrailingCol(visibleRect: Rectangle): number {
    let trailingPoint: Point;
    if (this.getComponentOrientation().isLeftToRight()) {
      trailingPoint = new Point()._Point$int$int((visibleRect.x_ + visibleRect.width_ - 1) | 0, visibleRect.y_);
    } else {
      trailingPoint = new Point()._Point$int$int(visibleRect.x_, visibleRect.y_);
    }
    return this.columnAtPoint(trailingPoint);
  }
  leadingEdge(rect: Rectangle, orientation: number): number {
    if (orientation === SwingConstants.VERTICAL) {
      return rect.y_;
    } else if (this.getComponentOrientation().isLeftToRight()) {
      return rect.x_;
    } else {
      return (rect.x_ + rect.width_) | 0;
    }
  }
  trailingEdge(rect: Rectangle, orientation: number): number {
    if (orientation === SwingConstants.VERTICAL) {
      return (rect.y_ + rect.height_) | 0;
    } else if (this.getComponentOrientation().isLeftToRight()) {
      return (rect.x_ + rect.width_) | 0;
    } else {
      return rect.x_;
    }
  }
  /**
   * Returns false if <code>autoResizeMode</code> is set to
   * <code>AUTO_RESIZE_OFF</code>, which indicates that the
   * width of the viewport does not determine the width
   * of the table.  Otherwise returns true.
   *
   * @return false if <code>autoResizeMode</code> is set
   *   to <code>AUTO_RESIZE_OFF</code>, otherwise returns true
   * @see Scrollable#getScrollableTracksViewportWidth
   */
  getScrollableTracksViewportWidth(): boolean {
    return !(this.autoResizeMode === JTable.AUTO_RESIZE_OFF);
  }
  /**
   * Returns {@code false} to indicate that the height of the viewport does
   * not determine the height of the table, unless
   * {@code getFillsViewportHeight} is {@code true} and the preferred height
   * of the table is smaller than the viewport's height.
   *
   * @return {@code false} unless {@code getFillsViewportHeight} is
   *         {@code true} and the table needs to be stretched to fill
   *         the viewport
   * @see Scrollable#getScrollableTracksViewportHeight
   * @see #setFillsViewportHeight
   * @see #getFillsViewportHeight
   */
  getScrollableTracksViewportHeight(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    return this.getFillsViewportHeight() && parent instanceof JViewport && parent.getHeight() > this.getPreferredSize$().height_;
  }
  /**
   * Returns whether or not this table is always made large enough
   * to fill the height of an enclosing viewport.
   *
   * @return whether or not this table is always made large enough
   *         to fill the height of an enclosing viewport
   * @see #setFillsViewportHeight
   * @since 1.6
   */
  getFillsViewportHeight(): boolean {
    return this.fillsViewportHeight;
  }
  processKeyBinding(ks: KeyStroke, e: KeyEvent, condition: number, pressed: boolean): boolean {
    let retValue = super.processKeyBinding(ks, e, condition, pressed);
    if (!retValue && condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT && this.isFocusOwner() && !$J.equals(false, this.getClientProperty('JTable.autoStartsEdit'))) {
      let editorComponent = this.getEditorComponent();
      if (editorComponent == null) {
        if (e == null || e.getID() !== KeyEvent.KEY_PRESSED) {
          return false;
        }
        let code = e.getKeyCode();
        if (code === KeyEvent.VK_SHIFT || code === KeyEvent.VK_CONTROL || code === KeyEvent.VK_ALT || code === KeyEvent.VK_META || code === KeyEvent.VK_ALT_GRAPH) {
          return false;
        }
        let leadRow = this.getSelectionModel().getLeadSelectionIndex();
        let leadColumn = this.getColumnModel().getSelectionModel().getLeadSelectionIndex();
        if (leadRow !== -1 && leadColumn !== -1 && !this.isEditing()) {
          if (!this.editCellAt$int$int$EventObject(leadRow, leadColumn, e)) {
            return false;
          }
        }
        editorComponent = this.getEditorComponent();
        if (editorComponent == null) {
          return false;
        }
      }
      if (editorComponent instanceof JComponent) {
        retValue = (editorComponent).processKeyBinding(ks, e, JComponent.WHEN_FOCUSED, pressed);
        let prop = this.getClientProperty('JTable.forceAutoStartsEdit');
        if (this.getSurrendersFocusOnKeystroke() || $J.equals(true, prop)) {
          editorComponent.requestFocus$();
        }
      }
    }
    return retValue;
  }
  /**
   * Creates default cell renderers for objects, numbers, doubles, dates,
   * booleans, and icons.
   * @see javax.swing.table.DefaultTableCellRenderer
   */
  createDefaultRenderers(): void {
    this.defaultRenderersByColumnClass = new UIDefaults()._UIDefaults$int$float(8, 0.75);
    this.defaultRenderersByColumnClass.put($J.cls(JObject), (t) => new DefaultTableCellRenderer$UIResource()._DefaultTableCellRenderer$UIResource());
    this.defaultRenderersByColumnClass.put($J.cls(JNumber), (t) => new JTable$NumberRenderer()._JTable$NumberRenderer());
    this.defaultRenderersByColumnClass.put($J.cls(Float), (t) => new JTable$DoubleRenderer()._JTable$DoubleRenderer());
    this.defaultRenderersByColumnClass.put($J.cls(Double), (t) => new JTable$DoubleRenderer()._JTable$DoubleRenderer());
    this.defaultRenderersByColumnClass.put($J.cls(JDate), (t) => new JTable$DateRenderer()._JTable$DateRenderer());
    this.defaultRenderersByColumnClass.put($J.cls(Icon), (t) => new JTable$IconRenderer()._JTable$IconRenderer());
    this.defaultRenderersByColumnClass.put($J.cls(ImageIcon), (t) => new JTable$IconRenderer()._JTable$IconRenderer());
    this.defaultRenderersByColumnClass.put($J.cls(JBoolean), (t) => new JTable$BooleanRenderer()._JTable$BooleanRenderer());
  }
  /**
   * Creates default cell editors for objects, numbers, and boolean values.
   * @see DefaultCellEditor
   */
  createDefaultEditors(): void {
    this.defaultEditorsByColumnClass = new UIDefaults()._UIDefaults$int$float(3, 0.75);
    this.defaultEditorsByColumnClass.put($J.cls(JObject), (t) => new JTable$GenericEditor()._JTable$GenericEditor());
    this.defaultEditorsByColumnClass.put($J.cls(JNumber), (t) => new JTable$NumberEditor()._JTable$NumberEditor());
    this.defaultEditorsByColumnClass.put($J.cls(JBoolean), (t) => new JTable$BooleanEditor()._JTable$BooleanEditor());
  }
  /**
   * Initializes table properties to their default values.
   */
  initializeLocalVars(): void {
    this.updateSelectionOnSort = true;
    this.createDefaultRenderers();
    this.createDefaultEditors();
    this.setTableHeader(this.createDefaultTableHeader());
    this.setShowGrid(true);
    this.setAutoResizeMode(JTable.AUTO_RESIZE_SUBSEQUENT_COLUMNS);
    this.setRowHeight$int(16);
    this.isRowHeightSet = false;
    this.setRowMargin(1);
    this.setRowSelectionAllowed(true);
    this.setCellEditor(null);
    this.setEditingColumn(-1);
    this.setEditingRow(-1);
    this.setSurrendersFocusOnKeystroke(false);
    this.setPreferredScrollableViewportSize(new Dimension()._Dimension$int$int(450, 400));
    let toolTipManager = ToolTipManager.sharedInstance();
    toolTipManager.registerComponent(this);
    this.setAutoscrolls(true);
  }
  /**
   * Returns the default table model object, which is
   * a <code>DefaultTableModel</code>.  A subclass can override this
   * method to return a different table model object.
   *
   * @return the default table model object
   * @see javax.swing.table.DefaultTableModel
   */
  createDefaultDataModel(): TableModel {
    return new DefaultTableModel()._DefaultTableModel$();
  }
  /**
   * Returns the default column model object, which is
   * a <code>DefaultTableColumnModel</code>.  A subclass can override this
   * method to return a different column model object.
   *
   * @return the default column model object
   * @see javax.swing.table.DefaultTableColumnModel
   */
  createDefaultColumnModel(): TableColumnModel {
    return new DefaultTableColumnModel()._DefaultTableColumnModel();
  }
  /**
   * Returns the default selection model object, which is
   * a <code>DefaultListSelectionModel</code>.  A subclass can override this
   * method to return a different selection model object.
   *
   * @return the default selection model object
   * @see javax.swing.DefaultListSelectionModel
   */
  createDefaultSelectionModel(): ListSelectionModel {
    return new DefaultListSelectionModel()._DefaultListSelectionModel();
  }
  /**
   * Returns the default table header object, which is
   * a <code>JTableHeader</code>.  A subclass can override this
   * method to return a different table header object.
   *
   * @return the default table header object
   * @see javax.swing.table.JTableHeader
   */
  createDefaultTableHeader(): JTableHeader {
    return new JTableHeader()._JTableHeader$TableColumnModel(this.columnModel);
  }
  /**
   * Equivalent to <code>revalidate</code> followed by <code>repaint</code>.
   */
  resizeAndRepaint(): void {
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the active cell editor, which is {@code null} if the table
   * is not currently editing.
   *
   * @return the {@code TableCellEditor} that does the editing,
   *         or {@code null} if the table is not currently editing.
   * @see #cellEditor
   * @see #getCellEditor(int, int)
   */
  getCellEditor$(): TableCellEditor {
    return this.cellEditor;
  }
  /**
   * Sets the active cell editor.
   *
   * @param anEditor the active cell editor
   * @see #cellEditor
   */
  setCellEditor(anEditor: TableCellEditor): void {
    let oldEditor = this.cellEditor;
    this.cellEditor = anEditor;
    this.firePropertyChange$String$Object$Object('tableCellEditor', oldEditor, anEditor);
  }
  /**
   * Sets the <code>editingColumn</code> variable.
   * @param aColumn  the column of the cell to be edited
   *
   * @see #editingColumn
   */
  setEditingColumn(aColumn: number): void {
    this.editingColumn = aColumn;
  }
  /**
   * Sets the <code>editingRow</code> variable.
   * @param aRow  the row of the cell to be edited
   *
   * @see #editingRow
   */
  setEditingRow(aRow: number): void {
    this.editingRow = aRow;
  }
  /**
   * Returns an appropriate renderer for the cell specified by this row and
   * column. If the <code>TableColumn</code> for this column has a non-null
   * renderer, returns that.  If not, finds the class of the data in
   * this column (using <code>getColumnClass</code>)
   * and returns the default renderer for this type of data.
   * <p>
   * <b>Note:</b>
   * Throughout the table package, the internal implementations always
   * use this method to provide renderers so that this default behavior
   * can be safely overridden by a subclass.
   *
   * @param row       the row of the cell to render, where 0 is the first row
   * @param column    the column of the cell to render,
   *                  where 0 is the first column
   * @return the assigned renderer; if <code>null</code>
   *                  returns the default renderer
   *                  for this type of object
   * @see javax.swing.table.DefaultTableCellRenderer
   * @see javax.swing.table.TableColumn#setCellRenderer
   * @see #setDefaultRenderer
   */
  getCellRenderer(row: number, column: number): TableCellRenderer {
    let tableColumn = this.getColumnModel().getColumn(column);
    let renderer = tableColumn.getCellRenderer();
    if (renderer == null) {
      renderer = this.getDefaultRenderer(this.getColumnClass(column));
    }
    return renderer;
  }
  /**
   * Prepares the renderer by querying the data model for the
   * value and selection state
   * of the cell at <code>row</code>, <code>column</code>.
   * Returns the component (may be a <code>Component</code>
   * or a <code>JComponent</code>) under the event location.
   * <p>
   * During a printing operation, this method will configure the
   * renderer without indicating selection or focus, to prevent
   * them from appearing in the printed output. To do other
   * customizations based on whether or not the table is being
   * printed, you can check the value of
   * {@link javax.swing.JComponent#isPaintingForPrint()}, either here
   * or within custom renderers.
   * <p>
   * <b>Note:</b>
   * Throughout the table package, the internal implementations always
   * use this method to prepare renderers so that this default behavior
   * can be safely overridden by a subclass.
   *
   * @param renderer  the <code>TableCellRenderer</code> to prepare
   * @param row       the row of the cell to render, where 0 is the first row
   * @param column    the column of the cell to render,
   *                  where 0 is the first column
   * @return          the <code>Component</code> under the event location
   */
  prepareRenderer(renderer: TableCellRenderer, row: number, column: number): Component {
    let value = this.getValueAt(row, column);
    let isSelected = false;
    let hasFocus = false;
    if (!this.isPaintingForPrint()) {
      isSelected = this.isCellSelected(row, column);
      let rowIsLead = (this.selectionModel.getLeadSelectionIndex() === row);
      let colIsLead = (this.columnModel.getSelectionModel().getLeadSelectionIndex() === column);
      hasFocus = (rowIsLead && colIsLead) && this.isFocusOwner();
    }
    return renderer.getTableCellRendererComponent(this, value, isSelected, hasFocus, row, column);
  }
  /**
   * Returns an appropriate editor for the cell specified by
   * <code>row</code> and <code>column</code>. If the
   * <code>TableColumn</code> for this column has a non-null editor,
   * returns that.  If not, finds the class of the data in this
   * column (using <code>getColumnClass</code>)
   * and returns the default editor for this type of data.
   * <p>
   * <b>Note:</b>
   * Throughout the table package, the internal implementations always
   * use this method to provide editors so that this default behavior
   * can be safely overridden by a subclass.
   *
   * @param row       the row of the cell to edit, where 0 is the first row
   * @param column    the column of the cell to edit,
   *                  where 0 is the first column
   * @return          the editor for this cell;
   *                  if <code>null</code> return the default editor for
   *                  this type of cell
   * @see DefaultCellEditor
   */
  getCellEditor$int$int(row: number, column: number): TableCellEditor {
    let tableColumn = this.getColumnModel().getColumn(column);
    let editor = tableColumn.getCellEditor();
    if (editor == null) {
      editor = this.getDefaultEditor(this.getColumnClass(column));
    }
    return editor;
  }
  /**
   * Prepares the editor by querying the data model for the value and
   * selection state of the cell at <code>row</code>, <code>column</code>.
   * <p>
   * <b>Note:</b>
   * Throughout the table package, the internal implementations always
   * use this method to prepare editors so that this default behavior
   * can be safely overridden by a subclass.
   *
   * @param editor  the <code>TableCellEditor</code> to set up
   * @param row     the row of the cell to edit,
   *                where 0 is the first row
   * @param column  the column of the cell to edit,
   *                where 0 is the first column
   * @return the <code>Component</code> being edited
   */
  prepareEditor(editor: TableCellEditor, row: number, column: number): Component {
    let value = this.getValueAt(row, column);
    let isSelected = this.isCellSelected(row, column);
    let comp = editor.getTableCellEditorComponent(this, value, isSelected, row, column);
    if (comp instanceof JComponent) {
      let jComp = comp;
      if (jComp.getNextFocusableComponent() == null) {
        jComp.setNextFocusableComponent(this);
      }
    }
    return comp;
  }
  /**
   * Discards the editor object and frees the real estate it used for
   * cell rendering.
   */
  removeEditor(): void {
    KeyboardFocusManager.getCurrentKeyboardFocusManager$().removePropertyChangeListener$String$PropertyChangeListener('permanentFocusOwner', this.editorRemover);
    this.editorRemover = null;
    let editor = this.getCellEditor$();
    if (editor != null) {
      editor.removeCellEditorListener(this);
      if (this.editorComp != null) {
        let focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
        let isFocusOwnerInTheTable = focusOwner != null ? SwingUtilities.isDescendingFrom(focusOwner, this) : false;
        this.remove$Component(this.editorComp);
        if (isFocusOwnerInTheTable) {
          this.requestFocusInWindow$();
        }
      }
      let cellRect = this.getCellRect(this.editingRow, this.editingColumn, false);
      this.setCellEditor(null);
      this.setEditingColumn(-1);
      this.setEditingRow(-1);
      this.editorComp = null;
      this.repaint$Rectangle(cellRect);
    }
  }
  /**
   * Returns a string representation of this table. This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this table
   */
  paramString(): string {
    let gridColorString = (this.gridColor != null ? this.gridColor.toString() : '');
    let showHorizontalLinesString = (this.showHorizontalLines ? 'true' : 'false');
    let showVerticalLinesString = (this.showVerticalLines ? 'true' : 'false');
    let autoResizeModeString: string;
    if (this.autoResizeMode === JTable.AUTO_RESIZE_OFF) {
      autoResizeModeString = 'AUTO_RESIZE_OFF';
    } else if (this.autoResizeMode === JTable.AUTO_RESIZE_NEXT_COLUMN) {
      autoResizeModeString = 'AUTO_RESIZE_NEXT_COLUMN';
    } else if (this.autoResizeMode === JTable.AUTO_RESIZE_SUBSEQUENT_COLUMNS) {
      autoResizeModeString = 'AUTO_RESIZE_SUBSEQUENT_COLUMNS';
    } else if (this.autoResizeMode === JTable.AUTO_RESIZE_LAST_COLUMN) {
      autoResizeModeString = 'AUTO_RESIZE_LAST_COLUMN';
    } else if (this.autoResizeMode === JTable.AUTO_RESIZE_ALL_COLUMNS) {
      autoResizeModeString = 'AUTO_RESIZE_ALL_COLUMNS';
    } else {
      autoResizeModeString = '';
    }
    let autoCreateColumnsFromModelString = (this.autoCreateColumnsFromModel ? 'true' : 'false');
    let preferredViewportSizeString = (this.preferredViewportSize != null ? this.preferredViewportSize.toString() : '');
    let rowSelectionAllowedString = (this.rowSelectionAllowed ? 'true' : 'false');
    let cellSelectionEnabledString = (this.cellSelectionEnabled ? 'true' : 'false');
    let selectionForegroundString = (this.selectionForeground != null ? this.selectionForeground.toString() : '');
    let selectionBackgroundString = (this.selectionBackground != null ? this.selectionBackground.toString() : '');
    return super.paramString() + ',autoCreateColumnsFromModel=' + autoCreateColumnsFromModelString + ',autoResizeMode=' + autoResizeModeString + ',cellSelectionEnabled=' + cellSelectionEnabledString + ',editingColumn=' + this.editingColumn + ',editingRow=' + this.editingRow + ',gridColor=' + gridColorString + ',preferredViewportSize=' + preferredViewportSizeString + ',rowHeight=' + this.rowHeight + ',rowMargin=' + this.rowMargin + ',rowSelectionAllowed=' + rowSelectionAllowedString + ',selectionBackground=' + selectionBackgroundString + ',selectionForeground=' + selectionForegroundString + ',showHorizontalLines=' + showHorizontalLinesString + ',showVerticalLines=' + showVerticalLinesString;
  }
  /**
   * Gets the AccessibleContext associated with this JTable.
   * For tables, the AccessibleContext takes the form of an
   * AccessibleJTable.
   * A new AccessibleJTable instance is created if necessary.
   *
   * @return an AccessibleJTable that serves as the
   *         AccessibleContext of this JTable
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTable$AccessibleJTable().$o(this)._JTable$AccessibleJTable();
    }
    return this.accessibleContext;
  }
}

/**
 * Printing modes, used in printing <code>JTable</code>s.
 *
 * @see #print(JTable.PrintMode, MessageFormat, MessageFormat,
 *             boolean, PrintRequestAttributeSet, boolean)
 * @see #getPrintable
 * @since 1.5
 */
export class JTable$PrintMode extends JEnum {
  static NORMAL: JTable$PrintMode = null;
  static FIT_WIDTH: JTable$PrintMode = null;
  static $VALUES: JTable$PrintMode[] = null;
  _JTable$PrintMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): JTable$PrintMode[] { return JTable$PrintMode.$VALUES.slice(); }
  static valueOf(name: string): JTable$PrintMode { return $J.enumValueOf(JTable$PrintMode, name); }
  static $clinit() {
    JTable$PrintMode.NORMAL = new JTable$PrintMode()._JTable$PrintMode('NORMAL', 0);
    JTable$PrintMode.FIT_WIDTH = new JTable$PrintMode()._JTable$PrintMode('FIT_WIDTH', 1);
    JTable$PrintMode.$VALUES = [JTable$PrintMode.NORMAL, JTable$PrintMode.FIT_WIDTH];
  }
}

/**
 * A subclass of <code>TransferHandler.DropLocation</code> representing
 * a drop location for a <code>JTable</code>.
 *
 * @see #getDropLocation
 * @since 1.6
 */
export class JTable$DropLocation extends TransferHandler$DropLocation {
  row: number = 0;
  col: number = 0;
  isInsertRow_: boolean = false;
  isInsertCol: boolean = false;
  _JTable$DropLocation(p: Point, row: number, col: number, isInsertRow: boolean, isInsertCol: boolean): this {
    this._TransferHandler$DropLocation(p);
    this.row = row;
    this.col = col;
    this.isInsertRow_ = isInsertRow;
    this.isInsertCol = isInsertCol;
    return this;
  }
  /**
   * Returns the row index where a dropped item should be placed in the
   * table. Interpretation of the value depends on the return of
   * <code>isInsertRow()</code>. If that method returns
   * <code>true</code> this value indicates the index where a new
   * row should be inserted. Otherwise, it represents the value
   * of an existing row on which the data was dropped. This index is
   * in terms of the view.
   * <p>
   * <code>-1</code> indicates that the drop occurred over empty space,
   * and no row could be calculated.
   *
   * @return the drop row
   */
  getRow(): number {
    return this.row;
  }
  /**
   * Returns the column index where a dropped item should be placed in the
   * table. Interpretation of the value depends on the return of
   * <code>isInsertColumn()</code>. If that method returns
   * <code>true</code> this value indicates the index where a new
   * column should be inserted. Otherwise, it represents the value
   * of an existing column on which the data was dropped. This index is
   * in terms of the view.
   * <p>
   * <code>-1</code> indicates that the drop occurred over empty space,
   * and no column could be calculated.
   *
   * @return the drop row
   */
  getColumn(): number {
    return this.col;
  }
  /**
   * Returns whether or not this location represents an insert
   * of a row.
   *
   * @return whether or not this is an insert row
   */
  isInsertRow(): boolean {
    return this.isInsertRow_;
  }
  /**
   * Returns whether or not this location represents an insert
   * of a column.
   *
   * @return whether or not this is an insert column
   */
  isInsertColumn(): boolean {
    return this.isInsertCol;
  }
  /**
   * Returns a string representation of this drop location.
   * This method is intended to be used for debugging purposes,
   * and the content and format of the returned string may vary
   * between implementations.
   *
   * @return a string representation of this drop location
   */
  toString(): string {
    return $J.getClass(this).getName() + '[dropPoint=' + $J.str(this.getDropPoint()) + ',row=' + this.row + ',column=' + this.col + ',insertRow=' + this.isInsertRow_ + ',insertColumn=' + this.isInsertCol + ']';
  }
}

export class JTable$Resizable2 {
}

export class JTable$Resizable3 {
}

/**
 * SortManager provides support for managing the selection and variable
 * row heights when sorting is enabled. This information is encapsulated
 * into a class to avoid bulking up JTable.
 */
export class JTable$SortManager extends JObject {
  sorter: RowSorter<TableModel> = null;
  modelSelection: ListSelectionModel = null;
  modelLeadIndex: number = 0;
  syncingSelection: boolean = false;
  lastModelSelection: number[] = null;
  modelRowSizes: SizeSequence = null;
  _JTable$SortManager(sorter: RowSorter<TableModel>): this {
    this.sorter = sorter;
    sorter.addRowSorterListener(this.$outer);
    return this;
  }
  /**
   * Disposes any resources used by this SortManager.
   */
  dispose(): void {
    if (this.sorter != null) {
      this.sorter.removeRowSorterListener(this.$outer);
    }
  }
  /**
   * Invoked when the underlying model has completely changed.
   */
  allChanged(): void {
    this.modelLeadIndex = -1;
    this.modelSelection = null;
    this.modelRowSizes = null;
  }
  /**
   * Invoked when the selection, on the view, has changed.
   */
  viewSelectionChanged(e: ListSelectionEvent): void {
    if (!this.syncingSelection && this.modelSelection != null) {
      this.modelSelection = null;
    }
  }
  /**
   * Invoked when either the table model has changed, or the RowSorter
   * has changed. This is invoked prior to notifying the sorter of the
   * change.
   */
  prepareForChange(sortEvent: RowSorterEvent, change: JTable$ModelChange): void {
    if (this.$outer.getUpdateSelectionOnSort()) {
      this.cacheSelection(sortEvent, change);
    }
  }
  /**
   * Updates the internal cache of the selection based on the change.
   */
  cacheSelection(sortEvent: RowSorterEvent, change: JTable$ModelChange): void {
    if (sortEvent != null) {
      if (this.modelSelection == null && this.sorter.getViewRowCount() !== this.$outer.getModel().getRowCount()) {
        this.modelSelection = new DefaultListSelectionModel()._DefaultListSelectionModel();
        let viewSelection = this.$outer.getSelectionModel();
        let min = viewSelection.getMinSelectionIndex();
        let max = viewSelection.getMaxSelectionIndex();
        let modelIndex: number;
        for (let viewIndex = min; viewIndex <= max; viewIndex++) {
          if (viewSelection.isSelectedIndex(viewIndex)) {
            modelIndex = this.$outer.convertRowIndexToModel$RowSorterEvent$int$JTable(sortEvent, viewIndex);
            if (modelIndex !== -1) {
              this.modelSelection.addSelectionInterval(modelIndex, modelIndex);
            }
          }
        }
        modelIndex = this.$outer.convertRowIndexToModel$RowSorterEvent$int$JTable(sortEvent, viewSelection.getLeadSelectionIndex());
        SwingUtilities2.setLeadAnchorWithoutSelection(this.modelSelection, modelIndex, modelIndex);
      } else if (this.modelSelection == null) {
        this.cacheModelSelection(sortEvent);
      }
    } else if (change.allRowsChanged_) {
      this.modelSelection = null;
    } else if (this.modelSelection != null) {
      switch (change.type) {
        case TableModelEvent.DELETE:
          this.modelSelection.removeIndexInterval(change.startModelIndex, change.endModelIndex);
          break;
        case TableModelEvent.INSERT:
          this.modelSelection.insertIndexInterval(change.startModelIndex, change.length_, true);
          break;
        default:
          break;
      }
    } else {
      this.cacheModelSelection(null);
    }
  }
  cacheModelSelection(sortEvent: RowSorterEvent): void {
    this.lastModelSelection = this.$outer.convertSelectionToModel(sortEvent);
    this.modelLeadIndex = this.$outer.convertRowIndexToModel$RowSorterEvent$int$JTable(sortEvent, this.$outer.selectionModel.getLeadSelectionIndex());
  }
  /**
   * Inovked when either the table has changed or the sorter has changed
   * and after the sorter has been notified. If necessary this will
   * reapply the selection and variable row heights.
   */
  processChange(sortEvent: RowSorterEvent, change: JTable$ModelChange, sorterChanged: boolean): void {
    if (change != null) {
      if (change.allRowsChanged_) {
        this.modelRowSizes = null;
        this.$outer.rowModel = null;
      } else if (this.modelRowSizes != null) {
        if (change.type === TableModelEvent.INSERT) {
          this.modelRowSizes.insertEntries(change.startModelIndex, (change.endModelIndex - change.startModelIndex + 1) | 0, this.$outer.getRowHeight$());
        } else if (change.type === TableModelEvent.DELETE) {
          this.modelRowSizes.removeEntries(change.startModelIndex, (change.endModelIndex - change.startModelIndex + 1) | 0);
        }
      }
    }
    if (sorterChanged) {
      this.setViewRowHeightsFromModel();
      this.restoreSelection(change);
    }
  }
  /**
   * Resets the variable row heights in terms of the view from
   * that of the variable row heights in terms of the model.
   */
  setViewRowHeightsFromModel(): void {
    if (this.modelRowSizes != null) {
      this.$outer.rowModel.setSizes$int$int(this.$outer.getRowCount(), this.$outer.getRowHeight$());
      for (let viewIndex = (this.$outer.getRowCount() - 1) | 0; viewIndex >= 0; viewIndex--) {
        let modelIndex = this.$outer.convertRowIndexToModel$int(viewIndex);
        this.$outer.rowModel.setSize(viewIndex, this.modelRowSizes.getSize(modelIndex));
      }
    }
  }
  /**
   * Restores the selection from that in terms of the model.
   */
  restoreSelection(change: JTable$ModelChange): void {
    this.syncingSelection = true;
    if (this.lastModelSelection != null) {
      this.$outer.restoreSortingSelection(this.lastModelSelection, this.modelLeadIndex, change);
      this.lastModelSelection = null;
    } else if (this.modelSelection != null) {
      let viewSelection = this.$outer.getSelectionModel();
      viewSelection.setValueIsAdjusting(true);
      viewSelection.clearSelection();
      let min = this.modelSelection.getMinSelectionIndex();
      let max = this.modelSelection.getMaxSelectionIndex();
      let viewIndex: number;
      for (let modelIndex = min; modelIndex <= max; modelIndex++) {
        if (this.modelSelection.isSelectedIndex(modelIndex)) {
          viewIndex = this.$outer.convertRowIndexToView$int(modelIndex);
          if (viewIndex !== -1) {
            viewSelection.addSelectionInterval(viewIndex, viewIndex);
          }
        }
      }
      let viewLeadIndex = this.modelSelection.getLeadSelectionIndex();
      if (viewLeadIndex !== -1 && !this.modelSelection.isSelectionEmpty()) {
        viewLeadIndex = this.$outer.convertRowIndexToView$int(viewLeadIndex);
      }
      SwingUtilities2.setLeadAnchorWithoutSelection(viewSelection, viewLeadIndex, viewLeadIndex);
      viewSelection.setValueIsAdjusting(false);
    }
    this.syncingSelection = false;
  }
}

/**
 * ModelChange is used when sorting to restore state, it corresponds
 * to data from a TableModelEvent.  The values are precalculated as
 * they are used extensively.
 */
export class JTable$ModelChange extends JObject {
  startModelIndex: number = 0;
  endModelIndex: number = 0;
  type: number = 0;
  modelRowCount: number = 0;
  event: TableModelEvent = null;
  length_: number = 0;
  allRowsChanged_: boolean = false;
  _JTable$ModelChange(e: TableModelEvent): this {
    this.startModelIndex = Math.max(0, e.getFirstRow());
    this.endModelIndex = e.getLastRow();
    this.modelRowCount = this.$outer.getModel().getRowCount();
    if (this.endModelIndex < 0) {
      this.endModelIndex = Math.max(0, (this.modelRowCount - 1) | 0);
    }
    this.length_ = (this.endModelIndex - this.startModelIndex + 1) | 0;
    this.type = e.getType();
    this.event = e;
    this.allRowsChanged_ = (e.getLastRow() === 2147483647);
    return this;
  }
}

/**
 * Default Renderers
 */
export class JTable$NumberRenderer extends DefaultTableCellRenderer$UIResource {
  _JTable$NumberRenderer(): this {
    this._DefaultTableCellRenderer$UIResource();
    this.setHorizontalAlignment(SwingConstants.RIGHT);
    return this;
  }
}

export class JTable$DoubleRenderer extends JTable$NumberRenderer {
  formatter: NumberFormat = null;
  _JTable$DoubleRenderer(): this {
    this._JTable$NumberRenderer();
    return this;
  }
  setValue(value: any): void {
    if (this.formatter == null) {
      this.formatter = NumberFormat.getInstance();
    }
    this.setText((value == null) ? '' : this.formatter.format(value));
  }
}

export class JTable$DateRenderer extends DefaultTableCellRenderer$UIResource {
  formatter: DateFormat = null;
  _JTable$DateRenderer(): this {
    this._DefaultTableCellRenderer$UIResource();
    return this;
  }
  setValue(value: any): void {
    if (this.formatter == null) {
      this.formatter = DateFormat.getDateInstance();
    }
    this.setText((value == null) ? '' : this.formatter.format(value));
  }
}

export class JTable$IconRenderer extends DefaultTableCellRenderer$UIResource {
  _JTable$IconRenderer(): this {
    this._DefaultTableCellRenderer$UIResource();
    this.setHorizontalAlignment(SwingConstants.CENTER);
    return this;
  }
  setValue(value: any): void {
    this.setIcon(($J.isa(value, Icon)) ? value : null);
  }
}

export class JTable$BooleanRenderer extends JCheckBox {
  static noFocusBorder: Border = null;
  _JTable$BooleanRenderer(): this {
    this._JCheckBox$();
    this.setHorizontalAlignment(SwingConstants.CENTER);
    this.setBorderPainted(true);
    return this;
  }
  getTableCellRendererComponent(table: JTable, value: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    if (isSelected) {
      this.setForeground(table.getSelectionForeground());
      super.setBackground(table.getSelectionBackground());
    } else {
      this.setForeground(table.getForeground());
      this.setBackground(table.getBackground());
    }
    this.setSelected((value != null && (value)));
    if (hasFocus) {
      this.setBorder(UIManager.getBorder$Object('Table.focusCellHighlightBorder'));
    } else {
      this.setBorder(JTable$BooleanRenderer.noFocusBorder);
    }
    return this;
  }
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTable$BooleanRenderer$AccessibleBooleanRenderer().$o(this)._JTable$BooleanRenderer$AccessibleBooleanRenderer();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JTable$BooleanRenderer.noFocusBorder = new EmptyBorder()._EmptyBorder$int$int$int$int(1, 1, 1, 1);
  }
}

export class JTable$BooleanRenderer$AccessibleBooleanRenderer extends JCheckBox$AccessibleJCheckBox {
  _JTable$BooleanRenderer$AccessibleBooleanRenderer(): this {
    this._JCheckBox$AccessibleJCheckBox();
    return this;
  }
}

/**
 * Default Editors
 */
export class JTable$GenericEditor extends DefaultCellEditor {
  argTypes: JClass<any>[] = null;
  constructor_: Constructor<any> = null;
  value_: any = null;
  _JTable$GenericEditor(): this {
    this._DefaultCellEditor$JTextField(new JTextField()._JTextField$());
    this.argTypes = [$J.cls(JString)];
    this.getComponent().setName('Table.editor');
    return this;
  }
  stopCellEditing(): boolean {
    let s = super.getCellEditorValue();
    try {
      if ($J.equals('', s)) {
        if (this.constructor_.getDeclaringClass() === $J.cls(JString)) {
          this.value_ = s;
        }
        return super.stopCellEditing();
      }
      SwingUtilities2.checkAccess(this.constructor_.getModifiers());
      this.value_ = this.constructor_.newInstance(...[s]);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        (this.getComponent()).setBorder(new LineBorder()._LineBorder$Color(Color.red));
        return false;
      } else {
        throw $e1;
      }
    }
    return super.stopCellEditing();
  }
  getTableCellEditorComponent(table: JTable, value: any, isSelected: boolean, row: number, column: number): Component {
    this.value_ = null;
    (this.getComponent()).setBorder(new LineBorder()._LineBorder$Color(Color.black));
    try {
      let type$ = table.getColumnClass(column);
      if (type$ === $J.cls(JObject)) {
        type$ = $J.cls(JString);
      }
      ReflectUtil.checkPackageAccess(type$);
      SwingUtilities2.checkAccess(type$.getModifiers());
      this.constructor_ = type$.getConstructor(...this.argTypes);
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        return null;
      } else {
        throw $e2;
      }
    }
    return super.getTableCellEditorComponent(table, value, isSelected, row, column);
  }
  getCellEditorValue(): any {
    return this.value_;
  }
}

export class JTable$NumberEditor extends JTable$GenericEditor {
  _JTable$NumberEditor(): this {
    this._JTable$GenericEditor();
    (this.getComponent()).setHorizontalAlignment(SwingConstants.RIGHT);
    return this;
  }
}

export class JTable$BooleanEditor extends DefaultCellEditor {
  _JTable$BooleanEditor(): this {
    this._DefaultCellEditor$JCheckBox(new JCheckBox()._JCheckBox$());
    let checkBox = this.getComponent();
    checkBox.setHorizontalAlignment(SwingConstants.CENTER);
    return this;
  }
}

export class JTable$CellEditorRemover extends JObject {
  focusManager: KeyboardFocusManager = null;
  _JTable$CellEditorRemover(fm: KeyboardFocusManager): this {
    this.focusManager = fm;
    return this;
  }
  propertyChange(ev: PropertyChangeEvent): void {
    if (!this.$outer.isEditing() || this.$outer.getClientProperty('terminateEditOnFocusLost') !== true) {
      return;
    }
    let c = this.focusManager.getPermanentFocusOwner();
    while (c != null) {
      if (c === this.$outer) {
        return;
      } else if ((c instanceof Window) || ($J.isa(c, Applet) && c.getParent() == null)) {
        if (c === SwingUtilities.getRoot(this.$outer)) {
          if (!this.$outer.getCellEditor$().stopCellEditing()) {
            this.$outer.getCellEditor$().cancelCellEditing();
          }
        }
        break;
      }
      c = c.getParent();
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTable</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to table user-interface elements.
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
export class JTable$AccessibleJTable extends JComponent$AccessibleJComponent {
  previousFocusedRow: number = 0;
  previousFocusedCol: number = 0;
  caption: Accessible = null;
  summary: Accessible = null;
  rowDescription: Accessible[] = null;
  columnDescription: Accessible[] = null;
  /**
   * AccessibleJTable constructor
   *
   * @since 1.5
   */
  _JTable$AccessibleJTable(): this {
    this._JComponent$AccessibleJComponent();
    this.$outer.putClientProperty('JTable.forceAutoStartsEdit', true);
    this.$outer.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    this.$outer.getSelectionModel().addListSelectionListener($J.fn(this, 'valueChanged'));
    let tcm = this.$outer.getColumnModel();
    tcm.addColumnModelListener(this);
    tcm.getSelectionModel().addListSelectionListener($J.fn(this, 'valueChanged'));
    this.$outer.getModel().addTableModelListener(this);
    this.previousFocusedRow = this.$outer.getSelectionModel().getLeadSelectionIndex();
    this.previousFocusedCol = this.$outer.getColumnModel().getSelectionModel().getLeadSelectionIndex();
    return this;
  }
  /**
   * Track changes to selection model, column model, etc. so as to
   * be able to re-place listeners on those in order to pass on
   * information to the Accessibility PropertyChange mechanism
   */
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    let oldValue = e.getOldValue();
    let newValue = e.getNewValue();
    var oldModel, newModel, tcm, oldEditor, newEditor;
    if ($J.equals(name, 'model')) {
      var oldModel;
      if ($J.isa((oldModel = oldValue), TableModel)) {
        oldModel.removeTableModelListener(this);
      }
      var newModel;
      if ($J.isa((newModel = newValue), TableModel)) {
        newModel.addTableModelListener(this);
      }
    } else if ($J.equals(name, 'selectionModel')) {
      let source = e.getSource();
      var oldModel, newModel;
      if (source === this.$outer) {
        var oldModel;
        if ($J.isa((oldModel = oldValue), ListSelectionModel)) {
          oldModel.removeListSelectionListener($J.fn(this, 'valueChanged'));
        }
        var newModel;
        if ($J.isa((newModel = newValue), ListSelectionModel)) {
          newModel.addListSelectionListener($J.fn(this, 'valueChanged'));
        }
      } else if (source === this.$outer.getColumnModel()) {
        var oldModel;
        if ($J.isa((oldModel = oldValue), ListSelectionModel)) {
          oldModel.removeListSelectionListener($J.fn(this, 'valueChanged'));
        }
        var newModel;
        if ($J.isa((newModel = newValue), ListSelectionModel)) {
          newModel.addListSelectionListener($J.fn(this, 'valueChanged'));
        }
      } else {
      }
    } else if ($J.equals(name, 'columnModel')) {
      var tcm;
      if ($J.isa((tcm = oldValue), TableColumnModel)) {
        tcm.removeColumnModelListener(this);
        tcm.getSelectionModel().removeListSelectionListener($J.fn(this, 'valueChanged'));
      }
      var tcm;
      if ($J.isa((tcm = newValue), TableColumnModel)) {
        tcm.addColumnModelListener(this);
        tcm.getSelectionModel().addListSelectionListener($J.fn(this, 'valueChanged'));
      }
    } else if ($J.equals(name, 'tableCellEditor')) {
      var oldEditor;
      if ($J.isa((oldEditor = oldValue), TableCellEditor)) {
        oldEditor.removeCellEditorListener(this);
      }
      var newEditor;
      if ($J.isa((newEditor = newValue), TableCellEditor)) {
        newEditor.addCellEditorListener(this);
      }
    }
  }
  /**
   * Track changes to the table contents
   *
   * @param e a {@code TableModelEvent} describing the event
   */
  tableChanged(e: TableModelEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, null);
    if (e != null) {
      let firstColumn = e.getColumn();
      let lastColumn = e.getColumn();
      if (firstColumn === TableModelEvent.ALL_COLUMNS) {
        firstColumn = 0;
        lastColumn = (this.$outer.getColumnCount() - 1) | 0;
      }
      let change = new JTable$AccessibleJTable$AccessibleJTableModelChange().$o(this)._JTable$AccessibleJTable$AccessibleJTableModelChange(e.getType(), e.getFirstRow(), e.getLastRow(), firstColumn, lastColumn);
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_TABLE_MODEL_CHANGED, null, change);
    }
  }
  /**
   * Track changes to the table contents (column insertions)
   */
  columnAdded(e: TableColumnModelEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, null);
    let type$ = AccessibleTableModelChange.INSERT;
    let change = new JTable$AccessibleJTable$AccessibleJTableModelChange().$o(this)._JTable$AccessibleJTable$AccessibleJTableModelChange(type$, 0, 0, e.getFromIndex(), e.getToIndex());
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_TABLE_MODEL_CHANGED, null, change);
  }
  /**
   * Track changes to the table contents (column deletions)
   */
  columnRemoved(e: TableColumnModelEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, null);
    let type$ = AccessibleTableModelChange.DELETE;
    let change = new JTable$AccessibleJTable$AccessibleJTableModelChange().$o(this)._JTable$AccessibleJTable$AccessibleJTableModelChange(type$, 0, 0, e.getFromIndex(), e.getToIndex());
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_TABLE_MODEL_CHANGED, null, change);
  }
  /**
   * Track changes of a column repositioning.
   *
   * @see TableColumnModelListener
   */
  columnMoved(e: TableColumnModelEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, null);
    let type$ = AccessibleTableModelChange.DELETE;
    let change = new JTable$AccessibleJTable$AccessibleJTableModelChange().$o(this)._JTable$AccessibleJTable$AccessibleJTableModelChange(type$, 0, 0, e.getFromIndex(), e.getFromIndex());
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_TABLE_MODEL_CHANGED, null, change);
    let type2 = AccessibleTableModelChange.INSERT;
    let change2 = new JTable$AccessibleJTable$AccessibleJTableModelChange().$o(this)._JTable$AccessibleJTable$AccessibleJTableModelChange(type2, 0, 0, e.getToIndex(), e.getToIndex());
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_TABLE_MODEL_CHANGED, null, change2);
  }
  /**
   * Track changes of a column moving due to margin changes.
   *
   * @see TableColumnModelListener
   */
  columnMarginChanged(e: ChangeEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, null);
  }
  /**
   * Track that the selection model of the TableColumnModel changed.
   *
   * @see TableColumnModelListener
   */
  columnSelectionChanged(e: ListSelectionEvent): void {
  }
  /**
   * Track changes to a cell's contents.
   *
   * Invoked when editing is finished. The changes are saved, the
   * editor object is discarded, and the cell is rendered once again.
   *
   * @see CellEditorListener
   */
  editingStopped(e: ChangeEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, null);
  }
  /**
   * Invoked when editing is canceled. The editor object is discarded
   * and the cell is rendered once again.
   *
   * @see CellEditorListener
   */
  editingCanceled(e: ChangeEvent): void {
  }
  /**
   * Track changes to table cell selections
   */
  valueChanged(e: ListSelectionEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY, false, true);
    let focusedRow = this.$outer.getSelectionModel().getLeadSelectionIndex();
    let focusedCol = this.$outer.getColumnModel().getSelectionModel().getLeadSelectionIndex();
    if (focusedRow !== this.previousFocusedRow || focusedCol !== this.previousFocusedCol) {
      let oldA = this.getAccessibleAt$int$int(this.previousFocusedRow, this.previousFocusedCol);
      let newA = this.getAccessibleAt$int$int(focusedRow, focusedCol);
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_ACTIVE_DESCENDANT_PROPERTY, oldA, newA);
      this.previousFocusedRow = focusedRow;
      this.previousFocusedCol = focusedCol;
    }
  }
  /**
   * Get the AccessibleSelection associated with this object.  In the
   * implementation of the Java Accessibility API for this class,
   * return this object, which is responsible for implementing the
   * AccessibleSelection interface on behalf of itself.
   *
   * @return this object
   */
  getAccessibleSelection$(): AccessibleSelection {
    return this;
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement <code>Accessible</code>,
   * then this method should return the number of children of this object.
   *
   * @return the number of accessible children in the object
   */
  getAccessibleChildrenCount(): number {
    return (Math.imul(this.$outer.getColumnCount(), this.$outer.getRowCount()));
  }
  /**
   * Returns the nth <code>Accessible</code> child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    if (i < 0 || i >= this.getAccessibleChildrenCount()) {
      return null;
    } else {
      let column = this.getAccessibleColumnAtIndex(i);
      let row = this.getAccessibleRowAtIndex(i);
      if (row === this.$outer.getEditingRow() && column === this.$outer.getEditingColumn()) {
        let editor = this.$outer.getEditorComponent();
        if ($J.isa(editor, Accessible)) {
          return editor;
        }
      }
      return new JTable$AccessibleJTable$AccessibleJTableCell().$o(this)._JTable$AccessibleJTable$AccessibleJTableCell(this.$outer, row, column, this.getAccessibleIndexAt(row, column));
    }
  }
  /**
   * Returns the number of <code>Accessible</code> children
   * currently selected.
   * If no children are selected, the return value will be 0.
   *
   * @return the number of items currently selected
   */
  getAccessibleSelectionCount(): number {
    let rowsSel = this.$outer.getSelectedRowCount();
    let colsSel = this.$outer.getSelectedColumnCount();
    if (this.$outer.cellSelectionEnabled) {
      return Math.imul(rowsSel, colsSel);
    } else {
      if (this.$outer.getRowSelectionAllowed() && this.$outer.getColumnSelectionAllowed()) {
        return (Math.imul(rowsSel, this.$outer.getColumnCount()) + Math.imul(colsSel, this.$outer.getRowCount()) - Math.imul(rowsSel, colsSel)) | 0;
      } else if (this.$outer.getRowSelectionAllowed()) {
        return Math.imul(rowsSel, this.$outer.getColumnCount());
      } else if (this.$outer.getColumnSelectionAllowed()) {
        return Math.imul(colsSel, this.$outer.getRowCount());
      } else {
        return 0;
      }
    }
  }
  /**
   * Returns an <code>Accessible</code> representing the
   * specified selected child in the object.  If there
   * isn't a selection, or there are fewer children selected
   * than the integer passed in, the return
   * value will be <code>null</code>.
   * <p>Note that the index represents the i-th selected child, which
   * is different from the i-th child.
   *
   * @param i the zero-based index of selected children
   * @return the i-th selected child
   * @see #getAccessibleSelectionCount
   */
  getAccessibleSelection$int(i: number): Accessible {
    if (i < 0 || i > this.getAccessibleSelectionCount()) {
      return null;
    }
    let rowsSel = this.$outer.getSelectedRowCount();
    let colsSel = this.$outer.getSelectedColumnCount();
    let rowIndicies = this.$outer.getSelectedRows();
    let colIndicies = this.$outer.getSelectedColumns();
    let ttlCols = this.$outer.getColumnCount();
    let ttlRows = this.$outer.getRowCount();
    let r: number;
    let c: number;
    if (this.$outer.cellSelectionEnabled) {
      r = rowIndicies[$J.idiv(i, colsSel)];
      c = colIndicies[i % colsSel];
      return this.getAccessibleChild(((Math.imul(r, ttlCols)) + c) | 0);
    } else {
      if (this.$outer.getRowSelectionAllowed() && this.$outer.getColumnSelectionAllowed()) {
        let curIndex = i;
        let IN_ROW = 0;
        let NOT_IN_ROW = 1;
        let state = (rowIndicies[0] === 0 ? IN_ROW : NOT_IN_ROW);
        let j = 0;
        let prevRow = -1;
        while (j < rowIndicies.length) {
          switch (state) {
            case IN_ROW:
              if (curIndex < ttlCols) {
                c = curIndex % ttlCols;
                r = rowIndicies[j];
                return this.getAccessibleChild(((Math.imul(r, ttlCols)) + c) | 0);
              } else {
                curIndex = (curIndex - ttlCols) | 0;
              }
              if (((j + 1) | 0) === rowIndicies.length || rowIndicies[j] !== (((rowIndicies[(j + 1) | 0]) - 1) | 0)) {
                state = NOT_IN_ROW;
                prevRow = rowIndicies[j];
              }
              j++;
              break;
            case NOT_IN_ROW:
              if (curIndex < (Math.imul(colsSel, ((rowIndicies[j] - (prevRow === -1 ? 0 : ((prevRow + 1) | 0))) | 0)))) {
                c = colIndicies[curIndex % colsSel];
                r = ((j > 0 ? ((rowIndicies[(j - 1) | 0]) + 1) | 0 : 0) + $J.idiv(curIndex, colsSel)) | 0;
                return this.getAccessibleChild(((Math.imul(r, ttlCols)) + c) | 0);
              } else {
                curIndex = (curIndex - Math.imul(colsSel, ((rowIndicies[j] - (prevRow === -1 ? 0 : ((prevRow + 1) | 0))) | 0))) | 0;
              }
              state = IN_ROW;
              break;
          }
        }
        if (curIndex < (Math.imul(colsSel, ((ttlRows - (prevRow === -1 ? 0 : ((prevRow + 1) | 0))) | 0)))) {
          c = colIndicies[curIndex % colsSel];
          r = ((rowIndicies[(j - 1) | 0]) + $J.idiv(curIndex, colsSel) + 1) | 0;
          return this.getAccessibleChild(((Math.imul(r, ttlCols)) + c) | 0);
        } else {
        }
      } else if (this.$outer.getRowSelectionAllowed()) {
        c = i % ttlCols;
        r = rowIndicies[$J.idiv(i, ttlCols)];
        return this.getAccessibleChild(((Math.imul(r, ttlCols)) + c) | 0);
      } else if (this.$outer.getColumnSelectionAllowed()) {
        c = colIndicies[i % colsSel];
        r = $J.idiv(i, colsSel);
        return this.getAccessibleChild(((Math.imul(r, ttlCols)) + c) | 0);
      }
    }
    return null;
  }
  /**
   * Determines if the current child of this object is selected.
   *
   * @param i the zero-based index of the child in this
   *    <code>Accessible</code> object
   * @return true if the current child of this object is selected
   * @see AccessibleContext#getAccessibleChild
   */
  isAccessibleChildSelected(i: number): boolean {
    let column = this.getAccessibleColumnAtIndex(i);
    let row = this.getAccessibleRowAtIndex(i);
    return this.$outer.isCellSelected(row, column);
  }
  getAccessibleColumnCount(): number {
    return this.$outer.getColumnCount();
  }
  getAccessibleAt$int$int(r: number, c: number): Accessible {
    return this.getAccessibleChild(((Math.imul(r, this.getAccessibleColumnCount())) + c) | 0);
  }
  /**
   * Returns the row at a given index into the table.
   *
   * @param i zero-based index into the table
   * @return the row at a given index
   * @since 1.3
   */
  getAccessibleRowAtIndex(i: number): number {
    let columnCount = this.getAccessibleColumnCount();
    if (columnCount === 0) {
      return -1;
    } else {
      return ($J.idiv(i, columnCount));
    }
  }
  /**
   * Returns the column at a given index into the table.
   *
   * @param i zero-based index into the table
   * @return the column at a given index
   * @since 1.3
   */
  getAccessibleColumnAtIndex(i: number): number {
    let columnCount = this.getAccessibleColumnCount();
    if (columnCount === 0) {
      return -1;
    } else {
      return (i % columnCount);
    }
  }
  /**
   * Returns the index at a given (row, column) in the table.
   *
   * @param r zero-based row of the table
   * @param c zero-based column of the table
   * @return the index into the table
   * @since 1.3
   */
  getAccessibleIndexAt(r: number, c: number): number {
    return (((Math.imul(r, this.getAccessibleColumnCount())) + c) | 0);
  }
}

/**
 * Describes a change in the accessible table model.
 */
export class JTable$AccessibleJTable$AccessibleJTableModelChange extends JObject {
  /**
   * The type
   */
  type: number = 0;
  /**
   * The first row
   */
  firstRow: number = 0;
  /**
   * The last row
   */
  lastRow: number = 0;
  /**
   * The first column
   */
  firstColumn: number = 0;
  /**
   * The last column
   */
  lastColumn: number = 0;
  /**
   * Constructs an {@code AccessibleJTableModelChange}.
   * @param type the type
   * @param firstRow the first row
   * @param lastRow the last row
   * @param firstColumn the first column
   * @param lastColumn the last column
   */
  _JTable$AccessibleJTable$AccessibleJTableModelChange(type$: number, firstRow: number, lastRow: number, firstColumn: number, lastColumn: number): this {
    this.type = type$;
    this.firstRow = firstRow;
    this.lastRow = lastRow;
    this.firstColumn = firstColumn;
    this.lastColumn = lastColumn;
    return this;
  }
}

/**
 * The class provides an implementation of the Java Accessibility
 * API appropriate to table cells.
 */
export class JTable$AccessibleJTable$AccessibleJTableCell extends AccessibleContext {
  parent: JTable = null;
  row: number = 0;
  column: number = 0;
  index_: number = 0;
  /**
   * Constructs an <code>AccessibleJTableHeaderEntry</code>.
   *
   * @param t a {@code JTable}
   * @param r an {@code int} specifying a row
   * @param c an {@code int} specifying a column
   * @param i an {@code int} specifying the index to this cell
   * @since 1.4
   */
  _JTable$AccessibleJTable$AccessibleJTableCell(t: JTable, r: number, c: number, i: number): this {
    this._AccessibleContext();
    this.parent = t;
    this.row = r;
    this.column = c;
    this.index_ = i;
    this.setAccessibleParent(this.parent);
    return this;
  }
  /**
   * Gets the <code>AccessibleContext</code> associated with this
   * component. In the implementation of the Java Accessibility
   * API for this class, return this object, which is its own
   * <code>AccessibleContext</code>.
   *
   * @return this object
   */
  getAccessibleContext(): AccessibleContext {
    return this;
  }
  /**
   * Gets the AccessibleContext for the table cell renderer.
   *
   * @return the <code>AccessibleContext</code> for the table
   * cell renderer if one exists;
   * otherwise, returns <code>null</code>.
   * @since 1.6
   */
  getCurrentAccessibleContext(): AccessibleContext {
    let aColumn = this.$outer.$outer.getColumnModel().getColumn(this.column);
    let renderer = aColumn.getCellRenderer();
    if (renderer == null) {
      let columnClass = this.$outer.$outer.getColumnClass(this.column);
      renderer = this.$outer.$outer.getDefaultRenderer(columnClass);
    }
    let component = renderer.getTableCellRendererComponent(this.$outer.$outer, this.$outer.$outer.getValueAt(this.row, this.column), false, false, this.row, this.column);
    if ($J.isa(component, Accessible)) {
      return component.getAccessibleContext();
    } else {
      return null;
    }
  }
  /**
   * Gets the accessible name of this object.
   *
   * @return the localized name of the object; <code>null</code>
   *     if this object does not have a name
   */
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
      return this.$outer.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    }
  }
  /**
   * Sets the localized accessible name of this object.
   *
   * @param s the new localized name of the object
   */
  setAccessibleName(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleName(s);
    } else {
      super.setAccessibleName(s);
    }
  }
  /**
   * Gets the accessible description of this object.
   *
   * @return the localized description of the object;
   *     <code>null</code> if this object does not have
   *     a description
   */
  getAccessibleDescription(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleDescription();
    } else {
      return super.getAccessibleDescription();
    }
  }
  /**
   * Sets the accessible description of this object.
   *
   * @param s the new localized description of the object
   */
  setAccessibleDescription(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleDescription(s);
    } else {
      super.setAccessibleDescription(s);
    }
  }
  /**
   * Gets the <code>Accessible</code> parent of this object.
   *
   * @return the Accessible parent of this object;
   *     <code>null</code> if this object does not
   *     have an <code>Accessible</code> parent
   */
  getAccessibleParent(): Accessible {
    return this.parent;
  }
  /**
   * Gets the index of this object in its accessible parent.
   *
   * @return the index of this object in its parent; -1 if this
   *     object does not have an accessible parent
   * @see #getAccessibleParent
   */
  getAccessibleIndexInParent(): number {
    return this.index_;
  }
  /**
   * Returns the number of accessible children in the object.
   *
   * @return the number of accessible children in the object
   */
  getAccessibleChildrenCount(): number {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleChildrenCount();
    } else {
      return 0;
    }
  }
  /**
   * Returns the specified <code>Accessible</code> child of the
   * object.
   *
   * @param i zero-based index of child
   * @return the <code>Accessible</code> child of the object
   */
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
  /**
   * Gets the <code>AccessibleSelection</code> associated with
   * this object if one exists.  Otherwise returns <code>null</code>.
   *
   * @return the <code>AccessibleSelection</code>, or
   *    <code>null</code>
   */
  getAccessibleSelection$(): AccessibleSelection {
    return this.getCurrentAccessibleContext().getAccessibleSelection$();
  }
}

let $JTable$1: any = null;
/** An anonymous class (JTable.java:757). */
function JTable$1(): any {
  return $JTable$1 ??= $J.local(class extends AbstractTableModel {
    getColumnName(column: number): string {
      return $J.str(this.$cv_columnNames[column]);
    }
    getRowCount(): number {
      return this.$cv_rowData.length;
    }
    getColumnCount(): number {
      return this.$cv_columnNames.length;
    }
    getValueAt(row: number, col: number): any {
      return this.$cv_rowData[row][col];
    }
    isCellEditable(row: number, column: number): boolean {
      return true;
    }
    setValueAt(value: any, row: number, col: number): void {
      this.$cv_rowData[row][col] = value;
      this.fireTableCellUpdated(row, col);
    }
    $c($columnNames, $rowData): this {
      this.$cv_columnNames = $columnNames; this.$cv_rowData = $rowData;
      return this;
    }
  }, 'javax.swing.JTable$1', []);
}

let $JTable$2: any = null;
/** An anonymous class (JTable.java:3272). */
function JTable$2(): any {
  return $JTable$2 ??= $J.local(class extends JObject {
    getElementCount(): number {
      return this.$cv_cm.getColumnCount();
    }
    getLowerBoundAt(i: number): number {
      return this.$cv_cm.getColumn(i).getMinWidth();
    }
    getUpperBoundAt(i: number): number {
      return this.$cv_cm.getColumn(i).getMaxWidth();
    }
    getMidPointAt(i: number): number {
      if (!this.$cv_inverse) {
        return this.$cv_cm.getColumn(i).getPreferredWidth();
      } else {
        return this.$cv_cm.getColumn(i).getWidth();
      }
    }
    setSizeAt(s: number, i: number): void {
      if (!this.$cv_inverse) {
        this.$cv_cm.getColumn(i).setWidth(s);
      } else {
        this.$cv_cm.getColumn(i).setPreferredWidth(s);
      }
    }
    $c($cm, $inverse): this {
      this.$cv_cm = $cm; this.$cv_inverse = $inverse;
      return this;
    }
  }, 'javax.swing.JTable$2', ['javax.swing.JTable$Resizable3']);
}

let $JTable$3: any = null;
/** An anonymous class (JTable.java:3325). */
function JTable$3(): any {
  return $JTable$3 ??= $J.local(class extends JObject {
    getElementCount(): number {
      return (this.$cv_end - this.$cv_start) | 0;
    }
    getLowerBoundAt(i: number): number {
      return this.$cv_cm.getColumn((i + this.$cv_start) | 0).getMinWidth();
    }
    getUpperBoundAt(i: number): number {
      return this.$cv_cm.getColumn((i + this.$cv_start) | 0).getMaxWidth();
    }
    getMidPointAt(i: number): number {
      return this.$cv_cm.getColumn((i + this.$cv_start) | 0).getWidth();
    }
    setSizeAt(s: number, i: number): void {
      this.$cv_cm.getColumn((i + this.$cv_start) | 0).setWidth(s);
    }
    $c($end, $start, $cm): this {
      this.$cv_end = $end; this.$cv_start = $start; this.$cv_cm = $cm;
      return this;
    }
  }, 'javax.swing.JTable$3', ['javax.swing.JTable$Resizable3']);
}

let $JTable$4: any = null;
/** An anonymous class (JTable.java:3363). */
function JTable$4(): any {
  return $JTable$4 ??= $J.local(class extends JObject {
    getElementCount(): number {
      return this.$cv_r.getElementCount();
    }
    getLowerBoundAt(i: number): number {
      return this.$cv_r.getLowerBoundAt(i);
    }
    getUpperBoundAt(i: number): number {
      return this.$cv_r.getMidPointAt(i);
    }
    setSizeAt(newSize: number, i: number): void {
      this.$cv_r.setSizeAt(newSize, i);
    }
    $c($r): this {
      this.$cv_r = $r;
      return this;
    }
  }, 'javax.swing.JTable$4', ['javax.swing.JTable$Resizable2']);
}

let $JTable$5: any = null;
/** An anonymous class (JTable.java:3372). */
function JTable$5(): any {
  return $JTable$5 ??= $J.local(class extends JObject {
    getElementCount(): number {
      return this.$cv_r.getElementCount();
    }
    getLowerBoundAt(i: number): number {
      return this.$cv_r.getMidPointAt(i);
    }
    getUpperBoundAt(i: number): number {
      return this.$cv_r.getUpperBoundAt(i);
    }
    setSizeAt(newSize: number, i: number): void {
      this.$cv_r.setSizeAt(newSize, i);
    }
    $c($r): this {
      this.$cv_r = $r;
      return this;
    }
  }, 'javax.swing.JTable$5', ['javax.swing.JTable$Resizable2']);
}

$J.define(JTable, 'javax.swing.JTable', { kind: 'class', ifaces: ['javax.swing.event.TableModelListener', 'javax.swing.Scrollable', 'javax.swing.event.TableColumnModelListener', 'javax.swing.event.ListSelectionListener', 'javax.swing.event.CellEditorListener', 'javax.accessibility.Accessible', 'javax.swing.event.RowSorterListener'], sup: 'javax.swing.JComponent', ctors: { 'java.lang.Object[][],java.lang.Object[]': '_JTable$ObjectArrArr$ObjectArr', 'java.util.Vector,java.util.Vector': '_JTable$Vector$Vector', 'int,int': '_JTable$int$int', 'javax.swing.table.TableModel,javax.swing.table.TableColumnModel,javax.swing.ListSelectionModel': '_JTable$TableModel$TableColumnModel$ListSelectionModel', 'javax.swing.table.TableModel,javax.swing.table.TableColumnModel': '_JTable$TableModel$TableColumnModel', 'javax.swing.table.TableModel': '_JTable$TableModel', '': '_JTable$' }, meths: { 'print(javax.swing.JTable$PrintMode,java.text.MessageFormat,java.text.MessageFormat,boolean,javax.print.attribute.PrintRequestAttributeSet,boolean,javax.print.PrintService)': 'print$PrintMode$MessageFormat$MessageFormat$boolean$PrintRequestAttributeSet$boolean$PrintService', 'print(javax.swing.JTable$PrintMode,java.text.MessageFormat,java.text.MessageFormat,boolean,javax.print.attribute.PrintRequestAttributeSet,boolean)': 'print$PrintMode$MessageFormat$MessageFormat$boolean$PrintRequestAttributeSet$boolean', 'print(javax.swing.JTable$PrintMode,java.text.MessageFormat,java.text.MessageFormat)': 'print$PrintMode$MessageFormat$MessageFormat', 'print(javax.swing.JTable$PrintMode)': 'print$PrintMode', 'print()': 'print$', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JTable', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTable', 'getCellEditor(int,int)': 'getCellEditor$int$int', 'getCellEditor()': 'getCellEditor$', 'convertRowIndexToModel(javax.swing.event.RowSorterEvent,int)': 'convertRowIndexToModel$RowSorterEvent$int$JTable', 'convertRowIndexToView(int,javax.swing.JTable$ModelChange)': 'convertRowIndexToView$int$ModelChange$JTable', 'setUI(javax.swing.plaf.TableUI)': 'setUI$TableUI', 'editCellAt(int,int,java.util.EventObject)': 'editCellAt$int$int$EventObject', 'editCellAt(int,int)': 'editCellAt$int$int', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'adjustSizes(long,javax.swing.JTable$Resizable2,boolean)': 'adjustSizes$long$Resizable2$boolean$JTable', 'adjustSizes(long,javax.swing.JTable$Resizable3,boolean)': 'adjustSizes$long$Resizable3$boolean$JTable', 'sizeColumnsToFit(int)': 'sizeColumnsToFit$int', 'sizeColumnsToFit(boolean)': 'sizeColumnsToFit$boolean', 'convertRowIndexToModel(int)': 'convertRowIndexToModel$int', 'convertRowIndexToView(int)': 'convertRowIndexToView$int', 'setDropLocation(javax.swing.TransferHandler$DropLocation,java.lang.Object,boolean)': 'setDropLocation$DropLocation$Object$boolean', 'dropLocationForPoint(java.awt.Point)': 'dropLocationForPoint$Point', 'getRowHeight(int)': 'getRowHeight$int', 'setRowHeight(int,int)': 'setRowHeight$int$int', 'getRowHeight()': 'getRowHeight$', 'setRowHeight(int)': 'setRowHeight$int' } });
$J.define(JTable$PrintMode, 'javax.swing.JTable$PrintMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_JTable$PrintMode' }, clinit: true, lazy: ['$VALUES', 'NORMAL', 'FIT_WIDTH'] });
$J.define(JTable$DropLocation, 'javax.swing.JTable$DropLocation', { kind: 'class', sup: 'javax.swing.TransferHandler$DropLocation', ctors: { 'java.awt.Point,int,int,boolean,boolean': '_JTable$DropLocation' } });
$J.define(JTable$Resizable2, 'javax.swing.JTable$Resizable2', { kind: 'interface' });
$J.define(JTable$Resizable3, 'javax.swing.JTable$Resizable3', { kind: 'interface', ifaces: ['javax.swing.JTable$Resizable2'] });
$J.define(JTable$SortManager, 'javax.swing.JTable$SortManager', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.RowSorter': '_JTable$SortManager' }, inner: true });
$J.define(JTable$ModelChange, 'javax.swing.JTable$ModelChange', { kind: 'class', sup: 'java.lang.Object', ctors: { 'javax.swing.event.TableModelEvent': '_JTable$ModelChange' }, inner: true });
$J.define(JTable$NumberRenderer, 'javax.swing.JTable$NumberRenderer', { kind: 'class', sup: 'javax.swing.table.DefaultTableCellRenderer$UIResource', ctors: { '': '_JTable$NumberRenderer' } });
$J.define(JTable$DoubleRenderer, 'javax.swing.JTable$DoubleRenderer', { kind: 'class', sup: 'javax.swing.JTable$NumberRenderer', ctors: { '': '_JTable$DoubleRenderer' } });
$J.define(JTable$DateRenderer, 'javax.swing.JTable$DateRenderer', { kind: 'class', sup: 'javax.swing.table.DefaultTableCellRenderer$UIResource', ctors: { '': '_JTable$DateRenderer' } });
$J.define(JTable$IconRenderer, 'javax.swing.JTable$IconRenderer', { kind: 'class', sup: 'javax.swing.table.DefaultTableCellRenderer$UIResource', ctors: { '': '_JTable$IconRenderer' } });
$J.define(JTable$BooleanRenderer, 'javax.swing.JTable$BooleanRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer', 'javax.swing.plaf.UIResource'], sup: 'javax.swing.JCheckBox', ctors: { '': '_JTable$BooleanRenderer' }, clinit: true, lazy: ['noFocusBorder'] });
$J.define(JTable$BooleanRenderer$AccessibleBooleanRenderer, 'javax.swing.JTable$BooleanRenderer$AccessibleBooleanRenderer', { kind: 'class', sup: 'javax.swing.JCheckBox$AccessibleJCheckBox', ctors: { '': '_JTable$BooleanRenderer$AccessibleBooleanRenderer' }, inner: true });
$J.define(JTable$GenericEditor, 'javax.swing.JTable$GenericEditor', { kind: 'class', sup: 'javax.swing.DefaultCellEditor', ctors: { '': '_JTable$GenericEditor' } });
$J.define(JTable$NumberEditor, 'javax.swing.JTable$NumberEditor', { kind: 'class', sup: 'javax.swing.JTable$GenericEditor', ctors: { '': '_JTable$NumberEditor' } });
$J.define(JTable$BooleanEditor, 'javax.swing.JTable$BooleanEditor', { kind: 'class', sup: 'javax.swing.DefaultCellEditor', ctors: { '': '_JTable$BooleanEditor' } });
$J.define(JTable$CellEditorRemover, 'javax.swing.JTable$CellEditorRemover', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { 'java.awt.KeyboardFocusManager': '_JTable$CellEditorRemover' }, inner: true });
$J.define(JTable$AccessibleJTable, 'javax.swing.JTable$AccessibleJTable', { kind: 'class', ifaces: ['javax.accessibility.AccessibleSelection', 'javax.swing.event.ListSelectionListener', 'javax.swing.event.TableModelListener', 'javax.swing.event.TableColumnModelListener', 'javax.swing.event.CellEditorListener', 'java.beans.PropertyChangeListener', 'javax.accessibility.AccessibleExtendedTable'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JTable$AccessibleJTable' }, meths: { 'getAccessibleAt(int,int)': 'getAccessibleAt$int$int', 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleSelection()': 'getAccessibleSelection$' }, inner: true });
$J.define(JTable$AccessibleJTable$AccessibleJTableModelChange, 'javax.swing.JTable$AccessibleJTable$AccessibleJTableModelChange', { kind: 'class', ifaces: ['javax.accessibility.AccessibleTableModelChange'], sup: 'java.lang.Object', ctors: { 'int,int,int,int,int': '_JTable$AccessibleJTable$AccessibleJTableModelChange' }, inner: true });
$J.define(JTable$AccessibleJTable$AccessibleJTableCell, 'javax.swing.JTable$AccessibleJTable$AccessibleJTableCell', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.accessibility.AccessibleComponent'], sup: 'javax.accessibility.AccessibleContext', ctors: { 'javax.swing.JTable,int,int,int': '_JTable$AccessibleJTable$AccessibleJTableCell' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  Window = $J.load('java.awt.Window');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleTableModelChange = $J.load('javax.accessibility.AccessibleTableModelChange');
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  DropMode = $J.load('javax.swing.DropMode');
  Icon = $J.load('javax.swing.Icon');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTextField = $J.load('javax.swing.JTextField');
  JViewport = $J.load('javax.swing.JViewport');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ToolTipManager = $J.load('javax.swing.ToolTipManager');
  UIDefaults = $J.load('javax.swing.UIDefaults');
  UIManager = $J.load('javax.swing.UIManager');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  LineBorder = $J.load('javax.swing.border.LineBorder');
  RowSorterEvent$Type = $J.load('javax.swing.event.RowSorterEvent$Type');
  TableModelEvent = $J.load('javax.swing.event.TableModelEvent');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  AbstractTableModel = $J.load('javax.swing.table.AbstractTableModel');
  DefaultTableColumnModel = $J.load('javax.swing.table.DefaultTableColumnModel');
  DefaultTableModel = $J.load('javax.swing.table.DefaultTableModel');
  JTableHeader = $J.load('javax.swing.table.JTableHeader');
  TableCellEditor = $J.load('javax.swing.table.TableCellEditor');
  TableColumn = $J.load('javax.swing.table.TableColumn');
  TableColumnModel = $J.load('javax.swing.table.TableColumnModel');
  TableModel = $J.load('javax.swing.table.TableModel');
  TableRowSorter = $J.load('javax.swing.table.TableRowSorter');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
  SwingUtilities2$Section = $J.load('sun.swing.SwingUtilities2$Section');
});
