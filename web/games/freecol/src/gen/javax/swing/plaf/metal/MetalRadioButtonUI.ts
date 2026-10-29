// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalRadioButtonUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject } from '../../../../../jre/index.ts';
import { BasicRadioButtonUI } from '../basic/BasicRadioButtonUI.ts';

let Rectangle, LookAndFeel, SwingUtilities, UIManager, BasicHTML, SwingUtilities2;

/**
 * RadioButtonUI implementation for MetalRadioButtonUI
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
 * @author Michael C. Albers (Metal modifications)
 * @author Jeff Dinkins (original BasicRadioButtonCode)
 */
export class MetalRadioButtonUI extends BasicRadioButtonUI {
  static METAL_RADIO_BUTTON_UI_KEY: any = null;
  /**
   * The color of the focused radio button.
   */
  focusColor: Color = null;
  /**
   * The color of the selected radio button.
   */
  selectColor: Color = null;
  /**
   * The color of a disabled text.
   */
  disabledTextColor: Color = null;
  defaults_initialized$MetalRadioButtonUI: boolean = false;
  /**
   * Constructs a {@code MetalRadioButtonUI}.
   */
  _MetalRadioButtonUI(): this {
    this._BasicRadioButtonUI();
    this.defaults_initialized$MetalRadioButtonUI = false;
    return this;
  }
  /**
   * Returns an instance of {@code MetalRadioButtonUI}.
   *
   * @param c a component
   * @return an instance of {@code MetalRadioButtonUI}
   */
  static createUI(c: JComponent): ComponentUI {
    let appContext = AppContext.getAppContext();
    let metalRadioButtonUI = appContext.get(MetalRadioButtonUI.METAL_RADIO_BUTTON_UI_KEY);
    if (metalRadioButtonUI == null) {
      metalRadioButtonUI = new MetalRadioButtonUI()._MetalRadioButtonUI();
      appContext.put(MetalRadioButtonUI.METAL_RADIO_BUTTON_UI_KEY, metalRadioButtonUI);
    }
    return metalRadioButtonUI;
  }
  installDefaults(b: AbstractButton): void {
    super.installDefaults(b);
    if (!this.defaults_initialized$MetalRadioButtonUI) {
      this.focusColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'focus');
      this.selectColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'select');
      this.disabledTextColor = UIManager.getColor$Object(this.getPropertyPrefix() + 'disabledText');
      this.defaults_initialized$MetalRadioButtonUI = true;
    }
    LookAndFeel.installProperty(b, 'opaque', true);
  }
  uninstallDefaults(b: AbstractButton): void {
    super.uninstallDefaults(b);
    this.defaults_initialized$MetalRadioButtonUI = false;
  }
  /**
   * Returns the color of the disabled text.
   *
   * @return the color of the disabled text
   */
  getDisabledTextColor(): Color {
    return this.disabledTextColor;
  }
  /**
   * Returns the color of the focused {@code JRadioButton}.
   *
   * @return the color of the focused {@code JRadioButton}
   */
  getFocusColor(): Color {
    return this.focusColor;
  }
  paint(g: Graphics, c: JComponent): void {
    let b = c;
    let model = b.getModel();
    let size = c.getSize$();
    let w = size.width_;
    let h = size.height_;
    let f = c.getFont();
    g.setFont(f);
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(c, g, f);
    let viewRect = new Rectangle()._Rectangle$Dimension(size);
    let iconRect = new Rectangle()._Rectangle$();
    let textRect = new Rectangle()._Rectangle$();
    let i = c.getInsets$();
    viewRect.x_ = (viewRect.x_ + i.left) | 0;
    viewRect.y_ = (viewRect.y_ + i.top) | 0;
    viewRect.width_ = (viewRect.width_ - (i.right + viewRect.x_)) | 0;
    viewRect.height_ = (viewRect.height_ - (i.bottom + viewRect.y_)) | 0;
    let altIcon = b.getIcon();
    let selectedIcon = null;
    let disabledIcon = null;
    let text = SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(c, fm, b.getText(), altIcon != null ? altIcon : this.getDefaultIcon(), b.getVerticalAlignment(), b.getHorizontalAlignment(), b.getVerticalTextPosition(), b.getHorizontalTextPosition(), viewRect, iconRect, textRect, b.getIconTextGap());
    if (c.isOpaque()) {
      g.setColor(b.getBackground());
      g.fillRect(0, 0, size.width_, size.height_);
    }
    if (altIcon != null) {
      if (!model.isEnabled()) {
        if (model.isSelected()) {
          altIcon = b.getDisabledSelectedIcon();
        } else {
          altIcon = b.getDisabledIcon();
        }
      } else if (model.isPressed() && model.isArmed()) {
        altIcon = b.getPressedIcon();
        if (altIcon == null) {
          altIcon = b.getSelectedIcon();
        }
      } else if (model.isSelected()) {
        if (b.isRolloverEnabled() && model.isRollover()) {
          altIcon = b.getRolloverSelectedIcon();
          if (altIcon == null) {
            altIcon = b.getSelectedIcon();
          }
        } else {
          altIcon = b.getSelectedIcon();
        }
      } else if (b.isRolloverEnabled() && model.isRollover()) {
        altIcon = b.getRolloverIcon();
      }
      if (altIcon == null) {
        altIcon = b.getIcon();
      }
      altIcon.paintIcon(c, g, iconRect.x_, iconRect.y_);
    } else {
      this.getDefaultIcon().paintIcon(c, g, iconRect.x_, iconRect.y_);
    }
    if (text != null) {
      let v = c.getClientProperty(BasicHTML.propertyKey);
      if (v != null) {
        v.paint(g, textRect);
      } else {
        let mnemIndex = b.getDisplayedMnemonicIndex();
        if (model.isEnabled()) {
          g.setColor(b.getForeground());
        } else {
          g.setColor(this.getDisabledTextColor());
        }
        SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(c, g, text, mnemIndex, textRect.x_, (textRect.y_ + fm.getAscent()) | 0);
      }
      if (b.hasFocus() && b.isFocusPainted() && textRect.width_ > 0 && textRect.height_ > 0) {
        this.paintFocus$Graphics$Rectangle$Dimension(g, textRect, size);
      }
    }
  }
  paintFocus$Graphics$Rectangle$Dimension(g: Graphics, t: Rectangle, d: Dimension): void {
    g.setColor(this.getFocusColor());
    g.drawRect((t.x_ - 1) | 0, (t.y_ - 1) | 0, (t.width_ + 1) | 0, (t.height_ + 1) | 0);
  }
  static $clinit() {
    MetalRadioButtonUI.METAL_RADIO_BUTTON_UI_KEY = new JObject();
  }
}

$J.define(MetalRadioButtonUI, 'javax.swing.plaf.metal.MetalRadioButtonUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicRadioButtonUI', ctors: { '': '_MetalRadioButtonUI' }, meths: { 'paintFocus(java.awt.Graphics,java.awt.Rectangle,java.awt.Dimension)': 'paintFocus$Graphics$Rectangle$Dimension' }, clinit: true, lazy: ['METAL_RADIO_BUTTON_UI_KEY'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
