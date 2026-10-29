// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicDesktopPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { DesktopPaneUI } from '../DesktopPaneUI.ts';
import { DefaultDesktopManager } from '../../DefaultDesktopManager.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Dimension, Insets, KeyboardFocusManager, PropertyVetoException, JComponent, JDesktopPane, LookAndFeel, SortingFocusTraversalPolicy, SwingUtilities, UIManager, UIResource, LazyActionMap, DefaultLookup;

/**
 * Basic L&amp;F for a desktop.
 *
 * @author Steve Wilson
 */
export class BasicDesktopPaneUI extends DesktopPaneUI {
  static SHARED_ACTION: BasicDesktopPaneUI$Actions = null;
  handler: BasicDesktopPaneUI$Handler = null;
  pcl: PropertyChangeListener = null;
  /**
   * The instance of {@code JDesktopPane}.
   */
  desktop: JDesktopPane = null;
  /**
   * The instance of {@code DesktopManager}.
   */
  desktopManager: DesktopManager = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of 1.3.
   */
  minimizeKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of 1.3.
   */
  maximizeKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of 1.3.
   */
  closeKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of 1.3.
   */
  navigateKey: KeyStroke = null;
  /**
   * As of Java 2 platform v1.3 this previously undocumented field is no
   * longer used.
   * Key bindings are now defined by the LookAndFeel, please refer to
   * the key bindings specification for further details.
   *
   * @deprecated As of 1.3.
   */
  navigateKey2: KeyStroke = null;
  /**
   * Constructs a new instance of {@code BasicDesktopPaneUI}.
   */
  _BasicDesktopPaneUI(): this {
    this._DesktopPaneUI();
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicDesktopPaneUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicDesktopPaneUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicDesktopPaneUI()._BasicDesktopPaneUI();
  }
  installUI(c: JComponent): void {
    this.desktop = c;
    this.installDefaults();
    this.installDesktopManager();
    this.installListeners();
    this.installKeyboardActions();
  }
  uninstallUI(c: JComponent): void {
    this.uninstallKeyboardActions();
    this.uninstallListeners();
    this.uninstallDesktopManager();
    this.uninstallDefaults();
    this.desktop = null;
    this.handler = null;
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    if (this.desktop.getBackground() == null || $J.isa(this.desktop.getBackground(), UIResource)) {
      this.desktop.setBackground(UIManager.getColor$Object('Desktop.background'));
    }
    LookAndFeel.installProperty(this.desktop, 'opaque', true);
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
  }
  /**
   * Installs the <code>PropertyChangeListener</code> returned from
   * <code>createPropertyChangeListener</code> on the
   * <code>JDesktopPane</code>.
   *
   * @since 1.5
   * @see #createPropertyChangeListener
   */
  installListeners(): void {
    this.pcl = this.createPropertyChangeListener();
    this.desktop.addPropertyChangeListener$PropertyChangeListener(this.pcl);
  }
  /**
   * Uninstalls the <code>PropertyChangeListener</code> returned from
   * <code>createPropertyChangeListener</code> from the
   * <code>JDesktopPane</code>.
   *
   * @since 1.5
   * @see #createPropertyChangeListener
   */
  uninstallListeners(): void {
    this.desktop.removePropertyChangeListener$PropertyChangeListener(this.pcl);
    this.pcl = null;
  }
  /**
   * Installs desktop manager.
   */
  installDesktopManager(): void {
    this.desktopManager = this.desktop.getDesktopManager();
    if (this.desktopManager == null) {
      this.desktopManager = new BasicDesktopPaneUI$BasicDesktopManager()._BasicDesktopPaneUI$BasicDesktopManager();
      this.desktop.setDesktopManager(this.desktopManager);
    }
  }
  /**
   * Uninstalls desktop manager.
   */
  uninstallDesktopManager(): void {
    if ($J.isa(this.desktop.getDesktopManager(), UIResource)) {
      this.desktop.setDesktopManager(null);
    }
    this.desktopManager = null;
  }
  /**
   * Installs keyboard actions.
   */
  installKeyboardActions(): void {
    let inputMap = this.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
    if (inputMap != null) {
      SwingUtilities.replaceUIInputMap(this.desktop, JComponent.WHEN_IN_FOCUSED_WINDOW, inputMap);
    }
    inputMap = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    if (inputMap != null) {
      SwingUtilities.replaceUIInputMap(this.desktop, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, inputMap);
    }
    LazyActionMap.installLazyActionMap(this.desktop, $J.cls(BasicDesktopPaneUI), 'DesktopPane.actionMap');
    this.registerKeyboardActions();
  }
  /**
   * Registers keyboard actions.
   */
  registerKeyboardActions(): void {
  }
  /**
   * Unregisters keyboard actions.
   */
  unregisterKeyboardActions(): void {
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      return this.createInputMap(condition);
    } else if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.desktop, this, 'Desktop.ancestorInputMap');
    }
    return null;
  }
  createInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_IN_FOCUSED_WINDOW) {
      let bindings = DefaultLookup.get(this.desktop, this, 'Desktop.windowBindings');
      if (bindings != null) {
        return LookAndFeel.makeComponentInputMap(this.desktop, bindings);
      }
    }
    return null;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.RESTORE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.CLOSE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.MOVE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.RESIZE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.LEFT));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.SHRINK_LEFT));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.RIGHT));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.SHRINK_RIGHT));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.UP));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.SHRINK_UP));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.DOWN));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.SHRINK_DOWN));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.ESCAPE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.MINIMIZE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.MAXIMIZE));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.NEXT_FRAME));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.PREVIOUS_FRAME));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.NAVIGATE_NEXT));
    map.put$Action(new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$String(BasicDesktopPaneUI$Actions.NAVIGATE_PREVIOUS));
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    this.unregisterKeyboardActions();
    SwingUtilities.replaceUIInputMap(this.desktop, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIInputMap(this.desktop, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
    SwingUtilities.replaceUIActionMap(this.desktop, null);
  }
  paint(g: Graphics, c: JComponent): void {
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return null;
  }
  getMinimumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(0, 0);
  }
  getMaximumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  /**
   * Returns the <code>PropertyChangeListener</code> to install on
   * the <code>JDesktopPane</code>.
   *
   * @since 1.5
   * @return The PropertyChangeListener that will be added to track
   * changes in the desktop pane.
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicDesktopPaneUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicDesktopPaneUI$Handler().$o(this)._BasicDesktopPaneUI$Handler();
    }
    return this.handler;
  }
  static $clinit() {
    BasicDesktopPaneUI.SHARED_ACTION = new BasicDesktopPaneUI$Actions()._BasicDesktopPaneUI$Actions$();
  }
}

export class BasicDesktopPaneUI$Handler extends JObject {
  _BasicDesktopPaneUI$Handler(): this {
    return this;
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let propertyName = evt.getPropertyName();
    if ('desktopManager' === propertyName) {
      this.$outer.installDesktopManager();
    }
  }
}

/**
 * The default DesktopManager installed by the UI.
 */
export class BasicDesktopPaneUI$BasicDesktopManager extends DefaultDesktopManager {
  _BasicDesktopPaneUI$BasicDesktopManager(): this {
    this._DefaultDesktopManager();
    return this;
  }
}

export class BasicDesktopPaneUI$Actions extends UIAction {
  static CLOSE: string = null;
  static ESCAPE: string = null;
  static MAXIMIZE: string = null;
  static MINIMIZE: string = null;
  static MOVE: string = null;
  static RESIZE: string = null;
  static RESTORE: string = null;
  static LEFT: string = null;
  static RIGHT: string = null;
  static UP: string = null;
  static DOWN: string = null;
  static SHRINK_LEFT: string = null;
  static SHRINK_RIGHT: string = null;
  static SHRINK_UP: string = null;
  static SHRINK_DOWN: string = null;
  static NEXT_FRAME: string = null;
  static PREVIOUS_FRAME: string = null;
  static NAVIGATE_NEXT: string = null;
  static NAVIGATE_PREVIOUS: string = null;
  MOVE_RESIZE_INCREMENT: number = 0;
  static moving: boolean = false;
  static resizing: boolean = false;
  static sourceFrame: JInternalFrame = null;
  static focusOwner: Component = null;
  $init_BasicDesktopPaneUI_Actions() {
    this.MOVE_RESIZE_INCREMENT = 10;
  }
  _BasicDesktopPaneUI$Actions$(): this {
    this._UIAction(null);
    this.$init_BasicDesktopPaneUI_Actions();
    return this;
  }
  _BasicDesktopPaneUI$Actions$String(name: string): this {
    this._UIAction(name);
    this.$init_BasicDesktopPaneUI_Actions();
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let dp = e.getSource();
    let key = this.getName();
    var sPolicy;
    if (BasicDesktopPaneUI$Actions.CLOSE === key || BasicDesktopPaneUI$Actions.MAXIMIZE === key || BasicDesktopPaneUI$Actions.MINIMIZE === key || BasicDesktopPaneUI$Actions.RESTORE === key) {
      this.setState(dp, key);
    } else if (BasicDesktopPaneUI$Actions.ESCAPE === key) {
      if (BasicDesktopPaneUI$Actions.sourceFrame === dp.getSelectedFrame() && BasicDesktopPaneUI$Actions.focusOwner != null) {
        BasicDesktopPaneUI$Actions.focusOwner.requestFocus$();
      }
      BasicDesktopPaneUI$Actions.moving = false;
      BasicDesktopPaneUI$Actions.resizing = false;
      BasicDesktopPaneUI$Actions.sourceFrame = null;
      BasicDesktopPaneUI$Actions.focusOwner = null;
    } else if (BasicDesktopPaneUI$Actions.MOVE === key || BasicDesktopPaneUI$Actions.RESIZE === key) {
      BasicDesktopPaneUI$Actions.sourceFrame = dp.getSelectedFrame();
      if (BasicDesktopPaneUI$Actions.sourceFrame == null) {
        return;
      }
      BasicDesktopPaneUI$Actions.moving = (key === BasicDesktopPaneUI$Actions.MOVE) ? true : false;
      BasicDesktopPaneUI$Actions.resizing = (key === BasicDesktopPaneUI$Actions.RESIZE) ? true : false;
      BasicDesktopPaneUI$Actions.focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner();
      if (!SwingUtilities.isDescendingFrom(BasicDesktopPaneUI$Actions.focusOwner, BasicDesktopPaneUI$Actions.sourceFrame)) {
        BasicDesktopPaneUI$Actions.focusOwner = null;
      }
      BasicDesktopPaneUI$Actions.sourceFrame.requestFocus$();
    } else if (BasicDesktopPaneUI$Actions.LEFT === key || BasicDesktopPaneUI$Actions.RIGHT === key || BasicDesktopPaneUI$Actions.UP === key || BasicDesktopPaneUI$Actions.DOWN === key || BasicDesktopPaneUI$Actions.SHRINK_RIGHT === key || BasicDesktopPaneUI$Actions.SHRINK_LEFT === key || BasicDesktopPaneUI$Actions.SHRINK_UP === key || BasicDesktopPaneUI$Actions.SHRINK_DOWN === key) {
      let c = dp.getSelectedFrame();
      if (BasicDesktopPaneUI$Actions.sourceFrame == null || c !== BasicDesktopPaneUI$Actions.sourceFrame || KeyboardFocusManager.getCurrentKeyboardFocusManager$().getFocusOwner() !== BasicDesktopPaneUI$Actions.sourceFrame) {
        return;
      }
      let minOnScreenInsets = UIManager.getInsets$Object('Desktop.minOnScreenInsets');
      if (minOnScreenInsets == null) {
        minOnScreenInsets = new Insets()._Insets(0, 0, 0, 0);
      }
      let size = c.getSize$();
      let minSize = c.getMinimumSize$();
      let dpWidth = dp.getWidth();
      let dpHeight = dp.getHeight();
      let delta: number;
      let loc = c.getLocation$();
      if (BasicDesktopPaneUI$Actions.LEFT === key) {
        if (BasicDesktopPaneUI$Actions.moving) {
          c.setLocation$int$int(((loc.x_ + size.width_ - this.MOVE_RESIZE_INCREMENT) | 0) < minOnScreenInsets.right ? (-size.width_ + minOnScreenInsets.right) | 0 : (loc.x_ - this.MOVE_RESIZE_INCREMENT) | 0, loc.y_);
        } else if (BasicDesktopPaneUI$Actions.resizing) {
          c.setLocation$int$int((loc.x_ - this.MOVE_RESIZE_INCREMENT) | 0, loc.y_);
          c.setSize$int$int((size.width_ + this.MOVE_RESIZE_INCREMENT) | 0, size.height_);
        }
      } else if (BasicDesktopPaneUI$Actions.RIGHT === key) {
        if (BasicDesktopPaneUI$Actions.moving) {
          c.setLocation$int$int(((loc.x_ + this.MOVE_RESIZE_INCREMENT) | 0) > ((dpWidth - minOnScreenInsets.left) | 0) ? (dpWidth - minOnScreenInsets.left) | 0 : (loc.x_ + this.MOVE_RESIZE_INCREMENT) | 0, loc.y_);
        } else if (BasicDesktopPaneUI$Actions.resizing) {
          c.setSize$int$int((size.width_ + this.MOVE_RESIZE_INCREMENT) | 0, size.height_);
        }
      } else if (BasicDesktopPaneUI$Actions.UP === key) {
        if (BasicDesktopPaneUI$Actions.moving) {
          c.setLocation$int$int(loc.x_, ((loc.y_ + size.height_ - this.MOVE_RESIZE_INCREMENT) | 0) < minOnScreenInsets.bottom ? (-size.height_ + minOnScreenInsets.bottom) | 0 : (loc.y_ - this.MOVE_RESIZE_INCREMENT) | 0);
        } else if (BasicDesktopPaneUI$Actions.resizing) {
          c.setLocation$int$int(loc.x_, (loc.y_ - this.MOVE_RESIZE_INCREMENT) | 0);
          c.setSize$int$int(size.width_, (size.height_ + this.MOVE_RESIZE_INCREMENT) | 0);
        }
      } else if (BasicDesktopPaneUI$Actions.DOWN === key) {
        if (BasicDesktopPaneUI$Actions.moving) {
          c.setLocation$int$int(loc.x_, ((loc.y_ + this.MOVE_RESIZE_INCREMENT) | 0) > ((dpHeight - minOnScreenInsets.top) | 0) ? (dpHeight - minOnScreenInsets.top) | 0 : (loc.y_ + this.MOVE_RESIZE_INCREMENT) | 0);
        } else if (BasicDesktopPaneUI$Actions.resizing) {
          c.setSize$int$int(size.width_, (size.height_ + this.MOVE_RESIZE_INCREMENT) | 0);
        }
      } else if (BasicDesktopPaneUI$Actions.SHRINK_LEFT === key && BasicDesktopPaneUI$Actions.resizing) {
        if (minSize.width_ < ((size.width_ - this.MOVE_RESIZE_INCREMENT) | 0)) {
          delta = this.MOVE_RESIZE_INCREMENT;
        } else {
          delta = (size.width_ - minSize.width_) | 0;
        }
        if (((loc.x_ + size.width_ - delta) | 0) < minOnScreenInsets.left) {
          delta = (loc.x_ + size.width_ - minOnScreenInsets.left) | 0;
        }
        c.setSize$int$int((size.width_ - delta) | 0, size.height_);
      } else if (BasicDesktopPaneUI$Actions.SHRINK_RIGHT === key && BasicDesktopPaneUI$Actions.resizing) {
        if (minSize.width_ < ((size.width_ - this.MOVE_RESIZE_INCREMENT) | 0)) {
          delta = this.MOVE_RESIZE_INCREMENT;
        } else {
          delta = (size.width_ - minSize.width_) | 0;
        }
        if (((loc.x_ + delta) | 0) > ((dpWidth - minOnScreenInsets.right) | 0)) {
          delta = (dpWidth - minOnScreenInsets.right - loc.x_) | 0;
        }
        c.setLocation$int$int((loc.x_ + delta) | 0, loc.y_);
        c.setSize$int$int((size.width_ - delta) | 0, size.height_);
      } else if (BasicDesktopPaneUI$Actions.SHRINK_UP === key && BasicDesktopPaneUI$Actions.resizing) {
        if (minSize.height_ < ((size.height_ - this.MOVE_RESIZE_INCREMENT) | 0)) {
          delta = this.MOVE_RESIZE_INCREMENT;
        } else {
          delta = (size.height_ - minSize.height_) | 0;
        }
        if (((loc.y_ + size.height_ - delta) | 0) < minOnScreenInsets.bottom) {
          delta = (loc.y_ + size.height_ - minOnScreenInsets.bottom) | 0;
        }
        c.setSize$int$int(size.width_, (size.height_ - delta) | 0);
      } else if (BasicDesktopPaneUI$Actions.SHRINK_DOWN === key && BasicDesktopPaneUI$Actions.resizing) {
        if (minSize.height_ < ((size.height_ - this.MOVE_RESIZE_INCREMENT) | 0)) {
          delta = this.MOVE_RESIZE_INCREMENT;
        } else {
          delta = (size.height_ - minSize.height_) | 0;
        }
        if (((loc.y_ + delta) | 0) > ((dpHeight - minOnScreenInsets.top) | 0)) {
          delta = (dpHeight - minOnScreenInsets.top - loc.y_) | 0;
        }
        c.setLocation$int$int(loc.x_, (loc.y_ + delta) | 0);
        c.setSize$int$int(size.width_, (size.height_ - delta) | 0);
      }
    } else if (BasicDesktopPaneUI$Actions.NEXT_FRAME === key || BasicDesktopPaneUI$Actions.PREVIOUS_FRAME === key) {
      dp.selectFrame((key === BasicDesktopPaneUI$Actions.NEXT_FRAME) ? true : false);
    } else if (BasicDesktopPaneUI$Actions.NAVIGATE_NEXT === key || BasicDesktopPaneUI$Actions.NAVIGATE_PREVIOUS === key) {
      let moveForward = true;
      if (BasicDesktopPaneUI$Actions.NAVIGATE_PREVIOUS === key) {
        moveForward = false;
      }
      let cycleRoot = dp.getFocusCycleRootAncestor();
      var sPolicy;
      if (cycleRoot != null) {
        let policy = cycleRoot.getFocusTraversalPolicy();
        var sPolicy;
        if ((sPolicy = policy) instanceof SortingFocusTraversalPolicy) {
          let idc = sPolicy.getImplicitDownCycleTraversal();
          try {
            sPolicy.setImplicitDownCycleTraversal(false);
            if (moveForward) {
              KeyboardFocusManager.getCurrentKeyboardFocusManager$().focusNextComponent$Component(dp);
            } else {
              KeyboardFocusManager.getCurrentKeyboardFocusManager$().focusPreviousComponent$Component(dp);
            }
          } finally {
            sPolicy.setImplicitDownCycleTraversal(idc);
          }
        }
      }
    }
  }
  setState(dp: JDesktopPane, state: string): void {
    if (state === BasicDesktopPaneUI$Actions.CLOSE) {
      let f = dp.getSelectedFrame();
      if (f == null) {
        return;
      }
      f.doDefaultCloseAction();
    } else if (state === BasicDesktopPaneUI$Actions.MAXIMIZE) {
      let f = dp.getSelectedFrame();
      if (f == null) {
        return;
      }
      if (!f.isMaximum()) {
        if (f.isIcon()) {
          try {
            f.setIcon(false);
            f.setMaximum(true);
          } catch ($e0) {
            if ($J.isa($e0, PropertyVetoException)) {
              let pve = $J.exc($e0);
            } else {
              throw $e0;
            }
          }
        } else {
          try {
            f.setMaximum(true);
          } catch ($e1) {
            if ($J.isa($e1, PropertyVetoException)) {
              let pve = $J.exc($e1);
            } else {
              throw $e1;
            }
          }
        }
      }
    } else if (state === BasicDesktopPaneUI$Actions.MINIMIZE) {
      let f = dp.getSelectedFrame();
      if (f == null) {
        return;
      }
      if (!f.isIcon()) {
        try {
          f.setIcon(true);
        } catch ($e2) {
          if ($J.isa($e2, PropertyVetoException)) {
            let pve = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
      }
    } else if (state === BasicDesktopPaneUI$Actions.RESTORE) {
      let f = dp.getSelectedFrame();
      if (f == null) {
        return;
      }
      try {
        if (f.isIcon()) {
          f.setIcon(false);
        } else if (f.isMaximum()) {
          f.setMaximum(false);
        }
        f.setSelected(true);
      } catch ($e3) {
        if ($J.isa($e3, PropertyVetoException)) {
          let pve = $J.exc($e3);
        } else {
          throw $e3;
        }
      }
    }
  }
  accept(sender: any): boolean {
    if (sender instanceof JDesktopPane) {
      let dp = sender;
      let action = this.getName();
      if (action === BasicDesktopPaneUI$Actions.NEXT_FRAME || action === BasicDesktopPaneUI$Actions.PREVIOUS_FRAME) {
        return true;
      }
      let iFrame = dp.getSelectedFrame();
      if (iFrame == null) {
        return false;
      } else if (action === BasicDesktopPaneUI$Actions.CLOSE) {
        return iFrame.isClosable();
      } else if (action === BasicDesktopPaneUI$Actions.MINIMIZE) {
        return iFrame.isIconifiable();
      } else if (action === BasicDesktopPaneUI$Actions.MAXIMIZE) {
        return iFrame.isMaximizable();
      }
      return true;
    }
    return false;
  }
  static $clinit() {
    BasicDesktopPaneUI$Actions.CLOSE = 'close';
    BasicDesktopPaneUI$Actions.ESCAPE = 'escape';
    BasicDesktopPaneUI$Actions.MAXIMIZE = 'maximize';
    BasicDesktopPaneUI$Actions.MINIMIZE = 'minimize';
    BasicDesktopPaneUI$Actions.MOVE = 'move';
    BasicDesktopPaneUI$Actions.RESIZE = 'resize';
    BasicDesktopPaneUI$Actions.RESTORE = 'restore';
    BasicDesktopPaneUI$Actions.LEFT = 'left';
    BasicDesktopPaneUI$Actions.RIGHT = 'right';
    BasicDesktopPaneUI$Actions.UP = 'up';
    BasicDesktopPaneUI$Actions.DOWN = 'down';
    BasicDesktopPaneUI$Actions.SHRINK_LEFT = 'shrinkLeft';
    BasicDesktopPaneUI$Actions.SHRINK_RIGHT = 'shrinkRight';
    BasicDesktopPaneUI$Actions.SHRINK_UP = 'shrinkUp';
    BasicDesktopPaneUI$Actions.SHRINK_DOWN = 'shrinkDown';
    BasicDesktopPaneUI$Actions.NEXT_FRAME = 'selectNextFrame';
    BasicDesktopPaneUI$Actions.PREVIOUS_FRAME = 'selectPreviousFrame';
    BasicDesktopPaneUI$Actions.NAVIGATE_NEXT = 'navigateNext';
    BasicDesktopPaneUI$Actions.NAVIGATE_PREVIOUS = 'navigatePrevious';
    BasicDesktopPaneUI$Actions.moving = false;
    BasicDesktopPaneUI$Actions.resizing = false;
    BasicDesktopPaneUI$Actions.sourceFrame = null;
    BasicDesktopPaneUI$Actions.focusOwner = null;
  }
}

$J.define(BasicDesktopPaneUI, 'javax.swing.plaf.basic.BasicDesktopPaneUI', { kind: 'class', sup: 'javax.swing.plaf.DesktopPaneUI', ctors: { '': '_BasicDesktopPaneUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['SHARED_ACTION'] });
$J.define(BasicDesktopPaneUI$Handler, 'javax.swing.plaf.basic.BasicDesktopPaneUI$Handler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicDesktopPaneUI$Handler' }, inner: true });
$J.define(BasicDesktopPaneUI$BasicDesktopManager, 'javax.swing.plaf.basic.BasicDesktopPaneUI$BasicDesktopManager', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.DefaultDesktopManager', ctors: { '': '_BasicDesktopPaneUI$BasicDesktopManager' } });
$J.define(BasicDesktopPaneUI$Actions, 'javax.swing.plaf.basic.BasicDesktopPaneUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicDesktopPaneUI$Actions$String', '': '_BasicDesktopPaneUI$Actions$' }, clinit: true, lazy: ['CLOSE', 'ESCAPE', 'MAXIMIZE', 'MINIMIZE', 'MOVE', 'RESIZE', 'RESTORE', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'SHRINK_LEFT', 'SHRINK_RIGHT', 'SHRINK_UP', 'SHRINK_DOWN', 'NEXT_FRAME', 'PREVIOUS_FRAME', 'NAVIGATE_NEXT', 'NAVIGATE_PREVIOUS', 'moving', 'resizing', 'sourceFrame', 'focusOwner'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  PropertyVetoException = $J.load('java.beans.PropertyVetoException');
  JComponent = $J.load('javax.swing.JComponent');
  JDesktopPane = $J.load('javax.swing.JDesktopPane');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SortingFocusTraversalPolicy = $J.load('javax.swing.SortingFocusTraversalPolicy');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
