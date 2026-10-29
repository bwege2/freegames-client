// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JList.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, IllegalArgumentException, IndexOutOfBoundsException, JObject, JString } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { TransferHandler$DropLocation } from './TransferHandler.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';
import { AccessibleContext } from '../accessibility/AccessibleContext.ts';

let Component, Dimension, GraphicsEnvironment, HeadlessException, Point, MouseEvent, Accessible, AccessibleState, AbstractListModel, DefaultListSelectionModel, DropMode, JViewport, ListModel, ListSelectionModel, SwingConstants, SwingUtilities, ToolTipManager, UIManager, ListSelectionEvent, ListSelectionListener, Position$Bias, AWTAccessor, SwingUtilities2, SwingUtilities2$Section;

/**
 * A component that displays a list of objects and allows the user to select
 * one or more items. A separate model, {@code ListModel}, maintains the
 * contents of the list.
 * <p>
 * It's easy to display an array or Vector of objects, using the {@code JList}
 * constructor that automatically builds a read-only {@code ListModel} instance
 * for you:
 * <pre>
 * {@code
 * // Create a JList that displays strings from an array
 *
 * String[] data = {"one", "two", "three", "four"};
 * JList<String> myList = new JList<String>(data);
 *
 * // Create a JList that displays the superclasses of JList.class, by
 * // creating it with a Vector populated with this data
 *
 * Vector<Class<?>> superClasses = new Vector<Class<?>>();
 * Class<JList> rootClass = javax.swing.JList.class;
 * for(Class<?> cls = rootClass; cls != null; cls = cls.getSuperclass()) {
 *     superClasses.addElement(cls);
 * }
 * JList<Class<?>> myList = new JList<Class<?>>(superClasses);
 *
 * // The automatically created model is stored in JList's "model"
 * // property, which you can retrieve
 *
 * ListModel<Class<?>> model = myList.getModel();
 * for(int i = 0; i < model.getSize(); i++) {
 *     System.out.println(model.getElementAt(i));
 * }
 * }
 * </pre>
 * <p>
 * A {@code ListModel} can be supplied directly to a {@code JList} by way of a
 * constructor or the {@code setModel} method. The contents need not be static -
 * the number of items, and the values of items can change over time. A correct
 * {@code ListModel} implementation notifies the set of
 * {@code javax.swing.event.ListDataListener}s that have been added to it, each
 * time a change occurs. These changes are characterized by a
 * {@code javax.swing.event.ListDataEvent}, which identifies the range of list
 * indices that have been modified, added, or removed. {@code JList}'s
 * {@code ListUI} is responsible for keeping the visual representation up to
 * date with changes, by listening to the model.
 * <p>
 * Simple, dynamic-content, {@code JList} applications can use the
 * {@code DefaultListModel} class to maintain list elements. This class
 * implements the {@code ListModel} interface and also provides a
 * <code>java.util.Vector</code>-like API. Applications that need a more
 * custom <code>ListModel</code> implementation may instead wish to subclass
 * {@code AbstractListModel}, which provides basic support for managing and
 * notifying listeners. For example, a read-only implementation of
 * {@code AbstractListModel}:
 * <pre>
 * {@code
 * // This list model has about 2^16 elements.  Enjoy scrolling.
 *
 * ListModel<String> bigData = new AbstractListModel<String>() {
 *     public int getSize() { return Short.MAX_VALUE; }
 *     public String getElementAt(int index) { return "Index " + index; }
 * };
 * }
 * </pre>
 * <p>
 * The selection state of a {@code JList} is managed by another separate
 * model, an instance of {@code ListSelectionModel}. {@code JList} is
 * initialized with a selection model on construction, and also contains
 * methods to query or set this selection model. Additionally, {@code JList}
 * provides convenient methods for easily managing the selection. These methods,
 * such as {@code setSelectedIndex} and {@code getSelectedValue}, are cover
 * methods that take care of the details of interacting with the selection
 * model. By default, {@code JList}'s selection model is configured to allow any
 * combination of items to be selected at a time; selection mode
 * {@code MULTIPLE_INTERVAL_SELECTION}. The selection mode can be changed
 * on the selection model directly, or via {@code JList}'s cover method.
 * Responsibility for updating the selection model in response to user gestures
 * lies with the list's {@code ListUI}.
 * <p>
 * A correct {@code ListSelectionModel} implementation notifies the set of
 * {@code javax.swing.event.ListSelectionListener}s that have been added to it
 * each time a change to the selection occurs. These changes are characterized
 * by a {@code javax.swing.event.ListSelectionEvent}, which identifies the range
 * of the selection change.
 * <p>
 * The preferred way to listen for changes in list selection is to add
 * {@code ListSelectionListener}s directly to the {@code JList}. {@code JList}
 * then takes care of listening to the selection model and notifying your
 * listeners of change.
 * <p>
 * Responsibility for listening to selection changes in order to keep the list's
 * visual representation up to date lies with the list's {@code ListUI}.
 * <p>
 * <a id="renderer"></a>
 * Painting of cells in a {@code JList} is handled by a delegate called a
 * cell renderer, installed on the list as the {@code cellRenderer} property.
 * The renderer provides a {@code java.awt.Component} that is used
 * like a "rubber stamp" to paint the cells. Each time a cell needs to be
 * painted, the list's {@code ListUI} asks the cell renderer for the component,
 * moves it into place, and has it paint the contents of the cell by way of its
 * {@code paint} method. A default cell renderer, which uses a {@code JLabel}
 * component to render, is installed by the lists's {@code ListUI}. You can
 * substitute your own renderer using code like this:
 * <pre>
 * {@code
 *  // Display an icon and a string for each object in the list.
 *
 * class MyCellRenderer extends JLabel implements ListCellRenderer<Object> {
 *     static final ImageIcon longIcon = new ImageIcon("long.gif");
 *     static final ImageIcon shortIcon = new ImageIcon("short.gif");
 *
 *     // This is the only method defined by ListCellRenderer.
 *     // We just reconfigure the JLabel each time we're called.
 *
 *     public Component getListCellRendererComponent(
 *       JList<?> list,           // the list
 *       Object value,            // value to display
 *       int index,               // cell index
 *       boolean isSelected,      // is the cell selected
 *       boolean cellHasFocus)    // does the cell have focus
 *     {
 *         String s = value.toString();
 *         setText(s);
 *         setIcon((s.length() > 10) ? longIcon : shortIcon);
 *         if (isSelected) {
 *             setBackground(list.getSelectionBackground());
 *             setForeground(list.getSelectionForeground());
 *         } else {
 *             setBackground(list.getBackground());
 *             setForeground(list.getForeground());
 *         }
 *         setEnabled(list.isEnabled());
 *         setFont(list.getFont());
 *         setOpaque(true);
 *         return this;
 *     }
 * }
 *
 * myList.setCellRenderer(new MyCellRenderer());
 * }
 * </pre>
 * <p>
 * Another job for the cell renderer is in helping to determine sizing
 * information for the list. By default, the list's {@code ListUI} determines
 * the size of cells by asking the cell renderer for its preferred
 * size for each list item. This can be expensive for large lists of items.
 * To avoid these calculations, you can set a {@code fixedCellWidth} and
 * {@code fixedCellHeight} on the list, or have these values calculated
 * automatically based on a single prototype value:
 * <a id="prototype_example"></a>
 * <pre>
 * {@code
 * JList<String> bigDataList = new JList<String>(bigData);
 *
 * // We don't want the JList implementation to compute the width
 * // or height of all of the list cells, so we give it a string
 * // that's as big as we'll need for any cell.  It uses this to
 * // compute values for the fixedCellWidth and fixedCellHeight
 * // properties.
 *
 * bigDataList.setPrototypeCellValue("Index 1234567890");
 * }
 * </pre>
 * <p>
 * {@code JList} doesn't implement scrolling directly. To create a list that
 * scrolls, make it the viewport view of a {@code JScrollPane}. For example:
 * <pre>
 * JScrollPane scrollPane = new JScrollPane(myList);
 *
 * // Or in two steps:
 * JScrollPane scrollPane = new JScrollPane();
 * scrollPane.getViewport().setView(myList);
 * </pre>
 * <p>
 * {@code JList} doesn't provide any special handling of double or triple
 * (or N) mouse clicks, but it's easy to add a {@code MouseListener} if you
 * wish to take action on these events. Use the {@code locationToIndex}
 * method to determine what cell was clicked. For example:
 * <pre>
 * MouseListener mouseListener = new MouseAdapter() {
 *     public void mouseClicked(MouseEvent e) {
 *         if (e.getClickCount() == 2) {
 *             int index = list.locationToIndex(e.getPoint());
 *             System.out.println("Double clicked on Item " + index);
 *          }
 *     }
 * };
 * list.addMouseListener(mouseListener);
 * </pre>
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
 * <p>
 * See <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/list.html">How to Use Lists</a>
 * in <a href="https://docs.oracle.com/javase/tutorial/"><em>The Java Tutorial</em></a>
 * for further documentation.
 *
 * @see ListModel
 * @see AbstractListModel
 * @see DefaultListModel
 * @see ListSelectionModel
 * @see DefaultListSelectionModel
 * @see ListCellRenderer
 * @see DefaultListCellRenderer
 *
 * @param <E> the type of the elements of this list
 *
 * @author Hans Muller
 * @since 1.2
 */
export class JList<E> extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'ListUI';
  /**
   * Indicates a vertical layout of cells, in a single column;
   * the default layout.
   * @see #setLayoutOrientation
   * @since 1.4
   */
  static readonly VERTICAL: number = 0;
  /**
   * Indicates a "newspaper style" layout with cells flowing vertically
   * then horizontally.
   * @see #setLayoutOrientation
   * @since 1.4
   */
  static readonly VERTICAL_WRAP: number = 1;
  /**
   * Indicates a "newspaper style" layout with cells flowing horizontally
   * then vertically.
   * @see #setLayoutOrientation
   * @since 1.4
   */
  static readonly HORIZONTAL_WRAP: number = 2;
  fixedCellWidth: number = 0;
  fixedCellHeight: number = 0;
  horizontalScrollIncrement: number = 0;
  prototypeCellValue: E = null;
  visibleRowCount: number = 0;
  selectionForeground: Color = null;
  selectionBackground: Color = null;
  dragEnabled: boolean = false;
  selectionModel: ListSelectionModel = null;
  dataModel: ListModel<E> = null;
  cellRenderer: ListCellRenderer<any> = null;
  selectionListener: ListSelectionListener = null;
  /**
   * How to lay out the cells; defaults to <code>VERTICAL</code>.
   */
  layoutOrientation: number = 0;
  /**
   * The drop mode for this component.
   */
  dropMode: DropMode = null;
  /**
   * The drop location.
   */
  dropLocation: JList$DropLocation = null;
  /**
   * Flag to indicate UI update is in progress
   */
  updateInProgress: boolean = false;
  $init_JList() {
    this.fixedCellWidth = -1;
    this.fixedCellHeight = -1;
    this.horizontalScrollIncrement = -1;
    this.visibleRowCount = 8;
    this.dropMode = DropMode.USE_SELECTION;
  }
  /**
   * Constructs a {@code JList} that displays elements from the specified,
   * {@code non-null}, model. All {@code JList} constructors delegate to
   * this one.
   * <p>
   * This constructor registers the list with the {@code ToolTipManager},
   * allowing for tooltips to be provided by the cell renderers.
   *
   * @param dataModel the model for the list
   * @throws IllegalArgumentException if the model is {@code null}
   */
  _JList$ListModel(dataModel: ListModel<E>): this {
    this._JComponent();
    this.$init_JList();
    if (dataModel == null) {
      throw new IllegalArgumentException('dataModel must be non null');
    }
    let toolTipManager = ToolTipManager.sharedInstance();
    toolTipManager.registerComponent(this);
    this.layoutOrientation = JList.VERTICAL;
    this.dataModel = dataModel;
    this.selectionModel = this.createSelectionModel();
    this.setAutoscrolls(true);
    this.updateUI();
    return this;
  }
  /**
   * Constructs a <code>JList</code> that displays the elements in
   * the specified array. This constructor creates a read-only model
   * for the given array, and then delegates to the constructor that
   * takes a {@code ListModel}.
   * <p>
   * Attempts to pass a {@code null} value to this method results in
   * undefined behavior and, most likely, exceptions. The created model
   * references the given array directly. Attempts to modify the array
   * after constructing the list results in undefined behavior.
   *
   * @param  listData  the array of Objects to be loaded into the data model,
   *                   {@code non-null}
   */
  _JList$ObjectArr(listData: E[]): this {
    this._JList$ListModel(new (JList$1())().$o(this).$c(listData)._AbstractListModel());
    return this;
  }
  /**
   * Constructs a <code>JList</code> with an empty, read-only, model.
   */
  _JList$(): this {
    this._JList$ListModel(new (JList$3())().$o(this)._AbstractListModel());
    return this;
  }
  /**
   * Returns the {@code ListUI}, the look and feel object that
   * renders this component.
   *
   * @return the <code>ListUI</code> object that renders this component
   */
  getUI(): ListUI {
    return this.ui;
  }
  /**
   * Sets the {@code ListUI}, the look and feel object that
   * renders this component.
   *
   * @param ui  the <code>ListUI</code> object
   * @see UIDefaults#getUI
   */
  setUI$ListUI(ui: ListUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the {@code ListUI} property by setting it to the value provided
   * by the current look and feel. If the current cell renderer was installed
   * by the developer (rather than the look and feel itself), this also causes
   * the cell renderer and its children to be updated, by calling
   * {@code SwingUtilities.updateComponentTreeUI} on it.
   *
   * @see UIManager#getUI
   * @see SwingUtilities#updateComponentTreeUI
   */
  updateUI(): void {
    if (!this.updateInProgress) {
      this.updateInProgress = true;
      try {
        this.setUI$ListUI(UIManager.getUI(this));
        let renderer = this.getCellRenderer();
        if (renderer instanceof Component) {
          SwingUtilities.updateComponentTreeUI(renderer);
        }
      } finally {
        this.updateInProgress = false;
      }
    }
  }
  /**
   * Returns {@code "ListUI"}, the <code>UIDefaults</code> key used to look
   * up the name of the {@code javax.swing.plaf.ListUI} class that defines
   * the look and feel for this component.
   *
   * @return the string "ListUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JList.uiClassID;
  }
  updateFixedCellSize(): void {
    let cr = this.getCellRenderer();
    let value = this.getPrototypeCellValue();
    if ((cr != null) && (value != null)) {
      let c = cr.getListCellRendererComponent(this, value, 0, false, false);
      let f = c.getFont();
      c.setFont(this.getFont());
      let d = c.getPreferredSize$();
      this.fixedCellWidth = d.width_;
      this.fixedCellHeight = d.height_;
      c.setFont(f);
    }
  }
  /**
   * Returns the "prototypical" cell value -- a value used to calculate a
   * fixed width and height for cells. This can be {@code null} if there
   * is no such value.
   *
   * @return the value of the {@code prototypeCellValue} property
   * @see #setPrototypeCellValue
   */
  getPrototypeCellValue(): E {
    return this.prototypeCellValue;
  }
  /**
   * Returns the value of the {@code fixedCellWidth} property.
   *
   * @return the fixed cell width
   * @see #setFixedCellWidth
   */
  getFixedCellWidth(): number {
    return this.fixedCellWidth;
  }
  /**
   * Returns the value of the {@code fixedCellHeight} property.
   *
   * @return the fixed cell height
   * @see #setFixedCellHeight
   */
  getFixedCellHeight(): number {
    return this.fixedCellHeight;
  }
  /**
   * Sets a fixed value to be used for the height of every cell in the list.
   * If {@code height} is -1, cell heights are computed in the {@code ListUI}
   * by applying <code>getPreferredSize</code> to the cell renderer component
   * for each list element.
   * <p>
   * The default value of this property is {@code -1}.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param height the height to be used for all cells in the list
   * @see #setPrototypeCellValue
   * @see #setFixedCellWidth
   * @see JComponent#addPropertyChangeListener
   */
  setFixedCellHeight(height: number): void {
    let oldValue = this.fixedCellHeight;
    this.fixedCellHeight = height;
    this.firePropertyChange$String$int$int('fixedCellHeight', oldValue, this.fixedCellHeight);
  }
  /**
   * Returns the object responsible for painting list items.
   *
   * @return the value of the {@code cellRenderer} property
   * @see #setCellRenderer
   */
  getCellRenderer(): ListCellRenderer<any> {
    return this.cellRenderer;
  }
  /**
   * Sets the delegate that is used to paint each cell in the list.
   * The job of a cell renderer is discussed in detail in the
   * <a href="#renderer">class level documentation</a>.
   * <p>
   * If the {@code prototypeCellValue} property is {@code non-null},
   * setting the cell renderer also causes the {@code fixedCellWidth} and
   * {@code fixedCellHeight} properties to be re-calculated. Only one
   * <code>PropertyChangeEvent</code> is generated however -
   * for the <code>cellRenderer</code> property.
   * <p>
   * The default value of this property is provided by the {@code ListUI}
   * delegate, i.e. by the look and feel implementation.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param cellRenderer the <code>ListCellRenderer</code>
   *                          that paints list cells
   * @see #getCellRenderer
   */
  setCellRenderer(cellRenderer: ListCellRenderer<any>): void {
    let oldValue = this.cellRenderer;
    this.cellRenderer = cellRenderer;
    if ((cellRenderer != null) && !cellRenderer.equals(oldValue)) {
      this.updateFixedCellSize();
    }
    this.firePropertyChange$String$Object$Object('cellRenderer', oldValue, cellRenderer);
  }
  /**
   * Returns the color used to draw the foreground of selected items.
   * {@code DefaultListCellRenderer} uses this color to draw the foreground
   * of items in the selected state, as do the renderers installed by most
   * {@code ListUI} implementations.
   *
   * @return the color to draw the foreground of selected items
   * @see #setSelectionForeground
   * @see DefaultListCellRenderer
   */
  getSelectionForeground(): Color {
    return this.selectionForeground;
  }
  /**
   * Sets the color used to draw the foreground of selected items, which
   * cell renderers can use to render text and graphics.
   * {@code DefaultListCellRenderer} uses this color to draw the foreground
   * of items in the selected state, as do the renderers installed by most
   * {@code ListUI} implementations.
   * <p>
   * The default value of this property is defined by the look and feel
   * implementation.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param selectionForeground  the {@code Color} to use in the foreground
   *                             for selected list items
   * @see #getSelectionForeground
   * @see #setSelectionBackground
   * @see #setForeground
   * @see #setBackground
   * @see #setFont
   * @see DefaultListCellRenderer
   */
  setSelectionForeground(selectionForeground: Color): void {
    let oldValue = this.selectionForeground;
    this.selectionForeground = selectionForeground;
    this.firePropertyChange$String$Object$Object('selectionForeground', oldValue, selectionForeground);
  }
  /**
   * Returns the color used to draw the background of selected items.
   * {@code DefaultListCellRenderer} uses this color to draw the background
   * of items in the selected state, as do the renderers installed by most
   * {@code ListUI} implementations.
   *
   * @return the color to draw the background of selected items
   * @see #setSelectionBackground
   * @see DefaultListCellRenderer
   */
  getSelectionBackground(): Color {
    return this.selectionBackground;
  }
  /**
   * Sets the color used to draw the background of selected items, which
   * cell renderers can use fill selected cells.
   * {@code DefaultListCellRenderer} uses this color to fill the background
   * of items in the selected state, as do the renderers installed by most
   * {@code ListUI} implementations.
   * <p>
   * The default value of this property is defined by the look
   * and feel implementation.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param selectionBackground  the {@code Color} to use for the
   *                             background of selected cells
   * @see #getSelectionBackground
   * @see #setSelectionForeground
   * @see #setForeground
   * @see #setBackground
   * @see #setFont
   * @see DefaultListCellRenderer
   */
  setSelectionBackground(selectionBackground: Color): void {
    let oldValue = this.selectionBackground;
    this.selectionBackground = selectionBackground;
    this.firePropertyChange$String$Object$Object('selectionBackground', oldValue, selectionBackground);
  }
  /**
   * Returns the value of the {@code visibleRowCount} property. See the
   * documentation for {@link #setVisibleRowCount} for details on how to
   * interpret this value.
   *
   * @return the value of the {@code visibleRowCount} property.
   * @see #setVisibleRowCount
   */
  getVisibleRowCount(): number {
    return this.visibleRowCount;
  }
  /**
   * Sets the {@code visibleRowCount} property, which has different meanings
   * depending on the layout orientation: For a {@code VERTICAL} layout
   * orientation, this sets the preferred number of rows to display without
   * requiring scrolling; for other orientations, it affects the wrapping of
   * cells.
   * <p>
   * In {@code VERTICAL} orientation:<br>
   * Setting this property affects the return value of the
   * {@link #getPreferredScrollableViewportSize} method, which is used to
   * calculate the preferred size of an enclosing viewport. See that method's
   * documentation for more details.
   * <p>
   * In {@code HORIZONTAL_WRAP} and {@code VERTICAL_WRAP} orientations:<br>
   * This affects how cells are wrapped. See the documentation of
   * {@link #setLayoutOrientation} for more details.
   * <p>
   * The default value of this property is {@code 8}.
   * <p>
   * Calling this method with a negative value results in the property
   * being set to {@code 0}.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param visibleRowCount  an integer specifying the preferred number of
   *                         rows to display without requiring scrolling
   * @see #getVisibleRowCount
   * @see #getPreferredScrollableViewportSize
   * @see #setLayoutOrientation
   * @see JComponent#getVisibleRect
   * @see JViewport
   */
  setVisibleRowCount(visibleRowCount: number): void {
    let oldValue = this.visibleRowCount;
    this.visibleRowCount = Math.max(0, visibleRowCount);
    this.firePropertyChange$String$int$int('visibleRowCount', oldValue, visibleRowCount);
  }
  /**
   * Returns the layout orientation property for the list: {@code VERTICAL}
   * if the layout is a single column of cells, {@code VERTICAL_WRAP} if the
   * layout is "newspaper style" with the content flowing vertically then
   * horizontally, or {@code HORIZONTAL_WRAP} if the layout is "newspaper
   * style" with the content flowing horizontally then vertically.
   *
   * @return the value of the {@code layoutOrientation} property
   * @see #setLayoutOrientation
   * @since 1.4
   */
  getLayoutOrientation(): number {
    return this.layoutOrientation;
  }
  /**
   * Defines the way list cells are laid out. Consider a {@code JList}
   * with five cells. Cells can be laid out in one of the following ways:
   *
   * <pre>
   * VERTICAL:          0
   *                    1
   *                    2
   *                    3
   *                    4
   *
   * HORIZONTAL_WRAP:   0  1  2
   *                    3  4
   *
   * VERTICAL_WRAP:     0  3
   *                    1  4
   *                    2
   * </pre>
   * <p>
   * A description of these layouts follows:
   *
   * <table class="striped">
   * <caption>Describes layouts VERTICAL,HORIZONTAL_WRAP, and VERTICAL_WRAP
   * </caption>
   * <thead>
   *   <tr>
   *     <th scope="col">Value
   *     <th scope="col">Description
   * </thead>
   * <tbody>
   *   <tr>
   *     <th scope="row">{@code VERTICAL}
   *     <td>Cells are laid out vertically in a single column.
   *   <tr>
   *     <th scope="row">{@code HORIZONTAL_WRAP}
   *     <td>Cells are laid out horizontally, wrapping to a new row as
   *     necessary. If the {@code visibleRowCount} property is less than or
   *     equal to zero, wrapping is determined by the width of the list;
   *     otherwise wrapping is done in such a way as to ensure
   *     {@code visibleRowCount} rows in the list.
   *   <tr>
   *     <th scope="row">{@code VERTICAL_WRAP}
   *     <td>Cells are laid out vertically, wrapping to a new column as
   *     necessary. If the {@code visibleRowCount} property is less than or
   *     equal to zero, wrapping is determined by the height of the list;
   *     otherwise wrapping is done at {@code visibleRowCount} rows.
   * </tbody>
   * </table>
   *
   * The default value of this property is <code>VERTICAL</code>.
   *
   * @param layoutOrientation the new layout orientation, one of:
   *        {@code VERTICAL}, {@code HORIZONTAL_WRAP} or {@code VERTICAL_WRAP}
   * @see #getLayoutOrientation
   * @see #setVisibleRowCount
   * @see #getScrollableTracksViewportHeight
   * @see #getScrollableTracksViewportWidth
   * @throws IllegalArgumentException if {@code layoutOrientation} isn't one of the
   *         allowable values
   * @since 1.4
   */
  setLayoutOrientation(layoutOrientation: number): void {
    let oldValue = this.layoutOrientation;
    switch (layoutOrientation) {
      case JList.VERTICAL:
      case JList.VERTICAL_WRAP:
      case JList.HORIZONTAL_WRAP:
        this.layoutOrientation = layoutOrientation;
        this.firePropertyChange$String$int$int('layoutOrientation', oldValue, layoutOrientation);
        break;
      default:
        throw new IllegalArgumentException('layoutOrientation must be one of: VERTICAL, HORIZONTAL_WRAP or VERTICAL_WRAP');
    }
  }
  /**
   * Returns the smallest list index that is currently visible.
   * In a left-to-right {@code componentOrientation}, the first visible
   * cell is found closest to the list's upper-left corner. In right-to-left
   * orientation, it is found closest to the upper-right corner.
   * If nothing is visible or the list is empty, {@code -1} is returned.
   * Note that the returned cell may only be partially visible.
   *
   * @return the index of the first visible cell
   * @see #getLastVisibleIndex
   * @see JComponent#getVisibleRect
   */
  getFirstVisibleIndex(): number {
    let r = this.getVisibleRect();
    let first: number;
    if (this.getComponentOrientation().isLeftToRight()) {
      first = this.locationToIndex(r.getLocation());
    } else {
      first = this.locationToIndex(new Point()._Point$int$int((r.x_ + r.width_ - 1) | 0, r.y_));
    }
    if (first !== -1) {
      let bounds = this.getCellBounds(first, first);
      if (bounds != null) {
        SwingUtilities.computeIntersection(r.x_, r.y_, r.width_, r.height_, bounds);
        if (bounds.width_ === 0 || bounds.height_ === 0) {
          first = -1;
        }
      }
    }
    return first;
  }
  /**
   * Scrolls the list within an enclosing viewport to make the specified
   * cell completely visible. This calls {@code scrollRectToVisible} with
   * the bounds of the specified cell. For this method to work, the
   * {@code JList} must be within a <code>JViewport</code>.
   * <p>
   * If the given index is outside the list's range of cells, this method
   * results in nothing.
   *
   * @param index  the index of the cell to make visible
   * @see JComponent#scrollRectToVisible
   * @see #getVisibleRect
   */
  ensureIndexIsVisible(index: number): void {
    let cellBounds = this.getCellBounds(index, index);
    if (cellBounds != null) {
      this.scrollRectToVisible(cellBounds);
    }
  }
  /**
   * Turns on or off automatic drag handling. In order to enable automatic
   * drag handling, this property should be set to {@code true}, and the
   * list's {@code TransferHandler} needs to be {@code non-null}.
   * The default value of the {@code dragEnabled} property is {@code false}.
   * <p>
   * The job of honoring this property, and recognizing a user drag gesture,
   * lies with the look and feel implementation, and in particular, the list's
   * {@code ListUI}. When automatic drag handling is enabled, most look and
   * feels (including those that subclass {@code BasicLookAndFeel}) begin a
   * drag and drop operation whenever the user presses the mouse button over
   * an item and then moves the mouse a few pixels. Setting this property to
   * {@code true} can therefore have a subtle effect on how selections behave.
   * <p>
   * If a look and feel is used that ignores this property, you can still
   * begin a drag and drop operation by calling {@code exportAsDrag} on the
   * list's {@code TransferHandler}.
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
    if (b && GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
    this.dragEnabled = b;
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
  /**
   * Calculates a drop location in this component, representing where a
   * drop at the given point should insert data.
   *
   * @param p the point to calculate a drop location for
   * @return the drop location, or <code>null</code>
   */
  dropLocationForPoint$Point(p: Point): JList$DropLocation {
    let location = null;
    let rect = null;
    let index = this.locationToIndex(p);
    if (index !== -1) {
      rect = this.getCellBounds(index, index);
    }
    {
      let between: boolean;
      switch (this.dropMode) {
        case DropMode.USE_SELECTION:
        case DropMode.ON:
          location = new JList$DropLocation()._JList$DropLocation(p, (rect != null && rect.contains$Point(p)) ? index : -1, false);
          break;
        case DropMode.INSERT:
          if (index === -1) {
            location = new JList$DropLocation()._JList$DropLocation(p, this.getModel().getSize(), true);
            break;
          }
          if (this.layoutOrientation === JList.HORIZONTAL_WRAP) {
            let ltr = this.getComponentOrientation().isLeftToRight();
            if (SwingUtilities2.liesInHorizontal(rect, p, ltr, false) === SwingUtilities2$Section.TRAILING) {
              index++;
            } else if (index === ((this.getModel().getSize() - 1) | 0) && p.y_ >= ((rect.y_ + rect.height_) | 0)) {
              index++;
            }
          } else {
            if (SwingUtilities2.liesInVertical(rect, p, false) === SwingUtilities2$Section.TRAILING) {
              index++;
            }
          }
          location = new JList$DropLocation()._JList$DropLocation(p, index, true);
          break;
        case DropMode.ON_OR_INSERT:
          if (index === -1) {
            location = new JList$DropLocation()._JList$DropLocation(p, this.getModel().getSize(), true);
            break;
          }
          between = false;
          if (this.layoutOrientation === JList.HORIZONTAL_WRAP) {
            let ltr = this.getComponentOrientation().isLeftToRight();
            let section = SwingUtilities2.liesInHorizontal(rect, p, ltr, true);
            if (section === SwingUtilities2$Section.TRAILING) {
              index++;
              between = true;
            } else if (index === ((this.getModel().getSize() - 1) | 0) && p.y_ >= ((rect.y_ + rect.height_) | 0)) {
              index++;
              between = true;
            } else if (section === SwingUtilities2$Section.LEADING) {
              between = true;
            }
          } else {
            let section = SwingUtilities2.liesInVertical(rect, p, true);
            if (section === SwingUtilities2$Section.LEADING) {
              between = true;
            } else if (section === SwingUtilities2$Section.TRAILING) {
              index++;
              between = true;
            }
          }
          location = new JList$DropLocation()._JList$DropLocation(p, index, between);
          break;
        default:
          // assert false
      }
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
    let listLocation = location;
    if (this.dropMode === DropMode.USE_SELECTION) {
      if (listLocation == null) {
        if (!forDrop && state != null) {
          this.setSelectedIndices((state)[0]);
          let anchor = (state)[1][0];
          let lead = (state)[1][1];
          SwingUtilities2.setLeadAnchorWithoutSelection(this.getSelectionModel(), lead, anchor);
        }
      } else {
        if (this.dropLocation == null) {
          let inds = this.getSelectedIndices();
          retVal = [inds, [this.getAnchorSelectionIndex(), this.getLeadSelectionIndex()]];
        } else {
          retVal = state;
        }
        let index = listLocation.getIndex();
        if (index === -1) {
          this.clearSelection();
          this.getSelectionModel().setAnchorSelectionIndex(-1);
          this.getSelectionModel().setLeadSelectionIndex(-1);
        } else {
          this.setSelectionInterval(index, index);
        }
      }
    }
    let old = this.dropLocation;
    this.dropLocation = listLocation;
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
   * <p>
   * By default, responsibility for listening for changes to this property
   * and indicating the drop location visually lies with the list's
   * {@code ListUI}, which may paint it directly and/or install a cell
   * renderer to do so. Developers wishing to implement custom drop location
   * painting and/or replace the default cell renderer, may need to honor
   * this property.
   *
   * @return the drop location
   * @see #setDropMode
   * @see TransferHandler#canImport(TransferHandler.TransferSupport)
   * @since 1.6
   */
  getDropLocation(): JList$DropLocation {
    return this.dropLocation;
  }
  /**
   * Returns the next list element whose {@code toString} value
   * starts with the given prefix.
   *
   * @param prefix the string to test for a match
   * @param startIndex the index for starting the search
   * @param bias the search direction, either
   * Position.Bias.Forward or Position.Bias.Backward.
   * @return the index of the next list element that
   * starts with the prefix; otherwise {@code -1}
   * @throws IllegalArgumentException if prefix is {@code null}
   * or startIndex is out of bounds
   * @since 1.4
   */
  getNextMatch(prefix: string, startIndex: number, bias: Position$Bias): number {
    let model = this.getModel();
    let max = model.getSize();
    if (prefix == null) {
      throw new IllegalArgumentException();
    }
    if (startIndex < 0 || startIndex >= max) {
      throw new IllegalArgumentException();
    }
    prefix = prefix.toUpperCase();
    let increment = (bias === Position$Bias.Forward) ? 1 : -1;
    let index = startIndex;
    do {
      let element = model.getElementAt(index);
      if (element != null) {
        let string$: string;
        if ($J.isa(element, JString)) {
          string$ = (element).toUpperCase();
        } else {
          string$ = $J.str(element);
          if (string$ != null) {
            string$ = string$.toUpperCase();
          }
        }
        if (string$ != null && string$.startsWith(prefix)) {
          return index;
        }
      }
      index = ((index + increment + max) | 0) % max;
    } while (index !== startIndex);
    return -1;
  }
  /**
   * Returns the tooltip text to be used for the given event. This overrides
   * {@code JComponent}'s {@code getToolTipText} to first check the cell
   * renderer component for the cell over which the event occurred, returning
   * its tooltip text, if any. This implementation allows you to specify
   * tooltip text on the cell level, by using {@code setToolTipText} on your
   * cell renderer component.
   * <p>
   * <strong>Note:</strong> For <code>JList</code> to properly display the
   * tooltips of its renderers in this manner, <code>JList</code> must be a
   * registered component with the <code>ToolTipManager</code>. This registration
   * is done automatically in the constructor. However, if at a later point
   * <code>JList</code> is unregistered, by way of a call to
   * {@code setToolTipText(null)}, tips from the renderers will no longer display.
   *
   * @param event the {@code MouseEvent} to fetch the tooltip text for
   * @see JComponent#setToolTipText
   * @see JComponent#getToolTipText
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    if (event != null) {
      let p = event.getPoint();
      let index = this.locationToIndex(p);
      let r = this.getCellRenderer();
      let cellBounds: Rectangle;
      if (index !== -1 && r != null && (cellBounds = this.getCellBounds(index, index)) != null && cellBounds.contains$int$int(p.x_, p.y_)) {
        let lsm = this.getSelectionModel();
        let rComponent = r.getListCellRendererComponent(this, this.getModel().getElementAt(index), index, lsm.isSelectedIndex(index), (this.hasFocus() && (lsm.getLeadSelectionIndex() === index)));
        if (rComponent instanceof JComponent) {
          let newEvent: MouseEvent;
          p.translate(-cellBounds.x_, -cellBounds.y_);
          newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(rComponent, event.getID(), event.getWhen(), event.getModifiers(), p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
          let meAccessor = AWTAccessor.getMouseEventAccessor();
          meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(event));
          let tip = (rComponent).getToolTipText$MouseEvent(newEvent);
          if (tip != null) {
            return tip;
          }
        }
      }
    }
    return super.getToolTipText$();
  }
  /**
   * Returns the cell index closest to the given location in the list's
   * coordinate system. To determine if the cell actually contains the
   * specified location, compare the point against the cell's bounds,
   * as provided by {@code getCellBounds}. This method returns {@code -1}
   * if the model is empty
   * <p>
   * This is a cover method that delegates to the method of the same name
   * in the list's {@code ListUI}. It returns {@code -1} if the list has
   * no {@code ListUI}.
   *
   * @param location the coordinates of the point
   * @return the cell index closest to the given location, or {@code -1}
   */
  locationToIndex(location: Point): number {
    let ui = this.getUI();
    return (ui != null) ? ui.locationToIndex(this, location) : -1;
  }
  /**
   * Returns the bounding rectangle, in the list's coordinate system,
   * for the range of cells specified by the two indices.
   * These indices can be supplied in any order.
   * <p>
   * If the smaller index is outside the list's range of cells, this method
   * returns {@code null}. If the smaller index is valid, but the larger
   * index is outside the list's range, the bounds of just the first index
   * is returned. Otherwise, the bounds of the valid range is returned.
   * <p>
   * This is a cover method that delegates to the method of the same name
   * in the list's {@code ListUI}. It returns {@code null} if the list has
   * no {@code ListUI}.
   *
   * @param index0 the first index in the range
   * @param index1 the second index in the range
   * @return the bounding rectangle for the range of cells, or {@code null}
   */
  getCellBounds(index0: number, index1: number): Rectangle {
    let ui = this.getUI();
    return (ui != null) ? ui.getCellBounds$JList$int$int(this, index0, index1) : null;
  }
  /**
   * Returns the data model that holds the list of items displayed
   * by the <code>JList</code> component.
   *
   * @return the <code>ListModel</code> that provides the displayed
   *                          list of items
   * @see #setModel
   */
  getModel(): ListModel<E> {
    return this.dataModel;
  }
  /**
   * Sets the model that represents the contents or "value" of the
   * list, notifies property change listeners, and then clears the
   * list's selection.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param model  the <code>ListModel</code> that provides the
   *                                          list of items for display
   * @throws IllegalArgumentException  if <code>model</code> is
   *                                          <code>null</code>
   * @see #getModel
   * @see #clearSelection
   */
  setModel(model: ListModel<E>): void {
    if (model == null) {
      throw new IllegalArgumentException('model must be non null');
    }
    let oldValue = this.dataModel;
    this.dataModel = model;
    this.firePropertyChange$String$Object$Object('model', oldValue, this.dataModel);
    this.clearSelection();
  }
  /**
   * Constructs a read-only <code>ListModel</code> from an array of items,
   * and calls {@code setModel} with this model.
   * <p>
   * Attempts to pass a {@code null} value to this method results in
   * undefined behavior and, most likely, exceptions. The created model
   * references the given array directly. Attempts to modify the array
   * after invoking this method results in undefined behavior.
   *
   * @param listData an array of {@code E} containing the items to
   *        display in the list
   * @see #setModel
   */
  setListData$ObjectArr(listData: E[]): void {
    this.setModel(new (JList$4())().$o(this).$c(listData)._AbstractListModel());
  }
  /**
   * Returns an instance of {@code DefaultListSelectionModel}; called
   * during construction to initialize the list's selection model
   * property.
   *
   * @return a {@code DefaultListSelecitonModel}, used to initialize
   *         the list's selection model property during construction
   * @see #setSelectionModel
   * @see DefaultListSelectionModel
   */
  createSelectionModel(): ListSelectionModel {
    return new DefaultListSelectionModel()._DefaultListSelectionModel();
  }
  /**
   * Returns the current selection model. The selection model maintains the
   * selection state of the list. See the class level documentation for more
   * details.
   *
   * @return the <code>ListSelectionModel</code> that maintains the
   *         list's selections
   *
   * @see #setSelectionModel
   * @see ListSelectionModel
   */
  getSelectionModel(): ListSelectionModel {
    return this.selectionModel;
  }
  /**
   * Notifies {@code ListSelectionListener}s added directly to the list
   * of selection changes made to the selection model. {@code JList}
   * listens for changes made to the selection in the selection model,
   * and forwards notification to listeners added to the list directly,
   * by calling this method.
   * <p>
   * This method constructs a {@code ListSelectionEvent} with this list
   * as the source, and the specified arguments, and sends it to the
   * registered {@code ListSelectionListeners}.
   *
   * @param firstIndex the first index in the range, {@code <= lastIndex}
   * @param lastIndex the last index in the range, {@code >= firstIndex}
   * @param isAdjusting whether or not this is one in a series of
   *        multiple events, where changes are still being made
   *
   * @see #addListSelectionListener
   * @see #removeListSelectionListener
   * @see javax.swing.event.ListSelectionEvent
   * @see EventListenerList
   */
  fireSelectionValueChanged(firstIndex: number, lastIndex: number, isAdjusting: boolean): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ListSelectionListener)) {
        if (e == null) {
          e = new ListSelectionEvent()._ListSelectionEvent(this, firstIndex, lastIndex, isAdjusting);
        }
        $J.fn((listeners[(i + 1) | 0]), 'valueChanged')(e);
      }
    }
  }
  /**
   * Adds a listener to the list, to be notified each time a change to the
   * selection occurs; the preferred way of listening for selection state
   * changes. {@code JList} takes care of listening for selection state
   * changes in the selection model, and notifies the given listener of
   * each change. {@code ListSelectionEvent}s sent to the listener have a
   * {@code source} property set to this list.
   *
   * @param listener the {@code ListSelectionListener} to add
   * @see #getSelectionModel
   * @see #getListSelectionListeners
   */
  addListSelectionListener(listener: ListSelectionListener): void {
    if (this.selectionListener == null) {
      this.selectionListener = $J.fn(new JList$ListSelectionHandler().$o(this)._JList$ListSelectionHandler(), 'valueChanged');
      this.getSelectionModel().addListSelectionListener(this.selectionListener);
    }
    this.listenerList.add($J.cls(ListSelectionListener), listener);
  }
  /**
   * Removes a selection listener from the list.
   *
   * @param listener the {@code ListSelectionListener} to remove
   * @see #addListSelectionListener
   * @see #getSelectionModel
   */
  removeListSelectionListener(listener: ListSelectionListener): void {
    this.listenerList.remove($J.cls(ListSelectionListener), listener);
  }
  /**
   * Sets the <code>selectionModel</code> for the list to a
   * non-<code>null</code> <code>ListSelectionModel</code>
   * implementation. The selection model handles the task of making single
   * selections, selections of contiguous ranges, and non-contiguous
   * selections.
   * <p>
   * This is a JavaBeans bound property.
   *
   * @param selectionModel  the <code>ListSelectionModel</code> that
   *                          implements the selections
   * @throws IllegalArgumentException   if <code>selectionModel</code>
   *                                          is <code>null</code>
   * @see #getSelectionModel
   */
  setSelectionModel(selectionModel: ListSelectionModel): void {
    if (selectionModel == null) {
      throw new IllegalArgumentException('selectionModel must be non null');
    }
    if (this.selectionListener != null) {
      this.selectionModel.removeListSelectionListener(this.selectionListener);
      selectionModel.addListSelectionListener(this.selectionListener);
    }
    let oldValue = this.selectionModel;
    this.selectionModel = selectionModel;
    this.firePropertyChange$String$Object$Object('selectionModel', oldValue, selectionModel);
  }
  /**
   * Sets the selection mode for the list. This is a cover method that sets
   * the selection mode directly on the selection model.
   * <p>
   * The following list describes the accepted selection modes:
   * <ul>
   * <li>{@code ListSelectionModel.SINGLE_SELECTION} -
   *   Only one list index can be selected at a time. In this mode,
   *   {@code setSelectionInterval} and {@code addSelectionInterval} are
   *   equivalent, both replacing the current selection with the index
   *   represented by the second argument (the "lead").
   * <li>{@code ListSelectionModel.SINGLE_INTERVAL_SELECTION} -
   *   Only one contiguous interval can be selected at a time.
   *   In this mode, {@code addSelectionInterval} behaves like
   *   {@code setSelectionInterval} (replacing the current selection},
   *   unless the given interval is immediately adjacent to or overlaps
   *   the existing selection, and can be used to grow the selection.
   * <li>{@code ListSelectionModel.MULTIPLE_INTERVAL_SELECTION} -
   *   In this mode, there's no restriction on what can be selected.
   *   This mode is the default.
   * </ul>
   *
   * @param selectionMode the selection mode
   * @see #getSelectionMode
   * @throws IllegalArgumentException if the selection mode isn't
   *         one of those allowed
   */
  setSelectionMode(selectionMode: number): void {
    this.getSelectionModel().setSelectionMode(selectionMode);
  }
  /**
   * Returns the current selection mode for the list. This is a cover
   * method that delegates to the method of the same name on the
   * list's selection model.
   *
   * @return the current selection mode
   * @see #setSelectionMode
   */
  getSelectionMode(): number {
    return this.getSelectionModel().getSelectionMode();
  }
  /**
   * Returns the anchor selection index. This is a cover method that
   * delegates to the method of the same name on the list's selection model.
   *
   * @return the anchor selection index
   * @see ListSelectionModel#getAnchorSelectionIndex
   */
  getAnchorSelectionIndex(): number {
    return this.getSelectionModel().getAnchorSelectionIndex();
  }
  /**
   * Returns the lead selection index. This is a cover method that
   * delegates to the method of the same name on the list's selection model.
   *
   * @return the lead selection index
   * @see ListSelectionModel#getLeadSelectionIndex
   */
  getLeadSelectionIndex(): number {
    return this.getSelectionModel().getLeadSelectionIndex();
  }
  /**
   * Returns the smallest selected cell index, or {@code -1} if the selection
   * is empty. This is a cover method that delegates to the method of the same
   * name on the list's selection model.
   *
   * @return the smallest selected cell index, or {@code -1}
   * @see ListSelectionModel#getMinSelectionIndex
   */
  getMinSelectionIndex(): number {
    return this.getSelectionModel().getMinSelectionIndex();
  }
  /**
   * Returns the largest selected cell index, or {@code -1} if the selection
   * is empty. This is a cover method that delegates to the method of the same
   * name on the list's selection model.
   *
   * @return the largest selected cell index
   * @see ListSelectionModel#getMaxSelectionIndex
   */
  getMaxSelectionIndex(): number {
    return this.getSelectionModel().getMaxSelectionIndex();
  }
  /**
   * Returns {@code true} if the specified index is selected,
   * else {@code false}. This is a cover method that delegates to the method
   * of the same name on the list's selection model.
   *
   * @param index index to be queried for selection state
   * @return {@code true} if the specified index is selected,
   *         else {@code false}
   * @see ListSelectionModel#isSelectedIndex
   * @see #setSelectedIndex
   */
  isSelectedIndex(index: number): boolean {
    return this.getSelectionModel().isSelectedIndex(index);
  }
  /**
   * Clears the selection; after calling this method, {@code isSelectionEmpty}
   * will return {@code true}. This is a cover method that delegates to the
   * method of the same name on the list's selection model.
   *
   * @see ListSelectionModel#clearSelection
   * @see #isSelectionEmpty
   */
  clearSelection(): void {
    this.getSelectionModel().clearSelection();
  }
  /**
   * Selects the specified interval. Both {@code anchor} and {@code lead}
   * indices are included. {@code anchor} doesn't have to be less than or
   * equal to {@code lead}. This is a cover method that delegates to the
   * method of the same name on the list's selection model.
   * <p>
   * Refer to the documentation of the selection model class being used
   * for details on how values less than {@code 0} are handled.
   *
   * @param anchor the first index to select
   * @param lead the last index to select
   * @see ListSelectionModel#setSelectionInterval
   * @see DefaultListSelectionModel#setSelectionInterval
   * @see #createSelectionModel
   * @see #addSelectionInterval
   * @see #removeSelectionInterval
   */
  setSelectionInterval(anchor: number, lead: number): void {
    this.getSelectionModel().setSelectionInterval(anchor, lead);
  }
  /**
   * Sets the selection to be the union of the specified interval with current
   * selection. Both the {@code anchor} and {@code lead} indices are
   * included. {@code anchor} doesn't have to be less than or
   * equal to {@code lead}. This is a cover method that delegates to the
   * method of the same name on the list's selection model.
   * <p>
   * Refer to the documentation of the selection model class being used
   * for details on how values less than {@code 0} are handled.
   *
   * @param anchor the first index to add to the selection
   * @param lead the last index to add to the selection
   * @see ListSelectionModel#addSelectionInterval
   * @see DefaultListSelectionModel#addSelectionInterval
   * @see #createSelectionModel
   * @see #setSelectionInterval
   * @see #removeSelectionInterval
   */
  addSelectionInterval(anchor: number, lead: number): void {
    this.getSelectionModel().addSelectionInterval(anchor, lead);
  }
  /**
   * Sets the selection to be the set difference of the specified interval
   * and the current selection. Both the {@code index0} and {@code index1}
   * indices are removed. {@code index0} doesn't have to be less than or
   * equal to {@code index1}. This is a cover method that delegates to the
   * method of the same name on the list's selection model.
   * <p>
   * Refer to the documentation of the selection model class being used
   * for details on how values less than {@code 0} are handled.
   *
   * @param index0 the first index to remove from the selection
   * @param index1 the last index to remove from the selection
   * @see ListSelectionModel#removeSelectionInterval
   * @see DefaultListSelectionModel#removeSelectionInterval
   * @see #createSelectionModel
   * @see #setSelectionInterval
   * @see #addSelectionInterval
   */
  removeSelectionInterval(index0: number, index1: number): void {
    this.getSelectionModel().removeSelectionInterval(index0, index1);
  }
  /**
   * Sets the selection model's {@code valueIsAdjusting} property. When
   * {@code true}, upcoming changes to selection should be considered part
   * of a single change. This property is used internally and developers
   * typically need not call this method. For example, when the model is being
   * updated in response to a user drag, the value of the property is set
   * to {@code true} when the drag is initiated and set to {@code false}
   * when the drag is finished. This allows listeners to update only
   * when a change has been finalized, rather than handling all of the
   * intermediate values.
   * <p>
   * You may want to use this directly if making a series of changes
   * that should be considered part of a single change.
   * <p>
   * This is a cover method that delegates to the method of the same name on
   * the list's selection model. See the documentation for
   * {@link javax.swing.ListSelectionModel#setValueIsAdjusting} for
   * more details.
   *
   * @param b the new value for the property
   * @see ListSelectionModel#setValueIsAdjusting
   * @see javax.swing.event.ListSelectionEvent#getValueIsAdjusting
   * @see #getValueIsAdjusting
   */
  setValueIsAdjusting(b: boolean): void {
    this.getSelectionModel().setValueIsAdjusting(b);
  }
  /**
   * Returns an array of all of the selected indices, in increasing
   * order.
   *
   * @return all of the selected indices, in increasing order,
   *         or an empty array if nothing is selected
   * @see #removeSelectionInterval
   * @see #addListSelectionListener
   */
  getSelectedIndices(): number[] {
    return this.getSelectionModel().getSelectedIndices();
  }
  /**
   * Selects a single cell. Does nothing if the given index is greater
   * than or equal to the model size. This is a convenience method that uses
   * {@code setSelectionInterval} on the selection model. Refer to the
   * documentation for the selection model class being used for details on
   * how values less than {@code 0} are handled.
   *
   * @param index the index of the cell to select
   * @see ListSelectionModel#setSelectionInterval
   * @see #isSelectedIndex
   * @see #addListSelectionListener
   */
  setSelectedIndex(index: number): void {
    if (index >= this.getModel().getSize()) {
      return;
    }
    this.getSelectionModel().setSelectionInterval(index, index);
  }
  /**
   * Changes the selection to be the set of indices specified by the given
   * array. Indices greater than or equal to the model size are ignored.
   * This is a convenience method that clears the selection and then uses
   * {@code addSelectionInterval} on the selection model to add the indices.
   * Refer to the documentation of the selection model class being used for
   * details on how values less than {@code 0} are handled.
   *
   * @param indices an array of the indices of the cells to select,
   *                {@code non-null}
   * @see ListSelectionModel#addSelectionInterval
   * @see #isSelectedIndex
   * @see #addListSelectionListener
   * @throws NullPointerException if the given array is {@code null}
   */
  setSelectedIndices(indices: number[]): void {
    let sm = this.getSelectionModel();
    sm.clearSelection();
    let size = this.getModel().getSize();
    for (let i of indices) {
      if (i < size) {
        sm.addSelectionInterval(i, i);
      }
    }
  }
  /**
   * Returns an array of all the selected values, in increasing order based
   * on their indices in the list.
   *
   * @return the selected values, or an empty array if nothing is selected
   * @see #isSelectedIndex
   * @see #getModel
   * @see #addListSelectionListener
   *
   * @deprecated As of JDK 1.7, replaced by {@link #getSelectedValuesList()}
   */
  getSelectedValues(): any[] {
    let sm = this.getSelectionModel();
    let dm = this.getModel();
    let iMin = sm.getMinSelectionIndex();
    let iMax = sm.getMaxSelectionIndex();
    let size = dm.getSize();
    if ((iMin < 0) || (iMax < 0) || (iMin >= size)) {
      return $J.newArray(0, null);
    }
    iMax = iMax < size ? iMax : (size - 1) | 0;
    let rvTmp = $J.newArray((1 + (iMax - iMin)) | 0, null);
    let n = 0;
    for (let i = iMin; i <= iMax; i++) {
      if (sm.isSelectedIndex(i)) {
        rvTmp[n++] = dm.getElementAt(i);
      }
    }
    let rv = $J.newArray(n, null);
    $J.system_arraycopy(rvTmp, 0, rv, 0, n);
    return rv;
  }
  /**
   * Returns a list of all the selected items, in increasing order based
   * on their indices in the list.
   *
   * @return the selected items, or an empty list if nothing is selected
   * @see #isSelectedIndex
   * @see #getModel
   * @see #addListSelectionListener
   *
   * @since 1.7
   */
  getSelectedValuesList(): List<E> {
    let dm = this.getModel();
    let selectedIndices = this.getSelectedIndices();
    if (selectedIndices.length > 0) {
      let size = dm.getSize();
      if (selectedIndices[0] >= size) {
        return Collections.emptyList();
      }
      let selectedItems = new ArrayList();
      for (let i of selectedIndices) {
        if (i >= size) {
          break;
        }
        selectedItems.add(dm.getElementAt(i));
      }
      return selectedItems;
    }
    return Collections.emptyList();
  }
  /**
   * Returns the smallest selected cell index; <i>the selection</i> when only
   * a single item is selected in the list. When multiple items are selected,
   * it is simply the smallest selected index. Returns {@code -1} if there is
   * no selection.
   * <p>
   * This method is a cover that delegates to {@code getMinSelectionIndex}.
   *
   * @return the smallest selected cell index
   * @see #getMinSelectionIndex
   * @see #addListSelectionListener
   */
  getSelectedIndex(): number {
    return this.getMinSelectionIndex();
  }
  /**
   * Returns the value for the smallest selected cell index;
   * <i>the selected value</i> when only a single item is selected in the
   * list. When multiple items are selected, it is simply the value for the
   * smallest selected index. Returns {@code null} if there is no selection.
   * <p>
   * This is a convenience method that simply returns the model value for
   * {@code getMinSelectionIndex}.
   *
   * @return the first selected value
   * @see #getMinSelectionIndex
   * @see #getModel
   * @see #addListSelectionListener
   */
  getSelectedValue(): E {
    let i = this.getMinSelectionIndex();
    return ((i === -1) || (i >= this.getModel().getSize())) ? null : this.getModel().getElementAt(i);
  }
  /**
   * Selects the specified object from the list.
   * If the object passed is {@code null}, the selection is cleared.
   *
   * @param anObject      the object to select
   * @param shouldScroll  {@code true} if the list should scroll to display
   *                      the selected object, if one exists; otherwise {@code false}
   */
  setSelectedValue(anObject: any, shouldScroll: boolean): void {
    if (anObject == null) {
      this.clearSelection();
    } else if (!$J.equals(anObject, this.getSelectedValue())) {
      let i: number;
      let c: number;
      let dm = this.getModel();
      for (i = 0, c = dm.getSize(); i < c; i++) {
        if ($J.equals(anObject, dm.getElementAt(i))) {
          this.setSelectedIndex(i);
          if (shouldScroll) {
            this.ensureIndexIsVisible(i);
          }
          this.repaint$();
          return;
        }
      }
      this.setSelectedIndex(-1);
    }
    this.repaint$();
  }
  /**
   * --- The Scrollable Implementation ---
   */
  checkScrollableParameters(visibleRect: Rectangle, orientation: number): void {
    if (visibleRect == null) {
      throw new IllegalArgumentException('visibleRect must be non-null');
    }
    switch (orientation) {
      case SwingConstants.VERTICAL:
      case SwingConstants.HORIZONTAL:
        break;
      default:
        throw new IllegalArgumentException('orientation must be one of: VERTICAL, HORIZONTAL');
    }
  }
  /**
   * Computes the size of viewport needed to display {@code visibleRowCount}
   * rows. The value returned by this method depends on the layout
   * orientation:
   * <p>
   * <b>{@code VERTICAL}:</b>
   * <br>
   * This is trivial if both {@code fixedCellWidth} and {@code fixedCellHeight}
   * have been set (either explicitly or by specifying a prototype cell value).
   * The width is simply the {@code fixedCellWidth} plus the list's horizontal
   * insets. The height is the {@code fixedCellHeight} multiplied by the
   * {@code visibleRowCount}, plus the list's vertical insets.
   * <p>
   * If either {@code fixedCellWidth} or {@code fixedCellHeight} haven't been
   * specified, heuristics are used. If the model is empty, the width is
   * the {@code fixedCellWidth}, if greater than {@code 0}, or a hard-coded
   * value of {@code 256}. The height is the {@code fixedCellHeight} multiplied
   * by {@code visibleRowCount}, if {@code fixedCellHeight} is greater than
   * {@code 0}, otherwise it is a hard-coded value of {@code 16} multiplied by
   * {@code visibleRowCount}.
   * <p>
   * If the model isn't empty, the width is the preferred size's width,
   * typically the width of the widest list element. The height is the
   * height of the cell with index 0 multiplied by the {@code visibleRowCount},
   * plus the list's vertical insets.
   * <p>
   * <b>{@code VERTICAL_WRAP} or {@code HORIZONTAL_WRAP}:</b>
   * <br>
   * This method simply returns the value from {@code getPreferredSize}.
   * The list's {@code ListUI} is expected to override {@code getPreferredSize}
   * to return an appropriate value.
   *
   * @return a dimension containing the size of the viewport needed
   *          to display {@code visibleRowCount} rows
   * @see #getPreferredScrollableViewportSize
   * @see #setPrototypeCellValue
   */
  getPreferredScrollableViewportSize(): Dimension {
    if (this.getLayoutOrientation() !== JList.VERTICAL) {
      return this.getPreferredSize$();
    }
    let insets = this.getInsets$();
    let dx = (insets.left + insets.right) | 0;
    let dy = (insets.top + insets.bottom) | 0;
    let visibleRowCount = this.getVisibleRowCount();
    let fixedCellWidth = this.getFixedCellWidth();
    let fixedCellHeight = this.getFixedCellHeight();
    if ((fixedCellWidth > 0) && (fixedCellHeight > 0)) {
      let width = (fixedCellWidth + dx) | 0;
      let height = ((Math.imul(visibleRowCount, fixedCellHeight)) + dy) | 0;
      return new Dimension()._Dimension$int$int(width, height);
    } else if (this.getModel().getSize() > 0) {
      let width = this.getPreferredSize$().width_;
      let height: number;
      let r = this.getCellBounds(0, 0);
      if (r != null) {
        height = ((Math.imul(visibleRowCount, r.height_)) + dy) | 0;
      } else {
        height = 1;
      }
      return new Dimension()._Dimension$int$int(width, height);
    } else {
      fixedCellWidth = (fixedCellWidth > 0) ? fixedCellWidth : 256;
      fixedCellHeight = (fixedCellHeight > 0) ? fixedCellHeight : 16;
      return new Dimension()._Dimension$int$int(fixedCellWidth, Math.imul(fixedCellHeight, visibleRowCount));
    }
  }
  /**
   * Returns the distance to scroll to expose the next or previous
   * row (for vertical scrolling) or column (for horizontal scrolling).
   * <p>
   * For horizontal scrolling, if the layout orientation is {@code VERTICAL},
   * then the list's font size is returned (or {@code 1} if the font is
   * {@code null}).
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation {@code SwingConstants.HORIZONTAL} or
   *                    {@code SwingConstants.VERTICAL}
   * @param direction less or equal to zero to scroll up/back,
   *                  greater than zero for down/forward
   * @return the "unit" increment for scrolling in the specified direction;
   *         always positive
   * @see #getScrollableBlockIncrement
   * @see Scrollable#getScrollableUnitIncrement
   * @throws IllegalArgumentException if {@code visibleRect} is {@code null}, or
   *         {@code orientation} isn't one of {@code SwingConstants.VERTICAL} or
   *         {@code SwingConstants.HORIZONTAL}
   */
  getScrollableUnitIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    this.checkScrollableParameters(visibleRect, orientation);
    if (orientation === SwingConstants.VERTICAL) {
      let row = this.locationToIndex(visibleRect.getLocation());
      if (row === -1) {
        return 0;
      } else {
        if (direction > 0) {
          let r = this.getCellBounds(row, row);
          return (r == null) ? 0 : (r.height_ - (visibleRect.y_ - r.y_)) | 0;
        } else {
          let r = this.getCellBounds(row, row);
          if ((r.y_ === visibleRect.y_) && (row === 0)) {
            return 0;
          } else if (r.y_ === visibleRect.y_) {
            let loc = r.getLocation();
            loc.y_--;
            let prevIndex = this.locationToIndex(loc);
            let prevR = this.getCellBounds(prevIndex, prevIndex);
            if (prevR == null || prevR.y_ >= r.y_) {
              return 0;
            }
            return prevR.height_;
          } else {
            return (visibleRect.y_ - r.y_) | 0;
          }
        }
      }
    } else if (orientation === SwingConstants.HORIZONTAL && this.getLayoutOrientation() !== JList.VERTICAL) {
      let leftToRight = this.getComponentOrientation().isLeftToRight();
      let index: number;
      let leadingPoint: Point;
      if (leftToRight) {
        leadingPoint = visibleRect.getLocation();
      } else {
        leadingPoint = new Point()._Point$int$int((visibleRect.x_ + visibleRect.width_ - 1) | 0, visibleRect.y_);
      }
      index = this.locationToIndex(leadingPoint);
      if (index !== -1) {
        let cellBounds = this.getCellBounds(index, index);
        if (cellBounds != null && cellBounds.contains$Point(leadingPoint)) {
          let leadingVisibleEdge: number;
          let leadingCellEdge: number;
          if (leftToRight) {
            leadingVisibleEdge = visibleRect.x_;
            leadingCellEdge = cellBounds.x_;
          } else {
            leadingVisibleEdge = (visibleRect.x_ + visibleRect.width_) | 0;
            leadingCellEdge = (cellBounds.x_ + cellBounds.width_) | 0;
          }
          if (leadingCellEdge !== leadingVisibleEdge) {
            if (direction < 0) {
              return Math.abs((leadingVisibleEdge - leadingCellEdge) | 0);
            } else if (leftToRight) {
              return (leadingCellEdge + cellBounds.width_ - leadingVisibleEdge) | 0;
            } else {
              return (leadingVisibleEdge - cellBounds.x_) | 0;
            }
          }
          return cellBounds.width_;
        }
      }
    }
    let f = this.getFont();
    return (f != null) ? f.getSize() : 1;
  }
  /**
   * Returns the distance to scroll to expose the next or previous block.
   * <p>
   * For vertical scrolling, the following rules are used:
   * <ul>
   * <li>if scrolling down, returns the distance to scroll so that the last
   * visible element becomes the first completely visible element
   * <li>if scrolling up, returns the distance to scroll so that the first
   * visible element becomes the last completely visible element
   * <li>returns {@code visibleRect.height} if the list is empty
   * </ul>
   * <p>
   * For horizontal scrolling, when the layout orientation is either
   * {@code VERTICAL_WRAP} or {@code HORIZONTAL_WRAP}:
   * <ul>
   * <li>if scrolling right, returns the distance to scroll so that the
   * last visible element becomes
   * the first completely visible element
   * <li>if scrolling left, returns the distance to scroll so that the first
   * visible element becomes the last completely visible element
   * <li>returns {@code visibleRect.width} if the list is empty
   * </ul>
   * <p>
   * For horizontal scrolling and {@code VERTICAL} orientation,
   * returns {@code visibleRect.width}.
   * <p>
   * Note that the value of {@code visibleRect} must be the equal to
   * {@code this.getVisibleRect()}.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation {@code SwingConstants.HORIZONTAL} or
   *                    {@code SwingConstants.VERTICAL}
   * @param direction less or equal to zero to scroll up/back,
   *                  greater than zero for down/forward
   * @return the "block" increment for scrolling in the specified direction;
   *         always positive
   * @see #getScrollableUnitIncrement
   * @see Scrollable#getScrollableBlockIncrement
   * @throws IllegalArgumentException if {@code visibleRect} is {@code null}, or
   *         {@code orientation} isn't one of {@code SwingConstants.VERTICAL} or
   *         {@code SwingConstants.HORIZONTAL}
   */
  getScrollableBlockIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    this.checkScrollableParameters(visibleRect, orientation);
    if (orientation === SwingConstants.VERTICAL) {
      let inc = visibleRect.height_;
      if (direction > 0) {
        let last = this.locationToIndex(new Point()._Point$int$int(visibleRect.x_, (visibleRect.y_ + visibleRect.height_ - 1) | 0));
        if (last !== -1) {
          let lastRect = this.getCellBounds(last, last);
          if (lastRect != null) {
            inc = (lastRect.y_ - visibleRect.y_) | 0;
            if ((inc === 0) && (last < ((this.getModel().getSize() - 1) | 0))) {
              inc = lastRect.height_;
            }
          }
        }
      } else {
        let newFirst = this.locationToIndex(new Point()._Point$int$int(visibleRect.x_, (visibleRect.y_ - visibleRect.height_) | 0));
        let first = this.getFirstVisibleIndex();
        if (newFirst !== -1) {
          if (first === -1) {
            first = this.locationToIndex(visibleRect.getLocation());
          }
          let newFirstRect = this.getCellBounds(newFirst, newFirst);
          let firstRect = this.getCellBounds(first, first);
          if ((newFirstRect != null) && (firstRect != null)) {
            while ((((newFirstRect.y_ + visibleRect.height_) | 0) < ((firstRect.y_ + firstRect.height_) | 0)) && (newFirstRect.y_ < firstRect.y_)) {
              newFirst++;
              newFirstRect = this.getCellBounds(newFirst, newFirst);
            }
            inc = (visibleRect.y_ - newFirstRect.y_) | 0;
            if ((inc <= 0) && (newFirstRect.y_ > 0)) {
              newFirst--;
              newFirstRect = this.getCellBounds(newFirst, newFirst);
              if (newFirstRect != null) {
                inc = (visibleRect.y_ - newFirstRect.y_) | 0;
              }
            }
          }
        }
      }
      return inc;
    } else if (orientation === SwingConstants.HORIZONTAL && this.getLayoutOrientation() !== JList.VERTICAL) {
      let leftToRight = this.getComponentOrientation().isLeftToRight();
      let inc = visibleRect.width_;
      if (direction > 0) {
        let x = (visibleRect.x_ + (leftToRight ? ((visibleRect.width_ - 1) | 0) : 0)) | 0;
        let last = this.locationToIndex(new Point()._Point$int$int(x, visibleRect.y_));
        if (last !== -1) {
          let lastRect = this.getCellBounds(last, last);
          if (lastRect != null) {
            if (leftToRight) {
              inc = (lastRect.x_ - visibleRect.x_) | 0;
            } else {
              inc = (visibleRect.x_ + visibleRect.width_ - (lastRect.x_ + lastRect.width_)) | 0;
            }
            if (inc < 0) {
              inc = (inc + lastRect.width_) | 0;
            } else if ((inc === 0) && (last < ((this.getModel().getSize() - 1) | 0))) {
              inc = lastRect.width_;
            }
          }
        }
      } else {
        let x = (visibleRect.x_ + (leftToRight ? -visibleRect.width_ : (visibleRect.width_ - 1 + visibleRect.width_) | 0)) | 0;
        let first = this.locationToIndex(new Point()._Point$int$int(x, visibleRect.y_));
        if (first !== -1) {
          let firstRect = this.getCellBounds(first, first);
          if (firstRect != null) {
            let firstRight = (firstRect.x_ + firstRect.width_) | 0;
            if (leftToRight) {
              if ((firstRect.x_ < ((visibleRect.x_ - visibleRect.width_) | 0)) && (firstRight < visibleRect.x_)) {
                inc = (visibleRect.x_ - firstRight) | 0;
              } else {
                inc = (visibleRect.x_ - firstRect.x_) | 0;
              }
            } else {
              let visibleRight = (visibleRect.x_ + visibleRect.width_) | 0;
              if ((firstRight > ((visibleRight + visibleRect.width_) | 0)) && (firstRect.x_ > visibleRight)) {
                inc = (firstRect.x_ - visibleRight) | 0;
              } else {
                inc = (firstRight - visibleRight) | 0;
              }
            }
          }
        }
      }
      return inc;
    }
    return visibleRect.width_;
  }
  /**
   * Returns {@code true} if this {@code JList} is displayed in a
   * {@code JViewport} and the viewport is wider than the list's
   * preferred width, or if the layout orientation is {@code HORIZONTAL_WRAP}
   * and {@code visibleRowCount <= 0}; otherwise returns {@code false}.
   * <p>
   * If {@code false}, then don't track the viewport's width. This allows
   * horizontal scrolling if the {@code JViewport} is itself embedded in a
   * {@code JScrollPane}.
   *
   * @return whether or not an enclosing viewport should force the list's
   *         width to match its own
   * @see Scrollable#getScrollableTracksViewportWidth
   */
  getScrollableTracksViewportWidth(): boolean {
    if (this.getLayoutOrientation() === JList.HORIZONTAL_WRAP && this.getVisibleRowCount() <= 0) {
      return true;
    }
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      return parent.getWidth() > this.getPreferredSize$().width_;
    }
    return false;
  }
  /**
   * Returns {@code true} if this {@code JList} is displayed in a
   * {@code JViewport} and the viewport is taller than the list's
   * preferred height, or if the layout orientation is {@code VERTICAL_WRAP}
   * and {@code visibleRowCount <= 0}; otherwise returns {@code false}.
   * <p>
   * If {@code false}, then don't track the viewport's height. This allows
   * vertical scrolling if the {@code JViewport} is itself embedded in a
   * {@code JScrollPane}.
   *
   * @return whether or not an enclosing viewport should force the list's
   *         height to match its own
   * @see Scrollable#getScrollableTracksViewportHeight
   */
  getScrollableTracksViewportHeight(): boolean {
    if (this.getLayoutOrientation() === JList.VERTICAL_WRAP && this.getVisibleRowCount() <= 0) {
      return true;
    }
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      return parent.getHeight() > this.getPreferredSize$().height_;
    }
    return false;
  }
  /**
   * Returns a {@code String} representation of this {@code JList}.
   * This method is intended to be used only for debugging purposes,
   * and the content and format of the returned {@code String} may vary
   * between implementations. The returned {@code String} may be empty,
   * but may not be {@code null}.
   *
   * @return  a {@code String} representation of this {@code JList}.
   */
  paramString(): string {
    let selectionForegroundString = (this.selectionForeground != null ? this.selectionForeground.toString() : '');
    let selectionBackgroundString = (this.selectionBackground != null ? this.selectionBackground.toString() : '');
    return super.paramString() + ',fixedCellHeight=' + this.fixedCellHeight + ',fixedCellWidth=' + this.fixedCellWidth + ',horizontalScrollIncrement=' + this.horizontalScrollIncrement + ',selectionBackground=' + selectionBackgroundString + ',selectionForeground=' + selectionForegroundString + ',visibleRowCount=' + this.visibleRowCount + ',layoutOrientation=' + this.layoutOrientation;
  }
  /**
   * Gets the {@code AccessibleContext} associated with this {@code JList}.
   * For {@code JList}, the {@code AccessibleContext} takes the form of an
   * {@code AccessibleJList}.
   * <p>
   * A new {@code AccessibleJList} instance is created if necessary.
   *
   * @return an {@code AccessibleJList} that serves as the
   *         {@code AccessibleContext} of this {@code JList}
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JList$AccessibleJList().$o(this)._JList$AccessibleJList();
    }
    return this.accessibleContext;
  }
}

/**
 * A subclass of <code>TransferHandler.DropLocation</code> representing
 * a drop location for a <code>JList</code>.
 *
 * @see #getDropLocation
 * @since 1.6
 */
export class JList$DropLocation extends TransferHandler$DropLocation {
  index_: number = 0;
  isInsert_: boolean = false;
  _JList$DropLocation(p: Point, index: number, isInsert: boolean): this {
    this._TransferHandler$DropLocation(p);
    this.index_ = index;
    this.isInsert_ = isInsert;
    return this;
  }
  /**
   * Returns the index where dropped data should be placed in the
   * list. Interpretation of the value depends on the drop mode set on
   * the associated component. If the drop mode is either
   * <code>DropMode.USE_SELECTION</code> or <code>DropMode.ON</code>,
   * the return value is an index of a row in the list. If the drop mode is
   * <code>DropMode.INSERT</code>, the return value refers to the index
   * where the data should be inserted. If the drop mode is
   * <code>DropMode.ON_OR_INSERT</code>, the value of
   * <code>isInsert()</code> indicates whether the index is an index
   * of a row, or an insert index.
   * <p>
   * <code>-1</code> indicates that the drop occurred over empty space,
   * and no index could be calculated.
   *
   * @return the drop index
   */
  getIndex(): number {
    return this.index_;
  }
  /**
   * Returns whether or not this location represents an insert
   * location.
   *
   * @return whether or not this is an insert location
   */
  isInsert(): boolean {
    return this.isInsert_;
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
    return $J.getClass(this).getName() + '[dropPoint=' + $J.str(this.getDropPoint()) + ',index=' + this.index_ + ',insert=' + this.isInsert_ + ']';
  }
}

export class JList$ListSelectionHandler extends JObject {
  _JList$ListSelectionHandler(): this {
    return this;
  }
  valueChanged(e: ListSelectionEvent): void {
    this.$outer.fireSelectionValueChanged(e.getFirstIndex(), e.getLastIndex(), e.getValueIsAdjusting());
  }
}

/**
 * This class implements accessibility support for the
 * {@code JList} class. It provides an implementation of the
 * Java Accessibility API appropriate to list user-interface
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
export class JList$AccessibleJList extends JComponent$AccessibleJComponent {
  leadSelectionIndex: number = 0;
  /**
   * Constructs an {@code AccessibleJList}.
   */
  _JList$AccessibleJList(): this {
    this._JComponent$AccessibleJComponent();
    this.$outer.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    this.$outer.getSelectionModel().addListSelectionListener($J.fn(this, 'valueChanged'));
    this.$outer.getModel().addListDataListener(this);
    this.leadSelectionIndex = this.$outer.getLeadSelectionIndex();
    return this;
  }
  /**
   * Property Change Listener change method. Used to track changes
   * to the DataModel and ListSelectionModel, in order to re-set
   * listeners to those for reporting changes there via the Accessibility
   * PropertyChange mechanism.
   *
   * @param e PropertyChangeEvent
   */
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    let oldValue = e.getOldValue();
    let newValue = e.getNewValue();
    var oldModel, newModel;
    if ($J.equals(name, 'model')) {
      var oldModel;
      if ($J.isa((oldModel = oldValue), ListModel)) {
        oldModel.removeListDataListener(this);
      }
      var newModel;
      if ($J.isa((newModel = newValue), ListModel)) {
        newModel.addListDataListener(this);
      }
    } else if ($J.equals(name, 'selectionModel')) {
      var oldModel;
      if ($J.isa((oldModel = oldValue), ListSelectionModel)) {
        oldModel.removeListSelectionListener($J.fn(this, 'valueChanged'));
      }
      var newModel;
      if ($J.isa((newModel = newValue), ListSelectionModel)) {
        newModel.addListSelectionListener($J.fn(this, 'valueChanged'));
      }
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY, false, true);
    }
  }
  /**
   * List Selection Listener value change method. Used to fire
   * the property change
   *
   * @param e ListSelectionEvent
   */
  valueChanged(e: ListSelectionEvent): void {
    let oldLeadSelectionIndex = this.leadSelectionIndex;
    this.leadSelectionIndex = this.$outer.getLeadSelectionIndex();
    if (oldLeadSelectionIndex !== this.leadSelectionIndex) {
      let oldLS: Accessible;
      let newLS: Accessible;
      oldLS = (oldLeadSelectionIndex >= 0) ? this.getAccessibleChild(oldLeadSelectionIndex) : null;
      newLS = (this.leadSelectionIndex >= 0) ? this.getAccessibleChild(this.leadSelectionIndex) : null;
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_ACTIVE_DESCENDANT_PROPERTY, oldLS, newLS);
    }
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY, false, true);
    let s = this.getAccessibleStateSet$();
    let lsm = this.$outer.getSelectionModel();
    if (lsm.getSelectionMode() !== ListSelectionModel.SINGLE_SELECTION) {
      if (!s.contains(AccessibleState.MULTISELECTABLE)) {
        s.add(AccessibleState.MULTISELECTABLE);
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.MULTISELECTABLE);
      }
    } else {
      if (s.contains(AccessibleState.MULTISELECTABLE)) {
        s.remove(AccessibleState.MULTISELECTABLE);
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.MULTISELECTABLE, null);
      }
    }
  }
  /**
   * List Data Listener interval added method. Used to fire the visible data property change
   *
   * @param e ListDataEvent
   */
  intervalAdded(e: ListDataEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
  }
  /**
   * List Data Listener interval removed method. Used to fire the visible data property change
   *
   * @param e ListDataEvent
   */
  intervalRemoved(e: ListDataEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
  }
  /**
   * List Data Listener contents changed method. Used to fire the visible data property change
   *
   * @param e ListDataEvent
   */
  contentsChanged(e: ListDataEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
  }
  /**
   * Get the state set of this object.
   *
   * @return an instance of AccessibleState containing the current state
   * of the object
   * @see AccessibleState
   */
  getAccessibleStateSet$(): AccessibleStateSet {
    let states = super.getAccessibleStateSet$();
    if (this.$outer.selectionModel.getSelectionMode() !== ListSelectionModel.SINGLE_SELECTION) {
      states.add(AccessibleState.MULTISELECTABLE);
    }
    return states;
  }
  /**
   * Returns the number of accessible children in the object.  If all
   * of the children of this object implement Accessible, than this
   * method should return the number of children of this object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    return this.$outer.getModel().getSize();
  }
  /**
   * Return the nth Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    if (i >= this.$outer.getModel().getSize()) {
      return null;
    } else {
      return new JList$AccessibleJList$AccessibleJListChild().$o(this)._JList$AccessibleJList$AccessibleJListChild(this.$outer, i);
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
   * Returns the number of items currently selected.
   * If no items are selected, the return value will be 0.
   *
   * @return the number of items currently selected.
   */
  getAccessibleSelectionCount(): number {
    return this.$outer.getSelectedIndices().length;
  }
  /**
   * Returns an Accessible representing the specified selected item
   * in the object.  If there isn't a selection, or there are
   * fewer items selected than the integer passed in, the return
   * value will be <code>null</code>.
   *
   * @param i the zero-based index of selected items
   * @return an Accessible containing the selected item
   */
  getAccessibleSelection$int(i: number): Accessible {
    let len = this.getAccessibleSelectionCount();
    if (i < 0 || i >= len) {
      return null;
    } else {
      return this.getAccessibleChild(this.$outer.getSelectedIndices()[i]);
    }
  }
  /**
   * Returns true if the current child of this object is selected.
   *
   * @param i the zero-based index of the child in this Accessible
   * object.
   * @see AccessibleContext#getAccessibleChild
   */
  isAccessibleChildSelected(i: number): boolean {
    return this.$outer.isSelectedIndex(i);
  }
}

/**
 * This class implements accessibility support appropriate
 * for list children.
 */
export class JList$AccessibleJList$AccessibleJListChild extends AccessibleContext {
  parent: JList<E> = null;
  indexInParent: number = 0;
  component: Component = null;
  accessibleContext: AccessibleContext = null;
  listModel: ListModel<E> = null;
  cellRenderer: ListCellRenderer<any> = null;
  /**
   * Constructs an {@code AccessibleJListChild}.
   * @param parent the parent
   * @param indexInParent the index in the parent
   */
  _JList$AccessibleJList$AccessibleJListChild(parent: JList<E>, indexInParent: number): this {
    this._AccessibleContext();
    this.parent = null;
    this.component = null;
    this.accessibleContext = null;
    this.cellRenderer = null;
    this.parent = parent;
    this.setAccessibleParent(parent);
    this.indexInParent = indexInParent;
    if (parent != null) {
      this.listModel = parent.getModel();
      this.cellRenderer = parent.getCellRenderer();
    }
    return this;
  }
  getCurrentAccessibleContext(): AccessibleContext {
    let c = this.getComponentAtIndex(this.indexInParent);
    if ($J.isa(c, Accessible)) {
      return c.getAccessibleContext();
    } else {
      return null;
    }
  }
  getComponentAtIndex(index: number): Component {
    if (index < 0 || index >= this.listModel.getSize()) {
      return null;
    }
    if ((this.parent != null) && (this.listModel != null) && this.cellRenderer != null) {
      let value = this.listModel.getElementAt(index);
      let isSelected = this.parent.isSelectedIndex(index);
      let isFocussed = this.parent.isFocusOwner() && (index === this.parent.getLeadSelectionIndex());
      return this.cellRenderer.getListCellRendererComponent(this.parent, value, index, isSelected, isFocussed);
    } else {
      return null;
    }
  }
  /**
   * Get the AccessibleContext for this object. In the
   * implementation of the Java Accessibility API for this class,
   * returns this object, which is its own AccessibleContext.
   *
   * @return this object
   */
  getAccessibleContext(): AccessibleContext {
    return this;
  }
  getAccessibleName(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleName();
    } else {
      return null;
    }
  }
  setAccessibleName(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleName(s);
    }
  }
  getAccessibleDescription(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleDescription();
    } else {
      return null;
    }
  }
  setAccessibleDescription(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleDescription(s);
    }
  }
  getAccessibleIndexInParent(): number {
    return this.indexInParent;
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
    let ac = this.getCurrentAccessibleContext();
    return ac != null ? ac.getAccessibleSelection$() : null;
  }
}

let $JList$1: any = null;
/** An anonymous class (JList.java:487). */
function JList$1(): any {
  return $JList$1 ??= $J.local(class extends AbstractListModel {
    getSize(): number {
      return this.$cv_listData.length;
    }
    getElementAt(i: number): E {
      return this.$cv_listData[i];
    }
    $c($listData): this {
      this.$cv_listData = $listData;
      return this;
    }
  }, 'javax.swing.JList$1', []);
}

let $JList$3: any = null;
/** An anonymous class (JList.java:524). */
function JList$3(): any {
  return $JList$3 ??= $J.local(class extends AbstractListModel {
    getSize(): number {
      return 0;
    }
    getElementAt(i: number): E {
      throw new IndexOutOfBoundsException('No Data Model');
    }
  }, 'javax.swing.JList$3', []);
}

let $JList$4: any = null;
/** An anonymous class (JList.java:1731). */
function JList$4(): any {
  return $JList$4 ??= $J.local(class extends AbstractListModel {
    getSize(): number {
      return this.$cv_listData.length;
    }
    getElementAt(i: number): E {
      return this.$cv_listData[i];
    }
    $c($listData): this {
      this.$cv_listData = $listData;
      return this;
    }
  }, 'javax.swing.JList$4', []);
}

$J.define(JList, 'javax.swing.JList', { kind: 'class', ifaces: ['javax.swing.Scrollable', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { '': '_JList$', 'java.util.Vector': '_JList$Vector', 'java.lang.Object[]': '_JList$ObjectArr', 'javax.swing.ListModel': '_JList$ListModel' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JList', 'setListData(java.util.Vector)': 'setListData$Vector', 'setListData(java.lang.Object[])': 'setListData$ObjectArr', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'setDropLocation(javax.swing.TransferHandler$DropLocation,java.lang.Object,boolean)': 'setDropLocation$DropLocation$Object$boolean', 'dropLocationForPoint(java.awt.Point)': 'dropLocationForPoint$Point', 'setUI(javax.swing.plaf.ListUI)': 'setUI$ListUI' } });
$J.define(JList$DropLocation, 'javax.swing.JList$DropLocation', { kind: 'class', sup: 'javax.swing.TransferHandler$DropLocation', ctors: { 'java.awt.Point,int,boolean': '_JList$DropLocation' } });
$J.define(JList$ListSelectionHandler, 'javax.swing.JList$ListSelectionHandler', { kind: 'class', ifaces: ['javax.swing.event.ListSelectionListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JList$ListSelectionHandler' }, inner: true });
$J.define(JList$AccessibleJList, 'javax.swing.JList$AccessibleJList', { kind: 'class', ifaces: ['javax.accessibility.AccessibleSelection', 'java.beans.PropertyChangeListener', 'javax.swing.event.ListSelectionListener', 'javax.swing.event.ListDataListener'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JList$AccessibleJList' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleRole()': 'getAccessibleRole$', 'getAccessibleStateSet()': 'getAccessibleStateSet$' }, inner: true });
$J.define(JList$AccessibleJList$AccessibleJListChild, 'javax.swing.JList$AccessibleJList$AccessibleJListChild', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.accessibility.AccessibleComponent', 'javax.accessibility.AccessibleAction'], sup: 'javax.accessibility.AccessibleContext', ctors: { 'javax.swing.JList,int': '_JList$AccessibleJList$AccessibleJListChild' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Component = $J.load('java.awt.Component');
  Dimension = $J.load('java.awt.Dimension');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  Point = $J.load('java.awt.Point');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  AbstractListModel = $J.load('javax.swing.AbstractListModel');
  DefaultListSelectionModel = $J.load('javax.swing.DefaultListSelectionModel');
  DropMode = $J.load('javax.swing.DropMode');
  JViewport = $J.load('javax.swing.JViewport');
  ListModel = $J.load('javax.swing.ListModel');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ToolTipManager = $J.load('javax.swing.ToolTipManager');
  UIManager = $J.load('javax.swing.UIManager');
  ListSelectionEvent = $J.load('javax.swing.event.ListSelectionEvent');
  ListSelectionListener = $J.load('javax.swing.event.ListSelectionListener');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
  SwingUtilities2$Section = $J.load('sun.swing.SwingUtilities2$Section');
});
