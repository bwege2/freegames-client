// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicButtonUI } from '../basic/BasicButtonUI.ts';

let Rectangle, UIManager, UIResource, MetalUtils, SwingUtilities2;

/**
 * MetalButtonUI implementation
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
export class MetalButtonUI extends BasicButtonUI {
  /**
   * The color of the focused button.
   */
  focusColor: Color = null;
  /**
   * The color of the selected button.
   */
  selectColor: Color = null;
  /**
   * The color of the disabled color.
   */
  disabledTextColor: Color = null;
  static METAL_BUTTON_UI_KEY: any = null;
  /**
   * Constructs a {@code MetalButtonUI}.
   */
  _MetalButtonUI(): this {
    this._BasicButtonUI();
    return this;
  }
  /**
   * Returns an instance of {@code MetalButtonUI}.
   *
   * @param c a component
   * @return an instance of {@code MetalButtonUI}
   */
  static createUI(c: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let metalButtonUI = appContext.get(MetalButtonUI.METAL_BUTTON_UI_KEY);
    if (metalButtonUI == null) {
      metalButtonUI = new MetalButtonUI()._MetalButtonUI();
      appContext.put(MetalButtonUI.METAL_BUTTON_UI_KEY, metalButtonUI);
    }
    return metalButtonUI;
  }
  installDefaults(b: AbstractButton): void {
    super.installDefaults(b);
  }
  uninstallDefaults(b: AbstractButton): void {
    super.uninstallDefaults(b);
  }
  createButtonListener(b: AbstractButton): BasicButtonListener {
    return super.createButtonListener(b);
  }
  /**
   * Returns the color of the selected button.
   *
   * @return the color of the selected button
   */
  getSelectColor(): Color {
    this.selectColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'select');
    return this.selectColor;
  }
  /**
   * Returns the color of a disabled text.
   *
   * @return the color of a disabled text
   */
  getDisabledTextColor(): Color {
    this.disabledTextColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'disabledText');
    return this.disabledTextColor;
  }
  /**
   * Returns the color of the focused button.
   *
   * @return the color of the focused button
   */
  getFocusColor(): Color {
    this.focusColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'focus');
    return this.focusColor;
  }
  /**
   * If necessary paints the background of the component, then
   * invokes <code>paint</code>.
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
        if (!model.isArmed() && !model.isPressed() && MetalUtils.drawGradient(c, g, 'Button.gradient', 0, 0, c.getWidth(), c.getHeight(), true)) {
          this.paint(g, c);
          return;
        }
      } else if (model.isRollover() && MetalUtils.drawGradient(c, g, 'Button.gradient', 0, 0, c.getWidth(), c.getHeight(), true)) {
        this.paint(g, c);
        return;
      }
    }
    super.update(g, c);
  }
  paintButtonPressed(g: Graphics, b: AbstractButton): void {
    if (b.isContentAreaFilled()) {
      let size = b.getSize$();
      g.setColor(this.getSelectColor());
      g.fillRect(0, 0, size.width_, size.height_);
    }
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
  paintText$Graphics$JComponent$Rectangle$String(g: Graphics, c: JComponent, textRect: Rectangle, text: string): void {
    let b = c;
    let model = b.getModel();
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(c, g);
    let mnemIndex = b.getDisplayedMnemonicIndex();
    if (model.isEnabled()) {
      g.setColor(b.getForeground());
    } else {
      g.setColor(this.getDisabledTextColor());
    }
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c, g, text, mnemIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
  }
  static $clinit() {
    MetalButtonUI.METAL_BUTTON_UI_KEY = new JObject();
  }
}

$J.define(MetalButtonUI, 'javax.swing.plaf.metal.MetalButtonUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicButtonUI', ctors: { '': '_MetalButtonUI' }, meths: { 'paintText(java.awt.Graphics,javax.swing.JComponent,java.awt.Rectangle,java.lang.String)': 'paintText$Graphics$JComponent$Rectangle$String', 'paintFocus(java.awt.Graphics,javax.swing.AbstractButton,java.awt.Rectangle,java.awt.Rectangle,java.awt.Rectangle)': 'paintFocus$Graphics$AbstractButton$Rectangle$Rectangle$Rectangle' }, clinit: true, lazy: ['METAL_BUTTON_UI_KEY'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
