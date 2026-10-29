// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalToggleButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2019, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject, JString } from '../../../../../jre/index.ts';
import { BasicToggleButtonUI } from '../basic/BasicToggleButtonUI.ts';

let Rectangle, UIManager, UIResource, MetalUtils, SwingUtilities2;

/**
 * MetalToggleButton implementation
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
 */
export class MetalToggleButtonUI extends BasicToggleButtonUI {
  static METAL_TOGGLE_BUTTON_UI_KEY: any = null;
  /**
   * The color of a focused toggle button.
   */
  focusColor: Color = null;
  /**
   * The color of a selected button.
   */
  selectColor: Color = null;
  /**
   * The color of a disabled text.
   */
  disabledTextColor: Color = null;
  defaults_initialized: boolean = false;
  /**
   * Constructs a {@code MetalToggleButtonUI}.
   */
  _MetalToggleButtonUI(): this {
    this._BasicToggleButtonUI();
    this.defaults_initialized = false;
    return this;
  }
  /**
   * Constructs the {@code MetalToogleButtonUI}.
   *
   * @param b a component
   * @return the {@code MetalToogleButtonUI}.
   */
  static createUI(b: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let metalToggleButtonUI = appContext.get(MetalToggleButtonUI.METAL_TOGGLE_BUTTON_UI_KEY);
    if (metalToggleButtonUI == null) {
      metalToggleButtonUI = new MetalToggleButtonUI()._MetalToggleButtonUI();
      appContext.put(MetalToggleButtonUI.METAL_TOGGLE_BUTTON_UI_KEY, metalToggleButtonUI);
    }
    return metalToggleButtonUI;
  }
  installDefaults(b: AbstractButton): void {
    super.installDefaults(b);
    if (!this.defaults_initialized) {
      this.focusColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'focus');
      this.selectColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'select');
      this.disabledTextColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'disabledText');
      this.defaults_initialized = true;
    }
  }
  uninstallDefaults(b: AbstractButton): void {
    super.uninstallDefaults(b);
    this.defaults_initialized = false;
  }
  /**
   * Returns the color of a selected button.
   *
   * @return the color of a selected button
   */
  getSelectColor(): Color {
    return this.selectColor;
  }
  /**
   * Returns the color of a disabled text.
   *
   * @return the color of a disabled text
   */
  getDisabledTextColor(): Color {
    return this.disabledTextColor;
  }
  /**
   * Returns the color of a focused toggle button.
   *
   * @return the color of a focused toggle button
   */
  getFocusColor(): Color {
    return this.focusColor;
  }
  /**
   * If necessary paints the background of the component, then invokes
   * <code>paint</code>.
   *
   * @param g Graphics to paint to
   * @param c JComponent painting on
   * @throws NullPointerException if <code>g</code> or <code>c</code> is
   *         null
   * @see javax.swing.plaf.ComponentUI#update
   * @see javax.swing.plaf.ComponentUI#paint
   * @since 1.5
   */
  update(g: Graphics, c: JComponent): void {
    let button = c;
    if (($J.isa(c.getBackground(), UIResource)) && button.isContentAreaFilled() && c.isEnabled()) {
      let model = button.getModel();
      if (!MetalUtils.isToolBarButton(c)) {
        if (!model.isArmed() && !model.isPressed() && MetalUtils.drawGradient(c, g, 'ToggleButton.gradient', 0, 0, c.getWidth(), c.getHeight(), true)) {
          this.paint(g, c);
          return;
        }
      } else if ((model.isRollover() || model.isSelected()) && MetalUtils.drawGradient(c, g, 'ToggleButton.gradient', 0, 0, c.getWidth(), c.getHeight(), true)) {
        this.paint(g, c);
        return;
      }
    }
    super.update(g, c);
  }
  paintButtonPressed(g: Graphics, b: AbstractButton): void {
    if (b.isContentAreaFilled()) {
      g.setColor(this.getSelectColor());
      g.fillRect(0, 0, b.getWidth(), b.getHeight());
    }
  }
  paintText$Graphics$JComponent$Rectangle$String(g: Graphics, c: JComponent, textRect: Rectangle, text: string): void {
    let b = c;
    let model = b.getModel();
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(b, g);
    let mnemIndex = b.getDisplayedMnemonicIndex();
    if (model.isEnabled()) {
      g.setColor(b.getForeground());
    } else {
      if (model.isSelected()) {
        g.setColor(c.getBackground());
      } else {
        g.setColor(this.getDisabledTextColor());
      }
    }
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c, g, text, mnemIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
  }
  paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle(g: Graphics, b: AbstractButton, viewRect: Rectangle, textRect: Rectangle, iconRect: Rectangle): void {
    let focusRect = new Rectangle()._Rectangle$();
    let text = b.getText();
    let isIcon = b.getIcon() != null;
    if (text != null && !(text.length === 0)) {
      if (!isIcon) {
        focusRect.setBounds$Rectangle(textRect);
      } else {
        focusRect.setBounds$Rectangle(iconRect.union(textRect));
      }
    } else if (isIcon) {
      focusRect.setBounds$Rectangle(iconRect);
    }
    g.setColor(this.getFocusColor());
    g.drawRect(((focusRect.x_ - 1) | 0), ((focusRect.y_ - 1) | 0), (focusRect.width_ + 1) | 0, (focusRect.height_ + 1) | 0);
  }
  /**
   * Paints the appropriate icon of the button <code>b</code> in the
   * space <code>iconRect</code>.
   *
   * @param g Graphics to paint to
   * @param b Button to render for
   * @param iconRect space to render in
   * @throws NullPointerException if any of the arguments are null.
   * @since 1.5
   */
  paintIcon$Graphics$AbstractButton$Rectangle(g: Graphics, b: AbstractButton, iconRect: Rectangle): void {
    super.paintIcon$Graphics$AbstractButton$Rectangle(g, b, iconRect);
  }
  static $clinit() {
    MetalToggleButtonUI.METAL_TOGGLE_BUTTON_UI_KEY = new JObject();
  }
}

$J.define(MetalToggleButtonUI, 'javax.swing.plaf.metal.MetalToggleButtonUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicToggleButtonUI', ctors: { '': '_MetalToggleButtonUI' }, meths: { 'paintIcon(java.awt.Graphics,javax.swing.AbstractButton,java.awt.Rectangle)': 'paintIcon$Graphics$AbstractButton$Rectangle', 'paintFocus(java.awt.Graphics,javax.swing.AbstractButton,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle)': 'paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle', 'paintText(java.awt.Graphics,javax.swing.JComponent,java.awt.Rectangle,java.lang.String)': 'paintText$Graphics$JComponent$Rectangle$String' }, clinit: true, lazy: ['METAL_TOGGLE_BUTTON_UI_KEY'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
