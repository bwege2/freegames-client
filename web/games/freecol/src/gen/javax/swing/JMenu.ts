// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JMenu.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalArgumentException, JError, JObject, Toolkit } from '../../../jre/index.ts';
import { JMenuItem } from './JMenuItem.ts';
import { WindowAdapter } from '../../java/awt/event/WindowAdapter.ts';
import { JMenuItem$AccessibleJMenuItem } from './JMenuItem.ts';

let GraphicsDevice, GraphicsEnvironment, Point, Rectangle, Accessible, JComponent, JMenuBar, JPopupMenu, MenuSelectionManager, SwingConstants, SwingUtilities, UIManager, MenuEvent, MenuListener;

/**
 * An implementation of a menu -- a popup window containing
 * <code>JMenuItem</code>s that
 * is displayed when the user selects an item on the <code>JMenuBar</code>.
 * In addition to <code>JMenuItem</code>s, a <code>JMenu</code> can
 * also contain <code>JSeparator</code>s.
 * <p>
 * In essence, a menu is a button with an associated <code>JPopupMenu</code>.
 * When the "button" is pressed, the <code>JPopupMenu</code> appears. If the
 * "button" is on the <code>JMenuBar</code>, the menu is a top-level window.
 * If the "button" is another menu item, then the <code>JPopupMenu</code> is
 * "pull-right" menu.
 * <p>
 * Menus can be configured, and to some degree controlled, by
 * <code><a href="Action.html">Action</a></code>s.  Using an
 * <code>Action</code> with a menu has many benefits beyond directly
 * configuring a menu.  Refer to <a href="Action.html#buttonActions">
 * Swing Components Supporting <code>Action</code></a> for more
 * details, and you can find more information in <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/misc/action.html">How
 * to Use Actions</a>, a section in <em>The Java Tutorial</em>.
 * <p>
 * For information and examples of using menus see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/menu.html">How to Use Menus</a>,
 * a section in <em>The Java Tutorial.</em>
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
 * @see JMenuItem
 * @see JSeparator
 * @see JMenuBar
 * @see JPopupMenu
 * @since 1.2
 */
export class JMenu extends JMenuItem {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'MenuUI';
  popupMenu$JMenu: JPopupMenu = null;
  menuChangeListener: ChangeListener = null;
  menuEvent: MenuEvent = null;
  delay: number = 0;
  customMenuLocation: Point = null;
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  /**
   * The window-closing listener for the popup.
   *
   * @see WinListener
   */
  popupListener: JMenu$WinListener = null;
  $init_JMenu() {
    this.menuChangeListener = null;
    this.menuEvent = null;
    this.customMenuLocation = null;
  }
  /**
   * Constructs a new <code>JMenu</code> with the supplied string
   * as its text.
   *
   * @param s  the text for the menu label
   */
  _JMenu$String(s: string): this {
    this._JMenuItem$String(s);
    this.$init_JMenu();
    return this;
  }
  /**
   * Overridden to do nothing. We want JMenu to be focusable, but
   * <code>JMenuItem</code> doesn't want to be, thus we override this
   * to do nothing. We don't invoke <code>setFocusable(true)</code> after
   * super's constructor has completed as this has the side effect that
   * <code>JMenu</code> will be considered traversable via the
   * keyboard, which we don't want. Making a Component traversable by
   * the keyboard after invoking <code>setFocusable(true)</code> is OK,
   * as <code>setFocusable</code> is new API
   * and is speced as such, but internally we don't want to use it like
   * this else we change the keyboard traversability.
   */
  initFocusability(): void {
  }
  /**
   * Resets the UI property with a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$MenuItemUI(UIManager.getUI(this));
    if (this.popupMenu$JMenu != null) {
      this.popupMenu$JMenu.setUI$PopupMenuUI(UIManager.getUI(this.popupMenu$JMenu));
    }
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "MenuUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JMenu.uiClassID;
  }
  /**
   * Sets the data model for the "menu button" -- the label
   * that the user clicks to open or close the menu.
   *
   * @param newModel the <code>ButtonModel</code>
   * @see #getModel
   */
  setModel(newModel: ButtonModel): void {
    let oldModel = this.getModel();
    super.setModel(newModel);
    if (oldModel != null && this.menuChangeListener != null) {
      oldModel.removeChangeListener(this.menuChangeListener);
      this.menuChangeListener = null;
    }
    this.model = newModel;
    if (newModel != null) {
      this.menuChangeListener = this.createMenuChangeListener();
      newModel.addChangeListener(this.menuChangeListener);
    }
  }
  /**
   * Returns true if the menu is currently selected (highlighted).
   *
   * @return true if the menu is selected, else false
   */
  isSelected(): boolean {
    return this.getModel().isSelected();
  }
  /**
   * Sets the selection status of the menu.
   *
   * @param b  true to select (highlight) the menu; false to de-select
   *          the menu
   */
  setSelected(b: boolean): void {
    let model = this.getModel();
    let oldValue = model.isSelected();
    if (b !== model.isSelected()) {
      this.getModel().setSelected(b);
    }
  }
  /**
   * Returns true if the menu's popup window is visible.
   *
   * @return true if the menu is visible, else false
   */
  isPopupMenuVisible(): boolean {
    this.ensurePopupMenuCreated();
    return this.popupMenu$JMenu.isVisible$();
  }
  /**
   * Sets the visibility of the menu's popup.  If the menu is
   * not enabled, this method will have no effect.
   *
   * @param b  a boolean value -- true to make the menu visible,
   *           false to hide it
   */
  setPopupMenuVisible(b: boolean): void {
    if (JMenu.DEBUG) {
      $J.out.println('in JMenu.setPopupMenuVisible ' + b);
    }
    let isVisible = this.isPopupMenuVisible();
    if (b !== isVisible && (this.isEnabled() || !b)) {
      this.ensurePopupMenuCreated();
      if ((b === true) && this.isShowing()) {
        let p = this.getCustomMenuLocation();
        if (p == null) {
          p = this.getPopupMenuOrigin();
        }
        this.getPopupMenu().show$Component$int$int(this, p.x_, p.y_);
      } else {
        this.getPopupMenu().setVisible(false);
      }
    }
  }
  /**
   * Computes the origin for the <code>JMenu</code>'s popup menu.
   * This method uses Look and Feel properties named
   * <code>Menu.menuPopupOffsetX</code>,
   * <code>Menu.menuPopupOffsetY</code>,
   * <code>Menu.submenuPopupOffsetX</code>, and
   * <code>Menu.submenuPopupOffsetY</code>
   * to adjust the exact location of popup.
   *
   * @return a <code>Point</code> in the coordinate space of the
   *          menu which should be used as the origin
   *          of the <code>JMenu</code>'s popup menu
   *
   * @since 1.3
   */
  getPopupMenuOrigin(): Point {
    let x: number;
    let y: number;
    let pm = this.getPopupMenu();
    let s = this.getSize$();
    let pmSize = pm.getSize$();
    if (pmSize.width_ === 0) {
      pmSize = pm.getPreferredSize$();
    }
    let position = this.getLocationOnScreen();
    let toolkit = Toolkit.getDefaultToolkit();
    let gc = this.getGraphicsConfiguration();
    let screenBounds = new Rectangle()._Rectangle$Dimension(toolkit.getScreenSize());
    let ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
    let gd = ge.getScreenDevices();
    for (let i = 0; i < gd.length; i++) {
      if (gd[i].getType() === GraphicsDevice.TYPE_RASTER_SCREEN) {
        let dgc = gd[i].getDefaultConfiguration();
        if (dgc.getBounds().contains$Point(position)) {
          gc = dgc;
          break;
        }
      }
    }
    if (gc != null) {
      screenBounds = gc.getBounds();
      let screenInsets = toolkit.getScreenInsets(gc);
      screenBounds.width_ = (screenBounds.width_ - (Math.abs((screenInsets.left + screenInsets.right) | 0))) | 0;
      screenBounds.height_ = (screenBounds.height_ - (Math.abs((screenInsets.top + screenInsets.bottom) | 0))) | 0;
      position.x_ = (position.x_ - Math.abs(screenInsets.left)) | 0;
      position.y_ = (position.y_ - Math.abs(screenInsets.top)) | 0;
    }
    let parent = this.getParent();
    if (parent instanceof JPopupMenu) {
      let xOffset = UIManager.getInt$Object('Menu.submenuPopupOffsetX');
      let yOffset = UIManager.getInt$Object('Menu.submenuPopupOffsetY');
      if (SwingUtilities.isLeftToRight(this)) {
        x = (s.width_ + xOffset) | 0;
        if (((position.x_ + x + pmSize.width_) | 0) >= ((screenBounds.width_ + screenBounds.x_) | 0) && ((screenBounds.width_ - s.width_) | 0) < Math.imul(2, ((position.x_ - screenBounds.x_) | 0))) {
          x = (0 - xOffset - pmSize.width_) | 0;
        }
      } else {
        x = (0 - xOffset - pmSize.width_) | 0;
        if (((position.x_ + x) | 0) < screenBounds.x_ && ((screenBounds.width_ - s.width_) | 0) > Math.imul(2, ((position.x_ - screenBounds.x_) | 0))) {
          x = (s.width_ + xOffset) | 0;
        }
      }
      y = yOffset;
      if (((position.y_ + y + pmSize.height_) | 0) >= ((screenBounds.height_ + screenBounds.y_) | 0) && ((screenBounds.height_ - s.height_) | 0) < Math.imul(2, ((position.y_ - screenBounds.y_) | 0))) {
        y = (s.height_ - yOffset - pmSize.height_) | 0;
      }
    } else {
      let xOffset = UIManager.getInt$Object('Menu.menuPopupOffsetX');
      let yOffset = UIManager.getInt$Object('Menu.menuPopupOffsetY');
      if (SwingUtilities.isLeftToRight(this)) {
        x = xOffset;
        if (((position.x_ + x + pmSize.width_) | 0) >= ((screenBounds.width_ + screenBounds.x_) | 0) && ((screenBounds.width_ - s.width_) | 0) < Math.imul(2, ((position.x_ - screenBounds.x_) | 0))) {
          x = (s.width_ - xOffset - pmSize.width_) | 0;
        }
      } else {
        x = (s.width_ - xOffset - pmSize.width_) | 0;
        if (((position.x_ + x) | 0) < screenBounds.x_ && ((screenBounds.width_ - s.width_) | 0) > Math.imul(2, ((position.x_ - screenBounds.x_) | 0))) {
          x = xOffset;
        }
      }
      y = (s.height_ + yOffset) | 0;
      if (((position.y_ + y + pmSize.height_) | 0) >= ((screenBounds.height_ + screenBounds.y_) | 0) && ((screenBounds.height_ - s.height_) | 0) < Math.imul(2, ((position.y_ - screenBounds.y_) | 0))) {
        y = (0 - yOffset - pmSize.height_) | 0;
      }
    }
    return new Point()._Point$int$int(x, y);
  }
  /**
   * Returns the suggested delay, in milliseconds, before submenus
   * are popped up or down.
   * Each look and feel (L&amp;F) may determine its own policy for
   * observing the <code>delay</code> property.
   * In most cases, the delay is not observed for top level menus
   * or while dragging.  The default for <code>delay</code> is 0.
   * This method is a property of the look and feel code and is used
   * to manage the idiosyncrasies of the various UI implementations.
   *
   *
   * @return the <code>delay</code> property
   */
  getDelay(): number {
    return this.delay;
  }
  /**
   * Sets the suggested delay before the menu's <code>PopupMenu</code>
   * is popped up or down.  Each look and feel (L&amp;F) may determine
   * it's own policy for observing the delay property.  In most cases,
   * the delay is not observed for top level menus or while dragging.
   * This method is a property of the look and feel code and is used
   * to manage the idiosyncrasies of the various UI implementations.
   *
   * @param       d the number of milliseconds to delay
   * @throws   IllegalArgumentException if <code>d</code>
   *                       is less than 0
   */
  setDelay(d: number): void {
    if (d < 0) {
      throw new IllegalArgumentException('Delay must be a positive integer');
    }
    this.delay = d;
  }
  ensurePopupMenuCreated(): void {
    if (this.popupMenu$JMenu == null) {
      let thisMenu = this;
      this.popupMenu$JMenu = new JPopupMenu()._JPopupMenu$();
      this.popupMenu$JMenu.setInvoker(this);
      this.popupListener = this.createWinListener(this.popupMenu$JMenu);
    }
  }
  getCustomMenuLocation(): Point {
    return this.customMenuLocation;
  }
  /**
   * Appends a menu item to the end of this menu.
   * Returns the menu item added.
   *
   * @param menuItem the <code>JMenuitem</code> to be added
   * @return the <code>JMenuItem</code> added
   */
  add$JMenuItem(menuItem: JMenuItem): JMenuItem {
    this.ensurePopupMenuCreated();
    return this.popupMenu$JMenu.add$JMenuItem(menuItem);
  }
  /**
   * Appends a component to the end of this menu.
   * Returns the component added.
   *
   * @param c the <code>Component</code> to add
   * @return the <code>Component</code> added
   */
  add$Component(c: Component): Component {
    this.ensurePopupMenuCreated();
    this.popupMenu$JMenu.add$Component(c);
    return c;
  }
  /**
   * Adds the specified component to this container at the given
   * position. If <code>index</code> equals -1, the component will
   * be appended to the end.
   * @param     c   the <code>Component</code> to add
   * @param     index    the position at which to insert the component
   * @return    the <code>Component</code> added
   * @see       #remove
   * @see java.awt.Container#add(Component, int)
   */
  add$Component$int(c: Component, index: number): Component {
    this.ensurePopupMenuCreated();
    this.popupMenu$JMenu.add$Component$int(c, index);
    return c;
  }
  /**
   * Creates a new menu item attached to the specified {@code Action} object
   * and appends it to the end of this menu.
   *
   * @param a the {@code Action} for the menu item to be added
   * @return the new {@code JMenuItem}
   * @see Action
   */
  add$Action(a: Action): JMenuItem {
    let mi = this.createActionComponent(a);
    mi.setAction(a);
    this.add$JMenuItem(mi);
    return mi;
  }
  /**
   * Factory method which creates the <code>JMenuItem</code> for
   * <code>Action</code>s added to the <code>JMenu</code>.
   *
   * @param a the <code>Action</code> for the menu item to be added
   * @return the new menu item
   * @see Action
   *
   * @since 1.3
   */
  createActionComponent(a: Action): JMenuItem {
    let mi = new (JMenu$1())().$o(this)._JMenuItem$();
    mi.setHorizontalTextPosition(SwingConstants.TRAILING);
    mi.setVerticalTextPosition(SwingConstants.CENTER);
    return mi;
  }
  /**
   * Returns a properly configured {@code PropertyChangeListener}
   * which updates the control as changes to the {@code Action} occur.
   *
   * @param b a menu item for which to create a {@code PropertyChangeListener}
   * @return a {@code PropertyChangeListener} for {@code b}
   */
  createActionChangeListener(b: JMenuItem): PropertyChangeListener {
    return b.createActionPropertyChangeListener0(b.getAction());
  }
  /**
   * Appends a new separator to the end of the menu.
   */
  addSeparator(): void {
    this.ensurePopupMenuCreated();
    this.popupMenu$JMenu.addSeparator();
  }
  /**
   * Returns the {@code JMenuItem} at the specified position.
   * If the component at {@code pos} is not a menu item,
   * {@code null} is returned.
   * This method is included for AWT compatibility.
   *
   * @param pos  an integer specifying the position
   * @return  the menu item at the specified position; or <code>null</code>
   *          if the item as the specified position is not a menu item
   * @throws  IllegalArgumentException if the value of
   *             {@code pos} &lt; 0
   */
  getItem(pos: number): JMenuItem {
    if (pos < 0) {
      throw new IllegalArgumentException('index less than zero.');
    }
    let c = this.getMenuComponent(pos);
    if (c instanceof JMenuItem) {
      let mi = c;
      return mi;
    }
    return null;
  }
  /**
   * Returns the number of items on the menu, including separators.
   * This method is included for AWT compatibility.
   *
   * @return an integer equal to the number of items on the menu
   * @see #getMenuComponentCount
   */
  getItemCount(): number {
    return this.getMenuComponentCount();
  }
  /**
   * Removes the menu item at the specified index from this menu.
   *
   * @param       pos the position of the item to be removed
   * @throws   IllegalArgumentException if the value of
   *                       <code>pos</code> &lt; 0, or if <code>pos</code>
   *                       is greater than the number of menu items
   */
  remove$int(pos: number): void {
    if (pos < 0) {
      throw new IllegalArgumentException('index less than zero.');
    }
    if (pos > this.getItemCount()) {
      throw new IllegalArgumentException('index greater than the number of items.');
    }
    if (this.popupMenu$JMenu != null) {
      this.popupMenu$JMenu.remove$int(pos);
    }
  }
  /**
   * Removes the component <code>c</code> from this menu.
   *
   * @param       c the component to be removed
   */
  remove$Component(c: Component): void {
    if (this.popupMenu$JMenu != null) {
      this.popupMenu$JMenu.remove$Component(c);
    }
  }
  /**
   * Removes all menu items from this menu.
   */
  removeAll(): void {
    if (this.popupMenu$JMenu != null) {
      this.popupMenu$JMenu.removeAll();
    }
  }
  /**
   * Returns the number of components on the menu.
   *
   * @return an integer containing the number of components on the menu
   */
  getMenuComponentCount(): number {
    let componentCount = 0;
    if (this.popupMenu$JMenu != null) {
      componentCount = this.popupMenu$JMenu.getComponentCount();
    }
    return componentCount;
  }
  /**
   * Returns the component at position <code>n</code>.
   *
   * @param n the position of the component to be returned
   * @return the component requested, or <code>null</code>
   *                  if there is no popup menu
   */
  getMenuComponent(n: number): Component {
    if (this.popupMenu$JMenu != null) {
      return this.popupMenu$JMenu.getComponent$int(n);
    }
    return null;
  }
  /**
   * Returns an array of <code>Component</code>s of the menu's
   * subcomponents.  Note that this returns all <code>Component</code>s
   * in the popup menu, including separators.
   *
   * @return an array of <code>Component</code>s or an empty array
   *          if there is no popup menu
   */
  getMenuComponents(): Component[] {
    if (this.popupMenu$JMenu != null) {
      return this.popupMenu$JMenu.getComponents();
    }
    return $J.newArray(0, null);
  }
  /**
   * Returns true if the menu is a 'top-level menu', that is, if it is
   * the direct child of a menubar.
   *
   * @return true if the menu is activated from the menu bar;
   *         false if the menu is activated from a menu item
   *         on another menu
   */
  isTopLevelMenu(): boolean {
    return this.getParent() instanceof JMenuBar;
  }
  /**
   * Returns the popupmenu associated with this menu.  If there is
   * no popupmenu, it will create one.
   *
   * @return the {@code JPopupMenu} associated with this menu
   */
  getPopupMenu(): JPopupMenu {
    this.ensurePopupMenuCreated();
    return this.popupMenu$JMenu;
  }
  /**
   * Adds a listener for menu events.
   *
   * @param l the listener to be added
   */
  addMenuListener(l: MenuListener): void {
    this.listenerList.add($J.cls(MenuListener), l);
  }
  /**
   * Removes a listener for menu events.
   *
   * @param l the listener to be removed
   */
  removeMenuListener(l: MenuListener): void {
    this.listenerList.remove($J.cls(MenuListener), l);
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
   *
   * @throws Error  if there is a <code>null</code> listener
   * @see EventListenerList
   */
  fireMenuSelected(): void {
    if (JMenu.DEBUG) {
      $J.out.println('In JMenu.fireMenuSelected');
    }
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuListener)) {
        if ((listeners[(i + 1) | 0]) == null) {
          throw new JError(this.getText() + ' has a NULL Listener!! ' + i);
        } else {
          if (this.menuEvent == null) {
            this.menuEvent = new MenuEvent()._MenuEvent(this);
          }
          (listeners[(i + 1) | 0]).menuSelected(this.menuEvent);
        }
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is created lazily.
   *
   * @throws Error if there is a <code>null</code> listener
   * @see EventListenerList
   */
  fireMenuDeselected(): void {
    if (JMenu.DEBUG) {
      $J.out.println('In JMenu.fireMenuDeselected');
    }
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuListener)) {
        if ((listeners[(i + 1) | 0]) == null) {
          throw new JError(this.getText() + ' has a NULL Listener!! ' + i);
        } else {
          if (this.menuEvent == null) {
            this.menuEvent = new MenuEvent()._MenuEvent(this);
          }
          (listeners[(i + 1) | 0]).menuDeselected(this.menuEvent);
        }
      }
    }
  }
  configureAcceleratorFromAction(a: Action): void {
  }
  createMenuChangeListener(): ChangeListener {
    return $J.fn(new JMenu$MenuChangeListener().$o(this)._JMenu$MenuChangeListener(), 'stateChanged');
  }
  /**
   * Creates a window-closing listener for the popup.
   *
   * @param p the <code>JPopupMenu</code>
   * @return the new window-closing listener
   *
   * @see WinListener
   */
  createWinListener(p: JPopupMenu): JMenu$WinListener {
    return new JMenu$WinListener().$o(this)._JMenu$WinListener(p);
  }
  /**
   * Messaged when the menubar selection changes to activate or
   * deactivate this menu.
   * Overrides <code>JMenuItem.menuSelectionChanged</code>.
   *
   * @param isIncluded  true if this menu is active, false if
   *        it is not
   */
  menuSelectionChanged(isIncluded: boolean): void {
    if (JMenu.DEBUG) {
      $J.out.println('In JMenu.menuSelectionChanged to ' + isIncluded);
    }
    this.setSelected(isIncluded);
  }
  /**
   * Returns an array of <code>MenuElement</code>s containing the submenu
   * for this menu component.  If popup menu is <code>null</code> returns
   * an empty array.  This method is required to conform to the
   * <code>MenuElement</code> interface.  Note that since
   * <code>JSeparator</code>s do not conform to the <code>MenuElement</code>
   * interface, this array will only contain <code>JMenuItem</code>s.
   *
   * @return an array of <code>MenuElement</code> objects
   */
  getSubElements(): MenuElement[] {
    if (this.popupMenu$JMenu == null) {
      return $J.newArray(0, null);
    } else {
      let result = $J.newArray(1, null);
      result[0] = this.popupMenu$JMenu;
      return result;
    }
  }
  /**
   * Returns the <code>java.awt.Component</code> used to
   * paint this <code>MenuElement</code>.
   * The returned component is used to convert events and detect if
   * an event is inside a menu component.
   */
  getComponent$(): Component {
    return this;
  }
  /**
   * Sets the <code>ComponentOrientation</code> property of this menu
   * and all components contained within it. This includes all
   * components returned by {@link #getMenuComponents getMenuComponents}.
   *
   * @param o the new component orientation of this menu and
   *        the components contained within it.
   * @throws NullPointerException if <code>orientation</code> is null.
   * @see java.awt.Component#setComponentOrientation
   * @see java.awt.Component#getComponentOrientation
   * @since 1.4
   */
  applyComponentOrientation(o: ComponentOrientation): void {
    super.applyComponentOrientation(o);
    if (this.popupMenu$JMenu != null) {
      let ncomponents = this.getMenuComponentCount();
      for (let i = 0; i < ncomponents; ++i) {
        this.getMenuComponent(i).applyComponentOrientation(o);
      }
      this.popupMenu$JMenu.setComponentOrientation(o);
    }
  }
  /**
   * Sets the orientation for this menu and its associated popup menu
   * determined by the {@code ComponentOrientation} argument.
   *
   * @param o the new orientation for this menu and
   *          its associated popup menu.
   */
  setComponentOrientation(o: ComponentOrientation): void {
    super.setComponentOrientation(o);
    if (this.popupMenu$JMenu != null) {
      this.popupMenu$JMenu.setComponentOrientation(o);
    }
  }
  /**
   * <code>setAccelerator</code> is not defined for <code>JMenu</code>.
   * Use <code>setMnemonic</code> instead.
   * @param keyStroke  the keystroke combination which will invoke
   *                  the <code>JMenuItem</code>'s actionlisteners
   *                  without navigating the menu hierarchy
   * @throws Error  if invoked -- this method is not defined for JMenu.
   *                  Use <code>setMnemonic</code> instead
   */
  setAccelerator(keyStroke: KeyStroke): void {
    throw new JError('setAccelerator() is not defined for JMenu.  Use setMnemonic() instead.');
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
   * Programmatically performs a "click".  This overrides the method
   * <code>AbstractButton.doClick</code> in order to make the menu pop up.
   * @param pressTime  indicates the number of milliseconds the
   *          button was pressed for
   */
  doClick$int(pressTime: number): void {
    let me = this.buildMenuElementArray(this);
    MenuSelectionManager.defaultManager().setSelectedPath(me);
  }
  buildMenuElementArray(leaf: JMenu): MenuElement[] {
    let elements = new ArrayList();
    let current = leaf.getPopupMenu();
    let pop: JPopupMenu;
    let menu: JMenu;
    let bar: JMenuBar;
    while (true) {
      if (current instanceof JPopupMenu) {
        pop = current;
        elements.add(0, pop);
        current = pop.getInvoker();
      } else if (current instanceof JMenu) {
        menu = current;
        elements.add(0, menu);
        current = menu.getParent();
      } else if (current instanceof JMenuBar) {
        bar = current;
        elements.add(0, bar);
        break;
      } else {
        break;
      }
    }
    let me = $J.toArrayInto(elements.toArray(), $J.newArray(0, null));
    return me;
  }
  /**
   * Returns a string representation of this <code>JMenu</code>. This
   * method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JMenu.
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Gets the AccessibleContext associated with this JMenu.
   * For JMenus, the AccessibleContext takes the form of an
   * AccessibleJMenu.
   * A new AccessibleJMenu instance is created if necessary.
   *
   * @return an AccessibleJMenu that serves as the
   *         AccessibleContext of this JMenu
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JMenu$AccessibleJMenu().$o(this)._JMenu$AccessibleJMenu();
    }
    return this.accessibleContext;
  }
}

export class JMenu$MenuChangeListener extends JObject {
  isSelected_: boolean = false;
  _JMenu$MenuChangeListener(): this {
    this.isSelected_ = false;
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    let model = e.getSource();
    let modelSelected = model.isSelected();
    if (modelSelected !== this.isSelected_) {
      if (modelSelected === true) {
        this.$outer.fireMenuSelected();
      } else {
        this.$outer.fireMenuDeselected();
      }
      this.isSelected_ = modelSelected;
    }
  }
}

/**
 * A listener class that watches for a popup window closing.
 * When the popup is closing, the listener deselects the menu.
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
export class JMenu$WinListener extends WindowAdapter {
  popupMenu: JPopupMenu = null;
  /**
   * Create the window listener for the specified popup.
   *
   * @param p the popup menu for which to create a listener
   * @since 1.4
   */
  _JMenu$WinListener(p: JPopupMenu): this {
    this._WindowAdapter();
    this.popupMenu = p;
    return this;
  }
  /**
   * Deselect the menu when the popup is closed from outside.
   */
  windowClosing(e: WindowEvent): void {
    this.$outer.setSelected(false);
  }
}

/**
 * This class implements accessibility support for the
 * <code>JMenu</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to menu user-interface elements.
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
export class JMenu$AccessibleJMenu extends JMenuItem$AccessibleJMenuItem {
  /**
   * Constructs an {@code AccessibleJMenu}.
   */
  _JMenu$AccessibleJMenu(): this {
    this._JMenuItem$AccessibleJMenuItem();
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
    let children = this.$outer.getMenuComponents();
    let count = 0;
    for (let child of children) {
      if ($J.isa(child, Accessible)) {
        count++;
      }
    }
    return count;
  }
  /**
   * Returns the nth Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    let children = this.$outer.getMenuComponents();
    let count = 0;
    for (let child of children) {
      if ($J.isa(child, Accessible)) {
        if (count === i) {
          if (child instanceof JComponent) {
            let ac = child.getAccessibleContext();
            ac.setAccessibleParent(this.$outer);
          }
          return child;
        } else {
          count++;
        }
      }
    }
    return null;
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
   * Returns the currently selected sub-menu if one is selected,
   * otherwise null (there can only be one selection, and it can
   * only be a sub-menu, as otherwise menu items don't remain
   * selected).
   */
  getAccessibleSelection$int(i: number): Accessible {
    if (i < 0 || i >= this.$outer.getItemCount()) {
      return null;
    }
    let me = MenuSelectionManager.defaultManager().getSelectedPath();
    if (me != null) {
      for (let j = 0; j < me.length; j++) {
        if (me[j] === this.$outer) {
          while (++j < me.length) {
            if (me[j] instanceof JMenuItem) {
              return me[j];
            }
          }
        }
      }
    }
    return null;
  }
  /**
   * Returns true if the current child of this object is selected
   * (that is, if this child is a popped-up submenu).
   *
   * @param i the zero-based index of the child in this Accessible
   * object.
   * @see AccessibleContext#getAccessibleChild
   */
  isAccessibleChildSelected(i: number): boolean {
    let me = MenuSelectionManager.defaultManager().getSelectedPath();
    if (me != null) {
      let mi = this.$outer.getItem(i);
      for (let j = 0; j < me.length; j++) {
        if (me[j] === mi) {
          return true;
        }
      }
    }
    return false;
  }
}

let $JMenu$1: any = null;
/** An anonymous class (JMenu.java:636). */
function JMenu$1(): any {
  return $JMenu$1 ??= $J.local(class extends JMenuItem {
    createActionPropertyChangeListener(a: Action): PropertyChangeListener {
      let pcl = this.$outer.createActionChangeListener(this);
      if (pcl == null) {
        pcl = super.createActionPropertyChangeListener(a);
      }
      return pcl;
    }
  }, 'javax.swing.JMenu$1', []);
}

$J.define(JMenu, 'javax.swing.JMenu', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.MenuElement'], sup: 'javax.swing.JMenuItem', ctors: { 'java.lang.String,boolean': '_JMenu$String$boolean', 'javax.swing.Action': '_JMenu$Action', 'java.lang.String': '_JMenu$String', '': '_JMenu$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JMenu', 'doClick(int)': 'doClick$int', 'processKeyEvent(java.awt.event.KeyEvent)': 'processKeyEvent$KeyEvent', 'getComponent()': 'getComponent$', 'translateToPopupMenu(int,int)': 'translateToPopupMenu$int$int$JMenu', 'translateToPopupMenu(java.awt.Point)': 'translateToPopupMenu$Point$JMenu', 'remove(java.awt.Component)': 'remove$Component', 'remove(int)': 'remove$int', 'remove(javax.swing.JMenuItem)': 'remove$JMenuItem', 'insert(javax.swing.Action,int)': 'insert$Action$int', 'insert(javax.swing.JMenuItem,int)': 'insert$JMenuItem$int', 'insert(java.lang.String,int)': 'insert$String$int', 'add(javax.swing.Action)': 'add$Action', 'add(java.lang.String)': 'add$String', 'add(java.awt.Component,int)': 'add$Component$int', 'add(java.awt.Component)': 'add$Component', 'add(javax.swing.JMenuItem)': 'add$JMenuItem' } });
$J.define(JMenu$MenuChangeListener, 'javax.swing.JMenu$MenuChangeListener', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JMenu$MenuChangeListener' }, inner: true });
$J.define(JMenu$WinListener, 'javax.swing.JMenu$WinListener', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.event.WindowAdapter', ctors: { 'javax.swing.JPopupMenu': '_JMenu$WinListener' }, inner: true });
$J.define(JMenu$AccessibleJMenu, 'javax.swing.JMenu$AccessibleJMenu', { kind: 'class', ifaces: ['javax.accessibility.AccessibleSelection'], sup: 'javax.swing.JMenuItem$AccessibleJMenuItem', ctors: { '': '_JMenu$AccessibleJMenu' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  GraphicsDevice = $J.load('java.awt.GraphicsDevice');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  Accessible = $J.load('javax.accessibility.Accessible');
  JComponent = $J.load('javax.swing.JComponent');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  MenuEvent = $J.load('javax.swing.event.MenuEvent');
  MenuListener = $J.load('javax.swing.event.MenuListener');
});
