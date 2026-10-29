// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicComboPopup.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Toolkit } from '../../../../../jre/index.ts';
import { JPopupMenu } from '../../JPopupMenu.ts';

let Color, Point, Rectangle, FocusEvent$Cause, ItemEvent, MouseEvent, BoxLayout, JComponent, JList, JScrollPane, ListSelectionModel, MenuSelectionManager, ScrollPaneConstants, SwingUtilities, Timer, UIManager, LineBorder, BasicGraphicsUtils, AWTAccessor;

/**
 * This is a basic implementation of the <code>ComboPopup</code> interface.
 *
 * This class represents the ui for the popup portion of the combo box.
 * <p>
 * All event handling is handled by listener classes created with the
 * <code>createxxxListener()</code> methods and internal classes.
 * You can change the behavior of this class by overriding the
 * <code>createxxxListener()</code> methods and supplying your own
 * event listeners or subclassing from the ones supplied in this class.
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
 * @author Tom Santos
 * @author Mark Davidson
 */
export class BasicComboPopup extends JPopupMenu {
  static EmptyListModel: ListModel<any> = null;
  static LIST_BORDER: Border = null;
  /**
   * The instance of {@code JComboBox}.
   */
  comboBox: JComboBox<any> = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor methods instead.
   *
   * @see #getList
   * @see #createList
   */
  list: JList<any> = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead
   *
   * @see #createScroller
   */
  scroller: JScrollPane = null;
  /**
   * As of Java 2 platform v1.4 this previously undocumented field is no
   * longer used.
   */
  valueIsAdjusting: boolean = false;
  /**
   * Implementation of all the listener classes.
   */
  handler: BasicComboPopup$Handler = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor or create methods instead.
   *
   * @see #getMouseMotionListener
   * @see #createMouseMotionListener
   */
  mouseMotionListener$BasicComboPopup: MouseMotionListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor or create methods instead.
   *
   * @see #getMouseListener
   * @see #createMouseListener
   */
  mouseListener$BasicComboPopup: MouseListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the accessor or create methods instead.
   *
   * @see #getKeyListener
   * @see #createKeyListener
   */
  keyListener$BasicComboPopup: KeyListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead.
   *
   * @see #createListSelectionListener
   */
  listSelectionListener: ListSelectionListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead.
   *
   * @see #createListMouseListener
   */
  listMouseListener: MouseListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead
   *
   * @see #createListMouseMotionListener
   */
  listMouseMotionListener: MouseMotionListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead
   *
   * @see #createPropertyChangeListener
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead
   *
   * @see #createListDataListener
   */
  listDataListener: ListDataListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override. Use the create method instead
   *
   * @see #createItemListener
   */
  itemListener: ItemListener = null;
  scrollerMouseWheelListener: MouseWheelListener = null;
  /**
   * This protected field is implementation specific. Do not access directly
   * or override.
   */
  autoscrollTimer: Timer = null;
  /**
   * {@code true} if the mouse cursor is in the popup.
   */
  hasEntered: boolean = false;
  /**
   * If {@code true} the auto-scrolling is enabled.
   */
  isAutoScrolling: boolean = false;
  /**
   * The direction of scrolling.
   */
  scrollDirection: number = 0;
  /**
   * The direction of scrolling up.
   */
  static readonly SCROLL_UP: number = 0;
  /**
   * The direction of scrolling down.
   */
  static readonly SCROLL_DOWN: number = 1;
  /**
   * Constructs a new instance of {@code BasicComboPopup}.
   *
   * @param combo an instance of {@code JComboBox}
   */
  _BasicComboPopup(combo: JComboBox<any>): this {
    this._JPopupMenu$();
    this.valueIsAdjusting = false;
    this.hasEntered = false;
    this.isAutoScrolling = false;
    this.scrollDirection = BasicComboPopup.SCROLL_UP;
    this.setName('ComboPopup.popup');
    this.comboBox = combo;
    this.setLightWeightPopupEnabled(this.comboBox.isLightWeightPopupEnabled());
    this.list = this.createList();
    this.list.setName('ComboBox.list');
    this.configureList();
    this.scroller = this.createScroller();
    this.scroller.setName('ComboBox.scrollPane');
    this.configureScroller();
    this.configurePopup();
    this.installComboBoxListeners();
    this.installKeyboardActions();
    return this;
  }
  /**
   * Implementation of ComboPopup.show().
   */
  show$(): void {
    this.comboBox.firePopupMenuWillBecomeVisible();
    this.setListSelection(this.comboBox.getSelectedIndex());
    let location = this.getPopupLocation$$BasicComboPopup();
    this.show$Component$int$int(this.comboBox, location.x_, location.y_);
  }
  /**
   * Implementation of ComboPopup.hide().
   */
  hide(): void {
    let manager = MenuSelectionManager.defaultManager();
    let selection = manager.getSelectedPath();
    for (let i = 0; i < selection.length; i++) {
      if (selection[i] === this) {
        manager.clearSelectedPath();
        break;
      }
    }
    if (selection.length > 0) {
      this.comboBox.repaint$();
    }
  }
  /**
   * Implementation of ComboPopup.getList().
   */
  getList(): JList<any> {
    return this.list;
  }
  /**
   * Implementation of ComboPopup.getMouseListener().
   *
   * @return a <code>MouseListener</code> or null
   * @see ComboPopup#getMouseListener
   */
  getMouseListener(): MouseListener {
    if (this.mouseListener$BasicComboPopup == null) {
      this.mouseListener$BasicComboPopup = this.createMouseListener();
    }
    return this.mouseListener$BasicComboPopup;
  }
  /**
   * Implementation of ComboPopup.getMouseMotionListener().
   *
   * @return a <code>MouseMotionListener</code> or null
   * @see ComboPopup#getMouseMotionListener
   */
  getMouseMotionListener(): MouseMotionListener {
    if (this.mouseMotionListener$BasicComboPopup == null) {
      this.mouseMotionListener$BasicComboPopup = this.createMouseMotionListener();
    }
    return this.mouseMotionListener$BasicComboPopup;
  }
  /**
   * Implementation of ComboPopup.getKeyListener().
   *
   * @return a <code>KeyListener</code> or null
   * @see ComboPopup#getKeyListener
   */
  getKeyListener(): KeyListener {
    if (this.keyListener$BasicComboPopup == null) {
      this.keyListener$BasicComboPopup = this.createKeyListener();
    }
    return this.keyListener$BasicComboPopup;
  }
  /**
   * Called when the UI is uninstalling.  Since this popup isn't in the component
   * tree, it won't get it's uninstallUI() called.  It removes the listeners that
   * were added in addComboBoxListeners().
   */
  uninstallingUI(): void {
    if (this.propertyChangeListener != null) {
      this.comboBox.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if (this.itemListener != null) {
      this.comboBox.removeItemListener(this.itemListener);
    }
    this.uninstallComboBoxModelListeners(this.comboBox.getModel());
    this.uninstallKeyboardActions();
    this.uninstallListListeners();
    this.uninstallScrollerListeners();
    this.list.setModel(BasicComboPopup.EmptyListModel);
  }
  /**
   * Removes the listeners from the combo box model
   *
   * @param model The combo box model to install listeners
   * @see #installComboBoxModelListeners
   */
  uninstallComboBoxModelListeners(model: ComboBoxModel<any>): void {
    if (model != null && this.listDataListener != null) {
      model.removeListDataListener(this.listDataListener);
    }
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
  }
  firePopupMenuWillBecomeVisible(): void {
    if (this.scrollerMouseWheelListener != null) {
      this.comboBox.addMouseWheelListener(this.scrollerMouseWheelListener);
    }
    super.firePopupMenuWillBecomeVisible();
  }
  firePopupMenuWillBecomeInvisible(): void {
    if (this.scrollerMouseWheelListener != null) {
      this.comboBox.removeMouseWheelListener(this.scrollerMouseWheelListener);
    }
    super.firePopupMenuWillBecomeInvisible();
    this.comboBox.firePopupMenuWillBecomeInvisible();
  }
  firePopupMenuCanceled(): void {
    if (this.scrollerMouseWheelListener != null) {
      this.comboBox.removeMouseWheelListener(this.scrollerMouseWheelListener);
    }
    super.firePopupMenuCanceled();
    this.comboBox.firePopupMenuCanceled();
  }
  /**
   * Creates a listener
   * that will watch for mouse-press and release events on the combo box.
   *
   * <strong>Warning:</strong>
   * When overriding this method, make sure to maintain the existing
   * behavior.
   *
   * @return a <code>MouseListener</code> which will be added to
   * the combo box or null
   */
  createMouseListener(): MouseListener {
    return this.getHandler();
  }
  /**
   * Creates the mouse motion listener which will be added to the combo
   * box.
   *
   * <strong>Warning:</strong>
   * When overriding this method, make sure to maintain the existing
   * behavior.
   *
   * @return a <code>MouseMotionListener</code> which will be added to
   *         the combo box or null
   */
  createMouseMotionListener(): MouseMotionListener {
    return this.getHandler();
  }
  /**
   * Creates the key listener that will be added to the combo box. If
   * this method returns null then it will not be added to the combo box.
   *
   * @return a <code>KeyListener</code> or null
   */
  createKeyListener(): KeyListener {
    return null;
  }
  /**
   * Creates a list selection listener that watches for selection changes in
   * the popup's list.  If this method returns null then it will not
   * be added to the popup list.
   *
   * @return an instance of a <code>ListSelectionListener</code> or null
   */
  createListSelectionListener(): ListSelectionListener {
    return null;
  }
  /**
   * Creates a list data listener which will be added to the
   * <code>ComboBoxModel</code>. If this method returns null then
   * it will not be added to the combo box model.
   *
   * @return an instance of a <code>ListDataListener</code> or null
   */
  createListDataListener(): ListDataListener {
    return null;
  }
  /**
   * Creates a mouse listener that watches for mouse events in
   * the popup's list. If this method returns null then it will
   * not be added to the combo box.
   *
   * @return an instance of a <code>MouseListener</code> or null
   */
  createListMouseListener(): MouseListener {
    return this.getHandler();
  }
  /**
   * Creates a mouse motion listener that watches for mouse motion
   * events in the popup's list. If this method returns null then it will
   * not be added to the combo box.
   *
   * @return an instance of a <code>MouseMotionListener</code> or null
   */
  createListMouseMotionListener(): MouseMotionListener {
    return this.getHandler();
  }
  /**
   * Creates a <code>PropertyChangeListener</code> which will be added to
   * the combo box. If this method returns null then it will not
   * be added to the combo box.
   *
   * @return an instance of a <code>PropertyChangeListener</code> or null
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Creates an <code>ItemListener</code> which will be added to the
   * combo box. If this method returns null then it will not
   * be added to the combo box.
   * <p>
   * Subclasses may override this method to return instances of their own
   * ItemEvent handlers.
   *
   * @return an instance of an <code>ItemListener</code> or null
   */
  createItemListener(): ItemListener {
    return $J.fn(this.getHandler(), 'itemStateChanged');
  }
  getHandler(): BasicComboPopup$Handler {
    if (this.handler == null) {
      this.handler = new BasicComboPopup$Handler().$o(this)._BasicComboPopup$Handler();
    }
    return this.handler;
  }
  /**
   * Creates the JList used in the popup to display
   * the items in the combo box model. This method is called when the UI class
   * is created.
   *
   * @return a <code>JList</code> used to display the combo box items
   */
  createList(): JList<any> {
    return new (BasicComboPopup$1())().$o(this)._JList$ListModel(this.comboBox.getModel());
  }
  /**
   * Configures the list which is used to hold the combo box items in the
   * popup. This method is called when the UI class
   * is created.
   *
   * @see #createList
   */
  configureList(): void {
    this.list.setFont(this.comboBox.getFont());
    this.list.setForeground(this.comboBox.getForeground());
    this.list.setBackground(this.comboBox.getBackground());
    this.list.setSelectionForeground(UIManager.getColor$Object('ComboBox.selectionForeground'));
    this.list.setSelectionBackground(UIManager.getColor$Object('ComboBox.selectionBackground'));
    this.list.setBorder(null);
    this.list.setCellRenderer(this.comboBox.getRenderer());
    this.list.setFocusable(false);
    this.list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    this.setListSelection(this.comboBox.getSelectedIndex());
    this.installListListeners();
  }
  /**
   * Adds the listeners to the list control.
   */
  installListListeners(): void {
    if ((this.listMouseListener = this.createListMouseListener()) != null) {
      this.list.addMouseListener(this.listMouseListener);
    }
    if ((this.listMouseMotionListener = this.createListMouseMotionListener()) != null) {
      this.list.addMouseMotionListener(this.listMouseMotionListener);
    }
    if ((this.listSelectionListener = this.createListSelectionListener()) != null) {
      this.list.addListSelectionListener(this.listSelectionListener);
    }
  }
  uninstallListListeners(): void {
    if (this.listMouseListener != null) {
      this.list.removeMouseListener(this.listMouseListener);
      this.listMouseListener = null;
    }
    if (this.listMouseMotionListener != null) {
      this.list.removeMouseMotionListener(this.listMouseMotionListener);
      this.listMouseMotionListener = null;
    }
    if (this.listSelectionListener != null) {
      this.list.removeListSelectionListener(this.listSelectionListener);
      this.listSelectionListener = null;
    }
    this.handler = null;
  }
  /**
   * Creates the scroll pane which houses the scrollable list.
   *
   * @return the scroll pane which houses the scrollable list
   */
  createScroller(): JScrollPane {
    let sp = new JScrollPane()._JScrollPane$Component$int$int(this.list, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    sp.setHorizontalScrollBar(null);
    return sp;
  }
  /**
   * Configures the scrollable portion which holds the list within
   * the combo box popup. This method is called when the UI class
   * is created.
   */
  configureScroller(): void {
    this.scroller.setFocusable(false);
    this.scroller.getVerticalScrollBar().setFocusable(false);
    this.scroller.setBorder(null);
    this.installScrollerListeners();
  }
  /**
   * Configures the popup portion of the combo box. This method is called
   * when the UI class is created.
   */
  configurePopup(): void {
    this.setLayout(new BoxLayout()._BoxLayout$Container$int(this, BoxLayout.Y_AXIS));
    this.setBorderPainted(true);
    this.setBorder(BasicComboPopup.LIST_BORDER);
    this.setOpaque(false);
    this.add$Component(this.scroller);
    this.setDoubleBuffered(true);
    this.setFocusable(false);
  }
  installScrollerListeners(): void {
    this.scrollerMouseWheelListener = this.getHandler();
    if (this.scrollerMouseWheelListener != null) {
      this.scroller.addMouseWheelListener(this.scrollerMouseWheelListener);
    }
  }
  uninstallScrollerListeners(): void {
    if (this.scrollerMouseWheelListener != null) {
      this.scroller.removeMouseWheelListener(this.scrollerMouseWheelListener);
      this.scrollerMouseWheelListener = null;
    }
  }
  /**
   * This method adds the necessary listeners to the JComboBox.
   */
  installComboBoxListeners(): void {
    if ((this.propertyChangeListener = this.createPropertyChangeListener()) != null) {
      this.comboBox.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if ((this.itemListener = this.createItemListener()) != null) {
      this.comboBox.addItemListener(this.itemListener);
    }
    this.installComboBoxModelListeners(this.comboBox.getModel());
  }
  /**
   * Installs the listeners on the combo box model. Any listeners installed
   * on the combo box model should be removed in
   * <code>uninstallComboBoxModelListeners</code>.
   *
   * @param model The combo box model to install listeners
   * @see #uninstallComboBoxModelListeners
   */
  installComboBoxModelListeners(model: ComboBoxModel<any>): void {
    if (model != null && (this.listDataListener = this.createListDataListener()) != null) {
      model.addListDataListener(this.listDataListener);
    }
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
  }
  /**
   * Overridden to unconditionally return false.
   */
  isFocusTraversable(): boolean {
    return false;
  }
  /**
   * This protected method is implementation specific and should be private.
   * do not call or override.
   *
   * @param direction the direction of scrolling
   */
  startAutoScrolling(direction: number): void {
    if (this.isAutoScrolling) {
      this.autoscrollTimer.stop();
    }
    this.isAutoScrolling = true;
    if (direction === BasicComboPopup.SCROLL_UP) {
      this.scrollDirection = BasicComboPopup.SCROLL_UP;
      let convertedPoint = SwingUtilities.convertPoint$Component$Point$Component(this.scroller, new Point()._Point$int$int(1, 1), this.list);
      let top = this.list.locationToIndex(convertedPoint);
      this.list.setSelectedIndex(top);
      this.autoscrollTimer = new Timer()._Timer(100, $J.fn(new BasicComboPopup$AutoScrollActionHandler().$o(this)._BasicComboPopup$AutoScrollActionHandler(BasicComboPopup.SCROLL_UP), 'actionPerformed'));
    } else if (direction === BasicComboPopup.SCROLL_DOWN) {
      this.scrollDirection = BasicComboPopup.SCROLL_DOWN;
      let size = this.scroller.getSize$();
      let convertedPoint = SwingUtilities.convertPoint$Component$Point$Component(this.scroller, new Point()._Point$int$int(1, (size.height_ - 1 - 2) | 0), this.list);
      let bottom = this.list.locationToIndex(convertedPoint);
      this.list.setSelectedIndex(bottom);
      this.autoscrollTimer = new Timer()._Timer(100, $J.fn(new BasicComboPopup$AutoScrollActionHandler().$o(this)._BasicComboPopup$AutoScrollActionHandler(BasicComboPopup.SCROLL_DOWN), 'actionPerformed'));
    }
    this.autoscrollTimer.start();
  }
  /**
   * This protected method is implementation specific and should be private.
   * do not call or override.
   */
  stopAutoScrolling(): void {
    this.isAutoScrolling = false;
    if (this.autoscrollTimer != null) {
      this.autoscrollTimer.stop();
      this.autoscrollTimer = null;
    }
  }
  /**
   * This protected method is implementation specific and should be private.
   * do not call or override.
   */
  autoScrollUp(): void {
    let index = this.list.getSelectedIndex();
    if (index > 0) {
      this.list.setSelectedIndex((index - 1) | 0);
      this.list.ensureIndexIsVisible((index - 1) | 0);
    }
  }
  /**
   * This protected method is implementation specific and should be private.
   * do not call or override.
   */
  autoScrollDown(): void {
    let index = this.list.getSelectedIndex();
    let lastItem = (this.list.getModel().getSize() - 1) | 0;
    if (index < lastItem) {
      this.list.setSelectedIndex((index + 1) | 0);
      this.list.ensureIndexIsVisible((index + 1) | 0);
    }
  }
  /**
   * Gets the AccessibleContext associated with this BasicComboPopup.
   * The AccessibleContext will have its parent set to the ComboBox.
   *
   * @return an AccessibleContext for the BasicComboPopup
   * @since 1.5
   */
  getAccessibleContext(): AccessibleContext {
    let context = super.getAccessibleContext();
    context.setAccessibleParent(this.comboBox);
    return context;
  }
  /**
   * Makes the popup visible if it is hidden and makes it hidden if it is
   * visible.
   */
  togglePopup(): void {
    if (this.isVisible$()) {
      this.hide();
    } else {
      this.show$();
    }
  }
  /**
   * Sets the list selection index to the selectedIndex. This
   * method is used to synchronize the list selection with the
   * combo box selection.
   *
   * @param selectedIndex the index to set the list
   */
  setListSelection(selectedIndex: number): void {
    if (selectedIndex === -1) {
      this.list.clearSelection();
    } else {
      this.list.setSelectedIndex(selectedIndex);
      this.list.ensureIndexIsVisible(selectedIndex);
    }
  }
  /**
   * Converts mouse event.
   *
   * @param e a mouse event
   * @return converted mouse event
   */
  convertMouseEvent(e: MouseEvent): MouseEvent {
    let convertedPoint = SwingUtilities.convertPoint$Component$Point$Component(e.getSource(), e.getPoint(), this.list);
    let newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(e.getSource(), e.getID(), e.getWhen(), e.getModifiers(), convertedPoint.x_, convertedPoint.y_, e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), MouseEvent.NOBUTTON);
    let meAccessor = AWTAccessor.getMouseEventAccessor();
    meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(e));
    return newEvent;
  }
  /**
   * Retrieves the height of the popup based on the current
   * ListCellRenderer and the maximum row count.
   *
   * @param maxRowCount the row count
   * @return the height of the popup
   */
  getPopupHeightForRowCount(maxRowCount: number): number {
    let minRowCount = Math.min(maxRowCount, this.comboBox.getItemCount());
    let height = 0;
    let renderer = this.list.getCellRenderer();
    let value = null;
    for (let i = 0; i < minRowCount; ++i) {
      value = this.list.getModel().getElementAt(i);
      let c = renderer.getListCellRendererComponent(this.list, value, i, false, false);
      height = (height + c.getPreferredSize$().height_) | 0;
    }
    if (height === 0) {
      height = this.comboBox.getHeight();
    }
    let border = this.scroller.getViewportBorder();
    if (border != null) {
      let insets = border.getBorderInsets$Component(null);
      height = (height + (insets.top + insets.bottom)) | 0;
    }
    border = this.scroller.getBorder();
    if (border != null) {
      let insets = border.getBorderInsets$Component(null);
      height = (height + (insets.top + insets.bottom)) | 0;
    }
    return height;
  }
  /**
   * Calculate the placement and size of the popup portion of the combo box based
   * on the combo box location and the enclosing screen bounds. If
   * no transformations are required, then the returned rectangle will
   * have the same values as the parameters.
   *
   * @param px starting x location
   * @param py starting y location
   * @param pw starting width
   * @param ph starting height
   * @return a rectangle which represents the placement and size of the popup
   */
  computePopupBounds(px: number, py: number, pw: number, ph: number): Rectangle {
    let toolkit = Toolkit.getDefaultToolkit();
    let screenBounds: Rectangle;
    let gc = this.comboBox.getGraphicsConfiguration();
    let p = new Point()._Point$();
    SwingUtilities.convertPointFromScreen(p, this.comboBox);
    if (gc != null) {
      let screenInsets = toolkit.getScreenInsets(gc);
      screenBounds = gc.getBounds();
      screenBounds.width_ = (screenBounds.width_ - (screenInsets.left + screenInsets.right)) | 0;
      screenBounds.height_ = (screenBounds.height_ - (screenInsets.top + screenInsets.bottom)) | 0;
      screenBounds.x_ = (screenBounds.x_ + (p.x_ + screenInsets.left)) | 0;
      screenBounds.y_ = (screenBounds.y_ + (p.y_ + screenInsets.top)) | 0;
    } else {
      screenBounds = new Rectangle()._Rectangle$Point$Dimension(p, toolkit.getScreenSize());
    }
    let borderHeight = 0;
    let popupBorder = this.getBorder();
    if (popupBorder != null) {
      let borderInsets = popupBorder.getBorderInsets$Component(this);
      borderHeight = (borderInsets.top + borderInsets.bottom) | 0;
      screenBounds.width_ = (screenBounds.width_ - (borderInsets.left + borderInsets.right)) | 0;
      screenBounds.height_ = (screenBounds.height_ - borderHeight) | 0;
    }
    let rect = new Rectangle()._Rectangle$int$int$int$int(px, py, pw, ph);
    if (((py + ph) | 0) > ((screenBounds.y_ + screenBounds.height_) | 0)) {
      if (ph <= ((-screenBounds.y_ - borderHeight) | 0)) {
        rect.y_ = (-ph - borderHeight) | 0;
      } else {
        rect.y_ = (screenBounds.y_ + Math.max(0, $J.idiv(((screenBounds.height_ - ph) | 0), 2))) | 0;
        rect.height_ = Math.min(screenBounds.height_, ph);
      }
    }
    return rect;
  }
  /**
   * Calculates the upper left location of the Popup.
   */
  getPopupLocation$$BasicComboPopup(): Point {
    let popupSize = this.comboBox.getSize$();
    let insets = this.getInsets$();
    popupSize.setSize$int$int((popupSize.width_ - (insets.right + insets.left)) | 0, this.getPopupHeightForRowCount(this.comboBox.getMaximumRowCount()));
    let popupBounds = this.computePopupBounds(0, this.comboBox.getBounds$().height_, popupSize.width_, popupSize.height_);
    let scrollSize = popupBounds.getSize();
    let popupLocation = popupBounds.getLocation();
    this.scroller.setMaximumSize(scrollSize);
    this.scroller.setPreferredSize(scrollSize);
    this.scroller.setMinimumSize(scrollSize);
    this.list.revalidate();
    return popupLocation;
  }
  /**
   * A utility method used by the event listeners.  Given a mouse event, it changes
   * the list selection to the list item below the mouse.
   *
   * @param anEvent a mouse event
   * @param shouldScroll if {@code true} list should be scrolled.
   */
  updateListBoxSelectionForEvent(anEvent: MouseEvent, shouldScroll: boolean): void {
    let location = anEvent.getPoint();
    if (this.list == null) {
      return;
    }
    let index = this.list.locationToIndex(location);
    if (index === -1) {
      if (location.y_ < 0) {
        index = 0;
      } else {
        index = (this.comboBox.getModel().getSize() - 1) | 0;
      }
    }
    if (this.list.getSelectedIndex() !== index) {
      this.list.setSelectedIndex(index);
      if (shouldScroll) {
        this.list.ensureIndexIsVisible(index);
      }
    }
  }
  static $clinit() {
    BasicComboPopup.EmptyListModel = new BasicComboPopup$EmptyListModelClass()._BasicComboPopup$EmptyListModelClass();
    BasicComboPopup.LIST_BORDER = new LineBorder()._LineBorder$Color$int(Color.BLACK, 1);
  }
}

export class BasicComboPopup$EmptyListModelClass extends JObject {
  _BasicComboPopup$EmptyListModelClass(): this {
    return this;
  }
  getSize(): number {
    return 0;
  }
  getElementAt(index: number): any {
    return null;
  }
  addListDataListener(l: ListDataListener): void {
  }
  removeListDataListener(l: ListDataListener): void {
  }
}

export class BasicComboPopup$AutoScrollActionHandler extends JObject {
  direction: number = 0;
  _BasicComboPopup$AutoScrollActionHandler(direction: number): this {
    this.direction = direction;
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.direction === BasicComboPopup.SCROLL_UP) {
      this.$outer.autoScrollUp();
    } else {
      this.$outer.autoScrollDown();
    }
  }
}

export class BasicComboPopup$Handler extends JObject {
  _BasicComboPopup$Handler(): this {
    return this;
  }
  mouseClicked(e: MouseEvent): void {
  }
  mousePressed(e: MouseEvent): void {
    if (e.getSource() === this.$outer.list) {
      return;
    }
    if (!SwingUtilities.isLeftMouseButton(e) || !this.$outer.comboBox.isEnabled() || !this.$outer.comboBox.isShowing()) {
      return;
    }
    if (this.$outer.comboBox.isEditable()) {
      let comp = this.$outer.comboBox.getEditor().getEditorComponent();
      if ((!(comp instanceof JComponent)) || (comp).isRequestFocusEnabled()) {
        comp.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
      }
    } else if (this.$outer.comboBox.isRequestFocusEnabled()) {
      this.$outer.comboBox.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
    }
    this.$outer.togglePopup();
  }
  mouseReleased(e: MouseEvent): void {
    if (e.getSource() === this.$outer.list) {
      if (this.$outer.list.getModel().getSize() > 0) {
        if (this.$outer.comboBox.getSelectedIndex() === this.$outer.list.getSelectedIndex()) {
          this.$outer.comboBox.getEditor().setItem(this.$outer.list.getSelectedValue());
        }
        this.$outer.comboBox.setSelectedIndex(this.$outer.list.getSelectedIndex());
      }
      this.$outer.comboBox.setPopupVisible(false);
      if (this.$outer.comboBox.isEditable() && this.$outer.comboBox.getEditor() != null) {
        this.$outer.comboBox.configureEditor(this.$outer.comboBox.getEditor(), this.$outer.comboBox.getSelectedItem());
      }
      return;
    }
    let source = e.getSource();
    let size = source.getSize$();
    let bounds = new Rectangle()._Rectangle$int$int$int$int(0, 0, size.width_, size.height_);
    if (!bounds.contains$Point(e.getPoint())) {
      let newEvent = this.$outer.convertMouseEvent(e);
      let location = newEvent.getPoint();
      let r = new Rectangle()._Rectangle$();
      this.$outer.list.computeVisibleRect(r);
      if (r.contains$Point(location)) {
        if (this.$outer.comboBox.getSelectedIndex() === this.$outer.list.getSelectedIndex()) {
          this.$outer.comboBox.getEditor().setItem(this.$outer.list.getSelectedValue());
        }
        this.$outer.comboBox.setSelectedIndex(this.$outer.list.getSelectedIndex());
      }
      this.$outer.comboBox.setPopupVisible(false);
    }
    this.$outer.hasEntered = false;
    this.$outer.stopAutoScrolling();
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  mouseMoved(anEvent: MouseEvent): void {
    if (anEvent.getSource() === this.$outer.list) {
      let location = anEvent.getPoint();
      let r = new Rectangle()._Rectangle$();
      this.$outer.list.computeVisibleRect(r);
      if (r.contains$Point(location)) {
        this.$outer.updateListBoxSelectionForEvent(anEvent, false);
      }
    }
  }
  mouseDragged(e: MouseEvent): void {
    if (e.getSource() === this.$outer.list) {
      return;
    }
    if (this.$outer.isVisible$()) {
      let newEvent = this.$outer.convertMouseEvent(e);
      let r = new Rectangle()._Rectangle$();
      this.$outer.list.computeVisibleRect(r);
      if (newEvent.getPoint().y_ >= r.y_ && newEvent.getPoint().y_ <= ((r.y_ + r.height_ - 1) | 0)) {
        this.$outer.hasEntered = true;
        if (this.$outer.isAutoScrolling) {
          this.$outer.stopAutoScrolling();
        }
        let location = newEvent.getPoint();
        if (r.contains$Point(location)) {
          this.$outer.updateListBoxSelectionForEvent(newEvent, false);
        }
      } else {
        if (this.$outer.hasEntered) {
          let directionToScroll = newEvent.getPoint().y_ < r.y_ ? BasicComboPopup.SCROLL_UP : BasicComboPopup.SCROLL_DOWN;
          if (this.$outer.isAutoScrolling && this.$outer.scrollDirection !== directionToScroll) {
            this.$outer.stopAutoScrolling();
            this.$outer.startAutoScrolling(directionToScroll);
          } else if (!this.$outer.isAutoScrolling) {
            this.$outer.startAutoScrolling(directionToScroll);
          }
        } else {
          if (e.getPoint().y_ < 0) {
            this.$outer.hasEntered = true;
            this.$outer.startAutoScrolling(BasicComboPopup.SCROLL_UP);
          }
        }
      }
    }
  }
  propertyChange(e: PropertyChangeEvent): void {
    let comboBox = e.getSource();
    let propertyName = e.getPropertyName();
    if (propertyName === 'model') {
      let oldModel = e.getOldValue();
      let newModel = e.getNewValue();
      this.$outer.uninstallComboBoxModelListeners(oldModel);
      this.$outer.installComboBoxModelListeners(newModel);
      this.$outer.list.setModel(newModel);
      if (this.$outer.isVisible$()) {
        this.$outer.hide();
      }
    } else if (propertyName === 'renderer') {
      this.$outer.list.setCellRenderer(comboBox.getRenderer());
      if (this.$outer.isVisible$()) {
        this.$outer.hide();
      }
    } else if (propertyName === 'componentOrientation') {
      let o = e.getNewValue();
      let list = this.$outer.getList();
      if (list != null && list.getComponentOrientation() !== o) {
        list.setComponentOrientation(o);
      }
      if (this.$outer.scroller != null && this.$outer.scroller.getComponentOrientation() !== o) {
        this.$outer.scroller.setComponentOrientation(o);
      }
      if (o !== this.$outer.getComponentOrientation()) {
        this.$outer.setComponentOrientation(o);
      }
    } else if (propertyName === 'lightWeightPopupEnabled') {
      this.$outer.setLightWeightPopupEnabled(comboBox.isLightWeightPopupEnabled());
    }
  }
  itemStateChanged(e: ItemEvent): void {
    if (e.getStateChange() === ItemEvent.SELECTED) {
      let comboBox = e.getSource();
      this.$outer.setListSelection(comboBox.getSelectedIndex());
    } else {
      this.$outer.setListSelection(-1);
    }
  }
  mouseWheelMoved(e: MouseWheelEvent): void {
    e.consume();
  }
}

let $BasicComboPopup$1: any = null;
/** An anonymous class (BasicComboPopup.java:532). */
function BasicComboPopup$1(): any {
  return $BasicComboPopup$1 ??= $J.local(class extends JList {
    processMouseEvent$MouseEvent(e: MouseEvent): void {
      if (BasicGraphicsUtils.isMenuShortcutKeyDown(e)) {
        let toolkit = Toolkit.getDefaultToolkit();
        let newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(e.getSource(), e.getID(), e.getWhen(), e.getModifiersEx() ^ toolkit.getMenuShortcutKeyMaskEx(), e.getX(), e.getY(), e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), MouseEvent.NOBUTTON);
        let meAccessor = AWTAccessor.getMouseEventAccessor();
        meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(e));
        e = newEvent;
      }
      super.processMouseEvent$MouseEvent(e);
    }
  }, 'javax.swing.plaf.basic.BasicComboPopup$1', []);
}

$J.define(BasicComboPopup, 'javax.swing.plaf.basic.BasicComboPopup', { kind: 'class', ifaces: ['javax.swing.plaf.basic.ComboPopup'], sup: 'javax.swing.JPopupMenu', ctors: { 'javax.swing.JComboBox': '_BasicComboPopup' }, meths: { 'getPopupLocation()': 'getPopupLocation$$BasicComboPopup', 'show()': 'show$' }, clinit: true, lazy: ['EmptyListModel', 'LIST_BORDER'] });
$J.define(BasicComboPopup$EmptyListModelClass, 'javax.swing.plaf.basic.BasicComboPopup$EmptyListModelClass', { kind: 'class', ifaces: ['javax.swing.ListModel', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicComboPopup$EmptyListModelClass' } });
$J.define(BasicComboPopup$AutoScrollActionHandler, 'javax.swing.plaf.basic.BasicComboPopup$AutoScrollActionHandler', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { 'int': '_BasicComboPopup$AutoScrollActionHandler' }, inner: true });
$J.define(BasicComboPopup$Handler, 'javax.swing.plaf.basic.BasicComboPopup$Handler', { kind: 'class', ifaces: ['java.awt.event.ItemListener', 'java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener', 'java.awt.event.MouseWheelListener', 'java.beans.PropertyChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_BasicComboPopup$Handler' }, inner: true });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  ItemEvent = $J.load('java.awt.event.ItemEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  JComponent = $J.load('javax.swing.JComponent');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  LineBorder = $J.load('javax.swing.border.LineBorder');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
