// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JMenuItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../jre/index.ts';
import { AbstractButton } from './AbstractButton.ts';
import { AbstractButton$AccessibleAbstractButton } from './AbstractButton.ts';

let KeyEvent, MouseEvent, AccessibleContext, AccessibleState, Action, DefaultButtonModel, JInternalFrame, KeyStroke, MenuSelectionManager, SwingConstants, SwingUtilities, UIManager, MenuDragMouseEvent, MenuDragMouseListener, MenuKeyEvent, MenuKeyListener;

/**
 * An implementation of an item in a menu. A menu item is essentially a button
 * sitting in a list. When the user selects the "button", the action
 * associated with the menu item is performed. A <code>JMenuItem</code>
 * contained in a <code>JPopupMenu</code> performs exactly that function.
 * <p>
 * Menu items can be configured, and to some degree controlled, by
 * <code><a href="Action.html">Action</a></code>s.  Using an
 * <code>Action</code> with a menu item has many benefits beyond directly
 * configuring a menu item.  Refer to <a href="Action.html#buttonActions">
 * Swing Components Supporting <code>Action</code></a> for more
 * details, and you can find more information in <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/misc/action.html">How
 * to Use Actions</a>, a section in <em>The Java Tutorial</em>.
 * <p>
 * For further documentation and for examples, see
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
 * @see JPopupMenu
 * @see JMenu
 * @see JCheckBoxMenuItem
 * @see JRadioButtonMenuItem
 * @since 1.2
 */
export class JMenuItem extends AbstractButton {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'MenuItemUI';
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  isMouseDragged: boolean = false;
  accelerator: KeyStroke = null;
  $init_JMenuItem() {
    this.isMouseDragged = false;
  }
  /**
   * Creates a <code>JMenuItem</code> with no set text or icon.
   */
  _JMenuItem$(): this {
    this._JMenuItem$String$Icon(null, null);
    return this;
  }
  /**
   * Creates a <code>JMenuItem</code> with the specified text.
   *
   * @param text the text of the <code>JMenuItem</code>
   */
  _JMenuItem$String(text: string): this {
    this._JMenuItem$String$Icon(text, null);
    return this;
  }
  /**
   * Creates a <code>JMenuItem</code> with the specified text and icon.
   *
   * @param text the text of the <code>JMenuItem</code>
   * @param icon the icon of the <code>JMenuItem</code>
   */
  _JMenuItem$String$Icon(text: string, icon: Icon): this {
    this._AbstractButton();
    this.$init_JMenuItem();
    this.setModel(new DefaultButtonModel()._DefaultButtonModel());
    this.init(text, icon);
    this.initFocusability();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setModel(newModel: ButtonModel): void {
    super.setModel(newModel);
    if (newModel instanceof DefaultButtonModel) {
      (newModel).setMenuItem(true);
    }
  }
  /**
   * Inititalizes the focusability of the <code>JMenuItem</code>.
   * <code>JMenuItem</code>'s are focusable, but subclasses may
   * want to be, this provides them the opportunity to override this
   * and invoke something else, or nothing at all. Refer to
   * {@link javax.swing.JMenu#initFocusability} for the motivation of
   * this.
   */
  initFocusability(): void {
    this.setFocusable(false);
  }
  /**
   * Initializes the menu item with the specified text and icon.
   *
   * @param text the text of the <code>JMenuItem</code>
   * @param icon the icon of the <code>JMenuItem</code>
   */
  init(text: string, icon: Icon): void {
    if (text != null) {
      this.setText(text);
    }
    if (icon != null) {
      this.setIcon(icon);
    }
    this.addFocusListener(new JMenuItem$MenuItemFocusListener()._JMenuItem$MenuItemFocusListener());
    this.setUIProperty('borderPainted', false);
    this.setFocusPainted(false);
    this.setHorizontalTextPosition(SwingConstants.TRAILING);
    this.setHorizontalAlignment(SwingConstants.LEADING);
    this.updateUI();
  }
  /**
   * Sets the look and feel object that renders this component.
   *
   * @param ui  the <code>JMenuItemUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$MenuItemUI(ui: MenuItemUI): void {
    super.setUI$ButtonUI(ui);
  }
  /**
   * Resets the UI property with a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$MenuItemUI(UIManager.getUI(this));
  }
  /**
   * Returns the suffix used to construct the name of the L&amp;F class used to
   * render this component.
   *
   * @return the string "MenuItemUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JMenuItem.uiClassID;
  }
  /**
   * Identifies the menu item as "armed". If the mouse button is
   * released while it is over this item, the menu's action event
   * will fire. If the mouse button is released elsewhere, the
   * event will not fire and the menu item will be disarmed.
   *
   * @param b true to arm the menu item so it can be selected
   */
  setArmed(b: boolean): void {
    let model = this.getModel();
    let oldValue = model.isArmed();
    if (model.isArmed() !== b) {
      model.setArmed(b);
    }
  }
  /**
   * Returns whether the menu item is "armed".
   *
   * @return true if the menu item is armed, and it can be selected
   * @see #setArmed
   */
  isArmed(): boolean {
    let model = this.getModel();
    return model.isArmed();
  }
  /**
   * Enables or disables the menu item.
   *
   * @param b  true to enable the item
   */
  setEnabled(b: boolean): void {
    if (!b && !UIManager.getBoolean$Object('MenuItem.disabledAreNavigable')) {
      this.setArmed(false);
    }
    super.setEnabled(b);
  }
  /**
   * Returns true since <code>Menu</code>s, by definition,
   * should always be on top of all other windows.  If the menu is
   * in an internal frame false is returned due to the rollover effect
   * for windows laf where the menu is not always on top.
   */
  alwaysOnTop(): boolean {
    if (SwingUtilities.getAncestorOfClass($J.cls(JInternalFrame), this) != null) {
      return false;
    }
    return true;
  }
  /**
   * Sets the key combination which invokes the menu item's
   * action listeners without navigating the menu hierarchy. It is the
   * UI's responsibility to install the correct action.  Note that
   * when the keyboard accelerator is typed, it will work whether or
   * not the menu is currently displayed.
   *
   * @param keyStroke the <code>KeyStroke</code> which will
   *          serve as an accelerator
   */
  setAccelerator(keyStroke: KeyStroke): void {
    let oldAccelerator = this.accelerator;
    this.accelerator = keyStroke;
    this.repaint$();
    this.revalidate();
    this.firePropertyChange$String$Object$Object('accelerator', oldAccelerator, this.accelerator);
  }
  /**
   * Returns the <code>KeyStroke</code> which serves as an accelerator
   * for the menu item.
   * @return a <code>KeyStroke</code> object identifying the
   *          accelerator key
   */
  getAccelerator(): KeyStroke {
    return this.accelerator;
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.3
   */
  configurePropertiesFromAction(a: Action): void {
    super.configurePropertiesFromAction(a);
    this.configureAcceleratorFromAction(a);
  }
  setIconFromAction(a: Action): void {
    let icon = null;
    if (a != null) {
      icon = a.getValue$String(Action.SMALL_ICON);
    }
    this.setIcon(icon);
  }
  largeIconChanged(a: Action): void {
  }
  smallIconChanged(a: Action): void {
    this.setIconFromAction(a);
  }
  configureAcceleratorFromAction(a: Action): void {
    let ks = (a == null) ? null : a.getValue$String(Action.ACCELERATOR_KEY);
    this.setAccelerator(ks);
  }
  /**
   * {@inheritDoc}
   * @since 1.6
   */
  actionPropertyChanged(action: Action, propertyName: string): void {
    if (propertyName === Action.ACCELERATOR_KEY) {
      this.configureAcceleratorFromAction(action);
    } else {
      super.actionPropertyChanged(action, propertyName);
    }
  }
  /**
   * Processes a mouse event forwarded from the
   * <code>MenuSelectionManager</code> and changes the menu
   * selection, if necessary, by using the
   * <code>MenuSelectionManager</code>'s API.
   * <p>
   * Note: you do not have to forward the event to sub-components.
   * This is done automatically by the <code>MenuSelectionManager</code>.
   *
   * @param e   a <code>MouseEvent</code>
   * @param path  the <code>MenuElement</code> path array
   * @param manager   the <code>MenuSelectionManager</code>
   */
  processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager(e: MouseEvent, path: MenuElement[], manager: MenuSelectionManager): void {
    this.processMenuDragMouseEvent(new MenuDragMouseEvent()._MenuDragMouseEvent$Component$int$long$int$int$int$int$int$int$boolean$MenuElementArr$MenuSelectionManager(e.getComponent(), e.getID(), e.getWhen(), e.getModifiers(), e.getX(), e.getY(), e.getXOnScreen(), e.getYOnScreen(), e.getClickCount(), e.isPopupTrigger(), path, manager));
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
    if (JMenuItem.DEBUG) {
      $J.out.println('in JMenuItem.processKeyEvent/3 for ' + this.getText() + '  ' + $J.str(KeyStroke.getKeyStrokeForEvent(e)));
    }
    let mke = new MenuKeyEvent()._MenuKeyEvent(e.getComponent(), e.getID(), e.getWhen(), e.getModifiers(), e.getKeyCode(), e.getKeyChar(), path, manager);
    this.processMenuKeyEvent(mke);
    if (mke.isConsumed()) {
      e.consume();
    }
  }
  /**
   * Handles mouse drag in a menu.
   *
   * @param e  a <code>MenuDragMouseEvent</code> object
   */
  processMenuDragMouseEvent(e: MenuDragMouseEvent): void {
    switch (e.getID()) {
      case MouseEvent.MOUSE_ENTERED:
        this.isMouseDragged = false;
        this.fireMenuDragMouseEntered(e);
        break;
      case MouseEvent.MOUSE_EXITED:
        this.isMouseDragged = false;
        this.fireMenuDragMouseExited(e);
        break;
      case MouseEvent.MOUSE_DRAGGED:
        this.isMouseDragged = true;
        this.fireMenuDragMouseDragged(e);
        break;
      case MouseEvent.MOUSE_RELEASED:
        if (this.isMouseDragged) {
          this.fireMenuDragMouseReleased(e);
        }
        break;
      default:
        break;
    }
  }
  /**
   * Handles a keystroke in a menu.
   *
   * @param e  a <code>MenuKeyEvent</code> object
   */
  processMenuKeyEvent(e: MenuKeyEvent): void {
    if (JMenuItem.DEBUG) {
      $J.out.println('in JMenuItem.processMenuKeyEvent for ' + this.getText() + '  ' + $J.str(KeyStroke.getKeyStrokeForEvent(e)));
    }
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
   * @param event a <code>MenuMouseDragEvent</code>
   * @see EventListenerList
   */
  fireMenuDragMouseEntered(event: MenuDragMouseEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuDragMouseListener)) {
        (listeners[(i + 1) | 0]).menuDragMouseEntered(event);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param event a <code>MenuDragMouseEvent</code>
   * @see EventListenerList
   */
  fireMenuDragMouseExited(event: MenuDragMouseEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuDragMouseListener)) {
        (listeners[(i + 1) | 0]).menuDragMouseExited(event);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param event a <code>MenuDragMouseEvent</code>
   * @see EventListenerList
   */
  fireMenuDragMouseDragged(event: MenuDragMouseEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuDragMouseListener)) {
        (listeners[(i + 1) | 0]).menuDragMouseDragged(event);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param event a <code>MenuDragMouseEvent</code>
   * @see EventListenerList
   */
  fireMenuDragMouseReleased(event: MenuDragMouseEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuDragMouseListener)) {
        (listeners[(i + 1) | 0]).menuDragMouseReleased(event);
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
  fireMenuKeyPressed(event: MenuKeyEvent): void {
    if (JMenuItem.DEBUG) {
      $J.out.println('in JMenuItem.fireMenuKeyPressed for ' + this.getText() + '  ' + $J.str(KeyStroke.getKeyStrokeForEvent(event)));
    }
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
    if (JMenuItem.DEBUG) {
      $J.out.println('in JMenuItem.fireMenuKeyReleased for ' + this.getText() + '  ' + $J.str(KeyStroke.getKeyStrokeForEvent(event)));
    }
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
    if (JMenuItem.DEBUG) {
      $J.out.println('in JMenuItem.fireMenuKeyTyped for ' + this.getText() + '  ' + $J.str(KeyStroke.getKeyStrokeForEvent(event)));
    }
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(MenuKeyListener)) {
        (listeners[(i + 1) | 0]).menuKeyTyped(event);
      }
    }
  }
  /**
   * Called by the <code>MenuSelectionManager</code> when the
   * <code>MenuElement</code> is selected or unselected.
   *
   * @param isIncluded  true if this menu item is on the part of the menu
   *                    path that changed, false if this menu is part of the
   *                    a menu path that changed, but this particular part of
   *                    that path is still the same
   * @see MenuSelectionManager#setSelectedPath(MenuElement[])
   */
  menuSelectionChanged(isIncluded: boolean): void {
    this.setArmed(isIncluded);
  }
  /**
   * This method returns an array containing the sub-menu
   * components for this menu component.
   *
   * @return an array of <code>MenuElement</code>s
   */
  getSubElements(): MenuElement[] {
    return $J.newArray(0, null);
  }
  /**
   * Returns the <code>java.awt.Component</code> used to paint
   * this object. The returned component will be used to convert
   * events and detect if an event is inside a menu component.
   *
   * @return the <code>Component</code> that paints this menu item
   */
  getComponent$(): Component {
    return this;
  }
  /**
   * Adds a <code>MenuDragMouseListener</code> to the menu item.
   *
   * @param l the <code>MenuDragMouseListener</code> to be added
   */
  addMenuDragMouseListener(l: MenuDragMouseListener): void {
    this.listenerList.add($J.cls(MenuDragMouseListener), l);
  }
  /**
   * Removes a <code>MenuDragMouseListener</code> from the menu item.
   *
   * @param l the <code>MenuDragMouseListener</code> to be removed
   */
  removeMenuDragMouseListener(l: MenuDragMouseListener): void {
    this.listenerList.remove($J.cls(MenuDragMouseListener), l);
  }
  /**
   * Adds a <code>MenuKeyListener</code> to the menu item.
   *
   * @param l the <code>MenuKeyListener</code> to be added
   */
  addMenuKeyListener(l: MenuKeyListener): void {
    this.listenerList.add($J.cls(MenuKeyListener), l);
  }
  /**
   * Removes a <code>MenuKeyListener</code> from the menu item.
   *
   * @param l the <code>MenuKeyListener</code> to be removed
   */
  removeMenuKeyListener(l: MenuKeyListener): void {
    this.listenerList.remove($J.cls(MenuKeyListener), l);
  }
  /**
   * Returns a string representation of this <code>JMenuItem</code>.
   * This method is intended to be used only for debugging purposes,
   * and the content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JMenuItem</code>
   */
  paramString(): string {
    return super.paramString();
  }
  /**
   * Returns the <code>AccessibleContext</code> associated with this
   * <code>JMenuItem</code>. For <code>JMenuItem</code>s,
   * the <code>AccessibleContext</code> takes the form of an
   * <code>AccessibleJMenuItem</code>.
   * A new AccessibleJMenuItme instance is created if necessary.
   *
   * @return an <code>AccessibleJMenuItem</code> that serves as the
   *         <code>AccessibleContext</code> of this <code>JMenuItem</code>
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JMenuItem$AccessibleJMenuItem().$o(this)._JMenuItem$AccessibleJMenuItem();
    }
    return this.accessibleContext;
  }
}

export class JMenuItem$MenuItemFocusListener extends JObject {
  _JMenuItem$MenuItemFocusListener(): this {
    return this;
  }
  focusGained(event: FocusEvent): void {
  }
  focusLost(event: FocusEvent): void {
    let mi = event.getSource();
    if (mi.isFocusPainted()) {
      mi.repaint$();
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JMenuItem</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to menu item user-interface
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
export class JMenuItem$AccessibleJMenuItem extends AbstractButton$AccessibleAbstractButton {
  isArmed_: boolean = false;
  hasFocus_: boolean = false;
  isPressed_: boolean = false;
  isSelected_: boolean = false;
  _JMenuItem$AccessibleJMenuItem(): this {
    this._AbstractButton$AccessibleAbstractButton();
    this.isArmed_ = false;
    this.hasFocus_ = false;
    this.isPressed_ = false;
    this.isSelected_ = false;
    this.$outer.addChangeListener($J.fn(this, 'stateChanged'));
    return this;
  }
  fireAccessibilityFocusedEvent(toCheck: JMenuItem): void {
    let path = MenuSelectionManager.defaultManager().getSelectedPath();
    if (path.length > 0) {
      let menuItem = path[(path.length - 1) | 0];
      if (toCheck === menuItem) {
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.FOCUSED);
      }
    }
  }
  /**
   * Supports the change listener interface and fires property changes.
   */
  stateChanged(e: ChangeEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
    if (this.$outer.getModel().isArmed()) {
      if (!this.isArmed_) {
        this.isArmed_ = true;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.ARMED);
        this.fireAccessibilityFocusedEvent(this.$outer);
      }
    } else {
      if (this.isArmed_) {
        this.isArmed_ = false;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.ARMED, null);
      }
    }
    if (this.$outer.isFocusOwner()) {
      if (!this.hasFocus_) {
        this.hasFocus_ = true;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.FOCUSED);
      }
    } else {
      if (this.hasFocus_) {
        this.hasFocus_ = false;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.FOCUSED, null);
      }
    }
    if (this.$outer.getModel().isPressed()) {
      if (!this.isPressed_) {
        this.isPressed_ = true;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.PRESSED);
      }
    } else {
      if (this.isPressed_) {
        this.isPressed_ = false;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.PRESSED, null);
      }
    }
    if (this.$outer.getModel().isSelected()) {
      if (!this.isSelected_) {
        this.isSelected_ = true;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.CHECKED);
        this.fireAccessibilityFocusedEvent(this.$outer);
      }
    } else {
      if (this.isSelected_) {
        this.isSelected_ = false;
        this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.CHECKED, null);
      }
    }
  }
}

$J.define(JMenuItem, 'javax.swing.JMenuItem', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.swing.MenuElement'], sup: 'javax.swing.AbstractButton', ctors: { 'java.lang.String,int': '_JMenuItem$String$int', 'java.lang.String,javax.swing.Icon': '_JMenuItem$String$Icon', 'javax.swing.Action': '_JMenuItem$Action', 'java.lang.String': '_JMenuItem$String', 'javax.swing.Icon': '_JMenuItem$Icon', '': '_JMenuItem$' }, meths: { 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JMenuItem', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JMenuItem', 'getComponent()': 'getComponent$', 'processKeyEvent(java.awt.event.KeyEvent,javax.swing.MenuElement[],javax.swing.MenuSelectionManager)': 'processKeyEvent$KeyEvent$MenuElementArr$MenuSelectionManager', 'processMouseEvent(java.awt.event.MouseEvent,javax.swing.MenuElement[],javax.swing.MenuSelectionManager)': 'processMouseEvent$MouseEvent$MenuElementArr$MenuSelectionManager', 'setUI(javax.swing.plaf.MenuItemUI)': 'setUI$MenuItemUI' } });
$J.define(JMenuItem$MenuItemFocusListener, 'javax.swing.JMenuItem$MenuItemFocusListener', { kind: 'class', ifaces: ['java.awt.event.FocusListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JMenuItem$MenuItemFocusListener' } });
$J.define(JMenuItem$AccessibleJMenuItem, 'javax.swing.JMenuItem$AccessibleJMenuItem', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener'], sup: 'javax.swing.AbstractButton$AccessibleAbstractButton', ctors: { '': '_JMenuItem$AccessibleJMenuItem' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  Action = $J.load('javax.swing.Action');
  DefaultButtonModel = $J.load('javax.swing.DefaultButtonModel');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  MenuDragMouseEvent = $J.load('javax.swing.event.MenuDragMouseEvent');
  MenuDragMouseListener = $J.load('javax.swing.event.MenuDragMouseListener');
  MenuKeyEvent = $J.load('javax.swing.event.MenuKeyEvent');
  MenuKeyListener = $J.load('javax.swing.event.MenuKeyListener');
});
