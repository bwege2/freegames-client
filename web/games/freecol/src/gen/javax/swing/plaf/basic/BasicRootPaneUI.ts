// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicRootPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2016, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { RootPaneUI } from '../RootPaneUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';
import { ComponentInputMapUIResource } from '../ComponentInputMapUIResource.ts';

let KeyboardFocusManager, Point, JComponent, JRootPane, LookAndFeel, MenuSelectionManager, SwingUtilities, LazyActionMap, DefaultLookup;

/**
 * Basic implementation of RootPaneUI, there is one shared between all
 * JRootPane instances.
 *
 * @author Scott Violet
 * @since 1.3
 */
export class BasicRootPaneUI extends RootPaneUI {
  static rootPaneUI: RootPaneUI = null;
  /**
   * Constructs a {@code BasicRootPaneUI}.
   */
  _BasicRootPaneUI(): this {
    this._RootPaneUI();
    return this;
  }
  /**
   * Returns a new instance of {@code BasicRootPaneUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicRootPaneUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return BasicRootPaneUI.rootPaneUI;
  }
  installUI(c: JComponent): void {
    this.installDefaults(c);
    this.installComponents(c);
    this.installListeners(c);
    this.installKeyboardActions(c);
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults(c);
    this.uninstallComponents(c);
    this.uninstallListeners(c);
    this.uninstallKeyboardActions(c);
  }
  /**
   * Installs default properties.
   *
   * @param c an instance of {@code JRootPane}
   */
  installDefaults(c: JRootPane): void {
    LookAndFeel.installProperty(c, 'opaque', false);
  }
  /**
   * Installs components.
   *
   * @param root an instance of {@code JRootPane}
   */
  installComponents(root: JRootPane): void {
  }
  /**
   * Registers listeners.
   *
   * @param root an instance of {@code JRootPane}
   */
  installListeners(root: JRootPane): void {
    root.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * Registers keyboard actions.
   *
   * @param root an instance of {@code JRootPane}
   */
  installKeyboardActions(root: JRootPane): void {
    let km = this.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW, root);
    SwingUtilities.replaceUIInputMap(root, JComponent.WHEN_IN_FOCUSED_WINDOW, km);
    km = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, root);
    SwingUtilities.replaceUIInputMap(root, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, km);
    LazyActionMap.installLazyActionMap(root, $J.cls(BasicRootPaneUI), 'RootPane.actionMap');
    this.updateDefaultButtonBindings(root);
  }
  /**
   * Uninstalls default properties.
   *
   * @param root an instance of {@code JRootPane}
   */
  uninstallDefaults(root: JRootPane): void {
  }
  /**
   * Unregisters components.
   *
   * @param root an instance of {@code JRootPane}
   */
  uninstallComponents(root: JRootPane): void {
  }
  /**
   * Unregisters listeners.
   *
   * @param root an instance of {@code JRootPane}
   */
  uninstallListeners(root: JRootPane): void {
    root.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * Unregisters keyboard actions.
   *
   * @param root an instance of {@code JRootPane}
   */
  uninstallKeyboardActions(root: JRootPane): void {
    SwingUtilities.replaceUIInputMap(root, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIActionMap(root, null);
  }
  getInputMap(condition: number, c: JComponent): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(c, this, 'RootPane.ancestorInputMap');
    }
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      return this.createInputMap(condition, c);
    }
    return null;
  }
  createInputMap(condition: number, c: JComponent): ComponentInputMap {
    return new BasicRootPaneUI$RootPaneInputMap()._BasicRootPaneUI$RootPaneInputMap(c);
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicRootPaneUI$Actions()._BasicRootPaneUI$Actions(BasicRootPaneUI$Actions.PRESS));
    map.put$Action(new BasicRootPaneUI$Actions()._BasicRootPaneUI$Actions(BasicRootPaneUI$Actions.RELEASE));
    map.put$Action(new BasicRootPaneUI$Actions()._BasicRootPaneUI$Actions(BasicRootPaneUI$Actions.POST_POPUP));
  }
  /**
   * Invoked when the default button property has changed. This reloads
   * the bindings from the defaults table with name
   * <code>RootPane.defaultButtonWindowKeyBindings</code>.
   */
  updateDefaultButtonBindings(root: JRootPane): void {
    let km = SwingUtilities.getUIInputMap(root, JComponent.WHEN_IN_FOCUSED_WINDOW);
    while (km != null && !(km instanceof BasicRootPaneUI$RootPaneInputMap)) {
      km = km.getParent();
    }
    if (km != null) {
      km.clear();
      if (root.getDefaultButton() != null) {
        let bindings = DefaultLookup.get(root, this, 'RootPane.defaultButtonWindowKeyBindings');
        if (bindings != null) {
          LookAndFeel.loadKeyBindings(km, bindings);
        }
      }
    }
  }
  /**
   * Invoked when a property changes on the root pane. If the event
   * indicates the <code>defaultButton</code> has changed, this will
   * reinstall the keyboard actions.
   */
  propertyChange(e: PropertyChangeEvent): void {
    if ($J.equals(e.getPropertyName(), 'defaultButton')) {
      let rootpane = e.getSource();
      this.updateDefaultButtonBindings(rootpane);
      if (rootpane.getClientProperty('temporaryDefaultButton') == null) {
        rootpane.putClientProperty('initialDefaultButton', e.getNewValue());
      }
    }
  }
  static $clinit() {
    BasicRootPaneUI.rootPaneUI = new BasicRootPaneUI()._BasicRootPaneUI();
  }
}

export class BasicRootPaneUI$Actions extends UIAction {
  static readonly PRESS: string = 'press';
  static readonly RELEASE: string = 'release';
  static readonly POST_POPUP: string = 'postPopup';
  _BasicRootPaneUI$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(evt: ActionEvent): void {
    let root = evt.getSource();
    let owner = root.getDefaultButton();
    let key = this.getName();
    if (key === BasicRootPaneUI$Actions.POST_POPUP) {
      let c = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
      if (c instanceof JComponent) {
        let src = c;
        let jpm = src.getComponentPopupMenu();
        if (jpm != null) {
          let pt = src.getPopupLocation$MouseEvent(null);
          if (pt == null) {
            let vis = src.getVisibleRect();
            pt = new Point()._Point$int$int((vis.x_ + $J.idiv(vis.width_, 2)) | 0, (vis.y_ + $J.idiv(vis.height_, 2)) | 0);
          }
          jpm.show$Component$int$int(c, pt.x_, pt.y_);
        }
      }
    } else if (owner != null && SwingUtilities.getRootPane(owner) === root) {
      if (key === BasicRootPaneUI$Actions.PRESS) {
        owner.doClick$int(20);
      }
    }
  }
  accept(sender: any): boolean {
    let key = this.getName();
    if (key === BasicRootPaneUI$Actions.POST_POPUP) {
      let elems = MenuSelectionManager.defaultManager().getSelectedPath();
      if (elems != null && elems.length !== 0) {
        return false;
      }
      let c = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
      if (c instanceof JComponent) {
        let src = c;
        return src.getComponentPopupMenu() != null;
      }
      return false;
    }
    if (sender instanceof JRootPane) {
      let owner = (sender).getDefaultButton();
      return (owner != null && owner.getModel().isEnabled() && owner.isShowing());
    }
    return true;
  }
}

export class BasicRootPaneUI$RootPaneInputMap extends ComponentInputMapUIResource {
  _BasicRootPaneUI$RootPaneInputMap(c: JComponent): this {
    this._ComponentInputMapUIResource(c);
    return this;
  }
}

$J.define(BasicRootPaneUI, 'javax.swing.plaf.basic.BasicRootPaneUI', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.plaf.RootPaneUI', ctors: { '': '_BasicRootPaneUI' }, clinit: true, lazy: ['rootPaneUI'] });
$J.define(BasicRootPaneUI$Actions, 'javax.swing.plaf.basic.BasicRootPaneUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicRootPaneUI$Actions' } });
$J.define(BasicRootPaneUI$RootPaneInputMap, 'javax.swing.plaf.basic.BasicRootPaneUI$RootPaneInputMap', { kind: 'class', sup: 'javax.swing.plaf.ComponentInputMapUIResource', ctors: { 'javax.swing.JComponent': '_BasicRootPaneUI$RootPaneInputMap' } });
$J.module(() => {
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  Point = $J.load('java.awt.Point');
  JComponent = $J.load('javax.swing.JComponent');
  JRootPane = $J.load('javax.swing.JRootPane');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  MenuSelectionManager = $J.load('javax.swing.MenuSelectionManager');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
