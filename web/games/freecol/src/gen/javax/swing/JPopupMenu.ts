// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JPopupMenu.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, ArrayList, GetPropertyAction, IllegalArgumentException, JObject, StringBuffer, SunToolkit, Toolkit } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';
import { JSeparator } from './JSeparator.ts';

let AWTEvent, Dimension, Frame, GraphicsDevice, GraphicsEnvironment, Point, Window, KeyEvent, AccessibleContext, AccessibleState, DefaultSingleSelectionModel, JMenu, JMenuItem, MenuElement, MenuSelectionManager, PopupFactory, SwingConstants, SwingUtilities, UIManager, MenuKeyEvent, MenuKeyListener, PopupMenuEvent, PopupMenuListener, BasicComboPopup;

/**
 * An implementation of a popup menu -- a small window that pops up
 * and displays a series of choices. A <code>JPopupMenu</code> is used for the
 * menu that appears when the user selects an item on the menu bar.
 * It is also used for "pull-right" menu that appears when the
 * selects a menu item that activates it. Finally, a <code>JPopupMenu</code>
 * can also be used anywhere else you want a menu to appear.  For
 * example, when the user right-clicks in a specified area.
 * <p>
 * For information and examples of using popup menus, see
 * <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/menu.html">How to Use Menus</a>
 * in <em>The Java Tutorial.</em>
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
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 * @since 1.2
 */
export class JPopupMenu extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'PopupMenuUI';
  /**
   * Key used in AppContext to determine if light way popups are the default.
   */
  static defaultLWPopupEnabledKey: any = null;
  /**
   * Bug#4425878-Property javax.swing.adjustPopupLocationToFit introduced
   */
  static popupPostionFixDisabled: boolean = false;
  invoker: Component = null;
  popup: Popup = null;
  frame: Frame = null;
  desiredLocationX: number = 0;
  desiredLocationY: number = 0;
  label: string = null;
  paintBorder_: boolean = false;
  margin: Insets = null;
  /**
   * Used to indicate if lightweight popups should be used.
   */
  lightWeightPopup: boolean = false;
  selectionModel: SingleSelectionModel = null;
  static classLock: any = null;
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  $init_JPopupMenu() {
    this.label = null;
    this.paintBorder_ = true;
    this.margin = null;
    this.lightWeightPopup = true;
  }
  /**
   * Constructs a <code>JPopupMenu</code> without an "invoker".
   */
  _JPopupMenu$(): this {
    this._JPopupMenu$String(null);
    return this;
  }
  /**
   * Constructs a <code>JPopupMenu</code> with the specified title.
   *
   * @param label  the string that a UI may use to display as a title
   * for the popup menu.
   */
  _JPopupMenu$String(label: string): this {
    this._JComponent();
    this.$init_JPopupMenu();
    this.label = label;
    this.lightWeightPopup = JPopupMenu.getDefaultLightWeightPopupEnabled();
    this.setSelectionModel(new DefaultSingleSelectionModel()._DefaultSingleSelectionModel());
    this.enableEvents(AWTEvent.MOUSE_EVENT_MASK);
    this.setFocusTraversalKeysEnabled(false);
    this.updateUI();
    return this;
  }
  /**
   * Gets the <code>defaultLightWeightPopupEnabled</code> property,
   *  which by default is <code>true</code>.
   *
   *  @return the value of the <code>defaultLightWeightPopupEnabled</code>
   *          property
   *
   *  @see #setDefaultLightWeightPopupEnabled
   */
  static getDefaultLightWeightPopupEnabled(): boolean {
    let b = SwingUtilities.appContextGet(JPopupMenu.defaultLWPopupEnabledKey);
    if (b == null) {
      SwingUtilities.appContextPut(JPopupMenu.defaultLWPopupEnabledKey, true);
      return true;
    }
    return b;
  }
  /**
   * Returns the look and feel (L&amp;F) object that renders this component.
   *
   * @return the <code>PopupMenuUI</code> object that renders this component
   */
  getUI(): PopupMenuUI {
    return this.ui;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   *
   * @param ui the new <code>PopupMenuUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$PopupMenuUI(ui: PopupMenuUI): void {
    super.setUI$ComponentUI(ui);
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$PopupMenuUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "PopupMenuUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JPopupMenu.uiClassID;
  }
  processFocusEvent(evt: FocusEvent): void {
    super.processFocusEvent(evt);
  }
  /**
   * Processes key stroke events such as mnemonics and accelerators.
   *
   * @param evt  the key event to be processed
   */
  processKeyEvent$KeyEvent(evt: KeyEvent): void {
    MenuSelectionManager.defaultManager().processKeyEvent(evt);
    if (evt.isConsumed()) {
      return;
    }
    super.processKeyEvent$KeyEvent(evt);
  }
  /**
   * Returns the model object that handles single selections.
   *
   * @return the <code>selectionModel</code> property
   * @see SingleSelectionModel
   */
  getSelectionModel(): SingleSelectionModel {
    return this.selectionModel;
  }
  /**
   * Sets the model object to handle single selections.
   *
   * @param model the new <code>SingleSelectionModel</code>
   * @see SingleSelectionModel
   */
  setSelectionModel(model: SingleSelectionModel): void {
    this.selectionModel = model;
  }
  /**
   * Appends the specified menu item to the end of this menu.
   *
   * @param menuItem the <code>JMenuItem</code> to add
   * @return the <code>JMenuItem</code> added
   */
  add$JMenuItem(menuItem: JMenuItem): JMenuItem {
    super.add$Component(menuItem);
    return menuItem;
  }
  /**
   * Appends a new menu item to the end of the menu which
   * dispatches the specified <code>Action</code> object.
   *
   * @param a the <code>Action</code> to add to the menu
   * @return the new menu item
   * @see Action
   */
  add$Action(a: Action): JMenuItem {
    let mi = this.createActionComponent(a);
    mi.setAction(a);
    this.add$JMenuItem(mi);
    return mi;
  }
  /**
   * Returns an point which has been adjusted to take into account the
   * desktop bounds, taskbar and multi-monitor configuration.
   * <p>
   * This adjustment may be cancelled by invoking the application with
   * -Djavax.swing.adjustPopupLocationToFit=false
   */
  adjustPopupLocationToFitScreen(xPosition: number, yPosition: number): Point {
    let popupLocation = new Point()._Point$int$int(xPosition, yPosition);
    if (JPopupMenu.popupPostionFixDisabled === true || GraphicsEnvironment.isHeadless()) {
      return popupLocation;
    }
    let gc = this.getCurrentGraphicsConfiguration(popupLocation);
    if (gc == null) {
      gc = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
    }
    let scrBounds = gc.getBounds();
    let popupSize = this.getPreferredSize$();
    let popupRightX = popupLocation.x_ + popupSize.width_;
    let popupBottomY = popupLocation.y_ + popupSize.height_;
    let scrWidth = scrBounds.width_;
    let scrHeight = scrBounds.height_;
    if (!JPopupMenu.canPopupOverlapTaskBar()) {
      let toolkit = Toolkit.getDefaultToolkit();
      let scrInsets = toolkit.getScreenInsets(gc);
      scrBounds.x_ = (scrBounds.x_ + scrInsets.left) | 0;
      scrBounds.y_ = (scrBounds.y_ + scrInsets.top) | 0;
      scrWidth = (scrWidth - (scrInsets.left + scrInsets.right)) | 0;
      scrHeight = (scrHeight - (scrInsets.top + scrInsets.bottom)) | 0;
    }
    let scrRightX = (scrBounds.x_ + scrWidth) | 0;
    let scrBottomY = (scrBounds.y_ + scrHeight) | 0;
    if (popupRightX > scrRightX) {
      popupLocation.x_ = (scrRightX - popupSize.width_) | 0;
    }
    if (popupBottomY > scrBottomY) {
      popupLocation.y_ = (scrBottomY - popupSize.height_) | 0;
    }
    if (popupLocation.x_ < scrBounds.x_) {
      popupLocation.x_ = scrBounds.x_;
    }
    if (popupLocation.y_ < scrBounds.y_) {
      popupLocation.y_ = scrBounds.y_;
    }
    return popupLocation;
  }
  /**
   * Tries to find GraphicsConfiguration
   * that contains the mouse cursor position.
   * Can return null.
   */
  getCurrentGraphicsConfiguration(popupLocation: Point): GraphicsConfiguration {
    let gc = null;
    let ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
    let gd = ge.getScreenDevices();
    for (let i = 0; i < gd.length; i++) {
      if (gd[i].getType() === GraphicsDevice.TYPE_RASTER_SCREEN) {
        let dgc = gd[i].getDefaultConfiguration();
        if (dgc.getBounds().contains$Point(popupLocation)) {
          gc = dgc;
          break;
        }
      }
    }
    if (gc == null && this.getInvoker() != null) {
      gc = this.getInvoker().getGraphicsConfiguration();
    }
    return gc;
  }
  /**
   * Returns whether popup is allowed to be shown above the task bar.
   */
  static canPopupOverlapTaskBar(): boolean {
    let result = true;
    let tk = Toolkit.getDefaultToolkit();
    if ($J.isa(tk, SunToolkit)) {
      result = (tk).canPopupOverlapTaskBar();
    }
    return result;
  }
  /**
   * Factory method which creates the <code>JMenuItem</code> for
   * <code>Actions</code> added to the <code>JPopupMenu</code>.
   *
   * @param a the <code>Action</code> for the menu item to be added
   * @return the new menu item
   * @see Action
   *
   * @since 1.3
   */
  createActionComponent(a: Action): JMenuItem {
    let mi = new (JPopupMenu$1())().$o(this)._JMenuItem$();
    mi.setHorizontalTextPosition(SwingConstants.TRAILING);
    mi.setVerticalTextPosition(SwingConstants.CENTER);
    return mi;
  }
  /**
   * Returns a properly configured <code>PropertyChangeListener</code>
   * which updates the control as changes to the <code>Action</code> occur.
   *
   * @param b the menu item for which to create a listener
   * @return a properly configured {@code PropertyChangeListener}
   */
  createActionChangeListener(b: JMenuItem): PropertyChangeListener {
    return b.createActionPropertyChangeListener0(b.getAction());
  }
  /**
   * Removes the component at the specified index from this popup menu.
   *
   * @param       pos the position of the item to be removed
   * @throws   IllegalArgumentException if the value of
   *                          <code>pos</code> &lt; 0, or if the value of
   *                          <code>pos</code> is greater than the
   *                          number of items
   */
  remove$int(pos: number): void {
    if (pos < 0) {
      throw new IllegalArgumentException('index less than zero.');
    }
    if (pos > ((this.getComponentCount() - 1) | 0)) {
      throw new IllegalArgumentException('index greater than the number of items.');
    }
    super.remove$int(pos);
  }
  /**
   * Sets the value of the <code>lightWeightPopupEnabled</code> property,
   * which by default is <code>true</code>.
   * By default, when a look and feel displays a popup,
   * it can choose to
   * use a lightweight (all-Java) popup.
   * Lightweight popup windows are more efficient than heavyweight
   * (native peer) windows,
   * but lightweight and heavyweight components do not mix well in a GUI.
   * If your application mixes lightweight and heavyweight components,
   * you should disable lightweight popups.
   * Some look and feels might always use heavyweight popups,
   * no matter what the value of this property.
   *
   * @param aFlag  <code>false</code> to disable lightweight popups
   *
   * @see #isLightWeightPopupEnabled
   */
  setLightWeightPopupEnabled(aFlag: boolean): void {
    this.lightWeightPopup = aFlag;
  }
  /**
   * Gets the <code>lightWeightPopupEnabled</code> property.
   *
   * @return the value of the <code>lightWeightPopupEnabled</code> property
   * @see #setLightWeightPopupEnabled
   */
  isLightWeightPopupEnabled(): boolean {
    return this.lightWeightPopup;
  }
  /**
   * Sets the popup menu's label.  Different look and feels may choose
   * to display or not display this.
   *
   * @param label a string specifying the label for the popup menu
   *
   * @see #getLabel
   */
  setLabel(label: string): void {
    let oldValue = this.label;
    this.label = label;
    this.firePropertyChange$String$Object$Object('label', oldValue, label);
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, oldValue, label);
    }
    this.invalidate();
    this.repaint$();
  }
  /**
   * Appends a new separator at the end of the menu.
   */
  addSeparator(): void {
    this.add$Component(new JPopupMenu$Separator()._JPopupMenu$Separator());
  }
  /**
   * Adds a <code>PopupMenu</code> listener.
   *
   *  @param l  the <code>PopupMenuListener</code> to add
   */
  addPopupMenuListener(l: PopupMenuListener): void {
    this.listenerList.add($J.cls(PopupMenuListener), l);
  }
  /**
   * Removes a <code>PopupMenu</code> listener.
   *
   * @param l  the <code>PopupMenuListener</code> to remove
   */
  removePopupMenuListener(l: PopupMenuListener): void {
    this.listenerList.remove($J.cls(PopupMenuListener), l);
  }
  /**
   * Adds a <code>MenuKeyListener</code> to the popup menu.
   *
   * @param l the <code>MenuKeyListener</code> to be added
   * @since 1.5
   */
  addMenuKeyListener(l: MenuKeyListener): void {
    this.listenerList.add($J.cls(MenuKeyListener), l);
  }
  /**
   * Removes a <code>MenuKeyListener</code> from the popup menu.
   *
   * @param l the <code>MenuKeyListener</code> to be removed
   * @since 1.5
   */
  removeMenuKeyListener(l: MenuKeyListener): void {
    this.listenerList.remove($J.cls(MenuKeyListener), l);
  }
  /**
   * Notifies <code>PopupMenuListener</code>s that this popup menu will
   * become visible.
   */
  firePopupMenuWillBecomeVisible(): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(PopupMenuListener)) {
        if (e == null) {
          e = new PopupMenuEvent()._PopupMenuEvent(this);
        }
        (listeners[(i + 1) | 0]).popupMenuWillBecomeVisible(e);
      }
    }
  }
  /**
   * Notifies <code>PopupMenuListener</code>s that this popup menu will
   * become invisible.
   */
  firePopupMenuWillBecomeInvisible(): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(PopupMenuListener)) {
        if (e == null) {
          e = new PopupMenuEvent()._PopupMenuEvent(this);
        }
        (listeners[(i + 1) | 0]).popupMenuWillBecomeInvisible(e);
      }
    }
  }
  /**
   * Notifies <code>PopupMenuListeners</code> that this popup menu is
   * cancelled.
   */
  firePopupMenuCanceled(): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(PopupMenuListener)) {
        if (e == null) {
          e = new PopupMenuEvent()._PopupMenuEvent(this);
        }
        (listeners[(i + 1) | 0]).popupMenuCanceled(e);
      }
    }
  }
  /**
   * Always returns true since popups, by definition, should always
   * be on top of all other windows.
   * @return true
   */
  alwaysOnTop(): boolean {
    return true;
  }
  getMenuInvoker(): Window {
    var menuInvoker;
    if ((menuInvoker = this.invoker) instanceof Window) {
      return menuInvoker;
    } else {
      return this.invoker == null ? null : SwingUtilities.getWindowAncestor(this.invoker);
    }
  }
  /**
   * Sets the visibility of the popup menu.
   *
   * @param b true to make the popup visible, or false to
   *          hide it
   */
  setVisible(b: boolean): void {
    if (JPopupMenu.DEBUG) {
      $J.out.println('JPopupMenu.setVisible ' + b);
    }
    if (b === this.isVisible$()) {
      return;
    }
    if (b === false) {
      let doCanceled = this.getClientProperty('JPopupMenu.firePopupMenuCanceled');
      if (doCanceled != null && doCanceled === true) {
        this.putClientProperty('JPopupMenu.firePopupMenuCanceled', false);
        this.firePopupMenuCanceled();
      }
      this.getSelectionModel().clearSelection();
    } else {
      if (this.isPopupMenu()) {
        let me = $J.newArray(1, null);
        me[0] = this;
        MenuSelectionManager.defaultManager().setSelectedPath(me);
      }
    }
    var sunToolkit;
    if (b) {
      this.firePopupMenuWillBecomeVisible();
      var sunToolkit;
      if ($J.isa((sunToolkit = Toolkit.getDefaultToolkit()), SunToolkit)) {
        sunToolkit.dismissPopupOnFocusLostIfNeeded(this.getMenuInvoker());
      }
      this.showPopup();
      this.firePropertyChange$String$Object$Object('visible', false, true);
    } else if (this.popup != null) {
      this.firePopupMenuWillBecomeInvisible();
      var sunToolkit;
      if ($J.isa((sunToolkit = Toolkit.getDefaultToolkit()), SunToolkit)) {
        sunToolkit.dismissPopupOnFocusLostIfNeededCleanUp(this.getMenuInvoker());
      }
      this.popup.hide();
      this.popup = null;
      this.firePropertyChange$String$Object$Object('visible', true, false);
      if (this.isPopupMenu()) {
        MenuSelectionManager.defaultManager().clearSelectedPath();
      }
    }
  }
  /**
   * Retrieves <code>Popup</code> instance from the
   * <code>PopupMenuUI</code> that has had <code>show</code> invoked on
   * it. If the current <code>popup</code> is non-null,
   * this will invoke <code>dispose</code> of it, and then
   * <code>show</code> the new one.
   * <p>
   * This does NOT fire any events, it is up the caller to dispatch
   * the necessary events.
   */
  showPopup(): void {
    let oldPopup = this.popup;
    if (oldPopup != null) {
      oldPopup.hide();
    }
    let popupFactory = PopupFactory.getSharedInstance();
    if (this.isLightWeightPopupEnabled()) {
      popupFactory.setPopupType(PopupFactory.LIGHT_WEIGHT_POPUP);
    } else {
      popupFactory.setPopupType(PopupFactory.HEAVY_WEIGHT_POPUP);
    }
    let p = this.adjustPopupLocationToFitScreen(this.desiredLocationX, this.desiredLocationY);
    this.desiredLocationX = p.x_;
    this.desiredLocationY = p.y_;
    let newPopup = this.getUI().getPopup(this, this.desiredLocationX, this.desiredLocationY);
    popupFactory.setPopupType(PopupFactory.LIGHT_WEIGHT_POPUP);
    this.popup = newPopup;
    newPopup.show();
  }
  /**
   * Returns true if the popup menu is visible (currently
   * being displayed).
   */
  isVisible$(): boolean {
    return this.popup != null;
  }
  /**
   * Sets the location of the upper left corner of the
   * popup menu using x, y coordinates.
   * <p>
   * The method changes the geometry-related data. Therefore,
   * the native windowing system may ignore such requests, or it may modify
   * the requested data, so that the {@code JPopupMenu} object is placed and sized
   * in a way that corresponds closely to the desktop settings.
   *
   * @param x the x coordinate of the popup's new position
   *          in the screen's coordinate space
   * @param y the y coordinate of the popup's new position
   *          in the screen's coordinate space
   */
  setLocation$int$int(x: number, y: number): void {
    let oldX = this.desiredLocationX;
    let oldY = this.desiredLocationY;
    this.desiredLocationX = x;
    this.desiredLocationY = y;
    if (this.popup != null && (x !== oldX || y !== oldY)) {
      this.showPopup();
    }
  }
  /**
   * Returns true if the popup menu is a standalone popup menu
   * rather than the submenu of a <code>JMenu</code>.
   *
   * @return true if this menu is a standalone popup menu, otherwise false
   */
  isPopupMenu(): boolean {
    return ((this.invoker != null) && !(this.invoker instanceof JMenu));
  }
  /**
   * Returns the component which is the 'invoker' of this
   * popup menu.
   *
   * @return the <code>Component</code> in which the popup menu is displayed
   */
  getInvoker(): Component {
    return this.invoker;
  }
  /**
   * Sets the invoker of this popup menu -- the component in which
   * the popup menu menu is to be displayed.
   *
   * @param invoker the <code>Component</code> in which the popup
   *          menu is displayed
   */
  setInvoker(invoker: Component): void {
    let oldInvoker = this.invoker;
    this.invoker = invoker;
    if ((oldInvoker !== this.invoker) && (this.ui != null)) {
      this.ui.uninstallUI(this);
      this.ui.installUI(this);
    }
    this.invalidate();
  }
  /**
   * Displays the popup menu at the position x,y in the coordinate
   * space of the component invoker.
   *
   * @param invoker the component in whose space the popup menu is to appear
   * @param x the x coordinate in invoker's coordinate space at which
   * the popup menu is to be displayed
   * @param y the y coordinate in invoker's coordinate space at which
   * the popup menu is to be displayed
   */
  show$Component$int$int(invoker: Component, x: number, y: number): void {
    if (JPopupMenu.DEBUG) {
      $J.out.println('in JPopupMenu.show ');
    }
    this.setInvoker(invoker);
    let newFrame = JPopupMenu.getFrame(invoker);
    if (newFrame !== this.frame) {
      if (newFrame != null) {
        this.frame = newFrame;
        if (this.popup != null) {
          this.setVisible(false);
        }
      }
    }
    let invokerOrigin: Point;
    if (invoker != null) {
      invokerOrigin = invoker.getLocationOnScreen();
      let lx: number;
      let ly: number;
      lx = (invokerOrigin.x_) + (x);
      ly = (invokerOrigin.y_) + (y);
      if (lx > 2147483647) {
        lx = 2147483647;
      }
      if (lx < -2147483648) {
        lx = -2147483648;
      }
      if (ly > 2147483647) {
        ly = 2147483647;
      }
      if (ly < -2147483648) {
        ly = -2147483648;
      }
      this.setLocation$int$int((lx) | 0, (ly) | 0);
    } else {
      this.setLocation$int$int(x, y);
    }
    this.setVisible(true);
  }
  /**
   * Sets the size of the Popup window using a <code>Dimension</code> object.
   * This is equivalent to <code>setPreferredSize(d)</code>.
   *
   * @param d   the <code>Dimension</code> specifying the new size
   * of this component.
   */
  setPopupSize$Dimension(d: Dimension): void {
    let oldSize = this.getPreferredSize$();
    this.setPreferredSize(d);
    if (this.popup != null) {
      let newSize = this.getPreferredSize$();
      if (!oldSize.equals(newSize)) {
        this.showPopup();
      }
    }
  }
  /**
   * Sets the size of the Popup window to the specified width and
   * height. This is equivalent to
   *  <code>setPreferredSize(new Dimension(width, height))</code>.
   *
   * @param width the new width of the Popup in pixels
   * @param height the new height of the Popup in pixels
   */
  setPopupSize$int$int(width: number, height: number): void {
    this.setPopupSize$Dimension(new Dimension()._Dimension$int$int(width, height));
  }
  /**
   * Checks whether the border should be painted.
   *
   * @return true if the border is painted, false otherwise
   * @see #setBorderPainted
   */
  isBorderPainted(): boolean {
    return this.paintBorder_;
  }
  /**
   * Sets whether the border should be painted.
   *
   * @param b if true, the border is painted.
   * @see #isBorderPainted
   */
  setBorderPainted(b: boolean): void {
    this.paintBorder_ = b;
    this.repaint$();
  }
  /**
   * Paints the popup menu's border if the <code>borderPainted</code>
   * property is <code>true</code>.
   * @param g  the <code>Graphics</code> object
   *
   * @see JComponent#paint
   * @see JComponent#setBorder
   */
  paintBorder(g: Graphics): void {
    if (this.isBorderPainted()) {
      super.paintBorder(g);
    }
  }
  static getFrame(c: Component): Frame {
    let w = c;
    while (!(w instanceof Frame) && (w != null)) {
      w = w.getParent();
    }
    return w;
  }
  /**
   * Returns a string representation of this <code>JPopupMenu</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JPopupMenu</code>.
   */
  paramString(): string {
    let labelString = (this.label != null ? this.label : '');
    let paintBorderString = (this.paintBorder_ ? 'true' : 'false');
    let marginString = (this.margin != null ? this.margin.toString() : '');
    let lightWeightPopupEnabledString = (this.isLightWeightPopupEnabled() ? 'true' : 'false');
    return super.paramString() + ',desiredLocationX=' + this.desiredLocationX + ',desiredLocationY=' + this.desiredLocationY + ',label=' + labelString + ',lightWeightPopupEnabled=' + lightWeightPopupEnabledString + ',margin=' + marginString + ',paintBorder=' + paintBorderString;
  }
  /**
   * Gets the AccessibleContext associated with this JPopupMenu.
   * For JPopupMenus, the AccessibleContext takes the form of an
   * AccessibleJPopupMenu.
   * A new AccessibleJPopupMenu instance is created if necessary.
   *
   * @return an AccessibleJPopupMenu that serves as the
   *         AccessibleContext of this JPopupMenu
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JPopupMenu$AccessibleJPopupMenu().$o(this)._JPopupMenu$AccessibleJPopupMenu();
    }
    return this.accessibleContext;
  }
  /**
   * This method is required to conform to the
   * <code>MenuElement</code> interface, but it not implemented.
   * @see MenuElement#processMouseEvent(MouseEvent, MenuElement[], MenuSelectionManager)
   */
  processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager(event: MouseEvent, path: MenuElement[], manager: MenuSelectionManager): void {
  }
  /**
   * Processes a key event forwarded from the
   * <code>MenuSelectionManager</code> and changes the menu selection,
   * if necessary, by using <code>MenuSelectionManager</code>'s API.
   * <p>
   * Note: you do not have to forward the event to sub-components.
   * This is done automatically by the <code>MenuSelectionManager</code>.
   *
   * @param e  a <code>KeyEvent</code>
   * @param path the <code>MenuElement</code> path array
   * @param manager   the <code>MenuSelectionManager</code>
   */
  processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager(e: KeyEvent, path: MenuElement[], manager: MenuSelectionManager): void {
    let mke = new MenuKeyEvent()._MenuKeyEvent(e.getComponent(), e.getID(), e.getWhen(), e.getModifiers(), e.getKeyCode(), e.getKeyChar(), path, manager);
    this.processMenuKeyEvent(mke);
    if (mke.isConsumed()) {
      e.consume();
    }
  }
  /**
   * Handles a keystroke in a menu.
   *
   * @param e  a <code>MenuKeyEvent</code> object
   * @since 1.5
   */
  processMenuKeyEvent(e: MenuKeyEvent): void {
    switch (e.getID()) {
      case KeyEvent.KEY_PRESSED:
        this.fireMenuKeyPressed(e);
        break;
      case KeyEvent.KEY_RELEASED:
        this.fireMenuKeyReleased(e);
        break;
      case KeyEvent.KEY_TYPED:
        this.fireMenuKeyTyped(e);
        break;
      default:
        break;
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param event a <code>MenuKeyEvent</code>
   * @see EventListenerList
   */
  fireMenuKeyPressed(event: MenuKeyEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuKeyListener)) {
        (listeners[(i + 1) | 0]).menuKeyPressed(event);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param event a <code>MenuKeyEvent</code>
   * @see EventListenerList
   */
  fireMenuKeyReleased(event: MenuKeyEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuKeyListener)) {
        (listeners[(i + 1) | 0]).menuKeyReleased(event);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param event a <code>MenuKeyEvent</code>
   * @see EventListenerList
   */
  fireMenuKeyTyped(event: MenuKeyEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuKeyListener)) {
        (listeners[(i + 1) | 0]).menuKeyTyped(event);
      }
    }
  }
  /**
   * Messaged when the menubar selection changes to activate or
   * deactivate this menu. This implements the
   * <code>javax.swing.MenuElement</code> interface.
   * Overrides <code>MenuElement.menuSelectionChanged</code>.
   *
   * @param isIncluded  true if this menu is active, false if
   *        it is not
   * @see MenuElement#menuSelectionChanged(boolean)
   */
  menuSelectionChanged(isIncluded: boolean): void {
    if (JPopupMenu.DEBUG) {
      $J.out.println('In JPopupMenu.menuSelectionChanged ' + isIncluded);
    }
    if (this.invoker instanceof JMenu) {
      let m = this.invoker;
      if (isIncluded) {
        m.setPopupMenuVisible(true);
      } else {
        m.setPopupMenuVisible(false);
      }
    }
    if (this.isPopupMenu() && !isIncluded) {
      this.setVisible(false);
    }
  }
  /**
   * Returns an array of <code>MenuElement</code>s containing the submenu
   * for this menu component.  It will only return items conforming to
   * the <code>JMenuElement</code> interface.
   * If popup menu is <code>null</code> returns
   * an empty array.  This method is required to conform to the
   * <code>MenuElement</code> interface.
   *
   * @return an array of <code>MenuElement</code> objects
   * @see MenuElement#getSubElements
   */
  getSubElements(): MenuElement[] {
    let result: MenuElement[];
    let tmp = new ArrayList();
    let c = this.getComponentCount();
    let i: number;
    let m: Component;
    for (i = 0; i < c; i++) {
      m = this.getComponent$int(i);
      if ($J.isa(m, MenuElement)) {
        tmp.add(m);
      }
    }
    result = $J.newArray(tmp.size(), null);
    for (i = 0, c = tmp.size(); i < c; i++) {
      result[i] = tmp.get(i);
    }
    return result;
  }
  /**
   * Returns this <code>JPopupMenu</code> component.
   * @return this <code>JPopupMenu</code> object
   * @see MenuElement#getComponent
   */
  getComponent$(): Component {
    return this;
  }
  static $clinit() {
    JPopupMenu.defaultLWPopupEnabledKey = new StringBuffer('JPopupMenu.defaultLWPopupEnabledKey');
    JPopupMenu.popupPostionFixDisabled = $J.equals(AccessController.doPrivileged(new GetPropertyAction('javax.swing.adjustPopupLocationToFit', '')), 'false');
    JPopupMenu.classLock = new JObject();
  }
}

/**
 * This class implements accessibility support for the
 * <code>JPopupMenu</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to popup menu user-interface
 * elements.
 */
export class JPopupMenu$AccessibleJPopupMenu extends JComponent$AccessibleJComponent {
  /**
   * AccessibleJPopupMenu constructor
   *
   * @since 1.5
   */
  _JPopupMenu$AccessibleJPopupMenu(): this {
    this._JComponent$AccessibleJComponent();
    this.$outer.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    return this;
  }
  /**
   * This method gets called when a bound property is changed.
   * @param e A <code>PropertyChangeEvent</code> object describing
   * the event source and the property that has changed. Must not be null.
   *
   * @throws NullPointerException if the parameter is null.
   * @since 1.5
   */
  propertyChange(e: PropertyChangeEvent): void {
    let propertyName = e.getPropertyName();
    if (propertyName === 'visible') {
      if (e.getOldValue() === false && e.getNewValue() === true) {
        this.handlePopupIsVisibleEvent(true);
      } else if (e.getOldValue() === true && e.getNewValue() === false) {
        this.handlePopupIsVisibleEvent(false);
      }
    }
  }
  handlePopupIsVisibleEvent(visible: boolean): void {
    if (visible) {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.VISIBLE);
      this.fireActiveDescendant();
    } else {
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.VISIBLE, null);
    }
  }
  fireActiveDescendant(): void {
    if (this.$outer instanceof BasicComboPopup) {
      let popupList = (this.$outer).getList();
      if (popupList == null) {
        return;
      }
      let ac = popupList.getAccessibleContext();
      let selection = ac.getAccessibleSelection$();
      if (selection == null) {
        return;
      }
      let a = selection.getAccessibleSelection$int(0);
      if (a == null) {
        return;
      }
      let selectedItem = a.getAccessibleContext();
      if (selectedItem != null && this.$outer.invoker != null) {
        let invokerContext = this.$outer.invoker.getAccessibleContext();
        if (invokerContext != null) {
          invokerContext.firePropertyChange(AccessibleContext.ACCESSIBLE_ACTIVE_DESCENDANT_PROPERTY, null, selectedItem);
        }
      }
    }
  }
}

/**
 * A popup menu-specific separator.
 */
export class JPopupMenu$Separator extends JSeparator {
  /**
   * Constructs a popup menu-specific Separator.
   */
  _JPopupMenu$Separator(): this {
    this._JSeparator$int(SwingConstants.HORIZONTAL);
    return this;
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "PopupMenuSeparatorUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return 'PopupMenuSeparatorUI';
  }
}

let $JPopupMenu$1: any = null;
/** An anonymous class (JPopupMenu.java:450). */
function JPopupMenu$1(): any {
  return $JPopupMenu$1 ??= $J.local(class extends JMenuItem {
    createActionPropertyChangeListener(a: Action): PropertyChangeListener {
      let pcl = this.$outer.createActionChangeListener(this);
      if (pcl == null) {
        pcl = super.createActionPropertyChangeListener(a);
      }
      return pcl;
    }
  }, 'javax.swing.JPopupMenu$1', []);
}

$J.define(JPopupMenu, 'javax.swing.JPopupMenu', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.MenuElement'], sup: 'javax.swing.JComponent', ctors: { 'java.lang.String': '_JPopupMenu$String', '': '_JPopupMenu$' }, meths: { 'getComponent()': 'getComponent$', 'processKeyEvent(java.awt.event.KeyEvent,javax.swing.MenuElement[],javax.swing.MenuSelectionManager)': 'processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager', 'processMouseEvent(java.awt.event.MouseEvent,javax.swing.MenuElement[],javax.swing.MenuSelectionManager)': 'processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JPopupMenu', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JPopupMenu', 'setPopupSize(int,int)': 'setPopupSize$int$int', 'setPopupSize(java.awt.Dimension)': 'setPopupSize$Dimension', 'show(java.awt.Component,int,int)': 'show$Component$int$int', 'setLocation(int,int)': 'setLocation$int$int', 'isVisible()': 'isVisible$', 'insert(java.awt.Component,int)': 'insert$Component$int', 'insert(javax.swing.Action,int)': 'insert$Action$int', 'remove(int)': 'remove$int', 'add(javax.swing.Action)': 'add$Action', 'add(java.lang.String)': 'add$String', 'add(javax.swing.JMenuItem)': 'add$JMenuItem', 'processKeyEvent(java.awt.event.KeyEvent)': 'processKeyEvent$KeyEvent', 'setUI(javax.swing.plaf.PopupMenuUI)': 'setUI$PopupMenuUI' }, clinit: true, lazy: ['defaultLWPopupEnabledKey', 'popupPostionFixDisabled', 'classLock'] });
$J.define(JPopupMenu$AccessibleJPopupMenu, 'javax.swing.JPopupMenu$AccessibleJPopupMenu', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JPopupMenu$AccessibleJPopupMenu' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JPopupMenu$Separator, 'javax.swing.JPopupMenu$Separator', { kind: 'class', sup: 'javax.swing.JSeparator', ctors: { '': '_JPopupMenu$Separator' } });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Dimension = $J.load('java.awt.Dimension');
  Frame = $J.load('java.awt.Frame');
  GraphicsDevice = $J.load('java.awt.GraphicsDevice');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Point = $J.load('java.awt.Point');
  Window = $J.load('java.awt.Window');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  DefaultSingleSelectionModel = $J.load('javax.swing.DefaultSingleSelectionModel');
  JMenu = $J.load('javax.swing.JMenu');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  MenuElement = $J.load('javax.swing.MenuElement');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  PopupFactory = $J.load('javax.swing.PopupFactory');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  MenuKeyEvent = $J.load('javax.swing.event.MenuKeyEvent');
  MenuKeyListener = $J.load('javax.swing.event.MenuKeyListener');
  PopupMenuEvent = $J.load('javax.swing.event.PopupMenuEvent');
  PopupMenuListener = $J.load('javax.swing.event.PopupMenuListener');
  BasicComboPopup = $J.load('javax.swing.plaf.basic.BasicComboPopup');
});
