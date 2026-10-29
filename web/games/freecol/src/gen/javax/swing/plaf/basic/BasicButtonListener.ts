// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicButtonListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let FocusEvent$Cause, AbstractButton, JButton, JComponent, KeyStroke, SwingUtilities, ComponentInputMapUIResource, BasicButtonUI, BasicHTML, BasicLookAndFeel, LazyActionMap, DefaultLookup, SwingUtilities2;

/**
 * Button Listener
 *
 * @author Jeff Dinkins
 * @author Arnaud Weber (keyboard UI support)
 */
export class BasicButtonListener extends JObject {
  lastPressedTimestamp: number = 0;
  shouldDiscardRelease: boolean = false;
  /**
   * Constructs a new instance of {@code BasicButtonListener}.
   *
   * @param b an abstract button
   */
  _BasicButtonListener(b: AbstractButton): this {
    this.lastPressedTimestamp = -1;
    this.shouldDiscardRelease = false;
    return this;
  }
  /**
   * Populates Buttons actions.
   */
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicButtonListener$Actions()._BasicButtonListener$Actions(BasicButtonListener$Actions.PRESS));
    map.put$Action(new BasicButtonListener$Actions()._BasicButtonListener$Actions(BasicButtonListener$Actions.RELEASE));
  }
  propertyChange(e: PropertyChangeEvent): void {
    let prop = e.getPropertyName();
    if (prop === AbstractButton.MNEMONIC_CHANGED_PROPERTY) {
      this.updateMnemonicBinding(e.getSource());
    } else if (prop === AbstractButton.CONTENT_AREA_FILLED_CHANGED_PROPERTY) {
      this.checkOpacity(e.getSource());
    } else if (prop === AbstractButton.TEXT_CHANGED_PROPERTY || 'font' === prop || 'foreground' === prop || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
      let b = e.getSource();
      BasicHTML.updateRenderer(b, b.getText());
    }
  }
  /**
   * Checks the opacity of the {@code AbstractButton}.
   *
   * @param b an abstract button
   */
  checkOpacity(b: AbstractButton): void {
    b.setOpaque(b.isContentAreaFilled());
  }
  /**
   * Register default key actions: pressing space to "click" a
   * button and registering the keyboard mnemonic (if any).
   *
   * @param c a component
   */
  installKeyboardActions(c: JComponent): void {
    let b = c;
    this.updateMnemonicBinding(b);
    LazyActionMap.installLazyActionMap(c, $J.cls(BasicButtonListener), 'Button.actionMap');
    let km = this.getInputMap(JComponent.WHEN_FOCUSED, c);
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_FOCUSED, km);
  }
  /**
   * Unregister default key actions.
   *
   * @param c a component
   */
  uninstallKeyboardActions(c: JComponent): void {
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_FOCUSED, null);
    SwingUtilities.replaceUIActionMap(c, null);
  }
  /**
   * Returns the InputMap for condition <code>condition</code>. Called as
   * part of <code>installKeyboardActions</code>.
   */
  getInputMap(condition: number, c: JComponent): InputMap {
    if (condition === JComponent.WHEN_FOCUSED) {
      let ui = BasicLookAndFeel.getUIOfType((c).getUI(), $J.cls(BasicButtonUI));
      if (ui != null) {
        return DefaultLookup.get(c, ui, ui.getPropertyPrefix() + 'focusInputMap');
      }
    }
    return null;
  }
  /**
   * Resets the binding for the mnemonic in the WHEN_IN_FOCUSED_WINDOW
   * UI InputMap.
   */
  updateMnemonicBinding(b: AbstractButton): void {
    let m = b.getMnemonic();
    if (m !== 0) {
      let map = SwingUtilities.getUIInputMap(b, JComponent.WHEN_IN_FOCUSED_WINDOW);
      if (map == null) {
        map = new ComponentInputMapUIResource()._ComponentInputMapUIResource(b);
        SwingUtilities.replaceUIInputMap(b, JComponent.WHEN_IN_FOCUSED_WINDOW, map);
      }
      map.clear();
      map.put(KeyStroke.getKeyStroke$int$int$boolean(m, BasicLookAndFeel.getFocusAcceleratorKeyMask(), false), 'pressed');
      map.put(KeyStroke.getKeyStroke$int$int$boolean(m, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()), false), 'pressed');
      map.put(KeyStroke.getKeyStroke$int$int$boolean(m, BasicLookAndFeel.getFocusAcceleratorKeyMask(), true), 'released');
      map.put(KeyStroke.getKeyStroke$int$int$boolean(m, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()), true), 'released');
      map.put(KeyStroke.getKeyStroke$int$int$boolean(m, 0, true), 'released');
    } else {
      let map = SwingUtilities.getUIInputMap(b, JComponent.WHEN_IN_FOCUSED_WINDOW);
      if (map != null) {
        map.clear();
      }
    }
  }
  stateChanged(e: ChangeEvent): void {
    let b = e.getSource();
    b.repaint$();
  }
  focusGained(e: FocusEvent): void {
    let b = e.getSource();
    if (b instanceof JButton && (b).isDefaultCapable()) {
      let root = b.getRootPane();
      if (root != null) {
        let ui = BasicLookAndFeel.getUIOfType(b.getUI(), $J.cls(BasicButtonUI));
        if (ui != null && DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(b, ui, ui.getPropertyPrefix() + 'defaultButtonFollowsFocus', true)) {
          root.putClientProperty('temporaryDefaultButton', b);
          root.setDefaultButton(b);
          root.putClientProperty('temporaryDefaultButton', null);
        }
      }
    }
    b.repaint$();
  }
  focusLost(e: FocusEvent): void {
    let b = e.getSource();
    let root = b.getRootPane();
    if (root != null) {
      let initialDefault = root.getClientProperty('initialDefaultButton');
      if (b !== initialDefault) {
        let ui = BasicLookAndFeel.getUIOfType(b.getUI(), $J.cls(BasicButtonUI));
        if (ui != null && DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(b, ui, ui.getPropertyPrefix() + 'defaultButtonFollowsFocus', true)) {
          root.setDefaultButton(initialDefault);
        }
      }
    }
    let model = b.getModel();
    model.setPressed(false);
    model.setArmed(false);
    b.repaint$();
  }
  mouseMoved(e: MouseEvent): void {
  }
  mouseDragged(e: MouseEvent): void {
  }
  mouseClicked(e: MouseEvent): void {
  }
  mousePressed(e: MouseEvent): void {
    if (SwingUtilities.isLeftMouseButton(e)) {
      let b = e.getSource();
      if (b.contains$int$int(e.getX(), e.getY())) {
        let lastTime = this.lastPressedTimestamp;
        this.lastPressedTimestamp = e.getWhen();
        let timeSinceLastClick = this.lastPressedTimestamp - lastTime;
        if (lastTime !== -1 && timeSinceLastClick > 0 && timeSinceLastClick < b.getMultiClickThreshhold()) {
          this.shouldDiscardRelease = true;
          return;
        }
        let model = b.getModel();
        if (!model.isEnabled()) {
          return;
        }
        if (!model.isArmed()) {
          model.setArmed(true);
        }
        model.setPressed(true);
        if (!b.hasFocus() && b.isRequestFocusEnabled()) {
          b.requestFocus$Cause(FocusEvent$Cause.MOUSE_EVENT);
        }
      }
    }
  }
  mouseReleased(e: MouseEvent): void {
    if (SwingUtilities.isLeftMouseButton(e)) {
      if (this.shouldDiscardRelease) {
        this.shouldDiscardRelease = false;
        return;
      }
      let b = e.getSource();
      let model = b.getModel();
      model.setPressed(false);
      model.setArmed(false);
    }
  }
  mouseEntered(e: MouseEvent): void {
    let b = e.getSource();
    let model = b.getModel();
    if (b.isRolloverEnabled() && !SwingUtilities.isLeftMouseButton(e)) {
      model.setRollover(true);
    }
    if (model.isPressed()) {
      model.setArmed(true);
    }
  }
  mouseExited(e: MouseEvent): void {
    let b = e.getSource();
    let model = b.getModel();
    if (b.isRolloverEnabled()) {
      model.setRollover(false);
    }
    model.setArmed(false);
  }
}

/**
 * Actions for Buttons. Two types of action are supported:
 * pressed: Moves the button to a pressed state
 * released: Disarms the button.
 */
export class BasicButtonListener$Actions extends UIAction {
  static readonly PRESS: string = 'pressed';
  static readonly RELEASE: string = 'released';
  _BasicButtonListener$Actions(name: string): this {
    this._UIAction(name);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let b = e.getSource();
    let key = this.getName();
    if (key === BasicButtonListener$Actions.PRESS) {
      let model = b.getModel();
      model.setArmed(true);
      model.setPressed(true);
      if (!b.hasFocus()) {
        b.requestFocus$();
      }
    } else if (key === BasicButtonListener$Actions.RELEASE) {
      let model = b.getModel();
      model.setPressed(false);
      model.setArmed(false);
    }
  }
  accept(sender: any): boolean {
    return !((sender instanceof AbstractButton) && !(sender).getModel().isEnabled());
  }
}

$J.define(BasicButtonListener, 'javax.swing.plaf.basic.BasicButtonListener', { kind: 'class', ifaces: ['java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener', 'java.awt.event.FocusListener', 'javax.swing.event.ChangeListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.AbstractButton': '_BasicButtonListener' } });
$J.define(BasicButtonListener$Actions, 'javax.swing.plaf.basic.BasicButtonListener$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicButtonListener$Actions' } });
$J.module(() => {
  FocusEvent$Cause = $J.load('java.awt.event.FocusEvent$Cause');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  JButton = $J.load('javax.swing.JButton');
  JComponent = $J.load('javax.swing.JComponent');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ComponentInputMapUIResource = $J.load('javax.swing.plaf.ComponentInputMapUIResource');
  BasicButtonUI = $J.load('javax.swing.plaf.basic.BasicButtonUI');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
