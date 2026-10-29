// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicMenuBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { MenuBarUI } from '../MenuBarUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let BoxLayout, JComponent, JMenu, LookAndFeel, MenuSelectionManager, SwingUtilities, UIResource, DefaultMenuLayout, LazyActionMap, DefaultLookup;

/**
 * A default L&amp;F implementation of MenuBarUI.  This implementation
 * is a "combined" view/controller.
 *
 * @author Georges Saab
 * @author David Karlton
 * @author Arnaud Weber
 */
export class BasicMenuBarUI extends MenuBarUI {
  /**
   * The instance of {@code JMenuBar}.
   */
  menuBar: JMenuBar = null;
  /**
   * The instance of {@code ContainerListener}.
   */
  containerListener: ContainerListener = null;
  /**
   * The instance of {@code ChangeListener}.
   */
  changeListener: ChangeListener = null;
  handler: BasicMenuBarUI$Handler = null;
  /**
   * Constructs a {@code BasicMenuBarUI}.
   */
  _BasicMenuBarUI(): this {
    this._MenuBarUI();
    this.menuBar = null;
    return this;
  }
  /**
   * Returns a new instance of {@code BasicMenuBarUI}.
   *
   * @param x a component
   * @return a new instance of {@code BasicMenuBarUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicMenuBarUI()._BasicMenuBarUI();
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicMenuBarUI$Actions()._BasicMenuBarUI$Actions(BasicMenuBarUI$Actions.TAKE_FOCUS));
  }
  installUI(c: JComponent): void {
    this.menuBar = c;
    this.installDefaults();
    this.installListeners();
    this.installKeyboardActions();
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    if (this.menuBar.getLayout() == null || $J.isa(this.menuBar.getLayout(), UIResource)) {
      this.menuBar.setLayout(new DefaultMenuLayout()._DefaultMenuLayout(this.menuBar, BoxLayout.LINE_AXIS));
    }
    LookAndFeel.installProperty(this.menuBar, 'opaque', true);
    LookAndFeel.installBorder(this.menuBar, 'MenuBar.border');
    LookAndFeel.installColorsAndFont(this.menuBar, 'MenuBar.background', 'MenuBar.foreground', 'MenuBar.font');
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    this.containerListener = this.createContainerListener();
    this.changeListener = this.createChangeListener();
    for (let i = 0; i < this.menuBar.getMenuCount(); i++) {
      let menu = this.menuBar.getMenu(i);
      if (menu != null) {
        menu.getModel().addChangeListener(this.changeListener);
      }
    }
    this.menuBar.addContainerListener(this.containerListener);
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
    let inputMap = this.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
    SwingUtilities.replaceUIInputMap(this.menuBar, JComponent.WHEN_IN_FOCUSED_WINDOW, inputMap);
    LazyActionMap.installLazyActionMap(this.menuBar, $J.cls(BasicMenuBarUI), 'MenuBar.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      let bindings = DefaultLookup.get(this.menuBar, this, 'MenuBar.windowBindings');
      if (bindings != null) {
        return LookAndFeel.makeComponentInputMap(this.menuBar, bindings);
      }
    }
    return null;
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults();
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    this.menuBar = null;
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    if (this.menuBar != null) {
      LookAndFeel.uninstallBorder(this.menuBar);
    }
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    this.menuBar.removeContainerListener(this.containerListener);
    for (let i = 0; i < this.menuBar.getMenuCount(); i++) {
      let menu = this.menuBar.getMenu(i);
      if (menu != null) {
        menu.getModel().removeChangeListener(this.changeListener);
      }
    }
    this.containerListener = null;
    this.changeListener = null;
    this.handler = null;
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIInputMap(this.menuBar, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIActionMap(this.menuBar, null);
  }
  /**
   * Returns an instance of {@code ContainerListener}.
   *
   * @return an instance of {@code ContainerListener}
   */
  createContainerListener(): ContainerListener {
    return this.getHandler();
  }
  /**
   * Returns an instance of {@code ChangeListener}.
   *
   * @return an instance of {@code ChangeListener}
   */
  createChangeListener(): ChangeListener {
    return $J.fn(this.getHandler(), 'stateChanged');
  }
  getHandler(): BasicMenuBarUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicMenuBarUI$Handler().$o(this)._BasicMenuBarUI$Handler();
    }
    return this.handler;
  }
  getMinimumSize(c: JComponent): Dimension {
    return null;
  }
  getMaximumSize(c: JComponent): Dimension {
    return null;
  }
}

export class BasicMenuBarUI$Handler extends JObject {
  _BasicMenuBarUI$Handler(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    let i: number;
    let c: number;
    for (i = 0, c = this.$outer.menuBar.getMenuCount(); i < c; i++) {
      let menu = this.$outer.menuBar.getMenu(i);
      if (menu != null && menu.isSelected()) {
        this.$outer.menuBar.getSelectionModel().setSelectedIndex(i);
        break;
      }
    }
  }
  componentAdded(e: ContainerEvent): void {
    let c = e.getChild();
    if (c instanceof JMenu) {
      (c).getModel().addChangeListener(this.$outer.changeListener);
    }
  }
  componentRemoved(e: ContainerEvent): void {
    let c = e.getChild();
    if (c instanceof JMenu) {
      (c).getModel().removeChangeListener(this.$outer.changeListener);
    }
  }
}

export class BasicMenuBarUI$Actions extends UIAction {
  static readonly TAKE_FOCUS: string = 'takeFocus';
  _BasicMenuBarUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let menuBar = e.getSource();
    let defaultManager = MenuSelectionManager.defaultManager();
    let me: MenuElement[];
    let subElements: MenuElement[];
    let menu = menuBar.getMenu(0);
    if (menu != null) {
      me = $J.newArray(3, null);
      me[0] = menuBar;
      me[1] = menu;
      me[2] = menu.getPopupMenu();
      defaultManager.setSelectedPath(me);
    }
  }
}

$J.define(BasicMenuBarUI, 'javax.swing.plaf.basic.BasicMenuBarUI', { kind: 'class', sup: 'javax.swing.plaf.MenuBarUI', ctors: { '': '_BasicMenuBarUI' } });
$J.define(BasicMenuBarUI$Handler, 'javax.swing.plaf.basic.BasicMenuBarUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.ContainerListener'], sup: 'java.lang.Object', ctors: { '': '_BasicMenuBarUI$Handler' }, inner: true });
$J.define(BasicMenuBarUI$Actions, 'javax.swing.plaf.basic.BasicMenuBarUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicMenuBarUI$Actions' } });
$J.module(() => {
  BoxLayout = $J.load('javax.swing.BoxLayout');
  JComponent = $J.load('javax.swing.JComponent');
  JMenu = $J.load('javax.swing.JMenu');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  DefaultMenuLayout = $J.load('javax.swing.plaf.basic.DefaultMenuLayout');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
