// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicPopupMenuUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, Applet, ArrayList, Arrays, Character, JError, JObject, RuntimeException, StringBuilder, SunToolkit, Toolkit } from '../../../../../jre/index.ts';
import { PopupMenuUI } from '../PopupMenuUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let AWTEvent, ComponentOrientation, KeyboardFocusManager, Window, FocusAdapter, MouseEvent, BoxLayout, JApplet, JComboBox, JComponent, JDialog, JFrame, JMenu, JMenuBar, JMenuItem, JPopupMenu, JRootPane, JWindow, LookAndFeel, MenuElement, MenuSelectionManager, SwingUtilities, UIManager, UIResource, BasicComboBoxUI, BasicLookAndFeel, BasicMenuItemUI, DefaultMenuLayout, LazyActionMap, UngrabEvent;

/**
 * A Windows L&amp;F implementation of PopupMenuUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 */
export class BasicPopupMenuUI extends PopupMenuUI {
  static MOUSE_GRABBER_KEY: StringBuilder = null;
  static MENU_KEYBOARD_HELPER_KEY: StringBuilder = null;
  /**
   * The instance of {@code JPopupMenu}.
   */
  popupMenu: JPopupMenu = null;
  popupMenuListener: PopupMenuListener = null;
  menuKeyListener: MenuKeyListener = null;
  static checkedUnpostPopup: boolean = false;
  static unpostPopup: boolean = false;
  /**
   * Constructs a new instance of {@code BasicPopupMenuUI}.
   */
  _BasicPopupMenuUI(): this {
    this._PopupMenuUI();
    this.popupMenu = null;
    this.popupMenuListener = null;
    this.menuKeyListener = null;
    BasicLookAndFeel.needsEventHelper = true;
    let laf = UIManager.getLookAndFeel();
    if (laf instanceof BasicLookAndFeel) {
      (laf).installAWTEventListener();
    }
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicPopupMenuUI}.
   *
   * @param x a component
   * @return a new instance of {@code BasicPopupMenuUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicPopupMenuUI()._BasicPopupMenuUI();
  }
  installUI(c: JComponent): void {
    this.popupMenu = c;
    this.installDefaults();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    if (this.popupMenu.getLayout() == null || $J.isa(this.popupMenu.getLayout(), UIResource)) {
      this.popupMenu.setLayout(new DefaultMenuLayout()._DefaultMenuLayout(this.popupMenu, BoxLayout.Y_AXIS));
    }
    LookAndFeel.installProperty(this.popupMenu, 'opaque', true);
    LookAndFeel.installBorder(this.popupMenu, 'PopupMenu.border');
    LookAndFeel.installColorsAndFont(this.popupMenu, 'PopupMenu.background', 'PopupMenu.foreground', 'PopupMenu.font');
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    if (this.popupMenuListener == null) {
      this.popupMenuListener = new BasicPopupMenuUI$BasicPopupMenuListener()._BasicPopupMenuUI$BasicPopupMenuListener();
    }
    this.popupMenu.addPopupMenuListener(this.popupMenuListener);
    if (this.menuKeyListener == null) {
      this.menuKeyListener = new BasicPopupMenuUI$BasicMenuKeyListener().$o(this)._BasicPopupMenuUI$BasicMenuKeyListener();
    }
    this.popupMenu.addMenuKeyListener(this.menuKeyListener);
    let context = AppContext.getAppContext();
    {
      let mouseGrabber = context.get(BasicPopupMenuUI.MOUSE_GRABBER_KEY);
      if (mouseGrabber == null) {
        mouseGrabber = new BasicPopupMenuUI$MouseGrabber()._BasicPopupMenuUI$MouseGrabber();
        context.put(BasicPopupMenuUI.MOUSE_GRABBER_KEY, mouseGrabber);
      }
    }
    {
      let helper = context.get(BasicPopupMenuUI.MENU_KEYBOARD_HELPER_KEY);
      if (helper == null) {
        helper = new BasicPopupMenuUI$MenuKeyboardHelper()._BasicPopupMenuUI$MenuKeyboardHelper();
        context.put(BasicPopupMenuUI.MENU_KEYBOARD_HELPER_KEY, helper);
        let msm = MenuSelectionManager.defaultManager();
        msm.addChangeListener($J.fn(helper, 'stateChanged'));
      }
    }
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
  }
  static getInputMap(popup: JPopupMenu, c: JComponent): InputMap {
    let windowInputMap = null;
    let bindings = UIManager.get$Object('PopupMenu.selectedWindowInputMapBindings');
    if (bindings != null) {
      windowInputMap = LookAndFeel.makeComponentInputMap(c, bindings);
      if (!popup.getComponentOrientation().isLeftToRight()) {
        let km = UIManager.get$Object('PopupMenu.selectedWindowInputMapBindings.RightToLeft');
        if (km != null) {
          let rightToLeftInputMap = LookAndFeel.makeComponentInputMap(c, km);
          rightToLeftInputMap.setParent(windowInputMap);
          windowInputMap = rightToLeftInputMap;
        }
      }
    }
    return windowInputMap;
  }
  static getActionMap(): ActionMap {
    return LazyActionMap.getActionMap($J.cls(BasicPopupMenuUI), 'PopupMenu.actionMap');
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicPopupMenuUI$Actions()._BasicPopupMenuUI$Actions(BasicPopupMenuUI$Actions.CANCEL));
    map.put$Action(new BasicPopupMenuUI$Actions()._BasicPopupMenuUI$Actions(BasicPopupMenuUI$Actions.SELECT_NEXT));
    map.put$Action(new BasicPopupMenuUI$Actions()._BasicPopupMenuUI$Actions(BasicPopupMenuUI$Actions.SELECT_PREVIOUS));
    map.put$Action(new BasicPopupMenuUI$Actions()._BasicPopupMenuUI$Actions(BasicPopupMenuUI$Actions.SELECT_PARENT));
    map.put$Action(new BasicPopupMenuUI$Actions()._BasicPopupMenuUI$Actions(BasicPopupMenuUI$Actions.SELECT_CHILD));
    map.put$Action(new BasicPopupMenuUI$Actions()._BasicPopupMenuUI$Actions(BasicPopupMenuUI$Actions.RETURN));
    BasicLookAndFeel.installAudioActionMap(map);
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    this.popupMenu = null;
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    LookAndFeel.uninstallBorder(this.popupMenu);
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    if (this.popupMenuListener != null) {
      this.popupMenu.removePopupMenuListener(this.popupMenuListener);
    }
    if (this.menuKeyListener != null) {
      this.popupMenu.removeMenuKeyListener(this.menuKeyListener);
    }
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.popupMenu, null);
    SwingUtilities.replaceUIInputMap(this.popupMenu, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
  }
  static getFirstPopup(): MenuElement {
    let msm = MenuSelectionManager.defaultManager();
    let p = msm.getSelectedPath();
    let me = null;
    for (let i = 0; me == null && i < p.length; i++) {
      if (p[i] instanceof JPopupMenu) {
        me = p[i];
      }
    }
    return me;
  }
  static getLastPopup(): JPopupMenu {
    let msm = MenuSelectionManager.defaultManager();
    let p = msm.getSelectedPath();
    let popup = null;
    for (let i = (p.length - 1) | 0; popup == null && i >= 0; i--) {
      if (p[i] instanceof JPopupMenu) {
        popup = p[i];
      }
    }
    return popup;
  }
  static getPopups(): List<JPopupMenu> {
    let msm = MenuSelectionManager.defaultManager();
    let p = msm.getSelectedPath();
    let list = new ArrayList(p.length);
    for (let element of p) {
      if (element instanceof JPopupMenu) {
        list.add(element);
      }
    }
    return list;
  }
  static checkInvokerEqual(present: MenuElement, last: MenuElement): boolean {
    let invokerPresent = present.getComponent$();
    let invokerLast = last.getComponent$();
    if (invokerPresent instanceof JPopupMenu) {
      invokerPresent = (invokerPresent).getInvoker();
    }
    if (invokerLast instanceof JPopupMenu) {
      invokerLast = (invokerLast).getInvoker();
    }
    return (invokerPresent === invokerLast);
  }
  static nextEnabledChild(e: MenuElement[], fromIndex: number, toIndex: number): MenuElement {
    for (let i = fromIndex; i <= toIndex; i++) {
      if (e[i] != null) {
        let comp = e[i].getComponent$();
        if (comp != null && (comp.isEnabled() || UIManager.getBoolean$Object('MenuItem.disabledAreNavigable')) && comp.isVisible$()) {
          return e[i];
        }
      }
    }
    return null;
  }
  static previousEnabledChild(e: MenuElement[], fromIndex: number, toIndex: number): MenuElement {
    for (let i = fromIndex; i >= toIndex; i--) {
      if (e[i] != null) {
        let comp = e[i].getComponent$();
        if (comp != null && (comp.isEnabled() || UIManager.getBoolean$Object('MenuItem.disabledAreNavigable')) && comp.isVisible$()) {
          return e[i];
        }
      }
    }
    return null;
  }
  static findEnabledChild$MenuElementArr$int$boolean(e: MenuElement[], fromIndex: number, forward: boolean): MenuElement {
    let result: MenuElement;
    if (forward) {
      result = BasicPopupMenuUI.nextEnabledChild(e, (fromIndex + 1) | 0, (e.length - 1) | 0);
      if (result == null) {
        result = BasicPopupMenuUI.nextEnabledChild(e, 0, (fromIndex - 1) | 0);
      }
    } else {
      result = BasicPopupMenuUI.previousEnabledChild(e, (fromIndex - 1) | 0, 0);
      if (result == null) {
        result = BasicPopupMenuUI.previousEnabledChild(e, (e.length - 1) | 0, (fromIndex + 1) | 0);
      }
    }
    return result;
  }
  static findEnabledChild$MenuElementArr$MenuElement$boolean(e: MenuElement[], elem: MenuElement, forward: boolean): MenuElement {
    for (let i = 0; i < e.length; i++) {
      if (e[i] === elem) {
        return BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(e, i, forward);
      }
    }
    return null;
  }
  static $clinit() {
    BasicPopupMenuUI.MOUSE_GRABBER_KEY = new StringBuilder('javax.swing.plaf.basic.BasicPopupMenuUI.MouseGrabber');
    BasicPopupMenuUI.MENU_KEYBOARD_HELPER_KEY = new StringBuilder('javax.swing.plaf.basic.BasicPopupMenuUI.MenuKeyboardHelper');
  }
}

/**
 * This Listener fires the Action that provides the correct auditory
 * feedback.
 *
 * @since 1.4
 */
export class BasicPopupMenuUI$BasicPopupMenuListener extends JObject {
  _BasicPopupMenuUI$BasicPopupMenuListener(): this {
    return this;
  }
  popupMenuCanceled(e: PopupMenuEvent): void {
  }
  popupMenuWillBecomeInvisible(e: PopupMenuEvent): void {
  }
  popupMenuWillBecomeVisible(e: PopupMenuEvent): void {
    BasicLookAndFeel.playSound(e.getSource(), 'PopupMenu.popupSound');
  }
}

/**
 * Handles mnemonic for children JMenuItems.
 * @since 1.5
 */
export class BasicPopupMenuUI$BasicMenuKeyListener extends JObject {
  menuToOpen: MenuElement = null;
  _BasicPopupMenuUI$BasicMenuKeyListener(): this {
    this.menuToOpen = null;
    return this;
  }
  menuKeyTyped(e: MenuKeyEvent): void {
    if (this.menuToOpen != null) {
      let subpopup = (this.menuToOpen).getPopupMenu();
      let subitem = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(subpopup.getSubElements(), -1, true);
      let lst = new ArrayList(Arrays.asList(...e.getPath()));
      lst.add(this.menuToOpen);
      lst.add(subpopup);
      if (subitem != null) {
        lst.add(subitem);
      }
      let newPath = $J.newArray(0, null);
      newPath = $J.toArrayInto(lst.toArray(), newPath);
      MenuSelectionManager.defaultManager().setSelectedPath(newPath);
      e.consume();
    }
    this.menuToOpen = null;
  }
  menuKeyPressed(e: MenuKeyEvent): void {
    let keyChar = e.getKeyChar();
    if (!Character.isLetterOrDigit(keyChar)) {
      return;
    }
    let manager = e.getMenuSelectionManager();
    let path = e.getPath();
    let items = this.$outer.popupMenu.getSubElements();
    let currentIndex = -1;
    let matches = 0;
    let firstMatch = -1;
    let indexes = null;
    for (let j = 0; j < items.length; j++) {
      if (!(items[j] instanceof JMenuItem)) {
        continue;
      }
      let item = items[j];
      let mnemonic = item.getMnemonic();
      if (item.isEnabled() && item.isVisible$() && this.lower$char$BasicPopupMenuUI_BasicMenuKeyListener(keyChar) === this.lower$int$BasicPopupMenuUI_BasicMenuKeyListener(mnemonic)) {
        if (matches === 0) {
          firstMatch = j;
          matches++;
        } else {
          if (indexes == null) {
            indexes = $J.newArray(items.length, 0);
            indexes[0] = firstMatch;
          }
          indexes[matches++] = j;
        }
      }
      if (item.isArmed() || item.isSelected()) {
        currentIndex = (matches - 1) | 0;
      }
    }
    if (matches === 0) {
    } else if (matches === 1) {
      let item = items[firstMatch];
      if (item instanceof JMenu) {
        this.menuToOpen = item;
      } else if (item.isEnabled()) {
        manager.clearSelectedPath();
        SunToolkit.consumeNextKeyTyped(e);
        item.doClick$();
      }
      e.consume();
    } else {
      let newItem: MenuElement;
      newItem = items[indexes[((currentIndex + 1) | 0) % matches]];
      let newPath = $J.newArray((path.length + 1) | 0, null);
      $J.system_arraycopy(path, 0, newPath, 0, path.length);
      newPath[path.length] = newItem;
      manager.setSelectedPath(newPath);
      e.consume();
    }
  }
  menuKeyReleased(e: MenuKeyEvent): void {
  }
  lower$char$BasicPopupMenuUI_BasicMenuKeyListener(keyChar: number): number {
    return Character.toLowerCase(keyChar);
  }
  lower$int$BasicPopupMenuUI_BasicMenuKeyListener(mnemonic: number): number {
    return Character.toLowerCase((mnemonic) & 0xffff);
  }
}

export class BasicPopupMenuUI$Actions extends UIAction {
  static readonly CANCEL: string = 'cancel';
  static readonly SELECT_NEXT: string = 'selectNext';
  static readonly SELECT_PREVIOUS: string = 'selectPrevious';
  static readonly SELECT_PARENT: string = 'selectParent';
  static readonly SELECT_CHILD: string = 'selectChild';
  static readonly RETURN: string = 'return';
  static readonly FORWARD: boolean = true;
  static readonly BACKWARD: boolean = false;
  static readonly PARENT: boolean = false;
  static readonly CHILD: boolean = true;
  _BasicPopupMenuUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let key = this.getName();
    if (key === BasicPopupMenuUI$Actions.CANCEL) {
      this.cancel();
    } else if (key === BasicPopupMenuUI$Actions.SELECT_NEXT) {
      this.selectItem(BasicPopupMenuUI$Actions.FORWARD);
    } else if (key === BasicPopupMenuUI$Actions.SELECT_PREVIOUS) {
      this.selectItem(BasicPopupMenuUI$Actions.BACKWARD);
    } else if (key === BasicPopupMenuUI$Actions.SELECT_PARENT) {
      this.selectParentChild(BasicPopupMenuUI$Actions.PARENT);
    } else if (key === BasicPopupMenuUI$Actions.SELECT_CHILD) {
      this.selectParentChild(BasicPopupMenuUI$Actions.CHILD);
    } else if (key === BasicPopupMenuUI$Actions.RETURN) {
      this.doReturn();
    }
  }
  doReturn(): void {
    let fmgr = KeyboardFocusManager.getCurrentKeyboardFocusManager$();
    let focusOwner = fmgr.getFocusOwner();
    if (focusOwner != null && !(focusOwner instanceof JRootPane)) {
      return;
    }
    let msm = MenuSelectionManager.defaultManager();
    let path = msm.getSelectedPath();
    let lastElement: MenuElement;
    if (path.length > 0) {
      lastElement = path[(path.length - 1) | 0];
      if (lastElement instanceof JMenu) {
        let newPath = $J.newArray((path.length + 1) | 0, null);
        $J.system_arraycopy(path, 0, newPath, 0, path.length);
        newPath[path.length] = (lastElement).getPopupMenu();
        msm.setSelectedPath(newPath);
      } else if (lastElement instanceof JMenuItem) {
        let mi = lastElement;
        if (mi.getUI() instanceof BasicMenuItemUI) {
          (mi.getUI()).doClick(msm);
        } else {
          msm.clearSelectedPath();
          mi.doClick$int(0);
        }
      }
    }
  }
  selectParentChild(direction: boolean): void {
    let msm = MenuSelectionManager.defaultManager();
    let path = msm.getSelectedPath();
    let len = path.length;
    if (direction === BasicPopupMenuUI$Actions.PARENT) {
      let popupIndex = (len - 1) | 0;
      if (len > 2 && (path[popupIndex] instanceof JPopupMenu || path[--popupIndex] instanceof JPopupMenu) && !(path[(popupIndex - 1) | 0]).isTopLevelMenu()) {
        let newPath = $J.newArray(popupIndex, null);
        $J.system_arraycopy(path, 0, newPath, 0, popupIndex);
        msm.setSelectedPath(newPath);
        return;
      }
    } else {
      if (len > 0 && (path[(len - 1) | 0]) instanceof JMenu && !(path[(len - 1) | 0]).isTopLevelMenu()) {
        let menu = path[(len - 1) | 0];
        let popup = menu.getPopupMenu();
        let subs = popup.getSubElements();
        let item = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(subs, -1, true);
        let newPath: MenuElement[];
        if (item == null) {
          newPath = $J.newArray((len + 1) | 0, null);
        } else {
          newPath = $J.newArray((len + 2) | 0, null);
          (newPath[(len + 1) | 0]) = item;
        }
        $J.system_arraycopy(path, 0, newPath, 0, len);
        newPath[len] = popup;
        msm.setSelectedPath(newPath);
        return;
      }
    }
    if (len > 1 && path[0] instanceof JMenuBar) {
      let currentMenu = path[1];
      if (path[0].getComponent$().getComponentOrientation().equals(ComponentOrientation.RIGHT_TO_LEFT)) {
        direction = !direction;
      }
      let nextMenu = BasicPopupMenuUI.findEnabledChild$MenuElementArr$MenuElement$boolean(path[0].getSubElements(), currentMenu, direction);
      if (nextMenu != null && nextMenu !== currentMenu) {
        let newSelection: MenuElement[];
        if (len === 2) {
          newSelection = $J.newArray(2, null);
          newSelection[0] = path[0];
          newSelection[1] = nextMenu;
        } else {
          newSelection = $J.newArray(3, null);
          newSelection[0] = path[0];
          newSelection[1] = nextMenu;
          newSelection[2] = (nextMenu).getPopupMenu();
        }
        msm.setSelectedPath(newSelection);
      }
    }
  }
  selectItem(direction: boolean): void {
    let msm = MenuSelectionManager.defaultManager();
    let path = msm.getSelectedPath();
    if (path.length === 0) {
      return;
    }
    let len = path.length;
    if (len === 1 && path[0] instanceof JPopupMenu) {
      let popup = path[0];
      let newPath = $J.newArray(2, null);
      newPath[0] = popup;
      newPath[1] = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(popup.getSubElements(), -1, direction);
      msm.setSelectedPath(newPath);
    } else if (len === 2 && path[0] instanceof JMenuBar && path[1] instanceof JMenu) {
      let popup = (path[1]).getPopupMenu();
      let next = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(popup.getSubElements(), -1, BasicPopupMenuUI$Actions.FORWARD);
      let newPath: MenuElement[];
      if (next != null) {
        newPath = $J.newArray(4, null);
        newPath[3] = next;
      } else {
        newPath = $J.newArray(3, null);
      }
      $J.system_arraycopy(path, 0, newPath, 0, 2);
      newPath[2] = popup;
      msm.setSelectedPath(newPath);
    } else if ((path[(len - 1) | 0]) instanceof JPopupMenu && (path[(len - 2) | 0]) instanceof JMenu) {
      let menu = path[(len - 2) | 0];
      let popup = menu.getPopupMenu();
      let next = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(popup.getSubElements(), -1, direction);
      if (next != null) {
        let newPath = $J.newArray((len + 1) | 0, null);
        $J.system_arraycopy(path, 0, newPath, 0, len);
        newPath[len] = next;
        msm.setSelectedPath(newPath);
      } else {
        if (len > 2 && (path[(len - 3) | 0]) instanceof JPopupMenu) {
          popup = (path[(len - 3) | 0]);
          next = BasicPopupMenuUI.findEnabledChild$MenuElementArr$MenuElement$boolean(popup.getSubElements(), menu, direction);
          if (next != null && next !== menu) {
            let newPath = $J.newArray((len - 1) | 0, null);
            $J.system_arraycopy(path, 0, newPath, 0, (len - 2) | 0);
            (newPath[(len - 2) | 0]) = next;
            msm.setSelectedPath(newPath);
          }
        }
      }
    } else {
      let subs = (path[(len - 2) | 0]).getSubElements();
      let nextChild = BasicPopupMenuUI.findEnabledChild$MenuElementArr$MenuElement$boolean(subs, path[(len - 1) | 0], direction);
      if (nextChild == null) {
        nextChild = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(subs, -1, direction);
      }
      if (nextChild != null) {
        (path[(len - 1) | 0]) = nextChild;
        msm.setSelectedPath(path);
      }
    }
  }
  cancel(): void {
    let lastPopup = BasicPopupMenuUI.getLastPopup();
    if (lastPopup != null) {
      lastPopup.putClientProperty('JPopupMenu.firePopupMenuCanceled', true);
    }
    let mode = UIManager.getString$Object('Menu.cancelMode');
    if ($J.equals('hideMenuTree', mode)) {
      MenuSelectionManager.defaultManager().clearSelectedPath();
    } else {
      this.shortenSelectedPath();
    }
  }
  shortenSelectedPath(): void {
    let path = MenuSelectionManager.defaultManager().getSelectedPath();
    if (path.length <= 2) {
      MenuSelectionManager.defaultManager().clearSelectedPath();
      return;
    }
    let value = 2;
    let lastElement = path[(path.length - 1) | 0];
    let lastPopup = BasicPopupMenuUI.getLastPopup();
    if (lastElement === lastPopup) {
      let previousElement = path[(path.length - 2) | 0];
      if (previousElement instanceof JMenu) {
        let lastMenu = previousElement;
        if (lastMenu.isEnabled() && lastPopup.getComponentCount() > 0) {
          value = 1;
        } else {
          value = 3;
        }
      }
    }
    if (((path.length - value) | 0) <= 2 && !UIManager.getBoolean$Object('Menu.preserveTopLevelSelection')) {
      value = path.length;
    }
    let newPath = $J.newArray((path.length - value) | 0, null);
    $J.system_arraycopy(path, 0, newPath, 0, (path.length - value) | 0);
    MenuSelectionManager.defaultManager().setSelectedPath(newPath);
  }
}

export class BasicPopupMenuUI$MouseGrabber extends JObject {
  grabbedWindow: Window = null;
  lastPathSelected: MenuElement[] = null;
  _BasicPopupMenuUI$MouseGrabber(): this {
    let msm = MenuSelectionManager.defaultManager();
    msm.addChangeListener($J.fn(this, 'stateChanged'));
    this.lastPathSelected = msm.getSelectedPath();
    if (this.lastPathSelected.length !== 0) {
      this.grabWindow(this.lastPathSelected);
    }
    return this;
  }
  uninstall(): void {
    {
      MenuSelectionManager.defaultManager().removeChangeListener($J.fn(this, 'stateChanged'));
      this.ungrabWindow();
      AppContext.getAppContext().remove(BasicPopupMenuUI.MOUSE_GRABBER_KEY);
    }
  }
  grabWindow(newPath: MenuElement[]): void {
    let tk = Toolkit.getDefaultToolkit();
    AccessController.doPrivileged(new (BasicPopupMenuUI$MouseGrabber$1())().$o(this).$c(tk));
    let invoker = newPath[0].getComponent$();
    if (invoker instanceof JPopupMenu) {
      invoker = (invoker).getInvoker();
    }
    this.grabbedWindow = (invoker == null) ? null : ((invoker instanceof Window) ? invoker : SwingUtilities.getWindowAncestor(invoker));
    if (this.grabbedWindow != null) {
      if ($J.isa(tk, SunToolkit)) {
        (tk).grab(this.grabbedWindow);
      } else {
        this.grabbedWindow.addComponentListener(this);
        this.grabbedWindow.addWindowListener(this);
      }
    }
  }
  ungrabWindow(): void {
    let tk = Toolkit.getDefaultToolkit();
    AccessController.doPrivileged(new (BasicPopupMenuUI$MouseGrabber$2())().$o(this).$c(tk));
    this.realUngrabWindow();
  }
  realUngrabWindow(): void {
    let tk = Toolkit.getDefaultToolkit();
    if (this.grabbedWindow != null) {
      if ($J.isa(tk, SunToolkit)) {
        (tk).ungrab(this.grabbedWindow);
      } else {
        this.grabbedWindow.removeComponentListener(this);
        this.grabbedWindow.removeWindowListener(this);
      }
      this.grabbedWindow = null;
    }
  }
  stateChanged(e: ChangeEvent): void {
    let msm = MenuSelectionManager.defaultManager();
    let p = msm.getSelectedPath();
    if (this.lastPathSelected.length === 0 && p.length !== 0) {
      this.grabWindow(p);
    }
    if (this.lastPathSelected.length !== 0 && p.length === 0) {
      this.ungrabWindow();
    }
    this.lastPathSelected = p;
  }
  eventDispatched(ev: AWTEvent): void {
    if (ev instanceof UngrabEvent) {
      this.cancelPopupMenu();
      return;
    }
    if (!(ev instanceof MouseEvent)) {
      return;
    }
    let me = ev;
    let src = me.getComponent();
    switch (me.getID()) {
      case MouseEvent.MOUSE_PRESSED:
        if (this.isInPopup(src) || (src instanceof JMenu && (src).isSelected())) {
          return;
        }
        if (!(src instanceof JComponent) || !((src).getClientProperty('doNotCancelPopup') === BasicComboBoxUI.HIDE_POPUP_KEY)) {
          this.cancelPopupMenu();
          let consumeEvent = UIManager.getBoolean$Object('PopupMenu.consumeEventOnClose');
          if (consumeEvent && !($J.isa(src, MenuElement))) {
            me.consume();
          }
        }
        break;
      case MouseEvent.MOUSE_RELEASED:
        if (!($J.isa(src, MenuElement))) {
          if (this.isInPopup(src)) {
            break;
          }
        }
        if (src instanceof JMenu || !(src instanceof JMenuItem)) {
          MenuSelectionManager.defaultManager().processMouseEvent(me);
        }
        break;
      case MouseEvent.MOUSE_DRAGGED:
        if (!($J.isa(src, MenuElement))) {
          if (this.isInPopup(src)) {
            break;
          }
        }
        MenuSelectionManager.defaultManager().processMouseEvent(me);
        break;
      case MouseEvent.MOUSE_WHEEL:
        if (this.isInPopup(src) || ((src instanceof JComboBox) && (src).isPopupVisible()) || ((src instanceof JWindow) && (src).isVisible$()) || ((src instanceof JMenuItem) && (src).isVisible$()) || (src instanceof JFrame)) {
          return;
        }
        this.cancelPopupMenu();
        break;
    }
  }
  isInPopup(src: Component): boolean {
    for (let c = src; c != null; c = c.getParent()) {
      if ($J.isa(c, Applet) || c instanceof Window) {
        break;
      } else if (c instanceof JPopupMenu) {
        return true;
      }
    }
    return false;
  }
  cancelPopupMenu(): void {
    try {
      let popups = BasicPopupMenuUI.getPopups();
      for (const $it0 = popups.iterator(); $it0.hasNext(); ) {
        let popup = $it0.next();
        popup.putClientProperty('JPopupMenu.firePopupMenuCanceled', true);
      }
      MenuSelectionManager.defaultManager().clearSelectedPath();
    } catch ($e1) {
      if ($J.isa($e1, RuntimeException) || $J.isa($e1, JError)) {
        let e = $J.exc($e1);
        this.realUngrabWindow();
        throw e;
      } else {
        throw $e1;
      }
    }
  }
  componentResized(e: ComponentEvent): void {
    this.cancelPopupMenu();
  }
  componentMoved(e: ComponentEvent): void {
    this.cancelPopupMenu();
  }
  componentShown(e: ComponentEvent): void {
    this.cancelPopupMenu();
  }
  componentHidden(e: ComponentEvent): void {
    this.cancelPopupMenu();
  }
  windowClosing(e: WindowEvent): void {
    this.cancelPopupMenu();
  }
  windowClosed(e: WindowEvent): void {
    this.cancelPopupMenu();
  }
  windowIconified(e: WindowEvent): void {
    this.cancelPopupMenu();
  }
  windowDeactivated(e: WindowEvent): void {
    this.cancelPopupMenu();
  }
  windowOpened(e: WindowEvent): void {
  }
  windowDeiconified(e: WindowEvent): void {
  }
  windowActivated(e: WindowEvent): void {
  }
}

/**
 * This helper is added to MenuSelectionManager as a ChangeListener to
 * listen to menu selection changes. When a menu is activated, it passes
 * focus to its parent JRootPane, and installs an ActionMap/InputMap pair
 * on that JRootPane. Those maps are necessary in order for menu
 * navigation to work. When menu is being deactivated, it restores focus
 * to the component that has had it before menu activation, and uninstalls
 * the maps.
 * This helper is also installed as a KeyListener on root pane when menu
 * is active. It forwards key events to MenuSelectionManager for mnemonic
 * keys handling.
 */
export class BasicPopupMenuUI$MenuKeyboardHelper extends JObject {
  lastFocused: Component = null;
  lastPathSelected: MenuElement[] = null;
  lastPopup: JPopupMenu = null;
  invokerRootPane: JRootPane = null;
  menuActionMap: ActionMap = null;
  menuInputMap: InputMap = null;
  focusTraversalKeysEnabled: boolean = false;
  receivedKeyPressed: boolean = false;
  rootPaneFocusListener: FocusListener = null;
  _BasicPopupMenuUI$MenuKeyboardHelper(): this {
    this.lastFocused = null;
    this.lastPathSelected = $J.newArray(0, null);
    this.menuActionMap = BasicPopupMenuUI.getActionMap();
    this.receivedKeyPressed = false;
    this.rootPaneFocusListener = new (BasicPopupMenuUI$MenuKeyboardHelper$1())().$o(this)._FocusAdapter();
    return this;
  }
  removeItems(): void {
    if (this.lastFocused != null) {
      if (!this.lastFocused.requestFocusInWindow$()) {
        let cfw = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusedWindow();
        if (cfw != null && $J.equals('###focusableSwingPopup###', cfw.getName$())) {
          this.lastFocused.requestFocus$();
        }
      }
      this.lastFocused = null;
    }
    if (this.invokerRootPane != null) {
      this.invokerRootPane.removeKeyListener(this);
      this.invokerRootPane.setFocusTraversalKeysEnabled(this.focusTraversalKeysEnabled);
      this.removeUIInputMap(this.invokerRootPane, this.menuInputMap);
      this.removeUIActionMap(this.invokerRootPane, this.menuActionMap);
      this.invokerRootPane = null;
    }
    this.receivedKeyPressed = false;
  }
  /**
   * Return the last JPopupMenu in <code>path</code>,
   * or <code>null</code> if none found
   */
  getActivePopup(path: MenuElement[]): JPopupMenu {
    for (let i = (path.length - 1) | 0; i >= 0; i--) {
      let elem = path[i];
      if (elem instanceof JPopupMenu) {
        return elem;
      }
    }
    return null;
  }
  addUIInputMap(c: JComponent, map: InputMap): void {
    let lastNonUI = null;
    let parent = c.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW);
    while (parent != null && !($J.isa(parent, UIResource))) {
      lastNonUI = parent;
      parent = parent.getParent();
    }
    if (lastNonUI == null) {
      c.setInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW, map);
    } else {
      lastNonUI.setParent(map);
    }
    map.setParent(parent);
  }
  addUIActionMap(c: JComponent, map: ActionMap): void {
    let lastNonUI = null;
    let parent = c.getActionMap$();
    while (parent != null && !($J.isa(parent, UIResource))) {
      lastNonUI = parent;
      parent = parent.getParent();
    }
    if (lastNonUI == null) {
      c.setActionMap(map);
    } else {
      lastNonUI.setParent(map);
    }
    map.setParent(parent);
  }
  removeUIInputMap(c: JComponent, map: InputMap): void {
    let im = null;
    let parent = c.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW);
    while (parent != null) {
      if (parent === map) {
        if (im == null) {
          c.setInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW, map.getParent());
        } else {
          im.setParent(map.getParent());
        }
        break;
      }
      im = parent;
      parent = parent.getParent();
    }
  }
  removeUIActionMap(c: JComponent, map: ActionMap): void {
    let im = null;
    let parent = c.getActionMap$();
    while (parent != null) {
      if (parent === map) {
        if (im == null) {
          c.setActionMap(map.getParent());
        } else {
          im.setParent(map.getParent());
        }
        break;
      }
      im = parent;
      parent = parent.getParent();
    }
  }
  stateChanged(ev: ChangeEvent): void {
    if (!(UIManager.getLookAndFeel() instanceof BasicLookAndFeel)) {
      this.uninstall();
      return;
    }
    let msm = ev.getSource();
    let p = msm.getSelectedPath();
    let popup = this.getActivePopup(p);
    if (popup != null && !popup.isFocusable()) {
      return;
    }
    if (this.lastPathSelected.length !== 0 && p.length !== 0) {
      if (!BasicPopupMenuUI.checkInvokerEqual(p[0], this.lastPathSelected[0])) {
        this.removeItems();
        this.lastPathSelected = $J.newArray(0, null);
      }
    }
    if (this.lastPathSelected.length === 0 && p.length > 0) {
      let invoker: JComponent;
      if (popup == null) {
        if (p.length === 2 && p[0] instanceof JMenuBar && p[1] instanceof JMenu) {
          invoker = p[1];
          popup = (invoker).getPopupMenu();
        } else {
          return;
        }
      } else {
        let c = popup.getInvoker();
        if (c instanceof JFrame) {
          invoker = (c).getRootPane();
        } else if (c instanceof JDialog) {
          invoker = (c).getRootPane();
        } else if (c instanceof JApplet) {
          invoker = (c).getRootPane();
        } else {
          while (!(c instanceof JComponent)) {
            if (c == null) {
              return;
            }
            c = c.getParent();
          }
          invoker = c;
        }
      }
      this.lastFocused = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
      this.invokerRootPane = SwingUtilities.getRootPane(invoker);
      if (this.invokerRootPane != null) {
        this.invokerRootPane.addFocusListener(this.rootPaneFocusListener);
        this.invokerRootPane.requestFocus$boolean(true);
        this.invokerRootPane.addKeyListener(this);
        this.focusTraversalKeysEnabled = this.invokerRootPane.getFocusTraversalKeysEnabled();
        this.invokerRootPane.setFocusTraversalKeysEnabled(false);
        this.menuInputMap = BasicPopupMenuUI.getInputMap(popup, this.invokerRootPane);
        this.addUIInputMap(this.invokerRootPane, this.menuInputMap);
        this.addUIActionMap(this.invokerRootPane, this.menuActionMap);
      }
    } else if (this.lastPathSelected.length !== 0 && p.length === 0) {
      this.removeItems();
      this.menuInputMap = null;
    } else {
      if (popup !== this.lastPopup) {
        this.receivedKeyPressed = false;
      }
    }
    this.lastPathSelected = p;
    this.lastPopup = popup;
  }
  keyPressed(ev: KeyEvent): void {
    this.receivedKeyPressed = true;
    MenuSelectionManager.defaultManager().processKeyEvent(ev);
  }
  keyReleased(ev: KeyEvent): void {
    if (this.receivedKeyPressed) {
      this.receivedKeyPressed = false;
      MenuSelectionManager.defaultManager().processKeyEvent(ev);
    }
  }
  keyTyped(ev: KeyEvent): void {
    if (this.receivedKeyPressed) {
      MenuSelectionManager.defaultManager().processKeyEvent(ev);
    }
  }
  uninstall(): void {
    {
      MenuSelectionManager.defaultManager().removeChangeListener($J.fn(this, 'stateChanged'));
      AppContext.getAppContext().remove(BasicPopupMenuUI.MENU_KEYBOARD_HELPER_KEY);
    }
  }
}

let $BasicPopupMenuUI$MouseGrabber$1: any = null;
/** An anonymous class (BasicPopupMenuUI.java:785). */
function BasicPopupMenuUI$MouseGrabber$1(): any {
  return $BasicPopupMenuUI$MouseGrabber$1 ??= $J.local(class extends JObject {
    run(): any {
      this.$cv_tk.addAWTEventListener(this.$outer, $J.lor($J.lor($J.lor($J.lor(AWTEvent.MOUSE_EVENT_MASK, AWTEvent.MOUSE_MOTION_EVENT_MASK), AWTEvent.MOUSE_WHEEL_EVENT_MASK), AWTEvent.WINDOW_EVENT_MASK), -2147483648));
      return null;
    }
    $c($tk): this {
      this.$cv_tk = $tk;
      return this;
    }
  }, 'javax.swing.plaf.basic.BasicPopupMenuUI$MouseGrabber$1', ['java.security.PrivilegedAction']);
}

let $BasicPopupMenuUI$MouseGrabber$2: any = null;
/** An anonymous class (BasicPopupMenuUI.java:821). */
function BasicPopupMenuUI$MouseGrabber$2(): any {
  return $BasicPopupMenuUI$MouseGrabber$2 ??= $J.local(class extends JObject {
    run(): any {
      this.$cv_tk.removeAWTEventListener(this.$outer);
      return null;
    }
    $c($tk): this {
      this.$cv_tk = $tk;
      return this;
    }
  }, 'javax.swing.plaf.basic.BasicPopupMenuUI$MouseGrabber$2', ['java.security.PrivilegedAction']);
}

let $BasicPopupMenuUI$MenuKeyboardHelper$1: any = null;
/** An anonymous class (BasicPopupMenuUI.java:1056). */
function BasicPopupMenuUI$MenuKeyboardHelper$1(): any {
  return $BasicPopupMenuUI$MenuKeyboardHelper$1 ??= $J.local(class extends FocusAdapter {
    focusGained(ev: FocusEvent): void {
      let opposite = ev.getOppositeComponent();
      if (opposite != null) {
        this.$outer.lastFocused = opposite;
      }
      ev.getComponent().removeFocusListener(this);
    }
  }, 'javax.swing.plaf.basic.BasicPopupMenuUI$MenuKeyboardHelper$1', []);
}

$J.define(BasicPopupMenuUI, 'javax.swing.plaf.basic.BasicPopupMenuUI', { kind: 'class', sup: 'javax.swing.plaf.PopupMenuUI', ctors: { '': '_BasicPopupMenuUI' }, meths: { 'findEnabledChild(javax.swing.MenuElement[],javax.swing.MenuElement,boolean)': 'findEnabledChild$MenuElementArr$MenuElement$boolean', 'findEnabledChild(javax.swing.MenuElement[],int,boolean)': 'findEnabledChild$MenuElementArr$int$boolean' }, clinit: true, lazy: ['MOUSE_GRABBER_KEY', 'MENU_KEYBOARD_HELPER_KEY', 'checkedUnpostPopup', 'unpostPopup'] });
$J.define(BasicPopupMenuUI$BasicPopupMenuListener, 'javax.swing.plaf.basic.BasicPopupMenuUI$BasicPopupMenuListener', { kind: 'class', ifaces: ['javax.swing.event.PopupMenuListener'], sup: 'java.lang.Object', ctors: { '': '_BasicPopupMenuUI$BasicPopupMenuListener' } });
$J.define(BasicPopupMenuUI$BasicMenuKeyListener, 'javax.swing.plaf.basic.BasicPopupMenuUI$BasicMenuKeyListener', { kind: 'class', ifaces: ['javax.swing.event.MenuKeyListener'], sup: 'java.lang.Object', ctors: { '': '_BasicPopupMenuUI$BasicMenuKeyListener' }, meths: { 'lower(int)': 'lower$int$BasicPopupMenuUI_BasicMenuKeyListener', 'lower(char)': 'lower$char$BasicPopupMenuUI_BasicMenuKeyListener' }, inner: true });
$J.define(BasicPopupMenuUI$Actions, 'javax.swing.plaf.basic.BasicPopupMenuUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicPopupMenuUI$Actions' } });
$J.define(BasicPopupMenuUI$MouseGrabber, 'javax.swing.plaf.basic.BasicPopupMenuUI$MouseGrabber', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.AWTEventListener', 'java.awt.event.ComponentListener', 'java.awt.event.WindowListener'], sup: 'java.lang.Object', ctors: { '': '_BasicPopupMenuUI$MouseGrabber' } });
$J.define(BasicPopupMenuUI$MenuKeyboardHelper, 'javax.swing.plaf.basic.BasicPopupMenuUI$MenuKeyboardHelper', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.KeyListener'], sup: 'java.lang.Object', ctors: { '': '_BasicPopupMenuUI$MenuKeyboardHelper' } });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  ComponentOrientation = $J.load('java.awt.ComponentOrientation');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Window = $J.load('java.awt.Window');
  FocusAdapter = $J.load('java.awt.event.FocusAdapter');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  JApplet = $J.load('javax.swing.JApplet');
  JComboBox = $J.load('javax.swing.JComboBox');
  JComponent = $J.load('javax.swing.JComponent');
  JDialog = $J.load('javax.swing.JDialog');
  JFrame = $J.load('javax.swing.JFrame');
  JMenu = $J.load('javax.swing.JMenu');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  JRootPane = $J.load('javax.swing.JRootPane');
  JWindow = $J.load('javax.swing.JWindow');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  MenuElement = $J.load('javax.swing.MenuElement');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicComboBoxUI = $J.load('javax.swing.plaf.basic.BasicComboBoxUI');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  BasicMenuItemUI = $J.load('javax.swing.plaf.basic.BasicMenuItemUI');
  DefaultMenuLayout = $J.load('javax.swing.plaf.basic.DefaultMenuLayout');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  UngrabEvent = $J.load('sun.awt.UngrabEvent');
});
