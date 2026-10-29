// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicMenuUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, Character } from '../../../../../jre/index.ts';
import { BasicMenuItemUI } from './BasicMenuItemUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { BasicMenuItemUI$Handler } from './BasicMenuItemUI.ts';

let Dimension, InputEvent, MouseEvent, AbstractButton, JComponent, JMenu, JMenuBar, KeyStroke, MenuSelectionManager, SwingUtilities, Timer, UIManager, UIResource, BasicPopupMenuUI, LazyActionMap, DefaultLookup;

/**
 * A default L&amp;F implementation of MenuUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 */
export class BasicMenuUI extends BasicMenuItemUI {
  /**
   * The instance of {@code ChangeListener}.
   */
  changeListener: ChangeListener = null;
  /**
   * The instance of {@code MenuListener}.
   */
  menuListener: MenuListener = null;
  lastMnemonic: number = 0;
  /**
   * Uses as the parent of the windowInputMap when selected.
   */
  selectedWindowInputMap: InputMap = null;
  static readonly TRACE: boolean = false;
  static readonly VERBOSE: boolean = false;
  static readonly DEBUG: boolean = false;
  static crossMenuMnemonic: boolean = false;
  /**
   * Constructs a {@code BasicMenuUI}.
   */
  _BasicMenuUI(): this {
    this._BasicMenuItemUI();
    this.lastMnemonic = 0;
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicMenuUI}.
   *
   * @param x a component
   * @return a new instance of {@code BasicMenuUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicMenuUI()._BasicMenuUI();
  }
  static loadActionMap(map: LazyActionMap): void {
    BasicMenuItemUI.loadActionMap(map);
    map.put$Action(new BasicMenuUI$Actions()._BasicMenuUI$Actions(BasicMenuUI$Actions.SELECT, null, true));
  }
  installDefaults(): void {
    super.installDefaults();
    this.updateDefaultBackgroundColor();
    (this.menuItem).setDelay(200);
    BasicMenuUI.crossMenuMnemonic = UIManager.getBoolean$Object('Menu.crossMenuMnemonic');
  }
  getPropertyPrefix(): string {
    return 'Menu';
  }
  installListeners(): void {
    super.installListeners();
    if (this.changeListener == null) {
      this.changeListener = this.createChangeListener(this.menuItem);
    }
    if (this.changeListener != null) {
      this.menuItem.addChangeListener(this.changeListener);
    }
    if (this.menuListener == null) {
      this.menuListener = this.createMenuListener(this.menuItem);
    }
    if (this.menuListener != null) {
      (this.menuItem).addMenuListener(this.menuListener);
    }
  }
  installKeyboardActions(): void {
    super.installKeyboardActions();
    this.updateMnemonicBinding();
  }
  installLazyActionMap(): void {
    LazyActionMap.installLazyActionMap(this.menuItem, $J.cls(BasicMenuUI), this.getPropertyPrefix() + '.actionMap');
  }
  updateMnemonicBinding(): void {
    let mnemonic = this.menuItem.getModel().getMnemonic();
    let shortcutKeys = DefaultLookup.get(this.menuItem, this, 'Menu.shortcutKeys');
    if (shortcutKeys == null) {
      shortcutKeys = [InputEvent.ALT_MASK, InputEvent.ALT_MASK | InputEvent.ALT_GRAPH_MASK];
    }
    if (mnemonic === this.lastMnemonic) {
      return;
    }
    let windowInputMap = SwingUtilities.getUIInputMap(this.menuItem, JComponent.WHEN_IN_FOCUSED_WINDOW);
    if (this.lastMnemonic !== 0 && windowInputMap != null) {
      for (let shortcutKey of shortcutKeys) {
        windowInputMap.remove(KeyStroke.getKeyStroke$int$int$boolean(this.lastMnemonic, shortcutKey, false));
      }
    }
    if (mnemonic !== 0) {
      if (windowInputMap == null) {
        windowInputMap = this.createInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        SwingUtilities.replaceUIInputMap(this.menuItem, JComponent.WHEN_IN_FOCUSED_WINDOW, windowInputMap);
      }
      for (let shortcutKey of shortcutKeys) {
        windowInputMap.put(KeyStroke.getKeyStroke$int$int$boolean(mnemonic, shortcutKey, false), 'selectMenu');
      }
    }
    this.lastMnemonic = mnemonic;
  }
  uninstallKeyboardActions(): void {
    super.uninstallKeyboardActions();
    this.lastMnemonic = 0;
  }
  createMouseInputListener(c: JComponent): MouseInputListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code MenuListener}.
   *
   * @param c a component
   * @return an instance of {@code MenuListener}
   */
  createMenuListener(c: JComponent): MenuListener {
    return null;
  }
  /**
   * Returns an instance of {@code ChangeListener}.
   *
   * @param c a component
   * @return an instance of {@code ChangeListener}
   */
  createChangeListener(c: JComponent): ChangeListener {
    return null;
  }
  createPropertyChangeListener(c: JComponent): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicMenuItemUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicMenuUI$Handler().$o(this)._BasicMenuUI$Handler();
    }
    return this.handler;
  }
  uninstallDefaults(): void {
    this.menuItem.setArmed(false);
    this.menuItem.setSelected(false);
    this.menuItem.resetKeyboardActions();
    super.uninstallDefaults();
  }
  uninstallListeners(): void {
    super.uninstallListeners();
    if (this.changeListener != null) {
      this.menuItem.removeChangeListener(this.changeListener);
    }
    if (this.menuListener != null) {
      (this.menuItem).removeMenuListener(this.menuListener);
    }
    this.changeListener = null;
    this.menuListener = null;
    this.handler = null;
  }
  createMenuDragMouseListener(c: JComponent): MenuDragMouseListener {
    return this.getHandler();
  }
  createMenuKeyListener(c: JComponent): MenuKeyListener {
    return this.getHandler();
  }
  getMinimumSize(c: JComponent): Dimension {
    return ((this.menuItem).isTopLevelMenu()) ? c.getPreferredSize$() : null;
  }
  getMaximumSize(c: JComponent): Dimension {
    if ((this.menuItem).isTopLevelMenu()) {
      let d = c.getPreferredSize$();
      return new Dimension()._Dimension$int$int(d.width_, 32767);
    }
    return null;
  }
  /**
   * Sets timer to the {@code menu}.
   *
   * @param menu an instance of {@code JMenu}.
   */
  setupPostTimer(menu: JMenu): void {
    let timer = new Timer()._Timer(menu.getDelay(), $J.fn(new BasicMenuUI$Actions()._BasicMenuUI$Actions(BasicMenuUI$Actions.SELECT, menu, false), 'actionPerformed'));
    timer.setRepeats(false);
    timer.start();
  }
  static appendPath(path: MenuElement[], elem: MenuElement): void {
    let newPath = $J.newArray((path.length + 1) | 0, null);
    $J.system_arraycopy(path, 0, newPath, 0, path.length);
    newPath[path.length] = elem;
    MenuSelectionManager.defaultManager().setSelectedPath(newPath);
  }
  updateDefaultBackgroundColor(): void {
    if (!UIManager.getBoolean$Object('Menu.useMenuBarBackgroundForTopLevel')) {
      return;
    }
    let menu = this.menuItem;
    if ($J.isa(menu.getBackground(), UIResource)) {
      if (menu.isTopLevelMenu()) {
        menu.setBackground(UIManager.getColor$Object('MenuBar.background'));
      } else {
        menu.setBackground(UIManager.getColor$Object(this.getPropertyPrefix() + '.background'));
      }
    }
  }
  static $clinit() {
    BasicMenuUI.crossMenuMnemonic = true;
  }
}

export class BasicMenuUI$Actions extends UIAction {
  static readonly SELECT: string = 'selectMenu';
  menu: JMenu = null;
  force: boolean = false;
  _BasicMenuUI$Actions(key: string, menu: JMenu, shouldForce: boolean): this {
    this._UIAction(key);
    this.force = false;
    this.menu = menu;
    this.force = shouldForce;
    return this;
  }
  getMenu(e: ActionEvent): JMenu {
    if (e.getSource() instanceof JMenu) {
      return e.getSource();
    }
    return this.menu;
  }
  actionPerformed(e: ActionEvent): void {
    let menu = this.getMenu(e);
    if (!BasicMenuUI.crossMenuMnemonic) {
      let pm = BasicPopupMenuUI.getLastPopup();
      if (pm != null && pm !== menu.getParent()) {
        return;
      }
    }
    let defaultManager = MenuSelectionManager.defaultManager();
    var menuBar;
    if (this.force) {
      let cnt = menu.getParent();
      var menuBar;
      if ((menuBar = cnt) instanceof JMenuBar) {
        let me: MenuElement[];
        let subElements: MenuElement[];
        subElements = menu.getPopupMenu().getSubElements();
        if (subElements.length > 0) {
          me = $J.newArray(4, null);
          me[0] = menuBar;
          me[1] = menu;
          me[2] = menu.getPopupMenu();
          me[3] = subElements[0];
        } else {
          me = $J.newArray(3, null);
          me[0] = menuBar;
          me[1] = menu;
          me[2] = menu.getPopupMenu();
        }
        defaultManager.setSelectedPath(me);
      }
    } else {
      let path = defaultManager.getSelectedPath();
      if (path.length > 0 && (path[(path.length - 1) | 0]) === menu) {
        BasicMenuUI.appendPath(path, menu.getPopupMenu());
      }
    }
  }
  accept(c: any): boolean {
    if (c instanceof JMenu) {
      return (c).isEnabled();
    }
    return true;
  }
}

export class BasicMenuUI$Handler extends BasicMenuItemUI$Handler {
  _BasicMenuUI$Handler(): this {
    this._BasicMenuItemUI$Handler();
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    if (e.getPropertyName() === AbstractButton.MNEMONIC_CHANGED_PROPERTY) {
      this.$outer.updateMnemonicBinding();
    } else {
      if ($J.equals(e.getPropertyName(), 'ancestor')) {
        this.$outer.updateDefaultBackgroundColor();
      }
      super.propertyChange(e);
    }
  }
  mouseClicked(e: MouseEvent): void {
  }
  /**
   * Invoked when the mouse has been clicked on the menu. This
   * method clears or sets the selection path of the
   * MenuSelectionManager.
   *
   * @param e the mouse event
   */
  mousePressed(e: MouseEvent): void {
    let menu = this.$outer.menuItem;
    if (!menu.isEnabled()) {
      return;
    }
    let manager = MenuSelectionManager.defaultManager();
    var menuBar;
    if (menu.isTopLevelMenu()) {
      var menuBar;
      if (menu.isSelected() && menu.getPopupMenu().isShowing()) {
        manager.clearSelectedPath();
      } else {
        let cnt = menu.getParent();
        var menuBar;
        if ((menuBar = cnt) instanceof JMenuBar) {
          let me = $J.newArray(2, null);
          me[0] = menuBar;
          me[1] = menu;
          manager.setSelectedPath(me);
        }
      }
    }
    let selectedPath = manager.getSelectedPath();
    if (selectedPath.length > 0 && (selectedPath[(selectedPath.length - 1) | 0]) !== menu.getPopupMenu()) {
      if (menu.isTopLevelMenu() || menu.getDelay() === 0) {
        BasicMenuUI.appendPath(selectedPath, menu.getPopupMenu());
      } else {
        this.$outer.setupPostTimer(menu);
      }
    }
  }
  /**
   * Invoked when the mouse has been released on the menu. Delegates the
   * mouse event to the MenuSelectionManager.
   *
   * @param e the mouse event
   */
  mouseReleased(e: MouseEvent): void {
    let menu = this.$outer.menuItem;
    if (!menu.isEnabled()) {
      return;
    }
    let manager = MenuSelectionManager.defaultManager();
    manager.processMouseEvent(e);
    if (!e.isConsumed()) {
      manager.clearSelectedPath();
    }
  }
  /**
   * Invoked when the cursor enters the menu. This method sets the selected
   * path for the MenuSelectionManager and handles the case
   * in which a menu item is used to pop up an additional menu, as in a
   * hierarchical menu system.
   *
   * @param e the mouse event; not used
   */
  mouseEntered(e: MouseEvent): void {
    let menu = this.$outer.menuItem;
    if (!menu.isEnabled() && !UIManager.getBoolean$Object('MenuItem.disabledAreNavigable')) {
      return;
    }
    let manager = MenuSelectionManager.defaultManager();
    let selectedPath = manager.getSelectedPath();
    if (!menu.isTopLevelMenu()) {
      if (!(selectedPath.length > 0 && (selectedPath[(selectedPath.length - 1) | 0]) === menu.getPopupMenu())) {
        if (menu.getDelay() === 0) {
          BasicMenuUI.appendPath(this.$outer.getPath(), menu.getPopupMenu());
        } else {
          manager.setSelectedPath(this.$outer.getPath());
          this.$outer.setupPostTimer(menu);
        }
      }
    } else {
      if (selectedPath.length > 0 && selectedPath[0] === menu.getParent()) {
        let newPath = $J.newArray(3, null);
        newPath[0] = menu.getParent();
        newPath[1] = menu;
        if (BasicPopupMenuUI.getLastPopup() != null) {
          newPath[2] = menu.getPopupMenu();
        }
        manager.setSelectedPath(newPath);
      }
    }
  }
  mouseExited(e: MouseEvent): void {
  }
  /**
   * Invoked when a mouse button is pressed on the menu and then dragged.
   * Delegates the mouse event to the MenuSelectionManager.
   *
   * @param e the mouse event
   * @see java.awt.event.MouseMotionListener#mouseDragged
   */
  mouseDragged(e: MouseEvent): void {
    let menu = this.$outer.menuItem;
    if (!menu.isEnabled()) {
      return;
    }
    MenuSelectionManager.defaultManager().processMouseEvent(e);
  }
  mouseMoved(e: MouseEvent): void {
  }
  menuDragMouseEntered(e: MenuDragMouseEvent): void {
  }
  menuDragMouseDragged(e: MenuDragMouseEvent): void {
    if (this.$outer.menuItem.isEnabled() === false) {
      return;
    }
    let manager = e.getMenuSelectionManager();
    let path = e.getPath();
    let p = e.getPoint();
    if (p.x_ >= 0 && p.x_ < this.$outer.menuItem.getWidth() && p.y_ >= 0 && p.y_ < this.$outer.menuItem.getHeight()) {
      let menu = this.$outer.menuItem;
      let selectedPath = manager.getSelectedPath();
      if (!(selectedPath.length > 0 && (selectedPath[(selectedPath.length - 1) | 0]) === menu.getPopupMenu())) {
        if (menu.isTopLevelMenu() || menu.getDelay() === 0 || e.getID() === MouseEvent.MOUSE_DRAGGED) {
          BasicMenuUI.appendPath(path, menu.getPopupMenu());
        } else {
          manager.setSelectedPath(path);
          this.$outer.setupPostTimer(menu);
        }
      }
    } else if (e.getID() === MouseEvent.MOUSE_RELEASED) {
      let comp = manager.componentForPoint(e.getComponent(), e.getPoint());
      if (comp == null) {
        manager.clearSelectedPath();
      }
    }
  }
  menuDragMouseExited(e: MenuDragMouseEvent): void {
  }
  menuDragMouseReleased(e: MenuDragMouseEvent): void {
  }
  /**
   * Open the Menu
   */
  menuKeyTyped(e: MenuKeyEvent): void {
    if (!BasicMenuUI.crossMenuMnemonic && BasicPopupMenuUI.getLastPopup() != null) {
      return;
    }
    if (BasicPopupMenuUI.getPopups().size() !== 0) {
      return;
    }
    let key = Character.toLowerCase((this.$outer.menuItem.getMnemonic()) & 0xffff);
    let path = e.getPath();
    if (key === Character.toLowerCase(e.getKeyChar())) {
      let popupMenu = (this.$outer.menuItem).getPopupMenu();
      let newList = new ArrayList(Arrays.asList(...path));
      newList.add(popupMenu);
      let subs = popupMenu.getSubElements();
      let sub = BasicPopupMenuUI.findEnabledChild$MenuElementArr$int$boolean(subs, -1, true);
      if (sub != null) {
        newList.add(sub);
      }
      let manager = e.getMenuSelectionManager();
      let newPath = $J.newArray(0, null);
      newPath = $J.toArrayInto(newList.toArray(), newPath);
      manager.setSelectedPath(newPath);
      e.consume();
    }
  }
  menuKeyPressed(e: MenuKeyEvent): void {
  }
  menuKeyReleased(e: MenuKeyEvent): void {
  }
}

$J.define(BasicMenuUI, 'javax.swing.plaf.basic.BasicMenuUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicMenuItemUI', ctors: { '': '_BasicMenuUI' }, clinit: true, lazy: ['crossMenuMnemonic'] });
$J.define(BasicMenuUI$Actions, 'javax.swing.plaf.basic.BasicMenuUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String,javax.swing.JMenu,boolean': '_BasicMenuUI$Actions' } });
$J.define(BasicMenuUI$Handler, 'javax.swing.plaf.basic.BasicMenuUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.MenuKeyListener'], sup: 'javax.swing.plaf.basic.BasicMenuItemUI$Handler', ctors: { '': '_BasicMenuUI$Handler' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  InputEvent = $J.load('java.awt.event.InputEvent');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  JComponent = $J.load('javax.swing.JComponent');
  JMenu = $J.load('javax.swing.JMenu');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicPopupMenuUI = $J.load('javax.swing.plaf.basic.BasicPopupMenuUI');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
